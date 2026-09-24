// src/components/auth/DedicatedStudentLogin.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  ArrowLeft,
  ArrowRight,
  KeyRound,
  GraduationCap,
  Users,
  Search,
  CheckCircle2,
  AlertCircle,
  Delete,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { Grade, Profile } from '@/lib/supabase/types';
import { SupabaseService } from '@/lib/supabase/service';
import { verifyStudentPinAction } from '@/app/actions/studentActions';
import { StudentSelfRegisterModal } from './StudentSelfRegisterModal';
import { useEdTech } from '@/context/EdTechContext';
import { sound } from '@/utils/sound';

export function DedicatedStudentLogin() {
  const router = useRouter();
  const { loginAsStudent } = useEdTech();

  // Multi-step flow: 'grade' -> 'student' -> 'pin'
  const [step, setStep] = useState<'grade' | 'student' | 'pin'>('grade');

  // Data states
  const [grades, setGrades] = useState<Grade[]>([]);
  const [students, setStudents] = useState<Profile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Selected entities
  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Profile | null>(null);
  const [studentSearch, setStudentSearch] = useState<string>('');
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState<boolean>(false);

  // PIN state
  const [pin, setPin] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [pinError, setPinError] = useState<string | null>(null);
  const [pinSuccess, setPinSuccess] = useState<boolean>(false);

  // Load Grades & Initial Students
  useEffect(() => {
    async function init() {
      try {
        const [loadedGrades, loadedStudents] = await Promise.all([
          SupabaseService.getGrades(),
          SupabaseService.getStudents(),
        ]);
        setGrades(loadedGrades);
        setStudents(loadedStudents);
      } catch (err) {
        console.warn('[DedicatedStudentLogin] Load error:', err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  // Filter students for the chosen grade
  const gradeStudents = useMemo(() => {
    if (!selectedGrade) return [];
    let list = students.filter((s) => s.grade_id === selectedGrade.id);

    // If teacher hasn't added students to this grade yet, offer demo profiles
    if (list.length === 0) {
      list = students;
    }

    if (studentSearch.trim()) {
      const q = studentSearch.toLowerCase();
      list = list.filter((s) => s.full_name.toLowerCase().includes(q));
    }
    return list;
  }, [students, selectedGrade, studentSearch]);

  // Keypad Handlers
  const handleDigit = (digit: string) => {
    sound.playPop();
    if (pin.length < 4) {
      const nextPin = pin + digit;
      setPin(nextPin);
      setPinError(null);
      if (nextPin.length === 4) {
        verifyPinSubmission(nextPin);
      }
    }
  };

  const handleBackspace = () => {
    sound.playPop();
    setPin((prev) => prev.slice(0, -1));
    setPinError(null);
  };

  const handleClear = () => {
    sound.playPop();
    setPin('');
    setPinError(null);
  };

  const verifyPinSubmission = async (pinToVerify: string) => {
    if (!selectedStudent) return;

    sound.playPop();
    setIsVerifying(true);
    setPinError(null);

    try {
      const data = await verifyStudentPinAction(selectedStudent.id, pinToVerify);

      if (!data.success) {
        sound.playErrorThud();
        setPinError(data.error || 'លេខសម្ងាត់ PIN មិនត្រឹមត្រូវទេ! សូមសាកល្បងម្តងទៀត');
        setPin('');
        setIsVerifying(false);
        return;
      }

      // Success Chime
      sound.playSuccessChime();
      setPinSuccess(true);
      setIsVerifying(false);

      // Determine gradeLevel number (1, 2, or 3)
      let parsedGradeLevel: 1 | 2 | 3 = 1;
      const gName = selectedStudent.grade_name || selectedGrade?.name || '';
      if (gName.includes('២') || gName.includes('2')) parsedGradeLevel = 2;
      else if (gName.includes('៣') || gName.includes('3')) parsedGradeLevel = 3;

      // Update EdTech Context
      loginAsStudent({
        id: selectedStudent.id,
        nickname: selectedStudent.full_name,
        avatarId: selectedStudent.avatar_url || '👧',
        gradeLevel: parsedGradeLevel,
      });

      // Navigate to student classroom dashboard
      setTimeout(() => {
        router.push(data.redirectUrl || '/student/dashboard');
      }, 700);
    } catch {
      // Local fallback
      sound.playSuccessChime();
      loginAsStudent({
        id: selectedStudent.id,
        nickname: selectedStudent.full_name,
        avatarId: selectedStudent.avatar_url || '👧',
        gradeLevel: 1,
      });
      router.push('/student/dashboard');
    }
  };

  return (
    <div
      style={{ fontFamily: "'Kantumruy Pro', 'Noto Sans Khmer', system-ui, sans-serif" }}
      className="min-h-screen bg-[#FBF9F4] flex flex-col items-center justify-center p-4 sm:p-6"
    >
      <div className="w-full max-w-xl flex flex-col items-center">
        {/* Brand Mascot Header */}
        <div className="text-center mb-6 flex flex-col items-center">
          <div
            className="w-16 h-16 rounded-3xl bg-linear-to-tr from-amber-400 via-amber-500 to-yellow-400 border-2 border-amber-300 shadow-md flex items-center justify-center text-4xl mb-3 animate-bounce"
            aria-hidden="true"
          >
            🎒
          </div>
          <div className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-700 px-3.5 py-1 rounded-full text-xs font-semibold border border-slate-200/90 shadow-2xs mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>កុមារឆ្លាត • Student Classroom Login</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-[1.6] py-1">
            ចូលរៀនជាសិស្ស
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-normal">
            {step === 'grade' && 'ជំហានទី ១ ៖ សូមជ្រើសរើសកម្រិតថ្នាក់របស់អ្នក'}
            {step === 'student' && `ជំហានទី ២ ៖ រកមើលឈ្មោះ និងរូបរបស់អ្នក (${selectedGrade?.name})`}
            {step === 'pin' && `ជំហានទី ៣ ៖ ស្វាគមន៍ ${selectedStudent?.full_name}! សូមបញ្ចូលលេខ PIN ៤ ខ្ទង់`}
          </p>
        </div>

        {/* Main Interactive Card */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-[0_6px_24px_-4px_rgba(0,0,0,0.06)] w-full flex flex-col gap-5">
          {/* Top Breadcrumb Navigation */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  step === 'grade'
                    ? 'bg-amber-500 text-white'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                1
              </span>
              <span className="text-xs font-semibold text-slate-400">&rarr;</span>
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  step === 'student'
                    ? 'bg-amber-500 text-white'
                    : step === 'pin'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                2
              </span>
              <span className="text-xs font-semibold text-slate-400">&rarr;</span>
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  step === 'pin' ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-500'
                }`}
              >
                3
              </span>
            </div>

            {step !== 'grade' ? (
              <button
                type="button"
                onClick={() => {
                  sound.playPop();
                  if (step === 'pin') {
                    setPin('');
                    setPinError(null);
                    setStep('student');
                  } else if (step === 'student') {
                    setStep('grade');
                  }
                }}
                className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>ថយក្រោយ</span>
              </button>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>ប្តូរតួនាទី</span>
              </Link>
            )}
          </div>

          {/* STEP 1: SELECT GRADE */}
          {step === 'grade' && (
            <div className="space-y-3.5 animate-fade-in">
              <span className="text-xs font-bold text-slate-600 block">
                ជ្រើសរើសថ្នាក់ដែលអ្នកកំពុងរៀន ៖
              </span>

              {loading ? (
                <div className="py-12 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                  <span>កំពុងទាញយកបញ្ជីថ្នាក់រៀន...</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {grades.map((g, idx) => {
                    const gradeIcons = ['🌱', '🌟', '🚀', '🎒'];
                    const icon = gradeIcons[idx % gradeIcons.length];
                    return (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => {
                          sound.playPop();
                          setSelectedGrade(g);
                          setStep('student');
                        }}
                        className="p-4 rounded-2xl border-2 border-slate-200/90 hover:border-amber-400 bg-white hover:bg-amber-50/50 shadow-2xs hover:shadow-sm transition-all flex items-center gap-3 text-left cursor-pointer group select-none"
                      >
                        <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-2xl group-hover:scale-105 transition-transform shrink-0">
                          {icon}
                        </div>
                        <div>
                          <h3 className="font-bold text-sm text-slate-900 group-hover:text-amber-900 font-khmer">
                            {g.name}
                          </h3>
                          <p className="text-xs text-slate-500 line-clamp-1 font-khmer mt-0.5">
                            {g.description || 'កម្មវិធីសិក្សាជាតិ MoEYS'}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    sound.playPop();
                    setIsRegisterModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 hover:text-amber-950 bg-amber-50 hover:bg-amber-100/90 px-3.5 py-2 rounded-xl border border-amber-200 shadow-2xs transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>សិស្សថ្មីមិនទាន់មានគណនី? បង្កើតគណនីសិស្សនៅទីនេះ</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: SELECT STUDENT AVATAR / NAME */}
          {step === 'student' && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">
                    តើអ្នកជាសិស្សម្នាក់ណា? ({selectedGrade?.name})
                  </span>
                  <p className="text-[11px] text-slate-500 font-khmer">
                    ចុចលើរូប ឬឈ្មោះរបស់អ្នកដើម្បីបន្ត
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    sound.playPop();
                    setIsRegisterModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 hover:text-amber-950 bg-amber-50 hover:bg-amber-100 px-2.5 py-1.5 rounded-xl border border-amber-200 transition-colors cursor-pointer shrink-0"
                >
                  <Sparkles className="w-3 h-3 text-amber-600" />
                  <span>បង្កើតគណនីថ្មី</span>
                </button>
              </div>

              {/* Student Search */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  placeholder="ស្វែងរកឈ្មោះរបស់អ្នក..."
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-khmer focus:outline-hidden focus:border-amber-500"
                />
              </div>

              {gradeStudents.length === 0 ? (
                <div className="py-8 text-center space-y-3">
                  <div className="text-3xl">🎒</div>
                  <p className="text-xs font-bold text-slate-700">មិនទាន់មានឈ្មោះសិស្សនៅក្នុងថ្នាក់នេះទេ</p>
                  <div className="flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        sound.playPop();
                        setIsRegisterModalOpen(true);
                      }}
                      className="py-1.5 px-3.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs shadow-xs cursor-pointer"
                    >
                      ✨ បង្កើតគណនីសិស្សឥឡូវនេះ
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        sound.playPop();
                        setSelectedStudent({
                          id: 'demo-student',
                          full_name: 'កូនសិស្សសាកល្បង',
                          role: 'student',
                          pin_code: '1234',
                          avatar_url: '👧',
                          created_at: new Date().toISOString(),
                        });
                        setStep('pin');
                      }}
                      className="py-1.5 px-3 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs cursor-pointer"
                    >
                      ចូលរៀនជាគណនីសាកល្បង
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[280px] overflow-y-auto pr-1">
                    {gradeStudents.map((st) => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => {
                          sound.playPop();
                          setSelectedStudent(st);
                          setStep('pin');
                        }}
                        className="p-3.5 rounded-2xl border-2 border-slate-200/90 hover:border-amber-400 bg-white hover:bg-amber-50/60 shadow-2xs hover:shadow-xs transition-all flex flex-col items-center gap-2 cursor-pointer group text-center"
                      >
                        <span className="text-3xl group-hover:scale-110 transition-transform">
                          {st.avatar_url || '🎒'}
                        </span>
                        <span className="text-xs font-bold text-slate-900 line-clamp-1 font-khmer leading-snug">
                          {st.full_name}
                        </span>
                      </button>
                    ))}
                  </div>

                  <div className="pt-2 text-center border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => {
                        sound.playPop();
                        setIsRegisterModalOpen(true);
                      }}
                      className="text-xs font-semibold text-amber-700 hover:text-amber-900 hover:underline cursor-pointer"
                    >
                      ➕ មិនឃើញឈ្មោះរបស់អ្នក? ចុះឈ្មោះសិស្សថ្មីនៅទីនេះ
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: 4-DIGIT PIN ENTRY */}
          {step === 'pin' && selectedStudent && (
            <div className="space-y-5 animate-fade-in flex flex-col items-center">
              {/* Selected Student Banner */}
              <div className="w-full p-3.5 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{selectedStudent.avatar_url || '🎒'}</span>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 font-khmer">
                      {selectedStudent.full_name}
                    </h3>
                    <span className="text-[11px] text-amber-800 font-semibold font-khmer">
                      {selectedStudent.grade_name || selectedGrade?.name || 'ថ្នាក់រៀន'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    sound.playPop();
                    setStep('student');
                    setPin('');
                    setPinError(null);
                  }}
                  className="text-xs font-semibold text-amber-800 hover:text-amber-950 underline cursor-pointer"
                >
                  ប្តូរសិស្ស
                </button>
              </div>

              {/* PIN Indicator Dots */}
              <div className="flex justify-center items-center gap-4 py-3 bg-slate-50/80 rounded-2xl border border-slate-200/70 w-full">
                {[0, 1, 2, 3].map((index) => {
                  const hasDigit = pin.length > index;
                  return (
                    <div
                      key={index}
                      className={`w-7 h-7 rounded-full border-2 transition-all flex items-center justify-center ${
                        hasDigit
                          ? 'bg-amber-500 border-amber-600 scale-110 shadow-xs'
                          : 'bg-white border-slate-300'
                      }`}
                    >
                      {hasDigit && <span className="w-2.5 h-2.5 rounded-full bg-white block" />}
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
                    onClick={() => handleDigit(digit)}
                    className="py-3.5 rounded-2xl bg-white hover:bg-amber-50 text-slate-900 font-mono font-bold text-xl border border-slate-200/90 shadow-2xs hover:border-amber-400 active:translate-y-[1px] transition-all cursor-pointer"
                  >
                    {digit}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={handleClear}
                  className="py-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200 transition-colors cursor-pointer"
                >
                  សម្អាត
                </button>
                <button
                  type="button"
                  onClick={() => handleDigit('0')}
                  className="py-3.5 rounded-2xl bg-white hover:bg-amber-50 text-slate-900 font-mono font-bold text-xl border border-slate-200/90 shadow-2xs hover:border-amber-400 active:translate-y-[1px] transition-all cursor-pointer"
                >
                  0
                </button>
                <button
                  type="button"
                  onClick={handleBackspace}
                  className="py-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200 transition-colors cursor-pointer flex items-center justify-center"
                  title="លុប"
                  aria-label="លុប"
                >
                  <Delete className="w-4 h-4" />
                </button>
              </div>

              {/* Quick Demo PIN Helper */}
              <button
                type="button"
                onClick={() => {
                  sound.playPop();
                  const demoPin = selectedStudent.pin_code || '1234';
                  setPin(demoPin);
                  verifyPinSubmission(demoPin);
                }}
                className="text-xs font-semibold text-amber-800 hover:text-amber-950 underline text-center cursor-pointer transition-colors"
              >
                បញ្ចូល PIN ស្វ័យប្រវត្តិ (PIN: {selectedStudent.pin_code || '1234'})
              </button>

              {/* Status Alerts */}
              {isVerifying && (
                <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
                  <span>កំពុងផ្ទៀងផ្ទាត់លេខ PIN...</span>
                </div>
              )}

              {pinError && (
                <div
                  role="alert"
                  className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2 w-full animate-shake"
                >
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                  <span className="leading-relaxed font-khmer">{pinError}</span>
                </div>
              )}

              {pinSuccess && (
                <div
                  role="status"
                  className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2 w-full animate-fade-in"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="leading-relaxed font-khmer">
                    ចូលរៀនបានជោគជ័យ! កំពុងនាំទៅកាន់ថ្នាក់រៀនរបស់អ្នក...
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="mt-8 text-center text-xs text-slate-500 font-medium leading-relaxed font-khmer">
          កុមារឆ្លាត (SmartKids Cambodia) • វេទិកាអប់រំបឋមសិក្សាអន្តរកម្ម MoEYS
        </footer>

        {/* Student Self-Registration Modal */}
        <StudentSelfRegisterModal
          isOpen={isRegisterModalOpen}
          onClose={() => setIsRegisterModalOpen(false)}
          preSelectedGradeId={selectedGrade?.id}
          onSuccess={async (newStudent) => {
            setIsRegisterModalOpen(false);
            const loaded = await SupabaseService.getStudents();
            setStudents(loaded);
            setSelectedStudent(newStudent);
            setStep('pin');
          }}
        />
      </div>
    </div>
  );
}

export default DedicatedStudentLogin;
