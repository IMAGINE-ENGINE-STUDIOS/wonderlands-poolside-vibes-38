// Wonderlands Solar — the house energy collection.
// Turnkey residential solar, home battery storage, solar pool heating and EV
// charging. Prices are installed (turnkey) Florida prices and are the single
// source used by the main-page section, the FLIP brochure and Genius.
import solarRoofArray from "@/assets/solar/solar-roof-array.jpg";
import solarBatteryWall from "@/assets/solar/solar-battery-wall.jpg";
import solarPoolHeating from "@/assets/solar/solar-pool-heating.jpg";
import solarInverterCharger from "@/assets/solar/solar-inverter-charger.jpg";

export type SolarGroup = "Solar Array" | "Home Battery" | "Pool Heating" | "Charging";

export interface SolarProduct {
  id: string;
  name: string;
  group: SolarGroup;
  /** Installed turnkey price in USD. */
  price: number;
  image: string;
  /** Short spec line — capacity / output. */
  spec: string;
  description: string;
  highlights: string[];
}

export const solarProducts: SolarProduct[] = [
  {
    id: "solar-array-6kw",
    name: "Wonderlands Solar 6 kW",
    group: "Solar Array",
    price: 18900,
    image: solarRoofArray,
    spec: "6.0 kW DC · 14 all-black panels",
    description:
      "An entry array for a compact roof — all-black monocrystalline panels set flush to the tile, sized to cover a typical pool pump and household base load.",
    highlights: ["All-black panels", "25-year performance warranty", "Permit & interconnection included"],
  },
  {
    id: "solar-array-9kw",
    name: "Wonderlands Solar 9 kW",
    group: "Solar Array",
    price: 26900,
    image: solarRoofArray,
    spec: "9.0 kW DC · 21 all-black panels",
    description:
      "The house standard. Nine kilowatts carries a heated pool, air conditioning and evening lighting through a Florida summer.",
    highlights: ["Covers pool + AC load", "Hurricane-rated mounting", "Monitoring app included"],
  },
  {
    id: "solar-array-12kw",
    name: "Wonderlands Solar 12 kW",
    group: "Solar Array",
    price: 34900,
    image: solarRoofArray,
    spec: "12.0 kW DC · 28 all-black panels",
    description:
      "For estate roofs with a spa, sauna and EV in the drive — full-property generation with headroom for a second battery.",
    highlights: ["Estate-scale generation", "Battery-ready wiring", "Dual-string inverter"],
  },
  {
    id: "solar-battery-single",
    name: "WonderWall Battery",
    group: "Home Battery",
    price: 12900,
    image: solarBatteryWall,
    spec: "13.5 kWh usable · 5 kW continuous",
    description:
      "Wall-mounted storage that keeps the pool, refrigeration and lighting alive through an outage, and shifts solar into the evening.",
    highlights: ["Whole-night backup", "Silent, outdoor rated", "Storm Watch pre-charge"],
  },
  {
    id: "solar-battery-double",
    name: "WonderWall Battery · Duo",
    group: "Home Battery",
    price: 24500,
    image: solarBatteryWall,
    spec: "27 kWh usable · 10 kW continuous",
    description:
      "Two units in series for whole-home backup — air conditioning and pool equipment stay on grid-independent.",
    highlights: ["Whole-home backup", "Runs AC + pool pump", "Off-grid capable"],
  },
  {
    id: "solar-pool-heating",
    name: "Solar Pool Heating System",
    group: "Pool Heating",
    price: 6500,
    image: solarPoolHeating,
    spec: "4 × 4ft × 12ft collectors · no running cost",
    description:
      "Glazed collectors plumbed into the existing pump loop. It adds ten to fifteen degrees of comfort with no energy bill attached.",
    highlights: ["No operating cost", "Extends the swim season", "Automatic diverter valve"],
  },
  {
    id: "solar-ev-charger",
    name: "Wall Charger",
    group: "Charging",
    price: 1890,
    image: solarInverterCharger,
    spec: "48 A · up to 44 miles per hour of charge",
    description:
      "A flush wall charger wired to the array so the car fills on sunlight rather than on the grid.",
    highlights: ["Solar-priority charging", "Indoor or outdoor", "Installed and inspected"],
  },
  {
    id: "solar-inverter-upgrade",
    name: "Hybrid Inverter Upgrade",
    group: "Charging",
    price: 3400,
    image: solarInverterCharger,
    spec: "11.4 kW hybrid · battery ready",
    description:
      "Replaces a legacy string inverter so an existing array can carry batteries, an EV charger and monitoring.",
    highlights: ["Battery ready", "Per-panel monitoring", "Retrofits existing arrays"],
  },
];

/** Editorial statement rows used by the section and the brochure. */
export const solarStats: { value: string; label: string }[] = [
  { value: "26–30%", label: "Federal & Florida incentives" },
  { value: "0", label: "Sales tax on solar in Florida" },
  { value: "25 yr", label: "Panel performance warranty" },
  { value: "1:1", label: "Net metering credit" },
];

export const SOLAR_INCLUDED: [string, string][] = [
  ["Site & shade study", "Roof planes, azimuth and shading modelled before a panel is quoted"],
  ["Engineering", "Florida wind-load mounting details and electrical drawings"],
  ["Permit & inspection", "County permit, utility interconnection and final inspection handled"],
  ["Installation", "Array, inverter, battery, conduit and labour included in the price shown"],
  ["Handover", "Monitoring app set up, production baseline recorded, warranty registered"],
];

export const solarGroups: SolarGroup[] = ["Solar Array", "Home Battery", "Pool Heating", "Charging"];
