import * as React from 'react';
const { useState, useEffect, useCallback } = React;
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { PenTool, Plus, Upload, Square, Circle, Spline, CornerDownRight, Check, X, Edit3, Ruler, Trash2, Waves, Droplets } from 'lucide-react';

interface Point {
  x: number;
  y: number;
  id: string;
}

interface SplinePoint extends Point {
  curveType: 'linear' | 'curve' | 'arc';
  handleIn?: { x: number; y: number };
  handleOut?: { x: number; y: number };
}

interface ShapePanelProps {
  poolShape: 'rectangle' | 'kidney' | 'freeform';
  setPoolShape: (shape: 'rectangle' | 'kidney' | 'freeform') => void;
  points: Point[];
  setPoints: (points: Point[]) => void;
  activeTool: string | null;
  setActiveTool: (tool: any) => void;
  onShapeSelect: (shape: 'rectangle' | 'kidney' | 'freeform') => void;
  isDrawing: boolean;
  drawingPoints: Point[];
  splineDrawing?: {
    isActive: boolean;
    points: SplinePoint[];
    currentCurveType: 'linear' | 'curve' | 'arc';
  };
  onSplineDrawingChange?: (data: { 
    isActive: boolean; 
    points: SplinePoint[]; 
    currentCurveType: 'linear' | 'curve' | 'arc';
  }) => void;
  onFinishSpline?: () => void;
  onCancelSpline?: () => void;
  poolDimensions?: { width: number; length: number; area: number; perimeter: number };
  onAddNewPool?: (type: 'pool' | 'spa') => void;
  poolCount?: number;
}

const presetShapes = [
  { 
    id: 'rectangle', 
    name: 'Rectangle',
    icon: (
      <svg className="w-full h-full" viewBox="0 0 48 32" fill="none">
        <rect x="4" y="4" width="40" height="24" rx="2" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.1" />
      </svg>
    )
  },
  { 
    id: 'kidney', 
    name: 'Kidney',
    icon: (
      <svg className="w-full h-full" viewBox="0 0 48 32" fill="none">
        <path d="M8 16c0-8 6-12 16-12s16 4 16 12-6 12-16 12c-6 0-10-2-12-6-2 4-6 6-12 6" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.1" />
      </svg>
    )
  },
  { 
    id: 'freeform', 
    name: 'Lagoon',
    icon: (
      <svg className="w-full h-full" viewBox="0 0 48 32" fill="none">
        <path d="M6 16c4-8 10-12 18-10s14 8 18 16c-6 4-12 6-18 4s-12-6-18-10z" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.1" />
      </svg>
    )
  },
];

