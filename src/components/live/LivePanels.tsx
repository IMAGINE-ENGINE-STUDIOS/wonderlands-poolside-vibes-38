/**
 * Wonderlands Live side panels — chat, the full main-menu product catalog,
 * the widget library, and people/host controls.
 * Credits: Imagine Engine Studios Corp.
 */
import * as React from "react";
import {
  Crown, Hand, Lock, LockOpen, MicOff, MonitorPlay, Search, Send, Star, UserX,
} from "lucide-react";
import type { LiveRoom } from "@/hooks/useLiveRoom";
import { LIVE_PRODUCT_GROUPS, LIVE_WIDGETS } from "@/lib/live/liveCatalog";

const fmtTime = (ts: number) => new Date(ts).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

export function ChatPanel({ room }: { room: LiveRoom }) {
  const [draft, setDraft] = React.useState("");
  const endRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [room.chat.length]);
  const send = () => {
    if (!draft.trim()) return;
    room.sendChat(draft);
    setDraft("");
  };
  return (
    <div className="flex h-full flex-col">
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-3 py-3">
        {room.chat.length === 0 && (
          <p className="text-center text-xs text-white/40">No messages yet — say hello.</p>
        )}
        {room.chat.map((m) => (
          <div key={m.id} className={m.fromId === room.clientId ? "text-right" : "text-left"}>
            <div className="text-[11px] text-white/45">
              {m.fromName}
              {m.role === "host" ? " · host" : ""} · {fmtTime(m.ts)}
            </div>
            <div
              className={`mt-0.5 inline-block max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                m.fromId === room.clientId ? "bg-amber-300 text-neutral-900" : "bg-white/10 text-white"
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <div className="flex items-center gap-2 border-t border-white/10 p-2.5">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Message everyone…"
          className="min-w-0 flex-1 rounded-full bg-white/10 px-3.5 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-amber-300/60"
        />
        <button onClick={send} className="rounded-full bg-amber-300 p-2.5 text-neutral-900 transition hover:bg-amber-200" aria-label="Send">
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export function ProductsPanel({ room, onPresented }: { room: LiveRoom; onPresented?: () => void }) {
  const [q, setQ] = React.useState("");
  const query = q.trim().toLowerCase();
  const present = (key: string) => {
    if (room.isHost) {
      room.setStage({ widgetId: "product-showcase", route: null, productKey: key, variantIdx: 0 });
    } else {
      room.updateProduct(key, 0);
    }
    // Drop it into the viewport: close the panel so the stage is front and center.
    onPresented?.();
  };
  const canPresent = room.isHost || room.canInteract();
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-white/10 p-2.5">
        <div className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-2">
          <Search className="h-4 w-4 text-white/50" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search the full catalog…"
            className="min-w-0 flex-1 bg-transparent text-sm text-white placeholder:text-white/40 focus:outline-none"
          />
        </div>
        <p className="mt-2 px-1 text-[11px] leading-relaxed text-white/45">
          {room.isHost
            ? "Tap a product to present it on the shared stage — it loads on every guest's device."
            : canPresent
              ? "The host unlocked you: tap a product to change what everyone is viewing."
              : "The host presents products here. Ask in chat if you'd like a closer look."}
        </p>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-2.5">
        {LIVE_PRODUCT_GROUPS.map((group) => {
          const items = group.products.filter(
            (p) => !query || p.name.toLowerCase().includes(query) || (p.brand ?? "").toLowerCase().includes(query),
          );
          if (!items.length) return null;
          return (
            <div key={group.category} className="mb-4">
              <div className="px-1 pb-2 text-[11px] uppercase tracking-[0.2em] text-white/45">
                {group.category}s · {items.length}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {items.map((p) => {
                  const active = room.stage.widgetId === "product-showcase" && room.stage.productKey === p.key;
                  return (
                    <button
                      key={p.key}
                      disabled={!canPresent}
                      onClick={() => present(p.key)}
                      className={`overflow-hidden rounded-lg bg-white/5 text-left ring-1 transition ${
                        active ? "ring-amber-300" : "ring-white/10"
                      } ${canPresent ? "hover:ring-amber-200/70" : "cursor-not-allowed opacity-60"}`}
                    >
                      <img src={p.image} alt={p.name} className="h-16 w-full object-cover" loading="lazy" />
                      <div className="p-2">
                        <div className="truncate text-xs font-medium text-white">{p.name}</div>
                        <div className="truncate text-[11px] text-white/50">{p.brand ?? "Wonderlands"}</div>
                        <div className="text-[11px] font-medium text-amber-200">${p.price.toLocaleString()}</div>
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
      <p className="px-1 pb-2 text-[11px] leading-relaxed text-white/45">
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
              className={`flex w-full items-start gap-3 rounded-xl bg-white/5 p-3 text-left ring-1 transition ${
                active ? "ring-amber-300" : "ring-white/10"
              } ${room.isHost ? "hover:ring-amber-200/70" : "cursor-not-allowed opacity-70"}`}
            >
              <MonitorPlay className="mt-0.5 h-5 w-5 shrink-0 text-amber-200" />
              <span>
                <span className="block text-sm font-medium text-white">{w.title}</span>
                <span className="block text-xs leading-relaxed text-white/55">{w.blurb}</span>
                {active && <span className="mt-1 block text-[11px] font-medium text-amber-200">On stage now</span>}
              </span>
            </button>
          );
        })}
      </div>
      {room.isHost && room.stage.widgetId && (
        <button
          onClick={room.clearStage}
          className="mt-3 w-full rounded-full bg-white/10 py-2 text-sm text-white transition hover:bg-white/15"
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
        <div className="mb-3 rounded-xl bg-white/5 p-3 ring-1 ring-white/10">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-white">Guest interaction</span>
            <button
              onClick={() => room.setLockAll(!room.stage.lockAll)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition ${
                room.stage.lockAll ? "bg-red-400/20 text-red-200" : "bg-emerald-400/20 text-emerald-200"
              }`}
            >
              {room.stage.lockAll ? <Lock className="h-3.5 w-3.5" /> : <LockOpen className="h-3.5 w-3.5" />}
              {room.stage.lockAll ? "Locked for all" : "Open to all"}
            </button>
          </div>
          <p className="mt-1.5 text-[11px] leading-relaxed text-white/45">
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
            <div key={p.clientId} className="rounded-xl bg-white/5 p-3 ring-1 ring-white/10">
              <div className="flex items-center gap-2">
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-white">
                  {p.name}
                  {me ? " (you)" : ""}
                </span>
                {p.role === "host" && <Crown className="h-4 w-4 shrink-0 text-amber-300" />}
                {p.hand && <Hand className="h-4 w-4 shrink-0 text-amber-200" />}
                {!p.mic && <MicOff className="h-4 w-4 shrink-0 text-red-300" />}
              </div>
              {room.isHost && !me && p.role !== "host" && (
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  <button
                    onClick={() => room.setGuestLock(p.clientId, !locked)}
                    className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-[11px] text-white transition hover:bg-white/15"
                  >
                    {locked ? <Lock className="h-3 w-3" /> : <LockOpen className="h-3 w-3" />}
                    {locked ? "Unlock" : "Lock"}
                  </button>
                  <button
                    onClick={() => room.muteGuest(p.clientId)}
                    className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-[11px] text-white transition hover:bg-white/15"
                  >
                    <MicOff className="h-3 w-3" /> Mute
                  </button>
                  <button
                    onClick={() => room.spotlightAll(room.spotlight === p.clientId ? null : p.clientId)}
                    className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-[11px] text-white transition hover:bg-white/15"
                  >
                    <Star className="h-3 w-3" /> {room.spotlight === p.clientId ? "Unspotlight" : "Spotlight"}
                  </button>
                  <button
                    onClick={() => room.eject(p.clientId)}
                    className="inline-flex items-center gap-1 rounded-full bg-red-400/15 px-2.5 py-1 text-[11px] text-red-200 transition hover:bg-red-400/25"
                  >
                    <UserX className="h-3 w-3" /> Remove
                  </button>
                </div>
              )}
              {room.isHost && !me && p.role !== "host" && (
                <div className="mt-1.5 text-[11px] text-white/40">
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
