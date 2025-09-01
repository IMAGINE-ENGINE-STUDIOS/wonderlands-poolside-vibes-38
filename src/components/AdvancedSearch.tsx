import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface SearchResult {
  id: string;
  name: string;
  category: string;
  price: number;
  image?: string;
  type: 'pool' | 'product' | 'paver';
  subcategory?: string;
  description?: string;
  brand?: string;
  material?: string;
  pattern?: string;
  features?: string[];
  matchedFields?: string[];
}

const AdvancedSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const navigate = useNavigate();

  // Static fallback data (kept for offline/backup scenarios)

  // Helper function to create search keywords from query
  const createSearchKeywords = (query: string): string[] => {
    return query.toLowerCase()
      .split(/[\s,.-]+/)
      .filter(word => word.length > 2)
      .map(word => word.trim());
  };

  // Helper function to check if any keywords match in a text field
  const matchesKeywords = (text: string | null | undefined, keywords: string[]): boolean => {
    if (!text) return false;
    const lowerText = text.toLowerCase();
    return keywords.some(keyword => lowerText.includes(keyword));
  };

  // Helper function to check if any keywords match in an array field
  const matchesArrayKeywords = (arr: string[] | null | undefined, keywords: string[]): boolean => {
    if (!arr || !Array.isArray(arr)) return false;
    const arrText = arr.join(' ').toLowerCase();
    return keywords.some(keyword => arrText.includes(keyword));
  };

  const performSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setIsLoading(true);
    try {
      const keywords = createSearchKeywords(query);
      const allResults: SearchResult[] = [];

      // Search pools table
      const { data: pools, error: poolsError } = await supabase
        .from('pools')
        .select('*')
        .eq('is_active', true);

      if (!poolsError && pools) {
        const poolResults = pools
          .filter(pool => {
            const searchableFields = [
              pool.model,
              pool.category,
              pool.gala_category,
              pool.dimensions,
              pool.depth,
              pool.warranty_years,
              ...(pool.features || []),
              ...(pool.finishes || []),
              ...(pool.covers || []),
              ...(pool.liners || [])
            ];
            
            return keywords.some(keyword =>
              searchableFields.some(field => 
                field && field.toString().toLowerCase().includes(keyword)
              )
            );
          })
          .map(pool => ({
            id: pool.id,
            name: pool.model,
            category: pool.category || 'Pool',
            subcategory: pool.gala_category,
            price: Number(pool.price),
            image: pool.image_url,
            description: `${pool.dimensions || ''} ${pool.depth || ''} ${pool.warranty_years || ''}`.trim(),
            features: pool.features,
            type: 'pool' as const,
            matchedFields: []
          }));

        allResults.push(...poolResults);
      }

      // Search products table
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .gt('stock_quantity', 0);

      if (!productsError && products) {
        const productResults = products
          .filter(product => {
            const searchableFields = [
              product.name,
              product.description,
              product.category,
              product.subcategory,
              product.brand,
              product.sku,
              product.pattern,
              product.material,
              product.motor_type,
              product.installation_time,
              product.warranty_years_text,
              product.type_category,
              product.collection_name,
              ...(product.benefits || [])
            ];
            
            return keywords.some(keyword =>
              searchableFields.some(field => 
                field && field.toString().toLowerCase().includes(keyword)
              )
            );
          })
          .map(product => ({
            id: product.id,
            name: product.name,
            category: product.category || 'Product',
            subcategory: product.subcategory,
            price: Number(product.price),
            image: product.image_url,
            description: product.description,
            brand: product.brand,
            material: product.material,
            pattern: product.pattern,
            type: 'product' as const,
            matchedFields: []
          }));

        allResults.push(...productResults);
      }

      // Search pavers table
      const { data: pavers, error: paversError } = await supabase
        .from('pavers')
        .select('*')
        .eq('is_active', true);

      if (!paversError && pavers) {
        const paverResults = pavers
          .filter(paver => {
            const searchableFields = [
              paver.name,
              paver.description,
              paver.category,
              paver.collection,
              'paver',
              'pavers',
              'stone',
              'brick',
              'concrete'
            ];
            
            // Also check colors array
            const colorMatches = paver.colors && Array.isArray(paver.colors) 
              ? matchesArrayKeywords(paver.colors as string[], keywords)
              : false;
            
            return keywords.some(keyword =>
              searchableFields.some(field => 
                field && field.toString().toLowerCase().includes(keyword)
              )
            ) || colorMatches;
          })
          .map(paver => ({
            id: paver.id,
            name: paver.name,
            category: paver.category || 'Paver',
            subcategory: paver.collection,
            price: Number(paver.base_price),
            image: paver.image_url,
            description: paver.description,
            type: 'paver' as const,
            matchedFields: []
          }));

        allResults.push(...paverResults);
      }

      // Sort by relevance (prioritize name matches, then category matches)
      allResults.sort((a, b) => {
        const aNameMatch = keywords.some(keyword => a.name.toLowerCase().includes(keyword));
        const bNameMatch = keywords.some(keyword => b.name.toLowerCase().includes(keyword));
        
        if (aNameMatch && !bNameMatch) return -1;
        if (!aNameMatch && bNameMatch) return 1;
        
        return a.name.localeCompare(b.name);
      });

      setSearchResults(allResults.slice(0, 12)); // Increased limit for better coverage
      setShowResults(true);
    } catch (error) {
      console.error('Search error:', error);
      // Fallback to static search if database fails
      setSearchResults([]);
      setShowResults(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProductSelect = (result: SearchResult) => {
    // Navigate to main page first if not already there
    if (window.location.pathname !== '/') {
      navigate('/');
      // Wait for navigation then scroll to section
      setTimeout(() => {
        scrollToSection(result);
      }, 100);
    } else {
      scrollToSection(result);
    }
    
    setShowResults(false);
    setSearchQuery('');
  };

  const scrollToSection = (result: SearchResult) => {
    if (result.type === 'pool') {
      // Find the full pool data from PoolCatalog
      import('./PoolCatalog').then(({ pools }) => {
        const selectedPool = pools.find(p => p.model.toLowerCase().replace(/\s+/g, '-') === result.id);
        if (selectedPool) {
          const params = new URLSearchParams({
            model: selectedPool.model,
            price: selectedPool.price.toString(),
            category: selectedPool.category,
            ...(selectedPool.image && { image: selectedPool.image }),
            ...(selectedPool.dimensions && { dimensions: selectedPool.dimensions }),
            ...(selectedPool.depth && { depth: selectedPool.depth }),
            ...(selectedPool.installationTimeWeeks && { installationTimeWeeks: selectedPool.installationTimeWeeks.toString() }),
            ...(selectedPool.warrantyYears && { warrantyYears: selectedPool.warrantyYears.toString() }),
            ...(selectedPool.saltSystem !== undefined && { saltSystem: selectedPool.saltSystem.toString() }),
            ...(selectedPool.carbonFiber !== undefined && { carbonFiber: selectedPool.carbonFiber.toString() })
          });
          navigate(`/pool/${result.id}?${params.toString()}`);
        } else {
          navigate(`/pool/${result.id}`);
        }
      });
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
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      performSearch(searchQuery);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  return (
    <div className="w-full">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
        <Input
          type="text"
          placeholder="Search pools, spas, pavers, finishes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setShowResults(true)}
          className="pl-12 pr-4 py-4 text-lg w-full bg-white/90 backdrop-blur-sm border-none shadow-lg rounded-full text-foreground placeholder:text-muted-foreground"
        />
      </div>

      {showResults && (
        <Card className="absolute top-full mt-2 w-full bg-white/95 backdrop-blur-sm border-none shadow-xl rounded-2xl overflow-hidden z-50">
          {isLoading ? (
            <div className="p-4 text-center text-muted-foreground">
              Searching...
            </div>
          ) : searchResults.length > 0 ? (
            <div className="max-h-80 overflow-y-auto">
              {searchResults.slice(0, 6).map((result) => (
                <div
                  key={`${result.category}-${result.id}`}
                  className="p-3 hover:bg-accent/50 cursor-pointer border-b border-border/20 last:border-b-0 transition-colors"
                  onClick={() => handleProductSelect(result)}
                >
                  <div className="flex items-center gap-3">
                    {result.image && (
                      <img 
                        src={result.image} 
                        alt={result.name}
                        className="w-10 h-10 object-cover rounded"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-sm truncate">{result.name}</h3>
                        <Badge variant="secondary" className="text-xs">
                          {result.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-primary font-medium">
                        ${result.price?.toLocaleString() || 'Price on request'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-muted-foreground">
              No results found
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default AdvancedSearch;