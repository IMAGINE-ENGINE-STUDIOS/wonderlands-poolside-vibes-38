/**
 * Site Builder document model — shared by the editor (SiteBuilder) and the
 * public renderer (SiteRenderer). A site = theme + pages; a page = ordered
 * sections; each section = a block type + props + style. Stored as JSON in
 * company_sites.layout ({ draft, published }) and company_sites.theme.
 * Add a block: add it to BLOCKS (defaults + inspector fields) and render it
 * in SiteRenderer. Nothing here is sample business data — defaults are
 * placeholder copy the company replaces.
 */
export type Field =
  | { key: string; label: string; kind: 'text' | 'textarea' | 'image' | 'url' | 'number' | 'color' }
  | { key: string; label: string; kind: 'select'; options: { value: string; label: string }[] }
  | { key: string; label: string; kind: 'items'; fields: Field[]; blank: Record<string, any> };

export interface SectionStyle {
  bg?: string; color?: string; bgImage?: string; bgVideo?: string; overlay?: number;
  padY?: number; align?: 'left' | 'center' | 'right'; width?: 'narrow' | 'normal' | 'wide' | 'full';
  font?: string; titleSize?: number; hidden?: boolean;
  /** V2: hide this section on one device size only. */
  hideOn?: { mobile?: boolean; tablet?: boolean; desktop?: boolean };
  /** Gradient background (overrides bg when both colours are set). */
  gradFrom?: string; gradTo?: string; gradAngle?: number; gradType?: 'linear' | 'radial';
}
export interface Section { id: string; type: BlockType; props: Record<string, any>; style: SectionStyle }
/** V2: per-page search & sharing info (optional, V1 pages keep working). */
export interface PageSeo { title?: string; description?: string; image?: string }
export interface Page { id: string; name: string; slug: string; sections: Section[]; seo?: PageSeo }
export interface SiteTheme { headingFont: string; bodyFont: string; primary: string; background: string; text: string; radius: number; logo?: string; brand?: string; phone?: string; email?: string; whatsapp?: string }
export interface SiteDoc { pages: Page[] }
/** V2: one published snapshot kept for version history (stored in layout.history). */
export interface SiteVersion { at: string; doc: SiteDoc; theme?: SiteTheme }

export const FONTS = ['Sora', 'Manrope', 'Cormorant Garamond', 'Playfair Display', 'DM Serif Display', 'Libre Baskerville', 'Lora', 'Work Sans', 'Outfit', 'Plus Jakarta Sans', 'Space Grotesk', 'Bebas Neue', 'Archivo', 'Karla', 'Fira Sans', 'Montserrat'];

export const DEFAULT_THEME: SiteTheme = { headingFont: 'Cormorant Garamond', bodyFont: 'Manrope', primary: '#0891b2', background: '#ffffff', text: '#0a0a0a', radius: 14 };

/** Wonderlands tools a company can embed. Values are stored in saved sites — never rename one;
 *  'studio' and 'design' keep their ids but now open the current 3D Studio and Global Design Board V2. */
export const TECH_TOOLS = [
  { value: 'design2d', label: 'Design Studio (2D)', path: '/design-studio' },
  { value: 'studio', label: '3D Studio', path: '/design-studio?view=3d' },
  { value: 'design', label: 'Global Design Board V2', path: '/global-design-board-v2' },
  { value: 'landscaping', label: 'Landscaping studio', path: '/landscaping' },
  { value: 'solarboard', label: 'Solar drawing board', path: '/solar-board' },
  { value: 'enclosures', label: 'Screen enclosure, lanai & fencing board', path: '/suites/enclosures' },
  { value: 'poolspa', label: 'Pool & Spa Suites', path: '/suites/pools-and-spas' },
  { value: 'blueprint', label: 'Blueprint builder', path: '/blueprint-builder' },
  { value: 'solar', label: 'Solar Genius', path: '/solar-genius' },
  { value: 'quote', label: 'Quote Atelier', path: '/quote' },
  { value: 'calculator', label: 'Pool cost calculator', path: '/pool-calculator' },
  { value: 'showroom', label: 'Studio showroom', path: '/studio-showroom' },
  { value: 'flip', label: 'FLIP book (pick below)', path: '/flip/' },
];

