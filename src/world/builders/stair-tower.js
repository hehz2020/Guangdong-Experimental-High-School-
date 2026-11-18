// Stair towers at the east ends of the two east teaching slabs (items slab-north-east-stair, slab-south-east-stair).
//
// SEEN in the 2018 footage (frames 4-7 and denser stills between them, from the north-east):
//   - a flat grey roof slab with a pale edge, overhanging, pierced by ONE round opening near its middle (the satellite
//     image shows the dark round spot on both towers, close to the centre of each outline);
//   - under it the top level is an open loggia: a parapet about 1 m high, a few slender posts clustered at the north-east
//     corner, a full-height white pier where the tower meets the slab, a dark interior;
//   - below the loggia a pale green glazed band with a fine grid, across the whole north face and round the corner
//     over the northern part of the east face;
//   - north face below the band: a blank white panel and, next to the slab, a narrow full-height glazed strip;
//   - east face: a column of windows near the north-east corner, a second column of small windows further south, a wider
//     window at the top, and a dark-red strip at the SOUTH end running from the ground to the roof slab;
//   - south tower only (frame 6): behind the roof slab stands a taller white box capped by a stepped two-tier slab
//     with red pipes.
// HEIGHT (settled in the data): the stills show the roof slab only about 0.8 m above the slab's north parapet and the
//   loggia beside the slab's top-floor windows. The data height of both towers was therefore lowered from the first
//   estimate, 23.5 m, to 21.5 m (the slab's parapet at 20.7 m plus 0.8 m). The builder follows item.height: the loggia
//   floor is put at the slab's roof level and everything hangs from that.
//
// ASSUMED (not visible in any reference; kept plain):
//   - the south and west faces (white, the red strip wraps the south-east corner; small windows on the south face);
//   - everything at ground level (hidden by trees): dark plinth, a door with a canopy on the east face;
//   - sizes: band 2.65 m high, strip 1.45 m wide, windows, posts, the 3 m depth and 3 m extra height of the south
//     tower's box, the thickness of the roof slab;
//   - the inside: a dog-leg stair behind the glazed strip (visible through it), the stair-head box in the loggia;
//   - the 0.8 m slot the measured outlines leave between tower and slab is closed (the stills show them joined).
// Not enterable: one solid collider up to the top of the roof slab (it also covers the round opening, so a player
// who lands there stands on the roof and cannot drop into the loggia).
import { bbox } from '../../kit.js';
import { F, lm, shell, finish, hit, face, win, pipe, lamp, door, dogleg } from './plain-block.js';

const FH = 3.9, T = 0.25;

/** Flat slab with a round hole, from y0 to y1, drawn with radial quads so that it merges with the other flat parts. */
function holedSlab(b, m, r, cx, cz, rad, y0, y1, seg = 24) {
  const angs = Array.from({ length: seg }, (_, i) => i / seg * Math.PI * 2);
  for (const [x, z] of [[r.w, r.n], [r.e, r.n], [r.e, r.s], [r.w, r.s]]) angs.push((Math.atan2(z - cz, x - cx) + Math.PI * 2) % (Math.PI * 2));
  angs.sort((p, q) => p - q);
  const pts = angs.map(a => {
    const dx = Math.cos(a), dz = Math.sin(a);
    const tx = Math.abs(dx) < 1e-9 ? Infinity : (dx > 0 ? r.e - cx : r.w - cx) / dx, tz = Math.abs(dz) < 1e-9 ? Infinity : (dz > 0 ? r.s - cz : r.n - cz) / dz, t = Math.min(tx, tz);
    return [cx + dx * rad, cz + dz * rad, cx + dx * t, cz + dz * t];
  });
  for (let i = 0; i < pts.length; i++) {
    const [ax, az, Ax, Az] = pts[i], [bx, bz, Bx, Bz] = pts[(i + 1) % pts.length];
    b.quad(m, [ax, y1, az], [bx, y1, bz], [Bx, y1, Bz], [Ax, y1, Az]);          // top
    b.quad(m, [bx, y0, bz], [ax, y0, az], [Ax, y0, Az], [Bx, y0, Bz]);          // underside
    b.quad(m, [ax, y0, az], [bx, y0, bz], [bx, y1, bz], [ax, y1, az]);          // wall of the opening
  }
}

