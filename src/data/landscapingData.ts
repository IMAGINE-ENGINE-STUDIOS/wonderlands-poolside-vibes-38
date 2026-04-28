// Landscaping plant catalog
// Base prices are wholesale costs. Final retail price = base * MARKUP.
// Source: Wonderlands landscaping price list.

import imgShrub from "@/assets/landscaping/cat-shrub.jpg";
import imgTree from "@/assets/landscaping/cat-tree.jpg";
import imgPalm from "@/assets/landscaping/cat-palm.jpg";
import imgGrass from "@/assets/landscaping/cat-grass.jpg";
import imgFlowering from "@/assets/landscaping/cat-flowering.jpg";
import imgVine from "@/assets/landscaping/cat-vine.jpg";
import imgTropical from "@/assets/landscaping/cat-tropical.jpg";
import imgGroundcover from "@/assets/landscaping/cat-groundcover.jpg";
import imgFruit from "@/assets/landscaping/cat-fruit.jpg";
import imgTopiary from "@/assets/landscaping/cat-topiary.jpg";

export const LANDSCAPING_MARKUP = 3;

export type LandscapingCategory =
  | "Shrubs"
  | "Trees"
  | "Palms"
  | "Grasses"
  | "Flowering"
  | "Vines"
  | "Tropicals"
  | "Groundcover"
  | "Fruit Trees"
  | "Topiary";

export type PlantSize =
  | '1 gal'
  | '3 gal'
  | '7 gal'
  | '15 gal'
  | '30 gal'
  | '45 gal'
  | 'B&B'
  | '2"'
  | '4"'
  | '6"';

export interface PlantSizeOption {
  size: PlantSize;
  basePrice: number;
  finalPrice: number;
}

export interface LandscapingPlant {
  id: string;
  name: string;
  category: LandscapingCategory;
  image: string;
  sizes: PlantSizeOption[];
  minPrice: number;
}

const IMG: Record<LandscapingCategory, string> = {
  Shrubs: imgShrub,
  Trees: imgTree,
  Palms: imgPalm,
  Grasses: imgGrass,
  Flowering: imgFlowering,
  Vines: imgVine,
  Tropicals: imgTropical,
  Groundcover: imgGroundcover,
  "Fruit Trees": imgFruit,
  Topiary: imgTopiary,
};

// Compact source data: [name, category, [size, basePrice][]]
type Row = [string, LandscapingCategory, [PlantSize, number][]];

