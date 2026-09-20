'use client';

import React, { useState } from 'react';
import { useEdTech } from '@/context/EdTechContext';
import { sound } from '@/utils/sound';
import confetti from 'canvas-confetti';
import { ArrowLeft, Star, Volume2, Sparkles, RefreshCw } from 'lucide-react';

interface TrainWord {
  baseConsonant: string;
  missingPart: string;
  options: string[];
  fullWord: string;
  meaningKh: string;
  emoji: string;
}

const WORDS: TrainWord[] = [
  { baseConsonant: 'ក', missingPart: 'ា', options: ['ា', 'ិ', 'ុ'], fullWord: 'កា', meaningKh: 'ក្អែក (Crow)', emoji: '🐦' },
  { baseConsonant: 'ស', missingPart: 'ៀវភៅ', options: ['ៀវភៅ', 'ាលា', 'េះ'], fullWord: 'សៀវភៅ', meaningKh: 'សៀវភៅ (Book)', emoji: '📖' },
  { baseConsonant: 'ផ្ក', missingPart: 'ា', options: ['ា', 'ាំ', 'ើ'], fullWord: 'ផ្កា', meaningKh: 'ផ្ការីក (Flower)', emoji: '🌸' },
  { baseConsonant: 'ម', missingPart: 'ាស', options: ['ាស', 'ិន', 'ែក'], fullWord: 'មាស', meaningKh: 'មាស (Gold)', emoji: '🪙' },
];

export const SpellingTrainGame: React.FC = () => {
  const { grade, recordGameProgress, setActiveGame } = useEdTech();
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const currentWord = WORDS[currentIdx];
  const [placedPart, setPlacedPart] = useState<string | null>(null);
  const [score, setScore] = useState<number>(0);
  const [gameFinished, setGameFinished] = useState<boolean>(false);

  const handleChooseOption = (opt: string) => {
    sound.playPop();
    setPlacedPart(opt);

    if (opt === currentWord.missingPart) {
      sound.playSuccess();
      sound.playTrainWhistle();
      sound.speakKhmer(currentWord.fullWord);
      const points = 100;
      setScore(prev => prev + points);

      if (currentIdx + 1 >= WORDS.length) {
        confetti({ particleCount: 90, spread: 70 });
        setGameFinished(true);
        recordGameProgress('spelling-train', 'khmer', score + points, 3);
      } else {
        setTimeout(() => {
          setPlacedPart(null);
          setCurrentIdx(prev => prev + 1);
        }, 1300);
      }
    } else {
      sound.playWrong();
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      <div className="flex items-center justify-between bg-white p-4 rounded-3xl border-4 border-indigo-300 shadow-lg">
        <button
          onClick={() => {
            sound.playPop();
            setActiveGame(null);
          }}
          className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-indigo-100 hover:bg-indigo-200 text-indigo-950 font-bold btn-kid text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>ថយក្រោយ</span>
        </button>
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-bold font-heading text-indigo-900">
            🚂 រថភ្លើងផ្គុំពាក្យខ្មែរ
          </h2>
          <p className="text-xs text-indigo-700 font-medium">
            Khmer Syllable & Spelling Train • ថ្នាក់ទី {grade}
          </p>
        </div>
        <div className="text-sm font-bold text-indigo-900 bg-indigo-50 px-3 py-1.5 rounded-2xl border-2 border-indigo-200">
          ពិន្ទុ: {score}
        </div>
      </div>

      {gameFinished ? (
        <div className="bg-white rounded-3xl p-8 border-4 border-indigo-400 text-center shadow-2xl space-y-6">
          <div className="text-5xl">🚂💨✨</div>
          <h3 className="text-3xl font-extrabold text-indigo-950 font-heading">
            រថភ្លើងអក្សរខ្មែរធ្វើដំណើរទៅមុខ!
          </h3>
          <p className="text-slate-600">
            ប្អូនបានផ្គុំពាក្យព្យញ្ជនៈ និងស្រៈបានត្រឹមត្រូវទាំងអស់!
          </p>
          <div className="flex justify-center gap-3">
            {[1, 2, 3].map(st => (
              <Star key={st} className="w-12 h-12 fill-amber-400 text-amber-500 scale-110" />
            ))}
          </div>
          <button
            onClick={() => {
              sound.playPop();
              setCurrentIdx(0);
              setPlacedPart(null);
              setScore(0);
              setGameFinished(false);
            }}
            className="px-6 py-3 rounded-2xl bg-indigo-500 text-white font-bold btn-kid"
          >
            លេងឡើងវិញ
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Train Visual Display */}
          <div className="bg-gradient-to-r from-sky-100 via-indigo-100 to-amber-100 rounded-3xl p-6 border-4 border-indigo-300 shadow-inner flex flex-col items-center">
            <div className="text-4xl mb-3">{currentWord.emoji}</div>
            {/* Train Wagons */}
            <div className="flex items-center gap-3 py-4 overflow-x-auto max-w-full">
              {/* Locomotive */}
              <div className="w-24 h-24 bg-rose-500 rounded-2xl border-b-4 border-rose-700 flex flex-col items-center justify-center text-white font-black shadow-md shrink-0">
                <span className="text-2xl">🚂</span>
                <span className="text-xs">ក្បាលរថ</span>
              </div>
              {/* Wagon 1: Base Consonant */}
              <div className="w-24 h-24 bg-amber-400 rounded-2xl border-b-4 border-amber-600 flex items-center justify-center text-3xl font-black text-amber-950 shadow-md shrink-0 font-khmer">
                {currentWord.baseConsonant}
              </div>
              {/* Wagon 2: Missing Slot */}
              <div className="w-28 h-24 bg-white/90 border-4 border-dashed border-indigo-400 rounded-2xl flex items-center justify-center text-3xl font-black text-indigo-900 shadow-inner shrink-0 font-khmer">
                {placedPart || '?'}
              </div>
            </div>
            <p className="text-sm font-bold text-indigo-950 font-khmer mt-2">
              ពាក្យពេញលេញ៖ {currentWord.meaningKh}
            </p>
          </div>

          {/* Vowel / Missing Options */}
          <div className="bg-white rounded-3xl p-6 border-4 border-indigo-200 shadow-md space-y-3 text-center">
            <span className="text-xs font-bold text-slate-500 uppercase">
              ជ្រើសរើសស្រៈ ឬព្យញ្ជនៈបំពេញទូរថភ្លើង:
            </span>
            <div className="flex justify-center gap-4">
              {currentWord.options.map(opt => (
                <button
                  key={opt}
                  onClick={() => handleChooseOption(opt)}
                  className="w-20 h-20 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-indigo-950 font-black text-3xl border-b-4 border-indigo-400 btn-kid flex items-center justify-center font-khmer transition-all"
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
