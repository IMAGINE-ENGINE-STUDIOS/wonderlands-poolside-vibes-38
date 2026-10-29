/**
 * ProcurementMessages — real buyer↔bidder messaging for the jobs
 * marketplace. One private thread per (job, supplier). Replaces the old
 * mock MessagingSystem on the procurement page.
 * Credits: Imagine Engine Studios Corp.
 */
import * as React from "react";
import { MessageSquare, Send } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  fetchJobProposals,
  fetchMyJobs,
  fetchMyProposals,
  fetchThread,
  sendThreadMessage,
  type JobMessage,
  type ProcJob,
} from "@/lib/procurement/procurementService";

interface Thread {
  key: string;
  job: ProcJob;
  supplierId: string;
  supplierName: string;
  mine: boolean; // I am the supplier in this thread
}

const nameOf = (p?: { first_name: string | null; last_name: string | null; company_name: string | null } | null) =>
  p?.company_name || [p?.first_name, p?.last_name].filter(Boolean).join(" ") || "Supplier";

export function ProcurementMessages() {
  const { user } = useAuth();
  const [threads, setThreads] = React.useState<Thread[]>([]);
  const [active, setActive] = React.useState<Thread | null>(null);
  const [messages, setMessages] = React.useState<JobMessage[]>([]);
  const [ready, setReady] = React.useState(true);
  const [draft, setDraft] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const endRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!user) return;
    let on = true;
    (async () => {
      try {
        const [jobs, myProps] = await Promise.all([fetchMyJobs(user.id), fetchMyProposals(user.id)]);
        const list: Thread[] = [];
        for (const job of jobs) {
          const proposals = await fetchJobProposals(job.id).catch(() => []);
          for (const p of proposals) {
            list.push({
              key: `${job.id}:${p.supplier_id}`,
              job,
              supplierId: p.supplier_id,
              supplierName: nameOf(p.profiles),
              mine: false,
            });
          }
        }
        for (const p of myProps) {
          if (p.job && p.job.business_id !== user.id) {
            list.push({
              key: `${p.job.id}:${user.id}`,
              job: p.job,
              supplierId: user.id,
              supplierName: nameOf(p.job.profiles) || "Buyer",
              mine: true,
            });
          }
        }
        if (on) {
          setThreads(list);
          setActive((prev) => prev ?? list[0] ?? null);
        }
      } finally {
        if (on) setLoading(false);
      }
    })();
    return () => { on = false; };
  }, [user]);

  const loadThread = React.useCallback(async (t: Thread | null) => {
    if (!t) return;
    const res = await fetchThread(t.job.id, t.supplierId);
    setReady(res.ready);
    setMessages(res.messages);
  }, []);

  React.useEffect(() => {
    void loadThread(active);
    if (!active) return;
    const iv = setInterval(() => void loadThread(active), 12000);
    return () => clearInterval(iv);
  }, [active, loadThread]);

  React.useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  if (!user) {
    return <p className="text-sm text-neutral-500">Sign in to message buyers and suppliers.</p>;
  }
  if (loading) return <p className="text-sm text-neutral-500">Loading conversations…</p>;

  const send = async () => {
    if (!active || !draft.trim() || !user) return;
    const body = draft.trim();
    setDraft("");
    const ok = await sendThreadMessage(active.job.id, active.supplierId, user.id, body);
    if (ok) {
      setMessages((prev) => [
        ...prev,
        { id: `local-${Date.now()}`, job_id: active.job.id, supplier_id: active.supplierId, sender_id: user.id, body, created_at: new Date().toISOString() },
      ]);
      void loadThread(active);
    }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
      <div className="space-y-2">
        {threads.length === 0 && (
          <div className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-5 text-sm text-neutral-500">
            No conversations yet. Threads open with the jobs you post and the bids you place.
          </div>
        )}
        {threads.map((t) => (
          <button
            key={t.key}
            onClick={() => setActive(t)}
            className={`w-full rounded-xl border p-3.5 text-left transition ${
              active?.key === t.key ? "border-amber-400 bg-amber-50" : "border-neutral-200 bg-white hover:border-neutral-300"
            }`}
          >
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 shrink-0 text-amber-600" />
              <span className="min-w-0 flex-1 truncate text-sm font-medium text-neutral-900">{t.job.title}</span>
            </div>
            <div className="mt-1 text-xs text-neutral-500">
              {t.mine ? `With the buyer · ${t.job.location ?? ""}` : `With ${t.supplierName}`}
            </div>
          </button>
        ))}
      </div>

      <div className="flex min-h-[420px] flex-col rounded-2xl border border-neutral-200 bg-white">
        {!active ? (
          <div className="flex flex-1 items-center justify-center p-8 text-center text-sm text-neutral-400">
            Pick a conversation to start.
          </div>
        ) : (
          <>
            <div className="border-b border-neutral-100 px-4 py-3">
              <div className="text-sm font-semibold text-neutral-900">{active.job.title}</div>
              <div className="text-xs text-neutral-500">
                {active.mine ? "Private thread with the buyer" : `Private thread with ${active.supplierName}`}
              </div>
            </div>
            {!ready && (
              <div className="border-b border-amber-200 bg-amber-50 px-4 py-2.5 text-xs leading-relaxed text-amber-900">
                Direct messaging switches on with the procurement database update (one SQL run by
                Wonderlands). Until then, bid status changes already notify both sides automatically.
              </div>
            )}
            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {messages.length === 0 && (
                <p className="text-center text-xs text-neutral-400">
                  {ready ? "No messages yet — introduce yourself." : "No messages yet."}
                </p>
              )}
              {messages.map((m) => (
                <div key={m.id} className={m.sender_id === user.id ? "text-right" : "text-left"}>
                  <div
                    className={`inline-block max-w-[80%] rounded-2xl px-3.5 py-2 text-sm ${
                      m.sender_id === user.id ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-800"
                    }`}
                  >
                    {m.body}
                  </div>
                  <div className="mt-0.5 text-[11px] text-neutral-400">
                    {new Date(m.created_at).toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                  </div>
                </div>
              ))}
              <div ref={endRef} />
            </div>
            <div className="flex items-center gap-2 border-t border-neutral-100 p-3">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && void send()}
                placeholder={ready ? "Write a message…" : "Messaging activates with the database update"}
                disabled={!ready}
                className="min-w-0 flex-1 rounded-full bg-neutral-100 px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-amber-400 disabled:opacity-60"
              />
              <button
                onClick={() => void send()}
                disabled={!ready || !draft.trim()}
                className="rounded-full bg-amber-400 p-2.5 text-neutral-900 transition hover:bg-amber-300 disabled:opacity-50"
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
