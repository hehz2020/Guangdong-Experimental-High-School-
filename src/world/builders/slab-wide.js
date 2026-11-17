// West teaching slab (item teaching-slab-west), the deeper east-west slab just north of the gymnasium.
//
// SEEN in the 2018 footage, all from the west or south-west (frames 43, 53, 58, 67-69):
//   - west end: a white end bay with two columns of small square windows, then a dark-red full-height wall panel,
//     then the open end of the corridors: white slab-and-balustrade bands with dark gaps, five bands above the trees;
//   - a thin flat white roof slab that overhangs and floats on posts above the top of the walls;
//   - a full-height green glass stair tower and a tall white fin beside the corridor end. Those belong to the
//     stair-tower item and are NOT modelled here.
// From the satellite image: the outline (about 51 x 17 m), a darker roof strip along the north, a pale strip along the
// south with about five small square openings.
//
// ASSUMED (not seen in any reference; kept plain):
//   - five storeys of 3.6 m with the roof slab floating 2.35 m above a parapeted roof deck, fitted to the estimated
//     height (the footage allows five or six levels; the fifth white band is modelled as the roof parapet);
//   - that the open corridors run along the whole south face (only their west end is visible), their width, the
//     columns, and the wall behind them with doors and windows; rooms are closed boxes with nothing inside;
//   - the whole north face (white wall with one window per bay) and the plain east end;
//   - the staircase inside the east end, which exists only so the corridors can be reached on foot. The real stairs
//     are in the glass tower;
//   - window sizes, bay width, overhang depths, where the roof openings sit along the slab.
import { THREE } from '../../kit.js';
import { Batch } from '../../batch.js';

const FLOORS = 5, WALL = 0.24, CORRIDOR = 2.8, SLAB = 0.35, PARAPET = 1.1, GAP = 1.25;
const OVER = { w: 1.5, n: 1.0, s: 1.0, e: 0.3 };      // how far the roof slab (the measured outline) overhangs the walls
const STEPS = 12, TREAD = 0.3, FLIGHT = 1.3;          // staircase: steps per flight, tread depth, flight width
const HOLES = [0.06, 0.2, 0.4, 0.58, 0.78];           // roof openings, as fractions of the length from the west end

/** Oriented frame of a (near) rectangular outline: local +X along the longest edge pointing east, local +Z to its right (south). */
function frameOf(points) {
  let best = 0, ux = 1, uz = 0;
  for (let i = 0; i < points.length; i++) {
    const [ax, az] = points[i], [bx, bz] = points[(i + 1) % points.length], len = Math.hypot(bx - ax, bz - az);
    if (len > best) { best = len; ux = (bx - ax) / len; uz = (bz - az) / len; }
  }
  if (ux < 0) { ux = -ux; uz = -uz; }
  const wx = -uz, wz = ux;
  let u0 = Infinity, u1 = -Infinity, w0 = Infinity, w1 = -Infinity;
  for (const [x, z] of points) {
    const pu = x * ux + z * uz, pw = x * wx + z * wz;
    u0 = Math.min(u0, pu); u1 = Math.max(u1, pu); w0 = Math.min(w0, pw); w1 = Math.max(w1, pw);
  }
  return { ox: u0 * ux + w0 * wx, oz: u0 * uz + w0 * wz, angle: Math.atan2(-uz, ux), L: u1 - u0, D: w1 - w0 };
}

