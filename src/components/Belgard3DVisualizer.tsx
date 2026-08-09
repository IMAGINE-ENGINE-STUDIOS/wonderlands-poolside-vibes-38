import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Search, Upload, ZoomIn, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

// Declare model-viewer as a custom element
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        src?: string;
        poster?: string;
        'camera-controls'?: boolean;
        'environment-image'?: string;
        exposure?: string;
        'shadow-intensity'?: string;
        'auto-rotate'?: boolean;
        'rotation-per-second'?: string;
        'ios-src'?: string; // USDZ support for iOS AR
        ar?: boolean;
        'ar-modes'?: string;
      };
    }
  }
}

// Supported 3D file formats
export type Model3DFormat = 'glb' | 'gltf' | 'obj' | 'fbx' | 'usdz';

export function getSupportedFormats(): string[] {
  return ['GLB', 'GLTF', 'OBJ', 'FBX', 'USDZ'];
}

export function detectFormat(url: string): Model3DFormat | null {
  const extension = url.split('.').pop()?.toLowerCase();
  switch (extension) {
    case 'glb':
    case 'gltf':
      return 'glb';
    case 'obj':
      return 'obj';
    case 'fbx':
      return 'fbx';
    case 'usdz':
      return 'usdz';
    default:
      return null;
  }
}

