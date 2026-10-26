import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import {
  RefreshCw, ExternalLink, Download, Monitor,
  Smartphone, Tablet, Laptop, Bug, Globe, Lock, ShieldCheck, ArrowRight, Sun, Moon,
  Loader2, AlertCircle
} from 'lucide-react';

import type { BootstrapStatus } from '@/lib/projectBootstrap';

interface LivePreviewProps {
  htmlContent: string;
  cssContent: string;
  jsContent: string;
  activeFileName?: string;
  /** Called whenever the iframe sends console messages */
  onConsoleMessage?: (type: 'log' | 'warn' | 'error' | 'info', args: string[]) => void;
  onNavigate?: (url: string) => void;
  serverUrl?: string | null;
  serverReadyCount?: number;
  bootstrapStatus?: BootstrapStatus;
  inspectEnabled?: boolean;
  onInspectChange?: (enabled: boolean) => void;
  theme?: string;
  fontFamily?: string;
  fontSize?: number;
}

function buildDocument(
  html: string,
  css: string,
  js: string,
  injectEruda = false,
  previewTheme: 'dark' | 'light' = 'dark',
  fontFamily = 'Inter, system-ui, sans-serif',
  fontSize = 14
): string {
  const erudaScript = injectEruda ? `<script src="https://cdn.jsdelivr.net/npm/eruda"></script><script>eruda.init({defaults:{displaySize:100,transparency:1,theme:'${previewTheme === 'dark' ? 'Dark' : 'Light'}'}}); eruda.show(); eruda._entryBtn.hide();</script>` : '';
  
  // Theme colors matching the IDE
  const isDark = previewTheme === 'dark';
  const bgColor = isDark ? '#121218' : '#ffffff';
  const textColor = isDark ? '#e4e4e7' : '#18181b';

  // Inject console capture + postMessage bridge into preview
  const bridge = `
<script>
(function() {
  function send(type, args) {
    window.parent.postMessage({ __hrdkpen_preview: true, type, args }, '*');
  }
  const _c = console;
  ['log','warn','error','info'].forEach(m => {
    console[m] = (...a) => {
      send(m, a.map(v => {
        try { return typeof v === 'object' ? JSON.stringify(v, null, 2) : String(v); }
        catch { return String(v); }
      }));
      _c[m](...a);
    };
  });
  window.onerror = (msg, src, line) => {
    send('error', [msg + (line ? ' (line ' + line + ')' : '')]);
    return false;
  };
  window.addEventListener('unhandledrejection', e => {
    send('error', ['Unhandled Promise: ' + String(e.reason?.message || e.reason)]);
  });

  // Intercept anchor clicks
  document.addEventListener('click', e => {
    const a = e.target.closest('a');
    if (a && a.getAttribute('href')) {
      const href = a.getAttribute('href');
      if (!href.startsWith('http') && !href.startsWith('mailto:') && !href.startsWith('#')) {
        e.preventDefault();
        send('navigate', [href]);
      }
    }
  });

  // Remote images retain their original URL. Routing user content through a
  // third-party proxy both leaks URLs and changes the project's behaviour.
})();
<\/script>`;

  const defaultThemeStyle = `
    html, body {
      font-family: ${fontFamily};
      font-size: ${fontSize}px;
      color: ${textColor};
      background-color: ${bgColor};
    }
  `;

  // If user wrote full HTML document, inject bridge + CSS + theme overrides
  if (/<!doctype\s+html/i.test(html)) {
    return html
      .replace(/<head([^>]*)>/i, `<head$1><style>${defaultThemeStyle}\n${css}</style>${bridge}${erudaScript}`)
      .replace(/<\/body>/i, `<script>\ntry { ${js} } catch(e) { console.error(e.message); }\n<\/script></body>`);
  }

  // Otherwise compose a document
  return `<!DOCTYPE html>
<html lang="en" data-theme="${previewTheme}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Preview</title>
  ${bridge}
  ${erudaScript}
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    body { margin: 0; padding: 16px; min-height: 100vh; }
    ${defaultThemeStyle}
    ${css}
  </style>
</head>
<body>
  ${html}
  <script>
    try { ${js} } catch(e) { console.error(e.message + (e.stack ? '\\n' + e.stack.split('\\n').slice(1,3).join('\\n') : '')); }
  <\/script>
</body>
</html>`;
}

type DeviceMode = 'desktop' | 'tablet' | 'mobile';

