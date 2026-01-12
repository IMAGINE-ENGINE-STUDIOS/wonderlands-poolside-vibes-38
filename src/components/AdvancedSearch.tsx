import * as React from 'react';
const { useState, useEffect, useRef } = React;
import { Search, Bot, Mic, MicOff, Sparkles, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { useNavigate } from 'react-router-dom';
import { useAIAssistant } from '@/contexts/AIAssistantContext';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import { allProducts, getProductsByCategory } from '@/data/consolidatedProducts';
import { poolLiners, poolTiles, tanningLedges } from '@/data/poolData';
import { paverTypes, copingTypes } from '@/data/paverData';
import { saunas } from '@/data/saunaData';
import { drivewayGates } from '@/data/drivewayGates';
import { gilmerPools } from '@/data/gilmerPools';
import { cn } from '@/lib/utils';

// Import banner images for sections
import saunaBanner from "@/assets/banners/sauna-banner.jpg";
import spaBanner from "@/assets/banners/spa-banner.jpg";
import screenEnclosureBanner from "@/assets/banners/screen-enclosure-banner.jpg";
import paversBanner from "@/assets/banners/pavers-banner.jpg";
import coversBanner from "@/assets/banners/covers-banner.jpg";
import drivewayGateBanner from "@/assets/banners/driveway-gate-banner.jpg";
import tanningLedgeBanner from "@/assets/banners/tanning-ledge-banner.jpg";
import patioFencingBanner from "@/assets/banners/patio-fencing-banner.jpg";
import lanaiBanner from "@/assets/banners/lanai-banner.jpg";

// Section data for quick navigation dropdown
const mainPageSections = [
  { id: 'pools', label: 'Pools', image: '/lovable-uploads/c7c3ab88-34ab-47d4-bf6c-38893a5b13f2.png', description: 'Premium fiberglass & concrete pools' },
  { id: 'saunas', label: 'Saunas', image: saunaBanner, description: 'Indoor & outdoor barrel saunas' },
  { id: 'spas', label: 'Hot Tubs & Spas', image: spaBanner, description: 'Luxury hot tubs & jacuzzis' },
  { id: 'tanning-ledges', label: 'Tanning Ledges', image: tanningLedgeBanner, description: 'In-pool sun shelves & ledges' },
  { id: 'screen-enclosures', label: 'Screen Enclosures', image: screenEnclosureBanner, description: 'Pool cage & patio enclosures' },
  { id: 'patio-fencing', label: 'Patio Fencing', image: patioFencingBanner, description: 'Aluminum pool-code fencing' },
  { id: 'lanai', label: 'Lanai', image: lanaiBanner, description: 'Covered outdoor living spaces' },
  { id: 'pavers', label: 'Pavers', image: paversBanner, description: 'Pool deck & patio pavers' },
  { id: 'covers', label: 'Pool Covers', image: coversBanner, description: 'Automatic safety covers' },
  { id: 'driveway-gates', label: 'Driveway Gates', image: drivewayGateBanner, description: 'Ornamental entry gates' },
  { id: 'finishes', label: 'Pool Finishes', image: '/lovable-uploads/390cf824-aed3-4f60-9fc3-f3910c0ffe44.png', description: 'Interior pool finishes' },
  { id: 'liners', label: 'Pool Liners', image: '/lovable-uploads/c5cd2f96-d31a-446b-943b-6dd1620f6521.png', description: 'Glass & porcelain tiles' },
];

interface SearchResult {
  id: string;
  name: string;
  category: string;
  price: number;
  image?: string;
  type: 'pool' | 'product';
}

const AdvancedSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showSectionMenu, setShowSectionMenu] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { openChat } = useAIAssistant();
  
  // Voice input hook
  const {
    isListening,
    transcript,
    interimTranscript,
    isSupported: voiceSupported,
    startListening,
    stopListening,
    resetTranscript,
  } = useVoiceInput();

  // Handle voice transcript - update search query as user speaks
  useEffect(() => {
    if (transcript && !isListening) {
      setSearchQuery(prev => prev + transcript);
      resetTranscript();
    }
  }, [transcript, isListening, resetTranscript]);

  // Show interim transcript while speaking
  useEffect(() => {
    if (interimTranscript && isListening) {
      // Show what user is saying in real-time
    }
  }, [interimTranscript, isListening]);

  const handleAskAI = () => {
    const query = searchQuery.trim() || interimTranscript;
    if (query) {
      openChat(`I'm looking for: ${query}`);
    } else {
      openChat();
    }
    // Keep search results visible - don't clear
    setIsFocused(false);
    setShowSectionMenu(false);
    // Don't clear searchQuery so results stay visible
  };

  const toggleVoice = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
      inputRef.current?.focus();
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setShowResults(false);
    inputRef.current?.focus();
  };

  // COMPREHENSIVE PRODUCT DATABASE - All products from all data sources
  const getAllProductData = () => {
    // Pool models from PoolCatalog
    const poolData = [
      // Standard Series
      { id: 'astoria', name: 'Astoria', category: 'Pool', price: 89999, image: '/lovable-uploads/c7c3ab88-34ab-47d4-bf6c-38893a5b13f2.png', keywords: ['pool', 'standard', 'luxury'] },
      { id: 'milan', name: 'Milan', category: 'Pool', price: 45300, image: '/lovable-uploads/121eda70-3d05-4624-afb0-5dba766d8b2f.png', keywords: ['pool', 'standard', 'compact'] },
      { id: 'jamaica', name: 'Jamaica', category: 'Pool', price: 46100, image: '/lovable-uploads/e2d562f0-9a55-4293-8a9f-26d9b09ebf15.png', keywords: ['pool', 'standard', 'tropical'] },
      { id: 'aruba', name: 'Aruba', category: 'Pool', price: 51300, image: '/lovable-uploads/ac53cd88-15e9-4f8a-a3c4-2cd4415b0ec5.png', keywords: ['pool', 'standard', 'caribbean'] },
      { id: 'pleasant-cove', name: 'Pleasant Cove', category: 'Pool', price: 51300, image: '/lovable-uploads/997efdd7-a754-4836-98ac-05c5e9abaf0b.png', keywords: ['pool', 'standard', 'cove'] },

      // Enchantment Compact Series (cache-busting added)
      { id: 'enchantment-917', name: 'Enchantment 9.17', category: 'Pool', price: 47900, image: '/lovable-uploads/d7541cc8-f254-4f85-b6ee-f636a8726dcc.png?v=1', keywords: ['pool', 'compact', 'small', '9x17', '9 x 17'] },
      { id: 'enchantment-921', name: 'Enchantment 9.21', category: 'Pool', price: 54400, image: '/lovable-uploads/63844c0c-04e6-4628-ad09-1b98c9283cf0.png?v=1', keywords: ['pool', 'compact', 'small', '9x21', '9 x 21'] },
      { id: 'enchantment-924', name: 'Enchantment 9.24', category: 'Pool', price: 60800, image: '/lovable-uploads/749a82f6-561b-4f6b-982b-d343dfac9565.png?v=1', keywords: ['pool', 'compact', 'small', '9x24', '9 x 24'] },

      // Tuscan Series
      { id: 'tuscan-1120', name: 'Tuscan 11.20', category: 'Pool', price: 59430, image: '/lovable-uploads/579d34e1-ef64-4134-bf8b-dff4980bb17a.png', keywords: ['pool', 'deluxe', 'medium', '11x20', '11 x 20'] },
      { id: 'tuscan-1324', name: 'Tuscan 13.24', category: 'Pool', price: 72870, image: '/lovable-uploads/2677d17d-ba82-407b-896c-b4b3e238b8d5.png', keywords: ['pool', 'deluxe', 'medium', '13x24', '13 x 24'] },
      { id: 'tuscan-1427', name: 'Tuscan 14.27', category: 'Pool', price: 84000, image: '/lovable-uploads/de3068d3-0f04-4a3c-a2ed-f52141f36b3e.png', keywords: ['pool', 'deluxe', 'large', '14x27', '14 x 27'] },
      { id: 'tuscan-1430', name: 'Tuscan 14.30', category: 'Pool', price: 92610, image: '/lovable-uploads/d1c952c1-8786-444d-b405-903533bc20d1.png', keywords: ['pool', 'deluxe', 'large', '14x30', '14 x 30'] },
      { id: 'tuscan-1440', name: 'Tuscan 14.40', category: 'Pool', price: 116550, image: '/lovable-uploads/c1225a37-626d-49a2-9ec4-eb0da0f10060.png', keywords: ['pool', 'deluxe', 'big', 'large', '14x40', '14 x 40'] },

      // Premium/Deluxe Series
      { id: 'st-lucia', name: 'St. Lucia', category: 'Pool', price: 59640, image: '/lovable-uploads/03b6750e-bed3-41df-abcb-6657d36cfa62.png', keywords: ['pool', 'deluxe', 'caribbean'] },
      { id: 'delray', name: 'Delray', category: 'Pool', price: 62265, image: '/lovable-uploads/f549e4e8-647d-4b21-8d48-441f83955c73.png', keywords: ['pool', 'deluxe'] },
      { id: 'java', name: 'Java', category: 'Pool', price: 63000, image: '/lovable-uploads/bca99a48-ba6b-42d0-96d0-bf5ecfc2e4fd.png', keywords: ['pool', 'deluxe'] },
      { id: 'bermuda', name: 'Bermuda', category: 'Pool', price: 64575, image: '/lovable-uploads/311a7002-2a40-4c59-a143-9f0236ece5d4.png', keywords: ['pool', 'deluxe', 'caribbean'] },
      { id: 'key-west', name: 'Key West', category: 'Pool', price: 67515, image: '/lovable-uploads/4e43c832-af03-4cf4-9104-0117e5f3321c.png', keywords: ['pool', 'deluxe', 'florida'] },
      { id: 'valencia', name: 'Valencia', category: 'Pool', price: 68775, image: '/lovable-uploads/d8c4a7c6-4bbe-481d-8a47-5d7feecb1861.png', keywords: ['pool', 'deluxe'] },
      { id: 'vista-isle', name: 'Vista Isle', category: 'Pool', price: 70000, image: '/lovable-uploads/6a41df5e-d6f6-4e49-aa1a-b457ac1902a0.png', keywords: ['pool', 'premium'] },

      // Premium Series
      { id: 'corinthian-12', name: 'Corinthian 12', category: 'Pool', price: 75400, image: '/lovable-uploads/221a9844-ee7c-4fe3-b421-a9fe99bccabf.png', keywords: ['pool', 'premium', 'medium', '12x28', '12 x 28'] },
      { id: 'corinthian-12-bme', name: 'Corinthian 12 BME', category: 'Pool', price: 79400, image: '/lovable-uploads/86678699-3f2c-4863-8a81-d8c63721e03c.png', keywords: ['pool', 'premium', 'medium', 'bme', '12x28', '12 x 28'] },
      { id: 'corinthian-14', name: 'Corinthian 14', category: 'Pool', price: 94500, image: '/lovable-uploads/3ae37221-0f97-48df-addd-632c423868e2.png', keywords: ['pool', 'premium', 'large', '14x32', '14 x 32'] },
      { id: 'corinthian-14-bme', name: 'Corinthian 14 BME', category: 'Pool', price: 98500, image: '/lovable-uploads/a345878e-c014-4929-9e9b-bcb675d02e66.png', keywords: ['pool', 'premium', 'large', 'bme', '14x32', '14 x 32'] },
      { id: 'olympia-12', name: 'Olympia 12', category: 'Pool', price: 76300, image: '/lovable-uploads/0aa90de6-b1eb-43a4-91ec-10c05388c900.png', keywords: ['pool', 'premium', 'medium', '12x27', '12 x 27'] },
      { id: 'olympia-14', name: 'Olympia 14', category: 'Pool', price: 96400, image: '/lovable-uploads/d707c6e1-8471-404f-9312-bd6773152617.png', keywords: ['pool', 'premium', 'large', '14x31', '14 x 31'] },
      { id: 'bay-isle', name: 'Bay Isle', category: 'Pool', price: 80400, image: '/lovable-uploads/a91d91f2-51f8-470c-9894-4a1cf8b1f2c0.png', keywords: ['pool', 'premium'] },
      { id: 'laguna', name: 'Laguna', category: 'Pool', price: 82600, image: '/lovable-uploads/ee464b25-683d-4367-a208-2159c2bd13f3.png', keywords: ['pool', 'premium'] },
      { id: 'laguna-deluxe', name: 'Laguna Deluxe', category: 'Pool', price: 95300, image: '/lovable-uploads/46d142d3-b106-406d-9867-9bf7b63fd469.png', keywords: ['pool', 'premium', 'deluxe'] },
      { id: 'claremont', name: 'Claremont', category: 'Pool', price: 83400, image: '/lovable-uploads/6b7b34a3-03f7-4179-b34a-3458dc881efd.png', keywords: ['pool', 'premium'] },
      { id: 'axiom-14', name: 'Axiom 14', category: 'Pool', price: 87500, image: '/lovable-uploads/d5b2276b-16a9-47bc-99e3-92567972fe5a.png', keywords: ['pool', 'premium', 'large', '14x30', '14 x 30'] },
      { id: 'providence-14', name: 'Providence 14', category: 'Pool', price: 95600, image: '/lovable-uploads/3929943c-2e46-426f-b155-3d79c96d7eb4.png', keywords: ['pool', 'premium', 'large', '14x34', '14 x 34'] },

      // MISSING POOLS - Add these important models
      { id: 'madre-perla', name: 'Madre Perla', category: 'Pool', price: 78500, image: '/lovable-uploads/9e491420-80df-4bb3-9db1-3933d96846ac.png', keywords: ['pool', 'premium', 'madre', 'perla'] },
      { id: 'extreme-27-gilmer', name: 'Extreme 27 (Gilmer Glass)', category: 'Pool', price: 72222, image: '/lovable-uploads/gilmer-extreme-27.jpeg', keywords: ['pool', 'extreme', 'gilmer', 'glass', 'fiber', '12x27', '12 x 27'] },
      { id: 'apollo-14', name: 'Apollo 14', category: 'Pool', price: 72400, image: '/lovable-uploads/31da0c59-77d4-4fa1-838b-cb525acd404b.png', keywords: ['pool', 'premium', 'apollo'] },
      { id: 'ariel-16', name: 'Ariel 16', category: 'Pool', price: 84600, image: '/lovable-uploads/1412e1fb-72ec-4219-a98f-4fcffbd15095.png', keywords: ['pool', 'premium', 'ariel', 'large'] },
      { id: 'coral-16', name: 'Coral 16', category: 'Pool', price: 89200, image: '/lovable-uploads/4511f6d7-594e-4c22-bd69-221e519f2f34.png', keywords: ['pool', 'premium', 'coral', 'large'] },
      { id: 'cape-cod', name: 'Cape Cod', category: 'Pool', price: 67800, image: '/public/lovable-uploads/822d9341-f6f8-46ee-9d13-07d0f2126252.png', keywords: ['pool', 'deluxe', 'cape', 'cod'] },
      { id: 'fiji', name: 'Fiji', category: 'Pool', price: 58900, image: '/public/lovable-uploads/9382c72a-0c7d-4981-8f03-878d568dd1b2.png', keywords: ['pool', 'deluxe', 'fiji', 'tropical'] },
      { id: 'synergy', name: 'Synergy', category: 'Pool', price: 92300, image: '/public/lovable-uploads/1c6556f8-0571-434d-a877-e5152aee1726.png', keywords: ['pool', 'premium', 'synergy'] },
      { id: 'genesis-pool', name: 'Genesis', category: 'Pool', price: 133860, image: '/lovable-uploads/2a611c90-6445-41af-aa15-7d223e357e64.png', keywords: ['pool', 'premium', 'genesis', 'latham', '16x40', '16 x 40', 'freeform'] }
    ];

    // Spas and Hot Tubs
    const spaData = [
      { id: 'mystic', name: 'Mystic Spa', category: 'Spa', price: 24000, image: '/lovable-uploads/f6a9fa78-9ca7-44a8-85ae-9c0b3b3be906.png', keywords: ['spa', 'hot tub', 'jacuzzi', 'mystic'] },
      { id: 'serenity', name: 'Serenity Spa', category: 'Spa', price: 26000, image: '/lovable-uploads/e3bbb69b-9699-4d9e-aca9-8c98b50f2c78.png', keywords: ['spa', 'hot tub', 'jacuzzi', 'serenity'] },
      { id: 'tranquil', name: 'Tranquil Spa', category: 'Spa', price: 26000, image: '/lovable-uploads/7edc4a89-7438-4f88-81f4-8beea8152f07.png', keywords: ['spa', 'hot tub', 'jacuzzi', 'tranquil'] },
      { id: 'oasis', name: 'Oasis Spa', category: 'Spa', price: 28000, image: '/lovable-uploads/46c5f140-bd7e-4a4d-9a19-1f15b078b899.png', keywords: ['spa', 'hot tub', 'jacuzzi', 'oasis'] },
      { id: 'celestial', name: 'Celestial Spa', category: 'Spa', price: 30000, image: '/lovable-uploads/d8bded3c-41a9-4591-b0bc-3e20a9977602.png', keywords: ['spa', 'hot tub', 'jacuzzi', 'celestial'] },
      { id: 'paradise-spa', name: 'Paradise Spa', category: 'Spa', price: 32000, image: '/lovable-uploads/155c5b3a-8bd3-4060-8141-7cf76cb9f153.png', keywords: ['spa', 'hot tub', 'jacuzzi', 'paradise'] }
    ];

    // Pool Finishes from consolidatedProducts and additional data
    const finishData = [
      { id: 'sapphire-blue-crystal', name: 'Sapphire Blue Crystal', category: 'Finish', price: 3500, image: '/lovable-uploads/390cf824-aed3-4f60-9fc3-f3910c0ffe44.png', keywords: ['finish', 'crystal', 'blue', 'sapphire'] },
      { id: 'ocean-blue-crystal', name: 'Ocean Blue Crystal', category: 'Finish', price: 3500, image: '/lovable-uploads/2103693f-cf54-423d-99c7-68d6f3951388.png', keywords: ['finish', 'crystal', 'blue', 'ocean'] },
      { id: 'night-sky-crystal', name: 'Night Sky Crystal', category: 'Finish', price: 3500, image: '/lovable-uploads/90fe0136-31f1-4fa3-b816-56a7a74484fa.png', keywords: ['finish', 'crystal', 'dark', 'night', 'sky'] },
      { id: 'shale-gray-crystal', name: 'Shale Gray Crystal', category: 'Finish', price: 3500, image: '/lovable-uploads/15032ed4-f745-4152-ae9b-c26fdb52f68c.png', keywords: ['finish', 'crystal', 'gray', 'shale'] },
      { id: 'coastal-bronze-crystal', name: 'Coastal Bronze Crystal', category: 'Finish', price: 3500, image: '/lovable-uploads/b1abd5c3-af2e-46fa-82be-5db27d20a388.png', keywords: ['finish', 'crystal', 'bronze', 'coastal'] },
      { id: 'aquamarine-crystal', name: 'Aquamarine Crystal', category: 'Finish', price: 3500, image: '/lovable-uploads/0c70745d-4bf3-4394-8fb2-da6024bf72b9.png', keywords: ['finish', 'crystal', 'aquamarine', 'blue'] },
      { id: 'lagoon-blue-crystal', name: 'Lagoon Blue Crystal', category: 'Finish', price: 3500, image: '/lovable-uploads/805c3cea-4684-4e5b-acae-3405dc854aac.png', keywords: ['finish', 'crystal', 'blue', 'lagoon'] },
      { id: 'pearl-white-crystal', name: 'Pearl White Crystal', category: 'Finish', price: 3500, image: '/lovable-uploads/0a3d28a3-a0dd-41e8-91ba-6c0ec4dbe9af.png', keywords: ['finish', 'crystal', 'white', 'pearl'] }
    ];

    // Pool Tiles from poolData and additional tiles
    const tileData = poolTiles.map(tile => ({
      id: tile.name.toLowerCase().replace(/\s+/g, '-'),
      name: tile.name,
      category: 'Tile',
      price: tile.price,
      image: tile.image,
      keywords: ['tile', 'tiles', 'border', 'waterline', 'mosaic', tile.name.toLowerCase()]
    }));

    // Pool Liners from poolData
    const linerData = poolLiners.map(liner => ({
      id: liner.name.toLowerCase().replace(/\s+/g, '-'),
      name: liner.name,
      category: 'Liner',
      price: liner.price,
      image: liner.image,
      keywords: ['liner', 'liners', liner.type?.toLowerCase() || '', liner.name.toLowerCase()]
    }));

    // Tanning Ledges from poolData
    const tanningLedgeData = tanningLedges.map(ledge => ({
      id: ledge.name.toLowerCase().replace(/\s+/g, '-'),
      name: ledge.name,
      category: 'Tanning Ledge',
      price: ledge.price,
      image: ledge.image,
      keywords: ['tanning', 'ledge', 'ledges', 'sun shelf', 'beach entry', 'shallow', ledge.name.toLowerCase()]
    }));

    // Pavers from paverData
    const paverData = paverTypes.map(paver => ({
      id: paver.id,
      name: paver.name,
      category: 'Paver',
      price: paver.basePrice,
      image: paver.image,
      keywords: ['paver', 'pavers', 'decking', 'flooring', 'deck', 'patio', 'stone', paver.name.toLowerCase()]
    }));

    // Coping from paverData
    const copingData = copingTypes.map(coping => ({
      id: coping.id,
      name: coping.name,
      category: 'Coping',
      price: coping.basePrice,
      image: coping.image,
      keywords: ['coping', 'edge', 'pool edge', 'border', coping.name.toLowerCase()]
    }));

    // Pool Equipment and Accessories
    const equipmentData = [
      { id: 'gas-heater', name: 'Natural Gas Pool Heater', category: 'Heater', price: 3500, image: '/lovable-uploads/b871f521-8e15-4ed4-ad20-1a3774f535cd.png', keywords: ['heater', 'heaters', 'pool heater', 'gas', 'heating'] },
      { id: 'electric-heater', name: 'Electric Pool Heater', category: 'Heater', price: 2800, image: '/lovable-uploads/b871f521-8e15-4ed4-ad20-1a3774f535cd.png', keywords: ['heater', 'heaters', 'pool heater', 'electric', 'heating'] },
      { id: 'heat-pump', name: 'Heat Pump Pool Heater', category: 'Heater', price: 4200, image: '/lovable-uploads/b871f521-8e15-4ed4-ad20-1a3774f535cd.png', keywords: ['heater', 'heaters', 'pool heater', 'heat pump', 'heating'] },
      { id: 'solar-heater', name: 'Solar Pool Heater', category: 'Heater', price: 5000, image: '/lovable-uploads/b871f521-8e15-4ed4-ad20-1a3774f535cd.png', keywords: ['heater', 'heaters', 'pool heater', 'solar', 'heating'] }
    ];

    // Pool Covers
    const coverData = [
      { id: 'eclipse', name: 'Eclipse Automatic Cover', category: 'Cover', price: 27000, image: '/lovable-uploads/1fd97401-223a-4a79-bf65-e7734138513e.png', keywords: ['cover', 'covers', 'automatic', 'pool cover', 'automatic cover', 'eclipse'] },
      { id: 'cs3000', name: 'CS3000 Automatic Cover', category: 'Cover', price: 30000, image: '/lovable-uploads/5d870105-61a5-4d79-a200-33c70c5ac38f.png', keywords: ['cover', 'covers', 'automatic', 'pool cover', 'automatic cover', 'cs3000'] },
      { id: 'infinity-4000', name: 'Infinity 4000 Cover', category: 'Cover', price: 32000, image: '/lovable-uploads/695627f9-9391-4b1c-babd-a352309fd232.png', keywords: ['cover', 'covers', 'automatic', 'pool cover', 'automatic cover', 'infinity'] },
      { id: 'atom', name: 'Atom Automatic Cover', category: 'Cover', price: 25000, image: '/lovable-uploads/91acd1a8-9997-4d59-8c6d-a8635810989b.png', keywords: ['cover', 'covers', 'automatic', 'pool cover', 'automatic cover', 'atom'] },
      { id: 'safety-cover', name: 'Safety Pool Cover', category: 'Cover', price: 1800, image: '/lovable-uploads/c20921ab-8964-417b-9ca5-069eea4976b7.png', keywords: ['cover', 'covers', 'safety', 'pool cover', 'safety cover'] },
      { id: 'solar-cover', name: 'Solar Pool Cover', category: 'Cover', price: 800, image: '/lovable-uploads/c5cd2f96-d31a-446b-943b-6dd1620f6521.png', keywords: ['cover', 'covers', 'solar', 'pool cover', 'solar cover'] }
    ];

    // Screen Enclosures
    const screenData = [
      { id: 'standard-screen', name: 'Standard Screen Enclosure', category: 'Screen Enclosure', price: 27, image: '/lovable-uploads/8bf11ea9-c402-4834-a163-0876545498bd.png', keywords: ['screen', 'enclosure', 'screen enclosure', 'standard'] },
      { id: 'premium-screen', name: 'Premium Screen Enclosure', category: 'Screen Enclosure', price: 33, image: '/lovable-uploads/8bf11ea9-c402-4834-a163-0876545498bd.png', keywords: ['screen', 'enclosure', 'screen enclosure', 'premium'] }
    ];

    // Saunas from saunaData
    const saunaData = saunas.map(sauna => ({
      id: sauna.id,
      name: sauna.name,
      category: 'Sauna',
      price: sauna.price,
      image: sauna.image,
      keywords: ['sauna', 'saunas', 'barrel sauna', 'infrared', 'traditional', sauna.name.toLowerCase(), sauna.capacity?.toLowerCase() || '']
    }));

    // Driveway Gates
    const gateData = drivewayGates.map(gate => ({
      id: `gate-${gate.baseDimensions?.replace(/\s+/g, '-')}`,
      name: `${gate.model} ${gate.baseDimensions}`,
      category: 'Driveway Gate',
      price: gate.basePrice,
      image: gate.image,
      keywords: ['gate', 'gates', 'driveway gate', 'fence gate', 'prague', 'aleko', gate.baseDimensions?.toLowerCase() || '']
    }));

    // Gilmer Glass Pools
    const gilmerPoolData = gilmerPools.map(pool => ({
      id: `gilmer-${pool.model.toLowerCase().replace(/\s+/g, '-')}`,
      name: pool.model,
      category: 'Pool',
      price: pool.price,
      image: pool.image,
      keywords: ['pool', 'gilmer', 'glass', 'fiber', 'fiberglass', pool.category, pool.model.toLowerCase(), pool.dimensions?.toLowerCase().replace(/'/g, '') || '']
    }));

    // Combine all product data
    return [
      ...poolData,
      ...gilmerPoolData,
      ...spaData,
      ...finishData,
      ...tileData,
      ...linerData,
      ...tanningLedgeData,
      ...paverData,
      ...copingData,
      ...equipmentData,
      ...coverData,
      ...screenData,
      ...saunaData,
      ...gateData
    ];
  };

  const performSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setIsLoading(true);
    
    try {
      const lowerQuery = query.toLowerCase();
      const allProducts = getAllProductData();
      
      // Check for measurements pattern (e.g., "16 x 40", "12x28", "16'x40'", etc.)
      const measurementPattern = /(\d+)[\s]*[x×][\s]*(\d+)/i;
      const measurementMatch = lowerQuery.match(measurementPattern);
      
      let results = [];
      
      if (measurementMatch) {
        // Extract dimensions for measurement-based search
        const width = parseInt(measurementMatch[1]);
        const length = parseInt(measurementMatch[2]);
        
        // Find products with closest dimensions (mainly pools, tanning ledges, and spas)
        results = allProducts
          .filter(product => ['Pool', 'Spa', 'Tanning Ledge'].includes(product.category))
          .map(product => {
            let score = 0;
            
            // Check keywords for measurement patterns
            const dimensionPatterns = [
              `${width}x${length}`, `${width} x ${length}`,
              `${length}x${width}`, `${length} x ${width}`
            ];
            
            if (product.keywords?.some(keyword => 
              dimensionPatterns.some(pattern => keyword.includes(pattern))
            )) {
              score = 1000; // Perfect match
            } else {
              // Check for partial dimension matches
              if (product.keywords?.some(keyword => keyword.includes(width.toString()))) score += 300;
              if (product.keywords?.some(keyword => keyword.includes(length.toString()))) score += 300;
              
              // Size category matching for pools
              const totalSize = width + length;
              if (totalSize < 40 && product.keywords?.includes('small')) score += 200;
              if (totalSize >= 40 && totalSize < 60 && product.keywords?.includes('medium')) score += 200;
              if (totalSize >= 60 && product.keywords?.includes('large')) score += 200;
            }
            
            return { ...product, score };
          })
          .filter(product => product.score > 0)
          .sort((a, b) => b.score - a.score)
          .slice(0, 12);
      } else {
        // Comprehensive keyword-based search for ALL product types
        results = allProducts.filter(product => {
          // Search in name
          if (product.name.toLowerCase().includes(lowerQuery)) return true;
          
          // Search in category
          if (product.category.toLowerCase().includes(lowerQuery)) return true;
          
          // Search in keywords
          if (product.keywords?.some(keyword => 
            keyword.includes(lowerQuery) || lowerQuery.includes(keyword)
          )) return true;
          
          // Special handling for partial word matches
          const queryWords = lowerQuery.split(' ');
          return queryWords.some(word => 
            word.length > 2 && (
              product.name.toLowerCase().includes(word) ||
              product.keywords?.some(keyword => keyword.includes(word))
            )
          );
        });
      }

      // Convert to search results format
      const searchResults = results.slice(0, 20).map(product => ({
        id: product.id,
        name: product.name,
        category: product.category,
        price: product.price,
        image: product.image,
        type: 'product' as const
      }));

      setSearchResults(searchResults);
      setShowResults(searchResults.length > 0);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
      setShowResults(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleResultClick = (result: SearchResult) => {
    // Navigate to Wonderlands Studio with the selected product parameters
    const params = new URLSearchParams({
      model: result.name,
      price: result.price.toString(),
      category: result.category,
      ...(result.image && { image: encodeURIComponent(result.image) })
    });
    
    navigate(`/wonderlands-studio?${params.toString()}`);
    setShowResults(false);
    setSearchQuery('');
  };

  const handleSectionClick = (sectionId: string) => {
    console.log('handleSectionClick called with:', sectionId);
    setShowSectionMenu(false);
    setIsFocused(false);
    
    const currentPath = window.location.pathname;
    console.log('Current path:', currentPath);
    
    const scrollToSection = (retries = 0) => {
      console.log('scrollToSection attempt:', retries, 'looking for:', sectionId);
      const element = document.getElementById(sectionId);
      console.log('Found element:', element);
      
      if (element) {
        const headerOffset = 100;
        const elementPosition = element.getBoundingClientRect().top + window.scrollY;
        console.log('Scrolling to position:', elementPosition - headerOffset);
        window.scrollTo({
          top: elementPosition - headerOffset,
          behavior: 'smooth'
        });
      } else if (retries < 15) {
        // Lazy sections may not be rendered yet - scroll down to trigger them, then retry
        window.scrollBy(0, 400);
        setTimeout(() => scrollToSection(retries + 1), 150);
      } else {
        // Final fallback - use native hash navigation
        console.log('Fallback to hash:', sectionId);
        window.location.hash = sectionId;
      }
    };
    
    if (currentPath === '/' || currentPath === '') {
      setTimeout(() => scrollToSection(0), 100);
    } else {
      navigate('/');
      setTimeout(() => scrollToSection(0), 600);
    }
  };

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSectionMenu(false);
        setIsFocused(false);
        // Only hide results if clicking outside AND there's no active search
        if (!searchQuery) {
          setShowResults(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [searchQuery]);

  // Show section menu when focused and no search query
  const shouldShowSectionMenu = isFocused && !searchQuery && !showResults;

  return (
    <div 
      className={`relative w-full max-w-lg mx-auto transition-transform duration-300 ${
        shouldShowSectionMenu ? '-translate-y-48 sm:-translate-y-16' : ''
      }`} 
      ref={containerRef}
    >
      {/* Voice listening indicator */}
      {isListening && (
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 flex items-center gap-2 text-sm text-red-500 animate-pulse">
          <span className="w-2 h-2 bg-red-500 rounded-full" />
          Listening... {interimTranscript && <span className="text-muted-foreground">"{interimTranscript}"</span>}
        </div>
      )}
      
      <div className={cn(
        "relative flex items-center gap-1 p-1.5 rounded-xl border-2 transition-all duration-300 bg-background/90 backdrop-blur-sm",
        isListening ? "border-red-500 shadow-lg shadow-red-500/20" : "border-primary/20 focus-within:border-primary"
      )}>
        {/* Search Icon */}
        <div className="pl-2">
          <Search className="h-4 w-4 text-muted-foreground" />
        </div>
        
        {/* Input Field */}
        <Input
          ref={inputRef}
          type="text"
          placeholder={isListening ? "Speak now..." : "Search or ask AI anything about pools, spas, pavers..."}
          value={isListening ? (searchQuery + interimTranscript) : searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && searchQuery.trim()) {
              handleAskAI();
            }
          }}
          className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-2 py-2"
        />
        
        {/* Clear Button */}
        {searchQuery && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={clearSearch}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
        
        {/* Voice Input Button */}
        {voiceSupported && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={toggleVoice}
                  className={cn(
                    "h-9 w-9 rounded-lg transition-all",
                    isListening 
                      ? "bg-red-500 text-white hover:bg-red-600 animate-pulse" 
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isListening ? "Stop listening" : "Voice search"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        
        {/* AI Assistant Button */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                onClick={handleAskAI}
                className="h-9 px-3 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white shadow-md"
              >
                <Sparkles className="h-4 w-4 sm:mr-1.5" />
                <span className="hidden sm:inline text-sm font-medium">Ask AI</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Get AI-powered help finding products</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Section Quick Navigation Menu */}
      {shouldShowSectionMenu && (
        <Card className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[95vw] sm:w-[850px] max-w-[900px] z-[100] bg-background border-2 border-primary/20 shadow-2xl overflow-hidden">
          <div className="p-3 pb-0">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-2">
              Browse Categories
            </div>
          </div>
          <ScrollArea className="h-[60vh] sm:h-[55vh] px-3 pb-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
              {mainPageSections.map((section) => (
                <button
                  type="button"
                  key={section.id}
                  className="group relative overflow-hidden rounded-lg cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-lg border border-border/50 text-left w-full"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSectionClick(section.id);
                  }}
                >
                  {/* Background Image */}
                  <div className="relative h-20 sm:h-24">
                    <img 
                      src={section.image} 
                      alt={section.label}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20 pointer-events-none" />
                    
                    {/* Content */}
                    <div className="absolute inset-0 flex flex-col justify-end p-2 sm:p-3 pointer-events-none">
                      <h4 className="text-white font-bold text-xs sm:text-sm leading-tight drop-shadow-lg">
                        {section.label}
                      </h4>
                      <p className="text-white/90 text-[9px] sm:text-[10px] leading-tight line-clamp-2 drop-shadow-md mt-0.5">
                        {section.description}
                      </p>
                    </div>
                    
                    {/* Hover indicator */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      <div className="bg-white/20 backdrop-blur-sm rounded-full p-1">
                        <Search className="h-3 w-3 text-white" />
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        </Card>
      )}

      {/* Search Results */}
      {showResults && (
        <Card className="absolute top-full left-0 right-0 mt-2 max-h-96 overflow-y-auto z-50 bg-background border-2 border-primary/20 shadow-xl">
          <div className="p-2">
            {isLoading ? (
              <div className="text-center py-4 text-muted-foreground">Searching...</div>
            ) : searchResults.length > 0 ? (
              <>
                <div className="text-sm text-muted-foreground mb-2 px-2">
                  Found {searchResults.length} results
                </div>
                {searchResults.map((result) => (
                  <div
                    key={result.id}
                    className="flex items-center gap-3 p-3 hover:bg-primary/10 cursor-pointer rounded-lg transition-colors"
                    onClick={() => handleResultClick(result)}
                  >
                    {result.image && (
                      <img 
                        src={result.image} 
                        alt={result.name}
                        className="w-12 h-12 object-cover rounded-md"
                      />
                    )}
                    <div className="flex-1">
                      <div className="font-medium text-foreground">{result.name}</div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {result.category}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          ${result.price.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                No results found for "{searchQuery}"
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

export default AdvancedSearch;