import { useState } from "react";
import PoolDetailModal from "./PoolDetailModal";
import SurveyQuoteTool from "./SurveyQuoteTool";
import PoolProductCard from "./PoolProductCard";
import StripeCheckoutButton from "./StripeCheckoutButton";
import TileDetailModal from "./TileDetailModal";
import { useShoppingCart } from "./ShoppingCart";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Waves, Sparkles, Flame, Plus, Sun } from "lucide-react";

// Import shared pool data
import { poolLiners, poolTiles, tanningLedges } from "@/data/poolData";

// Debug logging
console.log('PoolCatalog - poolTiles:', poolTiles);
console.log('PoolCatalog - poolLiners:', poolLiners);

// Updated pool model images in order
const astoriaImage = "/lovable-uploads/c7c3ab88-34ab-47d4-bf6c-38893a5b13f2.png";
const apolloImage = "/lovable-uploads/9e491420-80df-4bb3-9db1-3933d96846ac.png";
const coralImage = "/lovable-uploads/1412e1fb-72ec-4219-a98f-4fcffbd15095.png";
const ariel14Image = "/lovable-uploads/a1b42616-0c25-4010-96e3-3fbeba18aae8.png";
const capecodImage = "/lovable-uploads/8a2b7716-7656-48a0-b1b1-6d276b4b9e73.png";

// Additional pool images
const freeformImage = "/lovable-uploads/9382c72a-0c7d-4981-8f03-878d568dd1b2.png";
const luxuryImage = "/lovable-uploads/8033278d-a737-4b1d-84bf-fd0ac9126406.png";
const modernImage = "/lovable-uploads/c5385549-a189-4127-a204-c196c165ac55.png";
import extremeImage from "@/assets/pools/extreme-27.jpg";
interface Pool {
  model: string;
  price: number;
  category: 'premium' | 'deluxe' | 'standard' | 'compact';
  material: 'fiberglass' | 'concrete';
  image?: string;
  dimensions?: string;
  depth?: string;
  features?: string[];
  galaPoints?: number;
  galaCategory?: string;
  installationTimeWeeks?: number;
  warrantyYears?: number | string;
  structureWarrantyYears?: number;
  handworkWarrantyYears?: number;
  heater?: boolean;
  saltSystem?: boolean;
  carbonFiber?: boolean;
  finishes?: string[];
  liners?: string[];
  covers?: string[];
}
interface Spa {
  model: string;
  price: number;
  category: 'premium' | 'deluxe' | 'standard';
  image?: string;
  dimensions?: string;
  depth?: string;
  features?: string[];
  spilloverFeature?: boolean;
  installationTimeWeeks?: number;
  warrantyYears?: number | string;
}

// Pool finish options
export const poolFinishes = ["Nantuke", "Esagoni", "Whitehaven", "Island Wave", "Durango Gray", "Vintage Blue", "Royal Blue", "Gulf Coast", "Hamper", "Indigo", "Cayman", "Mountain", "Carnegie", "Panama", "Corolla", "Summerwave", "Legends", "Z terrazzo", "Tullism", "Courtstone Gray", "Courtstone Blue"];

