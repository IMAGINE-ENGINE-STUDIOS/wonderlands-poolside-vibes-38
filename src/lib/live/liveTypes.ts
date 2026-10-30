/**
 * Wonderlands Live — in-house video meetings for the Wonderlands platform.
 *
 * Rooms are link-based: anyone with the link joins as a guest with just a
 * name (no account). Host powers (stage control, interaction locks, eject)
 * require a signed-in Wonderlands team account.
 *
 * Transport: Supabase Realtime carries presence, chat, stage/widget sync and
 * WebRTC signalling; media flows peer-to-peer (mesh), so a session runs at
 * full native speed on every participant's own machine — most importantly
 * the shared WIDGETS, which are loaded locally by each client instead of
 * being screen-shared.
 * Credits: Imagine Engine Studios Corp.
 */

export type LiveRole = "host" | "guest";

export interface LiveParticipant {
  clientId: string;
  name: string;
  role: LiveRole;
  hand: boolean;
  mic: boolean;
  cam: boolean;
  joinedAt: number;
}

export interface LiveChatMessage {
  id: string;
  fromId: string;
  fromName: string;
  role: LiveRole;
  text: string;
  ts: number;
}

/** What is on the shared stage. `null` = no widget, the stage shows video. */
export interface LiveStageState {
  widgetId: string | null;
  /** Route widgets: the path each client loads locally. */
  route?: string | null;
  /** Product showcase state (shared, last-write-wins among unlocked users). */
  productKey?: string | null;
  variantIdx?: number;
  /** Interaction master switch + per-guest overrides (host controlled). */
  lockAll: boolean;
  locks: Record<string, boolean>;
  updatedBy: string;
  ts: number;
}

export const EMPTY_STAGE: LiveStageState = {
  widgetId: null,
  route: null,
  productKey: null,
  variantIdx: 0,
  lockAll: true,
  locks: {},
  updatedBy: "",
  ts: 0,
};

/** Broadcast event names on the room channel. */
export const LIVE_EVENTS = {
  chat: "chat",
  signal: "sig",
  stageSet: "stage:set",
  stageGet: "stage:get",
  stageState: "stage:state",
  stageLock: "stage:lock",
  control: "ctl",
} as const;

export type LiveControl =
  | { type: "eject"; targetId: string }
  | { type: "mute"; targetId: string }
  | { type: "spotlight"; targetId: string | null };

export interface LiveMeeting {
  slug: string;
  title: string;
  guestName?: string;
  guestEmail?: string;
  startsAt?: string | null;
  createdAt: number;
}

export const liveLink = (slug: string) =>
  `${typeof window !== "undefined" ? window.location.origin : "https://www.wonderlandsworld.com"}/live/${slug}`;

/** Short, readable, hard-to-guess room slug, e.g. "pool-party-7f3k". */
export function newRoomSlug(seed?: string): string {
  const words = ["pool", "patio", "lagoon", "azure", "coral", "pearl", "oasis", "sunset", "harbor", "breeze", "palm", "reef", "sierra", "marina", "terra", "solstice"];
  const clean = (seed ?? "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 24);
  const rand = () => Math.random().toString(36).slice(2, 6);
  const base = clean || `${words[Math.floor(Math.random() * words.length)]}-${words[Math.floor(Math.random() * words.length)]}`;
  return `${base}-${rand()}`;
}
