
// Spa models data with actual image paths
export const spas = [
  {
    id: "spa-deluxe-6",
    model: "Deluxe Spa 6-Person",
    price: 22000,
    category: 'premium' as const,
    image: "/lovable-uploads/d5e74c29-95f6-4a9a-9395-a98fe4efdadd.png",
    dimensions: "7' x 7'",
    depth: "3'6\"",
    features: [
      "6-Person Seating Capacity",
      "Premium LED Lighting",
      "Digital Control System",
      "Energy Efficient Insulation",
      "Powerful Jet System",
      "Built-in Sound System"
    ],
    spilloverFeature: true,
    installationTimeWeeks: 2,
    warrantyYears: 5
  },
  {
    id: "spa-deluxe-8",
    model: "Deluxe Spa 8-Person",
    price: 28500,
    category: 'premium' as const,
    image: "/lovable-uploads/d1c952c1-8786-444d-b405-903533bc20d1.png",
    dimensions: "8' x 8'",
    depth: "3'8\"",
    features: [
      "8-Person Seating Capacity",
      "Premium LED Lighting Package",
      "Advanced Digital Controls",
      "Superior Insulation System",
      "Multi-Zone Jet System",
      "Integrated Entertainment System"
    ],
    spilloverFeature: true,
    installationTimeWeeks: 3,
    warrantyYears: 7
  },
  {
    id: "spa-luxury-10",
    model: "Luxury Spa 10-Person",
    price: 35500,
    category: 'luxury' as const,
    image: "/lovable-uploads/c86467c2-f57b-407c-a9f8-9ad2143552c2.png",
    dimensions: "9' x 9'",
    depth: "4'",
    features: [
      "10-Person Seating Capacity",
      "Full LED Lighting System",
      "Smart Home Integration",
      "Premium Insulation Package",
      "Therapeutic Jet Configuration",
      "Premium Audio Visual System"
    ],
    spilloverFeature: true,
    installationTimeWeeks: 4,
    warrantyYears: 10
  }
];

export default spas;
