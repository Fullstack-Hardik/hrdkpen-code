import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { 
  Bot, Trash2, Settings2, X, Send, Copy, Check, User, Loader2, Sparkles, Code2, Lightbulb, Zap, Terminal
} from 'lucide-react';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { requestGrok, testGrokConnection, type GrokMessage } from '@/lib/grok';

export interface AIAssistantRef {
  submitPrompt: (prompt: string) => void;
  autoComplete: (fileContent: string, line: number, col: number) => Promise<string>;
}

const personas = {
  tech: {
    name: 'Architect & Coder',
    system: "You are an expert senior staff software engineer, system architect, and coding tutor. Provide production-ready, clean code answers, best practices guidance, optimization strategies, and thorough comments.",
    desc: "Production code, architecture diagrams, debugging, and optimizations.",
    badge: 'Coding'
  },
  helpful: {
    name: 'General Assistant',
    system: "You are a professional, helpful, and polite artificial intelligence assistant. Answer questions clearly, accurately, and thoroughly with balanced insights.",
    desc: "General reasoning, task breakdown, and technical explanations.",
    badge: 'General'
  },
  creative: {
    name: 'Creative Engineer',
    system: "You are an imaginative product designer and creative engineer. Brainstorm novel UX ideas, CSS visual flourishes, and modern web application features.",
    desc: "UI/UX ideas, visual design, and creative product thinking.",
    badge: 'Design'
  },
  academic: {
    name: 'Computer Scientist',
    system: "You are a computer science professor and algorithms researcher. Use formal precision, big-O analysis, and structured breakdowns to explain data structures and algorithms.",
    desc: "Algorithms, complexity analysis, and deep CS theory.",
    badge: 'Theory'
  }
};

const QUICK_PROMPTS = [
  { icon: <Code2 className="w-3.5 h-3.5 text-blue-400" />, label: 'Explain this code', prompt: 'Can you explain how the active file works and its architecture?' },
  { icon: <Zap className="w-3.5 h-3.5 text-amber-400" />, label: 'Find bugs & edge cases', prompt: 'Review my code for potential bugs, security issues, and edge cases.' },
  { icon: <Terminal className="w-3.5 h-3.5 text-emerald-400" />, label: 'Refactor cleanly', prompt: 'Suggest clean TypeScript refactoring and design improvements.' },
  { icon: <Lightbulb className="w-3.5 h-3.5 text-purple-400" />, label: 'Write unit tests', prompt: 'Write comprehensive Jest / Vitest unit tests for this code.' },
];

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const parseMarkdown = (text: string) => {
  if (!text) return '';
  let html = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Code blocks with syntax badge & copy friendly
  html = html.replace(/```([\w-]*)\n([\s\S]*?)```/g, function(_, lang, code) {
    return `<div class="my-3 overflow-hidden rounded-xl border border-[hsl(var(--surface1))] bg-[hsl(var(--crust))] text-[hsl(var(--text))]">
        <div class="flex justify-between items-center px-3 py-1.5 bg-[hsl(var(--mantle))] text-[11px] font-mono text-[hsl(var(--overlay1))] border-b border-[hsl(var(--surface1))]">
            <span>${lang || 'code'}</span>
            <span class="text-[9px] uppercase tracking-wider text-[hsl(var(--overlay0))]">Press to select</span>
        </div>
        <pre class="p-3 overflow-x-auto text-[11px] font-mono leading-relaxed custom-scrollbar"><code>${code.trim()}</code></pre>
    </div>`;
  });

  // Inline Code
  html = html.replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 bg-[hsl(var(--surface0))] text-blue-400 font-mono text-[11px] rounded border border-[hsl(var(--surface1))]">$1</code>');
  // Bold
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold text-white">$1</strong>');
  // Italic
  html = html.replace(/\*([^*]+)\*/g, '<em class="text-[hsl(var(--subtext1))]">$1</em>');
  // Unordered list items
  html = html.replace(/^\s*-\s+(.+)$/gm, '<li class="ml-4 list-disc text-[hsl(var(--subtext1))]">$1</li>');
  // Ordered list items
  html = html.replace(/^\s*\d+\.\s+(.+)$/gm, '<li class="ml-4 list-decimal text-[hsl(var(--subtext1))]">$1</li>');
  // Paragraphs & Linebreaks
  html = html.replace(/\n/g, '<br>');

  return html;
};

