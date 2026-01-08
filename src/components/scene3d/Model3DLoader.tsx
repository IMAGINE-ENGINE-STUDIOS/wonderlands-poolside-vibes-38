import React, { Suspense, useEffect, useState } from 'react';
import { useLoader, useThree } from '@react-three/fiber';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { USDZLoader } from 'three/examples/jsm/loaders/USDZLoader.js';
import * as THREE from 'three';
import { Center, useProgress, Html } from '@react-three/drei';

// Supported 3D file formats
export type Model3DFormat = 'glb' | 'gltf' | 'obj' | 'fbx' | 'usdz';

export interface Model3DLoaderProps {
  url: string;
  format?: Model3DFormat;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number | [number, number, number];
  color?: string;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

// Detect format from URL extension
export function detectFormat(url: string): Model3DFormat | null {
  const extension = url.split('.').pop()?.toLowerCase();
  switch (extension) {
    case 'glb':
    case 'gltf':
      return 'glb';
    case 'obj':
      return 'obj';
    case 'fbx':
      return 'fbx';
    case 'usdz':
      return 'usdz';
    default:
      return null;
  }
}

// Get supported formats for display
export function getSupportedFormats(): string[] {
  return ['GLB', 'GLTF', 'OBJ', 'FBX', 'USDZ'];
}

// Loading indicator component
function LoadingIndicator() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="bg-background/90 px-4 py-2 rounded-lg border border-border">
        <p className="text-sm text-foreground">Loading {progress.toFixed(0)}%</p>
      </div>
    </Html>
  );
}

// OBJ Model Component
function OBJModel({ url, color, onLoad, onError }: { url: string; color?: string; onLoad?: () => void; onError?: (error: Error) => void }) {
  const [model, setModel] = useState<THREE.Group | null>(null);
  
  useEffect(() => {
    const loader = new OBJLoader();
    loader.load(
      url,
      (obj) => {
        // Apply color if specified
        if (color) {
          obj.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              (child as THREE.Mesh).material = new THREE.MeshStandardMaterial({ color });
            }
          });
        }
        setModel(obj);
        onLoad?.();
      },
      undefined,
      (error: unknown) => {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('OBJ loading error:', error);
        onError?.(new Error(`Failed to load OBJ: ${errorMessage}`));
      }
    );
    
    return () => {
      if (model) {
        model.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            (child as THREE.Mesh).geometry.dispose();
            const material = (child as THREE.Mesh).material;
            if (Array.isArray(material)) {
              material.forEach(m => m.dispose());
            } else {
              material.dispose();
            }
          }
        });
      }
    };
  }, [url, color]);
  
  if (!model) return null;
  return <primitive object={model} />;
}

// FBX Model Component
function FBXModel({ url, color, onLoad, onError }: { url: string; color?: string; onLoad?: () => void; onError?: (error: Error) => void }) {
  const [model, setModel] = useState<THREE.Group | null>(null);
  
  useEffect(() => {
    const loader = new FBXLoader();
    loader.load(
      url,
      (fbx) => {
        // Normalize scale (FBX often comes in cm)
        fbx.scale.multiplyScalar(0.01);
        
        // Apply color if specified
        if (color) {
          fbx.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              (child as THREE.Mesh).material = new THREE.MeshStandardMaterial({ color });
            }
          });
        }
        setModel(fbx);
        onLoad?.();
      },
      undefined,
      (error: unknown) => {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('FBX loading error:', error);
        onError?.(new Error(`Failed to load FBX: ${errorMessage}`));
      }
    );
    
    return () => {
      if (model) {
        model.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            (child as THREE.Mesh).geometry.dispose();
            const material = (child as THREE.Mesh).material;
            if (Array.isArray(material)) {
              material.forEach(m => m.dispose());
            } else {
              material.dispose();
            }
          }
        });
      }
    };
  }, [url, color]);
  
  if (!model) return null;
  return <primitive object={model} />;
}

