// Green glass stair cores: glass-stair-block (beside the clock tower) and teaching-slab-west-annex-w (south-west corner
// of the west teaching slab).
//
// SEEN in the 2018 footage:
//   glass-stair-block (frames 6-10, from the east and north-east):
//     - a green-tinted curtain wall in a fine pale grid, about three panes wide on the east face (frame 10), two pane
//       rows per storey; a white pier about 2 m wide at the south end of that face, where the block meets the tower;
//     - a dark-red vertical strip at the north end of the glass, full height and rising above the roof (frames 6-8);
//     - a flat grey roof slab with a pale edge, about 1.5 storeys above the slab roofs, and on it a white parapet box
//       with something dark inside (frames 9, 10);
//     - it stands NORTH of the tower shaft: in frame 10 (camera looking due west) its south end meets the tower's north
//       face and its east face is about 7 m long.
//   teaching-slab-west-annex-w (frame 58, from the west):
//     - a full-height green glass tower, about four panes wide plus a narrow one, two pane rows per storey, the zigzag
//       stair flights visible through the glass, running parallel to the west face;
//     - a flat white roof slab that overhangs; a tall thin white fin beside the tower where it meets the corridors,
//       rising well above the roof (the reference calls it "fin/portal frame"; one fin is drawn).
//
// WORKAROUND, to be settled in the data: the measured outline of glass-stair-block (6.1 m east-west x 3.6 m) overlaps the
//   clock tower's outline by 2.7 m, so three quarters of it would be buried in the shaft. That outline is probably the white
//   parapet box on the roof. When the two overlap, this builder keeps the measured east-west extent but places the core
//   against the tower's north face and makes it 7 m long, as frame 10 shows. Its collider moves with it.
//
// ASSUMED (not visible in any reference; kept plain):
//   - glass-stair-block: the north and west faces (glazed like the east face), the white south bay being a solid shaft,
//     the glass door, pane sizes, the size of the roof box; the steps from its roof to the tower platform are omitted;
//   - annex: the south and east faces (glazed like the west face), its north part being a white wall, floor plates behind
//     the stair, the door, 3.6 m storeys to match the west slab, the fin's size and exact place;
//   - both: the stair layout (dog-leg, flights 1.6-1.8 m wide), landings, handrails, the steepness of the flights.
// Not enterable: one solid collider each (plus the fin). The stairs are visual only.
import { bbox, itemPolygon } from '../../kit.js';
import { F, lm, shell, finish, hit, face, door, lamp, dogleg } from './plain-block.js';

/** Curtain wall on one facade between u0 and u1: tinted glass, verticals about every 1.5 m, horizontals every `row` metres. */
function curtain(S, put, u0, u1, y0, y1, row) {
  const FR = lm('frame'), n = Math.max(1, Math.round((u1 - u0) / 1.5));
  put(S.v, lm('glassCore'), u0, u1, y0, y1, 0, 0.02, 'F');
  for (let i = 0; i <= n; i++) { const u = u0 + (u1 - u0) * i / n; put(S.v, FR, Math.max(u0, u - 0.04), Math.min(u1, u + 0.04), y0, y1, 0.02, 0.11, 'FLR'); }
  put(S.v, FR, u0, u1, y0, y0 + 0.1, 0.02, 0.09, 'FU'); put(S.v, FR, u0, u1, y1 - 0.1, y1, 0.02, 0.09, 'FD');
  for (let y = Math.ceil((y0 + 0.4) / row) * row; y < y1 - 0.4; y += row) put(S.v, FR, u0, u1, y - 0.035, y + 0.035, 0.02, 0.08, 'FUD');
}

