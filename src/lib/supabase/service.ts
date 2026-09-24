// src/lib/supabase/service.ts
// Unified SmartKids Supabase Data Service with High-Fidelity Local Fallback

import { createClient, isSupabaseConfigured } from './client';
import {
  Grade,
  Document,
  Profile,
  CreateGradeInput,
  CreateDocumentInput,
  CreateStudentInput,
  DocumentSubject,
} from './types';

// Default Seed Grades (Matching MoEYS primary curriculum)
const DEFAULT_GRADES: Grade[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'ថ្នាក់មត្តេយ្យ (Preschool)',
    description: 'កម្រិតមត្តេយ្យសិក្សា ត្រៀមអក្សរ និងលេខ',
    teacher_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    created_at: new Date().toISOString(),
    student_count: 18,
    document_count: 2,
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    name: 'ថ្នាក់ទី១ (Grade 1)',
    description: 'កម្មវិធីសិក្សាជាតិថ្នាក់ទី១ ភាសាខ្មែរ គណិតវិទ្យា និងវិទ្យាសាស្ត្រ',
    teacher_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    created_at: new Date().toISOString(),
    student_count: 24,
    document_count: 4,
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    name: 'ថ្នាក់ទី២ (Grade 2)',
    description: 'កម្មវិធីសិក្សាជាតិថ្នាក់ទី២ អំណាន និងប្រមាណវិធីគណិតវិទ្យា',
    teacher_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    created_at: new Date().toISOString(),
    student_count: 22,
    document_count: 3,
  },
  {
    id: '44444444-4444-4444-4444-444444444444',
    name: 'ថ្នាក់ទី៣ (Grade 3)',
    description: 'កម្មវិធីសិក្សាជាតិថ្នាក់ទី៣ វិទ្យាសាស្ត្រសង្គម និងការដោះស្រាយបញ្ហា',
    teacher_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    created_at: new Date().toISOString(),
    student_count: 20,
    document_count: 2,
  },
];

// Default Seed Profiles
const DEFAULT_PROFILES: Profile[] = [
  {
    id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    full_name: 'អ្នកគ្រូ សុខា (Teacher Sokha)',
    role: 'teacher',
    avatar_url: '👩‍🏫',
    created_at: new Date().toISOString(),
  },
  {
    id: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
    full_name: 'លោកគ្រូ វណ្ណា (Teacher Vanna)',
    role: 'teacher',
    avatar_url: '👨‍🏫',
    created_at: new Date().toISOString(),
  },
  {
    id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    full_name: 'ចរិយា (Chariya)',
    role: 'student',
    pin_code: '1234',
    avatar_url: '👧',
    grade_id: '22222222-2222-2222-2222-222222222222', // Grade 1
    created_by: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    grade_name: 'ថ្នាក់ទី១ (Grade 1)',
    created_at: new Date().toISOString(),
  },
  {
    id: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
    full_name: 'តារា (Dara)',
    role: 'student',
    pin_code: '5678',
    avatar_url: '👦',
    grade_id: '33333333-3333-3333-3333-333333333333', // Grade 2
    created_by: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    grade_name: 'ថ្នាក់ទី២ (Grade 2)',
    created_at: new Date().toISOString(),
  },
  {
    id: '99999999-9999-9999-9999-999999999999',
    full_name: 'វិបុល (Vibol)',
    role: 'student',
    pin_code: '2468',
    avatar_url: '🧒',
    grade_id: '22222222-2222-2222-2222-222222222222', // Grade 1
    created_by: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    grade_name: 'ថ្នាក់ទី១ (Grade 1)',
    created_at: new Date().toISOString(),
  },
  {
    id: '88888888-8888-8888-8888-888888888888',
    full_name: 'សុភាព (Sopheap)',
    role: 'student',
    pin_code: '1357',
    avatar_url: '👧',
    grade_id: '11111111-1111-1111-1111-111111111111', // Preschool
    created_by: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    grade_name: 'ថ្នាក់មត្តេយ្យ (Preschool)',
    created_at: new Date().toISOString(),
  },
];

