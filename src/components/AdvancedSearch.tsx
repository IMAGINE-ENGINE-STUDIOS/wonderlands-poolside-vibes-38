import { useState, useEffect, useMemo } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { poolLiners, poolTiles, tanningLedges } from '@/data/poolData';
import { paverTypes, copingTypes } from '@/data/paverData';
import { poolFinishes } from '@/components/PoolFinishesSection';
import { automaticCovers } from '@/data/coversData';
import { screenEnclosureOptions } from '@/data/enclosuresData';

interface SearchResult {
  id: string;
  name: string;
  category: string;
  price: number;
  image?: string;
  type: 'pool' | 'product' | 'paver' | 'service' | 'supplier' | 'finish' | 'liner' | 'tile' | 'cover' | 'enclosure' | 'tanning-ledge' | 'section';
  subcategory?: string;
  description?: string;
  brand?: string;
  material?: string;
  pattern?: string;
  features?: string[];
  matchedFields?: string[];
  companyName?: string;
  location?: string;
  section?: string;
  collection?: string;
}

const AdvancedSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const navigate = useNavigate();

  // Static catalog data for comprehensive search
  const staticCatalogData = useMemo(() => {
    const catalogItems: SearchResult[] = [];

    // Pool finishes - only valid items with image and price
    poolFinishes.forEach(finish => {
      if (finish.image && finish.price > 0) {
        catalogItems.push({
          id: finish.id,
          name: finish.name,
          category: 'Pool Finish',
          subcategory: finish.collection,
          price: finish.price,
          image: finish.image,
          description: finish.description,
          features: finish.features,
          type: 'finish',
          collection: finish.collection,
          section: '#finishes'
        });
      }
    });

    // Pool liners - only valid items with image and price
    poolLiners.forEach(liner => {
      if (liner.image && liner.price > 0) {
        catalogItems.push({
          id: liner.name.toLowerCase().replace(/\s+/g, '-'),
          name: liner.name,
          category: 'Pool Liner',
          subcategory: liner.type,
          price: liner.price,
          image: liner.image,
          description: liner.description,
          type: 'liner',
          section: '#liners'
        });
      }
    });

    // Pool tiles - only valid items with image and price
    poolTiles.forEach(tile => {
      if (tile.image && tile.price > 0) {
        catalogItems.push({
          id: tile.name.toLowerCase().replace(/\s+/g, '-'),
          name: tile.name,
          category: 'Pool Tile',
          price: tile.price,
          image: tile.image,
          description: tile.description,
          type: 'tile',
          section: '#tiles'
        });
      }
    });

    // Tanning ledges - only valid items with image and price
    tanningLedges.forEach(ledge => {
      if (ledge.image && ledge.price > 0) {
        catalogItems.push({
          id: ledge.name.toLowerCase().replace(/\s+/g, '-'),
          name: ledge.name,
          category: 'Tanning Ledge',
          price: ledge.price,
          image: ledge.image,
          description: ledge.description,
          features: ledge.features,
          type: 'tanning-ledge',
          section: '#spas'
        });
      }
    });

    // Automatic covers - only valid items with image and price
    automaticCovers.forEach(cover => {
      if (cover.image && cover.price > 0) {
        catalogItems.push({
          id: cover.name.toLowerCase().replace(/\s+/g, '-'),
          name: cover.name,
          category: 'Automatic Cover',
          subcategory: cover.type,
          price: cover.price,
          image: cover.image,
          description: `${cover.material} cover with ${cover.motorType} - ${cover.warranty} warranty`,
          features: [...cover.features, ...cover.benefits],
          type: 'cover',
          section: '#covers'
        });
      }
    });

    // Screen enclosures - only valid items with image and price
    screenEnclosureOptions.forEach(enclosure => {
      if (enclosure.image && enclosure.pricePerSqFt > 0) {
        catalogItems.push({
          id: enclosure.name.toLowerCase().replace(/\s+/g, '-'),
          name: enclosure.name,
          category: 'Screen Enclosure',
          subcategory: enclosure.type,
          price: enclosure.pricePerSqFt * 400, // Estimated for 400 sq ft average
          image: enclosure.image,
          description: enclosure.description,
          features: enclosure.features,
          type: 'enclosure',
          section: '#screen-enclosures'
        });
      }
    });

    // Pavers only (exclude coping from static to avoid non-existent items)
    [...paverTypes].forEach(paver => {
      if (paver.image && paver.basePrice > 0) {
        catalogItems.push({
          id: paver.id,
          name: paver.name,
          category: 'Paver',
          price: paver.basePrice,
          image: paver.image,
          description: paver.description,
          type: 'paver',
          section: '#pavers'
        });
      }
    });

    // Section shortcuts for direct navigation
    const sectionShortcuts = [
      { name: 'Pools', section: '#pools', keywords: ['pool', 'swimming', 'fiberglass', 'inground'] },
      { name: 'Spas', section: '#spas', keywords: ['spa', 'hot tub', 'jacuzzi', 'therapy'] },
      { name: 'Pool Finishes', section: '#finishes', keywords: ['finish', 'plaster', 'aggregate', 'crystite'] },
      { name: 'Pool Liners', section: '#liners', keywords: ['liner', 'vinyl', 'replacement'] },
      { name: 'Pool Tiles', section: '#tiles', keywords: ['tile', 'mosaic', 'border', 'waterline'] },
      { name: 'Automatic Covers', section: '#covers', keywords: ['cover', 'automatic', 'safety', 'solar'] },
      { name: 'Screen Enclosures', section: '#screen-enclosures', keywords: ['screen', 'enclosure', 'cage', 'lanai'] },
      { name: 'Pavers & Coping', section: '#pavers', keywords: ['paver', 'coping', 'deck', 'stone', 'concrete'] }
    ];

    sectionShortcuts.forEach(shortcut => {
      catalogItems.push({
        id: shortcut.section.replace('#', ''),
        name: shortcut.name,
        category: 'Section',
        price: 0,
        type: 'section',
        section: shortcut.section,
        matchedFields: shortcut.keywords
      });
    });

    return catalogItems;
  }, []);

  // Helper function to create search keywords from query with vastly expanded terms
  const createSearchKeywords = (query: string): string[] => {
    const keywords = query.toLowerCase()
      .split(/[\s,.-]+/)
      .filter(word => word.length > 1)
      .map(word => word.trim());
    
    // Add expanded keywords for comprehensive search coverage
    const expandedKeywords = [...keywords];
    keywords.forEach(keyword => {
      // Pool-related expansions
      if (keyword.includes('pool')) expandedKeywords.push('swimming', 'fiberglass', 'inground', 'above ground', 'gunite', 'vinyl');
      if (keyword.includes('spa')) expandedKeywords.push('hot tub', 'jacuzzi', 'therapy', 'whirlpool', 'hottub');
      if (keyword.includes('paver')) expandedKeywords.push('stone', 'brick', 'concrete', 'hardscape', 'deck', 'patio');
      if (keyword.includes('tile')) expandedKeywords.push('mosaic', 'ceramic', 'porcelain', 'glass', 'border', 'waterline');
      if (keyword.includes('finish')) expandedKeywords.push('plaster', 'aggregate', 'crystite', 'quartz', 'pebble');
      if (keyword.includes('liner')) expandedKeywords.push('vinyl', 'replacement', 'pattern', 'membrane');
      if (keyword.includes('cover')) expandedKeywords.push('safety', 'automatic', 'winter', 'solar', 'thermal');
      if (keyword.includes('screen')) expandedKeywords.push('enclosure', 'cage', 'lanai', 'mesh', 'aluminum');
      if (keyword.includes('tanning')) expandedKeywords.push('ledge', 'baja', 'shelf', 'lounging', 'shallow');
      if (keyword.includes('coping')) expandedKeywords.push('edge', 'border', 'cap', 'bullnose', 'cantilever');
      
      // Service-related expansions
      if (keyword.includes('install')) expandedKeywords.push('contractor', 'service', 'installation', 'builder', 'construction');
      if (keyword.includes('clean')) expandedKeywords.push('maintenance', 'service', 'chemical', 'chlorine', 'vacuum');
      if (keyword.includes('repair')) expandedKeywords.push('fix', 'maintenance', 'service', 'restoration', 'renovation');
      if (keyword.includes('heat')) expandedKeywords.push('heater', 'heating', 'warmer', 'temperature', 'pump');
      if (keyword.includes('filter')) expandedKeywords.push('cleaning', 'system', 'pump', 'equipment', 'cartridge');
      
      // Material expansions
      if (keyword.includes('glass')) expandedKeywords.push('tile', 'mosaic', 'crystal', 'iridescent');
      if (keyword.includes('stone')) expandedKeywords.push('natural', 'travertine', 'limestone', 'granite', 'marble');
      if (keyword.includes('concrete')) expandedKeywords.push('gunite', 'shotcrete', 'cement', 'aggregate');
      
      // Color expansions
      if (keyword.includes('blue')) expandedKeywords.push('sapphire', 'ocean', 'azure', 'navy', 'aqua', 'turquoise');
      if (keyword.includes('white')) expandedKeywords.push('pearl', 'cream', 'ivory', 'alabaster');
      if (keyword.includes('gray') || keyword.includes('grey')) expandedKeywords.push('silver', 'charcoal', 'slate');
      
      // Brand and quality expansions
      if (keyword.includes('premium')) expandedKeywords.push('luxury', 'high-end', 'quality', 'deluxe');
      if (keyword.includes('crystite')) expandedKeywords.push('crystal', 'aggregate', 'finish', 'sparkle');
    });
    
    return [...new Set(expandedKeywords)];
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

      // Search static catalog data first for immediate results
      const staticResults = staticCatalogData.filter(item => {
        const searchableFields = [
          item.name,
          item.category,
          item.subcategory,
          item.description,
          item.collection,
          ...(item.features || []),
          ...(item.matchedFields || [])
        ];
        
        return keywords.some(keyword =>
          searchableFields.some(field => 
            field && field.toString().toLowerCase().includes(keyword)
          )
        );
      });

      allResults.push(...staticResults);

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

      // Search service offerings (contractor services)
      const { data: services, error: servicesError } = await supabase
        .from('service_offerings')
        .select('*')
        .eq('is_active', true);

      if (!servicesError && services) {
        const serviceResults = services
          .filter(service => {
            const searchableFields = [
              service.name,
              service.description,
              service.category,
              'service',
              'contractor',
              'installation',
              'maintenance',
              'repair'
            ];
            
            return keywords.some(keyword =>
              searchableFields.some(field => 
                field && field.toString().toLowerCase().includes(keyword)
              )
            );
          })
          .map(service => ({
            id: service.id,
            name: service.name,
            category: service.category || 'Service',
            price: Number(service.base_price || 0),
            description: service.description,
            type: 'service' as const,
            matchedFields: []
          }));

        allResults.push(...serviceResults);
      }

      // Search supplier profiles
      const { data: suppliers, error: suppliersError } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'supplier')
        .eq('is_active', true);

      if (!suppliersError && suppliers) {
        const supplierResults = suppliers
          .filter(supplier => {
            const searchableFields = [
              supplier.company_name,
              supplier.first_name,
              supplier.last_name,
              'supplier',
              'vendor',
              'manufacturer',
              'distributor'
            ];
            
            return keywords.some(keyword =>
              searchableFields.some(field => 
                field && field.toString().toLowerCase().includes(keyword)
              )
            );
          })
          .map(supplier => ({
            id: supplier.id,
            name: supplier.company_name || `${supplier.first_name || ''} ${supplier.last_name || ''}`.trim(),
            category: 'Supplier',
            price: 0,
            companyName: supplier.company_name,
            type: 'supplier' as const,
            matchedFields: []
          }));

        allResults.push(...supplierResults);
      }

      // Remove duplicates based on ID and type
      const uniqueResults = allResults.filter((result, index, self) => 
        index === self.findIndex((other) => other.id === result.id && other.type === result.type)
      );

      // Sort results by type priority and then by name
      const typePriority = {
        'pool': 1,
        'product': 2,
        'finish': 3,
        'liner': 4,
        'tile': 5,
        'cover': 6,
        'enclosure': 7,
        'paver': 8,
        'tanning-ledge': 9,
        'service': 10,
        'supplier': 11,
        'section': 12
      };

      const sortedResults = uniqueResults.sort((a, b) => {
        const priorityA = typePriority[a.type] || 99;
        const priorityB = typePriority[b.type] || 99;
        
        if (priorityA !== priorityB) {
          return priorityA - priorityB;
        }
        
        return a.name.localeCompare(b.name);
      });

      setSearchResults(sortedResults.slice(0, 12)); // Limit to 12 results
      setShowResults(true);

    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResultClick = (result: SearchResult) => {
    // For section shortcuts, scroll to the section
    if (result.type === 'section' && result.section) {
      const element = document.querySelector(result.section);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        setShowResults(false);
        return;
      }
    }

    // Open only valid products in the editor studio
    const isProductType = ['pool','product','paver','finish','liner','tile','cover','enclosure','tanning-ledge'].includes(result.type);
    const hasValidImage = !!result.image;
    const hasValidPrice = typeof result.price === 'number' && result.price >= 0;

    if (isProductType && hasValidImage && hasValidPrice) {
      const editorEvent = new CustomEvent('openEditorStudio', {
        detail: { product: result }
      });
      window.dispatchEvent(editorEvent);
      setShowResults(false);
      return;
    }

    // For other types, handle as before
    switch (result.type) {
      case 'service':
        console.log('Service selected:', result);
        break;
      case 'supplier':
        console.log('Supplier selected:', result);
        break;
      default:
        console.log('Result selected:', result);
    }
    
    setShowResults(false);
  };

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Hide results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const searchContainer = document.getElementById('search-container');
      if (searchContainer && !searchContainer.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    if (showResults) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showResults]);

  return (
    <div id="search-container" className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 z-10" />
        <Input
          type="text"
          placeholder="Search pools, covers, finishes, pavers, services..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-4 py-2 w-full bg-background/95 backdrop-blur-sm border-border focus:border-primary transition-colors text-foreground placeholder:text-muted-foreground"
          onFocus={() => searchQuery && setShowResults(true)}
        />
      </div>

      {showResults && (
        <Card className="absolute top-full left-0 right-0 mt-2 max-h-96 overflow-y-auto z-50 bg-background border-border shadow-lg">
          {isLoading ? (
            <div className="p-4 text-center text-muted-foreground">
              <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
              Searching...
            </div>
          ) : searchResults.length > 0 ? (
            <div className="divide-y divide-border">
              {searchResults.map((result, index) => (
                <div
                  key={`${result.type}-${result.id}-${index}`}
                  className="p-3 hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => handleResultClick(result)}
                >
                  <div className="flex items-start gap-3">
                    {result.image && (
                      <img 
                        src={result.image} 
                        alt={result.name}
                        className="w-12 h-12 object-cover rounded border border-border flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-foreground truncate">{result.name}</h4>
                        <Badge variant="secondary" className="text-xs shrink-0">
                          {result.category}
                        </Badge>
                      </div>
                      
                      {result.subcategory && (
                        <p className="text-sm text-muted-foreground mb-1">{result.subcategory}</p>
                      )}
                      
                      {result.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-1">
                          {result.description}
                        </p>
                      )}
                      
                      {result.price > 0 && (
                        <div className="text-sm font-semibold text-primary">
                          ${result.price.toLocaleString()}
                        </div>
                      )}
                      
                      {result.companyName && (
                        <div className="text-sm text-muted-foreground">
                          Company: {result.companyName}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-muted-foreground">
              No results found for "{searchQuery}"
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default AdvancedSearch;