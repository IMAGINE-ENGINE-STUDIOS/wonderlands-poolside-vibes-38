/**
 * MeetingsPanel — the Wonderlands Live meetings tab, shared by every
 * dashboard (main admin, company workspace, customer account, sales rep).
 * Set up a meeting → unique Live link; start instantly; join by link.
 * Credits: Imagine Engine Studios Corp.
 */
import * as React from "react";
import { Link } from "react-router-dom";
import { CalendarPlus, Check, Copy, Trash2, Video } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { createMeeting, deleteMeeting, loadMeetings } from "@/lib/live/liveMeetings";
import { liveLink, type LiveMeeting } from "@/lib/live/liveTypes";

export function MeetingsPanel({ compact = false }: { compact?: boolean }) {
  const [meetings, setMeetings] = React.useState<LiveMeeting[]>(() => loadMeetings());
  const [title, setTitle] = React.useState("");
  const [guestName, setGuestName] = React.useState("");
  const [guestEmail, setGuestEmail] = React.useState("");
  const [when, setWhen] = React.useState("");
  const [joinCode, setJoinCode] = React.useState("");
  const [copied, setCopied] = React.useState("");

  const copy = async (text: string, tag: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(tag);
      setTimeout(() => setCopied(""), 1600);
    } catch {
      window.prompt("Copy the link:", text);
    }
  };

  const setup = () => {
    createMeeting({
      title: title.trim() || "Wonderlands consultation",
      guestName,
      guestEmail,
      startsAt: when ? new Date(when).toISOString() : null,
    });
    setMeetings(loadMeetings());
    setTitle("");
    setGuestName("");
    setGuestEmail("");
    setWhen("");
  };

  const instant = () => {
    const m = createMeeting({ title: "Instant meeting" });
    window.location.href = `/live/${m.slug}?host=1`;
  };

  const joinSlug = joinCode.trim().replace(/.*\/live\//, "").replace(/[^a-z0-9-]/gi, "");

  const inputCls =
    "w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500/60";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={instant}
          className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800"
        >
          <Video className="h-4 w-4" /> Start instant meeting
        </button>
        <div className="flex items-center gap-2">
          <input
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
            placeholder="Paste a meeting link or code"
            className="w-60 rounded-full border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500/60"
          />
          <Link
            to={joinSlug ? `/live/${joinSlug}` : "#"}
            className={`rounded-full bg-amber-400 px-4 py-2.5 text-sm font-semibold text-neutral-900 ${joinSlug ? "" : "pointer-events-none opacity-50"}`}
          >
            Join
          </Link>
        </div>
      </div>

      {!compact && (
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center gap-2">
            <CalendarPlus className="h-4 w-4 text-amber-600" />
            <h3 className="text-sm font-semibold">Set up a meeting</h3>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Meeting title" className={inputCls} />
            <input value={when} onChange={(e) => setWhen(e.target.value)} type="datetime-local" className={inputCls} aria-label="When" />
            <input value={guestName} onChange={(e) => setGuestName(e.target.value)} placeholder="Guest name" className={inputCls} />
            <input value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} placeholder="Guest email" type="email" className={inputCls} />
          </div>
          <button onClick={setup} className="mt-3 rounded-full bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-neutral-800">
            Create meeting link
          </button>
        </div>
      )}

      <div>
        <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Your meetings on this device
        </h3>
        {meetings.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">No meetings yet — set one up above.</p>
        ) : (
          <div className="mt-3 space-y-2">
            {meetings.map((m) => (
              <div key={m.slug} className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card px-4 py-3">
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{m.title}</div>
                  <div className="truncate text-xs text-muted-foreground">
                    {m.startsAt ? `${new Date(m.startsAt).toLocaleString()} · ` : ""}
                    {m.guestName ? `with ${m.guestName} · ` : ""}/live/{m.slug}
                  </div>
                </div>
                <button onClick={() => void copy(liveLink(m.slug), m.slug)} className="inline-flex items-center gap-1 rounded-full bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white">
                  {copied === m.slug ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied === m.slug ? "Copied" : "Copy link"}
                </button>
                <Link to={`/live/${m.slug}?host=1`} className="rounded-full bg-amber-400 px-3 py-1.5 text-xs font-semibold text-neutral-900">
                  Open room
                </Link>
                <button
                  onClick={() => { deleteMeeting(m.slug); setMeetings(loadMeetings()); }}
                  className="rounded-full p-1.5 text-muted-foreground transition hover:bg-red-50 hover:text-red-600"
                  aria-label="Delete meeting"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface BookingRow {
  id: string;
  name: string;
  topic: string | null;
  preferred_at: string | null;
  created_at: string;
  link: string | null;
}

/** Main-admin Meetings view: the shared panel plus the latest Genius bookings and their Live links. */
export function AdminMeetingsView() {
  const [bookings, setBookings] = React.useState<BookingRow[] | null>(null);
  React.useEffect(() => {
    let on = true;
    (async () => {
      const { data, error } = await supabase
        .from("genius_appointments")
        .select("id,name,topic,preferred_at,created_at,notes")
        .order("created_at", { ascending: false })
        .limit(20);
      if (!on) return;
      if (error || !data) {
        setBookings([]);
        return;
      }
      setBookings(
        (data as Array<Record<string, unknown>>).map((r) => {
          const notes = typeof r.notes === "string" ? r.notes : "";
          const m = notes.match(/https?:\/\/[^\s·]+\/live\/[a-z0-9-]+/i);
          return {
            id: String(r.id),
            name: String(r.name ?? "Guest"),
            topic: (r.topic as string) ?? null,
            preferred_at: (r.preferred_at as string) ?? null,
            created_at: String(r.created_at ?? ""),
            link: m ? m[0] : null,
          };
        }),
      );
    })();
    return () => { on = false; };
  }, []);

  return (
    <div className="space-y-8">
      <MeetingsPanel />
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
          Latest consultation bookings (Genius)
        </h3>
        {bookings === null ? (
          <p className="mt-2 text-sm text-neutral-500">Loading bookings…</p>
        ) : bookings.length === 0 ? (
          <p className="mt-2 text-sm text-neutral-500">No bookings found.</p>
        ) : (
          <div className="mt-3 overflow-x-auto rounded-2xl border border-neutral-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-neutral-50 text-left text-neutral-500">
                  <th className="px-4 py-2.5 font-medium">Guest</th>
                  <th className="px-4 py-2.5 font-medium">Topic</th>
                  <th className="px-4 py-2.5 font-medium">Requested</th>
                  <th className="px-4 py-2.5 font-medium">Video meeting</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.id} className="border-t border-neutral-200">
                    <td className="px-4 py-2.5 font-medium">{b.name}</td>
                    <td className="px-4 py-2.5 text-neutral-600">{b.topic ?? "Consultation"}</td>
                    <td className="px-4 py-2.5 text-neutral-600">{b.preferred_at ? new Date(b.preferred_at).toLocaleString() : new Date(b.created_at).toLocaleString()}</td>
                    <td className="px-4 py-2.5">
                      {b.link ? (
                        <a href={b.link} target="_blank" rel="noreferrer" className="font-medium text-amber-700 underline">
                          Open Live room
                        </a>
                      ) : (
                        <span className="text-neutral-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
