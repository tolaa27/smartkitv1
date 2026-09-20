// src/components/GameHub.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useEdTech } from '@/context/EdTechContext';
import { GeneratedGameConfig, UniversalEngineType } from '@/types/edtech';
import { ALL_42_GAMES, getGameEngineType } from '@/data/gameCatalog';
import { MOEYS_CURRICULUM_DATASET } from '@/data/moeysCurriculum';
import { CurriculumExercise } from '@/types/curriculum';
import { sound } from '@/utils/sound';
import { SpeakerButton } from '@/components/common/SpeakerButton';
import { SubjectFilterRail, SubjectFilterOption } from '@/components/SubjectFilterRail';
import { GameCard } from '@/components/GameCard';
import { MiniGameModal } from '@/components/MiniGameModal';
import {
  getStoredCustomGames,
  deleteStoredCustomGame,
  parseImportedGameJson,
  saveCustomGame,
} from '@/utils/customGames';
import {
  Sparkles,
  Star,
  Play,
  Award,
  Search,
  KeyRound,
  Download,
  Trash2,
  FolderInput,
  PlusCircle,
  X,
  Layers,
  Zap,
  CheckCircle2,
  GraduationCap,
  BookOpen,
} from 'lucide-react';

interface GameHubProps {
  onOpenStudio: () => void;
  onOpenPinModal: () => void;
  onSelectGame: (game: GeneratedGameConfig) => void;
  onOpenCurriculum?: () => void;
}

type HubViewMode = 'moeys' | 'engines' | 'custom';

