// Body geometry of the people (src/world/extras/people.js), drawn in code: no model file, no image.
//
// One mesh holds everything a person may wear, in three levels of detail. Every vertex carries
//   - its place in the male reference body (position) and in the female one (aPosF), with normals for both: the shader
//     blends them by the person's "sex" value, so one mesh serves both and the topology is shared;
//   - two bones and a weight (aSkin.x, .y, .z) and a colour slot (aSkin.w): skin, hair, shirt, sleeve, trousers...;
//     the colour of each slot is chosen per person (see crowd.js);
//   - a variant number (aVar): 0 = always drawn, k = drawn only when bit k-1 of the person's mask is set (hair styles,
//     skirt, sleeves, glasses, caps; carried things are a second mesh with a second mask);
//   - a grey level in the vertex colour: a little ambient occlusion baked in (armpits, under the chin, between the legs).
// IMAGINED: every shape and proportion (textbook averages, chosen by eye), the haircuts, the clothes; see people.js.
import * as THREE from 'three';
import { JM, JF, B } from './rig.js';

export const SLOT = { skin: 0, hair: 1, shirt: 2, sleeve: 3, upperArm: 4, foreArm: 5, pants: 6, thighLow: 7, shin: 8, sock: 9, shoe: 10, sole: 11,
  trim: 12, eye: 13, lip: 14, extra: 15, bag: 16, bagTrim: 17, bottle: 18, umbrella: 19, item: 20, item2: 21, skirt: 22, belt: 23 };
export const NSLOT = 24;
/** Roughness of each slot (the shader picks it per vertex). */
export const ROUGH = [0.52, 0.64, 0.86, 0.86, 0.62, 0.62, 0.84, 0.74, 0.74, 0.9, 0.42, 0.62, 0.84, 0.18, 0.42, 0.38, 0.72, 0.55, 0.22, 0.62, 0.55, 0.45, 0.84, 0.45];
/** Variant bits of the body (bit = value - 1). */
export const V = { hairBase: 1, nape: 2, fringe: 3, ponytail: 4, curtain: 5, skirt: 6, sleeve: 7, collar: 8, shortsHem: 9, cuffs: 10, glasses: 11, cap: 12, hat: 13, bun: 14, crop: 15 };
/** Variant bits of the carried things. */
export const A = { backpack: 1, bottle: 2, umbrella: 3, books: 4, broom: 5, phone: 6, can: 7, folder: 8, shoulderBag: 9 };
export const bit = v => 1 << (v - 1);

const TAU = Math.PI * 2;
const ss = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const lerp3 = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const add3 = (a, b, k = 1) => [a[0] + b[0] * k, a[1] + b[1] * k, a[2] + b[2] * k];
const sub3 = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const norm3 = a => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
const cross3 = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
/** Basis of a plane across direction d: u roughly toward +x (the left), v roughly toward +z (forward) or, for a forward d, up. */
function basis(d) {
  d = norm3(d);
  const ref = Math.abs(d[2]) > 0.8 ? [0, 1, 0] : [0, 0, 1];
  let u = norm3(cross3(d, ref)); if (Math.abs(d[2]) > 0.8) { if (u[0] < 0) u = [-u[0], -u[1], -u[2]]; } else if (u[0] < 0) u = [-u[0], -u[1], -u[2]];
  let v = norm3(cross3(u, d)); const want = Math.abs(d[2]) > 0.8 ? 1 : 2; if (v[want] < 0) v = [-v[0], -v[1], -v[2]];
  return { u, v };
}

/** Collects one body shape: positions, skin data, slots, variants, baked shade, triangles. */
class Shape {
  constructor() { this.pos = []; this.skin = []; this.ao = []; this.vr = []; this.idx = []; }
  get n() { return this.pos.length / 3; }
  vert(p, b0, b1, w, slot, ao, vr) { this.pos.push(p[0], p[1], p[2]); this.skin.push(b0, b1, w, slot); this.ao.push(ao); this.vr.push(vr); return this.n - 1; }
  tri(a, b, c) { this.idx.push(a, b, c); }
}
/** Bone binding helper: { b0, b1, w } */
const bind = (b0, b1 = b0, w = 0) => ({ b0, b1, w });

/**
 * A closed or open tube through rings. ring: { c, u, v, rx, rf, rb (radius toward +v and -v), n (superellipse exponent,
 * 2 = ellipse), k: binding, slot, ao, sh (x shift of the far side, for asymmetric sections) }. Rings share their segment
 * count. capA / capB: false or { h: height of the dome along the axis, ao }. inside: true for a surface seen from inside.
 */
function tube(S, rings, segs, { capA = false, capB = false, vr = 0, flip = false, a0 = 0, band = 0 } = {}) {
  const start = S.n, ids = [];
  for (const r of rings) {
    const row = [], n = r.n || 2;
    for (let k = 0; k < segs; k++) {
      const a = a0 + k / segs * TAU, c = Math.cos(a), s = Math.sin(a);
      const lx = Math.sign(c) * Math.pow(Math.abs(c), 2 / n) * (r.rx * (c < 0 && r.rxr ? r.rxr / r.rx : 1)), lz = Math.sign(s) * Math.pow(Math.abs(s), 2 / n) * (s >= 0 ? r.rf : r.rb);
      const p = add3(add3(r.c, r.u, lx), r.v, lz);
      row.push(S.vert(p, r.k.b0, r.k.b1, r.k.w, r.slotAt ? r.slotAt(a) : r.slot, r.ao ?? 1, r.vr ?? vr));
    }
    ids.push(row);
  }
  const quads = [];
  for (let i = 0; i < rings.length - 1; i++) for (let k = 0; k < segs; k++) {
    const a = ids[i][k], b = ids[i][(k + 1) % segs], c = ids[i + 1][(k + 1) % segs], d = ids[i + 1][k];
    quads.push([a, b, c, d]);
  }
  // orientation: the first quad's normal must point away from its ring's centre
  const P = i => [S.pos[i * 3], S.pos[i * 3 + 1], S.pos[i * 3 + 2]];
  let out = true;
  if (quads.length) {
    const [a, b, , d] = quads[band * segs], nrm = cross3(sub3(P(b), P(a)), sub3(P(d), P(a))), away = sub3(P(a), rings[band].c);
    out = nrm[0] * away[0] + nrm[1] * away[1] + nrm[2] * away[2] > 0;
    if (flip) out = !out;
  }
  for (const [a, b, c, d] of quads) { if (out) { S.tri(a, b, c); S.tri(a, c, d); } else { S.tri(a, c, b); S.tri(a, d, c); } }
  const cap = (ri, spec, dir) => {
    const r = rings[ri], axis = norm3(sub3(rings[ri].c, rings[ri - dir].c)), cp = add3(r.c, axis, spec.h || 0);
    const ci = S.vert(cp, r.k.b0, r.k.b1, r.k.w, spec.slot ?? r.slot, spec.ao ?? r.ao ?? 1, r.vr ?? vr), row = ids[ri];
    for (let k = 0; k < segs; k++) {
      const a = row[k], b = row[(k + 1) % segs], nrm = cross3(sub3(P(a), cp), sub3(P(b), cp));
      if (nrm[0] * axis[0] + nrm[1] * axis[1] + nrm[2] * axis[2] > 0) S.tri(ci, a, b); else S.tri(ci, b, a);
    }
  };
  if (capA && rings.length > 1) cap(0, capA, -1);
  if (capB && rings.length > 1) cap(rings.length - 1, capB, 1);
  return start;
}
/** Rings along a segment from p to q: list of [t, rx, rf, rb, binding, slot, ao, extra]. */
function along(p, q, list, base = {}) {
  const d = sub3(q, p), { u, v } = basis(d);
  return list.map(([t, rx, rf, rb, k, slot, ao = 1, x = {}]) => ({ c: add3(p, d, t), u, v, rx, rf, rb: rb ?? rf, k, slot, ao, ...base, ...x }));
}
/** A grid patch fn(i / ni, j / nj) -> point, i across (wraps when wrap), j along; all vertices share a binding. */
function patch(S, fn, ni, nj, { wrap = false, k, slot, ao = () => 1, vr = 0, out = null, slotAt = null }) {
  const ids = [], P = i => [S.pos[i * 3], S.pos[i * 3 + 1], S.pos[i * 3 + 2]];
  for (let j = 0; j <= nj; j++) { const row = []; for (let i = 0; i < (wrap ? ni : ni + 1); i++) { const kk = typeof k === 'function' ? k(i / ni, j / nj) : k;
    row.push(S.vert(fn(i / ni, j / nj), kk.b0, kk.b1, kk.w, slotAt ? slotAt(i / ni, j / nj) : slot, ao(i / ni, j / nj), vr)); } ids.push(row); }
  const quads = [];
  for (let j = 0; j < nj; j++) for (let i = 0; i < ni; i++) { if (!wrap && i === ni) continue; const i1 = wrap ? (i + 1) % ni : i + 1; quads.push([ids[j][i], ids[j][i1], ids[j + 1][i1], ids[j + 1][i]]); }
  for (const [a, b, c, d] of quads) {
    let o = true;
    if (out) { const nrm = cross3(sub3(P(b), P(a)), sub3(P(d), P(a))), m = sub3(P(a), out(P(a))); o = nrm[0] * m[0] + nrm[1] * m[1] + nrm[2] * m[2] > 0; }
    if (o) { S.tri(a, b, c); S.tri(a, c, d); } else { S.tri(a, c, b); S.tri(a, d, c); }
  }
  return ids;
}

