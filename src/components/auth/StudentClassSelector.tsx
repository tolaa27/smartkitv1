// src/components/auth/StudentClassSelector.tsx
'use client';

import React, { useState } from 'react';
import { Sparkles, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { sound } from '@/utils/sound';

export interface StudentClassSelectorProps {
  onBack: () => void;
  onSelectStudent: (student: { nickname: string; avatarId: string; gradeLevel: 1 | 2 | 3 }) => void;
}

interface ClassOption {
  gradeLevel: 1 | 2 | 3;
  nameKhmer: string;
  nameEnglish: string;
  icon: string;
  badgeColor: string;
  borderColor: string;
  bgColor: string;
  students: { nickname: string; avatar: string; avatarId: string }[];
}

const CLASS_OPTIONS: ClassOption[] = [
  {
    gradeLevel: 1,
    nameKhmer: 'ថ្នាក់ទី ១',
    nameEnglish: 'Grade 1',
    icon: '🌱',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    borderColor: 'border-emerald-300 hover:border-emerald-500',
    bgColor: 'bg-emerald-50/50',
    students: [
      { nickname: 'ចរិយា (Chariya)', avatar: '👧', avatarId: 'avatar-girl-1' },
      { nickname: 'សុខុម (Sokhum)', avatar: '👦', avatarId: 'avatar-boy-1' },
      { nickname: 'មុន្នី (Monny)', avatar: '🧒', avatarId: 'avatar-kid-1' },
    ],
  },
  {
    gradeLevel: 2,
    nameKhmer: 'ថ្នាក់ទី ២',
    nameEnglish: 'Grade 2',
    icon: '🌟',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    borderColor: 'border-amber-300 hover:border-amber-500',
    bgColor: 'bg-amber-50/50',
    students: [
      { nickname: 'តារា (Dara)', avatar: '👦', avatarId: 'avatar-boy-2' },
      { nickname: 'បុប្ផា (Bopha)', avatar: '👧', avatarId: 'avatar-girl-2' },
      { nickname: 'ពិសិដ្ឋ (Piseth)', avatar: '🧒', avatarId: 'avatar-kid-2' },
    ],
  },
  {
    gradeLevel: 3,
    nameKhmer: 'ថ្នាក់ទី ៣',
    nameEnglish: 'Grade 3',
    icon: '🚀',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    borderColor: 'border-blue-300 hover:border-blue-500',
    bgColor: 'bg-blue-50/50',
    students: [
      { nickname: 'វិបុល (Vibol)', avatar: '👦', avatarId: 'avatar-boy-3' },
      { nickname: 'កល្យាណ (Kalyan)', avatar: '👧', avatarId: 'avatar-girl-3' },
      { nickname: 'រស្មី (Rasmey)', avatar: '🧒', avatarId: 'avatar-kid-3' },
    ],
  },
];

export function StudentClassSelector({ onBack, onSelectStudent }: StudentClassSelectorProps) {
  const [selectedGrade, setSelectedGrade] = useState<1 | 2 | 3>(1);
  const [selectedAvatar, setSelectedAvatar] = useState<{ nickname: string; avatar: string; avatarId: string } | null>(
    CLASS_OPTIONS[0].students[0]
  );
  const [success, setSuccess] = useState(false);

  const currentClass = CLASS_OPTIONS.find((c) => c.gradeLevel === selectedGrade) || CLASS_OPTIONS[0];

  const handleConfirm = () => {
    if (!selectedAvatar) return;
    sound.playSuccessChime();
    setSuccess(true);
    setTimeout(() => {
      onSelectStudent({
        nickname: selectedAvatar.nickname,
        avatarId: selectedAvatar.avatarId,
        gradeLevel: selectedGrade,
      });
    }, 600);
  };

  return (
    <div className="w-full max-w-lg flex flex-col items-center">
      {/* Header Branding */}
      <div className="text-center mb-6 flex flex-col items-center">
        <div
          className="w-14 h-14 rounded-2xl bg-linear-to-tr from-amber-400 via-amber-500 to-yellow-400 border border-amber-300 shadow-md flex items-center justify-center text-3xl mb-3 animate-bounce"
          aria-hidden="true"
        >
          🎒
        </div>
        <div className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-semibold border border-slate-200 shadow-2xs mb-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span>សម្រាប់សិស្ស • Select Class & Avatar</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-[1.65] py-1">
          ចូលរៀនតាមថ្នាក់
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 font-normal leading-[1.75]">
          សូមជ្រើសរើសកម្រិតថ្នាក់ និងរូបតំណាងរបស់អ្នក
        </p>
      </div>

      {/* Symmetrical White Card */}
      <div className="bg-white rounded-2xl md:rounded-[24px] border border-slate-200/80 p-6 sm:p-7 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] w-full flex flex-col gap-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <span className="text-xs font-semibold text-slate-500">
            ជំហានទី ១ ៖ ជ្រើសរើសថ្នាក់រៀន
          </span>
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer rounded-md px-1.5 py-0.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>ថយក្រោយ</span>
          </button>
        </div>

        {/* Grade Buttons */}
        <div className="grid grid-cols-3 gap-2.5">
          {CLASS_OPTIONS.map((c) => {
            const isSelected = selectedGrade === c.gradeLevel;
            return (
              <button
                key={c.gradeLevel}
                type="button"
                onClick={() => {
                  sound.playPop();
                  setSelectedGrade(c.gradeLevel);
                  setSelectedAvatar(c.students[0]);
                }}
                className={`p-3 rounded-2xl border-2 transition-all flex flex-col items-center gap-1 text-center cursor-pointer ${
                  isSelected
                    ? `${c.borderColor} ${c.bgColor} shadow-sm scale-102 font-bold`
                    : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                }`}
              >
                <span className="text-2xl">{c.icon}</span>
                <span className="text-xs font-bold text-slate-900 leading-tight">{c.nameKhmer}</span>
                <span className="text-[10px] text-slate-500">{c.nameEnglish}</span>
              </button>
            );
          })}
        </div>

        {/* Step 2: Choose Avatar */}
        <div className="pt-2">
          <span className="text-xs font-semibold text-slate-500 block mb-2.5">
            ជំហានទី ២ ៖ ជ្រើសរើសឈ្មោះ ឬរូបរបស់អ្នក
          </span>
          <div className="grid grid-cols-3 gap-3">
            {currentClass.students.map((st) => {
              const isSelected = selectedAvatar?.nickname === st.nickname;
              return (
                <button
                  key={st.nickname}
                  type="button"
                  onClick={() => {
                    sound.playPop();
                    setSelectedAvatar(st);
                  }}
                  className={`p-3 rounded-2xl border-2 flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                    isSelected
                      ? 'border-amber-500 bg-amber-50/80 shadow-sm scale-105'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <span className="text-3xl">{st.avatar}</span>
                  <span className="text-xs font-semibold text-slate-800 text-center line-clamp-1">
                    {st.nickname}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {success && (
          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>ស្វាគមន៍ {selectedAvatar?.nickname}! កំពុងចូលរៀន...</span>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="button"
          onClick={handleConfirm}
          disabled={!selectedAvatar}
          className="w-full py-3.5 rounded-2xl bg-linear-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <span>ចូលរៀនឥឡូវនេះ (Start Learning)</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <footer className="mt-8 text-center text-xs text-slate-500 font-medium leading-[1.75]">
        កុមារឆ្លាត (SmartKids Cambodia) • ងាយស្រួលសម្រាប់កុមារតូចៗ
      </footer>
    </div>
  );
}

export default StudentClassSelector;
