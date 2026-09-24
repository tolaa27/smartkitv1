import { NextRequest, NextResponse } from 'next/server';
import { SupabaseService } from '@/lib/supabase/service';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { student_id, pin } = body;

    if (!student_id || typeof student_id !== 'string') {
      return NextResponse.json(
        { success: false, error: 'សូមជ្រើសរើសឈ្មោះសិស្ស (Please select student)' },
        { status: 400 }
      );
    }

    if (!pin || typeof pin !== 'string' || !/^\d{4}$/.test(pin.trim())) {
      return NextResponse.json(
        { success: false, error: 'សូមបញ្ចូលលេខសម្ងាត់ PIN ៤ ខ្ទង់ (Please enter 4-digit PIN)' },
        { status: 400 }
      );
    }

    const cleanPin = pin.trim();
    const student = await SupabaseService.verifyStudentPinWithId(student_id, cleanPin);

    if (!student) {
      return NextResponse.json(
        {
          success: false,
          error: 'លេខកូដ PIN ៤ ខ្ទង់មិនត្រឹមត្រូវទេ! សូមសាកល្បងម្តងទៀត ឬសួរលោកគ្រូ-អ្នកគ្រូ។ (Invalid 4-digit PIN)',
        },
        { status: 401 }
      );
    }

    // Build session token
    const sessionPayload = {
      studentId: student.id,
      gradeId: student.grade_id,
      name: student.full_name,
      avatar: student.avatar_url,
      role: 'student',
      authTime: Date.now(),
      exp: Date.now() + 1000 * 60 * 60 * 24 * 30, // 30 days
    };

    const sessionToken = Buffer.from(JSON.stringify(sessionPayload)).toString('base64url');

    const response = NextResponse.json({
      success: true,
      message: `ស្វាគមន៍ ${student.full_name} ចូលរៀនបានជោគជ័យ!`,
      student: {
        id: student.id,
        name: student.full_name,
        avatar: student.avatar_url,
        gradeId: student.grade_id,
        gradeName: student.grade_name,
      },
      redirectUrl: '/student',
    });

    // Set secure authentication cookies
    response.cookies.set('smartkids_user_role', 'student', {
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
      sameSite: 'lax',
    });

    response.cookies.set('smartkids_student_session', sessionToken, {
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
      sameSite: 'lax',
    });

    if (student.grade_id) {
      response.cookies.set('smartkids_grade_id', student.grade_id, {
        path: '/',
        maxAge: 60 * 60 * 24 * 30,
        sameSite: 'lax',
      });
    }

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Server error during authentication' },
      { status: 500 }
    );
  }
}