// ---- the two reference bodies ----------------------------------------------------------------------------------------
const PM = { J: JM, sex: 0 }, PF = { J: JF, sex: 1 };
const pick = (P, m, f) => (P.sex ? f : m);
const hs = P => (P.sex ? 0.955 : 1);                                // head size of the female reference relative to the male
/** Centre of the head (inside the skull). */
const headCentre = P => { const J = P.J[B.head], s = hs(P); return [J[0], J[1] + 0.084 * s, J[2] + 0.014 * s]; };

/** Head surface: azimuth ph (0 = forward, + toward the left), polar th (0 = top), extra offset dr along the normal. */
function headPoint(P, ph, th, dr = 0) {
  const s = hs(P), C = headCentre(P);
  const sx = Math.sin(th) * Math.sin(ph), cy = Math.cos(th), sz = Math.sin(th) * Math.cos(ph), aph = Math.abs(Math.atan2(Math.sin(ph), Math.cos(ph)));
  const chin = 1 - ss(0.55, 1.5, aph);                               // the full depth of the chin over the front, the jaw rising toward the ears
  const a = 0.0748 * s, bT = 0.1 * s, bB = (0.078 + 0.054 * chin) * s, cF = 0.088 * s, cB = 0.1 * s;
  const by = cy >= 0 ? bT : bB, cz = sz >= 0 ? cF : cB;
  const ne = cy >= 0 ? 2 : 2 + 0.7 * chin;                                    // a squarer jaw: a superellipse in the lower half
  const r = 1 / Math.pow(Math.abs(sx / a) ** ne + Math.abs(cy / by) ** ne + Math.abs(sz / cz) ** ne, 1 / ne);
  let x = sx * r, y = cy * r, z = sz * r;
  const low = ss(0.0, -0.9, cy), front = Math.max(0, Math.cos(ph));
  x *= 1 - 0.1 * low - 0.05 * ss(0.55, 1, cy);                       // a slightly narrower jaw and crown
  z += 0.006 * s * low * front;                                      // chin a little forward
  if (z > 0) z -= 0.18 * (x * x) / a * ss(-0.75, 0.15, cy);          // the face is flatter than an egg
  if (z < 0 && cy < 0) z *= 1 - 0.25 * ss(0, -0.8, cy) * ss(0.2, 1, -Math.cos(ph));   // the back of the jaw tucks in toward the neck
  const brow = Math.exp(-(((cy - 0.22) / 0.09) ** 2)) * front * front, cheek = Math.exp(-(((cy + 0.08) / 0.15) ** 2)) * Math.exp(-(((aph - 0.9) / 0.35) ** 2));
  const eyes = Math.exp(-(((cy - 0.0) / 0.07) ** 2)) * Math.exp(-(((aph - 0.4) / 0.18) ** 2));
  const rr = 1 + 0.03 * brow + 0.03 * cheek - 0.008 * eyes;
  const n = norm3([x / (a * a), y / (by * by), z / (cz * cz)]);
  return [C[0] + x * rr + n[0] * dr, C[1] + y * rr + n[1] * dr, C[2] + z * rr + n[2] * dr];
}
/** Polar angle at which the head surface along azimuth ph reaches height y. */
function thetaAt(P, ph, y) { let lo = 0.01, hi = Math.PI - 0.01; for (let i = 0; i < 28; i++) { const m = (lo + hi) / 2; if (headPoint(P, ph, m)[1] > y) lo = m; else hi = m; } return (lo + hi) / 2; }
/** Point of the face at (x, y) in person space, pushed out by dr. */
function onFace(P, x, y, dr = 0) { const ph = Math.asin(Math.max(-0.95, Math.min(0.95, x / (0.0748 * hs(P))))); return headPoint(P, ph, thetaAt(P, ph, y), dr); }

/** Rings of the shirt: [y, rx, rfront, rback, z centre, binding]. */
function shirtRings(P) {
  const J = P.J, yP = J[B.pelvis][1], yS = J[B.spine][1], yC = J[B.chest][1], yN = J[B.neck][1];
  return pick(P, [
    [yP - 0.045, 0.171, 0.1, 0.12, 0.0, bind(B.pelvis)],
    [yP + 0.02, 0.166, 0.099, 0.11, -0.002, bind(B.pelvis, B.spine, 0.1)],
    [yS + 0.035, 0.158, 0.1, 0.097, -0.006, bind(B.spine, B.pelvis, 0.25)],
    [yS + 0.1, 0.16, 0.104, 0.094, -0.008, bind(B.spine, B.chest, 0.35)],
    [yC + 0.035, 0.168, 0.11, 0.096, -0.01, bind(B.chest, B.spine, 0.15)],
    [yC + 0.1, 0.18, 0.112, 0.099, -0.012, bind(B.chest)],
    [yC + 0.15, 0.19, 0.104, 0.097, -0.016, bind(B.chest)],
    [yN - 0.03, 0.172, 0.086, 0.089, -0.02, bind(B.chest, B.neck, 0.05)],
    [yN - 0.01, 0.13, 0.072, 0.077, -0.023, bind(B.chest, B.neck, 0.12)],
    [yN + 0.012, 0.068, 0.058, 0.06, -0.022, bind(B.chest, B.neck, 0.35)],
  ], [
    [yP - 0.02, 0.171, 0.096, 0.122, 0.0, bind(B.pelvis)],
    [yP + 0.04, 0.152, 0.088, 0.1, -0.002, bind(B.pelvis, B.spine, 0.1)],
    [yS + 0.03, 0.133, 0.083, 0.086, -0.006, bind(B.spine, B.pelvis, 0.25)],
    [yS + 0.09, 0.134, 0.088, 0.086, -0.008, bind(B.spine, B.chest, 0.35)],
    [yC + 0.03, 0.143, 0.112, 0.087, -0.01, bind(B.chest, B.spine, 0.15)],
    [yC + 0.09, 0.15, 0.118, 0.088, -0.012, bind(B.chest)],
    [yC + 0.14, 0.162, 0.096, 0.088, -0.016, bind(B.chest)],
    [yN - 0.028, 0.148, 0.078, 0.082, -0.02, bind(B.chest, B.neck, 0.05)],
    [yN - 0.01, 0.112, 0.064, 0.07, -0.023, bind(B.chest, B.neck, 0.12)],
    [yN + 0.012, 0.06, 0.052, 0.054, -0.022, bind(B.chest, B.neck, 0.35)],
  ]);
}
/** A point on the shirt at height y and angle a (0 = toward the left, pi/2 = forward), pushed out by dr. */
function onShirt(P, y, a, dr = 0) {
  const R = shirtRings(P); let i = 0; while (i < R.length - 2 && y > R[i + 1][0]) i++;
  const A0 = R[i], A1 = R[i + 1], t = Math.max(0, Math.min(1, (y - A0[0]) / (A1[0] - A0[0]))), m = k => A0[k] + (A1[k] - A0[k]) * t;
  const c = Math.cos(a), s = Math.sin(a), n = 2.25, lx = Math.sign(c) * Math.pow(Math.abs(c), 2 / n) * (m(1) + dr), lz = Math.sign(s) * Math.pow(Math.abs(s), 2 / n) * ((s >= 0 ? m(2) : m(3)) + dr);
  return [lx, y, m(4) + lz];
}

// ---- the body ----------------------------------------------------------------------------------------------------------
const LODS = [
  { torso: 12, limb: 9, fore: 8, leg: 10, shin: 9, head: [14, 10], hair: [14, 6], hand: 1, foot: 8, neck: 9, face: true, ears: true, extras: true },
  { torso: 7, limb: 5, fore: 5, leg: 6, shin: 5, head: [7, 5], hair: [7, 2], hand: 0, foot: 5, neck: 5, face: false, ears: false, extras: false },
  { torso: 5, limb: 4, fore: 3, leg: 4, shin: 4, head: [5, 3], hair: [5, 1], hand: -1, foot: 4, neck: 4, face: false, ears: false, extras: false },
];

