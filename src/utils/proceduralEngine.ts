// utils/proceduralEngine.ts
// Zero-Repetition Procedural Mini-Game Generation Engine for Cambodian MoEYS Grades 1-3

import { GeneratedGameConfig, GradeLevel } from '@/types/edtech';

// Helper: Random item picker
function sample<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Helper: Sample N distinct items
function sampleN<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(n, arr.length));
}

// Helper: Random integer in range [min, max]
function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Helper: Shuffle array
function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

// =========================================================================
// PROCEDURAL GENERATORS (42 Games)
// =========================================================================

export function generateProceduralGame(gameId: string, grade: GradeLevel): GeneratedGameConfig | null {
  const timestamp = Date.now();
  const seedPin = randInt(100000, 999999).toString();

  switch (gameId) {
    // -----------------------------------------------------------------------
    // A. វិទ្យាសាស្ត្រ (Science & Nature) — 14 Games
    // -----------------------------------------------------------------------
    case 'game-1-plant-lab': {
      const seeds = [
        { nameKh: 'សណ្ដែកបាយ', icon: '🫘' },
        { nameKh: 'សណ្ដែកដី', icon: '🥜' },
        { nameKh: 'គ្រាប់ពោត', icon: '🌽' },
        { nameKh: 'គ្រាប់ផ្កាឈូករ័ត្ន', icon: '🌻' },
      ];
      const selectedSeed = sample(seeds);
      const initMoist = randInt(15, 35);
      const initLight = randInt(10, 30);
      const initComp = randInt(10, 25);
      return {
        id: `plant-lab-${timestamp}`,
        titleKhmer: `ពិសោធគ្រាប់${selectedSeed.nameKh}`,
        titleEnglish: 'Plant Germination Lab',
        subject: 'science',
        gradeLevel: grade,
        instructionsKhmer: `សារធាតុរាវ សំណើម ពន្លឺ និងជីវជាតិដីដើម្បីដុះពន្លកគ្រាប់${selectedSeed.nameKh}`,
        instructionsEnglish: 'Balance moisture, sunlight, and compost for germination',
        template: 'sandbox',
        engineType: 'sandbox',
        metadata: { targetCompetency: 'ការដុះពន្លករុក្ខជាតិ', gameNumber: 1, classroomPin: seedPin },
        levels: [
          {
            levelId: 1,
            promptText: `ទាញប៊ូតុងបញ្ជា សំណើម ពន្លឺ និងជីជាតិ ឲ្យស្ថិតក្នុងកម្រិតសមស្រប (៦០-៨៥%) ដើម្បីឲ្យគ្រាប់${selectedSeed.nameKh}ដុះលូតលាស់៖`,
            gameplayData: {
              sandboxData: {
                mode: 'germination',
                targetGoalKhmer: `ជួយឲ្យគ្រាប់${selectedSeed.nameKh}ដុះពន្លក និងចេញផ្កា`,
                initialMoisture: initMoist,
                initialLight: initLight,
                initialCompost: initComp,
                optimalRange: { min: 55, max: 90 },
              },
            },
          },
        ],
      };
    }

    case 'game-2-bento-food': {
      return {
        id: `bento-food-${timestamp}`,
        titleKhmer: 'ប្រអប់បាយសុខភាព (៣ ក្រុម)',
        titleEnglish: '3 Food Groups Bento Box',
        subject: 'science',
        gradeLevel: grade,
        instructionsKhmer: 'រៀបចំមុខម្ហូបចូលក្នុងប្រអប់បាយឲ្យមានតុល្យភាពទាំង ៣ ក្រុម៖ ថាមពល លូតលាស់ និងការពារ',
        instructionsEnglish: 'Balance the Bento Box with Energy, Growth, and Protection nutrients',
        template: 'sandbox',
        engineType: 'sandbox',
        metadata: { targetCompetency: 'សារធាតុចិញ្ចឹមទាំង ៣ ក្រុម', gameNumber: 2, classroomPin: seedPin },
        levels: [
          {
            levelId: 1,
            promptText: 'ចុចជ្រើសរើសមុខម្ហូបពីក្រុមនីមួយៗ (ថាមពល លូតលាស់ ការពារ) ឲ្យបានគ្រប់គ្រាន់ដើម្បីបំពេញថាមពលកុមារ៖',
            gameplayData: {
              sandboxData: {
                mode: 'bento_balance',
                targetGoalKhmer: 'រៀបចំម្ហូបឲ្យមានតុល្យភាពទាំង ៣ ក្រុមជីវជាតិ',
              },
            },
          },
        ],
      };
    }

    case 'game-3-germ-buster': {
      return {
        id: `germ-buster-${timestamp}`,
        titleKhmer: 'កម្ចាត់មេរោគលើដៃ',
        titleEnglish: 'Germ Buster Hygiene',
        subject: 'science',
        gradeLevel: grade,
        instructionsKhmer: 'យកដុំសាប៊ូដុសសម្អាតលើមេរោគទាំង ៥ លើបាតដៃឲ្យស្អាតភ្លឺចែងចាំង',
        instructionsEnglish: 'Scrub the soap bubbles over germs to eliminate them completely',
        template: 'sandbox',
        engineType: 'sandbox',
        metadata: { targetCompetency: 'អនាម័យផ្ទាល់ខ្លួន និងការលាងដៃ', gameNumber: 3, classroomPin: seedPin },
        levels: [
          {
            levelId: 1,
            promptText: 'ចុចលើមេរោគនីមួយៗលើបាតដៃដើម្បីដុសសាប៊ូកម្ចាត់មេរោគឲ្យស្អាតល្អ៖',
            gameplayData: {
              sandboxData: {
                mode: 'germ_buster',
                targetGoalKhmer: 'ដុសសាប៊ូកម្ចាត់មេរោគលើបាតដៃឲ្យស្អាត ១០០%',
              },
            },
          },
        ],
      };
    }

    case 'game-4-butterfly-cycle': {
      return {
        id: `butterfly-cycle-${timestamp}`,
        titleKhmer: 'វដ្តជីវិតមេអំបៅ',
        titleEnglish: 'Butterfly Metamorphosis',
        subject: 'science',
        gradeLevel: grade,
        instructionsKhmer: 'តម្រៀបដំណាក់កាលវដ្តជីវិតមេអំបៅពីពងរហូតដល់មេអំបៅពេញវ័យ',
        instructionsEnglish: 'Sequence egg -> caterpillar -> chrysalis -> butterfly in a circular life cycle',
        template: 'sequencer',
        engineType: 'sequencer',
        metadata: { targetCompetency: 'វដ្តជីវិតសត្វល្អិត', gameNumber: 4, classroomPin: seedPin },
        levels: [
          {
            levelId: 1,
            promptText: 'តម្រៀបដំណាក់កាលទាំង ៤ នៃវដ្តជីវិតមេអំបៅតាមរង្វង់លំដាប់លំដោយ៖',
            gameplayData: {
              sequencerData: {
                mode: 'life_cycle',
                cycleTitleKhmer: 'វដ្តជីវិតមេអំបៅ (Butterfly Metamorphosis)',
                layout: 'circular',
                stages: [
                  { id: `bf-1-${timestamp}`, stepNumber: 1, titleKhmer: '១. ពងមេអំបៅ', descriptionKhmer: 'ពងតូចៗជាប់នឹងស្លឹកឈើ', iconOrImage: '🥚' },
                  { id: `bf-2-${timestamp}`, stepNumber: 2, titleKhmer: '២. ដង្កូវ', descriptionKhmer: 'ស៊ីស្លឹកឈើដើម្បីរីកធំធាត់', iconOrImage: '🐛' },
                  { id: `bf-3-${timestamp}`, stepNumber: 3, titleKhmer: '៣. ដឹកឌឿ', descriptionKhmer: 'សម្ងំនៅក្នុងសំបុកសូត្រដុក', iconOrImage: '🥜' },
                  { id: `bf-4-${timestamp}`, stepNumber: 4, titleKhmer: '៤. មេអំបៅពេញវ័យ', descriptionKhmer: 'ហើរបញ្ចេញស្លាបចម្រុះពណ៌', iconOrImage: '🦋' },
                ],
              },
            },
          },
        ],
      };
    }

    case 'game-5-frog-cycle': {
      return {
        id: `frog-cycle-${timestamp}`,
        titleKhmer: 'វដ្តជីវិតកង្កែប',
        titleEnglish: 'Frog Lifecycle',
        subject: 'science',
        gradeLevel: grade,
        instructionsKhmer: 'រៀបចំដំណាក់កាលវដ្តជីវិតកង្កែបពីពងក្នុងទឹកដល់កង្កែបពេញវ័យលើគោក',
        instructionsEnglish: 'Sequence spawn -> tadpole -> froglet -> adult frog',
        template: 'sequencer',
        engineType: 'sequencer',
        metadata: { targetCompetency: 'សត្វរស់ក្នុងទឹក និងលើគោក', gameNumber: 5, classroomPin: seedPin },
        levels: [
          {
            levelId: 1,
            promptText: 'តម្រៀបដំណាក់កាលនៃវដ្តជីវិតកង្កែបតាមលំដាប់៖',
            gameplayData: {
              sequencerData: {
                mode: 'life_cycle',
                cycleTitleKhmer: 'វដ្តជីវិតកង្កែប (Frog Life Cycle)',
                layout: 'circular',
                stages: [
                  { id: `fg-1-${timestamp}`, stepNumber: 1, titleKhmer: '១. ពងកង្កែប', descriptionKhmer: 'ពងកង្កែបពពុះក្នុងទឹកបឹង', iconOrImage: '🫧' },
                  { id: `fg-2-${timestamp}`, stepNumber: 2, titleKhmer: '២. កូនក្អុក', descriptionKhmer: 'កូនក្អុកមានកន្ទុយហែលក្នុងទឹក', iconOrImage: '🐟' },
                  { id: `fg-3-${timestamp}`, stepNumber: 3, titleKhmer: '៣. កូនកង្កែប', descriptionKhmer: 'ដុះជើងក្រោយ និងកន្ទុយរួញខ្លី', iconOrImage: '🦎' },
                  { id: `fg-4-${timestamp}`, stepNumber: 4, titleKhmer: '៤. កង្កែបពេញវ័យ', descriptionKhmer: 'លោតឡើងលើគោក និងអាចស្រែកយំ', iconOrImage: '🐸' },
                ],
              },
            },
          },
        ],
      };
    }

    case 'game-6-water-cycle': {
      return {
        id: `water-cycle-${timestamp}`,
        titleKhmer: 'វដ្តនៃទឹក',
        titleEnglish: 'Water Cycle',
        subject: 'science',
        gradeLevel: grade,
        instructionsKhmer: 'រៀបចំលំហូរនៃវដ្តទឹកក្នុងធម្មជាតិ៖ រំហួត កំណក ទឹកភ្លៀង និងការប្រមូលផ្តុំ',
        instructionsEnglish: 'Sequence atmospheric water cycle',
        template: 'sequencer',
        engineType: 'sequencer',
        metadata: { targetCompetency: 'វដ្តទឹក និងបរិស្ថាន', gameNumber: 6, classroomPin: seedPin },
        levels: [
          {
            levelId: 1,
            promptText: 'តម្រៀបដំណាក់កាលនៃវដ្តទឹកក្នុងធម្មជាតិឲ្យបានត្រឹមត្រូវ៖',
            gameplayData: {
              sequencerData: {
                mode: 'water_cycle',
                cycleTitleKhmer: 'វដ្តនៃទឹកក្នុងធម្មជាតិ (Hydrological Cycle)',
                layout: 'linear',
                stages: [
                  { id: `wc-1-${timestamp}`, stepNumber: 1, titleKhmer: '១. រំហួតទឹក', descriptionKhmer: 'កម្ដៅព្រះអាទិត្យធ្វើឲ្យទឹកហួតឡើងលើ', iconOrImage: '♨️' },
                  { id: `wc-2-${timestamp}`, stepNumber: 2, titleKhmer: '២. កំណកពពក', descriptionKhmer: 'ចំហាយទឹកជួបត្រជាក់កកើតជាដុំពពក', iconOrImage: '☁️' },
                  { id: `wc-3-${timestamp}`, stepNumber: 3, titleKhmer: '៣. ធ្លាក់ទឹកភ្លៀង', descriptionKhmer: 'តំណក់ទឹកធ្លាក់ចុះមកដីជាទឹកភ្លៀង', iconOrImage: '🌧️' },
                  { id: `wc-4-${timestamp}`, stepNumber: 4, titleKhmer: '៤. ហូរប្រមូលផ្តុំ', descriptionKhmer: 'ទឹកហូរចូលស្ទឹង ទន្លេ និងសមុទ្រវិញ', iconOrImage: '🌊' },
                ],
              },
            },
          },
        ],
      };
    }

    case 'game-7-animal-class': {
      const animalPool = [
        { label: 'សត្វសេក', icon: '🦜', cat: 'birds' },
        { label: 'សត្វព្រាប', icon: '🕊️', cat: 'birds' },
        { label: 'សត្វឥន្ទ្រី', icon: '🦅', cat: 'birds' },
        { label: 'ត្រីរ៉ស់', icon: '🐟', cat: 'fish' },
        { label: 'ត្រីបបែល', icon: '🦈', cat: 'fish' },
        { label: 'ត្រីដំរី', icon: '🐠', cat: 'fish' },
        { label: 'សត្វដំរី', icon: '🐘', cat: 'mammals' },
        { label: 'សត្វគោ', icon: '🐂', cat: 'mammals' },
        { label: 'សត្វឆ្មា', icon: '🐱', cat: 'mammals' },
      ];
      const selected = sampleN(animalPool, 6).map((a, idx) => ({
        id: `anim-${idx}-${timestamp}`,
        labelKhmer: a.label,
        imageOrIcon: a.icon,
        correctCategoryOrOrder: a.cat,
      }));

      return {
        id: `animal-class-${timestamp}`,
        titleKhmer: 'សត្វស្លាប មច្ឆា ថនិកសត្វ',
        titleEnglish: 'Animal Classification',
        subject: 'science',
        gradeLevel: grade,
        instructionsKhmer: 'បែងចែកប្រភេទសត្វទៅតាមក្រុមជីវសាស្ត្ររបស់ពួកវា',
        instructionsEnglish: 'Classify animals into birds, aquatic fish, and mammals',
        template: 'sorter',
        metadata: { targetCompetency: 'ចំណាត់ថ្នាក់សត្វ', gameNumber: 7, classroomPin: seedPin },
        levels: [{
          levelId: 1,
          promptText: 'បែងចែកសត្វខាងក្រោមចូលក្នុងក្រុមឲ្យបានត្រឹមត្រូវ៖',
          gameplayData: {
            categories: [
              { id: 'birds', nameKhmer: 'សត្វស្លាប (Birds)', nameEnglish: 'Birds', icon: '🦅' },
              { id: 'fish', nameKhmer: 'មច្ឆាជាតិ (Fish)', nameEnglish: 'Fish', icon: '🐠' },
              { id: 'mammals', nameKhmer: 'ថនិកសត្វ (Mammals)', nameEnglish: 'Mammals', icon: '🐘' },
            ],
            items: selected,
          },
        }],
      };
    }

    case 'game-8-five-senses': {
      const senses = [
        { id: 's-eye', labelKhmer: 'ចក្ខុវិញ្ញាណ (ភ្នែក)', icon: '👁️', hint: 'មើលឃើញពណ៌ និងរូបរាង', fact: 'ភ្នែកមើលសៀវភៅ និងទេសភាព' },
        { id: 's-ear', labelKhmer: 'សោតវិញ្ញាណ (ត្រចៀក)', icon: '👂', hint: 'ស្ដាប់ឮសំឡេងជុំវិញខ្លួន', fact: 'ត្រចៀកស្ដាប់ឮសំឡេងបក្សី និងភ្លេង' },
        { id: 's-nose', labelKhmer: 'ឃានវិញ្ញាណ (ច្រមុះ)', icon: '👃', hint: 'ដឹងក្លិនក្រអូប និងដកដង្ហើម', fact: 'ច្រមុះដឹងក្លិនផ្កា និងម្ហូបឆ្ងាញ់' },
        { id: 's-tongue', labelKhmer: 'ជីវ្ហាវិញ្ញាណ (អណ្ដាត)', icon: '👅', hint: 'ដឹងរសជាតិផ្អែម ប្រៃ ជូរ ចត់', fact: 'អណ្ដាតមានពន្លករសជាតិ' },
        { id: 's-skin', labelKhmer: 'កាយវិញ្ញាណ (ដៃ/ស្បែក)', icon: '✋', hint: 'ដឹងក្ដៅ ត្រជាក់ ទន់ រឹង', fact: 'ស្បែកជាសរីរាង្គការពារធំបំផុត' },
      ];
      return {
        id: `five-senses-${timestamp}`,
        titleKhmer: 'វិញ្ញាណទាំង ៥',
        titleEnglish: 'Five Senses Explorer',
        subject: 'science',
        gradeLevel: grade,
        instructionsKhmer: 'រុករកសរីរាង្គវិញ្ញាណទាំង ៥ លើរាងកាយកុមារ',
        instructionsEnglish: 'Explore the 5 senses and their biological functions',
        template: 'hotspot',
        metadata: { targetCompetency: 'សរីរាង្គវិញ្ញាណ', gameNumber: 8, classroomPin: seedPin },
        levels: [{
          levelId: 1,
          promptText: 'ចុចលើវិញ្ញាណនីមួយៗដើម្បីស្វែងយល់ពីមុខងាររបស់វា៖',
          gameplayData: {
            hotspots: senses.map((s, idx) => ({
              id: s.id,
              xPercent: 20 + idx * 15,
              yPercent: 30 + (idx % 2) * 35,
              labelKhmer: s.labelKhmer,
              icon: s.icon,
              hintKhmer: s.hint,
              funFactKhmer: s.fact,
            })),
          },
        }],
      };
    }

    case 'game-9-living-nonliving': {
      return {
        id: `living-nonliving-${timestamp}`,
        titleKhmer: 'របស់មានជីវិត និងគ្មានជីវិត',
        titleEnglish: 'Living vs Non-Living Matrix',
        subject: 'science',
        gradeLevel: grade,
        instructionsKhmer: 'បែងចែករវាងភាវៈមានជីវិត (ដកដង្ហើម លូតលាស់) និងវត្ថុគ្មានជីវិត',
        instructionsEnglish: 'Classify items into living organisms vs inanimate objects',
        template: 'sorter',
        engineType: 'sorter',
        metadata: { targetCompetency: 'លក្ខណៈនៃជីវិត', gameNumber: 9, classroomPin: seedPin },
        levels: [
          {
            levelId: 1,
            promptText: 'ចុចលើធុងដែលត្រូវដើម្បីចាត់ថ្នាក់វត្ថុមានជីវិត ឬគ្មានជីវិត៖',
            gameplayData: {
              sorterData: {
                mode: 'living_matrix',
                bounceBackOnError: true,
                bins: [
                  { id: 'b-living', nameKhmer: 'មានជីវិត (Living)', colorClass: 'from-emerald-500 to-teal-600', icon: '🌱' },
                  { id: 'b-nonliving', nameKhmer: 'គ្មានជីវិត (Non-Living)', colorClass: 'from-slate-500 to-slate-700', icon: '🪨' },
                ],
                entities: shuffle([
                  { id: `ln-1-${timestamp}`, nameKhmer: 'កូនឆ្មា', icon: '🐱', correctBinId: 'b-living' },
                  { id: `ln-2-${timestamp}`, nameKhmer: 'ដើមចេក', icon: '🌴', correctBinId: 'b-living' },
                  { id: `ln-3-${timestamp}`, nameKhmer: 'ដុំថ្ម', icon: '🪨', correctBinId: 'b-nonliving' },
                  { id: `ln-4-${timestamp}`, nameKhmer: 'មេអំបៅ', icon: '🦋', correctBinId: 'b-living' },
                  { id: `ln-5-${timestamp}`, nameKhmer: 'កង់ជិះ', icon: '🚲', correctBinId: 'b-nonliving' },
                  { id: `ln-6-${timestamp}`, nameKhmer: 'សៀវភៅ', icon: '📚', correctBinId: 'b-nonliving' },
                ]),
              },
            },
          },
        ],
      };
    }

    case 'game-10-sun-shadow': {
      const angles = [
        { angle: 45, label: 'ម៉ោង ៧:០០ ព្រឹក' },
        { angle: 90, label: 'ម៉ោង ១២:០០ ថ្ងៃត្រង់' },
        { angle: 135, label: 'ម៉ោង ៤:០០ រសៀល' },
      ];
      const target = sample(angles);
      return {
        id: `sun-shadow-${timestamp}`,
        titleKhmer: 'ព្រះអាទិត្យ និងស្រមោល',
        titleEnglish: 'Sun & Shadow Dial',
        subject: 'science',
        gradeLevel: grade,
        instructionsKhmer: 'អូសទាញព្រះអាទិត្យតាមគន្លងដើម្បីឲ្យស្រមោលត្រូវគ្នានឹងម៉ោងកំណត់',
        instructionsEnglish: 'Drag the sun along its celestial arc to match target shadow angle',
        template: 'sandbox',
        engineType: 'sandbox',
        metadata: { targetCompetency: 'ពន្លឺ និងស្រមោល', gameNumber: 10, classroomPin: seedPin },
        levels: [
          {
            levelId: 1,
            promptText: `អូសព្រះអាទិត្យតាមគន្លងឲ្យត្រូវនឹង៖ «${target.label}» (មុំប្រមាណ ${target.angle}°)៖`,
            gameplayData: {
              sandboxData: {
                mode: 'sun_shadow',
                targetAngle: target.angle,
                targetMilestone: target.label,
                targetGoalKhmer: `តម្រង់ព្រះអាទិត្យឲ្យត្រូវម៉ោង «${target.label}»`,
              },
            },
          },
        ],
      };
    }

    case 'game-11-magnetic-sort': {
      return {
        id: `magnetic-sort-${timestamp}`,
        titleKhmer: 'មេដែកស្រូបទាញ',
        titleEnglish: 'Magnetic Explorer',
        subject: 'science',
        gradeLevel: grade,
        instructionsKhmer: 'ចុចលើវត្ថុដែកដើម្បីឲ្យមេដែកស្រូបទាញចូល រីឯវត្ថុមិនមែនដែកនឹងមិនស្រូបទេ',
        instructionsEnglish: 'Click on ferromagnetic objects to pull them toward the horseshoe magnet',
        template: 'sandbox',
        engineType: 'sandbox',
        metadata: { targetCompetency: 'កម្លាំងមេដែក', gameNumber: 11, classroomPin: seedPin },
        levels: [
          {
            levelId: 1,
            promptText: 'ស្វែងរក និងស្រូបយកវត្ថុធ្វើពីដែកទាំងអស់ (ដែកគោល ម្ជុល កូនសោ កន្ត្រៃ)៖',
            gameplayData: {
              sandboxData: {
                mode: 'magnetism',
                targetGoalKhmer: 'ស្រូបយកវត្ថុដែលមានជាតិដែកទាំងអស់',
              },
            },
          },
        ],
      };
    }

    case 'game-12-plant-anatomy': {
      const parts = [
        { id: 'root', label: 'ឫសរុក្ខជាតិ', icon: '🥕', x: 50, y: 88, hint: 'ឫសស្រូបទឹក និងជីជាតិពីក្នុងដី' },
        { id: 'stem', label: 'ដើមរុក្ខជាតិ', icon: '🪵', x: 50, y: 62, hint: 'ដើមដឹកនាំទឹក និងជីវជាតិទៅកាន់ស្លឹក' },
        { id: 'leaf', label: 'ស្លឹកបៃតង', icon: '🍃', x: 28, y: 45, hint: 'ស្លឹកធ្វើរស្មីសំយោគផលិតអាហារ' },
        { id: 'flower', label: 'ផ្ការីកស្គុះស្គាយ', icon: '🌸', x: 72, y: 32, hint: 'ផ្កាទាក់ទាញសត្វល្អិត និងកកើតជាផ្លែ' },
        { id: 'fruit', label: 'ផ្លែទុំផ្អែម', icon: '🍎', x: 50, y: 35, hint: 'ផ្លែការពារគ្រាប់ពូជនៅខាងក្នុង' },
      ];
      return {
        id: `plant-anatomy-${timestamp}`,
        titleKhmer: 'ផ្នែកនៃរុក្ខជាតិ',
        titleEnglish: 'Plant Anatomy Lab',
        subject: 'science',
        gradeLevel: grade,
        instructionsKhmer: 'ស្វែងយល់ពីផ្នែកសំខាន់ៗរបស់រុក្ខជាតិ៖ ឫស ដើម ស្លឹក ផ្កា និងផ្លែ',
        instructionsEnglish: 'Label roots, stem, leaves, flower, and fruit',
        template: 'hotspot',
        metadata: { targetCompetency: 'រូបផ្គុំរុក្ខជាតិ', gameNumber: 12, classroomPin: seedPin },
        levels: [{
          levelId: 1,
          promptText: 'ចុចលើផ្នែកនីមួយៗនៃដើមឈើដើម្បីស្វែងយល់ពីមុខងារសំខាន់ៗ៖',
          gameplayData: {
            hotspots: parts.map(p => ({
              id: p.id,
              xPercent: p.x,
              yPercent: p.y,
              labelKhmer: p.label,
              icon: p.icon,
              hintKhmer: p.hint,
              funFactKhmer: 'រុក្ខជាតិបញ្ចេញអុកស៊ីសែនឲ្យមនុស្សដកដង្ហើម',
            })),
          },
        }],
      };
    }

    case 'game-13-eco-trash': {
      return {
        id: `eco-trash-${timestamp}`,
        titleKhmer: 'បែងចែកសំរាមឆ្លាត',
        titleEnglish: 'Eco Trash Sorter',
        subject: 'science',
        gradeLevel: grade,
        instructionsKhmer: 'បោះសំរាមចូលធុងទាំង ៤ ពណ៌ឲ្យបានត្រឹមត្រូវ៖ សរីរាង្គ ប្លាស្ទិក ក្រដាស និងគ្រោះថ្នាក់',
        instructionsEnglish: 'Sort waste items into 4 MoEYS color-coded recycling bins',
        template: 'sorter',
        engineType: 'sorter',
        metadata: { targetCompetency: 'ការគ្រប់គ្រងសំរាម', gameNumber: 13, classroomPin: seedPin },
        levels: [
          {
            levelId: 1,
            promptText: 'ជួយសម្អាតសាលារៀនដោយបែងចែកសំរាមចូលធុងឲ្យត្រូវ៖',
            gameplayData: {
              sorterData: {
                mode: 'eco_trash',
                bounceBackOnError: true,
                bins: [
                  { id: 'b-organic', nameKhmer: 'សំរាមសរីរាង្គ', colorClass: 'from-emerald-500 to-emerald-600', icon: '🍏' },
                  { id: 'b-plastic', nameKhmer: 'ប្លាស្ទិក/ជ័រ', colorClass: 'from-amber-400 to-amber-500', icon: '🧴' },
                  { id: 'b-paper', nameKhmer: 'ក្រដាស', colorClass: 'from-sky-400 to-sky-500', icon: '📦' },
                  { id: 'b-hazardous', nameKhmer: 'គ្រោះថ្នាក់/ថ្មពិល', colorClass: 'from-rose-500 to-rose-600', icon: '🔋' },
                ],
                entities: shuffle([
                  { id: `tr-1-${timestamp}`, nameKhmer: 'សំបកចេក', icon: '🍌', correctBinId: 'b-organic' },
                  { id: `tr-2-${timestamp}`, nameKhmer: 'ដបទឹកសុទ្ធ', icon: '🍾', correctBinId: 'b-plastic' },
                  { id: `tr-3-${timestamp}`, nameKhmer: 'កេសក្រដាស', icon: '📦', correctBinId: 'b-paper' },
                  { id: `tr-4-${timestamp}`, nameKhmer: 'ថ្មពិលចាស់', icon: '🔋', correctBinId: 'b-hazardous' },
                  { id: `tr-5-${timestamp}`, nameKhmer: 'ស្លឹកឈើស្ងួត', icon: '🍂', correctBinId: 'b-organic' },
                  { id: `tr-6-${timestamp}`, nameKhmer: 'ថង់ប្លាស្ទិក', icon: '🛍️', correctBinId: 'b-plastic' },
                ]),
              },
            },
          },
        ],
      };
    }

    case 'game-14-teeth-challenge': {
      const questions = [
        { q: 'តើយើងគួរដុសធ្មេញយ៉ាងតិចប៉ុន្មានដងក្នុងមួយថ្ងៃ?', correct: 'យ៉ាងតិច ២ ដង (ព្រឹក និងមុនចូលគេង)', distractors: ['មួយសប្តាហ៍ម្ដង', 'ពេលណាឈឺទើបដុស', 'មិនបាច់ដុសទេ'], emoji: '🪥' },
        { q: 'តើអាហារប្រភេទណាដែលងាយធ្វើឲ្យពុកធ្មេញ?', correct: 'ស្ករគ្រាប់ និងភេសជ្ជៈផ្អែមជ្រុល', distractors: ['ទឹកដោះគោ និងបន្លែ', 'ត្រី និងស៊ុត', 'ផ្លែប៉ោម'], emoji: '🍬' },
      ];
      const cur = sample(questions);
      const opts = shuffle([
        { id: 't-cor', textKhmer: cur.correct, isCorrect: true, emoji: cur.emoji },
        ...cur.distractors.map((d, idx) => ({ id: `t-dist-${idx}`, textKhmer: d, isCorrect: false, emoji: '❌' })),
      ]);

      return {
        id: `teeth-challenge-${timestamp}`,
        titleKhmer: 'ធ្មេញរឹងមាំ',
        titleEnglish: 'Healthy Teeth Challenge',
        subject: 'science',
        gradeLevel: grade,
        instructionsKhmer: 'ឆ្លើយសំណួរអនាម័យមាត់ធ្មេញកម្ចាត់បាក់តេរីបង្កពុកធ្មេញ',
        instructionsEnglish: 'Brush away plaque bugs and practice dental hygiene',
        template: 'quiz_tap',
        metadata: { targetCompetency: 'អនាម័យមាត់ធ្មេញ', gameNumber: 14, classroomPin: seedPin },
        levels: [{ levelId: 1, promptText: cur.q, timeLimitSeconds: 20, gameplayData: { quizOptions: opts } }],
      };
    }

    // -----------------------------------------------------------------------
    // B. គណិតវិទ្យា (Math & Logic) — 14 Games
    // -----------------------------------------------------------------------
    case 'game-15-math-balloon': {
      let a = randInt(2, 9);
      let b = randInt(2, 9);
      let op = '+';
      let ans = a + b;

      if (grade === 2) {
        if (Math.random() > 0.5) {
          a = randInt(15, 45);
          b = randInt(10, 35);
          ans = a + b;
        } else {
          ans = randInt(10, 40);
          b = randInt(5, 25);
          a = ans + b;
          op = '-';
        }
      } else if (grade === 3) {
        op = '×';
        a = randInt(2, 8);
        b = randInt(2, 7);
        ans = a * b;
      }

      const distractors = shuffle([ans + 1, ans - 1, ans + 2, ans - 2]).slice(0, 3);
      const options = shuffle([
        { id: 'ans-cor', textKhmer: `${ans}`, isCorrect: true, emoji: '🎈' },
        ...distractors.map((d, idx) => ({ id: `ans-d-${idx}`, textKhmer: `${d}`, isCorrect: false, emoji: '🎈' })),
      ]);

      return {
        id: `math-balloon-${timestamp}`,
        titleKhmer: 'ពោងខ្យល់ប្រមាណវិធី',
        titleEnglish: 'Math Balloon Pop',
        subject: 'math',
        gradeLevel: grade,
        instructionsKhmer: `ចុចបំបែកពោងខ្យល់ដែលមានចម្លើយត្រឹមត្រូវនៃ ${a} ${op} ${b} = ?`,
        instructionsEnglish: 'Pop the balloon with the correct math result',
        template: 'quiz_tap',
        metadata: { targetCompetency: 'ប្រមាណវិធីគណិតវិទ្យា', gameNumber: 15, classroomPin: seedPin },
        levels: [{ levelId: 1, promptText: `តើ ${a} ${op} ${b} ស្មើនឹងប៉ុន្មាន? (${a} ${op} ${b} = ?)`, timeLimitSeconds: 20, gameplayData: { quizOptions: options } }],
      };
    }

    case 'game-16-market-cashier': {
      const priceChoices = [1200, 1500, 2400, 3500, 4800, 5500, 6700, 8500];
      const targetPrice = sample(priceChoices);
      const fruitNames = [
        { itemKhmer: 'ស្វាយកែវរមៀត', priceRiel: targetPrice, icon: '🥭' },
        { itemKhmer: 'ដូងក្រអូប', priceRiel: targetPrice, icon: '🥥' },
        { itemKhmer: 'មៀនប៉ៃលិន', priceRiel: targetPrice, icon: '🍇' },
        { itemKhmer: 'ត្រីងៀតទន្លេសាប', priceRiel: targetPrice, icon: '🐟' },
      ];
      const selected = sample(fruitNames);
      return {
        id: `market-cashier-${timestamp}`,
        titleKhmer: 'ផ្សារខ្មែរ (ប្រាក់រៀល)',
        titleEnglish: 'Cambodian Market Cashier',
        subject: 'math',
        gradeLevel: grade,
        instructionsKhmer: `ទូទាត់ប្រាក់ទិញ ${selected.itemKhmer} តម្លៃ ${targetPrice.toLocaleString()}៛ ដោយជ្រើសរើសក្រដាសប្រាក់រៀល`,
        instructionsEnglish: 'Pay exact Cambodian Riel banknotes (100៛, 500៛, 1000៛, 5000៛, 10000៛)',
        template: 'math_cra',
        engineType: 'math_cra',
        metadata: { targetCompetency: 'រូបិយវត្ថុជាតិប្រាក់រៀល', gameNumber: 16, classroomPin: seedPin },
        levels: [
          {
            levelId: 1,
            promptText: `អតិថិជនទិញ ${selected.itemKhmer} តម្លៃ ${targetPrice.toLocaleString()} រៀល។ សូមដាក់ក្រដាសប្រាក់រៀលឲ្យគ្រប់ចំនួន៖`,
            gameplayData: {
              mathCraData: {
                mode: 'market_cashier',
                targetTotal: targetPrice,
                billings: [selected],
                allowedBanknotes: [100, 500, 1000, 5000, 10000],
              },
            },
          },
        ],
      };
    }

    case 'game-17-khmer-counter': {
      const khmerDigits = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];
      const chosen = sampleN([1, 2, 3, 4, 5, 6, 7, 8, 9], 4);
      const pairs = chosen.map((num, idx) => ({
        id: `kc-${idx}-${timestamp}`,
        khmer: `លេខ ${khmerDigits[num]}`,
        matchId: `num-${num}`,
        image: `${num}`,
      }));

      return {
        id: `khmer-counter-${timestamp}`,
        titleKhmer: 'រាប់ផ្លែឈើខ្មែរ (០-៩)',
        titleEnglish: 'Khmer Number Counter',
        subject: 'math',
        gradeLevel: grade,
        instructionsKhmer: 'ផ្គូផ្គងលេខខ្មែរ (០-៩) ជាមួយលេខសកលឲ្យត្រូវគ្នា',
        instructionsEnglish: 'Match Khmer numerals (០-៩) to Arabic numerals',
        template: 'matching_cards',
        metadata: { targetCompetency: 'លេខខ្មែរ ០-៩', gameNumber: 17, classroomPin: seedPin },
        levels: [{ levelId: 1, promptText: 'ផ្គូផ្គងលេខខ្មែរ និងលេខសកលឲ្យត្រូវគ្នា៖', gameplayData: { pairs } }],
      };
    }

    case 'game-18-shape-hunter': {
      return {
        id: `shape-hunter-${timestamp}`,
        titleKhmer: 'ប្រមាញ់រូបធរណីមាត្រ',
        titleEnglish: 'Geometry Shape Spotter',
        subject: 'math',
        gradeLevel: grade,
        instructionsKhmer: 'បែងចែកវត្ថុប្រើប្រាស់ប្រចាំថ្ងៃទៅតាមទ្រង់ទ្រាយធរណីមាត្រ ២D និង ៣D',
        instructionsEnglish: 'Classify everyday items into Circle, Triangle, Rectangle, and Square',
        template: 'sorter',
        engineType: 'sorter',
        metadata: { targetCompetency: 'ធរណីមាត្រ ២D', gameNumber: 18, classroomPin: seedPin },
        levels: [
          {
            levelId: 1,
            promptText: 'ចាត់ថ្នាក់វត្ថុក្នុងបន្ទប់រៀនទៅតាមរូបធរណីមាត្រដែលត្រូវគ្នា៖',
            gameplayData: {
              sorterData: {
                mode: 'geometry_spotter',
                bounceBackOnError: true,
                bins: [
                  { id: 'b-circle', nameKhmer: 'រង្វង់ (Circle)', colorClass: 'from-amber-400 to-amber-500', icon: '🟡' },
                  { id: 'b-triangle', nameKhmer: 'ត្រីកោណ (Triangle)', colorClass: 'from-rose-500 to-rose-600', icon: '🔺' },
                  { id: 'b-rect', nameKhmer: 'ចតុកោណកែង (Rectangle)', colorClass: 'from-sky-500 to-sky-600', icon: '🚪' },
                  { id: 'b-square', nameKhmer: 'ការ៉េ (Square)', colorClass: 'from-emerald-500 to-emerald-600', icon: '🟩' },
                ],
                entities: shuffle([
                  { id: `sh-1-${timestamp}`, nameKhmer: 'នាឡិកាជញ្ជាំង', icon: '⏰', correctBinId: 'b-circle' },
                  { id: `sh-2-${timestamp}`, nameKhmer: 'ផ្លាកសញ្ញាចរាចរណ៍', icon: '⚠️', correctBinId: 'b-triangle' },
                  { id: `sh-3-${timestamp}`, nameKhmer: 'ក្តារខៀនសាលា', icon: '📋', correctBinId: 'b-rect' },
                  { id: `sh-4-${timestamp}`, nameKhmer: 'កន្សែងការ៉េ', icon: '🟩', correctBinId: 'b-square' },
                  { id: `sh-5-${timestamp}`, nameKhmer: 'កាក់ប្រាក់រង្វង់', icon: '🪙', correctBinId: 'b-circle' },
                  { id: `sh-6-${timestamp}`, nameKhmer: 'បន្ទាត់ត្រីកោណ', icon: '📐', correctBinId: 'b-triangle' },
                ]),
              },
            },
          },
        ],
      };
    }

    case 'game-19-balance-scale': {
      const target = randInt(7, 16);
      const known = randInt(2, target - 2);
      const missing = target - known;
      return {
        id: `balance-scale-${timestamp}`,
        titleKhmer: 'ជញ្ជីងថ្លឹងស្មើ',
        titleEnglish: 'Dual-Pan Balance Scale',
        subject: 'math',
        gradeLevel: grade,
        instructionsKhmer: `ដាក់ទម្ងន់ចូលក្នុងប្រអប់អាថ៌កំបាំង (▢) លើជញ្ជីងខាងឆ្វេងដើម្បីឲ្យស្មើ ${target}kg ខាងស្តាំ`,
        instructionsEnglish: 'Level the dual-pan beam balance scale by matching torque physics',
        template: 'math_cra',
        engineType: 'math_cra',
        metadata: { targetCompetency: 'សមភាពនៃចំនួន និងពិជគណិតបឋម', gameNumber: 19, classroomPin: seedPin },
        levels: [
          {
            levelId: 1,
            promptText: `ជញ្ជីងខាងឆ្វេងមាន ${known}kg + ▢ ។ ខាងស្តាំមាន ${target}kg ។ តើត្រូវថែមទម្ងន់ប៉ុន្មានដើម្បីឲ្យជញ្ជីងស្មើគ្នា?`,
            gameplayData: {
              mathCraData: {
                mode: 'balance_scale',
                leftPanWeights: [known],
                rightPanTarget: target,
                mysteryBoxValue: missing,
                initialEquation: `${known} + ▢ = ${target}`,
              },
            },
          },
        ],
      };
    }

    case 'game-20-clock-master': {
      const targetHour = randInt(1, 11);
      const targetMin = sample([0, 15, 30, 45]);
      const minText = targetMin === 0 ? '០០ គត់' : `${targetMin} នាទី`;
      return {
        id: `clock-master-${timestamp}`,
        titleKhmer: 'នាឡិកាឆ្លាត',
        titleEnglish: 'Interactive Clockwork',
        subject: 'math',
        gradeLevel: grade,
        instructionsKhmer: `បង្វិលទ្រនិចនាឡិកាឲ្យចំម៉ោង «${targetHour}:${targetMin.toString().padStart(2, '0')}» (${targetHour} ម៉ោង ${minText})`,
        instructionsEnglish: 'Drag the minute hand linked with a 12:1 gear ratio to target time',
        template: 'math_cra',
        engineType: 'math_cra',
        metadata: { targetCompetency: 'ការអានម៉ោង និងពេលវេលា', gameNumber: 20, classroomPin: seedPin },
        levels: [
          {
            levelId: 1,
            promptText: `បង្វិលទ្រនិចនាឡិកាឲ្យត្រូវនឹងម៉ោង «${targetHour}:${targetMin.toString().padStart(2, '0')}»៖`,
            gameplayData: {
              mathCraData: {
                mode: 'clockwork',
                targetTime: {
                  hour: targetHour,
                  minute: targetMin,
                  labelKhmer: `ម៉ោង ${targetHour}:${targetMin.toString().padStart(2, '0')}`,
                },
              },
            },
          },
        ],
      };
    }

    case 'game-21-number-train': {
      const step = sample([2, 5, 10]);
      const start = randInt(1, 4) * step;
      const sequence = [start, start + step, start + step * 2, start + step * 3];

      return {
        id: `number-train-${timestamp}`,
        titleKhmer: `រថភ្លើងលេខរៀង (រាប់ឡើងម្ដង ${step})`,
        titleEnglish: 'Number Train Skip-Counting',
        subject: 'math',
        gradeLevel: grade,
        instructionsKhmer: 'តម្រៀបទូរថភ្លើងតាមលំដាប់កើនឡើងពីតូចទៅធំ',
        instructionsEnglish: 'Sequence skip-counting train wagons',
        template: 'sequencer',
        metadata: { targetCompetency: 'លំដាប់ចំនួនកើនឡើង', gameNumber: 21, classroomPin: seedPin },
        levels: [{
          levelId: 1,
          promptText: `តម្រៀបទូរថភ្លើងតាមលំដាប់កើន (រាប់ម្ដង ${step})៖`,
          gameplayData: {
            items: sequence.map((num, idx) => ({
              id: `nt-${idx}-${timestamp}`,
              labelKhmer: `ទូទី ${idx + 1}៖ លេខ ${num}`,
              imageOrIcon: '🚃',
              correctCategoryOrOrder: idx + 1,
            })),
          },
        }],
      };
    }

    case 'game-22-ruler-measure': {
      const length = randInt(4, 12);
      const items = ['ខ្មៅដៃ', 'បន្ទាត់ជ័រ', 'ជ័រលុប', 'សៀវភៅកត់ត្រា'];
      const curItem = sample(items);
      const distractors = shuffle([length - 2, length + 2, length + 4]);
      const options = shuffle([
        { id: 'r-cor', textKhmer: `${length} សង់ទីម៉ែត្រ (cm)`, isCorrect: true, emoji: '📏' },
        ...distractors.map((d, idx) => ({ id: `r-d-${idx}`, textKhmer: `${d} សង់ទីម៉ែត្រ (cm)`, isCorrect: false, emoji: '📏' })),
      ]);

      return {
        id: `ruler-measure-${timestamp}`,
        titleKhmer: 'វាស់ប្រវែងបន្ទាត់',
        titleEnglish: 'Ruler Measurement',
        subject: 'math',
        gradeLevel: grade,
        instructionsKhmer: `អានប្រវែង${curItem}លើបន្ទាត់ជាសង់ទីម៉ែត្រ (cm)`,
        instructionsEnglish: 'Measure objects using a centimeter ruler',
        template: 'quiz_tap',
        metadata: { targetCompetency: 'រង្វាស់ប្រវែងសង់ទីម៉ែត្រ', gameNumber: 22, classroomPin: seedPin },
        levels: [{
          levelId: 1,
          promptText: `${curItem}ចាប់ផ្ដើមពី 0cm ដល់ ${length}cm។ តើ${curItem}មានប្រវែងប៉ុន្មាន?`,
          timeLimitSeconds: 20,
          gameplayData: { quizOptions: options },
        }],
      };
    }

    case 'game-23-alligator-inequalities': {
      const num1 = randInt(10, 30);
      const num2 = randInt(10, 30);
      let corSign = '=';
      let signText = `${num1} = ${num2} (ស្មើគ្នា)`;
      if (num1 > num2) {
        corSign = '>';
        signText = `${num1} > ${num2} (ធំជាង)`;
      } else if (num1 < num2) {
        corSign = '<';
        signText = `${num1} < ${num2} (តូចជាង)`;
      }

      return {
        id: `alligator-inequalities-${timestamp}`,
        titleKhmer: 'ប្រៀបធៀបធំជាង តូចជាង (> < =)',
        titleEnglish: 'Alligator Inequalities',
        subject: 'math',
        gradeLevel: grade,
        instructionsKhmer: 'ជ្រើសរើសសញ្ញា (> < =) ឲ្យក្រពើត្របាក់យកចំនួនធំជាង',
        instructionsEnglish: 'Evaluate inequalities with alligator mouth',
        template: 'quiz_tap',
        metadata: { targetCompetency: 'ការប្រៀបធៀបចំនួន', gameNumber: 23, classroomPin: seedPin },
        levels: [{
          levelId: 1,
          promptText: `ប្រៀបធៀបចំនួន៖ ${num1} [...] ${num2}?`,
          timeLimitSeconds: 20,
          gameplayData: {
            quizOptions: [
              { id: 'cor', textKhmer: signText, isCorrect: true, emoji: '🐊' },
              { id: 'w1', textKhmer: `${num1} ${corSign === '>' ? '<' : '>'} ${num2}`, isCorrect: false, emoji: '🐊' },
              { id: 'w2', textKhmer: `${num1} = ${num2} (ស្មើគ្នា)`, isCorrect: corSign === '=', emoji: '🐊' },
            ],
          },
        }],
      };
    }

    case 'game-24-fraction-slicer': {
      const fracChoices = [
        { denom: 2, label: 'កន្លះចំណិត (១/២)' },
        { denom: 3, label: 'មួយភាគបី (១/៣)' },
        { denom: 4, label: 'មួយភាគបួន (១/៤)' },
      ];
      const chosen = sample(fracChoices);
      return {
        id: `fraction-slicer-${timestamp}`,
        titleKhmer: 'ប្រភាគនំប្រពៃណីខ្មែរ',
        titleEnglish: 'Fraction Slicer',
        subject: 'math',
        gradeLevel: grade,
        instructionsKhmer: `កាត់នំជា ${chosen.denom} ចំណិតស្មើគ្នា ហើយចុចជ្រើសរើស ១ ចំណិត (${chosen.label})`,
        instructionsEnglish: 'Slice traditional Num Ansom or watermelon into fractional parts',
        template: 'math_cra',
        engineType: 'math_cra',
        metadata: { targetCompetency: 'ប្រភាគបឋម', gameNumber: 24, classroomPin: seedPin },
        levels: [
          {
            levelId: 1,
            promptText: `កាត់នំជា ${chosen.denom} ចំណិត រួចជ្រើសរើសយក ១ ចំណិត ដើម្បីបានប្រភាគ «${chosen.label}»៖`,
            gameplayData: {
              mathCraData: {
                mode: 'fraction_cutter',
                targetFraction: {
                  numerator: 1,
                  denominator: chosen.denom,
                  labelKhmer: chosen.label,
                },
              },
            },
          },
        ],
      };
    }

    case 'game-25-bar-chart': {
      const catA = randInt(4, 8);
      const catB = randInt(2, 5);
      const catC = randInt(1, 3);
      return {
        id: `bar-chart-${timestamp}`,
        titleKhmer: 'តារាងទិន្នន័យសត្វចិញ្ចឹម',
        titleEnglish: 'Bar Chart Builder',
        subject: 'math',
        gradeLevel: grade,
        instructionsKhmer: 'អានក្រាហ្វសសរដើម្បីឆ្លើយសំណួរទិន្នន័យ',
        instructionsEnglish: 'Interpret bar graphs based on surveyed quantities',
        template: 'quiz_tap',
        metadata: { targetCompetency: 'ក្រាហ្វ និងស្ថិតិបឋម', gameNumber: 25, classroomPin: seedPin },
        levels: [{
          levelId: 1,
          promptText: `ក្នុងថ្នាក់មានសិស្សចិញ្ចឹមឆ្មា ${catA} នាក់ ឆ្កែ ${catB} នាក់ និងត្រី ${catC} នាក់។ តើសត្វណាមានច្រើនជាងគេ?`,
          timeLimitSeconds: 20,
          gameplayData: {
            quizOptions: [
              { id: 'bc-cat', textKhmer: `សត្វឆ្មា (${catA} នាក់)`, isCorrect: true, emoji: '🐱' },
              { id: 'bc-dog', textKhmer: `សត្វឆ្កែ (${catB} នាក់)`, isCorrect: false, emoji: '🐶' },
              { id: 'bc-fish', textKhmer: `សត្វត្រី (${catC} នាក់)`, isCorrect: false, emoji: '🐠' },
            ],
          },
        }],
      };
    }

    case 'game-26-number-line': {
      const opA = randInt(2, 6);
      const opB = randInt(2, 6);
      return {
        id: `number-line-${timestamp}`,
        titleKhmer: 'កង្កែបលោតលើបន្ទាត់ចំនួន',
        titleEnglish: 'Number Line Frog Hopper',
        subject: 'math',
        gradeLevel: grade,
        instructionsKhmer: `ចុចប៊ូតុងលោតឲ្យកង្កែបផ្លោះតាមគន្លងធ្នូ ដើម្បីដោះស្រាយ ${opA} + ${opB} = ?`,
        instructionsEnglish: 'Hop along the number line with parabolic jump arcs to reach target sum',
        template: 'math_cra',
        engineType: 'math_cra',
        metadata: { targetCompetency: 'បន្ទាត់ចំនួន និងប្រមាណវិធីបូក', gameNumber: 26, classroomPin: seedPin },
        levels: [
          {
            levelId: 1,
            promptText: `ជួយកូនកង្កែបលោតពី 0 ទៅមុខ ${opA} ជំហាន រួចបន្ត ${opB} ជំហានទៀត (${opA} + ${opB} = ?)៖`,
            gameplayData: {
              mathCraData: {
                mode: 'frog_hopper',
                operandA: opA,
                operandB: opB,
                operation: 'add',
                numberLineStart: 0,
                numberLineEnd: 20,
              },
            },
          },
        ],
      };
    }

    case 'game-27-pattern-detective': {
      const patterns = [
        { name: 'លំនាំ 🔴 🔵', items: [{ l: '១. រង្វង់ក្រហម', i: '🔴', o: 1 }, { l: '២. រង្វង់ខៀវ', i: '🔵', o: 2 }, { l: '៣. រង្វង់ក្រហម', i: '🔴', o: 3 }, { l: '៤. រង្វង់ខៀវ', i: '🔵', o: 4 }] },
        { name: 'លំនាំ 🟡 🟢', items: [{ l: '១. ផ្កាលឿង', i: '🟡', o: 1 }, { l: '២. ស្លឹកបៃតង', i: '🟢', o: 2 }, { l: '៣. ផ្កាលឿង', i: '🟡', o: 3 }, { l: '៤. ស្លឹកបៃតង', i: '🟢', o: 4 }] },
      ];
      const cur = sample(patterns);
      return {
        id: `pattern-detective-${timestamp}`,
        titleKhmer: 'ទាយលំនាំរូបភាព',
        titleEnglish: 'Pattern Detective',
        subject: 'math',
        gradeLevel: grade,
        instructionsKhmer: 'បំពេញរូបរាងបន្ទាប់ក្នុងលំនាំស្ទួន',
        instructionsEnglish: 'Complete repeating patterns',
        template: 'sequencer',
        metadata: { targetCompetency: 'លំនាំរូបធរណីមាត្រ', gameNumber: 27, classroomPin: seedPin },
        levels: [{
          levelId: 1,
          promptText: 'តម្រៀបលំនាំឆ្លាស់ឲ្យបានត្រឹមត្រូវ៖',
          gameplayData: {
            items: cur.items.map((item, idx) => ({ id: `p-${idx}-${timestamp}`, labelKhmer: item.l, imageOrIcon: item.i, correctCategoryOrOrder: item.o })),
          },
        }],
      };
    }

    case 'game-28-fair-share': {
      const baskets = sample([2, 3]);
      const perBasket = randInt(2, 4);
      const remainder = sample([0, 1]);
      const total = baskets * perBasket + remainder;
      const fruits = ['🫐', '🍬', '🍎', '🍊'];
      const fruitEmoji = sample(fruits);
      return {
        id: `fair-share-${timestamp}`,
        titleKhmer: 'ចែកផ្លែឈើស្មើគ្នា (វិធីចែក)',
        titleEnglish: 'Fair-Share Physical Division',
        subject: 'math',
        gradeLevel: grade,
        instructionsKhmer: `ចែក ${fruitEmoji} ចំនួន ${total} ផ្លែ ចូលក្នុងកន្ត្រកទាំង ${baskets} ឲ្យបានស្មើៗគ្នា`,
        instructionsEnglish: 'Drag items one by one into woven bamboo baskets to compute quotient and remainder',
        template: 'math_cra',
        engineType: 'math_cra',
        metadata: { targetCompetency: 'វិធីចែកស្មើគ្នា និងសំណល់', gameNumber: 28, classroomPin: seedPin },
        levels: [
          {
            levelId: 1,
            promptText: `ចែក ${fruitEmoji} ចំនួន ${total} ផ្លែ ស្មើៗគ្នាចូលក្នុងកន្ត្រក ${baskets} (ម្នាក់ទទួលបាន ${perBasket} ផ្លែ${remainder > 0 ? ` នៅសល់ ${remainder}` : ''})៖`,
            gameplayData: {
              mathCraData: {
                mode: 'fair_share',
                totalItemsCount: total,
                basketsCount: baskets,
                itemEmoji: fruitEmoji,
              },
            },
          },
        ],
      };
    }

    // -----------------------------------------------------------------------
    // C. ភាសាខ្មែរ (Khmer Language & Literacy) — 14 Games
    // -----------------------------------------------------------------------
    case 'game-29-vowel-catcher': {
      const words = [
        { base: 'ត', vowel: 'ា', word: 'តា' },
        { base: 'ខ', vowel: 'ំ', word: 'ខំ' },
        { base: 'ក', vowel: 'ៅ', word: 'កៅ' },
        { base: 'ម', vowel: 'ាស', word: 'មាស' },
      ];
      const cur = sample(words);
      return {
        id: `vowel-catcher-${timestamp}`,
        titleKhmer: `ប្រកបស្រៈ «${cur.word}»`,
        titleEnglish: 'Khmer Vowel Catcher',
        subject: 'khmer',
        gradeLevel: grade,
        instructionsKhmer: `ផ្គុំព្យញ្ជនៈ ${cur.base} និងស្រៈដើម្បីបង្កើតពាក្យ «${cur.word}»`,
        instructionsEnglish: 'Catch vowels and blend words',
        template: 'sentence_builder',
        metadata: { targetCompetency: 'ស្រៈនិស្ស័យខ្មែរ', gameNumber: 29, classroomPin: seedPin },
        levels: [{
          levelId: 1,
          promptText: `ផ្គុំព្យញ្ជនៈ និងស្រៈដើម្បីបង្កើតពាក្យ «${cur.word}»៖`,
          gameplayData: {
            tiles: [
              { id: 'v1', textKhmer: cur.base, order: 1 },
              { id: 'v2', textKhmer: cur.vowel, order: 2 },
            ],
          },
        }],
      };
    }

    case 'game-30-consonant-subscript': {
      const syllables = [
        { word: 'ក្រូច', base: 'ក', sub: '្រ', vowel: 'ូច', meaning: 'ផ្លែក្រូចផ្អែមឆ្ងាញ់', img: '🍊' },
        { word: 'ត្រី', base: 'ត', sub: '្រ', vowel: 'ី', meaning: 'ត្រីរស់នៅក្នុងទឹក', img: '🐟' },
        { word: 'ផ្កា', base: 'ផ', sub: '្ក', vowel: 'ា', meaning: 'ផ្ការីកស្រស់ស្អាត', img: '🌸' },
        { word: 'ខ្លា', base: 'ខ', sub: '្ល', vowel: 'ា', meaning: 'សត្វខ្លាធំកាច', img: '🐯' },
      ];
      const cur = sample(syllables);
      return {
        id: `consonant-subscript-${timestamp}`,
        titleKhmer: `រោងចក្រផ្គុំព្យាង្គ «${cur.word}»`,
        titleEnglish: 'Khmer Syllable Constructor',
        subject: 'khmer',
        gradeLevel: grade,
        instructionsKhmer: `ផ្គុំព្យញ្ជនៈដើម + ជើងអក្សរ + ស្រៈនិស្ស័យ ដើម្បីបង្កើតពាក្យ «${cur.word}»`,
        instructionsEnglish: 'Snap base consonant, subscript foot, and dependent vowel into the orthographic grid',
        template: 'khmer_phonetics',
        engineType: 'khmer_phonetics',
        metadata: { targetCompetency: 'ជើងព្យញ្ជនៈ និងការផ្គុំព្យាង្គ', gameNumber: 30, classroomPin: seedPin },
        levels: [
          {
            levelId: 1,
            promptText: `ជ្រើសរើស ព្យញ្ជនៈដើម, ជើងអក្សរ, និងស្រៈ ដើម្បីផ្គុំជាពាក្យ «${cur.word}»៖`,
            gameplayData: {
              khmerPhoneticsData: {
                mode: 'syllable_constructor',
                targetWordKhmer: cur.word,
                targetWordMeaning: cur.meaning,
                targetWordImage: cur.img,
                correctBase: cur.base,
                correctSubscript: cur.sub,
                correctVowel: cur.vowel,
                baseConsonants: ['ក', 'ខ', 'ត', 'ផ', 'ស', 'ច'],
                subscripts: ['្រ', '្ល', '្ក', '្ម', '្ត'],
                vowels: ['ា', 'ី', 'ូច', 'ៅ', 'ុំ', 'េះ'],
              },
            },
          },
        ],
      };
    }

    case 'game-31-picture-sentence': {
      const sentenceOptions = [
        {
          s: { textKhmer: 'កូនសិស្ស', image: '👦' },
          v: { textKhmer: 'អាន', image: '📖' },
          o: { textKhmer: 'សៀវភៅ', image: '📚' },
          d: [{ id: 'd1', textKhmer: 'រត់លេង', role: 'verb' as const }, { id: 'd2', textKhmer: 'ផ្លែប៉ោម', role: 'object' as const }],
        },
        {
          s: { textKhmer: 'កូនឆ្មា', image: '🐱' },
          v: { textKhmer: 'ញ៉ាំ', image: '🍽️' },
          o: { textKhmer: 'ត្រីអាំង', image: '🐟' },
          d: [{ id: 'd1', textKhmer: 'ដេកលើ', role: 'verb' as const }, { id: 'd2', textKhmer: 'កង់', role: 'object' as const }],
        },
        {
          s: { textKhmer: 'ប្អូនស្រី', image: '👧' },
          v: { textKhmer: 'ស្រោច', image: '🚿' },
          o: { textKhmer: 'ផ្កាឈូក', image: '🪷' },
          d: [{ id: 'd1', textKhmer: 'ទិញ', role: 'verb' as const }, { id: 'd2', textKhmer: 'សាលារៀន', role: 'object' as const }],
        },
      ];
      const cur = sample(sentenceOptions);
      const allCards = shuffle([
        { id: `s-${timestamp}`, textKhmer: cur.s.textKhmer, role: 'subject' as const, image: cur.s.image },
        { id: `v-${timestamp}`, textKhmer: cur.v.textKhmer, role: 'verb' as const, image: cur.v.image },
        { id: `o-${timestamp}`, textKhmer: cur.o.textKhmer, role: 'object' as const, image: cur.o.image },
        ...cur.d.map((dist, idx) => ({ id: `dist-${idx}-${timestamp}`, textKhmer: dist.textKhmer, role: dist.role })),
      ]);
      return {
        id: `picture-sentence-${timestamp}`,
        titleKhmer: 'រថភ្លើងវេយ្យាករណ៍ (SVO)',
        titleEnglish: 'SVO Syntax Rail',
        subject: 'khmer',
        gradeLevel: grade,
        instructionsKhmer: 'ដាក់ពាក្យចូលក្នុងទូរថភ្លើងតាមលំដាប់៖ ប្រធាន (ខៀវ) + កិរិយា (បៃតង) + កម្មបទ (ទឹកក្រូច)',
        instructionsEnglish: 'Assemble Subject (Blue), Verb (Green), and Object (Orange) syntax wagons',
        template: 'khmer_phonetics',
        engineType: 'khmer_phonetics',
        metadata: { targetCompetency: 'រចនាសម្ព័ន្ធល្បះ ស.ក.ក', gameNumber: 31, classroomPin: seedPin },
        levels: [
          {
            levelId: 1,
            promptText: `តម្រៀបល្បះ៖ «${cur.s.textKhmer} ${cur.v.textKhmer} ${cur.o.textKhmer}» លើទូរថភ្លើង SVO៖`,
            gameplayData: {
              khmerPhoneticsData: {
                mode: 'svo_rail',
                svoSlots: {
                  subject: cur.s,
                  verb: cur.v,
                  object: cur.o,
                },
                availableSvoCards: allCards,
              },
            },
          },
        ],
      };
    }

    case 'game-32-cloze-runner': {
      const clozeList = [
        { sentence: 'សុភាទន្សាយជាសត្វមាន[...]វាងវៃ និងពូកែជួយដោះស្រាយបញ្ហា។', correct: 'ប្រាជ្ញា', distractors: ['ខ្ជិលច្រអូស', 'យឺតយ៉ាវ'] },
        { sentence: 'ព្រះអាទិត្យរះនៅពេលព្រឹកជួយផ្ដល់[...]ដល់មនុស្ស និងរុក្ខជាតិ។', correct: 'ពន្លឺ', distractors: ['ទឹកភ្លៀង', 'ភាពងងឹត'] },
      ];
      const cur = sample(clozeList);
      return {
        id: `cloze-runner-${timestamp}`,
        titleKhmer: 'បំពេញចន្លោះ',
        titleEnglish: 'Cloze Passage Runner',
        subject: 'khmer',
        gradeLevel: grade,
        instructionsKhmer: 'ជ្រើសរើសពាក្យត្រឹមត្រូវដើម្បីបំពេញចន្លោះក្នុងល្បះ',
        instructionsEnglish: 'Fill in the missing words in passages',
        template: 'quiz_tap',
        metadata: { targetCompetency: 'ការយល់ដឹងអត្ថបទអាន', gameNumber: 32, classroomPin: seedPin },
        levels: [{
          levelId: 1,
          promptText: cur.sentence,
          timeLimitSeconds: 20,
          gameplayData: {
            quizOptions: shuffle([
              { id: 'cl-cor', textKhmer: cur.correct, isCorrect: true, emoji: '💡' },
              ...cur.distractors.map((d, idx) => ({ id: `cl-d-${idx}`, textKhmer: d, isCorrect: false, emoji: '❌' })),
            ]),
          },
        }],
      };
    }

    case 'game-33-word-memory': {
      const vocabList = [
        { kh: 'ផ្កាឈូក', match: 'lotus', img: '🪷 ផ្កាឈូក' },
        { kh: 'សត្វដំរី', match: 'elephant', img: '🐘 ដំរី' },
        { kh: 'ព្រះអាទិត្យ', match: 'sun', img: '☀️ ព្រះអាទិត្យ' },
        { kh: 'ផ្ទះខ្មែរ', match: 'house', img: '🏠 ផ្ទះ' },
      ];
      return {
        id: `word-memory-${timestamp}`,
        titleKhmer: 'ផ្គូផ្គងរូប និងពាក្យ',
        titleEnglish: 'Picture-Word Memory',
        subject: 'khmer',
        gradeLevel: grade,
        instructionsKhmer: 'បើកសន្លឹកបៀដើម្បីផ្គូផ្គងរូបភាពជាមួយពាក្យខ្មែរ',
        instructionsEnglish: 'Flip cards to match vocabulary and images',
        template: 'matching_cards',
        metadata: { targetCompetency: 'វាក្យសព្ទ និងរូបភាព', gameNumber: 33, classroomPin: seedPin },
        levels: [{
          levelId: 1,
          promptText: 'ផ្គូផ្គងរូបភាព និងពាក្យខ្មែរឲ្យត្រូវគ្នា៖',
          gameplayData: {
            pairs: vocabList.map(v => ({ id: v.match, khmer: v.kh, matchId: v.match, image: v.img })),
          },
        }],
      };
    }

    case 'game-34-series-o-sorter': {
      return {
        id: `series-o-sorter-${timestamp}`,
        titleKhmer: 'សំឡេងពួក អ និងពួក អ៊',
        titleEnglish: 'Consonant Series Conveyor',
        subject: 'khmer',
        gradeLevel: grade,
        instructionsKhmer: 'បែងចែកព្យញ្ជនៈដែលរត់តាមខ្សែពាន ចូលក្នុងស្គរសំឡេង ពួក អ (A-Series) ឬ ពួក អ៊ (O-Series)',
        instructionsEnglish: 'Sort conveyor consonants into resonant drums for Series O vs Series OR',
        template: 'khmer_phonetics',
        engineType: 'khmer_phonetics',
        metadata: { targetCompetency: 'ពួកព្យញ្ជនៈ អ និង អ៊', gameNumber: 34, classroomPin: seedPin },
        levels: [
          {
            levelId: 1,
            promptText: 'ចុចជ្រើសរើសស្គរសំឡេង ពួក អ ឬ ពួក អ៊ សម្រាប់តួអក្សរនីមួយៗលើខ្សែពាន៖',
            gameplayData: {
              khmerPhoneticsData: {
                mode: 'phonetic_drum',
                conveyorConsonants: shuffle([
                  { id: `c-1-${timestamp}`, consonant: 'ក', register: 'series_o' },
                  { id: `c-2-${timestamp}`, consonant: 'ខ', register: 'series_o' },
                  { id: `c-3-${timestamp}`, consonant: 'គ', register: 'series_or' },
                  { id: `c-4-${timestamp}`, consonant: 'ឃ', register: 'series_or' },
                  { id: `c-5-${timestamp}`, consonant: 'ច', register: 'series_o' },
                  { id: `c-6-${timestamp}`, consonant: 'ជ', register: 'series_or' },
                  { id: `c-7-${timestamp}`, consonant: 'ទ', register: 'series_or' },
                  { id: `c-8-${timestamp}`, consonant: 'ត', register: 'series_o' },
                ]),
              },
            },
          },
        ],
      };
    }

    case 'game-35-antonym-match': {
      const antonyms = [
        { kh: 'ធំ (Big)', match: 'm1', opp: 'តូច (Small)' },
        { kh: 'ខ្ពស់ (Tall)', match: 'm2', opp: 'ទាប (Short)' },
        { kh: 'ឆ្ងាយ (Far)', match: 'm3', opp: 'ជិត (Near)' },
        { kh: 'ស (White)', match: 'm4', opp: 'ខ្មៅ (Black)' },
      ];
      return {
        id: `antonym-match-${timestamp}`,
        titleKhmer: 'ពាក្យផ្ទុយ',
        titleEnglish: 'Khmer Antonym Match-Up',
        subject: 'khmer',
        gradeLevel: grade,
        instructionsKhmer: 'ផ្គូផ្គងពាក្យផ្ទុយន័យគ្នា',
        instructionsEnglish: 'Pair opposite Khmer vocabulary terms',
        template: 'matching_cards',
        metadata: { targetCompetency: 'ពាក្យផ្ទុយន័យ', gameNumber: 35, classroomPin: seedPin },
        levels: [{
          levelId: 1,
          promptText: 'ផ្គូផ្គងពាក្យផ្ទុយន័យគ្នា៖',
          gameplayData: {
            pairs: antonyms.map(a => ({ id: a.match, khmer: a.kh, matchId: a.match, image: a.opp })),
          },
        }],
      };
    }

    case 'game-36-whack-a-mole': {
      const spellings = [
        { cor: 'សាលារៀន', wrong: ['សាលារៀណ', 'សារលារៀន', 'សាលារៀន់'] },
        { cor: 'កុមារ', wrong: ['គុមារ', 'កុមាល', 'កុម្មារ'] },
        { cor: 'សៀវភៅ', wrong: ['សៀវភៅរ', 'សៀវភៅ៍', 'សាវភៅ'] },
      ];
      const cur = sample(spellings);
      return {
        id: `whack-a-mole-${timestamp}`,
        titleKhmer: 'វាយពាក្យត្រូវ',
        titleEnglish: 'Khmer Word Whack',
        subject: 'khmer',
        gradeLevel: grade,
        instructionsKhmer: 'ចុចជ្រើសរើសពាក្យដែលសរសេរអក្ខរាវិរុទ្ធបានត្រឹមត្រូវ',
        instructionsEnglish: 'Whack correctly spelled words',
        template: 'quiz_tap',
        metadata: { targetCompetency: 'អក្ខរាវិរុទ្ធខ្មែរ', gameNumber: 36, classroomPin: seedPin },
        levels: [{
          levelId: 1,
          promptText: 'តើពាក្យមួយណាដែលសរសេរត្រឹមត្រូវតាមវចនានុក្រម?',
          timeLimitSeconds: 20,
          gameplayData: {
            quizOptions: shuffle([
              { id: 'wm-cor', textKhmer: `${cur.cor} ✅`, isCorrect: true, emoji: '🔨' },
              ...cur.wrong.map((w, idx) => ({ id: `wm-w-${idx}`, textKhmer: `${w} ❌`, isCorrect: false, emoji: '🕳️' })),
            ]),
          },
        }],
      };
    }

    case 'game-37-silent-marker': {
      return {
        id: `silent-marker-${timestamp}`,
        titleKhmer: 'អ្នកស៊ើបអង្កេតទណ្ឌឃាត (៍)',
        titleEnglish: 'Silent Marker Detective',
        subject: 'khmer',
        gradeLevel: grade,
        instructionsKhmer: 'ចុចដាក់សញ្ញាទណ្ឌឃាត (៍) លើព្យញ្ជនៈកម្ចីដែលមិនបញ្ចេញសំឡេង',
        instructionsEnglish: 'Identify and mark silent consonants in Pali/Sanskrit loanwords with ៍',
        template: 'khmer_phonetics',
        engineType: 'khmer_phonetics',
        metadata: { targetCompetency: 'សញ្ញាវណ្ណយុត្តិ ទណ្ឌឃាត (៍)', gameNumber: 37, classroomPin: seedPin },
        levels: [
          {
            levelId: 1,
            promptText: 'រកមើលតួអក្សរស្ងាត់ (មិនបញ្ចេញសំឡេង) ដើម្បីដាក់សញ្ញាទណ្ឌឃាត (៍)៖',
            gameplayData: {
              khmerPhoneticsData: {
                mode: 'silent_marker',
                wordsWithSilentConsonant: [
                  { id: `sm-1-${timestamp}`, wordKhmer: 'ទូរទស្សន៍', letters: ['ទូ', 'រ', 'ទ', 'ស្ស', 'ន'], silentIndex: 4, meaningKhmer: 'ឧបករណ៍បញ្ចាំងរូបភាព និងសំឡេង' },
                  { id: `sm-2-${timestamp}`, wordKhmer: 'អាទិត្យ', letters: ['អា', 'ទិ', 'ត', 'យ'], silentIndex: 3, meaningKhmer: 'ព្រះអាទិត្យ ឬថ្ងៃអាទិត្យ' },
                  { id: `sm-3-${timestamp}`, wordKhmer: 'វេជ្ជបណ្ឌិត', letters: ['វេ', 'ជ្ជ', 'ប', 'ណ្ឌិ', 'ត'], silentIndex: 4, meaningKhmer: 'គ្រូពេទ្យព្យាបាលជំងឺ' },
                ],
              },
            },
          },
        ],
      };
    }

    case 'game-38-blended-clusters': {
      const clusters = [
        { parts: ['ស', '្ម', 'ៅ'], word: 'ស្មៅ' },
        { parts: ['ផ', '្ក', 'ា'], word: 'ផ្កា' },
        { parts: ['ខ', '្ល', 'ា'], word: 'ខ្លា' },
      ];
      const cur = sample(clusters);
      return {
        id: `blended-clusters-${timestamp}`,
        titleKhmer: `អក្សរផ្ញើជើង «${cur.word}»`,
        titleEnglish: 'Blended Cluster Explorer',
        subject: 'khmer',
        gradeLevel: grade,
        instructionsKhmer: `ផ្គុំព្យញ្ជនៈផ្ញើជើងបង្កើតជាពាក្យ «${cur.word}»`,
        instructionsEnglish: 'Build blended consonant cluster words',
        template: 'sentence_builder',
        metadata: { targetCompetency: 'ព្យញ្ជនៈផ្ញើជើង', gameNumber: 38, classroomPin: seedPin },
        levels: [{
          levelId: 1,
          promptText: `ផ្គុំពាក្យ «${cur.word}» ដោយប្រើព្យញ្ជនៈផ្ញើជើង៖`,
          gameplayData: {
            tiles: cur.parts.map((p, idx) => ({ id: `bc-${idx}`, textKhmer: p, order: idx + 1 })),
          },
        }],
      };
    }

    case 'game-39-grammar-chest': {
      const gPool = [
        { word: 'សៀវភៅ', cat: 'noun' },
        { word: 'កូនសិស្ស', cat: 'noun' },
        { word: 'រត់លឿន', cat: 'verb' },
        { word: 'សរសេរ', cat: 'verb' },
        { word: 'ស្រស់ស្អាត', cat: 'adj' },
        { word: 'ផ្អែមឆ្ងាញ់', cat: 'adj' },
      ];
      const selected = sampleN(gPool, 6).map((item, idx) => ({
        id: `g-${idx}-${timestamp}`,
        labelKhmer: item.word,
        imageOrIcon: item.cat === 'noun' ? '📖' : item.cat === 'verb' ? '🏃' : '✨',
        correctCategoryOrOrder: item.cat,
      }));

      return {
        id: `grammar-chest-${timestamp}`,
        titleKhmer: 'ឃ្លាំងពាក្យ នាម កិរិយា គុណនាម',
        titleEnglish: 'Noun / Verb Sorter',
        subject: 'khmer',
        gradeLevel: grade,
        instructionsKhmer: 'បែងចែកពាក្យចូលក្នុងហឹប នាម កិរិយា និងគុណនាម',
        instructionsEnglish: 'Sort words into lexical bins',
        template: 'sorter',
        metadata: { targetCompetency: 'ថ្នាក់ពាក្យក្នុងភាសាខ្មែរ', gameNumber: 39, classroomPin: seedPin },
        levels: [{
          levelId: 1,
          promptText: 'បែងចែកពាក្យខាងក្រោមចូលក្នុងហឹបវេយ្យាករណ៍៖',
          gameplayData: {
            categories: [
              { id: 'noun', nameKhmer: 'នាម (Noun)', nameEnglish: 'Noun', icon: '📦' },
              { id: 'verb', nameKhmer: 'កិរិយា (Verb)', nameEnglish: 'Verb', icon: '🏃' },
              { id: 'adj', nameKhmer: 'គុណនាម (Adjective)', nameEnglish: 'Adjective', icon: '✨' },
            ],
            items: selected,
          },
        }],
      };
    }

    case 'game-40-comic-story': {
      return {
        id: `comic-story-${timestamp}`,
        titleKhmer: 'តែងរឿងរូបភាព ៣ វគ្គ',
        titleEnglish: '3-Panel Comic Strip',
        subject: 'khmer',
        gradeLevel: grade,
        instructionsKhmer: 'តម្រៀបផ្ទាំងរូបភាពរឿង ៣ វគ្គតាមលំដាប់៖ ដើមរឿង (១) -> កណ្ដាលរឿង (២) -> ចុងបញ្ចប់ (៣)',
        instructionsEnglish: 'Sequence beginning, middle, and end comic panels',
        template: 'sequencer',
        engineType: 'sequencer',
        metadata: { targetCompetency: 'ការតែងរឿង និងលំដាប់ព្រឹត្តិការណ៍', gameNumber: 40, classroomPin: seedPin },
        levels: [
          {
            levelId: 1,
            promptText: 'តម្រៀបរូបភាពទាំង ៣ ផ្ទាំងតាមលំដាប់លំដោយរឿង៖',
            gameplayData: {
              sequencerData: {
                mode: 'comic_strip',
                cycleTitleKhmer: 'ការដាំផ្កាឈូករបស់កុមារី ធីតា',
                layout: 'linear',
                stages: [
                  { id: `cs-1-${timestamp}`, stepNumber: 1, titleKhmer: '១. ដើមរឿង', descriptionKhmer: 'ធីតាយកគ្រាប់ផ្កាឈូកមកដាំក្នុងផើងដី', iconOrImage: '🌱' },
                  { id: `cs-2-${timestamp}`, stepNumber: 2, titleKhmer: '២. កណ្ដាលរឿង', descriptionKhmer: 'ធីតាស្រោចទឹក និងថែទាំរាល់ព្រឹក', iconOrImage: '🚿' },
                  { id: `cs-3-${timestamp}`, stepNumber: 3, titleKhmer: '៣. ចុងបញ្ចប់', descriptionKhmer: 'ផ្កាឈូករីកស្គុះស្គាយពណ៌ផ្កាឈូកយ៉ាងស្រស់ស្អាត', iconOrImage: '🪷' },
                ],
              },
            },
          },
        ],
      };
    }

    case 'game-41-final-consonants': {
      const syllables = [
        { prompt: 'តើព្យញ្ជនៈបិទណាត្រូវបំពេញពាក្យ «មា[...]» (មាស)?', cor: 'ស', wrong: ['ក', 'ច', 'ង'], word: 'មាស' },
        { prompt: 'តើព្យញ្ជនៈបិទណាត្រូវបំពេញពាក្យ «ចា[...]» (ចាន)?', cor: 'ន', wrong: ['ប', 'ដ', 'ម'], word: 'ចាន' },
      ];
      const cur = sample(syllables);
      return {
        id: `final-consonants-${timestamp}`,
        titleKhmer: 'ប្រកបព្យាង្គបិទ',
        titleEnglish: 'Final Consonant Spellings',
        subject: 'khmer',
        gradeLevel: grade,
        instructionsKhmer: 'ជ្រើសរើសព្យញ្ជនៈបិទដើម្បីប្រកបពាក្យឲ្យបានត្រឹមត្រូវ',
        instructionsEnglish: 'Match final consonants to spell complete words',
        template: 'quiz_tap',
        metadata: { targetCompetency: 'ព្យាង្គបិទក្នុងភាសាខ្មែរ', gameNumber: 41, classroomPin: seedPin },
        levels: [{
          levelId: 1,
          promptText: cur.prompt,
          timeLimitSeconds: 20,
          gameplayData: {
            quizOptions: shuffle([
              { id: 'cor', textKhmer: `អក្សរ ${cur.cor}`, isCorrect: true, emoji: '✍️' },
              ...cur.wrong.map((w, idx) => ({ id: `w-${idx}`, textKhmer: `អក្សរ ${w}`, isCorrect: false, emoji: '✍️' })),
            ]),
          },
        }],
      };
    }

    case 'game-42-rhyme-finder': {
      const rhymes = [
        { target: 'ចាន', cor: 'បាន', wrong: ['ដេក', 'ទឹក', 'ផ្កា'] },
        { target: 'ស្រែ', cor: 'ខែ', wrong: ['ភ្នំ', 'ផ្ទះ', 'សេះ'] },
        { target: 'សៀវភៅ', cor: 'ផ្លូវ', wrong: ['ចាន', 'កូន', 'ដើម'] },
      ];
      const cur = sample(rhymes);
      return {
        id: `rhyme-finder-${timestamp}`,
        titleKhmer: 'ពាក្យជួនខ្មែរ',
        titleEnglish: 'Khmer Rhyme Finder',
        subject: 'khmer',
        gradeLevel: grade,
        instructionsKhmer: `ស្វែងរកពាក្យដែលជួនសំឡេងស្រៈជាមួយពាក្យ «${cur.target}»`,
        instructionsEnglish: 'Find words sharing identical rhymes',
        template: 'quiz_tap',
        metadata: { targetCompetency: 'ពាក្យជួន និងចង្វាក់កាព្យ', gameNumber: 42, classroomPin: seedPin },
        levels: [{
          levelId: 1,
          promptText: `តើពាក្យណាជួនជាមួយពាក្យ «${cur.target}»?`,
          timeLimitSeconds: 20,
          gameplayData: {
            quizOptions: shuffle([
              { id: 'cor', textKhmer: `${cur.cor} (ជួននឹង ${cur.target})`, isCorrect: true, emoji: '🎯' },
              ...cur.wrong.map((w, idx) => ({ id: `w-${idx}`, textKhmer: w, isCorrect: false, emoji: '🎯' })),
            ]),
          },
        }],
      };
    }

    default: {
      return null;
    }
  }
}
