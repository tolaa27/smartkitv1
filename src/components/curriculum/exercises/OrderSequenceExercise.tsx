// src/components/curriculum/exercises/OrderSequenceExercise.tsx
'use client';

import React, { useState } from 'react';
import { OrderSequenceExercise, SequenceItem } from '@/types/curriculum';
import { sound } from '@/utils/sound';
import { Check, Sparkles, RotateCcw, ArrowRight } from 'lucide-react';

interface Props {
  exercise: OrderSequenceExercise;
  onAnswer: (isCorrect: boolean, orderedItems: SequenceItem[]) => void;
  disabled?: boolean;
}

export const OrderSequenceExerciseComponent: React.FC<Props> = ({
  exercise,
  onAnswer,
  disabled = false,
}) => {
  const { items, orderDirection, directionLabelKh } = exercise;

  // Selected items in the sequence tray
  const [selectedItems, setSelectedItems] = useState<SequenceItem[]>([]);
  const [submitted, setSubmitted] = useState<boolean>(false);

  // Available items not yet placed in the tray
  const availableItems = items.filter(
    item => !selectedItems.some(sel => sel.id === item.id)
  );

  const handleTapAvailable = (item: SequenceItem) => {
    if (disabled || submitted) return;
    sound.playSnap();
    setSelectedItems(prev => [...prev, item]);
  };

  const handleTapPlaced = (item: SequenceItem) => {
    if (disabled || submitted) return;
    sound.playPop();
    setSelectedItems(prev => prev.filter(i => i.id !== item.id));
  };

  const handleReset = () => {
    if (disabled || submitted) return;
    sound.playPop();
    setSelectedItems([]);
  };

  const handleCheck = () => {
    if (selectedItems.length !== items.length || disabled || submitted) return;
    setSubmitted(true);

    // Validate order
    let isCorrect = true;
    for (let i = 0; i < selectedItems.length - 1; i++) {
      if (orderDirection === 'asc') {
        if (selectedItems[i].value > selectedItems[i + 1].value) {
          isCorrect = false;
          break;
        }
      } else {
        if (selectedItems[i].value < selectedItems[i + 1].value) {
          isCorrect = false;
          break;
        }
      }
    }

    if (isCorrect) {
      sound.playSuccessChime();
    } else {
      sound.playErrorThud();
    }

    onAnswer(isCorrect, selectedItems);
  };

  return (
    <div className="space-y-6">
      {/* Direction Guide Banner */}
      <div className="bg-amber-100/70 p-3.5 rounded-2xl border border-amber-300 text-center font-khmer text-sm sm:text-base font-black text-amber-950 flex items-center justify-center gap-2">
        <ArrowRight className="w-4 h-4 text-amber-700" />
        <span>ទិសដៅតម្រៀប: {directionLabelKh}</span>
      </div>

      {/* 1. Sentence / Sequence Construction Tray (Destination) */}
      <div className="bg-white p-6 rounded-3xl border-3 border-dashed border-amber-400 min-h-[120px] flex flex-col justify-center items-center shadow-inner space-y-2">
        <span className="text-xs font-bold text-slate-400 font-khmer">
          {selectedItems.length === 0
            ? 'ចុចលើពាក្យ ឬលេខខាងក្រោមដើម្បីដាក់ចូលក្នុងប្រអប់នេះ'
            : 'ល្បះ ឬលំដាប់ដែលបានតម្រៀប:'}
        </span>

        <div className="flex flex-wrap items-center justify-center gap-2.5 w-full">
          {selectedItems.map((item, idx) => (
            <button
              key={item.id}
              disabled={disabled || submitted}
              onClick={() => handleTapPlaced(item)}
              className="min-h-[56px] px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-sky-500 text-white font-heading text-lg sm:text-xl font-black shadow-[0_4px_0_#1D4ED8] border border-blue-700 btn-squishy flex items-center gap-2 select-none"
              title="ចុចដើម្បីដកចេញវិញ"
            >
              <span className="w-5 h-5 rounded-full bg-white/25 text-xs flex items-center justify-center font-mono font-bold">
                {idx + 1}
              </span>
              <span>{item.labelKh}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Available Items Bank (Source) */}
      <div className="bg-amber-50/60 p-5 rounded-3xl border-2 border-amber-200 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-wider text-slate-500 font-heading">
            កាតជម្រើស (Available Tokens):
          </span>
          {selectedItems.length > 0 && !submitted && (
            <button
              onClick={handleReset}
              className="text-xs font-bold text-amber-800 hover:text-amber-950 flex items-center gap-1 bg-white px-2.5 py-1 rounded-xl border border-amber-300"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>កំណត់ឡើងវិញ</span>
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          {availableItems.length === 0 ? (
            <span className="text-xs font-bold text-emerald-700 font-khmer py-2">
              ✅ បានដាក់កាតទាំងអស់ចូលក្នុងប្រអប់រួចរាល់ហើយ!
            </span>
          ) : (
            availableItems.map(item => (
              <button
                key={item.id}
                disabled={disabled || submitted}
                onClick={() => handleTapAvailable(item)}
                className="min-h-[56px] px-5 py-3.5 rounded-2xl bg-white hover:bg-amber-100/80 text-amber-950 font-heading text-lg sm:text-xl font-black border-3 border-amber-300 shadow-sm btn-squishy flex items-center gap-2 select-none"
              >
                <span>{item.labelKh}</span>
                {item.subtext && (
                  <span className="text-xs font-normal text-slate-400 font-sans">({item.subtext})</span>
                )}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Submit / Check Action */}
      {!submitted && (
        <div className="text-center pt-2">
          <button
            onClick={handleCheck}
            disabled={selectedItems.length !== items.length || disabled}
            className={`min-h-[56px] px-8 py-3.5 rounded-2xl font-heading text-lg font-black text-white transition-all btn-squishy flex items-center justify-center gap-2 mx-auto ${
              selectedItems.length === items.length
                ? 'bg-emerald-500 hover:bg-emerald-600 border-b-4 border-emerald-700 shadow-[0_6px_0_#047857]'
                : 'bg-slate-300 text-slate-500 border-slate-400 cursor-not-allowed'
            }`}
          >
            <Sparkles className="w-5 h-5" />
            <span>ពិនិត្យចម្លើយ (Check Sequence)</span>
          </button>
        </div>
      )}
    </div>
  );
};
