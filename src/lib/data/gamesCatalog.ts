// data/gameCatalog.ts
// Complete 42 Cambodian MoEYS Mini-Games Catalog (Grades 1-3)

import { GeneratedGameConfig, UniversalEngineType } from '@/types/edtech';

export function getGameEngineType(game: GeneratedGameConfig): UniversalEngineType {
  if (game.engineType) return game.engineType;
  const id = game.id;
  if (['game-1-plant-lab', 'game-2-bento-food', 'game-3-germ-buster', 'game-10-sun-shadow', 'game-11-magnetic-sort'].includes(id)) {
    return 'sandbox';
  }
  if (['game-16-market-cashier', 'game-19-balance-scale', 'game-20-clock-master', 'game-24-fraction-slicer', 'game-26-number-line', 'game-28-fair-share'].includes(id)) {
    return 'math_cra';
  }
  if (['game-29-vowel-catcher', 'game-30-consonant-subscript', 'game-31-picture-sentence', 'game-34-series-o-sorter', 'game-37-silent-marker', 'game-38-blended-clusters', 'game-41-final-consonants'].includes(id)) {
    return 'khmer_phonetics';
  }
  if (['game-4-butterfly-cycle', 'game-5-frog-cycle', 'game-6-water-cycle', 'game-21-number-train', 'game-27-pattern-detective', 'game-40-comic-story'].includes(id)) {
    return 'sequencer';
  }
  if (['game-7-animal-class', 'game-9-living-nonliving', 'game-13-eco-trash', 'game-18-shape-hunter', 'game-39-grammar-chest'].includes(id)) {
    return 'sorter';
  }
  if (game.subject === 'math') return 'math_cra';
  if (game.subject === 'khmer') return 'khmer_phonetics';
  return 'sandbox';
}

