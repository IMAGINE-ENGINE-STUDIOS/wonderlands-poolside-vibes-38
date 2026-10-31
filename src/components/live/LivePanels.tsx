/**
 * Wonderlands Live side panels — chat, the full main-menu product catalog,
 * the widget library, and people/host controls.
 * Credits: Imagine Engine Studios Corp.
 */
import * as React from "react";
import {
  BookOpen, Captions, Crown, Download, FileText, Hand, LayoutDashboard, Lock, LockOpen,
  MicOff, MonitorPlay, Paperclip, PenLine, Search, Send, SlidersHorizontal, Star, UserX,
} from "lucide-react";
import type { LiveRoom } from "@/hooks/useLiveRoom";
import { LIVE_PRODUCT_GROUPS, LIVE_WIDGETS, liveProduct } from "@/lib/live/liveCatalog";
import type { LiveProductView } from "@/lib/live/liveTypes";
import { uploadLiveFile } from "@/lib/live/liveFiles";

const fmtTime = (ts: number) => new Date(ts).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

export function ChatPanel({ room, slug }: { room: LiveRoom; slug: string }) {
  const [draft, setDraft] = React.useState("");
  const [attaching, setAttaching] = React.useState(false);
  const endRef = React.useRef<HTMLDivElement>(null);
  const fileRef = React.useRef<HTMLInputElement>(null);
  React.useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [room.chat.length]);
  const send = () => {
    if (!draft.trim()) return;
    room.sendChat(draft);
    setDraft("");
  };
  const attach = async (f: File | undefined) => {
    if (!f) return;
    setAttaching(true);
    try {
      const att = await uploadLiveFile(f, slug);
      room.sendChat("", att);
    } catch {
      room.sendChat("⚠ A file could not be uploaded.");
    } finally {
      setAttaching(false);
    }
  };
  return (
    <div className="flex h-full flex-col">
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-3 py-3">
        {room.chat.length === 0 && (
          <p className="text-center text-xs text-zinc-400">No messages yet — say hello.</p>
        )}
        {room.chat.map((m) => (
          <div key={m.id} className={m.fromId === room.clientId ? "text-right" : "text-left"}>
            <div className="text-[11px] text-zinc-500">
              {m.fromName}
              {m.role === "host" ? " · host" : ""} · {fmtTime(m.ts)}
            </div>
            <div
              className={`mt-0.5 inline-block max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                m.fromId === room.clientId ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-900"
              }`}
            >
              {m.text && <div>{m.text}</div>}
              {m.attachment && (
                <a href={m.attachment.url} target="_blank" rel="noreferrer" className="mt-1 block">
                  {m.attachment.kind === "image" ? (
                    <img src={m.attachment.url} alt={m.attachment.name} className="max-h-36 rounded-lg object-cover" />
                  ) : null}
                  <span className="mt-1 flex items-center gap-1.5 text-xs underline decoration-dotted">
                    <FileText className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{m.attachment.name}</span>
                  </span>
                </a>
              )}
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <div className="flex items-center gap-2 border-t border-zinc-100 p-2.5">
        <input ref={fileRef} type="file" hidden onChange={(e) => { void attach(e.target.files?.[0]); e.target.value = ""; }} />
        <button
          onClick={() => fileRef.current?.click()}
          disabled={attaching}
          className="rounded-full bg-zinc-100 p-2.5 text-zinc-700 transition hover:bg-zinc-200 disabled:opacity-50"
          aria-label="Attach a file"
          title="Attach a file"
        >
          <Paperclip className="h-4 w-4" />
        </button>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Message everyone…"
          className="min-w-0 flex-1 rounded-full bg-zinc-100 px-3.5 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900/25"
        />
        <button onClick={send} className="rounded-full bg-zinc-900 p-2.5 text-white transition hover:bg-zinc-700" aria-label="Send">
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export function TranscriptPanel({ room, title }: { room: LiveRoom; title: string }) {
  const endRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [room.txLines.length]);
  const save = () => {
    const head = `Wonderlands Live — session transcript\nMeeting: ${title}\nDate: ${new Date().toLocaleString()}\n`;
    const body = room.txLines.map((l) => `[${fmtTime(l.ts)}] ${l.speaker}: ${l.text}`).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([head + "\n" + body], { type: "text/plain" }));
    a.download = `transcript-${new Date().toISOString().slice(0, 16).replace(/[:T]/g, "-")}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-zinc-100 p-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-zinc-900">Transcript</span>
          <button
            onClick={() => room.setTxOn(!room.txOn)}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition ${
              room.txOn ? "bg-emerald-100 text-emerald-700" : "bg-zinc-100 text-zinc-600"
            }`}
          >
            <Captions className="h-3.5 w-3.5" />
            {room.txOn ? "Transcribing" : "Start"}
          </button>
        </div>
        <p className="mt-1.5 text-[11px] leading-relaxed text-zinc-500">
          {room.txSupported
            ? "Each person's own device transcribes what they say and shares the lines with the room. Turn it on and speak — your words appear here for everyone."
            : "This browser does not offer speech transcription (Chrome works best). You can still read lines shared by other participants."}
        </p>
      </div>
      <div className="min-h-0 flex-1 space-y-2.5 overflow-y-auto px-3 py-3">
        {room.txLines.length === 0 && (
          <p className="text-center text-xs text-zinc-400">No transcript lines yet.</p>
        )}
        {room.txLines.map((l) => (
          <div key={l.id} className="text-sm leading-relaxed">
            <span className="font-medium text-zinc-900">{l.speaker}</span>{" "}
            <span className="text-[11px] text-zinc-400">{fmtTime(l.ts)}</span>
            <div className="text-zinc-700">{l.text}</div>
          </div>
        ))}
        <div ref={endRef} />
      </div>
      {room.txLines.length > 0 && (
        <div className="border-t border-zinc-100 p-2.5">
          <button onClick={save} className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-zinc-900 py-2 text-sm text-white transition hover:bg-zinc-700">
            <Download className="h-4 w-4" /> Download transcript (.txt)
          </button>
        </div>
      )}
    </div>
  );
}

export function JournalPanel({ slug, title }: { slug: string; title: string }) {
  const draftKey = `wlive:journal:${slug}:draft`;
  const savedKey = `wlive:journal:${slug}:saved`;
  const [draft, setDraft] = React.useState(() => { try { return localStorage.getItem(draftKey) ?? ""; } catch { return ""; } });
  const [saved, setSaved] = React.useState<Array<{ ts: number; text: string }>>(() => {
    try { return JSON.parse(localStorage.getItem(savedKey) ?? "[]") as Array<{ ts: number; text: string }>; } catch { return []; }
  });
  React.useEffect(() => { try { localStorage.setItem(draftKey, draft); } catch { /* private mode */ } }, [draft, draftKey]);
  const saveNote = () => {
    const text = draft.trim();
    if (!text) return;
    const next = [{ ts: Date.now(), text }, ...saved].slice(0, 50);
    setSaved(next);
    try { localStorage.setItem(savedKey, JSON.stringify(next)); } catch { /* private mode */ }
    // Mirror into the Genius journal store so the notes sit next to the
    // session transcript in the Genius thread (SFH behaviour).
    try {
      const KEY = "wlive:genius:journal:v1";
      const entries = JSON.parse(localStorage.getItem(KEY) ?? "[]") as Array<{ ts: number; kind: string; content: string }>;
      const content = `📓 Journal note — live session "${title}" • ${new Date().toLocaleString()}\n\n${text}`;
      if (!entries.some((e) => e?.content === content)) {
        localStorage.setItem(KEY, JSON.stringify([{ ts: Date.now(), kind: "note", content }, ...entries].slice(0, 50)));
      }
    } catch { /* best effort */ }
    setDraft("");
  };
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-zinc-100 p-3">
        <div className="flex items-center gap-2">
          <PenLine className="h-4 w-4 text-zinc-500" />
          <span className="text-sm font-medium text-zinc-900">Journal</span>
        </div>
        <p className="mt-1 text-[11px] leading-relaxed text-zinc-500">
          Your private session notepad. Drafts save automatically on this device; saved notes also go to your Genius journal.
        </p>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Write your notes for this session…"
          className="min-h-[160px] w-full resize-y rounded-xl bg-zinc-50 px-3 py-2 text-sm leading-relaxed text-zinc-900 ring-1 ring-zinc-200 placeholder:text-zinc-400 focus:outline-none focus:ring-zinc-900/25"
        />
        <button
          onClick={saveNote}
          disabled={!draft.trim()}
          className="mt-2 w-full rounded-full bg-zinc-900 py-2 text-sm text-white transition hover:bg-zinc-700 disabled:opacity-40"
        >
          Save note to Genius
        </button>
        {saved.length > 0 && (
          <div className="mt-4 space-y-2">
            <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Saved notes</div>
            {saved.map((n) => (
              <div key={n.ts} className="rounded-xl bg-zinc-50 p-3 ring-1 ring-zinc-200">
                <div className="text-[11px] text-zinc-400">{new Date(n.ts).toLocaleString()}</div>
                <div className="mt-1 whitespace-pre-wrap text-sm text-zinc-800">{n.text}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const PRODUCT_VIEWS: Array<{ id: LiveProductView; label: string; blurb: string; icon: React.ReactNode; route: string | null }> = [
  { id: "showcase", label: "Big showcase", blurb: "The product, big — finishes and priced options below.", icon: <LayoutDashboard className="h-4 w-4" />, route: null },
  { id: "flip", label: "FLIP book", blurb: "The FLIP collection book version of this product.", icon: <BookOpen className="h-4 w-4" />, route: "/flip" },
  { id: "studio", label: "Wonderlands Studio", blurb: "Open the product in the Design Studio.", icon: <MonitorPlay className="h-4 w-4" />, route: "/design-studio" },
  { id: "configure", label: "Configure & quote", blurb: "The full configuration and quotation tool.", icon: <SlidersHorizontal className="h-4 w-4" />, route: "/quote" },
];

export function ProductsPanel({ room, onPresented }: { room: LiveRoom; onPresented?: () => void }) {
  const [q, setQ] = React.useState("");
  const [chooserFor, setChooserFor] = React.useState<string | null>(null);
  const query = q.trim().toLowerCase();
  const present = (key: string, view: LiveProductView) => {
    const def = PRODUCT_VIEWS.find((v) => v.id === view);
    if (room.isHost) {
      room.setStage({
        widgetId: "product-showcase",
        route: def?.route ?? null,
        productKey: key,
        productView: view,
        variantIdx: 0,
        optionIds: [],
        file: null,
      });
    } else {
      room.updateProduct(key, 0, []);
    }
    setChooserFor(null);
    // Drop it into the viewport: close the panel so the stage is front and center.
    onPresented?.();
  };
  const canPresent = room.isHost || room.canInteract();
  const chooserProduct = chooserFor ? liveProduct(chooserFor) : null;
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-zinc-100 p-2.5">
        <div className="flex items-center gap-2 rounded-full bg-zinc-100 px-3 py-2">
          <Search className="h-4 w-4 text-zinc-500" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search the full catalog…"
            className="min-w-0 flex-1 bg-transparent text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none"
          />
        </div>
        <p className="mt-2 px-1 text-[11px] leading-relaxed text-zinc-500">
          {room.isHost
            ? "Tap a product, then choose how to drop it on the stage — big showcase, FLIP book, Studio or configurator."
            : canPresent
              ? "The host unlocked you: tap a product to change what everyone is viewing."
              : "The host presents products here. Ask in chat if you'd like a closer look."}
        </p>
      </div>
      {chooserProduct && (
        <div className="border-b border-amber-200 bg-amber-50 p-3">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-zinc-900">Present “{chooserProduct.name}” as…</div>
            <button onClick={() => setChooserFor(null)} className="text-xs text-zinc-500 underline">
              Cancel
            </button>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {PRODUCT_VIEWS.map((v) => (
              <button
                key={v.id}
                onClick={() => present(chooserProduct.key, v.id)}
                className="rounded-xl bg-white p-2.5 text-left ring-1 ring-amber-200 transition hover:ring-amber-400"
              >
                <span className="flex items-center gap-1.5 text-xs font-semibold text-zinc-900">
                  {v.icon} {v.label}
                </span>
                <span className="mt-1 block text-[11px] leading-snug text-zinc-500">{v.blurb}</span>
              </button>
            ))}
          </div>
          {!room.isHost && (
            <p className="mt-2 text-[11px] text-zinc-500">As an unlocked guest you present the big showcase; the host can switch the view.</p>
          )}
        </div>
      )}
      <div className="min-h-0 flex-1 overflow-y-auto p-2.5">
        {LIVE_PRODUCT_GROUPS.map((group) => {
          const items = group.products.filter(
            (p) => !query || p.name.toLowerCase().includes(query) || (p.brand ?? "").toLowerCase().includes(query),
          );
          if (!items.length) return null;
          return (
            <div key={group.category} className="mb-4">
              <div className="px-1 pb-2 text-[11px] uppercase tracking-[0.2em] text-zinc-500">
                {group.category}s · {items.length}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {items.map((p) => {
                  const active = room.stage.widgetId === "product-showcase" && room.stage.productKey === p.key;
                  return (
                    <button
                      key={p.key}
                      disabled={!canPresent}
                      onClick={() => (room.isHost ? setChooserFor(p.key) : present(p.key, "showcase"))}
                      className={`overflow-hidden rounded-lg bg-white text-left ring-1 transition ${
                        active ? "ring-emerald-500" : "ring-zinc-200"
                      } ${canPresent ? "hover:ring-emerald-400/70" : "cursor-not-allowed opacity-60"}`}
                    >
                      <img src={p.image} alt={p.name} className="h-16 w-full object-cover" loading="lazy" />
                      <div className="p-2">
                        <div className="truncate text-xs font-medium text-zinc-900">{p.name}</div>
                        <div className="truncate text-[11px] text-zinc-500">{p.brand ?? "Wonderlands"}</div>
                        <div className="font-mono text-[11px] font-medium text-zinc-900">${p.price.toLocaleString()}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function WidgetsPanel({ room, onPresented }: { room: LiveRoom; onPresented?: () => void }) {
  const share = (id: string, route?: string) => {
    if (!room.isHost) return;
    room.setStage({ widgetId: id, route: route ?? null });
    // Drop it into the viewport: close the panel so the stage is front and center.
    onPresented?.();
  };
  return (
    <div className="h-full overflow-y-auto p-2.5">
      <p className="px-1 pb-2 text-[11px] leading-relaxed text-zinc-500">
        {room.isHost
          ? "Tap a widget and it drops onto the stage in the video area, loaded natively on every participant's device — no screen-share lag. You control who can interact."
          : "The host shares widgets here. They load on your device at full speed."}
      </p>
      <div className="space-y-2">
        {LIVE_WIDGETS.map((w) => {
          const active = room.stage.widgetId === w.id;
          return (
            <button
              key={w.id}
              disabled={!room.isHost}
              onClick={() => share(w.id, w.route)}
              className={`flex w-full items-start gap-3 rounded-xl bg-zinc-50 p-3 text-left ring-1 transition ${
                active ? "ring-emerald-500" : "ring-zinc-200"
              } ${room.isHost ? "hover:ring-emerald-400/70" : "cursor-not-allowed opacity-70"}`}
            >
              <MonitorPlay className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
              <span>
                <span className="block text-sm font-medium text-zinc-900">{w.title}</span>
                <span className="block text-xs leading-relaxed text-zinc-500">{w.blurb}</span>
                {active && <span className="mt-1 block text-[11px] font-medium text-emerald-600">On stage now</span>}
              </span>
            </button>
          );
        })}
      </div>
      {room.isHost && room.stage.widgetId && (
        <button
          onClick={room.clearStage}
          className="mt-3 w-full rounded-full bg-zinc-900 py-2 text-sm text-white transition hover:bg-zinc-700"
        >
          Clear the stage
        </button>
      )}
    </div>
  );
}

export function PeoplePanel({ room }: { room: LiveRoom }) {
  return (
    <div className="h-full overflow-y-auto p-2.5">
      {room.isHost && (
        <div className="mb-3 rounded-xl bg-zinc-50 p-3 ring-1 ring-zinc-200">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-zinc-900">Guest interaction</span>
            <button
              onClick={() => room.setLockAll(!room.stage.lockAll)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition ${
                room.stage.lockAll ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"
              }`}
            >
              {room.stage.lockAll ? <Lock className="h-3.5 w-3.5" /> : <LockOpen className="h-3.5 w-3.5" />}
              {room.stage.lockAll ? "Locked for all" : "Open to all"}
            </button>
          </div>
          <p className="mt-1.5 text-[11px] leading-relaxed text-zinc-500">
            Locked guests watch the stage exactly as you present it. Unlock a guest below to let them pick
            finishes and features themselves.
          </p>
        </div>
      )}
      <div className="space-y-2">
        {room.participants.map((p) => {
          const me = p.clientId === room.clientId;
          const locked = !(p.role === "host") && (room.stage.locks[p.clientId] ?? room.stage.lockAll);
          return (
            <div key={p.clientId} className="rounded-xl bg-zinc-50 p-3 ring-1 ring-zinc-200">
              <div className="flex items-center gap-2">
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-zinc-900">
                  {p.name}
                  {me ? " (you)" : ""}
                </span>
                {p.role === "host" && <Crown className="h-4 w-4 shrink-0 text-amber-500" />}
                {p.hand && <Hand className="h-4 w-4 shrink-0 text-emerald-600" />}
                {!p.mic && <MicOff className="h-4 w-4 shrink-0 text-red-500" />}
              </div>
              {room.isHost && !me && p.role !== "host" && (
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  <button
                    onClick={() => room.setGuestLock(p.clientId, !locked)}
                    className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[11px] text-zinc-700 ring-1 ring-zinc-200 transition hover:bg-zinc-50"
                  >
                    {locked ? <Lock className="h-3 w-3" /> : <LockOpen className="h-3 w-3" />}
                    {locked ? "Unlock" : "Lock"}
                  </button>
                  <button
                    onClick={() => room.muteGuest(p.clientId)}
                    className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[11px] text-zinc-700 ring-1 ring-zinc-200 transition hover:bg-zinc-50"
                  >
                    <MicOff className="h-3 w-3" /> Mute
                  </button>
                  <button
                    onClick={() => room.spotlightAll(room.spotlight === p.clientId ? null : p.clientId)}
                    className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[11px] text-zinc-700 ring-1 ring-zinc-200 transition hover:bg-zinc-50"
                  >
                    <Star className="h-3 w-3" /> {room.spotlight === p.clientId ? "Unspotlight" : "Spotlight"}
                  </button>
                  <button
                    onClick={() => room.eject(p.clientId)}
                    className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-[11px] text-red-600 ring-1 ring-red-200 transition hover:bg-red-100"
                  >
                    <UserX className="h-3 w-3" /> Remove
                  </button>
                </div>
              )}
              {room.isHost && !me && p.role !== "host" && (
                <div className="mt-1.5 text-[11px] text-zinc-400">
                  Stage interaction: {locked ? "locked" : "allowed"}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
