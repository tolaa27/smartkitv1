// src/components/curriculum/MoEYSCurriculumApp.tsx
'use client';

import React, { useState, useMemo } from 'react';
import { Grade, Subject, CurriculumExercise } from '@/types/curriculum';
import { MOEYS_CURRICULUM_DATASET } from '@/data/moeysCurriculum';
import { DashboardHeader } from './DashboardHeader';
import { ExerciseRenderer } from './ExerciseRenderer';
import { ScoreCelebrationModal } from './ScoreCelebrationModal';
import { useEdTech } from '@/context/EdTechContext';
import { sound } from '@/utils/sound';
import { Sparkles, ArrowLeft, ArrowRight, Award, CheckCircle2, RotateCcw } from 'lucide-react';

interface Props {
  onExit: () => void;
}

export const MoEYSCurriculumApp: React.FC<Props> = ({ onExit }) => {
  const { student, setStudent, soundMuted, toggleMute } = useEdTech();

  const [selectedGrade, setSelectedGrade] = useState<Grade>(1);
  const [selectedSubject, setSelectedSubject] = useState<Subject>('math');
  const [exerciseIndex, setExerciseIndex] = useState<number>(0);
  const [completedMap, setCompletedMap] = useState<Record<string, boolean>>({});

  // Celebration modal state
  const [celebrationModalOpen, setCelebrationModalOpen] = useState<boolean>(false);
  const [lastEarnedScore, setLastEarnedScore] = useState<number>(50);
  const [lastEarnedStars, setLastEarnedStars] = useState<number>(3);

  // Filter exercises by current Grade & Subject
  const currentExercises = useMemo(() => {
    return MOEYS_CURRICULUM_DATASET.filter(
      ex => ex.grade === selectedGrade && ex.subject === selectedSubject
    );
  }, [selectedGrade, selectedSubject]);

  // Current active exercise
  const currentExercise: CurriculumExercise | undefined = currentExercises[exerciseIndex];

  const handleSelectGrade = (g: Grade) => {
    setSelectedGrade(g);
    setExerciseIndex(0);
  };

  const handleSelectSubject = (s: Subject) => {
    setSelectedSubject(s);
    setExerciseIndex(0);
  };

  const handleExerciseComplete = (isCorrect: boolean, score: number, stars: number) => {
    if (!currentExercise) return;

    setLastEarnedScore(score);
    setLastEarnedStars(stars);

    if (isCorrect) {
      setCompletedMap(prev => ({ ...prev, [currentExercise.id]: true }));

      // Update student persistent stats
      setStudent(prev => {
        const updated = {
          ...prev,
          totalStars: (prev.totalStars || 0) + stars,
          totalScore: (prev.totalScore || 0) + score,
          totalGems: (prev.totalGems || prev.totalScore || 0) + score,
        };
        try {
          localStorage.setItem('smartkids_student', JSON.stringify(updated));
        } catch {}
        return updated;
      });

      setCelebrationModalOpen(true);
    }
  };

  const handleNextExercise = () => {
    setCelebrationModalOpen(false);
    if (exerciseIndex < currentExercises.length - 1) {
      setExerciseIndex(prev => prev + 1);
    } else {
      // Reached the end of this subject
      sound.playSuccessChime();
    }
  };

  const handlePrevExercise = () => {
    if (exerciseIndex > 0) {
      sound.playPop();
      setExerciseIndex(prev => prev - 1);
    }
  };

  const completedCount = currentExercises.filter(ex => completedMap[ex.id]).length;
  const allFinished = currentExercises.length > 0 && completedCount === currentExercises.length;

  return (
    <div className="min-h-screen bg-[#FFFDF7] flex flex-col">
      {/* 1. Dashboard Header */}
      <DashboardHeader
        selectedGrade={selectedGrade}
        onSelectGrade={handleSelectGrade}
        selectedSubject={selectedSubject}
        onSelectSubject={handleSelectSubject}
        totalStars={student.totalStars || 95}
        totalGems={student.totalGems || student.totalScore || 7037}
        soundMuted={soundMuted}
        onToggleSound={toggleMute}
        onExit={onExit}
      />

      {/* 2. Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 space-y-8">
        {/* Subject Progress Banner */}
        <div className="bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-200 p-4 sm:p-5 rounded-3xl border-2 border-amber-300 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white border-2 border-amber-300 flex items-center justify-center text-2xl shadow-inner">
              📚
            </div>
            <div>
              <h2 className="font-heading text-lg sm:text-xl font-black text-amber-950">
                វិញ្ញាសាកម្មវិធីសិក្សាជាតិ MoEYS (ថ្នាក់ទី {selectedGrade})
              </h2>
              <p className="text-xs font-bold text-amber-800 font-khmer">
                លំហាត់ស្តង់ដារតាមសៀវភៅគោលក្រសួងអប់រំ យុវជន និងកីឡា
              </p>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-2xl border border-amber-300">
            <div className="text-right">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
                វឌ្ឍនភាពមេរៀន
              </span>
              <span className="font-heading text-sm font-black text-amber-950">
                {completedCount} / {currentExercises.length} បានឆ្លើយរួច
              </span>
            </div>
            <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800 font-black text-xs">
              {Math.round((completedCount / (currentExercises.length || 1)) * 100)}%
            </div>
          </div>
        </div>

        {/* 3. Exercise Renderer or Completion Card */}
        {allFinished && exerciseIndex >= currentExercises.length - 1 ? (
          <div className="max-w-2xl mx-auto clay-card p-8 sm:p-12 text-center space-y-6 border-4 border-amber-300">
            <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-tr from-amber-400 to-yellow-300 border-4 border-amber-400 flex items-center justify-center text-5xl shadow-lg animate-playful-bounce">
              🎓
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl sm:text-3xl font-black font-heading text-amber-950">
                អបអរសាទរ! ប្អូនបានបញ្ចប់លំហាត់ទាំងអស់ក្នុងមេរៀននេះហើយ!
              </h3>
              <p className="text-xs sm:text-sm font-bold text-slate-600 font-khmer max-w-md mx-auto">
                ប្អូនបានឆ្លើយលំហាត់ MoEYS ទាំងអស់ក្នុងមុខវិជ្ជានេះដោយជោគជ័យ។ ចូរជ្រើសរើសមុខវិជ្ជាបន្ទាប់ ឬលេងឡើងវិញ!
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-3 pt-4">
              <button
                onClick={() => {
                  sound.playPop();
                  setExerciseIndex(0);
                }}
                className="px-6 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-sm flex items-center gap-2 border border-slate-300"
              >
                <RotateCcw className="w-4 h-4" />
                <span>លេងឡើងវិញ (Replay)</span>
              </button>

              <button
                onClick={() => {
                  sound.playPop();
                  onExit();
                }}
                className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-sm sm:text-base btn-squishy flex items-center gap-2 shadow-md"
              >
                <span>ត្រឡប់ទៅទំព័រដើម (Back to Hub)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : currentExercise ? (
          <div className="space-y-6">
            <ExerciseRenderer
              key={currentExercise.id}
              exercise={currentExercise}
              currentIndex={exerciseIndex}
              totalCount={currentExercises.length}
              onComplete={handleExerciseComplete}
            />

            {/* Bottom Nav Controls (Previous / Skip / Next) */}
            <div className="max-w-3xl mx-auto flex items-center justify-between gap-4 pt-2">
              <button
                onClick={handlePrevExercise}
                disabled={exerciseIndex === 0}
                className={`px-4 py-2.5 rounded-2xl font-black text-xs sm:text-sm flex items-center gap-1.5 transition-all ${
                  exerciseIndex === 0
                    ? 'opacity-40 cursor-not-allowed bg-slate-100 text-slate-400'
                    : 'bg-white hover:bg-amber-50 text-amber-950 border-2 border-amber-200 shadow-xs'
                }`}
              >
                <ArrowLeft className="w-4 h-4" />
                <span>លំហាត់មុន</span>
              </button>

              <div className="flex items-center gap-1.5">
                {currentExercises.map((ex, idx) => (
                  <button
                    key={ex.id}
                    onClick={() => {
                      sound.playPop();
                      setExerciseIndex(idx);
                    }}
                    className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full transition-all ${
                      idx === exerciseIndex
                        ? 'bg-amber-500 scale-125 ring-2 ring-amber-300'
                        : completedMap[ex.id]
                        ? 'bg-emerald-500'
                        : 'bg-slate-200'
                    }`}
                    title={`លំហាត់ទី ${idx + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={() => {
                  sound.playPop();
                  if (exerciseIndex < currentExercises.length - 1) {
                    setExerciseIndex(prev => prev + 1);
                  }
                }}
                disabled={exerciseIndex >= currentExercises.length - 1}
                className={`px-4 py-2.5 rounded-2xl font-black text-xs sm:text-sm flex items-center gap-1.5 transition-all ${
                  exerciseIndex >= currentExercises.length - 1
                    ? 'opacity-40 cursor-not-allowed bg-slate-100 text-slate-400'
                    : 'bg-white hover:bg-amber-50 text-amber-950 border-2 border-amber-200 shadow-xs'
                }`}
              >
                <span>រំលង / បន្ទាប់</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-slate-500 font-khmer">
            មិនទាន់មានលំហាត់សម្រាប់មុខវិជ្ជានេះនៅឡើយទេ។
          </div>
        )}
      </main>

      {/* 4. Score Celebration Modal */}
      <ScoreCelebrationModal
        isOpen={celebrationModalOpen}
        score={lastEarnedScore}
        stars={lastEarnedStars}
        totalExercises={currentExercises.length}
        completedCount={completedCount}
        onNext={handleNextExercise}
      />
    </div>
  );
};
