'use client';

import React, { useState, useEffect } from 'react';
import { GameLevel, SequencerData, SequencerMode, SequencerStage } from '@/types/edtech';
import { SoundFX, sound } from '@/utils/sound';
import { SpeakerButton } from '@/components/common/SpeakerButton';
import {
  RotateCcw,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
} from 'lucide-react';

interface SequencerEngineProps {
  level: GameLevel;
  onLevelComplete: (scoreGain: number) => void;
}

export const SequencerEngine: React.FC<SequencerEngineProps> = ({ level, onLevelComplete }) => {
  const seqData = level.gameplayData.sequencerData || {
    mode: 'life_cycle' as SequencerMode,
    cycleTitleKhmer: 'វដ្តជីវិតមេអំបៅ (Butterfly Life Cycle)',
    stages: [
      { id: 's-1', stepNumber: 1, titleKhmer: 'ពង', descriptionKhmer: 'មេអំបៅពងលើស្លឹកឈើ', iconOrImage: '🥚' },
      { id: 's-2', stepNumber: 2, titleKhmer: 'ដង្កូវ', descriptionKhmer: 'ដង្កូវញាស់ស៊ីស្លឹកឈើ', iconOrImage: '🐛' },
      { id: 's-3', stepNumber: 3, titleKhmer: 'ដឹកឌឿ', descriptionKhmer: 'ដង្កូវក្លាយជាដឹកឌឿ', iconOrImage: '🥜' },
      { id: 's-4', stepNumber: 4, titleKhmer: 'មេអំបៅ', descriptionKhmer: 'មេអំបៅហោះហើរស្រស់ស្អាត', iconOrImage: '🦋' },
    ],
  };

  const mode = seqData.mode;
  const stages = seqData.stages;

  const [availableCards, setAvailableCards] = useState<SequencerStage[]>([]);
  const [placedSlots, setPlacedSlots] = useState<(SequencerStage | null)[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  useEffect(() => {
    const shuffled = [...stages].sort(() => Math.random() - 0.5);
    setAvailableCards(shuffled);
    setPlacedSlots(new Array(stages.length).fill(null));
    setSelectedCardId(shuffled[0]?.id || null);
  }, [stages]);

  const handlePlaceStageInSlot = (slotIdx: number, card: SequencerStage) => {
    SoundFX.playSnap();
    setPlacedSlots(prev => {
      const copy = [...prev];
      copy[slotIdx] = card;
      return copy;
    });

    const nextAvailable = availableCards.filter(c => c.id !== card.id);
    setAvailableCards(nextAvailable);
    setSelectedCardId(nextAvailable[0]?.id || null);
  };

  const handleRemoveFromSlot = (slotIdx: number) => {
    const card = placedSlots[slotIdx];
    if (!card) return;

    SoundFX.playPop();
    setPlacedSlots(prev => {
      const copy = [...prev];
      copy[slotIdx] = null;
      return copy;
    });
    setAvailableCards(prev => [...prev, card]);
    setSelectedCardId(card.id);
  };

  const handleReset = () => {
    SoundFX.playPop();
    const shuffled = [...stages].sort(() => Math.random() - 0.5);
    setAvailableCards(shuffled);
    setPlacedSlots(new Array(stages.length).fill(null));
    setSelectedCardId(shuffled[0]?.id || null);
  };

  // Validation
  const isAllPlaced = placedSlots.every(s => s !== null);
  const isCorrectOrder =
    isAllPlaced && placedSlots.every((s, idx) => s?.stepNumber === idx + 1);

  useEffect(() => {
    if (isCorrectOrder) {
      SoundFX.playSuccess();
      SoundFX.playStar();
      const t = setTimeout(() => {
        onLevelComplete(120);
      }, 1500);
      return () => clearTimeout(t);
    } else if (isAllPlaced && !isCorrectOrder) {
      SoundFX.playGentleError();
    }
  }, [isCorrectOrder, isAllPlaced, onLevelComplete]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-emerald-50 rounded-3xl p-5 border-3 border-emerald-200 shadow-sm flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <SpeakerButton text={level.promptText} size="md" />
          <div>
            <span className="text-xs font-black uppercase text-emerald-700 tracking-wider font-sans">
              {mode === 'life_cycle' && 'វដ្តជីវិត និងការលូតលាស់ • Life Cycle Sequence'}
              {mode === 'water_cycle' && 'វដ្តនៃទឹកធម្មជាតិ • Atmospheric Water Cycle'}
              {mode === 'comic_strip' && 'រឿងរូបភាព ៣ វគ្គ • 3-Panel Comic Sequence'}
            </span>
            <h3 className="text-lg sm:text-xl font-black font-kantumruy text-emerald-950 leading-relaxed overflow-visible py-1">
              {level.promptText}
            </h3>
          </div>
        </div>

        <button
          onClick={handleReset}
          className="px-3.5 py-2 rounded-xl bg-white hover:bg-emerald-100 border border-emerald-300 text-xs font-bold text-emerald-900 flex items-center gap-1.5 btn-kid shadow-xs font-kantumruy cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>រៀបឡើងវិញ</span>
        </button>
      </div>

      {/* Slots Grid (Tap-to-Place Target Snapping) */}
      <div className="bg-white rounded-3xl p-8 border-4 border-emerald-300 shadow-md space-y-6">
        <div className="text-center mb-2">
          <h4 className="text-xl font-black font-kantumruy text-emerald-950 leading-relaxed overflow-visible py-1">
            {seqData.cycleTitleKhmer}
          </h4>
          <p className="text-xs text-slate-500 font-kantumruy pt-1">
            👆 ចុចជ្រើសរើសកាត រួចចុចលើប្រអប់តាមលំដាប់ (Tap Card Below, Then Tap Slot)
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {placedSlots.map((slotCard, idx) => {
            const isTarget = selectedCardId !== null && slotCard === null;
            return (
              <div
                key={idx}
                onClick={() => {
                  if (selectedCardId && !slotCard) {
                    const card = availableCards.find(c => c.id === selectedCardId);
                    if (card) {
                      handlePlaceStageInSlot(idx, card);
                    }
                  } else if (slotCard) {
                    handleRemoveFromSlot(idx);
                  }
                }}
                className={`min-h-[170px] rounded-3xl border-3 border-dashed flex flex-col items-center justify-center p-3 text-center transition-all relative overflow-visible ${
                  slotCard
                    ? 'bg-emerald-50 border-emerald-400 shadow-md cursor-pointer hover:bg-rose-50/50'
                    : isTarget
                    ? 'bg-indigo-50/70 border-indigo-400 ring-4 ring-indigo-300 animate-pulse cursor-pointer'
                    : 'bg-slate-50 border-slate-300'
                }`}
              >
                {/* Step number badge */}
                <span className="absolute top-2 left-3 text-xs font-mono font-black text-emerald-800 bg-white px-2 py-0.5 rounded-full border border-emerald-200">
                  ជំហាន {idx + 1}
                </span>

                {slotCard ? (
                  <div
                    className="space-y-1 mt-3 overflow-visible py-1 select-none"
                    title="ចុចដើម្បីដកចេញ (Click to remove)"
                  >
                    <span className="text-4xl block animate-scale-in">{slotCard.iconOrImage}</span>
                    <h5 className="font-black text-emerald-950 font-kantumruy text-sm leading-relaxed overflow-visible py-1">
                      {slotCard.titleKhmer}
                    </h5>
                    <p className="text-[10px] text-slate-500 font-kantumruy line-clamp-1 leading-normal">
                      {slotCard.descriptionKhmer}
                    </p>
                    <span className="text-[10px] text-rose-500 font-bold block pt-1 font-kantumruy">✕ ចុចដកចេញ</span>
                  </div>
                ) : (
                  <div className="space-y-1 mt-4">
                    <span className="text-xs text-indigo-700 font-kantumruy font-bold block">
                      {isTarget ? '👉 ចុចដាក់ទីនេះ' : 'ប្រអប់ទទេ ▢'}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Available Stage Cards Selection (Tap-to-Select Tray) */}
      <div className="bg-emerald-50/70 rounded-3xl p-6 border-3 border-emerald-200 shadow-sm space-y-3">
        <span className="text-xs font-black text-emerald-900 block uppercase tracking-wide font-sans">
          កាតដំណាក់កាលសម្រាប់ជ្រើសរើស (Stage Cards) — ចុចជ្រើសរើសដើម្បីដាក់:
        </span>

        {availableCards.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {availableCards.map(card => {
              const isSelected = selectedCardId === card.id;
              return (
                <button
                  key={card.id}
                  onClick={() => {
                    SoundFX.playPop();
                    setSelectedCardId(isSelected ? null : card.id);
                  }}
                  className={`p-4 rounded-2xl border-2 shadow-xs flex flex-col items-center justify-center text-center gap-1.5 btn-kid transition-all overflow-visible py-2 select-none cursor-pointer ${
                    isSelected
                      ? 'ring-4 ring-indigo-500 scale-105 shadow-xl bg-white border-indigo-400'
                      : 'bg-white hover:bg-emerald-100 border-emerald-300'
                  }`}
                >
                  <span className="text-3xl drop-shadow-sm">{card.iconOrImage}</span>
                  <p className="font-black text-emerald-950 font-kantumruy text-xs leading-relaxed overflow-visible py-1">
                    {card.titleKhmer}
                  </p>
                  <span className="text-[10px] text-slate-500 font-kantumruy leading-normal">
                    {card.descriptionKhmer}
                  </span>
                  {isSelected && (
                    <span className="text-[10px] font-black text-indigo-900 bg-indigo-100 px-2.5 py-0.5 rounded-full mt-1 font-kantumruy">
                      បានជ្រើស ✓ ចុចលើប្រអប់
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-4">
            <span className="text-sm font-bold text-emerald-800 font-kantumruy">
              {isCorrectOrder ? '✨ រៀបចំបានត្រឹមត្រូវទាំងស្រុង! (Perfect sequence!)' : 'បានដាក់កាតទាំងអស់ក្នុងប្រអប់រួចរាល់!'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
