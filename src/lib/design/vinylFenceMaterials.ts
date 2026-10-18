/**
 * Vinyl fence materials — American Vinyl Works AFC-373 (6' x 8').
 * Driven by src/assets/fencing/vinyl/manifest.json; each finish uses its diffuse
 * PNG as meshStandardMaterial.map (roughness 0.7, metalness 0, repeat 1,1).
 * Woodgrain finishes (Chai Gray, Green Teak, Mocha Walnut) use normal strength 0.3.
 * Fences store the finish's color_hex in `color`/`postColor`; posts match the panel hex.
 * © Imagine Engine Studios Corp.
 */
import * as THREE from "three";
import manifest from "@/assets/fencing/vinyl/manifest.json";
import white from "@/assets/fencing/vinyl/white_vinyl_diffuse.png.asset.json";
import tan from "@/assets/fencing/vinyl/tan_vinyl_diffuse.png.asset.json";
import lightGrey from "@/assets/fencing/vinyl/light_grey_vinyl_diffuse.png.asset.json";
import darkGrey from "@/assets/fencing/vinyl/dark_grey_vinyl_diffuse.png.asset.json";
import chai from "@/assets/fencing/vinyl/chai_gray_vinyl_diffuse.png.asset.json";
import teak from "@/assets/fencing/vinyl/green_teak_vinyl_diffuse.png.asset.json";
import mocha from "@/assets/fencing/vinyl/mocha_walnut_vinyl_diffuse.png.asset.json";

const URLS: Record<string, string> = {
  "textures/white_vinyl_diffuse.png": white.url,
  "textures/tan_vinyl_diffuse.png": tan.url,
  "textures/light_grey_vinyl_diffuse.png": lightGrey.url,
  "textures/dark_grey_vinyl_diffuse.png": darkGrey.url,
  "textures/chai_gray_vinyl_diffuse.png": chai.url,
  "textures/green_teak_vinyl_diffuse.png": teak.url,
  "textures/mocha_walnut_vinyl_diffuse.png": mocha.url,
};
const WOODGRAIN = new Set(["Chai Gray", "Green Teak", "Mocha Walnut"]);

export interface VinylFinish { id: string; name: string; hex: string; url: string; normalStrength: number }

export const VINYL_FINISHES: VinylFinish[] = (manifest.textures as { id: string; name: string; color_hex: string; file: string; pbr: { normal_strength: number } }[])
  .map((t) => ({
    id: t.id, name: t.name, hex: t.color_hex.toLowerCase(), url: URLS[t.file],
    normalStrength: WOODGRAIN.has(t.name) ? 0.3 : t.pbr.normal_strength,
  }));

export const VINYL_SPECS = manifest.specs;

/** Finish for a stored color (legacy hexes fall back to the nearest finish by color). */
export function vinylFinishFor(hex?: string): VinylFinish {
  const h = (hex || "#ffffff").toLowerCase();
  const exact = VINYL_FINISHES.find((f) => f.hex === h);
  if (exact) return exact;
  const c = new THREE.Color(h);
  let best = VINYL_FINISHES[0], bd = Infinity;
  for (const f of VINYL_FINISHES) {
    const o = new THREE.Color(f.hex);
    const d = (o.r - c.r) ** 2 + (o.g - c.g) ** 2 + (o.b - c.b) ** 2;
    if (d < bd) { bd = d; best = f; }
  }
  return best;
}

const loader = new THREE.TextureLoader();
const cache = new Map<string, THREE.MeshStandardMaterial>();

/** Shared material per finish (diffuse map + bump from the same map at the finish's normal strength). */
export function vinylMaterial(hex?: string): THREE.MeshStandardMaterial {
  const f = vinylFinishFor(hex);
  let m = cache.get(f.id);
  if (!m) {
    const tex = loader.load(f.url);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(1, 1);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    m = new THREE.MeshStandardMaterial({ map: tex, bumpMap: tex, bumpScale: f.normalStrength, roughness: 0.7, metalness: 0 });
    cache.set(f.id, m);
  }
  return m;
}
