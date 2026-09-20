# កុមារឆ្លាត (SmartKids Cambodia)
**Early Childhood Gamified EdTech Platform (Aligned with MoEYS Standards for Grades 1–3)**

---

## 🌟 Overview

**"កុមារឆ្លាត" (SmartKids Cambodia)** is a full-stack, monorepo educational gaming platform featuring **42 procedural mini-games** aligned with the Cambodian Ministry of Education, Youth and Sport (**MoEYS**) curriculum standards for Grades 1–3 across **Science (14)**, **Mathematics (14)**, and **Khmer Literacy (14)**, alongside an **AI Lesson-to-Game Teacher Studio**.

All 42 games are powered deterministically by **5 reusable core React mechanics engines**, with dual-tier resilient Khmer audio synthesis, mobile touch optimization, and real-time student mastery tracking.

---

## 🏛️ Monorepo Architecture

```text
smartkids-cambodia/
├── backend/                  # Laravel 11 RESTful API
│   ├── app/
│   │   ├── Http/Controllers/Api/
│   │   │   ├── GameController.php         # Serves 42 games catalog & procedural seeded sessions
│   │   │   ├── LessonParserController.php # Ingests text/PDF/images -> outputs Game JSON
│   │   │   └── ProgressController.php     # User scores, stars, session records
│   │   ├── Models/
│   │   │   ├── CustomGame.php             # Custom teacher/student games
│   │   │   └── UserProgress.php           # Progress, scores, stars
│   │   └── Services/
│   │       ├── GameCatalogService.php     # 42 MoEYS catalog & procedural mutators
│   │       └── LessonCompilerService.php  # NLP/Heuristic curriculum entity parser
│   ├── routes/api.php                     # Clean, typed REST API routes
│   └── database/migrations/               # SQLite/PostgreSQL schema definitions
│
└── frontend/                 # React 19 + TypeScript + Vite + Tailwind CSS
    ├── src/
    │   ├── api/              # Axios client & typed API hooks (GameApi)
    │   ├── audio/            # SoundEngine (Web Audio API synthesis + Khmer TTS fallback)
    │   ├── components/
    │   │   ├── common/       # Header, SpeakerButton, SubtitleBanner
    │   │   ├── studio/       # TeacherStudio (Lesson upload -> Game -> Live Sandbox)
    │   │   ├── BentoCard.tsx # MoEYS Bento grid card display
    │   │   └── UniversalGameRunner.tsx # Modal runner hosting the 5 engines with confetti
    │   ├── engines/          # 5 Core Deterministic Game Engines
    │   │   ├── SorterEngine.tsx       # Engine 1: Spatial & Attribute Sorter
    │   │   ├── SandboxEngine.tsx      # Engine 2: Environmental State-Machine Sandbox
    │   │   ├── CRAMathEngine.tsx      # Engine 3: Concrete-Representational-Abstract Math
    │   │   ├── SyntaxEngine.tsx       # Engine 4: Khmer Syllable & Syntax Rail
    │   │   └── SequencerEngine.tsx    # Engine 5: Chronological Process Sequencer
    │   ├── store/            # Zustand global and game state slices (gameStore.ts)
    │   └── types/            # Game, curriculum, and engine schemas (game.ts)
    ├── package.json
    └── vite.config.ts
```

---

## 🕹️ The 5 Deterministic Core Engines

| Engine | Component | Description & Interactions | Powers (MoEYS Mini-Games) |
|---|---|---|---|
| **1. Spatial & Attribute Sorter** | `<SorterEngine />` | Tap-to-select token with dynamic ring indicator; tap bin to drop. Handles error bounces and positive chime feedbacks. | • 3 Food Groups (អាហារ ៣ ក្រុម)<br>• Eco-Trash Sorting (៤ ធុង)<br>• Living vs. Non-Living<br>• Khmer Consonants (ពួក អ / ពួក អ៊)<br>• Grammar Bins (នាម / កិរិយា)<br>• Animal Habitats |
| **2. Environmental Sandbox** | `<SandboxEngine />` | Sliders and interactive touch pads updating vector physics and live SVG stages in real-time. | • Seed Germination Lab (ពិសោធដុះពន្លក)<br>• Germ Buster Hand Hygiene (កម្ចាត់មេរោគ)<br>• Sun & Shadow Dial (គន្លងព្រះអាទិត្យ)<br>• Magnetism Sandbox (មេដែកស្រូបទាញ) |
| **3. Concrete-Representational-Abstract Math** | `<CRAMathEngine />` | Manipulating physical items prior to numerical input: authentic Riel currency, torque physics scales, and number lines. | • Cambodian Market Cashier (100៛–5000៛)<br>• Dual-Pan Balance Scale ($N + \Box = M$)<br>• Frog Number Line Hopper<br>• Fair-Share Candy/Fruit Division |
| **4. Khmer Syllable & Syntax Rail** | `<SyntaxEngine />` | Snap base consonants, subscripts (ជើងអក្សរ), and dependent vowels into Unicode sequences without clipping diacritics. | • Syllable Constructor (ក្ងា, ខ្លា, ផ្កា)<br>• Consonant Subscript Rail (ជើង ៣៣ តួ)<br>• SVO Picture Sentence Builder<br>• Silent Marker (ទណ្ឌឃាត ៍) Inspector |
| **5. Chronological Process Sequencer** | `<SequencerEngine />` | Non-linear cards snapped onto a chronological timeline with dynamic order validation. | • Butterfly Metamorphosis<br>• Frog Life Cycle<br>• Atmospheric Water Cycle<br>• 3-Panel Comic Strip Stories<br>• Ordinal Number Train |

