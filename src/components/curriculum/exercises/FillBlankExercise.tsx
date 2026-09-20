// src/components/curriculum/exercises/FillBlankExercise.tsx
'use client';

import React, { useState } from 'react';
import { FillBlankExercise } from '@/types/curriculum';
import { sound } from '@/utils/sound';
import { Check, Sparkles } from 'lucide-react';

interface Props {
  exercise: FillBlankExercise;
  onAnswer: (isCorrect: boolean, selectedAnswer: string) => void;
  disabled?: boolean;
}

export const FillBlankExerciseComponent: React.FC<Props> = ({
  exercise,
  onAnswer,
  disabled = false,
}) => {
  const { templateKh, correctAnswer, options } = exercise;
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<boolean>(false);

  const handleSelectOption = (opt: string) => {
    if (disabled || submitted) return;
    sound.playPop();
    setSelectedAnswer(opt);
  };

  const handleCheck = () => {
    if (!selectedAnswer || disabled || submitted) return;
    setSubmitted(true);
    const isCorrect = selectedAnswer === correctAnswer;
    if (isCorrect) {
      sound.playSuccessChime();
    } else {
      sound.playErrorThud();
    }
    onAnswer(isCorrect, selectedAnswer);
  };

  // Render template with the blank highlighted
  const parts = templateKh.split('{blank}');

  return (
    <div className="space-y-6">
      {/* Template Equation Display */}
      <div className="bg-amber-50/70 p-6 rounded-3xl border-3 border-amber-300 text-center shadow-inner">
        <div className="inline-flex items-center gap-2 font-heading text-2xl sm:text-3xl font-black text-amber-950 flex-wrap justify-center">
          <span>{parts[0]}</span>
          <span
            className={`min-w-[64px] px-4 py-1.5 rounded-2xl border-3 text-center transition-all ${
              selectedAnswer
                ? 'bg-blue-600 text-white border-blue-700 shadow-md'
                : 'bg-white border-dashed border-amber-400 text-slate-300'
            }`}
          >
            {selectedAnswer || '___'}
          </span>
          <span>{parts[1]}</span>
        </div>
      </div>

      {/* Options Selection Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-xl mx-auto">
        {options.map((opt, idx) => {
          const isSelected = selectedAnswer === opt;
          const isCorrect = opt === correctAnswer && submitted;
          const isWrong = isSelected && !isCorrect && submitted;

          let btnStyles = 'bg-white hover:bg-amber-50 text-slate-900 border-amber-200';
          if (isSelected && !submitted) {
            btnStyles = 'bg-blue-600 text-white border-blue-700 shadow-[0_4px_0_#1D4ED8] -translate-y-1';
          } else if (isCorrect) {
            btnStyles = 'bg-emerald-500 text-white border-emerald-600 shadow-[0_4px_0_#047857]';
          } else if (isWrong) {
            btnStyles = 'bg-rose-500 text-white border-rose-600 shadow-[0_4px_0_#9F1239]';
          }

          return (
            <button
              key={idx}
              disabled={disabled || submitted}
              onClick={() => handleSelectOption(opt)}
              className={`min-h-[56px] py-3.5 px-4 rounded-2xl border-3 font-heading text-xl sm:text-2xl font-black transition-all btn-squishy flex items-center justify-center gap-2 select-none ${btnStyles}`}
            >
              <span>{opt}</span>
              {isCorrect && <Check className="w-5 h-5" />}
            </button>
          );
        })}
      </div>

      {/* Submit / Check Action */}
      {!submitted && (
        <div className="text-center pt-2">
          <button
            onClick={handleCheck}
            disabled={!selectedAnswer || disabled}
            className={`min-h-[56px] px-8 py-3.5 rounded-2xl font-heading text-lg font-black text-white transition-all btn-squishy flex items-center justify-center gap-2 mx-auto ${
              selectedAnswer
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
