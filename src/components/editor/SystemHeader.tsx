import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Code2, Download, Eye, FileArchive, FolderKanban, FolderPlus, MoreHorizontal, PanelRightClose, PanelRightOpen, Play, Rocket, TerminalSquare } from 'lucide-react';
import { getLanguageFromFilename, LANGUAGE_LABELS } from '@/lib/languages';
import type { FileNode } from '@/types';

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

export function SystemHeader({
  activeFile, projectName = 'Untitled workspace', projectLanguage, onRun, onFormat, onExport, onPublish,
  onDownloadCurrent, terminalOpen, onToggleTerminal, rightPanelOpen, onToggleRightPanel, onNewProject,
  onOpenProjects, onTogglePreview, serverUrl,
}: SystemHeaderProps) {
  const language = activeFile ? getLanguageFromFilename(activeFile.name) : '';
  const canRun = ['javascript', 'typescript', 'python', 'c', 'cpp'].includes(language);
  const canPublish = ['html', 'plaintext', ''].includes(projectLanguage || '');

  return (
    <header className="ide-header" aria-label="Workspace controls">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-blue-500 text-white" aria-hidden="true">
          <Code2 className="h-4 w-4" />
        </div>
        <button onClick={onOpenProjects} className="workspace-switcher" title="Switch workspace">
          <span className="truncate">{projectName}</span>
          <span className="workspace-dot" aria-label={serverUrl ? 'Server running' : 'Server stopped'} />
        </button>
        {activeFile && <span className="hidden min-w-0 truncate text-xs text-editor-text-muted sm:block">{activeFile.name}{language && ` · ${LANGUAGE_LABELS[language] ?? language}`}</span>}
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        {serverUrl && <span className="hidden items-center gap-1.5 text-[11px] text-emerald-400 md:flex"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />Running</span>}
        {canRun && <button className="ide-button ide-button-primary" onClick={onRun}><Play className="h-3.5 w-3.5 fill-current" />Run</button>}
        {canPublish && <button className="ide-button hidden sm:flex" onClick={onPublish}><Rocket className="h-3.5 w-3.5" />Publish</button>}
        <button className={`ide-icon-button ${terminalOpen ? 'is-active' : ''}`} onClick={onToggleTerminal} title="Toggle terminal" aria-label="Toggle terminal"><TerminalSquare className="h-4 w-4" /></button>
        <button className={`ide-icon-button ${rightPanelOpen ? 'is-active' : ''}`} onClick={onTogglePreview ?? onToggleRightPanel} title="Toggle preview" aria-label="Toggle preview">{rightPanelOpen ? <PanelRightClose className="h-4 w-4" /> : <PanelRightOpen className="h-4 w-4" />}</button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild><button className="ide-icon-button" title="More workspace actions" aria-label="More workspace actions"><MoreHorizontal className="h-4 w-4" /></button></DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={onNewProject}><FolderPlus className="mr-2 h-4 w-4" />New project</DropdownMenuItem>
            <DropdownMenuItem onClick={onOpenProjects}><FolderKanban className="mr-2 h-4 w-4" />All projects</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onFormat}>Format document</DropdownMenuItem>
            <DropdownMenuItem onClick={onDownloadCurrent}><Download className="mr-2 h-4 w-4" />Download file</DropdownMenuItem>
            <DropdownMenuItem onClick={onExport}><FileArchive className="mr-2 h-4 w-4" />Export project</DropdownMenuItem>
            {serverUrl && <DropdownMenuItem onClick={() => window.open(serverUrl, '_blank', 'noopener,noreferrer')}><Eye className="mr-2 h-4 w-4" />Open preview</DropdownMenuItem>}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
