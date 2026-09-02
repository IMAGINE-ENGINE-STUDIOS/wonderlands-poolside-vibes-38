/**
 * /product-manual — The Wonderlands Product Manual.
 *
 * A reference document, not a brochure. It holds the FLIP V7 edition (mounted
 * on demand so the page stays instant) and, beneath it, the engineering text
 * for every category and every tool: the physics, the equation, the code
 * clause and the exact method our software runs.
 *
 * Content lives in src/data/productManual.ts. This file is presentation only.
 */

import React, { Suspense, lazy, useMemo, useState, useDeferredValue } from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import {
  MANUAL_CHAPTERS,
  ALL_TOOLS,
  type ManualChapter,
  type ManualSection,
  type ToolManual,
} from "@/data/productManual";
import { usePersistentState } from "@/hooks/usePersistentState";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Compass,
  Ruler,
  Search,
  Sigma,
  Scale,
  ClipboardList,
  Printer,
  ArrowUpRight,
} from "lucide-react";

const FlipMagazine = lazy(() => import("@/components/flip/FlipMagazine"));

/* ── small presentational atoms ───────────────────────────────────────── */

const Rule: React.FC<{ label: string; icon?: React.ReactNode }> = ({ label, icon }) => (
  <div className="flex items-center gap-3 mb-4">
    {icon}
    <span className="text-[0.68rem] font-semibold uppercase tracking-[0.32em] text-muted-foreground">
      {label}
    </span>
    <span className="h-px flex-1 bg-border" />
  </div>
);

const SpecTable: React.FC<{ specs: NonNullable<ManualSection["specs"]> }> = ({ specs }) => (
  <dl className="mt-6 grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2">
    {specs.map((s) => (
      <div key={s.label} className="bg-card p-4">
        <dt className="text-[0.66rem] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          {s.label}
        </dt>
        <dd className="mt-1 font-medium text-foreground">{s.value}</dd>
        {s.note && <dd className="mt-1 text-sm leading-relaxed text-muted-foreground">{s.note}</dd>}
      </div>
    ))}
  </dl>
);

const FormulaBlock: React.FC<{ formulas: NonNullable<ManualSection["formulas"]> }> = ({ formulas }) => (
  <div className="mt-6 space-y-4">
    {formulas.map((f) => (
      <figure key={f.name} className="rounded-lg border border-border bg-muted/40 p-5">
        <figcaption className="flex items-center gap-2 text-[0.66rem] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          <Sigma className="h-3.5 w-3.5" aria-hidden />
          {f.name}
        </figcaption>
        <p className="mt-3 font-mono text-[0.95rem] leading-relaxed text-foreground">{f.expression}</p>
        <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
          {f.where.map((w) => (
            <li key={w} className="pl-4 -indent-4">
              — {w}
            </li>
          ))}
        </ul>
        {(f.implementedIn || f.source) && (
          <p className="mt-3 text-xs text-muted-foreground">
            {f.implementedIn && <span className="font-mono">{f.implementedIn}</span>}
            {f.implementedIn && f.source && <span> · </span>}
            {f.source}
          </p>
        )}
      </figure>
    ))}
  </div>
);

const CodeBlock: React.FC<{ codes: NonNullable<ManualSection["codes"]> }> = ({ codes }) => (
  <div className="mt-6 rounded-lg border border-primary/25 bg-primary/[0.04] p-5">
    <Rule label="Code & standards" icon={<Scale className="h-3.5 w-3.5 text-primary" aria-hidden />} />
    <ul className="space-y-3">
      {codes.map((c) => (
        <li key={c.clause} className="text-sm leading-relaxed">
          <span className="font-mono text-xs font-semibold text-primary">{c.clause}</span>
          <span className="mt-0.5 block text-muted-foreground">{c.requirement}</span>
        </li>
      ))}
    </ul>
  </div>
);

