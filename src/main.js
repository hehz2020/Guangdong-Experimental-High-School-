import * as THREE from 'three';
import { CAMPUS } from './campus-data.js';
import { buildWorld } from './world/index.js';
import { createLighting } from './lighting.js';
import { createPlayer } from './player.js';
import { initUI } from './ui.js';
import { setTextureQuality, addSurfaceGrain } from './hifi.js';

const params = new URLSearchParams(location.search);
const view = params.get('view');                       // null = walk, 'top', 'overview'
const flatCheck = params.get('flat') === '1';          // footprints in one unlit colour, for overlay checks against imagery
const num = (k, d = null) => (params.has(k) && !Number.isNaN(Number(params.get(k))) ? Number(params.get(k)) : d);

// Diagnostic switches: ?aa=0 antialiasing off, ?shadows=0 shadow maps off, ?time=17.5 hour of day.
// Safe mode (?safe=1): stock shaders only (no shadows, no window glow, no sky capture, no post-processing, no antialiasing).
// The lighting module patches shader code, and none of this has run on a real graphics card: if a shader fails to compile
// there, the page reloads itself once in safe mode instead of showing black walls.
const safe = params.get('safe') === '1';
// Loading takes tens of seconds (every texture, model and shader is made on the spot), so the page says what it is doing:
// step() writes a line on the loading panel (index.html) and breathe() gives the browser a moment to draw it.
const step = text => { if (window.__loadStep) window.__loadStep(text); console.info('[load] ' + Math.round(performance.now()) + ' ms: ' + text); };
const breathe = () => new Promise(done => { let over = false; const go = () => { if (!over) { over = true; done(); } }; requestAnimationFrame(() => setTimeout(go, 0)); setTimeout(go, 150); });
step(safe ? '正在启动（安全模式）' : '正在启动'); await breathe();
let renderer;
try { renderer = new THREE.WebGLRenderer({ antialias: params.get('aa') !== '0' && !safe }); }
catch (err) { if (window.__loadFail) window.__loadFail('这个浏览器没有提供 WebGL（三维绘图），页面无法显示。原始信息：' + err.message); throw err; }
// Which graphics device the browser draws with. A software renderer means the browser is not using the graphics card
// (hardware acceleration switched off, a blocked driver, a remote desktop): the page runs, but at seconds per frame.
const graphics = (() => { try { const gl = renderer.getContext(), e = gl.getExtension('WEBGL_debug_renderer_info'); return e ? String(gl.getParameter(e.UNMASKED_RENDERER_WEBGL)) : ''; } catch (err) { return ''; } })();
const software = /swiftshader|basic render|llvmpipe|softpipe|software|warp/i.test(graphics);
{ const line = document.getElementById('loading-gpu');
  if (line) { line.textContent = software ? '注意：浏览器没有用显卡绘图（' + graphics + '）。能运行，但会非常卡；请在浏览器“设置 → 系统”里开启“使用硬件加速”并重启浏览器，或更新显卡驱动。' : (graphics ? '绘图设备：' + graphics : '');
    if (software) line.style.color = '#ffd98a'; } }
console.info('[load] graphics: ' + (graphics || 'not named') + (software ? ' (software rendering)' : ''));
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
const { root, colliders, report, details, updaters, places } = await buildWorld(CAMPUS, only, tryBuilders, tryExtras, { lowPower, extras: params.get('extras') === '1', safe,
  progress: async (what, i, n) => { step(`${what === 'item' ? '正在搭建楼宇' : '正在布置场地和周边'} ${i} / ${n}`); await breathe(); } });
scene.add(root);
step('正在处理材质'); await breathe();
// Fine grain and patchy gloss on every flat-coloured material (desktop only; not in safe mode: it edits shaders). ?grain=0 turns it off.
if (!lowPower && !safe && params.get('grain') !== '0') addSurfaceGrain(root);

step('正在准备光照'); await breathe();
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

step('正在建立碰撞检测'); await breathe();
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

// For a person the loading panel stays up until everything has been drawn (see the frame loop). Under automation it goes
// away here, as it always did, so that scripts can act as soon as the page reports ready; ?reveal=1 gives a script the
// person's sequence.
const human = params.has('reveal') ? params.get('reveal') === '1' : !navigator.webdriver;
if (!human) document.getElementById('loading').remove();
step('正在准备界面'); await breathe();

// Start panel and status notice. Hidden in the top-down check view so alignment screenshots stay clean.
const startPanel = document.getElementById('start'), notice = document.getElementById('notice');
const showUi = params.get('ui') !== '0';              // ?ui=0 hides the panel and notice (clean screenshots)
if (player && showUi) {
  startPanel.hidden = false; notice.hidden = false;
  if (!player.canLock) {
    // No mouse pointer that can be locked: the keyboard and mouse hints do not apply, so hide them. On touch devices
    // src/ui.js replaces this line straight away by its own hint (stick and swipe); what stays visible here is only for a
    // device with neither a mouse nor a touch screen, where the view cannot be turned at all.
    document.getElementById('start-how').textContent = '这台设备不能锁定鼠标，无法转动视角；请改用带鼠标的电脑或触屏设备。';
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

// A shader is compiled the first time something that uses it is drawn. Drawing the whole world in one first frame
// makes a frame that can take tens of seconds on a real graphics driver (the browser cannot repaint meanwhile, and may
// even give up on its graphics process). So the world is switched on a few groups per frame behind the loading panel,
// which keeps counting; the panel goes away once everything has been drawn and the shadows have been redrawn.
// Not under automation, and not when the browser draws in software (there every extra frame costs seconds), unless
// ?reveal=1 asks for it.
const reveal = { groups: root.children.filter(o => o.visible), next: 0, settle: 0, shown: false,
  on: params.has('reveal') ? params.get('reveal') === '1' : (human && !software) };       // with software rendering every extra frame costs seconds
if (reveal.on) for (const g of reveal.groups) g.visible = false; else reveal.next = reveal.groups.length;
step('正在编译着色器并绘制第一帧（画面会停顿一会儿，请稍等）'); await breathe(); await breathe();
const timer = new THREE.Timer();
let frames = 0;
renderer.setAnimationLoop(timestamp => {
  if (reveal.next < reveal.groups.length) {
    const batch = Math.ceil(reveal.groups.length / 16);
    for (let i = 0; i < batch && reveal.next < reveal.groups.length; i++) reveal.groups[reveal.next++].visible = true;
    step(`正在编译着色器并绘制 ${reveal.next} / ${reveal.groups.length}（画面会有停顿）`);
    if (reveal.next === reveal.groups.length && lighting) lighting.setTime(lighting.getTime());      // shadow maps again, with everything in place
  }
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
  if (!reveal.shown && reveal.next >= reveal.groups.length && ++reveal.settle >= (reveal.on ? 5 : 1)) {
    reveal.shown = true; console.info('[load] ' + Math.round(performance.now()) + ' ms: everything drawn, panel removed');
    const panel = document.getElementById('loading'); if (panel) panel.remove(); if (window.__app) window.__app.drawn = true;
  }
});

window.__app = {
  ready: true,            // the world is built and the hooks below can be used
  drawn: false,           // true once everything has been drawn and the loading panel is gone
  graphics, software,
  items: CAMPUS.items.length, report, walking: !!player, view: view || 'walk', safe,
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
