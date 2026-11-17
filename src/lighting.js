// Sun, sky and shadows driven by a time of day.
import * as THREE from 'three';

const LAT = 23.08 * Math.PI / 180;                     // Guangzhou
const DECL = 12 * Math.PI / 180;                       // solar declination used for the sun path (late spring); a choice, not data

// Sky colours at the key moments of the day: [zenith, horizon, sun glow]
const SKY = {
  night: [0x050912, 0x0f1826, 0x202838],
  dusk: [0x2c4a86, 0xf2a468, 0xffc070],
  day: [0x2f6fc4, 0xb9d6ee, 0xfff6dc],
};
const mix3 = (a, b, k) => a.map((c, i) => new THREE.Color(c).lerp(new THREE.Color(b[i]), k));

function makeSky() {
  // A plain gradient dome with a sun glow. It writes display colours directly (no tone mapping), so it cannot wash out.
  const material = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { zenith: { value: new THREE.Color() }, horizon: { value: new THREE.Color() }, horizonAway: { value: new THREE.Color() }, glow: { value: new THREE.Color() }, sunDir: { value: new THREE.Vector3(0, 1, 0) }, sunOn: { value: 1 } },
    vertexShader: 'varying vec3 vDir; void main(){ vDir = normalize(position); vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0); gl_Position = p.xyww; }',
    fragmentShader: `varying vec3 vDir; uniform vec3 zenith, horizon, horizonAway, glow, sunDir; uniform float sunOn;
      void main(){
        vec3 d = normalize(vDir);
        float h = clamp(d.y, -0.2, 1.0);
        // the warm horizon colour is strongest toward the sun and fades to a cooler one on the far side
        float toward = pow(0.5 + 0.5 * dot(normalize(d.xz + 1e-5), normalize(sunDir.xz + 1e-5)), 1.5);
        vec3 hz = mix(horizonAway, horizon, toward);
        vec3 c = mix(hz, zenith, pow(smoothstep(-0.02, 0.75, h), 0.42));
        c = mix(c, hz * 0.85, smoothstep(0.0, -0.2, d.y));                      // below the horizon
        float s = max(dot(d, normalize(sunDir)), 0.0);
        c += glow * (pow(s, 6.0) * 0.18 + pow(s, 60.0) * 0.35 + smoothstep(0.9993, 0.9997, s) * 1.5) * sunOn;
        gl_FragColor = vec4(c, 1.0);
      }`,
  });
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 16), material);
  mesh.scale.setScalar(3000); mesh.frustumCulled = false; mesh.renderOrder = -1;
  return mesh;
}

export function createLighting(scene, renderer, opts = {}) {
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.shadowMap.enabled = opts.shadows !== false;
  renderer.shadowMap.type = THREE.PCFShadowMap;      // PCFSoftShadowMap was removed from this three.js release

  const sky = makeSky(); scene.add(sky);
  const hemi = new THREE.HemisphereLight(0xe4ecf8, 0x8d8b7c, 1); scene.add(hemi);
  // Interiors get no sun (they are inside the shadow), so add a flat ambient term and a soft light that travels
  // with the viewer. Outdoors in daylight both are negligible next to the sun.
  const ambient = new THREE.AmbientLight(0xffffff, 0.5); scene.add(ambient);
  const fill = new THREE.PointLight(0xfff1dc, 14, 16, 1.6); scene.add(fill);
  const sun = new THREE.DirectionalLight(0xffffff, 3); sun.castShadow = true; scene.add(sun); scene.add(sun.target);
  const res = opts.shadowRes || 2048, half = opts.shadowHalf || 150;
  sun.shadow.mapSize.set(res, res);
  Object.assign(sun.shadow.camera, { left: -half, right: half, top: half, bottom: -half, near: 50, far: 1400 });
  sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.06;

  const toSun = new THREE.Vector3(); let hours = 15;
  const warm = new THREE.Color(0xffa25c), white = new THREE.Color(0xfff4e2), tmp = new THREE.Color();
  scene.fog = new THREE.Fog(0xffffff, 350, 2600);

  function setTime(h) {
    hours = ((h % 24) + 24) % 24;
    const H = (hours - 12) * 15 * Math.PI / 180;
    const el = Math.asin(Math.sin(LAT) * Math.sin(DECL) + Math.cos(LAT) * Math.cos(DECL) * Math.cos(H));
    const az = Math.atan2(Math.sin(H), Math.cos(H) * Math.sin(LAT) - Math.tan(DECL) * Math.cos(LAT));   // from south, positive toward west
    toSun.set(-Math.sin(az) * Math.cos(el), Math.sin(el), Math.cos(az) * Math.cos(el));
    const day = THREE.MathUtils.smoothstep(el, -0.12, 0.18);        // 0 at night, 1 in full daylight; twilight is still fairly bright
    const low = 1 - THREE.MathUtils.smoothstep(Math.abs(el), 0.0, 0.32);   // 1 when the sun is near the horizon
    const base = mix3(SKY.night, SKY.day, day), [zenith, horizon, glow] = base.map((c, i) => c.clone().lerp(new THREE.Color(SKY.dusk[i]), low * 0.85));   // base stays the neutral palette
    const u = sky.material.uniforms;
    u.zenith.value.copy(zenith); u.horizon.value.copy(horizon); u.horizonAway.value.copy(base[1]).lerp(zenith, 0.35); u.glow.value.copy(glow); u.sunDir.value.copy(toSun); u.sunOn.value = el > -0.1 ? 1 : 0;
    scene.fog.color.copy(u.horizonAway.value).lerp(horizon, 0.4);
    sun.intensity = 3.4 * THREE.MathUtils.smoothstep(el, -0.03, 0.15);
    sun.color.copy(tmp.copy(warm).lerp(white, THREE.MathUtils.smoothstep(el, 0.05, 0.55)));
    hemi.intensity = 0.12 + 0.95 * day; hemi.color.copy(zenith).lerp(new THREE.Color(0xffffff), 0.65);
    ambient.intensity = 0.18 + 0.32 * day;
    fill.intensity = 14 + 22 * (1 - day);                           // brighter personal light at night
    renderer.toneMappingExposure = 0.42 + 0.3 * day;
    follow(sun.target.position.x, sun.target.position.z);
    return { hours, elevationDeg: +(el * 180 / Math.PI).toFixed(1), azimuthFromSouthDeg: +(az * 180 / Math.PI).toFixed(1) };
  }
  // Keep the shadow box centred near the viewer, snapped so shadows do not shimmer as the viewer moves.
  function follow(x, z) {
    const snap = (2 * half) / res * 8;
    sun.target.position.set(Math.round(x / snap) * snap, 0, Math.round(z / snap) * snap);
    sun.position.copy(sun.target.position).addScaledVector(toSun.y > 0.02 ? toSun : new THREE.Vector3(0, 1, 0), 700);
    sky.position.set(x, 0, z);
  }
  setTime(hours);
  return { sun, hemi, sky, ambient, fill, setTime, follow, getTime: () => hours, moveFill: (x, y, z) => fill.position.set(x, y + 0.4, z) };
}
