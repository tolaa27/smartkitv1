// src/lib/ai/prompts/lesson.ts
// Reusable Prompt-Builder System for Context-Aware MoEYS Curriculum AI Generation

import { LessonDocument, AiGenerationOptions } from '../types';

export interface PromptContext {
  subject: string;
  grade: number;
  topic: string;
  learningObjective: string;
  difficulty?: string;
  language?: string;
  curriculumPreset?: string;
  learningStyle?: string;
  contentLength?: string;
}

const SYSTEM_BASE = `You are an expert Cambodian Primary School Curriculum Specialist and EdTech Pedagogical AI.
You specialize in the Ministry of Education, Youth and Sport (MoEYS) primary curriculum for Grades 1, 2, and 3.
All Khmer text MUST be in natural, age-appropriate, encouraging, and clear Khmer (Unicode Khmer, correct spelling, no awkward machine translation).
Avoid technical jargon that young Cambodian children cannot understand. Keep explanations concrete, relatable, and joyful.`;

/**
 * 1. Full Lesson Generation Prompt
 */
export function buildFullLessonPrompt(context: PromptContext, options?: AiGenerationOptions): {
  prompt: string;
  systemInstruction: string;
} {
  const lang = options?.language || context.language || 'khmer';
  const langInstruction =
    lang === 'khmer'
      ? 'All titles, explanations, activities, and questions MUST be in authentic Khmer.'
      : lang === 'bilingual'
      ? 'Provide Khmer as the primary text, with English subtitles or translations where helpful.'
      : 'Provide English as the primary text with Khmer terminology where appropriate.';

  const prompt = `
Create a complete, comprehensive, highly engaging primary lesson plan for Cambodian students:

Subject: ${context.subject}
Grade Level: Grade ${context.grade} (Ages ${context.grade + 5}-${context.grade + 6})
Topic: "${context.topic}"
Learning Objective: "${context.learningObjective}"
Difficulty: ${options?.difficulty || context.difficulty || 'medium'}
Learning Style Focus: ${options?.learningStyle || context.learningStyle || 'interactive'}
Content Length: ${options?.contentLength || context.contentLength || 'medium'}
${context.curriculumPreset ? `Curriculum Reference: "${context.curriculumPreset}"` : ''}

Language Rule: ${langInstruction}

Requirements:
1. "title": Engaging Khmer title for children.
2. "estimatedMinutes": Recommended lesson duration (typically 20-35 minutes for primary learners).
3. "keyConcepts": 2 to 4 core vocabulary terms or scientific concepts with kid-friendly definitions and relevant emoji icons.
4. "explanation": A warm, story-driven or concrete explanation using relatable Cambodian examples (e.g. tropical plants, local fruits, Mekong river, Cambodian market).
5. "examples": 2 to 3 real-world, familiar examples.
6. "activity": A hands-on classroom or home activity directly reinforcing the learning objective, with materials, instructions, and step-by-step guidance.
7. "questions": Exactly 3 age-appropriate formative assessment questions (multiple choice, true/false, or matching) testing ONLY what was taught above. Each question must include options, the correct answer, and a kind explanation.
8. "game": A structured configuration for one of the 5 MoEYS Game Engines ("sorter", "math_cra", "sandbox", "khmer_phonetics", "sequencer") using the EXACT concepts from this lesson.
9. "video": A 3-scene storyboard with mascot elephant Chhouk dialogue and visual descriptions.
10. "alignment": Curriculum alignment score analysis (curriculumScore, gradeLevelScore, topicRelevanceScore, assessmentQualityScore, explanation, suggestions).

Output MUST be strictly valid JSON matching the LessonDocument schema.
`;

  return { prompt, systemInstruction: SYSTEM_BASE };
}

/**
 * 2. Section Improvement: Explanation
 */
export function buildImproveExplanationPrompt(
  lesson: LessonDocument,
  mode: 'improve' | 'simplify' | 'interactive' | 'examples',
  customInstruction?: string
): { prompt: string; systemInstruction: string } {
  let modeText = 'Improve the explanation to be more engaging and clear for primary students.';
  if (mode === 'simplify') {
    modeText = 'Simplify the explanation significantly: use shorter sentences, simpler vocabulary, and gentler phrasing for younger learners.';
  } else if (mode === 'interactive') {
    modeText = 'Make the explanation highly interactive: include conversational questions to ask the student, call-and-response cues, and physical gestures.';
  } else if (mode === 'examples') {
    modeText = 'Add 2-3 colorful, highly relatable real-world Cambodian everyday examples to illustrate the concept.';
  }

  const prompt = `
Context of Current Lesson:
Subject: ${lesson.subject} | Grade: ${lesson.grade} | Topic: "${lesson.topic}"
Learning Objective: "${lesson.learningObjective}"

Existing Explanation:
"""
${lesson.explanation}
"""

Existing Examples:
${JSON.stringify(lesson.examples)}

Task:
${modeText}
${customInstruction ? `Specific teacher instruction: "${customInstruction}"` : ''}

Rules:
- MUST preserve the core facts and learning objective.
- MUST be in authentic, friendly Khmer.
- Return ONLY the updated explanation, examples, and keyConcepts in valid JSON:
{
  "explanation": "...",
  "examples": ["...", "..."],
  "keyConcepts": [
    { "id": "...", "term": "...", "definition": "...", "icon": "..." }
  ]
}
`;

  return { prompt, systemInstruction: SYSTEM_BASE };
}

