import type { ReactNode } from 'react';
import {
  Settings2,
  FolderGit2,
  SearchCode,
  FolderKanban,
  BookMarked,
  Palette,
  Compass,
  Terminal,
} from 'lucide-react';

export type ActivityBarView =
  | 'explorer'
  | 'search'
  | 'projects'
  | 'excalidraw'
  | 'mdn'
  | 'learn'
  | 'settings'
  | 'docs'
  | 'help';

interface ActivityBarProps {
  active: ActivityBarView;
  onChange: (view: ActivityBarView) => void;
  onOpenSettings?: () => void;
  terminalOpen: boolean;
  onToggleTerminal: () => void;
  errorCount: number;
}

interface BarItem {
  id: ActivityBarView;
  icon: ReactNode;
  label: string;
  position: 'top' | 'bottom';
  badgeColor?: string;
}

export const ActivityBar = ({
  active,
  onChange,
  onOpenSettings,
  terminalOpen,
  onToggleTerminal,
  errorCount,
}: ActivityBarProps) => {
  const topItems: BarItem[] = [
    { id: 'explorer',     icon: <FolderGit2 className="w-[18px] h-[18px]" />,     label: 'File Explorer',     position: 'top' },
    { id: 'search',       icon: <SearchCode className="w-[18px] h-[18px]" />,     label: 'Global Search',     position: 'top' },
    { id: 'projects',     icon: <FolderKanban className="w-[18px] h-[18px]" />,   label: 'Project Workspaces', position: 'top' },
    { id: 'docs',         icon: <BookMarked className="w-[18px] h-[18px]" />,     label: 'Documentation',     position: 'top' },
    { id: 'excalidraw',   icon: <Palette className="w-[18px] h-[18px]" />,        label: 'Whiteboard',        position: 'top' },
    { id: 'mdn',          icon: <Compass className="w-[18px] h-[18px]" />,        label: 'Developer Docs',    position: 'top' },
  ];

  const renderItem = (item: BarItem) => {
    const isActive = active === item.id;
    return (
      <button
        key={item.id}
        title={item.label}
        onClick={() => onChange(item.id)}
        className={`activity-bar-icon group relative ${isActive ? 'active' : ''}`}
        aria-label={item.label}
        aria-pressed={isActive}
      >
        {/* Active indicator pill */}
        {isActive && (
          <span className="activity-bar-indicator animate-fade-in" />
        )}

        {/* Icon with subtle scale on active */}
        <span
          className="relative z-10 transition-transform duration-200"
          style={{ transform: isActive ? 'scale(1.05)' : 'scale(1)' }}
        >
          {item.icon}
        </span>

        {/* Apple style Tooltip */}
        <span
          className="absolute left-full ml-3 px-2.5 py-1 text-[11px] font-medium rounded-lg whitespace-nowrap pointer-events-none z-50
                     opacity-0 group-hover:opacity-100 transition-all duration-150 shadow-editor-md border border-[hsl(var(--surface1))]
                     bg-[hsl(var(--crust))]/95 backdrop-blur-md text-[hsl(var(--text))]"
        >
          {item.label}
        </span>
      </button>
    );
  };

  return (
    <div
      className="flex flex-col items-center justify-between flex-shrink-0 border-r border-[hsl(var(--surface1))] bg-[hsl(var(--mantle))]/90 backdrop-blur-xl py-2"
      style={{ width: 50 }}
      role="navigation"
      aria-label="Activity Bar"
    >
      {/* Top icons */}
      <div className="flex flex-col items-center gap-1">
        {topItems.map(renderItem)}
      </div>

      {/* Bottom icons */}
      <div className="flex flex-col items-center gap-1">
        {/* Terminal toggle */}
        <button
          title="Terminal (Ctrl+`)"
          onClick={onToggleTerminal}
          className={`activity-bar-icon group relative ${terminalOpen ? 'active' : ''}`}
          aria-label="Toggle Terminal"
          aria-pressed={terminalOpen}
        >
          {terminalOpen && <span className="activity-bar-indicator" />}
          <Terminal className="w-[18px] h-[18px] relative z-10 transition-colors" />
          {errorCount > 0 && (
            <span
              className="absolute top-1 right-1 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white z-20 shadow-sm"
              style={{ background: 'hsl(var(--red))' }}
            >
              {errorCount > 9 ? '9+' : errorCount}
            </span>
          )}
          <span
            className="absolute left-full ml-3 px-2.5 py-1 text-[11px] font-medium rounded-lg whitespace-nowrap pointer-events-none z-50
                       opacity-0 group-hover:opacity-100 transition-all duration-150 shadow-editor-md border border-[hsl(var(--surface1))]
                       bg-[hsl(var(--crust))]/95 backdrop-blur-md text-[hsl(var(--text))]"
          >
            Terminal (Ctrl+`)
          </span>
        </button>

        {/* Settings button */}
        <button
          title="Settings"
          onClick={() => {
            if (onOpenSettings) {
              onOpenSettings();
            } else {
              onChange('settings');
            }
          }}
          className="activity-bar-icon group relative hover:text-[hsl(var(--text))]"
          aria-label="Settings"
        >
          <Settings2 className="w-[18px] h-[18px] relative z-10 text-[hsl(var(--overlay1))] group-hover:text-white group-hover:rotate-45 transition-all duration-300" />
          <span
            className="absolute left-full ml-3 px-2.5 py-1 text-[11px] font-medium rounded-lg whitespace-nowrap pointer-events-none z-50
                       opacity-0 group-hover:opacity-100 transition-all duration-150 shadow-editor-md border border-[hsl(var(--surface1))]
                       bg-[hsl(var(--crust))]/95 backdrop-blur-md text-[hsl(var(--text))]"
          >
            Settings
          </span>
        </button>
      </div>
    </div>
  );
};