const item = (kind: Field['kind'], key: string, label: string) => ({ key, label, kind }) as Field;

export const BLOCKS = {
  hero: { label: 'Hero banner', group: 'Layout', props: { eyebrow: 'Your company', title: 'Outdoor living, designed for you', subtitle: 'Tell visitors what you build and where.', ctaLabel: 'Get a quote', ctaHref: '#contact', image: '', minHeight: 560 },
    fields: [item('text', 'eyebrow', 'Small label'), item('text', 'title', 'Headline'), item('textarea', 'subtitle', 'Subtitle'), item('text', 'ctaLabel', 'Button text'), item('url', 'ctaHref', 'Button link'), item('text', 'cta2Label', 'Second button text'), item('url', 'cta2Href', 'Second button link'), item('image', 'image', 'Background photo'), item('number', 'minHeight', 'Height (px)')] },
  text: { label: 'Text', group: 'Layout', props: { title: 'About us', body: 'Write your story here.' }, fields: [item('text', 'title', 'Title'), item('textarea', 'body', 'Text')] },
  image: { label: 'Image', group: 'Media', props: { src: '', caption: '', height: 480 }, fields: [item('image', 'src', 'Photo'), item('text', 'caption', 'Caption'), item('url', 'link', 'Link when clicked'), item('number', 'height', 'Height (px)')] },
  gallery: { label: 'Gallery', group: 'Media', props: { title: 'Our work', items: [] },
    fields: [item('text', 'title', 'Title'), { key: 'items', label: 'Photos', kind: 'items', blank: { src: '', caption: '', link: '' }, fields: [item('image', 'src', 'Photo'), item('text', 'caption', 'Caption'), item('url', 'link', 'Link when clicked')] }] },
  video: { label: 'Video', group: 'Media', props: { url: '', title: '' }, fields: [item('text', 'title', 'Title'), item('url', 'url', 'YouTube, Vimeo or video file link')] },
  services: { label: 'Service cards', group: 'Content', props: { title: 'What we do', items: [{ title: 'Service', body: 'Describe it.', image: '' }] },
    fields: [item('text', 'title', 'Title'), { key: 'items', label: 'Cards', kind: 'items', blank: { title: 'Service', body: '', image: '', link: '' }, fields: [item('text', 'title', 'Title'), item('textarea', 'body', 'Text'), item('image', 'image', 'Photo'), item('url', 'link', 'Link when clicked')] }] },
  products: { label: 'Product cards', group: 'Commerce', props: { title: 'Products', columns: 3, items: [] },
    fields: [item('text', 'title', 'Title'), { key: 'columns', label: 'Columns', kind: 'select', options: [2, 3, 4].map(n => ({ value: String(n), label: String(n) })) },
      { key: 'items', label: 'Products', kind: 'items', blank: { name: 'Product', price: '', description: '', image: '', badge: '', buttonLabel: 'Ask for a quote', buttonHref: '#contact', buyLabel: 'Buy now', buyLink: '' },
        fields: [item('text', 'name', 'Name'), item('text', 'price', 'Price'), item('textarea', 'description', 'Description'), item('image', 'image', 'Photo'), item('text', 'badge', 'Badge'), item('text', 'buttonLabel', 'Button text'), item('url', 'buttonHref', 'Button link'), item('text', 'buyLabel', 'Pay button text'), item('url', 'buyLink', 'Stripe payment link (https://buy.stripe.com/…)')] }] },
  /** Configurable product — same option technology as the home-page product cards (filled by configuratorPresets). */
  configurator: { label: 'Configurable product', group: 'Commerce', props: { title: '', name: '', price: '', image: '', badge: '', description: '', note: 'Price includes installation at your home address', size: '', depth: '', installation: '', warranty: '', included: '', quoteLabel: 'Instant Quote', quoteHref: '#contact', buyLabel: 'Checkout', buyLink: '', options: [] },
    fields: [item('text', 'title', 'Section title'), item('text', 'name', 'Product name'), item('text', 'price', 'Base price ($)'), item('image', 'image', 'Photo'), item('text', 'badge', 'Badge'), item('textarea', 'description', 'Description'), item('text', 'note', 'Price note'),
      item('text', 'size', 'Size'), item('text', 'depth', 'Depth'), item('text', 'installation', 'Installation time'), item('text', 'warranty', 'Warranty'), item('text', 'included', 'Included'),
      item('text', 'quoteLabel', 'Quote button text'), item('url', 'quoteHref', 'Quote button link'), item('text', 'buyLabel', 'Pay button text'), item('url', 'buyLink', 'Stripe payment link (https://buy.stripe.com/…)'),
      { key: 'options', label: 'Options & additional features', kind: 'items', blank: { group: 'Additional Features', name: 'Option', detail: '', price: '', unit: '', image: '', pick: 'many' },
        fields: [item('text', 'group', 'Group (e.g. Pool Finishes)'), item('text', 'name', 'Name'), item('text', 'detail', 'Detail'), item('text', 'price', 'Price ($)'), item('text', 'unit', 'Price unit (e.g. /sqft — not added to total)'), item('image', 'image', 'Photo'),
          { key: 'pick', label: 'Choice', kind: 'select', options: [{ value: 'one', label: 'Pick one in group' }, { value: 'many', label: 'Pick many' }] }] }] },
  testimonials: { label: 'Testimonials', group: 'Content', props: { title: 'What clients say', items: [] },
    fields: [item('text', 'title', 'Title'), { key: 'items', label: 'Quotes', kind: 'items', blank: { quote: '', name: '' }, fields: [item('textarea', 'quote', 'Quote'), item('text', 'name', 'Name')] }] },
  cta: { label: 'Call to action', group: 'Content', props: { title: 'Ready to start?', body: 'Book a free consultation.', ctaLabel: 'Contact us', ctaHref: '#contact' },
    fields: [item('text', 'title', 'Title'), item('textarea', 'body', 'Text'), item('text', 'ctaLabel', 'Button text'), item('url', 'ctaHref', 'Button link')] },
  form: { label: 'Lead form', group: 'Commerce', props: { title: 'Request a quote', body: 'We reply within one business day.', buttonLabel: 'Send', anchor: 'contact', thanks: "Thank you — we'll be in touch shortly.", redirect: '', extra: [] },
    fields: [item('text', 'title', 'Title'), item('textarea', 'body', 'Text'), item('text', 'buttonLabel', 'Button text'), item('text', 'anchor', 'Link name (#)'), item('text', 'thanks', 'Thank-you message'), item('url', 'redirect', 'After sending, go to (optional)'),
      { key: 'extra', label: 'Extra questions', kind: 'items', blank: { label: 'Question', type: 'text', options: '', required: 'no' }, fields: [item('text', 'label', 'Question'), { key: 'type', label: 'Answer type', kind: 'select', options: [{ value: 'text', label: 'Short answer' }, { value: 'select', label: 'Pick one' }, { value: 'date', label: 'Date' }] }, item('text', 'options', 'Choices (comma separated)'), { key: 'required', label: 'Required', kind: 'select', options: [{ value: 'no', label: 'No' }, { value: 'yes', label: 'Yes' }] }] }] },
  tech: { label: 'Wonderlands tool', group: 'Technology', props: { tool: 'studio', flipSlug: '', title: '', height: 760 },
    fields: [{ key: 'tool', label: 'Tool', kind: 'select', options: TECH_TOOLS.map(t => ({ value: t.value, label: t.label })) }, item('text', 'flipSlug', 'FLIP book'), item('text', 'title', 'Title'), item('number', 'height', 'Height (px)')] },
  header: { label: 'Header & menu', group: 'Layout', props: { links: [{ label: 'Home', href: 'page:' }, { label: 'Contact', href: '#contact' }], ctaLabel: 'Get a quote', ctaHref: '#contact', sticky: 'yes' },
    fields: [{ key: 'links', label: 'Menu links', kind: 'items', blank: { label: 'Link', href: '' }, fields: [item('text', 'label', 'Text'), item('url', 'href', 'Goes to')] }, item('text', 'ctaLabel', 'Button text'), item('url', 'ctaHref', 'Button link'), { key: 'sticky', label: 'Stay on top when scrolling', kind: 'select', options: [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }] }] },
  footer: { label: 'Footer', group: 'Layout', props: { text: '', links: [] }, fields: [item('textarea', 'text', 'Footer text'), { key: 'links', label: 'Links', kind: 'items', blank: { label: 'Link', href: '' }, fields: [item('text', 'label', 'Text'), item('url', 'href', 'Goes to')] }] },
  columns: { label: 'Columns', group: 'Layout', props: { title: '', columns: 3, items: [{ title: 'Column', body: 'Text', image: '' }] },
    fields: [item('text', 'title', 'Title'), { key: 'columns', label: 'Columns', kind: 'select', options: [2, 3, 4].map(n => ({ value: String(n), label: String(n) })) }, { key: 'items', label: 'Columns', kind: 'items', blank: { title: 'Column', body: '', image: '' }, fields: [item('text', 'title', 'Title'), item('textarea', 'body', 'Text'), item('image', 'image', 'Photo')] }] },
  faq: { label: 'FAQ', group: 'Content', props: { title: 'Questions & answers', items: [{ q: 'How long does a project take?', a: 'Tell visitors your usual timeline.' }] },
    fields: [item('text', 'title', 'Title'), { key: 'items', label: 'Questions', kind: 'items', blank: { q: '', a: '' }, fields: [item('text', 'q', 'Question'), item('textarea', 'a', 'Answer')] }] },
  pricing: { label: 'Pricing table', group: 'Commerce', props: { title: 'Packages', items: [{ name: 'Package', price: '', period: '', features: 'What is included', ctaLabel: 'Get a quote', ctaHref: '#contact', featured: 'no' }] },
    fields: [item('text', 'title', 'Title'), { key: 'items', label: 'Packages', kind: 'items', blank: { name: 'Package', price: '', period: '', features: '', ctaLabel: 'Get a quote', ctaHref: '#contact', featured: 'no' }, fields: [item('text', 'name', 'Name'), item('text', 'price', 'Price'), item('text', 'period', 'Per (e.g. project)'), item('textarea', 'features', 'Included (one per line)'), item('text', 'ctaLabel', 'Button text'), item('url', 'ctaHref', 'Button link'), { key: 'featured', label: 'Highlight', kind: 'select', options: [{ value: 'no', label: 'No' }, { value: 'yes', label: 'Yes' }] }] }] },
  team: { label: 'Team', group: 'Content', props: { title: 'Meet the team', items: [] },
    fields: [item('text', 'title', 'Title'), { key: 'items', label: 'People', kind: 'items', blank: { name: '', role: '', bio: '', photo: '' }, fields: [item('text', 'name', 'Name'), item('text', 'role', 'Role'), item('textarea', 'bio', 'Short bio'), item('image', 'photo', 'Photo')] }] },
  stats: { label: 'Numbers', group: 'Content', props: { title: '', items: [{ value: '', label: 'Projects completed' }] },
    fields: [item('text', 'title', 'Title'), { key: 'items', label: 'Numbers', kind: 'items', blank: { value: '', label: '' }, fields: [item('text', 'value', 'Number'), item('text', 'label', 'Label')] }] },
  logos: { label: 'Logo strip', group: 'Content', props: { title: 'Brands we install', items: [] },
    fields: [item('text', 'title', 'Title'), { key: 'items', label: 'Logos', kind: 'items', blank: { name: '', logo: '', link: '' }, fields: [item('text', 'name', 'Name'), item('image', 'logo', 'Logo'), item('url', 'link', 'Link')] }] },
  posts: { label: 'Blog / news', group: 'Content', props: { title: 'Latest news', items: [] },
    fields: [item('text', 'title', 'Title'), { key: 'items', label: 'Posts', kind: 'items', blank: { title: 'Post', date: '', excerpt: '', image: '', link: '' }, fields: [item('text', 'title', 'Title'), item('text', 'date', 'Date'), item('textarea', 'excerpt', 'Summary'), item('image', 'image', 'Photo'), item('url', 'link', 'Read more link')] }] },
  beforeafter: { label: 'Before / after', group: 'Media', props: { title: 'The transformation', before: '', after: '', height: 480 }, fields: [item('text', 'title', 'Title'), item('image', 'before', 'Before photo'), item('image', 'after', 'After photo'), item('number', 'height', 'Height (px)')] },
  map: { label: 'Map', group: 'Media', props: { title: 'Find us', address: '', height: 380, lat: null, lng: null, zoom: 15 }, fields: [item('text', 'title', 'Title'), item('text', 'address', 'Address or city'), item('number', 'height', 'Height (px)')] },
  booking: { label: 'Booking', group: 'Commerce', props: { title: 'Book a consultation', body: '', url: '', height: 700 }, fields: [item('text', 'title', 'Title'), item('textarea', 'body', 'Text'), item('url', 'url', 'Calendly or booking link'), item('number', 'height', 'Height (px)')] },
  embed: { label: 'Embed', group: 'Technology', props: { url: '', height: 500, title: '' }, fields: [item('text', 'title', 'Title'), item('url', 'url', 'Page to embed (https://…)'), item('number', 'height', 'Height (px)')] },
  spacer: { label: 'Spacer', group: 'Layout', props: { height: 64 }, fields: [item('number', 'height', 'Height (px)')] },
} satisfies Record<string, { label: string; group: string; props: Record<string, any>; fields: Field[] }>;
export type BlockType = keyof typeof BLOCKS;