// Helper function to get pool price (no discounts)
const getPoolPrice = (pool: Pool) => {
  return pool.price;
};
const pools: Pool[] = [
// Most Popular - Standard Series (Special Offers & Best Value)
{
  model: "Mother Pearl",
  price: 130000,
  category: 'premium',
  material: 'concrete',
  image: "/src/assets/pools/mother-pearl-2.jpg",
  dimensions: "20' x 40'",
  depth: "3'11\" - 9'",
  installationTimeWeeks: 16,
  structureWarrantyYears: 10,
  handworkWarrantyYears: 5,
  features: ["Concrete Construction", "Large Swimming Area", "Deep End", "15% Discount Applied", "Premium Quality"],
  heater: false,
  saltSystem: false,
  carbonFiber: false
},
{
  model: "Extreme 27",
  price: 72000,
  category: 'premium',
  material: 'fiberglass',
  image: extremeImage,
  dimensions: "12'6\" x 27'",
  depth: "4'6\"– 5'11\"",
  installationTimeWeeks: 6,
  warrantyYears: "Life Warranty",
  features: ["Fiberglass Construction", "Rectangular Design", "Deep End", "Perfect for Swimming Laps", "Modern Aesthetic", "15% Discount Applied"],
  heater: false,
  saltSystem: false,
  carbonFiber: false
},
{
  model: "Astoria",
  price: 89999,
  category: 'standard',
  material: 'fiberglass',
  image: astoriaImage,
  dimensions: "14' x 35'",
  depth: "3'-6\" to 6'6\"; Spa 3′",
  installationTimeWeeks: 4,
  warrantyYears: "Life Warranty",
  features: ["Fiberglass Construction", "Space-Efficient Design", "Integrated Seating", "Easy Entry Steps", "Compact Footprint", "Special Offer"],
  heater: false,
  saltSystem: false,
  carbonFiber: false
}, {
  model: "Milan",
  price: 45300,
  category: 'standard',
  material: 'fiberglass',
  image: "/lovable-uploads/121eda70-3d05-4624-afb0-5dba766d8b2f.png",
  dimensions: "10′ × 16′",
  depth: "4′",
  installationTimeWeeks: 4,
  warrantyYears: "Lifetime",
  features: ["Fiberglass Construction", "Salt system included in final price", "Classic Design", "Perfect for Small Yards"],
  heater: false,
  saltSystem: true,
  carbonFiber: true
}, {
  model: "Jamaica",
  price: 46100,
  category: 'standard',
  material: 'fiberglass',
  image: "/lovable-uploads/e2d562f0-9a55-4293-8a9f-26d9b09ebf15.png",
  dimensions: "10′ × 20′",
  depth: "3′ 2″ – 5′",
  installationTimeWeeks: 4,
  warrantyYears: "Lifetime",
  features: ["Fiberglass Construction", "Salt system included in final price", "Family Friendly", "Shallow End"],
  heater: false,
  saltSystem: true,
  carbonFiber: true
}, {
  model: "Aruba",
  price: 51300,
  category: 'standard',
  material: 'fiberglass',
  image: "/lovable-uploads/ac53cd88-15e9-4f8a-a3c4-2cd4415b0ec5.png",
  dimensions: "11′ × 22′",
  depth: "3′ 6″ – 5′",
  installationTimeWeeks: 4,
  warrantyYears: "Lifetime",
  features: ["Fiberglass Construction", "Salt system included in final price", "Mid-Size Pool", "Great for Swimming"],
  heater: false,
  saltSystem: true,
  carbonFiber: true
}, {
  model: "Pleasant Cove",
  price: 51300,
  category: 'standard',
  material: 'fiberglass',
  image: "/lovable-uploads/997efdd7-a754-4836-98ac-05c5e9abaf0b.png",
  dimensions: "11′ × 22′",
  depth: "3′ 6″ – 5′ 6″",
  installationTimeWeeks: 4,
  warrantyYears: "Lifetime",
  features: ["Fiberglass Construction", "Salt system included in final price", "Elegant Design", "Versatile Depth"],
  heater: false,
  saltSystem: true,
  carbonFiber: true
},

// Compact Series - Perfect for Smaller Spaces
{
  model: "Bermuda",
  price: 31400,
  category: 'compact',
  material: 'fiberglass',
  image: "/lovable-uploads/65596856-c21b-46d4-abeb-e241bc3b39b0.png",
  dimensions: "8′ × 16′",
  depth: "4′",
  installationTimeWeeks: 3,
  warrantyYears: "Lifetime",
  features: ["Fiberglass Construction", "Salt system included in final price", "Compact Design", "Perfect for Small Yards"],
  heater: false,
  saltSystem: true,
  carbonFiber: true
}, {
  model: "St. Lucia",
  price: 33200,
  category: 'compact',
  material: 'fiberglass',
  image: "/lovable-uploads/d1c952c1-8786-444d-b405-903533bc20d1.png",
  dimensions: "8′ × 18′",
  depth: "4′",
  installationTimeWeeks: 3,
  warrantyYears: "Lifetime",
  features: ["Fiberglass Construction", "Salt system included in final price", "Elegant Curves", "Space Efficient"],
  heater: false,
  saltSystem: true,
  carbonFiber: true
}, {
  model: "Fiji",
  price: 36800,
  category: 'compact',
  material: 'fiberglass',
  image: "/lovable-uploads/58a4af60-11d8-4589-b955-f689476fc1b3.png",
  dimensions: "9′ × 20′",
  depth: "4′",
  installationTimeWeeks: 3,
  warrantyYears: "Lifetime",
  features: ["Fiberglass Construction", "Salt system included in final price", "Tropical Inspired", "Comfortable Size"],
  heater: false,
  saltSystem: true,
  carbonFiber: true
},

// Deluxe Series - Enhanced Features & Luxury
{
  model: "Apollo 14",
  price: 55600,
  category: 'deluxe',
  material: 'fiberglass',
  image: apolloImage,
  dimensions: "14′ × 30′",
  depth: "3′ 6″ – 5′ 6″",
  installationTimeWeeks: 5,
  warrantyYears: "Lifetime",
  features: ["Fiberglass Construction", "Salt system included in final price", "Classic Rectangle", "Perfect for Swimming"],
  heater: false,
  saltSystem: true,
  carbonFiber: true
}, {
  model: "Coral 16",
  price: 65400,
  category: 'deluxe',
  material: 'fiberglass',
  image: coralImage,
  dimensions: "16′ × 35′",
  depth: "3′ 6″ – 6′",
  installationTimeWeeks: 5,
  warrantyYears: "Lifetime",
  features: ["Fiberglass Construction", "Salt system included in final price", "Elegant Curves", "Spacious Design"],
  heater: false,
  saltSystem: true,
  carbonFiber: true
}, {
  model: "Ariel 16",
  price: 66700,
  category: 'deluxe',
  material: 'fiberglass',
  image: ariel14Image,
  dimensions: "16′ × 35′",
  depth: "3′ 6″ – 6′",
  installationTimeWeeks: 5,
  warrantyYears: "Lifetime",
  features: ["Fiberglass Construction", "Salt system included in final price", "Sophisticated Shape", "Premium Features"],
  heater: false,
  saltSystem: true,
  carbonFiber: true
}, {
  model: "Cape Cod",
  price: 68100,
  category: 'deluxe',
  material: 'fiberglass',
  image: capecodImage,
  dimensions: "16′ × 35′",
  depth: "3′ 6″ – 6′",
  installationTimeWeeks: 5,
  warrantyYears: "Lifetime",
  features: ["Fiberglass Construction", "Salt system included in final price", "Classic New England Style", "Timeless Design"],
  heater: false,
  saltSystem: true,
  carbonFiber: true
}, {
  model: "Valencia",
  price: 68900,
  category: 'deluxe',
  material: 'fiberglass',
  image: "/lovable-uploads/72a6a840-2aac-4daf-85ef-d02f6103bd18.png",
  dimensions: "16′ × 36′",
  depth: "3′ 6″ – 6′",
  installationTimeWeeks: 5,
  warrantyYears: "Lifetime",
  features: ["Fiberglass Construction", "Salt system included in final price", "Mediterranean Style", "Luxurious Appeal"],
  heater: false,
  saltSystem: true,
  carbonFiber: true
},

// Premium Collection - Ultimate Luxury Pools
{
  model: "Synergy",
  price: 75600,
  category: 'deluxe',
  material: 'fiberglass',
  image: "/lovable-uploads/dbd9d5bd-01b3-437a-95ea-8f14b0f487f8.png",
  dimensions: "16′ × 38′",
  depth: "4′ – 7′",
  installationTimeWeeks: 6,
  warrantyYears: "Lifetime",
  features: ["Fiberglass Construction", "Salt system included in final price", "Modern Geometric", "Deep End Swimming"],
  heater: false,
  saltSystem: true,
  carbonFiber: true
}, {
  model: "Montego",
  price: 79300,
  category: 'deluxe',
  material: 'fiberglass',
  image: "/lovable-uploads/822d9341-f6f8-46ee-9d13-07d0f2126252.png",
  dimensions: "16′ × 38′",
  depth: "3′ 6″ – 6′",
  installationTimeWeeks: 6,
  warrantyYears: "Lifetime",
  features: ["Fiberglass Construction", "Salt system included in final price", "Tropical Paradise", "Curved Beauty"],
  heater: false,
  saltSystem: true,
  carbonFiber: true
}, {
  model: "Tuscany 12",
  price: 79800,
  category: 'deluxe',
  material: 'fiberglass',
  image: "/lovable-uploads/c1225a37-626d-49a2-9ec4-eb0da0f10060.png",
  dimensions: "12′ × 38′",
  depth: "3′ 6″ – 6′",
  installationTimeWeeks: 6,
  warrantyYears: "Lifetime",
  features: ["Fiberglass Construction", "Salt system included in final price", "Italian Inspired", "Compact Luxury"],
  heater: false,
  saltSystem: true,
  carbonFiber: true
}, {
  model: "Tuscany 13",
  price: 82100,
  category: 'deluxe',
  material: 'fiberglass',
  image: "/lovable-uploads/579d34e1-ef64-4134-bf8b-dff4980bb17a.png",
  dimensions: "13′ × 38′",
  depth: "3′ 6″ – 6′",
  installationTimeWeeks: 6,
  warrantyYears: "Lifetime",
  features: ["Fiberglass Construction", "Salt system included in final price", "European Elegance", "Sophisticated Design"],
  heater: false,
  saltSystem: true,
  carbonFiber: true
}, {
  model: "Tuscany 14",
  price: 85400,
  category: 'deluxe',
  material: 'fiberglass',
  image: "/lovable-uploads/9691863f-f414-4c21-8b98-3415a9ab663d.png",
  dimensions: "14′ × 38′",
  depth: "3′ 6″ – 6′",
  installationTimeWeeks: 6,
  warrantyYears: "Lifetime",
  features: ["Fiberglass Construction", "Salt system included in final price", "Luxury Features", "Premium Construction"],
  heater: false,
  saltSystem: true,
  carbonFiber: true
}, {
  model: "Olympia 12",
  price: 75300,
  category: 'premium',
  material: 'fiberglass',
  image: "/lovable-uploads/311a7002-2a40-4c59-a143-9f0236ece5d4.png",
  dimensions: "12′ × 30′",
  depth: "4′ – 6′",
  installationTimeWeeks: 6,
  warrantyYears: "Lifetime",
  features: ["Fiberglass Construction", "Salt system included in final price", "Olympic Inspired", "Athletic Design"],
  heater: false,
  saltSystem: true,
  carbonFiber: true
},

{
  model: "Olympia 14",
  price: 82100,
  category: 'premium',
  material: 'fiberglass',
  image: "/lovable-uploads/c20921ab-8964-417b-9ca5-069eea4976b7.png",
  dimensions: "14′ × 30′",
  depth: "4′ – 6′",
  installationTimeWeeks: 6,
  warrantyYears: "Lifetime",
  features: ["Fiberglass Construction", "Salt system included in final price", "Competition Ready", "Professional Grade"],
  heater: false,
  saltSystem: true,
  carbonFiber: true
}, {
  model: "Paradise",
  price: 84500,
  category: 'premium',
  material: 'fiberglass',
  image: "/lovable-uploads/d6ea993e-6b84-4fd9-b0f5-0ae906e45b0b.png",
  dimensions: "14′ × 32′",
  depth: "3′ 6″ – 7′",
  installationTimeWeeks: 6,
  warrantyYears: "Lifetime",
  features: ["Fiberglass Construction", "Salt system included in final price", "Paradise Design", "Tropical Luxury"],
  heater: false,
  saltSystem: true,
  carbonFiber: true
}, {
  model: "Axiom 14",
  price: 87500,
  category: 'premium',
  material: 'fiberglass',
  image: "/lovable-uploads/d5b2276b-16a9-47bc-99e3-92567972fe5a.png",
  dimensions: "14′ × 30′",
  depth: "4′ 6″ – 6′",
  installationTimeWeeks: 6,
  warrantyYears: "Lifetime",
  features: ["Fiberglass Construction", "Salt system included in final price", "Geometric Design", "Deep Swimming"],
  heater: false,
  saltSystem: true,
  carbonFiber: true
},

{
  model: "Enchantment 9'17\"",
  price: 89300,
  category: 'premium',
  material: 'fiberglass',
  image: "/lovable-uploads/a5fa0931-4c93-4c42-81b9-e8ad3f61e659.png",
  dimensions: "9′ 17″ × 40′",
  depth: "3′ 9″ – 8′ 2″",
  installationTimeWeeks: 6,
  warrantyYears: "Lifetime",
  features: ["Fiberglass Construction", "Salt system included in final price", "Magical Design", "Enchanting Features"],
  heater: false,
  saltSystem: true,
  carbonFiber: true
}, {
  model: "Laguna Deluxe",
  price: 95300,
  category: 'premium',
  material: 'fiberglass',
  image: "/lovable-uploads/46d142d3-b106-406d-9867-9bf7b63fd469.png",
  dimensions: "14′ × 30′",
  depth: "4′ – 6′",
  installationTimeWeeks: 6,
  warrantyYears: "Lifetime",
  features: ["Fiberglass Construction", "Salt system included in final price", "Deluxe Lagoon Style", "Premium Features"],
  heater: false,
  saltSystem: true,
  carbonFiber: true
}, {
  model: "Providence 14",
  price: 95600,
  category: 'premium',
  material: 'fiberglass',
  image: "/lovable-uploads/3929943c-2e46-426f-b155-3d79c96d7eb4.png",
  dimensions: "14′ × 30′",
  depth: "3′ 6″ – 6′ 1″",
  installationTimeWeeks: 6,
  warrantyYears: "Lifetime",
  features: ["Fiberglass Construction", "Salt system included in final price", "Providence Design", "Premium Construction"],
  heater: false,
  saltSystem: true,
  carbonFiber: true
}, {
  model: "Genesis",
  price: 112600,
  category: 'premium',
  material: 'fiberglass',
  image: "/lovable-uploads/2a611c90-6445-41af-aa15-7d223e357e64.png",
  dimensions: "16′ × 40′ 2″",
  depth: "3′ 9″ – 8′ 6″",
  installationTimeWeeks: 7,
  warrantyYears: "Lifetime",
  features: ["Fiberglass Construction", "Salt system included in final price", "Freeform Design", "Large Swimming Area", "15% Discount Applied"],
  heater: false,
  saltSystem: true,
  carbonFiber: true
}];