// Default Seed Documents
const DEFAULT_DOCUMENTS: Document[] = [
  {
    id: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
    grade_id: '22222222-2222-2222-2222-222222222222', // Grade 1
    uploaded_by: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    title: 'មេរៀនស្រះនិស្ស័យខ្មែរ (២៣ តួ)',
    description: 'សន្លឹកកិច្ចការអាន និងសរសេរស្រះនិស្ស័យ ា ិ ី ឹ ឺ ុ ូ',
    subject: 'khmer',
    file_url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1200&q=80',
    file_type: 'image',
    ocr_text: 'ស្រះនិស្ស័យខ្មែរមាន ២៣ តួ ៖ ា ិ ី ឹ ឺ ុ ូ ួ ើ ឿ ៀ េ ែ ៃ ោ ៅ ុំ ំ ាំ ះ ុះ េះ ោះ ។ កូនសិស្សត្រូវគូសបន្ទាត់ភ្ជាប់ពាក្យ និងរូបភាព។',
    grade_name: 'ថ្នាក់ទី១ (Grade 1)',
    uploader_name: 'អ្នកគ្រូ សុខា',
    created_at: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
  },
  {
    id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
    grade_id: '22222222-2222-2222-2222-222222222222', // Grade 1
    uploaded_by: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    title: 'លំហាត់បូកដកលេខក្នុងរង្វង់ ២០',
    description: 'សន្លឹកលំហាត់គណិតវិទ្យារូបភាពផ្លែឈើ ៥ + ៣ = ៨',
    subject: 'math',
    file_url: 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?auto=format&fit=crop&w=1200&q=80',
    file_type: 'worksheet',
    ocr_text: 'គណិតវិទ្យាថ្នាក់ទី១ ៖ ប្រមាណវិធីបូកលេខ។ រាប់ផ្លែស្វាយ ៥ ផ្លែ បន្ថែម ៣ ផ្លែទៀត តើសរុបទាំងអស់មានប៉ុន្មានផ្លែ? ចម្លើយ ៖ ៥ + ៣ = ៨',
    grade_name: 'ថ្នាក់ទី១ (Grade 1)',
    uploader_name: 'អ្នកគ្រូ សុខា',
    created_at: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
  },
  {
    id: 'ffffffff-ffff-ffff-ffff-ffffffffffff',
    grade_id: '22222222-2222-2222-2222-222222222222', // Grade 1
    uploaded_by: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    title: 'វដ្តជីវិតរបស់រុក្ខជាតិ (ការដុះពន្លក)',
    description: 'មេរៀនវិទ្យាសាស្ត្រសង្កេតគ្រាប់សណ្តែកដុះពន្លក',
    subject: 'science',
    file_url: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&w=1200&q=80',
    file_type: 'camera_capture',
    ocr_text: 'វិទ្យាសាស្ត្រថ្នាក់ទី១ ៖ គ្រាប់ពូជត្រូវការដី ទឹក ពន្លឺព្រះអាទិត្យ និងខ្យល់ដើម្បីលូតលាស់ជារុក្ខជាតិធំ។ ១. គ្រាប់ពូជ ២. ពន្លក ៣. កូនរុក្ខជាតិ ៤. ផ្កាផ្លែ',
    grade_name: 'ថ្នាក់ទី១ (Grade 1)',
    uploader_name: 'អ្នកគ្រូ សុខា',
    created_at: new Date(Date.now() - 3600000 * 24 * 4).toISOString(),
  },
  {
    id: '10101010-1010-1010-1010-101010101010',
    grade_id: '33333333-3333-3333-3333-333333333333', // Grade 2
    uploaded_by: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    title: 'អំណានអត្ថបទ ៖ ភូមិឋានរបស់ខ្ញុំ',
    description: 'អត្ថបទអំណានភាសាខ្មែរថ្នាក់ទី២ និងលំហាត់សួរឆ្លើយ',
    subject: 'khmer',
    file_url: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=1200&q=80',
    file_type: 'pdf',
    ocr_text: 'ភូមិរបស់ខ្ញុំមានដើមត្នោត ស្រែស្រូវ និងវាលស្មៅខៀវស្រងាត់។ ពេលព្រឹកព្រលឹម សត្វបក្សាបក្សីយំឆ្លើយឆ្លងគ្នាគួរជាទីគយគន់។',
    grade_name: 'ថ្នាក់ទី២ (Grade 2)',
    uploader_name: 'អ្នកគ្រូ សុខា',
    created_at: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
  },
  {
    id: '20202020-2020-2020-2020-202020202020',
    grade_id: '11111111-1111-1111-1111-111111111111', // Preschool
    uploaded_by: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    title: 'ការរាប់លេខ ១ ដល់ ១០ និងរូបសត្វ',
    description: 'កម្រងរូបភាពរាប់ចំនួនកូនដំរី កូនទា និងកូនឆ្មា',
    subject: 'math',
    file_url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80',
    file_type: 'image',
    ocr_text: 'មត្តេយ្យសិក្សា ៖ រាប់ចំនួនសត្វ ១ ដំរីមួយ ២ ទាពីរ ៣ ឆ្មាបី... រៀនចំណាំតួលេខខ្មែរ ១ ២ ៣ ៤ ៥',
    grade_name: 'ថ្នាក់មត្តេយ្យ (Preschool)',
    uploader_name: 'អ្នកគ្រូ សុខា',
    created_at: new Date(Date.now() - 3600000 * 24 * 1).toISOString(),
  },
];