const SectionBody: React.FC<{ section: ManualSection }> = ({ section }) => (
  <section id={section.id} className="scroll-mt-28 border-t border-border py-10 first:border-t-0">
    <h3 className="text-2xl font-light tracking-tight text-foreground sm:text-[1.7rem]">{section.title}</h3>
    <div className="mt-4 space-y-4 text-[1.02rem] leading-[1.75] text-muted-foreground">
      {section.body.map((p, i) => (
        <p key={i}>{p}</p>
      ))}
    </div>
    {section.specs && <SpecTable specs={section.specs} />}
    {section.formulas && <FormulaBlock formulas={section.formulas} />}
    {section.codes && <CodeBlock codes={section.codes} />}
    {section.fieldNotes && (
      <div className="mt-6 border-l-2 border-primary/50 pl-5">
        <Rule label="Verify on site" icon={<Ruler className="h-3.5 w-3.5 text-primary" aria-hidden />} />
        <ul className="space-y-2 text-sm leading-relaxed text-muted-foreground">
          {section.fieldNotes.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>
      </div>
    )}
  </section>
);

const ToolCard: React.FC<{ tool: ToolManual }> = ({ tool }) => (
  <article className="rounded-lg border border-border bg-card p-6">
    <header className="flex flex-wrap items-baseline justify-between gap-3">
      <h4 className="text-lg font-medium text-foreground">{tool.name}</h4>
      {tool.route && (
        <Link
          to={tool.route}
          className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary hover:underline"
        >
          Open {tool.route} <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
      )}
    </header>
    <p className="mt-2 text-[0.98rem] leading-relaxed text-muted-foreground">{tool.purpose}</p>

    <div className="mt-5 grid gap-5 sm:grid-cols-2">
      <div>
        <Rule label="Inputs" />
        <ul className="space-y-1.5 text-sm text-muted-foreground">
          {tool.inputs.map((i) => (
            <li key={i}>{i}</li>
          ))}
        </ul>
      </div>
      <div>
        <Rule label="Outputs" />
        <ul className="space-y-1.5 text-sm text-muted-foreground">
          {tool.outputs.map((o) => (
            <li key={o}>{o}</li>
          ))}
        </ul>
      </div>
    </div>

    <div className="mt-5">
      <Rule label="Method" icon={<ClipboardList className="h-3.5 w-3.5" aria-hidden />} />
      <ol className="space-y-2 text-sm leading-relaxed text-muted-foreground">
        {tool.method.map((m, i) => (
          <li key={i} className="pl-6 -indent-6">
            <span className="font-mono text-xs text-primary">{String(i + 1).padStart(2, "0")}</span> {m}
          </li>
        ))}
      </ol>
    </div>

    <div className="mt-5 rounded-md bg-muted/50 p-4">
      <Rule label="Where it stops being accurate" />
      <ul className="space-y-2 text-sm leading-relaxed text-muted-foreground">
        {tool.limits.map((l) => (
          <li key={l}>{l}</li>
        ))}
      </ul>
    </div>
  </article>
);

const ChapterView: React.FC<{ chapter: ManualChapter }> = ({ chapter }) => (
  <article>
    <header className="border-b border-border pb-8">
      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.34em] text-primary">
        Chapter {chapter.numeral} · {chapter.kicker}
      </p>
      <h2 className="mt-3 text-4xl font-light leading-tight tracking-tight text-foreground sm:text-5xl">
        {chapter.title}
      </h2>
      <p className="mt-5 max-w-3xl text-[1.1rem] leading-[1.75] text-muted-foreground">{chapter.standfirst}</p>
    </header>

    {chapter.sections.map((s) => (
      <SectionBody key={s.id} section={s} />
    ))}

    <section className="border-t border-border pt-10">
      <Rule label="Tool reference" icon={<Compass className="h-3.5 w-3.5" aria-hidden />} />
      <div className="grid gap-5 lg:grid-cols-2">
        {chapter.tools.map((t) => (
          <ToolCard key={t.id} tool={t} />
        ))}
      </div>
    </section>
  </article>
);

/* ── page ─────────────────────────────────────────────────────────────── */

