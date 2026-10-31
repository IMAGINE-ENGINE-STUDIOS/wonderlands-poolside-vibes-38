/**
 * Website Builder template library — founder direction 2026-10-31.
 *
 * The Wonderlands World main page is a TEMPLATE here, not the default
 * site. New sites start blank (see blankDoc in model.ts). This library
 * is the ONLY template list in the builder: the Wonderlands Home
 * template plus the high-quality templates in this file. The old trade
 * starter templates are no longer offered.
 *
 * Every template is a plain SiteDoc (pages → sections from model.ts
 * BLOCKS), so applying one gives the company fully editable content —
 * every headline, photo, card and tool can be changed like any other
 * content in the builder. Copy is starter text the company replaces;
 * no invented prices, phone numbers or reviews.
 */
import { newSection, uid, type Section, type SiteDoc } from './model';
import { wonderlandsTemplate } from './wonderlandsTemplate';
import pools from '@/assets/banners/latham-gilmer-banner.webp';
import poolAlt from '@/assets/banners/pool-banner-2.webp';
import spa from '@/assets/banners/spa-banner.webp';
import sauna from '@/assets/banners/sauna-banner.webp';
import enclosure from '@/assets/banners/screen-enclosure-banner.webp';
import pavers from '@/assets/banners/pavers-banner.webp';
import landscaping from '@/assets/banners/landscaping-banner.webp';
import lanai from '@/assets/banners/lanai-banner.webp';
import fencing from '@/assets/banners/patio-fencing-banner.webp';
import gate from '@/assets/banners/driveway-gate-banner.webp';
import covers from '@/assets/banners/covers-banner.webp';
import ledge from '@/assets/banners/tanning-ledge-banner.webp';
import heroPool from '@/assets/hero/hero-pool-optimized.webp';
import hero1 from '@/assets/hero/hero-carousel-1.webp';
import hero2 from '@/assets/hero/hero-carousel-2.webp';
import hero3 from '@/assets/hero/hero-carousel-3.webp';

export interface SiteTemplate {
  id: string;
  name: string;
  blurb: string;
  build: (brand: string) => SiteDoc;
}

const sec = (type: Section['type'], props: Record<string, any> = {}, style: Section['style'] = {}): Section => {
  const s = newSection(type); s.props = { ...s.props, ...props }; s.style = { ...s.style, ...style }; return s;
};
const header = (links: [string, string][]) => sec('header', { links: links.map(([label, href]) => ({ label, href })), ctaLabel: 'Get a quote', ctaHref: '#contact' });
const footer = (brand: string, line: string) => sec('footer', { text: `${brand} — ${line}` });
const pg = (name: string, slug: string, sections: Section[]) => ({ id: uid(), name, slug, sections });
const contactForm = (title = 'Request a quote') => sec('form', { title, body: 'Tell us about your project — we reply within one business day.' }, { align: 'center' });
const faq = (items: [string, string][]) => sec('faq', { title: 'Questions & answers', items: items.map(([q, a]) => ({ q, a })) });
const gallery = (title: string, items: [string, string][]) => sec('gallery', { title, items: items.map(([src, caption]) => ({ src, caption, link: '' })) });

