// src/components/engines/SyntaxRailEngine.tsx
// Universal Engine 4: Khmer Orthography & Syntax Rail Engine
// Grapheme cluster slot rail respecting Khmer Unicode (Consonant + Subscript + Vowel + Final)
// Prevents diacritic clipping via font-kantumruy leading-relaxed overflow-visible
'use client';

import React, { useState, useEffect } from 'react';
import { GameLevel, SyntaxData, SyntaxMode, SvoCard } from '@/types/game';
import { soundSynthesizer } from '@/lib/audio/SoundSynthesizer';
import { speechService } from '@/lib/audio/speechHook';
import { SpeakButton } from '@/components/audio/SpeakButton';
import {
  Sparkles,
  CheckCircle2,
  Train,
  RotateCcw,
  Search,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SyntaxRailEngineProps {
  level: GameLevel;
  onLevelComplete: (scoreGain: number) => void;
  onRestartLevel?: () => void;
}

export const SyntaxRailEngine: React.FC<SyntaxRailEngineProps> = ({
  level,
  onLevelComplete,
  onRestartLevel,
}) => {
  const syntaxData: SyntaxData =
    level.gameplayData?.syntaxData ||
    level.gameplayData?.syntax_data ||
    level.gameplayData?.khmerPhoneticsData ||
    (level.gameplay_data as unknown as { syntaxData?: SyntaxData; syntax_data?: SyntaxData; khmerPhoneticsData?: SyntaxData })?.syntaxData ||
    (level.gameplay_data as unknown as { syntax_data?: SyntaxData })?.syntax_data ||
    (level.gameplay_data as unknown as { khmerPhoneticsData?: SyntaxData })?.khmerPhoneticsData || {
      mode: 'syllable_constructor' as SyntaxMode,
    };

  const mode = syntaxData.mode || 'syllable_constructor';

  // -------------------------------------------------------------------------
  // 1. SYLLABLE CONSTRUCTOR STATE
  // -------------------------------------------------------------------------
  const syllableTarget = syntaxData.syllableTarget || {
    baseConsonant: 'ក',
    subscript: '្ង',
    vowel: 'ា',
    finalConsonant: '',
    targetWordKhmer: 'ក្ងា',
    targetMeaning: 'ក្ងា (សត្វក្ងាន)',
    targetImage: '🦢',
  };

  const [selectedBase, setSelectedBase] = useState<string | null>(null);
  const [selectedSubscript, setSelectedSubscript] = useState<string | null>(null);
  const [selectedVowel, setSelectedVowel] = useState<string | null>(null);
  const [selectedFinal, setSelectedFinal] = useState<string | null>(null);

  const baseConsonants = syntaxData.baseConsonants || ['ក', 'ខ', 'ច', 'ឆ', 'ត', 'ប'];
  const subscripts = syntaxData.subscripts || ['្ង', '្ម', '្យ', '្រ', '្ល', '្វ'];
  const vowels = syntaxData.vowels || ['ា', 'ិ', 'ី', 'ឹ', 'ឺ', 'ុ'];
  const finalConsonants = syntaxData.finalConsonants || ['ក', 'ង', 'ច', 'ញ', 'ដ', 'ត', 'ណ', 'ន'];

  const combinedWord = `${selectedBase || ''}${selectedSubscript || ''}${selectedVowel || ''}${selectedFinal || ''}`;
  const targetWord = syntaxData.targetWordKhmer || syntaxData.target_word_khmer || syllableTarget.targetWordKhmer;
  const isSyllableMatched = combinedWord === targetWord;

  const handleSelectPart = (type: 'base' | 'subscript' | 'vowel' | 'final', char: string) => {
    soundSynthesizer.playClick();
    speechService.speak(char);
    if (type === 'base') setSelectedBase(char);
    if (type === 'subscript') setSelectedSubscript(char);
    if (type === 'vowel') setSelectedVowel(char);
    if (type === 'final') setSelectedFinal(char);
  };

  useEffect(() => {
    if (mode === 'syllable_constructor' && isSyllableMatched && combinedWord) {
      soundSynthesizer.playSuccess();
      soundSynthesizer.playFanfare();
      speechService.speak(targetWord);
      const t = setTimeout(() => {
        onLevelComplete(120);
      }, 1600);
      return () => clearTimeout(t);
    }
  }, [mode, isSyllableMatched, combinedWord, targetWord, onLevelComplete]);

  // -------------------------------------------------------------------------
  // 2. SVO SYNTAX RAIL STATE (Subject = Blue, Verb = Green, Object = Orange)
  // -------------------------------------------------------------------------
  const rawSvoCards: SvoCard[] = syntaxData.availableSvoCards || syntaxData.available_svo_cards || [
    { id: 'svo-1', textKhmer: 'កូនសិស្ស', role: 'subject', image: '👧' },
    { id: 'svo-2', textKhmer: 'អាន', role: 'verb', image: '📖' },
    { id: 'svo-3', textKhmer: 'សៀវភៅ', role: 'object', image: '📚' },
  ];

  const [placedSubject, setPlacedSubject] = useState<SvoCard | null>(null);
  const [placedVerb, setPlacedVerb] = useState<SvoCard | null>(null);
  const [placedObject, setPlacedObject] = useState<SvoCard | null>(null);
  const [availableSvo, setAvailableSvo] = useState<SvoCard[]>(rawSvoCards);
  const [selectedSvoCardId, setSelectedSvoCardId] = useState<string | null>(rawSvoCards[0]?.id || null);

  const handleSelectSvoCard = (card: SvoCard) => {
    soundSynthesizer.playPop();
    setSelectedSvoCardId(card.id);
    speechService.speak(card.textKhmer || card.text_khmer || '');
  };

  const handlePlaceCardIntoSlot = (role: 'subject' | 'verb' | 'object') => {
    if (!selectedSvoCardId) return;
    const card = availableSvo.find((c) => c.id === selectedSvoCardId);
    if (!card) return;

    if (card.role === role) {
      soundSynthesizer.playCoin();
      if (role === 'subject') setPlacedSubject(card);
      if (role === 'verb') setPlacedVerb(card);
      if (role === 'object') setPlacedObject(card);

      const next = availableSvo.filter((c) => c.id !== card.id);
      setAvailableSvo(next);
      setSelectedSvoCardId(next[0]?.id || null);
    } else {
      soundSynthesizer.playError();
    }
  };

  const handleRemovePlacedSvo = (role: 'subject' | 'verb' | 'object') => {
    soundSynthesizer.playPop();
    let removed: SvoCard | null = null;
    if (role === 'subject' && placedSubject) {
      removed = placedSubject;
      setPlacedSubject(null);
    } else if (role === 'verb' && placedVerb) {
      removed = placedVerb;
      setPlacedVerb(null);
    } else if (role === 'object' && placedObject) {
      removed = placedObject;
      setPlacedObject(null);
    }
    if (removed) {
      setAvailableSvo((prev) => [...prev, removed!]);
      setSelectedSvoCardId(removed.id);
    }
  };

  const isSvoComplete = placedSubject !== null && placedVerb !== null && placedObject !== null;

  useEffect(() => {
    if (mode === 'svo_rail' && isSvoComplete) {
      soundSynthesizer.playSuccess();
      soundSynthesizer.playFanfare();
      const sentence = `${placedSubject?.textKhmer} ${placedVerb?.textKhmer} ${placedObject?.textKhmer}`;
      speechService.speak(sentence);
      const t = setTimeout(() => {
        onLevelComplete(120);
      }, 1600);
      return () => clearTimeout(t);
    }
  }, [mode, isSvoComplete, placedSubject, placedVerb, placedObject, onLevelComplete]);

  // -------------------------------------------------------------------------
  // 3. SILENT MARK INSPECTOR (Applying ៍ exclusively to silent consonants)
  // -------------------------------------------------------------------------
  const silentWords = syntaxData.wordsWithSilentConsonant || syntaxData.words_with_silent_consonant || [
    {
      id: 'sw-1',
      wordKhmer: 'ទូរទស្សន៍',
      letters: ['ទូ', 'រ', 'ទ', 'ស្ស', 'ន'],
      silentIndex: 4,
      meaningKhmer: 'ទូរទស្សន៍ (Television)',
    },
  ];
  const [currentSilentWordIdx, setCurrentSilentWordIdx] = useState<number>(0);
  const activeSilentWord = silentWords[currentSilentWordIdx] || silentWords[0];
  const [appliedIndex, setAppliedIndex] = useState<number | null>(null);

  const handleApplySilentMark = (idx: number) => {
    if (!activeSilentWord) return;

    if (idx === activeSilentWord.silentIndex) {
      soundSynthesizer.playSuccess();
      setAppliedIndex(idx);
      speechService.speak(activeSilentWord.wordKhmer);
      const t = setTimeout(() => {
        if (currentSilentWordIdx < silentWords.length - 1) {
          setCurrentSilentWordIdx((prev) => prev + 1);
          setAppliedIndex(null);
        } else {
          soundSynthesizer.playFanfare();
          onLevelComplete(120);
        }
      }, 1500);
      return () => clearTimeout(t);
    } else {
      soundSynthesizer.playError();
    }
  };

  // Reset
  const handleReset = () => {
    soundSynthesizer.playClick();
    setSelectedBase(null);
    setSelectedSubscript(null);
    setSelectedVowel(null);
    setSelectedFinal(null);
    setPlacedSubject(null);
    setPlacedVerb(null);
    setPlacedObject(null);
    setAvailableSvo(rawSvoCards);
    setSelectedSvoCardId(rawSvoCards[0]?.id || null);
    setAppliedIndex(null);
    if (onRestartLevel) onRestartLevel();
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 p-4 sm:p-6 select-none font-kantumruy">
      {/* Header Prompt */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-md border-2 border-sky-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 text-sky-600 text-xs sm:text-sm font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>ផ្លូវរថភ្លើងអក្ខរក្រមខ្មែរ • Syntax Rail Engine</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 leading-relaxed font-kantumruy overflow-visible">
            {level.promptText || 'សូមផ្គុំព្យញ្ជនៈ និងស្រៈតាមក្បួនអក្ខរាវិរុទ្ធខ្មែរ៖'}
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

      {/* MODE 1: SYLLABLE CONSTRUCTOR */}
      {mode === 'syllable_constructor' && (
        <div className="bg-white rounded-3xl p-6 shadow-lg border-2 border-slate-100 flex flex-col gap-6">
          {/* Target Word Showcase Card */}
          <div className="bg-gradient-to-r from-sky-500 to-indigo-600 rounded-3xl p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
            <div className="flex items-center gap-4">
              <span className="text-5xl filter drop-shadow-sm">{syllableTarget.targetImage}</span>
              <div>
                <p className="text-xs text-sky-100 uppercase tracking-wide">ពាក្យគោលដៅ (Target Word)</p>
                <p className="text-3xl sm:text-4xl font-black font-kantumruy leading-relaxed overflow-visible">
                  {targetWord}
                </p>
                <p className="text-xs text-sky-200 font-kantumruy">{syllableTarget.targetMeaning}</p>
              </div>
            </div>
            <SpeakButton text={targetWord} size="lg" variant="secondary" />
          </div>

          {/* Assembly Slot Rail (Consonant + Foot Subscript + Dependent Vowel + Final) */}
          <div className="bg-sky-50/70 border-2 border-sky-200 rounded-3xl p-6 flex flex-col items-center gap-4">
            <p className="text-xs font-bold text-sky-800 uppercase tracking-wider">
              កន្លែងផ្គុំតួអក្សរ (Grapheme Assembly Rail)
            </p>

            <div className="flex items-center gap-3">
              {/* Slot 1: Base Consonant */}
              <div className="flex flex-col items-center gap-1">
                <span className="text-[11px] font-bold text-slate-500 font-kantumruy">ព្យញ្ជនៈដើម</span>
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white border-2 border-sky-400 rounded-2xl shadow-sm flex items-center justify-center text-3xl sm:text-4xl font-bold text-sky-900 font-kantumruy overflow-visible">
                  {selectedBase || '＿'}
                </div>
              </div>

              {/* Slot 2: Foot Subscript (ជើងអក្សរ) */}
              <div className="flex flex-col items-center gap-1">
                <span className="text-[11px] font-bold text-slate-500 font-kantumruy">ជើងអក្សរ</span>
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white border-2 border-indigo-400 rounded-2xl shadow-sm flex items-center justify-center text-3xl sm:text-4xl font-bold text-indigo-900 font-kantumruy overflow-visible">
                  {selectedSubscript || '＿'}
                </div>
              </div>

              {/* Slot 3: Dependent Vowel (ស្រៈ) */}
              <div className="flex flex-col items-center gap-1">
                <span className="text-[11px] font-bold text-slate-500 font-kantumruy">ស្រៈ</span>
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white border-2 border-amber-400 rounded-2xl shadow-sm flex items-center justify-center text-3xl sm:text-4xl font-bold text-amber-900 font-kantumruy overflow-visible">
                  {selectedVowel || '＿'}
                </div>
              </div>

              {/* Slot 4: Final Consonant */}
              {syllableTarget.finalConsonant !== undefined && (
                <div className="flex flex-col items-center gap-1">
                  <span className="text-[11px] font-bold text-slate-500 font-kantumruy">ព្យញ្ជនៈចុង</span>
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white border-2 border-emerald-400 rounded-2xl shadow-sm flex items-center justify-center text-3xl sm:text-4xl font-bold text-emerald-900 font-kantumruy overflow-visible">
                    {selectedFinal || '＿'}
                  </div>
                </div>
              )}
            </div>

            {/* Live Combined Grapheme Cluster Preview */}
            <div className="mt-2 bg-white px-6 py-2 rounded-2xl border border-sky-200 shadow-xs flex items-center gap-3">
              <span className="text-xs text-slate-400 font-bold">លទ្ធផល៖</span>
              <span className="text-2xl font-black text-sky-900 font-kantumruy overflow-visible leading-relaxed">
                {combinedWord || '...'}
              </span>
            </div>
          </div>

          {/* Grapheme Selection Trays */}
          <div className="flex flex-col gap-4">
            {/* Base Consonants */}
            <div>
              <p className="text-xs font-bold text-slate-600 mb-2 font-kantumruy">
                ១. ជ្រើសរើសព្យញ្ជនៈដើម (Base Consonant):
              </p>
              <div className="flex flex-wrap gap-2">
                {baseConsonants.map((c) => (
                  <button
                    key={c}
                    onClick={() => handleSelectPart('base', c)}
                    className={`px-4 py-2.5 rounded-2xl text-xl font-bold border-2 transition font-kantumruy overflow-visible ${
                      selectedBase === c
                        ? 'bg-sky-500 text-white border-sky-600 shadow-md scale-105'
                        : 'bg-slate-50 text-slate-800 border-slate-200 hover:border-sky-300'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Subscripts */}
            <div>
              <p className="text-xs font-bold text-slate-600 mb-2 font-kantumruy">
                ២. ជ្រើសរើសជើងអក្សរ (Subscript Foot):
              </p>
              <div className="flex flex-wrap gap-2">
                {subscripts.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSelectPart('subscript', s)}
                    className={`px-4 py-2.5 rounded-2xl text-xl font-bold border-2 transition font-kantumruy overflow-visible ${
                      selectedSubscript === s
                        ? 'bg-indigo-500 text-white border-indigo-600 shadow-md scale-105'
                        : 'bg-slate-50 text-slate-800 border-slate-200 hover:border-indigo-300'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Vowels */}
            <div>
              <p className="text-xs font-bold text-slate-600 mb-2 font-kantumruy">
                ៣. ជ្រើសរើសស្រៈ (Dependent Vowel):
              </p>
              <div className="flex flex-wrap gap-2">
                {vowels.map((v) => (
                  <button
                    key={v}
                    onClick={() => handleSelectPart('vowel', v)}
                    className={`px-4 py-2.5 rounded-2xl text-xl font-bold border-2 transition font-kantumruy overflow-visible ${
                      selectedVowel === v
                        ? 'bg-amber-500 text-white border-amber-600 shadow-md scale-105'
                        : 'bg-slate-50 text-slate-800 border-slate-200 hover:border-amber-300'
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODE 2: SVO SENTENCE RAIL (Subject = Blue, Verb = Green, Object = Orange) */}
      {mode === 'svo_rail' && (
        <div className="bg-white rounded-3xl p-6 shadow-lg border-2 border-slate-100 flex flex-col gap-6">
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
            <Train className="w-5 h-5" />
            <span>រៀបចំក្បួនរថភ្លើងល្បះ (Subject • Verb • Object)</span>
          </div>

          {/* Train Wagon Slots */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Subject (Blue) */}
            <div
              onClick={() => handlePlaceCardIntoSlot('subject')}
              className={`min-h-[120px] rounded-3xl border-3 p-4 flex flex-col items-center justify-center cursor-pointer transition ${
                placedSubject
                  ? 'bg-blue-50 border-blue-400 shadow-md'
                  : 'bg-slate-50 border-dashed border-blue-300 hover:bg-blue-50/50'
              }`}
            >
              <span className="text-xs font-bold text-blue-700 mb-2 font-kantumruy">
                ១. ប្រធាន (Subject - Blue)
              </span>
              {placedSubject ? (
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemovePlacedSvo('subject');
                  }}
                  className="bg-white px-4 py-2 rounded-2xl border border-blue-300 shadow-sm flex items-center gap-2"
                >
                  <span className="text-2xl">{placedSubject.image}</span>
                  <span className="text-lg font-bold text-blue-900 font-kantumruy">
                    {placedSubject.textKhmer}
                  </span>
                </div>
              ) : (
                <span className="text-xs text-slate-400 font-kantumruy">ចុចដាក់ប្រធានត្រង់នេះ</span>
              )}
            </div>

            {/* Verb (Green) */}
            <div
              onClick={() => handlePlaceCardIntoSlot('verb')}
              className={`min-h-[120px] rounded-3xl border-3 p-4 flex flex-col items-center justify-center cursor-pointer transition ${
                placedVerb
                  ? 'bg-emerald-50 border-emerald-400 shadow-md'
                  : 'bg-slate-50 border-dashed border-emerald-300 hover:bg-emerald-50/50'
              }`}
            >
              <span className="text-xs font-bold text-emerald-700 mb-2 font-kantumruy">
                ២. កិរិយា (Verb - Green)
              </span>
              {placedVerb ? (
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemovePlacedSvo('verb');
                  }}
                  className="bg-white px-4 py-2 rounded-2xl border border-emerald-300 shadow-sm flex items-center gap-2"
                >
                  <span className="text-2xl">{placedVerb.image}</span>
                  <span className="text-lg font-bold text-emerald-900 font-kantumruy">
                    {placedVerb.textKhmer}
                  </span>
                </div>
              ) : (
                <span className="text-xs text-slate-400 font-kantumruy">ចុចដាក់កិរិយាត្រង់នេះ</span>
              )}
            </div>

            {/* Object (Orange) */}
            <div
              onClick={() => handlePlaceCardIntoSlot('object')}
              className={`min-h-[120px] rounded-3xl border-3 p-4 flex flex-col items-center justify-center cursor-pointer transition ${
                placedObject
                  ? 'bg-amber-50 border-amber-400 shadow-md'
                  : 'bg-slate-50 border-dashed border-amber-300 hover:bg-amber-50/50'
              }`}
            >
              <span className="text-xs font-bold text-amber-700 mb-2 font-kantumruy">
                ៣. កម្មបទ (Object - Orange)
              </span>
              {placedObject ? (
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemovePlacedSvo('object');
                  }}
                  className="bg-white px-4 py-2 rounded-2xl border border-amber-300 shadow-sm flex items-center gap-2"
                >
                  <span className="text-2xl">{placedObject.image}</span>
                  <span className="text-lg font-bold text-amber-900 font-kantumruy">
                    {placedObject.textKhmer}
                  </span>
                </div>
              ) : (
                <span className="text-xs text-slate-400 font-kantumruy">ចុចដាក់កម្មបទត្រង់នេះ</span>
              )}
            </div>
          </div>

          {/* Card Selection Dock */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <p className="text-xs font-bold text-slate-600 mb-3 font-kantumruy">
              👇 ចុចជ្រើសរើសកាតខាងក្រោម រួចចុចលើទូរថភ្លើងដែលត្រូវគ្នា៖
            </p>
            <div className="flex flex-wrap gap-3">
              {availableSvo.map((card) => {
                const isSelected = card.id === selectedSvoCardId;
                return (
                  <motion.button
                    key={card.id}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleSelectSvoCard(card)}
                    className={`px-4 py-3 rounded-2xl border-2 font-bold shadow-xs flex items-center gap-2.5 transition ${
                      isSelected
                        ? 'ring-4 ring-indigo-500 scale-105 border-indigo-400 bg-white'
                        : 'bg-white border-slate-200 hover:border-indigo-300'
                    }`}
                  >
                    <span className="text-2xl">{card.image}</span>
                    <span className="text-lg font-kantumruy text-slate-800">{card.textKhmer}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* MODE 3: SILENT MARK INSPECTOR */}
      {mode === 'silent_marker' && activeSilentWord && (
        <div className="bg-white rounded-3xl p-6 shadow-lg border-2 border-slate-100 flex flex-col gap-6 items-center">
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
            <Search className="w-5 h-5" />
            <span>ស្វែងរក និងដាក់ទណ្ឌឃាត ( ៍ ) លើតួអក្សរដែលមិនបញ្ចេញសំឡេង៖</span>
          </div>

          <div className="flex items-center gap-3 py-6">
            {activeSilentWord.letters.map((letter, idx) => {
              const hasMark = appliedIndex === idx;
              return (
                <motion.button
                  key={idx}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => handleApplySilentMark(idx)}
                  className={`relative w-16 h-20 rounded-2xl border-2 flex flex-col items-center justify-center font-kantumruy text-2xl font-bold shadow-sm transition overflow-visible ${
                    hasMark
                      ? 'bg-emerald-100 border-emerald-400 text-emerald-900 ring-4 ring-emerald-300'
                      : 'bg-slate-50 border-slate-200 hover:border-indigo-300 text-slate-800'
                  }`}
                >
                  <span className="leading-relaxed overflow-visible">
                    {letter}
                    {hasMark && '៍'}
                  </span>
                </motion.button>
              );
            })}
          </div>

          <p className="text-sm font-bold text-slate-500 font-kantumruy">
            {activeSilentWord.meaningKhmer}
          </p>
        </div>
      )}
    </div>
  );
};

export const KhmerPhoneticsEngine = SyntaxRailEngine;
export default SyntaxRailEngine;
