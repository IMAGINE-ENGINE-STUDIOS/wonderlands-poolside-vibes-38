/**
 * GradientSky — physically-inspired sky dome for the 3D Studio.
 * Deep zenith blue → luminous horizon by day; as the sun drops the dome blends
 * into a golden/rose sunset gradient with a warm glow around a crisp sun disc.
 * One shader, one draw call, no textures.
 * © Imagine Engine Studios Corp.
 */
import React from "react";
import * as THREE from "three";

const vert = /* glsl */ `
varying vec3 vDir;
void main() {
  vDir = normalize(position);
  vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  gl_Position = p.xyww;
}`;

const frag = /* glsl */ `
uniform vec3 uSun;
varying vec3 vDir;
void main() {
  vec3 d = normalize(vDir);
  float h = clamp(d.y, -0.2, 1.0);
  float sunH = clamp(uSun.y, -0.1, 1.0);
  // 0 = high sun (day), 1 = sun on the horizon (sunset)
  float dusk = 1.0 - smoothstep(0.02, 0.35, sunH);

  // Day: vivid blue zenith to bright pale horizon
  vec3 dayZenith = vec3(0.05, 0.27, 0.78);
  vec3 dayMid    = vec3(0.20, 0.52, 0.95);
  vec3 dayHor    = vec3(0.70, 0.86, 1.00);
  // Sunset: indigo zenith, rose band, molten orange horizon
  vec3 setZenith = vec3(0.10, 0.14, 0.42);
  vec3 setMid    = vec3(0.78, 0.38, 0.45);
  vec3 setHor    = vec3(1.00, 0.55, 0.20);

  float t1 = smoothstep(0.0, 0.18, h);
  float t2 = smoothstep(0.12, 0.75, h);
  vec3 day = mix(mix(dayHor, dayMid, t1), dayZenith, t2);
  vec3 set = mix(mix(setHor, setMid, t1), setZenith, t2);
  vec3 col = mix(day, set, dusk);

  // Sun disc + halo (warmer and wider at dusk, stronger toward the sun side)
  float cosA = dot(d, normalize(uSun));
  float disc = smoothstep(0.9994, 0.9998, cosA);
  float halo = pow(max(cosA, 0.0), mix(180.0, 40.0, dusk)) * mix(0.35, 0.9, dusk);
  float side = pow(max(cosA, 0.0), 4.0) * dusk * 0.35 * (1.0 - t2);
  vec3 sunCol = mix(vec3(1.0, 0.97, 0.90), vec3(1.0, 0.62, 0.30), dusk);
  col += sunCol * (halo + side) + vec3(1.0, 0.98, 0.92) * disc * 2.0;

  // Below the horizon fades to a soft ground haze
  col = mix(col, mix(dayHor, setHor, dusk) * 0.75, smoothstep(0.0, -0.2, d.y));
  gl_FragColor = vec4(col, 1.0);
}`;

export function GradientSky({ sunPosition }: { sunPosition: [number, number, number] }) {
  const mat = React.useMemo(() => new THREE.ShaderMaterial({
    vertexShader: vert, fragmentShader: frag, side: THREE.BackSide, depthWrite: false,
    uniforms: { uSun: { value: new THREE.Vector3(0, 1, 0) } },
  }), []);
  React.useEffect(() => { mat.uniforms.uSun.value.set(...sunPosition).normalize(); }, [mat, sunPosition]);
  React.useEffect(() => () => mat.dispose(), [mat]);
  return (
    <mesh material={mat} renderOrder={-1000} frustumCulled={false} scale={4000}>
      <sphereGeometry args={[1, 48, 24]} />
    </mesh>
  );
}
