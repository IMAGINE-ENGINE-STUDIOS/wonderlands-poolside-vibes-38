// Driveway Gates Data - Individual cards for each size
const allSizes = [
  {
    dimensions: "12 ft. x 6 ft.",
    price: 6800
  },
  {
    dimensions: "14 ft. x 6 ft.",
    price: 5900
  },
  {
    dimensions: "16 ft. x 6 ft.",
    price: 7000
  },
  {
    dimensions: "18 ft. x 6 ft.",
    price: 7800
  }
];

const baseGateInfo = {
  model: "Prague Style Driveway Fence Gate",
  image: "/lovable-uploads/prague-driveway-gate.webp",
  description: "Black Steel Single Swing Driveway Fence Gate. High-quality gate designed for DIY installation with duplex powder-coated galvanized steel for superior strength and corrosion resistance. Posts and hinges included, no welding required.",
  warranty: "Limited Warranty",
  brand: "ALEKO",
  type: "Driveway Gate",
  category: "premium" as const,
  priceIncludesInstallation: true,
  sizes: allSizes,
  addons: [
    {
      name: "Automatic Gate Opener",
      price: 2000,
      description: "Automated gate opening system for convenient access"
    }
  ]
};

// Create individual product cards for each size
export const drivewayGates = allSizes.map((size) => ({
  ...baseGateInfo,
  baseDimensions: size.dimensions,
  basePrice: size.price,
}));
