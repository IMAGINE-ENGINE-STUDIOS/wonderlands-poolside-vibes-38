import kitchenAsset from '@/assets/campaigns/milan-outdoor-kitchen.jpg.asset.json';

/**
 * "New Arrivals — Add on to your patio experience" editorial email.
 *
 * Same magazine language as the Milan Collection email (Georgia serif,
 * ivory paper, teal/coral accents). Table-based + inline styles for Gmail,
 * Outlook and Apple Mail. Tokens ({{first_name}}, {{sales_rep_name}}, …) are
 * filled per recipient by the existing `send-bulk-email` edge function.
 *
 * Every image URL is absolute and publicly reachable (emails can't load
 * site-relative paths): the kitchen comes from our hosted campaign asset,
 * the saunas from Almost Heaven's official CDN (same images as the catalog).
 */

const SITE = 'https://wonderlandsworld.com';
const abs = (u: string) => (u.startsWith('http') ? u : SITE + u);

export interface PatioArrivalsConfig {
  headline: string;
  subheadline: string;
  intro: string;
  kitchenTitle: string;
  kitchenCopy: string;
  saunaTitle: string;
  saunaCopy: string;
  heroImage: string;
  kitchenImage: string;
  saunaImage: string;
  appointmentLink: string;
  whatsappLink: string;
  phone: string;
}

export const PATIO_ARRIVALS_DEFAULTS: PatioArrivalsConfig = {
  headline: 'Add on to your patio experience',
  subheadline: 'New arrivals — outdoor kitchens and outdoor saunas, designed and installed by our studio.',
  intro:
    'This season we are opening two new chapters of outdoor living. A kitchen made to cook under the open sky, and a cedar sauna a few steps from the pool. Both are drawn to your patio, priced turnkey and installed by our own crews.',
  kitchenTitle: 'The Outdoor Kitchen',
  kitchenCopy:
    'Marine-grade cabinetry, porcelain countertops, built-in grills and refrigeration — composed around the way you host, and built to live outside all year.',
  saunaTitle: 'The Outdoor Sauna',
  saunaCopy:
    'Barrel and cabin saunas by Almost Heaven in Canadian cedar, with electric or wood heaters. Delivered, set and wired on your patio — heat, then plunge.',
  heroImage: 'https://cdn.shopify.com/s/files/1/0555/6355/0889/files/Sunset_Salem_Sauna.jpg',
  kitchenImage: abs(kitchenAsset.url),
  saunaImage:
    'https://cdn.shopify.com/s/files/1/0555/6355/0889/files/Indoek-Harvia-AlmostHeaven-Matt-Titone-Ventura--276_-_Copy_1.jpg',
  appointmentLink: 'https://calendly.com/wonderlandsworlds/30min',
  whatsappLink: 'https://wa.me/12392570637',
  phone: '+1 (239) 257-0637',
};

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export const buildPatioArrivalsSubject = (cfg: PatioArrivalsConfig) =>
  `{{first_name}}, new arrivals: ${cfg.headline.toLowerCase()}`;

