import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Pen, Eraser, Save, Undo2, FileDown,
} from 'lucide-react';
import { jsPDF } from 'jspdf';

interface PdfViewerProps {
  fileUrl: string;
  fileName: string;
}

// Standard page formats in points (1 pt = 1/72 inch)
const PAGE_FORMATS: Record<string, { width: number; height: number; label: string }> = {
  letter: { width: 612, height: 792, label: 'Letter (8.5×11")' },
  legal: { width: 612, height: 1008, label: 'Legal (8.5×14")' },
  a4: { width: 595.28, height: 841.89, label: 'A4 (210×297mm)' },
  a5: { width: 419.53, height: 595.28, label: 'A5 (148×210mm)' },
  a3: { width: 841.89, height: 1190.55, label: 'A3 (297×420mm)' },
  tabloid: { width: 792, height: 1224, label: 'Tabloid (11×17")' },
};

const detectPageFormat = (widthPt: number, heightPt: number): string => {
  const w = Math.min(widthPt, heightPt);
  const h = Math.max(widthPt, heightPt);
  const TOLERANCE = 5;
  for (const [key, fmt] of Object.entries(PAGE_FORMATS)) {
    const fw = Math.min(fmt.width, fmt.height);
    const fh = Math.max(fmt.width, fmt.height);
    if (Math.abs(w - fw) < TOLERANCE && Math.abs(h - fh) < TOLERANCE) return key;
  }
  return 'custom';
};

