// src/app/studio/page.tsx
// Teacher Lesson-to-Game Studio (Full Next.js App Router Page)
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { GeneratedGameConfig, UniversalEngineType, SubjectId, GradeLevel } from '@/types/game';
import {
  PRESET_MOEYS_LESSONS,
  classifyLessonEngine,
  simulateOcrExtraction,
  ClassificationReport,
} from '@/utils/aiCompiler';
import { soundSynthesizer } from '@/lib/audio/SoundSynthesizer';
import { saveCustomGame, exportGameAsJson } from '@/utils/customGames';
import { UniversalGameRunner } from '@/components/templates/UniversalGameRunner';
import { SpeakButton } from '@/components/audio/SpeakButton';
import {
  ArrowLeft,
  Sparkles,
  Upload,
  FileText,
  Play,
  Copy,
  Download,
  Check,
  RotateCcw,
  Zap,
  BookOpen,
  X,
  Share2,
  CheckCircle2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function TeacherStudioPage() {
  const [lessonTitle, setLessonTitle] = useState<string>('មេរៀនវិទ្យាសាស្ត្រ ថ្នាក់ទី១៖ ការដុះពន្លក');
  const [lessonContent, setLessonContent] = useState<string>(PRESET_MOEYS_LESSONS[0].content);
  const [subject, setSubject] = useState<SubjectId>('science');
  const [gradeLevel, setGradeLevel] = useState<GradeLevel>(1);
  const [isCompiling, setIsCompiling] = useState<boolean>(false);
  const [compiledGame, setCompiledGame] = useState<GeneratedGameConfig | null>(null);
  const [sandboxModalOpen, setSandboxModalOpen] = useState<boolean>(false);
  const [sharePin, setSharePin] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'json'>('editor');

  const [classification, setClassification] = useState<ClassificationReport>(() =>
    classifyLessonEngine(PRESET_MOEYS_LESSONS[0].content)
  );

  useEffect(() => {
    if (lessonContent.trim()) {
      const report = classifyLessonEngine(lessonContent);
      setClassification(report);
    }
  }, [lessonContent]);

  // Multimodal File Ingest (PDF / Images / Text)
  const handleFileUpload = (file: File) => {
    soundSynthesizer.playPop();
    const fileName = file.name;
    setLessonTitle(fileName.replace(/\.[^/.]+$/, ''));

    if (file.type === 'text/plain') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setLessonContent(text);
      };
      reader.readAsText(file);
    } else {
      // Simulate OCR vision extraction for images/PDFs
      simulateOcrExtraction(file).then((res) => {
        setLessonContent(res.extractedText);
      });
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  // Compile Lesson via Route Handler (/api/studio/compile)
  const handleCompile = async (overrideEngine?: UniversalEngineType) => {
    soundSynthesizer.playPop();
    setIsCompiling(true);

    try {
      const response = await fetch('/api/studio/compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonText: lessonContent,
          fileName: lessonTitle,
          subject,
          gradeLevel,
        }),
      });

      const data = await response.json();
      if (data.success && data.game) {
        const game: GeneratedGameConfig = data.game;
        if (overrideEngine) {
          game.engineType = overrideEngine;
          game.template = overrideEngine;
        }

        // Generate 6-digit classroom PIN
        const pin = Math.floor(100000 + Math.random() * 900000).toString();
        game.metadata.classroomPin = pin;
        setSharePin(pin);

        setCompiledGame(game);
        saveCustomGame(game);
        soundSynthesizer.playSuccess();
        soundSynthesizer.playCoin();
      } else {
        throw new Error(data.message || 'Compilation failed');
      }
    } catch (err) {
      console.error(err);
      soundSynthesizer.playError();
    } finally {
      setIsCompiling(false);
    }
  };

  const handleSelectPreset = (preset: (typeof PRESET_MOEYS_LESSONS)[0]) => {
    soundSynthesizer.playClick();
    setLessonTitle(preset.titleKhmer);
    setLessonContent(preset.content);
    setSubject(preset.subject);
    setGradeLevel(preset.gradeLevel);
  };

  const handleCopyPin = () => {
    if (!sharePin) return;
    navigator.clipboard.writeText(sharePin);
    setCopySuccess(true);
    soundSynthesizer.playCoin();
    setTimeout(() => setCopySuccess(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#FFFDF7] text-slate-800 font-kantumruy flex flex-col">
      {/* Top Header */}
      <header className="bg-white border-b-2 border-amber-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 transition flex items-center gap-1.5 text-sm font-bold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">ត្រឡប់ទៅទំព័រដើម</span>
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl">🎨</span>
                <h1 className="text-lg sm:text-xl font-black text-slate-900 font-kantumruy">
                  ស្ទូឌីយោបង្រៀនឆ្លាតវៃ • Teacher Lesson-to-Game Studio
                </h1>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                បំប្លែងខ្លឹមសារសៀវភៅសិក្សាគោល MoEYS ទៅជាហ្គេមអប់រំ ៥ ម៉ាស៊ីនស្វ័យប្រវត្តិ
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {compiledGame && (
              <button
                onClick={() => {
                  soundSynthesizer.playPop();
                  setSandboxModalOpen(true);
                }}
                className="px-4 py-2 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold shadow-md flex items-center gap-2 text-sm"
              >
                <Play className="w-4 h-4" />
                <span>សាកល្បងលេង (Play Sandbox)</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Studio Body */}
      <main className="max-w-7xl mx-auto w-full p-4 sm:p-6 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Lesson Ingest & Presets (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* MoEYS Presets Ribbon */}
          <div className="bg-white rounded-3xl p-5 border-2 border-amber-200/80 shadow-xs flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-4 h-4" />
                មេរៀនគំរូក្រសួងអប់រំ (MoEYS Presets):
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {PRESET_MOEYS_LESSONS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset)}
                  className="p-3 rounded-2xl border text-left bg-amber-50/60 hover:bg-amber-100/70 border-amber-200 transition flex flex-col gap-1 shadow-2xs"
                >
                  <span className="text-2xl">{preset.icon}</span>
                  <span className="text-xs font-bold text-slate-800 line-clamp-1 font-kantumruy">
                    {preset.titleKhmer}
                  </span>
                  <span className="text-[10px] text-amber-700 font-bold">
                    ថ្នាក់ទី {preset.gradeLevel} • {preset.recommendedEngine}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Lesson Title & Parameters */}
          <div className="bg-white rounded-3xl p-5 border-2 border-slate-200/80 shadow-sm flex flex-col gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">
                ចំណងជើងមេរៀន (Lesson Title):
              </label>
              <input
                type="text"
                value={lessonTitle}
                onChange={(e) => setLessonTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-hidden text-sm font-bold font-kantumruy"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">
                  មុខវិជ្ជា (Subject):
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value as SubjectId)}
                  className="w-full px-3 py-2 rounded-2xl border-2 border-slate-200 focus:border-indigo-500 outline-hidden text-xs font-bold font-kantumruy bg-white"
                >
                  <option value="science">វិទ្យាសាស្ត្រ (Science)</option>
                  <option value="math">គណិតវិទ្យា (Math)</option>
                  <option value="khmer">ភាសាខ្មែរ (Khmer Language)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">
                  កម្រិតថ្នាក់ (Grade Level):
                </label>
                <select
                  value={gradeLevel}
                  onChange={(e) => setGradeLevel(Number(e.target.value) as GradeLevel)}
                  className="w-full px-3 py-2 rounded-2xl border-2 border-slate-200 focus:border-indigo-500 outline-hidden text-xs font-bold font-kantumruy bg-white"
                >
                  <option value={1}>ថ្នាក់ទី ១ (Grade 1)</option>
                  <option value={2}>ថ្នាក់ទី ២ (Grade 2)</option>
                  <option value={3}>ថ្នាក់ទី ៣ (Grade 3)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Multimodal File Dropzone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`rounded-3xl border-3 border-dashed p-6 text-center transition flex flex-col items-center justify-center gap-2 cursor-pointer ${
              isDragging
                ? 'bg-indigo-50 border-indigo-500 shadow-md'
                : 'bg-white border-slate-300 hover:border-indigo-400'
            }`}
          >
            <Upload className="w-8 h-8 text-indigo-500" />
            <p className="text-sm font-bold text-slate-700 font-kantumruy">
              ទម្លាក់ឯកសារមេរៀន (PDF, រូបថតទំព័រសៀវភៅ, ឬ Text)
            </p>
            <p className="text-xs text-slate-400">ប្រព័ន្ធនឹងធ្វើការស្កេន OCR ដោយស្វ័យប្រវត្តិ</p>
            <label className="mt-2 px-4 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 font-bold text-xs hover:bg-indigo-100 transition cursor-pointer">
              ជ្រើសរើសឯកសារ
              <input
                type="file"
                accept=".pdf,image/*,.txt"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileUpload(e.target.files[0]);
                  }
                }}
              />
            </label>
          </div>

          {/* Raw Lesson Content Text Area */}
          <div className="bg-white rounded-3xl p-5 border-2 border-slate-200/80 shadow-sm flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-600">
                ខ្លឹមសារមេរៀន (Lesson Curriculum Text):
              </label>
              <SpeakButton text={lessonContent.slice(0, 150)} size="sm" variant="ghost" />
            </div>
            <textarea
              rows={6}
              value={lessonContent}
              onChange={(e) => setLessonContent(e.target.value)}
              className="w-full p-4 rounded-2xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-hidden text-sm font-medium font-kantumruy leading-relaxed resize-none"
              placeholder="បញ្ចូលខ្លឹមសារមេរៀនជាភាសាខ្មែរនៅទីនេះ..."
            />

            <button
              onClick={() => handleCompile()}
              disabled={isCompiling || !lessonContent.trim()}
              className="w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold text-base shadow-md flex items-center justify-center gap-2 transition"
            >
              {isCompiling ? (
                <>
                  <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
                  <span>កំពុងវិភាគ និងបង្កើតហ្គេម...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-amber-300" />
                  <span>បង្កើតហ្គេមស្វ័យប្រវត្ត (Generate Mini-Game)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Engine Classifier & Results (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Heuristic Classification Report Card */}
          <div className="bg-white rounded-3xl p-5 border-2 border-indigo-100 shadow-md flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-500" />
                ការវិភាគក្បួនម៉ាស៊ីន (Heuristic Engine Classifier)
              </span>
              <span className="text-xs bg-indigo-50 text-indigo-700 font-bold px-2.5 py-0.5 rounded-full">
                ទំនុកចិត្ត {classification.confidencePercentage}%
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-sky-50 border border-indigo-200">
              <p className="text-xs text-indigo-800 font-medium mb-1">ម៉ាស៊ីនដែលស័ក្តិសមបំផុត៖</p>
              <p className="text-lg font-black text-indigo-950 font-kantumruy">
                {classification.scores[0]?.engineNameKhmer || classification.selectedEngine}
              </p>
              <p className="text-xs text-indigo-600 font-mono mt-0.5">
                Engine: {classification.selectedEngine}
              </p>
            </div>

            {/* Scores breakdown */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold text-slate-500">ពិន្ទុម៉ាស៊ីនទាំង ៥ (Engine Fit):</span>
              {classification.scores.map((s) => (
                <div key={s.engine} className="flex flex-col gap-1">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span className="font-kantumruy">{s.engineNameKhmer}</span>
                    <span className="font-mono">{s.confidence}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${s.confidence}%` }}
                      className="h-full bg-indigo-500 rounded-full"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Generated Result Box */}
          {compiledGame ? (
            <div className="bg-white rounded-3xl p-5 border-2 border-emerald-200 shadow-md flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ហ្គេមបានបង្កើតរួចរាល់!
                </span>
                <span className="text-xs bg-emerald-50 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full">
                  PIN: {sharePin}
                </span>
              </div>

              <div>
                <h3 className="text-lg font-black text-slate-900 font-kantumruy">
                  {compiledGame.titleKhmer}
                </h3>
                <p className="text-xs text-slate-500 mt-1 font-kantumruy">
                  {compiledGame.instructionsKhmer}
                </p>
              </div>

              {/* Shareable PIN Box */}
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between">
                <div>
                  <p className="text-[11px] text-amber-800 font-bold">លេខកូដសិស្ស (Classroom PIN):</p>
                  <p className="text-2xl font-black font-mono text-amber-950 tracking-wider">
                    {sharePin}
                  </p>
                </div>
                <button
                  onClick={handleCopyPin}
                  className="px-3 py-1.5 rounded-xl bg-amber-200 hover:bg-amber-300 text-amber-900 text-xs font-bold transition flex items-center gap-1"
                >
                  {copySuccess ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copySuccess ? 'បានចម្លង!' : 'ចម្លង'}</span>
                </button>
              </div>

              {/* Actions: Sandbox Play, Download JSON */}
              <div className="flex gap-2">
                <button
                  onClick={() => setSandboxModalOpen(true)}
                  className="flex-1 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition"
                >
                  <Play className="w-4 h-4" />
                  <span>លេងសាកល្បង</span>
                </button>
                <button
                  onClick={() => exportGameAsJson(compiledGame)}
                  className="px-4 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition flex items-center justify-center"
                  title="ទាញយកជា JSON"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 rounded-3xl p-8 border-2 border-dashed border-slate-200 text-center flex flex-col items-center justify-center gap-2 text-slate-400">
              <Sparkles className="w-8 h-8 opacity-40" />
              <p className="text-sm font-bold font-kantumruy">មិនទាន់មានហ្គេមដែលបានបង្កើត</p>
              <p className="text-xs">
                ចុចប៊ូតុង «បង្កើតហ្គេមស្វ័យប្រវត្ត» ដើម្បីដំណើរការម៉ាស៊ីន AI
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Live Sandbox Modal (Testing Generated Game) */}
      <AnimatePresence>
        {sandboxModalOpen && compiledGame && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
          >
            <div className="bg-[#FFFDF7] w-full max-w-5xl rounded-3xl shadow-2xl border-4 border-amber-300 overflow-hidden flex flex-col max-h-[92vh]">
              {/* Modal Top Bar */}
              <div className="bg-white px-6 py-4 border-b-2 border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                    🎮
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 font-kantumruy">
                      {compiledGame.titleKhmer} (Sandbox Preview)
                    </h3>
                    <p className="text-xs text-slate-500 font-mono">
                      PIN: {sharePin} • Engine: {compiledGame.engineType}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSandboxModalOpen(false)}
                  className="p-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Game Sandbox Runner */}
              <div className="p-4 sm:p-6 overflow-y-auto flex-1">
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