interface BelgardRoom {
  name: string;
  image: string;
  description: string;
  glb?: string; // GLB/GLTF model URL
  usdz?: string; // USDZ model URL for iOS AR
  obj?: string; // OBJ model URL
  fbx?: string; // FBX model URL
  category?: string;
}
const defaultRooms: BelgardRoom[] = [{
  name: "Harbor View Kitchen",
  image: "https://rooms.belgard.com/wp-content/uploads/2024/07/KR_12_A_2.jpg?optimize=low&auto=webp",
  description: "Coastal-inspired outdoor kitchen with light paver palette and premium finishes.",
  glb: "https://modelviewer.dev/shared-assets/models/Astronaut.glb",
  category: "Kitchen"
}, {
  name: "Sherwood Fireplace",
  image: "https://rooms.belgard.com/wp-content/uploads/KR_HNA_23_5.jpg?optimize=low&auto=webp",
  description: "Warm, stone fireplace with integrated seating and ambient lighting.",
  glb: "https://modelviewer.dev/shared-assets/models/RobotExpressive.glb",
  category: "Fireplace"
}, {
  name: "Midtown Patio",
  image: "https://rooms.belgard.com/wp-content/uploads/KR_24_FL_1_5.jpg?optimize=low&auto=webp",
  description: "Compact urban patio with durable pavers for everyday entertainment.",
  glb: "https://modelviewer.dev/shared-assets/models/Astronaut.glb",
  category: "Patio"
}, {
  name: "Sienna Screen Enclosure",
  image: "https://rooms.belgard.com/wp-content/uploads/cR_7_a_4-Photo.jpg?optimize=low&auto=webp",
  description: "Elegant screen enclosure with premium materials and climate control.",
  glb: "https://modelviewer.dev/shared-assets/models/RobotExpressive.glb",
  category: "Screen Enclosure"
}];
interface RoomCardProps {
  room: BelgardRoom;
  onImageClick: (src: string, alt: string) => void;
}
const RoomCard: React.FC<RoomCardProps> = ({
  room,
  onImageClick
}) => {
  const [isViewing3D, setIsViewing3D] = useState(false);
  const [error, setError] = useState('');
  const modelViewerRef = useRef<HTMLElement>(null);
  const handle3DToggle = () => {
    if (!room.glb) {
      toast.error("No 3D model available for this room");
      return;
    }
    setError('');
    setIsViewing3D(true);
    toast.success("Loading 3D model...");
  };
  const handleBackToImage = () => {
    setIsViewing3D(false);
    setError('');
  };
  const handleModelError = (event: any) => {
    setError('Failed to load 3D model. Please check your connection.');
    toast.error("Failed to load 3D model");
  };
  const handleModelLoad = () => {
    setError('');
    toast.success("3D model loaded successfully!");
  };
  // Get the best available 3D model URL (prioritize GLB, then others)
  const modelUrl = room.glb || room.obj || room.fbx;
  const usdzUrl = room.usdz;
  const modelFormat = modelUrl ? detectFormat(modelUrl) : null;
  
  // Check if format is supported by model-viewer (GLB/GLTF only)
  const isModelViewerCompatible = modelFormat === 'glb' || modelFormat === 'gltf';
  
  return <Card className="group bg-card border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <div className="relative aspect-[16/10] bg-muted overflow-hidden rounded-t-lg">
        {!isViewing3D ? (
          <img loading="lazy" decoding="async" 
            src={room.image} 
            alt={room.name} 
            className="absolute inset-0 w-full h-full object-cover cursor-zoom-in transition-transform duration-300 group-hover:scale-105" 
            onClick={() => onImageClick(room.image, room.name)} 
          />
        ) : isModelViewerCompatible ? (
          <model-viewer 
            ref={modelViewerRef} 
            src={modelUrl} 
            ios-src={usdzUrl}
            ar={!!usdzUrl}
            ar-modes="webxr scene-viewer quick-look"
            camera-controls 
            environment-image="neutral" 
            exposure="1" 
            shadow-intensity="1" 
            auto-rotate 
            rotation-per-second="30deg" 
            className="absolute inset-0 w-full h-full" 
            onError={handleModelError} 
            onLoad={handleModelLoad} 
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <div className="text-center p-4">
              <p className="text-sm text-muted-foreground mb-2">
                {modelFormat?.toUpperCase()} format requires Three.js viewer
              </p>
              <Badge variant="outline">{modelFormat?.toUpperCase()}</Badge>
            </div>
          </div>
        )}
      </div>
      
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-semibold text-lg text-foreground line-clamp-2">{room.name}</h3>
          <Badge variant="secondary" className="shrink-0">
            {room.category || '3D'}
          </Badge>
        </div>
        
        <p className="text-sm text-muted-foreground line-clamp-3">
          {room.description}
        </p>
        
        <div className="flex gap-2 flex-wrap">
          {!isViewing3D ? <Button onClick={handle3DToggle} disabled={!room.glb} className="bg-primary hover:bg-primary/90 text-primary-foreground" size="sm">
              View 3D
            </Button> : <Button onClick={handleBackToImage} variant="outline" size="sm">
              <RotateCcw className="w-4 h-4 mr-2" />
              Back to Image
            </Button>}
        </div>
        
        {error && <div className="text-xs text-destructive bg-destructive/10 p-2 rounded">
            {error}
          </div>}
      </CardContent>
    </Card>;
};
export const Belgard3DVisualizer: React.FC = () => {
  const [rooms, setRooms] = useState<BelgardRoom[]>(defaultRooms);
  const [filteredRooms, setFilteredRooms] = useState<BelgardRoom[]>(defaultRooms);
  const [searchQuery, setSearchQuery] = useState('');
  const [lightboxImage, setLightboxImage] = useState<{
    src: string;
    alt: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const filtered = rooms.filter(room => room.name.toLowerCase().includes(searchQuery.toLowerCase()) || room.description.toLowerCase().includes(searchQuery.toLowerCase()) || (room.category?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false));
    setFilteredRooms(filtered);
  }, [searchQuery, rooms]);
  const handleImageClick = (src: string, alt: string) => {
    setLightboxImage({
      src,
      alt
    });
  };
  const closeLightbox = () => {
    setLightboxImage(null);
  };
  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      let importedRooms: BelgardRoom[] = [];
      if (file.name.toLowerCase().endsWith('.json')) {
        const data = JSON.parse(text);
        importedRooms = Array.isArray(data) ? data : data.rooms || [];
      } else if (file.name.toLowerCase().endsWith('.csv')) {
        const lines = text.split(/\r?\n/).filter(Boolean);
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        importedRooms = lines.slice(1).map(line => {
          const values = line.split(',');
          const room: any = {};
          headers.forEach((header, index) => {
            room[header] = values[index]?.trim() || '';
          });
          return room as BelgardRoom;
        });
      }
      if (importedRooms.length > 0) {
        setRooms(importedRooms);
        toast.success(`Imported ${importedRooms.length} rooms successfully!`);
      } else {
        toast.error('No valid room data found in file');
      }
    } catch (error) {
      toast.error('Failed to import file. Please check the format.');
    }
    event.target.value = '';
  };
  return <div className="space-y-6">
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">Belgard Room Gallery</h2>
        <p className="text-muted-foreground mb-4">
          Explore our stunning Belgard room designs. Click images to expand or view in interactive 3D.
        </p>
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="text-xs text-muted-foreground">Supported formats:</span>
          {getSupportedFormats().map(format => (
            <Badge key={format} variant="secondary" className="text-xs">
              {format}
            </Badge>
          ))}
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search rooms..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10" />
          </div>
          
          
          
          <input ref={fileInputRef} type="file" accept=".json,.csv" onChange={handleFileImport} className="hidden" />
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredRooms.map((room, index) => <RoomCard key={`${room.name}-${index}`} room={room} onImageClick={handleImageClick} />)}
      </div>

      {filteredRooms.length === 0 && <div className="text-center py-12">
          <p className="text-muted-foreground">No rooms found matching your search.</p>
        </div>}

      {/* Lightbox Modal */}
      {lightboxImage && <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={closeLightbox}>
          <img loading="lazy" decoding="async" src={lightboxImage.src} alt={lightboxImage.alt} className="max-w-[92vw] max-h-[92vh] object-contain rounded-lg" onClick={e => e.stopPropagation()} />
          <Button variant="ghost" size="icon" className="absolute top-4 right-4 text-white hover:bg-white/20" onClick={closeLightbox}>
            ×
          </Button>
        </div>}
    </div>;
};