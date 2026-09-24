'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Terminal as TerminalIcon,
  Maximize2,
  Minimize2,
  X,
  Sparkles,
  Sun,
  Moon,
  Zap,
  CornerDownLeft,
  Copy,
  Check,
} from 'lucide-react';
import {
  executeTerminalCommand,
  getTerminalAutocomplete,
  TerminalTheme,
  CommandOutput,
} from '@/lib/terminal/commands';

interface TerminalEntry {
  id: string;
  command: string;
  output: CommandOutput;
  timestamp: string;
}

interface TerminalEmulatorProps {
  onFilterProjects?: (tag: string) => void;
  initialTheme?: TerminalTheme;
  className?: string;
}

// Quick action chips for mobile/desktop convenience
const QUICK_COMMANDS = [
  { label: 'help', cmd: 'help', desc: 'List commands' },
  { label: 'about', cmd: 'about', desc: 'Developer bio' },
  { label: 'skills', cmd: 'skills', desc: 'Tech stack' },
  { label: 'projects', cmd: 'projects', desc: 'Key projects' },
  { label: 'cat resume.json', cmd: 'cat resume.json', desc: 'Resume' },
  { label: 'contact', cmd: 'contact', desc: 'Social & email' },
  { label: 'theme matrix', cmd: 'theme matrix', desc: 'Matrix mode' },
  { label: 'clear', cmd: 'clear', desc: 'Reset screen' },
];

/**
 * Robust ANSI escape code to React element converter
 */
