import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();

  // Consolidated product data from all main page components
  
  // Pool models from PoolCatalog
  const poolData = [
    { id: 'enchantment-917', name: 'Enchantment 9.17', category: 'Compact', price: 47900, image: '/lovable-uploads/d7541cc8-f254-4f85-b6ee-f636a8726dcc.png' },
    { id: 'enchantment-921', name: 'Enchantment 9.21', category: 'Compact', price: 54400, image: '/lovable-uploads/63844c0c-04e6-4628-ad09-1b98c9283cf0.png' },
    { id: 'enchantment-924', name: 'Enchantment 9.24', category: 'Compact', price: 60800, image: '/lovable-uploads/749a82f6-561b-4f6b-982b-d343dfac9565.png' },
    { id: 'astoria', name: 'Astoria', category: 'Standard', price: 89999, image: '/lovable-uploads/c7c3ab88-34ab-47d4-bf6c-38893a5b13f2.png' },
    { id: 'milan', name: 'Milan', category: 'Standard', price: 45300, image: '/lovable-uploads/121eda70-3d05-4624-afb0-5dba766d8b2f.png' },
    { id: 'jamaica', name: 'Jamaica', category: 'Standard', price: 46100, image: '/lovable-uploads/e2d562f0-9a55-4293-8a9f-26d9b09ebf15.png' },
    { id: 'aruba', name: 'Aruba', category: 'Standard', price: 51300, image: '/lovable-uploads/ac53cd88-15e9-4f8a-a3c4-2cd4415b0ec5.png' },
    { id: 'st-lucia', name: 'St. Lucia', category: 'Deluxe', price: 59640, image: '/lovable-uploads/03b6750e-bed3-41df-abcb-6657d36cfa62.png' },
    { id: 'valencia', name: 'Valencia', category: 'Deluxe', price: 68775, image: '/lovable-uploads/d8c4a7c6-4bbe-481d-8a47-5d7feecb1861.png' },
    { id: 'corinthian-12', name: 'Corinthian 12', category: 'Premium', price: 75400, image: '/lovable-uploads/221a9844-ee7c-4fe3-b421-a9fe99bccabf.png' },
    { id: 'laguna', name: 'Laguna', category: 'Premium', price: 82600, image: '/lovable-uploads/ee464b25-683d-4367-a208-2159c2bd13f3.png' }
  ];

  // All other product categories consolidated from main page sections
  const productCategories = [
    // Spas from SpaCatalog
    { id: 'mystic', name: 'Mystic Spa', category: 'Spa', price: 22000, image: '/lovable-uploads/f6a9fa78-9ca7-44a8-85ae-9c0b3b3be906.png' },
    { id: 'serenity', name: 'Serenity Spa', category: 'Spa', price: 24000, image: '/lovable-uploads/e3bbb69b-9699-4d9e-aca9-8c98b50f2c78.png' },
    { id: 'tranquil', name: 'Tranquil Spa', category: 'Spa', price: 26000, image: '/lovable-uploads/7edc4a89-7438-4f88-81f4-8beea8152f07.png' },
    { id: 'oasis', name: 'Oasis Spa', category: 'Spa', price: 28000, image: '/lovable-uploads/46c5f140-bd7e-4a4d-9a19-1f15b078b899.png' },
    
    // Pool finishes from PoolFinishesSection
    { id: 'sapphire-blue-crystal', name: 'Sapphire Blue Crystal', category: 'Finish', price: 3500, image: '/lovable-uploads/390cf824-aed3-4f60-9fc3-f3910c0ffe44.png' },
    { id: 'ocean-blue-crystal', name: 'Ocean Blue Crystal', category: 'Finish', price: 3500, image: '/lovable-uploads/2103693f-cf54-423d-99c7-68d6f3951388.png' },
    { id: 'night-sky-crystal', name: 'Night Sky Crystal', category: 'Finish', price: 3500, image: '/lovable-uploads/90fe0136-31f1-4fa3-b816-56a7a74484fa.png' },
    { id: 'shale-gray-crystal', name: 'Shale Gray Crystal', category: 'Finish', price: 3500, image: '/lovable-uploads/15032ed4-f745-4152-ae9b-c26fdb52f68c.png' },
    { id: 'coastal-bronze-crystal', name: 'Coastal Bronze Crystal', category: 'Finish', price: 3500, image: '/lovable-uploads/b1abd5c3-af2e-46fa-82be-5db27d20a388.png' },
    
    // Pool liners from LinersSection
    { id: 'paradise', name: 'Paradise Glass Liner', category: 'Liner', price: 4500, image: '/lovable-uploads/631882e5-0b2d-43a0-9ee8-27e7e984fb3d.png' },
    { id: 'water-lilies', name: 'Water Lilies Glass Liner', category: 'Liner', price: 4500, image: '/lovable-uploads/7f1b802e-1c58-4807-b6d6-41aab2eed1ca.png' },
    { id: 'sail-boat', name: 'Sail Boat Glass Liner', category: 'Liner', price: 4500, image: '/lovable-uploads/c4b386e8-679d-4ea3-be08-9b8fb9e8d50e.png' },
    { id: 'tikal', name: 'Tikal Porcelain Liner', category: 'Liner', price: 4500, image: '/lovable-uploads/d5e74c29-95f6-4a9a-9395-a98fe4efdadd.png' },
    
    // Pavers from PaversSection
    { id: 'appian-collection', name: 'Appian Collection Pavers', category: 'Paver', price: 15, image: '/lovable-uploads/08c51883-4e87-4344-b773-ec0a6d575b54.png' },
    { id: 'catalina-grana', name: 'Catalina Grana Collection', category: 'Paver', price: 15, image: '/lovable-uploads/58a4af60-11d8-4589-b955-f689476fc1b3.png' },  
    { id: 'catalina-collection', name: 'Catalina Collection Pavers', category: 'Paver', price: 15, image: '/lovable-uploads/9acbe973-a637-476f-bd20-bf7493afcc0c.png' },
    
    // Automatic covers from AutomaticCoversSection
    { id: 'eclipse', name: 'Eclipse Automatic Cover', category: 'Cover', price: 16000, image: '/lovable-uploads/1fd97401-223a-4a79-bf65-e7734138513e.png' },
    { id: 'cs3000', name: 'CS3000 Automatic Cover', category: 'Cover', price: 24000, image: '/lovable-uploads/5d870105-61a5-4d79-a200-33c70c5ac38f.png' },
    { id: 'infinity-4000', name: 'Infinity 4000 Cover', category: 'Cover', price: 32000, image: '/lovable-uploads/695627f9-9391-4b1c-babd-a352309fd232.png' },
    { id: 'atom', name: 'Atom Automatic Cover', category: 'Cover', price: 19000, image: '/lovable-uploads/91acd1a8-9997-4d59-8c6d-a8635810989b.png' },
    
    // Screen enclosures from ScreenEnclosureSection
    { id: 'standard-screen', name: 'Standard Screen Enclosure', category: 'Screen Enclosure', price: 15, image: '/lovable-uploads/8bf11ea9-c402-4834-a163-0876545498bd.png' },
    { id: 'deluxe-screen', name: 'Deluxe Screen Enclosure', category: 'Screen Enclosure', price: 22, image: '/lovable-uploads/8bf11ea9-c402-4834-a163-0876545498bd.png' },
    { id: 'premium-screen', name: 'Premium Screen Enclosure', category: 'Screen Enclosure', price: 28, image: '/lovable-uploads/8bf11ea9-c402-4834-a163-0876545498bd.png' },
    
    // Tanning ledges from TanningLedgeSection  
    { id: 'genesis', name: 'Genesis Tanning Ledge', category: 'Tanning Ledge', price: 22000, image: '/lovable-uploads/2af253b1-b9be-487f-a998-476d396772c4.png' },
    { id: 'hermosa', name: 'Hermosa Tanning Ledge', category: 'Tanning Ledge', price: 24000, image: '/lovable-uploads/8228c334-6fd7-4b29-afae-98628493480d.png' },
    { id: 'rectangle', name: 'Rectangle Tanning Ledge', category: 'Tanning Ledge', price: 25000, image: '/lovable-uploads/c6bebb1e-d2ed-4591-b81d-0af558ed3e52.png' }
  ];

  const performSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setIsLoading(true);
    try {
      // Search in pool data
      const poolResults: SearchResult[] = poolData
        .filter(pool => 
          pool.name.toLowerCase().includes(query.toLowerCase()) ||
          pool.category.toLowerCase().includes(query.toLowerCase())
        )
        .map(pool => ({
          id: pool.id,
          name: pool.name,
          category: pool.category,
          price: pool.price,
          image: pool.image,
          type: 'pool' as const
        }));

      // Search in consolidated product categories
      const productResults: SearchResult[] = productCategories
        .filter(product => 
          product.name.toLowerCase().includes(query.toLowerCase()) ||
          product.category.toLowerCase().includes(query.toLowerCase())
        )
        .map((product) => ({
          id: product.id,
          name: product.name,
          category: product.category,
          price: product.price,
          image: product.image,
          type: 'product' as const
        }));

      const allResults = [...poolResults, ...productResults];
      setSearchResults(allResults.slice(0, 8)); // Limit to 8 results
      setShowResults(true);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProductSelect = (result: SearchResult) => {
    if (result.type === 'pool') {
      navigate(`/pool/${result.id}`);
    } else {
      // Scroll to the appropriate section based on category
      const sectionMap: { [key: string]: string } = {
        'spa': '#spas',
        'finish': '#finishes',
        'liner': '#liners',
        'cover': '#covers',
        'screen enclosure': '#screen-enclosures',
        'tanning ledge': '#spas'
      };

      const section = Object.keys(sectionMap).find(key => 
        result.category.toLowerCase().includes(key)
      );

      if (section) {
        window.location.hash = sectionMap[section];
        const element = document.querySelector(sectionMap[section]);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
    
    setShowResults(false);
    setSearchQuery('');
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      performSearch(searchQuery);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
        <Input
          type="text"
          placeholder="Discover Wonderlands - Your one-stop destination for pools, patios, and outdoor living. Find premium pools, spas, finishes, covers, and more for homeowners and dealers."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-12 pr-4 py-3 text-lg bg-background/95 backdrop-blur border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 rounded-xl shadow-lg"
        />
      </div>

      {showResults && (
        <Card className="absolute top-full mt-2 w-full bg-background/95 backdrop-blur border-border/50 shadow-2xl rounded-xl overflow-hidden z-50">
          {isLoading ? (
            <div className="p-6 text-center text-muted-foreground">
              Searching...
            </div>
          ) : searchResults.length > 0 ? (
            <div className="max-h-96 overflow-y-auto">
              {searchResults.map((result) => (
                <div
                  key={`${result.category}-${result.id}`}
                  className="p-4 hover:bg-accent/50 cursor-pointer border-b border-border/30 last:border-b-0 transition-colors"
                  onClick={() => handleProductSelect(result)}
                >
                  <div className="flex items-center gap-4">
                    {result.image && (
                      <img 
                        src={result.image} 
                        alt={result.name}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground">{result.name}</h3>
                        <Badge variant="secondary" className="text-xs">
                          {result.category}
                        </Badge>
                      </div>
                      {result.price > 0 && (
                        <p className="text-sm text-muted-foreground">
                          ${result.price.toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-muted-foreground">
              No results found for "{searchQuery}"
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default AdvancedSearch;