// GLTF/GLB Model Component
function GLTFModel({ url, color, onLoad, onError }: { url: string; color?: string; onLoad?: () => void; onError?: (error: Error) => void }) {
  const [model, setModel] = useState<THREE.Group | null>(null);
  
  useEffect(() => {
    const loader = new GLTFLoader();
    loader.load(
      url,
      (gltf) => {
        const scene = gltf.scene;
        
        // Apply color if specified
        if (color) {
          scene.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              (child as THREE.Mesh).material = new THREE.MeshStandardMaterial({ color });
            }
          });
        }
        setModel(scene);
        onLoad?.();
      },
      undefined,
      (error: unknown) => {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('GLTF loading error:', error);
        onError?.(new Error(`Failed to load GLTF: ${errorMessage}`));
      }
    );
    
    return () => {
      if (model) {
        model.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            (child as THREE.Mesh).geometry.dispose();
            const material = (child as THREE.Mesh).material;
            if (Array.isArray(material)) {
              material.forEach(m => m.dispose());
            } else {
              material.dispose();
            }
          }
        });
      }
    };
  }, [url, color]);
  
  if (!model) return null;
  return <primitive object={model} />;
}

// USDZ Model Component
function USDZModel({ url, color, onLoad, onError }: { url: string; color?: string; onLoad?: () => void; onError?: (error: Error) => void }) {
  const [model, setModel] = useState<THREE.Object3D | null>(null);
  
  useEffect(() => {
    const loader = new USDZLoader();
    loader.load(
      url,
      (usdz) => {
        // Wrap in a group if it's a mesh
        const group = new THREE.Group();
        group.add(usdz);
        
        // Apply color if specified
        if (color) {
          group.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              (child as THREE.Mesh).material = new THREE.MeshStandardMaterial({ color });
            }
          });
        }
        setModel(group);
        onLoad?.();
      },
      undefined,
      (error: unknown) => {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('USDZ loading error:', error);
        onError?.(new Error(`Failed to load USDZ: ${errorMessage}`));
      }
    );
    
    return () => {
      if (model) {
        model.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            (child as THREE.Mesh).geometry.dispose();
            const material = (child as THREE.Mesh).material;
            if (Array.isArray(material)) {
              material.forEach(m => m.dispose());
            } else {
              material.dispose();
            }
          }
        });
      }
    };
  }, [url, color]);
  
  if (!model) return null;
  return <primitive object={model} />;
}

// Main Model3DLoader component
export function Model3DLoader({
  url,
  format,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  color,
  onLoad,
  onError
}: Model3DLoaderProps) {
  const detectedFormat = format || detectFormat(url);
  
  if (!detectedFormat) {
    console.error(`Unsupported 3D format for URL: ${url}`);
    return null;
  }
  
  const scaleArray: [number, number, number] = Array.isArray(scale) 
    ? scale 
    : [scale, scale, scale];
  
  const rotationRadians: [number, number, number] = [
    rotation[0] * (Math.PI / 180),
    rotation[1] * (Math.PI / 180),
    rotation[2] * (Math.PI / 180)
  ];
  
  const renderModel = () => {
    switch (detectedFormat) {
      case 'obj':
        return <OBJModel url={url} color={color} onLoad={onLoad} onError={onError} />;
      case 'fbx':
        return <FBXModel url={url} color={color} onLoad={onLoad} onError={onError} />;
      case 'glb':
      case 'gltf':
        return <GLTFModel url={url} color={color} onLoad={onLoad} onError={onError} />;
      case 'usdz':
        return <USDZModel url={url} color={color} onLoad={onLoad} onError={onError} />;
      default:
        return null;
    }
  };
  
  return (
    <group position={position} rotation={rotationRadians} scale={scaleArray}>
      <Suspense fallback={<LoadingIndicator />}>
        <Center>
          {renderModel()}
        </Center>
      </Suspense>
    </group>
  );
}

// Validate if a file is a supported 3D format
export function isSupported3DFile(filename: string): boolean {
  const format = detectFormat(filename);
  return format !== null;
}

// Get file format badge color
export function getFormatBadgeColor(format: Model3DFormat): string {
  switch (format) {
    case 'glb':
    case 'gltf':
      return 'bg-green-500';
    case 'obj':
      return 'bg-blue-500';
    case 'fbx':
      return 'bg-purple-500';
    case 'usdz':
      return 'bg-orange-500';
    default:
      return 'bg-gray-500';
  }
}

export default Model3DLoader;
