// SOCIALITE Autopilot — evergreen auto-posting.
//
// Each active row in `socialite_autopilot` describes one owner's standing
// order: post to these platforms, at these local times, every day, drawing
// images at random (shuffle-bag: every image once before any repeats) from
// the public `socialite-autopost` bucket under <owner>/<Project>/<file>,
// with captions rotated through the owner's templates + hashtag sets.
//
// The scheduler calls topUpAutopilots() on every run (pg_cron, 5 min). It
// keeps the next ~36 hours of `socialite_scheduled` rows filled; sending,
// Shield checks, metering and history all happen on the normal send path,
// untouched. Nothing here posts directly.

const BUCKET = "socialite-autopost";
const PUBLIC_BASE = () => `${Deno.env.get("SUPABASE_URL")!}/storage/v1/object/public/${BUCKET}`;

const shuffle = <T>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

/** Offset (ms) of `tz` from UTC at instant `d` — same method as the client sendTime lib. */
function tzOffset(d: Date, tz: string) {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", { timeZone: tz, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" })
      .formatToParts(d).map((x) => [x.type, x.value]),
  );
  return Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second) - d.getTime();
}

/** The UTC instant of wall-clock `hh:mm` on the local date `addDays` from now, in `tz`. */
function slotInstant(hhmm: string, addDays: number, tz: string, now: Date): Date {
  const localNow = new Date(now.getTime() + tzOffset(now, tz));
  const y = localNow.getUTCFullYear(), mo = localNow.getUTCMonth(), d = localNow.getUTCDate() + addDays;
  const [h, mi] = hhmm.split(":").map((n) => parseInt(n, 10) || 0);
  const guess = Date.UTC(y, mo, d, h, mi);
  // Recompute the offset at the guessed instant (DST-safe), then correct once.
  const off = tzOffset(new Date(guess), tz);
  return new Date(guess - off);
}

/** Recursively list every object key under `prefix` in the autopost bucket. */
async function listMedia(db: any, prefix: string): Promise<string[]> {
  const keys: string[] = [];
  const walk = async (path: string) => {
    for (let offset = 0; ; offset += 1000) {
      const { data, error } = await db.storage.from(BUCKET).list(path, { limit: 1000, offset });
      if (error || !data?.length) break;
      for (const item of data) {
        const full = path ? `${path}/${item.name}` : item.name;
        if (item.id) keys.push(full);
        else await walk(full);
      }
      if (data.length < 1000) break;
    }
  };
  await walk(prefix);
  return keys.filter((k) => /\.(jpe?g|png|webp)$/i.test(k));
}

const projectOf = (key: string, owner: string) => {
  const parts = key.split("/");
  const rel = parts[0] === owner ? parts.slice(1) : parts;
  return rel.length > 1 ? rel[0].replace(/[-_]+/g, " ").trim() : "";
};

export async function topUpAutopilots(db: any) {
  const { data: configs } = await db.from("socialite_autopilot").select("*").eq("active", true);
  for (const cfg of configs ?? []) {
    try { await topUpOne(db, cfg); } catch { /* one owner's autopilot must never break the send loop */ }
  }
}

async function topUpOne(db: any, cfg: any) {
  const owner = String(cfg.owner_id);
  const platforms: string[] = cfg.platforms ?? [];
  const times: string[] = (cfg.times ?? []).filter((t: string) => /^\d{2}:\d{2}$/.test(t));
  const templates: string[] = (cfg.templates ?? []).filter((t: string) => t?.trim());
  const tagSets: string[] = (cfg.hashtag_sets ?? []).filter((t: string) => t?.trim());
  if (!platforms.length || !times.length || !templates.length) return;
  const tz = cfg.timezone || "America/New_York";
  const now = new Date();
  const horizon = new Date(now.getTime() + 36 * 3600_000);

  // Which slots in [now, horizon] already have a pending autopilot row?
  const { data: pending } = await db.from("socialite_scheduled")
    .select("send_at").eq("created_by", owner).eq("kind", "post").eq("status", "pending")
    .filter("payload->>autopilot", "eq", "true")
    .gte("send_at", now.toISOString()).lte("send_at", horizon.toISOString());
  const covered = (pending ?? []).map((r: any) => new Date(r.send_at).getTime());

  const slots: Date[] = [];
  for (const addDays of [0, 1]) {
    for (const t of times) {
      const at = slotInstant(t, addDays, tz, now);
      if (at > now && at <= horizon) slots.push(at);
    }
  }
  const missing = slots.filter((at) => !covered.some((c: number) => Math.abs(c - at.getTime()) < 4 * 60_000));
  if (!missing.length) return;

  // Media shuffle-bag, persisted on the config row so restarts keep the
  // rotation. The pool is re-listed every run: photos added later join the
  // current cycle, deleted photos drop out, and every photo posts once
  // before any photo repeats.
  const state: any = { ...(cfg.state ?? {}) };
  const pool: string[] = await listMedia(db, owner);
  if (!pool.length) return; // no media uploaded yet — nothing to post
  const inPool = new Set(pool);
  const used: string[] = (Array.isArray(state.used) ? state.used : []).filter((k: string) => inPool.has(k));
  let bag: string[] = (Array.isArray(state.bag) ? state.bag : []).filter((k: string) => inPool.has(k) && !used.includes(k));
  for (const k of pool) if (!used.includes(k) && !bag.includes(k)) bag.push(k); // new uploads join the cycle
  state.tidx = state.tidx ?? 0; state.hidx = state.hidx ?? 0;

  let changed = false;
  for (const at of missing.sort((a, b) => a.getTime() - b.getTime())) {
    if (!bag.length) { used.length = 0; bag = shuffle(pool); }
    const key = bag.pop();
    if (!key) break;
    used.push(key);
    const project = projectOf(key, owner);
    const tpl = templates[state.tidx % templates.length]; state.tidx++;
    const tags = tagSets.length ? tagSets[state.hidx % tagSets.length] : ""; state.hidx++;
    const text = `${tpl.replaceAll("{project}", project || "a Florida backyard")}${tags ? `\n\n${tags}` : ""}`;
    const media = [`${PUBLIC_BASE()}/${key.split("/").map(encodeURIComponent).join("/")}`];
    const { error } = await db.from("socialite_scheduled").insert({
      kind: "post", created_by: owner, send_at: at.toISOString(), timezone: tz,
      payload: { text, platforms, media, autopilot: true },
    });
    if (!error) changed = true;
  }
  state.used = used; state.bag = bag;
  await db.from("socialite_autopilot").update({ state, updated_at: new Date().toISOString() }).eq("id", cfg.id);
}
