import type { BlockType, SectionStyle } from './model';

/**
 * Style galleries v2 — every variant is a genuinely different DESIGN, built on
 * the renderer's layout modes (split heroes, numbered services, film-strip
 * galleries, row pricing…) combined with palette, spacing and typography
 * treatments. A variant is still just props + style on a normal section, so
 * everything it inserts stays fully editable in the inspector afterwards.
 */
export interface BlockVariant { name: string; hint: string; props?: Record<string, any>; style?: Partial<SectionStyle>; /** Configurator only: steers which real catalogue product + options hydrate in. */ product?: string }

const dark: Partial<SectionStyle> = { bg: '#0b0b0f', color: '#f4f4f5' };
const ink: Partial<SectionStyle> = { bg: '#111827', color: '#f9fafb' };
const royal: Partial<SectionStyle> = { gradFrom: '#1d4ed8', gradTo: '#0ea5e9', gradAngle: 120, color: '#ffffff' };
const lagoon: Partial<SectionStyle> = { gradFrom: '#0e7490', gradTo: '#2dd4bf', gradAngle: 120, color: '#ffffff' };
const sunset: Partial<SectionStyle> = { gradFrom: '#7c2d12', gradTo: '#db2777', gradAngle: 125, color: '#ffffff' };
const gold: Partial<SectionStyle> = { bg: '#0c0a09', color: '#f5efe4', titleColor: '#d4af37' };
const sand: Partial<SectionStyle> = { bg: '#faf6ef', color: '#292524' };
const mist: Partial<SectionStyle> = { bg: '#eef2f7', color: '#0f172a' };
const paper: Partial<SectionStyle> = { bg: '#ffffff', color: '#111827' };
const left: Partial<SectionStyle> = { align: 'left' };
const centre: Partial<SectionStyle> = { align: 'center' };
const airy: Partial<SectionStyle> = { padY: 124 };
const snug: Partial<SectionStyle> = { padY: 44 };
const wide: Partial<SectionStyle> = { width: 'wide' };
const narrow: Partial<SectionStyle> = { width: 'narrow' };

