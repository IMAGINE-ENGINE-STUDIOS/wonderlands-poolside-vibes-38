import * as React from "react";
const { useState } = React;
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calculator, Thermometer, Droplets, MapPin } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface HeaterRecommendation {
  model: string;
  btu: number;
  price: number;
  reason: string;
  efficiency: string;
}

interface HeaterSizeCalculatorProps {
  onSelectHeater?: (heaterName: string) => void;
  currentSelection?: string;
}

const HeaterSizeCalculator = ({ onSelectHeater, currentSelection }: HeaterSizeCalculatorProps) => {
  const [poolLength, setPoolLength] = useState("");
  const [poolWidth, setPoolWidth] = useState("");
  const [avgDepth, setAvgDepth] = useState("");
  const [currentTemp, setCurrentTemp] = useState("70");
  const [desiredTemp, setDesiredTemp] = useState("82");
  const [climateZone, setClimateZone] = useState("moderate");
  const [heatingSpeed, setHeatingSpeed] = useState("24"); // hours
  const [recommendation, setRecommendation] = useState<HeaterRecommendation | null>(null);

  const pentairHeaters = [
    { 
      model: 'Pentair MasterTemp 125 (125K BTU)', 
      btu: 125000, 
      price: 2300,
      poolSize: { min: 0, max: 15000 },
      description: 'Compact high-efficiency gas heater for pools up to 15,000 gallons'
    },
    { 
      model: 'Pentair MasterTemp 250 (250K BTU)', 
      btu: 250000, 
      price: 3680,
      poolSize: { min: 15000, max: 30000 },
      description: 'Mid-size high-performance gas heater for medium pools'
    },
    { 
      model: 'Pentair MasterTemp 400 (400K BTU)', 
      btu: 400000, 
      price: 4830,
      poolSize: { min: 30000, max: 50000 },
      description: 'High-capacity gas heater for large pools and quick heating'
    },
    { 
      model: 'Pentair UltraTemp 90 Heat Pump', 
      btu: 90000, 
      price: 5175,
      poolSize: { min: 0, max: 20000 },
      description: 'Energy-efficient heat pump for pools up to 20,000 gallons'
    },
    { 
      model: 'Pentair UltraTemp 110 Heat Pump', 
      btu: 110000, 
      price: 6325,
      poolSize: { min: 20000, max: 35000 },
      description: 'High-efficiency heat pump for medium to large pools'
    },
    { 
      model: 'Pentair UltraTemp 140 Heat Pump', 
      btu: 140000, 
      price: 7475,
      poolSize: { min: 35000, max: 50000 },
      description: 'Premium heat pump for large pools with maximum efficiency'
    }
  ];

  const calculateRecommendation = () => {
    const length = parseFloat(poolLength);
    const width = parseFloat(poolWidth);
    const depth = parseFloat(avgDepth);
    const current = parseFloat(currentTemp);
    const desired = parseFloat(desiredTemp);
    const hours = parseFloat(heatingSpeed);

    if (!length || !width || !depth || !current || !desired) {
      return;
    }

    // Calculate pool volume in gallons
    const volumeCubicFeet = length * width * depth;
    const volumeGallons = volumeCubicFeet * 7.48; // 1 cubic foot = 7.48 gallons

    // Calculate temperature rise needed
    const tempRise = desired - current;

    // Calculate required BTU
    // Formula: Pool Volume (gallons) × 8.33 (lbs per gallon) × Temperature Rise (°F) ÷ Heating Time (hours)
    const baseBTU = (volumeGallons * 8.33 * tempRise) / hours;

    // Climate factor adjustments
    const climateFactor = {
      'cold': 1.3,      // Northern states, prolonged cold
      'moderate': 1.15, // Most of US, mild winters
      'warm': 1.0,      // Southern states, warm climate
      'hot': 0.85       // Florida, Texas, year-round warm
    }[climateZone] || 1.15;

    const requiredBTU = baseBTU * climateFactor;

    // Find the best heater match
    let bestMatch = pentairHeaters[0];
    let bestScore = Infinity;

    for (const heater of pentairHeaters) {
      // Prefer gas heaters for faster heating, heat pumps for efficiency
      const isGasHeater = heater.model.includes('MasterTemp');
      const isHeatPump = heater.model.includes('UltraTemp');
      
      // Calculate score based on BTU match and pool size
      const btuDifference = Math.abs(heater.btu - requiredBTU);
      const withinPoolSize = volumeGallons >= heater.poolSize.min && volumeGallons <= heater.poolSize.max;
      
      // Prefer gas heaters for quick heating (< 24 hours) and cold climates
      const preferGas = hours < 24 || climateZone === 'cold';
      
      let score = btuDifference;
      if (!withinPoolSize) score += 50000; // Penalty for out of range
      if (preferGas && isHeatPump) score += 30000; // Penalty for heat pump when gas preferred
      if (!preferGas && isGasHeater) score += 10000; // Small penalty for gas when heat pump could work
      
      if (score < bestScore) {
        bestScore = score;
        bestMatch = heater;
      }
    }

    // Generate recommendation reason
    let reason = `For your ${Math.round(volumeGallons).toLocaleString()} gallon pool, `;
    
    if (hours < 24) {
      reason += `to heat from ${current}°F to ${desired}°F in ${hours} hours, `;
    } else {
      reason += `maintaining ${desired}°F temperature, `;
    }
    
    if (bestMatch.model.includes('MasterTemp')) {
      reason += `a gas heater is recommended for ${hours < 24 ? 'rapid' : 'reliable'} heating. `;
    } else {
      reason += `a heat pump is recommended for energy-efficient operation. `;
    }
    
    reason += `This ${bestMatch.btu.toLocaleString()} BTU unit is perfectly sized for your pool.`;

    const efficiency = bestMatch.model.includes('UltraTemp') 
      ? 'Up to 500% efficient (COP 5.0)' 
      : '82-84% thermal efficiency';

    setRecommendation({
      model: bestMatch.model,
      btu: bestMatch.btu,
      price: bestMatch.price,
      reason,
      efficiency
    });
  };

  const handleSelectRecommendation = () => {
    if (recommendation && onSelectHeater) {
      onSelectHeater(recommendation.model);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calculator className="h-5 w-5 text-primary" />
          Heater Size Calculator
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Get a personalized heater recommendation based on your pool specifications
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Pool Dimensions */}
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-2">
            <Label htmlFor="length" className="text-xs flex items-center gap-1">
              <Droplets className="h-3 w-3" />
              Length (ft)
            </Label>
            <Input
              id="length"
              type="number"
              placeholder="30"
              value={poolLength}
              onChange={(e) => setPoolLength(e.target.value)}
              className="h-9"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="width" className="text-xs">Width (ft)</Label>
            <Input
              id="width"
              type="number"
              placeholder="15"
              value={poolWidth}
              onChange={(e) => setPoolWidth(e.target.value)}
              className="h-9"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="depth" className="text-xs">Avg Depth (ft)</Label>
            <Input
              id="depth"
              type="number"
              placeholder="5"
              step="0.5"
              value={avgDepth}
              onChange={(e) => setAvgDepth(e.target.value)}
              className="h-9"
            />
          </div>
        </div>

        {/* Temperature Settings */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="current" className="text-xs flex items-center gap-1">
              <Thermometer className="h-3 w-3" />
              Current Temp (°F)
            </Label>
            <Input
              id="current"
              type="number"
              value={currentTemp}
              onChange={(e) => setCurrentTemp(e.target.value)}
              className="h-9"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="desired" className="text-xs">Desired Temp (°F)</Label>
            <Input
              id="desired"
              type="number"
              value={desiredTemp}
              onChange={(e) => setDesiredTemp(e.target.value)}
              className="h-9"
            />
          </div>
        </div>

        {/* Climate and Speed */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="climate" className="text-xs flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              Climate Zone
            </Label>
            <Select value={climateZone} onValueChange={setClimateZone}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cold">Cold (Northern States)</SelectItem>
                <SelectItem value="moderate">Moderate (Most US)</SelectItem>
                <SelectItem value="warm">Warm (Southern States)</SelectItem>
                <SelectItem value="hot">Hot (FL, TX)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="speed" className="text-xs">Heating Time (hrs)</Label>
            <Select value={heatingSpeed} onValueChange={setHeatingSpeed}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="8">8 hours (Quick)</SelectItem>
                <SelectItem value="12">12 hours (Fast)</SelectItem>
                <SelectItem value="24">24 hours (Standard)</SelectItem>
                <SelectItem value="48">48 hours (Economical)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button 
          onClick={calculateRecommendation} 
          className="w-full"
          variant="default"
        >
          <Calculator className="h-4 w-4 mr-2" />
          Calculate Recommendation
        </Button>

        {/* Recommendation Display */}
        {recommendation && (
          <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg space-y-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  Recommended: {recommendation.model}
                  {currentSelection === recommendation.model && (
                    <Badge variant="secondary" className="text-xs">Selected</Badge>
                  )}
                </h4>
                <p className="text-xs text-muted-foreground">
                  {recommendation.btu.toLocaleString()} BTU • ${recommendation.price.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">
                  {recommendation.efficiency}
                </p>
              </div>
            </div>
            
            <p className="text-sm text-foreground leading-relaxed">
              {recommendation.reason}
            </p>

            {currentSelection !== recommendation.model && onSelectHeater && (
              <Button 
                onClick={handleSelectRecommendation}
                variant="outline"
                size="sm"
                className="w-full"
              >
                Select This Heater
              </Button>
            )}
          </div>
        )}

        <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
          <p className="font-medium">Quick Tips:</p>
          <ul className="list-disc list-inside space-y-0.5 ml-2">
            <li>Gas heaters heat faster, ideal for occasional use</li>
            <li>Heat pumps are more efficient for frequent use</li>
            <li>Larger BTU = faster heating but higher cost</li>
            <li>Consider solar covers to reduce heating costs</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default HeaterSizeCalculator;
