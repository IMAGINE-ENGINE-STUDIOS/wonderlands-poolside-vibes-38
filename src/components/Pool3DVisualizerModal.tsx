import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { X, RotateCcw, Palette, Square, Waves } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Box, Sphere, Plane } from "@react-three/drei";
import * as THREE from "three";

interface Pool3DVisualizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  poolModel: string;
}

// Pool geometry component
const PoolGeometry = ({ color = "#4A90E2", tileType = "none" }: { color?: string; tileType?: string }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current && state.camera) {
      // Gentle floating animation
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
    }
  });

  const getTileTexture = () => {
    if (tileType === "mosaic") return "#1E40AF";
    if (tileType === "ceramic") return "#0F766E";
    if (tileType === "natural") return "#A16207";
    return color;
  };

  return (
    <group>
      {/* Pool Shell */}
      <mesh ref={meshRef} position={[0, -0.5, 0]}>
        <boxGeometry args={[8, 1, 4]} />
        <meshStandardMaterial color={getTileTexture()} transparent opacity={0.8} />
      </mesh>
      
      {/* Water Surface */}
      <mesh position={[0, 0, 0]}>
        <planeGeometry args={[7.8, 3.8]} />
        <meshStandardMaterial 
          color="#0EA5E9" 
          transparent 
          opacity={0.6}
          roughness={0.1}
          metalness={0.1}
        />
      </mesh>
      
      {/* Pool Edge/Coping */}
      <mesh position={[0, 0.1, 0]}>
        <ringGeometry args={[4, 4.2, 32]} />
        <meshStandardMaterial color="#D4D4D8" />
      </mesh>
    </group>
  );
};