/**
 * Layout modes per block — genuinely different compositions drawn by
 * SiteRenderer (not colour swaps). Injected as the FIRST inspector field of
 * each block so the layout heads the Section tab, and Genius sees it too.
 */
export const BLOCK_LAYOUTS: Partial<Record<BlockType, { value: string; label: string }[]>> = {
  hero: [{ value: 'stack', label: 'Stacked' }, { value: 'split', label: 'Split — image right' }, { value: 'card', label: 'Glass card over photo' }, { value: 'bottom', label: 'Bottom over photo' }],
  header: [{ value: 'bar', label: 'Bar' }, { value: 'centered', label: 'Centred logo' }],
  footer: [{ value: 'classic', label: 'Classic' }, { value: 'centered', label: 'Centred' }, { value: 'stacked', label: 'Big brand stacked' }],
  text: [{ value: 'standard', label: 'Standard' }, { value: 'lead', label: 'Large lead + drop cap' }, { value: 'quote', label: 'Big quote' }, { value: 'twocol', label: 'Two columns' }],
  services: [{ value: 'grid', label: 'Grid' }, { value: 'cards', label: 'Cards' }, { value: 'rows', label: 'Alternating rows' }, { value: 'numbered', label: 'Numbered list' }],
  products: [{ value: 'grid', label: 'Grid' }, { value: 'list', label: 'List rows' }],
  testimonials: [{ value: 'grid', label: 'Grid' }, { value: 'cards', label: 'Cards' }, { value: 'spotlight', label: 'Spotlight quote' }],
  cta: [{ value: 'band', label: 'Band' }, { value: 'card', label: 'Floating card' }, { value: 'split', label: 'Split — button right' }],
  form: [{ value: 'stacked', label: 'Stacked' }, { value: 'card', label: 'Card' }, { value: 'split', label: 'Split — form right' }],
  gallery: [{ value: 'grid', label: 'Grid' }, { value: 'strip', label: 'Film strip' }, { value: 'masonry', label: 'Masonry' }],
  columns: [{ value: 'grid', label: 'Grid' }, { value: 'cards', label: 'Cards' }],
  faq: [{ value: 'accordion', label: 'Accordion' }, { value: 'twocol', label: 'Two-column Q&A' }, { value: 'cards', label: 'Cards' }],
  pricing: [{ value: 'cards', label: 'Cards' }, { value: 'rows', label: 'Rows' }],
  team: [{ value: 'grid', label: 'Grid' }, { value: 'cards', label: 'Cards' }, { value: 'round', label: 'Round photos' }],
  stats: [{ value: 'row', label: 'Row' }, { value: 'dividers', label: 'Dividers' }, { value: 'big', label: 'Big centred' }],
  logos: [{ value: 'strip', label: 'Strip' }, { value: 'grid', label: 'Grid cells' }],
  posts: [{ value: 'grid', label: 'Grid' }, { value: 'list', label: 'List rows' }],
  image: [{ value: 'standard', label: 'Standard' }, { value: 'framed', label: 'Framed' }, { value: 'overlay', label: 'Caption overlay' }],
};
for (const [t, options] of Object.entries(BLOCK_LAYOUTS)) {
  const b = (BLOCKS as any)[t];
  if (b && !(b.fields as Field[]).some((f) => f.key === 'layout')) b.fields = [{ key: 'layout', label: 'Layout', kind: 'select', options } as Field, ...b.fields];
}

