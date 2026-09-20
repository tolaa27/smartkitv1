// src/types/curriculum.ts
// Official MoEYS Lower Primary Curriculum Data Models (Grades 1 and 2)

export type Grade = 1 | 2;

export type Subject = 'math' | 'khmer' | 'science' | 'social';

export type ExerciseType =
  | 'mcq'                  // Multiple choice / pick one
  | 'tap-select-count'     // Select N items from a set to match a count
  | 'number-line-fill'     // Number line jumps for addition/subtraction
  | 'match-pairs'          // Pair left items to right items
  | 'order-sequence'       // Reorder numbers or cards from small-to-large / large-to-small
  | 'place-value-blocks'   // 100s, 10s, 1s base-ten representation
  | 'fill-blank'           // Input or select missing number/word
  | 'compare-select'       // Size & comparison (durian vs apple vs coconut)
  | 'position-pick'        // Spatial awareness (left/right/center)
  | 'number-line'          // Interactive number line jump
  | 'shape-match'          // 2D/3D shapes matching
  | 'base-ten-blocks'      // Hundreds, tens, ones visual blocks
  | 'riel-calculator';     // Cambodian riel currency calculator

export interface BaseExercise {
  id: string;
  grade: Grade;
  subject: Subject;
  type: ExerciseType;
  lessonKh: string;        // e.g. "មេរៀនទី ៣: ការប្រៀបធៀបទំហំ"
  lessonEn?: string;
  questionKh: string;      // Question stem in Khmer
  questionEn?: string;
  hintKh?: string;
  audioPromptKh?: string;  // Explicit text for WebSpeech reading
}

// 1. MCQ Exercise
export interface McqOption {
  id: string;
  textKh: string;
  textEn?: string;
  icon?: string;
  svgVisual?: 'square' | 'triangle' | 'circle' | 'rectangle' | 'cube' | 'cylinder' | 'balance-heavy' | 'balance-light' | 'east' | 'west' | 'north' | 'south' | 'root' | 'stem' | 'leaf' | 'flower' | 'fruit';
  isCorrect: boolean;
}

export interface McqExercise extends BaseExercise {
  type: 'mcq';
  options: McqOption[];
  visualContext?: {
    type: 'comparison' | 'position' | 'geometry' | 'diagram';
    data: any;
  };
}

// 2. Tap-Select-Count Exercise
export interface TapSelectCountExercise extends BaseExercise {
  type: 'tap-select-count';
  targetCount: number;
  itemType: 'apple' | 'star' | 'mango' | 'fish' | 'flower' | 'gem';
  totalItems: number;
}

// 3. Number Line Exercise
export interface NumberLineJump {
  from: number;
  to: number;
  direction: 'forward' | 'backward';
  step: number;
  label?: string; // e.g. "+1", "-2"
}

export interface NumberLineExercise extends BaseExercise {
  type: 'number-line-fill';
  startValue: number;
  endValue: number;
  stepSize: number;
  jumps: NumberLineJump[];
  equationKh: string;   // e.g. "៤ + ១ = ?" or "៥ - ២ = ?"
  correctAnswer: number;
  options?: number[];
}

// 4. Match Pairs Exercise
export interface PairItem {
  id: string;
  textKh: string;
  icon?: string;
}

export interface MatchPair {
  leftId: string;
  rightId: string;
}

export interface MatchPairsExercise extends BaseExercise {
  type: 'match-pairs';
  leftItems: PairItem[];
  rightItems: PairItem[];
  pairs: MatchPair[];
}

// 5. Order Sequence Exercise
export interface SequenceItem {
  id: string;
  labelKh: string;
  value: number;
  subtext?: string;
}

export interface OrderSequenceExercise extends BaseExercise {
  type: 'order-sequence';
  items: SequenceItem[];
  orderDirection: 'asc' | 'desc'; // Small to large vs large to small
  directionLabelKh: string;       // e.g. "ពីតូចទៅធំ" or "ពីធំទៅតូច"
}