export function buildPatioArrivalsHtml(cfg: PatioArrivalsConfig): string {
  const wa = `${cfg.whatsappLink}?text=${encodeURIComponent(
    "Hi Wonderlands — I'd like details on the new outdoor kitchens and saunas.",
  )}`;
  const btn = (href: string, label: string, bg: string) =>
    `<a href="${href}" style="display:inline-block;background:${bg};color:#ffffff;text-decoration:none;padding:15px 30px;font:600 12px/1 Arial,Helvetica,sans-serif;letter-spacing:2px;text-transform:uppercase;border-radius:2px;">${label}</a>`;
  const eyebrow = (t: string, color = '#9a9790') =>
    `<div style="font:400 9px/1 Arial,Helvetica,sans-serif;letter-spacing:3px;text-transform:uppercase;color:${color};">${t}</div>`;
  const feature = (no: string, img: string, title: string, copy: string) => `
  <tr><td class="wl-pad" style="padding:34px 38px 0;">
    <img src="${img}" width="524" alt="${esc(title)}" style="display:block;width:100%;height:auto;border:0;"/>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;"><tr>
      <td width="56" valign="top" style="font:400 34px/1 Georgia,serif;color:#f97066;">${no}</td>
      <td valign="top">
        ${eyebrow('New arrival')}
        <h2 style="margin:8px 0 8px;font:400 26px/1.15 Georgia,'Times New Roman',serif;color:#0f172a;">${esc(title)}</h2>
        <p style="margin:0;font:400 15px/1.7 Georgia,serif;color:#4a4843;">${esc(copy)}</p>
      </td>
    </tr></table>
  </td></tr>`;

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${esc(cfg.headline)}</title>
<style>
  @media only screen and (max-width:600px){
    .wl-wrap{width:100%!important}
    .wl-pad{padding-left:22px!important;padding-right:22px!important}
    .wl-h1{font-size:32px!important}
    .wl-btn{display:block!important;margin:0 0 12px 0!important}
  }
</style></head>
<body style="margin:0;padding:0;background:#f4f2ee;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f2ee;">
<tr><td align="center" style="padding:26px 12px;">
<table role="presentation" class="wl-wrap" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:600px;background:#ffffff;">

  <tr><td class="wl-pad" style="padding:26px 38px 18px;border-bottom:1px solid #e6e4df;" align="center">
    <div style="font:400 13px/1 Georgia,serif;letter-spacing:6px;text-transform:uppercase;color:#0f172a;">WONDERLANDS WORLD</div>
    <div style="font:400 9px/1 Arial,Helvetica,sans-serif;letter-spacing:3px;text-transform:uppercase;color:#9a9790;margin-top:8px;">The Outdoor Annual · New Arrivals</div>
  </td></tr>

  <tr><td><img src="${cfg.heroImage}" width="600" alt="${esc(cfg.headline)}" style="display:block;width:100%;max-width:600px;height:auto;border:0;"/></td></tr>

  <tr><td class="wl-pad" style="padding:36px 38px 0;" align="center">
    ${eyebrow('New Arrivals', '#f97066')}
    <h1 class="wl-h1" style="margin:14px 0 10px;font:400 40px/1.08 Georgia,'Times New Roman',serif;color:#0f172a;">${esc(cfg.headline)}</h1>
    <p style="margin:0;font:italic 400 16px/1.6 Georgia,serif;color:#6b6862;">${esc(cfg.subheadline)}</p>
    <div style="width:48px;height:1px;background:#0891b2;margin:24px auto 0;"></div>
  </td></tr>

  <tr><td class="wl-pad" style="padding:24px 38px 0;">
    <p style="margin:0;font:400 15px/1.7 Georgia,serif;color:#2c2c2c;">Hi {{first_name}},</p>
    <p style="margin:12px 0 0;font:400 15px/1.7 Georgia,serif;color:#2c2c2c;">${esc(cfg.intro)}</p>
  </td></tr>

  ${feature('01', cfg.kitchenImage, cfg.kitchenTitle, cfg.kitchenCopy)}
  ${feature('02', cfg.saunaImage, cfg.saunaTitle, cfg.saunaCopy)}

  <tr><td class="wl-pad" align="center" style="padding:36px 38px 8px;">
    ${eyebrow('Design yours')}
    <p style="margin:12px 0 20px;font:400 18px/1.5 Georgia,serif;color:#0f172a;">A private consultation, a drawing of your patio and one turnkey price.</p>
    <span class="wl-btn" style="margin-right:8px;">${btn(cfg.appointmentLink, 'Book a consultation', '#0f172a')}</span>
    <span class="wl-btn">${btn(wa, 'Message us on WhatsApp', '#25d366')}</span>
    <p style="margin:16px 0 0;font:400 13px/1.6 Arial,Helvetica,sans-serif;color:#6b6862;">Or call <a href="tel:${cfg.phone.replace(/[^\d+]/g, '')}" style="color:#0891b2;text-decoration:none;">${esc(cfg.phone)}</a></p>
  </td></tr>

  <tr><td class="wl-pad" style="padding:32px 38px 34px;">
    <div style="border-top:1px solid #e6e4df;padding-top:18px;font:400 14px/1.6 Arial,Helvetica,sans-serif;color:#2c2c2c;">
      <strong>{{sales_rep_name}}</strong><br/>
      <span style="color:#6b6862;">Wonderlands World · {{sales_rep_email}}</span><br/>
      <span style="color:#6b6862;">${esc(cfg.phone)}</span>
    </div>
  </td></tr>

  <tr><td align="center" style="padding:18px;background:#0f172a;font:400 11px/1.6 Arial,Helvetica,sans-serif;color:#8f9aa8;">
    Wonderlands World · Florida · <a href="${SITE}" style="color:#7dd3e0;text-decoration:none;">wonderlandsworld.com</a>
  </td></tr>

</table></td></tr></table></body></html>`;
}