export const BLOCK_VARIANTS: Partial<Record<BlockType, BlockVariant[]>> = {
  hero: [
    { name: 'Split Studio', hint: 'Headline left, big photo right — the modern agency hero', props: { layout: 'split', minHeight: 520 }, style: { ...left, ...airy } },
    { name: 'Glass Card over Photo', hint: 'Frosted glass panel floating on the photo', props: { layout: 'card', minHeight: 620 }, style: { ...centre, overlay: 22 } },
    { name: 'Cinematic Bottom-Left', hint: 'Full-bleed photo, headline anchored bottom-left', props: { layout: 'bottom', minHeight: 680 }, style: { ...left, overlay: 38 } },
    { name: 'Centered Classic Dark', hint: 'Stacked and centred on near-black', props: { layout: 'stack', titleSize: 84 }, style: { ...dark, ...centre, ...airy } },
    { name: 'Royal Gradient Stack', hint: 'Royal blue gradient, centred, generous air', props: { layout: 'stack', titleSize: 80 }, style: { ...royal, ...centre, ...airy } },
    { name: 'Split on Sand', hint: 'Warm paper split hero, editorial calm', props: { layout: 'split', minHeight: 500 }, style: { ...sand, ...left, ...airy } },
    { name: 'Luxury Gold Bottom', hint: 'Gold serif headline over a dark photo', props: { layout: 'bottom', titleSize: 78, minHeight: 660 }, style: { ...gold, ...left, overlay: 26 } },
    { name: 'Glass Card Royal', hint: 'Glass panel over a royal gradient', props: { layout: 'card', minHeight: 600 }, style: { ...royal, ...centre } },
    { name: 'Poster Type', hint: 'Huge type, nothing else — fashion-poster energy', props: { layout: 'stack', titleSize: 104, minHeight: 640 }, style: { ...paper, ...centre, ...airy } },
    { name: 'Split Compact', hint: 'Tighter split for inner pages', props: { layout: 'split', minHeight: 420 }, style: { ...left, ...snug } },
    { name: 'Sunset Stack', hint: 'Warm dusk gradient, centred', props: { layout: 'stack', titleSize: 76 }, style: { ...sunset, ...centre, ...airy } },
    { name: 'Bottom Bar Minimal', hint: 'Photo first, quiet headline at the base', props: { layout: 'bottom', titleSize: 56, minHeight: 560 }, style: { ...left, overlay: 30 } },
  ],
  header: [
    { name: 'Centred Logo Bar', hint: 'Logo centred above the links — boutique style', props: { layout: 'centered' }, style: { ...snug } },
    { name: 'Dark Bar', hint: 'Classic bar on near-black', props: { layout: 'bar' }, style: { ...dark, ...snug } },
    { name: 'Centred on Dark', hint: 'Centred masthead, dark', props: { layout: 'centered' }, style: { ...dark, ...snug } },
    { name: 'Slim Light Bar', hint: 'Short, quiet, lots of air', props: { layout: 'bar' }, style: { padY: 16 } },
    { name: 'Centred Royal', hint: 'Centred logo over royal blue', props: { layout: 'centered' }, style: { ...royal, ...snug } },
    { name: 'Call Header', hint: 'Bar with a Call now button', props: { layout: 'bar', ctaLabel: 'Call now', ctaHref: 'tel:' }, style: { ...snug } },
    { name: 'Quote Header', hint: 'Bar ending in Free quote', props: { layout: 'bar', ctaLabel: 'Free quote', ctaHref: 'page:' }, style: { ...snug } },
    { name: 'Booking Header', hint: 'Bar ending in Book online', props: { layout: 'bar', ctaLabel: 'Book online', ctaHref: 'page:booking' }, style: { ...snug } },
    { name: 'Centred Booking', hint: 'Centred masthead with booking button', props: { layout: 'centered', ctaLabel: 'Book now', ctaHref: 'page:booking' }, style: { ...snug } },
    { name: 'No-Button Bar', hint: 'Links only, editorial', props: { layout: 'bar', ctaLabel: '' }, style: { ...snug } },
  ],
  footer: [
    { name: 'Big Brand Stack', hint: 'Oversized brand name over the footer — very current', props: { layout: 'stacked' }, style: { ...dark, ...airy } },
    { name: 'Centred Footer', hint: 'Everything centred, calm and minimal', props: { layout: 'centered' }, style: { ...snug } },
    { name: 'Big Brand Light', hint: 'Huge brand type on paper white', props: { layout: 'stacked' }, style: { ...paper, ...airy } },
    { name: 'Centred Royal', hint: 'Centred, on royal blue', props: { layout: 'centered' }, style: { ...royal } },
    { name: 'Classic Dark', hint: 'The standard two-column footer, dark', props: { layout: 'classic' }, style: { ...dark } },
    { name: 'Centred Gold', hint: 'Centred on black with gold brand', props: { layout: 'centered' }, style: { ...gold } },
    { name: 'Classic Sand', hint: 'Standard footer on warm sand', props: { layout: 'classic' }, style: { ...sand } },
    { name: 'Big Brand Ink', hint: 'Huge type on deep ink blue', props: { layout: 'stacked' }, style: { ...ink, ...airy } },
  ],
  text: [
    { name: 'Editorial Lead', hint: 'Large type with a drop cap — magazine open', props: { layout: 'lead' }, style: { ...narrow, ...airy } },
    { name: 'Manifesto Quote', hint: 'The text becomes a giant centred quote', props: { layout: 'quote' }, style: { ...centre, ...airy } },
    { name: 'Two-Column Story', hint: 'Newspaper two-column body', props: { layout: 'twocol' }, style: { ...wide } },
    { name: 'Quote on Dark', hint: 'Big quote on near-black', props: { layout: 'quote' }, style: { ...dark, ...centre, ...airy } },
    { name: 'Lead on Sand', hint: 'Drop-cap lead on warm paper', props: { layout: 'lead' }, style: { ...sand, ...narrow } },
    { name: 'Narrow Standard', hint: 'Classic readable measure', props: { layout: 'standard' }, style: { ...narrow } },
    { name: 'Quote Royal', hint: 'Manifesto on royal blue', props: { layout: 'quote' }, style: { ...royal, ...centre } },
    { name: 'Two-Column Mist', hint: 'Columns on cool mist', props: { layout: 'twocol' }, style: { ...mist, ...wide } },
  ],
  services: [
    { name: 'Alternating Rows', hint: 'Photo and text alternate down the page — storytelling', props: { layout: 'rows' }, style: { ...left, ...airy } },
    { name: 'Numbered Index', hint: '01 02 03 — the architecture-studio list', props: { layout: 'numbered' }, style: { ...left, ...narrow } },
    { name: 'Soft Cards', hint: 'Bordered cards with photos', props: { layout: 'cards' }, style: { ...mist } },
    { name: 'Cards on Dark', hint: 'Photo cards on near-black', props: { layout: 'cards' }, style: { ...dark } },
    { name: 'Rows on Sand', hint: 'Alternating rows, warm and calm', props: { layout: 'rows' }, style: { ...sand, ...left } },
    { name: 'Numbered on Ink', hint: 'Index list on deep ink', props: { layout: 'numbered' }, style: { ...ink, ...left } },
    { name: 'Classic Photo Grid', hint: 'The familiar three-up grid', props: { layout: 'grid' }, style: {} },
    { name: 'Cards Royal Edge', hint: 'Cards under a royal band heading', props: { layout: 'cards' }, style: { ...royal } },
  ],
  products: [
    { name: 'List Rows', hint: 'Horizontal product rows — catalogue feel', props: { layout: 'list' }, style: { ...narrow } },
    { name: 'Wide Grid', hint: 'Full-width product grid', props: { layout: 'grid' }, style: { ...wide } },
    { name: 'List on Mist', hint: 'Rows on cool mist', props: { layout: 'list' }, style: { ...mist } },
    { name: 'Grid on Dark', hint: 'White product cards pop on black', props: { layout: 'grid' }, style: { ...dark } },
    { name: 'Two-Up Grid', hint: 'Two large products per row', props: { layout: 'grid', columns: 2 }, style: { ...wide } },
    { name: 'Four-Up Grid', hint: 'Dense catalogue, four per row', props: { layout: 'grid', columns: 4 }, style: { ...wide } },
    { name: 'List Compact', hint: 'Rows, tight spacing', props: { layout: 'list' }, style: { ...narrow, ...snug } },
    { name: 'Grid Airy', hint: 'Standard grid, generous air', props: { layout: 'grid' }, style: { ...airy } },
  ],
  testimonials: [
    { name: 'Spotlight Quote', hint: 'One huge hero quote, the rest below', props: { layout: 'spotlight' }, style: { ...centre, ...airy } },
    { name: 'Quote Cards', hint: 'Each review in its own card', props: { layout: 'cards' }, style: { ...mist } },
    { name: 'Spotlight on Dark', hint: 'Hero quote on near-black', props: { layout: 'spotlight' }, style: { ...dark, ...centre } },
    { name: 'Cards on Sand', hint: 'Warm testimonial cards', props: { layout: 'cards' }, style: { ...sand } },
    { name: 'Classic Grid', hint: 'Serif quotes, two-up', props: { layout: 'grid' }, style: {} },
    { name: 'Spotlight Royal', hint: 'Hero quote on royal gradient', props: { layout: 'spotlight' }, style: { ...royal, ...centre } },
  ],
  cta: [
    { name: 'Floating Card', hint: 'A primary-colour card floating on the page', props: { layout: 'card' }, style: { ...airy } },
    { name: 'Split CTA', hint: 'Words left, button right — one line of force', props: { layout: 'split' }, style: { ...left, ...wide } },
    { name: 'Royal Band', hint: 'Full-width royal gradient band', props: { layout: 'band' }, style: { ...royal, ...centre, ...airy } },
    { name: 'Floating Card on Dark', hint: 'Bright card on a black section', props: { layout: 'card' }, style: { ...dark, ...airy } },
    { name: 'Split on Sand', hint: 'Split CTA, warm paper', props: { layout: 'split' }, style: { ...sand, ...left } },
    { name: 'Dark Band', hint: 'Centred band on near-black', props: { layout: 'band' }, style: { ...dark, ...centre } },
    { name: 'Lagoon Band', hint: 'Teal gradient band', props: { layout: 'band' }, style: { ...lagoon, ...centre } },
    { name: 'Split Compact', hint: 'Tight split for mid-page', props: { layout: 'split' }, style: { ...left, ...snug } },
  ],
  form: [
    { name: 'Split Form', hint: 'Story left, form right — converts best', props: { layout: 'split' }, style: { ...left, ...wide } },
    { name: 'Card Form', hint: 'White card form with a soft shadow', props: { layout: 'card' }, style: { ...mist } },
    { name: 'Card on Royal', hint: 'White card floating on royal blue', props: { layout: 'card' }, style: { ...royal, ...centre } },
    { name: 'Split on Dark', hint: 'Split form on near-black', props: { layout: 'split' }, style: { ...dark, ...left } },
    { name: 'Card on Ink', hint: 'Card form on deep ink', props: { layout: 'card' }, style: { ...ink, ...centre } },
    { name: 'Classic Narrow', hint: 'Centred stacked form', props: { layout: 'stacked' }, style: { ...narrow } },
    { name: 'Split on Sand', hint: 'Split, warm and friendly', props: { layout: 'split' }, style: { ...sand, ...left } },
    { name: 'Compact Quote Form', hint: 'Small form, less scroll', props: { layout: 'stacked', submitLabel: 'Get my free quote' }, style: { ...narrow, ...snug } },
  ],
  gallery: [
    { name: 'Film Strip', hint: 'Horizontally scrolling photo strip', props: { layout: 'strip' }, style: { ...wide } },
    { name: 'Masonry', hint: 'Pinterest-style mixed heights', props: { layout: 'masonry' }, style: { ...wide } },
    { name: 'Masonry on Dark', hint: 'Mixed heights on black — gallery night', props: { layout: 'masonry' }, style: { ...dark, ...wide } },
    { name: 'Strip on Mist', hint: 'Film strip on cool grey', props: { layout: 'strip' }, style: { ...mist, ...wide } },
    { name: 'Classic Grid', hint: 'Even three-up grid', props: { layout: 'grid' }, style: {} },
    { name: 'Masonry Airy', hint: 'Masonry with big breathing room', props: { layout: 'masonry' }, style: { ...airy, ...wide } },
  ],
  columns: [
    { name: 'Cards', hint: 'Columns as soft cards', props: { layout: 'cards' }, style: { ...mist } },
    { name: 'Cards on Dark', hint: 'Cards on near-black', props: { layout: 'cards' }, style: { ...dark } },
    { name: 'Four Columns', hint: 'Four-up feature row', props: { layout: 'grid', columns: 4 }, style: { ...wide } },
    { name: 'Two Columns', hint: 'Two large columns', props: { layout: 'grid', columns: 2 }, style: {} },
    { name: 'Cards on Sand', hint: 'Warm cards', props: { layout: 'cards' }, style: { ...sand } },
    { name: 'Classic Grid', hint: 'Plain three-up', props: { layout: 'grid' }, style: {} },
  ],
  faq: [
    { name: 'Two-Column Q&A', hint: 'All answers open, side by side — scannable', props: { layout: 'twocol' }, style: { ...wide } },
    { name: 'Answer Cards', hint: 'Each Q&A in a card', props: { layout: 'cards' }, style: { ...mist } },
    { name: 'Two-Column on Dark', hint: 'Open Q&A on near-black', props: { layout: 'twocol' }, style: { ...dark, ...wide } },
    { name: 'Classic Accordion', hint: 'Tap to open, one at a time', props: { layout: 'accordion' }, style: { ...narrow } },
    { name: 'Cards on Sand', hint: 'Warm answer cards', props: { layout: 'cards' }, style: { ...sand } },
    { name: 'Accordion Wide', hint: 'Accordion, full width', props: { layout: 'accordion' }, style: { ...wide } },
  ],
  pricing: [
    { name: 'Price Rows', hint: 'Editorial price list — name, features, price, button', props: { layout: 'rows' }, style: { ...narrow, ...airy } },
    { name: 'Rows on Dark', hint: 'Price list on near-black', props: { layout: 'rows' }, style: { ...dark, ...narrow } },
    { name: 'Cards on Mist', hint: 'Classic cards on cool grey', props: { layout: 'cards' }, style: { ...mist } },
    { name: 'Rows on Sand', hint: 'Warm editorial list', props: { layout: 'rows' }, style: { ...sand, ...narrow } },
    { name: 'Classic Cards', hint: 'The standard three cards', props: { layout: 'cards' }, style: {} },
    { name: 'Cards Royal', hint: 'Cards under a royal band', props: { layout: 'cards' }, style: { ...royal } },
  ],
  team: [
    { name: 'Round Portraits', hint: 'Circular photos — friendly and modern', props: { layout: 'round' }, style: { ...centre } },
    { name: 'Team Cards', hint: 'Portraits in soft cards', props: { layout: 'cards' }, style: { ...mist } },
    { name: 'Round on Dark', hint: 'Circles on near-black', props: { layout: 'round' }, style: { ...dark, ...centre } },
    { name: 'Cards on Sand', hint: 'Warm team cards', props: { layout: 'cards' }, style: { ...sand } },
    { name: 'Classic Grid', hint: 'Square portraits, four-up', props: { layout: 'grid' }, style: {} },
    { name: 'Round Airy', hint: 'Circles, generous spacing', props: { layout: 'round' }, style: { ...centre, ...airy } },
  ],
  stats: [
    { name: 'Divider Stats', hint: 'Numbers with accent rules — annual-report style', props: { layout: 'dividers' }, style: { ...left } },
    { name: 'Giant Numbers', hint: 'Huge centred figures', props: { layout: 'big' }, style: { ...centre, ...airy } },
    { name: 'Giants on Royal', hint: 'Huge numbers on royal blue', props: { layout: 'big' }, style: { ...royal, ...centre } },
    { name: 'Dividers on Dark', hint: 'Ruled stats on black', props: { layout: 'dividers' }, style: { ...dark, ...left } },
    { name: 'Classic Row', hint: 'Standard stat row', props: { layout: 'row' }, style: {} },
    { name: 'Giants on Ink', hint: 'Huge figures on deep ink', props: { layout: 'big' }, style: { ...ink, ...centre } },
  ],
  logos: [
    { name: 'Logo Grid', hint: 'Bordered cells — partner wall', props: { layout: 'grid' }, style: { ...wide } },
    { name: 'Grid on Dark', hint: 'Partner wall on black', props: { layout: 'grid' }, style: { ...dark, ...wide } },
    { name: 'Classic Strip', hint: 'One centred row of logos', props: { layout: 'strip' }, style: {} },
    { name: 'Grid on Mist', hint: 'Cells on cool grey', props: { layout: 'grid' }, style: { ...mist, ...wide } },
    { name: 'Quiet Strip', hint: 'Small, low-key strip', props: { layout: 'strip' }, style: { ...snug } },
  ],
  posts: [
    { name: 'Article List', hint: 'Rows with thumbnails — magazine index', props: { layout: 'list' }, style: { ...narrow } },
    { name: 'List on Sand', hint: 'Warm article rows', props: { layout: 'list' }, style: { ...sand, ...narrow } },
    { name: 'Classic Grid', hint: 'Three-up post cards', props: { layout: 'grid' }, style: {} },
    { name: 'List Wide', hint: 'Rows, full width', props: { layout: 'list' }, style: { ...wide } },
    { name: 'Grid on Mist', hint: 'Post grid on grey', props: { layout: 'grid' }, style: { ...mist } },
  ],
  image: [
    { name: 'Framed Photo', hint: 'White gallery frame with shadow', props: { layout: 'framed' }, style: { ...narrow } },
    { name: 'Caption Overlay', hint: 'Caption inside the photo, bottom gradient', props: { layout: 'overlay' }, style: { ...left } },
    { name: 'Full-Width Photo', hint: 'Edge-to-edge image band', props: { layout: 'standard', height: 560 }, style: { width: 'full', padY: 0 } },
    { name: 'Framed Wide', hint: 'Framed, wide measure', props: { layout: 'framed' }, style: { ...wide } },
    { name: 'Overlay Centred', hint: 'Overlay caption, centred measure', props: { layout: 'overlay' }, style: { ...narrow } },
    { name: 'Tall Portrait', hint: 'Standard photo, taller crop', props: { layout: 'standard', height: 640 }, style: { ...narrow } },
  ],
  map: [
    { name: 'Wide Map', hint: 'Full-width map band', props: { height: 420 }, style: { width: 'full', padY: 0 } },
    { name: 'Map on Mist', hint: 'Map inside a grey section', props: {}, style: { ...mist } },
    { name: 'Compact Map', hint: 'Shorter map', props: { height: 300 }, style: {} },
  ],
  video: [
    { name: 'Wide Cinema', hint: 'Full-width 21:9 stage', props: { ratio: '21:9' }, style: { width: 'full', padY: 0 } },
    { name: 'Video on Dark', hint: 'Player on near-black', props: {}, style: { ...dark } },
    { name: 'Narrow Player', hint: 'Centred, modest size', props: {}, style: { ...narrow } },
  ],
  beforeafter: [
    { name: 'Slider on Dark', hint: 'Comparison slider on black', props: {}, style: { ...dark } },
    { name: 'Slider Wide', hint: 'Full measure comparison', props: {}, style: { ...wide } },
  ],
  booking: [
    { name: 'Consultation — Standard', hint: 'Title, intro line and the full booking frame', props: { title: 'Book a consultation', body: 'Pick a time that works for you — we confirm within one business day.', height: 700 }, style: {} },
    { name: 'Compact Booking', hint: 'Shorter frame for mid-page', props: { title: 'Book now', height: 560 }, style: { ...narrow, ...snug } },
    { name: 'Tall Scheduler', hint: 'Full-height frame, nothing gets cut off', props: { title: 'Schedule your visit', height: 900 }, style: { ...wide } },
    { name: 'Booking on Royal', hint: 'Booking frame under a royal heading band', props: { title: 'Book a consultation', height: 700 }, style: { ...royal, ...centre } },
    { name: 'Booking on Mist', hint: 'Quiet grey section, frame stands out', props: { title: 'Book a consultation', height: 700 }, style: { ...mist } },
    { name: 'Site Visit Booking', hint: 'Wording for on-site estimates', props: { title: 'Book a site visit', body: 'We come to you, measure up and quote on the spot.', height: 700 }, style: { ...left } },
  ],
  configurator: [
    { name: 'Pool Studio', hint: 'A pool with finishes, liners, pavers, covers and heaters', props: {}, product: 'pool', style: { ...wide } },
    { name: 'Pool Studio on Dark', hint: 'The pool configurator on near-black', props: {}, product: 'pool', style: { ...dark, ...wide } },
    { name: 'Sauna Studio', hint: 'A sauna with its real options', props: {}, product: 'sauna', style: { ...wide } },
    { name: 'Solar Studio', hint: 'A solar product with its real options', props: {}, product: 'solar', style: { ...wide } },
    { name: 'Enclosure Studio', hint: 'Screen enclosure / lanai product', props: {}, product: 'enclosure', style: { ...wide } },
    { name: 'Spa Studio', hint: 'A spa / hot tub product', props: {}, product: 'spa', style: { ...wide } },
    { name: 'Any Product', hint: 'First catalogue product — rename it in the Section tab', props: {}, product: '', style: { ...wide } },
  ],
  tech: [
    { name: 'Design Studio (2D)', hint: 'The 2D design studio, embedded live', props: { tool: 'design2d', title: 'Design Studio', height: 760 }, style: { ...wide } },
    { name: '3D Studio', hint: 'The 3D design studio, embedded live', props: { tool: 'studio', title: '3D Design Studio', height: 820 }, style: { ...wide } },
    { name: 'Global Design Board', hint: 'Design Board V2, embedded live', props: { tool: 'design', title: 'Design Board', height: 820 }, style: { ...wide } },
    { name: 'Landscaping Studio', hint: 'Landscaping planner, embedded live', props: { tool: 'landscaping', title: 'Landscaping Studio', height: 760 }, style: { ...wide } },
    { name: 'Solar Drawing Board', hint: 'Solar layout board, embedded live', props: { tool: 'solarboard', title: 'Solar Drawing Board', height: 760 }, style: { ...wide } },
    { name: 'Enclosures Board', hint: 'Screen enclosure, lanai and fencing board', props: { tool: 'enclosures', title: 'Enclosures & Lanai Board', height: 760 }, style: { ...wide } },
    { name: 'Pool & Spa Suites', hint: 'Pool and spa suite planner', props: { tool: 'poolspa', title: 'Pool & Spa Suites', height: 760 }, style: { ...wide } },
    { name: 'Blueprint Builder', hint: 'Blueprint builder, embedded live', props: { tool: 'blueprint', title: 'Blueprint Builder', height: 820 }, style: { ...wide } },
    { name: 'Solar Genius', hint: 'Solar Genius tool, embedded live', props: { tool: 'solar', title: 'Solar Genius', height: 760 }, style: { ...wide } },
    { name: 'Quote Atelier', hint: 'The instant quote tool, embedded live', props: { tool: 'quote', title: 'Get an Instant Quote', height: 760 }, style: { ...wide } },
    { name: 'Pool Cost Calculator', hint: 'Pool cost calculator, embedded live', props: { tool: 'calculator', title: 'What Does a Pool Cost?', height: 700 }, style: { ...wide } },
    { name: 'Studio Showroom', hint: 'The studio showroom, embedded live', props: { tool: 'showroom', title: 'Studio Showroom', height: 760 }, style: { ...wide } },
    { name: 'FLIP Book', hint: 'A FLIP catalogue — pick the book in the Section tab', props: { tool: 'flip', title: 'Browse the Catalogue', height: 820 }, style: { ...wide } },
    { name: '3D Studio on Dark', hint: 'The 3D studio framed by a dark section', props: { tool: 'studio', title: '3D Design Studio', height: 820 }, style: { ...dark, ...wide } },
  ],
  embed: [
    { name: 'Page Embed — Standard', hint: 'Any https page in a rounded frame', props: { height: 500 }, style: {} },
    { name: 'Tall Embed', hint: 'Full documents, maps and portals', props: { height: 800 }, style: { ...wide } },
    { name: 'Compact Embed', hint: 'Widgets and small tools', props: { height: 360 }, style: { ...narrow } },
    { name: 'Full-Bleed Embed', hint: 'Edge to edge, no margins', props: { height: 640 }, style: { width: 'full', padY: 0 } },
    { name: 'Embed on Mist', hint: 'Frame on cool grey', props: { height: 500 }, style: { ...mist } },
    { name: 'Embed on Dark', hint: 'Frame on near-black', props: { height: 500 }, style: { ...dark } },
  ],
  spacer: [
    { name: 'Small Gap', hint: '40px of air', props: { height: 40 }, style: {} },
    { name: 'Large Gap', hint: '140px of air', props: { height: 140 }, style: {} },
  ],
};

/** The gallery list for a block: a plain "Classic" entry first, then its designs. */
export function variantsFor(type: BlockType): BlockVariant[] {
  return [{ name: 'Classic (plain)', hint: 'The standard block, unstyled' }, ...(BLOCK_VARIANTS[type] || [])];
}
