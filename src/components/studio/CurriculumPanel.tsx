// src/components/studio/CurriculumPanel.tsx
// Left Zone: Clean Curriculum & AI Configuration Panel

'use client';

import React from 'react';
import {
  BookOpen,
  Sparkles,
  Sliders,
  Settings2,
  Sprout,
  Coins,
  Boxes,
  Compass,
} from 'lucide-react';
import { SubjectId, GradeLevel } from '@/types/game';
import { PRESET_MOEYS_LESSONS, PresetLesson } from '@/utils/aiCompiler';
import {
  LessonLanguage,
  LessonDifficulty,
  ContentLength,
  LearningStyle,
} from '@/lib/ai/types';
import { soundSynthesizer } from '@/lib/audio/SoundSynthesizer';

const PRESET_ICONS: Record<string, React.ReactNode> = {
  'preset-sandbox-plant': <Sprout className="w-4 h-4 text-emerald-600" />,
  'preset-math-market': <Coins className="w-4 h-4 text-amber-600" />,
  'preset-khmer-syllables': <BookOpen className="w-4 h-4 text-indigo-600" />,
  'preset-sequencer-butterfly': <Sparkles className="w-4 h-4 text-purple-600" />,
  'preset-sorter-eco': <Boxes className="w-4 h-4 text-teal-600" />,
};

interface CurriculumPanelProps {
  subject: SubjectId;
  onSubjectChange: (s: SubjectId) => void;
  grade: GradeLevel;
  onGradeChange: (g: GradeLevel) => void;
  topic: string;
  onTopicChange: (t: string) => void;
  difficulty: LessonDifficulty;
  onDifficultyChange: (d: LessonDifficulty) => void;
  learningObjective: string;
  onLearningObjectiveChange: (obj: string) => void;
  selectedPresetId: string | null;
  onSelectPreset: (preset: PresetLesson) => void;

  // AI Configuration
  language: LessonLanguage;
  onLanguageChange: (l: LessonLanguage) => void;
  contentLength: ContentLength;
  onContentLengthChange: (cl: ContentLength) => void;
  learningStyle: LearningStyle;
  onLearningStyleChange: (ls: LearningStyle) => void;
}

