// src/components/studio/LessonEditor.tsx
// Center Zone: Interactive AI Workspace & Sectional Content Editor

'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  RefreshCw,
  Edit3,
  Wand2,
  CheckCircle2,
  Plus,
  Trash2,
  HelpCircle,
  Lightbulb,
  Gamepad2,
  Video,
  FileText,
  ListOrdered,
  Layers,
  Smile,
  ArrowRight,
  MessageSquare,
} from 'lucide-react';
import {
  LessonDocument,
  KeyConceptItem,
  LessonQuestion,
  AiActionType,
} from '@/lib/ai/types';
import { soundSynthesizer } from '@/lib/audio/SoundSynthesizer';

interface LessonEditorProps {
  lesson: LessonDocument;
  onUpdateLesson: (updated: LessonDocument) => void;
  onExecuteAiAction: (action: AiActionType, customInstruction?: string) => void;
  isActionLoading: boolean;
  activeAction: string | null;
}

export const LessonEditor: React.FC<LessonEditorProps> = ({
  lesson,
  onUpdateLesson,
  onExecuteAiAction,
  isActionLoading,
  activeAction,
}) => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'lesson' | 'activities' | 'questions' | 'game' | 'video'
  >('lesson');

  const [isEditingObjective, setIsEditingObjective] = useState(false);
  const [customPromptModal, setCustomPromptModal] = useState<string | null>(null);
  const [customPromptText, setCustomPromptText] = useState('');

  const handleUpdateExplanation = (newText: string) => {
    onUpdateLesson({
      ...lesson,
      explanation: newText,
    });
  };

  const handleAddConcept = () => {
    soundSynthesizer.playClick();
    const newConcept: KeyConceptItem = {
      id: `concept_${Date.now()}`,
      term: 'ពាក្យគន្លឹះថ្មី',
      definition: 'និយមន័យខ្លីងាយយល់...',
      icon: '💡',
    };
    onUpdateLesson({
      ...lesson,
      keyConcepts: [...lesson.keyConcepts, newConcept],
    });
  };

  const handleUpdateConcept = (index: number, updated: Partial<KeyConceptItem>) => {
    const next = [...lesson.keyConcepts];
    next[index] = { ...next[index], ...updated };
    onUpdateLesson({ ...lesson, keyConcepts: next });
  };

  const handleDeleteConcept = (index: number) => {
    soundSynthesizer.playPop();
    const next = lesson.keyConcepts.filter((_, i) => i !== index);
    onUpdateLesson({ ...lesson, keyConcepts: next });
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50/50 overflow-hidden">
      {/* ------------------------------------------------------------------ */}
      {/* 1. TOP SECTION TABS BAR                                           */}
      {/* ------------------------------------------------------------------ */}
      <div className="h-12 border-b border-slate-200 bg-white px-4 flex items-center justify-between shrink-0 overflow-x-auto gap-2">
        <div className="flex items-center gap-1">
          {[
            { id: 'overview', label: 'ទិដ្ឋភាពទូទៅ', icon: <Layers className="w-3.5 h-3.5" /> },
            { id: 'lesson', label: 'ខ្លឹមសារមេរៀន', icon: <FileText className="w-3.5 h-3.5" /> },
            { id: 'activities', label: 'សកម្មភាព', icon: <ListOrdered className="w-3.5 h-3.5" /> },
            { id: 'questions', label: 'កម្រងសំណួរ', icon: <HelpCircle className="w-3.5 h-3.5" /> },
            { id: 'game', label: 'ល្បែងសិក្សា', icon: <Gamepad2 className="w-3.5 h-3.5" /> },
            { id: 'video', label: 'គំនូរព្រាងវីដេអូ', icon: <Video className="w-3.5 h-3.5" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                soundSynthesizer.playClick();
                setActiveTab(tab.id as any);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-purple-100 text-purple-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {isActionLoading && (
          <div className="flex items-center gap-2 text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg animate-pulse shrink-0">
            <Wand2 className="w-3.5 h-3.5 animate-spin" />
            <span>AI កំពុងដំណើរការ...</span>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 2. TAB CONTENT VIEWPORT                                            */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 max-w-4xl mx-auto w-full">
        {/* ================================================================ */}
        {/* TAB 1: OVERVIEW & LEARNING OBJECTIVE                             */}
        {/* ================================================================ */}
        {(activeTab === 'overview' || activeTab === 'lesson') && (
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                <span>គោលបំណងមេរៀន (Learning Objective)</span>
              </span>
              <button
                type="button"
                onClick={() => setIsEditingObjective(!isEditingObjective)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            </div>

            {isEditingObjective ? (
              <textarea
                value={lesson.learningObjective}
                onChange={(e) => onUpdateLesson({ ...lesson, learningObjective: e.target.value })}
                rows={2}
                className="w-full p-3 rounded-xl border border-slate-300 font-khmer text-xs leading-[1.8] text-slate-800 outline-hidden focus:border-indigo-500"
              />
            ) : (
              <p className="text-sm font-bold text-slate-800 font-khmer leading-[1.8] bg-slate-50 p-3 rounded-xl border border-slate-100">
                {lesson.learningObjective}
              </p>
            )}
          </div>
        )}

        {/* ================================================================ */}
        {/* TAB 2: LESSON EXPLANATION & KEY CONCEPTS                         */}
        {/* ================================================================ */}
        {activeTab === 'lesson' && (
          <>
            {/* Key Concepts Cards */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  ពាក្យគន្លឹះ និងគោលគំនិតចម្បង ({lesson.keyConcepts.length})
                </span>
                <button
                  type="button"
                  onClick={handleAddConcept}
                  className="inline-flex items-center gap-1 text-xs font-bold text-purple-700 hover:text-purple-900 bg-purple-50 px-2.5 py-1 rounded-lg transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>បន្ថែមពាក្យ</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {lesson.keyConcepts.map((concept, idx) => (
                  <div
                    key={concept.id || idx}
                    className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1.5 relative group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{concept.icon || '💡'}</span>
                        <input
                          type="text"
                          value={concept.term}
                          onChange={(e) => handleUpdateConcept(idx, { term: e.target.value })}
                          className="font-bold text-xs text-slate-800 font-khmer border-b border-transparent focus:border-indigo-400 outline-hidden"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteConcept(idx)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <textarea
                      value={concept.definition}
                      onChange={(e) => handleUpdateConcept(idx, { definition: e.target.value })}
                      rows={2}
                      className="w-full text-xs text-slate-600 font-khmer leading-[1.8] border-none bg-transparent outline-hidden resize-none"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Explanation Editor & AI Refinement Actions */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  ការពន្យល់មេរៀន (Explanation)
                </span>

                {/* Section-Specific AI Actions */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => onExecuteAiAction('improve_explanation')}
                    disabled={isActionLoading}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-800 text-[11px] font-bold transition cursor-pointer"
                    title="កែលម្អការពន្យល់ដោយ AI"
                  >
                    <Wand2 className="w-3 h-3 text-purple-600" />
                    <span>កែលម្អ (Improve)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onExecuteAiAction('simplify_explanation')}
                    disabled={isActionLoading}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold transition cursor-pointer"
                    title="សម្រួលឱ្យកាន់តែងាយយល់"
                  >
                    <Smile className="w-3 h-3 text-slate-500" />
                    <span>សម្រួល (Simplify)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onExecuteAiAction('make_interactive')}
                    disabled={isActionLoading}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 text-[11px] font-bold transition cursor-pointer"
                    title="បន្ថែមធាតុអន្តរកម្ម"
                  >
                    <MessageSquare className="w-3 h-3 text-amber-600" />
                    <span>អន្តរកម្ម (Interactive)</span>
                  </button>
                </div>
              </div>

              {/* Editable Textarea */}
              <textarea
                value={lesson.explanation}
                onChange={(e) => handleUpdateExplanation(e.target.value)}
                rows={8}
                className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 font-khmer text-xs sm:text-sm leading-[1.9] outline-hidden focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
              />

              {/* Real World Examples */}
              {lesson.examples && lesson.examples.length > 0 && (
                <div className="pt-2 border-t border-slate-100 space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    ឧទាហរណ៍ជាក់ស្តែង (Examples)
                  </span>
                  <ul className="space-y-1">
                    {lesson.examples.map((ex, i) => (
                      <li key={i} className="text-xs text-slate-700 font-khmer flex items-start gap-2">
                        <span className="text-indigo-600 font-bold">•</span>
                        <span>{ex}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </>
        )}

        {/* ================================================================ */}
        {/* TAB 3: ACTIVITIES                                                */}
        {/* ================================================================ */}
        {activeTab === 'activities' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 font-khmer">
                  {lesson.activity?.title || 'សកម្មភាពអនុវត្ត'}
                </h3>
                <p className="text-xs text-slate-500 font-khmer mt-0.5">
                  {lesson.activity?.instructions}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onExecuteAiAction('generate_activity')}
                disabled={isActionLoading}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 text-xs font-bold transition cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-purple-600" />
                <span>បង្កើតសកម្មភាពថ្មី</span>
              </button>
            </div>

            {/* Materials */}
            {lesson.activity?.materials && lesson.activity.materials.length > 0 && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <span className="text-[11px] font-bold text-slate-600 uppercase">
                  សម្ភារៈចាំបាច់៖
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {lesson.activity.materials.map((m, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-xs font-medium text-slate-700"
                    >
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Steps */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 uppercase">
                ជំហានអនុវត្ត៖
              </span>
              <div className="space-y-2">
                {lesson.activity?.steps?.map((step, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5 text-xs text-slate-800 font-khmer leading-[1.8]"
                  >
                    <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* TAB 4: QUESTIONS                                                 */}
        {/* ================================================================ */}
        {activeTab === 'questions' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                កម្រងសំណួរវាយតម្លៃ ({lesson.questions?.length || 0})
              </span>
              <button
                type="button"
                onClick={() => onExecuteAiAction('generate_questions')}
                disabled={isActionLoading}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 text-xs font-bold transition cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-purple-600" />
                <span>បង្កើតសំណួរថ្មី</span>
              </button>
            </div>

            <div className="space-y-3">
              {lesson.questions?.map((q, idx) => (
                <div
                  key={q.id || idx}
                  className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-md bg-purple-100 text-purple-800 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <p className="text-xs sm:text-sm font-bold text-slate-900 font-khmer leading-[1.8]">
                        {q.question}
                      </p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 uppercase">
                      {q.type}
                    </span>
                  </div>

                  {/* Options */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {q.options?.map((opt, optIdx) => {
                      const isCorrect = opt === q.answer;
                      return (
                        <div
                          key={optIdx}
                          className={`p-2.5 rounded-xl border text-xs font-medium font-khmer flex items-center justify-between ${
                            isCorrect
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold'
                              : 'bg-slate-50 border-slate-200 text-slate-700'
                          }`}
                        >
                          <span>{opt}</span>
                          {isCorrect && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation */}
                  {q.explanation && (
                    <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 font-khmer leading-[1.8]">
                      <span className="font-bold">ការពន្យល់៖ </span>
                      <span>{q.explanation}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* TAB 5: GAME SPECIFICATION                                        */}
        {/* ================================================================ */}
        {activeTab === 'game' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 font-khmer">
                  {lesson.game?.title || 'ល្បែងសិក្សា'}
                </h3>
                <span className="text-[11px] text-purple-700 font-mono font-bold">
                  Engine: {lesson.game?.gameType}
                </span>
              </div>
              <button
                type="button"
                onClick={() => onExecuteAiAction('generate_game')}
                disabled={isActionLoading}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 text-xs font-bold transition cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-purple-600" />
                <span>បង្កើតល្បែងថ្មី</span>
              </button>
            </div>

            <p className="text-xs text-slate-600 font-khmer leading-[1.8]">
              {lesson.game?.instructions}
            </p>

            {/* Levels Summary */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-700 uppercase">
                កម្រិតលេង ({lesson.game?.levels?.length || 0} Levels)៖
              </span>
              <div className="space-y-2">
                {lesson.game?.levels?.map((lvl: any, i: number) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-khmer flex items-center justify-between"
                  >
                    <span>កម្រិតទី {lvl.levelId || i + 1}៖ {lvl.promptText || 'លំហាត់អនុវត្ត'}</span>
                    <span className="text-[10px] text-slate-400 font-mono">Active</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* TAB 6: VIDEO SCRIPT STORYBOARD                                   */}
        {/* ================================================================ */}
        {activeTab === 'video' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 font-khmer">
                  {lesson.video?.title || 'គំនូរព្រាងវីដេអូ'}
                </h3>
                <span className="text-[11px] text-slate-400 font-mono">
                  {lesson.video?.scenes?.length || 0} Scenes
                </span>
              </div>
              <button
                type="button"
                onClick={() => onExecuteAiAction('generate_video')}
                disabled={isActionLoading}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 text-xs font-bold transition cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-purple-600" />
                <span>បង្កើតគំនូរព្រាងថ្មី</span>
              </button>
            </div>

            {/* Timeline Scenes */}
            <div className="space-y-3">
              {lesson.video?.scenes?.map((scene, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-purple-900">
                      ឈុតឆាកទី {scene.sceneNumber} ({scene.durationSec}s)
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 font-mono">
                      {scene.sceneType}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 font-khmer leading-[1.8]">
                    <span className="font-bold text-slate-900">រូបភាព៖ </span>
                    {scene.visualDescription}
                  </p>

                  <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-800 font-khmer leading-[1.8]">
                    <span className="font-bold text-slate-900">អត្ថបទនិទាន៖ </span>
                    «{scene.narrationText}»
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
