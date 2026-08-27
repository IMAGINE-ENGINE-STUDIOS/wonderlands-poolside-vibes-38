/**
 * FLIP Builder V2 — the full edition workshop.
 *
 * V1 could add pages and text. V2 is the whole studio:
 *  - Compose : every layout in the gallery, every V7 widget, drag/resize blocks
 *  - Palette : curated palettes, type sets, paper grain, depth — plus a shuffler
 *  - Motion  : page-turn character, corner hints, chapter tabs, autoplay
 *  - Narrator: $20/month voice with metered credits consumed as readers listen
 *  - Publish : free Wonderlands subdomain, custom domain, share link
 *  - API     : the flip surface exposed as data for the author to build against
 */

import * as React from "react";
import {
  Plus, Copy, Trash2, Type, ImagePlus, Film, Minus, LayoutTemplate, Eye, PenLine,
  RotateCcw, Sparkles, Columns2, ArrowUp, ArrowDown, X, Shuffle, Palette, Waves,
  Mic, Globe, Code2, Loader2, Check, Link2,
} from "lucide-react";
import usePersistentState from "@/hooks/usePersistentState";
import { useToast } from "@/hooks/use-toast";
import {
  LAYOUTS, TEXT_LABEL, uid,
  type Block, type BlockAnimation, type BuilderPage, type PageTransition, type TextStyle,
} from "./flipBuilderTypes";
import {
  FLIP_MOTIONS, FLIP_PALETTES, FLIP_TYPE_SETS, NARRATOR_CREDIT_PACKS, NARRATOR_MONTHLY_FEE,
  ensureV2, paletteOf, shuffleTheme, slugify, starterDocV2, themeVars,
  type BuilderDocV2, type FlipMotion,
} from "./flipBuilderV2Types";
import { FLIP_WIDGETS, widgetMeta } from "./flipWidgets";
import FlipBookReader, { FlipPageSurface } from "./FlipBookReader";
import {
  appUrl, isSlugFree, narratorState, publicUrl, saveBook, startNarratorSubscription, FLIP_HOST,
  type NarratorAccount,
} from "@/lib/flip/flipPublish";

/* ---------------------------------------------------------------- helpers */

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

const FAMILIES = ["All", "Covers", "Editorial", "Imagery", "Data", "Spreads", "Widgets"] as const;
const WIDGET_GROUPS = Array.from(new Set(FLIP_WIDGETS.map((w) => w.group)));
const TRANSITIONS: { id: PageTransition; label: string }[] = [
  { id: "flip", label: "Page turn" },
  { id: "fade", label: "Fade in" },
  { id: "rise", label: "Rise" },
  { id: "slide", label: "Slide" },
];

type Tab = "compose" | "palette" | "motion" | "narrator" | "publish" | "api";
const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "compose", label: "Compose", icon: LayoutTemplate },
  { id: "palette", label: "Palette", icon: Palette },
  { id: "motion", label: "Motion", icon: Waves },
  { id: "narrator", label: "Narrator", icon: Mic },
  { id: "publish", label: "Publish", icon: Globe },
  { id: "api", label: "API", icon: Code2 },
];

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <label className="grid gap-1">
    <span className="text-[9px] uppercase tracking-[0.28em] text-muted-foreground">{label}</span>
    {children}
  </label>
);

const inputCx = "border border-border/60 bg-background px-2 py-1.5 text-[11px] text-foreground";
const btnCx =
  "inline-flex items-center gap-2 border border-border/60 px-3 py-2 text-[9px] uppercase tracking-[0.3em] text-foreground transition-colors hover:bg-foreground hover:text-background";

/* ------------------------------------------------------------------ shell */

