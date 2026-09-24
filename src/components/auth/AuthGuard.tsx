// src/components/auth/AuthGuard.tsx
'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useEdTech } from '@/context/EdTechContext';
import { Loader2 } from 'lucide-react';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { userRole, isLoadingAuth } = useEdTech();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (isLoadingAuth) return;

    // Public routes that don't need auth guard
    if (pathname === '/portfolio') return;

    // 1. If not logged in and not already on a login page, force redirect to /login
    if (!userRole && !pathname.startsWith('/login')) {
      router.replace('/login');
      return;
    }

    // 2. If logged in and on a login page, route according to role
    if (userRole && pathname.startsWith('/login')) {
      if (userRole === 'teacher') {
        router.replace('/teacher');
      } else {
        router.replace('/student');
      }
      return;
    }

    // 3. If student tries to visit teacher-only routes
    if (userRole === 'student' && (pathname.startsWith('/teacher') || pathname.startsWith('/studio'))) {
      router.replace('/student');
      return;
    }
  }, [userRole, isLoadingAuth, pathname, router]);

  // Loading state while checking localStorage/cookies
  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-[#FFFDF7] flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 rounded-3xl bg-linear-to-tr from-amber-400 to-yellow-300 border-2 border-amber-300 shadow-md flex items-center justify-center text-3xl mb-4 animate-bounce">
          🐘
        </div>
        <div className="flex items-center gap-2 text-amber-900 font-khmer font-bold text-sm">
          <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
          <span>កំពុងផ្ទុក... (Loading SmartKids)</span>
        </div>
      </div>
    );
  }

  // If not logged in and trying to access protected route, render nothing while redirecting
  if (!userRole && !pathname.startsWith('/login') && pathname !== '/portfolio') {
    return null;
  }

  return <>{children}</>;
}

export default AuthGuard;
