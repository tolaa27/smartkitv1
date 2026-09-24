// src/components/teacher/StudentManagerModal.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  Plus,
  Users,
  KeyRound,
  Trash2,
  Eye,
  EyeOff,
  Check,
  Sparkles,
  AlertCircle,
  Loader2,
  Dice5,
  GraduationCap,
  Copy,
  Printer,
} from 'lucide-react';
import { Profile, Grade } from '@/lib/supabase/types';
import { SupabaseService } from '@/lib/supabase/service';
import { createStudentAccountAction } from '@/app/actions/teacherActions';
import { sound } from '@/utils/sound';

export interface StudentManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  grades: Grade[];
  onRefresh?: () => void;
}

const AVATAR_PRESETS = [
  '👧', '👦', '🧒', '🎒', '🌟', '🚀',
  '🐼', '🦁', '🐯', '🐘', '🐨', '🦄'
];

export function StudentManagerModal({
  isOpen,
  onClose,
  grades,
  onRefresh,
}: StudentManagerModalProps) {
  const [students, setStudents] = useState<Profile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedGradeFilter, setSelectedGradeFilter] = useState<string>('all');

  // Add Student Form State
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [gradeId, setGradeId] = useState<string>(grades[0]?.id || '');
  const [pinCode, setPinCode] = useState<string>('');
  const [avatar, setAvatar] = useState<string>(AVATAR_PRESETS[0]);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Visibility of PINs: studentId -> boolean
  const [visiblePins, setVisiblePins] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Cards print view modal state
  const [showPrintCards, setShowPrintCards] = useState<boolean>(false);

  const loadStudents = useCallback(async () => {
    setLoading(true);
    try {
      const data = await SupabaseService.getStudents();
      setStudents(data);
    } catch (err) {
      console.warn('[StudentManagerModal] Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadStudents();
      if (grades.length > 0 && !gradeId) {
        setGradeId(grades[0].id);
      }
    }
  }, [isOpen, loadStudents, grades, gradeId]);

  if (!isOpen) return null;

  const handleGenerateRandomPin = () => {
    sound.playPop();
    const randomPin = Math.floor(1000 + Math.random() * 9000).toString();
    setPinCode(randomPin);
  };

  const handleTogglePinVisibility = (studentId: string) => {
    sound.playPop();
    setVisiblePins((prev) => ({
      ...prev,
      [studentId]: !prev[studentId],
    }));
  };

  const handleCopyPin = (student: Profile) => {
    sound.playPop();
    if (student.pin_code) {
      navigator.clipboard.writeText(student.pin_code);
      setCopiedId(student.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('សូមបញ្ចូលឈ្មោះសិស្ស');
      return;
    }
    if (!gradeId) {
      setFormError('សូមជ្រើសរើសថ្នាក់រៀន');
      return;
    }
    if (!/^\d{4}$/.test(pinCode.trim())) {
      setFormError('លេខសម្ងាត់ PIN ត្រូវតែមាន ៤ ខ្ទង់ជាលេខគត់');
      return;
    }

    sound.playPop();
    setIsSubmitting(true);
    setFormError(null);

    try {
      const result = await createStudentAccountAction({
        full_name: name.trim(),
        grade_id: gradeId,
        pin_code: pinCode.trim(),
        avatar_url: avatar,
        created_by: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', // Current Teacher Sokha
      });

      if (!result.success) {
        setFormError(result.error || 'មានបញ្ហាក្នុងការបង្កើតគណនី');
        setIsSubmitting(false);
        return;
      }

      sound.playSuccessChime();
      setName('');
      setPinCode('');
      setIsAdding(false);
      setIsSubmitting(false);
      loadStudents();
      if (onRefresh) onRefresh();
    } catch {
      setFormError('មានបញ្ហាក្នុងការបញ្ជូនទិន្នន័យ');
      setIsSubmitting(false);
    }
  };

  const handleDeleteStudent = async (studentId: string, studentName: string) => {
    sound.playPop();
    if (confirm(`តើអ្នកពិតជាចង់លុបគណនីសិស្ស «${studentName}» មែនទេ?`)) {
      try {
        await fetch(`/api/teacher/students?id=${studentId}`, { method: 'DELETE' });
        sound.playSuccessChime();
        loadStudents();
        if (onRefresh) onRefresh();
      } catch {
        alert('មិនអាចលុបគណនីបានទេ');
      }
    }
  };

  const filteredStudents = students.filter((st) => {
    if (selectedGradeFilter === 'all') return true;
    return st.grade_id === selectedGradeFilter;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-3xl w-full max-h-[88vh] flex flex-col overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-linear-to-r from-indigo-600 via-indigo-700 to-indigo-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-xl shadow-2xs">
              🎒
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold leading-tight">
                  គ្រប់គ្រងគណនីសិស្ស (Manage Students)
                </h2>
                <span className="text-[11px] font-semibold bg-white/20 px-2 py-0.5 rounded-full">
                  {students.length} នាក់
                </span>
              </div>
              <p className="text-xs text-indigo-100 font-normal">
                បង្កើតគណនីសិស្ស ផ្ដល់លេខ PIN ៤ ខ្ទង់ និងបែងចែកតាមថ្នាក់រៀន
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                sound.playPop();
                setShowPrintCards(!showPrintCards);
              }}
              className="hidden sm:inline-flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>ប័ណ្ណ PIN សិស្ស</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Top Controls: Filter by Grade + Add Student Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-semibold text-slate-500 mr-1 flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5" />
                <span>ថ្នាក់ ៖</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  sound.playPop();
                  setSelectedGradeFilter('all');
                }}
                className={`py-1 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedGradeFilter === 'all'
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                ទាំងអស់ ({students.length})
              </button>
              {grades.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => {
                    sound.playPop();
                    setSelectedGradeFilter(g.id);
                  }}
                  className={`py-1 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedGradeFilter === g.id
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {g.name}
                </button>
              ))}
            </div>

            {!isAdding && (
              <button
                type="button"
                onClick={() => {
                  sound.playPop();
                  setIsAdding(true);
                  handleGenerateRandomPin();
                }}
                className="py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-all cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>បន្ថែមសិស្សថ្មី (Add Student)</span>
              </button>
            )}
          </div>

          {/* Add Student Form */}
          {isAdding && (
            <form
              onSubmit={handleCreateStudent}
              className="p-4 sm:p-5 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-4 animate-fade-in"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span>បង្កើតគណនីសិស្សថ្មី</span>
                </span>
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Student Full Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ឈ្មោះសិស្ស (Student Name) *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="ឧទាហរណ៍ ៖ ចរិយា (Chariya)"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-indigo-200 bg-white font-khmer text-xs focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                {/* Assigned Grade */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    កម្រិតថ្នាក់ (Assigned Grade) *
                  </label>
                  <select
                    value={gradeId}
                    onChange={(e) => setGradeId(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-indigo-200 bg-white font-khmer text-xs focus:ring-2 focus:ring-indigo-500/20"
                  >
                    {grades.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Avatar Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  ជ្រើសរើសរូបតំណាងសិស្ស (Avatar)
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  {AVATAR_PRESETS.map((av) => (
                    <button
                      key={av}
                      type="button"
                      onClick={() => {
                        sound.playPop();
                        setAvatar(av);
                      }}
                      className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center border-2 transition-transform cursor-pointer ${
                        avatar === av
                          ? 'border-indigo-600 bg-white scale-110 shadow-xs'
                          : 'border-slate-200 bg-slate-50 hover:bg-white'
                      }`}
                    >
                      {av}
                    </button>
                  ))}
                </div>
              </div>

              {/* 4-digit PIN Code */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    លេខសម្ងាត់ PIN ៤ ខ្ទង់ (4-Digit PIN) *
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateRandomPin}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-700 hover:text-indigo-900 cursor-pointer"
                  >
                    <Dice5 className="w-3.5 h-3.5" />
                    <span>បង្កើតចៃដន្យ (Random)</span>
                  </button>
                </div>

                <div className="relative max-w-xs">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    maxLength={4}
                    required
                    pattern="\d{4}"
                    value={pinCode}
                    onChange={(e) => setPinCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder="1234"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-indigo-300 bg-white font-mono font-bold text-sm tracking-widest text-slate-900 focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  សិស្សនឹងប្រើលេខកូដនេះដើម្បីចូលរៀននៅលើទំព័រ /login/student
                </span>
              </div>

              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="py-2 px-4 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-white cursor-pointer"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="py-2 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Check className="w-3.5 h-3.5" />
                  )}
                  <span>រក្សាទុកគណនីសិស្ស</span>
                </button>
              </div>
            </form>
          )}

          {/* Student Printable Cards View */}
          {showPrintCards && (
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-amber-950">
                    ប័ណ្ណព័ត៌មានចូលរៀនសម្រាប់សិស្ស (Student Login Cards)
                  </h3>
                  <p className="text-[11px] text-amber-800">
                    អាចព្រីន (Print) ឬកត់ចែកជូនកូនសិស្ស និងអាណាព្យាបាល
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="py-1.5 px-3 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center gap-1"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>បោះពុម្ព (Print)</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {filteredStudents.map((st) => (
                  <div
                    key={st.id}
                    className="p-3 bg-white rounded-xl border border-amber-200 shadow-2xs flex flex-col items-center text-center space-y-1"
                  >
                    <span className="text-2xl">{st.avatar_url || '🎒'}</span>
                    <span className="text-xs font-bold text-slate-900 line-clamp-1">{st.full_name}</span>
                    <span className="text-[10px] text-slate-500">{st.grade_name || 'ថ្នាក់រៀន'}</span>
                    <div className="mt-1 px-2 py-0.5 bg-amber-100 text-amber-900 font-mono font-bold text-xs rounded-md">
                      PIN: {st.pin_code || '1234'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Students List */}
          {loading ? (
            <div className="py-12 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
              <span>កំពុងទាញយកបញ្ជីសិស្ស...</span>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center text-2xl mx-auto">
                🎒
              </div>
              <p className="text-sm font-bold text-slate-700">មិនទាន់មានសិស្សនៅក្នុងថ្នាក់នេះទេ</p>
              <button
                type="button"
                onClick={() => {
                  sound.playPop();
                  setIsAdding(true);
                  handleGenerateRandomPin();
                }}
                className="py-2 px-4 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-xs hover:bg-indigo-700"
              >
                បន្ថែមសិស្សដំបូងឥឡូវនេះ
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredStudents.map((st) => {
                const isPinVisible = !!visiblePins[st.id];
                return (
                  <div
                    key={st.id}
                    className="p-3.5 rounded-2xl border border-slate-200/90 hover:border-indigo-300 bg-white shadow-2xs hover:shadow-xs transition-all flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-2xl shrink-0">
                        {st.avatar_url || '🎒'}
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-1">
                          {st.full_name}
                        </h4>
                        <span className="text-[11px] text-indigo-600 font-semibold block">
                          {st.grade_name || 'ថ្នាក់រៀន'}
                        </span>

                        {/* PIN Code Badge with Reveal Toggle */}
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-[10px] text-slate-400 font-semibold">PIN:</span>
                          <span className="font-mono font-bold text-xs text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded-md">
                            {isPinVisible ? st.pin_code || '1234' : '••••'}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleTogglePinVisibility(st.id)}
                            className="text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                            title={isPinVisible ? 'លាក់លេខ PIN' : 'បង្ហាញលេខ PIN'}
                          >
                            {isPinVisible ? (
                              <EyeOff className="w-3 h-3" />
                            ) : (
                              <Eye className="w-3 h-3" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCopyPin(st)}
                            className="text-slate-400 hover:text-indigo-600 p-0.5 cursor-pointer ml-0.5"
                            title="ចម្លង PIN"
                          >
                            {copiedId === st.id ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <button
                      type="button"
                      onClick={() => handleDeleteStudent(st.id, st.full_name)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer shrink-0"
                      title="លុបគណនីសិស្ស"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-khmer">
            លេខកូដ PIN អាចប្រើបានគ្រប់ពេលដោយកូនសិស្ស
          </span>
          <button
            type="button"
            onClick={onClose}
            className="py-2 px-5 rounded-2xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs transition-colors cursor-pointer"
          >
            រួចរាល់ (Close)
          </button>
        </div>
      </div>
    </div>
  );
}

export default StudentManagerModal;