export const uid = () => Math.random().toString(36).slice(2, 10);
export const newSection = (type: BlockType): Section => ({ id: uid(), type, props: structuredClone(BLOCKS[type].props), style: type === 'hero' ? { color: '#ffffff', bg: '#0a0a0a', overlay: 40, align: 'center', width: 'full' } : {} });
/** Gradient presets for the chromatic controller. */
export const GRADIENTS = [
  { name: 'Ocean', from: '#0891b2', to: '#0e7490' }, { name: 'Sunset', from: '#f97066', to: '#fbbf24' },
  { name: 'Obsidian', from: '#0a0a0a', to: '#1f2937' }, { name: 'Sand', from: '#faf7f2', to: '#e7dccb' },
  { name: 'Lagoon', from: '#ecfeff', to: '#a5f3fc' }, { name: 'Coral reef', from: '#0891b2', to: '#f97066' },
];

/** Link values: 'page:<slug>' (site page, '' = home), '#anchor', 'tel:', 'mailto:', 'https://wa.me/…' or any URL. */
export const resolveLink = (href: string | undefined, pageHref: (slug: string) => string) =>
  !href ? '' : href.startsWith('page:') ? pageHref(href.slice(5)) : href;

export const blankDoc = (): SiteDoc => ({ pages: [{ id: uid(), name: 'Home', slug: '', sections: [newSection('hero'), newSection('services'), newSection('form')] }] });

/** Shrinks an uploaded photo to WebP (max 1600px) so pages stay fast. */
export async function compressImage(file: File, max = 1600): Promise<string> {
  const bmp = await createImageBitmap(file);
  const s = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const c = document.createElement('canvas'); c.width = Math.round(bmp.width * s); c.height = Math.round(bmp.height * s);
  c.getContext('2d')!.drawImage(bmp, 0, 0, c.width, c.height);
  return c.toDataURL('image/webp', 0.82);
}

export function loadFonts(theme: SiteTheme) {
  const fams = [theme.headingFont, theme.bodyFont].filter((f, i, a) => f && a.indexOf(f) === i);
  const id = 'sb-fonts-' + fams.join('-').replace(/\s/g, '');
  if (typeof document === 'undefined' || document.getElementById(id)) return;
  const l = document.createElement('link'); l.id = id; l.rel = 'stylesheet';
  l.href = `https://fonts.googleapis.com/css2?${fams.map(f => `family=${f.replace(/ /g, '+')}:wght@300;400;600;700`).join('&')}&display=swap`;
  document.head.appendChild(l);
}