function buildBody(P, lod) {
  const S = new Shape(), L = LODS[lod], J = P.J, Z = [0, 0, 1], X = [1, 0, 0], j = b => J[b];
  const yP = j(B.pelvis)[1], k = pick(P, 1, 0.9);
  // ---------- trousers or shorts round the hips (under the shirt): crotch to above the waist
  const pants = pick(P, [[yP - 0.142, 0.07, 0.055, 0.065, 0.62], [yP - 0.105, 0.134, 0.084, 0.1, 0.82], [yP - 0.05, 0.164, 0.093, 0.116, 0.95], [yP + 0.03, 0.156, 0.091, 0.104, 1], [yP + 0.1, 0.148, 0.09, 0.09, 1]],
    [[yP - 0.13, 0.072, 0.055, 0.066, 0.62], [yP - 0.095, 0.144, 0.081, 0.105, 0.82], [yP - 0.04, 0.17, 0.088, 0.118, 0.95], [yP + 0.03, 0.152, 0.084, 0.098, 1], [yP + 0.1, 0.126, 0.078, 0.082, 1]]);
  const pr = (lod === 2 ? [pants[1], pants[2], pants[4]] : lod === 1 ? [pants[0], pants[2], pants[4]] : pants).map(([y, rx, rf, rb, ao], i, arr) => ({ c: [0, y, 0], u: X, v: Z, rx, rf, rb, n: 2.25,
    k: i === arr.length - 1 ? bind(B.pelvis, B.spine, 0.3) : bind(B.pelvis), slot: SLOT.pants, ao }));
  tube(S, pr, L.torso, { capA: { h: -0.02, ao: 0.6 }, capB: { h: 0.02 } });
  // ---------- shirt: from the hem at the hip to the base of the neck, the hem turned in
  { const R = shirtRings(P), sel = lod === 2 ? [0, 3, 6, 8] : lod === 1 ? [0, 2, 4, 6, 7, 9] : R.map((_, i) => i);
    const rings = sel.map(i => { const [y, rx, rf, rb, zc, kk] = R[i]; return { c: [0, y, zc], u: X, v: Z, rx, rf, rb, n: 2.25, k: kk, slot: SLOT.shirt, ao: i === 0 ? 0.92 : i >= 8 ? 0.9 : 1 }; });
    if (!lod) { const h = rings[0]; rings.unshift({ ...h, rx: h.rx - 0.008, rf: h.rf - 0.008, rb: h.rb - 0.008, ao: 0.5 }, { ...h, c: [0, h.c[1] + 0.03, h.c[2]], rx: h.rx - 0.012, rf: h.rf - 0.012, rb: h.rb - 0.012, ao: 0.4 }); rings.unshift(rings.splice(1, 1)[0]); }
    tube(S, rings, L.torso, { capB: lod ? { h: 0.02 } : false, band: lod ? 0 : 2 }); }
  // ---------- neck
  { const nb = j(B.neck), hb = j(B.head), r = pick(P, 0.06, 0.05);
    tube(S, [
      { c: [0, nb[1] - 0.05, nb[2] - 0.004], u: X, v: Z, rx: r * 1.12, rf: r, rb: r * 1.08, k: bind(B.neck, B.chest, 0.45), slot: SLOT.skin, ao: 0.8 },
      { c: [0, (nb[1] + hb[1]) / 2, nb[2] + 0.004], u: X, v: Z, rx: r, rf: r * 0.94, rb: r, k: bind(B.neck), slot: SLOT.skin, ao: 0.82 },
      { c: [0, hb[1] + 0.035, hb[2] + 0.005], u: X, v: Z, rx: r * 0.98, rf: r * 0.9, rb: r * 1.02, k: bind(B.head, B.neck, 0.3), slot: SLOT.skin, ao: 0.9 },
    ], L.neck); }
  // ---------- head, face, ears, hair
  { const [na, nt] = L.head;
    patch(S, (u, v) => headPoint(P, u * TAU, 0.0001 + v * (Math.PI - 0.0002)), na, nt, { wrap: true, k: bind(B.head), slot: SLOT.skin, ao: (u, v) => 1 - 0.2 * ss(0.7, 0.95, v), out: () => headCentre(P) });
    if (L.face) face(S, P);
    if (L.ears) for (const s of [1, -1]) {
      const ey = j(B.head)[1] + pick(P, 0.058, 0.054), c = headPoint(P, s * 1.6, thetaAt(P, s * 1.6, ey), -0.003);
      tube(S, along(add3(c, [s * 0.002, 0.03, -0.008]), add3(c, [s * 0.004, -0.026, 0.002]), [[0, 0.004, 0.008, 0.008, bind(B.head), SLOT.skin, 0.9], [0.3, 0.01, 0.019, 0.016, bind(B.head), SLOT.skin, 0.85], [0.75, 0.009, 0.015, 0.012, bind(B.head), SLOT.skin, 0.9], [1, 0.004, 0.006, 0.006, bind(B.head), SLOT.skin, 0.9]]), 5, { capA: { h: 0.003 }, capB: { h: 0.003 } });
    }
    hair(S, P, lod);
  }
  // ---------- arms: upper arm and forearm overlap at the elbow (capped), so a bent elbow shows no gap
  for (const s of [1, -1]) {
    const ua = s > 0 ? B.uaL : B.uaR, fa = ua + 1, hd = ua + 2, sp = j(ua), el = j(fa), wr = j(hd);
    const up = along(sp, el, [
      [-0.1, 0.03 * k, 0.034 * k, 0.034 * k, bind(B.chest, ua, 0.5), SLOT.sleeve, 0.95],
      [0.04, 0.053 * k, 0.053 * k, 0.053 * k, bind(ua, B.chest, 0.3), SLOT.sleeve, 1],
      [0.18, 0.054 * k, 0.052 * k, 0.05 * k, bind(ua), SLOT.sleeve, 0.95],
      [0.45, 0.047 * k, 0.046 * k, 0.045 * k, bind(ua), SLOT.upperArm, 0.95],
      [0.8, 0.041 * k, 0.039 * k, 0.041 * k, bind(ua), SLOT.upperArm, 1],
      [1.07, 0.034 * k, 0.032 * k, 0.034 * k, bind(fa, ua, 0.35), SLOT.upperArm, 0.9],
    ]);
    tube(S, lod === 2 ? [up[1], up[5]] : lod === 1 ? [up[1], up[3], up[5]] : up, L.limb, { capA: { h: 0.004 }, capB: { h: 0.012 } });
    const fo = along(el, wr, [
      [-0.07, 0.034 * k, 0.034 * k, 0.034 * k, bind(ua, fa, 0.35), SLOT.foreArm, 0.9],
      [0.12, 0.04 * k, 0.038 * k, 0.036 * k, bind(fa, ua, 0.1), SLOT.foreArm, 1],
      [0.55, 0.032 * k, 0.029 * k, 0.029 * k, bind(fa), SLOT.foreArm, 1],
      [0.98, 0.025 * k, 0.019 * k, 0.019 * k, bind(fa, hd, 0.2), SLOT.foreArm, 1],
    ]);
    tube(S, lod ? [fo[0], fo[3]] : fo, L.fore, { capA: { h: -0.01 }, capB: { h: 0.008 } });
    if (L.hand >= 0) hand(S, P, s, lod);
    if (L.extras) {                                                   // short sleeve: a loose tube with a turned-in hem
      const sl = along(sp, el, [
        [-0.04, 0.046 * k, 0.05 * k, 0.05 * k, bind(B.chest, ua, 0.5), SLOT.sleeve, 1],
        [0.1, 0.059 * k, 0.058 * k, 0.058 * k, bind(ua, B.chest, 0.2), SLOT.sleeve, 1],
        [0.42, 0.056 * k, 0.054 * k, 0.056 * k, bind(ua), SLOT.sleeve, 0.95],
        [0.42, 0.05 * k, 0.048 * k, 0.05 * k, bind(ua), SLOT.sleeve, 0.5],
        [0.34, 0.047 * k, 0.045 * k, 0.047 * k, bind(ua), SLOT.sleeve, 0.45],
      ]);
      tube(S, sl, 10, { vr: V.sleeve });
    }
  }
  // ---------- legs: thigh and shin overlap at the knee (capped); a loose trouser leg is a variant over the shin
  for (const s of [1, -1]) {
    const th = s > 0 ? B.thL : B.thR, sn = th + 1, ft = th + 2, hp = j(th), kn = j(sn), an = j(ft), kl = pick(P, 1, 0.93);
    const tl = along(hp, kn, [
      [-0.16, 0.075 * kl, 0.07 * kl, 0.08 * kl, bind(B.pelvis, th, 0.35), SLOT.pants, 0.9],
      [0.0, 0.088 * kl, 0.084 * kl, 0.09 * kl, bind(th, B.pelvis, 0.3), SLOT.pants, 0.9],
      [0.25, 0.08 * kl, 0.079 * kl, 0.079 * kl, bind(th), SLOT.pants, 1],
      [0.55, 0.069 * kl, 0.069 * kl, 0.065 * kl, bind(th), SLOT.thighLow, 1],
      [0.86, 0.057 * kl, 0.057 * kl, 0.053 * kl, bind(th, sn, 0.15), SLOT.thighLow, 1],
      [1.06, 0.048 * kl, 0.048 * kl, 0.046 * kl, bind(sn, th, 0.4), SLOT.thighLow, 0.9],
    ]);
    tube(S, lod === 2 ? [tl[1], tl[5]] : lod === 1 ? [tl[1], tl[3], tl[5]] : tl, L.leg, { capB: { h: 0.015 } });
    const sl = along(kn, an, [
      [-0.06, 0.049 * kl, 0.049 * kl, 0.048 * kl, bind(th, sn, 0.4), SLOT.shin, 0.92],
      [0.1, 0.049 * kl, 0.048 * kl, 0.051 * kl, bind(sn, th, 0.1), SLOT.shin, 1],
      [0.32, 0.049 * kl, 0.045 * kl, 0.056 * kl, bind(sn), SLOT.shin, 1],
      [0.62, 0.04 * kl, 0.038 * kl, 0.042 * kl, bind(sn), SLOT.shin, 1],
      [0.86, 0.032 * kl, 0.032 * kl, 0.033 * kl, bind(sn), SLOT.sock, 1],
      [1.05, 0.034 * kl, 0.036 * kl, 0.034 * kl, bind(ft, sn, 0.3), SLOT.sock, 0.9],
    ]);
    tube(S, lod === 2 ? [sl[0], sl[5]] : lod === 1 ? [sl[0], sl[2], sl[5]] : sl, L.shin, { capA: { h: -0.015 } });
    shoe(S, P, s, lod);
    if (lod < 2) {                                                    // trouser leg: straight from above the knee to a hem over the shoe
      const kt = pick(P, 1, 0.94), tr = along(kn, an, [
        [-0.12, 0.058 * kt, 0.058 * kt, 0.056 * kt, bind(th, sn, 0.3), SLOT.shin, 1],
        [0.05, 0.057 * kt, 0.057 * kt, 0.057 * kt, bind(sn, th, 0.3), SLOT.shin, 1],
        [0.5, 0.054 * kt, 0.053 * kt, 0.056 * kt, bind(sn), SLOT.shin, 1],
        [0.95, 0.053 * kt, 0.056 * kt, 0.052 * kt, bind(sn, ft, 0.2), SLOT.shin, 1],
        [0.95, 0.046 * kt, 0.048 * kt, 0.045 * kt, bind(sn, ft, 0.2), SLOT.shin, 0.4],
        [0.85, 0.042 * kt, 0.042 * kt, 0.042 * kt, bind(sn), SLOT.shin, 0.4]]);
      tube(S, lod ? [tr[0], tr[2], tr[3]] : tr, lod ? L.shin : 10, { vr: V.cuffs });
    }
    if (L.extras) {                                                   // shorts hem on the thigh
      const sh2 = along(hp, kn, [[0.18, 0.089 * kl, 0.087 * kl, 0.089 * kl, bind(th, B.pelvis, 0.2), SLOT.pants, 1], [0.5, 0.083 * kl, 0.082 * kl, 0.08 * kl, bind(th), SLOT.pants, 1],
        [0.5, 0.075 * kl, 0.074 * kl, 0.072 * kl, bind(th), SLOT.pants, 0.45], [0.42, 0.07 * kl, 0.07 * kl, 0.068 * kl, bind(th), SLOT.pants, 0.45]]);
      tube(S, sh2, 9, { vr: V.shortsHem });
    }
  }
  // ---------- skirt: from the waist to just above the knee, pleats as a wavy edge
  if (lod < 2) {
    const yw = yP + 0.06, yh = j(B.shL)[1] + pick(P, 0.08, 0.075), segs = lod ? 8 : 16, rows = lod ? 1 : 3, ring = [];
    for (let r = 0; r <= rows; r++) {
      const t = r / rows, y = yw + (yh - yw) * t, rx = 0.15 + 0.075 * t, rf = 0.094 + 0.085 * t, rb = 0.108 + 0.06 * t;
      ring.push({ c: [0, y, 0.0], u: X, v: Z, rx, rf, rb, n: 2.1, k: bind(B.pelvis), slot: SLOT.skirt, ao: 0.9 + 0.1 * t, vr: V.skirt });
    }
    const legBind = (i0) => { for (let i = i0; i < S.n; i++) {
      const x = S.pos[i * 3], y = S.pos[i * 3 + 1], t = (yw - y) / (yw - yh);
      const z = S.pos[i * 3 + 2], fz = Math.max(0, z) / 0.15;
      if (t > 0.25) { S.skin[i * 4] = B.pelvis; S.skin[i * 4 + 1] = x >= 0 ? B.thL : B.thR; S.skin[i * 4 + 2] = Math.min(0.5 + 0.3 * fz, (t - 0.25) * (1 + fz)) * Math.min(1, Math.abs(x) / 0.06 + 0.35); } } };
    const start = tube(S, ring, segs, { vr: V.skirt });
    for (let i = start; i < S.n; i++) { const x = S.pos[i * 3], y = S.pos[i * 3 + 1], z = S.pos[i * 3 + 2], t = (yw - y) / (yw - yh), a = Math.atan2(z, x), w = 1 + (lod ? 0 : 0.028 * t * Math.cos(a * 16)); S.pos[i * 3] = x * w; S.pos[i * 3 + 2] = z * w; }
    legBind(start);
    if (!lod) {
      const hem = ring[rows], inner = { ...hem, rx: hem.rx - 0.008, rf: hem.rf - 0.008, rb: hem.rb - 0.008, ao: 0.4 }, up = { ...inner, c: [0, yh + 0.06, 0], ao: 0.35 };
      const s2 = tube(S, [hem, inner, up], segs, { vr: V.skirt, flip: true });
      for (let i = s2; i < S.n; i++) { const x = S.pos[i * 3], z = S.pos[i * 3 + 2], a = Math.atan2(z, x), w = 1 + 0.028 * Math.cos(a * 16) * (S.pos[i * 3 + 1] < yh + 0.001 ? 1 : 0.9); S.pos[i * 3] = x * w; S.pos[i * 3 + 2] = z * w; }
      legBind(s2);
    }
  }
  // ---------- collar, glasses, caps (near only)
  if (L.extras) { collar(S, P); glasses(S, P); headwear(S, P); }
  return S;
}

