'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { GameLevel } from '@/types/edtech';
import { SoundFX } from '@/utils/sound';
import { SpeakerButton } from '@/components/common/SpeakerButton';
import { CheckCircle2, RotateCcw, AlertCircle } from 'lucide-react';

interface SequencerGameProps {
  level: GameLevel;
  onLevelComplete: (scoreGain: number) => void;
}

export const SequencerGame: React.FC<SequencerGameProps> = ({ level, onLevelComplete }) => {
  const initialItems = useMemo(
    () => level.gameplayData.items || [],
    [level.gameplayData.items]
  );

  const [availableItems, setAvailableItems] = useState<typeof initialItems>([]);
  const [placedSlots, setPlacedSlots] = useState<(typeof initialItems[0] | null)[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ message: string; isCorrect: boolean } | null>(null);

  useEffect(() => {
    const shuffled = [...initialItems].sort(() => Math.random() - 0.5);
    setAvailableItems(shuffled);
    setPlacedSlots(new Array(initialItems.length).fill(null));
    setSelectedItemId(shuffled[0]?.id || null);
    setFeedback(null);
  }, [level, initialItems]);

  const handleSelectItem = (item: (typeof initialItems)[0]) => {
    SoundFX.playPop();
    setSelectedItemId(prev => (prev === item.id ? null : item.id));
  };

  const handlePlaceItemIntoSlot = (slotIdx: number) => {
    if (!selectedItemId) return;
    const item = availableItems.find(i => i.id === selectedItemId);
    if (!item) return;

    SoundFX.playSnap();
    const nextSlots = [...placedSlots];
    const displacedItem = nextSlots[slotIdx];
    nextSlots[slotIdx] = item;
    setPlacedSlots(nextSlots);

    // If slot was occupied, return displaced item back to available items
    const nextAvailable = availableItems.filter(i => i.id !== item.id);
    if (displacedItem && displacedItem.id !== item.id) {
      nextAvailable.push(displacedItem);
    }
    setAvailableItems(nextAvailable);
    setSelectedItemId(nextAvailable[0]?.id || null);
    setFeedback(null);
  };

  const handleDirectPlaceItem = (item: (typeof initialItems)[0]) => {
    SoundFX.playSnap();
    const firstEmptyIndex = placedSlots.findIndex(slot => slot === null);
    if (firstEmptyIndex === -1) {
      setSelectedItemId(item.id);
      return;
    }

    const nextSlots = [...placedSlots];
    nextSlots[firstEmptyIndex] = item;
    setPlacedSlots(nextSlots);
    const nextAvailable = availableItems.filter(i => i.id !== item.id);
    setAvailableItems(nextAvailable);
    setSelectedItemId(nextAvailable[0]?.id || null);
    setFeedback(null);
  };

  const handleRemoveFromSlot = (index: number) => {
    const item = placedSlots[index];
    if (!item) return;

    SoundFX.playPop();
    const nextSlots = [...placedSlots];
    nextSlots[index] = null;
    setPlacedSlots(nextSlots);
    setAvailableItems(prev => [...prev, item]);
    setSelectedItemId(item.id);
    setFeedback(null);
  };

  const handleReset = () => {
    SoundFX.playPop();
    const shuffled = [...initialItems].sort(() => Math.random() - 0.5);
    setAvailableItems(shuffled);
    setPlacedSlots(new Array(initialItems.length).fill(null));
    setSelectedItemId(shuffled[0]?.id || null);
    setFeedback(null);
  };

  const handleVerifySequence = () => {
    if (feedback?.isCorrect) return; // Prevent double invocation
    const isAllPlaced = placedSlots.every(slot => slot !== null);
    if (!isAllPlaced) return;

    const isCorrect = placedSlots.every((slot, idx) => {
      if (!slot) return false;
      const raw = slot.correctCategoryOrOrder;
      const expectedOrder =
        typeof raw === 'number'
          ? raw
          : raw != null
          ? parseInt(String(raw), 10)
          : idx + 1;
      return expectedOrder === idx + 1;
    });

    if (isCorrect) {
      SoundFX.playSuccess();
      SoundFX.playStar();
      setFeedback({
        message: 'អបអរសាទរ! លំដាប់ដំណើរការនេះត្រឹមត្រូវទាំងស្រុង! 🎉',
        isCorrect: true,
      });
      setTimeout(() => {
        onLevelComplete(120);
      }, 1000);
    } else {
      SoundFX.playGentleError();
      setFeedback({
        message: 'លំដាប់លំដោយមិនទាន់ត្រូវទេ! ចុចលើប្រអប់ដើម្បីរៀបចំឡើងវិញណា៎! 😊',
        isCorrect: false,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Prompt Banner with Speaker */}
      <div className="bg-sky-50 rounded-2xl p-4 border-2 border-sky-200 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <SpeakerButton text={level.promptText} size="sm" />
          <p className="text-base sm:text-lg font-extrabold text-sky-950 font-kantumruy leading-relaxed overflow-visible py-1">
            {level.promptText}
          </p>
        </div>
        <button
          onClick={handleReset}
          className="flex items-center gap-1 text-xs font-bold text-slate-600 bg-white hover:bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-300 shadow-xs cursor-pointer font-kantumruy"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>រៀបឡើងវិញ</span>
        </button>
      </div>

      {/* Target Ordered Track */}
      <div className="bg-white rounded-3xl p-6 border-4 border-sky-300 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-sky-100 pb-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider font-sans">
            លំដាប់លំដោយ (Ordered Sequence Track) — ចុចលើប្រអប់ដើម្បីដាក់ ឬដកចេញ:
          </span>
          <span className="text-xs font-mono font-bold text-sky-700 bg-sky-100 px-2.5 py-0.5 rounded-full">
            {placedSlots.filter(s => s !== null).length}/{initialItems.length}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {placedSlots.map((slot, index) => {
            const isTarget = selectedItemId !== null && slot === null;
            return (
              <div key={index} className="flex flex-col items-center">
                <div
                  onClick={() => {
                    if (slot) {
                      handleRemoveFromSlot(index);
                    } else if (selectedItemId) {
                      handlePlaceItemIntoSlot(index);
                    }
                  }}
                  className={`w-full min-h-[145px] rounded-2xl border-3 flex flex-col items-center justify-center p-3 text-center transition-all cursor-pointer ${
                    slot
                      ? 'bg-amber-50 border-amber-400 hover:bg-rose-50 hover:border-rose-400 shadow-sm'
                      : isTarget
                      ? 'bg-indigo-50 border-indigo-400 ring-4 ring-indigo-300 animate-pulse'
                      : 'bg-slate-50 border-dashed border-slate-300'
                  }`}
                >
                  <div className="w-7 h-7 rounded-full bg-sky-500 text-white font-black text-xs flex items-center justify-center mb-1 shadow-xs font-mono">
                    {index + 1}
                  </div>
                  {slot ? (
                    <>
                      <span className="text-3xl mb-1">{slot.imageOrIcon}</span>
                      <div className="flex items-center gap-1 overflow-visible py-0.5">
                        <span className="font-kantumruy font-bold text-xs sm:text-sm text-slate-800 line-clamp-2 leading-relaxed overflow-visible">
                          {slot.labelKhmer}
                        </span>
                        <SpeakerButton text={slot.labelKhmer} size="xs" />
                      </div>
                      <span className="text-[10px] text-rose-500 font-semibold mt-1 font-kantumruy">
                        ✕ ចុចដើម្បីដកចេញ
                      </span>
                    </>
                  ) : (
                    <span className="text-xs text-slate-400 font-kantumruy">
                      {isTarget ? '👉 ចុចដាក់ទីនេះ' : `ដំណាក់កាលទី ${index + 1}`}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Unordered Available Step Cards (Tap-to-Select Tray) */}
      <div className="bg-amber-50/70 rounded-3xl p-5 border-3 border-amber-200 space-y-3">
        <span className="text-xs font-bold text-amber-900 uppercase tracking-wider block font-sans">
          ជ្រើសរើសដំណាក់កាល (Tap a step card to select or place):
        </span>

        {availableItems.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {availableItems.map(item => {
              const isSelected = selectedItemId === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelectItem(item)}
                  className={`p-3.5 rounded-2xl border-2 btn-kid transition-all flex flex-col items-center justify-center text-center shadow-xs cursor-pointer gap-1 overflow-visible select-none ${
                    isSelected
                      ? 'bg-white text-indigo-950 ring-4 ring-indigo-500 scale-105 shadow-xl border-indigo-400'
                      : 'bg-white hover:bg-amber-100 border-amber-300 text-slate-900'
                  }`}
                >
                  <span className="text-3xl mb-1">{item.imageOrIcon}</span>
                  <span className="font-kantumruy font-bold text-xs sm:text-sm leading-relaxed overflow-visible py-0.5">
                    {item.labelKhmer}
                  </span>
                  <SpeakerButton text={item.labelKhmer} size="xs" />
                  {isSelected && (
                    <span className="text-[10px] font-black text-indigo-800 bg-indigo-100 px-2 py-0.5 rounded-full mt-0.5 font-sans">
                      បានជ្រើស ✓
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-2 text-xs font-bold text-emerald-800 font-kantumruy">
            បានរៀបចំកាតទាំងអស់ចូលក្នុងប្រអប់រួចរាល់!
          </div>
        )}

        {/* Verification Button */}
        <button
          onClick={handleVerifySequence}
          disabled={placedSlots.some(slot => slot === null)}
          className="w-full mt-3 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 text-white font-extrabold text-base shadow-md btn-kid flex items-center justify-center gap-2 border-b-4 border-emerald-700 cursor-pointer font-kantumruy"
        >
          <CheckCircle2 className="w-5 h-5" />
          <span>ផ្ទៀងផ្ទាត់លំដាប់ (Check Order)</span>
        </button>
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
