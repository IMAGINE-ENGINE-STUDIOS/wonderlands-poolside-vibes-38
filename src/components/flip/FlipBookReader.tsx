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
import { consumeNarratorCredits, loadPublishedBook } from "@/lib/flip/flipPublish";
import { useOptionalShoppingCart } from "@/components/ShoppingCartProvider";
import { loadFlipFonts } from "./flipFonts";
import { X } from "lucide-react";
import { FlipWidgetSurface } from "./flipWidgets";
import { TEXT_CLASS, type Block, type BuilderPage } from "./flipBuilderTypes";
import {
  motionOf,
  paletteOf,
  themeVars,
  typeSetOf,
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

  if (block.kind === "button")
    return (
      <span
        className="flex h-full w-full items-center justify-center border px-3 text-center text-[10px] uppercase tracking-[0.3em]"
        style={{ borderColor: "var(--fb-accent)", color: "var(--fb-accent)", fontFamily: "var(--fb-text)" }}
      >
        {block.text || "Open"}
      </span>
    );

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

/** Reader-only: runs a block's V3 action (page jump, minibook, cart, link). */
const FlipActionContext = React.createContext<((b: Block) => void) | null>(null);

/** One leaf, painted with the theme. Exported so the editor canvas matches 1:1. */
export const FlipPageSurface: React.FC<{ page: BuilderPage; theme: FlipTheme; still?: boolean }> = ({
  page,
  theme,
  still,
}) => {
  const act = React.useContext(FlipActionContext);
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
      {page.blocks.map((b) => {
        const box = { left: `${b.x}%`, top: `${b.y}%`, width: `${b.w}%`, height: `${b.h}%` };
        const live = !still && act && b.action && b.action !== "none";
        return live ? (
          <button
            key={b.id}
            type="button"
            onClick={(e) => { e.stopPropagation(); act!(b); }}
            className="absolute z-20 cursor-pointer text-left transition-opacity hover:opacity-80"
            style={box}
          >
            <BlockSurface block={b} cover={cover} still={still} />
          </button>
        ) : (
          <div key={b.id} className="absolute" style={box}>
            <BlockSurface block={b} cover={cover} still={still} />
          </div>
        );
      })}
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
  // Kindle / e-ink: on by author choice, or automatically on Kindle browsers.
  const kindle = !!doc.theme.kindle || (typeof navigator !== "undefined" && /Kindle|Silk|KFAPWI|KFTT/i.test(navigator.userAgent));
  const t = doc.theme;
  const turnMs = kindle || !t.curl ? 1 : t.turnSpeed > 0 ? t.turnSpeed : motion.flippingTime;
  // V3 keyboard control
  React.useEffect(() => {
    if (!t.keyboard) return;
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (el && (el.isContentEditable || /INPUT|TEXTAREA|SELECT/.test(el.tagName))) return;
      if (e.key === "ArrowRight") bookRef.current?.pageFlip()?.flipNext();
      if (e.key === "ArrowLeft") bookRef.current?.pageFlip()?.flipPrev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [t.keyboard]);
  const palette = paletteOf(doc.theme);
  const cart = useOptionalShoppingCart();
  const [mini, setMini] = React.useState<BuilderDocV2 | null>(null);
  const typeSet = typeSetOf(doc.theme);
  React.useEffect(() => loadFlipFonts(typeSet.google), [typeSet]);

  /** V3 block actions: jump to page, open minibook, add to cart, open link. */
  const act = React.useCallback(
    async (b: Block) => {
      if (b.action === "page" && b.targetPage) {
        bookRef.current?.pageFlip()?.turnToPage(Math.max(0, Math.min(doc.pages.length - 1, b.targetPage - 1)));
      } else if (b.action === "book" && b.targetBook) {
        try {
          const res = await loadPublishedBook(b.targetBook);
          if (res) setMini(res.doc);
          else setNotice("That minibook is not published yet.");
        } catch {
          setNotice("That minibook could not be opened.");
        }
      } else if (b.action === "cart") {
        if (!cart) return setNotice("The cart is not available here.");
        const name = b.productName || b.text || doc.title;
        cart.addToCart({
          id: `flip-${(b.productName || b.id).toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
          name,
          price: Number(b.price) || 0,
          image: b.productImage,
          category: b.productCategory || doc.title,
        });
        setNotice(`${name} added to your cart.`);
      } else if (b.action === "url" && b.href && /^https?:\/\//i.test(b.href)) {
        window.open(b.href, "_blank", "noopener,noreferrer");
      }
    },
    [cart, doc.pages.length, doc.title],
  );

  React.useEffect(() => {
    const measure = () => {
      const isPortrait = kindle || window.innerWidth < 900;
      setPortrait(isPortrait);
      const avail = Math.min(window.innerWidth - 32, fullscreen ? 1800 : 1400);
      const w = isPortrait ? avail : Math.floor(avail / 2);
      const capped = Math.min(Math.round(w * 1.33), window.innerHeight - (fullscreen ? 90 : 170));
      setDims({ w: Math.round(capped / 1.33), h: capped });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [fullscreen, kindle]);

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
    <FlipActionContext.Provider value={act}>
    <div
      style={{ ...themeVars(doc.theme), background: kindle ? "#fff" : palette.paper, filter: kindle ? "grayscale(1) contrast(1.15)" : undefined }}
      className={`relative ${fullscreen ? "fixed inset-0 z-[70] overflow-auto" : ""} ${className ?? ""}`}
    >
      <div className="px-2 pb-10 pt-6 md:px-6">
        <div className="relative mx-auto flex justify-center" style={{ perspective: doc.theme.motion === "cinema" ? "1800px" : "3000px", minHeight: dims.h }}>
          <HTMLFlipBook
            key={`reader-${kindle}-${doc.pages.length}-${dims.w}-${doc.theme.motion}-${t.arrowsOnly}-${turnMs}`}
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
            drawShadow={!kindle && t.curl && doc.theme.motion !== "fade"}
            flippingTime={turnMs}
            maxShadowOpacity={0.2 + (doc.theme.depth / 100) * 0.6}
            startPage={0}
            startZIndex={0}
            autoSize={false}
            clickEventForward={false}
            useMouseEvents={!t.arrowsOnly}
            swipeDistance={t.arrowsOnly ? 100000 : 30}
            showPageCorners={!t.arrowsOnly && doc.theme.showCorners}
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
          {kindle && (
            <>
              <button onClick={() => bookRef.current?.pageFlip()?.flipPrev()} aria-label="Previous page (tap left)" className="absolute inset-y-0 left-0 z-10 w-1/3" />
              <button onClick={() => bookRef.current?.pageFlip()?.flipNext()} aria-label="Next page (tap right)" className="absolute inset-y-0 right-0 z-10 w-1/3" />
            </>
          )}
          {t.sideArrows && !kindle && (
            <>
              <button onClick={() => bookRef.current?.pageFlip()?.flipPrev()} aria-label="Previous page (side)" className="absolute left-0 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center border bg-background/70 backdrop-blur" style={{ borderColor: palette.muted, color: palette.ink }}><ChevronLeft className="h-5 w-5" /></button>
              <button onClick={() => bookRef.current?.pageFlip()?.flipNext()} aria-label="Next page (side)" className="absolute right-0 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center border bg-background/70 backdrop-blur" style={{ borderColor: palette.muted, color: palette.ink }}><ChevronRight className="h-5 w-5" /></button>
            </>
          )}
        </div>

        {/* controls */}
        <div className="mx-auto mt-5 flex max-w-4xl flex-wrap items-center justify-center gap-2">
          {t.showArrows && <button
            onClick={() => bookRef.current?.pageFlip()?.flipPrev()}
            aria-label="Previous page"
            className="flex h-10 w-10 items-center justify-center border transition-transform hover:-translate-x-0.5"
            style={{ borderColor: palette.muted, color: palette.ink }}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>}
          {t.pageCounter && <span className="px-3 text-[10px] uppercase tracking-[0.4em]" style={{ color: palette.muted }}>
            {String(Math.min(page + 1, doc.pages.length)).padStart(2, "0")} / {String(doc.pages.length).padStart(2, "0")}
          </span>}
          {t.showArrows && <button
            onClick={() => bookRef.current?.pageFlip()?.flipNext()}
            aria-label="Next page"
            className="flex h-10 w-10 items-center justify-center border transition-transform hover:translate-x-0.5"
            style={{ borderColor: palette.muted, color: palette.ink }}
          >
            <ChevronRight className="h-4 w-4" />
          </button>}

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
          {t.shareButton && <button
            onClick={share}
            className="inline-flex items-center gap-2 border px-3 py-2 text-[9px] uppercase tracking-[0.3em] transition-opacity hover:opacity-80"
            style={{ borderColor: palette.muted, color: palette.ink }}
          >
            <Share2 className="h-3.5 w-3.5" /> Share
          </button>}
          {t.studyButton && <button
            onClick={() => setFullscreen((v) => !v)}
            className="inline-flex items-center gap-2 border px-3 py-2 text-[9px] uppercase tracking-[0.3em] transition-opacity hover:opacity-80"
            style={{ borderColor: palette.muted, color: palette.ink }}
          >
            <Maximize2 className="h-3.5 w-3.5" /> {fullscreen ? "Close" : "Study"}
          </button>}
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
      {mini && (
        <div className="fixed inset-0 z-[80] overflow-auto bg-background/95 backdrop-blur" role="dialog" aria-label={mini.title}>
          <button onClick={() => setMini(null)} aria-label="Close minibook" className="fixed right-4 top-4 z-[81] flex h-10 w-10 items-center justify-center border border-border bg-background text-foreground">
            <X className="h-4 w-4" />
          </button>
          <FlipBookReader doc={mini} />
        </div>
      )}
    </div>
    </FlipActionContext.Provider>
  );
};

export default FlipBookReader;
