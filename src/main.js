import * as THREE from 'three';
import { CAMPUS } from './campus-data.js';
import { buildWorld } from './world/index.js';
import { createLighting } from './lighting.js';
import { createPlayer } from './player.js';
import { initUI } from './ui.js';
import { setTextureQuality, addSurfaceGrain, SURFACE_TIME } from './hifi.js';
import { createCulling } from './culling.js';

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
const { root, colliders, report, details, updaters, places, indoors } = await buildWorld(CAMPUS, only, tryBuilders, tryExtras, { lowPower, extras: params.get('extras') === '1', safe,
  progress: async (what, i, n) => { step(`${what === 'item' ? '正在搭建楼宇' : '正在布置场地和周边'} ${i} / ${n}`); await breathe(); } });
scene.add(root);
console.info('[load] procedural surfaces: ' + SURFACE_TIME.n + ' computed in ' + Math.round(SURFACE_TIME.ms) + ' ms (part of the build above)');
step('正在处理材质'); await breathe();
// Fine grain and patchy gloss on every flat-coloured material (desktop only; not in safe mode: it edits shaders). ?grain=0 turns it off.
if (!lowPower && !safe && params.get('grain') !== '0') addSurfaceGrain(root);

step('正在准备光照'); await breathe();
// Engine-side limits on what is drawn (details' reach, plants culled when out of view, which casters each shadow box takes,
// the pool's mirror): src/culling.js. Not in the flat overlay check, which draws footprints only.
// ?engine=0 leaves all of that out (and the lamps' lights, see lighting.js), as the page was before: for comparisons.
const engineOn = params.get('engine') !== '0';
const culling = flatCheck || !engineOn ? null : createCulling({ root, details, indoors, lowPower, safe });
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
    post: params.has('post') ? params.get('post') !== '0' : undefined, antialias: params.get('aa') !== '0', camera: null, indoors,
    casterLayers: culling ? { mid: culling.LAYER_MID, far: culling.LAYER_FAR } : null, legacy: !engineOn });
  lighting.setTime(num('time', 9.2));                 // morning: the sun is in the east and lights the front of the gate, where the walk starts
}

step('正在建立碰撞检测'); await breathe();
const tOctree = performance.now();
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

if (player) console.info('[load] collision octree built in ' + Math.round(performance.now() - tOctree) + ' ms');
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

// Automatic quality. Nothing here has been run on a real graphics card, so the page watches its own frame time. When
// frames stay slow (over 40 ms, i.e. under 25 a second, for about 45 frames) it goes one rung down the ladder below; when
// they stay quick (under 21 ms for about 300 frames: 5 s at 60 a second) it tries one rung up again. A rung that turns out
// too slow straight after a step up (within 240 frames) is barred for a minute, then two, four... up to ten. Each rung
// caps some settings; a setting is never raised above what the page started with. The order puts first what costs much
// and shows little: the occlusion pass (it draws the scene a second time, then 16 samples per pixel twice), the pool's
// mirror, then pixel density, shadow map size and the reach of fine detail, then bloom and the middle shadow box, and the
// pixel density once more. ?adapt=0 switches this off; ?quality=high and ?post=1 are taken as "leave it alone".
// Automated browsers are left alone too (unless ?adapt=1), so test screenshots do not depend on how busy the machine is.
// CHOSEN by reasoning, not measured on any real graphics card: the thresholds, the rungs and their order.
const adaptive = { on: !!player && (params.get('adapt') === '1' || (params.get('adapt') !== '0' && !navigator.webdriver && params.get('quality') !== 'high' && params.get('post') !== '1')),
  level: 0, settle: 60, avg: 0, slow: 0, fast: 0, last: 0, probation: 0, log: [], history: [], barred: {}, backoff: {} };