/** Polo collar: a stand round the base of the neck folded over into a fall, open at the front. */
function collar(S, P) {
  const nb = P.J[B.neck], yN = nb[1], r0 = pick(P, 0.064, 0.055), n = 16, rows = [];
  // [height above the neck joint, extra radius, shade]: stand inside, fold at the top, fall outside down to the shirt
  const prof = [[-0.022, 0.0, 0.7], [0.012, 0.004, 0.85], [0.018, 0.01, 1], [-0.006, 0.02, 1], [-0.02, 0.022, 0.8]];
  for (const [dy, dr, ao] of prof) {
    const row = [];
    for (let i = 0; i <= n; i++) {
      const a = Math.PI / 2 + 0.36 + (i / n) * (TAU - 0.72), r = r0 + dr + (dy < 0 ? 0.004 : 0);                  // a gap in front
      row.push(S.vert([Math.cos(a) * r * 1.06, yN + dy - 0.006 * Math.max(0, Math.sin(a)), nb[2] - 0.004 + Math.sin(a) * r], B.chest, B.neck, dy > 0 ? 0.3 : 0.1, SLOT.trim, ao, V.collar));
    }
    rows.push(row);
  }
  for (let r = 0; r < rows.length - 1; r++) for (let i = 0; i < n; i++) { const a = rows[r][i], b = rows[r][i + 1], c = rows[r + 1][i + 1], d = rows[r + 1][i]; S.tri(a, b, c); S.tri(a, c, d); S.tri(a, c, b); S.tri(a, d, c); }
}