function renderAnsi(text: string): React.ReactNode[] {
  // Regex matches \u001b[...m
  const parts = text.split(/(\u001b\[[0-9;]*m)/g);
  let currentClasses: string[] = [];
  const nodes: React.ReactNode[] = [];

  parts.forEach((part, index) => {
    if (!part) return;

    if (part.startsWith('\u001b[')) {
      const code = part.slice(2, -1);
      if (code === '0' || code === '') {
        currentClasses = [];
      } else {
        const codes = code.split(';');
        codes.forEach((c) => {
          if (c === '1') currentClasses.push('font-bold');
          else if (c === '31') currentClasses.push('text-red-400');
          else if (c === '32') currentClasses.push('text-emerald-400');
          else if (c === '33') currentClasses.push('text-amber-400');
          else if (c === '34') currentClasses.push('text-sky-400');
          else if (c === '35') currentClasses.push('text-purple-400');
          else if (c === '36') currentClasses.push('text-cyan-400');
          else if (c === '90') currentClasses.push('text-slate-400');
        });
      }
    } else {
      nodes.push(
        currentClasses.length > 0 ? (
          <span key={index} className={currentClasses.join(' ')}>
            {part}
          </span>
        ) : (
          part
        )
      );
    }
  });

  return nodes;
}

/**
 * Syntax-highlighted JSON renderer for resume.json
 */
function renderHighlightedJson(jsonStr: string) {
  try {
    const formatted = jsonStr;
    // Highlight keys, strings, numbers, booleans
    const tokens = formatted.split(
      /("(?:\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g
    );

    return (
      <pre className="font-mono text-xs sm:text-sm whitespace-pre-wrap select-text leading-relaxed">
        {tokens.map((token, idx) => {
          if (!token) return null;
          if (/^"/.test(token)) {
            if (/:$/.test(token)) {
              return (
                <span key={idx} className="text-sky-300 font-semibold">
                  {token}
                </span>
              );
            }
            return (
              <span key={idx} className="text-emerald-300">
                {token}
              </span>
            );
          } else if (/true|false/.test(token)) {
            return (
              <span key={idx} className="text-purple-400 font-bold">
                {token}
              </span>
            );
          } else if (/null/.test(token)) {
            return (
              <span key={idx} className="text-slate-500 italic">
                {token}
              </span>
            );
          } else if (/^-?\d+/.test(token)) {
            return (
              <span key={idx} className="text-amber-300">
                {token}
              </span>
            );
          }
          return <span key={idx}>{token}</span>;
        })}
      </pre>
    );
  } catch {
    return <pre className="font-mono text-xs sm:text-sm">{jsonStr}</pre>;
  }
}

export function TerminalEmulator({
  onFilterProjects,
  initialTheme = 'dark',
  className = '',
}: TerminalEmulatorProps) {
  const [theme, setTheme] = useState<TerminalTheme>(initialTheme);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [history, setHistory] = useState<TerminalEntry[]>([
    {
      id: 'welcome',
      command: 'system.init',
      timestamp: 'now',
      output: {
        type: 'text',
        content: `\u001b[1;36m┌─────────────────────────────────────────────────────────────┐\u001b[0m
\u001b[1;36m│\u001b[0m  \u001b[1;32mTola's Interactive Portfolio Terminal\u001b[0m (v2.4.0)             \u001b[1;36m│\u001b[0m
\u001b[1;36m│\u001b[0m  Full-Stack & EdTech Architect • Phnom Penh, Cambodia       \u001b[1;36m│\u001b[0m
\u001b[1;36m└─────────────────────────────────────────────────────────────┘\u001b[0m
Type '\u001b[1;33mhelp\u001b[0m' to list commands, '\u001b[1;33mprojects\u001b[0m' to explore deep dives,
or click the quick command chips below.`,
      },
    },
  ]);
  const [inputVal, setInputVal] = useState<string>('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const terminalBodyRef = useRef<HTMLDivElement>(null);
  const draftInputRef = useRef<string>('');

  // Auto-scroll to bottom on new entry
  useEffect(() => {
    if (terminalBodyRef.current) {
      terminalBodyRef.current.scrollTop = terminalBodyRef.current.scrollHeight;
    }
  }, [history]);

  // Focus terminal input when clicking anywhere in terminal
  const handleContainerClick = () => {
    inputRef.current?.focus();
  };

  const handleClearHistory = () => {
    setHistory([]);
  };

  const runCommand = async (cmdString: string) => {
    const trimmed = cmdString.trim();
    if (!trimmed) return;

    // Save to command history for Up/Down recall
    setCommandHistory((prev) => [...prev, trimmed]);
    setHistoryIndex(-1);
    draftInputRef.current = '';

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    // Handle special client-side 'clear'
    if (trimmed.toLowerCase() === 'clear') {
      handleClearHistory();
      setInputVal('');
      return;
    }

    const output = await executeTerminalCommand(trimmed, {
      currentTheme: theme,
      setTheme: (newTheme) => setTheme(newTheme),
      clearHistory: handleClearHistory,
      onFilterProjects,
    });

    setHistory((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).substring(2, 9),
        command: trimmed,
        output,
        timestamp,
      },
    ]);

    setInputVal('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Ctrl + L -> Clear screen
    if (e.ctrlKey && e.key.toLowerCase() === 'l') {
      e.preventDefault();
      handleClearHistory();
      return;
    }

    // Tab -> Autocomplete
    if (e.key === 'Tab') {
      e.preventDefault();
      const autocomplete = getTerminalAutocomplete(inputVal);
      if (autocomplete) {
        setInputVal(autocomplete);
      }
      return;
    }

    // Up Arrow -> Previous history
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length === 0) return;

      if (historyIndex === -1) {
        draftInputRef.current = inputVal;
      }

      const nextIndex = historyIndex + 1;
      if (nextIndex < commandHistory.length) {
        setHistoryIndex(nextIndex);
        setInputVal(commandHistory[commandHistory.length - 1 - nextIndex]);
      }
      return;
    }

    // Down Arrow -> Newer history
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const nextIndex = historyIndex - 1;
        setHistoryIndex(nextIndex);
        setInputVal(commandHistory[commandHistory.length - 1 - nextIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInputVal(draftInputRef.current);
      }
      return;
    }

    // Enter -> Execute
    if (e.key === 'Enter') {
      e.preventDefault();
      runCommand(inputVal);
    }
  };

  const copyTranscript = () => {
    const text = history
      .map((h) => `$ ${h.command}\n${typeof h.output.content === 'string' ? h.output.content : ''}`)
      .join('\n\n');
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Theme Styling Configurations
  const themeStyles = {
    dark: {
      wrapper: 'bg-slate-950 text-slate-100 border-slate-800/80 shadow-2xl shadow-slate-950/50',
      header: 'bg-slate-900/90 border-b border-slate-800 text-slate-400',
      promptUser: 'text-emerald-400 font-semibold',
      promptPath: 'text-sky-400 font-semibold',
      caret: 'bg-emerald-400',
      terminalBody: 'bg-slate-950/95 text-slate-200',
      chip: 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-slate-700/60',
      chipActive: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      commandText: 'text-slate-100',
    },
    matrix: {
      wrapper: 'bg-black text-lime-400 border-lime-500/40 shadow-2xl shadow-lime-950/40',
      header: 'bg-zinc-950 border-b border-lime-900/60 text-lime-500',
      promptUser: 'text-lime-300 font-bold',
      promptPath: 'text-emerald-400 font-bold',
      caret: 'bg-lime-400 shadow-[0_0_8px_#a3e635]',
      terminalBody: 'bg-black text-lime-400 selection:bg-lime-950 selection:text-lime-200',
      chip: 'bg-zinc-900 hover:bg-zinc-800 text-lime-400 border-lime-800/40',
      chipActive: 'bg-lime-500/20 text-lime-300 border-lime-500/60 shadow-[0_0_10px_rgba(163,230,53,0.2)]',
      commandText: 'text-lime-200',
    },
    light: {
      wrapper: 'bg-white text-slate-900 border-slate-200 shadow-xl shadow-slate-200/50',
      header: 'bg-slate-100 border-b border-slate-200 text-slate-600',
      promptUser: 'text-blue-600 font-semibold',
      promptPath: 'text-indigo-600 font-semibold',
      caret: 'bg-blue-600',
      terminalBody: 'bg-slate-50 text-slate-800',
      chip: 'bg-slate-200/80 hover:bg-slate-300 text-slate-700 border-slate-300',
      chipActive: 'bg-blue-100 text-blue-800 border-blue-300',
      commandText: 'text-slate-900 font-semibold',
    },
  }[theme];

  return (
    <div
      className={`rounded-xl border transition-all duration-300 overflow-hidden flex flex-col font-mono select-text ${
        themeStyles.wrapper
      } ${isExpanded ? 'fixed inset-4 z-50 h-[calc(100vh-2rem)]' : 'h-[540px] w-full'} ${className}`}
      onClick={handleContainerClick}
    >
      {/* Top Bar (macOS / Tiling Window Style) */}
      <div
        className={`px-4 py-3 flex items-center justify-between select-none ${themeStyles.header}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Window Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 mr-2">
            <span
              className="w-3 h-3 rounded-full bg-red-500/90 hover:opacity-80 transition cursor-pointer flex items-center justify-center text-[8px] text-red-950 font-bold"
              onClick={handleClearHistory}
              title="Clear terminal"
            >
              <X className="w-2 h-2 opacity-0 hover:opacity-100" />
            </span>
            <span
              className="w-3 h-3 rounded-full bg-amber-500/90 hover:opacity-80 transition cursor-pointer flex items-center justify-center"
              onClick={() => setIsExpanded(false)}
              title="Standard size"
            />
            <span
              className="w-3 h-3 rounded-full bg-emerald-500/90 hover:opacity-80 transition cursor-pointer flex items-center justify-center text-[8px] text-emerald-950 font-bold"
              onClick={() => setIsExpanded(!isExpanded)}
              title={isExpanded ? 'Exit full screen' : 'Expand full screen'}
            >
              {isExpanded ? (
                <Minimize2 className="w-2 h-2 opacity-0 hover:opacity-100" />
              ) : (
                <Maximize2 className="w-2 h-2 opacity-0 hover:opacity-100" />
              )}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-semibold tracking-wide">
            <TerminalIcon className="w-3.5 h-3.5 opacity-70" />
            <span>visitor@portfolio: ~ (bash)</span>
          </div>
        </div>

        {/* Right Action Tools: Copy & Theme Switcher */}
        <div className="flex items-center gap-3">
          {/* Copy Transcript */}
          <button
            onClick={copyTranscript}
            className="hidden sm:flex items-center gap-1 px-2 py-1 text-xs rounded hover:bg-black/10 transition opacity-80 hover:opacity-100"
            title="Copy terminal transcript"
          >
            {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{isCopied ? 'Copied' : 'Copy'}</span>
          </button>

          {/* Theme Toggles */}
          <div className="flex items-center gap-1 bg-black/20 p-0.5 rounded-md border border-white/10 text-xs">
            <button
              onClick={() => setTheme('dark')}
              className={`px-1.5 py-0.5 rounded flex items-center gap-1 transition ${
                theme === 'dark' ? 'bg-slate-700 text-white shadow-sm' : 'opacity-60 hover:opacity-100'
              }`}
              title="Dark Mode"
            >
              <Moon className="w-3 h-3" />
              <span className="hidden md:inline">Dark</span>
            </button>
            <button
              onClick={() => setTheme('matrix')}
              className={`px-1.5 py-0.5 rounded flex items-center gap-1 transition ${
                theme === 'matrix' ? 'bg-lime-950 text-lime-300 shadow-sm' : 'opacity-60 hover:opacity-100'
              }`}
              title="Matrix Mode"
            >
              <Zap className="w-3 h-3" />
              <span className="hidden md:inline">Matrix</span>
            </button>
            <button
              onClick={() => setTheme('light')}
              className={`px-1.5 py-0.5 rounded flex items-center gap-1 transition ${
                theme === 'light' ? 'bg-white text-slate-800 shadow-sm' : 'opacity-60 hover:opacity-100'
              }`}
              title="Light Mode"
            >
              <Sun className="w-3 h-3" />
              <span className="hidden md:inline">Light</span>
            </button>
          </div>
        </div>
      </div>

      {/* Terminal Output Area */}
      <div
        ref={terminalBodyRef}
        className={`flex-1 p-4 overflow-y-auto space-y-4 text-xs sm:text-sm select-text scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent ${themeStyles.terminalBody}`}
      >
        {history.map((entry) => (
          <div key={entry.id} className="space-y-1.5">
            {/* Command line */}
            <div className="flex items-center gap-2 opacity-90">
              <span className={themeStyles.promptUser}>visitor@portfolio</span>
              <span className="opacity-40">:</span>
              <span className={themeStyles.promptPath}>~$</span>
              <span className={themeStyles.commandText}>{entry.command}</span>
              <span className="text-[10px] opacity-30 ml-auto select-none">{entry.timestamp}</span>
            </div>

            {/* Output content */}
            {entry.output.content && (
              <div className="pl-2 sm:pl-4 border-l-2 border-slate-700/40 mt-1 whitespace-pre-wrap leading-relaxed">
                {entry.output.type === 'json' ? (
                  renderHighlightedJson(entry.output.content as string)
                ) : (
                  <div className="font-mono">{renderAnsi(entry.output.content as string)}</div>
                )}
              </div>
            )}
          </div>
        ))}

        {/* Active Command Input Line */}
        <div className="flex items-center gap-2 pt-2">
          <span className={themeStyles.promptUser}>visitor@portfolio</span>
          <span className="opacity-40">:</span>
          <span className={themeStyles.promptPath}>~$</span>

          <div className="flex-1 relative flex items-center">
            <input
              ref={inputRef}
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
              spellCheck={false}
              autoCapitalize="off"
              autoComplete="off"
              className="w-full bg-transparent outline-none border-none p-0 text-inherit font-mono focus:ring-0 text-xs sm:text-sm"
              placeholder="Type 'help' or click buttons below..."
            />
          </div>
          <CornerDownLeft className="w-3.5 h-3.5 opacity-30 select-none hidden sm:block" />
        </div>
      </div>

      {/* Touch-friendly Quick Command Bar (Mobile & Fast Interaction) */}
      <div
        className="px-3 py-2.5 bg-black/30 border-t border-white/5 flex items-center gap-2 overflow-x-auto select-none no-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="text-[11px] font-semibold opacity-50 flex items-center gap-1 shrink-0">
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span className="hidden sm:inline">Quick Run:</span>
        </span>

        {QUICK_COMMANDS.map((qc) => (
          <button
            key={qc.cmd}
            onClick={() => runCommand(qc.cmd)}
            className={`px-2.5 py-1 text-xs rounded-md border transition-all whitespace-nowrap active:scale-95 shrink-0 ${themeStyles.chip}`}
            title={qc.desc}
          >
            {qc.label}
          </button>
        ))}
      </div>
    </div>
  );
}
