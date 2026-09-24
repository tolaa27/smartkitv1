// src/components/studio/TeacherStudioWorkspace.tsx
// SmartKids Teacher Studio Workspace: Admin dashboard for curriculum ingestion, OCR, PDF extract & game compilation

'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sprout,
  Coins,
  BookOpen,
  Sparkles,
  Boxes,
  Upload,
  FileCode,
  RotateCcw,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Play,
  Check,
  Copy,
  ArrowLeft,
  Zap,
  X,
  Gamepad2,
  Video,
  Download,
  Loader2,
  LogIn,
  ChevronDown,
} from 'lucide-react';

// Platform types & utilities
import {
  GeneratedGameConfig,
  UniversalEngineType,
  SubjectId,
  GradeLevel,
  LessonMaterial,
} from '@/types/game';
import {
  PRESET_MOEYS_LESSONS,
  classifyLessonEngine,
  simulateOcrExtraction,
  ClassificationReport,
  PresetLesson,
} from '@/utils/aiCompiler';
import { soundSynthesizer } from '@/lib/audio/SoundSynthesizer';
import { saveCustomGame, exportGameAsJson } from '@/utils/customGames';

// Context & subcomponents
import { useEdTech } from '@/context/EdTechContext';
import { UniversalGameRunner } from '@/components/templates/UniversalGameRunner';
import { SpeakButton } from '@/components/audio/SpeakButton';
import { PdfLessonViewer, PageExtractContext } from '@/components/curriculum/PdfLessonViewer';
import { AIVideoGenerator } from '@/components/studio/AIVideoGenerator';
import { VideoJobState } from '@/types/lesson-studio';

// Preset icon mapping for the 5 MoEYS curriculum lessons
const PRESET_ICON_MAP: Record<string, React.ReactNode> = {
  'preset-sandbox-plant': <Sprout className="w-5 h-5 text-emerald-600" />,
  'preset-math-market': <Coins className="w-5 h-5 text-amber-600" />,
  'preset-khmer-syllables': <BookOpen className="w-5 h-5 text-indigo-600" />,
  'preset-sequencer-butterfly': <Sparkles className="w-5 h-5 text-purple-600" />,
  'preset-sorter-eco': <Boxes className="w-5 h-5 text-teal-600" />,
};

export interface TeacherStudioWorkspaceProps {
  onBackToStudentMode?: () => void;
  onPlayInStudentHub?: (game: GeneratedGameConfig) => void;
}