const DEVICE_SIZES: Record<DeviceMode, { w: string; h: string }> = {
  desktop: { w: '100%',  h: '100%'  },
  tablet:  { w: '768px', h: '90%'   },
  mobile:  { w: '375px', h: '667px' },
};

export const LivePreview = ({
  htmlContent,
  cssContent,
  jsContent,
  activeFileName,
  onConsoleMessage,
  onNavigate,
  serverUrl,
  serverReadyCount,
  bootstrapStatus,
  inspectEnabled,
  onInspectChange,
  theme,
  fontFamily,
  fontSize,
}: LivePreviewProps) => {
  const [device, setDevice]       = useState<DeviceMode>('desktop');
  const [refreshKey, setRefreshKey] = useState(0);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [internalInspect, setInternalInspect] = useState(false);
  const [currentUrl, setCurrentUrl] = useState(serverUrl || '');

  // Live preview theme state: default to dark or sync with IDE theme
  const initialIsDark = !theme || !theme.includes('light');
  const [previewThemeMode, setPreviewThemeMode] = useState<'dark' | 'light'>(initialIsDark ? 'dark' : 'light');

  // Keep in sync when the IDE settings theme changes
  useEffect(() => {
    if (theme) {
      setPreviewThemeMode(theme.includes('light') ? 'light' : 'dark');
    }
  }, [theme]);

  const effectiveFontFamily = fontFamily || '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Plus Jakarta Sans", "Inter", system-ui, sans-serif';
  const effectiveFontSize = fontSize || 14;

  const isInspect = inspectEnabled ?? internalInspect;
  const toggleInspect = () => {
    if (onInspectChange) onInspectChange(!isInspect);
    else setInternalInspect(!isInspect);
  };

  // Sync currentUrl when serverUrl prop changes
  useEffect(() => {
    if (serverUrl) setCurrentUrl(serverUrl);
  }, [serverUrl]);

  // Debounced auto-refresh (only for static mode, WebContainer handles its own HMR)
  useEffect(() => {
    if (!autoRefresh || currentUrl) return;
    const t = setTimeout(() => {
      setRefreshKey(k => k + 1);
    }, 1000);
    return () => clearTimeout(t);
  }, [htmlContent, cssContent, jsContent, autoRefresh, currentUrl]);

  // Refresh automatically when the server explicitly emits server-ready
  useEffect(() => {
    if (serverReadyCount && serverReadyCount > 0) {
      setRefreshKey(k => k + 1);
    }
  }, [serverReadyCount]);

  // Listen to postMessages from the preview iframe
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (!e.data?.__hrdkpen_preview) return;
      if (e.data.type === 'navigate') {
        onNavigate?.(e.data.args[0]);
      } else {
        onConsoleMessage?.(e.data.type, e.data.args);
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [onConsoleMessage, onNavigate]);

  const openInNewTab = useCallback(() => {
    // If it's a real external WebContainer URL, open it directly
    if (currentUrl && !currentUrl.startsWith(window.location.origin)) {
      // Add trailing slash to prevent Vite/WebContainer proxy 404s on root
      const finalUrl = currentUrl.endsWith('/') ? currentUrl : `${currentUrl}/`;
      window.open(finalUrl, '_blank');
      return;
    }
    // Otherwise fallback to document.write to avoid Chrome Blob URL restrictions (which cause 404)
    const doc = buildDocument(htmlContent, cssContent, jsContent, isInspect);
    const win = window.open('', '_blank');
    if (win) {
      win.document.open();
      win.document.write(doc);
      win.document.close();
    }
  }, [htmlContent, cssContent, jsContent, currentUrl, isInspect]);

  const download = useCallback(() => {
    const doc = buildDocument(htmlContent, cssContent, jsContent);
    const blob = new Blob([doc], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = activeFileName ?? 'preview.html';
    a.click(); URL.revokeObjectURL(url);
  }, [htmlContent, cssContent, jsContent, activeFileName]);

  const hasContent = !!(htmlContent.trim() || cssContent.trim() || jsContent.trim() || isInspect || currentUrl);
  const dim = DEVICE_SIZES[device];

  return (
    <div className="flex flex-col h-full bg-[hsl(var(--base))]">
      {/* Modern Compact Native Browser Toolbar */}
      <div
        className="flex items-center justify-between px-3 py-1.5 flex-shrink-0 bg-[hsl(var(--mantle))] border-b border-[hsl(var(--surface1))]"
        role="toolbar"
        aria-label="Browser Preview Toolbar"
      >
        <div className="flex flex-1 items-center gap-2 mr-2 min-w-0">
          <div className="flex items-center bg-[hsl(var(--crust))] border border-[hsl(var(--surface1))] rounded-lg px-2 h-7 flex-1 max-w-[340px] shadow-sm focus-within:border-blue-500/60 focus-within:ring-1 focus-within:ring-blue-500/30 transition-all">
            <Lock className="w-3 h-3 text-[hsl(var(--overlay1))] mr-1.5 flex-shrink-0" />
            <form 
              className="flex-1 min-w-0"
              onSubmit={(e) => {
                e.preventDefault();
                let finalUrl = currentUrl;
                if (finalUrl.includes('localhost:') && serverUrl) {
                   finalUrl = serverUrl;
                   setCurrentUrl(serverUrl);
                }
                if (onNavigate && finalUrl !== currentUrl) {
                  onNavigate(finalUrl);
                }
                setRefreshKey(k => k + 1); // Refresh iframe to load the new URL
              }}
            >
              <input
                type="text"
                value={currentUrl}
                onChange={e => setCurrentUrl(e.target.value)}
                placeholder="https://hrdkpen.dev/preview"
                aria-label="Preview URL"
                className="w-full bg-transparent border-none outline-none text-xs text-[hsl(var(--text))] placeholder:text-[hsl(var(--overlay0))] font-mono truncate"
              />
            </form>
            {serverUrl && (
              <span className="flex items-center gap-1 text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 font-mono flex-shrink-0 border border-emerald-500/20">
                LIVE
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* Device selector */}
          <div className="flex items-center bg-[hsl(var(--crust))] border border-[hsl(var(--surface1))] rounded-lg p-0.5">
            {([
              ['desktop', <Laptop className="w-3.5 h-3.5" />, 'Desktop'],
              ['tablet',  <Tablet className="w-3.5 h-3.5" />, 'Tablet (768px)'],
              ['mobile',  <Smartphone className="w-3.5 h-3.5" />, 'Mobile (375px)'],
            ] as const).map(([mode, icon, label]) => (
              <Tooltip key={mode}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setDevice(mode as DeviceMode)}
                    aria-label={label}
                    className={`h-6 w-6 flex items-center justify-center rounded-md transition-all ${
                      device === mode 
                        ? 'bg-[hsl(var(--surface0))] text-[hsl(var(--text))] shadow-sm border border-[hsl(var(--surface2))]' 
                        : 'text-[hsl(var(--overlay1))] hover:text-[hsl(var(--text))]'
                    }`}
                  >
                    {icon}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  {label}
                </TooltipContent>
              </Tooltip>
            ))}
          </div>

          {/* Preview Theme Toggle (Dark / Light) */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => {
                  setPreviewThemeMode(prev => prev === 'dark' ? 'light' : 'dark');
                  setRefreshKey(k => k + 1);
                }}
                aria-label={`Preview Theme: ${previewThemeMode === 'dark' ? 'Dark' : 'Light'}`}
                className="h-7 w-7 flex items-center justify-center rounded-md text-[hsl(var(--overlay1))] hover:text-[hsl(var(--text))] hover:bg-[hsl(var(--surface0))] transition-all"
              >
                {previewThemeMode === 'dark' ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5 text-amber-400" />}
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              Preview Theme: {previewThemeMode === 'dark' ? 'Dark' : 'Light'}
            </TooltipContent>
          </Tooltip>

          {/* Inspect DevTools */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={toggleInspect}
                aria-label="Inspect (Eruda DevTools)"
                className={`h-7 w-7 flex items-center justify-center rounded-md transition-all ${
                  isInspect 
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' 
                    : 'text-[hsl(var(--overlay1))] hover:text-[hsl(var(--text))] hover:bg-[hsl(var(--surface0))]'
                }`}
              >
                <Bug className="w-3.5 h-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              Toggle Inspector (DevTools)
            </TooltipContent>
          </Tooltip>

          {/* Refresh preview */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => setRefreshKey(k => k + 1)}
                aria-label="Refresh preview"
                className="h-7 w-7 flex items-center justify-center rounded-md text-[hsl(var(--overlay1))] hover:text-[hsl(var(--text))] hover:bg-[hsl(var(--surface0))] transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              Reload Preview
            </TooltipContent>
          </Tooltip>

          {/* Download HTML */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={download}
                aria-label="Download as HTML"
                className="h-7 w-7 flex items-center justify-center rounded-md text-[hsl(var(--overlay1))] hover:text-[hsl(var(--text))] hover:bg-[hsl(var(--surface0))] transition-all"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              Export HTML
            </TooltipContent>
          </Tooltip>

          {/* Open in new tab */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={openInNewTab}
                aria-label="Open preview in new tab"
                className="h-7 w-7 flex items-center justify-center rounded-md text-[hsl(var(--overlay1))] hover:text-[hsl(var(--text))] hover:bg-[hsl(var(--surface0))] transition-all"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              Open in New Window
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Preview area */}
      <div className="flex-1 overflow-auto flex items-start justify-center p-3 bg-[hsl(var(--crust))] relative">
        {/* Bootstrap State Indicator / Error Panel */}
        {bootstrapStatus && (bootstrapStatus.state === 'installing' || bootstrapStatus.state === 'starting' || bootstrapStatus.state === 'waiting-for-server') && !currentUrl && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[hsl(var(--crust))]/90 backdrop-blur-sm p-6 text-center animate-fade-in">
            <Loader2 className="w-8 h-8 animate-spin text-[hsl(var(--lavender))] mb-3" />
            <p className="text-sm font-medium text-editor-text mb-1">
              {bootstrapStatus.state === 'installing' && 'Installing dependencies...'}
              {bootstrapStatus.state === 'starting' && 'Starting runtime server...'}
              {bootstrapStatus.state === 'waiting-for-server' && 'Connecting to server port...'}
            </p>
            <p className="text-xs text-editor-text-muted max-w-sm">
              {bootstrapStatus.message || 'Please wait while the project runtime boots up.'}
            </p>
          </div>
        )}

        {bootstrapStatus && bootstrapStatus.state === 'error' && !currentUrl && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[hsl(var(--crust))]/95 backdrop-blur-sm p-6 text-center animate-fade-in">
            <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-3">
              <AlertCircle className="w-6 h-6 text-red-400" />
            </div>
            <p className="text-sm font-semibold text-editor-text mb-1">Runtime Bootstrap Error</p>
            <p className="text-xs text-red-400 font-mono bg-red-950/20 px-3 py-2 rounded-lg border border-red-900/30 max-w-md break-all mb-4">
              {bootstrapStatus.error || bootstrapStatus.message}
            </p>
            <p className="text-xs text-editor-text-muted">
              Check the Terminal and Output tabs below for full build or npm logs.
            </p>
          </div>
        )}

        {hasContent ? (
          <div
            className={`overflow-hidden rounded-xl border border-editor-border shadow-2xl relative transition-all ${
              previewThemeMode === 'dark' ? 'bg-[#121218]' : 'bg-white'
            }`}
            style={{
              width: dim.w,
              height: dim.h === '100%' ? 'calc(100% - 0px)' : dim.h,
              minHeight: dim.h === '100%' ? '100%' : dim.h,
              transition: 'width 0.2s ease, height 0.2s ease',
            }}
          >
            {currentUrl ? (
              <iframe
                key={refreshKey}
                src={currentUrl}
                className="w-full h-full border-0"
                title="Live Server Preview"
                allow="cross-origin-isolated"
                sandbox="allow-scripts allow-forms allow-popups allow-modals allow-same-origin allow-downloads"
              />
            ) : (
              <iframe
                key={`${refreshKey}-${previewThemeMode}-${effectiveFontFamily}-${effectiveFontSize}`}
                srcDoc={buildDocument(
                  htmlContent,
                  cssContent,
                  jsContent,
                  isInspect,
                  previewThemeMode,
                  effectiveFontFamily,
                  effectiveFontSize
                )}
                className="w-full h-full border-0"
                title="Live Preview"
                sandbox="allow-scripts allow-forms allow-popups allow-modals allow-same-origin"
                loading="lazy"
                {...{ credentialless: "true" }}
              />
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center select-none">
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center"
              style={{ background: 'hsl(var(--surface0))' }}
            >
              <Monitor className="w-7 h-7 text-editor-text-muted" />
            </div>
            <div>
              <p className="text-sm font-medium text-editor-text mb-1">No content yet</p>
              <p className="text-xs text-editor-text-muted">
                Write HTML, CSS, or JS — preview updates automatically
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
