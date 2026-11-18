// Smaller blocks of the teaching zone and the two link blocks of the south-east slabs (style "plain"), exteriors only.
// This file also exports the small facade kit (materials, face(), win(), grid(), body(), dogleg()...) that
// stair-tower.js, stair-core.js and sign-wing.js import, so that the four builders share one look.
//
// SEEN in the 2018 footage:
//   slab-north-ne-wing (frames 3 and 4, from the north-east; the L-shaped satellite outline fits what they show):
//     - south part: white walls, grey roof, cream parapet; a dark ribbon window on its east face (top storey, a second one
//       below), a small window and an air-conditioner unit on its short north return;
//     - north part, east face: set back, dark ribbon glazing above a dark-red balcony front, an outdoor unit below;
//     - a dark-red vertical stair element with one small window at the north-east corner, a little taller than the roofs;
//     - north face: cream wall with two small green windows under a parapet that rises as a wedge beside the red element.
//   block-north-of-canopy-east-end (frames 6 and 7, from the east): a plain white box about as tall as the slabs; the east
//     face is blank except for ONE column of small square windows and a red item at its foot; the top of the south face
//     is plain white. Satellite image: dark roof with three small white boxes (positions converted from the image).
//   Satellite image only: beige roofs with white parapets on the two "se" blocks, pale roofs on the links.
//
// ASSUMED (not visible in any reference; kept plain, no lettering anywhere):
//   - slab-north-se-block, slab-south-se-block: everything except outline and roof. They continue the neighbouring slabs'
//     pattern (white grid, dark-red spandrels, window strips), three storeys of 3.6 m, a door each;
//   - slab-north-ne-wing: storey heights (3 x 3.6 m), the ground level (hidden by trees), the west and south faces, the
//     roofs of the two parts being 0.6 m apart in height, all sizes of windows; the wedge is drawn 1.1 m high;
//   - block-north-of-canopy-east-end: the lower part of the south face and the whole north and west faces (same small
//     square windows), the door and its canopy, the height of the roof boxes; the red item is drawn as a hose cabinet;
//   - teaching-slab-west-link-e: all of it beyond the outline (white, one window per bay and storey, a door);
//   - dorm-a-east-link, dorm-b-east-link: all of it beyond the outline (white, short slot windows like the end walls of the
//     neighbouring slabs, a top band at the height of their fascia, a door on the courtyard side);
//   - downpipes, wall lights, sills, outdoor units other than the two seen, door furniture, parapet copings.
// None of these blocks can be entered: each has solid colliders (body up to the roof plane plus the parapets).
import { THREE, bbox, itemPolygon } from '../../kit.js';
import { Batch } from '../../batch.js';

const ALL = 'EWUDSN', skipCache = {};
const skipOf = faces => skipCache[faces] ?? (skipCache[faces] = [...ALL].filter(f => !faces.includes(f)).join(''));
/** Box by low corner and size, world coordinates, drawing only the listed faces (E W U D S N = +x -x +y -y +z -z). */
export const F = (b, m, x, y, z, sx, sy, sz, faces = ALL) => b.slab(m, x, y, z, sx, sy, sz, skipOf(faces));

const local = {};
/** Materials of the four "ends" builders. Untextured opaque ones are merged into one vertex-coloured mesh by finish(). */
export function lm(name) {
  if (local[name]) return local[name];
  const S = (color, roughness = 0.85, metalness = 0, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness, metalness, ...extra });
  const make = {
    white: () => S(0xf2f0e9), cope: () => S(0xdedbd2), cream: () => S(0xe6d9b4), maroon: () => S(0x86302c), dark: () => S(0x24272a, 0.7),
    base: () => S(0x5d6164), shade: () => S(0x8d8f8c, 0.9), roof: () => S(0x6c6e70, 0.95), roofBeige: () => S(0x9a9282, 0.95), roofPale: () => S(0xd3d0c7, 0.9),
    plaster: () => S(0xe4e1d7, 0.92), concrete: () => S(0xb1aea5, 0.92), tread: () => S(0x9d9a92, 0.8), rail: () => S(0x47525c, 0.5, 0.2),
    red: () => S(0xb8322a, 0.6), alu: () => S(0xc4c8cc, 0.45, 0.35), pvc: () => S(0xe1dfd7, 0.7), door: () => S(0x6d7478, 0.6), frame: () => S(0xf4f4f2, 0.5),
    lamp: () => S(0xffffff, 0.6, 0, { emissive: 0xfff4d8, emissiveIntensity: 0.9 }),
    glassWin: () => S(0x27363d, 0.1, 0.35), glassGreen: () => S(0x3f7f6d, 0.1, 0.35), glassPale: () => S(0x9fbfb0, 0.18, 0.2),
    glassCore: () => S(0x6fb39c, 0.08, 0.3, { transparent: true, opacity: 0.5, depthWrite: false }),
  };
  const m = make[name](); m.name = 'ends-' + name;      // glass* names glow at night (lighting.js goes by name)
  return (local[name] = m);
}

