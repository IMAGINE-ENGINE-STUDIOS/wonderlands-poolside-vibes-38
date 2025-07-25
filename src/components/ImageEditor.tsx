import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { Upload, Crop, RotateCw, ZoomIn, ZoomOut, Check, X } from 'lucide-react';

interface ImageEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onImageSave: (imageBlob: Blob) => void;
  currentImage?: string;
}

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

const ImageEditor = ({ isOpen, onClose, onImageSave, currentImage }: ImageEditorProps) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(currentImage || null);
  const [cropArea, setCropArea] = useState<CropArea>({ x: 0, y: 0, width: 300, height: 200 });
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
        // Auto-crop to center when new image loads
        setTimeout(() => autoCrop(), 100);
      };
      reader.readAsDataURL(file);
    }
  };

  const autoCrop = () => {
    if (imageRef.current) {
      const img = imageRef.current;
      const aspectRatio = 3 / 2; // Standard product card aspect ratio
      
      let width = img.naturalWidth;
      let height = img.naturalWidth / aspectRatio;
      
      if (height > img.naturalHeight) {
        height = img.naturalHeight;
        width = img.naturalHeight * aspectRatio;
      }
      
      const x = (img.naturalWidth - width) / 2;
      const y = (img.naturalHeight - height) / 2;
      
      setCropArea({ x, y, width, height });
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging && imageRef.current) {
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;
      
      setCropArea(prev => ({
        ...prev,
        x: Math.max(0, Math.min(imageRef.current!.naturalWidth - prev.width, prev.x + deltaX)),
        y: Math.max(0, Math.min(imageRef.current!.naturalHeight - prev.height, prev.y + deltaY))
      }));
      
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  }, [isDragging, dragStart]);

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleCropResize = (side: string, delta: number) => {
    setCropArea(prev => {
      const newArea = { ...prev };
      const aspectRatio = 3 / 2;
      
      switch (side) {
        case 'width':
          newArea.width = Math.max(100, Math.min(imageRef.current!.naturalWidth - prev.x, prev.width + delta));
          newArea.height = newArea.width / aspectRatio;
          break;
        case 'height':
          newArea.height = Math.max(67, Math.min(imageRef.current!.naturalHeight - prev.y, prev.height + delta));
          newArea.width = newArea.height * aspectRatio;
          break;
      }
      
      return newArea;
    });
  };

  const applyCrop = async () => {
    if (!selectedImage || !canvasRef.current || !imageRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Create a new image element to ensure we have the correct source
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    return new Promise<void>((resolve) => {
      img.onload = () => {
        // Set canvas size to crop area
        canvas.width = cropArea.width;
        canvas.height = cropArea.height;
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw the cropped area
        ctx.drawImage(
          img,
          cropArea.x, cropArea.y, cropArea.width, cropArea.height,
          0, 0, cropArea.width, cropArea.height
        );
        
        // Convert to blob
        canvas.toBlob((blob) => {
          if (blob) {
            onImageSave(blob);
            toast({
              title: "Image Saved",
              description: "Your cropped image has been saved successfully!"
            });
            onClose();
          }
          resolve();
        }, 'image/jpeg', 0.9);
      };
      
      img.onerror = () => {
        toast({
          title: "Error",
          description: "Failed to process image. Please try again.",
          variant: "destructive"
        });
        resolve();
      };
      
      // Load the selected image
      img.src = selectedImage;
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crop className="h-5 w-5" />
            Image Editor & Cropper
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Upload Section */}
          {!selectedImage && (
            <Card>
              <CardContent className="p-8 text-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  size="lg"
                  className="w-full h-32 border-dashed border-2"
                >
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="h-8 w-8" />
                    <span>Click to upload image</span>
                    <span className="text-sm text-muted-foreground">
                      PNG, JPG up to 10MB
                    </span>
                  </div>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Image Editor */}
          {selectedImage && (
            <div className="space-y-4">
              {/* Controls */}
              <div className="flex flex-wrap gap-4 items-center">
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  size="sm"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Change Image
                </Button>
                
                <Button
                  onClick={autoCrop}
                  variant="outline"
                  size="sm"
                >
                  <Crop className="h-4 w-4 mr-2" />
                  Auto Crop
                </Button>

                <div className="flex items-center gap-2">
                  <ZoomOut className="h-4 w-4" />
                  <Slider
                    value={[zoom]}
                    onValueChange={(value) => setZoom(value[0])}
                    min={0.5}
                    max={3}
                    step={0.1}
                    className="w-24"
                  />
                  <ZoomIn className="h-4 w-4" />
                </div>
              </div>

              {/* Image Display with Crop Overlay */}
              <div className="relative max-w-full max-h-96 overflow-hidden border rounded-lg">
                <img
                  ref={imageRef}
                  src={selectedImage}
                  alt="Edit"
                  className="max-w-full max-h-96 object-contain"
                  style={{ transform: `scale(${zoom})` }}
                />
                
                {/* Crop Overlay */}
                <div
                  className="absolute border-2 border-primary bg-primary/10 cursor-move"
                  style={{
                    left: `${(cropArea.x / (imageRef.current?.naturalWidth || 1)) * 100}%`,
                    top: `${(cropArea.y / (imageRef.current?.naturalHeight || 1)) * 100}%`,
                    width: `${(cropArea.width / (imageRef.current?.naturalWidth || 1)) * 100}%`,
                    height: `${(cropArea.height / (imageRef.current?.naturalHeight || 1)) * 100}%`,
                  }}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                >
                  {/* Resize handles */}
                  <div className="absolute -right-1 -bottom-1 w-3 h-3 bg-primary border border-white cursor-se-resize"></div>
                </div>
              </div>

              {/* Crop Adjustment Controls */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Width</label>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCropResize('width', -20)}
                    >
                      -
                    </Button>
                    <span className="text-sm min-w-16 text-center">
                      {Math.round(cropArea.width)}px
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCropResize('width', 20)}
                    >
                      +
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Height</label>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCropResize('height', -20)}
                    >
                      -
                    </Button>
                    <span className="text-sm min-w-16 text-center">
                      {Math.round(cropArea.height)}px
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCropResize('height', 20)}
                    >
                      +
                    </Button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={onClose}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={applyCrop} variant="default">
                  <Check className="h-4 w-4 mr-2" />
                  Save Cropped Image
                </Button>
              </div>
            </div>
          )}

          {/* Hidden canvas for image processing */}
          <canvas ref={canvasRef} className="hidden" />
          
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageEditor;