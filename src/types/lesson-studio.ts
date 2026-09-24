// src/types/lesson-studio.ts
// Strict End-to-End Type Definitions for SmartKids Interactive Studio
// Supporting MoEYS Curriculum, Bilingual Khmer/English, PDF Curriculum Bindings & AI Video Pipeline

import { SubjectId, GradeLevel, UniversalEngineType } from './game';

// ============================================================================
// 1. LESSON DATA SCHEMA
// ============================================================================

export interface LessonMaterial {
  pdfUrl?: string;
  pageNumber?: number;
  snippetBase64?: string;
  lessonSummaryKhmer?: string;
  lessonTitleKhmer?: string;
}

export interface BoundingBoxCoordinates {
  x: number;
  y: number;
  width: number;
  height: number;
  pageNumber: number;
}

export interface PdfCurriculumReference {
  documentId: string;
  fileName: string;
  fileUrl?: string;
  pageNumber: number;
  totalPages?: number;
  extractedCoordinates?: BoundingBoxCoordinates;
  snippetImageBase64?: string;
  highlightedSnippets?: string[];
  extractedText?: string;
  sourceMeta?: {
    curriculumStandard?: string; // e.g. "MoEYS Primary Math G1-Ch3"
    publicationYear?: number;
    publisher?: string;
    chapter?: string;
  };
}

export interface ExtractedTerm {
  id: string;
  termKhmer: string;
  termEnglish?: string;
  definitionKhmer: string;
  definitionEnglish?: string;
  phonetics?: string; // Khmer phonetics or IPA
  category?: 'core_vocabulary' | 'scientific_concept' | 'math_formula' | 'action_word' | 'sight_word';
  exampleSentenceKhmer?: string;
  exampleSentenceEnglish?: string;
  icon?: string;
}

export interface AudioPronunciationMarker {
  word: string;
  ipa?: string;
  khmerSpelling?: string;
  audioUrl?: string;
  startOffsetMs?: number;
  endOffsetMs?: number;
}

export interface AudioTtsBinding {
  ttsEnabled: boolean;
  voiceId: string; // e.g., 'km-KH-Standard-A', 'km-KH-Sreypov', 'en-US-Neural2-F'
  speechRate: number; // 0.75 - 1.25 for primary learners
  pitch: number; // 0.8 - 1.2
  audioUrl?: string;
  pronunciationMarkers?: AudioPronunciationMarker[];
  synthesizedAt?: string;
}