export function TeacherStudioWorkspace({
  onBackToStudentMode,
  onPlayInStudentHub,
}: TeacherStudioWorkspaceProps) {
  const router = useRouter();
  const { student, setActiveCustomGame, setActiveGame, logout } = useEdTech();

  // --------------------------------------------------------------------------
  // 1. CONTROLLED LESSON & FORM STATE
  // --------------------------------------------------------------------------
  const [selectedPresetId, setSelectedPresetId] = useState<string>(PRESET_MOEYS_LESSONS[0].id);
  const [lessonTitle, setLessonTitle] = useState<string>(PRESET_MOEYS_LESSONS[0].titleKhmer);
  const [lessonText, setLessonText] = useState<string>(PRESET_MOEYS_LESSONS[0].content);
  const [subject, setSubject] = useState<SubjectId>(PRESET_MOEYS_LESSONS[0].subject);
  const [gradeLevel, setGradeLevel] = useState<GradeLevel>(PRESET_MOEYS_LESSONS[0].gradeLevel);

  // Introductory & In-Game Lesson Material (PDF snippet / textbook excerpt)
  const [lessonMaterial, setLessonMaterial] = useState<LessonMaterial | undefined>(() => ({
    lessonTitleKhmer: PRESET_MOEYS_LESSONS[0].titleKhmer,
    lessonSummaryKhmer: PRESET_MOEYS_LESSONS[0].content.slice(0, 350),
    pageNumber: PRESET_MOEYS_LESSONS[0].gradeLevel,
  }));

  // File processing state
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingMessage, setProcessingMessage] = useState<string>('');

  // --------------------------------------------------------------------------
  // 2. COMPILATION & GAME STATE
  // --------------------------------------------------------------------------
  const [isCompiling, setIsCompiling] = useState<boolean>(false);
  const [compiledGame, setCompiledGame] = useState<GeneratedGameConfig | null>(null);
  const [selectedEngineOverride, setSelectedEngineOverride] =
    useState<UniversalEngineType | null>(null);
  const [sharePin, setSharePin] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  const [sandboxModalOpen, setSandboxModalOpen] = useState<boolean>(false);
  const [gameKey, setGameKey] = useState<number>(0);

  // --------------------------------------------------------------------------
  // 3. RIGHT PANEL WORKSPACE STATE
  // --------------------------------------------------------------------------
  const [activeTab, setActiveTab] = useState<'game' | 'pdf' | 'video'>('game');
  const [isFullscreenCanvas, setIsFullscreenCanvas] = useState<boolean>(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState<boolean>(true);
  const [generatedVideo, setGeneratedVideo] = useState<VideoJobState | null>(null);
  const [pdfPageNumber, setPdfPageNumber] = useState<number>(1);
  const [pdfContextText, setPdfContextText] = useState<string>('');

  // DOM Refs
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const jsonFileInputRef = useRef<HTMLInputElement>(null);
  const ocrFileInputRef = useRef<HTMLInputElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  // Character count
  const charCount = lessonText.length;

  // --------------------------------------------------------------------------
  // 4. DYNAMIC CLASSIFIER RECALCULATION
  // --------------------------------------------------------------------------
  const [classification, setClassification] = useState<ClassificationReport>(() =>
    classifyLessonEngine(lessonText)
  );

  const updateClassifierScores = useCallback((text: string) => {
    if (!text || !text.trim()) return;
    const report = classifyLessonEngine(text);
    setClassification(report);

    // Auto-align subject and grade level if detected with strong confidence
    if (report.extractedEntities.subject) {
      setSubject(report.extractedEntities.subject);
    }
    if (report.extractedEntities.gradeLevel) {
      setGradeLevel(report.extractedEntities.gradeLevel);
    }
  }, []);

  // Update classification whenever lesson text changes
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const nextVal = e.target.value;
    setLessonText(nextVal);
    updateClassifierScores(nextVal);
  };

  // --------------------------------------------------------------------------
  // 5. PRESET SELECTION HANDLER
  // --------------------------------------------------------------------------
  const handleSelectPreset = (preset: PresetLesson) => {
    setSelectedPresetId(preset.id);
    setLessonTitle(preset.titleKhmer);
    setLessonText(preset.content);
    setSubject(preset.subject);
    setGradeLevel(preset.gradeLevel);
    setSelectedEngineOverride(null);
    setLessonMaterial({
      lessonTitleKhmer: preset.titleKhmer,
      lessonSummaryKhmer: preset.content.slice(0, 350),
      pageNumber: preset.gradeLevel,
    });
    updateClassifierScores(preset.content);
    soundSynthesizer.playPop();
  };

  // --------------------------------------------------------------------------
  // 6. DYNAMIC IMPORT / UPLOAD HANDLERS
  // --------------------------------------------------------------------------

  // A. JSON Game Import
  const handleJsonUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setProcessingMessage('កំពុងអានឯកសារ JSON...');

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.titleKhmer && parsed.levels) {
          setCompiledGame(parsed);
          setLessonTitle(parsed.titleKhmer);
          if (parsed.subject) setSubject(parsed.subject);
          if (parsed.gradeLevel) setGradeLevel(parsed.gradeLevel);
          if (parsed.engineType) setSelectedEngineOverride(parsed.engineType);
          setActiveTab('game');
          setGameKey((prev) => prev + 1);
          soundSynthesizer.playSuccess();
        } else {
          alert('ទម្រង់ JSON មិនត្រឹមត្រូវសម្រាប់ល្បែង SmartKids ទេ។');
        }
      } catch (err) {
        alert('មិនអាចអានឯកសារ JSON បានទេ៖ កំហុស Syntax');
      } finally {
        setIsProcessing(false);
        setProcessingMessage('');
        if (jsonFileInputRef.current) jsonFileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  // B. Image OCR Simulation
  const handleOcrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setProcessingMessage('កំពុងស្កេនរូបភាព និងស្រង់អត្ថបទ (OCR)...');

    try {
      const res = await simulateOcrExtraction(file);
      const extractedText = typeof res === 'string' ? res : res.extractedText;
      setLessonText(extractedText);
      updateClassifierScores(extractedText);
      soundSynthesizer.playSuccess();
    } catch (err) {
      alert('កំហុសក្នុងការស្កេនរូបភាព');
    } finally {
      setIsProcessing(false);
      setProcessingMessage('');
      if (ocrFileInputRef.current) ocrFileInputRef.current.value = '';
    }
  };

  // C. PDF Page Context Import
  const handlePdfExtractContext = (ctx: PageExtractContext) => {
    setPdfPageNumber(ctx.pageNumber);
    setPdfContextText(ctx.text);
    setLessonText(ctx.text);
    updateClassifierScores(ctx.text);

    // Save lesson material snippet
    setLessonMaterial({
      pdfUrl: '/curriculum/math-g1.pdf',
      pageNumber: ctx.pageNumber,
      snippetBase64: ctx.snippetImageBase64,
      lessonTitleKhmer: lessonTitle,
      lessonSummaryKhmer: ctx.text.slice(0, 350),
    });

    soundSynthesizer.playSuccess();
  };

  // --------------------------------------------------------------------------
  // 7. COMPILATION PIPELINE (Real AI with Heuristic Fallback)
  // --------------------------------------------------------------------------
  const handleCompileGame = async () => {
    if (!lessonText.trim()) {
      alert('សូមបញ្ចូលអត្ថបទមេរៀនជាមុនសិន!');
      return;
    }

    setIsCompiling(true);
    soundSynthesizer.playSuccess();

    try {
      const response = await fetch('/api/studio/compile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lessonText,
          lessonTitle,
          subject,
          gradeLevel,
          engineOverride: selectedEngineOverride,
          lessonMaterial,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned status: ${response.status}`);
      }

      const data = await response.json();
      const newGame: GeneratedGameConfig = data.gameConfig || data.game;

      // Attach classroom pin and lesson material
      const pin = newGame.metadata?.classroomPin || String(Math.floor(100000 + Math.random() * 900000));
      setSharePin(pin);
      newGame.metadata = {
        ...newGame.metadata,
        classroomPin: pin,
      };
      newGame.lessonMaterial = lessonMaterial;

      setCompiledGame(newGame);
      setGameKey((prev) => prev + 1);
      setActiveTab('game');

      // Auto-save custom game locally and to API
      await saveCustomGame(newGame);
      soundSynthesizer.playSuccess();
    } catch (err: any) {
      console.warn('AI Compilation API error, falling back locally:', err.message);
      const chosenEngine = selectedEngineOverride || classification.selectedEngine;
      const pin = String(Math.floor(100000 + Math.random() * 900000));
      setSharePin(pin);

      const fallbackGame: GeneratedGameConfig = {
        id: `game_${Date.now()}`,
        titleKhmer: lessonTitle || 'ល្បែងសិក្សាថ្មី',
        titleEnglish: 'Educational Game',
        subject,
        gradeLevel,
        instructionsKhmer: 'ជ្រើសរើសចម្លើយ ឬផ្គូផ្គងធាតុដែលត្រឹមត្រូវ!',
        instructionsEnglish: 'Choose the correct answer or match items!',
        template: chosenEngine,
        engineType: chosenEngine,
        metadata: {
          targetCompetency: 'ការយល់ដឹងអំពីមេរៀន',
          classroomPin: pin,
        },
        levels: [
          {
            levelId: 1,
            promptText: 'ជ្រើសរើសចម្លើយដែលត្រឹមត្រូវតាមមេរៀន',
            gameplayData: {
              items: [
                { id: '1', textKhmer: 'ត្រឹមត្រូវ', isTarget: true } as any,
                { id: '2', textKhmer: 'មិនត្រឹមត្រូវ', isTarget: false } as any,
              ],
            },
          },
        ],
        lessonMaterial,
      };

      setCompiledGame(fallbackGame);
      setGameKey((prev) => prev + 1);
      setActiveTab('game');
      await saveCustomGame(fallbackGame);
      soundSynthesizer.playSuccess();
    } finally {
      setIsCompiling(false);
    }
  };

  // Copy Share PIN
  const handleCopyPin = () => {
    if (!sharePin) return;
    navigator.clipboard.writeText(sharePin);
    setCopySuccess(true);
    soundSynthesizer.playPop();
    setTimeout(() => setCopySuccess(false), 2500);
  };

  // Fullscreen toggle for game canvas
  const toggleFullscreen = () => {
    setIsFullscreenCanvas((prev) => !prev);
  };

  // Handle Return to Student Hub or Previous Page
  const handleBack = () => {
    soundSynthesizer.playPop();
    if (onBackToStudentMode) {
      onBackToStudentMode();
    } else if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/teacher/dashboard');
    }
  };

  // Handle Play in Student Hub
  const handlePlayInHub = () => {
    if (!compiledGame) return;
    soundSynthesizer.playSuccess();
    if (onPlayInStudentHub) {
      onPlayInStudentHub(compiledGame);
    } else {
      setActiveGame(null);
      setActiveCustomGame(compiledGame);
      router.push('/');
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDF7] flex flex-col font-sans">
      {/* 1. TOP APP BAR */}
      <header className="border-b-2 border-amber-200/80 bg-white/95 backdrop-blur-md sticky top-0 z-30 px-3 sm:px-6 py-2 sm:py-2.5 flex items-center justify-between shadow-2xs">
        {/* Left: Back + Title */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={handleBack}
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-2xl bg-amber-50 hover:bg-amber-100/80 text-amber-950 border-2 border-amber-300 shadow-[0_3px_0_0_#F59E0B] active:translate-y-[2px] active:shadow-none transition cursor-pointer font-bold text-xs sm:text-sm font-heading"
            title="ត្រឡប់ទៅទំព័រមុន (Back)"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
            <span className="leading-relaxed">
              {onBackToStudentMode ? 'ត្រឡប់ទៅមជ្ឈមណ្ឌលសិស្ស' : 'ត្រឡប់ក្រោយ (Back)'}
            </span>
          </button>

          <div className="h-6 w-px bg-amber-200 hidden sm:block" />

          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-500 text-white flex items-center justify-center text-lg shadow-2xs font-black">
              🐘
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading font-black text-amber-950 text-base sm:text-lg tracking-tight leading-relaxed">
                  SmartKids
                </span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-300 font-mono">
                  AI Studio
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-khmer font-medium hidden md:block leading-relaxed">
                ស្ទូឌីយោបង្កើតល្បែង និងវីដេអូបង្រៀន AI សម្រាប់លោកគ្រូ អ្នកគ្រូ
              </p>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Hidden JSON & OCR File Inputs */}
          <input
            ref={jsonFileInputRef}
            type="file"
            accept=".json"
            onChange={handleJsonUpload}
            className="hidden"
          />
          <input
            ref={ocrFileInputRef}
            type="file"
            accept="image/*"
            onChange={handleOcrUpload}
            className="hidden"
          />

          {/* Import JSON Button */}
          <button
            onClick={() => {
              soundSynthesizer.playPop();
              jsonFileInputRef.current?.click();
            }}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-white hover:bg-amber-50 text-amber-950 border-2 border-amber-200/90 shadow-2xs active:translate-y-[2px] transition text-xs font-bold font-kantumruy cursor-pointer"
            title="នាំចូលទម្រង់ JSON"
          >
            <FileCode className="w-4 h-4 text-amber-700" />
            <span className="leading-relaxed">នាំចូល JSON</span>
          </button>

          {/* Export JSON Button (when game is compiled) */}
          {compiledGame && (
            <button
              onClick={() => {
                soundSynthesizer.playSuccess();
                exportGameAsJson(compiledGame);
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-950 border-2 border-emerald-300 shadow-2xs active:translate-y-[2px] transition text-xs font-bold font-kantumruy cursor-pointer"
              title="ទាញយកជា JSON"
            >
              <Download className="w-4 h-4 text-emerald-700" />
              <span className="hidden md:inline leading-relaxed">ទាញយក JSON</span>
            </button>
          )}

          {/* Classroom PIN Badge */}
          {sharePin && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-amber-100/90 border-2 border-amber-200/90 shadow-2xs">
              <span className="text-xs font-bold text-amber-900 font-khmer leading-relaxed">PIN:</span>
              <span className="font-mono font-black text-amber-950 text-sm tracking-wider">
                {sharePin}
              </span>
              <button
                onClick={handleCopyPin}
                className="p-1 rounded-lg hover:bg-amber-200 text-amber-950 transition cursor-pointer"
                title="ចម្លង PIN"
              >
                {copySuccess ? (
                  <Check className="w-3.5 h-3.5 text-emerald-700" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          )}

          {/* Play in Student Hub Button (when compiled) */}
          {compiledGame && (
            <button
              onClick={handlePlayInHub}
              className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white border-b-4 border-emerald-700 shadow-[0_3px_0_0_#047857] active:border-b-0 active:translate-y-1 transition text-xs sm:text-sm font-black font-kantumruy cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              <span className="leading-relaxed">លេងក្នុង Game Hub</span>
            </button>
          )}

          {/* Switch Role / Logout */}
          <button
            type="button"
            onClick={() => {
              logout();
              router.push('/login');
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold font-kantumruy transition cursor-pointer"
            title="ចាកចេញ / ប្តូរតួនាទី"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">ចាកចេញ</span>
          </button>
        </div>
      </header>

      {/* 2. MAIN 2-COLUMN WORKSPACE */}
      <main className="flex-1 p-3 sm:p-5 lg:p-6 max-w-7xl mx-auto w-full flex flex-col lg:flex-row gap-5 lg:gap-6 items-start">
        {/* ==================================================================== */}
        {/* LEFT COLUMN: CURRICULUM PRESETS & LESSON INGESTION                 */}
        {/* ==================================================================== */}
        <aside className="w-full lg:w-[420px] shrink-0 flex flex-col gap-4 h-[calc(100vh-85px)] overflow-y-auto pr-2 pb-6">
          {/* Card: MoEYS Curriculum Presets */}
          <div className="bg-white rounded-3xl border-2 border-amber-200/70 p-4 sm:p-5 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-600" />
                <h2 className="font-heading font-black text-amber-950 text-sm sm:text-base leading-relaxed">
                  គំរូមេរៀនតាមកម្មវិធីសិក្សា MoEYS
                </h2>
              </div>
              <span className="text-[11px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full font-mono leading-relaxed">
                ៥ មេរៀន
              </span>
            </div>

            {/* Presets List */}
            <div className="flex flex-col gap-3 max-h-52 overflow-y-auto pr-1">
              {PRESET_MOEYS_LESSONS.map((preset) => {
                const isSelected = selectedPresetId === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className={`relative w-full text-left flex items-start gap-3 p-2.5 rounded-xl border cursor-pointer shrink-0 h-auto min-h-fit overflow-hidden transition-colors ${
                      isSelected
                        ? 'border-amber-400 bg-amber-100/70 shadow-xs'
                        : 'border-amber-200 bg-amber-50/40 hover:bg-amber-100/60'
                    }`}
                  >
                    <div
                      className={`p-2 rounded-xl flex-shrink-0 mt-0.5 ${
                        isSelected ? 'bg-amber-200' : 'bg-amber-100/70'
                      }`}
                    >
                      {PRESET_ICON_MAP[preset.id] || <BookOpen className="w-5 h-5 text-amber-700" />}
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col gap-0.5 overflow-hidden">
                      <div className="flex items-center justify-between gap-1.5">
                        <span className="font-heading font-black text-xs sm:text-sm text-amber-950 truncate leading-relaxed">
                          {preset.titleKhmer}
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-mono shrink-0 leading-relaxed">
                          ថ្នាក់ទី {preset.gradeLevel}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 font-khmer line-clamp-2 text-ellipsis overflow-hidden leading-relaxed">
                        {preset.content}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Card: Lesson Content & Ingestion Editor */}
          <div className="bg-white rounded-3xl border-2 border-amber-200/70 p-4 sm:p-5 shadow-sm hover:shadow-md transition-all flex flex-col gap-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <h2 className="font-heading font-black text-amber-950 text-sm sm:text-base leading-relaxed">
                  អត្ថបទមេរៀន និងប្រភពទិន្នន័យ
                </h2>
              </div>
              <span className="text-[11px] font-mono text-slate-500 font-medium leading-relaxed">
                {charCount} តួអក្សរ
              </span>
            </div>

            {/* Title Input */}
            <div>
              <label className="block text-xs font-bold text-amber-900 font-khmer mb-1.5 leading-relaxed">
                ចំណងជើងមេរៀន ៖
              </label>
              <input
                type="text"
                value={lessonTitle}
                onChange={(e) => setLessonTitle(e.target.value)}
                placeholder="ឧ. ការដុះពន្លកនៃរុក្ខជាតិ..."
                className="w-full px-3.5 py-2.5 rounded-2xl border-2 border-amber-200/80 focus:border-amber-400 focus:outline-hidden font-heading font-bold text-sm text-amber-950 bg-amber-50/20 leading-relaxed transition-colors"
              />
            </div>

            {/* Subject & Grade Level Pickers */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-bold text-amber-900 font-khmer mb-1.5 leading-relaxed">
                  មុខវិជ្ជា ៖
                </label>
                <div className="relative flex items-center">
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value as SubjectId)}
                    className="w-full h-11 pl-3 pr-9 rounded-xl border-2 border-amber-200/80 focus:border-amber-400 focus:outline-hidden font-khmer font-bold text-xs sm:text-sm text-amber-950 bg-amber-50/20 leading-relaxed transition-colors appearance-none cursor-pointer"
                  >
                    <option value="science">វិទ្យាសាស្ត្រ (Science)</option>
                    <option value="math">គណិតវិទ្យា (Math)</option>
                    <option value="khmer">ភាសាខ្មែរ (Khmer)</option>
                    <option value="social">សិក្សាសង្គម (Social)</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-amber-600 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-amber-900 font-khmer mb-1.5 leading-relaxed">
                  កម្រិតថ្នាក់ ៖
                </label>
                <div className="relative flex items-center">
                  <select
                    value={gradeLevel}
                    onChange={(e) => setGradeLevel(Number(e.target.value) as GradeLevel)}
                    className="w-full h-11 pl-3 pr-9 rounded-xl border-2 border-amber-200/80 focus:border-amber-400 focus:outline-hidden font-khmer font-bold text-xs sm:text-sm text-amber-950 bg-amber-50/20 leading-relaxed transition-colors appearance-none cursor-pointer"
                  >
                    <option value={1}>ថ្នាក់ទី ១ (Grade 1)</option>
                    <option value={2}>ថ្នាក់ទី ២ (Grade 2)</option>
                    <option value={3}>ថ្នាក់ទី ៣ (Grade 3)</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-amber-600 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Lesson Textarea */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-amber-900 font-khmer leading-relaxed">
                  ខ្លឹមសារមេរៀន / កំណត់ចំណាំ ៖
                </label>
                <SpeakButton text={lessonText} label="ស្តាប់" />
              </div>
              <textarea
                ref={textareaRef}
                value={lessonText}
                onChange={handleTextChange}
                rows={7}
                placeholder="សរសេរ ឬបិទភ្ជាប់ខ្លឹមសារមេរៀននៅទីនេះ..."
                className="w-full p-3.5 rounded-2xl border-2 border-amber-200/80 focus:border-amber-400 focus:outline-hidden font-kantumruy text-xs sm:text-sm text-slate-800 leading-loose bg-amber-50/20 resize-y transition-colors"
              />
            </div>

            {/* Ingestion Action Buttons (OCR & PDF Extract) */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => {
                  soundSynthesizer.playPop();
                  ocrFileInputRef.current?.click();
                }}
                disabled={isProcessing}
                className="flex-1 min-w-[130px] py-2 px-3 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-900 border-2 border-amber-300 shadow-[0_3px_0_0_#FCD34D] active:translate-y-[2px] active:shadow-none transition text-xs font-bold font-kantumruy flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
              >
                <Upload className="w-3.5 h-3.5 text-amber-700" />
                <span className="leading-relaxed">ស្កេនរូបភាព OCR</span>
              </button>

              <button
                onClick={() => {
                  soundSynthesizer.playPop();
                  setActiveTab('pdf');
                }}
                className="flex-1 min-w-[130px] py-2 px-3 rounded-2xl bg-purple-50 hover:bg-purple-100 text-purple-900 border-2 border-purple-300 shadow-[0_3px_0_0_#D8B4FE] active:translate-y-[2px] active:shadow-none transition text-xs font-bold font-kantumruy flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5 text-purple-700" />
                <span className="leading-relaxed">ស្រង់ចេញពី PDF</span>
              </button>
            </div>

            {/* Processing Banner */}
            {isProcessing && (
              <div className="p-3 rounded-2xl bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-amber-700" />
                <span className="leading-relaxed">{processingMessage}</span>
              </div>
            )}

            {/* Smart Classifier & Engine Recommendation */}
            <div className="p-3.5 rounded-2xl bg-amber-50/70 border-2 border-amber-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-600" />
                  <span className="text-xs font-bold text-amber-950 font-khmer leading-relaxed">
                    ម៉ាស៊ីនល្បែងដែលបានណែនាំដោយ AI ៖
                  </span>
                </div>
                <span className="text-[11px] font-mono font-black text-purple-800 bg-purple-100 px-2 py-0.5 rounded-full border border-purple-200">
                  {selectedEngineOverride || classification.selectedEngine}
                </span>
              </div>

              {/* Confidence Meter */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-slate-600 font-medium">
                  <span className="leading-relaxed">កម្រិតត្រូវគ្នា (AI Match):</span>
                  <span className="font-mono font-bold text-amber-900">
                    {Math.round(classification.confidencePercentage)}%
                  </span>
                </div>
                <div className="h-2 w-full bg-amber-200/60 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.round(classification.confidencePercentage)}%` }}
                  />
                </div>
              </div>

              {/* Engine Override Selector */}
              <div className="pt-1">
                <label className="block text-[11px] font-bold text-amber-900 font-khmer mb-1 leading-relaxed">
                  ប្តូរម៉ាស៊ីនល្បែងដោយខ្លួនឯង (Engine Override) ៖
                </label>
                <div className="relative flex items-center">
                  <select
                    value={selectedEngineOverride || ''}
                    onChange={(e) =>
                      setSelectedEngineOverride(
                        e.target.value ? (e.target.value as UniversalEngineType) : null
                      )
                    }
                    className="w-full h-10 pl-2.5 pr-8 rounded-xl border border-amber-300 text-xs font-mono font-bold text-amber-950 bg-white leading-relaxed appearance-none cursor-pointer"
                  >
                    <option value="">-- ប្រើម៉ាស៊ីនស្វ័យប្រវត្តិតាម AI --</option>
                    <option value="sorter">Sorter (ការចាត់ថ្នាក់ / ញែកធាតុ)</option>
                    <option value="sequencer">Sequencer (លំដាប់លំដោយ / ដំណាក់កាល)</option>
                    <option value="market_math">Market Math (ទីផ្សារគណិតវិទ្យា)</option>
                    <option value="khmer_trace">Khmer Trace (គូសតួអក្សរ / ព្យាង្គ)</option>
                    <option value="sandbox">Sandbox (ពិសោធន៍បរិស្ថាន / រុក្ខជាតិ)</option>
                    <option value="mcq">MCQ Quiz (កម្រងសំណួរពហុជ្រើសរើស)</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-amber-600 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* SmartKids 3D Compile Button */}
            <button
              onClick={handleCompileGame}
              disabled={isCompiling || !lessonText.trim()}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-white font-black text-sm sm:text-base font-kantumruy border-b-4 border-amber-700 shadow-[0_4px_0_0_#B45309] active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isCompiling ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="leading-relaxed">កំពុងបង្កើតល្បែង AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 stroke-[2.5]" />
                  <span className="leading-relaxed">បង្កើតល្បែងអន្តរកម្ម (Compile Game)</span>
                </>
              )}
            </button>
          </div>
        </aside>

        {/* ==================================================================== */}
        {/* RIGHT COLUMN: PREVIEW WORKSPACE (GAME / PDF / VIDEO)                */}
        {/* ==================================================================== */}
        <section className="flex-1 min-w-0 flex flex-col gap-4 h-[calc(100vh-85px)] overflow-y-auto pr-0.5 pb-6 scrollbar-thin scrollbar-thumb-amber-200/80">
          {/* Workspace Tabs */}
          <div className="bg-white rounded-3xl border-2 border-amber-200/70 p-2 sm:p-2.5 shadow-sm flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={() => {
                  soundSynthesizer.playPop();
                  setActiveTab('game');
                }}
                className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-2xl font-kantumruy font-black text-xs sm:text-sm transition-all cursor-pointer leading-relaxed ${
                  activeTab === 'game'
                    ? 'bg-amber-400 text-amber-950 border-b-4 border-amber-600 shadow-sm font-black'
                    : 'bg-amber-50/60 hover:bg-amber-100/80 text-amber-900 border-2 border-transparent font-bold'
                }`}
              >
                <Gamepad2 className="w-4 h-4 stroke-[2.2]" />
                <span className="leading-relaxed">១. ល្បែងអន្តរកម្ម</span>
              </button>

              <button
                onClick={() => {
                  soundSynthesizer.playPop();
                  setActiveTab('pdf');
                }}
                className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-2xl font-kantumruy font-black text-xs sm:text-sm transition-all cursor-pointer leading-relaxed ${
                  activeTab === 'pdf'
                    ? 'bg-amber-400 text-amber-950 border-b-4 border-amber-600 shadow-sm font-black'
                    : 'bg-amber-50/60 hover:bg-amber-100/80 text-amber-900 border-2 border-transparent font-bold'
                }`}
              >
                <BookOpen className="w-4 h-4 stroke-[2.2]" />
                <span className="leading-relaxed">២. សៀវភៅពុម្ព PDF</span>
              </button>

              <button
                onClick={() => {
                  soundSynthesizer.playPop();
                  setActiveTab('video');
                }}
                className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-2xl font-kantumruy font-black text-xs sm:text-sm transition-all cursor-pointer leading-relaxed ${
                  activeTab === 'video'
                    ? 'bg-amber-400 text-amber-950 border-b-4 border-amber-600 shadow-sm font-black'
                    : 'bg-amber-50/60 hover:bg-amber-100/80 text-amber-900 border-2 border-transparent font-bold'
                }`}
              >
                <Video className="w-4 h-4 stroke-[2.2]" />
                <span className="leading-relaxed">៣. វីដេអូបង្រៀន AI</span>
              </button>
            </div>

            {/* Quick Canvas Controls */}
            {activeTab === 'game' && compiledGame && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    soundSynthesizer.playPop();
                    setGameKey((k) => k + 1);
                  }}
                  className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100/80 text-amber-900 border border-amber-300 transition cursor-pointer"
                  title="ចាប់ផ្តើមល្បែងឡើងវិញ"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                <button
                  onClick={() => {
                    soundSynthesizer.playPop();
                    setIsSoundEnabled((prev) => !prev);
                  }}
                  className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100/80 text-amber-900 border border-amber-300 transition cursor-pointer"
                  title={isSoundEnabled ? 'បិទសំឡេង' : 'បើកសំឡេង'}
                >
                  {isSoundEnabled ? (
                    <Volume2 className="w-4 h-4" />
                  ) : (
                    <VolumeX className="w-4 h-4 text-slate-400" />
                  )}
                </button>

                <button
                  onClick={() => {
                    soundSynthesizer.playPop();
                    toggleFullscreen();
                  }}
                  className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100/80 text-amber-900 border border-amber-300 transition cursor-pointer"
                  title="ពង្រីកពេញអេក្រង់"
                >
                  {isFullscreenCanvas ? (
                    <Minimize2 className="w-4 h-4" />
                  ) : (
                    <Maximize2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            )}
          </div>

          {/* TAB 1: GAME RUNNER CANVAS */}
          {activeTab === 'game' && (
            <div
              ref={canvasContainerRef}
              className={`bg-white rounded-3xl border-2 border-amber-200/70 shadow-sm overflow-hidden ${
                isFullscreenCanvas
                  ? 'fixed inset-0 z-50 rounded-none border-none p-4 bg-slate-900/90 backdrop-blur-md flex items-center justify-center'
                  : 'min-h-[560px] flex flex-col'
              }`}
            >
              {compiledGame ? (
                <div className="w-full flex-1 p-3 sm:p-4 bg-[#FFFDF7]">
                  <div className="flex items-center justify-between mb-3 px-2">
                    <div>
                      <h3 className="font-heading font-black text-base sm:text-lg text-amber-950 leading-relaxed">
                        {compiledGame.titleKhmer}
                      </h3>
                      <p className="text-xs text-amber-800 font-khmer leading-relaxed">
                        {compiledGame.instructionsKhmer}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          soundSynthesizer.playPop();
                          setSandboxModalOpen(true);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 text-xs font-bold font-kantumruy transition cursor-pointer flex items-center gap-1 leading-relaxed"
                      >
                        <Zap className="w-3.5 h-3.5 text-amber-700" />
                        <span className="leading-relaxed">Sandbox</span>
                      </button>
                    </div>
                  </div>

                  {/* Universal Game Runner Container */}
                  <div className="rounded-2xl border-2 border-amber-200/70 bg-white overflow-hidden shadow-xs">
                    <UniversalGameRunner
                      key={gameKey}
                      gameConfig={compiledGame}
                      onExit={() => {}}
                    />
                  </div>
                </div>
              ) : (
                /* Empty Placeholder State */
                <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10 text-center bg-gradient-to-b from-amber-50/30 via-white to-amber-50/20">
                  {/* Layered Icon Presentation */}
                  <div className="relative mb-5 flex items-center justify-center">
                    <div className="absolute inset-0 w-24 h-24 rounded-full bg-amber-400/20 blur-xl animate-pulse" />
                    <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-400 to-yellow-300 border-2 border-amber-300 shadow-md flex items-center justify-center text-amber-950">
                      <Gamepad2 className="w-10 h-10 stroke-[2.2] animate-bounce-gentle" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white shadow-xs">
                      <Sparkles className="w-4 h-4 fill-white" />
                    </div>
                  </div>

                  <h3 className="font-heading font-black text-lg sm:text-xl text-amber-950 mb-2 leading-relaxed">
                    មិនទាន់មានល្បែងត្រូវបានបង្កើតនៅឡើយទេ
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 font-khmer max-w-md mb-6 leading-relaxed">
                    សូមជ្រើសរើសគំរូមេរៀន MoEYS នៅខាងឆ្វេង ឬបញ្ចូលខ្លឹមសារមេរៀនដោយខ្លួនឯង រួចចុចប៊ូតុង{' '}
                    <strong className="text-amber-950 font-bold">«បង្កើតល្បែងអន្តរកម្ម»</strong> ដើម្បីសាកល្បងលេងផ្ទាល់។
                  </p>

                  {/* 3-Step Micro-Guide */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 max-w-lg w-full mb-7 text-left">
                    <div className="p-3 rounded-2xl bg-white border border-amber-200/80 shadow-2xs flex items-start gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-900 font-bold text-xs flex items-center justify-center shrink-0">
                        ១
                      </span>
                      <div className="text-[11px] font-khmer leading-relaxed">
                        <strong className="text-amber-950 block font-bold">ជ្រើសរើសមេរៀន</strong>
                        <span className="text-slate-500">ជ្រើសរើសពីគំរូ ៥ របស់ MoEYS</span>
                      </div>
                    </div>
                    <div className="p-3 rounded-2xl bg-white border border-amber-200/80 shadow-2xs flex items-start gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-900 font-bold text-xs flex items-center justify-center shrink-0">
                        ២
                      </span>
                      <div className="text-[11px] font-khmer leading-relaxed">
                        <strong className="text-amber-950 block font-bold">កែសម្រួលខ្លឹមសារ</strong>
                        <span className="text-slate-500">បន្ថែមអត្ថបទ ឬស្កេនរូបភាព</span>
                      </div>
                    </div>
                    <div className="p-3 rounded-2xl bg-white border border-amber-200/80 shadow-2xs flex items-start gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-900 font-bold text-xs flex items-center justify-center shrink-0">
                        ៣
                      </span>
                      <div className="text-[11px] font-khmer leading-relaxed">
                        <strong className="text-amber-950 block font-bold">លេង និងចែករំលែក</strong>
                        <span className="text-slate-500">សាកល្បងលេង និងចែក PIN</span>
                      </div>
                    </div>
                  </div>

                  {/* Primary Action Button */}
                  <button
                    onClick={handleCompileGame}
                    disabled={isCompiling || !lessonText.trim()}
                    className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-amber-950 font-black text-sm sm:text-base font-kantumruy border-b-4 border-amber-700 shadow-md active:border-b-0 active:translate-y-1 transition-all flex items-center gap-2.5 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed leading-relaxed"
                  >
                    <Sparkles className="w-4 h-4 fill-amber-950" />
                    <span className="leading-relaxed">បង្កើតល្បែងគំរូឥឡូវនេះ (Compile Now)</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PDF LESSON VIEWER */}
          {activeTab === 'pdf' && (
            <div className="bg-white rounded-3xl border-2 border-amber-200/80 shadow-xs p-4 sm:p-5">
              <PdfLessonViewer onExtractPageContext={handlePdfExtractContext} />
            </div>
          )}

          {/* TAB 3: AI VIDEO GENERATOR */}
          {activeTab === 'video' && (
            <div className="bg-white rounded-3xl border-2 border-amber-200/80 shadow-xs p-4 sm:p-5">
              <AIVideoGenerator
                lessonTitle={lessonTitle}
                lessonText={lessonText}
                subject={subject}
                gradeLevel={gradeLevel}
                onVideoGenerated={(video) => {
                  setGeneratedVideo(video);
                  soundSynthesizer.playSuccess();
                }}
              />
            </div>
          )}
        </section>
      </main>

      {/* 3. SANDBOX POPUP MODAL */}
      <AnimatePresence>
        {sandboxModalOpen && compiledGame && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
          >
            <div className="bg-[#FFFDF7] w-full max-w-5xl rounded-3xl shadow-2xl border-4 border-amber-300 overflow-hidden flex flex-col max-h-[92vh]">
              {/* Modal Top Bar */}
              <div className="px-6 py-4 border-b-2 border-amber-200 flex items-center justify-between bg-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xl border-2 border-amber-300 shadow-xs">
                    🎮
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-amber-950 font-heading leading-[1.8]">
                      {compiledGame.titleKhmer} (Sandbox Mode)
                    </h3>
                    <p className="text-xs text-amber-800 font-mono">
                      PIN: {sharePin} • Engine: {compiledGame.engineType} • ថ្នាក់ទី {compiledGame.gradeLevel}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSandboxModalOpen(false)}
                  className="p-2 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-900 border-2 border-amber-300 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Game Runner Body */}
              <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-[#FFFDF7]">
                <UniversalGameRunner
                  gameConfig={compiledGame}
                  onExit={() => setSandboxModalOpen(false)}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
export default TeacherStudioWorkspace;
