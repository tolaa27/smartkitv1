// src/components/curriculum/exercises/MatchPairsExercise.tsx
'use client';

import React, { useState } from 'react';
import { MatchPairsExercise, PairItem } from '@/types/curriculum';
import { sound } from '@/utils/sound';
import { Check, Sparkles, Link2, X } from 'lucide-react';

interface Props {
  exercise: MatchPairsExercise;
  onAnswer: (isCorrect: boolean, answers: Record<string, string>) => void;
  disabled?: boolean;
}

const PAIR_COLORS = [
  { bg: 'bg-emerald-100 border-emerald-400 text-emerald-950', dot: '#10B981' },
  { bg: 'bg-blue-100 border-blue-400 text-blue-950', dot: '#3B82F6' },
  { bg: 'bg-purple-100 border-purple-400 text-purple-950', dot: '#A855F7' },
  { bg: 'bg-amber-100 border-amber-400 text-amber-950', dot: '#F59E0B' },
];

export const MatchPairsExerciseComponent: React.FC<Props> = ({
  exercise,
  onAnswer,
  disabled = false,
}) => {
  const { leftItems, rightItems, pairs } = exercise;

  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  // matches: leftId -> rightId
  const [matches, setMatches] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState<boolean>(false);

  const handleTapLeft = (leftId: string) => {
    if (disabled || submitted) return;
    sound.playPop();
    if (selectedLeft === leftId) {
      setSelectedLeft(null);
    } else {
      setSelectedLeft(leftId);
    }
  };

  const handleTapRight = (rightId: string) => {
    if (disabled || submitted) return;
    if (!selectedLeft) {
      sound.playPop();
      return;
    }

    sound.playSnap();
    // Pair selectedLeft with rightId
    setMatches(prev => {
      const next = { ...prev };
      // Remove any existing connection to this rightId
      Object.keys(next).forEach(k => {
        if (next[k] === rightId) delete next[k];
      });
      next[selectedLeft] = rightId;
      return next;
    });

    setSelectedLeft(null);
  };

  const handleRemoveMatch = (leftId: string) => {
    if (disabled || submitted) return;
    sound.playPop();
    setMatches(prev => {
      const next = { ...prev };
      delete next[leftId];
      return next;
    });
  };

  const getMatchIndex = (leftId: string) => {
    const keys = Object.keys(matches);
    const idx = keys.indexOf(leftId);
    return idx >= 0 ? idx % PAIR_COLORS.length : -1;
  };

  const getRightMatchLeftId = (rightId: string) => {
    return Object.keys(matches).find(k => matches[k] === rightId);
  };

  const allPaired = leftItems.length === Object.keys(matches).length;

  const handleCheck = () => {
    if (!allPaired || disabled || submitted) return;
    setSubmitted(true);

    // Validate matches
    let allCorrect = true;
    for (const pair of pairs) {
      if (matches[pair.leftId] !== pair.rightId) {
        allCorrect = false;
        break;
      }
    }

    if (allCorrect) {
      sound.playSuccessChime();
    } else {
      sound.playErrorThud();
    }

    onAnswer(allCorrect, matches);
  };

  return (
    <div className="space-y-6">
      {/* Connector Guide Pill */}
      <div className="bg-amber-100/70 p-3 rounded-2xl border border-amber-300 text-center text-xs sm:text-sm font-bold text-amber-950 font-khmer flex items-center justify-center gap-2">
        <Link2 className="w-4 h-4 text-amber-700" />
        <span>ចុចជ្រើសរើសពាក្យខាងឆ្វេង រួចចុចពាក្យផ្ទុយខាងស្តាំដើម្បីផ្គូផ្គង (Tap left, then tap right)</span>
      </div>

      {/* Two-Column Matching Board */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-white p-4 sm:p-6 rounded-3xl border-3 border-amber-300 shadow-sm">
        {/* Left Column Items */}
        <div className="space-y-3">
          <span className="text-xs font-black uppercase tracking-wider text-slate-500 font-heading block px-1">
            ជួរឈរខាងឆ្វេង (Left Column)
          </span>

          {leftItems.map(item => {
            const isSelected = selectedLeft === item.id;
            const matchIndex = getMatchIndex(item.id);
            const isPaired = matchIndex >= 0;
            const color = isPaired ? PAIR_COLORS[matchIndex] : null;

            return (
              <div
                key={item.id}
                onClick={() => handleTapLeft(item.id)}
                className={`min-h-[56px] p-3.5 rounded-2xl border-3 flex items-center justify-between cursor-pointer transition-all btn-squishy select-none ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-700 shadow-[0_4px_0_#1D4ED8] -translate-y-1'
                    : isPaired && color
                    ? `${color.bg} shadow-xs`
                    : 'bg-amber-50/70 hover:bg-amber-100 text-slate-900 border-amber-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {item.icon && <span className="text-2xl">{item.icon}</span>}
                  <span className="font-heading font-black text-base sm:text-lg">{item.textKh}</span>
                </div>

                {isPaired && !submitted && (
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      handleRemoveMatch(item.id);
                    }}
                    className="p-1 rounded-full hover:bg-black/10 text-slate-600"
                    title="ផ្តាច់ការផ្គូផ្គង (Unlink)"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}

                {isSelected && <span className="text-xs font-bold bg-white/30 px-2 py-0.5 rounded-full">ជ្រើសរើស...</span>}
              </div>
            );
          })}
        </div>

        {/* Right Column Items */}
        <div className="space-y-3">
          <span className="text-xs font-black uppercase tracking-wider text-slate-500 font-heading block px-1">
            ជួរឈរខាងស្តាំ (Right Column)
          </span>

          {rightItems.map(item => {
            const matchedLeftId = getRightMatchLeftId(item.id);
            const matchIndex = matchedLeftId ? getMatchIndex(matchedLeftId) : -1;
            const isPaired = matchIndex >= 0;
            const color = isPaired ? PAIR_COLORS[matchIndex] : null;

            return (
              <div
                key={item.id}
                onClick={() => handleTapRight(item.id)}
                className={`min-h-[56px] p-3.5 rounded-2xl border-3 flex items-center justify-between cursor-pointer transition-all btn-squishy select-none ${
                  isPaired && color
                    ? `${color.bg} shadow-xs`
                    : selectedLeft
                    ? 'bg-amber-100/80 hover:bg-blue-50 text-slate-900 border-amber-300 animate-pulse-gentle'
                    : 'bg-amber-50/70 hover:bg-amber-100 text-slate-900 border-amber-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {item.icon && <span className="text-2xl">{item.icon}</span>}
                  <span className="font-heading font-black text-base sm:text-lg">{item.textKh}</span>
                </div>

                {isPaired && (
                  <div className="flex items-center gap-1 text-xs font-black bg-white/70 px-2 py-0.5 rounded-full border border-black/10">
                    <Check className="w-3.5 h-3.5 text-emerald-700" />
                    <span>ភ្ជាប់រួច</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Submit / Check Action */}
      {!submitted && (
        <div className="text-center pt-2">
          <button
            onClick={handleCheck}
            disabled={!allPaired || disabled}
            className={`min-h-[56px] px-8 py-3.5 rounded-2xl font-heading text-lg font-black text-white transition-all btn-squishy flex items-center justify-center gap-2 mx-auto ${
              allPaired
                ? 'bg-emerald-500 hover:bg-emerald-600 border-b-4 border-emerald-700 shadow-[0_6px_0_#047857]'
                : 'bg-slate-300 text-slate-500 border-slate-400 cursor-not-allowed'
            }`}
          >
            <Sparkles className="w-5 h-5" />
            <span>ពិនិត្យចម្លើយ (Check Matches)</span>
          </button>
        </div>
      )}
    </div>
  );
};