/** Eyes (white, iris), brows, nose, lips. */
function face(S, P) {
  const J = P.J[B.head], k = bind(B.head), sc = hs(P), eyeY = J[1] + (P.sex ? 0.064 : 0.067);
  const fan = (c, pts, slot, ao = 1) => { const ci = S.vert(c, k.b0, k.b1, k.w, slot, ao, 0), ring = pts.map(p => S.vert(p, k.b0, k.b1, k.w, slot, ao, 0)); for (let i = 0; i < ring.length; i++) S.tri(ci, ring[i], ring[(i + 1) % ring.length]); };
  for (const s of [1, -1]) {
    const c = onFace(P, s * 0.031 * sc, eyeY, 0.0005), w = 0.0136 * sc, n = 10, white = [], iris = [];
    for (let i = 0; i < n; i++) { const a = i / n * TAU, sn = Math.sin(a), up = sn > 0 ? 0.0064 : 0.0044, x = Math.cos(a) * w;
      white.push(add3(c, [x, sn * up * sc - (x * s > 0 ? 0.0012 : 0), 0.0014 - 0.0022 * (x / w) ** 2])); }
    fan(add3(c, [0, 0, 0.003]), white, SLOT.belt, 0.95);
    for (let i = 0; i < 8; i++) { const a = i / 8 * TAU, y = Math.sin(a) * 0.0054 * sc + 0.0008; iris.push(add3(c, [Math.cos(a) * 0.0054 * sc, Math.min(y, 0.0058 * sc), 0.0036])); }
    fan(add3(c, [0, 0.0008, 0.0042]), iris, SLOT.eye);
    // upper lid: a thin dark arc along the top of the eye
    const lid = []; for (let i = 0; i <= 4; i++) { const a = Math.PI * (0.05 + 0.9 * i / 4), x = Math.cos(a) * w * 1.05; lid.push([add3(c, [x, 0.0062 * sc + 0.0014, 0.0032 - 0.002 * (x / w) ** 2]), add3(c, [x, 0.0062 * sc - 0.0009, 0.0037 - 0.002 * (x / w) ** 2])]); }
    for (let i = 0; i < 4; i++) { const q = [lid[i][0], lid[i + 1][0], lid[i + 1][1], lid[i][1]].map(p => S.vert(p, k.b0, k.b1, k.w, SLOT.eye, 1, 0)); S.tri(q[0], q[1], q[2]); S.tri(q[0], q[2], q[3]); }
    // brow: a short arching bar
    const bw = 0.02 * sc, pts = [-1, -0.33, 0.33, 1].map(t => onFace(P, s * (0.031 + t * bw * 0.95) * sc, eyeY + 0.019 + 0.003 * (1 - t * t) - (t * s > 0 ? 0.0025 : 0), 0.0012));
    const top = pts.map((p, i) => S.vert(add3(p, [0, 0.0024 - (i === 0 || i === 3 ? 0.0012 : 0), 0]), k.b0, k.b1, k.w, SLOT.hair, 1.1, 0)), bot = pts.map(p => S.vert(add3(p, [0, -0.0018, 0.0005]), k.b0, k.b1, k.w, SLOT.hair, 1.1, 0));
    for (let i = 0; i < 3; i++) { if (s > 0) { S.tri(bot[i], bot[i + 1], top[i + 1]); S.tri(bot[i], top[i + 1], top[i]); } else { S.tri(bot[i], top[i + 1], bot[i + 1]); S.tri(bot[i], top[i], top[i + 1]); } }
  }
  // nose: a small, soft wedge
  { const tipY = eyeY - 0.041 * sc, bridge = onFace(P, 0, eyeY + 0.004, -0.002), tip = add3(onFace(P, 0, tipY, 0), [0, 0.002, 0.016 * sc]);
    const alL = add3(onFace(P, 0.015 * sc, tipY - 0.004, 0), [0, 0, 0.003]), alR = add3(onFace(P, -0.015 * sc, tipY - 0.004, 0), [0, 0, 0.003]), base = add3(onFace(P, 0, tipY - 0.009, 0), [0, 0, 0.005]);
    const sL = onFace(P, 0.008 * sc, eyeY - 0.012, -0.001), sR = onFace(P, -0.008 * sc, eyeY - 0.012, -0.001);
    const T = (a, b, c, ao = 1) => { const i0 = S.vert(a, k.b0, k.b1, k.w, SLOT.skin, ao, 0), i1 = S.vert(b, k.b0, k.b1, k.w, SLOT.skin, ao, 0), i2 = S.vert(c, k.b0, k.b1, k.w, SLOT.skin, ao, 0); S.tri(i0, i1, i2); };
    T(bridge, sR, tip, 0.98); T(bridge, tip, sL, 0.98); T(sL, tip, alL, 0.95); T(sR, alR, tip, 0.95); T(tip, alR, base, 0.7); T(tip, base, alL, 0.7); }
  // lips: a soft lens
  { const c = onFace(P, 0, eyeY - 0.071 * sc, 0.0018), w = 0.021 * sc, pts = [];
    for (let i = 0; i < 8; i++) { const a = i / 8 * TAU, yy = Math.sin(a) * (Math.sin(a) > 0 ? 0.0052 : 0.0064) * sc; pts.push(add3(c, [Math.cos(a) * w, yy, -0.003 * Math.abs(Math.cos(a))])); }
    fan(add3(c, [0, 0, 0.0035]), pts, SLOT.lip, 0.95); }
}

/** Hair: a cap over the skull whose edge dips under the skin (a clean hairline), plus a nape, a fringe, a ponytail, a bob's sides. */
function hair(S, P, lod) {
  const [na, nt] = LODS[lod].hair, k = bind(B.head), Jh = P.J[B.head], Cn = headCentre(P);
  // hairline: polar angle of the edge by azimuth (0 forward): forehead, temples, above the ears, nape
  const edge = ph => { const c = Math.cos(ph), a = Math.abs(Math.sin(ph)); return 0.92 + 0.5 * (1 - c) / 2 + 0.36 * a * a * (c > 0 ? 1 : 0.5) + (c < -0.5 ? 0.2 * (-c - 0.5) : 0); };
  // volume: thickest on the crown, a few clumps, thinning to the edge and tucked under the skin at it
  const thick = (ph, t) => {
    const side = Math.abs(Math.sin(ph)), v = (0.008 + 0.022 * Math.pow(Math.max(0, Math.cos(t * 1.35)), 1.3) + 0.004 * Math.max(0, -Math.cos(ph)) - 0.002 * side * t) * (1 + (lod ? 0 : 0.22 * Math.sin(ph * 7 + t * 9) * Math.sin(ph * 3 - 2)));
    return v * (1 - ss(0.8, 1, t)) - 0.0025 * ss(0.93, 1, t);
  };
  patch(S, (u, v) => { const ph = u * TAU, th = 0.0001 + edge(ph) * v; return headPoint(P, ph, th, thick(ph, v)); }, na, nt, { wrap: true, k, slot: SLOT.hair, vr: V.hairBase,
    ao: (u, v) => 0.96 - 0.14 * ss(0.65, 1, v), out: () => Cn });
  if (lod === 2) return;
  // nape for short cuts: from the base edge down at the back, close cropped
  patch(S, (u, v) => { const ph = Math.PI * (0.42 + 1.16 * u), e = edge(ph), th = e + (0.28 * Math.max(0, -Math.cos(ph)) + 0.08) * v; return headPoint(P, ph, th - 0.06, 0.006 * (1 - v) - 0.0015 * v * v); }, lod ? 4 : 9, lod ? 1 : 2,
    { k, slot: SLOT.hair, vr: V.nape, ao: () => 0.88, out: () => Cn });
  // fringe: a thick lock swept over the forehead, its edge cut in points
  patch(S, (u, v) => { const ph = (u - 0.5) * 2.1, jag = lod ? 0 : 0.06 * Math.abs(Math.sin(u * 17)) * (0.4 + 0.6 * v), slant = 0.12 * (u - 0.5), th = 0.3 + (edge(0) + 0.3 + jag + slant - 0.3) * v;
    const p = headPoint(P, ph, th, (0.02 + 0.006 * Math.cos(ph)) * (1 - v * v * 0.85) + 0.002); p[0] += 0.012 * v * v * (1 - Math.abs(u - 0.5)); return p; },
    lod ? 4 : 10, lod ? 1 : 3, { k, slot: SLOT.hair, vr: V.fringe, ao: (u, v) => 1 - 0.12 * v, out: () => Cn });
  // ponytail: a tie at the back of the head and a tapering tail on its own bone
  { const root = headPoint(P, Math.PI, 1.42, 0.016), Hb = P.J[B.hair], segs = lod ? 5 : 8;
    tube(S, along(add3(root, [0, 0.018, 0.012]), add3(root, [0, -0.012, -0.028]), [[0, 0.017, 0.017, 0.017, k, SLOT.trim, 1], [1, 0.017, 0.017, 0.017, k, SLOT.trim, 1]]), segs, { vr: V.ponytail, capB: { h: 0.004 } });
    const a = add3(root, [0, -0.006, -0.026]), b = [Hb[0], Hb[1] - 0.27, Hb[2] - 0.055];
    const tail = along(a, b, [[0, 0.022, 0.02, 0.02, bind(B.head, B.hair, 0.3), SLOT.hair, 0.9], [0.22, 0.032, 0.024, 0.026, bind(B.hair, B.head, 0.2), SLOT.hair, 1], [0.6, 0.027, 0.019, 0.021, bind(B.hair), SLOT.hair, 1], [1, 0.006, 0.006, 0.006, bind(B.hair), SLOT.hair, 1]]);
    tube(S, lod ? [tail[0], tail[1], tail[3]] : tail, segs, { vr: V.ponytail });
    const bc = headPoint(P, Math.PI, 1.22, 0.034);
    tube(S, along(add3(bc, [0, 0.035, 0.012]), add3(bc, [0, -0.035, -0.012]), [[0, 0.01, 0.01, 0.01, k, SLOT.hair, 1], [0.25, 0.035, 0.035, 0.031, k, SLOT.hair, 1], [0.75, 0.035, 0.035, 0.031, k, SLOT.hair, 1], [1, 0.012, 0.012, 0.012, k, SLOT.hair, 0.9]]), segs, { vr: V.bun, capA: { h: 0.002 }, capB: { h: 0.002 } }); }
  // bob: hair falling round the sides and back to the jaw, its tips turned in
  { const n = lod ? 7 : 12, rows = lod ? 2 : 3, ys = Jh[1] - (P.sex ? 0.015 : 0.02), y0 = Jh[1] + 0.085;
    const at = (u, v, extra) => { const ph = Math.PI * (0.24 + 1.52 * u), y = y0 + (ys - y0) * v, lowY = headPoint(P, ph, 1.85)[1];
      const p = headPoint(P, ph, y > lowY ? thetaAt(P, ph, y) : 1.85, 0.016 + extra * v), out = norm3([Math.sin(ph), 0, Math.cos(ph)]);
      return y > lowY ? p : [p[0] + out[0] * 0.012 * v, y, p[2] + out[2] * 0.012 * v]; };
    patch(S, (u, v) => at(u, v, 0.012), n, rows, { k: (u, v) => (v > 0.6 ? bind(B.head, B.neck, 0.15) : k), slot: SLOT.hair, vr: V.curtain, ao: (u, v) => 0.95 - 0.15 * v, out: () => Cn });
    patch(S, (u, v) => (v ? at(u, 0.72, -0.014) : at(u, 1, 0.012)), n, 1,
      { k: bind(B.head, B.neck, 0.15), slot: SLOT.hair, vr: V.curtain, ao: () => 0.45, out: p => [Cn[0] + (p[0] - Cn[0]) * 3, p[1], Cn[2] + (p[2] - Cn[2]) * 3] });
  }
}

