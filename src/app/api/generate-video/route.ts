import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { VideoJobState, VideoJobStatus, VideoScriptVisualCue } from '@/types/lesson-studio';
import { generateVideoStoryboardWithGemini, isGeminiConfigured } from '@/lib/gemini';

export const runtime = 'nodejs';

// ============================================================================
// 1. ZOD SCHEMA VALIDATION
// ============================================================================

const GenerateVideoSchema = z.object({
  lessonTitle: z.string().min(1, 'ចំណងជើងមេរៀនមិនអាចទទេបានទេ (Lesson title is required)'),
  lessonText: z.string().min(5, 'ខ្លឹមសារមេរៀនត្រូវមានយ៉ាងហោចណាស់ ៥ តួអក្សរ (Lesson text is too short)'),
  subject: z.enum(['science', 'math', 'khmer', 'social']).default('science'),
  gradeLevel: z.union([z.literal(1), z.literal(2), z.literal(3)]).default(1),
  avatarStylePrompt: z.string().optional().default('រូបតុក្កតាគ្រូបង្រៀនខ្មែរគំនូរជីវចល 3D ស្និទ្ធស្នាល និងគួរឱ្យស្រឡាញ់'),
  voiceId: z.string().optional().default('km-KH-Sreypov'),
  aspectRatio: z.enum(['16:9', '9:16', '1:1']).optional().default('16:9'),
  targetDurationSeconds: z.number().min(10).max(180).optional().default(30),
  extractedContext: z.string().optional(),
  pdfPageNumber: z.number().optional(),
});

// ============================================================================
// 2. IN-MEMORY JOB STORE (Simulating Asynchronous Video Generation Queue)
// ============================================================================

interface StoredJob {
  state: VideoJobState;
  createdAtMs: number;
}

// In-memory store accessible during server lifetime
const jobStore = new Map<string, StoredJob>();

// Clean up jobs older than 1 hour to prevent memory leaks
function cleanOldJobs() {
  const oneHourAgo = Date.now() - 3600 * 1000;
  for (const [id, item] of jobStore.entries()) {
    if (item.createdAtMs < oneHourAgo) {
      jobStore.delete(id);
    }
  }
}

