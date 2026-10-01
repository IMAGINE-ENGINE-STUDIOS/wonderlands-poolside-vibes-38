/**
 * SOCIALITE SDK v1 — zero-dependency client for the SOCIALITE REST API.
 * Works in Node 18+, Deno, Bun and server runtimes (uses global fetch).
 * NEVER use your secret key in a browser page — keep it on your server.
 *
 *   import { Socialite } from "./socialite.js";
 *   const s = new Socialite(process.env.SOCIALITE_API_KEY);
 *   await s.posts.create({ text: "Hello", platforms: ["facebook"] });
 */
const BASE = "https://bwngxlbnavnhbtahyzbf.supabase.co/functions/v1/socialite-api/v1";

export class SocialiteError extends Error {
  constructor(status, message, retryAfter) { super(message); this.status = status; this.retryAfter = retryAfter; }
}

export class Socialite {
  /** @param {string} apiKey sk_live_... @param {{baseUrl?:string, maxRetries?:number}} [opts] */
  constructor(apiKey, opts = {}) {
    if (!/^sk_live_[A-Za-z0-9]{40}$/.test(apiKey || "")) throw new Error("Invalid SOCIALITE API key");
    this.key = apiKey; this.base = opts.baseUrl || BASE; this.maxRetries = opts.maxRetries ?? 2;
    const r = (m, p, b) => this.request(m, p, b);
    this.me = () => r("GET", "/me");
    this.usage = () => r("GET", "/usage");
    this.contacts = {
      list: ({ limit = 50, offset = 0 } = {}) => r("GET", `/contacts?limit=${limit}&offset=${offset}`),
      create: (contacts) => r("POST", "/contacts", { contacts: Array.isArray(contacts) ? contacts : [contacts] }),
      delete: (id) => r("DELETE", `/contacts/${encodeURIComponent(id)}`),
    };
    // Shield: your status + recent warnings/blocks. Posts/messages that break
    // platform rules return 422 { error: '{"shield":[...]}' }; suspended → 403.
    this.shield = () => r("GET", "/shield");
    this.knowledge = {
      list: () => r("GET", "/knowledge"),
      create: (item) => r("POST", "/knowledge", item), // { kind, title, content?, active? }
      update: (id, patch) => r("PATCH", `/knowledge/${encodeURIComponent(id)}`, patch),
      delete: (id) => r("DELETE", `/knowledge/${encodeURIComponent(id)}`),
    };
    this.posts = { create: (post) => r("POST", "/posts", post) };
    this.messages = { send: (msg) => r("POST", "/messages", msg) };
    this.scheduled = {
      list: () => r("GET", "/scheduled"),
      cancel: (id) => r("DELETE", `/scheduled/${encodeURIComponent(id)}`),
    };
  }

  async request(method, path, body, attempt = 0) {
    const res = await fetch(this.base + path, {
      method,
      headers: { Authorization: `Bearer ${this.key}`, "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) return data;
    const retryAfter = Number(res.headers.get("Retry-After") || 0);
    if ((res.status === 429 || res.status >= 500) && attempt < this.maxRetries) {
      await new Promise((ok) => setTimeout(ok, (retryAfter || 2 ** attempt) * 1000));
      return this.request(method, path, body, attempt + 1);
    }
    throw new SocialiteError(res.status, data.error || res.statusText, retryAfter);
  }
}
export default Socialite;
