'use client';

import React, { useState, useEffect } from 'react';
import { GameLevel, MathCraData, MathCraMode } from '@/types/edtech';
import { sound } from '@/utils/sound';
import { SpeakerButton } from '@/components/common/SpeakerButton';
import {
  Scale,
  ShoppingBag,
  Coins,
  Clock,
  Sparkles,
  CheckCircle2,
  RotateCcw,
  Scissors,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';

interface MathCraEngineProps {
  level: GameLevel;
  onLevelComplete: (scoreGain: number) => void;
}

export const MathCraEngine: React.FC<MathCraEngineProps> = ({ level, onLevelComplete }) => {
  const mathData = level.gameplayData.mathCraData || {
    mode: 'balance_scale' as MathCraMode,
  };

  const mode = mathData.mode;

  // -------------------------------------------------------------------------
  // 1. DUAL-PAN BALANCE SCALE STATE
  // -------------------------------------------------------------------------
  const targetRightWeight = mathData.rightPanTarget ?? 9;
  const initialLeftKnown = mathData.leftPanWeights?.[0] ?? 4;
  const [mysteryValue, setMysteryValue] = useState<number>(0);
  const leftTotalWeight = initialLeftKnown + mysteryValue;
  const tiltAngle = Math.max(-25, Math.min(25, (targetRightWeight - leftTotalWeight) * 4));
  const isScaleBalanced = leftTotalWeight === targetRightWeight;

  useEffect(() => {
    if (mode === 'balance_scale' && isScaleBalanced) {
      sound.playSuccessChime();
      sound.playStarCelebration();
      const t = setTimeout(() => {
        onLevelComplete(120);
      }, 1400);
      return () => clearTimeout(t);
    }
  }, [mode, isScaleBalanced, onLevelComplete]);

  // -------------------------------------------------------------------------
  // 2. CAMBODIAN MARKET CASHIER STATE
  // -------------------------------------------------------------------------
  const targetBillRiel = mathData.targetTotal ?? 2700;
  const [paidRiel, setPaidRiel] = useState<number>(0);
  const banknotes = [100, 500, 1000, 5000, 10000];
  const isExactPayment = paidRiel === targetBillRiel;

  const handleAddBanknote = (denom: number) => {
    sound.playCoinSound();
    setPaidRiel(prev => prev + denom);
  };

  const handleResetCash = () => {
    sound.playPop();
    setPaidRiel(0);
  };

  useEffect(() => {
    if (mode === 'market_cashier' && isExactPayment) {
      sound.playCashDrawer();
      sound.playSuccessChime();
      sound.playStarCelebration();
      const t = setTimeout(() => {
        onLevelComplete(120);
      }, 1500);
      return () => clearTimeout(t);
    }
  }, [mode, isExactPayment, onLevelComplete]);

  // -------------------------------------------------------------------------
  // 3. NUMBER LINE FROG HOPPER STATE
  // -------------------------------------------------------------------------
  const startNum = mathData.operandA ?? 6;
  const addNum = mathData.operandB ?? 7;
  const targetHopSum = startNum + addNum; // 13
  const [frogPos, setFrogPos] = useState<number>(startNum);
  const [hopHistory, setHopHistory] = useState<number[]>([startNum]);

  const handleHop = (direction: 'forward' | 'backward') => {
    sound.playFrogJump();
    setFrogPos(prev => {
      const next = direction === 'forward' ? Math.min(20, prev + 1) : Math.max(0, prev - 1);
      setHopHistory(h => [...h, next]);
      if (next === targetHopSum) {
        sound.playSuccessChime();
        sound.playStarCelebration();
        setTimeout(() => onLevelComplete(110), 1200);
      }
      return next;
    });
  };

  // -------------------------------------------------------------------------
  // 4. FAIR-SHARE PHYSICAL DIVISION STATE
  // -------------------------------------------------------------------------
  const totalFruits = mathData.totalItemsCount ?? 12;
  const basketCount = mathData.basketsCount ?? 3;
  const [baskets, setBaskets] = useState<number[]>(new Array(basketCount).fill(0));
  const fruitsInBaskets = baskets.reduce((sum, count) => sum + count, 0);
  const unassignedFruits = totalFruits - fruitsInBaskets;
  const targetPerBasket = Math.floor(totalFruits / basketCount);
  const isFairlyDivided = unassignedFruits === 0 && baskets.every(b => b === targetPerBasket);

  const handleDropFruitIntoBasket = (basketIdx: number) => {
    if (unassignedFruits <= 0) return;
    sound.playDrop();
    setBaskets(prev => {
      const copy = [...prev];
      copy[basketIdx] += 1;
      return copy;
    });
  };

  const handleResetBaskets = () => {
    sound.playPop();
    setBaskets(new Array(basketCount).fill(0));
  };

  useEffect(() => {
    if (mode === 'fair_share' && isFairlyDivided) {
      sound.playSuccessChime();
      sound.playStarCelebration();
      const t = setTimeout(() => {
        onLevelComplete(120);
      }, 1400);
      return () => clearTimeout(t);
    }
  }, [mode, isFairlyDivided, onLevelComplete]);

  // -------------------------------------------------------------------------
  // 5. FRACTION CUTTER STATE
  // -------------------------------------------------------------------------
  const targetDenom = mathData.targetFraction?.denominator ?? 4;
  const targetNum = mathData.targetFraction?.numerator ?? 2; // e.g. 2/4 = 1/2
  const [cutParts, setCutParts] = useState<number>(1);
  const [selectedSlices, setSelectedSlices] = useState<number[]>([]);

  const handleCutFood = (parts: number) => {
    sound.playSlice();
    setCutParts(parts);
    setSelectedSlices([]);
  };

  const handleToggleSlice = (idx: number) => {
    sound.playPop();
    setSelectedSlices(prev =>
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    );
  };

  const isFractionMatched =
    cutParts === targetDenom && selectedSlices.length === targetNum;

  useEffect(() => {
    if (mode === 'fraction_cutter' && isFractionMatched) {
      sound.playSuccessChime();
      sound.playStarCelebration();
      const t = setTimeout(() => {
        onLevelComplete(120);
      }, 1400);
      return () => clearTimeout(t);
    }
  }, [mode, isFractionMatched, onLevelComplete]);

  // -------------------------------------------------------------------------
  // 6. INTERACTIVE ANALOG CLOCKWORK STATE
  // -------------------------------------------------------------------------
  const targetHour = mathData.targetTime?.hour ?? 7;
  const targetMinute = mathData.targetTime?.minute ?? 0;
  const [currentMinute, setCurrentMinute] = useState<number>(0);
  const [currentHour, setCurrentHour] = useState<number>(6);

  const handleAddMinutes = (mins: number) => {
    sound.playPop();
    let nextM = currentMinute + mins;
    let nextH = currentHour;
    if (nextM >= 60) {
      nextH = (nextH + 1) % 12 || 12;
      nextM = nextM % 60;
    }
    setCurrentMinute(nextM);
    setCurrentHour(nextH);

    if (nextH === targetHour && nextM === targetMinute) {
      sound.playSuccessChime();
      sound.playStarCelebration();
      setTimeout(() => onLevelComplete(120), 1400);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-amber-50 rounded-3xl p-5 border-3 border-amber-200 shadow-sm flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <SpeakerButton text={level.promptText} size="md" />
          <div>
            <span className="text-xs font-black uppercase text-amber-700 tracking-wider">
              {mode === 'balance_scale' && 'គណិតវិទ្យារូបវ័ន្ត • Dual-Pan Balance Scale'}
              {mode === 'market_cashier' && 'ការទូទាត់ប្រាក់រៀល • Cambodian Market Cashier'}
              {mode === 'frog_hopper' && 'បន្ទាត់ចំនួន • Number Line Frog Hopper'}
              {mode === 'fair_share' && 'វិធីចែករូបវ័ន្ត • Fair-Share Division'}
              {mode === 'fraction_cutter' && 'ប្រភាគនំប្រពៃណី • Fraction Cutter'}
              {mode === 'clockwork' && 'នាឡិកាដៃអន្តរកម្ម • School Clockwork'}
            </span>
            <h3 className="text-lg sm:text-xl font-black font-khmer text-amber-950">
              {level.promptText}
            </h3>
          </div>
        </div>

        <div className="shrink-0 bg-white px-3.5 py-1.5 rounded-2xl border border-amber-200 text-xs font-black text-amber-800 shadow-xs">
          {mode === 'balance_scale' && (isScaleBalanced ? '⚖️ ស្មើគ្នា!' : '⚖️ មិនទាន់ស្មើ')}
          {mode === 'market_cashier' && `${paidRiel.toLocaleString()}៛ / ${targetBillRiel.toLocaleString()}៛`}
          {mode === 'frog_hopper' && `🐸 លោតដល់: ${frogPos}`}
          {mode === 'fair_share' && `🧺 នៅសល់: ${unassignedFruits}`}
          {mode === 'fraction_cutter' && `${selectedSlices.length}/${cutParts}`}
          {mode === 'clockwork' && `${currentHour}:${currentMinute.toString().padStart(2, '0')}`}
        </div>
      </div>

      {/* ===================================================================== */}
      {/* MODE 1: DUAL-PAN BALANCE SCALE */}
      {/* ===================================================================== */}
      {mode === 'balance_scale' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-b from-sky-50 to-amber-50 rounded-3xl p-8 border-4 border-amber-300 shadow-md flex flex-col items-center justify-center min-h-[340px] relative overflow-hidden">
            {/* Pivot Support Stand */}
            <div className="w-6 h-36 bg-amber-800 rounded-t-sm shadow-md relative z-0 mt-28">
              <div className="w-16 h-4 bg-amber-900 rounded-full -ml-5 mt-32" />
            </div>

            {/* Fulcrum Pivot Triangle */}
            <div className="absolute top-[138px] w-0 h-0 border-l-[18px] border-l-transparent border-r-[18px] border-r-transparent border-b-[28px] border-b-amber-700 z-10" />

            {/* Tilting Balance Beam */}
            <div
              className="absolute top-[138px] w-[340px] sm:w-[420px] h-4 bg-gradient-to-r from-amber-600 via-amber-700 to-amber-600 rounded-full shadow-lg flex items-center justify-between px-2 transition-transform duration-300 origin-center z-20"
              style={{ transform: `rotate(${tiltAngle}deg)` }}
            >
              {/* Left Pan Container */}
              <div className="flex flex-col items-center -ml-4 origin-top transition-transform duration-300" style={{ transform: `rotate(${-tiltAngle}deg)` }}>
                <div className="w-0.5 h-16 bg-slate-600" />
                <div className="w-32 sm:w-36 min-h-[50px] bg-amber-200 border-3 border-amber-500 rounded-2xl p-2 shadow-md flex flex-wrap items-center justify-center gap-1.5 text-xs font-bold text-amber-950 font-khmer">
                  <span className="bg-amber-100 px-2 py-1 rounded-lg border border-amber-400">
                    {initialLeftKnown}kg
                  </span>
                  <span className="text-sm font-black">+</span>
                  <span className="bg-sky-100 px-2 py-1 rounded-lg border border-sky-400 font-mono text-sky-950">
                    {mysteryValue > 0 ? `${mysteryValue}kg` : '📦 ▢'}
                  </span>
                </div>
              </div>

              {/* Right Pan Container */}
              <div className="flex flex-col items-center -mr-4 origin-top transition-transform duration-300" style={{ transform: `rotate(${-tiltAngle}deg)` }}>
                <div className="w-0.5 h-16 bg-slate-600" />
                <div className="w-32 sm:w-36 min-h-[50px] bg-amber-200 border-3 border-amber-500 rounded-2xl p-2 shadow-md flex flex-wrap items-center justify-center gap-1.5 text-xs font-bold text-amber-950 font-khmer">
                  <span className="bg-emerald-100 px-2 py-1 rounded-lg border border-emerald-400 font-mono text-emerald-950">
                    {targetRightWeight}kg
                  </span>
                </div>
              </div>
            </div>

            {/* Equation Overlay */}
            <div className="z-30 mt-8 bg-white/95 px-6 py-2 rounded-2xl border-2 border-amber-300 shadow font-heading font-black text-base text-amber-950">
              សមីការ៖ {initialLeftKnown} + <span className="text-sky-600 underline">▢</span> = {targetRightWeight}
            </div>
          </div>

          {/* Mystery Weight Selector Buttons */}
          <div className="bg-white p-5 rounded-3xl border-3 border-amber-200 shadow-sm space-y-3">
            <span className="text-xs font-bold text-slate-600 block uppercase tracking-wide">
              ជ្រើសរើសទម្ងន់សម្រាប់ប្រអប់អាថ៌កំបាំង ▢ (Choose Weight for Mystery Box):
            </span>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {[2, 3, 4, 5, 6, 7].map(val => (
                <button
                  key={val}
                  onClick={() => {
                    sound.playBalanceTilt();
                    setMysteryValue(val);
                  }}
                  className={`w-16 h-16 rounded-2xl font-black text-xl font-mono btn-kid border-b-4 flex items-center justify-center transition-all ${
                    mysteryValue === val
                      ? 'bg-sky-500 border-sky-700 text-white scale-110 shadow-lg'
                      : 'bg-amber-100 border-amber-300 text-amber-950 hover:bg-amber-200'
                  }`}
                >
                  {val}kg
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODE 2: CAMBODIAN MARKET CASHIER */}
      {/* ===================================================================== */}
      {mode === 'market_cashier' && (
        <div className="space-y-6">
          {/* Grocery Bill Display */}
          <div className="bg-white rounded-3xl p-6 border-4 border-amber-300 shadow-md flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-100 border-2 border-amber-300 flex items-center justify-center text-4xl shadow-inner">
                🧺
              </div>
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                  វិក្កយបត្រទំនិញ (Market Bill)
                </span>
                <h4 className="text-2xl font-black text-amber-950 font-khmer">
                  តម្លៃសរុប៖ <span className="text-emerald-600">{targetBillRiel.toLocaleString()}៛</span>
                </h4>
              </div>
            </div>

            {/* Cash Counter */}
            <div className="bg-amber-50 px-6 py-3 rounded-2xl border-2 border-amber-300 text-center">
              <span className="text-xs font-bold text-amber-800 block">ប្រាក់បានបង់ (Paid):</span>
              <span className="text-3xl font-black font-mono text-amber-950">
                {paidRiel.toLocaleString()}៛
              </span>
            </div>

            <button
              onClick={handleResetCash}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 btn-kid"
            >
              <RotateCcw className="w-4 h-4" />
              <span>រាប់ឡើងវិញ</span>
            </button>
          </div>

          {/* Authentic Cambodian Riel Banknote Chips */}
          <div className="bg-white rounded-3xl p-6 border-3 border-amber-200 shadow-sm space-y-4">
            <span className="text-xs font-bold text-slate-600 block uppercase tracking-wide">
              ចុចលើក្រដាសប្រាក់រៀលខ្មែរដើម្បីបង់ប្រាក់ (Tap Banknotes to Pay):
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {banknotes.map(denom => (
                <button
                  key={denom}
                  onClick={() => handleAddBanknote(denom)}
                  className="p-4 rounded-2xl border-b-4 font-black font-khmer text-center btn-kid shadow-sm transition-all flex flex-col items-center justify-center gap-1 bg-gradient-to-b from-amber-100 to-amber-200 border-amber-400 text-amber-950 hover:scale-105"
                >
                  <Coins className="w-6 h-6 text-amber-700 mb-1" />
                  <span className="text-lg font-mono">{denom.toLocaleString()}៛</span>
                  <span className="text-[10px] opacity-75">ក្រដាសប្រាក់</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODE 3: NUMBER LINE FROG HOPPER */}
      {/* ===================================================================== */}
      {mode === 'frog_hopper' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border-4 border-emerald-300 shadow-md space-y-6">
            <div className="text-center">
              <h4 className="text-2xl font-black font-heading text-emerald-950">
                សមីការ៖ {startNum} + {addNum} = ?
              </h4>
              <p className="text-xs text-slate-500 font-khmer">
                ចុចប៊ូតុង &quot;លោតទៅមុខ&quot; ដើម្បីជួយកង្កែបលោតលើបន្ទាត់ចំនួន
              </p>
            </div>

            {/* Visual Number Line */}
            <div className="relative pt-12 pb-4 overflow-x-auto">
              <div className="min-w-[500px] flex items-center justify-between border-b-4 border-slate-700 relative">
                {Array.from({ length: 21 }, (_, i) => (
                  <div key={i} className="flex flex-col items-center relative">
                    {/* Tick Mark */}
                    <div className="w-0.5 h-3 bg-slate-700 mb-1" />
                    <span className={`text-xs font-mono font-bold ${frogPos === i ? 'text-emerald-700 font-black scale-125' : 'text-slate-500'}`}>
                      {i}
                    </span>

                    {/* Animated Frog at Position */}
                    {frogPos === i && (
                      <div className="absolute -top-12 text-3xl animate-bounce">
                        🐸
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Hopper Controls */}
            <div className="flex justify-center gap-4 pt-2">
              <button
                onClick={() => handleHop('backward')}
                className="px-6 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-sm btn-kid flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>លោតថយក្រោយ (-1)</span>
              </button>
              <button
                onClick={() => handleHop('forward')}
                className="px-8 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-base btn-kid flex items-center gap-2 border-b-4 border-emerald-700"
              >
                <span>លោតទៅមុខ (+1)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODE 4: FAIR-SHARE PHYSICAL DIVISION */}
      {/* ===================================================================== */}
      {mode === 'fair_share' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border-4 border-amber-300 shadow-md space-y-6">
            <div className="flex items-center justify-between border-b border-amber-100 pb-3">
              <div>
                <h4 className="text-xl font-black font-heading text-amber-950">
                  ចែកផ្លែមង្ឃុត {totalFruits} ផ្លែ ស្មើៗគ្នាចូលក្នុងកន្ត្រក {basketCount}
                </h4>
                <p className="text-xs text-slate-500 font-khmer">
                  ចុចលើកន្ត្រកនីមួយៗដើម្បីដាក់ផ្លែឈើចូលស្មើគ្នា
                </p>
              </div>
              <button
                onClick={handleResetBaskets}
                className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs btn-kid"
              >
                ចែកឡើងវិញ
              </button>
            </div>

            {/* Baskets Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {baskets.map((count, idx) => (
                <div
                  key={idx}
                  onClick={() => handleDropFruitIntoBasket(idx)}
                  className="bg-amber-50/70 hover:bg-amber-100 border-3 border-amber-300 rounded-3xl p-5 text-center cursor-pointer transition-all btn-kid space-y-3"
                >
                  <span className="text-4xl block">🧺</span>
                  <h5 className="font-extrabold text-amber-950 font-khmer text-sm">
                    កន្ត្រកទី {idx + 1}
                  </h5>
                  <div className="min-h-[40px] flex flex-wrap items-center justify-center gap-1">
                    {Array.from({ length: count }, (_, i) => (
                      <span key={i} className="text-2xl animate-scale-in">
                        🫐
                      </span>
                    ))}
                  </div>
                  <span className="text-xs font-mono font-bold text-amber-800 bg-white px-2 py-0.5 rounded-md border border-amber-200 inline-block">
                    {count} ផ្លែ
                  </span>
                </div>
              ))}
            </div>

            {/* Unassigned Remaining Fruit Pile */}
            <div className="bg-slate-50 rounded-2xl p-4 border-2 border-dashed border-slate-300 text-center">
              <span className="text-xs font-bold text-slate-500 block mb-1">
                ផ្លែឈើដែលមិនទាន់បានចែក (Unassigned Pile): {unassignedFruits} ផ្លែ
              </span>
              <div className="flex flex-wrap items-center justify-center gap-1.5 min-h-[36px]">
                {Array.from({ length: unassignedFruits }, (_, i) => (
                  <span key={i} className="text-2xl">
                    🫐
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODE 5: FRACTION CUTTER */}
      {/* ===================================================================== */}
      {mode === 'fraction_cutter' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border-4 border-rose-300 shadow-md space-y-6 text-center">
            <div>
              <h4 className="text-2xl font-black font-heading text-rose-950">
                កាត់នំអន្សមជ្រូក ឬផ្លែឈើជាប្រភាគ៖ {targetNum}/{targetDenom}
              </h4>
              <p className="text-xs text-slate-500 font-khmer">
                ជ្រើសរើសចំនួនចំណិត រួចចុចជ្រើសរើសចំណិតដែលត្រូវការ
              </p>
            </div>

            {/* Food Slices Grid */}
            <div className="flex justify-center gap-4 py-4">
              {Array.from({ length: cutParts }, (_, idx) => {
                const isSelected = selectedSlices.includes(idx);
                return (
                  <div
                    key={idx}
                    onClick={() => handleToggleSlice(idx)}
                    className={`w-28 h-28 rounded-3xl border-4 flex flex-col items-center justify-center cursor-pointer transition-all btn-kid ${
                      isSelected
                        ? 'bg-rose-100 border-rose-500 scale-105 shadow-md text-rose-950'
                        : 'bg-amber-50 border-amber-200 opacity-60'
                    }`}
                  >
                    <span className="text-4xl mb-1">🍉</span>
                    <span className="text-xs font-black font-mono">ចំណិត {idx + 1}</span>
                  </div>
                );
              })}
            </div>

            {/* Cut Action Buttons */}
            <div className="flex justify-center gap-3">
              {[2, 3, 4].map(parts => (
                <button
                  key={parts}
                  onClick={() => handleCutFood(parts)}
                  className={`px-5 py-2.5 rounded-2xl font-black text-sm btn-kid border-b-3 ${
                    cutParts === parts
                      ? 'bg-rose-500 text-white border-rose-700'
                      : 'bg-slate-100 text-slate-700 border-slate-300'
                  }`}
                >
                  <Scissors className="w-4 h-4 inline-block mr-1.5" />
                  <span>កាត់ជា {parts} ចំណិត</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODE 6: INTERACTIVE ANALOG CLOCKWORK */}
      {/* ===================================================================== */}
      {mode === 'clockwork' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border-4 border-sky-300 shadow-md flex flex-col items-center justify-center space-y-6">
            <div className="text-center">
              <h4 className="text-2xl font-black font-heading text-sky-950">
                តម្រង់ទ្រនិចនាឡិកាឱ្យត្រូវនឹង៖ {targetHour}:00 ព្រឹក
              </h4>
              <p className="text-xs text-slate-500 font-khmer">
                ម៉ោងចូលរៀនពេលព្រឹករបស់សាលាបឋមសិក្សា
              </p>
            </div>

            {/* SVG Analog Clockface */}
            <div className="relative w-56 h-56 rounded-full border-8 border-slate-800 bg-amber-50 shadow-inner flex items-center justify-center">
              {/* Hour Numbers */}
              {[12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((num, i) => {
                const angle = i * 30 * (Math.PI / 180);
                const x = 50 + 40 * Math.sin(angle);
                const y = 50 - 40 * Math.cos(angle);
                return (
                  <span
                    key={num}
                    className="absolute text-xs font-black font-mono text-slate-800"
                    style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}
                  >
                    {num}
                  </span>
                );
              })}

              {/* Center Pivot */}
              <div className="w-4 h-4 rounded-full bg-slate-900 z-30" />

              {/* Hour Hand */}
              <div
                className="absolute w-2 h-16 bg-slate-800 rounded-full origin-bottom z-10 transition-transform duration-200"
                style={{
                  bottom: '50%',
                  transform: `rotate(${currentHour * 30 + (currentMinute / 60) * 30}deg)`,
                }}
              />

              {/* Minute Hand */}
              <div
                className="absolute w-1.5 h-22 bg-rose-600 rounded-full origin-bottom z-20 transition-transform duration-100"
                style={{
                  bottom: '50%',
                  transform: `rotate(${currentMinute * 6}deg)`,
                }}
              />
            </div>

            {/* Time Adjust Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => handleAddMinutes(15)}
                className="px-5 py-2.5 rounded-2xl bg-sky-100 hover:bg-sky-200 text-sky-950 font-bold text-sm btn-kid border border-sky-300"
              >
                +១៥ នាទី
              </button>
              <button
                onClick={() => handleAddMinutes(30)}
                className="px-5 py-2.5 rounded-2xl bg-sky-100 hover:bg-sky-200 text-sky-950 font-bold text-sm btn-kid border border-sky-300"
              >
                +៣០ នាទី
              </button>
              <button
                onClick={() => handleAddMinutes(60)}
                className="px-5 py-2.5 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-black text-sm btn-kid border-b-3 border-sky-700"
              >
                +១ ម៉ោង
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
