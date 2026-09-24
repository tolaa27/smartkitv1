// src/app/student/dashboard/page.tsx
'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Sparkles,
  Star,
  LogOut,
  Volume2,
  VolumeX,
  BookOpen,
  ArrowLeft,
  Flame,
} from 'lucide-react';
import { useEdTech } from '@/context/EdTechContext';
import { sound } from '@/utils/sound';
import { SupabaseService } from '@/lib/supabase/service';
import { Grade, Document } from '@/lib/supabase/types';
import { StudentStickyNavPill, StudentNavTab } from '@/components/student/StudentStickyNavPill';
import { GradeIsolatedDocumentFeed } from '@/components/student/GradeIsolatedDocumentFeed';
import { MOEYS_CURRICULUM_DATASET } from '@/data/moeysCurriculum';
import { ALL_42_GAMES } from '@/data/gameCatalog';
import { UniversalGameRunner } from '@/components/templates/UniversalGameRunner';
import { GeneratedGameConfig } from '@/types/edtech';
import { MoEYSCurriculumApp } from '@/components/curriculum/MoEYSCurriculumApp';

function StudentDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { student, grade, soundMuted, toggleMute, logout } = useEdTech();

  // Active navigation tab (Synced with ?tab= query parameter, default: 'class_docs')
  const tabFromQuery = searchParams.get('tab') as StudentNavTab | null;
  const validTabs: StudentNavTab[] = ['moeys', 'class_docs', 'games', 'custom'];
  const initialTab: StudentNavTab =
    tabFromQuery && validTabs.includes(tabFromQuery) ? tabFromQuery : 'class_docs';

  const [activeTab, setActiveTab] = useState<StudentNavTab>(initialTab);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Classroom & Grade states
  const [grades, setGrades] = useState<Grade[]>([]);
  const [classDocs, setClassDocs] = useState<Document[]>([]);
  const [activeGradeId, setActiveGradeId] = useState<string>('22222222-2222-2222-2222-222222222222'); // Default Grade 1
  const [activeGradeName, setActiveGradeName] = useState<string>('ថ្នាក់ទី ១');

  // Interactive Game runner state
  const [runningGame, setRunningGame] = useState<GeneratedGameConfig | null>(null);
  // Full MoEYS interactive curriculum view toggle
  const [fullCurriculumOpen, setFullCurriculumOpen] = useState<boolean>(false);

  // Sync tab state if URL search query changes
  useEffect(() => {
    const tabParam = searchParams.get('tab') as StudentNavTab | null;
    if (tabParam && validTabs.includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  // Handle Tab Switch without full route reloads (preserves student portal context)
  const handleTabChange = (tab: StudentNavTab) => {
    setActiveTab(tab);
    setRunningGame(null);
    setFullCurriculumOpen(false);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', tab);
      window.history.replaceState(null, '', url.pathname + url.search);
    }
  };

  // Initialize student grade and load class documents
  useEffect(() => {
    async function init() {
      try {
        const loadedGrades = await SupabaseService.getGrades();
        setGrades(loadedGrades);

        // Read student session cookie if present
        let studentGradeId = '22222222-2222-2222-2222-222222222222';
        if (typeof document !== 'undefined') {
          const match = document.cookie.match(/smartkids_grade_id=([^;]+)/);
          if (match && match[1]) {
            studentGradeId = decodeURIComponent(match[1]);
          }
        }

        const matchedGrade = loadedGrades.find(
          (g) => g.id === studentGradeId || g.name.includes(`ថ្នាក់ទី ${grade}`)
        );

        const finalGradeId = matchedGrade ? matchedGrade.id : studentGradeId;
        setActiveGradeId(finalGradeId);
        setActiveGradeName(matchedGrade ? matchedGrade.name : `ថ្នាក់ទី ${grade}`);

        const docs = await SupabaseService.getDocuments(finalGradeId, 'all', 12);
        setClassDocs(docs);
      } catch (err) {
        console.warn('[StudentDashboard] Init error:', err);
      }
    }

    init();
  }, [grade]);

  // Handle logout / switch user
  const handleLogout = () => {
    sound.playPop();
    logout();
    if (typeof document !== 'undefined') {
      document.cookie = 'smartkids_user_role=; path=/; max-age=0; SameSite=Lax';
      document.cookie = 'smartkids_role=; path=/; max-age=0; SameSite=Lax';
      document.cookie = 'smartkids_student_session=; path=/; max-age=0; SameSite=Lax';
      document.cookie = 'smartkids_student_id=; path=/; max-age=0; SameSite=Lax';
      document.cookie = 'smartkids_grade_id=; path=/; max-age=0; SameSite=Lax';
    }
    router.push('/login/student');
  };

  // MoEYS lessons filtered
  const filteredMoeysLessons = MOEYS_CURRICULUM_DATASET.filter((lesson) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (lesson.lessonKh && lesson.lessonKh.toLowerCase().includes(q)) ||
      (lesson.questionKh && lesson.questionKh.toLowerCase().includes(q)) ||
      (lesson.subject && lesson.subject.toLowerCase().includes(q))
    );
  });

  // Educational games filtered
  const filteredGames = ALL_42_GAMES.filter((g) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (g.titleKhmer && g.titleKhmer.toLowerCase().includes(q)) ||
      (g.titleEnglish && g.titleEnglish.toLowerCase().includes(q)) ||
      (g.instructionsKhmer && g.instructionsKhmer.toLowerCase().includes(q))
    );
  });

  return (
    <div
      style={{ fontFamily: "'Kantumruy Pro', 'Noto Sans Khmer', system-ui, sans-serif" }}
      className="min-h-screen bg-[#FBF9F4] text-slate-800 flex flex-col"
    >
      {/* -------------------------------------------------------------------- */}
      {/* 1. TOP BRAND & STUDENT STATUS BAR                                   */}
      {/* -------------------------------------------------------------------- */}
      <header className="w-full bg-white/80 border-b border-amber-200/60 px-4 sm:px-6 py-2.5 backdrop-blur-xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          {/* Logo & Brand: Explicitly routes to /student (staying inside student portal) */}
          <Link
            href="/student"
            onClick={() => {
              sound.playPop();
              handleTabChange('class_docs');
            }}
            className="flex items-center gap-3 group cursor-pointer select-none focus-visible:outline-none"
            title="មជ្ឈមណ្ឌលសិស្ស SmartKids"
          >
            <div className="w-10 h-10 rounded-2xl bg-linear-to-tr from-amber-400 via-amber-500 to-yellow-400 border border-amber-300 shadow-xs flex items-center justify-center text-2xl group-hover:scale-105 transition-transform">
              🎒
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm sm:text-base text-slate-900 leading-tight group-hover:text-amber-600 transition-colors">
                  កុមារឆ្លាត (SmartKids)
                </span>
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold border border-amber-200/80">
                  {activeGradeName}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                ថ្នាក់រៀនអន្តរកម្ម MoEYS សម្រាប់កុមារកម្ពុជា
              </p>
            </div>
          </Link>

          {/* Student Avatar & Rewards */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Stars & Points */}
            <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200/80 px-2.5 py-1 rounded-full text-xs font-bold text-amber-900 shadow-2xs">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>{student?.totalStars ?? 120} ពិន្ទុ</span>
            </div>

            <div className="hidden sm:flex items-center gap-1.5 bg-orange-50 border border-orange-200/80 px-2.5 py-1 rounded-full text-xs font-bold text-orange-900 shadow-2xs">
              <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
              <span>៣ ថ្ងៃជាប់គ្នា</span>
            </div>

            {/* Sound Toggle */}
            <button
              type="button"
              onClick={toggleMute}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
              title={soundMuted ? 'បើកសំឡេង' : 'បិទសំឡេង'}
            >
              {soundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* Student Profile Card */}
            <div className="flex items-center gap-2 pl-1 border-l border-slate-200">
              <div className="w-9 h-9 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-xl shadow-2xs overflow-hidden">
                {student?.avatarId?.startsWith('http') ? (
                  <img
                    src={student.avatarId}
                    alt={student.nickname}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{student?.avatarId || '👧'}</span>
                )}
              </div>
              <div className="hidden md:block text-left">
                <span className="text-xs font-bold text-slate-900 block leading-tight">
                  {student?.nickname || 'កូនសិស្សឆ្លាត'}
                </span>
                <span className="text-[10px] text-slate-500 block">សិស្ស</span>
              </div>
            </div>

            {/* Logout / Switch Account */}
            <button
              type="button"
              onClick={handleLogout}
              className="p-2 rounded-xl border border-slate-200 hover:bg-rose-50 hover:text-rose-700 text-slate-500 transition-colors cursor-pointer"
              title="ប្តូរគណនី / ចាកចេញ"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* -------------------------------------------------------------------- */}
      {/* 2. STICKY KID-FRIENDLY NAVIGATION PILL                               */}
      {/* -------------------------------------------------------------------- */}
      <StudentStickyNavPill
        activeTab={activeTab}
        onTabChange={handleTabChange}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        moeysCount={filteredMoeysLessons.length}
        classDocsCount={classDocs.length}
        gamesCount={filteredGames.length}
        customCount={0}
      />

      {/* -------------------------------------------------------------------- */}
      {/* 3. DYNAMIC CONTENT AREA BASED ON ACTIVE TAB                          */}
      {/* -------------------------------------------------------------------- */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6">
        {/* TAB 1: 📄📑 ឯកសារថ្នាក់រៀន (Preserved DOM state for instant 0ms tab switching) */}
        <div className={activeTab === 'class_docs' ? 'block' : 'hidden'}>
          <GradeIsolatedDocumentFeed
            gradeId={activeGradeId}
            gradeName={activeGradeName}
            searchQuery={searchQuery}
          />
        </div>

        {/* TAB 2: 📚 មេរៀន MoEYS */}
        {activeTab === 'moeys' && (
          <div className="space-y-6 animate-fade-in">
            {fullCurriculumOpen ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      sound.playPop();
                      setFullCurriculumOpen(false);
                    }}
                    className="inline-flex items-center gap-1.5 py-2 px-4 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>ត្រឡប់ទៅបញ្ជីមេរៀន MoEYS វិញ</span>
                  </button>
                </div>
                <MoEYSCurriculumApp onExit={() => setFullCurriculumOpen(false)} />
              </div>
            ) : runningGame ? (
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={() => {
                    sound.playPop();
                    setRunningGame(null);
                  }}
                  className="inline-flex items-center gap-1.5 py-2 px-4 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>ត្រឡប់ទៅបញ្ជីមេរៀន MoEYS វិញ</span>
                </button>
                <div className="bg-white rounded-3xl border-2 border-amber-300 p-4 sm:p-6 shadow-md">
                  <UniversalGameRunner
                    gameConfig={runningGame}
                    onExit={() => {
                      sound.playSuccessChime();
                      setRunningGame(null);
                    }}
                  />
                </div>
              </div>
            ) : (
              <>
                <div className="bg-white rounded-3xl border border-amber-200/80 p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
                      <span>📚</span>
                      <span>កម្មវិធីសិក្សាជាតិ MoEYS ៖ {activeGradeName}</span>
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      មេរៀនស្របតាមសៀវភៅពុម្ពក្រសួងអប់រំ យុវជន និងកីឡា
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      sound.playPop();
                      setFullCurriculumOpen(true);
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-linear-to-r from-emerald-500 to-teal-600 text-white text-xs font-bold shadow-xs hover:from-emerald-600 hover:to-teal-700 transition cursor-pointer select-none"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>លំហាត់អន្តរកម្ម MoEYS ពេញលេញ</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredMoeysLessons.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-3xl border-2 border-slate-200/80 hover:border-amber-400 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold">
                            {item.subject === 'khmer'
                              ? 'ភាសាខ្មែរ'
                              : item.subject === 'math'
                              ? 'គណិតវិទ្យា'
                              : 'វិទ្យាសាស្ត្រ'}
                          </span>
                          <span className="text-xs text-slate-400 font-mono">
                            {item.grade === 1 ? 'ថ្នាក់ទី១' : `ថ្នាក់ទី${item.grade}`}
                          </span>
                        </div>

                        <h3 className="font-bold text-base text-slate-900 leading-snug">
                          {item.lessonKh}
                        </h3>
                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                          {item.questionKh}
                        </p>
                      </div>

                      <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-xs font-semibold text-amber-700 flex items-center gap-1">
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>{item.type}</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            sound.playPop();
                            const matchingGame =
                              ALL_42_GAMES.find((g) => g.id === item.id) || ALL_42_GAMES[0];
                            setRunningGame(matchingGame);
                          }}
                          className="py-1.5 px-3.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs transition-colors shadow-2xs cursor-pointer active:scale-95"
                        >
                          រៀន និងលេង
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* TAB 3: 🎮 ហ្គេម ៤២ (7) */}
        {activeTab === 'games' && (
          <div className="space-y-6 animate-fade-in">
            {runningGame ? (
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={() => {
                    sound.playPop();
                    setRunningGame(null);
                  }}
                  className="inline-flex items-center gap-1.5 py-2 px-4 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>ត្រឡប់ទៅបញ្ជីហ្គេមវិញ</span>
                </button>
                <div className="bg-white rounded-3xl border-2 border-amber-300 p-4 sm:p-6 shadow-md">
                  <UniversalGameRunner
                    gameConfig={runningGame}
                    onExit={() => {
                      sound.playSuccessChime();
                      setRunningGame(null);
                    }}
                  />
                </div>
              </div>
            ) : (
              <>
                <div className="bg-white rounded-3xl border border-amber-200/80 p-5 shadow-xs flex items-center justify-between">
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
                      <span>🎮</span>
                      <span>ល្បែងសិក្សាអប់រំឆ្លាតវៃ ({filteredGames.length})</span>
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      ល្បែងកម្សាន្តបំប៉នបញ្ញា អក្សរ លេខ និងការគិតបែបវិទ្យាសាស្ត្រ
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredGames.map((g) => (
                    <div
                      key={g.id}
                      className="bg-white rounded-3xl border-2 border-slate-200/80 hover:border-amber-400 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                    >
                      <div className="space-y-3">
                        <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-200 flex items-center justify-center text-2xl group-hover:scale-105 transition-transform">
                          {g.subject === 'math' ? '🔢' : g.subject === 'khmer' ? '🇰🇭' : '🔬'}
                        </div>
                        <div>
                          <h3 className="font-bold text-base text-slate-900 group-hover:text-amber-900">
                            {g.titleKhmer}
                          </h3>
                          <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                            {g.instructionsKhmer || g.titleEnglish}
                          </p>
                        </div>
                      </div>

                      <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-400 uppercase">
                          {g.subject}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            sound.playPop();
                            setRunningGame(g);
                          }}
                          className="py-1.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs transition-colors shadow-2xs cursor-pointer active:scale-95"
                        >
                          លេងឥឡូវនេះ
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* TAB 4: ✨ ផ្ទាល់ខ្លួន (0) */}
        {activeTab === 'custom' && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-white rounded-3xl border border-amber-200/80 p-8 text-center space-y-4 shadow-xs max-w-lg mx-auto">
              <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-600 flex items-center justify-center text-3xl mx-auto shadow-2xs">
                ✨
              </div>
              <h2 className="text-xl font-bold text-slate-900">
                មេរៀនផ្ទាល់ខ្លួនរបស់ {student?.nickname || 'អ្នក'}
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed font-khmer">
                នៅពេលលោកគ្រូ-អ្នកគ្រូបង្កើតល្បែង AI ថ្មីៗតាមរយៈ SmartKids Studio
                ល្បែងផ្ទាល់ខ្លួនទាំងនោះនឹងបង្ហាញនៅទីនេះដោយស្វ័យប្រវត្តិ!
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    sound.playPop();
                    handleTabChange('class_docs');
                  }}
                  className="py-2.5 px-5 rounded-2xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs shadow-xs cursor-pointer transition-all"
                >
                  មើលឯកសារថ្នាក់រៀន
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* -------------------------------------------------------------------- */}
      {/* 4. FOOTER                                                            */}
      {/* -------------------------------------------------------------------- */}
      <footer className="mt-auto border-t border-amber-200/50 py-4 text-center text-xs text-slate-500">
        កុមារឆ្លាត (SmartKids Cambodia) • វេទិកាអប់រំបឋមសិក្សាអន្តរកម្ម MoEYS
      </footer>
    </div>
  );
}

export default function StudentDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FBF9F4] flex items-center justify-center text-amber-600 text-sm font-bold font-khmer">
          កំពុងផ្ទុកមជ្ឈមណ្ឌលសិស្ស...
        </div>
      }
    >
      <StudentDashboardContent />
    </Suspense>
  );
}
