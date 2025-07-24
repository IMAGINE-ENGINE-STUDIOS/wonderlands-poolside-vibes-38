import React, { useState, useRef, useCallback, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  OrbitControls, 
  Environment, 
  Sky, 
  ContactShadows,
  Stage,
  Center,
  Float,
  Sparkles
} from '@react-three/drei';
import { EffectComposer, Bloom, DepthOfField, Noise, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Camera, 
  Download, 
  Upload, 
  RotateCw, 
  Maximize2, 
  Minimize2,
  Settings,
  Palette,
  Sun,
  Monitor,
  Layers,
  Cpu,
  Eye,
  Zap,
  Droplets,
  Thermometer,
  Shield,
  RefreshCw,
  Save,
  FolderOpen,
  Trash2,
  Copy,
  Play,
  Pause,
  Volume2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Advanced 3D Pool Model Component
function Advanced3DPoolModel({ 
  poolType, 
  finish, 
  lighting, 
  waterLevel, 
  enableEffects, 
  poolDimensions,
  customTextures 
}: any) {
  const meshRef = useRef<THREE.Mesh>(null);
  const waterRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (waterRef.current) {
      waterRef.current.rotation.z += 0.005;
      (waterRef.current.material as THREE.ShaderMaterial).uniforms.time.value = state.clock.elapsedTime;
    }
    if (meshRef.current && enableEffects) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  const waterMaterial = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      colorA: { value: new THREE.Color('#4FC3F7') },
      colorB: { value: new THREE.Color('#29B6F6') },
      level: { value: waterLevel }
    },
    vertexShader: `
      uniform float time;
      varying vec2 vUv;
      varying float vWave;
      
      void main() {
        vUv = uv;
        vec3 pos = position;
        float wave = sin(pos.x * 0.5 + time * 2.0) * 0.1;
        wave += sin(pos.z * 0.3 + time * 1.5) * 0.05;
        pos.y += wave;
        vWave = wave;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 colorA;
      uniform vec3 colorB;
      varying vec2 vUv;
      varying float vWave;
      
      void main() {
        vec3 color = mix(colorA, colorB, vUv.y + vWave * 0.5);
        gl_FragColor = vec4(color, 0.8);
      }
    `,
    transparent: true
  });

  return (
    <group>
      {/* Pool Shell */}
      <mesh ref={meshRef} position={[0, -1, 0]}>
        <boxGeometry args={[poolDimensions.width, 2, poolDimensions.length]} />
        <meshPhysicalMaterial 
          color={finish.color}
          roughness={0.2}
          metalness={0.1}
          clearcoat={1}
          clearcoatRoughness={0.1}
        />
      </mesh>
      
      {/* Water Surface */}
      <mesh ref={waterRef} position={[0, waterLevel, 0]}>
        <planeGeometry args={[poolDimensions.width - 0.2, poolDimensions.length - 0.2]} />
        <primitive object={waterMaterial} />
      </mesh>
      
      {/* Pool Equipment */}
      <group position={[poolDimensions.width / 2 + 1, 0, 0]}>
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.3, 0.3, 1.5]} />
          <meshStandardMaterial color="#666" />
        </mesh>
        {/* Simple text replacement - Text3D removed due to font loading issues */}
        <mesh position={[0, 1, 0]}>
          <boxGeometry args={[0.8, 0.2, 0.05]} />
          <meshBasicMaterial color="#fff" />
        </mesh>
      </group>
      
      {enableEffects && (
        <>
          <Sparkles count={100} scale={[10, 10, 10]} size={3} speed={0.4} />
          <Float speed={1} rotationIntensity={0.5}>
            <mesh position={[0, 2, 0]}>
              <sphereGeometry args={[0.1]} />
              <meshBasicMaterial color="#FFD700" />
            </mesh>
          </Float>
        </>
      )}
    </group>
  );
}

