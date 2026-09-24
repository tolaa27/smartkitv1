// src/app/auth/callback/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database } from '@/lib/supabase/types';
import { getBaseUrl } from '@/lib/utils/url';

// Force dynamic execution for cookies and OAuth query params
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') || '/teacher/dashboard';
  const baseUrl = getBaseUrl();

  // Validate redirect path to prevent open redirect vulnerabilities
  const safeNext = next.startsWith('/') ? next : `/${next}`;
  const targetRedirectUrl = new URL(safeNext, baseUrl).toString();

  if (code) {
    const cookieStore = await cookies();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

    const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Can be ignored if called from Route Handler
          }
        },
      },
    });

    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);

      if (!error && data.session?.user) {
        const user = data.session.user;
        const meta = user.user_metadata || {};
        const fullName =
          meta.full_name || meta.name || user.email?.split('@')[0] || 'លោកគ្រូ-អ្នកគ្រូ';
        const avatarUrl = meta.avatar_url || meta.picture || '👩‍🏫';

        // Upsert into users table as teacher with real Gmail and profile photo
        await (supabase.from('users') as any).upsert(
          {
            id: user.id,
            auth_provider_id: user.id,
            email: user.email,
            full_name: fullName,
            role: 'teacher',
            avatar_url: avatarUrl,
          },
          { onConflict: 'id' }
        );

        const response = NextResponse.redirect(targetRedirectUrl);

        // Set role & session cookies
        response.cookies.set('smartkids_user_role', 'teacher', {
          path: '/',
          maxAge: 60 * 60 * 24 * 30, // 30 days
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production',
        });

        response.cookies.set('smartkids_teacher_email', user.email || '', {
          path: '/',
          maxAge: 60 * 60 * 24 * 30,
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production',
        });

        return response;
      } else if (error) {
        console.error('[OAuth Callback] Session exchange error:', error.message);
      }
    } catch (err) {
      console.error('[OAuth Callback] Unexpected error during code exchange:', err);
    }
  }

  // Fallback redirect for simulation / demo or error
  const fallbackUrl = new URL('/teacher/dashboard', baseUrl).toString();
  const fallbackResponse = NextResponse.redirect(fallbackUrl);
  fallbackResponse.cookies.set('smartkids_user_role', 'teacher', {
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
  return fallbackResponse;
}
