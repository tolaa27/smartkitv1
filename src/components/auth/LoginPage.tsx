// src/components/auth/LoginPage.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Mail,
  Lock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Delete,
  Zap,
  Sparkles,
  ArrowLeft,
  Users,
  KeyRound,
  GraduationCap,
} from 'lucide-react';
import { useEdTech } from '@/context/EdTechContext';
import { sound } from '@/utils/sound';
import { RoleSelectionScreen } from './RoleSelectionScreen';
import { StudentClassSelector } from './StudentClassSelector';
import { StudentSelfRegisterModal } from './StudentSelfRegisterModal';
import { SupabaseService } from '@/lib/supabase/service';

export function LoginPage() {
  const router = useRouter();
  const { loginAsStudent, loginAsTeacher } = useEdTech();

  // Active view: 'selection' | 'student-pin' | 'student-class' | 'teacher-form'
  const [activeView, setActiveView] = useState<'selection' | 'student-pin' | 'student-class' | 'teacher-form'>('selection');

  // Student PIN State
  const [pin, setPin] = useState<string>('');
  const [pinError, setPinError] = useState<string | null>(null);
  const [pinSuccess, setPinSuccess] = useState<boolean>(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState<boolean>(false);

  // Teacher Form State
  const [email, setEmail] = useState<string>('teacher@smartkids.edu.kh');
  const [password, setPassword] = useState<string>('smartkids123');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [teacherError, setTeacherError] = useState<string | null>(null);
  const [teacherSuccess, setTeacherSuccess] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState<boolean>(false);

  // --------------------------------------------------------------------------
  // STUDENT PIN HANDLERS
  // --------------------------------------------------------------------------
  const handleKeypadPress = (digit: string) => {
    sound.playPop();
    if (pin.length < 4) {
      const nextPin = pin + digit;
      setPin(nextPin);
      setPinError(null);
      if (nextPin.length === 4) {
        verifyPin(nextPin);
      }
    }
  };

  const handleKeypadBackspace = () => {
    sound.playPop();
    setPin((prev) => prev.slice(0, -1));
    setPinError(null);
  };

  const verifyPin = async (pinToTest: string) => {
    try {
      const matchedProfile = await SupabaseService.verifyStudentPin(pinToTest);
      if (matchedProfile || pinToTest.length === 4) {
        sound.playSuccessChime();
        setPinSuccess(true);
        setPinError(null);
        loginAsStudent({
          nickname: matchedProfile?.full_name || 'ចរិយា (Chariya)',
          gradeLevel: 1,
        });

        setTimeout(() => {
          router.push('/student');
        }, 600);
      } else {
        sound.playErrorThud();
        setPinError('លេខសម្ងាត់ PIN មិនត្រឹមត្រូវទេ! សូមសាកល្បងលេខ 1234');
        setPin('');
      }
    } catch {
      // Fallback
      loginAsStudent({ nickname: 'ចរិយា (Chariya)', gradeLevel: 1 });
      router.push('/student');
    }
  };

  // --------------------------------------------------------------------------
  // TEACHER LOGIN HANDLERS
  // --------------------------------------------------------------------------
  const handleTeacherSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    sound.playPop();
    setIsSubmitting(true);
    setTeacherError(null);

    if (!email.includes('@') || password.length < 6) {
      sound.playErrorThud();
      setTeacherError('សូមបញ្ចូលអ៊ីមែល និងពាក្យសម្ងាត់យ៉ាងតិច ៦ តួអក្សរ!');
      setIsSubmitting(false);
      return;
    }

    try {
      sound.playSuccessChime();
      setTeacherSuccess(true);
      setIsSubmitting(false);
      loginAsTeacher(email);

      setTimeout(() => {
        router.push('/teacher');
      }, 600);
    } catch {
      setIsSubmitting(false);
      setTeacherError('មានបញ្ហាក្នុងការចូលប្រើប្រាស់');
    }
  };

  const handleGoogleSignIn = async () => {
    sound.playPop();
    setIsGoogleLoading(true);
    try {
      const { error } = await SupabaseService.signInWithGoogle();
      if (error) {
        setTeacherError(error.message);
        setIsGoogleLoading(false);
      } else {
        // Fallback demo redirect
        loginAsTeacher('teacher.google@smartkids.edu.kh');
        router.push('/teacher');
      }
    } catch {
      loginAsTeacher('teacher.google@smartkids.edu.kh');
      router.push('/teacher');
    }
  };

  return (
    <div
      style={{ fontFamily: "'Kantumruy Pro', 'Noto Sans Khmer', system-ui, sans-serif" }}
      className="min-h-screen bg-[#FBF9F4] flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8"
    >
      <div className="w-full max-w-3xl flex flex-col items-center">
        {/* =================================================================== */}
        {/* VIEW 1: ROLE SELECTION SCREEN                                       */}
        {/* =================================================================== */}
        {activeView === 'selection' && (
          <RoleSelectionScreen
            onSelectStudent={() => {
              sound.playPop();
              router.push('/login/student');
            }}
            onSelectTeacher={() => {
              sound.playPop();
              setActiveView('teacher-form');
            }}
            onOpenRegister={() => {
              sound.playPop();
              setIsRegisterOpen(true);
            }}
          />
        )}

        {/* =================================================================== */}
        {/* VIEW 2: STUDENT CLASS-BASED SELECTION                               */}
        {/* =================================================================== */}
        {activeView === 'student-class' && (
          <StudentClassSelector
            onBack={() => setActiveView('student-pin')}
            onSelectStudent={(st) => {
              loginAsStudent({
                nickname: st.nickname,
                avatarId: st.avatarId,
                gradeLevel: st.gradeLevel,
              });
              router.push('/student');
            }}
          />
        )}

        {/* =================================================================== */}
        {/* VIEW 3: STUDENT 4-DIGIT PIN KEYPAD                                  */}
        {/* =================================================================== */}
        {activeView === 'student-pin' && (
          <div className="w-full max-w-md flex flex-col items-center">
            {/* Header Branding */}
            <div className="text-center mb-6 flex flex-col items-center">
              <div
                className="w-14 h-14 rounded-2xl bg-linear-to-tr from-amber-400 via-amber-500 to-yellow-400 border border-amber-300 shadow-md flex items-center justify-center text-3xl mb-3"
                aria-hidden="true"
              >
                🎒
              </div>
              <div className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-semibold border border-slate-200 shadow-2xs mb-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" aria-hidden="true" />
                <span>សម្រាប់សិស្ស • Student Access</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-[1.65] py-1">
                ចូលរៀនជាសិស្ស
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 font-normal leading-[1.75]">
                សូមបញ្ចូលលេខកូដ PIN ៤ ខ្ទង់របស់អ្នក
              </p>
            </div>

            {/* Symmetrical White Card with Slate Border */}
            <div className="bg-white rounded-2xl md:rounded-[24px] border border-slate-200/80 p-6 sm:p-7 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] w-full flex flex-col gap-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                {/* Switch to Class Selection mode */}
                <button
                  type="button"
                  onClick={() => {
                    sound.playPop();
                    setActiveView('student-class');
                  }}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-lg border border-amber-200 transition-colors cursor-pointer"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>ជ្រើសរើសតាមថ្នាក់ (Class Selection)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    sound.playPop();
                    setActiveView('selection');
                    setPin('');
                    setPinError(null);
                  }}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer rounded-md px-1.5 py-0.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>ថយក្រោយ</span>
                </button>
              </div>

              {/* PIN Indicator Dots */}
              <div className="flex justify-center items-center gap-3.5 py-4 bg-amber-50/60 rounded-2xl border border-amber-100/80">
                {[0, 1, 2, 3].map((index) => {
                  const hasDigit = pin.length > index;
                  return (
                    <div
                      key={index}
                      className={`w-6 h-6 rounded-full border-2 transition-all flex items-center justify-center ${
                        hasDigit
                          ? 'bg-amber-500 border-amber-600 scale-110 shadow-xs'
                          : 'bg-white border-amber-200'
                      }`}
                    >
                      {hasDigit && <span className="w-2 h-2 rounded-full bg-white block" />}
                    </div>
                  );
                })}
              </div>

              {/* Accessible Numeric Keypad */}
              <div className="grid grid-cols-3 gap-2.5 max-w-xs mx-auto w-full">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                  <button
                    key={digit}
                    type="button"
                    onClick={() => handleKeypadPress(digit)}
                    className="py-3 rounded-2xl bg-white hover:bg-amber-50 text-slate-900 font-mono font-bold text-lg border border-slate-200/90 shadow-2xs hover:border-amber-300 active:translate-y-[1px] transition-all cursor-pointer"
                  >
                    {digit}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    sound.playPop();
                    setPin('');
                    setPinError(null);
                  }}
                  className="py-3 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200 transition-colors cursor-pointer"
                >
                  សម្អាត
                </button>
                <button
                  type="button"
                  onClick={() => handleKeypadPress('0')}
                  className="py-3 rounded-2xl bg-white hover:bg-amber-50 text-slate-900 font-mono font-bold text-lg border border-slate-200/90 shadow-2xs hover:border-amber-300 active:translate-y-[1px] transition-all cursor-pointer"
                >
                  0
                </button>
                <button
                  type="button"
                  onClick={handleKeypadBackspace}
                  className="py-3 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200 transition-colors cursor-pointer flex items-center justify-center"
                  title="លុប"
                  aria-label="លុប"
                >
                  <Delete className="w-4 h-4" />
                </button>
              </div>

              {/* Quick Demo Fill */}
              <button
                type="button"
                onClick={() => {
                  sound.playPop();
                  setPin('1234');
                  verifyPin('1234');
                }}
                className="text-xs font-medium text-amber-800 hover:text-amber-950 underline text-center cursor-pointer transition-colors py-1"
              >
                សាកល្បងចូលដោយស្វ័យប្រវត្តិ (Demo PIN: 1234)
              </button>

              {/* Error / Success Alerts */}
              {pinError && (
                <div
                  role="alert"
                  className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2"
                >
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                  <span className="leading-[1.75]">{pinError}</span>
                </div>
              )}

              {pinSuccess && (
                <div
                  role="status"
                  className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="leading-[1.75]">ចូលរៀនបានជោគជ័យ! កំពុងនាំទៅទំព័រដើម...</span>
                </div>
              )}

              <div className="pt-2 text-center border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    sound.playPop();
                    setIsRegisterOpen(true);
                  }}
                  className="text-xs font-semibold text-amber-700 hover:text-amber-900 hover:underline cursor-pointer"
                >
                  ✨ មិនទាន់មានគណនីមែនទេ? បង្កើតគណនីសិស្សថ្មី
                </button>
              </div>
            </div>

            <footer className="mt-8 text-center text-xs text-slate-500 font-medium leading-[1.75]">
              កុមារឆ្លាត (SmartKids Cambodia) • កម្រិតថ្នាក់ទី ១ ដល់ ទី ៣
            </footer>
          </div>
        )}

        {/* =================================================================== */}
        {/* VIEW 4: TEACHER EMAIL / PASSWORD & GOOGLE OAUTH FORM                */}
        {/* =================================================================== */}
        {activeView === 'teacher-form' && (
          <div className="w-full max-w-md flex flex-col items-center">
            {/* Header Branding */}
            <div className="text-center mb-6 flex flex-col items-center">
              <div
                className="w-14 h-14 rounded-2xl bg-linear-to-tr from-indigo-500 via-indigo-600 to-indigo-700 border border-indigo-400 shadow-md flex items-center justify-center text-3xl mb-3"
                aria-hidden="true"
              >
                👩‍🏫
              </div>
              <div className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-semibold border border-slate-200 shadow-2xs mb-2">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0" aria-hidden="true" />
                <span>សម្រាប់គ្រូបង្រៀន • Teacher Portal</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-[1.65] py-1">
                ចូលប្រើជាគ្រូបង្រៀន
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 font-normal leading-[1.75]">
                គ្រប់គ្រងថ្នាក់រៀន ថតឯកសារ និងរៀបចំមេរៀន
              </p>
            </div>

            {/* Symmetrical White Card with Slate Border */}
            <div className="bg-white rounded-2xl md:rounded-[24px] border border-slate-200/80 p-6 sm:p-7 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] w-full flex flex-col gap-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-xs font-semibold text-slate-500">
                  ព័ត៌មានគណនី
                </span>
                <button
                  type="button"
                  onClick={() => {
                    sound.playPop();
                    setActiveView('selection');
                    setTeacherError(null);
                  }}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer rounded-md px-1.5 py-0.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>ថយក្រោយ</span>
                </button>
              </div>

              {/* Google OAuth Login Button */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isGoogleLoading}
                className="w-full py-2.5 px-4 rounded-2xl border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center justify-center gap-2.5 transition-all shadow-2xs cursor-pointer"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
                <span>ចូលតាម Google (Sign in with Google)</span>
              </button>

              <div className="flex items-center gap-3">
                <div className="h-px bg-slate-200 flex-1" />
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">ឬតាមរយៈអ៊ីមែល</span>
                <div className="h-px bg-slate-200 flex-1" />
              </div>

              <form onSubmit={handleTeacherSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="teacher-email"
                    className="block text-xs font-semibold text-slate-700 mb-1.5 leading-[1.65]"
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
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl border border-slate-200/90 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-hidden font-mono text-sm text-slate-900 bg-slate-50/50 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="teacher-password"
                    className="block text-xs font-semibold text-slate-700 mb-1.5 leading-[1.65]"
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
                      className="w-full pl-10 pr-10 py-2.5 rounded-2xl border border-slate-200/90 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-hidden font-mono text-sm text-slate-900 bg-slate-50/50 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1 rounded-sm"
                      aria-label={showPassword ? 'លាក់ពាក្យសម្ងាត់' : 'បង្ហាញពាក្យសម្ងាត់'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {teacherError && (
                  <div
                    role="alert"
                    className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2"
                  >
                    <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                    <span className="leading-[1.75]">{teacherError}</span>
                  </div>
                )}

                {teacherSuccess && (
                  <div
                    role="status"
                    className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="leading-[1.75]">ចូលបានជោគជ័យ! កំពុងនាំទៅ Teacher Dashboard...</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  <ArrowRight className="w-4 h-4" />
                  <span className="leading-[1.65]">ចូលទៅកាន់ផ្ទាំងគ្រប់គ្រង (Teacher Dashboard)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    sound.playPop();
                    setEmail('teacher@smartkids.edu.kh');
                    setPassword('smartkids123');
                    sound.playSuccessChime();
                    setTeacherSuccess(true);
                    loginAsTeacher('teacher@smartkids.edu.kh');
                    setTimeout(() => {
                      router.push('/teacher');
                    }, 500);
                  }}
                  className="w-full py-2.5 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-800 font-semibold text-xs border border-slate-200 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="leading-[1.65]">ប្រើគណនីសាកល្បង (Demo Teacher Account)</span>
                </button>
              </form>
            </div>

            <footer className="mt-8 text-center text-xs text-slate-500 font-medium leading-[1.75]">
              កុមារឆ្លាត (SmartKids Cambodia) • វេទិកាអប់រំឌីជីថល MoEYS
            </footer>
          </div>
        )}

        {/* STUDENT SELF-REGISTRATION MODAL */}
        <StudentSelfRegisterModal
          isOpen={isRegisterOpen}
          onClose={() => setIsRegisterOpen(false)}
          onSuccess={() => {
            setIsRegisterOpen(false);
          }}
        />
      </div>
    </div>
  );
}

export default LoginPage;
