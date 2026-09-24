// src/app/actions/teacherActions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { SupabaseService } from '@/lib/supabase/service';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { CreateStudentInput, CreateDocumentInput, User, Document } from '@/lib/supabase/types';
import { getBaseUrl } from '@/lib/utils/url';

/**
 * Server Action: Create Student Account & link to Class Members
 *
 * 1. Inserts student into `users` table with role='student', full_name, pin_code, created_by
 * 2. Links student to the selected grade_id in `class_members` table
 */
export async function createStudentAccountAction(input: CreateStudentInput): Promise<{
  success: boolean;
  student?: User;
  error?: string;
}> {
  try {
    const { full_name, grade_id, pin_code, avatar_url, created_by } = input;

    // 1. Validation
    if (!full_name || !full_name.trim()) {
      return { success: false, error: 'សូមបញ្ចូលឈ្មោះសិស្ស (Student name is required)' };
    }

    if (!grade_id) {
      return { success: false, error: 'សូមជ្រើសរើសកម្រិតថ្នាក់ (Grade is required)' };
    }

    if (!pin_code || !/^\d{4}$/.test(pin_code.trim())) {
      return { success: false, error: 'លេខសម្ងាត់ PIN ត្រូវតែមាន ៤ ខ្ទង់ (PIN must be 4 digits)' };
    }

    const studentId = crypto.randomUUID ? crypto.randomUUID() : `student-${Date.now()}`;
    const cleanPin = pin_code.trim();
    const teacherId = created_by || 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

    if (isSupabaseConfigured()) {
      const supabase = await createServerSupabaseClient();

      // Step A: Insert into users table
      const { data: userData, error: userError } = await (supabase.from('users') as any)
        .insert({
          id: studentId,
          full_name: full_name.trim(),
          role: 'student',
          pin_code: cleanPin,
          avatar_url: avatar_url || '🎒',
          created_by: teacherId,
        })
        .select()
        .single();

      if (userError) {
        console.error('[createStudentAccountAction] Insert user error:', userError);
        return { success: false, error: userError.message };
      }

      // Step B: Link to class_members table
      const { error: memberError } = await (supabase.from('class_members') as any).insert({
        student_id: studentId,
        grade_id: grade_id,
      });

      if (memberError) {
        console.warn('[createStudentAccountAction] Class member insert error:', memberError);
      }

      revalidatePath('/teacher');
      revalidatePath('/teacher/dashboard');
      revalidatePath('/login/student');

      return {
        success: true,
        student: {
          ...userData,
          grade_id,
        },
      };
    }

    // High-fidelity local fallback (in-memory / local persistence)
    const localStudent = await SupabaseService.createStudentAccount({
      full_name: full_name.trim(),
      grade_id,
      pin_code: cleanPin,
      avatar_url: avatar_url || '🎒',
      created_by: teacherId,
    });

    revalidatePath('/teacher');
    revalidatePath('/teacher/dashboard');
    revalidatePath('/login/student');

    return {
      success: true,
      student: localStudent,
    };
  } catch (err: any) {
    console.error('[createStudentAccountAction] Unexpected error:', err);
    return { success: false, error: err.message || 'Server error creating student' };
  }
}

/**
 * Server Action: Upload Class Document / Worksheet / Camera Capture
 *
 * 1. Uploads file to Supabase Storage bucket 'class-documents'
 * 2. Saves document metadata linked to grade_id in `documents` table
 */
export async function uploadClassDocumentAction(input: CreateDocumentInput): Promise<{
  success: boolean;
  document?: Document;
  error?: string;
}> {
  try {
    const newDoc = await SupabaseService.createDocument(input);
    revalidatePath('/teacher');
    revalidatePath('/teacher/dashboard');
    revalidatePath('/student');
    revalidatePath('/student/dashboard');

    return {
      success: true,
      document: newDoc,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Failed to upload document',
    };
  }
}

/**
 * Server Action: Google OAuth URL Generator
 */
export async function getGoogleOAuthUrlAction(
  origin?: string,
  nextPath: string = '/teacher/dashboard'
): Promise<{
  url?: string;
  error?: string;
}> {
  try {
    const base = (origin || getBaseUrl()).replace(/\/+$/, '');
    const redirectUri = `${base}/auth/callback?next=${encodeURIComponent(nextPath)}`;

    if (isSupabaseConfigured()) {
      const supabase = await createServerSupabaseClient();
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUri,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      if (error) return { error: error.message };
      return { url: data.url };
    }
    return { url: redirectUri };
  } catch (err: any) {
    return { error: err.message || 'Failed to initialize Google OAuth' };
  }
}
