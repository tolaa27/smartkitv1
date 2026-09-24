// src/lib/ai/types.ts
// Strict End-to-End TypeScript Type Definitions for SmartKids AI Intelligence Layer

import { SubjectId, GradeLevel, UniversalEngineType } from '@/types/game';

export type LessonLanguage = 'khmer' | 'english' | 'bilingual';
export type LessonDifficulty = 'easy' | 'medium' | 'hard';
export type ContentLength = 'short' | 'medium' | 'detailed';
export type LearningStyle = 'visual' | 'interactive' | 'story_based' | 'practice_based';

export interface KeyConceptItem {
  id: string;
  term: string;
  definition: string;
  icon?: string;
  example?: string;
}

export interface LessonActivity {
  title: string;
  instructions: string;
  materials: string[];
  steps: string[];
  estimatedMinutes?: number;
}

export interface LessonQuestion {
  id: string;
  question: string;
  type: 'multiple_choice' | 'true_false' | 'matching';
  options: string[];
  answer: string;
  explanation: string;
  audioPromptKhmer?: string;
}

export interface LessonGameConfig {
  title: string;
  gameType: UniversalEngineType | string;
  instructions: string;
  levels: any[];
}

export interface VideoSceneItem {
  sceneNumber: number;
  durationSec: number;
  visualDescription: string;
  narrationText: string;
  onScreenText: string;
  sceneType: 'talking_avatar' | 'curriculum_diagram' | 'whiteboard_animation';
}

export interface LessonVideoScript {
  title: string;
  scenes: VideoSceneItem[];
  narration: string;
  visualSuggestions: string[];
}

export interface CurriculumAlignmentData {
  curriculumScore: number;    // e.g. 92
  gradeLevelScore: number;    // e.g. 96
  topicRelevanceScore: number;// e.g. 94
  assessmentQualityScore: number; // e.g. 88
  overallScore: number;
  explanation: string;
  suggestions: string[];
}

export interface LessonDocument {
  id: string;
  title: string;
  subject: SubjectId;
  grade: GradeLevel;
  topic: string;
  learningObjective: string;
  difficulty: LessonDifficulty;
  estimatedMinutes: number;
  keyConcepts: KeyConceptItem[];
  explanation: string;
  examples: string[];
  activity: LessonActivity;
  questions: LessonQuestion[];
  game: LessonGameConfig;
  video: LessonVideoScript;
  alignment: CurriculumAlignmentData;
  createdAt: string;
  updatedAt: string;
}

export type AiActionType =
  | 'full_lesson'
  | 'improve_explanation'
  | 'simplify_explanation'
  | 'make_interactive'
  | 'add_examples'
  | 'generate_activity'
  | 'generate_questions'
  | 'generate_game'
  | 'generate_video'
  | 'translate_khmer'
  | 'translate_english'
  | 'adjust_difficulty'
  | 'check_alignment';

export interface AiGenerationOptions {
  model?: string;
  language?: LessonLanguage;
  contentLength?: ContentLength;
  learningStyle?: LearningStyle;
  difficulty?: LessonDifficulty;
  customInstruction?: string;
}

export interface AiProgressStep {
  id: string;
  labelKhmer: string;
  labelEnglish: string;
  status: 'pending' | 'active' | 'completed' | 'error';
}
