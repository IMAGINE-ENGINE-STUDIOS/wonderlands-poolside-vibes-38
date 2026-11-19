/* App-base asset URLs for the kitchen surfaces (M3 fix, 2026-11-09).
 *
 * The app is built with base /app/ and dual-served at /app/... and
 * at clean root paths, but public asset FILES live under /app/ —
 * and the production host serves only some public subpaths at the
 * origin root (verified live 2026-11-09: /textures, /media and
 * /models return real bytes at root; /walls and /wall-blocks
 * return the marketing index.html, 200 + text/html, which is why
 * the file page's body-system thumbnails showed broken-image
 * icons). Data that ships pre-based URLs (the block faces,
 * "/app/wall-blocks/...") renders everywhere; data that ships
 * root-absolute URLs (the wall sheets' gallery originals,
 * "/walls/...") renders nowhere. This helper puts a root-absolute
 * asset URL under the app base; already-based and absolute URLs
 * pass through untouched. */

export function appAssetUrl(url: string | undefined | null): string | undefined {
  if (!url) return undefined;
  if (!url.startsWith("/")) return url;
  if (url.startsWith("/app/")) return url;
  return `/app${url}`;
}
