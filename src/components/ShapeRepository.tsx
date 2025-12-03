import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Save, FolderOpen, Trash2, Upload, Download, Shapes, Plus, Image, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { quickTracePoolShape, tracePoolShapeFromImage } from '@/utils/shapeTracing';

interface Point {
  x: number;
  y: number;
  id: string;
}

interface SavedShape {
  id: string;
  name: string;
  type: 'pool' | 'deck';
  points: Point[];
  createdAt: string;
  thumbnail?: string;
}

interface ShapeRepositoryProps {
  currentPoolPoints: Point[];
  currentDeckPoints: Point[];
  onLoadPoolShape: (points: Point[]) => void;
  onLoadDeckShape: (points: Point[]) => void;
  scale: number;
}

const STORAGE_KEY = 'pool-shape-repository';

export function ShapeRepository({
  currentPoolPoints,
  currentDeckPoints,
  onLoadPoolShape,
  onLoadDeckShape,
  scale
}: ShapeRepositoryProps) {
  const [savedShapes, setSavedShapes] = useState<SavedShape[]>([]);
  const [shapeName, setShapeName] = useState('');
  const [saveType, setSaveType] = useState<'pool' | 'deck'>('pool');
  const [isOpen, setIsOpen] = useState(false);
  const [isTracing, setIsTracing] = useState(false);
  const [useMLTracing, setUseMLTracing] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Load saved shapes from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setSavedShapes(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to load saved shapes:', e);
      }
    }
  }, []);

  // Save shapes to localStorage
  const persistShapes = (shapes: SavedShape[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(shapes));
    setSavedShapes(shapes);
  };

  // Generate simple SVG thumbnail
  const generateThumbnail = (points: Point[]): string => {
    if (points.length < 3) return '';
    
    const minX = Math.min(...points.map(p => p.x));
    const maxX = Math.max(...points.map(p => p.x));
    const minY = Math.min(...points.map(p => p.y));
    const maxY = Math.max(...points.map(p => p.y));
    
    const width = maxX - minX;
    const height = maxY - minY;
    const padding = 10;
    
    const normalizedPoints = points.map(p => ({
      x: ((p.x - minX) / width) * 80 + padding,
      y: ((p.y - minY) / height) * 80 + padding
    }));
    
    const pathData = normalizedPoints.map((p, i) => 
      `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
    ).join(' ') + ' Z';
    
    return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <path d="${pathData}" fill="rgba(46, 134, 171, 0.3)" stroke="#2E86AB" stroke-width="2"/>
    </svg>`;
  };

  // Save current shape
  const handleSaveShape = () => {
    const points = saveType === 'pool' ? currentPoolPoints : currentDeckPoints;
    
    if (points.length < 3) {
      toast.error('Need at least 3 points to save a shape');
      return;
    }
    
    if (!shapeName.trim()) {
      toast.error('Please enter a shape name');
      return;
    }
    
    // Normalize points (center at 0,0 and scale to 1ft = 1 unit)
    const minX = Math.min(...points.map(p => p.x));
    const maxX = Math.max(...points.map(p => p.x));
    const minY = Math.min(...points.map(p => p.y));
    const maxY = Math.max(...points.map(p => p.y));
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    
    const normalizedPoints: Point[] = points.map(p => ({
      x: (p.x - centerX) / scale,
      y: (p.y - centerY) / scale,
      id: p.id
    }));
    
    const newShape: SavedShape = {
      id: `shape-${Date.now()}`,
      name: shapeName.trim(),
      type: saveType,
      points: normalizedPoints,
      createdAt: new Date().toISOString(),
      thumbnail: generateThumbnail(points)
    };
    
    persistShapes([...savedShapes, newShape]);
    setShapeName('');
    toast.success(`${saveType === 'pool' ? 'Pool' : 'Deck'} shape saved!`);
  };

  // Load a saved shape
  const handleLoadShape = (shape: SavedShape) => {
    // Scale points back to current canvas scale and center
    const scaledPoints: Point[] = shape.points.map((p, i) => ({
      x: p.x * scale,
      y: p.y * scale,
      id: `${i + 1}`
    }));
    
    if (shape.type === 'pool') {
      onLoadPoolShape(scaledPoints);
    } else {
      onLoadDeckShape(scaledPoints);
    }
    
    setIsOpen(false);
    toast.success(`Loaded "${shape.name}"`);
  };

  // Delete a saved shape
  const handleDeleteShape = (id: string) => {
    persistShapes(savedShapes.filter(s => s.id !== id));
    toast.success('Shape deleted');
  };

  // Export shapes to JSON file
  const handleExportShapes = () => {
    const data = JSON.stringify(savedShapes, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pool-shapes.json';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Shapes exported');
  };

  // Import shapes from JSON file
  const handleImportShapes = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string) as SavedShape[];
        const newShapes = [...savedShapes, ...imported.map(s => ({
          ...s,
          id: `shape-${Date.now()}-${Math.random().toString(36).slice(2)}`
        }))];
        persistShapes(newShapes);
        toast.success(`Imported ${imported.length} shapes`);
      } catch (err) {
        toast.error('Failed to import shapes');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  // Import pool shape from image
  const handleImportFromImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    
    setIsTracing(true);
    toast.info('Analyzing pool shape from image...');
    
    try {
      const traceFn = useMLTracing ? tracePoolShapeFromImage : quickTracePoolShape;
      const result = await traceFn(file, scale);
      
      if (result.poolPoints.length < 3) {
        toast.error('Could not detect pool shape. Try a clearer image.');
        return;
      }
      
      // Load the traced pool shape
      onLoadPoolShape(result.poolPoints);
      
      // Show detection results
      let message = `Traced ${result.poolPoints.length} points`;
      if (result.stairsRegions.length > 0) {
        message += `, ${result.stairsRegions.length} potential stairs`;
      }
      if (result.seatingRegions.length > 0) {
        message += `, ${result.seatingRegions.length} potential seating areas`;
      }
      
      toast.success(message);
      setIsOpen(false);
    } catch (error) {
      console.error('Error tracing pool shape:', error);
      toast.error('Failed to trace pool shape from image');
    } finally {
      setIsTracing(false);
      event.target.value = '';
    }
  };

  const poolShapes = savedShapes.filter(s => s.type === 'pool');
  const deckShapes = savedShapes.filter(s => s.type === 'deck');

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Shapes className="h-4 w-4" />
          Shape Library
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shapes className="h-5 w-5" />
            Shape Repository
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Save Current Shape */}
          <div className="bg-muted/30 rounded-lg p-4 space-y-3">
            <Label className="text-sm font-semibold">Save Current Shape</Label>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={saveType === 'pool' ? 'default' : 'outline'}
                onClick={() => setSaveType('pool')}
              >
                Pool Shape
              </Button>
              <Button
                size="sm"
                variant={saveType === 'deck' ? 'default' : 'outline'}
                onClick={() => setSaveType('deck')}
              >
                Deck Shape
              </Button>
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Shape name..."
                value={shapeName}
                onChange={(e) => setShapeName(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleSaveShape} className="gap-2">
                <Save className="h-4 w-4" />
                Save
              </Button>
            </div>
          </div>

          {/* Import from Image */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-3">
            <Label className="text-sm font-semibold flex items-center gap-2">
              <Image className="h-4 w-4" />
              Import from Pool Image
            </Label>
            <p className="text-xs text-muted-foreground">
              Upload a pool image to automatically trace its shape. White backgrounds will be removed.
            </p>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={useMLTracing}
                  onChange={(e) => setUseMLTracing(e.target.checked)}
                  className="rounded"
                />
                Use ML (slower, more accurate)
              </label>
            </div>
            <div className="flex gap-2">
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                onChange={handleImportFromImage}
                className="hidden"
              />
              <Button 
                variant="default" 
                size="sm" 
                onClick={() => imageInputRef.current?.click()}
                disabled={isTracing}
                className="gap-2"
              >
                {isTracing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Tracing...
                  </>
                ) : (
                  <>
                    <Image className="h-4 w-4" />
                    Trace from Image
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Import/Export JSON */}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExportShapes} className="gap-2">
              <Download className="h-4 w-4" />
              Export All
            </Button>
            <label>
              <input
                type="file"
                accept=".json"
                onChange={handleImportShapes}
                className="hidden"
              />
              <Button variant="outline" size="sm" asChild className="gap-2 cursor-pointer">
                <span>
                  <Upload className="h-4 w-4" />
                  Import JSON
                </span>
              </Button>
            </label>
          </div>

          {/* Saved Shapes */}
          <ScrollArea className="h-[300px]">
            <div className="space-y-4">
              {/* Pool Shapes */}
              {poolShapes.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-muted-foreground">Pool Shapes</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {poolShapes.map((shape) => (
                      <div
                        key={shape.id}
                        className="border rounded-lg p-2 hover:bg-muted/50 cursor-pointer group relative"
                        onClick={() => handleLoadShape(shape)}
                      >
                        {shape.thumbnail && (
                          <div 
                            className="w-full h-16 mb-2"
                            dangerouslySetInnerHTML={{ __html: shape.thumbnail }}
                          />
                        )}
                        <p className="text-xs font-medium truncate">{shape.name}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {shape.points.length} points
                        </p>
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteShape(shape.id);
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Deck Shapes */}
              {deckShapes.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-muted-foreground">Deck Shapes</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {deckShapes.map((shape) => (
                      <div
                        key={shape.id}
                        className="border rounded-lg p-2 hover:bg-muted/50 cursor-pointer group relative"
                        onClick={() => handleLoadShape(shape)}
                      >
                        {shape.thumbnail && (
                          <div 
                            className="w-full h-16 mb-2"
                            dangerouslySetInnerHTML={{ __html: shape.thumbnail }}
                          />
                        )}
                        <p className="text-xs font-medium truncate">{shape.name}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {shape.points.length} points
                        </p>
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteShape(shape.id);
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {savedShapes.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Shapes className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No saved shapes yet</p>
                  <p className="text-xs">Save your pool or deck shapes to reuse them later</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
