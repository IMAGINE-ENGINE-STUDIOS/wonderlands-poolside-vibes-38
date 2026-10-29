/**
 * Wonderlands Live room — /live/:slug.
 *
 * Same format and theme as the Startup Factory Hub live video room: a light
 * chrome frame, a dark zinc viewport, SFH-style tiles, and the floating dark
 * pill icon bar (round buttons — white when active, zinc when idle, red when
 * mic/cam are off, red Leave pill).
 *
 * Guests join with just a name (no account). Host powers (stage/widget
 * control, per-guest interaction locks, spotlight, mute, remove) go to team
 * accounts — and to any signed-in account that arrives on a host link
 * (?host=1, the links the lobby and dashboards generate; the guest invite
 * link never carries it). Widgets shared to the stage load natively on
 * every device and take the hero spot in the viewport, like presenting a
 * file in SFH.
 * Credits: Imagine Engine Studios Corp.
 */
import * as React from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import {
  Check, Copy, Hand, LayoutGrid, MessageSquare, Mic, MicOff, MonitorUp, Package,
  PhoneOff, Users, Video, VideoOff, X,
} from "lucide-react";
import { useLiveRoom } from "@/hooks/useLiveRoom";
import { VideoTile, LiveStage } from "@/components/live/LiveStage";
import { ChatPanel, PeoplePanel, ProductsPanel, WidgetsPanel } from "@/components/live/LivePanels";
import { canHost, meetingTitle, GUEST_NAME_KEY } from "@/lib/live/liveMeetings";
import { liveLink } from "@/lib/live/liveTypes";
import { useAuth } from "@/contexts/AuthContext";

type Panel = "chat" | "products" | "widgets" | "people" | null;

// SFH stage grid: 1 = full, 2–4 = halves/quarters, then 3 across.
const colsFor = (n: number) => (n <= 1 ? 1 : n <= 4 ? 2 : n <= 9 ? 3 : 4);

