/**
 * ListingMessageThread — one private thread between a project owner and
 * one bidder on one listing of the single procurement system, backed by
 * listing_messages (migration 20261118160000). Used from the public
 * project view (bidder side, "Message Wonderlands World") and from the
 * owner's postings (owner side, one thread per bidder).
 * Credits: Imagine Engine Studios Corp.
 */
import * as React from "react";
import { Send } from "lucide-react";
import {
  fetchListingThread,
  sendListingMessage,
  type ListingMessage,
} from "@/lib/procurement/procurementService";

interface ListingMessageThreadProps {
  listingId: string;
  projectId: string;
  /** The non-owner participant's user id (the signed in user on the bidder side). */
  bidderId: string;
  currentUserId: string;
  heading: string;
  subheading: string;
}

export function ListingMessageThread({
  listingId,
  projectId,
  bidderId,
  currentUserId,
  heading,
  subheading,
}: ListingMessageThreadProps) {
  const [messages, setMessages] = React.useState<ListingMessage[]>([]);
  const [ready, setReady] = React.useState(true);
  const [draft, setDraft] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const endRef = React.useRef<HTMLDivElement>(null);

  const load = React.useCallback(async () => {
    const res = await fetchListingThread(listingId, bidderId);
    setReady(res.ready);
    setMessages(res.messages);
    setLoading(false);
  }, [listingId, bidderId]);

  React.useEffect(() => {
    void load();
    const iv = setInterval(() => void load(), 12000);
    return () => clearInterval(iv);
  }, [load]);

  React.useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const send = async () => {
    const body = draft.trim();
    if (!body) return;
    setDraft("");
    const ok = await sendListingMessage(listingId, projectId, bidderId, currentUserId, body);
    if (ok) {
      setMessages((prev) => [
        ...prev,
        {
          id: `local-${Date.now()}`,
          listing_id: listingId,
          project_id: projectId,
          bidder_id: bidderId,
          sender_id: currentUserId,
          body,
          created_at: new Date().toISOString(),
        },
      ]);
      void load();
    }
  };

  return (
    <div className="flex min-h-[320px] min-w-0 flex-col rounded-2xl border border-neutral-200 bg-white">
      <div className="border-b border-neutral-100 px-4 py-3">
        <div className="break-words text-sm font-semibold text-neutral-900">{heading}</div>
        <div className="text-xs text-neutral-500">{subheading}</div>
      </div>
      {!ready && (
        <div className="border-b border-amber-200 bg-amber-50 px-4 py-2.5 text-xs leading-relaxed text-amber-900">
          Direct messaging switches on with the procurement database update (one SQL run by
          Wonderlands). Until then, bid status changes already notify both sides automatically.
        </div>
      )}
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {loading ? (
          <p className="text-center text-xs text-neutral-400">Loading messages…</p>
        ) : messages.length === 0 ? (
          <p className="text-center text-xs text-neutral-400">
            {ready ? "No messages yet. Introduce yourself." : "No messages yet."}
          </p>
        ) : (
          messages.map((m) => (
            <div key={m.id} className={m.sender_id === currentUserId ? "text-right" : "text-left"}>
              <div
                className={`inline-block max-w-[80%] break-words rounded-2xl px-3.5 py-2 text-left text-sm ${
                  m.sender_id === currentUserId ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-800"
                }`}
              >
                {m.body}
              </div>
              <div className="mt-0.5 text-[11px] text-neutral-400">
                {new Date(m.created_at).toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
              </div>
            </div>
          ))
        )}
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
    </div>
  );
}
