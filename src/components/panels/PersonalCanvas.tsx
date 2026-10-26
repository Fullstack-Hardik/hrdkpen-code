import { useState, useRef, useEffect, useCallback } from 'react';
import {
  MousePointer,
  Square,
  Circle,
  Diamond,
  ArrowRight,
  Minus,
  Pencil,
  Type,
  Eraser,
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Download,
  Trash2,
  Maximize2,
  RotateCcw,
  Sparkles,
  Layers,
  FileCode,
  FileImage,
  Database,
  Server,
  Cloud,
  Box,
  Palette
} from 'lucide-react';

export type CanvasTool =
  | 'select'
  | 'rectangle'
  | 'circle'
  | 'diamond'
  | 'arrow'
  | 'line'
  | 'draw'
  | 'text'
  | 'eraser';

export interface CanvasElement {
  id: string;
  type: CanvasTool;
  x: number;
  y: number;
  width?: number;
  height?: number;
  points?: { x: number; y: number }[];
  text?: string;
  stroke: string;
  fill: string;
  strokeWidth: number;
  opacity?: number;
}

const COLOR_PALETTE = [
  '#f87171', // red
  '#fb923c', // orange
  '#facc15', // yellow
  '#4ade80', // green
  '#38bdf8', // sky
  '#818cf8', // indigo
  '#c084fc', // purple
  '#f43f5e', // rose
  '#ffffff', // white
  '#94a3b8', // slate
];

const TEMPLATES = [
  {
    name: 'Frontend + API Architecture',
    elements: [
      { id: 't1', type: 'rectangle', x: 80, y: 100, width: 140, height: 70, stroke: '#38bdf8', fill: 'rgba(56, 189, 248, 0.12)', strokeWidth: 2, text: 'React Client\n(Vite App)' },
      { id: 't2', type: 'arrow', x: 230, y: 135, width: 100, height: 0, stroke: '#818cf8', fill: 'transparent', strokeWidth: 2 },
      { id: 't3', type: 'rectangle', x: 340, y: 100, width: 140, height: 70, stroke: '#818cf8', fill: 'rgba(129, 140, 248, 0.12)', strokeWidth: 2, text: 'Node API\n(Express Server)' },
      { id: 't4', type: 'arrow', x: 490, y: 135, width: 100, height: 0, stroke: '#c084fc', fill: 'transparent', strokeWidth: 2 },
      { id: 't5', type: 'diamond', x: 600, y: 90, width: 130, height: 90, stroke: '#c084fc', fill: 'rgba(192, 132, 252, 0.12)', strokeWidth: 2, text: 'Database\n(PostgreSQL)' }
    ]
  },
  {
    name: 'Microservice Flow',
    elements: [
      { id: 'm1', type: 'circle', x: 100, y: 150, width: 90, height: 90, stroke: '#4ade80', fill: 'rgba(74, 222, 128, 0.12)', strokeWidth: 2, text: 'Gateway' },
      { id: 'm2', type: 'arrow', x: 200, y: 195, width: 90, height: 0, stroke: '#94a3b8', fill: 'transparent', strokeWidth: 2 },
      { id: 'm3', type: 'rectangle', x: 300, y: 110, width: 130, height: 60, stroke: '#38bdf8', fill: 'rgba(56, 189, 248, 0.12)', strokeWidth: 2, text: 'Auth Service' },
      { id: 'm4', type: 'rectangle', x: 300, y: 210, width: 130, height: 60, stroke: '#fb923c', fill: 'rgba(251, 146, 60, 0.12)', strokeWidth: 2, text: 'Data Worker' }
    ]
  }
];

