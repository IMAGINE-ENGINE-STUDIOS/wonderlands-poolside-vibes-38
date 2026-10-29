/**
 * Wonderlands Live lobby — /live.
 *
 * Set up a meeting (the platform's default video meeting app): every
 * meeting gets a unique Wonderlands Live link. Guests open the link and
 * join with just a name — no account. Host powers need a team sign-in.
 * Credits: Imagine Engine Studios Corp.
 */
import * as React from "react";
import { Link, useNavigate } from "react-router-dom";
import { CalendarPlus, Check, Copy, Link2, Trash2, Video } from "lucide-react";
import { createMeeting, deleteMeeting, loadMeetings } from "@/lib/live/liveMeetings";
import { liveLink, type LiveMeeting } from "@/lib/live/liveTypes";

export default function LiveLobby() {
  const navigate = useNavigate();
  const [meetings, setMeetings] = React.useState<LiveMeeting[]>(() => loadMeetings());
  const [title, setTitle] = React.useState("");
  const [guestName, setGuestName] = React.useState("");
  const [guestEmail, setGuestEmail] = React.useState("");
  const [when, setWhen] = React.useState("");
  const [joinCode, setJoinCode] = React.useState("");
  const [created, setCreated] = React.useState<LiveMeeting | null>(null);
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

  const startInstant = () => {
    const m = createMeeting({ title: "Instant meeting" });
    navigate(`/live/${m.slug}?host=1`);
  };

  const setup = () => {
    const m = createMeeting({
      title: title.trim() || "Wonderlands consultation",
      guestName,
      guestEmail,
      startsAt: when ? new Date(when).toISOString() : null,
    });
    setMeetings(loadMeetings());
    setCreated(m);
    setTitle("");
    setGuestName("");
    setGuestEmail("");
    setWhen("");
  };

  const join = () => {
    const raw = joinCode.trim();
    if (!raw) return;
    const slug = raw.replace(/.*\/live\//, "").replace(/[^a-z0-9-]/gi, "");
    if (slug) navigate(`/live/${slug}`);
  };

  const inviteMailto = (m: LiveMeeting) => {
    const link = liveLink(m.slug);
    const subject = encodeURIComponent(`Your Wonderlands video meeting: ${m.title}`);
    const body = encodeURIComponent(
      `Hello${m.guestName ? ` ${m.guestName}` : ""},\n\nYour Wonderlands video meeting is ready. Join from any device — no account needed:\n\n${link}\n\nSee you there,\nWonderlands World`,
    );
    return `mailto:${m.guestEmail ?? ""}?subject=${subject}&body=${body}`;
  };

  const inputCls =
    "w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500/60";

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10">
      <div className="text-[11px] uppercase tracking-[0.24em] text-amber-600">Wonderlands Live</div>
      <h1 className="mt-2 text-3xl font-semibold">Video meetings, the Wonderlands way</h1>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
        Every meeting gets its own link. Guests join from any device with just a name — no
        account, no downloads. Inside, you can present any product from the catalog and share
        the Design Studio and other tools so they load natively on your guest's screen.
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          onClick={startInstant}
          className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800"
        >
          <Video className="h-4 w-4" /> Start an instant meeting
        </button>
        <div className="flex items-center gap-2">
          <input
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && join()}
            placeholder="Paste a meeting link or code"
            className="w-64 rounded-full border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500/60"
          />
          <button onClick={join} className="rounded-full bg-amber-400 px-4 py-2.5 text-sm font-semibold text-neutral-900 transition hover:bg-amber-300">
            Join
          </button>
        </div>
      </div>

      {/* set up a meeting */}
      <section className="mt-8 rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-2">
          <CalendarPlus className="h-5 w-5 text-amber-600" />
          <h2 className="text-lg font-semibold">Set up a meeting</h2>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Meeting title (e.g. Pool design review)" className={inputCls} />
          <input value={when} onChange={(e) => setWhen(e.target.value)} type="datetime-local" className={inputCls} aria-label="When" />
          <input value={guestName} onChange={(e) => setGuestName(e.target.value)} placeholder="Guest name" className={inputCls} />
          <input value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} placeholder="Guest email (for the invite)" type="email" className={inputCls} />
        </div>
        <button onClick={setup} className="mt-4 rounded-full bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800">
          Create meeting link
        </button>

        {created && (
          <div className="mt-4 rounded-xl bg-amber-50 p-4 ring-1 ring-amber-200">
            <div className="text-sm font-medium text-neutral-900">{created.title}</div>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <code className="rounded bg-white px-2 py-1 text-xs text-neutral-800 ring-1 ring-amber-200">{liveLink(created.slug)}</code>
              <button onClick={() => void copy(liveLink(created.slug), created.slug)} className="inline-flex items-center gap-1 rounded-full bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white">
                {copied === created.slug ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                Copy
              </button>
              <Link to={`/live/${created.slug}?host=1`} className="rounded-full bg-amber-400 px-3 py-1.5 text-xs font-semibold text-neutral-900">
                Open the room
              </Link>
              <a href={inviteMailto(created)} className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-neutral-800 ring-1 ring-amber-300">
                Email the invite
              </a>
            </div>
          </div>
        )}
      </section>

      {/* my meetings */}
      {meetings.length > 0 && (
        <section className="mt-8">
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">Your meetings on this device</h2>
          <div className="mt-3 space-y-2">
            {meetings.map((m) => (
              <div key={m.slug} className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card px-4 py-3">
                <Link2 className="h-4 w-4 shrink-0 text-amber-600" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{m.title}</div>
                  <div className="truncate text-xs text-muted-foreground">
                    {m.startsAt ? `${new Date(m.startsAt).toLocaleString()} · ` : ""}
                    {m.guestName ? `with ${m.guestName} · ` : ""}/live/{m.slug}
                  </div>
                </div>
                <button onClick={() => void copy(liveLink(m.slug), m.slug)} className="rounded-full bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white">
                  {copied === m.slug ? "Copied" : "Copy link"}
                </button>
                <Link to={`/live/${m.slug}?host=1`} className="rounded-full bg-amber-400 px-3 py-1.5 text-xs font-semibold text-neutral-900">
                  Open
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
        </section>
      )}
    </div>
  );
}
