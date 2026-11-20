// Link walkway along the west ends of the two east teaching slabs (link-corridor-west) and the small roof at its north end
// (link-corridor-north-pavilion): an ELEVATED DECK WITH PARAPETS on columns, open underneath.
//
// HEIGHT: both data items say 7.8 m. The builder does not read item.height: the deck's walking surface is at its own
// constant DECK = 7.8 m, the parapet tops at 8.85 m; if the data height is changed, DECK must be changed too. Reasons for
// 7.8 m: in the 2018 footage (the frames between sampled frames 7 and 8, camera above the south slab looking west) the white
// structure meets the south slab's north-west corner between the third and fourth window rows counted from the roof, which
// is the floor of the third storey (2 x 3.9 m); the study of the satellite image that located the clock tower got 7 to 8 m
// for its top from the shadows.
//
// SEEN in those frames: a narrow white structure along the east edge of the open paving, leaving the south slab's north-west
//   corner toward the north; from above it shows two raised white edges with a grey surface between them (read as parapets
//   and a deck: the white edges are about a quarter of the width). On the satellite image: a white ribbon-like strip about
//   3.3 m wide and 56 m long, bright where sunlit, and a small white rectangle with a parapet outline at its north end.
//
// ASSUMED: that it is one deck only, open underneath; the columns (0.4 m square, a pair at every bend of the measured
//   outline, 5.5 to 8.3 m apart), the beams, the slab thickness, the parapet height (1.05 m).
//
// IMAGINED (the owner asked for a finished, usable walkway; nothing of this is in a reference):
//   - how one gets onto it: a footbridge at deck level from the glass stair block beside the clock tower (its stair is real,
//     see stair-core.js); short spurs to a door in the west end wall of each teaching slab at its third-storey landing (the
//     doors are drawn closed: those walls belong to teaching-slab.js and have no opening); and, north of the end bay, an
//     open-air dog-leg stair from the ground (two storeys of 3.9 m, a landing under the end bay at 3.9 m, a dark-red blade
//     wall behind the half landings, a store under the first flight);
//   - the end bay (the small white rectangle of the satellite image) drawn as the deck's last bay under a flat white roof
//     on four posts;
//   - finishes: granite floor slabs, a stainless rail on the parapets, scuppers with dirt streaks below them and under the
//     copings, dark tile round the column feet, lamps under the deck (they light the paved strip below after dusk) and
//     low lamps in the parapets, planter boxes at two bends, a paved strip with kerbs on the ground.
// Where the measured outline runs into a neighbouring building (it overlaps the block north-east of the canopy by up to
// 1 m), the columns that would stand inside that building are left out.
// Colliders: columns, the deck, the parapets (1.75 m tall for the player, so that a jump does not clear them), bridge and
// spurs, the end bay's roof, the stair (ramps, landings, balustrades, blade wall, the store).
import { THREE, flat, bbox, itemPolygon } from '../../kit.js';
import { polyGeometry } from '../../shapes.js';
import { LIT } from '../../street.js';
import { shrubs } from '../../flora.js';
import { F, lm, shell, finish, hit, face, doorSet, stair, stainMat, textCard, card, apron } from './plain-block.js';
import { pavingMaterial, blockedBy, inPoly, fuse } from './plaza.js';

export const DECK = 7.8;
/** The paved strips under all walkway outlines as one mesh. */
function pavedStrip(polys) {
  const m = new THREE.Mesh(fuse(polys.map(p => [polyGeometry(p, 0.045), new THREE.Matrix4()])), pavingMaterial()); m.receiveShadow = true; m.name = 'walkway-paving'; return m;
}
const SLAB = 0.25, PARAPET = 1.05, COL = 0.4, GUARD = 1.75;

/** x where the polygon's west ('W') or east ('E') side crosses the line z, or null. */
function sideX(pts, z, side) {
  let x = null;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, zi] = pts[i], [xj, zj] = pts[j];
    if ((zi > z) !== (zj > z)) { const xx = xi + (xj - xi) * (z - zi) / (zj - zi); x = x === null ? xx : side === 'W' ? Math.min(x, xx) : Math.max(x, xx); }
  }
  return x;
}
/**
 * The footbridge between the glass stair block and the deck: { x0 (the block's east face), x1a, x1b (the deck's west edge at
 * z0 and z1), z0, z1, y } or null when the two do not face each other. stair-core.js puts its doorway where this says.
 */
