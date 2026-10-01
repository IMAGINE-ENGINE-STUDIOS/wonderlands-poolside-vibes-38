/**
 * SOCIALITE Campaign Console (main admin) — every editorial email campaign
 * (built-in templates + saved daily-rotation rows) opens as a FLIP V2 book.
 * Edit it with the full FlipBuilderV2, preview the email, save it into the
 * daily rotation, or send it to all clients (send-bulk-email; unsubscribed
 * clients are skipped and each email gets its unsubscribe link server-side).
 * Books persist per campaign under "socialite.campaign.<key>".
 */
import { lazy, Suspense, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { cacheFlush, cacheRead } from "@/lib/uiCache";
import { CAMPAIGN_TEMPLATES, configToDoc, docToEmailHtml } from "@/lib/socialite/campaignFlip";
import { ensureV2, type BuilderDocV2 } from "@/components/flip/flipBuilderV2Types";

const FlipBuilderV2 = lazy(() => import("@/components/flip/FlipBuilderV2"));
type Row = { campaign_key: string; title: string; subject: string; html: string; is_active: boolean; position: number; updated_at: string };
type Item = { key: string; title: string; subject: string; seed: BuilderDocV2; row?: Row };
const card = "rounded-[18px] border border-zinc-800 bg-[#161617]";
const pill = "px-3 py-1.5 rounded-full text-[12px] font-medium border border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-white hover:text-black transition disabled:opacity-40";

export default function SocialiteCampaignConsole() {
  const [rows, setRows] = useState<Row[]>([]);
  const [open, setOpen] = useState<Item | null>(null);
  const [subject, setSubject] = useState("");
  const [preview, setPreview] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  const load = () => supabase.from("daily_email_rotation").select("campaign_key,title,subject,html,is_active,position,updated_at").order("position").then(({ data }) => setRows((data as Row[]) ?? []));
  useEffect(() => { load(); }, []);

  const items: Item[] = [
    ...CAMPAIGN_TEMPLATES.map((t) => ({ key: t.key, title: t.title, subject: t.subject, seed: configToDoc(t.title, t.config), row: rows.find((r) => r.campaign_key === t.key) })),
    ...rows.filter((r) => !CAMPAIGN_TEMPLATES.some((t) => t.key === r.campaign_key)).map((r) => ({ key: r.campaign_key, title: r.title, subject: r.subject, seed: configToDoc(r.title, {}, r.html), row: r })),
  ];
  const sk = (k: string) => `socialite.campaign.${k}`;
  const currentDoc = (): BuilderDocV2 => { cacheFlush(); return ensureV2(cacheRead(`${sk(open!.key)}.doc`, open!.seed)); };
  const pick = (it: Item) => { setOpen(it); setSubject(it.row?.subject ?? it.subject); setPreview(""); setNote(""); };

  const save = async () => {
    const doc = currentDoc(); const html = docToEmailHtml(doc);
    setBusy(true);
    const payload = { campaign_key: open!.key, title: doc.title || open!.title, subject, html, updated_at: new Date().toISOString() };
    const { error } = open!.row
      ? await supabase.from("daily_email_rotation").update(payload).eq("campaign_key", open!.key)
      : await supabase.from("daily_email_rotation").insert({ ...payload, position: rows.length, is_active: true });
    setBusy(false); setNote(error ? "Couldn't save. Please try again." : "Saved — this version now goes out in the daily schedule.");
    load();
  };
  const send = async () => {
    if (!confirm(`Send "${subject}" to ALL clients now?`)) return;
    setBusy(true);
    const { data, error } = await supabase.functions.invoke("send-bulk-email", { body: { send_to_all: true, custom_subject: subject, custom_html: docToEmailHtml(currentDoc()), template_name: open!.title } });
    setBusy(false); setNote(error ? "Couldn't send right now." : `Sent ${data?.successful ?? 0}${data?.failed ? ` · ${data.failed} failed` : ""}.`);
  };
  const newCampaign = () => {
    const name = prompt("Campaign name"); if (!name) return;
    const key = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40) + "-" + Date.now().toString(36);
    pick({ key, title: name, subject: `{{first_name}}, ${name}`, seed: configToDoc(name, { headline: name }) });
  };

  if (open) return (
    <div className="space-y-4">
      <div className={`${card} p-4 flex flex-wrap items-center gap-2`}>
        <button className={pill} onClick={() => setOpen(null)}>Back to campaigns</button>
        <div className="text-[14px] font-semibold text-zinc-100 mr-2">{open.title}</div>
        <input value={subject} onChange={(e) => setSubject(e.target.value)} className="flex-1 min-w-[220px] rounded-full bg-zinc-950 border border-zinc-800 px-4 py-1.5 text-[13px] text-zinc-100" placeholder="Subject" />
        <button className={pill} onClick={() => setPreview(preview ? "" : docToEmailHtml(currentDoc()))}>{preview ? "Back to editing" : "Preview email"}</button>
        <button className={pill} disabled={busy} onClick={save}>Save to daily schedule</button>
        <button className={pill} disabled={busy} onClick={send}>Send to all clients</button>
        {note && <div className="w-full text-[12px] text-zinc-400">{note}</div>}
      </div>
      {preview
        ? <iframe title="Email preview" srcDoc={preview} className="w-full h-[80vh] rounded-[18px] bg-white" />
        : <div className="rounded-[18px] overflow-hidden bg-background text-foreground"><Suspense fallback={<div className="p-6 text-[13px] text-zinc-500">Opening the book…</div>}><FlipBuilderV2 key={open.key} storageKey={sk(open.key)} initialDoc={open.seed} /></Suspense></div>}
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-[13px] text-zinc-500">Every email campaign as a FLIP book. Open one to edit pages, pictures and words, then save or send.</p>
        <button className={pill} onClick={newCampaign}>New campaign</button>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {items.map((it) => {
          const cover = it.seed.pages[0]?.blocks.find((b) => b.kind === "image")?.src;
          return (
            <button key={it.key} onClick={() => pick(it)} className={`${card} text-left overflow-hidden hover:border-zinc-600 transition`}>
              {cover ? <img src={cover} alt="" loading="lazy" className="h-32 w-full object-cover" /> : <div className="h-32 bg-zinc-900" />}
              <div className="p-4">
                <div className="text-[14px] font-semibold text-zinc-100">{it.title}</div>
                <div className="text-[12px] text-zinc-500 truncate">{it.row?.subject ?? it.subject}</div>
                <div className="text-[11px] text-zinc-500 mt-1">{it.row ? `${it.row.is_active ? "In daily schedule" : "Paused"} · updated ${new Date(it.row.updated_at).toLocaleDateString()}` : "Template — not in schedule yet"}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
