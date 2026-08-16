import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ChevronRight, 
  ChevronLeft, 
  Paintbrush, 
  Move, 
  RotateCw, 
  Scale, 
  Camera, 
  StickyNote,
  Play,
  Pause,
  Layers
} from 'lucide-react';
import { Scene3D, TextureConfig, TextureLibrary, TransformMode, PoolStair } from './scene3d/types';
import { StairsControls } from './StairsControls';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileTexturePanel } from './MobileTexturePanel';

interface Scene3DControlPanelProps {
  scene: Scene3D;
  selectedObject: string | null;
  selectedCategory?: string | null;
  textureLibrary: TextureLibrary;
  transformMode: TransformMode;
  autoRotate: boolean;
  onTextureChange: (category: 'pool' | 'deck' | 'coping' | 'waterline', texture: TextureConfig) => void;
  onTransformChange: (position: [number, number, number], rotation: [number, number, number], scale: number) => void;
  onTransformModeChange: (mode: TransformMode) => void;
  onCenterCamera: () => void;
  onAddAnnotation: (text: string, price?: number) => void;
  onAutoRotateToggle: () => void;
  onSceneChange: (scene: Scene3D) => void;
  onSelectCategory?: (category: string | null) => void;
  sunPosition: [number, number, number];
  onSunPositionChange: (position: [number, number, number]) => void;
  fenceHeight: number;
  onFenceHeightChange: (height: number) => void;
  deckWidth: number;
  onDeckWidthChange: (width: number) => void;
  poolCategory?: string;
  // Stairs props
  stairs: PoolStair[];
  poolDepth: number;
  onStairsChange: (stairs: PoolStair[]) => void;
  onPlacementModeToggle: (active: boolean) => void;
  isStairsPlacementMode: boolean;
  selectedStairId: string | null;
  // Spline editing props
  enablePoolSplineEdit: boolean;
  enableDeckSplineEdit: boolean;
  onPoolSplineEditToggle: () => void;
  onDeckSplineEditToggle: () => void;
  // Debug props
  showWireframe?: boolean;
  onWireframeToggle?: () => void;
  showDebugBoundaries?: boolean;
  onDebugBoundariesToggle?: () => void;
}

