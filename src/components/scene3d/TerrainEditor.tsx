import React, { useState, useRef, useCallback } from 'react';
import { Mountain, Trees, Cloud, Upload, FolderOpen, Search, Plus, Trash2, Eye, EyeOff, ChevronDown, ChevronRight, Move3d, RotateCw, Maximize, Magnet, Armchair, Box } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { isSupported3DFile, getSupportedFormats, Model3DFormat } from './Model3DLoader';
import type { GizmoMode, GizmoSnapSettings } from './TerrainAssetsRenderer';
import { SketchfabBrowser } from './SketchfabBrowser';
import { pickToAsset } from './AssetEditorExtras';

/** Sketchfab gallery searches per Terrain Editor tab */
const GALLERY_QUICK: Record<string, string[]> = {
  terrain: ['terrain', 'grass ground', 'backyard', 'garden landscape', 'beach sand', 'hill terrain'],
  sky: ['skybox', 'hdri sky', 'sky dome', 'sunset sky', 'night sky'],
  nature: ['palm tree', 'tropical plant', 'bush', 'flowers', 'rock', 'boulder'],
  library: ['outdoor', 'garden', 'landscape', 'fence', 'pergola', 'fountain'],
};
const GALLERY_TYPE: Record<string, TerrainAsset['type']> = { terrain: 'terrain', sky: 'skydome', nature: 'tree', library: 'landscape' };

export interface TerrainAsset {
  id: string;
  name: string;
  type: 'terrain' | 'skydome' | 'tree' | 'landscape' | 'furniture' | 'object' | 'custom';
  url: string;
  format: Model3DFormat;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number | [number, number, number];
  visible: boolean;
  /** Normalise the loaded model to real-world feet (see realScale.ts) */
  autoFit?: boolean;
  /** Measured real size in feet after normalisation (shown in the inspector) */
  sizeFt?: [number, number, number];
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
  /** Selection shared with the 3D scene gizmo */
  selectedAssetId?: string | null;
  onSelectedAssetIdChange?: (id: string | null) => void;
  gizmoMode?: GizmoMode;
  onGizmoModeChange?: (mode: GizmoMode) => void;
  snap?: GizmoSnapSettings;
  onSnapChange?: (snap: GizmoSnapSettings) => void;
}

const DEFAULT_ASSET_LIBRARY: AssetLibraryItem[] = [
  { id: 'lib-1', name: 'American Road Intersection', category: 'Terrain', url: '/models/American_Road_Intersection.usdz', format: 'usdz' },
];

/** Library subjects (furniture/objects now live in Pool Asset Manager → Objects). */
const ASSET_CATEGORIES: { key: string; label: string }[] = [
  { key: 'All', label: 'All' },
  { key: 'Terrain', label: 'Terrain & Ground' },
  { key: 'Skydome', label: 'Sky' },
  { key: 'Trees', label: 'Trees & Plants' },
  { key: 'Landscape', label: 'Rocks & Landscape' },
  { key: 'Custom', label: 'My uploads' },
];

const SNAP_STEPS = [0.25, 0.5, 1, 2, 5];
const ROTATION_STEPS = [5, 15, 30, 45, 90];

