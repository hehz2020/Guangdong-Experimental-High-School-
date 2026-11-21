// Green glass stair cores: glass-stair-block (beside the clock tower) and teaching-slab-west-annex-w (south-west corner
// of the west teaching slab). Both can be entered and their stairs climbed.
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
//     - a full-height green glass tower, about four panes wide plus a narrow one, two pane rows per storey, zigzag
//       stair flights visible through the glass;
//     - a flat white roof slab that overhangs; tall thin white fins beside the tower where it meets the corridors,
//       rising well above the roof; north of the glass the open ends of the slab's corridors show as white bands.
//
// ASSUMED: the north and west faces of glass-stair-block (glazed like the east face), the white south bay being a solid
//   shaft, pane sizes, the size of the roof box; the annex's south and east faces (glazed like the west face), 3.6 m
//   storeys to match the west slab, the fins' size and exact place. The annex's glass tower is built on the part of the
//   measured roof rectangle south of the slab's corridors (8.5 m by 5 m); the strip north of it, beside the corridor
//   ends, is left open under the roof slab, which is what frame 58 shows from the west.
//
// IMAGINED (the owner asked for real, climbable stairs and finished interiors; no reference shows any of this):
//   - the plan of both: a dog-leg stair of terrazzo steps round an open well against one long side (the flights run
//     east-west, which differs from the first reading of frame 58: "parallel to the west face"), a wall between the stair
//     and a gallery on every storey, the floor landings at the east end; granite floors, plastered soffits, ceiling
//     lamps, stainless rails, storey numbers, benches and potted plants, a store under the first return flight;
//   - glass-stair-block: six levels at the east slabs' storey height (3.9 m), the top one at 19.5 m; the white south bay
//     as a lift shaft with a (closed) lift door on every gallery; a glazed entrance on the east face; at 7.8 m a doorway
//     onto a footbridge to the elevated walkway (walkway.js), which is how the walkway is reached on foot;
//   - annex: five levels at the west slab's storey height (3.6 m); the gallery of every storey lies beside the south
//     edge of the slab's corridor, with an open bay toward it (3 m wide, at the corridor's west end): slab-wide.js leaves
//     its balustrade out there, so one walks from the stair straight into the corridor on every storey. A glazed door
//     on the east face.
// Colliders: outer walls with their doorways, floors, the dividing wall, stairs (ramps, landings, a wall in the well), the
// guard at the top, stores, benches, the roof slab and what stands on it. Leaving drone mode above either block ends on
// its roof slab.
import { plan as slabPlan } from './slab-wide.js';
import { bbox, itemPolygon } from '../../kit.js';
import { LIT } from '../../street.js';
import { shrubs } from '../../flora.js';
import { F, lm, shell, finish, hit, face, doorSet, stair, curtain, wallHit, textCard, card, lightning, rwp, stain, apron } from './plain-block.js';
import { bridgeSpec } from './walkway.js';

/**
 * The inside both blocks share. c: { ix0, ix1, iz0, iz1 (clear inside of the outer walls), lanesNorth (the two flights lie
 * along the north wall, the galleries south of them; otherwise the other way round), levels, yCeil, steps }.
 * Returns the places the caller needs: xo (edge of the floor landings), lanes [z0, z1], gallery [z0, z1], wall [z0, z1].
 */
