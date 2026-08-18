import * as React from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  X,
  Sparkles,
  SendHorizonal,
  Loader2,
  ChevronUp,
  Play,
  Square,
  Mic,
  MicOff,
} from "lucide-react";
import type { ConsoleEntry } from "@/components/flip/flipConsoleData";
import { useGenius } from "@/hooks/useGenius";
import { useVoiceSession } from "@/hooks/useVoiceSession";
import { safeGeniusPath } from "@/lib/geniusAccess";
import { readFlipViewport } from "@/lib/flipViewportReader";
import { getNarratorContext } from "@/lib/narratorStore";
import {
  isGeniusSpeaking,
  playGeniusVoice,
  speakGeniusText,
  stopGeniusVoice,
  subscribeGeniusVoice,
} from "@/lib/geniusVoiceChannel";

const FlipSearch = React.lazy(() => import("@/components/flip/FlipSearch"));

/**
 * SouthBar — ONE instrument docked at the south edge of a page: Genius.
 *
 * Previously this rail carried two separate tools (a search field and a chat
 * field). They are now merged into a single bar with a single typing field and
 * all of Genius' powers on it:
 *
 *   PLAY  — reads and explains whatever screen the guest is on. The script is
 *           lifted from the rendered viewport (flipViewportReader) plus the
 *           published narrator context, so it costs nothing to write; only the
 *           voice is billed, and each script's audio is cached per session.
 *   TALK  — opens the microphone for a real-time, hands-free conversation
 *           (useVoiceSession: free browser recognition first, recorded path as
 *           fallback, with an echo guard so she never records herself).
 *   FIELD — one field for everything. Enter asks Genius; the same words also
 *           seed the catalog search, which lives in the same sheet under the
 *           "Catalog" tab, so search and conversation are one tool.
 *
 * Everything opens in a single sheet above the rail so the page is never
 * buried. Behaviour comes from the existing Genius / FLIP modules — this file
 * is composition and presentation only.
 */

export interface SouthBarProps {
  /** Called when a search result is a category. Falls back to /flip navigation. */
  onOpenCategory?: (categoryId: string) => void;
  /** Called when a search result is a product. */
  onOpenProduct?: (categoryId: string, entry: ConsoleEntry) => void;
  /** Optional label shown as the rail's context stamp. */
  contextLabel?: string;
}

type Tab = "genius" | "catalog";

const FUNCTIONS_BASE = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;
const ANON = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

/** Writes the explanation of the current screen locally — no AI text cost. */
const composeScreenScript = (contextLabel: string) => {
  const read = readFlipViewport();
  const ctx = getNarratorContext();
  const parts: string[] = [];

  const title = read?.title || ctx?.title || contextLabel;
  if (title) parts.push(`You are looking at ${title}.`);
  if (ctx?.product) parts.push(`The piece open is the ${ctx.product}.`);
  else if (ctx?.category) parts.push(`This is the ${ctx.category} collection.`);
  if (ctx?.price) parts.push(`It is priced at ${ctx.price}, turn-key.`);

  read?.prose.slice(0, 3).forEach((p) => parts.push(p));
  read?.values.slice(0, 4).forEach((v) => parts.push(`${v.label}: ${v.value}.`));

  const options = read?.options.slice(0, 4).map((o) => o.label) ?? [];
  if (options.length) parts.push(`You can choose ${options.join(", ")}.`);

  if (parts.length <= 1) {
    parts.push(
      "Ask me about any piece, any finish or any price, and I will walk you through it.",
    );
  }
  parts.push("Ask me anything, or press talk and simply speak to me.");
  return parts.join(" ");
};

