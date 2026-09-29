import roofAsset from '@/assets/campaigns/email-solar-roof-array.jpg.asset.json';
import batteryAsset from '@/assets/campaigns/email-solar-battery-wall.jpg.asset.json';
import poolAsset from '@/assets/campaigns/email-solar-pool-heating.jpg.asset.json';

/**
 * Wonderlands Solar — editorial luxury email.
 *
 * Same magazine language as the Milan / New Arrivals emails (Georgia serif,
 * ivory paper, teal/coral accents) with a dark "night edition" masthead band.
 * Table-based + inline styles for Gmail, Outlook and Apple Mail. Images are
 * the website's own solar photos (src/assets/solar) hosted on the asset CDN,
 * so their URLs are absolute and public.
 */

const SITE = 'https://wonderlandsworld.com';
const abs = (u: string) => (u.startsWith('http') ? u : SITE + u);

export interface SolarCampaignConfig {
  headline: string;
  subheadline: string;
  intro: string;
  quote: string;
  arrayTitle: string;
  arrayCopy: string;
  batteryTitle: string;
  batteryCopy: string;
  poolTitle: string;
  poolCopy: string;
  heroImage: string;
  batteryImage: string;
  poolImage: string;
  appointmentLink: string;
  whatsappLink: string;
  phone: string;
}

export const SOLAR_CAMPAIGN_DEFAULTS: SolarCampaignConfig = {
  headline: 'Your home, powered by the sun',
  subheadline: 'The Solar Edition — panels, batteries and pool heating, designed and installed by Wonderlands.',
  intro:
    'Florida gives every roof more sunlight than almost anywhere in the country. We turn it into quiet, reliable power for your home: an array drawn to your roof, a battery wall that keeps the lights on, and a pool that stays warm without the gas bill.',
  quote: 'The most beautiful energy is the kind you never have to think about.',
  arrayTitle: 'The Solar Array',
  arrayCopy:
    'All-black panels laid out to your roof lines, with production modeled from real sun-path data before a single panel is ordered.',
  batteryTitle: 'The Battery Wall',
  batteryCopy:
    'Home batteries that store the afternoon sun for the evening and keep essentials running through storms and outages.',
  poolTitle: 'Solar Pool Heating',
  poolCopy:
    'Warm water from spring to fall, heated by the same sun that shines on your deck — silent, efficient and built to last.',
  heroImage: abs(roofAsset.url),
  batteryImage: abs(batteryAsset.url),
  poolImage: abs(poolAsset.url),
  appointmentLink: 'https://calendly.com/wonderlandsworlds/30min',
  whatsappLink: 'https://wa.me/12392570637',
  phone: '+1 (239) 257-0637',
};

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export const buildSolarCampaignSubject = (cfg: SolarCampaignConfig) =>
  `{{first_name}}, the Solar Edition: ${cfg.headline.toLowerCase()}`;