/* ---------------- Azure Pools — luxury pool builder ---------------- */
function azurePools(brand: string): SiteDoc {
  const nav: [string, string][] = [['Home', 'page:'], ['Collection', 'page:collection'], ['Design', 'page:design'], ['Contact', 'page:contact']];
  return { pages: [
    pg('Home', '', [
      header(nav),
      sec('hero', { eyebrow: brand, title: 'A pool that feels like a resort', subtitle: 'Custom fiberglass and concrete pools, designed in 3D, built by one licensed team, finished to the last tile.', ctaLabel: 'Design your pool', ctaHref: 'page:design', cta2Label: 'See the collection', cta2Href: 'page:collection', image: poolAlt, minHeight: 680 }, { overlay: 35 }),
      sec('services', { title: 'Design · Build · Enjoy', items: [
        { title: 'Pool design', body: 'Shape, depth and finishes chosen with you in 3D before ground is broken.', image: '', link: 'page:design', icon: 'waves' },
        { title: 'Construction', body: 'Permits, excavation, install and finishing under one schedule you can follow.', image: '', link: '#contact', icon: 'shield' },
        { title: 'Spas & ledges', body: 'Raised spas, tanning ledges and water features that complete the picture.', image: '', link: 'page:collection', icon: 'sparkles' },
        { title: 'Care & service', body: 'Cleaning, equipment and seasonal care so the water is always ready.', image: '', link: '#contact', icon: 'check' },
      ] }, { align: 'center' }),
      sec('tech', { tool: 'studio', title: 'Walk your backyard in 3D', height: 760 }),
      gallery('Recent builds', [[pools, 'Fiberglass pools'], [ledge, 'Tanning ledges'], [spa, 'Spas'], [enclosure, 'Enclosures']]),
      sec('columns', { title: 'How it works', columns: 3, items: [
        { title: '1 — Design', body: 'Walk the design in 3D and lock finishes, decking and lighting.', image: '', icon: '' },
        { title: '2 — Build', body: 'One crew, one schedule, photo updates at every stage.', image: '', icon: '' },
        { title: '3 — Swim', body: 'Handover with training, warranty and a care plan in writing.', image: '', icon: '' },
      ] }),
      sec('testimonials', { title: 'What clients say', items: [] }),
      faq([['How long does a pool take?', 'Share your typical timeline from permit to first swim.'], ['Do you handle permits?', 'Explain how permits and inspections work with your team.'], ['Can I finance it?', 'Describe the financing options you work with.']]),
      contactForm(),
      footer(brand, 'custom pools, designed and built with care.'),
    ]),
    pg('Collection', 'collection', [
      header(nav),
      sec('hero', { eyebrow: 'Collection', title: 'Pools, spas & ledges', subtitle: 'Every model, ready to configure.', ctaLabel: 'Get a quote', ctaHref: '#contact', image: pools, minHeight: 440 }, { overlay: 40 }),
      sec('products', { title: 'The collection', columns: 3, items: [] }),
      sec('tech', { tool: 'poolspa', title: 'Configure a pool & spa', height: 800 }),
      contactForm('Ask about a model'),
      footer(brand, 'custom pools, designed and built with care.'),
    ]),
    pg('Design', 'design', [
      header(nav),
      sec('text', { title: 'Design studio', body: 'Shape your pool, choose finishes and walk through your backyard before we break ground.' }, { align: 'center' }),
      sec('tech', { tool: 'studio', title: '', height: 820 }),
      sec('tech', { tool: 'quote', title: 'Build your quote', height: 820 }),
      footer(brand, 'custom pools, designed and built with care.'),
    ]),
    pg('Contact', 'contact', [
      header(nav),
      sec('text', { title: 'Talk to the team', body: 'Tell us about your yard and the pool you are picturing — we reply within one business day.' }, { align: 'center' }),
      contactForm('Start the conversation'),
      sec('map', { title: 'Visit the studio', address: '', height: 380 }),
      footer(brand, 'custom pools, designed and built with care.'),
    ]),
  ] };
}

/* ---------------- Terra Gardens — landscaping ---------------- */
function terraGardens(brand: string): SiteDoc {
  const nav: [string, string][] = [['Home', 'page:'], ['Gardens', 'page:gardens'], ['Studio', 'page:studio'], ['Contact', 'page:contact']];
  return { pages: [
    pg('Home', '', [
      header(nav),
      sec('hero', { eyebrow: brand, title: 'Gardens that grow more beautiful every year', subtitle: 'Landscape design, planting and hardscape planned for your light, soil and climate — then installed by our own crews.', ctaLabel: 'Plan your garden', ctaHref: 'page:studio', cta2Label: 'See gardens', cta2Href: 'page:gardens', image: landscaping, minHeight: 640 }, { overlay: 35 }),
      sec('services', { title: 'What we do', items: [
        { title: 'Landscape design', body: 'A planted plan drawn bed by bed, with mature sizes in mind.', image: '', link: 'page:studio', icon: 'sparkles' },
        { title: 'Planting & sod', body: 'Trees, beds and lawns installed at the right season and depth.', image: '', link: '#contact', icon: 'check' },
        { title: 'Hardscape', body: 'Paths, patios, edging and stone that frame the planting.', image: '', link: 'page:gardens', icon: 'shield' },
        { title: 'Irrigation & lighting', body: 'Water where roots need it and light where evenings want it.', image: '', link: '#contact', icon: 'sun' },
      ] }, { align: 'center', gradFrom: '#f7f5ef', gradTo: '#ffffff', gradAngle: 180 }),
      sec('tech', { tool: 'landscaping', title: 'Plan your beds in the landscaping studio', height: 780 }),
      gallery('Gardens we tend', [[landscaping, 'Planting & beds'], [lanai, 'Shade & lanai'], [pavers, 'Paths & patios'], [hero2, 'Evening gardens']]),
      sec('columns', { title: 'Care through the seasons', columns: 3, items: [
        { title: 'Spring', body: 'Feeding, mulch and the first shape of the year.', image: '', icon: '' },
        { title: 'Summer', body: 'Water checks, pruning and pest watch.', image: '', icon: '' },
        { title: 'Autumn', body: 'Planting season — roots settle before winter.', image: '', icon: '' },
      ] }),
      faq([['Do you maintain gardens after install?', 'Describe your maintenance plans here.'], ['Which plants suit my yard?', 'Explain how you choose plants for light and soil.'], ['When is the best time to plant?', 'Share your seasonal guidance.']]),
      contactForm(),
      footer(brand, 'landscapes that grow with you.'),
    ]),
    pg('Gardens', 'gardens', [
      header(nav),
      sec('hero', { eyebrow: 'Gardens', title: 'Recent landscapes', subtitle: '', ctaLabel: 'Start yours', ctaHref: '#contact', image: hero2, minHeight: 440 }, { overlay: 40 }),
      gallery('Portfolio', [[landscaping, 'Front gardens'], [pavers, 'Hardscape'], [lanai, 'Outdoor rooms'], [hero3, 'Poolside planting']]),
      sec('services', { title: 'More for your garden', items: [
        { title: 'Tree care', body: '', image: '', link: '#contact' }, { title: 'Seasonal colour', body: '', image: '', link: '#contact' }, { title: 'Garden lighting', body: '', image: '', link: '#contact' },
      ] }),
      contactForm('Ask about your garden'),
      footer(brand, 'landscapes that grow with you.'),
    ]),
    pg('Studio', 'studio', [
      header(nav),
      sec('text', { title: 'Landscaping studio', body: 'Lay out beds, paths and planting, then send it with your quote request.' }, { align: 'center' }),
      sec('tech', { tool: 'landscaping', title: '', height: 840 }),
      sec('tech', { tool: 'quote', title: 'Build your quote', height: 800 }),
      footer(brand, 'landscapes that grow with you.'),
    ]),
    pg('Contact', 'contact', [
      header(nav),
      sec('text', { title: 'Talk to a designer', body: 'Share a photo of the yard if you can — it helps us reply with real ideas.' }, { align: 'center' }),
      contactForm('Start the conversation'),
      sec('map', { title: 'Find us', address: '', height: 380 }),
      footer(brand, 'landscapes that grow with you.'),
    ]),
  ] };
}