export const SouthBar: React.FC<SouthBarProps> = ({
  onOpenCategory,
  onOpenProduct,
  contextLabel = "Wonderlands",
}) => {
  const [open, setOpen] = React.useState(false);
  const [tab, setTab] = React.useState<Tab>("genius");
  const [draft, setDraft] = React.useState("");
  const [query, setQuery] = React.useState("");
  const navigate = useNavigate();
  const genius = useGenius();
  const scrollRef = React.useRef<HTMLDivElement>(null);

  /* ------------------------------ the voice ------------------------------ */

  const [speaking, setSpeaking] = React.useState<boolean>(() => isGeniusSpeaking());
  const [reading, setReading] = React.useState(false);
  const [transcript, setTranscript] = React.useState<string | null>(null);
  const audioCache = React.useRef<Map<string, string>>(new Map());

  React.useEffect(() => subscribeGeniusVoice(setSpeaking), []);
  React.useEffect(() => () => stopGeniusVoice(), []);

  /** Reads and explains whatever screen the guest is on. */
  const explainScreen = React.useCallback(async () => {
    const script = composeScreenScript(contextLabel);
    setTranscript(script);
    setTab("genius");
    setOpen(true);
    setReading(true);
    try {
      let url = audioCache.current.get(script);
      if (!url) {
        const res = await fetch(`${FUNCTIONS_BASE}/narrate-voice`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${ANON}` },
          body: JSON.stringify({ text: script, key: `screen::${script.slice(0, 64)}` }),
        });
        if (!res.ok) {
          /* Recorded voice unavailable — she still reads with the browser engine. */
          speakGeniusText(script);
          return;
        }
        url = URL.createObjectURL(await res.blob());
        audioCache.current.set(script, url);
      }
      const played = await playGeniusVoice(url);
      if (!played) speakGeniusText(script);
    } catch {
      stopGeniusVoice();
      speakGeniusText(script);
    } finally {
      setReading(false);
    }
  }, [contextLabel]);

  /** TALK — a real-time conversation: every finished phrase reaches Genius. */
  const voice = useVoiceSession({
    onPhrase: (text) => {
      setOpen(true);
      setTab("genius");
      void genius.ask(text);
    },
    busy: genius.isThinking,
  });

  /**
   * ONE voice control.
   *
   * Reading the screen aloud and the live microphone used to be two separate
   * buttons that could fight each other (she read while the microphone was
   * open, and LIVE never re-armed after a reading). They are now a single
   * session: press once → she explains this screen, then the microphone opens
   * and stays open for a hands-free conversation. Press again → everything
   * stops: her voice and the microphone.
   */
  const sessionOn = voice.handsFree || reading || speaking;

  const toggleVoice = React.useCallback(async () => {
    setOpen(true);
    setTab("genius");
    if (sessionOn) {
      stopGeniusVoice();
      await voice.setHandsFree(false);
      return;
    }
    /* Ask for the microphone first — the guest gesture is still live here. */
    await voice.setHandsFree(true);
    await explainScreen();
  }, [sessionOn, voice, explainScreen]);


  /* ------------------------------ the field ------------------------------ */

  React.useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [genius.turns, genius.isThinking, open, tab]);

  /* Esc closes the sheet. */
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const send = async () => {
    const text = draft.trim();
    if (!text || genius.isThinking) return;
    setQuery(text); // the same words also drive the catalog tab
    setDraft("");
    setOpen(true);
    setTab("genius");
    await genius.ask(text);
  };

  const runChip = (label: string, type?: string, payload?: string) => {
    if (type === "navigate" && payload) {
      navigate(safeGeniusPath(payload));
      return;
    }
    void genius.ask(payload || label);
  };

  const glass =
    "border border-foreground/12 bg-background/55 backdrop-blur-2xl supports-[backdrop-filter]:bg-background/40";
  const pill =
    "flex h-8 shrink-0 items-center gap-1.5 rounded-full border px-3 text-[9px] uppercase tracking-[0.22em] transition-colors";

  return (
    <>
      {/* ── One sheet, floating above the rail ─────────────────────── */}
      {open && (
        <div
          className="fixed inset-0 z-[59] bg-background/30 backdrop-blur-[2px]"
          onClick={() => setOpen(false)}
          aria-hidden
        />
      )}

      {open && (
        <section
          aria-label="Genius"
          className={`fixed bottom-[4.75rem] left-1/2 z-[61] w-[min(100vw-1.5rem,64rem)] -translate-x-1/2 rounded-2xl ${glass} shadow-[0_30px_80px_-40px_hsl(var(--foreground)/0.5)]`}
        >
          <header className="flex items-center gap-3 border-b border-foreground/10 px-4 py-2.5">
            <p className="flex items-center gap-2 text-[9px] uppercase tracking-[0.34em] text-muted-foreground">
              <Sparkles className="h-3 w-3 text-primary" /> Genius
            </p>
            <nav className="ml-2 flex items-center gap-1">
              {(["genius", "catalog"] as Tab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`rounded-full px-3 py-1 text-[9px] uppercase tracking-[0.24em] transition-colors ${
                    tab === t
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t === "genius" ? "Conversation" : "Catalog"}
                </button>
              ))}
            </nav>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close Genius"
              className="ml-auto flex h-6 w-6 items-center justify-center rounded-full border border-foreground/15 text-muted-foreground transition-colors hover:bg-foreground hover:text-background"
            >
              <X className="h-3 w-3" />
            </button>
          </header>

          {tab === "genius" ? (
            <>
              <div
                ref={scrollRef}
                className="max-h-[46vh] min-h-[7rem] space-y-2.5 overflow-y-auto px-4 py-3"
              >
                {genius.turns.length === 0 && !transcript && (
                  <p className="py-4 text-center text-[11px] leading-relaxed text-muted-foreground">
                    Press play and I will explain this screen — or talk to me and ask for a
                    price, a finish, a design change, or an appointment.
                  </p>
                )}
                {transcript && genius.turns.length === 0 && (
                  <div className="mr-auto max-w-[85%] rounded-xl border border-foreground/10 bg-foreground/[0.04] px-3 py-2 text-[12px] leading-relaxed text-foreground/90">
                    {transcript}
                  </div>
                )}
                {genius.turns.map((t) => (
                  <div
                    key={t.id}
                    className={`max-w-[85%] rounded-xl px-3 py-2 text-[12px] leading-relaxed ${
                      t.role === "user"
                        ? "ml-auto border border-primary/30 bg-primary/10 text-foreground"
                        : "mr-auto border border-foreground/10 bg-foreground/[0.04] text-foreground/90"
                    }`}
                  >
                    {t.content}
                  </div>
                ))}
                {voice.partial && (
                  <div className="ml-auto max-w-[85%] rounded-xl border border-primary/20 px-3 py-2 text-[12px] italic leading-relaxed text-muted-foreground">
                    {voice.partial}
                  </div>
                )}
                {genius.isThinking && (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                )}
              </div>

              {(genius.actions.length > 0 || voice.error) && (
                <div className="flex flex-wrap items-center gap-1.5 border-t border-foreground/10 px-4 py-2.5">
                  {genius.actions.slice(0, 4).map((a, i) => (
                    <button
                      key={`${a.label}-${i}`}
                      onClick={() =>
                        runChip(a.label, a.type, typeof a.payload === "string" ? a.payload : undefined)
                      }
                      className="rounded-full border border-foreground/15 px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
                    >
                      {a.label}
                    </button>
                  ))}
                  {voice.error && (
                    <span className="ml-auto text-[10px] tracking-[0.08em] text-muted-foreground">
                      {voice.error}
                    </span>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="max-h-[58vh] overflow-y-auto p-3 md:p-4">
              <React.Suspense
                fallback={
                  <Loader2 className="mx-auto my-8 h-4 w-4 animate-spin text-muted-foreground" />
                }
              >
                <FlipSearch
                  autoFocus
                  initialQuery={query}
                  onOpenCategory={(id) => {
                    setOpen(false);
                    if (onOpenCategory) onOpenCategory(id);
                    else navigate(`/flip?category=${encodeURIComponent(id)}`);
                  }}
                  onOpenProduct={(categoryId, found) => {
                    setOpen(false);
                    if (onOpenProduct) onOpenProduct(categoryId, found);
                    else navigate(`/flip?category=${encodeURIComponent(categoryId)}`);
                  }}
                />
              </React.Suspense>
            </div>
          )}
        </section>
      )}

      {/* ── The rail itself — one bar, one tool ────────────────────── */}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex justify-center px-3 pb-3">
        <div
          className={`pointer-events-auto flex w-full max-w-[min(100%,120rem)] items-center gap-2 rounded-2xl px-3 py-2.5 shadow-[0_-10px_60px_-30px_hsl(var(--foreground)/0.45)] sm:gap-3 sm:px-4 ${glass}`}
        >
          {/* ONE voice control — she explains this screen, then listens live */}
          <button
            onClick={() => void toggleVoice()}
            aria-label={
              sessionOn ? "Stop Genius' voice and microphone" : "Genius: explain this screen and listen"
            }
            aria-pressed={sessionOn}
            className={`${pill} ${
              sessionOn
                ? "border-primary/60 bg-primary/15 text-foreground"
                : "border-foreground/15 text-muted-foreground hover:border-primary/40 hover:text-foreground"
            }`}
          >
            {reading || voice.phase === "transcribing" || genius.isThinking ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
            ) : sessionOn ? (
              <Square className="h-3 w-3 text-primary" />
            ) : (
              <Play className="h-3 w-3 text-primary" />
            )}
            {sessionOn && voice.listening && <Mic className="h-3 w-3 animate-pulse text-primary" />}
            <span className="hidden sm:inline">
              {!sessionOn
                ? "Genius Live"
                : speaking
                  ? "Speaking"
                  : voice.phase === "listening"
                    ? "Listening"
                    : voice.phase === "transcribing" || genius.isThinking
                      ? "Thinking"
                      : "Live"}
            </span>
          </button>


          <span className="hidden h-6 w-px bg-foreground/10 sm:block" />

          {/* ONE field — ask, or search the catalog with the same words */}
          <div className="flex min-w-0 flex-1 items-center gap-2 rounded-full border border-foreground/12 bg-foreground/[0.03] px-3.5 py-1.5 focus-within:border-primary/40">
            <Sparkles className="h-3.5 w-3.5 shrink-0 text-primary" />
            <input
              value={draft}
              onChange={(e) => {
                setDraft(e.target.value);
                setQuery(e.target.value);
              }}
              onFocus={() => {
                setOpen(true);
                setTab("genius");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") void send();
              }}
              placeholder="Ask Genius anything — or search pools, finishes, features…"
              aria-label="Ask Genius or search"
              className="min-w-0 flex-1 bg-transparent py-1 text-[12px] text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
            {/* the same words, shown as catalog results */}
            <button
              onClick={() => {
                setQuery(draft.trim() || query);
                setTab("catalog");
                setOpen(true);
              }}
              aria-label="Show catalog results"
              className="hidden h-7 w-7 shrink-0 items-center justify-center rounded-full border border-foreground/15 text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground sm:flex"
            >
              <Search className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => void send()}
              disabled={!draft.trim() || genius.isThinking}
              aria-label="Send message"
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/70 text-primary-foreground transition-opacity disabled:opacity-35"
            >
              {genius.isThinking ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <SendHorizonal className="h-3.5 w-3.5" />
              )}
            </button>
          </div>

          {/* context stamp — desktop only, keeps the rail elegant */}
          <span className="hidden shrink-0 items-center gap-2 text-[9px] uppercase tracking-[0.32em] text-muted-foreground lg:flex">
            <span className="h-1 w-1 rounded-full bg-primary" />
            {contextLabel}
            <ChevronUp
              className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`}
            />
          </span>
        </div>
      </div>
    </>
  );
};

export default SouthBar;
