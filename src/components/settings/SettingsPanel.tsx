import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, RotateCcw, Settings2, Palette, Type, Code, Terminal, Monitor, Blocks, Activity, ShieldCheck, AlertTriangle, CheckCircle2 } from 'lucide-react';
import type { EditorSettings } from '@/types';
import { useExtensions } from '@/hooks/use-extensions';
import { useDoctorKit } from '@/hooks/useDoctorKit';

interface SettingsPanelProps {
  settings: EditorSettings;
  onUpdate: <K extends keyof EditorSettings>(key: K, value: EditorSettings[K]) => void;
  onReset: () => void;
  onClose: () => void;
  initialCategory?: Category;
}

const THEMES: { value: EditorSettings['theme']; label: string }[] = [
  { value: 'smart-dark',    label: 'Catppuccin Dark' },
  { value: 'synthwave-84',  label: 'Synthwave \'84 (Neon Glow)' },
  { value: 'tokyo-night',   label: 'Tokyo Night' },
  { value: 'cyber-neon',    label: 'Cyber Neon (High Contrast)' },
  { value: 'solarized-dark',label: 'Solarized Dark' },
  { value: 'dracula',       label: 'Dracula' },
  { value: 'nord',          label: 'Nord Frost' },
  { value: 'oceanic',       label: 'Oceanic Next' },
  { value: 'github-dark',   label: 'GitHub Dark' },
  { value: 'monokai',       label: 'Monokai' },
  { value: 'pure-black',    label: 'Pure Black (AMOLED)' },
  { value: 'graphite',      label: 'Graphite (Warm Gray)' },
  { value: 'midnight',      label: 'Midnight (Deep Blue)' },
  { value: 'vs-light',      label: 'Visual Studio Light' },
];

const FONTS = [
  'JetBrains Mono, monospace',
  'Fira Code, monospace',
  'Cascadia Code, monospace',
  'Monaco, monospace',
  'Consolas, monospace',
  'Ubuntu Mono, monospace',
];

const FONT_LABELS: Record<string, string> = {
  'JetBrains Mono, monospace': 'JetBrains Mono',
  'Fira Code, monospace': 'Fira Code',
  'Cascadia Code, monospace': 'Cascadia Code',
  'Monaco, monospace': 'Monaco',
  'Consolas, monospace': 'Consolas',
  'Ubuntu Mono, monospace': 'Ubuntu Mono',
};

type Category = 'appearance' | 'editor' | 'terminal' | 'preview' | 'extensions' | 'diagnostics';