/**
 * 3. Section Improvement: Activity Generation
 */
export function buildActivityPrompt(
  lesson: LessonDocument,
  customInstruction?: string
): { prompt: string; systemInstruction: string } {
  const prompt = `
Context of Current Lesson:
Subject: ${lesson.subject} | Grade: ${lesson.grade} | Topic: "${lesson.topic}"
Learning Objective: "${lesson.learningObjective}"
Core Concepts Taught: ${lesson.keyConcepts.map(c => c.term).join(', ')}

Existing Explanation Summary:
"""
${lesson.explanation.slice(0, 300)}...
"""

Task:
Generate a new, highly engaging, hands-on learning activity that directly reinforces this learning objective for Cambodian Grade ${lesson.grade} students.
${customInstruction ? `Teacher instruction: "${customInstruction}"` : ''}

Rules:
- Materials must be easily found in Cambodian classrooms or homes (paper, leaves, beans, water cups, pencils, stones).
- Instructions must be numbered and crystal clear for 6-8 year olds.
- Return ONLY valid JSON matching the LessonActivity schema:
{
  "title": "...",
  "instructions": "...",
  "materials": ["...", "..."],
  "steps": ["ជំហានទី ១៖ ...", "ជំហានទី ២៖ ...", "ជំហានទី ៣៖ ..."],
  "estimatedMinutes": 15
}
`;

  return { prompt, systemInstruction: SYSTEM_BASE };
}

/**
 * 4. Section Improvement: Question Generation
 */
export function buildQuestionsPrompt(
  lesson: LessonDocument,
  count = 3,
  customInstruction?: string
): { prompt: string; systemInstruction: string } {
  const prompt = `
Context of Current Lesson:
Subject: ${lesson.subject} | Grade: ${lesson.grade} | Topic: "${lesson.topic}"
Learning Objective: "${lesson.learningObjective}"
Concepts Taught: ${lesson.keyConcepts.map(c => `${c.term}: ${c.definition}`).join('; ')}

Lesson Explanation:
"""
${lesson.explanation}
"""

Task:
Generate ${count} formative assessment questions that strictly test what was taught in the lesson above.
${customInstruction ? `Teacher instruction: "${customInstruction}"` : ''}

Quality Rules:
- DO NOT ask questions about concepts not mentioned in the lesson explanation.
- Avoid duplicate questions.
- Every multiple choice question must have 3-4 distinct, plausible options and 1 clear correct answer.
- Provide a kind, encouraging explanation in Khmer explaining WHY the answer is correct.
- Return ONLY valid JSON:
{
  "questions": [
    {
      "id": "q1",
      "question": "...",
      "type": "multiple_choice",
      "options": ["...", "...", "..."],
      "answer": "...",
      "explanation": "..."
    }
  ]
}
`;

  return { prompt, systemInstruction: SYSTEM_BASE };
}

/**
 * 5. Section Improvement: Game Generation
 */
export function buildGamePrompt(
  lesson: LessonDocument,
  forcedEngine?: string
): { prompt: string; systemInstruction: string } {
  const prompt = `
Context of Current Lesson:
Subject: ${lesson.subject} | Grade: ${lesson.grade} | Topic: "${lesson.topic}"
Learning Objective: "${lesson.learningObjective}"
Key Concepts: ${lesson.keyConcepts.map(c => c.term).join(', ')}
${forcedEngine ? `Forced Engine Type: "${forcedEngine}"` : 'Select the most natural engine out of: "sorter", "math_cra", "sandbox", "khmer_phonetics", "sequencer"'}

Task:
Generate a structured mini-game configuration that lets students practice the lesson concepts through play.

Rules:
- The game must use the EXACT terms and concepts from this lesson.
- Provide 2-3 progressive levels (Level 1: Basic concept recognition, Level 2: Application, Level 3: Mastery challenge).
- Return ONLY valid JSON:
{
  "title": "...",
  "gameType": "sorter" | "math_cra" | "sandbox" | "khmer_phonetics" | "sequencer",
  "instructions": "...",
  "levels": [
    {
      "levelId": 1,
      "promptText": "...",
      "gameplayData": { ... }
    }
  ]
}
`;

  return { prompt, systemInstruction: SYSTEM_BASE };
}