// Helper to generate pedagogical narration and visual cues based on lesson content
function generatePedagogicalScript(
  title: string,
  content: string,
  subject: string,
  grade: number
): {
  narrationKhmer: string;
  narrationEnglish: string;
  visualCues: VideoScriptVisualCue[];
  summaryBulletsKhmer: string[];
} {
  const cleanText = content.replace(/\s+/g, ' ').trim();
  const firstSentence = cleanText.split(/[\n.!?។]/)[0] || cleanText.slice(0, 80);

  let narrationKhmer = '';
  let narrationEnglish = '';
  let visualCues: VideoScriptVisualCue[] = [];
  let summaryBulletsKhmer: string[] = [];

  if (subject === 'math') {
    narrationKhmer = `សួស្តីកូនៗទាំងអស់គ្នា! ថ្ងៃនេះយើងនឹងរៀនអំពី ${title} សម្រាប់ថ្នាក់ទី ${grade}។ ${firstSentence}។ ចូរយើងសង្កេត និងប្រៀបធៀបជាមួយគ្នាទាំងអស់គ្នាណា៎!`;
    narrationEnglish = `Hello children! Today we are learning about ${title} for Grade ${grade}. Let's observe and compare together!`;
    visualCues = [
      {
        timestampSec: 0,
        cueKhmer: 'គ្រូបង្រៀនញញឹម និងស្វាគមន៍សិស្សានុសិស្ស',
        cueEnglish: 'Friendly teacher welcomes students',
        sceneType: 'talking_avatar',
      },
      {
        timestampSec: 8,
        cueKhmer: 'បង្ហាញដ្យាក្រាមប្រៀបធៀបទំហំ និងប្រវែង (ឪឡឹក vs ក្រូច)',
        cueEnglish: 'Display size comparison visual (watermelon vs orange)',
        sceneType: 'curriculum_diagram',
      },
      {
        timestampSec: 18,
        cueKhmer: 'លំហាត់អនុវត្តអន្តរកម្មលើក្តារខៀន',
        cueEnglish: 'Interactive practice problem on whiteboard',
        sceneType: 'whiteboard_animation',
      },
      {
        timestampSec: 26,
        cueKhmer: 'សង្ខេបចំណុចសំខាន់ និងផ្តល់ពាក្យលើកទឹកចិត្ត',
        cueEnglish: 'Summary and encouraging words',
        sceneType: 'talking_avatar',
      },
    ];
    summaryBulletsKhmer = [
      'ស្គាល់ពីការប្រៀបធៀបទំហំ (ធំជាង / តូចជាង)',
      'ចេះសង្កេត និងវាស់ប្រវែងវត្ថុជាក់ស្តែង',
      'អនុវត្តលំហាត់គណិតវិទ្យាប្រចាំថ្ងៃ',
    ];
  } else if (subject === 'science') {
    narrationKhmer = `សួស្តីកូនៗ! សូមស្វាគមន៍មកកាន់មេរៀនវិទ្យាសាស្ត្រ ${title}។ ${firstSentence}។ តើកូនៗដឹងទេថា រុក្ខជាតិត្រូវការអ្វីខ្លះដើម្បីដុះពន្លក? ចូរយើងចូលទៅក្នុងមន្ទីរពិសោធន៍ទាំងអស់គ្នា!`;
    narrationEnglish = `Hello kids! Welcome to the science lesson on ${title}. Do you know what seeds need to germinate? Let's explore together!`;
    visualCues = [
      {
        timestampSec: 0,
        cueKhmer: 'គ្រូបង្រៀនបង្ហាញគ្រាប់ពូជរុក្ខជាតិ',
        cueEnglish: 'Teacher shows plant seeds',
        sceneType: 'talking_avatar',
      },
      {
        timestampSec: 7,
        cueKhmer: 'គំនូរជីវចលគ្រាប់ពូជស្រូបទឹក និងកម្តៅព្រះអាទិត្យ',
        cueEnglish: 'Animation of seed absorbing water and sunlight',
        sceneType: 'curriculum_diagram',
      },
      {
        timestampSec: 16,
        cueKhmer: 'ឫសដុះចុះក្រោម និងពន្លកស្លឹកដុះឡើងលើ',
        cueEnglish: 'Roots growing down and green shoots growing up',
        sceneType: 'curriculum_diagram',
      },
      {
        timestampSec: 25,
        cueKhmer: 'គ្រូបង្រៀនសង្ខេបកត្តាទាំង ៣ នៃការដុះពន្លក',
        cueEnglish: 'Teacher summarizes the 3 essential growth factors',
        sceneType: 'talking_avatar',
      },
    ];
    summaryBulletsKhmer = [
      'គ្រាប់ពូជត្រូវការទឹក សំណើម និងកម្តៅ',
      'ឫសដុះចេញមុនគេដើម្បីស្រូបយកជីជាតិ',
      'ពន្លកស្លឹកដុះឡើងលើដើម្បីទទួលពន្លឺថ្ងៃ',
    ];
  } else {
    narrationKhmer = `សួស្តីកូនៗជាទីស្រឡាញ់! ថ្ងៃនេះយើងនឹងរៀនមេរៀន ${title}។ ${firstSentence}។ ចូរយើងអាន និងបញ្ចេញសំឡេងជាមួយគ្នាឱ្យបានច្បាស់ៗណា៎!`;
    narrationEnglish = `Hello dear students! Today we are studying ${title}. Let's read and pronounce clearly together!`;
    visualCues = [
      {
        timestampSec: 0,
        cueKhmer: 'គ្រូបង្រៀនបង្ហាញព្យញ្ជនៈ និងស្រះនៅលើក្តារខៀន',
        cueEnglish: 'Teacher displays consonants and vowels on the board',
        sceneType: 'talking_avatar',
      },
      {
        timestampSec: 8,
        cueKhmer: 'គំនូរចលនាផ្សំតួអក្សរ និងពាក្យគន្លឹះ',
        cueEnglish: 'Animation combining letters into keywords',
        sceneType: 'curriculum_diagram',
      },
      {
        timestampSec: 18,
        cueKhmer: 'ការអានឃ្លា និងល្បះគំរូ',
        cueEnglish: 'Reading sample sentences',
        sceneType: 'whiteboard_animation',
      },
      {
        timestampSec: 26,
        cueKhmer: 'គ្រូបង្រៀនសរសើរ និងផ្តល់ផ្កាយលើកទឹកចិត្ត',
        cueEnglish: 'Teacher praises students with stars',
        sceneType: 'talking_avatar',
      },
    ];
    summaryBulletsKhmer = [
      'ការបញ្ចេញសំឡេងត្រឹមត្រូវតាមអក្ខរាវិរុទ្ធខ្មែរ',
      'ការផ្សំព្យញ្ជនៈផ្ញើជើង និងស្រះ',
      'ការអានឃ្លា និងល្បះខ្លីៗក្នុងជីវភាពប្រចាំថ្ងៃ',
    ];
  }

  return {
    narrationKhmer,
    narrationEnglish,
    visualCues,
    summaryBulletsKhmer,
  };
}