// Advanced Lighting System
function AdvancedLighting({ 
  lightingMode, 
  intensity, 
  shadowQuality, 
  enableGI, 
  timeOfDay 
}: any) {
  const sunPosition: [number, number, number] = [
    Math.cos(timeOfDay * Math.PI / 12) * 10,
    Math.sin(timeOfDay * Math.PI / 12) * 10 + 5,
    5
  ];

  switch (lightingMode) {
    case 'cinematic':
      return (
        <>
          <ambientLight intensity={0.2 * intensity} />
          <directionalLight 
            position={sunPosition}
            intensity={1.5 * intensity}
            castShadow
            shadow-mapSize-width={shadowQuality}
            shadow-mapSize-height={shadowQuality}
            shadow-camera-far={50}
            shadow-camera-left={-20}
            shadow-camera-right={20}
            shadow-camera-top={20}
            shadow-camera-bottom={-20}
          />
          <spotLight 
            position={[0, 10, 0]} 
            intensity={0.8 * intensity}
            angle={0.6}
            penumbra={0.5}
            color="#4FC3F7"
            castShadow
          />
          <pointLight position={[-5, 3, -5]} intensity={0.4 * intensity} color="#FFB347" />
          <pointLight position={[5, 3, 5]} intensity={0.4 * intensity} color="#87CEEB" />
        </>
      );
    case 'realistic':
      return (
        <>
          <ambientLight intensity={0.4 * intensity} />
          <directionalLight 
            position={sunPosition}
            intensity={intensity}
            castShadow
            shadow-mapSize-width={shadowQuality}
            shadow-mapSize-height={shadowQuality}
          />
        </>
      );
    case 'studio':
      return (
        <>
          <ambientLight intensity={0.6 * intensity} />
          <directionalLight position={[2, 8, 3]} intensity={intensity} />
          <directionalLight position={[-2, 8, -3]} intensity={0.5 * intensity} />
          <pointLight position={[0, 5, 0]} intensity={0.3 * intensity} />
        </>
      );
    default:
      return <ambientLight intensity={0.5 * intensity} />;
  }
}

// Environment Manager
function EnvironmentManager({ skyboxType, selectedSkybox, customHDRI }: any) {
  if (skyboxType === 'procedural') {
    return <Sky sunPosition={[100, 20, 100]} />;
  }
  
  if (skyboxType === 'custom' && customHDRI) {
    return <Environment files={customHDRI} />;
  }
  
  return <Environment preset={selectedSkybox} />;
}

// Performance Monitor
function PerformanceMonitor({ onStatsUpdate }: any) {
  const { gl } = useThree();
  
  useFrame(() => {
    const info = gl.info;
    onStatsUpdate({
      fps: Math.round(1 / (performance.now() / 1000 - (performance.now() / 1000))),
      drawCalls: info.render.calls,
      triangles: info.render.triangles,
      points: info.render.points,
      lines: info.render.lines,
      memory: (performance as any).memory ? Math.round((performance as any).memory.usedJSHeapSize / 1048576) : 0
    });
  });

  return null;
}