export const Scene3DControlPanel: React.FC<Scene3DControlPanelProps> = ({
  scene,
  selectedObject,
  selectedCategory,
  textureLibrary,
  transformMode,
  autoRotate,
  onTextureChange,
  onTransformChange,
  onTransformModeChange,
  onCenterCamera,
  onAddAnnotation,
  onAutoRotateToggle,
  onSceneChange,
  onSelectCategory,
  sunPosition,
  onSunPositionChange,
  fenceHeight,
  onFenceHeightChange,
  deckWidth,
  onDeckWidthChange,
  poolCategory = 'deluxe',
  stairs,
  poolDepth,
  onStairsChange,
  onPlacementModeToggle,
  isStairsPlacementMode,
  selectedStairId,
  enablePoolSplineEdit,
  enableDeckSplineEdit,
  onPoolSplineEditToggle,
  onDeckSplineEditToggle,
  showWireframe = false,
  onWireframeToggle,
  showDebugBoundaries = false,
  onDebugBoundariesToggle
}) => {
  const isMobile = useIsMobile();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [annotationText, setAnnotationText] = useState('');
  const [annotationPrice, setAnnotationPrice] = useState('');
  const [selectedTextureCategory, setSelectedTextureCategory] = useState<'finishes' | 'pavers' | 'coping' | 'waterline'>('finishes');
  const [sunTime, setSunTime] = useState(0.6); // 0 = sunrise, 0.5 = noon, 1 = sunset
  const [poolPosition, setPoolPosition] = useState<[number, number, number]>([0, 0, 0]);
  const [snapToGrid, setSnapToGrid] = useState(false);
  const [gridSize, setGridSize] = useState(1); // Grid snap size in feet
  const [copingHeight, setCopingHeight] = useState(2 / 12); // Default 2 inches in feet
  const [deckHeight, setDeckHeight] = useState(2 / 12); // Default 2 inches in feet
  const [copingWidth, setCopingWidth] = useState(1.1); // Default 1.1 foot width (minimum)

  // Full catalog finishes (the previous slug filter matched no real image IDs,
  // so the gallery came back empty). Every finish in the Studio is offered.
  const getFilteredFinishes = () =>
    dedupeTextures([...(textureLibrary.finishes || []), ...CATALOG_TEXTURES.finishes]);

  // Get current texture config based on selected category
  const getCurrentTexture = (): TextureConfig => {
    switch (selectedTextureCategory) {
      case 'finishes':
        return scene.pool.finish;
      case 'pavers':
        return scene.deck.paver;
      case 'coping':
        return scene.deck.coping;
      case 'waterline':
        return scene.deck.waterline || scene.pool.finish;
      default:
        return scene.pool.finish;
    }
  };

  const currentTexture = getCurrentTexture();
  const textureScale = currentTexture.scale || 1.8;
  const textureOffsetX = currentTexture.offset?.[0] || 0;
  const textureOffsetY = currentTexture.offset?.[1] || 0;

  // Real-time texture property updates
  const handleTextureScaleChange = (newScale: number) => {
    const updatedScene = { ...scene };
    switch (selectedTextureCategory) {
      case 'finishes':
        updatedScene.pool.finish = { ...updatedScene.pool.finish, scale: newScale };
        break;
      case 'pavers':
        updatedScene.deck.paver = { ...updatedScene.deck.paver, scale: newScale };
        break;
      case 'coping':
        updatedScene.deck.coping = { ...updatedScene.deck.coping, scale: newScale };
        break;
      case 'waterline':
        // Create waterline if it doesn't exist
        if (!updatedScene.deck.waterline) {
          updatedScene.deck.waterline = {
            url: updatedScene.pool.finish.url,
            name: `${updatedScene.pool.finish.name} (Waterline)`,
            roughness: 0.3,
            metalness: 0.2,
            scale: newScale,
            offset: [0, 0]
          };
        } else {
          updatedScene.deck.waterline = { ...updatedScene.deck.waterline, scale: newScale };
        }
        break;
    }
    onSceneChange(updatedScene);
  };

  const handleTextureOffsetChange = (offsetX: number, offsetY: number) => {
    const updatedScene = { ...scene };
    switch (selectedTextureCategory) {
      case 'finishes':
        updatedScene.pool.finish = { ...updatedScene.pool.finish, offset: [offsetX, offsetY] };
        break;
      case 'pavers':
        updatedScene.deck.paver = { ...updatedScene.deck.paver, offset: [offsetX, offsetY] };
        break;
      case 'coping':
        updatedScene.deck.coping = { ...updatedScene.deck.coping, offset: [offsetX, offsetY] };
        break;
      case 'waterline':
        // Create waterline if it doesn't exist
        if (!updatedScene.deck.waterline) {
          updatedScene.deck.waterline = {
            url: updatedScene.pool.finish.url,
            name: `${updatedScene.pool.finish.name} (Waterline)`,
            roughness: 0.3,
            metalness: 0.2,
            scale: 1.8,
            offset: [offsetX, offsetY]
          };
        } else {
          updatedScene.deck.waterline = { ...updatedScene.deck.waterline, offset: [offsetX, offsetY] };
        }
        break;
    }
    onSceneChange(updatedScene);
  };

  const handlePoolPositionChange = (axis: 'x' | 'y' | 'z', value: number) => {
    const snappedValue = snapToGrid ? Math.round(value / gridSize) * gridSize : value;
    const newPosition: [number, number, number] = [...poolPosition];
    const axisIndex = axis === 'x' ? 0 : axis === 'y' ? 1 : 2;
    newPosition[axisIndex] = snappedValue;
    setPoolPosition(newPosition);
    
    const updatedScene = { ...scene };
    updatedScene.pool.position = newPosition;
    onSceneChange(updatedScene);
  };

  const handleCopingHeightChange = (height: number) => {
    setCopingHeight(height);
    const updatedScene = { ...scene };
    updatedScene.deck.copingHeight = height;
    onSceneChange(updatedScene);
  };

  const handleDeckHeightChange = (height: number) => {
    setDeckHeight(height);
    const updatedScene = { ...scene };
    updatedScene.deck.deckHeight = height;
    onSceneChange(updatedScene);
  };

  const handleCopingWidthChange = (width: number) => {
    setCopingWidth(width);
    const updatedScene = { ...scene };
    updatedScene.deck.copingWidth = width;
    onSceneChange(updatedScene);
  };

  const handleAddNote = () => {
    if (annotationText.trim()) {
      const price = annotationPrice ? parseFloat(annotationPrice) : undefined;
      onAddAnnotation(annotationText, price);
      setAnnotationText('');
      setAnnotationPrice('');
    }
  };

  if (isCollapsed) {
    return (
      <div className="fixed right-0 top-1/2 -translate-y-1/2 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsCollapsed(false)}
          className="rounded-l-lg rounded-r-none shadow-lg"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed right-0 top-0 h-full w-80 bg-background border-l shadow-xl z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-semibold text-lg">Scene Controls</h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(true)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Transform Controls */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Move className="h-4 w-4" />
              <h4 className="font-medium">Transform</h4>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant={transformMode === 'translate' ? 'default' : 'outline'}
                size="sm"
                className="flex-1"
                onClick={() => onTransformModeChange('translate')}
              >
                <Move className="h-3 w-3 mr-1" />
                Move
              </Button>
              <Button
                variant={transformMode === 'rotate' ? 'default' : 'outline'}
                size="sm"
                className="flex-1"
                onClick={() => onTransformModeChange('rotate')}
              >
                <RotateCw className="h-3 w-3 mr-1" />
                Rotate
              </Button>
              <Button
                variant={transformMode === 'scale' ? 'default' : 'outline'}
                size="sm"
                className="flex-1"
                onClick={() => onTransformModeChange('scale')}
              >
                <Scale className="h-3 w-3 mr-1" />
                Scale
              </Button>
            </div>

            {selectedObject && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={onCenterCamera}
                >
                  <Camera className="h-3 w-3 mr-2" />
                  Center Camera
                </Button>

                {/* X, Y, Z Position Controls */}
                <div className="space-y-2 mt-3">
                  <Label className="text-xs font-semibold">Position (X, Y, Z)</Label>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label className="text-xs w-6">X:</Label>
                      <Slider
                        value={[scene.pool.position[0]]}
                        onValueChange={(value) => {
                          const updatedScene = { ...scene };
                          updatedScene.pool.position = [value[0], scene.pool.position[1], scene.pool.position[2]];
                          onSceneChange(updatedScene);
                        }}
                        min={-100}
                        max={100}
                        step={0.1}
                        className="flex-1"
                      />
                      <span className="text-xs w-12 text-right">{scene.pool.position[0].toFixed(1)}ft</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Label className="text-xs w-6">Y:</Label>
                      <Slider
                        value={[scene.pool.position[1]]}
                        onValueChange={(value) => {
                          const updatedScene = { ...scene };
                          updatedScene.pool.position = [scene.pool.position[0], value[0], scene.pool.position[2]];
                          onSceneChange(updatedScene);
                        }}
                        min={-100}
                        max={100}
                        step={0.1}
                        className="flex-1"
                      />
                      <span className="text-xs w-12 text-right">{scene.pool.position[1].toFixed(1)}ft</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Label className="text-xs w-6">Z:</Label>
                      <Slider
                        value={[scene.pool.position[2]]}
                        onValueChange={(value) => {
                          const updatedScene = { ...scene };
                          updatedScene.pool.position = [scene.pool.position[0], scene.pool.position[1], value[0]];
                          onSceneChange(updatedScene);
                        }}
                        min={-100}
                        max={100}
                        step={0.1}
                        className="flex-1"
                      />
                      <span className="text-xs w-12 text-right">{scene.pool.position[2].toFixed(1)}ft</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          <Separator />

          {/* Spline Editing Controls */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Layers className="h-4 w-4" />
              Shape Editing
            </h3>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="pool-spline" className="text-xs">Edit Pool Shape</Label>
                <Checkbox
                  id="pool-spline"
                  checked={enablePoolSplineEdit}
                  onCheckedChange={onPoolSplineEditToggle}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {enablePoolSplineEdit ? 'Drag green control points to reshape pool' : 'Enable to edit pool boundary'}
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="deck-spline" className="text-xs">Edit Deck Shape</Label>
                <Checkbox
                  id="deck-spline"
                  checked={enableDeckSplineEdit}
                  onCheckedChange={onDeckSplineEditToggle}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {enableDeckSplineEdit ? 'Drag orange control points to reshape deck' : 'Enable to edit deck boundary'}
              </p>
            </div>
            
            {onWireframeToggle && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="wireframe" className="text-xs">Show Wireframe</Label>
                  <Checkbox
                    id="wireframe"
                    checked={showWireframe}
                    onCheckedChange={onWireframeToggle}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {showWireframe ? 'Wireframe view enabled' : 'Toggle pool wireframe overlay'}
                </p>
              </div>
            )}
            
            {onDebugBoundariesToggle && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="debug-boundaries" className="text-xs">Debug Boundaries</Label>
                  <Checkbox
                    id="debug-boundaries"
                    checked={showDebugBoundaries}
                    onCheckedChange={onDebugBoundariesToggle}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {showDebugBoundaries ? 'Blue=pool, Yellow=coping, Green=deck' : 'Show colored wireframe boundaries'}
                </p>
              </div>
            )}
          </div>

          <Separator />

          {/* Mobile-Optimized Texture Editor */}
          {isMobile && (selectedObject || selectedCategory) ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Paintbrush className="h-4 w-4" />
                <h4 className="font-medium text-sm">Textures</h4>
              </div>

              <MobileTexturePanel
                textures={getFilteredFinishes()}
                currentTexture={scene.pool.finish}
                textureScale={scene.pool.finish.scale || 1.8}
                onTextureChange={(texture) => onTextureChange('pool', texture)}
                onScaleChange={(scale) => handleTextureScaleChange(scale)}
                label="Pool Finish"
              />

              <MobileTexturePanel
                textures={textureLibrary.pavers}
                currentTexture={scene.deck.paver}
                textureScale={scene.deck.paver.scale || 1.8}
                onTextureChange={(texture) => onTextureChange('deck', texture)}
                onScaleChange={(scale) => {
                  const updatedScene = { ...scene };
                  updatedScene.deck.paver = { ...updatedScene.deck.paver, scale };
                  onSceneChange(updatedScene);
                }}
                label="Deck Pavers"
              />

              <MobileTexturePanel
                textures={textureLibrary.coping}
                currentTexture={scene.deck.coping}
                textureScale={scene.deck.coping.scale || 1.8}
                onTextureChange={(texture) => onTextureChange('coping', texture)}
                onScaleChange={(scale) => {
                  const updatedScene = { ...scene };
                  updatedScene.deck.coping = { ...updatedScene.deck.coping, scale };
                  onSceneChange(updatedScene);
                }}
                label="Coping"
              />

              <MobileTexturePanel
                textures={getFilteredFinishes()}
                currentTexture={scene.deck.waterline || scene.pool.finish}
                textureScale={scene.deck.waterline?.scale || 1.8}
                onTextureChange={(texture) => onTextureChange('waterline', texture)}
                onScaleChange={(scale) => {
                  const updatedScene = { ...scene };
                  if (!updatedScene.deck.waterline) {
                    updatedScene.deck.waterline = {
                      ...updatedScene.pool.finish,
                      scale
                    };
                  } else {
                    updatedScene.deck.waterline = { ...updatedScene.deck.waterline, scale };
                  }
                  onSceneChange(updatedScene);
                }}
                label="Waterline"
              />
            </div>
          ) : (selectedObject || selectedCategory) && (
            /* Desktop Texture Editor */
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Paintbrush className="h-4 w-4" />
                <h4 className="font-medium">Textures</h4>
              </div>

              {/* Unified Texture & Component Selection */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold">Select Surface & Texture</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={selectedCategory === 'pool' || selectedTextureCategory === 'finishes' ? 'default' : 'outline'}
                    size="sm"
                    className="text-xs"
                    onClick={() => {
                      if (onSelectCategory) onSelectCategory('pool');
                      setSelectedTextureCategory('finishes');
                    }}
                  >
                    Pool Finish
                  </Button>
                  <Button
                    variant={selectedCategory === 'deck' || selectedTextureCategory === 'pavers' ? 'default' : 'outline'}
                    size="sm"
                    className="text-xs"
                    onClick={() => {
                      if (onSelectCategory) onSelectCategory('deck');
                      setSelectedTextureCategory('pavers');
                    }}
                  >
                    Deck Pavers
                  </Button>
                  <Button
                    variant={selectedCategory === 'coping' || selectedTextureCategory === 'coping' ? 'default' : 'outline'}
                    size="sm"
                    className="text-xs"
                    onClick={() => {
                      if (onSelectCategory) onSelectCategory('coping');
                      setSelectedTextureCategory('coping');
                    }}
                  >
                    Coping
                  </Button>
                  <Button
                    variant={selectedCategory === 'waterline' || selectedTextureCategory === 'waterline' ? 'default' : 'outline'}
                    size="sm"
                    className="text-xs"
                    onClick={() => {
                      if (onSelectCategory) onSelectCategory('waterline');
                      setSelectedTextureCategory('waterline');
                    }}
                  >
                    Waterline
                  </Button>
                  <Button
                    variant={selectedCategory === 'water' ? 'default' : 'outline'}
                    size="sm"
                    className="text-xs"
                    onClick={() => {
                      if (onSelectCategory) onSelectCategory('water');
                    }}
                  >
                    Water
                  </Button>
                </div>
              </div>

              {/* Texture Scale Control */}
              <div className="space-y-2">
                <Label className="text-xs">Texture Scale: {textureScale.toFixed(1)}x</Label>
                <Slider
                  value={[textureScale]}
                  onValueChange={(value) => handleTextureScaleChange(value[0])}
                  min={0.1}
                  max={100}
                  step={0.1}
                  className="w-full"
                />
              </div>

              {/* Texture Offset Controls */}
              <div className="space-y-2">
                <Label className="text-xs">Offset X: {textureOffsetX.toFixed(2)}</Label>
                <Slider
                  value={[textureOffsetX]}
                  onValueChange={(value) => handleTextureOffsetChange(value[0], textureOffsetY)}
                  min={-2}
                  max={2}
                  step={0.01}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Offset Y: {textureOffsetY.toFixed(2)}</Label>
                <Slider
                  value={[textureOffsetY]}
                  onValueChange={(value) => handleTextureOffsetChange(textureOffsetX, value[0])}
                  min={-2}
                  max={2}
                  step={0.01}
                  className="w-full"
                />
              </div>

              {/* Helper text for waterline */}
              {selectedTextureCategory === 'waterline' && (
                <p className="text-xs text-muted-foreground">
                  Select from premium pool liner finishes for waterline tiles
                </p>
              )}

              {/* Texture Grid */}
              <div className="grid grid-cols-3 gap-2">
                {(selectedTextureCategory === 'finishes' 
                  ? getFilteredFinishes()
                  : selectedTextureCategory === 'waterline' 
                    ? getFilteredFinishes()
                    : textureLibrary[selectedTextureCategory]
                )?.map((texture) => (
                  <button
                    key={texture.url}
                    onClick={() => {
                      const scaledTexture = { 
                        ...texture, 
                        scale: textureScale,
                        offset: [textureOffsetX, textureOffsetY] as [number, number]
                      };
                      if (selectedTextureCategory === 'finishes') {
                        onTextureChange('pool', scaledTexture);
                      } else if (selectedTextureCategory === 'pavers') {
                        onTextureChange('deck', scaledTexture);
                      } else if (selectedTextureCategory === 'coping') {
                        onTextureChange('coping', scaledTexture);
                      } else if (selectedTextureCategory === 'waterline') {
                        onTextureChange('waterline', scaledTexture);
                      }
                    }}
                    className="aspect-square rounded-lg overflow-hidden border-2 border-transparent hover:border-primary transition-all"
                    title={texture.name}
                  >
                    <img loading="lazy" decoding="async"
                      src={texture.url}
                      alt={texture.name}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}


          <Separator />

          {/* Pool Position Controls */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Move className="h-4 w-4" />
              <h4 className="font-medium">Pool Position</h4>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="snap-to-grid"
                  checked={snapToGrid}
                  onCheckedChange={(checked) => setSnapToGrid(checked as boolean)}
                />
                <Label htmlFor="snap-to-grid" className="text-xs cursor-pointer">
                  Snap to Grid
                </Label>
              </div>

              {snapToGrid && (
                <div className="space-y-2">
                  <Label className="text-xs">Grid Size: {gridSize} ft</Label>
                  <Slider
                    value={[gridSize]}
                    onValueChange={(value) => setGridSize(value[0])}
                    min={0.5}
                    max={5}
                    step={0.5}
                    className="w-full"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-xs">X Position: {poolPosition[0].toFixed(2)} ft</Label>
                <Slider
                  value={[poolPosition[0]]}
                  onValueChange={(value) => handlePoolPositionChange('x', value[0])}
                  min={-50}
                  max={50}
                  step={snapToGrid ? gridSize : 0.1}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Y Position: {poolPosition[1].toFixed(2)} ft</Label>
                <Slider
                  value={[poolPosition[1]]}
                  onValueChange={(value) => handlePoolPositionChange('y', value[0])}
                  min={-20}
                  max={20}
                  step={snapToGrid ? gridSize : 0.1}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Z Position: {poolPosition[2].toFixed(2)} ft</Label>
                <Slider
                  value={[poolPosition[2]]}
                  onValueChange={(value) => handlePoolPositionChange('z', value[0])}
                  min={-50}
                  max={50}
                  step={snapToGrid ? gridSize : 0.1}
                  className="w-full"
                />
              </div>

              <Button
                onClick={() => {
                  setPoolPosition([0, 0, 0]);
                  const updatedScene = { ...scene };
                  updatedScene.pool.position = [0, 0, 0];
                  onSceneChange(updatedScene);
                }}
                variant="outline"
                size="sm"
                className="w-full"
              >
                Reset Position
              </Button>

              <Separator className="my-3" />
              
              {/* Coping Controls */}
              <h4 className="font-medium text-sm mb-2">Coping</h4>
              <div className="space-y-2">
                <Label className="text-xs">Height: {(copingHeight * 12).toFixed(1)} inches</Label>
                <Slider
                  value={[copingHeight]}
                  onValueChange={(value) => handleCopingHeightChange(value[0])}
                  min={1 / 12}
                  max={6 / 12}
                  step={0.5 / 12}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Width (from pool edge): {copingWidth.toFixed(1)} ft</Label>
                <Slider
                  value={[copingWidth]}
                  onValueChange={(value) => handleCopingWidthChange(value[0])}
                  min={1.1}
                  max={3}
                  step={0.1}
                  className="w-full"
                />
              </div>

              {/* Deck Controls */}
              <h4 className="font-medium text-sm mt-3 mb-2">Deck</h4>
              <div className="space-y-2">
                <Label className="text-xs">Width (from coping edge): {deckWidth.toFixed(1)} ft</Label>
                <Slider
                  value={[deckWidth]}
                  onValueChange={(value) => onDeckWidthChange(value[0])}
                  min={0}
                  max={20}
                  step={0.5}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">Default: 3 ft | No limit</p>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Height: {(deckHeight * 12).toFixed(1)} inches</Label>
                <Slider
                  value={[deckHeight]}
                  onValueChange={(value) => handleDeckHeightChange(value[0])}
                  min={0}
                  max={40}
                  step={0.1}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Annotations */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <StickyNote className="h-4 w-4" />
              <h4 className="font-medium">Add Note</h4>
            </div>

            <div className="space-y-2">
              <div>
                <Label htmlFor="note-text" className="text-xs">Note Text</Label>
                <Input
                  id="note-text"
                  placeholder="Add a note..."
                  value={annotationText}
                  onChange={(e) => setAnnotationText(e.target.value)}
                  className="text-sm"
                />
              </div>

              <div>
                <Label htmlFor="note-price" className="text-xs">Price (optional)</Label>
                <Input
                  id="note-price"
                  type="number"
                  placeholder="0.00"
                  value={annotationPrice}
                  onChange={(e) => setAnnotationPrice(e.target.value)}
                  className="text-sm"
                />
              </div>

              <Button
                onClick={handleAddNote}
                disabled={!annotationText.trim() || !selectedObject}
                size="sm"
                className="w-full"
              >
                Add Note to Selected
              </Button>
            </div>
          </div>

          <Separator />

          {/* Fence Controls */}
          <div className="space-y-3">
            <h4 className="font-medium">Fence Height</h4>
            <div className="space-y-2">
              <Label className="text-xs">Height: {fenceHeight} ft</Label>
              <Slider
                value={[fenceHeight]}
                onValueChange={(value) => onFenceHeightChange(value[0])}
                min={4}
                max={10}
                step={0.5}
                className="w-full"
              />
            </div>
          </div>

          <Separator />

          {/* Sun Position Control */}
          <div className="space-y-3">
            <h4 className="font-medium">Sun Position</h4>
            <div className="space-y-2">
              <Label className="text-xs">
                Time: {sunTime < 0.3 ? 'Morning' : sunTime < 0.7 ? 'Midday' : 'Evening'}
              </Label>
              <Slider
                value={[sunTime]}
                onValueChange={(value) => {
                  setSunTime(value[0]);
                  // Calculate sun position based on time (arc across sky)
                  const angle = value[0] * Math.PI; // 0 to PI (sunrise to sunset)
                  const x = Math.cos(angle) * 100;
                  const y = Math.sin(angle) * 50 + 20; // Height 20-70
                  const z = Math.sin(angle) * 100;
                  onSunPositionChange([x, y, z]);
                }}
                min={0}
                max={1}
                step={0.01}
                className="w-full"
              />
            </div>
          </div>

          <Separator />

          {/* Pool Stairs */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4" />
              <h4 className="font-medium">Pool Stairs</h4>
            </div>

            <StairsControls
              stairs={stairs}
              poolDepth={poolDepth}
              onStairsChange={onStairsChange}
              onPlacementModeToggle={onPlacementModeToggle}
              isPlacementMode={isStairsPlacementMode}
              selectedStairId={selectedStairId}
            />
          </div>

          <Separator />

          {/* Animation */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Play className="h-4 w-4" />
              <h4 className="font-medium">Animation</h4>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="auto-rotate"
                checked={autoRotate}
                onCheckedChange={onAutoRotateToggle}
              />
              <Label htmlFor="auto-rotate" className="text-sm cursor-pointer">
                Auto-Rotate Scene
              </Label>
            </div>
          </div>

          {/* Scene Info */}
          <Separator />
          <div className="text-xs text-muted-foreground space-y-1">
            <p>Features: {scene.features.length}</p>
            <p>Annotations: {scene.annotations.length}</p>
            {scene.pool.dimensions && (
              <p>Pool: {scene.pool.dimensions.width}' × {scene.pool.dimensions.length}'</p>
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};
