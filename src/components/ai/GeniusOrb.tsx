import * as React from 'react';
import { useInRouterContext, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Volume2,
  VolumeX,
  X,
  Loader2,
  RotateCcw,
  Plus,
  Compass,
  Calculator,
  Pause,
  Mic,
  MicOff,
  Send,
  BookOpen,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNarrator } from '@/hooks/useNarrator';
import { useGenius } from '@/hooks/useGenius';
import type { GeniusCartAdapter } from '@/lib/geniusCartCommands';
import { useVoiceSession } from '@/hooks/useVoiceSession';
import { playGeniusVoice } from '@/lib/geniusVoiceChannel';
import { useOptionalShoppingCart } from '@/components/ShoppingCartProvider';
import { safeGeniusPath } from '@/lib/geniusAccess';
import { getFlipControls, turnToPageNumber } from '@/lib/flipPageRegistry';
import { clickViewportOption } from '@/lib/flipViewportReader';
import type { NarratorAction } from '@/lib/narratorStore';
import { isGeniusOpen, setGeniusOpen, subscribeGeniusPanel } from '@/lib/geniusPanelStore';
import { toast } from 'sonner';

const ACTION_ICON: Record<NarratorAction['type'], React.ComponentType<{ className?: string }>> = {
  branch: Sparkles,
  add_to_cart: Plus,
  navigate: Compass,
  calculate: Calculator,
  flip_goto: BookOpen,
  flip_next: ChevronRight,
  flip_prev: ChevronLeft,
  flip_home: BookOpen,
  flip_category: BookOpen,
  flip_product: BookOpen,
  flip_option: Sparkles,
};

/**
 * Genius — the living voice of Wonderlands, woven into FLIP V7.
 *
 * She listens by default: whenever a new leaf opens she reads it aloud at mid
 * volume and offers the next move. Arm the microphone and the guest can simply
 * talk to her — she answers from the live catalog and can take the guest to any
 * guest destination. Staff surfaces are never reachable through her.
 */
