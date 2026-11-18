// Clock tower south-east of the plaza canopy. Everything is derived from item.points (the shaft) and item.height (top of
// the dark-red cap); the heights below are given for the stored 41 m and scale with item.height.
//
// SEEN in the 2018 footage (frames 6 to 10 and the frames between them, from the north-east round to the east; frames 43
// and 53 from the running track in the west) and checked against the frame resected by the tower-location agent (camera due
// east of the tower, about 21.5 px per metre on the shaft):
//   - lower shaft: plain white up to about 26.5 m; on the east face one small three-pane window at about 17.7 to 19.3 m, in
//     the northern half of the face;
//   - fin section, about 26.5 m to the platform: on the east face the southern 1.2 m is solid white, the rest is green glass
//     behind four white vertical fins; from the west the same level shows white uprights with pale gaps;
//   - a green glazed panel on the north face, about 2.8 m long from the north-east corner, from about 24.3 to 30 m (seen
//     foreshortened from the north-east, edge-on and invisible from the east);
//   - a thin platform slab at about 32.1 m, about 1 m beyond the shaft to the east, less to the north, 1 to 2.6 m to the
//     south (the larger readings probably include the stair's top landing);
//   - the head stands on the south part of the platform and is narrower than the shaft: a thin north-south panel about
//     4.2 m long and 8.9 m high. Seen from the east: a dark-red pier 0.85 m wide at the south end, which stands outside
//     the shaft's south face and runs down below the platform to the base of the fin section; a white panel 3.4 m wide with
//     the school emblem (a diamond about 2.4 m across, its centre about a third of the way down the white part); a dark-red
//     cap 2.3 m high over both. Seen from the west the whole head is red-orange with a pale round disc near the top (too
//     soft to read as a clock face: drawn as a plain disc);
//   - a thin mast at the south end of the cap, with a small ladder-like frame at its foot, top at about 46 m;
//   - an open stair on the south side, one lane wide, its treads seen head-on from the east in three groups, the highest at
//     platform level; its lowest visible landing is at about 24.9 m.
//
// ASSUMED (kept plain):
//   - how far west the head stands on the platform: the two views disagree (0.6 m from the west face or about 2 m behind
//     the platform's east edge); it is drawn in the middle of the shaft, 0.8 m thick;
//   - the west face of the fin section (drawn like the east face), the north and south walls at that level (solid white);
//   - the stair: three zig-zag flights of 2.4 m in one lane 1.6 m wide, carried on brackets from the shaft. In reality it
//     starts from the roof of a block south of the tower that is not in the data, so here it begins in mid-air at its
//     lowest visible landing; it is visual only and cannot be reached;
//   - the rail round the south end of the platform, the size of the mast's frame and its three cross bars;
//   - everything below about 17 m (hidden in every frame): a dark base course and one plain door on the east face;
//   - the emblem itself is the simplified drawing of signs.js.
// Colliders: the shaft, the platform slab and the head, so a player leaving drone mode above the tower lands on the cap
// or on the platform.
import { THREE, bbox } from '../../kit.js';
import { emblemTexture } from '../../signs.js';
import { F, lm, shell, finish, hit, face, win, door, ramp } from './plain-block.js';

let emblemMat = null;

