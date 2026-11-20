// Round stair towers at the east ends of the long blocks (items dorm-*-round-tower), walkable from the ground to the top.
//
// SEEN, in the satellite image only (no video frame shows them): a white ring about 10 m across at the east end of
// each block. Tower A's top shows two concentric white arcs, C-shaped and open toward the north-west, like the top of
// a spiral stair or ramp. Tower B's top is a clean light ring around a dark, roughly octagonal centre about 5.8 m across.
//
// IMAGINED (the owner asked for a convincing, complete tower; nothing shows the elevation):
//   - that it is a stair: a wide spiral of shallow steps (0.10 m risers, one turn per storey) round an open well, with a
//     level landing at every floor where the gallery of the south block arrives over a short bridge (slab-block.js
//     draws the bridge and tells this file where it lands), and one more turn up to a look-out at roof level;
//   - the first flight from the ground is steeper and starts on the side away from the block; its base is solid;
//   - solid white parapets that climb with the steps, a steel rail on them, six white piers outside and six slim white
//     columns at the well, lamps under the landings, a paved base, a planter in the well (a palm in tower A, whose top
//     is open; shrubs in tower B);
//   - the tops, drawn to match the two roof views: tower A ends in two concentric ring beams open toward the bridge
//     side (the C shape), tower B has a flat ring roof with a dark octagonal roof light over the well;
//   - the towers are drawn up to 0.9 m south of their measured centres so that they stand clear of the link blocks
//     (the measured circles overlap them; positions are good to about 2 m). See towerSite() in slab-block.js.
//
// Collision: one-sided quads that face the walker (see slab-block.js for why not boxes): one inclined quad per step (a
// ramp under the walker), the two parapets 2 m tall, the solid base of the first flight, the piers at ground level, the
// planter, the roof of tower B. Climbing direction: the azimuth decreases on the way up.
import { THREE, mat } from '../../kit.js';
import { Batch } from '../../batch.js';
import { royalPalms, shrubs, useStockShaders } from '../../flora.js';
import { LIT } from '../../street.js';
import { towerSite, bridgeFor, mats, mergeFlat, FLOORS, FH, BASE } from './slab-block.js';

const TAU = Math.PI * 2, RAD = Math.PI / 180;
const PARAPET = 1.1, T = 0.22, WALL = 0.18, RAILH = 1.0;      // outer parapet height, slab thickness, outer parapet thickness, inner parapet height
const STEPS = 30, GROUND_STEPS = 33, GROUND_ARC = 185 * RAD;
const OPEN_TOP = { 'dorm-a-round-tower': true };              // tower A shows the spiral itself from above; tower B a roofed ring

/**
 * The spiral as plain numbers: centre, radii and the list of segments in climbing order. A segment runs from azimuth a0
 * to a1 (radians, decreasing; x = cos a, z = sin a) and from height h0 to h1; step: a tread whose top is at h1;
 * open: the outer parapet is left out (the bridge arrives there); landing: storey number of a level landing.
 */
export function towerPlan(item, campus) {
  const { cx, cz, R } = towerSite(item, campus), b = bridgeFor(item.id, campus), H = item.height;
  let thL = -135 * RAD, half = 17 * RAD;                       // where the landings face, and half the width of the bridge opening
  if (b) { let d = b.az1 - b.az0; while (d > Math.PI) d -= TAU; while (d < -Math.PI) d += TAU; thL = b.az0 + d / 2; half = Math.abs(d) / 2; }
  const phi = Math.max(36 * RAD, half + 12 * RAD), r1 = 0.56 * R, r2 = R - WALL, segs = [];
  let a = thL + phi + GROUND_ARC, h = 0;
  const footAz = a;
  const flight = (arc, n, rise, ground) => { for (let i = 0; i < n; i++) { segs.push({ a0: a, a1: a - arc / n, h0: h, h1: h + rise / n, step: true, ground }); a -= arc / n; h += rise / n; } };
  const landing = (k, open) => {
    const cuts = open ? [0, (phi - half) / 2, phi - half, phi - half / 2, phi, phi + half / 2, phi + half, phi + half + (phi - half) / 2, 2 * phi] : Array.from({ length: 9 }, (_, i) => 2 * phi * i / 8);
    for (let i = 0; i < 8; i++) segs.push({ a0: a - cuts[i], a1: a - cuts[i + 1], h0: h, h1: h, step: false, landing: k, open: open && i >= 2 && i < 6 });
    a -= 2 * phi;
  };
  flight(GROUND_ARC, GROUND_STEPS, BASE + FH, true);
  for (let k = 1; k <= FLOORS; k++) { landing(k, !!b && k < FLOORS); if (k < FLOORS) flight(TAU - 2 * phi, STEPS, FH, false); }
  return { cx, cz, R, r1, r2, H, thL, half, phi, footAz, segs, top: h, bridge: b, open: !!OPEN_TOP[item.id] };
}