export const GeniusOrb: React.FC = () => {
  /* Genius is on by default — the panel restores open unless the guest closed it. */
  const [open, setOpenState] = React.useState<boolean>(() => isGeniusOpen());
  const setOpen = React.useCallback((next: boolean) => setGeniusOpen(next), []);
  React.useEffect(() => {
    const unsubscribe = subscribeGeniusPanel(setOpenState);
    return () => {
      unsubscribe();
    };
  }, []);
  const [draft, setDraft] = React.useState('');
  const { context, script, actions, isLoading, isSpeaking, muted, setMuted, narrate, stop, replay } = useNarrator();
  const inRouter = useInRouterContext();
  const routerNavigate = inRouter ? useNavigate() : null;
  const cart = useOptionalShoppingCart();
  const readKey = React.useRef<string | null>(null);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  /* Every spoken turn arrives through the voice session below. */
  const sendRef = React.useRef<(t: string) => void>(() => undefined);

  const go = React.useCallback(
    (to: string) => {
      const safe = safeGeniusPath(to);
      if (routerNavigate) routerNavigate(safe);
      else window.location.assign(safe);
    },
    [routerNavigate],
  );

  /* The selection, as Genius can act on it out loud. */
  const cartAdapter = React.useMemo<GeniusCartAdapter | null>(() => {
    if (!cart) return null;
    const items = cart.cartItems.map((i) => ({
      id: i.id,
      name: i.name,
      price: i.price ?? 0,
      quantity: i.quantity,
    }));
    return {
      items,
      total: cart.getCartTotal(),
      add: () => {
        if (!context?.product) return 'Open a product page and I will add it to your selection.';
        cart.addToCart({
          id: `genius-${context.key}`,
          name: context.product,
          price: context.price ?? 0,
          image: '/placeholder.svg',
          category: context.category || 'Other',
        });
        return `${context.product} is in your selection — delivery and installation included.`;
      },
      remove: (name) => {
        const needle = name.toLowerCase();
        const found = items.find((i) => i.name.toLowerCase().includes(needle));
        if (!found) return `I cannot find ${name} in your selection.`;
        cart.removeFromCart(found.id);
        return `${found.name} removed from your selection.`;
      },
      clear: () => {
        cart.clearCart();
        return 'Your selection is empty again — a clean sheet.';
      },
      checkout: () => {
        if (!items.length) return 'There is nothing to check out yet. Say "add this" on anything you like.';
        go('/checkout');
        return 'Taking you to checkout, where financing lives.';
      },
    };
  }, [cart, cart?.cartItems, context, go]);

  const genius = useGenius({ context, cart: cartAdapter });

  /* Listen mode: every new leaf is read aloud without being asked. */
  React.useEffect(() => {
    if (!context || muted) return;
    if (readKey.current === context.key) return;
    readKey.current = context.key;
    const t = window.setTimeout(() => void narrate(), 650);
    return () => window.clearTimeout(t);
  }, [context?.key, context, muted, narrate]);

  React.useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [genius.turns, genius.isThinking, script]);



  const speakReply = React.useCallback(
    (reply: string) => {
      if (!muted) void replayText(reply);
    },
    // replayText is defined below via useNarrator's speak surface
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [muted],
  );

  /* narrate() owns the voice pipeline; a spoken answer reuses it through a branch */
  const replayText = React.useCallback(
    async (text: string) => {
      // The narrate endpoint caches audio per key; conversation replies are
      // spoken through the same voice function.
      try {
        const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/narrate-voice`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ text }),
        });
        if (!res.ok) return;
        const url = URL.createObjectURL(await res.blob());
        await playGeniusVoice(url);
      } catch {
        /* voice is a bonus — the transcript still reads */
      }
    },
    [],
  );

  const send = React.useCallback(
    async (message: string) => {
      const text = message.trim();
      if (!text) return;
      setDraft('');
      setOpen(true);
      stop();
      const reply = await genius.ask(text);
      if (reply) speakReply(reply);
    },
    [genius, speakReply, stop],
  );

  React.useEffect(() => {
    sendRef.current = (text: string) => {
      void send(text);
    };
  }, [send]);

  /* The microphone: permission, press-to-talk, and the hands-free loop. */
  const mic = useVoiceSession({
    onPhrase: (text) => sendRef.current(text),
    busy: genius.isThinking,
  });

  const runAction = (action: NarratorAction) => {
    switch (action.type) {
      case 'branch':
        void send(action.payload || action.label);
        break;
      case 'navigate':
        go(action.payload || '/wonderlands-studio');
        break;
      case 'calculate':
        go(`/wonderlands-studio?tool=${encodeURIComponent(action.payload || 'pool')}`);
        break;
      case 'add_to_cart':
        if (cart && context?.product) {
          cart.addToCart({
            id: `genius-${context.key}`,
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
      /* Genius manipulating the FLIP book itself */
      case 'flip_goto': {
        const page = turnToPageNumber(Number(action.payload));
        if (!page) toast.info('That page is not in the open edition.');
        break;
      }
      /* Picking an option printed on the open spread */
      case 'flip_option': {
        const label = action.payload || action.label;
        if (!clickViewportOption(label)) toast.info(`I cannot reach ${label} from this spread.`);
        break;
      }
      case 'flip_next':
        getFlipControls()?.next();
        break;
      case 'flip_prev':
        getFlipControls()?.prev();
        break;
      case 'flip_home':
        if (getFlipControls()) getFlipControls()!.openHome();
        else go('/flip');
        break;
      case 'flip_category':
        if (action.payload && getFlipControls()) getFlipControls()!.openCategory(action.payload);
        else go('/flip');
        break;
      case 'flip_product': {
        const [categoryId, productId] = (action.payload ?? '').split(':');
        if (categoryId && productId && getFlipControls()) getFlipControls()!.openProduct(categoryId, productId);
        else go('/flip');
        break;
      }
    }
  };

  if (!context) return null;

  const chips = genius.turns.length ? genius.actions : actions;

  return (
    <>
      {/* Living medallion */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Talk to Genius about this page"
          className="fixed bottom-24 right-5 z-[9998] h-12 w-12 rounded-full border border-primary/40 bg-background/70 backdrop-blur-xl shadow-[0_8px_30px_hsl(var(--primary)/0.25)] transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <span className="absolute inset-0 rounded-full animate-ping bg-primary/20" aria-hidden />
          <span className="absolute inset-[3px] rounded-full bg-gradient-to-br from-primary/25 to-teal/20" aria-hidden />
          <Sparkles
            className={cn('relative mx-auto h-5 w-5 text-primary', isSpeaking ? 'animate-pulse' : 'animate-wiggle')}
          />
        </button>
      )}

      {/* Conversation panel */}
      {open && (
        <aside
          role="dialog"
          aria-label="Genius"
          className="fixed bottom-24 right-5 z-[9998] w-[min(94vw,23.5rem)] overflow-hidden rounded-[1.75rem] border border-primary/25 bg-gradient-to-b from-background/85 via-background/70 to-background/85 shadow-[0_40px_120px_-40px_hsl(var(--primary)/0.55)] backdrop-blur-2xl ring-1 ring-inset ring-foreground/5"
        >
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent"
          />
          <header className="flex items-center gap-2 border-b border-border/40 bg-foreground/[0.02] px-4 py-3">
            <span className="relative flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-primary/30 to-teal/20">
              <Sparkles className={cn('h-3.5 w-3.5 text-primary', isSpeaking && 'animate-pulse')} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground">Genius</p>
              <p className="truncate text-[11px] uppercase tracking-[0.14em] text-foreground">{context.title}</p>
            </div>
            <button
              onClick={() => {
                if (!muted) stop();
                setMuted(!muted);
              }}
              aria-label={muted ? 'Let Genius speak' : 'Silence Genius'}
              className="rounded-full p-1.5 text-muted-foreground transition-colors hover:text-foreground"
            >
              {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
            <button
              onClick={() => {
                stop();
                mic.stop();
                setOpen(false);
              }}
              aria-label="Close Genius"
              className="rounded-full p-1.5 text-muted-foreground transition-colors hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </header>

          <div ref={scrollRef} className="max-h-72 space-y-3 overflow-y-auto px-4 py-3">
            {isLoading && !script ? (
              <p className="flex items-center gap-2 text-[12px] text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Reading this page…
              </p>
            ) : script ? (
              <p className="font-serif text-[13.5px] leading-relaxed text-foreground">{script}</p>
            ) : null}

            {genius.turns.map((turn) => (
              <p
                key={turn.id}
                className={cn(
                  'text-[13px] leading-relaxed',
                  turn.role === 'user'
                    ? 'ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-primary/10 px-3 py-2 text-foreground'
                    : 'font-serif text-foreground',
                )}
              >
                {turn.content}
              </p>
            ))}

            {genius.isThinking && (
              <p className="flex items-center gap-2 text-[12px] text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Genius is thinking…
              </p>
            )}

            {mic.listening && (
              <p className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-primary">
                Listening…
                <span className="h-1 w-24 overflow-hidden rounded-full bg-primary/15">
                  <span
                    className="block h-full bg-primary transition-[width] duration-100"
                    style={{ width: `${Math.min(100, Math.round(mic.level * 320))}%` }}
                  />
                </span>
                {mic.partial && (
                  <span className="normal-case tracking-normal text-muted-foreground">“{mic.partial}”</span>
                )}
              </p>
            )}

            {mic.phase === 'transcribing' && (
              <p className="flex items-center gap-2 text-[12px] text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Writing down what you said…
              </p>
            )}

            {mic.permission !== 'granted' && mic.permission !== 'denied' && (
              <p className="text-[11px] text-muted-foreground">
                Genius needs your microphone to listen — press “Allow mic” and talk to her.
              </p>
            )}

            {mic.error && <p className="text-[11px] text-muted-foreground">{mic.error}</p>}

            {!genius.turns.length && (
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {[
                  'Read me this spread',
                  'What does this cost installed?',
                  'Make the pool 16 by 32',
                  'Add this to my selection',
                  'Book a consultation',
                  "What's in my selection?",
                ].map((q) => (
                  <button
                    key={q}
                    onClick={() => void send(q)}
                    className="rounded-full border border-border/50 bg-foreground/[0.03] px-2.5 py-1 text-[10px] tracking-[0.08em] text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {chips.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {chips.map((action, i) => {
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

          <form
            onSubmit={(e) => {
              e.preventDefault();
              void send(draft);
            }}
            className="flex items-center gap-1.5 border-t border-border/50 px-3 py-2.5"
          >
            <button
              type="button"
              onClick={() => (mic.permission === 'granted' ? mic.toggle() : void mic.requestPermission())}
              disabled={mic.phase === 'transcribing' || mic.permission === 'denied'}
              aria-label={
                mic.permission === 'denied'
                  ? 'Microphone blocked'
                  : mic.permission !== 'granted'
                    ? 'Allow the microphone so Genius can listen'
                    : mic.listening
                      ? 'Stop talking to Genius'
                      : 'Talk to Genius'
              }
              className={cn(
                'inline-flex shrink-0 items-center gap-1.5 rounded-full border border-primary/30 px-3 py-1.5 text-[10px] uppercase tracking-[0.16em] text-primary transition-colors hover:bg-primary/10 disabled:opacity-50',
                mic.listening && 'animate-pulse bg-primary/15 text-foreground',
              )}
            >
              {mic.listening ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
              {mic.permission === 'denied'
                ? 'Blocked'
                : mic.permission !== 'granted'
                  ? 'Allow mic'
                  : mic.listening
                    ? 'Stop'
                    : 'Talk'}
            </button>
            <button
              type="button"
              onClick={() => void mic.setHandsFree(!mic.handsFree)}
              aria-label={mic.handsFree ? 'Leave hands-free conversation' : 'Talk hands-free with Genius'}
              aria-pressed={mic.handsFree}
              className={cn(
                'shrink-0 rounded-full border px-2 py-1 text-[9px] uppercase tracking-[0.16em] transition-colors',
                mic.handsFree
                  ? 'border-primary/50 bg-primary/15 text-foreground'
                  : 'border-border/50 text-muted-foreground hover:text-foreground',
              )}
            >
              Live
            </button>
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Ask Genius anything…"
              className="min-w-0 flex-1 bg-transparent px-1 text-[12.5px] text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
            <button
              type="submit"
              disabled={!draft.trim() || genius.isThinking}
              aria-label="Send to Genius"
              className="rounded-full border border-primary/30 p-2 text-primary transition-colors hover:bg-primary/10 disabled:opacity-40"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>

          <footer className="flex items-center gap-2 border-t border-border/50 px-4 py-2">
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
            {genius.turns.length > 0 && (
              <>
                <span className="text-border">|</span>
                <button
                  onClick={genius.reset}
                  className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground"
                >
                  Clear
                </button>
              </>
            )}
          </footer>
        </aside>
      )}
    </>
  );
};

export default GeniusOrb;
