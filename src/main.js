import * as THREE from 'three';
import { CAMPUS } from './campus-data.js';
import { buildWorld } from './world/index.js';
import { createLighting } from './lighting.js';
import { createPlayer } from './player.js';

const params = new URLSearchParams(location.search);
const view = params.get('view');                       // null = walk, 'top', 'overview'
const flatCheck = params.get('flat') === '1';          // footprints in one unlit colour, for overlay checks against imagery
const num = (k, d = null) => (params.has(k) && !Number.isNaN(Number(params.get(k))) ? Number(params.get(k)) : d);

// Diagnostic switches: ?aa=0 antialiasing off, ?shadows=0 shadow maps off, ?time=17.5 hour of day.
const renderer = new THREE.WebGLRenderer({ antialias: params.get('aa') !== '0' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const { root, colliders, report } = await buildWorld(CAMPUS);
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
  lighting = createLighting(scene, renderer, { shadows: params.get('shadows') !== '0', shadowRes: num('shadowres', 2048) });
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
});

document.getElementById('loading').remove();

// Start panel and status notice. Hidden in the top-down check view so alignment screenshots stay clean.
const startPanel = document.getElementById('start'), notice = document.getElementById('notice');
if (player) {
  startPanel.hidden = false; notice.hidden = false;
  if (!player.canLock) {
    // Touch devices: keyboard and mouse hints do not apply, so hide them rather than show advice that cannot be followed.
    document.getElementById('start-how').textContent = '触屏操控尚未完成，暂请用电脑浏览。';
    startPanel.querySelector('.keys').hidden = true; startPanel.style.cursor = 'default';
  }
  startPanel.addEventListener('click', () => player.requestLock());
  player.controls.addEventListener('lock', () => { startPanel.hidden = true; });
  player.controls.addEventListener('unlock', () => { startPanel.hidden = false; });
} else if (view !== 'top') {
  notice.hidden = false;
}

const timer = new THREE.Timer();
let frames = 0;
renderer.setAnimationLoop(timestamp => {
  timer.update(timestamp);
  const dt = Math.min(timer.getDelta(), 0.1);          // seconds; clamped so a long frame or a tab switch cannot teleport the player
  if (player) {
    player.update(dt);
    if (lighting && frames % 30 === 0) lighting.follow(camera.position.x, camera.position.z);
  }
  renderer.render(scene, camera); frames++;
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
