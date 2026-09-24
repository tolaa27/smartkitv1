// src/lib/supabase/types.ts
// Supabase Database Types for SmartKids Cambodia

export type UserRole = 'teacher' | 'student';

export type DocumentSubject = 'khmer' | 'math' | 'science';

export type DocumentFileType = 'pdf' | 'image' | 'worksheet' | 'camera_capture';

export interface User {
  id: string;
  auth_provider_id?: string | null; // Google Auth UID for teachers
  email?: string | null;
  full_name: string;
  role: UserRole;
  pin_code?: string | null;
  avatar_url?: string | null;
  created_by?: string | null; // Teacher who created this student
  created_at: string;
  // UI join fields
  grade_id?: string | null;
  grade_name?: string;
}

// Backwards compatibility alias
export type Profile = User;
export type ClassDocument = Document;

export interface Grade {
  id: string;
  name: string;
  description?: string | null;
  teacher_id?: string | null;
  created_at: string;
  // Computed / UI fields
  student_count?: number;
  document_count?: number;
}

export interface ClassMember {
  id: string;
  student_id: string;
  grade_id: string;
  created_at: string;
  // UI join fields
  student_name?: string;
  grade_name?: string;
}

export interface Document {
  id: string;
  grade_id: string;
  uploaded_by: string;
  title: string;
  description?: string | null;
  subject: DocumentSubject;
  file_url: string;
  file_type: DocumentFileType;
  ocr_text?: string | null;
  created_at: string;
  // Join fields for UI
  grade_name?: string;
  uploader_name?: string;
}

export interface CreateDocumentInput {
  grade_id: string;
  uploaded_by: string;
  title: string;
  description?: string;
  subject: DocumentSubject;
  file_url: string;
  file_type: DocumentFileType;
  ocr_text?: string;
}

export interface CreateGradeInput {
  name: string;
  description?: string;
  teacher_id?: string;
}

export interface CreateStudentInput {
  full_name: string;
  grade_id: string;
  pin_code: string;
  avatar_url?: string;
  created_by?: string;
}

export interface Database {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: Omit<User, 'created_at'> & { created_at?: string };
        Update: Partial<Omit<User, 'id' | 'created_at'>>;
      };
      profiles: {
        Row: User;
        Insert: Omit<User, 'created_at'> & { created_at?: string };
        Update: Partial<Omit<User, 'id' | 'created_at'>>;
      };
      grades: {
        Row: Grade;
        Insert: Omit<Grade, 'id' | 'created_at' | 'student_count' | 'document_count'> & { id?: string; created_at?: string };
        Update: Partial<Omit<Grade, 'id' | 'created_at'>>;
      };
      class_members: {
        Row: ClassMember;
        Insert: Omit<ClassMember, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Omit<ClassMember, 'id' | 'created_at'>>;
      };
      documents: {
        Row: Document;
        Insert: Omit<Document, 'id' | 'created_at' | 'grade_name' | 'uploader_name'> & { id?: string; created_at?: string };
        Update: Partial<Omit<Document, 'id' | 'created_at'>>;
      };
      class_documents: {
        Row: Document;
        Insert: Omit<Document, 'id' | 'created_at' | 'grade_name' | 'uploader_name'> & { id?: string; created_at?: string };
        Update: Partial<Omit<Document, 'id' | 'created_at'>>;
      };
    };
  };
}
