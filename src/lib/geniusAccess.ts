/**
 * Genius navigation guard.
 *
 * Genius can take a guest anywhere a guest is allowed to go. Staff surfaces —
 * the admin dashboard, sales, contractor, procurement and internal file areas —
 * are never reachable through Genius, no matter what the model proposes or the
 * guest asks for.
 */

/** Guest-facing destinations Genius may open, with what each one is for. */
export const GENIUS_DESTINATIONS: { path: string; label: string; purpose: string }[] = [
  { path: '/', label: 'Home', purpose: 'the Wonderlands World landing experience' },
  { path: '/flip', label: 'FLIP', purpose: 'the Wonderlands magazine and all product books' },
  { path: '/studio', label: 'Studio', purpose: 'the Wonderlands Studio landing canvas' },
  { path: '/wonderlands-studio', label: 'Wonderlands Studio', purpose: 'configure pools, spas, saunas, pavers and features' },
  { path: '/design-studio', label: '3D Design Studio', purpose: 'the 3D pool and deck designer' },
  { path: '/studio-showroom', label: 'Showroom', purpose: 'every Wonderlands widget and tool' },
  { path: '/asset-gallery', label: 'Asset Gallery', purpose: 'every product and additional feature' },
  { path: '/tools', label: 'Tools', purpose: 'the tool gallery' },
  { path: '/tools2', label: 'Tools II', purpose: 'the extended tool gallery' },
  { path: '/blueprint-builder', label: 'Blueprint Builder', purpose: 'permit-ready plan sets' },
  { path: '/pool-calculator', label: 'Pool Calculator', purpose: 'quick pool pricing' },
  { path: '/quote', label: 'Quote', purpose: 'build a quote' },
  { path: '/checkout', label: 'Checkout', purpose: 'review the selection and financing' },
  { path: '/landscaping', label: 'Landscaping', purpose: 'landscaping and artificial grass' },
  { path: '/jobs', label: 'Careers', purpose: 'open positions' },
  { path: '/consent', label: 'Contact & Consent', purpose: 'share contact details and preferences' },
  { path: '/design', label: 'Design Proposals', purpose: 'website design directions' },
];

/** Staff-only prefixes Genius must never open. */
const BLOCKED_PREFIXES = [
  '/admin',
  '/content-editor',
  '/sales-rep',
  '/head-of-sales',
  '/contractor',
  '/procurement',
  '/files',
  '/gallery',
  '/project',
  '/invoice',
  '/template',
  '/twilio-poc',
  '/api',
  '/auth',
];

const ALLOWED = new Set(GENIUS_DESTINATIONS.map((d) => d.path));

/** True when Genius is allowed to navigate the guest to this path. */
export function isGeniusAllowedPath(path: string | undefined): path is string {
  if (!path || !path.startsWith('/')) return false;
  const clean = path.split('?')[0].split('#')[0].replace(/\/+$/, '') || '/';
  if (BLOCKED_PREFIXES.some((p) => clean === p || clean.startsWith(`${p}/`))) return false;
  return ALLOWED.has(clean);
}

/** Falls back to the studio when a proposed destination is not permitted. */
export function safeGeniusPath(path: string | undefined) {
  return isGeniusAllowedPath(path) ? path : '/wonderlands-studio';
}

/** Route map handed to Genius so it knows where it can take a guest. */
export function geniusRouteMap() {
  return GENIUS_DESTINATIONS.map((d) => `${d.path} — ${d.label}: ${d.purpose}`).join('\n');
}
