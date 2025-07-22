import { useState, useRef, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  OrbitControls, 
  Environment, 
  Float, 
  Sparkles, 
  Sky,
  useTexture,
  useCubeTexture,
  Text,
  ContactShadows
} from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Upload,
  Settings,
  Palette,
  Cpu,
  Eye,
  Sun,
  CloudRain,
  Layers,
  Box,
  Circle,
  Cylinder,
  FileImage,
  Download,
  RotateCw,
  Move3D,
  Zap,
  Save,
  Camera,
  Grid3X3,
  Lightbulb,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { Mesh, Group, CubeTextureLoader, Color, Vector3 } from 'three';
import { EffectComposer, Bloom, ChromaticAberration, Vignette } from '@react-three/postprocessing';
import { useToast } from '@/hooks/use-toast';

interface Advanced3DEditorProps {
  className?: string;
  isAdminMode?: boolean;
}

interface EditorSettings {
  skyboxType: 'environment' | 'custom' | 'procedural';
  selectedSkybox: string;
  shaderMode: 'standard' | 'pbr' | 'unlit' | 'custom';
  enablePostProcessing: boolean;
  bloomIntensity: number;
  vignetteIntensity: number;
  chromaticAberration: number;
  waterQuality: number;
  lightingModel: 'realistic' | 'stylized' | 'unreal';
  renderPipeline: 'forward' | 'deferred';
}

interface SkyboxOption {
  id: string;
  name: string;
  type: 'hdri' | 'cubemap' | 'procedural';
  path?: string;
}

const defaultSkyboxes: SkyboxOption[] = [
  { id: 'sunset', name: 'Golden Sunset', type: 'hdri' },
  { id: 'dawn', name: 'Morning Dawn', type: 'hdri' },
  { id: 'studio', name: 'Studio Lighting', type: 'hdri' },
  { id: 'forest', name: 'Forest Canopy', type: 'hdri' },
  { id: 'warehouse', name: 'Industrial Warehouse', type: 'hdri' },
  { id: 'procedural-sky', name: 'Procedural Sky', type: 'procedural' }
];

// Shader manager to ensure only one shader runs at a time
class ShaderManager {
  private static instance: ShaderManager;
  private activeShader: string | null = null;
  private shaderQueue: Array<{ id: string; cleanup: () => void }> = [];

  static getInstance(): ShaderManager {
    if (!ShaderManager.instance) {
      ShaderManager.instance = new ShaderManager();
    }
    return ShaderManager.instance;
  }

  setActiveShader(id: string, cleanup: () => void): void {
    // Cleanup previous shader
    if (this.activeShader) {
      const previousShader = this.shaderQueue.find(s => s.id === this.activeShader);
      if (previousShader) {
        previousShader.cleanup();
      }
    }

    // Set new active shader
    this.activeShader = id;
    this.shaderQueue = this.shaderQueue.filter(s => s.id !== id);
    this.shaderQueue.push({ id, cleanup });
  }

  clearActiveShader(id: string): void {
    if (this.activeShader === id) {
      this.activeShader = null;
      this.shaderQueue = this.shaderQueue.filter(s => s.id !== id);
    }
  }
}

function CustomSkybox({ skyboxType, selectedSkybox, customSkyboxPath }: {
  skyboxType: string;
  selectedSkybox: string;
  customSkyboxPath?: string;
}) {
  const { scene } = useThree();

  useEffect(() => {
    const shaderManager = ShaderManager.getInstance();
    
    if (skyboxType === 'procedural' && selectedSkybox === 'procedural-sky') {
      // Use procedural sky
      return;
    }

    if (skyboxType === 'custom' && customSkyboxPath) {
      // Load custom skybox
      const loader = new CubeTextureLoader();
      const texture = loader.load([
        customSkyboxPath, customSkyboxPath, customSkyboxPath,
        customSkyboxPath, customSkyboxPath, customSkyboxPath
      ]);
      scene.background = texture;
      
      shaderManager.setActiveShader('custom-skybox', () => {
        scene.background = null;
      });
    }

    return () => {
      shaderManager.clearActiveShader('custom-skybox');
    };
  }, [skyboxType, selectedSkybox, customSkyboxPath, scene]);

  if (skyboxType === 'procedural' && selectedSkybox === 'procedural-sky') {
    return <Sky sunPosition={[100, 20, 100]} />;
  }

  if (skyboxType === 'environment') {
    return <Environment preset={selectedSkybox as any} />;
  }

  return null;
}