// All plain-coloured, untextured, opaque parts of a group become ONE mesh with vertex colours (same idea as teaching-slab.js).
let flatMat = null;
export function mergeFlat(group, castShadow) {
  const take = group.children.filter(m => { const t = m.material; return m.isMesh && !t.map && !t.transparent && !/glass/i.test(t.name) && t.emissiveIntensity * (t.emissive.r + t.emissive.g + t.emissive.b) < 0.3; });
  if (take.length < 2) return group;
  let nv = 0, ni = 0; for (const m of take) { nv += m.geometry.attributes.position.count; ni += m.geometry.index.count; }
  const pos = new Float32Array(nv * 3), nor = new Float32Array(nv * 3), col = new Float32Array(nv * 3), idx = new Uint32Array(ni);
  let v0 = 0, i0 = 0;
  for (const m of take) {
    const g = m.geometry, n = g.attributes.position.count, c = m.material.color, ix = g.index.array;
    pos.set(g.attributes.position.array, v0 * 3); nor.set(g.attributes.normal.array, v0 * 3);
    for (let i = 0; i < n; i++) { col[(v0 + i) * 3] = c.r; col[(v0 + i) * 3 + 1] = c.g; col[(v0 + i) * 3 + 2] = c.b; }
    for (let i = 0; i < ix.length; i++) idx[i0 + i] = ix[i] + v0;
    v0 += n; i0 += ix.length; group.remove(m); g.dispose();
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.BufferAttribute(nor, 3)); g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  g.setIndex(new THREE.BufferAttribute(idx, 1));
  if (!flatMat) { flatMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.8, metalness: 0.03 }); flatMat.name = 'ends-flat'; }
  const mesh = new THREE.Mesh(g, flatMat); mesh.castShadow = castShadow; mesh.receiveShadow = true; group.add(mesh);
  return group;
}

/** Three batches per item: v = always drawn, d = small things shown only near the viewer, c = invisible colliders. */
export function shell(ctx) { return { v: new Batch(), d: new Batch(), c: new Batch(), low: !!ctx.lowPower }; }
export function finish(S, item, ctx, x, z, range) {
  ctx.add(mergeFlat(S.v.build({ name: item.id }), true));
  const dg = mergeFlat(S.d.build({ name: item.id + '-detail', castShadow: false }), false);
  if (dg.children.length) ctx.detail(ctx.add(dg), x, z, range);
  const cg = ctx.add(S.c.build({ name: item.id + '-colliders' })); cg.visible = false;
  cg.traverse(o => { if (o.isMesh) ctx.collide(o); });
}
export const hit = (S, x, y, z, sx, sy, sz) => S.c.slab('generic', x, y, z, sx, sy, sz);

/**
 * Drawing on one facade. side: 'N' 'S' 'E' 'W' (the way the facade looks); p: its plane (z for N/S, x for E/W).
 * Returns put(batch, material, u0, u1, y0, y1, d0, d1, faces): a box from u0 to u1 along the facade (x for N/S, z for E/W),
 * between depths d0 and d1 measured outward from the plane. faces: F front, B back, L low-u end, R high-u end, U, D.
 */
export function face(side, p) {
  const out = side === 'N' || side === 'W' ? -1 : 1, alongX = side === 'N' || side === 'S';
  const map = alongX ? { F: out > 0 ? 'S' : 'N', B: out > 0 ? 'N' : 'S', L: 'W', R: 'E', U: 'U', D: 'D' } : { F: out > 0 ? 'E' : 'W', B: out > 0 ? 'W' : 'E', L: 'N', R: 'S', U: 'U', D: 'D' };
  const cache = {};
  return (b, m, u0, u1, y0, y1, d0 = 0, d1 = 0.05, faces = 'FLRUD') => {
    const lo = out > 0 ? p + d0 : p - d1, wf = cache[faces] ?? (cache[faces] = [...faces].map(f => map[f]).join(''));
    return alongX ? F(b, m, u0, y0, lo, u1 - u0, y1 - y0, d1 - d0, wf) : F(b, m, lo, y0, u0, d1 - d0, y1 - y0, u1 - u0, wf);
  };
}

