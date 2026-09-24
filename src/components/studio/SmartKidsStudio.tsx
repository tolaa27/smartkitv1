// src/components/studio/SmartKidsStudio.tsx
// Master Studio Architecture: 3-Zone Responsive Workspace (Left: Curriculum & AI Config, Center: Modular AI Workspace/Editor, Right: Live Multi-Device Preview)

'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  BookOpen,
  Edit3,
  Gamepad2,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  X,
  Layers,
} from 'lucide-react';
import {
  LessonDocument,
  LessonDifficulty,
  LessonLanguage,
  ContentLength,
  LearningStyle,
  AiActionType,
} from '@/lib/ai/types';
import { SubjectId, GradeLevel, GeneratedGameConfig } from '@/types/game';
import { PRESET_MOEYS_LESSONS, PresetLesson } from '@/utils/aiCompiler';
import { generateFallbackLesson, normalizePromptContext } from '@/lib/ai/lesson-generator';
import { saveCustomGame } from '@/utils/customGames';
import { soundSynthesizer } from '@/lib/audio/SoundSynthesizer';

import { StudioHeader } from './StudioHeader';
import { CurriculumPanel } from './CurriculumPanel';
import { LessonEditor } from './LessonEditor';
import { PreviewPanel } from './PreviewPanel';

interface SmartKidsStudioProps {
  onBackToStudentMode: () => void;
  onPlayInStudentHub: (game: GeneratedGameConfig) => void;
}

/**
 * Helper to adapt LessonDocument into GeneratedGameConfig for UniversalGameRunner & Student Hub.
 */
export function convertLessonToGameConfig(lesson: LessonDocument): GeneratedGameConfig {
  const defaultLevels = [
    {
      levelId: 1,
      promptText: lesson.title,
      gameplayData: {
        sandboxData: {
          idealWaterRange: [60, 85],
          idealLightRange: [50, 80],
        },
      },
    },
  ];

  return {
    id: lesson.id || `game_${Date.now()}`,
    titleKhmer: lesson.game?.title || lesson.title,
    titleEnglish: lesson.topic,
    subject: lesson.subject,
    gradeLevel: lesson.grade,
    instructionsKhmer: lesson.game?.instructions || 'ជ្រើសរើសចម្លើយដែលត្រឹមត្រូវ',
    instructionsEnglish: 'Choose the correct answer',
    template: (lesson.game?.gameType as any) || 'sorter',
    engineType: (lesson.game?.gameType as any) || 'sorter',
    metadata: {
      targetCompetency: lesson.learningObjective,
      classroomPin: String(Math.floor(100000 + Math.random() * 900000)),
    },
    levels:
      lesson.game?.levels && lesson.game.levels.length > 0
        ? lesson.game.levels
        : lesson.questions && lesson.questions.length > 0
        ? lesson.questions.map((q, idx) => ({
            levelId: idx + 1,
            promptText: q.question,
            gameplayData: {
              quizOptions: q.options.map((opt) => ({
                id: opt,
                textKhmer: opt,
                isCorrect: opt === q.answer,
                explanationKhmer: q.explanation,
              })),
            },
          }))
        : defaultLevels,
    lessonMaterial: {
      lessonTitleKhmer: lesson.title,
      lessonSummaryKhmer: lesson.explanation,
      pageNumber: lesson.grade,
    },
  };
}

