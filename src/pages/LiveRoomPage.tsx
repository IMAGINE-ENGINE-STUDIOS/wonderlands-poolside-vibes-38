/**
 * Wonderlands Live room — /live/:slug.
 *
 * Guests join with just a name (no account). Team members who are signed in
 * can claim host powers: stage/widget control, per-guest interaction locks,
 * spotlight, mute and remove. Widgets shared to the stage load natively on
 * every device.
 * Credits: Imagine Engine Studios Corp.
 */
import * as React from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import {
  Check, Copy, Hand, LogOut, MessageSquare, Mic, MicOff, MonitorUp, Package,
  Users, Video, VideoOff, LayoutGrid,
} from "lucide-react";
import { useLiveRoom } from "@/hooks/useLiveRoom";
import { VideoTile, LiveStage } from "@/components/live/LiveStage";
import { ChatPanel, PeoplePanel, ProductsPanel, WidgetsPanel } from "@/components/live/LivePanels";
import { canHost, meetingTitle, GUEST_NAME_KEY } from "@/lib/live/liveMeetings";
import { liveLink } from "@/lib/live/liveTypes";

type Panel = "chat" | "products" | "widgets" | "people" | null;

export default function LiveRoomPage() {
  const { slug = "" } = useParams();
  const [params] = useSearchParams();
  const room = useLiveRoom(slug);
  const [nameInput, setNameInput] = React.useState(() => {
    try { return localStorage.getItem(GUEST_NAME_KEY) ?? ""; } catch { return ""; }
  });
  const [eligible, setEligible] = React.useState(false);
  const [panel, setPanel] = React.useState<Panel>(null);
  const [copied, setCopied] = React.useState(false);
  const title = meetingTitle(slug) ?? "Wonderlands Live meeting";
  const link = liveLink(slug);

  React.useEffect(() => {
    let on = true;
    void canHost().then((v) => { if (on) setEligible(v); });
    return () => { on = false; };
  }, []);

  const doJoin = (asHost: boolean) => {
    const n = nameInput.trim() || "Guest";
    try { localStorage.setItem(GUEST_NAME_KEY, n); } catch { /* private mode */ }
    void room.join(n, asHost && eligible);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      window.prompt("Copy your meeting link:", link);
    }
  };

  /* ------------------------------ pre-join ------------------------------ */
  if (room.ejected) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-neutral-950 px-4 text-white">
        <div className="w-full max-w-sm rounded-2xl bg-white/5 p-6 text-center ring-1 ring-white/10">
          <div className="text-lg font-semibold">The host ended your session</div>
          <p className="mt-2 text-sm text-white/60">
            If this was a mistake, ask your host for a fresh invitation.
          </p>
          <Link to="/live" className="mt-5 inline-block rounded-full bg-amber-300 px-5 py-2.5 text-sm font-medium text-neutral-900">
            Back to Wonderlands Live
          </Link>
        </div>
      </div>
    );
  }

  if (!room.joined) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-neutral-950 px-4 text-white">
        <div className="w-full max-w-sm rounded-2xl bg-white/5 p-6 ring-1 ring-white/10">
          <div className="text-[11px] uppercase tracking-[0.24em] text-amber-200/90">Wonderlands Live</div>
          <h1 className="mt-2 text-2xl font-semibold">{title}</h1>
          <p className="mt-2 text-sm leading-relaxed text-white/60">
            Joining takes seconds — no account needed. Shared designs and products load
            right here on your device, at full speed.
          </p>
          <label className="mt-5 block text-xs uppercase tracking-[0.16em] text-white/50">Your name</label>
          <input
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && doJoin(params.get("host") === "1")}
            placeholder="e.g. Alex Rivera"
            className="mt-1.5 w-full rounded-xl bg-white/10 px-3.5 py-2.5 text-sm text-white placeholder:text-white/35 focus:outline-none focus:ring-1 focus:ring-amber-300/60"
          />
          {eligible ? (
            <div className="mt-4 space-y-2">
              <button onClick={() => doJoin(true)} className="w-full rounded-full bg-amber-300 py-2.5 text-sm font-semibold text-neutral-900 transition hover:bg-amber-200">
                Join as host
              </button>
              <button onClick={() => doJoin(false)} className="w-full rounded-full bg-white/10 py-2.5 text-sm text-white transition hover:bg-white/15">
                Join as guest
              </button>
              <p className="text-center text-[11px] text-white/40">You're signed in with a Wonderlands team account.</p>
            </div>
          ) : (
            <button onClick={() => doJoin(false)} className="mt-4 w-full rounded-full bg-amber-300 py-2.5 text-sm font-semibold text-neutral-900 transition hover:bg-amber-200">
              Join the meeting
            </button>
          )}
          {room.mediaError && <p className="mt-3 text-xs text-amber-200/90">{room.mediaError}</p>}
        </div>
      </div>
    );
  }

  /* ------------------------------ in room ------------------------------ */
  const stageActive = !!room.stage.widgetId;
  const spotlightId = room.spotlight;
  const spotlightStream =
    spotlightId === room.clientId
      ? room.screenStream ?? room.localStream
      : spotlightId
        ? room.remoteStreams[spotlightId] ?? null
        : null;
  const spotlightName =
    spotlightId === room.clientId
      ? room.name
      : room.participants.find((p) => p.clientId === spotlightId)?.name ?? "";

  // Tiles for the grid / filmstrip. Whoever is shown big (spotlight) is NOT
  // repeated in the strip — that was the duplicated-camera bug.
  const renderTiles = (excludeId: string | null) => (
    <>
      {excludeId !== room.clientId && (
        <div
          className="aspect-video max-h-full shrink-0"
          onDoubleClick={() => room.setMySpotlight(room.spotlight === room.clientId ? null : room.clientId)}
        >
          <VideoTile stream={room.screenStream ?? room.localStream} name={room.name} isLocal micOff={!room.micOn} hand={room.hand} isHost={room.isHost} small />
        </div>
      )}
      {room.participants
        .filter((p) => p.clientId !== room.clientId && p.clientId !== excludeId)
        .map((p) => (
          <div
            key={p.clientId}
            className="aspect-video max-h-full shrink-0"
            onDoubleClick={() => room.setMySpotlight(room.spotlight === p.clientId ? null : p.clientId)}
          >
            <VideoTile stream={room.remoteStreams[p.clientId] ?? null} name={p.name} micOff={!p.mic} hand={p.hand} isHost={p.role === "host"} small />
          </div>
        ))}
    </>
  );
  const stageTiles = renderTiles(null);
  const spotlightTiles = renderTiles(spotlightId);
  const spotlightStripEmpty = room.participants.length <= 1;

  const panelBtn = (p: Panel, icon: React.ReactNode, label: string) => (
    <button
      onClick={() => setPanel(panel === p ? null : p)}
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium transition ${
        panel === p ? "bg-amber-300 text-neutral-900" : "bg-white/10 text-white hover:bg-white/15"
      }`}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );

  const ctrlBtn = (on: boolean, onClick: () => void, icon: React.ReactNode, label: string, danger = false) => (
    <button
      onClick={onClick}
      className={`flex shrink-0 flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[10px] font-medium transition sm:px-3 ${
        danger
          ? "bg-red-500 text-white hover:bg-red-400"
          : on
            ? "bg-white/10 text-white hover:bg-white/15"
            : "bg-red-400/20 text-red-200 hover:bg-red-400/30"
      }`}
    >
      {icon}
      {label}
    </button>
  );

  return (
    <div className="flex h-dvh flex-col bg-neutral-950 text-white">
      {/* header */}
      <header className="flex items-center gap-3 border-b border-white/10 px-4 py-2.5">
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold">{title}</div>
          <div className="text-[11px] text-white/45">
            Wonderlands Live · {room.participants.length} in the room
            {room.isHost ? " · you're hosting" : ""}
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button onClick={copyLink} className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-2 text-xs font-medium transition hover:bg-white/15">
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-300" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied" : (<><span className="hidden sm:inline">Copy invite link</span><span className="sm:hidden">Copy link</span></>)}
          </button>
          <button
            onClick={() => { room.leave(); window.location.href = "/live"; }}
            className="inline-flex items-center gap-1.5 rounded-full bg-red-500 px-3 py-2 text-xs font-semibold transition hover:bg-red-400"
          >
            <LogOut className="h-3.5 w-3.5" /> Leave
          </button>
        </div>
      </header>

      {room.mediaError && (
        <div className="bg-amber-300/15 px-4 py-1.5 text-center text-xs text-amber-100">{room.mediaError}</div>
      )}

      {/* body */}
      <div className="relative flex min-h-0 flex-1">
        <main className="flex min-w-0 flex-1 flex-col gap-2 p-2.5">
          {stageActive ? (
            <>
              <div className="min-h-0 flex-1">
                <LiveStage stage={room.stage} interactive={room.canInteract()} onProductSelect={room.updateProduct} />
              </div>
              <div className="flex h-24 shrink-0 gap-2 overflow-x-auto">{stageTiles}</div>
            </>
          ) : spotlightId ? (
            <>
              <div className="min-h-0 flex-1">
                <VideoTile stream={spotlightStream} name={spotlightName} isLocal={spotlightId === room.clientId} />
              </div>
              {!spotlightStripEmpty && (
                <div className="flex h-24 shrink-0 gap-2 overflow-x-auto">{spotlightTiles}</div>
              )}
            </>
          ) : (
            <div
              className={`grid min-h-0 flex-1 gap-2 ${
                room.participants.length <= 1
                  ? "grid-cols-1"
                  : room.participants.length <= 4
                    ? "grid-cols-2"
                    : "grid-cols-3"
              }`}
            >
              {stageTiles}
            </div>
          )}
        </main>

        {panel && (
          <aside className="absolute inset-y-0 right-0 z-30 flex w-[320px] max-w-[88vw] flex-col border-l border-white/10 bg-neutral-900 shadow-2xl lg:static lg:z-auto lg:shadow-none">
            <div className="flex items-center gap-1 border-b border-white/10 p-2">
              {(["chat", "products", "widgets", "people"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPanel(p)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium capitalize transition ${
                    panel === p ? "bg-amber-300 text-neutral-900" : "text-white/70 hover:bg-white/10"
                  }`}
                >
                  {p}
                </button>
              ))}
              <button onClick={() => setPanel(null)} className="ml-auto rounded-full px-2 py-1.5 text-xs text-white/50 hover:bg-white/10">
                ✕
              </button>
            </div>
            <div className="min-h-0 flex-1">
              {panel === "chat" && <ChatPanel room={room} />}
              {panel === "products" && <ProductsPanel room={room} />}
              {panel === "widgets" && <WidgetsPanel room={room} />}
              {panel === "people" && <PeoplePanel room={room} />}
            </div>
          </aside>
        )}
      </div>

      {/* controls */}
      <footer className="flex items-end justify-start gap-1.5 overflow-x-auto border-t border-white/10 px-2.5 py-2.5 sm:justify-center sm:gap-2 sm:px-3">
        {ctrlBtn(room.micOn, room.toggleMic, room.micOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />, "Mic")}
        {ctrlBtn(room.camOn, room.toggleCam, room.camOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />, "Camera")}
        {ctrlBtn(!room.sharingScreen, () => void room.toggleScreen(), <MonitorUp className="h-5 w-5" />, "Share")}
        {ctrlBtn(!room.hand, room.toggleHand, <Hand className="h-5 w-5" />, "Hand")}
        <div className="mx-1 hidden h-10 w-px shrink-0 bg-white/10 sm:block" />
        <div className="flex shrink-0 items-center gap-1.5 pb-0.5">
          {panelBtn("chat", <MessageSquare className="h-4 w-4" />, "Chat")}
          {panelBtn("products", <Package className="h-4 w-4" />, "Products")}
          {panelBtn("widgets", <LayoutGrid className="h-4 w-4" />, "Widgets")}
          {panelBtn("people", <Users className="h-4 w-4" />, "People")}
        </div>
      </footer>
    </div>
  );
}
