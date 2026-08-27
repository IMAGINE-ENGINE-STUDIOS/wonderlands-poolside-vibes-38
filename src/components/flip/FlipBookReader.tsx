/**
 * FLIP Book Reader — the palette-aware reading surface shared by the V2 builder
 * ("Read" mode) and by every published edition served at /flip/:slug.
 *
 * Everything visual comes from the document's theme: palette, type set, motion,
 * paper grain, shadow depth, tabs and corner hints. Narration is optional and
 * metered — each reading spends credits from the book's narrator wallet.
 */

import * as React from "react";
import HTMLFlipBook from "react-pageflip";
import { ChevronLeft, ChevronRight, Volume2, Loader2, Share2, Maximize2, Pause } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { consumeNarratorCredits } from "@/lib/flip/flipPublish";
import { FlipWidgetSurface } from "./flipWidgets";
import { TEXT_CLASS, type Block, type BuilderPage } from "./flipBuilderTypes";
import {
  motionOf,
  paletteOf,
  themeVars,
  type BuilderDocV2,
  type FlipTheme,
} from "./flipBuilderV2Types";

/* ---------------------------------------------------------------- surfaces */

const ANIM: Record<string, string> = {
  none: "",
  fade: "animate-fade-in",
  rise: "fb-rise",
  ken: "animate-ken-burns",
};

const BlockSurface: React.FC<{ block: Block; cover: boolean; still?: boolean }> = ({
  block,
  cover,
  still,
}) => {
  const anim = ANIM[block.animation ?? "none"] ?? "";
  const ink =
    block.tone === "light"
      ? "var(--fb-cover-ink)"
      : block.tone === "dark"
        ? "var(--fb-ink)"
        : cover
          ? "var(--fb-cover-ink)"
          : "var(--fb-ink)";

  if (block.kind === "image")
    return block.src ? (
      <div className="h-full w-full overflow-hidden">
        <img src={block.src} alt={block.text ?? ""} loading="lazy" decoding="async" className={`h-full w-full object-cover ${anim}`} />
      </div>
    ) : (
      <div className="flex h-full w-full items-center justify-center border border-dashed" style={{ borderColor: "var(--fb-muted)" }}>
        <span className="text-[9px] uppercase tracking-[0.3em]" style={{ color: "var(--fb-muted)" }}>Image</span>
      </div>
    );

  if (block.kind === "video")
    return block.src ? (
      <video src={block.src} muted loop playsInline autoPlay={!still} className="h-full w-full object-cover" />
    ) : (
      <div className="flex h-full w-full items-center justify-center border border-dashed" style={{ borderColor: "var(--fb-muted)" }}>
        <span className="text-[9px] uppercase tracking-[0.3em]" style={{ color: "var(--fb-muted)" }}>Film</span>
      </div>
    );

  if (block.kind === "widget")
    return <FlipWidgetSurface id={block.widget} scale={block.scale ?? 0.6} editing={still} />;

  if (block.kind === "rule")
    return <div className="h-px w-full" style={{ background: "var(--fb-accent)", opacity: 0.55 }} />;

  const style = block.style ?? "body";
  const display = style === "title" || style === "subtitle" || style === "stat";
  return (
    <p
      className={`${TEXT_CLASS[style]} ${anim}`}
      style={{
        color: style === "caption" || style === "eyebrow" ? "var(--fb-muted)" : ink,
        fontFamily: display ? "var(--fb-display)" : "var(--fb-text)",
        textAlign: block.align ?? "left",
        whiteSpace: "pre-wrap",
      }}
    >
      {block.text}
    </p>
  );
};

/** One leaf, painted with the theme. Exported so the editor canvas matches 1:1. */
export const FlipPageSurface: React.FC<{ page: BuilderPage; theme: FlipTheme; still?: boolean }> = ({
  page,
  theme,
  still,
}) => {
  const cover = page.tone === "cover";
  return (
    <div
      className="relative h-full w-full overflow-hidden"
      style={{
        background: cover ? "var(--fb-cover-paper)" : "var(--fb-paper)",
        color: cover ? "var(--fb-cover-ink)" : "var(--fb-ink)",
      }}
    >
      {page.background && (
        <img src={page.background} alt="" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover" />
      )}
      {page.background && cover && (
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,.8), rgba(0,0,0,.15))" }} />
      )}
      {theme.grain > 0 && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 mix-blend-multiply"
          style={{
            opacity: theme.grain / 260,
            backgroundImage:
              "radial-gradient(rgba(0,0,0,.7) 0.5px, transparent 0.6px), radial-gradient(rgba(0,0,0,.5) 0.5px, transparent 0.6px)",
            backgroundSize: "3px 3px, 5px 5px",
            backgroundPosition: "0 0, 1px 2px",
          }}
        />
      )}
      {page.blocks.map((b) => (
        <div key={b.id} className="absolute" style={{ left: `${b.x}%`, top: `${b.y}%`, width: `${b.w}%`, height: `${b.h}%` }}>
          <BlockSurface block={b} cover={cover} still={still} />
        </div>
      ))}
    </div>
  );
};

