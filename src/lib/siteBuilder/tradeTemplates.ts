/**
 * Website Builder V2 — trade starter templates (pools, landscaping, solar,
 * roofing, general contractor). Copy is placeholder the company replaces;
 * no invented phone numbers, prices or reviews.
 * Imagine Engine Studios Corp.
 */
import { BLOCKS, newSection, uid, type BlockType, type Section, type SiteDoc } from './model';

type Spec = { type: BlockType; props?: Record<string, any>; style?: Record<string, any> };
export const sectionFrom = (s: Spec): Section => {
  const base = newSection(s.type);
  return { ...base, props: { ...base.props, ...(s.props ?? {}) }, style: { ...base.style, ...(s.style ?? {}) } };
};
/** Only known block types survive (used for Genius results too). */
export const isBlock = (t: unknown): t is BlockType => typeof t === 'string' && t in BLOCKS;

const TRADES = {
  pools: { label: 'Pools & spas', hero: 'Your backyard resort starts here', sub: 'Custom pools, spas and outdoor living — designed, built and finished by one team.', services: ['Pool design & build', 'Spas & hot tubs', 'Decks & pavers'], faq: [['How long does a pool take?', 'Share your typical timeline from permit to first swim.'], ['Do you offer financing?', 'Explain the options you work with.']] },
  landscaping: { label: 'Landscaping', hero: 'Landscapes that grow with you', sub: 'Planting, hardscape and irrigation designed for your climate.', services: ['Landscape design', 'Planting & sod', 'Irrigation & lighting'], faq: [['Do you maintain gardens after install?', 'Describe your maintenance plans.'], ['Which plants do you recommend?', 'Tell visitors how you choose plants for their yard.']] },
  solar: { label: 'Solar', hero: 'Power your home with the sun', sub: 'Solar panels and batteries sized to your roof and your bills.', services: ['Roof assessment', 'Panels & inverters', 'Battery backup'], faq: [['How much can I save?', 'Explain how you estimate savings.'], ['Are there incentives?', 'Describe the incentives your customers usually qualify for.']] },
  roofing: { label: 'Roofing', hero: 'Roofs built to last every season', sub: 'Repairs, replacements and inspections with clear quotes.', services: ['Roof replacement', 'Repairs & leaks', 'Inspections'], faq: [['Do you work with insurance?', 'Explain how you help with claims.'], ['What warranty do you offer?', 'Describe your workmanship warranty.']] },
  general: { label: 'General contractor', hero: 'Build it right, the first time', sub: 'Renovations, additions and outdoor projects — one trusted team.', services: ['Renovations', 'Additions', 'Outdoor living'], faq: [['Do you handle permits?', 'Explain how permits work with you.'], ['How do quotes work?', 'Describe your quoting process.']] },
} as const;
export type Trade = keyof typeof TRADES;
export const TRADE_OPTIONS = (Object.keys(TRADES) as Trade[]).map((k) => ({ value: k, label: TRADES[k].label }));

export function tradeTemplate(trade: Trade, brand: string): SiteDoc {
  const t = TRADES[trade];
  const header = (): Spec => ({ type: 'header', props: { links: [{ label: 'Home', href: 'page:' }, { label: 'Services', href: 'page:services' }, { label: 'About', href: 'page:about' }, { label: 'Contact', href: '#contact' }] } });
  const footer = (): Spec => ({ type: 'footer', props: { text: `${brand} — ${t.label.toLowerCase()} you can trust.` } });
  const page = (name: string, slug: string, specs: Spec[]) => ({ id: uid(), name, slug, sections: [header(), ...specs, footer()].map(sectionFrom) });
  return {
    pages: [
      page('Home', '', [
        { type: 'hero', props: { eyebrow: brand, title: t.hero, subtitle: t.sub } },
        { type: 'services', props: { title: 'What we do', items: t.services.map((x) => ({ title: x, body: 'Describe this service in two lines.', image: '' })) } },
        { type: 'stats', props: { title: '', items: [{ value: '', label: 'Years in business' }, { value: '', label: 'Projects completed' }, { value: '', label: 'Service areas' }] } },
        { type: 'faq', props: { title: 'Questions & answers', items: t.faq.map(([q, a]) => ({ q, a })) } },
        { type: 'cta', props: { title: 'Ready to start?', body: 'Tell us about your project — we reply within one business day.' } },
        { type: 'form' },
      ]),
      page('Services', 'services', [
        { type: 'text', props: { title: 'Our services', body: 'Explain how you work, from first visit to final walkthrough.' } },
        { type: 'columns', props: { items: t.services.map((x) => ({ title: x, body: 'What is included.', image: '' })) } },
        { type: 'form' },
      ]),
      page('About', 'about', [
        { type: 'text', props: { title: `About ${brand}`, body: 'Share your story, your team and your values.' } },
        { type: 'team' },
        { type: 'form' },
      ]),
    ],
  };
}
