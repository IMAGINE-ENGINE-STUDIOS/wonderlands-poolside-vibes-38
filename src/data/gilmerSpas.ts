// Gilmer Glass Spas Data - 2025 Georgia Pricing (Dealer Price × 4)

export interface GilmerSpa {
  model: string;
  price: number;
  colorOptions?: string[];
  warranty: string;
  brand: string;
  type: string;
  category: string;
  spillover?: boolean;
}

export const gilmerSpas: GilmerSpa[] = [
  {
    model: "Moonlight Spillover",
    price: 0, // Price TBD - multiply dealer price × 4
    colorOptions: ["Azure Blue", "Caribbean Teal", "Pearl White", "Graphite Gray"],
    warranty: "Life Warranty",
    brand: "Gilmer Glass",
    type: "Spillover Spa",
    category: "spillover",
    spillover: true
  },
  {
    model: "Pacifica Spa",
    price: 0, // Price TBD - multiply dealer price × 4
    colorOptions: ["Azure Blue", "Caribbean Teal", "Pearl White", "Graphite Gray"],
    warranty: "Life Warranty",
    brand: "Gilmer Glass",
    type: "Spa",
    category: "standard"
  },
  {
    model: "Pearl Spillover",
    price: 0, // Price TBD - multiply dealer price × 4
    colorOptions: ["Azure Blue", "Caribbean Teal", "Pearl White", "Graphite Gray"],
    warranty: "Life Warranty",
    brand: "Gilmer Glass",
    type: "Spillover Spa",
    category: "spillover",
    spillover: true
  },
  {
    model: "Tranquility Spa",
    price: 0, // Price TBD - multiply dealer price × 4
    colorOptions: ["Azure Blue", "Caribbean Teal", "Pearl White", "Graphite Gray"],
    warranty: "Life Warranty",
    brand: "Gilmer Glass",
    type: "Spa",
    category: "deluxe"
  }
];