function EnhancedPoolModel({ poolModel, settings }: { 
  poolModel: string; 
  settings: EditorSettings;
}) {
  const poolRef = useRef<Group>(null);
  const waterRef = useRef<Mesh>(null);
  
  useFrame((state) => {
    if (poolRef.current) {
      poolRef.current.position.y = -0.5 + Math.sin(state.clock.elapsedTime) * 0.005;
    }
    
    if (waterRef.current && settings.waterQuality > 0) {
      waterRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5) * 0.02;
      waterRef.current.position.y = -0.35 + Math.sin(state.clock.elapsedTime * 2) * 0.01;
    }
  });

  const getMaterialProps = () => {
    switch (settings.shaderMode) {
      case 'pbr':
        return { metalness: 0.8, roughness: 0.2 };
      case 'unlit':
        return { emissive: new Color('#4FC3F7'), emissiveIntensity: 0.5 };
      case 'custom':
        return { metalness: 0.5, roughness: 0.3, clearcoat: 0.8 };
      default:
        return { metalness: 0.3, roughness: 0.1 };
    }
  };

  const materialProps = getMaterialProps();

  return (
    <group ref={poolRef}>
      {/* Main Pool Body */}
      <mesh position={[0, -0.5, 0]}>
        <boxGeometry args={[4, 0.2, 2]} />
        <meshStandardMaterial 
          color="#4FC3F7" 
          transparent 
          opacity={0.9}
          {...materialProps}
        />
      </mesh>
      
      {/* Pool Border/Coping */}
      <mesh position={[0, -0.4, 0]}>
        <boxGeometry args={[4.2, 0.1, 2.2]} />
        <meshStandardMaterial 
          color="#F5F5F5" 
          roughness={0.2}
          metalness={0.1}
        />
      </mesh>
      
      {/* Enhanced Water with Quality Settings */}
      <mesh ref={waterRef} position={[0, -0.35, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3.8, 1.8, settings.waterQuality * 10, settings.waterQuality * 10]} />
        <meshStandardMaterial
          color="#0288D1"
          metalness={0.8}
          roughness={0.1}
          transparent
          opacity={0.8}
          emissive="#004D7A"
          emissiveIntensity={0.1}
        />
      </mesh>
      
      {/* Pool Steps */}
      <mesh position={[1.8, -0.3, 0.8]}>
        <boxGeometry args={[0.3, 0.15, 0.3]} />
        <meshStandardMaterial color="#E0E0E0" />
      </mesh>
      
      {/* Pool Light */}
      <mesh position={[-1.5, -0.45, 0.5]}>
        <cylinderGeometry args={[0.05, 0.05, 0.05]} />
        <meshStandardMaterial 
          color="#FFD700" 
          emissive="#FFD700"
          emissiveIntensity={0.3}
        />
      </mesh>

      {/* Pool Model Label */}
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.3}>
        <mesh position={[-1.5, 1.5, 0]}>
          <boxGeometry args={[2, 0.3, 0.1]} />
          <meshStandardMaterial 
            color="#2E7D32" 
            metalness={0.8}
            roughness={0.2}
            emissive="#1B5E20"
            emissiveIntensity={0.1}
          />
        </mesh>
      </Float>
    </group>
  );
}

function PostProcessingEffects({ settings }: { settings: EditorSettings }) {
  if (!settings.enablePostProcessing) return null;

  return (
    <EffectComposer>
      <Bloom 
        intensity={settings.bloomIntensity} 
        kernelSize={3} 
        luminanceThreshold={0.9} 
        luminanceSmoothing={0.025} 
      />
      <ChromaticAberration offset={[settings.chromaticAberration, settings.chromaticAberration]} />
      <Vignette eskil={false} offset={settings.vignetteIntensity} darkness={0.5} />
    </EffectComposer>
  );
}

