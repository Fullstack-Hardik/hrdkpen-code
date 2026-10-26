import React, { useState } from 'react';
import { FolderTree, Trash2, Clock, Plus, Download, Pin, FileCode2, Search, Check, Copy, Edit2, FolderGit2 } from 'lucide-react';
import type { ProjectMeta } from '@/hooks/use-workspace';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

interface ProjectsPanelProps {
  projects: ProjectMeta[];
  activeProjectId: string | null;
  onOpenProject: (id: string) => void;
  onDeleteProject: (id: string) => void;
  onRenameProject: (id: string, newName: string) => void;
  onCopyProject: (id: string) => void;
  onCreateNew: () => void;
}

export const ProjectsPanel = ({ 
  projects, 
  activeProjectId, 
  onOpenProject, 
  onDeleteProject, 
  onRenameProject, 
  onCopyProject, 
  onCreateNew 
}: ProjectsPanelProps) => {
  const [search, setSearch] = useState('');
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [filterLang, setFilterLang] = useState<string | null>(null);
  
  const sorted = [...projects]
    .filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    .filter(p => filterLang ? p.language === filterLang : true)
    .sort((a, b) => {
      if (a.isFavorite && !b.isFavorite) return -1;
      if (!a.isFavorite && b.isFavorite) return 1;
      return b.lastOpened - a.lastOpened;
    });

  const allLanguages = Array.from(new Set(projects.map(p => p.language).filter(Boolean)));

  return (
    <div className="flex flex-col h-full bg-[hsl(var(--mantle))] select-none overflow-hidden">
      {/* Sleek macOS Toolbar Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-[hsl(var(--surface1))] bg-[hsl(var(--crust))] flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-[hsl(var(--surface0))] border border-[hsl(var(--surface2))] flex items-center justify-center text-[hsl(var(--text))]">
            <FolderGit2 className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-semibold text-[hsl(var(--text))] tracking-tight">Project Workspaces</span>
        </div>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={onCreateNew}
              aria-label="Create New Project"
              className="h-6 px-2 flex items-center gap-1 text-[11px] font-medium text-[hsl(var(--text))] bg-[hsl(var(--surface0))] hover:bg-[hsl(var(--surface1))] rounded-md border border-[hsl(var(--surface2))] transition-all shadow-xs"
            >
              <Plus className="w-3 h-3" />
              <span>New</span>
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">Create New Project</TooltipContent>
        </Tooltip>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-2.5 border-b border-[hsl(var(--surface1))] bg-[hsl(var(--crust))] flex flex-col gap-2 flex-shrink-0">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[hsl(var(--overlay1))]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search projects..."
            className="w-full h-7 pl-8 pr-2.5 text-xs bg-[hsl(var(--mantle))] border border-[hsl(var(--surface1))] rounded-lg text-[hsl(var(--text))] placeholder:text-[hsl(var(--overlay0))] outline-none focus:border-blue-500/60 transition-colors"
          />
        </div>

        {allLanguages.length > 0 && (
          <div className="flex gap-1 overflow-x-auto scrollbar-none pb-0.5">
            <button
              onClick={() => setFilterLang(null)}
              className={`px-2 py-0.5 rounded-md text-[10px] font-medium whitespace-nowrap transition-all border ${
                !filterLang
                  ? 'bg-[hsl(var(--surface1))] text-[hsl(var(--text))] border-[hsl(var(--surface2))] shadow-xs'
                  : 'bg-[hsl(var(--mantle))] text-[hsl(var(--overlay1))] border-[hsl(var(--surface0))] hover:text-[hsl(var(--text))]'
              }`}
            >
              All
            </button>
            {allLanguages.map(lang => (
              <button
                key={lang}
                onClick={() => setFilterLang(lang as string)}
                className={`px-2 py-0.5 rounded-md text-[10px] font-medium whitespace-nowrap transition-all border ${
                  filterLang === lang
                    ? 'bg-[hsl(var(--surface1))] text-[hsl(var(--text))] border-[hsl(var(--surface2))] shadow-xs'
                    : 'bg-[hsl(var(--mantle))] text-[hsl(var(--overlay1))] border-[hsl(var(--surface0))] hover:text-[hsl(var(--text))]'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Projects Grid / List */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-2 custom-scrollbar bg-[hsl(var(--base))]">
        {sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center p-4">
            <div className="w-10 h-10 rounded-2xl bg-[hsl(var(--surface0))] border border-[hsl(var(--surface2))] flex items-center justify-center mb-2 shadow-xs">
              <FolderTree className="w-5 h-5 text-[hsl(var(--overlay1))]" />
            </div>
            <p className="text-xs font-semibold text-[hsl(var(--text))]">No projects found</p>
            <p className="text-[11px] text-[hsl(var(--overlay1))] mb-3">Create or load a template to begin coding.</p>
            <button
              onClick={onCreateNew}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-lg transition-colors shadow-xs"
            >
              New Project
            </button>
          </div>
        ) : (
          sorted.map(proj => {
            const isActive = activeProjectId === proj.id;
            return (
              <div
                key={proj.id}
                className={`group relative flex flex-col p-2.5 rounded-xl cursor-pointer transition-all border shadow-xs ${
                  isActive 
                    ? 'bg-[hsl(var(--surface0))] border-[hsl(var(--surface2))] shadow-sm' 
                    : 'bg-[hsl(var(--crust))] border-[hsl(var(--surface1))] hover:border-[hsl(var(--surface2))] hover:bg-[hsl(var(--surface0))/0.5]'
                }`}
                onClick={() => onOpenProject(proj.id)}
              >
                <div className="flex items-center justify-between mb-1.5">
                  {renamingId === proj.id ? (
                    <input
                      autoFocus
                      value={renameValue}
                      onChange={e => setRenameValue(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && renameValue.trim()) {
                          onRenameProject(proj.id, renameValue.trim());
                          setRenamingId(null);
                        } else if (e.key === 'Escape') {
                          setRenamingId(null);
                        }
                      }}
                      onBlur={() => {
                        if (renameValue.trim()) onRenameProject(proj.id, renameValue.trim());
                        setRenamingId(null);
                      }}
                      className="text-xs font-semibold bg-[hsl(var(--mantle))] border border-blue-500/60 outline-none px-2 py-0.5 rounded-md text-[hsl(var(--text))] w-full mr-2"
                      onClick={e => e.stopPropagation()}
                    />
                  ) : (
                    <div className="flex items-center gap-1.5 min-w-0 pr-12">
                      <span className="text-xs font-semibold text-[hsl(var(--text))] truncate">{proj.name}</span>
                      {isActive && (
                        <span className="px-1.5 py-0.2 rounded text-[8px] font-mono uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                          Active
                        </span>
                      )}
                    </div>
                  )}

                  {proj.isFavorite && (
                    <Pin className="w-3 h-3 text-blue-400 flex-shrink-0 fill-current" />
                  )}
                </div>

                <div className="flex items-center justify-between mt-1 text-[10px] text-[hsl(var(--overlay1))]">
                  <div className="flex items-center gap-1.5">
                    {proj.language && (
                      <span className="px-1.5 py-0.2 rounded font-mono uppercase text-[9px] bg-[hsl(var(--mantle))] border border-[hsl(var(--surface1))] text-[hsl(var(--subtext0))]">
                        {proj.language}
                      </span>
                    )}
                    <span className="flex items-center gap-1 font-mono">
                      <Clock className="w-2.5 h-2.5" />
                      {new Date(proj.lastOpened).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Subtle Hover Action Pill */}
                {!renamingId && (
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-opacity bg-[hsl(var(--mantle))] rounded-md p-0.5 shadow-sm border border-[hsl(var(--surface1))]">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setRenamingId(proj.id);
                        setRenameValue(proj.name);
                      }}
                      className="p-1 text-[hsl(var(--overlay1))] hover:text-white rounded hover:bg-[hsl(var(--surface0))] transition-colors"
                      title="Rename Project"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onCopyProject(proj.id);
                      }}
                      className="p-1 text-[hsl(var(--overlay1))] hover:text-white rounded hover:bg-[hsl(var(--surface0))] transition-colors"
                      title="Duplicate Project"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Delete project "${proj.name}"?`)) onDeleteProject(proj.id);
                      }}
                      className="p-1 text-[hsl(var(--overlay1))] hover:text-rose-400 rounded hover:bg-rose-500/10 transition-colors"
                      title="Delete Project"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
