import * as THREE from 'three';
import { CAMPUS } from './campus-data.js';
import { buildWorld } from './world/index.js';
import { createLighting } from './lighting.js';
import { createPlayer } from './player.js';
import { initUI } from './ui.js';
import { setTextureQuality } from './hifi.js';

const params = new URLSearchParams(location.search);
const view = params.get('view');                       // null = walk, 'top', 'overview'
const flatCheck = params.get('flat') === '1';          // footprints in one unlit colour, for overlay checks against imagery
const num = (k, d = null) => (params.has(k) && !Number.isNaN(Number(params.get(k))) ? Number(params.get(k)) : d);

// Diagnostic switches: ?aa=0 antialiasing off, ?shadows=0 shadow maps off, ?time=17.5 hour of day.
// Safe mode (?safe=1): stock shaders only (no shadows, no window glow, no sky capture, no post-processing, no antialiasing).
// The lighting module patches shader code, and none of this has run on a real graphics card: if a shader fails to compile
// there, the page reloads itself once in safe mode instead of showing black walls.
const safe = params.get('safe') === '1';
const renderer = new THREE.WebGLRenderer({ antialias: params.get('aa') !== '0' && !safe });
renderer.debug.onShaderError = (gl, program, vertexShader, fragmentShader) => {
  console.error('shader failed to compile or link:', gl.getProgramInfoLog(program), gl.getShaderInfoLog(vertexShader), gl.getShaderInfoLog(fragmentShader));
  if (safe || window.__shaderFailed) return;
  window.__shaderFailed = true;
  const q = new URLSearchParams(location.search); q.set('safe', '1');
  setTimeout(() => location.replace(location.pathname + '?' + q.toString()), 50);
};
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
setTextureQuality({ anisotropy: renderer.capabilities.getMaxAnisotropy() });
const { root, colliders, report, details, updaters, places } = await buildWorld(CAMPUS, only, tryBuilders, tryExtras, { lowPower, extras: params.get('extras') === '1', safe });
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
  // post: true/false when ?post=1/0 is given, otherwise undefined so the lighting module picks its default (it should be cheaper when lowPower is set)
  lighting = createLighting(scene, renderer, { shadows: params.get('shadows') !== '0', shadowRes: num('shadowres', lowPower ? 1024 : 2048), lowPower, plain: safe,
    post: params.has('post') ? params.get('post') !== '0' : undefined, antialias: params.get('aa') !== '0', camera: null });
  lighting.setTime(num('time', 9.2));                 // morning: the sun is in the east and lights the front of the gate, where the walk starts
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
  camera = new THREE.PerspectiveCamera(70, innerWidth / innerHeight, 0.15, 3600);   // a tighter depth range: ground layers flickered from very high up
  const f = CAMPUS.track.infield;
  // The walk starts in front of the school gate (a place offered by extras/gate.js). ?start=<place name> picks another offered
  // place; ?start=field starts on the infield as earlier versions did.
  const wanted = params.get('start') || '校门', sp = places.find(q => q.name === wanted && !q.fly);
  player = createPlayer(camera, renderer.domElement, colliders, sp ? { x: sp.x, z: sp.z, yawDeg: sp.yaw, y: sp.y } : { x: f.cx, z: f.cz + f.sizeZ / 2 - 5, yawDeg: 0 });
  if (sp && sp.pitch) player.look(0, sp.pitch);
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
const ui = showUi ? initUI({ player, lighting, campus: CAMPUS, camera, renderer, scene, view: view || 'walk', places }) : null;

// Automatic quality. Nothing here has been run on a real graphics card, so the page watches its own frame time and, when
// frames stay slow, steps down: post-processing off, then a lower pixel density, then lower again. ?adapt=0 switches this
// off; ?quality=high and ?post=1 are taken as "leave it alone". Automated browsers are left alone too (unless ?adapt=1), so
// test screenshots do not depend on how busy the machine is.
const adaptive = { on: !!player && (params.get('adapt') === '1' || (params.get('adapt') !== '0' && !navigator.webdriver && params.get('quality') !== 'high' && params.get('post') !== '1')),
  level: 0, settle: 90, avg: 0, slow: 0, last: 0, log: [] };