/** Window: glass, a white frame, n mullions, an optional transom at height `transom`; the sill is near-view detail. */
export function win(S, put, u0, u1, y0, y1, { n = 1, transom = 0, glass = lm('glassWin'), sill = true } = {}) {
  const FR = lm('frame'), t = 0.06;
  put(S.v, glass, u0, u1, y0, y1, 0, 0.03, 'F');
  put(S.v, FR, u0, u1, y1 - t, y1, 0.03, 0.07, 'FD'); put(S.v, FR, u0, u1, y0, y0 + t, 0.03, 0.07, 'FU');
  put(S.v, FR, u0, u0 + t, y0 + t, y1 - t, 0.03, 0.07, 'FR'); put(S.v, FR, u1 - t, u1, y0 + t, y1 - t, 0.03, 0.07, 'FL');
  for (let i = 1; i <= n; i++) { const u = u0 + (u1 - u0) * i / (n + 1); put(S.v, FR, u - 0.025, u + 0.025, y0 + t, y1 - t, 0.03, 0.06, 'F'); }
  if (transom) put(S.v, FR, u0 + t, u1 - t, transom - 0.025, transom + 0.025, 0.03, 0.06, 'F');
  if (sill) put(S.d, lm('cope'), u0 - 0.06, u1 + 0.06, y0 - 0.07, y0, 0, 0.11, 'FLRUD');
}

/** `cols` equal windows per storey spread over u0..u1 (plain wall with punched openings). */
export function punched(S, put, u0, u1, floors, FH, { cols = 2, w = 1.2, h = 1.4, sill = 1.0, n = 1, from = 0, y0 = 0, glass } = {}) {
  for (let k = from; k < floors; k++) for (let i = 0; i < cols; i++) {
    const u = u0 + (u1 - u0) * (i + 0.5) / cols;
    win(S, put, u - w / 2, u + w / 2, y0 + k * FH + sill, y0 + k * FH + sill + h, { n, glass });
  }
}

/**
 * The teaching slabs' pattern on one facade: white piers and floor bands standing proud of a recessed infill
 * (spandrel, then a window strip with a transom and mullions) in every bay and storey.
 */
export function grid(S, put, u0, u1, floors, FH, { y0 = 0, bay = 3.8, spandrel = lm('maroon'), head = 3.2, sillH = 0.95, proud = 0.12, transomAt = 2.55 } = {}) {
  const W = 'wallWhite', nb = Math.max(1, Math.round((u1 - u0) / bay)), bw = (u1 - u0) / nb, G = lm('glassWin'), FR = lm('frame');
  for (let i = 0; i <= nb; i++) { const u = u0 + i * bw, hw = i === 0 || i === nb ? 0.3 : 0.22; put(S.v, W, Math.max(u0, u - hw), Math.min(u1, u + hw), y0, y0 + floors * FH, 0, proud, 'FLR'); }
  for (let k = 0; k < floors; k++) {
    const y = y0 + k * FH, hd = Math.min(head, FH - 0.4);
    put(S.v, W, u0, u1, y + hd, y + FH, 0, proud - 0.03, 'FUD');                                     // floor band
    put(S.v, k === 0 ? lm('base') : spandrel, u0, u1, y, y + sillH, 0, 0.04, 'FU');                  // spandrel (dark at ground level)
    put(S.v, G, u0, u1, y + sillH, y + hd, 0, 0.03, 'F');
    for (let i = 0; i < nb; i++) {
      const a = u0 + i * bw + 0.22, b = a + bw - 0.44, n = Math.max(1, Math.round((b - a) / 0.75) - 1);
      put(S.v, FR, a, b, y + transomAt - 0.03, y + transomAt + 0.03, 0.03, 0.07, 'F');
      for (let j = 1; j <= n; j++) { const u = a + (b - a) * j / (n + 1); put(S.v, FR, u - 0.025, u + 0.025, y + sillH, y + hd, 0.03, 0.07, 'F'); }
    }
  }
}

/**
 * Walls, roof, parapet with coping and colliders of one rectangular part. r = { w, e, n, s }; H = top of the parapet.
 * faces: which outer walls to draw; wall: their material.
 */
