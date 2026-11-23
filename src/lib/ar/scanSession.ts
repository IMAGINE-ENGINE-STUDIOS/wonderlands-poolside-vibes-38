/**
 * Scan session — the webapp side of OUR OWN App Clip capture
 * (App Clip plan W1, 2026-11-08; plan: ~/workspace/ar-feature/APP-CLIP-PLAN.md,
 * design: SCAN-DESIGN-SPEC.md §10.1).
 *
 * Founder law: Foss users never download a third-party app to use a
 * feature. LiDAR capture therefore happens in OUR App Clip, launched
 * from our own page. This module is the launch discipline:
 *
 *   - The webapp mints a ONE-TIME session token (same token discipline
 *     as the AR export hand-off in arHandoff.ts: 16 random bytes, hex).
 *     The token IS the session — the clip needs no login.
 *   - The launch surface opens the invocation URL on our own domain,
 *     /scan?t=<token>. When the clip exists, iOS runs it from that URL;
 *     until then (and whenever the clip cannot run) the same URL is the
 *     scan landing page, whose fallback is the in-page filmed
 *     walk-around video + upload — our own capture, already live.
 *   - Every capture for the session, from the clip or the video
 *     fallback, lands in the SAME storage intake: bucket `live-shares`,
 *     folder `ar-scans/<token>/` — one intake for W2's resumption and
 *     the §9 calibration gate to read from.
 *
 * There is no server-side token registry: the pending session record
 * lives in this device's localStorage, and the token folder in storage
 * is the shared record the return flow (W2) resumes from. Sessions
 * expire 24 hours after minting; an expired or unknown token resumes
 * nothing.
 *
 * Imagine Engine Studios Corp.
 */

/** Bucket every scan capture uploads to (the app's live-shares bucket). */
export const SCAN_BUCKET = "live-shares";
/** Storage prefix for all scan captures; the token is its subfolder. */
export const SCAN_STORAGE_PREFIX = "ar-scans";
/** A scan session stays resumable for 24 hours after it is minted. */
export const SCAN_SESSION_TTL_MS = 24 * 60 * 60 * 1000;

const TOKEN_RE = /^[0-9a-f]{32}$/;
const storageKey = (token: string) => `foss.scan.session.${token}`;
const LATEST_KEY = "foss.scan.session.latest";

/** One-time session token: 16 random bytes as 32 lowercase hex chars. */
export function mintScanToken(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function isScanToken(value: unknown): value is string {
  return typeof value === "string" && TOKEN_RE.test(value);
}

/** The storage folder every capture for this session uploads into. */
export function scanStorageFolder(token: string): string {
  return `${SCAN_STORAGE_PREFIX}/${token}`;
}

/**
 * The invocation URL on our own domain. iOS offers/runs our App Clip
 * from this URL once the clip ships; the /scan page (W3) is its landing
 * and fallback either way.
 */
export function scanLaunchUrl(token: string, origin: string): string {
  return `${origin}/scan?t=${encodeURIComponent(token)}`;
}

/** Read a valid scan token out of a URL query string ("?t=…"), else null. */
export function readScanToken(search: string): string | null {
  const params = new URLSearchParams(
    search.startsWith("?") ? search.slice(1) : search,
  );
  const t = params.get("t");
  return isScanToken(t) ? t : null;
}

export interface ScanSession {
  token: string;
  createdAt: number;
  expiresAt: number;
  projectId: string | null;
}

/** The slice of Web Storage this module needs (testable, SSR-safe). */
export interface ScanSessionStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

function defaultStore(): ScanSessionStore | null {
  try {
    return typeof localStorage !== "undefined" ? localStorage : null;
  } catch {
    return null; // storage blocked (privacy mode) — sessions just don't persist
  }
}

export interface CreateScanSessionOptions {
  projectId?: string | null;
  store?: ScanSessionStore | null;
  now?: number;
}

/**
 * Mint a session and remember it on this device so the return flow can
 * resume it. Returns the session even if storage is unavailable (the
 * launch still works; resumption then relies on the storage folder).
 */
export function createScanSession(opts: CreateScanSessionOptions = {}): ScanSession {
  const now = opts.now ?? Date.now();
  const session: ScanSession = {
    token: mintScanToken(),
    createdAt: now,
    expiresAt: now + SCAN_SESSION_TTL_MS,
    projectId: opts.projectId ?? null,
  };
  const store = opts.store === undefined ? defaultStore() : opts.store;
  if (store) {
    try {
      store.setItem(storageKey(session.token), JSON.stringify(session));
      store.setItem(LATEST_KEY, session.token);
    } catch {
      /* persistence is best-effort; the token itself is the session */
    }
  }
  return session;
}

/** The stored session for a token, or null if absent/corrupt/unknown. */
export function getScanSession(
  token: string,
  store: ScanSessionStore | null = defaultStore(),
): ScanSession | null {
  if (!isScanToken(token) || !store) return null;
  try {
    const raw = store.getItem(storageKey(token));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ScanSession>;
    if (
      parsed.token !== token ||
      typeof parsed.createdAt !== "number" ||
      typeof parsed.expiresAt !== "number"
    ) {
      return null;
    }
    return {
      token,
      createdAt: parsed.createdAt,
      expiresAt: parsed.expiresAt,
      projectId: typeof parsed.projectId === "string" ? parsed.projectId : null,
    };
  } catch {
    return null;
  }
}

export function isScanSessionLive(session: ScanSession, now = Date.now()): boolean {
  return now < session.expiresAt;
}

/** Stored AND unexpired — the only sessions W2 may resume. */
export function getLiveScanSession(
  token: string,
  store: ScanSessionStore | null = defaultStore(),
  now = Date.now(),
): ScanSession | null {
  const session = getScanSession(token, store);
  return session && isScanSessionLive(session, now) ? session : null;
}

/** The most recently minted session on this device, if still live. */
export function getLatestLiveScanSession(
  store: ScanSessionStore | null = defaultStore(),
  now = Date.now(),
): ScanSession | null {
  if (!store) return null;
  try {
    const token = store.getItem(LATEST_KEY);
    return token ? getLiveScanSession(token, store, now) : null;
  } catch {
    return null;
  }
}

export function clearScanSession(
  token: string,
  store: ScanSessionStore | null = defaultStore(),
): void {
  if (!store) return;
  try {
    store.removeItem(storageKey(token));
    if (store.getItem(LATEST_KEY) === token) store.removeItem(LATEST_KEY);
  } catch {
    /* nothing to clear reliably — expiry handles it */
  }
}
