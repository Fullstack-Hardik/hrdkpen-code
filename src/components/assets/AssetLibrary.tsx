import React, { useState, useEffect } from 'react';
import { Search, Download, Copy, Image as ImageIcon, Loader2, Check, Sparkles, Filter, ExternalLink } from 'lucide-react';
import { Input } from '@/components/ui/input';

const PIXABAY_API_KEY = import.meta.env.VITE_PIXABAY_API_KEY || '44960484-fee9decec027c63657796ef2e';

interface AssetPhoto {
  id: number | string;
  webformatURL: string;
  largeImageURL: string;
  tags: string;
  user: string;
}

// Curated high-res developer assets when offline or fallback
const CURATED_ASSETS: AssetPhoto[] = [
  {
    id: 'c1',
    tags: 'code, editor, dark theme, programming',
    user: 'HRDK Studio',
    webformatURL: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80',
    largeImageURL: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1600&auto=format&fit=crop&q=85',
  },
  {
    id: 'c2',
    tags: 'laptop, developer, minimal workspace, macbook',
    user: 'Unsplash',
    webformatURL: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=80',
    largeImageURL: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1600&auto=format&fit=crop&q=85',
  },
  {
    id: 'c3',
    tags: 'cyberpunk, code, futuristic, abstract neon',
    user: 'CyberArt',
    webformatURL: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80',
    largeImageURL: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1600&auto=format&fit=crop&q=85',
  },
  {
    id: 'c4',
    tags: 'react, web app, modern dashboard, ui design',
    user: 'Creative Lab',
    webformatURL: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=80',
    largeImageURL: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1600&auto=format&fit=crop&q=85',
  },
  {
    id: 'c5',
    tags: 'server, hardware, cloud computing, datacenter',
    user: 'CloudHub',
    webformatURL: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=80',
    largeImageURL: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1600&auto=format&fit=crop&q=85',
  },
  {
    id: 'c6',
    tags: 'mobile app, wireframe, modern interface, prototype',
    user: 'UX Design',
    webformatURL: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=600&auto=format&fit=crop&q=80',
    largeImageURL: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=1600&auto=format&fit=crop&q=85',
  },
];

const PRESET_TAGS = ['Coding', 'UI Mockup', 'Wallpaper', 'Dark Tech', 'Minimal', 'Abstract', 'Nature'];

export const AssetLibrary: React.FC = () => {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Coding');
  const [images, setImages] = useState<AssetPhoto[]>(CURATED_ASSETS);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | number | null>(null);

  const fetchImages = async (searchQuery: string = 'coding programming') => {
    setLoading(true);
    try {
      const res = await fetch(
        `https://pixabay.com/api/?key=${PIXABAY_API_KEY}&q=${encodeURIComponent(searchQuery)}&image_type=photo&per_page=24&safesearch=true`
      );
      if (!res.ok) throw new Error('API failed');
      const data = await res.json();
      if (data.hits && data.hits.length > 0) {
        setImages(data.hits);
      } else {
        setImages(CURATED_ASSETS);
      }
    } catch (err) {
      setImages(CURATED_ASSETS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages('developer coding technology');
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setActiveCategory('');
      fetchImages(query.trim());
    }
  };

  const copyToClipboard = (url: string, id: number | string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const downloadImage = async (url: string, id: number | string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `hrdkpen-asset-${id}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(url, '_blank');
    }
  };

  return (
    <div className="flex flex-col h-full bg-[hsl(var(--mantle))] overflow-hidden select-none">
      {/* Sleek Native Header */}
      <div className="p-3 border-b border-[hsl(var(--surface1))] bg-[hsl(var(--crust))] flex-shrink-0 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-[hsl(var(--surface0))] border border-[hsl(var(--surface2))] flex items-center justify-center text-[hsl(var(--text))]">
              <ImageIcon className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-semibold text-[hsl(var(--text))] tracking-tight">Developer Assets</span>
          </div>
          <span className="text-[10px] text-[hsl(var(--overlay0))] font-mono">
            {images.length} assets
          </span>
        </div>

        {/* Search input */}
        <form onSubmit={handleSearch} className="relative flex items-center">
          <Search className="absolute left-2.5 w-3.5 h-3.5 text-[hsl(var(--overlay1))]" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search royalty-free assets..."
            className="pl-8 pr-16 h-7 bg-[hsl(var(--mantle))] border-[hsl(var(--surface1))] text-xs text-[hsl(var(--text))] placeholder:text-[hsl(var(--overlay0))] rounded-lg focus-visible:ring-1 focus-visible:ring-blue-500/50"
          />
          <button
            type="submit"
            className="absolute right-1 px-2 py-0.5 text-[10px] font-medium text-[hsl(var(--text))] bg-[hsl(var(--surface0))] hover:bg-[hsl(var(--surface1))] rounded transition-colors border border-[hsl(var(--surface2))]"
          >
            Search
          </button>
        </form>

        {/* Quick category tags */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none pb-0.5">
          {PRESET_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => {
                setActiveCategory(tag);
                setQuery(tag);
                fetchImages(tag);
              }}
              className={`px-2 py-0.5 rounded-md text-[10px] font-medium whitespace-nowrap transition-all border ${
                activeCategory === tag
                  ? 'bg-[hsl(var(--surface1))] text-[hsl(var(--text))] border-[hsl(var(--surface2))] shadow-xs'
                  : 'bg-[hsl(var(--mantle))] text-[hsl(var(--overlay1))] border-[hsl(var(--surface0))] hover:text-[hsl(var(--text))] hover:bg-[hsl(var(--surface0))]'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Asset Grid */}
      <div className="flex-1 overflow-y-auto p-3 custom-scrollbar bg-[hsl(var(--base))]">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-48 text-[hsl(var(--overlay1))] gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
            <span className="text-xs">Finding high-resolution assets...</span>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2.5">
            {images.map((img) => (
              <div
                key={img.id}
                className="group relative rounded-lg overflow-hidden border border-[hsl(var(--surface1))] bg-[hsl(var(--crust))] shadow-xs hover:border-[hsl(var(--surface2))] transition-all"
              >
                <div className="aspect-video w-full overflow-hidden bg-[hsl(var(--mantle))]">
                  <img
                    src={img.webformatURL}
                    alt={img.tags}
                    loading="lazy"
                    crossOrigin="anonymous"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>

                {/* Subtle overlay controls */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2 backdrop-blur-[2px]">
                  <div className="text-[10px] text-white/90 truncate font-medium">
                    {img.tags.split(',')[0]}
                  </div>

                  <div className="flex items-center gap-1.5 self-end">
                    <button
                      onClick={() => copyToClipboard(img.largeImageURL, img.id)}
                      className="px-2 py-1 rounded-md text-[10px] font-medium bg-white/20 hover:bg-white/30 text-white flex items-center gap-1 transition-all"
                      title="Copy Image URL to Clipboard"
                    >
                      {copiedId === img.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>URL</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => downloadImage(img.largeImageURL, img.id)}
                      className="p-1 rounded-md bg-white/20 hover:bg-white/30 text-white transition-all"
                      title="Download image"
                    >
                      <Download className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
