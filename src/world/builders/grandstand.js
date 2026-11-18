// West grandstand building (item grandstand-roof: the measured outline is the main block's roof).
//
// SEEN in the references:
// - 2018 drone video frames 12-14, 31-35, 38-41, 46-48, 61-63 and 2022 sports-day video frames 2, 9, 42-43 (plus stills
//   at 0:03 and 1:43-1:46): brick-red main block; wide white full-height pilasters with a tall narrow teal window on
//   each side and a small white railing at the window sill; a continuous clerestory band with white mullions; a thin
//   flat pale roof with a deep eave and slightly bowed ends (satellite image); a ribbon of white-framed glazing at the
//   level of the top seating tier. Pilasters: frame 48 shows 9 white verticals, eight regular and a north corner pier
//   after a shorter bay.
// - South wing: lower brick wall set back a little, one pair of smaller windows per bay, thin white columns in the
//   rhythm of the main bays carrying an open white pergola at the height of the clerestory sill, a white balcony in the
//   second bay with a white stair down to the terrace, and at the south end a round stair tower: brick below, a glazed
//   drum with white ribs above, flat overhanging disc roof. Five columns in all (frame 39, 2022 still at 0:03).
// - North end: lower white flat-roofed portal with glazing facing the track and a white screen wall at its north end.
//
// IMAGINED (the brief asks for a showpiece and says looks matter more than facts):
// - The east eave is drawn as a 5.2 m steel canopy over a concourse behind the seats (the measured roof outline is kept;
//   the east wall is set back to make room): tapered beams on the pilasters with knee braces, purlins, tie rods in the
//   roof plane, a ribbed sheet soffit, a fascia with a box gutter and downpipes. The other eaves are 2.0 m.
// - Floodlights under the canopy edge and under the pergola beam, with three real lamps behind them that light the
//   track, the seats and the face of the stand after dusk (on phones only pools of light on the track), horn
//   loudspeakers, the commentary box hung on the facade
//   in the middle of the bank, wall lamps, benches and bins on the concourse, roof ventilators and lightning rods.
// - All vertical sizes (the data height of 15 m is used as given; the real building looks nearer 21 m).
// - The west face (pilasters, two rows of windows, two entrances with hung canopies), both end walls, the wing's plan
//   behind its east wall and its windows, the portal's plan, the screen of fins at its north end.
// - The inside of the round tower: a helical stair round an open well from the ground to the concourse and on to a
//   glazed lookout room under the disc roof. Its glass is clear so that the stair shows. Every other door is closed and
//   the glazing elsewhere is reflecting: there are no rooms behind it. Door plates are generic.
// - The balcony stair is a single straight flight (the footage shows a white zigzag stringer, probably two flights).
// Collision: the block, wing and portal as solids; the concourse, the balcony and its stair, the tower stair and its two
// floors are walkable. Every guard is a solid of its full thickness reaching 1.7 m above the floor beside it.
import { THREE, mat, bbox, prism } from '../../kit.js';
import { Batch } from '../../batch.js';
import { flatPoly } from '../../shapes.js';
import { pbr, plain } from '../../hifi.js';
import { LIT } from '../../street.js';
import { Batch2, hexa, prismX, prismZ, S3, M, glass, lamp, nightly, plate, tiers, instanced, railZ, layout, BARRIER } from './seating.js';

const EAVE = 2.0, EAVE_E = 5.2;  // roof overhang beyond the walls; the east one is the canopy over the concourse
const PW = 1.45, PD = 0.35;     // pilaster width and projection
const WIN = 1.15;               // tall window width
const BOW = 1.2;                // how far the middle of each end eave bows out beyond its corners
const LEAF = 0.2;               // depth of the window reveals: the facing brick is built as a leaf with openings
const RISER = 0.16, TREAD = 0.28;

const local = {};
const lm = (name, make) => local[name] || (local[name] = make());
const towerGlass = () => lm('tower', () => { const m = new THREE.MeshStandardMaterial({ color: 0x9fd2c6, roughness: 0.05, metalness: 0.3, transparent: true, opacity: 0.34, depthWrite: false, side: THREE.DoubleSide, envMapIntensity: 1.6 }); m.name = 'stand-towerglass'; return m; });
const lens = () => lm('lens', () => { const m = new THREE.MeshStandardMaterial({ color: 0xe6ecef, roughness: 0.25, metalness: 0.1, emissive: 0xfff2da, emissiveIntensity: 0.1 }); m.name = 'hifi-floodlight-lens'; m.userData.glow = 0.1; return m; });
const clad = () => pbr('cladding', [0xf0eee6, 1.25, 0.4, 0.5]);
const zinc = () => plain('zinc', 0x8d9498, 0.5, 0.7);
const horn = () => plain('hornspeaker', 0xb9bdc0, 0.5, 0.25, { side: THREE.DoubleSide });