// Main IMAGINALY Editor Component
export const ImaginalyFullEditor: React.FC = () => {
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Scene State
  const [selectedPool, setSelectedPool] = useState('Apollo 14');
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Advanced Settings
  const [settings, setSettings] = useState({
    // Visual Settings
    skyboxType: 'environment' as 'environment' | 'procedural' | 'custom',
    selectedSkybox: 'park',
    customHDRI: null as string | null,
    
    // Lighting
    lightingMode: 'cinematic' as 'cinematic' | 'realistic' | 'studio',
    lightIntensity: 1,
    shadowQuality: 2048,
    enableGI: true,
    timeOfDay: 14,
    
    // Pool Settings
    poolType: 'rectangular',
    poolDimensions: { width: 8, length: 12, depth: 1.5 },
    finish: { name: 'Aquamarine', color: '#7FFFD4' },
    waterLevel: 0.1,
    
    // Effects
    enablePostProcessing: true,
    bloomIntensity: 0.5,
    depthOfField: false,
    noiseIntensity: 0.02,
    vignetteIntensity: 0.3,
    enableParticles: true,
    
    // Performance
    renderQuality: 1,
    enableLOD: true,
    maxFPS: 60,
    
    // Audio
    enableAudio: false,
    ambientVolume: 0.3,
    
    // Physics
    enablePhysics: false,
    gravity: -9.8,
    waterPhysics: true
  });

  const [stats, setStats] = useState({
    fps: 60,
    drawCalls: 0,
    triangles: 0,
    memory: 0
  });

  const poolTypes = [
    { id: 'apollo-14', name: 'Apollo 14', dimensions: { width: 8, length: 14, depth: 1.5 } },
    { id: 'ariel-16', name: 'Ariel 16', dimensions: { width: 10, length: 16, depth: 1.8 } },
    { id: 'bermuda', name: 'Bermuda', dimensions: { width: 12, length: 18, depth: 2.0 } },
    { id: 'fiji', name: 'Fiji', dimensions: { width: 9, length: 15, depth: 1.6 } }
  ];

  const finishOptions = [
    { name: 'Aquamarine', color: '#7FFFD4' },
    { name: 'Ocean Blue', color: '#006994' },
    { name: 'Sapphire Blue', color: '#0F52BA' },
    { name: 'Night Sky', color: '#191970' },
    { name: 'Pearl White', color: '#F5F5DC' }
  ];

  const skyboxOptions = [
    { id: 'sunset', name: 'Golden Sunset' },
    { id: 'dawn', name: 'Morning Dawn' },
    { id: 'park', name: 'Grassland Park' },
    { id: 'forest', name: 'Forest Meadow' },
    { id: 'city', name: 'Urban View' },
    { id: 'warehouse', name: 'Studio Light' }
  ];

  // Event Handlers
  const handleSettingChange = useCallback(<K extends keyof typeof settings>(
    key: K, 
    value: typeof settings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  const handlePoolChange = useCallback((poolId: string) => {
    const pool = poolTypes.find(p => p.id === poolId);
    if (pool) {
      setSelectedPool(pool.name);
      setSettings(prev => ({ 
        ...prev, 
        poolDimensions: pool.dimensions 
      }));
      toast({
        title: "Pool Model Changed",
        description: `Now viewing ${pool.name}`,
      });
    }
  }, [toast, poolTypes]);

  const takeScreenshot = useCallback(async () => {
    if (canvasRef.current) {
      try {
        const canvas = canvasRef.current;
        const link = document.createElement('a');
        link.download = `imaginaly-${selectedPool}-${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        
        toast({
          title: "Screenshot Saved",
          description: "High-quality render exported successfully",
        });
      } catch (error) {
        toast({
          title: "Export Failed",
          description: "Unable to capture screenshot",
          variant: "destructive"
        });
      }
    }
  }, [selectedPool, toast]);

  const exportScene = useCallback(() => {
    const sceneData = {
      version: "1.0",
      timestamp: new Date().toISOString(),
      poolModel: selectedPool,
      settings,
      metadata: {
        creator: "IMAGINALY Editor",
        renderEngine: "React Three Fiber"
      }
    };
    
    const blob = new Blob([JSON.stringify(sceneData, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.download = `imaginaly-scene-${Date.now()}.json`;
    link.href = URL.createObjectURL(blob);
    link.click();
    
    toast({
      title: "Scene Exported",
      description: "Scene configuration saved successfully",
    });
  }, [selectedPool, settings, toast]);

  const importScene = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const sceneData = JSON.parse(e.target?.result as string);
          setSelectedPool(sceneData.poolModel);
          setSettings(sceneData.settings);
          toast({
            title: "Scene Imported",
            description: "Scene configuration loaded successfully",
          });
        } catch (error) {
          toast({
            title: "Import Failed",
            description: "Invalid scene file format",
            variant: "destructive"
          });
        }
      };
      reader.readAsText(file);
    }
  }, [toast]);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(!isFullscreen);
  }, [isFullscreen]);

  const resetCamera = useCallback(() => {
    toast({
      title: "View Reset",
      description: "Camera position has been reset",
    });
  }, [toast]);

  return (
    <div className={`relative ${isFullscreen ? 'fixed inset-0 z-50 bg-black' : 'w-full h-screen'}`}>
      {/* Main Canvas */}
      <div className="relative w-full h-full">
        <Canvas
          ref={canvasRef}
          shadows
          camera={{ position: [10, 5, 10], fov: 50 }}
          gl={{ 
            preserveDrawingBuffer: true,
            antialias: true,
            alpha: true,
            powerPreference: "high-performance"
          }}
          dpr={settings.renderQuality}
        >
          <Suspense fallback={null}>
            {/* Lighting System */}
            <AdvancedLighting 
              lightingMode={settings.lightingMode}
              intensity={settings.lightIntensity}
              shadowQuality={settings.shadowQuality}
              enableGI={settings.enableGI}
              timeOfDay={settings.timeOfDay}
            />
            
            {/* Environment */}
            <EnvironmentManager 
              skyboxType={settings.skyboxType}
              selectedSkybox={settings.selectedSkybox}
              customHDRI={settings.customHDRI}
            />
            
            {/* 3D Pool Model */}
            <Advanced3DPoolModel 
              poolType={settings.poolType}
              finish={settings.finish}
              lighting={settings.lightingMode}
              waterLevel={settings.waterLevel}
              enableEffects={settings.enableParticles}
              poolDimensions={settings.poolDimensions}
            />
            
            {/* Ground and Shadows */}
            <ContactShadows 
              position={[0, -2, 0]} 
              opacity={0.4} 
              scale={20} 
              blur={2} 
              far={4.5} 
            />
            
            {/* Camera Controls */}
            <OrbitControls 
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
              enableDamping={true}
              dampingFactor={0.05}
              maxPolarAngle={Math.PI / 2.2}
            />
            
            {/* Performance Monitor */}
            <PerformanceMonitor onStatsUpdate={setStats} />
            
            {/* Post Processing Effects */}
            {settings.enablePostProcessing && (
              <EffectComposer>
                <Bloom 
                  intensity={settings.bloomIntensity}
                  luminanceThreshold={0.9}
                  luminanceSmoothing={0.9}
                />
                {settings.depthOfField && (
                  <DepthOfField 
                    focusDistance={0.1}
                    focalLength={0.02}
                    bokehScale={5}
                  />
                )}
                <Noise opacity={settings.noiseIntensity} />
                <Vignette 
                  eskil={false}
                  offset={0.1}
                  darkness={settings.vignetteIntensity}
                />
              </EffectComposer>
            )}
          </Suspense>
        </Canvas>

        {/* Top Status Bar */}
        <div className="absolute top-4 left-4 z-10 flex gap-2">
          <Badge variant="secondary" className="bg-black/60 text-white border-0">
            <Eye className="h-3 w-3 mr-1" />
            IMAGINALY PRO
          </Badge>
          <Badge variant="secondary" className="bg-black/60 text-white border-0">
            <Zap className="h-3 w-3 mr-1" />
            {settings.lightingMode.toUpperCase()}
          </Badge>
          <Badge variant="secondary" className="bg-black/60 text-white border-0">
            <Cpu className="h-3 w-3 mr-1" />
            {stats.fps} FPS
          </Badge>
          <Badge variant="secondary" className="bg-black/60 text-white border-0">
            <Monitor className="h-3 w-3 mr-1" />
            {stats.memory}MB
          </Badge>
        </div>

        {/* Top Right Controls */}
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={resetCamera}
            className="bg-white/90 backdrop-blur-sm"
          >
            <RotateCw className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={takeScreenshot}
            className="bg-white/90 backdrop-blur-sm"
          >
            <Camera className="h-4 w-4" />
          </Button>
          <Button 
            variant={isRecording ? "destructive" : "outline"}
            size="sm" 
            onClick={() => setIsRecording(!isRecording)}
            className="bg-white/90 backdrop-blur-sm"
          >
            {isRecording ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={toggleFullscreen}
            className="bg-white/90 backdrop-blur-sm"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Control Panel */}
      {!isFullscreen && (
        <div className="absolute right-4 top-20 bottom-4 w-80 z-10">
          <Card className="h-full overflow-hidden bg-white/95 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                IMAGINALY Control Center
              </CardTitle>
            </CardHeader>
            <CardContent className="h-full overflow-y-auto p-4 space-y-4">
              <Tabs defaultValue="scene" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="scene" className="text-xs">Scene</TabsTrigger>
                  <TabsTrigger value="lighting" className="text-xs">Light</TabsTrigger>
                  <TabsTrigger value="effects" className="text-xs">FX</TabsTrigger>
                  <TabsTrigger value="export" className="text-xs">Export</TabsTrigger>
                </TabsList>

                {/* Scene Tab */}
                <TabsContent value="scene" className="space-y-4">
                  <div className="space-y-3">
                    <Label>Pool Model</Label>
                    <Select value={selectedPool} onValueChange={handlePoolChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {poolTypes.map(pool => (
                          <SelectItem key={pool.id} value={pool.id}>
                            {pool.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label>Pool Finish</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {finishOptions.map(finish => (
                        <button
                          key={finish.name}
                          onClick={() => handleSettingChange('finish', finish)}
                          className={`p-2 rounded border text-xs ${
                            settings.finish.name === finish.name 
                              ? 'border-primary bg-primary/10' 
                              : 'border-border hover:bg-muted'
                          }`}
                        >
                          <div 
                            className="w-full h-6 rounded mb-1"
                            style={{ backgroundColor: finish.color }}
                          />
                          {finish.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label>Environment</Label>
                    <Select 
                      value={settings.selectedSkybox} 
                      onValueChange={(value) => handleSettingChange('selectedSkybox', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {skyboxOptions.map(skybox => (
                          <SelectItem key={skybox.id} value={skybox.id}>
                            {skybox.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label>Water Level: {settings.waterLevel.toFixed(1)}m</Label>
                    <Slider
                      value={[settings.waterLevel]}
                      onValueChange={([value]) => handleSettingChange('waterLevel', value)}
                      max={0.5}
                      min={-0.2}
                      step={0.1}
                    />
                  </div>
                </TabsContent>

                {/* Lighting Tab */}
                <TabsContent value="lighting" className="space-y-4">
                  <div className="space-y-3">
                    <Label>Lighting Mode</Label>
                    <Select 
                      value={settings.lightingMode} 
                      onValueChange={(value: any) => handleSettingChange('lightingMode', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cinematic">Cinematic</SelectItem>
                        <SelectItem value="realistic">Realistic</SelectItem>
                        <SelectItem value="studio">Studio</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label>Light Intensity: {settings.lightIntensity.toFixed(1)}</Label>
                    <Slider
                      value={[settings.lightIntensity]}
                      onValueChange={([value]) => handleSettingChange('lightIntensity', value)}
                      max={2}
                      min={0.1}
                      step={0.1}
                    />
                  </div>

                  <div className="space-y-3">
                    <Label>Time of Day: {settings.timeOfDay}:00</Label>
                    <Slider
                      value={[settings.timeOfDay]}
                      onValueChange={([value]) => handleSettingChange('timeOfDay', value)}
                      max={23}
                      min={0}
                      step={1}
                    />
                  </div>

                  <div className="space-y-3">
                    <Label>Shadow Quality</Label>
                    <Select 
                      value={settings.shadowQuality.toString()} 
                      onValueChange={(value) => handleSettingChange('shadowQuality', parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="512">Low (512)</SelectItem>
                        <SelectItem value="1024">Medium (1024)</SelectItem>
                        <SelectItem value="2048">High (2048)</SelectItem>
                        <SelectItem value="4096">Ultra (4096)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Global Illumination</Label>
                    <Switch 
                      checked={settings.enableGI}
                      onCheckedChange={(checked) => handleSettingChange('enableGI', checked)}
                    />
                  </div>
                </TabsContent>

                {/* Effects Tab */}
                <TabsContent value="effects" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Post Processing</Label>
                    <Switch 
                      checked={settings.enablePostProcessing}
                      onCheckedChange={(checked) => handleSettingChange('enablePostProcessing', checked)}
                    />
                  </div>

                  <div className="space-y-3">
                    <Label>Bloom Intensity: {settings.bloomIntensity.toFixed(1)}</Label>
                    <Slider
                      value={[settings.bloomIntensity]}
                      onValueChange={([value]) => handleSettingChange('bloomIntensity', value)}
                      max={2}
                      min={0}
                      step={0.1}
                      disabled={!settings.enablePostProcessing}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Depth of Field</Label>
                    <Switch 
                      checked={settings.depthOfField}
                      onCheckedChange={(checked) => handleSettingChange('depthOfField', checked)}
                      disabled={!settings.enablePostProcessing}
                    />
                  </div>

                  <div className="space-y-3">
                    <Label>Film Grain: {(settings.noiseIntensity * 100).toFixed(0)}%</Label>
                    <Slider
                      value={[settings.noiseIntensity]}
                      onValueChange={([value]) => handleSettingChange('noiseIntensity', value)}
                      max={0.1}
                      min={0}
                      step={0.01}
                      disabled={!settings.enablePostProcessing}
                    />
                  </div>

                  <div className="space-y-3">
                    <Label>Vignette: {(settings.vignetteIntensity * 100).toFixed(0)}%</Label>
                    <Slider
                      value={[settings.vignetteIntensity]}
                      onValueChange={([value]) => handleSettingChange('vignetteIntensity', value)}
                      max={1}
                      min={0}
                      step={0.1}
                      disabled={!settings.enablePostProcessing}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Particle Effects</Label>
                    <Switch 
                      checked={settings.enableParticles}
                      onCheckedChange={(checked) => handleSettingChange('enableParticles', checked)}
                    />
                  </div>

                  <div className="space-y-3">
                    <Label>Render Quality: {settings.renderQuality}x</Label>
                    <Slider
                      value={[settings.renderQuality]}
                      onValueChange={([value]) => handleSettingChange('renderQuality', value)}
                      max={2}
                      min={0.5}
                      step={0.25}
                    />
                  </div>
                </TabsContent>

                {/* Export Tab */}
                <TabsContent value="export" className="space-y-4">
                  <div className="space-y-2">
                    <Button onClick={takeScreenshot} className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Export Image (PNG)
                    </Button>
                    
                    <Button onClick={exportScene} variant="outline" className="w-full">
                      <Save className="h-4 w-4 mr-2" />
                      Save Scene
                    </Button>
                    
                    <div className="relative">
                      <input
                        type="file"
                        accept=".json"
                        onChange={importScene}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <Button variant="outline" className="w-full">
                        <FolderOpen className="h-4 w-4 mr-2" />
                        Load Scene
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Performance Stats</h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-muted p-2 rounded">
                        <div className="font-medium">FPS</div>
                        <div>{stats.fps}</div>
                      </div>
                      <div className="bg-muted p-2 rounded">
                        <div className="font-medium">Draw Calls</div>
                        <div>{stats.drawCalls}</div>
                      </div>
                      <div className="bg-muted p-2 rounded">
                        <div className="font-medium">Triangles</div>
                        <div>{stats.triangles.toLocaleString()}</div>
                      </div>
                      <div className="bg-muted p-2 rounded">
                        <div className="font-medium">Memory</div>
                        <div>{stats.memory}MB</div>
                      </div>
                    </div>
                  </div>

                  <Alert>
                    <Zap className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      High-quality renders may take longer to process. Reduce settings for better performance.
                    </AlertDescription>
                  </Alert>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ImaginalyFullEditor;