'use client';

import React, { useState } from 'react';
import { GameLevel } from '@/types/edtech';
import { SoundFX, sound } from '@/utils/sound';
import { SpeakerButton } from '@/components/common/SpeakerButton';
import { Sparkles, CheckCircle2, Info, Compass } from 'lucide-react';

interface HotspotGameProps {
  level: GameLevel;
  onLevelComplete: (scoreGain: number) => void;
}

export const HotspotGame: React.FC<HotspotGameProps> = ({ level, onLevelComplete }) => {
  const hotspots = level.gameplayData.hotspots || [];
  const [discoveredIds, setDiscoveredIds] = useState<string[]>([]);
  const [activeHotspot, setActiveHotspot] = useState<(typeof hotspots)[0] | null>(null);

  const handleTapHotspot = (hotspot: (typeof hotspots)[0]) => {
    SoundFX.playPop();
    setActiveHotspot(hotspot);

    if (!discoveredIds.includes(hotspot.id)) {
      SoundFX.playSuccess();
      const nextDiscovered = [...discoveredIds, hotspot.id];
      setDiscoveredIds(nextDiscovered);
      sound.speakKhmer(hotspot.labelKhmer);

      if (nextDiscovered.length === hotspots.length) {
        SoundFX.playStar();
        setTimeout(() => {
          onLevelComplete(120);
        }, 1800);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-emerald-50 rounded-2xl p-4 border-2 border-emerald-200 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <SpeakerButton text={level.promptText} size="sm" />
          <p className="text-base sm:text-lg font-extrabold text-emerald-950 font-khmer">
            {level.promptText}
          </p>
        </div>
        <span className="text-xs bg-emerald-200 text-emerald-900 font-extrabold px-3 py-1 rounded-full shrink-0">
          រុករកឃើញ: {discoveredIds.length}/{hotspots.length}
        </span>
      </div>

      {/* Visual Interactive Scene */}
      <div className="bg-gradient-to-tr from-sky-100 via-amber-50 to-emerald-100 rounded-3xl p-6 border-4 border-emerald-300 shadow-md relative min-h-[340px] flex items-center justify-center overflow-hidden">
        {/* Background Decorative Motif */}
        <div className="absolute inset-0 opacity-15 pointer-events-none flex items-center justify-center">
          <Compass className="w-64 h-64 text-emerald-900" />
        </div>

        {/* Hotspots placed by xPercent and yPercent */}
        {hotspots.map(hs => {
          const isFound = discoveredIds.includes(hs.id);
          return (
            <button
              key={hs.id}
              onClick={() => handleTapHotspot(hs)}
              style={{
                top: `${hs.yPercent}%`,
                left: `${hs.xPercent}%`,
                transform: 'translate(-50%, -50%)',
              }}
              className={`absolute p-3 rounded-2xl border-3 shadow-lg btn-kid transition-all flex flex-col items-center gap-1 z-10 ${
                isFound
                  ? 'bg-white border-emerald-500 ring-4 ring-emerald-300 text-emerald-950 scale-110'
                  : 'bg-amber-300 border-amber-500 animate-pulse text-amber-950 hover:scale-115'
              }`}
              title={hs.labelKhmer}
            >
              <span className="text-3xl">{hs.icon}</span>
              <span className="text-[11px] font-extrabold font-khmer bg-white/90 px-1.5 py-0.5 rounded-md shadow-xs">
                {hs.labelKhmer}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Hotspot Knowledge Drawer */}
      {activeHotspot && (
        <div className="bg-white rounded-3xl p-5 border-3 border-emerald-300 shadow-md space-y-3 animate-fade-in">
          <div className="flex items-center justify-between border-b border-emerald-100 pb-2">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{activeHotspot.icon}</span>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-lg font-black text-emerald-950 font-khmer leading-snug">
                    {activeHotspot.labelKhmer}
                  </h4>
                  <SpeakerButton
                    text={`${activeHotspot.labelKhmer}។ ${activeHotspot.hintKhmer}។ ${activeHotspot.funFactKhmer}`}
                    size="xs"
                    title="ស្ដាប់ការពន្យល់"
                  />
                </div>
                {activeHotspot.labelEnglish && (
                  <span className="text-xs text-slate-500">{activeHotspot.labelEnglish}</span>
                )}
              </div>
            </div>
            <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> រកឃើញ
            </span>
          </div>

          <p className="text-sm font-bold text-slate-700 font-khmer">
            {activeHotspot.hintKhmer}
          </p>

          <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2">
            <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>{activeHotspot.funFactKhmer}</span>
          </div>
        </div>
      )}
    </div>
  );
};
