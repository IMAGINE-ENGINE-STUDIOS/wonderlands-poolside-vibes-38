/**
 * Trade catalogues for the drawing boards
 * =======================================
 * The site board (and therefore the Global Design Board) draws every discipline
 * on one scaled sheet. This file is the single place that says, per drawn layer:
 *
 *  - what it costs (`rate`, in $/sq ft, or `linearRate` in $/lf), and
 *  - which **additional features** open when that element is selected.
 *
 * Rates and feature prices are pulled from the same catalogues the standalone
 * boards and configurators use (screen enclosure configurator, artificial grass
 * data, solar hardware, Wonderlands studio multipliers) so a shape priced here
 * matches the number the dedicated board would give.
 *
 * Keyed by plain strings on purpose: `SiteDrawingBoard` imports this file, so
 * importing `SiteLayerId` back from it would create a cycle.
 */
import {
  ENCLOSURE_ROOFS,
  ENCLOSURE_SCREENS,
  ENCLOSURE_DOORS,
  ENCLOSURE_TYPES,
} from '@/data/screenEnclosureConfigurator';
import { artificialGrassOptions, getGrassPricePerSqFt } from '@/data/artificialGrassData';
import { paverTypes, copingTypes } from '@/data/paverData';
import { FENCE_HEIGHTS, FENCE_STYLES, FENCE_GATES, FENCE_ADDONS } from '@/data/fenceConfigurator';
import { solarBatteries } from '@/data/solarHardware';
import { getProductFeatures, type ProductType } from '@/config/productFeatures';

/* ── option photography ───────────────────────────────────────────────────
   Every tile on a drawing board shows a picture, exactly as Wonderlands Studio
   prints on its product cards. Catalogues that ship their own imagery (pavers,
   finishes, coping, turf) use it; the trades whose configurators are text-only
   (cage, fencing, solar, deck extras, comfort options) borrow the same studio
   photography used elsewhere on the site. ES6 imports only — never string paths. */
import imgEnclosurePremium from '@/assets/enclosures/screen-enclosure-premium.webp';
import imgEnclosureDeluxe from '@/assets/enclosures/screen-enclosure-deluxe.webp';
import imgLanaiPremium from '@/assets/enclosures/lanai-premium.webp';
import imgLanaiStandard from '@/assets/enclosures/lanai-standard.webp';
import imgFencePanels from '@/assets/fencing/aluminum-fencing.webp';
import imgFencePanel2 from '@/assets/fencing/aluminum-panel-2.webp';
import imgFenceTexture from '@/assets/fencing/fence-texture.webp';
import imgSolarArray from '@/assets/solar/solar-roof-array.jpg';
import imgSolarBattery from '@/assets/solar/solar-battery-wall.jpg';
import imgSolarInverter from '@/assets/solar/solar-inverter-charger.jpg';
import imgTurfTexture from '@/assets/turf/grass-texture.avif';
import imgDeckLuxury from '@/assets/deck/luxury-outdoor.webp';
import imgDeckGarden from '@/assets/deck/garden.webp';
import imgSpa from '@/assets/deck/spa.webp';
import imgTanningLedge from '@/assets/deck/tanning-ledge.webp';
import imgPergola from '@/assets/deck/pergola.webp';
import imgLuxuryPool from '@/assets/deck/luxury-pool.webp';


/** One selectable feature on a drawn element. */
export interface TradeFeature {
  id: string;
  label: string;
  /** Added $/sq ft of the element while selected */
  perSqFt?: number;
  /** Added $/linear ft of the element perimeter (coping, gutters, edging) */
  perLinearFt?: number;
  /** Flat added price (doors, heaters, controls) */
  flat?: number;
  hint?: string;
  /** Heading this option is filed under in the options drawer */
  group?: string;
  /**
   * Photograph shown on the option tile. Sourced from the same catalogue image
   * Wonderlands Studio prints on its product cards, so a tile on the board and
   * a tile in the studio are the same picture.
   */
  image?: string;
  /**
   * This option *is* the surface of the element and its price is the published
   * all-in rate, so the layer's base rate must not be charged twice (a $15/sq ft
   * paver replaces the $10/sq ft concrete deck base, it is not added to it).
   */
  replacesBase?: boolean;
  /**
   * Options sharing an `exclusive` key are a single choice (a surface, a height,
   * a screen mesh) — picking one clears the rest, exactly as the standalone
   * configurators and the FLIP book behave.
   */
  exclusive?: string;

}

export interface TradeLayerSpec {
  /** Installed base rate, $/sq ft of drawn area */
  rate?: number;
  /** Installed base rate, $/linear ft (open runs) */
  linearRate?: number;
  /** Short line shown under the element options drawer */
  note?: string;
  features: TradeFeature[];
}