const ProductManual: React.FC = () => {
  // Chapter and edition state persist so a reload lands where the reader left.
  const [activeId, setActiveId] = usePersistentState<string>("manual.chapter", MANUAL_CHAPTERS[0].id);
  const [showEdition, setShowEdition] = usePersistentState<boolean>("manual.edition", false);
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);

  const active = useMemo(
    () => MANUAL_CHAPTERS.find((c) => c.id === activeId) ?? MANUAL_CHAPTERS[0],
    [activeId],
  );

  // Search runs over chapter titles, section titles and tool names only —
  // cheap, deterministic, and enough to find any entry in the manual.
  const results = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();
    if (q.length < 2) return null;
    const hits: { chapterId: string; label: string; kind: string; anchor?: string }[] = [];
    for (const c of MANUAL_CHAPTERS) {
      if (c.title.toLowerCase().includes(q)) hits.push({ chapterId: c.id, label: c.title, kind: "Chapter" });
      for (const s of c.sections)
        if (s.title.toLowerCase().includes(q))
          hits.push({ chapterId: c.id, label: s.title, kind: c.kicker, anchor: s.id });
    }
    for (const t of ALL_TOOLS)
      if (t.name.toLowerCase().includes(q)) hits.push({ chapterId: t.chapterId, label: t.name, kind: "Tool" });
    return hits.slice(0, 12);
  }, [deferredQuery]);

  const go = (id: string, anchor?: string) => {
    setActiveId(id);
    setQuery("");
    requestAnimationFrame(() => {
      const el = anchor ? document.getElementById(anchor) : null;
      (el ?? document.getElementById("manual-body"))?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Product Manual | Wonderlands World Engineering Reference</title>
        <meta
          name="description"
          content="The Wonderlands Product Manual: the engineering behind pools, saunas, enclosures, fencing, decks, turf and solar — with the formulas, code clauses and tool methods we build with."
        />
        <link rel="canonical" href="https://www.wonderlandsworld.com/product-manual" />
        <meta property="og:title" content="Product Manual | Wonderlands World" />
        <meta
          property="og:description"
          content="Engineering reference for every Wonderlands product and tool — formulas, code clauses and methods."
        />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      {/* masthead */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-6 py-14 sm:py-20">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.4em] text-primary">
            Wonderlands World · Technical Publication
          </p>
          <h1 className="mt-4 max-w-4xl text-5xl font-light leading-[1.05] tracking-tight text-foreground sm:text-7xl">
            The Product Manual
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-[1.75] text-muted-foreground">
            The complete edition, plus the engineering behind it. Every chapter states what the product physically is,
            the science that governs it, the code it must satisfy, and the exact method our own tools run — including
            where each tool stops being accurate.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button variant="outline" onClick={() => setShowEdition((v) => !v)}>
              <BookOpen className="mr-2 h-4 w-4" aria-hidden />
              {showEdition ? "Hide the FLIP V7 edition" : "Open the FLIP V7 edition"}
            </Button>
            <Button variant="ghost" onClick={() => window.print()}>
              <Printer className="mr-2 h-4 w-4" aria-hidden />
              Print this chapter
            </Button>
          </div>
        </div>
      </header>

      {/* the edition itself — mounted only on request so the manual loads instantly */}
      {showEdition && (
        <section aria-label="FLIP V7 edition" className="border-b border-border bg-muted/30 print:hidden">
          <Suspense
            fallback={
              <div className="flex h-[60vh] items-center justify-center text-sm uppercase tracking-[0.3em] text-muted-foreground">
                Preparing the edition…
              </div>
            }
          >
            <FlipMagazine variant="v7" />
          </Suspense>
        </section>
      )}

      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-14 lg:grid-cols-[17rem_1fr]">
        {/* contents rail */}
        <nav aria-label="Manual contents" className="lg:sticky lg:top-8 lg:self-start print:hidden">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search the manual"
              aria-label="Search the manual"
              className="pl-9"
            />
          </div>

          {results ? (
            <ul className="mt-4 space-y-1">
              {results.length === 0 && <li className="px-2 text-sm text-muted-foreground">No entry found.</li>}
              {results.map((r, i) => (
                <li key={`${r.label}-${i}`}>
                  <button
                    onClick={() => go(r.chapterId, r.anchor)}
                    className="w-full rounded-md px-2 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    <span className="block text-[0.6rem] font-semibold uppercase tracking-[0.22em] text-primary">
                      {r.kind}
                    </span>
                    {r.label}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <ol className="mt-6 space-y-1">
              {MANUAL_CHAPTERS.map((c) => {
                const isActive = c.id === active.id;
                return (
                  <li key={c.id}>
                    <button
                      onClick={() => go(c.id)}
                      aria-current={isActive ? "true" : undefined}
                      className={`w-full rounded-md border-l-2 px-3 py-2.5 text-left transition-colors ${
                        isActive
                          ? "border-primary bg-muted text-foreground"
                          : "border-transparent text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                      }`}
                    >
                      <span className="block text-[0.6rem] font-semibold uppercase tracking-[0.24em] text-primary">
                        {c.numeral} · {c.kicker}
                      </span>
                      <span className="text-sm leading-snug">{c.title}</span>
                    </button>
                  </li>
                );
              })}
            </ol>
          )}
        </nav>

        {/* chapter body */}
        <main id="manual-body" className="min-w-0">
          <ChapterView chapter={active} />
        </main>
      </div>
    </div>
  );
};

export default ProductManual;