export function TerrainEditor({
  terrainAssets,
  onTerrainAssetsChange,
  assetLibrary = DEFAULT_ASSET_LIBRARY,
  onAssetLibraryChange,
  selectedAssetId: controlledSelectedId,
  onSelectedAssetIdChange,
  gizmoMode = 'translate',
  onGizmoModeChange,
  snap,
  onSnapChange
}: TerrainEditorProps) {
  const snapSettings: GizmoSnapSettings = snap ?? {
    enabled: true,
    gridSnap: 1,
    rotationSnapDeg: 15,
    scaleSnap: 0.1,
    snapToGround: true,
  };
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('terrain');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [internalSelectedId, setInternalSelectedId] = useState<string | null>(null);
  const selectedAssetId = controlledSelectedId !== undefined ? controlledSelectedId : internalSelectedId;
  const setSelectedAssetId = useCallback((id: string | null) => {
    setInternalSelectedId(id);
    onSelectedAssetIdChange?.(id);
  }, [onSelectedAssetIdChange]);
  const [libraryOpen, setLibraryOpen] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingTypeRef = useRef<TerrainAsset['type']>('custom');
  const openUploadFor = useCallback((type: TerrainAsset['type']) => {
    pendingTypeRef.current = type;
    fileInputRef.current?.click();
  }, []);
  const libraryInputRef = useRef<HTMLInputElement>(null);

  const generateId = () => `asset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>, forcedType?: TerrainAsset['type']) => {
    const assetType = forcedType ?? pendingTypeRef.current;
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
        category: selectedCategory === 'All' ? 'Custom' : selectedCategory,
        url,
        format
      });
    });

    onAssetLibraryChange([...assetLibrary, ...newItems]);
    event.target.value = '';
  }, [assetLibrary, onAssetLibraryChange, selectedCategory]);

  const addFromLibrary = useCallback((item: AssetLibraryItem) => {
    const typeMap: Record<string, TerrainAsset['type']> = {
      'Terrain': 'terrain',
      'Skydome': 'skydome',
      'Trees': 'tree',
      'Landscape': 'landscape',
      'Furniture': 'furniture',
      'Objects': 'object',
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

  const hasType = (type: TerrainAsset['type']) => terrainAssets.some(a => a.type === type);
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
      <Button
        variant="outline"
        size="sm"
        className="w-full text-xs"
        onClick={() => openUploadFor(type)}
      >
        <Upload className="h-4 w-4 mr-2" />
        Upload {label}
      </Button>
      <p className="text-xs text-muted-foreground text-center">
        Supports: {getSupportedFormats().join(', ')}
      </p>
    </div>
  );

  const renderGallery = (tab: string) => (
    <div className="border-t pt-3 space-y-1.5">
      <h4 className="text-xs font-medium">3D model gallery</h4>
      <SketchfabBrowser
        quick={GALLERY_QUICK[tab]}
        onAdd={(pick) => onTerrainAssetsChange([...terrainAssets, pickToAsset(pick, GALLERY_TYPE[tab])])}
      />
    </div>
  );

  const dragPanel = useDraggablePanel('terrain-editor');
  if (!isOpen) {
    return (
      <Button
        variant="outline"
        size="icon"
        className="absolute top-36 right-4 z-40 h-12 w-12 rounded-full bg-white border-slate-200/80 text-slate-700 shadow-[0_8px_32px_rgba(0,0,0,0.06)] hover:bg-slate-50"
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
    <div {...dragPanel.panelProps} className="absolute top-20 right-20 z-50 w-80 max-h-[calc(100%-11rem)] overflow-y-auto glass-panel rounded-xl">
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept=".glb,.gltf,.obj,.fbx,.usdz"
        multiple
        onChange={(e) => handleFileUpload(e)}
      />
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

        <ScrollArea className="h-[420px]">
          {/* Terrain Tab */}
          <TabsContent value="terrain" className="p-3 space-y-4 m-0">
            {/* Gallery first; "active" lists only appear once something is placed. */}
            {renderGallery('terrain')}
            {hasType('terrain') && (
              <div className="border-t pt-3">
                <h4 className="text-xs font-medium mb-2">Active Terrain Assets</h4>
                {renderAssetList('terrain')}
              </div>
            )}
            {renderUploadButton('terrain', 'Terrain')}
          </TabsContent>

          {/* Sky Tab */}
          <TabsContent value="sky" className="p-3 space-y-4 m-0">
            {renderGallery('sky')}
            {hasType('skydome') && (
              <div className="border-t pt-3">
                <h4 className="text-xs font-medium mb-2">Active Skydome Assets</h4>
                {renderAssetList('skydome')}
              </div>
            )}
            {renderUploadButton('skydome', 'Skydome')}
          </TabsContent>

          {/* Nature Tab */}
          <TabsContent value="nature" className="p-3 space-y-4 m-0">
            {renderGallery('nature')}
            {hasType('tree') && (
              <div className="border-t pt-3">
                <h4 className="text-xs font-medium mb-2">Trees</h4>
                {renderAssetList('tree')}
              </div>
            )}
            {hasType('landscape') && (
              <div className="border-t pt-3">
                <h4 className="text-xs font-medium mb-2">Landscape Elements</h4>
                {renderAssetList('landscape')}
              </div>
            )}
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" className="text-xs bg-white" onClick={() => openUploadFor('tree')}>
                <Trees className="h-4 w-4 mr-1" />
                Add Trees
              </Button>
              <Button variant="outline" size="sm" className="text-xs bg-white" onClick={() => openUploadFor('landscape')}>
                <Mountain className="h-4 w-4 mr-1" />
                Add Rocks
              </Button>
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
              {ASSET_CATEGORIES.map(cat => {
                const count = cat.key === 'All' ? assetLibrary.length : assetLibrary.filter(i => i.category === cat.key).length;
                return (
                <Button
                  key={cat.key}
                  variant={selectedCategory === cat.key ? "default" : "outline"}
                  size="sm"
                  className="h-6 text-xs px-2"
                  onClick={() => setSelectedCategory(cat.key)}
                >
                  {cat.label} <span className="ml-1 opacity-60">{count}</span>
                </Button>
                );
              })}
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
                className="flex-1 text-xs"
                onClick={() => libraryInputRef.current?.click()}
              >
                <Plus className="h-4 w-4 mr-1" />
                {selectedCategory === 'All' ? 'Add to Library' : `Add to ${ASSET_CATEGORIES.find(c => c.key === selectedCategory)?.label}`}
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
                        {item.category === 'Furniture' && <Armchair className="h-4 w-4" />}
                        {item.category === 'Objects' && <Box className="h-4 w-4" />}
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
            {renderGallery('library')}
          </TabsContent>
        </ScrollArea>

        {/* Asset Properties Panel */}
        {selectedAsset && (
          <div className="border-t p-3 bg-muted/30">
            <h4 className="text-xs font-medium mb-2">Asset Properties: {selectedAsset.name}</h4>

            {/* Gizmo mode */}
            <div className="space-y-2 mb-3">
              <Label className="text-xs">Gizmo</Label>
              <div className="grid grid-cols-3 gap-1">
                {([
                  { mode: 'translate' as GizmoMode, label: 'Move', Icon: Move3d },
                  { mode: 'rotate' as GizmoMode, label: 'Rotate', Icon: RotateCw },
                  { mode: 'scale' as GizmoMode, label: 'Scale', Icon: Maximize },
                ]).map(({ mode, label, Icon }) => (
                  <Button
                    key={mode}
                    variant={gizmoMode === mode ? 'default' : 'outline'}
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => onGizmoModeChange?.(mode)}
                  >
                    <Icon className="h-3 w-3 mr-1" />
                    {label}
                  </Button>
                ))}
              </div>

              {/* Snapping */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                  <Magnet className="h-3 w-3 text-primary" />
                  <Label className="text-xs">Snap</Label>
                </div>
                <Switch
                  checked={snapSettings.enabled}
                  onCheckedChange={(v) => onSnapChange?.({ ...snapSettings, enabled: v })}
                />
              </div>

              {snapSettings.enabled && (
                <div className="space-y-2 rounded-lg border p-2">
                  <div className="space-y-1">
                    <Label className="text-[10px] uppercase text-muted-foreground">Grid step (ft)</Label>
                    <div className="flex gap-1">
                      {SNAP_STEPS.map(step => (
                        <Button
                          key={step}
                          variant={snapSettings.gridSnap === step ? 'default' : 'outline'}
                          size="sm"
                          className="h-6 flex-1 px-0 text-[10px]"
                          onClick={() => onSnapChange?.({ ...snapSettings, gridSnap: step })}
                        >
                          {step}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] uppercase text-muted-foreground">Rotation step (°)</Label>
                    <div className="flex gap-1">
                      {ROTATION_STEPS.map(step => (
                        <Button
                          key={step}
                          variant={snapSettings.rotationSnapDeg === step ? 'default' : 'outline'}
                          size="sm"
                          className="h-6 flex-1 px-0 text-[10px]"
                          onClick={() => onSnapChange?.({ ...snapSettings, rotationSnapDeg: step })}
                        >
                          {step}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-[10px] uppercase text-muted-foreground">Keep on ground</Label>
                    <Switch
                      checked={snapSettings.snapToGround}
                      onCheckedChange={(v) => onSnapChange?.({ ...snapSettings, snapToGround: v })}
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-6 text-[10px]"
                  onClick={() => updateAsset(selectedAsset.id, {
                    position: [
                      Math.round(selectedAsset.position[0] / snapSettings.gridSnap) * snapSettings.gridSnap,
                      snapSettings.snapToGround ? 0 : selectedAsset.position[1],
                      Math.round(selectedAsset.position[2] / snapSettings.gridSnap) * snapSettings.gridSnap,
                    ],
                  })}
                >
                  Snap to grid
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-6 text-[10px]"
                  onClick={() => updateAsset(selectedAsset.id, { position: [0, 0, 0], rotation: [0, 0, 0] })}
                >
                  Reset transform
                </Button>
              </div>
            </div>

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
