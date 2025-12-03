import { PoolLightConfig, PoolLightColorMode } from './types';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Plus, Minus, Lightbulb, Palette } from 'lucide-react';

interface PoolLightControlsProps {
  lights: PoolLightConfig[];
  onLightsChange: (lights: PoolLightConfig[]) => void;
  selectedLightId: string | null;
  onSelectLight: (id: string | null) => void;
  isNightMode: boolean;
}

export function PoolLightControls({
  lights,
  onLightsChange,
  selectedLightId,
  onSelectLight,
  isNightMode
}: PoolLightControlsProps) {
  const selectedLight = lights.find(l => l.id === selectedLightId);

  const addLight = () => {
    if (lights.length >= 8) return;
    
    // Distribute new light evenly
    const newPosition = lights.length === 0 ? 0.25 : 
      (lights.length + 1) / (lights.length + 2);
    
    const newLight: PoolLightConfig = {
      id: `light-${Date.now()}`,
      wallPosition: newPosition,
      depthFromSurface: 1.5,
      color: '#ffffff',
      colorMode: 'white',
      intensity: 2,
      isOn: isNightMode
    };
    
    onLightsChange([...lights, newLight]);
  };

  const removeLight = () => {
    if (lights.length <= 1) return;
    
    if (selectedLightId) {
      onLightsChange(lights.filter(l => l.id !== selectedLightId));
      onSelectLight(null);
    } else {
      onLightsChange(lights.slice(0, -1));
    }
  };

  const updateLight = (lightId: string, updates: Partial<PoolLightConfig>) => {
    onLightsChange(lights.map(l => 
      l.id === lightId ? { ...l, ...updates } : l
    ));
  };

  const toggleAllLights = (isOn: boolean) => {
    onLightsChange(lights.map(l => ({ ...l, isOn })));
  };

  const setAllColorMode = (mode: PoolLightColorMode) => {
    onLightsChange(lights.map(l => ({ ...l, colorMode: mode })));
  };

  return (
    <div className="space-y-4">
      {/* Light count controls */}
      <div className="flex items-center justify-between">
        <Label className="text-xs text-muted-foreground">Pool Lights ({lights.length})</Label>
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            onClick={removeLight}
            disabled={lights.length <= 1}
          >
            <Minus className="h-3 w-3" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            onClick={addLight}
            disabled={lights.length >= 8}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Master controls */}
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant={lights.every(l => l.isOn) ? 'default' : 'outline'}
          size="sm"
          className="text-xs"
          onClick={() => toggleAllLights(true)}
        >
          <Lightbulb className="h-3 w-3 mr-1" />
          All On
        </Button>
        <Button
          variant={lights.every(l => !l.isOn) ? 'default' : 'outline'}
          size="sm"
          className="text-xs"
          onClick={() => toggleAllLights(false)}
        >
          All Off
        </Button>
      </div>

      {/* Color mode toggle */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Color Mode</Label>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant={lights.every(l => l.colorMode === 'white') ? 'default' : 'outline'}
            size="sm"
            className="text-xs"
            onClick={() => setAllColorMode('white')}
          >
            White
          </Button>
          <Button
            variant={lights.every(l => l.colorMode === 'gradient') ? 'default' : 'outline'}
            size="sm"
            className="text-xs"
            onClick={() => setAllColorMode('gradient')}
          >
            <Palette className="h-3 w-3 mr-1" />
            Color Cycle
          </Button>
        </div>
      </div>

      {/* Selected light controls */}
      {selectedLight && (
        <div className="border-t border-border pt-4 space-y-3">
          <Label className="text-xs font-medium">Selected Light</Label>
          
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">Power</Label>
            <Switch
              checked={selectedLight.isOn}
              onCheckedChange={(isOn) => updateLight(selectedLight.id, { isOn })}
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between">
              <Label className="text-xs text-muted-foreground">Intensity</Label>
              <span className="text-xs text-muted-foreground">
                {selectedLight.intensity.toFixed(1)}
              </span>
            </div>
            <Slider
              value={[selectedLight.intensity]}
              onValueChange={([v]) => updateLight(selectedLight.id, { intensity: v })}
              min={0.5}
              max={5}
              step={0.1}
              className="w-full"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between">
              <Label className="text-xs text-muted-foreground">Depth (ft)</Label>
              <span className="text-xs text-muted-foreground">
                {selectedLight.depthFromSurface.toFixed(1)}
              </span>
            </div>
            <Slider
              value={[selectedLight.depthFromSurface]}
              onValueChange={([v]) => updateLight(selectedLight.id, { depthFromSurface: v })}
              min={0.5}
              max={4}
              step={0.1}
              className="w-full"
            />
          </div>

          {selectedLight.colorMode === 'white' && (
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Light Color</Label>
              <div className="flex gap-1">
                {['#ffffff', '#fffae6', '#e6f7ff', '#e6ffe6'].map(color => (
                  <button
                    key={color}
                    className={`w-6 h-6 rounded border-2 ${
                      selectedLight.color === color ? 'border-primary' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => updateLight(selectedLight.id, { color })}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <p className="text-xs text-muted-foreground italic">
        Click a light in the 3D view to select. Drag to reposition along pool wall.
      </p>
    </div>
  );
}
