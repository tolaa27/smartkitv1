'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  GeneratedGameConfig,
  GameTemplateType,
  GradeLevel,
  SubjectId,
  UniversalEngineType,
} from '@/types/edtech';
import {
  compileLessonToGame,
  classifyLessonEngine,
  simulateOcrExtraction,
  sanitizeAndRepairGameConfig,
  PRESET_MOEYS_LESSONS,
  PresetLesson,
  ClassificationReport,
} from '@/utils/aiCompiler';

import { sound } from '@/utils/sound';
import {
  saveCustomGame,
  exportGameAsJson,
  parseImportedGameJson,
} from '@/utils/customGames';
import { SpeakerButton } from '@/components/common/SpeakerButton';
import { UniversalGameRunner } from '@/components/templates/UniversalGameRunner';
import {
  Upload,
  FileText,
  Sparkles,
  Play,
  CheckCircle2,
  Copy,
  Download,
  FolderInput,
  Save,
  Scan,
  Zap,
  Layers,
  ArrowRight,
  Eye,
  Sliders,
  X,
  Code2,
  Check,
} from 'lucide-react';

interface AIGameStudioProps {
  onPlayGame: (config: GeneratedGameConfig) => void;
  onClose: () => void;
}

export const AIGameStudio: React.FC<AIGameStudioProps> = ({ onPlayGame, onClose }) => {
  const [lessonTitle, setLessonTitle] = useState<string>('មេរៀនវិទ្យាសាស្ត្រ ថ្នាក់ទី១៖ ការដុះពន្លក');
  const [lessonContent, setLessonContent] = useState<string>(PRESET_MOEYS_LESSONS[0].content);
  const [isCompiling, setIsCompiling] = useState<boolean>(false);
  const [compiledGame, setCompiledGame] = useState<GeneratedGameConfig | null>(null);
  const [activeTab, setActiveTab] = useState<'editor' | 'preview' | 'json'>('editor');
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [importError, setImportError] = useState<string | null>(null);

  // OCR Vision Pipeline Simulation States
  const [isScanningOcr, setIsScanningOcr] = useState<boolean>(false);
  const [ocrStep, setOcrStep] = useState<number>(1);
  const [ocrFilename, setOcrFilename] = useState<string>('');

  // Classification report for deterministic engine scoring
  const [classification, setClassification] = useState<ClassificationReport>(() =>
    classifyLessonEngine(PRESET_MOEYS_LESSONS[0].content)
  );

  // Re-classify whenever lesson content changes
  useEffect(() => {
    if (lessonContent.trim()) {
      const report = classifyLessonEngine(lessonContent);
      setClassification(report);
    }
  }, [lessonContent]);

  // Compile lesson text into Game JSON with 5 Universal Mechanics Engines
  const handleCompile = (overrideEngine?: UniversalEngineType) => {
    sound.playPop();
    setIsCompiling(true);
    setImportError(null);

    setTimeout(async () => {
      const targetEngine = overrideEngine || classification.selectedEngine;
      const generated = compileLessonToGame({
        title: lessonTitle,
        rawText: lessonContent,
        sourceType: 'text',
        overrideEngine: targetEngine,
      });

      const repaired = sanitizeAndRepairGameConfig(generated);
      setCompiledGame(repaired);
      setIsCompiling(false);
      sound.playSuccessChime();

      // Automatically persist to custom games
      await saveCustomGame(repaired);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    }, 600);
  };

  const safePreviewGame = useMemo(() => {
    return compiledGame ? sanitizeAndRepairGameConfig(compiledGame) : null;
  }, [compiledGame]);

  const handleSelectPreset = (preset: PresetLesson) => {
    sound.playPop();
    setLessonTitle(preset.titleKhmer);
    setLessonContent(preset.content);
  };

  // Multimodal Photo / File OCR Upload Pipeline
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    sound.playPop();
    setOcrFilename(file.name);
    setIsScanningOcr(true);
    setOcrStep(1);

    // Simulated OCR Pipeline: Step 1 Preprocessing
    await new Promise(r => setTimeout(r, 600));
    setOcrStep(2);

    // Step 2: Khmer OCR & Glyphs Recognition
    await new Promise(r => setTimeout(r, 700));
    setOcrStep(3);

    // Step 3: Entity Classification & Synthesis
    const ocrResult = await simulateOcrExtraction(file);
    setIsScanningOcr(false);
    sound.playSuccessChime();

    setLessonTitle(file.name.replace(/\.[^/.]+$/, ''));
    setLessonContent(ocrResult.extractedText);
  };

  // Import JSON Game config directly
  const handleImportJsonFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    sound.playPop();
    setImportError(null);

    const reader = new FileReader();
    reader.onload = async event => {
      const text = event.target?.result as string;
      try {
        const game = parseImportedGameJson(text);
        const repaired = sanitizeAndRepairGameConfig(game);
        setCompiledGame(repaired);
        setLessonTitle(repaired.titleKhmer);
        if (repaired.levels?.[0]?.promptText) {
          setLessonContent(repaired.levels[0].promptText);
        }
        await saveCustomGame(repaired);
        sound.playSuccessChime();
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2500);
      } catch (err: any) {
        sound.playErrorThud();
        setImportError(err.message || 'មិនអាចអានឯកសារ JSON បានទេ');
      }
    };
    reader.readAsText(file);
  };

  const handleManualSave = async () => {
    if (!compiledGame) return;
    sound.playPop();
    const repaired = sanitizeAndRepairGameConfig(compiledGame);
    setCompiledGame(repaired);
    await saveCustomGame(repaired);
    sound.playSuccessChime();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };


  const handleExport = () => {
    if (!compiledGame) return;
    sound.playPop();
    exportGameAsJson(compiledGame);
  };

  const handleCopyPin = () => {
    if (!compiledGame?.metadata?.classroomPin) return;
    navigator.clipboard.writeText(compiledGame.metadata.classroomPin);
    sound.playPop();
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const engineLabels: Record<UniversalEngineType, { nameKh: string; icon: string; color: string }> = {
    sandbox: { nameKh: 'បន្ទប់ពិសោធន៍រូបវិទ្យា', icon: '🔬', color: 'emerald' },
    math_cra: { nameKh: 'គណិតវិទ្យារូបវ័ន្ត', icon: '🧮', color: 'amber' },
    khmer_phonetics: { nameKh: 'អក្សរសាស្ត្រ និងព្យាង្គ', icon: '🇰🇭', color: 'sky' },
    sequencer: { nameKh: 'វដ្ត និងលំដាប់', icon: '🔄', color: 'purple' },
    sorter: { nameKh: 'ចាត់ថ្នាក់ឆ្លាតវៃ', icon: '📦', color: 'rose' },
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6 animate-fade-in relative">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 rounded-3xl p-6 text-amber-950 shadow-xl border-4 border-amber-300 flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 bg-white/50 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-black shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-900" />
            <span>AI Lesson-to-Game Studio • កម្មវិធីបង្កើតហ្គេមឆ្លាតវៃ MoEYS</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black font-heading tracking-tight leading-snug">
            បង្កើតហ្គេមអប់រំពីមេរៀនដោយស្វ័យប្រវត្តិ 🚀
          </h2>
          <p className="text-xs sm:text-sm font-bold font-khmer text-amber-950/90 max-w-xl leading-relaxed">
            បញ្ចូលរូបថតទំព័រសៀវភៅពុម្ព MoEYS ឯកសារ ឬអត្ថបទមេរៀន ដើម្បីចងក្រងជា ៥ ម៉ាស៊ីនល្បែងរូបវ័ន្តភ្លាមៗ!
          </p>
        </div>

        <button
          onClick={onClose}
          className="px-5 py-3 rounded-2xl bg-white/95 hover:bg-white text-slate-800 font-black text-xs sm:text-sm btn-kid shadow-sm border border-amber-200"
        >
          បិទផ្ទាំង (Close)
        </button>
      </div>

      {/* OCR SCANNING MODAL OVERLAY */}
      {isScanningOcr && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full border-4 border-amber-300 shadow-2xl space-y-6 text-center animate-fade-in relative overflow-hidden">
            {/* Animated Scanning Laser Line */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 animate-pulse" />

            <div className="w-16 h-16 mx-auto bg-amber-100 rounded-2xl flex items-center justify-center text-3xl shadow-inner border border-amber-300">
              <Scan className="w-8 h-8 text-amber-800 animate-bounce" />
            </div>

            <div>
              <h3 className="text-xl font-black font-heading text-amber-950">
                AI Vision OCR Scanner កំពុងដំណើរការ
              </h3>
              <p className="text-xs text-slate-500 font-bold mt-1 truncate">
                ឯកសារ៖ {ocrFilename}
              </p>
            </div>

            {/* Step Indicators */}
            <div className="space-y-2.5 text-left font-khmer text-xs">
              <div
                className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all ${
                  ocrStep >= 1
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold'
                    : 'bg-slate-50 border-slate-200 text-slate-400'
                }`}
              >
                {ocrStep > 1 ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin shrink-0" />
                )}
                <span>ជំហានទី ១៖ បង្កើនកម្រិតពណ៌ និងបែងចែកគែម (Edge Detection)</span>
              </div>

              <div
                className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all ${
                  ocrStep >= 2
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold'
                    : 'bg-slate-50 border-slate-200 text-slate-400'
                }`}
              >
                {ocrStep > 2 ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : ocrStep === 2 ? (
                  <div className="w-4 h-4 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full bg-slate-200 shrink-0" />
                )}
                <span>ជំហានទី ២៖ ស្គាល់អក្សរ និងព្យាង្គខ្មែរ MoEYS (Khmer Script OCR)</span>
              </div>

              <div
                className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all ${
                  ocrStep >= 3
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold'
                    : 'bg-slate-50 border-slate-200 text-slate-400'
                }`}
              >
                {ocrStep === 3 ? (
                  <div className="w-4 h-4 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full bg-slate-200 shrink-0" />
                )}
                <span>ជំហានទី ៣៖ ស្រង់ពាក្យគន្លឹះ និងក្បួនល្បែងរូបវ័ន្ត (Entity Extraction)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Lesson Input & Presets */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white rounded-3xl p-6 border-2 border-slate-200/80 shadow-md space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5 font-heading">
                <FileText className="w-4 h-4 text-amber-500" />
                បញ្ចូលខ្លឹមសារមេរៀន (Curriculum Input)
              </span>

              {/* Upload & Import Actions */}
              <div className="flex flex-wrap items-center gap-2">
                <label className="text-xs font-black text-sky-800 bg-sky-50 hover:bg-sky-100 px-3 py-1.5 rounded-xl border border-sky-200 cursor-pointer flex items-center gap-1.5 transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  <span>ថតរូប ឬផ្ទុកឯកសារ OCR</span>
                  <input
                    type="file"
                    accept=".txt,.pdf,.png,.jpg,.jpeg"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                <label className="text-xs font-black text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-200 cursor-pointer flex items-center gap-1.5 transition-colors">
                  <FolderInput className="w-3.5 h-3.5" />
                  <span>នាំចូល JSON</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportJsonFile}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Import Error Message */}
            {importError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-bold">
                ⚠️ {importError}
              </div>
            )}

            {/* Presets */}
            <div>
              <span className="text-xs font-bold text-amber-950 block mb-2 font-khmer">
                ជ្រើសរើសមេរៀនគំរូ MoEYS (5 Universal Mechanics Presets):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {PRESET_MOEYS_LESSONS.map(preset => (
                  <button
                    key={preset.id}
                    onClick={() => handleSelectPreset(preset)}
                    className="p-3 rounded-2xl bg-amber-50/70 hover:bg-amber-100 border border-amber-200 text-left text-xs font-bold text-amber-950 font-khmer flex items-center gap-2.5 transition-all"
                  >
                    <span className="text-xl shrink-0">{preset.icon}</span>
                    <div className="min-w-0">
                      <span className="font-black line-clamp-1">{preset.titleKhmer}</span>
                      <span className="text-[10px] text-slate-500 font-medium">
                        {engineLabels[preset.recommendedEngine]?.nameKh}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Title Input */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                ចំណងជើងហ្គេម (Game Title):
              </label>
              <input
                type="text"
                value={lessonTitle}
                onChange={e => setLessonTitle(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border-2 border-slate-200 focus:border-amber-400 outline-none font-black text-sm font-khmer bg-slate-50 focus:bg-white transition-colors"
              />
            </div>

            {/* Raw Textarea */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                ខ្លឹមសារមេរៀន ឬលំហាត់ (Lesson Text):
              </label>
              <textarea
                rows={6}
                value={lessonContent}
                onChange={e => setLessonContent(e.target.value)}
                placeholder="បិទភ្ជាប់ខ្លឹមសារមេរៀន ឬរូបមន្តនៅទីនេះ..."
                className="w-full px-4 py-3 rounded-2xl border-2 border-slate-200 focus:border-amber-400 outline-none font-medium text-sm font-khmer leading-relaxed bg-slate-50 focus:bg-white transition-colors"
              />
            </div>

            {/* Deterministic Engine Scoring Breakdown */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-700 font-heading flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                  ពិន្ទុវិភាគម៉ាស៊ីនល្បែង (5-Engine Classifier Scores)
                </span>
                <span className="text-[11px] font-black bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-md">
                  ណែនាំ៖ {engineLabels[classification.selectedEngine]?.nameKh} ({classification.confidencePercentage}%)
                </span>
              </div>

              <div className="space-y-1.5">
                {classification.scores.map(s => {
                  const info = engineLabels[s.engine];
                  const isTop = s.engine === classification.selectedEngine;
                  return (
                    <div key={s.engine} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="flex items-center gap-1 text-slate-800">
                          <span>{info.icon}</span>
                          <span>{info.nameKh}</span>
                        </span>
                        <span className={`text-[11px] font-mono ${isTop ? 'text-emerald-700 font-black' : 'text-slate-500'}`}>
                          {s.confidence}%
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            isTop ? 'bg-emerald-500' : 'bg-slate-400'
                          }`}
                          style={{ width: `${Math.max(s.confidence, 4)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Matched Keywords */}
              {classification.extractedEntities.keyVocabulary.length > 0 && (
                <div className="pt-1 flex flex-wrap gap-1">
                  <span className="text-[10px] text-slate-400 font-bold mr-1">ពាក្យគន្លឹះ៖</span>
                  {classification.extractedEntities.keyVocabulary.slice(0, 6).map((kw, i) => (
                    <span key={i} className="text-[10px] bg-white px-2 py-0.5 rounded-md border border-slate-200 text-slate-600 font-bold">
                      {kw}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Compile Button (Child-First 64px Target) */}
            <button
              onClick={() => handleCompile()}
              disabled={isCompiling || !lessonContent.trim()}
              className="w-full h-16 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-500 hover:to-yellow-500 disabled:opacity-50 text-amber-950 font-black text-lg shadow-lg btn-kid flex items-center justify-center gap-2.5 border-b-4 border-amber-600 active:translate-y-1 transition-all"
            >
              <Sparkles className="w-5 h-5 text-amber-950" />
              <span>{isCompiling ? 'AI កំពុងបង្កើតហ្គេម...' : 'ដំណើរការ AI បង្កើតហ្គេម (Compile Game)'}</span>
            </button>
          </div>
        </div>

        {/* Right Column: Live Editor, Preview & Output */}
        <div className="lg:col-span-6 space-y-4">
          {compiledGame ? (
            <div className="bg-white rounded-3xl p-6 border-2 border-slate-200/80 shadow-md space-y-4">
              {/* Output Header */}
              <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-3 gap-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span className="font-black text-slate-900 text-sm font-heading">
                    ហ្គេមត្រូវបានបង្កើតជោគជ័យ! 🎉
                  </span>
                </div>

                {/* Tabs: Editor, Preview, JSON */}
                <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
                  <button
                    onClick={() => setActiveTab('editor')}
                    className={`px-3 py-1.5 rounded-lg font-black text-xs transition-all flex items-center gap-1 ${
                      activeTab === 'editor' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                    }`}
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>កែប្រែ</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('preview')}
                    className={`px-3 py-1.5 rounded-lg font-black text-xs transition-all flex items-center gap-1 ${
                      activeTab === 'preview' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-500'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>សាកល្បងលេង</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('json')}
                    className={`px-3 py-1.5 rounded-lg font-black text-xs transition-all flex items-center gap-1 ${
                      activeTab === 'json' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                    }`}
                  >
                    <Code2 className="w-3.5 h-3.5" />
                    <span>JSON</span>
                  </button>
                </div>
              </div>

              {/* Classroom PIN Badge */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-4 border-2 border-amber-200 flex items-center justify-between">
                <div>
                  <span className="text-xs text-amber-800 font-bold block">
                    លេខកូដសម្ងាត់ថ្នាក់រៀន (Classroom PIN)
                  </span>
                  <span className="text-2xl font-black font-mono text-amber-950 tracking-wider">
                    {compiledGame.metadata.classroomPin}
                  </span>
                </div>
                <button
                  onClick={handleCopyPin}
                  className="px-3.5 py-2 rounded-xl bg-white hover:bg-amber-100 text-amber-950 border border-amber-300 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <Copy className="w-4 h-4 text-amber-700" />
                  <span>{copySuccess ? 'បានចម្លង!' : 'ចម្លង PIN'}</span>
                </button>
              </div>

              {/* TAB 1: LIVE INTERACTIVE PREVIEW */}
              {activeTab === 'preview' && (
                <div className="space-y-3 animate-fade-in">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-xs font-bold text-slate-500">
                      សាកល្បងលេងអន្តរកម្មផ្ទាល់ក្នុង Studio (Live Sandbox Preview):
                    </span>
                    <button
                      onClick={() => setActiveTab('editor')}
                      className="text-xs text-emerald-700 font-black hover:underline"
                    >
                      ត្រឡប់ទៅកែប្រែវិញ
                    </button>
                  </div>
                  <div className="bg-slate-50 rounded-2xl p-2 border border-slate-200 max-h-[520px] overflow-y-auto">
                    {safePreviewGame && (
                      <UniversalGameRunner
                        gameConfig={safePreviewGame}
                        onExit={() => setActiveTab('editor')}
                      />
                    )}
                  </div>

                </div>
              )}

              {/* TAB 2: EDITOR */}
              {activeTab === 'editor' && (
                <div className="space-y-4 font-khmer">
                  {/* Engine Selection Pill Ribbon */}
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1.5">
                      ម៉ាស៊ីនល្បែងរូបវ័ន្ត (Universal Mechanics Engine):
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {(Object.keys(engineLabels) as UniversalEngineType[]).map(eng => {
                        const info = engineLabels[eng];
                        const isCurrent = compiledGame.engineType === eng;
                        return (
                          <button
                            key={eng}
                            onClick={() => handleCompile(eng)}
                            className={`p-2.5 rounded-xl border text-left text-xs font-black flex items-center gap-2 transition-all ${
                              isCurrent
                                ? 'bg-amber-100 border-amber-400 text-amber-950 shadow-xs'
                                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            <span>{info.icon}</span>
                            <span className="line-clamp-1">{info.nameKh}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-600 block mb-1">
                        មុខវិជ្ជា (Subject):
                      </label>
                      <select
                        value={compiledGame.subject}
                        onChange={e =>
                          setCompiledGame({ ...compiledGame, subject: e.target.value as SubjectId })
                        }
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-bold text-xs bg-white"
                      >
                        <option value="science">វិទ្យាសាស្ត្រ (Science)</option>
                        <option value="math">គណិតវិទ្យា (Math)</option>
                        <option value="khmer">ភាសាខ្មែរ (Khmer)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-600 block mb-1">
                        កម្រិតថ្នាក់ (Grade):
                      </label>
                      <select
                        value={compiledGame.gradeLevel}
                        onChange={e =>
                          setCompiledGame({
                            ...compiledGame,
                            gradeLevel: parseInt(e.target.value, 10) as GradeLevel,
                          })
                        }
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-bold text-xs bg-white"
                      >
                        <option value={1}>ថ្នាក់ទី ១</option>
                        <option value={2}>ថ្នាក់ទី ២</option>
                        <option value={3}>ថ្នាក់ទី ៣</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-slate-600">
                        សំណួរណែនាំ (Prompt Text):
                      </label>
                      {compiledGame.levels[0]?.promptText && (
                        <SpeakerButton text={compiledGame.levels[0].promptText} size="xs" />
                      )}
                    </div>
                    <input
                      type="text"
                      value={compiledGame.levels[0]?.promptText || ''}
                      onChange={e => {
                        const updatedLevels = [...compiledGame.levels];
                        if (updatedLevels[0]) {
                          updatedLevels[0].promptText = e.target.value;
                          setCompiledGame({ ...compiledGame, levels: updatedLevels });
                        }
                      }}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 font-black text-xs"
                    />
                  </div>
                </div>
              )}

              {/* TAB 3: JSON */}
              {activeTab === 'json' && (
                <div className="bg-slate-900 rounded-2xl p-4 overflow-x-auto max-h-72">
                  <pre className="text-[11px] text-emerald-400 font-mono">
                    {JSON.stringify(compiledGame, null, 2)}
                  </pre>
                </div>
              )}

              {/* Action Buttons: Save & Export */}
              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleManualSave}
                  className="flex-1 py-3 px-3 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-950 font-black text-xs sm:text-sm btn-kid flex items-center justify-center gap-1.5 border border-amber-300 transition-colors"
                >
                  <Save className="w-4 h-4 text-amber-700" />
                  <span>{saveSuccess ? 'បានរក្សាទុក ✓' : 'រក្សាទុកហ្គេម (Save)'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleExport}
                  className="flex-1 py-3 px-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-xs sm:text-sm btn-kid flex items-center justify-center gap-1.5 border border-slate-300 transition-colors"
                >
                  <Download className="w-4 h-4 text-slate-600" />
                  <span>ទាញយក JSON (Export)</span>
                </button>
              </div>

              {/* Play Now Giant Touch Button (min-h-[64px]) */}
              <button
                onClick={() => {
                  sound.playPop();
                  onPlayGame(safePreviewGame || compiledGame);
                }}
                className="w-full h-16 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-lg shadow-lg btn-kid flex items-center justify-center gap-2 border-b-4 border-emerald-700 active:translate-y-1 transition-all"
              >
                <Play className="w-5 h-5 fill-white" />
                <span>លេងហ្គេមនេះពេញអេក្រង់ (Play Now)</span>
              </button>

            </div>
          ) : (
            /* Placeholder before compiling */
            <div className="bg-white rounded-3xl p-8 border-4 border-dashed border-amber-200 text-center flex flex-col items-center justify-center min-h-[400px] space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 border-2 border-amber-200 flex items-center justify-center text-3xl">
                🤖
              </div>
              <h3 className="text-base font-black text-amber-950 font-heading">
                រង់ចាំការដំណើរការមេរៀន...
              </h3>
              <p className="text-xs text-slate-500 font-khmer max-w-sm leading-relaxed">
                ជ្រើសរើសមេរៀនគំរូ MoEYS ៥ ប្រភេទ ឬផ្ទុកឯកសាររូបថត OCR នៅខាងឆ្វេង រួចចុច &quot;ដំណើរការ AI បង្កើតហ្គេម&quot; ដើម្បីចងក្រងជា ៥ ម៉ាស៊ីនល្បែងរូបវ័ន្ត និងសាកល្បងលេងផ្ទាល់។
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

