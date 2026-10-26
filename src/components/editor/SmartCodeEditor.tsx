import { useState, useRef, useCallback, useEffect } from 'react';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { Button } from '@/components/ui/button';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
} from '@/components/ui/context-menu';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { X, Monitor, Bot, Search, Minus, Square, BookOpen, Plus, Image as ImageIcon, PenTool, FolderTree, GraduationCap, Copy, Check, Brain, Loader2, Trash2, HelpCircle, Play, Activity, Terminal as TerminalIcon, Sparkles, Globe, Eye, Layers } from 'lucide-react';

import { SystemHeader } from './SystemHeader';
import { FileExplorer } from './FileExplorer';
import { CodeEditor, type EditorAPI } from './CodeEditor';
import { LivePreview } from './LivePreview';
import { Terminal, type TerminalHandle } from './Terminal';
import { PublishModal } from '@/components/publish/PublishModal';
import { StatusBar } from './StatusBar';
import { ActivityBar, type ActivityBarView } from '@/components/layout/ActivityBar';
import { SmartPopup } from '@/components/ai/SmartPopup';
import { AIAssistant, AIAssistantRef } from '@/components/ai/AIAssistant';
import { SettingsPanel } from '@/components/settings/SettingsPanel';
import { ProblemsPanel, type Problem } from '@/components/panels/ProblemsPanel';
import { OutputPanel, type OutputLine, makeOutputLine } from '@/components/panels/OutputPanel';
import { ProjectsPanel } from '@/components/panels/ProjectsPanel';
import { IframePanel } from '@/components/panels/IframePanel';
import { PersonalCanvas } from '@/components/panels/PersonalCanvas';
import { AssetLibrary } from '@/components/assets/AssetLibrary';
import { CommandPalette } from '@/components/layout/CommandPalette';
import { BootstrapScreen } from '@/components/layout/BootstrapScreen';
import { DoctorKitBadge } from '@/components/layout/DoctorKitBadge';
import { useWorkspace } from '@/hooks/use-workspace';
import { useSettings } from '@/hooks/use-settings';
import { useDoctorKit } from '@/hooks/useDoctorKit';
import { getLanguageFromFilename, PREVIEW_LANGUAGES, LANGUAGE_TEMPLATES } from '@/lib/languages';
import { getFileLanguageIcon } from '@/utils/languageIcons';
import { executeJavaScript, executePython, executeCompiled } from '@/lib/execution';
import { executeCode } from '@/lib/unifiedExecutor';
import { getWebContainer, clearWebContainerFS } from '@/lib/webcontainer';
import { downloadProject, publishProject } from '@/lib/publish';
import { useToast } from '@/hooks/use-toast';
import type { FileSystemTree } from '@webcontainer/api';
import { processManager } from '@/lib/processManager';
import { fsSyncService } from '@/lib/fsSync';
import { projectBootstrapService, type BootstrapStatus } from '@/lib/projectBootstrap';

import type { FileNode } from '@/types';

// ─────────────────── Types ───────────────────
import { DocsViewer } from '@/components/docs/DocsViewer';
import { HelpCenter } from '@/components/docs/HelpCenter';

export type BottomPanel = 'terminal' | 'output' | 'problems' | 'inspect' | 'help';
type RightPanel  = 'preview' | 'ai' | 'docs' | 'assets' | null;

// ─────────────────── Starter workspace ───────────────────
const STARTER_FILES: { name: string; content: string }[] = [
  { name: 'index.html',
    content: LANGUAGE_TEMPLATES.html },
  { name: 'style.css',
    content: LANGUAGE_TEMPLATES.css },
  { name: 'script.js',
    content: `// JavaScript\nconsole.log('Hello from HRDK Pen!');\n\ndocument.querySelector('h1').style.color = '#89b4fa';\n` },
];

