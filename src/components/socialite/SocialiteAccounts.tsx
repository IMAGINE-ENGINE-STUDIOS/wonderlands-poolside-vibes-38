/**
 * SocialiteAccounts — the main admin pastes social media keys here (never in chat).
 * Keys go straight to the `socialite-credentials` edge function, which verifies them with
 * the provider, encrypts them (AES-GCM) and stores them in a table the browser can't read.
 * The browser only ever gets back: connected yes/no, account name, last 4 characters.
 */
import { useCallback, useEffect, useState } from "react";
import { Facebook, Instagram, AtSign, Youtube, Lock, Check, Trash2, Loader2, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Status = { platform: string; account_id: string | null; token_hint: string | null; verified_name: string | null; updated_at: string };

const DEFS = [
  { id: "facebook", name: "Facebook Page", bg: "from-[#1877F2] to-[#0d5bbf]", icon: <Facebook className="w-4 h-4" />, live: true,
    idLabel: "Page ID", tokenLabel: "Page access token",
    help: "Meta Business Suite → Settings → Page info shows the Page ID. Create a long-lived Page access token in Meta for Developers → Graph API Explorer (permissions: pages_manage_posts, pages_read_engagement)." },
  { id: "instagram", name: "Instagram Business", bg: "from-[#f09433] via-[#e6683c] to-[#dc2743]", icon: <Instagram className="w-4 h-4" />, live: true,
    idLabel: "Instagram Business account ID", tokenLabel: "Access token (the Page token works)",
    help: "Graph API Explorer → GET me/accounts?fields=instagram_business_account gives the ID. Needs instagram_content_publish." },
  { id: "threads", name: "Threads", bg: "from-zinc-800 to-black", icon: <AtSign className="w-4 h-4" />, idLabel: "Account ID", tokenLabel: "Access token" },
  { id: "x", name: "X", bg: "from-zinc-800 to-black", icon: <span className="font-bold text-[13px]">𝕏</span>, idLabel: "Username", tokenLabel: "Access token" },
  { id: "tiktok", name: "TikTok", bg: "from-[#00f2ea] via-black to-[#ff0050]", icon: <span>♪</span>, idLabel: "Account ID", tokenLabel: "Access token" },
  { id: "youtube", name: "YouTube", bg: "from-[#FF0000] to-[#cc0000]", icon: <Youtube className="w-4 h-4" />, idLabel: "Channel ID", tokenLabel: "Access token" },
] as const;

export default function SocialiteAccounts({ onChange }: { onChange?: (s: Set<string>) => void }) {
  const [status, setStatus] = useState<Record<string, Status>>({});
  const [open, setOpen] = useState<string | null>(null);
  const [form, setForm] = useState({ account_id: "", token: "" });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const load = useCallback(async () => {
    const { data } = await supabase.functions.invoke("socialite-credentials", { body: { action: "status" } });
    const map: Record<string, Status> = {};
    (data?.accounts ?? []).forEach((a: Status) => (map[a.platform] = a));
    setStatus(map);
    onChange?.(new Set(Object.keys(map)));
  }, [onChange]);
  useEffect(() => { load(); }, [load]);

  const save = async (platform: string) => {
    setBusy(true); setMsg(null);
    const { data, error } = await supabase.functions.invoke("socialite-credentials", { body: { action: "save", platform, ...form } });
    setBusy(false);
    setForm({ account_id: "", token: "" }); // never keep the token in memory
    if (error || !data?.ok) { setMsg({ ok: false, text: data?.error || "The key couldn't be verified" }); return; }
    setMsg({ ok: true, text: data.name ? `Connected as ${data.name}` : "Saved" });
    setOpen(null); load();
  };

  const remove = async (platform: string) => {
    if (!confirm("Disconnect this account and delete its saved key?")) return;
    await supabase.functions.invoke("socialite-credentials", { body: { action: "remove", platform } });
    load();
  };

  return (
    <div className="p-4 lg:p-8 max-w-[820px] space-y-6">
      <div>
        <h1 className="text-[22px] font-semibold">Accounts</h1>
        <p className="text-[13px] text-zinc-500">Paste your keys here. They're checked, encrypted and never shown again.</p>
      </div>
      {msg && <div className={`rounded-[14px] border px-4 py-3 text-[13px] ${msg.ok ? "border-emerald-900 bg-emerald-950/40 text-emerald-300" : "border-zinc-700 bg-zinc-900 text-zinc-300"}`}>{msg.text}</div>}
      <div className="grid gap-3">
        {DEFS.map((p) => {
          const s = status[p.id];
          return (
            <div key={p.id} className="rounded-[18px] border border-zinc-800 bg-[#161617] p-5">
              <div className="flex items-center gap-4">
                <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${p.bg} grid place-items-center text-white`}>{p.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-medium flex items-center gap-2">{p.name}
                    {!("live" in p) && <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400">Posting coming soon</span>}
                  </div>
                  <div className="text-[12px] text-zinc-500 truncate">
                    {s ? <span className="text-emerald-400">Connected{s.verified_name ? ` as ${s.verified_name}` : ""} · key {s.token_hint}</span> : "Not connected"}
                  </div>
                </div>
                {s && <button onClick={() => remove(p.id)} aria-label={`Disconnect ${p.name}`} className="w-9 h-9 rounded-full grid place-items-center bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"><Trash2 className="w-4 h-4" /></button>}
                <button onClick={() => { setOpen(open === p.id ? null : p.id); setForm({ account_id: s?.account_id || "", token: "" }); setMsg(null); }}
                  className="px-4 py-2 rounded-full text-[12px] font-semibold border bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-white hover:text-black transition">
                  {s ? "Update key" : "Connect"}
                </button>
              </div>
              {open === p.id && (
                <div className="mt-5 grid gap-3 border-t border-zinc-800 pt-5">
                  {"help" in p && <p className="text-[12px] text-zinc-500 leading-[1.6]">{p.help} <a href="https://developers.facebook.com/tools/explorer/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-zinc-300 underline">Open Graph API Explorer <ExternalLink className="w-3 h-3" /></a></p>}
                  <label className="text-[11px] uppercase tracking-widest text-zinc-500">{p.idLabel}
                    <input value={form.account_id} onChange={(e) => setForm((f) => ({ ...f, account_id: e.target.value }))} autoComplete="off"
                      className="mt-1.5 w-full rounded-[12px] bg-zinc-900 border border-zinc-800 px-3 py-2.5 text-[13px] normal-case tracking-normal text-zinc-100 outline-none focus:border-zinc-600" />
                  </label>
                  <label className="text-[11px] uppercase tracking-widest text-zinc-500">{p.tokenLabel}
                    <input type="password" value={form.token} onChange={(e) => setForm((f) => ({ ...f, token: e.target.value }))} autoComplete="new-password" spellCheck={false}
                      className="mt-1.5 w-full rounded-[12px] bg-zinc-900 border border-zinc-800 px-3 py-2.5 text-[13px] mono normal-case tracking-normal text-zinc-100 outline-none focus:border-zinc-600" />
                  </label>
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-1.5 text-[11px] text-zinc-500"><Lock className="w-3.5 h-3.5" /> Encrypted on the server · only used to publish</span>
                    <button disabled={busy || form.token.length < 10} onClick={() => save(p.id)}
                      className="px-5 py-2.5 rounded-full bg-white text-black text-[12.5px] font-semibold flex items-center gap-1.5 disabled:opacity-40">
                      {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Verify & save
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
