// src/components/auth/RoleSelectionScreen.tsx
'use client';

import React from 'react';
import { Sparkles, KeyRound, Mail } from 'lucide-react';
import { RoleSelectionCard } from './RoleSelectionCard';

export interface RoleSelectionScreenProps {
  onSelectStudent: () => void;
  onSelectTeacher: () => void;
  onOpenRegister?: () => void;
}

/**
 * RoleSelectionScreen
 *
 * Symmetrical, accessible authentication role selection screen for SmartKids Cambodia.
 * Adheres to:
 * - Kantumruy Pro & Noto Sans Khmer font system
 * - Diacritic clearance for Khmer vowels and subscript consonants (line-height 1.6-1.75)
 * - Pure white cards with subtle slate border and soft ambient shadow resting state
 * - Equal-height 2-column grid (desktop) / 16px gap single column (mobile)
 * - Bottom baseline aligned authentication hint and circular action button
 * - Warm #FBF9F4 canvas background and WCAG AA compliant text contrast
 */
export function RoleSelectionScreen({
  onSelectStudent,
  onSelectTeacher,
  onOpenRegister,
}: RoleSelectionScreenProps) {
  return (
    <div
      style={{ fontFamily: "'Kantumruy Pro', 'Noto Sans Khmer', system-ui, sans-serif" }}
      className="w-full flex flex-col items-center"
    >
      {/* Header Branding Hierarchy */}
      <header className="text-center mb-8 sm:mb-10 flex flex-col items-center">
        {/* Mascot Avatar */}
        <div
          className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-linear-to-tr from-amber-400 via-amber-500 to-yellow-400 border border-amber-300 shadow-md flex items-center justify-center text-4xl sm:text-5xl mb-4 transform hover:scale-105 transition-transform duration-200"
          aria-hidden="true"
        >
          🐘
        </div>

        {/* Brand Pill: Small muted chip */}
        <div className="inline-flex items-center gap-1.5 bg-slate-100/90 text-slate-700 px-3 py-1 rounded-full text-xs font-semibold border border-slate-200/80 shadow-2xs mb-3">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" aria-hidden="true" />
          <span className="leading-none">កុមារឆ្លាត • SmartKids Cambodia</span>
        </div>

        {/* Main Title (h1): 32px–36px desktop / 26px mobile; font-weight 700 to keep circular glyphs open */}
        <h1 className="text-[26px] sm:text-[32px] md:text-[36px] font-bold text-slate-900 leading-[1.65] py-1 tracking-tight">
          សូមស្វាគមន៍មកកាន់ SmartKids
        </h1>

        {/* Subtitle: line-height 1.75, font-weight 400, no diacritic clipping */}
        <p className="text-sm sm:text-base text-slate-600 font-normal leading-[1.75] max-w-md mx-auto mt-0.5">
          សូមជ្រើសរើសប្រភេទគណនីរបស់អ្នកដើម្បីចូលប្រើប្រាស់
        </p>
      </header>

      {/* Symmetrical Two-Column Card Grid:
          - Desktop (≥ 768px): 2-column layout max-w-3xl mx-auto
          - Mobile (< 768px): Stack into a single column with a 16px (gap-4) vertical gutter
          - Equal-height layout via grid rows and h-full flex flex-col justify-between
      */}
      <main className="w-full max-w-3xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 items-stretch">
          {/* Card 1: Student Role (Warm Amber / Playful) */}
          <RoleSelectionCard
            id="role-student-btn"
            role="student"
            icon={<span role="img" aria-label="កាតាបសិស្ស">🎒</span>}
            pillLabel="សម្រាប់សិស្ស"
            titleKhmer="ចូលរៀន"
            titleLatin="Student"
            description="សម្រាប់កូនសិស្សរៀនភាសាខ្មែរ គណិតវិទ្យា និងវិទ្យាសាស្ត្រតាមរយៈល្បែងកម្សាន្ត។"
            authMethodIcon={KeyRound}
            authMethodText="PIN ៤ ខ្ទង់"
            onClick={onSelectStudent}
          />

          {/* Card 2: Teacher Role (Indigo / Educational Trust) */}
          <RoleSelectionCard
            id="role-teacher-btn"
            role="teacher"
            icon={<span role="img" aria-label="លោកគ្រូ-អ្នកគ្រូ">👩‍🏫</span>}
            pillLabel="សម្រាប់គ្រូបង្រៀន"
            titleKhmer="គ្រូបង្រៀន"
            titleLatin="Teacher"
            description="សម្រាប់លោកគ្រូ-អ្នកគ្រូគ្រប់គ្រងមេរៀន ស្រង់អត្ថបទ OCR និងបង្កើតល្បែង AI។"
            authMethodIcon={Mail}
            authMethodText="អ៊ីមែល និងពាក្យសម្ងាត់"
            onClick={onSelectTeacher}
          />
        </div>

        {/* Student Self-Registration Action Banner */}
        {onOpenRegister && (
          <div className="mt-5 p-4 rounded-3xl bg-white border-2 border-dashed border-amber-300 hover:border-amber-400 shadow-2xs hover:shadow-xs transition-all flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-amber-100 border border-amber-200 flex items-center justify-center text-2xl shrink-0">
                ✨
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 leading-snug">
                  សិស្សថ្មីមិនទាន់មានគណនីមែនទេ?
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed mt-0.5">
                  ចុះឈ្មោះបង្កើតគណនីសិស្សផ្ទាល់ខ្លួន ដោយភ្ជាប់ជាមួយ ID គ្រូបង្រៀន ឬជ្រើសរើសថ្នាក់រៀន
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onOpenRegister}
              className="py-2.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs shadow-xs hover:shadow-sm transition-all shrink-0 cursor-pointer active:scale-95"
            >
              បង្កើតគណនីសិស្សថ្មី
            </button>
          </div>
        )}
      </main>

      {/* Footer Note with WCAG AA compliant text contrast (text-slate-500 against #FBF9F4) */}
      <footer className="mt-10 sm:mt-12 text-center text-xs sm:text-sm text-slate-500 font-medium leading-[1.75] max-w-lg">
        កុមារឆ្លាត (SmartKids Cambodia) • វេទិកាអប់រំឌីជីថលស្របតាមកម្មវិធីសិក្សាជាតិ MoEYS
      </footer>
    </div>
  );
}

export default RoleSelectionScreen;
