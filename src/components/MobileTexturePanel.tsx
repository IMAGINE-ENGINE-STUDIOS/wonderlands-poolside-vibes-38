import { Slider } from '@/components/ui/slider';
import { TextureConfig } from './scene3d/types';

interface MobileTexturePanelProps {
  textures: TextureConfig[];
  currentTexture: TextureConfig;
  textureScale: number;
  onTextureChange: (texture: TextureConfig) => void;
  onScaleChange: (scale: number) => void;
  label: string;
}

export function MobileTexturePanel({
  textures,
  currentTexture,
  textureScale,
  onTextureChange,
  onScaleChange,
  label
}: MobileTexturePanelProps) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      
      {/* Horizontal scrollable texture row */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {textures.map((texture) => (
          <button
            key={texture.url}
            onClick={() => onTextureChange({ 
              ...texture, 
              scale: textureScale,
              offset: currentTexture.offset || [0, 0]
            })}
            className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
              currentTexture.url === texture.url 
                ? 'border-primary ring-2 ring-primary/20' 
                : 'border-border hover:border-primary/50'
            }`}
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
      
      {/* Compact Scale Slider */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground min-w-12">Scale:</span>
        <Slider
          value={[textureScale]}
          onValueChange={(value) => onScaleChange(value[0])}
          min={0.1}
          max={10}
          step={0.1}
          className="flex-1"
        />
        <span className="text-xs font-medium min-w-8 text-right">{textureScale.toFixed(1)}x</span>
      </div>
    </div>
  );
}