const PANEL_WATTS = 400;
const PANEL_SQFT = 21.3;
/** Real-roof packing factor, calibrated on installed Florida jobs (36-panel fit). */
export const SOLAR_PACKING = 0.66;
/** Installed $/W on a tile roof, calibrated to a ~$37k / 36-panel QCells job. */
export const SOLAR_PER_WATT = 2.5;

export const solarPanelsForArea = (sqFt: number) =>
  Math.max(0, Math.floor((sqFt * SOLAR_PACKING) / PANEL_SQFT));

export const solarAreaPrice = (sqFt: number) =>
  solarPanelsForArea(sqFt) * PANEL_WATTS * SOLAR_PER_WATT;

/**
 * Pool / spa / ledge shells use the studio multipliers: 3.5x on pools and 4x on
 * spas and tanning ledges off the same $80/sq ft shell base.
 */
const SHELL_BASE = 80;

/**
 * The whole coping catalogue, at its published $/linear ft, offered on any shell
 * layer — one choice only, exactly as the studio and the FLIP book present it.
 */
const COPING_FEATURES = (prefix: string): TradeFeature[] =>
  copingTypes.map((c) => ({
    id: `${prefix}-coping-${c.id}`,
    label: c.name,
    perLinearFt: c.basePrice,
    hint: c.description,
    image: c.image,
    group: 'Coping',
    exclusive: `${prefix}-coping`,
  }));



/**
 * Studio option catalogues, verbatim
 * ---------------------------------
 * Shell layers (pool, spa, tanning ledge) offer the *same* additional features
 * Wonderlands Studio prints on the product card: identical titles, identical
 * prices and identical photographs. `getProductFeatures` is the studio's own
 * configuration, so nothing is re-typed here — selection options become one
 * exclusive choice per group, area options are priced per square foot and
 * boolean / quantity options become a flat toggle.
 */
const slug = (v: string) =>
  v.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const studioFeatures = (productType: ProductType, prefix: string): TradeFeature[] => {
  const out: TradeFeature[] = [];
  getProductFeatures(productType).forEach((f) => {
    const group = f.label;
    if ((f.type === 'selection' || f.type === 'area') && f.options?.length) {
      const perArea = f.type === 'area';
      f.options.forEach((o) => {
        if (!o.name) return;
        out.push({
          id: `${prefix}-${f.id}-${slug(String(o.name))}`,
          label: String(o.name),
          ...(perArea ? { perSqFt: o.price || undefined } : { flat: o.price || undefined }),
          image: o.image,
          hint: o.description,
          group,
          exclusive: `${prefix}-${f.id}`,
        });
      });
      return;
    }
    if (f.type === 'boolean' || f.type === 'quantity') {
      out.push({
        id: `${prefix}-${f.id}`,
        label: f.label,
        flat: f.basePrice || undefined,
        image: f.image,
        hint: f.description,
        group: 'Equipment',
      });
    }
  });
  return out;
};