export const ALL_42_GAMES: GeneratedGameConfig[] = [
  // =========================================================================
  // A. វិទ្យាសាស្ត្រ (Science & Nature) — 15 Mini-Games (Games 1 to 15)
  // =========================================================================
  {
    id: 'game-1-plant-lab',
    titleKhmer: 'ពិសោធគ្រាប់សណ្តែក',
    titleEnglish: 'Plant Germination Lab',
    subject: 'science',
    gradeLevel: 1,
    instructionsKhmer: 'រុករកដំណាក់កាលលូតលាស់របស់គ្រាប់សណ្ដែក និងតម្រូវការទឹក ពន្លឺថ្ងៃ',
    instructionsEnglish: 'Balance water and sunlight to explore bean germination stages',
    template: 'hotspot',
    metadata: { targetCompetency: 'ការលូតលាស់របស់រុក្ខជាតិ (Plant Growth)', gameNumber: 1 },
    levels: [
      {
        levelId: 1,
        promptText: 'ចុចលើផ្នែកនីមួយៗនៃការពិសោធដើម្បីស្វែងយល់ពីការលូតលាស់របស់សណ្ដែកបណ្ដុះ៖',
        gameplayData: {
          hotspots: [
            { id: 'h1', xPercent: 25, yPercent: 70, labelKhmer: 'គ្រាប់សណ្ដែក', icon: '🫘', hintKhmer: 'គ្រាប់ពូជស្រូបទឹកដើម្បីបន្ទន់សំបក', funFactKhmer: 'ទឹកធ្វើឲ្យអង់ស៊ីមក្នុងគ្រាប់ពូជដំណើរការ' },
            { id: 'h2', xPercent: 50, yPercent: 78, labelKhmer: 'ឫសកែវដុះចុះក្រោម', icon: '🌱', hintKhmer: 'ឫសដុះមុនគេដើម្បីទប់ដើម និងបឺតទឹក', funFactKhmer: 'ឫសរុក្ខជាតិតែងតែដុះឆ្ពោះទៅកន្លែងមានសំណើម' },
            { id: 'h3', xPercent: 50, yPercent: 40, labelKhmer: 'ពន្លកបៃតង', icon: '🌿', hintKhmer: 'ពន្លកងើបឡើងលើស្វែងរកពន្លឺថ្ងៃ', funFactKhmer: 'ពន្លឺព្រះអាទិត្យជួយឲ្យស្លឹកបង្កើតអាហារ' },
            { id: 'h4', xPercent: 80, yPercent: 25, labelKhmer: 'ពន្លឺព្រះអាទិត្យ', icon: '☀️', hintKhmer: 'ត្រូវការ ៤ ទៅ ៨ ម៉ោងក្នុងមួយថ្ងៃ', funFactKhmer: 'រុក្ខជាតិប្រើពន្លឺសម្រាប់រស្មីសំយោគ' },
          ],
        },
      },
    ],
  },
  {
    id: 'game-2-bento-food',
    titleKhmer: 'ប្រអប់បាយសុខភាព',
    titleEnglish: '3 Food Groups Bento Box',
    subject: 'science',
    gradeLevel: 2,
    instructionsKhmer: 'បែងចែកមុខម្ហូបចូលក្នុងក្រុមអាហារទាំង ៣៖ ថាមពល លូតលាស់ និងការពារ',
    instructionsEnglish: 'Sort dishes into Energy, Growth, and Protection food groups',
    template: 'sorter',
    metadata: { targetCompetency: 'សារធាតុចិញ្ចឹមទាំង ៣ ក្រុម (3 Food Groups)', gameNumber: 2 },
    levels: [
      {
        levelId: 1,
        promptText: 'សូមបែងចែកអាហារខាងក្រោមទៅតាមប្រអប់ក្រុមអាហារដែលត្រឹមត្រូវ៖',
        gameplayData: {
          categories: [
            { id: 'energy', nameKhmer: 'ថាមពល (Energy)', nameEnglish: 'Energy', icon: '⚡' },
            { id: 'growth', nameKhmer: 'លូតលាស់ (Growth)', nameEnglish: 'Growth', icon: '💪' },
            { id: 'protect', nameKhmer: 'ការពារ (Protect)', nameEnglish: 'Protect', icon: '🛡️' },
          ],
          items: [
            { id: 'i1', labelKhmer: 'បាយស', imageOrIcon: '🍚', correctCategoryOrOrder: 'energy', feedbackKhmer: 'បាយជាក្រុមអាហារផ្ដល់ថាមពល!' },
            { id: 'i2', labelKhmer: 'ត្រីអាំង', imageOrIcon: '🐟', correctCategoryOrOrder: 'growth', feedbackKhmer: 'ត្រីជួយសាច់ដុំលូតលាស់រឹងមាំ!' },
            { id: 'i3', labelKhmer: 'ស្ពៃក្តោប', imageOrIcon: '🥬', correctCategoryOrOrder: 'protect', feedbackKhmer: 'បន្លែផ្ដល់វីតាមីនការពាររាងកាយ!' },
            { id: 'i4', labelKhmer: 'ពោតស្ងោរ', imageOrIcon: '🌽', correctCategoryOrOrder: 'energy', feedbackKhmer: 'ពោតជាម្សៅផ្ដល់កម្លាំង!' },
            { id: 'i5', labelKhmer: 'ស៊ុតមាន់', imageOrIcon: '🥚', correctCategoryOrOrder: 'growth', feedbackKhmer: 'ស៊ុតសម្បូរប្រូតេអ៊ីន!' },
            { id: 'i6', labelKhmer: 'ចេកទុំ', imageOrIcon: '🍌', correctCategoryOrOrder: 'protect', feedbackKhmer: 'ផ្លែចេកសម្បូរជីវជាតិការពាររាងកាយ!' },
          ],
        },
      },
    ],
  },
  {
    id: 'game-3-germ-buster',
    titleKhmer: 'កម្ចាត់មេរោគលើដៃ',
    titleEnglish: 'Germ Buster Hygiene',
    subject: 'science',
    gradeLevel: 1,
    instructionsKhmer: 'ជ្រើសរើសវិធីលាងដៃ និងសម្អាតមេរោគឲ្យបានលឿនមុនពេលញ៉ាំអាហារ',
    instructionsEnglish: 'Wash hands with soap and eliminate germs before mealtime',
    template: 'quiz_tap',
    metadata: { targetCompetency: 'អនាម័យផ្ទាល់ខ្លួន និងការលាងដៃ (Hand Hygiene)', gameNumber: 3 },
    levels: [
      {
        levelId: 1,
        promptText: 'តើយើងត្រូវប្រើអ្វីខ្លះដើម្បីលាងដៃកម្ចាត់មេរោគឲ្យស្អាតបំផុត?',
        timeLimitSeconds: 25,
        gameplayData: {
          quizOptions: [
            { id: 'o1', textKhmer: 'ទឹកស្អាត និងសាប៊ូ (Soap & Water)', isCorrect: true, emoji: '🧼' },
            { id: 'o2', textKhmer: 'ជូតលើខោអាវ', isCorrect: false, emoji: '👖' },
            { id: 'o3', textKhmer: 'លាងតែទឹកត្រជាក់មិនប្រើសាប៊ូ', isCorrect: false, emoji: '💧' },
            { id: 'o4', textKhmer: 'មិនបាច់លាងដៃទេ', isCorrect: false, emoji: '❌' },
          ],
        },
      },
    ],
  },
  {
    id: 'game-4-butterfly-cycle',
    titleKhmer: 'វដ្តជីវិតមេអំបៅ',
    titleEnglish: 'Butterfly Metamorphosis',
    subject: 'science',
    gradeLevel: 2,
    instructionsKhmer: 'រៀបចំដំណាក់កាលវដ្តជីវិតមេអំបៅពីពងរហូតដល់ពេញវ័យ',
    instructionsEnglish: 'Sequence egg -> caterpillar -> chrysalis -> butterfly',
    template: 'sequencer',
    metadata: { targetCompetency: 'វដ្តជីវិតសត្វល្អិត (Metamorphosis)', gameNumber: 4 },
    levels: [
      {
        levelId: 1,
        promptText: 'តម្រៀបដំណាក់កាលទាំង ៤ នៃវដ្តជីវិតមេអំបៅឲ្យត្រឹមត្រូវតាមលំដាប់៖',
        gameplayData: {
          items: [
            { id: 'bf1', labelKhmer: '១. ពងលើស្លឹកឈើ', imageOrIcon: '🥚', correctCategoryOrOrder: 1 },
            { id: 'bf2', labelKhmer: '២. ដង្កូវស៊ីស្លឹកឈើ', imageOrIcon: '🐛', correctCategoryOrOrder: 2 },
            { id: 'bf3', labelKhmer: '៣. ដឹកឌឿក្នុងសំបុក', imageOrIcon: '🥜', correctCategoryOrOrder: 3 },
            { id: 'bf4', labelKhmer: '៤. មេអំបៅពេញវ័យ', imageOrIcon: '🦋', correctCategoryOrOrder: 4 },
          ],
        },
      },
    ],
  },
  {
    id: 'game-5-frog-cycle',
    titleKhmer: 'វដ្តជីវិតកង្កែប',
    titleEnglish: 'Frog Life Cycle',
    subject: 'science',
    gradeLevel: 2,
    instructionsKhmer: 'តម្រៀបដំណាក់កាលលូតលាស់របស់កង្កែបពីពងក្នុងទឹកដល់កង្កែបពេញវ័យ',
    instructionsEnglish: 'Order spawn, tadpole, froglet, and adult frog',
    template: 'sequencer',
    metadata: { targetCompetency: 'សត្វរស់ក្នុងទឹក និងលើគោក (Amphibian Life Cycle)', gameNumber: 5 },
    levels: [
      {
        levelId: 1,
        promptText: 'រៀបចំលំដាប់ដំណើរការរីកធំធាត់របស់កង្កែប៖',
        gameplayData: {
          items: [
            { id: 'fg1', labelKhmer: '១. ពងកង្កែបក្នុងទឹក', imageOrIcon: '🫧', correctCategoryOrOrder: 1 },
            { id: 'fg2', labelKhmer: '២. កូនក្អុកមានកន្ទុយ', imageOrIcon: '🐟', correctCategoryOrOrder: 2 },
            { id: 'fg3', labelKhmer: '៣. កូនកង្កែបដុះជើង', imageOrIcon: '🦎', correctCategoryOrOrder: 3 },
            { id: 'fg4', labelKhmer: '៤. កង្កែបពេញវ័យលើគោក', imageOrIcon: '🐸', correctCategoryOrOrder: 4 },
          ],
        },
      },
    ],
  },
  {
    id: 'game-6-water-cycle',
    titleKhmer: 'វដ្តនៃទឹក',
    titleEnglish: 'Water Cycle Flow',
    subject: 'science',
    gradeLevel: 3,
    instructionsKhmer: 'រៀបចំលំហូរនៃវដ្តទឹក៖ រំហួត កំណកញើស ទឹកភ្លៀង និងការប្រមូលផ្តុំ',
    instructionsEnglish: 'Drag evaporation, condensation, precipitation, collection into order',
    template: 'sequencer',
    metadata: { targetCompetency: 'បាតុភូតធម្មជាតិ និងវដ្តទឹក (Hydrological Cycle)', gameNumber: 6 },
    levels: [
      {
        levelId: 1,
        promptText: 'តម្រៀបដំណាក់កាលនៃវដ្តទឹកក្នុងធម្មជាតិ៖',
        gameplayData: {
          items: [
            { id: 'wc1', labelKhmer: '១. ទឹកហួតឡើងលើ (រំហួត)', imageOrIcon: '♨️', correctCategoryOrOrder: 1 },
            { id: 'wc2', labelKhmer: '២. បង្កើតជាពពក (កំណក)', imageOrIcon: '☁️', correctCategoryOrOrder: 2 },
            { id: 'wc3', labelKhmer: '៣. ធ្លាក់ជាទឹកភ្លៀង', imageOrIcon: '🌧️', correctCategoryOrOrder: 3 },
            { id: 'wc4', labelKhmer: '៤. ហូរចូលទន្លេ សមុទ្រ', imageOrIcon: '🌊', correctCategoryOrOrder: 4 },
          ],
        },
      },
    ],
  },
  {
    id: 'game-7-animal-class',
    titleKhmer: 'សត្វស្លាប មច្ឆា និងថនិកសត្វ',
    titleEnglish: 'Animal Classification',
    subject: 'science',
    gradeLevel: 2,
    instructionsKhmer: 'បែងចែកប្រភេទសត្វទៅតាមក្រុមជីវសាស្ត្ររបស់ពួកវា',
    instructionsEnglish: 'Classify animals by birds, aquatic fish, and mammals',
    template: 'sorter',
    metadata: { targetCompetency: 'ចំណាត់ថ្នាក់សត្វ (Animal Classification)', gameNumber: 7 },
    levels: [
      {
        levelId: 1,
        promptText: 'ដាក់សត្វនីមួយៗចូលក្នុងក្រុមឲ្យបានត្រឹមត្រូវ៖',
        gameplayData: {
          categories: [
            { id: 'birds', nameKhmer: 'សត្វស្លាប (Birds)', nameEnglish: 'Birds', icon: '🦅' },
            { id: 'fish', nameKhmer: 'មច្ឆាជាតិ (Fish)', nameEnglish: 'Fish', icon: '🐠' },
            { id: 'mammals', nameKhmer: 'ថនិកសត្វ (Mammals)', nameEnglish: 'Mammals', icon: '🐘' },
          ],
          items: [
            { id: 'a1', labelKhmer: 'សត្វសេក', imageOrIcon: '🦜', correctCategoryOrOrder: 'birds', feedbackKhmer: 'សេកជាសត្វស្លាប!' },
            { id: 'a2', labelKhmer: 'ត្រីរ៉ស់', imageOrIcon: '🐟', correctCategoryOrOrder: 'fish', feedbackKhmer: 'ត្រីរស់ក្នុងទឹក!' },
            { id: 'a3', labelKhmer: 'ដំរីព្រៃ', imageOrIcon: '🐘', correctCategoryOrOrder: 'mammals', feedbackKhmer: 'ដំរីបំបៅកូនដោយទឹកដោះ!' },
            { id: 'a4', labelKhmer: 'ព្រាបស', imageOrIcon: '🕊️', correctCategoryOrOrder: 'birds', feedbackKhmer: 'ព្រាបមានស្លាបហើរ!' },
            { id: 'a5', labelKhmer: 'គោក្របី', imageOrIcon: '🐂', correctCategoryOrOrder: 'mammals', feedbackKhmer: 'គោជាថនិកសត្វ!' },
            { id: 'a6', labelKhmer: 'ត្រីបបែល', imageOrIcon: '🦈', correctCategoryOrOrder: 'fish', feedbackKhmer: 'ត្រីបបែលជាមច្ឆាជាតិ!' },
          ],
        },
      },
    ],
  },
  {
    id: 'game-8-five-senses',
    titleKhmer: 'វិញ្ញាណទាំង ៥',
    titleEnglish: 'Five Senses Explorer',
    subject: 'science',
    gradeLevel: 1,
    instructionsKhmer: 'រុករកសរីរាង្គវិញ្ញាណទាំង៥ និងតួនាទីក្នុងការដឹងក្លិន សំឡេង មើល ភ្លក្ស និងប៉ះ',
    instructionsEnglish: 'Match real-world items to eye, ear, nose, tongue, and hand',
    template: 'hotspot',
    metadata: { targetCompetency: 'សរីរាង្គវិញ្ញាណ (Five Senses)', gameNumber: 8 },
    levels: [
      {
        levelId: 1,
        promptText: 'ចុចលើវិញ្ញាណនីមួយៗលើរាងកាយកុមារដើម្បីរៀនពីមុខងាររបស់វា៖',
        gameplayData: {
          hotspots: [
            { id: 's-eye', xPercent: 50, yPercent: 28, labelKhmer: 'ចក្ខុវិញ្ញាណ (ភ្នែក)', icon: '👁️', hintKhmer: 'ភ្នែកសម្រាប់មើលឃើញពណ៌ និងរូបរាង', funFactKhmer: 'យើងមើលសៀវភៅ និងទេសភាពតាមរយៈភ្នែក' },
            { id: 's-ear', xPercent: 22, yPercent: 35, labelKhmer: 'សោតវិញ្ញាណ (ត្រចៀក)', icon: '👂', hintKhmer: 'ត្រចៀកសម្រាប់ស្ដាប់ឮសំឡេងជុំវិញខ្លួន', funFactKhmer: 'ត្រចៀកស្ដាប់ឮសំឡេងបក្សី និងភ្លេង' },
            { id: 's-nose', xPercent: 50, yPercent: 42, labelKhmer: 'ឃានវិញ្ញាណ (ច្រមុះ)', icon: '👃', hintKhmer: 'ច្រមុះសម្រាប់ដឹងក្លិនក្រអូប និងដកដង្ហើម', funFactKhmer: 'ច្រមុះដឹងក្លិនផ្កា និងម្ហូបឆ្ងាញ់' },
            { id: 's-tongue', xPercent: 50, yPercent: 55, labelKhmer: 'ជីវ្ហាវិញ្ញាណ (អណ្ដាត)', icon: '👅', hintKhmer: 'អណ្ដាតសម្រាប់ដឹងរសជាតិផ្អែម ប្រៃ ជូរ ចត់', funFactKhmer: 'អណ្ដាតមានពន្លករសជាតិរាប់ពាន់' },
            { id: 's-skin', xPercent: 78, yPercent: 70, labelKhmer: 'កាយវិញ្ញាណ (ដៃ/ស្បែក)', icon: '✋', hintKhmer: 'ស្បែកដៃសម្រាប់ប៉ះដឹងក្ដៅ ត្រជាក់ ទន់ រឹង', funFactKhmer: 'ស្បែកជាសរីរាង្គការពារធំជាងគេ' },
          ],
        },
      },
    ],
  },
  {
    id: 'game-9-living-nonliving',
    titleKhmer: 'របស់មានជីវិត និងគ្មានជីវិត',
    titleEnglish: 'Living vs. Non-Living Sort',
    subject: 'science',
    gradeLevel: 1,
    instructionsKhmer: 'បែងចែករវាងសត្វ/រុក្ខជាតិមានជីវិត និងវត្ថុអសកម្មគ្មានជីវិត',
    instructionsEnglish: 'Identify living organisms vs inanimate objects',
    template: 'sorter',
    metadata: { targetCompetency: 'លក្ខណៈនៃជីវិត (Living vs Non-Living)', gameNumber: 9 },
    levels: [
      {
        levelId: 1,
        promptText: 'បែងចែកវត្ថុខាងក្រោមចូលក្នុងប្រអប់ "មានជីវិត" ឬ "គ្មានជីវិត"៖',
        gameplayData: {
          categories: [
            { id: 'living', nameKhmer: 'មានជីវិត (Living)', nameEnglish: 'Living', icon: '🌱' },
            { id: 'nonliving', nameKhmer: 'គ្មានជីវិត (Non-Living)', nameEnglish: 'Non-Living', icon: '🪨' },
          ],
          items: [
            { id: 'l1', labelKhmer: 'កូនឆ្មា', imageOrIcon: '🐱', correctCategoryOrOrder: 'living', feedbackKhmer: 'ឆ្មាអាចដកដង្ហើម និងលូតលាស់!' },
            { id: 'l2', labelKhmer: 'ដើមចេក', imageOrIcon: '🌴', correctCategoryOrOrder: 'living', feedbackKhmer: 'រុក្ខជាតិជាភាវៈមានជីវិត!' },
            { id: 'nl1', labelKhmer: 'ដុំថ្ម', imageOrIcon: '🪨', correctCategoryOrOrder: 'nonliving', feedbackKhmer: 'ដុំថ្មមិនអាចលូតលាស់បានទេ!' },
            { id: 'l3', labelKhmer: 'មេអំបៅ', imageOrIcon: '🦋', correctCategoryOrOrder: 'living', feedbackKhmer: 'មេអំបៅត្រូវការអាហារ និងទឹក!' },
            { id: 'nl2', labelKhmer: 'កង់ជិះ', imageOrIcon: '🚲', correctCategoryOrOrder: 'nonliving', feedbackKhmer: 'កង់ជាសម្ភារៈមនុស្សបង្កើត!' },
            { id: 'nl3', labelKhmer: 'សៀវភៅ', imageOrIcon: '📚', correctCategoryOrOrder: 'nonliving', feedbackKhmer: 'សៀវភៅគ្មានជីវិតទេ!' },
          ],
        },
      },
    ],
  },
  {
    id: 'game-10-sun-shadow',
    titleKhmer: 'ព្រះអាទិត្យ និងស្រមោល',
    titleEnglish: 'Sun & Shadow Dial',
    subject: 'science',
    gradeLevel: 3,
    instructionsKhmer: 'រុករកទិសដៅព្រះអាទិត្យ និងការប្រែប្រួលប្រវែងស្រមោលពេលព្រឹក ថ្ងៃត្រង់ និងល្ងាច',
    instructionsEnglish: 'Move the sun across the sky to observe changes in shadow length',
    template: 'hotspot',
    metadata: { targetCompetency: 'ពន្លឺ និងស្រមោល (Sun & Shadows)', gameNumber: 10 },
    levels: [
      {
        levelId: 1,
        promptText: 'ចុចលើទីតាំងព្រះអាទិត្យដើម្បីស្វែងយល់ពីប្រវែងស្រមោលដើមឈើ៖',
        gameplayData: {
          hotspots: [
            { id: 'sun-morning', xPercent: 18, yPercent: 40, labelKhmer: 'ពេលព្រឹកព្រលឹម (Morning)', icon: '🌅', hintKhmer: 'ព្រះអាទិត្យនៅទាប ស្រមោលដើមឈើដុះវែងទៅទិសខាងលិច', funFactKhmer: 'ស្រមោលវែងនៅពេលព្រឹក និងល្ងាច' },
            { id: 'sun-noon', xPercent: 50, yPercent: 18, labelKhmer: 'ពេលថ្ងៃត្រង់ (Noon)', icon: '☀️', hintKhmer: 'ព្រះអាទិត្យនៅចំពីលើក្បាល ស្រមោលខ្លីជាងគេនៅក្រោមជើង', funFactKhmer: 'ពេលថ្ងៃត្រង់ស្រមោលខ្លីបំផុត' },
            { id: 'sun-afternoon', xPercent: 82, yPercent: 45, labelKhmer: 'ពេលរសៀល (Afternoon)', icon: '🌇', hintKhmer: 'ព្រះអាទិត្យរៀបលិច ស្រមោលដុះវែងទៅទិសខាងកើត', funFactKhmer: 'ស្រមោលតែងតែផ្ទុយពីទិសពន្លឺ' },
          ],
        },
      },
    ],
  },
  {
    id: 'game-11-magnetic-sort',
    titleKhmer: 'មេដែកស្រូបទាញ',
    titleEnglish: 'Magnetic or Not?',
    subject: 'science',
    gradeLevel: 3,
    instructionsKhmer: 'បែងចែកវត្ថុដែលមេដែកអាចស្រូបទាញបាន និងវត្ថុដែលមេដែកមិនស្រូប',
    instructionsEnglish: 'Drag everyday objects to test magnetic attraction',
    template: 'sorter',
    metadata: { targetCompetency: 'កម្លាំងមេដែក (Magnetism)', gameNumber: 11 },
    levels: [
      {
        levelId: 1,
        promptText: 'តើវត្ថុណាខ្លះដែលមេដែកអាចស្រូបទាញបាន?',
        gameplayData: {
          categories: [
            { id: 'magnetic', nameKhmer: 'មេដែកស្រូប (Magnetic)', nameEnglish: 'Magnetic', icon: '🧲' },
            { id: 'nonmagnetic', nameKhmer: 'មិនស្រូប (Non-Magnetic)', nameEnglish: 'Non-Magnetic', icon: '🚫' },
          ],
          items: [
            { id: 'm1', labelKhmer: 'ដែកគោល', imageOrIcon: '🔩', correctCategoryOrOrder: 'magnetic', feedbackKhmer: 'ដែកគោលធ្វើពីជាតិដែក មេដែកស្រូបខ្លាំង!' },
            { id: 'm2', labelKhmer: 'បន្ទាត់ជ័រ', imageOrIcon: '📏', correctCategoryOrOrder: 'nonmagnetic', feedbackKhmer: 'ជ័រមិនមែនជាលោហៈ មេដែកមិនស្រូបទេ!' },
            { id: 'm3', labelKhmer: 'ម្ជុលដេរ', imageOrIcon: '🪡', correctCategoryOrOrder: 'magnetic', feedbackKhmer: 'ម្ជុលដែកត្រូវបានមេដែកស្រូបជាប់!' },
            { id: 'm4', labelKhmer: 'បន្ទះឈើ', imageOrIcon: '🪵', correctCategoryOrOrder: 'nonmagnetic', feedbackKhmer: 'ឈើមិនត្រូវមេដែកស្រូបឡើយ!' },
            { id: 'm5', labelKhmer: 'កូនសោដែក', imageOrIcon: '🔑', correctCategoryOrOrder: 'magnetic', feedbackKhmer: 'កូនសោដែកត្រូវមេដែកស្រូប!' },
            { id: 'm6', labelKhmer: 'ស្លឹកឈើស្ងួត', imageOrIcon: '🍂', correctCategoryOrOrder: 'nonmagnetic', feedbackKhmer: 'ស្លឹកឈើគ្មានជាតិដែកទេ!' },
          ],
        },
      },
    ],
  },
  {
    id: 'game-12-plant-anatomy',
    titleKhmer: 'ផ្នែកផ្សេងៗនៃរុក្ខជាតិ',
    titleEnglish: 'Plant Anatomy Lab',
    subject: 'science',
    gradeLevel: 1,
    instructionsKhmer: 'ស្វែងយល់ពីផ្នែកសំខាន់ៗរបស់រុក្ខជាតិ៖ ឫស ដើម ស្លឹក ផ្កា និងផ្លែ',
    instructionsEnglish: 'Label roots, stem, leaves, flower, and fruit',
    template: 'hotspot',
    metadata: { targetCompetency: 'រូបផ្គុំរុក្ខជាតិ (Plant Anatomy)', gameNumber: 12 },
    levels: [
      {
        levelId: 1,
        promptText: 'ចុចលើផ្នែកនីមួយៗនៃដើមឈើដើម្បីស្វែងយល់ពីមុខងារសំខាន់ៗ៖',
        gameplayData: {
          hotspots: [
            { id: 'p-roots', xPercent: 50, yPercent: 88, labelKhmer: 'ឫសរុក្ខជាតិ', icon: '🥕', hintKhmer: 'ឫសស្រូបទឹក និងជីជាតិពីក្នុងដី', funFactKhmer: 'ឫសជួយទប់ដើមមិនឲ្យរលំពេលមានខ្យល់' },
            { id: 'p-stem', xPercent: 50, yPercent: 62, labelKhmer: 'ដើមរុក្ខជាតិ', icon: '🪵', hintKhmer: 'ដើមដឹកនាំទឹក និងជីវជាតិទៅកាន់ស្លឹក', funFactKhmer: 'ដើមជាឆ្អឹងខ្នងរបស់រុក្ខជាតិ' },
            { id: 'p-leaves', xPercent: 28, yPercent: 45, labelKhmer: 'ស្លឹកបៃតង', icon: '🍃', hintKhmer: 'ស្លឹកធ្វើរស្មីសំយោគដើម្បីផលិតអាហារ', funFactKhmer: 'ស្លឹកបញ្ចេញឧស្ម័នអុកស៊ីសែនឲ្យមនុស្សដកដង្ហើម' },
            { id: 'p-flower', xPercent: 72, yPercent: 32, labelKhmer: 'ផ្ការីកស្គុះស្គាយ', icon: '🌸', hintKhmer: 'ផ្កាទាក់ទាញសត្វល្អិត និងកកើតជាផ្លែ', funFactKhmer: 'ផ្កាមានក្លិនក្រអូប និងលម្អធម្មជាតិ' },
            { id: 'p-fruit', xPercent: 48, yPercent: 36, labelKhmer: 'ផ្លែទុំផ្អែម', icon: '🍎', hintKhmer: 'ផ្លែការពារគ្រាប់ពូជនៅខាងក្នុង', funFactKhmer: 'គ្រាប់ក្នុងផ្លែអាចយកទៅដាំជាដើមថ្មី' },
          ],
        },
      },
    ],
  },
  {
    id: 'game-13-eco-trash',
    titleKhmer: 'បែងចែកសំរាម',
    titleEnglish: 'Eco Trash Sorter',
    subject: 'science',
    gradeLevel: 2,
    instructionsKhmer: 'បែងចែកសំរាមសរីរាង្គ ប្លាស្ទិក និងកញ្ចក់ចូលក្នុងធុងសំរាមពណ៌ត្រឹមត្រូវ',
    instructionsEnglish: 'Sort organic, plastic, and glass trash into colored bins',
    template: 'sorter',
    metadata: { targetCompetency: 'បរិស្ថាន និងការគ្រប់គ្រងសំរាម (Waste Sorting)', gameNumber: 13 },
    levels: [
      {
        levelId: 1,
        promptText: 'សូមជួយការពារបរិស្ថានដោយបែងចែកសំរាមចូលធុងឲ្យត្រូវពណ៌៖',
        gameplayData: {
          categories: [
            { id: 'organic', nameKhmer: 'សរីរាង្គ (ធុងបៃតង)', nameEnglish: 'Organic', icon: '🟢' },
            { id: 'plastic', nameKhmer: 'ប្លាស្ទិក (ធុងលឿង)', nameEnglish: 'Plastic', icon: '🟡' },
            { id: 'glass', nameKhmer: 'កញ្ចក់/ដែក (ធុងខៀវ)', nameEnglish: 'Glass/Metal', icon: '🔵' },
          ],
          items: [
            { id: 't1', labelKhmer: 'សំបកចេក', imageOrIcon: '🍌', correctCategoryOrOrder: 'organic', feedbackKhmer: 'សំបកផ្លែឈើអាចធ្វើជាជីកំប៉ុសបាន!' },
            { id: 't2', labelKhmer: 'ដបទឹកសុទ្ធជ័រ', imageOrIcon: '🧴', correctCategoryOrOrder: 'plastic', feedbackKhmer: 'ដបជ័រត្រូវកែច្នៃឡើងវិញ!' },
            { id: 't3', labelKhmer: 'ដបកែវទឹកក្រូច', imageOrIcon: '🍾', correctCategoryOrOrder: 'glass', feedbackKhmer: 'កែវអាចកែច្នៃប្រើឡើងវិញបាន!' },
            { id: 't4', labelKhmer: 'ស្លឹកឈើជ្រុះ', imageOrIcon: '🍂', correctCategoryOrOrder: 'organic', feedbackKhmer: 'កាកសំណល់សរីរាង្គរលួយលឿន!' },
            { id: 't5', labelKhmer: 'ថង់ប្លាស្ទិក', imageOrIcon: '🛍️', correctCategoryOrOrder: 'plastic', feedbackKhmer: 'កាត់បន្ថយការប្រើប្រាស់ថង់ប្លាស្ទិក!' },
            { id: 't6', labelKhmer: 'កំប៉ុងទឹកក្រូចដែក', imageOrIcon: '🥫', correctCategoryOrOrder: 'glass', feedbackKhmer: 'កំប៉ុងដែកអាចរំលាយកែច្នៃបាន!' },
          ],
        },
      },
    ],
  },
  {
    id: 'game-14-teeth-brushing',
    titleKhmer: 'ធ្មេញស្អាតរឹងមាំ',
    titleEnglish: 'Healthy Teeth Brushing Challenge',
    subject: 'science',
    gradeLevel: 1,
    instructionsKhmer: 'ជ្រើសរើសទម្លាប់ល្អដើម្បីដុសសម្អាតធ្មេញកម្ចាត់បាក់តេរី និងមិនឲ្យពុកធ្មេញ',
    instructionsEnglish: 'Brush away plaque and practice oral hygiene',
    template: 'quiz_tap',
    metadata: { targetCompetency: 'អនាម័យមាត់ធ្មេញ (Oral Hygiene)', gameNumber: 14 },
    levels: [
      {
        levelId: 1,
        promptText: 'តើយើងគួរដុសធ្មេញយ៉ាងតិចប៉ុន្មានដងក្នុងមួយថ្ងៃ?',
        timeLimitSeconds: 20,
        gameplayData: {
          quizOptions: [
            { id: 'tb1', textKhmer: 'យ៉ាងតិច ២ ដង (ព្រឹក និងមុនចូលគេង)', isCorrect: true, emoji: '🪥' },
            { id: 'tb2', textKhmer: 'មួយសប្តាហ៍ម្ដង', isCorrect: false, emoji: '❌' },
            { id: 'tb3', textKhmer: 'មិនបាច់ដុសទេ ញ៉ាំស្ករគ្រាប់ជំនួស', isCorrect: false, emoji: '🍬' },
            { id: 'tb4', textKhmer: 'ពេលណាឈឺធ្មេញទើបដុស', isCorrect: false, emoji: '⚠️' },
          ],
        },
      },
    ],
  },
  {
    id: 'game-15-weather-seasons',
    titleKhmer: 'អាកាសធាតុ ៤ រដូវ',
    titleEnglish: 'Cambodian Weather & Seasons',
    subject: 'science',
    gradeLevel: 2,
    instructionsKhmer: 'រៀបចំសំលៀកបំពាក់ និងសម្ភារៈឲ្យសមស្របតាមរដូវវស្សា និងរដូវប្រាំង',
    instructionsEnglish: 'Dress avatar correctly for monsoon rain or dry heat',
    template: 'sorter',
    metadata: { targetCompetency: 'រដូវកាលនៅកម្ពុជា (Cambodian Seasons)', gameNumber: 15 },
    levels: [
      {
        levelId: 1,
        promptText: 'បែងចែកសម្ភារៈប្រើប្រាស់តាមរដូវវស្សា (ភ្លៀង) និងរដូវប្រាំង (ក្ដៅ)៖',
        gameplayData: {
          categories: [
            { id: 'rainy', nameKhmer: 'រដូវវស្សា (ភ្លៀងធ្លាក់)', nameEnglish: 'Monsoon', icon: '🌧️' },
            { id: 'dry', nameKhmer: 'រដូវប្រាំង (ថ្ងៃក្ដៅ)', nameEnglish: 'Dry Season', icon: '☀️' },
          ],
          items: [
            { id: 'w1', labelKhmer: 'ឆត្រការពារភ្លៀង', imageOrIcon: '☂️', correctCategoryOrOrder: 'rainy', feedbackKhmer: 'ឆត្រការពារកុំឲ្យទទឹកភ្លៀង!' },
            { id: 'w2', labelKhmer: 'វ៉ែនតាការពារថ្ងៃ', imageOrIcon: '🕶️', correctCategoryOrOrder: 'dry', feedbackKhmer: 'វ៉ែនតាការពារភ្នែកពីកម្ដៅថ្ងៃ!' },
            { id: 'w3', labelKhmer: 'អាវភ្លៀង', imageOrIcon: '🧥', correctCategoryOrOrder: 'rainy', feedbackKhmer: 'អាវភ្លៀងពាក់ពេលមានភ្លៀងធ្លាក់!' },
            { id: 'w4', labelKhmer: 'មួកស្លឹកត្នោត', imageOrIcon: '👒', correctCategoryOrOrder: 'dry', feedbackKhmer: 'មួកការពារកម្ដៅថ្ងៃចែងចាំង!' },
            { id: 'w5', labelKhmer: 'ស្បែកជើងកៅស៊ូកវែង', imageOrIcon: '👢', correctCategoryOrOrder: 'rainy', feedbackKhmer: 'ស្បែកជើងកវែងដើរក្នុងទឹកភ្លៀង!' },
            { id: 'w6', labelKhmer: 'កង្ហារដៃ', imageOrIcon: '🪭', correctCategoryOrOrder: 'dry', feedbackKhmer: 'កង្ហារដៃជួយបក់បំបាត់កម្ដៅ!' },
          ],
        },
      },
    ],
  },

  // =========================================================================
  // B. គណិតវិទ្យា (Math & Logic) — 14 Mini-Games (Games 16 to 29)
  // =========================================================================
  {
    id: 'game-16-math-balloon',
    titleKhmer: 'ពោងខ្យល់ប្រមាណវិធី',
    titleEnglish: 'Math Balloon Pop',
    subject: 'math',
    gradeLevel: 1,
    instructionsKhmer: 'ចុចបំបែកពោងខ្យល់ដែលមានចម្លើយត្រឹមត្រូវនៃផលបូក ៧ + ៥',
    instructionsEnglish: 'Pop the falling balloon with the correct calculation',
    template: 'quiz_tap',
    metadata: { targetCompetency: 'វិធីបូកត្រឹម ២០ (Addition <= 20)', gameNumber: 16 },
    levels: [
      {
        levelId: 1,
        promptText: 'តើ ៧ + ៥ ស្មើនឹងប៉ុន្មាន? (7 + 5 = ?)',
        timeLimitSeconds: 20,
        gameplayData: {
          quizOptions: [
            { id: 'b1', textKhmer: '១២ (12)', isCorrect: true, emoji: '🎈' },
            { id: 'b2', textKhmer: '១១ (11)', isCorrect: false, emoji: '🎈' },
            { id: 'b3', textKhmer: '១៤ (14)', isCorrect: false, emoji: '🎈' },
            { id: 'b4', textKhmer: '១០ (10)', isCorrect: false, emoji: '🎈' },
          ],
        },
      },
    ],
  },
  {
    id: 'game-17-market-cashier',
    titleKhmer: 'ផ្សារផ្លែឈើ និងប្រាក់រៀល',
    titleEnglish: 'Cambodian Market Cashier',
    subject: 'math',
    gradeLevel: 2,
    instructionsKhmer: 'រុករកទំនិញ និងទូទាត់ប្រាក់រៀលខ្មែរ ៥០០៛ ១,០០០៛ និង ៥,០០០៛',
    instructionsEnglish: 'Pay exact amounts using Cambodian Riel notes',
    template: 'hotspot',
    metadata: { targetCompetency: 'រូបិយវត្ថុជាតិ (Cambodian Riel Currency)', gameNumber: 17 },
    levels: [
      {
        levelId: 1,
        promptText: 'ចុចលើផ្លែឈើដើម្បីពិនិត្យតម្លៃ និងរៀនរាប់ក្រដាសប្រាក់រៀលខ្មែរ៖',
        gameplayData: {
          hotspots: [
            { id: 'f-mango', xPercent: 25, yPercent: 40, labelKhmer: 'ផ្លែស្វាយកែវរមៀត', icon: '🥭', hintKhmer: 'តម្លៃ ១,០០០ រៀល ក្នុងមួយផ្លែ', funFactKhmer: 'ស្មើនឹងក្រដាសប្រាក់ ១,០០០៛ មួយសន្លឹក' },
            { id: 'f-coconut', xPercent: 55, yPercent: 45, labelKhmer: 'ដូងក្រអូបខ្មែរ', icon: '🥥', hintKhmer: 'តម្លៃ ២,៥០០ រៀល ក្នុងមួយផ្លែ', funFactKhmer: 'ប្រើក្រដាស ២,០០០៛ មួយ និង ៥០០៛ មួយ' },
            { id: 'f-banana', xPercent: 80, yPercent: 42, labelKhmer: 'ចេកណាំវ៉ាមួយស្និត', icon: '🍌', hintKhmer: 'តម្លៃ ៣,០០០ រៀល ក្នុងមួយស្និត', funFactKhmer: 'ប្រើក្រដាស ១,០០០៛ ចំនួន ៣ សន្លឹក' },
            { id: 'f-durian', xPercent: 50, yPercent: 75, labelKhmer: 'ធុរេនកំពត', icon: '🍈', hintKhmer: 'តម្លៃ ១៥,០០០ រៀល ក្នុងមួយគីឡូ', funFactKhmer: 'ប្រើក្រដាស ១០,០០០៛ មួយ និង ៥,០០០៛ មួយ' },
          ],
        },
      },
    ],
  },
  {
    id: 'game-18-khmer-counter',
    titleKhmer: 'រាប់ផ្លែឈើខ្មែរ',
    titleEnglish: 'Khmer Number Counter',
    subject: 'math',
    gradeLevel: 1,
    instructionsKhmer: 'ផ្គូផ្គងលេខខ្មែរ (០-៩) ជាមួយលេខសកល (0-9) និងចំនួនផ្លែឈើ',
    instructionsEnglish: 'Match Khmer numerals (០-៩) to Arabic numerals',
    template: 'matching_cards',
    metadata: { targetCompetency: 'លេខខ្មែរ ០-៩ (Khmer Numerals)', gameNumber: 18 },
    levels: [
      {
        levelId: 1,
        promptText: 'ផ្គូផ្គងលេខខ្មែរ និងលេខសកលឲ្យត្រូវគ្នា៖',
        gameplayData: {
          pairs: [
            { id: 'k1', khmer: 'លេខ ៣', matchId: 'num-3', image: '3' },
            { id: 'k2', khmer: 'លេខ ៥', matchId: 'num-5', image: '5' },
            { id: 'k3', khmer: 'លេខ ៧', matchId: 'num-7', image: '7' },
            { id: 'k4', khmer: 'លេខ ៩', matchId: 'num-9', image: '9' },
          ],
        },
      },
    ],
  },
  {
    id: 'game-19-shape-hunter',
    titleKhmer: 'ប្រមាញ់រូបធរណីមាត្រ',
    titleEnglish: 'Shape Hunter',
    subject: 'math',
    gradeLevel: 1,
    instructionsKhmer: 'ស្វែងរករូបរង្វង់ ត្រីកោណ ចតុកោណកែង និងការ៉េក្នុងបន្ទប់រៀន',
    instructionsEnglish: 'Spot circles, triangles, rectangles, and cubes',
    template: 'hotspot',
    metadata: { targetCompetency: 'ធរណីមាត្រ ២D (2D Geometry Shapes)', gameNumber: 19 },
    levels: [
      {
        levelId: 1,
        promptText: 'ស្វែងរករូបធរណីមាត្រដែលបង្កប់នៅក្នុងបន្ទប់រៀន៖',
        gameplayData: {
          hotspots: [
            { id: 'sh-clock', xPercent: 50, yPercent: 25, labelKhmer: 'នាឡិការាងមូល (រង្វង់)', icon: '⏰', hintKhmer: 'រង្វង់គ្មានជ្រុង និងគ្មានកំពូលទេ', funFactKhmer: 'រង្វង់មានរាងមូលទ្រវែងស្មើគ្នាគ្រប់ជ្រុង' },
            { id: 'sh-board', xPercent: 50, yPercent: 50, labelKhmer: 'ក្តារខៀន (ចតុកោណកែង)', icon: '📋', hintKhmer: 'មានជ្រុង ៤ និងជ្រុងឈមស្របគ្នា', funFactKhmer: 'ក្តារខៀនមានជ្រុងវែង ២ និងជ្រុងខ្លី ២' },
            { id: 'sh-ruler', xPercent: 20, yPercent: 65, labelKhmer: 'បន្ទាត់ត្រីកោណ', icon: '📐', hintKhmer: 'មានជ្រុង ៣ និងកំពូល ៣', funFactKhmer: 'ត្រីកោណជាទម្រង់រឹងមាំបំផុតក្នុងស្ថាបត្យកម្ម' },
            { id: 'sh-window', xPercent: 82, yPercent: 40, labelKhmer: 'បង្អួចរាងការ៉េ', icon: '🪟', hintKhmer: 'មានជ្រុង ៤ ស្មើគ្នាទាំងអស់', funFactKhmer: 'ជ្រុងទាំង ៤ នៃការ៉េមានប្រវែងស្មើគ្នា' },
          ],
        },
      },
    ],
  },
  {
    id: 'game-20-balance-scale',
    titleKhmer: 'ជញ្ជីងថ្លឹងទម្ងន់',
    titleEnglish: 'Balance Scale Equality',
    subject: 'math',
    gradeLevel: 2,
    instructionsKhmer: 'រកចំនួនដែលបាត់ដើម្បីឲ្យជញ្ជីងសងខាងមានតុល្យភាពស្មើគ្នា',
    instructionsEnglish: 'Balance a 2-pan balance scale to solve algebraic equations',
    template: 'quiz_tap',
    metadata: { targetCompetency: 'សមភាពនៃចំនួន (Equality & Balancing)', gameNumber: 20 },
    levels: [
      {
        levelId: 1,
        promptText: 'ជញ្ជីងខាងឆ្វេងមាន ៨ ផ្លែ។ ខាងស្តាំមាន ៥ + ? ដើម្បីឲ្យស្មើ ៨?',
        timeLimitSeconds: 20,
        gameplayData: {
          quizOptions: [
            { id: 'bs1', textKhmer: '៣ (3)', isCorrect: true, emoji: '⚖️' },
            { id: 'bs2', textKhmer: '២ (2)', isCorrect: false, emoji: '⚖️' },
            { id: 'bs3', textKhmer: '៤ (4)', isCorrect: false, emoji: '⚖️' },
            { id: 'bs4', textKhmer: '៥ (5)', isCorrect: false, emoji: '⚖️' },
          ],
        },
      },
    ],
  },
  {
    id: 'game-21-clock-master',
    titleKhmer: 'នាឡិកាឆ្លាត',
    titleEnglish: 'Clock & Time Master',
    subject: 'math',
    gradeLevel: 2,
    instructionsKhmer: 'ផ្គូផ្គងម៉ោងនាឡិកាជាមួយកាលវិភាគប្រចាំថ្ងៃរបស់សិស្សានុសិស្ស',
    instructionsEnglish: 'Match analog clock times to daily school routines',
    template: 'matching_cards',
    metadata: { targetCompetency: 'ការអានម៉ោង និងពេលវេលា (Time & Clocks)', gameNumber: 21 },
    levels: [
      {
        levelId: 1,
        promptText: 'ផ្គូផ្គងពេលវេលា និងសកម្មភាពរៀនសូត្រ៖',
        gameplayData: {
          pairs: [
            { id: 't1', khmer: 'ម៉ោង ៧:០០ ព្រឹក', matchId: 'sch-start', image: '🔔 ចូលរៀន' },
            { id: 't2', khmer: 'ម៉ោង ១១:០០ ថ្ងៃត្រង់', matchId: 'sch-lunch', image: '🍱 អាហារថ្ងៃត្រង់' },
            { id: 't3', khmer: 'ម៉ោង ៥:០០ ល្ងាច', matchId: 'sch-home', image: '🏡 ត្រឡប់ទៅផ្ទះ' },
            { id: 't4', khmer: 'ម៉ោង ៨:០០ យប់', matchId: 'sch-sleep', image: '🌙 ចូលគេង' },
          ],
        },
      },
    ],
  },
  {
    id: 'game-22-number-train',
    titleKhmer: 'រថភ្លើងលេខរៀង',
    titleEnglish: 'Number Train Ordering',
    subject: 'math',
    gradeLevel: 1,
    instructionsKhmer: 'រៀបចំទូរថភ្លើងតាមលំដាប់កើនឡើងពីតូចទៅធំ',
    instructionsEnglish: 'Order ascending skip-counting carriages',
    template: 'sequencer',
    metadata: { targetCompetency: 'លំដាប់ចំនួនកើន (Ascending Numbers)', gameNumber: 22 },
    levels: [
      {
        levelId: 1,
        promptText: 'តម្រៀបទូរថភ្លើងតាមលំដាប់កើន ពីតូចទៅធំ៖',
        gameplayData: {
          items: [
            { id: 'nt1', labelKhmer: 'ទូទី ១៖ លេខ ៥', imageOrIcon: '🚃', correctCategoryOrOrder: 1 },
            { id: 'nt2', labelKhmer: 'ទូទី ២៖ លេខ ១០', imageOrIcon: '🚃', correctCategoryOrOrder: 2 },
            { id: 'nt3', labelKhmer: 'ទូទី ៣៖ លេខ ១៥', imageOrIcon: '🚃', correctCategoryOrOrder: 3 },
            { id: 'nt4', labelKhmer: 'ទូទី ៤៖ លេខ ២០', imageOrIcon: '🚃', correctCategoryOrOrder: 4 },
          ],
        },
      },
    ],
  },
  {
    id: 'game-23-ruler-measure',
    titleKhmer: 'វាស់ប្រវែងបន្ទាត់',
    titleEnglish: 'Ruler Measurement',
    subject: 'math',
    gradeLevel: 2,
    instructionsKhmer: 'អានប្រវែងខ្មៅដៃលើបន្ទាត់ជាសង់ទីម៉ែត្រ (cm)',
    instructionsEnglish: 'Measure pencils and stationery using a cm ruler',
    template: 'quiz_tap',
    metadata: { targetCompetency: 'រង្វាស់ប្រវែងសង់ទីម៉ែត្រ (Measurement cm)', gameNumber: 23 },
    levels: [
      {
        levelId: 1,
        promptText: 'ខ្មៅដៃចាប់ផ្ដើមពីចំណុច 0cm ដល់ចំណុច 8cm។ តើខ្មៅដៃវែងប៉ុន្មាន?',
        timeLimitSeconds: 20,
        gameplayData: {
          quizOptions: [
            { id: 'r1', textKhmer: '៨ សង់ទីម៉ែត្រ (8 cm)', isCorrect: true, emoji: '✏️' },
            { id: 'r2', textKhmer: '៦ សង់ទីម៉ែត្រ (6 cm)', isCorrect: false, emoji: '✏️' },
            { id: 'r3', textKhmer: '១០ សង់ទីម៉ែត្រ (10 cm)', isCorrect: false, emoji: '✏️' },
            { id: 'r4', textKhmer: '៥ សង់ទីម៉ែត្រ (5 cm)', isCorrect: false, emoji: '✏️' },
          ],
        },
      },
    ],
  },
  {
    id: 'game-24-alligator-inequalities',
    titleKhmer: 'ប្រៀបធៀបធំជាង តូចជាង',
    titleEnglish: 'Alligator Inequalities > < =',
    subject: 'math',
    gradeLevel: 1,
    instructionsKhmer: 'ជ្រើសរើសសញ្ញា (> < =) ឲ្យក្រពើត្របាក់យកចំនួនដែលធំជាង',
    instructionsEnglish: 'Direct the hungry crocodile mouth toward the larger number',
    template: 'quiz_tap',
    metadata: { targetCompetency: 'ការប្រៀបធៀបចំនួន (Inequalities > < =)', gameNumber: 24 },
    levels: [
      {
        levelId: 1,
        promptText: 'ប្រៀបធៀបចំនួន៖ ១៥ [...] ៩ (15 vs 9)?',
        timeLimitSeconds: 20,
        gameplayData: {
          quizOptions: [
            { id: 'gt', textKhmer: '១៥ > ៩ (ធំជាង)', isCorrect: true, emoji: '🐊' },
            { id: 'lt', textKhmer: '១៥ < ៩ (តូចជាង)', isCorrect: false, emoji: '🐊' },
            { id: 'eq', textKhmer: '១៥ = ៩ (ស្មើគ្នា)', isCorrect: false, emoji: '🐊' },
          ],
        },
      },
    ],
  },
  {
    id: 'game-25-fraction-pizza',
    titleKhmer: 'ប្រភាគភីហ្សា និងនំអន្សម',
    titleEnglish: 'Fraction Pizza & Num Ansom',
    subject: 'math',
    gradeLevel: 3,
    instructionsKhmer: 'ផ្គូផ្គងរូបភាពចំណិតនំជាមួយប្រភាគ ១/២, ១/៣ និង ១/៤',
    instructionsEnglish: 'Slice food into 1/2, 1/3, and 1/4 portions',
    template: 'matching_cards',
    metadata: { targetCompetency: 'ប្រភាគបឋម (Fractions 1/2, 1/3, 1/4)', gameNumber: 25 },
    levels: [
      {
        levelId: 1,
        promptText: 'ផ្គូផ្គងប្រភាគ និងចំណិតនំ៖',
        gameplayData: {
          pairs: [
            { id: 'fr1', khmer: 'កន្លះចំណិត (១/២)', matchId: 'half', image: '🍕 ១/២' },
            { id: 'fr2', khmer: 'មួយភាគបី (១/៣)', matchId: 'third', image: '🥧 ១/៣' },
            { id: 'fr3', khmer: 'មួយភាគបួន (១/៤)', matchId: 'quarter', image: '🥮 ១/៤' },
            { id: 'fr4', khmer: 'នំពេញលេញ (១)', matchId: 'whole', image: '🎂 ១ ពេញ' },
          ],
        },
      },
    ],
  },
  {
    id: 'game-26-bar-chart',
    titleKhmer: 'តារាងទិន្នន័យសត្វចិញ្ចឹម',
    titleEnglish: 'Bar Chart Builder',
    subject: 'math',
    gradeLevel: 3,
    instructionsKhmer: 'អានក្រាហ្វសសរដើម្បីឆ្លើយសំណួរអំពីទិន្នន័យសត្វចិញ្ចឹមក្នុងថ្នាក់',
    instructionsEnglish: 'Interpret bar graphs based on surveyed pets',
    template: 'quiz_tap',
    metadata: { targetCompetency: 'ក្រាហ្វ និងស្ថិតិបឋម (Bar Graphs)', gameNumber: 26 },
    levels: [
      {
        levelId: 1,
        promptText: 'ក្នុងថ្នាក់មានសិស្សចិញ្ចឹមឆ្មា ៦នាក់ ឆ្កែ ៨នាក់ និងត្រី ៣នាក់។ តើសត្វណាមានច្រើនជាងគេ?',
        timeLimitSeconds: 20,
        gameplayData: {
          quizOptions: [
            { id: 'bc-dog', textKhmer: 'សត្វឆ្កែ (៨ នាក់)', isCorrect: true, emoji: '🐶' },
            { id: 'bc-cat', textKhmer: 'សត្វឆ្មា (៦ នាក់)', isCorrect: false, emoji: '🐱' },
            { id: 'bc-fish', textKhmer: 'សត្វត្រី (៣ នាក់)', isCorrect: false, emoji: '🐠' },
          ],
        },
      },
    ],
  },
  {
    id: 'game-27-number-line',
    titleKhmer: 'ល្បែងបូកដកលើបន្ទាត់ចំនួន',
    titleEnglish: 'Number Line Hopper',
    subject: 'math',
    gradeLevel: 1,
    instructionsKhmer: 'ឲ្យកូនកង្កែបលោតលើបន្ទាត់ចំនួនដើម្បីរកលទ្ធផល ៨ + ៤',
    instructionsEnglish: 'Hop a frog on a 0-20 number line',
    template: 'quiz_tap',
    metadata: { targetCompetency: 'បន្ទាត់ចំនួន (Number Line Operations)', gameNumber: 27 },
    levels: [
      {
        levelId: 1,
        promptText: 'កង្កែបនៅលេខ ៨ លោតទៅមុខ ៤ ជំហានទៀត។ តើទៅដល់លេខប៉ុន្មាន?',
        timeLimitSeconds: 20,
        gameplayData: {
          quizOptions: [
            { id: 'nl-12', textKhmer: 'លេខ ១២ (8 + 4 = 12)', isCorrect: true, emoji: '🐸' },
            { id: 'nl-11', textKhmer: 'លេខ ១១', isCorrect: false, emoji: '🐸' },
            { id: 'nl-13', textKhmer: 'លេខ ១៣', isCorrect: false, emoji: '🐸' },
            { id: 'nl-10', textKhmer: 'លេខ ១០', isCorrect: false, emoji: '🐸' },
          ],
        },
      },
    ],
  },
  {
    id: 'game-28-pattern-detective',
    titleKhmer: 'ទាយលំនាំរូបភាព',
    titleEnglish: 'Pattern Detective',
    subject: 'math',
    gradeLevel: 1,
    instructionsKhmer: 'បំពេញរូបរាងបន្ទាប់ក្នុងលំនាំស្ទួន 🔴 🔵 🔴 🔵 [...]',
    instructionsEnglish: 'Complete repeating patterns of geometric shapes',
    template: 'sequencer',
    metadata: { targetCompetency: 'លំនាំរូបធរណីមាត្រ (Repeating Patterns)', gameNumber: 28 },
    levels: [
      {
        levelId: 1,
        promptText: 'តម្រៀបលំនាំឆ្លាស់ពណ៌ឲ្យបានត្រឹមត្រូវ៖',
        gameplayData: {
          items: [
            { id: 'pat1', labelKhmer: '១. រង្វង់ក្រហម', imageOrIcon: '🔴', correctCategoryOrOrder: 1 },
            { id: 'pat2', labelKhmer: '២. រង្វង់ខៀវ', imageOrIcon: '🔵', correctCategoryOrOrder: 2 },
            { id: 'pat3', labelKhmer: '៣. រង្វង់ក្រហម', imageOrIcon: '🔴', correctCategoryOrOrder: 3 },
            { id: 'pat4', labelKhmer: '៤. រង្វង់ខៀវ', imageOrIcon: '🔵', correctCategoryOrOrder: 4 },
          ],
        },
      },
    ],
  },
  {
    id: 'game-29-fair-share',
    titleKhmer: 'ចែកស្ករគ្រាប់ស្មើគ្នា',
    titleEnglish: 'Fair Share Division',
    subject: 'math',
    gradeLevel: 3,
    instructionsKhmer: 'ចែកស្ករគ្រាប់ ៦ គ្រាប់ស្មើគ្នាទៅឲ្យកុមារ ២ នាក់',
    instructionsEnglish: 'Distribute candies evenly across bowls to visualize division',
    template: 'sorter',
    metadata: { targetCompetency: 'វិធីចែកស្មើគ្នា (Fair Sharing & Division)', gameNumber: 29 },
    levels: [
      {
        levelId: 1,
        promptText: 'ចែកស្ករគ្រាប់ឲ្យកុមារទាំងពីរស្មើៗគ្នា (ម្នាក់ ៣ គ្រាប់)៖',
        gameplayData: {
          categories: [
            { id: 'kid-a', nameKhmer: 'កុមារ សុខ (ចាន ទី១)', nameEnglish: 'Child A', icon: '👦' },
            { id: 'kid-b', nameKhmer: 'កុមារី ធីតា (ចាន ទី២)', nameEnglish: 'Child B', icon: '👧' },
          ],
          items: [
            { id: 'c1', labelKhmer: 'ស្ករគ្រាប់ ១', imageOrIcon: '🍬', correctCategoryOrOrder: 'kid-a' },
            { id: 'c2', labelKhmer: 'ស្ករគ្រាប់ ២', imageOrIcon: '🍬', correctCategoryOrOrder: 'kid-a' },
            { id: 'c3', labelKhmer: 'ស្ករគ្រាប់ ៣', imageOrIcon: '🍬', correctCategoryOrOrder: 'kid-a' },
            { id: 'c4', labelKhmer: 'ស្ករគ្រាប់ ៤', imageOrIcon: '🍬', correctCategoryOrOrder: 'kid-b' },
            { id: 'c5', labelKhmer: 'ស្ករគ្រាប់ ៥', imageOrIcon: '🍬', correctCategoryOrOrder: 'kid-b' },
            { id: 'c6', labelKhmer: 'ស្ករគ្រាប់ ៦', imageOrIcon: '🍬', correctCategoryOrOrder: 'kid-b' },
          ],
        },
      },
    ],
  },

  // =========================================================================
  // C. ភាសាខ្មែរ (Khmer Language & Literacy) — 13 Mini-Games (Games 30 to 42)
  // =========================================================================
  {
    id: 'game-30-vowel-catcher',
    titleKhmer: 'ប្រកបស្រៈនិស្ស័យ',
    titleEnglish: 'Khmer Vowel Catcher',
    subject: 'khmer',
    gradeLevel: 1,
    instructionsKhmer: 'ជ្រើសរើសស្រៈ ា ដើម្បីផ្គុំជាមួយព្យញ្ជនៈ ថ ឲ្យចេញជាពាក្យ «ថា»',
    instructionsEnglish: 'Catch correct vowel diacritics to blend words',
    template: 'sentence_builder',
    metadata: { targetCompetency: 'ស្រៈនិស្ស័យខ្មែរ (Khmer Dependent Vowels)', gameNumber: 30 },
    levels: [
      {
        levelId: 1,
        promptText: 'ផ្គុំព្យញ្ជនៈ និងស្រៈដើម្បីបង្កើតពាក្យ «តា»៖',
        gameplayData: {
          tiles: [
            { id: 'vt1', textKhmer: 'ត', order: 1 },
            { id: 'vt2', textKhmer: 'ា', order: 2 },
          ],
        },
      },
    ],
  },
  {
    id: 'game-31-consonant-subscript',
    titleKhmer: 'ផ្គុំជើងព្យញ្ជនៈ',
    titleEnglish: 'Consonant Subscript Puzzle',
    subject: 'khmer',
    gradeLevel: 2,
    instructionsKhmer: 'ផ្គុំព្យញ្ជនៈដើមជាមួយជើងអក្សរដើម្បីបង្កើតពាក្យ «ក្ងោក»',
    instructionsEnglish: 'Connect consonants with their subscript foot',
    template: 'sentence_builder',
    metadata: { targetCompetency: 'ជើងព្យញ្ជនៈខ្មែរ (Khmer Subscript Consonants)', gameNumber: 31 },
    levels: [
      {
        levelId: 1,
        promptText: 'ផ្គុំពាក្យ «ក្ងោក» ដោយប្រើជើង ្ង ឲ្យបានត្រឹមត្រូវ៖',
        gameplayData: {
          tiles: [
            { id: 'cs1', textKhmer: 'ក', order: 1 },
            { id: 'cs2', textKhmer: '្ង', order: 2 },
            { id: 'cs3', textKhmer: 'ោ', order: 3 },
            { id: 'cs4', textKhmer: 'ក', order: 4 },
          ],
        },
      },
    ],
  },
  {
    id: 'game-32-picture-sentence',
    titleKhmer: 'តម្រៀបល្បះរូបភាព',
    titleEnglish: 'Picture Sentence Puzzle',
    subject: 'khmer',
    gradeLevel: 1,
    instructionsKhmer: 'តម្រៀបប្លុកពាក្យខ្មែរតាមលំដាប់ ប្រធាន + កិរិយា + កម្មបទ',
    instructionsEnglish: 'Reorder scrambled Khmer word tiles into SVO sentences',
    template: 'sentence_builder',
    metadata: { targetCompetency: 'រចនាសម្ព័ន្ធល្បះ ស.ក.ក (Subject-Verb-Object Structure)', gameNumber: 32 },
    levels: [
      {
        levelId: 1,
        promptText: 'តម្រៀបល្បះពិពណ៌នារូបភាព៖ «សុខ អាន សៀវភៅ»',
        gameplayData: {
          tiles: [
            { id: 'ps1', textKhmer: 'សុខ', order: 1 },
            { id: 'ps2', textKhmer: 'អាន', order: 2 },
            { id: 'ps3', textKhmer: 'សៀវភៅ', order: 3 },
          ],
        },
      },
    ],
  },
  {
    id: 'game-33-cloze-runner',
    titleKhmer: 'បំពេញពាក្យក្នុងចន្លោះ',
    titleEnglish: 'Cloze Passage Runner',
    subject: 'khmer',
    gradeLevel: 2,
    instructionsKhmer: 'ជ្រើសរើសពាក្យត្រឹមត្រូវដើម្បីបំពេញរឿងនិទាន «សុភាទន្សាយ»',
    instructionsEnglish: 'Select missing words in Khmer folktales',
    template: 'quiz_tap',
    metadata: { targetCompetency: 'ការយល់ដឹងអត្ថបទអាន (Cloze Reading)', gameNumber: 33 },
    levels: [
      {
        levelId: 1,
        promptText: 'សុភាទន្សាយជាសត្វមាន[...]វាងវៃ និងពូកែជួយដោះស្រាយបញ្ហា។',
        timeLimitSeconds: 20,
        gameplayData: {
          quizOptions: [
            { id: 'cl-intel', textKhmer: 'ប្រាជ្ញា', isCorrect: true, emoji: '🧠' },
            { id: 'cl-sleep', textKhmer: 'ខ្ជិលច្រអូស', isCorrect: false, emoji: '😴' },
            { id: 'cl-slow', textKhmer: 'យឺតយ៉ាវ', isCorrect: false, emoji: '🐢' },
          ],
        },
      },
    ],
  },
  {
    id: 'game-34-rhyming-archer',
    titleKhmer: 'បាញ់ពាក្យជួន',
    titleEnglish: 'Khmer Rhyming Archer',
    subject: 'khmer',
    gradeLevel: 2,
    instructionsKhmer: 'ស្វែងរកពាក្យដែលជួនសំឡេងស្រៈជាមួយពាក្យ «ចាន»',
    instructionsEnglish: 'Shoot targets sharing identical rhymes',
    template: 'quiz_tap',
    metadata: { targetCompetency: 'ពាក្យជួន និងចង្វាក់កាព្យ (Rhyme Patterns)', gameNumber: 34 },
    levels: [
      {
        levelId: 1,
        promptText: 'តើពាក្យណាជួនជាមួយពាក្យ «ចាន»?',
        timeLimitSeconds: 20,
        gameplayData: {
          quizOptions: [
            { id: 'rh-ban', textKhmer: 'បាន (ជួននឹង ចាន)', isCorrect: true, emoji: '🎯' },
            { id: 'rh-dek', textKhmer: 'ដេក', isCorrect: false, emoji: '🎯' },
            { id: 'rh-tirk', textKhmer: 'ទឹក', isCorrect: false, emoji: '🎯' },
            { id: 'rh-phka', textKhmer: 'ផ្កា', isCorrect: false, emoji: '🎯' },
          ],
        },
      },
    ],
  },
  {
    id: 'game-35-word-memory',
    titleKhmer: 'ផ្គូផ្គងរូបភាព និងពាក្យ',
    titleEnglish: 'Picture-to-Word Memory',
    subject: 'khmer',
    gradeLevel: 1,
    instructionsKhmer: 'បើកសន្លឹកបៀដើម្បីផ្គូផ្គងរូបភាពជាមួយពាក្យខ្មែរ',
    instructionsEnglish: 'Flip cards to match pictures with Khmer vocabulary',
    template: 'matching_cards',
    metadata: { targetCompetency: 'វាក្យសព្ទ និងរូបភាព (Picture-Word Association)', gameNumber: 35 },
    levels: [
      {
        levelId: 1,
        promptText: 'ផ្គូផ្គងរូបភាព និងពាក្យខ្មែរឲ្យត្រូវគ្នា៖',
        gameplayData: {
          pairs: [
            { id: 'wm1', khmer: 'ផ្កាឈូក', matchId: 'lotus', image: '🪷 ផ្កាឈូក' },
            { id: 'wm2', khmer: 'សត្វដំរី', matchId: 'elephant', image: '🐘 សត្វដំរី' },
            { id: 'wm3', khmer: 'ព្រះអាទិត្យ', matchId: 'sun', image: '☀️ ព្រះអាទិត្យ' },
            { id: 'wm4', khmer: 'ផ្ទះខ្មែរ', matchId: 'house', image: '🏠 ផ្ទះ' },
          ],
        },
      },
    ],
  },
  {
    id: 'game-36-series-o-sorter',
    titleKhmer: 'សំឡេងអក្សរ អ និង អ៊',
    titleEnglish: 'Series "O" vs Series "OR" Sorter',
    subject: 'khmer',
    gradeLevel: 2,
    instructionsKhmer: 'បែងចែកព្យញ្ជនៈខ្មែរចូលក្នុង ពួក អ (A-Series) និង ពួក អ៊ (O-Series)',
    instructionsEnglish: 'Group consonants into A-series and O-series',
    template: 'sorter',
    metadata: { targetCompetency: 'ពួកព្យញ្ជនៈ អ និង អ៊ (Khmer Consonant Series)', gameNumber: 36 },
    levels: [
      {
        levelId: 1,
        promptText: 'បែងចែកព្យញ្ជនៈខាងក្រោមចូលក្នុងពួក អ ឬពួក អ៊៖',
        gameplayData: {
          categories: [
            { id: 'series-a', nameKhmer: 'ពួក អ (A-Series)', nameEnglish: 'A-Series', icon: '🅰️' },
            { id: 'series-o', nameKhmer: 'ពួក អ៊ (O-Series)', nameEnglish: 'O-Series', icon: '🅾️' },
          ],
          items: [
            { id: 'c-ka', labelKhmer: 'ក', imageOrIcon: 'ក', correctCategoryOrOrder: 'series-a', feedbackKhmer: 'ក ជាពួក អ!' },
            { id: 'c-ko', labelKhmer: 'គ', imageOrIcon: 'គ', correctCategoryOrOrder: 'series-o', feedbackKhmer: 'គ ជាពួក អ៊!' },
            { id: 'c-cha', labelKhmer: 'ច', imageOrIcon: 'ច', correctCategoryOrOrder: 'series-a', feedbackKhmer: 'ច ជាពួក អ!' },
            { id: 'c-cho', labelKhmer: 'ជ', imageOrIcon: 'ជ', correctCategoryOrOrder: 'series-o', feedbackKhmer: 'ជ ជាពួក អ៊!' },
            { id: 'c-ta', labelKhmer: 'ត', imageOrIcon: 'ត', correctCategoryOrOrder: 'series-a', feedbackKhmer: 'ត ជាពួក អ!' },
            { id: 'c-to', labelKhmer: 'ទ', imageOrIcon: 'ទ', correctCategoryOrOrder: 'series-o', feedbackKhmer: 'ទ ជាពួក អ៊!' },
          ],
        },
      },
    ],
  },
  {
    id: 'game-37-comic-story',
    titleKhmer: 'តែងល្បះរឿងខ្លី',
    titleEnglish: 'Comic Strip Storyteller',
    subject: 'khmer',
    gradeLevel: 3,
    instructionsKhmer: 'តម្រៀបផ្ទាំងគំនូរជីវចលតាមលំដាប់ដើមរឿង កណ្តាលរឿង និងចុងរឿង',
    instructionsEnglish: 'Place comic panels in order to complete a story',
    template: 'sequencer',
    metadata: { targetCompetency: 'ការតែងរឿង និងលំដាប់ព្រឹត្តិការណ៍ (Story Sequencing)', gameNumber: 37 },
    levels: [
      {
        levelId: 1,
        promptText: 'តម្រៀបដំណើររឿង «ដាំផ្កា» ឲ្យត្រូវតាមលំដាប់លំដោយ៖',
        gameplayData: {
          items: [
            { id: 'cs1', labelKhmer: '១. ជីកដីដាក់គ្រាប់ផ្កា', imageOrIcon: '🌱', correctCategoryOrOrder: 1 },
            { id: 'cs2', labelKhmer: '២. ស្រោចទឹកជាប្រចាំ', imageOrIcon: '🚿', correctCategoryOrOrder: 2 },
            { id: 'cs3', labelKhmer: '៣. ដើមផ្កាដុះពន្លកធំ', imageOrIcon: '🌿', correctCategoryOrOrder: 3 },
            { id: 'cs4', labelKhmer: '៤. ផ្ការីកក្រអូបសោភា', imageOrIcon: '🌸', correctCategoryOrOrder: 4 },
          ],
        },
      },
    ],
  },
  {
    id: 'game-38-antonym-match',
    titleKhmer: 'ស្វែងរកពាក្យផ្ទុយ',
    titleEnglish: 'Antonym Match-Up',
    subject: 'khmer',
    gradeLevel: 2,
    instructionsKhmer: 'ផ្គូផ្គងពាក្យផ្ទុយន័យគ្នា (ធំ/តូច, ខ្ពស់/ទាប, ឆ្ងាយ/ជិត)',
    instructionsEnglish: 'Pair opposite Khmer vocabulary words',
    template: 'matching_cards',
    metadata: { targetCompetency: 'ពាក្យផ្ទុយន័យ (Khmer Antonyms)', gameNumber: 38 },
    levels: [
      {
        levelId: 1,
        promptText: 'ផ្គូផ្គងពាក្យផ្ទុយន័យគ្នា៖',
        gameplayData: {
          pairs: [
            { id: 'an1', khmer: 'ធំ (Big)', matchId: 'big-small', image: 'តូច (Small)' },
            { id: 'an2', khmer: 'ខ្ពស់ (Tall)', matchId: 'tall-short', image: 'ទាប (Short)' },
            { id: 'an3', khmer: 'ឆ្ងាយ (Far)', matchId: 'far-near', image: 'ជិត (Near)' },
            { id: 'an4', khmer: 'ស (White)', matchId: 'white-black', image: 'ខ្មៅ (Black)' },
          ],
        },
      },
    ],
  },
  {
    id: 'game-39-whack-a-mole',
    titleKhmer: 'វាយពាក្យខ្មែរល្បឿនលឿន',
    titleEnglish: 'Khmer Word Whack-a-Mole',
    subject: 'khmer',
    gradeLevel: 3,
    instructionsKhmer: 'ចុចជ្រើសរើសពាក្យដែលសរសេរអក្ខរាវិរុទ្ធបានត្រឹមត្រូវ',
    instructionsEnglish: 'Hit targets holding correctly spelled words',
    template: 'quiz_tap',
    metadata: { targetCompetency: 'អក្ខរាវិរុទ្ធខ្មែរ (Khmer Spelling Accuracy)', gameNumber: 39 },
    levels: [
      {
        levelId: 1,
        promptText: 'តើពាក្យមួយណាដែលសរសេរត្រឹមត្រូវតាមវចនានុក្រម?',
        timeLimitSeconds: 20,
        gameplayData: {
          quizOptions: [
            { id: 'sp-correct', textKhmer: 'សាលារៀន (School)', isCorrect: true, emoji: '🏫' },
            { id: 'sp-wrong1', textKhmer: 'សាលារៀណ', isCorrect: false, emoji: '❌' },
            { id: 'sp-wrong2', textKhmer: 'សារលារៀន', isCorrect: false, emoji: '❌' },
            { id: 'sp-wrong3', textKhmer: 'សាលារៀន់', isCorrect: false, emoji: '❌' },
          ],
        },
      },
    ],
  },
  {
    id: 'game-40-silent-marker',
    titleKhmer: 'អ្នកស៊ើបអង្កេតទណ្ឌឃាត (៍)',
    titleEnglish: 'Silent Marker Detective',
    subject: 'khmer',
    gradeLevel: 3,
    instructionsKhmer: 'ដាក់សញ្ញាទណ្ឌឃាត (៍) លើតួអក្សរដែលត្រូវបំបិទសំឡេង',
    instructionsEnglish: 'Place silent marker on Sanskrit/Pali loanwords',
    template: 'sentence_builder',
    metadata: { targetCompetency: 'សញ្ញាវណ្ណយុត្តិ ទណ្ឌឃាត (Silent Diacritic ៍)', gameNumber: 40 },
    levels: [
      {
        levelId: 1,
        promptText: 'ផ្គុំពាក្យ «ទូរទស្សន៍» ដោយដាក់សញ្ញាទណ្ឌឃាតលើអក្សរ ន៍៖',
        gameplayData: {
          tiles: [
            { id: 'sm1', textKhmer: 'ទូរ', order: 1 },
            { id: 'sm2', textKhmer: 'ទស្ស', order: 2 },
            { id: 'sm3', textKhmer: 'ន៍', order: 3 },
          ],
        },
      },
    ],
  },
  {
    id: 'game-41-blended-consonants',
    titleKhmer: 'អក្សរផ្ញើជើងអាថ៌កំបាំង',
    titleEnglish: 'Blended Consonant Explorer',
    subject: 'khmer',
    gradeLevel: 2,
    instructionsKhmer: 'ផ្គុំពាក្យអក្សរផ្ញើជើងដូចជា «ស្មៅ»',
    instructionsEnglish: 'Build blended consonant cluster words',
    template: 'sentence_builder',
    metadata: { targetCompetency: 'ព្យញ្ជនៈផ្ញើជើង (Consonant Clusters)', gameNumber: 41 },
    levels: [
      {
        levelId: 1,
        promptText: 'ផ្គុំពាក្យ «ស្មៅ» ដោយប្រើព្យញ្ជនៈផ្ញើជើង ស្ម៖',
        gameplayData: {
          tiles: [
            { id: 'bc1', textKhmer: 'ស', order: 1 },
            { id: 'bc2', textKhmer: '្ម', order: 2 },
            { id: 'bc3', textKhmer: 'ៅ', order: 3 },
          ],
        },
      },
    ],
  },
  {
    id: 'game-42-grammar-chest',
    titleKhmer: 'កំណប់វេយ្យាករណ៍',
    titleEnglish: 'Noun/Verb/Adjective Chest',
    subject: 'khmer',
    gradeLevel: 3,
    instructionsKhmer: 'បែងចែកពាក្យចូលក្នុងហឹបកំណប់ នាម កិរិយា និងគុណនាម',
    instructionsEnglish: 'Sort words into chests labeled Noun, Verb, and Adjective',
    template: 'sorter',
    metadata: { targetCompetency: 'ថ្នាក់ពាក្យ នាម កិរិយា គុណនាម (Parts of Speech)', gameNumber: 42 },
    levels: [
      {
        levelId: 1,
        promptText: 'បែងចែកពាក្យខាងក្រោមចូលក្នុងហឹបវេយ្យាករណ៍ឲ្យបានត្រឹមត្រូវ៖',
        gameplayData: {
          categories: [
            { id: 'noun', nameKhmer: 'នាម (Noun)', nameEnglish: 'Noun', icon: '📦' },
            { id: 'verb', nameKhmer: 'កិរិយា (Verb)', nameEnglish: 'Verb', icon: '🏃' },
            { id: 'adj', nameKhmer: 'គុណនាម (Adjective)', nameEnglish: 'Adjective', icon: '✨' },
          ],
          items: [
            { id: 'g1', labelKhmer: 'សៀវភៅ', imageOrIcon: '📖', correctCategoryOrOrder: 'noun', feedbackKhmer: 'សៀវភៅជាឈ្មោះវត្ថុ (នាម)!' },
            { id: 'g2', labelKhmer: 'រត់លឿន', imageOrIcon: '🏃', correctCategoryOrOrder: 'verb', feedbackKhmer: 'រត់ជាអំពើឬសកម្មភាព (កិរិយា)!' },
            { id: 'g3', labelKhmer: 'ស្រស់ស្អាត', imageOrIcon: '🌸', correctCategoryOrOrder: 'adj', feedbackKhmer: 'ស្រស់ស្អាតជាពាក្យពណ៌នា (គុណនាម)!' },
            { id: 'g4', labelKhmer: 'សិស្ស', imageOrIcon: '🧑‍🎓', correctCategoryOrOrder: 'noun', feedbackKhmer: 'សិស្សជាឈ្មោះមនុស្ស (នាម)!' },
            { id: 'g5', labelKhmer: 'សរសេរ', imageOrIcon: '✍️', correctCategoryOrOrder: 'verb', feedbackKhmer: 'សរសេរជាសកម្មភាព (កិរិយា)!' },
            { id: 'g6', labelKhmer: 'ផ្អែមឆ្ងាញ់', imageOrIcon: '🍯', correctCategoryOrOrder: 'adj', feedbackKhmer: 'ផ្អែមជាគុណភាពរសជាតិ (គុណនាម)!' },
          ],
        },
      },
    ],
  },
];

export const gamesCatalog = ALL_42_GAMES;
export default ALL_42_GAMES;
