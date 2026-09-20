'use client';

import React, { useState, useEffect } from 'react';
import { GameLevel, KhmerPhoneticsData, KhmerPhoneticsMode } from '@/types/edtech';
import { SoundFX, sound } from '@/utils/sound';
import { SpeakerButton } from '@/components/common/SpeakerButton';
import {
  BookOpen,
  Sparkles,
  CheckCircle2,
  Volume2,
  Train,
  Drum,
  Search,
  RotateCcw,
} from 'lucide-react';

interface KhmerPhoneticsEngineProps {
  level: GameLevel;
  onLevelComplete: (scoreGain: number) => void;
}

export const KhmerPhoneticsEngine: React.FC<KhmerPhoneticsEngineProps> = ({
  level,
  onLevelComplete,
}) => {
  const phoneticsData = level.gameplayData.khmerPhoneticsData || {
    mode: 'syllable_constructor' as KhmerPhoneticsMode,
  };

  const mode = phoneticsData.mode;

  // -------------------------------------------------------------------------
  // 1. SYLLABLE CONSTRUCTOR STATE
  // -------------------------------------------------------------------------
  const syllableTarget = phoneticsData.syllableTarget || {
    baseConsonant: 'ក',
    subscript: '្ង',
    vowel: 'ា',
    targetWordKhmer: 'ក្ងា',
    targetMeaning: 'ក្ងា (សត្វក្ងាន)',
    targetImage: '🦢',
  };

  const [selectedBase, setSelectedBase] = useState<string | null>(null);
  const [selectedSubscript, setSelectedSubscript] = useState<string | null>(null);
  const [selectedVowel, setSelectedVowel] = useState<string | null>(null);

  const baseConsonants = phoneticsData.baseConsonants || ['ក', 'ខ', 'ច', 'ឆ', 'ត', 'ប'];
  const subscripts = phoneticsData.subscripts || ['្ង', '្ម', '្យ', '្រ', '្ល', '្វ'];
  const vowels = phoneticsData.vowels || ['ា', 'ិ', 'ី', 'ឹ', 'ឺ', 'ុ'];

  const combinedWord = `${selectedBase || ''}${selectedSubscript || ''}${selectedVowel || ''}`;
  const targetWord = syllableTarget.targetWordKhmer;
  const targetMeaning = syllableTarget.targetMeaning;
  const targetImage = syllableTarget.targetImage || '🦢';
  const isSyllableMatched = combinedWord === targetWord;

  const handleSelectPart = (type: 'base' | 'subscript' | 'vowel', char: string) => {
    SoundFX.playSnap();
    if (type === 'base') setSelectedBase(char);
    if (type === 'subscript') setSelectedSubscript(char);
    if (type === 'vowel') setSelectedVowel(char);
  };

  useEffect(() => {
    if (mode === 'syllable_constructor' && isSyllableMatched) {
      SoundFX.playSuccess();
      SoundFX.playStar();
      sound.speakKhmer(targetWord);
      const t = setTimeout(() => {
        onLevelComplete(120);
      }, 1600);
      return () => clearTimeout(t);
    }
  }, [mode, isSyllableMatched, targetWord, onLevelComplete]);

  // -------------------------------------------------------------------------
  // 2. SVO SYNTAX RAIL STATE (Touch-First Tap-to-Select -> Tap-to-Place)
  // -------------------------------------------------------------------------
  const defaultSvoCards = [
    { id: 'svo-1', textKhmer: 'កូនសិស្ស', role: 'subject' as const, image: '👧' },
    { id: 'svo-2', textKhmer: 'អាន', role: 'verb' as const, image: '📖' },
    { id: 'svo-3', textKhmer: 'សៀវភៅ', role: 'object' as const, image: '📚' },
  ];
  const [placedSubject, setPlacedSubject] = useState<typeof defaultSvoCards[0] | null>(null);
  const [placedVerb, setPlacedVerb] = useState<typeof defaultSvoCards[0] | null>(null);
  const [placedObject, setPlacedObject] = useState<typeof defaultSvoCards[0] | null>(null);
  const [availableSvo, setAvailableSvo] = useState(defaultSvoCards);
  const [selectedSvoCardId, setSelectedSvoCardId] = useState<string | null>(defaultSvoCards[0]?.id || null);

  const handleSelectSvoCard = (card: typeof defaultSvoCards[0]) => {
    SoundFX.playPop();
    setSelectedSvoCardId(card.id);
  };

  const handlePlaceCardIntoSlot = (wagonRole: 'subject' | 'verb' | 'object') => {
    if (!selectedSvoCardId) return;
    const card = availableSvo.find(c => c.id === selectedSvoCardId);
    if (!card) return;

    if (card.role === wagonRole) {
      SoundFX.playSnap();
      if (wagonRole === 'subject') setPlacedSubject(card);
      if (wagonRole === 'verb') setPlacedVerb(card);
      if (wagonRole === 'object') setPlacedObject(card);

      const nextRemaining = availableSvo.filter(c => c.id !== card.id);
      setAvailableSvo(nextRemaining);
      setSelectedSvoCardId(nextRemaining[0]?.id || null);
    } else {
      SoundFX.playGentleError();
    }
  };

  const handleRemovePlacedSvo = (wagonRole: 'subject' | 'verb' | 'object') => {
    SoundFX.playPop();
    let removedCard: typeof defaultSvoCards[0] | null = null;
    if (wagonRole === 'subject' && placedSubject) {
      removedCard = placedSubject;
      setPlacedSubject(null);
    } else if (wagonRole === 'verb' && placedVerb) {
      removedCard = placedVerb;
      setPlacedVerb(null);
    } else if (wagonRole === 'object' && placedObject) {
      removedCard = placedObject;
      setPlacedObject(null);
    }
    if (removedCard) {
      setAvailableSvo(prev => [...prev, removedCard!]);
      setSelectedSvoCardId(removedCard.id);
    }
  };

  const isSvoComplete = placedSubject !== null && placedVerb !== null && placedObject !== null;

  useEffect(() => {
    if (mode === 'svo_rail' && isSvoComplete) {
      SoundFX.playTrainWhistle();
      SoundFX.playSuccess();
      SoundFX.playStar();
      const sentence = `${placedSubject?.textKhmer} ${placedVerb?.textKhmer} ${placedObject?.textKhmer}`;
      sound.speakKhmer(sentence);
      const t = setTimeout(() => {
        onLevelComplete(120);
      }, 1800);
      return () => clearTimeout(t);
    }
  }, [mode, isSvoComplete, placedSubject, placedVerb, placedObject, onLevelComplete]);

  // -------------------------------------------------------------------------
  // 3. SERIES "O" VS "OR" CONVEYOR BELT STATE
  // -------------------------------------------------------------------------
  const conveyorList = [
    { id: 'c-1', consonant: 'ក', register: 'series_o' as const },
    { id: 'c-2', consonant: 'គ', register: 'series_or' as const },
    { id: 'c-3', consonant: 'ខ', register: 'series_o' as const },
    { id: 'c-4', consonant: 'ឃ', register: 'series_or' as const },
    { id: 'c-5', consonant: 'ច', register: 'series_o' as const },
    { id: 'c-6', consonant: 'ជ', register: 'series_or' as const },
  ];
  const [conveyorQueue, setConveyorQueue] = useState(conveyorList);
  const [sortedDrumCount, setSortedDrumCount] = useState({ o: 0, or: 0 });

  const currentConsonant = conveyorQueue[0];

  const handleSortRegister = (targetRegister: 'series_o' | 'series_or') => {
    if (!currentConsonant) return;

    if (currentConsonant.register === targetRegister) {
      SoundFX.playSnap();
      sound.speakKhmer(currentConsonant.consonant);
      if (targetRegister === 'series_o') {
        setSortedDrumCount(prev => ({ ...prev, o: prev.o + 1 }));
      } else {
        setSortedDrumCount(prev => ({ ...prev, or: prev.or + 1 }));
      }
      setConveyorQueue(prev => prev.slice(1));

      if (conveyorQueue.length === 1) {
        SoundFX.playSuccess();
        SoundFX.playStar();
        setTimeout(() => onLevelComplete(120), 1200);
      }
    } else {
      SoundFX.playGentleError();
    }
  };

  // -------------------------------------------------------------------------
  // 4. SILENT MARKER DETECTIVE (ទណ្ឌឃាត ៍)
  // -------------------------------------------------------------------------
  const targetLoanword = {
    word: 'សប្តាហ៍',
    parts: ['ស', 'ប្ដា', 'ហ'],
    silentLetter: 'ហ',
    meaning: 'សប្តាហ៍ (មួយសប្តាហ៍មាន ៧ ថ្ងៃ)',
  };
  const [appliedDiacriticIndex, setAppliedDiacriticIndex] = useState<number | null>(null);

  const handleApplyMarker = (index: number) => {
    SoundFX.playSnap();
    setAppliedDiacriticIndex(index);

    if (index === 2) {
      // Correct silent letter ហ៍
      SoundFX.playSuccess();
      SoundFX.playStar();
      sound.speakKhmer(targetLoanword.word);
      setTimeout(() => onLevelComplete(120), 1500);
    } else {
      SoundFX.playGentleError();
      setTimeout(() => setAppliedDiacriticIndex(null), 800);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-sky-50 rounded-3xl p-5 border-3 border-sky-200 shadow-sm flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <SpeakerButton text={level.promptText} size="md" />
          <div>
            <span className="text-xs font-black uppercase text-sky-700 tracking-wider">
              {mode === 'syllable_constructor' && 'រោងចក្រផ្គុំព្យាង្គ • Syllable Constructor'}
              {mode === 'svo_rail' && 'វេយ្យាករណ៍ល្បះ • SVO Syntax Rail'}
              {mode === 'phonetic_drum' && 'បែងចែកពួក អ និងពួក អ៊ • Consonant Series Separator'}
              {mode === 'silent_marker' && 'អ្នកស៊ើបអង្កេតទណ្ឌឃាត • Silent Marker Detective'}
            </span>
            <h3 className="text-lg sm:text-xl font-black font-khmer text-sky-950">
              {level.promptText}
            </h3>
          </div>
        </div>

        <div className="shrink-0 bg-white px-3.5 py-1.5 rounded-2xl border border-sky-200 text-xs font-black text-sky-800 shadow-xs">
          {mode === 'syllable_constructor' && `ពាក្យ៖ ${combinedWord || '...'}`}
          {mode === 'svo_rail' && (isSvoComplete ? '🚂 រថភ្លើងចេញដំណើរ!' : 'រៀបល្បះ SVO')}
          {mode === 'phonetic_drum' && `នៅសល់ ${conveyorQueue.length} តួ`}
          {mode === 'silent_marker' && 'ទណ្ឌឃាត ៍'}
        </div>
      </div>

      {/* ===================================================================== */}
      {/* MODE 1: SYLLABLE CONSTRUCTOR */}
      {/* ===================================================================== */}
      {mode === 'syllable_constructor' && (
        <div className="space-y-6">
          {/* Construction Bench Display */}
          <div className="bg-gradient-to-b from-sky-50 to-amber-50 rounded-3xl p-8 border-4 border-sky-300 shadow-md flex flex-col items-center justify-center space-y-4 text-center">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
              ពាក្យគោលដៅ៖ {targetMeaning}
            </span>

            {/* Target Illustration */}
            <div className="text-7xl animate-bounce">{targetImage}</div>

            {/* Snap Slot Tiles Display */}
            <div className="flex items-center gap-3">
              {/* Base slot */}
              <div className="w-20 h-24 rounded-2xl bg-white border-3 border-dashed border-sky-400 flex flex-col items-center justify-center font-khmer shadow-inner">
                <span className="text-3xl font-black text-sky-950">{selectedBase || '▢'}</span>
                <span className="text-[10px] text-slate-400">ព្យញ្ជនៈដើម</span>
              </div>

              <span className="text-2xl font-black text-slate-400">+</span>

              {/* Subscript slot */}
              <div className="w-20 h-24 rounded-2xl bg-white border-3 border-dashed border-amber-400 flex flex-col items-center justify-center font-khmer shadow-inner">
                <span className="text-3xl font-black text-amber-950">{selectedSubscript || '▢'}</span>
                <span className="text-[10px] text-slate-400">ជើងអក្សរ</span>
              </div>

              <span className="text-2xl font-black text-slate-400">+</span>

              {/* Vowel slot */}
              <div className="w-20 h-24 rounded-2xl bg-white border-3 border-dashed border-rose-400 flex flex-col items-center justify-center font-khmer shadow-inner">
                <span className="text-3xl font-black text-rose-950">{selectedVowel || '▢'}</span>
                <span className="text-[10px] text-slate-400">ស្រៈនិស្ស័យ</span>
              </div>
            </div>

            {/* Combined Result */}
            <div className="bg-white/90 px-6 py-2 rounded-2xl border border-sky-200 text-xl font-black text-sky-950 font-khmer flex items-center gap-3">
              <span>ពាក្យផ្គុំបាន៖</span>
              <span className="text-3xl text-emerald-600 underline">{combinedWord || '???'}</span>
            </div>
          </div>

          {/* Component Selection Trays */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Base Consonants */}
            <div className="bg-white p-4 rounded-3xl border-2 border-sky-200 shadow-sm space-y-2">
              <span className="text-xs font-bold text-sky-800 block">១. ជ្រើសរើសព្យញ្ជនៈដើម:</span>
              <div className="flex flex-wrap gap-2">
                {baseConsonants.map(c => (
                  <button
                    key={c}
                    onClick={() => handleSelectPart('base', c)}
                    className={`w-12 h-12 rounded-xl text-xl font-black font-khmer btn-kid border ${
                      selectedBase === c
                        ? 'bg-sky-500 text-white border-sky-700'
                        : 'bg-sky-50 text-sky-950 border-sky-200'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Subscripts */}
            <div className="bg-white p-4 rounded-3xl border-2 border-amber-200 shadow-sm space-y-2">
              <span className="text-xs font-bold text-amber-800 block">២. ជ្រើសរើសជើងអក្សរ:</span>
              <div className="flex flex-wrap gap-2">
                {subscripts.map(s => (
                  <button
                    key={s}
                    onClick={() => handleSelectPart('subscript', s)}
                    className={`w-12 h-12 rounded-xl text-xl font-black font-khmer btn-kid border ${
                      selectedSubscript === s
                        ? 'bg-amber-500 text-white border-amber-700'
                        : 'bg-amber-50 text-amber-950 border-amber-200'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Vowels */}
            <div className="bg-white p-4 rounded-3xl border-2 border-rose-200 shadow-sm space-y-2">
              <span className="text-xs font-bold text-rose-800 block">៣. ជ្រើសរើសស្រៈ:</span>
              <div className="flex flex-wrap gap-2">
                {vowels.map(v => (
                  <button
                    key={v}
                    onClick={() => handleSelectPart('vowel', v)}
                    className={`w-12 h-12 rounded-xl text-xl font-black font-khmer btn-kid border ${
                      selectedVowel === v
                        ? 'bg-rose-500 text-white border-rose-700'
                        : 'bg-rose-50 text-rose-950 border-rose-200'
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

      {/* ===================================================================== */}
      {/* MODE 2: SVO SYNTAX RAIL */}
      {/* ===================================================================== */}
      {mode === 'svo_rail' && (
        <div className="space-y-6">
          {/* Railroad Track with Wagons (Tap-to-Place Target Wagons) */}
          <div className="bg-gradient-to-r from-slate-100 via-amber-50 to-slate-100 rounded-3xl p-8 border-4 border-sky-300 shadow-md space-y-6 overflow-x-auto">
            <div className="flex items-center gap-4 min-w-[500px] justify-center">
              {/* Locomotive Engine */}
              <div className="w-24 h-28 bg-slate-800 rounded-2xl text-white flex flex-col items-center justify-center shadow-lg border-b-4 border-slate-950 shrink-0">
                <Train className="w-10 h-10 text-amber-400 animate-pulse" />
                <span className="text-[10px] font-mono mt-1 font-bold">ក្បាលរថភ្លើង</span>
              </div>

              {/* Wagon 1: Subject (Blue) */}
              <div
                onClick={() => {
                  if (placedSubject) {
                    handleRemovePlacedSvo('subject');
                  } else {
                    handlePlaceCardIntoSlot('subject');
                  }
                }}
                className={`w-36 h-28 rounded-2xl border-3 border-dashed p-2 flex flex-col items-center justify-center text-center shadow shrink-0 overflow-visible cursor-pointer transition-all ${
                  placedSubject
                    ? 'bg-sky-100 border-sky-500 hover:bg-rose-50/50'
                    : selectedSvoCardId && availableSvo.find(c => c.id === selectedSvoCardId)?.role === 'subject'
                    ? 'bg-sky-50 border-sky-500 ring-4 ring-sky-300 animate-pulse'
                    : 'bg-sky-50 border-sky-300'
                }`}
              >
                <span className="text-[11px] font-black text-sky-800 font-kantumruy">១. ប្រធាន (Subject)</span>
                {placedSubject ? (
                  <div className="mt-1 overflow-visible py-0.5">
                    <span className="text-2xl block">{placedSubject.image}</span>
                    <p className="font-black text-sm font-kantumruy text-sky-950 leading-relaxed overflow-visible py-0.5">{placedSubject.textKhmer}</p>
                    <span className="text-[9px] text-rose-500 font-bold block">✕ ចុចដកចេញ</span>
                  </div>
                ) : (
                  <span className="text-xs text-sky-500 font-kantumruy mt-2 font-bold">
                    {selectedSvoCardId && availableSvo.find(c => c.id === selectedSvoCardId)?.role === 'subject' ? '👉 ចុចដាក់ទីនេះ' : 'ទទេ ▢'}
                  </span>
                )}
              </div>

              {/* Wagon 2: Verb (Green) */}
              <div
                onClick={() => {
                  if (placedVerb) {
                    handleRemovePlacedSvo('verb');
                  } else {
                    handlePlaceCardIntoSlot('verb');
                  }
                }}
                className={`w-36 h-28 rounded-2xl border-3 border-dashed p-2 flex flex-col items-center justify-center text-center shadow shrink-0 overflow-visible cursor-pointer transition-all ${
                  placedVerb
                    ? 'bg-emerald-100 border-emerald-500 hover:bg-rose-50/50'
                    : selectedSvoCardId && availableSvo.find(c => c.id === selectedSvoCardId)?.role === 'verb'
                    ? 'bg-emerald-50 border-emerald-500 ring-4 ring-emerald-300 animate-pulse'
                    : 'bg-emerald-50 border-emerald-300'
                }`}
              >
                <span className="text-[11px] font-black text-emerald-800 font-kantumruy">២. កិរិយា (Verb)</span>
                {placedVerb ? (
                  <div className="mt-1 overflow-visible py-0.5">
                    <span className="text-2xl block">{placedVerb.image}</span>
                    <p className="font-black text-sm font-kantumruy text-emerald-950 leading-relaxed overflow-visible py-0.5">{placedVerb.textKhmer}</p>
                    <span className="text-[9px] text-rose-500 font-bold block">✕ ចុចដកចេញ</span>
                  </div>
                ) : (
                  <span className="text-xs text-emerald-500 font-kantumruy mt-2 font-bold">
                    {selectedSvoCardId && availableSvo.find(c => c.id === selectedSvoCardId)?.role === 'verb' ? '👉 ចុចដាក់ទីនេះ' : 'ទទេ ▢'}
                  </span>
                )}
              </div>

              {/* Wagon 3: Object (Orange) */}
              <div
                onClick={() => {
                  if (placedObject) {
                    handleRemovePlacedSvo('object');
                  } else {
                    handlePlaceCardIntoSlot('object');
                  }
                }}
                className={`w-36 h-28 rounded-2xl border-3 border-dashed p-2 flex flex-col items-center justify-center text-center shadow shrink-0 overflow-visible cursor-pointer transition-all ${
                  placedObject
                    ? 'bg-amber-100 border-amber-500 hover:bg-rose-50/50'
                    : selectedSvoCardId && availableSvo.find(c => c.id === selectedSvoCardId)?.role === 'object'
                    ? 'bg-amber-50 border-amber-500 ring-4 ring-amber-300 animate-pulse'
                    : 'bg-amber-50 border-amber-300'
                }`}
              >
                <span className="text-[11px] font-black text-amber-800 font-kantumruy">៣. កម្មបទ (Object)</span>
                {placedObject ? (
                  <div className="mt-1 overflow-visible py-0.5">
                    <span className="text-2xl block">{placedObject.image}</span>
                    <p className="font-black text-sm font-kantumruy text-amber-950 leading-relaxed overflow-visible py-0.5">{placedObject.textKhmer}</p>
                    <span className="text-[9px] text-rose-500 font-bold block">✕ ចុចដកចេញ</span>
                  </div>
                ) : (
                  <span className="text-xs text-amber-500 font-kantumruy mt-2 font-bold">
                    {selectedSvoCardId && availableSvo.find(c => c.id === selectedSvoCardId)?.role === 'object' ? '👉 ចុចដាក់ទីនេះ' : 'ទទេ ▢'}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Available Word Cards (Tap-to-Select Tray) */}
          <div className="bg-white rounded-3xl p-5 border-3 border-sky-200 shadow-sm space-y-3">
            <span className="text-xs font-black text-slate-600 block uppercase tracking-wide font-sans">
              👆 ចុចជ្រើសរើសពាក្យ រួចចុចលើទូរថភ្លើងតាមវេយ្យាករណ៍ (Tap Word Below, Then Tap Wagon):
            </span>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {availableSvo.map(c => {
                const isSelected = selectedSvoCardId === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => handleSelectSvoCard(c)}
                    className={`px-5 py-3 rounded-2xl flex items-center gap-2 font-kantumruy font-black text-base btn-kid select-none overflow-visible leading-relaxed cursor-pointer transition-all ${
                      isSelected
                        ? 'ring-4 ring-indigo-500 scale-105 shadow-xl bg-white text-indigo-950 border-2 border-indigo-400'
                        : 'bg-amber-100 hover:bg-amber-200 border-2 border-amber-300 text-amber-950'
                    }`}
                  >
                    <span className="text-2xl">{c.image}</span>
                    <span className="leading-relaxed overflow-visible py-0.5">{c.textKhmer}</span>
                    {isSelected && (
                      <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full font-sans font-bold">
                        ✓ បានជ្រើស
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODE 3: PHONETIC DRUM (SERIES O VS OR) */}
      {/* ===================================================================== */}
      {mode === 'phonetic_drum' && currentConsonant && (
        <div className="space-y-6">
          {/* Conveyor Belt Display */}
          <div className="bg-slate-100 rounded-3xl p-8 border-4 border-slate-300 shadow-inner flex flex-col items-center justify-center space-y-6 text-center">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
              ព្យញ្ជនៈនៅលើខ្សែក្រវាត់បញ្ជូន (Conveyor Belt):
            </span>

            {/* Glowing Current Consonant */}
            <div className="w-24 h-24 rounded-3xl bg-white border-4 border-amber-400 shadow-xl flex items-center justify-center text-5xl font-black font-khmer text-amber-950 animate-bounce">
              {currentConsonant.consonant}
            </div>

            <p className="text-xs text-slate-600 font-khmer">
              តើព្យញ្ជនៈ «{currentConsonant.consonant}» ជាពួក អ ឬពួក អ៊?
            </p>
          </div>

          {/* Two Resonant Phonetic Drums */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Drum ពួក អ */}
            <button
              onClick={() => handleSortRegister('series_o')}
              className="p-6 rounded-3xl bg-gradient-to-b from-sky-400 to-sky-600 text-white border-b-6 border-sky-800 shadow-lg btn-kid flex flex-col items-center justify-center gap-2 hover:scale-102 transition-all"
            >
              <Drum className="w-10 h-10 text-sky-100" />
              <h4 className="text-2xl font-black font-khmer">ស្គរពួក អ (Series O)</h4>
              <span className="text-xs opacity-80">សំឡេងស្រាល (ក, ខ, ច, ឆ...)</span>
              <span className="text-xs font-mono font-bold bg-white/20 px-3 py-1 rounded-full mt-1">
                ប្រមូលបាន: {sortedDrumCount.o} តួ
              </span>
            </button>

            {/* Drum ពួក អ៊ */}
            <button
              onClick={() => handleSortRegister('series_or')}
              className="p-6 rounded-3xl bg-gradient-to-b from-amber-500 to-amber-700 text-white border-b-6 border-amber-900 shadow-lg btn-kid flex flex-col items-center justify-center gap-2 hover:scale-102 transition-all"
            >
              <Drum className="w-10 h-10 text-amber-100" />
              <h4 className="text-2xl font-black font-khmer">ស្គរពួក អ៊ (Series OR)</h4>
              <span className="text-xs opacity-80">សំឡេងធ្ងន់ (គ, ឃ, ង, ជ...)</span>
              <span className="text-xs font-mono font-bold bg-white/20 px-3 py-1 rounded-full mt-1">
                ប្រមូលបាន: {sortedDrumCount.or} តួ
              </span>
            </button>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODE 4: SILENT MARKER DETECTIVE */}
      {/* ===================================================================== */}
      {mode === 'silent_marker' && (
        <div className="space-y-6 text-center">
          <div className="bg-white rounded-3xl p-8 border-4 border-amber-300 shadow-md space-y-6">
            <div className="flex items-center justify-center gap-2 text-amber-900">
              <Search className="w-6 h-6" />
              <h4 className="text-xl font-black font-heading">
                ស្វែងរកព្យញ្ជនៈមិនបញ្ចេញសំឡេង (Silent Consonant):
              </h4>
            </div>

            <p className="text-xs text-slate-500 font-khmer">
              ចុចលើតួអក្សរដែលត្រូវដាក់សញ្ញា «ទណ្ឌឃាត ៍» ដើម្បីបំបាត់សំឡេង
            </p>

            {/* Word Tiles with Slot for Marker */}
            <div className="flex justify-center gap-4 py-4">
              {targetLoanword.parts.map((part, idx) => (
                <button
                  key={idx}
                  onClick={() => handleApplyMarker(idx)}
                  className={`w-24 h-28 rounded-2xl border-3 flex flex-col items-center justify-center font-khmer btn-kid transition-all ${
                    appliedDiacriticIndex === idx
                      ? 'bg-amber-100 border-amber-500 shadow-md scale-105'
                      : 'bg-slate-50 border-slate-200 hover:border-amber-400'
                  }`}
                >
                  <span className="text-xs text-amber-700 font-mono h-4">
                    {appliedDiacriticIndex === idx ? '៍' : ' '}
                  </span>
                  <span className="text-3xl font-black text-slate-900">{part}</span>
                </button>
              ))}
            </div>

            <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200 text-xs font-khmer text-amber-900 max-w-md mx-auto">
              💡 ពាក្យ «<strong>{targetLoanword.meaning}</strong>» មានអក្សរ «ហ» ជាតួដែលមិនបញ្ចេញសំឡេង ដូច្នេះត្រូវដាក់សញ្ញាទណ្ឌឃាតពីលើ (ហ៍)។
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
