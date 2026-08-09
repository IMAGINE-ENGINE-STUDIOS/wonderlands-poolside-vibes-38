import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eraser, PenLine, Undo2, Type, Upload } from 'lucide-react';
import { toast } from 'sonner';

interface SignaturePadProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  /** Called with a transparent PNG data URL of the signature */
  onApply: (dataUrl: string) => void;
  color?: string;
  lineWidth?: number;
}

type Stroke = { x: number; y: number }[];

const WIDTH = 640;
const HEIGHT = 220;

/** Script styles offered for a typed signature */
const TYPED_FONTS: { id: string; label: string; stack: string; size: number }[] = [
  { id: 'script', label: 'Script', stack: '"Segoe Script", "Brush Script MT", cursive', size: 74 },
  { id: 'formal', label: 'Formal italic', stack: 'Georgia, "Times New Roman", serif', size: 64 },
  { id: 'engineer', label: 'Engineering block', stack: '"Courier New", ui-monospace, monospace', size: 52 },
];

/**
 * The Wonderlands signing tool — the freehand canvas used in the /files PDF
 * workstation, plus typed and uploaded signature options for blueprint title
 * blocks. All three paths produce a PNG data URL.
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
  const typedCanvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const fileRef = React.useRef<HTMLInputElement | null>(null);
  const [strokes, setStrokes] = React.useState<Stroke[]>([]);
  const [current, setCurrent] = React.useState<Stroke>([]);
  const [mode, setMode] = React.useState<'draw' | 'type' | 'upload'>('draw');
  const [typedName, setTypedName] = React.useState('');
  const [fontId, setFontId] = React.useState(TYPED_FONTS[0].id);
  const [uploaded, setUploaded] = React.useState<string | null>(null);
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
    if (open && mode === 'draw') redraw();
  }, [open, mode, redraw]);

  // Render the typed signature preview
  const renderTyped = React.useCallback(() => {
    const canvas = typedCanvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const font = TYPED_FONTS.find(f => f.id === fontId) || TYPED_FONTS[0];
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!typedName.trim()) return;
    let size = font.size;
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const italic = font.id === 'formal' ? 'italic ' : '';
    // shrink to fit the plate
    do {
      ctx.font = `${italic}${size}px ${font.stack}`;
      size -= 2;
    } while (ctx.measureText(typedName).width > WIDTH - 60 && size > 16);
    ctx.fillText(typedName, WIDTH / 2, HEIGHT / 2 - 8);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(40, HEIGHT - 46);
    ctx.lineTo(WIDTH - 40, HEIGHT - 46);
    ctx.stroke();
  }, [typedName, fontId, color]);

  React.useEffect(() => {
    if (open && mode === 'type') renderTyped();
  }, [open, mode, renderTyped]);

  React.useEffect(() => {
    if (!open) {
      setStrokes([]);
      setCurrent([]);
      setTypedName('');
      setUploaded(null);
      setMode('draw');
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

  const handleUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Upload a PNG, JPG or SVG image of the signature.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setUploaded(String(reader.result));
    reader.onerror = () => toast.error('Could not read that image.');
    reader.readAsDataURL(file);
  };

  const canApply = mode === 'draw' ? strokes.length > 0 : mode === 'type' ? typedName.trim().length > 0 : !!uploaded;

  const apply = () => {
    if (mode === 'upload') {
      if (!uploaded) return;
      onApply(uploaded);
      onOpenChange(false);
      return;
    }
    const canvas = mode === 'draw' ? canvasRef.current : typedCanvasRef.current;
    if (!canvas || !canApply) return;
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

        <Tabs value={mode} onValueChange={v => setMode(v as typeof mode)}>
          <TabsList>
            <TabsTrigger value="draw">
              <PenLine className="mr-1 h-3.5 w-3.5" /> Draw
            </TabsTrigger>
            <TabsTrigger value="type">
              <Type className="mr-1 h-3.5 w-3.5" /> Type
            </TabsTrigger>
            <TabsTrigger value="upload">
              <Upload className="mr-1 h-3.5 w-3.5" /> Upload
            </TabsTrigger>
          </TabsList>

          <TabsContent value="draw" className="mt-3">
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
          </TabsContent>

          <TabsContent value="type" className="mt-3">
            <div className="space-y-2 rounded-md border border-border bg-card p-2">
              <Input
                value={typedName}
                onChange={e => setTypedName(e.target.value)}
                placeholder="Type the full legal name to sign"
                className="h-9"
              />
              <div className="flex flex-wrap gap-1.5">
                {TYPED_FONTS.map(f => (
                  <Button
                    key={f.id}
                    type="button"
                    size="sm"
                    variant={fontId === f.id ? 'default' : 'outline'}
                    onClick={() => setFontId(f.id)}
                  >
                    {f.label}
                  </Button>
                ))}
              </div>
              <canvas
                ref={typedCanvasRef}
                width={WIDTH}
                height={HEIGHT}
                className="h-[220px] w-full rounded-sm bg-background"
              />
              <p className="text-xs text-muted-foreground">
                Typing your name and applying it counts as your electronic signature on this document.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="upload" className="mt-3">
            <div
              onDragOver={e => e.preventDefault()}
              onDrop={e => {
                e.preventDefault();
                const file = e.dataTransfer.files?.[0];
                if (file) handleUpload(file);
              }}
              className="space-y-3 rounded-md border border-dashed border-border bg-card p-4 text-center"
            >
              {uploaded ? (
                <img
                  src={uploaded}
                  alt="Uploaded signature preview"
                  loading="lazy"
                  className="mx-auto max-h-[200px] w-auto rounded-sm bg-background object-contain p-2"
                />
              ) : (
                <div className="flex flex-col items-center gap-2 py-8">
                  <Upload className="h-6 w-6 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Drop a scanned signature or digital signature image here (PNG with transparency works best).
                  </p>
                </div>
              )}
              <div className="flex justify-center gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
                  Choose image
                </Button>
                {uploaded ? (
                  <Button type="button" variant="ghost" size="sm" onClick={() => setUploaded(null)}>
                    <Eraser className="mr-1 h-3.5 w-3.5" /> Remove
                  </Button>
                ) : null}
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) handleUpload(file);
                  e.target.value = '';
                }}
              />
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={apply} disabled={!canApply}>
            Apply signature
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SignaturePad;