export const TRADE_LAYERS: Record<string, TradeLayerSpec> = {
  pool: {
    rate: SHELL_BASE * 3.5,
    note: 'Fiberglass or concrete shell, excavation, plumbing, equipment set and start-up.',
    features: [
      /* identical to the studio pool card: finishes, liners, tiles, heaters,
         covers, spas, ledges, pavers, enclosure and concrete construction */
      ...studioFeatures('pool', 'pool'),
      ...COPING_FEATURES('pool'),
      { id: 'pool-waterline', label: 'Waterline tile band', perLinearFt: 28, image: imgLuxuryPool, group: 'Waterline' },
    ],
  },
  spa: {
    rate: SHELL_BASE * 4,
    note: 'Spa shell with dedicated heater, blower and controls — 4x studio multiplier.',
    features: [
      /* identical to the studio spa card */
      ...studioFeatures('spa', 'spa'),
      { id: 'spa-spillway', label: 'Spillway into the pool', flat: 3200, image: imgSpa, group: 'Equipment' },
      ...COPING_FEATURES('spa'),
    ],
  },
  ledge: {
    rate: SHELL_BASE * 4,
    note: 'Tanning ledge / sun shelf at 8–12 in of water — 4x studio multiplier.',
    features: [
      /* identical to the studio tanning-ledge card */
      ...studioFeatures('tanning-ledge', 'ledge'),
      { id: 'ledge-loungers', label: 'In-water loungers', flat: 1850, image: imgTanningLedge, group: 'Comfort' },
      { id: 'ledge-umbrella', label: 'Umbrella sleeve & shade', flat: 1250, image: imgPergola, group: 'Comfort' },
      { id: 'ledge-bubblers', label: 'Bubblers on the shelf', flat: 1350, image: imgSpa, group: 'Comfort' },
      { id: 'ledge-finish', label: 'Pebble finish upgrade', perSqFt: 14, image: imgLuxuryPool, group: 'Finish' },
      ...COPING_FEATURES('ledge'),
    ],
  },

  enclosure: {
    // Mansard cage base, matching the screen enclosure configurator's installed rate.
    rate: 34,
    note: 'Florida wind-load cage: extrusions, screen, kick plates and self-latching doors.',
    features: [
      ...ENCLOSURE_TYPES.filter((t) => t.rateMultiplier > 1).map((t) => ({
        id: `cage-${t.id}`,
        label: t.label,
        perSqFt: +(34 * (t.rateMultiplier - 1)).toFixed(2),
        hint: t.description,
        image: imgEnclosurePremium,
        group: 'Cage type',
        exclusive: 'cage',
      })),
      ...ENCLOSURE_ROOFS.filter((r) => r.pricePerSqFt > 0).map((r) => ({
        id: `roof-${r.id}`,
        label: r.label,
        perSqFt: r.pricePerSqFt,
        hint: r.description,
        image: imgEnclosureDeluxe,
        group: 'Roof system',
        exclusive: 'roof',
      })),
      ...ENCLOSURE_SCREENS.filter((s) => s.pricePerSqFt > 0).map((s) => ({
        id: `screen-${s.id}`,
        label: s.label,
        perSqFt: s.pricePerSqFt,
        hint: s.mesh,
        image: imgLanaiPremium,
        group: 'Screen mesh',
        exclusive: 'screen',
      })),
      ...ENCLOSURE_DOORS.filter((d) => d.selfLatching).map((d) => ({
        id: `door-${d.id}`,
        label: d.label,
        flat: d.price,
        hint: d.description,
        image: imgLanaiStandard,
        group: 'Self-latching doors',
      })),
    ],
  },
  turf: {
    rate: getGrassPricePerSqFt(),
    note: 'Artificial grass over compacted base, nailed edges, infill and seams.',
    features: [
      ...artificialGrassOptions.map((g) => ({
        id: `turf-${g.id}`,
        label: `${g.name} blade colour`,
        /* every catalogued turf is priced at its own published rate */
        perSqFt: +(getGrassPricePerSqFt(g.name) - getGrassPricePerSqFt()).toFixed(2) || undefined,
        image: g.image,
        group: 'Turf product',
        exclusive: 'turf-product',
      })),
      { id: 'turf-pet', label: 'Pet-grade antimicrobial infill', perSqFt: 1.4, image: imgTurfTexture, group: 'Base & infill' },
      { id: 'turf-pad', label: 'Shock pad underlay', perSqFt: 2.1, image: imgTurfTexture, group: 'Base & infill' },
      { id: 'turf-bender', label: 'Bender board edging', perLinearFt: 6.5, image: imgDeckGarden, group: 'Edging & drainage' },
      { id: 'turf-drain', label: 'French drain under the field', perLinearFt: 22, image: imgDeckGarden, group: 'Edging & drainage' },
    ],
  },
  solar: {
    note: 'Array outline — panels are packed inside the drawn roof plane at 66% fill.',
    features: [
      ...solarBatteries
        .filter((b) => b.price > 0)
        .map((b) => ({
          id: `solar-${b.id}`,
          label: `${b.name} · ${b.usableKwh} kWh`,
          flat: b.price,
          hint: b.note,
          image: imgSolarBattery,
          group: 'Storage',
          exclusive: 'battery',
        })),
      { id: 'solar-critter', label: 'Critter guard', perLinearFt: 14, image: imgSolarArray, group: 'Array hardware' },
      { id: 'solar-optimizer', label: 'Per-panel optimisers', perSqFt: 0.35, image: imgSolarInverter, group: 'Array hardware' },
      { id: 'solar-monitor', label: 'Production monitoring & app', flat: 850, image: imgSolarInverter, group: 'Array hardware' },
      { id: 'solar-tile', label: 'Tile-roof mounting kit', perSqFt: 1.1, image: imgSolarArray, group: 'Roof mounting', exclusive: 'mount' },
      { id: 'solar-shingle', label: 'Shingle flashed mounting', perSqFt: 0.6, image: imgSolarArray, group: 'Roof mounting', exclusive: 'mount' },
      { id: 'solar-metal', label: 'Standing-seam clamp mounting', perSqFt: 0.75, image: imgSolarArray, group: 'Roof mounting', exclusive: 'mount' },
    ],
  },
  deck: {
    rate: 10,
    note: 'Paver or concrete deck — non-paved surfaces are cut out of the take-off. Concrete deck is the $10/sq ft base; picking a paver prices it at its published rate.',
    features: [
      /* the full Wonderlands paver catalogue, each at its published $/sq ft.
         Picking one REPLACES the $10/sq ft concrete deck base — the published
         paver rate is the installed rate, exactly as the studio quotes it. */
      ...paverTypes.map((p) => ({
        id: `paver-${p.id}`,
        label: p.name,
        perSqFt: p.basePrice,
        hint: p.description,
        image: p.image,
        group: 'Paver selection',
        exclusive: 'deck-surface',
        replacesBase: true,
      })),

      { id: 'deck-sealer', label: 'Penetrating sealer', perSqFt: 1.75, image: imgDeckLuxury, group: 'Deck options' },
      { id: 'deck-drain', label: 'Deck drain', perLinearFt: 26, image: imgDeckGarden, group: 'Deck options' },
    ],
  },
  fence: {
    /* 48 in flat-top pool barrier is the base run, exactly as the configurator */
    linearRate: FENCE_HEIGHTS.find((h) => h.id === '48')?.pricePerFt ?? 45,
    note: 'Aluminium pool-code barrier — height, style, gates and add-ons priced as the fence configurator.',
    features: [
      ...FENCE_HEIGHTS.map((h) => ({
        id: `fence-h-${h.id}`,
        label: h.label,
        perLinearFt: +(h.pricePerFt - (FENCE_HEIGHTS.find((x) => x.id === '48')?.pricePerFt ?? 45)).toFixed(2) || undefined,
        hint: h.note,
        image: imgFencePanels,
        group: 'Height',
        exclusive: 'fence-height',
      })),
      ...FENCE_STYLES.map((s) => ({
        id: `fence-s-${s.id}`,
        label: s.label,
        perLinearFt: s.pricePerFtDelta || undefined,
        hint: s.description,
        image: imgFencePanel2,
        group: 'Style',
        exclusive: 'fence-style',
      })),
      ...FENCE_GATES.map((g) => ({
        id: `fence-g-${g.id}`,
        label: g.label,
        flat: g.price,
        hint: g.description,
        image: imgFenceTexture,
        group: 'Gates',
      })),
      ...FENCE_ADDONS.map((a) => ({
        id: `fence-a-${a.id}`,
        label: a.label,
        flat: a.pricing === 'each' ? a.price : undefined,
        perLinearFt: a.pricing === 'linear-ft' ? a.price : undefined,
        hint: a.description,
        image: imgFenceTexture,
        group: 'Add-ons',
      })),
    ],
  },

};

