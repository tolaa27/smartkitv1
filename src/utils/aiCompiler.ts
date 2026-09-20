// utils/aiCompiler.ts
// Lesson-to-Game AI Compiler & Deterministic Engine Classifier for Cambodian MoEYS Curriculum

import {
  GeneratedGameConfig,
  GradeLevel,
  SubjectId,
  UniversalEngineType,
  SandboxData,
  MathCraData,
  KhmerPhoneticsData,
  SequencerData,
  SorterData,
} from '@/types/edtech';

export interface LessonInput {
  title: string;
  rawText: string;
  sourceType: 'text' | 'pdf' | 'image';
  fileName?: string;
  overrideEngine?: UniversalEngineType;
}

export interface PresetLesson {
  id: string;
  titleKhmer: string;
  subject: SubjectId;
  gradeLevel: GradeLevel;
  content: string;
  icon: string;
  recommendedEngine: UniversalEngineType;
}

export interface EngineScore {
  engine: UniversalEngineType;
  engineNameKhmer: string;
  score: number;
  confidence: number; // 0 - 100%
  matchedKeywords: string[];
}

export interface ClassificationReport {
  selectedEngine: UniversalEngineType;
  scores: EngineScore[];
  confidencePercentage: number;
  extractedEntities: {
    subject: SubjectId;
    gradeLevel: GradeLevel;
    topicKhmer: string;
    keyVocabulary: string[];
  };
}

