// Sauna catalog — models, specifications, pricing and imagery from Almost Heaven Saunas
import { getSaunaRetailPrice } from '@/lib/saunaPricing';

const CDN = 'https://cdn.shopify.com/s/files/1/0555/6355/0889';

const saunaCatalog = [
  {
    id: 'salem-2p',
    name: 'Salem 2 Person Barrel Sauna',
    model: 'Salem 2P',
    price: 4037,
    category: 'compact',
    image: `${CDN}/files/Salem_HT_White_BG_2048x2048_e8a5a203-eb46-40ae-a91a-f3be9e1d8655.jpg`,
    media: [
      { type: 'image' as const, url: `${CDN}/files/Salem_HT_White_BG_2048x2048_e8a5a203-eb46-40ae-a91a-f3be9e1d8655.jpg`, alt: 'Salem barrel sauna exterior' },
      { type: 'image' as const, url: `${CDN}/products/Barrel_Detail_Salem_Glass_1.jpg`, alt: 'Salem barrel sauna glass door detail' },
      { type: 'image' as const, url: `${CDN}/files/Sunset_Salem_Sauna.jpg`, alt: 'Salem barrel sauna at sunset' }
    ],
    capacity: '2 persons',
    heaterPower: '6kW KIP electric',
    description: 'The Salem seats two people, offering an authentic sauna experience in a compact design. Its comfortable bench provides the perfect spot to stretch out and unwind at home.',
    features: [
      'Rustic Western Red Cedar or Nordic Spruce staves',
      'Ball-and-socket lumber construction',
      'Tempered glass door',
      'Stainless steel bands and hardware',
      'Sauna stones and bucket & ladle included',
      'Two-person bench layout'
    ],
    dimensions: "5'L x 6' Dia",
    installationTime: 'Delivery and professional installation available',
    warranty: '5 years structural',
  },
  {
    id: 'pinnacle-4p',
    name: 'Pinnacle 4 Person Barrel Sauna',
    model: 'Pinnacle 4P',
    price: 5303,
    category: 'best-seller',
    image: `${CDN}/products/Barrel_Classic_Pinnacle_glass.jpg`,
    media: [
      { type: 'image' as const, url: `${CDN}/products/Barrel_Classic_Pinnacle_glass.jpg`, alt: 'Pinnacle barrel sauna with glass door' },
      { type: 'image' as const, url: `${CDN}/files/Almost_Heaven_Saunas_Pinnacle_Kyle_MacLennan_1.jpg`, alt: 'Pinnacle barrel sauna in backyard' },
      { type: 'image' as const, url: `${CDN}/files/Almost_Heaven_Saunas_Pinnacle_Kyle_MacLennan_2.jpg`, alt: 'Pinnacle barrel sauna detail' }
    ],
    capacity: '4 persons',
    heaterPower: '6kW KIP electric',
    description: "The 6' x 6' Pinnacle Barrel Sauna offers the perfect balance of cozy solo relaxation or space for four. Its comfortable benches let you stretch out, while its smart design and affordability make it a best-seller for any space.",
    features: [
      'Ball-and-socket lumber construction',
      'Tempered glass door',
      'Stainless steel bands and hardware',
      'Two facing benches',
      'Sauna stones and accessories included',
      'Weather-resistant exterior'
    ],
    dimensions: "6'L x 6' Dia",
    installationTime: 'Delivery and professional installation available',
    warranty: '5 years structural',
  },
  {
    id: 'watoga-24p-kit',
    name: 'Watoga 2-4 Person Barrel Sauna Kit',
    model: 'Watoga 2-4P',
    price: 6183,
    category: 'premium',
    image: `${CDN}/products/Barrel_Classic_Watoga_glass_2.jpg`,
    media: [
      { type: 'image' as const, url: `${CDN}/products/Barrel_Classic_Watoga_glass_2.jpg`, alt: 'Watoga barrel sauna exterior' },
      { type: 'image' as const, url: `${CDN}/products/Barrel_Classic_Watoga_glass.jpg`, alt: 'Watoga barrel sauna glass door' },
      { type: 'image' as const, url: `${CDN}/files/Watoga_Classic_Barrel_Ashley_R_edit.png`, alt: 'Watoga barrel sauna installed' }
    ],
    capacity: '2-4 persons',
    heaterPower: '6kW KIP Smart (WiFi)',
    description: "Sauna alone or with a few friends — the Watoga gives you the flexibility. This 6' x 5' barrel sauna fits up to four people and features a sleek glass door with no window for added privacy.",
    features: [
      '6kW KIP Smart Heater with Fenix controller',
      'Built-in WiFi control via MyHarvia 2 app',
      'Reaches 194°F in 45–60 minutes',
      'Sleek glass door, no window for privacy',
      'Ball-and-socket lumber construction',
      'Sauna stones and accessories included'
    ],
    dimensions: "5'L x 6' Dia",
    installationTime: 'Ships within 4 weeks of purchase',
    warranty: '5 years structural',
  },
  {
    id: 'allegheny-6p-cabin',
    name: 'Allegheny 6 Person Cabin Sauna',
    model: 'Allegheny 6P',
    price: 7505,
    category: 'cabin',
    image: `${CDN}/products/Cabin_Allegheny_white_BG.jpg`,
    media: [
      { type: 'image' as const, url: `${CDN}/products/Cabin_Allegheny_white_BG.jpg`, alt: 'Allegheny cabin sauna exterior' },
      { type: 'image' as const, url: `${CDN}/products/Cabin_Allegheny_4.jpg`, alt: 'Allegheny cabin sauna with porch' },
      { type: 'image' as const, url: `${CDN}/files/Almost_Heaven_Saunas_Allegheny_Verkler_4.jpg`, alt: 'Allegheny cabin sauna installed' }
    ],
    capacity: '6 persons',
    heaterPower: '8kW electric',
    description: 'The Allegheny Cabin Sauna is crafted from raw, untreated Nordic Spruce with an inviting front porch and sloped roof for all-weather durability. Dual-level benches let you customize your sauna experience.',
    features: [
      'Interlocking solid Nordic Spruce timber',
      'Front porch for cooling off',
      'Sloped roof for all-weather durability',
      'Dual-level bench seating',
      'Tempered glass door',
      'Sauna stones and accessories included'
    ],
    dimensions: "6' x 5' sauna room + porch",
    installationTime: 'Delivery and professional installation available',
    warranty: '5 years structural',
  },
  {
    id: 'essex-4p',
    name: 'Essex 4 Person Barrel Sauna',
    model: 'Essex 4P',
    price: 8548,
    category: 'premium',
    image: `${CDN}/files/Essex_Rustic_Cedar_White_BG.jpg`,
    media: [
      { type: 'image' as const, url: `${CDN}/files/Essex_Rustic_Cedar_White_BG.jpg`, alt: 'Essex barrel sauna in rustic cedar' },
      { type: 'image' as const, url: `${CDN}/files/8M0A9621_GARDEN_ST._HOME_HEAVENLY_SAUNA.jpg`, alt: 'Essex barrel sauna in garden' },
      { type: 'image' as const, url: `${CDN}/files/Essex_Rustic_Cedar_Cradle_Detail.jpg`, alt: 'Essex barrel sauna cradle detail' }
    ],
    capacity: '4 persons',
    heaterPower: '8kW KIP electric (wood-burning optional)',
    description: "The 7' x 6' Essex Sauna is the smallest barrel sauna compatible with a wood-burning heater, providing the warmth of real fire. It seats up to four people with ample space to relax.",
    features: [
      '8kW KIP electric heater included',
      'Wood-burning heater upgrade available',
      'Rustic Western Red Cedar staves',
      'Tempered glass door',
      'Stainless steel bands and hardware',
      'Sauna stones and accessories included'
    ],
    dimensions: "6'L x 7' Dia",
    installationTime: 'Delivery and professional installation available',
    warranty: '5 years structural',
  },
  {
    id: 'seneca-6p',
    name: 'Seneca 6 Person Barrel Sauna',
    model: 'Seneca 6P',
    price: 8844,
    category: 'premium',
    image: `${CDN}/products/Senecca_7652.jpg`,
    media: [
      { type: 'image' as const, url: `${CDN}/products/Senecca_7652.jpg`, alt: 'Seneca barrel sauna exterior' },
      { type: 'image' as const, url: `${CDN}/products/Senecca_7800_AH_Sitecopy.jpg`, alt: 'Seneca barrel sauna in backyard' },
      { type: 'image' as const, url: `${CDN}/products/Almost_Heaven_Seneca_Barrel_Interior.png`, alt: 'Seneca barrel sauna interior' }
    ],
    capacity: '6 persons',
    heaterPower: '8kW electric',
    description: "The 7' x 7' Seneca Barrel Sauna offers extra space — a full foot wider than standard models — comfortably seating up to six people with extra-wide benches.",
    features: [
      'Extra-wide 7-foot diameter barrel',
      'Extra-wide benches for six',
      'Ball-and-socket lumber construction',
      'Tempered glass door',
      'Stainless steel bands and hardware',
      'Sauna stones and accessories included'
    ],
    dimensions: "7'L x 7' Dia",
    installationTime: 'Delivery and professional installation available',
    warranty: '5 years structural',
  },
  {
    id: 'shenandoah-4p',
    name: 'Shenandoah 4 Person Barrel Sauna',
    model: 'Shenandoah 4P',
    price: 10650,
    category: 'deluxe',
    image: `${CDN}/files/Almost_Heaven_Saunas_-_Shendandoah_-_Josh_Ciardullo_-_4_optimized_1000.png`,
    media: [
      { type: 'image' as const, url: `${CDN}/files/Almost_Heaven_Saunas_-_Shendandoah_-_Josh_Ciardullo_-_4_optimized_1000.png`, alt: 'Shenandoah barrel sauna exterior' },
      { type: 'image' as const, url: `${CDN}/files/Almost_Heaven_Saunas_-_Shendandoah_-_Josh_Ciardullo_-_6_optimized_1000.png`, alt: 'Shenandoah barrel sauna with changing room' },
      { type: 'image' as const, url: `${CDN}/files/Almost_Heaven_Saunas_-_Shendandoah_-_Josh_Ciardullo_-_5_optimized_1000.png`, alt: 'Shenandoah barrel sauna detail' }
    ],
    capacity: '4 persons',
    heaterPower: '8kW electric',
    description: 'At 10 feet long, the Shenandoah is the ultimate barrel sauna, featuring a 4-foot changing room and a 6-foot sauna room for the perfect blend of privacy and relaxation.',
    features: [
      '4-foot private changing room',
      '6-foot sauna room',
      'Ball-and-socket lumber construction',
      'Tempered glass door',
      'Stainless steel bands and hardware',
      'Sauna stones and accessories included'
    ],
    dimensions: "10'L x 6' Dia",
    installationTime: 'Delivery and professional installation available',
    warranty: '5 years structural',
  },
  {
    id: 'appalachia-6p-cabin',
    name: 'Appalachia 6 Person Cabin Sauna',
    model: 'Appalachia 6P',
    price: 8855,
    category: 'cabin',
    image: `${CDN}/files/Appalacia_white_background.png`,
    media: [
      { type: 'image' as const, url: `${CDN}/files/Appalacia_white_background.png`, alt: 'Appalachia cabin sauna exterior' },
      { type: 'image' as const, url: `${CDN}/files/Almost_Heaven_Saunas_Appalachia_complete.jpg`, alt: 'Appalachia cabin sauna with porch' },
      { type: 'image' as const, url: `${CDN}/files/Almost_Heaven_Saunas_Appalachia_Aristo2.jpg`, alt: 'Appalachia cabin sauna interior' }
    ],
    capacity: '6 persons',
    heaterPower: '8kW electric',
    description: 'The Appalachia Cabin Sauna blends traditional cabin charm with spacious design — a full front porch, attached changing room and a generously sized sauna room with two-tier bench seating for six.',
    features: [
      'Full front porch',
      'Attached enclosed changing room',
      'Two-tier bench seating for six',
      'Interlocking solid timber with sloped roof',
      'Classic railing details',
      'Sauna stones and accessories included'
    ],
    dimensions: "Sauna room + changing room + porch",
    installationTime: 'Delivery and professional installation available',
    warranty: '5 years structural',
  },
  {
    id: 'kuuma-46p-harvia',
    name: 'Kuuma 4-6 Person Classic Barrel Sauna — Harvia Collection',
    model: 'Kuuma 4-6P',
    price: 14132,
    category: 'harvia-collection',
    image: `${CDN}/files/Kumma.75DoorClosedLQ.jpg`,
    media: [
      { type: 'image' as const, url: `${CDN}/files/Kumma.75DoorClosedLQ.jpg`, alt: 'Kuuma barrel sauna exterior' },
      { type: 'image' as const, url: `${CDN}/files/KummaSideLQ.jpg`, alt: 'Kuuma barrel sauna side view' }
    ],
    capacity: '4-6 persons',
    heaterPower: '8kW Harvia electric or wood-burning',
    description: 'The Kuuma Barrel Sauna, part of the Harvia Collection — a spacious, luxurious retreat for 4–6 people in thermally modified Nordic Pine with smooth Linden benches and backrests.',
    features: [
      'Thermally modified Nordic Pine',
      'Linden benches and backrests',
      '8kW Harvia electric or wood-burning heater',
      'Full-length glass door',
      'Stainless steel hardware',
      'Sauna stones and accessories included'
    ],
    dimensions: "Classic barrel, 4-6 person",
    installationTime: 'Delivery and professional installation available',
    warranty: '5 years structural',
  },
  {
    id: 'takoa-half-moon-harvia',
    name: 'Takoa Half Moon Classic Barrel Sauna — Harvia Collection',
    model: 'Takoa 4-6P',
    price: 15273,
    category: 'harvia-collection',
    image: `${CDN}/files/Takoa_Half_Moon_Classic_Barrel_Sauna_Heritage_Collection_-_Almost_Heaven_Sauna.png`,
    media: [
      { type: 'image' as const, url: `${CDN}/files/Takoa_Half_Moon_Classic_Barrel_Sauna_Heritage_Collection_-_Almost_Heaven_Sauna.png`, alt: 'Takoa half moon barrel sauna' },
      { type: 'image' as const, url: `${CDN}/files/Takoa.75DoorClosedLQ.jpg`, alt: 'Takoa barrel sauna door closed' },
      { type: 'image' as const, url: `${CDN}/files/TakoaSideLQ.jpg`, alt: 'Takoa barrel sauna side view' }
    ],
    capacity: '4-6 persons',
    heaterPower: '8kW Harvia KIP',
    description: 'The Takoa Barrel Sauna, part of the Harvia Collection — a beautifully crafted retreat for 4–6 people with a half-moon rear window and full-length glass door.',
    features: [
      'Half-moon rear window',
      'Full-length glass door',
      'Thermally modified Nordic Pine',
      'Linden benches and backrests',
      '8kW Harvia KIP heater',
      'Sauna stones and accessories included'
    ],
    dimensions: "Classic barrel, 4-6 person",
    installationTime: 'Delivery and professional installation available',
    warranty: '5 years structural',
  },
  {
    id: 'magnus-6p-canopy-harvia',
    name: 'Magnus 6 Person Canopy Barrel Sauna — Harvia Collection',
    model: 'Magnus 6P',
    price: 16558,
    category: 'harvia-collection',
    image: `${CDN}/files/Almost_Heaven_Magnus_Sauna.jpg`,
    media: [
      { type: 'image' as const, url: `${CDN}/files/Almost_Heaven_Magnus_Sauna.jpg`, alt: 'Magnus canopy barrel sauna' },
      { type: 'image' as const, url: `${CDN}/files/Almost_Heaven_Magnus_Sauna_Side.jpg`, alt: 'Magnus canopy barrel sauna side view' }
    ],
    capacity: '6 persons',
    heaterPower: '8kW Harvia electric or wood-burning',
    description: 'The Magnus Canopy Barrel Sauna — a spacious retreat for up to six in thermally modified Nordic Pine with smooth Linden benches and exterior canopy benches for cooling off.',
    features: [
      'Exterior canopy with benches',
      'Thermally modified Nordic Pine',
      'Linden interior benches',
      '8kW Harvia electric or wood-burning heater',
      'Full-length glass door',
      'Sauna stones and accessories included'
    ],
    dimensions: "Canopy barrel, 6 person",
    installationTime: 'Delivery and professional installation available',
    warranty: '5 years structural',
  },
  {
    id: 'evander-6p-canopy-harvia',
    name: 'Evander Half-Moon Canopy Barrel Sauna — Harvia Collection',
    model: 'Evander 6P',
    price: 17653,
    category: 'harvia-collection',
    image: `${CDN}/files/Almost_Heaven_Sauna_Evander_6_Person_Sauna_1.png`,
    media: [
      { type: 'image' as const, url: `${CDN}/files/Almost_Heaven_Sauna_Evander_6_Person_Sauna_1.png`, alt: 'Evander canopy barrel sauna' },
      { type: 'image' as const, url: `${CDN}/files/Almost_Heaven_Sauna_Evander_6_Person_Sauna_2.png`, alt: 'Evander canopy barrel sauna side' },
      { type: 'image' as const, url: `${CDN}/files/Almost_Heaven_Sauna_Evander_6_Person_Sauna_3.png`, alt: 'Evander canopy barrel sauna interior' }
    ],
    capacity: '6 persons',
    heaterPower: 'Harvia electric',
    description: 'The Evander 6-Person Canopy Barrel Sauna combines timeless design with superior craftsmanship — panoramic views through the half-moon rear window and full-length glass door, plus exterior benches for cooling off.',
    features: [
      'Half-moon rear window',
      'Full-length glass door',
      'Exterior cooling benches',
      'Thermally modified Nordic Pine, knot-free finish',
      'Bright Linden interior',
      'Harvia heater with stones included'
    ],
    dimensions: "Canopy barrel, 6 person",
    installationTime: 'Delivery and professional installation available',
    warranty: '5 years structural',
  }
];

/**
 * Customer-facing catalog: supplier cost is converted to a turnkey retail price
 * that includes freight, local delivery, installation, electrical, overhead and
 * profit. `unitCost` stays available for the passcode-protected sales view only.
 */
export const saunas = saunaCatalog.map(sauna => ({
  ...sauna,
  unitCost: sauna.price,
  price: getSaunaRetailPrice(sauna.price, sauna.capacity),
}));

export type Sauna = typeof saunas[0];
