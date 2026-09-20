'use client';

import React, { useState, useEffect, useRef } from 'react';
import { GameLevel } from '@/types/edtech';
import { SoundFX } from '@/utils/sound';
import { SpeakerButton } from '@/components/common/SpeakerButton';
import { Timer, CheckCircle2, AlertCircle } from 'lucide-react';

interface QuizTapGameProps {
  level: GameLevel;
  onLevelComplete: (scoreGain: number) => void;
}

export const QuizTapGame: React.FC<QuizTapGameProps> = ({ level, onLevelComplete }) => {
  const options = level.gameplayData.quizOptions || [];
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ message: string; isCorrect: boolean } | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(level.timeLimitSeconds || 30);
  const [isCompleting, setIsCompleting] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setSelectedOptionId(null);
    setFeedback(null);
    setIsCompleting(false);
    setTimeLeft(level.timeLimitSeconds || 30);

    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [level]);

  const handleSelectOption = (option: (typeof options)[0]) => {
    // Prevent double clicks or clicking after completion
    if (isCompleting || feedback?.isCorrect) return;

    SoundFX.playPop();
    setSelectedOptionId(option.id);

    if (option.isCorrect) {
      setIsCompleting(true);
      if (timerRef.current) clearInterval(timerRef.current);

      SoundFX.playSuccess();
      SoundFX.playPop();
      setFeedback({
        message: 'ឆ្លើយត្រូវហើយ! ពូកែណាស់! 🎉',
        isCorrect: true,
      });

      const bonus = Math.max(20, timeLeft * 3);
      setTimeout(() => {
        onLevelComplete(100 + bonus);
      }, 900);
    } else {
      SoundFX.playGentleError();
      setFeedback({
        message: 'មិនទាន់ត្រូវទេ! សាកល្បងជ្រើសរើសចម្លើយផ្សេងទៀតណា៎! 😊',
        isCorrect: false,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Prompt & Timer */}
      <div className="bg-rose-50 rounded-2xl p-4 border-2 border-rose-200 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <SpeakerButton text={level.promptText} size="sm" />
          <p className="text-base sm:text-lg font-extrabold text-rose-950 font-khmer">
            {level.promptText}
          </p>
        </div>
        <div className="flex items-center gap-1.5 bg-white px-3 py-1 rounded-xl border border-rose-200 text-rose-700 font-extrabold text-sm shadow-xs shrink-0">
          <Timer className="w-4 h-4" />
          <span>{timeLeft}s</span>
        </div>
      </div>

      {/* Interactive Balloon / Speed Tap Grid */}
      <div className="bg-white rounded-3xl p-6 border-4 border-rose-300 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {options.map((opt, idx) => {
            const isSelected = selectedOptionId === opt.id;
            const bgColors = [
              'from-amber-400 to-amber-500',
              'from-sky-400 to-sky-500',
              'from-emerald-400 to-emerald-500',
              'from-rose-400 to-rose-500',
            ];
            const colorClass = bgColors[idx % bgColors.length];

            return (
              <button
                key={opt.id}
                type="button"
                disabled={isCompleting || timeLeft === 0}
                onClick={() => handleSelectOption(opt)}
                className={`p-5 rounded-2xl text-white font-extrabold text-lg sm:text-xl btn-kid transition-all flex items-center justify-between gap-3 border-b-4 bg-gradient-to-r ${colorClass} cursor-pointer select-none w-full text-left disabled:opacity-75 disabled:cursor-not-allowed ${
                  isSelected ? 'ring-4 ring-offset-2 ring-amber-400 scale-102' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  {opt.emoji && <span className="text-3xl animate-bounce">{opt.emoji}</span>}
                  <span className="font-khmer">{opt.textKhmer}</span>
                </div>
                <SpeakerButton
                  text={opt.textKhmer}
                  size="xs"
                  className="bg-white/30 text-white border-white/40 hover:bg-white/50"
                  title="ស្ដាប់ពាក្យនេះ"
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Feedback Alert */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl border-2 font-bold text-sm flex items-center gap-2 animate-bounce ${
            feedback.isCorrect
              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
              : 'bg-rose-50 text-rose-800 border-rose-300'
          }`}
        >
          {feedback.isCorrect ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}
    </div>
  );
};