function byTower(S, r, H, ctx) {
  const FH = 3.9, floors = 5, yR = H - 1.0, W = 'wallWhite', WH = lm('white'), CP = lm('cope'), MR = lm('maroon');
  const zs = r.s - 1.9;                                                    // north face of the white south bay
  const PE = face('E', r.e), PN = face('N', r.n), PW = face('W', r.w);
  F(S.v, W, r.w, 0, zs, r.e - r.w, yR - 0.3, r.s - zs, 'NSEW');             // white south bay (a solid shaft)
  F(S.v, W, r.w, 0, r.n, 0.5, yR - 0.3, 0.5, 'NSEW');                       // north-west corner pier
  F(S.v, MR, r.e - 0.6, 0, r.n - 0.1, 0.72, H + 1.2, 0.72, 'NSEWU');        // dark-red strip at the north-east corner, taller than the roof
  for (const put of [PE, PW]) { put(S.v, lm('base'), r.n + 0.6, zs, 0, 0.3, 0, 0.05, 'FU'); curtain(S, put, put === PE ? r.n + 0.62 : r.n + 0.5, zs, 0.3, yR - 0.3, FH / 2); }
  PN(S.v, lm('base'), r.w + 0.5, r.e - 0.6, 0, 0.3, 0, 0.05, 'FU'); curtain(S, PN, r.w + 0.5, r.e - 0.6, 0.3, yR - 0.3, FH / 2);
  F(S.v, lm('concrete'), r.w, 0, r.n, r.e - r.w, 0.03, zs - r.n, 'U');
  dogleg(S, { x0: r.w + 1.2, x1: r.e - 1.2, zA0: zs - 1.0, zA1: zs, zB0: r.n + 0.35, zB1: r.n + 1.3, floors, FH });
  door(S, PE, zs - 1.1, { w: 1.5, canopy: 0.9 });
  // roof slab with a pale edge, white parapet box with something dark in it
  const o = 0.3, x0 = r.w - o, z0 = r.n - o, sx = r.e - r.w + 2 * o, sz = r.s - r.n + o;
  F(S.v, lm('roof'), x0, yR - 0.3, z0, sx, 0.3, sz, 'UD'); F(S.v, CP, x0, yR - 0.3, z0, sx, 0.3, sz, 'NSEW');
  const B = { w: r.w + 0.5, e: r.e - 2.1, n: r.n + 0.5, s: r.n + 5.1 }, t = 0.15;
  F(S.v, WH, B.w, yR, B.n, B.e - B.w, 1.0, B.s - B.n, 'NSEW');
  F(S.v, WH, B.w + t, yR, B.n + t, B.e - B.w - 2 * t, 1.0, 0.01, 'S'); F(S.v, WH, B.w + t, yR, B.s - t, B.e - B.w - 2 * t, 1.0, 0.01, 'N');
  F(S.v, WH, B.w + t, yR, B.n + t, 0.01, 1.0, B.s - B.n - 2 * t, 'E'); F(S.v, WH, B.e - t, yR, B.n + t, 0.01, 1.0, B.s - B.n - 2 * t, 'W');
  for (const [x, z, a, c] of [[B.w, B.n, B.e - B.w, t], [B.w, B.s - t, B.e - B.w, t], [B.w, B.n + t, t, B.s - B.n - 2 * t], [B.e - t, B.n + t, t, B.s - B.n - 2 * t]]) F(S.v, CP, x, yR + 1.0, z, a, 0.02, c, 'U');
  F(S.v, lm('dark'), B.w + 0.9, yR, B.n + 1.2, 1.5, 0.55, 1.1, 'NSEWU');
  hit(S, r.w, 0, r.n, r.e - r.w, yR, r.s - r.n); hit(S, B.w, yR, B.n, B.e - B.w, 1.0, B.s - B.n); hit(S, r.e - 0.6, yR, r.n - 0.1, 0.72, H + 1.2 - yR, 0.72);
  lamp(S, PN, r.w + 0.25, 2.6);
}

