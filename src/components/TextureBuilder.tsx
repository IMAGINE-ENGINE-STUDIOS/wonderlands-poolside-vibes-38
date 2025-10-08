import { useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Upload, Trash2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

export interface TextureConfig {
  id: string;
  name: string;
  url: string;
  target: 'pool' | 'deck' | 'fence' | 'coping' | 'water';
  preview?: string;
  repeatX?: number;
  repeatY?: number;
}

interface TextureBuilderProps {
  onTexturesChange: (textures: TextureConfig[]) => void;
  currentTextures?: TextureConfig[];
}

export const TextureBuilder = ({ onTexturesChange, currentTextures = [] }: TextureBuilderProps) => {
  const [textures, setTextures] = useState<TextureConfig[]>(currentTextures);
  const [previewVisible, setPreviewVisible] = useState<Record<string, boolean>>({});
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Optimize image for web use - resize and compress
  const optimizeImage = useCallback(async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        // Limit max dimension to 2048px for performance
        const maxDim = 2048;
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to JPEG with quality 0.85 for smaller file size
        const optimizedUrl = canvas.toDataURL('image/jpeg', 0.85);
        resolve(optimizedUrl);
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }, []);

  const handleFileUpload = useCallback(async (target: TextureConfig['target'], file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (JPG, PNG, etc.)');
      return;
    }

    try {
      toast.info('Optimizing texture...');
      const optimizedUrl = await optimizeImage(file);
      
      const newTexture: TextureConfig = {
        id: `texture-${Date.now()}-${target}`,
        name: file.name,
        url: optimizedUrl,
        target,
        preview: optimizedUrl,
        repeatX: 1,
        repeatY: 1,
      };

      const updatedTextures = [
        ...textures.filter(t => t.target !== target),
        newTexture
      ];

      setTextures(updatedTextures);
      onTexturesChange(updatedTextures);
      toast.success(`${target} texture applied!`);
    } catch (error) {
      console.error('Error optimizing texture:', error);
      toast.error('Failed to process texture');
    }
  }, [textures, onTexturesChange, optimizeImage]);

  const removeTexture = useCallback((target: TextureConfig['target']) => {
    const updatedTextures = textures.filter(t => t.target !== target);
    setTextures(updatedTextures);
    onTexturesChange(updatedTextures);
    toast.success(`${target} texture removed`);
  }, [textures, onTexturesChange]);

  const updateRepeat = useCallback((target: TextureConfig['target'], axis: 'x' | 'y', value: number) => {
    const updatedTextures = textures.map(t => {
      if (t.target === target) {
        return {
          ...t,
          repeatX: axis === 'x' ? value : t.repeatX,
          repeatY: axis === 'y' ? value : t.repeatY,
        };
      }
      return t;
    });
    setTextures(updatedTextures);
    onTexturesChange(updatedTextures);
  }, [textures, onTexturesChange]);

  const textureTargets: Array<{ key: TextureConfig['target']; label: string }> = [
    { key: 'pool', label: 'Pool Liner' },
    { key: 'water', label: 'Water Surface' },
    { key: 'deck', label: 'Deck/Pavers' },
    { key: 'coping', label: 'Coping' },
    { key: 'fence', label: 'Fence' },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-semibold">Custom Textures</Label>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setPreviewVisible(prev => {
            const allVisible = Object.keys(prev).length > 0 && Object.values(prev).every(v => v);
            const newState: Record<string, boolean> = {};
            textures.forEach(t => newState[t.id] = !allVisible);
            return newState;
          })}
          className="h-7 text-xs"
        >
          {Object.values(previewVisible).some(v => v) ? <EyeOff className="h-3 w-3 mr-1" /> : <Eye className="h-3 w-3 mr-1" />}
          Toggle Previews
        </Button>
      </div>

      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
        {textureTargets.map(({ key, label }) => {
          const texture = textures.find(t => t.target === key);
          
          return (
            <Card key={key} className="p-3 space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium">{label}</Label>
                <div className="flex gap-1">
                  <Input
                    ref={el => fileInputRefs.current[key] = el}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(key, file);
                    }}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => fileInputRefs.current[key]?.click()}
                    className="h-7 text-xs"
                  >
                    <Upload className="h-3 w-3 mr-1" />
                    Upload
                  </Button>
                  {texture && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setPreviewVisible(prev => ({
                          ...prev,
                          [texture.id]: !prev[texture.id]
                        }))}
                        className="h-7 text-xs"
                      >
                        {previewVisible[texture.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => removeTexture(key)}
                        className="h-7 text-xs"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {texture && (
                <>
                  {previewVisible[texture.id] && (
                    <div className="relative w-full h-20 rounded overflow-hidden bg-muted">
                      <img 
                        src={texture.preview} 
                        alt={texture.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-[10px] text-muted-foreground">Repeat X: {texture.repeatX}</Label>
                      <Input
                        type="range"
                        min="0.1"
                        max="10"
                        step="0.1"
                        value={texture.repeatX}
                        onChange={(e) => updateRepeat(key, 'x', parseFloat(e.target.value))}
                        className="h-2"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] text-muted-foreground">Repeat Y: {texture.repeatY}</Label>
                      <Input
                        type="range"
                        min="0.1"
                        max="10"
                        step="0.1"
                        value={texture.repeatY}
                        onChange={(e) => updateRepeat(key, 'y', parseFloat(e.target.value))}
                        className="h-2"
                      />
                    </div>
                  </div>
                </>
              )}
            </Card>
          );
        })}
      </div>

      <div className="text-[10px] text-muted-foreground bg-muted/50 p-2 rounded">
        💡 Tip: Images are automatically optimized for performance. Textures are cached for fast loading.
      </div>
    </div>
  );
};
