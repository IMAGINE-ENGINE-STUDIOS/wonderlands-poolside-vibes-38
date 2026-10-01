/**
 * PlacedFlipBook — renders the FLIP book an admin dropped into a website slot
 * (table flip_site_placements, managed in SOCIALITE → Admin → Website books).
 * Renders nothing when the slot is empty, so pages look exactly as before.
 * One placements fetch per session is shared by every slot on the page.
 */
import * as React from "react";
import { supabase } from "@/integrations/supabase/client";
import { loadPublishedBook } from "@/lib/flip/flipPublish";
import type { BuilderDocV2 } from "./flipBuilderV2Types";

const FlipBookReader = React.lazy(() => import("./FlipBookReader"));

export type Placement = { slot: string; slug: string; title: string | null; active: boolean; book_id: string | null };

let placementsTask: Promise<Placement[]> | null = null;
export const loadPlacements = (fresh = false) => {
  if (!placementsTask || fresh) {
    placementsTask = Promise.resolve(
      supabase.from("flip_site_placements").select("slot,slug,title,active,book_id"),
    ).then(({ data }) => (data ?? []) as Placement[]).catch(() => []);
  }
  return placementsTask;
};

const PlacedFlipBook: React.FC<{ slot: string; className?: string }> = ({ slot, className }) => {
  const [doc, setDoc] = React.useState<{ doc: BuilderDocV2; id: string } | null>(null);
  React.useEffect(() => {
    let live = true;
    loadPlacements().then(async (list) => {
      const p = list.find((x) => x.slot === slot && x.active);
      if (!p) return;
      const res = await loadPublishedBook(p.slug).catch(() => null);
      if (live && res) setDoc({ doc: res.doc, id: res.row.id });
    });
    return () => { live = false; };
  }, [slot]);
  if (!doc) return null;
  return (
    <section aria-label={doc.doc.title} className={className}>
      <React.Suspense fallback={null}>
        <FlipBookReader doc={doc.doc} bookId={doc.id} />
      </React.Suspense>
    </section>
  );
};

export default PlacedFlipBook;
