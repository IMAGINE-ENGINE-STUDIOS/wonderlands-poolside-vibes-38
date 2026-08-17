import * as React from "react";
import { Play, Square, Calendar, Phone, MapPin, MessageCircle, Loader2 } from "lucide-react";
import { useBoardEstimate, useProjectSpecs } from "@/components/flip/FlipBoardPanels";
import { useShoppingCart } from "@/components/ShoppingCartProvider";
import type { ConfiguredProduct } from "@/components/quote/QuoteStudioConfigurator";
import { playGeniusVoice, stopGeniusVoice, subscribeGeniusVoice } from "@/lib/geniusVoiceChannel";
import { setGeniusOpen } from "@/lib/geniusPanelStore";
import { SCHEDULE_LINK } from "@/lib/geniusBooking";

/**
 * Customer project summary — previously printed as "Pool & site plan".
 *
 * WHAT CHANGED AND WHY
 * Every figure the guest has already produced elsewhere on the page now feeds a
 * single narrated summary:
 *   • the configured piece (name, base price, every selected feature) — from the
 *     Quote Atelier configurator, passed in as `product`;
 *   • everything on the shopping list — from `useShoppingCart`;
 *   • the drawn take-off and engineering specifications — from the shared FLIP
 *     board hooks (`useBoardEstimate`, `useProjectSpecs`), the same source the
 *     calculators and the cost leaf read.
 *
 * The narration text is written locally (no paid text calls); the voice clip is
 * the only billed step and is cached in the narrations library by key, so the
 * same summary is never generated twice. Styling follows FLIP V7: thin rules,
 * serif display, glassmorphic controls.
 */

const OFFICE_ADDRESS =
  "6900 Tavistock Lakes Boulevard Southeast, Suite 400, Lake Nona Center, Orlando, FL 32827";
const OFFICE_MAP = `https://maps.google.com/?q=${encodeURIComponent(OFFICE_ADDRESS)}`;
const PHONE = "+14077604873";
const PHONE_LABEL = "+1 (407) 760-4873";

const FUNCTIONS_BASE = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;
const ANON = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

const money = (n: number) => `$${Math.round(n).toLocaleString()}`;

type Props = {
  /** Board/console category the drawing and specifications belong to. */
  categoryId: string;
  /** The piece currently open in the configurator, when there is one. */
  product?: ConfiguredProduct | null;
};

