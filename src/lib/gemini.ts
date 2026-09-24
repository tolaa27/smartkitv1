// src/lib/gemini.ts
// Official Google Gen AI SDK Integration (@google/genai)
// Powered by Gemini 2.5 Flash for Cambodian MoEYS Primary EdTech Game Compilation & Video Storyboards

import { GoogleGenAI } from '@google/genai';
import {
  GeneratedGameConfig,
  UniversalEngineType,
  SubjectId,
  GradeLevel,
  LessonMaterial,
} from '@/types/game';
import { VideoScriptVisualCue } from '@/types/lesson-studio';
import { sanitizeAndRepairGameConfig } from '@/utils/aiCompiler';

// ----------------------------------------------------------------------------
// 1. ENVIRONMENT & CLIENT INITIALIZATION
// ----------------------------------------------------------------------------
const getApiKey = (): string => {
  return (
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_GENAI_API_KEY ||
    ''
  ).trim();
};

export const isGeminiConfigured = (): boolean => {
  const key = getApiKey();
  return Boolean(key && key.length > 5);
};

export const getGeminiClient = (): GoogleGenAI => {
  const apiKey = getApiKey();
  return new GoogleGenAI({ apiKey });
};

export const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

/**
 * Robust JSON extraction helper that handles markdown code fences (```json ... ```)
 * or extraneous conversational text from Gemini responses.
 */
function cleanAndParseJson<T = any>(rawText: string | undefined | null, fallback: T): T {
  if (!rawText) return fallback;
  try {
    let cleaned = rawText.trim();
    // Strip markdown code fences if present (e.g. ```json ... ``` or ``` ...)
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
    }
    return JSON.parse(cleaned);
  } catch {
    // Attempt substring extraction if model added conversational prefixes or suffixes
    const firstBrace = rawText.indexOf('{');
    const lastBrace = rawText.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      try {
        return JSON.parse(rawText.substring(firstBrace, lastBrace + 1));
      } catch {}
    }
    return fallback;
  }
}

// ----------------------------------------------------------------------------
// 2. GEMINI LESSON-TO-GAME COMPILER
// ----------------------------------------------------------------------------
export interface GenerateGameGeminiInput {
  lessonText: string;
  title: string;
  subject?: SubjectId;
  gradeLevel?: GradeLevel;
  forcedEngine?: UniversalEngineType;
  lessonMaterial?: LessonMaterial;
}

export async function generateGameWithGemini(
  input: GenerateGameGeminiInput
): Promise<GeneratedGameConfig> {
  const ai = getGeminiClient();

  const prompt = `
Please analyze the following Cambodian primary curriculum lesson and compile it into a complete, playable educational game configuration.

Lesson Title: "${input.title}"
Subject: ${input.subject || 'Auto-detect (science, math, khmer, social)'}
Grade Level: ${input.gradeLevel || 'Auto-detect (1, 2, or 3)'}
${input.forcedEngine ? `Forced Engine: "${input.forcedEngine}"` : 'Choose the best matching engine from the 5 Core MoEYS Engines.'}

Curriculum Text:
"""
${input.lessonText}
"""

Requirements:
1. Select the best engineType among:
   - "sorter": Spatial & Attribute Sorter (Sorting items into 2-3 bins, e.g. living vs non-living, trash classification, shapes)
   - "math_cra": Concrete-Representational-Abstract Math Lab (Dual-pan balance scales, Cambodian market cashier with Riel banknotes 100៛-10,000៛, frog number line hopper 0-20, fair-share fruit division)
   - "sandbox": Environmental State-Machine Sandbox (Plant germination with water/light sliders 0-100%, balanced ecosystem)
   - "khmer_phonetics": Khmer Orthography & Phonetics (Consonant/vowel/subscript 'ជើង' syllable constructor, word spelling train, SVO sentence rail)
   - "sequencer": Chronological Stage Sequencer (Life cycles of butterfly/frog/bean plant, process stages 1-4)
2. Generate 2 to 3 progressive game levels.
3. Every prompt and label MUST be in authentic, kid-friendly Cambodian Khmer.
4. Output MUST be valid JSON adhering strictly to the GeneratedGameConfig schema:
{
  "id": "game-gemini-${Date.now()}",
  "titleKhmer": "...",
  "titleEnglish": "...",
  "subject": "science" | "math" | "khmer" | "social",
  "gradeLevel": 1 | 2 | 3,
  "instructionsKhmer": "...",
  "instructionsEnglish": "...",
  "template": "sorter" | "math_cra" | "sandbox" | "khmer_phonetics" | "sequencer",
  "engineType": "sorter" | "math_cra" | "sandbox" | "khmer_phonetics" | "sequencer",
  "metadata": {
    "targetCompetency": "...",
    "sourceLesson": "${input.title}"
  },
  "levels": [
    {
      "levelId": 1,
      "promptText": "...",
      "gameplayData": {
        // Provide matching data for the chosen engine
        // for sorter: "sorterData": { "mode": "...", "bins": [...], "entities": [...] }
        // for math_cra: "mathCraData": { "mode": "...", "targetTotal": ..., "initialEquation": "..." }
        // for sandbox: "sandboxData": { "idealWaterRange": [60, 85], "idealLightRange": [50, 80], ... }
        // for khmer_phonetics: "khmerPhoneticsData": { "mode": "...", "targetWord": "...", "targetConsonant": "...", "targetVowel": "..." }
        // for sequencer: "sequencerData": { "mode": "...", "stages": [...] }
      }
    }
  ]
}
`;

  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      systemInstruction:
        'You are an expert Cambodian Primary Curriculum Pedagogical AI specializing in MoEYS syllabus (Grades 1-3). You output strictly valid JSON conforming to the requested schema.',
    },
  });

  const parsed = cleanAndParseJson<any>(response.text, {});

  // Validate, sanitize, and repair into a robust GeneratedGameConfig
  const sanitized = sanitizeAndRepairGameConfig(parsed);

  if (input.forcedEngine) {
    sanitized.engineType = input.forcedEngine;
    sanitized.template = input.forcedEngine;
  }
  if (input.subject) {
    sanitized.subject = input.subject;
  }
  if (input.gradeLevel) {
    sanitized.gradeLevel = input.gradeLevel;
  }
  if (input.lessonMaterial) {
    sanitized.lessonMaterial = input.lessonMaterial;
  }

  return sanitized;
}

