import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import {
  Play,
  Download,
  Code2,
  Globe,
  AlignLeft,
  TerminalSquare,
  PanelRightClose,
  PanelRightOpen,
  ChevronDown,
  FolderOpen,
  FileArchive,
  Upload,
  Rocket,
  Settings2,
  Eye,
  Monitor,
  Cpu,
  Package,
  Save,
  RefreshCw,
  Share2,
  Maximize,
  Minimize,
  EyeOff,
  HelpCircle,
  Keyboard,
  Info,
} from 'lucide-react';
import { LANGUAGE_LABELS, getLanguageFromFilename } from '@/lib/languages';
import type { FileNode } from '@/types';
import { ProductivityTools } from '../layout/ProductivityTools';

interface SystemHeaderProps {
  activeFile?: FileNode | null;
  projectName?: string;
  projectLanguage?: string;
  onRun: () => void;
  onFormat: () => void;
  onExport: () => void;
  onPublish: () => void;
  onDownloadCurrent: () => void;
  terminalOpen?: boolean;
  onToggleTerminal?: () => void;
  rightPanelOpen?: boolean;
  onToggleRightPanel?: () => void;
  onNewProject?: () => void;
  onOpenProjects?: () => void;
  onTogglePreview?: () => void;
  serverUrl?: string | null;
  onToggleFullscreen?: () => void;
  onToggleZenMode?: () => void;
  isFullscreen?: boolean;
  isZenMode?: boolean;
}

const PUBLISHABLE_PROJECT_TYPES = new Set(['html', 'plaintext', '']);

