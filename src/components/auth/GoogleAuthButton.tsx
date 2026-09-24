// src/components/auth/GoogleAuthButton.tsx
'use client';

import React, { useState } from 'react';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { getOAuthCallbackUrl } from '@/lib/utils/url';
import { Loader2 } from 'lucide-react';
import { sound } from '@/utils/sound';

export interface GoogleAuthButtonProps {
  redirectTo?: string;
  className?: string;
  onSuccess?: () => void;
  onError?: (err: Error) => void;
}

export function GoogleAuthButton({
  redirectTo,
  className = '',
  onSuccess,
  onError,
}: GoogleAuthButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    sound.playPop();
    setLoading(true);

    try {
      const targetRedirect = redirectTo || getOAuthCallbackUrl('/teacher/dashboard');

      if (isSupabaseConfigured()) {
        const supabase = createClient();
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: targetRedirect,
            queryParams: {
              access_type: 'offline',
              prompt: 'consent',
            },
          },
        });

        if (error) {
          throw error;
        }
      } else {
        // High-fidelity fallback redirect for demo environments
        setTimeout(() => {
          document.cookie = 'smartkids_user_role=teacher; path=/; max-age=2592000; SameSite=Lax';
          document.cookie =
            'smartkids_teacher_email=teacher.google@smartkids.edu.kh; path=/; max-age=2592000; SameSite=Lax';
          window.location.href = '/teacher/dashboard';
        }, 600);
      }
    } catch (err: any) {
      console.error('[GoogleAuth] Sign-in error:', err);
      setLoading(false);
      if (onError) onError(err);
    }
  };

  return (
    <button
      type="button"
      onClick={handleGoogleSignIn}
      disabled={loading}
      className={`w-full py-3 px-4 rounded-2xl border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs sm:text-sm flex items-center justify-center gap-3 transition-all shadow-2xs hover:shadow-xs cursor-pointer disabled:opacity-60 select-none ${className}`}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
          <span>កំពុងតភ្ជាប់ទៅកាន់ Google...</span>
        </>
      ) : (
        <>
          {/* Official Google Vector Logo */}
          <svg className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span className="font-khmer leading-none">ចូលតាម Google (Sign in with Google)</span>
        </>
      )}
    </button>
  );
}

export default GoogleAuthButton;
