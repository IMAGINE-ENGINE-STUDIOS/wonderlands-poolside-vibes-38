/**
 * Wonderlands flagship template — one template in the Website builder
 * library (lib/siteBuilder/templates.ts), NOT the default site: new sites
 * start blank. Mirrors the Wonderlands home page order (cinematic cover,
 * Design · Build · Power · Transform, collections, 3D studio, solar, FLIP,
 * quote form) across four pages. Copy is starter text the company replaces;
 * photos are the Wonderlands banners. Product cards start empty and are filled
 * from the real catalogue (no invented products or prices).
 */
import { newSection, uid, type Section, type SiteDoc } from './model';
import hero from '@/assets/hero/wonderlands-hero.webp';
import pools from '@/assets/banners/latham-gilmer-banner.webp';
import spa from '@/assets/banners/spa-banner.webp';
import sauna from '@/assets/banners/sauna-banner.webp';
import enclosure from '@/assets/banners/screen-enclosure-banner.webp';
import pavers from '@/assets/banners/pavers-banner.webp';
import landscaping from '@/assets/banners/landscaping-banner.webp';
import lanai from '@/assets/banners/lanai-banner.webp';
import fencing from '@/assets/banners/patio-fencing-banner.webp';

const sec = (type: Section['type'], props: Record<string, any>, style: Section['style'] = {}): Section => {
  const s = newSection(type); s.props = { ...s.props, ...props }; s.style = { ...s.style, ...style }; return s;
};

export function wonderlandsTemplate(brand = 'Your company'): SiteDoc {
  const home: Section[] = [
    sec('hero', { eyebrow: brand, title: 'Everything your home needs. One platform.', subtitle: 'Design, build, power and transform your outdoor living — pools, spas, patios, solar and more.', ctaLabel: 'Design in 3D', ctaHref: 'page:design', cta2Label: 'Get a quote', cta2Href: '#contact', image: hero, minHeight: 680 }, { overlay: 35 }),
    sec('services', { title: 'Design · Build · Power · Transform', items: [
      { title: 'Design', body: 'See your project in 3D before anything is built.', image: '', link: 'page:design' },
      { title: 'Build', body: 'Licensed crews and clear schedules from permit to handover.', image: '', link: '#contact' },
      { title: 'Power', body: 'Solar and battery systems sized for your roof.', image: '', link: 'page:solar' },
      { title: 'Transform', body: 'Pools, spas, patios and landscapes that change how you live.', image: '', link: 'page:collections' },
    ] }, { align: 'center', gradFrom: '#faf7f2', gradTo: '#ffffff', gradAngle: 180 }),
    sec('gallery', { title: 'Collections', items: [
      { src: pools, caption: 'Fiberglass pools', link: 'page:collections' }, { src: spa, caption: 'Spas', link: 'page:collections' },
      { src: sauna, caption: 'Saunas', link: 'page:collections' }, { src: enclosure, caption: 'Screen enclosures', link: 'page:collections' },
      { src: pavers, caption: 'Pavers & decks', link: 'page:collections' }, { src: landscaping, caption: 'Landscaping', link: 'page:collections' },
    ] }),
    sec('tech', { tool: 'studio', title: 'Design your backyard in 3D', height: 720 }),
    sec('cta', { title: 'Power your home with the sun', body: 'Trace your roof, size your system and see your savings in minutes.', ctaLabel: 'Open the solar workstation', ctaHref: 'page:solar' }, { color: '#ffffff', gradFrom: '#0891b2', gradTo: '#0e7490', gradAngle: 135, align: 'center' }),
    sec('testimonials', { title: 'What clients say', items: [] }),
    sec('form', { title: 'Request a quote', body: 'Tell us about your project — we reply within one business day.' }, { align: 'center' }),
  ];
  const collections: Section[] = [
    sec('hero', { eyebrow: 'Collections', title: 'Pools, spas & outdoor living', subtitle: '', ctaLabel: 'Get a quote', ctaHref: '#contact', image: lanai, minHeight: 440 }, { overlay: 40 }),
    sec('products', { title: 'Featured products', columns: 3, items: [] }),
    sec('services', { title: 'More for your home', items: [
      { title: 'Screen enclosures', body: '', image: enclosure, link: '#contact' }, { title: 'Pavers & decks', body: '', image: pavers, link: '#contact' }, { title: 'Fencing & gates', body: '', image: fencing, link: '#contact' },
    ] }),
    sec('form', { title: 'Ask about a product' }, { align: 'center' }),
  ];
  const design: Section[] = [
    sec('text', { title: '3D design studio', body: 'Shape your pool, choose finishes and walk through your backyard before we break ground.' }, { align: 'center' }),
    sec('tech', { tool: 'studio', title: '', height: 820 }),
    sec('tech', { tool: 'quote', title: 'Build your quote', height: 820 }),
  ];
  const solar: Section[] = [
    sec('text', { title: 'Solar & energy', body: 'Trace your roof and see your system size, production and savings.' }, { align: 'center' }),
    sec('tech', { tool: 'solar', title: '', height: 860 }),
    sec('form', { title: 'Talk to a solar advisor' }, { align: 'center' }),
  ];
  return { pages: [
    { id: uid(), name: 'Home', slug: '', sections: home },
    { id: uid(), name: 'Collections', slug: 'collections', sections: collections },
    { id: uid(), name: 'Design', slug: 'design', sections: design },
    { id: uid(), name: 'Solar', slug: 'solar', sections: solar },
  ] };
}