/** Glasses: two thin rims, a bridge and the arms to the ears (dark metal or plastic in the "extra" slot). */
function glasses(S, P) {
  const J = P.J[B.head], k = bind(B.head), sc = hs(P), eyeY = J[1] + (P.sex ? 0.064 : 0.067), z0 = onFace(P, 0.031 * sc, eyeY)[2] + 0.011;
  const strip = pts => {
    for (let i = 0; i < pts.length - 1; i++) {
      const [a, b] = [pts[i], pts[i + 1]], q = [a[0], b[0], b[1], a[1]].map(p => S.vert(p, k.b0, k.b1, k.w, SLOT.extra, 1, V.glasses));
      S.tri(q[0], q[1], q[2]); S.tri(q[0], q[2], q[3]); S.tri(q[0], q[2], q[1]); S.tri(q[0], q[3], q[2]);
    }
  };
  for (const s of [1, -1]) {
    const cx = s * 0.032 * sc, w = 0.023 * sc, h = 0.0155 * sc, n = 10, outer = [], t = 0.0024;
    for (let i = 0; i <= n; i++) { const a = i / n * TAU, x = cx + Math.cos(a) * w, y = eyeY - 0.002 + Math.sin(a) * h * (Math.sin(a) > 0 ? 0.95 : 1.05), z = z0 - 0.007 * (Math.abs(x) / 0.06) ** 2;
      outer.push([[x + Math.cos(a) * t, y + Math.sin(a) * t, z], [x - Math.cos(a) * t, y - Math.sin(a) * t, z]]); }
    strip(outer);
    const ex = s * (0.032 * sc + w), ear = headPoint(P, s * 1.5, thetaAt(P, s * 1.5, eyeY), 0.003);
    strip([[[ex, eyeY + 0.003, z0 - 0.005], [ex, eyeY - 0.001, z0 - 0.005]], [[ear[0] + s * 0.004, eyeY + 0.004, ear[2] + 0.02], [ear[0] + s * 0.004, eyeY, ear[2] + 0.02]], [[ear[0], eyeY - 0.004, ear[2] - 0.012], [ear[0], eyeY - 0.012, ear[2] - 0.008]]]);
  }
  strip([[[0.009 * sc, eyeY + 0.004, z0 + 0.002], [0.009 * sc, eyeY, z0 + 0.002]], [[0, eyeY + 0.006, z0 + 0.004], [0, eyeY + 0.002, z0 + 0.004]], [[-0.009 * sc, eyeY + 0.004, z0 + 0.002], [-0.009 * sc, eyeY, z0 + 0.002]]]);
}

/** A peaked cap (guard) and a wide-brimmed sun hat (gardener, cleaner). */
function headwear(S, P) {
  const k = bind(B.head), sc = hs(P), c = headCentre(P), X = [1, 0, 0], Z = [0, 0, 1], segs = 14;
  tube(S, [{ c: add3(c, [0, 0.028, -0.004]), u: X, v: Z, rx: 0.085 * sc, rf: 0.096 * sc, rb: 0.106 * sc, k, slot: SLOT.extra, ao: 0.8 },
    { c: add3(c, [0, 0.085, 0.0]), u: X, v: Z, rx: 0.09 * sc, rf: 0.102 * sc, rb: 0.106 * sc, k, slot: SLOT.extra, ao: 1 },
    { c: add3(c, [0, 0.112, 0.014]), u: X, v: Z, rx: 0.097 * sc, rf: 0.12 * sc, rb: 0.102 * sc, k, slot: SLOT.extra, ao: 1 }], segs, { vr: V.cap, capB: { h: 0.004 } });
  { const n = 8, pts = []; for (let i = 0; i <= n; i++) { const a = (i / n - 0.5) * 2.4; pts.push([Math.sin(a) * 0.09 * sc, Math.cos(a) * 0.1 * sc]); }
    const top = pts.map(([x, z]) => S.vert(add3(c, [x, 0.034, z]), k.b0, k.b1, k.w, SLOT.trim, 0.9, V.cap)), tip = pts.map(([x, z]) => S.vert(add3(c, [x * 1.02, 0.026 - 0.012 * Math.cos(x * 12), z + 0.06 * Math.cos(x / 0.09)]), k.b0, k.b1, k.w, SLOT.trim, 0.85, V.cap));
    for (let i = 0; i < n; i++) { S.tri(top[i], tip[i], tip[i + 1]); S.tri(top[i], tip[i + 1], top[i + 1]); S.tri(top[i], tip[i + 1], tip[i]); S.tri(top[i], top[i + 1], tip[i + 1]); } }
  tube(S, [{ c: add3(c, [0, 0.025, 0]), u: X, v: Z, rx: 0.087 * sc, rf: 0.099 * sc, rb: 0.108 * sc, k, slot: SLOT.extra, ao: 0.8 },
    { c: add3(c, [0, 0.1, 0]), u: X, v: Z, rx: 0.09 * sc, rf: 0.1 * sc, rb: 0.106 * sc, k, slot: SLOT.extra, ao: 1 },
    { c: add3(c, [0, 0.132, 0]), u: X, v: Z, rx: 0.06 * sc, rf: 0.065 * sc, rb: 0.068 * sc, k, slot: SLOT.extra, ao: 1 }], segs, { vr: V.hat, capB: { h: 0.008 } });
  const brim = [{ c: add3(c, [0, 0.028, 0]), u: X, v: Z, rx: 0.09 * sc, rf: 0.102 * sc, rb: 0.11 * sc, k, slot: SLOT.extra, ao: 0.9 },
    { c: add3(c, [0, 0.008, 0]), u: X, v: Z, rx: 0.2 * sc, rf: 0.21 * sc, rb: 0.21 * sc, k, slot: SLOT.extra, ao: 1 }];
  tube(S, brim, 18, { vr: V.hat }); tube(S, brim, 18, { vr: V.hat, flip: true });
}

