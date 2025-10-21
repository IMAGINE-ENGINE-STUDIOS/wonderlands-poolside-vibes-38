// Gilmer Glass Pools Data - 2025 Georgia Pricing (Dealer Price × 4)
import gilmerAloha from '@/assets/gilmer-aloha.png';
import gilmerAtlantis from '@/assets/gilmer-atlantis.png';
import gilmerBeachcomber from '@/assets/gilmer-beachcomber.png';
import gilmerBallagio from '@/assets/gilmer-ballagio.png';
import gilmerCapri from '@/assets/gilmer-capri.png';
import gilmerCaribbean from '@/assets/gilmer-caribbean.png';
import gilmerCoralCove from '@/assets/gilmer-coral-cove.png';
import gilmerCostaBrava from '@/assets/gilmer-costa-brava.png';
import gilmerEmerald from '@/assets/gilmer-emerald.png';
import gilmerGoldCoast from '@/assets/gilmer-gold-coast.png';
import gilmerGrandCayman from '@/assets/gilmer-grand-cayman.png';
import gilmerIslander from '@/assets/gilmer-islander.png';
import gilmerMajestic from '@/assets/gilmer-majestic.png';
import gilmerMystic from '@/assets/gilmer-mystic.png';
import gilmerNeptune from '@/assets/gilmer-neptune.png';
import gilmerNewport from '@/assets/gilmer-newport.png';
import gilmerPonceXL from '@/assets/gilmer-ponce-xl.png';
import gilmerRegalPlunge from '@/assets/gilmer-regal-plunge.png';
import gilmerRetreat from '@/assets/gilmer-retreat.png';
import gilmerRoman from '@/assets/gilmer-roman.png';
import gilmerSerafina from '@/assets/gilmer-serafina.png';
import gilmerSerenade from '@/assets/gilmer-serenade.png';
import gilmerSilverShore from '@/assets/gilmer-silver-shore.png';
import gilmerRegal from '@/assets/gilmer-regal.png';

