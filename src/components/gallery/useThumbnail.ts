/**
 * Gallery thumbnails — served by Supabase Storage image transformation.
 *
 * The grid used to build thumbnails in the browser: every card downloaded the
 * FULL original (customer renders run 7–33 MB each, 8192×4096), drew it to a
 * canvas and re-encoded it, at most 3 at a time — a 57-file folder moved
 * ~1.4 GB before its tiles appeared. Now the storage render endpoint returns
 * a right-sized WebP (480×480 cover ≈ 50 KB, Cache-Control max-age=3600) and
 * the browser's own lazy loading does the scheduling. Originals are only
 * fetched when a file is actually opened (FileViewer / Open / Download).
 */

const THUMB_SIZE = 480;

/**
 * Turn a public Supabase storage URL into its resized render variant.
 * Returns null when the URL is not a transformable storage object
 * (external host, SVG, or already a render URL) — callers fall back to
 * the original URL.
 */
export const galleryRenderUrl = (
  originalUrl: string,
  opts: { width?: number; height?: number; resize?: 'cover' | 'contain' | 'fill'; quality?: number } = {},
): string | null => {
  if (!originalUrl) return null;
  if (/\.svg(\?|$)/i.test(originalUrl)) return null;
  const marker = '/storage/v1/object/public/';
  const at = originalUrl.indexOf(marker);
  if (at === -1) return null;
  const base = originalUrl.slice(0, at) + '/storage/v1/render/image/public/';
  const path = originalUrl.slice(at + marker.length);
  const width = opts.width ?? THUMB_SIZE;
  const height = opts.height ?? THUMB_SIZE;
  const resize = opts.resize ?? 'cover';
  const quality = opts.quality ?? 75;
  return `${base}${path}?width=${width}&height=${height}&resize=${resize}&quality=${quality}&format=webp`;
};

export const galleryThumbUrl = (originalUrl: string): string =>
  galleryRenderUrl(originalUrl) ?? originalUrl;

/** Kept for API compatibility — thumbnails are stateless URLs now, no cache to clear. */
export const clearFolderCache = (_folderId: string) => {};

/**
 * Returns the thumbnail URL for a gallery file. Synchronous: the render URL
 * is known immediately, so cards never wait on a generation queue; the
 * <img loading="lazy"> in FileCard defers off-screen downloads.
 */
export const useThumbnail = (
  originalUrl: string,
  fileType: string | null,
  _folderId?: string,
): { thumbUrl: string; isLoading: boolean } => {
  const isImage = fileType?.startsWith('image/');
  if (!isImage) return { thumbUrl: originalUrl, isLoading: false };
  return { thumbUrl: galleryThumbUrl(originalUrl), isLoading: false };
};
