// src/components/MiniGameModal.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { CurriculumExercise } from '@/types/curriculum';
import { sound } from '@/utils/sound';
import { SpeakerButton } from '@/components/common/SpeakerButton';
import {
  X,
  Sparkles,
  Star,
  Check,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Coins,
} from 'lucide-react';

interface MiniGameModalProps {
  exercise: CurriculumExercise | null;
  isOpen: boolean;
  onClose: () => void;
  onComplete: (exerciseId: string, isCorrect: boolean, score: number, stars: number) => void;
}

export const MiniGameModal: React.FC<MiniGameModalProps> = ({
  exercise,
  isOpen,
  onClose,
  onComplete,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // General Interactive State
  const [selectedAnswerId, setSelectedAnswerId] = useState<string | number | null>(null);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string>('');

  // Reset state on open or exercise change
  useEffect(() => {
    if (isOpen && exercise) {
      setSelectedAnswerId(null);
      setSubmitted(false);
      setIsCorrect(false);
      setFeedbackMsg('');

      // Auto read question
      const textToSpeak = exercise.audioPromptKh || exercise.questionKh;
      sound.speakKhmer(textToSpeak);
    }
  }, [isOpen, exercise?.id]);

  // Escape key listener for accessible closing
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !exercise) return null;

  // -------------------------------------------------------------------------
  // CHECK ANSWER LOGIC PER MECHANIC
  // -------------------------------------------------------------------------
  const handleVerify = (answerVal?: string | number) => {
    if (submitted) return;
    const chosen = answerVal !== undefined ? answerVal : selectedAnswerId;
    if (chosen === null || chosen === undefined) return;

    let correct = false;
    let feedback = '';

    switch (exercise.type) {
      case 'compare-select': {
        const item = exercise.items.find(i => i.id === chosen);
        correct = !!item?.isCorrect;
        feedback = correct
          ? 'ពូកែណាស់! ផ្លែធុរេនពិតជាធំជាងគេមែន! 🎉'
          : 'មិនទាន់ត្រូវទេ! សាកល្បងពិនិត្យទំហំផ្លែឈើម្តងទៀតណា៎! 😊';
        break;
      }
      case 'position-pick': {
        const item = exercise.items.find(i => i.id === chosen);
        correct = !!item?.isCorrect;
        feedback = correct
          ? 'ត្រឹមត្រូវហើយ! ទន្សាយនៅខាងស្តាំ! 🐰'
          : 'មិនទាន់ត្រូវទេ! សាកល្បងរករូបនៅខាងស្តាំម្តងទៀតណា៎! 😊';
        break;
      }
      case 'number-line':
      case 'number-line-fill': {
        correct = Number(chosen) === exercise.correctAnswer;
        feedback = correct
          ? 'អស្ចារ្យណាស់! ៤ + ១ = ៥! 🌟'
          : 'មិនទាន់ត្រូវទេ! រាប់ជំហានលោតម្តងទៀតណា៎! 😊';
        break;
      }
      case 'shape-match': {
        const shape = exercise.shapes.find(s => s.id === chosen);
        correct = !!shape?.isCorrect;
        feedback = correct
          ? 'ត្រឹមត្រូវហើយ! នេះជារូបត្រីកោណ! 📐'
          : 'មិនទាន់ត្រូវទេ! សាកល្បងជ្រើសរើសរូបផ្សេងទៀតណា៎! 😊';
        break;
      }
      case 'base-ten-blocks':
      case 'place-value-blocks': {
        correct = Number(chosen) === exercise.targetValue;
        feedback = correct
          ? 'ឆ្លើយត្រូវហើយ! ២ រយ + ៣ ដប់ + ៥ រាយ = ២៣៥! 🧱'
          : 'មិនទាន់ត្រូវទេ! រាប់ចំនួនរយ ដប់ និងរាយម្តងទៀតណា៎! 😊';
        break;
      }
      case 'riel-calculator': {
        correct = Number(chosen) === exercise.changeRequired;
        feedback = correct
          ? 'ឆ្លើយត្រូវហើយ! ១០០០៛ - ៨០០៛ = ២០០៛ (អាប់ ២០០៛)! 💵'
          : 'មិនទាន់ត្រូវទេ! គិតប្រាក់អាប់ម្តងទៀតណា៎! 😊';
        break;
      }
      case 'mcq': {
        const opt = exercise.options.find(o => o.id === chosen);
        correct = !!opt?.isCorrect;
        feedback = correct ? 'ឆ្លើយត្រូវហើយ! 🎉' : 'មិនទាន់ត្រូវទេ! សាកល្បងម្តងទៀតណា៎! 😊';
        break;
      }
      default: {
        correct = true;
        feedback = 'ល្អណាស់! អ្នកបានបញ្ចប់សកម្មភាពនេះ!';
      }
    }

    setSubmitted(true);
    setIsCorrect(correct);
    setFeedbackMsg(feedback);

    if (correct) {
      sound.playSuccessChime();
      sound.playStar();
      onComplete(exercise.id, true, 50, 3);
    } else {
      sound.playGentleError();
      onComplete(exercise.id, false, 10, 1);
    }
  };

  const handleReset = () => {
    sound.playPop();
    setSelectedAnswerId(null);
    setSubmitted(false);
    setIsCorrect(false);
    setFeedbackMsg('');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-fade-in overflow-y-auto"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="mini-game-modal-title"
        className="bg-white rounded-3xl p-5 sm:p-8 max-w-2xl w-full border-4 border-amber-300 shadow-2xl relative animate-scale-up my-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Top Header: Close Button + Lesson Badge */}
        <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-amber-100">
          <div className="flex items-center gap-2">
            <span className="bg-amber-100 text-amber-950 font-black text-xs px-3 py-1 rounded-full border border-amber-300 font-khmer">
              {exercise.lessonKh}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-11 h-11 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
            aria-label="បិទផ្ទាំងហ្គេម"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Question Stem with Audio Readout */}
        <div className="flex items-start gap-3 bg-amber-50/70 p-4 rounded-2xl border-2 border-amber-200 mb-6">
          <SpeakerButton
            text={exercise.audioPromptKh || exercise.questionKh}
            size="md"
            title="ចុចដើម្បីស្តាប់សំណួរ"
          />
          <div>
            <h2
              id="mini-game-modal-title"
              className="font-heading font-black text-slate-900 text-lg sm:text-2xl leading-snug font-khmer"
            >
              {exercise.questionKh}
            </h2>
            {exercise.questionEn && (
              <p className="text-xs sm:text-sm text-slate-500 font-semibold mt-0.5">
                {exercise.questionEn}
              </p>
            )}
          </div>
        </div>

        {/* ================================================================= */}
        {/* DYNAMIC INTERACTIVE GAME MECHANICS ENGINES                        */}
        {/* ================================================================= */}

        {/* 1. COMPARE-SELECT: Durian vs Apple vs Coconut */}
        {exercise.type === 'compare-select' && (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-3 sm:gap-4 max-w-lg mx-auto py-2">
              {exercise.items.map(item => {
                const isSelected = selectedAnswerId === item.id;
                const scaleClass =
                  item.sizeScale && item.sizeScale > 1.2
                    ? 'text-6xl sm:text-7xl'
                    : item.sizeScale && item.sizeScale < 0.9
                    ? 'text-4xl sm:text-5xl'
                    : 'text-5xl sm:text-6xl';

                return (
                  <button
                    key={item.id}
                    type="button"
                    disabled={submitted}
                    onClick={() => {
                      sound.playPop();
                      setSelectedAnswerId(item.id);
                    }}
                    className={`min-h-[140px] sm:min-h-[160px] p-4 rounded-3xl border-3 flex flex-col items-center justify-between transition-all btn-squishy cursor-pointer select-none ${
                      isSelected
                        ? 'bg-blue-50 border-blue-600 shadow-[0_6px_0_#2563EB] -translate-y-1 scale-105'
                        : 'bg-amber-50/60 hover:bg-amber-100/80 border-amber-200 shadow-xs'
                    }`}
                  >
                    <span className={`${scaleClass} transition-transform`}>
                      {item.icon}
                    </span>
                    <span className="font-heading font-black text-xs sm:text-sm text-slate-800 text-center mt-2 font-khmer">
                      {item.textKh}
                    </span>
                    {isSelected && (
                      <span className="text-[10px] font-black bg-blue-600 text-white px-2 py-0.5 rounded-full mt-1">
                        បានរើស
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 2. POSITION-PICK: Spatial Awareness (Left / Center / Right) */}
        {exercise.type === 'position-pick' && (
          <div className="space-y-6">
            <div className="text-center font-khmer text-sm font-bold text-amber-900 bg-amber-100/60 p-2.5 rounded-xl border border-amber-200">
              គោលដៅ: រកមើលសត្វដែលនៅ «{exercise.targetPositionLabelKh}»
            </div>

            <div className="grid grid-cols-3 gap-3 sm:gap-4 max-w-lg mx-auto py-2">
              {exercise.items.map(item => {
                const isSelected = selectedAnswerId === item.id;
                const posLabel =
                  item.position === 'left'
                    ? 'ខាងឆ្វេង (Left)'
                    : item.position === 'center'
                    ? 'កណ្តាល (Center)'
                    : 'ខាងស្តាំ (Right)';

                return (
                  <button
                    key={item.id}
                    type="button"
                    disabled={submitted}
                    onClick={() => {
                      sound.playPop();
                      setSelectedAnswerId(item.id);
                    }}
                    className={`min-h-[130px] sm:min-h-[150px] p-4 rounded-3xl border-3 flex flex-col items-center justify-between transition-all btn-squishy cursor-pointer select-none ${
                      isSelected
                        ? 'bg-emerald-50 border-emerald-600 shadow-[0_6px_0_#059669] -translate-y-1 scale-105'
                        : 'bg-white hover:bg-amber-50 border-amber-200 shadow-xs'
                    }`}
                  >
                    <span className="text-5xl sm:text-6xl">{item.icon}</span>
                    <div className="text-center mt-2">
                      <span className="font-heading font-black text-xs text-slate-800 block font-khmer">
                        {item.textKh}
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold block">
                        {posLabel}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 3. NUMBER-LINE: Jump 4 + 1 = 5 */}
        {(exercise.type === 'number-line' || exercise.type === 'number-line-fill') && (
          <div className="space-y-6">
            {/* Interactive SVG Number Line */}
            <div className="bg-amber-50/80 p-4 rounded-3xl border-3 border-amber-300 shadow-inner overflow-x-auto">
              <svg viewBox="0 0 600 150" className="w-full min-w-[500px] h-auto select-none">
                {/* Main Axis Line */}
                <line x1="30" y1="100" x2="570" y2="100" stroke="#78350F" strokeWidth="4" strokeLinecap="round" />
                {/* Arrow heads */}
                <polygon points="20,100 35,94 35,106" fill="#78350F" />
                <polygon points="580,100 565,94 565,106" fill="#78350F" />

                {/* Number Line Jump Arcs (0 -> 4) and (4 -> 5) */}
                <path d="M 50 95 Q 155 20 260 95" fill="none" stroke="#2563EB" strokeWidth="3.5" strokeDasharray="4 2" />
                <text x="155" y="45" fill="#1D4ED8" fontSize="16" fontWeight="bold" textAnchor="middle">+៤</text>

                <path d="M 260 95 Q 285 55 312 95" fill="none" stroke="#10B981" strokeWidth="3.5" />
                <text x="286" y="65" fill="#047857" fontSize="15" fontWeight="bold" textAnchor="middle">+១</text>

                {/* Ticks 0 to 10 */}
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(val => {
                  const x = 50 + val * 52;
                  const isAnswer = val === 5;
                  return (
                    <g key={val}>
                      <line x1={x} y1="90" x2={x} y2="110" stroke="#78350F" strokeWidth="3" strokeLinecap="round" />
                      <circle cx={x} cy="100" r="5" fill={isAnswer && submitted ? '#10B981' : '#F59E0B'} />
                      <text x={x} y="132" fill="#451A03" fontSize="15" fontWeight="bold" textAnchor="middle">
                        {['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩', '១០'][val]}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Answer Options Pills */}
            <div className="grid grid-cols-4 gap-3 max-w-md mx-auto">
              {(exercise.options || [3, 4, 5, 6]).map((opt: number) => {
                const isSelected = selectedAnswerId === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    disabled={submitted}
                    onClick={() => {
                      sound.playPop();
                      setSelectedAnswerId(opt);
                    }}
                    className={`min-h-[56px] rounded-2xl border-3 font-heading font-black text-2xl transition-all btn-squishy cursor-pointer select-none ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-700 shadow-[0_5px_0_#1D4ED8] -translate-y-1'
                        : 'bg-white hover:bg-amber-50 text-slate-800 border-amber-200 shadow-xs'
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 4. SHAPE-MATCH: Square, Triangle, Circle, Rectangle */}
        {exercise.type === 'shape-match' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-xl mx-auto py-2">
              {exercise.shapes.map(s => {
                const isSelected = selectedAnswerId === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    disabled={submitted}
                    onClick={() => {
                      sound.playPop();
                      setSelectedAnswerId(s.id);
                    }}
                    className={`min-h-[120px] sm:min-h-[140px] p-3.5 rounded-3xl border-3 flex flex-col items-center justify-between transition-all btn-squishy cursor-pointer select-none ${
                      isSelected
                        ? 'bg-blue-50 border-blue-600 shadow-[0_6px_0_#2563EB] -translate-y-1 scale-105'
                        : 'bg-white hover:bg-amber-50 border-amber-200 shadow-xs'
                    }`}
                  >
                    {/* SVG Figures */}
                    <div className="w-16 h-16 flex items-center justify-center">
                      {s.shapeType === 'square' && (
                        <div className="w-12 h-12 bg-emerald-500 rounded-lg border-2 border-emerald-700" />
                      )}
                      {s.shapeType === 'triangle' && (
                        <svg viewBox="0 0 50 50" className="w-14 h-14">
                          <polygon points="25,5 47,45 3,45" fill="#3B82F6" stroke="#1D4ED8" strokeWidth="3" />
                        </svg>
                      )}
                      {s.shapeType === 'circle' && (
                        <div className="w-12 h-12 bg-amber-500 rounded-full border-2 border-amber-700" />
                      )}
                      {s.shapeType === 'rectangle' && (
                        <div className="w-14 h-9 bg-pink-500 rounded-lg border-2 border-pink-700" />
                      )}
                    </div>
                    <span className="font-heading font-black text-xs sm:text-sm text-slate-800 font-khmer">
                      {s.nameKh}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 5. BASE-TEN-BLOCKS: Place Value (Hundreds, Tens, Ones) */}
        {(exercise.type === 'base-ten-blocks' || exercise.type === 'place-value-blocks') && (
          <div className="space-y-6">
            {/* Visual Manipulatives Container */}
            <div className="grid grid-cols-3 gap-3 bg-amber-50/70 p-4 rounded-3xl border-3 border-amber-300">
              {/* Hundreds Flats */}
              <div className="bg-white/90 p-3 rounded-2xl border-2 border-emerald-300 flex flex-col items-center">
                <span className="text-xs font-black font-khmer text-emerald-950 mb-2">
                  ខ្ទង់រយ: {exercise.hundreds} ({exercise.hundreds * 100})
                </span>
                <div className="flex flex-wrap gap-1.5 justify-center min-h-[60px]">
                  {Array.from({ length: exercise.hundreds }).map((_, idx) => (
                    <div
                      key={idx}
                      className="w-12 h-12 bg-emerald-400 rounded-lg border-2 border-emerald-700 grid grid-cols-5 grid-rows-5 gap-0.5 p-0.5"
                    >
                      {Array.from({ length: 25 }).map((__, i) => (
                        <div key={i} className="bg-emerald-200/60 rounded-[1px]" />
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              {/* Tens Rods */}
              <div className="bg-white/90 p-3 rounded-2xl border-2 border-amber-300 flex flex-col items-center">
                <span className="text-xs font-black font-khmer text-amber-950 mb-2">
                  ខ្ទង់ដប់: {exercise.tens} ({exercise.tens * 10})
                </span>
                <div className="flex flex-wrap gap-1.5 justify-center min-h-[60px]">
                  {Array.from({ length: exercise.tens }).map((_, idx) => (
                    <div
                      key={idx}
                      className="w-4 h-12 bg-amber-400 rounded-md border-2 border-amber-700 flex flex-col justify-between p-0.5"
                    >
                      {Array.from({ length: 4 }).map((__, i) => (
                        <div key={i} className="h-1 bg-amber-200/80 rounded-[1px]" />
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              {/* Ones Cubes */}
              <div className="bg-white/90 p-3 rounded-2xl border-2 border-sky-300 flex flex-col items-center">
                <span className="text-xs font-black font-khmer text-sky-950 mb-2">
                  ខ្ទង់រាយ: {exercise.ones} ({exercise.ones})
                </span>
                <div className="flex flex-wrap gap-1.5 justify-center min-h-[60px]">
                  {Array.from({ length: exercise.ones }).map((_, idx) => (
                    <div
                      key={idx}
                      className="w-4 h-4 bg-sky-400 rounded-sm border-2 border-sky-700"
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Multiple Choice Options */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-md mx-auto">
              {(exercise.options || [235, 253, 325, 532]).map((val: number) => {
                const isSelected = selectedAnswerId === val;
                return (
                  <button
                    key={val}
                    type="button"
                    disabled={submitted}
                    onClick={() => {
                      sound.playPop();
                      setSelectedAnswerId(val);
                    }}
                    className={`min-h-[56px] rounded-2xl border-3 font-heading font-black text-xl transition-all btn-squishy cursor-pointer select-none ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-700 shadow-[0_5px_0_#1D4ED8] -translate-y-1'
                        : 'bg-white hover:bg-amber-50 text-slate-800 border-amber-200 shadow-xs'
                    }`}
                  >
                    {val}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 6. RIEL-CALCULATOR: Cambodian Currency & Change Calculation */}
        {exercise.type === 'riel-calculator' && (
          <div className="space-y-6">
            <div className="bg-emerald-50/80 p-4 rounded-3xl border-3 border-emerald-300 flex items-center justify-between gap-3">
              <div className="space-y-1">
                <span className="text-xs font-bold text-emerald-800 font-khmer block">
                  ស្ថានភាពលក់ដូរ (Transaction):
                </span>
                <p className="font-heading font-black text-slate-900 text-sm sm:text-base font-khmer">
                  {exercise.promptScenarioKh}
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 border-2 border-emerald-400 flex items-center justify-center text-2xl shrink-0">
                💵
              </div>
            </div>

            {/* Change Options Selection */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-lg mx-auto">
              {exercise.options.map(noteVal => {
                const isSelected = selectedAnswerId === noteVal;
                return (
                  <button
                    key={noteVal}
                    type="button"
                    disabled={submitted}
                    onClick={() => {
                      sound.playPop();
                      setSelectedAnswerId(noteVal);
                    }}
                    className={`min-h-[64px] p-3 rounded-2xl border-3 flex flex-col items-center justify-center transition-all btn-squishy cursor-pointer select-none ${
                      isSelected
                        ? 'bg-emerald-600 text-white border-emerald-700 shadow-[0_5px_0_#047857] -translate-y-1'
                        : 'bg-white hover:bg-emerald-50 text-slate-900 border-emerald-200 shadow-xs'
                    }`}
                  >
                    <span className="font-heading font-black text-lg sm:text-xl">
                      {noteVal} ៛
                    </span>
                    <span className="text-[10px] font-bold opacity-80 font-khmer">
                      {noteVal === 200 ? 'ពីររយរៀល' : noteVal === 100 ? 'មួយរយរៀល' : `${noteVal} រៀល`}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Fallback MCQ Exercise */}
        {exercise.type === 'mcq' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-w-lg mx-auto py-2">
            {exercise.options.map(opt => {
              const isSelected = selectedAnswerId === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  disabled={submitted}
                  onClick={() => {
                    sound.playPop();
                    setSelectedAnswerId(opt.id);
                  }}
                  className={`min-h-[60px] p-4 rounded-2xl border-3 flex items-center gap-3 transition-all btn-squishy cursor-pointer select-none ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-700 shadow-[0_5px_0_#1D4ED8] -translate-y-1'
                      : 'bg-white hover:bg-amber-50 text-slate-900 border-amber-200 shadow-xs'
                  }`}
                >
                  {opt.icon && <span className="text-2xl">{opt.icon}</span>}
                  <span className="font-heading font-black text-sm sm:text-base font-khmer text-left">
                    {opt.textKh}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* ================================================================= */}
        {/* FEEDBACK TOAST & SUBMIT BUTTON                                    */}
        {/* ================================================================= */}
        {submitted ? (
          <div className="mt-6 space-y-4 animate-fade-in">
            <div
              className={`p-4 rounded-2xl border-3 flex items-center gap-3 ${
                isCorrect
                  ? 'bg-emerald-50 border-emerald-400 text-emerald-950'
                  : 'bg-rose-50 border-rose-300 text-rose-950'
              }`}
            >
              {isCorrect ? (
                <CheckCircle2 className="w-8 h-8 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-8 h-8 text-rose-500 shrink-0" />
              )}
              <div className="flex-1">
                <p className="font-heading font-black text-base font-khmer">
                  {feedbackMsg}
                </p>
                {isCorrect && (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-black text-amber-600 font-mono">
                      +50 ពិន្ទុ
                    </span>
                    <div className="flex">
                      {[1, 2, 3].map(s => (
                        <Star key={s} className="w-4 h-4 text-amber-400 fill-amber-400" />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 justify-center">
              {!isCorrect && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-6 py-3 bg-amber-100 hover:bg-amber-200 text-amber-900 font-black rounded-2xl flex items-center gap-2 transition-all btn-squishy cursor-pointer font-khmer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>សាកល្បងម្តងទៀត</span>
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-heading font-black rounded-2xl shadow-[0_5px_0_#059669] flex items-center gap-2 transition-all btn-squishy cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span className="font-khmer">រួចរាល់ (Finish)</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-8 text-center">
            <button
              type="button"
              disabled={selectedAnswerId === null}
              onClick={() => handleVerify()}
              className={`min-h-[52px] px-10 py-3 rounded-2xl font-heading font-black text-lg transition-all btn-squishy select-none ${
                selectedAnswerId !== null
                  ? 'bg-emerald-500 hover:bg-emerald-600 active:translate-y-1 text-white shadow-[0_6px_0_#059669] active:shadow-[0_2px_0_#059669] cursor-pointer'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
              }`}
            >
              <span className="font-khmer">ពិនិត្យចម្លើយ (Check Answer)</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
