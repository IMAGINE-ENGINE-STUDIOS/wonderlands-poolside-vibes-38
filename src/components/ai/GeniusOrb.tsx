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
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNarrator } from '@/hooks/useNarrator';
import { useGenius } from '@/hooks/useGenius';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import { useOptionalShoppingCart } from '@/components/ShoppingCartProvider';
import { safeGeniusPath } from '@/lib/geniusAccess';
import type { NarratorAction } from '@/lib/narratorStore';
import { toast } from 'sonner';

const ACTION_ICON: Record<NarratorAction['type'], React.ComponentType<{ className?: string }>> = {
  branch: Sparkles,
  add_to_cart: Plus,
  navigate: Compass,
  calculate: Calculator,
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
  const [open, setOpen] = React.useState(false);
  const [draft, setDraft] = React.useState('');
  const { context, script, actions, isLoading, isSpeaking, muted, setMuted, narrate, stop, replay } = useNarrator();
  const genius = useGenius();
  const voice = useVoiceInput();
  const inRouter = useInRouterContext();
  const routerNavigate = inRouter ? useNavigate() : null;
  const cart = useOptionalShoppingCart();
  const readKey = React.useRef<string | null>(null);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const go = React.useCallback(
    (to: string) => {
      const safe = safeGeniusPath(to);
      if (routerNavigate) routerNavigate(safe);
      else window.location.assign(safe);
    },
    [routerNavigate],
  );

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

  const cartSummary = React.useMemo(() => {
    if (!cart?.cartItems?.length) return undefined;
    return cart.cartItems.map((i) => `${i.name} ($${(i.price ?? 0).toLocaleString()})`).join(', ');
  }, [cart?.cartItems]);


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
        const audio = new Audio(url);
        audio.volume = 0.55;
        void audio.play();
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
      const reply = await genius.ask(text, cartSummary);
      if (reply) speakReply(reply);
    },
    [genius, cartSummary, speakReply, stop],
  );

  /* Real-time talking: a finished phrase is sent to Genius immediately. */
  React.useEffect(() => {
    if (voice.transcript && !voice.isListening) {
      const said = voice.transcript;
      voice.resetTranscript();
      void send(said);
    }
  }, [voice.transcript, voice.isListening, voice.resetTranscript, send]);

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
          className="fixed bottom-24 right-5 z-[9998] w-[min(92vw,22rem)] overflow-hidden rounded-2xl border border-primary/25 bg-background/80 shadow-2xl backdrop-blur-2xl"
        >
          <header className="flex items-center gap-2 border-b border-border/50 px-4 py-3">
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
                if (voice.isListening) voice.stopListening();
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

            {voice.isListening && (
              <p className="text-[11px] uppercase tracking-[0.2em] text-primary">
                Listening… {voice.interimTranscript && <span className="normal-case tracking-normal text-muted-foreground">“{voice.interimTranscript}”</span>}
              </p>
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
            {voice.isSupported && (
              <button
                type="button"
                onClick={() => (voice.isListening ? voice.stopListening() : voice.startListening())}
                aria-label={voice.isListening ? 'Stop talking to Genius' : 'Talk to Genius'}
                className={cn(
                  'rounded-full border border-primary/30 p-2 text-primary transition-colors hover:bg-primary/10',
                  voice.isListening && 'animate-pulse bg-primary/15',
                )}
              >
                {voice.isListening ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
              </button>
            )}
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
