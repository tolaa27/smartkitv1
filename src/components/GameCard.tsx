// src/components/GameCard.tsx
'use client';

import React, { useState } from 'react';
import { CurriculumExercise } from '@/types/curriculum';
import { sound } from '@/utils/sound';
import { Play, Volume2, Star, Sparkles, CheckCircle2 } from 'lucide-react';

interface GameCardProps {
  exercise: CurriculumExercise;
  onPlay: (exercise: CurriculumExercise) => void;
  isCompleted?: boolean;
  starsEarned?: number;
}

export const GameCard: React.FC<GameCardProps> = ({
  exercise,
  onPlay,
  isCompleted = false,
  starsEarned = 0,
}) => {
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  const handleSpeech = (e: React.MouseEvent) => {
    e.stopPropagation();
    sound.playPop();
    setIsSpeaking(true);
    const speechText = exercise.audioPromptKh || exercise.questionKh;
    sound.speakKhmer(speechText);
    setTimeout(() => setIsSpeaking(false), 3000);
  };

  const handlePlayClick = () => {
    sound.playPop();
    onPlay(exercise);
  };

  const getSubjectTheme = () => {
    switch (exercise.subject) {
      case 'math':
        return {
          badge: 'bg-blue-100 text-blue-900 border-blue-300',
          label: 'គណិតវិទ្យា (Math)',
          cardBg: 'from-blue-50/40 to-white',
          accent: 'text-blue-600',
        };
      case 'khmer':
        return {
          badge: 'bg-emerald-100 text-emerald-900 border-emerald-300',
          label: 'ភាសាខ្មែរ (Khmer)',
          cardBg: 'from-emerald-50/40 to-white',
          accent: 'text-emerald-600',
        };
      case 'science':
        return {
          badge: 'bg-teal-100 text-teal-900 border-teal-300',
          label: 'វិទ្យាសាស្ត្រ (Science)',
          cardBg: 'from-teal-50/40 to-white',
          accent: 'text-teal-600',
        };
      case 'social':
        return {
          badge: 'bg-purple-100 text-purple-900 border-purple-300',
          label: 'សិក្សាសង្គម (Social)',
          cardBg: 'from-purple-50/40 to-white',
          accent: 'text-purple-600',
        };
    }
  };

  const theme = getSubjectTheme();

  // Visual emoji / icon representation depending on exercise type
  const getVisualPreview = () => {
    switch (exercise.type) {
      case 'compare-select':
        return '🍈 🍎 🥥';
      case 'position-pick':
        return '🐱 🐶 🐰';
      case 'number-line':
      case 'number-line-fill':
        return '📈 ៤ + ១ = ?';
      case 'shape-match':
        return '▲ ◼ ● ▬';
      case 'base-ten-blocks':
      case 'place-value-blocks':
        return '🟦 🟧 🟩';
      case 'riel-calculator':
        return '💵 ៛ ១០០០៛';
      case 'match-pairs':
        return '✨ ⇄ 🫧';
      case 'order-sequence':
        return '១ ➔ ២ ➔ ៣';
      case 'tap-select-count':
        return '🥭 🥭 🥭';
      default:
        return '🎮';
    }
  };

  return (
    <div className="bg-white rounded-3xl border-3 border-amber-200/90 hover:border-amber-400 p-5 sm:p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group relative overflow-hidden">
      {/* Top Header: Subject Badge + Audio Reader Button */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span
            className={`text-[11px] font-black font-khmer px-2.5 py-1 rounded-full border ${theme.badge}`}
          >
            {theme.label}
          </span>
          <span className="text-[11px] font-bold text-slate-400 font-khmer">
            ថ្នាក់ទី {exercise.grade}
          </span>
        </div>

        {/* Audio Reader Button with WebSpeech Engine */}
        <button
          type="button"
          onClick={handleSpeech}
          className={`w-9 h-9 rounded-xl border-2 flex items-center justify-center transition-all cursor-pointer ${
            isSpeaking
              ? 'bg-blue-600 text-white border-blue-700 animate-pulse'
              : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200 hover:border-amber-300 shadow-2xs'
          }`}
          title="ចុចដើម្បីស្តាប់សំណួរ (Read Question Aloud)"
          aria-label="ស្តាប់សំណួរ"
        >
          <Volume2 className="w-4 h-4" />
        </button>
      </div>

      {/* Center Body: Lesson Title, Question Stem, Visual Preview */}
      <div className="space-y-2 mb-5">
        <div className="text-xs font-bold text-amber-700 font-khmer flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>{exercise.lessonKh}</span>
        </div>

        <h3 className="font-heading font-black text-slate-900 text-base sm:text-lg leading-snug font-khmer line-clamp-2">
          {exercise.questionKh}
        </h3>

        {exercise.questionEn && (
          <p className="text-xs text-slate-400 font-medium line-clamp-1">
            {exercise.questionEn}
          </p>
        )}

        {/* Visual Manipulative Preview Badge */}
        <div className="bg-amber-50/50 rounded-2xl p-2.5 border border-amber-100 flex items-center justify-center text-lg sm:text-xl font-bold text-slate-700 tracking-wider">
          <span>{getVisualPreview()}</span>
        </div>
      </div>

      {/* Bottom Footer: Stars & 3.5D Squishy Play Button */}
      <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100">
        {/* Stars completion display */}
        <div className="flex items-center gap-1">
          {[1, 2, 3].map(st => (
            <Star
              key={st}
              className={`w-4 h-4 ${
                starsEarned >= st || (isCompleted && st <= 3)
                  ? 'text-amber-400 fill-amber-400'
                  : 'text-slate-200 fill-slate-100'
              }`}
            />
          ))}
        </div>

        {/* 3.5D Squishy Claymorphic Play Button */}
        <button
          type="button"
          onClick={handlePlayClick}
          className="min-h-[44px] px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 active:translate-y-1 text-white font-heading font-black text-sm rounded-2xl shadow-[0_6px_0_#059669] active:shadow-[0_2px_0_#059669] transition-all flex items-center gap-2 cursor-pointer select-none"
        >
          <Play className="w-4 h-4 fill-white" />
          <span className="font-khmer">លេងឥឡូវនេះ</span>
        </button>
      </div>
    </div>
  );
};
