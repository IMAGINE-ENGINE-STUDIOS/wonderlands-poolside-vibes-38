/**
 * screenadjusterauto / config / screenTiers
 * ----------------------------------------
 * Single source of truth for how far widgets are allowed to expand on each
 * screen tier. The goal: the wider the user's screen, the more the widgets
 * expand so the layout reaches the corners instead of sitting in a fixed
 * 1240px column.
 *
 * Every value is expressed as a viewport-relative max width (with a hard cap
 * for ultra-wide monitors) so no media-query duplication is needed elsewhere.
 */

export type ScreenTier = "mobile" | "tablet" | "laptop" | "desktop" | "wide" | "ultra";

export interface ScreenTierSpec {
  /** Minimum viewport width (px) that activates this tier. */
  min: number;
  /** Horizontal gutter as a viewport-relative value. */
  gutter: string;
  /** Max shell width — vw based so it grows with the screen. */
  shellMax: string;
  /** Width of the docked side rail (quote list / summary column). */
  railWidth: number;
  /** Max width for centered overlays (search, dialogs). */
  overlayMax: string;
  /** Max width for full tool overlays (design boards). */
  boardMax: string;
  /** Product grid minimum card width — drives auto-fill columns. */
  cardMin: number;
}

/** Ordered from widest to narrowest so lookup can return the first match. */
export const SCREEN_TIERS: Array<{ tier: ScreenTier; spec: ScreenTierSpec }> = [
  {
    tier: "ultra",
    spec: {
      min: 2200,
      gutter: "clamp(40px, 3vw, 96px)",
      shellMax: "min(2560px, 94vw)",
      railWidth: 460,
      overlayMax: "min(1100px, 62vw)",
      boardMax: "min(2400px, 94vw)",
      cardMin: 300,
    },
  },
  {
    tier: "wide",
    spec: {
      min: 1700,
      gutter: "clamp(32px, 2.6vw, 72px)",
      shellMax: "min(2100px, 94vw)",
      railWidth: 400,
      overlayMax: "min(980px, 66vw)",
      boardMax: "min(2000px, 94vw)",
      cardMin: 290,
    },
  },
  {
    tier: "desktop",
    spec: {
      min: 1360,
      gutter: "clamp(24px, 2.2vw, 56px)",
      shellMax: "min(1720px, 95vw)",
      railWidth: 360,
      overlayMax: "min(880px, 72vw)",
      boardMax: "min(1680px, 95vw)",
      cardMin: 280,
    },
  },
  {
    tier: "laptop",
    spec: {
      min: 1024,
      gutter: "clamp(20px, 2vw, 40px)",
      shellMax: "96vw",
      railWidth: 320,
      overlayMax: "min(760px, 82vw)",
      boardMax: "96vw",
      cardMin: 260,
    },
  },
  {
    tier: "tablet",
    spec: {
      min: 640,
      gutter: "clamp(16px, 3vw, 28px)",
      shellMax: "97vw",
      railWidth: 300,
      overlayMax: "92vw",
      boardMax: "97vw",
      cardMin: 240,
    },
  },
  {
    tier: "mobile",
    spec: {
      min: 0,
      gutter: "16px",
      shellMax: "100%",
      railWidth: 0,
      overlayMax: "100%",
      boardMax: "100%",
      cardMin: 200,
    },
  },
];

/** Resolve the tier spec for a given viewport width. */
export function resolveScreenTier(width: number) {
  const match = SCREEN_TIERS.find((t) => width >= t.spec.min) ?? SCREEN_TIERS[SCREEN_TIERS.length - 1];
  return match;
}
