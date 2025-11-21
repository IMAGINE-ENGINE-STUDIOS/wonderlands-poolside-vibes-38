import * as React from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator, Droplets, Flame, FlaskConical } from "lucide-react";

type PoolShape = "rectangular" | "oval" | "kidney" | "freeform";

export const PoolCalculator = () => {
  const [shape, setShape] = React.useState<PoolShape>("rectangular");
  const [length, setLength] = React.useState("");
  const [width, setWidth] = React.useState("");
  const [shallowDepth, setShallowDepth] = React.useState("");
  const [deepDepth, setDeepDepth] = React.useState("");
  
  // Heating parameters
  const [currentTemp, setCurrentTemp] = React.useState("");
  const [desiredTemp, setDesiredTemp] = React.useState("");
  const [heaterType, setHeaterType] = React.useState("gas");
  const [gasCost, setGasCost] = React.useState("1.50");
  const [electricCost, setElectricCost] = React.useState("0.12");
  
  // Chemical parameters
  const [currentChlorine, setCurrentChlorine] = React.useState("");
  const [currentPH, setCurrentPH] = React.useState("");
  const [currentAlkalinity, setCurrentAlkalinity] = React.useState("");

  const calculateVolume = (): number => {
    const l = parseFloat(length);
    const w = parseFloat(width);
    const shallow = parseFloat(shallowDepth);
    const deep = parseFloat(deepDepth);
    
    if (!l || !w || !shallow || !deep) return 0;
    
    const avgDepth = (shallow + deep) / 2;
    
    switch (shape) {
      case "rectangular":
        return l * w * avgDepth * 7.5; // 7.5 gallons per cubic foot
      case "oval":
        return l * w * avgDepth * 5.9; // Elliptical formula
      case "kidney":
      case "freeform":
        return l * w * avgDepth * 5.0; // Approximate for irregular shapes
      default:
        return 0;
    }
  };

  const calculateHeatingCost = (gallons: number) => {
    const temp = parseFloat(currentTemp);
    const desired = parseFloat(desiredTemp);
    
    if (!temp || !desired || desired <= temp) return null;
    
    const tempRise = desired - temp;
    const weight = gallons * 8.33; // pounds of water
    const btuRequired = weight * tempRise; // BTU needed
    
    if (heaterType === "gas") {
      // Natural gas: ~100,000 BTU per therm, 80% efficiency
      const thermsNeeded = btuRequired / (100000 * 0.8);
      const cost = thermsNeeded * parseFloat(gasCost);
      return {
        btu: btuRequired,
        energy: thermsNeeded.toFixed(2),
        unit: "therms",
        cost: cost.toFixed(2),
        ongoing: (cost * 0.1).toFixed(2) // ~10% for maintenance
      };
    } else if (heaterType === "electric") {
      // Electric: 3,412 BTU per kWh, 95% efficiency
      const kwhNeeded = btuRequired / (3412 * 0.95);
      const cost = kwhNeeded * parseFloat(electricCost);
      return {
        btu: btuRequired,
        energy: kwhNeeded.toFixed(2),
        unit: "kWh",
        cost: cost.toFixed(2),
        ongoing: (cost * 0.15).toFixed(2) // ~15% for maintenance
      };
    } else {
      // Heat pump: COP of 5.0
      const kwhNeeded = btuRequired / (3412 * 5.0);
      const cost = kwhNeeded * parseFloat(electricCost);
      return {
        btu: btuRequired,
        energy: kwhNeeded.toFixed(2),
        unit: "kWh",
        cost: cost.toFixed(2),
        ongoing: (cost * 0.08).toFixed(2) // ~8% for maintenance
      };
    }
  };

  const calculateChemicals = (gallons: number) => {
    const chlorine = parseFloat(currentChlorine) || 0;
    const ph = parseFloat(currentPH) || 7.5;
    const alkalinity = parseFloat(currentAlkalinity) || 0;
    
    // Target ranges (industry standard)
    const targetChlorine = 3.0; // ppm
    const targetPH = 7.4;
    const targetAlkalinity = 100; // ppm
    
    // Chemical calculations
    const chlorineNeeded = Math.max(0, (targetChlorine - chlorine) * gallons / 75000); // lbs of chlorine
    
    let phAdjustment = "";
    let phAmount = 0;
    if (ph < 7.2) {
      phAmount = ((7.4 - ph) * gallons) / 10000; // lbs of soda ash
      phAdjustment = `Add ${phAmount.toFixed(2)} lbs of Soda Ash to raise pH`;
    } else if (ph > 7.6) {
      phAmount = ((ph - 7.4) * gallons) / 10000; // lbs of muriatic acid
      phAdjustment = `Add ${phAmount.toFixed(2)} lbs of Muriatic Acid to lower pH`;
    } else {
      phAdjustment = "pH is within optimal range (7.2-7.6)";
    }
    
    const alkalinityNeeded = Math.max(0, (targetAlkalinity - alkalinity) * gallons / 10000); // lbs of sodium bicarbonate
    
    // Monthly maintenance estimates
    const monthlyChlorine = (gallons / 10000) * 3; // ~3 lbs per 10k gallons
    const monthlyShock = (gallons / 10000) * 1; // ~1 lb per 10k gallons
    const monthlyAlkalinity = (gallons / 20000); // ~0.5 lbs per 10k gallons
    
    return {
      initial: {
        chlorine: chlorineNeeded.toFixed(2),
        phAdjustment,
        alkalinity: alkalinityNeeded.toFixed(2)
      },
      monthly: {
        chlorine: monthlyChlorine.toFixed(1),
        shock: monthlyShock.toFixed(1),
        alkalinity: monthlyAlkalinity.toFixed(1),
        estimatedCost: ((monthlyChlorine * 4) + (monthlyShock * 5) + (monthlyAlkalinity * 2)).toFixed(2)
      }
    };
  };

  const volume = calculateVolume();
  const heatingResults = volume > 0 ? calculateHeatingCost(volume) : null;
  const chemicalResults = volume > 0 ? calculateChemicals(volume) : null;

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Calculator className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Pool Calculator</h1>
        </div>
        
        <p className="text-muted-foreground mb-8">
          Calculate water volume, heating costs, and chemical requirements for your pool based on industry-standard formulas.
        </p>

        <Tabs defaultValue="dimensions" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dimensions">Dimensions</TabsTrigger>
            <TabsTrigger value="volume">Volume</TabsTrigger>
            <TabsTrigger value="heating">Heating</TabsTrigger>
            <TabsTrigger value="chemicals">Chemicals</TabsTrigger>
          </TabsList>

          <TabsContent value="dimensions" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Droplets className="h-5 w-5" />
                Pool Dimensions
              </h2>
              
              <div className="space-y-4">
                <div>
                  <Label>Pool Shape</Label>
                  <Select value={shape} onValueChange={(v) => setShape(v as PoolShape)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rectangular">Rectangular</SelectItem>
                      <SelectItem value="oval">Oval</SelectItem>
                      <SelectItem value="kidney">Kidney</SelectItem>
                      <SelectItem value="freeform">Freeform</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Length (feet)</Label>
                    <Input 
                      type="number" 
                      value={length}
                      onChange={(e) => setLength(e.target.value)}
                      placeholder="e.g., 20"
                    />
                  </div>
                  <div>
                    <Label>Width (feet)</Label>
                    <Input 
                      type="number" 
                      value={width}
                      onChange={(e) => setWidth(e.target.value)}
                      placeholder="e.g., 10"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Shallow End Depth (feet)</Label>
                    <Input 
                      type="number" 
                      value={shallowDepth}
                      onChange={(e) => setShallowDepth(e.target.value)}
                      placeholder="e.g., 3"
                    />
                  </div>
                  <div>
                    <Label>Deep End Depth (feet)</Label>
                    <Input 
                      type="number" 
                      value={deepDepth}
                      onChange={(e) => setDeepDepth(e.target.value)}
                      placeholder="e.g., 8"
                    />
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="volume" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Water Volume Results</h2>
              
              {volume > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">Total Volume</p>
                      <p className="text-2xl font-bold">{volume.toFixed(0)} gallons</p>
                      <p className="text-sm text-muted-foreground mt-1">{(volume / 264.17).toFixed(1)} cubic meters</p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">Average Depth</p>
                      <p className="text-2xl font-bold">
                        {((parseFloat(shallowDepth) + parseFloat(deepDepth)) / 2).toFixed(1)} ft
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {(((parseFloat(shallowDepth) + parseFloat(deepDepth)) / 2) * 0.3048).toFixed(2)} meters
                      </p>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-sm font-medium mb-2">Fill Time Estimate</p>
                    <p className="text-sm text-muted-foreground">
                      At 10 GPM (typical garden hose): <strong>{(volume / 10 / 60).toFixed(1)} hours</strong>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      At 25 GPM (larger hose): <strong>{(volume / 25 / 60).toFixed(1)} hours</strong>
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">Enter pool dimensions in the Dimensions tab to calculate volume.</p>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="heating" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Flame className="h-5 w-5" />
                Heating Cost Calculator
              </h2>
              
              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Current Water Temp (°F)</Label>
                    <Input 
                      type="number" 
                      value={currentTemp}
                      onChange={(e) => setCurrentTemp(e.target.value)}
                      placeholder="e.g., 65"
                    />
                  </div>
                  <div>
                    <Label>Desired Temp (°F)</Label>
                    <Input 
                      type="number" 
                      value={desiredTemp}
                      onChange={(e) => setDesiredTemp(e.target.value)}
                      placeholder="e.g., 80"
                    />
                  </div>
                </div>

                <div>
                  <Label>Heater Type</Label>
                  <Select value={heaterType} onValueChange={setHeaterType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gas">Natural Gas</SelectItem>
                      <SelectItem value="electric">Electric Resistance</SelectItem>
                      <SelectItem value="heatpump">Heat Pump</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Gas Cost ($/therm)</Label>
                    <Input 
                      type="number" 
                      step="0.01"
                      value={gasCost}
                      onChange={(e) => setGasCost(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Electric Cost ($/kWh)</Label>
                    <Input 
                      type="number" 
                      step="0.01"
                      value={electricCost}
                      onChange={(e) => setElectricCost(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {heatingResults && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">BTU Required</p>
                      <p className="text-xl font-bold">{heatingResults.btu.toLocaleString()}</p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">Energy Needed</p>
                      <p className="text-xl font-bold">{heatingResults.energy} {heatingResults.unit}</p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">Initial Heating Cost</p>
                      <p className="text-xl font-bold">${heatingResults.cost}</p>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
                    <p className="text-sm font-medium mb-2">Monthly Maintenance Heating</p>
                    <p className="text-sm text-muted-foreground">
                      Estimated cost to maintain temperature: <strong>${heatingResults.ongoing}/day</strong>
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Based on heat loss and typical weather conditions. Actual costs vary with usage and climate.
                    </p>
                  </div>
                </div>
              )}
              
              {!heatingResults && volume > 0 && (
                <p className="text-muted-foreground">Enter temperature values to calculate heating costs.</p>
              )}
              
              {!volume && (
                <p className="text-muted-foreground">Enter pool dimensions first to calculate heating costs.</p>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="chemicals" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <FlaskConical className="h-5 w-5" />
                Chemical Requirements
              </h2>
              
              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Current Chlorine (ppm)</Label>
                    <Input 
                      type="number" 
                      step="0.1"
                      value={currentChlorine}
                      onChange={(e) => setCurrentChlorine(e.target.value)}
                      placeholder="e.g., 1.5"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Target: 1-3 ppm</p>
                  </div>
                  <div>
                    <Label>Current pH</Label>
                    <Input 
                      type="number" 
                      step="0.1"
                      value={currentPH}
                      onChange={(e) => setCurrentPH(e.target.value)}
                      placeholder="e.g., 7.2"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Target: 7.2-7.6</p>
                  </div>
                  <div>
                    <Label>Total Alkalinity (ppm)</Label>
                    <Input 
                      type="number" 
                      value={currentAlkalinity}
                      onChange={(e) => setCurrentAlkalinity(e.target.value)}
                      placeholder="e.g., 80"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Target: 80-120 ppm</p>
                  </div>
                </div>
              </div>

              {chemicalResults && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-3">Initial Balancing</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-4 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">Chlorine Needed</p>
                        <p className="text-xl font-bold">{chemicalResults.initial.chlorine} lbs</p>
                        <p className="text-xs text-muted-foreground mt-1">Granular or tablets</p>
                      </div>
                      <div className="p-4 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">pH Adjustment</p>
                        <p className="text-sm font-medium mt-1">{chemicalResults.initial.phAdjustment}</p>
                      </div>
                      <div className="p-4 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">Alkalinity Increaser</p>
                        <p className="text-xl font-bold">{chemicalResults.initial.alkalinity} lbs</p>
                        <p className="text-xs text-muted-foreground mt-1">Sodium Bicarbonate</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Monthly Maintenance</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                        <p className="text-sm font-medium mb-2">Regular Chemicals</p>
                        <ul className="text-sm space-y-1">
                          <li>Chlorine: <strong>{chemicalResults.monthly.chlorine} lbs</strong></li>
                          <li>Shock Treatment: <strong>{chemicalResults.monthly.shock} lbs</strong></li>
                          <li>Alkalinity: <strong>{chemicalResults.monthly.alkalinity} lbs</strong></li>
                        </ul>
                      </div>
                      <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <p className="text-sm font-medium mb-2">Estimated Monthly Cost</p>
                        <p className="text-2xl font-bold">${chemicalResults.monthly.estimatedCost}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Based on average retail prices. Includes chlorine, shock, and alkalinity adjustments.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
                    <p className="text-sm font-semibold mb-2">Additional Recommendations</p>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Test water chemistry 2-3 times per week</li>
                      <li>• Shock pool weekly during peak season</li>
                      <li>• Check calcium hardness monthly (target: 200-400 ppm)</li>
                      <li>• Maintain cyanuric acid at 30-50 ppm for outdoor pools</li>
                    </ul>
                  </div>
                </div>
              )}
              
              {!chemicalResults && volume > 0 && (
                <p className="text-muted-foreground">Enter current water chemistry values to calculate chemical requirements.</p>
              )}
              
              {!volume && (
                <p className="text-muted-foreground">Enter pool dimensions first to calculate chemical requirements.</p>
              )}
            </Card>
          </TabsContent>
        </Tabs>

        <Card className="mt-6 p-4 bg-muted">
          <p className="text-xs text-muted-foreground">
            <strong>Note:</strong> All calculations are based on industry-standard formulas and average conditions. 
            Actual results may vary based on specific conditions, climate, pool usage, and equipment efficiency. 
            Always consult with a pool professional for precise recommendations.
          </p>
        </Card>
      </div>
    </div>
  );
};