/* ---------------- Solstice Solar — solar & battery ---------------- */
function solsticeSolar(brand: string): SiteDoc {
  const nav: [string, string][] = [['Home', 'page:'], ['Solar', 'page:solar'], ['Contact', 'page:contact']];
  return { pages: [
    pg('Home', '', [
      header(nav),
      sec('hero', { eyebrow: brand, title: 'Power your home with the sun', subtitle: 'Panels and batteries sized to your roof and your bills — trace your roof and see the numbers before anyone visits.', ctaLabel: 'Trace your roof', ctaHref: 'page:solar', cta2Label: 'Talk to an advisor', cta2Href: '#contact', image: hero3, minHeight: 620 }, { overlay: 40 }),
      sec('services', { title: 'What we do', items: [
        { title: 'Roof assessment', body: 'Shade, pitch and structure checked against satellite imagery and a site visit.', image: '', link: 'page:solar', icon: 'sun' },
        { title: 'Panels & inverters', body: 'Equipment matched to your roof and your usage, installed by our own team.', image: '', link: '#contact', icon: 'zap' },
        { title: 'Battery backup', body: 'Keep the lights, fridge and Wi-Fi on when the grid goes down.', image: '', link: '#contact', icon: 'shield' },
        { title: 'Monitoring', body: 'Production and savings in one app, with alerts if anything underperforms.', image: '', link: '#contact', icon: 'check' },
      ] }, { align: 'center' }),
      sec('tech', { tool: 'solarboard', title: 'Trace your roof', height: 800 }),
      sec('columns', { title: 'How it pays back', columns: 3, items: [
        { title: 'Lower bills', body: 'Generate through the day and draw less from the grid every month.', image: '', icon: '' },
        { title: 'Stored sunshine', body: 'Batteries carry your evening and cover outages automatically.', image: '', icon: '' },
        { title: 'Incentives', body: 'We document the incentives your household qualifies for, in writing.', image: '', icon: '' },
      ] }),
      sec('tech', { tool: 'solar', title: 'Size your system with Solar Genius', height: 820 }),
      faq([['How much can I save?', 'Explain how you estimate savings from a real bill.'], ['What if my roof is shaded?', 'Describe your shade analysis and alternatives.'], ['How long does install take?', 'Share your typical install timeline.']]),
      sec('cta', { title: 'See your roof in numbers', body: 'Two minutes on the drawing board gives you a system size and a savings estimate.', ctaLabel: 'Open the solar board', ctaHref: 'page:solar' }, { color: '#ffffff', gradFrom: '#d97706', gradTo: '#b45309', gradAngle: 135, align: 'center' }),
      contactForm('Talk to a solar advisor'),
      footer(brand, 'solar and storage, sized honestly.'),
    ]),
    pg('Solar', 'solar', [
      header(nav),
      sec('text', { title: 'Solar workstation', body: 'Trace your roof, place panels and see production and savings estimates.' }, { align: 'center' }),
      sec('tech', { tool: 'solar', title: '', height: 860 }),
      sec('tech', { tool: 'solarboard', title: 'Drawing board', height: 800 }),
      contactForm('Send my design to an advisor'),
      footer(brand, 'solar and storage, sized honestly.'),
    ]),
    pg('Contact', 'contact', [
      header(nav),
      sec('text', { title: 'Talk to an advisor', body: 'Bring a recent power bill if you can — it makes the estimate real.' }, { align: 'center' }),
      contactForm('Start the conversation'),
      sec('map', { title: 'Find us', address: '', height: 380 }),
      footer(brand, 'solar and storage, sized honestly.'),
    ]),
  ] };
}