export function build(item, ctx) {
  const r = bbox(item.points), H = item.height, low = !!ctx.lowPower;
  const seat = ctx.campus.items.find(i => i.id === 'grandstand-seating'), sb = seat ? bbox(seat.points) : null, G = seat ? layout(seat) : null;
  const yT = seat ? seat.height : Math.round(H / 3);                            // concourse level = top seating tier
  const xE = r.e - EAVE_E, xW = r.w + EAVE, zN = r.n + EAVE, zS = r.s - EAVE;   // main walls
  const xS = sb ? sb.w : xE + 6.1, zTn = sb ? sb.n : zN - 8, zTs = sb ? sb.s : zS + 49.8;   // back edge and ends of the seating bank
  const Y = { rib: yT + 2.0, band: yT + 2.3, cl0: H - 2.3, cl1: H - 2.05, sof: H - 0.55, slab: H - 0.32 };
  const v = new Batch2(), c = new Batch(), fine = tiers(ctx, (xE + xS) / 2, zTn, zTs, 60, item.id);
  const both = (m, ...a) => { S3(v, m, ...a); S3(c, 'generic', ...a); };
  const world = () => v.frame(0, 0, 0);
  const fr = M.frame(), white = M.white(), beam = M.beam(), steel = M.steel(), dark = M.dark(), deck = M.deck(), galv = M.galv(), pipe = M.pipe();

  // A wall from (xa, za) to (xb, zb), seen from its left side: the batch frame is set so that the wall lies in the plane
  // local x = 0, faces local +x and runs along local z from 0 to len. P(out, y, along) gives world coordinates.
  const face = (xa, za, xb, zb) => {
    const len = Math.hypot(xb - xa, zb - za), ang = Math.atan2(xb - xa, zb - za), cs = Math.cos(ang), sn = Math.sin(ang);
    v.frame(xa, za, ang);
    return { len, P: (out, y, along) => [xa + out * cs + along * sn, y, za - out * sn + along * cs] };
  };
  // facing leaf LEAF thick behind the wall plane, with rectangular openings [za, zb, ya, yb] (they must not overlap along z)
  function leaf(m, z0, z1, y0, y1, holes = []) {
    let zp = z0;
    for (const [a, b, ya, yb] of [...holes].sort((p, q) => p[0] - q[0])) {
      if (a - zp > 0.01) v.slab(m, -LEAF, y0, zp, LEAF, y1 - y0, a - zp, 'WUD');
      if (ya - y0 > 0.01) v.slab(m, -LEAF, y0, a, LEAF, ya - y0, b - a, 'WDNSU');
      if (y1 - yb > 0.01) v.slab(m, -LEAF, yb, a, LEAF, y1 - yb, b - a, 'WUNS');
      zp = b;
    }
    if (z1 - zp > 0.01) v.slab(m, -LEAF, y0, zp, LEAF, y1 - y0, z1 - zp, 'WUD');
  }
  // window set in an opening of the leaf: glass, frame with `bars` lights above each other, a white sill
  function windowIn(zc, w, y0, y1, bars, hex = 0x3a9c8e, name = 'stand-tealglass') {
    const a = zc - w / 2, b = zc + w / 2, xg = -LEAF + 0.05, h = y1 - y0;
    v.quad(glass(name, hex, 1, bars, w, h), [xg, y0, b], [xg, y0, a], [xg, y1, a], [xg, y1, b]);
    for (const z of [a + 0.03, b - 0.03]) v.box(fr, xg + 0.03, (y0 + y1) / 2, z, 0.06, h, 0.06, 'W');
    for (let i = 0; i <= bars; i++) v.box(fr, xg + 0.03, y0 + 0.03 + (h - 0.06) * i / bars, zc, 0.06, 0.06, w, 'W');
    v.box('wallWhite', (0.07 - LEAF) / 2, y0 - 0.04, zc, LEAF + 0.07, 0.08, w + 0.12, 'W');
  }
  function tallWindow(zc, y0, y1, rail) {
    windowIn(zc, WIN, y0, y1, 4);
    v.box(fr, -LEAF + 0.075, y0 + (y1 - y0) / 8, zc, 0.05, (y1 - y0) / 4, 0.05, 'W');                  // the bottom light is split
    if (!rail) return;                                                           // small white railing in front of the sill
    for (const y of [y0 + 0.3, y0 + 0.6]) { v.box(fr, 0.36, y, zc, 0.04, 0.04, WIN + 0.16); for (const s of [-1, 1]) v.box(fr, 0.19, y, zc + s * (WIN / 2 + 0.06), 0.34, 0.04, 0.04); }
    for (const s of [-1, 0, 1]) v.box(fr, 0.36, y0 + 0.3, zc + s * (WIN / 2 + 0.06), 0.04, 0.6, 0.04);
    v.box('wallWhite', 0.2, y0 - 0.05, zc, 0.4, 0.06, WIN + 0.2, 'W');
  }
  // shop-front glazing from the concourse floor to the white band; doors: fractions of the length where a pair of glass doors stands
  function ribbon(F, len, doors = [], labels = []) {
    const n = Math.max(2, Math.round(len / 1.24)), mod = len / n, h = Y.rib - yT, xg = -0.1;
    v.quad(glass('stand-ribbonglass', 0x4f7078, 1, 1, mod, h), [xg, yT, len], [xg, yT, 0], [xg, Y.rib, 0], [xg, Y.rib, len]);
    for (const [y, t] of [[yT + 0.06, 0.12], [Y.rib - 0.46, 0.06], [Y.rib - 0.03, 0.06]]) v.box(fr, xg + 0.04, y, len / 2, 0.08, t, len, 'W');
    for (let i = 0; i <= n; i++) v.box(fr, xg + 0.05, (yT + Y.rib) / 2, i * mod, 0.1, h, 0.08, 'W');
    doors.forEach((f, k) => {
      const z = Math.max(1, Math.min(n - 1, Math.round(f * n))) * mod;          // the meeting stiles stand on a mullion
      v.box(fr, xg + 0.045, yT + 0.2, z, 0.09, 0.3, 2 * mod - 0.08, 'W');
      for (const s of [-1, 1]) { v.box(steel, xg + 0.13, yT + 1.05, z + s * 0.16, 0.03, 0.9, 0.03); for (const y of [0.65, 1.45]) v.box(steel, xg + 0.1, yT + y, z + s * 0.16, 0.06, 0.03, 0.03); }
      v.box(dark, 0.4, yT + 0.008, z, 0.7, 0.016, 2 * mod - 0.3, 'D');                                                    // door mat
      if (labels[k]) { const y0 = Y.rib - 0.37, x = xg + 0.1; plate(fine.at(F.P(0, 0, z)[2]), labels[k], F.P(x, y0, z + 0.3), F.P(x, y0, z - 0.3), F.P(x, y0 + 0.24, z - 0.3), F.P(x, y0 + 0.24, z + 0.3)); }
    });
  }
  // clerestory: sill band, pale glass in even lights, posts over the pilasters
  function clerestory(len, pil) {
    const n = Math.max(2, Math.round(len / 1.23)), mod = len / n, h = Y.sof - Y.cl1, xg = -0.06;
    v.box('wallWhite', 0, (Y.cl0 + Y.cl1) / 2, len / 2, 0.2 + LEAF, Y.cl1 - Y.cl0, len, 'W');
    v.quad(glass('stand-clereglass', 0x9dbcc0, 1, 1, mod, h), [xg, Y.cl1, len], [xg, Y.cl1, 0], [xg, Y.sof, 0], [xg, Y.sof, len]);
    v.box(fr, xg + 0.04, Y.sof - 0.05, len / 2, 0.08, 0.1, len, 'W');
    for (let i = 1; i < n; i++) v.box(fr, xg + 0.04, (Y.cl1 + Y.sof) / 2, i * mod, 0.08, h, 0.07, 'W');
    for (const z of pil) v.box('wallWhite', 0.025, (Y.cl1 + Y.sof) / 2, z, 0.25 + LEAF, h, 0.5, 'W');
  }
  // positions of the tall windows: one on each side of every pilaster
  const pairs = (pil, len, lo = 0.9) => { const out = []; for (const z of pil) for (const s of [-1, 1]) { const zc = z + s * (PW / 2 + 0.08 + WIN / 2); if (zc + WIN / 2 < len - 0.05 && zc - WIN / 2 > lo) out.push(zc); } return out; };
  const holesOf = (zs, y0, y1, w = WIN) => zs.map(zc => [zc - w / 2, zc + w / 2, y0, y1]);

  // ---------------- main block ----------------
  S3(c, 'generic', xW, xE, 0, Y.slab, zN, zS, 'D');
  const lenE = zS - zN, lenN = xE - xW;
  const bay = (lenE - PW / 2 - 0.4) / 7.72;                                     // eight regular pilasters, then a 0.72 bay to the corner pier
  const pilE = Array.from({ length: 8 }, (_, i) => lenE - PW / 2 - i * bay);    // local z measured from the north end
  const yW0 = Y.band + 0.25 * (Y.cl0 - Y.band), yW1 = Y.cl0 - 0.2;              // tall windows
  const zMid = G ? G.zm : (zN + zS) / 2, zBox = zN + pilE.reduce((q, z) => (Math.abs(zN + z - zMid) < Math.abs(zN + q - zMid) ? z : q), pilE[0]);   // the pilaster nearest the middle of the bank carries the commentary box
  // east face, above the concourse
  let F = face(xE, zN, xE, zS);
  ribbon(F, lenE, [0.1, 0.3, 0.5, 0.7, 0.91], ['办公室', '男卫生间', '器材室', '女卫生间', '办公室']);
  v.box('wallWhite', PD / 2, (Y.rib + Y.band) / 2, lenE / 2, PD, Y.band - Y.rib, lenE, 'W');
  const winE = pairs(pilE, lenE);
  leaf('brickRed', 0, lenE, Y.band, Y.cl0, holesOf(winE, yW0, yW1));
  for (const zc of winE) tallWindow(zc, yW0, yW1, true);
  for (const z of [...pilE, 0.4]) {
    const w = z === 0.4 ? 0.8 : PW;
    v.box('wallWhite', PD / 2, (Y.band + Y.cl0) / 2, z, PD, Y.cl0 - Y.band, w, 'WUD'); v.box('wallWhite', 0.05, (yT + Y.rib) / 2, z, 0.3, Y.rib - yT, 0.5, 'WUD');
    v.box(dark, 0.215, Y.rib - 0.32, z, 0.03, 0.2, 0.3, 'W'); v.box(lamp(), 0.25, Y.rib - 0.32, z, 0.05, 0.14, 0.24);   // wall lamp at the head of each post
  }
  clerestory(lenE, [0.25, ...pilE]);
  // west face, from the ground: two rows of windows, two entrances under hung canopies
  F = face(xW, zS, xW, zN);
  const pilW = Array.from({ length: 9 }, (_, i) => PW / 2 + i * (lenE - PW) / 8), winW = pairs(pilW, lenE, 0.05), doorsW = [2, 5].map(i => (pilW[i] + pilW[i + 1]) / 2);
  leaf('brickRed', 0, lenE, 0, Y.rib, [...holesOf(winW, 1.5, 4.4), ...doorsW.map(z => [z - 1.5, z + 1.5, 0, 2.7])]);
  leaf('brickRed', 0, lenE, Y.band, Y.cl0, holesOf(winW, yW0, yW1));
  v.box('wallWhite', 0.06 - LEAF / 2, (Y.rib + Y.band) / 2, lenE / 2, 0.12 + LEAF, Y.band - Y.rib, lenE, 'W');
  for (const zc of winW) { tallWindow(zc, yW0, yW1, false); windowIn(zc, WIN, 1.5, 4.4, 3); }
  for (const z of pilW) v.box('wallWhite', PD / 2, Y.cl0 / 2, z, PD, Y.cl0, PW, 'WUD');
  { let zp = 0; for (const z of [...doorsW, lenE + 1.5]) { v.slab(M.plinth(), 0, 0, zp, 0.03, 0.42, z - 1.5 - zp, 'DW'); zp = z + 1.5; } }
  for (const z of doorsW) {                                                     // glazed entrance set back in the wall, a canopy on two tie rods
    const xg = -LEAF + 0.04, g = glass('stand-doorglass', 0x567a80, 4, 1, 3.0, 2.7);
    v.quad(g, [xg, 0, z + 1.5], [xg, 0, z - 1.5], [xg, 2.7, z - 1.5], [xg, 2.7, z + 1.5]);
    for (const dz of [-1.47, -0.75, 0, 0.75, 1.47]) v.box(fr, xg + 0.04, 1.35, z + dz, 0.08, 2.7, 0.07, 'W');
    for (const [y, t] of [[0.1, 0.2], [2.2, 0.07], [2.66, 0.08]]) v.box(fr, xg + 0.04, y, z, 0.08, t, 3.0, 'W');
    for (const s of [-1, 1]) v.box(steel, xg + 0.13, 1.1, z + s * 0.12, 0.03, 0.8, 0.03);
    v.box('concrete', 0.25, 0.02, z, 0.9, 0.04, 3.4, 'D');
    v.box(white, 0.85, 2.95, z, 1.7, 0.12, 3.14); v.box(dark, 0.85, 3.015, z, 1.74, 0.012, 3.18, 'D'); v.box(lamp(), 0.8, 2.87, z, 0.4, 0.04, 0.4);
    for (const s of [-1, 1]) { v.bar(steel, F.P(1.55, 3.0, z + s * 1.45), F.P(0.02, 4.6, z + s * 1.45), 0.035); v.frame(xW, zS, Math.PI); v.box(steel, 0.03, 4.6, z + s * 1.45, 0.06, 0.2, 0.12); }
    const p0 = F.P(0.02, 0, z); plate(fine.at(p0[2]), '入口', F.P(0.012, 3.14, z + 0.3), F.P(0.012, 3.14, z - 0.3), F.P(0.012, 3.38, z - 0.3), F.P(0.012, 3.38, z + 0.3));
    const pl = F.P(1.2, 0, z); LIT.push([pl[0], pl[2], 3.4]);
  }
  for (const i of [0, 3, 4, 7]) {                                               // downpipes from the gutter, in the middle of a bay
    const z = (pilW[i] + pilW[i + 1]) / 2 + (i === 3 ? -1.2 : i === 4 ? 1.2 : 0);
    v.bar(pipe, F.P(EAVE + 0.06, Y.slab + 0.02, z), F.P(0.1, Y.slab - 1.5, z), 0.1); v.frame(xW, zS, Math.PI);
    v.cyl(pipe, 0.1, 0.1, z, 0.055, Y.slab - 1.55, 10, false); v.box(pipe, 0.14, 0.12, z, 0.2, 0.12, 0.13);
    for (let y = 1.2; y < Y.slab - 2; y += 2.6) v.box(galv, 0.06, y, z, 0.12, 0.04, 0.16);
  }
  clerestory(lenE, pilW);
  // north face (the portal stands against its east end) and south face (the wing stands against it)
  const pilN = Array.from({ length: 5 }, (_, i) => PW / 2 + i * (lenN - PW) / 4), winN = pairs(pilN, lenN, 0.05).filter(z => z < lenN - 7.6);
  F = face(xW, zN, xE, zN);
  leaf('brickRed', 0, lenN, 0, Y.rib, holesOf(winN, 1.5, 4.4)); leaf('brickRed', 0, lenN, Y.band, Y.cl0, holesOf(winN, yW0, yW1));
  v.box('wallWhite', 0.06 - LEAF / 2, (Y.rib + Y.band) / 2, lenN / 2, 0.12 + LEAF, Y.band - Y.rib, lenN, 'W'); v.slab(M.plinth(), 0, 0, 0, 0.03, 0.42, lenN, 'DW');
  for (const zc of winN) { tallWindow(zc, yW0, yW1, false); windowIn(zc, WIN, 1.5, 4.4, 3); }
  for (const z of pilN) v.box('wallWhite', PD / 2, Y.cl0 / 2, z, PD, Y.cl0, PW, 'WUD');
  clerestory(lenN, pilN);
  F = face(xE, zS, xW, zS);
  leaf('brickRed', 0, lenN, 0, Y.cl0);
  for (const z of pilN) v.box('wallWhite', PD / 2, Y.cl0 / 2, z, PD, Y.cl0, PW, 'WUD');
  clerestory(lenN, pilN);
  world();
  for (const [x, dx] of [[xE, PD], [xW, -PD]]) for (const [z, dz] of [[zN, -PD], [zS, PD]]) S3(v, 'wallWhite', x, x + dx, 0, Y.sof, z, z + dz, 'UD');   // corner posts
  S3(v, 'wallWhite', xW, xE, Y.sof, Y.slab, zN, zS, 'UD');                                                                    // wall head under the roof

  // ---------------- roof: slab with bowed ends and a fascia, ribbed sheet on top; the east eave is a steel canopy ----------------
  const ring = [], nb = 12, bow = i => BOW * (1 - (2 * i / nb - 1) ** 2);
  for (let i = 0; i <= nb; i++) ring.push([r.w + r.sx * i / nb, r.n + BOW - bow(i)]);
  for (let i = nb; i >= 0; i--) ring.push([r.w + r.sx * i / nb, r.s - BOW + bow(i)]);
  ctx.collide(ctx.add(prism(ring, Y.slab, H - 0.02, plain('fascia', 0xeceee9, 0.5, 0.2))));     // collides: a player leaving drone mode above the block lands on the roof
  { const top = ctx.add(flatPoly(ring.map(([x, z]) => [r.cx + (x - r.cx) * (1 - 0.2 / (r.sx / 2)), r.cz + (z - r.cz) * (1 - 0.2 / (r.sz / 2))]), H - 0.012, M.roofSheet())); top.castShadow = false; }
  const zA = r.n + BOW + 0.15, zB = r.s - BOW - 0.15, ys = Y.slab - 0.004, sof = M.soffit(), xe = r.e - 0.12;
  for (const [x0, x1, z0, z1] of [[xE, xe, zA, zB], [r.w + 0.12, xW, zA, zB], [xW, xE, zA, zN], [xW, xE, zS, zB]]) v.quad(sof, [x0, ys, z1], [x0, ys, z0], [x1, ys, z0], [x1, ys, z1]);
  const beamZ = [0.4, ...pilE].map(z => zN + z).sort((p, q) => p - q), yt = Y.slab - 0.18, x1b = r.e - 0.3, dRoot = 0.62, dTip = 0.24;
  const beamBottom = x => yt - dRoot + (dRoot - dTip) * (x - xE) / (x1b - xE);
  for (const z of beamZ) {
    prismZ(v, beam, [[xE - 0.05, yt - dRoot], [xE - 0.05, yt], [x1b, yt], [x1b, yt - dTip]], z - 0.009, z + 0.009);                                // web
    prismZ(v, beam, [[xE - 0.05, yt - dRoot - 0.022], [xE - 0.05, yt - dRoot], [x1b, yt - dTip], [x1b, yt - dTip - 0.022]], z - 0.1, z + 0.1);   // bottom flange
    S3(v, beam, xE - 0.05, x1b, yt - 0.022, yt, z - 0.1, z + 0.1);
    for (const x of [xE + 1.7, xE + 3.4]) S3(v, beam, x - 0.006, x + 0.006, beamBottom(x), yt, z - 0.1, z + 0.1);                                  // stiffeners
    v.bar(beam, [xE + 0.28, Y.cl1 - 0.15, z], [xE + 3.1, beamBottom(3.1 + xE) - 0.02, z], 0.11);                                                   // knee brace
    S3(v, beam, xE + 0.12, xE + 0.3, Y.cl1 - 0.4, Y.cl1 + 0.05, z - 0.12, z + 0.12);
  }
  const purl = [0.45, 1.5, 2.55, 3.6, 4.65].map(d => xE + d);
  for (const x of purl) S3(v, galv, x - 0.035, x + 0.035, yt, Y.slab, zA, zB);
  S3(v, beam, x1b - 0.05, x1b + 0.05, Y.slab - 0.32, Y.slab, zA, zB);                                                                              // eaves beam
  beamZ.forEach((z, i) => { if (i + 1 < beamZ.length && [0, 3, 4, beamZ.length - 2].includes(i)) for (const [a, b] of [[z, beamZ[i + 1]], [beamZ[i + 1], z]]) v.bar(dark, [purl[0], yt - 0.03, a], [purl[4], yt - 0.03, b], 0.028); });   // tie rods in the roof plane
  for (const x of [r.e, r.w - 0.17]) S3(v, zinc(), x, x + 0.17, Y.slab - 0.03, Y.slab + 0.13, zA, zB);                                             // box gutters on the long eaves
  beamZ.forEach((z, i) => { if (i % 2 === 0) return;                                                                                              // outlets run back beside every second beam and down its pilaster
    v.bar(pipe, [r.e + 0.08, Y.slab - 0.08, z + 0.42], [xE + PD + 0.07, Y.slab - 0.36, z + 0.42], 0.09);
    v.cyl(pipe, xE + PD + 0.07, yT + 0.05, z + 0.42, 0.05, Y.slab - 0.36 - yT, 10, false); S3(v, pipe, xE + PD, xE + PD + 0.16, yT, yT + 0.1, z + 0.34, z + 0.5);
  });
  { // on the roof: ventilators, an access hatch, lightning rods at the corners
    for (let i = 0; i < 6; i++) { const x = r.cx + (i % 2 ? 5 : -5), z = r.n + 8 + i * (r.sz - 16) / 5; v.cyl(galv, x, H, z, 0.22, 0.3, 14).cyl(galv, x, H + 0.3, z, 0.36, 0.26, 14).cyl(galv, x, H + 0.56, z, 0.12, 0.05, 10); }
    S3(v, galv, r.cx + 9, r.cx + 10.1, H, H + 0.3, r.cz - 0.55, r.cz + 0.55);
    for (const x of [r.w + 0.4, r.e - 0.4]) for (const z of [r.n + BOW + 0.4, r.s - BOW - 0.4]) v.cyl(galv, x, H, z, 0.012, 1.6, 5, false);
  }

  // floodlights under the canopy edge (two to a bay), on a bar hung from the eaves beam; the pergola's follow below
  const flood = [], xf = r.e - 0.68, yf = Y.slab - 0.58;
  for (let i = 0; i + 1 < beamZ.length; i++) if (beamZ[i + 1] - beamZ[i] > 3) for (const k of [0.3, 0.7]) flood.push([xf, yf, beamZ[i] + (beamZ[i + 1] - beamZ[i]) * k]);
  S3(v, dark, xf - 0.03, xf + 0.03, yf + 0.2, yf + 0.26, zA + 1, zB - 1); for (const z of beamZ) S3(v, dark, xf - 0.02, xf + 0.02, yf + 0.26, yt, z + 0.3, z + 0.34);
  // horn loudspeakers in pairs on every second pilaster
  const horns = [], hornAt = (x, y, z, yaw, pitch = 0.22) => horns.push(new THREE.Matrix4().makeRotationY(yaw).multiply(new THREE.Matrix4().makeRotationZ(-pitch)).setPosition(x, y, z));
  pilE.forEach((z, i) => { if (i % 2 && Math.abs(zN + z - zBox) > 1) { S3(v, dark, xE + PD, xE + PD + 0.3, Y.cl0 - 0.5, Y.cl0 - 0.44, zN + z - 0.3, zN + z + 0.3); for (const s of [-1, 1]) hornAt(xE + PD + 0.36, Y.cl0 - 0.3, zN + z + s * 0.26, -s * 0.5); } });

  // ---------------- commentary and judges' box, hung on the facade above the concourse ----------------
  {
    const z0 = zBox - 5, z1 = zBox + 5, x1 = xE + 3.3, y0 = yT + 2.5, ySill = y0 + 1.0, yHead = y0 + 2.7, slant = Math.hypot(0.45, yHead - ySill);
    S3(v, white, xE, x1, y0, y0 + 0.22, z0, z1); S3(v, clad(), x1 - 0.1, x1, y0 + 0.22, ySill, z0, z1); for (const z of [z0, z1 - 0.1]) S3(v, clad(), xE, x1 - 0.1, y0 + 0.22, ySill, z, z + 0.1);
    v.quad(glass('stand-boxglass', 0x3b5560, 8, 1, z1 - z0, slant), [x1 - 0.05, ySill, z1], [x1 - 0.05, ySill, z0], [x1 + 0.4, yHead, z0], [x1 + 0.4, yHead, z1]);
    const gs = glass('stand-boxglass', 0x3b5560, 3, 1, 3.3, yHead - ySill);
    v.quad(gs, [x1 - 0.05, ySill, z0], [xE, ySill, z0], [xE, yHead, z0], [x1 + 0.4, yHead, z0]); v.quad(gs, [xE, ySill, z1], [x1 - 0.05, ySill, z1], [x1 + 0.4, yHead, z1], [xE, yHead, z1]);
    for (let i = 0; i <= 8; i++) v.bar(fr, [x1 - 0.03, ySill, z0 + (z1 - z0) * i / 8], [x1 + 0.42, yHead, z0 + (z1 - z0) * i / 8], 0.07);
    S3(v, fr, x1 - 0.08, x1 + 0.02, ySill - 0.04, ySill + 0.05, z0, z1);
    S3(v, white, xE, x1 + 0.85, yHead, yHead + 0.22, z0 - 0.35, z1 + 0.35); S3(v, dark, xE, x1 + 0.87, yHead + 0.22, yHead + 0.24, z0 - 0.37, z1 + 0.37, 'D');
    S3(c, 'generic', xE, x1 + 0.4, y0, yHead + 0.24, z0, z1);
    for (const z of [z0 + 0.5, z1 - 0.5]) { v.cyl(steel, x1 - 0.3, yT, z, 0.09, y0 - yT, 16, false); v.cyl(steel, x1 - 0.3, yT, z, 0.16, 0.03, 16); S3(c, 'generic', x1 - 0.45, x1 - 0.15, yT, y0, z - 0.15, z + 0.15, 'UD'); }
    for (const z of [zBox - 2.5, zBox + 2.5]) { v.cyl(dark, x1 - 1.4, y0 - 0.3, z, 0.01, 0.3, 5, false); v.cyl(lamp(), x1 - 1.4, y0 - 0.42, z, 0.16, 0.12, 14); }          // pendant lamps under the box
    const f = fine.at(zBox); plate(f, '广播室', [x1 + 0.006, y0 + 0.5, z0 + 1.6], [x1 + 0.006, y0 + 0.5, z0 + 0.6], [x1 + 0.006, y0 + 0.9, z0 + 0.6], [x1 + 0.006, y0 + 0.9, z0 + 1.6]);
    for (const [z, s] of [[z0 + 0.3, 1], [z1 - 0.3, -1]]) { v.cyl(dark, x1 + 0.3, yHead + 0.24, z, 0.03, 0.5, 8, false); hornAt(x1 + 0.4, yHead + 0.78, z, s * 0.45); hornAt(x1 + 0.4, yHead + 0.52, z, -s * 0.2); }
    v.cyl(galv, xE + 0.8, yHead + 0.24, zBox, 0.02, 2.4, 6, false); S3(v, galv, xE + 0.5, xE + 1.1, yHead + 2.0, yHead + 2.03, zBox - 0.02, zBox + 0.02);                 // aerial
  }

  // ---------------- concourse behind the top tier (under the canopy, the portal roof and the pergola) ----------------
  const xWg = xE - 0.6;                                                         // face of the south wing wall
  const zPn = zTn;                                                              // north end of the portal and of the concourse
  for (const [x0, z0, z1] of [[xE, zPn, zS], [xWg, zS, zTs]]) {
    S3(v, 'brickRed', x0, xS, 0, yT - 0.02, z0, z1, 'DU'); S3(v, deck, x0, xS, yT - 0.02, yT, z0, z1, 'D'); S3(c, 'generic', x0, xS, 0, yT, z0, z1, 'D');
  }
  const bench = (x, z) => {                                                     // timber bench with its back to the wall
    const f = fine.at(z); f.frame(x, z, 0, yT);
    for (const s of [-0.72, 0.72]) { f.box(dark, 0, 0.21, s, 0.46, 0.42, 0.06).box(dark, 0, 0.02, s, 0.56, 0.04, 0.1).box(dark, -0.25, 0.62, s, 0.05, 0.46, 0.06); }
    for (let i = 0; i < 5; i++) f.box(M.timber(), -0.2 + i * 0.1, 0.445, 0, 0.085, 0.04, 1.8);
    for (let i = 0; i < 3; i++) f.box(M.timber(), -0.26 - i * 0.022, 0.58 + i * 0.115, 0, 0.035, 0.09, 1.8);
    f.frame(0, 0, 0); S3(c, 'generic', x - 0.3, x + 0.25, yT, yT + 0.6, z - 0.9, z + 0.9, 'D');
  };
  const bin = (x, z) => { const f = fine.at(z); [plain('binblue', 0x2a63a8, 0.45, 0.1), plain('bingrey', 0x6d7175, 0.45, 0.1)].forEach((m, i) => { f.box(m, x, yT + 0.45, z + (i - 0.5) * 0.5, 0.4, 0.8, 0.44).box(dark, x + 0.202, yT + 0.68, z + (i - 0.5) * 0.5, 0.01, 0.1, 0.28); }); S3(c, 'generic', x - 0.2, x + 0.2, yT, yT + 0.9, z - 0.5, z + 0.5, 'D'); };
  for (let i = 0; i < 8; i++) { const z = zN + lenE * (0.045 + i * 0.13); if (Math.abs(z - zBox) < 4.6) continue; bench(xE + 0.42, z); if (i % 3 === 1) bin(xE + 0.3, z + 1.7); }

  // ---------------- north portal: white flat-roofed porch over the north end of the concourse ----------------
  const yP = yT + 0.45 * (H - yT), xPw = xE - 6.5;
  both('wallWhite', xPw, xE, 0, yP - 0.3, zPn, zN, 'DU');                                                                     // core
  S3(v, white, xPw - 1.0, xS + 1.0, yP - 0.3, yP, zPn - 1.2, zN); S3(v, dark, xPw - 1.02, xS + 1.02, yP, yP + 0.015, zPn - 1.22, zN, 'D'); S3(c, 'generic', xPw - 1.0, xS + 1.0, yP - 0.3, yP, zPn - 1.2, zN);   // flat roof
  for (const z of [zN - 3.6, zPn + 0.75]) both('wallWhite', xS - 0.75, xS - 0.35, yT, yP - 0.3, z - 0.2, z + 0.2, 'UD');
  for (let x = xE + 0.25; x < xS - 0.1; x += 0.55) S3(v, 'wallWhite', x - 0.06, x + 0.06, yT, yP - 0.3, zPn, zPn + 0.42, 'UD');            // screen of fins at the north end
  S3(v, 'wallWhite', xE, xS, yT, yT + 0.35, zPn, zPn + 0.3, 'D'); S3(c, 'generic', xE, xS, yT, yP - 0.3, zPn, zPn + 0.3, 'D');
  F = face(xE, zPn, xE, zN);
  { const g0 = 1.0, g1 = F.len - 0.4, n = Math.max(2, Math.round((g1 - g0) / 1.1)), mod = (g1 - g0) / n, yg = yP - 0.9, zd = g0 + Math.round(n / 2) * mod;
    v.quad(glass('stand-ribbonglass', 0x4f7078, 1, 1, mod, yg - yT), [0.02, yT, g1], [0.02, yT, g0], [0.02, yg, g0], [0.02, yg, g1]);
    for (let i = 0; i <= n; i++) v.box(fr, 0.06, (yT + yg) / 2, g0 + i * mod, 0.1, yg - yT, 0.08, 'W');
    for (const y of [yT + 0.06, yT + 2.15, yg - 0.05]) v.box(fr, 0.06, y, (g0 + g1) / 2, 0.1, 0.1, g1 - g0, 'W');
    for (const s of [-1, 1]) v.box(steel, 0.15, yT + 1.05, zd + s * 0.16, 0.03, 0.9, 0.03);
    v.box(fr, 0.065, yT + 0.2, zd, 0.09, 0.3, 2 * mod - 0.08, 'W');
    plate(fine.at(F.P(0, 0, zd)[2]), '入口', F.P(0.125, yT + 2.3, zd + 0.3), F.P(0.125, yT + 2.3, zd - 0.3), F.P(0.125, yT + 2.54, zd - 0.3), F.P(0.125, yT + 2.54, zd + 0.3));
    v.box(lamp(), 3.0, yP - 0.33, F.len / 2, 0.9, 0.04, 0.9); v.box(lamp(), 3.0, yP - 0.33, F.len / 2 - 3, 0.5, 0.04, 0.5); v.box(lamp(), 3.0, yP - 0.33, F.len / 2 + 3, 0.5, 0.04, 0.5); }
  world();

  // ---------------- south wing ----------------
  const yWing = yT + 0.66 * (H - yT), yPer = Y.cl1;                             // wall top; pergola top (level with the clerestory sill)
  const cz = zTs - 4.4, cx = xWg - 3.7, R = 3.9;                                // stair tower centre and radius
  const pt = (rho, th, y) => [cx + rho * Math.cos(th), y, cz + rho * Math.sin(th)];      // th: 0 east, a quarter turn south
  const wing = [[xWg - LEAF, zS], [xWg - LEAF, cz - 1.3], ...[-45, -75, -105, -135, -165, -180].map(d => { const p = pt(R - 0.1, d * Math.PI / 180, 0); return [p[0], p[2]]; }), [xW + 2.0, zS]];
  ctx.collide(ctx.add(prism(wing, 0, yWing, mat('brickRed'))));
  ctx.add(prism(wing, yWing, yWing + 0.06, mat('roofGrey')));
  const lenW = cz - 1.25 - zS, zc0 = zS - PW / 2, cols = [];                    // east wall up to where the tower takes over; columns continue the main bay rhythm
  for (let k = 1; zc0 + k * bay < cz - 3; k++) cols.push(zc0 + k * bay);
  const yS0 = yT + 0.45 * (yWing - yT), yS1 = yT + 0.8 * (yWing - yT), nRb = 15, yB = yT + nRb * RISER;      // small windows; balcony level
  F = face(xWg, zS, xWg, cz - 1.25);
  ribbon(F, lenW, [0.12, 0.42, 0.66, 0.9], ['体育器材', '办公室', '储藏室', '饮水处']);
  v.box('wallWhite', 0.075 - LEAF / 2, (Y.rib + Y.band) / 2, lenW / 2, 0.15 + LEAF, Y.band - Y.rib, lenW, 'W');
  const winS = [0.95 + PW / 2, ...cols.flatMap(z => [z - zS - 0.95, z - zS + 0.95])].filter(z => z > 0.9 && z < lenW - 0.9), zDoor = cols.length >= 2 ? cols[0] - zS + 2.6 : -1;
  leaf('brickRed', 0, lenW, Y.band, yWing, [...holesOf(winS, yS0, yS1, 1.0), ...(zDoor > 0 ? [[zDoor - 0.5, zDoor + 0.5, yB, yB + 2.1]] : [])]);
  for (const z of winS) windowIn(z, 1.0, yS0, yS1, 2);
  if (zDoor > 0) { v.box(M.door(), -LEAF + 0.03, yB + 1.05, zDoor, 0.04, 2.1, 1.0, 'W'); v.box(dark, -LEAF + 0.055, yB + 1.5, zDoor + 0.2, 0.01, 0.5, 0.14, 'W'); for (const s of [-1, 1]) v.box(fr, -LEAF + 0.07, yB + 1.05, zDoor + s * 0.47, 0.05, 2.1, 0.06, 'W'); v.box(fr, -LEAF + 0.07, yB + 2.07, zDoor, 0.05, 0.06, 1.0, 'W'); }
  v.box('wallWhite', -0.02, yWing + 0.02, lenW / 2, 0.36, 0.2, lenW);                                                       // coping
  // the wing's long west wall (it runs diagonally to the tower): two rows of windows in white surrounds
  F = face(cx - (R - 0.1), cz, xW + 2.0, zS);
  for (let z = 4.2; z < F.len - 2.5; z += 4.6) for (const [y0, y1] of [[1.4, 3.6], [6.6, 9.0]]) {
    v.box('wallWhite', 0.03, (y0 + y1) / 2, z, 0.06, y1 - y0 + 0.24, 1.84, 'W'); v.quad(glass('stand-tealglass', 0x3a9c8e, 2, 2, 1.6, y1 - y0), [0.065, y0, z + 0.8], [0.065, y0, z - 0.8], [0.065, y1, z - 0.8], [0.065, y1, z + 0.8]);
    v.box(fr, 0.08, (y0 + y1) / 2, z, 0.03, y1 - y0, 0.05, 'W'); v.box(fr, 0.08, (y0 + y1) / 2, z, 0.03, 0.05, 1.6, 'W');
  }
  v.slab(M.plinth(), 0, 0, 0, 0.03, 0.42, F.len, 'DW'); v.box('wallWhite', 0, yWing + 0.02, F.len / 2, 0.36, 0.2, F.len);
  world();
  // columns and pergola over the concourse
  const xc = xS - 0.5, zPe = (cols.length ? cols[cols.length - 1] : zS) + 0.6;
  for (const z of cols) {
    both('wallWhite', xc - 0.22, xc + 0.22, yT, yPer - 0.35, z - 0.22, z + 0.22, 'UD'); S3(v, 'wallWhite', xWg - 0.4, xWg - 0.1, yWing, yPer - 0.35, z - 0.15, z + 0.15, 'UD');
    S3(v, white, xWg - 0.4, xc + 0.22, yPer - 0.35, yPer, z - 0.15, z + 0.15);
    v.cyl(dark, xc - 0.3, yT + 2.6, z, 0.012, 0.4, 5, false).cyl(lamp(), xc - 0.3, yT + 2.45, z, 0.13, 0.15, 12);            // lantern on each column
  }
  for (const x of [xc, xWg - 0.25]) S3(v, white, x - 0.15, x + 0.15, yPer - 0.35, yPer, zS, zPe);
  for (let z = zS + 0.6; z < zPe - 0.2; z += 0.9) S3(v, white, xWg - 0.1, xc - 0.15, yPer - 0.24, yPer, z - 0.06, z + 0.06);
  for (let i = 0; i < cols.length; i++) { const a = i ? cols[i - 1] : zS, b = cols[i]; for (const k of [0.33, 0.67]) flood.push([xc + 0.2, yPer - 0.62, a + (b - a) * k]); }
  S3(v, dark, xc + 0.17, xc + 0.23, yPer - 0.43, yPer - 0.35, zS + 1, zPe - 0.3);
  // balcony in the second bay, with a stair down to the concourse (white walls under the stair close the space below it)
  if (cols.length >= 2) {
    const z0 = cols[0], z1 = cols[1], xb = xWg + 3.4, sx1 = xb - 0.25, sx0 = sx1 - 1.4;
    both(white, xWg, xb, yB - 0.25, yB, z0, z1);
    const guard = (x0, x1, za, zb) => { S3(v, white, x0, x1, yB, yB + 0.45, za, zb, 'D'); S3(c, 'generic', x0, x1, yB, yB + BARRIER, za, zb, 'D'); };
    guard(xb - 0.12, xb, z0, z1); guard(xWg, xb, z0, z0 + 0.12); guard(xWg, sx0, z1 - 0.12, z1); guard(sx1, xb, z1 - 0.12, z1);
    railZ(v, xb - 0.06, yB + 0.45, yB + 1.05, z0 + 0.05, z1 - 0.05);
    for (const [xa, xb2, z] of [[xWg, xb, z0 + 0.06], [xWg, sx0, z1 - 0.06]]) { S3(v, steel, xa, xb2, yB + 1.02, yB + 1.07, z - 0.03, z + 0.03); S3(v, steel, xa, xb2, yB + 0.7, yB + 0.73, z - 0.015, z + 0.015); for (let x = xa + 0.1; x < xb2; x += 1.1) v.box(steel, x, yB + 0.75, z, 0.045, 0.6, 0.045, 'UD'); }
    for (const z of [z0 + 0.3, z1 - 0.3]) { v.cyl(steel, xb - 0.25, yT, z, 0.09, yB - 0.25 - yT, 16, false); S3(c, 'generic', xb - 0.4, xb - 0.1, yT, yB - 0.25, z - 0.15, z + 0.15, 'UD'); }
    const line = d => yB - (d + TREAD / 2) * RISER / TREAD, far = (nRb - 1) * TREAD + 0.25;
    for (let i = 1; i <= nRb; i++) {
      const za = z1 + (nRb - 1 - i) * TREAD, zb = z1 + (nRb - i) * TREAD;
      if (i < nRb) S3(v, 'concrete', sx0, sx1, yT, yT + i * RISER, za, zb, 'D');
      S3(v, i === 1 || i === nRb ? M.yellow() : M.paint(), sx0 + 0.02, sx1 - 0.02, yT + i * RISER - 0.04, yT + i * RISER + 0.005, zb - 0.05, zb + 0.012, 'D');
    }
    prismX(c, 'generic', [[z1 - TREAD / 2, yT], [z1 - TREAD / 2, yB], [z1 + (nRb - 0.5) * TREAD, yT], [z1 + (nRb - 0.5) * TREAD, yT - 0.2]], sx0, sx1);
    for (const [xa, xb2] of [[sx0 - 0.12, sx0], [sx1, sx1 + 0.12]]) {
      prismX(v, white, [[z1, yT], [z1, line(0) + 0.53], [z1 + far, line(far) + 0.53], [z1 + far, yT]], xa, xb2);
      prismX(c, 'generic', [[z1, yT], [z1, line(0) + BARRIER], [z1 + far, line(far) + BARRIER], [z1 + far, yT]], xa, xb2);
      v.bar(steel, [(xa + xb2) / 2, line(0) + 1.0, z1], [(xa + xb2) / 2, line(far) + 1.0, z1 + far], 0.045);
      for (let t = 0.3; t < far; t += 1.1) v.box(steel, (xa + xb2) / 2, line(t) + 0.76, z1 + t, 0.04, 0.48, 0.04, 'UD');
    }
  }
  // parapets closing the south end of the concourse
  for (const [x0, x1, z0, z1] of [[xWg, xS, zTs - 0.2, zTs], [xWg - 0.2, xWg, cz + 1.2, zTs]]) { S3(v, 'wallWhite', x0, x1, yT - (x1 === xWg ? 0.5 : 0), yT + 0.5, z0, z1, 'D'); S3(c, 'generic', x0, x1, yT - 0.5, yT + BARRIER, z0, z1, 'D'); }
  S3(v, steel, xWg, xS, yT + 1.02, yT + 1.07, zTs - 0.13, zTs - 0.07); S3(v, steel, xWg - 0.13, xWg - 0.07, yT + 1.02, yT + 1.07, cz + 1.2, zTs);
  for (let x = xWg + 0.1; x < xS; x += 1.3) v.box(steel, x, yT + 0.76, zTs - 0.1, 0.045, 0.52, 0.045, 'UD');
  for (let z = cz + 1.4; z < zTs; z += 1.2) v.box(steel, xWg - 0.1, yT + 0.76, z, 0.045, 0.52, 0.045, 'UD');

  // ---------------- round stair tower: brick drum below, glazed drum with white ribs above, disc roof; a helical stair inside ----------------
  {
    const Ri = R - 0.25, r0 = 2.2, yLook = yT + 4.4, yTT = H - 1.8, yBr = yT + 0.9, DT = Math.PI / 18, TAU = 2 * Math.PI;      // DT: one of 36 wall segments
    const A0 = Math.PI / 2 + 2 * DT, A1 = TAU - 2 * DT, kS = yT / (A1 - A0), B0 = TAU + 2 * DT, B1 = B0 + (yLook - yT) / kS, TH = B1 - 1.9;   // flights, slope per radian, start of the well in the top floor
    const seg = 2 * R * Math.tan(DT / 2) + 0.01, tg = towerGlass(), stone = 'concrete';
    const wallBox = (b, m, th, y0, y1, ri = Ri, ro = R) => { if (y1 - y0 > 0.01) b.frame(cx, cz, -th).box(m, (ri + ro) / 2, (y0 + y1) / 2, 0, ro - ri, y1 - y0, seg).frame(0, 0, 0); };
    const pane = (t0, y0, y1) => { if (y1 - y0 > 0.05) v.quad(tg, pt(R - 0.12, t0 + DT, y0), pt(R - 0.12, t0, y0), pt(R - 0.12, t0, y1), pt(R - 0.12, t0 + DT, y1)); };
    for (let j = 0; j < 36; j++) {
      const t0 = j * DT, th = t0 + DT / 2, deg = 5 + 10 * j, ground = deg === 85 || deg === 95, terr = deg === 355 || deg === 5, wingSide = deg > 180 && deg < 340;
      const top = wingSide ? yWing + 0.3 : yBr;                                 // top of the brick
      if (ground) { wallBox(v, 'brickRed', th, 2.3, top); wallBox(c, 'generic', th, 2.3, yTT); }
      else if (terr) { wallBox(v, 'brickRed', th, 0, yT); wallBox(c, 'generic', th, 0, yT); wallBox(c, 'generic', th, yT + 2.3, yTT); }
      else { wallBox(v, 'brickRed', th, 0, top); wallBox(c, 'generic', th, 0, yTT); }
      const g0 = terr ? yT + 2.66 : top + 0.2;
      wallBox(v, 'wallWhite', th, g0 - 0.2, g0, Ri, R + 0.08);                                                                  // sill ring
      if (g0 < yLook - 0.35) { pane(t0, g0, yLook - 0.35); wallBox(v, 'wallWhite', th, yLook - 0.35, yLook, Ri, R + 0.06); pane(t0, yLook, yTT - 0.2); } else pane(t0, g0, yTT - 0.2);
      wallBox(v, 'wallWhite', th, yTT - 0.2, yTT, Ri, R + 0.02);
      if (j % 2 === 0) v.frame(cx, cz, -t0).box('wallWhite', R - 0.03, (g0 + yTT) / 2, 0, 0.26, yTT - g0, 0.22, 'UD').frame(0, 0, 0);
    }
    v.cyl(white, cx, yTT, cz, R + 0.8, 0.4, 48).cyl(dark, cx, yTT + 0.4, cz, R + 0.82, 0.015, 48).cyl(lamp(), cx, yTT - 0.06, cz, 0.55, 0.06, 20);
    c.cyl('generic', cx, yTT, cz, R + 0.8, 0.4, 16);
    v.cyl(stone, cx, 0, cz, Ri, 0.03, 36);                                                                                      // ground floor
    // door frames: ground door on the south side, concourse door on the east side
    for (const [th, y, text] of [[Math.PI / 2, 0, '楼梯'], [0, yT, '楼梯']]) {
      v.frame(cx, cz, -th);
      for (const s of [-1, 1]) v.box(white, (Ri + R) / 2 + 0.03, y + 1.15, s * 0.7, R - Ri + 0.12, 2.3, 0.1);
      v.box(white, (Ri + R) / 2 + 0.03, y + 2.48, 0, R - Ri + 0.12, 0.36, 1.5);
      if (!y) { v.box(white, R + 0.6, 2.72, 0, 1.3, 0.1, 2.2).box(lamp(), R + 0.55, 2.65, 0, 0.3, 0.04, 0.3); LIT.push([cx + (R + 1.2) * Math.cos(th), cz + (R + 1.2) * Math.sin(th), 3.2]); }
      world();
      const f = fine.at(cz), q = (dz, yy) => [cx + (R + 0.1) * Math.cos(th) - dz * Math.sin(th), y + yy, cz + (R + 0.1) * Math.sin(th) + dz * Math.cos(th)];
      plate(f, text, q(0.3, 2.37), q(-0.3, 2.37), q(-0.3, 2.61), q(0.3, 2.61));
    }
    // the stair: treads, risers and a smooth soffit (visual); inclined plates, the well's guard and the walls (collision)
    const flightOf = (t0, t1, y0, y1, solid) => {
      const n = Math.round((y1 - y0) / 0.167), dT = (t1 - t0) / n, dy = (y1 - y0) / n;
      for (let i = 0; i < n; i++) {
        const ta = t0 + i * dT, tb = ta + dT, y = y0 + (i + 1) * dy;
        v.quad(stone, pt(r0, ta, y), pt(r0, tb, y), pt(Ri, tb, y), pt(Ri, ta, y)); v.quad(white, pt(Ri, ta, y - dy), pt(r0, ta, y - dy), pt(r0, ta, y), pt(Ri, ta, y));
        v.quad(M.yellow(), pt(r0 + 0.04, ta, y + 0.004), pt(r0 + 0.04, ta + 0.02, y + 0.004), pt(Ri - 0.04, ta + 0.012, y + 0.004), pt(Ri - 0.04, ta, y + 0.004));
        v.quad(white, pt(r0, ta, y - dy - 0.2), pt(Ri, ta, y - dy - 0.2), pt(Ri, tb, y - 0.2), pt(r0, tb, y - 0.2));
        v.quad(white, pt(r0, ta, y - dy - 0.2), pt(r0, tb, y - 0.2), pt(r0, tb, y + 0.1), pt(r0, ta, y - dy + 0.1));
        if (i % 2 === 0) { v.bar(steel, pt(r0 + 0.05, ta, y), pt(r0 + 0.05, ta, y + 0.95), 0.04); const tc = Math.min(t1, ta + 2 * dT), yc = y + (tc - ta) / dT * dy; for (const h of [0.95, 0.5]) v.bar(steel, pt(r0 + 0.05, ta, y + h), pt(r0 + 0.05, tc, yc + h), h > 0.6 ? 0.045 : 0.03); }
      }
      const m = Math.ceil((t1 - t0) / 0.2);
      for (let i = 0; i < m; i++) {
        const ta = t0 + (t1 - t0) * i / m, tb = t0 + (t1 - t0) * (i + 1) / m, ya = y0 + (y1 - y0) * i / m, yb = y0 + (y1 - y0) * (i + 1) / m, fill = solid && ya < 2.3;
        const ba = fill ? 0 : ya - 0.25, bb = fill ? 0 : yb - 0.25, ga = tb > TH + 1e-6 && solid === false ? yLook + BARRIER : ya + BARRIER, gb = tb > TH + 1e-6 && solid === false ? yLook + BARRIER : yb + BARRIER;
        hexa(c, 'generic', [pt(r0, ta, ba), pt(r0, ta, ya), pt(Ri + 0.05, ta, ya), pt(Ri + 0.05, ta, ba), pt(r0, tb, bb), pt(r0, tb, yb), pt(Ri + 0.05, tb, yb), pt(Ri + 0.05, tb, bb)]);
        hexa(c, 'generic', [pt(r0 - 0.08, ta, ba), pt(r0 - 0.08, ta, ga), pt(r0, ta, ga), pt(r0, ta, ba), pt(r0 - 0.08, tb, bb), pt(r0 - 0.08, tb, gb), pt(r0, tb, gb), pt(r0, tb, bb)]);
        if (fill) hexa(v, 'wallWhite', [pt(r0, ta, 0), pt(r0, ta, ya - 0.19), pt(Ri, ta, ya - 0.19), pt(Ri, ta, 0), pt(r0, tb, 0), pt(r0, tb, yb - 0.19), pt(Ri, tb, yb - 0.19), pt(Ri, tb, 0)], [3, 4, 5]);
      }
    };
    flightOf(A0, A1, 0, yT, true); flightOf(B0, B1, yT, yLook, false);
    // floors as wedges of a ring: the concourse landing, the lookout floor (a disc and the ring outside the stair well)
    const ringFloor = (t0, t1, y, ro, m) => { const n = Math.ceil((t1 - t0) / 0.2); for (let i = 0; i < n; i++) { const ta = t0 + (t1 - t0) * i / n, tb = t0 + (t1 - t0) * (i + 1) / n;
      const P = [pt(r0 - 0.08, ta, y - 0.25), pt(r0 - 0.08, ta, y), pt(ro, ta, y), pt(ro, ta, y - 0.25), pt(r0 - 0.08, tb, y - 0.25), pt(r0 - 0.08, tb, y), pt(ro, tb, y), pt(ro, tb, y - 0.25)]; hexa(v, m, P); hexa(c, 'generic', P); } };
    const arcGuard = (t0, t1, y) => { const n = Math.ceil((t1 - t0) / 0.2); for (let i = 0; i < n; i++) { const ta = t0 + (t1 - t0) * i / n, tb = t0 + (t1 - t0) * (i + 1) / n;
      hexa(c, 'generic', [pt(r0 - 0.08, ta, y - 0.25), pt(r0 - 0.08, ta, y + BARRIER), pt(r0, ta, y + BARRIER), pt(r0, ta, y - 0.25), pt(r0 - 0.08, tb, y - 0.25), pt(r0 - 0.08, tb, y + BARRIER), pt(r0, tb, y + BARRIER), pt(r0, tb, y - 0.25)]);
      for (const h of [1.0, 0.55]) v.bar(steel, pt(r0 - 0.04, ta, y + h), pt(r0 - 0.04, tb, y + h), h > 0.6 ? 0.045 : 0.03); v.bar(steel, pt(r0 - 0.04, ta, y), pt(r0 - 0.04, ta, y + 1.0), 0.04); } };
    ringFloor(A1, B0, yT, R + 0.02, stone); arcGuard(A1, B0, yT);
    ringFloor(B1, TH + TAU, yLook, Ri, deck); arcGuard(TH, B1, yLook);
    v.cyl(deck, cx, yLook - 0.25, cz, r0 - 0.06, 0.25, 32); c.cyl('generic', cx, yLook - 0.25, cz, r0 - 0.06, 0.25, 20);
    c.frame(cx, cz, -TH).box('generic', (r0 + Ri) / 2, yLook + BARRIER / 2, -0.04, Ri - r0 + 0.1, BARRIER, 0.08); c.frame(0, 0, 0);       // guard across the head of the well
    for (const h of [1.0, 0.55]) v.bar(steel, pt(r0 - 0.04, TH, yLook + h), pt(Ri - 0.05, TH, yLook + h), h > 0.6 ? 0.045 : 0.03);
    for (const rho of [r0 - 0.04, (r0 + Ri) / 2, Ri - 0.05]) v.bar(steel, pt(rho, TH, yLook), pt(rho, TH, yLook + 1.0), 0.04);
    fine.at(cz).cyl(dark, cx, yLook, cz, 0.62, 0.4, 20, false).cyl(M.timber(), cx, yLook + 0.4, cz, 0.98, 0.07, 28);                           // round bench in the middle of the lookout
    c.cyl('generic', cx, yLook, cz, 1.0, 0.45, 12);
  }

  // ---------------- lights and loudspeakers ----------------
  if (horns.length) { const g = new THREE.LatheGeometry([[0.001, -0.33], [0.055, -0.33], [0.055, -0.2], [0.032, -0.19], [0.06, -0.05], [0.12, 0.04], [0.2, 0.1], [0.215, 0.1]].map(([x, y]) => new THREE.Vector2(x, y)), 14); g.rotateZ(-Math.PI / 2); ctx.add(instanced(g, horn(), horns, item.id + '-horns')); }
  const tilt = flood.map(([x, y, z]) => new THREE.Matrix4().makeRotationZ(-0.72).setPosition(x, y, z));
  const lensGeo = new THREE.PlaneGeometry(0.46, 0.3); lensGeo.rotateY(Math.PI / 2); lensGeo.translate(0.082, 0, 0);
  ctx.add(instanced(new THREE.BoxGeometry(0.16, 0.36, 0.52), dark, tilt, item.id + '-floodlights'));
  const lenses = ctx.add(instanced(lensGeo, lens(), tilt, item.id + '-floodlight-lenses')); lenses.castShadow = false;
  // Three real lamps stand in for the rows of floodlights (none on phones). Two under the canopy edge throw wide cones on
  // the home straight and the lower seats. The third is a soft fill from above the pitch: it stands for the light the lit
  // field throws back, so that the face of the stand and the seat backs are not black behind their own lamps.
  const spot = (x, y, z, tx, ty, tz, power, angle, reach, decay, color = 0xfff0d8) => { const s = new THREE.SpotLight(color, 0, reach, angle, 1, decay); s.position.set(x, y, z); s.target.position.set(tx, ty, tz); s.userData.power = power; ctx.add(s); ctx.add(s.target); s.target.updateMatrixWorld(); return s; };
  const zF = G ? G.zm : (zN + zS) / 2, spots = low ? [] : [spot(xf, yf, zN + lenE * 0.22, xf + 26, 0, zN + lenE * 0.22, 26, 0.98, 130, 1), spot(xf, yf, zN + lenE * 0.8, xf + 26, 0, zN + lenE * 0.8, 26, 0.98, 130, 1),
    spot(xS + 52, 19, zF, xS, 2.5, zF, 0.85, 1.08, 78, 0, 0xf4f1e6)];
  if (G && low) for (let z = zN + 5; z < zPe; z += 14) LIT.push([G.E + 12.5, z, 12]);   // phones: pools of light on the track instead
  nightly(ctx, lenses, k => { lens().emissiveIntensity = 0.1 + 9 * k; for (const s of spots) s.intensity = s.userData.power * k; });

  fine.finish();
  ctx.add(v.build({ name: item.id + '-visual' }));
  const cg = ctx.add(c.build({ name: item.id + '-colliders' })); cg.visible = false;
  cg.traverse(m => { if (m.isMesh) ctx.collide(m); });
}
