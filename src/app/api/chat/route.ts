// src/app/api/chat/route.ts
// Minimal Verified Server-Side Authentication Route Handler (Zero-Trust)

import { NextResponse, type NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

interface ChatRequestBody {
  message: string;
  conversationId?: string;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();

    // 1. Zero-Trust Verification: Contact Supabase Auth Server to cryptographically verify token
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
          message: 'A valid, verified user session is required to access this endpoint.',
        },
        { status: 401 }
      );
    }

    // 2. Validate JSON Request Body
    let body: ChatRequestBody;
    try {
      body = (await request.json()) as ChatRequestBody;
    } catch {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Invalid JSON payload in request body.' },
        { status: 400 }
      );
    }

    if (!body.message || typeof body.message !== 'string' || body.message.trim() === '') {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Field "message" must be a non-empty string.' },
        { status: 400 }
      );
    }

    // 3. User Identity is verified server-side (preventing user impersonation)
    const userId = user.id;
    const userEmail = user.email;

    return NextResponse.json(
      {
        success: true,
        data: {
          reply: `Verified server session received message: "${body.message.trim()}"`,
          sender: {
            id: userId,
            email: userEmail,
          },
          timestamp: new Date().toISOString(),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[API /api/chat Error]:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Failed to process chat request.' },
      { status: 500 }
    );
  }
}
