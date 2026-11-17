// Sun, sky and shadows driven by a time of day. Baseline version.
import * as THREE from 'three';
import { Sky } from 'three/addons/objects/Sky.js';

const LAT = 23.08 * Math.PI / 180;                     // Guangzhou
const DECL = 12 * Math.PI / 180;                       // solar declination used for the sun path (late spring); a choice, not data

export function createLighting(scene, renderer, opts = {}) {
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.shadowMap.enabled = opts.shadows !== false;
  renderer.shadowMap.type = THREE.PCFShadowMap;      // PCFSoftShadowMap was removed from this three.js release

  const sky = new Sky(); sky.scale.setScalar(5000); scene.add(sky);
  const u = sky.material.uniforms;
  u.turbidity.value = 5; u.rayleigh.value = 1.4; u.mieCoefficient.value = 0.004; u.mieDirectionalG.value = 0.82;

  const hemi = new THREE.HemisphereLight(0xcfe2ff, 0x6b6f58, 1); scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xffffff, 3); sun.castShadow = true; scene.add(sun); scene.add(sun.target);
  const res = opts.shadowRes || 2048, half = opts.shadowHalf || 150;
  sun.shadow.mapSize.set(res, res);
  Object.assign(sun.shadow.camera, { left: -half, right: half, top: half, bottom: -half, near: 50, far: 1400 });
  sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.06;

  const toSun = new THREE.Vector3(); let hours = 15;
  const warm = new THREE.Color(0xffb070), white = new THREE.Color(0xfff6e8), tmp = new THREE.Color();

  function setTime(h) {
    hours = h;
    const H = (h - 12) * 15 * Math.PI / 180;
    const el = Math.asin(Math.sin(LAT) * Math.sin(DECL) + Math.cos(LAT) * Math.cos(DECL) * Math.cos(H));
    const az = Math.atan2(Math.sin(H), Math.cos(H) * Math.sin(LAT) - Math.tan(DECL) * Math.cos(LAT));   // from south, positive toward west
    toSun.set(-Math.sin(az) * Math.cos(el), Math.sin(el), Math.cos(az) * Math.cos(el));
    u.sunPosition.value.copy(toSun);
    const day = THREE.MathUtils.smoothstep(el, -0.05, 0.25);       // 0 at night, 1 in full daylight
    sun.intensity = 3.2 * day; sun.color.copy(tmp.copy(warm).lerp(white, THREE.MathUtils.smoothstep(el, 0.05, 0.6)));
    hemi.intensity = 0.15 + 0.85 * day;
    renderer.toneMappingExposure = 0.28 + 0.22 * day;
    scene.fog = new THREE.Fog(tmp.setHSL(0.58, 0.25, 0.25 + 0.5 * day).getHex(), 300, 2600);
    follow(sun.target.position.x, sun.target.position.z);
    return { elevationDeg: +(el * 180 / Math.PI).toFixed(1), azimuthFromSouthDeg: +(az * 180 / Math.PI).toFixed(1) };
  }
  // Keep the shadow box centred near the viewer, snapped so shadows do not shimmer as the viewer moves.
  function follow(x, z) {
    const snap = (2 * half) / res * 8;
    sun.target.position.set(Math.round(x / snap) * snap, 0, Math.round(z / snap) * snap);
    sun.position.copy(sun.target.position).addScaledVector(toSun, 700);
  }
  setTime(hours);
  return { sun, hemi, sky, setTime, follow, getTime: () => hours };
}
