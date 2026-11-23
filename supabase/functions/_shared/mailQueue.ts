// Mail queue — the Resend quota fallback (founder ruling 2026-11-22).
// Senders park fully rendered mail here when Resend refuses it (daily quota
// or rate limit) instead of losing it; the socialite-scheduler drains the
// queue on its normal rhythm once Resend accepts sends again.

export interface QueuedMail {
  source: string;
  from: string;
  to: string[];
  subject: string;
  html?: string;
  text?: string;
  replyTo?: string;
  headers?: Record<string, string>;
}

/** True when a Resend failure is the quota wall (daily limit / rate limit),
 *  as opposed to a bad address or a malformed mail, which must not queue. */
export function isQuotaFailure(status: number | undefined, message: string | undefined): boolean {
  if (status === 429) return true;
  const m = (message ?? "").toLowerCase();
  return m.includes("quota") || m.includes("rate limit") || m.includes("too many requests");
}

export async function enqueueMail(db: any, mail: QueuedMail): Promise<boolean> {
  const { error } = await db.from("mail_queue").insert({
    source: mail.source,
    from_addr: mail.from,
    to_addrs: mail.to,
    subject: mail.subject,
    html: mail.html ?? null,
    text_body: mail.text ?? null,
    reply_to: mail.replyTo ?? null,
    headers: mail.headers ?? null,
    status: "pending",
  });
  return !error;
}

/** Drain up to `maxBatch` pending mails through Resend. Stops the batch at
 *  the first quota refusal (the wall is still up) and leaves the rest queued.
 *  A mail that fails 5 times for non-quota reasons is parked as failed. */
export async function drainMailQueue(db: any, resendKey: string | undefined, maxBatch = 10): Promise<{ sent: number; stillQueued: number }> {
  if (!resendKey) return { sent: 0, stillQueued: 0 };
  const { data: rows } = await db.from("mail_queue").select("*").eq("status", "pending").order("created_at").limit(maxBatch);
  let sent = 0;
  for (const row of rows ?? []) {
    const { data: claimed } = await db.from("mail_queue").update({ status: "sending" }).eq("id", row.id).eq("status", "pending").select("id");
    if (!claimed?.length) continue;
    let quota = false;
    try {
      const r = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: row.from_addr,
          to: row.to_addrs,
          subject: row.subject,
          html: row.html ?? undefined,
          text: row.text_body ?? undefined,
          reply_to: row.reply_to ?? undefined,
          headers: row.headers ?? undefined,
        }),
      });
      if (r.ok) {
        const j = await r.json().catch(() => ({}));
        await db.from("mail_queue").update({ status: "sent", sent_at: new Date().toISOString(), provider_id: j?.id ?? null, last_error: null }).eq("id", row.id);
        sent++;
      } else {
        const body = await r.text();
        quota = isQuotaFailure(r.status, body);
        throw new Error(body.slice(0, 300));
      }
    } catch (e) {
      const attempts = (row.attempts ?? 0) + 1;
      const giveUp = !quota && attempts >= 5;
      await db.from("mail_queue").update({
        status: giveUp ? "failed" : "pending",
        attempts,
        last_error: String((e as Error)?.message ?? e).slice(0, 300),
      }).eq("id", row.id);
      if (quota) break;
    }
  }
  const { count } = await db.from("mail_queue").select("id", { count: "exact", head: true }).eq("status", "pending");
  return { sent, stillQueued: count ?? 0 };
}
