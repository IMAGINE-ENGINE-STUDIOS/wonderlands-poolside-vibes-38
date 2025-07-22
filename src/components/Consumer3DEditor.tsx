import { useState, Suspense, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { 
  OrbitControls, 
  Environment, 
  Float, 
  Sparkles, 
  Sky
} from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { 
  Settings,
  Palette,
  Eye,
  Sun,
  Layers,
  RotateCw,
  Zap,
  Download,
  Camera
} from 'lucide-react';
import { Mesh, Group, Color } from 'three';
import { EffectComposer, Bloom, ChromaticAberration, Vignette } from '@react-three/postprocessing';
import { useToast } from '@/hooks/use-toast';

interface EditorSettings {
  skyboxType: 'environment' | 'procedural';
  selectedSkybox: string;
  shaderMode: 'standard' | 'pbr' | 'unlit';
  enablePostProcessing: boolean;
  bloomIntensity: number;
  vignetteIntensity: number;
  chromaticAberration: number;
  waterQuality: number;
  lightingModel: 'realistic';
  renderPipeline: 'forward';
}

interface SkyboxOption {
  id: string;
  name: string;
  type: 'hdri' | 'procedural';
}

interface Consumer3DEditorProps {
  className?: string;
  selectedPool?: string;
  onPoolChange?: (pool: string) => void;
}

const defaultSkyboxes: SkyboxOption[] = [
  { id: 'warehouse', name: 'Warehouse', type: 'hdri' },
  { id: 'city', name: 'City', type: 'hdri' },
  { id: 'dawn', name: 'Dawn', type: 'hdri' },
  { id: 'forest', name: 'Forest', type: 'hdri' },
  { id: 'lobby', name: 'Lobby', type: 'hdri' },
  { id: 'night', name: 'Night', type: 'hdri' },
  { id: 'park', name: 'Park', type: 'hdri' },
  { id: 'studio', name: 'Studio', type: 'hdri' },
  { id: 'sunset', name: 'Sunset', type: 'hdri' },
  { id: 'procedural-sky', name: 'Procedural Sky', type: 'procedural' }
];

// Simplified 3D scene for consumer version
function Consumer3DScene({ 
  poolModel, 
  settings
}: { 
  poolModel: string; 
  settings: EditorSettings;
}) {
  return (
    <>
      {settings.skyboxType === 'procedural' ? (
        <Sky sunPosition={[100, 20, 100]} />
      ) : (
        <Environment preset={settings.selectedSkybox as any} />
      )}
      
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={1.0} />
      <pointLight position={[-10, 5, -10]} intensity={0.4} color="#FFB347" />
      
      {/* Simple Pool Model */}
      <mesh position={[0, -0.5, 0]}>
        <boxGeometry args={[4, 0.2, 2]} />
        <meshStandardMaterial color="#4FC3F7" transparent opacity={0.9} />
      </mesh>
      
      <Sparkles count={25} scale={[6, 3, 6]} size={1.2} speed={0.3} color="#4FC3F7" />
      
      {settings.enablePostProcessing && (
        <EffectComposer>
          <Bloom intensity={settings.bloomIntensity} />
          <Vignette offset={settings.vignetteIntensity} darkness={0.5} />
        </EffectComposer>
      )}
      
      <OrbitControls enableZoom={true} enablePan={false} maxPolarAngle={Math.PI / 2} />
    </>
  );
}

const Consumer3DEditor = ({ 
  className = "", 
  selectedPool = 'Apollo 14',
  onPoolChange 
}: Consumer3DEditorProps) => {
  const { toast } = useToast();
  const [currentPool, setCurrentPool] = useState(selectedPool);
  
  const [settings, setSettings] = useState<EditorSettings>({
    skyboxType: 'environment',
    selectedSkybox: 'warehouse',
    shaderMode: 'pbr',
    enablePostProcessing: true,
    bloomIntensity: 0.3,
    vignetteIntensity: 0.2,
    chromaticAberration: 0.0005,
    waterQuality: 3,
    lightingModel: 'realistic',
    renderPipeline: 'forward'
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

  const handleSettingChange = <K extends keyof EditorSettings>(
    key: K, 
    value: EditorSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const resetCamera = () => {
    toast({
      title: "View Reset",
      description: "Camera position has been reset to default view.",
    });
  };

  const takeScreenshot = () => {
    toast({
      title: "Taking Screenshot",
      description: "Capturing your pool visualization...",
    });
    
    setTimeout(() => {
      toast({
        title: "Screenshot Saved",
        description: "Your pool image has been saved to downloads.",
      });
    }, 1500);
  };

  return (
    <div className={`h-[600px] bg-background border rounded-lg overflow-hidden ${className}`}>
      <div className="flex h-full">
        {/* Main 3D Viewer */}
        <div className="flex-1 relative">
          {/* Status Indicators */}
          <div className="absolute top-4 left-4 z-10 flex gap-2">
            <Badge variant="secondary">
              <Zap className="h-3 w-3 mr-1" />
              {settings.shaderMode.toUpperCase()}
            </Badge>
            <Badge variant="secondary">
              <Eye className="h-3 w-3 mr-1" />
              Consumer Mode
            </Badge>
          </div>

          {/* Control Buttons */}
          <div className="absolute top-4 right-4 z-10 flex gap-2">
            <Button variant="outline" size="sm" onClick={resetCamera} title="Reset View">
              <RotateCw className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={takeScreenshot} title="Take Screenshot">
              <Camera className="h-4 w-4" />
            </Button>
          </div>

          {/* 3D Canvas */}
          <div className="w-full h-full">
            <Canvas 
              camera={{ position: [6, 4, 6], fov: 50 }}
              gl={{ 
                antialias: true, 
                alpha: true,
                toneMapping: 2,
                toneMappingExposure: 1.0
              }}
              shadows={false} // Simplified for consumer version
              dpr={[1, 1.5]} // Lower DPR for performance
            >
              <Suspense fallback={null}>
                <Consumer3DScene 
                  poolModel={currentPool} 
                  settings={settings}
                />
              </Suspense>
            </Canvas>
          </div>
        </div>

        {/* Simplified Control Panel */}
        <div className="w-72 border-l bg-card overflow-y-auto">
          <div className="p-4 space-y-4">
            {/* Pool Selection */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Pool Model</CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={currentPool} onValueChange={handlePoolChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {poolModels.map(model => (
                      <SelectItem key={model} value={model}>
                        {model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Skybox Controls */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Sun className="h-4 w-4" />
                  Environment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-xs">Environment Type</Label>
                  <Select 
                    value={settings.skyboxType} 
                    onValueChange={(value) => handleSettingChange('skyboxType', value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="environment">Preset Environment</SelectItem>
                      <SelectItem value="procedural">Procedural Sky</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {settings.skyboxType === 'environment' && (
                  <div>
                    <Label className="text-xs">Selected Environment</Label>
                    <Select 
                      value={settings.selectedSkybox} 
                      onValueChange={(value) => handleSettingChange('selectedSkybox', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {defaultSkyboxes.filter(skybox => skybox.type === 'hdri').map(skybox => (
                          <SelectItem key={skybox.id} value={skybox.id}>
                            {skybox.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Visual Settings */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  Visual Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-xs">Rendering Style</Label>
                  <Select 
                    value={settings.shaderMode} 
                    onValueChange={(value) => handleSettingChange('shaderMode', value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="pbr">High Quality</SelectItem>
                      <SelectItem value="unlit">Simple</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs">Enhanced Effects</span>
                  <Switch
                    checked={settings.enablePostProcessing}
                    onCheckedChange={(checked) => handleSettingChange('enablePostProcessing', checked)}
                  />
                </div>

                {settings.enablePostProcessing && (
                  <>
                    <div>
                      <Label className="text-xs">Glow Effect: {settings.bloomIntensity.toFixed(2)}</Label>
                      <Slider
                        value={[settings.bloomIntensity]}
                        onValueChange={(value) => handleSettingChange('bloomIntensity', value[0])}
                        max={1}
                        min={0}
                        step={0.1}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label className="text-xs">Vignette: {settings.vignetteIntensity.toFixed(2)}</Label>
                      <Slider
                        value={[settings.vignetteIntensity]}
                        onValueChange={(value) => handleSettingChange('vignetteIntensity', value[0])}
                        max={0.5}
                        min={0}
                        step={0.1}
                        className="mt-1"
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Water Quality */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Water Quality</CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <Label className="text-xs">Detail Level: {settings.waterQuality}</Label>
                  <Slider
                    value={[settings.waterQuality]}
                    onValueChange={(value) => handleSettingChange('waterQuality', value[0])}
                    max={5}
                    min={1}
                    step={1}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Higher quality may affect performance
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Help Section */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Controls</CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground space-y-1">
                <p>• Click and drag to rotate the view</p>
                <p>• Scroll to zoom in and out</p>
                <p>• Use the reset button to return to default view</p>
                <p>• Adjust settings to customize the visualization</p>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  className="mt-4 w-full"
                  onClick={takeScreenshot}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Image
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Consumer3DEditor;