export function body(S, r, H, { wall = 'wallWhite', roof = lm('roof'), par = 0.9, parMat = wall, y0 = 0, faces = 'NSEW', cope = true, collide = true } = {}) {
  const sx = r.e - r.w, sz = r.s - r.n, yr = H - par, t = 0.2, tf = cope ? '' : 'U';
  if (faces) F(S.v, wall, r.w, y0, r.n, sx, H - y0, sz, faces);
  F(S.v, roof, r.w + t, yr - 0.1, r.n + t, sx - 2 * t, 0.1, sz - 2 * t, 'U');
  F(S.v, parMat, r.w, yr, r.n, sx, par, t, 'S' + tf); F(S.v, parMat, r.w, yr, r.s - t, sx, par, t, 'N' + tf);
  F(S.v, parMat, r.w, yr, r.n + t, t, par, sz - 2 * t, 'E' + tf); F(S.v, parMat, r.e - t, yr, r.n + t, t, par, sz - 2 * t, 'W' + tf);
  if (cope) {
    const C = lm('cope'), o = 0.05, h = 0.07;
    F(S.v, C, r.w - o, H, r.n - o, sx + 2 * o, h, t + 2 * o, 'NSEWU'); F(S.v, C, r.w - o, H, r.s - t - o, sx + 2 * o, h, t + 2 * o, 'NSEWU');
    F(S.v, C, r.w - o, H, r.n + t + o, t + 2 * o, h, sz - 2 * t - 2 * o, 'EWU'); F(S.v, C, r.e - t - o, H, r.n + t + o, t + 2 * o, h, sz - 2 * t - 2 * o, 'EWU');
  }
  if (collide) {
    hit(S, r.w, y0, r.n, sx, yr - y0, sz);
    hit(S, r.w, yr, r.n, sx, par, t); hit(S, r.w, yr, r.s - t, sx, par, t); hit(S, r.w, yr, r.n + t, t, par, sz - 2 * t); hit(S, r.e - t, yr, r.n + t, t, par, sz - 2 * t);
  }
  return yr;
}

// ---- small fittings (near-view detail unless noted) ----
export const pipe = (S, put, u, y1, y0 = 0.1) => {                                  // square rainwater pipe with a shoe
  put(S.d, lm('pvc'), u - 0.055, u + 0.055, y0, y1, 0.03, 0.14, 'FLR'); put(S.d, lm('pvc'), u - 0.09, u + 0.09, y1 - 0.25, y1, 0.02, 0.18, 'FLRUD');
};
export const lamp = (S, put, u, y) => { put(S.d, lm('alu'), u - 0.05, u + 0.05, y, y + 0.14, 0, 0.1, 'FLRU'); put(S.d, lm('lamp'), u - 0.13, u + 0.13, y - 0.07, y + 0.01, 0.02, 0.2, 'FLRD'); };
export const ac = (S, put, u, y) => {                                               // outdoor unit on two brackets
  put(S.d, lm('white'), u - 0.4, u + 0.4, y, y + 0.55, 0.06, 0.38, 'FLRUD'); put(S.d, lm('dark'), u - 0.3, u + 0.12, y + 0.07, y + 0.48, 0.38, 0.386, 'F');
  for (const s of [-0.3, 0.27]) put(S.d, lm('alu'), u + s, u + s + 0.03, y - 0.04, y, 0, 0.4, 'FLRD');
};
/** Double door with a frame and a flat canopy (drawn always); split line, handles, step and a light in the detail batch. */
export function door(S, put, uc, { w = 1.5, h = 2.2, canopy = 1.0 } = {}) {
  const FR = lm('frame');
  put(S.v, lm('door'), uc - w / 2, uc + w / 2, 0, h, 0.03, 0.07, 'F');
  put(S.v, FR, uc - w / 2 - 0.08, uc + w / 2 + 0.08, h, h + 0.1, 0.03, 0.1, 'FLRUD');
  put(S.v, FR, uc - w / 2 - 0.08, uc - w / 2, 0, h, 0.03, 0.1, 'FLR'); put(S.v, FR, uc + w / 2, uc + w / 2 + 0.08, 0, h, 0.03, 0.1, 'FLR');
  if (canopy) put(S.v, lm('cope'), uc - w / 2 - 0.5, uc + w / 2 + 0.5, h + 0.35, h + 0.5, 0, canopy, 'FLRUD');
  put(S.d, lm('dark'), uc - 0.012, uc + 0.012, 0, h, 0.07, 0.074, 'F');
  for (const s of [-0.16, 0.12]) put(S.d, lm('alu'), uc + s, uc + s + 0.04, 0.95, 1.25, 0.07, 0.12, 'FLRUD');
  for (const s of [-1, 1]) put(S.d, lm('glassWin'), uc + s * w / 4 - 0.14, uc + s * w / 4 + 0.14, 1.25, 1.85, 0.07, 0.075, 'F');   // vision panels
  put(S.d, lm('concrete'), uc - w / 2 - 0.3, uc + w / 2 + 0.3, 0, 0.1, 0, 0.8, 'FLRU');
  lamp(S, put, uc, h + 0.22);
}

