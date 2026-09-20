// src/data/moeysCurriculum.ts
// Official MoEYS Lower Primary Curriculum Dataset (Grades 1 & 2)

import { CurriculumExercise } from '@/types/curriculum';

export const MOEYS_CURRICULUM_DATASET: CurriculumExercise[] = [
  // =========================================================================
  // GRADE 1: MATH (មេរៀនទី១–៩)
  // =========================================================================

  // 1. Grade 1 - Lesson 1: ទំហំ (Size & Comparison) -> compare-select
  {
    id: 'g1-math-lesson-1',
    grade: 1,
    subject: 'math',
    type: 'compare-select',
    lessonKh: 'មេរៀនទី ១: ការប្រៀបធៀបទំហំ (Size & Comparison)',
    lessonEn: 'Lesson 1: Size & Comparison',
    questionKh: 'ចូរវង់លើរូបដែលធំជាងគេ (Circle the biggest item)',
    questionEn: 'Select the biggest item among Durian, Apple, and Coconut',
    audioPromptKh: 'ចូរវង់លើរូបដែលធំជាងគេ',
    targetCriterion: 'biggest',
    items: [
      {
        id: 'durian',
        textKh: 'ផ្លែធុរេន (Durian)',
        textEn: 'Durian',
        icon: '🍈',
        sizeLabelKh: 'ធំជាងគេ',
        sizeScale: 1.5,
        isCorrect: true,
      },
      {
        id: 'apple',
        textKh: 'ផ្លែប៉ោម (Apple)',
        textEn: 'Apple',
        icon: '🍎',
        sizeLabelKh: 'តូច',
        sizeScale: 0.8,
        isCorrect: false,
      },
      {
        id: 'coconut',
        textKh: 'ផ្លែដូង (Coconut)',
        textEn: 'Coconut',
        icon: '🥥',
        sizeLabelKh: 'មធ្យម',
        sizeScale: 1.1,
        isCorrect: false,
      },
    ],
  },

  // 2. Grade 1 - Lesson 2: ទីតាំង (Spatial Awareness) -> position-pick
  {
    id: 'g1-math-lesson-2',
    grade: 1,
    subject: 'math',
    type: 'position-pick',
    lessonKh: 'មេរៀនទី ២: ទីតាំង (Spatial Awareness)',
    lessonEn: 'Lesson 2: Spatial Awareness (Left / Right / Center)',
    questionKh: 'ចូរវង់លើរូបដែលនៅ «ខាងស្តាំ» (Select item on the Right)',
    questionEn: 'Select the animal located on the RIGHT side',
    audioPromptKh: 'ចូរវង់លើរូបដែលនៅខាងស្តាំ',
    targetPosition: 'right',
    targetPositionLabelKh: 'ខាងស្តាំ (Right)',
    items: [
      { id: 'cat', textKh: 'កូនឆ្មា (Cat)', icon: '🐱', position: 'left', isCorrect: false },
      { id: 'dog', textKh: 'កូនឆ្កែ (Dog)', icon: '🐶', position: 'center', isCorrect: false },
      { id: 'rabbit', textKh: 'ទន្សាយ (Rabbit)', icon: '🐰', position: 'right', isCorrect: true },
    ],
  },

  // 3. Grade 1 - Lesson 7: វិធីបូក និងវិធីដក (Number Line Jump) -> number-line
  {
    id: 'g1-math-lesson-7',
    grade: 1,
    subject: 'math',
    type: 'number-line',
    lessonKh: 'មេរៀនទី ៧: វិធីបូក និងវិធីដក (Number Line Jump)',
    lessonEn: 'Lesson 7: Addition & Subtraction on Number Line',
    questionKh: 'ចូរបំពេញចំនួនតាមបន្ទាត់ចំនួន: ៤ + ១ = ?',
    questionEn: 'Complete the addition jump on the number line: 4 + 1 = ?',
    audioPromptKh: 'ចូរបំពេញចំនួនតាមបន្ទាត់ចំនួន បួនបូកមួយ ស្មើនឹងប៉ុន្មាន?',
    startValue: 0,
    endValue: 10,
    jumps: [
      { from: 0, to: 4, direction: 'forward', step: 4, label: '+៤' },
      { from: 4, to: 5, direction: 'forward', step: 1, label: '+១' },
    ],
    equationKh: '៤ + ១ = ?',
    correctAnswer: 5,
    options: [3, 4, 5, 6],
  },

  // 4. Grade 1 - Lesson 9: ធរណីមាត្រ (Shapes & Geometry) -> shape-match
  {
    id: 'g1-math-lesson-9',
    grade: 1,
    subject: 'math',
    type: 'shape-match',
    lessonKh: 'មេរៀនទី ៩: ធរណីមាត្រ (Shapes & Geometry)',
    lessonEn: 'Lesson 9: 2D Shapes & Geometry',
    questionKh: 'ចូរជ្រើសរើសរូប «ត្រីកោណ» (Select the Triangle)',
    questionEn: 'Select the Triangle shape among the geometry figures',
    audioPromptKh: 'ចូរជ្រើសរើសរូប ត្រីកោណ',
    targetShape: 'triangle',
    targetShapeNameKh: 'ត្រីកោណ (Triangle)',
    shapes: [
      { id: 'sh-square', nameKh: 'ការ៉េ', nameEn: 'Square', shapeType: 'square', color: '#10B981', isCorrect: false },
      { id: 'sh-triangle', nameKh: 'ត្រីកោណ', nameEn: 'Triangle', shapeType: 'triangle', color: '#3B82F6', isCorrect: true },
      { id: 'sh-circle', nameKh: 'រង្វង់', nameEn: 'Circle', shapeType: 'circle', color: '#F59E0B', isCorrect: false },
      { id: 'sh-rectangle', nameKh: 'ចតុកោណកែង', nameEn: 'Rectangle', shapeType: 'rectangle', color: '#EC4899', isCorrect: false },
    ],
  },

  // 5. Grade 2 - Lesson 1 & 17: តម្លៃលេខតាមខ្ទង់ (Place Value) -> base-ten-blocks
  {
    id: 'g2-math-lesson-1-17',
    grade: 2,
    subject: 'math',
    type: 'base-ten-blocks',
    lessonKh: 'មេរៀនទី ១ & ១៧: តម្លៃលេខតាមខ្ទង់ (Place Value)',
    lessonEn: 'Lesson 1 & 17: Place Value (Hundreds, Tens, Ones)',
    questionKh: 'ចូររាប់ប្លុកគូបខាងក្រោម: ២ រយ + ៣ ដប់ + ៥ រាយ = ?',
    questionEn: 'Count the base-ten blocks: 2 Hundreds + 3 Tens + 5 Ones = ?',
    audioPromptKh: 'ចូររាប់ប្លុកគូបខាងក្រោម ពីររយ បីដប់ ប្រាំរាយ ស្មើនឹងប៉ុន្មាន?',
    hundreds: 2,
    tens: 3,
    ones: 5,
    targetValue: 235,
    options: [235, 253, 325, 532],
  },

  // 6. Grade 2 - Lesson 13: រូបិយវត្ថុ (Cambodian Riel Currency) -> riel-calculator
  {
    id: 'g2-math-lesson-13',
    grade: 2,
    subject: 'math',
    type: 'riel-calculator',
    lessonKh: 'មេរៀនទី ១៣: រូបិយវត្ថុ (Cambodian Riel Currency)',
    lessonEn: 'Lesson 13: Cambodian Riel Currency & Change Calculation',
    questionKh: 'សុខទិញនំ ៨០០៛ ឲ្យប្រាក់ ១០០០៛។ តើអ្នកលក់ត្រូវអាប់ប្រាក់ប៉ុន្មាន?',
    questionEn: 'Sok buys a snack for 800៛ and pays with a 1000៛ note. How much change is returned?',
    audioPromptKh: 'សុខទិញនំប្រាំបីរយរៀល ឲ្យប្រាក់មួយពាន់រៀល តើអ្នកលក់ត្រូវអាប់ប្រាក់ប៉ុន្មាន?',
    promptScenarioKh: 'ទិញនំតម្លៃ ៨០០៛ ដោយឲ្យក្រដាស ១០០០៛ (អាប់ប្រាក់: ១០០០៛ - ៨០០៛ = ?)',
    givenAmount: 1000,
    itemPrice: 800,
    changeRequired: 200,
    availableNotes: [100, 200, 500, 1000],
    options: [100, 200, 300, 500],
  },

  // =========================================================================
  // GRADE 1 & 2: KHMER LANGUAGE & PHONICS (ភាសាខ្មែរ)
  // =========================================================================

  // 7. Khmer G1: Phonics & Initial Consonants
  {
    id: 'g1-khmer-phonics-1',
    grade: 1,
    subject: 'khmer',
    type: 'mcq',
    lessonKh: 'មេរៀនទី ៥: ព្យញ្ជនៈ «ក ខ គ ឃ ង»',
    lessonEn: 'Lesson 5: Consonants Ka, Kha, Ko, Kho, Ngo',
    questionKh: 'តើពាក្យ «ក្អែក» ចាប់ផ្តើមដោយព្យញ្ជនៈអ្វី?',
    questionEn: 'Which consonant does the word «ក្អែក» (Crow) start with?',
    audioPromptKh: 'តើពាក្យក្អែក ចាប់ផ្តើមដោយព្យញ្ជនៈអ្វី?',
    options: [
      { id: 'k-1', textKh: 'ក (Ka)', icon: '🦅', isCorrect: true },
      { id: 'k-2', textKh: 'ខ (Kha)', icon: '✏️', isCorrect: false },
      { id: 'k-3', textKh: 'ច (Cha)', icon: '🥣', isCorrect: false },
    ],
  },

  // 8. Khmer G1/G2: Sentence Reordering
  {
    id: 'g1-khmer-sentence-1',
    grade: 1,
    subject: 'khmer',
    type: 'order-sequence',
    lessonKh: 'មេរៀនទី ១៤: ការតម្រៀបល្បះសាមញ្ញ',
    lessonEn: 'Lesson 14: Simple Khmer Sentence Structure',
    questionKh: 'ចូររៀបចំកាតពាក្យខាងក្រោមឱ្យក្លាយជាល្បះត្រឹមត្រូវ:',
    questionEn: 'Reorder the words to form a correct sentence: ខ្ញុំ + ទៅ + សាលារៀន',
    audioPromptKh: 'ចូររៀបចំកាតពាក្យខាងក្រោមឱ្យក្លាយជាល្បះត្រឹមត្រូវ',
    orderDirection: 'asc',
    directionLabelKh: 'តម្រៀបពាក្យបង្កើតល្បះ (Subject -> Verb -> Object)',
    items: [
      { id: 'w-1', labelKh: 'ខ្ញុំ', value: 1, subtext: 'ប្រធាន (I)' },
      { id: 'w-2', labelKh: 'ទៅ', value: 2, subtext: 'កិរិយាសព្ទ (Go)' },
      { id: 'w-3', labelKh: 'សាលារៀន', value: 3, subtext: 'កម្មបទ (School)' },
    ],
  },

  // 9. Khmer G2: Antonym Matching (ពាក្យផ្ទុយ)
  {
    id: 'g2-khmer-antonym-1',
    grade: 2,
    subject: 'khmer',
    type: 'match-pairs',
    lessonKh: 'មេរៀនទី ២៧: វាក្យសព្ទពាក្យផ្ទុយ (Antonyms)',
    lessonEn: 'Lesson 27: Khmer Antonym Vocabulary Pairs',
    questionKh: 'ចូរផ្គូផ្គងពាក្យដែលមានន័យ «ផ្ទុយគ្នា»:',
    questionEn: 'Match each Khmer word with its opposite meaning:',
    audioPromptKh: 'ចូរផ្គូផ្គងពាក្យដែលមានន័យផ្ទុយគ្នា',
    leftItems: [
      { id: 'left-1', textKh: 'ស្អាត (Clean)', icon: '✨' },
      { id: 'left-2', textKh: 'ឆ្លាត (Smart)', icon: '🧠' },
      { id: 'left-3', textKh: 'ធំ (Big)', icon: '🐘' },
    ],
    rightItems: [
      { id: 'right-1', textKh: 'កខ្វក់ (Dirty)', icon: '🫧' },
      { id: 'right-2', textKh: 'ល្ងង់ (Foolish)', icon: '❓' },
      { id: 'right-3', textKh: 'តូច (Small)', icon: '🐜' },
    ],
    pairs: [
      { leftId: 'left-1', rightId: 'right-1' },
      { leftId: 'left-2', rightId: 'right-2' },
      { leftId: 'left-3', rightId: 'right-3' },
    ],
  },

  // =========================================================================
  // GRADE 1 & 2: SCIENCE & DISCOVERY (វិទ្យាសាស្ត្រ)
  // =========================================================================

  // 10. Science G1: Living vs Non-Living
  {
    id: 'g1-science-living-1',
    grade: 1,
    subject: 'science',
    type: 'mcq',
    lessonKh: 'មេរៀនទី ១: វត្ថុមានជីវិត និងគ្មានជីវិត',
    lessonEn: 'Lesson 1: Living vs Non-Living Things',
    questionKh: 'តើមួយណាជា «វត្ថុមានជីវិត» (Living Thing)?',
    questionEn: 'Which of the following is a living thing?',
    audioPromptKh: 'តើមួយណាជាវត្ថុមានជីវិត?',
    options: [
      { id: 's-1', textKh: 'កូនរុក្ខជាតិ (Plant)', icon: '🌱', isCorrect: true },
      { id: 's-2', textKh: 'ដុំថ្ម (Rock)', icon: '🪨', isCorrect: false },
      { id: 's-3', textKh: 'កៅអីឈើ (Chair)', icon: '🪑', isCorrect: false },
      { id: 's-4', textKh: 'ឡាន (Car)', icon: '🚗', isCorrect: false },
    ],
  },

  // 11. Science G2: Parts of a Plant
  {
    id: 'g2-science-plants-1',
    grade: 2,
    subject: 'science',
    type: 'mcq',
    lessonKh: 'មេរៀនទី ៤: ផ្នែកផ្សេងៗនៃរុក្ខជាតិ (Plant Anatomy)',
    lessonEn: 'Lesson 4: Plant Anatomy & Functions',
    questionKh: 'តើផ្នែកណាមួយរបស់រុក្ខជាតិដែលនៅ «ក្នុងដី» សម្រាប់ស្រូបទឹក និងជី?',
    questionEn: 'Which part of the plant absorbs water from the soil?',
    audioPromptKh: 'តើផ្នែកណាមួយរបស់រុក្ខជាតិដែលនៅក្នុងដី សម្រាប់ស្រូបទឹក និងជី?',
    options: [
      { id: 'p-1', textKh: 'ឫស (Roots)', icon: '🌿', isCorrect: true },
      { id: 'p-2', textKh: 'ស្លឹក (Leaves)', icon: '🍃', isCorrect: false },
      { id: 'p-3', textKh: 'ផ្កា (Flowers)', icon: '🌸', isCorrect: false },
      { id: 'p-4', textKh: 'ផ្លែ (Fruits)', icon: '🍎', isCorrect: false },
    ],
  },

  // =========================================================================
  // GRADE 1 & 2: SOCIAL STUDIES & MORAL (សិក្សាសង្គម)
  // =========================================================================

  // 12. Social G1: Traffic Safety
  {
    id: 'g1-social-traffic-1',
    grade: 1,
    subject: 'social',
    type: 'mcq',
    lessonKh: 'មេរៀនទី ៣: សុវត្ថិភាពចរាចរណ៍ (Traffic Safety)',
    lessonEn: 'Lesson 3: Traffic Lights & Road Safety',
    questionKh: 'នៅពេលភ្លើងស្តុបពណ៌ «ក្រហម» តើយើងត្រូវធ្វើដូចម្តេច?',
    questionEn: 'What should we do when the traffic light turns RED?',
    audioPromptKh: 'នៅពេលភ្លើងស្តុបពណ៌ក្រហម តើយើងត្រូវធ្វើដូចម្តេច?',
    options: [
      { id: 't-1', textKh: 'ឈប់រង់ចាំ (Stop)', icon: '🛑', isCorrect: true },
      { id: 't-2', textKh: 'បន្តដំណើរទៅមុខ (Go)', icon: '🟢', isCorrect: false },
      { id: 't-3', textKh: 'រត់ឆ្លងផ្លូវលឿន (Run)', icon: '🏃', isCorrect: false },
    ],
  },

  // 13. Social G2: Cardinal Directions
  {
    id: 'g2-social-directions-1',
    grade: 2,
    subject: 'social',
    type: 'mcq',
    lessonKh: 'មេរៀនទី ៧: ទិសទាំងបួន (Four Cardinal Directions)',
    lessonEn: 'Lesson 7: Four Cardinal Directions',
    questionKh: 'ព្រះអាទិត្យរះនៅពេលព្រឹកពី «ទិស» ណា?',
    questionEn: 'Which direction does the sun rise in the morning?',
    audioPromptKh: 'ព្រះអាទិត្យរះនៅពេលព្រឹកពីទិសណា?',
    options: [
      { id: 'd-1', textKh: 'ទិសខាងកើត (East)', icon: '🌅', isCorrect: true },
      { id: 'd-2', textKh: 'ទិសខាងលិច (West)', icon: '🌇', isCorrect: false },
      { id: 'd-3', textKh: 'ទិសខាងជើង (North)', icon: '🧭', isCorrect: false },
      { id: 'd-4', textKh: 'ទិសខាងត្បូង (South)', icon: '🧭', isCorrect: false },
    ],
  },
];
