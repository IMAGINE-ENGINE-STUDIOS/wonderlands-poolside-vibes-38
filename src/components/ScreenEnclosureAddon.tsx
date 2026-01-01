
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Grid3X3 } from "lucide-react";

interface ScreenEnclosureAddonProps {
  isSelected: boolean;
  onToggle: (selected: boolean) => void;
  area: number;
  onAreaChange: (area: number) => void;
  quality: 'standard' | 'deluxe' | 'premium';
  onQualityChange: (quality: 'standard' | 'deluxe' | 'premium') => void;
  calculatePrice: () => number;
}

const ScreenEnclosureAddon = ({
  isSelected,
  onToggle,
  area,
  onAreaChange,
  quality,
  onQualityChange,
  calculatePrice
}: ScreenEnclosureAddonProps) => {
  return (
    <div className="space-y-3">
      <label className="flex items-center space-x-2 text-sm cursor-pointer p-2 rounded border hover:bg-muted/30 col-span-2">
        <Checkbox 
          checked={isSelected} 
          onCheckedChange={onToggle}
        />
        <Grid3X3 className="h-4 w-4 text-gray-600" />
        <span>Screen Enclosure</span>
      </label>

      {isSelected && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pl-6">
          <div className="space-y-1">
            <label className="text-sm font-medium">Area (sq ft)</label>
            <Input
              type="number"
              min={0}
              step={1}
              value={area || ''}
              onChange={(e) => onAreaChange(parseFloat(e.target.value) || 0)}
              placeholder="Enter sq ft"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Quality</label>
            <select
              className="w-full border rounded-md bg-background px-3 py-2 text-sm"
              value={quality}
              onChange={(e) => onQualityChange(e.target.value as 'standard' | 'deluxe' | 'premium')}
            >
              <option value="standard">Standard ($25/sq ft)</option>
              <option value="deluxe">Deluxe ($27/sq ft)</option>
              <option value="premium">Premium ($33/sq ft)</option>
            </select>
          </div>
          <div className="flex items-end">
            <div className="w-full bg-muted/50 border rounded-md p-3">
              <div className="text-xs text-muted-foreground">Price</div>
              <div className="text-lg font-semibold text-primary">${calculatePrice().toLocaleString()}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScreenEnclosureAddon;
