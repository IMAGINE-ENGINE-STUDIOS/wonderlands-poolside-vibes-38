/**
 * Per-fragment hole cutting for flat surfaces (turf, decks).
 * Imagine Engine Studios Corp.
 *
 * Each ring is tested on its own with an even-odd crossing test (inside ANY
 * ring = discarded), so overlapping pools / spas / decks never cancel each
 * other out. Rings are world XZ; up to MAX_SEG edge segments in total.
 */
import * as THREE from "three";

export const MAX_SEG = 192;
type XZ = { x: number; z: number };

export function applyHoleCut<M extends THREE.Material>(m: M, holes: XZ[][]): M {
  const segsArr: THREE.Vector4[] = []; const ring: number[] = [];
  const valid = holes.filter((r) => r.length >= 3);
  const per = Math.max(8, Math.floor(MAX_SEG / Math.max(1, valid.length)));
  valid.forEach((r, ri) => {
    const st = Math.max(1, Math.ceil(r.length / per)); const pts = r.filter((_, k) => k % st === 0);
    pts.forEach((p, k) => { const q = pts[(k + 1) % pts.length]; if (segsArr.length < MAX_SEG) { segsArr.push(new THREE.Vector4(p.x, p.z, q.x, q.z)); ring.push(ri); } });
  });
  const n = segsArr.length;
  if (!n) { m.onBeforeCompile = () => {}; m.customProgramCacheKey = () => "noHoles"; m.needsUpdate = true; return m; }
  const arr = Array.from({ length: MAX_SEG }, (_, k) => segsArr[k] ?? new THREE.Vector4());
  const ids = Array.from({ length: MAX_SEG }, (_, k) => ring[k] ?? -1);
  m.onBeforeCompile = (sh: any) => {
    sh.uniforms.uHSeg = { value: arr }; sh.uniforms.uHRing = { value: ids }; sh.uniforms.uHSegN = { value: n };
    sh.vertexShader = "varying vec3 vHW;\n" + sh.vertexShader.replace("#include <project_vertex>", "#include <project_vertex>\nvHW = (modelMatrix * vec4(transformed, 1.0)).xyz;");
    sh.fragmentShader = `uniform vec4 uHSeg[${MAX_SEG}];\nuniform float uHRing[${MAX_SEG}];\nuniform int uHSegN;\nvarying vec3 vHW;\n` + sh.fragmentShader.replace("void main() {", `void main() {
  { bool inside = false; float cur = uHRing[0]; vec2 p = vHW.xz;
    for (int k = 0; k < ${MAX_SEG}; k++) { if (k >= uHSegN) break;
      if (uHRing[k] != cur) { if (inside) discard; inside = false; cur = uHRing[k]; }
      vec2 a = uHSeg[k].xy; vec2 b = uHSeg[k].zw;
      if (((a.y > p.y) != (b.y > p.y)) && (p.x < (b.x - a.x) * (p.y - a.y) / (b.y - a.y + 1e-6) + a.x)) inside = !inside; }
    if (inside) discard; }`);
  };
  m.customProgramCacheKey = () => `holes:${n}:${segsArr.map((v) => v.x.toFixed(1) + v.y.toFixed(1)).join(",")}`;
  m.needsUpdate = true;
  return m;
}
