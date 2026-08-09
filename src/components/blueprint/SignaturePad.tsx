import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Eraser, PenLine, Undo2 } from 'lucide-react';

interface SignaturePadProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  /** Called with a transparent PNG data URL of the drawn signature */
  onApply: (dataUrl: string) => void;
  color?: string;
  lineWidth?: number;
}

type Stroke = { x: number; y: number }[];

const WIDTH = 640;
const HEIGHT = 220;

/**
 * The Wonderlands signing tool — same freehand canvas used in the /files PDF
 * workstation, packaged for reuse on blueprint title blocks.
 */
export const SignaturePad: React.FC<SignaturePadProps> = ({
  open,
  onOpenChange,
  title = 'Sign',
  onApply,
  color = '#0f172a',
  lineWidth = 3,
}) => {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const [strokes, setStrokes] = React.useState<Stroke[]>([]);
  const [current, setCurrent] = React.useState<Stroke>([]);
  const drawing = React.useRef(false);

  const redraw = React.useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    [...strokes, current].forEach(stroke => {
      if (stroke.length < 2) return;
      ctx.beginPath();
      ctx.moveTo(stroke[0].x, stroke[0].y);
      stroke.slice(1).forEach(p => ctx.lineTo(p.x, p.y));
      ctx.stroke();
    });
  }, [strokes, current, color, lineWidth]);

  React.useEffect(() => {
    if (open) redraw();
  }, [open, redraw]);

  React.useEffect(() => {
    if (!open) {
      setStrokes([]);
      setCurrent([]);
    }
  }, [open]);

  const pointFrom = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * WIDTH,
      y: ((e.clientY - rect.top) / rect.height) * HEIGHT,
    };
  };

  const start = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    drawing.current = true;
    setCurrent([pointFrom(e)]);
  };

  const move = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    setCurrent(prev => [...prev, pointFrom(e)]);
  };

  const end = () => {
    if (!drawing.current) return;
    drawing.current = false;
    setCurrent(prev => {
      if (prev.length > 1) setStrokes(s => [...s, prev]);
      return [];
    });
  };

  const apply = () => {
    const canvas = canvasRef.current;
    if (!canvas || strokes.length === 0) return;
    onApply(canvas.toDataURL('image/png'));
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <PenLine className="h-4 w-4" /> {title}
          </DialogTitle>
        </DialogHeader>
        <div className="rounded-md border border-border bg-card p-2">
          <canvas
            ref={canvasRef}
            width={WIDTH}
            height={HEIGHT}
            onPointerDown={start}
            onPointerMove={move}
            onPointerUp={end}
            onPointerLeave={end}
            className="h-[220px] w-full touch-none rounded-sm bg-background"
          />
          <div className="mt-2 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">Draw the signature with a mouse, pen or finger.</p>
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" onClick={() => setStrokes(s => s.slice(0, -1))}>
                <Undo2 className="mr-1 h-3.5 w-3.5" /> Undo
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setStrokes([])}>
                <Eraser className="mr-1 h-3.5 w-3.5" /> Clear
              </Button>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={apply} disabled={strokes.length === 0}>
            Apply signature
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SignaturePad;