const ROWS: Row[] = [
  ["Abelia (Light Pink)", "Flowering", [["3 gal", 11.95]]],
  ["Arboricola - Trinette", "Shrubs", [["3 gal", 14.95], ["7 gal", 32.50]]],
  ["African Iris (Yellow & White)", "Flowering", [["3 gal", 14.95]]],
  ["Agapanthus (Blue)", "Flowering", [["1 gal", 4.95], ["3 gal", 14.95]]],
  ["Allamanda (Bush)", "Flowering", [["3 gal", 14.95]]],
  ["Allamanda (Dwarf)", "Flowering", [["3 gal", 14.95]]],
  ["Anise (Yellow)", "Shrubs", [["3 gal", 14.95], ["7 gal", 32.50]]],
  ["Apostle Iris", "Flowering", [["3 gal", 16.95]]],
  ["Azalea Red & Lav. Formosa, GG Gerb, Fashion", "Flowering", [["3 gal", 14.95], ["7 gal", 32.50]]],
  ["Azalea ENCORE", "Flowering", [["3 gal", 24.95]]],
  ["Aztec Grass", "Grasses", [["1 gal", 4.95]]],
  ["Bald Cypress", "Trees", [["30 gal", 185.00], ["45 gal", 325.00]]],
  ["Banana - fruit bearing (Double Mahoi)", "Fruit Trees", [["3 gal", 14.95], ["7 gal", 29.95], ["15 gal", 44.95]]],
  ["Bird of Paradise (Orange)", "Tropicals", [["7 gal", 32.50], ["15 gal", 55.00]]],
  ["Bird of Paradise (White)", "Tropicals", [["7 gal", 32.50], ["15 gal", 55.00], ["30 gal", 115.00], ["45 gal", 195.00]]],
  ["Blue Daze", "Groundcover", [["1 gal", 4.95]]],
  ["Bottlebrush Better John (Dwarf)", "Shrubs", [["3 gal", 22.95]]],
  ["Bottlebrush Red Cluster (Bush)", "Shrubs", [["3 gal", 16.95], ["7 gal", 37.50], ["15 gal", 65.00], ["30 gal", 225.00]]],
  ["Bottlebrush Red Cluster (Standard)", "Trees", [["15 gal", 135.00], ["30 gal", 245.00], ["45 gal", 375.00]]],
  ["Bougainvillea (Standard)", "Flowering", [["15 gal", 95.00], ["30 gal", 115.00], ["45 gal", 250.00]]],
  ["Bougainvillea Bush", "Flowering", [["3 gal", 19.95], ["7 gal", 44.95], ["15 gal", 79.95]]],
  ["Bougainvillea Trellis", "Vines", [["3 gal", 24.95], ["7 gal", 65.00], ["15 gal", 115.00], ["30 gal", 295.00]]],
  ["Bromeliad", "Tropicals", [["3 gal", 14.95], ["7 gal", 32.50], ["15 gal", 65.00]]],
  ["Buddleia (Butterfly Bush)", "Flowering", [["1 gal", 6.95], ["3 gal", 16.95]]],
  ["Bulbine (Yellow)", "Flowering", [["1 gal", 4.95]]],
  ["Burfordii Holly (Dwarf)", "Shrubs", [["3 gal", 14.95], ["7 gal", 32.50]]],
  ["Buttonwood", "Shrubs", [["3 gal", 14.95]]],
  ["Camellia", "Flowering", [["3 gal", 29.95], ["7 gal", 65.95], ["15 gal", 99.95]]],
  ["Canna Lily", "Flowering", [["1 gal", 6.95], ["3 gal", 19.95]]],
  ["Cast Iron Plant", "Shrubs", [["3 gal", 19.95]]],
  ["Cigar Plant", "Flowering", [["3 gal", 14.95]]],
  ["Clerodendrum - Starburst", "Flowering", [["3 gal", 16.95]]],
  ["Clusia (Autograph Plant)", "Shrubs", [["3 gal", 16.95], ["15 gal", 55.00]]],
  ["Coco Plum", "Shrubs", [["3 gal", 16.95], ["7 gal", 45.00]]],
  ["Copper Plant (Red)", "Shrubs", [["3 gal", 16.95], ["15 gal", 65.00]]],
  ["Cordyline - Auntie Lou", "Tropicals", [["3 gal", 14.95]]],
  ["Cordyline - Australis", "Tropicals", [["3 gal", 14.95]]],
  ["Cordyline - Black Magic", "Tropicals", [["3 gal", 14.95], ["7 gal", 32.50]]],
  ["Cordyline - Exotica", "Tropicals", [["3 gal", 14.95], ["7 gal", 44.95]]],
  ["Cordyline - Glauca (Green)", "Tropicals", [["3 gal", 14.95]]],
  ["Cordyline - Maria", "Tropicals", [["3 gal", 14.95]]],
  ["Cordyline - Red Sensation", "Tropicals", [["3 gal", 14.95]]],
  ["Cordyline - Red Sister", "Tropicals", [["3 gal", 14.95], ["7 gal", 32.95]]],
  ["Crape Myrtle MULTI - Natchez, Muskogee, Tuscarora", "Trees", [["15 gal", 95.00], ["30 gal", 215.00], ["45 gal", 350.00]]],
  ["Crape Myrtle STD - Natchez, Muskogee, Tuscarora", "Trees", [["30 gal", 250.00], ["45 gal", 395.00]]],
  ["Crape Myrtle MULTI - Dynamite, Double Feature, Enduring Summer", "Trees", [["15 gal", 115.00], ["30 gal", 225.00], ["45 gal", 375.00]]],
  ["Crape Myrtle MULTI - Ebony", "Trees", [["15 gal", 125.00], ["30 gal", 215.00], ["45 gal", 395.00]]],
  ["Crape Myrtle STD - Ebony", "Trees", [["30 gal", 150.00], ["45 gal", 275.00]]],
  ["Crinum Lily: Queen Emma & Green", "Flowering", [["3 gal", 29.95], ["7 gal", 65.00], ["15 gal", 85.00]]],
  ["Crossandra", "Flowering", [["3 gal", 14.95]]],
  ["Croton - Gold Dust", "Tropicals", [["3 gal", 14.95], ["7 gal", 42.95]]],
  ["Croton - Magnificent", "Tropicals", [["3 gal", 16.95], ["7 gal", 42.95]]],
  ["Croton - Mammy", "Tropicals", [["3 gal", 14.95], ["7 gal", 37.50]]],
  ["Croton - Petra", "Tropicals", [["1 gal", 7.50], ["3 gal", 14.95], ["7 gal", 37.50]]],
  ["Desert Rose", "Flowering", [["3 gal", 19.95], ["7 gal", 37.50]]],
  ["Dipladenia Bush (Red, Pink, White)", "Flowering", [["3 gal", 19.95]]],
  ["Dracaena (Carmen)", "Tropicals", [["3 gal", 16.95]]],
  ["Dracaena (Lemon Lime)", "Tropicals", [["3 gal", 16.95]]],
  ["Dracaena (Warneckei)", "Tropicals", [["3 gal", 16.95]]],
  ["Dracaena (Marginata)", "Tropicals", [["3 gal", 16.95]]],
  ["Dracaena (Song of India)", "Tropicals", [["3 gal", 14.95]]],
  ["Duranta - Purple Shower (Standard)", "Flowering", [["7 gal", 55.00]]],
  ["Duranta Shrub (Purple)", "Shrubs", [["3 gal", 14.95]]],
  ["Duranta Shrub (White)", "Shrubs", [["3 gal", 14.95]]],
  ["Eleagnus (Silverthorn)", "Shrubs", [["3 gal", 14.95], ["7 gal", 32.50]]],
  ["Eleagnus Variegated", "Shrubs", [["3 gal", 14.95], ["7 gal", 38.50]]],
  ["Elephant Ear", "Tropicals", [["3 gal", 16.95], ["7 gal", 45.00], ["15 gal", 75.00]]],
  ["Elm - Drake", "Trees", [["30 gal", 185.00]]],
  ["Elm - Winged", "Trees", [["30 gal", 185.00], ["45 gal", 385.00]]],
  ["Eugenia Topiary (2 ball)", "Topiary", [["3 gal", 35.00], ["7 gal", 75.00]]],
  ["Eugenia Topiary (3 ball)", "Topiary", [["3 gal", 40.00], ["7 gal", 85.00]]],
  ["Fakahatchee (Dwarf)", "Grasses", [["3 gal", 14.95]]],
  ["Fakahatchee (Regular)", "Grasses", [["3 gal", 14.95]]],
  ["False Rosemary", "Shrubs", [["3 gal", 14.95]]],
  ["Fern (Asparagus)", "Tropicals", [["3 gal", 14.95]]],
  ["Fern (Foxtail)", "Tropicals", [["3 gal", 14.95]]],
  ["Fern (Kimberly/Boston)", "Tropicals", [["1 gal", 6.95], ["3 gal", 14.95]]],
  ["Fern (Macho)", "Tropicals", [["1 gal", 6.95], ["3 gal", 14.95]]],
  ["Fiddle Leaf Fig", "Tropicals", [["3 gal", 16.95], ["7 gal", 60.00], ["15 gal", 115.00]]],
  ["Fire Bush (Dwarf)", "Flowering", [["3 gal", 14.95]]],
  ["Fire Cracker", "Flowering", [["3 gal", 14.95]]],
  ["Flax Lily", "Groundcover", [["1 gal", 4.95], ["3 gal", 14.95]]],
  ["Gardenia (Dwarf Bush, Frost proof)", "Flowering", [["3 gal", 16.95], ["7 gal", 42.50]]],
  ["Gardenia (Regular Bush)", "Flowering", [["3 gal", 16.95], ["7 gal", 45.00]]],
  ["Gardenia (Standard)", "Flowering", [["7 gal", 45.00], ["15 gal", 55.00], ["30 gal", 195.00]]],
  ["Ginger (Triostar)", "Tropicals", [["3 gal", 16.95]]],
  ["Ginger (Variegated)", "Tropicals", [["3 gal", 16.95]]],
  ["Golden Rain Tree", "Trees", [["30 gal", 185.00]]],
  ["Goldmound", "Shrubs", [["3 gal", 14.95]]],
  ["Heliconia (Orange)", "Tropicals", [["3 gal", 19.95]]],
  ["Hibiscus Bush (Basic)", "Flowering", [["3 gal", 16.95], ["7 gal", 37.50]]],
  ["Hibiscus Bush (Fiesta)", "Flowering", [["3 gal", 16.95]]],
  ["Hibiscus Bush (Hollywood)", "Flowering", [["3 gal", 19.95]]],
  ["Hibiscus Standard (Basic)", "Flowering", [["7 gal", 40.00], ["15 gal", 135.00]]],
  ["Hibiscus Standard (Premium & Fiesta)", "Flowering", [["7 gal", 45.00]]],
  ["Holly - Eagleston", "Trees", [["30 gal", 185.00], ["45 gal", 325.00]]],
  ["Holly - Weeping Yaupon", "Trees", [["30 gal", 225.00]]],
  ["Honeysuckle Staked (Coral)", "Vines", [["3 gal", 22.95]]],
  ['Ilex Schilling (12"x14")', "Shrubs", [["3 gal", 14.95], ["7 gal", 32.50]]],
  ["Indian Hawthorn", "Shrubs", [["3 gal", 14.95], ["7 gal", 32.50]]],
  ["Italian Cypress", "Trees", [["3 gal", 28.50], ["7 gal", 65.00], ["15 gal", 125.00], ["30 gal", 325.00], ["45 gal", 425.00]]],
  ["Ixora (Dwarf Taiwanese)", "Flowering", [["3 gal", 14.95]]],
  ["Ixora (Dwarf Yellow)", "Flowering", [["3 gal", 14.95]]],
  ["Ixora (Maui Red)", "Flowering", [["3 gal", 14.95], ["7 gal", 32.50]]],
  ["Ixora (Yellow)", "Flowering", [["3 gal", 14.95]]],
  ["Jacaranda", "Trees", [["15 gal", 70.00], ["30 gal", 145.00]]],
  ["Japanese Blueberry", "Trees", [["15 gal", 115.00], ["30 gal", 185.00], ["45 gal", 325.00]]],
  ["Japanese Boxwood", "Shrubs", [["3 gal", 14.95]]],
  ["Jasmine - Confederate (Green & Variegated)", "Vines", [["1 gal", 4.95], ["3 gal", 14.95]]],
  ["Jasmine - Confederate (Staked)", "Vines", [["3 gal", 19.95]]],
  ["Jasmine - Downy", "Vines", [["3 gal", 14.95]]],
  ["Jasmine - Night Blooming", "Flowering", [["3 gal", 14.95]]],
  ["Jasmine - Star", "Vines", [["3 gal", 14.95]]],
  ["Jasmine - Sweet (Standard)", "Vines", [["7 gal", 35.00]]],
  ["Jasmine Minima (Green)", "Groundcover", [["1 gal", 4.95]]],
  ["Jasmine Minima (Summer Sunset)", "Groundcover", [["1 gal", 4.95]]],
  ["Jasmine Minima (Variegated)", "Groundcover", [["1 gal", 4.95]]],
  ["Jatropha", "Flowering", [["3 gal", 14.95], ["7 gal", 45.00], ["15 gal", 110.00]]],
  ["Jatropha (Standard)", "Flowering", [["7 gal", 69.95], ["15 gal", 169.95]]],
  ["Joseph's Coat", "Groundcover", [["1 gal", 4.95], ["3 gal", 14.95]]],
  ["Juniper - Blue Pacific", "Groundcover", [["3 gal", 14.95]]],
  ["Juniper - Parsonii", "Groundcover", [["3 gal", 14.95]]],
  ["Juniper - Blue Point", "Shrubs", [["3 gal", 19.95]]],
  ["Lantana (Assorted)", "Flowering", [["1 gal", 4.95]]],
  ["Laurel Oak", "Trees", [["30 gal", 245.00], ["45 gal", 450.00]]],
  ["Lemon Grass", "Grasses", [["3 gal", 14.95]]],
  ["Leyland Cypress", "Trees", [["7 gal", 32.50], ["15 gal", 65.00], ["30 gal", 185.00], ["45 gal", 325.00]]],
  ["Ligustrum - Green", "Shrubs", [["3 gal", 14.95], ["7 gal", 32.50], ["15 gal", 65.00], ["30 gal", 185.00], ["45 gal", 325.00]]],
  ["Ligustrum - Howardii (Variegated)", "Shrubs", [["3 gal", 14.95], ["30 gal", 185.00], ["45 gal", 325.00]]],
  ["Ligustrum - Jack Frost", "Shrubs", [["3 gal", 14.95], ["7 gal", 32.50], ["30 gal", 185.00], ["45 gal", 325.00]]],
  ["Ligustrum - Recurve", "Shrubs", [["3 gal", 14.95], ["30 gal", 185.00], ["45 gal", 325.00]]],
  ["Ligustrum - Sunshine", "Shrubs", [["3 gal", 24.95], ["30 gal", 185.00]]],
  ["Liriope (Super Blue)", "Grasses", [["1 gal", 4.95], ["3 gal", 14.95]]],
  ["Live Oak", "Trees", [["30 gal", 245.00], ["45 gal", 450.00]]],
  ["Loropetalum 'Cerise Charm'", "Shrubs", [["3 gal", 19.95], ["7 gal", 32.95], ["15 gal", 75.00]]],
  ["Loropetalum (Standard)", "Shrubs", [["15 gal", 115.00]]],
  ["Loquat - fruit bearing", "Fruit Trees", [["15 gal", 79.95], ["30 gal", 185.00]]],
  ["Magnolia - DD Blanchard", "Trees", [["30 gal", 185.00], ["45 gal", 325.00]]],
  ["Magnolia - Little Gem", "Trees", [["15 gal", 135.00], ["30 gal", 185.00], ["45 gal", 325.00]]],
  ["Majestic Beauty (Indian Hawthorne standard)", "Trees", [["15 gal", 145.00], ["30 gal", 225.00]]],
  ["Mandevilla Trellis (Red, Pink, White)", "Vines", [["3 gal", 26.95]]],
  ["Mexican Flame Vine", "Vines", [["3 gal", 16.95]]],
  ["Mexican Heather (Purple)", "Flowering", [["1 gal", 5.95]]],
  ["Mexican Petunia (Dwarf Purple, Pink, White)", "Flowering", [["1 gal", 4.95]]],
  ["Mexican Petunia (Regular Purple)", "Flowering", [["1 gal", 4.95], ["3 gal", 14.95]]],
  ["Milkweed", "Flowering", [["1 gal", 6.95], ["3 gal", 14.95]]],
  ["Mondo Grass (Dwarf)", "Grasses", [["1 gal", 4.95]]],
  ["Muhly Grass", "Grasses", [["3 gal", 14.95]]],
  ["Mulberry - fruit bearing (Everbearing)", "Fruit Trees", [["7 gal", 40.00], ["15 gal", 85.00], ["30 gal", 185.00]]],
  ["Nandina Domestica", "Shrubs", [["3 gal", 14.95], ["7 gal", 32.50]]],
  ["Oleander - Calypso (Dark Pink)", "Flowering", [["3 gal", 16.95], ["30 gal", 185.00]]],
  ["Oleander - Cardinal Red (Multi-trunk)", "Flowering", [["3 gal", 14.95], ["30 gal", 185.00]]],
  ["Oleander - Cardinal Red (Shrub)", "Flowering", [["3 gal", 14.95]]],
  ["Oleander - Petite Pink (Shrub)", "Flowering", [["3 gal", 14.95]]],
  ["Oleander - White", "Flowering", [["3 gal", 14.95]]],
  ["Oleander (Standard)", "Flowering", [["7 gal", 35.00]]],
  ["Oyster Plant (Bi-Color)", "Groundcover", [["1 gal", 4.95]]],
  ["Oyster Plant (Tri-Color)", "Groundcover", [["1 gal", 4.95]]],
  ["Palm, Adonidia (Double/Triple)", "Palms", [["15 gal", 65.00], ["30 gal", 135.00], ["45 gal", 225.00], ["B&B", 325.00]]],
  ["Palm, Areca", "Palms", [["7 gal", 25.00], ["15 gal", 45.00], ["30 gal", 115.00], ["45 gal", 245.00], ["B&B", 325.00]]],
  ["Palm, Areca B&B XL", "Palms", [["B&B", 375.00]]],
  ["Palm, Bismark", "Palms", [["15 gal", 185.00], ["30 gal", 350.00], ["45 gal", 550.00], ["B&B", 750.00]]],
  ["Palm, Bottle (Single)", "Palms", [["15 gal", 65.00], ["30 gal", 135.00], ["45 gal", 185.00], ["B&B", 325.00]]],
  ["Palm, Bottle (Triple)", "Palms", [["30 gal", 225.00]]],
  ["Palm, Cabbage/Sabal", "Palms", [["B&B", 425.00]]],
  ["Palm, Canary Island Date (Pineapple)", "Palms", [["7 gal", 49.95], ["15 gal", 125.00], ["30 gal", 275.00], ["45 gal", 385.00]]],
  ["Palm, Cardboard", "Palms", [["3 gal", 24.95], ["7 gal", 69.95]]],
  ["Palm, Cat", "Palms", [["7 gal", 25.00], ["15 gal", 45.00]]],
  ["Palm, Chinese Fan", "Palms", [["7 gal", 25.00], ["15 gal", 45.00], ["30 gal", 75.00], ["45 gal", 165.00], ["B&B", 385.00]]],
  ["Palm, European Fan", "Palms", [["7 gal", 50.00], ["15 gal", 169.95], ["30 gal", 190.00], ["45 gal", 225.00], ["B&B", 3450.00]]],
  ["Palm, Fishtail", "Palms", [["7 gal", 25.00], ["15 gal", 95.00], ["30 gal", 185.00], ["45 gal", 285.00]]],
  ["Palm, Foxtail (Double)", "Palms", [["15 gal", 135.00], ["30 gal", 185.00], ["45 gal", 385.00]]],
  ["Palm, Foxtail (Single)", "Palms", [["7 gal", 45.00], ["15 gal", 135.00], ["30 gal", 185.00], ["45 gal", 325.00]]],
  ["Palm, Foxtail (Triple)", "Palms", [["15 gal", 150.00], ["30 gal", 185.00], ["45 gal", 385.00]]],
  ["Palm, Majesty", "Palms", [["7 gal", 25.00]]],
  ["Palm, Pindo", "Palms", [["30 gal", 185.00]]],
  ["Palm, Ponytail", "Palms", [["7 gal", 45.00], ["15 gal", 115.00]]],
  ["Palm, Queen", "Palms", [["7 gal", 45.00], ["15 gal", 105.00], ["30 gal", 185.00], ["45 gal", 325.00]]],
  ["Palm, Raphis", "Palms", [["15 gal", 95.00]]],
  ["Palm, Reclinata", "Palms", [["B&B", 2500.00]]],
  ["Palm, Roebellini (Triple)", "Palms", [["7 gal", 55.00], ["15 gal", 95.00], ["30 gal", 225.00], ["45 gal", 245.00]]],
  ["Palm, Sylvester", "Palms", [["15 gal", 145.00], ["30 gal", 225.00], ["45 gal", 425.00]]],
  ["Palm, Traveler's", "Palms", [["30 gal", 225.00]]],
  ["Palm, Windmill", "Palms", [["7 gal", 79.95], ["15 gal", 145.00], ["30 gal", 225.00]]],
  ["Pampas Grass", "Grasses", [["3 gal", 14.95], ["7 gal", 32.50]]],
  ["Panama Rose", "Flowering", [["3 gal", 14.95]]],
  ["Spathiphyllum (Peace Lily)", "Tropicals", [["1 gal", 6.95], ["3 gal", 24.95]]],
  ["Pentas (Red, White, Pink)", "Flowering", [["1 gal", 4.95]]],
  ["Perennial Peanut", "Groundcover", [["1 gal", 4.95]]],
  ["Pittosporum (Green)", "Shrubs", [["3 gal", 14.95], ["15 gal", 65.00]]],
  ["Pittosporum (Variegated)", "Shrubs", [["3 gal", 14.95]]],
  ["Plumbago (Blue)", "Flowering", [["3 gal", 14.95]]],
  ["Plumbago (White)", "Flowering", [["3 gal", 14.95]]],
  ["Plumeria", "Flowering", [["3 gal", 19.95], ["7 gal", 59.95]]],
  ["Podocarpus", "Shrubs", [["3 gal", 14.95], ["7 gal", 32.50], ["15 gal", 65.00], ["30 gal", 185.00]]],
  ["Podocarpus Pringles (Dwarf)", "Shrubs", [["3 gal", 16.95]]],
  ["Podocarpus XL", "Shrubs", [["30 gal", 225.00]]],
  ["Podocarpus Topiary / Trellis", "Topiary", [["15 gal", 169.95], ["30 gal", 350.00]]],
  ["Porterweed (Blue & Red)", "Flowering", [["1 gal", 4.95], ["3 gal", 16.95]]],
  ["Purple Leaf Plum", "Trees", [["15 gal", 65.00], ["30 gal", 135.00]]],
  ["Red Cedar", "Trees", [["15 gal", 65.00], ["30 gal", 145.00]]],
  ["Red Fountain Grass", "Grasses", [["3 gal", 14.95]]],
  ["Red Maple", "Trees", [["30 gal", 185.00]]],
  ["Rose - Knock Out: Dbl Red, Dbl Pink, Sun Yellow", "Flowering", [["3 gal", 22.95]]],
  ["Rose - Drift Rose", "Flowering", [["3 gal", 27.95]]],
  ["Royal Poinciana", "Trees", [["15 gal", 70.00], ["30 gal", 135.00]]],
  ["Ruellia (Purple & White)", "Flowering", [["3 gal", 14.95]]],
  ["Sago Palm", "Palms", [["7 gal", 25.00], ["15 gal", 55.00], ["30 gal", 135.00]]],
  ["Sanchezia (Zebra Plant)", "Tropicals", [["3 gal", 16.95]]],
  ["Sea Grape", "Shrubs", [["3 gal", 14.95]]],
  ["Sea Oats", "Grasses", [["3 gal", 14.95]]],
  ["Serissa", "Shrubs", [["3 gal", 14.95]]],
  ["Simpson Stopper", "Shrubs", [["3 gal", 14.95]]],
  ["Slash Pine", "Trees", [["30 gal", 135.00], ["45 gal", 185.00]]],
  ["Snake Plant (Sansevieria)", "Tropicals", [["3 gal", 16.95]]],
  ["Society Garlic", "Flowering", [["1 gal", 4.95]]],
  ["Soiree (Pink, White & Lavender)", "Flowering", [["1 gal", 4.95]]],
  ["Split Leaf", "Tropicals", [["3 gal", 16.95], ["7 gal", 32.50]]],
  ["Staghorn", "Tropicals", [["3 gal", 19.95]]],
  ["Succulents (Mixed Varieties)", "Tropicals", [['2"', 3.50], ['4"', 6.50], ['6"', 9.50]]],
  ["Sweet Gum", "Trees", [["30 gal", 185.00], ["45 gal", 325.00]]],
  ["Sycamore", "Trees", [["30 gal", 185.00], ["45 gal", 325.00]]],
  ["Texas Sage", "Shrubs", [["3 gal", 14.95]]],
  ["Thryallis", "Flowering", [["1 gal", 5.95], ["3 gal", 14.95]]],
  ["Tibouchina (Dwarf)", "Flowering", [["3 gal", 14.95]]],
  ["Tibouchina (Regular)", "Flowering", [["3 gal", 14.95]]],
  ["Tibouchina (Standard)", "Flowering", [["7 gal", 40.00]]],
  ["Viburnum - Dwarf Walters", "Shrubs", [["3 gal", 14.95]]],
  ["Viburnum - Odoratissimum", "Shrubs", [["3 gal", 14.95], ["7 gal", 32.50], ["15 gal", 65.00], ["30 gal", 185.00]]],
  ["Viburnum - Suspensum", "Shrubs", [["3 gal", 14.95], ["7 gal", 32.50]]],
  ["Viburnum - Walters Regular", "Shrubs", [["3 gal", 14.95], ["7 gal", 32.50], ["15 gal", 65.00]]],
  ["Wax Myrtle", "Shrubs", [["3 gal", 14.95], ["7 gal", 32.50], ["15 gal", 65.00], ["30 gal", 185.00]]],
  ["White Fountain Grass", "Grasses", [["3 gal", 14.95]]],
  ["Xanadu", "Tropicals", [["3 gal", 16.95], ["7 gal", 32.50]]],
];

const slugify = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export const landscapingPlants: LandscapingPlant[] = ROWS.map(([name, category, sizes]) => {
  const sizeOptions: PlantSizeOption[] = sizes.map(([size, basePrice]) => ({
    size,
    basePrice,
    finalPrice: Math.round(basePrice * LANDSCAPING_MARKUP * 100) / 100,
  }));
  return {
    id: `plant-${slugify(name)}`,
    name,
    category,
    image: IMG[category],
    sizes: sizeOptions,
    minPrice: Math.min(...sizeOptions.map((s) => s.finalPrice)),
  };
});

export const landscapingCategories: LandscapingCategory[] = [
  "Shrubs",
  "Trees",
  "Palms",
  "Grasses",
  "Flowering",
  "Vines",
  "Tropicals",
  "Groundcover",
  "Fruit Trees",
  "Topiary",
];
