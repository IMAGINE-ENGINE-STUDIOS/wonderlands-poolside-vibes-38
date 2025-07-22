
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  RotateCw, 
  Camera, 
  Eye, 
  Maximize2, 
  Minimize2,
  Zap,
  Cpu
} from 'lucide-react';

interface ControlsProps {
  stats: {
    fps: number;
    vertices: number;
    triangles: number;
    memoryUsage: number;
  };
  settings: any;
  onResetCamera: () => void;
  onScreenshot: () => void;
  onToggleFullscreen: () => void;
  isFullscreen: boolean;
}

export const ImaginalyControls = ({ 
  stats, 
  settings, 
  onResetCamera, 
  onScreenshot, 
  onToggleFullscreen,
  isFullscreen 
}: ControlsProps) => {
  return (
    <>
      {/* Status Badges */}
      <div className="absolute top-4 left-4 z-10 flex gap-2">
        <Badge variant="secondary" className="bg-black/60 text-white border-0">
          <Eye className="h-3 w-3 mr-1" />
          IMAGINALY
        </Badge>
        <Badge variant="secondary" className="bg-black/60 text-white border-0">
          <Zap className="h-3 w-3 mr-1" />
          {settings.shaderMode?.toUpperCase() || 'PBR'}
        </Badge>
        <Badge variant="secondary" className="bg-black/60 text-white border-0">
          <Cpu className="h-3 w-3 mr-1" />
          {stats.fps} FPS
        </Badge>
      </div>

      {/* Control Buttons */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onResetCamera} 
          title="Reset View"
          className="bg-white/90 backdrop-blur-sm"
        >
          <RotateCw className="h-4 w-4" />
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onScreenshot} 
          title="Take Screenshot"
          className="bg-white/90 backdrop-blur-sm"
        >
          <Camera className="h-4 w-4" />
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onToggleFullscreen} 
          title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          className="bg-white/90 backdrop-blur-sm"
        >
          {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </Button>
      </div>
    </>
  );
};
