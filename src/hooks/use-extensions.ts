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
    id: 'prettier',
    name: 'Prettier - Code Formatter',
    description: 'Opinionated code formatter for JS, TS, HTML, CSS, JSON, and Markdown with automatic formatting on save.',
    category: 'formatter',
    enabled: true,
    builtIn: true,
    version: '3.3.3',
    author: 'Prettier',
  },
  {
    id: 'eslint-linter',
    name: 'ESLint',
    description: 'Find and fix syntax, accessibility, and architectural pattern issues across JavaScript & TypeScript.',
    category: 'linter',
    enabled: true,
    builtIn: true,
    version: '9.9.0',
    author: 'Microsoft',
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
  },
  {
    id: 'error-lens',
    name: 'Error Lens',
    description: 'Highlight diagnostics, warnings, and compiler errors directly inline in your code with colored background bars.',
    category: 'linter',
    enabled: true,
    builtIn: true,
    version: '3.6.0',
    author: 'Alexander',
  },
  {
    id: 'todo-tree',
    name: 'Todo Tree',
    description: 'Quickly search and catalog TODO, FIXME, BUG, and HACK tags across your entire workspace.',
    category: 'utility',
    enabled: true,
    builtIn: true,
    version: '0.22.6',
    author: 'Gruntfuggly',
  },
  {
    id: 'console-ninja',
    name: 'Console Ninja',
    description: 'Display console.log output, runtime execution durations, and variable values inline next to your code.',
    category: 'utility',
    enabled: true,
    builtIn: true,
    version: '1.0.38',
    author: 'Wallaby.js',
  },
  {
    id: 'better-comments',
    name: 'Better Comments',
    description: 'Categorize annotations into Alerts (!), Queries (?), TODOs (*), and Highlights for cleaner codebase audits.',
    category: 'utility',
    enabled: true,
    builtIn: true,
    version: '3.0.2',
    author: 'Aaron Bond',
  },
  {
    id: 'thunder-client',
    name: 'Thunder Client API Tester',
    description: 'Lightweight REST & GraphQL client directly inside the editor for testing local endpoints and WebContainer servers.',
    category: 'utility',
    enabled: true,
    builtIn: true,
    version: '2.24.0',
    author: 'Thunder Client',
  },
  {
    id: 'react-snippets',
    name: 'ES7+ React/Redux/React-Native Snippets',
    description: 'Essential modern React snippets, hooks (useState, useEffect, useMemo), and boilerplate templates.',
    category: 'snippets',
    enabled: true,
    builtIn: true,
    version: '4.4.3',
    author: 'dsznajder',
  },
  {
    id: 'tailwind-intellisense',
    name: 'Tailwind CSS IntelliSense',
    description: 'Intelligent Tailwind CSS class autocomplete, CSS variable preview, and syntax highlighting.',
    category: 'autocomplete',
    enabled: true,
    builtIn: true,
    version: '0.10.5',
    author: 'Tailwind Labs',
  },
  {
    id: 'path-intellisense',
    name: 'Path Intellisense',
    description: 'Autocompletes filenames and relative workspace paths inside import statements and asset tags.',
    category: 'autocomplete',
    enabled: true,
    builtIn: true,
    version: '2.9.0',
    author: 'Christian Kohler',
  },
  {
    id: 'auto-close-tag',
    name: 'Auto Close Tag',
    description: 'Automatically inserts matching closing tags for HTML, XML, and JSX tags as you type.',
    category: 'utility',
    enabled: true,
    builtIn: true,
    version: '0.5.15',
    author: 'Jun Han',
  },
  {
    id: 'auto-rename-tag',
    name: 'Auto Rename Tag',
    description: 'Synchronously rename opening and closing HTML/JSX tags simultaneously.',
    category: 'utility',
    enabled: true,
    builtIn: true,
    version: '0.1.10',
    author: 'Jun Han',
  },
  {
    id: 'color-picker',
    name: 'Color Highlight & Picker',
    description: 'Colorizes CSS color codes, hex strings, and hsl/rgb values with an inline swatch picker.',
    category: 'utility',
    enabled: true,
    builtIn: true,
    version: '2.8.0',
    author: 'Sergii N',
  },
  {
    id: 'markdown-preview',
    name: 'Markdown Enhanced Preview',
    description: 'Live interactive GitHub Flavored Markdown preview with math expressions and diagram support.',
    category: 'preview',
    enabled: true,
    builtIn: true,
    version: '1.2.0',
    author: 'Yiyi Wang',
  },
  {
    id: 'ai-copilot-agent',
    name: 'Antigravity AI Pair Programmer',
    description: 'Intelligent in-editor code explanation, refactoring, bug-fixing, and contextual generation.',
    category: 'ai',
    enabled: true,
    builtIn: true,
    version: '2.0.0',
    author: 'Google Antigravity',
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
