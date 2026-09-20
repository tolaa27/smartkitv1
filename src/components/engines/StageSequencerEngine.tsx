// src/components/engines/StageSequencerEngine.tsx
// Universal Engine 5: Chronological Cycles & Stage Sequencer Engine
// Interactive stage cards snapping onto chronological rails (Butterfly, Frog, Water Cycle, 3-Panel Comics)
'use client';

import React, { useState, useEffect } from 'react';
import { GameLevel, SequencerData, SequencerMode, SequencerStage } from '@/types/game';
import { soundSynthesizer } from '@/lib/audio/SoundSynthesizer';
import { speechService } from '@/lib/audio/speechHook';
import { SpeakButton } from '@/components/audio/SpeakButton';
import {
  Sparkles,
  RotateCcw,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface StageSequencerEngineProps {
  level: GameLevel;
  onLevelComplete: (scoreGain: number) => void;
  onRestartLevel?: () => void;
}

export const StageSequencerEngine: React.FC<StageSequencerEngineProps> = ({
  level,
  onLevelComplete,
  onRestartLevel,
}) => {
  const seqData: SequencerData =
    level.gameplayData?.sequencerData ||
    level.gameplayData?.sequencer_data ||
    (level.gameplay_data as unknown as { sequencerData?: SequencerData; sequencer_data?: SequencerData })?.sequencerData ||
    (level.gameplay_data as unknown as { sequencer_data?: SequencerData })?.sequencer_data || {
      mode: 'life_cycle' as SequencerMode,
      cycleTitleKhmer: 'វដ្តជីវិតមេអំបៅ (Butterfly Life Cycle)',
      layout: 'circular',
      stages: [
        { id: 's-1', stepNumber: 1, titleKhmer: 'ពង', descriptionKhmer: 'មេអំបៅពងលើស្លឹកឈើ', iconOrImage: '🥚' },
        { id: 's-2', stepNumber: 2, titleKhmer: 'ដង្កូវ', descriptionKhmer: 'ដង្កូវញាស់ស៊ីស្លឹកឈើ', iconOrImage: '🐛' },
        { id: 's-3', stepNumber: 3, titleKhmer: 'ដឹកឌឿ', descriptionKhmer: 'ដង្កូវក្លាយជាដឹកឌឿ', iconOrImage: '🥜' },
        { id: 's-4', stepNumber: 4, titleKhmer: 'មេអំបៅ', descriptionKhmer: 'មេអំបៅហោះហើរស្រស់ស្អាត', iconOrImage: '🦋' },
      ],
    };

  const rawStages: SequencerStage[] = (seqData.stages?.length ? seqData.stages : []).length > 0
    ? seqData.stages.map((s) => ({
        id: s.id,
        stepNumber: s.stepNumber || s.step_number || 1,
        titleKhmer: s.titleKhmer || s.title_khmer || 'វគ្គ',
        descriptionKhmer: s.descriptionKhmer || s.description_khmer || '',
        iconOrImage: s.iconOrImage || s.icon_or_image || '✨',
      }))
    : (level.gameplayData?.items || []).map((item, idx) => ({
        id: item.id,
        stepNumber: typeof item.correctCategoryOrOrder === 'number' ? item.correctCategoryOrOrder : idx + 1,
        titleKhmer: item.labelKhmer || (item as unknown as { label_khmer?: string }).label_khmer || 'វគ្គ',
        descriptionKhmer: item.feedbackKhmer || item.labelEnglish || (item as unknown as { feedback_khmer?: string }).feedback_khmer || '',
        iconOrImage: item.imageOrIcon || (item as unknown as { image_or_icon?: string }).image_or_icon || '✨',
      }));

  const [availableCards, setAvailableCards] = useState<SequencerStage[]>([]);
  const [placedSlots, setPlacedSlots] = useState<(SequencerStage | null)[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  const resetStages = () => {
    const shuffled = [...rawStages].sort(() => Math.random() - 0.5);
    setAvailableCards(shuffled);
    setPlacedSlots(new Array(rawStages.length).fill(null));
    setSelectedCardId(shuffled[0]?.id || null);
  };

  useEffect(() => {
    resetStages();
  }, [level]);

  const handleSelectCard = (card: SequencerStage) => {
    soundSynthesizer.playPop();
    setSelectedCardId(card.id);
    speechService.speak(card.titleKhmer);
  };

  const handlePlaceStageInSlot = (slotIdx: number) => {
    if (!selectedCardId) return;
    const card = availableCards.find((c) => c.id === selectedCardId);
    if (!card) return;

    soundSynthesizer.playClick();
    setPlacedSlots((prev) => {
      const copy = [...prev];
      copy[slotIdx] = card;
      return copy;
    });

    const nextAvailable = availableCards.filter((c) => c.id !== card.id);
    setAvailableCards(nextAvailable);
    setSelectedCardId(nextAvailable[0]?.id || null);
  };

  const handleRemoveFromSlot = (slotIdx: number) => {
    const card = placedSlots[slotIdx];
    if (!card) return;

    soundSynthesizer.playPop();
    setPlacedSlots((prev) => {
      const copy = [...prev];
      copy[slotIdx] = null;
      return copy;
    });
    setAvailableCards((prev) => [...prev, card]);
    setSelectedCardId(card.id);
  };

  const isAllPlaced = placedSlots.every((s) => s !== null);
  const isCorrectOrder =
    isAllPlaced && placedSlots.every((s, idx) => s?.stepNumber === idx + 1);

  useEffect(() => {
    if (isCorrectOrder) {
      soundSynthesizer.playSuccess();
      soundSynthesizer.playFanfare();
      const t = setTimeout(() => {
        onLevelComplete(120);
      }, 1500);
      return () => clearTimeout(t);
    } else if (isAllPlaced && !isCorrectOrder) {
      soundSynthesizer.playError();
    }
  }, [isCorrectOrder, isAllPlaced, onLevelComplete]);

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 p-4 sm:p-6 select-none font-kantumruy">
      {/* Header Prompt */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-md border-2 border-emerald-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 text-emerald-600 text-xs sm:text-sm font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>វដ្តជីវិត និងលំដាប់លំដោយ • Stage Sequencer</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 leading-relaxed font-kantumruy">
            {level.promptText || 'សូមរៀបចំកាតតាមលំដាប់លំដោយលូតលាស់ពីដើមដល់ចប់៖'}
          </h2>
          <p className="text-sm font-bold text-emerald-700 mt-1 font-kantumruy">
            {seqData.cycleTitleKhmer || seqData.cycle_title_khmer}
          </p>
        </div>
        <div className="flex items-center gap-2 self-end sm:self-center">
          <SpeakButton text={level.promptText} size="md" variant="primary" />
          <button
            onClick={() => {
              soundSynthesizer.playClick();
              resetStages();
              if (onRestartLevel) onRestartLevel();
            }}
            title="រៀបឡើងវិញ"
            className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Chronological Rail Snapping Slots */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-lg border-2 border-slate-100 flex flex-col gap-4">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">
          រៀបលំដាប់ពីឆ្វេងទៅស្តាំ (Chronological Sequence Slots):
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {placedSlots.map((slotCard, idx) => {
            const isTarget = selectedCardId !== null && slotCard === null;

            return (
              <div key={idx} className="flex flex-col items-center">
                <div className="w-full flex items-center justify-between px-2 mb-1">
                  <span className="text-xs font-bold text-emerald-700 font-mono">
                    ដំណាក់កាល #{idx + 1}
                  </span>
                  {idx < placedSlots.length - 1 && (
                    <ArrowRight className="w-4 h-4 text-slate-300 hidden sm:block" />
                  )}
                </div>

                <div
                  onClick={() => {
                    if (slotCard) handleRemoveFromSlot(idx);
                    else handlePlaceStageInSlot(idx);
                  }}
                  className={`w-full min-h-[160px] rounded-3xl border-3 flex flex-col items-center justify-center p-3 text-center cursor-pointer transition shadow-xs ${
                    slotCard
                      ? 'bg-emerald-50/60 border-emerald-400 hover:border-emerald-600'
                      : isTarget
                      ? 'bg-emerald-50/30 border-dashed border-emerald-400 animate-pulse'
                      : 'bg-slate-50 border-dashed border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {slotCard ? (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="flex flex-col items-center gap-1"
                    >
                      <span className="text-4xl">{slotCard.iconOrImage}</span>
                      <span className="text-base font-bold text-slate-800 font-kantumruy mt-1">
                        {slotCard.titleKhmer}
                      </span>
                      <span className="text-[11px] text-slate-500 font-kantumruy leading-tight line-clamp-2">
                        {slotCard.descriptionKhmer}
                      </span>
                      <span className="text-[10px] text-rose-500 font-bold mt-2 font-kantumruy">
                        (ចុចដកចេញ)
                      </span>
                    </motion.div>
                  ) : (
                    <span className="text-xs text-slate-400 font-kantumruy">
                      ចុចដាក់ទី {idx + 1}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Available Stage Cards Dock */}
      <div className="bg-emerald-50/80 rounded-3xl p-5 border-2 border-emerald-200 shadow-sm flex flex-col gap-3">
        <p className="text-xs font-bold text-emerald-900 font-kantumruy">
          👇 ចុចជ្រើសរើសកាតខាងក្រោម រួចចុចលើប្រអប់តាមលំដាប់ ({availableCards.length} នៅសល់)៖
        </p>

        <div className="flex flex-wrap gap-3 items-center justify-center sm:justify-start min-h-[100px]">
          <AnimatePresence>
            {availableCards.map((card) => {
              const isSelected = card.id === selectedCardId;
              return (
                <motion.button
                  key={card.id}
                  layout
                  whileTap={{ scale: 0.95 }}
                  whileHover={{ scale: 1.03 }}
                  onClick={() => handleSelectCard(card)}
                  className={`px-4 py-3 rounded-2xl border-2 font-bold shadow-sm flex items-center gap-3 transition bg-white text-slate-800 ${
                    isSelected
                      ? 'ring-4 ring-emerald-500 scale-105 border-emerald-400'
                      : 'border-slate-200 hover:border-emerald-300'
                  }`}
                >
                  <span className="text-3xl">{card.iconOrImage}</span>
                  <div className="text-left">
                    <p className="text-base font-bold font-kantumruy">{card.titleKhmer}</p>
                    <p className="text-xs text-slate-500 font-kantumruy max-w-[150px] truncate">
                      {card.descriptionKhmer}
                    </p>
                  </div>
                </motion.button>
              );
            })}
          </AnimatePresence>

          {isCorrectOrder && (
            <div className="w-full py-4 flex flex-col items-center justify-center text-emerald-600 gap-1">
              <CheckCircle2 className="w-10 h-10 text-emerald-500" />
              <p className="text-base font-bold font-kantumruy">
                អបអរសាទរ! អ្នកបានរៀបចំវដ្តជីវិតបានត្រឹមត្រូវឥតខ្ចោះ!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const SequencerEngine = StageSequencerEngine;
export default StageSequencerEngine;