export function ShapePanel({
  poolShape,
  setPoolShape,
  points,
  setPoints,
  activeTool,
  setActiveTool,
  onShapeSelect,
  isDrawing,
  drawingPoints,
  splineDrawing,
  onSplineDrawingChange,
  onFinishSpline,
  onCancelSpline,
  poolDimensions,
  onAddNewPool,
  poolCount = 1,
}: ShapePanelProps) {
  const [showCadDialog, setShowCadDialog] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  const isSplineActive = splineDrawing?.isActive || activeTool === 'draw-pool';
  const currentCurveType = splineDrawing?.currentCurveType || 'linear';
  const splinePoints = splineDrawing?.points || [];

  const handleCurveTypeChange = (type: 'linear' | 'curve' | 'arc') => {
    if (onSplineDrawingChange && splineDrawing) {
      onSplineDrawingChange({
        ...splineDrawing,
        currentCurveType: type,
      });
    }
  };

  const handleCadUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Handle CAD file import (DXF, DWG, SVG)
      console.log('CAD file uploaded:', file.name);
      // TODO: Parse CAD file and convert to pool points
      setShowCadDialog(false);
    }
  };

  const startDrawMode = () => {
    setActiveTool('draw-pool');
    if (onSplineDrawingChange) {
      onSplineDrawingChange({
        isActive: true,
        points: [],
        currentCurveType: 'linear',
      });
    }
  };

  const cancelDrawMode = () => {
    setActiveTool(null);
    if (onCancelSpline) {
      onCancelSpline();
    }
    if (onSplineDrawingChange) {
      onSplineDrawingChange({
        isActive: false,
        points: [],
        currentCurveType: 'linear',
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Label className="text-sm font-semibold text-foreground">Pool Shape</Label>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0"
                onClick={() => fileInputRef.current?.click()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Import CAD file or shape</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <input
          ref={fileInputRef}
          type="file"
          accept=".dxf,.dwg,.svg"
          className="hidden"
          onChange={handleCadUpload}
        />
      </div>

      {/* Preset Shapes - Compact Grid */}
      {!isSplineActive && (
        <div className="grid grid-cols-3 gap-2">
          {presetShapes.map((shape) => (
            <button
              key={shape.id}
              onClick={() => onShapeSelect(shape.id as 'rectangle' | 'kidney' | 'freeform')}
              className={`
                relative group p-2 rounded-lg border-2 transition-all duration-200
                hover:border-primary/50 hover:bg-primary/5
                ${poolShape === shape.id 
                  ? 'border-primary bg-primary/10 shadow-sm' 
                  : 'border-border/50 bg-muted/20'
                }
              `}
            >
              <div className={`
                w-full h-8 flex items-center justify-center
                ${poolShape === shape.id ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}
              `}>
                {shape.icon}
              </div>
              <span className={`
                block text-[10px] mt-1 text-center font-medium
                ${poolShape === shape.id ? 'text-primary' : 'text-muted-foreground'}
              `}>
                {shape.name}
              </span>
              {poolShape === shape.id && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 text-primary-foreground" />
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Draw Custom Shape */}
      {!isSplineActive ? (
        <button
          onClick={startDrawMode}
          className="w-full group flex items-center gap-3 p-3 rounded-lg border-2 border-dashed border-border/60 hover:border-primary/50 hover:bg-primary/5 transition-all"
        >
          <div className="w-10 h-10 rounded-lg bg-muted/50 group-hover:bg-primary/10 flex items-center justify-center transition-colors">
            <PenTool className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-foreground">Draw Custom</p>
            <p className="text-xs text-muted-foreground">Trace spline to create any shape</p>
          </div>
        </button>
      ) : (
        /* Spline Drawing Mode UI */
        <div className="space-y-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
          {/* Mode Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center animate-pulse">
                <PenTool className="w-3 h-3 text-primary" />
              </div>
              <span className="text-sm font-medium text-primary">Drawing Mode</span>
            </div>
            <Badge variant="secondary" className="text-xs">
              {splinePoints.length} points
            </Badge>
          </div>

          {/* Curve Type Selector */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Next segment type:</Label>
            <div className="grid grid-cols-3 gap-1.5">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => handleCurveTypeChange('linear')}
                      className={`
                        flex flex-col items-center gap-1 p-2 rounded-md border transition-all
                        ${currentCurveType === 'linear' 
                          ? 'border-primary bg-primary/10 text-primary' 
                          : 'border-border/50 text-muted-foreground hover:border-primary/30 hover:text-foreground'
                        }
                      `}
                    >
                      <CornerDownRight className="w-4 h-4" />
                      <span className="text-[10px] font-medium">Straight</span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Straight line segment</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => handleCurveTypeChange('curve')}
                      className={`
                        flex flex-col items-center gap-1 p-2 rounded-md border transition-all
                        ${currentCurveType === 'curve' 
                          ? 'border-primary bg-primary/10 text-primary' 
                          : 'border-border/50 text-muted-foreground hover:border-primary/30 hover:text-foreground'
                        }
                      `}
                    >
                      <Spline className="w-4 h-4" />
                      <span className="text-[10px] font-medium">Curve</span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Smooth bezier curve</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => handleCurveTypeChange('arc')}
                      className={`
                        flex flex-col items-center gap-1 p-2 rounded-md border transition-all
                        ${currentCurveType === 'arc' 
                          ? 'border-primary bg-primary/10 text-primary' 
                          : 'border-border/50 text-muted-foreground hover:border-primary/30 hover:text-foreground'
                        }
                      `}
                    >
                      <Circle className="w-4 h-4" />
                      <span className="text-[10px] font-medium">Arc</span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Circular arc segment</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          {/* Instructions */}
          <div className="text-xs text-muted-foreground space-y-1 bg-background/50 rounded-md p-2">
            <p>• Click on canvas to add points</p>
            <p>• Connect last point to first to finish</p>
            <p>• Press <kbd className="px-1 py-0.5 bg-muted rounded text-[10px]">Enter</kbd> to complete</p>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              className="flex-1 h-8"
              onClick={cancelDrawMode}
            >
              <X className="w-3.5 h-3.5 mr-1" />
              Cancel
            </Button>
            {splinePoints.length >= 3 && (
              <Button
                size="sm"
                className="flex-1 h-8"
                onClick={onFinishSpline}
              >
                <Check className="w-3.5 h-3.5 mr-1" />
                Complete
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Pool Dimensions Display (when not drawing) */}
      {!isSplineActive && poolDimensions && (
        <div className="p-3 rounded-lg bg-muted/30 border border-border/30">
          <div className="flex items-center gap-2 mb-2">
            <Ruler className="w-3.5 h-3.5 text-muted-foreground" />
            <Label className="text-xs font-medium text-muted-foreground">Dimensions</Label>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-muted-foreground text-xs">Width:</span>
              <span className="ml-1 font-medium">{poolDimensions.width.toFixed(1)}'</span>
            </div>
            <div>
              <span className="text-muted-foreground text-xs">Length:</span>
              <span className="ml-1 font-medium">{poolDimensions.length.toFixed(1)}'</span>
            </div>
            <div>
              <span className="text-muted-foreground text-xs">Area:</span>
              <span className="ml-1 font-medium">{poolDimensions.area.toFixed(0)} sq ft</span>
            </div>
            <div>
              <span className="text-muted-foreground text-xs">Perimeter:</span>
              <span className="ml-1 font-medium">{poolDimensions.perimeter.toFixed(1)}'</span>
            </div>
          </div>
          
          {/* Edit Shape Button */}
          <Button
            variant="ghost"
            size="sm"
            className="w-full mt-2 h-7 text-xs"
            onClick={() => setActiveTool('select')}
          >
            <Edit3 className="w-3 h-3 mr-1" />
            Edit Control Points
          </Button>
        </div>
      )}

      {/* Add New Pool/Spa Section */}
      {!isSplineActive && onAddNewPool && (
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground">Add to Scene</Label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onAddNewPool('pool')}
              className="group flex flex-col items-center gap-1.5 p-3 rounded-lg border border-dashed border-border/60 hover:border-primary/50 hover:bg-primary/5 transition-all"
            >
              <Waves className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground">+ Pool</span>
            </button>
            <button
              onClick={() => onAddNewPool('spa')}
              className="group flex flex-col items-center gap-1.5 p-3 rounded-lg border border-dashed border-border/60 hover:border-primary/50 hover:bg-primary/5 transition-all"
            >
              <Droplets className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground">+ Spa</span>
            </button>
          </div>
          {poolCount > 1 && (
            <p className="text-[10px] text-muted-foreground text-center">
              {poolCount} water features in scene
            </p>
          )}
        </div>
      )}
    </div>
  );
}