/* ---------------- Nordic Wellness — saunas & spas ---------------- */
function nordicWellness(brand: string): SiteDoc {
  const nav: [string, string][] = [['Home', 'page:'], ['Collection', 'page:collection'], ['Contact', 'page:contact']];
  return { pages: [
    pg('Home', '', [
      header(nav),
      sec('hero', { eyebrow: brand, title: 'Heat. Cold. Quiet.', subtitle: 'Barrel saunas, indoor saunas and spas for the daily ritual — delivered, placed and ready to sweat.', ctaLabel: 'Browse the collection', ctaHref: 'page:collection', cta2Label: 'Ask a specialist', cta2Href: '#contact', image: sauna, minHeight: 640 }, { overlay: 40 }),
      sec('services', { title: 'The ritual, complete', items: [
        { title: 'Barrel saunas', body: 'Cedar barrels that heat fast and belong in any garden.', image: sauna, link: 'page:collection' },
        { title: 'Indoor saunas', body: 'Panel-built rooms sized to a corner, a garage or a bath.', image: '', link: 'page:collection' },
        { title: 'Spas & hot tubs', body: 'Hydrotherapy jets and honest insulation for nightly soaks.', image: spa, link: 'page:collection' },
        { title: 'Cold plunge', body: 'The cold half of the ritual — chillers and tubs that hold temperature.', image: '', link: 'page:collection' },
      ] }, { align: 'center' }),
      gallery('In place', [[sauna, 'Barrel saunas'], [spa, 'Spas'], [covers, 'Covers & care'], [hero1, 'Garden wellness']]),
      sec('products', { title: 'Bestsellers', columns: 3, items: [] }),
      sec('tech', { tool: 'showroom', title: 'Visit the showroom', height: 760 }),
      sec('testimonials', { title: 'What clients say', items: [] }),
      faq([['What do I need for install?', 'Explain base, power and access requirements.'], ['How long until delivery?', 'Share your typical delivery window.'], ['Electric or wood-fired?', 'Compare the two honestly for your readers.']]),
      contactForm('Ask a specialist'),
      footer(brand, 'saunas and spas for the daily ritual.'),
    ]),
    pg('Collection', 'collection', [
      header(nav),
      sec('hero', { eyebrow: 'Collection', title: 'Saunas, spas & plunge', subtitle: '', ctaLabel: 'Ask about a model', ctaHref: '#contact', image: spa, minHeight: 440 }, { overlay: 40 }),
      sec('products', { title: 'The collection', columns: 3, items: [] }),
      sec('tech', { tool: 'poolspa', title: 'Configure a spa', height: 800 }),
      contactForm('Ask about a model'),
      footer(brand, 'saunas and spas for the daily ritual.'),
    ]),
    pg('Contact', 'contact', [
      header(nav),
      sec('text', { title: 'Talk to a specialist', body: 'Tell us where it will live — indoors, garden or terrace — and we will match the model.' }, { align: 'center' }),
      contactForm('Start the conversation'),
      sec('map', { title: 'Visit the showroom', address: '', height: 380 }),
      footer(brand, 'saunas and spas for the daily ritual.'),
    ]),
  ] };
}

/* ---------------- Haven Enclosures — screens, lanai & patios ---------------- */
function havenEnclosures(brand: string): SiteDoc {
  const nav: [string, string][] = [['Home', 'page:'], ['Projects', 'page:projects'], ['Design', 'page:design'], ['Contact', 'page:contact']];
  return { pages: [
    pg('Home', '', [
      header(nav),
      sec('hero', { eyebrow: brand, title: 'Outside, without the bugs', subtitle: 'Screen enclosures, lanais and patio cages engineered for storm country and built to disappear into the view.', ctaLabel: 'Design your enclosure', ctaHref: 'page:design', cta2Label: 'See projects', cta2Href: 'page:projects', image: enclosure, minHeight: 640 }, { overlay: 35 }),
      sec('services', { title: 'What we build', items: [
        { title: 'Pool enclosures', body: 'Full cages with picture-view panels and doors that close themselves.', image: '', link: 'page:design', icon: 'shield' },
        { title: 'Lanais', body: 'Screened rooms that turn a slab into the favourite room of the house.', image: '', link: 'page:projects', icon: 'home' },
        { title: 'Re-screening', body: 'Fresh mesh, new spline and hardware checked end to end.', image: '', link: '#contact', icon: 'check' },
        { title: 'Repairs', body: 'Storm damage, doors, kick plates and framing put right.', image: '', link: '#contact', icon: 'sparkles' },
      ] }, { align: 'center' }),
      sec('tech', { tool: 'enclosures', title: 'Draw your enclosure', height: 800 }),
      gallery('Projects', [[enclosure, 'Pool cages'], [lanai, 'Lanais'], [fencing, 'Fencing'], [pavers, 'Patios']]),
      sec('beforeafter', { title: 'The transformation', before: hero3, after: enclosure, height: 480 }),
      faq([['Do enclosures need permits?', 'Explain permitting in your area.'], ['What mesh should I choose?', 'Compare standard, no-see-um and pet mesh.'], ['How long does a cage take?', 'Share your typical build timeline.']]),
      contactForm(),
      footer(brand, 'enclosures built for storm country.'),
    ]),
    pg('Projects', 'projects', [
      header(nav),
      sec('hero', { eyebrow: 'Projects', title: 'Enclosures & lanais', subtitle: '', ctaLabel: 'Start yours', ctaHref: '#contact', image: lanai, minHeight: 440 }, { overlay: 40 }),
      gallery('Portfolio', [[enclosure, 'Pool enclosures'], [lanai, 'Lanais'], [fencing, 'Patios & fencing'], [covers, 'Covers']]),
      contactForm('Ask about your project'),
      footer(brand, 'enclosures built for storm country.'),
    ]),
    pg('Design', 'design', [
      header(nav),
      sec('text', { title: 'Enclosure board', body: 'Lay out the footprint, doors and panels, then send it with your quote request.' }, { align: 'center' }),
      sec('tech', { tool: 'enclosures', title: '', height: 840 }),
      sec('tech', { tool: 'quote', title: 'Build your quote', height: 800 }),
      footer(brand, 'enclosures built for storm country.'),
    ]),
    pg('Contact', 'contact', [
      header(nav),
      sec('text', { title: 'Talk to the team', body: 'Measurements help, but a photo of the patio gets us started.' }, { align: 'center' }),
      contactForm('Start the conversation'),
      sec('map', { title: 'Find us', address: '', height: 380 }),
      footer(brand, 'enclosures built for storm country.'),
    ]),
  ] };
}

