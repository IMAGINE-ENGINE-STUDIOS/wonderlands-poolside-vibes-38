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
  /** Gradient background (overrides bg when both colours are set). */
  gradFrom?: string; gradTo?: string; gradAngle?: number; gradType?: 'linear' | 'radial';
}
export interface Section { id: string; type: BlockType; props: Record<string, any>; style: SectionStyle }
export interface Page { id: string; name: string; slug: string; sections: Section[] }
export interface SiteTheme { headingFont: string; bodyFont: string; primary: string; background: string; text: string; radius: number; logo?: string; brand?: string; phone?: string; email?: string; whatsapp?: string }
export interface SiteDoc { pages: Page[] }

export const FONTS = ['Sora', 'Manrope', 'Cormorant Garamond', 'Playfair Display', 'DM Serif Display', 'Libre Baskerville', 'Lora', 'Work Sans', 'Outfit', 'Plus Jakarta Sans', 'Space Grotesk', 'Bebas Neue', 'Archivo', 'Karla', 'Fira Sans', 'Montserrat'];

export const DEFAULT_THEME: SiteTheme = { headingFont: 'Cormorant Garamond', bodyFont: 'Manrope', primary: '#0891b2', background: '#ffffff', text: '#0a0a0a', radius: 14 };

export const TECH_TOOLS = [
  { value: 'studio', label: '3D Pool & Spa Studio', path: '/wonderlands-studio' },
  { value: 'solar', label: 'Solar Genius', path: '/solar-genius' },
  { value: 'quote', label: 'Quote Atelier', path: '/quote' },
  { value: 'calculator', label: 'Pool cost calculator', path: '/pool-calculator' },
  { value: 'design', label: 'Design board', path: '/global-design-board' },
  { value: 'landscaping', label: 'Landscaping studio', path: '/landscaping' },
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
  testimonials: { label: 'Testimonials', group: 'Content', props: { title: 'What clients say', items: [] },
    fields: [item('text', 'title', 'Title'), { key: 'items', label: 'Quotes', kind: 'items', blank: { quote: '', name: '' }, fields: [item('textarea', 'quote', 'Quote'), item('text', 'name', 'Name')] }] },
  cta: { label: 'Call to action', group: 'Content', props: { title: 'Ready to start?', body: 'Book a free consultation.', ctaLabel: 'Contact us', ctaHref: '#contact' },
    fields: [item('text', 'title', 'Title'), item('textarea', 'body', 'Text'), item('text', 'ctaLabel', 'Button text'), item('url', 'ctaHref', 'Button link')] },
  form: { label: 'Lead form', group: 'Commerce', props: { title: 'Request a quote', body: 'We reply within one business day.', buttonLabel: 'Send', anchor: 'contact' },
    fields: [item('text', 'title', 'Title'), item('textarea', 'body', 'Text'), item('text', 'buttonLabel', 'Button text'), item('text', 'anchor', 'Link name (#)')] },
  tech: { label: 'Wonderlands tool', group: 'Technology', props: { tool: 'studio', flipSlug: '', title: '', height: 760 },
    fields: [{ key: 'tool', label: 'Tool', kind: 'select', options: TECH_TOOLS.map(t => ({ value: t.value, label: t.label })) }, item('text', 'flipSlug', 'FLIP book'), item('text', 'title', 'Title'), item('number', 'height', 'Height (px)')] },
  spacer: { label: 'Spacer', group: 'Layout', props: { height: 64 }, fields: [item('number', 'height', 'Height (px)')] },
} satisfies Record<string, { label: string; group: string; props: Record<string, any>; fields: Field[] }>;
export type BlockType = keyof typeof BLOCKS;

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
