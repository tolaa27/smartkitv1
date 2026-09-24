// src/middleware.ts
// SmartKids Next.js Auth Middleware: Strict Role-Based Dashboard Protection

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Allow public assets, internal next routes, api endpoints, OAuth callback, and static files
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/auth') ||
    pathname.startsWith('/portfolio') ||
    pathname.includes('.') // static files like favicon.ico, images, fonts
  ) {
    return NextResponse.next();
  }

  // 2. Read role cookie (synced by client and server during login)
  const roleCookie = request.cookies.get('smartkids_user_role')?.value;
  const isTeacher = roleCookie === 'teacher';
  const isStudent = roleCookie === 'student';
  const isAuthenticated = Boolean(isTeacher || isStudent);

  // 3. Handle login routes (/login, /login/teacher, /login/student)
  if (pathname === '/login' || pathname.startsWith('/login/')) {
    // If already authenticated, redirect to appropriate role dashboard
    if (isTeacher) {
      return NextResponse.redirect(new URL('/teacher/dashboard', request.url));
    }
    if (isStudent) {
      return NextResponse.redirect(new URL('/student/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // 4. Protect Teacher Routes (/teacher, /teacher/dashboard, /studio)
  if (pathname.startsWith('/teacher') || pathname.startsWith('/studio')) {
    if (!isAuthenticated) {
      const loginUrl = new URL('/login/teacher', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (!isTeacher) {
      // Student attempting to access teacher dashboard -> redirect to student dashboard
      return NextResponse.redirect(new URL('/student/dashboard', request.url));
    }

    return NextResponse.next();
  }

  // 5. Protect Student Routes (/student and root /)
  if (pathname === '/' || pathname.startsWith('/student')) {
    if (!isAuthenticated) {
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  return NextResponse.next();
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
