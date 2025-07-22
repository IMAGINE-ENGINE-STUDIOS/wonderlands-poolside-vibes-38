import { useState, Suspense, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { 
  Settings,
  Palette,
  Sun,
  Monitor,
  Download
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ImaginalyPoolModel } from './ImaginalyPoolModel';
import { ImaginalyEnvironment } from './ImaginalyEnvironment';
import { ImaginalyLighting } from './ImaginalyLighting';
import { ImaginalyControls } from './ImaginalyControls';
import { ImaginalySceneManager } from './ImaginalySceneManager';

interface ImaginalyConsumerProps {
  className?: string;
  selectedPool?: string;
  onPoolChange?: (pool: string) => void;
  disableUpload?: boolean;
}

interface ConsumerSettings {
  skyboxType: 'environment' | 'procedural';
  selectedSkybox: string;
  shaderMode: 'standard' | 'pbr' | 'cinematic';
  lightingModel: 'realistic' | 'stylized' | 'cinematic';
  waterQuality: number;
  enableEffects: boolean;
}

const skyboxOptions = [
  { id: 'sunset', name: 'Golden Sunset' },
  { id: 'dawn', name: 'Morning Dawn' },
  { id: 'park', name: 'Grassland Park' },
  { id: 'forest', name: 'Forest Meadow' },
  { id: 'city', name: 'Urban View' },
  { id: 'warehouse', name: 'Studio Light' },
  { id: 'lobby', name: 'Indoor Light' }
];

function ImaginalyScene({ poolModel, settings, onStatsUpdate }: { 
  poolModel: string; 
  settings: ConsumerSettings;
  onStatsUpdate: (stats: any) => void;
}) {
  return (
    <>
      <ImaginalyEnvironment 
        skyboxType={settings.skyboxType}
        selectedSkybox={settings.selectedSkybox}
      />
      
      <ImaginalyLighting 
        lightingModel={settings.lightingModel}
        intensity={1.0}
      />
      
      <ImaginalyPoolModel 
        poolModel={poolModel}
        settings={settings}
      />
      
      <ImaginalySceneManager
        poolModel={poolModel}
        settings={settings}
        onStatsUpdate={onStatsUpdate}
      />
      
      <OrbitControls 
        enableZoom={true} 
        enablePan={false} 
        maxPolarAngle={Math.PI / 2}
        minDistance={3}
        maxDistance={12}
        enableDamping
        dampingFactor={0.05}
      />
    </>
  );
}

export const ImaginalyConsumer = ({ 
  className = "", 
  selectedPool = 'Apollo 14',
  onPoolChange,
  disableUpload = false 
}: ImaginalyConsumerProps) => {
  const { toast } = useToast();
  const [currentPool, setCurrentPool] = useState(selectedPool);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [stats, setStats] = useState({
    fps: 60,
    vertices: 12450,
    triangles: 8230,
    memoryUsage: 245
  });
  
  const [settings, setSettings] = useState<ConsumerSettings>({
    skyboxType: 'environment',
    selectedSkybox: 'park',
    shaderMode: 'pbr',
    lightingModel: 'realistic',
    waterQuality: 3,
    enableEffects: true
  });

  const poolModels = [
    'Apollo 14', 'Ariel 16', 'Astoria 12', 'Bermuda', 'Cape Cod', 
    'Coral 16', 'Enchantment 917', 'Fiji', 'Genesis', 'Jamaica'
  ];

  const handlePoolChange = (pool: string) => {
    setCurrentPool(pool);
    onPoolChange?.(pool);
    toast({
      title: "Pool Model Changed",
      description: `Now viewing ${pool}`,
    });
  };

  const handleSettingChange = <K extends keyof ConsumerSettings>(
    key: K, 
    value: ConsumerSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    
    if (key === 'selectedSkybox') {
      const skyboxName = skyboxOptions.find(s => s.id === value)?.name || value;
      toast({
        title: "Environment Changed",
        description: `Switched to ${skyboxName}`,
      });
    }
  };

  const resetCamera = () => {
    toast({
      title: "View Reset",
      description: "Camera position has been reset",
    });
  };

  const takeScreenshot = () => {
    toast({
      title: "Screenshot Captured",
      description: "Your pool visualization has been saved",
    });
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleStatsUpdate = (newStats: any) => {
    setStats(newStats);
  };

  return (
    <div className={`h-[500px] bg-background border rounded-xl overflow-hidden shadow-lg ${className}`}>
      <div className="flex h-full">
        {/* Main 3D Viewer */}
        <div className="flex-1 relative bg-gradient-to-br from-green-50 via-blue-50 to-cyan-50">
          <ImaginalyControls
            stats={stats}
            settings={settings}
            onResetCamera={resetCamera}
            onScreenshot={takeScreenshot}
            onToggleFullscreen={toggleFullscreen}
            isFullscreen={isFullscreen}
          />

          {/* 3D Canvas */}
          <div className="w-full h-full">
            <Canvas 
              camera={{ position: [5, 3, 5], fov: 60 }}
              gl={{ 
                antialias: true, 
                alpha: true,
                toneMapping: 2,
                toneMappingExposure: 1.1
              }}
              shadows={false}
              dpr={[1, 1.5]}
            >
              <Suspense fallback={null}>
                <ImaginalyScene 
                  poolModel={currentPool} 
                  settings={settings}
                  onStatsUpdate={handleStatsUpdate}
                />
              </Suspense>
            </Canvas>
          </div>
        </div>

        {/* Control Panel */}
        <div className="w-64 border-l bg-card/95 backdrop-blur-sm overflow-y-auto">
          <div className="p-3 space-y-3">
            {/* Header */}
            <div className="text-center pb-2 border-b">
              <h3 className="text-sm font-semibold text-primary">IMAGINALY</h3>
              <p className="text-xs text-muted-foreground">3D Pool Visualizer</p>
            </div>

            {/* Pool Selection */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs flex items-center gap-2">
                  <Monitor className="h-3 w-3" />
                  Pool Model
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <Select value={currentPool} onValueChange={handlePoolChange}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {poolModels.map(model => (
                      <SelectItem key={model} value={model} className="text-xs">
                        {model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Environment */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs flex items-center gap-2">
                  <Sun className="h-3 w-3" />
                  Environment
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-2">
                <div>
                  <Label className="text-xs">Skybox</Label>
                  <Select 
                    value={settings.selectedSkybox} 
                    onValueChange={(value) => handleSettingChange('selectedSkybox', value)}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {skyboxOptions.map(skybox => (
                        <SelectItem key={skybox.id} value={skybox.id} className="text-xs">
                          {skybox.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Visual Settings */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs flex items-center gap-2">
                  <Palette className="h-3 w-3" />
                  Visual Quality
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-2">
                <div>
                  <Label className="text-xs">Render Quality</Label>
                  <Select 
                    value={settings.shaderMode} 
                    onValueChange={(value) => handleSettingChange('shaderMode', value as any)}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard" className="text-xs">Standard</SelectItem>
                      <SelectItem value="pbr" className="text-xs">High Quality</SelectItem>
                      <SelectItem value="cinematic" className="text-xs">Cinematic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs">Water Detail: {settings.waterQuality}</Label>
                  <Slider
                    value={[settings.waterQuality]}
                    onValueChange={(value) => handleSettingChange('waterQuality', value[0])}
                    max={5}
                    min={1}
                    step={1}
                    className="mt-1"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs">Visual Effects</span>
                  <Switch
                    checked={settings.enableEffects}
                    onCheckedChange={(checked) => handleSettingChange('enableEffects', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="w-full text-xs"
                  onClick={takeScreenshot}
                >
                  <Download className="h-3 w-3 mr-2" />
                  Save Image
                </Button>
              </CardContent>
            </Card>

            {/* Performance Info */}
            <div className="text-xs text-muted-foreground space-y-1 p-2 bg-muted/30 rounded">
              <div className="flex justify-between">
                <span>FPS:</span>
                <span className="font-mono">{stats.fps}</span>
              </div>
              <div className="flex justify-between">
                <span>Vertices:</span>
                <span className="font-mono">{stats.vertices.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Memory:</span>
                <span className="font-mono">{stats.memoryUsage} MB</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
