// src/components/curriculum/exercises/NumberLineExercise.tsx
'use client';

import React, { useState } from 'react';
import { NumberLineExercise } from '@/types/curriculum';
import { sound } from '@/utils/sound';
import { Check, Sparkles } from 'lucide-react';

interface Props {
  exercise: NumberLineExercise;
  onAnswer: (isCorrect: boolean, answerValue: number) => void;
  disabled?: boolean;
}

export const NumberLineExerciseComponent: React.FC<Props> = ({
  exercise,
  onAnswer,
  disabled = false,
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState<boolean>(false);

  const { startValue = 0, endValue = 10, jumps = [], correctAnswer, options = [] } = exercise;

  // Generate ticks
  const ticks: number[] = [];
  for (let i = startValue; i <= endValue; i++) {
    ticks.push(i);
  }

  // Khmer numbers lookup
  const khmerNumbers = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩', '១០'];

  // SVG coordinate calculations
  const svgWidth = 600;
  const svgHeight = 160;
  const paddingX = 40;
  const lineY = 110;
  const usableWidth = svgWidth - paddingX * 2;
  const tickSpacing = usableWidth / (endValue - startValue);

  const getX = (val: number) => paddingX + (val - startValue) * tickSpacing;

  const handleSelectOption = (num: number) => {
    if (disabled || submitted) return;
    sound.playPop();
    setSelectedAnswer(num);
  };

  const handleCheck = () => {
    if (selectedAnswer === null || disabled || submitted) return;
    setSubmitted(true);
    const isCorrect = selectedAnswer === correctAnswer;
    if (isCorrect) {
      sound.playSuccessChime();
    } else {
      sound.playErrorThud();
    }
    onAnswer(isCorrect, selectedAnswer);
  };

  return (
    <div className="space-y-6">
      {/* Interactive SVG Number Line */}
      <div className="bg-amber-50/70 p-4 sm:p-6 rounded-3xl border-3 border-amber-300 shadow-inner overflow-x-auto">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full min-w-[500px] max-w-2xl mx-auto h-auto select-none"
        >
          {/* Main Axis Line */}
          <line
            x1={paddingX - 15}
            y1={lineY}
            x2={svgWidth - paddingX + 15}
            y2={lineY}
            stroke="#78350F"
            strokeWidth="5"
            strokeLinecap="round"
          />

          {/* Arrow heads */}
          <polygon
            points={`${paddingX - 25},${lineY} ${paddingX - 12},${lineY - 7} ${paddingX - 12},${lineY + 7}`}
            fill="#78350F"
          />
          <polygon
            points={`${svgWidth - paddingX + 25},${lineY} ${svgWidth - paddingX + 12},${lineY - 7} ${svgWidth - paddingX + 12},${lineY + 7}`}
            fill="#78350F"
          />

          {/* Ticks and Number Labels */}
          {ticks.map(val => {
            const x = getX(val);
            const isTarget = val === correctAnswer && submitted;
            const isSelected = val === selectedAnswer;

            return (
              <g key={val} className="cursor-pointer" onClick={() => handleSelectOption(val)}>
                {/* Vertical Tick */}
                <line
                  x1={x}
                  y1={lineY - 12}
                  x2={x}
                  y2={lineY + 12}
                  stroke={isSelected ? '#2563EB' : '#92400E'}
                  strokeWidth={isSelected ? '5' : '3.5'}
                  strokeLinecap="round"
                />

                {/* Tick Point Node */}
                <circle
                  cx={x}
                  cy={lineY}
                  r={isSelected ? 9 : 6}
                  fill={isTarget ? '#10B981' : isSelected ? '#3B82F6' : '#FBBF24'}
                  stroke="#78350F"
                  strokeWidth="2.5"
                  className="transition-all"
                />

                {/* Number text: Khmer & Arabic */}
                <text
                  x={x}
                  y={lineY + 34}
                  textAnchor="middle"
                  fill="#451A03"
                  fontSize="16"
                  fontWeight="900"
                  fontFamily="Battambang, sans-serif"
                >
                  {khmerNumbers[val] || val}
                </text>
                <text
                  x={x}
                  y={lineY + 48}
                  textAnchor="middle"
                  fill="#78350F"
                  fontSize="11"
                  fontWeight="bold"
                >
                  ({val})
                </text>
              </g>
            );
          })}

          {/* Curved Arc Jumps for Addition/Subtraction Steps */}
          {jumps.map((jump, idx) => {
            const x1 = getX(jump.from);
            const x2 = getX(jump.to);
            const midX = (x1 + x2) / 2;
            const arcHeight = Math.abs(x2 - x1) * 0.45;
            const controlY = lineY - Math.min(arcHeight, 75);

            // Forward is blue/emerald, backward is coral
            const isForward = jump.direction === 'forward';
            const strokeColor = isForward ? '#059669' : '#DC2626';

            return (
              <g key={idx}>
                {/* Curved Jump Path */}
                <path
                  d={`M ${x1} ${lineY - 10} Q ${midX} ${controlY} ${x2} ${lineY - 10}`}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth="4"
                  strokeDasharray="6 4"
                  className="animate-pulse"
                />

                {/* Arrowhead at landing */}
                <circle
                  cx={x2}
                  cy={lineY - 10}
                  r="5"
                  fill={strokeColor}
                />

                {/* Step Label Badge */}
                {jump.label && (
                  <g transform={`translate(${midX}, ${controlY - 8})`}>
                    <rect
                      x="-22"
                      y="-16"
                      width="44"
                      height="24"
                      rx="12"
                      fill={isForward ? '#D1FAE5' : '#FEE2E2'}
                      stroke={strokeColor}
                      strokeWidth="2"
                    />
                    <text
                      x="0"
                      y="1"
                      textAnchor="middle"
                      fill={strokeColor}
                      fontSize="13"
                      fontWeight="bold"
                      fontFamily="Battambang, sans-serif"
                    >
                      {jump.label}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Equation Banner */}
      <div className="text-center py-2">
        <span className="inline-block bg-white px-6 py-2.5 rounded-2xl border-3 border-amber-300 font-heading text-2xl sm:text-3xl font-black text-amber-950 shadow-md">
          {exercise.equationKh}
        </span>
      </div>

      {/* Choice Options Buttons (Min 56px touch targets) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-xl mx-auto">
        {options.map(opt => {
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
              key={opt}
              disabled={disabled || submitted}
              onClick={() => handleSelectOption(opt)}
              className={`min-h-[56px] py-3.5 px-4 rounded-2xl border-3 font-heading text-xl sm:text-2xl font-black transition-all btn-squishy flex items-center justify-center gap-2 select-none ${btnStyles}`}
            >
              <span>{khmerNumbers[opt] || opt}</span>
              <span className="text-xs opacity-75 font-sans font-bold">({opt})</span>
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
