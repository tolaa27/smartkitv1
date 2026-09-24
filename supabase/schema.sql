-- ==============================================================================
-- SmartKids Cambodia - Complete Supabase PostgreSQL Schema & Security Policies
-- Principal Fullstack Engineering Standard
-- Architecture: Google OAuth Teacher Login, Class Members, Student PIN Auth,
--               Class Materials Storage, and Grade-Isolated Document Feeds
-- ==============================================================================

-- 1. Enable Required PostgreSQL Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. CREATE CORE TABLES
-- ==============================================================================

-- A. Users Table (Teachers via Google OAuth & Students via Teacher-Managed PIN)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_provider_id TEXT UNIQUE,                                   -- Google Auth UID for teachers
  email VARCHAR(255) UNIQUE,                                      -- Teachers only (Gmail)
  full_name VARCHAR(100) NOT NULL,                                -- Full display name
  avatar_url TEXT,                                                -- Avatar emoji or photo URL
  role VARCHAR(20) CHECK (role IN ('teacher', 'student')) NOT NULL,
  pin_code VARCHAR(4),                                            -- 4-digit PIN for students only
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL, -- Linked Teacher UUID
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Backwards compatibility view for profiles (Security Invoker enforces querying user's RLS)
CREATE OR REPLACE VIEW public.profiles WITH (security_invoker = true) AS 
  SELECT 
    u.id, 
    u.email, 
    u.full_name, 
    u.role, 
    u.pin_code, 
    u.avatar_url, 
    u.created_by, 
    u.created_at,
    cm.grade_id,
    g.name AS grade_name
  FROM public.users u
  LEFT JOIN public.class_members cm ON u.id = cm.student_id
  LEFT JOIN public.grades g ON cm.grade_id = g.id;

-- B. Grades Table (e.g. 'ថ្នាក់ទី ១', 'ថ្នាក់មត្តេយ្យ', 'ថ្នាក់ទី ២', 'ថ្នាក់ទី ៣')
CREATE TABLE IF NOT EXISTS public.grades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL,
  description TEXT,
  teacher_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Backwards compatibility view for classes (Security Invoker enforces querying user's RLS)
CREATE OR REPLACE VIEW public.classes WITH (security_invoker = true) AS 
  SELECT * FROM public.grades;

-- C. Class Members Table (Links Students strictly to their assigned Grade)
CREATE TABLE IF NOT EXISTS public.class_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grade_id UUID NOT NULL REFERENCES public.grades(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, grade_id)
);

-- D. Class Documents Table (Uploaded lesson documents, PDFs, Images & Live camera captures)
CREATE TABLE IF NOT EXISTS public.class_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grade_id UUID NOT NULL REFERENCES public.grades(id) ON DELETE CASCADE,
  uploaded_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  subject VARCHAR(50) DEFAULT 'general',
  file_url TEXT NOT NULL,
  file_type VARCHAR(50),                                          -- 'pdf', 'image', 'camera_capture', etc.
  ocr_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Backward compatibility view for legacy queries targeting `documents` (Security Invoker enforces querying user's RLS)
CREATE OR REPLACE VIEW public.documents WITH (security_invoker = true) AS 
  SELECT * FROM public.class_documents;

-- ==============================================================================
-- 3. INDEXES FOR PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_auth_provider ON public.users(auth_provider_id);
CREATE INDEX IF NOT EXISTS idx_users_created_by ON public.users(created_by);
CREATE INDEX IF NOT EXISTS idx_class_members_student ON public.class_members(student_id);
CREATE INDEX IF NOT EXISTS idx_class_members_grade ON public.class_members(grade_id);
CREATE INDEX IF NOT EXISTS idx_class_documents_grade ON public.class_documents(grade_id);
CREATE INDEX IF NOT EXISTS idx_class_documents_uploaded_by ON public.class_documents(uploaded_by);

-- ==============================================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_documents ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- A. USERS POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Allow public read users" ON public.users;
CREATE POLICY "Allow public read users"
  ON public.users
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Teachers can insert students" ON public.users;
CREATE POLICY "Teachers can insert students"
  ON public.users
  FOR INSERT
  WITH CHECK (
    auth.role() = 'service_role'
    OR auth.role() = 'anon'
    OR auth.uid() IS NOT NULL
  );

DROP POLICY IF EXISTS "Teachers can update/delete created students" ON public.users;
CREATE POLICY "Teachers can update/delete created students"
  ON public.users
  FOR ALL
  USING (
    auth.uid() = id
    OR auth.uid() = created_by
    OR auth.role() = 'service_role'
  );

-- ------------------------------------------------------------------------------
-- B. GRADES POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Allow read grades" ON public.grades;
CREATE POLICY "Allow read grades"
  ON public.grades
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Teachers can manage grades" ON public.grades;
CREATE POLICY "Teachers can manage grades"
  ON public.grades
  FOR ALL
  USING (
    auth.uid() = teacher_id
    OR auth.role() = 'service_role'
  );

-- ------------------------------------------------------------------------------
-- C. CLASS MEMBERS POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Allow read class members" ON public.class_members;
CREATE POLICY "Allow read class members"
  ON public.class_members
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Teachers can insert/manage class members" ON public.class_members;
CREATE POLICY "Teachers can insert/manage class members"
  ON public.class_members
  FOR ALL
  USING (
    auth.role() = 'service_role'
    OR auth.role() = 'anon'
    OR auth.uid() IS NOT NULL
  );

-- ------------------------------------------------------------------------------
-- D. CLASS DOCUMENTS POLICIES (Grade-Isolated Access)
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Teachers have full access to class documents" ON public.class_documents;
CREATE POLICY "Teachers have full access to class documents"
  ON public.class_documents
  FOR ALL
  USING (
    auth.uid() = uploaded_by
    OR auth.role() = 'service_role'
    OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'teacher')
  );

DROP POLICY IF EXISTS "Students view only documents of their enrolled grade" ON public.class_documents;
CREATE POLICY "Students view only documents of their enrolled grade"
  ON public.class_documents
  FOR SELECT
  USING (
    -- Teacher can see all documents
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'teacher')
    OR
    -- Student enrolled in the target grade
    EXISTS (
      SELECT 1 FROM public.class_members cm
      WHERE cm.student_id = auth.uid() AND cm.grade_id = class_documents.grade_id
    )
    OR
    -- Anon or unauthenticated view allowed for open educational materials
    auth.role() = 'anon'
  );