export const SettingsPanel = ({ settings, onUpdate, onReset, onClose, initialCategory = 'appearance' }: SettingsPanelProps) => {
  const [activeCategory, setActiveCategory] = useState<Category>(initialCategory);
  const { extensions, toggle } = useExtensions();
  const doctorKit = useDoctorKit();

  const renderCategoryNav = () => (
    <div className="flex flex-col gap-1.5 w-full">
      {[
        { id: 'appearance', icon: Palette, label: 'Appearance', desc: 'Theme, fonts, typography' },
        { id: 'editor', icon: Code, label: 'Editor', desc: 'Word wrap, line numbers' },
        { id: 'terminal', icon: Terminal, label: 'Terminal', desc: 'Font size, cursor blinking' },
        { id: 'preview', icon: Monitor, label: 'Preview', desc: 'Auto reload, sync scroll' },
        { id: 'extensions', icon: Blocks, label: 'Extensions', desc: 'Tools, linters, snippets' },
        { id: 'diagnostics', icon: Activity, label: 'Diagnostics', desc: 'DoctorKit self-healing' },
      ].map(cat => (
        <button
          key={cat.id}
          onClick={() => setActiveCategory(cat.id as Category)}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all text-left ${
            activeCategory === cat.id 
              ? 'bg-blue-500/15 text-blue-400 shadow-sm border border-blue-500/30' 
              : 'text-editor-text-muted hover:text-editor-text hover:bg-[hsl(var(--surface0)/0.6)] border border-transparent'
          }`}
        >
          <cat.icon className="w-4 h-4 flex-shrink-0" />
          <div className="flex flex-col min-w-0">
            <span className="font-semibold">{cat.label}</span>
          </div>
        </button>
      ))}
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-[hsl(var(--crust))] select-none">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-editor-border bg-[hsl(var(--mantle))] flex-shrink-0 z-10 shadow-sm relative">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-500/15 flex items-center justify-center border border-blue-500/30 text-blue-400">
            <Settings2 className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-editor-text tracking-wide flex items-center gap-2">
              HRDK Pen Settings
              <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Auto-saved
              </span>
            </h2>
            <p className="text-[11px] text-editor-text-muted">Customize your editor, themes, runtime, and diagnostic tools</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost" size="sm"
            onClick={onReset}
            className="h-8 px-3 text-xs font-medium text-editor-text-muted hover:text-editor-text hover:bg-[hsl(var(--surface0))] rounded-lg transition-colors border border-editor-border/60"
            title="Reset to defaults"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
            Reset Defaults
          </Button>
          <div className="w-[1px] h-4 bg-editor-border mx-1"></div>
          <Button
            variant="ghost" size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 text-editor-text-muted hover:text-editor-text hover:bg-red-500/10 hover:text-red-400 rounded-lg transition-colors border border-transparent hover:border-red-500/20"
            title="Close Settings (Esc)"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Nav */}
        <div className="w-48 bg-[hsl(var(--mantle))] border-r border-editor-border/60 py-4 px-3 flex flex-col shadow-[inset_-1px_0_0_rgba(255,255,255,0.02)]">
          {renderCategoryNav()}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-[hsl(var(--base))]">
          <div className="max-w-2xl mx-auto py-6 px-8 pb-12 space-y-8">
          
          {activeCategory === 'appearance' && (
            <div className="space-y-8 animate-fade-in">
              {/* Group 1 */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-editor-text-muted uppercase tracking-wider ml-1">Appearance</Label>
                <div className="bg-[hsl(var(--crust))] border border-editor-border rounded-xl overflow-hidden shadow-sm">
                  <div className="p-3.5 flex items-center justify-between border-b border-editor-border">
                    <Label className="text-[13px] font-medium text-editor-text">Editor Theme</Label>
                    <Select value={settings.theme} onValueChange={v => onUpdate('theme', v as EditorSettings['theme'])}>
                      <SelectTrigger className="w-48 h-8 text-[12px] bg-editor-panel border-editor-border text-editor-text rounded-md focus:ring-1 focus:ring-blue-500/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-editor-sidebar border-editor-border text-editor-text">
                        {THEMES.map(t => (
                          <SelectItem key={t.value} value={t.value} className="text-xs">{t.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="p-3.5 flex items-center justify-between">
                    <Label className="text-[13px] font-medium text-editor-text">Font Family</Label>
                    <Select value={settings.fontFamily} onValueChange={v => onUpdate('fontFamily', v)}>
                      <SelectTrigger className="w-48 h-8 text-[12px] bg-editor-panel border-editor-border text-editor-text rounded-md focus:ring-1 focus:ring-blue-500/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-editor-sidebar border-editor-border text-editor-text max-h-60">
                        {FONTS.map(f => (
                          <SelectItem key={f} value={f} className="text-xs" style={{ fontFamily: f }}>{FONT_LABELS[f] ?? f}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Group 2 */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-editor-text-muted uppercase tracking-wider ml-1">Typography</Label>
                <div className="bg-[hsl(var(--crust))] border border-editor-border rounded-xl overflow-hidden shadow-sm p-4 space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-[13px] font-medium text-editor-text">Font Size</Label>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-editor-panel text-editor-text border border-editor-border">{settings.fontSize}px</span>
                  </div>
                  <Slider value={[settings.fontSize]} onValueChange={([v]) => onUpdate('fontSize', v)} min={10} max={22} step={1} className="py-2" />
                </div>
                </div>
              </div>

              {/* Theme & Font Live Preview Frame */}
              <div className="space-y-2">
                <div className="flex items-center justify-between ml-1">
                  <Label className="text-xs font-semibold text-editor-text-muted uppercase tracking-wider">Live Code Preview</Label>
                  <span className="text-[11px] font-mono text-editor-text-muted">
                    {THEMES.find(t => t.value === settings.theme)?.label || settings.theme} • {FONT_LABELS[settings.fontFamily] || settings.fontFamily.split(',')[0]}
                  </span>
                </div>
                
                {/* Mock Editor Window */}
                <div className="rounded-xl border border-editor-border overflow-hidden shadow-lg bg-[hsl(var(--mantle))]">
                  {/* Window Title Bar */}
                  <div className="flex items-center justify-between px-4 py-2 border-b border-editor-border/60 bg-[hsl(var(--crust))]">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                      <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                      <span className="ml-2 text-[11px] font-mono text-editor-text-dim">preview.ts — HRDK Pen</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">
                      {settings.fontSize}px • Tab: {settings.tabSize}
                    </span>
                  </div>

                  {/* Code Body with Line Numbers */}
                  <div
                    className="p-4 flex bg-[hsl(var(--base))] select-none"
                    style={{ fontFamily: settings.fontFamily, fontSize: `${settings.fontSize}px`, lineHeight: 1.6 }}
                  >
                    {/* Line numbers */}
                    <div className="pr-4 select-none text-right font-mono text-editor-text-dim/60 space-y-0.5 border-r border-editor-border/40 min-w-[28px]">
                      <div>1</div>
                      <div>2</div>
                      <div>3</div>
                      <div>4</div>
                      <div>5</div>
                      <div>6</div>
                    </div>

                    {/* Syntax Highlighted Code */}
                    <div className="pl-4 flex-1 overflow-x-auto space-y-0.5 font-mono">
                      <div>
                        <span className="text-[hsl(var(--mauve))] font-medium">import</span>{' '}
                        <span className="text-editor-text">{'{'}</span>{' '}
                        <span className="text-[hsl(var(--yellow))]">useState</span>
                        <span className="text-editor-text">,</span>{' '}
                        <span className="text-[hsl(var(--yellow))]">useEffect</span>{' '}
                        <span className="text-editor-text">{'}'}</span>{' '}
                        <span className="text-[hsl(var(--mauve))] font-medium">from</span>{' '}
                        <span className="text-[hsl(var(--green))]">'react'</span>
                        <span className="text-editor-text">;</span>
                      </div>
                      <div>
                        <span className="text-[hsl(var(--mauve))] font-medium">export function</span>{' '}
                        <span className="text-[hsl(var(--blue))] font-semibold">Hero</span>
                        <span className="text-editor-text">() {'{'}</span>
                      </div>
                      <div style={{ paddingLeft: `${settings.tabSize * 10}px` }}>
                        <span className="text-[hsl(var(--mauve))] font-medium">const</span>{' '}
                        <span className="text-editor-text">[count, setCount]</span>{' '}
                        <span className="text-[hsl(var(--sky))]">=</span>{' '}
                        <span className="text-[hsl(var(--blue))]">useState</span>
                        <span className="text-editor-text">(</span>
                        <span className="text-[hsl(var(--peach))]">0</span>
                        <span className="text-editor-text">);</span>
                      </div>
                      <div style={{ paddingLeft: `${settings.tabSize * 10}px` }}>
                        <span className="text-[hsl(var(--mauve))] font-medium">return</span>{' '}
                        <span className="text-[hsl(var(--teal))]">&lt;button</span>{' '}
                        <span className="text-[hsl(var(--peach))]">className</span>
                        <span className="text-editor-text">=</span>
                        <span className="text-[hsl(var(--green))]">"btn-neon"</span>
                        <span className="text-[hsl(var(--teal))]">&gt;</span>
                        <span className="text-editor-text">Count: {'{count}'}</span>
                        <span className="text-[hsl(var(--teal))]">&lt;/button&gt;</span>
                        <span className="text-editor-text">;</span>
                      </div>
                      <div>
                        <span className="text-editor-text">{'}'}</span>
                      </div>
                      <div className="text-[hsl(var(--overlay1))] italic text-[0.85em] pt-1">
                        // Active Theme: {settings.theme} | Font Ligatures: On
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeCategory === 'editor' && (
            <div className="space-y-8 animate-fade-in">
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-editor-text-muted uppercase tracking-wider ml-1">Behavior</Label>
                <div className="bg-[hsl(var(--crust))] border border-editor-border rounded-xl overflow-hidden shadow-sm">
                  <div className="p-4 space-y-4 border-b border-editor-border">
                    <div className="flex items-center justify-between">
                      <Label className="text-[13px] font-medium text-editor-text">Tab Size</Label>
                      <span className="text-[11px] px-2 py-0.5 rounded bg-editor-panel text-editor-text border border-editor-border">{settings.tabSize} spaces</span>
                    </div>
                    <Slider value={[settings.tabSize]} onValueChange={([v]) => onUpdate('tabSize', v)} min={2} max={8} step={2} className="py-2" />
                  </div>

                  {([
                    ['autoSave', 'Auto Save', 'Automatically save files after typing'],
                    ['formatOnSave', 'Format on Save', 'Run formatter when saving'],
                    ['autoCloseTags', 'Auto Close Tags', 'Automatically insert closing tags'],
                    ['autoRenameTags', 'Auto Rename Tags', 'Rename matching tags together'],
                    ['wordWrap', 'Word Wrap', 'Wrap lines that exceed editor width'],
                  ] as [keyof EditorSettings, string, string][]).map(([key, label, desc], idx, arr) => (
                    <div key={key} className={`flex items-center justify-between p-3.5 ${idx !== arr.length - 1 ? 'border-b border-editor-border' : ''}`}>
                      <div className="flex flex-col">
                        <Label className="text-[13px] font-medium text-editor-text">{label}</Label>
                        <span className="text-[11px] text-editor-text-muted mt-0.5">{desc}</span>
                      </div>
                      <Switch checked={settings[key] as boolean} onCheckedChange={v => onUpdate(key, v)} className="scale-90" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-editor-text-muted uppercase tracking-wider ml-1">Interface Elements</Label>
                <div className="bg-[hsl(var(--crust))] border border-editor-border rounded-xl overflow-hidden shadow-sm">
                  {([
                    ['lineNumbers', 'Line Numbers', 'Show line numbers in gutter'],
                    ['minimap', 'Minimap', 'Show code minimap overview'],
                    ['breadcrumbs', 'Breadcrumbs', 'Show file path breadcrumbs'],
                    ['stickyScroll', 'Sticky Scroll', 'Keep scope headers visible'],
                    ['bracketPairColorization', 'Bracket Pairs', 'Colorize matching brackets'],
                    ['indentGuides', 'Indent Guides', 'Show vertical indent lines'],
                    ['gitDecorations', 'Git Decorations', 'Show modified lines in gutter'],
                    ['smoothCursor', 'Smooth Cursor', 'Animate cursor movement'],
                  ] as [keyof EditorSettings, string, string][]).map(([key, label, desc], idx, arr) => (
                    <div key={key} className={`flex items-center justify-between p-3.5 ${idx !== arr.length - 1 ? 'border-b border-editor-border' : ''}`}>
                      <div className="flex flex-col">
                        <Label className="text-[13px] font-medium text-editor-text">{label}</Label>
                        <span className="text-[11px] text-editor-text-muted mt-0.5">{desc}</span>
                      </div>
                      <Switch checked={settings[key] as boolean} onCheckedChange={v => onUpdate(key, v)} className="scale-90" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeCategory === 'terminal' && (
            <div className="space-y-8 animate-fade-in">
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-editor-text-muted uppercase tracking-wider ml-1">Terminal</Label>
                <div className="bg-[hsl(var(--crust))] border border-editor-border rounded-xl overflow-hidden shadow-sm">
                  <div className="p-4 space-y-4 border-b border-editor-border">
                    <div className="flex items-center justify-between">
                      <Label className="text-[13px] font-medium text-editor-text">Font Size</Label>
                      <span className="text-[11px] px-2 py-0.5 rounded bg-editor-panel text-editor-text border border-editor-border">{settings.terminalFontSize}px</span>
                    </div>
                    <Slider value={[settings.terminalFontSize]} onValueChange={([v]) => onUpdate('terminalFontSize', v)} min={10} max={20} step={1} className="py-2" />
                  </div>

                  <div className="flex items-center justify-between p-3.5">
                    <div className="flex flex-col">
                      <Label className="text-[13px] font-medium text-editor-text">Cursor Style</Label>
                      <span className="text-[11px] text-editor-text-muted mt-0.5">Shape of the terminal cursor</span>
                    </div>
                    <Select value={settings.terminalCursorStyle} onValueChange={v => onUpdate('terminalCursorStyle', v as any)}>
                      <SelectTrigger className="w-32 h-8 text-[12px] bg-editor-panel border-editor-border text-editor-text rounded-md focus:ring-1 focus:ring-blue-500/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-editor-sidebar border-editor-border text-editor-text">
                        <SelectItem value="block" className="text-xs">Block</SelectItem>
                        <SelectItem value="underline" className="text-xs">Underline</SelectItem>
                        <SelectItem value="bar" className="text-xs">Bar</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeCategory === 'preview' && (
            <div className="space-y-8 animate-fade-in">
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-editor-text-muted uppercase tracking-wider ml-1">Preview Behavior</Label>
                <div className="bg-[hsl(var(--crust))] border border-editor-border rounded-xl overflow-hidden shadow-sm">
                  {([
                    ['previewAutoReload', 'Auto Reload', 'Reload preview on file change'],
                    ['previewSyncScroll', 'Sync Scroll', 'Sync preview scroll with editor'],
                  ] as [keyof EditorSettings, string, string][]).map(([key, label, desc], idx, arr) => (
                    <div key={key} className={`flex items-center justify-between p-3.5 ${idx !== arr.length - 1 ? 'border-b border-editor-border' : ''}`}>
                      <div className="flex flex-col">
                        <Label className="text-[13px] font-medium text-editor-text">{label}</Label>
                        <span className="text-[11px] text-editor-text-muted mt-0.5">{desc}</span>
                      </div>
                      <Switch checked={settings[key] as boolean} onCheckedChange={v => onUpdate(key, v)} className="scale-90" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeCategory === 'extensions' && (
            <div className="space-y-6 animate-fade-in">
              {/* Header with Search and Master Controls */}
              <div className="flex items-center justify-between ml-1 flex-wrap gap-2">
                <div>
                  <Label className="text-xs font-semibold text-editor-text-muted uppercase tracking-wider">
                    Open-Source Extensions Center
                  </Label>
                  <p className="text-[11px] text-[hsl(var(--overlay1))] mt-0.5">
                    Official registries, linters, agent tools, and language runtime extensions
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    {extensions.filter(e => e.enabled).length} of {extensions.length} active
                  </span>
                </div>
              </div>

              {/* Extension Cards Grid */}
              <div className="bg-[hsl(var(--crust))] border border-editor-border rounded-xl overflow-hidden shadow-sm divide-y divide-editor-border/60">
                {extensions.map(ext => (
                  <div key={ext.id} className="p-4 hover:bg-[hsl(var(--surface0)/0.3)] transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex flex-col flex-1 min-w-0">
                        {/* Title & Badges */}
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <Label className="text-[13px] font-bold text-editor-text">{ext.name}</Label>
                          {ext.version && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20">
                              v{ext.version}
                            </span>
                          )}
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-medium bg-editor-active-tab text-[hsl(var(--overlay1))] uppercase tracking-wider border border-editor-border/50">
                            {ext.category}
                          </span>
                          {ext.license && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              {ext.license}
                            </span>
                          )}
                          {ext.author && (
                            <span className="text-[10px] text-editor-text-dim">
                              by {ext.author}
                            </span>
                          )}
                        </div>

                        {/* Description */}
                        <p className="text-[11px] text-editor-text-muted leading-relaxed mb-2">
                          {ext.description}
                        </p>

                        {/* Metadata Footer */}
                        <div className="flex items-center gap-3 text-[10px] text-[hsl(var(--overlay1))] flex-wrap">
                          {ext.repoUrl && (
                            <a
                              href={ext.repoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-300 hover:underline flex items-center gap-1 font-mono"
                            >
                              GitHub ↗
                            </a>
                          )}
                          {ext.compatibility && (
                            <span className="flex items-center gap-1 text-[hsl(var(--overlay2))]">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                              {ext.compatibility}
                            </span>
                          )}
                          {ext.permissions && ext.permissions.length > 0 && (
                            <span className="text-editor-text-dim font-mono">
                              Perms: {ext.permissions.join(', ')}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Enable/Disable Switch */}
                      <Switch 
                        checked={ext.enabled} 
                        onCheckedChange={v => toggle(ext.id, v)} 
                        className="scale-90 mt-1 flex-shrink-0" 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeCategory === 'diagnostics' && (
            <div className="space-y-6 animate-fade-in flex flex-col h-full">
              <div className="bg-[hsl(var(--crust))] border border-editor-border rounded-xl p-5 shadow-sm flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-[13px] font-semibold text-editor-text block mb-1">Doctor Kit</Label>
                    <span className="text-[11px] text-editor-text-muted block">
                      Monitors your IDE health and auto-repairs IndexedDB/Storage corruption.
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end">
                      <span className="text-[9px] font-semibold uppercase tracking-widest text-editor-text-muted mb-1">System Status</span>
                      {doctorKit.status === 'scanning' ? (
                        <span className="text-[12px] text-blue-400 flex items-center gap-1.5 font-medium"><Activity className="w-3.5 h-3.5 animate-pulse" /> Scanning...</span>
                      ) : doctorKit.status === 'error' ? (
                        <span className="text-[12px] text-red-400 flex items-center gap-1.5 font-medium"><AlertTriangle className="w-3.5 h-3.5" /> Error</span>
                      ) : doctorKit.logs.some(l => l.type === 'repair' || l.type === 'error') ? (
                        <span className="text-[12px] text-yellow-400 flex items-center gap-1.5 font-medium"><ShieldCheck className="w-3.5 h-3.5" /> Repaired</span>
                      ) : (
                        <span className="text-[12px] text-emerald-400 flex items-center gap-1.5 font-medium"><CheckCircle2 className="w-3.5 h-3.5" /> Healthy</span>
                      )}
                    </div>
                    <div className="w-[1px] h-8 bg-editor-border"></div>
                    <Button 
                      size="sm" 
                      onClick={doctorKit.runScan} 
                      disabled={doctorKit.status === 'scanning'}
                      className="h-8 px-4 text-xs font-semibold bg-blue-500 hover:bg-blue-600 text-white border-0 shadow-sm rounded-lg transition-all"
                    >
                      Scan Now
                    </Button>
                  </div>
                </div>
              </div>

                <div className="flex-1 min-h-0 bg-editor-panel rounded-lg border border-editor-border overflow-hidden flex flex-col relative">
                  {doctorKit.status === 'scanning' && (
                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-editor-panel/80 backdrop-blur-[2px] overflow-hidden">
                      <div className="absolute inset-0 pointer-events-none">
                        <div className="w-full h-[2px] bg-blue-400 shadow-[0_0_15px_3px_rgba(59,130,246,0.6)] animate-scan" />
                      </div>
                      <Activity className="w-8 h-8 text-blue-400 animate-pulse mb-3" />
                      <span className="text-xs font-semibold text-blue-400 tracking-widest uppercase animate-pulse">Running System Diagnostics...</span>
                    </div>
                  )}
                  <div className="px-3 py-2 border-b border-editor-border bg-editor-sidebar flex items-center justify-between z-10">
                     <span className="text-xs font-medium text-editor-text">Repair Logs</span>
                     <span className="text-[10px] text-editor-text-muted">Last scan: {doctorKit.lastScan.toLocaleTimeString()}</span>
                  </div>
                  <div className="flex-1 overflow-y-auto p-2 custom-scrollbar space-y-1 z-10">
                  {doctorKit.logs.length === 0 ? (
                    <div className="p-6 text-center text-xs text-editor-text-muted">
                      No logs yet. System is completely healthy!
                    </div>
                  ) : (
                    doctorKit.logs.map(log => (
                      <div key={log.id} className="flex gap-2.5 p-2 rounded-md hover:bg-editor-active-tab transition-colors group">
                        <div className="flex-shrink-0 mt-0.5">
                          {log.type === 'repair' ? <ShieldCheck className="w-3.5 h-3.5 text-yellow-400" /> :
                           log.type === 'error' ? <AlertTriangle className="w-3.5 h-3.5 text-red-400" /> :
                           <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                        </div>
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="text-[11px] text-editor-text leading-relaxed break-words">{log.message}</span>
                          <span className="text-[9px] text-editor-text-dim mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">{log.timestamp.toLocaleTimeString()}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

        </div>
        </div>
      </div>
    </div>
  );
};
