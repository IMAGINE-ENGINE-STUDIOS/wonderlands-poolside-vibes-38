import React, { useRef, useState, useCallback } from 'react';
import { Camera, ZoomIn, ZoomOut, Move, RotateCcw } from 'lucide-react';

export interface ImageCropSettings {
  zoom: number;
  offsetX: number;
  offsetY: number;
}

interface ImageUploadOverlayProps {
  imageKey: string;
  isEditMode: boolean;
  imageOverrides: Record<string, string>;
  onImageOverride: (key: string, dataUrl: string) => void;
  cropSettings?: Record<string, ImageCropSettings>;
  onCropChange?: (key: string, settings: ImageCropSettings) => void;
  children: React.ReactNode;
}

const DEFAULT_CROP: ImageCropSettings = { zoom: 1, offsetX: 0, offsetY: 0 };

const ImageUploadOverlay: React.FC<ImageUploadOverlayProps> = ({
  imageKey,
  isEditMode,
  imageOverrides,
  onImageOverride,
  cropSettings,
  onCropChange,
  children,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showCropControls, setShowCropControls] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);

  const crop = cropSettings?.[imageKey] || DEFAULT_CROP;
  const hasOverride = !!imageOverrides[imageKey];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const emit = (dataUrl: string) => {
      onImageOverride(imageKey, dataUrl);
      // Reset crop to default — image will show fully (object-fit: contain style)
      onCropChange?.(imageKey, DEFAULT_CROP);
      setShowCropControls(true);
    };
    // Quote snapshots persist in localStorage, whose per-origin quota a
    // single full-size photo or render data URL can exceed on its own —
    // and an over-quota save used to be dropped silently, taking the
    // quote's images (and its total) with it. Large images are therefore
    // downscaled to a maximum 1600px edge as JPEG before they enter the
    // editor state; small files keep their original bytes untouched.
    // The keep-original ceiling is on the DATA URL length, not just the
    // pixel size: a 1600px PNG render can still weigh ~1.3MB as a data
    // URL, and a gallery holding several of those leaves no headroom —
    // an image-bearing save on a pre-existing entry then failed on
    // quota while a smaller scalar-only save (a corrected total) went
    // through, so the entry kept its old line image and no main image.
    // Anything past the ceiling is re-encoded as JPEG (at its natural
    // size when already within the edge limit), which brings the same
    // image down to a few hundred KB.
    const KEEP_ORIGINAL_MAX_BYTES = 500_000;
    const KEEP_ORIGINAL_MAX_DATA_URL = 700_000;
    const MAX_EDGE = 1600;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') return;
      const original = reader.result;
      if (file.size <= KEEP_ORIGINAL_MAX_BYTES) { emit(original); return; }
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, MAX_EDGE / Math.max(img.naturalWidth, img.naturalHeight));
        if (scale >= 1 && original.length <= KEEP_ORIGINAL_MAX_DATA_URL) { emit(original); return; }
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
        canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
        const ctx = canvas.getContext('2d');
        if (!ctx) { emit(original); return; }
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        emit(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.onerror = () => emit(original);
      img.src = original;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const updateCrop = useCallback((partial: Partial<ImageCropSettings>) => {
    onCropChange?.(imageKey, { ...crop, ...partial });
  }, [imageKey, crop, onCropChange]);

  const handleZoomIn = () => updateCrop({ zoom: Math.min(crop.zoom + 0.1, 4) });
  const handleZoomOut = () => updateCrop({ zoom: Math.max(crop.zoom - 0.1, 0.3) });
  const handleReset = () => onCropChange?.(imageKey, DEFAULT_CROP);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!showCropControls) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY, ox: crop.offsetX, oy: crop.offsetY };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !dragStartRef.current) return;
    e.preventDefault();
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    updateCrop({
      offsetX: dragStartRef.current.ox + dx,
      offsetY: dragStartRef.current.oy + dy,
    });
  };

  const handlePointerUp = () => {
    setIsDragging(false);
    dragStartRef.current = null;
  };

  // Build a style object that the children's images should use
  // We inject this via a CSS variable approach on the wrapper
  const hasCropApplied = crop.zoom !== 1 || crop.offsetX !== 0 || crop.offsetY !== 0;

  return (
    <div
      className="relative"
      style={{
        // Pass crop data as CSS custom properties so child img picks them up
        '--img-crop-zoom': crop.zoom,
        '--img-crop-x': `${crop.offsetX}px`,
        '--img-crop-y': `${crop.offsetY}px`,
      } as React.CSSProperties}
    >
      {/* Children rendered with crop transform applied to all descendant img/canvas */}
      <div
        className="overflow-hidden"
        style={{ position: 'relative' }}
      >
        <div
          style={hasCropApplied ? {
            transform: `translate(${crop.offsetX}px, ${crop.offsetY}px) scale(${crop.zoom})`,
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 0.15s ease-out',
          } : undefined}
        >
          {/* Clone children to override object-fit to 'contain' when we have an override */}
          {hasOverride ? (
            <div style={{ width: '100%', height: '100%' }} className="[&_img]:!object-contain">
              {children}
            </div>
          ) : children}
        </div>
      </div>

      {isEditMode && (
        <>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          {/* Upload button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute top-1 left-1 z-10 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-1.5 shadow-md transition-colors no-print print:hidden"
            title="Replace image"
          >
            <Camera className="h-3.5 w-3.5" />
          </button>

          {/* Crop/zoom toggle */}
          <button
            type="button"
            onClick={() => setShowCropControls(!showCropControls)}
            className={`absolute top-1 left-9 z-10 rounded-full p-1.5 shadow-md transition-colors no-print print:hidden ${
              showCropControls ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-gray-600 hover:bg-gray-700 text-white'
            }`}
            title="Adjust crop & zoom"
          >
            <Move className="h-3.5 w-3.5" />
          </button>

          {/* Crop controls bar */}
          {showCropControls && (
            <div className="absolute bottom-1 left-1 right-1 z-10 flex items-center gap-1 bg-black/70 rounded-md px-2 py-1 no-print print:hidden">
              <button type="button" onClick={handleZoomOut} className="text-white hover:text-blue-300 p-0.5" title="Zoom out">
                <ZoomOut className="h-3.5 w-3.5" />
              </button>
              <input
                type="range"
                min="30"
                max="400"
                value={crop.zoom * 100}
                onChange={(e) => updateCrop({ zoom: Number(e.target.value) / 100 })}
                className="flex-1 h-1 accent-blue-500"
                title={`Zoom: ${Math.round(crop.zoom * 100)}%`}
              />
              <button type="button" onClick={handleZoomIn} className="text-white hover:text-blue-300 p-0.5" title="Zoom in">
                <ZoomIn className="h-3.5 w-3.5" />
              </button>
              <button type="button" onClick={handleReset} className="text-white hover:text-orange-300 p-0.5 ml-1" title="Reset">
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
              <span className="text-white text-[10px] ml-1 select-none whitespace-nowrap">{Math.round(crop.zoom * 100)}%</span>
            </div>
          )}

          {/* Drag surface when crop mode active */}
          {showCropControls && (
            <div
              className="absolute inset-0 z-[5]"
              style={{ cursor: isDragging ? 'grabbing' : 'grab', bottom: '28px' }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
            />
          )}
        </>
      )}
    </div>
  );
};

export default ImageUploadOverlay;