/* ---------------- Ironwood Gates — gates & fencing ---------------- */
function ironwoodGates(brand: string): SiteDoc {
  const nav: [string, string][] = [['Home', 'page:'], ['Gates', 'page:gates'], ['Contact', 'page:contact']];
  return { pages: [
    pg('Home', '', [
      header(nav),
      sec('hero', { eyebrow: brand, title: 'An entrance that says you have arrived', subtitle: 'Driveway gates, fencing and automation — fabricated, installed and serviced by one team.', ctaLabel: 'Design your gate', ctaHref: 'page:gates', cta2Label: 'Get a quote', cta2Href: '#contact', image: gate, minHeight: 620 }, { overlay: 40 }),
      sec('services', { title: 'What we do', items: [
        { title: 'Driveway gates', body: 'Swing and sliding gates in steel and aluminium, sized to the opening.', image: gate, link: 'page:gates' },
        { title: 'Automation', body: 'Openers, keypads, intercoms and app control that simply work.', image: '', link: '#contact', icon: 'zap' },
        { title: 'Fencing', body: 'Privacy, picket and pool-code fencing matched to the gate.', image: fencing, link: 'page:gates' },
        { title: 'Service & repair', body: 'Motors, hinges, remotes and storm damage, put right fast.', image: '', link: '#contact', icon: 'check' },
      ] }, { align: 'center' }),
      gallery('Recent entrances', [[gate, 'Driveway gates'], [fencing, 'Fencing'], [hero1, 'Estates'], [pavers, 'Driveways']]),
      sec('columns', { title: 'Why Ironwood', columns: 3, items: [
        { title: 'Fabricated to fit', body: 'Measured, built and finished for your exact opening.', image: '', icon: '' },
        { title: 'Storm rated', body: 'Hardware and posts specified for wind, rain and salt air.', image: '', icon: '' },
        { title: 'One warranty', body: 'Structure, finish and automation covered by a single call.', image: '', icon: '' },
      ] }),
      sec('tech', { tool: 'design', title: 'Sketch it on the design board', height: 760 }),
      faq([['Swing or sliding?', 'Explain how you choose for a driveway.'], ['Do I need power at the gate?', 'Describe solar and wired opener options.'], ['How long does fabrication take?', 'Share your typical lead time.']]),
      contactForm(),
      footer(brand, 'gates and fencing, fabricated to fit.'),
    ]),
    pg('Gates', 'gates', [
      header(nav),
      sec('hero', { eyebrow: 'Gates', title: 'Gates & fencing', subtitle: '', ctaLabel: 'Get a quote', ctaHref: '#contact', image: fencing, minHeight: 440 }, { overlay: 40 }),
      sec('products', { title: 'Popular styles', columns: 3, items: [] }),
      gallery('Styles', [[gate, 'Statement gates'], [fencing, 'Privacy fencing'], [pavers, 'Entries']]),
      contactForm('Ask about a style'),
      footer(brand, 'gates and fencing, fabricated to fit.'),
    ]),
    pg('Contact', 'contact', [
      header(nav),
      sec('text', { title: 'Talk to the team', body: 'The width of the opening and a photo of the entrance are the perfect start.' }, { align: 'center' }),
      contactForm('Start the conversation'),
      sec('map', { title: 'Find us', address: '', height: 380 }),
      footer(brand, 'gates and fencing, fabricated to fit.'),
    ]),
  ] };
}