export const SystemHeader = ({
  activeFile,
  projectName,
  projectLanguage,
  onRun,
  onFormat,
  onExport,
  onPublish,
  onDownloadCurrent,
  terminalOpen,
  onToggleTerminal,
  rightPanelOpen,
  onToggleRightPanel,
  onNewProject,
  onOpenProjects,
  onTogglePreview,
  serverUrl,
  onToggleFullscreen,
  onToggleZenMode,
  isFullscreen,
  isZenMode,
}: SystemHeaderProps) => {
  const lang = activeFile?.language || (activeFile ? getLanguageFromFilename(activeFile.name) : '');
  const langLabel = LANGUAGE_LABELS[lang] ?? '';
  const canRun = ['javascript', 'typescript', 'python', 'c', 'cpp'].includes(lang);

  const projLang = projectLanguage || '';
  const canPublish = PUBLISHABLE_PROJECT_TYPES.has(projLang) || projLang === 'html';

  return (
    <header
      className="flex items-center justify-between flex-shrink-0 no-select relative z-10 px-3 bg-[hsl(var(--crust))]/85 backdrop-blur-2xl border-b border-[hsl(var(--surface1))]/80"
      style={{
        height: 46,
      }}
    >
      {/* ── LEFT: macOS traffic lights + Brand + App Menu ── */}
      <div className="flex items-center gap-2.5 h-full">
        {/* Apple Traffic Lights */}
        <div className="flex items-center gap-2 pl-1 pr-2.5 py-1">
          <div className="mac-btn mac-btn-close cursor-pointer" title="Close" />
          <div className="mac-btn mac-btn-min cursor-pointer" title="Minimize" />
          <div className="mac-btn mac-btn-max cursor-pointer" title="Maximize" />
        </div>

        <div className="w-px h-4 bg-[hsl(var(--surface1))]" />

        {/* Brand Badge */}
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[hsl(var(--surface0))]/40 border border-[hsl(var(--surface1))]/60">
          <div className="w-5 h-5 rounded-md bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-sm shadow-blue-500/20">
            <Code2 className="w-3.5 h-3.5" />
          </div>
          <span className="text-[12px] font-bold tracking-tight text-[hsl(var(--text))]">
            HRDK<span className="text-blue-400">PEN</span>
          </span>
        </div>

        {/* Apple macOS style App Menus */}
        <div className="flex items-center gap-0.5 ml-1">
          {/* Workspace Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md hover:bg-[hsl(var(--surface0))]/70 transition-all text-[hsl(var(--overlay1))] hover:text-[hsl(var(--text))]">
                Workspace
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-52 bg-[hsl(var(--crust))]/95 backdrop-blur-xl border border-[hsl(var(--surface1))] text-editor-text shadow-xl rounded-xl p-1 animate-scale-in">
              {onNewProject && (
                <DropdownMenuItem onClick={onNewProject} className="text-xs gap-2.5 cursor-pointer rounded-lg hover:bg-[hsl(var(--surface0))] py-1.5">
                  <FolderOpen className="w-3.5 h-3.5 text-[hsl(var(--overlay1))]" /> New Project
                </DropdownMenuItem>
              )}
              {onOpenProjects && (
                <DropdownMenuItem onClick={onOpenProjects} className="text-xs gap-2.5 cursor-pointer rounded-lg hover:bg-[hsl(var(--surface0))] py-1.5">
                  <Package className="w-3.5 h-3.5 text-[hsl(var(--overlay1))]" /> All Projects
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator className="bg-[hsl(var(--surface1))] my-1" />
              <DropdownMenuItem onClick={onExport} className="text-xs gap-2.5 cursor-pointer rounded-lg hover:bg-[hsl(var(--surface0))] py-1.5">
                <FileArchive className="w-3.5 h-3.5 text-[hsl(var(--overlay1))]" /> Export as ZIP
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Edit Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md hover:bg-[hsl(var(--surface0))]/70 transition-all text-[hsl(var(--overlay1))] hover:text-[hsl(var(--text))]">
                Edit
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-52 bg-[hsl(var(--crust))]/95 backdrop-blur-xl border border-[hsl(var(--surface1))] text-editor-text shadow-xl rounded-xl p-1 animate-scale-in">
              <DropdownMenuItem onClick={onFormat} className="text-xs gap-2.5 cursor-pointer rounded-lg hover:bg-[hsl(var(--surface0))] py-1.5">
                <AlignLeft className="w-3.5 h-3.5 text-[hsl(var(--overlay1))]" /> Format Document
                <kbd className="ml-auto text-[9px] px-1.5 py-0.5 rounded bg-[hsl(var(--surface1))] text-[hsl(var(--overlay1))]">Alt+Shift+F</kbd>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* View Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md hover:bg-[hsl(var(--surface0))]/70 transition-all text-[hsl(var(--overlay1))] hover:text-[hsl(var(--text))]">
                View
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-52 bg-[hsl(var(--crust))]/95 backdrop-blur-xl border border-[hsl(var(--surface1))] text-editor-text shadow-xl rounded-xl p-1 animate-scale-in">
              {onToggleTerminal && (
                <DropdownMenuItem onClick={onToggleTerminal} className="text-xs gap-2.5 cursor-pointer rounded-lg hover:bg-[hsl(var(--surface0))] py-1.5">
                  <TerminalSquare className="w-3.5 h-3.5 text-[hsl(var(--overlay1))]" /> {terminalOpen ? 'Hide Terminal' : 'Show Terminal'}
                  <kbd className="ml-auto text-[9px] px-1.5 py-0.5 rounded bg-[hsl(var(--surface1))] text-[hsl(var(--overlay1))]">Ctrl+`</kbd>
                </DropdownMenuItem>
              )}
              {onTogglePreview && (
                <DropdownMenuItem onClick={onTogglePreview} className="text-xs gap-2.5 cursor-pointer rounded-lg hover:bg-[hsl(var(--surface0))] py-1.5">
                  <Monitor className="w-3.5 h-3.5 text-[hsl(var(--overlay1))]" /> {rightPanelOpen ? 'Hide Preview' : 'Show Preview'}
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator className="bg-[hsl(var(--surface1))] my-1" />
              {onToggleFullscreen && (
                <DropdownMenuItem onClick={onToggleFullscreen} className="text-xs gap-2.5 cursor-pointer rounded-lg hover:bg-[hsl(var(--surface0))] py-1.5">
                  {isFullscreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
                  {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                  <kbd className="ml-auto text-[9px] px-1.5 py-0.5 rounded bg-[hsl(var(--surface1))] text-[hsl(var(--overlay1))]">F11</kbd>
                </DropdownMenuItem>
              )}
              {onToggleZenMode && (
                <DropdownMenuItem onClick={onToggleZenMode} className="text-xs gap-2.5 cursor-pointer rounded-lg hover:bg-[hsl(var(--surface0))] py-1.5">
                  <EyeOff className="w-3.5 h-3.5 text-[hsl(var(--overlay1))]" /> {isZenMode ? 'Exit Zen Mode' : 'Zen Mode'}
                  <kbd className="ml-auto text-[9px] px-1.5 py-0.5 rounded bg-[hsl(var(--surface1))] text-[hsl(var(--overlay1))]">Ctrl+K Z</kbd>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Run Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md hover:bg-[hsl(var(--surface0))]/70 transition-all text-[hsl(var(--overlay1))] hover:text-[hsl(var(--text))]">
                Run
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-52 bg-[hsl(var(--crust))]/95 backdrop-blur-xl border border-[hsl(var(--surface1))] text-editor-text shadow-xl rounded-xl p-1 animate-scale-in">
              {canRun && (
                <DropdownMenuItem onClick={onRun} className="text-xs gap-2.5 cursor-pointer rounded-lg hover:bg-[hsl(var(--surface0))] py-1.5">
                  <Play className="w-3.5 h-3.5 text-[hsl(var(--overlay1))]" /> Run Active File
                  <kbd className="ml-auto text-[9px] px-1.5 py-0.5 rounded bg-[hsl(var(--surface1))] text-[hsl(var(--overlay1))]">Ctrl+Enter</kbd>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem className="text-xs gap-2.5 cursor-pointer rounded-lg hover:bg-[hsl(var(--surface0))] py-1.5">
                <RefreshCw className="w-3.5 h-3.5 text-[hsl(var(--overlay1))]" /> Restart Dev Server
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Help Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md hover:bg-[hsl(var(--surface0))]/70 transition-all text-[hsl(var(--overlay1))] hover:text-[hsl(var(--text))]">
                Help
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-52 bg-[hsl(var(--crust))]/95 backdrop-blur-xl border border-[hsl(var(--surface1))] text-editor-text shadow-xl rounded-xl p-1 animate-scale-in">
              <DropdownMenuItem className="text-xs gap-2.5 cursor-pointer rounded-lg hover:bg-[hsl(var(--surface0))] py-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-[hsl(var(--overlay1))]" /> Documentation
              </DropdownMenuItem>
              <DropdownMenuItem className="text-xs gap-2.5 cursor-pointer rounded-lg hover:bg-[hsl(var(--surface0))] py-1.5">
                <Keyboard className="w-3.5 h-3.5 text-[hsl(var(--overlay1))]" /> Keyboard Shortcuts
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-[hsl(var(--surface1))] my-1" />
              <DropdownMenuItem className="text-xs gap-2.5 cursor-pointer rounded-lg hover:bg-[hsl(var(--surface0))] py-1.5">
                <Info className="w-3.5 h-3.5 text-[hsl(var(--overlay1))]" /> About HRDK Pen
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* ── CENTER: Compact Native Context Capsule ── */}
      <div className="hidden md:flex items-center gap-2 absolute left-1/2 -translate-x-1/2 max-w-[360px] truncate pointer-events-none">
        <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[hsl(var(--surface0))]/40 border border-[hsl(var(--surface1))]/60 shadow-xs pointer-events-auto">
          {projectName && (
            <span className="text-[11px] font-medium tracking-tight text-[hsl(var(--subtext0))] truncate max-w-[120px]" title={projectName}>
              {projectName}
            </span>
          )}
          {activeFile && (
            <>
              <span className="text-[hsl(var(--surface2))] text-[10px]">/</span>
              <span className="text-[11px] font-medium text-[hsl(var(--text))] flex items-center gap-1.5 truncate max-w-[140px]" title={activeFile.name}>
                {activeFile.name}
              </span>
              {langLabel && (
                <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-[hsl(var(--surface1))] text-[hsl(var(--subtext0))]">
                  {langLabel}
                </span>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── RIGHT: Productivity Tools + Run Button + Publish Pill + Panel Toggles ── */}
      <div className="flex items-center gap-2 h-full">
        <ProductivityTools />

        <div className="w-px h-4 bg-[hsl(var(--surface1))]" />

        {/* Live Server Indicator */}
        {serverUrl && (
          <a
            href={serverUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:flex items-center gap-1.5 h-7 px-2.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 hover:bg-emerald-500/20 transition-all shadow-sm"
            title={`Server running: ${serverUrl}`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live
          </a>
        )}

        {/* Run active file button */}
        {canRun && (
          <button
            onClick={onRun}
            className="flex items-center gap-1.5 h-7 px-3 rounded-lg text-[11px] font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm shadow-emerald-600/30 active:scale-95 transition-all"
            title="Run Code (Ctrl+Enter)"
          >
            <Play className="w-3 h-3 fill-current" />
            <span className="hidden sm:inline">Run</span>
          </button>
        )}

        {/* Publish Pill Button */}
        {canPublish && (
          <button
            onClick={onPublish}
            className="flex items-center gap-1.5 h-7 px-3 rounded-lg text-[11px] font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-sm shadow-blue-600/30 active:scale-95 transition-all"
            title="Publish to the web"
          >
            <Rocket className="w-3 h-3" />
            <span className="hidden sm:inline">Publish</span>
          </button>
        )}

        {/* Terminal and Panel Segmented Control */}
        <div className="flex items-center p-0.5 rounded-lg bg-[hsl(var(--surface0))]/60 border border-[hsl(var(--surface1))]/80">
          {onToggleTerminal && (
            <button
              onClick={onToggleTerminal}
              className={`h-6 w-6 rounded-md flex items-center justify-center transition-all ${
                terminalOpen 
                  ? 'bg-blue-600/20 text-blue-400 shadow-sm border border-blue-500/30' 
                  : 'text-[hsl(var(--overlay1))] hover:text-white hover:bg-[hsl(var(--surface1))]'
              }`}
              title="Toggle Terminal (Ctrl+`)"
            >
              <TerminalSquare className="w-3.5 h-3.5" />
            </button>
          )}

          {onToggleRightPanel && (
            <button
              onClick={onToggleRightPanel}
              className={`h-6 w-6 rounded-md flex items-center justify-center transition-all ${
                rightPanelOpen 
                  ? 'bg-blue-600/20 text-blue-400 shadow-sm border border-blue-500/30' 
                  : 'text-[hsl(var(--overlay1))] hover:text-white hover:bg-[hsl(var(--surface1))]'
              }`}
              title="Toggle Preview Panel"
            >
              {rightPanelOpen ? <PanelRightClose className="w-3.5 h-3.5" /> : <PanelRightOpen className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};