/** Inclined slab whose top runs from a to c ([x, y, z] on its centre line), w wide, th thick. Leaves the batch in the world frame. */
export function ramp(b, m, a, c, w, th = 0.16, faces = ALL) {
  const A = new THREE.Vector3(...a), C = new THREE.Vector3(...c), d = new THREE.Vector3().subVectors(C, A), len = d.length();
  const X = d.clone().normalize(), Z = new THREE.Vector3(-d.z, 0, d.x).normalize(), Y = new THREE.Vector3().crossVectors(Z, X);
  b.setMatrix(new THREE.Matrix4().makeBasis(X, Y, Z).setPosition(A.add(C).multiplyScalar(0.5).addScaledVector(Y, -th / 2)));
  b.box(m, 0, 0, 0, len, th, w, skipOf(faces)); b.frame();
}

/**
 * Dog-leg stair seen through glass, visual only (no collision). Flights run along z between a floor landing (zA0..zA1)
 * and a half landing (zB0..zB1); flight 1 uses x0..xm-g, flight 2 xm+g..x1. Soffit slabs and landings are always drawn;
 * treads, risers and handrails go to the detail batch.
 */
export function dogleg(S, { x0, x1, zA0, zA1, zB0, zB1, floors, FH, y0 = 0, steps = 13, gap = 0.1, landingsA = true }) {
  const xm = (x0 + x1) / 2, CO = lm('concrete'), TR = lm('tread'), RA = lm('rail');
  const za = Math.abs(zA0 - zB0) < Math.abs(zA1 - zB0) ? zA0 : zA1, zb = Math.abs(zB0 - za) < Math.abs(zB1 - za) ? zB0 : zB1;   // facing edges
  const dir = Math.sign(zb - za), go = Math.abs(zb - za) / steps, rise = FH / 2 / steps;
  const land = (z0, z1, y, xa = x0, xb = x1) => F(S.v, CO, xa, y - 0.15, Math.min(z0, z1), xb - xa, 0.15, Math.abs(z1 - z0), 'UDNS');
  for (let k = 0; k < floors; k++) {
    const y = y0 + k * FH, ym = y + FH / 2;
    if (k > 0 && landingsA) land(zA0, zA1, y);
    land(zB0, zB1, ym);
    const runs = [[x0, xm - gap, za, y, zb, ym, 1], [xm + gap, x1, zb, ym, za, y + FH, -1]];      // [xa, xb, z from, y from, z to, y to, direction]
    for (const [xa, xb, zf, yf, zt, yt, s] of runs) {
      ramp(S.v, CO, [(xa + xb) / 2, yf - 0.02, zf], [(xa + xb) / 2, yt - 0.02, zt], xb - xa, 0.14, 'UDEW');
      const d = dir * s, rf = d > 0 ? 'N' : 'S';
      if (!S.low) for (let i = 0; i < steps; i++) F(S.d, TR, xa, yf + i * rise, Math.min(zf + d * i * go, zf + d * (i + 1) * go), xb - xa, rise, go, 'U' + rf);
      const xr = xa === x0 ? xb - 0.04 : xa + 0.04;                                               // handrail on the well side
      S.d.strut(RA, [xr, yf + 0.95, zf], [xr, yt + 0.95, zt], 0.05); S.d.frame();
      for (const [zz, yy] of [[zf, yf], [(zf + zt) / 2, (yf + yt) / 2], [zt, yt]]) F(S.d, RA, xr - 0.02, yy, zz - 0.02, 0.04, 0.95, 0.04, 'NSEW');
    }
  }
  if (landingsA) land(zA0, zA1, y0 + floors * FH);
}

// ================= the individual blocks =================
const rectOf = b => ({ w: b.w, e: b.e, n: b.n, s: b.s });
const planes = r => ({ N: face('N', r.n), S: face('S', r.s), E: face('E', r.e), W: face('W', r.w) });
const span = (r, side) => (side === 'N' || side === 'S' ? [r.w, r.e] : [r.n, r.s]);
const other = (ctx, id) => { const it = ctx.campus && ctx.campus.items.find(i => i.id === id); return it ? bbox(itemPolygon(it)) : null; };

