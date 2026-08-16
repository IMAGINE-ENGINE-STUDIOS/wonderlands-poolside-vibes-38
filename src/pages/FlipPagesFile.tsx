import * as React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Loader2, Search, ArrowRight } from 'lucide-react';
import {
  buildFlipBookOutline,
  getCachedFlipBookOutline,
  type FlipBookOutline,
  type OutlineChapter,
} from '@/lib/flipBookOutline';
import usePersistentState from '@/hooks/usePersistentState';

/**
 * The Page File — every page of the FLIP book, numbered from the index to the
 * last leaf, exactly as it is printed. Genius reads the same registry, so any
 * page listed here can be opened, read aloud, or turned to on request.
 */
const FlipPagesFile: React.FC = () => {
  React.useEffect(() => {
    document.title = 'FLIP Page File — Every Page of the Wonderlands Book';
    const desc = document.querySelector('meta[name="description"]');
    if (desc)
      desc.setAttribute(
        'content',
        'The complete numbered file of the Wonderlands FLIP book: every edition, product book and page, from the index to the last leaf.',
      );
  }, []);

  const [outline, setOutline] = React.useState<FlipBookOutline | null>(() => getCachedFlipBookOutline());
  const [query, setQuery] = usePersistentState<string>('flip.pagefile.query', '');

  React.useEffect(() => {
    if (outline) return;
    let alive = true;
    buildFlipBookOutline().then((o) => alive && setOutline(o));
    return () => {
      alive = false;
    };
  }, [outline]);

  const chapters = React.useMemo<OutlineChapter[]>(() => {
    if (!outline) return [];
    const q = query.trim().toLowerCase();
    if (!q) return outline.chapters;
    return outline.chapters
      .map((c) => ({
        ...c,
        pages: c.pages.filter(
          (p) =>
            p.title.toLowerCase().includes(q) ||
            p.label.toLowerCase().includes(q) ||
            String(p.number) === q,
        ),
      }))
      .filter((c) => c.pages.length > 0 || c.title.toLowerCase().includes(q));
  }, [outline, query]);

  return (
    <main className="min-h-screen bg-background text-foreground">

      <header className="border-b border-border/60 px-6 py-10 sm:px-10">
        <p className="text-[9px] uppercase tracking-[0.45em] text-muted-foreground">Wonderlands World — FLIP</p>
        <h1 className="mt-3 font-serif text-4xl font-light leading-none sm:text-5xl">The Page File</h1>
        <p className="mt-4 max-w-2xl text-[13px] leading-relaxed text-muted-foreground">
          Every page in the current edition of the book, numbered in order. Select any line and the book opens on
          that leaf — Genius can turn to the same pages by name or by number.
        </p>

        <div className="mt-7 flex flex-wrap items-center gap-3">
          <label className="flex min-w-[16rem] flex-1 items-center gap-2 border border-border/70 px-3 py-2.5">
            <Search className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search a page, a model, a page number…"
              aria-label="Search pages"
              className="min-w-0 flex-1 bg-transparent text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
          </label>
          <Link
            to="/flip"
            className="inline-flex items-center gap-2 border border-foreground px-4 py-2.5 text-[9px] uppercase tracking-[0.3em] transition-colors hover:bg-foreground hover:text-background"
          >
            <BookOpen className="h-3.5 w-3.5" /> Open the book
          </Link>
          {outline && (
            <span className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground">
              {outline.totalPages.toLocaleString()} pages
            </span>
          )}
        </div>
      </header>

      {!outline ? (
        <p className="flex items-center gap-2 px-6 py-16 text-[13px] text-muted-foreground sm:px-10">
          <Loader2 className="h-4 w-4 animate-spin" /> Collating the book…
        </p>
      ) : (
        <div className="divide-y divide-border/50">
          {chapters.map((chapter) => (
            <section key={chapter.id} className="px-6 py-8 sm:px-10">
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <h2 className="font-serif text-2xl font-light">{chapter.title}</h2>
                <p className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground">
                  {chapter.kind === 'front' ? 'Front matter' : chapter.kind === 'edition' ? 'Edition' : 'Product book'}
                  {chapter.subtitle ? ` · ${chapter.subtitle}` : ''}
                </p>
              </div>

              <ol className="mt-5 grid gap-x-8 gap-y-1 sm:grid-cols-2 xl:grid-cols-3">
                {chapter.pages.map((page) => (
                  <li key={`${chapter.id}-${page.number}`}>
                    <Link
                      to={page.href}
                      className="group flex items-baseline gap-3 border-b border-dotted border-border/60 py-2 transition-colors hover:border-foreground"
                    >
                      <span className="w-12 shrink-0 font-mono text-[11px] tabular-nums text-muted-foreground">
                        {page.number}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-[13px] text-foreground">{page.title}</span>
                      <span className="shrink-0 text-[9px] uppercase tracking-[0.24em] text-muted-foreground">
                        {page.label}
                      </span>
                      <ArrowRight
                        className="h-3 w-3 shrink-0 opacity-0 transition-opacity group-hover:opacity-70"
                        aria-hidden
                      />
                    </Link>
                  </li>
                ))}
              </ol>
            </section>
          ))}
        </div>
      )}
    </main>
  );
};

export default FlipPagesFile;
