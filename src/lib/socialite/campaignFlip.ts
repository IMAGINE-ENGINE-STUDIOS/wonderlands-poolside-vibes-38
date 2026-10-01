/**
 * Campaign <-> FLIP V2 bridge for the SOCIALITE Campaign Console.
 *  - CAMPAIGN_TEMPLATES: the built-in editorial emails (defaults + subject).
 *  - configToDoc(): turns a template config (or a saved rotation row) into a
 *    FLIP V2 book so it can be fully edited in FlipBuilderV2.
 *  - docToEmailHtml(): renders the edited book back into an email-safe,
 *    table-based editorial HTML (images + text in reading order).
 * Widgets/videos have no email equivalent and are skipped in the email.
 */
import { starterDocV2, type BuilderDocV2 } from "@/components/flip/flipBuilderV2Types";
import { uid, type Block, type BuilderPage } from "@/components/flip/flipBuilderTypes";
import { KITCHEN_CAMPAIGN_DEFAULTS, buildKitchenCampaignSubject } from "@/lib/email/kitchenCampaignTemplate";
import { SOLAR_CAMPAIGN_DEFAULTS, buildSolarCampaignSubject } from "@/lib/email/solarCampaignTemplate";
import { PATIO_ARRIVALS_DEFAULTS, buildPatioArrivalsSubject } from "@/lib/email/patioArrivalsTemplate";
import { MILAN_DEFAULTS, buildMilanOfferSubject } from "@/lib/email/milanOfferTemplate";

export type CampaignTemplate = { key: string; title: string; subject: string; config: Record<string, any> };
export const CAMPAIGN_TEMPLATES: CampaignTemplate[] = [
  { key: "kitchen", title: "Outdoor Kitchens", subject: buildKitchenCampaignSubject(KITCHEN_CAMPAIGN_DEFAULTS), config: KITCHEN_CAMPAIGN_DEFAULTS },
  { key: "solar", title: "Solar", subject: buildSolarCampaignSubject(SOLAR_CAMPAIGN_DEFAULTS), config: SOLAR_CAMPAIGN_DEFAULTS },
  { key: "patio", title: "New Arrivals", subject: buildPatioArrivalsSubject(PATIO_ARRIVALS_DEFAULTS), config: PATIO_ARRIVALS_DEFAULTS },
  { key: "milan", title: "Milan Offer", subject: buildMilanOfferSubject(MILAN_DEFAULTS as any), config: MILAN_DEFAULTS as any },
];

const t = (text: string, style: Block["style"], y: number, h: number, tone: "dark" | "light" = "dark", align: Block["align"] = "left"): Block =>
  ({ id: uid(), kind: "text", text, style, x: 8, y, w: 84, h, align, tone, animation: "fade" });
const img = (src: string, y = 0, h = 100): Block => ({ id: uid(), kind: "image", src, x: 0, y, w: 100, h, animation: "ken" });
const page = (name: string, blocks: Block[], tone: "paper" | "cover" = "paper"): BuilderPage => ({ id: uid(), name, tone, transition: "flip", blocks });

