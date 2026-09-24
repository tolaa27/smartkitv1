// src/types/game.ts
// Universal Cambodian MoEYS EdTech Platform Types & 5 Core Game Engines

export type GradeLevel = 1 | 2 | 3;

export type SubjectId = 'science' | 'math' | 'khmer' | 'social';

export type UniversalEngineType =
  | 'sorter'          // Engine 1: Spatial & Attribute Sorter (Tap-to-Select -> Tap-to-Place)
  | 'math_cra'        // Engine 2: Concrete-Representational-Abstract (CRA) Math
  | 'sandbox'         // Engine 3: Environmental State-Machine Sandbox
  | 'khmer_phonetics' // Engine 4: Khmer Orthography & Syntax Rail
  | 'sequencer';      // Engine 5: Chronological Stage Sequencer

export type SyntaxEngineType = UniversalEngineType | 'syntax';

export type KhmerPhoneticsMode =
  | 'syllable_constructor'
  | 'svo_rail'
  | 'phonetic_drum'
  | 'silent_marker';

export type SyntaxMode = KhmerPhoneticsMode;

export type GameTemplateType =
  | UniversalEngineType
  | 'sorter'
  | 'sequencer'
  | 'quiz_tap'
  | 'sentence_builder'
  | 'matching_cards'
  | 'hotspot';

// ---------------------------------------------------------------------------
// 1. SPATIAL SORTER ENGINE DATA MODELS (Tap-to-Select -> Tap-to-Place)
// ---------------------------------------------------------------------------
export type SorterMode =
  | 'eco_trash'
  | 'living_matrix'
  | 'bento'
  | 'food_groups'
  | 'khmer_consonants'
  | 'lexical_bins'
  | 'geometry_spotter';

export interface SorterBin {
  id: string;
  nameKhmer: string;
  nameEnglish?: string;
  colorClass: string;
  icon: string;
  // snake_case aliases for API payloads
  name_khmer?: string;
  name_english?: string;
  color_class?: string;
}

export interface SorterEntity {
  id: string;
  nameKhmer: string;
  icon: string;
  correctBinId: string;
  feedbackKhmer?: string;
  attributes?: string[];
  // snake_case aliases for API payloads
  name_khmer?: string;
  correct_bin_id?: string;
  feedback_khmer?: string;
}

export interface SorterData {
  mode: SorterMode;
  bins: SorterBin[];
  entities: SorterEntity[];
  bounceBackOnError?: boolean;
}

// ---------------------------------------------------------------------------
// 2. CRA MATH LAB ENGINE DATA MODELS
// ---------------------------------------------------------------------------
export type MathCraMode =
  | 'balance_scale'    // Dual-Pan Balance Scale: A + ▢ = B
  | 'market_cashier'   // Cambodian Market Cashier: 100៛, 500៛, 1,000៛, 5,000៛, 10,000៛
  | 'frog_hopper'      // Frog Number Line Hopper: 0-20 or 0-100
  | 'fair_share'       // Fair-Share Candy/Fruit Division with visual remainders
  | 'clockwork'        // Interactive Clock with Khmer numeral dial
  | 'fraction_cutter'; // Fraction Slicer: halves, thirds, quarters

export interface Banknote {
  value: number;
  khmerLabel: string;
  color: string;
  accent: string;
  icon: string;
}

export interface MathCraData {
  mode: MathCraMode;
  targetTotal?: number;          // e.g. 2700 Riel, target sum 13
  initialEquation?: string;      // e.g. "4 + ▢ = 9"
  leftPanWeights?: number[];     // for balance scale
  rightPanTarget?: number;       // for balance scale
  mysteryBoxValue?: number;      // for balance scale
  billings?: Array<{ itemKhmer: string; priceRiel: number; icon: string; item_khmer?: string; price_riel?: number }>;
  allowedBanknotes?: number[];   // 100, 500, 1000, 5000, 10000
  numberLineStart?: number;      // 0
  numberLineEnd?: number;        // 20 or 100
  operandA?: number;
  operandB?: number;
  operation?: 'add' | 'subtract' | 'multiply' | 'divide';
  totalItemsCount?: number;      // for fair_share (e.g. 14 mangosteens)
  basketsCount?: number;         // for fair_share (e.g. 3 baskets)
  itemEmoji?: string;            // '🫐', '🍬', '🍌'
  targetFraction?: { numerator: number; denominator: number; labelKhmer: string };
  targetTime?: { hour: number; minute: number; labelKhmer: string };
  // snake_case aliases
  target_total?: number;
  initial_equation?: string;
  left_pan_weights?: number[];
  right_pan_target?: number;
  mystery_box_value?: number;
  number_line_start?: number;
  number_line_end?: number;
  operand_a?: number;
  operand_b?: number;
  total_items_count?: number;
  baskets_count?: number;
  item_emoji?: string;
}