export function bridgeSpec(campus) {
  const items = campus ? campus.items : [], g = items.find(i => i.id === 'glass-stair-block'), w = items.find(i => i.id === 'link-corridor-west');
  if (!g || !w) return null;
  const b = bbox(itemPolygon(g)), z0 = b.n + 0.8, z1 = b.n + 2.5, x1a = sideX(w.points, z0, 'W'), x1b = sideX(w.points, z1, 'W');
  if (x1a === null || x1b === null || Math.min(x1a, x1b) - b.e < 0.4 || Math.max(x1a, x1b) - b.e > 6) return null;
  return { x0: b.e, x1a, x1b, z0, z1, y: DECK };
}
/** Spurs from the deck to the west end walls of the teaching slabs: [{ wallX, z0, z1, xa, xb }]. The door is 1.3 m wide in the middle. */
function spurSpecs(campus, pts) {
  const out = [];
  for (const it of campus ? campus.items : []) if (it.style === 'teaching-slab' && it.mainBar) {
    const wallX = it.mainBar.w + 0.3, zd = it.mainBar.s - 2.6, z0 = zd - 0.85, z1 = zd + 0.85, xa = sideX(pts, z0, 'E'), xb = sideX(pts, z1, 'E');
    if (xa === null || xb === null || wallX - Math.max(xa, xb) < 0.25 || wallX - Math.min(xa, xb) > 5) continue;
    out.push({ wallX, z0, z1, xa, xb, zd });
  }
  return out;
}