// Three-storey blocks beside the east ends of the slabs: the slabs' own pattern, all ASSUMED.
function seBlock(S, item, b, H, ctx) {
  const r = rectOf(b), FH = (H - 0.9) / 3, P = planes(r), north = item.id === 'slab-north-se-block';
  const wing = north ? other(ctx, 'sign-wing-between-slabs') : null;       // the north one stands partly inside the taller sign wing
  body(S, r, H, { roof: lm('roofBeige') });
  for (const side of north ? 'NES' : 'NESW') {
    let [u0, u1] = span(r, side);
    if (wing && side === 'S' && wing.e > u0 && wing.e < u1) u0 = wing.e;
    grid(S, P[side], u0, u1, 3, FH, { bay: 3.4, head: 3.0 });
  }
  const dSide = north ? 'E' : 'N', [a, c] = span(r, dSide);
  door(S, P[dSide], (a + c) / 2, { w: 1.4 });
  pipe(S, P.E, r.n + 0.45, H - 0.9); pipe(S, P.E, r.s - 0.45, H - 0.9);
  if (!north) { pipe(S, P.W, r.n + 0.45, H - 0.9); ac(S, P.S, r.w + 1.4, FH + 0.3); ac(S, P.S, r.e - 1.4, 2 * FH + 0.3); }
}

// Low L-shaped building north of the north slab's east end, after frames 3 and 4.
function neWing(S, item, b, H, ctx) {
  const p = item.points;
  if (!p || p.length !== 8) return generic(S, item, b, H, ctx);
  const xw = b.w, xe = b.e, xm = p[1][0], xc = p[5][0], zn = (p[0][1] + p[1][1]) / 2, zm = p[2][1], zs = b.s, zc = p[6][1];
  const FH = (H - 0.9) / 3, HA = H - 0.6, CR = lm('cream'), MR = lm('maroon'), G = lm('glassWin'), GG = lm('glassGreen');
  const A = { w: xw, e: xm, n: zn, s: zm }, B = { w: xc, e: xe, n: zm, s: zs }, C = { w: xw, e: xc, n: zm, s: zc };
  body(S, B, H, { parMat: CR, faces: 'NSEW' });                                    // white south part
  body(S, A, HA, { parMat: CR, faces: 'EW' }); F(S.v, CR, A.w, 0, A.n, A.e - A.w, HA, 0.02, 'N');   // north part: cream north face
  body(S, C, HA, { parMat: CR, faces: 'SW' });
  // -- south part, east face: ribbon windows (top one seen, the others continue it) and a door
  const BE = face('E', xe);
  for (let k = 0; k < 3; k++) win(S, BE, zm + 1.0, k ? zs - 1.4 : zs - 3.4, k * FH + 1.0, k * FH + 2.6, { n: k ? 5 : 3, transom: k * FH + 2.15 });
  door(S, BE, zs - 1.9, { w: 1.3 }); pipe(S, BE, zs - 0.4, H - 0.9);
  // -- its north return: one small window per upper storey, an outdoor unit
  const BN = face('N', zm);
  for (let k = 1; k < 3; k++) win(S, BN, xm + 1.1, xm + 2.1, k * FH + 1.1, k * FH + 2.4, { n: 0 });
  ac(S, BN, xm + 3.0, FH + 0.9);
  // -- north part, east face: dark ribbon glazing over a dark-red balcony front
  const AE = face('E', xm), ua = zn + 2.6, ub = zm - 0.5;
  win(S, AE, ua + 0.4, ub, 2 * FH + 0.9, 2 * FH + 2.9, { n: 4, transom: 2 * FH + 2.4, sill: false });
  win(S, AE, ua + 0.4, ub, FH + 0.15, FH + 2.7, { n: 3, sill: false });
  AE(S.v, lm('concrete'), ua + 0.2, ub + 0.2, FH - 0.15, FH, 0, 0.75, 'FLRUD'); AE(S.v, MR, ua + 0.2, ub + 0.2, FH, FH + 1.0, 0.65, 0.75, 'FBLRU');   // balcony slab and front
  hit(S, xm, FH - 0.15, ua + 0.2, 0.75, 1.15, ub - ua);
  win(S, AE, ua + 0.4, ub - 1.8, 0.9, 2.7, { n: 2, sill: false }); door(S, AE, ub - 0.85, { w: 1.0, canopy: 0 });
  ac(S, AE, ub - 0.85, 2.75);
  // -- dark-red stair element at the north-east corner, a little taller, one small window near the top
  const T = { w: xm - 1.9, e: xm + 0.5, n: zn - 0.3, s: zn + 2.6 }, HT = HA + 0.9;
  F(S.v, MR, T.w, 0, T.n, T.e - T.w, HT, T.s - T.n, 'NSEW'); F(S.v, lm('roof'), T.w - 0.1, HT, T.n - 0.1, T.e - T.w + 0.2, 0.12, T.s - T.n + 0.2, 'NSEWU');
  hit(S, T.w, 0, T.n, T.e - T.w, HT + 0.12, T.s - T.n);
  win(S, face('E', T.e), T.n + 0.9, T.n + 2.0, 2 * FH + 1.2, 2 * FH + 2.6, { n: 0, glass: GG });
  win(S, face('N', T.n), T.w + 0.7, T.w + 1.3, FH + 1.9, FH + 3.3, { n: 0, glass: GG, sill: false });
  // -- north face: two small green windows; the parapet rises as a wedge beside the red element
  const AN = face('N', A.n), uE = T.w;
  win(S, AN, uE - 2.6, uE - 1.3, 2 * FH + 1.2, 2 * FH + 2.5, { n: 1, glass: GG }); win(S, AN, uE - 6.1, uE - 4.6, 2 * FH + 1.2, 2 * FH + 2.5, { n: 1, glass: GG });
  const wx0 = uE - 3.4, y0 = HA, yl = HA + 0.25, yh = HA + 1.1, z0 = A.n, z1 = A.n + 0.2;
  S.v.quad(CR, [uE, y0, z0], [wx0, y0, z0], [wx0, yh, z0], [uE, yl, z0]); S.v.quad(CR, [wx0, y0, z1], [uE, y0, z1], [uE, yl, z1], [wx0, yh, z1]);
  S.v.quad(lm('cope'), [uE, yl, z0], [wx0, yh, z0], [wx0, yh, z1], [uE, yl, z1]); S.v.quad(CR, [wx0, y0, z0], [wx0, y0, z1], [wx0, yh, z1], [wx0, yh, z0]);
  pipe(S, AN, xw + 0.4, HA - 0.9);
  // -- faces not seen: a few plain windows and a back door
  punched(S, face('W', xw), zn + 0.8, zc - 0.6, 3, FH, { cols: 3, w: 1.3 });
  punched(S, face('S', zc), xw + 0.5, xc - 0.3, 3, FH, { cols: 1, w: 1.4 });
  const BW = face('W', xc); punched(S, BW, zc + 0.6, zs - 0.4, 3, FH, { cols: 1, w: 1.4, from: 1 }); door(S, BW, (zc + zs) / 2 + 0.3, { w: 1.2 });
  punched(S, face('S', zs), xc + 0.8, xe - 0.8, 3, FH, { cols: 2, w: 1.0, h: 1.0, sill: 1.4 });
}

