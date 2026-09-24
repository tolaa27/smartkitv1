// src/components/auth/StudentSelfRegisterModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  X,
  User,
  Sparkles,
  KeyRound,
  GraduationCap,
  Users,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Dice5,
  Loader2,
  ArrowRight,
  ShieldCheck,
  IdCard,
} from 'lucide-react';
import { Grade, Profile } from '@/lib/supabase/types';
import { SupabaseService } from '@/lib/supabase/service';
import { createStudentAccountAction } from '@/app/actions/teacherActions';
import { useEdTech } from '@/context/EdTechContext';
import { sound } from '@/utils/sound';

export interface StudentSelfRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  preSelectedGradeId?: string;
  onSuccess?: (newStudent: Profile) => void;
}

const AVATAR_PRESETS = [
  '👧', '👦', '🧒', '🎒', '🌟', '🚀',
  '🐼', '🦁', '🦊', '🐯', '🐘', '🐨',
  '🦄', '🐰', '🐶', '🐱'
];

export function StudentSelfRegisterModal({
  isOpen,
  onClose,
  preSelectedGradeId,
  onSuccess,
}: StudentSelfRegisterModalProps) {
  const router = useRouter();
  const { loginAsStudent } = useEdTech();

  // Data sources
  const [grades, setGrades] = useState<Grade[]>([]);
  const [teachers, setTeachers] = useState<Profile[]>([]);
  const [loadingInitial, setLoadingInitial] = useState<boolean>(true);

  // Form Fields
  const [fullName, setFullName] = useState<string>('');
  const [avatar, setAvatar] = useState<string>(AVATAR_PRESETS[0]);
  const [customAvatarUrl, setCustomAvatarUrl] = useState<string>('');
  const [useCustomPhoto, setUseCustomPhoto] = useState<boolean>(false);
  const [gradeId, setGradeId] = useState<string>('');
  
  // Teacher selection mode: 'select' | 'manual-id'
  const [teacherMode, setTeacherMode] = useState<'select' | 'manual-id'>('select');
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('');
  const [manualTeacherId, setManualTeacherId] = useState<string>('');

  // 4-Digit PIN
  const [pinCode, setPinCode] = useState<string>('');
  const [showPin, setShowPin] = useState<boolean>(false);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [createdStudent, setCreatedStudent] = useState<Profile | null>(null);

  // Load Grades and Teachers
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    async function loadData() {
      setLoadingInitial(true);
      try {
        const [loadedGrades, loadedTeachers] = await Promise.all([
          SupabaseService.getGrades(),
          SupabaseService.getTeachers(),
        ]);

        if (isMounted) {
          setGrades(loadedGrades);
          setTeachers(loadedTeachers);

          if (preSelectedGradeId) {
            setGradeId(preSelectedGradeId);
          } else if (loadedGrades.length > 0) {
            setGradeId(loadedGrades[0].id);
          }

          if (loadedTeachers.length > 0) {
            setSelectedTeacherId(loadedTeachers[0].id);
          }
        }
      } catch (err) {
        console.warn('[StudentSelfRegisterModal] Error loading initial data:', err);
      } finally {
        if (isMounted) setLoadingInitial(false);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, [isOpen, preSelectedGradeId]);

  if (!isOpen) return null;

  // Handle PIN generation
  const handleRandomPin = () => {
    sound.playPop();
    const random = Math.floor(1000 + Math.random() * 9000).toString();
    setPinCode(random);
    setErrorMsg(null);
  };

  // Form Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    sound.playPop();
    setErrorMsg(null);

    // Validations
    if (!fullName.trim()) {
      sound.playErrorThud();
      setErrorMsg('សូមបញ្ចូលឈ្មោះពេញរបស់សិស្ស (Please enter student name)!');
      return;
    }

    if (!gradeId) {
      sound.playErrorThud();
      setErrorMsg('សូមជ្រើសរើសកម្រិតថ្នាក់ (Please select a grade)!');
      return;
    }

    if (!/^\d{4}$/.test(pinCode.trim())) {
      sound.playErrorThud();
      setErrorMsg('លេខសម្ងាត់ PIN ត្រូវតែមាន ៤ ខ្ទង់គត់ (PIN must be 4 digits)!');
      return;
    }

    // Determine Teacher ID
    let finalTeacherId = selectedTeacherId;
    if (teacherMode === 'manual-id') {
      const cleanManual = manualTeacherId.trim();
      if (!cleanManual) {
        sound.playErrorThud();
        setErrorMsg('សូមបញ្ចូល ID គ្រូបង្រៀន ឬលេខកូដថ្នាក់ (Please enter Teacher ID)!');
        return;
      }
      finalTeacherId = cleanManual;
    }

    if (!finalTeacherId && teachers.length > 0) {
      finalTeacherId = teachers[0].id;
    }

    const finalAvatar = useCustomPhoto && customAvatarUrl.trim()
      ? customAvatarUrl.trim()
      : avatar;

    setIsSubmitting(true);

    try {
      const res = await createStudentAccountAction({
        full_name: fullName.trim(),
        grade_id: gradeId,
        pin_code: pinCode.trim(),
        avatar_url: finalAvatar,
        created_by: finalTeacherId,
      });

      if (!res.success || !res.student) {
        throw new Error(res.error || 'បរាជ័យក្នុងការបង្កើតគណនីសិស្ស');
      }

      sound.playSuccessChime();

      const created: Profile = {
        id: res.student.id,
        full_name: res.student.full_name,
        role: 'student',
        pin_code: res.student.pin_code || pinCode.trim(),
        avatar_url: res.student.avatar_url || finalAvatar,
        grade_id: gradeId,
        created_by: finalTeacherId,
        created_at: res.student.created_at,
        grade_name: grades.find((g) => g.id === gradeId)?.name,
      };

      setCreatedStudent(created);

      if (onSuccess) {
        onSuccess(created);
      }
    } catch (err: any) {
      sound.playErrorThud();
      setErrorMsg(err.message || 'មានបញ្ហាក្នុងការបង្កើតគណនី សូមសាកល្បងម្ដងទៀត។');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Direct login after account creation
  const handleImmediateLogin = () => {
    if (!createdStudent) return;
    sound.playSuccessChime();

    // Store in cookie & EdTech context
    if (typeof document !== 'undefined') {
      document.cookie = `smartkids_role=student; path=/; max-age=${60 * 60 * 24 * 7}`;
    }

    loginAsStudent({
      id: createdStudent.id,
      nickname: createdStudent.full_name,
      avatarId: createdStudent.avatar_url || '👧',
      gradeLevel: 1,
    });

    onClose();
    router.push('/student/dashboard');
  };

  const selectedTeacher = teachers.find((t) => t.id === selectedTeacherId);
  const selectedGradeObj = grades.find((g) => g.id === gradeId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div
        style={{ fontFamily: "'Kantumruy Pro', 'Noto Sans Khmer', system-ui, sans-serif" }}
        className="bg-white rounded-3xl border border-slate-200/90 shadow-2xl w-full max-w-xl my-8 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header Bar */}
        <div className="bg-linear-to-r from-amber-400 via-amber-500 to-yellow-400 p-5 sm:p-6 text-slate-950 relative shrink-0">
          <button
            type="button"
            onClick={onClose}
            aria-label="បិទ"
            className="absolute top-4 right-4 p-2 rounded-full bg-black/10 hover:bg-black/20 text-slate-900 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3.5">
            <div className="w-13 h-13 rounded-2xl bg-white/90 shadow-sm flex items-center justify-center text-3xl shrink-0">
              🎒
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 bg-black/10 text-slate-950 px-2.5 py-0.5 rounded-full text-xs font-bold mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>ចុះឈ្មោះសិស្សថ្មី • New Student</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold leading-tight">
                បង្កើតគណនីសិស្សដោយខ្លួនឯង
              </h2>
              <p className="text-xs text-slate-800 mt-0.5">
                បំពេញព័ត៌មានខាងក្រោមដើម្បីទទួលបានលេខសម្ងាត់ PIN ចូលរៀន
              </p>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-slate-800">
          {createdStudent ? (
            /* SUCCESS CELEBRATION VIEW */
            <div className="py-4 text-center space-y-5 animate-scale-in">
              <div className="w-16 h-16 rounded-full bg-emerald-100 border-2 border-emerald-400 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-900 leading-snug">
                  អបអរសាទរ! គណនីរបស់អ្នកបានបង្កើតជោគជ័យ
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">
                  សូមកត់ត្រាលេខសម្ងាត់ PIN នេះទុក សម្រាប់ចូលរៀននៅថ្ងៃក្រោយ!
                </p>
              </div>

              {/* Student ID Card Badge Preview */}
              <div className="bg-linear-to-b from-amber-50 to-orange-50 border-2 border-amber-300 rounded-3xl p-5 shadow-sm max-w-sm mx-auto text-center space-y-3">
                <div className="w-20 h-20 rounded-2xl bg-white border-2 border-amber-300 shadow-md flex items-center justify-center text-4xl mx-auto overflow-hidden">
                  {createdStudent.avatar_url?.startsWith('http') ? (
                    <img
                      src={createdStudent.avatar_url}
                      alt={createdStudent.full_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{createdStudent.avatar_url || '🎒'}</span>
                  )}
                </div>

                <div>
                  <h4 className="font-bold text-lg text-slate-900">{createdStudent.full_name}</h4>
                  <p className="text-xs text-amber-800 font-semibold">
                    {createdStudent.grade_name || selectedGradeObj?.name}
                  </p>
                </div>

                <div className="bg-white rounded-2xl border border-amber-200 p-3 shadow-2xs">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    លេខកូដ PIN ចូលរៀន
                  </span>
                  <span className="text-3xl font-extrabold tracking-widest text-amber-600 block mt-0.5">
                    {createdStudent.pin_code}
                  </span>
                </div>

                <div className="text-[11px] text-slate-500 flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>
                    ភ្ជាប់ជាមួយ ៖{' '}
                    {selectedTeacher?.full_name || createdStudent.created_by?.slice(0, 8)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleImmediateLogin}
                  className="flex-1 py-3.5 px-5 rounded-2xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <span>ចូលរៀនភ្លាមៗ</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="py-3.5 px-5 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-sm transition-colors cursor-pointer"
                >
                  ត្រឡប់ក្រោយ
                </button>
              </div>
            </div>
          ) : (
            /* REGISTRATION FORM */
            <form onSubmit={handleSubmit} className="space-y-5">
              {errorMsg && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* 1. STUDENT FULL NAME */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  ១. ឈ្មោះពេញរបស់សិស្ស <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="ឧ. សុខ វិសាល / Visal"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                  />
                </div>
              </div>

              {/* 2. PROFILE AVATAR PICKER */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-800">
                    ២. រូបតំណាង Profile <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      sound.playPop();
                      setUseCustomPhoto(!useCustomPhoto);
                    }}
                    className="text-[11px] font-semibold text-amber-700 hover:underline cursor-pointer"
                  >
                    {useCustomPhoto ? 'ប្រើរូប Emoji វិញ' : 'បញ្ចូលរូបភាពតាម URL'}
                  </button>
                </div>

                {useCustomPhoto ? (
                  <div className="space-y-2">
                    <input
                      type="url"
                      value={customAvatarUrl}
                      onChange={(e) => setCustomAvatarUrl(e.target.value)}
                      placeholder="https://example.com/my-photo.jpg"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-amber-500"
                    />
                    {customAvatarUrl && (
                      <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-50 border border-slate-200">
                        <img
                          src={customAvatarUrl}
                          alt="Preview"
                          className="w-10 h-10 rounded-full object-cover border border-slate-300"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                        <span className="text-xs text-slate-600">រូបភាព Profile មើលជាមុន</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-8 gap-2 bg-slate-50/80 p-3 rounded-2xl border border-slate-200/80">
                    {AVATAR_PRESETS.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => {
                          sound.playPop();
                          setAvatar(item);
                        }}
                        className={`h-11 rounded-xl text-2xl flex items-center justify-center transition-all cursor-pointer ${
                          avatar === item
                            ? 'bg-amber-400 shadow-md scale-110 ring-2 ring-amber-500 ring-offset-1'
                            : 'bg-white hover:bg-amber-100 hover:scale-105 border border-slate-200/60'
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 3. GRADE LEVEL SELECTION */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  ៣. ជ្រើសរើសកម្រិតថ្នាក់ <span className="text-rose-500">*</span>
                </label>
                {loadingInitial ? (
                  <div className="p-4 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                    <span>កំពុងទាញយកបញ្ជីថ្នាក់រៀន...</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2.5">
                    {grades.map((g) => {
                      const isSelected = gradeId === g.id;
                      return (
                        <button
                          key={g.id}
                          type="button"
                          onClick={() => {
                            sound.playPop();
                            setGradeId(g.id);
                          }}
                          className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                            isSelected
                              ? 'border-amber-500 bg-amber-50/80 text-amber-950 font-bold shadow-xs'
                              : 'border-slate-200/90 bg-white hover:border-slate-300 text-slate-700'
                          }`}
                        >
                          <div
                            className={`w-8 h-8 rounded-xl flex items-center justify-center text-base shrink-0 ${
                              isSelected ? 'bg-amber-400 text-slate-950' : 'bg-slate-100'
                            }`}
                          >
                            <GraduationCap className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <span className="block text-xs font-bold truncate leading-tight">
                              {g.name}
                            </span>
                            <span className="block text-[10px] text-slate-500 truncate mt-0.5">
                              {g.description || 'MoEYS'}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 4. TEACHER LINKING (Select or Enter Teacher ID) */}
              <div className="bg-slate-50/80 rounded-2xl border border-slate-200/80 p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-amber-600" />
                    <span>៤. ភ្ជាប់ជាមួយគ្រូបង្រៀន (Teacher ID)</span>
                  </label>
                  <div className="inline-flex rounded-lg bg-slate-200/80 p-0.5 text-[11px] font-semibold">
                    <button
                      type="button"
                      onClick={() => setTeacherMode('select')}
                      className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                        teacherMode === 'select'
                          ? 'bg-white text-slate-900 shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      ជ្រើសរើសគ្រូ
                    </button>
                    <button
                      type="button"
                      onClick={() => setTeacherMode('manual-id')}
                      className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                        teacherMode === 'manual-id'
                          ? 'bg-white text-slate-900 shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      បញ្ចូល ID គ្រូ
                    </button>
                  </div>
                </div>

                {teacherMode === 'select' ? (
                  <div>
                    <select
                      value={selectedTeacherId}
                      onChange={(e) => setSelectedTeacherId(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-hidden focus:border-amber-500"
                    >
                      {teachers.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.full_name} ({t.avatar_url || '👩‍🏫'})
                        </option>
                      ))}
                    </select>
                    <p className="text-[11px] text-slate-500 mt-1">
                      សិស្សនឹងត្រូវបានចាត់ចែងក្នុងបញ្ជីថ្នាក់របស់គ្រូនេះដោយស្វ័យប្រវត្តិ។
                    </p>
                  </div>
                ) : (
                  <div>
                    <div className="relative">
                      <IdCard className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={manualTeacherId}
                        onChange={(e) => setManualTeacherId(e.target.value)}
                        placeholder="បញ្ចូល UUID គ្រូបង្រៀន ឬលេខកូដថ្នាក់ (Teacher ID)"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-mono text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-amber-500"
                      />
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">
                      អ្នកអាចសួររក Teacher ID ពីលោកគ្រូ ឬអ្នកគ្រូរបស់អ្នក (ឧ. aaaaaaaa-aaaa-...)
                    </p>
                  </div>
                )}
              </div>

              {/* 5. 4-DIGIT PIN CODE */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-800">
                    ៥. កំណត់លេខកូដសម្ងាត់ PIN ៤ ខ្ទង់ <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleRandomPin}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 px-2 py-0.5 rounded-lg border border-amber-200 transition-colors cursor-pointer"
                  >
                    <Dice5 className="w-3.5 h-3.5" />
                    <span>បង្កើតចៃដន្យ</span>
                  </button>
                </div>

                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPin ? 'text' : 'password'}
                    maxLength={4}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={pinCode}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                      setPinCode(val);
                      setErrorMsg(null);
                    }}
                    placeholder="1 2 3 4"
                    className="w-full pl-10 pr-12 py-2.5 rounded-xl border border-slate-200 bg-white text-base tracking-widest font-mono text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-amber-500 focus:ring-2 focus:ring-amber-200 text-center font-bold"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    aria-label={showPin ? 'លាក់លេខ PIN' : 'បង្ហាញលេខ PIN'}
                  >
                    {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  សូមជ្រើសរើសលេខ ៤ ខ្ទង់ងាយស្រួលចាំ (ឧ. 1234, 7890) សម្រាប់ចូលរៀន។
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="flex-1 py-3 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-2 py-3 px-4 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>កំពុងបង្កើតគណនី...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>បង្កើតគណនីសិស្សភ្លាមៗ</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
