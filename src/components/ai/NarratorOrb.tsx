import * as React from 'react';
import { useInRouterContext, useNavigate } from 'react-router-dom';
import { Sparkles, Volume2, VolumeX, X, Loader2, RotateCcw, Plus, Compass, Calculator, Pause } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNarrator } from '@/hooks/useNarrator';
import { useOptionalShoppingCart } from '@/components/ShoppingCartProvider';
import type { NarratorAction } from '@/lib/narratorStore';
import { toast } from 'sonner';

const ACTION_ICON: Record<NarratorAction['type'], React.ComponentType<{ className?: string }>> = {
  branch: Sparkles,
  add_to_cart: Plus,
  navigate: Compass,
  calculate: Calculator,
};

/**
 * FLIP V7 — the Narrated Edition.
 * A discreet living medallion in the corner. It breathes, it reads the page the
 * guest is on, and it offers the next move.
 */
export const NarratorOrb: React.FC = () => {
  const [open, setOpen] = React.useState(false);
  const { context, script, actions, isLoading, isSpeaking, muted, setMuted, narrate, stop, replay } = useNarrator();
  const inRouter = useInRouterContext();
  const routerNavigate = inRouter ? useNavigate() : null;
  const cart = useOptionalShoppingCart();

  const go = React.useCallback(
    (to: string) => {
      if (routerNavigate) routerNavigate(to);
      else window.location.assign(to);
    },
    [routerNavigate],
  );

  const handleOpen = () => {
    setOpen(true);
    if (!script && !isLoading) void narrate();
  };

  const runAction = (action: NarratorAction) => {
    switch (action.type) {
      case 'branch':
        void narrate({ branch: action.payload || action.label });
        break;
      case 'navigate':
        go(action.payload?.startsWith('/') ? action.payload : '/wonderlands-studio');
        break;
      case 'calculate':
        go(`/wonderlands-studio?tool=${encodeURIComponent(action.payload || 'pool')}`);
        break;
      case 'add_to_cart':
        if (cart && context?.product) {
          cart.addToCart({
            id: `narrator-${context.key}`,
            name: context.product,
            price: context.price ?? 0,
            image: '/placeholder.svg',
            category: context.category || 'Other',
          });
          toast.success(`${context.product} added to your selection`);
        } else {
          toast.info('Open a product page to add it to your selection.');
        }
        break;
    }
  };

  if (!context) return null;

  return (
    <>
      {/* Living medallion */}
      {!open && (
        <button
          onClick={handleOpen}
          aria-label="Ask the Wonderlands narrator about this page"
          className="fixed bottom-5 right-5 z-[9998] h-12 w-12 rounded-full border border-primary/40 bg-background/70 backdrop-blur-xl shadow-[0_8px_30px_hsl(var(--primary)/0.25)] transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <span className="absolute inset-0 rounded-full animate-ping bg-primary/20" aria-hidden />
          <span className="absolute inset-[3px] rounded-full bg-gradient-to-br from-primary/25 to-teal/20" aria-hidden />
          <Sparkles
            className={cn(
              'relative mx-auto h-5 w-5 text-primary',
              isSpeaking ? 'animate-pulse' : 'animate-wiggle',
            )}
          />
        </button>
      )}

      {/* Reading panel */}
      {open && (
        <aside
          role="dialog"
          aria-label="Wonderlands narrator"
          className="fixed bottom-5 right-5 z-[9998] w-[min(92vw,22rem)] overflow-hidden rounded-2xl border border-primary/25 bg-background/80 shadow-2xl backdrop-blur-2xl"
        >
          <header className="flex items-center gap-2 border-b border-border/50 px-4 py-3">
            <span className="relative flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-primary/30 to-teal/20">
              <Sparkles className={cn('h-3.5 w-3.5 text-primary', isSpeaking && 'animate-pulse')} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground">Narrator</p>
              <p className="truncate text-[11px] uppercase tracking-[0.14em] text-foreground">{context.title}</p>
            </div>
            <button
              onClick={() => setMuted(!muted)}
              aria-label={muted ? 'Enable narration voice' : 'Mute narration voice'}
              className="rounded-full p-1.5 text-muted-foreground transition-colors hover:text-foreground"
            >
              {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
            <button
              onClick={() => {
                stop();
                setOpen(false);
              }}
              aria-label="Close narrator"
              className="rounded-full p-1.5 text-muted-foreground transition-colors hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </header>

          <div className="max-h-72 overflow-y-auto px-4 py-3">
            {isLoading && !script ? (
              <p className="flex items-center gap-2 text-[12px] text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Reading this page…
              </p>
            ) : script ? (
              <p className="font-serif text-[13.5px] leading-relaxed text-foreground">{script}</p>
            ) : (
              <p className="text-[12px] text-muted-foreground">Nothing to read on this page yet.</p>
            )}

            {actions.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {actions.map((action, i) => {
                  const Icon = ACTION_ICON[action.type];
                  return (
                    <button
                      key={`${action.label}-${i}`}
                      onClick={() => runAction(action)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/5 px-3 py-1.5 text-[10px] uppercase tracking-[0.14em] text-foreground transition-colors hover:bg-primary/15"
                    >
                      <Icon className="h-3 w-3 text-primary" />
                      {action.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <footer className="flex items-center gap-2 border-t border-border/50 px-4 py-2.5">
            <button
              onClick={() => (isSpeaking ? stop() : replay())}
              disabled={!script || muted}
              className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
            >
              {isSpeaking ? <Pause className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
              {isSpeaking ? 'Pause' : 'Listen'}
            </button>
            <span className="text-border">|</span>
            <button
              onClick={() => void narrate()}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
            >
              <RotateCcw className="h-3 w-3" /> Read again
            </button>
          </footer>
        </aside>
      )}
    </>
  );
};

export default NarratorOrb;
