import { useState } from "react";
import PoolDetailModal from "./PoolDetailModal";
import SurveyQuoteTool from "./SurveyQuoteTool";
import PoolProductCard from "./PoolProductCard";
import SimplifiedGilmerPoolCard from "./SimplifiedGilmerPoolCard";
import StripeCheckoutButton from "./StripeCheckoutButton";
import TileDetailModal from "./TileDetailModal";
import { useShoppingCart } from "./ShoppingCart";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Waves, Sparkles, Flame, Plus, Sun, Calendar, ArrowRight, Droplets, Cpu } from "lucide-react";

// Import shared pool data
import { poolLiners, poolTiles, tanningLedges } from "@/data/poolData";

// Import Madre Perla pool image
import madrePerlaImage from "@/assets/pools/madre-perla.jpg";
import pacificRidgeImage from "@/assets/pools/pacific-ridge.jpg";
import cancunDeluxeImage from "@/assets/cancun-deluxe.png";

// Data loaded successfully

// Pool model images - synchronized with Wonderlands Studio (with cache-busting)
const astoriaImage = "/lovable-uploads/c7c3ab88-34ab-47d4-bf6c-38893a5b13f2.png?v=1";
const enchantment917Image = "/lovable-uploads/d7541cc8-f254-4f85-b6ee-f636a8726dcc.png?v=1";
const enchantment921Image = "/lovable-uploads/63844c0c-04e6-4628-ad09-1b98c9283cf0.png?v=1";
const enchantment924Image = "/lovable-uploads/749a82f6-561b-4f6b-982b-d343dfac9565.png?v=1";
const tuscan1120Image = "/lovable-uploads/579d34e1-ef64-4134-bf8b-dff4980bb17a.png";
const tuscan1324Image = "/lovable-uploads/2677d17d-ba82-407b-896c-b4b3e238b8d5.png";
const tuscan1427Image = "/lovable-uploads/de3068d3-0f04-4a3c-a2ed-f52141f36b3e.png";
const tuscan1430Image = "/lovable-uploads/d1c952c1-8786-444d-b405-903533bc20d1.png";
const tuscan1440Image = "/lovable-uploads/c1225a37-626d-49a2-9ec4-eb0da0f10060.png";
interface Pool {
  model: string;
  price: number;
  category: 'premium' | 'deluxe' | 'standard' | 'compact';
  image?: string;
  dimensions?: string;
  depth?: string;
  features?: string[];
  galaPoints?: number;
  galaCategory?: string;
  installationTimeWeeks?: number;
  warrantyYears?: number | string;
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

// Helper function to get pool price with 10% discount applied
const getPoolPrice = (pool: Pool) => {
  return Math.round(pool.price * 0.90); // 10% discount for all pools
};
const pools: Pool[] = [
// Premium Infinity Concrete Pool
{
  model: "Madre Perla",
  price: 175000,
  category: 'premium',
  image: madrePerlaImage,
  dimensions: "20' x 40'",
  depth: "3'11 - 9ft",
  installationTimeWeeks: 18,
  warrantyYears: 10,
  features: ["Infinity Edge Design", "Jacuzzi Combo Included", "Premium Finish", "Custom Design"],
  heater: true,
  saltSystem: true,
  carbonFiber: false
},
// Pacific Ridge Concrete Pool
{
  model: "Pacific Ridge",
  price: 79000,
  category: 'premium',
  image: pacificRidgeImage,
  dimensions: "14' x 32'",
  depth: "3'6\" - 6'",
  installationTimeWeeks: 18,
  warrantyYears: 10,
  features: ["Rectangular Design", "Variable Depth", "Premium Finish"],
  heater: false,
  saltSystem: false,
  carbonFiber: false
},
// Cancún Deluxe - Latham Pool with Integrated Spa
{
  model: "Cancún Deluxe",
  price: 93000,
  category: 'deluxe',
  image: cancunDeluxeImage,
  dimensions: "16' x 35'",
  depth: "4'3\" - 6'6\"; Spa 3'",
  installationTimeWeeks: 12,
  warrantyYears: "Life Warranty",
  features: ["Integrated Spa", "Freeform Design", "Tanning Ledge", "Spillover Water Feature", "Premium Finish"],
  heater: false,
  saltSystem: false,
  carbonFiber: false
},
// Most Popular - Standard Series (Special Offers & Best Value)
{
  model: "Astoria",
  price: 89999,
  category: 'standard',
  image: astoriaImage,
  dimensions: "14' x 35'",
  depth: "3'-6\" to 6'6\"; Spa 3′",
  installationTimeWeeks: 8,
  warrantyYears: "Life Warranty",
  features: ["Space-Efficient Design", "Integrated Seating", "Easy Entry Steps", "Compact Footprint", "Special Offer"],
  heater: false,
  saltSystem: false,
  carbonFiber: false
}, {
  model: "Milan",
  price: 45300,
  category: 'standard',
  image: "/lovable-uploads/121eda70-3d05-4624-afb0-5dba766d8b2f.png",
  dimensions: "10′ × 16′",
  depth: "4′",
  installationTimeWeeks: 8,
  warrantyYears: "Lifetime",
  features: ["Salt system included in final price", "Classic Design", "Perfect for Small Yards"],
  heater: false,
  saltSystem: true,
  carbonFiber: true
}, {
  model: "Jamaica",
  price: 46100,
  category: 'standard',
  image: "/lovable-uploads/e2d562f0-9a55-4293-8a9f-26d9b09ebf15.png",
  dimensions: "10′ × 20′",
  depth: "3′ 2″ – 5′",
  installationTimeWeeks: 8,
  warrantyYears: "Lifetime",
  features: ["Salt system included in final price", "Family Friendly", "Shallow End"],
  heater: false,
  saltSystem: true,
  carbonFiber: true
}, {
  model: "Aruba",
  price: 51300,
  category: 'standard',
  image: "/lovable-uploads/ac53cd88-15e9-4f8a-a3c4-2cd4415b0ec5.png",
  dimensions: "11′ × 22′",
  depth: "3′ 6″ – 5′",
  installationTimeWeeks: 8,
  warrantyYears: "Lifetime",
  features: ["Salt system included in final price", "Mid-Size Pool", "Great for Swimming"],
  heater: false,
  saltSystem: true,
  carbonFiber: true
}, {
  model: "Pleasant Cove",
  price: 51300,
  category: 'standard',
  image: "/lovable-uploads/997efdd7-a754-4836-98ac-05c5e9abaf0b.png",
  dimensions: "11′ × 22′",
  depth: "3′ 6″ – 5′ 6″",
  installationTimeWeeks: 8,
  warrantyYears: "Lifetime",
  features: ["Salt system included in final price", "Elegant Design", "Versatile Depth"],
  heater: false,
  saltSystem: true,
  carbonFiber: true
},
// Popular Compact Series - Enchantment
{
  model: "Enchantment 9.17",
  price: 47900,
  category: 'compact',
  image: enchantment917Image,
  dimensions: "9′ 1″ × 17′ 5″",
  depth: "~4′ 9″",
  installationTimeWeeks: 8,
  warrantyYears: "Lifetime",
  features: ["Salt system included in final price", "Compact Design", "Energy Efficient"],
  heater: false,
  saltSystem: true,
  carbonFiber: true
}, {
  model: "Enchantment 9.21",
  price: 54400,
  category: 'compact',
  image: enchantment921Image,
  dimensions: "9′ 1″ × 20′ 7″",
  depth: "~4′ 9″",
  installationTimeWeeks: 8,
  warrantyYears: "Lifetime",
  features: ["Salt system included in final price", "Compact Design", "Energy Efficient"],
  heater: false,
  saltSystem: true,
  carbonFiber: true
}, {
  model: "Enchantment 9.24",
  price: 60800,
  category: 'compact',
  image: enchantment924Image,
  dimensions: "9′ 1″ × 23′ 10″",
  depth: "~4′ 9″",
  installationTimeWeeks: 8,
  warrantyYears: "Lifetime",
  features: ["Salt system included in final price", "Compact Design", "Energy Efficient"],
  heater: false,
  saltSystem: true,
  carbonFiber: true
},
// Tuscan Series
{
  model: "Tuscan 11.20",
  price: 59430,
  category: 'deluxe',
  image: tuscan1120Image,
  dimensions: "11′ 1″ × 20′ 3″",
  depth: "3′ 11″ – 5′ 2″",
  installationTimeWeeks: 8,
  warrantyYears: "Lifetime",
  features: ["Salt system included in final price", "Tuscan Design", "Premium Finish"],
  heater: false,
  saltSystem: true,
  carbonFiber: true
}, {
  model: "Tuscan 13.24",
  price: 72870,
  category: 'deluxe',
  image: tuscan1324Image,
  dimensions: "12′ 10″ × 23′ 7″",
  depth: "3′ 11″ – 5′ 5″",
  installationTimeWeeks: 8,
  warrantyYears: "Lifetime",
  features: ["Salt system included in final price", "Tuscan Design", "Premium Finish"],
  heater: false,
  saltSystem: true,
  carbonFiber: true
}, {
  model: "Tuscan 14.27",
  price: 84000,
  category: 'deluxe',
  image: tuscan1427Image,
  dimensions: "13′ 9″ × 26′ 10″",
  depth: "3′ 11″ – 5′ 9″",
  installationTimeWeeks: 8,
  warrantyYears: "Lifetime",
  features: ["Salt system included in final price", "Tuscan Design", "Premium Finish"],
  heater: false,
  saltSystem: true,
  carbonFiber: true
}, {
  model: "Tuscan 14.30",
  price: 92610,
  category: 'deluxe',
  image: tuscan1430Image,
  dimensions: "13′ 9″ × 30′ 1″",
  depth: "3′ 11″ – 5′ 11″",
  installationTimeWeeks: 8,
  warrantyYears: "Lifetime",
  features: ["Salt system included in final price", "Tuscan Design", "Premium Finish"],
  heater: false,
  saltSystem: true,
  carbonFiber: true
}, {
  model: "Tuscan 14.40",
  price: 116550,
  category: 'deluxe',
  image: tuscan1440Image,
  dimensions: "13′ 9″ × 39′ 11″",
  depth: "3′ 7″ – 6′ 2″",
  installationTimeWeeks: 8,
  warrantyYears: "Lifetime",
  features: ["Salt system included in final price", "Tuscan Design", "Premium Finish"],
  heater: false,
  saltSystem: true,
  carbonFiber: true
},
// Premium Series
{
  model: "St. Lucia",
  price: 59640,
  category: 'deluxe',
  image: "/lovable-uploads/03b6750e-bed3-41df-abcb-6657d36cfa62.png",
  dimensions: "12′ × 24′",
  depth: "3′ 6″ – 5′",
  installationTimeWeeks: 8,
  warrantyYears: "Lifetime",
  features: ["Salt system included in final price", "Caribbean Inspired", "Perfect for Families"],
  heater: false,
  saltSystem: true,
  carbonFiber: true
}, {
  model: "Delray",
  price: 62265,
  category: 'deluxe',
  image: "/lovable-uploads/f549e4e8-647d-4b21-8d48-441f83955c73.png",
  dimensions: "12′ × 25′",
  depth: "~4′ 6″",
  installationTimeWeeks: 8,
  warrantyYears: "Lifetime",
  features: ["Salt system included in final price", "Modern Design", "Consistent Depth"],
  heater: false,
  saltSystem: true,
  carbonFiber: true
}, {
  model: "Java",
  price: 63000,
  category: 'deluxe',
  image: "/lovable-uploads/bca99a48-ba6b-42d0-96d0-bf5ecfc2e4fd.png",
  dimensions: "12′ × 27′",
  depth: "3′ 6″ – 5′ 6″",
  installationTimeWeeks: 8,
  warrantyYears: "Lifetime",
  features: ["Salt system included in final price", "Sleek Design", "Great for Lap Swimming"],
  heater: false,
  saltSystem: true,
  carbonFiber: true
}, {
  model: "Bermuda",
  price: 64575,
  category: 'deluxe',
  image: "/lovable-uploads/311a7002-2a40-4c59-a143-9f0236ece5d4.png",
  dimensions: "12′ × 26′",
  depth: "3′ 6″ – 5′ 6″",
  installationTimeWeeks: 8,
  warrantyYears: "Lifetime",
  features: ["Salt system included in final price", "Island Style", "Relaxing Design"],
  heater: false,
  saltSystem: true,
  carbonFiber: true
}, {
  model: "Key West",
  price: 67515,
  category: 'deluxe',
  image: "/lovable-uploads/4e43c832-af03-4cf4-9104-0117e5f3321c.png",
  dimensions: "12′ × 25′ 7″",
  depth: "3′ 7″ – 6′",
  installationTimeWeeks: 8,
  warrantyYears: "Lifetime",
  features: ["Salt system included in final price", "Tropical Design", "Deep End Swimming"],
  heater: false,
  saltSystem: true,
  carbonFiber: true
}, {
  model: "Valencia",
  price: 68775,
  category: 'deluxe',
  image: "/lovable-uploads/d8c4a7c6-4bbe-481d-8a47-5d7feecb1861.png",
  dimensions: "14′ 6″ × 28′",
  depth: "3′ 7″ – 5′ 10″",
  installationTimeWeeks: 8,
  warrantyYears: "Lifetime",
  features: ["Salt system included in final price", "Spanish Style", "Large Swimming Area"],
  heater: false,
  saltSystem: true,
  carbonFiber: true
}, {
  model: "Vista Isle",
  price: 70000,
  category: 'premium',
  image: "/lovable-uploads/6a41df5e-d6f6-4e49-aa1a-b457ac1902a0.png",
  dimensions: "12′ × 28′ 6″",
  depth: "3′ 6″ – 5′ 10″",
  installationTimeWeeks: 8,
  warrantyYears: "Lifetime",
  features: ["Salt system included in final price", "Panoramic Design", "Extended Length"],
  heater: false,
  saltSystem: true,
  carbonFiber: true
},
// Corinthian Series
{
  model: "Corinthian 12",
  price: 75400,
  category: 'premium',
  image: "/lovable-uploads/221a9844-ee7c-4fe3-b421-a9fe99bccabf.png",
  dimensions: "12′ × 25′",
  depth: "3′ 6″ – 5′ 5″",
  installationTimeWeeks: 8,
  warrantyYears: "Lifetime",
  features: ["Salt system included in final price", "Classical Design", "Premium Materials"],
  heater: false,
  saltSystem: true,
  carbonFiber: true
}, {
  model: "Corinthian 12 BME",
  price: 79400,
  category: 'premium',
  image: "/lovable-uploads/86678699-3f2c-4863-8a81-d8c63721e03c.png",
  dimensions: "12′ × 25′",
  depth: "3′ 6″ – 5′ 5″",
  installationTimeWeeks: 8,
  warrantyYears: "Lifetime",
  features: ["Salt system included in final price", "Beach Modified Entry", "Classical Design"],
  heater: false,
  saltSystem: true,
  carbonFiber: true
}, {
  model: "Corinthian 14",
  price: 94500,
  category: 'premium',
  image: "/lovable-uploads/3ae37221-0f97-48df-addd-632c423868e2.png",
  dimensions: "14′ × 30′",
  depth: "3′ 6″ – 6′",
  installationTimeWeeks: 8,
  warrantyYears: "Lifetime",
  features: ["Salt system included in final price", "Classical Design", "Premium Materials"],
  heater: false,
  saltSystem: true,
  carbonFiber: true
}, {
  model: "Corinthian 14 BME",
  price: 98500,
  category: 'premium',
  image: "/lovable-uploads/a345878e-c014-4929-9e9b-bcb675d02e66.png",
  dimensions: "14′ × 30′",
  depth: "3′ 6″ – 6′",
  installationTimeWeeks: 8,
  warrantyYears: "Lifetime",
  features: ["Salt system included in final price", "Beach Modified Entry", "Classical Design"],
  heater: false,
  saltSystem: true,
  carbonFiber: true
},
// Olympia Series
{
  model: "Olympia 12",
  price: 76300,
  category: 'premium',
  image: "/lovable-uploads/0aa90de6-b1eb-43a4-91ec-10c05388c900.png",
  dimensions: "12′ × 26′",
  depth: "3′ 6″ – 5′ 6″",
  installationTimeWeeks: 8,
  warrantyYears: "Lifetime",
  features: ["Salt system included in final price", "Olympic Inspired", "Performance Design"],
  heater: false,
  saltSystem: true,
  carbonFiber: true
}, {
  model: "Olympia 14",
  price: 96400,
  category: 'premium',
  image: "/lovable-uploads/d707c6e1-8471-404f-9312-bd6773152617.png",
  dimensions: "14′ × 30′",
  depth: "3′ 6″ – 6′",
  installationTimeWeeks: 8,
  warrantyYears: "Lifetime",
  features: ["Salt system included in final price", "Olympic Inspired", "Performance Design"],
  heater: false,
  saltSystem: true,
  carbonFiber: true
},
// Large Premium Series
{
  model: "Bay Isle",
  price: 80400,
  category: 'premium',
  image: "/lovable-uploads/a91d91f2-51f8-470c-9894-4a1cf8b1f2c0.png",
  dimensions: "14′ 6″ × 30′",
  depth: "3′ – 6′ 6″",
  installationTimeWeeks: 8,
  warrantyYears: "Lifetime",
  features: ["Salt system included in final price", "Beach Entry", "Large Swimming Area"],
  heater: false,
  saltSystem: true,
  carbonFiber: true
}, {
  model: "Laguna",
  price: 82600,
  category: 'premium',
  image: "/lovable-uploads/ee464b25-683d-4367-a208-2159c2bd13f3.png",
  dimensions: "14′ × 30′",
  depth: "3′ 6″ – 6′",
  installationTimeWeeks: 8,
  warrantyYears: "Lifetime",
  features: ["Salt system included in final price", "Lagoon Style", "Natural Design"],
  heater: false,
  saltSystem: true,
  carbonFiber: true
}, {
  model: "Claremont",
  price: 83400,
  category: 'premium',
  image: "/lovable-uploads/6b7b34a3-03f7-4179-b34a-3458dc881efd.png",
  dimensions: "14′ × 33′",
  depth: "3′ 6″ – 5′ 4″",
  installationTimeWeeks: 8,
  warrantyYears: "Lifetime",
  features: ["Salt system included in final price", "L-Shaped Design", "Extended Length"],
  heater: false,
  saltSystem: true,
  carbonFiber: true
}, {
  model: "Axiom 14",
  price: 87500,
  category: 'premium',
  image: "/lovable-uploads/d5b2276b-16a9-47bc-99e3-92567972fe5a.png",
  dimensions: "14′ × 30′",
  depth: "4′ 6″ – 6′",
  installationTimeWeeks: 8,
  warrantyYears: "Lifetime",
  features: ["Salt system included in final price", "Geometric Design", "Deep Swimming"],
  heater: false,
  saltSystem: true,
  carbonFiber: true
}, {
  model: "Laguna Deluxe",
  price: 95300,
  category: 'premium',
  image: "/lovable-uploads/46d142d3-b106-406d-9867-9bf7b63fd469.png",
  dimensions: "14′ × 30′",
  depth: "4′ – 6′",
  installationTimeWeeks: 8,
  warrantyYears: "Lifetime",
  features: ["Salt system included in final price", "Deluxe Lagoon Style", "Premium Features"],
  heater: false,
  saltSystem: true,
  carbonFiber: true
}, {
  model: "Providence 14",
  price: 95600,
  category: 'premium',
  image: "/lovable-uploads/3929943c-2e46-426f-b155-3d79c96d7eb4.png",
  dimensions: "14′ × 30′",
  depth: "3′ 6″ – 6′ 1″",
  installationTimeWeeks: 8,
  warrantyYears: "Lifetime",
  features: ["Salt system included in final price", "Providence Design", "Premium Construction"],
  heater: false,
  saltSystem: true,
  carbonFiber: true
}, {
  model: "Genesis",
  price: 112600,
  category: 'premium',
  image: "/lovable-uploads/2a611c90-6445-41af-aa15-7d223e357e64.png",
  dimensions: "16′ × 40′ 2″",
  depth: "3′ 9″ – 8′ 6″",
  installationTimeWeeks: 8,
  warrantyYears: "Lifetime",
  features: ["Salt system included in final price", "Freeform Design", "Large Swimming Area", "10% Discount Applied"],
  heater: false,
  saltSystem: true,
  carbonFiber: true
}
];

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
  installationTimeWeeks: 8,
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
  installationTimeWeeks: 8,
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
  installationTimeWeeks: 8,
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
  installationTimeWeeks: 8,
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
      <section id="pool-catalog" className="py-10 sm:py-16 lg:py-20 px-2 sm:px-4 relative overflow-hidden border-t-4 border-gradient-to-r from-primary via-coral to-teal">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-coral/5">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 left-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-coral/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
            <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-teal/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
          </div>
          {/* Wave Pattern */}
          <svg className="absolute bottom-0 left-0 w-full h-32 opacity-10" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25" className="fill-primary"></path>
            <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5" className="fill-coral"></path>
            <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" className="fill-teal/50"></path>
          </svg>
        </div>
        <div className="max-w-7xl mx-auto relative z-10">
          {/* Prominent Appointment Button with Railing */}
          <div className="text-center mb-8 sm:mb-12">
            
            <Button variant="gradient" size="lg" className="group shadow-xl hover:shadow-2xl transition-all duration-300" onClick={() => window.open('https://calendly.com/wonderlandsworlds/30min', '_blank')}>
              <Calendar className="mr-2 h-5 w-5" />
              Make an Appointment
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <p className="text-sm text-muted-foreground mt-3">Book your free consultation with our pool experts</p>
            
          </div>

          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 lg:mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary via-coral to-teal">Wonderland's Pool Collection</h2>
            <p className="text-sm sm:text-base lg:text-xl text-foreground/80 max-w-2xl mx-auto px-2 sm:px-0">Welcome to the Oasis for Outdoor Entertainment and Lifestyle.</p>
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