// ---------------------------------------------------------------------------
// 3. ENVIRONMENTAL SANDBOX ENGINE DATA MODELS (State-Machine Lab)
// ---------------------------------------------------------------------------
export type SandboxMode =
  | 'germination'    // Seed Germination Lab: Moisture, Light, Compost sliders
  | 'germ_buster'    // Germ Buster Hygiene Lab: lathered soap scrubbing over SVG hands
  | 'sun_shadow'     // Sun & Shadow Vector Dial
  | 'bento_balance'  // 3 Food Groups Bento
  | 'magnetism';     // Magnetic attraction lab

export interface SandboxItem {
  id: string;
  nameKhmer: string;
  nameEnglish?: string;
  icon: string;
  category?: 'energy' | 'growth' | 'protection' | 'magnetic' | 'non_magnetic' | string;
  value?: number;
  permeability?: number;
  initialX?: number;
  initialY?: number;
  // snake_case aliases
  name_khmer?: string;
  name_english?: string;
}

export interface SandboxData {
  mode: SandboxMode;
  targetGoalKhmer: string;
  initialMoisture?: number; // 0 - 100
  initialLight?: number;    // 0 - 100
  initialCompost?: number;  // 0 - 100
  optimalRange?: { min: number; max: number };
  items?: SandboxItem[];
  targetAngle?: number;     // for sun_shadow
  targetMilestone?: string; // e.g. "ម៉ោង ៧:០០ ព្រឹក"
  // snake_case aliases
  target_goal_khmer?: string;
  initial_moisture?: number;
  initial_light?: number;
  initial_compost?: number;
  optimal_range?: { min: number; max: number };
  target_angle?: number;
  target_milestone?: string;
}

// ---------------------------------------------------------------------------
// 4. SYNTAX RAIL ENGINE DATA MODELS (Khmer Orthography & Syntax)
// ---------------------------------------------------------------------------
// SyntaxMode is aliased to KhmerPhoneticsMode above

export interface SvoSlot {
  textKhmer: string;
  image?: string;
  text_khmer?: string;
}

export interface SvoCard {
  id: string;
  textKhmer: string;
  role: 'subject' | 'verb' | 'object';
  image?: string;
  text_khmer?: string;
}

export interface SilentConsonantWord {
  id: string;
  wordKhmer: string;
  letters: string[];
  silentIndex: number;
  meaningKhmer: string;
  word_khmer?: string;
  silent_index?: number;
  meaning_khmer?: string;
}

export interface SyntaxData {
  mode: SyntaxMode;
  targetWordKhmer?: string;
  targetWordMeaning?: string;
  targetWordImage?: string;
  syllableTarget?: {
    baseConsonant: string;
    subscript: string;
    vowel: string;
    finalConsonant?: string;
    targetWordKhmer: string;
    targetMeaning: string;
    targetImage?: string;
  };
  baseConsonants?: string[];
  subscripts?: string[];
  vowels?: string[];
  finalConsonants?: string[];
  correctBase?: string;
  correctSubscript?: string;
  correctVowel?: string;
  correctFinal?: string;
  svoSlots?: {
    subject: SvoSlot;
    verb: SvoSlot;
    object: SvoSlot;
  };
  availableSvoCards?: SvoCard[];
  conveyorConsonants?: Array<{ id: string; consonant: string; register: 'series_o' | 'series_or' }>;
  wordsWithSilentConsonant?: SilentConsonantWord[];
  // snake_case aliases
  target_word_khmer?: string;
  target_word_meaning?: string;
  available_svo_cards?: SvoCard[];
  words_with_silent_consonant?: SilentConsonantWord[];
}

export type KhmerPhoneticsData = SyntaxData;

// ---------------------------------------------------------------------------
// 5. STAGE SEQUENCER ENGINE DATA MODELS (Chronological Cycles)
// ---------------------------------------------------------------------------
export type SequencerMode =
  | 'life_cycle'   // Metamorphosis (Butterfly, Frog) circular cycle
  | 'water_cycle'  // Atmospheric water cycle diagram
  | 'comic_strip'  // 3-Panel Comic Story Ordering
  | 'linear';

export interface SequencerStage {
  id: string;
  stepNumber: number;
  titleKhmer: string;
  descriptionKhmer: string;
  iconOrImage: string;
  // snake_case aliases
  step_number?: number;
  title_khmer?: string;
  description_khmer?: string;
  icon_or_image?: string;
}

