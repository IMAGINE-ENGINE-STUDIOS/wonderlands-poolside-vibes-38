// Gilmer Glass Spas Data - 2025 Georgia Pricing (Dealer Price × 4)
import gilmerMoonlight from '@/assets/gilmer-moonlight.png';
import gilmerPacifica from '@/assets/gilmer-pacifica.png';
import gilmerPearl from '@/assets/gilmer-pearl.png';
import gilmerTranquility from '@/assets/gilmer-tranquility.png';

export interface GilmerSpa {
  model: string;
  price: number;
  category: 'spillover' | 'standard' | 'deluxe';
  image: string;
  dimensions?: string;
  depth?: string;
  colorOptions: string[];
  warranty: string;
  brand: string;
  type: string;
  spillover?: boolean;
  installationTimeWeeks: number;
  features?: string[];
}

export const gilmerSpas: GilmerSpa[] = [
  {
    model: "Moonlight Spillover",
    price: 0, // Price TBD - multiply dealer price × 4
    category: "spillover",
    image: gilmerMoonlight,
    dimensions: "TBD",
    depth: "TBD",
    colorOptions: ["Azure Blue", "Caribbean Teal", "Pearl White", "Graphite Gray"],
    warranty: "Life Warranty",
    brand: "Gilmer Glass",
    type: "Spillover Spa",
    spillover: true,
    installationTimeWeeks: 2,
    features: ["Spillover Design", "Fiberglass Construction", "Lifetime Structural Warranty"]
  },
  {
    model: "Pacifica Spa",
    price: 0, // Price TBD - multiply dealer price × 4
    category: "standard",
    image: gilmerPacifica,
    dimensions: "TBD",
    depth: "TBD",
    colorOptions: ["Azure Blue", "Caribbean Teal", "Pearl White", "Graphite Gray"],
    warranty: "Life Warranty",
    brand: "Gilmer Glass",
    type: "Spa",
    installationTimeWeeks: 2,
    features: ["Ergonomic Seating", "Fiberglass Construction", "Lifetime Structural Warranty"]
  },
  {
    model: "Pearl Spillover",
    price: 0, // Price TBD - multiply dealer price × 4
    category: "spillover",
    image: gilmerPearl,
    dimensions: "TBD",
    depth: "TBD",
    colorOptions: ["Azure Blue", "Caribbean Teal", "Pearl White", "Graphite Gray"],
    warranty: "Life Warranty",
    brand: "Gilmer Glass",
    type: "Spillover Spa",
    spillover: true,
    installationTimeWeeks: 2,
    features: ["Spillover Design", "Fiberglass Construction", "Lifetime Structural Warranty"]
  },
  {
    model: "Tranquility Spa",
    price: 0, // Price TBD - multiply dealer price × 4
    category: "deluxe",
    image: gilmerTranquility,
    dimensions: "TBD",
    depth: "TBD",
    colorOptions: ["Azure Blue", "Caribbean Teal", "Pearl White", "Graphite Gray"],
    warranty: "Life Warranty",
    brand: "Gilmer Glass",
    type: "Spa",
    installationTimeWeeks: 2,
    features: ["Premium Design", "Fiberglass Construction", "Lifetime Structural Warranty"]
  }
];