export const SmartKidsStudio: React.FC<SmartKidsStudioProps> = ({
  onBackToStudentMode,
  onPlayInStudentHub,
}) => {
  // --------------------------------------------------------------------------
  // 1. CURRICULUM & AI CONFIG STATE
  // --------------------------------------------------------------------------
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(
    PRESET_MOEYS_LESSONS[0].id
  );
  const [subject, setSubject] = useState<SubjectId>(PRESET_MOEYS_LESSONS[0].subject);
  const [grade, setGrade] = useState<GradeLevel>(PRESET_MOEYS_LESSONS[0].gradeLevel);
  const [topic, setTopic] = useState<string>(PRESET_MOEYS_LESSONS[0].titleKhmer);
  const [learningObjective, setLearningObjective] = useState<string>(
    'សិស្សអាចកំណត់កត្តាសំខាន់ៗដែលរុក្ខជាតិត្រូវការដើម្បីដុះលូតលាស់'
  );
  const [difficulty, setDifficulty] = useState<LessonDifficulty>('medium');
  const [language, setLanguage] = useState<LessonLanguage>('khmer');
  const [contentLength, setContentLength] = useState<ContentLength>('medium');
  const [learningStyle, setLearningStyle] = useState<LearningStyle>('interactive');

  // --------------------------------------------------------------------------
  // 2. CENTRAL LESSON STATE
  // --------------------------------------------------------------------------
  const [lesson, setLesson] = useState<LessonDocument>(() => {
    return generateFallbackLesson(
      normalizePromptContext({
        subject: PRESET_MOEYS_LESSONS[0].subject,
        grade: PRESET_MOEYS_LESSONS[0].gradeLevel,
        topic: PRESET_MOEYS_LESSONS[0].titleKhmer,
        learningObjective: 'សិស្សអាចកំណត់កត្តាសំខាន់ៗដែលរុក្ខជាតិត្រូវការដើម្បីដុះលូតលាស់',
        difficulty: 'medium',
        language: 'khmer',
        learningStyle: 'interactive',
      })
    );
  });

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);

  // --------------------------------------------------------------------------
  // 3. AI GENERATION & ACTION STATE
  // --------------------------------------------------------------------------
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isActionLoading, setIsActionLoading] = useState<boolean>(false);
  const [activeAction, setActiveAction] = useState<string | null>(null);

  // --------------------------------------------------------------------------
  // 4. UI & RESPONSIVE STATE
  // --------------------------------------------------------------------------
  const [activePreviewTab, setActivePreviewTab] = useState<'game' | 'pdf' | 'video'>('game');
  const [mobileTab, setMobileTab] = useState<'curriculum' | 'editor' | 'preview'>('editor');
  const [toastNotification, setToastNotification] = useState<{
    message: string;
    type: 'success' | 'info' | 'error';
  } | null>(null);

  const toastTimerRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'info' | 'error' = 'info') => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToastNotification({ message, type });
    toastTimerRef.current = setTimeout(() => {
      setToastNotification(null);
    }, 4500);
  }, []);

  // --------------------------------------------------------------------------
  // 5. PRESET SELECTION HANDLER
  // --------------------------------------------------------------------------
  const handleSelectPreset = useCallback((preset: PresetLesson) => {
    setSelectedPresetId(preset.id);
    setSubject(preset.subject);
    setGrade(preset.gradeLevel);
    setTopic(preset.titleKhmer);

    const defaultObj =
      preset.subject === 'science'
        ? 'សិស្សអាចកំណត់កត្តាសំខាន់ៗដែលរុក្ខជាតិត្រូវការដើម្បីដុះលូតលាស់'
        : preset.subject === 'math'
        ? 'សិស្សអាចអនុវត្តការបូកដកលេខ និងគណនាទំនិញជាក់ស្តែងក្នុងផ្សារ'
        : preset.subject === 'khmer'
        ? 'សិស្សអាចស្គាល់ និងប្រកបព្យញ្ជនៈ ស្រៈ និងព្យាង្គបានយ៉ាងត្រឹមត្រូវ'
        : 'សិស្សយល់ដឹងពីការរស់នៅស្អាត និងការថែរក្សាបរិស្ថាន';
    setLearningObjective(defaultObj);

    // Synthesize fresh lesson for the selected preset
    const newLesson = generateFallbackLesson(
      normalizePromptContext({
        subject: preset.subject,
        grade: preset.gradeLevel,
        topic: preset.titleKhmer,
        learningObjective: defaultObj,
        curriculumPreset: preset.id,
      })
    );
    setLesson(newLesson);
    setHasUnsavedChanges(true);
    soundSynthesizer.playPop();
    showToast(`បានផ្ទុកគំរូមេរៀន៖ ${preset.titleKhmer}`, 'info');
  }, [showToast]);

  // --------------------------------------------------------------------------
  // 6. MASTER FULL LESSON AI GENERATION
  // --------------------------------------------------------------------------
  const handleGenerateFullLesson = useCallback(async () => {
    soundSynthesizer.playSuccessChime();
    setIsGenerating(true);
    showToast('កំពុងបញ្ជូនសំណើទៅ Google Gemini 2.5 Flash...', 'info');

    try {
      const response = await fetch('/api/studio/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'full_lesson',
          context: {
            subject,
            grade,
            topic,
            learningObjective,
            difficulty,
            language,
            contentLength,
            learningStyle,
            curriculumPreset: selectedPresetId || undefined,
          },
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || result.error || 'Failed to generate lesson');
      }

      setLesson(result.lesson);
      setHasUnsavedChanges(true);
      soundSynthesizer.playSuccess();
      showToast(
        result.warnings?.length > 0
          ? `មេរៀនត្រូវបានបង្កើតជោគជ័យ (${result.warnings[0]})`
          : 'មេរៀន និងល្បែងអប់រំត្រូវបានបង្កើតដោយ AI ជោគជ័យ!',
        'success'
      );
    } catch (err: any) {
      console.error('Error generating lesson via AI:', err);
      // Deterministic fallback
      const fallback = generateFallbackLesson(
        normalizePromptContext({
          subject,
          grade,
          topic,
          learningObjective,
          difficulty,
          language,
          contentLength,
          learningStyle,
        })
      );
      setLesson(fallback);
      setHasUnsavedChanges(true);
      soundSynthesizer.playPop();
      showToast('បានផ្ទុកគំរូមេរៀន MoEYS ស្របតាមកម្មវិធីសិក្សាជាតិ។', 'info');
    } finally {
      setIsGenerating(false);
    }
  }, [
    subject,
    grade,
    topic,
    learningObjective,
    difficulty,
    language,
    contentLength,
    learningStyle,
    selectedPresetId,
    showToast,
  ]);

  // --------------------------------------------------------------------------
  // 7. SECTION-LEVEL GRANULAR AI ACTIONS
  // --------------------------------------------------------------------------
  const handleExecuteAiAction = useCallback(
    async (action: AiActionType, customInstruction?: string) => {
      soundSynthesizer.playPop();
      setIsActionLoading(true);
      setActiveAction(action);

      try {
        const response = await fetch('/api/studio/ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action,
            currentLesson: lesson,
            options: {
              customInstruction,
              targetLanguage: language,
            },
          }),
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || result.error || 'Failed to execute section action');
        }

        if (result.lesson) {
          setLesson(result.lesson);
          setHasUnsavedChanges(true);
          soundSynthesizer.playSuccess();
          showToast(result.message || 'បានកែសម្រួលមាតិកាដោយជោគជ័យ!', 'success');
        }
      } catch (err: any) {
        console.error(`Error in action ${action}:`, err);
        showToast(`កំហុសក្នុងការកែសម្រួល៖ ${err.message}`, 'error');
      } finally {
        setIsActionLoading(false);
        setActiveAction(null);
      }
    },
    [lesson, language, showToast]
  );

  // --------------------------------------------------------------------------
  // 8. SAVE & EXPORT HANDLERS
  // --------------------------------------------------------------------------
  const handleSaveLesson = useCallback(async () => {
    soundSynthesizer.playSuccess();
    const gameConfig = convertLessonToGameConfig(lesson);
    await saveCustomGame(gameConfig);

    // Also persist lesson document locally
    if (typeof window !== 'undefined') {
      try {
        const existing = JSON.parse(localStorage.getItem('smartkids_saved_lessons') || '[]');
        const filtered = existing.filter((l: LessonDocument) => l.id !== lesson.id);
        localStorage.setItem(
          'smartkids_saved_lessons',
          JSON.stringify([lesson, ...filtered])
        );
      } catch (e) {
        console.warn('Could not persist to local storage:', e);
      }
    }

    setHasUnsavedChanges(false);
    showToast(`បានរក្សាទុកមេរៀន "${lesson.title}" ដោយជោគជ័យ! PIN: ${gameConfig.metadata?.classroomPin}`, 'success');
  }, [lesson, showToast]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/60 text-slate-800 font-sans">
      {/* 1. STUDIO HEADER */}
      <StudioHeader
        lessonTitle={lesson.title}
        isGenerating={isGenerating}
        hasUnsavedChanges={hasUnsavedChanges}
        onSave={handleSaveLesson}
        onGenerateAi={handleGenerateFullLesson}
        onSwitchToStudentHub={onBackToStudentMode}
        activePreviewTab={activePreviewTab}
        onTogglePreview={() => {
          setActivePreviewTab((prev) => (prev === 'game' ? 'pdf' : prev === 'pdf' ? 'video' : 'game'));
        }}
      />

      {/* 2. MOBILE / TABLET TAB SELECTOR (<1280px) */}
      <div className="xl:hidden bg-white border-b border-slate-200 px-4 py-2.5 flex items-center justify-center gap-2 z-20">
        <button
          onClick={() => {
            soundSynthesizer.playPop();
            setMobileTab('curriculum');
          }}
          className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
            mobileTab === 'curriculum'
              ? 'bg-amber-100 text-amber-900 border border-amber-300 shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5 text-amber-600" />
          <span>១. កម្មវិធីសិក្សា</span>
        </button>

        <button
          onClick={() => {
            soundSynthesizer.playPop();
            setMobileTab('editor');
          }}
          className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
            mobileTab === 'editor'
              ? 'bg-amber-100 text-amber-900 border border-amber-300 shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Edit3 className="w-3.5 h-3.5 text-amber-600" />
          <span>២. កែសម្រួលមេរៀន</span>
        </button>

        <button
          onClick={() => {
            soundSynthesizer.playPop();
            setMobileTab('preview');
          }}
          className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
            mobileTab === 'preview'
              ? 'bg-purple-100 text-purple-900 border border-purple-300 shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Gamepad2 className="w-3.5 h-3.5 text-purple-600" />
          <span>៣. មើលលទ្ធផល</span>
        </button>
      </div>

      {/* 3. MAIN WORKSPACE (3-ZONE LAYOUT) */}
      <main className="flex-1 max-w-[1720px] w-full mx-auto p-3 sm:p-4 lg:p-6 overflow-hidden">
        {/* Desktop: 3 Columns side-by-side (>=1280px) */}
        <div className="hidden xl:grid xl:grid-cols-12 xl:gap-6 h-[calc(100vh-6.5rem)] items-start">
          {/* ZONE 1: Curriculum & AI Config (3 cols) */}
          <div className="xl:col-span-3 h-full overflow-y-auto pr-1">
            <CurriculumPanel
              subject={subject}
              onSubjectChange={setSubject}
              grade={grade}
              onGradeChange={setGrade}
              topic={topic}
              onTopicChange={setTopic}
              difficulty={difficulty}
              onDifficultyChange={setDifficulty}
              learningObjective={learningObjective}
              onLearningObjectiveChange={setLearningObjective}
              selectedPresetId={selectedPresetId}
              onSelectPreset={handleSelectPreset}
              language={language}
              onLanguageChange={setLanguage}
              contentLength={contentLength}
              onContentLengthChange={setContentLength}
              learningStyle={learningStyle}
              onLearningStyleChange={setLearningStyle}
            />
          </div>

          {/* ZONE 2: Modular AI Workspace / Editor (5 cols) */}
          <div className="xl:col-span-5 h-full overflow-y-auto px-1">
            <LessonEditor
              lesson={lesson}
              onUpdateLesson={(updated) => {
                setLesson(updated);
                setHasUnsavedChanges(true);
              }}
              onExecuteAiAction={handleExecuteAiAction}
              isActionLoading={isActionLoading}
              activeAction={activeAction}
            />
          </div>

          {/* ZONE 3: Live Multi-Device Preview (4 cols) */}
          <div className="xl:col-span-4 h-full overflow-y-auto pl-1">
            <PreviewPanel
              lesson={lesson}
              activeTab={activePreviewTab}
              onTabChange={setActivePreviewTab}
              onFixAlignment={() => handleExecuteAiAction('check_alignment')}
              isAiGenerating={isGenerating || isActionLoading}
            />
          </div>
        </div>

        {/* Mobile & Tablet: Tabbed view (<1280px) */}
        <div className="xl:hidden pb-12">
          {mobileTab === 'curriculum' && (
            <div className="max-w-2xl mx-auto">
              <CurriculumPanel
                subject={subject}
                onSubjectChange={setSubject}
                grade={grade}
                onGradeChange={setGrade}
                topic={topic}
                onTopicChange={setTopic}
                difficulty={difficulty}
                onDifficultyChange={setDifficulty}
                learningObjective={learningObjective}
                onLearningObjectiveChange={setLearningObjective}
                selectedPresetId={selectedPresetId}
                onSelectPreset={handleSelectPreset}
                language={language}
                onLanguageChange={setLanguage}
                contentLength={contentLength}
                onContentLengthChange={setContentLength}
                learningStyle={learningStyle}
                onLearningStyleChange={setLearningStyle}
              />
            </div>
          )}

          {mobileTab === 'editor' && (
            <div className="max-w-3xl mx-auto">
              <LessonEditor
                lesson={lesson}
                onUpdateLesson={(updated) => {
                  setLesson(updated);
                  setHasUnsavedChanges(true);
                }}
                onExecuteAiAction={handleExecuteAiAction}
                isActionLoading={isActionLoading}
                activeAction={activeAction}
              />
            </div>
          )}

          {mobileTab === 'preview' && (
            <div className="max-w-2xl mx-auto">
              <PreviewPanel
                lesson={lesson}
                activeTab={activePreviewTab}
                onTabChange={setActivePreviewTab}
                onFixAlignment={() => handleExecuteAiAction('check_alignment')}
                isAiGenerating={isGenerating || isActionLoading}
              />
            </div>
          )}
        </div>
      </main>

      {/* 4. FLOATING NOTIFICATION TOAST */}
      {toastNotification && (
        <div className="fixed bottom-5 right-5 z-50 animate-bounce-in max-w-sm">
          <div
            className={`flex items-start gap-3 p-4 rounded-2xl shadow-xl border text-sm font-medium ${
              toastNotification.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : toastNotification.type === 'error'
                ? 'bg-rose-50 border-rose-200 text-rose-900'
                : 'bg-indigo-50 border-indigo-200 text-indigo-900'
            }`}
          >
            {toastNotification.type === 'success' && (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            )}
            {toastNotification.type === 'error' && (
              <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
            )}
            {toastNotification.type === 'info' && (
              <Sparkles className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
            )}
            <p className="flex-1 font-kantumruy leading-relaxed">
              {toastNotification.message}
            </p>
            <button
              onClick={() => setToastNotification(null)}
              className="text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