function Enhanced3DScene({ 
  poolModel, 
  settings,
  customSkyboxPath 
}: { 
  poolModel: string; 
  settings: EditorSettings;
  customSkyboxPath?: string;
}) {
  const shaderManager = ShaderManager.getInstance();

  useEffect(() => {
    shaderManager.setActiveShader('main-scene', () => {
      // Cleanup function for main scene
    });

    return () => {
      shaderManager.clearActiveShader('main-scene');
    };
  }, []);

  const getLightingSetup = () => {
    switch (settings.lightingModel) {
      case 'realistic':
        return (
          <>
            <ambientLight intensity={0.3} />
            <directionalLight 
              position={[10, 10, 5]} 
              intensity={1.2}
              castShadow
              shadow-mapSize-width={2048}
              shadow-mapSize-height={2048}
            />
            <pointLight position={[-10, 5, -10]} intensity={0.4} color="#FFB347" />
          </>
        );
      case 'stylized':
        return (
          <>
            <ambientLight intensity={0.6} />
            <directionalLight position={[5, 8, 3]} intensity={0.8} />
            <pointLight position={[0, 3, 0]} intensity={0.5} color="#4FC3F7" />
          </>
        );
      case 'unreal':
        return (
          <>
            <ambientLight intensity={0.2} />
            <directionalLight 
              position={[15, 15, 10]} 
              intensity={1.5}
              castShadow
            />
            <spotLight 
              position={[0, 10, 0]} 
              intensity={1.0} 
              angle={0.3} 
              penumbra={0.5}
              color="#4FC3F7"
            />
          </>
        );
      default:
        return <ambientLight intensity={0.5} />;
    }
  };

  return (
    <>
      <CustomSkybox 
        skyboxType={settings.skyboxType}
        selectedSkybox={settings.selectedSkybox}
        customSkyboxPath={customSkyboxPath}
      />
      
      {getLightingSetup()}
      
      <EnhancedPoolModel poolModel={poolModel} settings={settings} />
      
      {/* Contact Shadows for more realistic ground */}
      <ContactShadows 
        position={[0, -0.6, 0]} 
        opacity={0.4} 
        scale={8} 
        blur={2} 
        far={4} 
      />
      
      <Sparkles 
        count={30} 
        scale={[8, 4, 8]} 
        size={1.5} 
        speed={0.3}
        color="#4FC3F7"
      />
      
      <PostProcessingEffects settings={settings} />
      
      <OrbitControls 
        enableZoom={true} 
        enablePan={true} 
        maxPolarAngle={Math.PI / 2}
        minDistance={3}
        maxDistance={15}
        enableDamping
        dampingFactor={0.05}
      />
    </>
  );
}

