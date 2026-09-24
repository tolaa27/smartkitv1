import { NextRequest, NextResponse } from 'next/server';
import { compileLessonToGame, LessonInput } from '@/utils/aiCompiler';
import { GeneratedGameConfig, UniversalEngineType, SubjectId, GradeLevel } from '@/types/game';
import { generateGameWithGemini, isGeminiConfigured } from '@/lib/gemini';

export const runtime = 'nodejs';

/**
 * POST /api/studio/compile
 * AI Lesson-to-Game Parser & Gemini 2.5 Structured Schema Compiler
 * Analyzes Khmer lesson content via Google Gemini 2.5 Flash (or heuristic fallback)
 * to generate and return a validated schema payload matching one of the 5 Core Game Engines.
 */
export async function POST(request: NextRequest) {
  try {
    let rawText = '';
    let fileName = 'Uploaded Curriculum Document';
    let forcedSubject: SubjectId | undefined = undefined;
    let forcedGrade: GradeLevel | undefined = undefined;
    let forcedEngine: UniversalEngineType | undefined = undefined;
    let incomingLessonMaterial: any = undefined;

    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const text = formData.get('lessonText') || formData.get('rawText') || formData.get('ocrString');
      if (typeof text === 'string') rawText = text;

      const file = formData.get('file');
      if (file && typeof file === 'object' && 'name' in file) {
        fileName = (file as { name: string }).name;
        // In Node environment, read basic text if text/plain
        if ('text' in file && typeof (file as { text: () => Promise<string> }).text === 'function') {
          const fileText = await (file as { text: () => Promise<string> }).text();
          rawText = (rawText + ' ' + fileText).trim();
        }
      }

      const sub = formData.get('subject');
      if (sub === 'science' || sub === 'math' || sub === 'khmer' || sub === 'social') {
        forcedSubject = sub as SubjectId;
      }
      const gr = Number(formData.get('gradeLevel') || formData.get('grade'));
      if (gr === 1 || gr === 2 || gr === 3) forcedGrade = gr as GradeLevel;

      const eng = formData.get('forcedEngine');
      if (typeof eng === 'string' && eng) forcedEngine = eng as UniversalEngineType;
    } else {
      const body = await request.json();
      rawText = body.lessonText || body.rawText || body.ocrString || '';
      fileName = body.fileName || body.lessonTitle || fileName;
      if (body.subject === 'science' || body.subject === 'math' || body.subject === 'khmer' || body.subject === 'social') {
        forcedSubject = body.subject as SubjectId;
      }
      const gr = Number(body.gradeLevel || body.grade);
      if (gr === 1 || gr === 2 || gr === 3) forcedGrade = gr as GradeLevel;
      if (body.forcedEngine || body.engineOverride) {
        forcedEngine = (body.forcedEngine || body.engineOverride) as UniversalEngineType;
      }
      if (body.lessonMaterial || body.lesson_material) {
        incomingLessonMaterial = body.lessonMaterial || body.lesson_material;
      }
    }

    if (!rawText.trim()) {
      rawText = 'មេរៀនវិទ្យាសាស្ត្រ និងការថែរក្សាសុខភាពអនាម័យបឋមសិក្សា MoEYS';
    }

    const input: LessonInput = {
      title: fileName.replace(/\.[^/.]+$/, ''),
      rawText,
      sourceType: fileName.endsWith('.pdf') ? 'pdf' : fileName.match(/\.(png|jpg|jpeg)$/i) ? 'image' : 'text',
      fileName,
    };

    let generatedGame: GeneratedGameConfig;
    let compilerProvider = 'heuristic';

    // 1. Attempt real Google Gemini 2.5 Flash compilation if API key is configured
    if (isGeminiConfigured()) {
      try {
        generatedGame = await generateGameWithGemini({
          lessonText: rawText,
          title: fileName.replace(/\.[^/.]+$/, ''),
          subject: forcedSubject,
          gradeLevel: forcedGrade,
          forcedEngine,
          lessonMaterial: incomingLessonMaterial,
        });
        compilerProvider = 'google-gemini-2.5';
      } catch (geminiError) {
        console.warn('Gemini 2.5 compilation error, falling back to heuristic compiler:', geminiError);
        generatedGame = compileLessonToGame(input);
      }
    } else {
      // 2. Fallback to heuristic deterministic compiler
      generatedGame = compileLessonToGame(input);
    }

    if (forcedSubject) {
      generatedGame.subject = forcedSubject;
    }
    if (forcedGrade) {
      generatedGame.gradeLevel = forcedGrade;
    }
    if (forcedEngine) {
      generatedGame.engineType = forcedEngine;
      generatedGame.template = forcedEngine;
    }
    if (incomingLessonMaterial) {
      generatedGame.lessonMaterial = incomingLessonMaterial;
    }

    return NextResponse.json({
      success: true,
      message:
        compilerProvider === 'google-gemini-2.5'
          ? 'Mini-game compiled successfully using Google Gemini 2.5 Flash'
          : 'Mini-game compiled successfully using MoEYS Heuristic Engine',
      provider: compilerProvider,
      game: generatedGame,
      gameConfig: generatedGame,
    });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : 'Unknown compiler error';
    console.error('Error in lesson compilation:', errMessage);

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to compile lesson into mini-game schema.',
        error: errMessage,
      },
      { status: 500 }
    );
  }
}
