import { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { X, Paintbrush, Move, Layers, Edit3, Lightbulb } from 'lucide-react';
import { Scene3D, TextureConfig, PoolLightConfig } from './scene3d/types';
import { Separator } from './ui/separator';
import { Checkbox } from './ui/checkbox';
import { PoolLightControls } from './scene3d/PoolLightControls';
import {
  buildCatalogTextureLibrary,
  dedupeTextures,
  groupTextures,
  type CatalogTextureConfig,
} from '@/data/textureLibrary';

// Component order for auto-advance after texture selection
const COMPONENT_ORDER: Array<'pool' | 'deck' | 'coping' | 'waterline'> = ['pool', 'coping', 'waterline', 'deck'];

/** Catalog-backed fallback so every gallery matches Wonderlands Studio. */
const CATALOG_LIBRARY = buildCatalogTextureLibrary();

interface ComponentControlPanelProps {
  selectedComponent: 'pool' | 'deck' | 'coping' | 'waterline' | null;
  scene: Scene3D;
  onClose: () => void;
  onSceneChange: (scene: Scene3D) => void;
  onSelectComponent?: (component: 'pool' | 'deck' | 'coping' | 'waterline' | null) => void;
  textureLibrary: {
    finishes: TextureConfig[];
    pavers: TextureConfig[];
    coping: TextureConfig[];
    waterlines?: TextureConfig[];
  };
  poolCategory?: string;
  poolModel?: string;
  deckWidth: number;
  onDeckWidthChange: (width: number) => void;
  enablePoolSplineEdit?: boolean;
  onPoolSplineEditToggle?: () => void;
  enableFloorDepthSplineEdit?: boolean;
  onFloorDepthSplineEditToggle?: () => void;
  // Pool lights
  poolLights?: PoolLightConfig[];
  onPoolLightsChange?: (lights: PoolLightConfig[]) => void;
  selectedLightId?: string | null;
  onSelectLight?: (id: string | null) => void;
  isNightMode?: boolean;
}

export function ComponentControlPanel({
  selectedComponent,
  scene,
  onClose,
  onSceneChange,
  onSelectComponent,
  textureLibrary,
  poolCategory = 'deluxe',
  poolModel = '',
  deckWidth,
  onDeckWidthChange,
  enablePoolSplineEdit = false,
  onPoolSplineEditToggle,
  enableFloorDepthSplineEdit = false,
  onFloorDepthSplineEditToggle,
  poolLights = [],
  onPoolLightsChange,
  selectedLightId = null,
  onSelectLight,
  isNightMode = false
}: ComponentControlPanelProps) {
  // Animation state for texture panel fade effect

  if (!selectedComponent) return null;

  // Get ALL finishes regardless of pool type - show complete selection
  const getFilteredFinishes = () => {
    // Return ALL finishes from the texture library - user can select any finish
    return textureLibrary.finishes;
  };

  const handleTextureChange = (texture: TextureConfig) => {
    // Apply immediately and immutably so React/three always sees the new value.
    // NOTE: no auto-advance — switching component after a click made it look
    // like nothing was applied (and moved the camera away).
    const updated: Scene3D = {
      ...scene,
      pool: { ...scene.pool },
      deck: { ...scene.deck },
    };

    const next = { ...texture, scale: texture.scale ?? getCurrentTexture()?.scale ?? 1.8 };

    if (selectedComponent === 'pool') {
      updated.pool.finish = next;
    } else if (selectedComponent === 'deck') {
      updated.deck.paver = next;
    } else if (selectedComponent === 'coping') {
      updated.deck.coping = next;
    } else if (selectedComponent === 'waterline') {
      updated.deck.waterline = next;
    }

    onSceneChange(updated);
  };


  const handleTextureScaleChange = (scale: number) => {
    const updated: Scene3D = {
      ...scene,
      pool: { ...scene.pool },
      deck: { ...scene.deck },
    };

    if (selectedComponent === 'pool') {
      updated.pool.finish = { ...updated.pool.finish, scale };
    } else if (selectedComponent === 'deck') {
      updated.deck.paver = { ...updated.deck.paver, scale };
    } else if (selectedComponent === 'coping') {
      updated.deck.coping = { ...updated.deck.coping, scale };
    } else if (selectedComponent === 'waterline' && updated.deck.waterline) {
      updated.deck.waterline = { ...updated.deck.waterline, scale };
    }

    onSceneChange(updated);
  };

  const patchTexture = (patch: Partial<TextureConfig>) => {
    const updated: Scene3D = {
      ...scene,
      pool: { ...scene.pool },
      deck: { ...scene.deck },
    };

    if (selectedComponent === 'pool') {
      updated.pool.finish = { ...updated.pool.finish, ...patch };
    } else if (selectedComponent === 'deck') {
      updated.deck.paver = { ...updated.deck.paver, ...patch };
    } else if (selectedComponent === 'coping') {
      updated.deck.coping = { ...updated.deck.coping, ...patch };
    } else if (selectedComponent === 'waterline' && updated.deck.waterline) {
      updated.deck.waterline = { ...updated.deck.waterline, ...patch };
    }

    onSceneChange(updated);
  };

  const getCurrentTexture = () => {
    switch (selectedComponent) {
      case 'pool': return scene.pool.finish;
      case 'deck': return scene.deck.paver;
      case 'coping': return scene.deck.coping;
      case 'waterline': return scene.deck.waterline;
      default: return null;
    }
  };

  const getAvailableTextures = (): CatalogTextureConfig[] => {
    // Any list handed in by a caller is merged with the catalog so no gallery
    // can ever come back empty or partial.
    const list = (() => {
      switch (selectedComponent) {
        case 'pool':
          return [...getFilteredFinishes(), ...CATALOG_LIBRARY.finishes];
        case 'deck':
          return [...(textureLibrary.pavers || []), ...CATALOG_LIBRARY.pavers];
        case 'coping':
          return [...(textureLibrary.coping || []), ...CATALOG_LIBRARY.coping];
        case 'waterline':
          return [...(textureLibrary.waterlines || []), ...CATALOG_LIBRARY.waterlines];
        default:
          return [];
      }
    })();

    // Duplicate URLs produced duplicate React keys, which silently dropped
    // swatches and made selections apply the wrong texture.
    return dedupeTextures(list as CatalogTextureConfig[]);
  };


  const getComponentTitle = () => {
    switch (selectedComponent) {
      case 'pool': return 'Pool Finish';
      case 'deck': return 'Deck Pavers';
      case 'coping': return 'Coping';
      case 'waterline': return 'Waterline';
      default: return 'Component';
    }
  };

  const getComponentIcon = () => {
    switch (selectedComponent) {
      case 'pool': return <Layers className="w-4 h-4" />;
      case 'deck': return <Move className="w-4 h-4" />;
      case 'coping': return <Paintbrush className="w-4 h-4" />;
      case 'waterline': return <Paintbrush className="w-4 h-4" />;
      default: return <Layers className="w-4 h-4" />;
    }
  };

  const currentTexture = getCurrentTexture();
  const availableTextures = getAvailableTextures();

  return (
    <div className="fixed left-4 top-1/2 -translate-y-1/2 w-80 bg-background/98 backdrop-blur-md border border-border rounded-xl shadow-2xl z-[9999] animate-in slide-in-from-left duration-300 pointer-events-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2">
          {getComponentIcon()}
          <h3 className="font-semibold text-base">{getComponentTitle()} Settings</h3>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
        {/* Texture Selection */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Paintbrush className="h-4 w-4 text-primary" />
            <Label className="text-sm font-semibold">Texture</Label>
          </div>
          
          {currentTexture && (
            <div className="bg-muted/50 rounded-lg p-3 space-y-2">
              <div className="text-xs font-medium text-muted-foreground">Current: {currentTexture.name}</div>
              <img loading="lazy" decoding="async" 
                src={currentTexture.url} 
                alt={currentTexture.name}
                className="w-full h-24 object-cover rounded border border-border"
              />
            </div>
          )}

          {/* Texture picker — dropdown, grouped by Studio category */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                className="glass-btn w-full justify-between h-10 px-3 rounded-lg"
              >
                <span className="flex items-center gap-2 min-w-0">
                  {currentTexture && (
                    <img
                      loading="lazy"
                      decoding="async"
                      src={currentTexture.url}
                      alt=""
                      className="h-6 w-6 rounded object-cover border border-border/60"
                    />
                  )}
                  <span className="truncate text-xs font-medium">
                    {currentTexture?.name || 'Choose a texture'}
                  </span>
                </span>
                <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  {availableTextures.length}
                  <ChevronDown className="h-3.5 w-3.5" />
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent
              align="start"
              side="right"
              sideOffset={10}
              className="glass-panel w-[320px] p-3 rounded-xl border-0 z-[10000]"
            >
              <div className="max-h-[52vh] overflow-y-auto pr-1 space-y-4">
                {groupTextures(availableTextures).map(({ group, textures }) => (
                  <div key={group} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {group}
                      </span>
                      <span className="h-px flex-1 bg-border" />
                      <span className="text-[10px] text-muted-foreground">{textures.length}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {textures.map((texture, index) => (
                        <button
                          key={`${texture.url}-${index}`}
                          type="button"
                          onClick={() => handleTextureChange(texture)}
                          className={`relative group rounded-lg overflow-hidden border-2 transition-all ${
                            currentTexture?.url === texture.url
                              ? 'border-primary ring-2 ring-primary/20'
                              : 'border-border hover:border-primary/50'
                          }`}
                          title={texture.name}
                        >
                          <img
                            loading="lazy"
                            decoding="async"
                            src={texture.url}
                            alt={texture.name}
                            className="w-full h-20 object-cover group-hover:scale-110 transition-transform"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-1.5">
                            <span className="text-white text-[10px] font-medium truncate">{texture.name}</span>
                          </div>
                          {currentTexture?.url === texture.url && (
                            <div className="absolute top-1 right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                              <svg className="w-3 h-3 text-primary-foreground" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Texture transform tool set — collapsed into a dropdown */}
          {currentTexture && (
            <Collapsible>
              <CollapsibleTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  className="glass-btn w-full justify-between h-9 px-3 rounded-lg text-xs"
                >
                  <span className="flex items-center gap-2">
                    <SlidersHorizontal className="h-3.5 w-3.5 text-primary" />
                    Texture adjustments
                  </span>
                  <ChevronDown className="h-3.5 w-3.5" />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-3 space-y-4">
                {/* Texture Scale */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Texture Scale</Label>
                    <span className="text-xs text-muted-foreground">{(currentTexture.scale || 1.8).toFixed(1)}x</span>
                  </div>
                  <Slider
                    value={[currentTexture.scale || 1.8]}
                    onValueChange={(value) => handleTextureScaleChange(value[0])}
                    min={0.5}
                    max={5}
                    step={0.1}
                    className="w-full"
                  />
                </div>

                {/* Texture Rotation */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Texture Rotation</Label>
                    <span className="text-xs text-muted-foreground">{Math.round(currentTexture.rotation || 0)}°</span>
                  </div>
                  <Slider
                    value={[currentTexture.rotation || 0]}
                    onValueChange={(value) => patchTexture({ rotation: value[0] })}
                    min={0}
                    max={360}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex gap-1">
                    {[0, 45, 90, 135].map((deg) => (
                      <Button
                        key={deg}
                        type="button"
                        size="sm"
                        variant="ghost"
                        aria-pressed={Math.round(currentTexture.rotation || 0) === deg}
                        className="glass-btn h-6 px-2 text-[10px] flex-1 rounded-md"
                        onClick={() => patchTexture({ rotation: deg })}
                      >
                        {deg}°
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Texture Offset */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Offset X</Label>
                    <span className="text-xs text-muted-foreground">{(currentTexture.offset?.[0] || 0).toFixed(2)}</span>
                  </div>
                  <Slider
                    value={[currentTexture.offset?.[0] || 0]}
                    onValueChange={(value) => patchTexture({ offset: [value[0], currentTexture.offset?.[1] || 0] })}
                    min={-1}
                    max={1}
                    step={0.01}
                    className="w-full"
                  />
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Offset Y</Label>
                    <span className="text-xs text-muted-foreground">{(currentTexture.offset?.[1] || 0).toFixed(2)}</span>
                  </div>
                  <Slider
                    value={[currentTexture.offset?.[1] || 0]}
                    onValueChange={(value) => patchTexture({ offset: [currentTexture.offset?.[0] || 0, value[0]] })}
                    min={-1}
                    max={1}
                    step={0.01}
                    className="w-full"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="glass-btn h-7 w-full text-xs rounded-md"
                    onClick={() => patchTexture({ scale: 1.8, rotation: 0, offset: [0, 0] })}
                  >
                    Reset texture transform
                  </Button>
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}
        </div>


        {/* Component-specific controls */}
        {selectedComponent === 'deck' && (
          <>
            <Separator />
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Move className="h-4 w-4 text-primary" />
                <Label className="text-sm font-semibold">Deck Dimensions</Label>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Deck Width</Label>
                  <span className="text-xs text-muted-foreground">{deckWidth.toFixed(1)} ft</span>
                </div>
                <Slider
                  value={[deckWidth]}
                  onValueChange={(value) => onDeckWidthChange(value[0])}
                  min={3}
                  max={50}
                  step={0.5}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Distance from pool edge to deck edge
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Deck Elevation</Label>
                  <span className="text-xs text-muted-foreground">
                    {((scene.deck.deckElevation || 0) * 12).toFixed(1)} in
                    {(scene.deck.deckElevation || 0) > 0 ? ' (raised)' : (scene.deck.deckElevation || 0) < 0 ? ' (sunken)' : ' (flush)'}
                  </span>
                </div>
                <Slider
                  value={[(scene.deck.deckElevation || 0) * 12]}
                  onValueChange={(value) => {
                    const updated = { ...scene };
                    updated.deck.deckElevation = value[0] / 12;
                    onSceneChange(updated);
                  }}
                  min={-24}
                  max={24}
                  step={1}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Negative = sunken patio, Positive = raised deck
                </p>
              </div>
            </div>
          </>
        )}

        {selectedComponent === 'coping' && (
          <>
            <Separator />
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Move className="h-4 w-4 text-primary" />
                <Label className="text-sm font-semibold">Coping Dimensions</Label>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Coping Height</Label>
                  <span className="text-xs text-muted-foreground">{((scene.deck.copingHeight || 0.17) * 12).toFixed(1)} in</span>
                </div>
                <Slider
                  value={[(scene.deck.copingHeight || 0.17) * 12]}
                  onValueChange={(value) => {
                    const updated = { ...scene };
                    updated.deck.copingHeight = value[0] / 12;
                    onSceneChange(updated);
                  }}
                  min={1}
                  max={6}
                  step={0.5}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Coping Width</Label>
                  <span className="text-xs text-muted-foreground">{(scene.deck.copingWidth || 1).toFixed(1)} ft</span>
                </div>
                <Slider
                  value={[scene.deck.copingWidth || 1]}
                  onValueChange={(value) => {
                    const updated = { ...scene };
                    updated.deck.copingWidth = value[0];
                    onSceneChange(updated);
                  }}
                  min={0.5}
                  max={3}
                  step={0.1}
                  className="w-full"
                />
              </div>
            </div>
          </>
        )}

        {selectedComponent === 'pool' && (
          <>
            <Separator />
            
            {/* Pool Shape Editing */}
            {onPoolSplineEditToggle && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Edit3 className="h-4 w-4 text-primary" />
                  <Label className="text-sm font-semibold">Pool Shape Editor</Label>
                </div>
                
                <div className="flex items-center justify-between bg-muted/50 rounded-lg p-3">
                  <div className="flex-1">
                    <Label htmlFor="pool-spline-edit" className="text-xs font-medium">Edit Pool Walls</Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      {enablePoolSplineEdit ? 'Drag points to reshape pool outline' : 'Enable to edit pool shape with spline editor'}
                    </p>
                  </div>
                  <Checkbox
                    id="pool-spline-edit"
                    checked={enablePoolSplineEdit}
                    onCheckedChange={onPoolSplineEditToggle}
                  />
                </div>
                
                {enablePoolSplineEdit && (
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                    <p className="text-xs text-foreground">
                      <strong>Spline Editor Active:</strong>
                    </p>
                    <ul className="text-xs text-muted-foreground mt-1 space-y-1">
                      <li>• Drag control points to reshape</li>
                      <li>• Click + to add new points</li>
                      <li>• Click X to remove points</li>
                      <li>• Change point types for curves</li>
                    </ul>
                  </div>
                )}
              </div>
            )}
            
            {/* Pool Floor Depth Editor */}
            {onFloorDepthSplineEditToggle && (
              <div className="space-y-3 mt-3">
                <div className="flex items-center justify-between bg-muted/50 rounded-lg p-3">
                  <div className="flex-1">
                    <Label htmlFor="floor-depth-edit" className="text-xs font-medium">Edit Floor Depth</Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      {enableFloorDepthSplineEdit ? 'Adjust depth points around pool perimeter' : 'Enable to control depth at each point'}
                    </p>
                  </div>
                  <Checkbox
                    id="floor-depth-edit"
                    checked={enableFloorDepthSplineEdit}
                    onCheckedChange={onFloorDepthSplineEditToggle}
                  />
                </div>
                
                {enableFloorDepthSplineEdit && (
                  <div className="bg-cyan-500/5 border border-cyan-500/20 rounded-lg p-3">
                    <p className="text-xs text-foreground">
                      <strong>Floor Depth Editor Active:</strong>
                    </p>
                    <ul className="text-xs text-muted-foreground mt-1 space-y-1">
                      <li>• Cyan spheres show depth control points</li>
                      <li>• Drag vertically to adjust depth</li>
                      <li>• Create variable depth profiles</li>
                      <li>• Beach entries, deep ends, etc.</li>
                    </ul>
                  </div>
                )}
              </div>
            )}
            
            <Separator />
            
            {/* Pool Lights Controls */}
            {onPoolLightsChange && onSelectLight && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-primary" />
                  <Label className="text-sm font-semibold">Pool Lights</Label>
                </div>
                
                <PoolLightControls
                  lights={poolLights}
                  onLightsChange={onPoolLightsChange}
                  selectedLightId={selectedLightId}
                  onSelectLight={onSelectLight}
                  isNightMode={isNightMode}
                />
              </div>
            )}
            
            <Separator />
            
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">
                <strong className="text-foreground">Pool Category:</strong> {poolCategory.charAt(0).toUpperCase() + poolCategory.slice(1)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Available finishes are filtered based on your pool category.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
