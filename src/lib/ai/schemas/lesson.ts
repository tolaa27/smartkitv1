// src/lib/ai/schemas/lesson.ts
// Zod Validation Schemas for Structured AI Lesson Generation

import { z } from 'zod';

export const KeyConceptSchema = z.object({
  id: z.string().default(() => `concept_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`),
  term: z.string().min(1, 'Term is required'),
  definition: z.string().min(1, 'Definition is required'),
  icon: z.string().optional().default('💡'),
  example: z.string().optional(),
});

export const LessonActivitySchema = z.object({
  title: z.string().min(1, 'Activity title is required'),
  instructions: z.string().min(1, 'Instructions are required'),
  materials: z.array(z.string()).default([]),
  steps: z.array(z.string()).min(1, 'At least one activity step is required'),
  estimatedMinutes: z.number().optional().default(15),
});

export const LessonQuestionSchema = z.object({
  id: z.string().default(() => `q_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`),
  question: z.string().min(1, 'Question text is required'),
  type: z.enum(['multiple_choice', 'true_false', 'matching']).default('multiple_choice'),
  options: z.array(z.string()).min(2, 'At least 2 options are required'),
  answer: z.string().min(1, 'Answer is required'),
  explanation: z.string().default(''),
  audioPromptKhmer: z.string().optional(),
});

export const LessonGameSchema = z.object({
  title: z.string().min(1, 'Game title is required'),
  gameType: z.string().default('sorter'),
  instructions: z.string().min(1, 'Game instructions are required'),
  levels: z.array(z.any()).default([]),
});

export const VideoSceneSchema = z.object({
  sceneNumber: z.number().default(1),
  durationSec: z.number().default(6),
  visualDescription: z.string().min(1, 'Visual description is required'),
  narrationText: z.string().min(1, 'Narration text is required'),
  onScreenText: z.string().default(''),
  sceneType: z.enum(['talking_avatar', 'curriculum_diagram', 'whiteboard_animation']).default('talking_avatar'),
});

export const LessonVideoSchema = z.object({
  title: z.string().min(1, 'Video title is required'),
  scenes: z.array(VideoSceneSchema).min(1, 'At least one scene is required'),
  narration: z.string().default(''),
  visualSuggestions: z.array(z.string()).default([]),
});

export const CurriculumAlignmentSchema = z.object({
  curriculumScore: z.number().min(0).max(100).default(90),
  gradeLevelScore: z.number().min(0).max(100).default(95),
  topicRelevanceScore: z.number().min(0).max(100).default(92),
  assessmentQualityScore: z.number().min(0).max(100).default(88),
  overallScore: z.number().min(0).max(100).default(91),
  explanation: z.string().default(''),
  suggestions: z.array(z.string()).default([]),
});

export const LessonDocumentSchema = z.object({
  id: z.string().default(() => `lesson_${Date.now()}`),
  title: z.string().min(1, 'Title is required'),
  subject: z.enum(['science', 'math', 'khmer', 'social']).default('science'),
  grade: z.union([z.literal(1), z.literal(2), z.literal(3)]).default(1),
  topic: z.string().min(1, 'Topic is required'),
  learningObjective: z.string().min(1, 'Learning objective is required'),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
  estimatedMinutes: z.number().default(30),
  keyConcepts: z.array(KeyConceptSchema).default([]),
  explanation: z.string().min(1, 'Explanation is required'),
  examples: z.array(z.string()).default([]),
  activity: LessonActivitySchema,
  questions: z.array(LessonQuestionSchema).default([]),
  game: LessonGameSchema,
  video: LessonVideoSchema,
  alignment: CurriculumAlignmentSchema,
  createdAt: z.string().default(() => new Date().toISOString()),
  updatedAt: z.string().default(() => new Date().toISOString()),
});

// Partial update schemas for section-level AI operations
export const ExplanationUpdateSchema = z.object({
  explanation: z.string().min(1),
  examples: z.array(z.string()).optional(),
  keyConcepts: z.array(KeyConceptSchema).optional(),
});

export const ActivityUpdateSchema = LessonActivitySchema;

export const QuestionsUpdateSchema = z.object({
  questions: z.array(LessonQuestionSchema).min(1),
});

export const AlignmentAnalysisSchema = CurriculumAlignmentSchema;
