import heroAsset from '@/assets/campaigns/milan-hero.png.asset.json';
import kitchenAsset from '@/assets/campaigns/milan-outdoor-kitchen.jpg.asset.json';
import solarAsset from '@/assets/campaigns/milan-solar.jpg.asset.json';

/**
 * Milan Collection premium email template.
 *
 * Table-based, inline-styled and responsive (single column stacking below
 * 600px) so it renders reliably in Gmail, Outlook and Apple Mail.
 * Personalisation uses the {{variable}} tokens already supported by the
 * existing `send-bulk-email` edge function (first_name, sales_rep_name, …).
 */

// Emails require absolute URLs — asset pointers are site-relative.
const SITE = 'https://wonderlandsworld.com';
const abs = (u: string) => (u.startsWith('http') ? u : SITE + u);

export const MILAN_HERO_IMAGE = abs(heroAsset.url);
export const MILAN_KITCHEN_IMAGE = abs(kitchenAsset.url);
export const MILAN_SOLAR_IMAGE = abs(solarAsset.url);

export interface MilanOfferConfig {
  price: string;
  headline: string;
  subheadline: string;
  bodyCopy: string;
  includes: string[];
  heroImage: string;
  kitchenImage: string;
  solarImage: string;
  whatsappNumber: string;
  appointmentLink: string;
  phone: string;
}

export const MILAN_DEFAULTS: MilanOfferConfig = {
  price: '$59,999',
  headline: 'The Milan Collection',
  subheadline: 'Turnkey luxury pool, deck and lighting — installed.',
  bodyCopy:
    'A complete outdoor transformation designed by our studio and delivered by our own crews: fiberglass shell, engineered deck, waterline finish, LED lighting, full equipment set, a Salem 2 person barrel sauna and an outdoor fireplace. One price, one team, one season.',
  includes: [
    'Premium fiberglass pool shell',
    'Engineered paver or concrete deck',
    'Salem 2 Person Barrel Sauna by Almost Heaven',
    'Outdoor fireplace',
    'LED lighting package',
    'Full equipment & plumbing set',
    'Permits, engineering & inspections',
    'Startup, balancing & owner walkthrough',
  ],
  heroImage: MILAN_HERO_IMAGE,
  kitchenImage: MILAN_KITCHEN_IMAGE,
  solarImage: MILAN_SOLAR_IMAGE,
  whatsappNumber: '+12392570637',
  appointmentLink: 'https://calendly.com/wonderlandsworlds/30min',
  phone: '+1 (239) 257-0637',
};

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const waLink = (num: string) =>
  `https://wa.me/${num.replace(/[^\d]/g, '')}?text=${encodeURIComponent(
    "Hi Wonderlands — I'd like details on the Milan Collection offer."
  )}`;

export function buildMilanOfferSubject(cfg: MilanOfferConfig) {
  return `{{first_name}}, the ${cfg.headline} — ${cfg.price} turnkey`;
}