// Tall white box west of the north slab, after frames 6 and 7.
function canopyBlock(S, item, b, H, ctx) {
  const r = rectOf(b), FH = 3.9, par = Math.max(0.6, H - 5 * FH), yr = body(S, r, H, { par }), P = planes(r), sz = r.s - r.n;
  for (const side of 'NSEW') { const [a, c] = span(r, side); P[side](S.v, lm('base'), a, c, 0, 0.45, 0, 0.03, 'FU'); }      // dark plinth
  const zc = r.s - 0.65 * sz;                                                    // the one window column of the east face
  for (let k = 0; k < 5; k++) win(S, P.E, zc - 0.55, zc + 0.55, k * FH + 2.05, k * FH + 3.15, { n: 1, transom: 0 });
  P.E(S.v, lm('red'), zc - 0.4, zc + 0.4, 0.5, 1.5, 0, 0.22, 'FLRU');             // red item at the foot (drawn as a hose cabinet)
  punched(S, P.S, r.w + 1.5, r.e - 1.5, 4, FH, { cols: 3, w: 1.1, h: 1.1, sill: 2.05 });   // top storey of the south face is plain (seen)
  punched(S, P.N, r.w + 1.5, r.e - 1.5, 5, FH, { cols: 3, w: 1.1, h: 1.1, sill: 2.05 });
  punched(S, P.W, r.n + 2, r.s - 2, 5, FH, { cols: 2, w: 1.1, h: 1.1, sill: 2.05 });
  door(S, P.S, r.w + (r.e - r.w) * 0.5, { w: 1.6, canopy: 1.3 });
  for (const side of 'NS') { pipe(S, P[side], r.w + 0.4, yr); pipe(S, P[side], r.e - 0.4, yr); }
  lamp(S, P.E, zc + 1.6, 2.6);
  // roof: three small white boxes where the satellite image shows them, on dark pads, with a duct between two of them
  const WH = lm('white'), cl = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  for (const [x, z] of [[192.2, -120.5], [197.7, -120.5], [198.5, -112.2]]) {
    const cx = cl(x, r.w + 1.4, r.e - 1.4), cz = cl(z, r.n + 1.4, r.s - 1.4);
    F(S.v, WH, cx - 0.8, yr + 0.1, cz - 0.8, 1.6, 1.0, 1.6, 'NSEWU'); F(S.v, lm('dark'), cx - 0.9, yr, cz - 0.9, 1.8, 0.1, 1.8, 'NSEW');
  }
  F(S.d, lm('roofPale'), r.w + 3.2, yr + 0.05, r.n + 2.3, 4.6, 0.3, 0.4, 'NSEWU'); F(S.d, lm('dark'), r.w + 1, yr, r.n + sz * 0.6, r.e - r.w - 2, 0.06, 0.07, 'NSU');
}