export const PersonalCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [elements, setElements] = useState<CanvasElement[]>(() => {
    try {
      const saved = localStorage.getItem('hrdkpen_personal_canvas');
      if (saved) return JSON.parse(saved);
    } catch {}
    return (TEMPLATES[0].elements as CanvasElement[]);
  });

  const [history, setHistory] = useState<CanvasElement[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const [selectedTool, setSelectedTool] = useState<CanvasTool>('select');
  const [activeColor, setActiveColor] = useState('#38bdf8');
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDrawing, setIsDrawing] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [currentElement, setCurrentElement] = useState<CanvasElement | null>(null);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const startPos = useRef({ x: 0, y: 0 });

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('hrdkpen_personal_canvas', JSON.stringify(elements));
    } catch {}
  }, [elements]);

  const pushHistory = useCallback((newElements: CanvasElement[]) => {
    setHistory(prev => [...prev.slice(0, historyIndex + 1), newElements]);
    setHistoryIndex(prev => prev + 1);
  }, [historyIndex]);

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setElements(history[historyIndex - 1]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setElements(history[historyIndex + 1]);
    }
  };

  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left - pan.x) / zoom,
      y: (e.clientY - rect.top - pan.y) / zoom,
    };
  };

  // Render elements to Canvas 2D
  const drawScene = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Reset transform & clear
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Apply viewport zoom & pan
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);

    // Subtle background grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;
    const gridSize = 30;
    const startX = Math.floor(-pan.x / zoom / gridSize) * gridSize;
    const endX = startX + (canvas.width / zoom) + gridSize;
    const startY = Math.floor(-pan.y / zoom / gridSize) * gridSize;
    const endY = startY + (canvas.height / zoom) + gridSize;

    for (let x = startX; x < endX; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, startY);
      ctx.lineTo(x, endY);
      ctx.stroke();
    }
    for (let y = startY; y < endY; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(startX, y);
      ctx.lineTo(endX, y);
      ctx.stroke();
    }

    const allElements = currentElement ? [...elements, currentElement] : elements;

    for (const el of allElements) {
      ctx.strokeStyle = el.stroke;
      ctx.fillStyle = el.fill;
      ctx.lineWidth = el.strokeWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (el.type === 'rectangle' && el.width && el.height) {
        ctx.beginPath();
        const r = 8;
        ctx.roundRect(el.x, el.y, el.width, el.height, r);
        ctx.fill();
        ctx.stroke();

        if (el.text) {
          ctx.fillStyle = '#ffffff';
          ctx.font = '12px system-ui, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          const lines = el.text.split('\n');
          lines.forEach((line, i) => {
            ctx.fillText(line, el.x + el.width! / 2, el.y + el.height! / 2 + (i - (lines.length - 1) / 2) * 16);
          });
        }
      } else if (el.type === 'circle' && el.width && el.height) {
        ctx.beginPath();
        const rx = Math.abs(el.width) / 2;
        const ry = Math.abs(el.height) / 2;
        ctx.ellipse(el.x + rx, el.y + ry, rx, ry, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        if (el.text) {
          ctx.fillStyle = '#ffffff';
          ctx.font = '12px system-ui, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(el.text, el.x + rx, el.y + ry);
        }
      } else if (el.type === 'diamond' && el.width && el.height) {
        ctx.beginPath();
        const midX = el.x + el.width / 2;
        const midY = el.y + el.height / 2;
        ctx.moveTo(midX, el.y);
        ctx.lineTo(el.x + el.width, midY);
        ctx.lineTo(midX, el.y + el.height);
        ctx.lineTo(el.x, midY);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        if (el.text) {
          ctx.fillStyle = '#ffffff';
          ctx.font = '12px system-ui, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(el.text, midX, midY);
        }
      } else if (el.type === 'arrow' && el.width !== undefined && el.height !== undefined) {
        const toX = el.x + el.width;
        const toY = el.y + el.height;
        ctx.beginPath();
        ctx.moveTo(el.x, el.y);
        ctx.lineTo(toX, toY);
        ctx.stroke();

        const angle = Math.atan2(toY - el.y, toX - el.x);
        const headLen = 10;
        ctx.beginPath();
        ctx.moveTo(toX, toY);
        ctx.lineTo(toX - headLen * Math.cos(angle - Math.PI / 6), toY - headLen * Math.sin(angle - Math.PI / 6));
        ctx.lineTo(toX - headLen * Math.cos(angle + Math.PI / 6), toY - headLen * Math.sin(angle + Math.PI / 6));
        ctx.closePath();
        ctx.fillStyle = el.stroke;
        ctx.fill();
      } else if (el.type === 'line' && el.width !== undefined && el.height !== undefined) {
        ctx.beginPath();
        ctx.moveTo(el.x, el.y);
        ctx.lineTo(el.x + el.width, el.y + el.height);
        ctx.stroke();
      } else if (el.type === 'draw' && el.points && el.points.length > 1) {
        ctx.beginPath();
        ctx.moveTo(el.points[0].x, el.points[0].y);
        for (let i = 1; i < el.points.length; i++) {
          ctx.lineTo(el.points[i].x, el.points[i].y);
        }
        ctx.stroke();
      } else if (el.type === 'text' && el.text) {
        ctx.fillStyle = el.stroke;
        ctx.font = '14px system-ui, sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(el.text, el.x, el.y);
      }

      // Highlight selected element
      if (selectedElementId === el.id) {
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        const pad = 6;
        const w = el.width || 40;
        const h = el.height || 40;
        ctx.strokeRect(el.x - pad, el.y - pad, w + pad * 2, h + pad * 2);
        ctx.setLineDash([]);
      }
    }
  }, [elements, currentElement, selectedElementId, zoom, pan]);

  // Sync canvas size on mount / resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (canvas && canvas.parentElement) {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
        drawScene();
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [drawScene]);

  useEffect(() => {
    drawScene();
  }, [drawScene]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button === 1 || selectedTool === 'select' && e.altKey) {
      setIsPanning(true);
      startPos.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
      return;
    }

    const { x, y } = getCanvasCoords(e);
    setIsDrawing(true);
    startPos.current = { x, y };

    if (selectedTool === 'select') {
      const clicked = [...elements].reverse().find(el => {
        const w = el.width || 40;
        const h = el.height || 40;
        return x >= el.x && x <= el.x + w && y >= el.y && y <= el.y + h;
      });
      setSelectedElementId(clicked ? clicked.id : null);
      return;
    }

    if (selectedTool === 'eraser') {
      const remaining = elements.filter(el => {
        const w = el.width || 40;
        const h = el.height || 40;
        return !(x >= el.x && x <= el.x + w && y >= el.y && y <= el.y + h);
      });
      setElements(remaining);
      pushHistory(remaining);
      return;
    }

    if (selectedTool === 'text') {
      const userText = prompt('Enter text:');
      if (userText) {
        const newEl: CanvasElement = {
          id: `el-${Date.now()}`,
          type: 'text',
          x,
          y,
          text: userText,
          stroke: activeColor,
          fill: 'transparent',
          strokeWidth,
        };
        const next = [...elements, newEl];
        setElements(next);
        pushHistory(next);
      }
      setIsDrawing(false);
      return;
    }

    const newId = `el-${Date.now()}`;
    const fill = selectedTool === 'rectangle' || selectedTool === 'circle' || selectedTool === 'diamond'
      ? `${activeColor}18`
      : 'transparent';

    if (selectedTool === 'draw') {
      setCurrentElement({
        id: newId,
        type: 'draw',
        x,
        y,
        points: [{ x, y }],
        stroke: activeColor,
        fill: 'transparent',
        strokeWidth,
      });
    } else {
      setCurrentElement({
        id: newId,
        type: selectedTool,
        x,
        y,
        width: 0,
        height: 0,
        stroke: activeColor,
        fill,
        strokeWidth,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isPanning) {
      setPan({ x: e.clientX - startPos.current.x, y: e.clientY - startPos.current.y });
      return;
    }

    if (!isDrawing) return;
    const { x, y } = getCanvasCoords(e);

    if (currentElement) {
      if (currentElement.type === 'draw') {
        setCurrentElement({
          ...currentElement,
          points: [...(currentElement.points || []), { x, y }],
        });
      } else {
        setCurrentElement({
          ...currentElement,
          width: x - startPos.current.x,
          height: y - startPos.current.y,
        });
      }
    }
  };

  const handleMouseUp = () => {
    if (isPanning) {
      setIsPanning(false);
      return;
    }

    if (isDrawing && currentElement) {
      const next = [...elements, currentElement];
      setElements(next);
      pushHistory(next);
      setCurrentElement(null);
    }
    setIsDrawing(false);
  };

  const exportAsPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `architecture-canvas-${Date.now()}.png`;
    a.click();
  };

  const loadTemplate = (tmpl: typeof TEMPLATES[0]) => {
    setElements(tmpl.elements as CanvasElement[]);
    pushHistory(tmpl.elements as CanvasElement[]);
  };

  const clearCanvas = () => {
    if (confirm('Clear the entire canvas?')) {
      setElements([]);
      pushHistory([]);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0e0e13] text-white overflow-hidden select-none">
      {/* Canvas Top Bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-[hsl(var(--crust))]/90 backdrop-blur-xl border-b border-[hsl(var(--surface1))] z-20">
        {/* Tool selector */}
        <div className="flex items-center gap-1 p-0.5 rounded-xl bg-[hsl(var(--surface0))]/50 border border-[hsl(var(--surface1))] shadow-sm">
          {([
            { id: 'select', icon: <MousePointer className="w-3.5 h-3.5" />, label: 'Select (V)' },
            { id: 'rectangle', icon: <Square className="w-3.5 h-3.5" />, label: 'Rectangle' },
            { id: 'circle', icon: <Circle className="w-3.5 h-3.5" />, label: 'Circle' },
            { id: 'diamond', icon: <Diamond className="w-3.5 h-3.5" />, label: 'Diamond / Logic' },
            { id: 'arrow', icon: <ArrowRight className="w-3.5 h-3.5" />, label: 'Arrow' },
            { id: 'line', icon: <Minus className="w-3.5 h-3.5" />, label: 'Line' },
            { id: 'draw', icon: <Pencil className="w-3.5 h-3.5" />, label: 'Draw' },
            { id: 'text', icon: <Type className="w-3.5 h-3.5" />, label: 'Text' },
            { id: 'eraser', icon: <Eraser className="w-3.5 h-3.5" />, label: 'Eraser' },
          ] as const).map(tool => (
            <button
              key={tool.id}
              onClick={() => setSelectedTool(tool.id)}
              className={`p-1.5 rounded-lg transition-all ${
                selectedTool === tool.id
                  ? 'bg-blue-600/20 text-blue-400 font-semibold shadow-sm border border-blue-500/30'
                  : 'text-[hsl(var(--overlay1))] hover:text-white hover:bg-[hsl(var(--surface0))]'
              }`}
              title={tool.label}
            >
              {tool.icon}
            </button>
          ))}
        </div>

        {/* Color Palette */}
        <div className="hidden md:flex items-center gap-1.5 p-1 rounded-xl bg-[hsl(var(--surface0))]/50 border border-[hsl(var(--surface1))]">
          {COLOR_PALETTE.map(col => (
            <button
              key={col}
              onClick={() => setActiveColor(col)}
              className={`w-4 h-4 rounded-full transition-transform ${
                activeColor === col ? 'scale-125 ring-2 ring-blue-400' : 'hover:scale-110'
              }`}
              style={{ backgroundColor: col }}
              title={col}
            />
          ))}
        </div>

        {/* Templates dropdown & Actions */}
        <div className="flex items-center gap-2">
          <div className="flex items-center p-0.5 rounded-lg bg-[hsl(var(--surface0))]/50 border border-[hsl(var(--surface1))]">
            <button
              onClick={undo}
              disabled={historyIndex <= 0}
              className="p-1 rounded-md text-[hsl(var(--overlay1))] hover:text-white disabled:opacity-30"
              title="Undo"
            >
              <Undo2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
              className="p-1 rounded-md text-[hsl(var(--overlay1))] hover:text-white disabled:opacity-30"
              title="Redo"
            >
              <Redo2 className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={() => setZoom(z => Math.max(0.4, z - 0.1))}
            className="p-1.5 rounded-lg bg-[hsl(var(--surface0))]/50 border border-[hsl(var(--surface1))] text-[hsl(var(--overlay1))] hover:text-white"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[10px] font-mono text-[hsl(var(--overlay1))] w-8 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom(z => Math.min(2.5, z + 0.1))}
            className="p-1.5 rounded-lg bg-[hsl(var(--surface0))]/50 border border-[hsl(var(--surface1))] text-[hsl(var(--overlay1))] hover:text-white"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={exportAsPNG}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-sm shadow-blue-600/30 transition-all"
            title="Export as PNG"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>

          <button
            onClick={clearCanvas}
            className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
            title="Clear Canvas"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Canvas view */}
      <div className="flex-1 relative overflow-hidden bg-[#0a0a0f]">
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          className="w-full h-full cursor-crosshair block"
        />

        {/* Templates Picker Overlay */}
        <div className="absolute bottom-4 left-4 flex items-center gap-2 p-1.5 rounded-xl bg-[hsl(var(--crust))]/90 backdrop-blur-md border border-[hsl(var(--surface1))] shadow-xl">
          <span className="text-[10px] font-semibold uppercase text-[hsl(var(--overlay1))] px-2">Templates:</span>
          {TEMPLATES.map((tmpl, idx) => (
            <button
              key={idx}
              onClick={() => loadTemplate(tmpl)}
              className="px-2.5 py-1 text-xs font-medium rounded-lg bg-[hsl(var(--surface0))]/60 hover:bg-[hsl(var(--surface1))] text-white border border-[hsl(var(--surface1))]/60 transition-all"
            >
              {tmpl.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