export function buildMilanOfferHtml(cfg: MilanOfferConfig): string {
  const includes = cfg.includes
    .filter(Boolean)
    .map(
      (i) => `<tr><td style="padding:7px 0;border-bottom:1px solid #ecebe7;
        font:400 15px/1.5 Georgia,'Times New Roman',serif;color:#2c2c2c;">
        <span style="color:#0891b2;font-weight:700;">—</span>&nbsp;${esc(i)}</td></tr>`
    )
    .join('');

  const btn = (href: string, label: string, bg: string, color: string) =>
    `<a href="${href}" style="display:inline-block;background:${bg};color:${color};
      text-decoration:none;padding:15px 30px;font:600 12px/1 Arial,Helvetica,sans-serif;
      letter-spacing:2px;text-transform:uppercase;border-radius:2px;">${label}</a>`;

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${esc(cfg.headline)}</title>
<style>
  @media only screen and (max-width:600px){
    .wl-wrap{width:100%!important}
    .wl-pad{padding-left:22px!important;padding-right:22px!important}
    .wl-col{display:block!important;width:100%!important;padding:0 0 18px 0!important}
    .wl-price{font-size:38px!important}
    .wl-h1{font-size:30px!important}
    .wl-btn{display:block!important;margin-bottom:12px!important}
  }
</style></head>
<body style="margin:0;padding:0;background:#f4f2ee;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f2ee;">
<tr><td align="center" style="padding:26px 12px;">
<table role="presentation" class="wl-wrap" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:600px;background:#ffffff;">

  <!-- Masthead -->
  <tr><td class="wl-pad" style="padding:26px 38px 18px;border-bottom:1px solid #e6e4df;" align="center">
    <div style="font:400 13px/1 Georgia,serif;letter-spacing:6px;text-transform:uppercase;color:#0f172a;">WONDERLANDS WORLD</div>
    <div style="font:400 9px/1 Arial,Helvetica,sans-serif;letter-spacing:3px;text-transform:uppercase;color:#9a9790;margin-top:8px;">Outdoor Living · Pools · Solar · Home Services</div>
  </td></tr>

  <!-- Hero -->
  <tr><td><img src="${cfg.heroImage}" width="600" alt="${esc(cfg.headline)}" style="display:block;width:100%;max-width:600px;height:auto;border:0;"/></td></tr>

  <!-- Offer -->
  <tr><td class="wl-pad" style="padding:34px 38px 8px;">
    <div style="font:400 9px/1 Arial,Helvetica,sans-serif;letter-spacing:3px;text-transform:uppercase;color:#f97066;">Limited Release</div>
    <h1 class="wl-h1" style="margin:14px 0 6px;font:400 38px/1.08 Georgia,'Times New Roman',serif;color:#0f172a;">${esc(cfg.headline)}</h1>
    <p style="margin:0 0 18px;font:400 15px/1.6 Georgia,serif;color:#6b6862;">${esc(cfg.subheadline)}</p>
    <div class="wl-price" style="font:400 46px/1 Georgia,serif;color:#0891b2;">${esc(cfg.price)}</div>
    <div style="font:400 10px/1 Arial,Helvetica,sans-serif;letter-spacing:2px;text-transform:uppercase;color:#9a9790;margin-top:8px;">Turnkey · Installed · All permits included</div>
  </td></tr>

  <tr><td class="wl-pad" style="padding:20px 38px 0;">
    <p style="margin:0;font:400 15px/1.7 Georgia,serif;color:#2c2c2c;">Hi {{first_name}},</p>
    <p style="margin:12px 0 0;font:400 15px/1.7 Georgia,serif;color:#2c2c2c;">${esc(cfg.bodyCopy)}</p>
  </td></tr>

  <!-- Includes -->
  <tr><td class="wl-pad" style="padding:26px 38px 0;">
    <div style="font:400 9px/1 Arial,Helvetica,sans-serif;letter-spacing:3px;text-transform:uppercase;color:#9a9790;padding-bottom:8px;border-bottom:1px solid #0f172a;">What's included</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${includes}</table>
  </td></tr>

  <!-- CTAs -->
  <tr><td class="wl-pad" align="center" style="padding:30px 38px 8px;">
    <span class="wl-btn" style="margin-right:8px;">${btn(cfg.appointmentLink, 'Book a consultation', '#0f172a', '#ffffff')}</span>
    <span class="wl-btn">${btn(waLink(cfg.whatsappNumber), 'Message us', '#25d366', '#ffffff')}</span>
    <p style="margin:16px 0 0;font:400 13px/1.6 Arial,Helvetica,sans-serif;color:#6b6862;">Or call <a href="tel:${cfg.phone.replace(/[^\d+]/g, '')}" style="color:#0891b2;text-decoration:none;">${esc(cfg.phone)}</a></p>
  </td></tr>

  <!-- WHAT'S NEW -->
  <tr><td class="wl-pad" style="padding:34px 38px 0;">
    <div style="font:400 9px/1 Arial,Helvetica,sans-serif;letter-spacing:3px;text-transform:uppercase;color:#0f172a;padding-bottom:10px;border-bottom:1px solid #e6e4df;">What's new at Wonderlands</div>
  </td></tr>
  <tr><td class="wl-pad" style="padding:20px 38px 0;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
      <td class="wl-col" width="50%" valign="top" style="padding-right:10px;">
        <img src="${cfg.kitchenImage}" width="260" alt="Outdoor kitchens" style="display:block;width:100%;height:auto;border:0;"/>
        <h3 style="margin:12px 0 6px;font:400 20px/1.2 Georgia,serif;color:#0f172a;">Outdoor Kitchens</h3>
        <p style="margin:0;font:400 14px/1.6 Georgia,serif;color:#6b6862;">Marine-grade cabinetry, porcelain counters and built-in grills — designed to live outside, year round.</p>
      </td>
      <td class="wl-col" width="50%" valign="top" style="padding-left:10px;">
        <img src="${cfg.solarImage}" width="260" alt="Wonderlands Solar" style="display:block;width:100%;height:auto;border:0;"/>
        <h3 style="margin:12px 0 6px;font:400 20px/1.2 Georgia,serif;color:#0f172a;">Solar</h3>
        <p style="margin:0;font:400 14px/1.6 Georgia,serif;color:#6b6862;">A free aerial roof study with production modeling, panel layout and battery options for your home.</p>
      </td>
    </tr></table>
  </td></tr>

  <!-- Signature -->
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
