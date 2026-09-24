'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { TerminalEmulator } from '@/components/portfolio/TerminalEmulator';
import { ProjectShowcase } from '@/components/portfolio/ProjectShowcase';
import { DEVELOPER_BIO, DEVELOPER_SKILLS } from '@/data/portfolio-data';
import {
  Terminal as TerminalIcon,
  Code2,
  ExternalLink,
  Mail,
  ArrowRight,
  Sparkles,
  Server,
  Layout,
  Cloud,
  Wrench,
  CheckCircle2,
  Award,
  BookOpen,
} from 'lucide-react';

function GithubIcon({ className = 'w-4 h-4' }: { className?: string }) {
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

function LinkedinIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76c.97 0 1.75-.79 1.75-1.76s-.78-1.76-1.75-1.76-1.75.79-1.75 1.76.78 1.76 1.75 1.76m1.39 9.74v-8.37H5.07v8.37h2.78z" />
    </svg>
  );
}

export default function PortfolioPage() {
  const [activeTagFilter, setActiveTagFilter] = useState<string>('all');

  const handleFilterProjectsFromTerminal = (tag: string) => {
    setActiveTagFilter(tag);
    const element = document.getElementById('projects-showcase');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDF7] dark:bg-slate-950 text-slate-900 dark:text-slate-100 select-text">
      {/* Navigation Header */}
      <header className="sticky top-0 z-40 bg-[#FFFDF7]/85 dark:bg-slate-950/85 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/portfolio"
              className="flex items-center gap-2 font-mono font-bold text-base sm:text-lg tracking-tight hover:opacity-80 transition"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                T
              </div>
              <span className="text-slate-900 dark:text-white">
                {DEVELOPER_BIO.name}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 font-normal">
                @{DEVELOPER_BIO.handle}
              </span>
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
            <a href="#terminal" className="hover:text-emerald-600 transition flex items-center gap-1.5">
              <TerminalIcon className="w-3.5 h-3.5" />
              Terminal
            </a>
            <a href="#projects-showcase" className="hover:text-emerald-600 transition flex items-center gap-1.5">
              <Code2 className="w-3.5 h-3.5" />
              Projects & Sandboxes
            </a>
            <a href="#skills" className="hover:text-emerald-600 transition flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Skills
            </a>
            <a href="#contact" className="hover:text-emerald-600 transition flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" />
              Contact
            </a>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-500" />
              <span>Explore SmartKids App</span>
            </Link>

            <a
              href={`mailto:${DEVELOPER_BIO.socials.email}`}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition"
            >
              <span>Get in Touch</span>
              <ArrowRight className="w-3 h-3" />
            </a>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-16">
        {/* HERO SECTION */}
        <section className="space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Available for Senior / Staff Engineering Roles
          </div>

          <div className="space-y-4 max-w-4xl">
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
              Building Resilient Systems, AI Engines & High-Impact Pedagogical Software.
            </h1>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 font-normal leading-relaxed">
              {DEVELOPER_BIO.bio}
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-2">
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 shadow-sm">
              <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">42+</div>
              <div className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-0.5">Procedural Game Engines</div>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 shadow-sm">
              <div className="text-2xl sm:text-3xl font-black text-sky-600 dark:text-sky-400">&lt;45ms</div>
              <div className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-0.5">Edge Audio Latency</div>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 shadow-sm">
              <div className="text-2xl sm:text-3xl font-black text-purple-600 dark:text-purple-400">99.4%</div>
              <div className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-0.5">Zod Schema Accuracy</div>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 shadow-sm">
              <div className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400">98/100</div>
              <div className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-0.5">Lighthouse Performance</div>
            </div>
          </div>
        </section>

        {/* SECTION 1: EMBEDDED INTERACTIVE TERMINAL */}
        <section id="terminal" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">
                <TerminalIcon className="w-3.5 h-3.5" />
                Interactive CLI Sandbox
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                Developer Terminal Emulator
              </h2>
            </div>
            <span className="hidden sm:inline-block text-xs font-mono text-slate-400 dark:text-slate-500">
              Shortcut: Ctrl+L to clear • Tab to complete
            </span>
          </div>

          <TerminalEmulator
            onFilterProjects={handleFilterProjectsFromTerminal}
            initialTheme="dark"
          />

          <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
            💡 Pro-tip: Try typing <code className="text-emerald-600 dark:text-emerald-400 font-bold">cat resume.json</code> for structured credentials or <code className="text-emerald-600 dark:text-emerald-400 font-bold">theme matrix</code> to switch phosphor styling.
          </p>
        </section>

        {/* SECTION 2: INTERACTIVE PROJECT SHOWCASE */}
        <ProjectShowcase
          activeTagFilter={activeTagFilter}
          onSelectTag={(tag) => setActiveTagFilter(tag)}
        />

        {/* SECTION 3: SKILLS & ARCHITECTURE CRAFT */}
        <section id="skills" className="space-y-6 pt-6 border-t border-slate-200 dark:border-slate-800">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              Technical Competencies
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Skills & Engineering Craft
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Categorized breakdown of core languages, systems, frameworks, and developer tooling.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Backend & Systems */}
            <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm space-y-4">
              <div className="flex items-center gap-2.5 font-bold text-base text-slate-900 dark:text-white">
                <Server className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span>Backend & Distributed Systems</span>
              </div>
              <div className="space-y-3">
                {DEVELOPER_SKILLS.backend.map((skill) => (
                  <div key={skill.name} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                      <span>{skill.name}</span>
                      <span className="font-mono text-emerald-600 dark:text-emerald-400">{skill.level}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${skill.level}%` }}
                      />
                    </div>
                    <div className="flex gap-1 flex-wrap pt-0.5">
                      {skill.tags.map((t) => (
                        <span key={t} className="text-[10px] text-slate-500">
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Frontend & UI Craft */}
            <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm space-y-4">
              <div className="flex items-center gap-2.5 font-bold text-base text-slate-900 dark:text-white">
                <Layout className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                <span>Frontend & UI Craft</span>
              </div>
              <div className="space-y-3">
                {DEVELOPER_SKILLS.frontend.map((skill) => (
                  <div key={skill.name} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                      <span>{skill.name}</span>
                      <span className="font-mono text-sky-600 dark:text-sky-400">{skill.level}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-sky-500 rounded-full"
                        style={{ width: `${skill.level}%` }}
                      />
                    </div>
                    <div className="flex gap-1 flex-wrap pt-0.5">
                      {skill.tags.map((t) => (
                        <span key={t} className="text-[10px] text-slate-500">
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* DevOps & Cloud */}
            <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm space-y-4">
              <div className="flex items-center gap-2.5 font-bold text-base text-slate-900 dark:text-white">
                <Cloud className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <span>DevOps & Cloud Infrastructure</span>
              </div>
              <div className="space-y-3">
                {DEVELOPER_SKILLS.devops.map((skill) => (
                  <div key={skill.name} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                      <span>{skill.name}</span>
                      <span className="font-mono text-purple-600 dark:text-purple-400">{skill.level}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-500 rounded-full"
                        style={{ width: `${skill.level}%` }}
                      />
                    </div>
                    <div className="flex gap-1 flex-wrap pt-0.5">
                      {skill.tags.map((t) => (
                        <span key={t} className="text-[10px] text-slate-500">
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tools & AI Engines */}
            <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm space-y-4">
              <div className="flex items-center gap-2.5 font-bold text-base text-slate-900 dark:text-white">
                <Wrench className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                <span>Tools & AI Engines</span>
              </div>
              <div className="space-y-3">
                {DEVELOPER_SKILLS.tools.map((skill) => (
                  <div key={skill.name} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                      <span>{skill.name}</span>
                      <span className="font-mono text-amber-600 dark:text-amber-400">{skill.level}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full"
                        style={{ width: `${skill.level}%` }}
                      />
                    </div>
                    <div className="flex gap-1 flex-wrap pt-0.5">
                      {skill.tags.map((t) => (
                        <span key={t} className="text-[10px] text-slate-500">
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 4: CONTACT & PROFILES */}
        <section id="contact" className="pt-6 border-t border-slate-200 dark:border-slate-800">
          <div className="p-8 sm:p-12 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 text-white border border-slate-800 shadow-xl space-y-6">
            <div className="max-w-2xl space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Let&apos;s build impactful software together.
              </h2>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Whether you&apos;re exploring resilient distributed architectures, AI pedagogical engines, or high-performance React frontends, feel free to reach out.
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <a
                href={`mailto:${DEVELOPER_BIO.socials.email}`}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition shadow"
              >
                <Mail className="w-4 h-4" />
                <span>{DEVELOPER_BIO.socials.email}</span>
              </a>

              <a
                href={DEVELOPER_BIO.socials.github}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm transition border border-slate-700"
              >
                <GithubIcon className="w-4 h-4" />
                <span>GitHub Profile</span>
              </a>

              <a
                href={DEVELOPER_BIO.socials.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm transition border border-slate-700"
              >
                <LinkedinIcon className="w-4 h-4" />
                <span>LinkedIn</span>
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 py-8 mt-16 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} {DEVELOPER_BIO.name} (@{DEVELOPER_BIO.handle}). Built with Next.js 16, TypeScript & Tailwind CSS.</p>
          <div className="flex items-center gap-4">
            <a href="#terminal" className="hover:text-emerald-500 transition">Terminal</a>
            <a href="#projects-showcase" className="hover:text-emerald-500 transition">Projects</a>
            <Link href="/" className="hover:text-emerald-500 transition">SmartKids App</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
