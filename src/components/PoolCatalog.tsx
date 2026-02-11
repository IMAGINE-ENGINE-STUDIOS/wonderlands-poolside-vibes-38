import { useState } from "react";
import PoolDetailModal from "./PoolDetailModal";
import SurveyQuoteTool from "./SurveyQuoteTool";
import PoolProductCard from "./PoolProductCard";
import SimplifiedGilmerPoolCard from "./SimplifiedGilmerPoolCard";
import StripeCheckoutButton from "./StripeCheckoutButton";
import TileDetailModal from "./TileDetailModal";
import { useShoppingCart } from "./ShoppingCartProvider";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Waves, Sparkles, Flame, Plus, Sun, Calendar, ArrowRight, Droplets, Cpu } from "lucide-react";
import DealsSection from "./DealsSection";

// Import shared pool data
import { poolLiners, poolTiles, tanningLedges } from "@/data/poolData";

// Import Madre Perla pool image
import madrePerlaImage from "@/assets/pools/madre-perla.jpg";
import pacificRidgeImage from "@/assets/pools/pacific-ridge-new.jpg";
import cancunDeluxeImage from "@/assets/cancun-deluxe.png";
import maximaImage from "@/assets/maxima-pool.jpg";

// Import Axiom 14 Deluxe images
import axiom14DeluxeMain from "@/assets/pools/axiom-14-deluxe-main.jpg";
import axiom14DeluxeSpecs from "@/assets/pools/axiom-14-deluxe-specs.jpg";
import axiom14DeluxeGallery1 from "@/assets/pools/axiom-14-deluxe-gallery-1.jpg";
import axiom16Main from "@/assets/pools/axiom-16-main.jpg";
import axiom16Specs from "@/assets/pools/axiom-16-specs.jpg";

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
  gallery?: string[]; // Additional images for the pool gallery
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
  type?: string; // Pool type: "Fiber Pool" or "Concrete Pool"
  description?: string; // Pool description
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

// Pool finish options (removed non-texture options: Mountain, Carnegie, Panama)
export const poolFinishes = ["Nantuke", "Esagoni", "Whitehaven", "Island Wave", "Durango Gray", "Vintage Blue", "Royal Blue", "Gulf Coast", "Hamper", "Indigo", "Cayman", "Corolla", "Summerwave", "Legends", "Z terrazzo", "Tullism", "Courtstone Gray", "Courtstone Blue"];