export const AIAssistant = forwardRef<AIAssistantRef, {}>((props, ref) => {
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [selectedPersona, setSelectedPersona] = useState<keyof typeof personas>('tech');
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('grok-4.6');
  const [connectionState, setConnectionState] = useState<'idle' | 'testing' | 'ready' | 'error'>('idle');
  const [connectionMessage, setConnectionMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Deliberately no key restoration: credentials remain in memory for this tab only.
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory, isGenerating]);

  useImperativeHandle(ref, () => ({
    submitPrompt: (prompt: string) => {
      setUserInput(prompt);
      handleFormSubmit(new Event('submit') as any, prompt);
    },
    autoComplete: async (fileContent: string, line: number, col: number) => {
      const prompt = `You are an expert coder. Please complete the following code at line ${line}, column ${col}. Respond ONLY with the raw code to be inserted at the cursor, without any markdown formatting, backticks, or explanations. Keep it concise.\n\nCode:\n${fileContent}`;
      try {
        const result = await callGroqAPI([{ role: 'user', content: prompt }]);
        return result;
      } catch (e) {
        console.error("Auto-complete failed", e);
        return "";
      }
    }
  }));

  const autoResizeTextarea = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  const handleKeydown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleFormSubmit(e);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent | Event, overridePrompt?: string) => {
    e.preventDefault();
    if (isGenerating) return;

    const text = overridePrompt || userInput.trim();
    if (!text) return;

    setIsGenerating(true);
    setUserInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = '42px';
    }

    const newHistory = [...chatHistory, { role: 'user' as const, content: text }];
    setChatHistory(newHistory);

    try {
      const responseText = await callGroqAPI(newHistory, personas[selectedPersona].system);
      const updatedHistory = [...newHistory, { role: 'assistant' as const, content: responseText }];
      setChatHistory(updatedHistory);
    } catch (err) {
      setChatHistory(prev => [
        ...prev,
        {
          role: 'assistant',
          content: `**Grok request failed.** ${err instanceof Error ? err.message : 'Please try again.'}`
        }
      ]);
    } finally {
      setIsGenerating(false);
      textareaRef.current?.focus();
    }
  };

  const callGroqAPI = async (history: Message[], systemPrompt?: string) => {
    const messages: GrokMessage[] = systemPrompt 
      ? [{ role: 'system', content: systemPrompt }, ...history] 
      : history;
    return requestGrok(apiKey, model, messages);
  };

  const copyMessage = (content: string, index: number) => {
    navigator.clipboard.writeText(content);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-[hsl(var(--mantle))] text-[hsl(var(--text))] relative select-none">
      {/* Sleek macOS Toolbar Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[hsl(var(--surface1))] bg-[hsl(var(--crust))] flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-[hsl(var(--surface0))] border border-[hsl(var(--surface2))] flex items-center justify-center text-[hsl(var(--text))]">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <span className="text-xs font-semibold text-[hsl(var(--text))] tracking-tight">AI Developer Bot</span>
          <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-[hsl(var(--surface0))] text-[hsl(var(--overlay1))] border border-[hsl(var(--surface1))]">
            {personas[selectedPersona].name}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => { setChatHistory([]); localStorage.removeItem('chatHistory'); }}
                aria-label="Clear Chat"
                className="h-6 w-6 flex items-center justify-center rounded-md text-[hsl(var(--overlay1))] hover:text-rose-400 hover:bg-[hsl(var(--surface0))] transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">Clear Conversation</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => setShowSettings(!showSettings)}
                aria-label="AI Settings"
                className={`h-6 w-6 flex items-center justify-center rounded-md transition-all ${
                  showSettings ? 'bg-[hsl(var(--surface1))] text-white' : 'text-[hsl(var(--overlay1))] hover:text-[hsl(var(--text))] hover:bg-[hsl(var(--surface0))]'
                }`}
              >
                <Settings2 className="w-3.5 h-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">Configure Persona & Keys</TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        <div className="flex-1 flex flex-col min-w-0 bg-[hsl(var(--base))]">
          {/* Chat Messages */}
          <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-3.5 space-y-3.5 custom-scrollbar select-text">
            {chatHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-4 py-6 space-y-4">
                <div className="w-10 h-10 rounded-2xl bg-[hsl(var(--surface0))] border border-[hsl(var(--surface2))] flex items-center justify-center shadow-sm">
                  <Bot className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-[hsl(var(--text))]">Ready to assist your coding session</h3>
                  <p className="text-[11px] text-[hsl(var(--overlay1))] mt-1 max-w-xs">
                    Ask questions, optimize logic, review code, or generate unit tests.
                  </p>
                </div>

                {/* Quick Prompts */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-md pt-2">
                  {QUICK_PROMPTS.map((qp, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setUserInput(qp.prompt);
                        handleFormSubmit(new Event('submit') as any, qp.prompt);
                      }}
                      className="flex items-center gap-2 p-2.5 rounded-lg border border-[hsl(var(--surface1))] bg-[hsl(var(--crust))] hover:bg-[hsl(var(--surface0))] text-left text-xs transition-all group shadow-xs"
                    >
                      {qp.icon}
                      <span className="text-[11px] font-medium text-[hsl(var(--subtext1))] group-hover:text-white truncate">
                        {qp.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              chatHistory.map((msg, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-2.5 group ${msg.role === 'user' ? 'ml-auto flex-row-reverse max-w-[85%]' : 'max-w-[92%]'}`}
                >
                  <div className={`h-6 w-6 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-semibold ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-[hsl(var(--surface0))] border border-[hsl(var(--surface2))] text-purple-400'
                  }`}>
                    {msg.role === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                  </div>

                  <div className="relative">
                    <div
                      className={`rounded-xl px-3 py-2 text-xs leading-relaxed shadow-xs ${
                        msg.role === 'user'
                          ? 'bg-blue-600 text-white rounded-tr-none'
                          : 'bg-[hsl(var(--crust))] border border-[hsl(var(--surface1))] text-[hsl(var(--text))] rounded-tl-none'
                      }`}
                      dangerouslySetInnerHTML={{ __html: parseMarkdown(msg.content) }}
                    />
                    
                    {msg.role === 'assistant' && (
                      <button
                        onClick={() => copyMessage(msg.content, i)}
                        aria-label="Copy AI response"
                        className="opacity-0 group-hover:opacity-100 absolute -bottom-4 right-1 p-1 rounded text-[10px] text-[hsl(var(--overlay1))] hover:text-white bg-[hsl(var(--mantle))] border border-[hsl(var(--surface1))] transition-all flex items-center gap-1"
                      >
                        {copiedIndex === i ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>Copy</span>
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}

            {isGenerating && (
              <div className="flex items-start gap-2.5 max-w-[80%] animate-fade-in">
                <div className="h-6 w-6 rounded-md bg-[hsl(var(--surface0))] border border-[hsl(var(--surface2))] flex items-center justify-center flex-shrink-0 text-purple-400">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="bg-[hsl(var(--crust))] border border-[hsl(var(--surface1))] rounded-xl rounded-tl-none px-3 py-2.5 flex items-center gap-1.5 shadow-xs">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse delay-150" />
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse delay-300" />
                </div>
              </div>
            )}
          </div>

          {/* Input Bar */}
          <div className="p-2.5 border-t border-[hsl(var(--surface1))] bg-[hsl(var(--crust))] flex-shrink-0">
            <form onSubmit={handleFormSubmit} className="relative flex items-center bg-[hsl(var(--mantle))] border border-[hsl(var(--surface1))] rounded-xl focus-within:border-blue-500/60 focus-within:ring-1 focus-within:ring-blue-500/20 transition-all">
              <textarea
                ref={textareaRef}
                value={userInput}
                onChange={e => { setUserInput(e.target.value); autoResizeTextarea(); }}
                onKeyDown={handleKeydown}
                placeholder="Ask AI anything about your code..."
                className="w-full bg-transparent pl-3 pr-10 py-2.5 text-xs text-[hsl(var(--text))] placeholder:text-[hsl(var(--overlay0))] resize-none focus:outline-none max-h-32 min-h-[42px] leading-relaxed font-sans"
                style={{ height: '42px' }}
              />
              <button
                type="submit"
                disabled={isGenerating || !userInput.trim()}
                className="absolute right-2 bottom-2 h-7 w-7 rounded-lg bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-xs"
                title="Send Message (Enter)"
              >
                {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              </button>
            </form>
          </div>
        </div>

        {/* Settings Drawer */}
        {showSettings && (
          <div className="absolute inset-y-0 right-0 w-72 bg-[hsl(var(--crust))] border-l border-[hsl(var(--surface1))] p-4 flex flex-col gap-4 z-20 overflow-y-auto shadow-2xl animate-slide-left">
            <div className="flex items-center justify-between border-b border-[hsl(var(--surface1))] pb-2.5">
              <h3 className="font-semibold text-xs flex items-center gap-2 text-[hsl(var(--text))]">
                <Settings2 className="w-3.5 h-3.5" /> AI Engine Settings
              </h3>
              <button
                onClick={() => setShowSettings(false)}
                className="text-[hsl(var(--overlay1))] hover:text-white p-1 rounded-md transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-semibold uppercase text-[hsl(var(--overlay0))] tracking-wider">
                Persona Preset
              </label>
              <select
                value={selectedPersona}
                onChange={e => setSelectedPersona(e.target.value as any)}
                className="w-full bg-[hsl(var(--mantle))] border border-[hsl(var(--surface1))] rounded-lg px-2.5 py-1.5 text-xs text-[hsl(var(--text))] focus:outline-none focus:border-blue-500"
              >
                {Object.entries(personas).map(([key, val]) => (
                  <option key={key} value={key}>{val.name}</option>
                ))}
              </select>
              <p className="text-[10px] text-[hsl(var(--overlay1))] mt-1 leading-relaxed">
                {personas[selectedPersona].desc}
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-semibold uppercase text-[hsl(var(--overlay0))] tracking-wider">
                Grok API Key
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={e => { setApiKey(e.target.value); setConnectionState('idle'); setConnectionMessage(''); }}
                placeholder="xai-…"
                className="w-full bg-[hsl(var(--mantle))] border border-[hsl(var(--surface1))] rounded-lg px-2.5 py-1.5 text-xs text-[hsl(var(--text))] placeholder:text-[hsl(var(--overlay0))] focus:outline-none focus:border-blue-500"
              />
              <select
                value={model}
                onChange={e => setModel(e.target.value)}
                className="w-full bg-[hsl(var(--mantle))] border border-[hsl(var(--surface1))] rounded-lg px-2.5 py-1.5 text-xs text-[hsl(var(--text))]"
              >
                <option value="grok-4.6">Grok 4.6</option>
                <option value="grok-4.7">Grok 4.7</option>
              </select>
              <button
                type="button"
                disabled={!apiKey.trim() || connectionState === 'testing'}
                onClick={async () => {
                  setConnectionState('testing');
                  setConnectionMessage('Testing connection…');
                  try {
                    await testGrokConnection(apiKey, model);
                    setConnectionState('ready');
                    setConnectionMessage('Connected. Your key is held only for this browser tab.');
                  } catch (error) {
                    setConnectionState('error');
                    setConnectionMessage(error instanceof Error ? error.message : 'Connection test failed.');
                  }
                }}
                className="self-start rounded-md border border-[hsl(var(--surface2))] px-2.5 py-1.5 text-[11px] font-medium text-[hsl(var(--text))] hover:bg-[hsl(var(--surface0))] disabled:opacity-50"
              >
                {connectionState === 'testing' ? 'Testing…' : 'Test connection'}
              </button>
              <span className={`text-[9px] leading-relaxed ${connectionState === 'error' ? 'text-rose-400' : connectionState === 'ready' ? 'text-emerald-400' : 'text-[hsl(var(--overlay0))]'}`}>
                {connectionMessage || 'The key is sent directly to xAI over HTTPS for this tab only; it is never saved in browser storage.'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

AIAssistant.displayName = 'AIAssistant';
