// src/data/portfolio-data.ts
// Structured portfolio data, resume schema, and interactive sandbox configs

export interface ProjectMetric {
  label: string;
  value: string;
  improvement?: string;
}

export interface ProjectSandboxConfig {
  type: 'code_runner' | 'api_tester' | 'state_simulator';
  initialInput: string;
  defaultOutput: string;
  mockEndpoint?: string;
  codeLanguage?: string;
}

export interface PortfolioProject {
  id: string;
  title: string;
  tagline: string;
  tags: string[];
  status: 'Production' | 'Active' | 'Open Source' | 'Beta';
  githubUrl?: string;
  liveUrl?: string;
  overview: string;
  architectureDiagram: string;
  architectureType: 'ascii' | 'svg';
  metrics: ProjectMetric[];
  sandbox: ProjectSandboxConfig;
}

export interface DeveloperSkills {
  backend: { name: string; level: number; tags: string[] }[];
  frontend: { name: string; level: number; tags: string[] }[];
  devops: { name: string; level: number; tags: string[] }[];
  tools: { name: string; level: number; tags: string[] }[];
}

export interface DeveloperBio {
  name: string;
  handle: string;
  role: string;
  location: string;
  bio: string;
  focusAreas: string[];
  socials: {
    github: string;
    linkedin: string;
    email: string;
    twitter?: string;
  };
}

export const DEVELOPER_BIO: DeveloperBio = {
  name: 'Tola',
  handle: 'tolaxd',
  role: 'Full-Stack Software Engineer & EdTech Architect',
  location: 'Phnom Penh, Cambodia',
  bio: 'Specializing in high-performance web applications, AI-assisted pedagogical tools, and resilient distributed architectures with Next.js, TypeScript, and modern cloud pipelines.',
  focusAreas: [
    'Full-Stack Architecture (Next.js 16, React 19, TypeScript, Node.js)',
    'AI Integration (Google Gemini, Schema Compilers, Remotion Video Pipelines)',
    'Real-time & Low-Latency UI (Web Audio API, Canvas Confetti, Gamification)',
    'Accessibility & Localization (Khmer Unicode Typography, High-Contrast WCAG)',
  ],
  socials: {
    github: 'https://github.com/tolaa27',
    linkedin: 'https://linkedin.com/in/tolaa27',
    email: 'contact@tola.dev',
    twitter: 'https://twitter.com/tolaxd',
  },
};

export const DEVELOPER_SKILLS: DeveloperSkills = {
  backend: [
    { name: 'TypeScript / Node.js', level: 95, tags: ['Express', 'Next.js API', 'REST', 'Zod'] },
    { name: 'Python', level: 85, tags: ['FastAPI', 'PyTorch', 'Data Pipelines'] },
    { name: 'PostgreSQL / SQL', level: 88, tags: ['Prisma', 'Indexing', 'Query Optimization'] },
    { name: 'PHP / Laravel', level: 80, tags: ['Eloquent', 'Artisan', 'Jobs'] },
  ],
  frontend: [
    { name: 'React 19 & Next.js 16', level: 96, tags: ['Server Components', 'App Router', 'Hooks'] },
    { name: 'Tailwind CSS v4', level: 94, tags: ['Design Tokens', 'Claymorphism', 'Responsive'] },
    { name: 'Framer Motion', level: 90, tags: ['Gestures', 'AnimatePresence', 'Orchestration'] },
    { name: 'Web Audio / Canvas API', level: 85, tags: ['Synthesis', 'SpeechEngine', 'Interactive'] },
  ],
  devops: [
    { name: 'Docker & Containers', level: 88, tags: ['Multi-Stage', 'Compose', 'Optimization'] },
    { name: 'CI/CD Pipelines', level: 86, tags: ['GitHub Actions', 'Vercel', 'Automated QA'] },
    { name: 'Edge Caching & Cloudflare', level: 84, tags: ['Workers', 'Immutable Cache', 'SSL'] },
    { name: 'Linux System Admin', level: 85, tags: ['Bash', 'Nginx', 'Systemd'] },
  ],
  tools: [
    { name: 'Git & GitHub Workflows', level: 95, tags: ['Trunk-based', 'PR Reviews', 'Submodules'] },
    { name: 'Remotion (Programmatic Video)', level: 88, tags: ['React-to-Video', 'Timeline Scrubbing'] },
    { name: 'ESLint / Prettier / Turbopack', level: 92, tags: ['Static Analysis', 'Zero-Config'] },
    { name: 'Gemini SDK & GenAI', level: 90, tags: ['Structured Outputs', 'Prompt Engineering'] },
  ],
};

