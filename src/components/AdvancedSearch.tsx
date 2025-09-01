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

    // Pool finishes
    poolFinishes.forEach(finish => {
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
    });

    // Pool liners
    poolLiners.forEach(liner => {
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
    });

    // Pool tiles
    poolTiles.forEach(tile => {
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
    });

    // Tanning ledges
    tanningLedges.forEach(ledge => {
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
    });

    // Automatic covers
    automaticCovers.forEach(cover => {
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
    });

    // Screen enclosures
    screenEnclosureOptions.forEach(enclosure => {
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
    });

    // Pavers and coping
    [...paverTypes, ...copingTypes].forEach(paver => {
      catalogItems.push({
        id: paver.id,
        name: paver.name,
        category: paver.category === 'paver' ? 'Paver' : 'Pool Coping',
        price: paver.basePrice,
        image: paver.image,
        description: paver.description,
        type: 'paver',
        section: '#pavers'
      });
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
            description: `Supplier - ${supplier.company_name || 'Contact for products and services'}`,
            companyName: supplier.company_name,
            type: 'supplier' as const,
            matchedFields: []
          }));

        allResults.push(...supplierResults);
      }

      // Search product search tags for enhanced keyword matching
      const { data: searchTags, error: tagsError } = await supabase
        .from('product_search_tags')
        .select('*')
        .eq('is_active', true);

      if (!tagsError && searchTags) {
        // Get unique product IDs from matching tags
        const matchingTags = searchTags.filter(tag => {
          return keywords.some(keyword => 
            tag.tag.toLowerCase().includes(keyword)
          );
        });

        const taggedProductIds = [...new Set(matchingTags.map(tag => tag.product_id))];
        
        if (taggedProductIds.length > 0) {
          // Fetch products for the matching tags
          const { data: taggedProducts, error: taggedProductsError } = await supabase
            .from('products')
            .select('*')
            .in('id', taggedProductIds)
            .eq('is_active', true);

          if (!taggedProductsError && taggedProducts) {
            const tagResults = taggedProducts.map(product => ({
              id: product.id,
              name: product.name,
              category: product.category || 'Product',
              subcategory: product.subcategory,
              price: Number(product.price),
              image: product.image_url,
              description: product.description,
              brand: product.brand,
              type: 'product' as const,
              matchedFields: matchingTags
                .filter(tag => tag.product_id === product.id)
                .map(tag => tag.tag)
            }));

            // Remove duplicates from products already found
            const existingProductIds = new Set(allResults.filter(r => r.type === 'product').map(r => r.id));
            const uniqueTagResults = tagResults.filter(result => 
              !existingProductIds.has(result.id)
            );

            allResults.push(...uniqueTagResults);
          }
        }
      }

      // Sort by relevance (prioritize name matches, then category matches)
      allResults.sort((a, b) => {
        const aNameMatch = keywords.some(keyword => a.name.toLowerCase().includes(keyword));
        const bNameMatch = keywords.some(keyword => b.name.toLowerCase().includes(keyword));
        
        if (aNameMatch && !bNameMatch) return -1;
        if (!aNameMatch && bNameMatch) return 1;
        
        return a.name.localeCompare(b.name);
      });

      // Remove duplicates by id and type combination
      const uniqueResults = allResults.reduce((acc, current) => {
        const key = `${current.type}_${current.id}`;
        if (!acc.has(key)) {
          acc.set(key, current);
        }
        return acc;
      }, new Map());

      setSearchResults(Array.from(uniqueResults.values()).slice(0, 15)); // Show more results
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
      // Navigate to pool details using model slug
      const slug = result.name.toLowerCase().replace(/\s+/g, '-');
      navigate(`/pool/${slug}`);
    } else if (result.section) {
      // Direct section navigation
      window.location.hash = result.section;
      const element = document.querySelector(result.section);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      // Fallback section mapping for enhanced coverage
      const sectionMap: { [key: string]: string } = {
        'pool': '#pools',
        'spa': '#spas', 
        'tanning': '#spas',
        'ledge': '#spas',
        'finish': '#finishes',
        'plaster': '#finishes',
        'aggregate': '#finishes',
        'crystite': '#finishes',
        'liner': '#liners',
        'vinyl': '#liners',
        'tile': '#tiles',
        'mosaic': '#tiles',
        'border': '#tiles',
        'cover': '#covers',
        'automatic': '#covers',
        'safety': '#covers',
        'solar': '#covers',
        'screen': '#screen-enclosures',
        'enclosure': '#screen-enclosures',
        'cage': '#screen-enclosures',
        'lanai': '#screen-enclosures',
        'paver': '#pavers',
        'coping': '#pavers',
        'stone': '#pavers',
        'deck': '#pavers'
      };

      const searchText = `${result.name} ${result.category} ${result.subcategory || ''} ${result.description || ''}`.toLowerCase();
      
      const section = Object.keys(sectionMap).find(key => 
        searchText.includes(key)
      );

      if (section) {
        window.location.hash = sectionMap[section];
        const element = document.querySelector(sectionMap[section]);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      } else {
        // Default to pools section if no match found
        window.location.hash = '#pools';
        const element = document.querySelector('#pools');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
          placeholder="Search pools, spas, finishes, tiles, pavers, covers, contractors, services..."
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
            <div className="max-h-96 overflow-y-auto">
              {searchResults.slice(0, 12).map((result) => (
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
                      {result.companyName && (
                        <p className="text-xs text-muted-foreground truncate">
                          {result.companyName}
                        </p>
                      )}
                      <p className="text-sm text-primary font-medium">
                        {result.type === 'supplier' ? 'Contact for pricing' : 
                         result.price > 0 ? `$${result.price?.toLocaleString()}` : 'Price on request'}
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