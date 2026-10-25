import { useEffect, useState } from 'react';
import { Command } from 'cmdk';
import { 
  Search, 
  FileCode, 
  Play, 
  Settings, 
  Bot, 
  BookOpen, 
  ImageIcon, 
  Terminal, 
  Server, 
  Code2, 
  RotateCcw, 
  FolderPlus, 
  Share2, 
  Sparkles,
  Maximize2,
  FolderTree,
  PenTool,
  GraduationCap
} from 'lucide-react';
import type { FileNode } from '@/types';
import { SUPPORTED_LANGUAGES } from '@/lib/languageRegistry';

export const CommandPalette = ({
  open,
  setOpen,
  onAction,
  files = []
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  onAction: (action: string, payload?: any) => void;
  files: FileNode[];
}) => {
  const [filter, setFilter] = useState('');

  // Toggle the menu when Ctrl+K or Ctrl+Shift+P (or ⌘K / ⌘Shift+P) is pressed
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen(true);
      } else if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        setOpen(true);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [setOpen]);

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label="Global Command Menu"
      className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh] sm:pt-[15vh] bg-black/50 backdrop-blur-sm"
    >
      <div className="w-full max-w-2xl bg-editor-panel border border-editor-border rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center border-b border-editor-border px-3.5 py-1">
          <Search className="w-4 h-4 text-editor-text-muted" />
          <Command.Input
            autoFocus
            value={filter}
            onValueChange={setFilter}
            placeholder="Type a command or search files (Ctrl+P, Ctrl+Shift+P)..."
            className="w-full h-11 bg-transparent border-none outline-none text-sm text-editor-text placeholder:text-editor-text-muted ml-3"
          />
          <kbd className="px-2 py-0.5 text-[10px] font-mono text-[hsl(var(--subtext0))] bg-[hsl(var(--surface0))] rounded border border-[hsl(var(--surface1))]">
            ESC
          </kbd>
        </div>

        <Command.List className="max-h-[380px] overflow-y-auto p-2 custom-scrollbar">
          <Command.Empty className="py-8 text-center text-sm text-editor-text-muted">
            No commands or files matching "{filter}".
          </Command.Empty>

          {/* Core IDE Actions */}
          <Command.Group heading="Editor & Execution" className="text-[11px] font-semibold text-editor-text-muted uppercase tracking-wider mb-2 px-2 pt-1">
            <Command.Item
              onSelect={() => {
                onAction('run');
                setOpen(false);
              }}
              className="flex items-center justify-between px-2.5 py-2 rounded-md text-sm text-editor-text cursor-pointer hover:bg-editor-active-tab aria-selected:bg-editor-active-tab aria-selected:text-editor-text"
            >
              <div className="flex items-center gap-2.5">
                <Play className="w-4 h-4 text-emerald-400" />
                <span>Run Active Code</span>
              </div>
              <span className="text-[10px] text-editor-text-dim">F5 / Ctrl+Enter</span>
            </Command.Item>

            <Command.Item
              onSelect={() => {
                onAction('format');
                setOpen(false);
              }}
              className="flex items-center justify-between px-2.5 py-2 rounded-md text-sm text-editor-text cursor-pointer hover:bg-editor-active-tab aria-selected:bg-editor-active-tab aria-selected:text-editor-text"
            >
              <div className="flex items-center gap-2.5">
                <Code2 className="w-4 h-4 text-sky-400" />
                <span>Format Document (Prettier)</span>
              </div>
              <span className="text-[10px] text-editor-text-dim">Shift+Alt+F</span>
            </Command.Item>

            <Command.Item
              onSelect={() => {
                onAction('toggleTerminal');
                setOpen(false);
              }}
              className="flex items-center justify-between px-2.5 py-2 rounded-md text-sm text-editor-text cursor-pointer hover:bg-editor-active-tab aria-selected:bg-editor-active-tab aria-selected:text-editor-text"
            >
              <div className="flex items-center gap-2.5">
                <Terminal className="w-4 h-4 text-purple-400" />
                <span>Toggle Integrated Terminal</span>
              </div>
              <span className="text-[10px] text-editor-text-dim">Ctrl+`</span>
            </Command.Item>
          </Command.Group>

          <Command.Separator className="h-px bg-editor-border my-1.5" />

          {/* AI Commands */}
          <Command.Group heading="HRDK Pen AI Assistant" className="text-[11px] font-semibold text-editor-text-muted uppercase tracking-wider mb-2 px-2">
            <Command.Item
              onSelect={() => {
                onAction('view', 'ai');
                setOpen(false);
              }}
              className="flex items-center justify-between px-2.5 py-2 rounded-md text-sm text-editor-text cursor-pointer hover:bg-editor-active-tab aria-selected:bg-editor-active-tab aria-selected:text-editor-text"
            >
              <div className="flex items-center gap-2.5">
                <Bot className="w-4 h-4 text-blue-400" />
                <span>Open AI Assistant Panel</span>
              </div>
              <span className="text-[10px] text-editor-text-dim">Ctrl+Shift+A</span>
            </Command.Item>

            <Command.Item
              onSelect={() => {
                onAction('aiExplain');
                setOpen(false);
              }}
              className="flex items-center justify-between px-2.5 py-2 rounded-md text-sm text-editor-text cursor-pointer hover:bg-editor-active-tab aria-selected:bg-editor-active-tab aria-selected:text-editor-text"
            >
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>AI: Explain Current Code</span>
              </div>
            </Command.Item>
          </Command.Group>

          <Command.Separator className="h-px bg-editor-border my-1.5" />

          {/* Navigation & Panels */}
          <Command.Group heading="Views & Navigation" className="text-[11px] font-semibold text-editor-text-muted uppercase tracking-wider mb-2 px-2">
            <Command.Item
              onSelect={() => {
                onAction('view', 'environments');
                setOpen(false);
              }}
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm text-editor-text cursor-pointer hover:bg-editor-active-tab aria-selected:bg-editor-active-tab aria-selected:text-editor-text"
            >
              <Server className="w-4 h-4 text-emerald-400" />
              <span>Language Runtimes & Environments</span>
            </Command.Item>

            <Command.Item
              onSelect={() => {
                onAction('view', 'projects');
                setOpen(false);
              }}
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm text-editor-text cursor-pointer hover:bg-editor-active-tab aria-selected:bg-editor-active-tab aria-selected:text-editor-text"
            >
              <FolderTree className="w-4 h-4 text-cyan-400" />
              <span>Projects & Workspaces</span>
            </Command.Item>

            <Command.Item
              onSelect={() => {
                onAction('view', 'docs');
                setOpen(false);
              }}
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm text-editor-text cursor-pointer hover:bg-editor-active-tab aria-selected:bg-editor-active-tab aria-selected:text-editor-text"
            >
              <BookOpen className="w-4 h-4 text-purple-400" />
              <span>Documentation & Guides</span>
            </Command.Item>

            <Command.Item
              onSelect={() => {
                onAction('view', 'settings');
                setOpen(false);
              }}
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm text-editor-text cursor-pointer hover:bg-editor-active-tab aria-selected:bg-editor-active-tab aria-selected:text-editor-text"
            >
              <Settings className="w-4 h-4 text-gray-400" />
              <span>Settings & Preferences</span>
            </Command.Item>
          </Command.Group>

          <Command.Separator className="h-px bg-editor-border my-1.5" />

          {/* Files List */}
          {files.length > 0 && (
            <Command.Group heading="Workspace Files" className="text-[11px] font-semibold text-editor-text-muted uppercase tracking-wider mb-2 px-2">
              {files.map((file) => (
                <Command.Item
                  key={file.id}
                  onSelect={() => {
                    onAction('openFile', file);
                    setOpen(false);
                  }}
                  className="flex items-center justify-between px-2.5 py-2 rounded-md text-sm text-editor-text cursor-pointer hover:bg-editor-active-tab aria-selected:bg-editor-active-tab aria-selected:text-editor-text"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <FileCode className="w-4 h-4 text-editor-text-dim flex-shrink-0" />
                    <span className="truncate">{file.name}</span>
                  </div>
                  <span className="text-[10px] text-editor-text-dim capitalize">{file.language || 'file'}</span>
                </Command.Item>
              ))}
            </Command.Group>
          )}

          <Command.Separator className="h-px bg-editor-border my-1.5" />

          {/* Languages quick switch / switch template */}
          <Command.Group heading="Language Runtimes Available" className="text-[11px] font-semibold text-editor-text-muted uppercase tracking-wider mb-2 px-2">
            {SUPPORTED_LANGUAGES.map((lang) => (
              <Command.Item
                key={lang.id}
                onSelect={() => {
                  onAction('view', 'environments');
                  setOpen(false);
                }}
                className="flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs text-editor-text cursor-pointer hover:bg-editor-active-tab aria-selected:bg-editor-active-tab"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary/70" />
                  <span>{lang.name}</span>
                  <span className="text-[10px] text-editor-text-dim">({lang.runtimeName})</span>
                </div>
                <span className="text-[10px] font-mono text-[hsl(var(--subtext0))]">Tier {lang.tier}</span>
              </Command.Item>
            ))}
          </Command.Group>
        </Command.List>
      </div>
    </Command.Dialog>
  );
};