/** Additional-feature price for one drawn element. */
export function tradeFeaturePrice(
  layer: string,
  featureIds: string[] | undefined,
  sqFt: number,
  linearFt: number,
): number {
  if (!featureIds?.length) return 0;
  const spec = TRADE_LAYERS[layer];
  if (!spec) return 0;
  return featureIds.reduce((sum, id) => {
    const f = spec.features.find((x) => x.id === id);
    if (!f) return sum;
    return sum + (f.flat ?? 0) + (f.perSqFt ?? 0) * sqFt + (f.perLinearFt ?? 0) * linearFt;
  }, 0);
}

/**
 * One priced line per selected option, so the estimate itemises what was picked
 * instead of hiding it inside a single "options" figure. Each line carries the
 * feature id and its photograph, which is what lets the estimate print the tile
 * and offer an X to take that option back off the element.
 */
export function tradeFeatureLines(
  layer: string,
  featureIds: string[] | undefined,
  sqFt: number,
  linearFt: number,
): { id: string; label: string; detail: string; amount: number; image?: string; replacesBase?: boolean }[] {
  if (!featureIds?.length) return [];
  const spec = TRADE_LAYERS[layer];
  if (!spec) return [];
  return featureIds.flatMap((id) => {
    const f = spec.features.find((x) => x.id === id);
    if (!f) return [];
    const amount = (f.flat ?? 0) + (f.perSqFt ?? 0) * sqFt + (f.perLinearFt ?? 0) * linearFt;
    const detail = f.perSqFt
      ? `${Math.round(sqFt).toLocaleString()} sq ft × $${f.perSqFt}/sq ft`
      : f.perLinearFt
        ? `${Math.round(linearFt).toLocaleString()} lf × $${f.perLinearFt}/lf`
        : f.flat
          ? `${f.group ?? 'Option'} · flat`
          : (f.group ?? 'Included');
    return [{ id: f.id, label: f.label, detail, amount, image: f.image, replacesBase: f.replacesBase }];
  });
}

/**
 * Does the element carry a surface option that already includes the layer base?
 * A paver on a deck is quoted at its published installed rate, so the $10/sq ft
 * concrete deck base is dropped for that element instead of being stacked on it.
 */
export function tradeBaseReplaced(layer: string, featureIds: string[] | undefined): boolean {
  if (!featureIds?.length) return false;
  const spec = TRADE_LAYERS[layer];
  if (!spec) return false;
  return featureIds.some((id) => spec.features.find((f) => f.id === id)?.replacesBase);
}
