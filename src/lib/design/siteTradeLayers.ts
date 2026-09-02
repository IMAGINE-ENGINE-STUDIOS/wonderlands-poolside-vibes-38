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

export const TRADE_LAYERS: Record<string, TradeLayerSpec> = {
  pool: {
    rate: SHELL_BASE * 3.5,
    note: 'Fiberglass or concrete shell, excavation, plumbing, equipment set and start-up.',
    features: [
      { id: 'pool-heater', label: 'Heat pump heater', flat: 6800 },
      { id: 'pool-salt', label: 'Salt chlorine system', flat: 2450 },
      { id: 'pool-lights', label: 'Colour LED lighting', flat: 1450, hint: 'Per light, gradient cycle default' },
      { id: 'pool-jets', label: 'Deck jets / bubblers', flat: 1250 },
      { id: 'pool-coping', label: 'Travertine coping', perLinearFt: 42 },
      { id: 'pool-waterline', label: 'Waterline tile band', perLinearFt: 28 },
      { id: 'pool-cover', label: 'Automatic safety cover', flat: 14500 },
      { id: 'pool-cleaner', label: 'Robotic cleaner', flat: 1650 },
    ],
  },
  spa: {
    rate: SHELL_BASE * 4,
    note: 'Spa shell with dedicated heater, blower and controls — 4x studio multiplier.',
    features: [
      { id: 'spa-spillway', label: 'Spillway into the pool', flat: 3200 },
      { id: 'spa-jets', label: 'Therapy jet package', flat: 2400 },
      { id: 'spa-blower', label: 'Air blower', flat: 1150 },
      { id: 'spa-heater', label: 'Gas heater (fast heat)', flat: 5400 },
      { id: 'spa-control', label: 'App automation & controls', flat: 2100 },
      { id: 'spa-coping', label: 'Matching coping', perLinearFt: 42 },
    ],
  },
  ledge: {
    rate: SHELL_BASE * 4,
    note: 'Tanning ledge / sun shelf at 8–12 in of water — 4x studio multiplier.',
    features: [
      { id: 'ledge-loungers', label: 'In-water loungers', flat: 1850 },
      { id: 'ledge-umbrella', label: 'Umbrella sleeve & shade', flat: 1250 },
      { id: 'ledge-bubblers', label: 'Bubblers on the shelf', flat: 1350 },
      { id: 'ledge-finish', label: 'Pebble finish upgrade', perSqFt: 14 },
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
      })),
      ...ENCLOSURE_ROOFS.filter((r) => r.pricePerSqFt > 0).map((r) => ({
        id: `roof-${r.id}`,
        label: r.label,
        perSqFt: r.pricePerSqFt,
        hint: r.description,
      })),
      ...ENCLOSURE_SCREENS.filter((s) => s.pricePerSqFt > 0).map((s) => ({
        id: `screen-${s.id}`,
        label: s.label,
        perSqFt: s.pricePerSqFt,
        hint: s.mesh,
      })),
      ...ENCLOSURE_DOORS.filter((d) => d.selfLatching).map((d) => ({
        id: `door-${d.id}`,
        label: d.label,
        flat: d.price,
        hint: d.description,
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
      })),
      { id: 'turf-pet', label: 'Pet-grade antimicrobial infill', perSqFt: 1.4 },
      { id: 'turf-pad', label: 'Shock pad underlay', perSqFt: 2.1 },
      { id: 'turf-bender', label: 'Bender board edging', perLinearFt: 6.5 },
      { id: 'turf-drain', label: 'French drain under the field', perLinearFt: 22 },
    ],
  },
  solar: {
    note: 'Array outline — panels are packed inside the drawn roof plane at 66% fill.',
    features: [
      { id: 'solar-battery', label: 'Battery storage (13.5 kWh)', flat: 13500 },
      { id: 'solar-critter', label: 'Critter guard', perLinearFt: 14 },
      { id: 'solar-optimizer', label: 'Per-panel optimisers', perSqFt: 0.35 },
      { id: 'solar-monitor', label: 'Production monitoring & app', flat: 850 },
      { id: 'solar-tile', label: 'Tile-roof mounting kit', perSqFt: 1.1 },
    ],
  },
  deck: {
    rate: 10,
    note: 'Paver or concrete deck — non-paved surfaces are cut out of the take-off.',
    features: [
      { id: 'deck-travertine', label: 'Travertine pavers', perSqFt: 15 },
      { id: 'deck-porcelain', label: 'Coralina porcelain pavers', perSqFt: 15 },
      { id: 'deck-sealer', label: 'Penetrating sealer', perSqFt: 1.75 },
      { id: 'deck-drain', label: 'Deck drain', perLinearFt: 26 },
    ],
  },
  fence: {
    linearRate: 50,
    note: 'Aluminium pool-code barrier with self-latching gates.',
    features: [
      { id: 'fence-54', label: '54 in height', perLinearFt: 12 },
      { id: 'fence-72', label: '72 in privacy height', perLinearFt: 26 },
      { id: 'fence-gate', label: 'Self-latching gate', flat: 760 },
      { id: 'fence-puppy', label: 'Puppy picket infill', perLinearFt: 9 },
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
