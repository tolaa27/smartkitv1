'use client';

import React, { useState, useEffect } from 'react';
import { GeneratedGameConfig } from '@/types/edtech';
import { useEdTech } from '@/context/EdTechContext';
import { sound } from '@/utils/sound';
import { generateProceduralGame } from '@/utils/proceduralEngine';
import { SpeakerButton } from '@/components/common/SpeakerButton';
import confetti from 'canvas-confetti';
import { ArrowLeft, Star, Volume2, Sparkles, RefreshCw, Trophy, BookOpen } from 'lucide-react';

import { SorterGame } from './SorterGame';
import { SequencerGame } from './SequencerGame';
import { QuizTapGame } from './QuizTapGame';
import { SentenceBuilderGame } from './SentenceBuilderGame';
import { HotspotGame } from './HotspotGame';
import { MatchingCardsGame } from './MatchingCardsGame';

// 5 Universal Mechanics Engines
import { SandboxEngine } from '@/components/engines/SandboxEngine';
import { MathCraEngine } from '@/components/engines/MathCraEngine';
import { KhmerPhoneticsEngine } from '@/components/engines/KhmerPhoneticsEngine';
import { SequencerEngine } from '@/components/engines/SequencerEngine';
import { SorterEngine } from '@/components/engines/SorterEngine';

interface UniversalGameRunnerProps {
  gameConfig: GeneratedGameConfig;
  onExit: () => void;
}