export function build(item, ctx) {
  const P = towerPlan(item, ctx.campus), { cx, cz, R, r1, r2, H, thL, phi, segs, open } = P, m = mats(), low = !!ctx.lowPower;
  const v = new Batch().frame(cx, cz, 0), ex = new Batch().frame(cx, cz, 0);
  const Pt = (a, r, y) => [r * Math.cos(a), y, r * Math.sin(a)];
  // quad whose front must face the direction (nx, ny, nz): reorders the corners if they wind the other way
  const face = (b, material, p, nx, ny, nz) => {
    const e1 = [p[1][0] - p[0][0], p[1][1] - p[0][1], p[1][2] - p[0][2]], e2 = [p[3][0] - p[0][0], p[3][1] - p[0][1], p[3][2] - p[0][2]];
    const n = [e1[1] * e2[2] - e1[2] * e2[1], e1[2] * e2[0] - e1[0] * e2[2], e1[0] * e2[1] - e1[1] * e2[0]];
    if (n[0] * nx + n[1] * ny + n[2] * nz < 0) p = [p[0], p[3], p[2], p[1]];
    b.quad(material, ...p);
  };
  /** Box in the frame turned to azimuth a: local x runs outward, local z along the ring. */
  const radial = (b, material, a, rc, y0, y1, sr, st) => { if (y1 - y0 > 0.01) { b.frame(cx, cz, -a).box(material, rc, (y0 + y1) / 2, 0, sr, y1 - y0, st); b.frame(cx, cz, 0); } };
  const WH = m.plaster, CP = [];                                // smooth white paint on the spiral; the collision quads (relative to the centre)
  /** Collision quad from four points in order, facing (nx, ny, nz). */
  const tq = (p, nx, ny, nz) => {
    const e1 = [p[1][0] - p[0][0], p[1][1] - p[0][1], p[1][2] - p[0][2]], e2 = [p[3][0] - p[0][0], p[3][1] - p[0][1], p[3][2] - p[0][2]];
    const n = [e1[1] * e2[2] - e1[2] * e2[1], e1[2] * e2[0] - e1[0] * e2[2], e1[0] * e2[1] - e1[1] * e2[0]];
    const o = n[0] * nx + n[1] * ny + n[2] * nz < 0 ? [p[0], p[3], p[2], p[1]] : p;
    for (const i of [0, 1, 2, 0, 2, 3]) CP.push(...o[i]);
  };

  // ---- the spiral: treads, risers, soffit, parapets ----
  segs.forEach((s, i) => {
    const { a0, a1, h0, h1 } = s, am = (a0 + a1) / 2, ox = Math.cos(am), oz = Math.sin(am), rO = s.open ? R + 0.03 : r2, solid = s.ground && h0 < 2.3;
    const yb0 = solid ? 0 : h0 - T, yb1 = solid ? 0 : h1 - T;
    if (s.step) {
      face(v, m.tread, [Pt(a0, r1, h1), Pt(a0, rO, h1), Pt(a1, rO, h1), Pt(a1, r1, h1)], 0, 1, 0);
      face(v, m.concrete, [Pt(a0, r1, h0), Pt(a0, rO, h0), Pt(a0, rO, h1), Pt(a0, r1, h1)], -Math.sin(a0), 0, Math.cos(a0));
      if (!low) face(ex, m.nosing, [Pt(a0, r1, h1 + 0.004), Pt(a0, rO, h1 + 0.004), Pt(a0 - 0.014, rO, h1 + 0.004), Pt(a0 - 0.02, r1, h1 + 0.004)], 0, 1, 0);
    } else face(v, m.floor, [Pt(a0, r1, h0), Pt(a0, rO, h0), Pt(a1, rO, h0), Pt(a1, r1, h0)], 0, 1, 0);
    if (!solid) face(v, WH, [Pt(a0, r1 - 0.12, yb0), Pt(a0, R, yb0), Pt(a1, R, yb1), Pt(a1, r1 - 0.12, yb1)], 0, -1, 0);
    // outer parapet (left out where the bridge arrives), inner parapet
    const t0 = h0 + PARAPET, t1 = h1 + PARAPET;
    if (!s.open) {
      face(v, WH, [Pt(a0, R, yb0), Pt(a1, R, yb1), Pt(a1, R, t1), Pt(a0, R, t0)], ox, 0, oz);
      face(v, WH, [Pt(a0, r2, h0), Pt(a1, r2, h0), Pt(a1, r2, t1), Pt(a0, r2, t0)], -ox, 0, -oz);
      face(v, WH, [Pt(a0, r2, t0), Pt(a1, r2, t1), Pt(a1, R, t1), Pt(a0, R, t0)], 0, 1, 0);
      tq([Pt(a0, r2, h0), Pt(a1, r2, h1), Pt(a1, r2, h1 + 2.0), Pt(a0, r2, h0 + 2.0)], -ox, 0, -oz);
      if (solid) tq([Pt(a0, R, 0), Pt(a1, R, 0), Pt(a1, R, t1), Pt(a0, R, t0)], ox, 0, oz);
    } else face(v, WH, [Pt(a0, R + 0.03, yb0), Pt(a1, R + 0.03, yb1), Pt(a1, R + 0.03, h1), Pt(a0, R + 0.03, h0)], ox, 0, oz);
    const u0 = h0 + RAILH, u1 = h1 + RAILH, ri = r1 - 0.12;
    face(v, WH, [Pt(a0, ri, yb0), Pt(a1, ri, yb1), Pt(a1, ri, u1), Pt(a0, ri, u0)], -ox, 0, -oz);
    face(v, WH, [Pt(a0, r1, h0), Pt(a1, r1, h0), Pt(a1, r1, u1), Pt(a0, r1, u0)], ox, 0, oz);
    face(v, WH, [Pt(a0, ri, u0), Pt(a1, ri, u1), Pt(a1, r1, u1), Pt(a0, r1, u0)], 0, 1, 0);
    tq([Pt(a0, r1, h0), Pt(a1, r1, h1), Pt(a1, r1, h1 + 2.0), Pt(a0, r1, h0 + 2.0)], ox, 0, oz);
    if (solid) tq([Pt(a0, ri, 0), Pt(a1, ri, 0), Pt(a1, ri, u1), Pt(a0, ri, u0)], -ox, 0, -oz);                    // the base of the first flight is solid
    // steel rails on both parapets
    if (!s.open && (!low || i % 2 === 0)) { ex.strut(m.inox, [cx + (R - 0.09) * Math.cos(a0), t0 + 0.08, cz + (R - 0.09) * Math.sin(a0)], [cx + (R - 0.09) * Math.cos(a1), t1 + 0.08, cz + (R - 0.09) * Math.sin(a1)], 0.045); ex.frame(cx, cz, 0); }
    if (!low || i % 2 === 0) { ex.strut(m.inox, [cx + (r1 - 0.06) * Math.cos(a0), u0 + 0.07, cz + (r1 - 0.06) * Math.sin(a0)], [cx + (r1 - 0.06) * Math.cos(a1), u1 + 0.07, cz + (r1 - 0.06) * Math.sin(a1)], 0.045); ex.frame(cx, cz, 0); }
    // the walker's surface: a ramp over each step, level on the landings
    tq([Pt(a0, r1, h0), Pt(a0, rO, h0), Pt(a1, rO, h1), Pt(a1, r1, h1)], 0, 1, 0);
  });
  { const i = segs.findIndex(s => !(s.ground && s.h0 < 2.3)), s = segs[i], a = s.a0;                             // the open end of the solid base under the first flight
    face(v, WH, [Pt(a, r1 - 0.12, 0), Pt(a, R, 0), Pt(a, R, s.h0 - T), Pt(a, r1 - 0.12, s.h0 - T)], Math.sin(a), 0, -Math.cos(a));
    tq([Pt(a, r1 - 0.12, 0), Pt(a, R, 0), Pt(a, R, s.h0 - T), Pt(a, r1 - 0.12, s.h0 - T)], Math.sin(a), 0, -Math.cos(a)); }
  // closing faces: the foot of the two parapets, the end of the top landing
  { const s = segs[0], a = s.a0, tx = -Math.sin(a), tz = Math.cos(a);
    face(v, WH, [Pt(a, r2, 0), Pt(a, R, 0), Pt(a, R, PARAPET), Pt(a, r2, PARAPET)], tx, 0, tz); face(v, WH, [Pt(a, r1 - 0.12, 0), Pt(a, r1, 0), Pt(a, r1, RAILH), Pt(a, r1 - 0.12, RAILH)], tx, 0, tz);
    const e = segs[segs.length - 1], ae = e.a1, hE = e.h1;
    face(v, WH, [Pt(ae, r1 - 0.12, hE - T), Pt(ae, R, hE - T), Pt(ae, R, hE + PARAPET), Pt(ae, r1 - 0.12, hE + PARAPET)], Math.sin(ae), 0, -Math.cos(ae));
    face(v, WH, [Pt(ae + 0.03, r1, hE), Pt(ae + 0.03, r2, hE), Pt(ae + 0.03, r2, hE + PARAPET), Pt(ae + 0.03, r1, hE + PARAPET)], -Math.sin(ae), 0, Math.cos(ae));
    tq([Pt(ae + 0.03, r1, hE), Pt(ae + 0.03, r2, hE), Pt(ae + 0.03, r2, hE + 2.0), Pt(ae + 0.03, r1, hE + 2.0)], -Math.sin(ae), 0, Math.cos(ae));
  }

  // ---- six piers outside, six slim columns at the well; lamps under the landings ----
  const yRoof = H - 0.25, yCrown = H - 0.5;
  for (let j = 0; j < 6; j++) {
    const a = thL + (30 + 60 * j) * RAD;
    radial(v, m.tile, a, R - 0.08, 0, open ? H : yRoof, 0.44, 0.6);
    { const co = Math.cos(a), si = Math.sin(a), at = (r, t, y) => [r * co - t * si, y, r * si + t * co], ra = R - 0.3, rb = R + 0.14, hp = 2.6;   // the pier's four faces at ground level
      tq([at(ra, -0.3, 0), at(ra, 0.3, 0), at(ra, 0.3, hp), at(ra, -0.3, hp)], -co, 0, -si); tq([at(rb, -0.3, 0), at(rb, 0.3, 0), at(rb, 0.3, hp), at(rb, -0.3, hp)], co, 0, si);
      tq([at(ra, 0.3, 0), at(rb, 0.3, 0), at(rb, 0.3, hp), at(ra, 0.3, hp)], -si, 0, co); tq([at(ra, -0.3, 0), at(rb, -0.3, 0), at(rb, -0.3, hp), at(ra, -0.3, hp)], si, 0, -co); }
    v.cyl(m.white, (r1 - 0.06) * Math.cos(a), 0, (r1 - 0.06) * Math.sin(a), 0.085, (open ? yCrown : yRoof), 10, false);
  }
  for (let k = 1; k <= FLOORS; k++) { const y = BASE + k * FH - T; radial(ex, m.lamp, thL, (r1 + r2) / 2, y - 0.05, y, 0.5, 0.5); }
  { const la = P.footAz + 0.3, over = segs.find(s => !s.ground && ((la - s.a1) % TAU + TAU) % TAU <= s.a0 - s.a1);      // a lamp over the way in, under the flight that passes there
    if (over) radial(ex, m.lamp, la, (r1 + r2) / 2, over.h0 - T - 0.05, over.h0 - T, 0.4, 0.4); }
  LIT.push([cx + (R + 1.5) * Math.cos(P.footAz + 0.25), cz + (R + 1.5) * Math.sin(P.footAz + 0.25), 5]);

  // ---- base: a paved disc, a round planter in the well ----
  v.cyl(m.stone, 0, 0, 0, R + 0.7, 0.04, 40);
  const rp = r1 - 1.0;
  for (let i = 0; i < 24; i++) { const a0 = i * TAU / 24, a1 = a0 + TAU / 24, am = (a0 + a1) / 2, ox = Math.cos(am), oz = Math.sin(am);
    face(v, m.stone, [Pt(a0, rp, 0), Pt(a1, rp, 0), Pt(a1, rp, 0.45), Pt(a0, rp, 0.45)], ox, 0, oz); face(v, m.stone, [Pt(a0, rp - 0.2, 0.45), Pt(a1, rp - 0.2, 0.45), Pt(a1, rp, 0.45), Pt(a0, rp, 0.45)], 0, 1, 0);
    face(v, m.green, [Pt(a0, 0.01, 0.36), Pt(a1, 0.01, 0.36), Pt(a1, rp - 0.2, 0.36), Pt(a0, rp - 0.2, 0.36)], 0, 1, 0); }
  for (let i = 0; i < 12; i++) { const a0 = i * TAU / 12, a1 = a0 + TAU / 12, am = (a0 + a1) / 2; tq([Pt(a0, rp, 0), Pt(a1, rp, 0), Pt(a1, rp, 1.0), Pt(a0, rp, 1.0)], Math.cos(am), 0, Math.sin(am)); }

  // ---- top: tower A two concentric ring beams open toward the landing side; tower B a ring roof with a dark roof light ----
  const N = 36;
  if (open) {
    for (let i = 0; i < N; i++) {
      const a0 = thL - phi - i * (TAU - 2 * phi) / N, a1 = a0 - (TAU - 2 * phi) / N, am = (a0 + a1) / 2, ox = Math.cos(am), oz = Math.sin(am);
      for (const [ra, rb, y0] of [[R - 0.5, R + 0.05, yCrown], [r1 - 0.3, r1 + 0.15, yCrown]]) {
        face(v, WH, [Pt(a0, ra, H), Pt(a1, ra, H), Pt(a1, rb, H), Pt(a0, rb, H)], 0, 1, 0); face(v, WH, [Pt(a0, ra, y0), Pt(a1, ra, y0), Pt(a1, rb, y0), Pt(a0, rb, y0)], 0, -1, 0);
        face(v, WH, [Pt(a0, rb, y0), Pt(a1, rb, y0), Pt(a1, rb, H), Pt(a0, rb, H)], ox, 0, oz); face(v, WH, [Pt(a0, ra, y0), Pt(a1, ra, y0), Pt(a1, ra, H), Pt(a0, ra, H)], -ox, 0, -oz);
      }
    }
    for (const a of [thL - phi, thL + phi]) for (const [ra, rb] of [[R - 0.5, R + 0.05], [r1 - 0.3, r1 + 0.15]]) face(v, WH, [Pt(a, ra, yCrown), Pt(a, rb, yCrown), Pt(a, rb, H), Pt(a, ra, H)], a === thL - phi ? -Math.sin(a) : Math.sin(a), 0, a === thL - phi ? Math.cos(a) : -Math.cos(a));
  } else {
    for (let i = 0; i < N; i++) {
      const a0 = i * TAU / N, a1 = a0 + TAU / N, am = (a0 + a1) / 2, ox = Math.cos(am), oz = Math.sin(am);
      face(v, m.roof, [Pt(a0, r1 - 0.3, H), Pt(a1, r1 - 0.3, H), Pt(a1, R + 0.05, H), Pt(a0, R + 0.05, H)], 0, 1, 0); face(v, WH, [Pt(a0, r1 - 0.3, yRoof), Pt(a1, r1 - 0.3, yRoof), Pt(a1, R + 0.05, yRoof), Pt(a0, R + 0.05, yRoof)], 0, -1, 0);
      face(v, WH, [Pt(a0, R + 0.05, yRoof), Pt(a1, R + 0.05, yRoof), Pt(a1, R + 0.05, H), Pt(a0, R + 0.05, H)], ox, 0, oz); face(v, WH, [Pt(a0, r1 - 0.3, yRoof), Pt(a1, r1 - 0.3, yRoof), Pt(a1, r1 - 0.3, H + 0.25), Pt(a0, r1 - 0.3, H + 0.25)], -ox, 0, -oz);
    }
    for (let i = 0; i < 8; i++) {                               // octagonal roof light over the well: dark glass, a low white kerb
      const a0 = i * TAU / 8 + TAU / 16, a1 = a0 + TAU / 8, am = (a0 + a1) / 2, ro = (r1 - 0.3) / Math.cos(TAU / 16);
      face(v, m.cwall, [Pt(a0, 0.01, H + 0.9), Pt(a1, 0.01, H + 0.9), Pt(a1, ro, H + 0.25), Pt(a0, ro, H + 0.25)], Math.cos(am) * 0.3, 1, Math.sin(am) * 0.3);
      face(v, WH, [Pt(a0, ro, H), Pt(a1, ro, H), Pt(a1, ro, H + 0.25), Pt(a0, ro, H + 0.25)], Math.cos(am), 0, Math.sin(am));
      face(v, m.dark, [Pt(a0, 0.01, H + 0.86), Pt(a1, 0.01, H + 0.86), Pt(a1, ro, H + 0.21), Pt(a0, ro, H + 0.21)], 0, -1, 0);
    }
    tq([[-R, H, -R], [R, H, -R], [R, H, R], [-R, H, R]], 0, 1, 0);
  }

  // ---- assemble ----
  ctx.add(mergeFlat(v.build({ name: item.id + '-visual' }), true));
  const eg = mergeFlat(ex.build({ name: item.id + '-fittings', castShadow: false }), false);
  if (ctx.safe) useStockShaders(true);
  if (typeof document !== 'undefined') {
  if (open) eg.add(royalPalms([[cx, cz, 11.5, 0.3]], { seed: 4 }).group);
  { const list = []; for (let i = 0; i < (open ? 7 : 11); i++) { const a = i * 2.4, r = (open ? 0.9 : 0.3) + (rp - 0.9) * ((i * 0.37) % 1) * (open ? 0.6 : 1); list.push([cx + r * Math.cos(a), cz + r * Math.sin(a), 0.42 + 0.2 * ((i * 0.61) % 1)]); }
    const sh = shrubs(list, { seed: 12 }); sh.position.y = 0.36; eg.add(sh); }
  }
  ctx.detail(ctx.add(eg), cx, cz, R + (low ? 50 : 75));
  if (ctx.occupy) ctx.occupy(Array.from({ length: 16 }, (_, i) => [cx + (R + 0.9) * Math.cos(i * TAU / 16), cz + (R + 0.9) * Math.sin(i * TAU / 16)]));   // drawn a little south of the measured circle, on a wider base
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(CP, 3));
  const cm = new THREE.Mesh(g, mat('generic')); cm.position.set(cx, 0, cz); cm.visible = false; cm.name = item.id + '-colliders'; ctx.add(cm); ctx.collide(cm);
}
