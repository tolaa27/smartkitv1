import { NextRequest, NextResponse } from 'next/server';
import { SupabaseService } from '@/lib/supabase/service';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const gradeId = searchParams.get('gradeId') || undefined;

    const students = await SupabaseService.getStudents(gradeId);
    return NextResponse.json({ success: true, students });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch students' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { full_name, grade_id, pin_code, avatar_url, created_by } = body;

    // Validation
    if (!full_name || typeof full_name !== 'string' || !full_name.trim()) {
      return NextResponse.json(
        { success: false, error: 'សូមបញ្ចូលឈ្មោះសិស្ស (Student name is required)' },
        { status: 400 }
      );
    }

    if (!grade_id || typeof grade_id !== 'string') {
      return NextResponse.json(
        { success: false, error: 'សូមជ្រើសរើសកម្រិតថ្នាក់ (Grade is required)' },
        { status: 400 }
      );
    }

    if (!pin_code || !/^\d{4}$/.test(pin_code.trim())) {
      return NextResponse.json(
        { success: false, error: 'លេខសម្ងាត់ PIN ត្រូវតែមាន ៤ ខ្ទង់ជាលេខ (PIN must be exactly 4 digits)' },
        { status: 400 }
      );
    }

    // Resolve teacher ID from session or default teacher
    const teacherId = created_by || request.cookies.get('smartkids_teacher_id')?.value || 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

    const newStudent = await SupabaseService.createStudentAccount({
      full_name: full_name.trim(),
      grade_id: grade_id.trim(),
      pin_code: pin_code.trim(),
      avatar_url: avatar_url || '🎒',
      created_by: teacherId,
    });

    return NextResponse.json({
      success: true,
      message: 'បានបង្កើតគណនីសិស្សដោយជោគជ័យ (Student account created successfully)',
      student: newStudent,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create student account' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Missing student ID' },
        { status: 400 }
      );
    }

    await SupabaseService.deleteStudentAccount(id);
    return NextResponse.json({
      success: true,
      message: 'បានលុបគណនីសិស្សដោយជោគជ័យ (Student deleted)',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete student' },
      { status: 500 }
    );
  }
}