const loadPdfJs = (() => {
  let promise: Promise<any> | null = null;
  return () => {
    if (promise) return promise;
    promise = new Promise((resolve, reject) => {
      if ((window as any).pdfjsLib) { resolve((window as any).pdfjsLib); return; }
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
      const onLoad = () => { window.removeEventListener('pdfjsLoaded', onLoad); window.removeEventListener('pdfjsError', onError); resolve((window as any).pdfjsLib); };
      const onError = (e: any) => { window.removeEventListener('pdfjsLoaded', onLoad); window.removeEventListener('pdfjsError', onError); reject(e.detail || new Error('Failed to load PDF.js')); };
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

const DPR = Math.max(window.devicePixelRatio || 1, 2);

const PdfViewer = ({ fileUrl, fileName }: PdfViewerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const signCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [userZoom, setUserZoom] = useState(1); // User-controlled zoom multiplier (1 = fit to container)
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signingMode, setSigningMode] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signatures, setSignatures] = useState<SignaturePath[]>([]);
  const [currentPath, setCurrentPath] = useState<{ x: number; y: number }[]>([]);
  const [signColor] = useState('#1a1a2e');
  const [signLineWidth] = useState(3);
  const [selectedFormat, setSelectedFormat] = useState<string>('auto');
  const [originalPageSizes, setOriginalPageSizes] = useState<{ width: number; height: number }[]>([]);
  const renderTaskRef = useRef<any>(null);
  const renderSeqRef = useRef(0);

  // Load PDF
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    loadPdfJs()
      .then(async (pdfjsLib) => {
        if (cancelled) return;
        const doc = await pdfjsLib.getDocument({
          url: fileUrl,
          cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.2.67/cmaps/',
          cMapPacked: true,
        }).promise;
        if (cancelled) return;
        setPdfDoc(doc);
        setTotalPages(doc.numPages);
        setCurrentPage(1);

        const sizes: { width: number; height: number }[] = [];
        for (let i = 1; i <= doc.numPages; i++) {
          const page = await doc.getPage(i);
          const vp = page.getViewport({ scale: 1 });
          sizes.push({ width: vp.width, height: vp.height });
        }
        setOriginalPageSizes(sizes);

        if (sizes.length > 0) {
          setSelectedFormat('auto');
        }

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

  // Calculate the scale that fits the selected preview format into the container
  const getFitScale = useCallback(() => {
    if (!containerRef.current || originalPageSizes.length === 0) return 1;
    const container = containerRef.current;
    const containerW = container.clientWidth - 32; // padding
    const containerH = container.clientHeight - 32;

    const original = originalPageSizes[currentPage - 1] || originalPageSizes[0];
    let previewW = original.width;
    let previewH = original.height;

    // Make format selector affect the live preview size (not only export)
    if (selectedFormat !== 'auto' && selectedFormat !== 'custom') {
      const fmt = PAGE_FORMATS[selectedFormat] || PAGE_FORMATS.a4;
      if (original.width > original.height) {
        previewW = Math.max(fmt.width, fmt.height);
        previewH = Math.min(fmt.width, fmt.height);
      } else {
        previewW = Math.min(fmt.width, fmt.height);
        previewH = Math.max(fmt.width, fmt.height);
      }
    }

    const scaleW = containerW / previewW;
    const scaleH = containerH / previewH;
    return Math.min(scaleW, scaleH, 2); // Cap at 2x for performance
  }, [originalPageSizes, currentPage, selectedFormat]);

  // The actual render scale = fitScale * userZoom
  const renderScale = getFitScale() * userZoom;

  // Render current page
  const renderPage = useCallback(async () => {
    if (!pdfDoc || !canvasRef.current || !containerRef.current || originalPageSizes.length === 0) return;

    const renderSeq = ++renderSeqRef.current;
    const page = await pdfDoc.getPage(currentPage);
    const scale = renderScale;
    const viewport = page.getViewport({ scale });
    const canvas = canvasRef.current;

    if (renderTaskRef.current) {
      try {
        renderTaskRef.current.cancel();
      } catch {
        // noop
      }
    }

    canvas.width = viewport.width * DPR;
    canvas.height = viewport.height * DPR;
    canvas.style.width = `${viewport.width}px`;
    canvas.style.height = `${viewport.height}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

    const task = page.render({ canvasContext: ctx, viewport });
    renderTaskRef.current = task;

    try {
      await task.promise;
    } catch (err: any) {
      if (err?.name === 'RenderingCancelledException') return;
      console.error('PDF render error:', err);
      return;
    }

    if (renderSeq !== renderSeqRef.current) return;

    if (signCanvasRef.current) {
      const sc = signCanvasRef.current;
      sc.width = viewport.width * DPR;
      sc.height = viewport.height * DPR;
      sc.style.width = `${viewport.width}px`;
      sc.style.height = `${viewport.height}px`;
      const sctx = sc.getContext('2d');
      if (!sctx) return;
      sctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      sctx.clearRect(0, 0, viewport.width, viewport.height);
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
  }, [pdfDoc, currentPage, renderScale, signatures, originalPageSizes.length]);

  useEffect(() => { renderPage(); }, [renderPage]);

  useEffect(() => () => {
    if (renderTaskRef.current) {
      try {
        renderTaskRef.current.cancel();
      } catch {
        // noop
      }
    }
  }, []);

  // Re-fit when container resizes
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(() => { renderPage(); });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [renderPage]);

  // Drawing handlers
  const getCanvasPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = signCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (!signingMode) return;
    e.preventDefault();
    setIsDrawing(true);
    setCurrentPath([getCanvasPos(e)]);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !signingMode || !signCanvasRef.current) return;
    e.preventDefault();
    const pos = getCanvasPos(e);
    setCurrentPath(prev => [...prev, pos]);
    const ctx = signCanvasRef.current.getContext('2d')!;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    const points = [...currentPath, pos];
    if (points.length >= 2) {
      ctx.beginPath();
      ctx.strokeStyle = signColor;
      ctx.lineWidth = signLineWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.moveTo(points[points.length - 2].x, points[points.length - 2].y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (currentPath.length > 1) {
      setSignatures(prev => [...prev, { points: currentPath, page: currentPage, color: signColor, lineWidth: signLineWidth }]);
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

  const getExportPageDims = (pageIndex: number) => {
    const orig = originalPageSizes[pageIndex] || originalPageSizes[0] || { width: 595.28, height: 841.89 };

    // Default = preserve exact original PDF page dimensions (no deformation)
    if (selectedFormat === 'auto' || selectedFormat === 'custom') {
      return { width: orig.width, height: orig.height };
    }

    const fmt = PAGE_FORMATS[selectedFormat] || PAGE_FORMATS.a4;
    if (orig.width > orig.height) {
      return { width: Math.max(fmt.width, fmt.height), height: Math.min(fmt.width, fmt.height) };
    }
    return { width: Math.min(fmt.width, fmt.height), height: Math.max(fmt.width, fmt.height) };
  };

  // Render a page + signatures to an offscreen canvas at a given scale, returns canvas
  const renderPageToCanvas = async (pageNum: number, exportScale: number) => {
    const page = await pdfDoc.getPage(pageNum);
    const viewport = page.getViewport({ scale: exportScale });
    const offCanvas = document.createElement('canvas');
    offCanvas.width = viewport.width;
    offCanvas.height = viewport.height;
    const offCtx = offCanvas.getContext('2d')!;
    await page.render({ canvasContext: offCtx, viewport }).promise;

    // Draw signatures scaled from display coords to export coords
    const pageSigs = signatures.filter(s => s.page === pageNum);
    if (pageSigs.length > 0) {
      const sigScale = exportScale / renderScale;
      pageSigs.forEach(sig => {
        if (sig.points.length < 2) return;
        offCtx.beginPath();
        offCtx.strokeStyle = sig.color;
        offCtx.lineWidth = sig.lineWidth * sigScale;
        offCtx.lineCap = 'round';
        offCtx.lineJoin = 'round';
        offCtx.moveTo(sig.points[0].x * sigScale, sig.points[0].y * sigScale);
        sig.points.forEach(p => offCtx.lineTo(p.x * sigScale, p.y * sigScale));
        offCtx.stroke();
      });
    }
    return offCanvas;
  };

  const addCanvasToPdfPage = (pdf: jsPDF, canvas: HTMLCanvasElement, pageDims: { width: number; height: number }) => {
    const imgData = canvas.toDataURL('image/jpeg', 0.92);
    const pW = pageDims.width;
    const pH = pageDims.height;
    const imgAspect = canvas.width / canvas.height;
    const pageAspect = pW / pH;

    let drawW: number, drawH: number, drawX: number, drawY: number;
    if (imgAspect > pageAspect) {
      drawW = pW;
      drawH = pW / imgAspect;
      drawX = 0;
      drawY = (pH - drawH) / 2;
    } else {
      drawH = pH;
      drawW = pH * imgAspect;
      drawX = (pW - drawW) / 2;
      drawY = 0;
    }
    pdf.addImage(imgData, 'JPEG', drawX, drawY, drawW, drawH);
    canvas.width = 0;
    canvas.height = 0;
  };

  const saveSignedPdf = async () => {
    if (!pdfDoc) return;
    setSaving(true);
    try {
      const EXPORT_SCALE = 2;
      const firstDims = getExportPageDims(0);
      const firstOrientation = firstDims.width > firstDims.height ? 'l' : 'p';

      const pdf = new jsPDF({
        orientation: firstOrientation as 'p' | 'l',
        unit: 'pt',
        format: [firstDims.width, firstDims.height],
      });

      for (let i = 1; i <= totalPages; i++) {
        const dims = getExportPageDims(i - 1);
        if (i > 1) {
          const orient = dims.width > dims.height ? 'l' : 'p';
          pdf.addPage([dims.width, dims.height], orient);
        }
        const canvas = await renderPageToCanvas(i, EXPORT_SCALE);
        addCanvasToPdfPage(pdf, canvas, dims);
      }

      pdf.save(`signed-${fileName}`);
    } catch (err) {
      console.error('PDF save error:', err);
    } finally {
      setSaving(false);
    }
  };

  const saveCurrentPage = async () => {
    if (!pdfDoc) return;
    setSaving(true);
    try {
      const EXPORT_SCALE = 2;
      const dims = getExportPageDims(currentPage - 1);
      const orientation = dims.width > dims.height ? 'l' : 'p';

      const pdf = new jsPDF({
        orientation: orientation as 'p' | 'l',
        unit: 'pt',
        format: [dims.width, dims.height],
      });

      const canvas = await renderPageToCanvas(currentPage, EXPORT_SCALE);
      addCanvasToPdfPage(pdf, canvas, dims);
      pdf.save(`signed-${fileName.replace('.pdf', '')}-page${currentPage}.pdf`);
    } catch (err) {
      console.error('PDF save error:', err);
    } finally {
      setSaving(false);
    }
  };

  const firstPage = originalPageSizes[0];
  const detectedFormat = firstPage ? detectPageFormat(firstPage.width, firstPage.height) : 'custom';
  const formatLabel = detectedFormat === 'custom'
    ? `${Math.round(firstPage?.width || 0)}×${Math.round(firstPage?.height || 0)}pt`
    : PAGE_FORMATS[detectedFormat]?.label || 'Original';

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

        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setUserZoom(z => Math.min(z + 0.25, 4))}>
          <ZoomIn className="h-4 w-4" />
        </Button>
        <span className="text-[10px] text-muted-foreground w-10 text-center">{Math.round(userZoom * 100)}%</span>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setUserZoom(z => Math.max(z - 0.25, 0.5))}>
          <ZoomOut className="h-4 w-4" />
        </Button>

        <div className="h-4 w-px bg-border mx-1" />

        {/* Export + preview format selector */}
        <Select value={selectedFormat} onValueChange={setSelectedFormat}>
          <SelectTrigger className="h-7 w-[150px] text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="auto">Auto (Original: {formatLabel})</SelectItem>
            {Object.entries(PAGE_FORMATS).map(([key, val]) => (
              <SelectItem key={key} value={key}>{val.label}</SelectItem>
            ))}
            <SelectItem value="custom">Original Size</SelectItem>
          </SelectContent>
        </Select>

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
            <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={saveCurrentPage} disabled={saving}>
              <Save className="h-3.5 w-3.5" /> {saving ? 'Saving...' : 'Save Page'}
            </Button>
            <Button variant="default" size="sm" className="h-7 text-xs gap-1" onClick={saveSignedPdf} disabled={saving}>
              <FileDown className="h-3.5 w-3.5" /> {saving ? 'Saving...' : 'Save All'}
            </Button>
          </>
        )}
      </div>

      {/* PDF Canvas area */}
      <div ref={containerRef} className="flex-1 overflow-auto flex items-start justify-center p-4 bg-muted/20 min-h-0">
        <div className="relative shadow-lg" style={{ lineHeight: 0 }}>
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
