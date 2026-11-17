import * as THREE from 'three';
import { CAMPUS } from './campus-data.js';
import { createPlayer } from './player.js';

let player = null;

// PLACEHOLDER heights in metres. No building height has been measured yet;
// these exist only so footprints are visible. Replace with estimates from
// the reference footage and mark each one as an estimate when that is done.
const PLACEHOLDER_HEIGHT = 12;

const params = new URLSearchParams(location.search);
const debugTopDown = params.get('view') === 'top';

// Diagnostic switches: ?aa=0 turns antialiasing off, ?shadows=0 turns shadow maps off.
const renderer = new THREE.WebGLRenderer({ antialias: params.get('aa') !== '0' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = params.get('shadows') !== '0';
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xa9c9e6);

scene.add(new THREE.HemisphereLight(0xcfe2ff, 0x5a6b4a, 1.1));
const sun = new THREE.DirectionalLight(0xfff2dc, 2.6);
sun.position.set(-180, 260, 140);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, { left: -320, right: 320, top: 320, bottom: -320, near: 10, far: 900 });
scene.add(sun);

const ground = new THREE.Mesh(new THREE.PlaneGeometry(900, 900), new THREE.MeshStandardMaterial({ color: 0x6f7f66 }));
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

function slab(sizeX, sizeZ, y, color) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(sizeX, 0.1, sizeZ), new THREE.MeshStandardMaterial({ color }));
  m.position.y = y; m.receiveShadow = true; return m;
}
const t = CAMPUS.track;
const trackMesh = slab(t.outer.sizeX, t.outer.sizeZ, 0.05, 0x9c3b30);
trackMesh.position.set(t.outer.cx, 0.05, t.outer.cz); scene.add(trackMesh);
const grass = slab(t.infield.sizeX, t.infield.sizeZ, 0.1, 0x4f9a4a);
grass.position.set(t.infield.cx, 0.1, t.infield.cz); scene.add(grass);

// ?flat=1 draws footprints in one unlit colour with no shadows, for overlay checks against imagery.
const flat = params.get('flat') === '1';
if (flat) { renderer.shadowMap.enabled = false; scene.background = new THREE.Color(0x000000); ground.visible = false; }
const wall = flat ? new THREE.MeshBasicMaterial({ color: 0xff00ff }) : new THREE.MeshStandardMaterial({ color: 0xd9d6cf });
function box(w, h, d) { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), wall); m.castShadow = m.receiveShadow = true; return m; }

for (const b of CAMPUS.buildings) {
  const f = b.footprint, h = PLACEHOLDER_HEIGHT;
  if (b.shape === 'rect') {
    const m = box(f.sizeX, h, f.sizeZ); m.position.set(f.cx, h / 2, f.cz); m.name = b.id; scene.add(m);
  } else if (b.shape === 'circle') {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(f.radius, f.radius, h, 40), wall);
    m.castShadow = m.receiveShadow = true; m.position.set(f.cx, h / 2, f.cz); m.name = b.id; scene.add(m);
  } else if (b.shape === 'polyline-band') {
    const pts = f.centreline;
    for (let i = 0; i < pts.length - 1; i++) {
      const [x0, z0] = pts[i], [x1, z1] = pts[i + 1];
      const len = Math.hypot(x1 - x0, z1 - z0);
      const m = box(len + f.depth * 0.15, h, f.depth);
      m.position.set((x0 + x1) / 2, h / 2, (z0 + z1) / 2);
      m.rotation.y = -Math.atan2(z1 - z0, x1 - x0);
      m.name = b.id + '#' + i; scene.add(m);
    }
  } else {
    console.warn('unhandled shape', b.id, b.shape);
  }
}

let camera;
if (debugTopDown) {
  // Optional exact bounds in metres (x west/east, z north/south) so a screenshot can be
  // overlaid pixel-for-pixel on a satellite crop: ?view=top&w=..&e=..&n=..&s=..
  const num = k => (params.has(k) ? Number(params.get(k)) : null);
  let w = num('w'), e = num('e'), n = num('n'), s = num('s');
  if ([w, e, n, s].some(v => v === null || Number.isNaN(v))) {
    const half = 210, aspect = innerWidth / innerHeight;
    w = 80 - half * aspect; e = 80 + half * aspect; n = -40 - half; s = -40 + half;
  }
  const cx = (w + e) / 2, cz = (n + s) / 2;
  camera = new THREE.OrthographicCamera(-(e - w) / 2, (e - w) / 2, (s - n) / 2, -(s - n) / 2, 1, 2000);
  camera.position.set(cx, 800, cz); camera.up.set(0, 0, -1); camera.lookAt(cx, 0, cz);   // north at top of screen
} else if (params.get('view') === 'overview') {
  camera = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, 0.5, 3000);
  camera.position.set(-40, 150, 330); camera.lookAt(90, 0, -40);
} else {
  camera = new THREE.PerspectiveCamera(70, innerWidth / innerHeight, 0.1, 3000);
  player = createPlayer(camera, renderer.domElement, CAMPUS);
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
    startPanel.querySelector('.keys').hidden = true;
    startPanel.style.cursor = 'default';
  }
  startPanel.addEventListener('click', () => player.requestLock());
  player.controls.addEventListener('lock', () => { startPanel.hidden = true; });
  player.controls.addEventListener('unlock', () => { startPanel.hidden = false; });
} else if (!debugTopDown) {
  notice.hidden = false;
}

const timer = new THREE.Timer();
renderer.setAnimationLoop((timestamp) => {
  timer.update(timestamp);
  const dt = Math.min(timer.getDelta(), 0.1);   // seconds; clamped so a long first frame or tab switch cannot teleport the player
  if (player) player.update(dt);
  renderer.render(scene, camera);
});
window.__app = {
  ready: true, entries: CAMPUS.buildings.length, meshes: scene.children.filter(o => o.isMesh).length,
  topDown: debugTopDown, walking: !!player,
  // deterministic hooks for automated checks (pointer lock needs a real user gesture)
  setPose: (x, z, yawDeg) => player && player.setPose(x, z, yawDeg),
  step: (input, seconds) => player && player.step(input, seconds),
  pose: () => (player ? player.pose() : null),
  locked: () => (player ? player.controls.isLocked : null),
  viewInfo: () => ({ canvasW: renderer.domElement.clientWidth, canvasH: renderer.domElement.clientHeight, aspect: camera.isPerspectiveCamera ? +camera.aspect.toFixed(4) : null }),
};
