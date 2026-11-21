// Engine-side limits on what is drawn, so that the builders' fine detail costs frames only where it can be seen.
// The builders decide what is fine detail (ctx.detail) and how far it should reach; this module enforces a ceiling on
// that for everyone, and adds the rules no single builder can apply.
//
// What it does
//   details    ctx.detail(obj, x, z, range) entries (world/index.js) are switched here: shown while the viewer is within
//              range * scale of (x, z) in plan AND within the ceiling of the group's own outline (its bounding box in
//              plan), hidden again 6 % beyond (no flicker on the edge). A group that lies wholly inside a building
//              (every corner of its box inside the outline of a solid data item or a declared covered place, and no higher
//              than its roof) is an interior: seen from outside, only through windows, it gets the tighter interior
//              ceiling. Entries are checked in eight turns, one eighth per frame.
//   instanced  instanced meshes that their module left without frustum culling (all the plants of flora.js, the city's
//              street trees) were drawn in every pass whether in view or not, including all three shadow maps. Here they
//              get bounds over all their instances, 1.5 m wider for the leaves' sway, and are culled like everything
//              else. Nothing looks different; they are only skipped where they cannot be seen.
//   casters    which shadow boxes an object casts into (see lighting.js, which gives each box's shadow camera a layer
//              mask): everything casts into the nearest box; into the middle one only things whose own size (per
//              instance for instanced meshes) is at least MID_SIZE and not thinner than MID_THIN (the middle side
//              of its box: a roof sheet is thin but wide, a pole is not), into the outermost one FAR_SIZE and FAR_THIN.
//   mirror     the gate pool's reflection (extras/gate.js, three.js Water), which draws the scene a second time: redrawn
//              only while the pool is at least MIRROR_MIN_PX across on screen and was not hidden behind buildings the last
//              time it was drawn (an occlusion query round the water's own draw); the mirror camera is narrowed to the
//              part of the screen the pool covers (so only what can be reflected there is drawn) and its texture has
//              about one texel per pixel of that part, at most 512 (256 on the governor's lower rungs); while it is
//              drawn, the builders' detail groups farther than MIRROR_REACH from the pool are hidden (the pool shows sky,
//              the gate, trees and building faces, not furniture).
//
// CHOSEN (by reasoning about pixels and by looking at pictures, not measured on a real graphics card): every number in
// the constants below. Sizes are bounding-sphere radii in metres. The ceilings are for the desktop at full quality; the
// quality governor in main.js scales them (setScale).
import * as THREE from 'three';
import { CAMPUS } from './campus-data.js';

const CEILING = 90;             // m from a detail group's outline, beyond which it is not drawn
const INTERIOR_CEILING = 60;    // the same for a group inside a building, seen from outside it
const MID_SIZE = 0.3, FAR_SIZE = 1.2;     // radius; and the middle side of the box (a pole or a cable is long but thin):
const MID_THIN = 0.04, FAR_THIN = 0.3;    // about half a texel of the middle box (9 cm) and one of the outer one (31 cm) at 2048
const LAYER_MID = 3, LAYER_FAR = 2;
const MIRROR_MIN_PX = 28, MIRROR_REACH = 70;

function inside(pts, x, z) {
  let c = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, zi] = pts[i], [xj, zj] = pts[j];
    if ((zi > z) !== (zj > z) && x < (xj - xi) * (z - zi) / (zj - zi) + xi) c = !c;
  }
  return c;
}
const circle = (cx, cz, r) => Array.from({ length: 24 }, (_, i) => [cx + r * Math.cos(i / 24 * 2 * Math.PI), cz + r * Math.sin(i / 24 * 2 * Math.PI)]);

/** Size of one thing a mesh draws (the mesh itself, or one instance of an instanced mesh): [bounding-sphere radius,
 *  middle side of its bounding box], in metres. */
