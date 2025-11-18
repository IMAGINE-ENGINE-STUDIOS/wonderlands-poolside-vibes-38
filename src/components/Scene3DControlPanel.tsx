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
  Pause
} from 'lucide-react';
import { Scene3D, TextureConfig, TextureLibrary, TransformMode } from './scene3d/types';

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
  sunPosition: [number, number, number];
  onSunPositionChange: (position: [number, number, number]) => void;
  fenceHeight: number;
  onFenceHeightChange: (height: number) => void;
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
  sunPosition,
  onSunPositionChange,
  fenceHeight,
  onFenceHeightChange
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [annotationText, setAnnotationText] = useState('');
  const [annotationPrice, setAnnotationPrice] = useState('');
  const [selectedTextureCategory, setSelectedTextureCategory] = useState<'finishes' | 'pavers' | 'coping' | 'waterline'>('finishes');
  const [textureScale, setTextureScale] = useState(1);
  const [textureOffsetX, setTextureOffsetX] = useState(0);
  const [textureOffsetY, setTextureOffsetY] = useState(0);
  const [sunTime, setSunTime] = useState(0.6); // 0 = sunrise, 0.5 = noon, 1 = sunset

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
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={onCenterCamera}
              >
                <Camera className="h-3 w-3 mr-2" />
                Center Camera
              </Button>
            )}
          </div>

          <Separator />

          {/* Texture Editor */}
          {(selectedObject || selectedCategory) && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Paintbrush className="h-4 w-4" />
                <h4 className="font-medium">Textures</h4>
              </div>

              {/* Texture Category Tabs */}
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={selectedTextureCategory === 'finishes' ? 'default' : 'outline'}
                  size="sm"
                  className="text-xs"
                  onClick={() => setSelectedTextureCategory('finishes')}
                >
                  Pool Finishes
                </Button>
                <Button
                  variant={selectedTextureCategory === 'pavers' ? 'default' : 'outline'}
                  size="sm"
                  className="text-xs"
                  onClick={() => setSelectedTextureCategory('pavers')}
                >
                  Deck Pavers
                </Button>
                <Button
                  variant={selectedTextureCategory === 'coping' ? 'default' : 'outline'}
                  size="sm"
                  className="text-xs"
                  onClick={() => setSelectedTextureCategory('coping')}
                >
                  Coping
                </Button>
                <Button
                  variant={selectedTextureCategory === 'waterline' ? 'default' : 'outline'}
                  size="sm"
                  className="text-xs"
                  onClick={() => setSelectedTextureCategory('waterline')}
                >
                  Waterline (Liners)
                </Button>
              </div>

              {/* Texture Scale Control */}
              <div className="space-y-2">
                <Label className="text-xs">Texture Scale: {textureScale.toFixed(1)}x</Label>
                <Slider
                  value={[textureScale]}
                  onValueChange={(value) => setTextureScale(value[0])}
                  min={0.1}
                  max={5}
                  step={0.1}
                  className="w-full"
                />
              </div>

              {/* Texture Offset Controls */}
              <div className="space-y-2">
                <Label className="text-xs">Offset X: {textureOffsetX.toFixed(2)}</Label>
                <Slider
                  value={[textureOffsetX]}
                  onValueChange={(value) => setTextureOffsetX(value[0])}
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
                  onValueChange={(value) => setTextureOffsetY(value[0])}
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
                {textureLibrary[selectedTextureCategory === 'waterline' ? 'finishes' : selectedTextureCategory]?.map((texture) => (
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
                    <img
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
