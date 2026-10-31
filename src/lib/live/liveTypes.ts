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

export interface LiveAttachment {
  name: string;
  url: string;
  kind: "image" | "video" | "audio" | "pdf" | "file";
}

export interface LiveChatMessage {
  id: string;
  fromId: string;
  fromName: string;
  role: LiveRole;
  text: string;
  ts: number;
  attachment?: LiveAttachment | null;
}

/** A file presented on the shared stage (any type — image, video, PDF, doc). */
export interface LiveSharedFile extends LiveAttachment {
  presentedBy: string;
}

/** One transcribed line, broadcast by the speaker's own device. */
export interface LiveTxLine {
  id: string;
  fromId: string;
  speaker: string;
  text: string;
  ts: number;
}

/** How a dropped product is presented on the stage. */
export type LiveProductView = "showcase" | "flip" | "studio" | "configure";

/** What is on the shared stage. `null` = no widget, the stage shows video. */
export interface LiveStageState {
  widgetId: string | null;
  /** Route widgets: the path each client loads locally. */
  route?: string | null;
  /** Product showcase state (shared, last-write-wins among unlocked users). */
  productKey?: string | null;
  variantIdx?: number;
  /** Which product interface is on stage (big showcase, FLIP book, Studio, configurator). */
  productView?: LiveProductView;
  /** Selected priced add-on option ids for the showcased product (synced). */
  optionIds?: string[];
  /** A file presented on the stage by any participant (SFH-style file share). */
  file?: LiveSharedFile | null;
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
  productView: "showcase",
  optionIds: [],
  file: null,
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
  fileSet: "file:set",
  tx: "tx",
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

/** The app mount path ("/" on Wonderlands, "/app/" on Foss Theory). */
export const APP_BASE = (import.meta.env.BASE_URL || "/").replace(/\/?$/, "/");

/** Absolute in-app path for a router route, e.g. appPath("/design-studio"). */
export const appPath = (route: string) => `${APP_BASE}${route.replace(/^\//, "")}`;

export const liveLink = (slug: string) =>
  `${typeof window !== "undefined" ? window.location.origin : "https://www.wonderlandsworld.com"}${appPath(`/live/${slug}`)}`;

const SLUG_ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789";

/** Cryptographically random suffix — every session gets its own private ID. */
function randomSuffix(len: number): string {
  const bytes = new Uint8Array(len);
  try {
    crypto.getRandomValues(bytes);
  } catch {
    for (let i = 0; i < len; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  return Array.from(bytes, (b) => SLUG_ALPHABET[b % SLUG_ALPHABET.length]).join("");
}

/** Readable prefix + a long random ID, e.g. "instant-meeting-k7x9…". Every
 *  meeting is a separate private session: the random part is 10 chars from a
 *  31-symbol alphabet (~8×10^14 combinations), so links never repeat and
 *  cannot be guessed from another meeting's link. */
export function newRoomSlug(seed?: string): string {
  const words = ["pool", "patio", "lagoon", "azure", "coral", "pearl", "oasis", "sunset", "harbor", "breeze", "palm", "reef", "sierra", "marina", "terra", "solstice"];
  const clean = (seed ?? "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 24);
  const base = clean || `${words[Math.floor(Math.random() * words.length)]}-${words[Math.floor(Math.random() * words.length)]}`;
  return `${base}-${randomSuffix(10)}`;
}