function stairHall(S, c) {
  const { ix0, ix1, iz0, iz1, lanesNorth, levels, yCeil, steps } = c, go = 0.28, run = steps * go, xo = ix1 - 1.5, landB = xo - run - ix0;
  const PL = lm('plaster'), CE = lm('ceil'), FL = lm('graniteLight'), FB = lm('granite'), LAMP = lm('lamp'), SS = lm('steel'), top = levels.length - 1;
  const lz0 = lanesNorth ? iz0 : iz1 - 3.0, lz1 = lz0 + 3.0, zo = lz0 + 1.5, wz0 = lanesNorth ? lz1 : lz0 - 0.12, wz1 = wz0 + 0.12, gz0 = lanesNorth ? wz1 : iz0, gz1 = lanesNorth ? iz1 : wz0;
  const sz0 = Math.min(lz0, wz0), sz1 = Math.max(lz1, wz1);                              // the landing strip at the east end spans the lanes and the wall's thickness
  stair(S, { x: xo, z: zo, ang: Math.PI, levels, w: 1.4, gap: 0.2, steps, go, landB });
  // dividing wall between stair and galleries, plastered, with a skirting on the gallery side
  F(S.v, PL, ix0, 0, wz0, xo - ix0, yCeil, 0.12, 'NSE'); hit(S, ix0, 0, wz0, xo - ix0, yCeil, 0.12);
  const gPut = lanesNorth ? face('S', wz1) : face('N', wz0);
  for (let k = 0; k <= top; k++) {
    const y = levels[k];
    // floors: gallery and landing strip (granite with a darker margin), their soffits, ceiling lamps
    F(S.v, FL, ix0, y, gz0, ix1 - ix0, 0.02, gz1 - gz0, 'U'); F(S.v, FL, xo, y, sz0, ix1 - xo, 0.02, sz1 - sz0, 'U');
    F(S.d, FB, xo - 0.02, y + 0.02, sz0, 0.3, 0.004, sz1 - sz0, 'U');                    // darker strip at the head of the flights
    if (k > 0) {
      F(S.v, CE, ix0, y - 0.2, gz0, ix1 - ix0, 0.2, gz1 - gz0, 'D'); F(S.v, CE, xo, y - 0.2, sz0, ix1 - xo, 0.2, sz1 - sz0, 'DW');
      hit(S, ix0, y - 0.2, gz0, ix1 - ix0, 0.2, gz1 - gz0); hit(S, xo - 0.2, y - 0.2, sz0, ix1 - xo + 0.2, 0.2, sz1 - sz0 - 0.001);
    }
    const yc = k < top ? levels[k + 1] - 0.2 : yCeil;
    for (const [lx, lz] of [[ix0 + (ix1 - ix0) * 0.3, (gz0 + gz1) / 2], [ix0 + (ix1 - ix0) * 0.72, (gz0 + gz1) / 2], [(xo + ix1) / 2, (lz0 + lz1) / 2]]) {
      if (k === top && yc - y > 5) continue;
      F(S.d, lm('frame'), lx - 0.22, yc - 0.035, lz - 0.22, 0.44, 0.035, 0.44, 'NSEW'); F(S.d, LAMP, lx - 0.19, yc - 0.045, lz - 0.19, 0.38, 0.012, 0.38, 'D');
      if (k === 0) LIT.push([lx, lz, 2.2, yc - 0.05]);                                                  // the ground storey's lamps light its floor (street.js); the ones above are inside
    }
    // skirting, storey number, a bench and a plant on the gallery
    gPut(S.d, lm('shade'), ix0, xo, y + 0.02, y + 0.12, 0, 0.012, 'FU');
    card(S.d, gPut, textCard((k + 1) + 'F', 0.36, 0.26), xo - 1.0, xo - 0.64, y + 1.5, y + 1.76, 0.014);
    if (k < top) { const ym = (levels[k] + levels[k + 1]) / 2; F(S.d, LAMP, ix0 + 0.05, ym + 2.2, zo - 0.2, 0.03, 0.1, 0.4, 'ENSUD'); }   // lamp on the wall of the half landing
  }
  // guard across the head of the stair on the top storey (above the last flight up)
  const yT = levels[top], az0 = lz0, az1 = lz0 + 1.4;
  F(S.v, PL, xo - 0.1, yT, az0, 0.1, 1.1, az1 - az0 + 0.1, 'EWNSU'); F(S.d, SS, xo - 0.07, yT + 1.12, az0, 0.04, 0.04, az1 - az0 + 0.1, 'EWUD'); hit(S, xo - 0.1, yT + 0.01, az0, 0.1, 1.75, az1 - az0 + 0.1);
  // ground storey: a store under the first return flight (a door at its end), walls under the first half landing
  const y1 = levels[1], hl = y1 / 2, bz0 = lz0 + 1.6, bz1 = lz1;
  F(S.v, PL, xo - 0.1, 0, bz0 - 0.1, 0.1, y1 - 0.2, bz1 - bz0 + 0.1, 'E');
  doorSet(S, face('E', xo + 0.085), (bz0 + bz1) / 2, { w: 0.85, h: 2.0, rev: 0.05, step: false, lamp: false, vision: false, plate: false, leaf: lm('door') });
  F(S.v, PL, xo - run - 0.02, 0, az0, 0.02, hl - 0.16, az1 - az0, 'E');
  hit(S, xo - run + 0.01, 0.02, bz0 + 0.01, run - 0.12, 1.7, bz1 - bz0 - 0.02); hit(S, ix0, 0.02, lz0 + 0.01, xo - run - ix0 - 0.02, hl - 0.22, 2.98);
  return { xo, run, lanes: [lz0, lz1], gallery: [gz0, gz1], wall: [wz0, wz1], strip: [sz0, sz1], gPut };
}
/** A bench of timber slats on steel legs, along x, centre (x, z) on floor y; and a potted plant list entry. */
function seat(S, x, y, z) {
  for (const s of [-0.6, 0.6]) F(S.i, lm('steel'), x + s - 0.02, y + 0.02, z - 0.2, 0.04, 0.4, 0.4, 'NSEW');
  for (let i = 0; i < 4; i++) F(S.i, lm('wood'), x - 0.75, y + 0.42, z - 0.2 + i * 0.105, 1.5, 0.035, 0.085, 'NSEWUD');
  hit(S, x - 0.75, y + 0.03, z - 0.2, 1.5, 0.43, 0.4);
}
function pot(S, list, x, y, z, r = 0.3) { S.i.frame(x, z).cyl(lm('tread'), 0, y + 0.02, 0, 0.2, 0.36, 12).cyl(lm('soil'), 0, y + 0.38, 0, 0.17, 0.01, 10); S.i.frame(); list.push([x, y + 0.36, z, r]); }
function plants(S, list) {
  if (!list.length) return;
  const byY = new Map(); for (const p of list) { const k = p[1].toFixed(2); if (!byY.has(k)) byY.set(k, []); byY.get(k).push(p); }
  for (const [k, arr] of byY) { const sh = shrubs(arr.map(p => [p[0], p[2], p[3]]), { seed: 31 + arr.length, hex: 0x3f7a38 }); sh.position.y = +k; sh.castShadow = false; S.ix.push(sh); }
}

