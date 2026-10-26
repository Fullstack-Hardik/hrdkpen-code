import { useState, useEffect, useRef } from 'react';
import { Clock, Play, Square, Timer, X } from 'lucide-react';

export const ProductivityTools = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [sessionSeconds, setSessionSeconds] = useState(0);
  
  // Stopwatch state
  const [stopwatchRunning, setStopwatchRunning] = useState(false);
  const [stopwatchSeconds, setStopwatchSeconds] = useState(0);
  
  const stopwatchTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Session timer (always running)
  useEffect(() => {
    const timer = setInterval(() => {
      setSessionSeconds(s => s + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Stopwatch timer
  useEffect(() => {
    if (stopwatchRunning) {
      stopwatchTimerRef.current = setInterval(() => {
        setStopwatchSeconds(s => s + 1);
      }, 1000);
    } else if (stopwatchTimerRef.current) {
      clearInterval(stopwatchTimerRef.current);
    }
    return () => {
      if (stopwatchTimerRef.current) clearInterval(stopwatchTimerRef.current);
    };
  }, [stopwatchRunning]);

  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    if (h > 0) return `${h}h ${m}m`;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const formatStopwatch = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all text-xs font-mono border
          ${isOpen ? 'bg-[hsl(var(--surface0))] text-[hsl(var(--text))] border-[hsl(var(--surface2))] shadow-sm' : 'border-transparent text-[hsl(var(--overlay1))] hover:text-[hsl(var(--text))] hover:bg-[hsl(var(--surface0))]/60'}`}
        title="Productivity & Focus Timer"
      >
        <Clock className="w-3.5 h-3.5 text-blue-400" />
        <span className="tabular-nums font-semibold">{formatTime(sessionSeconds)}</span>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-72 bg-[hsl(var(--crust))]/95 backdrop-blur-2xl border border-[hsl(var(--surface1))] rounded-2xl shadow-2xl z-50 overflow-hidden animate-scale-in p-4 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[hsl(var(--surface1))]/70">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-blue-500/15 flex items-center justify-center text-blue-400">
                <Timer className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold text-[hsl(var(--text))] tracking-tight">Focus & Productivity</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-1 rounded-md text-[hsl(var(--overlay1))] hover:text-white hover:bg-[hsl(var(--surface0))] transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          
          <div className="space-y-4">
            {/* Session Timer */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-[hsl(var(--surface0))]/40 border border-[hsl(var(--surface1))]/50">
              <div className="flex flex-col">
                <span className="text-[11px] font-semibold text-[hsl(var(--text))]">Session Duration</span>
                <span className="text-[10px] text-[hsl(var(--overlay1))]">Time coding active session</span>
              </div>
              <span className="text-xs font-mono text-blue-400 font-bold bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full tabular-nums">
                {formatTime(sessionSeconds)}
              </span>
            </div>

            {/* Stopwatch */}
            <div className="flex flex-col gap-2.5 p-3 rounded-xl bg-[hsl(var(--surface0))]/40 border border-[hsl(var(--surface1))]/50">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-[hsl(var(--text))]">Task Stopwatch</span>
                <span className="text-base font-mono text-emerald-400 font-bold tabular-nums">
                  {formatStopwatch(stopwatchSeconds)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setStopwatchRunning(!stopwatchRunning)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    stopwatchRunning 
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30' 
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm shadow-emerald-600/30'
                  }`}
                >
                  {stopwatchRunning ? <Square className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current" />}
                  {stopwatchRunning ? 'Stop' : 'Start'}
                </button>
                <button
                  onClick={() => {
                    setStopwatchRunning(false);
                    setStopwatchSeconds(0);
                  }}
                  disabled={stopwatchSeconds === 0 && !stopwatchRunning}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[hsl(var(--surface1))]/60 hover:bg-[hsl(var(--surface1))] text-[hsl(var(--overlay2))] hover:text-white transition-all disabled:opacity-40"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