export function build(item, ctx) {
  const f = frameOf(item.points), { L, D } = f, H = item.height;
  const FH = (H - SLAB - GAP - PARAPET) / FLOORS, roofY = FLOORS * FH;            // 3.6 m and 18.0 m for the 20.7 m estimate
  const X0 = OVER.w, X1 = L - OVER.e, Z0 = OVER.n, Z1 = D - OVER.s, zc = Z1 - CORRIDOR;   // zc: wall between rooms and corridor
  const zr = Z0 + (zc - Z0) * 0.7;                                                 // west end: white bay north of zr, dark-red panel south of it
  const nBay = Math.max(1, Math.round((X1 - X0) / 4.2)), bay = (X1 - X0) / nBay;
  // staircase void at the east end of the room band, open to the corridor
  const RUN = STEPS * TREAD, xs1 = X1 - WALL, xs0 = xs1 - 2 * FLIGHT - 0.2, zl = zc - 1.3, zh = zl - RUN, zsn = zh - 1.4;
  const v = new Batch().frame(f.ox, f.oz, f.angle), c = new Batch().frame(f.ox, f.oz, f.angle);
  const both = (m, ...a) => { v.slab(m, ...a); c.slab('generic', ...a); };

  // ---- room mass (closed): two solid blocks around the stair void ----
  c.slab('generic', X0, 0, Z0, xs0 - 0.2 - X0, roofY, zc - Z0);
  c.slab('generic', xs0 - 0.2, 0, Z0, X1 - xs0 + 0.2, roofY, zsn - Z0);

  // ---- north face (assumed): white wall, one window per bay and floor ----
  v.slab('wallWhite', X0, 0, Z0, X1 - X0, roofY, WALL);
  for (let k = 0; k < FLOORS; k++) for (let j = 0; j < nBay; j++) {
    const xa = X0 + j * bay + 0.55, w = bay - 1.1, y = k * FH + 0.95;
    v.slab('glassDark', xa, y, Z0 - 0.03, w, 1.8, 0.03);
    for (const t of [1 / 3, 2 / 3]) v.slab('metalWhite', xa + w * t - 0.03, y, Z0 - 0.05, 0.06, 1.8, 0.03);
    v.slab('metalWhite', xa - 0.05, y - 0.08, Z0 - 0.07, w + 0.1, 0.08, 0.07);
  }

  // ---- west end: white bay with small square windows, dark-red panel, open corridor end ----
  v.slab('wallWhite', X0, 0, Z0, WALL, roofY + PARAPET, zr - Z0);
  v.slab('wallMaroon', X0 - 0.06, 0, zr, WALL + 0.06, roofY + PARAPET, zc - zr);
  for (let k = 0; k < FLOORS; k++) {
    const y = k * FH;
    for (const t of [0.44, 0.76]) v.slab('glassDark', X0 - 0.03, y + 1.3, Z0 + (zr - Z0) * t - 0.55, 0.03, 1.1, 1.1);
    v.slab('glassDark', X0 - 0.09, y + 1.2, (zr + zc) / 2 - 0.4, 0.03, 1.3, 0.8);
    if (k) { both('wallWhite', X0, y, zc, 0.12, 0.75, Z1 - zc); c.slab('generic', X0 + 0.02, y + 0.75, zc, 0.08, 0.4, Z1 - zc); v.slab('steel', X0 + 0.03, y + 1.05, zc, 0.06, 0.05, Z1 - zc); }
  }

  // ---- east end: plain white wall (the stair tower stands against it) ----
  both('wallWhite', xs1, 0, Z0, WALL, roofY, Z1 - Z0);

  // ---- south side: open corridors between white floor slabs ----
  v.slab('wallWhite', X0, 0, zc - WALL, xs0 - 0.2 - X0, roofY, WALL);                 // wall between rooms and corridor
  v.slab('floorGrey', X0, 0, zc, xs1 - X0, 0.03, Z1 - zc, 'D');
  v.slab('floorGrey', xs0, 0, zsn, xs1 - xs0, 0.03, zc - zsn, 'D');
  for (let k = 0; k < FLOORS; k++) {
    const y = k * FH;
    if (k) {
      both('wallWhite', X0, y - 0.15, zc, xs1 - X0, 0.15, Z1 - zc);                   // floor plate
      v.slab('floorGrey', X0 + 0.12, y, zc, xs1 - X0 - 0.12, 0.02, Z1 - zc - 0.12, 'D');
      both('wallWhite', X0, y, Z1 - 0.12, xs1 - X0, 0.75, 0.12);                      // solid balustrade with a rail above
      c.slab('generic', X0, y + 0.75, Z1 - 0.1, xs1 - X0, 0.4, 0.08);
      v.slab('steel', X0, y + 1.05, Z1 - 0.09, xs1 - X0, 0.05, 0.06);
      for (let j = 0; j < 2 * nBay; j++) v.slab('steel', X0 + (j + 0.5) * bay / 2 - 0.02, y + 0.75, Z1 - 0.08, 0.04, 0.3, 0.04);
    }
    v.slab('wallWhite', X0, y + FH - 0.6, Z1 - 0.3, xs1 - X0, 0.45, 0.3);             // edge beam under the slab above
    for (let j = 0; j < nBay; j++) {                                                  // door and high window of each bay (closed)
      const xa = X0 + j * bay;
      if (xa + bay > xs0 - 0.2) continue;
      v.slab('woodDark', xa + 0.6, y, zc, 1.0, 2.1, 0.03); v.slab('metalWhite', xa + 0.55, y + 2.1, zc, 1.1, 0.06, 0.04);
      v.slab('glassDark', xa + 2.0, y + 1.5, zc, bay - 2.6, 1.0, 0.03);
    }
  }
  for (let j = 0; j <= nBay; j++) both('wallWhite', Math.min(Math.max(X0 + j * bay - 0.2, X0), xs1 - 0.4), 0, Z1 - 0.4, 0.4, roofY, 0.42);   // columns

  // ---- staircase (assumed): two flights per storey around a spine wall ----
  both('wallWhite', xs0 - 0.2, 0, zsn - 0.2, 0.2, roofY, zc - zsn + 0.2);            // west wall of the stairwell
  v.slab('wallWhite', xs0, 0, zsn - 0.2, xs1 - xs0, roofY, 0.2);                      // its north wall
  both('wallWhite', xs0 + FLIGHT, 0, zh, 0.2, roofY, RUN);                            // spine between the flights
  for (let k = 0; k < FLOORS; k++) {
    const y = k * FH, last = k === FLOORS - 1;
    if (k) { both('wallWhite', xs0, y - 0.15, zl, xs1 - xs0, 0.15, zc - zl); v.slab('floorGrey', xs0, y, zl, xs1 - xs0, 0.02, zc - zl, 'D'); }   // floor landing
    if (last) { both('wallWhite', xs0 + FLIGHT, y, zl - 0.1, FLIGHT + 0.2, 1.1, 0.1); continue; }   // guard where no flight goes up
    both('wallWhite', xs0, y + FH / 2 - 0.15, zsn, xs1 - xs0, 0.15, zh - zsn);        // half landing
    for (let i = 0; i < STEPS; i++) {
      const rise = FH / 2 / STEPS;
      v.slab('concrete', xs0 + FLIGHT + 0.2, y + i * rise - rise, zl - (i + 1) * TREAD, FLIGHT, 2 * rise, TREAD);   // flight A: east half, climbing north
      v.slab('concrete', xs0, y + FH / 2 + i * rise - rise, zh + i * TREAD, FLIGHT, 2 * rise, TREAD);              // flight B: west half, climbing south
    }
  }

  // ---- roof deck with parapet, and the floating roof slab on posts ----
  v.slab('wallWhite', X0, roofY - 0.3, Z0, X1 - X0, 0.3, Z1 - Z0);
  v.slab('roofGrey', X0 + 0.2, roofY, Z0 + 0.2, X1 - X0 - 0.4, 0.02, Z1 - Z0 - 0.4, 'D');
  v.slab('wallWhite', X0 + WALL, roofY, Z0, X1 - X0 - WALL, PARAPET, 0.2);
  v.slab('wallWhite', X0, roofY, Z1 - 0.2, X1 - X0, PARAPET, 0.2);
  v.slab('wallWhite', X0, roofY, zc, 0.2, PARAPET, Z1 - 0.2 - zc);
  v.slab('wallWhite', X1 - 0.2, roofY, Z0 + 0.2, 0.2, PARAPET, Z1 - Z0 - 0.4);
  const yS = H - SLAB, zb = D * 8 / 17;                                               // zb: boundary between the dark and the pale roof strip
  for (let j = 0; j <= nBay; j += 2) for (const z of [Z0 + 0.25, zb, Z1 - 0.55]) v.slab('wallWhite', Math.min(X0 + j * bay + 0.25, X1 - 0.55), roofY, z, 0.3, yS - roofY, 0.3);
  const roofPiece = (top, x, z, sx, sz) => { v.slab('wallWhite', x, yS, z, sx, SLAB - 0.1, sz); v.slab(top, x, H - 0.1, z, sx, 0.1, sz); };
  roofPiece('roofGrey', 0, 0, L, zb);
  const hs = 1.6, hz = zb + (D - zb) * 0.45 - hs / 2;
  let x = 0;
  for (const t of HOLES) {
    const hx = L * t;
    roofPiece('roofPale', x, zb, hx - x, D - zb);
    roofPiece('roofPale', hx, zb, hs, hz - zb); roofPiece('roofPale', hx, hz + hs, hs, D - hz - hs);
    x = hx + hs;
  }
  roofPiece('roofPale', x, zb, L - x, D - zb);

  ctx.add(v.build({ name: item.id + '-visual' }));
  const cg = ctx.add(c.build({ name: item.id + '-colliders' })); cg.visible = false;

  // stair ramps (collision only): one inclined plate per flight, so the capsule walks up smoothly
  const ramps = new THREE.Group(); ramps.position.set(f.ox, 0, f.oz); ramps.rotation.y = f.angle; ramps.visible = false; ctx.add(ramps);
  const len = Math.hypot(RUN, FH / 2), ang = Math.atan2(FH / 2, RUN);
  for (let k = 0; k < FLOORS - 1; k++) for (const flight of ['A', 'B']) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(FLIGHT, 0.2, len));
    m.position.set(flight === 'A' ? xs0 + FLIGHT + 0.2 + FLIGHT / 2 : xs0 + FLIGHT / 2, k * FH + (flight === 'A' ? FH / 4 : FH * 3 / 4) - 0.1 * Math.cos(ang), zl - RUN / 2);
    m.rotation.x = flight === 'A' ? ang : -ang;          // a positive turn about +X lowers the south end: A rises toward north, B toward south
    ramps.add(m);
  }
  cg.traverse(o => { if (o.isMesh) ctx.collide(o); });
  ramps.children.forEach(m => ctx.collide(m));
}
