// src/components/curriculum/DashboardHeader.tsx
'use client';

import React from 'react';
import { Grade, Subject } from '@/types/curriculum';
import { sound } from '@/utils/sound';
import {
  Star,
  Volume2,
  VolumeX,
  ArrowLeft,
  Sparkles,
  BookOpen,
  Calculator,
  Compass,
  Users,
} from 'lucide-react';

interface Props {
  selectedGrade: Grade;
  onSelectGrade: (grade: Grade) => void;
  selectedSubject: Subject;
  onSelectSubject: (subject: Subject) => void;
  totalStars: number;
  totalGems: number;
  soundMuted: boolean;
  onToggleSound: () => void;
  onExit: () => void;
}

export const DashboardHeader: React.FC<Props> = ({
  selectedGrade,
  onSelectGrade,
  selectedSubject,
  onSelectSubject,
  totalStars,
  totalGems,
  soundMuted,
  onToggleSound,
  onExit,
}) => {
  const subjects: { id: Subject; labelKh: string; icon: any; color: string }[] = [
    { id: 'math', labelKh: 'គណិតវិទ្យា', icon: Calculator, color: 'from-amber-400 to-yellow-400 text-amber-950 border-amber-500' },
    { id: 'khmer', labelKh: 'ភាសាខ្មែរ', icon: BookOpen, color: 'from-blue-600 to-sky-500 text-white border-blue-700' },
    { id: 'science', labelKh: 'វិទ្យាសាស្ត្រ', icon: Compass, color: 'from-emerald-500 to-teal-500 text-white border-emerald-600' },
    { id: 'social', labelKh: 'សិក្សាសង្គម', icon: Users, color: 'from-purple-500 to-indigo-500 text-white border-purple-600' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#FFFDF7]/95 backdrop-blur-md border-b-4 border-amber-300 shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-3 space-y-3">
        {/* Top Row: Back CTA, Grade Switcher, Stats & Sound */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Back to Hub / Home */}
          <button
            onClick={() => {
              sound.playPop();
              onExit();
            }}
            className="px-3.5 py-2 rounded-2xl bg-amber-100 hover:bg-amber-200 text-amber-950 font-black text-xs sm:text-sm border-2 border-amber-300 transition-all flex items-center gap-1.5 shadow-xs"
            title="ចាកចេញត្រឡប់ទៅទំព័រដើម (Back to Hub)"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-khmer">ទំព័រដើម</span>
          </button>

          {/* Grade Switcher Toggle: ថ្នាក់ទី ១ / ថ្នាក់ទី ២ */}
          <div className="bg-[#FFF8E7] p-1 rounded-2xl border-2 border-amber-300 shadow-inner flex items-center gap-1">
            {([1, 2] as const).map(g => {
              const isSelected = selectedGrade === g;
              return (
                <button
                  key={g}
                  onClick={() => {
                    sound.playPop();
                    onSelectGrade(g);
                  }}
                  className={`px-4 py-2 rounded-xl font-heading text-xs sm:text-sm font-black transition-all select-none flex items-center gap-1.5 ${
                    isSelected
                      ? g === 1
                        ? 'bg-emerald-500 text-white shadow-[0_4px_0_#059669] -translate-y-0.5'
                        : 'bg-amber-500 text-amber-950 shadow-[0_4px_0_#D97706] -translate-y-0.5'
                      : 'bg-white hover:bg-amber-100/70 text-slate-700'
                  }`}
                >
                  <span>{g === 1 ? '🌱' : '🌟'}</span>
                  <span>ថ្នាក់ទី {g}</span>
                  {isSelected && <Sparkles className="w-3 h-3 animate-spin text-yellow-200" />}
                </button>
              );
            })}
          </div>

          {/* Gamified Stats & Sound Toggle */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Stars Pill */}
            <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-2xl border border-amber-200 text-amber-700 font-black text-xs sm:text-sm shadow-xs">
              <Star className="w-4 h-4 fill-amber-400 text-amber-500 animate-pulse" />
              <span>{totalStars}</span>
            </div>

            {/* Gems Pill */}
            <div className="flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-2xl border border-emerald-200 text-emerald-800 font-black text-xs sm:text-sm shadow-xs">
              <span>💎</span>
              <span>{totalGems.toLocaleString()}</span>
            </div>

            {/* Sound Toggle Button */}
            <button
              onClick={onToggleSound}
              className={`p-2.5 rounded-2xl border-2 transition-colors ${
                soundMuted
                  ? 'bg-rose-50 text-rose-600 border-rose-200'
                  : 'bg-gradient-to-tr from-blue-600 to-sky-400 text-white border-blue-700 shadow-sm'
              }`}
              title={soundMuted ? 'បើកសំឡេង (Unmute)' : 'បិទសំឡេង (Mute)'}
            >
              {soundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Bottom Row: Subject Filter Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {subjects.map(subj => {
            const isSelected = selectedSubject === subj.id;
            const Icon = subj.icon;
            return (
              <button
                key={subj.id}
                onClick={() => {
                  sound.playPop();
                  onSelectSubject(subj.id);
                }}
                className={`min-h-[48px] py-2.5 px-3 rounded-2xl font-heading text-xs sm:text-sm font-black transition-all btn-squishy flex items-center justify-center gap-2 select-none border-b-4 ${
                  isSelected
                    ? `bg-gradient-to-r ${subj.color} shadow-md -translate-y-1`
                    : 'bg-white hover:bg-amber-50/80 text-slate-800 border-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{subj.labelKh}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