// Helper function to get pool price (no discount applied)
const getPoolPrice = (pool: Pool) => {
  return pool.price;
};
const pools: Pool[] = [
// Premium Infinity Concrete Pool - FLORIDA (NO SURCHARGE)
{
  model: "Madre Perla",
  price: 168438,
  category: 'premium',
  image: madrePerlaImage,
  dimensions: "20' x 40'",
  depth: "3'11 - 9ft",
  installationTimeWeeks: 18,
  warrantyYears: 10,
  features: ["Infinity Edge Design", "Jacuzzi Combo Included", "Premium Finish", "Custom Design"],
  heater: true,
  saltSystem: true,
  carbonFiber: false,
  description: "Premium concrete infinity pool with integrated spa. Features stunning infinity edge design and luxurious concrete construction with customizable finishes."
},
// Maxima Premium Fiberglass Pool - FLORIDA (NO SURCHARGE)
{
  model: "Maxima",
  price: 144375,
  category: 'premium',
  image: maximaImage,
  dimensions: "16' × 40'",
  depth: "3'9\" - 8'6\"",
  installationTimeWeeks: 16,
  warrantyYears: 10,
  features: ["Premium Fiberglass Construction", "Wonderlands World Collection", "Luxury Design", "Low Maintenance"],
  heater: false,
  saltSystem: false,
  carbonFiber: false,
  description: "Premium fiberglass pool from the Wonderlands World Collection. Features durable fiberglass construction with elegant design and minimal maintenance requirements."
},
// Pacific Ridge Concrete Pool - FLORIDA (NO SURCHARGE)
{
  model: "Pacific Ridge",
  price: 96250,
  category: 'premium',
  image: pacificRidgeImage,
  dimensions: "14' x 32'",
  depth: "3'6\" - 6'",
  installationTimeWeeks: 18,
  warrantyYears: 10,
  features: ["Rectangular Design", "Variable Depth", "Premium Finish"],
  heater: false,
  saltSystem: false,
  carbonFiber: false,
  description: "Elegant concrete pool featuring classic rectangular design. Durable concrete construction with variable depth and customizable premium finishes."
},
// Winderview Concrete Pool by Wonderlands - FLORIDA (NO SURCHARGE)
{
  model: "Winderview",
  price: 91875,
  category: 'premium',
  image: "/lovable-uploads/winderview-pool.jpg",
  dimensions: "15.5' × 31'",
  depth: "3'6\" - 6'",
  installationTimeWeeks: 18,
  warrantyYears: 10,
  features: ["Tanning Ledge", "Rectangular Design", "Concrete Construction", "Custom Finish Options"],
  heater: false,
  saltSystem: false,
  description: "Wonderlands concrete pool with integrated tanning ledge. Premium concrete construction allows for custom finishes and durable, long-lasting quality.",
  carbonFiber: false,
  type: "Concrete Pool"
},
// Cancún Deluxe - Latham Pool with Integrated Spa
{
  model: "Cancún Deluxe",
  price: 112875,
  category: 'deluxe',
  image: cancunDeluxeImage,
  dimensions: "16' x 35'",
  depth: "4'3\" - 6'6\"; Spa 3'",
  installationTimeWeeks: 12,
  warrantyYears: 10,
  features: ["Integrated Spa", "Freeform Design", "Tanning Ledge", "Spillover Water Feature", "Premium Finish", "Sauna Offer"],
  heater: false,
  saltSystem: false,
  carbonFiber: false
},
// Astoria - Latham
{
  model: "Astoria 12",
  price: 81900,
  category: 'standard',
  image: astoriaImage,
  dimensions: "12' x 25'",
  depth: "3'-6\" to 6'",
  installationTimeWeeks: 16,
  warrantyYears: "Lifetime",
  features: ["Integrated Seating", "Easy Entry Steps", "Compact Footprint"],
  heater: false,
  saltSystem: false,
  carbonFiber: false
},
{
  model: "Astoria 14",
  price: 97825,
  category: 'deluxe',
  image: astoriaImage,
  dimensions: "14' x 35'",
  depth: "3'-6\" to 6'6\"; Spa 3′",
  installationTimeWeeks: 16,
  warrantyYears: "Lifetime",
  features: ["Integrated Seating", "Easy Entry Steps", "Larger Size"],
  heater: false,
  saltSystem: false,
  carbonFiber: false
},
{
  model: "Astoria 16",
  price: 110338,
  category: 'premium',
  image: astoriaImage,
  dimensions: "16' x 40'",
  depth: "3'-6\" to 8'",
  installationTimeWeeks: 16,
  warrantyYears: "Lifetime",
  features: ["Salt system included", "Integrated Seating", "Easy Entry Steps", "Largest Astoria"],
  heater: false,
  saltSystem: true,
  carbonFiber: false
},
// Small Pools - Latham
{
  model: "Milan 8.14",
  price: 31150,
  category: 'compact',
  image: "/lovable-uploads/121eda70-3d05-4624-afb0-5dba766d8b2f.png",
  dimensions: "8′ × 14′",
  depth: "4′",
  installationTimeWeeks: 16,
  warrantyYears: "Lifetime",
  features: ["Salt system included", "Classic Design", "Perfect for Small Yards"],
  heater: false,
  saltSystem: true,
  carbonFiber: true
},
{
  model: "Milan 10.16",
  price: 41650,
  category: 'compact',
  image: "/lovable-uploads/121eda70-3d05-4624-afb0-5dba766d8b2f.png",
  dimensions: "10′ × 16′",
  depth: "4′",
  installationTimeWeeks: 16,
  warrantyYears: "Lifetime",
  features: ["Salt system included", "Classic Design", "Perfect for Small Yards"],
  heater: false,
  saltSystem: true,
  carbonFiber: true
},
{
  model: "Milan 10.20",
  price: 51100,
  category: 'compact',
  image: "/lovable-uploads/121eda70-3d05-4624-afb0-5dba766d8b2f.png",
  dimensions: "10′ × 20′",
  depth: "4′",
  installationTimeWeeks: 16,
  warrantyYears: "Lifetime",
  features: ["Salt system included", "Classic Design", "Largest Milan"],
  heater: false,
  saltSystem: true,
  carbonFiber: true
},
{
  model: "Jamaica 10",
  price: 42350,
  category: 'compact',
  image: "/lovable-uploads/e2d562f0-9a55-4293-8a9f-26d9b09ebf15.png",
  dimensions: "10′ × 20′",
  depth: "3′ 2″ – 5′",
  installationTimeWeeks: 16,
  warrantyYears: "Lifetime",
  features: ["Salt system included", "Family Friendly", "Shallow End"],
  heater: false,
  saltSystem: true,
  carbonFiber: true
},
{
  model: "Jamaica 12",
  price: 52150,
  category: 'compact',
  image: "/lovable-uploads/e2d562f0-9a55-4293-8a9f-26d9b09ebf15.png",
  dimensions: "12′ × 24′",
  depth: "3′ 2″ – 5′",
  installationTimeWeeks: 16,
  warrantyYears: "Lifetime",
  features: ["Salt system included", "Family Friendly", "Shallow End"],
  heater: false,
  saltSystem: true,
  carbonFiber: true
},
{
  model: "Jamaica 14",
  price: 60200,
  category: 'standard',
  image: "/lovable-uploads/e2d562f0-9a55-4293-8a9f-26d9b09ebf15.png",
  dimensions: "14′ × 28′",
  depth: "3′ 2″ – 5′",
  installationTimeWeeks: 16,
  warrantyYears: "Lifetime",
  features: ["Salt system included", "Family Friendly", "Larger Size"],
  heater: false,
  saltSystem: true,
  carbonFiber: true
},
{
  model: "Aruba",
  price: 47163,
  category: 'compact',
  image: "/lovable-uploads/ac53cd88-15e9-4f8a-a3c4-2cd4415b0ec5.png",
  dimensions: "11′ × 22′",
  depth: "3′ 6″ – 5′",
  installationTimeWeeks: 16,
  warrantyYears: "Lifetime",
  features: ["Salt system included", "Mid-Size Pool", "Great for Swimming"],
  heater: false,
  saltSystem: true,
  carbonFiber: true
},
{
  model: "Bermuda 12",
  price: 56525,
  category: 'standard',
  image: "/lovable-uploads/bermuda-pool.png",
  dimensions: "12′ × 24′",
  depth: "3′ 6″ – 5′ 6″",
  installationTimeWeeks: 16,
  warrantyYears: "Lifetime",
  features: ["Salt system included", "Classic Shape", "Versatile Depth"],
  heater: false,
  saltSystem: true,
  carbonFiber: true
},
{
  model: "Bermuda 12 Deluxe",
  price: 70000,
  category: 'standard',
  image: "/lovable-uploads/bermuda-pool.png",
  dimensions: "12′ × 24′",
  depth: "3′ 6″ – 5′ 6″",
  installationTimeWeeks: 16,
  warrantyYears: "Lifetime",
  features: ["Salt system included", "Classic Shape", "Deluxe Features", "Tanning Ledge"],
  heater: false,
  saltSystem: true,
  carbonFiber: true
},
{
  model: "Bermuda 14",
  price: 75950,
  category: 'deluxe',
  image: "/lovable-uploads/bermuda-pool.png",
  dimensions: "14′ × 28′",
  depth: "3′ 6″ – 5′ 6″",
  installationTimeWeeks: 16,
  warrantyYears: "Lifetime",
  features: ["Salt system included", "Classic Shape", "Larger Size"],
  heater: false,
  saltSystem: true,
  carbonFiber: true
},
{
  model: "Bermuda 14 Deluxe",
  price: 87588,
  category: 'deluxe',
  image: "/lovable-uploads/bermuda-pool.png",
  dimensions: "14′ × 28′",
  depth: "3′ 6″ – 5′ 6″",
  installationTimeWeeks: 16,
  warrantyYears: "Lifetime",
  features: ["Salt system included", "Classic Shape", "Deluxe Features", "Tanning Ledge"],
  heater: false,
  saltSystem: true,
  carbonFiber: true
},
{
  model: "Cape Cod 12",
  price: 55125,
  category: 'standard',
  image: "/lovable-uploads/wonderlands-logo.png",
  dimensions: "12′ × 24′",
  depth: "3′ 6″ – 5′ 6″",
  installationTimeWeeks: 16,
  warrantyYears: "Lifetime",
  features: ["Salt system included", "Classic Design", "Entry Steps"],
  heater: false,
  saltSystem: true,
  carbonFiber: true
},
{
  model: "Corinthian 12",
  price: 69300,
  category: 'standard',
  image: "/lovable-uploads/221a9844-ee7c-4fe3-b421-a9fe99bccabf.png",
  dimensions: "12′ × 25′",
  depth: "3′ 6″ – 6′",
  installationTimeWeeks: 16,
  warrantyYears: "Lifetime",
  features: ["Salt system included", "Roman End", "Deep End"],
  heater: false,
  saltSystem: true,
  carbonFiber: true
},
{
  model: "Corinthian 12 BME",
  price: 72800,
  category: 'standard',
  image: "/lovable-uploads/86678699-3f2c-4863-8a81-d8c63721e03c.png",
  dimensions: "12′ × 25′",
  depth: "3′ 6″ – 6′",
  installationTimeWeeks: 16,
  warrantyYears: "Lifetime",
  features: ["Salt system included", "Roman End", "Built-in Bench", "Deep End"],
  heater: false,
  saltSystem: true,
  carbonFiber: true
},
{
  model: "Corinthian 14",
  price: 86888,
  category: 'deluxe',
  image: "/lovable-uploads/3ae37221-0f97-48df-addd-632c423868e2.png",
  dimensions: "14′ × 32′",
  depth: "3′ 6″ – 6′ 6″",
  installationTimeWeeks: 16,
  warrantyYears: "Lifetime",
  features: ["Salt system included", "Roman End", "Deep End"],
  heater: false,
  saltSystem: true,
  carbonFiber: true
},
{
  model: "Corinthian 14 BME",
  price: 90388,
  category: 'deluxe',
  image: "/lovable-uploads/a345878e-c014-4929-9e9b-bcb675d02e66.png",
  dimensions: "14′ × 32′",
  depth: "3′ 6″ – 6′ 6″",
  installationTimeWeeks: 16,
  warrantyYears: "Lifetime",
  features: ["Salt system included", "Roman End", "Built-in Bench", "Deep End"],
  heater: false,
  saltSystem: true,
  carbonFiber: true
},
{
  model: "Delray",
  price: 54513,
  category: 'standard',
  image: "/lovable-uploads/f549e4e8-647d-4b21-8d48-441f83955c73.png",
  dimensions: "12′ × 24′",
  depth: "3′ 6″ – 5′ 6″",
  installationTimeWeeks: 16,
  warrantyYears: "Lifetime",
  features: ["Salt system included", "Elegant Design", "Entry Steps"],
  heater: false,
  saltSystem: true,
  carbonFiber: true
},
{
  model: "Enchantment 9.17",
  price: 44100,
  category: 'compact',
  image: enchantment917Image,
  dimensions: "9′ 1″ × 17′ 5″",
  depth: "~4′ 9″",
  installationTimeWeeks: 16,
  warrantyYears: "Lifetime",
  features: ["Salt system included", "Compact Design", "Energy Efficient"],
  heater: false,
  saltSystem: true,
  carbonFiber: true
},
{
  model: "Enchantment 9.21",
  price: 50050,
  category: 'compact',
  image: enchantment921Image,
  dimensions: "9′ 1″ × 20′ 7″",
  depth: "~4′ 9″",
  installationTimeWeeks: 16,
  warrantyYears: "Lifetime",
  features: ["Salt system included", "Compact Design", "Energy Efficient"],
  heater: false,
  saltSystem: true,
  carbonFiber: true
},
{
  model: "Enchantment 9.24",
  price: 55913,
  category: 'compact',
  image: enchantment924Image,
  dimensions: "9′ 1″ × 24′",
  depth: "~4′ 9″",
  installationTimeWeeks: 16,
  warrantyYears: "Lifetime",
  features: ["Salt system included", "Compact Design", "Longest Enchantment"],
  heater: false,
  saltSystem: true,
  carbonFiber: true
},
{
  model: "Key West",
  price: 59150,
  category: 'standard',
  image: "/lovable-uploads/4e43c832-af03-4cf4-9104-0117e5f3321c.png",
  dimensions: "13′ × 26′",
  depth: "3′ 6″ – 5′ 6″",
  installationTimeWeeks: 16,
  warrantyYears: "Lifetime",
  features: ["Salt system included", "Freeform Design", "Tanning Ledge"],
  heater: false,
  saltSystem: true,
  carbonFiber: true
},
{
  model: "Olympia 12",
  price: 70088,
  category: 'standard',
  image: "/lovable-uploads/olympia-pool.jpg",
  dimensions: "12′ × 25′",
  depth: "3′ 6″ – 6′",
  installationTimeWeeks: 16,
  warrantyYears: "Lifetime",
  features: ["Salt system included", "Roman End", "Deep End"],
  heater: false,
  saltSystem: true,
  carbonFiber: true
},
{
  model: "Olympia 14",
  price: 88550,
  category: 'deluxe',
  image: "/lovable-uploads/olympia-pool.jpg",
  dimensions: "14′ × 32′",
  depth: "3′ 6″ – 6′ 6″",
  installationTimeWeeks: 16,
  warrantyYears: "Lifetime",
  features: ["Salt system included", "Roman End", "Deep End"],
  heater: false,
  saltSystem: true,
  carbonFiber: true
},
{
  model: "Olympia 16",
  price: 93363,
  category: 'premium',
  image: "/lovable-uploads/olympia-pool.jpg",
  dimensions: "16′ × 40′",
  depth: "3′ 6″ – 8′",
  installationTimeWeeks: 16,
  warrantyYears: "Lifetime",
  features: ["Salt system included", "Roman End", "Extra Deep End", "Largest Olympia"],
  heater: false,
  saltSystem: true,
  carbonFiber: true
},
{
  model: "Pleasant Cove",
  price: 47163,
  category: 'compact',
  image: "/lovable-uploads/997efdd7-a754-4836-98ac-05c5e9abaf0b.png",
  dimensions: "11′ × 22′",
  depth: "3′ 6″ – 5′ 6″",
  installationTimeWeeks: 16,
  warrantyYears: "Lifetime",
  features: ["Salt system included", "Elegant Design", "Versatile Depth"],
  heater: false,
  saltSystem: true,
  carbonFiber: true
},
{
  model: "Tuscan 11.20",
  price: 51975,
  category: 'standard',
  image: tuscan1120Image,
  dimensions: "11′ × 20′",
  depth: "3′ 6″ – 5′ 6″",
  installationTimeWeeks: 16,
  warrantyYears: "Lifetime",
  features: ["Salt system included", "Rectangular Design", "Entry Steps"],
  heater: false,
  saltSystem: true,
  carbonFiber: true
},
{
  model: "Tuscan 13.24",
  price: 63788,
  category: 'standard',
  image: tuscan1324Image,
  dimensions: "13′ × 24′",
  depth: "3′ 6″ – 5′ 6″",
  installationTimeWeeks: 16,
  warrantyYears: "Lifetime",
  features: ["Salt system included", "Rectangular Design", "Entry Steps"],
  heater: false,
  saltSystem: true,
  carbonFiber: true
},
{
  model: "Tuscan 14.27",
  price: 73500,
  category: 'deluxe',
  image: tuscan1427Image,
  dimensions: "14′ × 27′",
  depth: "3′ 6″ – 5′ 6″",
  installationTimeWeeks: 16,
  warrantyYears: "Lifetime",
  features: ["Salt system included", "Rectangular Design", "Entry Steps"],
  heater: false,
  saltSystem: true,
  carbonFiber: true
},
{
  model: "Tuscan 14.30",
  price: 81113,
  category: 'deluxe',
  image: tuscan1430Image,
  dimensions: "14′ × 30′",
  depth: "3′ 6″ – 5′ 6″",
  installationTimeWeeks: 16,
  warrantyYears: "Lifetime",
  features: ["Salt system included", "Rectangular Design", "Entry Steps"],
  heater: false,
  saltSystem: true,
  carbonFiber: true
},
{
  model: "Tuscan 14.40",
  price: 102025,
  category: 'premium',
  image: tuscan1440Image,
  dimensions: "14′ × 40′",
  depth: "3′ 6″ – 6′",
  installationTimeWeeks: 16,
  warrantyYears: "Lifetime",
  features: ["Salt system included", "Rectangular Design", "Largest Tuscan", "Deep End"],
  heater: false,
  saltSystem: true,
  carbonFiber: true
},
{
  model: "Vista Isle",
  price: 64313,
  category: 'standard',
  image: "/lovable-uploads/6a41df5e-d6f6-4e49-aa1a-b457ac1902a0.png",
  dimensions: "13′ × 27′",
  depth: "3′ 6″ – 5′ 6″",
  installationTimeWeeks: 16,
  warrantyYears: "Lifetime",
  features: ["Salt system included", "Freeform Design", "Tanning Ledge"],
  heater: false,
  saltSystem: true,
  carbonFiber: true
},
// Medium Pools - Latham
{
  model: "Axiom 12 Deluxe",
  price: 69213,
  category: 'standard',
  image: "/lovable-uploads/d5b2276b-16a9-47bc-99e3-92567972fe5a.png",
  dimensions: "12′ × 28′",
  depth: "3′ 6″ – 6′",
  installationTimeWeeks: 16,
  warrantyYears: "Lifetime",
  features: ["Salt system included", "Modern Design", "Deep End", "Deluxe Features"],
  heater: false,
  saltSystem: true,
  carbonFiber: true
},
{
  model: "Axiom 14",
  price: 80500,
  category: 'deluxe',
  image: "/lovable-uploads/d5b2276b-16a9-47bc-99e3-92567972fe5a.png",
  dimensions: "14′ × 32′",
  depth: "3′ 6″ – 6′",
  installationTimeWeeks: 16,
  warrantyYears: "Lifetime",
  features: ["Salt system included", "Modern Design", "Deep End"],
  heater: false,
  saltSystem: true,
  carbonFiber: true
},
{
  model: "Axiom 14 Deluxe",
  price: 87413,
  category: 'deluxe',
  image: axiom14DeluxeMain,
  gallery: [axiom14DeluxeMain, axiom14DeluxeSpecs, axiom14DeluxeGallery1],
  dimensions: "14′ × 30′",
  depth: "4′ 6″ – 5′ 6″; Spa 3′",
  installationTimeWeeks: 16,
  warrantyYears: "Lifetime",
  features: ["Salt system included", "Built-in Spa", "Tanning Ledge", "Modern Design", "Deluxe Features"],
  heater: false,
  saltSystem: true,
  carbonFiber: true
},
{
  model: "Axiom 16",
  price: 94500,
  category: 'premium',
  image: axiom16Main,
  gallery: [axiom16Main, axiom16Specs],
  dimensions: "16′ × 35′",
  depth: "4′ 6″ – 6′ 6″",
  installationTimeWeeks: 16,
  warrantyYears: "Lifetime",
  features: ["Salt system included", "Spacious Design", "Deep End", "~11,600 Gallons"],
  heater: false,
  saltSystem: true,
  carbonFiber: true
},
{
  model: "Bay Isle",
  price: 73938,
  category: 'deluxe',
  image: "/lovable-uploads/a91d91f2-51f8-470c-9894-4a1cf8b1f2c0.png",
  dimensions: "14′ × 30′",
  depth: "3′ 6″ – 6′",
  installationTimeWeeks: 16,
  warrantyYears: "Lifetime",
  features: ["Salt system included", "Freeform Design", "Tanning Ledge"],
  heater: false,
  saltSystem: true,
  carbonFiber: true
},
{
  model: "Claremont",
  price: 76738,
  category: 'deluxe',
  image: "/lovable-uploads/6b7b34a3-03f7-4179-b34a-3458dc881efd.png",
  dimensions: "14′ × 32′",
  depth: "3′ 6″ – 6′",
  installationTimeWeeks: 16,
  warrantyYears: "Lifetime",
  features: ["Salt system included", "Elegant Design", "Deep End"],
  heater: false,
  saltSystem: true,
  carbonFiber: true
},
{
  model: "Laguna",
  price: 64543,
  category: 'deluxe',
  image: "/lovable-uploads/ee464b25-683d-4367-a208-2159c2bd13f3.png",
  dimensions: "14′ × 30′",
  depth: "3′ 6″ – 6′",
  installationTimeWeeks: 16,
  warrantyYears: "Lifetime",
  features: ["Salt system included", "Freeform Design", "Entry Steps"],
  heater: false,
  saltSystem: true,
  carbonFiber: true
},
{
  model: "Laguna Deluxe",
  price: 74419,
  category: 'deluxe',
  image: "/lovable-uploads/laguna-deluxe-pool.png",
  dimensions: "14′ × 35′",
  depth: "3′ 6″ – 6′",
  installationTimeWeeks: 16,
  warrantyYears: "Lifetime",
  features: ["Salt system included", "Freeform Design", "Tanning Ledge", "Larger Size"],
  heater: false,
  saltSystem: true,
  carbonFiber: true
},
{
  model: "Valencia",
  price: 51144,
  category: 'standard',
  image: "/lovable-uploads/d8c4a7c6-4bbe-481d-8a47-5d7feecb1861.png",
  dimensions: "12′ × 28′",
  depth: "3′ 6″ – 5′ 6″",
  installationTimeWeeks: 16,
  warrantyYears: "Lifetime",
  features: ["Salt system included", "Freeform Design", "Entry Steps"],
  heater: false,
  saltSystem: true,
  carbonFiber: true
},
// Large Pools - Latham
{
  model: "Coronado",
  price: 78750,
  category: 'premium',
  image: "/lovable-uploads/c7c3ab88-34ab-47d4-bf6c-38893a5b13f2.png",
  dimensions: "16′ × 32′",
  depth: "3′ 6″ – 6′",
  installationTimeWeeks: 16,
  warrantyYears: "Lifetime",
  features: ["Salt system included", "Large Size", "Deep End", "Entry Steps"],
  heater: false,
  saltSystem: true,
  carbonFiber: true
},
{
  model: "Synergy",
  price: 80763,
  category: 'premium',
  image: "/lovable-uploads/1c6556f8-0571-434d-a877-e5152aee1726.png",
  dimensions: "16′ × 36′",
  depth: "3′ 6″ – 6′",
  installationTimeWeeks: 16,
  warrantyYears: "Lifetime",
  features: ["Salt system included", "Cutting-edge Design", "Ultimate Features", "Premium Construction"],
  heater: false,
  saltSystem: true,
  carbonFiber: true
},
];

