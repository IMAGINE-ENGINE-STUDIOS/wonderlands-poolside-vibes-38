/**
 * COPING EDGE PROFILES
 * ----------------------------------------------------------------------------
 * Two edge profiles are offered on pool coping and both are standard — the
 * client chooses, there is no upcharge either way:
 *
 *   • Squared Edge — clean square-cut arris, available on every coping.
 *   • Bullnose     — rounded, hand-finished edge. Only available where the
 *                    manufacturer produces it: Belgard, or any product whose
 *                    own description specifies a bullnose edge.
 */

export type CopingEdgeProfileId = 'squared' | 'bullnose';

export interface CopingEdgeProfile {
  id: CopingEdgeProfileId;
  name: string;
  description: string;
  /** Both profiles are standard — included in the coping price. */
  standard: true;
}

export const COPING_EDGE_PROFILES: CopingEdgeProfile[] = [
  {
    id: 'squared',
    name: 'Squared Edge',
    description: 'Square-cut arris with a crisp shadow line at the water — available on all coping.',
    standard: true,
  },
  {
    id: 'bullnose',
    name: 'Bullnose',
    description: 'Rounded, hand-finished edge, softer underhand — offered on Belgard and coping specified as bullnose.',
    standard: true,
  },
];

export const DEFAULT_COPING_EDGE_PROFILE: CopingEdgeProfileId = 'squared';

/** Manufacturers that produce a bullnose edge across their coping range. */
const BULLNOSE_BRANDS = ['belgard'];

/**
 * True when the coping product can be supplied with a bullnose edge: it is a
 * Belgard product, or its own name/description specifies a bullnose edge.
 */
export function copingSupportsBullnose(
  name?: string | null,
  description?: string | null,
): boolean {
  const text = `${name ?? ''} ${description ?? ''}`.toLowerCase();
  if (!text.trim()) return false;
  if (text.includes('bullnose')) return true;
  return BULLNOSE_BRANDS.some((brand) => text.includes(brand));
}

/** The edge profiles a client may choose for the given coping product. */
export function getCopingEdgeProfiles(
  name?: string | null,
  description?: string | null,
): CopingEdgeProfile[] {
  return copingSupportsBullnose(name, description)
    ? COPING_EDGE_PROFILES
    : COPING_EDGE_PROFILES.filter((p) => p.id === 'squared');
}

/** Keeps a stored choice valid when the coping selection changes. */
export function resolveCopingEdgeProfile(
  profile: CopingEdgeProfileId | undefined,
  name?: string | null,
  description?: string | null,
): CopingEdgeProfileId {
  if (profile === 'bullnose' && copingSupportsBullnose(name, description)) return 'bullnose';
  return DEFAULT_COPING_EDGE_PROFILE;
}

export function copingEdgeProfileLabel(profile?: CopingEdgeProfileId): string {
  return COPING_EDGE_PROFILES.find((p) => p.id === profile)?.name
    ?? COPING_EDGE_PROFILES[0].name;
}