export function build(item, ctx) {
  const S = shell(ctx), r = bbox(item.points), H = item.height, k = H / 41, sx = r.sx, sz = r.sz;
  const yF = H - 14.5 * k, yP = H - 8.9 * k, tP = 0.35, yCap = H - 2.3 * k, hF = yP - tP - yF;      // fin base, platform top, cap underside
  const W = 'wallWhite', WH = lm('white'), MR = lm('maroon'), GG = lm('glassGreen'), FR = lm('frame'), CO = lm('concrete'), RA = lm('rail');
  const PE = face('E', r.e), PW = face('W', r.w), PN = face('N', r.n);

  // ---- lower shaft, base course, window, door
  F(S.v, W, r.w, 0, r.n, sx, yF, sz, 'NSEWU');
  F(S.v, lm('base'), r.w - 0.03, 0, r.n - 0.03, sx + 0.06, 0.45, sz + 0.06, 'NSEWU');
  win(S, PE, r.n + sz * 0.13, r.n + sz * 0.51, H - 23.3 * k, H - 21.7 * k, { n: 2 });
  door(S, PE, r.cz, { w: 1.2, h: 2.1, canopy: 0.8 });

  // ---- fin section: solid south bay and north wall, green glass between them behind four fins on the east and west faces
  const zg0 = r.n + 0.5, zg1 = r.s - 1.2, pitch = (zg1 - zg0) / 5;
  F(S.v, W, r.w, yF, zg1, sx, hF, r.s - zg1, 'NSEW'); F(S.v, W, r.w, yF, r.n, sx, hF, 0.5, 'NSEW');
  F(S.v, GG, r.w + 0.55, yF, zg0, sx - 1.1, hF, zg1 - zg0, 'EW');
  for (let j = 1; j <= 4; j++) {
    const z = zg1 - j * pitch - 0.09;
    F(S.v, WH, r.e - 0.55, yF, z, 0.55, hF, 0.18, 'NSE'); F(S.v, WH, r.w, yF, z, 0.55, hF, 0.18, 'NSW');
  }
  for (const put of [PE, PW]) for (const f of [0.3, 0.62]) put(S.d, FR, zg0, zg1, yF + hF * f - 0.03, yF + hF * f + 0.03, -0.55, -0.5, 'F');   // transoms of the glass
  // green glazed panel on the north face
  const gx0 = r.e - 0.3 - Math.min(2.8, sx - 0.6), gx1 = r.e - 0.3, gy0 = H - 16.7 * k, gy1 = H - 11 * k;
  PN(S.v, GG, gx0, gx1, gy0, gy1, 0.02, 0.1, 'FLRUD');
  for (let i = 0; i <= 3; i++) { const u = gx0 + (gx1 - gx0) * i / 3; PN(S.d, FR, u - 0.03, u + 0.03, gy0, gy1, 0.1, 0.14, 'FLR'); }
  for (let i = 0; i <= 3; i++) { const y = gy0 + (gy1 - gy0) * i / 3; PN(S.d, FR, gx0, gx1, y - 0.03, y + 0.03, 0.1, 0.13, 'FUD'); }

  // ---- platform
  const px0 = r.w - 1.0, px1 = r.e + 1.0, pz0 = r.n - 0.6, pz1 = r.s + 1.0;
  F(S.v, lm('cope'), px0, yP - tP, pz0, px1 - px0, tP, pz1 - pz0, 'NSEWUD');

  // ---- head: one dark-red slab (red west face, cap and south pier) with the white emblem panel on its east face
  const hx0 = r.cx - 0.4, hx1 = r.cx + 0.4, hz0 = r.s - 3.4 * Math.min(1, sz / 5.5), hz1 = r.s + 0.85;
  F(S.v, MR, hx0, yP, hz0, hx1 - hx0, H - yP, hz1 - hz0, 'NSEWU');
  F(S.v, MR, hx0, yF, r.s, hx1 - hx0, yP - tP - yF, hz1 - r.s, 'SEWD');                               // the pier below the platform
  F(S.v, WH, hx1, yP, hz0 - 0.03, 0.12, yCap - yP, r.s - hz0 + 0.03, 'NSEU');
  if (!emblemMat) { emblemMat = new THREE.MeshStandardMaterial({ map: emblemTexture('#f2f0e9'), roughness: 0.75 }); emblemMat.name = 'tower-emblem'; }
  const es = Math.min(2.5, (r.s - hz0) * 0.74), emblem = new THREE.Mesh(new THREE.PlaneGeometry(es, es), emblemMat);
  emblem.position.set(hx1 + 0.135, yCap - (yCap - yP) * 0.35, (hz0 + r.s) / 2); emblem.rotation.y = Math.PI / 2; ctx.add(emblem);
  // pale disc on the west face
  const dr = 1.15 * k, dy = H - 3.3 * k, dz = (hz0 + hz1) / 2, dxw = hx0 - 0.02, P = a => [dxw, dy + dr * Math.sin(a), dz + dr * Math.cos(a)];
  S.v.frame();
  for (let i = 0; i < 24; i += 2) S.v.quad(lm('cream'), [dxw, dy, dz], P(i / 24 * 2 * Math.PI), P((i + 1) / 24 * 2 * Math.PI), P((i + 2) / 24 * 2 * Math.PI));

  // ---- mast at the south end of the cap: pole (always drawn), ladder-like frame and cross bars (near view)
  const mx = r.cx, mz = hz1 - 0.4, yM = H + 5.3 * k;
  S.v.frame(mx, mz).cyl(lm('alu'), 0, H, 0, 0.06, yM - H, 6, false); S.v.frame();
  for (const [ax, az] of [[-0.3, -0.25], [0.3, -0.25], [-0.3, 0.25], [0.3, 0.25]]) F(S.d, lm('alu'), mx + ax - 0.025, H, mz + az - 0.025, 0.05, 1.3, 0.05, 'NSEW');
  for (const y of [0.45, 0.9, 1.3]) { F(S.d, lm('alu'), mx - 0.3, H + y - 0.02, mz - 0.27, 0.6, 0.04, 0.04, 'NSUD'); F(S.d, lm('alu'), mx - 0.3, H + y - 0.02, mz + 0.23, 0.6, 0.04, 0.04, 'NSUD'); }
  for (const y of [1.9, 2.5, 3.1]) F(S.d, lm('alu'), mx - 0.45, H + y * k, mz - 0.02, 0.9, 0.04, 0.04, 'NSUDEW');

  // ---- open stair on the south side: landings at both ends of one lane, three zig-zag flights up to the platform
  const z0 = r.s + 1.1, z1 = r.s + 2.7, zc = (z0 + z1) / 2, xE = r.e - 0.3, xW = r.w + 0.3, yL = H - 16.1 * k, rise = (yP - yL) / 3, steps = 13, TR = lm('tread');
  const landing = (east, y) => {
    const x = east ? xE : xW - 1.2;
    F(S.v, CO, x, y - 0.15, z0, 1.2, 0.15, z1 - z0, 'NSEWUD');
    F(S.v, WH, east ? r.e - 0.35 : r.w + 0.15, y - 0.45, r.s, 0.2, 0.3, z1 - r.s, 'SEWD');                 // bracket from the shaft
    const xo = east ? x + 1.2 - 0.04 : x;                                                                  // rail at the outer end
    F(S.d, RA, xo, y + 0.95, z0, 0.04, 0.05, z1 - z0, 'EWUD');
    for (const z of [z0, zc, z1 - 0.04]) F(S.d, RA, xo, y, z, 0.04, 0.95, 0.04, 'NSEW');
  };
  landing(true, yL);
  for (let f = 0; f < 3; f++) {
    const west = f % 2 === 0, xa = west ? xE : xW, xb = west ? xW : xE, ya = yL + f * rise, yb = ya + rise, go = (xb - xa) / steps;
    ramp(S.v, CO, [xa, ya - 0.02, zc], [xb, yb - 0.02, zc], z1 - z0, 0.14, 'UDSN');
    if (!S.low) for (let i = 0; i < steps; i++) F(S.d, TR, Math.min(xa + i * go, xa + (i + 1) * go), ya + i * rise / steps, z0, Math.abs(go), rise / steps, z1 - z0, west ? 'UE' : 'UW');
    for (const z of [z0 + 0.03, z1 - 0.03]) {
      S.d.strut(RA, [xa, ya + 0.95, z], [xb, yb + 0.95, z], 0.05); S.d.frame();
      for (const t of [0, 0.5, 1]) F(S.d, RA, xa + (xb - xa) * t - 0.02, ya + rise * t, z - 0.02, 0.04, 0.95, 0.04, 'NSEW');
    }
    if (f < 2) landing(!west, yb);
  }
  // the top flight arrives on a landing at platform level, joined to the platform; a rail round the platform's south end
  F(S.v, lm('cope'), xW - 1.2, yP - tP, pz1, 1.2, tP, z1 - pz1, 'SEWUD');
  for (const [x, z, a, c] of [[xW - 1.2, z1 - 0.04, 1.2, 0.04], [xW - 1.2, pz1, 0.04, z1 - pz1], [xW, pz1 - 0.04, px1 - xW, 0.04], [px0, r.s, 0.04, pz1 - r.s], [px1 - 0.04, r.s, 0.04, pz1 - r.s]]) {
    F(S.d, RA, x, yP + 1.0, z, a, 0.05, c, 'NSEWUD'); F(S.d, RA, x, yP + 0.5, z, a, 0.04, c, 'NSEWUD');
    F(S.d, RA, x, yP, z, 0.04, 1.0, 0.04, 'NSEW'); F(S.d, RA, x + a - 0.04, yP, z + c - 0.04, 0.04, 1.0, 0.04, 'NSEW');
  }

  hit(S, r.w, 0, r.n, sx, yP - tP, sz); hit(S, px0, yP - tP, pz0, px1 - px0, tP, pz1 - pz0); hit(S, hx0, yP, hz0, hx1 - hx0, H - yP, hz1 - hz0);
  finish(S, item, ctx, r.cx, r.cz, S.low ? 70 : 110);
}
