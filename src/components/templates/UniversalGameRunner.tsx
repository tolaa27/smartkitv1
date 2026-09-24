'use client';

import React, { useState, useEffect } from 'react';
import { GeneratedGameConfig } from '@/types/edtech';
import { useEdTech } from '@/context/EdTechContext';
import { sound } from '@/utils/sound';
import { generateProceduralGame } from '@/utils/proceduralEngine';
import { SpeakerButton } from '@/components/common/SpeakerButton';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Star,
  Volume2,
  Sparkles,
  RefreshCw,
  Trophy,
  BookOpen,
  Lightbulb,
  X,
  Play,
  FileText,
  CheckCircle2,
} from 'lucide-react';

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

  const [showHint, setShowHint] = useState<boolean>(false);
  const [activeHintText, setActiveHintText] = useState<string>('');

  // Lesson Material: introductory lesson before play & in-game reference
  const effectiveLessonMaterial = activeConfig.lessonMaterial || activeConfig.lesson_material;
  const hasLessonMaterial = Boolean(
    effectiveLessonMaterial &&
      (effectiveLessonMaterial.snippetBase64 ||
        effectiveLessonMaterial.lessonSummaryKhmer ||
        effectiveLessonMaterial.pdfUrl)
  );

  const [hasViewedIntro, setHasViewedIntro] = useState<boolean>(() => !hasLessonMaterial);
  const [showLessonModal, setShowLessonModal] = useState<boolean>(false);

  useEffect(() => {
    setActiveConfig(initialGameConfig);
    const mat = initialGameConfig.lessonMaterial || initialGameConfig.lesson_material;
    const hasMat = Boolean(mat && (mat.snippetBase64 || mat.lessonSummaryKhmer || mat.pdfUrl));
    setHasViewedIntro(!hasMat);
    setCurrentLevelIndex(0);
    setScore(0);
    setIsFinished(false);
    setShowHint(false);
    setShowLessonModal(false);
  }, [initialGameConfig]);

  const levels = activeConfig.levels || [];
  const currentLevel = levels[currentLevelIndex] || levels[0];

  // Oppia-style contextual pedagogical hint resolver
  const getAdaptiveHint = (): string => {
    const engine = activeConfig.engineType || activeConfig.template;
    if (engine === 'math_cra' || currentLevel?.gameplayData?.mathCraData) {
      return 'ជំនួយឆ្លាតវៃ៖ សាកល្បងរាប់ក្រដាសប្រាក់ម្តងមួយៗ ដោយចាប់ផ្តើមពីក្រដាសតម្លៃធំបំផុត (៥,០០០៛ ឬ ១,០០០៛) រួចទើបបន្ថែមក្រដាសតូច!';
    }
    if (engine === 'sandbox' || currentLevel?.gameplayData?.sandboxData) {
      return 'ជំនួយឆ្លាតវៃ៖ រុក្ខជាតិត្រូវការសំណើមទឹក និងកម្ដៅពន្លឺក្នុងកម្រិតសមស្រប (៦០-៨៥%) ដើម្បីដុះពន្លក និងលូតលាស់!';
    }
    if (engine === 'khmer_phonetics' || currentLevel?.gameplayData?.khmerPhoneticsData) {
      return 'ជំនួយឆ្លាតវៃ៖ សង្កេតជើងអក្សរ «ជើង រ (្រ)» ត្រូវនៅខាងក្រោមព្យញ្ជនៈដើម រួចទើបបន្ថែមស្រៈ!';
    }
    if (engine === 'sequencer' || currentLevel?.gameplayData?.sequencerData) {
      return 'ជំនួយឆ្លាតវៃ៖ ពិនិត្យមើលដំណាក់កាលទី ១៖ វដ្តជីវិតសត្វល្អិតតែងតែចាប់ផ្តើមពីពងតូចៗលើស្លឹកឈើ!';
    }
    if (engine === 'sorter' || currentLevel?.gameplayData?.sorterData) {
      return 'ជំនួយឆ្លាតវៃ៖ សំរាមសរីរាង្គ (សំបកចេក ស្លឹក) ដាក់ក្នុងធុងបៃតង, ប្លាស្ទិកដាក់ក្នុងធុងលឿង, ក្រដាសដាក់ក្នុងធុងខៀវ!';
    }
    return 'ជំនួយឆ្លាតវៃ៖ អានការណែនាំយឺតៗ និងសង្កេតរូបភាពដើម្បីជ្រើសរើសចម្លើយដែលត្រឹមត្រូវបំផុត!';
  };

  const handleTriggerSmartHint = () => {
    const hint = getAdaptiveHint();
    setActiveHintText(hint);
    setShowHint(true);
    sound.speakKhmer(hint);
    sound.playPop();
  };

  const handleLevelComplete = (scoreGain: number) => {
    const nextScore = score + scoreGain;
    setScore(nextScore);
    setShowHint(false);

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
    setShowHint(false);
    // Zero-repetition: generate fresh randomized round!
    const procedural = generateProceduralGame(activeConfig.id, activeConfig.gradeLevel || grade);
    if (procedural) {
      setActiveConfig(procedural);
    }
    setCurrentLevelIndex(0);
    setScore(0);
    setIsFinished(false);
  };

  // ==========================================================================
  // INTRODUCTORY LESSON SCREEN (Before Game Play)
  // ==========================================================================
  if (!hasViewedIntro && hasLessonMaterial && effectiveLessonMaterial) {
    return (
      <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6 animate-fade-in">
        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-3xl border-4 border-amber-300 shadow-md">
          <button
            onClick={() => {
              sound.playPop();
              onExit();
            }}
            className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-amber-100 hover:bg-amber-200 border-b-4 border-amber-300 active:border-b-0 active:translate-y-1 text-amber-950 font-bold transition-all text-sm cursor-pointer leading-[1.8]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>ថយក្រោយ</span>
          </button>

          <div className="text-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-indigo-100 text-indigo-900 border border-indigo-300 text-xs font-bold font-kantumruy mb-1">
              <BookOpen className="w-3.5 h-3.5 text-indigo-700" />
              <span>ស្វែងយល់មេរៀនមុននឹងលេង (Introductory Lesson)</span>
            </div>
            <h2 className="text-lg sm:text-2xl font-black font-heading text-amber-950 flex items-center justify-center gap-2 leading-[1.8]">
              <span>{effectiveLessonMaterial.lessonTitleKhmer || activeConfig.titleKhmer}</span>
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              {activeConfig.titleEnglish} • ថ្នាក់ទី {activeConfig.gradeLevel}
              {effectiveLessonMaterial.pageNumber && (
                <span className="ml-2 font-mono font-bold text-indigo-800 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md">
                  ទំព័រទី {effectiveLessonMaterial.pageNumber}
                </span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <SpeakerButton
              text={
                effectiveLessonMaterial.lessonSummaryKhmer ||
                activeConfig.instructionsKhmer ||
                activeConfig.titleKhmer
              }
              size="sm"
              title="ស្ដាប់មេរៀន"
            />
          </div>
        </div>

        {/* Main Lesson Showcase Card */}
        <div className="bg-white rounded-3xl p-5 sm:p-7 border-4 border-amber-300 shadow-xl space-y-6">
          {/* Elephant Mascot Chhouk Greeting Banner */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-4 flex items-center gap-3.5">
            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-300 border-2 border-amber-400 flex items-center justify-center text-2xl sm:text-3xl shrink-0 shadow-xs animate-playful-bounce">
              🐘
            </div>
            <div className="space-y-0.5">
              <h4 className="text-sm sm:text-base font-black text-amber-950 font-heading leading-[1.8]">
                ដំរីឆ្លាត ឈូក ស្វាគមន៍មកកាន់មេរៀន!
              </h4>
              <p className="text-xs sm:text-sm text-amber-900 font-medium font-kantumruy leading-[1.8]">
                សូមសង្កេត និងអានខ្លឹមសារមេរៀនខាងក្រោមនេះ ដើម្បីយល់ច្បាស់ មុនពេលយើងចាប់ផ្តើមលេងល្បែងឆ្លាត!
              </p>
            </div>
          </div>

          {/* Textbook Snippet Section (If cropped snippet or image is available) */}
          {effectiveLessonMaterial.snippetBase64 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5 leading-[1.8]">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  <span>រូបភាពស្រង់ចេញពីសៀវភៅពុម្ព MoEYS</span>
                </span>
                {effectiveLessonMaterial.pageNumber && (
                  <span className="text-[11px] font-mono font-bold bg-amber-100 text-amber-950 px-2 py-0.5 rounded-md">
                    ទំព័រទី {effectiveLessonMaterial.pageNumber}
                  </span>
                )}
              </div>
              <div className="rounded-2xl border-2 border-amber-200/90 bg-amber-50/30 p-2.5 sm:p-4 flex flex-col items-center justify-center shadow-inner overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={effectiveLessonMaterial.snippetBase64}
                  alt={effectiveLessonMaterial.lessonTitleKhmer || 'Lesson Snippet'}
                  className="w-full max-h-[360px] object-contain rounded-xl shadow-xs transition-transform hover:scale-[1.01]"
                />
              </div>
            </div>
          )}

          {/* Lesson Summary & Objectives */}
          {effectiveLessonMaterial.lessonSummaryKhmer && (
            <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/40 border-2 border-amber-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-950 uppercase tracking-wider flex items-center gap-1.5 leading-[1.8]">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>ខ្លឹមសារសង្ខេបនៃមេរៀន (Lesson Overview)</span>
                </span>
                <SpeakerButton text={effectiveLessonMaterial.lessonSummaryKhmer} size="sm" />
              </div>
              <p className="text-xs sm:text-sm text-slate-800 font-kantumruy leading-[1.9] whitespace-pre-line">
                {effectiveLessonMaterial.lessonSummaryKhmer}
              </p>
            </div>
          )}

          {/* Game Instructions Reminder */}
          {activeConfig.instructionsKhmer && (
            <div className="p-3.5 sm:p-4 rounded-2xl bg-emerald-50/60 border-2 border-emerald-200/80 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-1 shrink-0" />
              <div>
                <span className="text-xs font-bold text-emerald-950 block leading-[1.8]">
                  របៀបលេងល្បែងឆ្លាត៖
                </span>
                <p className="text-xs text-emerald-900 font-kantumruy leading-[1.8]">
                  {activeConfig.instructionsKhmer}
                </p>
              </div>
            </div>
          )}

          {/* Tactile 3D Start Game CTA Button */}
          <div className="pt-2 flex justify-center">
            <button
              type="button"
              onClick={() => {
                sound.playPop();
                sound.playSuccess();
                setHasViewedIntro(true);
              }}
              className="w-full sm:w-auto px-8 sm:px-12 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-300 hover:to-orange-400 border-b-4 border-amber-700 active:border-b-0 active:translate-y-1 text-white font-black text-sm sm:text-base shadow-lg cursor-pointer flex items-center justify-center gap-2.5 transition-all leading-[1.8] select-none"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>យល់ហើយ! ចាប់ផ្តើមលេងល្បែង (Start Game)</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================================
  // GAME RUNNER & ACTIVE PLAY STAGE
  // ==========================================================================
  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-3xl border-2 border-amber-200/90 shadow-2xs">
        <button
          onClick={() => {
            sound.playPop();
            onExit();
          }}
          className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-amber-50 hover:bg-amber-100 border-2 border-amber-200 text-amber-950 font-bold transition-all text-xs sm:text-sm cursor-pointer leading-[1.8] shadow-2xs active:translate-y-[2px]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>ថយក្រោយ</span>
        </button>

        <div className="text-center">
          <h2 className="text-base sm:text-xl font-black font-heading text-slate-900 flex items-center justify-center gap-2 leading-[1.8]">
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
          {/* View Lesson Reference Button (During Gameplay) */}
          {hasLessonMaterial && (
            <button
              onClick={() => {
                sound.playPop();
                setShowLessonModal(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-indigo-50 hover:bg-indigo-100 border-2 border-indigo-200 text-indigo-950 font-black text-xs transition-all cursor-pointer leading-[1.8] shadow-2xs active:translate-y-[2px]"
              title="មើលមេរៀនដើម (View Lesson Reference)"
            >
              <BookOpen className="w-4 h-4 text-indigo-600" />
              <span className="hidden sm:inline">មើលមេរៀន</span>
            </button>
          )}

          {/* Adaptive Pedagogical Hint Button (Oppia pattern) */}
          <button
            onClick={handleTriggerSmartHint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-amber-100 hover:bg-amber-200 border-2 border-amber-300 text-amber-950 font-black text-xs transition-all cursor-pointer leading-[1.8] shadow-2xs active:translate-y-[2px]"
            title="ជំនួយឆ្លាតវៃ (Oppia Adaptive Hint)"
          >
            <Lightbulb className="w-4 h-4 text-amber-600 animate-bounce-gentle" />
            <span className="hidden sm:inline">ជំនួយឆ្លាតវៃ</span>
          </button>

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

      {/* Oppia-Style Adaptive Guided Hint Banner */}
      <AnimatePresence>
        {showHint && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            className="bg-amber-50/95 border-2 border-amber-300 rounded-3xl p-4 shadow-2xs flex items-start gap-3 relative overflow-hidden"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-300 border-2 border-amber-400 flex items-center justify-center text-xl shrink-0 shadow-2xs">
              🐘
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-amber-950 font-heading flex items-center gap-1.5 leading-[1.8]">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>ដំរីឆ្លាត ឈូក ណែនាំ (Smart Hint)៖</span>
                </span>
                <button
                  onClick={() => setShowHint(false)}
                  className="text-amber-800 hover:text-amber-950 p-1 cursor-pointer"
                  title="បិទជំនួយ"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs font-bold text-amber-900 font-kantumruy leading-[1.8]">
                {activeHintText}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isFinished ? (
        /* Game Completion Celebration Screen */
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-amber-300 text-center shadow-xl space-y-6 animate-fade-in">
          <div className="w-20 h-20 mx-auto bg-amber-100 rounded-full flex items-center justify-center text-4xl shadow-inner border-2 border-amber-300 animate-bounce">
            🏆
          </div>
          <div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-amber-950 font-heading leading-[1.8]">
              អបអរសាទរ! ប្អូនឆ្លាតណាស់!
            </h3>
            <p className="text-slate-600 mt-1 max-w-md mx-auto font-khmer leading-[1.8]">
              បានបញ្ចប់ល្បែងកម្សាន្ត «{activeConfig.titleKhmer}» ដោយជោគជ័យ!
            </p>
          </div>

          <div className="flex justify-center gap-3">
            {[1, 2, 3].map(st => (
              <Star
                key={st}
                className="w-10 h-10 sm:w-12 sm:h-12 fill-amber-400 text-amber-500 scale-110 drop-shadow-md"
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

          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <button
              onClick={handleRestart}
              className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 border-b-4 border-emerald-700 active:border-b-0 active:translate-y-1 text-white font-black text-sm sm:text-base shadow-sm flex items-center gap-2 cursor-pointer leading-[1.8] transition-all"
            >
              <RefreshCw className="w-5 h-5" />
              <span>លេងម្ដងទៀត</span>
            </button>
            <button
              onClick={onExit}
              className="px-6 py-3 rounded-2xl bg-amber-100 hover:bg-amber-200 border-2 border-amber-300 text-amber-950 font-black text-sm sm:text-base shadow-2xs active:translate-y-[2px] cursor-pointer leading-[1.8] transition-all"
            >
              ទំព័រដើម
            </button>
          </div>
        </div>
      ) : (
        /* Mechanics Engine Router */
        <div className="space-y-4">
          {activeConfig.engineType === 'sandbox' || activeConfig.template === 'sandbox' || currentLevel.gameplayData?.sandboxData ? (
            <SandboxEngine key={`${activeConfig.id}-lvl-${currentLevelIndex}`} level={currentLevel} onLevelComplete={handleLevelComplete} />
          ) : activeConfig.engineType === 'math_cra' || activeConfig.template === 'math_cra' || currentLevel.gameplayData?.mathCraData ? (
            <MathCraEngine key={`${activeConfig.id}-lvl-${currentLevelIndex}`} level={currentLevel} onLevelComplete={handleLevelComplete} />
          ) : activeConfig.engineType === 'khmer_phonetics' || activeConfig.template === 'khmer_phonetics' || currentLevel.gameplayData?.khmerPhoneticsData ? (
            <KhmerPhoneticsEngine key={`${activeConfig.id}-lvl-${currentLevelIndex}`} level={currentLevel} onLevelComplete={handleLevelComplete} />
          ) : activeConfig.engineType === 'sequencer' || currentLevel.gameplayData?.sequencerData ? (
            <SequencerEngine key={`${activeConfig.id}-lvl-${currentLevelIndex}`} level={currentLevel} onLevelComplete={handleLevelComplete} />
          ) : activeConfig.engineType === 'sorter' || currentLevel.gameplayData?.sorterData ? (
            <SorterEngine key={`${activeConfig.id}-lvl-${currentLevelIndex}`} level={currentLevel} onLevelComplete={handleLevelComplete} />
          ) : activeConfig.template === 'sorter' ? (
            <SorterGame key={`${activeConfig.id}-lvl-${currentLevelIndex}`} level={currentLevel} onLevelComplete={handleLevelComplete} />
          ) : activeConfig.template === 'sequencer' ? (
            <SequencerGame key={`${activeConfig.id}-lvl-${currentLevelIndex}`} level={currentLevel} onLevelComplete={handleLevelComplete} />
          ) : activeConfig.template === 'quiz_tap' ? (
            <QuizTapGame key={`${activeConfig.id}-lvl-${currentLevelIndex}`} level={currentLevel} onLevelComplete={handleLevelComplete} />
          ) : activeConfig.template === 'sentence_builder' ? (
            <SentenceBuilderGame key={`${activeConfig.id}-lvl-${currentLevelIndex}`} level={currentLevel} onLevelComplete={handleLevelComplete} />
          ) : activeConfig.template === 'hotspot' ? (
            <HotspotGame key={`${activeConfig.id}-lvl-${currentLevelIndex}`} level={currentLevel} onLevelComplete={handleLevelComplete} />
          ) : (
            <MatchingCardsGame key={`${activeConfig.id}-lvl-${currentLevelIndex}`} level={currentLevel} onLevelComplete={handleLevelComplete} />
          )}
        </div>
      )}

      {/* In-Game Lesson Reference Modal (Accessible anytime during gameplay) */}
      <AnimatePresence>
        {showLessonModal && effectiveLessonMaterial && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="bg-[#FFFDF7] w-full max-w-3xl rounded-3xl shadow-2xl border-4 border-amber-300 overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Top Bar */}
              <div className="px-5 py-3.5 border-b-2 border-amber-200 flex items-center justify-between bg-white">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-black text-amber-950 font-heading leading-[1.8]">
                      {effectiveLessonMaterial.lessonTitleKhmer || activeConfig.titleKhmer}
                    </h3>
                    <p className="text-[11px] text-slate-500 font-mono">
                      ឯកសារយោងមេរៀន MoEYS
                      {effectiveLessonMaterial.pageNumber && ` • ទំព័រទី ${effectiveLessonMaterial.pageNumber}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <SpeakerButton
                    text={effectiveLessonMaterial.lessonSummaryKhmer || activeConfig.instructionsKhmer}
                    size="sm"
                  />
                  <button
                    onClick={() => setShowLessonModal(false)}
                    className="p-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 transition cursor-pointer"
                    title="បិទ"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
                {effectiveLessonMaterial.snippetBase64 && (
                  <div className="rounded-2xl border-2 border-amber-200 bg-white p-3 shadow-inner flex flex-col items-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={effectiveLessonMaterial.snippetBase64}
                      alt={effectiveLessonMaterial.lessonTitleKhmer || 'Lesson Snippet'}
                      className="w-full max-h-[380px] object-contain rounded-xl"
                    />
                  </div>
                )}

                {effectiveLessonMaterial.lessonSummaryKhmer && (
                  <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200">
                    <h4 className="text-xs font-bold text-amber-950 mb-1 leading-[1.8]">
                      ខ្លឹមសារមេរៀន៖
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-800 font-kantumruy leading-[1.9] whitespace-pre-line">
                      {effectiveLessonMaterial.lessonSummaryKhmer}
                    </p>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="px-5 py-3 border-t-2 border-amber-200 bg-white flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    sound.playPop();
                    setShowLessonModal(false);
                  }}
                  className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 border-b-4 border-amber-600 active:border-b-0 active:translate-y-1 text-white font-bold text-xs shadow-md transition-all cursor-pointer leading-[1.8]"
                >
                  ត្រឡប់ទៅលេងបន្ត (Back to Game)
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
