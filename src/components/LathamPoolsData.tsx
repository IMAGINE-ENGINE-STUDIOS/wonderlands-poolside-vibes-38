import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  FileText, 
  Ruler, 
  Droplets, 
  Zap, 
  Thermometer,
  Settings,
  Download
} from 'lucide-react';

interface PoolSpec {
  model: string;
  series: string;
  dimensions: {
    length: string;
    width: string;
    shallowEnd: string;
    deepEnd: string;
    volume: string;
  };
  features: string[];
  materials: {
    shell: string;
    finish: string[];
    coping: string[];
  };
  equipment: {
    filtration: string;
    heating: string[];
    automation: string[];
  };
  warranty: {
    structure: string;
    surface: string;
    equipment: string;
  };
  specifications: {
    waterCapacity: string;
    skimmerSize: string;
    drainSize: string;
    stepConfiguration: string;
  };
}

const lathamPoolsDatabase: Record<string, PoolSpec> = {
  'Apollo 14': {
    model: 'Apollo 14',
    series: 'Classic Series',
    dimensions: {
      length: "14' 3\"",
      width: "7' 6\"",
      shallowEnd: "3' 6\"",
      deepEnd: "6' 0\"",
      volume: "4,950 gallons"
    },
    features: [
      'Roman End Design',
      'Integrated Steps',
      'Molded Bench Seating',
      'Anti-Slip Bottom Texture',
      'UV-Resistant Gelcoat'
    ],
    materials: {
      shell: 'Fiberglass Composite',
      finish: ['Gelcoat', 'Vinyl Liner Compatible', 'Tile Ready'],
      coping: ['Fiberglass', 'Natural Stone', 'Precast Concrete']
    },
    equipment: {
      filtration: 'Sand Filter System',
      heating: ['Heat Pump Compatible', 'Gas Heater Ready', 'Solar Compatible'],
      automation: ['Smart Control Ready', 'LED Lighting Package', 'Ozone System Compatible']
    },
    warranty: {
      structure: '25 Years',
      surface: '5 Years',
      equipment: '2 Years'
    },
    specifications: {
      waterCapacity: '4,950 gallons',
      skimmerSize: '8" Wide Mouth',
      drainSize: '6" Main Drain',
      stepConfiguration: 'Wedding Cake Steps with Handrail'
    }
  },
  'Ariel 16': {
    model: 'Ariel 16',
    series: 'Freeform Series',
    dimensions: {
      length: "16' 0\"",
      width: "8' 0\"",
      shallowEnd: "3' 6\"",
      deepEnd: "6' 6\"",
      volume: "6,800 gallons"
    },
    features: [
      'Kidney Shape Design',
      'Tanning Ledge',
      'Integrated Spa Option',
      'Corner Steps',
      'Swim-Out Bench'
    ],
    materials: {
      shell: 'Advanced Composite',
      finish: ['Premium Gelcoat', 'Mosaic Tile Ready', 'Pebble Finish Compatible'],
      coping: ['Bullnose Fiberglass', 'Travertine Ready', 'Brick Compatible']
    },
    equipment: {
      filtration: 'Cartridge Filter System',
      heating: ['Variable Speed Heat Pump', 'High-Efficiency Gas', 'Solar Panel Array'],
      automation: ['Full Automation Package', 'Color LED System', 'Salt System Ready']
    },
    warranty: {
      structure: '30 Years',
      surface: '7 Years',
      equipment: '3 Years'
    },
    specifications: {
      waterCapacity: '6,800 gallons',
      skimmerSize: '9" Wide Mouth Skimmer',
      drainSize: 'Dual 6" Main Drains',
      stepConfiguration: 'Corner Entry with Handrail and Safety Features'
    }
  },
  'Astoria 12': {
    model: 'Astoria 12',
    series: 'Compact Series',
    dimensions: {
      length: "12' 0\"",
      width: "6' 6\"",
      shallowEnd: "3' 0\"",
      deepEnd: "5' 6\"",
      volume: "3,200 gallons"
    },
    features: [
      'Space-Efficient Design',
      'Integrated Seating',
      'Easy Entry Steps',
      'Compact Footprint',
      'Maximum Water Volume'
    ],
    materials: {
      shell: 'Single-Piece Fiberglass',
      finish: ['Standard Gelcoat', 'Liner Option', 'Paint Ready'],
      coping: ['Integrated Fiberglass', 'Concrete Compatible', 'Stone Ready']
    },
    equipment: {
      filtration: 'Compact Sand Filter',
      heating: ['Electric Heat Pump', 'Gas Heater Option', 'Solar Compatible'],
      automation: ['Basic Controls', 'LED Lighting', 'Timer Systems']
    },
    warranty: {
      structure: '20 Years',
      surface: '3 Years',
      equipment: '1 Year'
    },
    specifications: {
      waterCapacity: '3,200 gallons',
      skimmerSize: '7" Standard Skimmer',
      drainSize: '6" Main Drain',
      stepConfiguration: 'Single Entry Steps with Anti-Slip Surface'
    }
  },
  'Bermuda': {
    model: 'Bermuda',
    series: 'Tropical Series',
    dimensions: {
      length: "18' 6\"",
      width: "9' 0\"",
      shallowEnd: "3' 0\"",
      deepEnd: "7' 0\"",
      volume: "9,500 gallons"
    },
    features: [
      'Lagoon-Style Design',
      'Multiple Tanning Ledges',
      'Waterfall Feature Ready',
      'Beach Entry Option',
      'Tropical Aesthetics'
    ],
    materials: {
      shell: 'Premium Composite Construction',
      finish: ['Tropical Gelcoat Options', 'Natural Stone Compatible', 'Glass Tile Ready'],
      coping: ['Natural Stone', 'Coral Stone', 'Travertine', 'Limestone']
    },
    equipment: {
      filtration: 'Multi-Port Valve System',
      heating: ['High-Efficiency Heat Pump', 'Solar Heating System', 'Gas Backup'],
      automation: ['Resort-Style Controls', 'Color-Changing LEDs', 'Water Features Control']
    },
    warranty: {
      structure: '35 Years',
      surface: '10 Years',
      equipment: '5 Years'
    },
    specifications: {
      waterCapacity: '9,500 gallons',
      skimmerSize: 'Dual 10" Wide Mouth Skimmers',
      drainSize: 'Triple 6" Main Drains',
      stepConfiguration: 'Beach Entry with Multiple Access Points'
    }
  },
  'Astoria 14': {
    model: 'Astoria 14',
    series: 'Rectangular Series',
    dimensions: {
      length: "35' 0\"",
      width: "14' 0\"",
      shallowEnd: "3' 6\"",
      deepEnd: "6' 6\"",
      volume: "10,700 gallons"
    },
    features: [
      'Rectangular Design',
      'Integrated Spa - 3ft Deep',
      'Swimming Lane Compatible',
      'Spa Spillover Feature',
      'Modern Aesthetics',
      'Entry Steps'
    ],
    materials: {
      shell: 'Premium Fiberglass Composite',
      finish: ['Premium Gelcoat', 'Tile Ready', 'Pebble Compatible'],
      coping: ['Bullnose Fiberglass', 'Natural Stone', 'Precast Concrete', 'Travertine']
    },
    equipment: {
      filtration: 'High-Capacity Sand Filter',
      heating: ['Variable Speed Heat Pump', 'High-Efficiency Gas Heater', 'Solar Ready'],
      automation: ['Smart Pool Controls', 'LED Lighting Package', 'Spa Controls', 'Salt System Ready']
    },
    warranty: {
      structure: '30 Years',
      surface: '7 Years',
      equipment: '3 Years'
    },
    specifications: {
      waterCapacity: '10,700 gallons',
      skimmerSize: 'Dual 9" Wide Mouth Skimmers',
      drainSize: 'Triple 6" Main Drains',
      stepConfiguration: 'Corner Entry Steps with Handrail and Spa Access'
    }
  },
  'Cape Cod': {
    model: 'Cape Cod',
    series: 'Traditional Series',
    dimensions: {
      length: "20' 0\"",
      width: "10' 0\"",
      shallowEnd: "3' 6\"",
      deepEnd: "8' 0\"",
      volume: "12,000 gallons"
    },
    features: [
      'Classic Rectangle Design',
      'Diving Board Compatible',
      'Lane Swimming Capable',
      'Traditional Aesthetics',
      'Versatile Layout'
    ],
    materials: {
      shell: 'Heavy-Duty Fiberglass',
      finish: ['Classic White Gelcoat', 'Traditional Blue', 'Custom Colors'],
      coping: ['Precast Concrete', 'Natural Stone', 'Brick', 'Flagstone']
    },
    equipment: {
      filtration: 'Commercial-Grade Sand Filter',
      heating: ['High-BTU Gas Heater', 'Heat Pump System', 'Solar Array'],
      automation: ['Professional Controls', 'Safety Systems', 'Water Chemistry']
    },
    warranty: {
      structure: 'Lifetime',
      surface: '15 Years',
      equipment: '7 Years'
    },
    specifications: {
      waterCapacity: '12,000 gallons',
      skimmerSize: 'Commercial 12" Skimmers',
      drainSize: 'Quad 8" Main Drains',
      stepConfiguration: 'Traditional Ladder System with Safety Rails'
    }
  }
};

