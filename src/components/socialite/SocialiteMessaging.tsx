/**
 * SocialiteMessaging — Email · SMS · WhatsApp · Calls hub inside SOCIALITE.
 * Email embeds the campaign/template system, re-skinned via `.socialite-skin` (index.css).
 * SMS / WhatsApp / Calls send through the send-sms, send-whatsapp and make-voice-call
 * edge functions (Twilio) to real clients. Sends run 4 at a time for speed.
 */
import { useEffect, useMemo, useState } from "react";
import { Mail, MessageSquare, PhoneCall, Send, Search, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import AutomationTemplatesManager from "@/components/admin/AutomationTemplatesManager";

type Tab = "email" | "sms" | "whatsapp" | "calls";
type Channel = Exclude<Tab, "email">;
interface ClientRow { id: string; first_name: string; last_name: string; phone: string | null; email: string; city?: string | null }
interface LogRow { id: string; channel: string; recipient: string; status: string; created_at: string }

const FN: Record<Channel, string> = { sms: "send-sms", whatsapp: "send-whatsapp", calls: "make-voice-call" };
const LOG_CH: Record<Channel, string> = { sms: "sms", whatsapp: "whatsapp", calls: "voice" };
const SIGN = "— Ricardo · Wonderlands · +1 (239) 257-0637";
const QUICK = [
  "Hi {first_name}, it's Ricardo from Wonderlands. Do you have 10 minutes this week to talk about your backyard project?",
  "Hi {first_name}, your quote is ready. Want me to walk you through it? Book here: calendly.com/wonderlandsworlds/30min",
  "Hi {first_name}, quick reminder about your appointment with Wonderlands tomorrow. Reply to confirm.",
];

let clientCache: ClientRow[] | null = null;

function Composer({ channel }: { channel: Channel }) {
  const [clients, setClients] = useState<ClientRow[]>(clientCache ?? []);
  const [q, setQ] = useState("");
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [message, setMessage] = useState("");
  const [sign, setSign] = useState(true);
  const [progress, setProgress] = useState<{ done: number; total: number; ok: number } | null>(null);
  const [log, setLog] = useState<LogRow[]>([]);

  useEffect(() => {
    if (!clientCache) supabase.from("clients").select("id, first_name, last_name, phone, email")
      .not("phone", "is", null).order("first_name").limit(1000)
      .then(({ data }) => { clientCache = (data as ClientRow[]) || []; setClients(clientCache); });
  }, []);

  const loadLog = () => (supabase as any).from("communication_logs")
    .select("id, channel, recipient, status, created_at")
    .eq("channel", LOG_CH[channel]).order("created_at", { ascending: false }).limit(12)
    .then(({ data }: any) => setLog(data || []));
  useEffect(() => { loadLog(); }, [channel]);

  const shown = useMemo(() => {
    const t = q.toLowerCase();
    return clients.filter(c => !t || `${c.first_name} ${c.last_name} ${c.phone} ${c.email} ${c.city ?? ""}`.toLowerCase().includes(t));
  }, [clients, q]);

  const toggle = (id: string) => setPicked(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const finalText = (c?: ClientRow) => {
    const m = message.replace(/{first_name}/g, c?.first_name || "there");
    return sign && channel !== "calls" ? `${m}\n${SIGN}` : m;
  };
  const len = finalText().length;
  const segments = Math.max(1, Math.ceil(len / 160));

  const send = async () => {
    const targets = clients.filter(c => picked.has(c.id) && c.phone);
    if (!message.trim() || !targets.length) return;
    const verb = channel === "calls" ? "Call" : channel === "whatsapp" ? "WhatsApp" : "Text";
    if (!confirm(`${verb} ${targets.length} client(s)?`)) return;
    let done = 0, ok = 0;
    setProgress({ done, total: targets.length, ok });
    const queue = [...targets];
    const worker = async () => {
      for (let c = queue.shift(); c; c = queue.shift()) {
        const { data, error } = await supabase.functions.invoke(FN[channel], { body: { to: c.phone, message: finalText(c), recipientType: "client", recipientName: `${c.first_name} ${c.last_name}` } });
        if (!error && data?.success !== false) ok++;
        done++; setProgress({ done, total: targets.length, ok });
      }
    };
    await Promise.all(Array.from({ length: Math.min(4, targets.length) }, worker));
    loadLog();
  };
  const sending = !!progress && progress.done < progress.total;

  return (
    <div className="grid lg:grid-cols-[1fr_380px] gap-6">
      <div className="rounded-[20px] border border-zinc-800 bg-[#161617] p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="text-[13px] font-semibold tracking-widest uppercase text-zinc-400">Recipients</div>
          <div className="text-[12px] text-zinc-500 mono">{picked.size} / {clients.length}</div>
        </div>
        <div className="flex items-center gap-2 mb-4 rounded-full bg-zinc-900 border border-zinc-800 px-3 py-2">
          <Search className="w-4 h-4 text-zinc-500" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search name, phone, email or city" className="bg-transparent outline-none text-[13px] flex-1" />
          <button onClick={() => setPicked(new Set(shown.map(c => c.id)))} className="text-[11px] px-2.5 py-1 rounded-full bg-zinc-800 text-zinc-300 hover:bg-white hover:text-black transition">Select shown</button>
          <button onClick={() => setPicked(new Set())} className="text-[11px] px-2.5 py-1 rounded-full text-zinc-400 hover:text-white">Clear</button>
        </div>
        <div className="max-h-[520px] overflow-y-auto divide-y divide-zinc-900">
          {shown.length === 0 && <div className="text-[13px] text-zinc-500 py-8 text-center">No clients with a phone number.</div>}
          {shown.map(c => (
            <label key={c.id} className={`flex items-center gap-3 py-2.5 px-2 rounded-[10px] cursor-pointer transition ${picked.has(c.id) ? "bg-zinc-900" : "hover:bg-zinc-900/50"}`}>
              <input type="checkbox" className="accent-white" checked={picked.has(c.id)} onChange={() => toggle(c.id)} />
              <div className="w-8 h-8 rounded-full bg-zinc-800 grid place-items-center text-[11px] font-semibold">{(c.first_name?.[0] || "") + (c.last_name?.[0] || "")}</div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] truncate">{c.first_name} {c.last_name}</div>
                <div className="text-[11px] text-zinc-500 truncate">{c.city || c.email}</div>
              </div>
              <div className="text-[12px] mono text-zinc-500">{c.phone}</div>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-[20px] border border-zinc-800 bg-[#161617] p-5 space-y-4">
          <div className="text-[13px] font-semibold tracking-widest uppercase text-zinc-400">{channel === "calls" ? "Voice message" : channel === "whatsapp" ? "WhatsApp message" : "Text message"}</div>
          <div className="flex flex-wrap gap-1.5">
            {QUICK.map((t, i) => (
              <button key={i} onClick={() => setMessage(t)} className="text-[11px] px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white">{["Follow-up", "Quote ready", "Reminder"][i]}</button>
            ))}
            <button onClick={() => setMessage(m => m + "{first_name}")} className="text-[11px] px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white">+ first name</button>
          </div>
          <textarea value={message} onChange={e => setMessage(e.target.value)} rows={7}
            placeholder={channel === "calls" ? "Message read aloud on the call. Use {first_name}." : "Hi {first_name}, …"}
            className="w-full rounded-[14px] bg-zinc-900 border border-zinc-800 p-3 text-[13px] outline-none focus:border-zinc-600" />
          {channel !== "calls" && (
            <label className="flex items-center justify-between text-[12px] text-zinc-400">
              <span>Add signature</span>
              <button onClick={() => setSign(s => !s)} className={`w-9 h-5 rounded-full p-0.5 transition ${sign ? "bg-white" : "bg-zinc-700"}`}>
                <div className={`w-4 h-4 rounded-full bg-black transition ${sign ? "translate-x-4" : ""}`} />
              </button>
            </label>
          )}
          {message && (
            <div className="rounded-[14px] bg-zinc-900 border border-zinc-800 p-3">
              <div className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1.5">Preview</div>
              <div className="text-[12.5px] whitespace-pre-wrap text-zinc-200">{finalText(clients.find(c => picked.has(c.id)))}</div>
            </div>
          )}
          <div className="text-[11px] text-zinc-500 mono">{len} chars{channel === "sms" ? ` · ${segments} segment${segments > 1 ? "s" : ""} per text` : ""} · {picked.size} selected</div>
          <button disabled={sending || !picked.size || !message.trim()} onClick={send}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full bg-white text-black text-[13px] font-semibold disabled:opacity-40">
            <Send className="w-4 h-4" /> {sending ? `Sending ${progress!.done}/${progress!.total}…` : channel === "calls" ? "Start calls" : channel === "whatsapp" ? "Send WhatsApp" : "Send texts"}
          </button>
          {progress && (
            <div>
              <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden"><div className="h-full bg-white transition-all" style={{ width: `${(progress.done / progress.total) * 100}%` }} /></div>
              <div className="text-[12px] text-zinc-400 mt-2">{progress.ok} sent · {progress.done - progress.ok} failed</div>
            </div>
          )}
        </div>

        <div className="rounded-[20px] border border-zinc-800 bg-[#161617] p-5">
          <div className="text-[13px] font-semibold tracking-widest uppercase text-zinc-400 mb-3">Recent</div>
          {log.length === 0 ? <div className="text-[12px] text-zinc-500">Nothing sent yet.</div> : (
            <div className="space-y-2">
              {log.map(l => (
                <div key={l.id} className="flex items-center gap-2 text-[12px]">
                  <span className={`w-1.5 h-1.5 rounded-full ${l.status === "failed" ? "bg-zinc-500" : "bg-emerald-400"}`} />
                  <span className="flex-1 truncate text-zinc-300">{l.recipient}</span>
                  <span className="text-zinc-500">{l.status}</span>
                  <span className="text-zinc-600 mono">{new Date(l.created_at).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SocialiteMessaging() {
  const [tab, setTab] = useState<Tab>("email");
  const tabs = [
    { id: "email" as Tab, label: "Email", icon: Mail },
    { id: "sms" as Tab, label: "SMS", icon: MessageSquare },
    { id: "whatsapp" as Tab, label: "WhatsApp", icon: MessageCircle },
    { id: "calls" as Tab, label: "Calls", icon: PhoneCall },
  ];
  return (
    <div className="p-4 lg:p-8 space-y-6">
      <div>
        <h1 className="text-[22px] font-semibold">Email · SMS · Calls</h1>
        <p className="text-[13px] text-zinc-500">Campaigns, daily schedule, templates, texts, WhatsApp and voice calls to your clients.</p>
      </div>
      <div className="inline-flex p-1 rounded-full bg-zinc-900 border border-zinc-800">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-[12.5px] font-medium transition ${tab === t.id ? "bg-white text-black" : "text-zinc-400 hover:text-white"}`}>
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>
      {tab === "email" && <div className="socialite-skin"><AutomationTemplatesManager embedded /></div>}
      {tab !== "email" && <Composer key={tab} channel={tab} />}
    </div>
  );
}