export function build(item, ctx) {
  const S = shell(ctx), pts = item.points, N = pts.length, quad = N === 4;
  const WH = lm('white'), CO = lm('concrete'), CP = lm('cope'), PL = lm('plaster'), FL = lm('granite'), BS = lm('base'), SS = lm('steel'), LAMP = lm('lamp'), PVC = lm('pvc'), MR = lm('maroon');
  const others = (ctx.campus ? ctx.campus.items : []).filter(i => i !== item && i.id !== item.id && i.style === item.style && i.points);
  const shared = (p, q) => others.some(o => [p, q].every(a => o.points.some(b => Math.hypot(a[0] - b[0], a[1] - b[1]) < 0.06)));
  const blocked = blockedBy(ctx, item);
  const cxm = pts.reduce((a, p) => a + p[0], 0) / N, czm = pts.reduce((a, p) => a + p[1], 0) / N;
  const openings = [];                                                       // [[x, z], [x, z]]: stretches of the outline without a parapet

  // ---- the end bay: is there room north of it for the stair?
  let st = null;
  if (quad) {
    const zN = Math.min(...pts.map(p => p[1])), north = pts.filter(p => Math.abs(p[1] - zN) < 0.05).map(p => p[0]);
    if (north.length === 2) { const xc = (north[0] + north[1]) / 2; if (Math.abs(north[0] - north[1]) > 3.3 && !blocked(xc, zN - 3.2, 2.2) && !blocked(xc, zN - 5.6, 1.8)) st = { xc, zN, x0: Math.min(...north), x1: Math.max(...north) }; }
    if (st) openings.push([[st.xc - 1.5, st.zN], [st.xc - 0.1, st.zN]]);
  }
  // ---- the long deck: bridge and spurs
  const bridge = quad ? null : bridgeSpec(ctx.campus), spurs = quad ? [] : spurSpecs(ctx.campus, pts);
  if (bridge) openings.push([[bridge.x1a, bridge.z0], [bridge.x1b, bridge.z1]]);
  for (const sp of spurs) openings.push([[sp.xa, sp.z0], [sp.xb, sp.z1]]);

  // ---- cross-sections: the outline lists one long side and then the other one backwards
  const n = N / 2, sec = [];
  for (let i = 0; i < n; i++) sec.push([pts[i], pts[N - 1 - i]]);
  const hq = (b, m, a, bb, c, d, y, faceUp) => {                              // horizontal quad through four outline points, facing up or down
    const area = (bb[0] - a[0]) * (d[1] - a[1]) - (bb[1] - a[1]) * (d[0] - a[0]);
    const o = (area < 0) === faceUp ? [a, bb, c, d] : [a, d, c, bb];
    b.quad(m, ...o.map(p => [p[0], y, p[1]]));
  };
  S.v.frame(); S.c.frame();
  for (let i = 0; i + 1 < n; i++) {
    const [a0, b0] = sec[i], [a1, b1] = sec[i + 1];
    hq(S.v, FL, a0, a1, b1, b0, DECK, true); hq(S.v, PL, a0, a1, b1, b0, DECK - SLAB, false);
    hq(S.c, 'generic', a0, a1, b1, b0, DECK, true);
    const mx = (a0[0] + a1[0] + b0[0] + b1[0]) / 4, mz = (a0[1] + a1[1] + b0[1] + b1[1]) / 4;
    F(S.d, lm('frame'), mx - 0.2, DECK - SLAB - 0.04, mz - 0.2, 0.4, 0.04, 0.4, 'NSEW'); F(S.d, LAMP, mx - 0.17, DECK - SLAB - 0.05, mz - 0.17, 0.34, 0.012, 0.34, 'D');   // lamp under the deck
    if (!blocked(mx, mz, 0.5)) LIT.push([mx, mz, 4.2]);
  }

  // ---- along every edge of the outline: edge beam, slab edge, parapet with coping and rail, scuppers, kerb on the ground
  const SM = S.low ? null : stainMat(0.6);
  for (let i = 0; i < N; i++) {
    const p = pts[i], q = pts[(i + 1) % N];
    if (shared(p, q)) continue;
    const dx = q[0] - p[0], dz = q[1] - p[1], len = Math.hypot(dx, dz), ang = Math.atan2(-dz, dx), ux = dx / len, uz = dz / len;
    const nx = Math.sin(ang), nz = Math.cos(ang), s = inPoly(pts, (p[0] + q[0]) / 2 + nx * 0.05, (p[1] + q[1]) / 2 + nz * 0.05) ? 1 : -1;   // s: which local z is inside
    const e = 0.03;                                                            // small overlap at the bends
    // gaps of this edge, as distances from p
    const gaps = [];
    for (const [A, B] of openings) {
      const sa = (A[0] - p[0]) * ux + (A[1] - p[1]) * uz, sb = (B[0] - p[0]) * ux + (B[1] - p[1]) * uz, da = Math.abs((A[0] - p[0]) * uz - (A[1] - p[1]) * ux), db = Math.abs((B[0] - p[0]) * uz - (B[1] - p[1]) * ux);
      if (da < 0.3 && db < 0.3 && Math.max(sa, sb) > 0.05 && Math.min(sa, sb) < len - 0.05) gaps.push([Math.max(-e, Math.min(sa, sb)), Math.min(len + e, Math.max(sa, sb))]);
    }
    gaps.sort((a, b) => a[0] - b[0]);
    const pieces = []; let t = -e; for (const [g0, g1] of gaps) { if (g0 > t + 0.02) pieces.push([t, g0]); t = Math.max(t, g1); } if (len + e > t + 0.02) pieces.push([t, len + e]);
    S.v.frame(p[0], p[1], ang); S.d.frame(p[0], p[1], ang); S.c.frame(p[0], p[1], ang);
    S.v.box(WH, len / 2, DECK - (0.5 + SLAB) / 2, s * 0.15, len + 2 * e, 0.5 + SLAB, 0.3, 'U');                 // edge beam and slab edge
    for (const [t0, t1] of pieces) {
      const L = t1 - t0, c = (t0 + t1) / 2;
      S.v.box(WH, c, DECK + PARAPET / 2, s * 0.075, L, PARAPET, 0.15, 'UD');                                  // parapet
      S.v.box(CP, c, DECK + PARAPET + 0.025, s * 0.075, L + 0.02, 0.05, 0.21);                                // coping
      S.c.box('generic', c, DECK + GUARD / 2 + 0.01, s * 0.075, L, GUARD, 0.15);
      S.d.box(SS, c, DECK + PARAPET + 0.16, s * 0.075, L, 0.04, 0.04);                                         // stainless rail on short posts
      for (let x = t0 + 0.25; x < t1 - 0.1; x += 1.5) S.d.box(SS, x, DECK + PARAPET + 0.095, s * 0.075, 0.025, 0.09, 0.025, 'UD');
      if (SM && L > 1) {                                                                                       // dirt under the coping, outside
        const z = -s * 0.012, y1 = DECK + PARAPET, y0 = y1 - 0.6;
        if (s > 0) S.d.quad(SM, [t1, y0, z], [t0, y0, z], [t0, y1, z], [t1, y1, z]); else S.d.quad(SM, [t0, y0, z], [t1, y0, z], [t1, y1, z], [t0, y1, z]);
      }
      for (let x = t0 + 1.2; x < t1 - 0.6; x += 3.2) S.d.box(LAMP, x, DECK + 0.32, s * 0.158, 0.36, 0.05, 0.016, 'UDEW' + (s > 0 ? 'N' : 'S'));   // low lamps in the parapet
    }
    for (let x = 2.2; x < len - 1; x += 5.6) {                                                                 // scuppers with a streak below each
      S.d.box(PVC, x, DECK - 0.03, -s * 0.07, 0.09, 0.06, 0.16, s > 0 ? 'S' : 'N');
      if (SM) { const z = -s * 0.014, y1 = DECK - 0.06, y0 = y1 - 0.6; if (s > 0) S.d.quad(SM, [x + 0.25, y0, z], [x - 0.25, y0, z], [x - 0.25, y1, z], [x + 0.25, y1, z]); else S.d.quad(SM, [x - 0.25, y0, z], [x + 0.25, y0, z], [x + 0.25, y1, z], [x - 0.25, y1, z]); }
    }
    const end = !quad && (i === n - 1 || i === N - 1);                         // the two short end edges of the strip get no kerb
    if (!end && !blocked((p[0] + q[0]) / 2, (p[1] + q[1]) / 2, 0.3) && !(st && Math.abs(p[1] - st.zN) < 0.05 && Math.abs(q[1] - st.zN) < 0.05)) S.d.box(CP, len / 2, 0.06, s * 0.06, len, 0.12, 0.12, 'D');
  }
  S.v.frame(); S.d.frame(); S.c.frame();

  // ---- columns with a cross beam between each pair
  const column = (x, z, wx = COL, wz = COL) => {
    if (blocked(x, z, COL / 2 + 0.05)) return false;
    F(S.v, WH, x - wx / 2, 0, z - wz / 2, wx, DECK - SLAB, wz, 'NSEW'); F(S.v, BS, x - wx / 2 - 0.015, 0, z - wz / 2 - 0.015, wx + 0.03, 0.5, wz + 0.03, 'NSEWU');
    F(S.d, CO, x - wx / 2 - 0.06, 0, z - wz / 2 - 0.06, wx + 0.12, 0.08, wz + 0.12, 'NSEWU');
    F(S.c, 'generic', x - wx / 2, 0, z - wz / 2, wx, DECK - SLAB, wz, 'NSEW');
    return true;
  };
  const inset = 0.5;
  if (quad) {
    for (const p of pts) {
      if (st && Math.abs(p[1] - st.zN) < 0.05) { column(p[0] + (p[0] < st.xc ? 0.15 : -0.15), st.zN + 0.2, 0.3, 0.4); continue; }   // slim columns beside the stair lanes
      const d = Math.hypot(cxm - p[0], czm - p[1]); column(p[0] + (cxm - p[0]) * inset * 1.4 / d, p[1] + (czm - p[1]) * inset * 1.4 / d);
    }
  } else for (let i = 0; i < n; i++) {
    const [a, b] = sec[i], w = Math.hypot(b[0] - a[0], b[1] - a[1]), t = inset / w;
    // the two end pairs stand 0.6 m in from the ends of the deck
    const o = sec[i === 0 ? 1 : i === n - 1 ? n - 2 : i], along = i === 0 || i === n - 1 ? 0.6 / Math.hypot((o[0][0] + o[1][0] - a[0] - b[0]) / 2, (o[0][1] + o[1][1] - a[1] - b[1]) / 2) : 0;
    const sx = ((o[0][0] + o[1][0]) / 2 - (a[0] + b[0]) / 2) * along, sz = ((o[0][1] + o[1][1]) / 2 - (a[1] + b[1]) / 2) * along;
    const c1 = [a[0] + (b[0] - a[0]) * t + sx, a[1] + (b[1] - a[1]) * t + sz], c2 = [b[0] + (a[0] - b[0]) * t + sx, b[1] + (a[1] - b[1]) * t + sz];
    const k1 = column(...c1), k2 = column(...c2);
    if (k1 || k2) {                                                            // cross beam, also where one end rests on a neighbouring building
      const ang = Math.atan2(-(c2[1] - c1[1]), c2[0] - c1[0]), len = Math.hypot(c2[0] - c1[0], c2[1] - c1[1]);
      S.v.frame(c1[0], c1[1], ang).box(WH, len / 2, DECK - SLAB - 0.25, 0, len, 0.5, 0.3, 'UEW'); S.v.frame();
    }
  }

  // ---- an axis-parallel piece of deck between x0..x1 (given at z0 and at z1) with parapets along its two sides
  const piece = (xa0, xa1, xb0, xb1, z0, z1, brackets) => {
    S.v.quad(FL, [xa0, DECK, z0], [xb0, DECK, z1], [xb1, DECK, z1], [xa1, DECK, z0]); S.v.quad(PL, [xa0, DECK - SLAB, z0], [xa1, DECK - SLAB, z0], [xb1, DECK - SLAB, z1], [xb0, DECK - SLAB, z1]);
    S.c.quad('generic', [xa0 - 0.2, DECK, z0], [xb0 - 0.2, DECK, z1], [xb1 + 0.2, DECK, z1], [xa1 + 0.2, DECK, z0]);
    for (const [z, x0, x1, out] of [[z0, xa0, xa1, -1], [z1, xb0, xb1, 1]]) {
      const zw = out > 0 ? z : z - 0.15, L = x1 - x0;
      F(S.v, WH, x0, DECK - 0.5 - SLAB, out > 0 ? z - 0.15 : z - 0.15, L, 0.5 + SLAB, 0.3, 'NSD');
      F(S.v, WH, x0, DECK, zw, L, PARAPET, 0.15, 'NS'); F(S.v, CP, x0, DECK + PARAPET, zw - 0.03, L, 0.05, 0.21, 'NSUD'); F(S.c, 'generic', x0, DECK + 0.01, zw, L, GUARD, 0.15);
      F(S.d, SS, x0, DECK + PARAPET + 0.14, zw + 0.055, L, 0.04, 0.04, 'NSUD');
    }
    if (brackets) for (const z of [z0 + 0.1, z1 - 0.3]) F(S.v, WH, Math.min(xa0, xb0) - 0.2, DECK - SLAB - 0.45, z, Math.max(xa1, xb1) - Math.min(xa0, xb0) + 0.2, 0.45, 0.2, 'NSD');
  };
  if (bridge) { piece(bridge.x0, bridge.x1a + 0.02, bridge.x0, bridge.x1b + 0.02, bridge.z0, bridge.z1, false); if (ctx.occupy) ctx.occupy([[bridge.x0, bridge.z0 - 0.3], [bridge.x1b, bridge.z0 - 0.3], [bridge.x1b, bridge.z1 + 0.3], [bridge.x0, bridge.z1 + 0.3]]); }
  for (const sp of spurs) {
    piece(sp.xa - 0.02, sp.wallX - 0.02, sp.xb - 0.02, sp.wallX - 0.02, sp.z0, sp.z1, true);
    if (ctx.occupy) ctx.occupy([[sp.xa, sp.z0 - 0.3], [sp.wallX, sp.z0 - 0.3], [sp.wallX, sp.z1 + 0.3], [sp.xa, sp.z1 + 0.3]]);
    // a closed door on the slab's wall, where its third-storey landing lies behind
    const put = face('W', sp.wallX - 0.09);
    doorSet(S, put, sp.zd, { w: 1.3, h: 2.1, y0: DECK, rev: 0.05, canopy: 0.75, step: false, plateMat: textCard('3F', 0.28, 0.18) });
    put(S.v, WH, sp.zd - 0.9, sp.zd + 0.9, DECK, DECK + 2.4, -0.085, -0.075, 'F');                                // the wall face behind the frame
    hit(S, sp.wallX - 0.1, DECK + 0.01, sp.z0 - 0.15, 0.08, 2.6, sp.z1 - sp.z0 + 0.3);                           // closed, whether or not the slab's wall is there
  }

  // ---- planter boxes on the deck at two bends (near view)
  const bushes = [];
  if (!quad && !S.low) for (const i of [3, 6]) if (i < n) {
    const [a, b] = sec[i], mx = (a[0] + b[0]) / 2, mz = (a[1] + b[1]) / 2, w = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / w, uz = (b[1] - a[1]) / w;
    for (const k of [-1, 1]) {
      const px = mx + ux * k * (w / 2 - 0.5), pz = mz + uz * k * (w / 2 - 0.5);
      F(S.d, lm('stoneLight'), px - 0.22, DECK, pz - 0.6, 0.44, 0.45, 1.2, 'NSEW'); F(S.d, lm('soil'), px - 0.18, DECK + 0.4, pz - 0.56, 0.36, 0.01, 1.12, 'U');
      for (const dz of [-0.36, 0, 0.36]) bushes.push([px, pz + dz, 0.22]);
      F(S.c, 'generic', px - 0.22, DECK + 0.01, pz - 0.6, 0.44, 0.6, 1.2);
    }
  }
  if (bushes.length) { const sh = shrubs(bushes, { seed: 21, hex: 0x3a6a30 }); sh.position.y = DECK + 0.4; sh.castShadow = false; S.dx.push(sh); }

  // ---- the end bay: a flat white roof on four posts, and the stair from the ground
  if (quad) {
    const yR = DECK + 2.9, k = 1.12, rp = pts.map(p => [cxm + (p[0] - cxm) * k, czm + (p[1] - czm) * k]);
    hq(S.v, lm('roofPale'), rp[0], rp[1], rp[2], rp[3], yR + 0.2, true); hq(S.v, PL, rp[0], rp[1], rp[2], rp[3], yR, false); hq(S.c, 'generic', rp[0], rp[1], rp[2], rp[3], yR + 0.2, true);
    for (let i = 0; i < 4; i++) {
      const p = rp[i], q = rp[(i + 1) % 4], len = Math.hypot(q[0] - p[0], q[1] - p[1]), ang = Math.atan2(-(q[1] - p[1]), q[0] - p[0]), s = inPoly(rp, (p[0] + q[0]) / 2 + Math.sin(ang) * 0.05, (p[1] + q[1]) / 2 + Math.cos(ang) * 0.05) ? 1 : -1;
      S.v.frame(p[0], p[1], ang).box(WH, len / 2, yR + 0.16, s * 0.05, len + 0.1, 0.36, 0.1); S.v.frame();
      const c = pts[i], d = Math.hypot(cxm - c[0], czm - c[1]), px = c[0] + (cxm - c[0]) * 0.11 / d, pz = c[1] + (czm - c[1]) * 0.11 / d;
      F(S.v, lm('frame'), px - 0.06, DECK + PARAPET, pz - 0.06, 0.12, yR - DECK - PARAPET, 0.12, 'NSEW');
    }
    F(S.d, lm('frame'), cxm - 0.3, yR - 0.05, czm - 0.3, 0.6, 0.05, 0.6, 'NSEW'); F(S.d, LAMP, cxm - 0.26, yR - 0.06, czm - 0.26, 0.52, 0.012, 0.52, 'D');
  }
  if (st) {
    const { xc, zN } = st, FH = DECK / 2, run = 13 * 0.28, landB = 1.4, tw = 0.12, xw = xc - 1.5 - tw, xe = xc + 1.5 + tw, zH = zN - run, zE = zH - landB;
    if (ctx.occupy) ctx.occupy([[xw - 0.3, zE - 0.4], [xe + 0.3, zE - 0.4], [xe + 0.3, zN + 1.7], [xw - 0.3, zN + 1.7]]);
    stair(S, { x: xc, z: zN, ang: Math.PI / 2, levels: [0, FH, DECK], w: 1.4, gap: 0.2, landB, spine: true, outer: true, outerEnd: false, tread: lm('stone'), landing: lm('granite'), wallRail: false });
    // landing at mid height under the end bay: slab, walls on three sides, two posts
    const zL = zN + 1.6;
    F(S.v, FL, xw, FH - 0.02, zN, xe - xw, 0.02, zL - zN, 'U'); F(S.v, PL, xw, FH - 0.2, zN, xe - xw, 0.18, zL - zN, 'DNSEW'); hit(S, xw, FH - 0.2, zN - 0.2, xe - xw, 0.2, zL - zN + 0.2);
    for (const [x, z, sx, sz] of [[xw, zL - tw, xe - xw, tw], [xw, zN + 0.42, tw, zL - zN - 0.42 - tw], [xe - tw, zN + 0.42, tw, zL - zN - 0.42 - tw]]) {
      F(S.v, WH, x, FH, z, sx, PARAPET, sz, 'NSEW'); F(S.v, CP, x - 0.02, FH + PARAPET, z - 0.02, sx + 0.04, 0.05, sz + 0.04, 'NSEWUD'); hit(S, x, FH + 0.01, z, sx, GUARD, sz);
    }
    for (const x of [xw + 0.02, xe - 0.18]) { F(S.v, WH, x, 0, zL - 0.2, 0.16, FH - 0.2, 0.16, 'NSEW'); hit(S, x, 0, zL - 0.2, 0.16, FH - 0.2, 0.16); }
    // blade wall behind the half landings; pier under the first one; posts under the second
    const yBl = FH * 1.5 + 1.25;
    F(S.v, MR, xw - 0.1, 0, zE - 0.22, xe - xw + 0.2, yBl, 0.22, 'NSEW'); F(S.v, CP, xw - 0.13, yBl, zE - 0.25, xe - xw + 0.26, 0.06, 0.28, 'NSEWUD'); hit(S, xw - 0.1, 0, zE - 0.22, xe - xw + 0.2, yBl, 0.22);
    F(S.v, WH, xw, 0, zE, xe - xw, FH / 2 - 0.16, landB, 'EW'); F(S.v, WH, xw, 0, zH - 0.01, xe - xw, FH / 2 - 0.16, 0.01, 'S'); hit(S, xw, 0.02, zE, xe - xw, FH / 2 - 0.2, landB - 0.02);
    for (const x of [xw, xe - tw]) F(S.v, WH, x, FH / 2 + 1.05, zH - 0.14, tw, FH - 1.05 - 0.16, 0.14, 'NSEW');
    // store under the first return flight (west lane): walls up to the flight, a door; the space under the first flight is walled too
    const yS = FH - 0.2, yN = FH / 2 - 0.16, x1 = xc - 0.1;
    S.v.quad(WH, [xw, 0, zH], [xw, 0, zN], [xw, yS, zN], [xw, yN, zH]); S.c.quad('generic', [xw, 0, zH], [xw, 0, zN], [xw, yS, zN], [xw, yN, zH]);
    const PS = face('S', zN + 0.005);
    PS(S.v, WH, xw, xc - 0.1, 0, yS, -0.01, 0, 'F'); doorSet(S, face('S', zN + 0.09), (xw + x1) / 2, { w: 0.9, h: 2.0, rev: 0.05, step: false, lamp: false, vision: false, leaf: lm('door') });
    hit(S, xc - 1.5, 0.02, zH + 0.01, 1.4, 1.7, run - 0.02);
    S.v.quad(WH, [xe, 0, zN], [xe, 0, zH], [xe, yN, zH], [xe, 0.02, zN]); S.c.quad('generic', [xe, 0, zN], [xe, 0, zH], [xe, yN, zH], [xe, 0.02, zN]);
    F(S.d, LAMP, xc - 0.5, FH * 1.5 + 0.9, zE - 0.01, 0.3, 0.1, 0.03, 'SEWUD'); F(S.d, LAMP, xc + 0.2, FH / 2 + 1.9, zE - 0.01, 0.3, 0.1, 0.03, 'SEWUD'); LIT.push([xc + 0.8, zN - 0.6, 3.2]);
    card(S.d, face('N', zL - tw), textCard('2F', 0.3, 0.2), xc - 0.15, xc + 0.15, FH + 0.6, FH + 0.8, 0.02);
    hit(S, xc - 1.5, DECK - 0.22, zN - 0.2, 1.4, 0.2, 0.2);                                                    // lip between the last tread and the deck
  }

  // ---- paved strip on the ground under the deck
  if (!quad) { const all = [pts, ...others.map(o => o.points)]; ctx.add(all.length === 1 ? flat(pts, 0.045, pavingMaterial()) : pavedStrip(all)); }
  else if (!others.length) ctx.add(flat(pts, 0.045, pavingMaterial()));
  finish(S, item, ctx, cxm, czm, (quad ? 12 : 30) + (S.low ? 45 : 75));
}