export interface LessonData {
  id: string;
  titleKhmer: string;
  titleEnglish: string;
  gradeLevel: GradeLevel;
  subject: SubjectId;
  rawContent: string;
  summaryKhmer?: string;
  summaryEnglish?: string;
  learningObjectivesKhmer: string[];
  learningObjectivesEnglish?: string[];
  extractedTerms: ExtractedTerm[];
  audioBindings: AudioTtsBinding;
  pdfReference?: PdfCurriculumReference;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// 2. INTERACTIVE GAME CONFIGURATION SCHEMA
// ============================================================================

export type StudioGameEngineType =
  | 'size_comparison'    // Size & Magnitude Comparison (big/small, tall/short)
  | 'spatial_awareness'   // Spatial Orientation (left/right, above/below, inside/outside)
  | 'number_line'        // Interactive Number Line Jumping (MoEYS Math G1-G2)
  | 'drag_and_drop'      // Category & Basket Classification
  | 'sorter'             // Universal Spatial & Attribute Sorter
  | 'sequencer'          // Chronological Stage Sequencer (Cycles, Steps)
  | 'math_cra'           // Concrete-Representational-Abstract Math Lab
  | 'sandbox'            // Environmental Simulation Sandbox
  | 'khmer_phonetics';   // Khmer Orthography & Syllable Constructor

export interface QuestionVisualAsset {
  type: 'icon' | 'image' | 'svg' | 'shape' | 'lottie';
  value: string; // URL, SVG markup, or Lucide/Emoji icon identifier
  altText?: string;
  width?: number;
  height?: number;
}

export interface QuestionOptionItem {
  id: string;
  labelKhmer: string;
  labelEnglish?: string;
  icon?: string;
  image?: string;
  isCorrect: boolean;
  feedbackKhmer?: string;
  feedbackEnglish?: string;
  targetSlotId?: string; // For drag-and-drop slots
  numericValue?: number; // For math & size comparison
}

export interface StudioQuestionItem {
  id: string;
  promptKhmer: string;
  promptEnglish?: string;
  audioPromptKhmer?: string;
  visualAsset?: QuestionVisualAsset;
  options: QuestionOptionItem[];
  explanationKhmer?: string;
  explanationEnglish?: string;
  hintKhmer?: string;
  hintEnglish?: string;
  timeLimitSeconds?: number;
  metadata?: {
    difficulty?: 'easy' | 'medium' | 'hard';
    competencyCode?: string;
    engineSpecificPayload?: Record<string, unknown>;
  };
}

export interface GameScoringLogic {
  maxScore: number;
  pointsPerCorrect: number;
  penaltyPerMistake: number;
  starsThreshold: [number, number, number]; // [1-star min, 2-star min, 3-star min] e.g. [50, 75, 90]
  allowRetry: boolean;
  maxRetries?: number;
  streakBonusEnabled: boolean;
  streakBonusMultiplier?: number;
  timeLimitTotalSeconds?: number;
}

export interface GameSoundEffects {
  correct: string;
  incorrect: string;
  celebration: string;
  ambient?: string;
  click?: string;
}

export interface GameAssetReferences {
  backgroundImage?: string;
  backgroundColor?: string;
  themeColor: string;
  soundEffects: GameSoundEffects;
  sprites?: Record<string, string>;
  mascotId?: 'chhouk_elephant' | 'kravan_monkey' | 'romdoul_deer';
  particleEffect?: 'confetti' | 'stars' | 'bubbles';
}

export interface StudioGameConfig {
  id: string;
  titleKhmer: string;
  titleEnglish: string;
  instructionsKhmer: string;
  instructionsEnglish: string;
  subject: SubjectId;
  gradeLevel: GradeLevel;
  engineType: StudioGameEngineType;
  universalEngineMapping?: UniversalEngineType;
  questionItems: StudioQuestionItem[];
  scoringLogic: GameScoringLogic;
  assetReferences: GameAssetReferences;
  classroomPin?: string;
  pdfReference?: PdfCurriculumReference;
  sourceLessonId?: string;
  createdAt: string;
  updatedAt: string;
}

export type GameConfig = StudioGameConfig;

// ============================================================================
// 3. AI VIDEO & MEDIA GENERATION SCHEMA
// ============================================================================

export type VideoJobStatus =
  | 'idle'
  | 'uploading'
  | 'generating'
  | 'ready'
  | 'error';

export interface VideoScriptVisualCue {
  timestampSec: number;
  cueKhmer: string;
  cueEnglish?: string;
  visualAssetUrl?: string;
  sceneType?: 'talking_avatar' | 'whiteboard_animation' | 'curriculum_diagram' | 'game_highlight';
}

export interface VideoScriptPayload {
  narrationKhmer: string;
  narrationEnglish?: string;
  visualCues: VideoScriptVisualCue[];
  keySummaryBulletsKhmer: string[];
}

export interface VideoJobState {
  jobId: string;
  lessonId?: string;
  title: string;
  script: VideoScriptPayload;
  avatarStylePrompt: string;
  voiceId: string;
  aspectRatio: '16:9' | '9:16' | '1:1';
  durationSeconds: number;
  status: VideoJobStatus;
  progress: number; // 0 to 100 percentage
  currentStepMessage?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  errorMessage?: string;
  meta?: {
    estimatedTimeRemainingSec?: number;
    provider?: 'runway-gen2' | 'luma-dream' | 'd-id' | 'heygen' | 'remotion-local' | 'google-gemini-2.5';
    renderingEngineVersion?: string;
  };
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// 4. API REQUEST / RESPONSE CONTRACTS
// ============================================================================

export interface GenerateVideoRequestPayload {
  lessonTitle: string;
  lessonText: string;
  subject: SubjectId;
  gradeLevel: GradeLevel;
  avatarStylePrompt?: string;
  voiceId?: string;
  aspectRatio?: '16:9' | '9:16' | '1:1';
  targetDurationSeconds?: number;
  extractedContext?: string;
  pdfPageNumber?: number;
}

export interface GenerateVideoResponsePayload {
  success: boolean;
  jobId: string;
  status: VideoJobStatus;
  message: string;
  jobState: VideoJobState;
}

export interface VideoJobStatusResponse {
  success: boolean;
  jobState: VideoJobState;
}
