// Gilmer Glass Spas Data - 2025 Georgia Pricing (Dealer Price × 4)
import gilmerMoonlight from '@/assets/pools/glimmerglass/gilmer-moonlight.webp';
import gilmerPacifica from '@/assets/pools/glimmerglass/gilmer-pacifica.webp';
import gilmerPearl from '@/assets/pools/glimmerglass/gilmer-pearl.webp';
import gilmerTranquility from '@/assets/pools/glimmerglass/gilmer-tranquility.webp';

export interface GilmerSpa {
  model: string;
  price: number;
  dealerPrice: number;
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
    model: "Moondance Spillover",
    dealerPrice: 5000,
    price: 20000, // 5000 × 4
    category: "spillover",
    image: gilmerMoonlight,
    dimensions: "8'x8'x3'3\"",
    depth: "3'3\"",
    colorOptions: ["Ocean Blue", "Sapphire Blue", "Coastal Bronze", "Snow White", "Steel Grey", "Arctic White", "Glacier Blue"],
    warranty: "Life Warranty",
    brand: "Gilmer Glass",
    type: "Spillover Spa",
    spillover: true,
    installationTimeWeeks: 2,
    features: ["Spillover Design", "Fiberglass Construction", "Lifetime Structural Warranty"]
  },
  {
    model: "Pacifica",
    dealerPrice: 4500,
    price: 18000, // 4500 × 4
    category: "standard",
    image: gilmerPacifica,
    dimensions: "7'6\"x7'6\"x3'",
    depth: "3'",
    colorOptions: ["Ocean Blue", "Sapphire Blue", "Coastal Bronze", "Snow White", "Steel Grey", "Arctic White", "Glacier Blue"],
    warranty: "Life Warranty",
    brand: "Gilmer Glass",
    type: "Spa",
    installationTimeWeeks: 2,
    features: ["Ergonomic Seating", "Fiberglass Construction", "Lifetime Structural Warranty"]
  },
  {
    model: "Pearl Spillover",
    dealerPrice: 4500,
    price: 18000, // 4500 × 4
    category: "spillover",
    image: gilmerPearl,
    dimensions: "7'6\"x7'6\"x3'",
    depth: "3'",
    colorOptions: ["Ocean Blue", "Sapphire Blue", "Coastal Bronze", "Snow White", "Steel Grey", "Arctic White", "Glacier Blue"],
    warranty: "Life Warranty",
    brand: "Gilmer Glass",
    type: "Spillover Spa",
    spillover: true,
    installationTimeWeeks: 2,
    features: ["Spillover Design", "Fiberglass Construction", "Lifetime Structural Warranty"]
  },
  {
    model: "Tranquility",
    dealerPrice: 5000,
    price: 20000, // 5000 × 4
    category: "deluxe",
    image: gilmerTranquility,
    dimensions: "9'x9'x3'8\"",
    depth: "3'8\"",
    colorOptions: ["Ocean Blue", "Sapphire Blue", "Coastal Bronze", "Snow White", "Steel Grey", "Arctic White", "Glacier Blue"],
    warranty: "Life Warranty",
    brand: "Gilmer Glass",
    type: "Spa",
    installationTimeWeeks: 2,
    features: ["Premium Design", "Fiberglass Construction", "Lifetime Structural Warranty"]
  },
];