export const RESUME_JSON = {
  developer: {
    name: 'Tola',
    title: 'Full-Stack Software Engineer',
    summary: 'Full-stack engineer with deep expertise in Next.js, React 19, TypeScript, and interactive multimedia architectures.',
    contact: {
      email: 'contact@tola.dev',
      github: 'https://github.com/tolaa27',
      linkedin: 'https://linkedin.com/in/tolaa27',
    },
  },
  experience: [
    {
      role: 'Lead Full-Stack Engineer',
      project: 'SmartKids Cambodia (MoEYS EdTech)',
      period: '2024 - Present',
      achievements: [
        'Architected gamified primary curriculum platform with 5 universal mechanics engines for 42 interactive lessons.',
        'Engineered Google Gemini 2.5 structured schema compiler converting textbook lessons into live game configs.',
        'Implemented dual-tier Web Audio & Google TTS audio proxy achieving sub-50ms synthesis latency.',
      ],
    },
    {
      role: 'Full-Stack Web Developer',
      project: 'Distributed Cloud & Video Tooling',
      period: '2022 - 2024',
      achievements: [
        'Built programmatic video rendering engine with Remotion generating animated educational explainer videos.',
        'Optimized Next.js bundle sizes by 42% through aggressive code-splitting and dynamic imports.',
        'Implemented zero-downtime CI/CD deployment pipelines on Vercel and Docker.',
      ],
    },
  ],
  education: {
    degree: 'B.S. in Computer Science & Software Engineering',
    institution: 'Royal University of Phnom Penh',
    honors: 'First Class Honors',
  },
  coreTechnologies: [
    'Next.js 16',
    'React 19',
    'TypeScript 5',
    'Tailwind CSS v4',
    'Framer Motion',
    'Node.js',
    'Python',
    'PostgreSQL',
    'Docker',
  ],
};

