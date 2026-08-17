/**
 * screenadjusterauto / hooks / useScreenAdjuster
 * ---------------------------------------------
 * Watches the viewport and returns the active tier plus ready-to-spread
 * style objects. Widgets stay fluid: bigger screen -> wider shell, wider
 * side rail, more grid columns, larger overlays.
 *
 * Implementation notes for other programmers:
 *  - Uses a single resize listener (rAF-throttled) shared by every consumer
 *    through React state; cheap enough for dozens of mounted widgets.
 *  - All returned widths are CSS strings so the browser does the final math
 *    (no re-render needed for sub-tier resizes).
 */
import { useEffect, useMemo, useState } from "react";
import { resolveScreenTier, type ScreenTier, type ScreenTierSpec } from "../config/screenTiers";

function currentWidth() {
  if (typeof window === "undefined") return 1440;
  return window.innerWidth;
}

export interface ScreenAdjuster {
  tier: ScreenTier;
  spec: ScreenTierSpec;
  width: number;
  /** Style for the page shell (centered, fluid max width + gutters). */
  shellStyle: React.CSSProperties;
  /** Style for a content + rail split; collapses to one column on small screens. */
  splitStyle: React.CSSProperties;
  /** Style for centered overlay panels (search, dialogs). */
  overlayStyle: React.CSSProperties;
  /** Style for full tool overlays (drawing boards). */
  boardStyle: React.CSSProperties;
  /** Auto-fill grid style for product/feature cards. */
  cardGridStyle: React.CSSProperties;
  isCompact: boolean;
}

export function useScreenAdjuster(): ScreenAdjuster {
  const [width, setWidth] = useState<number>(currentWidth);

  useEffect(() => {
    let frame = 0;
    const onResize = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setWidth(window.innerWidth));
    };
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return useMemo(() => {
    const { tier, spec } = resolveScreenTier(width);
    const isCompact = width < 1024;

    return {
      tier,
      spec,
      width,
      isCompact,
      shellStyle: {
        width: "100%",
        maxWidth: spec.shellMax,
        marginInline: "auto",
        paddingInline: spec.gutter,
      },
      splitStyle: {
        display: "grid",
        gap: `clamp(20px, 2vw, 40px)`,
        gridTemplateColumns: isCompact
          ? "minmax(0, 1fr)"
          : `minmax(0, 1fr) ${spec.railWidth}px`,
      },
      overlayStyle: {
        width: "100%",
        maxWidth: spec.overlayMax,
      },
      boardStyle: {
        width: "100%",
        maxWidth: spec.boardMax,
      },
      cardGridStyle: {
        display: "grid",
        gap: "clamp(12px, 1.2vw, 24px)",
        gridTemplateColumns: `repeat(auto-fill, minmax(${spec.cardMin}px, 1fr))`,
      },
    };
  }, [width]);
}
