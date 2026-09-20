// src/components/engines/EnvironmentalSandboxEngine.tsx
// Universal Engine 3: Environmental State-Machine Sandbox Lab
// Interactive Touch & Slider Driven Canvas Morphing (Germination, Germ Buster, Sun & Shadow)
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { GameLevel, SandboxData, SandboxMode, SandboxItem } from '@/types/game';
import { soundSynthesizer } from '@/lib/audio/SoundSynthesizer';
import { speechService } from '@/lib/audio/speechHook';
import { SpeakButton } from '@/components/audio/SpeakButton';
import {
  Sparkles,
  Droplets,
  Sun,
  Sprout,
  CheckCircle2,
  RotateCcw,
  Shield,
  Compass,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface EnvironmentalSandboxEngineProps {
  level: GameLevel;
  onLevelComplete: (scoreGain: number) => void;
  onRestartLevel?: () => void;
}

export const EnvironmentalSandboxEngine: React.FC<EnvironmentalSandboxEngineProps> = ({
  level,
  onLevelComplete,
  onRestartLevel,
}) => {
  const sandbox: SandboxData =
    level.gameplayData?.sandboxData ||
    level.gameplayData?.sandbox_data ||
    (level.gameplay_data as unknown as { sandboxData?: SandboxData; sandbox_data?: SandboxData })?.sandboxData ||
    (level.gameplay_data as unknown as { sandbox_data?: SandboxData })?.sandbox_data || {
      mode: 'germination' as SandboxMode,
      targetGoalKhmer: 'ពិសោធន៍ និងស្វែងយល់',
    };

  const mode = sandbox.mode || 'germination';

  // -------------------------------------------------------------------------
  // 1. GERMINATION LAB STATE (Moisture, Light, Compost Sliders)
  // -------------------------------------------------------------------------
  const [moisture, setMoisture] = useState<number>(sandbox.initialMoisture || sandbox.initial_moisture || 40);
  const [light, setLight] = useState<number>(sandbox.initialLight || sandbox.initial_light || 30);
  const [compost, setCompost] = useState<number>(sandbox.initialCompost || sandbox.initial_compost || 20);
  const [germinationStage, setGerminationStage] = useState<number>(1);
  const [isThriving, setIsThriving] = useState<boolean>(false);

  useEffect(() => {
    if (mode !== 'germination') return;

    const isOptimal =
      moisture >= 50 && moisture <= 85 &&
      light >= 50 && light <= 85 &&
      compost >= 45 && compost <= 85;

    setIsThriving(isOptimal);

    if (isOptimal) {
      setGerminationStage(5);
      const timer = setTimeout(() => {
        soundSynthesizer.playSuccess();
        soundSynthesizer.playFanfare();
        onLevelComplete(120);
      }, 1500);
      return () => clearTimeout(timer);
    } else {
      const avg = (moisture + light + compost) / 3;
      if (avg < 25) setGerminationStage(1);
      else if (avg < 45) setGerminationStage(2);
      else if (avg < 65) setGerminationStage(3);
      else setGerminationStage(4);
    }
  }, [moisture, light, compost, mode, onLevelComplete]);

  // -------------------------------------------------------------------------
  // 2. GERM BUSTER HYGIENE LAB (Scrubbing lathered soap over SVG hands)
  // -------------------------------------------------------------------------
  const [germs, setGerms] = useState([
    { id: 'g-1', x: 30, y: 35, health: 100, size: 28 },
    { id: 'g-2', x: 70, y: 38, health: 100, size: 32 },
    { id: 'g-3', x: 48, y: 62, health: 100, size: 30 },
    { id: 'g-4', x: 32, y: 76, health: 100, size: 26 },
    { id: 'g-5', x: 68, y: 74, health: 100, size: 28 },
  ]);
  const [soapPos, setSoapPos] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const [foamBubbles, setFoamBubbles] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleScrub = (clientX: number, clientY: number) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const xPct = Math.max(5, Math.min(95, ((clientX - rect.left) / rect.width) * 100));
    const yPct = Math.max(5, Math.min(95, ((clientY - rect.top) / rect.height) * 100));
    setSoapPos({ x: xPct, y: yPct });

    soundSynthesizer.playPop();

    setFoamBubbles((prev) => [
      ...prev.slice(-14),
      { id: Date.now() + Math.random(), x: xPct, y: yPct },
    ]);

    setGerms((prev) =>
      prev.map((g) => {
        const dist = Math.hypot(xPct - g.x, yPct - g.y);
        if (dist < 20) {
          const nextHealth = Math.max(0, g.health - 25);
          if (nextHealth === 0 && g.health > 0) {
            soundSynthesizer.playCoin();
          }
          return { ...g, health: nextHealth };
        }
        return g;
      })
    );
  };

  const aliveGerms = germs.filter((g) => g.health > 0).length;

  useEffect(() => {
    if (mode === 'germ_buster' && aliveGerms === 0) {
      soundSynthesizer.playSuccess();
      soundSynthesizer.playFanfare();
      const t = setTimeout(() => {
        onLevelComplete(120);
      }, 1400);
      return () => clearTimeout(t);
    }
  }, [mode, aliveGerms, onLevelComplete]);

  // -------------------------------------------------------------------------
  // 3. SUN & SHADOW VECTOR DIAL
  // -------------------------------------------------------------------------
  const [sunAngle, setSunAngle] = useState<number>(35); // 15 to 165 degrees
  const targetAngle = sandbox.targetAngle || sandbox.target_angle || 140;
  const shadowDiff = Math.abs(sunAngle - targetAngle);
  const isShadowMatched = shadowDiff <= 8;

  useEffect(() => {
    if (mode === 'sun_shadow' && isShadowMatched) {
      soundSynthesizer.playSuccess();
      soundSynthesizer.playFanfare();
      const t = setTimeout(() => {
        onLevelComplete(110);
      }, 1400);
      return () => clearTimeout(t);
    }
  }, [mode, isShadowMatched, onLevelComplete]);

  const handleReset = () => {
    soundSynthesizer.playClick();
    setMoisture(40);
    setLight(30);
    setCompost(20);
    setGerms([
      { id: 'g-1', x: 30, y: 35, health: 100, size: 28 },
      { id: 'g-2', x: 70, y: 38, health: 100, size: 32 },
      { id: 'g-3', x: 48, y: 62, health: 100, size: 30 },
      { id: 'g-4', x: 32, y: 76, health: 100, size: 26 },
      { id: 'g-5', x: 68, y: 74, health: 100, size: 28 },
    ]);
    setSunAngle(35);
    if (onRestartLevel) onRestartLevel();
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 p-4 sm:p-6 select-none font-kantumruy">
      {/* Header Prompt */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-md border-2 border-sky-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 text-sky-600 text-xs sm:text-sm font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>មន្ទីរពិសោធន៍វិទ្យាសាស្ត្រ • Environmental Sandbox</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 leading-relaxed font-kantumruy">
            {level.promptText || 'សូមធ្វើការពិសោធន៍ និងកែប្រែកត្តាបរិស្ថាន៖'}
          </h2>
        </div>
        <div className="flex items-center gap-2 self-end sm:self-center">
          <SpeakButton text={level.promptText} size="md" variant="primary" />
          <button
            onClick={handleReset}
            title="កំណត់ឡើងវិញ"
            className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* MODE 1: SEED GERMINATION LAB */}
      {mode === 'germination' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {/* Animated Plant Morphology SVG */}
          <div className="bg-gradient-to-b from-sky-100 via-amber-50 to-amber-100 rounded-3xl p-6 border-2 border-amber-200 shadow-inner flex flex-col items-center justify-center min-h-[340px] relative overflow-hidden">
            {/* Sun representation */}
            <motion.div
              animate={{
                scale: 0.8 + (light / 100) * 0.5,
                opacity: 0.4 + (light / 100) * 0.6,
              }}
              className="absolute top-4 right-6 text-amber-500 text-5xl"
            >
              ☀️
            </motion.div>

            {/* Plant Stage Visualization */}
            <div className="relative flex flex-col items-center">
              {germinationStage === 1 && (
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  className="text-6xl filter drop-shadow-md"
                >
                  🫘
                </motion.div>
              )}
              {germinationStage === 2 && (
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  className="flex flex-col items-center"
                >
                  <span className="text-4xl">🌱</span>
                  <span className="text-xs font-bold text-amber-800 bg-white/70 px-2 py-0.5 rounded-full mt-2">
                    ឫសចាប់ផ្ដើមដុះ
                  </span>
                </motion.div>
              )}
              {germinationStage === 3 && (
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  className="flex flex-col items-center"
                >
                  <span className="text-6xl">🌿</span>
                  <span className="text-xs font-bold text-emerald-800 bg-white/70 px-2 py-0.5 rounded-full mt-2">
                    ពន្លកបៃតងលូតលាស់
                  </span>
                </motion.div>
              )}
              {germinationStage >= 4 && (
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1.1 }}
                  className="flex flex-col items-center"
                >
                  <span className="text-7xl animate-bounce">🌻</span>
                  <span className="text-sm font-bold text-emerald-900 bg-emerald-100 border border-emerald-300 px-3 py-1 rounded-full mt-2 shadow-xs">
                    រុក្ខជាតិលូតលាស់ពេញលេញ!
                  </span>
                </motion.div>
              )}
            </div>

            {/* Soil baseline */}
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-amber-900/60 to-transparent flex items-end justify-center pb-2">
              <span className="text-xs text-amber-950 font-bold">ដីមានជីជាតិសមស្រប</span>
            </div>
          </div>

          {/* Environmental Factor Sliders */}
          <div className="bg-white rounded-3xl p-6 shadow-md border-2 border-slate-100 flex flex-col gap-5">
            {/* Moisture Slider */}
            <div>
              <div className="flex justify-between text-sm font-bold mb-2 text-sky-700">
                <span className="flex items-center gap-1.5">
                  <Droplets className="w-4 h-4 text-sky-500" />
                  សំណើម / ទឹក (Moisture):
                </span>
                <span className="font-mono">{moisture}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={moisture}
                onChange={(e) => setMoisture(Number(e.target.value))}
                className="w-full h-3 bg-sky-100 rounded-lg appearance-none cursor-pointer accent-sky-500"
              />
              <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                <span>ស្ងួតខ្លាំង</span>
                <span className="text-emerald-600 font-bold">កម្រិតសមស្រប (60-80%)</span>
                <span>ជោកជាំខ្លាំង</span>
              </div>
            </div>

            {/* Light Slider */}
            <div>
              <div className="flex justify-between text-sm font-bold mb-2 text-amber-700">
                <span className="flex items-center gap-1.5">
                  <Sun className="w-4 h-4 text-amber-500" />
                  ពន្លឺព្រះអាទិត្យ (Sunlight):
                </span>
                <span className="font-mono">{light}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={light}
                onChange={(e) => setLight(Number(e.target.value))}
                className="w-full h-3 bg-amber-100 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                <span>ងងឹត</span>
                <span className="text-emerald-600 font-bold">កម្រិតសមស្រប (60-80%)</span>
                <span>ក្ដៅខ្លាំង</span>
              </div>
            </div>

            {/* Compost Slider */}
            <div>
              <div className="flex justify-between text-sm font-bold mb-2 text-emerald-700">
                <span className="flex items-center gap-1.5">
                  <Sprout className="w-4 h-4 text-emerald-500" />
                  ជីកំប៉ុស្តិ៍ (Compost & Soil):
                </span>
                <span className="font-mono">{compost}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={compost}
                onChange={(e) => setCompost(Number(e.target.value))}
                className="w-full h-3 bg-emerald-100 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                <span>គ្មានជី</span>
                <span className="text-emerald-600 font-bold">កម្រិតសមស្រប (50-80%)</span>
                <span>ជីលើសកម្រិត</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODE 2: GERM BUSTER HYGIENE LAB */}
      {mode === 'germ_buster' && (
        <div className="bg-white rounded-3xl p-6 shadow-lg border-2 border-slate-100 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <Shield className="w-5 h-5 text-indigo-600" />
              អូសដុំសាប៊ូលើដៃដើម្បីកម្ចាត់មេរោគ (នៅសល់៖ {aliveGerms})
            </span>
            <span className="text-xs bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full font-bold">
              🧼 សាប៊ូពពុះអនាម័យ
            </span>
          </div>

          {/* Scrubbing Canvas */}
          <div
            ref={canvasRef}
            onMouseMove={(e) => handleScrub(e.clientX, e.clientY)}
            onTouchMove={(e) => {
              const touch = e.touches[0];
              if (touch) handleScrub(touch.clientX, touch.clientY);
            }}
            className="relative w-full h-80 bg-gradient-to-b from-rose-50 via-indigo-50/40 to-slate-100 rounded-3xl border-3 border-indigo-200 shadow-inner overflow-hidden cursor-grab active:cursor-grabbing touch-none select-none"
          >
            {/* SVG Stylized Hand Outline */}
            <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none">
              <span className="text-[180px]">✋</span>
            </div>

            {/* Germ Clusters */}
            {germs.map((g) => {
              if (g.health <= 0) return null;
              return (
                <div
                  key={g.id}
                  style={{ left: `${g.x}%`, top: `${g.y}%` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none transition-all duration-300"
                >
                  <span
                    style={{ fontSize: `${g.size}px` }}
                    className="animate-pulse filter drop-shadow-md"
                  >
                    👾
                  </span>
                  <div className="w-10 h-1.5 bg-slate-300 rounded-full overflow-hidden mt-1">
                    <div
                      style={{ width: `${g.health}%` }}
                      className="h-full bg-rose-500 transition-all duration-200"
                    />
                  </div>
                </div>
              );
            })}

            {/* Foam Bubbles */}
            {foamBubbles.map((b) => (
              <div
                key={b.id}
                style={{ left: `${b.x}%`, top: `${b.y}%` }}
                className="absolute w-6 h-6 rounded-full bg-white/80 border border-indigo-200 pointer-events-none animate-ping"
              />
            ))}

            {/* Interactive Soap Bar Cursor */}
            <div
              style={{ left: `${soapPos.x}%`, top: `${soapPos.y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 w-14 h-14 bg-indigo-500 text-white rounded-2xl shadow-xl flex items-center justify-center text-2xl pointer-events-none border-2 border-white"
            >
              🧼
            </div>
          </div>
        </div>
      )}

      {/* MODE 3: SUN & SHADOW VECTOR DIAL */}
      {mode === 'sun_shadow' && (
        <div className="bg-white rounded-3xl p-6 shadow-lg border-2 border-slate-100 flex flex-col gap-6 items-center">
          <div className="relative w-full max-w-lg h-60 bg-gradient-to-b from-sky-200 via-sky-100 to-amber-100 rounded-3xl overflow-hidden border-2 border-sky-300 flex items-center justify-center">
            {/* Sun Dial Arc */}
            <motion.div
              style={{
                transformOrigin: 'bottom center',
              }}
              animate={{ rotate: sunAngle - 90 }}
              className="absolute bottom-4 w-1 h-36 flex flex-col items-center"
            >
              <span className="text-4xl -mt-6">☀️</span>
            </motion.div>

            {/* Central Pillar */}
            <div className="absolute bottom-0 w-6 h-20 bg-slate-700 rounded-t-lg shadow-md" />

            {/* Projected Ground Shadow */}
            <motion.div
              animate={{
                width: Math.abs(sunAngle - 90) * 1.8 + 20,
                x: (90 - sunAngle) * 1.5,
              }}
              className="absolute bottom-0 h-3 bg-slate-900/40 rounded-full blur-xs"
            />
          </div>

          {/* Angle Dial Slider */}
          <div className="w-full max-w-md flex flex-col gap-2">
            <div className="flex justify-between font-bold text-slate-700">
              <span>ព្រឹកព្រលឹម (Morning)</span>
              <span>ថ្ងៃត្រង់ (Noon)</span>
              <span>រសៀល (Afternoon)</span>
            </div>
            <input
              type="range"
              min="15"
              max="165"
              value={sunAngle}
              onChange={(e) => setSunAngle(Number(e.target.value))}
              className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export const SandboxEngine = EnvironmentalSandboxEngine;
export default EnvironmentalSandboxEngine;
