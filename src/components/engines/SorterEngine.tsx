'use client';

import React, { useState, useEffect } from 'react';
import { GameLevel, SorterData, SorterMode, SorterBin, SorterEntity } from '@/types/edtech';
import { SoundFX, sound } from '@/utils/sound';
import { SpeakerButton } from '@/components/common/SpeakerButton';
import {
  Trash2,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Shapes,
  Heart,
  Boxes,
  RotateCcw,
} from 'lucide-react';

interface SorterEngineProps {
  level: GameLevel;
  onLevelComplete: (scoreGain: number) => void;
}

export const SorterEngine: React.FC<SorterEngineProps> = ({ level, onLevelComplete }) => {
  const sorterData = level.gameplayData.sorterData || {
    mode: 'eco_trash' as SorterMode,
    bounceBackOnError: true,
    bins: [
      { id: 'b-organic', nameKhmer: 'សំរាមសរីរាង្គ', colorClass: 'from-emerald-500 to-emerald-600', icon: '🍏' },
      { id: 'b-plastic', nameKhmer: 'ប្លាស្ទិក/ជ័រ', colorClass: 'from-amber-400 to-amber-500', icon: '🧴' },
      { id: 'b-paper', nameKhmer: 'ក្រដាស', colorClass: 'from-sky-400 to-sky-500', icon: '📦' },
      { id: 'b-hazardous', nameKhmer: 'គ្រោះថ្នាក់', colorClass: 'from-rose-500 to-rose-600', icon: '🔋' },
    ],
    entities: [
      { id: 'e-1', nameKhmer: 'សំបកចេក', icon: '🍌', correctBinId: 'b-organic' },
      { id: 'e-2', nameKhmer: 'ដបទឹកសុទ្ធ', icon: '🍾', correctBinId: 'b-plastic' },
      { id: 'e-3', nameKhmer: 'កេសក្រដាស', icon: '📦', correctBinId: 'b-paper' },
      { id: 'e-4', nameKhmer: 'ថ្មពិលចាស់', icon: '🔋', correctBinId: 'b-hazardous' },
      { id: 'e-5', nameKhmer: 'ស្លឹកឈើជ្រុះ', icon: '🍂', correctBinId: 'b-organic' },
      { id: 'e-6', nameKhmer: 'ថង់ប្លាស្ទិក', icon: '🛍️', correctBinId: 'b-plastic' },
    ],
  };

  const mode = sorterData.mode;
  const bins = sorterData.bins;
  const initialEntities = sorterData.entities;

  const [remainingEntities, setRemainingEntities] = useState<SorterEntity[]>([]);
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);
  const [bouncedEntityId, setBouncedEntityId] = useState<string | null>(null);
  const [sortedCounts, setSortedCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const shuffled = [...initialEntities].sort(() => Math.random() - 0.5);
    setRemainingEntities(shuffled);
    setSelectedEntityId(shuffled[0]?.id || null);
    const initialCounts: Record<string, number> = {};
    bins.forEach(b => (initialCounts[b.id] = 0));
    setSortedCounts(initialCounts);
  }, [initialEntities, bins]);

  const activeEntity = remainingEntities.find(e => e.id === selectedEntityId) || remainingEntities[0] || null;

  const handleSelectEntity = (entity: SorterEntity) => {
    SoundFX.playPop();
    setSelectedEntityId(entity.id);
  };

  const handlePlaceIntoBin = (bin: SorterBin) => {
    if (!activeEntity) return;

    if (activeEntity.correctBinId === bin.id) {
      // Correct placement!
      SoundFX.playSnap();
      SoundFX.playCoin();
      setSortedCounts(prev => ({
        ...prev,
        [bin.id]: (prev[bin.id] || 0) + 1,
      }));

      const nextList = remainingEntities.filter(e => e.id !== activeEntity.id);
      setRemainingEntities(nextList);
      setSelectedEntityId(nextList[0]?.id || null);

      if (nextList.length === 0) {
        SoundFX.playSuccess();
        SoundFX.playStar();
        setTimeout(() => {
          onLevelComplete(120);
        }, 1400);
      }
    } else {
      // Incorrect placement: physical bounce back!
      SoundFX.playGentleError();
      setBouncedEntityId(activeEntity.id);
      setTimeout(() => {
        setBouncedEntityId(null);
      }, 600);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-amber-50 rounded-3xl p-5 border-3 border-amber-200 shadow-sm flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <SpeakerButton text={level.promptText} size="md" />
          <div>
            <span className="text-xs font-black uppercase text-amber-700 tracking-wider font-sans">
              {mode === 'eco_trash' && 'បែងចែកសំរាមឆ្លាត • Eco-Trash Classification'}
              {mode === 'living_matrix' && 'របស់មានជីវិត និងគ្មានជីវិត • Living vs Non-Living'}
              {mode === 'geometry_spotter' && 'រុករករូបធរណីមាត្រ • Geometry Shape Spotter'}
            </span>
            <h3 className="text-lg sm:text-xl font-black font-kantumruy leading-relaxed overflow-visible py-1 text-amber-950">
              {level.promptText}
            </h3>
          </div>
        </div>

        <div className="shrink-0 bg-white px-3.5 py-1.5 rounded-2xl border border-amber-200 text-xs font-black text-amber-800 shadow-xs font-kantumruy">
          នៅសល់៖ {remainingEntities.length} វត្ថុ
        </div>
      </div>

      {/* Active Entity Bench with Tap-to-Select Indicator */}
      <div className="bg-gradient-to-b from-slate-50 to-amber-50 rounded-3xl p-8 border-4 border-amber-300 shadow-md flex flex-col items-center justify-center space-y-4 text-center min-h-[220px]">
        {activeEntity ? (
          <div className="flex flex-col items-center gap-2">
            <div
              onClick={() => handleSelectEntity(activeEntity)}
              className={`transition-all duration-200 flex flex-col items-center gap-2 select-none overflow-visible py-2 px-6 rounded-3xl cursor-pointer ${
                bouncedEntityId === activeEntity.id
                  ? 'animate-shake ring-4 ring-rose-400 bg-rose-50'
                  : 'ring-4 ring-indigo-500 scale-105 shadow-xl bg-white'
              }`}
            >
              <span className="text-7xl drop-shadow-md">{activeEntity.icon}</span>
              <div className="flex items-center gap-2 overflow-visible py-1">
                <h4 className="text-2xl font-black text-slate-900 font-kantumruy leading-relaxed overflow-visible py-1">
                  {activeEntity.nameKhmer}
                </h4>
                <SpeakerButton text={activeEntity.nameKhmer} size="xs" />
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-900 px-4 py-1.5 rounded-full text-xs font-bold font-kantumruy border border-indigo-300 mt-2">
              <span className="inline-block w-2 h-2 rounded-full bg-indigo-500 animate-ping mr-1" />
              <span>👆 បានជ្រើសរើស! សូមចុចលើធុងដែលត្រូវគ្នា (Tap Target Bin Below)</span>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-2">
            <span className="text-5xl block animate-bounce">🎉</span>
            <h4 className="text-xl font-black text-emerald-950 font-kantumruy leading-relaxed overflow-visible py-1">
              បានចាត់ថ្នាក់វត្ថុទាំងអស់ជោគជ័យ!
            </h4>
          </div>
        )}
      </div>

      {/* Target Bins Selection (Tap-to-Place Target Snapping) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {bins.map(bin => {
          const count = sortedCounts[bin.id] || 0;
          return (
            <button
              key={bin.id}
              onClick={() => handlePlaceIntoBin(bin)}
              disabled={!activeEntity}
              className={`p-5 rounded-3xl text-white font-extrabold shadow-lg btn-kid border-b-6 flex flex-col items-center justify-center gap-2 transition-transform active:scale-95 bg-gradient-to-b ${bin.colorClass} border-black/20 hover:scale-104 overflow-visible py-3 cursor-pointer`}
            >
              <span className="text-4xl">{bin.icon}</span>
              <h5 className="font-kantumruy font-black text-sm text-center leading-relaxed overflow-visible py-1">
                {bin.nameKhmer}
              </h5>
              <span className="text-xs font-mono font-bold bg-white/25 px-2.5 py-0.5 rounded-full mt-1">
                ប្រមូលបាន: {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