/* ---------------- Stone & Paver Co. — hardscape ---------------- */
function stonePavers(brand: string): SiteDoc {
  const nav: [string, string][] = [['Home', 'page:'], ['Work', 'page:work'], ['Contact', 'page:contact']];
  return { pages: [
    pg('Home', '', [
      header(nav),
      sec('hero', { eyebrow: brand, title: 'Stone underfoot, built to stay level', subtitle: 'Pool decks, driveways, patios and walkways in pavers and natural stone — laid on a base that does not move.', ctaLabel: 'Plan your deck', ctaHref: 'page:work', cta2Label: 'Get a quote', cta2Href: '#contact', image: pavers, minHeight: 620 }, { overlay: 35 }),
      sec('services', { title: 'What we lay', items: [
        { title: 'Pool decks', body: 'Cool-touch finishes and drainage planned around the water.', image: pavers, link: 'page:work' },
        { title: 'Driveways', body: 'Rated bases and borders that carry weight without rutting.', image: '', link: 'page:work', icon: 'shield' },
        { title: 'Patios & paths', body: 'Patterns from running bond to herringbone, edged in steel or stone.', image: '', link: '#contact', icon: 'sparkles' },
        { title: 'Repairs & sealing', body: 'Lift, re-level, re-sand and seal — old decks made new.', image: '', link: '#contact', icon: 'check' },
      ] }, { align: 'center' }),
      sec('tech', { tool: 'design2d', title: 'Lay it out in the design studio', height: 780 }),
      gallery('Recent work', [[pavers, 'Decks & patios'], [heroPool, 'Poolside'], [gate, 'Driveways'], [lanai, 'Courtyards']]),
      sec('columns', { title: 'The base is the job', columns: 3, items: [
        { title: 'Excavate', body: 'Down to stable ground, every time — no shortcuts under stone.', image: '', icon: '' },
        { title: 'Compact & drain', body: 'A graded, compacted base with water led away from the house.', image: '', icon: '' },
        { title: 'Lay & lock', body: 'Tight joints, polymeric sand and a sealed, even finish.', image: '', icon: '' },
      ] }),
      faq([['Pavers or poured concrete?', 'Compare cost, repair and lifespan honestly.'], ['How long does a deck take?', 'Share your typical timeline by size.'], ['Do you repair sunken areas?', 'Explain your lift-and-relay service.']]),
      contactForm(),
      footer(brand, 'hardscape on a base that does not move.'),
    ]),
    pg('Work', 'work', [
      header(nav),
      sec('hero', { eyebrow: 'Work', title: 'Decks, drives & patios', subtitle: '', ctaLabel: 'Start yours', ctaHref: '#contact', image: heroPool, minHeight: 440 }, { overlay: 40 }),
      gallery('Portfolio', [[pavers, 'Pool decks'], [lanai, 'Patios'], [gate, 'Driveways'], [landscaping, 'Paths & gardens']]),
      sec('beforeafter', { title: 'Lifted & re-laid', before: hero3, after: pavers, height: 460 }),
      contactForm('Ask about your project'),
      footer(brand, 'hardscape on a base that does not move.'),
    ]),
    pg('Contact', 'contact', [
      header(nav),
      sec('text', { title: 'Talk to the team', body: 'Rough dimensions and a photo will get you a real first estimate.' }, { align: 'center' }),
      contactForm('Start the conversation'),
      sec('map', { title: 'Find us', address: '', height: 380 }),
      footer(brand, 'hardscape on a base that does not move.'),
    ]),
  ] };
}

