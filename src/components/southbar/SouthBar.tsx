import * as React from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, Sparkles, SendHorizonal, Loader2, ChevronUp } from "lucide-react";
import type { ConsoleEntry } from "@/components/flip/flipConsoleData";
import { useGenius } from "@/hooks/useGenius";
import { safeGeniusPath } from "@/lib/geniusAccess";

const FlipSearch = React.lazy(() => import("@/components/flip/FlipSearch"));

/**
 * SouthBar — the long glassmorphic bar docked at the south edge of a page.
 *
 * Two instruments on one rail:
 *   left  — the FLIP search engine (results open in place through the callbacks)
 *   right — a minimal Genius chatbox (local brain first, so most turns are free)
 *
 * Each instrument opens its own sheet *above* the rail; only one is open at a
 * time so the page below is never buried. Everything is presentation only —
 * search and chat behaviour come from the existing FLIP / Genius modules.
 */

export interface SouthBarProps {
  /** Called when a search result is a category. Falls back to /flip navigation. */
  onOpenCategory?: (categoryId: string) => void;
  /** Called when a search result is a product. */
  onOpenProduct?: (categoryId: string, entry: ConsoleEntry) => void;
  /** Optional label shown as the rail's context stamp. */
  contextLabel?: string;
}

type Panel = "none" | "search" | "chat";

