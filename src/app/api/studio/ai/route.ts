// src/app/api/studio/ai/route.ts
// Unified AI Endpoint for Full-Lesson & Section-Level Smart Generation

import { NextRequest, NextResponse } from 'next/server';
import {
  generateFullLesson,
  executeSectionAiAction,
} from '@/lib/ai/lesson-generator';
import { AiActionType, AiGenerationOptions, LessonDocument } from '@/lib/ai/types';
import { PromptContext } from '@/lib/ai/prompts/lesson';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const action: AiActionType = body.action || 'full_lesson';
    const context: Partial<PromptContext> = body.context || {};
    const currentLesson: LessonDocument | undefined = body.currentLesson;
    const options: AiGenerationOptions | undefined = body.options;

    // Full lesson generation
    if (action === 'full_lesson') {
      const result = await generateFullLesson(context, options);
      return NextResponse.json({
        success: true,
        lesson: result.lesson,
        provider: result.provider,
        warnings: result.warnings,
        message: 'មេរៀនត្រូវបានបង្កើតដោយជោគជ័យ!',
      });
    }

    // Section-level refined actions
    if (!currentLesson) {
      return NextResponse.json(
        {
          success: false,
          message: 'currentLesson is required for section-level improvements.',
        },
        { status: 400 }
      );
    }

    const result = await executeSectionAiAction(action, currentLesson, options);
    return NextResponse.json({
      success: true,
      lesson: result.updatedLesson,
      message: result.message,
    });
  } catch (error: any) {
    console.error('Error in /api/studio/ai:', error.message);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'AI processing encountered an unexpected issue.',
      },
      { status: 500 }
    );
  }
}