function partSize(o) {
  const g = o.geometry; if (!g) return [0, 0];
  if (!g.boundingSphere) g.computeBoundingSphere();
  if (!g.boundingBox) g.computeBoundingBox();
  // the middle one of the box's three sides: small for a pole or a cable, large for a roof sheet (thin, but wide both ways)
  const r = g.boundingSphere ? g.boundingSphere.radius : 0, bb = g.boundingBox, sides = bb ? [bb.max.x - bb.min.x, bb.max.y - bb.min.y, bb.max.z - bb.min.z].sort((a, b) => a - b) : [0, 0, 0], thin = sides[1];
  const s = new THREE.Vector3(), q = new THREE.Quaternion(), p = new THREE.Vector3(), m = new THREE.Matrix4();
  o.matrixWorld.decompose(p, q, s);
  let k = Math.max(s.x, s.y, s.z);
  if (o.isInstancedMesh && o.count > 0) {
    let sum = 0; const n = Math.min(o.count, 16);
    for (let i = 0; i < n; i++) { o.getMatrixAt(Math.floor(i * o.count / n), m); m.decompose(p, q, s); sum += Math.max(s.x, s.y, s.z); }
    k *= sum / n;
  }
  return [r * k, thin * k];
}

/**
 * root: the campus group; details: the list of world/index.js; indoors: covered places declared by builders.
 * Returns { update(camera, frame), setScale(k), setMirror(level), mainCamera(camera), info() }.
 */
