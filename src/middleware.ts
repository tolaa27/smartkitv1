// src/middleware.ts
// SmartKids Next.js Auth Middleware: Strict Role-Based Dashboard Protection with Supabase SSR Session Refresh

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Allow public assets, internal next routes, OAuth callback, and static files without auth checks
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/auth') ||
    pathname.startsWith('/portfolio') ||
    pathname.includes('.') // static files like favicon.ico, images, fonts
  ) {
    return NextResponse.next();
  }

  // 2. Perform Supabase SSR session refresh and synchronize cookies
  const { supabaseResponse, user } = await updateSession(request);

  // 3. Read role cookie (synced by client and server during login)
  const roleCookie = request.cookies.get('smartkids_user_role')?.value;
  // If Supabase has an authenticated Google OAuth teacher session or cookie is teacher
  const isTeacher = roleCookie === 'teacher' || Boolean(user);
  const isStudent = roleCookie === 'student';
  const isAuthenticated = Boolean(isTeacher || isStudent);

  // Helper to persist refreshed cookies during redirects
  const withCookies = (redirectResponse: NextResponse) => {
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie);
    });
    return redirectResponse;
  };

  // 4. Handle login routes (/login, /login/teacher, /login/student)
  if (pathname === '/login' || pathname.startsWith('/login/')) {
    if (isTeacher) {
      return withCookies(NextResponse.redirect(new URL('/teacher/dashboard', request.url)));
    }
    if (isStudent) {
      return withCookies(NextResponse.redirect(new URL('/student/dashboard', request.url)));
    }
    return supabaseResponse;
  }

  // 5. Protect Teacher Routes (/teacher, /teacher/dashboard, /studio)
  if (pathname.startsWith('/teacher') || pathname.startsWith('/studio')) {
    if (!isAuthenticated) {
      const loginUrl = new URL('/login/teacher', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return withCookies(NextResponse.redirect(loginUrl));
    }

    if (!isTeacher) {
      return withCookies(NextResponse.redirect(new URL('/student/dashboard', request.url)));
    }

    return supabaseResponse;
  }

  // 6. Protect Student Routes (/student and root /)
  if (pathname === '/' || pathname.startsWith('/student')) {
    if (!isAuthenticated) {
      const loginUrl = new URL('/login', request.url);
      return withCookies(NextResponse.redirect(loginUrl));
    }

    return supabaseResponse;
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