function byTower(S, r, H, ctx) {
  const FH = 3.9, levels = [0, 1, 2, 3, 4, 5].map(k => k * FH), yR = H - 1.0, yC = yR - 0.3, W = lm('white'), WH = lm('white'), CP = lm('cope'), MR = lm('maroon'), BS = lm('base');
  const zs = r.s - 1.9;                                                    // north face of the white south bay
  const PE = face('E', r.e), PN = face('N', r.n), PW = face('W', r.w), t = 0.12;
  // ---- solid parts: white south bay (the lift shaft), north-west pier, the dark-red strip at the north-east corner (SEEN)
  F(S.v, W, r.w, 0, zs, r.e - r.w, yC, r.s - zs, 'SEW'); F(S.v, lm('plaster'), r.w + t, 0, zs, r.e - r.w - 2 * t, yC, 0.01, 'N'); hit(S, r.w, 0, zs, r.e - r.w, yC, r.s - zs);
  F(S.v, W, r.w, 0, r.n, 0.5, yC, 0.5, 'NSEW'); hit(S, r.w, 0, r.n, 0.5, yC, 0.5);
  F(S.v, MR, r.e - 0.6, 0, r.n - 0.1, 0.72, H + 1.2, 0.72, 'NSEWU'); hit(S, r.e - 0.6, 0, r.n - 0.1, 0.72, H + 1.2, 0.72);
  // ---- inside
  const hall = stairHall(S, { ix0: r.w + t, ix1: r.e - t, iz0: r.n + t, iz1: zs, lanesNorth: true, levels, yCeil: yC, steps: 13 });
  const gz = (hall.gallery[0] + hall.gallery[1]) / 2, pots = [];
  // ---- doorways: the glazed entrance on the east face; at walkway level a doorway onto the footbridge
  const holes = [], br = bridgeSpec(ctx.campus);
  holes.push(doorSet(S, PE, gz, { w: 1.6, h: 2.3, glazed: true, t, rev: t / 2, fan: 0.45, swing: 'in', canopy: 1.3, step: false, plate: false, bars: lm('frameDark') }));
  PE(S.v, lm('concrete'), gz - 1.3, gz + 1.3, 0, 0.03, 0, 1.4, 'FLRU'); LIT.push([r.e + 1.4, gz, 4]); apron(ctx, 'E', r.e, gz, 3, 1.6);
  if (br) holes.push(doorSet(S, PE, (br.z0 + br.z1) / 2, { w: br.z1 - br.z0 - 0.34, h: 2.2, y0: br.y, glazed: true, t, rev: t / 2, fan: 0.4, swing: 'in', step: false, plate: false, lamp: false, bars: lm('frameDark') }));
  // ---- curtain walls on the north, east and west faces, on a dark base course
  curtain(S, PN, r.w + 0.5, r.e - 0.6, 0.3, yC, levels); curtain(S, PE, r.n + 0.62, zs, 0.3, yC, levels, holes); curtain(S, PW, r.n + 0.5, zs, 0.3, yC, levels);
  PN(S.v, BS, r.w + 0.5, r.e - 0.6, 0, 0.3, -t, 0.02, 'FBU'); PW(S.v, BS, r.n + 0.5, zs, 0, 0.3, -t, 0.02, 'FBU');
  for (const [a, b] of [[r.n + 0.62, holes[0][0]], [holes[0][1], zs]]) PE(S.v, BS, a, b, 0, 0.3, -t, 0.02, 'FBU');
  wallHit(S, PN, r.w + 0.5, r.e - 0.6, 0, yC, [], t); wallHit(S, PW, r.n + 0.5, zs, 0, yC, [], t); wallHit(S, PE, r.n + 0.62, zs, 0, yC, holes, t);
  // ---- galleries: a (closed) lift door, a bench, plants; a mat inside the entrance
  const PL = face('N', zs), lx = (r.w + r.e) / 2 - 0.6;
  for (let k = 0; k < levels.length; k++) {
    const y = levels[k];
    PL(S.d, lm('steel'), lx - 0.62, lx + 0.62, y + 0.02, y + 2.2, 0, 0.03, 'FLRU'); PL(S.d, lm('alu'), lx - 0.5, lx - 0.01, y + 0.02, y + 2.08, 0.03, 0.04, 'F'); PL(S.d, lm('alu'), lx + 0.01, lx + 0.5, y + 0.02, y + 2.08, 0.03, 0.04, 'F');
    PL(S.d, lm('black'), lx - 0.25, lx + 0.25, y + 2.25, y + 2.4, 0, 0.02, 'FLRUD'); PL(S.d, lm('steel'), lx + 0.82, lx + 0.92, y + 1.05, y + 1.3, 0, 0.015, 'FLRUD');
    if (k > 0 || !S.low) { seat(S, r.w + 1.25, y, zs - 0.4); pot(S, pots, r.w + 0.5, y, hall.gallery[0] + 0.45, 0.34); if (!S.low) pot(S, pots, r.e - 0.6, y, hall.gallery[0] + 0.45, 0.3); }
  }
  F(S.d, lm('dark'), r.e - 1.6, 0.021, gz - 0.7, 1.2, 0.006, 1.4, 'U');
  plants(S, pots);
  // ---- roof slab with a pale edge, white parapet box with something dark in it (SEEN), lightning protection
  const o = 0.3, x0 = r.w - o, z0 = r.n - o, sx = r.e - r.w + 2 * o, sz = r.s - r.n + o;
  F(S.v, lm('roof'), x0, yR - 0.3, z0, sx, 0.3, sz, 'U'); F(S.v, lm('ceil'), x0, yR - 0.3, z0, sx, 0.3, sz, 'D'); F(S.v, CP, x0, yR - 0.3, z0, sx, 0.3, sz, 'NSEW'); hit(S, x0, yR - 0.3, z0, sx, 0.3, sz);
  for (const put of [PN, PE, PW]) stain(S, put, put === PN ? r.w + 0.5 : r.n + 0.6, put === PN ? r.e - 0.6 : zs, yR - 0.3, 0.6, 0.03);
  const B = { w: r.w + 0.5, e: r.e - 2.1, n: r.n + 0.5, s: r.n + 5.1 }, tb = 0.15;
  F(S.v, WH, B.w, yR, B.n, B.e - B.w, 1.0, B.s - B.n, 'NSEW');
  F(S.v, WH, B.w + tb, yR, B.n + tb, B.e - B.w - 2 * tb, 1.0, 0.01, 'S'); F(S.v, WH, B.w + tb, yR, B.s - tb, B.e - B.w - 2 * tb, 1.0, 0.01, 'N');
  F(S.v, WH, B.w + tb, yR, B.n + tb, 0.01, 1.0, B.s - B.n - 2 * tb, 'E'); F(S.v, WH, B.e - tb, yR, B.n + tb, 0.01, 1.0, B.s - B.n - 2 * tb, 'W');
  for (const [x, z, a, c] of [[B.w, B.n, B.e - B.w, tb], [B.w, B.s - tb, B.e - B.w, tb], [B.w, B.n + tb, tb, B.s - B.n - 2 * tb], [B.e - tb, B.n + tb, tb, B.s - B.n - 2 * tb]]) { F(S.v, CP, x, yR + 1.0, z, a, 0.02, c, 'U'); hit(S, x, yR + 0.01, z, a, 1.0, c); }
  F(S.v, lm('dark'), B.w + 0.9, yR, B.n + 1.2, 1.5, 0.55, 1.1, 'NSEWU');
  lightning(S, { w: x0, e: x0 + sx, n: z0, s: z0 + sz }, yR - 0.08);
  rwp(S, PW, zs + 0.5, yR - 0.4);
}