export const CustomerProjectSummary: React.FC<Props> = ({ categoryId, product }) => {
  const { cartItems } = useShoppingCart();
  const { areaSqFt, runFt, poolSqFt, total: drawnTotal } = useBoardEstimate(categoryId);
  const { specs, schedule } = useProjectSpecs(categoryId);

  const [speaking, setSpeaking] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [transcript, setTranscript] = React.useState<string | null>(null);
  React.useEffect(() => subscribeGeniusVoice(setSpeaking), []);
  React.useEffect(() => () => stopGeniusVoice(), []);

  /* --------------------------- the linked figures --------------------------- */

  const selections = React.useMemo(
    () => (product?.extras ?? []).filter((e) => e.name),
    [product],
  );

  const listTotal = React.useMemo(
    () => cartItems.reduce((sum, i) => sum + i.price * (i.quantity || 1), 0),
    [cartItems],
  );

  const investment = (product?.total ?? 0) + listTotal;

  /* ------------------------------ the reading ------------------------------ */

  /** Written locally, a few seconds long, and always about the guest's own project. */
  const script = React.useMemo(() => {
    const parts: string[] = [];
    if (product) {
      parts.push(`Your project is the ${product.name}, a ${product.category.toLowerCase()} at ${money(product.total)}.`);
    } else if (cartItems.length) {
      parts.push(`Your project brings together ${cartItems.length} pieces from the collection.`);
    } else {
      parts.push("Draw the plan or choose a piece and I will summarise the whole project for you.");
    }
    if (poolSqFt > 0) parts.push(`As drawn, the shell measures ${poolSqFt.toLocaleString()} square feet.`);
    if (areaSqFt > poolSqFt) {
      parts.push(`with ${(areaSqFt - poolSqFt).toLocaleString()} square feet of deck around it.`);
    }
    if (runFt > 0) parts.push(`The barrier runs ${runFt.toLocaleString()} linear feet.`);
    if (selections.length) {
      const named = selections.slice(0, 3).map((e) => e.selectedOption || e.name);
      parts.push(`You selected ${named.join(", ")}${selections.length > 3 ? ", and more" : ""}.`);
    }
    if (investment > 0) parts.push(`Everything is turn-key, delivered and installed, at ${money(investment)}.`);
    parts.push("Payment follows twenty, thirty-five, forty and ten percent as the work completes.");
    parts.push("Would you like to ask me a question, book an appointment, or visit the office?");
    return parts.join(" ");
  }, [product, cartItems.length, poolSqFt, areaSqFt, runFt, selections, investment]);

  const voiceKey = React.useMemo(
    () => `project-summary::${categoryId}::${product?.id ?? "list"}::${Math.round(investment)}::${poolSqFt}::${areaSqFt}::${runFt}`,
    [categoryId, product?.id, investment, poolSqFt, areaSqFt, runFt],
  );

  const audioRef = React.useRef<Map<string, string>>(new Map());

  const play = React.useCallback(async () => {
    if (speaking) {
      stopGeniusVoice();
      return;
    }
    setTranscript(script);
    setLoading(true);
    try {
      let url = audioRef.current.get(voiceKey);
      if (!url) {
        const res = await fetch(`${FUNCTIONS_BASE}/narrate-voice`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${ANON}` },
          body: JSON.stringify({ text: script, key: voiceKey }),
        });
        if (!res.ok) return; // the transcript still reads — the voice is a bonus
        url = URL.createObjectURL(await res.blob());
        audioRef.current.set(voiceKey, url);
      }
      await playGeniusVoice(url);
    } catch {
      stopGeniusVoice();
    } finally {
      setLoading(false);
    }
  }, [script, voiceKey, speaking]);

  /* -------------------------------- the sheet ------------------------------- */

  const figures: { label: string; value: string }[] = [];
  if (product) figures.push({ label: "Piece", value: `${product.name} — ${product.category}` });
  if (poolSqFt > 0) figures.push({ label: "Shell as drawn", value: `${poolSqFt.toLocaleString()} sq ft` });
  if (areaSqFt > poolSqFt)
    figures.push({ label: "Deck & hardscape", value: `${(areaSqFt - poolSqFt).toLocaleString()} sq ft` });
  if (runFt > 0) figures.push({ label: "Barrier", value: `${runFt.toLocaleString()} linear ft` });
  if (drawnTotal > 0) figures.push({ label: "Priced as drawn", value: money(drawnTotal) });
  if (product) figures.push({ label: "Configured piece", value: money(product.total) });
  if (listTotal > 0) figures.push({ label: "Shopping list", value: money(listTotal) });
  if (investment > 0) figures.push({ label: "Project investment", value: money(investment) });

  return (
    <div className="border-b border-border/60 bg-background/60 backdrop-blur-xl">
      {/* Genius — one play button explains the whole project in a few seconds */}
      <div className="flex flex-wrap items-center gap-4 border-b border-border/50 px-5 py-5">
        <button
          onClick={play}
          aria-label={speaking ? "Stop the summary" : "Play the project summary"}
          className="group relative flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-foreground/25 bg-foreground/5 backdrop-blur-2xl transition-all hover:border-foreground/60 hover:bg-foreground/10"
        >
          <span className="absolute inset-0 rounded-full ring-1 ring-inset ring-foreground/10" />
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin text-foreground" />
          ) : speaking ? (
            <Square className="h-4 w-4 text-foreground" />
          ) : (
            <Play className="ml-0.5 h-5 w-5 text-foreground" />
          )}
        </button>
        <div className="min-w-0">
          <p className="text-[9px] uppercase tracking-[0.4em] text-muted-foreground">Genius reads your project</p>
          <p className="mt-1 font-serif text-lg font-light leading-snug text-foreground">
            {speaking ? "Listening in — press again to stop" : "Press play — the whole project in a few seconds"}
          </p>
        </div>
        <div className="ml-auto flex flex-wrap gap-2">
          <button
            onClick={() => setGeniusOpen(true)}
            className="inline-flex items-center gap-2 border border-border/60 bg-background/50 px-3 py-1.5 text-[8px] uppercase tracking-[0.3em] backdrop-blur-md transition-colors hover:bg-foreground hover:text-background"
          >
            <MessageCircle className="h-3 w-3" /> Ask a question
          </button>
          <button
            onClick={() => window.open(SCHEDULE_LINK, "_blank", "noopener")}
            className="inline-flex items-center gap-2 border border-border/60 bg-background/50 px-3 py-1.5 text-[8px] uppercase tracking-[0.3em] backdrop-blur-md transition-colors hover:bg-foreground hover:text-background"
          >
            <Calendar className="h-3 w-3" /> Appointment
          </button>
          <a
            href={`tel:${PHONE}`}
            className="inline-flex items-center gap-2 border border-border/60 bg-background/50 px-3 py-1.5 text-[8px] uppercase tracking-[0.3em] backdrop-blur-md transition-colors hover:bg-foreground hover:text-background"
          >
            <Phone className="h-3 w-3" /> Call {PHONE_LABEL}
          </a>
          <a
            href={OFFICE_MAP}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 border border-border/60 bg-background/50 px-3 py-1.5 text-[8px] uppercase tracking-[0.3em] backdrop-blur-md transition-colors hover:bg-foreground hover:text-background"
          >
            <MapPin className="h-3 w-3" /> Office visit
          </a>
        </div>
      </div>

      {transcript && (
        <p className="border-b border-border/50 px-5 py-3 text-[11px] leading-relaxed text-foreground/80">
          {transcript}
        </p>
      )}

      <div className="grid gap-0 md:grid-cols-2">
        {/* The linked figures */}
        <div className="border-b border-border/50 px-5 py-4 md:border-b-0 md:border-r">
          <p className="text-[9px] uppercase tracking-[0.34em] text-muted-foreground">Your project, as configured</p>
          {figures.length ? (
            <dl className="mt-3">
              {figures.map((f) => (
                <div key={f.label} className="flex items-baseline justify-between gap-3 border-t border-border/50 py-1.5">
                  <dt className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{f.label}</dt>
                  <dd className="text-[11px] text-foreground">{f.value}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="mt-3 text-[11px] text-muted-foreground">
              Choose a piece or draw the plan — the summary fills itself in.
            </p>
          )}

          {selections.length > 0 && (
            <>
              <p className="mt-5 text-[9px] uppercase tracking-[0.34em] text-muted-foreground">Selections</p>
              <ul className="mt-2">
                {selections.map((e, i) => (
                  <li
                    key={`${e.key ?? e.name}-${i}`}
                    className="flex items-baseline justify-between gap-3 border-t border-border/50 py-1.5"
                  >
                    <span className="text-[11px] text-foreground/85">{e.selectedOption || e.name}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {e.price > 0 ? money(e.price * (e.quantity || 1)) : "Standard"}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}

          {cartItems.length > 0 && (
            <>
              <p className="mt-5 text-[9px] uppercase tracking-[0.34em] text-muted-foreground">On your shopping list</p>
              <ul className="mt-2">
                {cartItems.map((i) => (
                  <li key={i.id} className="flex items-baseline justify-between gap-3 border-t border-border/50 py-1.5">
                    <span className="text-[11px] text-foreground/85">
                      {i.name} {i.quantity > 1 ? `× ${i.quantity}` : ""}
                    </span>
                    <span className="text-[10px] text-muted-foreground">{money(i.price * (i.quantity || 1))}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        {/* What the money buys, and when it is paid */}
        <div className="px-5 py-4">
          <p className="text-[9px] uppercase tracking-[0.34em] text-muted-foreground">What is being built</p>
          {specs.length ? (
            <ul className="mt-3">
              {specs.slice(0, 6).map((s) => (
                <li key={s.label} className="border-t border-border/50 py-1.5">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{s.label}</span>
                    <span className="text-[11px] text-foreground">{s.value}</span>
                  </div>
                  <p className="mt-0.5 text-[9px] leading-relaxed text-muted-foreground">{s.why}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-[11px] text-muted-foreground">
              Draw the plan and the engineering take-off prints here.
            </p>
          )}

          <p className="mt-5 text-[9px] uppercase tracking-[0.34em] text-muted-foreground">Payment schedule</p>
          <ul className="mt-2">
            {schedule.map((s) => (
              <li key={s.label} className="flex items-baseline justify-between gap-3 border-t border-border/50 py-1.5">
                <span className="text-[11px] text-foreground/85">
                  {s.label} — {s.pct}%
                </span>
                {/* Percentages apply to the guest's whole project when one is configured */}
                <span className="text-[10px] text-muted-foreground">
                  {money(investment > 0 ? (investment * s.pct) / 100 : s.amount)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CustomerProjectSummary;
