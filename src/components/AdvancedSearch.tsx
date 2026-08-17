import * as React from 'react';
const { useState, useEffect, useRef } = React;
import { Search, Bot, Mic, MicOff, Sparkles, X, Loader2, Check, XIcon, Calculator } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { useNavigate } from 'react-router-dom';
import { useAIAssistant } from '@/contexts/AIAssistantContext';
import { usePersistentState } from '@/hooks/usePersistentState';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import { useInlineAISearch } from '@/hooks/useInlineAISearch';
import { InlineCalculator } from '@/components/search/InlineCalculator';
import { allProducts, getProductsByCategory } from '@/data/consolidatedProducts';
import { poolLiners, poolTiles, tanningLedges } from '@/data/poolData';
import { paverTypes, copingTypes } from '@/data/paverData';
import { saunas } from '@/data/saunaData';
import { drivewayGates } from '@/data/drivewayGates';
import { gilmerPools } from '@/data/gilmerPools';
import { cn } from '@/lib/utils';
import productImages from '@/data/productImages';

// Import Wonderlands pool images for search
import madrePerlaImage from '@/assets/pools/madre-perla.webp';
import maximaImage from '@/assets/pools/concrete/maxima-pool.webp';
import pacificRidgeImage from '@/assets/pools/pacific-ridge-new.webp';
import wonderPalaceImage from '@/assets/pools/wonderpalace.webp';
import cancunDeluxeImage from '@/assets/pools/cancun-deluxe.webp';
import enchantment917SearchImage from '@/assets/pools/enchantment-917.webp';

// Import banner images for sections
import saunaBanner from "@/assets/banners/sauna-banner.webp";
import spaBanner from "@/assets/banners/spa-banner.webp";
import screenEnclosureBanner from "@/assets/banners/screen-enclosure-banner.webp";
import paversBanner from "@/assets/banners/pavers-banner.webp";
import coversBanner from "@/assets/banners/covers-banner.webp";
import drivewayGateBanner from "@/assets/banners/driveway-gate-banner.webp";
import tanningLedgeBanner from "@/assets/banners/tanning-ledge-banner.webp";
import patioFencingBanner from "@/assets/banners/patio-fencing-banner.webp";
import lanaiBanner from "@/assets/banners/lanai-banner.webp";
import capeCod12Image from "@/assets/pools/cape-cod.webp";

// Section data for quick navigation dropdown
const mainPageSections = [
  { id: 'pools', label: 'Pools', image: '/lovable-uploads/c7c3ab88-34ab-47d4-bf6c-38893a5b13f2.webp', description: 'Premium fiberglass & concrete pools' },
  { id: 'saunas', label: 'Saunas', image: saunaBanner, description: 'Indoor & outdoor barrel saunas' },
  { id: 'spas', label: 'Hot Tubs & Spas', image: spaBanner, description: 'Luxury hot tubs & jacuzzis' },
  { id: 'tanning-ledges', label: 'Tanning Ledges', image: tanningLedgeBanner, description: 'In-pool sun shelves & ledges' },
  { id: 'screen-enclosures', label: 'Screen Enclosures', image: screenEnclosureBanner, description: 'Pool cage & patio enclosures' },
  { id: 'patio-fencing', label: 'Patio Fencing', image: patioFencingBanner, description: 'Aluminum pool-code fencing' },
  { id: 'lanai', label: 'Lanai', image: lanaiBanner, description: 'Covered outdoor living spaces' },
  { id: 'pavers', label: 'Pavers', image: paversBanner, description: 'Pool deck & patio pavers' },
  { id: 'artificial-grass', label: 'Artificial Grass', image: paversBanner, description: 'Premium low-maintenance turf' },
  { id: 'covers', label: 'Pool Covers', image: coversBanner, description: 'Automatic safety covers' },
  { id: 'driveway-gates', label: 'Driveway Gates', image: drivewayGateBanner, description: 'Ornamental entry gates' },
  { id: 'finishes', label: 'Pool Finishes', image: '/lovable-uploads/390cf824-aed3-4f60-9fc3-f3910c0ffe44.webp', description: 'Interior pool finishes' },
  { id: 'liners', label: 'Pool Liners', image: '/lovable-uploads/c5cd2f96-d31a-446b-943b-6dd1620f6521.webp', description: 'Glass & porcelain tiles' },
];

interface SearchResult {
  id: string;
  name: string;
  category: string;
  price: number;
  image?: string;
  type: 'pool' | 'product';
}

interface AdvancedSearchProps {
  variant?: 'default' | 'slim';
  /** Query pushed in from outside (Genius, deep links). Runs the search on change. */
  externalQuery?: string;
}

