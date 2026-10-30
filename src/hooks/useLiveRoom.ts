/**
 * useLiveRoom — the Wonderlands Live room engine.
 *
 * Supabase Realtime carries presence, chat, stage/widget sync and WebRTC
 * signalling; media flows peer-to-peer in a mesh (ideal for a host plus a
 * handful of guests — the standard consultation shape). Widgets are NOT
 * streamed: the stage state is broadcast and every client loads the widget
 * locally at full speed; the host controls locks per guest.
 * Credits: Imagine Engine Studios Corp.
 */
import * as React from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import {
  EMPTY_STAGE,
  LIVE_EVENTS,
  type LiveChatMessage,
  type LiveControl,
  type LiveParticipant,
  type LiveRole,
  type LiveStageState,
} from "@/lib/live/liveTypes";

const ICE_SERVERS: RTCIceServer[] = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
];

function myClientId(): string {
  try {
    let id = sessionStorage.getItem("wlive:cid");
    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem("wlive:cid", id);
    }
    return id;
  } catch {
    return crypto.randomUUID();
  }
}

interface Peer {
  pc: RTCPeerConnection;
  stream: MediaStream;
  makingOffer: boolean;
  pendingIce: RTCIceCandidateInit[];
}

export interface LiveRoom {
  clientId: string;
  joined: boolean;
  ejected: boolean;
  name: string;
  role: LiveRole;
  isHost: boolean;
  participants: LiveParticipant[];
  localStream: MediaStream | null;
  screenStream: MediaStream | null;
  remoteStreams: Record<string, MediaStream>;
  micOn: boolean;
  camOn: boolean;
  sharingScreen: boolean;
  hand: boolean;
  mediaError: string | null;
  chat: LiveChatMessage[];
  stage: LiveStageState;
  spotlight: string | null;
  join: (name: string, asHost: boolean) => Promise<void>;
  leave: () => void;
  toggleMic: () => void;
  toggleCam: () => void;
  toggleHand: () => void;
  toggleScreen: () => Promise<void>;
  sendChat: (text: string) => void;
  /* host stage controls */
  setStage: (partial: Partial<LiveStageState>) => void;
  clearStage: () => void;
  setLockAll: (locked: boolean) => void;
  setGuestLock: (guestId: string, locked: boolean) => void;
  updateProduct: (productKey: string, variantIdx: number) => void;
  /* host people controls */
  eject: (guestId: string) => void;
  muteGuest: (guestId: string) => void;
  spotlightAll: (peerId: string | null) => void;
  setMySpotlight: (peerId: string | null) => void;
  /** True when the given participant (default: me) may interact with the stage. */
  canInteract: (p?: LiveParticipant | string) => boolean;
}