// ─────────────────── Component ───────────────────
export const SmartCodeEditor = () => {
  const workspace = useWorkspace();
  const { settings, update: updateSetting, reset: resetSettings } = useSettings();
  const { toast } = useToast();

  // Active view states
  const [activityView, setActivityView]   = useState<ActivityBarView>('explorer');
  const [openTabs, setOpenTabs]           = useState<FileNode[]>([]);
  const [activeTabId, setActiveTabId]     = useState<string>('');
  const [rightPanel, setRightPanel] = useState<RightPanel>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showBootstrap, setShowBootstrap] = useState(false);
  const [settingsCategory, setSettingsCategory] = useState<'appearance' | 'editor' | 'terminal' | 'preview' | 'extensions' | 'diagnostics'>('appearance');
  const [bottomPanelOpen, setBottomPanelOpen] = useState(false);
  const [bottomTab, setBottomTab]         = useState<BottomPanel>('terminal');
  const [searchQuery, setSearchQuery]     = useState('');
  const [isScaffolding, setIsScaffolding] = useState(false);
  const [isFullscreen, setIsFullscreen]   = useState(false);
  const [isZenMode, setIsZenMode]         = useState(false);

  const doctorKit = useDoctorKit();

  // Editor diagnostics
  const [problems, setProblems]   = useState<Problem[]>([]);
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });

  // Output panel
  const [outputLines, setOutputLines] = useState<OutputLine[]>([]);
  const addOutput = useCallback((type: OutputLine['type'], text: string) => {
    setOutputLines(prev => [...prev, makeOutputLine(type, text)]);
  }, []);

  // Selection
  const [selection, setSelection] = useState<{ text: string; pos: { top: number; left: number; height: number } | null }>({ text: '', pos: null });

  // Command Palette
  const [paletteOpen, setPaletteOpen] = useState(false);

  // ─── Terminal Pages State ───
  const [terminals, setTerminals] = useState<{ id: string; name: string; isManaged?: boolean }[]>([{ id: 'term-1', name: 'bash' }]);
  const [activeTerminalId, setActiveTerminalId] = useState('term-1');
  const terminalRefs = useRef<Record<string, TerminalHandle | null>>({});

  useEffect(() => {
    if (!workspace.activeProjectId) return;
    const unsubscribe = processManager.subscribe((processes) => {
       const projectProcs = processes.filter(p => p.projectId === workspace.activeProjectId);
       setTerminals(prev => {
          const next = [...prev];
          let changed = false;
          for (const p of projectProcs) {
             if (!next.find(t => t.id === p.id)) {
                next.push({ id: p.id, name: p.command, isManaged: true });
                changed = true;
             }
          }
          return changed ? next : prev;
       });
    });
    return () => unsubscribe();
  }, [workspace.activeProjectId]);

  const handleAddTerminal = () => {
    const id = `term-${Date.now()}`;
    setTerminals(prev => [...prev, { id, name: 'bash' }]);
    setActiveTerminalId(id);
    setBottomPanelOpen(true);
    setBottomTab('terminal');
  };

  const handleRemoveTerminal = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTerminals(prev => {
      const updated = prev.filter(t => t.id !== id);
      if (activeTerminalId === id && updated.length > 0) {
        setActiveTerminalId(updated[updated.length - 1].id);
      }
      return updated;
    });
  };

  const terminalRef = {
    current: {
      runCode: (lang: string, code: string) => {
        terminalRefs.current[activeTerminalId]?.runCode(lang, code);
      },
      execute: (cmd: string) => {
        terminalRefs.current[activeTerminalId]?.execute(cmd);
      }
    }
  };
  const editorRef   = useRef<EditorAPI | null>(null);

  const [serverUrl, setServerUrl] = useState<string | null>(null);
  const [serverReadyCount, setServerReadyCount] = useState(0);
  const [inspectEnabled, setInspectEnabled] = useState(false);
  const [bootstrapStatus, setBootstrapStatus] = useState<BootstrapStatus | undefined>(undefined);
  const aiAssistantRef = useRef<AIAssistantRef>(null);

  // Auto-complete state
  const [brainWidget, setBrainWidget] = useState<{ visible: boolean; top: number; left: number; loading: boolean }>({ visible: false, top: 0, left: 0, loading: false });
  const cursorPixelRef = useRef({ top: 0, left: 0 });
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);

  // ─── Project Bootstrap & Runtime Integration ───
  useEffect(() => {
    // Keep processManager aware of active project
    processManager.setActiveProject(workspace.activeProjectId);

    const unsubscribe = projectBootstrapService.subscribe((status) => {
      if (status.projectId === workspace.activeProjectId) {
        setBootstrapStatus(status);
        if (status.serverUrl) {
          setServerUrl(status.serverUrl);
          setServerReadyCount(c => c + 1);
        }
      }
    });

    return () => unsubscribe();
  }, [workspace.activeProjectId]);

  // Sync / Bootstrap project into WebContainer when active project changes
  const lastMountedProjectRef = useRef<string | null>(null);

  useEffect(() => {
    if (!workspace.isReady || !workspace.activeProjectId) return;

    if (lastMountedProjectRef.current !== workspace.activeProjectId) {
      lastMountedProjectRef.current = workspace.activeProjectId;
      setServerUrl(null);

      // Execute centralized project bootstrap pipeline
      projectBootstrapService.bootstrapProject(
        workspace.activeProjectId,
        workspace.files,
        {
          inspectEnabled,
          onLog: (type, text) => {
            addOutput(type, text);
          },
        }
      ).catch((err) => {
        console.error('Failed to bootstrap project:', err);
      });
    }
  }, [workspace.activeProjectId, workspace.isReady, workspace.files, inspectEnabled, addOutput]);

  // Use a ref to hold latest workspace files for the sync service to preserve UUIDs
  const workspaceFilesRef = useRef(workspace.files);
  useEffect(() => {
    workspaceFilesRef.current = workspace.files;
  }, [workspace.files]);

  // Listen to FS changes from WebContainer and update React state
  useEffect(() => {
    if (!workspace.isReady || !workspace.activeProjectId) return;
    const unsubscribe = fsSyncService.subscribe(
      (newFiles) => {
        // Merge content to prevent overwriting active editor state if possible, or just accept true FS state
        workspace.setWorkspaceFiles(newFiles);
      },
      () => workspaceFilesRef.current
    );
    return () => unsubscribe();
  }, [workspace.isReady, workspace.activeProjectId, workspace.setWorkspaceFiles]);

  // Removed STARTER_FILES since we use BootstrapScreen now.


  // ─── Tab management ───
  const openTab = useCallback((file: FileNode) => {
    if (file.type !== 'file') return;
    const fresh = workspace.findFile(file.id) ?? file;
    setOpenTabs(prev => prev.find(t => t.id === fresh.id) ? prev : [...prev, fresh]);
    setActiveTabId(fresh.id);
  }, [workspace]);

  // Keep open tabs in sync with workspace.files for external changes (like npm install)
  useEffect(() => {
    setOpenTabs(prev => {
      let changed = false;
      const next = prev.map(tab => {
        const wFile = workspace.findFile(tab.id);
        if (wFile && wFile.content !== tab.content) {
          changed = true;
          return { ...tab, content: wFile.content };
        }
        return tab;
      });
      return changed ? next : prev;
    });
  }, [workspace.files, workspace.findFile]);

  const closeTab = useCallback((id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setOpenTabs(prev => {
      const next = prev.filter(t => t.id !== id);
      if (activeTabId === id) setActiveTabId(next.length ? next[next.length - 1].id : '');
      return next;
    });
  }, [activeTabId]);

  const handleContentChange = useCallback((content: string) => {
    if (!activeTabId) return;
    
    // Immediately update UI state
    workspace.updateFileContent(activeTabId, content);
    
    // Immediately write to WebContainer to prevent polling race conditions
    const filePath = workspace.findFilePath(activeTabId);
    if (filePath) {
      getWebContainer().then(wc => {
        let finalContent = content;
        if (inspectEnabled && (filePath === 'index.html' || filePath.endsWith('.html'))) {
          finalContent = content.replace(/<head([^>]*)>/i, `<head$1><script src="https://cdn.jsdelivr.net/npm/eruda"></script><script>eruda.init({defaults:{displaySize:100,transparency:1,theme:'Dark'}}); eruda.show(); eruda._entryBtn.hide();</script>`);
        }
        wc.fs.writeFile(`/${filePath}`, finalContent).catch(err => {
          console.error('Failed to write file to WebContainer:', err);
        });
      });
    }
  }, [activeTabId, workspace, inspectEnabled]);

  const handleFileCreate = useCallback((name: string, type: 'file' | 'folder', parentId?: string) => {
    let parentPath = '';
    if (parentId) {
      parentPath = workspace.findFilePath(parentId) || '';
    }
    const path = parentPath ? `${parentPath}/${name}` : name;

    workspace.createFile(name, type, parentId);
    
    fsSyncService.unmarkDeleted(path);
    getWebContainer().then(wc => {
      if (type === 'file') wc.fs.writeFile(`/${path}`, '').catch(console.error);
      else wc.fs.mkdir(`/${path}`).catch(console.error);
    });
  }, [workspace]);

  const handleFileRename = useCallback((id: string, name: string) => {
    const oldPath = workspace.findFilePath(id);
    workspace.renameFile(id, name);
    setTimeout(() => {
      const newPath = workspace.findFilePath(id);
      if (oldPath && newPath && oldPath !== newPath) {
        fsSyncService.unmarkDeleted(newPath);
        getWebContainer().then(async wc => {
           try {
             // Basic rename by reading old and writing new, then deleting old
             const content = await wc.fs.readFile(`/${oldPath}`, 'utf8').catch(() => '');
             await wc.fs.writeFile(`/${newPath}`, content);
             await wc.fs.rm(`/${oldPath}`, { recursive: true });
           } catch (e) {
             console.error('Failed to rename in WebContainer:', e);
           }
        });
      }
    }, 100);
    setOpenTabs(prev => prev.map(t =>
      t.id === id ? { ...t, name, language: getLanguageFromFilename(name) } : t
    ));
  }, [workspace]);

  const handleFileDelete = useCallback((id: string) => {
    const path = workspace.findFilePath(id);
    workspace.deleteFile(id);
    if (path) {
      getWebContainer().then(wc => {
        wc.fs.rm(`/${path}`, { recursive: true }).catch(console.error);
      });
    }
    closeTab(id);
  }, [workspace, closeTab]);

  const handleFileMove = useCallback((dragId: string, targetFolderId: string | null) => {
    const oldPath = workspace.findFilePath(dragId);
    workspace.moveNode(dragId, targetFolderId);
    setTimeout(() => {
      const newPath = workspace.findFilePath(dragId);
      if (oldPath && newPath && oldPath !== newPath) {
        fsSyncService.unmarkDeleted(newPath);
        getWebContainer().then(async wc => {
           try {
             const content = await wc.fs.readFile(`/${oldPath}`, 'utf8').catch(() => '');
             await wc.fs.writeFile(`/${newPath}`, content);
             await wc.fs.rm(`/${oldPath}`, { recursive: true });
           } catch (e) {
             console.error('Failed to move in WebContainer:', e);
           }
        });
      }
    }, 100);
  }, [workspace]);

  const handleImportFolder = useCallback(async (files: { path: string; content: string }[]) => {
    await workspace.importFolder(files);
    const wc = await getWebContainer();
    for (const f of files) {
       const parts = f.path.split('/');
       parts.pop(); // remove filename
       let current = '';
       for (const p of parts) {
         current += `/${p}`;
         await wc.fs.mkdir(current).catch(() => {}); // ignore already exists
       }
       await wc.fs.writeFile(`/${f.path}`, f.content).catch(() => {});
    }
  }, [workspace]);

  // ─── Active file ───
  const activeFile = openTabs.find(t => t.id === activeTabId) ?? null;

  // Keep open tab content in sync with workspace and auto-close deleted files
  useEffect(() => {
    setOpenTabs(prev => prev.map(t => {
      if (t.id.startsWith('tool:')) return t;
      const fresh = workspace.findFile(t.id);
      return fresh ? { ...t, content: fresh.content } : null;
    }).filter(Boolean) as FileNode[]);
  }, [workspace.files]);  



  // ─── Live preview content ───
  const getHtmlContent = () => {
    if (activeFile?.language === 'html') return activeFile.content;
    return openTabs.find(t => t.language === 'html')?.content ?? '';
  };

  const previewContent = {
    html: getHtmlContent(),
    css:  openTabs.find(t => t.language === 'css')?.content ?? '',
    js:   openTabs.find(t => t.language === 'javascript' || t.language === 'typescript')?.content ?? '',
  };

  // ─── Code execution ───
  const runActiveFile = useCallback(async () => {
    if (!activeFile?.content) return;
    const lang = activeFile.language ?? '';

    // Switch to output panel
    setBottomPanelOpen(true);
    setBottomTab('output');

    addOutput('system', `▶ Running ${activeFile.name}...`);

    try {
      if (lang === 'javascript' || lang === 'typescript') {
        const r = await executeJavaScript(activeFile.content);
        r.sandboxResult.logs.forEach(l => addOutput(l.type as OutputLine['type'], l.args.join(' ')));
        r.sandboxResult.alerts.forEach(a => addOutput('alert', `[${a.kind}] ${a.message}`));
        r.sandboxResult.errors.forEach(e => addOutput('error', e));
        if (!r.sandboxResult.logs.length && !r.sandboxResult.errors.length) {
          addOutput('system', '(no output)');
        }
      } else if (lang === 'python') {
        addOutput('system', 'Loading Python environment (Pyodide WASM)...');
        const r = await executePython(activeFile.content);
        if (r.stdout) addOutput('log', r.stdout);
        if (r.stderr) addOutput('error', r.stderr);
        if (!r.stdout && !r.stderr) addOutput('system', '(no output)');
      } else {
        // Multi-language unified execution (C, C++, Java, Rust, Go, C#, SQL)
        addOutput('system', `Dispatching ${lang.toUpperCase()} to execution runtime...`);
        const r = await executeCode({
          languageId: lang,
          code: activeFile.content,
          filename: activeFile.name,
        });

        if (r.compilerOutput) addOutput('system', `[Compiler] ${r.compilerOutput}`);
        if (r.stdout) addOutput('log', r.stdout);
        if (r.stderr) addOutput('error', r.stderr);
        if (r.exitCode !== 0) {
          addOutput('error', `Process exited with code ${r.exitCode}`);
        } else if (!r.stdout && !r.stderr && !r.compilerOutput) {
          addOutput('system', '(no output)');
        }
        if (r.executionDurationMs !== undefined) {
          addOutput('system', `Completed in ${r.executionDurationMs}ms via ${r.runtimeName}`);
        }
      }
    } catch (e: unknown) {
      addOutput('error', String(e));
    }
  }, [activeFile, addOutput]);

  const handleBrainClick = async () => {
    if (!activeFile?.content || !aiAssistantRef.current || !editorRef.current) return;
    
    setBrainWidget(prev => ({ ...prev, loading: true }));
    const generatedCode = await aiAssistantRef.current.autoComplete(
      activeFile.content,
      cursorPos.line,
      cursorPos.col
    );
    
    if (generatedCode && editorRef.current) {
      editorRef.current.insertTextAtCursor(generatedCode);
    }
    setBrainWidget(prev => ({ ...prev, visible: false, loading: false }));
  };

  const handleSmartAction = (action: 'explain' | 'fix' | 'optimize') => {
    if (!selection.text) return;
    setRightPanel('ai');
    setTimeout(() => {
      let prompt = '';
      if (action === 'explain') prompt = `Please explain this code in detail:\n\`\`\`\n${selection.text}\n\`\`\``;
      else if (action === 'fix') prompt = `Please find and fix any bugs or issues in this code:\n\`\`\`\n${selection.text}\n\`\`\``;
      else if (action === 'optimize') prompt = `Please optimize this code for maximum efficiency and readability:\n\`\`\`\n${selection.text}\n\`\`\``;
      aiAssistantRef.current?.submitPrompt(prompt);
    }, 150);
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        runActiveFile();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === '`') {
        e.preventDefault();
        setBottomPanelOpen(v => !v);
      }
      if (e.key === 'F11') {
        e.preventDefault();
        handleToggleFullscreen();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        const zHandler = (ze: KeyboardEvent) => {
          if (ze.key.toLowerCase() === 'z') {
            ze.preventDefault();
            setIsZenMode(prev => !prev);
          }
          window.removeEventListener('keydown', zHandler);
        };
        window.addEventListener('keydown', zHandler, { once: true });
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [runActiveFile]);

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const handleToggleZenMode = () => {
    setIsZenMode(v => !v);
  };

  // Command Palette Actions
  const handlePaletteAction = useCallback((action: string, payload?: any) => {
    if (action === 'openFile') {
      openTab(payload);
    } else if (action === 'run') {
      runActiveFile();
    } else if (action === 'view') {
      if (payload === 'settings') {
        setActivityView('settings');
      } else {
        setRightPanel(payload);
      }
    }
  }, [openTab, runActiveFile]);

  // ─── Problems ───
  const handleEditorErrors = useCallback((errs: { line: number; message: string }[]) => {
    if (!activeFile) return;
    setProblems(prev => {
      const other = prev.filter(p => p.fileId !== activeFile.id);
      const newProbs: Problem[] = errs.map(e => ({
        fileId: activeFile.id,
        fileName: activeFile.name,
        line: e.line,
        column: 1,
        severity: 'error' as const,
        message: e.message,
      }));
      return [...other, ...newProbs];
    });
  }, [activeFile]);

  const jumpToLine = useCallback((fileId: string, line: number, col: number) => {
    const tab = openTabs.find(t => t.id === fileId);
    if (tab) {
      setActiveTabId(fileId);
      setTimeout(() => editorRef.current?.goToLine(line, col), 100);
    }
  }, [openTabs]);

  // ─── Format ───
  const handleFormat = () => editorRef.current?.format();

  // ─── Export ZIP ───
  const exportProject = async () => {
    try {
      await downloadProject(workspace.files, 'hrdk-pen-project');
      toast({ title: 'Export complete!' });
    } catch (e: any) {
      toast({ title: 'Export failed', description: e.message, variant: 'destructive' });
    }
  };

  // ─── Publish ───
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);

  const handlePublishClick = () => {
    setIsPublishModalOpen(true);
  };

  const handlePublishSubmit = async (details: { name: string; description: string; category: string }) => {
    try {
      const url = await publishProject(workspace.files, details);
      toast({ 
        title: 'Project Published 🎉', 
        description: `Live URL: ${url}`,
      });
      addOutput('info', `Project "${details.name}" published successfully to: ${url}`);
    } catch (e: any) {
      toast({ title: 'Publish failed', description: e.message, variant: 'destructive' });
    }
  };

  // ─── Download current file ───
  const downloadCurrent = () => {
    if (!activeFile?.content) return;
    const blob = new Blob([activeFile.content], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = activeFile.name;
    a.click();
  };

  // ─── Sidebar content ───
  const renderSidebarContent = () => {
    if (activityView === 'projects') {
      return (
        <ProjectsPanel
          projects={workspace.projects}
          activeProjectId={workspace.activeProjectId}
          onOpenProject={async (id) => {
            await workspace.switchProject(id);
            setActivityView('explorer');
          }}
          onDeleteProject={workspace.deleteProject}
          onRenameProject={workspace.renameProject}
          onCopyProject={workspace.copyProject}
          onCreateNew={() => setShowBootstrap(true)}
        />
      );
    }
    if (activityView === 'search') {
      return (
        <div className="flex flex-col h-full">
          <div className="px-3 py-2 border-b border-editor-border">
            <p className="text-xs font-semibold text-editor-text-muted uppercase tracking-wider mb-2">Search</p>
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search in files..."
              className="w-full h-7 px-2 text-xs bg-editor-bg border border-editor-border rounded text-editor-text outline-none focus:border-editor-accent"
            />
          </div>
          {searchQuery && (
            <div className="flex-1 overflow-y-auto p-2 space-y-1 font-code text-xs">
              {(() => {
                const results: { file: FileNode; lines: { n: number; text: string }[] }[] = [];
                const search = (nodes: FileNode[]) => {
                  for (const n of nodes) {
                    if (n.type === 'file' && n.content) {
                      const matches = n.content.split('\n')
                        .map((text, i) => ({ n: i + 1, text }))
                        .filter(l => l.text.toLowerCase().includes(searchQuery.toLowerCase()));
                      if (matches.length) results.push({ file: n, lines: matches });
                    }
                    if (n.children) search(n.children);
                  }
                };
                search(workspace.files);
                if (!results.length) return <p className="text-editor-text-dim p-2">No results</p>;
                return results.map(r => (
                  <div key={r.file.id}>
                    <div
                      className="flex items-center gap-1.5 px-1 py-0.5 cursor-pointer hover:bg-editor-active-tab rounded text-editor-text font-medium"
                      onClick={() => openTab(r.file)}
                    >
                      {getFileLanguageIcon(r.file.name, 'w-3 h-3')}
                      <span>{r.file.name}</span>
                      <span className="text-editor-text-dim ml-auto">{r.lines.length}</span>
                    </div>
                    {r.lines.slice(0, 5).map(l => (
                      <div
                        key={l.n}
                        onClick={() => { openTab(r.file); jumpToLine(r.file.id, l.n, 1); }}
                        className="pl-5 py-0.5 text-editor-text-muted hover:text-editor-text cursor-pointer hover:bg-editor-active-tab rounded truncate"
                        title={l.text}
                      >
                        <span className="text-editor-text-dim mr-1.5">{l.n}</span>
                        {l.text.trim()}
                      </div>
                    ))}
                  </div>
                ));
              })()}
            </div>
          )}
        </div>
      );
    }
    if (activityView === 'docs') {
      return <DocsViewer />;
    }
    if (activityView === 'help') {
      return <HelpCenter />;
    }
    if (activityView === 'assets') {
      return <AssetLibrary />;
    }
    // Default: explorer
    const activeProject = workspace.projects.find(p => p.id === workspace.activeProjectId);
    return (
      <FileExplorer
        files={workspace.files}
        selectedFileId={activeTabId}
        onFileSelect={openTab}
        onFileCreate={handleFileCreate}
        onFileDelete={handleFileDelete}
        onFileRename={handleFileRename}
        onMove={handleFileMove}
        onImportFolder={handleImportFolder}
        projectName={activeProject?.name}
        onSync={() => {
          fsSyncService.forceSync();
        }}
        onLoadTemplate={async (type) => {
          await workspace.loadTemplate(type);
        }}
      />
    );
  };

  const errorCount = problems.filter(p => p.severity === 'error').length;
  const warningCount = problems.filter(p => p.severity === 'warning').length;

  if (!workspace.isReady) {
    return (
      <div className="flex flex-col items-center justify-center w-screen h-screen bg-[#1e1e2e] text-[#cdd6f4]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
        <p>Loading Workspace...</p>
      </div>
    );
  }
  const needsBootstrap = workspace.isReady && !workspace.activeProjectId;
  if (needsBootstrap || showBootstrap) {
    return (
      <BootstrapScreen
        projects={workspace.projects}
        onOpenProject={async (id) => {
          setShowBootstrap(false);
          await workspace.switchProject(id);
        }}
        onDeleteProject={workspace.deleteProject}
        onLoadTemplate={async (type) => {
          setShowBootstrap(false);
          await workspace.loadTemplate(type as any);
        }} 
        onImportFolder={() => {
          setShowBootstrap(false);
          // Trigger the standard import flow
          const input = document.createElement('input');
          input.type = 'file';
          input.webkitdirectory = true;
          input.onchange = async (e) => {
            const files = Array.from((e.target as HTMLInputElement).files || []);
            if (!files.length) return;
            const items = await Promise.all(
              files.map(async f => ({ path: f.webkitRelativePath, content: await f.text() }))
            );
            workspace.importFolder(items);
          };
          input.click();
        }}
      />
    );
  }

  return (
    <div className="ide-root no-select">
      {(isScaffolding || bootstrapStatus?.state === 'installing') && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#1e1e2e]/80 backdrop-blur-sm animate-fade-in">
          <div className="flex flex-col items-center bg-[#181825] p-6 rounded-xl border border-[#313244] shadow-2xl max-w-sm text-center">
            <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
            <h3 className="text-[#cdd6f4] font-medium text-base">Setting Up Dependencies</h3>
            <p className="text-[#a6adc8] text-xs mt-2">
              {bootstrapStatus?.message || 'Installing packages inside WebContainer. Check the terminal for progress.'}
            </p>
          </div>
        </div>
      )}
      {/* Header */}
      {!isZenMode && (
        <SystemHeader
          activeFile={activeFile}
          projectName={workspace.projects.find(p => p.id === workspace.activeProjectId)?.name}
          projectLanguage={workspace.projects.find(p => p.id === workspace.activeProjectId)?.language}
          onRun={runActiveFile}
          onFormat={handleFormat}
          onExport={exportProject}
          onPublish={handlePublishClick}
          onDownloadCurrent={downloadCurrent}
          terminalOpen={bottomPanelOpen}
          onToggleTerminal={() => setBottomPanelOpen(v => !v)}
          rightPanelOpen={rightPanel !== null}
          onToggleRightPanel={() => setRightPanel(prev => prev ? null : 'preview')}
          onNewProject={() => setShowBootstrap(true)}
          onOpenProjects={() => setActivityView('projects')}
          onTogglePreview={() => setRightPanel(prev => prev === 'preview' ? null : 'preview')}
          serverUrl={serverUrl}
          isFullscreen={isFullscreen}
          onToggleFullscreen={handleToggleFullscreen}
          isZenMode={isZenMode}
          onToggleZenMode={handleToggleZenMode}
        />
      )}

      <PublishModal
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        onPublish={handlePublishSubmit}
      />

      <CommandPalette 
        open={paletteOpen} 
        setOpen={setPaletteOpen} 
        onAction={handlePaletteAction} 
        files={workspace.files}
      />

      {/* Body */}
      <div className="flex flex-1 overflow-hidden min-h-0">
        {/* Activity bar */}
        {!isZenMode && (
          <ActivityBar
            active={activityView}
            onChange={(view) => {
              if (['excalidraw', 'mdn', 'learn'].includes(view)) {
                const toolId = `tool:${view}`;
                const existing = openTabs.find(t => t.id === toolId);
                if (!existing) {
                  const name = view === 'excalidraw' ? 'Whiteboard' : view === 'mdn' ? 'DevDocs' : 'Learn Web Dev';
                  setOpenTabs(prev => [...prev, {
                    id: toolId,
                    name,
                    type: 'file',
                    language: 'tool',
                  } as any]);
                }
                setActiveTabId(toolId);
              } else {
                setActivityView(view);
              }
            }}
            onOpenSettings={() => setShowSettings(true)}
            terminalOpen={bottomPanelOpen}
            onToggleTerminal={() => setBottomPanelOpen(v => !v)}
            errorCount={errorCount}
          />
        )}

        {/* Main layout */}
        <div className="flex flex-col flex-1 overflow-hidden min-h-0 relative">
          
          {isZenMode && (
            <button 
              onClick={handleToggleZenMode}
              className="absolute top-4 right-4 z-50 p-2 rounded-full bg-editor-panel border border-editor-border shadow-lg text-editor-text-muted hover:text-editor-text transition-colors"
              title="Exit Zen Mode (Ctrl+K Z)"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <ResizablePanelGroup direction="vertical" className="flex-1 min-h-0">
            <ResizablePanel defaultSize={75} minSize={30} className="flex-1 min-h-0">
              <ResizablePanelGroup direction="horizontal" className="h-full">
            {/* Sidebar */}
            {!['excalidraw', 'mdn', 'learn'].includes(activityView) && !isZenMode && (
              <>
                <ResizablePanel defaultSize={20} minSize={14} maxSize={40}>
                  <div className="flex flex-col h-full border-r border-editor-border bg-editor-sidebar">
                    {/* Sidebar title — only show for non-explorer views that need it */}
                    {activityView !== 'explorer' && (
                      <div
                        className="px-4 py-2 flex-shrink-0 border-b border-editor-border"
                        style={{ height: 36 }}
                      >
                        <p className="text-[11px] font-semibold uppercase tracking-widest text-editor-text-muted">
                          {activityView === 'search'         ? 'Search'
                          : activityView === 'projects'     ? 'Projects'
                          : activityView === 'docs'         ? 'Documentation'
                          : activityView === 'assets'       ? 'Assets'
                          : activityView === 'help'         ? 'Help Center'
                          : 'Settings'}
                        </p>
                      </div>
                    )}
                    <div className="flex-1 overflow-hidden">
                      {renderSidebarContent()}
                    </div>
                  </div>
                </ResizablePanel>
                <ResizableHandle withHandle />
              </>
            )}

            {/* Editor + Right panel */}
            <ResizablePanel defaultSize={rightPanel ? 55 : 80}>
              <div className="flex flex-col h-full overflow-hidden">
                  <>
                {/* Tab bar */}
                <div
                  className="flex items-center overflow-x-auto flex-shrink-0 no-select px-2 py-1 gap-1"
                  style={{
                    height: 40,
                    background: 'hsl(var(--crust))',
                    borderBottom: '1px solid hsl(var(--surface1))',
                  }}
                >
                  {openTabs.map(tab => (
                    <ContextMenu key={tab.id}>
                      <ContextMenuTrigger>
                        <div
                          className={`editor-tab ${activeTabId === tab.id ? 'active' : ''}`}
                          onClick={() => setActiveTabId(tab.id)}
                          title={tab.name}
                        >
                          {getFileLanguageIcon(tab.name, 'w-3 h-3 flex-shrink-0')}
                          <span className="truncate text-xs">{tab.name}</span>
                          <button
                            className="tab-close"
                            onClick={e => closeTab(tab.id, e)}
                          >
                            <X className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      </ContextMenuTrigger>
                      <ContextMenuContent className="w-40 bg-editor-panel border-editor-border text-editor-text">
                        <ContextMenuItem onClick={() => closeTab(tab.id)}>
                          Close
                        </ContextMenuItem>
                        <ContextMenuItem 
                          onClick={() => {
                            setOpenTabs([tab]);
                            setActiveTabId(tab.id);
                          }}
                          disabled={openTabs.length <= 1}
                        >
                          Close Others
                        </ContextMenuItem>
                        <ContextMenuSeparator className="bg-editor-border" />
                        <ContextMenuItem 
                          onClick={() => {
                            setOpenTabs([]);
                            setActiveTabId('');
                          }}
                        >
                          Close All
                        </ContextMenuItem>
                      </ContextMenuContent>
                    </ContextMenu>
                  ))}
                </div>

                {/* Editor */}
                <div className="flex-1 min-h-0 relative">
                  {activeFile ? (
                    <>
                      {activeFile.language === 'tool' ? (
                        activeFile.id === 'tool:excalidraw' ? (
                          <PersonalCanvas />
                        ) : activeFile.id === 'tool:mdn' ? (
                          <IframePanel title="DevDocs" url="https://devdocs.io/" icon={<BookOpen className="w-5 h-5" />} />
                        ) : (
                          <IframePanel title="Learn Web Dev" url="https://corsproxy.io/?url=https%3A%2F%2Fweb.dev%2Flearn" icon={<GraduationCap className="w-5 h-5" />} />
                        )
                      ) : (
                        <CodeEditor
                          fileId={activeFile.id}
                          value={activeFile.content ?? ''}
                          onChange={handleContentChange}
                          language={activeFile.language || getLanguageFromFilename(activeFile.name)}
                          fileName={activeFile.name}
                          settings={settings}
                          onRun={runActiveFile}
                          onCursorChange={(line, col) => {
                            setCursorPos({ line, col });
                          }}
                          onSelectionChange={(text, pos) => setSelection({ text, pos })}
                          onErrors={handleEditorErrors}
                          onEditorReady={api => { editorRef.current = api; }}
                          onAIAction={(action, code) => {
                            setRightPanel('ai');
                            setTimeout(() => {
                              let prompt = '';
                              if (action === 'explain') prompt = `Please explain the following code:\n\n\`\`\`\n${code}\n\`\`\``;
                              else if (action === 'fix') prompt = `Please find and fix any bugs in this code:\n\n\`\`\`\n${code}\n\`\`\``;
                              else if (action === 'optimize') prompt = `Please optimize the following code for performance and readability:\n\n\`\`\`\n${code}\n\`\`\``;
                              aiAssistantRef.current?.submitPrompt(prompt);
                            }, 100);
                          }}
                        />
                      )}
                      <SmartPopup 
                        position={selection.pos}
                        text={selection.text}
                        onAction={handleSmartAction}
                      />
                    </>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center gap-4 text-center select-none">
                      <div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center"
                        style={{ background: 'hsl(var(--surface0))' }}
                      >
                        <span className="text-4xl">🖋️</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-editor-text mb-1">No file open</p>
                        <p className="text-xs text-editor-text-muted">
                          Select a file from the Explorer or create a new one
                        </p>
                      </div>
                    </div>
                  )}
                  </div>
                </>
              </div>
            </ResizablePanel>

            {/* Right panel */}
            {rightPanel && (
              <>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={25} minSize={20} maxSize={50}>
                  <div className="flex flex-col h-full border-l border-editor-border">
                    {/* Right panel tabs (Compact Native macOS-style Icon Toolbar) */}
                    <div
                      className="flex items-center justify-between flex-shrink-0 px-2.5 bg-[hsl(var(--crust))] border-b border-[hsl(var(--surface1))]"
                      style={{ height: 38 }}
                      role="toolbar"
                      aria-label="Right Panel Toolbar"
                    >
                      <div className="flex items-center gap-1 p-0.5 rounded-lg bg-[hsl(var(--mantle))] border border-[hsl(var(--surface1))]/80">
                        {/* Browser Preview Tab */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              onClick={() => setRightPanel('preview')}
                              aria-label="Browser Preview"
                              className={`h-7 w-7 flex items-center justify-center rounded-md transition-all ${
                                rightPanel === 'preview'
                                  ? 'bg-[hsl(var(--surface0))] text-[hsl(var(--text))] shadow-sm border border-[hsl(var(--surface2))]'
                                  : 'text-[hsl(var(--overlay1))] hover:text-[hsl(var(--text))] hover:bg-[hsl(var(--surface0))/0.4]'
                              }`}
                            >
                              <Globe className="w-3.5 h-3.5" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="bottom" className="text-xs">
                            Browser Preview
                          </TooltipContent>
                        </Tooltip>

                        {/* AI Assistant Tab */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              onClick={() => setRightPanel('ai')}
                              aria-label="AI Assistant"
                              className={`h-7 w-7 flex items-center justify-center rounded-md transition-all ${
                                rightPanel === 'ai'
                                  ? 'bg-[hsl(var(--surface0))] text-[hsl(var(--text))] shadow-sm border border-[hsl(var(--surface2))]'
                                  : 'text-[hsl(var(--overlay1))] hover:text-[hsl(var(--text))] hover:bg-[hsl(var(--surface0))/0.4]'
                              }`}
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="bottom" className="text-xs">
                            AI Assistant
                          </TooltipContent>
                        </Tooltip>

                        {/* Docs Tab */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              onClick={() => setRightPanel('docs')}
                              aria-label="Documentation"
                              className={`h-7 w-7 flex items-center justify-center rounded-md transition-all ${
                                rightPanel === 'docs'
                                  ? 'bg-[hsl(var(--surface0))] text-[hsl(var(--text))] shadow-sm border border-[hsl(var(--surface2))]'
                                  : 'text-[hsl(var(--overlay1))] hover:text-[hsl(var(--text))] hover:bg-[hsl(var(--surface0))/0.4]'
                              }`}
                            >
                              <BookOpen className="w-3.5 h-3.5" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="bottom" className="text-xs">
                            Documentation
                          </TooltipContent>
                        </Tooltip>

                        {/* Assets Tab */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              onClick={() => setRightPanel('assets')}
                              aria-label="Asset Library"
                              className={`h-7 w-7 flex items-center justify-center rounded-md transition-all ${
                                rightPanel === 'assets'
                                  ? 'bg-[hsl(var(--surface0))] text-[hsl(var(--text))] shadow-sm border border-[hsl(var(--surface2))]'
                                  : 'text-[hsl(var(--overlay1))] hover:text-[hsl(var(--text))] hover:bg-[hsl(var(--surface0))/0.4]'
                              }`}
                            >
                              <Layers className="w-3.5 h-3.5" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="bottom" className="text-xs">
                            Asset Library
                          </TooltipContent>
                        </Tooltip>
                      </div>

                      <div className="flex items-center gap-1">
                        {/* DoctorKit Diagnostics */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              onClick={() => {
                                setSettingsCategory('diagnostics');
                                setShowSettings(true);
                              }}
                              aria-label="DoctorKit Diagnostics"
                              className="h-7 w-7 flex items-center justify-center rounded-md text-[hsl(var(--overlay1))] hover:text-[hsl(var(--text))] hover:bg-[hsl(var(--surface0))] border border-[hsl(var(--surface1))]/80 bg-[hsl(var(--mantle))] transition-all"
                            >
                              <Activity className={`w-3.5 h-3.5 ${doctorKit.status === 'scanning' ? 'animate-pulse text-blue-400' : doctorKit.status === 'error' ? 'text-rose-400' : 'text-emerald-400'}`} />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="bottom" className="text-xs">
                            DoctorKit Diagnostics ({doctorKit.status})
                          </TooltipContent>
                        </Tooltip>

                        <div className="w-[1px] h-3.5 bg-[hsl(var(--surface1))] mx-0.5" />

                        {/* Close Right Panel */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              onClick={() => setRightPanel(null)}
                              aria-label="Close Right Panel"
                              className="h-7 w-7 flex items-center justify-center rounded-md text-[hsl(var(--overlay1))] hover:text-[hsl(var(--text))] hover:bg-[hsl(var(--surface0))] transition-all"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="bottom" className="text-xs">
                            Hide Panel
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </div>

                    <div className="flex-1 min-h-0">
                      {rightPanel === 'preview' ? (
                        <LivePreview
                          htmlContent={previewContent.html}
                          cssContent={previewContent.css}
                          jsContent={previewContent.js}
                          activeFileName={activeFile?.name}
                          serverUrl={serverUrl}
                          serverReadyCount={serverReadyCount}
                          bootstrapStatus={bootstrapStatus}
                          inspectEnabled={inspectEnabled}
                          onInspectChange={setInspectEnabled}
                          theme={settings.theme}
                          fontFamily={settings.fontFamily}
                          fontSize={settings.fontSize}
                          onNavigate={(url) => {
                            // Find the file by name (simple path matching)
                            const targetName = url.split('/').pop() || url;
                            let targetNode: FileNode | undefined;
                            
                            const searchNode = (nodes: FileNode[]) => {
                              for (const n of nodes) {
                                if (n.name === targetName && n.type === 'file') {
                                  targetNode = n;
                                  return;
                                }
                                if (n.children) searchNode(n.children);
                              }
                            };
                            searchNode(workspace.files);
                            
                            if (targetNode) {
                              openTab(targetNode);
                            } else {
                              addOutput('error', `Navigation failed: ${url} not found in workspace`);
                            }
                          }}
                          onConsoleMessage={(type, args) => {
                            addOutput(type as OutputLine['type'], args.join(' '));
                          }}
                        />
                      ) : rightPanel === 'ai' ? (
                        <AIAssistant ref={aiAssistantRef} />
                      ) : rightPanel === 'assets' ? (
                        <AssetLibrary />
                      ) : rightPanel === 'docs' ? (
                        <DocsViewer />
                      ) : null}
                    </div>
                  </div>
                </ResizablePanel>
              </>
            )}
          </ResizablePanelGroup>
        </ResizablePanel>

        {bottomPanelOpen && !isZenMode && (
          <>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={25} minSize={10} className="flex flex-col bg-editor-bg z-10">
              <div className="flex-1 flex flex-col h-full border-t border-editor-border">
            {/* Bottom panel tabs */}
            <div
              className="flex items-center justify-between flex-shrink-0 px-3 py-1 bg-[hsl(var(--crust))] border-b border-[hsl(var(--surface1))]"
              style={{
                height: 36,
              }}
              role="toolbar"
              aria-label="Bottom Workspace Toolbar"
            >
              <div className="flex items-center p-0.5 rounded-lg bg-[hsl(var(--mantle))] border border-[hsl(var(--surface1))]/80">
                {(['terminal', 'output', 'problems', 'inspect', 'help'] as BottomPanel[]).map(tab => {
                  const isActive = bottomTab === tab;
                  return (
                    <button
                      key={tab}
                      onClick={() => setBottomTab(tab)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                        isActive
                          ? 'bg-[hsl(var(--surface0))] text-[hsl(var(--text))] font-semibold shadow-xs border border-[hsl(var(--surface2))]'
                          : 'text-[hsl(var(--overlay1))] hover:text-[hsl(var(--text))] hover:bg-[hsl(var(--surface0))/0.5]'
                      }`}
                    >
                      {tab === 'problems' && errorCount > 0 && (
                        <span
                          className="inline-flex items-center justify-center w-4 h-4 rounded-full text-[9px] font-bold"
                          style={{ background: 'hsl(var(--red))', color: 'white' }}
                        >
                          {errorCount > 9 ? '9+' : errorCount}
                        </span>
                      )}
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  );
                })}
              </div>
              <div className="flex items-center gap-1">
                {bottomTab === 'terminal' && (
                  <>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => terminalRefs.current[activeTerminalId]?.clear()}
                          aria-label="Clear Terminal"
                          className="h-7 w-7 flex items-center justify-center rounded-md text-[hsl(var(--overlay1))] hover:text-[hsl(var(--text))] hover:bg-[hsl(var(--surface0))] transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-xs">
                        Clear Terminal
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => terminalRefs.current[activeTerminalId]?.execute('help')}
                          aria-label="Help Menu"
                          className="h-7 w-7 flex items-center justify-center rounded-md text-[hsl(var(--overlay1))] hover:text-[hsl(var(--text))] hover:bg-[hsl(var(--surface0))] transition-all"
                        >
                          <HelpCircle className="w-3.5 h-3.5" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-xs">
                        Terminal Help
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => terminalRefs.current[activeTerminalId]?.execute('npm run dev')}
                          aria-label="Start Dev Server"
                          className="h-7 px-2.5 flex items-center gap-1.5 rounded-md text-[11px] font-medium text-[hsl(var(--text))] hover:bg-[hsl(var(--surface0))] bg-[hsl(var(--mantle))] border border-[hsl(var(--surface1))] transition-all shadow-xs"
                        >
                          <Play className="w-3 h-3 fill-current text-emerald-400" />
                          <span>Run Dev</span>
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-xs">
                        Execute 'npm run dev'
                      </TooltipContent>
                    </Tooltip>
                  </>
                )}

                <div className="w-[1px] h-3.5 bg-[hsl(var(--surface1))] mx-0.5" />

                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setBottomPanelOpen(false)}
                      aria-label="Close Bottom Panel"
                      className="h-7 w-7 flex items-center justify-center rounded-md text-[hsl(var(--overlay1))] hover:text-[hsl(var(--text))] hover:bg-[hsl(var(--surface0))] transition-all"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs">
                    Hide Panel (Ctrl+`)
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>

            {/* Panel content */}
            <div className="flex-1 overflow-hidden flex flex-col min-h-0">
              <div style={{ display: bottomTab === 'terminal' ? 'flex' : 'none' }} className="flex-col w-full h-full">
                  <div className="flex items-center justify-between bg-[hsl(var(--crust))] border-b border-editor-border/60 px-3 py-1.5 overflow-x-auto min-h-[34px]">
                    <div className="flex items-center gap-1.5 overflow-x-auto">
                      {terminals.map(term => (
                        <div
                          key={term.id}
                          onClick={() => setActiveTerminalId(term.id)}
                          className={`group flex items-center gap-2 px-3 py-1 text-xs cursor-pointer rounded-lg transition-all font-mono ${
                            activeTerminalId === term.id
                              ? 'bg-[hsl(var(--surface0))] text-[hsl(var(--text))] font-medium shadow-sm border border-editor-border/80'
                              : 'text-editor-text-muted hover:text-editor-text hover:bg-[hsl(var(--surface0)/0.4)] border border-transparent'
                          }`}
                        >
                          <TerminalIcon className={`w-3.5 h-3.5 ${activeTerminalId === term.id ? 'text-blue-400' : 'text-editor-text-dim'}`} />
                          <span className="truncate max-w-[130px]">{term.name}</span>
                          {terminals.length > 1 && (
                            <button
                              onClick={(e) => handleRemoveTerminal(term.id, e)}
                              className="p-0.5 opacity-0 group-hover:opacity-100 hover:bg-red-500/20 rounded text-editor-text-muted hover:text-red-400 transition-all"
                            >
                              <X className="w-2.5 h-2.5" />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        onClick={handleAddTerminal}
                        className="p-1.5 rounded-lg text-editor-text-muted hover:text-editor-text hover:bg-[hsl(var(--surface0))] transition-colors border border-dashed border-editor-border/60 ml-0.5"
                        title="New Terminal Tab"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-editor-text-dim font-mono">
                      <span className="flex items-center gap-1 text-emerald-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        WebContainer Node.js 18
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 relative bg-[#1e1e2e]">
                    {terminals.map(term => (
                      <div
                        key={term.id}
                        className="absolute inset-0"
                        style={{ display: activeTerminalId === term.id ? 'block' : 'none' }}
                      >
                        <Terminal
                          ref={el => { terminalRefs.current[term.id] = el; }}
                        />
                      </div>
                    ))}
                  </div>
              </div>
              {bottomTab === 'output' && (
                <OutputPanel
                  lines={outputLines}
                  onClear={() => setOutputLines([])}
                />
              )}
              {bottomTab === 'problems' && (
                <ProblemsPanel
                  problems={problems}
                  onJumpTo={(fileId, line, col) => {
                    jumpToLine(fileId, line, col);
                    setBottomPanelOpen(false);
                  }}
                />
              )}
              {bottomTab === 'inspect' && (
                <div className="flex-1 w-full h-full relative">
                  <LivePreview
                    htmlContent={activeFile?.name.endsWith('.html') ? activeFile.content : getHtmlContent()}
                    cssContent={previewContent.css}
                    jsContent={previewContent.js}
                    activeFileName={activeFile?.name}
                    onNavigate={(url) => {
                      const targetName = url.split('/').pop() || url;
                      let targetNode: FileNode | undefined;
                      const searchNode = (nodes: FileNode[]) => {
                        for (const n of nodes) {
                          if (n.name === targetName && n.type === 'file') {
                            targetNode = n; return;
                          }
                          if (n.children) searchNode(n.children);
                        }
                      };
                      searchNode(workspace.files);
                      if (targetNode) {
                        openTab(targetNode);
                      } else {
                        addOutput('error', `Navigation failed: ${url} not found`);
                      }
                    }}
                    onConsoleMessage={(type, args) => {
                      addOutput(type as OutputLine['type'], args.join(' '));
                    }}
                    serverUrl={null} // Important: Do not pass serverUrl here to prevent multiple HMR clients crashing Vite
                    inspectEnabled={true}
                    onInspectChange={setInspectEnabled}
                  />
                </div>
              )}
              {bottomTab === 'help' && (
                <div className="flex-1 overflow-y-auto p-4 bg-[hsl(var(--mantle))] text-[hsl(var(--text))] custom-scrollbar">
                  <div className="max-w-4xl mx-auto space-y-4">
                    <div className="flex items-center justify-between border-b border-[hsl(var(--surface1))] pb-3">
                      <div>
                        <h3 className="text-sm font-semibold text-[hsl(var(--text))] flex items-center gap-2">
                          <TerminalIcon className="w-4 h-4 text-emerald-400" />
                          <span>Terminal & Shell Command Reference</span>
                        </h3>
                        <p className="text-xs text-[hsl(var(--overlay1))] mt-0.5">
                          Every command can be executed directly in the active WebContainer terminal or copied to your clipboard.
                        </p>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[hsl(var(--surface0))] border border-[hsl(var(--surface1))] text-[hsl(var(--subtext0))]">
                        Posix Shell / Node.js
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                      {[
                        { cmd: 'npm run dev', cat: 'Server', desc: 'Starts the Vite dev server with instant Hot Module Replacement (HMR)' },
                        { cmd: 'npm run build', cat: 'Build', desc: 'Compiles and bundles the production-optimized assets into /dist' },
                        { cmd: 'npm test', cat: 'Test', desc: 'Executes the project test suite using Vitest or Jest' },
                        { cmd: 'npm install --legacy-peer-deps', cat: 'Packages', desc: 'Installs all dependencies with legacy peer dependency resolution' },
                        { cmd: 'node index.js', cat: 'Runtime', desc: 'Executes the target JavaScript file directly inside Node.js' },
                        { cmd: 'npx -y create-vite@5.4.1 . --template react-ts', cat: 'Scaffold', desc: 'Scaffolds a clean React + TypeScript + Vite project' },
                        { cmd: 'npm i lucide-react clsx tailwind-merge', cat: 'UI', desc: 'Installs essential modern React UI utilities and icons' },
                        { cmd: 'npm i express cors dotenv', cat: 'Backend', desc: 'Installs Express server framework with CORS and env support' },
                        { cmd: 'ls -la', cat: 'Filesystem', desc: 'Lists all files, permissions, and directories including hidden dotfiles' },
                        { cmd: 'pwd', cat: 'Filesystem', desc: 'Prints the current working directory path of the WebContainer VFS' },
                        { cmd: 'mkdir -p src/components', cat: 'Filesystem', desc: 'Recursively creates nested folders in the workspace' },
                        { cmd: 'clear', cat: 'Terminal', desc: 'Clears the terminal output screen buffer' },
                      ].map((item, idx) => (
                        <div
                          key={idx}
                          className="flex flex-col justify-between p-3 rounded-xl border border-[hsl(var(--surface1))] bg-[hsl(var(--crust))] hover:border-[hsl(var(--surface2))] transition-all group shadow-xs"
                        >
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <code className="text-xs font-mono font-semibold text-blue-400 bg-[hsl(var(--surface0))] px-2 py-0.5 rounded border border-[hsl(var(--surface1))] truncate max-w-[240px]">
                              {item.cmd}
                            </code>
                            <span className="text-[9px] uppercase font-mono px-1.5 py-0.2 rounded bg-[hsl(var(--mantle))] text-[hsl(var(--overlay1))] border border-[hsl(var(--surface1))]">
                              {item.cat}
                            </span>
                          </div>

                          <p className="text-[11px] text-[hsl(var(--subtext0))] leading-relaxed mb-3">
                            {item.desc}
                          </p>

                          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[hsl(var(--surface1))]/60">
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(item.cmd);
                                toast({ title: 'Copied to Clipboard', description: item.cmd });
                              }}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium text-[hsl(var(--overlay1))] hover:text-white bg-[hsl(var(--mantle))] hover:bg-[hsl(var(--surface0))] border border-[hsl(var(--surface1))] transition-all"
                              title="Copy command to clipboard"
                            >
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </button>

                            <button
                              onClick={() => {
                                setBottomTab('terminal');
                                terminalRefs.current[activeTerminalId]?.execute(item.cmd);
                              }}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 transition-all shadow-xs"
                              title={`Execute "${item.cmd}" in terminal`}
                            >
                              <Play className="w-3 h-3 fill-current" />
                              <span>Run</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </ResizablePanel>
      </>
    )}
  </ResizablePanelGroup>
</div>
</div>
      {/* Status bar */}
      {!isZenMode && (
        <StatusBar
          activeFile={activeFile}
          cursorPosition={cursorPos}
          totalLines={activeFile?.content?.split('\n').length ?? 0}
          errors={errorCount}
          warnings={warningCount}
          onShowProblems={() => { setBottomPanelOpen(true); setBottomTab('problems'); }}
        />
      )}

      {/* Floating Card Modal for Settings */}
      {showSettings && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 bg-black/60 backdrop-blur-md animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowSettings(false);
          }}
        >
          <div className="relative w-full max-w-4xl h-[85vh] max-h-[750px] rounded-2xl overflow-hidden border border-editor-border bg-[hsl(var(--mantle))] shadow-2xl animate-scale-in flex flex-col">
            <SettingsPanel
              settings={settings}
              onUpdate={updateSetting}
              onReset={resetSettings}
              onClose={() => setShowSettings(false)}
              initialCategory={settingsCategory}
            />
          </div>
        </div>
      )}
    </div>
  );
};