export function build(item, ctx) {
  const S = shell(ctx), b = bbox(item.points), H = item.height, W = 'wallWhite';
  const WH = lm('white'), CO = lm('concrete'), MR = lm('maroon'), FR = lm('frame'), GG = lm('glassGreen'), GP = lm('glassPale'), CP = lm('cope'), PL = lm('plaster');
  // the slab this tower belongs to: close the slot between them
  const slab = ctx.campus && ctx.campus.items.find(i => i.mainBar && Math.abs(i.mainBar.e - b.w) < 2.5 && i.mainBar.s > b.n && i.mainBar.n < b.s);
  const x0 = slab ? slab.mainBar.e - 0.28 : b.w, x1 = b.e, z0 = b.n, z1 = b.s, sx = x1 - x0, sz = z1 - z0;
  const tall = item.id === 'slab-south-east-stair';                      // the taller box behind the roof slab (seen on the south tower only)
  const zr = tall ? z1 - 3.0 : z1;                                       // south limit of the loggia and its roof slab
  const yR0 = H - 0.35, yL = Math.round((H - 3.2) / FH) * FH, yP = yL + 1.0, yB1 = yL - 0.25, yB0 = yB1 - 2.65, floors = Math.round(yL / FH);
  const xs0 = b.w + 0.75, xs1 = b.w + 2.2;                               // the glazed strip of the north face
  const zh = Math.min(z0 + 6.0, zr - 1.0);                               // south wall of the stair hall behind it

  // ---- walls ----
  F(S.v, W, x0, 0, z0, sx, yP, sz, 'ESW');
  F(S.v, W, x0, 0, z0, xs0 - x0, yP, T, 'NE'); F(S.v, W, xs1, 0, z0, x1 - xs1, yP, T, 'NW');             // north wall round the strip
  F(S.v, W, xs0, 0, z0, xs1 - xs0, 1.1, T, 'NU'); F(S.v, W, xs0, yB0, z0, xs1 - xs0, yP - yB0, T, 'ND');
  F(S.v, W, x0, yP, z0, 0.6, yR0 - yP, 0.6, 'NSEW');                                                      // full-height pier beside the slab
  if (tall) F(S.v, W, x0, yP, zr, sx, H + 3.0 - yP, z1 - zr, 'NSEW');                                     // the taller box
  else F(S.v, W, x0, yP, z1 - T, sx, yR0 - yP, T, 'NSEW');                                                // south wall of the loggia
  hit(S, x0, 0, z0, sx, H, sz);
  // dark plinth
  const PN = face('N', z0), PE = face('E', x1), PS = face('S', z1);
  PN(S.v, lm('base'), x0, xs0, 0, 0.45, 0, 0.03, 'FU'); PN(S.v, lm('base'), xs1, x1, 0, 0.45, 0, 0.03, 'FU'); PE(S.v, lm('base'), z0, z1, 0, 0.45, 0, 0.03, 'FU'); PS(S.v, lm('base'), x0, x1, 0, 0.45, 0, 0.03, 'FU');

  // ---- stair hall behind the strip: lining, floor, glass; the stair itself is visual only ----
  F(S.v, PL, x1 - T - 0.01, 0, z0 + T, 0.01, yL - 0.15, zh - z0 - T, 'W'); F(S.v, PL, x0 + T, 0, z0 + T, 0.01, yL - 0.15, zh - z0 - T, 'E');
  F(S.v, PL, x0 + T, 0, zh, sx - 2 * T, yL - 0.15, 0.01, 'N'); F(S.v, CO, x0 + T, 0, z0 + T, sx - 2 * T, 0.02, zh - z0 - T, 'U');
  F(S.v, lm('glassCore'), xs0, 1.1, z0 + 0.1, xs1 - xs0, yB0 - 1.1, 0.02, 'N');
  for (let y = 1.1; y < yB0 - 0.5; y += FH / 2) F(S.v, FR, xs0, y, z0 + 0.04, xs1 - xs0, 0.07, 0.1, 'NUD');
  F(S.v, FR, (xs0 + xs1) / 2 - 0.03, 1.1, z0 + 0.04, 0.06, yB0 - 1.1, 0.1, 'NEW');
  dogleg(S, { x0: b.w + 0.15, x1: b.w + 3.35, zA0: zh - 1.3, zA1: zh, zB0: z0 + T, zB1: z0 + T + 1.3, floors, FH, topLanding: false });

  // ---- pale green glazed band under the loggia: north face and the northern part of the east face ----
  const band = (put, u0, u1) => {
    put(S.v, GP, u0, u1, yB0, yB1, 0, 0.03, 'F');
    put(S.v, FR, u0, u1, yB0 - 0.06, yB0, 0, 0.08, 'FUD'); put(S.v, FR, u0, u1, yB1, yB1 + 0.06, 0, 0.08, 'FUD');
    for (let i = 1; i < 4; i++) put(S.v, FR, u0, u1, yB0 + (yB1 - yB0) * i / 4 - 0.02, yB0 + (yB1 - yB0) * i / 4 + 0.02, 0.03, 0.06, 'F');
    const n = Math.round((u1 - u0) / 0.62);
    for (let i = 0; i <= n; i++) { const u = u0 + (u1 - u0) * i / n; put(S.v, FR, Math.max(u0, u - 0.025), Math.min(u1, u + 0.025), yB0, yB1, 0.03, 0.06, 'F'); }
  };
  const zb = z0 + 0.42 * sz;
  band(PN, x0 + 0.6, x1); band(PE, z0, zb);

  // ---- east face ----
  for (let k = 0; k < floors - 1; k++) win(S, PE, z0 + 1.1, z0 + 2.3, k * FH + 1.9, k * FH + 3.5, { n: 1, transom: k * FH + 3.05, glass: GG });   // column near the north-east corner
  const zw = z1 - 0.38 * sz;
  for (let k = 0; k < floors; k++) win(S, PE, zw - (k === floors - 1 ? 1.0 : 0.4), zw + (k === floors - 1 ? 0.6 : 0.4), k * FH + 1.4, k * FH + 2.4, { n: k === floors - 1 ? 1 : 0 });
  PE(S.v, MR, z1 - 1.1, z1 + 0.03, 0.3, tall ? yP : yR0, 0, 0.05, 'FLRU');                                 // dark-red strip, south end
  PS(S.v, MR, x1 - 0.9, x1 + 0.05, 0.3, tall ? yP : yR0, 0, 0.05, 'FLRU');                                 // ... wrapping the corner (assumed)
  door(S, PE, z0 + 0.5 * sz - 0.4, { w: 1.4 });
  pipe(S, PE, z1 - 1.35, yL); lamp(S, PN, x1 - 1.0, 2.8);
  // ---- south face (assumed): small stair windows ----
  for (let k = 0; k < floors; k++) win(S, PS, x0 + sx * 0.4, x0 + sx * 0.4 + 0.9, k * FH + 1.5, k * FH + 2.6, { n: 0 });

  // ---- loggia ----
  F(S.v, CO, x0 + T, yL - 0.1, z0 + T, sx - 2 * T, 0.1, zr - z0 - 2 * T, 'U');
  F(S.v, WH, x0 + 0.6, yL, z0 + T - 0.01, sx - 0.6 - T, 1.0, 0.01, 'S'); F(S.v, WH, x1 - T, yL, z0 + T, 0.01, 1.0, zr - z0 - 2 * T, 'W'); F(S.v, WH, x0 + T - 0.01, yL, z0 + 0.6, 0.01, 1.0, zr - z0 - 0.6 - T, 'E');
  F(S.v, CP, x0 + 0.6, yP, z0 - 0.04, sx - 0.56, 0.06, T + 0.08, 'NSEU'); F(S.v, CP, x1 - T - 0.04, yP, z0 + T + 0.04, T + 0.08, 0.06, zr - z0 - T - 0.04, 'EWSU');
  F(S.v, CP, x0 - 0.04, yP, z0 + 0.6, T + 0.08, 0.06, zr - z0 - 0.6, 'EWSU');
  if (!tall) F(S.v, MR, x1 - 0.3, yP, z1 - 1.1, 0.3, yR0 - yP, 1.1, 'NEW');                                 // the red strip continues up to the roof slab
  for (const [px, pz] of [[x1 - 0.2, z0 + 0.2], [x1 - 0.68, z0 + 0.2], [x1 - 0.2, z0 + 0.68]]) F(S.v, WH, px - 0.07, yP, pz - 0.07, 0.14, yR0 - yP, 0.14, 'NSEW');   // posts at the north-east corner
  const hx1 = b.w + 3.5, hz0 = z0 + 1.7, hz1 = zr - T;                                                      // stair-head box
  F(S.v, lm('shade'), x0 + T, yL, hz0, hx1 - x0 - T, yR0 - yL, hz1 - hz0, 'NE'); F(S.v, lm('dark'), hx1, yL, hz0 + 0.5, 0.02, 2.1, 0.95, 'E');
  F(S.d, lm('rail'), x0 + 0.6, yP + 0.25, z0 + 0.1, sx - 0.7, 0.05, 0.05, 'NSUD'); F(S.d, lm('rail'), x1 - 0.15, yP + 0.25, z0 + 0.1, 0.05, 0.05, zr - z0 - 0.4, 'EWUD');   // steel rail over the parapet
  lamp(S, face('E', hx1), hz0 + 1.0, yL + 2.35);

  // ---- roof slab with the round opening, pale fascia ----
  const R = { w: x0, e: x1 + 0.45, n: z0 - 0.45, s: tall ? zr : z1 + 0.3 }, rad = Math.min(1.6, 0.28 * (b.e - b.w));
  const ocx = (b.w + b.e) / 2 + 0.1, ocz = tall ? (z0 + zr) / 2 + 0.3 : (z0 + z1) / 2;
  holedSlab(S.v, lm('roof'), R, ocx, ocz, rad, yR0, H);
  F(S.v, CP, R.w, yR0, R.n - 0.02, R.e - R.w + 0.02, 0.35, 0.02, 'NUD'); F(S.v, CP, R.e, yR0, R.n, 0.02, 0.35, R.s - R.n, 'EUD'); F(S.v, CP, R.w, yR0, R.s, R.e - R.w + 0.02, 0.35, 0.02, 'SUD');
  F(S.v, CP, R.w - 0.02, yR0, R.n, 0.02, 0.35, R.s - R.n, 'W');
  F(S.d, lm('dark'), ocx - rad - 0.5, H, ocz + rad * 0.2, 0.5, 0.012, 0.9, 'U');                                  // a rain stain beside the opening

  // ---- south tower: stepped two-tier cap on the taller box, red pipes ----
  if (tall) {
    const HT = H + 3.0, d = z1 - zr;
    F(S.v, CO, x0 - 0.3, HT, zr - 0.3, sx + 0.6, 0.25, d + 0.6, 'NSEWUD');
    F(S.v, WH, x0 + sx * 0.2, HT + 0.25, zr + 0.4, sx * 0.6, 0.5, d - 0.8, 'NSEW'); F(S.v, CO, x0 + sx * 0.12, HT + 0.75, zr + 0.1, sx * 0.76, 0.2, d - 0.2, 'NSEWUD');
    hit(S, x0, H, zr, sx, HT + 0.25 - H, d);
    F(S.d, lm('red'), x0 + 0.3, HT + 0.3, zr + 0.15, sx - 0.6, 0.07, 0.07, 'NSUD'); F(S.d, lm('red'), x1 - 0.4, H, zr - 0.09, 0.07, HT + 0.3 - H, 0.07, 'NEW');
    for (let k = 0; k < 2; k++) win(S, face('N', zr), x0 + 1.2 + k * 2.4, x0 + 2.2 + k * 2.4, H + 0.9, H + 2.0, { n: 0, sill: false });
  }
  finish(S, item, ctx, b.cx, b.cz, sz / 2 + (S.low ? 45 : 70));
}