// 6. Place Value Blocks Exercise
export interface PlaceValueBlocksExercise extends BaseExercise {
  type: 'place-value-blocks';
  hundreds: number;
  tens: number;
  ones: number;
  targetValue: number; // e.g. 243
  mode: 'identify' | 'construct';
  options?: number[];
}

// 7. Fill Blank Exercise
export interface FillBlankExercise extends BaseExercise {
  type: 'fill-blank';
  templateKh: string; // e.g. "៤ + ៤ + ៤ = ៤ × {blank} = ១២"
  correctAnswer: string;
  options: string[];
}

// 8. Compare Select (Size & Comparison)
export interface CompareItem {
  id: string;
  textKh: string;
  textEn?: string;
  icon: string;
  sizeLabelKh?: string;
  sizeScale?: number; // relative size multiplier for visual rendering (e.g., 1.5 vs 1.0 vs 0.75)
  isCorrect: boolean;
}

export interface CompareSelectExercise extends BaseExercise {
  type: 'compare-select';
  targetCriterion: 'biggest' | 'smallest' | 'tallest' | 'shortest';
  items: CompareItem[];
}

// 9. Position Pick (Spatial Awareness)
export interface PositionItem {
  id: string;
  textKh: string;
  icon: string;
  position: 'left' | 'center' | 'right';
  isCorrect: boolean;
}

export interface PositionPickExercise extends BaseExercise {
  type: 'position-pick';
  targetPosition: 'left' | 'center' | 'right';
  targetPositionLabelKh: string; // e.g. "ខាងស្តាំ", "ខាងឆ្វេង", "កណ្តាល"
  items: PositionItem[];
}

// 10. Number Line Jump
export interface NumberLineJumpExercise extends BaseExercise {
  type: 'number-line';
  startValue: number;
  endValue: number;
  jumps: NumberLineJump[];
  equationKh: string;
  correctAnswer: number;
  options: number[];
}

// 11. Shape Match (Geometry)
export interface ShapeItem {
  id: string;
  nameKh: string;
  nameEn: string;
  shapeType: 'square' | 'triangle' | 'circle' | 'rectangle';
  color: string;
  isCorrect?: boolean;
}

export interface ShapeMatchExercise extends BaseExercise {
  type: 'shape-match';
  targetShape: 'square' | 'triangle' | 'circle' | 'rectangle';
  targetShapeNameKh: string; // e.g. "ការ៉េ", "ត្រីកោណ", "រង្វង់", "ចតុកោណកែង"
  shapes: ShapeItem[];
}

// 12. Base Ten Blocks
export interface BaseTenBlocksCurriculumExercise extends BaseExercise {
  type: 'base-ten-blocks';
  hundreds: number;
  tens: number;
  ones: number;
  targetValue: number;
  options: number[];
}

// 13. Cambodian Riel Currency Calculator
export interface RielNote {
  value: 100 | 200 | 500 | 1000 | 2000 | 5000 | 10000;
  labelKh: string;
  color: string;
}

export interface RielCalculatorExercise extends BaseExercise {
  type: 'riel-calculator';
  promptScenarioKh: string;
  givenAmount: number;
  itemPrice: number;
  changeRequired: number;
  availableNotes: number[];
  options: number[];
}

export type CurriculumExercise =
  | McqExercise
  | TapSelectCountExercise
  | NumberLineExercise
  | MatchPairsExercise
  | OrderSequenceExercise
  | PlaceValueBlocksExercise
  | FillBlankExercise
  | CompareSelectExercise
  | PositionPickExercise
  | NumberLineJumpExercise
  | ShapeMatchExercise
  | BaseTenBlocksCurriculumExercise
  | RielCalculatorExercise;

export interface CurriculumProgress {
  exerciseId: string;
  isCompleted: boolean;
  score: number;
  stars: number;
  attempts: number;
}