export const GameHub: React.FC<GameHubProps> = ({
  onOpenStudio,
  onOpenPinModal,
  onSelectGame,
  onOpenCurriculum,
}) => {
  const {
    grade,
    student,
    setStudent,
    recordGameProgress,
  } = useEdTech();

  // State: Dynamic Subject Rail & View Tabs
  const [selectedSubject, setSelectedSubject] = useState<SubjectFilterOption>('all');
  const [viewMode, setViewMode] = useState<HubViewMode>('moeys');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Mini Game Modal State
  const [activeExercise, setActiveExercise] = useState<CurriculumExercise | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [completedExercises, setCompletedExercises] = useState<Record<string, { stars: number; score: number }>>({});

  // Custom & Procedural Games State
  const [customGames, setCustomGames] = useState<GeneratedGameConfig[]>([]);
  const [engineFilter, setEngineFilter] = useState<'all' | UniversalEngineType>('all');
  const [importMsg, setImportMsg] = useState<string | null>(null);

  // Load custom games
  useEffect(() => {
    setCustomGames(getStoredCustomGames());
  }, []);

  const refreshCustomGames = () => {
    setCustomGames(getStoredCustomGames());
  };

  // -------------------------------------------------------------------------
  // DYNAMIC LESSON COUNTS FOR SUBJECT RAIL (Real-time based on Grade)
  // -------------------------------------------------------------------------
  const lessonCounts = useMemo(() => {
    const counts: Record<SubjectFilterOption, number> = {
      all: 0,
      math: 0,
      khmer: 0,
      science: 0,
      social: 0,
    };

    MOEYS_CURRICULUM_DATASET.forEach(ex => {
      if (ex.grade === grade) {
        counts.all += 1;
        if (counts[ex.subject] !== undefined) {
          counts[ex.subject] += 1;
        }
      }
    });

    return counts;
  }, [grade]);

  // -------------------------------------------------------------------------
  // FILTERED MOEYS CURRICULUM LESSONS (Grade + Subject + Real-Time Search)
  // -------------------------------------------------------------------------
  const filteredExercises = useMemo(() => {
    return MOEYS_CURRICULUM_DATASET.filter(ex => {
      // 1. Grade Filter (Single source of truth from top bar)
      if (ex.grade !== grade) return false;

      // 2. Subject Filter
      if (selectedSubject !== 'all' && ex.subject !== selectedSubject) {
        return false;
      }

      // 3. Real-time Search Filter
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchKh = ex.questionKh.toLowerCase().includes(q);
        const matchLesson = ex.lessonKh.toLowerCase().includes(q);
        const matchEn = ex.questionEn?.toLowerCase().includes(q) || false;
        if (!matchKh && !matchLesson && !matchEn) return false;
      }

      return true;
    });
  }, [grade, selectedSubject, searchQuery]);

  // -------------------------------------------------------------------------
  // FILTERED PROCEDURAL 42 GAMES
  // -------------------------------------------------------------------------
  const filteredEngineGames = useMemo(() => {
    return ALL_42_GAMES.filter(g => {
      if (g.gradeLevel !== grade) return false;
      if (engineFilter !== 'all') {
        const engine = getGameEngineType(g);
        if (engine !== engineFilter) return false;
      }
      if (selectedSubject !== 'all' && g.subject !== selectedSubject) {
        return false;
      }
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchKh = g.titleKhmer.includes(q);
        const matchEn = g.titleEnglish?.toLowerCase().includes(q);
        if (!matchKh && !matchEn) return false;
      }
      return true;
    });
  }, [grade, engineFilter, selectedSubject, searchQuery]);

  // Handle Play Exercise in Modal
  const handlePlayExercise = (exercise: CurriculumExercise) => {
    setActiveExercise(exercise);
    setIsModalOpen(true);
  };

  // Handle Exercise Complete
  const handleExerciseComplete = async (
    exerciseId: string,
    isCorrect: boolean,
    score: number,
    stars: number
  ) => {
    setCompletedExercises(prev => ({
      ...prev,
      [exerciseId]: { stars, score },
    }));

    if (activeExercise) {
      await recordGameProgress(exerciseId, activeExercise.subject, score, stars);
    }
  };

  // Custom Game Actions
  const handleDeleteCustomGame = (idOrPin: string) => {
    sound.playPop();
    const updated = deleteStoredCustomGame(idOrPin);
    setCustomGames(updated);
  };

  const handleImportHubJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    sound.playPop();
    const reader = new FileReader();
    reader.onload = async event => {
      try {
        const text = event.target?.result as string;
        const parsed = parseImportedGameJson(text);
        await saveCustomGame(parsed);
        refreshCustomGames();
        setViewMode('custom');
        sound.playSuccessChime();
        setImportMsg(`បាននាំចូលហ្គេម «${parsed.titleKhmer}» ដោយជោគជ័យ!`);
        setTimeout(() => setImportMsg(null), 3500);
      } catch (err: any) {
        sound.playErrorThud();
        setImportMsg(err.message || 'មិនអាចអានឯកសារ JSON បានទេ');
        setTimeout(() => setImportMsg(null), 3500);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 space-y-8 bg-[#FFFDF7] min-h-screen">
      {/* ========================================================================= */}
      {/* 1. HERO BANNER: 3.5D Kid-Friendly Welcome & Daily Quest                   */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-amber-300 via-yellow-300 to-amber-400 p-6 sm:p-8 lg:p-10 border-4 border-amber-300 shadow-[0_16px_36px_rgba(245,158,11,0.22),inset_0_3px_0_rgba(255,255,255,0.7)] text-amber-950">
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-8 space-y-4 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-black text-amber-950 border border-white/80 shadow-xs">
              <Sparkles className="w-4 h-4 text-amber-600 animate-spin" style={{ animationDuration: '4s' }} />
              <span>កម្មវិធីសិក្សាជាតិ MoEYS • ថ្នាក់ទី {grade} (Grade {grade})</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black font-heading tracking-tight text-slate-900 font-khmer">
              សួស្តី {student.nickname}! តោះរៀនជាមួយ SmartKids
            </h1>

            <p className="text-sm sm:text-base font-bold text-amber-950/90 font-khmer max-w-xl">
              រៀនគណិតវិទ្យា ភាសាខ្មែរ វិទ្យាសាស្ត្រ និងសិក្សាសង្គម តាមរយៈល្បែងអប់រំ ៣.៥D សប្បាយៗ!
            </p>
          </div>

          <div className="lg:col-span-4 flex justify-center">
            <div className="w-28 h-28 sm:w-36 sm:h-36 bg-white/80 rounded-3xl p-3 border-3 border-amber-200 shadow-xl flex items-center justify-center text-6xl sm:text-7xl transform hover:scale-105 transition-transform">
              <span className="animate-bounce-gentle">🐘</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. DYNAMIC SUBJECT RAIL (Horizontal Cards with 3D Badges)                */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎯</span>
            <h2 className="text-lg sm:text-xl font-black font-heading text-slate-900 font-khmer">
              ជ្រើសរើសមុខវិជ្ជា (Select Subject)
            </h2>
          </div>

          <span className="text-xs font-bold text-slate-400 font-khmer">
            ថ្នាក់ទី {grade}
          </span>
        </div>

        {/* Unified Subject Rail */}
        <SubjectFilterRail
          selectedSubject={selectedSubject}
          onSelectSubject={sub => setSelectedSubject(sub)}
          lessonCounts={lessonCounts}
        />
      </div>

      {/* ========================================================================= */}
      {/* 3. SUB-BAR: Real-time Search Input & View Mode Switcher                  */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-3xl border-2 border-amber-200 shadow-xs">
        {/* Mode Switcher Pills */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => {
              sound.playPop();
              setViewMode('moeys');
            }}
            className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-black transition-all btn-squishy cursor-pointer ${
              viewMode === 'moeys'
                ? 'bg-emerald-500 text-white shadow-[0_4px_0_#047857]'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            📚 មេរៀន MoEYS ({filteredExercises.length})
          </button>

          <button
            type="button"
            onClick={() => {
              sound.playPop();
              setViewMode('engines');
            }}
            className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-black transition-all btn-squishy cursor-pointer ${
              viewMode === 'engines'
                ? 'bg-blue-600 text-white shadow-[0_4px_0_#1D4ED8]'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            🎮 ហ្គេម ៤២ ({filteredEngineGames.length})
          </button>

          <button
            type="button"
            onClick={() => {
              sound.playPop();
              setViewMode('custom');
            }}
            className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-black transition-all btn-squishy cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'custom'
                ? 'bg-purple-600 text-white shadow-[0_4px_0_#7E22CE]'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>ផ្ទាល់ខ្លួន ({customGames.length})</span>
          </button>
        </div>

        {/* Real-time Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-amber-700 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="ស្វែងរកហ្គេម និងមេរៀន..."
            className="w-full pl-9 pr-8 py-2.5 rounded-2xl border-2 border-amber-200 focus:border-amber-400 outline-none text-xs font-bold bg-[#FFFDF7] focus:bg-white transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. ACTIVITY GRID (MoEYS Curriculum / 42 Engines / Custom Games)           */}
      {/* ========================================================================= */}

      {/* VIEW 1: AUTHENTIC MOEYS CURRICULUM LESSONS */}
      {viewMode === 'moeys' && (
        <div className="space-y-6">
          {filteredExercises.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border-3 border-dashed border-amber-300 space-y-3">
              <div className="text-4xl">🔍</div>
              <h3 className="font-heading font-black text-slate-800 text-lg">
                មិនមានមេរៀនដែលត្រូវនឹងការស្វែងរកទេ
              </h3>
              <p className="text-xs text-slate-500 font-khmer">
                សូមសាកល្បងផ្លាស់ប្តូរពាក្យស្វែងរក ឬជ្រើសរើសមុខវិជ្ជាផ្សេងទៀត។
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedSubject('all');
                  setSearchQuery('');
                }}
                className="px-5 py-2 bg-amber-500 text-amber-950 font-black text-xs rounded-xl hover:bg-amber-600 transition"
              >
                បង្ហាញមេរៀនទាំងអស់
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredExercises.map(exercise => {
                const completion = completedExercises[exercise.id];
                return (
                  <GameCard
                    key={exercise.id}
                    exercise={exercise}
                    onPlay={ex => handlePlayExercise(ex)}
                    isCompleted={!!completion}
                    starsEarned={completion?.stars || 0}
                  />
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: 42 PROCEDURAL ENGINE GAMES */}
      {viewMode === 'engines' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEngineGames.map(game => (
              <div
                key={game.id}
                className="bg-white rounded-3xl p-6 border-3 border-blue-200/80 hover:border-blue-400 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black px-2.5 py-1 rounded-full bg-blue-100 text-blue-900 border border-blue-200">
                      {game.subject === 'math' ? 'គណិតវិទ្យា' : game.subject === 'science' ? 'វិទ្យាសាស្ត្រ' : 'ភាសាខ្មែរ'}
                    </span>
                    <span className="text-xs font-bold text-slate-400">
                      ថ្នាក់ទី {game.gradeLevel}
                    </span>
                  </div>

                  <h3 className="font-heading font-black text-slate-900 text-base sm:text-lg group-hover:text-blue-600 transition-colors font-khmer">
                    {game.titleKhmer}
                  </h3>

                  <p className="text-xs text-slate-500 font-khmer line-clamp-2">
                    {game.instructionsKhmer}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 font-mono">
                    Engine: {game.engineType || game.template}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      sound.playPop();
                      onSelectGame(game);
                    }}
                    className="min-h-[44px] px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:translate-y-1 text-white font-heading font-black text-sm rounded-2xl shadow-[0_5px_0_#1D4ED8] active:shadow-[0_2px_0_#1D4ED8] transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>លេងឥឡូវនេះ</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 3: CUSTOM GAMES & AI STUDIO IMPORTS */}
      {viewMode === 'custom' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-purple-50 p-4 rounded-3xl border-2 border-purple-200">
            <div>
              <h3 className="font-black text-purple-950 font-khmer text-base">
                ហ្គេមផ្ទាល់ខ្លួនរបស់សិស្ស និងលោកគ្រូ ({customGames.length})
              </h3>
              <p className="text-xs text-purple-800 font-medium">
                បង្កើតតាមរយៈ AI Studio ឬនាំចូលពីឯកសារ JSON
              </p>
            </div>

            <div className="flex items-center gap-2">
              <label className="px-4 py-2.5 rounded-2xl bg-white hover:bg-slate-50 border-2 border-purple-300 text-purple-900 font-black text-xs btn-squishy flex items-center gap-1.5 cursor-pointer shadow-xs">
                <FolderInput className="w-4 h-4 text-purple-600" />
                <span>នាំចូល JSON</span>
                <input
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={handleImportHubJson}
                />
              </label>

              <button
                type="button"
                onClick={onOpenStudio}
                className="px-4 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs btn-squishy flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>បង្កើតហ្គេមថ្មី</span>
              </button>
            </div>
          </div>

          {importMsg && (
            <div className="p-3 bg-emerald-100 text-emerald-950 rounded-2xl text-xs font-bold border border-emerald-300 animate-fade-in">
              {importMsg}
            </div>
          )}

          {customGames.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border-4 border-dashed border-purple-200 space-y-3">
              <div className="text-4xl">🎮</div>
              <h4 className="font-heading font-black text-purple-950 text-base">
                មិនទាន់មានហ្គេមផ្ទាល់ខ្លួននៅឡើយទេ
              </h4>
              <p className="text-xs text-slate-500 font-khmer max-w-md mx-auto">
                ចុចប៊ូតុងខាងលើដើម្បីបង្កើតហ្គេមដំបូងរបស់អ្នកដោយប្រើ AI Studio!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {customGames.map(game => (
                <div
                  key={game.id}
                  className="bg-white rounded-3xl p-6 border-3 border-purple-200 hover:border-purple-400 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-black text-purple-950 bg-purple-100 px-3 py-1 rounded-xl border border-purple-200">
                        {game.metadata?.classroomPin ? `PIN: ${game.metadata.classroomPin}` : 'ផ្ទាល់ខ្លួន'}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteCustomGame(game.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="លុបហ្គេមនេះ"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <h3 className="font-heading font-black text-slate-900 text-base sm:text-lg group-hover:text-purple-600 transition-colors font-khmer">
                      {game.titleKhmer}
                    </h3>
                    <p className="text-xs text-slate-500 font-khmer line-clamp-2">
                      {game.instructionsKhmer || game.levels?.[0]?.promptText}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-400">
                      ថ្នាក់ទី {game.gradeLevel || 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        sound.playPop();
                        onSelectGame(game);
                      }}
                      className="min-h-[44px] px-5 py-2.5 bg-purple-600 hover:bg-purple-700 active:translate-y-1 text-white font-heading font-black text-sm rounded-2xl shadow-[0_5px_0_#7E22CE] active:shadow-[0_2px_0_#7E22CE] transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <Play className="w-4 h-4 fill-white" />
                      <span>លេងឥឡូវនេះ</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. INTERACTIVE MINI-GAME MODAL RUNNER                                     */}
      {/* ========================================================================= */}
      <MiniGameModal
        exercise={activeExercise}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onComplete={handleExerciseComplete}
      />
    </div>
  );
};
