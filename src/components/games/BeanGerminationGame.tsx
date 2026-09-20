'use client';

import React, { useState, useEffect } from 'react';
import { useEdTech } from '@/context/EdTechContext';
import { sound } from '@/utils/sound';
import confetti from 'canvas-confetti';
import {
  ArrowLeft,
  Sun,
  Droplets,
  Calendar,
  RefreshCw,
  Sparkles,
  Star,
  Info,
  AlertTriangle,
  Heart,
} from 'lucide-react';

export const BeanGerminationGame: React.FC = () => {
  const { grade, recordGameProgress, setActiveGame } = useEdTech();

  // Controls
  const [waterLevel, setWaterLevel] = useState<number>(55); // 0-100%
  const [sunlightHours, setSunlightHours] = useState<number>(6); // 0-12 hrs
  const [currentDay, setCurrentDay] = useState<number>(1); // 1-7

  // Plant status
  type PlantCondition = 'dormant' | 'sprouting' | 'healthy' | 'rotting' | 'wilting';
  const [condition, setCondition] = useState<PlantCondition>('dormant');
  const [growthScore, setGrowthScore] = useState<number>(0);
  const [dailyLog, setDailyLog] = useState<{ day: number; noteKh: string; status: PlantCondition }[]>([]);
  const [gameFinished, setGameFinished] = useState<boolean>(false);
  const [stars, setStars] = useState<number>(0);

  // Evaluate growth day by day
  const advanceDay = () => {
    sound.playPop();

    let nextCondition: PlantCondition = 'healthy';
    let note = '';
    let dayScoreGain = 0;

    // Biological Logic
    if (waterLevel < 30) {
      nextCondition = 'dormant';
      note = `ថ្ងៃទី ${currentDay}៖ គ្រាប់សណ្ដែកខ្វះជាតិទឹក ស្ងួត និងមិនអាចដុះពន្លកបានទេ។`;
    } else if (waterLevel > 85) {
      nextCondition = 'rotting';
      note = `ថ្ងៃទី ${currentDay}៖ ទឹកច្រើនជ្រុលពេក បណ្ដាលឲ្យគ្រាប់សណ្ដែករលួយ និងដុះផ្សិត!`;
    } else if (sunlightHours < 2 && currentDay > 3) {
      nextCondition = 'wilting';
      note = `ថ្ងៃទី ${currentDay}៖ ខ្វះពន្លឺព្រះអាទិត្យ ដើមសណ្ដែកដុះទ្រុឌទ្រោម និងស្លេកស្លាំង។`;
    } else if (sunlightHours > 10 && waterLevel < 45) {
      nextCondition = 'wilting';
      note = `ថ្ងៃទី ${currentDay}៖ កម្ដៅថ្ងៃខ្លាំងពេកធ្វើឲ្យដីស្ងួត ដើមសណ្ដែកស្រពោន។`;
    } else {
      // Balanced growth
      if (currentDay === 1) {
        nextCondition = 'dormant';
        note = `ថ្ងៃទី ១៖ គ្រាប់សណ្ដែកស្រូបយកទឹក និងចាប់ផ្ដើមរីកប៉ោង។`;
        dayScoreGain = 50;
      } else if (currentDay === 2) {
        nextCondition = 'sprouting';
        note = `ថ្ងៃទី ២៖ សំបកគ្រាប់សណ្ដែកប្រេះ ហើយឫសកែវតូចមួយលេចចេញ!`;
        dayScoreGain = 60;
      } else if (currentDay <= 4) {
        nextCondition = 'sprouting';
        note = `ថ្ងៃទី ${currentDay}៖ ឫសដុះជ្រៅ ហើយពន្លកបៃតងចាប់ផ្ដើមងើបឡើងលើ។`;
        dayScoreGain = 70;
      } else {
        nextCondition = 'healthy';
        note = `ថ្ងៃទី ${currentDay}៖ ស្លឹកបៃតងខ្ចីរីកធំ ស្រូបយកពន្លឺបង្កើតអាហារយ៉ាងរឹងមាំ!`;
        dayScoreGain = 90;
      }
    }

    setCondition(nextCondition);
    setGrowthScore(prev => prev + dayScoreGain);
    setDailyLog(prev => [{ day: currentDay, noteKh: note, status: nextCondition }, ...prev]);

    if (currentDay >= 7) {
      // Finished 7-day lab!
      const isSuccess = nextCondition === 'healthy' || (nextCondition === 'sprouting' && growthScore > 250);
      const calculatedStars = isSuccess ? 3 : growthScore > 150 ? 2 : 1;
      setStars(calculatedStars);
      setGameFinished(true);

      if (isSuccess) {
        sound.playSuccess();
        sound.playStar();
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#4ADE80', '#22C55E', '#FBBF24', '#38BDF8'],
        });
      } else {
        sound.playWrong();
      }

      recordGameProgress('plant-lab', 'science', growthScore + dayScoreGain, calculatedStars);
    } else {
      setCurrentDay(prev => prev + 1);
    }
  };

  // Reset simulation
  const resetSimulation = () => {
    sound.playPop();
    setCurrentDay(1);
    setWaterLevel(55);
    setSunlightHours(6);
    setCondition('dormant');
    setGrowthScore(0);
    setDailyLog([]);
    setGameFinished(false);
  };

  // SVG Plant Renderer based on Day and Condition
  const renderPlantSvg = () => {
    return (
      <svg viewBox="0 0 300 240" className="w-full h-64 select-none drop-shadow-md">
        {/* Background Sky / Lab Light */}
        <defs>
          <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={sunlightHours > 7 ? '#FEF08A' : '#E0F2FE'} />
            <stop offset="100%" stopColor="#FFFFFF" />
          </linearGradient>
          <linearGradient id="soilGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#78350F" />
            <stop offset="100%" stopColor="#451A03" />
          </linearGradient>
        </defs>

        {/* Sky Background */}
        <rect x="10" y="10" width="280" height="150" rx="16" fill="url(#skyGrad)" />

        {/* Sun Illustration in Top Right */}
        <g transform="translate(240, 45)">
          <circle
            cx="0"
            cy="0"
            r={12 + sunlightHours}
            fill="#FBBF24"
            className="animate-pulse"
            opacity={0.3 + (sunlightHours / 12) * 0.7}
          />
          <circle cx="0" cy="0" r="14" fill="#F59E0B" />
          {/* Rays */}
          {sunlightHours >= 4 && (
            <>
              <line x1="-22" y1="0" x2="-16" y2="0" stroke="#F59E0B" strokeWidth="2.5" />
              <line x1="16" y1="0" x2="22" y2="0" stroke="#F59E0B" strokeWidth="2.5" />
              <line x1="0" y1="-22" x2="0" y2="-16" stroke="#F59E0B" strokeWidth="2.5" />
              <line x1="0" y1="16" x2="0" y2="22" stroke="#F59E0B" strokeWidth="2.5" />
            </>
          )}
        </g>

        {/* Rain / Water droplets if water level is high */}
        {waterLevel > 60 && (
          <g>
            <circle cx="90" cy="50" r="2.5" fill="#38BDF8" className="animate-bounce" />
            <circle cx="120" cy="70" r="2" fill="#38BDF8" className="animate-bounce" />
            <circle cx="170" cy="40" r="2.5" fill="#38BDF8" className="animate-bounce" />
          </g>
        )}

        {/* Lab Petri Dish / Soil Pot */}
        <path d="M 40 160 Q 150 168 260 160 L 250 220 Q 150 230 50 220 Z" fill="url(#soilGrad)" />
        {/* Soil Rim */}
        <ellipse cx="150" cy="160" rx="110" ry="14" fill="#92400E" />

        {/* Moisture shine on soil */}
        {waterLevel > 40 && (
          <ellipse cx="150" cy="162" rx="90" ry="8" fill="#38BDF8" opacity={(waterLevel - 30) / 100} />
        )}

        {/* PLANT STAGES */}
        {condition === 'rotting' ? (
          /* Moldy Rotten Bean */
          <g transform="translate(150, 160)">
            <ellipse cx="0" cy="-2" rx="18" ry="12" fill="#71717A" />
            <circle cx="-5" cy="-4" r="4" fill="#A1A1AA" />
            <circle cx="6" cy="1" r="5" fill="#A1A1AA" />
            <circle cx="0" cy="-6" r="3" fill="#D4D4D8" />
            {/* Fly / odor waves */}
            <path d="M -10 -15 Q -5 -25 0 -18" stroke="#52525B" strokeWidth="1.5" fill="none" />
            <path d="M 5 -15 Q 10 -25 15 -18" stroke="#52525B" strokeWidth="1.5" fill="none" />
          </g>
        ) : condition === 'dormant' || currentDay === 1 ? (
          /* Dry or Initial Dormant Bean */
          <g transform="translate(150, 160)">
            <path
              d="M -12 -5 C -15 -15, 0 -18, 12 -8 C 18 0, 10 12, -2 10 C -12 8, -14 0, -12 -5 Z"
              fill={waterLevel < 30 ? '#B45309' : '#15803D'}
            />
            <ellipse cx="0" cy="0" rx="3" ry="2" fill="#FEF08A" opacity="0.8" />
          </g>
        ) : condition === 'sprouting' || currentDay <= 4 ? (
          /* Early Sprout with Roots and Arching Stem */
          <g transform="translate(150, 160)">
            {/* Roots into soil */}
            <path d="M 0 0 Q -8 18 -12 35" stroke="#FEF3C7" strokeWidth="2.5" fill="none" />
            <path d="M 0 5 Q 10 22 14 38" stroke="#FEF3C7" strokeWidth="2" fill="none" />
            {/* Bean halves */}
            <path d="M -10 -5 C -12 -12 0 -14 6 -6" fill="#15803D" />
            {/* Green Stem emerging */}
            <path
              d={`M 0 -5 Q ${condition === 'wilting' ? '15 -25 25 -20' : '-8 -35 0 -${25 + currentDay * 8}'}`}
              stroke="#4ADE80"
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
            />
            {/* Tiny First Leaves */}
            <ellipse
              cx={condition === 'wilting' ? 25 : -8}
              cy={condition === 'wilting' ? -20 : -35 - currentDay * 5}
              rx="8"
              ry="5"
              fill="#22C55E"
              transform="rotate(-20)"
            />
            <ellipse
              cx={condition === 'wilting' ? 28 : 8}
              cy={condition === 'wilting' ? -20 : -35 - currentDay * 5}
              rx="8"
              ry="5"
              fill="#22C55E"
              transform="rotate(20)"
            />
          </g>
        ) : (
          /* Full Healthy Vigorous Plant (Days 5-7) */
          <g transform="translate(150, 160)">
            {/* Extensive Root System */}
            <path d="M 0 0 Q -15 25 -22 45" stroke="#FEF3C7" strokeWidth="3" fill="none" />
            <path d="M 0 0 Q 15 25 25 46" stroke="#FEF3C7" strokeWidth="3" fill="none" />
            <path d="M -5 18 Q -28 32 -35 40" stroke="#FEF3C7" strokeWidth="1.8" fill="none" />
            <path d="M 5 18 Q 28 32 35 40" stroke="#FEF3C7" strokeWidth="1.8" fill="none" />

            {/* Thick Green Main Stem */}
            <path
              d="M 0 0 Q -5 -40 0 -85"
              stroke={condition === 'wilting' ? '#A3E635' : '#16A34A'}
              strokeWidth="6"
              strokeLinecap="round"
              fill="none"
            />

            {/* Lower Leaves */}
            <g transform="translate(-15, -45)">
              <ellipse cx="-12" cy="-5" rx="16" ry="9" fill="#22C55E" transform="rotate(-30)" />
              <line x1="0" y1="0" x2="-14" y2="-5" stroke="#16A34A" strokeWidth="2" />
            </g>
            <g transform="translate(15, -50)">
              <ellipse cx="14" cy="-5" rx="16" ry="9" fill="#22C55E" transform="rotate(30)" />
              <line x1="0" y1="0" x2="14" y2="-5" stroke="#16A34A" strokeWidth="2" />
            </g>

            {/* Upper Leaves and Crown */}
            <g transform="translate(-18, -75)">
              <ellipse cx="-14" cy="-8" rx="18" ry="11" fill="#4ADE80" transform="rotate(-25)" />
              <line x1="0" y1="0" x2="-14" y2="-8" stroke="#16A34A" strokeWidth="2" />
            </g>
            <g transform="translate(18, -80)">
              <ellipse cx="15" cy="-8" rx="18" ry="11" fill="#4ADE80" transform="rotate(25)" />
              <line x1="0" y1="0" x2="15" y2="-8" stroke="#16A34A" strokeWidth="2" />
            </g>
            {/* Top Fresh Sprout */}
            <ellipse cx="0" cy="-92" rx="10" ry="14" fill="#86EFAC" />
          </g>
        )}
      </svg>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-3xl border-4 border-emerald-300 shadow-lg">
        <button
          onClick={() => {
            sound.playPop();
            setActiveGame(null);
          }}
          className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-emerald-100 hover:bg-emerald-200 text-emerald-950 font-bold transition-all btn-kid text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>ថយក្រោយ</span>
        </button>

        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-bold font-heading text-emerald-900 flex items-center justify-center gap-2">
            <span>🌱 ពិសោធដុះពន្លកសណ្ដែក</span>
          </h2>
          <p className="text-xs text-emerald-700 font-medium">
            Bean Sprout Lab Simulation • វិទ្យាសាស្ត្របឋម
          </p>
        </div>

        <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-2xl border-2 border-emerald-200">
          <Calendar className="w-4 h-4 text-emerald-700" />
          <span className="font-extrabold text-emerald-900 text-sm">
            ថ្ងៃទី {currentDay} / 7
          </span>
        </div>
      </div>

      {gameFinished ? (
        /* Completion Screen */
        <div className="bg-white rounded-3xl p-8 border-4 border-emerald-400 text-center shadow-2xl space-y-6 animate-fade-in">
          <div className="w-20 h-20 mx-auto bg-emerald-100 rounded-full flex items-center justify-center text-4xl shadow-inner border-2 border-emerald-300 animate-bounce">
            🌱
          </div>
          <div>
            <h3 className="text-3xl font-extrabold text-emerald-950 font-heading">
              {condition === 'healthy'
                ? 'អបអរសាទរ! សណ្ដែកដុះលូតលាស់ល្អណាស់!'
                : 'ការពិសោធបានបញ្ចប់!'}
            </h3>
            <p className="text-slate-600 mt-1 max-w-md mx-auto">
              {condition === 'healthy'
                ? 'ប្អូនបានផ្ដល់បរិមាណទឹក និងពន្លឺថ្ងៃយ៉ាងសមស្របតាមតម្រូវការធម្មជាតិរបស់រុក្ខជាតិ។'
                : 'រុក្ខជាតិតម្រូវឲ្យមានទឹកសមល្មម (៤០-៧០%) និងពន្លឺថ្ងៃគ្រប់គ្រាន់ (៤-៨ ម៉ោង) ទើបអាចលូតលាស់ល្អ។'}
            </p>
          </div>

          <div className="flex justify-center gap-3">
            {[1, 2, 3].map(st => (
              <Star
                key={st}
                className={`w-12 h-12 transition-all ${
                  st <= stars
                    ? 'fill-amber-400 text-amber-500 scale-110 drop-shadow-md'
                    : 'text-slate-300 fill-slate-100'
                }`}
              />
            ))}
          </div>

          <div className="bg-emerald-50 rounded-2xl p-4 max-w-sm mx-auto border-2 border-emerald-200 flex justify-around">
            <div>
              <span className="text-xs text-emerald-700 block">ពិន្ទុពិសោធ</span>
              <span className="text-2xl font-black text-emerald-950">{growthScore}</span>
            </div>
            <div className="h-10 w-px bg-emerald-200" />
            <div>
              <span className="text-xs text-emerald-700 block">ផ្កាយទទួលបាន</span>
              <span className="text-2xl font-black text-emerald-950">+{stars} ⭐️</span>
            </div>
          </div>

          <div className="flex justify-center gap-4 pt-2">
            <button
              onClick={resetSimulation}
              className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-base btn-kid flex items-center gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              <span>ពិសោធឡើងវិញ</span>
            </button>
            <button
              onClick={() => {
                sound.playPop();
                setActiveGame(null);
              }}
              className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-base btn-kid"
            >
              ទំព័រដើម
            </button>
          </div>
        </div>
      ) : (
        /* Lab Bench & Controls */
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Visual Simulation Display (Left Column) */}
          <div className="md:col-span-7 bg-white rounded-3xl p-5 border-4 border-emerald-300 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-900 uppercase tracking-wide flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-500" />
                ចានពិសោធសណ្ដែកបណ្ដុះ (Petri Dish Lab)
              </span>
              <span
                className={`text-xs font-extrabold px-3 py-1 rounded-full ${
                  condition === 'healthy'
                    ? 'bg-emerald-100 text-emerald-800'
                    : condition === 'sprouting'
                    ? 'bg-lime-100 text-lime-800'
                    : condition === 'rotting'
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {condition === 'healthy' && 'លូតលាស់រឹងមាំ (Healthy)'}
                {condition === 'sprouting' && 'កំពុងដុះពន្លក (Sprouting)'}
                {condition === 'dormant' && 'អសកម្ម/ស្ងួត (Dormant)'}
                {condition === 'wilting' && 'ស្រពោន/ខ្សោយ (Wilting)'}
                {condition === 'rotting' && 'រលួយដុះផ្សិត (Rotting)'}
              </span>
            </div>

            {/* Plant Stage Graphic */}
            <div className="bg-slate-50 rounded-2xl p-2 border-2 border-slate-200">
              {renderPlantSvg()}
            </div>

            {/* Current day status message */}
            <div className="bg-emerald-50 rounded-2xl p-4 border-2 border-emerald-200">
              <p className="text-sm font-bold text-emerald-950 font-khmer">
                {dailyLog.length > 0
                  ? dailyLog[0].noteKh
                  : 'សូមកំណត់កម្រិតទឹក និងពន្លឺថ្ងៃ រួចចុចប៊ូតុង "ថ្ងៃបន្ទាប់" ដើម្បីពិនិត្យការលូតលាស់!'}
              </p>
            </div>
          </div>

          {/* Environmental Controls (Right Column) */}
          <div className="md:col-span-5 flex flex-col justify-between space-y-5">
            <div className="bg-white rounded-3xl p-6 border-4 border-sky-300 shadow-lg space-y-6">
              <h3 className="text-base font-bold text-slate-800 font-heading flex items-center gap-2">
                <span>🎛️ ផ្ទាំងបញ្ជាបរិស្ថានពិសោធ</span>
              </h3>

              {/* Slider 1: Water Level (0 - 100%) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-sky-900 flex items-center gap-1.5 font-khmer">
                    <Droplets className="w-5 h-5 text-sky-500" />
                    កម្រិតទឹក (Water Level):
                  </span>
                  <span className="text-base font-extrabold text-sky-600 bg-sky-50 px-2.5 py-0.5 rounded-xl border border-sky-200">
                    {waterLevel}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={waterLevel}
                  onChange={e => {
                    setWaterLevel(parseInt(e.target.value, 10));
                    sound.playWater();
                  }}
                  className="w-full h-3 bg-sky-100 rounded-lg appearance-none cursor-pointer accent-sky-500"
                />
                <div className="flex justify-between text-[11px] text-slate-500 font-medium">
                  <span>ស្ងួត (០%)</span>
                  <span className="text-emerald-600 font-bold">សមល្មម (៤០-៧០%)</span>
                  <span>ជន់លិច (១០០%)</span>
                </div>
              </div>

              {/* Slider 2: Sunlight Hours (0 - 12 hrs) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-amber-900 flex items-center gap-1.5 font-khmer">
                    <Sun className="w-5 h-5 text-amber-500" />
                    ពន្លឺថ្ងៃ (Sunlight Hours):
                  </span>
                  <span className="text-base font-extrabold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-xl border border-amber-200">
                    {sunlightHours} ម៉ោង/ថ្ងៃ
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="12"
                  value={sunlightHours}
                  onChange={e => {
                    setSunlightHours(parseInt(e.target.value, 10));
                    sound.playSun();
                  }}
                  className="w-full h-3 bg-amber-100 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <div className="flex justify-between text-[11px] text-slate-500 font-medium">
                  <span>ងងឹត (០ម៉ោង)</span>
                  <span className="text-amber-600 font-bold">សមរម្យ (៤-៨ ម៉ោង)</span>
                  <span>ក្ដៅខ្លាំង (១២ម៉ោង)</span>
                </div>
              </div>

              {/* Advance Day Button (Prompt 4 requirement) */}
              <button
                onClick={advanceDay}
                className="w-full py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-lg shadow-lg btn-kid flex items-center justify-center gap-2 border-b-4 border-emerald-700 active:translate-y-1"
              >
                <Calendar className="w-5 h-5" />
                <span>ថ្ងៃបន្ទាប់ ➔ (Next Day {currentDay + 1})</span>
              </button>
            </div>

            {/* MoEYS Science Curriculum Knowledge Card */}
            <div className="bg-amber-50/90 rounded-3xl p-5 border-2 border-amber-200 text-xs text-amber-900 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-amber-950">
                <Info className="w-4 h-4 text-amber-600 shrink-0" />
                <span>ចំណេះដឹងវិទ្យាសាស្ត្រ (Science Facts)</span>
              </div>
              <p className="leading-relaxed">
                គ្រាប់ពូជត្រូវការ <strong>ទឹក</strong> ដើម្បីបន្ទន់សំបក និងធ្វើឲ្យពន្លកចាប់ផ្ដើមលូតលាស់។ ប៉ុន្តែបើទឹកច្រើនជ្រុល គ្រាប់នឹងគ្មានខ្យល់ដកដង្ហើម ហើយរលួយ។
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
