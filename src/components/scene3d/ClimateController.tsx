import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Sun, Moon, X } from 'lucide-react';

interface ClimateControllerProps {
  isOpen: boolean;
  onClose: () => void;
  isNightMode: boolean;
  onNightModeChange: (isNight: boolean) => void;
  sunAngle: number; // 0-180 degrees (0 = sunrise, 90 = noon, 180 = sunset)
  onSunAngleChange: (angle: number) => void;
  onSunPositionChange: (position: [number, number, number]) => void;
}

export function ClimateController({
  isOpen,
  onClose,
  isNightMode,
  onNightModeChange,
  sunAngle,
  onSunAngleChange,
  onSunPositionChange
}: ClimateControllerProps) {
  if (!isOpen) return null;

  const handleSunAngleChange = (angle: number) => {
    onSunAngleChange(angle);
    
    // Calculate sun position based on angle (0-180 = sunrise to sunset arc)
    const radians = (angle * Math.PI) / 180;
    const radius = 100;
    const x = Math.cos(radians) * radius;
    const y = Math.sin(radians) * radius;
    const z = 50;
    
    onSunPositionChange([x, Math.max(5, y), z]);
  };

  const getTimeOfDay = (angle: number): string => {
    if (angle < 30) return 'Early Morning';
    if (angle < 60) return 'Morning';
    if (angle < 90) return 'Late Morning';
    if (angle < 100) return 'Noon';
    if (angle < 130) return 'Afternoon';
    if (angle < 160) return 'Late Afternoon';
    return 'Evening';
  };

  return (
    <div className="fixed right-4 top-1/2 -translate-y-1/2 w-72 bg-background/98 backdrop-blur-md border border-border rounded-xl shadow-2xl z-40 animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2">
          {isNightMode ? <Moon className="w-4 h-4 text-blue-400" /> : <Sun className="w-4 h-4 text-yellow-500" />}
          <h3 className="font-semibold text-base">Climate Controls</h3>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6">
        {/* Day/Night Toggle */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold">Time Mode</Label>
          <div className="flex gap-2">
            <Button
              variant={!isNightMode ? 'default' : 'outline'}
              className="flex-1 gap-2"
              onClick={() => onNightModeChange(false)}
            >
              <Sun className="w-4 h-4" />
              Day
            </Button>
            <Button
              variant={isNightMode ? 'default' : 'outline'}
              className="flex-1 gap-2"
              onClick={() => onNightModeChange(true)}
            >
              <Moon className="w-4 h-4" />
              Night
            </Button>
          </div>
        </div>

        {/* Sun Angle (only for day mode) */}
        {!isNightMode && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold">Sun Position</Label>
              <span className="text-xs text-muted-foreground">{getTimeOfDay(sunAngle)}</span>
            </div>
            <Slider
              value={[sunAngle]}
              onValueChange={(value) => handleSunAngleChange(value[0])}
              min={10}
              max={170}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>🌅 Sunrise</span>
              <span>☀️ Noon</span>
              <span>🌇 Sunset</span>
            </div>
          </div>
        )}

        {/* Night Mode Info */}
        {isNightMode && (
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
            <p className="text-xs text-foreground">
              <strong>Night Mode Active</strong>
            </p>
            <ul className="text-xs text-muted-foreground mt-1 space-y-1">
              <li>• Moonlight illumination</li>
              <li>• Pool lights turned on</li>
              <li>• Ambient night atmosphere</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
