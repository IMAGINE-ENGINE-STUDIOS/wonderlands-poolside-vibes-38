/**
 * SOCIALITE Campaign Console — every email campaign opens as a FLIP book.
 * Main admin: Wonderlands templates + daily-rotation rows; save into the daily
 * schedule or send to all clients (send-bulk-email).
 * Regular users: neutral starter templates (USER_TEMPLATES) and their own
 * campaigns; sending goes to THEIR uploaded contacts via socialite-send (Shield
 * + billing apply), with no Wonderlands branding in the email.
 * Everyone: "Import flip book" turns any of their Flip Builder V3 books into a
 * campaign to edit. Books persist per campaign under "socialite.campaign.<key>".
 */
import { lazy, Suspense, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { cacheFlush, cacheRead } from "@/lib/uiCache";
import { CAMPAIGN_TEMPLATES, USER_TEMPLATES, configToDoc, docToEmailHtml } from "@/lib/socialite/campaignFlip";
import { ensureV2, type BuilderDocV2 } from "@/components/flip/flipBuilderV2Types";
import usePersistentState from "@/hooks/usePersistentState";

const FlipBuilderV2 = lazy(() => import("@/components/flip/FlipBuilderV2"));
type Row = { campaign_key: string; title: string; subject: string; html: string; is_active: boolean; position: number; updated_at: string };
type Item = { key: string; title: string; subject: string; seed: BuilderDocV2; row?: Row };
type Saved = { key: string; title: string; subject: string; seed: BuilderDocV2 };
type BookPick = { id: string; title: string; doc: BuilderDocV2 };
const card = "rounded-[18px] border border-zinc-800 bg-[#161617]";
const pill = "px-3 py-1.5 rounded-full text-[12px] font-medium border border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-white hover:text-black transition disabled:opacity-40";
const keyOf = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40) + "-" + Date.now().toString(36);

