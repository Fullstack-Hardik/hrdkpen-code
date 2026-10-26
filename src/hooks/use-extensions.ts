/**
 * use-extensions.ts — HRDK Pen Extension Registry
 *
 * Lightweight built-in extension system. Each extension is a simple record
 * with an id, metadata, and an optional action function.
 * Extensions are persisted to localStorage and toggled from the Settings panel.
 */

import { useState, useCallback } from 'react';
import type { Extension } from '@/types';

const STORAGE_KEY = 'hrdkpen_extensions_v1';

const BUILT_IN_EXTENSIONS: Extension[] = [
  {
    id: 'error-lens',
    name: 'Error Lens',
    description: 'Highlight diagnostics, warnings, and compiler errors directly inline in your code with colored background bars.',
    category: 'linter',
    enabled: true,
    builtIn: true,
    version: '3.6.0',
    author: 'Alexander (usernamehw)',
    repoUrl: 'https://github.com/usernamehw/vscode-error-lens',
    license: 'MIT',
    permissions: ['editor.decorations', 'diagnostics.read'],
    compatibility: 'Integrated into Editor',
  },
  {
    id: 'material-icon-theme',
    name: 'Material Icon Theme',
    description: 'Material Design file & folder icons supporting 200+ languages, frameworks, and build configs.',
    category: 'theme',
    enabled: true,
    builtIn: true,
    version: '5.10.0',
    author: 'Philipp Kief',
    repoUrl: 'https://github.com/material-extensions/vscode-material-icon-theme',
    license: 'MIT',
    permissions: ['fileExplorer.icons'],
    compatibility: 'Native SVG Icon Engine',
  },
  {
    id: 'file-nesting-config',
    name: 'File Nesting Config',
    description: 'Nest generated files, styles, tests, and lockfiles under their parent component for clean workspace trees.',
    category: 'utility',
    enabled: true,
    builtIn: true,
    version: '1.2.1',
    author: 'Anthony Fu',
    repoUrl: 'https://github.com/antfu/vscode-file-nesting-config',
    license: 'MIT',
    permissions: ['workspace.treeStructure'],
    compatibility: 'Supported in File Tree',
  },
  {
    id: 'code-spell-checker',
    name: 'Code Spell Checker',
    description: 'Source-code spell checker designed for camelCase, snake_case, identifiers, and markdown documentation.',
    category: 'linter',
    enabled: true,
    builtIn: true,
    version: '4.0.35',
    author: 'Street Side Software',
    repoUrl: 'https://github.com/streetsidesoftware/vscode-spell-checker',
    license: 'MIT',
    permissions: ['editor.spelling', 'diagnostics.read'],
    compatibility: 'Dictionary Regex Engine',
  },
  {
    id: 'playwright-test',
    name: 'Playwright Test Runner',
    description: 'End-to-end browser testing suite with visual test runner, headless Chromium execution, and trace logs.',
    category: 'testing',
    enabled: false,
    builtIn: true,
    version: '1.47.0',
    author: 'Microsoft',
    repoUrl: 'https://github.com/microsoft/playwright-vscode',
    license: 'Apache-2.0',
    permissions: ['terminal.exec', 'browser.launch'],
    compatibility: 'Requires Node/Host Process',
  },
  {
    id: 'better-antigravity',
    name: 'Better Antigravity',
    description: 'Enhanced agentic workflows, contextual command generation, and intelligent project scaffolding.',
    category: 'ai',
    enabled: true,
    builtIn: true,
    version: '1.1.2',
    author: 'kanezal',
    repoUrl: 'https://open-vsx.org/extension/kanezal/better-antigravity',
    license: 'MIT',
    permissions: ['ai.assistant', 'prompt.context'],
    compatibility: 'Native Antigravity Host',
  },
  {
    id: 'prettier',
    name: 'Prettier - Code Formatter',
    description: 'Opinionated code formatter for JS, TS, HTML, CSS, JSON, and Markdown with automatic formatting on save.',
    category: 'formatter',
    enabled: true,
    builtIn: true,
    version: '3.3.3',
    author: 'Prettier',
    repoUrl: 'https://github.com/prettier/prettier',
    license: 'MIT',
    permissions: ['editor.format'],
    compatibility: 'WASM Browser Formatter',
  },
  {
    id: 'eslint-linter',
    name: 'ESLint',
    description: 'Find and fix syntax, accessibility, and architectural pattern issues across JavaScript & TypeScript.',
    category: 'linter',
    enabled: true,
    builtIn: true,
    version: '9.9.0',
    author: 'ESLint Community',
    repoUrl: 'https://github.com/eslint/eslint',
    license: 'MIT',
    permissions: ['editor.lint'],
    compatibility: 'Integrated Linter',
  },
  {
    id: 'gitlens',
    name: 'GitLens — Git Supercharged',
    description: 'Line-by-line blame annotations, commit heatmaps, history navigation, and repository insights.',
    category: 'git',
    enabled: true,
    builtIn: true,
    version: '15.4.1',
    author: 'GitKraken',
    repoUrl: 'https://github.com/gitkraken/vscode-gitlens',
    license: 'MIT (Free Tier)',
    permissions: ['git.status', 'git.log'],
    compatibility: 'Git Adapter',
  },
  {
    id: 'cline-agent',
    name: 'Cline Autonomous Agent',
    description: 'Autonomous CLI & coding agent supporting terminal command execution, file editing, and iterative verification.',
    category: 'ai',
    enabled: true,
    builtIn: true,
    version: '2.1.3',
    author: 'Cline Community',
    repoUrl: 'https://github.com/cline/cline',
    license: 'Apache-2.0',
    permissions: ['ai.chat', 'terminal.exec', 'fs.readWrite'],
    compatibility: 'AI Assistant Panel',
  },
  {
    id: 'continue-dev',
    name: 'Continue Open-Source AI',
    description: 'Flexible LLM integration for autocomplete, chat, refactoring, and codebase indexing.',
    category: 'ai',
    enabled: true,
    builtIn: true,
    version: '0.9.2',
    author: 'Continue',
    repoUrl: 'https://github.com/continuedev/continue',
    license: 'Apache-2.0',
    permissions: ['ai.autocomplete', 'ai.chat'],
    compatibility: 'Smart Completion Host',
  },
];

function loadExtensions(): Extension[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return BUILT_IN_EXTENSIONS;

    const saved: { id: string; enabled: boolean }[] = JSON.parse(raw);
    // Merge saved enabled states with the canonical built-in list
    return BUILT_IN_EXTENSIONS.map(ext => {
      const saved_ext = saved.find(s => s.id === ext.id);
      return saved_ext ? { ...ext, enabled: saved_ext.enabled } : ext;
    });
  } catch {
    return BUILT_IN_EXTENSIONS;
  }
}

function persistExtensions(exts: Extension[]) {
  try {
    const toSave = exts.map(e => ({ id: e.id, enabled: e.enabled }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch {
    // Non-critical
  }
}

export function useExtensions() {
  const [extensions, setExtensions] = useState<Extension[]>(loadExtensions);

  const toggle = useCallback((id: string, enabled: boolean) => {
    setExtensions(prev => {
      const next = prev.map(e => e.id === id ? { ...e, enabled } : e);
      persistExtensions(next);
      return next;
    });
  }, []);

  const isEnabled = useCallback(
    (id: string) => extensions.find(e => e.id === id)?.enabled ?? false,
    [extensions]
  );

  return { extensions, toggle, isEnabled };
}