export const PRESET_MOEYS_LESSONS: PresetLesson[] = [
  {
    id: 'preset-sandbox-plant',
    titleKhmer: 'មេរៀនវិទ្យាសាស្ត្រ ថ្នាក់ទី១៖ ការដុះពន្លករបស់គ្រាប់សណ្ដែក និងពន្លឺ',
    subject: 'science',
    gradeLevel: 1,
    icon: '🌱',
    recommendedEngine: 'sandbox',
    content: `ក្រសួងអប់រំ យុវជន និងកីឡា - វិទ្យាសាស្ត្រ និងការសិក្សាសង្គម ថ្នាក់ទី១
មេរៀន៖ កត្តាចាំបាច់សម្រាប់ដំណុះ និងការលូតលាស់នៃគ្រាប់ពូជ
ខ្លឹមសារ៖ គ្រាប់ពូជត្រូវការទឹក សំណើម ពន្លឺព្រះអាទិត្យ និងជីវជាតិដីដើម្បីដុះពន្លក។
- សំណើមទឹកជួយបន្ទន់សំបកគ្រាប់
- ពន្លឺថ្ងៃជួយឲ្យស្លឹកបៃតងផលិតអាហារតាមរស្មីសំយោគ
- ជីជាតិជួយឲ្យឫសកែវដុះរឹងមាំ
គោលបំណង៖ ឲ្យសិស្សពិសោធន៍រកតុល្យភាពកត្តាបរិស្ថាន ៦០%-៨៥%។`,
  },
  {
    id: 'preset-math-market',
    titleKhmer: 'មេរៀនគណិតវិទ្យា ថ្នាក់ទី២៖ រូបិយវត្ថុជាតិប្រាក់រៀល និងការទិញទំនិញ',
    subject: 'math',
    gradeLevel: 2,
    icon: '💵',
    recommendedEngine: 'math_cra',
    content: `ក្រសួងអប់រំ យុវជន និងកីឡា - គណិតវិទ្យា ថ្នាក់ទី២
មេរៀន៖ រូបិយវត្ថុជាតិប្រាក់រៀល (១០០៛ ៥០០៛ ១០០០៛ ៥០០០៛ ១០០០០៛)
ខ្លឹមសារ៖ សិស្សអនុវត្តការរាប់ក្រដាសប្រាក់រៀល និងទូទាត់ទំនិញនៅផ្សារខ្មែរ។
- ទិញផ្លែស្វាយកែវរមៀតតម្លៃ ២,៥០០ រៀល
- ជ្រើសរើសក្រដាសប្រាក់រៀលបង់ឲ្យគ្រប់ចំនួនពិតប្រាកដ
គោលបំណង៖ ឲ្យសិស្សចេះគណនាប្រាក់ និងស្គាល់តម្លៃរូបិយវត្ថុជាតិ។`,
  },
  {
    id: 'preset-khmer-syllables',
    titleKhmer: 'មេរៀនភាសាខ្មែរ ថ្នាក់ទី១៖ ព្យញ្ជនៈដើម ជើងអក្សរ និងស្រៈ «ក្រូច ត្រី ផ្កា»',
    subject: 'khmer',
    gradeLevel: 1,
    icon: '🇰🇭',
    recommendedEngine: 'khmer_phonetics',
    content: `ក្រសួងអប់រំ យុវជន និងកីឡា - ភាសាខ្មែរ ថ្នាក់ទី១
មេរៀន៖ ព្យញ្ជនៈផ្សំ ជើងអក្សរ និងស្រៈនិស្ស័យ
ខ្លឹមសារ៖ ផ្គុំពាក្យខ្មែរដែលមានជើងអក្សរ (ជើង រ [្រ], ជើង ក [្ក], ជើង ល [្ល])
- ពាក្យគំរូ៖ ក + ្រ + ូច = ក្រូច, ត + ្រ + ី = ត្រី, ផ + ្ក + ា = ផ្កា
គោលបំណង៖ សិស្សយល់ដឹងពីសូរសព្ទ និងរៀបផ្គុំព្យាង្គបានត្រឹមត្រូវ។`,
  },
  {
    id: 'preset-sequencer-butterfly',
    titleKhmer: 'មេរៀនវិទ្យាសាស្ត្រ ថ្នាក់ទី៣៖ វដ្តជីវិតមេអំបៅក្នុងធម្មជាតិ',
    subject: 'science',
    gradeLevel: 3,
    icon: '🦋',
    recommendedEngine: 'sequencer',
    content: `ក្រសួងអប់រំ យុវជន និងកីឡា - វិទ្យាសាស្ត្រ ថ្នាក់ទី៣
មេរៀន៖ វដ្តជីវិតសត្វល្អិត (Metamorphosis)
ខ្លឹមសារ៖ មេអំបៅឆ្លងកាត់ ៤ ដំណាក់កាលនៃជីវិតតាមរង្វង់៖
ដំណាក់កាលទី ១៖ ពងតូចៗលើស្លឹកឈើ
ដំណាក់កាលទី ២៖ ដង្កូវស៊ីស្លឹកឈើ
ដំណាក់កាលទី ៣៖ ដឹកឌឿសម្ងំក្នុងសំបុកសូត្រ
ដំណាក់កាលទី ៤៖ មេអំបៅពេញវ័យបញ្ចេញស្លាបចម្រុះពណ៌
គោលបំណង៖ សិស្សរៀបចំដំណាក់កាលតាមលំដាប់លំដោយរង្វង់វដ្តជីវិត។`,
  },
  {
    id: 'preset-sorter-eco',
    titleKhmer: 'មេរៀនវិទ្យាសាស្ត្រ ថ្នាក់ទី២៖ ការបែងចែកសំរាមឆ្លាតតាម ៤ ពណ៌',
    subject: 'science',
    gradeLevel: 2,
    icon: '♻️',
    recommendedEngine: 'sorter',
    content: `ក្រសួងអប់រំ យុវជន និងកីឡា - បរិស្ថាន និងអនាម័យសាលា
មេរៀន៖ ការគ្រប់គ្រង និងចាត់ថ្នាក់សំរាម
ខ្លឹមសារ៖ បែងចែកសំរាមចូលធុងទាំង ៤ ពណ៌៖
- ធុងបៃតង៖ សំរាមសរីរាង្គ (សំបកចេក ស្លឹកឈើ)
- ធុងលឿង៖ ប្លាស្ទិក (ដបទឹកសុទ្ធ ថង់)
- ធុងខៀវ៖ ក្រដាស និងកេសកាតុង
- ធុងក្រហម៖ កាកសំណល់គ្រោះថ្នាក់ (ថ្មពិល អំពូលភ្លើង)
គោលបំណង៖ បណ្តុះទម្លាប់ចាត់ថ្នាក់សំរាមការពារបរិស្ថានសាលារៀន។`,
  },
];