export function createCulling({ root, details, indoors = [], lowPower = false, safe = false }) {
  root.updateMatrixWorld(true);
  // ---- outlines of buildings, for telling interiors (as in lighting.js: solid items taller than 3 m, then declared places)
  const halls = [];
  for (const d of indoors) halls.push({ pts: d.pts, top: d.top, bottom: d.bottom, id: null });
  for (const it of CAMPUS.items) {
    if (!it.solid || !(it.height > 3)) continue;
    const pts = it.shape === 'circle' ? circle(it.cx, it.cz, it.radius) : it.points;
    if (pts && pts.length > 2) halls.push({ pts, top: it.height + 0.5, bottom: -1, id: it.id });
  }
  for (const h of halls) { let w = Infinity, e = -Infinity, n = Infinity, s = -Infinity; for (const [x, z] of h.pts) { w = Math.min(w, x); e = Math.max(e, x); n = Math.min(n, z); s = Math.max(s, z); } Object.assign(h, { w, e, n, s, here: false }); }
  const within = (h, x, z, y) => y < h.top && !(y < h.bottom) && x >= h.w && x <= h.e && z >= h.n && z <= h.s && inside(h.pts, x, z);
  const hallOf = (x, z, y) => halls.find(h => within(h, x, z, y)) || null;

  // ---- details
  const box = new THREE.Box3(), list = [];
  for (const d of details) {
    box.makeEmpty(); box.expandByObject(d.obj);
    const e = box.isEmpty() ? { w: d.x, e: d.x, n: d.z, s: d.z, top: 0 } : { w: box.min.x, e: box.max.x, n: box.min.z, s: box.max.z, top: box.max.y };
    // interior: all four corners of the box in plan inside the same building, and not above its roof
    let hall = null;
    if (!box.isEmpty()) {
      const y = (box.min.y + box.max.y) / 2, a = hallOf(e.w + 0.05, e.n + 0.05, y);
      if (a && e.top <= a.top + 0.5 && [[e.e - 0.05, e.n + 0.05], [e.e - 0.05, e.s - 0.05], [e.w + 0.05, e.s - 0.05]].every(([x, z]) => inside(a.pts, x, z))) hall = a;
    }
    list.push({ d, ...e, hall, on: true });
  }
  let scale = lowPower ? 0.75 : 1, turn = 0, first = true, shown = 0;
  function checkDetail(q, cx, cz) {
    const k = q.on ? 1.06 : 1;
    const plan = Math.hypot(cx - q.d.x, cz - q.d.z);
    const dx = Math.max(q.w - cx, 0, cx - q.e), dz = Math.max(q.n - cz, 0, cz - q.s), edge = Math.hypot(dx, dz);
    const cap = (q.hall && !q.hall.here ? INTERIOR_CEILING : CEILING) * scale;
    const on = plan < q.d.range * scale * k && edge < cap * k;
    if (on !== q.on || first) { q.on = on; q.d.obj.visible = on; }
  }

  // ---- instanced meshes without culling: bounds over all instances, then culled
  let recull = 0;
  root.traverse(o => {
    if (!o.isInstancedMesh || o.frustumCulled || o.count === 0) return;
    const ms = Array.isArray(o.material) ? o.material : [o.material];
    if (!ms.every(m => m && (m.isMeshStandardMaterial || m.isMeshLambertMaterial || m.isMeshBasicMaterial || m.isMeshPhongMaterial))) return;
    if (/pool|fountain|clock|hand|ticker/i.test(o.name)) return;
    o.computeBoundingSphere(); o.computeBoundingBox();
    if (!o.boundingSphere || !Number.isFinite(o.boundingSphere.radius)) return;
    o.boundingSphere.radius += 1.5; o.boundingBox.expandByScalar(1.5);
    o.frustumCulled = true; recull++;
  });

  // ---- shadow casters: layers for the middle and the outer shadow box
  const casters = { all: 0, mid: 0, far: 0 };
  root.traverse(o => {
    if (!(o.isMesh || o.isLine || o.isPoints) || !o.castShadow) return;
    casters.all++;
    const [r, thin] = partSize(o);
    if (r >= MID_SIZE && thin >= MID_THIN) { o.layers.enable(LAYER_MID); casters.mid++; }
    if (r >= FAR_SIZE && thin >= FAR_THIN) { o.layers.enable(LAYER_FAR); casters.far++; }
  });

  // ---- the pool's mirror
  let water = null; root.traverse(o => { if (!water && o.name === 'pool-water' && o.material && o.material.uniforms && o.material.uniforms.mirrorSampler) water = o; });
  const mirror = { level: safe ? 0 : lowPower ? 1 : 2, drawn: 0, skipped: 0, size: 0, px: 0, target: null, camera: null };
  if (water) {
    const base = water.onBeforeRender, centre = new THREE.Vector3(), tmp = new THREE.Vector3(), proxy = new THREE.PerspectiveCamera(), buf = new THREE.Vector2();
    water.geometry.computeBoundingSphere();
    const tex = water.material.uniforms.mirrorSampler.value; mirror.target = tex && tex.renderTarget ? tex.renderTarget : null;
    const rim = [];                                      // points round the pool's rim, local to the water mesh (a flat disc)
    { const sp = water.geometry.boundingSphere; for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2; rim.push(new THREE.Vector3(sp.center.x + Math.cos(a) * sp.radius, sp.center.y + Math.sin(a) * sp.radius, sp.center.z)); } }
    let lastFrame = -1, hidden = [], gl = null, query = null, pending = false, active = false, occluded = false, queriedAt = -10;
    water.onBeforeRender = function (renderer, scene, camera, ...rest) {
      // the pass that asks first decides for the whole frame (the occlusion pass asks again: the gate's own wrapper ignores it)
      if (mirror.frame === lastFrame) return; lastFrame = mirror.frame;
      if (gl === null) { gl = renderer.getContext(); if (typeof WebGL2RenderingContext !== 'undefined' && gl instanceof WebGL2RenderingContext) query = gl.createQuery(); }
      // Was the water seen at all last time (an occlusion query around its own draw, read a frame or two later)? Behind
      // the buildings, as from the plaza, its mirror is not drawn. A result older than the last frame counts as "seen".
      if (pending && gl.getQueryParameter(query, gl.QUERY_RESULT_AVAILABLE)) { occluded = !gl.getQueryParameter(query, gl.QUERY_RESULT); pending = false; }
      const stale = mirror.frame - queriedAt > 3;
      water.getWorldPosition(centre);
      const r = water.geometry.boundingSphere.radius * water.matrixWorld.getMaxScaleOnAxis(), d = Math.max(0.5, tmp.setFromMatrixPosition(camera.matrixWorld).distanceTo(centre));
      renderer.getDrawingBufferSize(buf); const W = buf.x, H = buf.y, f = camera.isPerspectiveCamera ? H / 2 / Math.tan(camera.fov * Math.PI / 360) : H;
      mirror.px = Math.round(2 * r * f / d);
      let draw = mirror.level > 0 && mirror.px >= MIRROR_MIN_PX && !(occluded && !stale);
      // The part of the screen the pool covers: the mirror camera is narrowed to it (setViewOffset), so only what can be
      // reflected there is drawn, at about one texel per pixel. Off screen or behind the eye: the whole view as before.
      let x0 = 1, x1 = -1, y0 = 1, y1 = -1, behind = false;
      if (draw && camera.isPerspectiveCamera) {
        for (const q of rim) { tmp.copy(q).applyMatrix4(water.matrixWorld).applyMatrix4(camera.matrixWorldInverse); if (tmp.z > -camera.near) { behind = true; break; } tmp.applyMatrix4(camera.projectionMatrix); x0 = Math.min(x0, tmp.x); x1 = Math.max(x1, tmp.x); y0 = Math.min(y0, tmp.y); y1 = Math.max(y1, tmp.y); }
        if (!behind && (x1 < -1 || x0 > 1 || y1 < -1 || y0 > 1)) draw = false;
      }
      if (!draw) { mirror.skipped++; return; }
      let cam = camera, tw = 512, th = 512;
      const max = mirror.level >= 2 ? 512 : 256;
      if (camera.isPerspectiveCamera && !behind && !camera.view) {
        // a margin for the ripples' distortion of the lookup, then pixels
        const mx = (x1 - x0) * 0.08 + 0.02, my = (y1 - y0) * 0.25 + 0.03;
        x0 = Math.max(-1, x0 - mx); x1 = Math.min(1, x1 + mx); y0 = Math.max(-1, y0 - my); y1 = Math.min(1, y1 + my);
        const px0 = (x0 + 1) / 2 * W, pw = Math.max(8, (x1 - x0) / 2 * W), py0 = (1 - y1) / 2 * H, ph = Math.max(8, (y1 - y0) / 2 * H);
        proxy.copy(camera); proxy.setViewOffset(W, H, px0, py0, pw, ph);
        cam = proxy;
        const k = Math.min(1, max / pw, max / ph);
        tw = Math.max(32, Math.ceil(pw * k / 32) * 32); th = Math.max(32, Math.ceil(ph * k / 32) * 32);
      } else { const want = Math.max(128, Math.min(max, 2 ** Math.ceil(Math.log2(mirror.px)))); tw = th = want; }
      if (mirror.target && (mirror.target.width !== tw || mirror.target.height !== th)) mirror.target.setSize(tw, th);
      mirror.size = tw + 'x' + th;
      hidden = [];
      for (const q of list) if (q.on && Math.hypot(q.d.x - centre.x, q.d.z - centre.z) - Math.hypot(q.e - q.w, q.s - q.n) / 2 > MIRROR_REACH) { q.d.obj.visible = false; hidden.push(q); }
      try { base.call(this, renderer, scene, cam, ...rest); mirror.drawn++; }
      finally { for (const q of hidden) q.d.obj.visible = true; }
      if (query && !pending) { gl.beginQuery(gl.ANY_SAMPLES_PASSED_CONSERVATIVE, query); active = true; queriedAt = mirror.frame; }
    };
    // The query spans exactly the water's own draw, which three.js makes between onBeforeRender and onAfterRender. Opaque
    // things are drawn sorted by material before distance, so the water is put after the other opaque things (render
    // order 10): whatever hides it is then already in the depth buffer when it is counted.
    water.renderOrder = Math.max(water.renderOrder, 10);
    const after = water.onAfterRender;
    water.onAfterRender = function (...args) { if (active) { gl.endQuery(gl.ANY_SAMPLES_PASSED_CONSERVATIVE); active = false; pending = true; } if (after) after.apply(this, args); };
  }

  return {
    /** Once per frame, before rendering. */
    update(camera, frame) {
      mirror.frame = frame;
      const cx = camera.position.x, cz = camera.position.z, cy = camera.position.y;
      if (first || frame % 4 === 0) for (const h of halls) h.here = within(h, cx, cz, cy);
      if (first) { for (const q of list) checkDetail(q, cx, cz); first = false; }
      else if (list.length) { const n = Math.ceil(list.length / 8); for (let i = 0; i < n; i++) { checkDetail(list[turn], cx, cz); turn = (turn + 1) % list.length; } }
      if (frame % 30 === 0) { shown = 0; for (const q of list) if (q.on) shown++; }
    },
    /** Every detail ceiling and range times k (the quality governor; 1 is full quality). */
    setScale(k) { if (k !== scale) { scale = k; first = true; } },
    getScale: () => scale,
    /** 0: no mirror redraws, 1: up to 256 texels, 2: up to 512. */
    setMirror(level) { mirror.level = safe ? 0 : level; },
    getMirror: () => mirror.level,
    LAYER_MID, LAYER_FAR,
    info: () => ({ details: list.length, interiors: list.filter(q => q.hall).length, shown, scale, recull, casters, mirror: { level: mirror.level, drawn: mirror.drawn, skipped: mirror.skipped, size: mirror.size, px: mirror.px, found: !!water } }),
  };
}
