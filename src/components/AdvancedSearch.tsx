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

  // Mock pool data for search
  const mockPoolData = [
    { id: 'astoria-12', name: 'Astoria 12', category: 'Premium', price: 45000, image: '/lovable-uploads/c7c3ab88-34ab-47d4-bf6c-38893a5b13f2.png' },
    { id: 'apollo-14', name: 'Apollo 14', category: 'Deluxe', price: 38000, image: '/lovable-uploads/9e491420-80df-4bb3-9db1-3933d96846ac.png' },
    { id: 'coral-16', name: 'Coral 16', category: 'Premium', price: 52000, image: '/lovable-uploads/1412e1fb-72ec-4219-a98f-4fcffbd15095.png' },
    { id: 'ariel-16', name: 'Ariel 16', category: 'Standard', price: 35000, image: '/lovable-uploads/a1b42616-0c25-4010-96e3-3fbeba18aae8.png' },
    { id: 'cape-cod', name: 'Cape Cod', category: 'Compact', price: 28000, image: '/lovable-uploads/8a2b7716-7656-48a0-b1b1-6d276b4b9e73.png' }
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
      const poolResults: SearchResult[] = mockPoolData
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

      // Mock product data for other categories
      const productCategories = [
        { name: 'Premium Spa Package', category: 'Spa', price: 25000 },
        { name: 'Ocean Blue Finish', category: 'Finish', price: 5000 },
        { name: 'Premium Vinyl Liner', category: 'Liner', price: 3500 },
        { name: 'Automatic Pool Cover', category: 'Cover', price: 15000 },
        { name: 'Screen Enclosure', category: 'Screen Enclosure', price: 18000 },
        { name: 'Natural Stone Pavers', category: 'Paver', price: 8000 }
      ];

      const productResults: SearchResult[] = productCategories
        .filter(product => 
          product.name.toLowerCase().includes(query.toLowerCase()) ||
          product.category.toLowerCase().includes(query.toLowerCase())
        )
        .map((product, index) => ({
          id: `product-${index}`,
          name: product.name,
          category: product.category,
          price: product.price,
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
        'paver': '#pavers'
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
          placeholder="Search pools, spas, finishes, and more..."
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