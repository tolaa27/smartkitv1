// src/components/curriculum/ScoreCelebrationModal.tsx
'use client';

import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { sound } from '@/utils/sound';
import { Star, Trophy, Sparkles, ArrowRight, RotateCcw } from 'lucide-react';

interface Props {
  isOpen: boolean;
  score: number;
  stars: number;
  totalExercises: number;
  completedCount: number;
  onNext: () => void;
  onRetry?: () => void;
}

export const ScoreCelebrationModal: React.FC<Props> = ({
  isOpen,
  score,
  stars,
  totalExercises,
  completedCount,
  onNext,
  onRetry,
}) => {
  useEffect(() => {
    if (isOpen) {
      sound.playStar();
      sound.speakKhmer('អបអរសាទរ! ប្អូនឆ្លើយបានត្រឹមត្រូវ និងទទួលបានផ្កាយ!');

      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#FBBF24', '#34D399', '#60A5FA', '#F472B6'],
        });
      } catch {}
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="relative w-full max-w-md bg-[#FFFDF7] rounded-[32px] p-6 sm:p-8 border-4 border-amber-300 shadow-[0_20px_50px_rgba(0,0,0,0.3)] text-center space-y-6 animate-playful-bounce">
        {/* Top Trophy / Celebration Badge */}
        <div className="relative mx-auto w-24 h-24 rounded-3xl bg-gradient-to-tr from-amber-400 to-yellow-300 border-4 border-amber-400 flex items-center justify-center text-5xl shadow-[0_8px_0_#D97706,0_12px_24px_rgba(217,119,6,0.3)]">
          🏆
          <span className="absolute -top-2 -right-2 text-xl animate-spin" style={{ animationDuration: '3s' }}>
            ✨
          </span>
        </div>

        {/* Celebratory Khmer Heading */}
        <div className="space-y-1.5">
          <h3 className="text-2xl sm:text-3xl font-black font-heading text-amber-950 tracking-tight">
            អបអរសាទរ! ឆ្លាតណាស់! 🎉
          </h3>
          <p className="text-xs sm:text-sm font-bold text-amber-800 font-khmer">
            ប្អូនបានឆ្លើយត្រឹមត្រូវ និងបញ្ចប់មេរៀន MoEYS មួយវគ្គទៀតហើយ!
          </p>
        </div>

        {/* Reward Stats Pill: Stars & Gems */}
        <div className="grid grid-cols-2 gap-3 bg-amber-50 p-4 rounded-2xl border-2 border-amber-200">
          <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-white shadow-xs">
            <div className="flex items-center gap-1.5 text-amber-600 font-black text-xl">
              <Star className="w-6 h-6 fill-amber-400 text-amber-500 animate-pulse" />
              <span>+{stars}</span>
            </div>
            <span className="text-[11px] font-bold text-slate-500 font-khmer mt-0.5">
              ផ្កាយទទួលបាន (Stars)
            </span>
          </div>

          <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-white shadow-xs">
            <div className="flex items-center gap-1.5 text-emerald-700 font-black text-xl">
              <span className="text-2xl">💎</span>
              <span>+{score}</span>
            </div>
            <span className="text-[11px] font-bold text-slate-500 font-khmer mt-0.5">
              ពិន្ទុត្បូង (Score)
            </span>
          </div>
        </div>

        {/* Progress in current subject */}
        <div className="text-xs font-black text-slate-600 font-khmer bg-slate-100 py-2 px-4 rounded-xl">
          វឌ្ឍនភាព: {completedCount} / {totalExercises} លំហាត់បានបញ្ចប់
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          {onRetry && (
            <button
              onClick={() => {
                sound.playPop();
                onRetry();
              }}
              className="py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 border border-slate-300 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>លេងឡើងវិញ</span>
            </button>
          )}

          <button
            onClick={() => {
              sound.playPop();
              onNext();
            }}
            className="flex-1 py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-600 hover:to-teal-600 text-white font-black text-base sm:text-lg animate-glow-cta btn-squishy flex items-center justify-center gap-2.5 shadow-md active:translate-y-1 select-none"
          >
            <span className="font-heading">លេងបន្ត (Next Level)</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
