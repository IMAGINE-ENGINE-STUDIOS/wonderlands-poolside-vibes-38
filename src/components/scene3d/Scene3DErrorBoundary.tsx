import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { validateScene } from '@/utils/sceneValidator';
import type { Scene3D } from './types';

interface Props {
  children: ReactNode;
  scene?: Scene3D;
  onRecover?: (scene: Scene3D) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  recoveryAttempts: number;
}

export class Scene3DErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      recoveryAttempts: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    console.error('🔴 3D Viewer Error Boundary Caught Error:', {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const isTextureError = error.message.includes('Could not load');
    const urlMatch = error.message.match(/Could not load\s*:\s*(.+)/);
    const extractedUrl = urlMatch?.[1];
    
    console.error('🔴 3D Viewer Error Details:', {
      error: error.message,
      componentStack: errorInfo.componentStack,
      errorInfo,
      isTextureError,
      extractedUrl,
      urlIsUndefined: extractedUrl === 'undefined',
      urlType: typeof extractedUrl,
      currentScene: this.props.scene,
      sceneTextureUrls: this.props.scene ? {
        finish: this.props.scene.pool.finish?.url,
        paver: this.props.scene.deck.paver?.url,
        coping: this.props.scene.deck.coping?.url,
        waterline: this.props.scene.deck.waterline?.url
      } : 'No scene provided'
    });
    
    // Log specifically for texture loading errors
    if (isTextureError) {
      console.error('❌ TEXTURE LOADING ERROR DETECTED:', {
        errorMessage: error.message,
        extractedUrl,
        urlIsUndefined: extractedUrl === 'undefined',
        tip: 'Check all texture URLs in the scene object for undefined/null/empty values',
        stack: error.stack
      });
    }
    
    this.setState({ errorInfo });
  }

  handleReset = () => {
    console.log('🔄 Attempting simple reset...');
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      recoveryAttempts: this.state.recoveryAttempts + 1
    });
  };

  handleRecoverWithFallbacks = () => {
    const { scene, onRecover } = this.props;
    
    console.log('🛡️ Attempting recovery with fallback textures...');
    
    if (!scene) {
      console.warn('⚠️ No scene provided to error boundary, cannot recover with fallbacks');
      this.handleReset();
      return;
    }

    try {
      // Create a deep copy with all fallback textures
      const recoveredScene: Scene3D = {
        ...scene,
        pool: {
          ...scene.pool,
          finish: {
            url: '/src/assets/finishes/sapphire-blue-g3.jpg',
            name: 'Sapphire Blue (Fallback)',
            roughness: 0.3,
            metalness: 0.2,
            scale: 1.8,
            offset: [0, 0]
          }
        },
        deck: {
          ...scene.deck,
          paver: {
            url: '/lovable-uploads/6f65c8d2-ad09-4fef-b01f-cb3c2e96cf11.png',
            name: 'Default Paver (Fallback)',
            roughness: 0.8,
            metalness: 0.0,
            scale: 1.8,
            offset: [0, 0]
          },
          coping: {
            url: '/lovable-uploads/08c51883-4e87-4344-b773-ec0a6d575b54.png',
            name: 'Default Coping (Fallback)',
            roughness: 0.6,
            metalness: 0.0,
            scale: 1.8,
            offset: [-0.21, 0]
          },
          waterline: {
            url: '/src/assets/finishes/sapphire-blue-g3.jpg',
            name: 'Sapphire Blue Waterline (Fallback)',
            roughness: 0.3,
            metalness: 0.2,
            scale: 1.8,
            offset: [0, 0]
          }
        }
      };

      // Validate the recovered scene
      const validatedScene = validateScene(recoveredScene);
      
      console.log('✅ Recovery successful with fallback textures:', {
        poolFinish: validatedScene.pool.finish.url,
        paver: validatedScene.deck.paver.url,
        coping: validatedScene.deck.coping.url,
        waterline: validatedScene.deck.waterline?.url
      });

      // Call the recovery callback
      if (onRecover) {
        onRecover(validatedScene);
      }

      // Reset error state
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        recoveryAttempts: this.state.recoveryAttempts + 1
      });
    } catch (recoveryError) {
      console.error('❌ Recovery failed:', recoveryError);
      // Fallback to simple reset
      this.handleReset();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-background/95 backdrop-blur">
          <div className="max-w-md p-8 text-center space-y-4">
            <AlertTriangle className="w-16 h-16 mx-auto text-destructive" />
            <h2 className="text-2xl font-semibold text-foreground">3D Viewer Error</h2>
            <p className="text-muted-foreground">
              {this.state.error?.message.includes('Could not load') 
                ? 'Failed to load some textures. Try recovering with default textures.'
                : 'The 3D viewer encountered an error while loading.'}
            </p>
            
            {this.state.recoveryAttempts > 0 && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  Recovery attempts: {this.state.recoveryAttempts}
                </p>
              </div>
            )}
            
            {this.state.error && (
              <details className="text-left bg-muted/50 p-4 rounded-lg">
                <summary className="cursor-pointer text-sm font-medium mb-2">
                  Error Details (Check Console for Full Stack)
                </summary>
                <pre className="text-xs overflow-auto max-h-40">
                  {this.state.error.message}
                  {this.state.error.stack && (
                    <>
                      {'\n\n'}
                      {this.state.error.stack.substring(0, 500)}
                    </>
                  )}
                </pre>
              </details>
            )}
            
            <div className="flex gap-2 justify-center">
              <Button onClick={this.handleReset} variant="outline" className="gap-2">
                <RefreshCw className="w-4 h-4" />
                Try Again
              </Button>
              
              {this.props.scene && (
                <Button onClick={this.handleRecoverWithFallbacks} className="gap-2">
                  <Shield className="w-4 h-4" />
                  Use Safe Defaults
                </Button>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
