import React, { useState, useRef, useCallback } from 'react';
import { Mountain, Trees, Cloud, Upload, FolderOpen, Search, Plus, Trash2, Eye, EyeOff, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { isSupported3DFile, getSupportedFormats, Model3DFormat } from './Model3DLoader';

export interface TerrainAsset {
  id: string;
  name: string;
  type: 'terrain' | 'skydome' | 'tree' | 'landscape' | 'custom';
  url: string;
  format: Model3DFormat;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number | [number, number, number];
  visible: boolean;
}

export interface AssetLibraryItem {
  id: string;
  name: string;
  category: string;
  url: string;
  thumbnail?: string;
  format: Model3DFormat;
}

interface TerrainEditorProps {
  terrainAssets: TerrainAsset[];
  onTerrainAssetsChange: (assets: TerrainAsset[]) => void;
  assetLibrary?: AssetLibraryItem[];
  onAssetLibraryChange?: (library: AssetLibraryItem[]) => void;
}

const DEFAULT_ASSET_LIBRARY: AssetLibraryItem[] = [
  { id: 'lib-1', name: 'American Road Intersection', category: 'Terrain', url: '/models/American_Road_Intersection.usdz', format: 'usdz' },
];

const ASSET_CATEGORIES = ['All', 'Terrain', 'Skydome', 'Trees', 'Landscape', 'Custom'];

export function TerrainEditor({
  terrainAssets,
  onTerrainAssetsChange,
  assetLibrary = DEFAULT_ASSET_LIBRARY,
  onAssetLibraryChange
}: TerrainEditorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('terrain');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [libraryOpen, setLibraryOpen] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const libraryInputRef = useRef<HTMLInputElement>(null);

  const generateId = () => `asset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>, assetType: TerrainAsset['type']) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach(file => {
      if (!isSupported3DFile(file.name)) {
        console.warn(`Unsupported file format: ${file.name}`);
        return;
      }

      const url = URL.createObjectURL(file);
      const format = file.name.split('.').pop()?.toLowerCase() as Model3DFormat;
      
      const newAsset: TerrainAsset = {
        id: generateId(),
        name: file.name.replace(/\.[^/.]+$/, ''),
        type: assetType,
        url,
        format,
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: assetType === 'terrain' ? 50 : assetType === 'skydome' ? 100 : 1,
        visible: true
      };

      onTerrainAssetsChange([...terrainAssets, newAsset]);
    });

    event.target.value = '';
  }, [terrainAssets, onTerrainAssetsChange]);

  const handleLibraryUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0 || !onAssetLibraryChange) return;

    const newItems: AssetLibraryItem[] = [];
    
    Array.from(files).forEach(file => {
      if (!isSupported3DFile(file.name)) return;

      const url = URL.createObjectURL(file);
      const format = file.name.split('.').pop()?.toLowerCase() as Model3DFormat;
      
      newItems.push({
        id: generateId(),
        name: file.name.replace(/\.[^/.]+$/, ''),
        category: 'Custom',
        url,
        format
      });
    });

    onAssetLibraryChange([...assetLibrary, ...newItems]);
    event.target.value = '';
  }, [assetLibrary, onAssetLibraryChange]);

  const addFromLibrary = useCallback((item: AssetLibraryItem) => {
    const typeMap: Record<string, TerrainAsset['type']> = {
      'Terrain': 'terrain',
      'Skydome': 'skydome',
      'Trees': 'tree',
      'Landscape': 'landscape',
      'Custom': 'custom'
    };

    const newAsset: TerrainAsset = {
      id: generateId(),
      name: item.name,
      type: typeMap[item.category] || 'custom',
      url: item.url,
      format: item.format,
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: item.category === 'Terrain' ? 50 : item.category === 'Skydome' ? 100 : 1,
      visible: true
    };

    onTerrainAssetsChange([...terrainAssets, newAsset]);
  }, [terrainAssets, onTerrainAssetsChange]);

  const updateAsset = useCallback((id: string, updates: Partial<TerrainAsset>) => {
    onTerrainAssetsChange(
      terrainAssets.map(asset => 
        asset.id === id ? { ...asset, ...updates } : asset
      )
    );
  }, [terrainAssets, onTerrainAssetsChange]);

  const removeAsset = useCallback((id: string) => {
    onTerrainAssetsChange(terrainAssets.filter(asset => asset.id !== id));
    if (selectedAssetId === id) setSelectedAssetId(null);
  }, [terrainAssets, onTerrainAssetsChange, selectedAssetId]);

  const toggleVisibility = useCallback((id: string) => {
    const asset = terrainAssets.find(a => a.id === id);
    if (asset) {
      updateAsset(id, { visible: !asset.visible });
    }
  }, [terrainAssets, updateAsset]);

  const filteredLibrary = assetLibrary.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const selectedAsset = terrainAssets.find(a => a.id === selectedAssetId);

  const renderAssetList = (type: TerrainAsset['type']) => {
    const filtered = terrainAssets.filter(a => a.type === type);
    
    return (
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">No {type} assets added</p>
        ) : (
          filtered.map(asset => (
            <div
              key={asset.id}
              className={cn(
                "flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors",
                selectedAssetId === asset.id 
                  ? "border-primary bg-primary/10" 
                  : "border-border hover:border-primary/50"
              )}
              onClick={() => setSelectedAssetId(asset.id)}
            >
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={(e) => { e.stopPropagation(); toggleVisibility(asset.id); }}
              >
                {asset.visible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
              </Button>
              <span className="flex-1 text-sm truncate">{asset.name}</span>
              <span className="text-xs text-muted-foreground uppercase">{asset.format}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-destructive hover:text-destructive"
                onClick={(e) => { e.stopPropagation(); removeAsset(asset.id); }}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))
        )}
      </div>
    );
  };

  const renderUploadButton = (type: TerrainAsset['type'], label: string) => (
    <div className="space-y-2">
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept=".glb,.gltf,.obj,.fbx,.usdz"
        multiple
        onChange={(e) => handleFileUpload(e, type)}
      />
      <Button
        variant="outline"
        size="sm"
        className="w-full"
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="h-4 w-4 mr-2" />
        Upload {label}
      </Button>
      <p className="text-xs text-muted-foreground text-center">
        Supports: {getSupportedFormats().join(', ')}
      </p>
    </div>
  );

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        size="icon"
        className="fixed bottom-20 right-4 z-50 h-12 w-12 rounded-full shadow-lg bg-background/95 backdrop-blur-sm border-2"
        onClick={() => setIsOpen(true)}
      >
        <div className="relative">
          <Mountain className="h-5 w-5" />
          <Trees className="h-3 w-3 absolute -bottom-1 -right-1" />
        </div>
      </Button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 bg-background/95 backdrop-blur-sm rounded-xl shadow-xl border overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b bg-muted/50">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Mountain className="h-5 w-5 text-primary" />
            <Trees className="h-3 w-3 absolute -bottom-1 -right-1 text-green-600" />
          </div>
          <span className="font-semibold text-sm">Terrain Editor</span>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setIsOpen(false)}>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full grid grid-cols-4 p-1 m-2 mr-4">
          <TabsTrigger value="terrain" className="text-xs">
            <Mountain className="h-3 w-3 mr-1" />
            Terrain
          </TabsTrigger>
          <TabsTrigger value="sky" className="text-xs">
            <Cloud className="h-3 w-3 mr-1" />
            Sky
          </TabsTrigger>
          <TabsTrigger value="nature" className="text-xs">
            <Trees className="h-3 w-3 mr-1" />
            Nature
          </TabsTrigger>
          <TabsTrigger value="library" className="text-xs">
            <FolderOpen className="h-3 w-3 mr-1" />
            Library
          </TabsTrigger>
        </TabsList>

        <ScrollArea className="h-80">
          {/* Terrain Tab */}
          <TabsContent value="terrain" className="p-3 space-y-4 m-0">
            {renderUploadButton('terrain', 'Terrain')}
            <div className="border-t pt-3">
              <h4 className="text-xs font-medium mb-2">Active Terrain Assets</h4>
              {renderAssetList('terrain')}
            </div>
          </TabsContent>

          {/* Sky Tab */}
          <TabsContent value="sky" className="p-3 space-y-4 m-0">
            {renderUploadButton('skydome', 'Skydome')}
            <div className="border-t pt-3">
              <h4 className="text-xs font-medium mb-2">Active Skydome Assets</h4>
              {renderAssetList('skydome')}
            </div>
          </TabsContent>

          {/* Nature Tab */}
          <TabsContent value="nature" className="p-3 space-y-4 m-0">
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  fileInputRef.current?.click();
                }}
              >
                <Trees className="h-4 w-4 mr-1" />
                Add Trees
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  fileInputRef.current?.click();
                }}
              >
                <Mountain className="h-4 w-4 mr-1" />
                Add Rocks
              </Button>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".glb,.gltf,.obj,.fbx,.usdz"
              multiple
              onChange={(e) => handleFileUpload(e, 'landscape')}
            />
            <div className="border-t pt-3">
              <h4 className="text-xs font-medium mb-2">Trees</h4>
              {renderAssetList('tree')}
            </div>
            <div className="border-t pt-3">
              <h4 className="text-xs font-medium mb-2">Landscape Elements</h4>
              {renderAssetList('landscape')}
            </div>
          </TabsContent>

          {/* Library Tab */}
          <TabsContent value="library" className="p-3 space-y-3 m-0">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search assets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8 text-sm"
              />
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-1">
              {ASSET_CATEGORIES.map(cat => (
                <Button
                  key={cat}
                  variant={selectedCategory === cat ? "default" : "outline"}
                  size="sm"
                  className="h-6 text-xs px-2"
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </Button>
              ))}
            </div>

            {/* Upload to Library */}
            <div className="flex gap-2">
              <input
                type="file"
                ref={libraryInputRef}
                className="hidden"
                accept=".glb,.gltf,.obj,.fbx,.usdz"
                multiple
                onChange={handleLibraryUpload}
              />
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => libraryInputRef.current?.click()}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add to Library
              </Button>
            </div>

            {/* Asset List */}
            <Collapsible open={libraryOpen} onOpenChange={setLibraryOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="w-full justify-between">
                  <span className="text-xs font-medium">Available Assets ({filteredLibrary.length})</span>
                  {libraryOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-1 pt-2">
                {filteredLibrary.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">No assets found</p>
                ) : (
                  filteredLibrary.map(item => (
                    <div
                      key={item.id}
                      className="flex items-center gap-2 p-2 rounded-lg border border-border hover:border-primary/50 cursor-pointer transition-colors"
                      onClick={() => addFromLibrary(item)}
                    >
                      <div className="w-8 h-8 rounded bg-muted flex items-center justify-center">
                        {item.category === 'Terrain' && <Mountain className="h-4 w-4" />}
                        {item.category === 'Skydome' && <Cloud className="h-4 w-4" />}
                        {item.category === 'Trees' && <Trees className="h-4 w-4" />}
                        {(item.category === 'Landscape' || item.category === 'Custom') && <FolderOpen className="h-4 w-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.category}</p>
                      </div>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  ))
                )}
              </CollapsibleContent>
            </Collapsible>
          </TabsContent>
        </ScrollArea>

        {/* Asset Properties Panel */}
        {selectedAsset && (
          <div className="border-t p-3 bg-muted/30">
            <h4 className="text-xs font-medium mb-2">Asset Properties: {selectedAsset.name}</h4>
            <div className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs">Scale</Label>
                <Slider
                  value={[typeof selectedAsset.scale === 'number' ? selectedAsset.scale : selectedAsset.scale[0]]}
                  onValueChange={([v]) => updateAsset(selectedAsset.id, { scale: v })}
                  min={0.1}
                  max={200}
                  step={0.5}
                  className="py-1"
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">X</Label>
                  <Input
                    type="number"
                    value={selectedAsset.position[0]}
                    onChange={(e) => updateAsset(selectedAsset.id, {
                      position: [parseFloat(e.target.value) || 0, selectedAsset.position[1], selectedAsset.position[2]]
                    })}
                    className="h-7 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Y</Label>
                  <Input
                    type="number"
                    value={selectedAsset.position[1]}
                    onChange={(e) => updateAsset(selectedAsset.id, {
                      position: [selectedAsset.position[0], parseFloat(e.target.value) || 0, selectedAsset.position[2]]
                    })}
                    className="h-7 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Z</Label>
                  <Input
                    type="number"
                    value={selectedAsset.position[2]}
                    onChange={(e) => updateAsset(selectedAsset.id, {
                      position: [selectedAsset.position[0], selectedAsset.position[1], parseFloat(e.target.value) || 0]
                    })}
                    className="h-7 text-xs"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </Tabs>
    </div>
  );
}

export default TerrainEditor;
