import grassLightGreen from '@/assets/turf/grass-light-green.avif';
import grassDarkGreen from '@/assets/turf/grass-dark-green.avif';
import grassNaturalGreen from '@/assets/turf/grass-natural-green.avif';
import grassEmerald from '@/assets/turf/grass-emerald.avif';
import grassOlive from '@/assets/turf/grass-olive.avif';

export const PRICE_PER_SQFT = 25;

export interface ArtificialGrassOption {
  id: string;
  name: string;
  image: string;
  pricePerSqFt?: number;
}

export const artificialGrassOptions: ArtificialGrassOption[] = [
  { id: 'light-green', name: 'Light Green', image: grassLightGreen },
  { id: 'dark-green', name: 'Dark Green', image: grassDarkGreen },
  { id: 'natural-green', name: 'Natural Green', image: grassNaturalGreen },
  { id: 'emerald', name: 'Emerald', image: grassEmerald },
  { id: 'olive', name: 'Olive', image: grassOlive },
];

/** Price per sq ft for a specific grass product (falls back to the standard rate). */
export const getGrassPricePerSqFt = (name?: string): number => {
  const option = artificialGrassOptions.find((g) => g.name === name);
  return option?.pricePerSqFt ?? PRICE_PER_SQFT;
};

/** Total cost for a grass selection. */
export const calculateGrassCost = (area: string | number, name?: string): number => {
  const sqft = typeof area === 'number' ? area : parseFloat(area || '0');
  if (isNaN(sqft) || sqft <= 0) return 0;
  return sqft * getGrassPricePerSqFt(name);
};