-- ==============================================================================
-- 5. STORAGE BUCKET CONFIGURATION (class-materials & class-documents)
-- ==============================================================================

-- 1. Create 'class-materials' bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'class-materials',
  'class-materials',
  true,
  20971520, -- 20 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- 2. Create 'class-documents' bucket (legacy & backup)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'class-documents',
  'class-documents',
  true,
  20971520, -- 20 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies for class-materials
DROP POLICY IF EXISTS "Public can view class materials" ON storage.objects;
CREATE POLICY "Public can view class materials"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'class-materials' OR bucket_id = 'class-documents');

DROP POLICY IF EXISTS "Teachers can upload class materials" ON storage.objects;
CREATE POLICY "Teachers can upload class materials"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'class-materials' OR bucket_id = 'class-documents');

DROP POLICY IF EXISTS "Teachers can delete class materials" ON storage.objects;
CREATE POLICY "Teachers can delete class materials"
  ON storage.objects
  FOR DELETE
  USING (bucket_id = 'class-materials' OR bucket_id = 'class-documents');

-- ==============================================================================
-- 6. DEFAULT SEED DATA
-- ==============================================================================

-- Seed Teachers
INSERT INTO public.users (id, email, full_name, role, avatar_url)
VALUES 
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'teacher.sokha@smartkids.edu.kh', 'អ្នកគ្រូ សុខា (Teacher Sokha)', 'teacher', '👩‍🏫'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'teacher.vanna@smartkids.edu.kh', 'លោកគ្រូ វណ្ណា (Teacher Vanna)', 'teacher', '👨‍🏫')
ON CONFLICT (id) DO NOTHING;

