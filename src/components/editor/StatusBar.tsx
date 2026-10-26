import { AlertCircle, AlertTriangle, GitBranch, Check } from 'lucide-react';
import { LANGUAGE_LABELS } from '@/lib/languages';
import type { FileNode } from '@/types';

interface StatusBarProps {
  activeFile?: FileNode | null;
  cursorPosition?: { line: number; column: number };
  totalLines?: number;
  errors?: number;
  warnings?: number;
  onShowProblems?: () => void;
}

export const StatusBar = ({
  activeFile,
  cursorPosition = { line: 1, column: 1 },
  totalLines = 0,
  errors = 0,
  warnings = 0,
  onShowProblems,
}: StatusBarProps) => {
  const language = activeFile?.language ?? '';
  const langLabel = LANGUAGE_LABELS[language] ?? (language || 'Plain Text');

  return (
    <div
      className="h-6 flex items-center justify-between px-3.5 flex-shrink-0 select-none text-[11px] font-medium bg-[hsl(var(--crust))]/90 backdrop-blur-md border-t border-[hsl(var(--surface1))]/70 text-[hsl(var(--overlay1))]"
    >
      {/* Left */}
      <div className="flex items-center gap-3">
        {/* Branch indicator */}
        <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[hsl(var(--surface0))]/40 border border-[hsl(var(--surface1))]/40 text-[hsl(var(--overlay2))] hover:text-white transition-colors cursor-pointer">
          <GitBranch className="w-3 h-3 text-indigo-400" />
          <span>main</span>
        </span>

        {/* Error / Warning count */}
        <button
          onClick={onShowProblems}
          className="flex items-center gap-2 px-2 py-0.5 rounded-md hover:bg-[hsl(var(--surface0))]/60 transition-all text-xs"
        >
          <span className={`flex items-center gap-1 font-mono text-[11px] ${errors > 0 ? 'text-[hsl(var(--red))] font-semibold' : 'text-[hsl(var(--overlay0))]'}`}>
            <AlertCircle className="w-3 h-3" />
            {errors}
          </span>
          <span className={`flex items-center gap-1 font-mono text-[11px] ${warnings > 0 ? 'text-[hsl(var(--peach))] font-semibold' : 'text-[hsl(var(--overlay0))]'}`}>
            <AlertTriangle className="w-3 h-3" />
            {warnings}
          </span>
        </button>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        {activeFile && (
          <>
            <span className="font-mono text-[10px] text-[hsl(var(--overlay1))]">
              Ln {cursorPosition.line}, Col {cursorPosition.column}
            </span>
            {totalLines > 0 && <span className="font-mono text-[10px] text-[hsl(var(--overlay0))]">{totalLines} lines</span>}
            <span className="text-[10px] text-[hsl(var(--overlay0))]">UTF-8</span>
            <span className="text-[10px] text-[hsl(var(--overlay0))]">LF</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
              {langLabel}
            </span>
          </>
        )}
        <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
          <Check className="w-2.5 h-2.5" />
          Ready
        </span>
      </div>
    </div>
  );
};
