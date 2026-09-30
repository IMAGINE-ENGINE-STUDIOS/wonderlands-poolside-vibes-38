/**
 * SocialiteMessaging — Email · SMS · Calls hub inside SOCIALITE.
 * Email reuses the full campaign + template system (AutomationTemplatesManager).
 * SMS / Calls send real messages through the send-sms and make-voice-call edge functions (Twilio)
 * to clients loaded from the database — no sample data.
 */
import { useEffect, useMemo, useState } from "react";
import { Mail, MessageSquare, PhoneCall, Send, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import AutomationTemplatesManager from "@/components/admin/AutomationTemplatesManager";

type Tab = "email" | "sms" | "calls";
interface ClientRow { id: string; first_name: string; last_name: string; phone: string | null; email: string }

function Composer({ channel }: { channel: "sms" | "calls" }) {
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [q, setQ] = useState("");
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<string>("");

  useEffect(() => {
    supabase.from("clients").select("id, first_name, last_name, phone, email")
      .not("phone", "is", null).order("first_name").limit(1000)
      .then(({ data }) => setClients((data as ClientRow[]) || []));
  }, []);

  const shown = useMemo(() => {
    const t = q.toLowerCase();
    return clients.filter(c => !t || `${c.first_name} ${c.last_name} ${c.phone} ${c.email}`.toLowerCase().includes(t));
  }, [clients, q]);

  const toggle = (id: string) => setPicked(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const send = async () => {
    const targets = clients.filter(c => picked.has(c.id) && c.phone);
    if (!message.trim() || !targets.length) return;
    if (!confirm(`${channel === "sms" ? "Text" : "Call"} ${targets.length} client(s)?`)) return;
    setSending(true); let ok = 0, fail = 0;
    for (const c of targets) {
      const body = { to: c.phone, message: message.replace(/{first_name}/g, c.first_name), recipientType: "client", recipientName: `${c.first_name} ${c.last_name}` };
      const { error } = await supabase.functions.invoke(channel === "sms" ? "send-sms" : "make-voice-call", { body });
      error ? fail++ : ok++;
    }
    setSending(false); setResult(`${ok} sent · ${fail} failed`);
  };

  return (
    <div className="grid lg:grid-cols-[1fr_360px] gap-6">
      <div className="rounded-[20px] border border-zinc-800 bg-[#161617] p-5">
        <div className="flex items-center gap-2 mb-4 rounded-full bg-zinc-900 border border-zinc-800 px-3 py-2">
          <Search className="w-4 h-4 text-zinc-500" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search clients" className="bg-transparent outline-none text-[13px] flex-1" />
          <button onClick={() => setPicked(new Set(shown.map(c => c.id)))} className="text-[11px] text-zinc-400 hover:text-white">Select all</button>
          <button onClick={() => setPicked(new Set())} className="text-[11px] text-zinc-400 hover:text-white">Clear</button>
        </div>
        <div className="max-h-[480px] overflow-y-auto divide-y divide-zinc-900">
          {shown.length === 0 && <div className="text-[13px] text-zinc-500 py-8 text-center">No clients with a phone number.</div>}
          {shown.map(c => (
            <label key={c.id} className="flex items-center gap-3 py-2.5 cursor-pointer">
              <input type="checkbox" checked={picked.has(c.id)} onChange={() => toggle(c.id)} />
              <div className="flex-1 text-[13px]">{c.first_name} {c.last_name}</div>
              <div className="text-[12px] mono text-zinc-500">{c.phone}</div>
            </label>
          ))}
        </div>
      </div>
      <div className="rounded-[20px] border border-zinc-800 bg-[#161617] p-5 space-y-4 h-fit">
        <div className="text-[13px] font-semibold tracking-widest uppercase text-zinc-400">{channel === "sms" ? "Text message" : "Voice message"}</div>
        <textarea value={message} onChange={e => setMessage(e.target.value)} rows={7}
          placeholder={channel === "sms" ? "Hi {first_name}, …" : "Message read aloud on the call. Use {first_name}."}
          className="w-full rounded-[14px] bg-zinc-900 border border-zinc-800 p-3 text-[13px] outline-none focus:border-zinc-600" />
        <div className="text-[11px] text-zinc-500">{picked.size} selected · signed Ricardo · +1 (239) 257-0637</div>
        <button disabled={sending || !picked.size || !message.trim()} onClick={send}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full bg-white text-black text-[13px] font-semibold disabled:opacity-40">
          <Send className="w-4 h-4" /> {sending ? "Sending…" : channel === "sms" ? "Send texts" : "Start calls"}
        </button>
        {result && <div className="text-[12px] text-zinc-400">{result}</div>}
      </div>
    </div>
  );
}

export default function SocialiteMessaging() {
  const [tab, setTab] = useState<Tab>("email");
  const tabs = [
    { id: "email" as Tab, label: "Email", icon: Mail },
    { id: "sms" as Tab, label: "SMS", icon: MessageSquare },
    { id: "calls" as Tab, label: "Calls", icon: PhoneCall },
  ];
  return (
    <div className="p-4 lg:p-8 space-y-6">
      <div>
        <h1 className="text-[26px] font-semibold tracking-tight">Email · SMS · Calls</h1>
        <p className="text-[13px] text-zinc-500">Campaigns, daily schedule, templates, texts and voice calls to your clients.</p>
      </div>
      <div className="inline-flex p-1 rounded-full bg-zinc-900 border border-zinc-800">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-[12.5px] font-medium transition ${tab === t.id ? "bg-white text-black" : "text-zinc-400 hover:text-white"}`}>
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>
      {tab === "email" && <AutomationTemplatesManager embedded />}
      {tab === "sms" && <Composer channel="sms" />}
      {tab === "calls" && <Composer channel="calls" />}
    </div>
  );
}