export const PORTFOLIO_PROJECTS: PortfolioProject[] = [
  {
    id: 'smartkids-edtech',
    title: 'SmartKids Cambodia (កុមារឆ្លាត)',
    tagline: 'MoEYS Gamified Early Childhood EdTech Platform & Teacher AI Studio',
    tags: ['Next.js', 'React 19', 'TypeScript', 'Tailwind CSS', 'Gemini AI', 'Web Audio'],
    status: 'Production',
    githubUrl: 'https://github.com/tolaa27/smartkitv1',
    liveUrl: 'https://smartkids.cambodia.edu',
    overview:
      'A comprehensive gamified early childhood learning platform aligned with the Cambodian national MoEYS curriculum (Grades 1-3). Features 42 interactive procedural game engines (Math CRA, Khmer Phonetics, Environmental Sandbox, Stage Sequencer, Sorter), real-time speech synthesis, and an integrated Teacher AI Studio.',
    architectureDiagram: `┌─────────────────────────────────────────────────────────────┐
│                   Next.js 16 App Router                     │
├──────────────────────────────┬──────────────────────────────┤
│      Student Game Hub        │     Teacher AI Studio        │
│  - Universal 5 Engines       │  - Gemini 2.5 Flash Compiler │
│  - Web Audio & TTS Proxy     │  - OCR & PDF Extraction      │
│  - Framer Motion 3.5D UI     │  - Remotion Video Storyboard │
└──────────────┬───────────────┴──────────────┬───────────────┘
               │                              │
               ▼                              ▼
      ┌─────────────────┐            ┌─────────────────┐
      │  Client Canvas  │            │ Google Gemini & │
      │  Web Audio API  │            │ Edge Audio API  │
      └─────────────────┘            └─────────────────┘`,
    architectureType: 'ascii',
    metrics: [
      { label: 'Interactive Games', value: '42', improvement: 'Grades 1-3 MoEYS coverage' },
      { label: 'Audio Latency', value: '<45ms', improvement: '70% reduction vs remote TTS' },
      { label: 'Compiler Schema Accuracy', value: '99.4%', improvement: 'Zod-validated payload' },
      { label: 'Lighthouse Score', value: '98/100', improvement: 'Performance & Accessibility' },
    ],
    sandbox: {
      type: 'api_tester',
      mockEndpoint: '/api/studio/compile',
      initialInput: JSON.stringify(
        {
          lessonTitle: 'ការដុះពន្លកនៃរុក្ខជាតិ',
          subject: 'science',
          gradeLevel: 1,
          lessonText: 'រុក្ខជាតិត្រូវការទឹក សំណើម និងកម្ដៅព្រះអាទិត្យដើម្បីដុះពន្លក។ ឫសដុះចុះក្រោម ហើយពន្លកដុះឡើងលើ។',
        },
        null,
        2
      ),
      defaultOutput: JSON.stringify(
        {
          success: true,
          provider: 'google-gemini-2.5',
          engineType: 'sandbox',
          game: {
            titleKhmer: 'ការដុះពន្លកនៃរុក្ខជាតិ',
            instructionsKhmer: 'ពិសោធន៍ផ្តល់ទឹក និងពន្លឺសមស្របដើម្បីឱ្យគ្រាប់ពូជដុះពន្លក',
            levels: [{ levelId: 1, idealWaterRange: [60, 85], idealLightRange: [50, 80] }],
          },
        },
        null,
        2
      ),
    },
  },
  {
    id: 'ai-video-storyboard',
    title: 'Neural Video Storyboard Engine',
    tagline: 'Automated Code-Driven Pedagogical Video Synthesis with Remotion',
    tags: ['React', 'Remotion', 'TypeScript', 'Node.js', 'Async Queue'],
    status: 'Production',
    githubUrl: 'https://github.com/tolaa27/neural-video-engine',
    overview:
      'A programmatic video synthesis engine that ingests structured lesson markdown/PDF content, automatically generates Khmer voiceover scripts and visual cue timelines, and renders high-definition animations at 20fps using Remotion and Tailwind CSS.',
    architectureDiagram: `[Curriculum PDF / Text]
         │
         ▼
[Gemini Storyboarder] ──► { Narration, Timestamps, Scene Cues }
         │
         ▼
[Async Job Queue] ──► [Remotion Timeline Composition]
         │
         ▼
[Browser Canvas Scrubbing & MP4 Transcoding]`,
    architectureType: 'ascii',
    metrics: [
      { label: 'Generation Speed', value: '12s', improvement: '4x faster than cloud GPU rendering' },
      { label: 'Timeline Resolution', value: '20 FPS', improvement: 'Frame-perfect audio sync' },
      { label: 'Memory Footprint', value: '<120MB', improvement: 'Lightweight in-memory queue' },
    ],
    sandbox: {
      type: 'state_simulator',
      initialInput: 'Timestamp: 0s -> Teacher Avatar welcomes class\nTimestamp: 3.5s -> Diagram compares lengths\nTimestamp: 8.5s -> Interactive practice on board',
      defaultOutput: 'Frame 0: Avatar Intro [Alpha: 1.0, Scale: 1.0]\nFrame 70: Diagram Transition [TranslateY: 0px, Blur: 0px]\nFrame 170: Practice Banner [Scale: 1.05, Bounce: active]',
    },
  },
  {
    id: 'edge-audio-proxy',
    title: 'Resilient Khmer TTS Audio Proxy',
    tagline: 'Multi-Tier Low-Latency Speech Synthesis with In-Memory Cache',
    tags: ['TypeScript', 'Next.js Edge', 'Web Audio', 'Caching'],
    status: 'Active',
    githubUrl: 'https://github.com/tolaa27/edge-tts-proxy',
    overview:
      'A resilient server-side proxy and client-side fallback system for Cambodian Khmer audio synthesis. It streams neural audio chunks with 7-day immutable caching, mitigating browser autoplay restrictions and providing sensory melodic tone fallbacks.',
    architectureDiagram: `[Client Request: SpeechEngine.speak(text)]
         │
    ┌────┴──────────────────────────┐
    ▼                               ▼
[Tier 1: Native WebSpeech]    [Tier 2: /api/tts Proxy Stream]
    │                               │
    │ (fallback if unavail)         │ (7-Day Immutable Cache)
    └──────────────► ◄──────────────┘
                     │ (if network offline)
                     ▼
        [Tier 3: Web Audio Melodic Tone]`,
    architectureType: 'ascii',
    metrics: [
      { label: 'Cache Hit Rate', value: '94.2%', improvement: 'Zero duplicate TTS calls' },
      { label: 'Edge Response', value: '18ms', improvement: 'Direct buffer streaming' },
      { label: 'Autoplay Success', value: '100%', improvement: 'User interaction unlocked' },
    ],
    sandbox: {
      type: 'code_runner',
      codeLanguage: 'typescript',
      initialInput: `// Test SpeechEngine dispatch\nSpeechEngine.speak('សួស្តីកុមារឆ្លាត!', 'km-KH');`,
      defaultOutput: `[SpeechEngine] Initialized AudioContext (state: running)\n[SpeechEngine] Target lang: km-KH, characters detected: Khmer Unicode\n[SpeechEngine] Tier 2 Proxy: HTTP 200 (audio/mpeg, 12.4 KB, cache: HIT)\n[SpeechEngine] Playback started successfully`,
    },
  },
];