export function buildSolarCampaignHtml(cfg: SolarCampaignConfig): string {
  const wa = `${cfg.whatsappLink}?text=${encodeURIComponent(
    "Hi Wonderlands — I'd like my free solar roof study.",
  )}`;
  const btn = (href: string, label: string, bg: string, color = '#ffffff') =>
    `<a href="${href}" style="display:inline-block;background:${bg};color:${color};text-decoration:none;padding:15px 30px;font:600 12px/1 Arial,Helvetica,sans-serif;letter-spacing:2px;text-transform:uppercase;border-radius:2px;">${label}</a>`;
  const eyebrow = (t: string, color = '#9a9790') =>
    `<div style="font:400 9px/1 Arial,Helvetica,sans-serif;letter-spacing:3px;text-transform:uppercase;color:${color};">${t}</div>`;
  const half = (img: string, no: string, title: string, copy: string, side: 'l' | 'r') => `
      <td class="wl-col" width="50%" valign="top" style="padding-${side === 'l' ? 'right' : 'left'}:10px;">
        <img src="${img}" width="262" alt="${esc(title)}" style="display:block;width:100%;height:auto;border:0;"/>
        <div style="margin-top:14px;font:400 26px/1 Georgia,serif;color:#f97066;">${no}</div>
        <h3 style="margin:8px 0 6px;font:400 21px/1.2 Georgia,serif;color:#0f172a;">${esc(title)}</h3>
        <p style="margin:0;font:400 14px/1.65 Georgia,serif;color:#4a4843;">${esc(copy)}</p>
      </td>`;

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${esc(cfg.headline)}</title>
<style>
  @media only screen and (max-width:600px){
    .wl-wrap{width:100%!important}
    .wl-pad{padding-left:22px!important;padding-right:22px!important}
    .wl-col{display:block!important;width:100%!important;padding:0 0 22px 0!important}
    .wl-h1{font-size:32px!important}
    .wl-btn{display:block!important;margin:0 0 12px 0!important}
  }
</style></head>
<body style="margin:0;padding:0;background:#f4f2ee;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f2ee;">
<tr><td align="center" style="padding:26px 12px;">
<table role="presentation" class="wl-wrap" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:600px;background:#ffffff;">

  <tr><td class="wl-pad" style="padding:26px 38px 20px;background:#0b1220;" align="center">
    <div style="font:400 13px/1 Georgia,serif;letter-spacing:6px;text-transform:uppercase;color:#ffffff;">WONDERLANDS WORLD</div>
    <div style="font:400 9px/1 Arial,Helvetica,sans-serif;letter-spacing:3px;text-transform:uppercase;color:#e7b25c;margin-top:9px;">The Outdoor Annual · The Solar Edition</div>
  </td></tr>

  <tr><td><img src="${cfg.heroImage}" width="600" alt="${esc(cfg.arrayTitle)}" style="display:block;width:100%;max-width:600px;height:auto;border:0;"/></td></tr>

  <tr><td class="wl-pad" style="padding:38px 38px 0;" align="center">
    ${eyebrow('Wonderlands Solar', '#f97066')}
    <h1 class="wl-h1" style="margin:14px 0 10px;font:400 40px/1.08 Georgia,'Times New Roman',serif;color:#0f172a;">${esc(cfg.headline)}</h1>
    <p style="margin:0;font:italic 400 16px/1.6 Georgia,serif;color:#6b6862;">${esc(cfg.subheadline)}</p>
    <div style="width:48px;height:1px;background:#e7b25c;margin:24px auto 0;"></div>
  </td></tr>

  <tr><td class="wl-pad" style="padding:24px 38px 0;">
    <p style="margin:0;font:400 15px/1.7 Georgia,serif;color:#2c2c2c;">Hi {{first_name}},</p>
    <p style="margin:12px 0 0;font:400 15px/1.7 Georgia,serif;color:#2c2c2c;">${esc(cfg.intro)}</p>
  </td></tr>

  <tr><td class="wl-pad" style="padding:30px 38px 0;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
      <td style="border-left:2px solid #e7b25c;padding:4px 0 4px 20px;font:italic 400 22px/1.4 Georgia,serif;color:#0f172a;">&ldquo;${esc(cfg.quote)}&rdquo;</td>
    </tr></table>
  </td></tr>

  <tr><td class="wl-pad" style="padding:34px 38px 0;">
    ${eyebrow('01 · ' + esc(cfg.arrayTitle))}
    <p style="margin:10px 0 0;font:400 15px/1.7 Georgia,serif;color:#4a4843;">${esc(cfg.arrayCopy)}</p>
  </td></tr>

  <tr><td class="wl-pad" style="padding:30px 38px 0;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
      ${half(cfg.batteryImage, '02', cfg.batteryTitle, cfg.batteryCopy, 'l')}
      ${half(cfg.poolImage, '03', cfg.poolTitle, cfg.poolCopy, 'r')}
    </tr></table>
  </td></tr>

  <tr><td style="padding:36px 0 0;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0b1220;"><tr>
      <td class="wl-pad" align="center" style="padding:34px 38px;">
        ${eyebrow('Complimentary', '#e7b25c')}
        <p style="margin:12px 0 6px;font:400 24px/1.3 Georgia,serif;color:#ffffff;">Your free solar roof study</p>
        <p style="margin:0 0 22px;font:400 14px/1.6 Georgia,serif;color:#b8c0cc;">An aerial trace of your roof, a panel layout, yearly production and your savings — prepared privately for your home.</p>
        <span class="wl-btn" style="margin-right:8px;">${btn(cfg.appointmentLink, 'Book my roof study', '#e7b25c', '#0b1220')}</span>
        <span class="wl-btn">${btn(wa, 'Message us on WhatsApp', '#25d366')}</span>
        <p style="margin:16px 0 0;font:400 13px/1.6 Arial,Helvetica,sans-serif;color:#b8c0cc;">Or call <a href="tel:${cfg.phone.replace(/[^\d+]/g, '')}" style="color:#7dd3e0;text-decoration:none;">${esc(cfg.phone)}</a></p>
      </td>
    </tr></table>
  </td></tr>

  <tr><td class="wl-pad" style="padding:30px 38px 34px;">
    <div style="font:400 14px/1.6 Arial,Helvetica,sans-serif;color:#2c2c2c;">
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