/* ---------------- The Outdoor Living Co. — general outdoor contractor ---------------- */
function outdoorLiving(brand: string): SiteDoc {
  const nav: [string, string][] = [['Home', 'page:'], ['Services', 'page:services'], ['Design', 'page:design'], ['Contact', 'page:contact']];
  return { pages: [
    pg('Home', '', [
      header(nav),
      sec('hero', { eyebrow: brand, title: 'The backyard, finished like a room', subtitle: 'Kitchens, pergolas, decks, fire and light — one team designs and builds the whole outdoor room.', ctaLabel: 'Design it in 3D', ctaHref: 'page:design', cta2Label: 'See services', cta2Href: 'page:services', image: lanai, minHeight: 660 }, { overlay: 35 }),
      sec('services', { title: 'Everything outside', items: [
        { title: 'Outdoor kitchens', body: 'Grills, counters, fridges and bars under cover, plumbed and wired.', image: '', link: 'page:services', icon: 'sparkles' },
        { title: 'Pergolas & shade', body: 'Cedar, aluminium and louvered roofs that follow the sun.', image: lanai, link: 'page:services' },
        { title: 'Decks & patios', body: 'Surfaces that tie the house to the garden in one level line.', image: pavers, link: 'page:services' },
        { title: 'Fire & light', body: 'Fire pits, fireplaces and lighting scenes for long evenings.', image: '', link: 'page:services', icon: 'sun' },
      ] }, { align: 'center', gradFrom: '#faf7f2', gradTo: '#ffffff', gradAngle: 180 }),
      sec('tech', { tool: 'studio', title: 'Design the whole yard in 3D', height: 780 }),
      gallery('Finished yards', [[lanai, 'Covered living'], [pools, 'Pool & deck'], [landscaping, 'Gardens'], [pavers, 'Patios']]),
      sec('testimonials', { title: 'What clients say', items: [] }),
      faq([['Can you do the whole yard at once?', 'Explain how you phase multi-trade projects.'], ['Do you handle permits and HOA?', 'Describe your paperwork process.'], ['What does a project cost?', 'Explain how you scope and quote — no invented figures.']]),
      sec('cta', { title: 'Start with a design', body: 'A 3D design first means no surprises later — every finish chosen before we build.', ctaLabel: 'Open the studio', ctaHref: 'page:design' }, { color: '#ffffff', gradFrom: '#0f766e', gradTo: '#115e59', gradAngle: 135, align: 'center' }),
      contactForm(),
      footer(brand, 'outdoor rooms, designed and built by one team.'),
    ]),
    pg('Services', 'services', [
      header(nav),
      sec('text', { title: 'Services', body: 'One contract, one schedule, one team accountable for the whole yard.' }, { align: 'center' }),
      sec('columns', { title: 'What we build', columns: 3, items: [
        { title: 'Kitchens & bars', body: 'Cooking and serving outside, under cover.', image: '', icon: '' },
        { title: 'Shade structures', body: 'Pergolas, pavilions and lanais.', image: '', icon: '' },
        { title: 'Water & fire', body: 'Pools, spas, fire pits and features.', image: '', icon: '' },
      ] }),
      sec('tech', { tool: 'quote', title: 'Build your quote', height: 800 }),
      contactForm('Ask about a project'),
      footer(brand, 'outdoor rooms, designed and built by one team.'),
    ]),
    pg('Design', 'design', [
      header(nav),
      sec('text', { title: '3D design studio', body: 'Walk the finished yard before a single hole is dug.' }, { align: 'center' }),
      sec('tech', { tool: 'studio', title: '', height: 820 }),
      sec('tech', { tool: 'design', title: 'Global design board', height: 800 }),
      footer(brand, 'outdoor rooms, designed and built by one team.'),
    ]),
    pg('Contact', 'contact', [
      header(nav),
      sec('text', { title: 'Talk to the team', body: 'Tell us how you want to live outside — cooking, swimming, shade, all of it.' }, { align: 'center' }),
      contactForm('Start the conversation'),
      sec('map', { title: 'Find us', address: '', height: 380 }),
      footer(brand, 'outdoor rooms, designed and built by one team.'),
    ]),
  ] };
}