export const SouthBar: React.FC<SouthBarProps> = ({
  onOpenCategory,
  onOpenProduct,
  contextLabel = "Wonderlands",
}) => {
  const [panel, setPanel] = React.useState<Panel>("none");
  const [draft, setDraft] = React.useState("");
  const navigate = useNavigate();
  const genius = useGenius();
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [genius.turns, genius.isThinking]);

  /* Esc always closes the open sheet. */
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPanel("none");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const send = async () => {
    const text = draft.trim();
    if (!text || genius.isThinking) return;
    setDraft("");
    setPanel("chat");
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

  return (
    <>
      {/* ── Sheets, floating above the rail ─────────────────────────── */}
      {panel !== "none" && (
        <div
          className="fixed inset-0 z-[59] bg-background/30 backdrop-blur-[2px]"
          onClick={() => setPanel("none")}
          aria-hidden
        />
      )}

      {panel === "search" && (
        <section
          aria-label="Search"
          className={`fixed bottom-[4.75rem] left-1/2 z-[61] w-[min(100vw-1.5rem,64rem)] -translate-x-1/2 rounded-2xl ${glass} shadow-[0_30px_80px_-40px_hsl(var(--foreground)/0.5)]`}
        >
          <header className="flex items-center justify-between border-b border-foreground/10 px-4 py-2.5">
            <p className="text-[9px] uppercase tracking-[0.34em] text-muted-foreground">
              Search engine
            </p>
            <button
              onClick={() => setPanel("none")}
              aria-label="Close search"
              className="flex h-6 w-6 items-center justify-center rounded-full border border-foreground/15 text-muted-foreground transition-colors hover:bg-foreground hover:text-background"
            >
              <X className="h-3 w-3" />
            </button>
          </header>
          <div className="max-h-[58vh] overflow-y-auto p-3 md:p-4">
            <React.Suspense
              fallback={<Loader2 className="mx-auto my-8 h-4 w-4 animate-spin text-muted-foreground" />}
            >
              <FlipSearch
                autoFocus
                onOpenCategory={(id) => {
                  setPanel("none");
                  if (onOpenCategory) onOpenCategory(id);
                  else navigate(`/flip?category=${encodeURIComponent(id)}`);
                }}
                onOpenProduct={(categoryId, found) => {
                  setPanel("none");
                  if (onOpenProduct) onOpenProduct(categoryId, found);
                  else navigate(`/flip?category=${encodeURIComponent(categoryId)}`);
                }}
              />
            </React.Suspense>
          </div>
        </section>
      )}

      {panel === "chat" && (
        <section
          aria-label="Genius chat"
          className={`fixed bottom-[4.75rem] left-1/2 z-[61] w-[min(100vw-1.5rem,44rem)] -translate-x-1/2 rounded-2xl ${glass} shadow-[0_30px_80px_-40px_hsl(var(--foreground)/0.5)]`}
        >
          <header className="flex items-center justify-between border-b border-foreground/10 px-4 py-2.5">
            <p className="flex items-center gap-2 text-[9px] uppercase tracking-[0.34em] text-muted-foreground">
              <Sparkles className="h-3 w-3 text-primary" /> Genius
            </p>
            <button
              onClick={() => setPanel("none")}
              aria-label="Close chat"
              className="flex h-6 w-6 items-center justify-center rounded-full border border-foreground/15 text-muted-foreground transition-colors hover:bg-foreground hover:text-background"
            >
              <X className="h-3 w-3" />
            </button>
          </header>

          <div ref={scrollRef} className="max-h-[46vh] min-h-[7rem] space-y-2.5 overflow-y-auto px-4 py-3">
            {genius.turns.length === 0 && (
              <p className="py-4 text-center text-[11px] leading-relaxed text-muted-foreground">
                Ask anything — a price, a finish, a design change, or an appointment.
              </p>
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
            {genius.isThinking && (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
            )}
          </div>

          {genius.actions.length > 0 && (
            <div className="flex flex-wrap gap-1.5 border-t border-foreground/10 px-4 py-2.5">
              {genius.actions.slice(0, 4).map((a, i) => (
                <button
                  key={`${a.label}-${i}`}
                  onClick={() => runChip(a.label, a.type, typeof a.payload === "string" ? a.payload : undefined)}
                  className="rounded-full border border-foreground/15 px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
                >
                  {a.label}
                </button>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ── The rail itself ─────────────────────────────────────────── */}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex justify-center px-3 pb-3">
        <div
          className={`pointer-events-auto flex w-full max-w-[min(100%,120rem)] flex-col gap-2 rounded-2xl px-3 py-2.5 shadow-[0_-10px_60px_-30px_hsl(var(--foreground)/0.45)] sm:flex-row sm:items-center sm:gap-3 sm:px-4 ${glass}`}
        >
          {/* context stamp — desktop only, keeps the rail elegant */}
          <span className="hidden shrink-0 items-center gap-2 text-[9px] uppercase tracking-[0.32em] text-muted-foreground lg:flex">
            <span className="h-1 w-1 rounded-full bg-primary" />
            {contextLabel}
          </span>

          {/* search */}
          <button
            onClick={() => setPanel(panel === "search" ? "none" : "search")}
            className="group flex min-w-0 flex-1 items-center gap-2.5 rounded-full border border-foreground/12 bg-foreground/[0.03] px-3.5 py-2 text-left transition-colors hover:border-primary/40 hover:bg-foreground/[0.06]"
          >
            <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground group-hover:text-primary" />
            <span className="truncate text-[11px] tracking-[0.08em] text-muted-foreground">
              Search pools, finishes, features…
            </span>
            <ChevronUp
              className={`ml-auto hidden h-3 w-3 shrink-0 text-muted-foreground transition-transform sm:block ${
                panel === "search" ? "rotate-180" : ""
              }`}
            />
          </button>

          <span className="hidden h-6 w-px bg-foreground/10 sm:block" />

          {/* chat */}
          <div className="flex min-w-0 flex-1 items-center gap-2 rounded-full border border-foreground/12 bg-foreground/[0.03] px-3.5 py-1.5 focus-within:border-primary/40">
            <Sparkles className="h-3.5 w-3.5 shrink-0 text-primary" />
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onFocus={() => setPanel("chat")}
              onKeyDown={(e) => {
                if (e.key === "Enter") void send();
              }}
              placeholder="Ask Genius…"
              aria-label="Ask Genius"
              className="min-w-0 flex-1 bg-transparent py-1 text-[12px] text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
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
        </div>
      </div>
    </>
  );
};

export default SouthBar;
