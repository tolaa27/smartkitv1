// src/components/curriculum/ExerciseRenderer.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { CurriculumExercise } from '@/types/curriculum';
import { sound } from '@/utils/sound';
import { NumberLineExerciseComponent } from './exercises/NumberLineExercise';
import { PlaceValueBlocksExerciseComponent } from './exercises/PlaceValueBlocksExercise';
import { MatchPairsExerciseComponent } from './exercises/MatchPairsExercise';
import { OrderSequenceExerciseComponent } from './exercises/OrderSequenceExercise';
import { TapSelectCountExerciseComponent } from './exercises/TapSelectCountExercise';
import { McqExerciseComponent } from './exercises/McqExercise';
import { FillBlankExerciseComponent } from './exercises/FillBlankExercise';
import { SpeakerButton } from '@/components/common/SpeakerButton';
import { Sparkles, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';

interface Props {
  exercise: CurriculumExercise;
  currentIndex: number;
  totalCount: number;
  onComplete: (isCorrect: boolean, score: number, stars: number) => void;
}

export const ExerciseRenderer: React.FC<Props> = ({
  exercise,
  currentIndex,
  totalCount,
  onComplete,
}) => {
  const [answeredState, setAnsweredState] = useState<{
    isAnswered: boolean;
    isCorrect: boolean;
  }>({
    isAnswered: false,
    isCorrect: false,
  });

  // Reset answered state on new exercise
  useEffect(() => {
    setAnsweredState({ isAnswered: false, isCorrect: false });
    // Automatically announce question via Khmer speech synthesis
    const speechText = exercise.audioPromptKh || exercise.questionKh;
    sound.speakKhmer(speechText);
  }, [exercise.id]);

  const handleExerciseAnswer = (isCorrect: boolean) => {
    setAnsweredState({
      isAnswered: true,
      isCorrect,
    });

    // If correct: 50 points, 3 stars
    const score = isCorrect ? 50 : 10;
    const stars = isCorrect ? 3 : 1;

    setTimeout(() => {
      onComplete(isCorrect, score, stars);
    }, 1200);
  };

  const getSubjectBadge = () => {
    switch (exercise.subject) {
      case 'math':
        return { label: 'គណិតវិទ្យា', bg: 'bg-amber-100 text-amber-950 border-amber-300' };
      case 'khmer':
        return { label: 'ភាសាខ្មែរ', bg: 'bg-sky-100 text-sky-950 border-sky-300' };
      case 'science':
        return { label: 'វិទ្យាសាស្ត្រ', bg: 'bg-emerald-100 text-emerald-950 border-emerald-300' };
      case 'social':
        return { label: 'សិក្សាសង្គម', bg: 'bg-purple-100 text-purple-950 border-purple-300' };
    }
  };

  const badge = getSubjectBadge();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Top Meta Bar: Lesson Tag, Exercise Counter & Progress */}
      <div className="bg-white p-4 rounded-3xl border-2 border-amber-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-black px-3 py-1 rounded-full border ${badge.bg}`}>
            {badge.label}
          </span>
          <span className="text-xs font-bold text-slate-500 font-khmer line-clamp-1">
            {exercise.lessonKh}
          </span>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs font-black text-amber-950 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
          <span>លំហាត់ {currentIndex + 1} / {totalCount}</span>
        </div>
      </div>

      {/* Main Exercise Card Container */}
      <div className="clay-card p-6 sm:p-8 border-3 border-amber-300 bg-white space-y-6">
        {/* Question Header with Audio Pronunciation Trigger */}
        <div className="flex items-start gap-3 bg-amber-50/50 p-4 rounded-2xl border-2 border-amber-200">
          <div className="shrink-0 pt-0.5">
            <SpeakerButton
              text={exercise.audioPromptKh || exercise.questionKh}
              size="md"
              title="ចុចដើម្បីស្តាប់សំណួរ (Listen to question)"
            />
          </div>

          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-black font-heading text-slate-900 leading-snug">
              {exercise.questionKh}
            </h2>
            {exercise.questionEn && (
              <p className="text-xs text-slate-500 font-semibold">{exercise.questionEn}</p>
            )}
          </div>
        </div>

        {/* Dynamic Exercise Body based on type */}
        <div>
          {exercise.type === 'number-line-fill' && (
            <NumberLineExerciseComponent
              key={exercise.id}
              exercise={exercise}
              onAnswer={(isCorrect) => handleExerciseAnswer(isCorrect)}
              disabled={answeredState.isAnswered}
            />
          )}

          {exercise.type === 'place-value-blocks' && (
            <PlaceValueBlocksExerciseComponent
              key={exercise.id}
              exercise={exercise}
              onAnswer={(isCorrect) => handleExerciseAnswer(isCorrect)}
              disabled={answeredState.isAnswered}
            />
          )}

          {exercise.type === 'match-pairs' && (
            <MatchPairsExerciseComponent
              key={exercise.id}
              exercise={exercise}
              onAnswer={(isCorrect) => handleExerciseAnswer(isCorrect)}
              disabled={answeredState.isAnswered}
            />
          )}

          {exercise.type === 'order-sequence' && (
            <OrderSequenceExerciseComponent
              key={exercise.id}
              exercise={exercise}
              onAnswer={(isCorrect) => handleExerciseAnswer(isCorrect)}
              disabled={answeredState.isAnswered}
            />
          )}

          {exercise.type === 'tap-select-count' && (
            <TapSelectCountExerciseComponent
              key={exercise.id}
              exercise={exercise}
              onAnswer={(isCorrect) => handleExerciseAnswer(isCorrect)}
              disabled={answeredState.isAnswered}
            />
          )}

          {exercise.type === 'mcq' && (
            <McqExerciseComponent
              key={exercise.id}
              exercise={exercise}
              onAnswer={(isCorrect) => handleExerciseAnswer(isCorrect)}
              disabled={answeredState.isAnswered}
            />
          )}

          {exercise.type === 'fill-blank' && (
            <FillBlankExerciseComponent
              key={exercise.id}
              exercise={exercise}
              onAnswer={(isCorrect) => handleExerciseAnswer(isCorrect)}
              disabled={answeredState.isAnswered}
            />
          )}
        </div>

        {/* Answer Feedback Toast */}
        {answeredState.isAnswered && (
          <div
            className={`p-4 rounded-2xl border-2 flex items-center justify-between gap-3 animate-fade-in ${
              answeredState.isCorrect
                ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                : 'bg-rose-50 border-rose-300 text-rose-950'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {answeredState.isCorrect ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-6 h-6 text-rose-600 shrink-0" />
              )}
              <span className="font-heading font-black text-sm sm:text-base">
                {answeredState.isCorrect
                  ? 'ត្រឹមត្រូវហើយ! ឆ្លាតណាស់! (+៥០ 💎)'
                  : 'មិនទាន់ត្រឹមត្រូវទេ! សាកល្បងម្ដងទៀត!'}
              </span>
            </div>
            <Sparkles className="w-5 h-5 text-amber-500 animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
};
