import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { MoveVertical } from 'lucide-react';
import { PoolStair, StairShape } from './scene3d/types';

interface StairsControlsProps {
  stairs: PoolStair[];
  poolDepth: number;
  onStairsChange: (stairs: PoolStair[]) => void;
  onPlacementModeToggle: (active: boolean) => void;
  isPlacementMode: boolean;
  selectedStairId?: string | null;
}

export const StairsControls = ({
  stairs,
  poolDepth,
  onStairsChange,
  onPlacementModeToggle,
  isPlacementMode,
  selectedStairId
}: StairsControlsProps) => {
  const FLORIDA_STEP_HEIGHT = 0.625; // 7.5 inches in feet
  const DEFAULT_STEP_DEPTH = 0.9167; // 11 inches in feet

  const selectedStair = stairs.find(s => s.id === selectedStairId);

  const handleAddStairs = () => {
    onPlacementModeToggle(true);
  };

  const handleStairPropertyChange = (property: string, value: any) => {
    if (!selectedStair) return;
    
    const updatedStairs = stairs.map(stair =>
      stair.id === selectedStairId
        ? { ...stair, [property]: value }
        : stair
    );
    onStairsChange(updatedStairs);
  };

  const calculateRequiredSteps = (depth: number) => {
    return Math.ceil(depth / FLORIDA_STEP_HEIGHT);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MoveVertical className="h-4 w-4" />
          <h4 className="font-medium">Pool Stairs</h4>
        </div>
        <Button
          size="sm"
          variant={isPlacementMode ? "destructive" : "default"}
          onClick={() => onPlacementModeToggle(!isPlacementMode)}
        >
          {isPlacementMode ? 'Cancel' : 'Add Stairs'}
        </Button>
      </div>

      {isPlacementMode && (
        <div className="bg-muted/50 p-2 rounded text-xs">
          <p>Click on the blue line at the coping edge to place stairs. Press ESC to cancel.</p>
        </div>
      )}

      {selectedStair && (
        <>
          <Separator />
          <div className="space-y-3">
            <h5 className="text-sm font-medium">Stair Settings</h5>

            {/* Shape Selection */}
            <div className="space-y-2">
              <Label className="text-xs">Shape</Label>
              <Select
                value={selectedStair.shape}
                onValueChange={(value: StairShape) => handleStairPropertyChange('shape', value)}
              >
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rectangle">Rectangle</SelectItem>
                  <SelectItem value="square">Square</SelectItem>
                  <SelectItem value="rounded">Rounded</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Width Control */}
            <div className="space-y-2">
              <Label className="text-xs">Width: {selectedStair.width.toFixed(1)} ft</Label>
              <Slider
                value={[selectedStair.width]}
                onValueChange={([value]) => handleStairPropertyChange('width', value)}
                min={2}
                max={6}
                step={0.5}
                className="w-full"
              />
            </div>

            {/* Number of Steps */}
            <div className="space-y-2">
              <Label className="text-xs">
                Number of Steps: {selectedStair.numSteps} 
                <span className="text-muted-foreground ml-2">
                  (Recommended: {calculateRequiredSteps(poolDepth)})
                </span>
              </Label>
              <Slider
                value={[selectedStair.numSteps]}
                onValueChange={([value]) => handleStairPropertyChange('numSteps', value)}
                min={2}
                max={15}
                step={1}
                className="w-full"
              />
            </div>

            {/* Step Height */}
            <div className="space-y-2">
              <Label className="text-xs">
                Step Height: {(selectedStair.stepHeight * 12).toFixed(1)} inches
                <span className="text-muted-foreground ml-2">
                  (FL Standard: 7.5")
                </span>
              </Label>
              <Slider
                value={[selectedStair.stepHeight]}
                onValueChange={([value]) => handleStairPropertyChange('stepHeight', value)}
                min={0.5}
                max={1}
                step={0.0417} // 0.5 inch increments
                className="w-full"
              />
            </div>

            {/* Step Depth */}
            <div className="space-y-2">
              <Label className="text-xs">
                Step Depth: {(selectedStair.stepDepth * 12).toFixed(1)} inches
              </Label>
              <Slider
                value={[selectedStair.stepDepth]}
                onValueChange={([value]) => handleStairPropertyChange('stepDepth', value)}
                min={0.75}
                max={1.5}
                step={0.0833} // 1 inch increments
                className="w-full"
              />
            </div>

            {/* Remove Stairs Button */}
            <Button
              size="sm"
              variant="destructive"
              className="w-full"
              onClick={() => {
                const updatedStairs = stairs.filter(s => s.id !== selectedStairId);
                onStairsChange(updatedStairs);
              }}
            >
              Remove Stairs
            </Button>
          </div>
        </>
      )}

      {stairs.length === 0 && !isPlacementMode && (
        <p className="text-xs text-muted-foreground">
          No stairs added yet. Click "Add Stairs" to place stairs in your pool.
        </p>
      )}
    </div>
  );
};
