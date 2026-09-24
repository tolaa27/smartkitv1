// src/components/studio/StudioHeader.tsx
// Professional Modern EdTech SaaS Header for SmartKids Studio

'use client';

import React from 'react';
import {
  Sparkles,
  Save,
  Eye,
  Gamepad2,
  Star,
  Diamond,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { soundSynthesizer } from '@/lib/audio/SoundSynthesizer';

interface StudioHeaderProps {
  lessonTitle: string;
  isGenerating: boolean;
  hasUnsavedChanges: boolean;
  onSave: () => void;
  onGenerateAi: () => void;
  onSwitchToStudentHub: () => void;
  activePreviewTab: 'game' | 'pdf' | 'video';
  onTogglePreview: () => void;
  stars?: number;
  gems?: number;
}

export const StudioHeader: React.FC<StudioHeaderProps> = ({
  lessonTitle,
  isGenerating,
  hasUnsavedChanges,
  onSave,
  onGenerateAi,
  onSwitchToStudentHub,
  activePreviewTab,
  onTogglePreview,
  stars = 95,
  gems = 7037,
}) => {
  return (
    <header className="h-16 border-b border-slate-200 bg-white/95 backdrop-blur-md z-30 flex items-center justify-between px-4 sm:px-6 flex-shrink-0">
      {/* Left: Brand + Mascot + Lesson Title */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-500 text-white flex items-center justify-center text-xl shadow-xs font-black">
            🐘
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-heading font-black text-slate-900 text-base tracking-tight">
                SmartKids
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 font-mono">
                AI Studio
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium font-khmer hidden sm:block line-clamp-1">
              ស្ទូឌីយោបង្កើតមេរៀន និងល្បែងសិក្សា AI
            </p>
          </div>
        </div>

        <div className="h-6 w-px bg-slate-200 hidden md:block mx-1" />

        {/* Current Lesson Title Badge */}
        <div className="hidden lg:flex items-center gap-2 max-w-sm xl:max-w-md">
          <span className="text-xs text-slate-400 font-medium whitespace-nowrap">
            មេរៀនបច្ចុប្បន្ន៖
          </span>
          <span className="text-xs font-bold text-slate-800 bg-slate-100 px-3 py-1 rounded-xl truncate font-khmer border border-slate-200">
            {lessonTitle || 'មេរៀនគ្មានចំណងជើង'}
          </span>
        </div>
      </div>

      {/* Right: Gamification Stats + Core Action Buttons */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Gamification Stats */}
        <div className="hidden xl:flex items-center gap-2">
          <div
            className="flex items-center gap-1.5 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200 text-amber-800 font-bold text-xs"
            title="ផ្កាយទទួលបាន"
          >
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500 animate-pulse" />
            <span className="font-mono">{stars}</span>
          </div>
          <div
            className="flex items-center gap-1.5 bg-sky-50 px-2.5 py-1 rounded-xl border border-sky-200 text-sky-800 font-bold text-xs"
            title="គ្រាប់ត្បូងសន្សំ"
          >
            <Diamond className="w-3.5 h-3.5 fill-sky-400 text-sky-500" />
            <span className="font-mono">{gems.toLocaleString()}</span>
          </div>
        </div>

        {/* Save Button */}
        <button
          type="button"
          onClick={() => {
            soundSynthesizer.playClick();
            onSave();
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition cursor-pointer active:translate-y-0.5"
          title="រក្សាទុកមេរៀន"
        >
          {hasUnsavedChanges ? (
            <Save className="w-3.5 h-3.5 text-amber-600" />
          ) : (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          )}
          <span className="hidden sm:inline">
            {hasUnsavedChanges ? 'រក្សាទុក' : 'បានរក្សាទុក'}
          </span>
        </button>

        {/* Mobile Preview Toggle */}
        <button
          type="button"
          onClick={onTogglePreview}
          className="lg:hidden inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition cursor-pointer"
        >
          <Eye className="w-3.5 h-3.5 text-indigo-600" />
          <span>Preview</span>
        </button>

        {/* Generate with AI Primary CTA */}
        <button
          type="button"
          onClick={() => {
            soundSynthesizer.playClick();
            onGenerateAi();
          }}
          disabled={isGenerating}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer active:translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed leading-[1.8]"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span>AI កំពុងបង្កើត...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>បង្កើតដោយ AI</span>
            </>
          )}
        </button>

        {/* Switch to Student Mode */}
        <button
          type="button"
          onClick={() => {
            soundSynthesizer.playPop();
            onSwitchToStudentHub();
          }}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold text-xs transition cursor-pointer active:translate-y-0.5 leading-[1.8]"
          title="ទៅកាន់មជ្ឈមណ្ឌលសិស្ស"
        >
          <Gamepad2 className="w-4 h-4 text-amber-800" />
          <span className="hidden md:inline">មជ្ឈមណ្ឌលសិស្ស</span>
        </button>
      </div>
    </header>
  );
};