interface LathamPoolsDataProps {
  selectedPool?: string;
  onPoolSelect?: (pool: string) => void;
  className?: string;
}

const LathamPoolsData = ({ selectedPool = 'Apollo 14', onPoolSelect, className = "" }: LathamPoolsDataProps) => {
  const [currentPool, setCurrentPool] = useState(selectedPool);
  
  const handlePoolChange = (pool: string) => {
    setCurrentPool(pool);
    onPoolSelect?.(pool);
  };

  const poolSpec = lathamPoolsDatabase[currentPool];
  const availablePools = Object.keys(lathamPoolsDatabase);

  const exportSpecifications = () => {
    const dataStr = JSON.stringify(poolSpec, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `${poolSpec.model.replace(/\s+/g, '_')}_specifications.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  if (!poolSpec) {
    return (
      <div className={`p-4 text-center ${className}`}>
        <p className="text-muted-foreground">Pool specifications not found.</p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Pool Selection */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Latham Pool Specifications
            </CardTitle>
            <Button onClick={exportSpecifications} size="sm" variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Select value={currentPool} onValueChange={handlePoolChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availablePools.map(pool => (
                <SelectItem key={pool} value={pool}>
                  {pool}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Basic Information */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            {poolSpec.model} - {poolSpec.series}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Dimensions */}
          <div>
            <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <Ruler className="h-4 w-4" />
              Dimensions
            </h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>Length: <span className="font-mono">{poolSpec.dimensions.length}</span></div>
              <div>Width: <span className="font-mono">{poolSpec.dimensions.width}</span></div>
              <div>Shallow End: <span className="font-mono">{poolSpec.dimensions.shallowEnd}</span></div>
              <div>Deep End: <span className="font-mono">{poolSpec.dimensions.deepEnd}</span></div>
              <div className="col-span-2">
                Volume: <span className="font-mono font-semibold">{poolSpec.dimensions.volume}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Features */}
          <div>
            <h4 className="text-sm font-semibold mb-2">Key Features</h4>
            <div className="flex flex-wrap gap-1">
              {poolSpec.features.map((feature, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {feature}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Materials & Construction */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Materials & Construction
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <h5 className="text-sm font-medium">Shell Construction</h5>
            <p className="text-sm text-muted-foreground">{poolSpec.materials.shell}</p>
          </div>
          
          <div>
            <h5 className="text-sm font-medium">Finish Options</h5>
            <div className="flex flex-wrap gap-1 mt-1">
              {poolSpec.materials.finish.map((finish, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {finish}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <h5 className="text-sm font-medium">Coping Options</h5>
            <div className="flex flex-wrap gap-1 mt-1">
              {poolSpec.materials.coping.map((coping, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {coping}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Equipment & Systems */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Equipment & Systems
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <h5 className="text-sm font-medium flex items-center gap-2">
              <Droplets className="h-3 w-3" />
              Filtration System
            </h5>
            <p className="text-sm text-muted-foreground">{poolSpec.equipment.filtration}</p>
          </div>
          
          <div>
            <h5 className="text-sm font-medium flex items-center gap-2">
              <Thermometer className="h-3 w-3" />
              Heating Options
            </h5>
            <div className="flex flex-wrap gap-1 mt-1">
              {poolSpec.equipment.heating.map((heating, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {heating}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <h5 className="text-sm font-medium">Automation & Controls</h5>
            <div className="flex flex-wrap gap-1 mt-1">
              {poolSpec.equipment.automation.map((auto, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {auto}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Technical Specifications */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Technical Specifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-1 gap-2 text-sm">
            <div className="flex justify-between">
              <span>Water Capacity:</span>
              <span className="font-mono">{poolSpec.specifications.waterCapacity}</span>
            </div>
            <div className="flex justify-between">
              <span>Skimmer Size:</span>
              <span className="font-mono">{poolSpec.specifications.skimmerSize}</span>
            </div>
            <div className="flex justify-between">
              <span>Main Drain:</span>
              <span className="font-mono">{poolSpec.specifications.drainSize}</span>
            </div>
          </div>
          
          <Separator />
          
          <div>
            <h5 className="text-sm font-medium">Step Configuration</h5>
            <p className="text-sm text-muted-foreground">{poolSpec.specifications.stepConfiguration}</p>
          </div>
        </CardContent>
      </Card>

      {/* Warranty Information */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Warranty Coverage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-2 text-sm">
            <div className="flex justify-between items-center">
              <span>Structural Warranty:</span>
              <Badge variant="default">{poolSpec.warranty.structure}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span>Surface Warranty:</span>
              <Badge variant="secondary">{poolSpec.warranty.surface}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span>Equipment Warranty:</span>
              <Badge variant="outline">{poolSpec.warranty.equipment}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LathamPoolsData;