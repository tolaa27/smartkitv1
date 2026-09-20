// src/components/engines/SpatialSorterEngine.tsx
// Universal Engine 1: Spatial & Attribute Sorter (Tap-to-Select -> Tap-to-Place)
// 100% Touch & Mobile-Tablet Friendly: Replaces fragile HTML5 drag-and-drop
'use client';

import React, { useState, useEffect, useId } from 'react';
import { GameLevel, SorterData, SorterBin, SorterEntity } from '@/types/game';
import { soundSynthesizer } from '@/lib/audio/SoundSynthesizer';
import { speechService } from '@/lib/audio/speechHook';
import { SpeakButton } from '@/components/audio/SpeakButton';
import { Sparkles, CheckCircle2, RotateCcw, ArrowDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SpatialSorterEngineProps {
  level: GameLevel;
  onLevelComplete: (scoreGain: number) => void;
  onRestartLevel?: () => void;
}

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export const SpatialSorterEngine: React.FC<SpatialSorterEngineProps> = ({
  level,
  onLevelComplete,
  onRestartLevel,
}) => {
  // Extract sorter data with fallback compatibility (handles both camelCase and snake_case)
  const sorterData: SorterData =
    level.gameplayData?.sorterData ||
    level.gameplayData?.sorter_data ||
    (level.gameplay_data as unknown as { sorterData?: SorterData; sorter_data?: SorterData })?.sorterData ||
    (level.gameplay_data as unknown as { sorter_data?: SorterData })?.sorter_data || {
      mode: 'eco_trash',
      bins: [
        { id: 'b-organic', nameKhmer: 'សំរាមសរីរាង្គ', colorClass: 'from-emerald-500 to-emerald-600', icon: '🍏' },
        { id: 'b-plastic', nameKhmer: 'ប្លាស្ទិក/ជ័រ', colorClass: 'from-amber-400 to-amber-500', icon: '🧴' },
        { id: 'b-paper', nameKhmer: 'ក្រដាស', colorClass: 'from-sky-400 to-sky-500', icon: '📦' },
      ],
      entities: [
        { id: 'e-1', nameKhmer: 'សំបកចេក', icon: '🍌', correctBinId: 'b-organic' },
        { id: 'e-2', nameKhmer: 'ដបទឹកសុទ្ធ', icon: '🍾', correctBinId: 'b-plastic' },
        { id: 'e-3', nameKhmer: 'កេសក្រដាស', icon: '📦', correctBinId: 'b-paper' },
      ],
    };

  const bins: SorterBin[] = (sorterData.bins?.length ? sorterData.bins : []).length > 0
    ? sorterData.bins.map((b) => ({
        id: b.id,
        nameKhmer: b.nameKhmer || b.name_khmer || 'ក្រុម',
        colorClass: b.colorClass || b.color_class || 'from-indigo-500 to-indigo-600',
        icon: b.icon || '📁',
      }))
    : (level.gameplayData?.categories || []).map((cat, idx) => ({
        id: cat.id,
        nameKhmer: cat.nameKhmer || (cat as unknown as { name_khmer?: string }).name_khmer || 'ក្រុម',
        colorClass:
          idx === 0
            ? 'from-emerald-500 to-emerald-600'
            : idx === 1
            ? 'from-amber-400 to-amber-500'
            : idx === 2
            ? 'from-sky-400 to-sky-500'
            : 'from-rose-500 to-rose-600',
        icon: cat.icon || '📦',
      }));

  const rawEntities: SorterEntity[] = (sorterData.entities?.length ? sorterData.entities : []).length > 0
    ? sorterData.entities.map((e) => ({
        id: e.id,
        nameKhmer: e.nameKhmer || e.name_khmer || 'វត្ថុ',
        icon: e.icon || '✨',
        correctBinId: e.correctBinId || e.correct_bin_id || bins[0]?.id || 'b1',
        feedbackKhmer: e.feedbackKhmer || e.feedback_khmer,
      }))
    : (level.gameplayData?.items || []).map((item) => ({
        id: item.id,
        nameKhmer: item.labelKhmer || (item as unknown as { label_khmer?: string }).label_khmer || 'វត្ថុ',
        icon: item.imageOrIcon || (item as unknown as { image_or_icon?: string }).image_or_icon || '✨',
        correctBinId: String(item.correctCategoryOrOrder ?? (item as unknown as { correct_category_or_order?: string | number }).correct_category_or_order ?? bins[0]?.id ?? 'b1'),
        feedbackKhmer: item.feedbackKhmer || (item as unknown as { feedback_khmer?: string }).feedback_khmer,
      }));

  const [remainingEntities, setRemainingEntities] = useState<SorterEntity[]>([]);
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);
  const [bouncedEntityId, setBouncedEntityId] = useState<string | null>(null);
  const [placedBinCounts, setPlacedBinCounts] = useState<Record<string, number>>({});
  const [placedItems, setPlacedItems] = useState<Record<string, SorterEntity[]>>({});
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // Procedural Re-seeding & Reset on mount or level change
  const resetGame = () => {
    const shuffled = shuffleArray(rawEntities);
    setRemainingEntities(shuffled);
    setSelectedEntityId(shuffled[0]?.id || null);
    const initialCounts: Record<string, number> = {};
    const initialPlaced: Record<string, SorterEntity[]> = {};
    bins.forEach((b) => {
      initialCounts[b.id] = 0;
      initialPlaced[b.id] = [];
    });
    setPlacedBinCounts(initialCounts);
    setPlacedItems(initialPlaced);
    setBouncedEntityId(null);
    setIsCompleted(false);
  };

  useEffect(() => {
    resetGame();
  }, [level]);

  const activeEntity = remainingEntities.find((e) => e.id === selectedEntityId) || remainingEntities[0] || null;

  const handleSelectEntity = (entity: SorterEntity) => {
    soundSynthesizer.playPop();
    setSelectedEntityId(entity.id);
    speechService.speak(entity.nameKhmer);
  };

  const handlePlaceIntoBin = (bin: SorterBin) => {
    if (!activeEntity) return;

    if (activeEntity.correctBinId === bin.id) {
      // 1. Success placement: Pentatonic chord + coin pickup
      soundSynthesizer.playSuccess();
      soundSynthesizer.playCoin();

      // Read feedback if available
      if (activeEntity.feedbackKhmer) {
        speechService.speak(activeEntity.feedbackKhmer);
      }

      setPlacedBinCounts((prev) => ({
        ...prev,
        [bin.id]: (prev[bin.id] || 0) + 1,
      }));

      setPlacedItems((prev) => ({
        ...prev,
        [bin.id]: [...(prev[bin.id] || []), activeEntity],
      }));

      const nextRemaining = remainingEntities.filter((e) => e.id !== activeEntity.id);
      setRemainingEntities(nextRemaining);
      setSelectedEntityId(nextRemaining[0]?.id || null);

      if (nextRemaining.length === 0) {
        setIsCompleted(true);
        soundSynthesizer.playFanfare();
        setTimeout(() => {
          onLevelComplete(120);
        }, 1600);
      }
    } else {
      // 2. Incorrect placement: Gentle non-punitive error thud (180Hz -> 110Hz) & physical bounce
      soundSynthesizer.playError();
      setBouncedEntityId(activeEntity.id);
      setTimeout(() => {
        setBouncedEntityId(null);
      }, 500);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 p-4 sm:p-6 select-none font-kantumruy">
      {/* Level Prompt & Audio Header */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-md border-2 border-indigo-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 text-indigo-600 text-xs sm:text-sm font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>ម៉ាស៊ីនតម្រៀបវត្ថុឆ្លាតវៃ • Spatial Sorter</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 leading-relaxed font-kantumruy">
            {level.promptText || 'សូមជ្រើសរើសរូបភាព រួចចុចលើប្រអប់ដែលត្រូវគ្នា៖'}
          </h2>
        </div>
        <div className="flex items-center gap-2 self-end sm:self-center">
          <SpeakButton text={level.promptText} size="md" variant="primary" />
          <button
            onClick={() => {
              soundSynthesizer.playClick();
              resetGame();
              if (onRestartLevel) onRestartLevel();
            }}
            title="លេងឡើងវិញ"
            className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Target Destination Bins (Tap-to-Place Targets) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {bins.map((bin) => {
          const count = placedBinCounts[bin.id] || 0;
          const itemsInBin = placedItems[bin.id] || [];

          return (
            <motion.button
              key={bin.id}
              whileTap={{ scale: 0.97 }}
              onClick={() => handlePlaceIntoBin(bin)}
              disabled={!activeEntity || isCompleted}
              className={`relative flex flex-col rounded-3xl p-5 border-3 transition-all duration-200 text-left shadow-lg overflow-hidden group ${
                activeEntity
                  ? 'border-indigo-300 hover:border-indigo-500 hover:shadow-indigo-100 hover:shadow-xl cursor-pointer bg-white'
                  : 'border-slate-200 bg-slate-50 cursor-default opacity-80'
              }`}
            >
              <div
                className={`w-full py-2.5 px-4 rounded-2xl bg-gradient-to-r ${bin.colorClass} text-white font-bold flex items-center justify-between mb-4 shadow-sm`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{bin.icon}</span>
                  <span className="text-base sm:text-lg font-kantumruy font-bold drop-shadow-xs">
                    {bin.nameKhmer}
                  </span>
                </div>
                <span className="bg-white/25 backdrop-blur-xs text-xs px-2.5 py-1 rounded-full font-mono">
                  {count}
                </span>
              </div>

              {/* Destination Placement Tray */}
              <div className="min-h-[100px] w-full rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/80 p-3 flex flex-wrap gap-2 items-start content-start">
                {itemsInBin.length === 0 ? (
                  <div className="w-full h-full flex flex-col items-center justify-center py-6 text-slate-400">
                    <ArrowDown className="w-5 h-5 mb-1 animate-bounce opacity-60" />
                    <span className="text-xs font-kantumruy">ចុចដាក់ត្រង់នេះ</span>
                  </div>
                ) : (
                  itemsInBin.map((it, idx) => (
                    <motion.div
                      key={`${it.id}_${idx}`}
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="bg-white px-2.5 py-1.5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-1.5 text-xs font-semibold text-slate-700"
                    >
                      <span className="text-base">{it.icon}</span>
                      <span className="font-kantumruy">{it.nameKhmer}</span>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Remaining Entity Dock (Tap-to-Select) */}
      <div className="bg-amber-50/80 rounded-3xl p-5 border-2 border-amber-200/80 shadow-sm flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-amber-800 text-sm font-bold">
            <span>👇 ចុចជ្រើសរើសវត្ថុខាងក្រោម ({remainingEntities.length} នៅសល់)៖</span>
          </div>
          {activeEntity && (
            <span className="text-xs bg-indigo-100 text-indigo-700 font-bold px-3 py-1 rounded-full animate-pulse">
              បានជ្រើស៖ {activeEntity.nameKhmer}
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-3 items-center justify-center sm:justify-start min-h-[90px]">
          <AnimatePresence>
            {remainingEntities.map((entity) => {
              const isSelected = entity.id === selectedEntityId;
              const isBouncing = entity.id === bouncedEntityId;

              return (
                <motion.button
                  key={entity.id}
                  layout
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{
                    scale: isSelected ? 1.05 : 1,
                    opacity: 1,
                    x: isBouncing ? [-8, 8, -6, 6, -3, 3, 0] : 0,
                  }}
                  exit={{ scale: 0.3, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSelectEntity(entity)}
                  className={`relative px-4 py-3 rounded-2xl font-bold flex items-center gap-2.5 transition-all text-slate-800 bg-white shadow-md border-2 ${
                    isSelected
                      ? 'ring-4 ring-indigo-500 scale-105 border-indigo-400 bg-indigo-50/50'
                      : 'border-slate-200 hover:border-indigo-300'
                  } ${isBouncing ? 'ring-4 ring-rose-400 bg-rose-50 border-rose-400' : ''}`}
                >
                  <span className="text-2xl sm:text-3xl">{entity.icon}</span>
                  <span className="text-base sm:text-lg font-kantumruy font-bold">
                    {entity.nameKhmer}
                  </span>
                  {isSelected && (
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-ping" />
                  )}
                </motion.button>
              );
            })}
          </AnimatePresence>

          {remainingEntities.length === 0 && (
            <div className="w-full py-6 flex flex-col items-center justify-center text-emerald-600 gap-2">
              <CheckCircle2 className="w-12 h-12 text-emerald-500" />
              <p className="text-lg font-bold font-kantumruy">
                អបអរសាទរ! អ្នកបានតម្រៀបបានត្រឹមត្រូវទាំងអស់!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const SorterEngine = SpatialSorterEngine;
export default SpatialSorterEngine;
