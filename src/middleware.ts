// src/middleware.ts
// SmartKids Next.js Auth Middleware: Non-blocking Session Refresh & Clean Navigation History

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

  // 4. Protect Teacher Routes (/teacher, /teacher/dashboard, /studio)
  if (pathname.startsWith('/teacher') || pathname.startsWith('/studio')) {
    if (!isAuthenticated) {
      const loginUrl = new URL('/login/teacher', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return withCookies(NextResponse.redirect(loginUrl));
    }

    if (!isTeacher && isStudent) {
      return withCookies(NextResponse.redirect(new URL('/student/dashboard', request.url)));
    }

    return supabaseResponse;
  }

  // 5. Protect Dedicated Student Dashboard (/student and /student/**)
  if (pathname === '/student' || pathname.startsWith('/student/')) {
    if (!isAuthenticated) {
      const loginUrl = new URL('/login/student', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return withCookies(NextResponse.redirect(loginUrl));
    }

    return supabaseResponse;
  }

  // 6. Root `/`, `/login`, and `/login/**` routes are fully accessible.
  // This ensures browser 'Back' button and 'Return to old page' links never get
  // trapped in an infinite redirect loop when users switch roles or navigate backward.
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
