// src/components/studio/PreviewPanel.tsx
// Right Zone: Live Multi-Device Preview Panel (Game, PDF, AI Video, Alignment Score)

'use client';

import React, { useState } from 'react';
import {
  Gamepad2,
  BookOpen,
  Video,
  Monitor,
  Tablet,
  Smartphone,
  RotateCcw,
  Maximize2,
  Minimize2,
  Printer,
  Sparkles,
  CheckCircle2,
  Download,
} from 'lucide-react';
import { LessonDocument, CurriculumAlignmentData } from '@/lib/ai/types';
import { UniversalGameRunner } from '@/components/templates/UniversalGameRunner';
import { AIVideoGenerator } from '@/components/studio/AIVideoGenerator';
import { AIAlignmentScore } from './AIAlignmentScore';
import { soundSynthesizer } from '@/lib/audio/SoundSynthesizer';
import { exportGameAsJson } from '@/utils/customGames';

interface PreviewPanelProps {
  lesson: LessonDocument;
  activeTab: 'game' | 'pdf' | 'video';
  onTabChange: (tab: 'game' | 'pdf' | 'video') => void;
  onFixAlignment: () => void;
  isAiGenerating?: boolean;
}

export const PreviewPanel: React.FC<PreviewPanelProps> = ({
  lesson,
  activeTab,
  onTabChange,
  onFixAlignment,
  isAiGenerating = false,
}) => {
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [gameKey, setGameKey] = useState(0);

  // Convert lesson.game into GeneratedGameConfig format for UniversalGameRunner
  const gameConfig: any = {
    id: lesson.id,
    titleKhmer: lesson.game?.title || lesson.title,
    titleEnglish: lesson.topic,
    subject: lesson.subject,
    gradeLevel: lesson.grade,
    instructionsKhmer: lesson.game?.instructions || 'ជ្រើសរើសចម្លើយដែលត្រឹមត្រូវ',
    instructionsEnglish: 'Choose the correct answer',
    template: lesson.game?.gameType || 'sorter',
    engineType: lesson.game?.gameType || 'sorter',
    metadata: {
      targetCompetency: lesson.learningObjective,
      sourceLesson: lesson.title,
    },
    levels: lesson.game?.levels && lesson.game.levels.length > 0
      ? lesson.game.levels
      : [
          {
            levelId: 1,
            promptText: lesson.questions?.[0]?.question || 'លំហាត់អនុវត្តមេរៀន',
            gameplayData: {
              quizOptions: lesson.questions?.[0]?.options?.map((opt, i) => ({
                id: `opt_${i}`,
                textKhmer: opt,
                isCorrect: opt === lesson.questions[0].answer,
              })) || [],
            },
          },
        ],
    lessonMaterial: {
      lessonTitleKhmer: lesson.title,
      lessonSummaryKhmer: lesson.explanation.slice(0, 300),
      pageNumber: lesson.grade,
    },
  };

  const deviceWidthClass =
    deviceMode === 'mobile'
      ? 'max-w-[340px]'
      : deviceMode === 'tablet'
      ? 'max-w-[620px]'
      : 'max-w-full';

  return (
    <section className="w-full lg:w-[420px] xl:w-[460px] flex-shrink-0 flex flex-col border-l border-slate-200 bg-slate-50/40 h-full overflow-hidden">
      {/* ------------------------------------------------------------------ */}
      {/* 1. TOP TABS & DEVICE CONTROLS BAR                                 */}
      {/* ------------------------------------------------------------------ */}
      <div className="h-12 border-b border-slate-200 bg-white px-3 flex items-center justify-between shrink-0 gap-2">
        {/* Preview Tabs */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => {
              soundSynthesizer.playClick();
              onTabChange('game');
            }}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
              activeTab === 'game'
                ? 'bg-emerald-50 text-emerald-800'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Gamepad2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">ហ្គេម</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundSynthesizer.playClick();
              onTabChange('pdf');
            }}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
              activeTab === 'pdf'
                ? 'bg-indigo-50 text-indigo-800'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">PDF</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundSynthesizer.playClick();
              onTabChange('video');
            }}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
              activeTab === 'video'
                ? 'bg-purple-50 text-purple-800'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">វីដេអូ</span>
          </button>
        </div>

        {/* Device Switcher */}
        <div className="flex items-center gap-0.5 bg-slate-100 p-0.5 rounded-lg">
          <button
            type="button"
            onClick={() => setDeviceMode('desktop')}
            className={`p-1 rounded-md transition cursor-pointer ${
              deviceMode === 'desktop' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-400 hover:text-slate-700'
            }`}
            title="Desktop View"
          >
            <Monitor className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setDeviceMode('tablet')}
            className={`p-1 rounded-md transition cursor-pointer ${
              deviceMode === 'tablet' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-400 hover:text-slate-700'
            }`}
            title="Tablet View"
          >
            <Tablet className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setDeviceMode('mobile')}
            className={`p-1 rounded-md transition cursor-pointer ${
              deviceMode === 'mobile' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-400 hover:text-slate-700'
            }`}
            title="Mobile View"
          >
            <Smartphone className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 2. MAIN PREVIEW STAGE                                              */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 flex flex-col items-center justify-start space-y-4">
        {/* Device Container Frame */}
        <div className={`w-full ${deviceWidthClass} transition-all duration-300 flex-1 flex flex-col`}>
          {/* TAB 1: GAME PREVIEW */}
          {activeTab === 'game' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col flex-1">
              <div className="p-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 text-xs">
                <span className="font-bold text-slate-800 font-khmer truncate">
                  {lesson.game?.title || lesson.title}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      soundSynthesizer.playPop();
                      setGameKey((k) => k + 1);
                    }}
                    className="p-1 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition cursor-pointer"
                    title="ផ្ទុកឡើងវិញ"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => exportGameAsJson(gameConfig)}
                    className="p-1 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition cursor-pointer"
                    title="ទាញយក JSON"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="p-3 flex-1 overflow-y-auto min-h-[360px]">
                <UniversalGameRunner
                  key={gameKey}
                  gameConfig={gameConfig}
                  onExit={() => setGameKey((k) => k + 1)}
                />
              </div>
            </div>
          )}

          {/* TAB 2: PRINTABLE LESSON PDF PREVIEW */}
          {activeTab === 'pdf' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 font-khmer space-y-4 text-slate-800 text-xs leading-[1.9]">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h2 className="text-base font-bold text-slate-900">{lesson.title}</h2>
                  <p className="text-[11px] text-slate-500">
                    ក្រសួងអប់រំ យុវជន និងកីឡា • ថ្នាក់ទី {lesson.grade} • {lesson.subject}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>បោះពុម្ព</span>
                </button>
              </div>

              <div>
                <span className="font-bold text-slate-900 block text-xs uppercase">
                  ១. គោលបំណងមេរៀន៖
                </span>
                <p className="text-slate-700 mt-0.5">{lesson.learningObjective}</p>
              </div>

              <div>
                <span className="font-bold text-slate-900 block text-xs uppercase">
                  ២. ពាក្យគន្លឹះ៖
                </span>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  {lesson.keyConcepts?.map((c, i) => (
                    <div key={i} className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                      <span className="font-bold text-slate-900">{c.term}៖ </span>
                      <span className="text-slate-600">{c.definition}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-900 block text-xs uppercase">
                  ៣. ខ្លឹមសារមេរៀន៖
                </span>
                <p className="text-slate-700 whitespace-pre-line mt-0.5">{lesson.explanation}</p>
              </div>

              {lesson.activity && (
                <div>
                  <span className="font-bold text-slate-900 block text-xs uppercase">
                    ៤. សកម្មភាពអនុវត្ត ({lesson.activity.title})៖
                  </span>
                  <p className="text-slate-700 mt-0.5">{lesson.activity.instructions}</p>
                  <ul className="list-disc list-inside mt-1 space-y-0.5 text-slate-600">
                    {lesson.activity.steps?.map((st, i) => (
                      <li key={i}>{st}</li>
                    ))}
                  </ul>
                </div>
              )}

              {lesson.questions && lesson.questions.length > 0 && (
                <div className="pt-2 border-t border-slate-100">
                  <span className="font-bold text-slate-900 block text-xs uppercase">
                    ៥. កម្រងសំណួរវាយតម្លៃ៖
                  </span>
                  <div className="space-y-2 mt-1">
                    {lesson.questions.map((q, i) => (
                      <div key={i} className="space-y-0.5">
                        <p className="font-medium text-slate-900">
                          {i + 1}. {q.question}
                        </p>
                        <p className="text-[11px] text-emerald-800 font-bold">
                          ចម្លើយត្រឹមត្រូវ៖ {q.answer}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: AI VIDEO STORYBOARD TIMELINE */}
          {activeTab === 'video' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-xs">
                <span className="font-bold text-slate-900 font-khmer">
                  {lesson.video?.title || lesson.title}
                </span>
                <span className="text-[10px] text-purple-700 font-mono font-bold bg-purple-50 px-2 py-0.5 rounded-md">
                  Storyboard Active
                </span>
              </div>

              <div className="space-y-2.5">
                {lesson.video?.scenes?.map((sc, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs font-khmer space-y-1"
                  >
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span className="text-purple-900">ឈុតទី {sc.sceneNumber}</span>
                      <span className="font-mono text-slate-500">{sc.durationSec}s</span>
                    </div>
                    <p className="text-slate-800">
                      <span className="font-bold">រូបភាព៖ </span>
                      {sc.visualDescription}
                    </p>
                    <p className="text-slate-600 bg-white p-2 rounded-lg border border-slate-100">
                      «{sc.narrationText}»
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* 3. CURRICULUM ALIGNMENT SCORE COMPONENT                          */}
        {/* ------------------------------------------------------------------ */}
        {lesson.alignment && (
          <div className="w-full">
            <AIAlignmentScore
              alignment={lesson.alignment}
              onFixAlignment={onFixAlignment}
              isLoading={isAiGenerating}
            />
          </div>
        )}
      </div>
    </section>
  );
};
