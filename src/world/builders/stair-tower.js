// Stair towers at the east ends of the two east teaching slabs (items slab-north-east-stair, slab-south-east-stair).
// Both can be entered; the stair climbs four storeys from the ground to the open loggia under the roof.
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
//   loggia beside the slab's top-floor windows, so both towers are 21.5 m. The loggia is therefore the tower's fifth
//   storey: its floor is level with the slab's top floor (15.6 m), the band of small panes lights the storey below it,
//   and the roof slab hangs 5.5 m over the loggia floor.
//
// ASSUMED: the south and west faces (white, the red strip wraps the south-east corner); everything at ground level (hidden
//   by trees); sizes: band 2.65 m high, strip 1.45 m wide, windows, posts, the 3 m depth and 3 m extra height of the south
//   tower's box, the thickness of the roof slab; the 0.8 m slot the measured outlines leave between tower and slab is
//   closed (the stills show them joined).
//
// IMAGINED (the owner asked for real stairs and finished insides; no reference shows any of it):
//   - the plan: a dog-leg stair of terrazzo steps along the west wall (its half landings behind the glazed strip of the
//     north face), a lobby on every storey south of it, a closed room in the north-east corner (a door with a blank
//     plate; on the ground floor of the north tower it is the DUTY ROOM, furnished: see dutyRoom below), an entrance on
//     the east face, a back door to the south;
//   - a balcony on storeys 2 to 4 along the slab's end wall, from a door in the tower's south wall to a door in that end
//     wall at the end of the slab's corridor. That door is drawn closed: the wall belongs to teaching-slab.js and has no
//     opening, so the storeys line up with the slab's but one cannot walk through;
//   - the loggia as a terrace round the stair's head, with a rail on the parapet; on the south tower the taller box is
//     drawn as a tank room with a closed door;
//   - finishes: granite floors, a painted dado, ceiling lamps, storey numbers, hose cabinets, a store under the stair,
//     a dark tile base course, rainwater pipes, stains under sills and copings, lightning rods.
// Colliders: walls with their doorways, floors, the stair (ramps, landings, a wall in the well), parapets and guards, the
// balconies, the roof slab as four pieces round a square hole inside the round opening (a player who drops through the
// opening lands on the loggia floor, 5.9 m below), the tall box.
import { bbox } from '../../kit.js';
import { LIT } from '../../street.js';
import { F, lm, shell, finish, hit, face, facade, doorSet, stair, wallHit, pierce, textCard, card, rwp, stain, lightning, windowIn, apron } from './plain-block.js';

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
    b.quad(lm('ceil'), [bx, y0, bz], [ax, y0, az], [Ax, y0, Az], [Bx, y0, Bz]); // underside
    b.quad(lm('cope'), [ax, y0, az], [bx, y0, bz], [bx, y1, bz], [ax, y1, az]); // wall of the opening
  }
}
/** The duty room on the ground floor of the north tower: desk with a monitor, chair, key cabinet, bunk, kettle shelf. All invented. */
function dutyRoom(S, x0, x1, z0, z1) {
  const B = S.i, WD = lm('wood'), DK = lm('dark'), ST = lm('steel'), SH = lm('sheet');
  F(B, lm('granite'), x0, 0, z0, x1 - x0, 0.02, z1 - z0, 'U'); F(B, lm('ceil'), x0, FH - 0.21, z0, x1 - x0, 0.01, z1 - z0, 'D');
  F(B, lm('frame'), (x0 + x1) / 2 - 0.3, FH - 0.25, (z0 + z1) / 2 - 0.1, 0.6, 0.04, 0.2, 'NSEW'); F(B, lm('lamp'), (x0 + x1) / 2 - 0.28, FH - 0.26, (z0 + z1) / 2 - 0.08, 0.56, 0.012, 0.16, 'D');
  // desk under the east window, monitor, a ledger, a telephone; swivel chair
  F(B, WD, x1 - 0.72, 0.72, z0 + 0.5, 0.7, 0.04, 1.5, 'NSEWUD'); F(B, WD, x1 - 0.7, 0.02, z0 + 0.52, 0.66, 0.7, 0.04, 'NSEW'); F(B, WD, x1 - 0.7, 0.02, z0 + 1.94, 0.66, 0.7, 0.04, 'NSEW');
  F(B, DK, x1 - 0.2, 0.86, z0 + 0.95, 0.03, 0.32, 0.5, 'NSEWUD'); F(B, lm('glassWin'), x1 - 0.205, 0.875, z0 + 0.965, 0.004, 0.29, 0.47, 'W'); F(B, DK, x1 - 0.24, 0.76, z0 + 1.15, 0.1, 0.1, 0.1, 'NSEWU');
  F(B, SH, x1 - 0.62, 0.762, z0 + 1.45, 0.3, 0.012, 0.22, 'NSEWU'); F(B, lm('red'), x1 - 0.6, 0.76, z0 + 0.62, 0.2, 0.06, 0.16, 'NSEWU');
  F(B, DK, x1 - 1.4, 0.44, z0 + 1.0, 0.46, 0.07, 0.46, 'NSEWUD'); F(B, DK, x1 - 1.42, 0.5, z0 + 1.02, 0.05, 0.46, 0.42, 'NSEWU'); B.frame(x1 - 1.17, z0 + 1.23).cyl(ST, 0, 0.06, 0, 0.03, 0.38, 6, false).cyl(DK, 0, 0.02, 0, 0.26, 0.04, 10); B.frame();
  hit(S, x1 - 0.72, 0.02, z0 + 0.5, 0.7, 0.74, 1.5);
  // key cabinet and a clipboard on the north wall, a first-aid box
  F(B, ST, x0 + 1.15, 1.2, z0, 0.6, 0.5, 0.08, 'SEWUD'); F(B, lm('white'), x0 + 1.9, 1.35, z0, 0.3, 0.3, 0.1, 'SEWUD'); F(B, lm('red'), x0 + 2.0, 1.46, z0 + 0.1, 0.1, 0.08, 0.004, 'S'); F(B, lm('red'), x0 + 2.03, 1.42, z0 + 0.1, 0.04, 0.16, 0.004, 'S');
  F(B, lm('woodDark'), x0 + 0.02, 1.25, z1 - 1.2, 0.015, 0.36, 0.26, 'ENSUD'); F(B, SH, x0 + 0.035, 1.27, z1 - 1.18, 0.004, 0.3, 0.22, 'E');
  // bunk in the north-west corner with a folded quilt; a shelf with a kettle and cups
  const zb = z0 + 0.06;
  F(B, ST, x0 + 0.02, 0.36, zb, 0.9, 0.05, 1.95, 'NSEWUD'); for (const [dx, dz] of [[0.04, 0.02], [0.84, 0.02], [0.04, 1.88], [0.84, 1.88]]) F(B, ST, x0 + dx, 0.02, zb + dz, 0.04, 0.34, 0.04, 'NSEW');
  F(B, lm('tileGreen'), x0 + 0.04, 0.41, zb + 0.02, 0.86, 0.1, 1.9, 'NSEWU'); F(B, lm('blue'), x0 + 0.1, 0.51, zb + 0.1, 0.74, 0.16, 0.55, 'NSEWU'); F(B, lm('sheet'), x0 + 0.14, 0.51, zb + 1.45, 0.66, 0.1, 0.4, 'NSEWU');
  hit(S, x0 + 0.02, 0.02, zb, 0.9, 0.5, 1.95);
  F(B, WD, x1 - 0.32, 1.3, z1 - 1.3, 0.3, 0.03, 0.9, 'NSEWUD'); B.frame(x1 - 0.17, z1 - 1.0).cyl(ST, 0, 1.33, 0, 0.08, 0.2, 10).cyl(lm('white'), 0.0, 1.33, 0.35, 0.04, 0.08, 8).cyl(lm('white'), 0.0, 1.33, 0.48, 0.04, 0.08, 8); B.frame();
}