const Leaf = React.forwardRef<HTMLDivElement, { children: React.ReactNode }>(({ children }, ref) => (
  <div ref={ref} className="h-full w-full overflow-hidden" style={{ boxShadow: "inset 0 0 60px rgba(0,0,0,0.07)" }}>
    {children}
  </div>
));
Leaf.displayName = "Leaf";

/* ------------------------------------------------------------------ reader */

type Props = {
  doc: BuilderDocV2;
  /** id of the saved book row — required for metered narration */
  bookId?: string;
  /** link copied by the share button */
  shareUrl?: string;
  className?: string;
};

const FlipBookReader: React.FC<Props> = ({ doc, bookId, shareUrl, className }) => {
  const bookRef = React.useRef<any>(null);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const [dims, setDims] = React.useState({ w: 420, h: 560 });
  const [portrait, setPortrait] = React.useState(false);
  const [page, setPage] = React.useState(0);
  const [reading, setReading] = React.useState(false);
  const [speaking, setSpeaking] = React.useState(false);
  const [notice, setNotice] = React.useState<string | null>(null);
  const [fullscreen, setFullscreen] = React.useState(false);
  const motion = motionOf(doc.theme);
  const palette = paletteOf(doc.theme);

  React.useEffect(() => {
    const measure = () => {
      const isPortrait = window.innerWidth < 900;
      setPortrait(isPortrait);
      const avail = Math.min(window.innerWidth - 32, fullscreen ? 1800 : 1400);
      const w = isPortrait ? avail : Math.floor(avail / 2);
      const capped = Math.min(Math.round(w * 1.33), window.innerHeight - (fullscreen ? 90 : 170));
      setDims({ w: Math.round(capped / 1.33), h: capped });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [fullscreen]);

  /* Autoplay — a hands-free edition. */
  React.useEffect(() => {
    if (!doc.theme.autoplay) return;
    const timer = window.setInterval(
      () => bookRef.current?.pageFlip()?.flipNext(),
      doc.theme.autoplay * 1000,
    );
    return () => window.clearInterval(timer);
  }, [doc.theme.autoplay]);

  /** Words on the open spread, in reading order. */
  const spreadScript = React.useCallback(
    (index: number) => {
      const leaves = portrait ? [index] : [index, index + 1];
      return leaves
        .map((i) => doc.pages[i])
        .filter(Boolean)
        .flatMap((p) => p!.blocks.filter((b) => b.kind === "text" && b.text).map((b) => b.text!.trim()))
        .join(". ")
        .slice(0, 1400);
    },
    [doc.pages, portrait],
  );

  const stop = React.useCallback(() => {
    audioRef.current?.pause();
    audioRef.current = null;
    setSpeaking(false);
  }, []);

  const read = React.useCallback(
    async (index: number) => {
      if (!doc.narrator.enabled) return;
      const script = spreadScript(index);
      if (!script) return;
      if (!bookId) {
        setNotice("Publish this edition to switch the narrator on.");
        return;
      }
      setReading(true);
      setNotice(null);
      try {
        const charge = await consumeNarratorCredits(bookId, doc.narrator.creditsPerRead, `Spread ${index + 1}`);
        if (!charge.ok) {
          setNotice(
            charge.reason === "out_of_credits"
              ? "Narration credits are spent — top up to keep reading aloud."
              : "The narrator subscription is not active on this edition.",
          );
          return;
        }
        const { data, error } = await supabase.functions.invoke("narrate-voice", {
          body: { text: script, key: `flip:${bookId}:${index}`, voice: doc.narrator.voice },
        });
        if (error) throw error;
        const blob = data instanceof Blob ? data : new Blob([data as BlobPart], { type: "audio/mpeg" });
        stop();
        const audio = new Audio(URL.createObjectURL(blob));
        audioRef.current = audio;
        audio.onended = () => setSpeaking(false);
        setSpeaking(true);
        await audio.play();
      } catch (err) {
        console.error("narration failed", err);
        setNotice("The narrator could not be reached.");
      } finally {
        setReading(false);
      }
    },
    [bookId, doc.narrator, spreadScript, stop],
  );

  React.useEffect(() => {
    if (doc.narrator.enabled && doc.narrator.autoRead) void read(page);
  }, [page, doc.narrator.enabled, doc.narrator.autoRead, read]);

  React.useEffect(() => () => stop(), [stop]);

  const share = async () => {
    const url = shareUrl ?? window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: doc.title, url });
      else {
        await navigator.clipboard.writeText(url);
        setNotice("Link copied.");
      }
    } catch {
      /* dismissed */
    }
  };

  const chapters = React.useMemo(
    () => doc.pages.map((p, i) => ({ i, name: p.name })).filter((c) => c.i % 2 === 0),
    [doc.pages],
  );

  return (
    <div
      style={{ ...themeVars(doc.theme), background: palette.paper }}
      className={`relative ${fullscreen ? "fixed inset-0 z-[70] overflow-auto" : ""} ${className ?? ""}`}
    >
      <div className="px-2 pb-10 pt-6 md:px-6">
        <div className="mx-auto flex justify-center" style={{ perspective: doc.theme.motion === "cinema" ? "1800px" : "3000px", minHeight: dims.h }}>
          <HTMLFlipBook
            key={`reader-${doc.pages.length}-${dims.w}-${doc.theme.motion}`}
            ref={bookRef}
            width={dims.w}
            height={dims.h}
            size="fixed"
            minWidth={240}
            maxWidth={1800}
            minHeight={320}
            maxHeight={1600}
            showCover={false}
            usePortrait={portrait}
            mobileScrollSupport
            drawShadow={doc.theme.motion !== "fade"}
            flippingTime={motion.flippingTime}
            maxShadowOpacity={0.2 + (doc.theme.depth / 100) * 0.6}
            startPage={0}
            startZIndex={0}
            autoSize={false}
            clickEventForward={false}
            useMouseEvents
            swipeDistance={30}
            showPageCorners={doc.theme.showCorners}
            disableFlipByClick
            style={{}}
            className={doc.theme.motion === "fade" ? "fb-page-fade" : ""}
            onFlip={(e: any) => setPage(e.data as number)}
          >
            {doc.pages.map((p) => (
              <Leaf key={p.id}>
                <FlipPageSurface page={p} theme={doc.theme} />
              </Leaf>
            ))}
          </HTMLFlipBook>
        </div>

        {/* controls */}
        <div className="mx-auto mt-5 flex max-w-4xl flex-wrap items-center justify-center gap-2">
          <button
            onClick={() => bookRef.current?.pageFlip()?.flipPrev()}
            aria-label="Previous page"
            className="flex h-10 w-10 items-center justify-center border transition-transform hover:-translate-x-0.5"
            style={{ borderColor: palette.muted, color: palette.ink }}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="px-3 text-[10px] uppercase tracking-[0.4em]" style={{ color: palette.muted }}>
            {String(Math.min(page + 1, doc.pages.length)).padStart(2, "0")} / {String(doc.pages.length).padStart(2, "0")}
          </span>
          <button
            onClick={() => bookRef.current?.pageFlip()?.flipNext()}
            aria-label="Next page"
            className="flex h-10 w-10 items-center justify-center border transition-transform hover:translate-x-0.5"
            style={{ borderColor: palette.muted, color: palette.ink }}
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          {doc.narrator.enabled && (
            <button
              onClick={() => (speaking ? stop() : read(page))}
              className="ml-2 inline-flex items-center gap-2 border px-3 py-2 text-[9px] uppercase tracking-[0.3em] transition-opacity hover:opacity-80"
              style={{ borderColor: palette.accent, color: palette.accent }}
            >
              {reading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : speaking ? <Pause className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
              {speaking ? "Silence" : "Read aloud"}
            </button>
          )}
          <button
            onClick={share}
            className="inline-flex items-center gap-2 border px-3 py-2 text-[9px] uppercase tracking-[0.3em] transition-opacity hover:opacity-80"
            style={{ borderColor: palette.muted, color: palette.ink }}
          >
            <Share2 className="h-3.5 w-3.5" /> Share
          </button>
          <button
            onClick={() => setFullscreen((v) => !v)}
            className="inline-flex items-center gap-2 border px-3 py-2 text-[9px] uppercase tracking-[0.3em] transition-opacity hover:opacity-80"
            style={{ borderColor: palette.muted, color: palette.ink }}
          >
            <Maximize2 className="h-3.5 w-3.5" /> {fullscreen ? "Close" : "Study"}
          </button>
        </div>

        {/* chapter tabs */}
        {doc.theme.showTabs && chapters.length > 1 && (
          <div className="mx-auto mt-4 flex max-w-5xl flex-wrap items-center justify-center gap-1.5">
            {chapters.map((c) => (
              <button
                key={c.i}
                onClick={() => bookRef.current?.pageFlip()?.turnToPage(c.i)}
                className="border px-2.5 py-1 text-[8px] uppercase tracking-[0.28em] transition-colors"
                style={{
                  borderColor: page === c.i ? palette.accent : palette.muted,
                  color: page === c.i ? palette.accent : palette.muted,
                }}
              >
                {c.name}
              </button>
            ))}
          </div>
        )}

        {notice && (
          <p className="mt-4 text-center text-[10px] uppercase tracking-[0.3em]" style={{ color: palette.muted }}>
            {notice}
          </p>
        )}
      </div>
    </div>
  );
};

export default FlipBookReader;