export const CurriculumPanel: React.FC<CurriculumPanelProps> = ({
  subject,
  onSubjectChange,
  grade,
  onGradeChange,
  topic,
  onTopicChange,
  difficulty,
  onDifficultyChange,
  learningObjective,
  onLearningObjectiveChange,
  selectedPresetId,
  onSelectPreset,
  language,
  onLanguageChange,
  contentLength,
  onContentLengthChange,
  learningStyle,
  onLearningStyleChange,
}) => {
  return (
    <aside className="w-full lg:w-[320px] xl:w-[340px] flex-shrink-0 flex flex-col border-r border-slate-200 bg-white h-full overflow-y-auto p-4 space-y-6">
      {/* ------------------------------------------------------------------ */}
      {/* SECTION 1: CURRICULUM CONFIGURATION                                */}
      {/* ------------------------------------------------------------------ */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
          <BookOpen className="w-4 h-4 text-indigo-600" />
          <span>កម្មវិធីសិក្សា (Curriculum)</span>
        </div>

        {/* Subject & Grade Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">
              មុខវិជ្ជា (Subject)
            </label>
            <select
              value={subject}
              onChange={(e) => onSubjectChange(e.target.value as SubjectId)}
              className="w-full px-2.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-hidden transition cursor-pointer"
            >
              <option value="science">វិទ្យាសាស្ត្រ (Science)</option>
              <option value="math">គណិតវិទ្យា (Math)</option>
              <option value="khmer">ភាសាខ្មែរ (Khmer)</option>
              <option value="social">សិក្សាសង្គម (Social)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">
              កម្រិតថ្នាក់ (Grade)
            </label>
            <select
              value={grade}
              onChange={(e) => onGradeChange(Number(e.target.value) as GradeLevel)}
              className="w-full px-2.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-hidden transition cursor-pointer"
            >
              <option value={1}>ថ្នាក់ទី ១ (Grade 1)</option>
              <option value={2}>ថ្នាក់ទី ២ (Grade 2)</option>
              <option value={3}>ថ្នាក់ទី ៣ (Grade 3)</option>
            </select>
          </div>
        </div>

        {/* Topic Input */}
        <div>
          <label className="block text-[11px] font-bold text-slate-500 mb-1">
            ប្រធានបទមេរៀន (Topic)
          </label>
          <input
            type="text"
            value={topic}
            onChange={(e) => onTopicChange(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-hidden transition font-khmer leading-[1.8]"
            placeholder="ឧទាហរណ៍៖ ការដុះពន្លកនៃគ្រាប់សណ្ដែក"
          />
        </div>

        {/* Difficulty Selector */}
        <div>
          <label className="block text-[11px] font-bold text-slate-500 mb-1">
            កម្រិតពិបាក (Difficulty)
          </label>
          <div className="grid grid-cols-3 gap-1.5 bg-slate-100 p-1 rounded-xl">
            {(['easy', 'medium', 'hard'] as LessonDifficulty[]).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => {
                  soundSynthesizer.playClick();
                  onDifficultyChange(d);
                }}
                className={`py-1 rounded-lg text-[11px] font-bold transition capitalize cursor-pointer ${
                  difficulty === d
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {d === 'easy' ? 'ងាយ' : d === 'medium' ? 'មធ្យម' : 'ពិបាក'}
              </button>
            ))}
          </div>
        </div>

        {/* Learning Objective */}
        <div>
          <label className="block text-[11px] font-bold text-slate-500 mb-1">
            គោលបំណងមេរៀន (Learning Objective)
          </label>
          <textarea
            value={learningObjective}
            onChange={(e) => onLearningObjectiveChange(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-800 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-hidden transition font-khmer leading-[1.8] resize-none"
            placeholder="សិស្សអាចយល់ដឹង និងអនុវត្ត..."
          />
        </div>
      </div>

      <div className="h-px bg-slate-100" />

      {/* ------------------------------------------------------------------ */}
      {/* SECTION 2: COMPACT LESSON PRESETS                                 */}
      {/* ------------------------------------------------------------------ */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>មេរៀនគំរូ MoEYS</span>
          </span>
          <span className="text-[10px] text-slate-400 font-mono">5 Presets</span>
        </div>

        <div className="flex flex-col gap-2.5 w-full">
          {PRESET_MOEYS_LESSONS.map((preset) => {
            const isSelected = selectedPresetId === preset.id;
            const icon = PRESET_ICONS[preset.id] || <BookOpen className="w-4 h-4 text-indigo-600" />;

            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => {
                  soundSynthesizer.playClick();
                  onSelectPreset(preset);
                }}
                className={`relative w-full p-2.5 rounded-xl text-left transition flex items-center gap-2.5 cursor-pointer border ${
                  isSelected
                    ? 'bg-purple-50/70 border-purple-300 text-purple-950 shadow-2xs'
                    : 'bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50/60 text-slate-700'
                }`}
              >
                <div className="p-1 rounded-lg bg-slate-100 text-slate-700 shrink-0">
                  {icon}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold truncate leading-relaxed">
                    {preset.titleKhmer}
                  </p>
                  <span className="text-[10px] text-slate-400 capitalize">
                    {preset.subject} • ថ្នាក់ទី {preset.gradeLevel}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="h-px bg-slate-100" />

      {/* ------------------------------------------------------------------ */}
      {/* SECTION 3: AI CONFIGURATION                                       */}
      {/* ------------------------------------------------------------------ */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
          <Settings2 className="w-4 h-4 text-purple-600" />
          <span>ការកំណត់ AI (AI Config)</span>
        </div>

        {/* Language */}
        <div>
          <label className="block text-[11px] font-bold text-slate-500 mb-1">
            ភាសា (Language)
          </label>
          <div className="grid grid-cols-3 gap-1.5 bg-slate-100 p-1 rounded-xl">
            {(['khmer', 'english', 'bilingual'] as LessonLanguage[]).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => {
                  soundSynthesizer.playClick();
                  onLanguageChange(l);
                }}
                className={`py-1 rounded-lg text-[11px] font-bold transition capitalize cursor-pointer ${
                  language === l
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {l === 'khmer' ? 'ខ្មែរ' : l === 'english' ? 'English' : 'ទ្វេភាសា'}
              </button>
            ))}
          </div>
        </div>

        {/* Content Length */}
        <div>
          <label className="block text-[11px] font-bold text-slate-500 mb-1">
            ប្រវែងខ្លឹមសារ (Length)
          </label>
          <div className="grid grid-cols-3 gap-1.5 bg-slate-100 p-1 rounded-xl">
            {(['short', 'medium', 'detailed'] as ContentLength[]).map((cl) => (
              <button
                key={cl}
                type="button"
                onClick={() => {
                  soundSynthesizer.playClick();
                  onContentLengthChange(cl);
                }}
                className={`py-1 rounded-lg text-[11px] font-bold transition capitalize cursor-pointer ${
                  contentLength === cl
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {cl === 'short' ? 'សង្ខេប' : cl === 'medium' ? 'ល្មម' : 'ក្បោះក្បាយ'}
              </button>
            ))}
          </div>
        </div>

        {/* Learning Style */}
        <div>
          <label className="block text-[11px] font-bold text-slate-500 mb-1">
            ទម្រង់នៃការរៀន (Style)
          </label>
          <select
            value={learningStyle}
            onChange={(e) => onLearningStyleChange(e.target.value as LearningStyle)}
            className="w-full px-2.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800 focus:bg-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-hidden transition cursor-pointer"
          >
            <option value="interactive">អន្តរកម្ម (Interactive)</option>
            <option value="visual">រូបភាព & ដ្យាក្រាម (Visual)</option>
            <option value="story_based">រឿងនិទាន (Story-based)</option>
            <option value="practice_based">អនុវត្តជាក់ស្តែង (Practice)</option>
          </select>
        </div>
      </div>
    </aside>
  );
};