function annex(S, r, H, ctx) {
  const FH = 3.6, floors = 5, W = 'wallWhite', WH = lm('white'), CO = lm('concrete');
  const slab = ctx.campus && ctx.campus.items.find(i => i.style === 'teaching-slab-wide');
  const sb = slab ? bbox(itemPolygon(slab)) : null;
  const zf = sb && sb.s > r.n + 0.5 && sb.s < r.s - 3 ? sb.s : r.n + 0.5;    // where the slab's corridor face meets the tower: the fin stands here
  const PW = face('W', r.w), PS = face('S', r.s), PE = face('E', r.e), yT = H - 0.3;
  F(S.v, W, r.w, 0, r.n, r.e - r.w, yT, zf + 0.25 - r.n, 'NSEW');            // white north part
  for (const [x, z] of [[r.w, r.s - 0.5], [r.e - 0.5, r.s - 0.5]]) F(S.v, W, x, 0, z, 0.5, yT, 0.5, 'NSEW');   // corner piers
  for (const put of [PW, PE]) { put(S.v, lm('base'), zf + 0.25, r.s - 0.5, 0, 0.3, 0, 0.05, 'FU'); curtain(S, put, zf + 0.25, r.s - 0.5, 0.3, yT, FH / 2); }
  PS(S.v, lm('base'), r.w + 0.5, r.e - 0.5, 0, 0.3, 0, 0.05, 'FU'); curtain(S, PS, r.w + 0.5, r.e - 0.5, 0.3, yT, FH / 2);
  F(S.v, WH, r.w - 0.5, yT, r.n - 0.2, r.e - r.w + 1.0, 0.3, r.s - r.n + 0.7, 'NSEWUD');                              // overhanging white roof slab
  F(S.v, WH, r.w - 0.9, 0, zf - 0.5, 1.15, H + 3.5, 0.45, 'NSEWU');                                                  // the tall fin
  F(S.v, CO, r.w, 0, zf + 0.25, r.e - r.w, 0.03, r.s - zf - 0.25, 'U');
  const xs = r.w + 4.3;                                                                                             // stair next to the west face, floor plates east of it
  dogleg(S, { x0: r.w + 0.5, x1: xs, zA0: zf + 0.25, zA1: zf + 2.2, zB0: r.s - 2.2, zB1: r.s - 0.4, floors, FH });
  for (let k = 1; k <= floors; k++) F(S.v, CO, xs, k * FH - 0.15, zf + 0.25, r.e - 0.3 - xs, 0.15, r.s - 0.4 - zf - 0.25, 'UDWS');
  for (let k = 1; k <= floors; k++) F(S.d, lm('rail'), xs, k * FH + 0.95, zf + 2.2, 0.05, 0.05, r.s - 0.4 - zf - 2.2, 'EWUD');   // guard rail along the plates' edge
  door(S, PW, zf + 1.4, { w: 1.6, canopy: 1.0 });
  hit(S, r.w, 0, r.n, r.e - r.w, H, r.s - r.n); hit(S, r.w - 0.9, 0, zf - 0.5, 0.9, 6, 0.45);
  lamp(S, PS, r.w + 0.25, 2.6);
}

export function build(item, ctx) {
  const S = shell(ctx), b = bbox(itemPolygon(item)), H = item.height;
  let r = { w: b.w, e: b.e, n: b.n, s: b.s };
  if (item.id === 'glass-stair-block') {
    const tw = ctx.campus && ctx.campus.items.find(i => i.style === 'clock-tower'), t = tw ? bbox(itemPolygon(tw)) : null;
    if (t && r.s > t.n + 0.5 && r.n < t.s && r.e > t.w && r.w < t.e) r = { w: b.w, e: b.e, n: t.n - 7.0, s: t.n };   // see WORKAROUND above
    byTower(S, r, H, ctx);
  } else annex(S, r, H, ctx);
  finish(S, item, ctx, (r.w + r.e) / 2, (r.n + r.s) / 2, Math.max(r.e - r.w, r.s - r.n) / 2 + (S.low ? 50 : 80));
}