// ============================================================================
// 3. POST /api/generate-video (DISPATCH ASYNC GENERATION JOB)
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    cleanOldJobs();

    const json = await request.json();
    const parseResult = GenerateVideoSchema.safeParse(json);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'ទិន្នន័យបញ្ចូលមិនត្រឹមត្រូវ (Invalid request payload)',
          errors: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const data = parseResult.data;
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    let scriptData: {
      narrationKhmer: string;
      narrationEnglish: string;
      visualCues: VideoScriptVisualCue[];
      summaryBulletsKhmer: string[];
    };
    let aiProvider: 'remotion-local' | 'google-gemini-2.5' = 'remotion-local';

    if (isGeminiConfigured()) {
      try {
        scriptData = await generateVideoStoryboardWithGemini({
          lessonTitle: data.lessonTitle,
          lessonText: data.lessonText,
          subject: data.subject,
          gradeLevel: data.gradeLevel,
          avatarStylePrompt: data.avatarStylePrompt,
          targetDurationSeconds: data.targetDurationSeconds,
        });
        aiProvider = 'google-gemini-2.5';
      } catch (err) {
        console.warn('Gemini video storyboard generation error, falling back to heuristic script:', err);
        scriptData = generatePedagogicalScript(
          data.lessonTitle,
          data.lessonText,
          data.subject,
          data.gradeLevel
        );
      }
    } else {
      scriptData = generatePedagogicalScript(
        data.lessonTitle,
        data.lessonText,
        data.subject,
        data.gradeLevel
      );
    }

    const initialJobState: VideoJobState = {
      jobId,
      title: data.lessonTitle,
      script: {
        narrationKhmer: scriptData.narrationKhmer,
        narrationEnglish: scriptData.narrationEnglish,
        visualCues: scriptData.visualCues,
        keySummaryBulletsKhmer: scriptData.summaryBulletsKhmer,
      },
      avatarStylePrompt: data.avatarStylePrompt,
      voiceId: data.voiceId,
      aspectRatio: data.aspectRatio,
      durationSeconds: data.targetDurationSeconds,
      status: 'generating',
      progress: 15,
      currentStepMessage:
        aiProvider === 'google-gemini-2.5'
          ? 'Google Gemini 2.5 បានបង្កើតអត្ថបទនិទាន និងឈុតឆាកដោយជោគជ័យ (Gemini 2.5 storyboard generated)'
          : 'កំពុងវិភាគខ្លឹមសារមេរៀន និងរៀបរៀងអត្ថបទនិទាន (Analyzing curriculum text...)',
      videoUrl: undefined,
      thumbnailUrl: undefined,
      meta: {
        provider: aiProvider,
        renderingEngineVersion: 'v2.4-neural',
        estimatedTimeRemainingSec: 8,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Store job in memory
    jobStore.set(jobId, {
      state: initialJobState,
      createdAtMs: Date.now(),
    });

    return NextResponse.json(
      {
        success: true,
        jobId,
        status: initialJobState.status,
        message: 'ការងារបង្កើតវីដេអូត្រូវបានចាប់ផ្តើមដោយជោគជ័យ (Video generation job queued)',
        jobState: initialJobState,
      },
      { status: 202 }
    );
  } catch (error: any) {
    console.error('Error in /api/generate-video POST:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'កំហុសបច្ចេកទេសក្នុងម៉ាស៊ីនមេ (Internal server error)',
        error: error.message || String(error),
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// 4. GET /api/generate-video?jobId=... (STATUS POLLING)
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');

    if (!jobId) {
      return NextResponse.json(
        {
          success: false,
          message: 'សូមផ្តល់លេខសម្គាល់ការងារ (jobId parameter is required)',
        },
        { status: 400 }
      );
    }

    const stored = jobStore.get(jobId);
    if (!stored) {
      return NextResponse.json(
        {
          success: false,
          message: 'រកមិនឃើញការងារបង្កើតវីដេអូនេះទេ (Job not found or expired)',
        },
        { status: 404 }
      );
    }

    const elapsedMs = Date.now() - stored.createdAtMs;
    const currentState = { ...stored.state };

    // Advance state machine based on elapsed time (simulating async pipeline)
    if (currentState.status === 'generating') {
      if (elapsedMs < 1800) {
        currentState.progress = 35;
        currentState.currentStepMessage =
          'កំពុងបង្កើតសំឡេងអានភាសាខ្មែរ (Synthesizing Khmer voiceover with TTS)...';
        if (currentState.meta) currentState.meta.estimatedTimeRemainingSec = 5;
      } else if (elapsedMs < 3500) {
        currentState.progress = 70;
        currentState.currentStepMessage =
          'កំពុងបង្កើតរូបតុក្កតាគ្រូ និងដ្យាក្រាមចលនា (Rendering animated avatar & scene graphics)...';
        if (currentState.meta) currentState.meta.estimatedTimeRemainingSec = 2;
      } else {
        // Generation complete!
        currentState.status = 'ready';
        currentState.progress = 100;
        currentState.currentStepMessage =
          'វីដេអូពន្យល់មេរៀនត្រូវបានបង្កើតរួចរាល់! (Video generation completed successfully)';
        // Sample high quality educational video stream
        currentState.videoUrl =
          'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';
        currentState.thumbnailUrl =
          'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&auto=format&fit=crop&q=80';
        if (currentState.meta) currentState.meta.estimatedTimeRemainingSec = 0;
      }

      currentState.updatedAt = new Date().toISOString();
      stored.state = currentState;
      jobStore.set(jobId, stored);
    }

    return NextResponse.json({
      success: true,
      jobState: currentState,
    });
  } catch (error: any) {
    console.error('Error in /api/generate-video GET:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'កំហុសបច្ចេកទេសក្នុងការទាញយកព័ត៌មាន (Failed to poll video job)',
        error: error.message || String(error),
      },
      { status: 500 }
    );
  }
}
