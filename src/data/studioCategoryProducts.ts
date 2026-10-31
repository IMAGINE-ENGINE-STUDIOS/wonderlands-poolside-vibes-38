// Category data used by Wonderlands Studio so every main-page category is
// selectable in the Studio. Prices mirror the main-page sections exactly.
import screenEnclosurePremium from '@/assets/enclosures/screen-enclosure-premium.webp';
import screenEnclosureDeluxe from '@/assets/enclosures/screen-enclosure-deluxe.webp';
import aluminumFencing from '@/assets/fencing/aluminum-fencing.webp';
import lanaiStandardImg from '@/assets/enclosures/lanai-standard.webp';
import lanaiDeluxeImg from '@/assets/enclosures/lanai-deluxe.webp';
import lanaiPremiumImg from '@/assets/enclosures/lanai-premium.webp';

export interface StudioCategoryItem {
  name: string;
  price: number; // fixed price OR rate (see unit)
  unit?: 'sqft' | 'linear-ft';
  image: string;
  description?: string;
}

/** Screen Enclosures — $22 / $24 / $26 per sq ft (matches ScreenEnclosureSection) */
export const studioScreenEnclosures: StudioCategoryItem[] = [
  {
    name: 'Standard Screen Enclosure',
    price: 22,
    unit: 'sqft',
    image: '/media/8bf11ea9-c402-4834-a163-0876545498bd.webp',
    description: 'Basic aluminum frame screen enclosure with standard mesh screening',
  },
  {
    name: 'Deluxe Screen Enclosure',
    price: 24,
    unit: 'sqft',
    image: screenEnclosureDeluxe,
    description: 'Enhanced aluminum frame with upgraded mesh and hardware',
  },
  {
    name: 'Premium Screen Enclosure',
    price: 26,
    unit: 'sqft',
    image: screenEnclosurePremium,
    description: 'Top-tier aluminum construction with impact-resistant screening',
  },
];

/** Patio Fencing — $40 / $50 / $60 per linear ft (matches PatioFencingSection) */
export const studioFencing: StudioCategoryItem[] = [
  {
    name: '36" Aluminum Fence',
    price: 40,
    unit: 'linear-ft',
    image: aluminumFencing,
    description: 'Pool code compliant 36-inch aluminum fencing',
  },
  {
    name: '46" Aluminum Fence',
    price: 50,
    unit: 'linear-ft',
    image: aluminumFencing,
    description: 'Pool code compliant 46-inch aluminum fencing',
  },
  {
    name: '56" Aluminum Fence',
    price: 60,
    unit: 'linear-ft',
    image: aluminumFencing,
    description: 'Premium 56-inch aluminum fencing with enhanced security',
  },
];

/** Lanai — $60 / $80 / $100 per sq ft (matches LanaiSection) */
export const studioLanai: StudioCategoryItem[] = [
  {
    name: 'Standard Lanai',
    price: 60,
    unit: 'sqft',
    image: lanaiStandardImg,
    description: 'Foundation and roof included',
  },
  {
    name: 'Deluxe Lanai',
    price: 80,
    unit: 'sqft',
    image: lanaiDeluxeImg,
    description: 'Upgraded structure, foundation and roof included',
  },
  {
    name: 'Premium Lanai',
    price: 100,
    unit: 'sqft',
    image: lanaiPremiumImg,
    description: 'Top-tier structure, foundation and roof included',
  },
];

/** Automatic Covers — fixed prices (matches AutomaticCoversSection) */
export const studioCovers: StudioCategoryItem[] = [
  { name: 'Eclipse', price: 27000, image: '/media/1fd97401-223a-4a79-bf65-e7734138513e.webp', description: 'High-grade PVC safety cover, 10-year warranty' },
  { name: 'CS3000', price: 30000, image: '/media/5d870105-61a5-4d79-a200-33c70c5ac38f.webp', description: 'Multi-layer vinyl hybrid cover, 15-year warranty' },
  { name: 'Infinity 4000', price: 32000, image: '/media/695627f9-9391-4b1c-babd-a352309fd232.webp', description: 'Premium composite cover, 20-year warranty' },
  { name: 'Atom', price: 25000, image: '/media/91acd1a8-9997-4d59-8c6d-a8635810989b.webp', description: 'Insulated thermal cover, 12-year warranty' },
];
