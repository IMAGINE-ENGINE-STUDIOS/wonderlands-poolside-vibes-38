/**
 * Showroom 3D Studio — the live 3D designer seeded with a plain rectangular
 * pool (16' × 36'), or with any scene handed in (e.g. from the 2D site planner).
 * `embedded` (default) keeps the viewer inside its frame: the wrapper uses a
 * CSS transform so even `fixed` panels inside the viewer stay contained.
 * The full-screen version lives on its own page at /studio-3d.
 *
 * Both versions open on a showcase pre-screen: the scene renders behind a
 * glass card while the camera orbits slowly; "Enter the 3D Studio" unlocks
 * the tools. A scene handed in from the 2D planner skips the pre-screen.
 */
import * as React from 'react';
import { UnifiedPoolVisualizer } from '@/components/UnifiedPoolVisualizer';
import { productToScene } from '@/components/scene3d/SceneConverter';
import { paverTypes } from '@/data/paverData';
import { poolFinishes } from '@/data/consolidatedProducts';
import { buildCatalogTextureLibrary } from '@/data/textureLibrary';
import { Button } from '@/components/ui/button';
import { loadBoard3D } from '@/lib/design/board3D';

const finishOptions = poolFinishes.map((f: any) => ({
  name: f.name, price: f.price, image: f.image, collection: f.collection || 'Standard', description: f.description,
}));

const RECT_POOL = {
  name: 'Rectangular pool 16 × 36',
  model: 'Rectangular pool 16 × 36',
  dimensions: "16' × 36'",
  depth: '3\'6" - 6\'',
  price: 0,
  category: 'pool',
  type: 'pool',
};

interface Props {
  scene?: any;
  textureLibrary?: any;
  height?: number | string;
  embedded?: boolean;
  /** Size the pool from the Global Design Board V2 hand-off. */
  fromBoard?: boolean;
}

const PreScreen: React.FC<{ onEnter: () => void; full: boolean }> = ({ onEnter, full }) => (
  <div className="absolute inset-0 z-[10060] flex items-end justify-start bg-gradient-to-t from-background/85 via-background/20 to-transparent p-6 md:p-12">
    <div className="max-w-xl border border-border/70 bg-background/80 p-6 backdrop-blur-md md:p-10">
      <p className="text-[10px] uppercase tracking-[0.35em] text-muted-foreground">Wonderlands · 3D Studio</p>
      <h2 className="mt-3 font-serif text-3xl leading-tight md:text-5xl">Walk your pool before it is built.</h2>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
        A 16′ × 36′ rectangular pool, 3′6″ to 6′ deep, ready to shape. Change the outline and depth, pick finishes,
        pavers and coping, add stairs, seats, lights and furniture, then get your quote.
      </p>
      <dl className="mt-6 grid grid-cols-3 gap-4 border-t border-border/70 pt-4 text-xs">
        <div><dt className="uppercase tracking-[0.2em] text-muted-foreground">Size</dt><dd className="mt-1 font-serif text-lg">16′ × 36′</dd></div>
        <div><dt className="uppercase tracking-[0.2em] text-muted-foreground">Area</dt><dd className="mt-1 font-serif text-lg">576 sq ft</dd></div>
        <div><dt className="uppercase tracking-[0.2em] text-muted-foreground">Depth</dt><dd className="mt-1 font-serif text-lg">3′6″–6′</dd></div>
      </dl>
      <Button onClick={onEnter} className="mt-6 rounded-none px-8 text-[10px] uppercase tracking-[0.3em]">
        Enter the 3D Studio
      </Button>
      {!full && <p className="mt-3 text-[11px] text-muted-foreground">Prefer full screen? Open /studio-3d.</p>}
    </div>
  </div>
);

const ShowroomStudio3D: React.FC<Props> = ({ scene, textureLibrary, height = 720, embedded = true, fromBoard = false }) => {
  const library = React.useMemo(() => textureLibrary ?? buildCatalogTextureLibrary(), [textureLibrary]);
  const [current, setCurrent] = React.useState<any>(() => {
    if (scene) return scene;
    const bp = fromBoard ? loadBoard3D()?.pool : undefined;
    const base = bp ? { ...RECT_POOL, name: `Pool ${bp.w} × ${bp.l}`, model: `Pool ${bp.w} × ${bp.l}`, dimensions: `${bp.w}' × ${bp.l}'` } : RECT_POOL;
    return productToScene(base, {}, paverTypes, finishOptions);
  });
  const [entered, setEntered] = React.useState(!!scene);
  React.useEffect(() => { if (scene) { setCurrent(scene); setEntered(true); } }, [scene]);

  if (!embedded) {
    return (
      <div className="relative">
        <UnifiedPoolVisualizer scene={current} textureLibrary={library} onSceneChange={setCurrent} showcase={!entered} />
        {!entered && <div className="fixed inset-0 z-[10060]"><PreScreen full onEnter={() => setEntered(true)} /></div>}
      </div>
    );
  }
  return (
    <div className="relative w-full overflow-hidden" style={{ height, transform: 'translateZ(0)' }}>
      <UnifiedPoolVisualizer embedded scene={current} textureLibrary={library} onSceneChange={setCurrent} showcase={!entered} />
      {!entered && <PreScreen full={false} onEnter={() => setEntered(true)} />}
    </div>
  );
};

export default ShowroomStudio3D;
