// src/components/curriculum/exercises/PlaceValueBlocksExercise.tsx
'use client';

import React, { useState } from 'react';
import { PlaceValueBlocksExercise } from '@/types/curriculum';
import { sound } from '@/utils/sound';
import { Check, Sparkles } from 'lucide-react';

interface Props {
  exercise: PlaceValueBlocksExercise;
  onAnswer: (isCorrect: boolean, answerValue: number) => void;
  disabled?: boolean;
}

export const PlaceValueBlocksExerciseComponent: React.FC<Props> = ({
  exercise,
  onAnswer,
  disabled = false,
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState<boolean>(false);

  const { hundreds, tens, ones, targetValue, options = [] } = exercise;

  const handleSelectOption = (num: number) => {
    if (disabled || submitted) return;
    sound.playPop();
    setSelectedAnswer(num);
  };

  const handleCheck = () => {
    if (selectedAnswer === null || disabled || submitted) return;
    setSubmitted(true);
    const isCorrect = selectedAnswer === targetValue;
    if (isCorrect) {
      sound.playSuccessChime();
    } else {
      sound.playErrorThud();
    }
    onAnswer(isCorrect, selectedAnswer);
  };

  return (
    <div className="space-y-6">
      {/* Visual Base-Ten Manipulatives Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-amber-50/60 p-4 sm:p-6 rounded-3xl border-3 border-amber-300 shadow-inner">
        {/* 1. Hundreds Blocks (ខ្ទង់រយ) */}
        <div className="bg-white/90 p-4 rounded-2xl border-2 border-emerald-300 shadow-xs flex flex-col items-center space-y-3">
          <div className="flex items-center gap-1.5 bg-emerald-100 text-emerald-950 px-3 py-1 rounded-full text-xs font-black border border-emerald-300 font-khmer">
            <span>🟦</span>
            <span>ខ្ទង់រយ: {hundreds} ({hundreds * 100})</span>
          </div>

          {/* SVG 100-Flats */}
          <div className="flex flex-wrap items-center justify-center gap-2 min-h-[100px]">
            {Array.from({ length: hundreds }).map((_, idx) => (
              <div
                key={idx}
                className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl border-2 border-emerald-700 shadow-md p-1 grid grid-cols-10 grid-rows-10 gap-0.5"
                title="ប្លុក ១០០ (100 Block)"
              >
                {Array.from({ length: 100 }).map((_, cIdx) => (
                  <div key={cIdx} className="bg-emerald-200/50 rounded-[1px]" />
                ))}
              </div>
            ))}
          </div>
          <span className="text-xs font-bold text-slate-500 font-khmer">
            {hundreds} បន្ទះរយ = {hundreds * 100}
          </span>
        </div>

        {/* 2. Tens Rods (ខ្ទង់ដប់) */}
        <div className="bg-white/90 p-4 rounded-2xl border-2 border-amber-300 shadow-xs flex flex-col items-center space-y-3">
          <div className="flex items-center gap-1.5 bg-amber-100 text-amber-950 px-3 py-1 rounded-full text-xs font-black border border-amber-300 font-khmer">
            <span>🟧</span>
            <span>ខ្ទង់ដប់: {tens} ({tens * 10})</span>
          </div>

          {/* SVG 10-Rods */}
          <div className="flex flex-wrap items-center justify-center gap-2 min-h-[100px]">
            {Array.from({ length: tens }).map((_, idx) => (
              <div
                key={idx}
                className="w-6 sm:w-7 h-20 sm:h-24 bg-gradient-to-b from-amber-400 to-orange-500 rounded-lg border-2 border-amber-700 shadow-sm p-0.5 flex flex-col justify-between"
                title="ដំបង ១០ (10 Rod)"
              >
                {Array.from({ length: 10 }).map((_, rIdx) => (
                  <div key={rIdx} className="h-1.5 bg-amber-200/60 rounded-[1px]" />
                ))}
              </div>
            ))}
          </div>
          <span className="text-xs font-bold text-slate-500 font-khmer">
            {tens} ដំបងដប់ = {tens * 10}
          </span>
        </div>

        {/* 3. Ones Cubes (ខ្ទង់រាយ) */}
        <div className="bg-white/90 p-4 rounded-2xl border-2 border-sky-300 shadow-xs flex flex-col items-center space-y-3">
          <div className="flex items-center gap-1.5 bg-sky-100 text-sky-950 px-3 py-1 rounded-full text-xs font-black border border-sky-300 font-khmer">
            <span>🟨</span>
            <span>ខ្ទង់រាយ: {ones} ({ones})</span>
          </div>

          {/* Single 1-Unit Cubes */}
          <div className="flex flex-wrap items-center justify-center gap-2 min-h-[100px] max-w-[150px]">
            {Array.from({ length: ones }).map((_, idx) => (
              <div
                key={idx}
                className="w-6 h-6 sm:w-7 sm:h-7 bg-gradient-to-br from-yellow-300 to-amber-400 rounded-md border-2 border-amber-600 shadow-xs flex items-center justify-center text-[10px] font-bold text-amber-950"
                title="គូបរាយ ១ (1 Unit)"
              >
                ១
              </div>
            ))}
          </div>
          <span className="text-xs font-bold text-slate-500 font-khmer">
            {ones} គ្រាប់រាយ = {ones}
          </span>
        </div>
      </div>

      {/* Expanded Equation Help */}
      <div className="bg-white p-3 rounded-2xl border-2 border-amber-200 text-center font-heading text-lg sm:text-xl font-black text-amber-950 shadow-xs">
        <span>{hundreds * 100} + {tens * 10} + {ones} = ?</span>
      </div>

      {/* Options Buttons (Min 56px touch target) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-xl mx-auto">
        {options.map(opt => {
          const isSelected = selectedAnswer === opt;
          const isCorrect = opt === targetValue && submitted;
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
              key={opt}
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
            disabled={selectedAnswer === null || disabled}
            className={`min-h-[56px] px-8 py-3.5 rounded-2xl font-heading text-lg font-black text-white transition-all btn-squishy flex items-center justify-center gap-2 mx-auto ${
              selectedAnswer !== null
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