// Paver/Deck component
const PoolDeck = ({ paverType = "concrete", paverColor = "#9CA3AF" }: { paverType?: string; paverColor?: string }) => {
  const getPaverColor = () => {
    if (paverType === "travertine") return "#F3E8D0";
    if (paverType === "brick") return "#B91C1C";
    if (paverType === "stone") return "#64748B";
    return paverColor;
  };

  return (
    <group>
      {/* Main deck area */}
      <mesh position={[0, -0.6, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[16, 12]} />
        <meshStandardMaterial color={getPaverColor()} />
      </mesh>
      
      {/* Paver pattern lines */}
      {paverType !== "concrete" && (
        <>
          {Array.from({ length: 8 }, (_, i) => (
            <mesh key={`line-x-${i}`} position={[-7 + i * 2, -0.59, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[0.05, 12]} />
              <meshStandardMaterial color="#374151" />
            </mesh>
          ))}
          {Array.from({ length: 6 }, (_, i) => (
            <mesh key={`line-y-${i}`} position={[0, -0.59, -5 + i * 2]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[16, 0.05]} />
              <meshStandardMaterial color="#374151" />
            </mesh>
          ))}
        </>
      )}
    </group>
  );
};

// Pool equipment and accessories
const PoolAccessories = () => {
  return (
    <group>
      {/* Pool lights */}
      <Sphere args={[0.1]} position={[-3, -0.3, 1]}>
        <meshStandardMaterial color="#FEF08A" emissive="#FEF08A" emissiveIntensity={0.5} />
      </Sphere>
      <Sphere args={[0.1]} position={[3, -0.3, 1]}>
        <meshStandardMaterial color="#FEF08A" emissive="#FEF08A" emissiveIntensity={0.5} />
      </Sphere>
      
      {/* Pool steps */}
      <group position={[0, -0.4, -1.8]}>
        <Box args={[1, 0.2, 0.3]} position={[0, 0, 0]}>
          <meshStandardMaterial color="#E5E7EB" />
        </Box>
        <Box args={[1, 0.2, 0.3]} position={[0, -0.2, 0.3]}>
          <meshStandardMaterial color="#E5E7EB" />
        </Box>
      </group>
    </group>
  );
};

// Pricing data for materials
const materialPricing = {
  tiles: {
    mosaic: { price: 8500, name: "Glass Mosaic" },
    ceramic: { price: 4200, name: "Ceramic Tile" },
    natural: { price: 12000, name: "Natural Stone" }
  },
  pavers: {
    concrete: { price: 2800, name: "Stamped Concrete" },
    travertine: { price: 8500, name: "Travertine" },
    brick: { price: 6200, name: "Clay Brick" },
    stone: { price: 9500, name: "Natural Stone" }
  }
};

const Pool3DVisualizerModal = ({ isOpen, onClose, poolModel }: Pool3DVisualizerModalProps) => {
  const [poolColor, setPoolColor] = useState("#4A90E2");
  const [tileType, setTileType] = useState("none");
  const [paverType, setPaverType] = useState("concrete");
  const [paverColor, setPaverColor] = useState("#9CA3AF");
  const [totalPrice, setTotalPrice] = useState(0);

  // Calculate total price
  useEffect(() => {
    let price = 0;
    if (tileType !== "none" && materialPricing.tiles[tileType as keyof typeof materialPricing.tiles]) {
      price += materialPricing.tiles[tileType as keyof typeof materialPricing.tiles].price;
    }
    if (materialPricing.pavers[paverType as keyof typeof materialPricing.pavers]) {
      price += materialPricing.pavers[paverType as keyof typeof materialPricing.pavers].price;
    }
    setTotalPrice(price);
  }, [tileType, paverType]);

  const poolColors = [
    { name: "Ocean Blue", value: "#4A90E2" },
    { name: "Caribbean", value: "#0EA5E9" },
    { name: "Lagoon", value: "#06B6D4" },
    { name: "Sapphire", value: "#1E40AF" },
    { name: "Emerald", value: "#059669" }
  ];

  const paverColors = [
    { name: "Light Gray", value: "#9CA3AF" },
    { name: "Sandstone", value: "#D6D3D1" },
    { name: "Charcoal", value: "#4B5563" },
    { name: "Beige", value: "#F5F5DC" }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[90vh] p-0">
        <div className="flex h-full">
          {/* 3D Viewer */}
          <div className="flex-1 relative bg-gradient-to-b from-sky-100 to-sky-200">
            <DialogTitle className="absolute top-4 left-4 z-10 text-2xl font-bold text-gray-800">
              {poolModel} - 3D Visualizer
            </DialogTitle>
            
            <Button
              onClick={onClose}
              variant="outline"
              size="icon"
              className="absolute top-4 right-4 z-10"
            >
              <X className="h-4 w-4" />
            </Button>

            <Canvas camera={{ position: [10, 8, 10], fov: 45 }}>
              <ambientLight intensity={0.6} />
              <directionalLight position={[10, 10, 5]} intensity={1} />
              <pointLight position={[-10, -10, -10]} color="#FEF08A" intensity={0.3} />
              
              <PoolDeck paverType={paverType} paverColor={paverColor} />
              <PoolGeometry color={poolColor} tileType={tileType} />
              <PoolAccessories />
              
              <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
            </Canvas>
          </div>

          {/* Controls Panel */}
          <div className="w-80 p-6 bg-white border-l overflow-y-auto">
            <h3 className="text-lg font-semibold mb-6">Customization Options</h3>
            
            {/* Pool Color */}
            <Card className="p-4 mb-4">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Waves className="h-4 w-4" />
                Pool Color
              </h4>
              <div className="grid grid-cols-3 gap-2">
                {poolColors.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setPoolColor(color.value)}
                    className={`w-full h-8 rounded border-2 ${
                      poolColor === color.value ? "border-primary" : "border-gray-300"
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>
            </Card>

            {/* Tile Options */}
            <Card className="p-4 mb-4">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Square className="h-4 w-4" />
                Pool Interior
              </h4>
              <Select value={tileType} onValueChange={setTileType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select tile type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Tiles (Plaster)</SelectItem>
                  <SelectItem value="mosaic">Glass Mosaic (+$8,500)</SelectItem>
                  <SelectItem value="ceramic">Ceramic Tile (+$4,200)</SelectItem>
                  <SelectItem value="natural">Natural Stone (+$12,000)</SelectItem>
                </SelectContent>
              </Select>
            </Card>

            {/* Paver Options */}
            <Card className="p-4 mb-4">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Deck Material
              </h4>
              <Select value={paverType} onValueChange={setPaverType}>
                <SelectTrigger className="mb-3">
                  <SelectValue placeholder="Select paver type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="concrete">Stamped Concrete (+$2,800)</SelectItem>
                  <SelectItem value="travertine">Travertine (+$8,500)</SelectItem>
                  <SelectItem value="brick">Clay Brick (+$6,200)</SelectItem>
                  <SelectItem value="stone">Natural Stone (+$9,500)</SelectItem>
                </SelectContent>
              </Select>
              
              {/* Paver Color */}
              <div className="grid grid-cols-2 gap-2">
                {paverColors.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setPaverColor(color.value)}
                    className={`w-full h-6 rounded border-2 ${
                      paverColor === color.value ? "border-primary" : "border-gray-300"
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>
            </Card>

            {/* Pricing Summary */}
            <Card className="p-4 mb-4 bg-gradient-to-r from-primary/5 to-coral/5">
              <h4 className="font-medium mb-3">Upgrade Pricing</h4>
              <div className="space-y-2 text-sm">
                {tileType !== "none" && (
                  <div className="flex justify-between">
                    <span>{materialPricing.tiles[tileType as keyof typeof materialPricing.tiles]?.name}</span>
                    <span>${materialPricing.tiles[tileType as keyof typeof materialPricing.tiles]?.price.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>{materialPricing.pavers[paverType as keyof typeof materialPricing.pavers]?.name}</span>
                  <span>${materialPricing.pavers[paverType as keyof typeof materialPricing.pavers]?.price.toLocaleString()}</span>
                </div>
                <div className="border-t pt-2 font-semibold flex justify-between">
                  <span>Total Upgrades:</span>
                  <span>${totalPrice.toLocaleString()}</span>
                </div>
              </div>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button className="w-full" size="lg">
                Get Quote with Options
              </Button>
              <Button variant="outline" className="w-full" size="lg">
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset View
              </Button>
            </div>

            {/* Features Info */}
            <div className="mt-6 p-3 bg-amber-50 rounded-lg">
              <p className="text-xs text-amber-800">
                <strong>3D Visualizer Features:</strong><br />
                • Real-time material pricing<br />
                • Interactive camera controls<br />
                • Professional-grade materials<br />
                • Florida-approved contractors
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Pool3DVisualizerModal;