const QUALITY_STEPS = [
  () => (lighting && lighting.setPost && lighting.setPost(false) ? '关闭后期效果' : null),
  () => (renderer.getPixelRatio() > 1 ? (renderer.setPixelRatio(1), '降低像素密度') : null),
  () => (renderer.setPixelRatio(Math.min(renderer.getPixelRatio(), 0.75)), '再降低像素密度'),
];
function toast(text) {
  let box = document.getElementById('toast');
  if (!box) { box = document.createElement('div'); box.id = 'toast'; document.body.appendChild(box);
    box.style.cssText = 'position:fixed;left:50%;top:calc(56px + env(safe-area-inset-top,0px));transform:translateX(-50%);z-index:6;padding:6px 12px;border-radius:6px;background:rgba(12,16,22,.78);color:#ffd98a;font:13px system-ui,"PingFang SC","Microsoft YaHei",sans-serif;pointer-events:none;max-width:calc(100% - 32px);text-align:center'; }
  box.textContent = text; box.hidden = false; clearTimeout(toast.timer); toast.timer = setTimeout(() => { box.hidden = true; }, 5000);
}
function watchFrameTime(now) {
  const ms = now - adaptive.last; adaptive.last = now;
  if (!adaptive.on || adaptive.level >= QUALITY_STEPS.length) return;
  if (adaptive.settle > 0) { adaptive.settle--; adaptive.avg = 0; adaptive.slow = 0; return; }   // right after loading or after a step
  const m = Math.min(ms, 250);                // capped: one huge gap (the tab was hidden) must not count as many slow frames
  adaptive.avg = adaptive.avg ? adaptive.avg * 0.92 + m * 0.08 : m;
  if (adaptive.avg <= 42) { adaptive.slow = 0; return; }                                         // 24 frames a second or better
  if (++adaptive.slow < 45) return;
  while (adaptive.level < QUALITY_STEPS.length) {
    const did = QUALITY_STEPS[adaptive.level++]();
    if (did) { adaptive.log.push(did); if (lighting && lighting.resize) lighting.resize(innerWidth, innerHeight); if (showUi) toast('画面较慢，已自动' + did + '（网址加 ?quality=high 可保持高画质）'); break; }
  }
  adaptive.settle = 90;
}

const timer = new THREE.Timer();
let frames = 0;
renderer.setAnimationLoop(timestamp => {
  timer.update(timestamp);
  watchFrameTime(performance.now());
  // seconds; clamped above so a long frame or a tab switch cannot teleport the player, and below because the first delta can be
  // negative (the timer is created after the world is built, the first frame timestamp may be older)
  const dt = Math.max(0, Math.min(timer.getDelta(), 0.1));
  if (player) {
    player.update(dt, ui && ui.input ? ui.input() : undefined);
    if (lighting) { lighting.moveFill(camera.position.x, camera.position.y, camera.position.z); if (frames % 30 === 0) lighting.follow(camera.position.x, camera.position.z); }
  }
  if (frames % 15 === 0) for (const d of details) d.obj.visible = Math.hypot(camera.position.x - d.x, camera.position.z - d.z) < d.range;
  if (updaters.length) { const env = { camera, lighting, renderer }, seconds = timer.getElapsed(); for (const u of updaters) u(dt, seconds, env); }
  if (ui && ui.update) ui.update(dt);
  if (lighting && lighting.render) lighting.render(scene, camera); else renderer.render(scene, camera);
  frames++;
});

window.__app = {
  ready: true, items: CAMPUS.items.length, report, walking: !!player, view: view || 'walk', safe,
  // deterministic hooks for automated checks (pointer lock needs a real user gesture)
  setPose: (x, z, yawDeg, y) => player && player.setPose(x, z, yawDeg, y),
  step: (input, seconds) => player && player.step(input, seconds),
  pose: () => (player ? player.pose() : null),
  locked: () => (player ? player.controls.isLocked : null),
  setTime: h => (lighting ? lighting.setTime(h) : null),
  look: (dYaw, dPitch) => player && player.look(dYaw, dPitch),
  viewInfo: () => ({ canvasW: renderer.domElement.clientWidth, canvasH: renderer.domElement.clientHeight, aspect: camera.isPerspectiveCamera ? +camera.aspect.toFixed(4) : null, frames }),
  renderInfo: () => ({ calls: renderer.info.render.calls, triangles: renderer.info.render.triangles }),
  quality: () => ({ adaptive: adaptive.on, steps: adaptive.log.slice(), pixelRatio: renderer.getPixelRatio(), averageFrameMs: +adaptive.avg.toFixed(1), lighting: lighting && lighting.info ? lighting.info().post : null }),
};
