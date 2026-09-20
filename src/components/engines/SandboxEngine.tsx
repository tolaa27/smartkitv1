'use client';

import React, { useState, useEffect, useRef } from 'react';
import { GameLevel, SandboxData, SandboxMode, SandboxItem } from '@/types/edtech';
import { sound } from '@/utils/sound';
import { SpeakerButton } from '@/components/common/SpeakerButton';
import {
  Sparkles,
  Droplets,
  Sun,
  Sprout,
  CheckCircle2,
  RefreshCw,
  Zap,
  Shield,
  Heart,
  Magnet,
  Trash2,
  Compass,
} from 'lucide-react';

interface SandboxEngineProps {
  level: GameLevel;
  onLevelComplete: (scoreGain: number) => void;
}

export const SandboxEngine: React.FC<SandboxEngineProps> = ({ level, onLevelComplete }) => {
  const sandbox = level.gameplayData.sandboxData || {
    mode: 'germination' as SandboxMode,
    targetGoalKhmer: 'ពិសោធន៍ និងស្វែងយល់',
  };

  const mode = sandbox.mode;

  // -------------------------------------------------------------------------
  // 1. GERMINATION LAB STATE
  // -------------------------------------------------------------------------
  const [moisture, setMoisture] = useState<number>(sandbox.initialMoisture ?? 40);
  const [light, setLight] = useState<number>(sandbox.initialLight ?? 30);
  const [compost, setCompost] = useState<number>(sandbox.initialCompost ?? 20);
  const [germinationStage, setGerminationStage] = useState<number>(1); // 1 = seed, 2 = root, 3 = sprout, 4 = leaves, 5 = bloom
  const [isThriving, setIsThriving] = useState<boolean>(false);
  const [thriveTimer, setThriveTimer] = useState<number>(0);

  useEffect(() => {
    if (mode !== 'germination') return;

    // Check balance: optimal range is 60 - 85 for all 3 factors
    const isOptimal =
      moisture >= 55 && moisture <= 90 &&
      light >= 50 && light <= 90 &&
      compost >= 45 && compost <= 90;

    setIsThriving(isOptimal);

    if (isOptimal) {
      setGerminationStage(5);
      const interval = setInterval(() => {
        setThriveTimer(prev => {
          if (prev >= 2) {
            clearInterval(interval);
            sound.playSuccessChime();
            sound.playStarCelebration();
            onLevelComplete(120);
            return 3;
          }
          return prev + 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setThriveTimer(0);
      const avg = (moisture + light + compost) / 3;
      if (avg < 25) setGerminationStage(1);
      else if (avg < 45) setGerminationStage(2);
      else if (avg < 65) setGerminationStage(3);
      else setGerminationStage(4);
    }
  }, [moisture, light, compost, mode, onLevelComplete]);

  // -------------------------------------------------------------------------
  // 2. BENTO NUTRITION BALANCE STATE
  // -------------------------------------------------------------------------
  const initialFoods = [
    { id: 'f-1', nameKhmer: 'បាយផ្ការំដួល', group: 'energy', icon: '🍚', color: 'amber' },
    { id: 'f-2', nameKhmer: 'ដំឡូងជ្វា', group: 'energy', icon: '🍠', color: 'amber' },
    { id: 'f-3', nameKhmer: 'ត្រីអាំង', group: 'growth', icon: '🐟', color: 'emerald' },
    { id: 'f-4', nameKhmer: 'ស៊ុតទា', group: 'growth', icon: '🥚', color: 'emerald' },
    { id: 'f-5', nameKhmer: 'សម្លកកូរ/បន្លែ', group: 'protection', icon: '🥦', color: 'sky' },
    { id: 'f-6', nameKhmer: 'ផ្លែស្វាយទុំ', group: 'protection', icon: '🥭', color: 'sky' },
  ];
  const [bentoTray, setBentoTray] = useState<typeof initialFoods>([]);
  const [foodPool, setFoodPool] = useState<typeof initialFoods>(initialFoods);

  const energyCount = bentoTray.filter(f => f.group === 'energy').length;
  const growthCount = bentoTray.filter(f => f.group === 'growth').length;
  const protectionCount = bentoTray.filter(f => f.group === 'protection').length;
  const isBentoBalanced = energyCount >= 1 && growthCount >= 1 && protectionCount >= 1;

  const handleAddFoodToBento = (food: (typeof initialFoods)[0]) => {
    sound.playSnap();
    setFoodPool(prev => prev.filter(f => f.id !== food.id));
    setBentoTray(prev => [...prev, food]);
  };

  const handleRemoveFoodFromBento = (food: (typeof initialFoods)[0]) => {
    sound.playPop();
    setBentoTray(prev => prev.filter(f => f.id !== food.id));
    setFoodPool(prev => [...prev, food]);
  };

  useEffect(() => {
    if (mode === 'bento_balance' && isBentoBalanced) {
      sound.playSuccessChime();
      sound.playStarCelebration();
      const t = setTimeout(() => {
        onLevelComplete(120);
      }, 1500);
      return () => clearTimeout(t);
    }
  }, [mode, isBentoBalanced, onLevelComplete]);

  // -------------------------------------------------------------------------
  // 3. SUN-DIAL SHADOW SIMULATOR STATE
  // -------------------------------------------------------------------------
  const [sunAngle, setSunAngle] = useState<number>(35); // 15 to 165 deg
  const targetShadowAngle = sandbox.targetAngle ?? 145; // target afternoon angle
  const shadowDiff = Math.abs(sunAngle - targetShadowAngle);
  const isShadowMatched = shadowDiff <= 8;

  useEffect(() => {
    if (mode === 'sun_shadow' && isShadowMatched) {
      sound.playSuccessChime();
      const t = setTimeout(() => {
        onLevelComplete(110);
      }, 1400);
      return () => clearTimeout(t);
    }
  }, [mode, isShadowMatched, onLevelComplete]);

  // -------------------------------------------------------------------------
  // 4. MAGNETISM SANDBOX STATE
  // -------------------------------------------------------------------------
  const [magnetPos, setMagnetPos] = useState<{ x: number; y: number }>({ x: 200, y: 150 });
  const [magnetItems, setMagnetItems] = useState([
    { id: 'm-1', nameKhmer: 'ដែកគោល', icon: '🔩', isMagnetic: true, x: 80, y: 70, caught: false },
    { id: 'm-2', nameKhmer: 'ម្ជុលខ្ទាស់', icon: '📎', isMagnetic: true, x: 310, y: 80, caught: false },
    { id: 'm-3', nameKhmer: 'កូនសោដែក', icon: '🗝️', isMagnetic: true, x: 280, y: 220, caught: false },
    { id: 'm-4', nameKhmer: 'ស្លឹកឈើ', icon: '🍃', isMagnetic: false, x: 100, y: 210, caught: false },
    { id: 'm-5', nameKhmer: 'ជ័រលុប', icon: '🧼', isMagnetic: false, x: 220, y: 70, caught: false },
    { id: 'm-6', nameKhmer: 'បន្ទាត់ជ័រ', icon: '📏', isMagnetic: false, x: 170, y: 240, caught: false },
  ]);

  const handleMoveMagnet = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMagnetPos({ x, y });

    // Calculate proximity pull for magnetic items
    setMagnetItems(prev =>
      prev.map(item => {
        if (!item.isMagnetic) return item;
        const dist = Math.hypot(x - item.x, y - item.y);
        if (dist < 75 && !item.caught) {
          sound.playMagnetClink();
          return { ...item, caught: true, x: x + (Math.random() * 20 - 10), y: y + 25 };
        }
        if (item.caught) {
          return { ...item, x: x + 10, y: y + 20 };
        }
        return item;
      })
    );
  };

  const caughtCount = magnetItems.filter(m => m.isMagnetic && m.caught).length;
  const totalMagnetic = magnetItems.filter(m => m.isMagnetic).length;

  useEffect(() => {
    if (mode === 'magnetism' && caughtCount === totalMagnetic && totalMagnetic > 0) {
      sound.playSuccessChime();
      sound.playStarCelebration();
      const t = setTimeout(() => {
        onLevelComplete(120);
      }, 1500);
      return () => clearTimeout(t);
    }
  }, [mode, caughtCount, totalMagnetic, onLevelComplete]);

  // -------------------------------------------------------------------------
  // 5. GERM BUSTER SOAP SCRUB CANVAS
  // -------------------------------------------------------------------------
  const [germs, setGerms] = useState([
    { id: 'g-1', x: 28, y: 35, health: 100, size: 28 },
    { id: 'g-2', x: 68, y: 40, health: 100, size: 32 },
    { id: 'g-3', x: 45, y: 65, health: 100, size: 30 },
    { id: 'g-4', x: 30, y: 78, health: 100, size: 26 },
    { id: 'g-5', x: 72, y: 72, health: 100, size: 28 },
  ]);
  const [soapPos, setSoapPos] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const [foamBubbles, setFoamBubbles] = useState<Array<{ id: number; x: number; y: number }>>([]);

  const handleScrubMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const xPct = ((e.clientX - rect.left) / rect.width) * 100;
    const yPct = ((e.clientY - rect.top) / rect.height) * 100;
    setSoapPos({ x: xPct, y: yPct });

    sound.playSoapScrub();

    // Add foam bubbles
    setFoamBubbles(prev => [...prev.slice(-15), { id: Date.now(), x: xPct, y: yPct }]);

    // Reduce health of nearby germs
    setGerms(prev =>
      prev.map(g => {
        const dist = Math.hypot(xPct - g.x, yPct - g.y);
        if (dist < 18) {
          const nextHealth = Math.max(0, g.health - 22);
          return { ...g, health: nextHealth };
        }
        return g;
      })
    );
  };

  const remainingGerms = germs.filter(g => g.health > 0).length;

  useEffect(() => {
    if (mode === 'germ_buster' && remainingGerms === 0) {
      sound.playWaterSplash();
      sound.playSuccessChime();
      sound.playStarCelebration();
      const t = setTimeout(() => {
        onLevelComplete(120);
      }, 1500);
      return () => clearTimeout(t);
    }
  }, [mode, remainingGerms, onLevelComplete]);

  return (
    <div className="space-y-6">
      {/* Header Banner with Instructions & Speaker */}
      <div className="bg-emerald-50 rounded-3xl p-5 border-3 border-emerald-200 shadow-sm flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <SpeakerButton text={level.promptText} size="md" />
          <div>
            <span className="text-xs font-black uppercase text-emerald-700 tracking-wider">
              {mode === 'germination' && 'ពិសោធន៍ជីវសាស្រ្តរុក្ខជាតិ • Biological Sandbox'}
              {mode === 'bento_balance' && 'តុល្យភាពអាហាររូបត្ថម្ភ • Nutritional Bento Balance'}
              {mode === 'sun_shadow' && 'រូបវិទ្យាពន្លឺ និងស្រមោល • Solar Shadow Simulator'}
              {mode === 'magnetism' && 'ដែនម៉ាញ៉េទិច • Magnetic Field Sandbox'}
              {mode === 'germ_buster' && 'អនាម័យ និងមេរោគ • Germ Buster Hand Wash'}
            </span>
            <h3 className="text-lg sm:text-xl font-black font-khmer text-emerald-950">
              {level.promptText}
            </h3>
          </div>
        </div>

        <div className="shrink-0 bg-white px-3.5 py-1.5 rounded-2xl border border-emerald-200 text-xs font-black text-emerald-800 shadow-xs">
          {mode === 'germination' && (isThriving ? '✨ រីកចម្រើនល្អ!' : '🌱 កំពុងលូតលាស់')}
          {mode === 'bento_balance' && (isBentoBalanced ? '🥗 តុល្យភាពពេញលេញ!' : '🥗 ខ្វះជីវជាតិ')}
          {mode === 'sun_shadow' && (isShadowMatched ? '☀️ ស្រមោលត្រូវ!' : '📐 តម្រង់ស្រមោល')}
          {mode === 'magnetism' && `🧲 ស្រូបបាន ${caughtCount}/${totalMagnetic}`}
          {mode === 'germ_buster' && `🧼 នៅសល់មេរោគ ${remainingGerms}`}
        </div>
      </div>

      {/* ===================================================================== */}
      {/* MODE 1: GERMINATION LAB */}
      {/* ===================================================================== */}
      {mode === 'germination' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Interactive Biological SVG Display */}
          <div className="lg:col-span-7 bg-gradient-to-b from-sky-100 via-amber-50 to-amber-900/30 rounded-3xl p-6 border-4 border-emerald-300 shadow-lg relative min-h-[360px] flex flex-col items-center justify-between overflow-hidden">
            {/* Sun Glow */}
            <div
              className="absolute top-4 right-6 w-16 h-16 rounded-full bg-amber-400 blur-sm shadow-xl transition-all duration-500"
              style={{
                opacity: Math.max(0.2, light / 100),
                transform: `scale(${0.8 + (light / 100) * 0.5})`,
              }}
            >
              <div className="w-full h-full rounded-full bg-amber-300 animate-ping opacity-30" />
            </div>

            {/* Rain / Water drops */}
            {moisture > 30 && (
              <div className="absolute top-8 left-8 flex gap-2 animate-bounce opacity-60">
                <Droplets className="w-6 h-6 text-sky-500" />
                <Droplets className="w-5 h-5 text-sky-400" />
              </div>
            )}

            {/* Status Alert */}
            <div className="z-10 bg-white/90 backdrop-blur-sm px-4 py-1.5 rounded-full border border-emerald-200 text-xs font-bold text-emerald-950 font-khmer shadow-xs">
              {germinationStage === 1 && 'គ្រាប់ពូជនៅក្នុងដី (Seed in Soil)'}
              {germinationStage === 2 && 'ឫសចាប់ផ្ដើមដុះចាក់ចូលដី (Roots Sprouting)'}
              {germinationStage === 3 && 'ពន្លកបៃតងដុះឡើងលើ (Sprout Emerging)'}
              {germinationStage === 4 && 'ដើមរីកស្លឹកបៃតងខ្ចី (Leaves Developing)'}
              {germinationStage === 5 && '🌸 ផ្ការីកស្រស់បំព្រង! (Lotus Bloom!)'}
            </div>

            {/* Live Visual Plant SVG */}
            <div className="relative w-48 h-64 flex items-center justify-center my-auto">
              <svg viewBox="0 0 200 240" className="w-full h-full">
                {/* Soil Line */}
                <line x1="10" y1="170" x2="190" y2="170" stroke="#78350F" strokeWidth="6" strokeDasharray="4 2" />
                <rect x="10" y="170" width="180" height="65" fill="#78350F" fillOpacity="0.35" rx="10" />

                {/* Roots */}
                {germinationStage >= 2 && (
                  <g stroke="#92400E" strokeWidth="3" fill="none" strokeLinecap="round">
                    <path d="M 100 170 Q 95 195 85 220" />
                    <path d="M 100 170 Q 105 195 115 220" />
                    <path d="M 100 185 Q 80 200 70 215" />
                    <path d="M 100 185 Q 120 200 130 215" />
                  </g>
                )}

                {/* Seed */}
                <ellipse cx="100" cy="170" rx="14" ry="10" fill="#92400E" />

                {/* Stem */}
                {germinationStage >= 3 && (
                  <path
                    d={
                      moisture < 20
                        ? 'M 100 170 Q 115 130 135 110' // wilted
                        : 'M 100 170 Q 100 110 100 80'   // upright healthy
                    }
                    stroke={light < 25 ? '#FDE047' : '#22C55E'}
                    strokeWidth="7"
                    fill="none"
                    strokeLinecap="round"
                    className="transition-all duration-500"
                  />
                )}

                {/* Leaves */}
                {germinationStage >= 4 && (
                  <g fill={moisture < 25 ? '#CA8A04' : '#16A34A'} className="transition-all duration-500">
                    <ellipse cx="78" cy="95" rx="18" ry="10" transform="rotate(-30 78 95)" />
                    <ellipse cx="122" cy="95" rx="18" ry="10" transform="rotate(30 122 95)" />
                  </g>
                )}

                {/* Flower Bloom */}
                {germinationStage >= 5 && (
                  <g className="animate-pulse">
                    <circle cx="100" cy="65" r="14" fill="#F43F5E" />
                    <circle cx="86" cy="65" r="11" fill="#FB7185" />
                    <circle cx="114" cy="65" r="11" fill="#FB7185" />
                    <circle cx="100" cy="52" r="11" fill="#FB7185" />
                    <circle cx="100" cy="78" r="11" fill="#FB7185" />
                    <circle cx="100" cy="65" r="7" fill="#FBBF24" />
                  </g>
                )}
              </svg>
            </div>

            {/* Bottom Soil Moisture Tag */}
            <div className="flex gap-4 text-xs font-bold text-amber-950">
              <span>សំណើមដី: {moisture}%</span>
              <span>កម្តៅពន្លឺ: {light}%</span>
              <span>ជីវជាតិជី: {compost}%</span>
            </div>
          </div>

          {/* Tactical Sliders Control Box */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 border-4 border-emerald-200 shadow-md space-y-5">
            <h4 className="font-heading font-black text-slate-900 text-base">
              🎛️ បញ្ជាកត្តាបរិស្ថាន (Environmental Sliders)
            </h4>

            {/* Moisture Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="flex items-center gap-1.5 text-sky-700">
                  <Droplets className="w-4 h-4 text-sky-500" />
                  <span>សំណើមទឹក (Moisture):</span>
                </span>
                <span className="font-mono bg-sky-100 text-sky-900 px-2 py-0.5 rounded-md">
                  {moisture}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={moisture}
                onChange={e => {
                  sound.playPop();
                  setMoisture(parseInt(e.target.value, 10));
                }}
                className="w-full h-3 bg-sky-100 rounded-lg appearance-none cursor-pointer accent-sky-500"
              />
            </div>

            {/* Sunlight Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="flex items-center gap-1.5 text-amber-700">
                  <Sun className="w-4 h-4 text-amber-500" />
                  <span>ពន្លឺព្រះអាទិត្យ (Sunlight):</span>
                </span>
                <span className="font-mono bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md">
                  {light}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={light}
                onChange={e => {
                  sound.playPop();
                  setLight(parseInt(e.target.value, 10));
                }}
                className="w-full h-3 bg-amber-100 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            {/* Compost Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="flex items-center gap-1.5 text-emerald-700">
                  <Sprout className="w-4 h-4 text-emerald-500" />
                  <span>ជីកំប៉ុស (Compost Nutrition):</span>
                </span>
                <span className="font-mono bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-md">
                  {compost}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={compost}
                onChange={e => {
                  sound.playPop();
                  setCompost(parseInt(e.target.value, 10));
                }}
                className="w-full h-3 bg-emerald-100 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>

            {/* Feedback box */}
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 font-khmer">
              💡 <strong>ការណែនាំ៖</strong> រុក្ខជាតិត្រូវការកម្រិតសំណើម ពន្លឺ និងជីក្នុងរង្វង់ <strong>៦០% ទៅ ៨៥%</strong> ទើបអាចលូតលាស់ចេញផ្កាបានល្អ!
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODE 2: BENTO NUTRITION BALANCE */}
      {/* ===================================================================== */}
      {mode === 'bento_balance' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Energy Meter */}
            <div className="bg-amber-50 p-4 rounded-2xl border-2 border-amber-200 flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-amber-500 text-white flex items-center justify-center text-2xl shadow">
                ⚡️
              </div>
              <div>
                <span className="text-xs font-bold text-amber-800">ក្រុមទី ១៖ ថាមពល</span>
                <h4 className="text-sm font-black text-amber-950 font-khmer">
                  {energyCount >= 1 ? '✅ គ្រប់គ្រាន់ (Carbs)' : '❌ ខ្វះខាត'}
                </h4>
              </div>
            </div>

            {/* Growth Meter */}
            <div className="bg-emerald-50 p-4 rounded-2xl border-2 border-emerald-200 flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center text-2xl shadow">
                💪
              </div>
              <div>
                <span className="text-xs font-bold text-emerald-800">ក្រុមទី ២៖ លូតលាស់</span>
                <h4 className="text-sm font-black text-emerald-950 font-khmer">
                  {growthCount >= 1 ? '✅ គ្រប់គ្រាន់ (Protein)' : '❌ ខ្វះខាត'}
                </h4>
              </div>
            </div>

            {/* Protection Meter */}
            <div className="bg-sky-50 p-4 rounded-2xl border-2 border-sky-200 flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-sky-500 text-white flex items-center justify-center text-2xl shadow">
                🛡️
              </div>
              <div>
                <span className="text-xs font-bold text-sky-800">ក្រុមទី ៣៖ ការពារ</span>
                <h4 className="text-sm font-black text-sky-950 font-khmer">
                  {protectionCount >= 1 ? '✅ គ្រប់គ្រាន់ (Vitamins)' : '❌ ខ្វះខាត'}
                </h4>
              </div>
            </div>
          </div>

          {/* Bento Lunch Tray (Drop Zone) */}
          <div className="bg-amber-100/60 rounded-3xl p-6 border-4 border-amber-300 shadow-inner">
            <span className="text-xs font-bold text-amber-900 block mb-2 font-khmer">
              🍱 ថាសបាយសិស្ស (Student Bento Tray) — ចុចដកចេញ:
            </span>
            <div className="min-h-[100px] bg-white rounded-2xl p-4 border-2 border-dashed border-amber-300 flex flex-wrap items-center gap-3">
              {bentoTray.length === 0 ? (
                <p className="text-slate-400 text-sm font-khmer italic mx-auto">
                  សូមជ្រើសរើសម្ហូបខាងក្រោមដាក់ចូលក្នុងថាសបាយ...
                </p>
              ) : (
                bentoTray.map(f => (
                  <button
                    key={f.id}
                    onClick={() => handleRemoveFoodFromBento(f)}
                    className="px-4 py-2.5 rounded-2xl bg-amber-50 hover:bg-rose-50 border-2 border-amber-300 hover:border-rose-400 font-khmer font-extrabold text-sm flex items-center gap-2 btn-kid"
                  >
                    <span className="text-2xl">{f.icon}</span>
                    <span>{f.nameKhmer}</span>
                    <span className="text-xs text-rose-500">✕</span>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Food Selection Pool */}
          <div className="bg-white rounded-3xl p-5 border-3 border-emerald-200 shadow-sm space-y-3">
            <span className="text-xs font-bold text-slate-600 block uppercase tracking-wide">
              ម្ហូបអាហារសម្រាប់ជ្រើសរើស (Available Foods):
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {foodPool.map(food => (
                <button
                  key={food.id}
                  onClick={() => handleAddFoodToBento(food)}
                  className="p-3.5 rounded-2xl bg-slate-50 hover:bg-amber-50 border-2 border-slate-200 hover:border-amber-400 flex items-center gap-3 btn-kid transition-all"
                >
                  <span className="text-3xl">{food.icon}</span>
                  <div className="text-left">
                    <p className="font-extrabold text-sm font-khmer text-slate-900">{food.nameKhmer}</p>
                    <span className="text-[10px] text-slate-500 block">
                      {food.group === 'energy' && 'ថាមពល'}
                      {food.group === 'growth' && 'លូតលាស់'}
                      {food.group === 'protection' && 'ការពារ'}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODE 3: SUN-DIAL SHADOW SIMULATOR */}
      {/* ===================================================================== */}
      {mode === 'sun_shadow' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-b from-sky-400 via-sky-200 to-amber-100 rounded-3xl p-6 border-4 border-amber-300 shadow-lg relative min-h-[320px] flex flex-col items-center justify-between overflow-hidden">
            {/* Celestial Arc */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 400 250">
              <path d="M 40 220 A 180 180 0 0 1 360 220" fill="none" stroke="#FDE68A" strokeWidth="3" strokeDasharray="6 4" />
            </svg>

            {/* Sun Position */}
            <div
              className="absolute w-14 h-14 rounded-full bg-amber-400 border-4 border-yellow-200 shadow-2xl flex items-center justify-center text-2xl transition-all duration-150 cursor-pointer animate-pulse"
              style={{
                left: `${20 + (sunAngle / 180) * 60}%`,
                top: `${80 - Math.sin((sunAngle * Math.PI) / 180) * 55}%`,
              }}
            >
              ☀️
            </div>

            {/* Target Flagpole & Dynamically Projected Cast Shadow */}
            <div className="relative mt-32 flex flex-col items-center">
              {/* Flagpole */}
              <div className="w-2.5 h-32 bg-slate-800 rounded-t-sm shadow relative z-10">
                <div className="absolute top-0 right-2 w-10 h-6 bg-rose-600 rounded-xs border border-white flex items-center justify-center text-[10px] text-white font-bold">
                  🇰🇭
                </div>
              </div>

              {/* Dynamic Cast Shadow */}
              <div
                className="absolute bottom-0 w-4 bg-slate-900/40 rounded-full blur-xs transition-all duration-150 origin-bottom"
                style={{
                  height: `${Math.min(140, Math.abs(1 / Math.tan((sunAngle * Math.PI) / 180)) * 60)}px`,
                  transform: `rotate(${sunAngle < 90 ? 75 : -75}deg)`,
                }}
              />
            </div>

            {/* Dial Base */}
            <div className="z-10 bg-white/95 px-4 py-2 rounded-2xl border border-amber-300 shadow-md text-xs font-bold text-amber-950 font-khmer flex items-center gap-4">
              <span>មុំព្រះអាទិត្យ: {sunAngle}°</span>
              <span>គោលដៅ: {sandbox.targetMilestone || 'ម៉ោង ៤ រសៀល (ស្រមោលវែងទៅកើត)'}</span>
            </div>
          </div>

          {/* Sun Drag Controller */}
          <div className="bg-white p-5 rounded-3xl border-3 border-amber-200 shadow-sm space-y-2">
            <label className="text-xs font-bold text-slate-700 block font-khmer">
              ☀️ អូសរំកិលព្រះអាទិត្យឆ្លងកាត់ផ្ទៃមេឃ (Drag Sun Across Sky):
            </label>
            <input
              type="range"
              min="15"
              max="165"
              value={sunAngle}
              onChange={e => {
                sound.playPop();
                setSunAngle(parseInt(e.target.value, 10));
              }}
              className="w-full h-3 bg-amber-100 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODE 4: MAGNETIC FIELD SANDBOX */}
      {/* ===================================================================== */}
      {mode === 'magnetism' && (
        <div className="space-y-4">
          <div
            onMouseMove={handleMoveMagnet}
            className="bg-slate-50 rounded-3xl p-6 border-4 border-rose-300 shadow-inner relative min-h-[320px] overflow-hidden cursor-crosshair select-none"
          >
            {/* Draggable Horseshoe Magnet */}
            <div
              className="absolute w-16 h-16 pointer-events-none transition-transform duration-75 z-20 flex items-center justify-center text-4xl drop-shadow-lg"
              style={{
                left: `${magnetPos.x - 32}px`,
                top: `${magnetPos.y - 32}px`,
              }}
            >
              🧲
            </div>

            {/* Objects on Table */}
            {magnetItems.map(item => (
              <div
                key={item.id}
                className={`absolute p-2 rounded-xl border flex items-center gap-1 transition-all duration-200 font-khmer text-xs font-bold ${
                  item.caught
                    ? 'bg-rose-100 border-rose-400 text-rose-950 scale-110 shadow-md'
                    : 'bg-white border-slate-200 text-slate-700'
                }`}
                style={{
                  left: `${item.x}px`,
                  top: `${item.y}px`,
                }}
              >
                <span className="text-2xl">{item.icon}</span>
                <span>{item.nameKhmer}</span>
              </div>
            ))}
          </div>

          <div className="bg-white p-4 rounded-2xl border-2 border-rose-200 flex items-center justify-between text-xs font-bold text-slate-700">
            <span>💡 អូសមេដែក 🧲 កាត់លើតុ ដើម្បីស្រូបវត្ថុដែលធ្វើពីដែក</span>
            <span className="text-rose-700 font-black">ស្រូបបាន: {caughtCount}/{totalMagnetic}</span>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODE 5: GERM BUSTER SOAP SCRUB */}
      {/* ===================================================================== */}
      {mode === 'germ_buster' && (
        <div className="space-y-4">
          <div
            onMouseMove={handleScrubMove}
            className="bg-gradient-to-b from-sky-50 to-emerald-50 rounded-3xl p-6 border-4 border-sky-300 shadow-inner relative min-h-[320px] overflow-hidden cursor-pointer select-none flex items-center justify-center"
          >
            {/* SVG Hand Illustration */}
            <div className="text-9xl opacity-30 pointer-events-none">
              🖐️
            </div>

            {/* Floating Bacteria / Microbes */}
            {germs.map(g => (
              <div
                key={g.id}
                className="absolute flex flex-col items-center pointer-events-none transition-opacity duration-200 animate-pulse"
                style={{
                  left: `${g.x}%`,
                  top: `${g.y}%`,
                  opacity: g.health / 100,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <span className="text-4xl">🦠</span>
                <span className="text-[10px] font-bold bg-white/80 px-1 rounded shadow-xs text-rose-800">
                  {g.health}%
                </span>
              </div>
            ))}

            {/* Foam Bubbles */}
            {foamBubbles.map(b => (
              <div
                key={b.id}
                className="absolute w-6 h-6 rounded-full bg-white/80 border border-sky-200 pointer-events-none animate-ping"
                style={{ left: `${b.x}%`, top: `${b.y}%` }}
              />
            ))}

            {/* Draggable Soap Bar */}
            <div
              className="absolute pointer-events-none transition-all duration-75 text-4xl drop-shadow-md z-20"
              style={{
                left: `${soapPos.x}%`,
                top: `${soapPos.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              🧼
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border-2 border-sky-200 flex items-center justify-between text-xs font-bold text-slate-700">
            <span>🧼 អូសដុំសាប៊ូដុសលើបាតដៃដើម្បីកម្ចាត់មេរោគ</span>
            <span className="text-sky-700 font-black">មេរោគនៅសល់: {remainingGerms}</span>
          </div>
        </div>
      )}
    </div>
  );
};
