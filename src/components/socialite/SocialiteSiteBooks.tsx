/**
 * Website books console (SOCIALITE → Admin, main admins only).
 * Pick any published FLIP V3 book and drop it into a spot on the main page or a
 * suite; the site renders it through <PlacedFlipBook slot=…/>. A live preview of
 * the chosen page sits on the right. Writes are protected by RLS (is_main_admin).
 */
import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { loadPlacements, type Placement } from "@/components/flip/PlacedFlipBook";

type Book = { id: string; title: string; slug: string; published: boolean };
type Slot = { id: string; label: string; path: string };

const HOME: Slot[] = [
  { id: "home:top", label: "Main page — under the opening", path: "/" },
  { id: "home:middle", label: "Main page — before the catalogue", path: "/" },
  { id: "home:bottom", label: "Main page — end of page", path: "/" },
];

const card = "rounded-[18px] border border-zinc-800 bg-[#161617]";
const pill = "px-3 py-1.5 rounded-full text-[12px] font-medium border border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-white hover:text-black transition disabled:opacity-40";

export default function SocialiteSiteBooks() {
  const [books, setBooks] = useState<Book[]>([]);
  const [placements, setPlacements] = useState<Placement[]>([]);
  const [suites, setSuites] = useState<Slot[]>([]);
  const [choice, setChoice] = useState<Record<string, string>>({});
  const [preview, setPreview] = useState<string>("/");
  const [busy, setBusy] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);

  const refresh = async () => {
    const [{ data }, list] = await Promise.all([
      supabase.from("flip_books").select("id,title,slug,published").order("updated_at", { ascending: false }).limit(500),
      loadPlacements(true),
    ]);
    setBooks((data ?? []) as Book[]);
    setPlacements(list);
  };

  useEffect(() => {
    void refresh();
    Promise.all([import("@/components/FlipIndex"), import("@/lib/suiteRoutes")]).then(([m, r]) => {
      const dedicated = (r as { DEDICATED_SUITES?: Record<string, string> }).DEDICATED_SUITES ?? {};
      setSuites(m.ITEMS.map((i) => ({ id: `suite:${i.id}`, label: `${i.label} suite`, path: dedicated[i.id] ?? `/suites/${i.id}` })));
    });
  }, []);

  const slots = useMemo(() => [...HOME, ...suites], [suites]);
  const published = books.filter((b) => b.published);
  const placed = (slot: string) => placements.find((p) => p.slot === slot);

  const drop = async (slot: Slot) => {
    const book = published.find((b) => b.id === (choice[slot.id] ?? placed(slot.id)?.book_id));
    if (!book) return setNote("Choose a published book first.");
    setBusy(slot.id); setNote(null);
    const { error } = await supabase.from("flip_site_placements").upsert(
      { slot: slot.id, book_id: book.id, slug: book.slug, title: book.title, active: true, updated_at: new Date().toISOString() },
      { onConflict: "slot" },
    );
    setBusy(null);
    if (error) return setNote("Only main admins can place books.");
    setNote(`"${book.title}" is now live on ${slot.label}.`);
    setPreview(slot.path);
    void refresh();
  };

  const remove = async (slot: Slot) => {
    setBusy(slot.id);
    await supabase.from("flip_site_placements").delete().eq("slot", slot.id);
    setBusy(null);
    setNote(`${slot.label} is back to its normal look.`);
    void refresh();
  };

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className={`${card} p-5`}>
        <h2 className="text-[16px] font-semibold text-zinc-100">Website books</h2>
        <p className="mt-1 text-[12px] text-zinc-500">
          Build a book in Flip Builder V3, publish it, then drop it anywhere on the website. Only published books can be placed.
        </p>
        {!published.length && <p className="mt-4 text-[12px] text-amber-400">No published books yet — publish one in Flip Builder V3 first.</p>}
        {note && <p className="mt-3 text-[12px] text-zinc-300">{note}</p>}
        <div className="mt-4 grid max-h-[640px] gap-2 overflow-y-auto pr-1">
          {slots.map((s) => {
            const p = placed(s.id);
            return (
              <div key={s.id} className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <button onClick={() => setPreview(s.path)} className="text-left text-[13px] font-medium text-zinc-200 hover:underline">{s.label}</button>
                  <span className={`text-[11px] ${p ? "text-emerald-400" : "text-zinc-500"}`}>{p ? `Live: ${p.title ?? p.slug}` : "Normal look"}</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <select
                    value={choice[s.id] ?? p?.book_id ?? ""}
                    onChange={(e) => setChoice((c) => ({ ...c, [s.id]: e.target.value }))}
                    className="min-w-0 flex-1 rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-[12px] text-zinc-200"
                  >
                    <option value="">Choose a book…</option>
                    {published.map((b) => <option key={b.id} value={b.id}>{b.title}</option>)}
                  </select>
                  <button disabled={busy === s.id} onClick={() => drop(s)} className={pill}>Drop here</button>
                  {p && <button disabled={busy === s.id} onClick={() => remove(s)} className={pill}>Remove</button>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className={`${card} overflow-hidden`}>
        <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-2.5">
          <span className="text-[12px] text-zinc-400">Live preview · {preview}</span>
          <a href={preview} target="_blank" rel="noreferrer" className="text-[12px] text-zinc-300 hover:underline">Open page</a>
        </div>
        <iframe key={preview + placements.length} title="Website preview" src={preview} className="h-[700px] w-full bg-white" loading="lazy" />
      </div>
    </div>
  );
}