// what the page started with, read at the first frame (post-processing has loaded by then, or failed)
let START = null;
function startSettings() {
  const sh = lighting && lighting.getShadow ? lighting.getShadow() : { res: 0, cascades: 0 }, postOn = !!(lighting && lighting.info && lighting.info().post === 'on');
  return { pr: renderer.getPixelRatio(), ao: postOn ? 2 : 0, post: postOn ? 1 : 0, shadowRes: sh.res, cascades: sh.cascades, detail: culling ? culling.getScale() : 1, mirror: culling ? culling.getMirror() : 0 };
}
const RUNGS = [
  {},                                                  // as loaded
  { ao: 1, mirror: 1 },                                // occlusion at half resolution, mirror at most 256 texels
  { ao: 0 },                                           // no occlusion (bloom stays)
  { pr: 1.5, shadowRes: 1536, detail: 0.85 },
  { pr: 1, shadowRes: 1024, detail: 0.7 },
  { post: 0, cascades: 2, detail: 0.55, mirror: 0 },   // no bloom, two shadow boxes, the mirror no longer redrawn
  { pr: 0.75 },
];
const settingsAt = n => { const q = { ...START }; for (let i = 1; i <= n; i++) for (const k in RUNGS[i]) q[k] = Math.min(q[k], RUNGS[i][k]); return q; };
const differs = (a, b) => Object.keys(a).some(k => a[k] !== b[k]);
const SAY = {
  ao: [['关闭环境光遮蔽', '降低环境光遮蔽精度'], ['恢复环境光遮蔽', '恢复环境光遮蔽精度']], mirror: [['停止更新水面倒影', '降低水面倒影精度'], ['恢复水面倒影', '提高水面倒影精度']],
  pr: [['降低像素密度'], ['提高像素密度']], shadowRes: [['降低阴影分辨率'], ['提高阴影分辨率']], cascades: [['减少阴影层数'], ['恢复阴影层数']],
  detail: [['缩短细节的显示距离'], ['加长细节的显示距离']], post: [['关闭泛光'], ['恢复泛光']],
};
let settings = null;
function applySettings(next) {
  const did = [];
  for (const k of Object.keys(next)) {
    if (next[k] === settings[k]) continue;
    const down = next[k] < settings[k], words = SAY[k][down ? 0 : 1];
    if (k === 'pr') { renderer.setPixelRatio(next.pr); if (lighting && lighting.resize) lighting.resize(innerWidth, innerHeight); }
    else if (k === 'ao') { if (lighting && lighting.setAO) lighting.setAO(['off', 'half', 'full'][next.ao]); }
    else if (k === 'post') { if (lighting && lighting.setBloom) lighting.setBloom(!!next.post); }
    else if (k === 'shadowRes') { if (lighting && lighting.setShadowRes) lighting.setShadowRes(next.shadowRes); }
    else if (k === 'cascades') { if (lighting && lighting.setCascades) lighting.setCascades(next.cascades); }
    else if (k === 'detail') { if (culling) culling.setScale(next.detail); }
    else if (k === 'mirror') { if (culling) culling.setMirror(next.mirror); }
    did.push(words.length > 1 && (down ? next[k] === 0 : settings[k] === 0) ? words[0] : words[words.length - 1]);
  }
  settings = next;
  return did;
}
function toast(text) {
  let box = document.getElementById('toast');
  if (!box) { box = document.createElement('div'); box.id = 'toast'; document.body.appendChild(box);
    box.style.cssText = 'position:fixed;left:50%;top:calc(56px + env(safe-area-inset-top,0px));transform:translateX(-50%);z-index:6;padding:6px 12px;border-radius:6px;background:rgba(12,16,22,.78);color:#ffd98a;font:13px system-ui,"PingFang SC","Microsoft YaHei",sans-serif;pointer-events:none;max-width:calc(100% - 32px);text-align:center'; }
  box.textContent = text; box.hidden = false; clearTimeout(toast.timer); toast.timer = setTimeout(() => { box.hidden = true; }, 5000);
}
function stepQuality(dir, now) {
  let to = adaptive.level; const unit = Math.sign(dir);
  for (let n = Math.abs(dir); n > 0; n--) {
    let t = to;
    do { t += unit; } while (t > 0 && t < RUNGS.length && !differs(settingsAt(t), settingsAt(to)));
    if (t < 0 || t >= RUNGS.length) break;
    to = t;
  }
  if (to === adaptive.level) return;
  dir = unit;
  if (dir > 0 && adaptive.probation > 0) {           // the rung just stepped up to was too slow: bar it for a while
    const bar = adaptive.level, wait = adaptive.backoff[bar] = Math.min(600000, (adaptive.backoff[bar] || 30000) * 2);
    adaptive.barred[bar] = now + wait;
  }
  const did = applySettings(settingsAt(to));
  adaptive.level = to; adaptive.settle = 60; adaptive.slow = adaptive.fast = 0; adaptive.probation = dir < 0 ? 240 : 0;
  if (!did.length) return;
  const text = did.join('、');
  adaptive.history.push({ level: to, dir: dir > 0 ? 'down' : 'up', text, at: Math.round(now) });
  if (dir > 0) adaptive.log.push(text);
  if (showUi) toast(dir > 0 ? '画面较慢，已自动' + text + '（网址加 ?quality=high 可保持高画质）' : '画面流畅，已自动' + text);
}
function watchFrameTime(now) {
  const ms = now - adaptive.last; adaptive.last = now;
  if (!adaptive.on) return;
  if (!START) { START = startSettings(); settings = settingsAt(0); }
  if (adaptive.settle > 0) { adaptive.settle--; adaptive.avg = 0; adaptive.slow = adaptive.fast = 0; return; }   // right after loading or after a step
  const m = Math.min(ms, 120);                // capped: one huge gap (the tab was hidden) must not count as many slow frames
  adaptive.avg = adaptive.avg ? adaptive.avg * 0.92 + m * 0.08 : m;
  if (adaptive.probation > 0) adaptive.probation--;
  if (adaptive.avg > 40) { adaptive.fast = 0; if (++adaptive.slow >= 45) stepQuality(adaptive.avg > 100 ? 2 : 1, now); return; }   // very slow: two rungs at once
  adaptive.slow = 0;
  if (adaptive.avg < 21 && adaptive.level > 0 && now >= (adaptive.barred[adaptive.level - 1] || 0)) { if (++adaptive.fast >= 300) stepQuality(-1, now); }
  else adaptive.fast = 0;
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
// post-processing first (see lighting.js whenReady): the first frame is drawn the way every later one is
if (lighting && lighting.whenReady) await Promise.race([lighting.whenReady(), new Promise(done => setTimeout(done, 20000))]);
// Every material is compiled before the first frame, the hidden detail groups' too (they used to be compiled the first
// time the viewer came near them: a stall in the middle of a walk). With KHR_parallel_shader_compile the browser compiles
// them side by side while the page stays responsive and the loading panel keeps counting; without it, this only queues
// them and the first frame waits as before. They are compiled for the buffer they will be drawn into: the composer's
// (no tone mapping, linear) when post-processing is on, the canvas otherwise. ?precompile=0 skips this.
if (lighting && lighting.prepare && params.get('precompile') !== '0') {
  step('正在编译着色器'); await breathe();
  const t0 = performance.now(), intoBuffer = lighting.prepare(camera), prev = renderer.getRenderTarget(), probe = intoBuffer ? new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType }) : null;
  let compiling = null;
  // (compileAsync warns where the extension is missing: there the plain compile queues the same work)
  try { if (probe) renderer.setRenderTarget(probe); if (renderer.extensions.has('KHR_parallel_shader_compile')) compiling = renderer.compileAsync(scene, camera); else renderer.compile(scene, camera); }
  catch (err) { console.warn('precompile skipped:', err && err.message); }
  finally { renderer.setRenderTarget(prev); }
  if (compiling) await Promise.race([compiling, new Promise(done => setTimeout(done, 180000))]);
  if (probe) probe.dispose();
  console.info('[load] ' + Math.round(performance.now()) + ' ms: ' + (renderer.info.programs ? renderer.info.programs.length : '?') + ' shader programs compiled before the first frame in ' + Math.round(performance.now() - t0) + ' ms' + (renderer.extensions.has('KHR_parallel_shader_compile') ? ' (in parallel)' : ''));
}
step('正在编译着色器并绘制第一帧（画面会停顿一会儿，请稍等）'); await breathe(); await breathe();
const timer = new THREE.Timer();
let frames = 0;
// What a frame costs in JavaScript, summed until the next __app.perf() call: the whole frame callback and its parts
// (player physics, the detail switches, the builders' per-frame functions, the interface, the render calls). Wall-clock
// milliseconds; the render part also contains the time the browser makes the script wait for the graphics process.
const perf = { frames: 0, frame: 0, player: 0, details: 0, updaters: 0, ui: 0, render: 0, worst: 0 };
renderer.setAnimationLoop(timestamp => {
  const tFrame = performance.now();
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
  let t0 = performance.now(), t1;
  if (player) {
    player.update(dt, ui && ui.input ? ui.input() : undefined);
    if (lighting) { lighting.moveFill(camera.position.x, camera.position.y, camera.position.z); if (frames % 30 === 0) lighting.follow(camera.position.x, camera.position.z); }
  }
  t1 = performance.now(); perf.player += t1 - t0; t0 = t1;
  if (culling) culling.update(camera, frames);
  else if (frames % 15 === 0) for (const d of details) d.obj.visible = Math.hypot(camera.position.x - d.x, camera.position.z - d.z) < d.range;
  t1 = performance.now(); perf.details += t1 - t0; t0 = t1;
  if (updaters.length) {
    const env = { camera, lighting, renderer }, seconds = timer.getElapsed(), cx = camera.position.x, cz = camera.position.z;
    for (const u of updaters) {
      if (u.range && Math.hypot(cx - u.x, cz - u.z) > u.range) continue;
      const a = performance.now(); u.fn(dt, seconds, env); u.ms += performance.now() - a; u.runs++;
    }
  }
  t1 = performance.now(); perf.updaters += t1 - t0; t0 = t1;
  if (ui && ui.update) ui.update(dt);
  t1 = performance.now(); perf.ui += t1 - t0; t0 = t1;
  if (lighting && lighting.render) lighting.render(scene, camera); else renderer.render(scene, camera);
  t1 = performance.now(); perf.render += t1 - t0;
  perf.frames++; perf.frame += t1 - tFrame; perf.worst = Math.max(perf.worst, t1 - tFrame);
  // the first frames are where shaders are compiled and textures uploaded: say how long each long one took
  if (frames < 40 && t1 - tFrame > 400) console.info('[load] ' + Math.round(t1) + ' ms: frame ' + frames + ' took ' + Math.round(t1 - tFrame) + ' ms (' + (renderer.info.programs ? renderer.info.programs.length : '?') + ' shader programs so far)');
  frames++;
  if (!reveal.shown && reveal.next >= reveal.groups.length && ++reveal.settle >= (reveal.on ? 5 : 1)) {
    reveal.shown = true; console.info('[load] ' + Math.round(performance.now()) + ' ms: everything drawn, panel removed');
    const panel = document.getElementById('loading'); if (panel) panel.remove(); if (window.__app) window.__app.drawn = true;
  }
});