export const gilmerPools = [
  // Small & Compact Models
  {
    model: "Serafina",
    dimensions: "8'6\" x 14'",
    depth: "4'",
    price: 40940, // $10,235 × 4
    image: gilmerSerafina,
    warranty: "Life Warranty",
    brand: "Gilmer Glass",
    type: "Fiber Pool",
    category: "compact",
    installationTimeWeeks: 8,
    concreteInstallationWeeks: 18
  },
  {
    model: "Coral Cove",
    dimensions: "9'6\" x 16'",
    depth: "4'",
    price: 44000, // $11,000 × 4
    image: gilmerCoralCove,
    warranty: "Life Warranty",
    brand: "Gilmer Glass",
    type: "Fiber Pool",
    category: "compact",
    installationTimeWeeks: 8,
    concreteInstallationWeeks: 18
  },
  {
    model: "Retreat",
    dimensions: "10'3\" x 18'5\"",
    depth: "4'4\"",
    price: 43300, // $10,825 × 4
    image: gilmerRetreat,
    warranty: "Life Warranty",
    brand: "Gilmer Glass",
    type: "Fiber Pool",
    category: "compact",
    installationTimeWeeks: 8,
    concreteInstallationWeeks: 18
  },
  {
    model: "Regal Plunge",
    dimensions: "10' x 16'",
    depth: "5'5\"",
    price: 48500, // $12,125 × 4
    image: gilmerRegalPlunge,
    warranty: "Life Warranty",
    brand: "Gilmer Glass",
    type: "Fiber Pool",
    category: "compact",
    installationTimeWeeks: 8,
    concreteInstallationWeeks: 18
  },
  {
    model: "Regal",
    dimensions: "10' x 20'",
    depth: "5'4\"",
    price: 56000, // $14,000 × 4
    image: gilmerRegal,
    warranty: "Life Warranty",
    brand: "Gilmer Glass",
    type: "Fiber Pool",
    category: "standard",
    installationTimeWeeks: 8,
    concreteInstallationWeeks: 18
  },
  {
    model: "Mini Extreme",
    dimensions: "8'2\" x 20'",
    depth: "5'",
    price: 66000, // $16,500 × 4
    image: "/lovable-uploads/gilmer-extreme-27.jpeg", // placeholder
    warranty: "Life Warranty",
    brand: "Gilmer Glass",
    type: "Fiber Pool",
    category: "standard",
    installationTimeWeeks: 8,
    concreteInstallationWeeks: 18
  },
  
  // Medium Models
  {
    model: "Caribbean",
    dimensions: "11' x 20'",
    depth: "5'",
    price: 55060, // $13,765 × 4
    image: gilmerCaribbean,
    warranty: "Life Warranty",
    brand: "Gilmer Glass",
    type: "Fiber Pool",
    category: "standard",
    installationTimeWeeks: 8,
    concreteInstallationWeeks: 18
  },
  {
    model: "Neptune",
    dimensions: "11' x 23'",
    depth: "5'6\"",
    price: 58824, // $14,706 × 4
    image: gilmerNeptune,
    warranty: "Life Warranty",
    brand: "Gilmer Glass",
    type: "Fiber Pool",
    category: "standard",
    installationTimeWeeks: 8,
    concreteInstallationWeeks: 18
  },
  {
    model: "Islander",
    dimensions: "12' x 24'",
    depth: "5'6\"",
    price: 56000, // $14,000 × 4
    image: gilmerIslander,
    warranty: "Life Warranty",
    brand: "Gilmer Glass",
    type: "Fiber Pool",
    category: "standard",
    installationTimeWeeks: 8,
    concreteInstallationWeeks: 18
  },
  {
    model: "Emerald",
    dimensions: "12' x 25'",
    depth: "5'7\"",
    price: 58824, // $14,706 × 4
    image: gilmerEmerald,
    warranty: "Life Warranty",
    brand: "Gilmer Glass",
    type: "Fiber Pool",
    category: "standard",
    installationTimeWeeks: 8,
    concreteInstallationWeeks: 18
  },
  {
    model: "Roman",
    dimensions: "11' x 27'",
    depth: "6'2\"",
    price: 66000, // $16,500 × 4
    image: gilmerRoman,
    warranty: "Life Warranty",
    brand: "Gilmer Glass",
    type: "Fiber Pool",
    category: "deluxe",
    installationTimeWeeks: 8,
    concreteInstallationWeeks: 18
  },
  {
    model: "Superior",
    dimensions: "12' x 25'8\"",
    depth: "5'6\"",
    price: 66000, // $16,500 × 4
    image: "/lovable-uploads/gilmer-serafina.png", // placeholder
    warranty: "Life Warranty",
    brand: "Gilmer Glass",
    type: "Fiber Pool",
    category: "deluxe",
    installationTimeWeeks: 8,
    concreteInstallationWeeks: 18
  },
  {
    model: "Capri",
    dimensions: "12' x 28'",
    depth: "4'6\"",
    price: 63528, // $15,882 × 4
    image: gilmerCapri,
    warranty: "Life Warranty",
    brand: "Gilmer Glass",
    type: "Fiber Pool",
    category: "deluxe",
    installationTimeWeeks: 8,
    concreteInstallationWeeks: 18
  },
  {
    model: "Costa Brava",
    dimensions: "12' x 29'",
    depth: "6'",
    price: 63528, // $15,882 × 4
    image: gilmerCostaBrava,
    warranty: "Life Warranty",
    brand: "Gilmer Glass",
    type: "Fiber Pool",
    category: "deluxe",
    installationTimeWeeks: 8,
    concreteInstallationWeeks: 18
  },
  {
    model: "Majestic",
    dimensions: "13' x 25'6\"",
    depth: "6'",
    price: 62300, // $15,575 × 4
    image: gilmerMajestic,
    warranty: "Life Warranty",
    brand: "Gilmer Glass",
    type: "Fiber Pool",
    category: "deluxe",
    installationTimeWeeks: 8,
    concreteInstallationWeeks: 18
  },
  
  // Premium Models with Built-in Spas
  {
    model: "Gold Coast w/ built-in Spa",
    dimensions: "14' x 28'",
    depth: "5'8\"",
    price: 86000, // $21,500 × 4
    image: gilmerGoldCoast,
    warranty: "Life Warranty",
    brand: "Gilmer Glass",
    type: "Fiber Pool",
    category: "premium",
    installationTimeWeeks: 8,
    concreteInstallationWeeks: 18
  },
  {
    model: "Atlantis",
    dimensions: "14' x 32'",
    depth: "6'",
    price: 86000, // $21,500 × 4
    image: gilmerAtlantis,
    warranty: "Life Warranty",
    brand: "Gilmer Glass",
    type: "Fiber Pool",
    category: "premium",
    installationTimeWeeks: 8,
    concreteInstallationWeeks: 18
  },
  {
    model: "Extreme 27 w/ built-in Spa & Splash Deck",
    dimensions: "12'6\" x 27'",
    depth: "5'11\"",
    price: 76000, // $19,000 × 4
    image: "/lovable-uploads/gilmer-extreme-27.jpeg",
    media: [
      { type: 'image' as const, url: "/lovable-uploads/gilmer-extreme-27.jpeg", alt: "Extreme 27 main view" },
      { type: 'image' as const, url: "/lovable-uploads/gilmer-extreme-38.jpeg", alt: "Extreme 27 side view" },
      { type: 'image' as const, url: "/lovable-uploads/c7c3ab88-34ab-47d4-bf6c-38893a5b13f2.png", alt: "Extreme 27 installed" }
    ],
    warranty: "Life Warranty",
    brand: "Gilmer Glass",
    type: "Fiber Pool",
    category: "premium",
    installationTimeWeeks: 8,
    concreteInstallationWeeks: 18
  },
  {
    model: "Tortola",
    dimensions: "14' x 30'",
    depth: "6'",
    price: 78000, // $19,500 × 4
    image: "/lovable-uploads/gilmer-tortola.jpeg",
    warranty: "Life Warranty",
    brand: "Gilmer Glass",
    type: "Fiber Pool",
    category: "premium",
    installationTimeWeeks: 8,
    concreteInstallationWeeks: 18
  },
  
  // Large Premium Models
  {
    model: "Silver Shore",
    dimensions: "15' x 28'",
    depth: "6'",
    price: 65500, // $16,375 × 4
    image: gilmerSilverShore,
    warranty: "Life Warranty",
    brand: "Gilmer Glass",
    type: "Fiber Pool",
    category: "premium",
    installationTimeWeeks: 8,
    concreteInstallationWeeks: 18
  },
  {
    model: "Mystic",
    dimensions: "15' x 32'",
    depth: "6'",
    price: 88000, // $22,000 × 4
    image: gilmerMystic,
    warranty: "Life Warranty",
    brand: "Gilmer Glass",
    type: "Fiber Pool",
    category: "premium",
    installationTimeWeeks: 8,
    concreteInstallationWeeks: 18
  },
  {
    model: "Aloha",
    dimensions: "15' x 34'",
    depth: "6'",
    price: 88000, // $22,000 × 4
    image: gilmerAloha,
    warranty: "Life Warranty",
    brand: "Gilmer Glass",
    type: "Fiber Pool",
    category: "premium",
    installationTimeWeeks: 8,
    concreteInstallationWeeks: 18
  },
  {
    model: "Bellagio",
    dimensions: "15' x 34'",
    depth: "6'6\"",
    price: 88000, // $22,000 × 4
    image: gilmerBallagio,
    warranty: "Life Warranty",
    brand: "Gilmer Glass",
    type: "Fiber Pool",
    category: "premium",
    installationTimeWeeks: 8,
    concreteInstallationWeeks: 18
  },
  {
    model: "Extreme 38 w/ built-in Spa & Splash Deck",
    dimensions: "15'6\" x 38'",
    depth: "7'",
    price: 106000, // $26,500 × 4
    image: "/lovable-uploads/gilmer-extreme-38.jpeg",
    warranty: "Life Warranty",
    brand: "Gilmer Glass",
    type: "Fiber Pool",
    category: "premium",
    installationTimeWeeks: 8,
    concreteInstallationWeeks: 18
  },
  {
    model: "Ponce XL",
    dimensions: "15'6\" x 32'",
    depth: "6'",
    price: 94000, // $23,500 × 4
    image: gilmerPonceXL,
    warranty: "Life Warranty",
    brand: "Gilmer Glass",
    type: "Fiber Pool",
    category: "premium",
    installationTimeWeeks: 8,
    concreteInstallationWeeks: 18
  },
  {
    model: "Newport",
    dimensions: "16' x 35'",
    depth: "6'",
    price: 88000, // $22,000 × 4
    image: gilmerNewport,
    warranty: "Life Warranty",
    brand: "Gilmer Glass",
    type: "Fiber Pool",
    category: "premium",
    installationTimeWeeks: 8,
    concreteInstallationWeeks: 18
  },
  {
    model: "Serenade w/ built-in Spa",
    dimensions: "16' x 38'",
    depth: "6'",
    price: 114824, // $28,706 × 4
    image: gilmerSerenade,
    warranty: "Life Warranty",
    brand: "Gilmer Glass",
    type: "Fiber Pool",
    category: "premium",
    installationTimeWeeks: 8,
    concreteInstallationWeeks: 18
  },
  {
    model: "Beachcomber",
    dimensions: "16' x 40'",
    depth: "8'",
    price: 114824, // $28,706 × 4
    image: gilmerBeachcomber,
    warranty: "Life Warranty",
    brand: "Gilmer Glass",
    type: "Fiber Pool",
    category: "premium",
    installationTimeWeeks: 8,
    concreteInstallationWeeks: 18
  },
  {
    model: "Vision",
    dimensions: "16' x 41'",
    depth: "6'6\"",
    price: 114824, // $28,706 × 4
    image: "/lovable-uploads/gilmer-serafina.png", // placeholder
    warranty: "Life Warranty",
    brand: "Gilmer Glass",
    type: "Fiber Pool",
    category: "premium",
    installationTimeWeeks: 8,
    concreteInstallationWeeks: 18
  },
  {
    model: "Grand Cayman",
    dimensions: "16' x 42'",
    depth: "8'",
    price: 114824, // $28,706 × 4
    image: gilmerGrandCayman,
    warranty: "Life Warranty",
    brand: "Gilmer Glass",
    type: "Fiber Pool",
    category: "premium",
    installationTimeWeeks: 8,
    concreteInstallationWeeks: 18
  }
];