export function generate6DigitPin(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ---------------------------------------------------------------------------
// DETERMINISTIC ENGINE CLASSIFIER
// ---------------------------------------------------------------------------
export function classifyLessonEngine(rawText: string): ClassificationReport {
  const text = rawText.toLowerCase();

  // Keyword weights for each engine
  const engineKeywords: Record<UniversalEngineType, { nameKh: string; words: string[] }> = {
    sandbox: {
      nameKh: 'បន្ទប់ពិសោធន៍រូបវិទ្យា (Sandbox)',
      words: [
        'ដុះ', 'ពន្លក', 'គ្រាប់ពូជ', 'រុក្ខជាតិ', 'ទឹក', 'ពន្លឺ', 'ដី', 'ជីវជាតិ', 'សំណើម',
        'អាហារ', 'ថាមពល', 'លូតលាស់', 'ការពារ', 'បាយ', 'វីតាមីន', 'ស្រមោល', 'ព្រះអាទិត្យ',
        'មេដែក', 'ដែក', 'ស្រូប', 'មេរោគ', 'លាងដៃ', 'សាប៊ូ', 'hygiene', 'germ', 'sun', 'shadow',
        'magnet', 'plant', 'germination', 'bento', 'soil',
      ],
    },
    math_cra: {
      nameKh: 'គណិតវិទ្យារូបវ័ន្ត (CRA Math)',
      words: [
        'គណិត', 'បូក', 'ដក', 'គុណ', 'ចែក', 'ស្មើ', 'ជញ្ជីង', 'ប្រាក់', 'រៀល', 'ផ្សារ',
        'ទូទាត់', 'បន្ទាត់ចំនួន', 'កង្កែបលោត', 'ប្រភាគ', 'ចំណិត', 'នាឡិកា', 'ម៉ោង', 'នាទី',
        'balance', 'cashier', 'riel', 'money', 'number line', 'fraction', 'clock', 'weight',
        'បូកលេខ', 'ដកលេខ', 'ថ្លឹង',
      ],
    },
    khmer_phonetics: {
      nameKh: 'អក្សរសាស្ត្រ និងព្យាង្គ (Khmer Phonetics)',
      words: [
        'ព្យញ្ជនៈ', 'ស្រៈ', 'ជើង', 'ផ្គុំ', 'ព្យាង្គ', 'ល្បះ', 'ប្រធាន', 'កិរិយា', 'កម្មបទ',
        'ពួក អ', 'ពួក អ៊', 'ទណ្ឌឃាត', 'ស្ងាត់', 'svo', 'sentence', 'phonetic', 'consonant',
        'subscript', 'vowel', 'អក្សរ', 'ព្យាង្គបិទ', 'ផ្ញើជើង', 'ពាក្យ',
      ],
    },
    sequencer: {
      nameKh: 'វដ្ត និងលំដាប់ (Process Sequencer)',
      words: [
        'វដ្ត', 'ជីវិត', 'ដំណាក់កាល', 'លំដាប់', 'រឿង', 'ដង្កូវ', 'មេអំបៅ', 'កូនក្អុក', 'កង្កែប',
        'រំហួត', 'ពពក', 'ភ្លៀង', 'ដើមរឿង', 'កណ្ដាលរឿង', 'ចុងរឿង', 'cycle', 'sequence',
        'stage', 'first', 'then', 'finally', 'metamorphosis', 'flow',
      ],
    },
    sorter: {
      nameKh: 'ចាត់ថ្នាក់ឆ្លាតវៃ (Attribute Sorter)',
      words: [
        'បែងចែក', 'ចាត់ថ្នាក់', 'ក្រុម', 'ធុង', 'សំរាម', 'សរីរាង្គ', 'ប្លាស្ទិក', 'មានជីវិត',
        'គ្មានជីវិត', 'ធរណីមាត្រ', 'រង្វង់', 'ត្រីកោណ', 'ការ៉េ', 'ចតុកោណ', 'sort', 'classify',
        'category', 'bin', 'eco', 'living', 'shape', 'រាង',
      ],
    },
  };

  const scores: EngineScore[] = (Object.keys(engineKeywords) as UniversalEngineType[]).map(engineKey => {
    const info = engineKeywords[engineKey];
    let score = 0;
    const matched: string[] = [];

    info.words.forEach(w => {
      if (text.includes(w.toLowerCase())) {
        score += 10;
        matched.push(w);
      }
    });

    return {
      engine: engineKey,
      engineNameKhmer: info.nameKh,
      score,
      confidence: 0,
      matchedKeywords: matched,
    };
  });

  const totalScore = scores.reduce((sum, s) => sum + s.score, 0) || 1;
  scores.forEach(s => {
    s.confidence = Math.round((s.score / totalScore) * 100);
  });

  // Sort descending by score
  scores.sort((a, b) => b.score - a.score);

  // Subject extraction
  let subject: SubjectId = 'khmer';
  if (text.includes('គណិត') || text.includes('math') || scores[0].engine === 'math_cra') {
    subject = 'math';
  } else if (text.includes('វិទ្យាសាស្ត្រ') || text.includes('science') || ['sandbox', 'sequencer', 'sorter'].includes(scores[0].engine)) {
    subject = 'science';
  }

  // Grade level extraction
  let gradeLevel: GradeLevel = 1;
  if (text.includes('ថ្នាក់ទី៣') || text.includes('grade 3') || text.includes('ថ្នាក់ទី ៣')) {
    gradeLevel = 3;
  } else if (text.includes('ថ្នាក់ទី២') || text.includes('grade 2') || text.includes('ថ្នាក់ទី ២')) {
    gradeLevel = 2;
  }

  // Deterministic Fallback Engine for unstructured or low-confidence input
  let selectedEngine: UniversalEngineType;
  let confidencePercentage: number;

  if (scores[0].score > 0) {
    selectedEngine = scores[0].engine;
    confidencePercentage = Math.max(scores[0].confidence, 70);
  } else {
    // Unstructured / low-confidence fallback:
    // Automatically detect whether the vocabulary fits Step Sequencing vs Category Sorting (default)
    const hasStepKeywords =
      /វដ្ត|ជីវិត|ដំណាក់កាល|លំដាប់|មុន|ក្រោយ|ទី១|ទី២|ទី៣|step|cycle|sequence|first|second|then|after|finally|metamorphosis|\b(1|2|3|4)\b/i.test(
        text
      );
    selectedEngine = hasStepKeywords ? 'sequencer' : 'sorter';
    confidencePercentage = 65;
  }

  return {
    selectedEngine,
    scores,
    confidencePercentage,
    extractedEntities: {
      subject,
      gradeLevel,
      topicKhmer: scores[0].matchedKeywords.slice(0, 4).join(', ') || 'មេរៀន MoEYS',
      keyVocabulary: scores[0].matchedKeywords,
    },
  };
}

// ---------------------------------------------------------------------------
// OCR VISION PIPELINE SIMULATOR
// ---------------------------------------------------------------------------
export async function simulateOcrExtraction(
  file: File
): Promise<{ extractedText: string; topicKhmer: string; confidence: number }> {
  // Simulate OCR image preprocessing and Khmer script recognition delay
  await new Promise(res => setTimeout(res, 900));

  const fileName = file.name.toLowerCase();
  if (fileName.includes('math') || fileName.includes('គណិត') || fileName.includes('លុយ') || fileName.includes('riel')) {
    return {
      extractedText: `ក្រសួងអប់រំ យុវជន និងកីឡា - គណិតវិទ្យា ថ្នាក់ទី២
មេរៀន៖ រូបិយវត្ថុជាតិប្រាក់រៀល និងការទិញទំនិញនៅផ្សារ
ខ្លឹមសារ៖ ការរាប់ក្រដាសប្រាក់រៀល ១០០៛ ៥០០៛ ១០០០៛ ៥០០០៛
លំហាត់៖ ទូទាត់ថ្លៃទំនិញឲ្យគ្រប់ចំនួនពិតប្រាកដ។`,
      topicKhmer: 'រូបិយវត្ថុជាតិប្រាក់រៀល',
      confidence: 96,
    };
  }

  if (fileName.includes('plant') || fileName.includes('seed') || fileName.includes('ដុះ') || fileName.includes('ពន្លក')) {
    return {
      extractedText: `ក្រសួងអប់រំ យុវជន និងកីឡា - វិទ្យាសាស្ត្រ ថ្នាក់ទី១
មេរៀន៖ ការដុះលូតលាស់នៃគ្រាប់ពូជរុក្ខជាតិ
កត្តាចាំបាច់៖ សំណើមទឹក (៦០-៨៥%) ពន្លឺព្រះអាទិត្យ និងជីជាតិដី
ដំណាក់កាល៖ គ្រាប់ពូជស្រូបទឹក -> ដុះឫសកែវ -> ឡើងពន្លកបៃតង -> ចេញផ្កា
លំហាត់៖ សារធាតុ និងតុល្យភាពបរិស្ថានសម្រាប់ការលូតលាស់។`,
      topicKhmer: 'ការដុះលូតលាស់របស់រុក្ខជាតិ',
      confidence: 94,
    };
  }

  if (fileName.includes('butterfly') || fileName.includes('cycle') || fileName.includes('មេអំបៅ') || fileName.includes('កង្កែប')) {
    return {
      extractedText: `ក្រសួងអប់រំ យុវជន និងកីឡា - វិទ្យាសាស្ត្រ ថ្នាក់ទី៣
មេរៀន៖ វដ្តជីវិតមេអំបៅ និងកង្កែប
ដំណាក់កាលទី ១៖ ពងតូចៗលើស្លឹក
ដំណាក់កាលទី ២៖ ដង្កូវស៊ីស្លឹកឈើ
ដំណាក់កាលទី ៣៖ ដឹកឌឿក្នុងសំបុកសូត្រ
ដំណាក់កាលទី ៤៖ មេអំបៅពេញវ័យ
លំហាត់៖ រៀបចំលំដាប់នៃវដ្តជីវិតសត្វល្អិត។`,
      topicKhmer: 'វដ្តជីវិតសត្វល្អិត',
      confidence: 98,
    };
  }

  // Default Khmer Lesson OCR extraction
  return {
    extractedText: `ក្រសួងអប់រំ យុវជន និងកីឡា - ភាសាខ្មែរ ថ្នាក់ទី១
មេរៀន៖ ព្យញ្ជនៈផ្សំ ជើងអក្សរ និងស្រៈនិស្ស័យ
ពាក្យគំរូ៖ ក្រូច ត្រី ផ្កា ខ្លា ស្មៅ
រចនាសម្ព័ន្ធ៖ ព្យញ្ជនៈដើម + ជើងអក្សរ + ស្រៈ
លំហាត់៖ ផ្គុំព្យាង្គ និងជើងអក្សរឲ្យត្រឹមត្រូវតាមអក្ខរាវិរុទ្ធ។`,
    topicKhmer: 'ព្យញ្ជនៈ និងជើងអក្សរខ្មែរ',
    confidence: 92,
  };
}

// ---------------------------------------------------------------------------
// LIVE JSON ERROR-CORRECTION SHIELD
// ---------------------------------------------------------------------------
export function sanitizeAndRepairGameConfig(config: any): GeneratedGameConfig {
  const timestamp = Date.now();

  if (!config || typeof config !== 'object') {
    return compileLessonToGame({
      title: 'ល្បែងសិក្សា MoEYS',
      rawText: 'បែងចែកសំរាមឆ្លាតវៃតាមធុង ៤ ពណ៌',
      sourceType: 'text',
    });
  }

  const id = typeof config.id === 'string' && config.id.trim() ? config.id : `game-repaired-${timestamp}`;
  const titleKhmer =
    typeof config.titleKhmer === 'string' && config.titleKhmer.trim()
      ? config.titleKhmer
      : 'ល្បែងសិក្សាបឋម MoEYS';
  const titleEnglish =
    typeof config.titleEnglish === 'string' ? config.titleEnglish : 'MoEYS Primary Game';

  const validSubjects: SubjectId[] = ['khmer', 'math', 'science'];
  const subject: SubjectId = validSubjects.includes(config.subject) ? config.subject : 'science';

  const gradeLevel: GradeLevel = [1, 2, 3].includes(Number(config.gradeLevel))
    ? (Number(config.gradeLevel) as GradeLevel)
    : 1;

  const validEngines: UniversalEngineType[] = [
    'sandbox',
    'math_cra',
    'khmer_phonetics',
    'sequencer',
    'sorter',
  ];
  let engineType: UniversalEngineType = validEngines.includes(config.engineType)
    ? config.engineType
    : validEngines.includes(config.template)
    ? config.template
    : 'sorter';

  const instructionsKhmer =
    typeof config.instructionsKhmer === 'string' && config.instructionsKhmer.trim()
      ? config.instructionsKhmer
      : 'បំពេញសកម្មភាពអន្តរកម្មតាមការណែនាំ';
  const instructionsEnglish =
    typeof config.instructionsEnglish === 'string' ? config.instructionsEnglish : 'Complete the activity';

  const metadata = {
    sourceLesson: config.metadata?.sourceLesson || 'Curriculum Input',
    targetCompetency: config.metadata?.targetCompetency || 'សមត្ថភាពសិក្សាជាតិ MoEYS',
    classroomPin: config.metadata?.classroomPin || generate6DigitPin(),
    createdAt: config.metadata?.createdAt || new Date().toISOString(),
    author: config.metadata?.author || 'លោកគ្រូ/អ្នកគ្រូ (AI Teacher Studio)',
    pedagogicalLoop: config.metadata?.pedagogicalLoop || `${engineType} procedural loop`,
  };

  let levels: GeneratedGameConfig['levels'] =
    Array.isArray(config.levels) && config.levels.length > 0 ? config.levels : [];
  if (levels.length === 0) {
    levels = [
      {
        levelId: 1,
        promptText: `អនុវត្តមេរៀន «${titleKhmer}»៖`,
        gameplayData: {},
      },
    ];
  }

  // Repair level gameplayData according to engineType
  levels = levels.map((lvl: any, index: number) => {
    const levelId = lvl.levelId || index + 1;
    const promptText = lvl.promptText || `អនុវត្តកម្រិត ${levelId} នៃមេរៀន «${titleKhmer}»៖`;
    const gameplayData = lvl.gameplayData ? { ...lvl.gameplayData } : {};

    if (engineType === 'sorter') {
      if (
        !gameplayData.sorterData ||
        !Array.isArray(gameplayData.sorterData.bins) ||
        gameplayData.sorterData.bins.length < 2
      ) {
        gameplayData.sorterData = {
          mode: 'eco_trash',
          bounceBackOnError: true,
          bins: [
            { id: 'b-org', nameKhmer: 'សំរាមសរីរាង្គ', colorClass: 'from-emerald-500 to-emerald-600', icon: '🍏' },
            { id: 'b-plas', nameKhmer: 'ប្លាស្ទិក/ជ័រ', colorClass: 'from-amber-400 to-amber-500', icon: '🧴' },
            { id: 'b-pap', nameKhmer: 'ក្រដាស', colorClass: 'from-sky-400 to-sky-500', icon: '📦' },
          ],
          entities: [
            { id: `e-1-${timestamp}`, nameKhmer: 'សំបកចេក', icon: '🍌', correctBinId: 'b-org' },
            { id: `e-2-${timestamp}`, nameKhmer: 'ដបទឹកសុទ្ធ', icon: '🍾', correctBinId: 'b-plas' },
            { id: `e-3-${timestamp}`, nameKhmer: 'កេសក្រដាស', icon: '📦', correctBinId: 'b-pap' },
            { id: `e-4-${timestamp}`, nameKhmer: 'ស្លឹកឈើ', icon: '🍂', correctBinId: 'b-org' },
          ],
        };
      }
    } else if (engineType === 'sequencer') {
      if (
        !gameplayData.sequencerData ||
        !Array.isArray(gameplayData.sequencerData.stages) ||
        gameplayData.sequencerData.stages.length < 2
      ) {
        gameplayData.sequencerData = {
          mode: 'life_cycle',
          cycleTitleKhmer: titleKhmer,
          layout: 'circular',
          stages: [
            { id: `st-1-${timestamp}`, stepNumber: 1, titleKhmer: '១. ចាប់ផ្ដើមដំបូង', descriptionKhmer: 'ដំណាក់កាលបង្កើតដំបូង', iconOrImage: '🥚' },
            { id: `st-2-${timestamp}`, stepNumber: 2, titleKhmer: '២. រីកធំធាត់', descriptionKhmer: 'លូតលាស់ជាបន្តបន្ទាប់', iconOrImage: '🐛' },
            { id: `st-3-${timestamp}`, stepNumber: 3, titleKhmer: '៣. ផ្លាស់ប្តូររូបរាង', descriptionKhmer: 'ការវិវត្តសរីរាង្គ', iconOrImage: '🥜' },
            { id: `st-4-${timestamp}`, stepNumber: 4, titleKhmer: '៤. ពេញវ័យពេញលេញ', descriptionKhmer: 'ដំណាក់កាលពេញវ័យ', iconOrImage: '🦋' },
          ],
        };
      }
    } else if (engineType === 'sandbox') {
      if (!gameplayData.sandboxData) {
        gameplayData.sandboxData = {
          mode: 'germination',
          targetGoalKhmer: titleKhmer,
          initialMoisture: 30,
          initialLight: 25,
          initialCompost: 20,
          optimalRange: { min: 55, max: 85 },
        };
      }
    } else if (engineType === 'math_cra') {
      if (!gameplayData.mathCraData) {
        gameplayData.mathCraData = {
          mode: 'market_cashier',
          targetTotal: 2500,
          billings: [{ itemKhmer: 'ទំនិញសិក្សា', priceRiel: 2500, icon: '🍎' }],
          allowedBanknotes: [100, 500, 1000, 5000, 10000],
        };
      }
    } else if (engineType === 'khmer_phonetics') {
      if (!gameplayData.khmerPhoneticsData) {
        gameplayData.khmerPhoneticsData = {
          mode: 'syllable_constructor',
          targetWordKhmer: 'ក្រូច',
          targetWordMeaning: 'ផ្លែក្រូចផ្អែមឆ្ងាញ់',
          targetWordImage: '🍊',
          correctBase: 'ក',
          correctSubscript: '្រ',
          correctVowel: 'ូច',
          baseConsonants: ['ក', 'ខ', 'ត', 'ច', 'ផ', 'ស'],
          subscripts: ['្រ', '្ល', '្ក', '្ម'],
          vowels: ['ា', 'ី', 'ូច', 'ៅ', 'ុំ'],
        };
      }
    }

    return {
      levelId,
      promptText,
      gameplayData,
    };
  });

  return {
    id,
    titleKhmer,
    titleEnglish,
    subject,
    gradeLevel,
    instructionsKhmer,
    instructionsEnglish,
    template: engineType,
    engineType,
    metadata,
    levels,
  };
}

// ---------------------------------------------------------------------------
// COMPILE LESSON TO GAME CONFIG (5 MECHANICS ENGINES)
// ---------------------------------------------------------------------------
export function compileLessonToGame(input: LessonInput): GeneratedGameConfig {
  const report = classifyLessonEngine(input.rawText);
  const selectedEngine = input.overrideEngine || report.selectedEngine;
  const { extractedEntities } = report;
  const pin = generate6DigitPin();
  const timestamp = Date.now();
  const titleKhmer = input.title || `ល្បែងសិក្សា៖ ${extractedEntities.topicKhmer}`;
  const titleEnglish = `Interactive Studio: ${selectedEngine.toUpperCase()}`;

  let instructionsKhmer = 'បំពេញសកម្មភាពអន្តរកម្មតាមការណែនាំ';
  let instructionsEnglish = 'Complete the interactive activity';
  let gameplayData: GeneratedGameConfig['levels'][0]['gameplayData'] = {};

  if (selectedEngine === 'sandbox') {
    instructionsKhmer = 'ទាញប៊ូតុងបញ្ជាកត្តាបរិស្ថានឲ្យស្ថិតក្នុងកម្រិតសមស្រប (៦០-៨៥%) ដើម្បីឲ្យរុក្ខជាតិលូតលាស់';
    instructionsEnglish = 'Adjust environmental sliders to optimal zone to thrive';
    const sandboxData: SandboxData = {
      mode: 'germination',
      targetGoalKhmer: 'ពិសោធន៍ដំណុះ និងការលូតលាស់របស់រុក្ខជាតិ',
      initialMoisture: 30,
      initialLight: 25,
      initialCompost: 20,
      optimalRange: { min: 55, max: 90 },
    };
    gameplayData = { sandboxData };
  } else if (selectedEngine === 'math_cra') {
    instructionsKhmer = 'រាប់ក្រដាសប្រាក់រៀល ឬថ្លឹងទម្ងន់ឲ្យមានតុល្យភាពស្មើគ្នា';
    instructionsEnglish = 'Use physical manipulatives to solve math challenges';
    const targetPrice = 2500;
    const mathCraData: MathCraData = {
      mode: 'market_cashier',
      targetTotal: targetPrice,
      billings: [{ itemKhmer: 'ទំនិញសិក្សា', priceRiel: targetPrice, icon: '🍎' }],
      allowedBanknotes: [100, 500, 1000, 5000, 10000],
    };
    gameplayData = { mathCraData };
  } else if (selectedEngine === 'khmer_phonetics') {
    instructionsKhmer = 'ផ្គុំព្យញ្ជនៈដើម + ជើងអក្សរ + ស្រៈនិស្ស័យ ដើម្បីបង្កើតពាក្យពេញលេញ';
    instructionsEnglish = 'Snap base consonant, subscript foot, and vowel onto the grid';
    const khmerPhoneticsData: KhmerPhoneticsData = {
      mode: 'syllable_constructor',
      targetWordKhmer: 'ក្រូច',
      targetWordMeaning: 'ផ្លែក្រូចផ្អែមឆ្ងាញ់',
      targetWordImage: '🍊',
      correctBase: 'ក',
      correctSubscript: '្រ',
      correctVowel: 'ូច',
      baseConsonants: ['ក', 'ខ', 'ត', 'ច', 'ផ', 'ស'],
      subscripts: ['្រ', '្ល', '្ក', '្ម'],
      vowels: ['ា', 'ី', 'ូច', 'ៅ', 'ុំ'],
    };
    gameplayData = { khmerPhoneticsData };
  } else if (selectedEngine === 'sequencer') {
    instructionsKhmer = 'តម្រៀបដំណាក់កាលតាមលំដាប់លំដោយរង្វង់វដ្តជីវិត ឬព្រឹត្តិការណ៍';
    instructionsEnglish = 'Drag and place stages in correct chronological sequence';
    const sequencerData: SequencerData = {
      mode: 'life_cycle',
      cycleTitleKhmer: 'វដ្តជីវិត និងការលូតលាស់',
      layout: 'circular',
      stages: [
        { id: `st-1-${timestamp}`, stepNumber: 1, titleKhmer: '១. ចាប់ផ្ដើមដំបូង', descriptionKhmer: 'ដំណាក់កាលបង្កើតដំបូង', iconOrImage: '🥚' },
        { id: `st-2-${timestamp}`, stepNumber: 2, titleKhmer: '២. រីកធំធាត់', descriptionKhmer: 'លូតលាស់ជាបន្តបន្ទាប់', iconOrImage: '🐛' },
        { id: `st-3-${timestamp}`, stepNumber: 3, titleKhmer: '៣. ផ្លាស់ប្តូររូបរាង', descriptionKhmer: 'ការវិវត្តសរីរាង្គ', iconOrImage: '🥜' },
        { id: `st-4-${timestamp}`, stepNumber: 4, titleKhmer: '៤. ពេញវ័យពេញលេញ', descriptionKhmer: 'ដំណាក់កាលពេញវ័យ', iconOrImage: '🦋' },
      ],
    };
    gameplayData = { sequencerData };
  } else {
    // Sorter Engine
    instructionsKhmer = 'បែងចែកធាតុចូលក្នុងធុងចាត់ថ្នាក់ដែលត្រូវគ្នា';
    instructionsEnglish = 'Sort items into the appropriate MoEYS classification bins';
    const sorterData: SorterData = {
      mode: 'eco_trash',
      bounceBackOnError: true,
      bins: [
        { id: 'bin-a', nameKhmer: 'ក្រុម ទី១ (សរីរាង្គ)', colorClass: 'from-emerald-500 to-emerald-600', icon: '🍏' },
        { id: 'bin-b', nameKhmer: 'ក្រុម ទី២ (ប្លាស្ទិក/ជ័រ)', colorClass: 'from-amber-400 to-amber-500', icon: '🧴' },
        { id: 'bin-c', nameKhmer: 'ក្រុម ទី៣ (ក្រដាស)', colorClass: 'from-sky-400 to-sky-500', icon: '📦' },
      ],
      entities: [
        { id: `e-1-${timestamp}`, nameKhmer: 'សំបកចេក', icon: '🍌', correctBinId: 'bin-a' },
        { id: `e-2-${timestamp}`, nameKhmer: 'ដបទឹកសុទ្ធ', icon: '🍾', correctBinId: 'bin-b' },
        { id: `e-3-${timestamp}`, nameKhmer: 'កេសក្រដាស', icon: '📦', correctBinId: 'bin-c' },
        { id: `e-4-${timestamp}`, nameKhmer: 'ស្លឹកឈើ', icon: '🍂', correctBinId: 'bin-a' },
      ],
    };
    gameplayData = { sorterData };
  }

  const rawConfig: GeneratedGameConfig = {
    id: `ai-game-${timestamp}`,
    titleKhmer,
    titleEnglish,
    subject: extractedEntities.subject,
    gradeLevel: extractedEntities.gradeLevel,
    instructionsKhmer,
    instructionsEnglish,
    template: selectedEngine,
    engineType: selectedEngine,
    metadata: {
      sourceLesson: input.fileName || 'Uploaded Curriculum Document',
      targetCompetency: 'សមត្ថភាពសិក្សាជាតិ MoEYS',
      classroomPin: pin,
      createdAt: new Date().toISOString(),
      author: 'លោកគ្រូ/អ្នកគ្រូ (AI Teacher Studio)',
      pedagogicalLoop: `${selectedEngine} engine procedural mechanics`,
    },
    levels: [
      {
        levelId: 1,
        promptText: `អនុវត្តមេរៀន «${titleKhmer}» ដោយប្រើ ${selectedEngine.toUpperCase()} Engine៖`,
        gameplayData,
      },
    ],
  };

  return sanitizeAndRepairGameConfig(rawConfig);
}
