import * as React from "react";
import { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from "react";
import HTMLFlipBook from "react-pageflip";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Copy,
  Trash2,
  Type,
  ImagePlus,
  Film,
  Minus,
  LayoutTemplate,
  Eye,
  PenLine,
  RotateCcw,
  Sparkles,
  Columns2,
  ArrowUp,
  ArrowDown,
  X,
} from "lucide-react";
import usePersistentState from "@/hooks/usePersistentState";
import {
  LAYOUTS,
  TEXT_CLASS,
  TEXT_LABEL,
  starterDoc,
  uid,
  type Block,
  type BlockAnimation,
  type BuilderDoc,
  type BuilderPage,
  type PageTransition,
  type TextStyle,
} from "./flipBuilderTypes";
import { FLIP_WIDGETS, FlipWidgetSurface, widgetMeta } from "./flipWidgets";

/* ---------------------------------------------------------------- helpers */

/** Downscale an uploaded file so a document stays small enough to cache. */
const readImage = (file: File, max = 1400): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("read failed"));
    reader.onload = () => {
      const src = String(reader.result);
      const img = new Image();
      img.onerror = () => resolve(src);
      img.onload = () => {
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        if (scale === 1 && src.length < 400_000) return resolve(src);
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        if (!ctx) return resolve(src);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  });

const ANIMATION_CLASS: Record<BlockAnimation, string> = {
  none: "",
  fade: "animate-fade-in",
  rise: "fb-rise",
  ken: "animate-ken-burns",
};

const TRANSITIONS: { id: PageTransition; label: string }[] = [
  { id: "flip", label: "Page turn" },
  { id: "fade", label: "Fade in" },
  { id: "rise", label: "Rise" },
  { id: "slide", label: "Slide" },
];

const TRANSITION_CLASS: Record<PageTransition, string> = {
  flip: "",
  fade: "fb-page-fade",
  rise: "fb-page-rise",
  slide: "fb-page-slide",
};

/* ------------------------------------------------------------ page render */

const BlockView: React.FC<{ block: Block; tone: "paper" | "cover"; editing?: boolean }> = ({
  block,
  tone,
  editing,
}) => {
  const light = block.tone === "light" || (tone === "cover" && block.tone !== "dark");
  const anim = ANIMATION_CLASS[block.animation ?? "none"];

  if (block.kind === "image") {
    return block.src ? (
      <div className="h-full w-full overflow-hidden">
        <img
          src={block.src}
          alt={block.text ?? ""}
          loading="lazy"
          decoding="async"
          className={`h-full w-full object-cover ${anim}`}
        />
      </div>
    ) : (
      <div className="flex h-full w-full items-center justify-center border border-dashed border-border/70 bg-muted/30">
        <span className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground">Image</span>
      </div>
    );
  }

  if (block.kind === "video") {
    return block.src ? (
      <video
        src={block.src}
        muted
        loop
        playsInline
        autoPlay={!editing}
        className="h-full w-full object-cover"
      />
    ) : (
      <div className="flex h-full w-full items-center justify-center border border-dashed border-border/70 bg-muted/30">
        <span className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground">Film</span>
      </div>
    );
  }

  if (block.kind === "widget") {
    return <FlipWidgetSurface id={block.widget} scale={block.scale ?? 0.6} editing={editing} />;
  }

  if (block.kind === "rule") {
    return <div className={`h-px w-full ${light ? "bg-white/40" : "bg-border"}`} />;
  }

  return (
    <p
      className={`${TEXT_CLASS[block.style ?? "body"]} ${anim} ${
        light ? "text-white" : "text-foreground"
      }`}
      style={{ textAlign: block.align ?? "left", whiteSpace: "pre-wrap" }}
    >
      {block.text}
    </p>
  );
};

