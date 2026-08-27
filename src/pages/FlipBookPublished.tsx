/**
 * A published FLIP edition, read by anyone.
 *
 * Served at /flip/:slug on the Wonderlands host and at the author's own domain
 * (a CNAME pointed at the flip host resolves to the same route).
 */

import * as React from "react";
import { useParams, Link } from "react-router-dom";
import { Loader2, ArrowLeft } from "lucide-react";
import FlipBookReader from "@/components/flip/FlipBookReader";
import { loadPublishedBook, publicUrl, type FlipBookRow } from "@/lib/flip/flipPublish";
import type { BuilderDocV2 } from "@/components/flip/flipBuilderV2Types";

const FlipBookPublished: React.FC = () => {
  const { slug = "" } = useParams();
  const [state, setState] = React.useState<{ row: FlipBookRow; doc: BuilderDocV2 } | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;
    setLoading(true);
    loadPublishedBook(slug)
      .then((res) => {
        if (cancelled) return;
        setState(res);
      })
      .catch(() => setState(null))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [slug]);

  React.useEffect(() => {
    if (!state) return;
    document.title = `${state.doc.title} — FLIP edition`;
    const meta = document.querySelector('meta[name="description"]');
    meta?.setAttribute("content", `${state.doc.title} — an interactive flip edition published with Wonderlands World.`);
  }, [state]);

  if (loading)
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </main>
    );

  if (!state)
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
        <h1 className="font-serif text-3xl font-light text-foreground">This edition is not published</h1>
        <p className="max-w-md text-[12px] leading-relaxed text-muted-foreground">
          The link may be a draft, renamed, or taken offline by its author.
        </p>
        <Link to="/flip" className="inline-flex items-center gap-2 border border-border/60 px-4 py-2 text-[9px] uppercase tracking-[0.3em] text-foreground transition-colors hover:bg-foreground hover:text-background">
          <ArrowLeft className="h-3 w-3" /> Build your own
        </Link>
      </main>
    );

  return (
    <main className="min-h-screen bg-background">
      <h1 className="sr-only">{state.doc.title}</h1>
      <FlipBookReader
        doc={state.doc}
        bookId={state.row.id}
        shareUrl={publicUrl(state.row.slug, state.row.custom_domain)}
      />
    </main>
  );
};

export default FlipBookPublished;