/** Builds an editable book from any campaign config by field naming convention. */
export function configToDoc(title: string, cfg: Record<string, any>, fallbackHtml?: string): BuilderDocV2 {
  const base = starterDocV2();
  const s = (k: string) => (typeof cfg[k] === "string" ? cfg[k] : "");
  const images = Object.keys(cfg).filter((k) => /image$/i.test(k) && /^https?:|^\//.test(s(k))).map(s);
  const pages: BuilderPage[] = [];
  const hero = images.shift();
  pages.push(page("Cover", [...(hero ? [img(hero)] : []), t(title, "eyebrow", 8, 6, hero ? "light" : "dark"), t(s("headline") || title, "title", 58, 18, hero ? "light" : "dark"), t(s("subheadline"), "body", 78, 12, hero ? "light" : "dark")], "cover"));
  if (s("intro")) pages.push(page("Introduction", [t("The edition", "eyebrow", 10, 6), t(s("intro"), "subtitle", 20, 50), ...(s("quote") ? [t(`“${s("quote")}”`, "body", 75, 15)] : [])]));
  const titles = Object.keys(cfg).filter((k) => /Title$/.test(k) && k !== "title");
  for (const k of titles) {
    const copy = s(k.replace(/Title$/, "Copy"));
    const pic = images.shift();
    pages.push(page(s(k), [...(pic ? [img(pic, 0, 55)] : []), t(s(k), "subtitle", pic ? 60 : 15, 12), t(copy, "body", pic ? 74 : 30, 22)]));
  }
  for (const pic of images) pages.push(page("Gallery", [img(pic)]));
  if (!pages.length || (fallbackHtml && titles.length === 0 && !s("intro"))) {
    const plain = (fallbackHtml ?? "").replace(/<style[\s\S]*?<\/style>/gi, "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 900);
    const pics = Array.from((fallbackHtml ?? "").matchAll(/<img[^>]+src="([^"]+)"/gi)).map((m) => m[1]).slice(0, 4);
    if (plain) pages.push(page("Message", [t(plain, "body", 10, 80)]));
    for (const p of pics) pages.push(page("Picture", [img(p)]));
  }
  pages.push(page("Book a visit", [t("Your consultation", "eyebrow", 20, 6, "dark", "center"), t("Let's design it together", "title", 32, 20, "dark", "center"), t("Ricardo · +1 (239) 257-0637 · wonderlandsworlds@gmail.com", "body", 60, 10, "dark", "center")]));
  return { ...base, title, pages, publish: { ...base.publish, slug: title.toLowerCase().replace(/[^a-z0-9]+/g, "-") } };
}

const esc = (s = "") => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>");
const STY: Record<string, string> = {
  eyebrow: "font:600 11px Arial,sans-serif;letter-spacing:4px;text-transform:uppercase;color:#9a7b4f;margin:0 0 10px",
  title: "font:300 34px/1.1 Georgia,serif;color:#1c1917;margin:0 0 14px",
  subtitle: "font:300 22px/1.35 Georgia,serif;color:#1c1917;margin:0 0 12px",
  body: "font:15px/1.7 Georgia,serif;color:#44403c;margin:0 0 14px",
  stat: "font:300 44px Georgia,serif;color:#1c1917;margin:0 0 8px",
  caption: "font:11px Arial,sans-serif;letter-spacing:3px;text-transform:uppercase;color:#78716c;margin:0 0 10px",
};

/** Editorial email from the book: ivory paper, Georgia serif, gold rules. */
export function docToEmailHtml(doc: BuilderDocV2, cta = "https://calendly.com/wonderlandsworlds/30min") {
  const rows = doc.pages.map((p, i) => {
    const blocks = [...p.blocks].sort((a, b) => a.y - b.y || a.x - b.x);
    const inner = blocks.map((b) => {
      if (b.kind === "image" && b.src && /^https?:/.test(b.src)) return `<img src="${b.src}" alt="" width="600" style="display:block;width:100%;height:auto;border:0;margin:0 0 18px">`;
      if (b.kind === "text" && b.text?.trim()) return `<p style="${STY[b.style ?? "body"]};text-align:${b.align ?? "left"}">${esc(b.text)}</p>`;
      if (b.kind === "rule") return `<hr style="border:0;border-top:1px solid #c9a96e;margin:18px 0">`;
      return "";
    }).join("");
    return inner ? `<tr><td style="padding:${i === 0 ? "0 0 24px" : "28px 40px"}">${inner}</td></tr>${i < doc.pages.length - 1 ? `<tr><td style="padding:0 40px"><hr style="border:0;border-top:1px solid #c9a96e;margin:0"></td></tr>` : ""}` : "";
  }).join("");
  return `<!doctype html><html><body style="margin:0;background:#f5f1ea"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f1ea"><tr><td align="center" style="padding:24px 12px"><table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fbf8f3">
<tr><td style="background:#1c1917;padding:18px 40px;font:600 12px Arial,sans-serif;letter-spacing:5px;color:#e7d3a8;text-transform:uppercase">${esc(doc.title)}</td></tr>
<tr><td style="padding:24px 40px 0;font:15px Georgia,serif;color:#44403c">Hi {{first_name}},</td></tr>
${rows}
<tr><td align="center" style="padding:10px 40px 34px"><a href="${cta}" style="display:inline-block;background:#1c1917;color:#e7d3a8;font:600 12px Arial,sans-serif;letter-spacing:3px;text-transform:uppercase;padding:14px 28px;text-decoration:none">Book your consultation</a></td></tr>
<tr><td style="padding:18px 40px 30px;font:13px Georgia,serif;color:#78716c;border-top:1px solid #e7e0d4">Ricardo · <a href="tel:+12392570637" style="color:#78716c">+1 (239) 257-0637</a> · <a href="mailto:wonderlandsworlds@gmail.com" style="color:#78716c">wonderlandsworlds@gmail.com</a></td></tr>
</table></td></tr></table></body></html>`;
}
