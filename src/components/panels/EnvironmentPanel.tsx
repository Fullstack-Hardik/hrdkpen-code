import { useState } from 'react';
import { 
  Cpu, 
  Terminal, 
  Package, 
  CheckCircle2, 
  AlertTriangle, 
  Play, 
  ExternalLink, 
  BookOpen, 
  Settings2,
  RefreshCw,
  Server
} from 'lucide-react';
import { SUPPORTED_LANGUAGES, type LanguageDefinition } from '@/lib/languageRegistry';

interface EnvironmentPanelProps {
  currentLanguageId?: string;
  onSelectLanguage?: (langId: string) => void;
  onRunTestCode?: (langId: string) => void;
}

export const EnvironmentPanel = ({
  currentLanguageId = 'typescript',
  onSelectLanguage,
  onRunTestCode,
}: EnvironmentPanelProps) => {
  const [selectedId, setSelectedId] = useState<string>(currentLanguageId);
  const activeLang: LanguageDefinition = SUPPORTED_LANGUAGES.find(l => l.id === selectedId) || SUPPORTED_LANGUAGES[0];

  const getTierBadge = (tier: number) => {
    switch (tier) {
      case 1:
        return <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">Tier 1 • Browser/WASM</span>;
      case 2:
        return <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-purple-500/15 text-purple-400 border border-purple-500/30">Tier 2 • Isolated Sandbox</span>;
      default:
        return <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-blue-500/15 text-blue-400 border border-blue-500/30">Tier 3 • Evaluator/Engine</span>;
    }
  };

  const getEnvName = (env: string) => {
    switch (env) {
      case 'webcontainer':
        return 'WebContainer (Node.js 18 WASM)';
      case 'pyodide':
        return 'Pyodide WebAssembly Sandbox';
      case 'browser-sandbox':
        return 'Browser DOM / Iframe Sandbox';
      case 'remote-sandbox':
        return 'Isolated Container (Piston)';
      case 'local-sql':
        return 'Local Relational Database Engine';
      default:
        return env;
    }
  };

  return (
    <div className="flex flex-col h-full bg-[hsl(var(--mantle))] text-[hsl(var(--text))] select-none overflow-hidden">
      {/* Panel Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[hsl(var(--surface0))] bg-[hsl(var(--crust))]">
        <div className="flex items-center gap-2">
          <Server className="w-4 h-4 text-primary" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--text))]">
            Language Runtimes & Toolchains
          </h2>
        </div>
        <span className="text-[11px] text-[hsl(var(--subtext0))]">
          {SUPPORTED_LANGUAGES.length} Runtimes Active
        </span>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Language selector list (left column) */}
        <div className="w-44 border-r border-[hsl(var(--surface0))] overflow-y-auto custom-scrollbar p-1.5 space-y-0.5">
          {SUPPORTED_LANGUAGES.map((lang) => {
            const isSelected = lang.id === selectedId;
            return (
              <button
                key={lang.id}
                onClick={() => {
                  setSelectedId(lang.id);
                  onSelectLanguage?.(lang.id);
                }}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-left text-xs transition-colors ${
                  isSelected
                    ? 'bg-primary/20 text-primary font-medium'
                    : 'text-[hsl(var(--subtext1))] hover:bg-[hsl(var(--surface0))] hover:text-[hsl(var(--text))]'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="text-[10px] font-mono opacity-60">
                    {lang.fileExtensions && lang.fileExtensions.length ? lang.fileExtensions[0] : ''}
                  </span>
                  <span className="truncate">{lang.name}</span>
                </div>
                <div className={`w-1.5 h-1.5 rounded-full ${lang.tier === 1 ? 'bg-emerald-400' : lang.tier === 2 ? 'bg-purple-400' : 'bg-blue-400'}`} />
              </button>
            );
          })}
        </div>

        {/* Detailed active environment view (right area) */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
          {/* Main Runtime Banner */}
          <div className="p-3.5 rounded-lg border border-[hsl(var(--surface0))] bg-[hsl(var(--crust))] flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <h3 className="text-sm font-semibold text-[hsl(var(--text))]">{activeLang.name}</h3>
                {getTierBadge(activeLang.tier)}
              </div>
              <p className="text-xs text-[hsl(var(--subtext0))] mb-2">
                {activeLang.description}
              </p>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-[11px] text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Verified & Operational
                </span>
                <span className="text-xs text-[hsl(var(--overlay1))]">•</span>
                <span className="text-xs font-mono text-[hsl(var(--subtext0))]">
                  {activeLang.runtimeVersion}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              {activeLang.docsUrl && (
                <a
                  href={activeLang.docsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-xs text-primary hover:underline px-2.5 py-1 rounded bg-[hsl(var(--surface0))] border border-[hsl(var(--surface1))]"
                >
                  <BookOpen className="w-3.5 h-3.5" /> Docs <ExternalLink className="w-2.5 h-2.5" />
                </a>
              )}
            </div>
          </div>

          {/* Runtime Execution Characteristics */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-lg border border-[hsl(var(--surface0))] bg-[hsl(var(--base))]">
              <span className="text-[10px] font-semibold text-[hsl(var(--subtext0))] uppercase tracking-wider block mb-1">
                Execution Environment
              </span>
              <div className="font-medium text-[hsl(var(--text))] flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-primary" />
                {getEnvName(activeLang.runtimeEnv)}
              </div>
            </div>

            <div className="p-3 rounded-lg border border-[hsl(var(--surface0))] bg-[hsl(var(--base))]">
              <span className="text-[10px] font-semibold text-[hsl(var(--subtext0))] uppercase tracking-wider block mb-1">
                Package Manager & Toolchain
              </span>
              <div className="font-medium text-[hsl(var(--text))] flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-amber-400" />
                {activeLang.packageManager?.name || 'Standard Library / Bundled'}
              </div>
            </div>
          </div>

          {/* Capabilities Grid */}
          <div className="p-3 rounded-lg border border-[hsl(var(--surface0))] bg-[hsl(var(--base))]">
            <span className="text-[10px] font-semibold text-[hsl(var(--subtext0))] uppercase tracking-wider block mb-2">
              Tooling & Capability Matrix
            </span>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${activeLang.capabilities.run ? 'bg-emerald-400' : 'bg-red-400'}`} />
                <span>Execution: {activeLang.capabilities.run ? 'Yes' : 'No'}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${activeLang.capabilities.build ? 'bg-emerald-400' : 'bg-surface2'}`} />
                <span>Compilation: {activeLang.capabilities.build ? 'GCC / Compiler' : 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${activeLang.capabilities.format ? 'bg-emerald-400' : 'bg-surface2'}`} />
                <span>Formatting: {activeLang.capabilities.format ? 'Available' : 'Monaco'}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${activeLang.capabilities.packageManagement ? 'bg-emerald-400' : 'bg-surface2'}`} />
                <span>Package Manager: {activeLang.capabilities.packageManagement ? 'Supported' : 'No'}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${activeLang.capabilities.debug ? 'bg-emerald-400' : 'bg-surface2'}`} />
                <span>Diagnostics: {activeLang.capabilities.debug ? 'Active' : 'Basic'}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${activeLang.capabilities.livePreview ? 'bg-emerald-400' : 'bg-surface2'}`} />
                <span>Live Preview: {activeLang.capabilities.livePreview ? 'Supported' : 'Terminal / Stdout'}</span>
              </div>
            </div>
          </div>

          {/* Starter Template Preview */}
          <div className="p-3 rounded-lg border border-[hsl(var(--surface0))] bg-[hsl(var(--base))]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-semibold text-[hsl(var(--subtext0))] uppercase tracking-wider">
                Default Sample Code
              </span>
              {onRunTestCode && (
                <button
                  onClick={() => onRunTestCode(activeLang.id)}
                  className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
                >
                  <Play className="w-3 h-3 fill-current" /> Run Test Snippet
                </button>
              )}
            </div>
            <pre className="p-2.5 rounded bg-[hsl(var(--crust))] border border-[hsl(var(--surface0))] text-xs font-mono text-[hsl(var(--subtext1))] overflow-x-auto max-h-36 custom-scrollbar">
              {activeLang.sampleCode}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