// Helper: LocalStorage state persistence keys
const STORAGE_KEYS = {
  GRADES: 'smartkids_db_grades',
  DOCUMENTS: 'smartkids_db_documents',
  PROFILES: 'smartkids_db_profiles',
};

// In-memory fallback cache for Node.js / API route environments when Supabase is not connected
const inMemoryStore = new Map<string, any>();

function getLocalData<T>(key: string, defaultData: T): T {
  if (typeof window === 'undefined') {
    if (!inMemoryStore.has(key)) {
      inMemoryStore.set(key, JSON.parse(JSON.stringify(defaultData)));
    }
    return inMemoryStore.get(key);
  }
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(defaultData));
      return defaultData;
    }
    return JSON.parse(raw);
  } catch {
    return defaultData;
  }
}

function setLocalData<T>(key: string, data: T): void {
  if (typeof window === 'undefined') {
    inMemoryStore.set(key, data);
    return;
  }
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.warn(`[SupabaseService] Failed to cache data to localStorage (${key}):`, err);
  }
}

export const SupabaseService = {
  // --------------------------------------------------------------------------
  // 1. GRADES MANAGEMENT
  // --------------------------------------------------------------------------
  async getGrades(): Promise<Grade[]> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('grades')
          .select('*')
          .order('name', { ascending: true });

        if (!error && data && data.length > 0) {
          return data as Grade[];
        }
      } catch (err) {
        console.warn('[SupabaseService] Error fetching grades from Supabase, falling back to local:', err);
      }
    }

    return getLocalData<Grade[]>(STORAGE_KEYS.GRADES, DEFAULT_GRADES);
  },

  async createGrade(input: CreateGradeInput): Promise<Grade> {
    const newGrade: Grade = {
      id: crypto.randomUUID ? crypto.randomUUID() : `grade-${Date.now()}`,
      name: input.name,
      description: input.description || null,
      teacher_id: input.teacher_id || 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      created_at: new Date().toISOString(),
      student_count: 0,
      document_count: 0,
    };

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('grades')
          .insert({
            name: input.name,
            description: input.description || null,
            teacher_id: input.teacher_id || null,
          } as any)
          .select()
          .single();

        if (!error && data) {
          return data as Grade;
        }
      } catch (err) {
        console.warn('[SupabaseService] Error inserting grade into Supabase, saving locally:', err);
      }
    }

    // Local Fallback
    const current = getLocalData<Grade[]>(STORAGE_KEYS.GRADES, DEFAULT_GRADES);
    const updated = [newGrade, ...current];
    setLocalData(STORAGE_KEYS.GRADES, updated);
    return newGrade;
  },

  async updateGrade(id: string, updates: Partial<Grade>): Promise<Grade | null> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data, error } = await (supabase.from('grades') as any)
          .update(updates)
          .eq('id', id)
          .select()
          .single();

        if (!error && data) return data as Grade;
      } catch (err) {
        console.warn('[SupabaseService] Error updating grade in Supabase:', err);
      }
    }

    const current = getLocalData<Grade[]>(STORAGE_KEYS.GRADES, DEFAULT_GRADES);
    const index = current.findIndex(g => g.id === id);
    if (index === -1) return null;
    current[index] = { ...current[index], ...updates };
    setLocalData(STORAGE_KEYS.GRADES, current);
    return current[index];
  },

  async deleteGrade(id: string): Promise<boolean> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { error } = await supabase.from('grades').delete().eq('id', id);
        if (!error) return true;
      } catch (err) {
        console.warn('[SupabaseService] Error deleting grade from Supabase:', err);
      }
    }

    const current = getLocalData<Grade[]>(STORAGE_KEYS.GRADES, DEFAULT_GRADES);
    const filtered = current.filter(g => g.id !== id);
    setLocalData(STORAGE_KEYS.GRADES, filtered);
    return true;
  },

  // --------------------------------------------------------------------------
  // 2. DOCUMENTS & WORKSHETS MANAGEMENT
  // --------------------------------------------------------------------------
  async getDocuments(gradeId?: string, subject?: DocumentSubject | 'all'): Promise<Document[]> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        let query = (supabase.from('class_documents') as any).select('*');

        if (gradeId) {
          query = query.eq('grade_id', gradeId);
        }
        if (subject && subject !== 'all') {
          query = query.eq('subject', subject);
        }

        let { data, error } = await query.order('created_at', { ascending: false });

        if (error || !data || data.length === 0) {
          // Fallback to legacy documents table/view
          let fallbackQuery = (supabase.from('documents') as any).select('*');
          if (gradeId) fallbackQuery = fallbackQuery.eq('grade_id', gradeId);
          if (subject && subject !== 'all') fallbackQuery = fallbackQuery.eq('subject', subject);
          const fb = await fallbackQuery.order('created_at', { ascending: false });
          if (!fb.error && fb.data && fb.data.length > 0) {
            data = fb.data;
            error = null;
          }
        }

        if (!error && data && data.length > 0) {
          return data as Document[];
        }
      } catch (err) {
        console.warn('[SupabaseService] Error fetching documents from Supabase, falling back to local:', err);
      }
    }

    // Local Fallback with filtering
    let docs = getLocalData<Document[]>(STORAGE_KEYS.DOCUMENTS, DEFAULT_DOCUMENTS);
    if (gradeId) {
      docs = docs.filter(d => d.grade_id === gradeId);
    }
    if (subject && subject !== 'all') {
      docs = docs.filter(d => d.subject === subject);
    }
    return docs;
  },

  /**
   * Uploads file to Supabase Storage bucket 'class-documents'
   * Falls back to Base64/Blob URL if Supabase is unconfigured or in offline mode
   */
  async uploadDocumentFile(file: File | Blob, customFileName?: string): Promise<string> {
    const fileName = customFileName || `${Date.now()}-${(file as File).name || 'capture.png'}`;
    const cleanFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        let targetBucket = 'class-materials';
        let { error: uploadError } = await supabase.storage
          .from(targetBucket)
          .upload(cleanFileName, file, {
            cacheControl: '3600',
            upsert: true,
          });

        if (uploadError) {
          targetBucket = 'class-documents';
          const retry = await supabase.storage
            .from(targetBucket)
            .upload(cleanFileName, file, {
              cacheControl: '3600',
              upsert: true,
            });
          uploadError = retry.error;
        }

        if (!uploadError) {
          const { data } = supabase.storage
            .from(targetBucket)
            .getPublicUrl(cleanFileName);

          if (data?.publicUrl) {
            return data.publicUrl;
          }
        } else {
          console.warn('[SupabaseService] Storage upload failed, creating local object URL:', uploadError);
        }
      } catch (err) {
        console.warn('[SupabaseService] Error during Supabase storage upload:', err);
      }
    }

    // High fidelity fallback: Convert file to Base64 data URL for instant rendering & offline persistence
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.readAsDataURL(file);
    });
  },

  async createDocument(input: CreateDocumentInput): Promise<Document> {
    const grades = await this.getGrades();
    const targetGrade = grades.find(g => g.id === input.grade_id);

    const newDoc: Document = {
      id: crypto.randomUUID ? crypto.randomUUID() : `doc-${Date.now()}`,
      grade_id: input.grade_id,
      uploaded_by: input.uploaded_by,
      title: input.title,
      description: input.description || null,
      subject: input.subject,
      file_url: input.file_url,
      file_type: input.file_type,
      ocr_text: input.ocr_text || null,
      grade_name: targetGrade?.name || 'ថ្នាក់ទូទៅ',
      uploader_name: 'អ្នកគ្រូ សុខា',
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        let { data, error } = await (supabase.from('class_documents') as any)
          .insert({
            id: newDoc.id,
            grade_id: input.grade_id,
            uploaded_by: input.uploaded_by,
            title: input.title,
            description: input.description || null,
            subject: input.subject || 'general',
            file_url: input.file_url,
            file_type: input.file_type,
            ocr_text: input.ocr_text || null,
          })
          .select()
          .single();

        if (error) {
          const retry = await (supabase.from('documents') as any)
            .insert({
              id: newDoc.id,
              grade_id: input.grade_id,
              uploaded_by: input.uploaded_by,
              title: input.title,
              description: input.description || null,
              subject: input.subject || 'general',
              file_url: input.file_url,
              file_type: input.file_type,
              ocr_text: input.ocr_text || null,
            })
            .select()
            .single();
          data = retry.data;
          error = retry.error;
        }

        if (!error && data) {
          const docData = data as Record<string, any>;
          return {
            ...docData,
            grade_name: targetGrade?.name,
          } as Document;
        }
      } catch (err) {
        console.warn('[SupabaseService] Error inserting document into Supabase:', err);
      }
    }

    // Local Fallback
    const current = getLocalData<Document[]>(STORAGE_KEYS.DOCUMENTS, DEFAULT_DOCUMENTS);
    const updated = [newDoc, ...current];
    setLocalData(STORAGE_KEYS.DOCUMENTS, updated);
    return newDoc;
  },

  async deleteDocument(id: string): Promise<boolean> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { error } = await supabase.from('documents').delete().eq('id', id);
        if (!error) return true;
      } catch (err) {
        console.warn('[SupabaseService] Error deleting document from Supabase:', err);
      }
    }

    const current = getLocalData<Document[]>(STORAGE_KEYS.DOCUMENTS, DEFAULT_DOCUMENTS);
    const filtered = current.filter(d => d.id !== id);
    setLocalData(STORAGE_KEYS.DOCUMENTS, filtered);
    return true;
  },

  // --------------------------------------------------------------------------
  // 3. TEACHER & STUDENT MANAGEMENT
  // --------------------------------------------------------------------------
  async getTeachers(): Promise<Profile[]> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data, error } = await (supabase.from('profiles') as any)
          .select('*')
          .eq('role', 'teacher')
          .order('full_name', { ascending: true });

        if (!error && data && data.length > 0) {
          return data as Profile[];
        }
      } catch (err) {
        console.warn('[SupabaseService] Error fetching teachers from Supabase:', err);
      }
    }

    const profiles = getLocalData<Profile[]>(STORAGE_KEYS.PROFILES, DEFAULT_PROFILES);
    return profiles.filter((p) => p.role === 'teacher');
  },

  async getTeacherByIdOrCode(query: string): Promise<Profile | null> {
    const teachers = await this.getTeachers();
    const clean = query.trim().toLowerCase();
    if (!clean) return null;
    return (
      teachers.find(
        (t) =>
          t.id.toLowerCase() === clean ||
          t.id.slice(0, 8).toLowerCase() === clean ||
          t.full_name.toLowerCase().includes(clean)
      ) || null
    );
  },

  async getStudents(gradeId?: string): Promise<Profile[]> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        let query = (supabase.from('profiles') as any)
          .select('*, grades:grade_id(name)')
          .eq('role', 'student');

        if (gradeId) {
          query = query.eq('grade_id', gradeId);
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          return data.map((item: any) => ({
            ...item,
            grade_name: item.grades?.name || undefined,
          })) as Profile[];
        }
      } catch (err) {
        console.warn('[SupabaseService] Error fetching students from Supabase:', err);
      }
    }

    const profiles = getLocalData<Profile[]>(STORAGE_KEYS.PROFILES, DEFAULT_PROFILES);
    const students = profiles.filter(p => p.role === 'student');
    if (gradeId) {
      return students.filter(s => s.grade_id === gradeId);
    }
    return students;
  },

  async createStudentAccount(input: CreateStudentInput): Promise<Profile> {
    const grades = await this.getGrades();
    const targetGrade = grades.find(g => g.id === input.grade_id);

    const newStudent: Profile = {
      id: crypto.randomUUID ? crypto.randomUUID() : `student-${Date.now()}`,
      full_name: input.full_name.trim(),
      role: 'student',
      pin_code: input.pin_code.trim(),
      avatar_url: input.avatar_url || '🎒',
      grade_id: input.grade_id,
      created_by: input.created_by || 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      grade_name: targetGrade?.name,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data, error } = await (supabase.from('profiles') as any)
          .insert({
            id: newStudent.id,
            full_name: newStudent.full_name,
            role: 'student',
            pin_code: newStudent.pin_code,
            avatar_url: newStudent.avatar_url,
            grade_id: newStudent.grade_id,
            created_by: newStudent.created_by,
          })
          .select()
          .single();

        if (!error && data) {
          return {
            ...(data as any),
            grade_name: targetGrade?.name,
          } as Profile;
        }
      } catch (err) {
        console.warn('[SupabaseService] Error inserting student into Supabase:', err);
      }
    }

    // Local Fallback
    const current = getLocalData<Profile[]>(STORAGE_KEYS.PROFILES, DEFAULT_PROFILES);
    const updated = [newStudent, ...current];
    setLocalData(STORAGE_KEYS.PROFILES, updated);
    return newStudent;
  },

  async deleteStudentAccount(id: string): Promise<boolean> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { error } = await (supabase.from('profiles') as any).delete().eq('id', id);
        if (!error) return true;
      } catch (err) {
        console.warn('[SupabaseService] Error deleting student from Supabase:', err);
      }
    }

    const current = getLocalData<Profile[]>(STORAGE_KEYS.PROFILES, DEFAULT_PROFILES);
    const filtered = current.filter(p => p.id !== id);
    setLocalData(STORAGE_KEYS.PROFILES, filtered);
    return true;
  },

  async verifyStudentPinWithId(studentId: string, pin: string): Promise<Profile | null> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data, error } = await (supabase.from('profiles') as any)
          .select('*, grades:grade_id(name)')
          .eq('id', studentId)
          .eq('role', 'student')
          .eq('pin_code', pin)
          .single();

        if (!error && data) {
          return {
            ...data,
            grade_name: data.grades?.name || undefined,
          } as Profile;
        }
      } catch (err) {
        console.warn('[SupabaseService] Error verifying PIN in Supabase:', err);
      }
    }

    const profiles = getLocalData<Profile[]>(STORAGE_KEYS.PROFILES, DEFAULT_PROFILES);
    const matched = profiles.find(p => p.id === studentId && p.role === 'student' && p.pin_code === pin);
    if (matched) return matched;

    // Demo bypass for test ids or 1234
    if (pin === '1234') {
      const anyMatch = profiles.find(p => p.id === studentId && p.role === 'student');
      if (anyMatch) return anyMatch;
    }

    return null;
  },

  // --------------------------------------------------------------------------
  // 4. AUTH & PROFILES
  // --------------------------------------------------------------------------
  async verifyStudentPin(pin: string): Promise<Profile | null> {
    const profiles = getLocalData<Profile[]>(STORAGE_KEYS.PROFILES, DEFAULT_PROFILES);
    const matched = profiles.find(p => p.role === 'student' && p.pin_code === pin);
    if (matched) return matched;

    // Fallback: If 4 digits entered, create or return demo profile
    if (pin.length === 4) {
      return {
        id: `student-pin-${pin}`,
        full_name: `សិស្ស (PIN: ${pin})`,
        role: 'student',
        pin_code: pin,
        avatar_url: '🎒',
        grade_id: '22222222-2222-2222-2222-222222222222', // Grade 1
        created_at: new Date().toISOString(),
      };
    }
    return null;
  },

  async getProfiles(): Promise<Profile[]> {
    return getLocalData<Profile[]>(STORAGE_KEYS.PROFILES, DEFAULT_PROFILES);
  },

  async signInWithGoogle(): Promise<{ error: Error | null }> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const origin = typeof window !== 'undefined' ? window.location.origin : '';
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${origin}/auth/callback?next=/teacher/dashboard`,
            queryParams: {
              access_type: 'offline',
              prompt: 'consent',
            },
          },
        });
        return { error };
      } catch (err) {
        return { error: err as Error };
      }
    }
    // Simulation
    return { error: null };
  },
};
