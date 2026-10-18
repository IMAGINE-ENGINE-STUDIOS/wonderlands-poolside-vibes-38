/** Entity-owned catalog selections. Copyright Imagine Engine Studios Corp. */
export interface StudioMaterials {
  finishId?: string; paverId?: string; copingId?: string;
  finishUrl?: string; paverUrl?: string; copingUrl?: string; waterlineUrl?: string;
  finishScale?: number; paverScale?: number; copingScale?: number; waterlineScale?: number;
}
/** Never inherit a later edit from another body; defaults are captured on creation. */
export function captureMaterials(materials: StudioMaterials | undefined, defaults: StudioMaterials): StudioMaterials {
  return { ...defaults, ...materials };
}