function annex(S, r, H, ctx) {
  const W = lm('white'), WH = lm('white'), BS = lm('base'), t = 0.12;
  const slab = ctx.campus && ctx.campus.items.find(i => i.style === 'teaching-slab-wide');
  // where the slab's corridors run: the glass tower stands south of their south edge. The slab's builder says where that is.
  let zf = r.n + 3.2, xS = r.w + 5.2, FH = 3.6;
  try { if (slab) { const q = slabPlan(slab, ctx.campus); zf = q.oz + q.zS; xS = q.ox + q.X0; FH = q.FH; } } catch (e) { /* keep the defaults */ }
  if (!(zf > r.n + 0.5 && zf < r.s - 4.2)) zf = r.s - 5;
  const levels = [0, 1, 2, 3, 4].map(k => k * FH), yT = H - 0.3, PW = face('W', r.w), PS = face('S', r.s), PE = face('E', r.e), PN = face('N', zf);
  const open = xS > r.w + 2 && xS < r.e - 1.6;                               // the slab's corridor ends beside the eastern part of the north side
  const xN = open ? xS : r.e - 0.25;                                         // east end of the glazed part of the north wall
  // ---- corner piers
  for (const [x, z] of [[r.w, r.s - 0.5], [r.e - 0.5, r.s - 0.5], [r.e - 0.25, zf]]) { F(S.v, W, x, 0, z, x > r.e - 0.4 ? 0.25 : 0.5, yT, x > r.e - 0.4 ? 0.25 : 0.5, 'NSEW'); hit(S, x, 0, z, x > r.e - 0.4 ? 0.25 : 0.5, yT, x > r.e - 0.4 ? 0.25 : 0.5); }
  if (open) { F(S.v, W, xN - 0.02, 0, zf, 0.27, yT, 0.2, 'NSEW'); hit(S, xN - 0.02, 0, zf, 0.27, yT, 0.2); }
  // ---- inside
  const hall = stairHall(S, { ix0: r.w + t, ix1: r.e - t, iz0: zf + t, iz1: r.s - t, lanesNorth: false, levels, yCeil: yT, steps: 12 }), pots = [];
  // ---- the glazed door on the east face (to the slab's paved apron)
  const zd = (hall.lanes[0] + hall.lanes[1]) / 2 + 0.2, holes = [];
  holes.push(doorSet(S, PE, zd, { w: 1.5, h: 2.25, glazed: true, t, rev: t / 2, fan: 0.4, swing: 'in', canopy: 1.1, step: false, plate: false, bars: lm('frameDark') }));
  PE(S.v, lm('concrete'), zd - 1.2, zd + 1.2, 0, 0.03, 0, 1.2, 'FLRU'); LIT.push([r.e + 1.2, zd, 3.5]); apron(ctx, 'E', r.e, zd, 3, 2.2);
  if (ctx.occupy) ctx.occupy([[r.w - 1, r.n - 0.3], [r.w + 0.3, r.n - 0.3], [r.w + 0.3, zf], [r.w - 1, zf]]);     // the two fins west of the measured outline
  // ---- curtain walls: west, south, east, and the north face west of the corridor ends; a dark base course
  curtain(S, PW, zf + 0.25, r.s - 0.5, 0.3, yT, levels); curtain(S, PS, r.w + 0.5, r.e - 0.5, 0.3, yT, levels); curtain(S, PE, zf + 0.25, r.s - 0.5, 0.3, yT, levels, holes);
  curtain(S, PN, r.w + 0.25, xN, 0.3, yT, levels);
  PW(S.v, BS, zf + 0.25, r.s - 0.5, 0, 0.3, -t, 0.02, 'FBU'); PS(S.v, BS, r.w + 0.5, r.e - 0.5, 0, 0.3, -t, 0.02, 'FBU'); PN(S.v, BS, r.w + 0.25, xN, 0, 0.3, -t, 0.02, 'FBU');
  for (const [a, b] of [[zf + 0.25, holes[0][0]], [holes[0][1], r.s - 0.5]]) PE(S.v, BS, a, b, 0, 0.3, -t, 0.02, 'FBU');
  wallHit(S, PW, zf, r.s - 0.5, 0, yT, [], t); wallHit(S, PS, r.w + 0.5, r.e - 0.5, 0, yT, [], t); wallHit(S, PE, zf + 0.25, r.s - 0.5, 0, yT, holes, t); wallHit(S, PN, r.w, xN, 0, yT, [], t);
  if (open) {                                                                 // the bay toward the corridor: a white lintel at every storey, glass above the top one
    for (let k = 1; k < levels.length; k++) PN(S.v, WH, xN + 0.25, r.e - 0.25, levels[k] - 0.5, levels[k] + 0.0, -t, 0, 'FBD');
    const yg = levels[levels.length - 1] + 2.6; PN(S.v, WH, xN + 0.25, r.e - 0.25, yg - 0.25, yg, -t, 0, 'FBUD'); curtain(S, PN, xN + 0.25, r.e - 0.25, yg, yT, [yg + FH]);
    wallHit(S, PN, xN + 0.25, r.e - 0.25, yg - 0.25, yT, [], t);
  }
  // ---- galleries: a bench, plants
  const [g0, g1] = hall.gallery, gm = (g0 + g1) / 2;
  for (let k = 0; k < levels.length; k++) { const y = levels[k]; seat(S, r.w + 2.4, y, g0 + 0.36); pot(S, pots, r.w + 0.6, y, gm, 0.34); if (!S.low) pot(S, pots, r.w + 4.2, y, g0 + 0.4, 0.28); }
  plants(S, pots);
  // ---- overhanging white roof slab over the whole measured rectangle; two tall fins on the west side (SEEN: at the junction with the corridors)
  F(S.v, WH, r.w - 0.5, yT, r.n - 0.2, r.e - r.w + 1.0, 0.3, r.s - r.n + 0.7, 'NSEWU'); F(S.v, lm('ceil'), r.w - 0.5, yT, r.n - 0.2, r.e - r.w + 1.0, 0.3, r.s - r.n + 0.7, 'D'); hit(S, r.w - 0.5, yT, r.n - 0.2, r.e - r.w + 1.0, 0.3, r.s - r.n + 0.7);
  for (const z of [zf - 0.5, r.n]) { F(S.v, WH, r.w - 0.9, 0, z, 1.15, H + 3.5, 0.45, 'NSEWU'); hit(S, r.w - 0.9, 0, z, 1.15, yT - 0.01, 0.45); F(S.v, BS, r.w - 0.92, 0, z - 0.02, 1.19, 0.3, 0.49, 'NSEWU'); }
  lightning(S, { w: r.w - 0.5, e: r.e + 0.5, n: r.n - 0.2, s: r.s + 0.5 }, H - 0.08);
  for (const put of [PW, PS]) stain(S, put, put === PW ? zf + 0.3 : r.w + 0.5, put === PW ? r.s - 0.5 : r.e - 0.5, yT, 0.6, 0.03);
  rwp(S, PS, r.e - 0.25, yT - 0.2);
}

export function build(item, ctx) {
  const S = shell(ctx), b = bbox(itemPolygon(item)), H = item.height;
  const r = { w: b.w, e: b.e, n: b.n, s: b.s };
  if (item.id === 'glass-stair-block') byTower(S, r, H, ctx); else annex(S, r, H, ctx);
  finish(S, item, ctx, (r.w + r.e) / 2, (r.n + r.s) / 2, Math.max(r.e - r.w, r.s - r.n) / 2 + (S.low ? 50 : 80));
}
