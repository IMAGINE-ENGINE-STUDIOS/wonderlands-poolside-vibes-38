import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Monitor, 
  Maximize2, 
  Minimize2, 
  Settings, 
  Play, 
  Pause, 
  RotateCw, 
  Eye, 
  EyeOff,
  Camera,
  Sun,
  CloudRain,
  Wind,
  Waves,
  Palette,
  Cpu,
  Zap,
  Square
} from 'lucide-react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Float, Sparkles } from '@react-three/drei';
import { Suspense } from 'react';
import NvidiaEnhanced3DViewer from './NvidiaEnhanced3DViewer';
import Enhanced3DPoolViewer from './Enhanced3DPoolViewer';

interface Enhanced3DVisualizerConsoleProps {
  className?: string;
}

interface ConsoleSettings {
  renderMode: 'standard' | 'nvidia' | 'enhanced';
  autoRotate: boolean;
  showWireframe: boolean;
  enablePhysics: boolean;
  enableRTX: boolean;
  environmentPreset: string;
  renderQuality: number;
  animationSpeed: number;
}

interface ViewerStats {
  fps: number;
  vertices: number;
  triangles: number;
  drawCalls: number;
  memoryUsage: number;
}

const Enhanced3DVisualizerConsole = ({ className = "" }: Enhanced3DVisualizerConsoleProps) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showConsole, setShowConsole] = useState(true);
  const [selectedPool, setSelectedPool] = useState('Apollo 14');
  
  const [settings, setSettings] = useState<ConsoleSettings>({
    renderMode: 'nvidia',
    autoRotate: true,
    showWireframe: false,
    enablePhysics: true,
    enableRTX: true,
    environmentPreset: 'sunset',
    renderQuality: 80,
    animationSpeed: 1.0
  });

  const [stats, setStats] = useState<ViewerStats>({
    fps: 60,
    vertices: 12450,
    triangles: 8230,
    drawCalls: 15,
    memoryUsage: 245
  });

  const [consoleLog, setConsoleLog] = useState([
    { time: '15:30:42', level: 'info', message: '3D Viewer initialized successfully' },
    { time: '15:30:43', level: 'info', message: 'NVIDIA RTX features enabled' },
    { time: '15:30:44', level: 'info', message: 'PhysX water simulation started' },
    { time: '15:30:45', level: 'success', message: 'Pool model loaded: Apollo 14' },
    { time: '15:30:46', level: 'info', message: 'Camera controls active' }
  ]);

  const poolModels = [
    'Apollo 14', 'Ariel 16', 'Astoria 12', 'Bermuda', 'Cape Cod', 
    'Coral 16', 'Enchantment 917', 'Fiji', 'Genesis', 'Jamaica'
  ];

  const environmentPresets = [
    { value: 'sunset', label: 'Sunset' },
    { value: 'dawn', label: 'Dawn' },
    { value: 'apartment', label: 'Studio' },
    { value: 'forest', label: 'Forest' },
    { value: 'park', label: 'Park' },
    { value: 'warehouse', label: 'Warehouse' }
  ];

  // Simulate stats updates
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        fps: 58 + Math.random() * 4,
        vertices: 12000 + Math.random() * 1000,
        memoryUsage: 240 + Math.random() * 20
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const addToConsole = (level: 'info' | 'success' | 'warning' | 'error', message: string) => {
    const time = new Date().toLocaleTimeString();
    setConsoleLog(prev => [...prev.slice(-10), { time, level, message }]);
  };

  const handleSettingChange = <K extends keyof ConsoleSettings>(
    key: K, 
    value: ConsoleSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    addToConsole('info', `${key} changed to ${value}`);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    addToConsole('info', isFullscreen ? 'Exited fullscreen mode' : 'Entered fullscreen mode');
  };

  const toggleMinimized = () => {
    setIsMinimized(!isMinimized);
    addToConsole('info', isMinimized ? 'Console restored' : 'Console minimized');
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
    addToConsole('info', isPlaying ? 'Animation paused' : 'Animation resumed');
  };

  const resetCamera = () => {
    addToConsole('info', 'Camera position reset');
  };

  const renderViewer = () => {
    const commonProps = {
      poolModel: selectedPool,
      dimensions: "Interactive 3D Model",
      className: "w-full h-full"
    };

    switch (settings.renderMode) {
      case 'nvidia':
        return <NvidiaEnhanced3DViewer {...commonProps} />;
      case 'enhanced':
        return <Enhanced3DPoolViewer {...commonProps} />;
      default:
        return <Enhanced3DPoolViewer {...commonProps} />;
    }
  };

  if (isMinimized) {
    return (
      <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
        <Button onClick={toggleMinimized} className="flex items-center gap-2">
          <Monitor className="h-4 w-4" />
          3D Console
        </Button>
      </div>
    );
  }

  const content = (
    <div className="flex h-full bg-background">
      {/* Main 3D Viewer */}
      <div className="flex-1 relative">
        {/* Viewer Controls Overlay */}
        <div className="absolute top-4 left-4 z-10 flex gap-2">
          <Badge className="bg-black/50 text-white">
            <Eye className="h-3 w-3 mr-1" />
            {settings.renderMode.toUpperCase()} Mode
          </Badge>
          <Badge className="bg-black/50 text-white">
            <Cpu className="h-3 w-3 mr-1" />
            {stats.fps.toFixed(0)} FPS
          </Badge>
        </div>

        <div className="absolute top-4 right-4 z-10 flex gap-2">
          <Button variant="outline" size="sm" onClick={togglePlayPause}>
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <Button variant="outline" size="sm" onClick={resetCamera}>
            <RotateCw className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowConsole(!showConsole)}>
            {showConsole ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
          {!isFullscreen && (
            <Button variant="outline" size="sm" onClick={toggleMinimized}>
              <Minimize2 className="h-4 w-4" />
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={toggleFullscreen}>
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>

        {/* 3D Viewer */}
        <div className="w-full h-full">
          {renderViewer()}
        </div>
      </div>

      {/* Console Panel */}
      {showConsole && (
        <div className="w-80 border-l bg-card flex flex-col">
          {/* Console Header */}
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              3D Visualizer Console
            </h3>
          </div>

          {/* Console Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
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

            {/* Render Settings */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Render Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-xs font-medium">Render Mode</label>
                  <Select 
                    value={settings.renderMode} 
                    onValueChange={(value) => handleSettingChange('renderMode', value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="enhanced">Enhanced</SelectItem>
                      <SelectItem value="nvidia">NVIDIA RTX</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-xs font-medium">Environment</label>
                  <Select 
                    value={settings.environmentPreset} 
                    onValueChange={(value) => handleSettingChange('environmentPreset', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {environmentPresets.map(preset => (
                        <SelectItem key={preset.value} value={preset.value}>
                          {preset.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-xs font-medium">Quality: {settings.renderQuality}%</label>
                  <Slider
                    value={[settings.renderQuality]}
                    onValueChange={(value) => handleSettingChange('renderQuality', value[0])}
                    max={100}
                    min={25}
                    step={5}
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium">Animation Speed: {settings.animationSpeed.toFixed(1)}x</label>
                  <Slider
                    value={[settings.animationSpeed]}
                    onValueChange={(value) => handleSettingChange('animationSpeed', value[0])}
                    max={3}
                    min={0.1}
                    step={0.1}
                    className="mt-1"
                  />
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs">Auto Rotate</span>
                    <Switch
                      checked={settings.autoRotate}
                      onCheckedChange={(checked) => handleSettingChange('autoRotate', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs">Wireframe</span>
                    <Switch
                      checked={settings.showWireframe}
                      onCheckedChange={(checked) => handleSettingChange('showWireframe', checked)}
                    />
                  </div>
                  {settings.renderMode === 'nvidia' && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-xs">PhysX Physics</span>
                        <Switch
                          checked={settings.enablePhysics}
                          onCheckedChange={(checked) => handleSettingChange('enablePhysics', checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs">RTX Ray Tracing</span>
                        <Switch
                          checked={settings.enableRTX}
                          onCheckedChange={(checked) => handleSettingChange('enableRTX', checked)}
                        />
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Performance Stats */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>FPS</span>
                  <span className="font-mono">{stats.fps.toFixed(1)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>Vertices</span>
                  <span className="font-mono">{stats.vertices.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>Triangles</span>
                  <span className="font-mono">{stats.triangles.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>Draw Calls</span>
                  <span className="font-mono">{stats.drawCalls}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>Memory</span>
                  <span className="font-mono">{stats.memoryUsage.toFixed(1)} MB</span>
                </div>
              </CardContent>
            </Card>

            {/* Console Log */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Console Log</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 text-xs font-mono max-h-32 overflow-y-auto">
                  {consoleLog.map((log, index) => (
                    <div key={index} className={`flex gap-2 ${
                      log.level === 'error' ? 'text-red-500' :
                      log.level === 'warning' ? 'text-yellow-500' :
                      log.level === 'success' ? 'text-green-500' :
                      'text-muted-foreground'
                    }`}>
                      <span className="text-muted-foreground">{log.time}</span>
                      <span>{log.message}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );

  if (isFullscreen) {
    return (
      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent className="max-w-none h-screen m-0 p-0">
          {content}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <div className={`h-[600px] bg-background border rounded-lg overflow-hidden ${className}`}>
      {content}
    </div>
  );
};

export default Enhanced3DVisualizerConsole;