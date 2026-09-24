// src/lib/terminal/commands.ts
// Modular Terminal Commands Registry & Execution Engine

import {
  DEVELOPER_BIO,
  DEVELOPER_SKILLS,
  RESUME_JSON,
  PORTFOLIO_PROJECTS,
} from '@/data/portfolio-data';

export type TerminalTheme = 'dark' | 'light' | 'matrix';

export interface CommandContext {
  setTheme: (theme: TerminalTheme) => void;
  currentTheme: TerminalTheme;
  clearHistory: () => void;
  onFilterProjects?: (tag: string) => void;
}

export interface CommandOutput {
  type: 'text' | 'html' | 'json' | 'error' | 'table';
  content: string | React.ReactNode;
}

export interface CommandDefinition {
  name: string;
  description: string;
  usage: string;
  aliases?: string[];
  execute: (args: string[], context: CommandContext) => CommandOutput | Promise<CommandOutput>;
}

// Levenshtein distance for smart command suggestions
function getLevenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

export const TERMINAL_COMMANDS: Record<string, CommandDefinition> = {
  help: {
    name: 'help',
    description: 'List all available commands with brief descriptions',
    usage: 'help',
    execute: () => {
      const commandList = Object.values(TERMINAL_COMMANDS)
        .map(
          (cmd) =>
            `  \u001b[1;36m${cmd.name.padEnd(14)}\u001b[0m ${cmd.description}`
        )
        .join('\n');

      return {
        type: 'text',
        content: `Available Commands:
${commandList}

Navigation & Shortcuts:
  \u001b[33mTab\u001b[0m        Autocomplete command or argument
  \u001b[33mUp/Down\u001b[0m    Navigate through previous command history
  \u001b[33mCtrl + L\u001b[0m   Clear terminal screen`,
      };
    },
  },

  about: {
    name: 'about',
    description: 'Print developer bio, current role, and core focus areas',
    usage: 'about',
    execute: () => {
      return {
        type: 'text',
        content: `\u001b[1;32m${DEVELOPER_BIO.name} (@${DEVELOPER_BIO.handle})\u001b[0m
${DEVELOPER_BIO.role} — ${DEVELOPER_BIO.location}

${DEVELOPER_BIO.bio}

Core Focus Areas:
${DEVELOPER_BIO.focusAreas.map((area) => `  \u001b[35m▸\u001b[0m ${area}`).join('\n')}

GitHub:   ${DEVELOPER_BIO.socials.github}
LinkedIn: ${DEVELOPER_BIO.socials.linkedin}`,
      };
    },
  },

  skills: {
    name: 'skills',
    description: 'Display tech stack categorized with visual ASCII proficiency bars',
    usage: 'skills',
    execute: () => {
      const renderCategory = (
        title: string,
        items: { name: string; level: number; tags: string[] }[]
      ) => {
        const lines = items.map((item) => {
          const filled = Math.round(item.level / 10);
          const empty = 10 - filled;
          const bar = `[${'■'.repeat(filled)}${' '.repeat(empty)}]`;
          return `  ${item.name.padEnd(24)} \u001b[32m${bar}\u001b[0m ${item.level}% (${item.tags.join(', ')})`;
        });
        return `\u001b[1;33m[ ${title.toUpperCase()} ]\u001b[0m\n${lines.join('\n')}`;
      };

      const content = [
        renderCategory('Backend & Systems', DEVELOPER_SKILLS.backend),
        renderCategory('Frontend & UI Craft', DEVELOPER_SKILLS.frontend),
        renderCategory('DevOps & Cloud', DEVELOPER_SKILLS.devops),
        renderCategory('Tools & AI Engines', DEVELOPER_SKILLS.tools),
      ].join('\n\n');

      return {
        type: 'text',
        content,
      };
    },
  },

  projects: {
    name: 'projects',
    description: 'List key projects with status, stack, and links (supports --tag=<tag>)',
    usage: 'projects [--tag=<tag>]',
    execute: (args, context) => {
      let filtered = PORTFOLIO_PROJECTS;
      const tagArg = args.find((a) => a.startsWith('--tag='));
      if (tagArg) {
        const tag = tagArg.replace('--tag=', '').toLowerCase();
        filtered = PORTFOLIO_PROJECTS.filter((p) =>
          p.tags.some((t) => t.toLowerCase().includes(tag))
        );
        if (context.onFilterProjects) {
          context.onFilterProjects(tag);
        }
      }

      if (filtered.length === 0) {
        return {
          type: 'text',
          content: `No projects found matching query. Available tags: Next.js, React, TypeScript, Gemini, Remotion, Web Audio.`,
        };
      }

      const list = filtered
        .map(
          (p) =>
            `\u001b[1;36m${p.title}\u001b[0m [${p.status}]
  \u001b[90m${p.tagline}\u001b[0m
  Stack:  ${p.tags.join(', ')}
  GitHub: ${p.githubUrl || 'Private'}
  Live:   ${p.liveUrl || 'Internal'}`
        )
        .join('\n\n');

      return {
        type: 'text',
        content: `Found ${filtered.length} project(s):\n\n${list}\n\n\u001b[33mTip: Click or scroll down to the Live Project Showcase to test interactive sandboxes!\u001b[0m`,
      };
    },
  },

  cat: {
    name: 'cat',
    description: 'Output structured JSON resume data',
    usage: 'cat resume.json',
    execute: (args) => {
      const target = args[0];
      if (!target || target !== 'resume.json') {
        return {
          type: 'error',
          content: `cat: ${target || 'missing operand'}: No such file or directory. Try 'cat resume.json'`,
        };
      }

      return {
        type: 'json',
        content: JSON.stringify(RESUME_JSON, null, 2),
      };
    },
  },

  contact: {
    name: 'contact',
    description: 'Print clickable contact and social profiles',
    usage: 'contact',
    execute: () => {
      return {
        type: 'text',
        content: `Connect with ${DEVELOPER_BIO.name}:

  \u001b[1;34mEmail:\u001b[0m    ${DEVELOPER_BIO.socials.email}
  \u001b[1;34mGitHub:\u001b[0m   ${DEVELOPER_BIO.socials.github}
  \u001b[1;34mLinkedIn:\u001b[0m ${DEVELOPER_BIO.socials.linkedin}
  ${DEVELOPER_BIO.socials.twitter ? `\u001b[1;34mTwitter:\u001b[0m  ${DEVELOPER_BIO.socials.twitter}` : ''}`,
      };
    },
  },

  theme: {
    name: 'theme',
    description: 'Switch terminal and showcase color theme (dark | light | matrix)',
    usage: 'theme <dark|light|matrix>',
    execute: (args, context) => {
      const chosenTheme = args[0]?.toLowerCase() as TerminalTheme;
      if (chosenTheme === 'dark' || chosenTheme === 'light' || chosenTheme === 'matrix') {
        context.setTheme(chosenTheme);
        return {
          type: 'text',
          content: `Terminal theme switched to \u001b[1;32m${chosenTheme}\u001b[0m mode.`,
        };
      }
      return {
        type: 'error',
        content: `Invalid theme: '${args[0] || ''}'. Supported themes: dark, light, matrix.`,
      };
    },
  },

  clear: {
    name: 'clear',
    description: 'Clear the terminal screen history',
    usage: 'clear',
    execute: (_, context) => {
      context.clearHistory();
      return {
        type: 'text',
        content: '',
      };
    },
  },
};

/**
 * Execute command string and return formatted output with typo suggestions
 */
export async function executeTerminalCommand(
  rawInput: string,
  context: CommandContext
): Promise<CommandOutput> {
  const trimmed = rawInput.trim();
  if (!trimmed) {
    return { type: 'text', content: '' };
  }

  const parts = trimmed.split(/\s+/);
  const commandName = parts[0].toLowerCase();
  const args = parts.slice(1);

  const command = TERMINAL_COMMANDS[commandName];
  if (command) {
    return command.execute(args, context);
  }

  // Find close match using Levenshtein distance
  const knownCommands = Object.keys(TERMINAL_COMMANDS);
  let closestMatch = '';
  let minDistance = 999;

  for (const cmd of knownCommands) {
    const dist = getLevenshteinDistance(commandName, cmd);
    if (dist < minDistance && dist <= 3) {
      minDistance = dist;
      closestMatch = cmd;
    }
  }

  let suggestion = '';
  if (closestMatch) {
    suggestion = `\nDid you mean '\u001b[1;32m${closestMatch}\u001b[0m'?`;
  }

  return {
    type: 'error',
    content: `Command not found: ${commandName}. Type '\u001b[1;33mhelp\u001b[0m' for available commands.${suggestion}`,
  };
}

/**
 * Tab autocomplete suggestions for command or argument
 */
export function getTerminalAutocomplete(input: string): string | null {
  const trimmed = input.trimStart();
  const parts = trimmed.split(/\s+/);

  if (parts.length === 1) {
    const partial = parts[0].toLowerCase();
    const matches = Object.keys(TERMINAL_COMMANDS).filter((cmd) => cmd.startsWith(partial));
    if (matches.length === 1) {
      return matches[0];
    }
  } else if (parts.length === 2) {
    const cmd = parts[0].toLowerCase();
    const arg = parts[1].toLowerCase();

    if (cmd === 'cat' && 'resume.json'.startsWith(arg)) {
      return `cat resume.json`;
    }
    if (cmd === 'theme') {
      const themes = ['dark', 'light', 'matrix'];
      const themeMatch = themes.find((t) => t.startsWith(arg));
      if (themeMatch) {
        return `theme ${themeMatch}`;
      }
    }
    if (cmd === 'projects' && '--tag='.startsWith(arg)) {
      return `projects --tag=`;
    }
  }

  return null;
}