export function useLiveRoom(slug: string): LiveRoom {
  const clientId = React.useMemo(myClientId, []);
  const [joined, setJoined] = React.useState(false);
  const [ejected, setEjected] = React.useState(false);
  const [name, setName] = React.useState("");
  const [role, setRole] = React.useState<LiveRole>("guest");
  const [participants, setParticipants] = React.useState<LiveParticipant[]>([]);
  const [localStream, setLocalStream] = React.useState<MediaStream | null>(null);
  const [screenStream, setScreenStream] = React.useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = React.useState<Record<string, MediaStream>>({});
  const [micOn, setMicOn] = React.useState(true);
  const [camOn, setCamOn] = React.useState(true);
  const [sharingScreen, setSharingScreen] = React.useState(false);
  const [hand, setHand] = React.useState(false);
  const [mediaError, setMediaError] = React.useState<string | null>(null);
  const [chat, setChat] = React.useState<LiveChatMessage[]>([]);
  const [stage, setStageState] = React.useState<LiveStageState>(EMPTY_STAGE);
  const [hostSpotlight, setHostSpotlight] = React.useState<string | null>(null);
  const [mySpotlight, setMySpotlight] = React.useState<string | null>(null);

  const channelRef = React.useRef<RealtimeChannel | null>(null);
  const peersRef = React.useRef(new Map<string, Peer>());
  const localStreamRef = React.useRef<MediaStream | null>(null);
  const screenTrackRef = React.useRef<MediaStreamTrack | null>(null);
  const camTrackRef = React.useRef<MediaStreamTrack | null>(null);
  const participantsRef = React.useRef<LiveParticipant[]>([]);
  const stageRef = React.useRef<LiveStageState>(EMPTY_STAGE);
  const meRef = React.useRef<{ name: string; role: LiveRole; hand: boolean; mic: boolean; cam: boolean; joinedAt: number }>({
    name: "", role: "guest", hand: false, mic: true, cam: true, joinedAt: Date.now(),
  });

  const isHost = role === "host";
  stageRef.current = stage;
  participantsRef.current = participants;

  const canInteract = React.useCallback(
    (p?: LiveParticipant | string) => {
      const id = typeof p === "string" ? p : p?.clientId ?? clientId;
      const r = typeof p === "object" && p ? p.role : id === clientId ? role : participantsRef.current.find((x) => x.clientId === id)?.role;
      if (r === "host") return true;
      const s = stageRef.current;
      return !(s.locks[id] ?? s.lockAll);
    },
    [clientId, role],
  );

  /* ------------------------------ presence ------------------------------ */
  const trackPresence = React.useCallback(() => {
    const ch = channelRef.current;
    if (!ch) return;
    const me = meRef.current;
    void ch.track({
      clientId,
      name: me.name,
      role: me.role,
      hand: me.hand,
      mic: me.mic,
      cam: me.cam,
      joinedAt: me.joinedAt,
    } satisfies LiveParticipant);
  }, [clientId]);

  /* ------------------------------ peer mesh ------------------------------ */
  const dropPeer = React.useCallback((peerId: string) => {
    const peer = peersRef.current.get(peerId);
    if (peer) {
      try { peer.pc.close(); } catch { /* already closed */ }
      peersRef.current.delete(peerId);
    }
    setRemoteStreams((prev) => {
      if (!(peerId in prev)) return prev;
      const next = { ...prev };
      delete next[peerId];
      return next;
    });
  }, []);

  const sendSignal = React.useCallback((to: string, kind: string, data: unknown) => {
    void channelRef.current?.send({
      type: "broadcast",
      event: LIVE_EVENTS.signal,
      payload: { to, from: clientId, kind, data },
    });
  }, [clientId]);

  const ensurePeer = React.useCallback(
    (peerId: string) => {
      if (peerId === clientId || peersRef.current.has(peerId)) return peersRef.current.get(peerId);
      const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
      const peer: Peer = { pc, stream: new MediaStream(), makingOffer: false, pendingIce: [] };
      peersRef.current.set(peerId, peer);

      const local = localStreamRef.current;
      if (local) for (const track of local.getTracks()) pc.addTrack(track, local);

      pc.ontrack = (ev) => {
        peer.stream.addTrack(ev.track);
        setRemoteStreams((prev) => ({ ...prev, [peerId]: peer.stream }));
      };
      pc.onicecandidate = (ev) => {
        if (ev.candidate) sendSignal(peerId, "ice", ev.candidate.toJSON());
      };
      pc.onnegotiationneeded = async () => {
        if (pc.signalingState !== "stable" || peer.makingOffer) return;
        try {
          peer.makingOffer = true;
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          sendSignal(peerId, "offer", pc.localDescription);
        } catch { /* negotiation retried on next change */ } finally {
          peer.makingOffer = false;
        }
      };
      pc.onconnectionstatechange = () => {
        if (pc.connectionState === "failed" || pc.connectionState === "closed") dropPeer(peerId);
      };
      return peer;
    },
    [clientId, dropPeer, sendSignal],
  );

  const handleSignal = React.useCallback(
    async (payload: { to: string; from: string; kind: string; data: RTCSessionDescriptionInit | RTCIceCandidateInit }) => {
      if (payload.to !== clientId) return;
      const peer = ensurePeer(payload.from);
      if (!peer) return;
      const { pc } = peer;
      try {
        if (payload.kind === "offer") {
          const desc = payload.data as RTCSessionDescriptionInit;
          const collision = peer.makingOffer || pc.signalingState !== "stable";
          const polite = clientId < payload.from;
          if (collision && !polite) return;
          if (collision) await pc.setLocalDescription({ type: "rollback" });
          await pc.setRemoteDescription(desc);
          for (const ice of peer.pendingIce.splice(0)) await pc.addIceCandidate(ice).catch(() => undefined);
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          sendSignal(payload.from, "answer", pc.localDescription);
        } else if (payload.kind === "answer") {
          if (pc.signalingState === "have-local-offer") {
            await pc.setRemoteDescription(payload.data as RTCSessionDescriptionInit);
            for (const ice of peer.pendingIce.splice(0)) await pc.addIceCandidate(ice).catch(() => undefined);
          }
        } else if (payload.kind === "ice") {
          const ice = payload.data as RTCIceCandidateInit;
          if (pc.remoteDescription) await pc.addIceCandidate(ice).catch(() => undefined);
          else peer.pendingIce.push(ice);
        }
      } catch { /* a later renegotiation usually heals this */ }
    },
    [clientId, ensurePeer, sendSignal],
  );

  /* ------------------------------ stage sync ------------------------------ */
  const broadcastStage = React.useCallback((next: LiveStageState) => {
    void channelRef.current?.send({ type: "broadcast", event: LIVE_EVENTS.stageSet, payload: next });
  }, []);

  const setStage = React.useCallback(
    (partial: Partial<LiveStageState>) => {
      if (meRef.current.role !== "host") return;
      const next = { ...stageRef.current, ...partial, updatedBy: clientId, ts: Date.now() };
      setStageState(next);
      broadcastStage(next);
    },
    [broadcastStage, clientId],
  );

  const clearStage = React.useCallback(() => setStage({ widgetId: null, route: null }), [setStage]);

  const setLockAll = React.useCallback((locked: boolean) => setStage({ lockAll: locked }), [setStage]);

  const setGuestLock = React.useCallback(
    (guestId: string, locked: boolean) =>
      setStage({ locks: { ...stageRef.current.locks, [guestId]: locked } }),
    [setStage],
  );

  const updateProduct = React.useCallback(
    (productKey: string, variantIdx: number) => {
      if (!canInteract()) return;
      setStageState((prev) => ({ ...prev, productKey, variantIdx }));
      void channelRef.current?.send({
        type: "broadcast",
        event: LIVE_EVENTS.stageState,
        payload: { productKey, variantIdx, from: clientId },
      });
    },
    [canInteract, clientId],
  );

  /* ------------------------------ host controls ------------------------------ */
  const sendControl = React.useCallback((ctl: LiveControl) => {
    void channelRef.current?.send({ type: "broadcast", event: LIVE_EVENTS.control, payload: ctl });
  }, []);

  const eject = React.useCallback(
    (guestId: string) => {
      if (meRef.current.role !== "host") return;
      sendControl({ type: "eject", targetId: guestId });
      dropPeer(guestId);
    },
    [dropPeer, sendControl],
  );

  const muteGuest = React.useCallback(
    (guestId: string) => {
      if (meRef.current.role !== "host") return;
      sendControl({ type: "mute", targetId: guestId });
    },
    [sendControl],
  );

  const spotlightAll = React.useCallback(
    (peerId: string | null) => {
      if (meRef.current.role !== "host") return;
      setHostSpotlight(peerId);
      sendControl({ type: "spotlight", targetId: peerId });
    },
    [sendControl],
  );

  /* ------------------------------ media controls ------------------------------ */
  const applyMic = React.useCallback((on: boolean) => {
    setMicOn(on);
    meRef.current.mic = on;
    localStreamRef.current?.getAudioTracks().forEach((t) => (t.enabled = on));
    trackPresence();
  }, [trackPresence]);

  const applyCam = React.useCallback((on: boolean) => {
    setCamOn(on);
    meRef.current.cam = on;
    // While screen sharing, the camera track is parked — toggling applies on restore.
    if (!screenTrackRef.current) localStreamRef.current?.getVideoTracks().forEach((t) => (t.enabled = on));
    trackPresence();
  }, [trackPresence]);

  const toggleScreen = React.useCallback(async () => {
    const videoSenderOf = (pc: RTCPeerConnection) => pc.getSenders().find((s) => s.track?.kind === "video");
    if (screenTrackRef.current) {
      const screen = screenTrackRef.current;
      screenTrackRef.current = null;
      setScreenStream(null);
      setSharingScreen(false);
      const cam = camTrackRef.current;
      for (const peer of peersRef.current.values()) {
        const sender = videoSenderOf(peer.pc);
        if (sender && cam) await sender.replaceTrack(cam).catch(() => undefined);
      }
      screen.stop();
      return;
    }
    try {
      const display = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const track = display.getVideoTracks()[0];
      if (!track) return;
      screenTrackRef.current = track;
      setScreenStream(display);
      setSharingScreen(true);
      for (const peer of peersRef.current.values()) {
        const sender = videoSenderOf(peer.pc);
        if (sender) await sender.replaceTrack(track).catch(() => undefined);
      }
      track.onended = () => { void toggleScreen(); };
    } catch { /* user cancelled the picker */ }
  }, []);

  /* ------------------------------ join / leave ------------------------------ */
  const leave = React.useCallback(() => {
    for (const id of [...peersRef.current.keys()]) dropPeer(id);
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    screenTrackRef.current?.stop();
    localStreamRef.current = null;
    screenTrackRef.current = null;
    camTrackRef.current = null;
    setLocalStream(null);
    setScreenStream(null);
    const ch = channelRef.current;
    channelRef.current = null;
    if (ch) void supabase.removeChannel(ch);
    setJoined(false);
    setParticipants([]);
    setChat([]);
  }, [dropPeer]);

  const join = React.useCallback(
    async (joinName: string, asHost: boolean) => {
      const cleanName = joinName.trim() || "Guest";
      meRef.current = {
        name: cleanName,
        role: asHost ? "host" : "guest",
        hand: false,
        mic: true,
        cam: true,
        joinedAt: Date.now(),
      };
      setName(cleanName);
      setRole(asHost ? "host" : "guest");

      // Local media — degrade gracefully: video+audio → audio-only → none.
      let stream: MediaStream | null = null;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: { echoCancellation: true, noiseSuppression: true },
        });
      } catch {
        try {
          stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          setMediaError("Camera unavailable — you joined with audio only.");
          meRef.current.cam = false;
          setCamOn(false);
        } catch {
          setMediaError("Microphone and camera unavailable — you can still watch, chat and use shared widgets.");
          meRef.current.mic = false;
          meRef.current.cam = false;
          setMicOn(false);
          setCamOn(false);
        }
      }
      localStreamRef.current = stream;
      setLocalStream(stream);
      camTrackRef.current = stream?.getVideoTracks()[0] ?? null;

      const channel = supabase.channel(`wlive:${slug}`, {
        config: { broadcast: { self: false }, presence: { key: clientId } },
      });
      channelRef.current = channel;

      channel.on("presence", { event: "sync" }, () => {
        const state = channel.presenceState<LiveParticipant>();
        const all = Object.values(state).flat().filter((p) => p && p.clientId);
        all.sort((a, b) => a.joinedAt - b.joinedAt);
        setParticipants(all);
        for (const p of all) if (p.clientId !== clientId) ensurePeer(p.clientId);
      });
      channel.on("presence", { event: "join" }, () => {
        if (meRef.current.role === "host" && stageRef.current.widgetId) broadcastStage(stageRef.current);
      });
      channel.on("presence", { event: "leave" }, ({ leftPresences }) => {
        for (const p of leftPresences as unknown as LiveParticipant[]) dropPeer(p.clientId);
      });
      channel.on("broadcast", { event: LIVE_EVENTS.signal }, ({ payload }) => {
        void handleSignal(payload as never);
      });
      channel.on("broadcast", { event: LIVE_EVENTS.chat }, ({ payload }) => {
        setChat((prev) => [...prev.slice(-199), payload as LiveChatMessage]);
      });
      channel.on("broadcast", { event: LIVE_EVENTS.stageSet }, ({ payload }) => {
        const next = payload as LiveStageState;
        const sender = participantsRef.current.find((p) => p.clientId === next.updatedBy);
        // Accept from the host, from myself, or when the sender is not in
        // presence yet (presence lags broadcasts — dropping here lost the
        // stage for guests) as long as the stage is newer than ours.
        if (sender?.role === "host" || next.updatedBy === clientId || (!sender && next.ts >= stageRef.current.ts)) setStageState(next);
      });
      channel.on("broadcast", { event: LIVE_EVENTS.stageGet }, () => {
        // A guest who joined after the stage was set asks for it — the host
        // answers with the current stage (broadcasts are not replayed).
        if (meRef.current.role === "host" && stageRef.current.widgetId) broadcastStage(stageRef.current);
      });
      channel.on("broadcast", { event: LIVE_EVENTS.stageState }, ({ payload }) => {
        const delta = payload as { productKey: string; variantIdx: number; from: string };
        // Apply selections from the host or from a guest the host unlocked.
        const sender = participantsRef.current.find((p) => p.clientId === delta.from);
        const senderLocked = sender ? !(sender.role === "host") && (stageRef.current.locks[sender.clientId] ?? stageRef.current.lockAll) : true;
        if (sender && !senderLocked) {
          setStageState((prev) => ({ ...prev, productKey: delta.productKey, variantIdx: delta.variantIdx }));
        }
      });
      channel.on("broadcast", { event: LIVE_EVENTS.control }, ({ payload }) => {
        const ctl = payload as LiveControl & { targetId: string };
        if (ctl.type === "spotlight") {
          setHostSpotlight(ctl.targetId || null);
          return;
        }
        if (ctl.targetId !== clientId) return;
        if (ctl.type === "mute") applyMic(false);
        if (ctl.type === "eject") {
          setEjected(true);
          leave();
        }
      });

      await channel.subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({
            clientId,
            name: meRef.current.name,
            role: meRef.current.role,
            hand: false,
            mic: meRef.current.mic,
            cam: meRef.current.cam,
            joinedAt: meRef.current.joinedAt,
          } satisfies LiveParticipant);
          setJoined(true);
          if (meRef.current.role !== "host") {
            void channel.send({ type: "broadcast", event: LIVE_EVENTS.stageGet, payload: { from: clientId } });
          }
        }
      });
    },
    [applyMic, clientId, dropPeer, ensurePeer, handleSignal, leave, slug],
  );

  React.useEffect(() => () => leave(), [leave]);

  const sendChat = React.useCallback(
    (text: string) => {
      const clean = text.trim().slice(0, 1000);
      if (!clean) return;
      const msg: LiveChatMessage = {
        id: `${clientId}-${Date.now()}`,
        fromId: clientId,
        fromName: meRef.current.name,
        role: meRef.current.role,
        text: clean,
        ts: Date.now(),
      };
      setChat((prev) => [...prev.slice(-199), msg]);
      void channelRef.current?.send({ type: "broadcast", event: LIVE_EVENTS.chat, payload: msg });
    },
    [clientId],
  );

  const toggleHand = React.useCallback(() => {
    const next = !meRef.current.hand;
    meRef.current.hand = next;
    setHand(next);
    trackPresence();
  }, [trackPresence]);

  return {
    clientId,
    joined,
    ejected,
    name,
    role,
    isHost,
    participants,
    localStream,
    screenStream,
    remoteStreams,
    micOn,
    camOn,
    sharingScreen,
    hand,
    mediaError,
    chat,
    stage,
    spotlight: hostSpotlight ?? mySpotlight,
    join,
    leave,
    toggleMic: () => applyMic(!micOn),
    toggleCam: () => applyCam(!camOn),
    toggleHand,
    toggleScreen,
    sendChat,
    setStage,
    clearStage,
    setLockAll,
    setGuestLock,
    updateProduct,
    eject,
    muteGuest,
    spotlightAll,
    setMySpotlight,
    canInteract,
  };
}
