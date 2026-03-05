import { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  ChevronLeft, ChevronRight, X, Download, Printer, Send,
  ZoomIn, ZoomOut, RotateCw, Maximize2, Minimize2,
} from 'lucide-react';
import { GalleryFile } from '@/hooks/useGallery';
import { downloadFile, printFile, forwardFile, formatSize, getFileIcon } from './galleryUtils';

interface FileViewerProps {
  files: GalleryFile[];
  initialIndex: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const FileViewer = ({ files, initialIndex, open, onOpenChange }: FileViewerProps) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const file = files[currentIndex];

  useEffect(() => {
    setCurrentIndex(initialIndex);
    setZoom(1);
    setRotation(0);
  }, [initialIndex, open]);

  const goNext = useCallback(() => {
    if (currentIndex < files.length - 1) {
      setCurrentIndex(i => i + 1);
      setZoom(1);
      setRotation(0);
    }
  }, [currentIndex, files.length]);

  const goPrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(i => i - 1);
      setZoom(1);
      setRotation(0);
    }
  }, [currentIndex]);

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') goNext();
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') goPrev();
      else if (e.key === 'Escape') onOpenChange(false);
      else if (e.key === '+' || e.key === '=') setZoom(z => Math.min(z + 0.25, 5));
      else if (e.key === '-') setZoom(z => Math.max(z - 0.25, 0.25));
      else if (e.key === 'r') setRotation(r => r + 90);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, goNext, goPrev, onOpenChange]);

  // Mouse wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setZoom(z => {
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      return Math.min(Math.max(z + delta, 0.25), 5);
    });
  }, []);

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setIsFullscreen(!isFullscreen);
  };

  if (!file) return null;

  const isImage = file.file_type?.startsWith('image/');
  const isVideo = file.file_type?.startsWith('video/');
  const isPdf = file.file_type === 'application/pdf';

  const renderContent = () => {
    if (isImage) {
      return (
        <div
          className="flex-1 flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing"
          onWheel={handleWheel}
        >
          <img
            src={file.file_url}
            alt={file.file_name}
            className="max-w-full max-h-full object-contain transition-transform duration-200 select-none"
            style={{
              transform: `scale(${zoom}) rotate(${rotation}deg)`,
            }}
            draggable={false}
          />
        </div>
      );
    }

    if (isVideo) {
      return (
        <div className="flex-1 flex items-center justify-center">
          <video
            src={file.file_url}
            controls
            autoPlay
            className="max-w-full max-h-full"
          />
        </div>
      );
    }

    if (isPdf) {
      return (
        <div className="flex-1 w-full">
          <iframe
            src={file.file_url}
            className="w-full h-full border-0"
            title={file.file_name}
          />
        </div>
      );
    }

    // Generic file - show icon + info + download
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-6">
        {getFileIcon(file.file_type, "h-24 w-24")}
        <div className="text-center">
          <h3 className="text-xl font-semibold text-foreground mb-1">{file.file_name}</h3>
          <p className="text-sm text-muted-foreground">{formatSize(file.file_size)}</p>
          <p className="text-xs text-muted-foreground mt-1">{file.file_type || 'Unknown type'}</p>
        </div>
        <Button onClick={() => downloadFile(file.file_url, file.file_name)}>
          <Download className="h-4 w-4 mr-2" /> Download to View
        </Button>
      </div>
    );
  };

  // Thumbnail strip for images
  const imageFiles = files.filter(f => f.file_type?.startsWith('image/') || f.file_type?.startsWith('video/'));
  const showThumbnails = imageFiles.length > 1 && (isImage || isVideo);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] w-[95vw] h-[95vh] p-0 gap-0 flex flex-col bg-background/95 backdrop-blur-xl border-border [&>button]:hidden">
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-sm font-medium text-foreground truncate max-w-[300px]">
              {file.file_name}
            </span>
            <span className="text-xs text-muted-foreground shrink-0">
              {currentIndex + 1} / {files.length}
            </span>
            {file.file_size && (
              <span className="text-xs text-muted-foreground shrink-0">
                {formatSize(file.file_size)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            {isImage && (
              <>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setZoom(z => Math.min(z + 0.25, 5))}>
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setZoom(z => Math.max(z - 0.25, 0.25))}>
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setRotation(r => r + 90)}>
                  <RotateCw className="h-4 w-4" />
                </Button>
                <div className="h-4 w-px bg-border mx-1" />
              </>
            )}
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => downloadFile(file.file_url, file.file_name)}>
              <Download className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => printFile(file.file_url)}>
              <Printer className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => forwardFile(file.file_url, file.file_name)}>
              <Send className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggleFullscreen}>
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
            <div className="h-4 w-px bg-border mx-1" />
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Main content area with nav arrows */}
        <div className="flex-1 flex items-stretch relative overflow-hidden min-h-0">
          {/* Left arrow */}
          {currentIndex > 0 && (
            <button
              onClick={goPrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 h-12 w-12 rounded-full bg-background/80 backdrop-blur-sm border border-border flex items-center justify-center hover:bg-accent transition-colors"
            >
              <ChevronLeft className="h-6 w-6 text-foreground" />
            </button>
          )}

          {renderContent()}

          {/* Right arrow */}
          {currentIndex < files.length - 1 && (
            <button
              onClick={goNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 h-12 w-12 rounded-full bg-background/80 backdrop-blur-sm border border-border flex items-center justify-center hover:bg-accent transition-colors"
            >
              <ChevronRight className="h-6 w-6 text-foreground" />
            </button>
          )}
        </div>

        {/* Thumbnail strip */}
        {showThumbnails && (
          <div className="shrink-0 border-t border-border px-4 py-2 overflow-x-auto">
            <div className="flex gap-2 justify-center">
              {files.map((f, i) => (
                <button
                  key={f.id}
                  onClick={() => { setCurrentIndex(i); setZoom(1); setRotation(0); }}
                  className={`shrink-0 h-14 w-14 rounded-md overflow-hidden border-2 transition-all ${
                    i === currentIndex ? 'border-primary ring-1 ring-primary' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  {f.file_type?.startsWith('image/') ? (
                    <img src={f.file_url} alt={f.file_name} className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      {getFileIcon(f.file_type, "h-5 w-5")}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default FileViewer;