// Spa models
const spas: Spa[] = [{
  model: "Mystic",
  price: 26500,
  category: 'premium',
  image: "/lovable-uploads/3bdd9802-26f9-47ab-8498-e0e66344685c.png",
  dimensions: "8′ × 8′",
  depth: "3′ 6″",
  features: ["Spillover Option", "LED Lighting", "Premium Jets", "Heater Ready"],
  spilloverFeature: true,
  installationTimeWeeks: 3,
  warrantyYears: "Lifetime"
}, {
  model: "Regal",
  price: 24500,
  category: 'deluxe',
  image: "/lovable-uploads/31da0c59-77d4-4fa1-838b-cb525acd404b.png",
  dimensions: "7′ × 7′",
  depth: "3′ 2″",
  features: ["Spillover Option", "Therapeutic Jets", "Easy Controls", "Energy Efficient"],
  spilloverFeature: true,
  installationTimeWeeks: 3,
  warrantyYears: "Lifetime"
}, {
  model: "Royal",
  price: 24000,
  category: 'standard',
  image: "/lovable-uploads/62676335-6a09-4389-9a8a-cba74d583c53.png",
  dimensions: "6′ × 8′",
  depth: "3′",
  features: ["Spillover Option", "Modern Design", "Durable Construction", "Low Maintenance"],
  spilloverFeature: true,
  installationTimeWeeks: 2,
  warrantyYears: "10 Years"
}, {
  model: "Shafta",
  price: 24000,
  category: 'standard',
  image: "/lovable-uploads/1a143a47-5e78-46a8-8172-426b7644bea8.png",
  dimensions: "7′ diameter",
  depth: "3′",
  features: ["Spillover Option", "Circular Design", "Compact Footprint", "Easy Entry"],
  spilloverFeature: true,
  installationTimeWeeks: 2,
  warrantyYears: "10 Years"
}];
const getSpaTypeColor = (category: string) => {
  switch (category) {
    case 'premium':
      return 'bg-gradient-to-r from-purple-500 to-pink-500';
    case 'deluxe':
      return 'bg-gradient-to-r from-blue-500 to-cyan-500';
    case 'standard':
      return 'bg-gradient-to-r from-green-500 to-teal-500';
    default:
      return 'bg-gradient-to-r from-gray-400 to-gray-600';
  }
};
const PoolCatalog = () => {
  const [selectedPool, setSelectedPool] = useState<Pool | null>(null);
  const [selectedSpa, setSelectedSpa] = useState<Spa | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [showSpaModal, setShowSpaModal] = useState(false);
  const [selectedTile, setSelectedTile] = useState<any>(null);
  const [showTileModal, setShowTileModal] = useState(false);
  const [selectedExtras, setSelectedExtras] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const poolsPerPage = 9; // Show 9 pools per page to reduce initial DOM size

  const {
    addToCart
  } = useShoppingCart();
  const {
    toast
  } = useToast();

  // Filter and paginate pools
  const filteredPools = pools.filter(pool => pool.model !== 'Pleasant Cove');
  const totalPages = Math.ceil(filteredPools.length / poolsPerPage);
  const startIndex = (currentPage - 1) * poolsPerPage;
  const paginatedPools = filteredPools.slice(startIndex, startIndex + poolsPerPage);
  const handleViewDetails = (pool: Pool) => {
    setSelectedPool(pool);
    setShowDetailModal(true);
  };
  const handleRequestQuote = (pool: Pool, extras?: any) => {
    setSelectedPool(pool);
    setSelectedExtras(extras);
    setShowDetailModal(false);
    setShowQuoteModal(true);
  };
  const handleSpaRequest = (spa: Spa) => {
    setSelectedSpa(spa);
    setShowSpaModal(true);
  };
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Smooth scroll to top of catalog section
    document.getElementById('pool-catalog')?.scrollIntoView({
      behavior: 'smooth'
    });
  };
  return <>
      {/* Pool Collection Section */}
      <section id="pool-catalog" className="py-10 sm:py-16 lg:py-20 px-2 sm:px-4 relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 lg:mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary via-coral to-teal">Wonderland's Pool Collection</h2>
            <p className="text-sm sm:text-base lg:text-xl text-foreground/80 max-w-2xl mx-auto px-2 sm:px-0">Discover our wonderful Carbon Fiber and Concrete Pools with lifetime warranty in the carbon fiber technology or make it solid as a rock!</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {paginatedPools.map(pool => <PoolProductCard key={pool.model} pool={pool} onViewDetails={handleViewDetails} onRequestQuote={handleRequestQuote} />)}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && <div className="flex justify-center items-center gap-2 mt-8">
              <Button variant="outline" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="px-3 py-2">
                Previous
              </Button>
              
              {[...Array(totalPages)].map((_, index) => {
            const page = index + 1;
            return <Button key={page} variant={currentPage === page ? "default" : "outline"} onClick={() => handlePageChange(page)} className="px-3 py-2">
                    {page}
                  </Button>;
          })}
              
              <Button variant="outline" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="px-3 py-2">
                Next
              </Button>
            </div>}

          {/* Results Info */}
          <div className="text-center mt-4 text-sm text-muted-foreground">
            Showing {startIndex + 1}-{Math.min(startIndex + poolsPerPage, filteredPools.length)} of {filteredPools.length} pools
          </div>
        </div>
      </section>



      <PoolDetailModal pool={selectedPool} isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} onRequestQuote={handleRequestQuote} />
      
      <SurveyQuoteTool pool={selectedPool} isOpen={showQuoteModal || showSpaModal} onClose={() => {
      setShowQuoteModal(false);
      setShowSpaModal(false);
    }} extras={selectedExtras} />

      <TileDetailModal tile={selectedTile} isOpen={showTileModal} onClose={() => setShowTileModal(false)} />
    </>;
};
export { spas, pools };
export default PoolCatalog;