/**
 * 6. Section Improvement: Video Storyboard Generation
 */
export function buildVideoScriptPrompt(
  lesson: LessonDocument
): { prompt: string; systemInstruction: string } {
  const prompt = `
Context of Current Lesson:
Subject: ${lesson.subject} | Grade: ${lesson.grade} | Topic: "${lesson.topic}"
Learning Objective: "${lesson.learningObjective}"
Key Concepts: ${lesson.keyConcepts.map(c => c.term).join(', ')}

Task:
Generate a structured 3-scene educational animated video storyboard featuring the friendly elephant mascot Chhouk teaching this lesson to Grade ${lesson.grade} students.

Return ONLY valid JSON:
{
  "title": "...",
  "scenes": [
    {
      "sceneNumber": 1,
      "durationSec": 6,
      "visualDescription": "...",
      "narrationText": "...",
      "onScreenText": "...",
      "sceneType": "talking_avatar"
    },
    {
      "sceneNumber": 2,
      "durationSec": 10,
      "visualDescription": "...",
      "narrationText": "...",
      "onScreenText": "...",
      "sceneType": "curriculum_diagram"
    },
    {
      "sceneNumber": 3,
      "durationSec": 8,
      "visualDescription": "...",
      "narrationText": "...",
      "onScreenText": "...",
      "sceneType": "whiteboard_animation"
    }
  ],
  "narration": "...",
  "visualSuggestions": ["...", "..."]
}
`;

  return { prompt, systemInstruction: SYSTEM_BASE };
}

/**
 * 7. Section Improvement: Translation
 */
export function buildTranslationPrompt(
  lesson: LessonDocument,
  targetLanguage: 'khmer' | 'english' | 'bilingual'
): { prompt: string; systemInstruction: string } {
  const prompt = `
Translate and adapt the following lesson content into ${targetLanguage === 'khmer' ? 'authentic, age-appropriate Cambodian Khmer' : 'clear, child-friendly English'}:

Lesson Title: "${lesson.title}"
Topic: "${lesson.topic}"
Objective: "${lesson.learningObjective}"
Explanation:
"""
${lesson.explanation}
"""

Key Concepts: ${JSON.stringify(lesson.keyConcepts)}
Activity: ${JSON.stringify(lesson.activity)}
Questions: ${JSON.stringify(lesson.questions)}

Return the full lesson document in valid JSON adhering to the LessonDocument schema with the translated content.
`;

  return { prompt, systemInstruction: SYSTEM_BASE };
}

/**
 * 8. Curriculum Alignment Analysis Prompt
 */
export function buildAlignmentPrompt(lesson: LessonDocument): {
  prompt: string;
  systemInstruction: string;
} {
  const prompt = `
Perform a rigorous pedagogical alignment analysis on this Cambodian primary school lesson:

Subject: ${lesson.subject} | Grade: ${lesson.grade} | Topic: "${lesson.topic}"
Learning Objective: "${lesson.learningObjective}"
Key Concepts: ${lesson.keyConcepts.map(c => c.term).join(', ')}
Explanation Excerpt: "${lesson.explanation.slice(0, 250)}..."
Activity: "${lesson.activity?.title}: ${lesson.activity?.instructions}"
Questions Count: ${lesson.questions?.length || 0}

Evaluate based on 4 criteria:
1. Curriculum alignment (0-100%): Does it match MoEYS primary standards for Grade ${lesson.grade}?
2. Grade suitability (0-100%): Is the vocabulary and cognitive difficulty right for ages ${lesson.grade + 5}-${lesson.grade + 6}?
3. Topic relevance (0-100%): Do all parts focus tightly on "${lesson.topic}"?
4. Assessment quality (0-100%): Do the questions accurately test the stated learning objective?

Return ONLY valid JSON:
{
  "curriculumScore": 92,
  "gradeLevelScore": 96,
  "topicRelevanceScore": 94,
  "assessmentQualityScore": 88,
  "overallScore": 92,
  "explanation": "Detailed Khmer explanation of what aligns well and what could be improved.",
  "suggestions": [
    "ជាក់ស្តែង៖ បន្ថែមរូបភាព ឬវត្ថុជាក់ស្តែងក្នុងសកម្មភាព",
    "ពង្រឹងសំណួរទី ៣ ឱ្យស្របនឹងគោលបំណងចម្បង"
  ]
}
`;

  return { prompt, systemInstruction: SYSTEM_BASE };
}