export function build(item, ctx) {
  const S = shell(ctx), b = bbox(item.points), H = item.height;
  const W = lm('white'), CO = lm('concrete'), MR = lm('maroon'), FR = lm('frame'), GG = lm('glassGreen'), GP = lm('glassPale'), CP = lm('cope'), PL = lm('plaster'), BS = lm('base'), FL = lm('graniteLight'), CE = lm('ceil'), SS = lm('steel'), LAMP = lm('lamp');
  // the slab this tower belongs to: close the slot between them
  const slab = ctx.campus && ctx.campus.items.find(i => i.mainBar && Math.abs(i.mainBar.e - b.w) < 2.5 && i.mainBar.s > b.n && i.mainBar.n < b.s);
  const x0 = slab ? slab.mainBar.e - 0.28 : b.w, x1 = b.e, z0 = b.n, z1 = b.s, sx = x1 - x0, sz = z1 - z0;
  const tall = item.id === 'slab-south-east-stair';                      // the taller box behind the roof slab (seen on the south tower only)
  const zr = tall ? z1 - 3.0 : z1;                                       // south limit of the loggia and its roof slab
  const yR0 = H - 0.35, yL = Math.floor((H - 2.6) / FH) * FH, yP = yL + 1.0, yB1 = yL - 0.25, yB0 = yB1 - 2.65, floors = Math.round(yL / FH);
  const levels = Array.from({ length: floors + 1 }, (_, k) => k * FH);
  // ---- plan
  const ix0 = x0 + T, ix1 = x1 - T, iz0 = z0 + T, iz1 = z1 - T, run = 13 * 0.28, zA = iz0 + 1.5 + run;          // zA: edge of the floor landings
  const xd0 = ix0 + 3.0, xd1 = xd0 + 0.12;                                                                         // dividing wall east of the two flights
  const xs0 = ix0 + 1.6 - 0.03, xs1 = ix0 + 3.0 + 0.03;                                                             // the glazed strip of the north face stands before the east flight
  const zw = Math.max(zA + 0.75, z1 - 0.38 * sz), zb = z0 + 0.42 * sz, zdE = (zA + iz1) / 2 + 0.55;                  // lobby windows, end of the band, entrance
  const PN = face('N', z0), PE = face('E', x1), PS = face('S', z1);

  // ---- outer walls with their openings (inner faces are near-view detail)
  const wallTop = yP, fo = { mat: W, t: T, inner: PL, innerBatch: S.d, iy1: yL - 0.2 };
  const N = facade(S, 'N', z0, x0, x1, 0, wallTop, { ...fo, iu0: ix0, iu1: ix1 }), E = facade(S, 'E', x1, z0, z1, 0, wallTop, { ...fo, iu0: iz0, iu1: iz1 });
  const So = facade(S, 'S', z1, x0, x1, 0, wallTop, { ...fo, iu0: ix0, iu1: ix1 });
  // north face: the narrow glazed strip (the stair shows through it), the pale green band under the loggia (SEEN)
  N.hole(xs0, xs1, 1.1, yB0 - 0.35, true);
  PN(S.v, lm('glassCore'), xs0, xs1, 1.1, yB0 - 0.35, -0.13, -0.11, 'FB');
  for (let y = 1.1; y < yB0 - 0.4; y += FH / 2) PN(S.v, FR, xs0, xs1, y - 0.035, y + 0.035, -0.16, -0.08, 'FBUD');
  PN(S.v, FR, (xs0 + xs1) / 2 - 0.03, (xs0 + xs1) / 2 + 0.03, 1.1, yB0 - 0.35, -0.16, -0.08, 'FBLR');
  const band = (A, u0, u1) => {                             // a ribbon of small pale panes: mullions every 0.62 m, three transoms
    A.win(u0, u1, yB0, yB1, { glass: GP, n: Math.max(1, Math.round((u1 - u0) / 0.62) - 1), fw: 0.05, rev: 0.1, stainLen: 0.8 });
    for (let i = 1; i < 4; i++) A.put(S.v, FR, u0 + 0.05, u1 - 0.05, yB0 + (yB1 - yB0) * i / 4 - 0.018, yB0 + (yB1 - yB0) * i / 4 + 0.018, -0.1, -0.06, 'FUD');
  };
  band(N, x0 + 0.7, x1 - 0.3); band(E, z0 + 0.3, zb);
  // east face: windows near the north-east corner, the lobby's small windows further south (a wider one at the top), the entrance
  for (let k = 0; k < floors - 1; k++) E.win(z0 + 1.1, z0 + 2.3, k * FH + 1.9, k * FH + 3.5, { n: 1, transom: 1.15, glass: GG });
  for (let k = 0; k < floors; k++) { const top = k === floors - 1; E.win(zw - 0.4, zw + (top ? 1.2 : 0.4), k * FH + 1.4, k * FH + 2.4, { n: top ? 1 : 0, glass: lm('glassWin') }); }
  E.door(zdE, { w: 1.4, h: 2.2, glazed: true, swing: 'in', fan: 0.4, canopy: 1.2, plate: false, bars: lm('frameDark') });
  PE(S.v, lm('stone'), zdE - 1.2, zdE + 1.2, 0, 0.03, 0, 1.3, 'FLRU'); LIT.push([x1 + 1.3, zdE, 3.5]); apron(ctx, 'E', x1, zdE, 3, 2.4);
  if (ctx.occupy) ctx.occupy([[x0, z0], [x1, z0], [x1, z1 + 2.7], [x0, z1 + 2.7]]);                              // the body west of the measured outline, the balconies and the back door
  // south face: a window per storey, the back door on the ground floor, the balcony door on the storeys above
  const xdS = ix0 + 0.75;
  for (let k = 0; k < floors; k++) {
    if (!(tall && k === floors - 1)) So.win(ix0 + 2.3, ix0 + 3.5, k * FH + 1.3, k * FH + 2.5, { n: 1, glass: lm('glassWin') });
    So.door(xdS, { w: 1.0, h: 2.1, y0: k * FH, swing: 'in', leaf: lm('door'), canopy: k ? 0 : 0.8, step: k === 0, lamp: k === 0, plate: false });
  }
  N.done(); E.done(); So.done();
  // west wall: against the slab below its roof; a full-height pier at the north-west corner of the loggia (SEEN)
  F(S.v, W, x0, 0, z0, T, yR0, tall ? zr - z0 : sz, 'WE'); F(S.d, PL, x0 + T - 0.01, 0, iz0, 0.01, yL - 0.2, iz1 - iz0, 'E'); hit(S, x0, 0, z0, T, yR0, sz);
  F(S.v, W, x0, yL, z0, 0.6, yR0 - yL, 0.6, 'NSEW'); hit(S, x0 + T + 0.01, yL, z0 + T + 0.01, 0.34, yR0 - yL, 0.34);
  wallHit(S, PN, x0, x1, 0, yL, [], T); wallHit(S, PE, z0 + T, z1 - T, 0, yL, E.holes.filter(h => h[2] < 0.1 && h[3] > 2), T); wallHit(S, PS, x0, x1, 0, yL, So.holes.filter(h => h[3] - h[2] > 2), T);
  // dark base course, the dark-red strip at the south end of the east face, wrapping the corner (SEEN / assumed)
  PN(S.v, BS, x0, x1, 0, 0.45, 0, 0.03, 'FU'); for (const [a, c] of [[z0, zdE - 0.77], [zdE + 0.77, z1]]) PE(S.v, BS, a, c, 0, 0.45, 0, 0.03, 'FU');
  for (const [a, c] of [[x0, xdS - 0.57], [xdS + 0.57, x1]]) PS(S.v, BS, a, c, 0, 0.45, 0, 0.03, 'FU');
  PE(S.v, MR, z1 - 1.1, z1 + 0.03, 0.3, tall ? yP : yR0, 0, 0.05, 'FLRU'); PS(S.v, MR, x1 - 0.9, x1 + 0.05, 0.3, tall ? yP : yR0, 0, 0.05, 'FLRU');
  rwp(S, PE, z1 - 1.35, yL - 0.2); rwp(S, PN, x1 - 0.5, yL - 0.2);
  stain(S, PN, x0 + 0.6, x1, yP, 0.8); stain(S, PE, z0, zr, yP, 0.8);

  // ---- the stair: two flights per storey along the west wall, half landings at the north end; a wall east of it
  stair(S, { x: ix0 + 1.5, z: zA, ang: Math.PI / 2, levels, w: 1.4, gap: 0.2, steps: 13, go: 0.28, landB: 1.5 });
  F(S.d, PL, xd0, 0, iz0, 0.12, yL, zA - iz0, 'EW'); F(S.d, PL, xd0, 0, zA - 0.01, 0.12, yL, 0.01, 'S'); hit(S, xd0, 0, iz0, 0.12, yL + 1.75, zA - iz0);
  F(S.v, W, xd0, yL, iz0, 0.12, 1.05, zA - iz0, 'EWSU'); F(S.v, CP, xd0 - 0.02, yL + 1.05, iz0, 0.16, 0.05, zA - iz0 + 0.02, 'EWSUD');                       // the wall goes on as the guard of the stair's head in the loggia
  F(S.v, W, ix0 + 1.5, yL, zA - 0.12, xd0 - ix0 - 1.5, 1.05, 0.12, 'NSWU'); F(S.v, CP, ix0 + 1.48, yL + 1.05, zA - 0.14, xd0 - ix0 - 1.48, 0.05, 0.16, 'NSWUD'); hit(S, ix0 + 1.5, yL + 0.01, zA - 0.12, xd0 - ix0 - 1.5, 1.75, 0.12);
  // north-east room: its wall to the lobby, a door with a blank plate on every storey
  const xr0 = xd1, PR = face('S', zA);
  for (let k = 0; k < floors; k++) {
    const y = k * FH, duty = k === 0 && !tall && !S.low, R = facade(S, 'S', zA, xr0, ix1, y, y + FH - 0.2, { mat: PL, t: 0.12, inner: PL, innerBatch: S.i });
    // lobby: floor, ceiling, lamps, dado, storey number, hose cabinet; the room's door
    F(S.d, FL, ix0, y, zA, ix1 - ix0, 0.02, iz1 - zA, 'U'); F(S.d, CE, ix0, y + FH - 0.2, zA, ix1 - ix0, 0.01, iz1 - zA, 'D');
    if (k) { hit(S, ix0, y - 0.2, zA - 0.2, ix1 - ix0, 0.2, iz1 - zA + 0.2); F(S.d, CE, ix0, y - 0.2, zA - 0.01, ix1 - ix0, 0.2, 0.01, 'N'); }
    for (const lx of [ix0 + 1.5, ix0 + 4.4]) { F(S.d, FR, lx - 0.22, y + FH - 0.235, (zA + iz1) / 2 - 0.22, 0.44, 0.035, 0.44, 'NSEW'); F(S.d, LAMP, lx - 0.19, y + FH - 0.245, (zA + iz1) / 2 - 0.19, 0.38, 0.012, 0.38, 'D'); }
    R.door(xr0 + 0.9, { w: 0.95, h: 2.05, y0: y, swing: duty ? 'in' : undefined, step: false, lamp: false, vision: !duty, leaf: lm('wood'), plateMat: duty ? textCard('值班室', 0.28, 0.18) : undefined, canopy: 0 });
    if (duty) R.win(xr0 + 1.8, ix1 - 0.3, y + 1.0, y + 2.1, { n: 1, glass: lm('glassLobby'), sill: false, rev: 0.05 });
    R.done();
    wallHit(S, PR, xr0, ix1, y, y + FH - 0.2, duty ? [R.holes[0]] : [], 0.12);
    for (const [put, a, c, hs] of [[face('W', ix1), zA, iz1, E.holes], [face('N', iz1), ix0, ix1, So.holes], [face('E', ix0), zA, iz1, []]]) { pierce(S.d, lm('dado'), put, a, c, y + 0.02, y + 1.1, hs, 0, 0.006, 'F'); pierce(S.d, lm('dadoLine'), put, a, c, y + 1.1, y + 1.13, hs, 0, 0.01, 'FUD'); }
    card(S.d, face('S', zA), textCard((k + 1) + 'F', 0.3, 0.22), xr0 + 0.03, xr0 + 0.33, y + 1.5, y + 1.72, 0.014);
    const PH = face('E', ix0); PH(S.d, lm('red'), zA + 1.7, zA + 2.4, y + 0.85, y + 1.8, 0, 0.08, 'FLRUD'); PH(S.d, lm('glassWin'), zA + 1.76, zA + 2.34, y + 0.91, y + 1.74, 0.08, 0.084, 'F');
    if (duty) dutyRoom(S, xr0, ix1, iz0, zA - 0.12);
  }
  // loggia floor (a terrace round the stair's head): over the lobby and over the north-east room
  F(S.v, CO, x0 + T, yL - 0.2, zA, sx - 2 * T, 0.2, zr - zA - (tall ? 0 : T), 'U'); F(S.v, CO, xd1, yL - 0.2, z0 + T, x1 - T - xd1, 0.2, zA - z0 - T, 'U');
  hit(S, ix0, yL - 0.2, zA - 0.2, ix1 - ix0, 0.2, iz1 - zA + 0.2); hit(S, xd1 - 0.01, yL - 0.2, iz0, ix1 - xd1 + 0.01, 0.2, zA - 0.2 - iz0);
  F(S.d, CE, ix0, yL - 0.2, iz0, xd0 - ix0, 0.01, zA - iz0, 'D');
  // ground storey: a store under the first return flight (west flight), walls under the first half landing
  F(S.d, PL, ix0, 0, zA, 1.5, FH - 0.2, 0.1, 'S'); doorSet(S, face('S', zA + 0.185), ix0 + 0.72, { w: 0.85, h: 2.0, rev: 0.05, step: false, lamp: false, vision: false, plate: false, leaf: lm('door') });
  F(S.d, PL, ix0 + 1.6, 0, zA - run - 0.02, 1.4, FH / 2 - 0.16, 0.02, 'S');
  hit(S, ix0 + 0.01, 0.02, zA - run + 0.01, 1.38, 1.7, run - 0.12); hit(S, ix0 + 0.01, 0.02, iz0, 2.98, FH / 2 - 0.22, 1.5 - 0.02);

  // ---- balconies on the storeys above the ground: from the tower's south door along the slab's end wall to a (closed) door in it
  if (slab) for (let k = 1; k < floors; k++) {
    const y = k * FH, bx0 = x0 + 0.02, bx1 = x0 + 1.85, bz1 = z1 + 2.55, zc = z1 + 1.35;
    F(S.v, FL, bx0, y - 0.02, z1, bx1 - bx0, 0.02, bz1 - z1, 'U'); F(S.v, W, bx0, y - 0.45, z1, bx1 - bx0, 0.43, bz1 - z1, 'ESD'); hit(S, bx0, y - 0.2, z1 + 0.01, bx1 - bx0, 0.2, bz1 - z1);
    for (const [x, z, a, c, fc] of [[bx1 - 0.12, z1, 0.12, bz1 - z1, 'EW'], [bx0, bz1 - 0.12, bx1 - bx0 - 0.12, 0.12, 'NS']]) {
      F(S.v, W, x, y, z, a, 0.95, c, fc); F(S.v, CP, x - 0.02, y + 0.95, z - 0.02, a + 0.04, 0.05, c + 0.04, 'NSEWUD'); hit(S, x, y + 0.01, z, a, 1.75, c);
    }
    F(S.d, SS, bx1 - 0.08, y + 1.1, z1, 0.04, 0.04, bz1 - z1, 'EWUD'); F(S.d, SS, bx0, y + 1.1, bz1 - 0.08, bx1 - bx0, 0.04, 0.04, 'NSUD');
    const pd = face('E', x0 - 0.02 + 0.09);
    doorSet(S, pd, zc, { w: 0.9, h: 2.05, y0: y, rev: 0.05, step: false, lamp: false, canopy: 0.5, leaf: lm('door'), plateMat: textCard((k + 1) + 'F', 0.28, 0.18) });
    pd(S.v, W, zc - 0.62, zc + 0.62, y, y + 2.3, -0.07, -0.05, 'F'); hit(S, x0 - 0.04, y + 0.01, z1 + 0.01, 0.06, 2.4, bz1 - z1 - 0.02);     // closed, whether or not the slab's wall is there
    stain(S, face('E', bx1), z1, bz1, y - 0.03, 0.4);
  }

  // ---- loggia: parapet with a rail, posts at the north-east corner (SEEN); on the south tower the tall box behind it
  F(S.v, W, x0 + 0.6, yL, z0 + T - 0.01, sx - 0.6 - T, 1.0, 0.01, 'S'); F(S.v, W, x1 - T, yL, z0 + T, 0.01, 1.0, zr - z0 - 2 * T, 'W');
  F(S.v, CP, x0 + 0.6, yP, z0 - 0.04, sx - 0.56, 0.06, T + 0.08, 'NSEU'); F(S.v, CP, x1 - T - 0.04, yP, z0 + T + 0.04, T + 0.08, 0.06, zr - z0 - T - 0.04, 'EWSU');
  hit(S, x0 + 0.6, yL + 0.01, z0, sx - 0.6, 1.75, T); hit(S, x1 - T, yL + 0.01, z0 + T + 0.01, T, 1.75, zr - z0 - T - 0.02);
  if (!tall) { F(S.v, W, x0 + T, yL, z1 - T - 0.01, sx - 2 * T, 1.0, 0.01, 'N'); F(S.v, CP, x0, yP, z1 - T - 0.04, sx, 0.06, T + 0.08, 'NSEWU'); hit(S, x0, yL + 0.01, z1 - T, sx, 1.75, T); F(S.v, MR, x1 - 0.3, yP, z1 - 1.1, 0.3, yR0 - yP, 1.1, 'NEW'); F(S.v, MR, x1 - 0.9, yP, z1 - 0.3, 0.6, yR0 - yP, 0.3, 'NSW'); }
  for (const [px, pz] of [[x1 - 0.2, z0 + 0.2], [x1 - 0.68, z0 + 0.2], [x1 - 0.2, z0 + 0.68]]) F(S.v, W, px - 0.07, yP, pz - 0.07, 0.14, yR0 - yP, 0.14, 'NSEW');
  F(S.d, SS, x0 + 0.6, yP + 0.2, z0 + 0.1, sx - 0.7, 0.045, 0.045, 'NSUD'); F(S.d, SS, x1 - 0.15, yP + 0.2, z0 + 0.1, 0.045, 0.045, zr - z0 - 0.4, 'EWUD');
  for (let x = x0 + 0.9; x < x1 - 0.2; x += 1.4) F(S.d, SS, x, yP + 0.06, z0 + 0.11, 0.025, 0.14, 0.025, 'NSEW');
  for (let z = z0 + 0.6; z < zr - 0.3; z += 1.4) F(S.d, SS, x1 - 0.14, yP + 0.06, z, 0.025, 0.14, 0.025, 'NSEW');
  card(S.d, face('S', zA), textCard((floors + 1) + 'F', 0.36, 0.26), xd0 - 0.5, xd0 - 0.14, yL + 0.55, yL + 0.81, 0.014);
  F(S.d, FR, xd1 + 1.2, yR0 - 0.04, zA - 2.2, 0.5, 0.04, 0.5, 'NSEW'); F(S.d, LAMP, xd1 + 1.23, yR0 - 0.05, zA - 2.17, 0.44, 0.012, 0.44, 'D');

  // ---- roof slab with the round opening, pale fascia; colliders: four pieces round a square hole inside the circle
  const R = { w: x0, e: x1 + 0.45, n: z0 - 0.45, s: tall ? zr : z1 + 0.3 }, rad = Math.min(1.6, 0.28 * (b.e - b.w));
  const ocx = (b.w + b.e) / 2 + 0.1, ocz = tall ? (z0 + zr) / 2 + 0.3 : (z0 + z1) / 2, hs = rad * 0.7;
  holedSlab(S.v, lm('roof'), R, ocx, ocz, rad, yR0, H);
  F(S.v, CP, R.w, yR0, R.n - 0.02, R.e - R.w + 0.02, 0.35, 0.02, 'NUD'); F(S.v, CP, R.e, yR0, R.n, 0.02, 0.35, R.s - R.n, 'EUD'); F(S.v, CP, R.w, yR0, R.s, R.e - R.w + 0.02, 0.35, 0.02, 'SUD');
  F(S.v, CP, R.w - 0.02, yR0, R.n, 0.02, 0.35, R.s - R.n, 'W');
  hit(S, R.w, yR0, R.n, R.e - R.w, 0.35, ocz - hs - R.n); hit(S, R.w, yR0, ocz + hs, R.e - R.w, 0.35, R.s - ocz - hs);
  hit(S, R.w, yR0, ocz - hs + 0.001, ocx - hs - R.w, 0.35, 2 * hs - 0.002); hit(S, ocx + hs, yR0, ocz - hs + 0.001, R.e - ocx - hs, 0.35, 2 * hs - 0.002);
  F(S.d, lm('dark'), ocx - rad - 0.5, H, ocz + rad * 0.2, 0.5, 0.012, 0.9, 'U');                                  // a rain stain beside the opening
  lightning(S, R, H - 0.08);

  // ---- south tower: the taller box (a tank room with a closed door), its stepped two-tier cap, red pipes
  if (tall) {
    const HT = H + 3.0, d = z1 - zr, PB = face('N', zr);
    F(S.v, W, x0, yL, zr, sx, HT - yL, d, 'N'); F(S.v, W, x0, yP, zr, sx, HT - yP, d, 'SEW'); hit(S, x0, yL + 0.01, zr, sx, HT - yL, d);
    doorSet(S, face('N', zr - 0.09), x0 + sx * 0.5, { w: 0.9, h: 2.0, y0: yL, rev: 0.05, step: false, lamp: true, vision: false, leaf: lm('door') });
    F(S.v, CO, x0 - 0.3, HT, zr - 0.3, sx + 0.6, 0.25, d + 0.6, 'NSEWUD');
    F(S.v, W, x0 + sx * 0.2, HT + 0.25, zr + 0.4, sx * 0.6, 0.5, d - 0.8, 'NSEW'); F(S.v, CO, x0 + sx * 0.12, HT + 0.75, zr + 0.1, sx * 0.76, 0.2, d - 0.2, 'NSEWUD');
    hit(S, x0 - 0.3, HT, zr - 0.3, sx + 0.6, 0.25, d + 0.6);
    F(S.d, lm('red'), x0 + 0.3, HT + 0.3, zr + 0.15, sx - 0.6, 0.07, 0.07, 'NSUD'); F(S.d, lm('red'), x1 - 0.4, H, zr - 0.09, 0.07, HT + 0.3 - H, 0.07, 'NEW');
    for (let k = 0; k < 2; k++) windowIn(S, PB, x0 + 1.2 + k * 3.4, x0 + 2.2 + k * 3.4, H + 0.9, H + 2.0, { n: 0, sill: false, rev: -0.02 });
  }
  finish(S, item, ctx, b.cx, b.cz, sz / 2 + (S.low ? 45 : 70));
}
