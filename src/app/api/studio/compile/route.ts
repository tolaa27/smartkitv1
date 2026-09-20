import { NextRequest, NextResponse } from 'next/server';
import { compileLessonToGame, LessonInput } from '@/utils/aiCompiler';
import { GeneratedGameConfig } from '@/types/game';

export const runtime = 'nodejs';

/**
 * POST /api/studio/compile
 * AI Lesson-to-Game Parser & Heuristic Compiler
 * Analyzes Khmer lesson content to extract grade level, core vocabulary, and structural relationships,
 * then generates and returns a validated schema payload matching one of the 5 Core Game Engines.
 */
export async function POST(request: NextRequest) {
  try {
    let rawText = '';
    let fileName = 'Uploaded Curriculum Document';
    let forcedSubject: 'science' | 'math' | 'khmer' | undefined = undefined;
    let forcedGrade: 1 | 2 | 3 | undefined = undefined;

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
      if (sub === 'science' || sub === 'math' || sub === 'khmer') forcedSubject = sub;
      const gr = Number(formData.get('gradeLevel') || formData.get('grade'));
      if (gr === 1 || gr === 2 || gr === 3) forcedGrade = gr as 1 | 2 | 3;
    } else {
      const body = await request.json();
      rawText = body.lessonText || body.rawText || body.ocrString || '';
      fileName = body.fileName || fileName;
      if (body.subject === 'science' || body.subject === 'math' || body.subject === 'khmer') {
        forcedSubject = body.subject;
      }
      const gr = Number(body.gradeLevel || body.grade);
      if (gr === 1 || gr === 2 || gr === 3) forcedGrade = gr as 1 | 2 | 3;
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

    // Compile into validated game conforming to 5 Core Engine schemas
    const generatedGame: GeneratedGameConfig = compileLessonToGame(input);

    if (forcedSubject) {
      generatedGame.subject = forcedSubject;
    }
    if (forcedGrade) {
      generatedGame.gradeLevel = forcedGrade;
    }

    return NextResponse.json({
      success: true,
      message: 'Mini-game compiled successfully from MoEYS lesson curriculum',
      game: generatedGame,
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
