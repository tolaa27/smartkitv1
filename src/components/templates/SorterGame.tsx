'use client';

import React, { useState, useEffect } from 'react';
import { GameLevel } from '@/types/edtech';
import { SoundFX, sound } from '@/utils/sound';
import { SpeakerButton } from '@/components/common/SpeakerButton';
import { CheckCircle2, Sparkles, AlertCircle } from 'lucide-react';

interface SorterGameProps {
  level: GameLevel;
  onLevelComplete: (scoreGain: number) => void;
}

export const SorterGame: React.FC<SorterGameProps> = ({ level, onLevelComplete }) => {
  const categories = level.gameplayData.categories || [];
  const initialItems = level.gameplayData.items || [];

  const [unassignedItems, setUnassignedItems] = useState(initialItems);
  const [selectedItem, setSelectedItem] = useState<(typeof initialItems)[0] | null>(null);
  const [sortedBuckets, setSortedBuckets] = useState<{ [catId: string]: typeof initialItems }>({});
  const [feedback, setFeedback] = useState<{ message: string; isCorrect: boolean } | null>(null);
  const [isCompleting, setIsCompleting] = useState<boolean>(false);

  useEffect(() => {
    const items = level.gameplayData.items || [];
    setUnassignedItems(items);
    setSelectedItem(items[0] || null);
    setSortedBuckets({});
    setFeedback(null);
    setIsCompleting(false);
  }, [level]);

  const handleSelectItem = (item: (typeof initialItems)[0]) => {
    if (isCompleting) return;
    SoundFX.playPop();
    setSelectedItem(item);
    setFeedback(null);
  };

  const handleAssignToCategory = (catId: string) => {
    if (isCompleting) return;

    if (!selectedItem) {
      SoundFX.playGentleError();
      setFeedback({
        message: 'សូមចុចជ្រើសរើសវត្ថុខាងលើជាមុនសិន! 👆',
        isCorrect: false,
      });
      return;
    }

    if (selectedItem.correctCategoryOrOrder === catId) {
      SoundFX.playSnap();
      SoundFX.playCoin();
      const nextBuckets = {
        ...sortedBuckets,
        [catId]: [...(sortedBuckets[catId] || []), selectedItem],
      };
      setSortedBuckets(nextBuckets);

      const nextUnassigned = unassignedItems.filter(i => i.id !== selectedItem.id);
      setUnassignedItems(nextUnassigned);
      setSelectedItem(nextUnassigned[0] || null);
      setFeedback({
        message: selectedItem.feedbackKhmer || 'ត្រឹមត្រូវហើយ! ពូកែណាស់! 🎉',
        isCorrect: true,
      });

      if (nextUnassigned.length === 0) {
        setIsCompleting(true);
        SoundFX.playSuccess();
        SoundFX.playStar();
        setTimeout(() => {
          onLevelComplete(100);
        }, 900);
      }
    } else {
      SoundFX.playGentleError();
      setFeedback({
        message: 'មិនទាន់ត្រឹមត្រូវទេ! សាកល្បងម្ដងទៀតណា៎! 😊',
        isCorrect: false,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Prompt / Instruction Header with Voice Trigger */}
      <div className="bg-amber-50 rounded-2xl p-4 border-2 border-amber-200 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <SpeakerButton text={level.promptText} size="sm" />
          <p className="text-base sm:text-lg font-extrabold text-amber-950 font-khmer">
            {level.promptText}
          </p>
        </div>
        <span className="text-xs bg-amber-200 text-amber-900 font-black px-3 py-1 rounded-full shrink-0">
          នៅសល់: {unassignedItems.length}
        </span>
      </div>

      {/* Available Items Pool */}
      <div className="bg-white rounded-3xl p-5 border-3 border-amber-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            ចុចជ្រើសរើសវត្ថុ (Tap an item to sort):
          </span>
          <span className="text-[11px] text-amber-700 font-bold">
            ចុច 🔊 ដើម្បីស្ដាប់សំឡេង
          </span>
        </div>
        <div className="flex flex-wrap gap-3">
          {unassignedItems.map(item => {
            const isSelected = selectedItem?.id === item.id;
            return (
              <div
                key={item.id}
                onClick={() => handleSelectItem(item)}
                className={`px-4 py-2.5 rounded-2xl font-bold flex items-center gap-2 cursor-pointer btn-kid transition-all overflow-visible select-none ${
                  isSelected
                    ? 'bg-white text-indigo-950 ring-4 ring-indigo-500 scale-105 shadow-xl border-2 border-indigo-400'
                    : 'bg-slate-50 hover:bg-amber-50 text-slate-800 border-2 border-slate-200'
                }`}
              >
                <span className="text-2xl">{item.imageOrIcon}</span>
                <span className="font-kantumruy font-black text-base leading-relaxed overflow-visible py-1">{item.labelKhmer}</span>
                <SpeakerButton text={item.labelKhmer} size="xs" />
                {isSelected && (
                  <span className="text-[10px] font-black text-indigo-800 bg-indigo-100 px-2 py-0.5 rounded-full ml-1">
                    បានជ្រើស ✓
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Category Buckets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {categories.map(cat => {
          const itemsInCat = sortedBuckets[cat.id] || [];
          return (
            <div
              key={cat.id}
              onClick={() => handleAssignToCategory(cat.id)}
              className="bg-gradient-to-b from-white to-amber-50/50 rounded-3xl p-5 border-3 border-amber-300 hover:border-amber-500 cursor-pointer shadow-sm hover:shadow-md transition-all space-y-3 min-h-[200px] flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between border-b border-amber-200 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{cat.icon}</span>
                    <div>
                      <h4 className="font-extrabold text-amber-950 font-khmer text-base leading-tight">
                        {cat.nameKhmer}
                      </h4>
                      <span className="text-[11px] text-slate-500">{cat.nameEnglish}</span>
                    </div>
                  </div>
                  <SpeakerButton text={cat.nameKhmer} size="xs" />
                </div>

                {/* Items dropped inside */}
                <div className="flex flex-wrap gap-2 pt-3">
                  {itemsInCat.map(item => (
                    <span
                      key={item.id}
                      className="bg-white px-2.5 py-1.5 rounded-xl text-xs font-bold border border-amber-200 text-amber-950 flex items-center gap-1.5 shadow-xs"
                    >
                      <span>{item.imageOrIcon}</span>
                      <span className="font-khmer">{item.labelKhmer}</span>
                    </span>
                  ))}
                </div>
              </div>

              <div className="text-center pt-2">
                <span className="text-[11px] text-amber-800 bg-amber-100/90 px-3 py-1 rounded-full font-black">
                  ដាក់ចូលត្រង់នេះ ({itemsInCat.length})
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Feedback Alert */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl border-2 font-bold text-sm flex items-center gap-2 animate-bounce ${
            feedback.isCorrect
              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
              : 'bg-rose-50 text-rose-800 border-rose-300'
          }`}
        >
          {feedback.isCorrect ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}
    </div>
  );
};