// ?lightdebug=1 (see lighting.js) also hands the engine's lists to measuring scripts
if (params.get('lightdebug') === '1') window.__engine = { scene, root, camera, renderer, details, updaters, colliders, culling };
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
  // calls and triangles of the last frame, all passes together; passes: the same split by kind of pass (lighting.js)
  renderInfo: () => ({ calls: renderer.info.render.calls, triangles: renderer.info.render.triangles, ...(lighting && lighting.passes ? { passes: lighting.passes() } : {}) }),
  // milliseconds per frame, averaged since the previous call (see perf above); updaters: the costliest per-frame functions
  perf: (reset = true) => {
    const n = Math.max(1, perf.frames), out = { frames: perf.frames };
    for (const k of ['frame', 'player', 'details', 'updaters', 'ui', 'render']) out[k] = +(perf[k] / n).toFixed(3);
    out.worst = +perf.worst.toFixed(1);
    const by = new Map(); for (const u of updaters) { const b = by.get(u.owner) || { owner: u.owner, ms: 0, runs: 0, n: 0 }; b.ms += u.ms; b.runs += u.runs; b.n++; by.set(u.owner, b); if (reset) { u.ms = 0; u.runs = 0; } }
    out.updaterList = [...by.values()].sort((a, b) => b.ms - a.ms).map(b => ({ owner: b.owner, n: b.n, msPerFrame: +(b.ms / n).toFixed(4), runs: b.runs }));
    if (lighting && lighting.perf) out.lighting = lighting.perf(reset);
    if (reset) for (const k in perf) perf[k] = 0;
    return out;
  },
  // what the scene holds (for measurements; walks the whole scene, so not for every frame)
  sceneStats: () => {
    let objects = 0, meshes = 0, shown = 0, casters = 0, instanced = 0, tris = 0; const mats = new Set(), geos = new Set();
    const visible = o => { for (let q = o; q; q = q.parent) if (!q.visible) return false; return true; };
    scene.traverse(o => {
      objects++;
      if (!o.isMesh && !o.isLine && !o.isPoints) return;
      meshes++; if (o.isInstancedMesh) instanced++;
      (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => m && mats.add(m)); if (o.geometry) geos.add(o.geometry);
      if (visible(o)) { shown++; if (o.castShadow) casters++; const g = o.geometry; tris += g ? (g.index ? g.index.count : (g.attributes.position ? g.attributes.position.count : 0)) / 3 * (o.isInstancedMesh ? o.count : 1) : 0; }
    });
    let texBytes = 0; const texs = new Set();
    for (const m of mats) for (const k in m) { const t = m[k]; if (t && t.isTexture && !texs.has(t)) { texs.add(t); const im = t.image; if (im && im.width) texBytes += im.width * im.height * 4 * (t.generateMipmaps !== false ? 1.33 : 1); } }
    return { objects, meshes, instanced, shownMeshes: shown, shownCasters: casters, shownTriangles: Math.round(tris), materials: mats.size, geometries: geos.size, textures: texs.size, textureMB: +(texBytes / 1048576).toFixed(1),
      programs: renderer.info.programs ? renderer.info.programs.length : null, gpuTextures: renderer.info.memory.textures, gpuGeometries: renderer.info.memory.geometries, details: details.length, updaters: updaters.length };
  },
  // steps: what each step down did, in order; history: every step down and up; settings: what is in force now
  quality: () => ({ adaptive: adaptive.on, steps: adaptive.log.slice(), level: adaptive.level, history: adaptive.history.slice(), settings: settings ? { ...settings } : null,
    pixelRatio: renderer.getPixelRatio(), averageFrameMs: +adaptive.avg.toFixed(1), lighting: lighting && lighting.info ? lighting.info().post : null }),
};
