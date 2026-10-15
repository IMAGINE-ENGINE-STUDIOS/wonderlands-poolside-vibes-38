/** Shared helpers for the Website Builder V2. Imagine Engine Studios Corp. */
export const slugifyPage = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);

/** Every photo used anywhere in the site (media library = reuse what you uploaded). */
export function collectImages(node: unknown, out = new Set<string>()): Set<string> {
  if (typeof node === 'string') { if (/^(data:image|https?:\/\/.*\.(webp|jpe?g|png|avif|gif))/i.test(node) || /^data:image/.test(node)) out.add(node); }
  else if (Array.isArray(node)) node.forEach((n) => collectImages(n, out));
  else if (node && typeof node === 'object') Object.values(node).forEach((n) => collectImages(n, out));
  return out;
}
