// src/components/auth/TeacherLoginForm.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Mail,
  Lock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  ArrowLeft,
  Zap,
} from 'lucide-react';
import { GoogleAuthButton } from './GoogleAuthButton';
import { useEdTech } from '@/context/EdTechContext';
import { sound } from '@/utils/sound';

export function TeacherLoginForm() {
  const router = useRouter();
  const { loginAsTeacher } = useEdTech();

  const [email, setEmail] = useState('teacher@smartkids.edu.kh');
  const [password, setPassword] = useState('smartkids123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playPop();
    setSubmitting(true);
    setError(null);

    if (!email.includes('@') || password.length < 6) {
      sound.playErrorThud();
      setError('សូមបញ្ចូលអ៊ីមែល និងពាក្យសម្ងាត់យ៉ាងតិច ៦ តួអក្សរ!');
      setSubmitting(false);
      return;
    }

    sound.playSuccessChime();
    setSuccess(true);
    setSubmitting(false);
    loginAsTeacher(email);

    setTimeout(() => {
      router.push('/teacher/dashboard');
    }, 600);
  };

  return (
    <div
      style={{ fontFamily: "'Kantumruy Pro', 'Noto Sans Khmer', system-ui, sans-serif" }}
      className="min-h-screen bg-[#FBF9F4] flex flex-col items-center justify-center p-4 sm:p-6"
    >
      <div className="w-full max-w-md flex flex-col items-center">
        {/* Header Branding */}
        <div className="text-center mb-6 flex flex-col items-center">
          <div
            className="w-14 h-14 rounded-2xl bg-linear-to-tr from-indigo-500 via-indigo-600 to-indigo-700 border border-indigo-400 shadow-md flex items-center justify-center text-3xl mb-3 animate-bounce"
            aria-hidden="true"
          >
            👩‍🏫
          </div>
          <div className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-semibold border border-slate-200 shadow-2xs mb-2">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <span>សម្រាប់គ្រូបង្រៀន • Teacher Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-[1.65] py-1">
            ចូលប្រើជាគ្រូបង្រៀន
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed">
            គ្រប់គ្រងសិស្ស ថតឯកសារ និងរៀបចំមេរៀនតាម Google ឬ Email
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] w-full flex flex-col gap-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="text-xs font-semibold text-slate-500">
              ការផ្ទៀងផ្ទាត់គណនី
            </span>
            <Link
              href="/login"
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>ថយក្រោយ</span>
            </Link>
          </div>

          {/* Real Google OAuth Button */}
          <div className="space-y-1.5">
            <GoogleAuthButton
              onError={(err) => setError(err.message)}
            />
            <span className="text-[11px] text-slate-400 text-center block font-khmer">
              ប្រើប្រាស់គណនី Google / Gmail ផ្លូវការរបស់លោកគ្រូ-អ្នកគ្រូ
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-px bg-slate-200 flex-1" />
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              ឬតាមរយៈអ៊ីមែល
            </span>
            <div className="h-px bg-slate-200 flex-1" />
          </div>

          {/* Email / Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="teacher-email"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                អាសយដ្ឋានអ៊ីមែល ៖
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="teacher-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="teacher@smartkids.edu.kh"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-xs font-mono text-slate-900 bg-slate-50/50"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="teacher-password"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                ពាក្យសម្ងាត់ ៖
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="teacher-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-2xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-xs font-mono text-slate-900 bg-slate-50/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>ចូលបានជោគជ័យ! កំពុងនាំទៅ Teacher Dashboard...</span>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              <ArrowRight className="w-4 h-4" />
              <span>ចូលផ្ទាំងគ្រប់គ្រងគ្រូ (Teacher Dashboard)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                sound.playPop();
                setEmail('teacher@smartkids.edu.kh');
                setPassword('smartkids123');
                sound.playSuccessChime();
                setSuccess(true);
                loginAsTeacher('teacher@smartkids.edu.kh');
                setTimeout(() => {
                  router.push('/teacher/dashboard');
                }, 500);
              }}
              className="w-full py-2.5 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-800 font-semibold text-xs border border-slate-200 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5 text-indigo-600" />
              <span>ប្រើគណនីសាកល្បង (Demo Teacher Account)</span>
            </button>
          </form>
        </div>

        <footer className="mt-8 text-center text-xs text-slate-500 font-medium font-khmer">
          កុមារឆ្លាត (SmartKids Cambodia) • វេទិកាអប់រំឌីជីថល MoEYS
        </footer>
      </div>
    </div>
  );
}

export default TeacherLoginForm;
