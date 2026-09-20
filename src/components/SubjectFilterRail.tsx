// src/components/SubjectFilterRail.tsx
'use client';

import React from 'react';
import { sound } from '@/utils/sound';
import { Subject } from '@/types/curriculum';
import { Calculator, BookOpen, Compass, Sparkles, Layers } from 'lucide-react';

export type SubjectFilterOption = 'all' | Subject;

interface SubjectFilterRailProps {
  selectedSubject: SubjectFilterOption;
  onSelectSubject: (subject: SubjectFilterOption) => void;
  lessonCounts: Record<SubjectFilterOption, number>;
}

interface SubjectCardConfig {
  id: SubjectFilterOption;
  nameKh: string;
  nameEn: string;
  descKh: string;
  icon: string;
  iconBg: string;
  activeBorder: string;
  activeShadow: string;
  activeBg: string;
  badgeColor: string;
}

const SUBJECT_CONFIGS: SubjectCardConfig[] = [
  {
    id: 'all',
    nameKh: 'មេរៀនទាំងអស់',
    nameEn: 'All Lessons',
    descKh: 'កម្មវិធីសិក្សាជាតិ MoEYS',
    icon: '📚',
    iconBg: 'bg-amber-100 text-amber-900 border-amber-300',
    activeBorder: 'border-amber-500',
    activeShadow: 'shadow-[0_6px_0_#D97706]',
    activeBg: 'bg-amber-50/90',
    badgeColor: 'bg-amber-200 text-amber-950',
  },
  {
    id: 'math',
    nameKh: 'គណិតវិទ្យា',
    nameEn: 'Math CRA Engine',
    descKh: 'រាប់លេខ បូកដក ធរណីមាត្រ',
    icon: '🧮',
    iconBg: 'bg-blue-100 text-blue-900 border-blue-300',
    activeBorder: 'border-blue-600',
    activeShadow: 'shadow-[0_6px_0_#2563EB]',
    activeBg: 'bg-blue-50/90',
    badgeColor: 'bg-blue-200 text-blue-950',
  },
  {
    id: 'khmer',
    nameKh: 'ភាសាខ្មែរ',
    nameEn: 'Khmer Phonics & Sentence',
    descKh: 'ព្យញ្ជនៈ ស្រៈ ផ្គុំពាក្យ',
    icon: '🇰🇭',
    iconBg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    activeBorder: 'border-emerald-600',
    activeShadow: 'shadow-[0_6px_0_#059669]',
    activeBg: 'bg-emerald-50/90',
    badgeColor: 'bg-emerald-200 text-emerald-950',
  },
  {
    id: 'science',
    nameKh: 'វិទ្យាសាស្ត្រ',
    nameEn: 'Nature & Science Discovery',
    descKh: 'រុក្ខជាតិ សត្វ បរិស្ថាន',
    icon: '🔬',
    iconBg: 'bg-teal-100 text-teal-900 border-teal-300',
    activeBorder: 'border-teal-600',
    activeShadow: 'shadow-[0_6px_0_#0D9488]',
    activeBg: 'bg-teal-50/90',
    badgeColor: 'bg-teal-200 text-teal-950',
  },
  {
    id: 'social',
    nameKh: 'សិក្សាសង្គម',
    nameEn: 'Social Studies & Moral',
    descKh: 'ទិស សុវត្ថិភាព សីលធម៌',
    icon: '🧭',
    iconBg: 'bg-purple-100 text-purple-900 border-purple-300',
    activeBorder: 'border-purple-600',
    activeShadow: 'shadow-[0_6px_0_#9333EA]',
    activeBg: 'bg-purple-50/90',
    badgeColor: 'bg-purple-200 text-purple-950',
  },
];

export const SubjectFilterRail: React.FC<SubjectFilterRailProps> = ({
  selectedSubject,
  onSelectSubject,
  lessonCounts,
}) => {
  const handleSelect = (cfg: SubjectCardConfig) => {
    sound.playPop();
    onSelectSubject(cfg.id);
    sound.speakKhmer(cfg.nameKh);
  };

  return (
    <div className="w-full">
      {/* Horizontal Scrollable Rail with Clean Tactile Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {SUBJECT_CONFIGS.map(cfg => {
          const isSelected = selectedSubject === cfg.id;
          const count = lessonCounts[cfg.id] || 0;

          return (
            <button
              key={cfg.id}
              type="button"
              onClick={() => handleSelect(cfg)}
              className={`p-3.5 sm:p-4 rounded-3xl border-3 text-left transition-all btn-squishy cursor-pointer select-none relative flex flex-col justify-between ${
                isSelected
                  ? `${cfg.activeBg} ${cfg.activeBorder} ${cfg.activeShadow} -translate-y-1 scale-[1.02]`
                  : 'bg-white hover:bg-amber-50/60 border-amber-200 hover:border-amber-300 shadow-sm'
              }`}
              aria-pressed={isSelected}
            >
              {/* Top Row: 3D Icon Badge + Count Pill */}
              <div className="flex items-center justify-between mb-3 w-full">
                <div
                  className={`w-12 h-12 rounded-2xl border-2 flex items-center justify-center text-2xl shadow-xs transition-transform ${
                    cfg.iconBg
                  } ${isSelected ? 'scale-110' : ''}`}
                >
                  <span>{cfg.icon}</span>
                </div>

                <span
                  className={`text-xs font-black font-mono px-2.5 py-1 rounded-full border border-black/5 ${cfg.badgeColor}`}
                >
                  {count} មេរៀន
                </span>
              </div>

              {/* Bottom Row: Subject Title and Description */}
              <div>
                <h3 className="font-heading font-black text-slate-900 text-sm sm:text-base leading-tight font-khmer">
                  {cfg.nameKh}
                </h3>
                <p className="text-[11px] text-slate-500 font-semibold font-khmer line-clamp-1 mt-0.5">
                  {cfg.descKh}
                </p>
              </div>

              {/* Active Indicator Dot */}
              {isSelected && (
                <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-black shadow-xs">
                  ✓
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
