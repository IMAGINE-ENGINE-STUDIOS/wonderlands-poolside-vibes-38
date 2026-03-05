import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Pen, Eraser, Save, Undo2,
} from 'lucide-react';

interface PdfViewerProps {
  fileUrl: string;
  fileName: string;
}

// Load pdf.js from CDN dynamically
const loadPdfJs = (() => {
  let promise: Promise<any> | null = null;
  return () => {
    if (promise) return promise;
    promise = new Promise((resolve, reject) => {
      if ((window as any).pdfjsLib) {
        resolve((window as any).pdfjsLib);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.2.67/pdf.min.mjs';
      script.type = 'module';
      // Use a different approach for module loading
      const script2 = document.createElement('script');
      script2.textContent = `
        import('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.2.67/pdf.min.mjs').then(mod => {
          window.pdfjsLib = mod;
          window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.2.67/pdf.worker.min.mjs';
          window.dispatchEvent(new Event('pdfjsLoaded'));
        }).catch(err => {
          window.dispatchEvent(new CustomEvent('pdfjsError', { detail: err }));
        });
      `;
      script2.type = 'module';
      document.head.appendChild(script2);
      
      const onLoad = () => {
        window.removeEventListener('pdfjsLoaded', onLoad);
        window.removeEventListener('pdfjsError', onError);
        resolve((window as any).pdfjsLib);
      };
      const onError = (e: any) => {
        window.removeEventListener('pdfjsLoaded', onLoad);
        window.removeEventListener('pdfjsError', onError);
        reject(e.detail || new Error('Failed to load PDF.js'));
      };
      window.addEventListener('pdfjsLoaded', onLoad);
      window.addEventListener('pdfjsError', onError);
    });
    return promise;
  };
})();

interface SignaturePath {
  points: { x: number; y: number }[];
  page: number;
  color: string;
  lineWidth: number;
}

const PdfViewer = ({ fileUrl, fileName }: PdfViewerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const signCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1.5);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [signingMode, setSigningMode] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signatures, setSignatures] = useState<SignaturePath[]>([]);
  const [currentPath, setCurrentPath] = useState<{ x: number; y: number }[]>([]);
  const [signColor] = useState('#1a1a2e');
  const [signLineWidth] = useState(2);

  // Load PDF
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    loadPdfJs()
      .then(async (pdfjsLib) => {
        if (cancelled) return;
        const doc = await pdfjsLib.getDocument({ url: fileUrl, cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.2.67/cmaps/', cMapPacked: true }).promise;
        if (cancelled) return;
        setPdfDoc(doc);
        setTotalPages(doc.numPages);
        setCurrentPage(1);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error('PDF load error:', err);
        setError('Failed to load PDF. Try downloading the file.');
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, [fileUrl]);

  // Render current page
  const renderPage = useCallback(async () => {
    if (!pdfDoc || !canvasRef.current) return;
    const page = await pdfDoc.getPage(currentPage);
    const viewport = page.getViewport({ scale });
    const canvas = canvasRef.current;
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d')!;
    await page.render({ canvasContext: ctx, viewport }).promise;

    // Re-draw signatures for this page
    if (signCanvasRef.current) {
      const sc = signCanvasRef.current;
      sc.width = viewport.width;
      sc.height = viewport.height;
      const sctx = sc.getContext('2d')!;
      sctx.clearRect(0, 0, sc.width, sc.height);
      signatures
        .filter(s => s.page === currentPage)
        .forEach(sig => {
          if (sig.points.length < 2) return;
          sctx.beginPath();
          sctx.strokeStyle = sig.color;
          sctx.lineWidth = sig.lineWidth;
          sctx.lineCap = 'round';
          sctx.lineJoin = 'round';
          sctx.moveTo(sig.points[0].x, sig.points[0].y);
          sig.points.forEach(p => sctx.lineTo(p.x, p.y));
          sctx.stroke();
        });
    }
  }, [pdfDoc, currentPage, scale, signatures]);

  useEffect(() => { renderPage(); }, [renderPage]);

  // Drawing handlers
  const getCanvasPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = signCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (!signingMode) return;
    e.preventDefault();
    setIsDrawing(true);
    const pos = getCanvasPos(e);
    setCurrentPath([pos]);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !signingMode || !signCanvasRef.current) return;
    e.preventDefault();
    const pos = getCanvasPos(e);
    setCurrentPath(prev => [...prev, pos]);

    // Draw live stroke
    const ctx = signCanvasRef.current.getContext('2d')!;
    const points = [...currentPath, pos];
    if (points.length >= 2) {
      ctx.beginPath();
      ctx.strokeStyle = signColor;
      ctx.lineWidth = signLineWidth;
      ctx.lineCap = 'round';
      ctx.moveTo(points[points.length - 2].x, points[points.length - 2].y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (currentPath.length > 1) {
      setSignatures(prev => [...prev, {
        points: currentPath,
        page: currentPage,
        color: signColor,
        lineWidth: signLineWidth,
      }]);
    }
    setCurrentPath([]);
  };

  const undoLastSignature = () => {
    setSignatures(prev => {
      const pageSignatures = prev.filter(s => s.page === currentPage);
      if (pageSignatures.length === 0) return prev;
      const lastSig = pageSignatures[pageSignatures.length - 1];
      return prev.filter(s => s !== lastSig);
    });
  };

  const clearPageSignatures = () => {
    setSignatures(prev => prev.filter(s => s.page !== currentPage));
  };

  // Save signed PDF (merge canvases and download as image per page)
  const saveSignedPdf = async () => {
    if (!canvasRef.current || !signCanvasRef.current) return;
    // Create a merged canvas
    const mergedCanvas = document.createElement('canvas');
    mergedCanvas.width = canvasRef.current.width;
    mergedCanvas.height = canvasRef.current.height;
    const ctx = mergedCanvas.getContext('2d')!;
    ctx.drawImage(canvasRef.current, 0, 0);
    ctx.drawImage(signCanvasRef.current, 0, 0);

    const link = document.createElement('a');
    link.download = `signed-${fileName.replace('.pdf', '')}-page${currentPage}.png`;
    link.href = mergedCanvas.toDataURL('image/png');
    link.click();
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
          <p className="text-sm text-muted-foreground">Loading PDF...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-destructive mb-2">{error}</p>
          <Button variant="outline" size="sm" onClick={() => window.open(fileUrl, '_blank')}>
            Open in new tab
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* PDF Toolbar */}
      <div className="flex items-center justify-center gap-2 px-3 py-1.5 bg-muted/40 border-b border-border shrink-0 flex-wrap">
        <Button variant="ghost" size="icon" className="h-7 w-7" disabled={currentPage <= 1} onClick={() => setCurrentPage(p => p - 1)}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-xs text-muted-foreground min-w-[80px] text-center">
          Page {currentPage} / {totalPages}
        </span>
        <Button variant="ghost" size="icon" className="h-7 w-7" disabled={currentPage >= totalPages} onClick={() => setCurrentPage(p => p + 1)}>
          <ChevronRight className="h-4 w-4" />
        </Button>

        <div className="h-4 w-px bg-border mx-1" />

        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setScale(s => Math.min(s + 0.25, 4))}>
          <ZoomIn className="h-4 w-4" />
        </Button>
        <span className="text-[10px] text-muted-foreground w-10 text-center">{Math.round(scale * 100)}%</span>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setScale(s => Math.max(s - 0.25, 0.5))}>
          <ZoomOut className="h-4 w-4" />
        </Button>

        <div className="h-4 w-px bg-border mx-1" />

        <Button
          variant={signingMode ? 'default' : 'ghost'}
          size="sm"
          className="h-7 text-xs gap-1"
          onClick={() => setSigningMode(!signingMode)}
        >
          <Pen className="h-3.5 w-3.5" />
          {signingMode ? 'Signing' : 'Sign'}
        </Button>

        {signingMode && (
          <>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={undoLastSignature} title="Undo last stroke">
              <Undo2 className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={clearPageSignatures} title="Clear page signatures">
              <Eraser className="h-3.5 w-3.5" />
            </Button>
            <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={saveSignedPdf}>
              <Save className="h-3.5 w-3.5" /> Save Page
            </Button>
          </>
        )}
      </div>

      {/* PDF Canvas area */}
      <div ref={containerRef} className="flex-1 overflow-auto flex items-start justify-center p-4 bg-muted/20">
        <div className="relative shadow-lg">
          <canvas ref={canvasRef} className="block" />
          <canvas
            ref={signCanvasRef}
            className={`absolute inset-0 ${signingMode ? 'cursor-crosshair' : 'pointer-events-none'}`}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
        </div>
      </div>
    </div>
  );
};

export default PdfViewer;