export const UniversalGameRunner: React.FC<UniversalGameRunnerProps> = ({
  gameConfig: initialGameConfig,
  onExit,
}) => {
  const { recordGameProgress, grade } = useEdTech();
  const [activeConfig, setActiveConfig] = useState<GeneratedGameConfig>(initialGameConfig);
  const [currentLevelIndex, setCurrentLevelIndex] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [earnedStars, setEarnedStars] = useState<number>(3);

  useEffect(() => {
    setActiveConfig(initialGameConfig);
    setCurrentLevelIndex(0);
    setScore(0);
    setIsFinished(false);
  }, [initialGameConfig]);

  const levels = activeConfig.levels || [];
  const currentLevel = levels[currentLevelIndex] || levels[0];

  const handleLevelComplete = (scoreGain: number) => {
    const nextScore = score + scoreGain;
    setScore(nextScore);

    if (currentLevelIndex + 1 < levels.length) {
      setCurrentLevelIndex(prev => prev + 1);
    } else {
      // Completed all levels!
      const finalStars = 3;
      setEarnedStars(finalStars);
      setIsFinished(true);

      sound.playSuccessChime();
      sound.playStarCelebration();
      confetti({
        particleCount: 110,
        spread: 75,
        origin: { y: 0.6 },
        colors: ['#FBBF24', '#38BDF8', '#4ADE80', '#F87171'],
      });

      recordGameProgress(activeConfig.id, activeConfig.subject, nextScore, finalStars);
    }
  };

  const handleRestart = () => {
    sound.playPop();
    // Zero-repetition: generate fresh randomized round!
    const procedural = generateProceduralGame(activeConfig.id, activeConfig.gradeLevel || grade);
    if (procedural) {
      setActiveConfig(procedural);
    }
    setCurrentLevelIndex(0);
    setScore(0);
    setIsFinished(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-3xl border-4 border-amber-300 shadow-md">
        <button
          onClick={() => {
            sound.playPop();
            onExit();
          }}
          className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold transition-all btn-kid text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>ថយក្រោយ</span>
        </button>

        <div className="text-center">
          <h2 className="text-lg sm:text-2xl font-black font-heading text-amber-950 flex items-center justify-center gap-2">
            <span>{activeConfig.titleKhmer}</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            {activeConfig.titleEnglish} • ថ្នាក់ទី {activeConfig.gradeLevel}
            {activeConfig.metadata?.classroomPin && (
              <span className="ml-2 font-mono font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                PIN: {activeConfig.metadata.classroomPin}
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <SpeakerButton
            text={activeConfig.instructionsKhmer || activeConfig.titleKhmer}
            size="sm"
            title="ស្ដាប់ការណែនាំ"
          />
          <div className="text-xs font-black text-amber-950 bg-amber-50 px-3 py-2 rounded-xl border border-amber-200">
            កម្រិត {currentLevelIndex + 1}/{levels.length} • ពិន្ទុ: {score}
          </div>
        </div>
      </div>

      {isFinished ? (
        /* Game Completion Celebration Screen */
        <div className="bg-white rounded-3xl p-8 border-4 border-amber-400 text-center shadow-2xl space-y-6 animate-fade-in">
          <div className="w-20 h-20 mx-auto bg-amber-100 rounded-full flex items-center justify-center text-4xl shadow-inner border-2 border-amber-300 animate-bounce">
            🏆
          </div>
          <div>
            <h3 className="text-3xl font-extrabold text-amber-950 font-heading">
              អបអរសាទរ! ប្អូនឆ្លាតណាស់!
            </h3>
            <p className="text-slate-600 mt-1 max-w-md mx-auto font-khmer">
              បានបញ្ចប់ល្បែងកម្សាន្ត «{activeConfig.titleKhmer}» ដោយជោគជ័យ!
            </p>
          </div>

          <div className="flex justify-center gap-3">
            {[1, 2, 3].map(st => (
              <Star
                key={st}
                className="w-12 h-12 fill-amber-400 text-amber-500 scale-110 drop-shadow-md"
              />
            ))}
          </div>

          <div className="bg-amber-50 rounded-2xl p-4 max-w-sm mx-auto border-2 border-amber-200 flex justify-around">
            <div>
              <span className="text-xs text-amber-700 block">ពិន្ទុសម្រេចបាន</span>
              <span className="text-2xl font-black text-amber-950">{score}</span>
            </div>
            <div className="h-10 w-px bg-amber-200" />
            <div>
              <span className="text-xs text-amber-700 block">ផ្កាយទទួលបាន</span>
              <span className="text-2xl font-black text-amber-950">+{earnedStars} ⭐️</span>
            </div>
          </div>

          <div className="flex justify-center gap-4 pt-2">
            <button
              onClick={handleRestart}
              className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-base btn-kid flex items-center gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              <span>លេងម្ដងទៀត</span>
            </button>
            <button
              onClick={onExit}
              className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-base btn-kid"
            >
              ទំព័រដើម
            </button>
          </div>
        </div>
      ) : (
        /* Mechanics Engine Router */
        <div className="space-y-4">
          {activeConfig.engineType === 'sandbox' || activeConfig.template === 'sandbox' || currentLevel.gameplayData?.sandboxData ? (
            <SandboxEngine level={currentLevel} onLevelComplete={handleLevelComplete} />
          ) : activeConfig.engineType === 'math_cra' || activeConfig.template === 'math_cra' || currentLevel.gameplayData?.mathCraData ? (
            <MathCraEngine level={currentLevel} onLevelComplete={handleLevelComplete} />
          ) : activeConfig.engineType === 'khmer_phonetics' || activeConfig.template === 'khmer_phonetics' || currentLevel.gameplayData?.khmerPhoneticsData ? (
            <KhmerPhoneticsEngine level={currentLevel} onLevelComplete={handleLevelComplete} />
          ) : activeConfig.engineType === 'sequencer' || currentLevel.gameplayData?.sequencerData ? (
            <SequencerEngine level={currentLevel} onLevelComplete={handleLevelComplete} />
          ) : activeConfig.engineType === 'sorter' || currentLevel.gameplayData?.sorterData ? (
            <SorterEngine level={currentLevel} onLevelComplete={handleLevelComplete} />
          ) : activeConfig.template === 'sorter' ? (
            <SorterGame level={currentLevel} onLevelComplete={handleLevelComplete} />
          ) : activeConfig.template === 'sequencer' ? (
            <SequencerGame level={currentLevel} onLevelComplete={handleLevelComplete} />
          ) : activeConfig.template === 'quiz_tap' ? (
            <QuizTapGame level={currentLevel} onLevelComplete={handleLevelComplete} />
          ) : activeConfig.template === 'sentence_builder' ? (
            <SentenceBuilderGame level={currentLevel} onLevelComplete={handleLevelComplete} />
          ) : activeConfig.template === 'hotspot' ? (
            <HotspotGame level={currentLevel} onLevelComplete={handleLevelComplete} />
          ) : (
            <MatchingCardsGame level={currentLevel} onLevelComplete={handleLevelComplete} />
          )}
        </div>
      )}
    </div>
  );
};