export interface SequencerData {
  mode: SequencerMode;
  cycleTitleKhmer: string;
  layout: 'circular' | 'linear';
  stages: SequencerStage[];
  // snake_case aliases
  cycle_title_khmer?: string;
}

// ---------------------------------------------------------------------------
// UNIVERSAL GAME ITEMS & HOTSPOTS
// ---------------------------------------------------------------------------
export interface GameCategory {
  id: string;
  nameKhmer: string;
  nameEnglish: string;
  icon: string;
}

export interface GameItem {
  id: string;
  labelKhmer: string;
  labelEnglish?: string;
  imageOrIcon: string;
  correctCategoryOrOrder: string | number;
  feedbackKhmer?: string;
}

export interface GameTile {
  id: string;
  textKhmer: string;
  order: number;
}

export interface GamePair {
  id: string;
  khmer: string;
  matchId: string;
  image?: string;
  audioHint?: string;
}

export interface GameHotspot {
  id: string;
  xPercent: number;
  yPercent: number;
  labelKhmer: string;
  labelEnglish?: string;
  icon: string;
  hintKhmer: string;
  funFactKhmer: string;
}

export interface QuizOption {
  id: string;
  textKhmer: string;
  isCorrect: boolean;
  emoji?: string;
}

// ---------------------------------------------------------------------------
// GAME LEVEL & CONFIGURATION SCHEMAS
// ---------------------------------------------------------------------------
export interface GameLevel {
  levelId: number;
  level_id?: number;
  promptText: string;
  prompt_text?: string;
  promptImage?: string;
  soundEffect?: string;
  timeLimitSeconds?: number;
  gameplayData: {
    // 5 Mechanics Engines Data
    sorterData?: SorterData;
    mathCraData?: MathCraData;
    sandboxData?: SandboxData;
    syntaxData?: SyntaxData;
    khmerPhoneticsData?: KhmerPhoneticsData;
    sequencerData?: SequencerData;

    // snake_case aliases
    sorter_data?: SorterData;
    math_cra_data?: MathCraData;
    sandbox_data?: SandboxData;
    syntax_data?: SyntaxData;
    sequencer_data?: SequencerData;

    // Fallback Data
    categories?: GameCategory[];
    items?: GameItem[];
    tiles?: GameTile[];
    pairs?: GamePair[];
    hotspots?: GameHotspot[];
    quizOptions?: QuizOption[];
  };
  gameplay_data?: GameLevel['gameplayData'];
}

export interface GameMetadata {
  sourceLesson?: string;
  targetCompetency: string;
  gameNumber?: number;
  classroomPin?: string;
  createdAt?: string;
  author?: string;
  pedagogicalLoop?: string;
  target_competency?: string;
  classroom_pin?: string;
}

export interface LessonMaterial {
  pdfUrl?: string;
  pageNumber?: number;
  snippetBase64?: string;
  lessonSummaryKhmer?: string;
  lessonTitleKhmer?: string;
}

export interface GeneratedGameConfig {
  id: string;
  titleKhmer: string;
  titleEnglish: string;
  subject: SubjectId;
  gradeLevel: GradeLevel;
  instructionsKhmer: string;
  instructionsEnglish: string;
  template: GameTemplateType;
  engineType?: UniversalEngineType;
  metadata: GameMetadata;
  levels: GameLevel[];

  // Optional introductory & in-game lesson document reference
  lessonMaterial?: LessonMaterial;

  // snake_case aliases for API payloads
  title_khmer?: string;
  title_english?: string;
  grade_level?: GradeLevel;
  instructions_khmer?: string;
  instructions_english?: string;
  engine_type?: UniversalEngineType;
  lesson_material?: LessonMaterial;
}

// ---------------------------------------------------------------------------
// TEACHER STUDIO TYPES
// ---------------------------------------------------------------------------
export interface StudioCompileRequest {
  lessonText?: string;
  rawText?: string;
  ocrString?: string;
  subject?: SubjectId;
  gradeLevel?: GradeLevel;
}

export interface StudioCompileResponse {
  success: boolean;
  message: string;
  game?: GeneratedGameConfig;
  error?: string;
}

// ---------------------------------------------------------------------------
// PROGRESS & USER PROFILES
// ---------------------------------------------------------------------------
export interface GameProgress {
  userId: string;
  gameId: string;
  gradeLevel: GradeLevel;
  starsEarned: number; // 1-3
  score: number;
  completedAt: string;
}

export interface StudentProfile {
  id: string;
  nickname: string;
  avatarId: string;
  gradeLevel: GradeLevel;
  gradeId?: string;
  totalStars: number;
  totalScore: number;
  totalGems?: number;
}