// Spa models
const spas: Spa[] = [{
  model: "Mystic",
  price: 17045,
  category: 'premium',
  image: "/lovable-uploads/3bdd9802-26f9-47ab-8498-e0e66344685c.png",
  dimensions: "8′ × 8′",
  depth: "3′ 6″",
  features: ["LED Lighting", "Premium Jets", "Heater Ready"],
  spilloverFeature: false,
  installationTimeWeeks: 16,
  warrantyYears: "Lifetime"
}, {
  model: "Mystic Spillover",
  price: 18638,
  category: 'premium',
  image: "/lovable-uploads/3bdd9802-26f9-47ab-8498-e0e66344685c.png",
  dimensions: "8′ × 8′",
  depth: "3′ 6″",
  features: ["Spillover Feature", "LED Lighting", "Premium Jets", "Heater Ready"],
  spilloverFeature: true,
  installationTimeWeeks: 16,
  warrantyYears: "Lifetime"
}, {
  model: "Regal",
  price: 16363,
  category: 'deluxe',
  image: "/lovable-uploads/31da0c59-77d4-4fa1-838b-cb525acd404b.png",
  dimensions: "7′ × 7′",
  depth: "3′ 2″",
  features: ["Therapeutic Jets", "Easy Controls", "Energy Efficient"],
  spilloverFeature: false,
  installationTimeWeeks: 16,
  warrantyYears: "Lifetime"
}, {
  model: "Regal Spillover",
  price: 17850,
  category: 'deluxe',
  image: "/lovable-uploads/31da0c59-77d4-4fa1-838b-cb525acd404b.png",
  dimensions: "7′ × 7′",
  depth: "3′ 2″",
  features: ["Spillover Feature", "Therapeutic Jets", "Easy Controls", "Energy Efficient"],
  spilloverFeature: true,
  installationTimeWeeks: 16,
  warrantyYears: "Lifetime"
}, {
  model: "Royal",
  price: 16363,
  category: 'standard',
  image: "/lovable-uploads/62676335-6a09-4389-9a8a-cba74d583c53.png",
  dimensions: "6′ × 8′",
  depth: "3′",
  features: ["Modern Design", "Durable Construction", "Low Maintenance"],
  spilloverFeature: false,
  installationTimeWeeks: 16,
  warrantyYears: "Lifetime"
}, {
  model: "Royal Spillover",
  price: 17850,
  category: 'standard',
  image: "/lovable-uploads/62676335-6a09-4389-9a8a-cba74d583c53.png",
  dimensions: "6′ × 8′",
  depth: "3′",
  features: ["Spillover Feature", "Modern Design", "Durable Construction", "Low Maintenance"],
  spilloverFeature: true,
  installationTimeWeeks: 16,
  warrantyYears: "Lifetime"
}, {
  model: "Shasta",
  price: 13213,
  category: 'standard',
  image: "/lovable-uploads/1a143a47-5e78-46a8-8172-426b7644bea8.png",
  dimensions: "7′ diameter",
  depth: "3′",
  features: ["Circular Design", "Compact Footprint", "Easy Entry"],
  spilloverFeature: false,
  installationTimeWeeks: 16,
  warrantyYears: "Lifetime"
}, {
  model: "Shasta Spillover",
  price: 14788,
  category: 'standard',
  image: "/lovable-uploads/1a143a47-5e78-46a8-8172-426b7644bea8.png",
  dimensions: "7′ diameter",
  depth: "3′",
  features: ["Spillover Feature", "Circular Design", "Compact Footprint", "Easy Entry"],
  spilloverFeature: true,
  installationTimeWeeks: 16,
  warrantyYears: "Lifetime"
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
    // Smooth scroll to top of Latham section (not page top)
    const lathamSection = document.querySelector('[class*="text-center mb-8 sm:mb-12 lg:mb-16 mt-20"]');
    if (lathamSection) {
      lathamSection.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };
  return <>
      {/* Pool Collection Section */}
      <section className="py-10 sm:py-16 lg:py-20 px-2 sm:px-4 relative overflow-hidden border-t-4 border-gradient-to-r from-primary via-coral to-teal">
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

          {/* Deals & Best Offers Section */}
          <DealsSection onViewDeal={(deal) => {
            // Find matching pool from deals and open quote
            const matchingPool = pools.find(p => 
              deal.name.toLowerCase().includes(p.model.toLowerCase().split(' ')[0])
            );
            if (matchingPool) {
              handleRequestQuote(matchingPool);
            }
          }} />

          {/* Wonderlands World Collection - Only Madre Perla and Pacific Ridge */}
          <div className="relative overflow-hidden py-16 bg-gradient-to-b from-primary/5 via-background to-coral/5">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {/* Gradient Orbs */}
              <div className="absolute top-20 left-10 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-20 right-10 w-96 h-96 bg-coral/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-teal/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
              
              {/* Floating Elements */}
              <div className="absolute top-10 right-20 animate-[float_6s_ease-in-out_infinite]">
                <Droplets className="w-12 h-12 text-primary/30" />
              </div>
              <div className="absolute bottom-20 left-20 animate-[float_8s_ease-in-out_infinite]" style={{ animationDelay: '2s' }}>
                <Sparkles className="w-10 h-10 text-coral/30" />
              </div>
              
              {/* SVG Wave Pattern */}
              <svg className="absolute bottom-0 left-0 w-full h-32 opacity-20" viewBox="0 0 1200 120" preserveAspectRatio="none">
                <path d="M0,50 C150,80 350,0 600,50 C850,100 1050,20 1200,50 L1200,120 L0,120 Z" fill="url(#wave-gradient)" />
                <defs>
                  <linearGradient id="wave-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.5" />
                    <stop offset="50%" stopColor="hsl(var(--coral))" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="hsl(var(--teal))" stopOpacity="0.5" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            {/* Content */}
            <div className="relative z-10">
              <div className="text-center mb-8 sm:mb-12 lg:mb-16">
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 lg:mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary via-coral to-teal">Wonderlands World Collection</h2>
                <p className="text-sm sm:text-base lg:text-xl text-foreground/80 max-w-2xl mx-auto px-2 sm:px-0">Premium Concrete Infinity Pools - The Pinnacle of Luxury</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-16 px-4">
                {pools.filter(pool => pool.model === 'Madre Perla' || pool.model === 'Pacific Ridge' || pool.model === 'Maxima' || pool.model === 'Winderview').map(pool => {
                  // Override some props for Winderview since it's concrete
                  const poolProps = pool.model === 'Winderview' 
                    ? { ...pool, type: 'Concrete Pool', features: [...(pool.features || []), 'Concrete Construction'] }
                    : pool;
                  return <PoolProductCard key={pool.model} pool={poolProps} onViewDetails={handleViewDetails} onRequestQuote={handleRequestQuote} />;
                })}
              </div>
            </div>
          </div>

          {/* Banner between Wonderlands and Latham */}
          <div className="w-full my-12">
            <img 
              src="/lovable-uploads/Astoria_Maxima_029.jpg" 
              alt="Luxury Pool with Mosaic Tiles" 
              className="w-full h-auto object-cover rounded-lg"
            />
          </div>

          {/* Latham Pools Collection */}
          <div className="text-center mb-8 sm:mb-12 lg:mb-16 mt-20">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 lg:mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary via-coral to-teal">Latham Pools Collection</h2>
            <p className="text-sm sm:text-base lg:text-xl text-foreground/80 max-w-2xl mx-auto px-2 sm:px-0">Fiberglass Pools with Lifetime Warranty</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-16">
            {paginatedPools.filter(pool => pool.model !== 'Madre Perla' && pool.model !== 'Pacific Ridge' && pool.model !== 'Maxima' && pool.model !== 'Winderview').map(pool => <PoolProductCard key={pool.model} pool={pool} onViewDetails={handleViewDetails} onRequestQuote={handleRequestQuote} />)}
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