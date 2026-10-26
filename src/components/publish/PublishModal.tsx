import { Button } from '@/components/ui/button';
import { X, Rocket, Sparkles, Bell, CheckCircle2 } from 'lucide-react';

interface PublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPublish?: (details: { name: string; description: string; category: string }) => Promise<void>;
}

export const PublishModal = ({ isOpen, onClose }: PublishModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fade-in">
      <div className="bg-[hsl(var(--crust))]/95 border border-[hsl(var(--surface1))] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[hsl(var(--surface1))]/70 bg-[hsl(var(--surface0))]/30">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-500/15 flex items-center justify-center text-blue-400 border border-blue-500/20">
              <Rocket className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[hsl(var(--text))]">One-Click Web Publishing</h2>
              <p className="text-[10px] text-[hsl(var(--overlay1))]">Cloud hosting & live custom domains</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[hsl(var(--overlay1))] hover:text-white hover:bg-[hsl(var(--surface0))] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Card Body */}
        <div className="p-6 text-center space-y-5">
          <div className="relative mx-auto w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600/20 via-indigo-500/20 to-purple-500/20 border border-blue-500/30 flex items-center justify-center shadow-lg shadow-blue-500/10">
            <Sparkles className="w-8 h-8 text-blue-400 animate-pulse" />
            <span className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-blue-500 text-white tracking-wider uppercase shadow-sm">
              Soon
            </span>
          </div>

          <div>
            <h3 className="text-base font-bold text-[hsl(var(--text))] mb-1.5">
              Publishing Feature Coming Soon
            </h3>
            <p className="text-xs text-[hsl(var(--overlay1))] leading-relaxed max-w-xs mx-auto">
              We are currently optimizing global edge deployment with SSL certificates, instant live URLs, and custom domain mapping for your projects.
            </p>
          </div>

          {/* Planned Features List */}
          <div className="text-left bg-[hsl(var(--surface0))]/40 border border-[hsl(var(--surface1))]/60 rounded-xl p-3.5 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-[hsl(var(--text))]">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span>Instant Edge CDN hosting with zero setup</span>
            </div>
            <div className="flex items-center gap-2 text-[hsl(var(--text))]">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span>Automatic SSL certificates on custom domains</span>
            </div>
            <div className="flex items-center gap-2 text-[hsl(var(--text))]">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span>Free `.hrdk.pen` shareable live preview URLs</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="text-xs border-[hsl(var(--surface1))] bg-[hsl(var(--surface0))]/60 text-[hsl(var(--text))] hover:bg-[hsl(var(--surface1))]"
            >
              Got it
            </Button>
            <Button
              type="button"
              onClick={onClose}
              className="text-xs bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-sm shadow-blue-600/30 gap-1.5"
            >
              <Bell className="w-3.5 h-3.5" />
              Notify Me
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