/* ---------------- Lumen Studio — SaaS / technology ---------------- */
function lumenStudio(brand: string): SiteDoc {
  const nav: [string, string][] = [['Home', 'page:'], ['Product', 'page:product'], ['Pricing', 'page:pricing'], ['Contact', 'page:contact']];
  return { pages: [
    pg('Home', '', [
      header(nav),
      sec('hero', { eyebrow: brand, title: 'Software that runs the whole job', subtitle: 'Design, quote, book and follow up from one calm workspace — built for teams who build.', ctaLabel: 'See the product', ctaHref: 'page:product', cta2Label: 'Talk to us', cta2Href: '#contact', image: '', minHeight: 560, ticker: 'Design · Quote · Book · Follow up' }, { gradFrom: '#1d4ed8', gradTo: '#2563eb', gradAngle: 135, align: 'center', color: '#ffffff' }),
      sec('logos', { title: 'Trusted by teams like yours', items: [] }),
      sec('columns', { title: 'Everything in one place', columns: 3, items: [
        { title: 'Design tools', body: 'Visual planners your customers can use on any device.', image: '', icon: 'sparkles' },
        { title: 'Quotes in minutes', body: 'Real catalogues and options, totalled as customers choose.', image: '', icon: 'zap' },
        { title: 'Bookings & follow-up', body: 'Live video meetings and automatic follow-up, built in.', image: '', icon: 'calendar' },
      ] }),
      sec('services', { title: 'Made for builders', items: [
        { title: 'Website builder', body: 'Pages you can edit like a document, with your tools dropped in.', image: '', link: 'page:product', icon: 'home' },
        { title: 'Live video', body: 'Meet customers face to face and present products on stage.', image: '', link: 'page:product', icon: 'star' },
        { title: 'Marketing', body: 'Posts, campaigns and replies from one inbox.', image: '', link: 'page:product', icon: 'sparkles' },
        { title: 'Genius AI', body: 'An assistant that knows your catalogue and answers day or night.', image: '', link: 'page:product', icon: 'check' },
      ] }, { align: 'center' }),
      sec('tech', { tool: 'live', title: 'Meet us live, right here', height: 720 }),
      sec('testimonials', { title: 'What teams say', items: [] }),
      faq([['Do I need a powerful computer?', 'No — everything runs in the browser, on phone, tablet and desktop.'], ['Can I use my own domain?', 'Yes — connect your domain and your site and tools live there.'], ['Can I change everything?', 'Every page, price and product is yours to edit.']]),
      sec('cta', { title: 'Start with a template', body: 'Pick a design, drop in your products, and go live this week.', ctaLabel: 'See pricing', ctaHref: 'page:pricing' }, { color: '#ffffff', gradFrom: '#1e40af', gradTo: '#2563eb', gradAngle: 135, align: 'center' }),
      contactForm('Talk to us'),
      footer(brand, 'software for teams who build.'),
    ]),
    pg('Product', 'product', [
      header(nav),
      sec('text', { title: 'The product', body: 'A tour of the workspace — design, quote, meet and market without leaving the page.' }, { align: 'center' }),
      sec('tech', { tool: 'live', title: 'Live video meetings', height: 720 }),
      sec('tech', { tool: 'socialite', title: 'Marketing, built in', height: 760 }),
      sec('columns', { title: 'Why teams switch', columns: 3, items: [
        { title: 'One login', body: 'No chain of apps duct-taped together.', image: '', icon: '' },
        { title: 'Your brand', body: 'Your domain, your colours, your catalogue.', image: '', icon: '' },
        { title: 'Help that answers', body: 'Genius knows your products and your pages.', image: '', icon: '' },
      ] }),
      contactForm('Book a walkthrough'),
      footer(brand, 'software for teams who build.'),
    ]),
    pg('Pricing', 'pricing', [
      header(nav),
      sec('text', { title: 'Pricing', body: 'Simple plans that scale with your team. Replace these with your own pricing.' }, { align: 'center' }),
      sec('pricing', { title: 'Plans', items: [
        { name: 'Starter', price: 'Custom', period: '', features: 'Website builder\nCore design tools\nLead forms', ctaLabel: 'Talk to us', ctaHref: '#contact', featured: 'no' },
        { name: 'Studio', price: 'Custom', period: '', features: 'Everything in Starter\nLive video & bookings\nMarketing suite', ctaLabel: 'Talk to us', ctaHref: '#contact', featured: 'yes' },
        { name: 'Platform', price: 'Custom', period: '', features: 'Everything in Studio\nGenius AI concierge\nAPI access', ctaLabel: 'Talk to us', ctaHref: '#contact', featured: 'no' },
      ] }),
      faq([['Can I change plans later?', 'Explain how plan changes work.'], ['Is there a contract?', 'State your terms plainly here.']]),
      contactForm('Ask about pricing'),
      footer(brand, 'software for teams who build.'),
    ]),
    pg('Contact', 'contact', [
      header(nav),
      sec('text', { title: 'Talk to us', body: 'Tell us what you build and we will show you the shortest path live.' }, { align: 'center' }),
      sec('tech', { tool: 'live', title: 'Or meet us live now', height: 700 }),
      contactForm('Send a message'),
      footer(brand, 'software for teams who build.'),
    ]),
  ] };
}

/* ---------------- The library — ONLY these templates ---------------- */
export const SITE_TEMPLATES: SiteTemplate[] = [
  { id: 'wonderlands-home', name: 'Wonderlands Home', blurb: 'The Wonderlands World main page — flagship outdoor-living site with collections, 3D studio, solar and quote pages. Fully editable.', build: (brand) => wonderlandsTemplate(brand) },
  { id: 'azure-pools', name: 'Azure Pools', blurb: 'Luxury pool builder — collection, 3D design studio and quote flow.', build: azurePools },
  { id: 'terra-gardens', name: 'Terra Gardens', blurb: 'Landscaping studio — gardens portfolio and a bed-planning tool on the page.', build: terraGardens },
  { id: 'solstice-solar', name: 'Solstice Solar', blurb: 'Solar & battery — roof tracing board and Solar Genius sizing built in.', build: solsticeSolar },
  { id: 'nordic-wellness', name: 'Nordic Wellness', blurb: 'Saunas & spas showroom — collection, configurator and showroom visit.', build: nordicWellness },
  { id: 'haven-enclosures', name: 'Haven Enclosures', blurb: 'Screen enclosures & lanais — enclosure drawing board and project gallery.', build: havenEnclosures },
  { id: 'ironwood-gates', name: 'Ironwood Gates & Fencing', blurb: 'Driveway gates and fencing — gallery-led with a design board.', build: ironwoodGates },
  { id: 'stone-pavers', name: 'Stone & Paver Co.', blurb: 'Hardscape and pool decks — 2D design studio and before/after story.', build: stonePavers },
  { id: 'outdoor-living-co', name: 'The Outdoor Living Co.', blurb: 'Full outdoor rooms — kitchens, pergolas and pools from one team.', build: outdoorLiving },
  { id: 'lumen-studio', name: 'Lumen Studio (SaaS)', blurb: 'Technology / SaaS site — product tour, live meetings, marketing and pricing pages.', build: lumenStudio },
];

export const siteTemplateById = (id: string) => SITE_TEMPLATES.find((t) => t.id === id);
