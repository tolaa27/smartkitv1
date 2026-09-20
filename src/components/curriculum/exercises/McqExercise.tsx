// src/components/curriculum/exercises/McqExercise.tsx
'use client';

import React, { useState } from 'react';
import { McqExercise, McqOption } from '@/types/curriculum';
import { sound } from '@/utils/sound';
import { Check, X, Sparkles } from 'lucide-react';

interface Props {
  exercise: McqExercise;
  onAnswer: (isCorrect: boolean, selectedOptionId: string) => void;
  disabled?: boolean;
}

export const McqExerciseComponent: React.FC<Props> = ({
  exercise,
  onAnswer,
  disabled = false,
}) => {
  const { options } = exercise;
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<boolean>(false);

  const handleSelectOption = (opt: McqOption) => {
    if (disabled || submitted) return;
    sound.playPop();
    setSelectedId(opt.id);
  };

  const handleCheck = () => {
    if (!selectedId || disabled || submitted) return;
    setSubmitted(true);
    const chosen = options.find(o => o.id === selectedId);
    const isCorrect = chosen?.isCorrect ?? false;
    if (isCorrect) {
      sound.playSuccessChime();
    } else {
      sound.playErrorThud();
    }
    onAnswer(isCorrect, selectedId);
  };

  // Helper for rendering geometric SVG shapes
  const renderSvgShape = (shape?: string) => {
    switch (shape) {
      case 'triangle':
        return (
          <svg viewBox="0 0 60 60" className="w-12 h-12">
            <polygon points="30,8 54,50 6,50" fill="#3B82F6" stroke="#1D4ED8" strokeWidth="3" />
          </svg>
        );
      case 'square':
        return (
          <svg viewBox="0 0 60 60" className="w-12 h-12">
            <rect x="10" y="10" width="40" height="40" rx="4" fill="#10B981" stroke="#047857" strokeWidth="3" />
          </svg>
        );
      case 'circle':
        return (
          <svg viewBox="0 0 60 60" className="w-12 h-12">
            <circle cx="30" cy="30" r="22" fill="#F59E0B" stroke="#B45309" strokeWidth="3" />
          </svg>
        );
      case 'rectangle':
        return (
          <svg viewBox="0 0 70 50" className="w-14 h-10">
            <rect x="5" y="8" width="60" height="34" rx="4" fill="#EC4899" stroke="#BE185D" strokeWidth="3" />
          </svg>
        );
      case 'cube':
        return (
          <svg viewBox="0 0 60 60" className="w-12 h-12">
            <rect x="10" y="18" width="32" height="32" rx="4" fill="#3B82F6" stroke="#1D4ED8" strokeWidth="2" />
            <path d="M 10 18 L 24 8 L 56 8 L 42 18 Z" fill="#60A5FA" stroke="#1D4ED8" strokeWidth="2" />
            <path d="M 42 18 L 56 8 L 56 40 L 42 50 Z" fill="#2563EB" stroke="#1D4ED8" strokeWidth="2" />
          </svg>
        );
      case 'cylinder':
        return (
          <svg viewBox="0 0 60 60" className="w-12 h-12">
            <ellipse cx="30" cy="14" rx="18" ry="7" fill="#FBBF24" stroke="#D97706" strokeWidth="2" />
            <path d="M 12 14 L 12 42 C 12 48, 48 48, 48 42 L 48 14" fill="#F59E0B" stroke="#D97706" strokeWidth="2" />
            <ellipse cx="30" cy="42" rx="18" ry="7" fill="#FBBF24" stroke="#D97706" strokeWidth="2" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Options Grid (Min 56px touch targets) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-w-2xl mx-auto">
        {options.map(opt => {
          const isSelected = selectedId === opt.id;
          const isCorrect = opt.isCorrect && submitted;
          const isWrong = isSelected && !opt.isCorrect && submitted;

          let btnStyles = 'bg-white hover:bg-amber-50/80 text-slate-900 border-amber-200/90 shadow-sm';
          if (isSelected && !submitted) {
            btnStyles = 'bg-blue-600 text-white border-blue-700 shadow-[0_4px_0_#1D4ED8] -translate-y-1';
          } else if (isCorrect) {
            btnStyles = 'bg-emerald-500 text-white border-emerald-600 shadow-[0_4px_0_#047857]';
          } else if (isWrong) {
            btnStyles = 'bg-rose-500 text-white border-rose-600 shadow-[0_4px_0_#9F1239]';
          }

          return (
            <button
              key={opt.id}
              disabled={disabled || submitted}
              onClick={() => handleSelectOption(opt)}
              className={`min-h-[56px] p-4 rounded-2xl border-3 font-heading text-lg sm:text-xl font-black transition-all btn-squishy flex items-center justify-between gap-3 select-none text-left ${btnStyles}`}
            >
              <div className="flex items-center gap-3">
                {opt.icon && <span className="text-3xl">{opt.icon}</span>}
                {opt.svgVisual && renderSvgShape(opt.svgVisual)}
                <span className="font-heading">{opt.textKh}</span>
              </div>

              {isCorrect && (
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <Check className="w-5 h-5 text-white" />
                </div>
              )}
              {isWrong && (
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <X className="w-5 h-5 text-white" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Submit / Check Action */}
      {!submitted && (
        <div className="text-center pt-2">
          <button
            onClick={handleCheck}
            disabled={!selectedId || disabled}
            className={`min-h-[56px] px-8 py-3.5 rounded-2xl font-heading text-lg font-black text-white transition-all btn-squishy flex items-center justify-center gap-2 mx-auto ${
              selectedId
                ? 'bg-emerald-500 hover:bg-emerald-600 border-b-4 border-emerald-700 shadow-[0_6px_0_#047857]'
                : 'bg-slate-300 text-slate-500 border-slate-400 cursor-not-allowed'
            }`}
          >
            <Sparkles className="w-5 h-5" />
            <span>ពិនិត្យចម្លើយ (Check Answer)</span>
          </button>
        </div>
      )}
    </div>
  );
};
