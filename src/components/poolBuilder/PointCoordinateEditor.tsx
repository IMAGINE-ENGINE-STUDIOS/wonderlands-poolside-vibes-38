import * as React from 'react';
const { useState, useEffect, useCallback } = React;
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, Ruler } from 'lucide-react';

interface PointCoordinateEditorProps {
  /** Point position in pixels */
  pointX: number;
  pointY: number;
  /** Canvas center (origin) in pixels */
  centerX: number;
  centerY: number;
  /** Pixels per foot */
  scale: number;
  /** Label like "Point 3" or "Deck P2" */
  label: string;
  /** Previous point for distance calc (optional) */
  prevPoint?: { x: number; y: number } | null;
  /** Next point for distance calc (optional) */
  nextPoint?: { x: number; y: number } | null;
  /** Called with new pixel coordinates */
  onPositionChange: (x: number, y: number) => void;
}

export function PointCoordinateEditor({
  pointX,
  pointY,
  centerX,
  centerY,
  scale,
  label,
  prevPoint,
  nextPoint,
  onPositionChange,
}: PointCoordinateEditorProps) {
  // Convert pixels to feet relative to center
  const toFeetX = (px: number) => +((px - centerX) / scale).toFixed(2);
  const toFeetY = (py: number) => +((py - centerY) / scale).toFixed(2);
  const toPxX = (ft: number) => centerX + ft * scale;
  const toPxY = (ft: number) => centerY + ft * scale;

  const [xFt, setXFt] = useState(toFeetX(pointX).toString());
  const [yFt, setYFt] = useState(toFeetY(pointY).toString());
  const [distPrev, setDistPrev] = useState('');
  const [distNext, setDistNext] = useState('');

  // Sync when external point moves (drag)
  useEffect(() => {
    setXFt(toFeetX(pointX).toString());
    setYFt(toFeetY(pointY).toString());
  }, [pointX, pointY, centerX, centerY, scale]);

  // Calculate distances
  const calcDist = (ax: number, ay: number, bx: number, by: number) => {
    const dx = (bx - ax) / scale;
    const dy = (by - ay) / scale;
    return Math.sqrt(dx * dx + dy * dy);
  };

  useEffect(() => {
    if (prevPoint) setDistPrev(calcDist(prevPoint.x, prevPoint.y, pointX, pointY).toFixed(2));
    if (nextPoint) setDistNext(calcDist(pointX, pointY, nextPoint.x, nextPoint.y).toFixed(2));
  }, [pointX, pointY, prevPoint, nextPoint, scale]);

  const commitX = useCallback(() => {
    const val = parseFloat(xFt);
    if (!isNaN(val)) onPositionChange(toPxX(val), pointY);
  }, [xFt, pointY]);

  const commitY = useCallback(() => {
    const val = parseFloat(yFt);
    if (!isNaN(val)) onPositionChange(pointX, toPxY(val));
  }, [yFt, pointX]);

  const commitDistPrev = useCallback(() => {
    if (!prevPoint) return;
    const targetDist = parseFloat(distPrev);
    if (isNaN(targetDist) || targetDist <= 0) return;
    const dx = pointX - prevPoint.x;
    const dy = pointY - prevPoint.y;
    const currentDist = Math.sqrt(dx * dx + dy * dy);
    if (currentDist === 0) return;
    const ratio = (targetDist * scale) / currentDist;
    const newX = prevPoint.x + dx * ratio;
    const newY = prevPoint.y + dy * ratio;
    onPositionChange(newX, newY);
  }, [distPrev, prevPoint, pointX, pointY, scale]);

  const commitDistNext = useCallback(() => {
    if (!nextPoint) return;
    const targetDist = parseFloat(distNext);
    if (isNaN(targetDist) || targetDist <= 0) return;
    const dx = pointX - nextPoint.x;
    const dy = pointY - nextPoint.y;
    const currentDist = Math.sqrt(dx * dx + dy * dy);
    if (currentDist === 0) return;
    const ratio = (targetDist * scale) / currentDist;
    const newX = nextPoint.x + dx * ratio;
    const newY = nextPoint.y + dy * ratio;
    onPositionChange(newX, newY);
  }, [distNext, nextPoint, pointX, pointY, scale]);

  const handleKey = (e: React.KeyboardEvent, commit: () => void) => {
    if (e.key === 'Enter') commit();
  };

  return (
    <div className="flex items-center gap-2 p-1.5 bg-background/95 backdrop-blur border border-border rounded-lg shadow-lg">
      {/* Label */}
      <span className="text-[10px] font-semibold text-primary px-1.5 py-0.5 bg-primary/10 rounded whitespace-nowrap">
        {label}
      </span>
      <div className="w-px h-5 bg-border" />

      {/* X coordinate */}
      <div className="flex items-center gap-1">
        <Label className="text-[10px] text-muted-foreground font-medium">X</Label>
        <Input
          type="number"
          step="0.5"
          value={xFt}
          onChange={e => setXFt(e.target.value)}
          onBlur={commitX}
          onKeyDown={e => handleKey(e, commitX)}
          className="h-6 w-16 text-xs px-1.5 text-center"
        />
        <span className="text-[9px] text-muted-foreground">ft</span>
      </div>

      {/* Y coordinate */}
      <div className="flex items-center gap-1">
        <Label className="text-[10px] text-muted-foreground font-medium">Y</Label>
        <Input
          type="number"
          step="0.5"
          value={yFt}
          onChange={e => setYFt(e.target.value)}
          onBlur={commitY}
          onKeyDown={e => handleKey(e, commitY)}
          className="h-6 w-16 text-xs px-1.5 text-center"
        />
        <span className="text-[9px] text-muted-foreground">ft</span>
      </div>

      {/* Distance to prev */}
      {prevPoint && (
        <>
          <div className="w-px h-5 bg-border" />
          <div className="flex items-center gap-1">
            <Ruler className="w-3 h-3 text-muted-foreground" />
            <Label className="text-[9px] text-muted-foreground">prev</Label>
            <Input
              type="number"
              step="0.5"
              value={distPrev}
              onChange={e => setDistPrev(e.target.value)}
              onBlur={commitDistPrev}
              onKeyDown={e => handleKey(e, commitDistPrev)}
              className="h-6 w-14 text-xs px-1.5 text-center"
            />
            <span className="text-[9px] text-muted-foreground">ft</span>
          </div>
        </>
      )}

      {/* Distance to next */}
      {nextPoint && (
        <div className="flex items-center gap-1">
          <Label className="text-[9px] text-muted-foreground">next</Label>
          <Input
            type="number"
            step="0.5"
            value={distNext}
            onChange={e => setDistNext(e.target.value)}
            onBlur={commitDistNext}
            onKeyDown={e => handleKey(e, commitDistNext)}
            className="h-6 w-14 text-xs px-1.5 text-center"
          />
          <span className="text-[9px] text-muted-foreground">ft</span>
        </div>
      )}
    </div>
  );
}
