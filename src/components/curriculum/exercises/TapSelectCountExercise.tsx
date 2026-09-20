// src/components/curriculum/exercises/TapSelectCountExercise.tsx
'use client';

import React, { useState } from 'react';
import { TapSelectCountExercise } from '@/types/curriculum';
import { sound } from '@/utils/sound';
import { Check, Sparkles } from 'lucide-react';

interface Props {
  exercise: TapSelectCountExercise;
  onAnswer: (isCorrect: boolean, selectedCount: number) => void;
  disabled?: boolean;
}

export const TapSelectCountExerciseComponent: React.FC<Props> = ({
  exercise,
  onAnswer,
  disabled = false,
}) => {
  const { targetCount, totalItems = 8, itemType = 'mango' } = exercise;

  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [submitted, setSubmitted] = useState<boolean>(false);

  const getEmoji = () => {
    switch (itemType) {
      case 'mango':
        return '🥭';
      case 'apple':
        return '🍎';
      case 'fish':
        return '🐟';
      case 'star':
        return '⭐️';
      case 'gem':
        return '💎';
      case 'flower':
        return '🌸';
      default:
        return '🥭';
    }
  };

  const handleToggleItem = (index: number) => {
    if (disabled || submitted) return;
    sound.playPop();
    setSelectedIndices(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const handleCheck = () => {
    if (disabled || submitted) return;
    setSubmitted(true);
    const isCorrect = selectedIndices.length === targetCount;
    if (isCorrect) {
      sound.playSuccessChime();
    } else {
      sound.playErrorThud();
    }
    onAnswer(isCorrect, selectedIndices.length);
  };

  return (
    <div className="space-y-6">
      {/* Target Count Indicator Badge */}
      <div className="flex items-center justify-center gap-3">
        <div className="bg-amber-100/90 px-6 py-2.5 rounded-2xl border-2 border-amber-300 font-heading text-lg sm:text-xl font-black text-amber-950 shadow-xs flex items-center gap-2">
          <span>គោលដៅ: </span>
          <span className="text-2xl text-amber-600 font-black">{targetCount}</span>
          <span className="text-xs text-slate-500 font-khmer font-bold">
            (បានរើស: {selectedIndices.length} / {targetCount})
          </span>
        </div>
      </div>

      {/* Tap-to-Select Items Grid */}
      <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-4 gap-3 sm:gap-4 max-w-lg mx-auto bg-amber-50/60 p-5 rounded-3xl border-3 border-amber-300">
        {Array.from({ length: totalItems }).map((_, idx) => {
          const isSelected = selectedIndices.includes(idx);
          return (
            <button
              key={idx}
              disabled={disabled || submitted}
              onClick={() => handleToggleItem(idx)}
              className={`min-h-[72px] sm:min-h-[80px] rounded-2xl border-3 flex items-center justify-center text-4xl sm:text-5xl transition-all btn-squishy select-none relative ${
                isSelected
                  ? 'bg-emerald-400 border-emerald-600 shadow-[0_4px_0_#047857] scale-105'
                  : 'bg-white hover:bg-amber-50 border-amber-200 shadow-xs'
              }`}
            >
              <span className={isSelected ? 'animate-playful-bounce' : ''}>
                {getEmoji()}
              </span>
              {isSelected && (
                <span className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-black shadow-xs">
                  ✓
                </span>
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
            disabled={selectedIndices.length === 0 || disabled}
            className={`min-h-[56px] px-8 py-3.5 rounded-2xl font-heading text-lg font-black text-white transition-all btn-squishy flex items-center justify-center gap-2 mx-auto ${
              selectedIndices.length > 0
                ? 'bg-emerald-500 hover:bg-emerald-600 border-b-4 border-emerald-700 shadow-[0_6px_0_#047857]'
                : 'bg-slate-300 text-slate-500 border-slate-400 cursor-not-allowed'
            }`}
          >
            <Sparkles className="w-5 h-5" />
            <span>ពិនិត្យចម្លើយ (Check Count)</span>
          </button>
        </div>
      )}
    </div>
  );
};
