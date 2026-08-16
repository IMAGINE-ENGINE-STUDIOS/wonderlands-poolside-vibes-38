/**
 * Kept for compatibility — the riffle transition now lives in
 * `PageFlipTransMotion`, shared by every category and product transition.
 */
export {
  default,
  usePageFlipTransMotion,
  PAGE_FLIP_TRANS_DURATION,
} from "./PageFlipTransMotion";
export type { PageFlipTransMotionProps, PageFlipTransPayload } from "./PageFlipTransMotion";