---

## 🔊 Dual-Tier Resilient Khmer Audio & Speech Engine

`frontend/src/audio/SoundEngine.ts`:

1. **Web Audio API (Procedural Synthesis):**
   - Auto-resumes `AudioContext` on first user interaction to bypass browser autoplay restrictions.
   - **Correct Answer Chime:** Arpeggiated pentatonic chord (C5: 523.25Hz, E5: 659.25Hz, G5: 783.99Hz, C6: 1046.50Hz).
   - **Gentle Error Cue:** Warm, non-punitive low thud (180Hz down to 75Hz).
   - **Tactile Sounds:** Snaps, pops, coin clinks for Cambodian Riel, and level victory fanfares.
2. **Khmer Web Speech API (`km-KH`) with Edge Audio Stream Fallback:**
   - Probes `window.speechSynthesis.getVoices()` for native `km-KH` voices.
   - If unavailable or muted, automatically falls back to an edge audio stream:
     `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=km&client=tw-ob`
   - Floating `<SubtitleBanner />` provides real-time visual subtitles for auditory and visual reinforcement.
   - Reusable `<SpeakButton text={khmerText} />` placed on every prompt and token card.

---

## 👩‍🏫 AI Lesson-to-Game Teacher Studio

`frontend/src/components/studio/TeacherStudio.tsx`:

- **Curriculum Ingestion:** Drag-and-drop textbook snapshots, photos, or PDF lessons, or paste raw lesson text.
- **Backend Compiler (`POST /api/studio/generate-game`):** Analyzes Khmer curriculum entities, detects Grade (1–3), Subject, and pedagogical keywords to generate a compliant game config.
- **Live Interactive Sandbox:** Embedded test-play canvas inside the studio modal so teachers can test games immediately.
- **Export & Persist:** Save directly to the backend database (`POST /api/studio/games`) or export as shareable JSON.

---

## 📡 Backend RESTful API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/games` | Returns catalog of all 42 MoEYS mini-games across Science (14), Math (14), and Khmer (14) with filter queries (`subject`, `grade`, `engine`). |
| `GET` | `/api/games/{slug}` | Returns metadata and configuration for a specific game. |
| `GET` | `/api/games/{slug}/session` | Procedurally generates a randomized, seeded session (unique numbers, shuffled items, target values) for infinite replayability. |
| `POST` | `/api/studio/generate-game` | Accepts raw text, OCR strings, or uploaded files (`.pdf`, `.png`, `.jpg`) and compiles a valid game schema. |
| `POST` | `/api/studio/games` | Persists a custom game to the database. |
| `GET` | `/api/studio/games` | Fetches custom games created by teachers. |
| `POST` | `/api/progress/save` | Records user progress (stars earned 1–3, score gain, accuracy rate, completion time). |
| `GET` | `/api/progress` | Fetches student stars summary, total score, and completed games list. |

---

## 🚀 Quick Start & Development

### 1. Prerequisites
- **Node.js** >= 20
- **PHP** >= 8.2 (with `pdo_sqlite`, `mbstring`, `fileinfo`)
- **Composer**

### 2. Run the Monorepo

```bash
# In the root directory:
npm run dev
```

This concurrently boots:
- **Backend API:** `http://127.0.0.1:8000/api`
- **Frontend App:** `http://localhost:3000`

### 3. Build for Production

```bash
npm run build
```
Generates production-optimized static assets in `frontend/dist/`.
# smartkitv1
