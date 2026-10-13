/**
 * Showroom 3D Studio — the live 3D designer seeded with a plain rectangular
 * pool (16' × 36'), or with any scene handed in (e.g. from the 2D site planner).
 * `embedded` (default) keeps the viewer inside its frame: the wrapper uses a
 * CSS transform so even `fixed` panels inside the viewer stay contained.
 * The full-screen version lives on its own page at /studio-3d.
 */
import * as React from 'react';
import { UnifiedPoolVisualizer } from '@/components/UnifiedPoolVisualizer';
import { productToScene } from '@/components/scene3d/SceneConverter';
import { paverTypes } from '@/data/paverData';
import { poolFinishes } from '@/data/consolidatedProducts';
import { buildCatalogTextureLibrary } from '@/data/textureLibrary';

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
}

const ShowroomStudio3D: React.FC<Props> = ({ scene, textureLibrary, height = 720, embedded = true }) => {
  const library = React.useMemo(() => textureLibrary ?? buildCatalogTextureLibrary(), [textureLibrary]);
  const [current, setCurrent] = React.useState<any>(() => scene ?? productToScene(RECT_POOL, {}, paverTypes, finishOptions));
  React.useEffect(() => { if (scene) setCurrent(scene); }, [scene]);
  if (!embedded) return <UnifiedPoolVisualizer scene={current} textureLibrary={library} onSceneChange={setCurrent} />;
  return (
    <div className="relative w-full overflow-hidden" style={{ height, transform: 'translateZ(0)' }}>
      <UnifiedPoolVisualizer embedded scene={current} textureLibrary={library} onSceneChange={setCurrent} />
    </div>
  );
};

export default ShowroomStudio3D;