const FlipBuilderV2: React.FC = () => {
  const { toast } = useToast();
  const [raw, setRaw] = usePersistentState<BuilderDocV2>("flip.builder.v2.doc", starterDocV2());
  const doc = React.useMemo(() => ensureV2(raw), [raw]);
  const setDoc = setRaw as React.Dispatch<React.SetStateAction<BuilderDocV2>>;

  const [tab, setTab] = usePersistentState<Tab>("flip.builder.v2.tab", "compose");
  const [pageIndex, setPageIndex] = usePersistentState<number>("flip.builder.v2.page", 0);
  const [preview, setPreview] = usePersistentState<boolean>("flip.builder.v2.preview", false);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [galleryOpen, setGalleryOpen] = React.useState(false);
  const [galleryFamily, setGalleryFamily] = React.useState<string>("All");
  const [featuresOpen, setFeaturesOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [account, setAccount] = React.useState<NarratorAccount | null>(null);
  const canvasRef = React.useRef<HTMLDivElement>(null);

  const pages = doc.pages;
  const index = Math.min(pageIndex, Math.max(pages.length - 1, 0));
  const page = pages[index];
  const selected = page?.blocks.find((b) => b.id === selectedId) ?? null;
  const palette = paletteOf(doc.theme);

  /* --------------------------------------------------------------- document */
  const setPage = React.useCallback(
    (mutate: (p: BuilderPage) => BuilderPage) =>
      setDoc((d) => ({ ...d, pages: d.pages.map((p, i) => (i === index ? mutate(p) : p)) })),
    [index, setDoc],
  );

  const patchBlock = React.useCallback(
    (id: string, patch: Partial<Block>) =>
      setPage((p) => ({ ...p, blocks: p.blocks.map((b) => (b.id === id ? { ...b, ...patch } : b)) })),
    [setPage],
  );

  const addBlock = React.useCallback(
    (kind: Block["kind"], widgetId?: string) => {
      const block: Block =
        kind === "widget"
          ? { id: uid(), kind, x: 4, y: 8, w: 92, h: 70, widget: widgetId ?? FLIP_WIDGETS[0].id, scale: 0.6 }
          : kind === "text"
            ? { id: uid(), kind, x: 10, y: 40, w: 60, h: 10, text: "New text", style: "body", align: "left", animation: "fade" }
            : kind === "rule"
              ? { id: uid(), kind, x: 10, y: 50, w: 60, h: 1 }
              : { id: uid(), kind, x: 12, y: 12, w: 50, h: 36, animation: kind === "image" ? "ken" : "none" };
      setPage((p) => ({ ...p, blocks: [...p.blocks, block] }));
      setSelectedId(block.id);
    },
    [setPage],
  );

  const addPage = React.useCallback(
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

  const duplicatePage = React.useCallback(() => {
    setDoc((d) => {
      const src = d.pages[index];
      if (!src) return d;
      const copy: BuilderPage = { ...src, id: uid(), name: `${src.name} copy`, blocks: src.blocks.map((b) => ({ ...b, id: uid() })) };
      const next = [...d.pages];
      next.splice(index + 1, 0, copy);
      return { ...d, pages: next };
    });
    setPageIndex(index + 1);
  }, [index, setDoc, setPageIndex]);

  const deletePage = React.useCallback(() => {
    setDoc((d) => (d.pages.length <= 1 ? d : { ...d, pages: d.pages.filter((_, i) => i !== index) }));
    setPageIndex(Math.max(index - 1, 0));
    setSelectedId(null);
  }, [index, setDoc, setPageIndex]);

  const movePage = React.useCallback(
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

  /* ----------------------------------------------------------- drag/resize */
  const drag = React.useRef<{ id: string; mode: "move" | "size"; startX: number; startY: number; block: Block } | null>(null);

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
    if (d.mode === "move")
      patchBlock(d.id, {
        x: Math.min(Math.max(d.block.x + dx, -2), 96),
        y: Math.min(Math.max(d.block.y + dy, -2), 98),
      });
    else
      patchBlock(d.id, {
        w: Math.min(Math.max(d.block.w + dx, 4), 100),
        h: Math.min(Math.max(d.block.h + dy, d.block.kind === "rule" ? 1 : 3), 100),
      });
  };

  const uploadToBlock = async (files: FileList | null, id: string) => {
    const file = files?.[0];
    if (!file) return;
    if (file.type.startsWith("video/")) return patchBlock(id, { src: URL.createObjectURL(file), kind: "video" });
    patchBlock(id, { src: await readImage(file), kind: "image" });
  };

  /* -------------------------------------------------------------- publishing */
  const save = React.useCallback(
    async (publish: boolean) => {
      setSaving(true);
      try {
        const slug = slugify(doc.publish.slug || doc.title);
        if (!(await isSlugFree(slug, doc.publish.bookId))) {
          toast({ title: "That address is taken", description: `Try another name for ${FLIP_HOST}/${slug}.`, variant: "destructive" });
          return;
        }
        const row = await saveBook({ ...doc, publish: { ...doc.publish, slug, published: publish } });
        setDoc((d) => ({
          ...d,
          publish: { ...d.publish, slug: row.slug, published: row.published, bookId: row.id, shareToken: row.share_token },
        }));
        toast({
          title: publish ? "Edition published" : "Edition saved",
          description: publish ? publicUrl(row.slug, row.custom_domain) : "Your draft is stored on your account.",
        });
      } catch (err) {
        toast({
          title: "Could not save",
          description: err instanceof Error ? err.message : "Sign in to publish a flip book.",
          variant: "destructive",
        });
      } finally {
        setSaving(false);
      }
    },
    [doc, setDoc, toast],
  );

  React.useEffect(() => {
    if (!doc.publish.bookId) return;
    narratorState(doc.publish.bookId).then(setAccount).catch(() => setAccount(null));
  }, [doc.publish.bookId]);

  const subscribeNarrator = async (credits?: number) => {
    if (!doc.publish.bookId) {
      toast({ title: "Publish first", description: "Save the edition so the narrator has a book to read.", variant: "destructive" });
      return;
    }
    try {
      const res = await startNarratorSubscription(doc.publish.bookId, credits);
      if (res.url) window.open(res.url, "_blank", "noopener");
      setDoc((d) => ({ ...d, narrator: { ...d.narrator, enabled: true } }));
      narratorState(doc.publish.bookId).then(setAccount).catch(() => undefined);
    } catch (err) {
      toast({ title: "Billing unavailable", description: err instanceof Error ? err.message : "Try again shortly.", variant: "destructive" });
    }
  };

  const copy = async (value: string) => {
    await navigator.clipboard.writeText(value);
    toast({ title: "Copied", description: value });
  };

  if (!page) return null;

  /* ------------------------------------------------------------------- ui */

  return (
    <section aria-label="FLIP builder V2" className="bg-background">
      {/* masthead */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 px-4 py-4 md:px-8">
        <div className="flex min-w-0 items-baseline gap-3">
          <span className="font-serif text-xl font-light leading-none text-foreground">Flip It</span>
          <span className="border border-border/60 px-1.5 py-0.5 text-[8px] uppercase tracking-[0.3em] text-muted-foreground">V2</span>
          <input
            value={doc.title}
            onChange={(e) => setDoc((d) => ({ ...d, title: e.target.value }))}
            aria-label="Document title"
            className="min-w-0 flex-1 border-b border-border/60 bg-transparent pb-1 text-[10px] uppercase tracking-[0.3em] text-muted-foreground focus:border-foreground focus:outline-none"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => setPreview((v) => !v)} className={preview ? `${btnCx} bg-foreground text-background` : btnCx}>
            {preview ? <PenLine className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />} {preview ? "Edit" : "Read"}
          </button>
          <button onClick={() => save(false)} disabled={saving} className={btnCx}>
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />} Save
          </button>
          <button
            onClick={() => {
              if (window.confirm("Start a new edition? The current one is discarded.")) {
                setDoc(starterDocV2());
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

      {/* tabs */}
      <nav className="flex flex-wrap gap-2 border-b border-border/60 px-4 py-3 md:px-8" aria-label="Builder sections">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            aria-pressed={tab === id}
            className={`inline-flex items-center gap-2 border px-3 py-2 text-[9px] uppercase tracking-[0.3em] transition-colors ${
              tab === id ? "border-foreground bg-foreground text-background" : "border-border/60 text-foreground hover:border-foreground"
            }`}
          >
            <Icon className="h-3.5 w-3.5" /> {label}
          </button>
        ))}
      </nav>

      {preview ? (
        <FlipBookReader
          doc={doc}
          bookId={doc.publish.bookId}
          shareUrl={doc.publish.published ? publicUrl(doc.publish.slug, doc.publish.customDomain) : undefined}
        />
      ) : tab === "compose" ? (
        <div className="grid gap-0 lg:grid-cols-[190px_minmax(0,1fr)_280px]">
          {/* page rail */}
          <aside className="border-b border-border/60 lg:border-b-0 lg:border-r">
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground">Pages</span>
              <button onClick={() => setGalleryOpen(true)} aria-label="Add page" className="flex h-7 w-7 items-center justify-center border border-border/60 text-foreground transition-colors hover:bg-foreground hover:text-background">
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="flex gap-3 overflow-x-auto px-4 pb-4 lg:max-h-[70vh] lg:flex-col lg:overflow-y-auto" style={themeVars(doc.theme)}>
              {pages.map((p, i) => (
                <button
                  key={p.id}
                  onClick={() => { setPageIndex(i); setSelectedId(null); }}
                  className={`group w-32 shrink-0 border text-left transition-colors lg:w-full ${i === index ? "border-foreground" : "border-border/50 hover:border-foreground/50"}`}
                >
                  <div className="relative h-24 w-full overflow-hidden">
                    <div className="pointer-events-none absolute left-0 top-0 origin-top-left" style={{ width: 400, height: 533, transform: "scale(0.32)" }}>
                      <FlipPageSurface page={p} theme={doc.theme} still />
                    </div>
                  </div>
                  <span className="block truncate border-t border-border/40 px-2 py-1.5 text-[8px] uppercase tracking-[0.28em] text-muted-foreground">
                    {String(i + 1).padStart(2, "0")} — {p.name}
                  </span>
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 border-t border-border/50 px-4 py-3">
              <button onClick={duplicatePage} title="Duplicate page" className="flex h-8 w-8 items-center justify-center border border-border/60 text-foreground transition-colors hover:bg-foreground hover:text-background"><Copy className="h-3.5 w-3.5" /></button>
              <button onClick={() => movePage(-1)} title="Move earlier" className="flex h-8 w-8 items-center justify-center border border-border/60 text-foreground transition-colors hover:bg-foreground hover:text-background"><ArrowUp className="h-3.5 w-3.5" /></button>
              <button onClick={() => movePage(1)} title="Move later" className="flex h-8 w-8 items-center justify-center border border-border/60 text-foreground transition-colors hover:bg-foreground hover:text-background"><ArrowDown className="h-3.5 w-3.5" /></button>
              <button onClick={deletePage} title="Delete page" className="flex h-8 w-8 items-center justify-center border border-border/60 text-foreground transition-colors hover:bg-destructive hover:text-destructive-foreground"><Trash2 className="h-3.5 w-3.5" /></button>
            </div>
          </aside>

          {/* canvas */}
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
              onPointerUp={() => (drag.current = null)}
              onPointerLeave={() => (drag.current = null)}
              onClick={() => setSelectedId(null)}
              className="relative w-full max-w-[520px] border border-border/60 shadow-[0_40px_90px_-40px_rgba(0,0,0,0.4)]"
              style={{ aspectRatio: "3 / 4", touchAction: "none", ...themeVars(doc.theme) }}
            >
              <FlipPageSurface page={page} theme={doc.theme} still />
              {page.blocks.map((b) => (
                <div
                  key={b.id}
                  onPointerDown={(e) => onPointerDown(e, b, "move")}
                  onClick={(e) => { e.stopPropagation(); setSelectedId(b.id); }}
                  className={`absolute cursor-move ${selectedId === b.id ? "ring-1 ring-primary" : "hover:ring-1 hover:ring-border"}`}
                  style={{ left: `${b.x}%`, top: `${b.y}%`, width: `${b.w}%`, height: `${b.h}%` }}
                >
                  {selectedId === b.id && (
                    <span onPointerDown={(e) => onPointerDown(e, b, "size")} className="absolute -bottom-1.5 -right-1.5 h-3 w-3 cursor-se-resize border border-primary bg-background" />
                  )}
                </div>
              ))}
            </div>
            <div className="flex w-full max-w-[520px] flex-wrap gap-2">
              {([
                { kind: "text" as const, icon: Type, label: "Text" },
                { kind: "image" as const, icon: ImagePlus, label: "Image" },
                { kind: "video" as const, icon: Film, label: "Film" },
                { kind: "rule" as const, icon: Minus, label: "Rule" },
              ]).map(({ kind, icon: Icon, label }) => (
                <button key={kind} onClick={() => addBlock(kind)} className={btnCx}>
                  <Icon className="h-3.5 w-3.5" /> {label}
                </button>
              ))}
              <button onClick={() => setFeaturesOpen(true)} className={btnCx}><Sparkles className="h-3.5 w-3.5" /> Widget</button>
              <button onClick={() => setGalleryOpen(true)} className={btnCx}><LayoutTemplate className="h-3.5 w-3.5" /> Layouts</button>
            </div>
          </div>

          {/* inspector */}
          <aside className="min-w-0 overflow-hidden border-t border-border/60 px-4 py-5 lg:border-l lg:border-t-0">
            <p className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground">Page</p>
            <div className="mt-3 grid gap-3">
              <Field label="Paper">
                <select value={page.tone} onChange={(e) => setPage((p) => ({ ...p, tone: e.target.value as BuilderPage["tone"] }))} className={inputCx}>
                  <option value="paper">Light leaf</option>
                  <option value="cover">Dark leaf</option>
                </select>
              </Field>
              <Field label="Entrance">
                <select value={page.transition} onChange={(e) => setPage((p) => ({ ...p, transition: e.target.value as PageTransition }))} className={inputCx}>
                  {TRANSITIONS.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
                </select>
              </Field>
              <div className="grid gap-1">
                <span className="text-[9px] uppercase tracking-[0.28em] text-muted-foreground">Background</span>
                <label className="inline-flex cursor-pointer items-center justify-between border border-border/60 px-3 py-2 text-[9px] uppercase tracking-[0.28em] text-foreground transition-colors hover:bg-foreground hover:text-background">
                  Upload plate <ImagePlus className="h-3.5 w-3.5" />
                  <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const src = await readImage(file);
                    setPage((p) => ({ ...p, background: src }));
                  }} />
                </label>
                {page.background && (
                  <button onClick={() => setPage((p) => ({ ...p, background: undefined }))} className="text-left text-[9px] uppercase tracking-[0.28em] text-muted-foreground hover:text-foreground">
                    Remove background
                  </button>
                )}
              </div>
            </div>

            <div className="mt-6 border-t border-border/50 pt-5">
              <p className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground">Element</p>
              {!selected ? (
                <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">Select an element on the leaf, or add one under the canvas.</p>
              ) : (
                <div className="mt-3 grid gap-3">
                  {selected.kind === "text" && (
                    <>
                      <Field label="Copy">
                        <textarea value={selected.text ?? ""} onChange={(e) => patchBlock(selected.id, { text: e.target.value })} rows={4} className={`${inputCx} leading-relaxed`} />
                      </Field>
                      <Field label="Style">
                        <select value={selected.style ?? "body"} onChange={(e) => patchBlock(selected.id, { style: e.target.value as TextStyle })} className={inputCx}>
                          {(Object.keys(TEXT_LABEL) as TextStyle[]).map((s) => <option key={s} value={s}>{TEXT_LABEL[s]}</option>)}
                        </select>
                      </Field>
                      <Field label="Alignment">
                        <select value={selected.align ?? "left"} onChange={(e) => patchBlock(selected.id, { align: e.target.value as Block["align"] })} className={inputCx}>
                          <option value="left">Left</option><option value="center">Centre</option><option value="right">Right</option>
                        </select>
                      </Field>
                      <Field label="Ink">
                        <select value={selected.tone ?? (page.tone === "cover" ? "light" : "dark")} onChange={(e) => patchBlock(selected.id, { tone: e.target.value as Block["tone"] })} className={inputCx}>
                          <option value="dark">Ink</option><option value="light">Reverse</option>
                        </select>
                      </Field>
                    </>
                  )}

                  {(selected.kind === "image" || selected.kind === "video") && (
                    <>
                      <label className="inline-flex cursor-pointer items-center justify-between border border-border/60 px-3 py-2 text-[9px] uppercase tracking-[0.28em] text-foreground transition-colors hover:bg-foreground hover:text-background">
                        Upload {selected.kind === "image" ? "image" : "film"} <ImagePlus className="h-3.5 w-3.5" />
                        <input type="file" accept={selected.kind === "image" ? "image/*" : "video/*"} className="hidden" onChange={(e) => uploadToBlock(e.target.files, selected.id)} />
                      </label>
                      <Field label="Or paste a URL">
                        <input value={selected.src?.startsWith("data:") ? "" : selected.src ?? ""} onChange={(e) => patchBlock(selected.id, { src: e.target.value })} placeholder="https://" className={inputCx} />
                      </Field>
                    </>
                  )}

                  {selected.kind === "widget" && (
                    <>
                      <Field label="Widget">
                        <select value={selected.widget ?? ""} onChange={(e) => patchBlock(selected.id, { widget: e.target.value })} className={inputCx}>
                          {FLIP_WIDGETS.map((w) => <option key={w.id} value={w.id}>{w.group} — {w.label}</option>)}
                        </select>
                      </Field>
                      <p className="text-[10px] leading-relaxed text-muted-foreground">{widgetMeta(selected.widget)?.note}</p>
                      <Field label={`Fit — ${Math.round((selected.scale ?? 0.6) * 100)}%`}>
                        <input type="range" min={30} max={100} step={2} value={Math.round((selected.scale ?? 0.6) * 100)} onChange={(e) => patchBlock(selected.id, { scale: Number(e.target.value) / 100 })} />
                      </Field>
                    </>
                  )}

                  {selected.kind !== "rule" && (
                    <Field label="Animation">
                      <select value={selected.animation ?? "none"} onChange={(e) => patchBlock(selected.id, { animation: e.target.value as BlockAnimation })} className={inputCx}>
                        <option value="none">None</option><option value="fade">Fade in</option><option value="rise">Rise</option><option value="ken">Slow zoom</option>
                      </select>
                    </Field>
                  )}

                  <button
                    onClick={() => { setPage((p) => ({ ...p, blocks: p.blocks.filter((b) => b.id !== selected.id) })); setSelectedId(null); }}
                    className="inline-flex items-center justify-between border border-border/60 px-3 py-2 text-[9px] uppercase tracking-[0.28em] text-foreground transition-colors hover:bg-destructive hover:text-destructive-foreground"
                  >
                    Delete element <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
          </aside>
        </div>
      ) : tab === "palette" ? (
        /* ------------------------------------------------------------ palette */
        <div className="grid gap-8 px-4 py-8 md:px-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground">Palette controller — {FLIP_PALETTES.length} editions</p>
                <h2 className="mt-1 font-serif text-3xl font-light text-foreground">Colour, type, paper</h2>
              </div>
              <button onClick={() => setDoc((d) => ({ ...d, theme: shuffleTheme(d.theme) }))} className={btnCx}>
                <Shuffle className="h-3.5 w-3.5" /> Shuffle edition
              </button>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {FLIP_PALETTES.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setDoc((d) => ({ ...d, theme: { ...d.theme, paletteId: p.id } }))}
                  className={`border p-3 text-left transition-colors ${doc.theme.paletteId === p.id ? "border-foreground" : "border-border/60 hover:border-foreground/60"}`}
                >
                  <div className="flex h-12 overflow-hidden">
                    {[p.paper, p.ink, p.accent, p.muted, p.coverPaper].map((c) => (
                      <span key={c} className="flex-1" style={{ background: c }} />
                    ))}
                  </div>
                  <p className="mt-2 text-[10px] uppercase tracking-[0.28em] text-foreground">{p.name}</p>
                </button>
              ))}
            </div>

            <p className="mt-8 text-[9px] uppercase tracking-[0.3em] text-muted-foreground">Type sets</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {FLIP_TYPE_SETS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setDoc((d) => ({ ...d, theme: { ...d.theme, typeId: t.id } }))}
                  className={`border px-4 py-3 text-left transition-colors ${doc.theme.typeId === t.id ? "border-foreground" : "border-border/60 hover:border-foreground/60"}`}
                >
                  <span className="block text-2xl font-light leading-tight text-foreground" style={{ fontFamily: t.display }}>Wonderlands</span>
                  <span className="mt-1 block text-[11px] text-muted-foreground" style={{ fontFamily: t.text }}>{t.name} — body specimen</span>
                </button>
              ))}
            </div>

            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              <Field label={`Paper grain — ${doc.theme.grain}`}>
                <input type="range" min={0} max={100} value={doc.theme.grain} onChange={(e) => setDoc((d) => ({ ...d, theme: { ...d.theme, grain: Number(e.target.value) } }))} />
              </Field>
              <Field label={`Shadow depth — ${doc.theme.depth}`}>
                <input type="range" min={0} max={100} value={doc.theme.depth} onChange={(e) => setDoc((d) => ({ ...d, theme: { ...d.theme, depth: Number(e.target.value) } }))} />
              </Field>
            </div>
          </div>

          {/* live leaf */}
          <div className="lg:sticky lg:top-6 lg:self-start">
            <p className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground">Live leaf</p>
            <div className="mt-3 border border-border/60" style={{ aspectRatio: "3 / 4", ...themeVars(doc.theme) }}>
              <FlipPageSurface page={page} theme={doc.theme} still />
            </div>
            <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
              Every leaf, tab and rule repaints from the palette. Shuffle deals a new palette, type set and page motion at once.
            </p>
          </div>
        </div>
      ) : tab === "motion" ? (
        /* ------------------------------------------------------------- motion */
        <div className="px-4 py-8 md:px-8">
          <p className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground">Motion & interaction</p>
          <h2 className="mt-1 font-serif text-3xl font-light text-foreground">How the book behaves</h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {FLIP_MOTIONS.map((m) => (
              <button
                key={m.id}
                onClick={() => setDoc((d) => ({ ...d, theme: { ...d.theme, motion: m.id as FlipMotion } }))}
                className={`border px-4 py-3 text-left transition-colors ${doc.theme.motion === m.id ? "border-foreground bg-foreground text-background" : "border-border/60 hover:border-foreground"}`}
              >
                <p className="text-[10px] uppercase tracking-[0.28em]">{m.label}</p>
                <p className="mt-1 text-[11px] leading-relaxed opacity-80">{m.note}</p>
                <p className="mt-2 text-[9px] uppercase tracking-[0.28em] opacity-60">{m.flippingTime} ms</p>
              </button>
            ))}
          </div>
          <div className="mt-8 grid max-w-2xl gap-4">
            <label className="flex items-center justify-between border border-border/60 px-4 py-3">
              <span className="text-[10px] uppercase tracking-[0.28em] text-foreground">Chapter tabs</span>
              <input type="checkbox" checked={doc.theme.showTabs} onChange={(e) => setDoc((d) => ({ ...d, theme: { ...d.theme, showTabs: e.target.checked } }))} />
            </label>
            <label className="flex items-center justify-between border border-border/60 px-4 py-3">
              <span className="text-[10px] uppercase tracking-[0.28em] text-foreground">Lifted page corners</span>
              <input type="checkbox" checked={doc.theme.showCorners} onChange={(e) => setDoc((d) => ({ ...d, theme: { ...d.theme, showCorners: e.target.checked } }))} />
            </label>
            <Field label={doc.theme.autoplay ? `Autoplay — a spread every ${doc.theme.autoplay}s` : "Autoplay — off"}>
              <input type="range" min={0} max={30} value={doc.theme.autoplay} onChange={(e) => setDoc((d) => ({ ...d, theme: { ...d.theme, autoplay: Number(e.target.value) } }))} />
            </Field>
          </div>
        </div>
      ) : tab === "narrator" ? (
        /* ----------------------------------------------------------- narrator */
        <div className="grid gap-8 px-4 py-8 md:px-8 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div>
            <p className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground">V7 narrator</p>
            <h2 className="mt-1 font-serif text-3xl font-light text-foreground">A voice on every spread</h2>
            <p className="mt-3 max-w-2xl text-[12px] leading-relaxed text-muted-foreground">
              The narrator reads the open spread aloud in a real voice. It runs as a ${NARRATOR_MONTHLY_FEE} monthly
              subscription on this edition, then draws credits as your readers listen — one credit per reading by default.
              Recorded readings are kept, so the same spread is never billed twice.
            </p>

            <div className="mt-6 grid max-w-2xl gap-4">
              <label className="flex items-center justify-between border border-border/60 px-4 py-3">
                <span className="text-[10px] uppercase tracking-[0.28em] text-foreground">Narrator on this edition</span>
                <input type="checkbox" checked={doc.narrator.enabled} onChange={(e) => setDoc((d) => ({ ...d, narrator: { ...d.narrator, enabled: e.target.checked } }))} />
              </label>
              <label className="flex items-center justify-between border border-border/60 px-4 py-3">
                <span className="text-[10px] uppercase tracking-[0.28em] text-foreground">Read automatically when a spread opens</span>
                <input type="checkbox" checked={doc.narrator.autoRead} onChange={(e) => setDoc((d) => ({ ...d, narrator: { ...d.narrator, autoRead: e.target.checked } }))} />
              </label>
              <Field label="Voice">
                <select value={doc.narrator.voice} onChange={(e) => setDoc((d) => ({ ...d, narrator: { ...d.narrator, voice: e.target.value } }))} className={inputCx}>
                  {["alloy", "verse", "sage", "aria", "coral"].map((v) => <option key={v} value={v}>{v}</option>)}
                </select>
              </Field>
              <Field label={`Credits per reading — ${doc.narrator.creditsPerRead}`}>
                <input type="range" min={1} max={5} value={doc.narrator.creditsPerRead} onChange={(e) => setDoc((d) => ({ ...d, narrator: { ...d.narrator, creditsPerRead: Number(e.target.value) } }))} />
              </Field>
            </div>

            <p className="mt-8 text-[9px] uppercase tracking-[0.3em] text-muted-foreground">Subscribe & top up</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              {NARRATOR_CREDIT_PACKS.map((p) => (
                <button key={p.credits} onClick={() => subscribeNarrator(p.credits)} className="border border-border/60 px-4 py-4 text-left transition-colors hover:border-foreground">
                  <p className="font-serif text-3xl font-light text-foreground">{p.credits}</p>
                  <p className="mt-1 text-[10px] uppercase tracking-[0.28em] text-muted-foreground">readings / month</p>
                  <p className="mt-2 text-[11px] text-foreground">${NARRATOR_MONTHLY_FEE} narrator + ${p.price} credits</p>
                </button>
              ))}
            </div>
            <button onClick={() => subscribeNarrator()} className={`${btnCx} mt-4`}>
              <Mic className="h-3.5 w-3.5" /> Start narrator — ${NARRATOR_MONTHLY_FEE}/month
            </button>
          </div>

          <aside className="border border-border/60 p-5 lg:sticky lg:top-6 lg:self-start">
            <p className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground">Wallet</p>
            <p className="mt-2 font-serif text-4xl font-light text-foreground">{account ? Math.round(account.credits_balance) : "—"}</p>
            <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground">credits remaining</p>
            <p className="mt-4 text-[11px] leading-relaxed text-muted-foreground">
              {account?.active
                ? `Subscription active — $${account.monthly_fee}/month. Credits are drawn as readers listen and renew with the subscription.`
                : "No subscription on this edition yet. Publish the book, then start the narrator to open a wallet."}
            </p>
          </aside>
        </div>
      ) : tab === "publish" ? (
        /* ------------------------------------------------------------ publish */
        <div className="grid gap-8 px-4 py-8 md:px-8 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="max-w-2xl">
            <p className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground">Publish</p>
            <h2 className="mt-1 font-serif text-3xl font-light text-foreground">Put the edition online</h2>

            <div className="mt-6 grid gap-4">
              <Field label={`Free address — ${FLIP_HOST}/…`}>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-muted-foreground">{FLIP_HOST}/</span>
                  <input
                    value={doc.publish.slug}
                    onChange={(e) => setDoc((d) => ({ ...d, publish: { ...d.publish, slug: slugify(e.target.value) } }))}
                    className={`${inputCx} flex-1`}
                  />
                </div>
              </Field>
              <Field label="Your own domain (optional)">
                <input
                  value={doc.publish.customDomain}
                  onChange={(e) => setDoc((d) => ({ ...d, publish: { ...d.publish, customDomain: e.target.value.trim().toLowerCase() } }))}
                  placeholder="book.yourstudio.com"
                  className={inputCx}
                />
              </Field>
              <p className="text-[11px] leading-relaxed text-muted-foreground">
                Point a CNAME record for your domain at <span className="text-foreground">{FLIP_HOST}</span>, then publish. Until DNS
                resolves, the free address serves the same edition.
              </p>

              <div className="flex flex-wrap gap-2">
                <button onClick={() => save(true)} disabled={saving} className={`${btnCx} border-foreground bg-foreground text-background`}>
                  {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Globe className="h-3.5 w-3.5" />} Publish edition
                </button>
                <button onClick={() => save(false)} disabled={saving} className={btnCx}>Save as draft</button>
              </div>
            </div>
          </div>

          <aside className="border border-border/60 p-5 lg:sticky lg:top-6 lg:self-start">
            <p className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground">Share</p>
            {doc.publish.bookId ? (
              <div className="mt-3 grid gap-3">
                <button onClick={() => copy(appUrl(doc.publish.slug))} className="border border-border/60 px-3 py-2 text-left text-[11px] text-foreground transition-colors hover:border-foreground">
                  <span className="block text-[9px] uppercase tracking-[0.28em] text-muted-foreground">In-app link</span>
                  {appUrl(doc.publish.slug)}
                </button>
                <button onClick={() => copy(publicUrl(doc.publish.slug, doc.publish.customDomain))} className="border border-border/60 px-3 py-2 text-left text-[11px] text-foreground transition-colors hover:border-foreground">
                  <span className="block text-[9px] uppercase tracking-[0.28em] text-muted-foreground">Public link</span>
                  {publicUrl(doc.publish.slug, doc.publish.customDomain)}
                </button>
                <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
                  <Link2 className="mr-1 inline h-3 w-3" /> {doc.publish.published ? "Live" : "Draft — not yet public"}
                </p>
              </div>
            ) : (
              <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">Save the edition to generate its share links.</p>
            )}
          </aside>
        </div>
      ) : (
        /* ---------------------------------------------------------------- api */
        <div className="px-4 py-8 md:px-8">
          <p className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground">Flip API</p>
          <h2 className="mt-1 font-serif text-3xl font-light text-foreground">Build against the book</h2>
          <p className="mt-3 max-w-2xl text-[12px] leading-relaxed text-muted-foreground">
            Every edition is data. Read it, render it elsewhere, or generate pages from your own system and post them back.
          </p>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <div className="border border-border/60 p-5">
              <p className="text-[10px] uppercase tracking-[0.28em] text-foreground">Document shape</p>
              <pre className="mt-3 overflow-x-auto text-[10px] leading-relaxed text-muted-foreground">{`{
  title: string,
  theme: { paletteId, typeId, motion, grain, depth, showTabs, showCorners, autoplay },
  narrator: { enabled, voice, autoRead, creditsPerRead },
  publish: { slug, customDomain, published },
  pages: [{ id, name, tone: 'paper'|'cover', transition, background?, blocks: [
    { kind: 'text'|'image'|'video'|'rule'|'widget', x, y, w, h, ... }
  ]}]
}`}</pre>
            </div>
            <div className="border border-border/60 p-5">
              <p className="text-[10px] uppercase tracking-[0.28em] text-foreground">Read a published edition</p>
              <pre className="mt-3 overflow-x-auto text-[10px] leading-relaxed text-muted-foreground">{`GET /rest/v1/flip_books?slug=eq.${doc.publish.slug || "your-slug"}&published=eq.true

supabase.from('flip_books')
  .select('title, doc, theme, views')
  .eq('slug', '${doc.publish.slug || "your-slug"}')
  .eq('published', true)
  .maybeSingle();`}</pre>
            </div>
            <div className="border border-border/60 p-5">
              <p className="text-[10px] uppercase tracking-[0.28em] text-foreground">Narration & credits</p>
              <pre className="mt-3 overflow-x-auto text-[10px] leading-relaxed text-muted-foreground">{`POST /functions/v1/flip-narrator-billing
  { action: 'state' | 'subscribe' | 'consume', bookId, credits? }

POST /functions/v1/narrate-voice
  { text, key, voice }   // returns audio/mpeg, cached per spread`}</pre>
            </div>
            <div className="border border-border/60 p-5">
              <p className="text-[10px] uppercase tracking-[0.28em] text-foreground">Catalogue surfaces</p>
              <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
                {FLIP_WIDGETS.length} live widgets and {LAYOUTS.length} page layouts are addressable by id — drop
                <span className="text-foreground"> {`{ kind: 'widget', widget: '<id>' }`}</span> on any leaf.
              </p>
              <div className="mt-3 flex max-h-40 flex-wrap gap-1.5 overflow-y-auto">
                {FLIP_WIDGETS.map((w) => (
                  <button key={w.id} onClick={() => copy(w.id)} className="border border-border/50 px-2 py-1 text-[9px] uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:border-foreground hover:text-foreground">
                    {w.id}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* layout gallery */}
      {galleryOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:p-6">
          <div className="max-h-[88vh] w-full max-w-5xl overflow-y-auto border border-border/60 bg-background">
            <div className="sticky top-0 z-10 border-b border-border/60 bg-background px-5 py-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground">Layout gallery — {LAYOUTS.length} formats</p>
                  <p className="mt-1 font-serif text-2xl font-light text-foreground">Add a page</p>
                </div>
                <button onClick={() => setGalleryOpen(false)} aria-label="Close the layout gallery" className="flex h-9 w-9 shrink-0 items-center justify-center border border-border/60 text-foreground transition-colors hover:bg-foreground hover:text-background">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {FAMILIES.map((f) => (
                  <button key={f} onClick={() => setGalleryFamily(f)} className={`border px-3 py-1.5 text-[9px] uppercase tracking-[0.28em] transition-colors ${galleryFamily === f ? "border-foreground bg-foreground text-background" : "border-border/60 text-muted-foreground hover:text-foreground"}`}>
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3" style={themeVars(doc.theme)}>
              {LAYOUTS.filter((l) => galleryFamily === "All" || l.family === galleryFamily).map((l) => (
                <button key={l.id} onClick={() => addPage(l.id)} className="group border border-border/60 text-left transition-colors hover:border-foreground">
                  <div className="relative h-40 overflow-hidden border-b border-border/40">
                    <div className="pointer-events-none absolute left-0 top-0 flex origin-top-left" style={{ width: 400, height: 533, transform: "scale(0.55)" }}>
                      <FlipPageSurface page={l.build()} theme={doc.theme} still />
                    </div>
                    {l.buildFacing && (
                      <span className="absolute right-2 top-2 inline-flex items-center gap-1 border border-border/60 bg-background/85 px-1.5 py-1 text-[8px] uppercase tracking-[0.24em] text-foreground backdrop-blur">
                        <Columns2 className="h-3 w-3" /> Spread
                      </span>
                    )}
                  </div>
                  <div className="px-4 py-3">
                    <p className="text-[8px] uppercase tracking-[0.3em] text-muted-foreground">{l.family}</p>
                    <p className="mt-1 text-[10px] uppercase tracking-[0.28em] text-foreground">{l.name}</p>
                    <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{l.note}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* widget gallery */}
      {featuresOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:p-6">
          <div className="max-h-[88vh] w-full max-w-4xl overflow-y-auto border border-border/60 bg-background">
            <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-border/60 bg-background px-5 py-4">
              <div>
                <p className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground">Features — {FLIP_WIDGETS.length} live widgets</p>
                <p className="mt-1 font-serif text-2xl font-light text-foreground">Place a live widget</p>
              </div>
              <button onClick={() => setFeaturesOpen(false)} aria-label="Close the features gallery" className="flex h-9 w-9 shrink-0 items-center justify-center border border-border/60 text-foreground transition-colors hover:bg-foreground hover:text-background">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-5">
              {WIDGET_GROUPS.map((g) => (
                <div key={g} className="mb-6 last:mb-0">
                  <p className="border-b border-border/50 pb-2 text-[9px] uppercase tracking-[0.3em] text-muted-foreground">{g}</p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {FLIP_WIDGETS.filter((w) => w.group === g).map((w) => (
                      <button key={w.id} onClick={() => { addBlock("widget", w.id); setFeaturesOpen(false); }} className="border border-border/60 px-4 py-3 text-left transition-colors hover:border-foreground">
                        <p className="text-[10px] uppercase tracking-[0.28em] text-foreground">{w.label}</p>
                        <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{w.note}</p>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default FlipBuilderV2;