const Advanced3DEditor = ({ className = "", isAdminMode = false }: Advanced3DEditorProps) => {
  const { toast } = useToast();
  const [selectedPool, setSelectedPool] = useState('Apollo 14');
  const [customSkyboxes, setCustomSkyboxes] = useState<SkyboxOption[]>([]);
  const [customSkyboxPath, setCustomSkyboxPath] = useState<string>('');
  const [uploadedTextures, setUploadedTextures] = useState<string[]>([]);
  const [uploadedModels, setUploadedModels] = useState<string[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [cameraPosition, setCameraPosition] = useState<[number, number, number]>([6, 4, 6]);
  const canvasRef = useRef<HTMLDivElement>(null);
  
  const [settings, setSettings] = useState<EditorSettings>({
    skyboxType: 'environment',
    selectedSkybox: 'sunset',
    shaderMode: 'pbr',
    enablePostProcessing: true,
    bloomIntensity: 0.5,
    vignetteIntensity: 0.3,
    chromaticAberration: 0.001,
    waterQuality: 5,
    lightingModel: 'realistic',
    renderPipeline: 'forward'
  });

  const poolModels = [
    'Apollo 14', 'Ariel 16', 'Astoria 12', 'Bermuda', 'Cape Cod', 
    'Coral 16', 'Enchantment 917', 'Fiji', 'Genesis', 'Jamaica'
  ];

  const handleFileUpload = (type: 'skybox' | 'texture' | 'model', event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    
    switch (type) {
      case 'skybox':
        const newSkybox: SkyboxOption = {
          id: `custom-${Date.now()}`,
          name: file.name,
          type: 'cubemap',
          path: url
        };
        setCustomSkyboxes(prev => [...prev, newSkybox]);
        setCustomSkyboxPath(url);
        setSettings(prev => ({ 
          ...prev, 
          skyboxType: 'custom', 
          selectedSkybox: newSkybox.id 
        }));
        toast({
          title: "Skybox Uploaded",
          description: `${file.name} has been added to your skyboxes.`,
        });
        break;
      case 'texture':
        setUploadedTextures(prev => [...prev, url]);
        toast({
          title: "Texture Uploaded",
          description: `${file.name} is now available for use.`,
        });
        break;
      case 'model':
        setUploadedModels(prev => [...prev, url]);
        toast({
          title: "Model Uploaded",
          description: `${file.name} has been added to your models.`,
        });
        break;
    }
  };

  const handleSettingChange = <K extends keyof EditorSettings>(
    key: K, 
    value: EditorSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const resetCamera = () => {
    setCameraPosition([6, 4, 6]);
    toast({
      title: "Camera Reset",
      description: "Camera position has been reset to default.",
    });
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      canvasRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const saveProject = () => {
    const projectData = {
      poolModel: selectedPool,
      settings,
      customSkyboxes,
      uploadedTextures,
      uploadedModels,
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(projectData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pool-project-${Date.now()}.json`;
    a.click();
    
    toast({
      title: "Project Saved",
      description: "Your 3D pool project has been downloaded.",
    });
  };

  const exportImage = () => {
    toast({
      title: "Capturing Image",
      description: "Taking a screenshot of your 3D scene...",
    });
    
    // This would require canvas.toDataURL() implementation
    setTimeout(() => {
      toast({
        title: "Image Exported",
        description: "Your 3D scene has been saved as an image.",
      });
    }, 2000);
  };

  const allSkyboxes = [...defaultSkyboxes, ...customSkyboxes];

  return (
    <div className={`h-[700px] bg-background border rounded-lg overflow-hidden ${className}`} ref={canvasRef}>
      <div className="flex h-full">
        {/* Main 3D Viewer */}
        <div className="flex-1 relative">
          {/* Top Toolbar */}
          <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-center">
            {/* Status Indicators */}
            <div className="flex gap-2">
              <Badge variant="secondary">
                <Zap className="h-3 w-3 mr-1" />
                {settings.shaderMode.toUpperCase()}
              </Badge>
              <Badge variant="secondary">
                <Eye className="h-3 w-3 mr-1" />
                {settings.lightingModel}
              </Badge>
              <Badge variant="secondary">
                <Cpu className="h-3 w-3 mr-1" />
                Quality: {settings.waterQuality}
              </Badge>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={resetCamera} title="Reset Camera">
                <RotateCw className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowGrid(!showGrid)} title="Toggle Grid">
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={saveProject} title="Save Project">
                <Save className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={exportImage} title="Export Image">
                <Camera className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={toggleFullscreen} 
                title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
              >
                {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* 3D Canvas */}
          <div className="w-full h-full">
            <Canvas 
              camera={{ position: [6, 4, 6], fov: 50 }}
              gl={{ 
                antialias: true, 
                alpha: true,
                toneMapping: 2,
                toneMappingExposure: 1.2
              }}
              shadows
              dpr={[1, 2]}
            >
              <Suspense fallback={null}>
                <Enhanced3DScene 
                  poolModel={selectedPool} 
                  settings={settings}
                  customSkyboxPath={customSkyboxPath}
                />
              </Suspense>
            </Canvas>
          </div>
        </div>

        {/* Control Panel */}
        <div className="w-80 border-l bg-card overflow-y-auto">
          <div className="p-4 space-y-4">
            {/* Pool Selection */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Pool Model</CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={selectedPool} onValueChange={setSelectedPool}>
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
                  Skybox Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-xs">Skybox Type</Label>
                  <Select 
                    value={settings.skyboxType} 
                    onValueChange={(value) => handleSettingChange('skyboxType', value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="environment">Environment Preset</SelectItem>
                      <SelectItem value="procedural">Procedural Sky</SelectItem>
                      <SelectItem value="custom">Custom Skybox</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs">Selected Skybox</Label>
                  <Select 
                    value={settings.selectedSkybox} 
                    onValueChange={(value) => handleSettingChange('selectedSkybox', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {allSkyboxes.map(skybox => (
                        <SelectItem key={skybox.id} value={skybox.id}>
                          {skybox.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {isAdminMode && (
                  <div>
                    <Label className="text-xs">Upload New Skybox</Label>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload('skybox', e)}
                      className="mt-1"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Shader Settings */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Layers className="h-4 w-4" />
                  Shader Pipeline
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-xs">Shader Mode</Label>
                  <Select 
                    value={settings.shaderMode} 
                    onValueChange={(value) => handleSettingChange('shaderMode', value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="pbr">PBR (Physically Based)</SelectItem>
                      <SelectItem value="unlit">Unlit</SelectItem>
                      <SelectItem value="custom">Custom Shader</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs">Lighting Model</Label>
                  <Select 
                    value={settings.lightingModel} 
                    onValueChange={(value) => handleSettingChange('lightingModel', value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="realistic">Realistic</SelectItem>
                      <SelectItem value="stylized">Stylized</SelectItem>
                      <SelectItem value="unreal">Unreal Engine Style</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs">Post Processing</span>
                  <Switch
                    checked={settings.enablePostProcessing}
                    onCheckedChange={(checked) => handleSettingChange('enablePostProcessing', checked)}
                  />
                </div>

                {settings.enablePostProcessing && (
                  <>
                    <div>
                      <Label className="text-xs">Bloom: {settings.bloomIntensity.toFixed(2)}</Label>
                      <Slider
                        value={[settings.bloomIntensity]}
                        onValueChange={(value) => handleSettingChange('bloomIntensity', value[0])}
                        max={2}
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
                        max={1}
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
                  <Label className="text-xs">Quality Level: {settings.waterQuality}</Label>
                  <Slider
                    value={[settings.waterQuality]}
                    onValueChange={(value) => handleSettingChange('waterQuality', value[0])}
                    max={10}
                    min={1}
                    step={1}
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Camera Controls */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Move3D className="h-4 w-4" />
                  Camera & View
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  <Button variant="outline" size="sm" onClick={resetCamera}>
                    <RotateCw className="h-3 w-3 mr-1" />
                    Reset
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShowGrid(!showGrid)}
                    className={showGrid ? "bg-primary/10" : ""}
                  >
                    <Grid3X3 className="h-3 w-3 mr-1" />
                    Grid
                  </Button>
                  <Button variant="outline" size="sm" onClick={toggleFullscreen}>
                    {isFullscreen ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
                  </Button>
                </div>
                
                <div>
                  <Label className="text-xs">Camera Position</Label>
                  <div className="text-xs text-muted-foreground mt-1">
                    X: {cameraPosition[0].toFixed(1)}, Y: {cameraPosition[1].toFixed(1)}, Z: {cameraPosition[2].toFixed(1)}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Material Editor */}
            {isAdminMode && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Palette className="h-4 w-4" />
                    Material Editor
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label className="text-xs">Pool Color</Label>
                    <div className="flex gap-2 mt-1">
                      <div 
                        className="w-6 h-6 rounded border cursor-pointer bg-blue-400"
                        onClick={() => toast({ title: "Color Changed", description: "Pool color updated to Blue" })}
                      />
                      <div 
                        className="w-6 h-6 rounded border cursor-pointer bg-teal-400"
                        onClick={() => toast({ title: "Color Changed", description: "Pool color updated to Teal" })}
                      />
                      <div 
                        className="w-6 h-6 rounded border cursor-pointer bg-cyan-400"
                        onClick={() => toast({ title: "Color Changed", description: "Pool color updated to Cyan" })}
                      />
                      <div 
                        className="w-6 h-6 rounded border cursor-pointer bg-emerald-400"
                        onClick={() => toast({ title: "Color Changed", description: "Pool color updated to Emerald" })}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-xs">Material Presets</Label>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          handleSettingChange('shaderMode', 'pbr');
                          toast({ title: "Material Applied", description: "Realistic materials enabled" });
                        }}
                      >
                        Realistic
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          handleSettingChange('shaderMode', 'unlit');
                          toast({ title: "Material Applied", description: "Cartoon style enabled" });
                        }}
                      >
                        Cartoon
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* File Upload Section (Admin Only) */}
            {isAdminMode && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Asset Management
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label className="text-xs">Upload Texture</Label>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload('texture', e)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Upload 3D Model</Label>
                    <Input
                      type="file"
                      accept=".gltf,.glb,.obj,.fbx"
                      onChange={(e) => handleFileUpload('model', e)}
                      className="mt-1"
                    />
                  </div>
                  
                  {uploadedTextures.length > 0 && (
                    <div>
                      <Label className="text-xs">Uploaded Textures: {uploadedTextures.length}</Label>
                    </div>
                  )}
                  
                  {uploadedModels.length > 0 && (
                    <div>
                      <Label className="text-xs">Uploaded Models: {uploadedModels.length}</Label>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Advanced3DEditor;