// Narrow block at the east end of the west slab: all ASSUMED beyond its outline.
function westLink(S, item, b, H, ctx) {
  const r = rectOf(b), FH = 3.6, floors = 5, yr = body(S, r, H, { par: 0.9, roof: lm('roofPale') }), P = planes(r), nb = Math.max(2, Math.round((r.s - r.n) / 4));
  for (const side of 'NSE') { const [a, c] = span(r, side); P[side](S.v, lm('base'), a, c, 0, 0.45, 0, 0.03, 'FU'); }
  for (let k = 1; k <= floors; k++) P.E(S.v, lm('cope'), r.n, r.s, k * FH - 0.12, k * FH + 0.12, 0, 0.05, 'FUD');          // thin floor lines
  punched(S, P.E, r.n + 0.3, r.s - 0.3, floors, FH, { cols: nb, w: 2.2, h: 1.5, sill: 1.0, n: 2, from: 1 });
  const mid = Math.floor(nb / 2), uOf = i => r.n + 0.3 + (r.s - r.n - 0.6) * (i + 0.5) / nb;
  for (let i = 0; i < nb; i++) if (i !== mid) win(S, P.E, uOf(i) - 1.1, uOf(i) + 1.1, 1.0, 2.5, { n: 2 });
  punched(S, P.N, r.w, r.e, floors, FH, { cols: 1, w: 1.2 }); punched(S, P.S, r.w, r.e, floors, FH, { cols: 1, w: 1.2 });
  door(S, P.E, uOf(mid), { w: 1.5, canopy: 1.1 });                               // the middle bay has a door instead of a window
  pipe(S, P.E, r.n + 0.2, yr); pipe(S, P.E, r.s - 0.2, yr); lamp(S, P.S, (r.w + r.e) / 2, 2.9);
}

// Link block between the east ends of two long slabs: all ASSUMED beyond its outline.
function dormLink(S, item, b, H, ctx) {
  const r = rectOf(b), FH = 3.0, floors = 6, yr = body(S, r, H, { par: 1.0, roof: lm('roofPale') }), P = planes(r), top = floors * FH;
  for (const side of 'EW') {
    const [a, c] = span(r, side), put = P[side];
    put(S.v, lm('base'), a, c, 0, 0.45, 0, 0.03, 'FU');
    put(S.v, 'wallWhite', a, c, top, H, 0, 0.1, 'FD');                           // top band at the height of the slabs' fascia
    punched(S, put, a + 0.6, c - 0.6, floors, FH, { cols: 2, w: 1.5, h: 0.6, sill: 1.5, n: 1, from: side === 'W' ? 1 : 0 });
    pipe(S, put, a + 0.3, yr);
  }
  const [a, c] = span(r, 'W'); door(S, P.W, (a + c) / 2, { w: 1.4 }); punched(S, P.W, a + 0.6, c - 0.6, 1, FH, { cols: 2, w: 0.7, h: 0.6, sill: 1.5, n: 0 });
  F(S.v, lm('white'), b.cx - 1.0, yr, b.cz - 0.9, 2.0, 0.9, 1.8, 'NSEWU');       // one roof unit
}

// Any other item of this style: a white block with punched windows.
function generic(S, item, b, H, ctx) {
  const r = rectOf(b), floors = Math.max(1, Math.round((H - 0.9) / 3.6)), FH = (H - 0.9) / floors, yr = body(S, r, H), P = planes(r);
  for (const side of 'NSEW') { const [a, c] = span(r, side); punched(S, P[side], a + 0.5, c - 0.5, floors, FH, { cols: Math.max(1, Math.round((c - a) / 4)) }); }
  const [a, c] = span(r, 'S'); door(S, P.S, (a + c) / 2); pipe(S, P.S, a + 0.3, yr);
}

const SPECIAL = {
  'slab-north-ne-wing': neWing, 'slab-north-se-block': seBlock, 'slab-south-se-block': seBlock, 'block-north-of-canopy-east-end': canopyBlock,
  'teaching-slab-west-link-e': westLink, 'dorm-a-east-link': dormLink, 'dorm-b-east-link': dormLink,
};

export function build(item, ctx) {
  const S = shell(ctx), b = bbox(itemPolygon(item));
  (SPECIAL[item.id] || generic)(S, item, b, item.height, ctx);
  finish(S, item, ctx, b.cx, b.cz, Math.max(b.sx, b.sz) / 2 + (S.low ? 50 : 75));
}