export default function SocialiteCampaignConsole({ isOwner = true }: { isOwner?: boolean }) {
  const [rows, setRows] = useState<Row[]>([]);
  const [mine, setMine] = usePersistentState<Saved[]>("pf_campaigns_mine", []);
  const [open, setOpen] = useState<Item | null>(null);
  const [subject, setSubject] = useState("");
  const [preview, setPreview] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [books, setBooks] = useState<BookPick[] | null>(null);

  const load = () => { if (isOwner) supabase.from("daily_email_rotation").select("campaign_key,title,subject,html,is_active,position,updated_at").order("position").then(({ data }) => setRows((data as Row[]) ?? [])); };
  useEffect(() => { load(); }, [isOwner]);

  const templates = isOwner ? CAMPAIGN_TEMPLATES : USER_TEMPLATES;
  const items: Item[] = [
    ...mine.map((m) => ({ ...m, seed: ensureV2(m.seed) })),
    ...templates.map((t) => ({ key: t.key, title: t.title, subject: t.subject, seed: configToDoc(t.title, t.config, undefined, isOwner ? undefined : null), row: rows.find((r) => r.campaign_key === t.key) })),
    ...(isOwner ? rows.filter((r) => !CAMPAIGN_TEMPLATES.some((t) => t.key === r.campaign_key) && !mine.some((m) => m.key === r.campaign_key)).map((r) => ({ key: r.campaign_key, title: r.title, subject: r.subject, seed: configToDoc(r.title, {}, r.html), row: r })) : []),
  ];
  const sk = (k: string) => `socialite.campaign.${k}`;
  const currentDoc = (): BuilderDocV2 => { cacheFlush(); return ensureV2(cacheRead(`${sk(open!.key)}.doc`, open!.seed)); };
  const html = () => docToEmailHtml(currentDoc(), undefined, isOwner);
  const pick = (it: Item) => { setOpen(it); setSubject(it.row?.subject ?? it.subject); setPreview(""); setNote(""); };
  const addMine = (s: Saved) => { setMine((l) => [s, ...l.filter((x) => x.key !== s.key)]); pick(s); };

  const save = async () => {
    setBusy(true);
    const doc = currentDoc();
    const payload = { campaign_key: open!.key, title: doc.title || open!.title, subject, html: html(), updated_at: new Date().toISOString() };
    const { error } = open!.row
      ? await supabase.from("daily_email_rotation").update(payload).eq("campaign_key", open!.key)
      : await supabase.from("daily_email_rotation").insert({ ...payload, position: rows.length, is_active: true });
    setBusy(false); setNote(error ? "Couldn't save. Please try again." : "Saved — this version now goes out in the daily schedule.");
    load();
  };
  const sendAll = async () => {
    if (!confirm(`Send "${subject}" to ALL clients now?`)) return;
    setBusy(true);
    const { data, error } = await supabase.functions.invoke("send-bulk-email", { body: { send_to_all: true, custom_subject: subject, custom_html: html(), template_name: open!.title } });
    setBusy(false); setNote(error ? "Couldn't send right now." : `Sent ${data?.successful ?? 0}${data?.failed ? ` · ${data.failed} failed` : ""}.`);
  };
  const sendMine = async () => {
    setBusy(true); setNote("");
    const { data: list } = await (supabase as any).from("socialite_contacts").select("id,email").not("email", "is", null).limit(5000);
    const ids: string[] = (list ?? []).filter((c: any) => c.email).map((c: any) => c.id);
    if (!ids.length) { setBusy(false); return setNote("You have no contacts with an email yet — add them under Email · SMS · Calls."); }
    if (!confirm(`Send "${subject}" to your ${ids.length} contact(s)?`)) { setBusy(false); return; }
    const body = html(); let ok = 0, failed = 0;
    for (let i = 0; i < ids.length; i += 200) {
      const { data, error } = await supabase.functions.invoke("socialite-send", { body: { channel: "email", contact_ids: ids.slice(i, i + 200), subject, message: currentDoc().title || subject, html: body } });
      if (error) { setBusy(false); return setNote("Couldn't send — check your plan, credits or Shield warnings."); }
      ok += data?.successful || 0; failed += data?.failed || 0;
    }
    setBusy(false); setNote(`Sent ${ok}${failed ? ` · ${failed} failed` : ""}.`);
  };
  const newCampaign = () => {
    const name = prompt("Campaign name"); if (!name) return;
    addMine({ key: keyOf(name), title: name, subject: `{{first_name}}, ${name}`, seed: configToDoc(name, { headline: name }, undefined, isOwner ? undefined : null) });
  };
  const openBooks = async () => {
    setBooks([]);
    const { data: auth } = await supabase.auth.getUser();
    const list: BookPick[] = [];
    const local = cacheRead<BuilderDocV2 | null>("socialite.flip.doc", null);
    if (local?.pages?.length) list.push({ id: "local", title: `${local.title || "Untitled"} (Flip Builder, current)`, doc: ensureV2(local) });
    if (auth?.user) {
      const { data } = await supabase.from("flip_books").select("id,title,doc").eq("owner_id", auth.user.id).order("updated_at", { ascending: false }).limit(100);
      (data ?? []).forEach((b: any) => list.push({ id: b.id, title: b.title, doc: ensureV2(b.doc) }));
    }
    setBooks(list);
  };
  const importBook = (b: BookPick) => {
    setBooks(null);
    addMine({ key: keyOf(b.title), title: b.doc.title || b.title, subject: `{{first_name}}, ${b.doc.title || b.title}`, seed: JSON.parse(JSON.stringify(b.doc)) });
  };

  if (open) return (
    <div className="space-y-4">
      <div className={`${card} p-4 flex flex-wrap items-center gap-2`}>
        <button className={pill} onClick={() => setOpen(null)}>Back to campaigns</button>
        <div className="text-[14px] font-semibold text-zinc-100 mr-2">{open.title}</div>
        <input value={subject} onChange={(e) => setSubject(e.target.value)} className="flex-1 min-w-[220px] rounded-full bg-zinc-950 border border-zinc-800 px-4 py-1.5 text-[13px] text-zinc-100" placeholder="Subject" />
        <button className={pill} onClick={() => setPreview(preview ? "" : html())}>{preview ? "Back to editing" : "Preview email"}</button>
        {isOwner ? <>
          <button className={pill} disabled={busy} onClick={save}>Save to daily schedule</button>
          <button className={pill} disabled={busy} onClick={sendAll}>Send to all clients</button>
        </> : <button className={pill} disabled={busy} onClick={sendMine}>Send to my contacts</button>}
        {note && <div className="w-full text-[12px] text-zinc-400">{note}</div>}
      </div>
      {preview
        ? <iframe title="Email preview" srcDoc={preview} className="w-full h-[80vh] rounded-[18px] bg-white" />
        : <div className="rounded-[18px] overflow-hidden bg-background text-foreground"><Suspense fallback={<div className="p-6 text-[13px] text-zinc-500">Opening the book…</div>}><FlipBuilderV2 key={open.key} storageKey={sk(open.key)} initialDoc={open.seed} blank={!isOwner} /></Suspense></div>}
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[13px] text-zinc-500">Every email campaign as a FLIP book. Start from a template, import one of your flip books, or start fresh.</p>
        <div className="flex gap-2">
          <button className={pill} onClick={openBooks}>Import flip book</button>
          <button className={pill} onClick={newCampaign}>New campaign</button>
        </div>
      </div>
      {books && (
        <div className={`${card} p-4 space-y-2`}>
          <div className="flex items-center justify-between">
            <div className="text-[13px] font-semibold text-zinc-100">Choose a flip book</div>
            <button className={pill} onClick={() => setBooks(null)}>Close</button>
          </div>
          {!books.length && <p className="text-[12px] text-zinc-500">No flip books yet — make one in Flip Builder V3 and save it.</p>}
          <div className="grid sm:grid-cols-2 gap-2">
            {books.map((b) => (
              <button key={b.id} onClick={() => importBook(b)} className="rounded-xl border border-zinc-800 bg-zinc-950/60 px-3 py-2 text-left text-[13px] text-zinc-200 hover:border-zinc-600">
                {b.title} <span className="text-zinc-500">· {b.doc.pages.length} pages</span>
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {items.map((it) => {
          const cover = it.seed.pages[0]?.blocks.find((b) => b.kind === "image")?.src;
          const own = mine.some((m) => m.key === it.key);
          return (
            <div key={it.key} className={`${card} overflow-hidden hover:border-zinc-600 transition`}>
              <button onClick={() => pick(it)} className="block w-full text-left">
                {cover ? <img src={cover} alt="" loading="lazy" className="h-32 w-full object-cover" /> : <div className="h-32 bg-zinc-900" />}
                <div className="p-4 pb-2">
                  <div className="text-[14px] font-semibold text-zinc-100">{it.title}</div>
                  <div className="text-[12px] text-zinc-500 truncate">{it.row?.subject ?? it.subject}</div>
                  <div className="text-[11px] text-zinc-500 mt-1">{it.row ? `${it.row.is_active ? "In daily schedule" : "Paused"} · updated ${new Date(it.row.updated_at).toLocaleDateString()}` : own ? "Your campaign" : "Template"}</div>
                </div>
              </button>
              {own && <button onClick={() => confirm(`Delete "${it.title}"?`) && setMine((l) => l.filter((m) => m.key !== it.key))} className="mx-4 mb-3 text-[11px] text-zinc-500 hover:text-zinc-200">Delete</button>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
