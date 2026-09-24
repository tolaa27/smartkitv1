// src/components/teacher/TeacherDashboard.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Camera,
  Upload,
  Plus,
  BookOpen,
  Sparkles,
  Users,
  Layers,
  FileText,
  Trash2,
  Eye,
  LogOut,
  ExternalLink,
  GraduationCap,
  Search,
  Filter,
  Volume2,
  X,
  CheckCircle2,
  Download,
  Loader2,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { Grade, Document, DocumentSubject, Profile } from '@/lib/supabase/types';
import { SupabaseService, invalidateApiCache } from '@/lib/supabase/service';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { DocumentCaptureModule } from './DocumentCaptureModule';
import { ClassManagerModal } from './ClassManagerModal';
import { StudentManagerModal } from './StudentManagerModal';
import { useEdTech } from '@/context/EdTechContext';
import { sound } from '@/utils/sound';

interface TeacherIdentity {
  id: string;
  email?: string;
  full_name?: string;
}

export function TeacherDashboard() {
  const router = useRouter();
  const { logout } = useEdTech();

  // Auth & Session Readiness States
  const [user, setUser] = useState<TeacherIdentity | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Data states
  const [grades, setGrades] = useState<Grade[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [students, setStudents] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [selectedGradeId, setSelectedGradeId] = useState<string>('all');
  const [selectedSubject, setSelectedSubject] = useState<DocumentSubject | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [captureOpen, setCaptureOpen] = useState(false);
  const [classManagerOpen, setClassManagerOpen] = useState(false);
  const [studentManagerOpen, setStudentManagerOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null);

  // 1. Resolve Teacher Auth Session reliably before querying DB
  useEffect(() => {
    let isMounted = true;

    async function resolveTeacherAuth() {
      try {
        if (isSupabaseConfigured()) {
          const supabase = createClient();
          // Check fast local session first
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user && isMounted) {
            const u = session.user;
            const meta = u.user_metadata || {};
            setUser({
              id: u.id,
              email: u.email,
              full_name: meta.full_name || meta.name || u.email?.split('@')[0] || 'អ្នកគ្រូ-លោកគ្រូ',
            });
            setAuthReady(true);
            return;
          }

          // Remote session token verification
          const { data: { user: verifiedUser } } = await supabase.auth.getUser();
          if (verifiedUser && isMounted) {
            const meta = verifiedUser.user_metadata || {};
            setUser({
              id: verifiedUser.id,
              email: verifiedUser.email,
              full_name: meta.full_name || meta.name || verifiedUser.email?.split('@')[0] || 'អ្នកគ្រូ-លោកគ្រូ',
            });
            setAuthReady(true);
            return;
          }
        }

        // Cookie & Demo Session Fallback
        if (typeof document !== 'undefined') {
          const hasTeacherCookie = document.cookie.includes('smartkids_user_role=teacher');
          if (hasTeacherCookie && isMounted) {
            const match = document.cookie.match(/smartkids_teacher_email=([^;]+)/);
            const teacherEmail = match ? decodeURIComponent(match[1]) : 'teacher@smartkids.edu.kh';
            setUser({
              id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', // Teacher Sokha standard seed ID
              email: teacherEmail,
              full_name: teacherEmail.includes('vanna')
                ? 'លោកគ្រូ វណ្ណា (Teacher Vanna)'
                : 'អ្នកគ្រូ សុខា (Teacher Sokha)',
            });
            setAuthReady(true);
            return;
          }
        }

        // Default demo teacher fallback
        if (isMounted) {
          setUser({
            id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
            email: 'teacher@smartkids.edu.kh',
            full_name: 'អ្នកគ្រូ សុខា (Teacher Sokha)',
          });
          setAuthReady(true);
        }
      } catch (err) {
        console.error('[TeacherDashboard] Auth resolution error:', err);
        if (isMounted) {
          setUser({
            id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
            email: 'teacher@smartkids.edu.kh',
            full_name: 'អ្នកគ្រូ សុខា (Teacher Sokha)',
          });
          setAuthReady(true);
        }
      }
    }

    resolveTeacherAuth();

    if (isSupabaseConfigured()) {
      const supabase = createClient();
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user && isMounted) {
          const u = session.user;
          const meta = u.user_metadata || {};
          setUser({
            id: u.id,
            email: u.email,
            full_name: meta.full_name || meta.name || u.email?.split('@')[0] || 'អ្នកគ្រូ-លោកគ្រូ',
          });
          setAuthReady(true);
        }
      });

      return () => {
        isMounted = false;
        subscription.unsubscribe();
      };
    }

    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Fetch Dashboard Data
  const loadData = useCallback(async (bypassCache: boolean = false) => {
    setLoading(true);
    setFetchError(null);
    try {
      const [fetchedGrades, fetchedDocs, fetchedStudents] = await Promise.all([
        SupabaseService.getGrades(bypassCache),
        SupabaseService.getDocuments(undefined, 'all', 100, bypassCache),
        SupabaseService.getStudents(undefined, bypassCache),
      ]);
      setGrades(fetchedGrades);
      setDocuments(fetchedDocs);
      setStudents(fetchedStudents);
    } catch (err: any) {
      console.error('[TeacherDashboard] Error loading data:', err);
      setFetchError(err?.message || 'មានបញ្ហាក្នុងការទាញយកទិន្នន័យពីម៉ាស៊ីនបម្រើ');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // 3. Session Readiness Guard: Run queries only AFTER auth is verified and user.id is resolved
  useEffect(() => {
    if (!authReady || !user?.id) {
      return;
    }
    loadData();
  }, [authReady, user?.id, loadData]);

  // Manual Refresh Handler
  const handleManualRefresh = () => {
    sound.playPop();
    setIsRefreshing(true);
    invalidateApiCache();
    loadData(true);
  };

  // Filter documents
  const filteredDocuments = documents.filter((doc) => {
    const matchesGrade = selectedGradeId === 'all' || doc.grade_id === selectedGradeId;
    const matchesSubject = selectedSubject === 'all' || doc.subject === selectedSubject;
    const matchesSearch =
      !searchQuery ||
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.description && doc.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesGrade && matchesSubject && matchesSearch;
  });

  const handleDeleteDocument = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    sound.playPop();
    if (confirm('តើអ្នកពិតជាចង់លុបឯកសារនេះមែនទេ?')) {
      await SupabaseService.deleteDocument(id);
      sound.playSuccessChime();
      loadData(true);
    }
  };

  const handleLogout = () => {
    sound.playPop();
    logout();
    if (typeof document !== 'undefined') {
      document.cookie = 'smartkids_user_role=; path=/; max-age=0; SameSite=Lax';
      document.cookie = 'smartkids_teacher_email=; path=/; max-age=0; SameSite=Lax';
    }
    router.push('/login');
  };

  const getSubjectColor = (subject: DocumentSubject) => {
    switch (subject) {
      case 'khmer':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'math':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'science':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getSubjectKhmer = (subject: DocumentSubject) => {
    switch (subject) {
      case 'khmer':
        return '📖 ភាសាខ្មែរ';
      case 'math':
        return '🔢 គណិតវិទ្យា';
      case 'science':
        return '🔬 វិទ្យាសាស្ត្រ';
    }
  };

  return (
    <div
      style={{ fontFamily: "'Kantumruy Pro', 'Noto Sans Khmer', system-ui, sans-serif" }}
      className="min-h-screen bg-[#FBF9F4] flex flex-col"
    >
      {/* =================================================================== */}
      {/* 1. TOP TEACHER NAVIGATION BAR                                       */}
      {/* =================================================================== */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          {/* Left Brand */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-linear-to-tr from-indigo-600 to-indigo-700 text-white flex items-center justify-center text-2xl shadow-sm">
              👩‍🏫
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base sm:text-lg text-slate-900 leading-tight">
                  SmartKids
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
                  សម្រាប់គ្រូបង្រៀន
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium leading-none mt-0.5">
                {user?.full_name ? `${user.full_name} • OCR Studio` : 'Teacher Management & OCR Studio'}
              </p>
            </div>
          </div>

          {/* Right Action Hub */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Refresh Sync Button */}
            <button
              type="button"
              onClick={handleManualRefresh}
              disabled={loading || isRefreshing}
              className="p-2 rounded-xl border border-slate-200 hover:border-indigo-300 text-slate-600 hover:text-indigo-600 bg-white shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
              title="ផ្ទុកឡើងវិញ (Refresh Data)"
            >
              <RefreshCw className={`w-4 h-4 ${loading || isRefreshing ? 'animate-spin text-indigo-600' : ''}`} />
            </button>

            {/* Class Manager Trigger */}
            <button
              type="button"
              onClick={() => {
                sound.playPop();
                setClassManagerOpen(true);
              }}
              className="hidden sm:inline-flex items-center gap-1.5 py-2 px-3.5 rounded-xl border border-slate-200 hover:border-indigo-300 text-slate-700 hover:text-indigo-600 bg-white font-bold text-xs shadow-2xs transition-colors cursor-pointer"
            >
              <GraduationCap className="w-4 h-4 text-indigo-500" />
              <span>គ្រប់គ្រងថ្នាក់រៀន ({grades.length})</span>
            </button>

            {/* Student Manager Trigger */}
            <button
              type="button"
              onClick={() => {
                sound.playPop();
                setStudentManagerOpen(true);
              }}
              className="hidden sm:inline-flex items-center gap-1.5 py-2 px-3.5 rounded-xl border border-slate-200 hover:border-amber-300 text-slate-700 hover:text-amber-700 bg-white font-bold text-xs shadow-2xs transition-colors cursor-pointer"
            >
              <Users className="w-4 h-4 text-amber-500" />
              <span>គ្រប់គ្រងសិស្ស</span>
            </button>

            {/* AI Studio Link */}
            <Link
              href="/studio"
              className="inline-flex items-center gap-1.5 py-2 px-3.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs border border-indigo-200 transition-colors shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden md:inline">AI Creator Studio</span>
            </Link>

            {/* Switch to Student View */}
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 py-2 px-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-2xs transition-colors"
            >
              <span>🎒 មើលផ្ទាំងសិស្ស</span>
            </Link>

            {/* Logout */}
            <button
              type="button"
              onClick={handleLogout}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              title="ចាកចេញ (Logout)"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* =================================================================== */}
      {/* 2. DASHBOARD BODY & METRICS                                         */}
      {/* =================================================================== */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Welcome Banner & Primary Capture CTA */}
        <div className="rounded-3xl bg-linear-to-r from-indigo-700 via-indigo-800 to-slate-900 text-white p-6 sm:p-8 shadow-md relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 z-10 max-w-xl">
            <div className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-xs px-3 py-1 rounded-full text-xs font-semibold text-indigo-100">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>កុមារឆ្លាត • ប្រព័ន្ធគ្រប់គ្រងការបង្រៀនឌីជីថល</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold leading-tight">
              ស្វាគមន៍មកកាន់ Teacher Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-indigo-100 leading-relaxed font-normal">
              ថតរូបមេរៀន ផ្ទុកឡើងសន្លឹកកិច្ចការ និងស្រង់អត្ថបទដោយស្វ័យប្រវត្តិតាមបច្ចេកវិទ្យា OCR ដើម្បីចែកចាយដល់កូនសិស្សរៀនសូត្រ។
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 z-10 w-full md:w-auto">
            <button
              type="button"
              onClick={() => {
                sound.playPop();
                setCaptureOpen(true);
              }}
              className="w-full sm:w-auto py-3.5 px-6 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <Camera className="w-5 h-5 text-slate-950" />
              <span>ថត ឬផ្ទុកឡើងឯកសារថ្មី</span>
            </button>

            <button
              type="button"
              onClick={() => {
                sound.playPop();
                setClassManagerOpen(true);
              }}
              className="w-full sm:w-auto py-3.5 px-5 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs sm:text-sm backdrop-blur-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>គ្រប់គ្រងថ្នាក់</span>
            </button>

            <button
              type="button"
              onClick={() => {
                sound.playPop();
                setStudentManagerOpen(true);
              }}
              className="w-full sm:w-auto py-3.5 px-5 rounded-2xl bg-amber-500/25 hover:bg-amber-500/40 text-amber-200 border border-amber-400/40 font-bold text-xs sm:text-sm backdrop-blur-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Users className="w-4 h-4 text-amber-300" />
              <span>គ្រប់គ្រងសិស្ស (+ PIN)</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500">ថ្នាក់រៀន</span>
              <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600">🏫</span>
            </div>
            {loading || !authReady ? (
              <div className="h-8 w-14 bg-slate-200 animate-pulse rounded-lg my-1" />
            ) : (
              <div className="text-2xl font-bold text-slate-900">{grades.length}</div>
            )}
            <span className="text-[11px] text-slate-500 mt-0.5 block">កម្រិតមត្តេយ្យ ដល់ ថ្នាក់ទី៣</span>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500">ឯកសារ & សន្លឹកកិច្ចការ</span>
              <span className="p-2 rounded-xl bg-amber-50 text-amber-600">📑</span>
            </div>
            {loading || !authReady ? (
              <div className="h-8 w-14 bg-slate-200 animate-pulse rounded-lg my-1" />
            ) : (
              <div className="text-2xl font-bold text-slate-900">{documents.length}</div>
            )}
            <span className="text-[11px] text-slate-500 mt-0.5 block">ក្នុង Supabase Storage</span>
          </div>

          <div
            onClick={() => {
              sound.playPop();
              setStudentManagerOpen(true);
            }}
            className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 hover:border-amber-400 shadow-2xs hover:shadow-xs transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 group-hover:text-amber-800">កូនសិស្សចុះឈ្មោះ</span>
              <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">🎒</span>
            </div>
            {loading || !authReady ? (
              <div className="h-8 w-14 bg-slate-200 animate-pulse rounded-lg my-1" />
            ) : (
              <div className="text-2xl font-bold text-slate-900">
                {students.length > 0 ? students.length : grades.reduce((acc, g) => acc + (g.student_count || 20), 0)}
              </div>
            )}
            <span className="text-[11px] text-amber-700 font-semibold mt-0.5 block">
              ចុចមើល & គ្រប់គ្រង PIN &rarr;
            </span>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500">មុខវិជ្ជាគោល</span>
              <span className="p-2 rounded-xl bg-purple-50 text-purple-600">📚</span>
            </div>
            <div className="text-2xl font-bold text-slate-900">៣</div>
            <span className="text-[11px] text-slate-500 mt-0.5 block">ខ្មែរ • គណិត • វិទ្យាសាស្ត្រ</span>
          </div>
        </div>

        {/* =================================================================== */}
        {/* 3. DOCUMENTS DIRECTORY & FILTER CONTROLS                            */}
        {/* =================================================================== */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-2xs space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-tight">
                បណ្ណាល័យឯកសារថ្នាក់រៀន
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                គ្រប់គ្រងឯកសារដែលបានថត និងផ្ទុកឡើងសម្រាប់សិស្ស
              </p>
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ស្វែងរកចំណងជើង..."
                className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-xs text-slate-900 focus:outline-hidden focus:border-indigo-500"
              >
              </input>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Grade Filter */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-semibold text-slate-500 mr-1 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" />
                <span>ថ្នាក់ ៖</span>
              </span>
              {loading || !authReady ? (
                <div className="flex items-center gap-2">
                  <div className="h-7 w-20 bg-slate-200 animate-pulse rounded-xl" />
                  <div className="h-7 w-24 bg-slate-200 animate-pulse rounded-xl" />
                  <div className="h-7 w-24 bg-slate-200 animate-pulse rounded-xl" />
                </div>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      sound.playPop();
                      setSelectedGradeId('all');
                    }}
                    className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedGradeId === 'all'
                        ? 'bg-indigo-600 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    ទាំងអស់ ({documents.length})
                  </button>
                  {grades.map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => {
                        sound.playPop();
                        setSelectedGradeId(g.id);
                      }}
                      className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        selectedGradeId === g.id
                          ? 'bg-indigo-600 text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {g.name}
                    </button>
                  ))}
                </>
              )}
            </div>

            {/* Subject Filter */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-semibold text-slate-500 mr-1">មុខវិជ្ជា ៖</span>
              {(['all', 'khmer', 'math', 'science'] as const).map((subj) => (
                <button
                  key={subj}
                  type="button"
                  onClick={() => {
                    sound.playPop();
                    setSelectedSubject(subj);
                  }}
                  className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedSubject === subj
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {subj === 'all'
                    ? 'ទាំងអស់'
                    : subj === 'khmer'
                    ? 'ភាសាខ្មែរ'
                    : subj === 'math'
                    ? 'គណិតវិទ្យា'
                    : 'វិទ្យាសាស្ត្រ'}
                </button>
              ))}
            </div>
          </div>

          {/* Documents Grid */}
          {loading || !authReady ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto text-indigo-600">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
              <p className="text-sm font-bold text-slate-700">កំពុងផ្ទុកទិន្នន័យថ្នាក់រៀន និងស្ថិតិគ្រូ...</p>
              <p className="text-xs text-slate-400">កំពុងផ្ទៀងផ្ទាត់សិទ្ធិ និងទាញយកឯកសារមេរៀន</p>
            </div>
          ) : fetchError ? (
            <div className="py-12 text-center space-y-3 bg-rose-50/50 rounded-2xl border border-rose-200 p-6">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-rose-800">{fetchError}</p>
              <p className="text-xs text-slate-500">សូមពិនិត្យមើលការតភ្ជាប់អ៊ីនធឺណិត ឬសាកល្បងម្តងទៀត</p>
              <button
                type="button"
                onClick={handleManualRefresh}
                className="py-2 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs cursor-pointer inline-flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>ព្យាយាមម្តងទៀត (Retry)</span>
              </button>
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center text-2xl mx-auto">
                📂
              </div>
              <p className="text-sm font-bold text-slate-700">មិនមានឯកសារនៅក្នុងជម្រើសនេះទេ</p>
              <p className="text-xs text-slate-500">
                សូមចុចប៊ូតុង &ldquo;ថត ឬផ្ទុកឡើងឯកសារថ្មី&rdquo; ដើម្បីចាប់ផ្តើម
              </p>
              <button
                type="button"
                onClick={() => setCaptureOpen(true)}
                className="py-2 px-4 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-xs hover:bg-indigo-700 cursor-pointer"
              >
                ថត ឬផ្ទុកឡើងឥឡូវនេះ
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredDocuments.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => setPreviewDoc(doc)}
                  className="group bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 shadow-2xs hover:shadow-md transition-all flex flex-col overflow-hidden cursor-pointer"
                >
                  {/* Thumbnail / Header */}
                  <div className="relative h-44 bg-slate-100 overflow-hidden flex items-center justify-center">
                    {doc.file_type === 'pdf' ? (
                      <div className="flex flex-col items-center justify-center text-slate-400 gap-2">
                        <FileText className="w-12 h-12 text-rose-500" />
                        <span className="text-xs font-bold text-slate-600 uppercase">ឯកសារ PDF</span>
                      </div>
                    ) : (
                      <img
                        src={doc.file_url}
                        alt={doc.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    )}

                    {/* Subject & Grade Pill */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border shadow-2xs ${getSubjectColor(doc.subject)}`}>
                        {getSubjectKhmer(doc.subject)}
                      </span>
                    </div>

                    {/* OCR Status Badge */}
                    {doc.ocr_text && (
                      <div className="absolute bottom-2 right-2 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                        <Sparkles className="w-3 h-3" />
                        <span>OCR ស្រង់រួច</span>
                      </div>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="text-[11px] font-semibold text-indigo-600 mb-1">
                        {doc.grade_name || 'ថ្នាក់រៀន'}
                      </div>
                      <h3 className="font-bold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1 leading-snug">
                        {doc.title}
                      </h3>
                      {doc.description && (
                        <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                          {doc.description}
                        </p>
                      )}
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                      <span>{new Date(doc.created_at).toLocaleDateString('km-KH')}</span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewDoc(doc);
                          }}
                          className="p-1.5 rounded-lg hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 transition-colors"
                          title="មើលលម្អិត"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteDocument(doc.id, e)}
                          className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                          title="លុបឯកសារ"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* =================================================================== */}
      {/* 4. MODALS (CAPTURE, CLASS MANAGER, PREVIEW)                         */}
      {/* =================================================================== */}

      {/* Capture / Upload Modal */}
      {captureOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="my-auto w-full max-w-4xl">
            <DocumentCaptureModule
              grades={grades}
              onSuccess={() => {
                setCaptureOpen(false);
                loadData(true);
              }}
              onCancel={() => setCaptureOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Class Manager Modal */}
      <ClassManagerModal
        grades={grades}
        isOpen={classManagerOpen}
        onClose={() => setClassManagerOpen(false)}
        onRefresh={() => loadData(true)}
      />

      {/* Student Manager Modal */}
      <StudentManagerModal
        grades={grades}
        isOpen={studentManagerOpen}
        onClose={() => setStudentManagerOpen(false)}
        onRefresh={() => loadData(true)}
      />

      {/* Document Detailed Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-scale-up">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${getSubjectColor(previewDoc.subject)}`}>
                  {getSubjectKhmer(previewDoc.subject)} • {previewDoc.grade_name}
                </span>
                <h3 className="font-bold text-base sm:text-lg text-slate-900 mt-1 leading-snug">
                  {previewDoc.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4">
              {/* Document Image or PDF Viewport */}
              <div className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-950 flex items-center justify-center max-h-80">
                {previewDoc.file_type === 'pdf' ? (
                  <div className="p-8 text-center text-white space-y-2">
                    <FileText className="w-16 h-16 text-rose-500 mx-auto" />
                    <p className="text-sm font-semibold">{previewDoc.title}</p>
                    <a
                      href={previewDoc.file_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-indigo-300 underline font-semibold mt-2"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>បើកមើលឯកសារ PDF ពេញលេញ</span>
                    </a>
                  </div>
                ) : (
                  <img
                    src={previewDoc.file_url}
                    alt={previewDoc.title}
                    className="max-h-80 max-w-full object-contain"
                  />
                )}
              </div>

              {previewDoc.description && (
                <div className="text-xs text-slate-600 leading-relaxed font-khmer bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                  <span className="font-bold text-slate-800 block mb-1">ការណែនាំ ៖</span>
                  {previewDoc.description}
                </div>
              )}

              {/* OCR Text Box */}
              {previewDoc.ocr_text && (
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span>អត្ថបទដែលស្រង់ចេញដោយ OCR</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => sound.speakKhmer(previewDoc.ocr_text || previewDoc.title)}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 hover:text-amber-950 bg-amber-100/80 px-2 py-0.5 rounded-md"
                    >
                      <Volume2 className="w-3 h-3" />
                      <span>ស្តាប់សំឡេង</span>
                    </button>
                  </div>
                  <p className="text-xs text-slate-800 leading-relaxed font-khmer bg-white p-3 rounded-xl border border-amber-100">
                    {previewDoc.ocr_text}
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <Link
                href="/studio"
                className="inline-flex items-center gap-1.5 py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>បង្កើតល្បែង AI ពីឯកសារនេះ</span>
              </Link>
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="py-2 px-4 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-white"
              >
                បិទ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TeacherDashboard;