export default function LiveRoomPage() {
  const { slug = "" } = useParams();
  const [params] = useSearchParams();
  const room = useLiveRoom(slug);
  const { user } = useAuth();
  const [nameInput, setNameInput] = React.useState(() => {
    try { return localStorage.getItem(GUEST_NAME_KEY) ?? ""; } catch { return ""; }
  });
  const [teamHost, setTeamHost] = React.useState(false);
  const [panel, setPanel] = React.useState<Panel>(null);
  const [copied, setCopied] = React.useState(false);
  const title = meetingTitle(slug) ?? "Wonderlands Live meeting";
  const link = liveLink(slug);

  React.useEffect(() => {
    let on = true;
    void canHost().then((v) => { if (on) setTeamHost(v); });
    return () => { on = false; };
  }, []);

  // Host = team account, OR a signed-in account arriving on a host link.
  // The guest invite link never carries ?host=1, so guests stay guests.
  const eligible = teamHost || (!!user && params.get("host") === "1");

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
      <div className="flex min-h-dvh w-full items-center justify-center bg-zinc-950 p-6">
        <div className="w-full max-w-sm rounded-[2rem] border border-white/[0.08] bg-white/[0.06] p-10 text-center backdrop-blur-2xl">
          <div className="text-lg font-semibold text-white">The host ended your session</div>
          <p className="mt-2 text-sm text-zinc-400">
            If this was a mistake, ask your host for a fresh invitation.
          </p>
          <Link to="/live" className="mt-6 inline-block rounded-full bg-white px-5 py-2 text-sm font-medium text-zinc-900">
            Back to Wonderlands Live
          </Link>
        </div>
      </div>
    );
  }

  if (!room.joined) {
    return (
      <div className="flex min-h-dvh w-full items-center justify-center bg-zinc-950 p-6">
        <div className="w-full max-w-sm rounded-[2rem] border border-white/[0.08] bg-white/[0.06] p-8 backdrop-blur-2xl sm:p-10">
          <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-emerald-400">Wonderlands Live</div>
          <h1 className="mt-2 text-2xl font-semibold text-white">{title}</h1>
          <p className="mt-2 text-sm leading-relaxed text-zinc-400">
            Joining takes seconds — no account needed. Shared designs and products load
            right here on your device, at full speed.
          </p>
          <label className="mt-6 block font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-400">Your name</label>
          <input
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && doJoin(params.get("host") === "1")}
            placeholder="e.g. Alex Rivera"
            className="mt-2 w-full rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:border-white/30 focus:outline-none"
          />
          {eligible ? (
            <div className="mt-5 space-y-2">
              <button onClick={() => doJoin(true)} className="w-full rounded-full bg-white py-2.5 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-200">
                Join as host
              </button>
              <button onClick={() => doJoin(false)} className="w-full rounded-full border border-white/15 py-2.5 text-sm text-white transition hover:bg-white/10">
                Join as guest
              </button>
              <p className="text-center text-[11px] text-zinc-500">You can host this meeting.</p>
            </div>
          ) : (
            <button onClick={() => doJoin(false)} className="mt-5 w-full rounded-full bg-white py-2.5 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-200">
              Join the meeting
            </button>
          )}
          {room.mediaError && <p className="mt-3 text-xs text-amber-300">{room.mediaError}</p>}
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

  // Whoever is shown big (stage hero or spotlight) is NOT repeated in the
  // tile strip — that was the duplicated-camera bug.
  const tileList = (excludeId: string | null) => {
    const list: Array<{ id: string; node: React.ReactNode }> = [];
    if (excludeId !== room.clientId) {
      list.push({
        id: room.clientId,
        node: (
          <VideoTile stream={room.screenStream ?? room.localStream} name={room.name} isLocal micOff={!room.micOn} hand={room.hand} isHost={room.isHost} small />
        ),
      });
    }
    for (const p of room.participants) {
      if (p.clientId === room.clientId || p.clientId === excludeId) continue;
      list.push({
        id: p.clientId,
        node: <VideoTile stream={room.remoteStreams[p.clientId] ?? null} name={p.name} micOff={!p.mic} hand={p.hand} isHost={p.role === "host"} small />,
      });
    }
    return list;
  };
  const wrapTiles = (excludeId: string | null, wrapClass: string, dblClickId: (id: string) => void) =>
    tileList(excludeId).map((t) => (
      <div key={t.id} className={wrapClass} onDoubleClick={() => dblClickId(t.id)}>
        {t.node}
      </div>
    ));
  const toggleSpot = (id: string) => room.setMySpotlight(room.spotlight === id ? null : id);

  const heroMode = stageActive || !!spotlightId;
  const heroNode = stageActive ? (
    <LiveStage stage={room.stage} interactive={room.canInteract()} onProductSelect={room.updateProduct} />
  ) : spotlightId ? (
    <VideoTile stream={spotlightStream} name={spotlightName} isLocal={spotlightId === room.clientId} />
  ) : null;

  /* SFH icon-bar button: round, white when active, zinc-800 idle, red when a
     mic/cam danger toggle is off. */
  const barBtn = (label: string, on: boolean, onClick: () => void, icon: React.ReactNode, danger = false) => (
    <button
      key={label}
      aria-label={label}
      title={label}
      onClick={onClick}
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition ${
        danger
          ? on
            ? "bg-zinc-800 text-white hover:bg-zinc-700"
            : "bg-red-500 text-white hover:bg-red-400"
          : on
            ? "bg-white text-zinc-900"
            : "bg-zinc-800 text-white hover:bg-zinc-700"
      }`}
    >
      {icon}
    </button>
  );
  const togglePanel = (p: Panel) => setPanel(panel === p ? null : p);

  return (
    <div className="flex h-dvh flex-col bg-zinc-100 sm:p-3">
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-white sm:rounded-2xl sm:border sm:border-zinc-200">
        {/* header — light chrome, SFH format */}
        <header className="flex items-center gap-2.5 border-b border-zinc-100 px-3 py-2.5 sm:px-4">
          <div className="min-w-0 truncate text-sm font-medium text-zinc-900">{title}</div>
          <span className="hidden h-4 w-px bg-zinc-200 sm:block" />
          <span className="hidden items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 font-mono text-[11px] text-zinc-600 sm:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            {room.participants.length} in the room
          </span>
          {room.isHost && (
            <span className="shrink-0 rounded-full bg-zinc-900 px-2 py-1 font-mono text-[10px] text-white">HOST</span>
          )}
          <div className="ml-auto shrink-0">
            <button onClick={copyLink} className="flex items-center gap-1.5 rounded-full border border-zinc-200 px-3.5 py-1.5 text-sm text-zinc-800 transition hover:bg-zinc-50">
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied" : (<><span className="hidden sm:inline">Copy invite link</span><span className="sm:hidden">Copy link</span></>)}
            </button>
          </div>
        </header>

        {room.mediaError && (
          <div className="bg-amber-50 px-4 py-1.5 text-center text-xs text-amber-800">{room.mediaError}</div>
        )}

        {/* body: viewport column + side panel */}
        <div className="relative flex min-h-0 flex-1">
          <div className="flex min-w-0 flex-1 flex-col">
            {/* the viewport — dark stage inset, SFH format */}
            <main className="flex min-h-0 flex-1 flex-col bg-zinc-950 p-1.5 sm:m-3 sm:mb-0 sm:rounded-2xl sm:p-3">
              {heroMode ? (
                <div className="flex h-full flex-col gap-1.5 sm:flex-row sm:gap-3">
                  <div className="relative min-h-0 min-w-0 flex-1 overflow-hidden rounded-2xl bg-zinc-900">
                    {heroNode}
                    {stageActive && room.isHost && (
                      <button
                        aria-label="Stop presenting"
                        title="Stop presenting"
                        onClick={room.clearStage}
                        className="absolute right-3 top-3 z-30 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-black/80"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  {room.participants.length > 1 && (
                    <div className="flex h-24 shrink-0 flex-row gap-1.5 overflow-x-auto sm:h-auto sm:w-56 sm:flex-col sm:gap-2 sm:overflow-x-visible sm:overflow-y-auto sm:pr-1">
                      {wrapTiles(stageActive ? null : spotlightId, "aspect-video h-full shrink-0 sm:h-auto sm:w-full", toggleSpot)}
                    </div>
                  )}
                </div>
              ) : (
                <div
                  className="grid min-h-0 flex-1 gap-1.5 sm:gap-3"
                  style={{
                    gridTemplateColumns: `repeat(${colsFor(room.participants.length)}, minmax(0, 1fr))`,
                    gridTemplateRows: `repeat(${Math.ceil(Math.max(1, room.participants.length) / colsFor(room.participants.length))}, minmax(0, 1fr))`,
                  }}
                >
                  {wrapTiles(null, "relative min-h-0 min-w-0", toggleSpot)}
                </div>
              )}
            </main>

            {/* icon bar — SFH floating dark pill */}
            <div className="relative flex shrink-0 justify-center px-2 py-2.5">
              <div className="flex max-w-full items-center gap-1.5 overflow-x-auto rounded-full border border-white/10 bg-zinc-900 px-2 py-1.5">
                {barBtn("Microphone", room.micOn, room.toggleMic, room.micOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />, true)}
                {barBtn("Camera", room.camOn, room.toggleCam, room.camOn ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />, true)}
                {barBtn("Share screen", room.sharingScreen, () => void room.toggleScreen(), <MonitorUp className="h-4 w-4" />)}
                {barBtn("Products", panel === "products", () => togglePanel("products"), <Package className="h-4 w-4" />)}
                {barBtn("Widgets", panel === "widgets", () => togglePanel("widgets"), <LayoutGrid className="h-4 w-4" />)}
                {barBtn("Raise hand", room.hand, room.toggleHand, <Hand className="h-4 w-4" />)}
                {barBtn("Chat", panel === "chat", () => togglePanel("chat"), <MessageSquare className="h-4 w-4" />)}
                {barBtn("People", panel === "people", () => togglePanel("people"), <Users className="h-4 w-4" />)}
                <button
                  aria-label="Leave"
                  onClick={() => { room.leave(); window.location.href = "/live"; }}
                  className="ml-1 flex h-10 shrink-0 items-center justify-center gap-2 rounded-full bg-red-500 px-3 text-sm font-medium text-white transition hover:bg-red-400 sm:px-5"
                >
                  <PhoneOff className="h-4 w-4" />
                  <span className="hidden sm:inline">Leave</span>
                </button>
              </div>
            </div>
          </div>

          {/* side panel — light, SFH pill tabs */}
          {panel && (
            <aside className="absolute inset-y-0 right-0 z-40 flex w-[320px] max-w-[88vw] flex-col bg-white shadow-2xl lg:static lg:z-auto lg:w-[340px] lg:border-l lg:border-zinc-200 lg:shadow-none">
              <div className="flex items-center gap-1 border-b border-zinc-100 p-2">
                {(["chat", "products", "widgets", "people"] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPanel(p)}
                    className={`rounded-full px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider transition ${
                      panel === p ? "bg-zinc-900 text-white" : "text-zinc-500 hover:bg-zinc-100"
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button aria-label="Close panel" onClick={() => setPanel(null)} className="ml-auto flex h-7 w-7 items-center justify-center rounded-full text-zinc-500 transition hover:bg-zinc-100">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="min-h-0 flex-1">
                {panel === "chat" && <ChatPanel room={room} />}
                {panel === "products" && <ProductsPanel room={room} onPresented={() => setPanel(null)} />}
                {panel === "widgets" && <WidgetsPanel room={room} onPresented={() => setPanel(null)} />}
                {panel === "people" && <PeoplePanel room={room} />}
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
