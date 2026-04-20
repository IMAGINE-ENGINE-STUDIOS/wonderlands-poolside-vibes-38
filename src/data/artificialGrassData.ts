import grassLightGreen from '@/assets/grass-light-green.avif';
import grassDarkGreen from '@/assets/grass-dark-green.avif';
import grassNaturalGreen from '@/assets/grass-natural-green.avif';
import grassEmerald from '@/assets/grass-emerald.avif';
import grassOlive from '@/assets/grass-olive.avif';

export const PRICE_PER_SQFT = 25;

export interface ArtificialGrassOption {
  id: string;
  name: string;
  image: string;
}

export const artificialGrassOptions: ArtificialGrassOption[] = [
  { id: 'light-green', name: 'Light Green', image: grassLightGreen },
  { id: 'dark-green', name: 'Dark Green', image: grassDarkGreen },
  { id: 'natural-green', name: 'Natural Green', image: grassNaturalGreen },
  { id: 'emerald', name: 'Emerald', image: grassEmerald },
  { id: 'olive', name: 'Olive', image: grassOlive },
];
