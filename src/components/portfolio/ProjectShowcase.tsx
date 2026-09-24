'use client';

import React, { useState } from 'react';
import {
  PORTFOLIO_PROJECTS,
  PortfolioProject,
} from '@/data/portfolio-data';
import {
  Layers,
  Cpu,
  BarChart3,
  Terminal,
  ExternalLink,
  Play,
  RotateCcw,
  Check,
  Copy,
  Volume2,
  Sparkles,
  ArrowRight,
  Filter,
} from 'lucide-react';

function GithubIcon({ className = 'w-3.5 h-3.5' }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
        clipRule="evenodd"
      />
    </svg>
  );
}

interface ProjectShowcaseProps {
  activeTagFilter?: string;
  onSelectTag?: (tag: string) => void;
  className?: string;
}

type TabType = 'overview' | 'architecture' | 'metrics' | 'sandbox';

export function ProjectShowcase({
  activeTagFilter = 'all',
  onSelectTag,
  className = '',
}: ProjectShowcaseProps) {
  const [selectedTag, setSelectedTag] = useState<string>(activeTagFilter);
  const [activeTabs, setActiveTabs] = useState<Record<string, TabType>>({
    'smartkids-edtech': 'overview',
    'ai-video-storyboard': 'overview',
    'edge-audio-proxy': 'overview',
  });

  // Collect all unique tags
  const allTags = Array.from(
    new Set(PORTFOLIO_PROJECTS.flatMap((p) => p.tags))
  );

  const handleTagClick = (tag: string) => {
    setSelectedTag(tag);
    if (onSelectTag) {
      onSelectTag(tag);
    }
  };

  const handleTabChange = (projectId: string, tab: TabType) => {
    setActiveTabs((prev) => ({ ...prev, [projectId]: tab }));
  };

  const filteredProjects =
    selectedTag === 'all'
      ? PORTFOLIO_PROJECTS
      : PORTFOLIO_PROJECTS.filter((p) =>
          p.tags.some((t) => t.toLowerCase().includes(selectedTag.toLowerCase()))
        );

  return (
    <section id="projects-showcase" className={`space-y-8 ${className}`}>
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 mb-3 border border-emerald-200 dark:border-emerald-800/60">
            <Sparkles className="w-3.5 h-3.5" />
            Interactive Project Showcase
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Architecture Deep-Dives & Live Sandboxes
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-1.5 max-w-2xl">
            Explore functional deep dives into production systems, complete with ASCII architecture pipelines, tangible performance metrics, and interactive sandboxes.
          </p>
        </div>

        {/* Filter Badges */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-slate-500 flex items-center gap-1 mr-1">
            <Filter className="w-3 h-3" /> Filter:
          </span>
          <button
            onClick={() => handleTagClick('all')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${
              selectedTag === 'all'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
            }`}
          >
            All ({PORTFOLIO_PROJECTS.length})
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => handleTagClick(tag)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${
                selectedTag.toLowerCase() === tag.toLowerCase()
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Projects List */}
      <div className="space-y-8">
        {filteredProjects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            activeTab={activeTabs[project.id] || 'overview'}
            onTabChange={(tab) => handleTabChange(project.id, tab)}
            onTagClick={handleTagClick}
          />
        ))}

        {filteredProjects.length === 0 && (
          <div className="text-center py-16 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-800">
            <p className="text-slate-500 dark:text-slate-400">
              No projects found matching the tag &ldquo;{selectedTag}&rdquo;.
            </p>
            <button
              onClick={() => handleTagClick('all')}
              className="mt-3 text-sm font-semibold text-emerald-600 hover:underline"
            >
              Reset filter to show all projects
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

/**
 * Individual Project Card with Tabbed Deep-Dives
 */
interface ProjectCardProps {
  project: PortfolioProject;
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onTagClick: (tag: string) => void;
}

function ProjectCard({ project, activeTab, onTabChange, onTagClick }: ProjectCardProps) {
  const [copiedDiagram, setCopiedDiagram] = useState(false);

  const copyDiagram = () => {
    navigator.clipboard.writeText(project.architectureDiagram);
    setCopiedDiagram(true);
    setTimeout(() => setCopiedDiagram(false), 2000);
  };

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-sm hover:shadow-md transition duration-200 overflow-hidden">
      {/* Card Header */}
      <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                {project.title}
              </h3>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  project.status === 'Production'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                    : project.status === 'Active'
                    ? 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 border border-sky-300 dark:border-sky-800'
                    : 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border border-purple-300 dark:border-purple-800'
                }`}
              >
                {project.status}
              </span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">
              {project.tagline}
            </p>
          </div>

          {/* Action Links */}
          <div className="flex items-center gap-2 shrink-0">
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition"
              >
                <GithubIcon className="w-3.5 h-3.5" />
                <span>Code</span>
              </a>
            )}
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Live Demo</span>
              </a>
            )}
          </div>
        </div>

        {/* Tech Stack Badges */}
        <div className="flex items-center gap-1.5 flex-wrap mt-3.5">
          {project.tags.map((tag) => (
            <button
              key={tag}
              onClick={() => onTagClick(tag)}
              className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-200/70 hover:bg-slate-300/80 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition"
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>

      {/* Deep-Dive Tabs Bar */}
      <div className="flex items-center border-b border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-950/60 px-4 sm:px-6 overflow-x-auto no-scrollbar">
        <TabButton
          icon={<Layers className="w-4 h-4" />}
          label="Overview"
          isActive={activeTab === 'overview'}
          onClick={() => onTabChange('overview')}
        />
        <TabButton
          icon={<Cpu className="w-4 h-4" />}
          label="Architecture"
          isActive={activeTab === 'architecture'}
          onClick={() => onTabChange('architecture')}
        />
        <TabButton
          icon={<BarChart3 className="w-4 h-4" />}
          label="Key Metrics"
          isActive={activeTab === 'metrics'}
          onClick={() => onTabChange('metrics')}
        />
        <TabButton
          icon={<Terminal className="w-4 h-4" />}
          label="Live Sandbox"
          isActive={activeTab === 'sandbox'}
          onClick={() => onTabChange('sandbox')}
          highlight
        />
      </div>

      {/* Tab Content Container */}
      <div className="p-5 sm:p-6 select-text">
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-4 max-w-4xl leading-relaxed">
            <p className="text-slate-700 dark:text-slate-300 text-sm sm:text-base">
              {project.overview}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 text-xs">
                <span className="font-semibold text-slate-900 dark:text-white block mb-1">
                  Core Architecture Highlights
                </span>
                <span className="text-slate-600 dark:text-slate-400">
                  Built for high reliability under constrained bandwidth conditions, leveraging client-side Web Audio synthesis, edge caches, and zero-dependency procedural games.
                </span>
              </div>
              <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 text-xs">
                <span className="font-semibold text-slate-900 dark:text-white block mb-1">
                  Developer Experience & Tooling
                </span>
                <span className="text-slate-600 dark:text-slate-400">
                  Strict TypeScript type safety, automated Zod payload validation, and programmatic video rendering pipelines that accelerate content authoring.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ARCHITECTURE DIAGRAM */}
        {activeTab === 'architecture' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                System Topology & Pipeline Data Flow
              </span>
              <button
                onClick={copyDiagram}
                className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition"
              >
                {copiedDiagram ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedDiagram ? 'Copied' : 'Copy ASCII'}</span>
              </button>
            </div>
            <div className="p-4 rounded-lg bg-slate-950 text-emerald-400 font-mono text-xs sm:text-sm overflow-x-auto border border-slate-800 shadow-inner">
              <pre className="leading-tight">{project.architectureDiagram}</pre>
            </div>
          </div>
        )}

        {/* TAB 3: KEY METRICS */}
        {activeTab === 'metrics' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {project.metrics.map((m, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex flex-col justify-between"
              >
                <div>
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1">
                    {m.label}
                  </span>
                  <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    {m.value}
                  </span>
                </div>
                {m.improvement && (
                  <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-700/60 flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    <span>↑</span>
                    <span>{m.improvement}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* TAB 4: LIVE SANDBOX */}
        {activeTab === 'sandbox' && (
          <InteractiveSandbox project={project} />
        )}
      </div>
    </div>
  );
}

function TabButton({
  icon,
  label,
  isActive,
  onClick,
  highlight = false,
}: {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
  highlight?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
        isActive
          ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20'
          : 'border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 hover:border-slate-300'
      } ${highlight && !isActive ? 'text-emerald-600 dark:text-emerald-400 font-bold' : ''}`}
    >
      {icon}
      <span>{label}</span>
      {highlight && (
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
      )}
    </button>
  );
}

/**
 * Interactive Sandboxes (Mock API Tester, State Simulator, or Code Runner)
 */
function InteractiveSandbox({ project }: { project: PortfolioProject }) {
  const { sandbox } = project;
  const [inputVal, setInputVal] = useState<string>(sandbox.initialInput);
  const [outputVal, setOutputVal] = useState<string>(sandbox.defaultOutput);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [audioPlayed, setAudioPlayed] = useState<boolean>(false);

  const handleReset = () => {
    setInputVal(sandbox.initialInput);
    setOutputVal(sandbox.defaultOutput);
  };

  const handleRun = () => {
    setIsRunning(true);
    setTimeout(() => {
      setIsRunning(false);
      if (sandbox.type === 'api_tester') {
        try {
          const parsed = JSON.parse(inputVal);
          setOutputVal(
            JSON.stringify(
              {
                success: true,
                latency: '34ms',
                timestamp: new Date().toISOString(),
                provider: 'gemini-2.5-flash',
                compiledPayload: {
                  lessonTitle: parsed.lessonTitle || 'Interactive Lesson',
                  subject: parsed.subject || 'general',
                  gameConfig: {
                    engine: 'procedural_sandbox',
                    difficulty: parsed.gradeLevel || 1,
                    validation: 'ZodSchema_OK',
                  },
                },
              },
              null,
              2
            )
          );
        } catch {
          setOutputVal(
            JSON.stringify(
              {
                error: 'Invalid JSON payload. Please verify syntax.',
                timestamp: new Date().toISOString(),
              },
              null,
              2
            )
          );
        }
      } else if (sandbox.type === 'state_simulator') {
        setOutputVal(
          `[Remotion Compiler v4.1] Compiling timeline sequence...\n` +
          `[Sync] Audio track synced with Khmer phoneme timestamps\n` +
          `[Frame 000-060]: Scene 1 (Avatar Welcome) -> Opacity: 1.0, Transform: Scale(1.0)\n` +
          `[Frame 060-180]: Scene 2 (Interactive Canvas) -> Spline: EaseInOut\n` +
          `[Frame 180-240]: Scene 3 (Outro & Star Reward) -> Particles: 45\n` +
          `[Output]: Rendered 240 frames at 20fps in 3.2 seconds.`
        );
      } else if (sandbox.type === 'code_runner') {
        setOutputVal(
          `[SpeechEngine] In-Memory Cache Lookup: HIT (Key: km-KH-0a9b8f)\n` +
          `[WebAudio] AudioContext state: 'running' (SampleRate: 44100Hz)\n` +
          `[Stream] Playing buffer chunk 1/1 (duration: 1.42s)\n` +
          `[Telemetry] Execution time: 14ms`
        );
      }
    }, 450);
  };

  // Play synthetic tone using Web Audio API for edge audio proxy demo
  const playWebAudioTone = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.15); // E5
      osc.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.3); // G5

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.5);

      setAudioPlayed(true);
      setTimeout(() => setAudioPlayed(false), 2000);
    } catch {
      // AudioContext not allowed or not supported
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
            {sandbox.type === 'api_tester' && 'Interactive API Tester'}
            {sandbox.type === 'state_simulator' && 'Keyframe State Simulator'}
            {sandbox.type === 'code_runner' && 'Live Code Execution Sandbox'}
          </span>
          {sandbox.mockEndpoint && (
            <code className="text-[11px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-mono">
              {sandbox.mockEndpoint}
            </code>
          )}
        </div>

        <div className="flex items-center gap-2">
          {sandbox.type === 'code_runner' && (
            <button
              onClick={playWebAudioTone}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-sky-100 hover:bg-sky-200 dark:bg-sky-950 dark:hover:bg-sky-900 text-sky-700 dark:text-sky-300 transition"
              title="Test Web Audio synthesizer"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>{audioPlayed ? 'Playing...' : 'Play Audio Tone'}</span>
            </button>
          )}

          <button
            onClick={handleReset}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 transition"
            title="Reset to default"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>

          <button
            onClick={handleRun}
            disabled={isRunning}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white shadow transition disabled:opacity-50"
          >
            <Play className={`w-3 h-3 ${isRunning ? 'animate-spin' : ''}`} />
            <span>{isRunning ? 'Running...' : 'Execute'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Input Panel */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
            <span>Input Payload / Code:</span>
            <span className="text-[10px] uppercase">{sandbox.codeLanguage || 'json'}</span>
          </div>
          <textarea
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            rows={8}
            className="w-full p-3 rounded-lg bg-slate-900 text-slate-100 font-mono text-xs focus:ring-1 focus:ring-emerald-500 outline-none border border-slate-800 resize-none leading-relaxed"
            spellCheck={false}
          />
        </div>

        {/* Output Panel */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
            <span>Execution Output / Response:</span>
            <span className="text-[10px] text-emerald-500 font-semibold">200 OK</span>
          </div>
          <div className="w-full h-[166px] p-3 rounded-lg bg-slate-950 text-emerald-400 font-mono text-xs border border-slate-800 overflow-y-auto whitespace-pre-wrap leading-relaxed">
            {outputVal}
          </div>
        </div>
      </div>
    </div>
  );
}
