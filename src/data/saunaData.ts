export const saunas = [
  {
    id: 'barrel-sauna-4',
    name: 'Barrel Sauna 4-Person',
    model: 'Barrel Sauna 4P',
    price: 18000, // was 15000, +20%
    category: 'premium',
    image: '/lovable-uploads/barrel-sauna.webp',
    // New: Multiple images gallery
    media: [
      { type: 'image' as const, url: '/lovable-uploads/barrel-sauna.webp', alt: 'Barrel Sauna exterior' },
      { type: 'image' as const, url: '/lovable-uploads/579d34e1-ef64-4134-bf8b-dff4980bb17a.png', alt: 'Barrel Sauna interior' },
      { type: 'image' as const, url: '/lovable-uploads/c7c3ab88-34ab-47d4-bf6c-38893a5b13f2.png', alt: 'Barrel Sauna in backyard' }
    ],
    capacity: '4 persons',
    heaterPower: '6kW',
    description: 'Premium 4-person barrel sauna with 6kW heater, LED lighting, and all accessories included. Includes permits and installation.',
    features: [
      'Ball-and-socket lumber construction',
      'Tempered glass door and windows',
      'Stainless steel hardware',
      'Interior LED lighting',
      '6kW electric heater',
      'Sauna stones included',
      'Cedar wood construction',
      'Weather-resistant exterior'
    ],
    dimensions: '8ft L x 6ft Dia',
    installationTime: 'Same day delivery and installation',
    warranty: '5 years structural',
  },
  {
    id: 'barrel-sauna-6',
    name: 'Barrel Sauna 6-Person',
    model: 'Barrel Sauna 6P',
    price: 21600, // was 18000, +20%
    category: 'premium',
    image: '/lovable-uploads/barrel-sauna.webp',
    capacity: '6 persons',
    heaterPower: '8kW',
    description: 'Spacious 6-person barrel sauna with 8kW heater, premium features, and extended warranty. Includes permits and installation.',
    features: [
      'Ball-and-socket lumber construction',
      'Tempered glass door and panoramic windows',
      'Stainless steel hardware',
      'Interior LED lighting with color options',
      '8kW electric heater',
      'Premium sauna stones included',
      'Cedar wood construction',
      'Weather-resistant exterior',
      'Extended seating capacity'
    ],
    dimensions: '10ft L x 7ft Dia',
    installationTime: 'Same day delivery and installation',
    warranty: '5 years structural',
  },
  {
    id: 'traditional-sauna-4',
    name: 'Traditional Indoor Sauna 4-Person',
    model: 'Traditional 4P',
    price: 22800, // was 19000, +20%
    category: 'deluxe',
    image: '/lovable-uploads/barrel-sauna.webp',
    capacity: '4 persons',
    heaterPower: '6kW',
    description: 'Classic indoor sauna with traditional design, perfect for home installation. Includes permits and installation.',
    features: [
      'Nordic spruce wood construction',
      'Tempered glass door',
      '6kW electric heater',
      'Interior LED lighting',
      'Ergonomic benches',
      'Sauna stones included',
      'Ventilation system',
      'Control panel included'
    ],
    dimensions: '7ft x 6ft x 7ft H',
    installationTime: 'Professional installation within 2 days',
    warranty: '3 years structural',
  },
  {
    id: 'infrared-sauna-2',
    name: 'Infrared Sauna 2-Person',
    model: 'Infrared 2P',
    price: 30000, // was 25000, +20%
    category: 'compact',
    image: '/lovable-uploads/barrel-sauna.webp',
    capacity: '2 persons',
    heaterPower: 'Infrared',
    description: 'Modern infrared sauna with carbon fiber heaters for efficient heating. Includes permits and installation.',
    features: [
      'Carbon fiber infrared heaters',
      'Hemlock wood construction',
      'Chromotherapy lighting',
      'Bluetooth audio system',
      'Digital control panel',
      'Low EMF technology',
      'Easy assembly',
      'Energy efficient'
    ],
    dimensions: '5ft x 4ft x 6.5ft H',
    installationTime: 'DIY assembly or professional installation available',
    warranty: '2 years parts and labor',
  }
];

export type Sauna = typeof saunas[0];
