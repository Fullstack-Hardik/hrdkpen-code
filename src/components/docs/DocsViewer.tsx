import React, { useState, useMemo } from 'react';
import { BookOpen, Search, ExternalLink, Hash, Code2, Globe, Layers, Terminal, Sparkles, BookMarked, RefreshCw } from 'lucide-react';
import Fuse from 'fuse.js';

const CATEGORIES = ['All', 'Web Core', 'JavaScript & Frameworks', 'Systems & Backend', 'Languages & APIs', 'DevOps & Tools'];

interface DocTopic {
  id: string;
  title: string;
  category: string;
  desc: string;
  slug: string;
  officialUrl: string;
  tag: string;
}

const ALL_LANGUAGES_DOCS: DocTopic[] = [
  // Web Core
  { id: 'html', title: 'HTML5', category: 'Web Core', desc: 'Standard markup language for documents designed to be displayed in a web browser', slug: 'html', officialUrl: 'https://developer.mozilla.org/en-US/docs/Web/HTML', tag: 'Web' },
  { id: 'css', title: 'CSS3', category: 'Web Core', desc: 'Cascading Style Sheets styling language and Flexbox / Grid reference', slug: 'css', officialUrl: 'https://developer.mozilla.org/en-US/docs/Web/CSS', tag: 'Styling' },
  { id: 'dom', title: 'Web APIs / DOM', category: 'Web Core', desc: 'Browser window, Document, Fetch, WebSocket, and DOM APIs', slug: 'dom', officialUrl: 'https://developer.mozilla.org/en-US/docs/Web/API', tag: 'Browser' },
  { id: 'svg', title: 'SVG', category: 'Web Core', desc: 'Scalable Vector Graphics XML-based format for vector images', slug: 'svg', officialUrl: 'https://developer.mozilla.org/en-US/docs/Web/SVG', tag: 'Vector' },

  // JavaScript & Frameworks
  { id: 'javascript', title: 'JavaScript (ES2024)', category: 'JavaScript & Frameworks', desc: 'Modern ECMAScript standard specifications, syntax, and built-ins', slug: 'javascript', officialUrl: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript', tag: 'Language' },
  { id: 'typescript', title: 'TypeScript', category: 'JavaScript & Frameworks', desc: 'Typed superset of JavaScript that compiles to plain JavaScript', slug: 'typescript', officialUrl: 'https://www.typescriptlang.org/docs/', tag: 'Types' },
  { id: 'react', title: 'React 18 / 19', category: 'JavaScript & Frameworks', desc: 'The library for web and native user interfaces', slug: 'react', officialUrl: 'https://react.dev/', tag: 'UI' },
  { id: 'vue', title: 'Vue.js', category: 'JavaScript & Frameworks', desc: 'Progressive framework for building user interfaces', slug: 'vue~3', officialUrl: 'https://vuejs.org/guide/introduction.html', tag: 'UI' },
  { id: 'nextjs', title: 'Next.js', category: 'JavaScript & Frameworks', desc: 'The React Framework for the Web with SSR and App Router', slug: 'nextjs', officialUrl: 'https://nextjs.org/docs', tag: 'Fullstack' },

  // Systems & Backend
  { id: 'node', title: 'Node.js', category: 'Systems & Backend', desc: 'Asynchronous event-driven JavaScript runtime environment', slug: 'node', officialUrl: 'https://nodejs.org/docs/latest/api/', tag: 'Runtime' },
  { id: 'express', title: 'Express.js', category: 'Systems & Backend', desc: 'Fast, unopinionated, minimalist web framework for Node.js', slug: 'express', officialUrl: 'https://expressjs.com/', tag: 'Server' },
  { id: 'python', title: 'Python 3', category: 'Systems & Backend', desc: 'Interpreted high-level programming language standard library', slug: 'python~3.11', officialUrl: 'https://docs.python.org/3/', tag: 'Language' },
  { id: 'fastapi', title: 'FastAPI', category: 'Systems & Backend', desc: 'Modern, fast web framework for building APIs with Python', slug: 'fastapi', officialUrl: 'https://fastapi.tiangolo.com/', tag: 'API' },
  { id: 'go', title: 'Go (Golang)', category: 'Systems & Backend', desc: 'Open source programming language created by Google', slug: 'go', officialUrl: 'https://go.dev/doc/', tag: 'Language' },
  { id: 'rust', title: 'Rust', category: 'Systems & Backend', desc: 'Language empowering everyone to build reliable and efficient software', slug: 'rust', officialUrl: 'https://doc.rust-lang.org/book/', tag: 'Systems' },

  // Languages & APIs
  { id: 'c', title: 'C', category: 'Languages & APIs', desc: 'ISO C language standard library reference and libc routines', slug: 'c', officialUrl: 'https://en.cppreference.com/w/c', tag: 'Native' },
  { id: 'cpp', title: 'C++', category: 'Languages & APIs', desc: 'C++ STL, algorithms, templates, memory management, and modern standards', slug: 'cpp', officialUrl: 'https://en.cppreference.com/w/cpp', tag: 'Native' },
  { id: 'java', title: 'Java SE', category: 'Languages & APIs', desc: 'Oracle Java platform standard edition API specification', slug: 'openjdk~17', officialUrl: 'https://docs.oracle.com/en/java/', tag: 'JVM' },
  { id: 'csharp', title: 'C# / .NET', category: 'Languages & APIs', desc: 'Modern, object-oriented language for building .NET applications', slug: 'dotnet', officialUrl: 'https://learn.microsoft.com/en-us/dotnet/csharp/', tag: '.NET' },
  { id: 'sqlite', title: 'SQLite / SQL', category: 'Languages & APIs', desc: 'SQL syntax reference, schema definitions, and query optimizations', slug: 'sqlite', officialUrl: 'https://www.sqlite.org/docs.html', tag: 'Database' },

  // DevOps & Tools
  { id: 'git', title: 'Git SCM', category: 'DevOps & Tools', desc: 'Fast, scalable, distributed revision control system', slug: 'git', officialUrl: 'https://git-scm.com/doc', tag: 'VCS' },
  { id: 'docker', title: 'Docker', category: 'DevOps & Tools', desc: 'Container platform for building, shipping, and running apps', slug: 'docker', officialUrl: 'https://docs.docker.com/', tag: 'Containers' },
  { id: 'npm', title: 'npm CLI', category: 'DevOps & Tools', desc: 'Package manager for Node.js and JavaScript development', slug: 'npm', officialUrl: 'https://docs.npmjs.com/', tag: 'Package' },
  { id: 'bash', title: 'Bash / Shell', category: 'DevOps & Tools', desc: 'GNU Bourne-Again SHell manual and posix terminal commands', slug: 'bash', officialUrl: 'https://www.gnu.org/software/bash/manual/', tag: 'Shell' },
];

export const DocsViewer = () => {
  const [topics] = useState<DocTopic[]>(ALL_LANGUAGES_DOCS);
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeTopic, setActiveTopic] = useState<DocTopic>(ALL_LANGUAGES_DOCS[0]);
  const [iframeKey, setIframeKey] = useState(0);

  // DevDocs embeds seamlessly
  const devdocsUrl = `https://devdocs.io/${activeTopic.slug}/`;

  const fuse = useMemo(() => new Fuse(topics, { keys: ['title', 'desc', 'slug', 'category', 'tag'], threshold: 0.35 }), [topics]);

  const searchResults = useMemo(() => {
    if (!query) {
      if (selectedCategory === 'All') return topics;
      return topics.filter(t => t.category === selectedCategory);
    }
    return fuse.search(query).map(r => r.item);
  }, [query, selectedCategory, fuse, topics]);

  return (
    <div className="flex h-full bg-[hsl(var(--mantle))] select-none overflow-hidden">
      {/* Topics Master Sidebar */}
      <div className="w-64 flex flex-col border-r border-[hsl(var(--surface1))] bg-[hsl(var(--crust))] flex-shrink-0">
        {/* Header */}
        <div className="p-3 border-b border-[hsl(var(--surface1))] bg-[hsl(var(--mantle))] space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-[hsl(var(--surface0))] border border-[hsl(var(--surface2))] flex items-center justify-center text-[hsl(var(--text))]">
                <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <span className="text-xs font-semibold text-[hsl(var(--text))] tracking-tight">API Documentation</span>
            </div>
            <span className="text-[10px] text-[hsl(var(--overlay0))] font-mono">
              {topics.length} docs
            </span>
          </div>

          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[hsl(var(--overlay1))]" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search all languages & APIs..."
              className="w-full h-7 pl-8 pr-3 text-xs bg-[hsl(var(--crust))] border border-[hsl(var(--surface1))] rounded-lg text-[hsl(var(--text))] placeholder:text-[hsl(var(--overlay0))] outline-none focus:border-blue-500/60 transition-colors"
            />
          </div>
        </div>

        {/* Categories Pill Strip */}
        {!query && (
          <div className="flex overflow-x-auto p-2 gap-1 border-b border-[hsl(var(--surface1))] scrollbar-none flex-shrink-0 bg-[hsl(var(--crust))]">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2 py-0.5 text-[10px] rounded-md transition-all whitespace-nowrap border ${
                  selectedCategory === cat
                    ? 'bg-[hsl(var(--surface1))] text-[hsl(var(--text))] font-medium border-[hsl(var(--surface2))] shadow-xs'
                    : 'text-[hsl(var(--overlay1))] border-transparent hover:text-[hsl(var(--text))] hover:bg-[hsl(var(--surface0))]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Topics List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar bg-[hsl(var(--crust))]">
          {searchResults.map(topic => {
            const isActive = activeTopic.id === topic.id;
            return (
              <button
                key={topic.id}
                onClick={() => {
                  setActiveTopic(topic);
                  setIframeKey(k => k + 1);
                }}
                className={`w-full text-left flex items-start gap-2 p-2 rounded-lg transition-all border ${
                  isActive
                    ? 'bg-[hsl(var(--surface0))] text-[hsl(var(--text))] border-[hsl(var(--surface2))] shadow-xs'
                    : 'text-[hsl(var(--overlay1))] border-transparent hover:bg-[hsl(var(--surface0))/0.5] hover:text-[hsl(var(--text))]'
                }`}
              >
                <Hash className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${isActive ? 'text-emerald-400' : 'text-[hsl(var(--overlay0))]'}`} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-medium text-[hsl(var(--text))] truncate">{topic.title}</span>
                    <span className="text-[9px] px-1 py-0.2 rounded font-mono bg-[hsl(var(--mantle))] text-[hsl(var(--overlay0))] border border-[hsl(var(--surface1))]">
                      {topic.tag}
                    </span>
                  </div>
                  <div className="text-[10px] truncate text-[hsl(var(--overlay1))] mt-0.5">{topic.desc}</div>
                </div>
              </button>
            );
          })}

          {searchResults.length === 0 && (
            <div className="text-xs text-[hsl(var(--overlay1))] text-center p-6">
              No matching documentation found.
            </div>
          )}
        </div>
      </div>

      {/* Main Documentation Viewer Surface */}
      <div className="flex-1 flex flex-col min-w-0 bg-[hsl(var(--base))]">
        {/* Document Action Chrome */}
        <div className="h-9 bg-[hsl(var(--crust))] border-b border-[hsl(var(--surface1))] flex items-center justify-between px-3 flex-shrink-0">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <span className="text-xs font-semibold text-[hsl(var(--text))] truncate">
              {activeTopic.title} Documentation
            </span>
            <span className="text-[10px] text-[hsl(var(--overlay0))] truncate font-mono hidden md:inline">
              ({devdocsUrl})
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIframeKey(k => k + 1)}
              className="p-1 rounded-md text-[hsl(var(--overlay1))] hover:text-white hover:bg-[hsl(var(--surface0))] transition-colors"
              title="Reload Documentation"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>

            <a
              href={activeTopic.officialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium bg-[hsl(var(--mantle))] hover:bg-[hsl(var(--surface0))] text-[hsl(var(--text))] border border-[hsl(var(--surface1))] transition-colors"
              title="Open Official Documentation Portal"
            >
              <span>Official Site</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            <a
              href={devdocsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium bg-[hsl(var(--surface0))] hover:bg-[hsl(var(--surface1))] text-white border border-[hsl(var(--surface2))] transition-colors"
              title="Open Fullscreen in DevDocs"
            >
              <span>DevDocs</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Embedded High-Performance Reader */}
        <div className="flex-1 relative bg-white">
          <iframe
            key={iframeKey}
            src={devdocsUrl}
            className="absolute inset-0 w-full h-full border-0"
            title={`${activeTopic.title} Documentation`}
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
          />
        </div>
      </div>
    </div>
  );
};