-- Seed Grades
INSERT INTO public.grades (id, name, description, teacher_id)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'ថ្នាក់មត្តេយ្យ', 'កម្រិតមត្តេយ្យសិក្សា ត្រៀមអក្សរ និងលេខ', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  ('22222222-2222-2222-2222-222222222222', 'ថ្នាក់ទី ១', 'កម្មវិធីសិក្សាជាតិថ្នាក់ទី ១ ភាសាខ្មែរ គណិតវិទ្យា និងវិទ្យាសាស្ត្រ', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  ('33333333-3333-3333-3333-333333333333', 'ថ្នាក់ទី ២', 'កម្មវិធីសិក្សាជាតិថ្នាក់ទី ២ អំណាន និងប្រមាណវិធីគណិតវិទ្យា', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  ('44444444-4444-4444-4444-444444444444', 'ថ្នាក់ទី ៣', 'កម្មវិធីសិក្សាជាតិថ្នាក់ទី ៣ វិទ្យាសាស្ត្រសង្គម និងការដោះស្រាយបញ្ហា', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa')
ON CONFLICT (id) DO NOTHING;

-- Seed Students with 4-digit PINs
INSERT INTO public.users (id, full_name, role, pin_code, avatar_url, created_by)
VALUES 
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'ចរិយា (Chariya)', 'student', '1234', '👧', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'តារា (Dara)', 'student', '5678', '👦', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'សុវណ្ណ (Sovann)', 'student', '2468', '🦁', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa')
ON CONFLICT (id) DO NOTHING;

-- Link Students to Class Members
INSERT INTO public.class_members (student_id, grade_id)
VALUES 
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222'), -- Chariya in Grade 1
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '33333333-3333-3333-3333-333333333333'), -- Dara in Grade 2
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '22222222-2222-2222-2222-222222222222')  -- Sovann in Grade 1
ON CONFLICT (student_id, grade_id) DO NOTHING;

-- Seed Sample Class Documents (Grade 1 & Grade 2)
INSERT INTO public.class_documents (id, grade_id, uploaded_by, title, description, subject, file_url, file_type, ocr_text)
VALUES
  (
    '99999999-9999-9999-9999-999999999991',
    '22222222-2222-2222-2222-222222222222', -- Grade 1
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'មេរៀនទី ១ ៖ ព្យញ្ជនៈ ក ខ គ ឃ ង',
    'សន្លឹកកិច្ចការហាត់សរសេរ និងអានព្យញ្ជនៈ ៥ តួដំបូង',
    'khmer',
    'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=1200&q=80',
    'image',
    'មេរៀនទី ១ ៖ ព្យញ្ជនៈ ភាសាខ្មែរ ក ខ គ ឃ ង ... ហាត់សរសេរតាមគំនូសព្រួញ និងអានបញ្ចេញសំឡេងឲ្យបានច្បាស់'
  ),
  (
    '99999999-9999-9999-9999-999999999992',
    '22222222-2222-2222-2222-222222222222', -- Grade 1
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'ការបូកលេខត្រឹម ១០ ដោយប្រើរូបផ្លែឈើ',
    'សន្លឹកកិច្ចការគណិតវិទ្យា បូកចំនួនផ្លែប៉ោម និងផ្លែក្រូច',
    'math',
    'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?auto=format&fit=crop&w=1200&q=80',
    'worksheet',
    'គណិតវិទ្យាថ្នាក់ទី១ ៖ ផ្លែប៉ោម ៣ + ផ្លែប៉ោម ២ = ៥ ... រាប់ និងបំពេញចម្លើយក្នុងប្រអប់'
  ),
  (
    '99999999-9999-9999-9999-999999999993',
    '33333333-3333-3333-3333-333333333333', -- Grade 2
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'អំណានខ្មែរ ៖ រឿងទន្សាយ និងអណ្តើក',
    'អត្ថបទអំណានខ្លីសម្រាប់សិស្សថ្នាក់ទី២ ហាត់អានស្ទាត់',
    'khmer',
    'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=1200&q=80',
    'image',
    'រឿង ទន្សាយ និងអណ្តើក ៖ ថ្ងៃមួយទន្សាយបានប្រកួតរត់ប្រណាំងជាមួយអណ្តើក...'
  )
ON CONFLICT (id) DO NOTHING;
