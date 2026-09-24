// src/app/actions/studentActions.ts
'use server';

import { cookies } from 'next/headers';
import { SupabaseService } from '@/lib/supabase/service';
import { User, Document } from '@/lib/supabase/types';

/**
 * Server Action: Verify Student 4-Digit PIN & Issue Session Cookie/JWT
 */
export async function verifyStudentPinAction(
  studentId: string,
  pin: string
): Promise<{
  success: boolean;
  student?: {
    id: string;
    name: string;
    gradeId?: string | null;
    avatarUrl?: string | null;
  };
  redirectUrl?: string;
  error?: string;
}> {
  try {
    if (!studentId) {
      return { success: false, error: 'សូមជ្រើសរើសឈ្មោះសិស្ស (Please select student)' };
    }

    if (!pin || !/^\d{4}$/.test(pin.trim())) {
      return { success: false, error: 'សូមបញ្ចូលលេខសម្ងាត់ PIN ៤ ខ្ទង់ (Please enter 4-digit PIN)' };
    }

    const cleanPin = pin.trim();
    const student = await SupabaseService.verifyStudentPinWithId(studentId, cleanPin);

    if (!student) {
      return {
        success: false,
        error: 'លេខកូដ PIN ៤ ខ្ទង់មិនត្រឹមត្រូវទេ! សូមសាកល្បងម្តងទៀត ឬសួរលោកគ្រូ-អ្នកគ្រូ។',
      };
    }

    // Build session token storing student_id and grade_id
    const sessionPayload = {
      student_id: student.id,
      grade_id: student.grade_id,
      name: student.full_name,
      avatar: student.avatar_url,
      role: 'student',
      timestamp: Date.now(),
      exp: Date.now() + 1000 * 60 * 60 * 24 * 30, // 30 days
    };

    const sessionToken = Buffer.from(JSON.stringify(sessionPayload)).toString('base64url');

    // Issue cookies via Next.js cookies() API in Server Action
    const cookieStore = await cookies();

    cookieStore.set('smartkids_user_role', 'student', {
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
      sameSite: 'lax',
    });

    cookieStore.set('smartkids_student_session', sessionToken, {
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
      sameSite: 'lax',
    });

    cookieStore.set('smartkids_student_id', student.id, {
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
      sameSite: 'lax',
    });

    if (student.grade_id) {
      cookieStore.set('smartkids_grade_id', student.grade_id, {
        path: '/',
        maxAge: 60 * 60 * 24 * 30,
        sameSite: 'lax',
      });
    }

    return {
      success: true,
      student: {
        id: student.id,
        name: student.full_name,
        gradeId: student.grade_id,
        avatarUrl: student.avatar_url,
      },
      redirectUrl: '/student/dashboard',
    };
  } catch (err: any) {
    console.error('[verifyStudentPinAction] Error:', err);
    return { success: false, error: err.message || 'Server authentication error' };
  }
}

/**
 * Server Action: Fetch Classroom Materials uploaded specifically for this Grade
 */
export async function getStudentClassMaterialsAction(gradeId?: string): Promise<{
  success: boolean;
  documents: Document[];
}> {
  try {
    const docs = await SupabaseService.getDocuments(gradeId);
    return { success: true, documents: docs };
  } catch (err) {
    console.error('[getStudentClassMaterialsAction] Error:', err);
    return { success: false, documents: [] };
  }
}