// ----------------------------------------------------------------------------
// 3. GEMINI LESSON-TO-VIDEO STORYBOARD GENERATOR
// ----------------------------------------------------------------------------
export interface GenerateVideoGeminiInput {
  lessonTitle: string;
  lessonText: string;
  subject: string;
  gradeLevel: number;
  avatarStylePrompt?: string;
  targetDurationSeconds?: number;
}

export interface VideoStoryboardOutput {
  narrationKhmer: string;
  narrationEnglish: string;
  visualCues: VideoScriptVisualCue[];
  summaryBulletsKhmer: string[];
}

export async function generateVideoStoryboardWithGemini(
  input: GenerateVideoGeminiInput
): Promise<VideoStoryboardOutput> {
  const ai = getGeminiClient();

  const prompt = `
Create an educational animated video storyboard script for Cambodian primary students based on this lesson:

Title: "${input.lessonTitle}"
Subject: ${input.subject}
Grade: ${input.gradeLevel}
Target Duration: ${input.targetDurationSeconds || 30} seconds

Lesson Content:
"""
${input.lessonText}
"""

Requirements:
1. "narrationKhmer": A warm, encouraging teacher dialogue in natural Khmer, speaking to Grade ${input.gradeLevel} pupils.
2. "narrationEnglish": Accurate English translation of the narration.
3. "visualCues": Exactly 3 to 4 sequential visual scenes covering the video from 0s to ${input.targetDurationSeconds || 30}s.
   Each visual cue must include:
   - "timestampSec": number
   - "cueKhmer": description in Khmer
   - "cueEnglish": description in English
   - "sceneType": one of "talking_avatar", "curriculum_diagram", or "whiteboard_animation"
4. "summaryBulletsKhmer": 3 key educational takeaway bullet points in Khmer.

Output strictly valid JSON:
{
  "narrationKhmer": "...",
  "narrationEnglish": "...",
  "visualCues": [
    {
      "timestampSec": 0,
      "cueKhmer": "...",
      "cueEnglish": "...",
      "sceneType": "talking_avatar"
    }
  ],
  "summaryBulletsKhmer": ["...", "...", "..."]
}
`;

  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      systemInstruction:
        'You are an expert Cambodian Educational Video Producer creating animated MoEYS curriculum lessons for primary learners. Output strictly valid JSON.',
    },
  });

  const parsed = cleanAndParseJson<any>(response.text, {});

  return {
    narrationKhmer:
      parsed.narrationKhmer ||
      `សួស្តីកូនៗទាំងអស់គ្នា! ថ្ងៃនេះយើងនឹងរៀនអំពី ${input.lessonTitle} សម្រាប់ថ្នាក់ទី ${input.gradeLevel}។`,
    narrationEnglish:
      parsed.narrationEnglish ||
      `Hello children! Today we are learning about ${input.lessonTitle} for Grade ${input.gradeLevel}.`,
    visualCues: Array.isArray(parsed.visualCues) && parsed.visualCues.length > 0
      ? parsed.visualCues
      : [
          {
            timestampSec: 0,
            cueKhmer: 'គ្រូបង្រៀនញញឹម និងស្វាគមន៍សិស្សានុសិស្ស',
            cueEnglish: 'Friendly teacher welcomes students',
            sceneType: 'talking_avatar',
          },
          {
            timestampSec: 8,
            cueKhmer: 'បង្ហាញដ្យាក្រាម និងខ្លឹមសារមេរៀនសៀវភៅពុម្ព',
            cueEnglish: 'Display curriculum diagram and textbook content',
            sceneType: 'curriculum_diagram',
          },
          {
            timestampSec: 20,
            cueKhmer: 'សង្ខេបចំណុចសំខាន់ និងផ្តល់ពាក្យលើកទឹកចិត្ត',
            cueEnglish: 'Summary and encouraging words',
            sceneType: 'talking_avatar',
          },
        ],
    summaryBulletsKhmer: Array.isArray(parsed.summaryBulletsKhmer) && parsed.summaryBulletsKhmer.length > 0
      ? parsed.summaryBulletsKhmer
      : [
          'ស្វែងយល់ពីខ្លឹមសារគោលនៃមេរៀន',
          'អនុវត្តលំហាត់ជាក់ស្តែងដើម្បីពង្រឹងចំណេះដឹង',
          'ទទួលបានផ្កាយលើកទឹកចិត្តក្នុងការរៀនសូត្រ',
        ],
  };
}
