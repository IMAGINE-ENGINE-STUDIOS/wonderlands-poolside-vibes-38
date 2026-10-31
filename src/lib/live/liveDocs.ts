/**
 * Finished documents in a live room — when the host finishes a quote or an
 * invoice inside a staged widget, the document is sent into the room's chat
 * for everyone, and guests are asked if they want to download it
 * (founder directive 2026-10-31).
 *
 * The widget iframe cannot speak on the room channel directly, so the file
 * is uploaded to the live-shares bucket here and the announcement is handed
 * to the stage bridge (liveBridge), which owns the `wlive:<slug>` channel.
 * Outside a live room this is a no-op.
 * Credits: Imagine Engine Studios Corp.
 */
import { uploadLiveFile } from "./liveFiles";
import type { LiveChatMessage } from "./liveTypes";

export type LiveDocKind = "quote" | "invoice";

export interface LiveDocAnnouncement {
  kind: LiveDocKind;
  title: string;
  total: number;
  ref: string | null;
  url: string;
  name: string;
  role: "host" | "guest";
}

export function liveRoomFromUrl(): { slug: string; role: "host" | "guest" } | null {
  try {
    const p = new URLSearchParams(window.location.search);
    const slug = p.get("liveRoom");
    if (!slug) return null;
    return { slug, role: p.get("liveRole") === "host" ? "host" : "guest" };
  } catch {
    return null;
  }
}

const money = (n: number) => `$${Math.round(n).toLocaleString()}`;
const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function buildDocHtml(doc: {
  kind: LiveDocKind;
  title: string;
  total: number;
  lines?: Array<{ label: string; amount?: string }>;
  ref?: string;
}): string {
  const label = doc.kind === "quote" ? "Quote" : "Invoice";
  const rows = (doc.lines ?? [])
    .map(
      (l) =>
        `<tr><td style="padding:8px 10px;border-bottom:1px solid #e7e5e4">${esc(l.label)}</td>` +
        `<td style="padding:8px 10px;border-bottom:1px solid #e7e5e4;text-align:right;white-space:nowrap">${esc(l.amount ?? "")}</td></tr>`,
    )
    .join("");
  return `<!doctype html>
<html><head><meta charset="utf-8"><title>${label} — ${esc(doc.title)}</title></head>
<body style="font-family:Georgia,serif;color:#1c1917;max-width:680px;margin:40px auto;padding:0 20px">
  <p style="font-size:11px;letter-spacing:0.3em;text-transform:uppercase;color:#78716c">Wonderlands World · ${label}${doc.ref ? ` · ${esc(doc.ref)}` : ""}</p>
  <h1 style="font-weight:400;font-size:30px;margin:8px 0 4px">${esc(doc.title)}</h1>
  <p style="color:#78716c;font-size:13px;margin:0 0 24px">Prepared ${new Date().toLocaleDateString()} during a live session. Figures include delivery and installation as described.</p>
  ${rows ? `<table style="width:100%;border-collapse:collapse;font-size:14px">${rows}</table>` : ""}
  <p style="font-size:22px;margin-top:24px">Total&nbsp;&nbsp;${money(doc.total)}</p>
  <p style="color:#78716c;font-size:12px;margin-top:32px">Thank you for designing with us — one contract, our own crews.</p>
</body></html>`;
}

/**
 * Send a finished quote/invoice into the live room: uploads the document,
 * posts it to the chat and prompts the room's guests to download it.
 * Returns true when the announcement was handed to the room bridge.
 */
export async function announceLiveDoc(doc: {
  kind: LiveDocKind;
  title: string;
  total: number;
  lines?: Array<{ label: string; amount?: string }>;
  ref?: string;
}): Promise<boolean> {
  const room = liveRoomFromUrl();
  if (!room) return false;
  try {
    const html = buildDocHtml(doc);
    const fileName = `${doc.kind}-${(doc.ref ?? doc.title).replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "")}.html`;
    const file = new File([html], fileName, { type: "text/html" });
    const att = await uploadLiveFile(file, room.slug);
    const label = doc.kind === "quote" ? "Quote" : "Invoice";
    const chat: LiveChatMessage = {
      id: `doc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      fromId: "live-doc",
      fromName: "Host",
      role: room.role,
      text: `${label} ready — ${doc.title} · ${money(doc.total)}${doc.ref ? ` · ${doc.ref}` : ""}`,
      ts: Date.now(),
      attachment: att,
    };
    const announcement: LiveDocAnnouncement = {
      kind: doc.kind,
      title: doc.title,
      total: doc.total,
      ref: doc.ref ?? null,
      url: att.url,
      name: att.name,
      role: room.role,
    };
    const detail = { chat, doc: announcement, handled: false };
    window.dispatchEvent(new CustomEvent("wlive:doc-announce", { detail }));
    return detail.handled;
  } catch {
    return false;
  }
}