/** A hand: palm and fingers as one tapering, slightly cupped mitten, and a thumb. s: 1 left, -1 right. */
function hand(S, P, s, lod) {
  const hb = s > 0 ? B.handL : B.handR, w = P.J[hb], k = bind(hb), sc = P.sex ? 0.9 : 1;
  const rows = lod ? [[-0.01, 0.022, 0.03], [0.09, 0.017, 0.044], [0.165, 0.008, 0.026]] : [[-0.012, 0.021, 0.028], [0.05, 0.019, 0.044], [0.1, 0.016, 0.046], [0.145, 0.012, 0.038], [0.18, 0.007, 0.02]];
  const rings = rows.map(([d, tx, tz], i) => { const curl = ss(0.06, 0.18, d) * 0.03; return { c: [w[0] - s * curl * sc + s * 0.003, w[1] - d * sc, w[2] + 0.004 + curl * 0.4], u: [1, 0, 0], v: [0, 0, 1], rx: tx * sc, rf: tz * sc, rb: tz * sc, n: 2.8, k: i ? k : bind(hb, s > 0 ? B.faL : B.faR, 0.3), slot: SLOT.skin, ao: 1 - 0.08 * i / rows.length }; });
  tube(S, rings, lod ? 4 : 7, { capA: { h: -0.004 }, capB: { h: 0.008 } });
  if (lod) return;
  const base = [w[0] - s * 0.008 * sc, w[1] - 0.028 * sc, w[2] + 0.026 * sc], tip = [w[0] - s * 0.022 * sc, w[1] - 0.085 * sc, w[2] + 0.042 * sc];
  tube(S, along(base, tip, [[0, 0.012 * sc, 0.014 * sc, 0.014 * sc, k, SLOT.skin, 0.95], [0.6, 0.0095 * sc, 0.0095 * sc, 0.0095 * sc, k, SLOT.skin, 1], [1, 0.007 * sc, 0.007 * sc, 0.007 * sc, k, SLOT.skin, 1]]), 5, { capB: { h: 0.006 } });
}

/** A trainer: one tube from heel to toe, the lower vertices of each ring in the sole's colour. s: 1 left, -1 right. */
function shoe(S, P, s, lod) {
  const fb = s > 0 ? B.footL : B.footR, a = P.J[fb], k = bind(fb), sc = P.sex ? 0.92 : 1, x = a[0] + s * 0.004;
  const len = 0.27 * sc, heel = a[2] - 0.078 * sc, segs = LODS[lod].foot;
  const prof = lod === 2 ? [[0.0, 0.03, 0.08], [0.5, 0.044, 0.07], [1.0, 0.024, 0.032]] : lod === 1 ? [[0.0, 0.031, 0.085], [0.3, 0.043, 0.092], [0.75, 0.046, 0.055], [1.0, 0.024, 0.03]]
    : [[0.0, 0.03, 0.08], [0.07, 0.038, 0.098], [0.32, 0.043, 0.094], [0.58, 0.048, 0.064], [0.82, 0.045, 0.048], [0.95, 0.035, 0.037], [1.0, 0.021, 0.026]];
  const rings = prof.map(([t, hw, top], i) => ({ c: [x + s * 0.004 * t, top / 2, heel + t * len], u: [1, 0, 0], v: [0, 1, 0], rx: hw * sc, rf: top / 2, rb: top / 2, n: 3.2, k, slot: SLOT.shoe, ao: i === 0 ? 0.9 : 1,
    slotAt: an => (Math.sin(an) < -0.45 ? SLOT.sole : SLOT.shoe) }));
  tube(S, rings, segs, { capA: { h: -0.008 }, capB: { h: 0.012 }, a0: Math.PI / segs });
}

