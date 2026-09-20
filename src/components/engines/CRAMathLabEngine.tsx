// src/components/engines/CRAMathLabEngine.tsx
// Universal Engine 2: Concrete-Representational-Abstract (CRA) Mathematics Lab
// Physical tokens manipulated before numeric equations appear
'use client';

import React, { useState, useEffect } from 'react';
import { GameLevel, MathCraData, MathCraMode } from '@/types/game';
import { soundSynthesizer } from '@/lib/audio/SoundSynthesizer';
import { speechService } from '@/lib/audio/speechHook';
import { SpeakButton } from '@/components/audio/SpeakButton';
import {
  Scale,
  ShoppingBag,
  Coins,
  Sparkles,
  RotateCcw,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Scissors,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface CRAMathLabEngineProps {
  level: GameLevel;
  onLevelComplete: (scoreGain: number) => void;
  onRestartLevel?: () => void;
}

export const CRAMathLabEngine: React.FC<CRAMathLabEngineProps> = ({
  level,
  onLevelComplete,
  onRestartLevel,
}) => {
  const mathData: MathCraData =
    level.gameplayData?.mathCraData ||
    level.gameplayData?.math_cra_data ||
    (level.gameplay_data as unknown as { mathCraData?: MathCraData; math_cra_data?: MathCraData })?.mathCraData ||
    (level.gameplay_data as unknown as { math_cra_data?: MathCraData })?.math_cra_data || {
      mode: 'market_cashier' as MathCraMode,
      targetTotal: 2700,
    };

  const mode = mathData.mode || 'market_cashier';

  // -------------------------------------------------------------------------
  // 1. CAMBODIAN MARKET CASHIER (100៛, 500៛, 1,000៛, 5,000៛, 10,000៛)
  // -------------------------------------------------------------------------
  const targetBillRiel = mathData.targetTotal || mathData.target_total || 2700;
  const [paidRiel, setPaidRiel] = useState<number>(0);
  const [paidBanknotes, setPaidBanknotes] = useState<number[]>([]);
  const isExactPayment = paidRiel === targetBillRiel;
  const isOverpaid = paidRiel > targetBillRiel;

  const banknoteConfigs = [
    { value: 100, label: '១០០៛', color: 'bg-amber-100 text-amber-900 border-amber-300' },
    { value: 500, label: '៥០០៛', color: 'bg-rose-100 text-rose-900 border-rose-300' },
    { value: 1000, label: '១,០០០៛', color: 'bg-blue-100 text-blue-900 border-blue-300' },
    { value: 5000, label: '៥,០០០៛', color: 'bg-emerald-100 text-emerald-900 border-emerald-300' },
    { value: 10000, label: '១០,០០០៛', color: 'bg-purple-100 text-purple-900 border-purple-300' },
  ];

  const handleAddBanknote = (denom: number) => {
    soundSynthesizer.playCoin();
    setPaidRiel((prev) => prev + denom);
    setPaidBanknotes((prev) => [...prev, denom]);
  };

  const handleResetCash = () => {
    soundSynthesizer.playPop();
    setPaidRiel(0);
    setPaidBanknotes([]);
  };

  useEffect(() => {
    if (mode === 'market_cashier' && isExactPayment) {
      soundSynthesizer.playSuccess();
      soundSynthesizer.playFanfare();
      const t = setTimeout(() => {
        onLevelComplete(120);
      }, 1500);
      return () => clearTimeout(t);
    }
  }, [mode, isExactPayment, onLevelComplete]);

  // -------------------------------------------------------------------------
  // 2. DUAL-PAN BALANCE SCALE (A + ▢ = B)
  // -------------------------------------------------------------------------
  const targetRightWeight = mathData.rightPanTarget || mathData.right_pan_target || 9;
  const initialLeftKnown = (mathData.leftPanWeights || mathData.left_pan_weights)?.[0] ?? 4;
  const [mysteryValue, setMysteryValue] = useState<number>(0);
  const leftTotalWeight = initialLeftKnown + mysteryValue;
  const tiltAngle = Math.max(-20, Math.min(20, (targetRightWeight - leftTotalWeight) * 4));
  const isScaleBalanced = leftTotalWeight === targetRightWeight;

  useEffect(() => {
    if (mode === 'balance_scale' && isScaleBalanced && mysteryValue > 0) {
      soundSynthesizer.playSuccess();
      soundSynthesizer.playFanfare();
      const t = setTimeout(() => {
        onLevelComplete(120);
      }, 1400);
      return () => clearTimeout(t);
    }
  }, [mode, isScaleBalanced, mysteryValue, onLevelComplete]);

  // -------------------------------------------------------------------------
  // 3. FROG NUMBER LINE HOPPER (0-20 or 0-100)
  // -------------------------------------------------------------------------
  const startNum = mathData.operandA || mathData.operand_a || 5;
  const addNum = mathData.operandB || mathData.operand_b || 6;
  const targetHopSum = startNum + addNum;
  const maxLine = mathData.numberLineEnd || mathData.number_line_end || 20;
  const [frogPos, setFrogPos] = useState<number>(startNum);
  const [hopHistory, setHopHistory] = useState<number[]>([startNum]);

  const handleHop = (direction: 'forward' | 'backward') => {
    soundSynthesizer.playPop();
    setFrogPos((prev) => {
      const next = direction === 'forward' ? Math.min(maxLine, prev + 1) : Math.max(0, prev - 1);
      setHopHistory((h) => [...h, next]);
      if (next === targetHopSum) {
        soundSynthesizer.playSuccess();
        soundSynthesizer.playFanfare();
        setTimeout(() => onLevelComplete(110), 1300);
      }
      return next;
    });
  };

  // -------------------------------------------------------------------------
  // 4. FAIR-SHARE CANDY DIVISION WITH REMAINDERS
  // -------------------------------------------------------------------------
  const totalFruits = mathData.totalItemsCount || mathData.total_items_count || 12;
  const basketCount = mathData.basketsCount || mathData.baskets_count || 3;
  const itemEmoji = mathData.itemEmoji || mathData.item_emoji || '🍬';
  const [baskets, setBaskets] = useState<number[]>(new Array(basketCount).fill(0));
  const fruitsInBaskets = baskets.reduce((sum, count) => sum + count, 0);
  const unassignedFruits = totalFruits - fruitsInBaskets;
  const targetPerBasket = Math.floor(totalFruits / basketCount);
  const isFairlyDivided = unassignedFruits === 0 && baskets.every((b) => b === targetPerBasket);

  const handleDropFruitIntoBasket = (basketIdx: number) => {
    if (unassignedFruits <= 0) return;
    soundSynthesizer.playClick();
    setBaskets((prev) => {
      const copy = [...prev];
      copy[basketIdx] += 1;
      return copy;
    });
  };

  const handleResetBaskets = () => {
    soundSynthesizer.playPop();
    setBaskets(new Array(basketCount).fill(0));
  };

  useEffect(() => {
    if (mode === 'fair_share' && isFairlyDivided) {
      soundSynthesizer.playSuccess();
      soundSynthesizer.playFanfare();
      const t = setTimeout(() => {
        onLevelComplete(120);
      }, 1400);
      return () => clearTimeout(t);
    }
  }, [mode, isFairlyDivided, onLevelComplete]);

  // Restart handler
  const handleResetAll = () => {
    soundSynthesizer.playClick();
    handleResetCash();
    setMysteryValue(0);
    setFrogPos(startNum);
    setHopHistory([startNum]);
    handleResetBaskets();
    if (onRestartLevel) onRestartLevel();
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 p-4 sm:p-6 select-none font-kantumruy">
      {/* Header Prompt */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-md border-2 border-emerald-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 text-emerald-600 text-xs sm:text-sm font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>មន្ទីរពិសោធន៍គណិតវិទ្យា • CRA Math Lab</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 leading-relaxed font-kantumruy">
            {level.promptText || 'សូមរៀបចំ និងដោះស្រាយលំហាត់គណិតវិទ្យាខាងក្រោម៖'}
          </h2>
        </div>
        <div className="flex items-center gap-2 self-end sm:self-center">
          <SpeakButton text={level.promptText} size="md" variant="secondary" />
          <button
            onClick={handleResetAll}
            title="កំណត់ឡើងវិញ"
            className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* MODE 1: CAMBODIAN MARKET CASHIER */}
      {mode === 'market_cashier' && (
        <div className="bg-white rounded-3xl p-6 shadow-lg border-2 border-slate-100 flex flex-col gap-6">
          {/* Target Price Cash Register */}
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 text-white flex flex-col sm:flex-row items-center justify-between shadow-md gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-3xl">
                🛍️
              </div>
              <div>
                <p className="text-sm font-medium text-emerald-100">តម្លៃទំនិញសរុប (Price Due)</p>
                <p className="text-3xl sm:text-4xl font-black font-mono">
                  {targetBillRiel.toLocaleString()} <span className="font-kantumruy font-bold">រៀល</span>
                </p>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm px-5 py-3 rounded-2xl border border-white/20 text-center sm:text-right">
              <p className="text-xs text-emerald-100">ប្រាក់បានបង់ (Cash Tendered)</p>
              <p
                className={`text-2xl sm:text-3xl font-black font-mono ${
                  isExactPayment
                    ? 'text-amber-300'
                    : isOverpaid
                    ? 'text-rose-200'
                    : 'text-white'
                }`}
              >
                {paidRiel.toLocaleString()} <span className="font-kantumruy font-bold">រៀល</span>
              </p>
            </div>
          </div>

          {/* Paid Banknotes Tray */}
          <div className="min-h-[100px] bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-4 flex flex-wrap gap-2 items-center">
            {paidBanknotes.length === 0 ? (
              <p className="text-slate-400 text-sm italic mx-auto">
                ចុចលើក្រដាសប្រាក់ខាងក្រោមដើម្បីបង់ប្រាក់...
              </p>
            ) : (
              paidBanknotes.map((val, idx) => (
                <motion.div
                  key={`${val}_${idx}`}
                  initial={{ scale: 0.6, y: 10 }}
                  animate={{ scale: 1, y: 0 }}
                  className="px-3 py-1.5 rounded-xl border font-bold text-xs shadow-xs bg-emerald-50 text-emerald-800 border-emerald-300 flex items-center gap-1"
                >
                  <Coins className="w-3.5 h-3.5" />
                  <span>{val.toLocaleString()}៛</span>
                </motion.div>
              ))
            )}
          </div>

          {/* Banknote Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {banknoteConfigs.map((bill) => (
              <motion.button
                key={bill.value}
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.03 }}
                onClick={() => handleAddBanknote(bill.value)}
                className={`py-4 px-3 rounded-2xl border-2 font-bold shadow-sm transition flex flex-col items-center justify-center gap-1 ${bill.color}`}
              >
                <Coins className="w-6 h-6 opacity-70" />
                <span className="text-lg font-bold font-kantumruy">{bill.label}</span>
                <span className="text-xs opacity-75 font-mono">+{bill.value}៛</span>
              </motion.button>
            ))}
          </div>

          {/* Status Feedback */}
          {isExactPayment && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-emerald-100 border border-emerald-300 text-emerald-800 p-4 rounded-2xl flex items-center justify-center gap-2 font-bold"
            >
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              <span>អស្ចារ្យណាស់! អ្នកបានបង់ប្រាក់គ្រប់ចំនួនត្រឹមត្រូវឥតខ្ចោះ!</span>
            </motion.div>
          )}

          {isOverpaid && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-2xl text-center text-sm font-bold">
              លើសចំនួនប្រាក់ហើយ! សូមចុចប៊ូតុងកំណត់ឡើងវិញដើម្បីរាប់ម្តងទៀត។
            </div>
          )}
        </div>
      )}

      {/* MODE 2: DUAL-PAN BALANCE SCALE */}
      {mode === 'balance_scale' && (
        <div className="bg-white rounded-3xl p-6 shadow-lg border-2 border-slate-100 flex flex-col gap-6 items-center">
          {/* Visual Scale SVG */}
          <div className="relative w-full max-w-lg h-56 flex flex-col items-center justify-center">
            {/* Beam Pivot */}
            <div className="w-4 h-24 bg-slate-700 rounded-t-lg shadow-sm" />
            <div className="w-16 h-6 bg-slate-800 rounded-full -mt-2 shadow-md" />

            {/* Tilting Beam */}
            <motion.div
              animate={{ rotate: tiltAngle }}
              transition={{ type: 'spring', stiffness: 120, damping: 14 }}
              className="absolute top-12 w-full max-w-md h-3 bg-amber-600 rounded-full flex justify-between items-center px-4"
            >
              {/* Left Pan */}
              <div className="flex flex-col items-center -ml-2 -mt-1">
                <div className="w-0.5 h-16 bg-slate-400" />
                <div className="w-28 h-12 bg-amber-100 border-2 border-amber-400 rounded-b-2xl shadow-md flex items-center justify-center gap-1">
                  <span className="font-bold text-xs bg-amber-500 text-white px-2 py-0.5 rounded-lg">
                    {initialLeftKnown}
                  </span>
                  <span className="text-xs">+</span>
                  <span className="font-bold text-xs bg-indigo-600 text-white px-2 py-0.5 rounded-lg">
                    {mysteryValue || '▢'}
                  </span>
                </div>
              </div>

              {/* Right Pan */}
              <div className="flex flex-col items-center -mr-2 -mt-1">
                <div className="w-0.5 h-16 bg-slate-400" />
                <div className="w-28 h-12 bg-emerald-100 border-2 border-emerald-400 rounded-b-2xl shadow-md flex items-center justify-center">
                  <span className="font-black text-emerald-800 text-base font-mono">
                    {targetRightWeight}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Equation Display */}
          <div className="bg-slate-100 px-6 py-3 rounded-2xl text-xl font-bold font-mono text-slate-800 flex items-center gap-3">
            <span>{initialLeftKnown}</span>
            <span>+</span>
            <span className="text-indigo-600 bg-white px-3 py-1 rounded-xl shadow-xs border border-indigo-200">
              {mysteryValue || '?'}
            </span>
            <span>=</span>
            <span className="text-emerald-600">{targetRightWeight}</span>
          </div>

          {/* Manipulative Token Inputs */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                soundSynthesizer.playClick();
                setMysteryValue((prev) => Math.max(0, prev - 1));
              }}
              className="p-3 rounded-2xl bg-rose-100 text-rose-700 hover:bg-rose-200 font-bold"
            >
              - ដក ១
            </button>
            <div className="px-5 py-2 bg-indigo-50 border-2 border-indigo-300 rounded-2xl text-2xl font-black text-indigo-700 min-w-[70px] text-center">
              {mysteryValue}
            </div>
            <button
              onClick={() => {
                soundSynthesizer.playClick();
                setMysteryValue((prev) => prev + 1);
              }}
              className="p-3 rounded-2xl bg-emerald-100 text-emerald-700 hover:bg-emerald-200 font-bold"
            >
              + ថែម ១
            </button>
          </div>
        </div>
      )}

      {/* MODE 3: NUMBER LINE FROG HOPPER */}
      {mode === 'frog_hopper' && (
        <div className="bg-white rounded-3xl p-6 shadow-lg border-2 border-slate-100 flex flex-col gap-6">
          {/* Target Equation */}
          <div className="text-center font-bold text-xl text-slate-800">
            <span>កង្កែបលោត៖ </span>
            <span className="text-indigo-600">{startNum}</span>
            <span> + </span>
            <span className="text-emerald-600">{addNum}</span>
            <span> = </span>
            <span className="text-amber-600 font-mono text-2xl">
              {frogPos === targetHopSum ? targetHopSum : '?'}
            </span>
          </div>

          {/* Number Line Visual */}
          <div className="overflow-x-auto py-8">
            <div className="relative min-w-[600px] h-20 flex items-center border-b-4 border-slate-700 px-4">
              {Array.from({ length: maxLine + 1 }).map((_, i) => {
                const isFrogHere = frogPos === i;
                const isTarget = targetHopSum === i;

                return (
                  <div
                    key={i}
                    className="flex-1 flex flex-col items-center justify-end relative h-full"
                  >
                    {isFrogHere && (
                      <motion.div
                        layoutId="frog"
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        className="absolute -top-8 text-3xl"
                      >
                        🐸
                      </motion.div>
                    )}
                    {isTarget && !isFrogHere && (
                      <div className="absolute -top-6 text-xs font-bold text-amber-500 bg-amber-100 px-2 py-0.5 rounded-full">
                        🎯
                      </div>
                    )}
                    <div className="w-0.5 h-3 bg-slate-500 mb-1" />
                    <span className="text-xs font-mono font-bold text-slate-700">{i}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Controls */}
          <div className="flex justify-center gap-4">
            <button
              onClick={() => handleHop('backward')}
              className="px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>លោតថយក្រោយ</span>
            </button>
            <button
              onClick={() => handleHop('forward')}
              className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold flex items-center gap-2 shadow-md"
            >
              <span>លោតទៅមុខ</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* MODE 4: FAIR-SHARE DIVISION */}
      {mode === 'fair_share' && (
        <div className="bg-white rounded-3xl p-6 shadow-lg border-2 border-slate-100 flex flex-col gap-6">
          {/* Unassigned Items Pool */}
          <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-amber-900 font-kantumruy">
                ចែក {totalFruits} {itemEmoji} ចូលក្នុង {basketCount} កន្ត្រកឲ្យស្មើគ្នា៖
              </p>
              <p className="text-xs text-amber-700">នៅសល់៖ {unassignedFruits} {itemEmoji}</p>
            </div>
            <div className="flex flex-wrap gap-1 max-w-sm">
              {Array.from({ length: unassignedFruits }).map((_, idx) => (
                <span key={idx} className="text-2xl animate-pulse">
                  {itemEmoji}
                </span>
              ))}
            </div>
          </div>

          {/* Baskets */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {baskets.map((count, bIdx) => (
              <motion.button
                key={bIdx}
                whileTap={{ scale: 0.96 }}
                onClick={() => handleDropFruitIntoBasket(bIdx)}
                className="bg-amber-100/60 border-2 border-amber-300 hover:border-amber-500 p-5 rounded-3xl flex flex-col items-center gap-3 transition shadow-sm text-center"
              >
                <div className="w-16 h-16 rounded-full bg-amber-200 flex items-center justify-center text-3xl shadow-inner">
                  🧺
                </div>
                <span className="font-bold text-amber-900">កន្ត្រកទី {bIdx + 1}</span>
                <div className="min-h-[40px] flex flex-wrap gap-1 justify-center">
                  {Array.from({ length: count }).map((_, cIdx) => (
                    <span key={cIdx} className="text-xl">
                      {itemEmoji}
                    </span>
                  ))}
                </div>
                <span className="text-xs bg-white px-3 py-1 rounded-full font-bold text-amber-800 shadow-xs">
                  {count} គ្រាប់
                </span>
              </motion.button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export const MathCraEngine = CRAMathLabEngine;
export default CRAMathLabEngine;