const PageView: React.FC<{ page: BuilderPage; editing?: boolean }> = ({ page, editing }) => (
  <div
    className={`relative h-full w-full overflow-hidden ${
      page.tone === "cover" ? "bg-foreground text-background" : "bg-background text-foreground"
    } ${TRANSITION_CLASS[page.transition]}`}
  >
    {page.background && (
      <img
        src={page.background}
        alt=""
        loading="lazy"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover"
      />
    )}
    {page.background && page.tone === "cover" && (
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/10" />
    )}
    {page.blocks.map((b) => (
      <div
        key={b.id}
        className="absolute"
        style={{ left: `${b.x}%`, top: `${b.y}%`, width: `${b.w}%`, height: `${b.h}%` }}
      >
        <BlockView block={b} tone={page.tone} editing={editing} />
      </div>
    ))}
  </div>
);

const Leaf = forwardRef<HTMLDivElement, { children: React.ReactNode }>(({ children }, ref) => (
  <div ref={ref} className="h-full w-full overflow-hidden" style={{ boxShadow: "inset 0 0 60px rgba(0,0,0,0.06)" }}>
    {children}
  </div>
));
Leaf.displayName = "Leaf";

/* ------------------------------------------------------------------ shell */

const FlipBuilder: React.FC = () => {
  const [doc, setDoc] = usePersistentState<BuilderDoc>("flip.builder.doc", starterDoc());
  const [pageIndex, setPageIndex] = usePersistentState<number>("flip.builder.page", 0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [preview, setPreview] = usePersistentState<boolean>("flip.builder.preview", false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryFamily, setGalleryFamily] = useState<string>("All");
  const [featuresOpen, setFeaturesOpen] = useState(false);
  const [previewPage, setPreviewPage] = useState(0);
  const canvasRef = useRef<HTMLDivElement>(null);
  const bookRef = useRef<any>(null);
  const [dims, setDims] = useState({ w: 420, h: 560 });
  const [portrait, setPortrait] = useState(false);

  useEffect(() => {
    const measure = () => {
      const isPortrait = window.innerWidth < 900;
      setPortrait(isPortrait);
      const avail = Math.min(window.innerWidth - 32, 1400);
      const w = isPortrait ? avail : Math.floor(avail / 2);
      setDims({ w, h: Math.round(w * 1.33) });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const pages = doc.pages;
  const index = Math.min(pageIndex, Math.max(pages.length - 1, 0));
  const page = pages[index];
  const selected = page?.blocks.find((b) => b.id === selectedId) ?? null;

  const setPage = useCallback(
    (mutate: (p: BuilderPage) => BuilderPage) => {
      setDoc((d) => ({
        ...d,
        pages: d.pages.map((p, i) => (i === index ? mutate(p) : p)),
      }));
    },
    [index, setDoc],
  );

  const patchBlock = useCallback(
    (id: string, patch: Partial<Block>) => {
      setPage((p) => ({ ...p, blocks: p.blocks.map((b) => (b.id === id ? { ...b, ...patch } : b)) }));
    },
    [setPage],
  );

  const addBlock = useCallback(
    (kind: Block["kind"], widgetId?: string) => {
      const block: Block =
        kind === "widget"
          ? { id: uid(), kind, x: 4, y: 8, w: 92, h: 70, widget: widgetId ?? FLIP_WIDGETS[0].id, scale: 0.6 }
          :
        kind === "text"
          ? { id: uid(), kind, x: 10, y: 40, w: 60, h: 10, text: "New text", style: "body", align: "left", animation: "none" }
          : kind === "rule"
            ? { id: uid(), kind, x: 10, y: 50, w: 60, h: 1 }
            : { id: uid(), kind, x: 12, y: 12, w: 50, h: 36, animation: kind === "image" ? "ken" : "none" };
      setPage((p) => ({ ...p, blocks: [...p.blocks, block] }));
      setSelectedId(block.id);
    },
    [setPage],
  );

  const removeBlock = useCallback(
    (id: string) => {
      setPage((p) => ({ ...p, blocks: p.blocks.filter((b) => b.id !== id) }));
      setSelectedId(null);
    },
    [setPage],
  );

  /* ------------------------------------------------------------ page CRUD */
  const addPage = useCallback(
    (layoutId?: string) => {
      const preset = LAYOUTS.find((l) => l.id === layoutId) ?? LAYOUTS[LAYOUTS.length - 1];
      const fresh = [preset.build(), ...(preset.buildFacing ? [preset.buildFacing()] : [])];
      setDoc((d) => {
        const next = [...d.pages];
        next.splice(index + 1, 0, ...fresh);
        return { ...d, pages: next };
      });
      setPageIndex(index + 1);
      setSelectedId(null);
      setGalleryOpen(false);
    },
    [index, setDoc, setPageIndex],
  );

  const duplicatePage = useCallback(() => {
    setDoc((d) => {
      const src = d.pages[index];
      if (!src) return d;
      const copy: BuilderPage = {
        ...src,
        id: uid(),
        name: `${src.name} copy`,
        blocks: src.blocks.map((b) => ({ ...b, id: uid() })),
      };
      const next = [...d.pages];
      next.splice(index + 1, 0, copy);
      return { ...d, pages: next };
    });
    setPageIndex(index + 1);
  }, [index, setDoc, setPageIndex]);

  const deletePage = useCallback(() => {
    setDoc((d) => (d.pages.length <= 1 ? d : { ...d, pages: d.pages.filter((_, i) => i !== index) }));
    setPageIndex(Math.max(index - 1, 0));
    setSelectedId(null);
  }, [index, setDoc, setPageIndex]);

  const movePage = useCallback(
    (dir: -1 | 1) => {
      const to = index + dir;
      if (to < 0 || to >= pages.length) return;
      setDoc((d) => {
        const next = [...d.pages];
        const [item] = next.splice(index, 1);
        next.splice(to, 0, item);
        return { ...d, pages: next };
      });
      setPageIndex(to);
    },
    [index, pages.length, setDoc, setPageIndex],
  );

  /* ---------------------------------------------------------- drag/resize */
  const drag = useRef<{ id: string; mode: "move" | "size"; startX: number; startY: number; block: Block } | null>(null);

  const onPointerDown = (e: React.PointerEvent, block: Block, mode: "move" | "size") => {
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    setSelectedId(block.id);
    drag.current = { id: block.id, mode, startX: e.clientX, startY: e.clientY, block };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!d || !rect) return;
    const dx = ((e.clientX - d.startX) / rect.width) * 100;
    const dy = ((e.clientY - d.startY) / rect.height) * 100;
    if (d.mode === "move") {
      patchBlock(d.id, {
        x: Math.min(Math.max(d.block.x + dx, -2), 100 - 4),
        y: Math.min(Math.max(d.block.y + dy, -2), 100 - 2),
      });
    } else {
      patchBlock(d.id, {
        w: Math.min(Math.max(d.block.w + dx, 4), 100),
        h: Math.min(Math.max(d.block.h + dy, d.block.kind === "rule" ? 1 : 3), 100),
      });
    }
  };

  const onPointerUp = () => {
    drag.current = null;
  };

  /* --------------------------------------------------------------- uploads */
  const uploadToBlock = async (files: FileList | null, id: string) => {
    const file = files?.[0];
    if (!file) return;
    if (file.type.startsWith("video/")) {
      patchBlock(id, { src: URL.createObjectURL(file), kind: "video" });
      return;
    }
    patchBlock(id, { src: await readImage(file), kind: "image" });
  };

  const uploadBackground = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    setPage((p) => ({ ...p, background: undefined }));
    const src = await readImage(file);
    setPage((p) => ({ ...p, background: src }));
  };

  const previewPages = useMemo(() => pages, [pages]);

  /* ------------------------------------------------------------- rendering */

  if (!page) return null;

  return (
    <section aria-label="FLIP builder" className="bg-background">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 px-4 py-4 md:px-8">
        <div className="flex min-w-0 items-baseline gap-3">
          <span className="font-serif text-xl font-light leading-none text-foreground">Flip It</span>
          <input
            value={doc.title}
            onChange={(e) => setDoc((d) => ({ ...d, title: e.target.value }))}
            aria-label="Document title"
            className="min-w-0 flex-1 border-b border-border/60 bg-transparent pb-1 text-[10px] uppercase tracking-[0.3em] text-muted-foreground focus:border-foreground focus:outline-none"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setGalleryOpen(true)}
            className="inline-flex items-center gap-2 border border-border/60 px-3 py-2 text-[9px] uppercase tracking-[0.3em] text-foreground transition-colors hover:bg-foreground hover:text-background"
          >
            <LayoutTemplate className="h-3.5 w-3.5" /> Layouts
          </button>
          <button
            onClick={() => setFeaturesOpen(true)}
            className="inline-flex items-center gap-2 border border-border/60 px-3 py-2 text-[9px] uppercase tracking-[0.3em] text-foreground transition-colors hover:bg-foreground hover:text-background"
          >
            <Sparkles className="h-3.5 w-3.5" /> Features
          </button>
          <button
            onClick={() => {
              setPreview((v) => !v);
              setPreviewPage(0);
            }}
            className={`inline-flex items-center gap-2 border px-3 py-2 text-[9px] uppercase tracking-[0.3em] transition-colors ${
              preview
                ? "border-foreground bg-foreground text-background"
                : "border-border/60 text-foreground hover:bg-foreground hover:text-background"
            }`}
          >
            {preview ? <PenLine className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            {preview ? "Edit" : "Read"}
          </button>
          <button
            onClick={() => {
              if (window.confirm("Start a new flip? The current one is discarded.")) {
                setDoc(starterDoc());
                setPageIndex(0);
                setSelectedId(null);
              }
            }}
            className="inline-flex items-center gap-2 border border-border/60 px-3 py-2 text-[9px] uppercase tracking-[0.3em] text-muted-foreground transition-colors hover:text-foreground"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Reset
          </button>
        </div>
      </div>

      {preview ? (
        /* -------------------------------------------------------- read mode */
        <div className="px-2 pb-24 pt-8 md:px-6 md:py-12">
          <div className="mx-auto flex justify-center" style={{ perspective: "3000px", minHeight: dims.h }}>
            <HTMLFlipBook
              key={`builder-${previewPages.length}-${dims.w}`}
              ref={bookRef}
              width={dims.w}
              height={dims.h}
              size="fixed"
              minWidth={240}
              maxWidth={1400}
              minHeight={340}
              maxHeight={1400}
              showCover={false}
              usePortrait={portrait}
              mobileScrollSupport
              drawShadow
              flippingTime={880}
              maxShadowOpacity={0.5}
              startPage={0}
              startZIndex={0}
              autoSize={false}
              clickEventForward={false}
              useMouseEvents
              swipeDistance={30}
              showPageCorners
              disableFlipByClick
              style={{}}
              className="shadow-[0_50px_110px_-30px_rgba(0,0,0,0.55)]"
              onFlip={(e: any) => setPreviewPage(e.data as number)}
            >
              {previewPages.map((p) => (
                <Leaf key={p.id}>
                  <PageView page={p} />
                </Leaf>
              ))}
            </HTMLFlipBook>
          </div>
          <div className="mt-6 flex flex-col items-center gap-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => bookRef.current?.pageFlip()?.flipPrev()}
                aria-label="Previous page"
                className="flex h-10 w-10 items-center justify-center border border-border/60 text-foreground transition-colors hover:bg-foreground hover:text-background"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => bookRef.current?.pageFlip()?.flipNext()}
                aria-label="Next page"
                className="flex h-10 w-10 items-center justify-center border border-border/60 text-foreground transition-colors hover:bg-foreground hover:text-background"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <p className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground">
              {String(Math.min(previewPage + 1, previewPages.length)).padStart(2, "0")} /{" "}
              {String(previewPages.length).padStart(2, "0")}
            </p>
          </div>
        </div>
      ) : (
        /* -------------------------------------------------------- edit mode */
        <div className="grid gap-0 lg:grid-cols-[190px_minmax(0,1fr)_260px]">
          {/* Page rail */}
          <aside className="border-b border-border/60 lg:border-b-0 lg:border-r">
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground">Pages</span>
              <button
                onClick={() => addPage()}
                aria-label="Add page"
                className="flex h-7 w-7 items-center justify-center border border-border/60 text-foreground transition-colors hover:bg-foreground hover:text-background"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="flex gap-3 overflow-x-auto px-4 pb-4 lg:max-h-[70vh] lg:flex-col lg:overflow-y-auto">
              {pages.map((p, i) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setPageIndex(i);
                    setSelectedId(null);
                  }}
                  className={`group w-32 shrink-0 border text-left transition-colors lg:w-full ${
                    i === index ? "border-foreground" : "border-border/50 hover:border-foreground/50"
                  }`}
                >
                  <div className="relative h-24 w-full overflow-hidden">
                    <div
                      className="pointer-events-none absolute left-0 top-0 origin-top-left"
                      style={{ width: 400, height: 533, transform: "scale(0.32)" }}
                    >
                      <PageView page={p} editing />
                    </div>
                  </div>
                  <span className="block truncate border-t border-border/40 px-2 py-1.5 text-[8px] uppercase tracking-[0.28em] text-muted-foreground">
                    {String(i + 1).padStart(2, "0")} — {p.name}
                  </span>
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 border-t border-border/50 px-4 py-3">
              <button
                onClick={duplicatePage}
                title="Duplicate page"
                className="flex h-8 w-8 items-center justify-center border border-border/60 text-foreground transition-colors hover:bg-foreground hover:text-background"
              >
                <Copy className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => movePage(-1)}
                title="Move earlier"
                className="flex h-8 w-8 items-center justify-center border border-border/60 text-foreground transition-colors hover:bg-foreground hover:text-background"
              >
                <ArrowUp className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => movePage(1)}
                title="Move later"
                className="flex h-8 w-8 items-center justify-center border border-border/60 text-foreground transition-colors hover:bg-foreground hover:text-background"
              >
                <ArrowDown className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={deletePage}
                title="Delete page"
                className="flex h-8 w-8 items-center justify-center border border-border/60 text-foreground transition-colors hover:bg-destructive hover:text-destructive-foreground"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </aside>

          {/* Canvas */}
          <div className="flex flex-col items-center gap-4 px-4 py-6 md:px-8">
            <div className="flex w-full max-w-[520px] items-center justify-between">
              <input
                value={page.name}
                onChange={(e) => setPage((p) => ({ ...p, name: e.target.value }))}
                aria-label="Page name"
                className="border-b border-transparent bg-transparent pb-1 text-[10px] uppercase tracking-[0.3em] text-muted-foreground hover:border-border focus:border-foreground focus:outline-none"
              />
              <span className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground">
                {String(index + 1).padStart(2, "0")} / {String(pages.length).padStart(2, "0")}
              </span>
            </div>
            <div
              ref={canvasRef}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerLeave={onPointerUp}
              onClick={() => setSelectedId(null)}
              className="relative w-full max-w-[520px] border border-border/60 shadow-[0_40px_90px_-40px_rgba(0,0,0,0.4)]"
              style={{ aspectRatio: "3 / 4", touchAction: "none" }}
            >
              <PageView page={page} editing />
              {page.blocks.map((b) => (
                <div
                  key={b.id}
                  onPointerDown={(e) => onPointerDown(e, b, "move")}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedId(b.id);
                  }}
                  className={`absolute cursor-move ${
                    selectedId === b.id ? "ring-1 ring-primary" : "hover:ring-1 hover:ring-border"
                  }`}
                  style={{ left: `${b.x}%`, top: `${b.y}%`, width: `${b.w}%`, height: `${b.h}%` }}
                >
                  {selectedId === b.id && (
                    <span
                      onPointerDown={(e) => onPointerDown(e, b, "size")}
                      className="absolute -bottom-1.5 -right-1.5 h-3 w-3 cursor-se-resize border border-primary bg-background"
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex w-full max-w-[520px] flex-wrap gap-2">
              {(
                [
                  { kind: "text" as const, icon: Type, label: "Text" },
                  { kind: "image" as const, icon: ImagePlus, label: "Image" },
                  { kind: "video" as const, icon: Film, label: "Film" },
                  { kind: "rule" as const, icon: Minus, label: "Rule" },
                  { kind: "widget" as const, icon: Sparkles, label: "Widget" },
                ]
              ).map(({ kind, icon: Icon, label }) => (
                <button
                  key={kind}
                  onClick={() => addBlock(kind)}
                  className="inline-flex items-center gap-2 border border-border/60 px-3 py-2 text-[9px] uppercase tracking-[0.3em] text-foreground transition-colors hover:bg-foreground hover:text-background"
                >
                  <Icon className="h-3.5 w-3.5" /> {label}
                </button>
              ))}
            </div>
          </div>

          {/* Inspector */}
          <aside className="border-t border-border/60 px-4 py-5 lg:border-l lg:border-t-0">
            <p className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground">Page</p>
            <div className="mt-3 grid gap-3">
              <label className="grid gap-1">
                <span className="text-[9px] uppercase tracking-[0.28em] text-muted-foreground">Paper</span>
                <select
                  value={page.tone}
                  onChange={(e) => setPage((p) => ({ ...p, tone: e.target.value as BuilderPage["tone"] }))}
                  className="border border-border/60 bg-background px-2 py-1.5 text-[11px] text-foreground"
                >
                  <option value="paper">Light leaf</option>
                  <option value="cover">Dark leaf</option>
                </select>
              </label>
              <label className="grid gap-1">
                <span className="text-[9px] uppercase tracking-[0.28em] text-muted-foreground">Transition</span>
                <select
                  value={page.transition}
                  onChange={(e) => setPage((p) => ({ ...p, transition: e.target.value as PageTransition }))}
                  className="border border-border/60 bg-background px-2 py-1.5 text-[11px] text-foreground"
                >
                  {TRANSITIONS.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </label>
              <div className="grid gap-1">
                <span className="text-[9px] uppercase tracking-[0.28em] text-muted-foreground">Background</span>
                <label className="inline-flex cursor-pointer items-center justify-between border border-border/60 px-3 py-2 text-[9px] uppercase tracking-[0.28em] text-foreground transition-colors hover:bg-foreground hover:text-background">
                  Upload plate
                  <ImagePlus className="h-3.5 w-3.5" />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => uploadBackground(e.target.files)}
                  />
                </label>
                {page.background && (
                  <button
                    onClick={() => setPage((p) => ({ ...p, background: undefined }))}
                    className="text-left text-[9px] uppercase tracking-[0.28em] text-muted-foreground hover:text-foreground"
                  >
                    Remove background
                  </button>
                )}
              </div>
            </div>

            <div className="mt-6 border-t border-border/50 pt-5">
              <p className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground">Element</p>
              {!selected ? (
                <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
                  Select an element on the page to edit it, or add one below the canvas.
                </p>
              ) : (
                <div className="mt-3 grid gap-3">
                  {selected.kind === "text" && (
                    <>
                      <label className="grid gap-1">
                        <span className="text-[9px] uppercase tracking-[0.28em] text-muted-foreground">Copy</span>
                        <textarea
                          value={selected.text ?? ""}
                          onChange={(e) => patchBlock(selected.id, { text: e.target.value })}
                          rows={4}
                          className="border border-border/60 bg-background px-2 py-1.5 text-[11px] leading-relaxed text-foreground"
                        />
                      </label>
                      <label className="grid gap-1">
                        <span className="text-[9px] uppercase tracking-[0.28em] text-muted-foreground">Style</span>
                        <select
                          value={selected.style ?? "body"}
                          onChange={(e) => patchBlock(selected.id, { style: e.target.value as TextStyle })}
                          className="border border-border/60 bg-background px-2 py-1.5 text-[11px] text-foreground"
                        >
                          {(Object.keys(TEXT_LABEL) as TextStyle[]).map((s) => (
                            <option key={s} value={s}>
                              {TEXT_LABEL[s]}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="grid gap-1">
                        <span className="text-[9px] uppercase tracking-[0.28em] text-muted-foreground">Alignment</span>
                        <select
                          value={selected.align ?? "left"}
                          onChange={(e) => patchBlock(selected.id, { align: e.target.value as Block["align"] })}
                          className="border border-border/60 bg-background px-2 py-1.5 text-[11px] text-foreground"
                        >
                          <option value="left">Left</option>
                          <option value="center">Centre</option>
                          <option value="right">Right</option>
                        </select>
                      </label>
                      <label className="grid gap-1">
                        <span className="text-[9px] uppercase tracking-[0.28em] text-muted-foreground">Ink</span>
                        <select
                          value={selected.tone ?? (page.tone === "cover" ? "light" : "dark")}
                          onChange={(e) => patchBlock(selected.id, { tone: e.target.value as Block["tone"] })}
                          className="border border-border/60 bg-background px-2 py-1.5 text-[11px] text-foreground"
                        >
                          <option value="dark">Dark</option>
                          <option value="light">Light</option>
                        </select>
                      </label>
                    </>
                  )}

                  {(selected.kind === "image" || selected.kind === "video") && (
                    <>
                      <label className="inline-flex cursor-pointer items-center justify-between border border-border/60 px-3 py-2 text-[9px] uppercase tracking-[0.28em] text-foreground transition-colors hover:bg-foreground hover:text-background">
                        Upload {selected.kind === "image" ? "image" : "film"}
                        <ImagePlus className="h-3.5 w-3.5" />
                        <input
                          type="file"
                          accept={selected.kind === "image" ? "image/*" : "video/*"}
                          className="hidden"
                          onChange={(e) => uploadToBlock(e.target.files, selected.id)}
                        />
                      </label>
                      <label className="grid gap-1">
                        <span className="text-[9px] uppercase tracking-[0.28em] text-muted-foreground">Or paste a URL</span>
                        <input
                          value={selected.src?.startsWith("data:") ? "" : selected.src ?? ""}
                          onChange={(e) => patchBlock(selected.id, { src: e.target.value })}
                          placeholder="https://"
                          className="border border-border/60 bg-background px-2 py-1.5 text-[11px] text-foreground"
                        />
                      </label>
                    </>
                  )}

                  {selected.kind !== "rule" && (
                    <label className="grid gap-1">
                      <span className="text-[9px] uppercase tracking-[0.28em] text-muted-foreground">Animation</span>
                      <select
                        value={selected.animation ?? "none"}
                        onChange={(e) => patchBlock(selected.id, { animation: e.target.value as BlockAnimation })}
                        className="border border-border/60 bg-background px-2 py-1.5 text-[11px] text-foreground"
                      >
                        <option value="none">None</option>
                        <option value="fade">Fade in</option>
                        <option value="rise">Rise</option>
                        <option value="ken">Slow zoom</option>
                      </select>
                    </label>
                  )}

                  <button
                    onClick={() => removeBlock(selected.id)}
                    className="inline-flex items-center justify-between border border-border/60 px-3 py-2 text-[9px] uppercase tracking-[0.28em] text-foreground transition-colors hover:bg-destructive hover:text-destructive-foreground"
                  >
                    Delete element
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
          </aside>
        </div>
      )}

      {/* Layout gallery */}
      {galleryOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:p-6">
          <div className="max-h-[88vh] w-full max-w-4xl overflow-y-auto border border-border/60 bg-background">
            <div className="sticky top-0 flex items-center justify-between border-b border-border/60 bg-background px-5 py-4">
              <div>
                <p className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground">Layout gallery</p>
                <p className="mt-1 font-serif text-2xl font-light text-foreground">Add a page</p>
              </div>
              <button
                onClick={() => setGalleryOpen(false)}
                aria-label="Close the layout gallery"
                className="flex h-9 w-9 items-center justify-center border border-border/60 text-foreground transition-colors hover:bg-foreground hover:text-background"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
              {LAYOUTS.map((l) => (
                <button
                  key={l.id}
                  onClick={() => addPage(l.id)}
                  className="group border border-border/60 text-left transition-colors hover:border-foreground"
                >
                  <div className="relative h-40 overflow-hidden border-b border-border/40">
                    <div
                      className="pointer-events-none absolute left-0 top-0 origin-top-left"
                      style={{ width: 400, height: 533, transform: "scale(0.55)" }}
                    >
                      <PageView page={l.build()} editing />
                    </div>
                  </div>
                  <div className="px-4 py-3">
                    <p className="text-[10px] uppercase tracking-[0.28em] text-foreground">{l.name}</p>
                    <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{l.note}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default FlipBuilder;