const AdvancedSearch = ({ variant = 'default', externalQuery }: AdvancedSearchProps) => {
  const isSlim = variant === 'slim';
  const [searchQuery, setSearchQuery] = usePersistentState(`search_query_${variant}`, '');
  const [lastQuery, setLastQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showSectionMenu, setShowSectionMenu] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { openChat } = useAIAssistant();
  const { isLoading: aiLoading, aiResponse, askAI, clearResponse, answerFollowUp, setStudioGuidance } = useInlineAISearch();
  
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

  // Query pushed in from outside (Genius): type it in and open the results
  useEffect(() => {
    const next = externalQuery?.trim();
    if (!next) return;
    setSearchQuery(next);
    setShowResults(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalQuery]);

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

  const handleAskAI = async () => {
    const query = searchQuery.trim() || interimTranscript;
    if (query) {
      setLastQuery(query);
      await askAI(`I'm looking for: ${query}`);
    }
    setIsFocused(false);
    setShowSectionMenu(false);
  };

  const handleFollowUpAnswer = async (answer: string) => {
    await answerFollowUp(answer, lastQuery);
  };

  const handleOpenFullChat = () => {
    openChat(lastQuery ? `I'm looking for: ${lastQuery}` : undefined);
    clearResponse();
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
    clearResponse();
    inputRef.current?.focus();
  };

  // COMPREHENSIVE PRODUCT DATABASE - All products from all data sources
  const getAllProductData = () => {
    // LATHAM FIBERGLASS POOLS - Updated prices from PoolCatalog (3.5x dealer multiplier)
    const lathamPoolData = [
      // Wonderlands Concrete Pools
      { id: 'cape-coral', name: 'Cape Coral', category: 'Pool', price: 85000, image: wonderPalaceImage, keywords: ['pool', 'premium', 'concrete', 'cape coral', '14x28'] },
      { id: 'madre-perla', name: 'Madre Perla', category: 'Pool', price: 168438, image: madrePerlaImage, keywords: ['pool', 'premium', 'concrete', 'infinity', 'madre', 'perla', '20x40'] },
      { id: 'maxima', name: 'Maxima', category: 'Pool', price: 144375, image: maximaImage, keywords: ['pool', 'premium', 'fiberglass', '16x40'] },
      { id: 'pacific-ridge', name: 'Pacific Ridge', category: 'Pool', price: 96250, image: pacificRidgeImage, keywords: ['pool', 'premium', 'concrete', '14x32'] },
      { id: 'winderview', name: 'Winderview', category: 'Pool', price: 91875, image: '/lovable-uploads/winderview-pool.webp', keywords: ['pool', 'premium', 'concrete', 'tanning', '15x31'] },
      { id: 'cancun-deluxe', name: 'Cancún Deluxe', category: 'Pool', price: 112875, image: cancunDeluxeImage, keywords: ['pool', 'deluxe', 'spa', 'integrated', '16x35'] },
      
      // Astoria Series
      { id: 'astoria-12', name: 'Astoria 12', category: 'Pool', price: 81900, image: '/lovable-uploads/c7c3ab88-34ab-47d4-bf6c-38893a5b13f2.webp', keywords: ['pool', 'standard', 'latham', 'astoria', '12x25'] },
      { id: 'astoria-14', name: 'Astoria 14', category: 'Pool', price: 97825, image: '/lovable-uploads/c7c3ab88-34ab-47d4-bf6c-38893a5b13f2.webp', keywords: ['pool', 'deluxe', 'latham', 'astoria', '14x35'] },
      { id: 'astoria-16', name: 'Astoria 16', category: 'Pool', price: 110338, image: '/lovable-uploads/c7c3ab88-34ab-47d4-bf6c-38893a5b13f2.webp', keywords: ['pool', 'premium', 'latham', 'astoria', '16x40'] },
      
      // Milan Series (Compact)
      { id: 'milan-8-14', name: 'Milan 8.14', category: 'Pool', price: 31150, image: '/lovable-uploads/121eda70-3d05-4624-afb0-5dba766d8b2f.webp', keywords: ['pool', 'compact', 'small', 'milan', '8x14'] },
      { id: 'milan-10-16', name: 'Milan 10.16', category: 'Pool', price: 41650, image: '/lovable-uploads/121eda70-3d05-4624-afb0-5dba766d8b2f.webp', keywords: ['pool', 'compact', 'small', 'milan', '10x16'] },
      { id: 'milan-10-20', name: 'Milan 10.20', category: 'Pool', price: 51100, image: '/lovable-uploads/121eda70-3d05-4624-afb0-5dba766d8b2f.webp', keywords: ['pool', 'compact', 'small', 'milan', '10x20'] },
      
      // Jamaica Series
      { id: 'jamaica-10', name: 'Jamaica 10', category: 'Pool', price: 42350, image: '/lovable-uploads/e2d562f0-9a55-4293-8a9f-26d9b09ebf15.webp', keywords: ['pool', 'compact', 'jamaica', '10x20'] },
      { id: 'jamaica-12', name: 'Jamaica 12', category: 'Pool', price: 52150, image: '/lovable-uploads/e2d562f0-9a55-4293-8a9f-26d9b09ebf15.webp', keywords: ['pool', 'compact', 'jamaica', '12x24'] },
      { id: 'jamaica-14', name: 'Jamaica 14', category: 'Pool', price: 60200, image: '/lovable-uploads/e2d562f0-9a55-4293-8a9f-26d9b09ebf15.webp', keywords: ['pool', 'standard', 'jamaica', '14x28'] },
      
      // Standard/Deluxe
      { id: 'aruba', name: 'Aruba', category: 'Pool', price: 47163, image: '/lovable-uploads/ac53cd88-15e9-4f8a-a3c4-2cd4415b0ec5.webp', keywords: ['pool', 'compact', 'latham', '11x22'] },
      { id: 'pleasant-cove', name: 'Pleasant Cove', category: 'Pool', price: 47163, image: '/lovable-uploads/997efdd7-a754-4836-98ac-05c5e9abaf0b.webp', keywords: ['pool', 'compact', 'cove', '11x22'] },
      { id: 'delray', name: 'Delray', category: 'Pool', price: 54513, image: '/lovable-uploads/f549e4e8-647d-4b21-8d48-441f83955c73.webp', keywords: ['pool', 'standard', 'delray', '12x24'] },
      { id: 'key-west', name: 'Key West', category: 'Pool', price: 59150, image: '/lovable-uploads/4e43c832-af03-4cf4-9104-0117e5f3321c.webp', keywords: ['pool', 'standard', 'florida', 'key west', '13x26'] },
      { id: 'cape-cod-12', name: 'Cape Cod 12', category: 'Pool', price: 55125, image: capeCod12Image, keywords: ['pool', 'standard', 'cape cod', '12x24'] },
      { id: 'valencia', name: 'Valencia', category: 'Pool', price: 51144, image: '/lovable-uploads/d8c4a7c6-4bbe-481d-8a47-5d7feecb1861.webp', keywords: ['pool', 'standard', 'valencia', '12x28'] },
      { id: 'vista-isle', name: 'Vista Isle', category: 'Pool', price: 64313, image: '/lovable-uploads/6a41df5e-d6f6-4e49-aa1a-b457ac1902a0.webp', keywords: ['pool', 'standard', 'vista', '13x27'] },
      
      // Bermuda Series
      { id: 'bermuda-12', name: 'Bermuda 12', category: 'Pool', price: 56525, image: '/lovable-uploads/bermuda-pool.webp', keywords: ['pool', 'standard', 'bermuda', '12x24'] },
      { id: 'bermuda-12-deluxe', name: 'Bermuda 12 Deluxe', category: 'Pool', price: 70000, image: '/lovable-uploads/bermuda-pool.webp', keywords: ['pool', 'standard', 'bermuda', 'deluxe', '12x24'] },
      { id: 'bermuda-14', name: 'Bermuda 14', category: 'Pool', price: 75950, image: '/lovable-uploads/bermuda-pool.webp', keywords: ['pool', 'deluxe', 'bermuda', '14x28'] },
      { id: 'bermuda-14-deluxe', name: 'Bermuda 14 Deluxe', category: 'Pool', price: 87588, image: '/lovable-uploads/bermuda-pool.webp', keywords: ['pool', 'deluxe', 'bermuda', 'deluxe', '14x28'] },
      
      // Enchantment Series
      { id: 'enchantment-917', name: 'Enchantment 9.17', category: 'Pool', price: 44100, image: enchantment917SearchImage, keywords: ['pool', 'compact', 'enchantment', '9x17'] },
      { id: 'enchantment-921', name: 'Enchantment 9.21', category: 'Pool', price: 50050, image: '/lovable-uploads/63844c0c-04e6-4628-ad09-1b98c9283cf0.webp', keywords: ['pool', 'compact', 'enchantment', '9x21'] },
      { id: 'enchantment-924', name: 'Enchantment 9.24', category: 'Pool', price: 55913, image: '/lovable-uploads/749a82f6-561b-4f6b-982b-d343dfac9565.webp', keywords: ['pool', 'compact', 'enchantment', '9x24'] },
      
      // Tuscan Series
      { id: 'tuscan-1120', name: 'Tuscan 11.20', category: 'Pool', price: 51975, image: '/lovable-uploads/579d34e1-ef64-4134-bf8b-dff4980bb17a.webp', keywords: ['pool', 'standard', 'tuscan', '11x20'] },
      { id: 'tuscan-1324', name: 'Tuscan 13.24', category: 'Pool', price: 63788, image: '/lovable-uploads/2677d17d-ba82-407b-896c-b4b3e238b8d5.webp', keywords: ['pool', 'standard', 'tuscan', '13x24'] },
      { id: 'tuscan-1427', name: 'Tuscan 14.27', category: 'Pool', price: 73500, image: '/lovable-uploads/de3068d3-0f04-4a3c-a2ed-f52141f36b3e.webp', keywords: ['pool', 'deluxe', 'tuscan', '14x27'] },
      { id: 'tuscan-1430', name: 'Tuscan 14.30', category: 'Pool', price: 81113, image: '/lovable-uploads/d1c952c1-8786-444d-b405-903533bc20d1.webp', keywords: ['pool', 'deluxe', 'tuscan', '14x30'] },
      { id: 'tuscan-1440', name: 'Tuscan 14.40', category: 'Pool', price: 102025, image: '/lovable-uploads/c1225a37-626d-49a2-9ec4-eb0da0f10060.webp', keywords: ['pool', 'premium', 'tuscan', '14x40'] },
      
      // Corinthian Series
      { id: 'corinthian-12', name: 'Corinthian 12', category: 'Pool', price: 69300, image: '/lovable-uploads/221a9844-ee7c-4fe3-b421-a9fe99bccabf.webp', keywords: ['pool', 'standard', 'corinthian', '12x25'] },
      { id: 'corinthian-12-bme', name: 'Corinthian 12 BME', category: 'Pool', price: 72800, image: '/lovable-uploads/86678699-3f2c-4863-8a81-d8c63721e03c.webp', keywords: ['pool', 'standard', 'corinthian', 'bme', '12x25'] },
      { id: 'corinthian-14', name: 'Corinthian 14', category: 'Pool', price: 86888, image: '/lovable-uploads/3ae37221-0f97-48df-addd-632c423868e2.webp', keywords: ['pool', 'deluxe', 'corinthian', '14x32'] },
      { id: 'corinthian-14-bme', name: 'Corinthian 14 BME', category: 'Pool', price: 90388, image: '/lovable-uploads/a345878e-c014-4929-9e9b-bcb675d02e66.webp', keywords: ['pool', 'deluxe', 'corinthian', 'bme', '14x32'] },
      
      // Olympia Series
      { id: 'olympia-12', name: 'Olympia 12', category: 'Pool', price: 70088, image: '/lovable-uploads/olympia-pool.webp', keywords: ['pool', 'standard', 'olympia', '12x25'] },
      { id: 'olympia-14', name: 'Olympia 14', category: 'Pool', price: 88550, image: '/lovable-uploads/olympia-pool.webp', keywords: ['pool', 'deluxe', 'olympia', '14x32'] },
      { id: 'olympia-16', name: 'Olympia 16', category: 'Pool', price: 93363, image: '/lovable-uploads/olympia-pool.webp', keywords: ['pool', 'premium', 'olympia', '16x40'] },
      
      // Axiom Series
      { id: 'axiom-12-deluxe', name: 'Axiom 12 Deluxe', category: 'Pool', price: 69213, image: '/lovable-uploads/d5b2276b-16a9-47bc-99e3-92567972fe5a.webp', keywords: ['pool', 'standard', 'axiom', 'deluxe', '12x28'] },
      { id: 'axiom-14', name: 'Axiom 14', category: 'Pool', price: 80500, image: '/lovable-uploads/d5b2276b-16a9-47bc-99e3-92567972fe5a.webp', keywords: ['pool', 'deluxe', 'axiom', '14x32'] },
      { id: 'axiom-14-deluxe', name: 'Axiom 14 Deluxe', category: 'Pool', price: 87413, image: productImages.axiom14DeluxeMain, keywords: ['pool', 'deluxe', 'axiom', 'spa', '14x30'] },
      { id: 'axiom-16', name: 'Axiom 16', category: 'Pool', price: 94500, image: productImages.axiom16Main, keywords: ['pool', 'premium', 'axiom', '16x35'] },
      
      // Premium/Deluxe
      { id: 'bay-isle', name: 'Bay Isle', category: 'Pool', price: 73938, image: '/lovable-uploads/a91d91f2-51f8-470c-9894-4a1cf8b1f2c0.webp', keywords: ['pool', 'deluxe', 'bay', 'isle', '14x30'] },
      { id: 'claremont', name: 'Claremont', category: 'Pool', price: 76738, image: '/lovable-uploads/6b7b34a3-03f7-4179-b34a-3458dc881efd.webp', keywords: ['pool', 'deluxe', 'claremont', '14x32'] },
      { id: 'laguna', name: 'Laguna', category: 'Pool', price: 64543, image: '/lovable-uploads/ee464b25-683d-4367-a208-2159c2bd13f3.webp', keywords: ['pool', 'deluxe', 'laguna', '14x30'] },
      { id: 'laguna-deluxe', name: 'Laguna Deluxe', category: 'Pool', price: 74419, image: '/lovable-uploads/laguna-deluxe-pool.webp', keywords: ['pool', 'deluxe', 'laguna', '14x35'] },
      { id: 'coronado', name: 'Coronado', category: 'Pool', price: 78750, image: '/lovable-uploads/c7c3ab88-34ab-47d4-bf6c-38893a5b13f2.webp', keywords: ['pool', 'premium', 'coronado', '16x32'] },
      { id: 'synergy', name: 'Synergy', category: 'Pool', price: 80763, image: '/lovable-uploads/1c6556f8-0571-434d-a877-e5152aee1726.webp', keywords: ['pool', 'premium', 'synergy', '16x36'] },
    ];

    // GLIMMERGLASS POOLS - Use imported data from gilmerPools (has correct image imports)
    const gilmerPoolData = gilmerPools.map(pool => ({
      id: pool.model.toLowerCase().replace(/\s+/g, '-'),
      name: pool.model,
      category: 'Pool',
      price: pool.price,
      image: pool.image,
      keywords: ['pool', pool.category || 'standard', 'glimmerglass', pool.dimensions?.replace(/['"×x\s]/g, '') || '']
    }));

    // Combine all pools
    const poolData = [...lathamPoolData, ...gilmerPoolData];

    // Spas and Hot Tubs (4x multiplier)
    const spaData = [
      { id: 'moonlight-spa', name: 'Moonlight Spillover Spa', category: 'Spa', price: 20000, image: '/lovable-uploads/f6a9fa78-9ca7-44a8-85ae-9c0b3b3be906.webp', keywords: ['spa', 'hot tub', 'jacuzzi', 'moonlight', 'spillover'] },
      { id: 'tranquility-spa', name: 'Tranquility Spa', category: 'Spa', price: 20000, image: '/lovable-uploads/e3bbb69b-9699-4d9e-aca9-8c98b50f2c78.webp', keywords: ['spa', 'hot tub', 'jacuzzi', 'tranquility'] },
      { id: 'pacifica-spa', name: 'Pacifica Spa', category: 'Spa', price: 18000, image: '/lovable-uploads/7edc4a89-7438-4f88-81f4-8beea8152f07.webp', keywords: ['spa', 'hot tub', 'jacuzzi', 'pacifica'] },
      { id: 'pearl-spa', name: 'Pearl Spillover Spa', category: 'Spa', price: 18000, image: '/lovable-uploads/46c5f140-bd7e-4a4d-9a19-1f15b078b899.webp', keywords: ['spa', 'hot tub', 'jacuzzi', 'pearl', 'spillover'] },
    ];

    // Pool Finishes from consolidatedProducts and additional data
    const finishData = [
      { id: 'sapphire-blue-crystal', name: 'Sapphire Blue Crystal', category: 'Finish', price: 3500, image: '/lovable-uploads/390cf824-aed3-4f60-9fc3-f3910c0ffe44.webp', keywords: ['finish', 'crystal', 'blue', 'sapphire'] },
      { id: 'ocean-blue-crystal', name: 'Ocean Blue Crystal', category: 'Finish', price: 3500, image: '/lovable-uploads/2103693f-cf54-423d-99c7-68d6f3951388.webp', keywords: ['finish', 'crystal', 'blue', 'ocean'] },
      { id: 'night-sky-crystal', name: 'Night Sky Crystal', category: 'Finish', price: 3500, image: '/lovable-uploads/90fe0136-31f1-4fa3-b816-56a7a74484fa.webp', keywords: ['finish', 'crystal', 'dark', 'night', 'sky'] },
      { id: 'shale-gray-crystal', name: 'Shale Gray Crystal', category: 'Finish', price: 3500, image: '/lovable-uploads/15032ed4-f745-4152-ae9b-c26fdb52f68c.webp', keywords: ['finish', 'crystal', 'gray', 'shale'] },
      { id: 'coastal-bronze-crystal', name: 'Coastal Bronze Crystal', category: 'Finish', price: 3500, image: '/lovable-uploads/b1abd5c3-af2e-46fa-82be-5db27d20a388.webp', keywords: ['finish', 'crystal', 'bronze', 'coastal'] },
      { id: 'aquamarine-crystal', name: 'Aquamarine Crystal', category: 'Finish', price: 3500, image: '/lovable-uploads/0c70745d-4bf3-4394-8fb2-da6024bf72b9.webp', keywords: ['finish', 'crystal', 'aquamarine', 'blue'] },
      { id: 'lagoon-blue-crystal', name: 'Lagoon Blue Crystal', category: 'Finish', price: 3500, image: '/lovable-uploads/805c3cea-4684-4e5b-acae-3405dc854aac.webp', keywords: ['finish', 'crystal', 'blue', 'lagoon'] },
      { id: 'pearl-white-crystal', name: 'Pearl White Crystal', category: 'Finish', price: 3500, image: '/lovable-uploads/0a3d28a3-a0dd-41e8-91ba-6c0ec4dbe9af.webp', keywords: ['finish', 'crystal', 'white', 'pearl'] }
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
      { id: 'gas-heater', name: 'Natural Gas Pool Heater', category: 'Heater', price: 5250, image: '/lovable-uploads/b871f521-8e15-4ed4-ad20-1a3774f535cd.webp', keywords: ['heater', 'heaters', 'pool heater', 'gas', 'heating'] },
      { id: 'electric-heater', name: 'Electric Pool Heater', category: 'Heater', price: 4200, image: '/lovable-uploads/b871f521-8e15-4ed4-ad20-1a3774f535cd.webp', keywords: ['heater', 'heaters', 'pool heater', 'electric', 'heating'] },
      { id: 'heat-pump', name: 'Heat Pump Pool Heater', category: 'Heater', price: 6300, image: '/lovable-uploads/b871f521-8e15-4ed4-ad20-1a3774f535cd.webp', keywords: ['heater', 'heaters', 'pool heater', 'heat pump', 'heating'] },
      { id: 'solar-heater', name: 'Solar Pool Heater', category: 'Heater', price: 7500, image: '/lovable-uploads/b871f521-8e15-4ed4-ad20-1a3774f535cd.webp', keywords: ['heater', 'heaters', 'pool heater', 'solar', 'heating'] }
    ];

    // Pool Covers
    const coverData = [
      { id: 'eclipse', name: 'Eclipse Automatic Cover', category: 'Cover', price: 27000, image: '/lovable-uploads/1fd97401-223a-4a79-bf65-e7734138513e.webp', keywords: ['cover', 'covers', 'automatic', 'pool cover', 'automatic cover', 'eclipse'] },
      { id: 'cs3000', name: 'CS3000 Automatic Cover', category: 'Cover', price: 30000, image: '/lovable-uploads/5d870105-61a5-4d79-a200-33c70c5ac38f.webp', keywords: ['cover', 'covers', 'automatic', 'pool cover', 'automatic cover', 'cs3000'] },
      { id: 'infinity-4000', name: 'Infinity 4000 Cover', category: 'Cover', price: 32000, image: '/lovable-uploads/695627f9-9391-4b1c-babd-a352309fd232.webp', keywords: ['cover', 'covers', 'automatic', 'pool cover', 'automatic cover', 'infinity'] },
      { id: 'atom', name: 'Atom Automatic Cover', category: 'Cover', price: 25000, image: '/lovable-uploads/91acd1a8-9997-4d59-8c6d-a8635810989b.webp', keywords: ['cover', 'covers', 'automatic', 'pool cover', 'automatic cover', 'atom'] },
      { id: 'safety-cover', name: 'Safety Pool Cover', category: 'Cover', price: 1800, image: '/lovable-uploads/c20921ab-8964-417b-9ca5-069eea4976b7.webp', keywords: ['cover', 'covers', 'safety', 'pool cover', 'safety cover'] },
      { id: 'solar-cover', name: 'Solar Pool Cover', category: 'Cover', price: 800, image: '/lovable-uploads/c5cd2f96-d31a-446b-943b-6dd1620f6521.webp', keywords: ['cover', 'covers', 'solar', 'pool cover', 'solar cover'] }
    ];

    // Screen Enclosures - Standard $22, Deluxe $24, 2 Story $26
    const screenData = [
      { id: 'standard-screen', name: 'Standard Screen Enclosure', category: 'Screen Enclosure', price: 22, image: '/lovable-uploads/8bf11ea9-c402-4834-a163-0876545498bd.webp', keywords: ['screen', 'enclosure', 'screen enclosure', 'standard', 'wonder cage'] },
      { id: 'deluxe-screen', name: 'Deluxe Screen Enclosure', category: 'Screen Enclosure', price: 24, image: '/lovable-uploads/8bf11ea9-c402-4834-a163-0876545498bd.webp', keywords: ['screen', 'enclosure', 'screen enclosure', 'deluxe'] },
      { id: 'premium-screen', name: '2 Story Screen Enclosure', category: 'Screen Enclosure', price: 26, image: '/lovable-uploads/8bf11ea9-c402-4834-a163-0876545498bd.webp', keywords: ['screen', 'enclosure', 'screen enclosure', 'premium', '2 story', 'two story'] },
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

    // Combine all product data
    return [
      ...poolData,
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
    
    // Trigger studio guidance from Sarah - search persists and provides help
    setTimeout(() => {
      setStudioGuidance(result.name, result.category);
    }, 500);
  };

  const handleSectionClick = (sectionId: string) => {
    setShowSectionMenu(false);
    setIsFocused(false);
    
    const currentPath = window.location.pathname;
    
    if (currentPath !== '/' && currentPath !== '') {
      // Navigate to home with hash — browser handles scroll natively
      window.location.href = `/#${sectionId}`;
      return;
    }
    
    // Already on home page — use native hash then keep re-scrolling as layout shifts
    window.location.hash = sectionId;
    
    // Re-adjust multiple times as lazy sections load and expand
    const headerOffset = 80;
    let count = 0;
    const interval = setInterval(() => {
      const el = document.getElementById(sectionId);
      if (el) {
        const pos = el.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({ top: pos - headerOffset, behavior: 'instant' });
      }
      count++;
      if (count >= 15) clearInterval(interval);
    }, 200);
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
      className={`relative w-full max-w-lg md:max-w-3xl lg:max-w-5xl xl:max-w-6xl mx-auto transition-transform duration-300 ${
        shouldShowSectionMenu ? (isSlim ? '-translate-y-12' : '-translate-y-48 sm:-translate-y-16') : ''
      }`} 
      ref={containerRef}
      style={isSlim ? { zIndex: 200 } : undefined}
    >
      {/* Voice listening indicator */}
      {isListening && !isSlim && (
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 flex items-center gap-2 text-sm text-red-500 animate-pulse">
          <span className="w-2 h-2 bg-red-500 rounded-full" />
          Listening... {interimTranscript && <span className="text-muted-foreground">"{interimTranscript}"</span>}
        </div>
      )}
      
      <div className={cn(
        "relative flex items-center gap-1 rounded-xl border-2 transition-all duration-300 bg-background/90 backdrop-blur-sm",
        isSlim ? "p-1 rounded-lg" : "p-1.5",
        isListening ? "border-red-500 shadow-lg shadow-red-500/20" : 
        aiResponse?.needsTextInput ? "border-green-500 shadow-lg shadow-green-500/20" : 
        "border-primary/20 focus-within:border-primary"
      )}>
        {/* Search Icon - turns green when text input needed */}
        <div className="pl-2">
          <Search className={cn(
            "h-4 w-4 transition-colors",
            aiResponse?.needsTextInput ? "text-green-500" : "text-muted-foreground"
          )} />
        </div>
        
        {/* Input Field */}
        <Input
          ref={inputRef}
          type="text"
          placeholder={
            isListening ? "Speak now..." : 
            aiResponse?.needsTextInput ? "Type your answer..." :
            isSlim ? "Search products..." :
            "Search anything about pools, spas, pavers..."
          }
          value={isListening ? (searchQuery + interimTranscript) : searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && searchQuery.trim()) {
              handleAskAI();
            }
          }}
          className={cn(
            "flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-2",
            isSlim ? "py-1 text-sm h-8" : "py-2",
            aiResponse?.needsTextInput && "placeholder:text-green-500/70"
          )}
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
        
        {/* AI Assistant Button - Hidden for now */}
      </div>

      {/* AI Response Summary - Hidden for now */}
      {false && (aiLoading || aiResponse) && (
        <div className="mt-3 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300 bg-background/95 backdrop-blur-md rounded-xl p-3 border border-border shadow-lg">
          {/* Summary Line */}
          <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30">
            {aiLoading ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Sarah is thinking...</span>
              </div>
            ) : aiResponse && (
              <>
                <Sparkles className="h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-foreground flex-1">{aiResponse.summary}</p>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleOpenFullChat}
                  className="h-6 w-6 text-muted-foreground hover:text-foreground"
                >
                  <Bot className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>

          {/* Follow-up Question with Options */}
          {aiResponse?.followUpQuestion && aiResponse?.options && (
            <div className="px-3 py-2 rounded-lg bg-muted border border-border">
              <p className="text-sm text-muted-foreground mb-2">{aiResponse.followUpQuestion}</p>
              <div className="flex flex-wrap gap-2">
                {aiResponse.options.map((option, idx) => (
                  <Button
                    key={idx}
                    size="sm"
                    variant={option.type === 'yes' ? 'default' : option.type === 'no' ? 'destructive' : 'outline'}
                    className={cn(
                      "h-7 text-xs px-3",
                      option.type === 'yes' && "bg-green-600 hover:bg-green-700 text-white",
                      option.type === 'no' && "bg-red-600 hover:bg-red-700 text-white"
                    )}
                    onClick={() => handleFollowUpAnswer(option.label)}
                  >
                    {option.type === 'yes' && <Check className="h-3 w-3 mr-1" />}
                    {option.type === 'no' && <XIcon className="h-3 w-3 mr-1" />}
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Text Input Prompt */}
          {aiResponse?.needsTextInput && aiResponse?.followUpQuestion && !aiResponse?.options && (
            <div className="px-3 py-2 rounded-lg bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30">
              <p className="text-sm text-foreground mb-2">{aiResponse.followUpQuestion}</p>
              <p className="text-xs text-green-600">Type your answer above and press Enter</p>
            </div>
          )}

          {/* Calculator - Shows when AI detects calculation needed */}
          {aiResponse?.showCalculator && (
            <InlineCalculator 
              type={aiResponse.showCalculator} 
              onResult={(result) => {
                console.log('Calculator result:', result);
              }} 
            />
          )}

          {/* Quick Calculator Buttons */}
          {!aiResponse?.showCalculator && aiResponse && (
            <div className="flex flex-wrap gap-1">
              <Button
                size="sm"
                variant="outline"
                className="h-6 text-xs px-2 gap-1"
                onClick={() => handleFollowUpAnswer("I need to calculate paver area")}
              >
                <Calculator className="h-3 w-3" />
                Pavers
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-6 text-xs px-2 gap-1"
                onClick={() => handleFollowUpAnswer("I need to calculate screen enclosure cost")}
              >
                <Calculator className="h-3 w-3" />
                Screen
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-6 text-xs px-2 gap-1"
                onClick={() => handleFollowUpAnswer("I need to calculate fence cost")}
              >
                <Calculator className="h-3 w-3" />
                Fence
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-6 text-xs px-2 gap-1"
                onClick={() => handleFollowUpAnswer("I need to calculate lanai cost")}
              >
                <Calculator className="h-3 w-3" />
                Lanai
              </Button>
            </div>
          )}

          {/* AI-suggested Products - Pool Product Card Style with Tech Sheet */}
          {aiResponse?.products && aiResponse.products.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-medium px-1">Suggested Products</p>
              <ScrollArea className="w-full">
                <div className="flex gap-3 pb-2">
                  {aiResponse.products.slice(0, 6).map((product) => (
                    <Card
                      key={product.id}
                      className="flex-shrink-0 w-44 cursor-pointer hover:shadow-lg hover:border-primary/50 transition-all overflow-hidden group"
                      onClick={() => {
                        const params = new URLSearchParams({
                          model: product.name,
                          price: product.price.toString(),
                          category: product.category,
                        });
                        navigate(`/wonderlands-studio?${params.toString()}`);
                        setShowResults(false);
                        setSearchQuery('');
                        setTimeout(() => {
                          setStudioGuidance(product.name, product.category);
                        }, 500);
                      }}
                    >
                      {/* Product Image */}
                      {product.image && (
                        <div className="relative h-24 overflow-hidden bg-gradient-to-br from-primary/10 to-teal/10">
                          <img loading="lazy" decoding="async" 
                            src={product.image} 
                            alt={product.name}
                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                          />
                          <Badge className="absolute top-1 left-1 text-[10px] capitalize px-1.5 py-0.5 bg-background/80 backdrop-blur-sm">
                            {product.category}
                          </Badge>
                        </div>
                      )}
                      {/* Product Info */}
                      <div className="p-2 space-y-1">
                        <p className="text-sm font-semibold truncate">{product.name}</p>
                        <p className="text-base font-bold text-primary">
                          ${product.price.toLocaleString()}
                        </p>
                        {/* Mini Tech Sheet */}
                        {product.dimensions && (
                          <div className="border-t border-border pt-1 mt-1 space-y-0.5">
                            <div className="flex justify-between text-[10px] text-muted-foreground">
                              <span>Size</span>
                              <span className="font-medium text-foreground">{product.dimensions}</span>
                            </div>
                            {product.depth && (
                              <div className="flex justify-between text-[10px] text-muted-foreground">
                                <span>Depth</span>
                                <span className="font-medium text-foreground">{product.depth}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>
      )}

      {/* Section Quick Navigation Menu */}
      {shouldShowSectionMenu && (
        <Card className={cn(
          "absolute top-full left-1/2 -translate-x-1/2 mt-2 z-[200] bg-background border-2 border-primary/20 shadow-2xl overflow-hidden",
          isSlim ? "w-[90vw] sm:w-[600px] max-w-[650px]" : "w-[95vw] sm:w-[850px] max-w-[900px]"
        )}>
          <div className="p-2 pb-0">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2">
              Browse Categories
            </div>
          </div>
          <ScrollArea className={cn(isSlim ? "h-[40vh] sm:h-[35vh]" : "h-[60vh] sm:h-[55vh]", "px-3 pb-3")}>
            <div className={cn("grid gap-2", isSlim ? "grid-cols-3 sm:grid-cols-4" : "grid-cols-2 sm:grid-cols-4 sm:gap-3")}>
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
                  <div className={cn("relative", isSlim ? "h-16" : "h-20 sm:h-24")}>
                    <img loading="lazy" decoding="async" 
                      src={section.image} 
                      alt={section.label}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20 pointer-events-none" />
                    <div className="absolute inset-0 flex flex-col justify-end p-1.5 sm:p-2 pointer-events-none">
                      <h4 className={cn("text-white font-bold leading-tight drop-shadow-lg", isSlim ? "text-[10px]" : "text-xs sm:text-sm")}>
                        {section.label}
                      </h4>
                      {!isSlim && (
                        <p className="text-white/90 text-[9px] sm:text-[10px] leading-tight line-clamp-2 drop-shadow-md mt-0.5">
                          {section.description}
                        </p>
                      )}
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
                      <img loading="lazy" decoding="async" 
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