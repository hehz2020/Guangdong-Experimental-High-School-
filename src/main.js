import * as THREE from 'three';
import { CAMPUS } from './campus-data.js';
import { buildWorld } from './world/index.js';
import { createLighting } from './lighting.js';
import { createPlayer } from './player.js';
import { initUI } from './ui.js';

const params = new URLSearchParams(location.search);
const view = params.get('view');                       // null = walk, 'top', 'overview'
const flatCheck = params.get('flat') === '1';          // footprints in one unlit colour, for overlay checks against imagery
const num = (k, d = null) => (params.has(k) && !Number.isNaN(Number(params.get(k))) ? Number(params.get(k)) : d);

// Diagnostic switches: ?aa=0 antialiasing off, ?shadows=0 shadow maps off, ?time=17.5 hour of day.
const renderer = new THREE.WebGLRenderer({ antialias: params.get('aa') !== '0' });
// Phones and tablets get a lower pixel density and a smaller shadow map by default; ?quality=high or ?quality=low overrides.
const lowPower = params.get('quality') ? params.get('quality') === 'low' : matchMedia('(pointer: coarse)').matches;
renderer.setPixelRatio(Math.min(devicePixelRatio, lowPower ? 1.5 : 2));
renderer.setSize(innerWidth, innerHeight);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
// ?only=id,id builds just those items (close-up checks of one building)
const only = params.get('only') ? new Set(params.get('only').split(',')) : null;
// ?try=style:file.js,style:file.js mounts builders from src/world/builders/ for this page load; ?tryx=file.js,... mounts extras from src/world/extras/
const tryBuilders = Object.fromEntries((params.get('try') || '').split(',').filter(Boolean).map(s => { const i = s.indexOf(':'); return [s.slice(0, i), './builders/' + s.slice(i + 1)]; }));
const tryExtras = (params.get('tryx') || '').split(',').filter(Boolean).map(f => './extras/' + f);
const { root, colliders, report, details } = await buildWorld(CAMPUS, only, tryBuilders, tryExtras);
scene.add(root);

let lighting = null;
if (flatCheck) {
  scene.background = new THREE.Color(0x000000);
  const magenta = new THREE.MeshBasicMaterial({ color: 0xff00ff });
  const solid = new Set(CAMPUS.items.filter(i => i.solid || i.walkUnder).map(i => i.id));
  for (const child of root.children) {
    if (solid.has(child.name)) child.traverse(o => { if (o.isMesh) o.material = magenta; });
    else child.visible = false;
  }
} else {
  lighting = createLighting(scene, renderer, { shadows: params.get('shadows') !== '0', shadowRes: num('shadowres', lowPower ? 1024 : 2048) });
  lighting.setTime(num('time', 15));
}

let camera, player = null;
if (view === 'top') {
  // Optional exact bounds in metres so a screenshot can be overlaid pixel-for-pixel on imagery: &w=..&e=..&n=..&s=..
  let w = num('w'), e = num('e'), n = num('n'), s = num('s');
  if ([w, e, n, s].some(v => v === null)) { const half = 230, a = innerWidth / innerHeight; w = 60 - half * a; e = 60 + half * a; n = -60 - half; s = -60 + half; }
  const cx = (w + e) / 2, cz = (n + s) / 2;
  camera = new THREE.OrthographicCamera(-(e - w) / 2, (e - w) / 2, (s - n) / 2, -(s - n) / 2, 1, 3000);
  camera.position.set(cx, 900, cz); camera.up.set(0, 0, -1); camera.lookAt(cx, 0, cz);       // north at the top of the screen
  if (lighting) lighting.follow(cx, cz);
} else if (view === 'overview') {
  camera = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 1, 6000);
  camera.position.set(num('cx', -120), num('cy', 170), num('cz', 330)); camera.lookAt(num('tx', 90), num('ty', 0), num('tz', -40));
  if (lighting) lighting.follow(60, -40);
} else {
  camera = new THREE.PerspectiveCamera(70, innerWidth / innerHeight, 0.1, 6000);
  const f = CAMPUS.track.infield;
  player = createPlayer(camera, renderer.domElement, colliders, { x: f.cx, z: f.cz + f.sizeZ / 2 - 5, yawDeg: 0 });
}

addEventListener('resize', () => {
  renderer.setSize(innerWidth, innerHeight);
  if (camera.isPerspectiveCamera) { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); }
  if (lighting && lighting.resize) lighting.resize(innerWidth, innerHeight);
});

document.getElementById('loading').remove();

// Start panel and status notice. Hidden in the top-down check view so alignment screenshots stay clean.
const startPanel = document.getElementById('start'), notice = document.getElementById('notice');
const showUi = params.get('ui') !== '0';              // ?ui=0 hides the panel and notice (clean screenshots)
if (player && showUi) {
  startPanel.hidden = false; notice.hidden = false;
  if (!player.canLock) {
    // Touch devices: keyboard and mouse hints do not apply, so hide them rather than show advice that cannot be followed.
    document.getElementById('start-how').textContent = '触屏操控尚未完成，暂请用电脑浏览。';
    startPanel.querySelector('.keys').hidden = true; startPanel.style.cursor = 'default';
  }
  startPanel.addEventListener('click', () => player.requestLock());
  player.controls.addEventListener('lock', () => { startPanel.hidden = true; });
  player.controls.addEventListener('unlock', () => { startPanel.hidden = false; });
} else if (view !== 'top' && showUi) {
  notice.hidden = false;
}

// Optional interface layer (touch controls, HUD). src/ui.js may return { update(dt), input() }; input() supplies extra movement for the player.
const ui = showUi ? initUI({ player, lighting, campus: CAMPUS, camera, renderer, scene, view: view || 'walk' }) : null;

const timer = new THREE.Timer();
let frames = 0;
renderer.setAnimationLoop(timestamp => {
  timer.update(timestamp);
  const dt = Math.min(timer.getDelta(), 0.1);          // seconds; clamped so a long frame or a tab switch cannot teleport the player
  if (player) {
    player.update(dt, ui && ui.input ? ui.input() : undefined);
    if (lighting) { lighting.moveFill(camera.position.x, camera.position.y, camera.position.z); if (frames % 30 === 0) lighting.follow(camera.position.x, camera.position.z); }
  }
  if (frames % 15 === 0) for (const d of details) d.obj.visible = Math.hypot(camera.position.x - d.x, camera.position.z - d.z) < d.range;
  if (ui && ui.update) ui.update(dt);
  if (lighting && lighting.render) lighting.render(scene, camera); else renderer.render(scene, camera);
  frames++;
});

window.__app = {
  ready: true, items: CAMPUS.items.length, report, walking: !!player, view: view || 'walk',
  // deterministic hooks for automated checks (pointer lock needs a real user gesture)
  setPose: (x, z, yawDeg, y) => player && player.setPose(x, z, yawDeg, y),
  step: (input, seconds) => player && player.step(input, seconds),
  pose: () => (player ? player.pose() : null),
  locked: () => (player ? player.controls.isLocked : null),
  setTime: h => (lighting ? lighting.setTime(h) : null),
  viewInfo: () => ({ canvasW: renderer.domElement.clientWidth, canvasH: renderer.domElement.clientHeight, aspect: camera.isPerspectiveCamera ? +camera.aspect.toFixed(4) : null, frames }),
  renderInfo: () => ({ calls: renderer.info.render.calls, triangles: renderer.info.render.triangles }),
};