// ---- carried things (a second mesh: same skinning, its own variant mask) --------------------------------------------------
function buildCarried(P) {
  const S = new Shape(), J = P.J, X = [1, 0, 0], Z = [0, 0, 1], Y = [0, 1, 0], sc = P.sex ? 0.93 : 1;
  const box = (c, hx, hy, hz, k, slot, vr, ao = 1, n = 6) => tube(S, [
    { c: add3(c, [0, 0, -hz]), u: X, v: Y, rx: hx * 0.9, rf: hy * 0.9, rb: hy * 0.9, n, k, slot, ao: ao * 0.9 },
    { c: add3(c, [0, 0, -hz * 0.8]), u: X, v: Y, rx: hx, rf: hy, rb: hy, n, k, slot, ao },
    { c: add3(c, [0, 0, hz * 0.8]), u: X, v: Y, rx: hx, rf: hy, rb: hy, n, k, slot, ao },
    { c: add3(c, [0, 0, hz]), u: X, v: Y, rx: hx * 0.9, rf: hy * 0.9, rb: hy * 0.9, n, k, slot, ao: ao * 0.9 }], 10, { vr, capA: { h: 0 }, capB: { h: 0 } });
  // backpack: a soft box on the back, a front pocket, two straps over the shoulders
  { const ch = J[B.chest], c = [0, ch[1] + 0.02 * sc, ch[2] - 0.17 * sc], kk = bind(B.chest, B.spine, 0.15);
    tube(S, [
      { c: add3(c, [0, -0.2 * sc, 0]), u: X, v: Z, rx: 0.13 * sc, rf: 0.055, rb: 0.06, n: 4, k: bind(B.chest, B.spine, 0.4), slot: SLOT.bag, ao: 0.8 },
      { c: add3(c, [0, -0.17 * sc, 0.002]), u: X, v: Z, rx: 0.15 * sc, rf: 0.065, rb: 0.075, n: 4, k: bind(B.chest, B.spine, 0.35), slot: SLOT.bag, ao: 0.95 },
      { c: add3(c, [0, 0.12 * sc, -0.004]), u: X, v: Z, rx: 0.15 * sc, rf: 0.06, rb: 0.07, n: 4, k: kk, slot: SLOT.bag, ao: 1 },
      { c: add3(c, [0, 0.2 * sc, 0.004]), u: X, v: Z, rx: 0.12 * sc, rf: 0.045, rb: 0.05, n: 3, k: kk, slot: SLOT.bag, ao: 1 }], 12, { vr: A.backpack, capA: { h: -0.01 }, capB: { h: 0.02 } });
    box(add3(c, [0, -0.08 * sc, -0.08]), 0.1 * sc, 0.07 * sc, 0.03, bind(B.chest, B.spine, 0.3), SLOT.bagTrim, A.backpack, 0.9, 5);
    for (const s of [1, -1]) {
      const top = [s * 0.085 * sc, J[B.neck][1] - 0.01, ch[2] - 0.02], front = [s * 0.105 * sc, ch[1] + 0.13 * sc, ch[2] + 0.1 * sc], low = [s * 0.13 * sc, ch[1] - 0.06 * sc, ch[2] + 0.075 * sc], under = [s * 0.15 * sc, ch[1] - 0.1 * sc, ch[2] - 0.08 * sc];
      const back = [s * 0.08 * sc, ch[1] + 0.2 * sc, ch[2] - 0.12 * sc], path = [back, top, front, low, under], kk2 = bind(B.chest);
      for (let i = 0; i < path.length - 1; i++) {
        const a = path[i], b = path[i + 1], d = norm3(sub3(b, a)), side = norm3(cross3(d, [s, 0, 0])), w = 0.022, out = [s * 0.005, 0.004, 0];
        const q = [add3(add3(a, side, w), out), add3(add3(a, side, -w), out), add3(add3(b, side, -w), out), add3(add3(b, side, w), out)].map(p => S.vert(p, kk2.b0, kk2.b1, kk2.w, SLOT.bagTrim, 0.85, A.backpack));
        S.tri(q[0], q[1], q[2]); S.tri(q[0], q[2], q[3]); S.tri(q[0], q[2], q[1]); S.tri(q[0], q[3], q[2]);
      }
    }
  }
  // the right hand: things are held with the grip about 7 cm below the wrist, along the hand's forward axis
  const hR = J[B.handR], g = [hR[0] + 0.012, hR[1] - 0.07 * sc, hR[2] + 0.01], kh = bind(B.handR);
  // water bottle, held upright in the hand
  tube(S, [[0, 0.033], [0.02, 0.036], [0.17, 0.036], [0.2, 0.03], [0.215, 0.018], [0.245, 0.018]].map(([y, r], i) => ({ c: add3(g, [0, y - 0.1, 0.03]), u: X, v: Z, rx: r, rf: r, rb: r, k: kh, slot: i >= 4 ? SLOT.item2 : SLOT.bottle, ao: 1 })), 10, { vr: A.bottle, capA: { h: 0 }, capB: { h: 0.004 } });
  // umbrella: a shaft through the fist, eight ribs, a shallow canopy with scalloped edge (both faces), a tip
  { const top = add3(g, [0, 0.95, 0.06]), segs = 16, R = 0.5, n = 3, ids = [];
    tube(S, along(add3(g, [0, -0.12, 0.0]), top, [[0, 0.008, 0.008, 0.008, kh, SLOT.item2, 1], [1, 0.006, 0.006, 0.006, kh, SLOT.item2, 1]]), 5, { vr: A.umbrella });
    for (let r = 0; r <= n; r++) { const row = []; for (let i = 0; i < segs; i++) { const a = i / segs * TAU, t = r / n, rr = R * t * (1 + (r === n ? -0.04 * Math.cos(a * 8) : 0)), y = 0.11 * (1 - t * t) - (r === n ? 0.02 * Math.cos(a * 8) : 0);
      row.push(S.vert(add3(top, [Math.cos(a) * rr, y - 0.11, Math.sin(a) * rr]), kh.b0, kh.b1, kh.w, SLOT.umbrella, r === 0 ? 1 : 0.95 + 0.05 * (i % 2), A.umbrella)); } ids.push(row); }
    for (let r = 0; r < n; r++) for (let i = 0; i < segs; i++) { const a = ids[r][i], b = ids[r][(i + 1) % segs], c = ids[r + 1][(i + 1) % segs], d = ids[r + 1][i]; S.tri(a, c, b); S.tri(a, d, c); S.tri(a, b, c); S.tri(a, c, d); }
    tube(S, along(add3(top, [0, -0.01, 0]), add3(top, [0, 0.06, 0]), [[0, 0.006, 0.006, 0.006, kh, SLOT.item2, 1], [1, 0.003, 0.003, 0.003, kh, SLOT.item2, 1]]), 5, { vr: A.umbrella }); }
  // books / a folder held against the side
  box(add3(g, [0.02, 0.02, 0.04]), 0.012, 0.12, 0.09, kh, SLOT.item, A.books, 1, 8);
  box(add3(g, [0.038, 0.02, 0.04]), 0.008, 0.118, 0.088, kh, SLOT.item2, A.books, 0.95, 8);
  box(add3(g, [0.02, 0.0, 0.03]), 0.008, 0.16, 0.115, kh, SLOT.item, A.folder, 1, 8);
  // phone in the hand
  box(add3(g, [-0.005, 0.03, 0.035]), 0.036, 0.006, 0.075, kh, SLOT.item2, A.phone, 1, 8);
  // broom: a long handle and a fan of bristles (a cleaner's bamboo broom)
  { const a = add3(g, [0, 0.6, 0.06]), b = add3(g, [0, -0.85, 0.02]);
    tube(S, along(a, b, [[0, 0.013, 0.013, 0.013, kh, SLOT.item, 1], [1, 0.013, 0.013, 0.013, kh, SLOT.item, 1]]), 6, { vr: A.broom });
    tube(S, along(b, add3(b, [0, -0.38, 0.06]), [[0, 0.03, 0.03, 0.03, kh, SLOT.item2, 0.8], [0.5, 0.11, 0.05, 0.05, kh, SLOT.item2, 0.9], [1, 0.17, 0.03, 0.03, kh, SLOT.item2, 1]]), 8, { vr: A.broom, capB: { h: 0.01 } }); }
  // watering can (gardener)
  { const c = add3(g, [0, -0.16, 0.03]);
    tube(S, [[0, 0.09], [0.02, 0.1], [0.2, 0.1], [0.23, 0.07]].map(([y, r]) => ({ c: add3(c, [0, y - 0.12, 0]), u: X, v: Z, rx: r * 0.8, rf: r, rb: r, k: kh, slot: SLOT.item, ao: 1 })), 10, { vr: A.can, capA: { h: 0 }, capB: { h: 0 } });
    tube(S, along(add3(c, [0, -0.06, 0.09]), add3(c, [0, 0.12, 0.33]), [[0, 0.018, 0.018, 0.018, kh, SLOT.item, 1], [1, 0.012, 0.012, 0.012, kh, SLOT.item, 1]]), 6, { vr: A.can });
    tube(S, along(add3(c, [0, 0.12, 0.33]), add3(c, [0, 0.12, 0.37]), [[0, 0.02, 0.02, 0.02, kh, SLOT.item, 1], [1, 0.035, 0.035, 0.035, kh, SLOT.item, 1]]), 8, { vr: A.can, capB: { h: 0 } }); }
  // shoulder bag (teachers): a flat bag at the left hip on a strap over the right shoulder
  { const pl = J[B.pelvis], c = [0.2 * sc, pl[1] + 0.02, pl[2] - 0.0], kk = bind(B.pelvis, B.spine, 0.3);
    box(c, 0.035, 0.11, 0.15, kk, SLOT.bag, A.shoulderBag, 1, 6);
    const ch = J[B.chest], path = [[0.2 * sc, pl[1] + 0.13, 0.0], [0.12 * sc, ch[1], ch[2] + 0.1], [-0.08 * sc, J[B.neck][1] - 0.01, ch[2] + 0.04], [-0.1 * sc, J[B.neck][1] - 0.03, ch[2] - 0.08], [0.18 * sc, pl[1] + 0.13, -0.05]];
    for (let i = 0; i < path.length - 1; i++) {
      const a = path[i], b = path[i + 1], d = norm3(sub3(b, a)), side = norm3(cross3(d, [0, 0, 1])), w = 0.016, kk2 = i === 0 || i === 3 ? bind(B.chest, B.pelvis, 0.4) : bind(B.chest);
      const q = [add3(a, side, w), add3(a, side, -w), add3(b, side, -w), add3(b, side, w)].map(p => S.vert(p, kk2.b0, kk2.b1, kk2.w, SLOT.bagTrim, 0.85, A.shoulderBag));
      S.tri(q[0], q[1], q[2]); S.tri(q[0], q[2], q[3]); S.tri(q[0], q[2], q[1]); S.tri(q[0], q[3], q[2]);
    } }
  return S;
}

// ---- to three.js ---------------------------------------------------------------------------------------------------------
function normals(S) {
  const n = new Float32Array(S.pos.length), p = S.pos;
  for (let i = 0; i < S.idx.length; i += 3) {
    const a = S.idx[i] * 3, b = S.idx[i + 1] * 3, c = S.idx[i + 2] * 3;
    const ux = p[b] - p[a], uy = p[b + 1] - p[a + 1], uz = p[b + 2] - p[a + 2], vx = p[c] - p[a], vy = p[c + 1] - p[a + 1], vz = p[c + 2] - p[a + 2];
    const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
    for (const q of [a, b, c]) { n[q] += nx; n[q + 1] += ny; n[q + 2] += nz; }
  }
  for (let i = 0; i < n.length; i += 3) { const l = Math.hypot(n[i], n[i + 1], n[i + 2]) || 1; n[i] /= l; n[i + 1] /= l; n[i + 2] /= l; }
  return n;
}
function toGeometry(M, F) {
  if (M.pos.length !== F.pos.length || M.idx.length !== F.idx.length) throw new Error('body shapes differ: ' + M.pos.length + ' / ' + F.pos.length);
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(M.pos, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(normals(M), 3));
  g.setAttribute('aPosF', new THREE.Float32BufferAttribute(F.pos, 3));
  g.setAttribute('aNorF', new THREE.Float32BufferAttribute(normals(F), 3));
  g.setAttribute('aSkin', new THREE.Float32BufferAttribute(M.skin, 4));
  g.setAttribute('aVar', new THREE.Float32BufferAttribute(M.vr, 1));
  const c = new Float32Array(M.ao.length * 3); M.ao.forEach((a, i) => { c[i * 3] = c[i * 3 + 1] = c[i * 3 + 2] = a; });
  g.setAttribute('color', new THREE.Float32BufferAttribute(c, 3));
  g.setIndex(M.idx);
  g.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0.9, 0), 1.6); g.boundingBox = new THREE.Box3(new THREE.Vector3(-1, -0.1, -1), new THREE.Vector3(1, 2.4, 1));
  return g;
}
const cache = {};
/** Geometry of the body at a level of detail (0 near, 1 middle, 2 far). */
export function bodyGeometry(lod) { return cache['b' + lod] || (cache['b' + lod] = toGeometry(buildBody(PM, lod), buildBody(PF, lod))); }
/** Geometry of the carried things (near only). */
export function carriedGeometry() { return cache.c || (cache.c = toGeometry(buildCarried(PM), buildCarried(PF))); }
