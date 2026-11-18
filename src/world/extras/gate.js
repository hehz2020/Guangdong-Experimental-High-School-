// The main gate on the east side of the campus and the pool behind it, built for looks first.
//
// SEEN (one photograph of the gate supplied by the user, taken from the forecourt looking west):
//   - two matching gate pavilions: a white stone pier on the outer side, a flat white roof that runs inward over a
//     green-glazed box and ends as a thin tapering canopy on one round metal column with a dark-red base; a red lantern
//     hangs from each canopy tip;
//   - a low stainless sliding gate between the two columns, traffic cones and clipped shrubs in white planters before it;
//   - on the right a long red wall with a white coping carrying the school name in dark brush characters with a line of
//     small Latin letters below, clipped ball shrubs and small pennants in front of it;
//   - a forecourt paved with a pale central band between red-brown pavers; dense trees behind the pavilions, tall
//     conifers and a red flower terrace behind the gate; on the axis, far behind, the gymnasium's east front; the clock
//     tower above the trees to the right.
//   From that view the camera is east of the clock tower and sees the gymnasium straight ahead, which puts the gate on the
//   canal road at about x 247, z -20. Two pale roofs flanking a 16 m gap show there on the satellite image.
//
// IMAGINED (the user asked for a good-looking scene and said proportions and facts need not be exact):
//   - every dimension; the pool itself (the user says there is one behind the gate; nothing shows its shape): a round
//     pool with a rock that carries the school motto, jets, a flower terrace on the gate side; the avenue from the pool to
//     the gymnasium; all planting, benches, lamps, the street and the promenade along the canal; the low glazed annex
//     south of the gate; the back of everything the photograph does not show.
//   - The motto on the rock (爱国 团结 求实 创新) is the school's published motto; that it is carved on a rock here is invented.
import * as THREE from 'three';
import { Water } from 'three/addons/objects/Water.js';
import { mat } from '../../kit.js';
import { Batch } from '../../batch.js';
import { emblemTexture } from '../../signs.js';
import { pbr, plain, waterNormals, rng } from '../../hifi.js';
import { broadleafTrees, royalPalms, conifers, shrubs, flowers, WIND } from '../../flora.js';

// Local frame: origin on the gate line at the middle of the driveway; +Z runs into the campus (west), +X to the south
// (the left-hand side for someone walking in), Y up.
const GX = 247, GZ = -20, YAW = -Math.PI / 2;
const toWorld = (x, z) => [GX - z, GZ + x];
const CANAL = x => -37.7 + 0.164 * x;                 // the canal's west wall in local z, from the landscape data (it is not parallel to the gate)
const HALF = 38, DEPTH = 106;                         // the dressed area: |x| up to HALF, z from the canal to the gymnasium front
/** Ground outline of the dressed area in world coordinates: the landscape module keeps its own trees out of it. */
export const GATE_AREA = [[-HALF, CANAL(-HALF)], [HALF, CANAL(HALF)], [HALF, DEPTH], [-HALF, DEPTH]].map(([x, z]) => toWorld(x, z));

const BRUSH = '"STXingkai","华文行楷","Xingkai SC","STKaiti","华文楷体","Kaiti SC","KaiTi","楷体","AR PL UKai CN","Songti SC","SimSun","Noto Serif CJK SC","WenQuanYi Zen Hei",serif';
const SANS = '"Helvetica Neue",Arial,"Noto Sans",sans-serif';

// ---- small geometry helpers -------------------------------------------------------------------------------------------
/** Flat polygon at height y, texture coordinates in metres. holes: list of point lists. */
function flatPoly(pts, y, material, { holes = [], order = 0, offset = 0 } = {}) {
  const V = q => new THREE.Vector2(q[0], q[1]), all = [...pts, ...holes.flat()];
  const tris = THREE.ShapeUtils.triangulateShape(pts.map(V), holes.map(h => h.map(V)));
  const pos = [], nor = [], uv = [], idx = [];
  for (const [x, z] of all) { pos.push(x, y, z); nor.push(0, 1, 0); uv.push(x, z); }
  for (const [a, b, c] of tris) {
    const cr = (all[b][0] - all[a][0]) * (all[c][1] - all[a][1]) - (all[b][1] - all[a][1]) * (all[c][0] - all[a][0]);
    cr < 0 ? idx.push(a, b, c) : idx.push(a, c, b);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx);
  let m = material;
  if (offset) { m = material.clone(); m.name = material.name; m.polygonOffset = true; m.polygonOffsetFactor = offset; m.polygonOffsetUnits = offset * 2; }
  const mesh = new THREE.Mesh(g, m); mesh.receiveShadow = true; mesh.renderOrder = order; return mesh;
}
const circle = (cx, cz, r, n = 48, a0 = 0, a1 = Math.PI * 2) => Array.from({ length: n }, (_, i) => { const a = a0 + (a1 - a0) * i / (a1 - a0 >= Math.PI * 2 - 1e-6 ? n : n - 1); return [cx + Math.cos(a) * r, cz + Math.sin(a) * r]; });
const rect = (x0, z0, x1, z1) => [[x0, z0], [x1, z0], [x1, z1], [x0, z1]];
/** Solid of revolution about the vertical through (cx, cz): profile [[radius, y]...] bottom to top on the outside; flat-shaded per profile segment, metric texture coordinates. */
function lathe(profile, cx, cz, material, seg = 64, a0 = 0, a1 = Math.PI * 2) {
  const pos = [], nor = [], uv = [], idx = [];
  for (let k = 0; k < profile.length - 1; k++) {
    const [r0, y0] = profile[k], [r1, y1] = profile[k + 1], len = Math.hypot(r1 - r0, y1 - y0) || 1, ny = (r0 - r1) / len, nr = (y1 - y0) / len, base = pos.length / 3;
    for (let i = 0; i <= seg; i++) {
      const a = a0 + (a1 - a0) * i / seg, c = Math.cos(a), s = Math.sin(a);
      pos.push(cx + c * r0, y0, cz + s * r0, cx + c * r1, y1, cz + s * r1); nor.push(c * nr, ny, s * nr, c * nr, ny, s * nr);
      uv.push(a * (r0 + r1) / 2, 0, a * (r0 + r1) / 2, len);
    }
    for (let i = 0; i < seg; i++) { const q = base + i * 2; idx.push(q, q + 1, q + 3, q, q + 3, q + 2); }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx);
  const mesh = new THREE.Mesh(g, material); mesh.castShadow = mesh.receiveShadow = true; return mesh;
}
/** Characters cut out of a plane, with a bevel in the normal map. Returns { material, aspect }. */
function lettering(text, { font = BRUSH, weight = 'bold', spacing = 0.1, color = 0x2a2420, metalness = 0.75, roughness = 0.38 } = {}) {
  const H = 256, c = document.createElement('canvas'), g = c.getContext('2d'), size = H * 0.82, chars = [...text];
  g.font = `${weight} ${size}px ${font}`;
  const widths = chars.map(ch => g.measureText(ch).width), gap = size * spacing;
  c.width = Math.ceil(widths.reduce((a, b) => a + b, 0) + gap * (chars.length + 1)); c.height = H;
  g.font = `${weight} ${size}px ${font}`; g.fillStyle = '#fff'; g.textBaseline = 'middle';
  let x = gap; chars.forEach((ch, i) => { g.fillText(ch, x, H / 2 + size * 0.03); x += widths[i] + gap; });
  const map = new THREE.CanvasTexture(c); map.colorSpace = THREE.SRGBColorSpace; map.anisotropy = 8;
  const m = new THREE.MeshStandardMaterial({ color, map, alphaTest: 0.5, metalness, roughness }); m.name = 'hifi-letters';
  try {                                                  // bevel: a blurred copy of the glyphs as a height field
    const b = document.createElement('canvas'); b.width = c.width; b.height = H; const q = b.getContext('2d');
    q.fillStyle = '#000'; q.fillRect(0, 0, b.width, H); q.filter = 'blur(3px)'; q.drawImage(c, 0, 0);
    const src = q.getImageData(0, 0, b.width, H).data, n = document.createElement('canvas'); n.width = b.width; n.height = H;
    const ng = n.getContext('2d'), im = ng.createImageData(b.width, H), W = b.width, at = (px, py) => src[(Math.max(0, Math.min(H - 1, py)) * W + Math.max(0, Math.min(W - 1, px))) * 4] / 255;
    for (let py = 0; py < H; py++) for (let px = 0; px < W; px++) {
      let nx = (at(px - 1, py) - at(px + 1, py)) * 3, ny = (at(px, py + 1) - at(px, py - 1)) * 3; const l = 1 / Math.hypot(nx, ny, 1), o = (py * W + px) * 4;
      im.data[o] = (nx * l * 0.5 + 0.5) * 255; im.data[o + 1] = (ny * l * 0.5 + 0.5) * 255; im.data[o + 2] = (l * 0.5 + 0.5) * 255; im.data[o + 3] = 255;
    }
    ng.putImageData(im, 0, 0); m.normalMap = new THREE.CanvasTexture(n);
  } catch (e) { /* no canvas filter: flat letters */ }
  return { material: m, aspect: c.width / H };
}
/** Raised lettering on a wall: several cut-out planes stacked to a thickness. facing: rotation about Y (0 faces +Z). */
function raised(text, x, y, z, height, facing, opts = {}, depth = 0.05) {
  const { material, aspect } = lettering(text, opts), group = new THREE.Group(), geo = new THREE.PlaneGeometry(height * aspect, height);
  const side = material.clone(); side.name = material.name; side.color.multiplyScalar(0.55); side.normalMap = null;
  for (let i = 0; i <= 4; i++) { const p = new THREE.Mesh(geo, i === 4 ? material : side); p.position.z = depth * i / 4; p.castShadow = i === 4; group.add(p); }
  group.position.set(x, y, z); group.rotation.y = facing; return { group, width: height * aspect };
}

// ---- parts ------------------------------------------------------------------------------------------------------------
const M = {
  stone: () => pbr('cladding', [0xf0ece1, 1.2, 0.6, 0.5]),
  stoneGrey: () => pbr('paving', [0xa8a39a, 0x9a958c, 2, 2, [1.6, 1.6], 17, false]),
  red: () => pbr('cladding', [0xb0452f, 0.9, 0.45, 0.72]),
  redBase: () => pbr('granitePolished', [0x6e2420]),
  black: () => pbr('granitePolished', [0x2a2a2c, 5]),
  steel: () => pbr('steel'),
  glass: () => { const m = pbr('glazing', [0x2f8a72, 4, 6, [4.8, 5.76]], { envMapIntensity: 1.5 }); m.name = 'hifi-greenglass'; return m; },   // the name makes the lighting module light it at night
  glassClear: () => { const m = pbr('glazing', [0x7fb0aa, 3, 1, [2.65, 1.25], 8], { envMapIntensity: 1.5 }); m.name = 'hifi-kioskglass'; return m; },
  white: () => plain('whitepaint', 0xf4f3ef, 0.45, 0),
  dark: () => plain('darkmetal', 0x2b2d30, 0.5, 0.6),
  lamp: () => plain('lamp', 0xfff1d6, 0.4, 0, { emissive: 0xffe2b0, emissiveIntensity: 1.4 }),
  lantern: () => plain('lantern', 0xc8201c, 0.55, 0, { emissive: 0x7a0c08, emissiveIntensity: 0.45 }),
  gold: () => plain('goldtrim', 0xd8a93a, 0.35, 0.9),
};

/** One gate pavilion in the batch's current frame, as the south (left-hand) one: pier at +x, canopy tip toward the driveway. */
function pavilion(v, c) {
  const stone = M.stone(), glass = M.glass(), white = M.white(), steel = M.steel();
  const H = 7.0, T = 0.78, PIER0 = 14.1, PIER1 = 16.75, BOX0 = 9.3, TIP = 5.85, D = 2.6, RD = 3.4;
  v.slab(pbr('granitePolished', [0x6f6a66, 9]), PIER0 - 0.06, 0, -D - 0.06, PIER1 - PIER0 + 0.12, 0.35, 2 * D + 0.12);      // plinth
  v.slab(stone, PIER0, 0.35, -D, PIER1 - PIER0, H - T - 0.35, 2 * D);                                                    // pier
  v.slab(stone, BOX0, H - T, -RD, PIER1 - BOX0, T, 2 * RD);                                                              // roof over pier and glazed box
  // tapering canopy: flat top, underside rising to a thin edge at the tip
  const yb = H - T, yt = H - 0.22;
  v.quad(stone, [TIP, H, RD], [BOX0, H, RD], [BOX0, H, -RD], [TIP, H, -RD]);                                             // top
  v.quad(white, [TIP, yt, -RD], [BOX0, yb, -RD], [BOX0, yb, RD], [TIP, yt, RD]);                                         // soffit
  v.quad(stone, [BOX0, yb, RD], [BOX0, H, RD], [TIP, H, RD], [TIP, yt, RD]); v.quad(stone, [TIP, yt, -RD], [TIP, H, -RD], [BOX0, H, -RD], [BOX0, yb, -RD]);   // long faces
  v.quad(stone, [TIP, yt, RD], [TIP, H, RD], [TIP, H, -RD], [TIP, yt, -RD]);                                             // tip
  for (let x = TIP + 0.35; x < BOX0 - 0.1; x += 0.5) { const y = yt + (yb - yt) * (x - TIP) / (BOX0 - TIP); v.slab(white, x - 0.03, y - 0.16, -RD + 0.25, 0.06, 0.16, 2 * RD - 0.5); }   // ribs under the canopy
  v.slab(M.lamp(), TIP + 1.2, yt + (yb - yt) * 1.2 / (BOX0 - TIP) - 0.2, -0.6, 0.5, 0.04, 1.2);                          // one light under the canopy
  // glazed box: green glass in a white grid on a stone base
  const G0 = 0.5, G1 = H - T, GD = 2.4;
  v.slab(stone, BOX0, 0, -GD - 0.05, PIER0 - BOX0, G0, 2 * GD + 0.1);
  v.slab(glass, BOX0 + 0.04, G0, -GD + 0.04, PIER0 - BOX0 - 0.04, G1 - G0, 2 * GD - 0.08);
  for (let k = 0; k <= 6; k++) { const y = G0 + (G1 - G0) * k / 6; for (const z of [-GD, GD - 0.07]) v.slab(white, BOX0 - 0.03, y - 0.045, z, PIER0 - BOX0 + 0.03, 0.09, 0.07); v.slab(white, BOX0 - 0.03, y - 0.045, -GD, 0.07, 0.09, 2 * GD); }
  for (let i = 0; i <= 4; i++) { const x = BOX0 + (PIER0 - BOX0) * i / 4; for (const z of [-GD, GD - 0.05]) v.slab(white, x - 0.025, G0, z, 0.05, G1 - G0, 0.05); }
  for (let i = 0; i <= 4; i++) v.slab(white, BOX0 - 0.03, G0, -GD + 2 * GD * i / 4 - 0.025, 0.05, G1 - G0, 0.05);
  // window units low on the inner face and the street face
  for (const [x0, z0, sx, sz] of [[BOX0 - 0.06, -1.9, 0.08, 3.8], [BOX0 + 0.6, -GD - 0.06, 3.4, 0.08]]) {
    v.slab(white, x0, 1.0, z0, sx, 0.09, sz); v.slab(white, x0, 2.25, z0, sx, 0.09, sz);
    const n = 4, along = sx > sz; for (let i = 0; i <= n; i++) along ? v.slab(white, x0 + sx * i / n - 0.04, 1.0, z0, 0.08, 1.34, sz) : v.slab(white, x0, 1.0, z0 + sz * i / n - 0.04, sx, 1.34, 0.08);
  }
  // round column on a dark-red base, with a collar under the canopy
  const CX = 8.35, yc = yt + (yb - yt) * (CX - TIP) / (BOX0 - TIP);
  v.cyl(M.redBase(), CX, 0, 0, 0.5, 0.6, 28).cyl(steel, CX, 0.6, 0, 0.4, yc - 0.6, 28, false).cyl(steel, CX, yc - 0.14, 0, 0.47, 0.14, 28).cyl(steel, CX, 0.6, 0, 0.44, 0.08, 28);
  // red lantern from the canopy tip
  const LX = TIP + 0.18, ly = yt - 1.45;
  v.cyl(M.dark(), LX, ly + 0.5, 0, 0.012, yt - ly - 0.5, 5, false).cyl(M.gold(), LX, ly + 0.42, 0, 0.2, 0.1, 14).cyl(M.gold(), LX, ly - 0.52, 0, 0.2, 0.1, 14).cyl(M.gold(), LX, ly - 1.25, 0, 0.035, 0.75, 6);
  c.slab('generic', PIER0, 0, -D, PIER1 - PIER0, H, 2 * D).slab('generic', BOX0, 0, -GD, PIER0 - BOX0, H, 2 * GD).slab('generic', CX - 0.45, 0, -0.45, 0.9, H, 0.9).slab('generic', TIP, H - 0.1, -RD, PIER1 - TIP, 0.1, 2 * RD);
  return { LX, ly };
}

export function build(ctx) {
  const low = !!ctx.lowPower, R = rng(20261);
  const G = new THREE.Group(); G.name = 'gate'; G.position.set(GX, 0, GZ); G.rotation.y = YAW; ctx.add(G);
  const add = o => { G.add(o); return o; };
  const v = new Batch(), c = new Batch();

  // ================= ground =================
  const lawn = pbr('lawn'), brick = pbr('paving', [0xa9614a, 0x93503c, 8, 16, [1.6, 1.6], 12, true]), pale = pbr('paving', [0xd2cab9, 0xbfb6a3, 2, 4, [2.4, 2.4], 13, true]);
  const grey = pbr('paving', [0xb9b3a7, 0x9c968c, 4, 8, [2.4, 2.4], 11, true]), asphalt = pbr('asphalt'), setts = pbr('setts');
  const PZ = 27, PR = 9.0, RING = 17.5;                                    // pool centre and rim radius; outer radius of the paved ring round it
  add(flatPoly([[-HALF, 0], [HALF, 0], [HALF, DEPTH], [-HALF, DEPTH]], 0.03, lawn, { order: 1 }));
  add(flatPoly([[-HALF, CANAL(-HALF) + 0.3], [HALF, CANAL(HALF) + 0.3], [HALF, -30.2], [-HALF, -30.2]], 0.05, grey, { order: 2, offset: -1 }));        // promenade by the canal
  add(flatPoly(rect(-HALF, -30, HALF, -18), 0.04, asphalt, { order: 2, offset: -1 }));                                                                      // street
  add(flatPoly(rect(-HALF, -18, HALF, 0), 0.05, brick, { order: 2, offset: -1 }));                                                                          // forecourt
  add(flatPoly(rect(-8.35, -18, 8.35, 9.6), 0.06, pale, { order: 3, offset: -2 }));                                                                         // pale central band through the gate
  add(flatPoly(circle(0, PZ, RING, 72), 0.055, grey, { holes: [circle(0, PZ, PR + 0.05, 72).reverse()], order: 3, offset: -2 }));                           // ring round the pool
  add(flatPoly(circle(0, PZ, RING + 0.9, 72), 0.05, setts, { holes: [circle(0, PZ, RING - 0.02, 72).reverse()], order: 3, offset: -2 }));                   // dark border
  add(flatPoly(rect(-6, PZ + RING - 0.5, 6, DEPTH), 0.05, pale, { order: 2, offset: -1 }));                                                                 // avenue to the gymnasium
  for (const s of [-1, 1]) add(flatPoly(rect(s * (RING - 0.5), PZ - 2.2, s * HALF, PZ + 2.2), 0.05, grey, { order: 2, offset: -1 }));         // side paths
  // street paint
  const paint = plain('roadpaint', 0xe9e6dc, 0.7, 0), yellow = plain('roadyellow', 0xd9a623, 0.7, 0), py = 0.065;
  const mark = (x0, z0, x1, z1, m = paint) => add(flatPoly(rect(x0, z0, x1, z1), py, m, { order: 4, offset: -3 }));
  mark(-HALF, -24.12, HALF, -24.02, yellow); mark(-HALF, -23.9, HALF, -23.8, yellow);
  mark(-HALF, -29.75, HALF, -29.63); mark(-HALF, -18.37, -5, -18.25); mark(5, -18.37, HALF, -18.25);
  for (let x = -3.6; x < 3.6; x += 0.9) mark(x, -29.4, x + 0.45, -18.6);                                              // zebra crossing on the axis
  for (const s of [-1, 1]) mark(s * 4.4 - 0.2, -30, s * 4.4 + 0.2, -18);                                              // stop lines either side of it
  v.slab(M.stoneGrey(), -HALF, 0, -30.12, 2 * HALF, 0.14, 0.24);                                                      // kerbs (not colliders: the walking floor is flat)
  for (const s of [-1, 1]) v.slab(M.stoneGrey(), s > 0 ? 8.35 : -HALF, 0, -18.12, HALF - 8.35, 0.14, 0.24);            // dropped across the driveway
  for (let x = -HALF + 3; x < HALF; x += 0.6) if (Math.abs(x) > 4.2) v.slab(plain('tactile', 0xd9b23a, 0.8, 0), x, 0.05, -16.9, 0.56, 0.012, 0.3);   // tactile strip

  // ================= the gate =================
  const tipS = pavilion(v.frame(0, 0, 0), c.frame(0, 0, 0));             // south pavilion
  pavilion(v.frame(0, 0, Math.PI), c.frame(0, 0, Math.PI));              // north pavilion: the same, turned half a turn
  v.frame(0, 0, 0); c.frame(0, 0, 0);
  // lantern bodies (oblate spheres)
  for (const s of [1, -1]) { const m = add(new THREE.Mesh(new THREE.SphereGeometry(0.62, 28, 18), M.lantern())); m.scale.set(1, 0.82, 1); m.position.set(s * tipS.LX, tipS.ly, 0); m.castShadow = true; }
  // kiosk at the north pavilion, toward the street
  const KX0 = -12.1, KX1 = -9.45, KZ0 = -3.95, KZ1 = -2.47;
  v.slab(M.stone(), KX0, 0, KZ0, KX1 - KX0, 0.95, KZ1 - KZ0).slab(M.glassClear(), KX0 + 0.05, 0.95, KZ0 + 0.05, KX1 - KX0 - 0.1, 1.25, KZ1 - KZ0 - 0.05)
    .slab(M.white(), KX0 - 0.12, 2.2, KZ0 - 0.2, KX1 - KX0 + 0.24, 0.5, KZ1 - KZ0 + 0.2).slab(M.white(), KX0 - 0.05, 0.93, KZ0 - 0.16, KX1 - KX0 + 0.1, 0.05, 0.2);
  for (let i = 0; i <= 3; i++) v.slab(M.white(), KX0 + (KX1 - KX0) * i / 3 - 0.03, 0.95, KZ0 - 0.01, 0.06, 1.25, 0.06);
  c.slab('generic', KX0, 0, KZ0, KX1 - KX0, 2.7, KZ1 - KZ0);
  v.slab(plain('plate', 0x1d4f9c, 0.5, 0.2), -15.9, 2.25, -2.64, 0.5, 0.34, 0.03).slab(plain('plate', 0x1d4f9c, 0.5, 0.2), -15.9, 1.8, -2.64, 0.5, 0.3, 0.03);   // blue number plates on the north pier
  // sliding gate: stainless bars; drawn half open so the campus can be entered (the photograph shows it shut)
  const steel = M.steel(), gz = 0.0, GA = -1.2, GB = 7.9;
  v.slab(steel, GA, 0.14, gz - 0.03, GB - GA, 0.07, 0.06).slab(steel, GA, 1.38, gz - 0.03, GB - GA, 0.07, 0.06).slab(steel, GA, 0.78, gz - 0.02, GB - GA, 0.04, 0.04);
  for (let x = GA + 0.06; x < GB; x += 0.115) v.slab(steel, x - 0.012, 0.2, gz - 0.012, 0.024, 1.19, 0.024);
  for (let x = GA; x <= GB + 0.01; x += (GB - GA) / 5) v.slab(steel, x - 0.045, 0.02, gz - 0.045, 0.09, 1.56, 0.09).cyl(steel, x, 1.58, gz, 0.06, 0.05, 10);
  v.slab(steel, GA - 0.02, 0.02, gz - 0.07, 0.5, 1.75, 0.14).slab(M.dark(), GA + 0.04, 1.2, gz - 0.08, 0.38, 0.3, 0.16).slab(M.lamp(), GA + 0.14, 1.79, gz - 0.04, 0.2, 0.09, 0.08);   // drive unit with a warning light
  v.slab(M.dark(), -7.9, 0.055, gz - 0.04, 15.8, 0.012, 0.08);                                                       // floor track
  c.slab('generic', GA, 0, gz - 0.12, GB - GA, 1.8, 0.24);
  // white notice stand by the south column and planters with ball shrubs before the columns
  v.slab(M.white(), 6.5, 0, -2.5, 0.9, 1.7, 0.12);
  const balls = [];
  for (const s of [1, -1]) { v.slab(M.white(), s * 6.95 - 0.5, 0, -1.9, 1.0, 0.62, 1.0).slab(M.dark(), s * 6.95 - 0.42, 0.6, -1.82, 0.84, 0.03, 0.84); balls.push([s * 6.95, -1.4, 0.78, 0.62]); c.slab('generic', s * 6.95 - 0.5, 0, -1.9, 1.0, 1.6, 1.0); }
  // traffic cones in two rows before the gate
  const coneRed = plain('cone', 0xd8351f, 0.6, 0), coneWhite = plain('conewhite', 0xf2f0ea, 0.6, 0);
  for (const s of [1, -1]) for (let i = 0; i < 6; i++) {
    const x = s * (6.3 + i * 0.28), z = -3.4 - i * 0.75, cone = add(new THREE.Mesh(new THREE.ConeGeometry(0.17, 0.62, 14, 1, true), coneRed)); cone.position.set(x, 0.37, z); cone.castShadow = true;
    const band = add(new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.118, 0.14, 14, 1, true), coneWhite)); band.position.set(x, 0.42, z);
    v.slab(coneRed, x - 0.19, 0.05, z - 0.19, 0.38, 0.03, 0.38);
  }

  // ================= walls either side =================
  // north: the red name wall with a white coping
  const WN0 = -16.75, WN1 = -HALF, WH = 3.9;
  v.slab(M.redBase(), WN1, 0, -0.4, WN0 - WN1, 0.3, 0.8).slab(M.red(), WN1, 0.3, -0.34, WN0 - WN1, WH - 0.3, 0.68).slab(M.stone(), WN1, WH, -0.42, WN0 - WN1, 0.22, 0.84);
  c.slab('generic', WN1, 0, -0.4, WN0 - WN1, WH + 0.3, 0.8);
  const name = raised('广东实验中学', 0, 0, 0, 1.55, Math.PI, { spacing: 0.34 });
  name.group.position.set(WN0 - 1.6 - name.width / 2, 2.3, -0.36); add(name.group);
  const latin = raised('GUANGDONG EXPERIMENTAL HIGH SCHOOL', 0, 0, 0, 0.2, Math.PI, { font: SANS, weight: '600', spacing: 0.16 }, 0.02);
  latin.group.position.set(WN0 - 1.6 - name.width / 2, 1.12, -0.35); add(latin.group);
  // south: a low glazed annex, then a stone plinth with railings
  v.slab(M.stone(), 18.4, 0, 0.6, 9.2, 0.5, 5.2).slab(M.glass(), 18.45, 0.5, 0.65, 9.1, 2.55, 5.1).slab(M.stone(), 18.0, 3.05, 0.2, 10.0, 0.5, 6.0);
  for (let i = 0; i <= 8; i++) v.slab(M.white(), 18.4 + 9.2 * i / 8 - 0.03, 0.5, 0.58, 0.06, 2.55, 0.06);
  for (const y of [0.5, 1.35, 2.2, 3.0]) v.slab(M.white(), 18.4, y - 0.035, 0.58, 9.2, 0.07, 0.06);
  c.slab('generic', 18.4, 0, 0.6, 9.2, 3.6, 5.2);
  v.slab(M.stoneGrey(), 16.75, 0, -0.2, HALF - 16.75, 0.5, 0.4); c.slab('generic', 16.75, 0, -0.2, HALF - 16.75, 2.0, 0.4);
  { const n = Math.round((HALF - 16.75) / 0.13), rail = new THREE.InstancedMesh(new THREE.BoxGeometry(0.022, 1.35, 0.022), M.dark(), n), mx = new THREE.Matrix4();
    for (let i = 0; i < n; i++) rail.setMatrixAt(i, mx.makeTranslation(16.8 + i * 0.13, 1.17, 0)); rail.castShadow = true; add(rail);
    v.slab(M.dark(), 16.75, 0.56, -0.02, HALF - 16.75, 0.04, 0.04).slab(M.dark(), 16.75, 1.78, -0.02, HALF - 16.75, 0.04, 0.04); }
  // planting before the walls: a low hedge, ball shrubs, pennants
  const hedge = pbr('hedge');
  v.slab(hedge, WN1, 0, -1.9, WN0 - WN1 - 0.4, 0.7, 1.2).slab(hedge, 17.4, 0, -1.7, HALF - 17.4, 0.7, 1.2);
  for (let x = WN0 - 2.2; x > WN1 + 1; x -= 3.3) balls.push([x, -2.5, 0.85 + 0.25 * R(), 0]);
  for (let x = 18.6; x < HALF - 1; x += 3.1) balls.push([x, -2.4, 0.8 + 0.3 * R(), 0]);
  const flagRed = plain('pennant', 0xd0281f, 0.7, 0, { side: THREE.DoubleSide }), flagYellow = plain('pennant2', 0xe8c22e, 0.7, 0, { side: THREE.DoubleSide });
  for (const [x, z, s] of [[-19.5, -2.9, 1], [-24.7, -3.0, -1], [-30.2, -2.9, 1], [-35.0, -3.0, -1], [19.6, -2.8, 1], [24.3, -2.9, -1], [29.8, -2.8, 1]]) {
    v.cyl(M.white(), x, 0, z, 0.018, 2.3, 6);
    const tri = new THREE.BufferGeometry(); tri.setAttribute('position', new THREE.Float32BufferAttribute([0, 2.28, 0, 0, 1.72, 0, 0.78, 1.98, 0.12 * s], 3)); tri.computeVertexNormals();
    const f = add(new THREE.Mesh(tri, s > 0 ? flagRed : flagYellow)); f.position.set(x, 0, z); f.rotation.y = 0.5 * s; f.castShadow = true;
  }

  // ================= behind the gate: flower terrace and pool =================
  const terr = M.red(), TR0 = PR + 2.7, TR1 = PR + 4.0, A0 = Math.PI * 1.5 - 0.72, A1 = Math.PI * 1.5 + 0.72;       // an arc on the gate side of the pool
  add(lathe([[TR1, 0], [TR1, 0.45], [TR1 - 0.1, 0.5], [TR0 + 0.1, 0.5], [TR0, 0.45], [TR0, 0]], 0, PZ, terr, 40, A0, A1));
  for (const a of [A0, A1]) { v.frame(Math.cos(a) * (TR0 + TR1) / 2, PZ + Math.sin(a) * (TR0 + TR1) / 2, -a).slab(terr, -(TR1 - TR0) / 2, 0, -0.06, TR1 - TR0, 0.5, 0.12); } v.frame(0, 0, 0);   // close the two ends
  const bed = [];
  for (let i = 0; i < (low ? 700 : 1700); i++) { const a = A0 + 0.02 + (A1 - A0 - 0.04) * R(), r = TR0 + 0.16 + (TR1 - TR0 - 0.32) * R(); bed.push([Math.cos(a) * r, PZ + Math.sin(a) * r]); }
  add(flowers(bed, [0xd8262b, 0xe84a3a, 0xf2b61f, 0xf6d84a, 0xe0407a, 0xffffff], { seed: 5, y: 0.56, size: 0.34 }));
  add(lathe([[TR1 - 0.11, 0.5], [TR1 - 0.3, 0.6], [TR0 + 0.3, 0.6], [TR0 + 0.11, 0.5]], 0, PZ, pbr('hedge', [0x2a4a22]), 40, A0, A1));                    // foliage under the flowers
  for (let i = 0; i <= 12; i++) { const a = A0 + (A1 - A0) * i / 12; c.frame(Math.cos(a) * (TR0 + TR1) / 2, PZ + Math.sin(a) * (TR0 + TR1) / 2, -a).slab('generic', -0.7, 0, -0.8, 1.4, 1.2, 1.6); }
  c.frame(0, 0, 0);
  // pool: dark polished coping, tiled inside, water with reflections
  add(lathe([[PR, 0], [PR, 0.44], [PR - 0.05, 0.5], [PR - 0.75, 0.5], [PR - 0.8, 0.46], [PR - 0.8, 0.1]], 0, PZ, M.black(), 72));
  add(lathe([[PR - 0.8, 0.46], [PR - 0.8, 0.1]], 0, PZ, pbr('mosaic'), 72));
  const WL = 0.34, water = new Water(new THREE.CircleGeometry(PR - 0.79, 64), { textureWidth: low ? 256 : 512, textureHeight: low ? 256 : 512, waterNormals: waterNormals(),
    sunDirection: new THREE.Vector3(0.4, 0.8, 0.3), sunColor: 0xffffff, waterColor: 0x0b3b3c, distortionScale: 1.1, fog: true });
  water.rotation.x = -Math.PI / 2; water.position.set(0, WL, PZ); water.material.uniforms.size.value = 24; water.name = 'pool-water'; add(water);
  for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2; c.frame(Math.cos(a) * (PR - 0.4), PZ + Math.sin(a) * (PR - 0.4), -a).slab('generic', -0.45, 0, -1.25, 0.9, 0.95, 2.5); }
  c.frame(0, 0, 0);
  // the rock with the motto
  { const geo = new THREE.IcosahedronGeometry(1, 4), p = geo.attributes.position, q = new THREE.Vector3();
    for (let i = 0; i < p.count; i++) {
      q.fromBufferAttribute(p, i); const n = 1 + 0.2 * Math.sin(q.x * 3.1 + 1.7) * Math.cos(q.y * 2.7) + 0.12 * Math.sin(q.z * 5.3 + q.x * 4.1) + 0.08 * Math.cos(q.y * 7.1 + q.z * 3.3);
      q.multiplyScalar(n); q.z = Math.max(q.z, -0.5 + 0.06 * Math.sin(q.x * 6) * Math.cos(q.y * 5)); p.setXYZ(i, q.x * 3.1, q.y * 1.55 + 0.95, q.z * 1.25);
    }
    geo.computeVertexNormals(); const uv = geo.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * 6, uv.getY(i) * 3);
    const rock = add(new THREE.Mesh(geo, pbr('rock'))); rock.position.set(0, WL - 0.25, PZ); rock.castShadow = rock.receiveShadow = true;
    const motto = raised('爱国 团结 求实 创新', 0, 0, 0, 0.5, Math.PI, { color: 0xb5231c, metalness: 0.1, roughness: 0.55, spacing: 0.1 }, 0.012);
    motto.group.position.set(0, WL + 1.25, PZ - 0.66); add(motto.group);
    for (const [x, z, s] of [[-3.6, 0.5, 0.9], [3.4, 0.9, 0.75], [2.2, -1.3, 0.5]]) { const g2 = new THREE.IcosahedronGeometry(s, 2), p2 = g2.attributes.position; for (let i = 0; i < p2.count; i++) { const k = 1 + 0.25 * Math.sin(p2.getX(i) * 5 + i); p2.setXYZ(i, p2.getX(i) * k, p2.getY(i) * 0.7 * k, p2.getZ(i) * k); } g2.computeVertexNormals(); const m = add(new THREE.Mesh(g2, pbr('rock'))); m.position.set(x, WL, PZ + z); m.castShadow = true; }
    c.slab('generic', -3.2, 0, PZ - 1.3, 6.4, 3.2, 2.6);
  }
  // fountain: droplets on ballistic arcs
  const jets = [];
  for (let i = 0; i < 20; i++) { const a = i / 20 * Math.PI * 2 + 0.16, r0 = PR - 1.25; jets.push({ o: [Math.cos(a) * r0, WL + 0.12, PZ + Math.sin(a) * r0], v: [-Math.cos(a) * 2.6, 6.2, -Math.sin(a) * 2.6], n: low ? 60 : 140, j: 0.2 }); }
  for (const [x, z] of [[-4.6, -0.2], [4.6, -0.2], [-2.6, 2.6], [2.6, 2.6]]) jets.push({ o: [x, WL + 0.1, PZ + z], v: [0, 8.8, 0], n: low ? 120 : 260, j: 0.34 });
  const total = jets.reduce((a, j) => a + j.n, 0), org = new Float32Array(total * 3), vel = new Float32Array(total * 3), ph = new Float32Array(total);
  { let k = 0; for (const j of jets) for (let i = 0; i < j.n; i++, k++) { org.set(j.o, k * 3); vel.set([j.v[0] + (R() - 0.5) * j.j, j.v[1] * (0.93 + 0.1 * R()), j.v[2] + (R() - 0.5) * j.j], k * 3); ph[k] = R(); } }
  const fg = new THREE.BufferGeometry(); fg.setAttribute('position', new THREE.BufferAttribute(org, 3)); fg.setAttribute('aVel', new THREE.BufferAttribute(vel, 3)); fg.setAttribute('aPhase', new THREE.BufferAttribute(ph, 1));
  const fountain = new THREE.Points(fg, new THREE.ShaderMaterial({ transparent: true, depthWrite: false, uniforms: { uTime: { value: 0 }, uLight: { value: 1 }, uScale: { value: 600 } },
    vertexShader: `attribute vec3 aVel; attribute float aPhase; uniform float uTime, uScale; varying float vA;
      void main() { float T = 2.0 * aVel.y / 9.8; float t = fract(uTime / T + aPhase) * T; vec3 p = position + aVel * t + vec3(0.0, -4.9 * t * t, 0.0);
        vA = 0.25 + 0.75 * smoothstep(0.0, 0.25, t / T) * (1.0 - 0.6 * smoothstep(0.75, 1.0, t / T));
        vec4 mv = modelViewMatrix * vec4(p, 1.0); gl_Position = projectionMatrix * mv; gl_PointSize = uScale * (0.06 + 0.07 * fract(aPhase * 7.0)) / -mv.z; }`,
    fragmentShader: `uniform float uLight; varying float vA;
      void main() { vec2 q = gl_PointCoord - 0.5; float d = length(q); if (d > 0.5) discard; gl_FragColor = vec4(vec3(0.93, 0.97, 1.0) * uLight, vA * 0.7 * smoothstep(0.5, 0.08, d)); }` }));
  fountain.frustumCulled = false; fountain.name = 'fountain'; fountain.renderOrder = 5; add(fountain);
  for (const j of jets) v.cyl(steel, j.o[0], WL - 0.1, j.o[2], 0.035, 0.2, 8);

  // ================= furniture =================
  const timber = pbr('timber'), bench = (x, z, ang) => { v.frame(x, z, ang); c.frame(x, z, ang);
    v.slab(M.stoneGrey(), -0.95, 0, -0.2, 0.14, 0.42, 0.4).slab(M.stoneGrey(), 0.81, 0, -0.2, 0.14, 0.42, 0.4); for (let i = 0; i < 4; i++) v.slab(timber, -1.05, 0.42, -0.24 + i * 0.125, 2.1, 0.045, 0.105);
    c.slab('generic', -1.05, 0, -0.24, 2.1, 0.5, 0.5); v.frame(0, 0, 0); c.frame(0, 0, 0); };
  for (const a of [0.42, 1.0, 2.14, 2.72]) { bench(Math.cos(a) * (RING - 1.2), PZ + Math.sin(a) * (RING - 1.2), -a + Math.PI / 2); }
  const lampPost = (x, z) => { v.cyl(M.dark(), x, 0, z, 0.07, 3.9, 10).cyl(M.dark(), x, 0, z, 0.12, 0.5, 10).cyl(M.lamp(), x, 3.9, z, 0.16, 0.42, 12).cyl(M.dark(), x, 4.32, z, 0.2, 0.05, 12); c.slab('generic', x - 0.1, 0, z - 0.1, 0.2, 4, 0.2); };
  for (let i = 0; i < 8; i++) { const a = (i + 0.5) / 8 * Math.PI * 2; lampPost(Math.cos(a) * (RING + 0.45), PZ + Math.sin(a) * (RING + 0.45)); }
  for (let z = PZ + RING + 6; z < DEPTH - 4; z += 14) for (const s of [-1, 1]) lampPost(s * 6.6, z);
  for (let x = -HALF + 5; x < HALF; x += 14) lampPost(x, CANAL(x) + 1.6);
  for (const s of [-1, 1]) for (let i = 0; i < 4; i++) v.cyl(steel, s * (9.6 + i * 1.6), 0, -17.4, 0.085, 0.75, 12).cyl(steel, s * (9.6 + i * 1.6), 0.75, -17.4, 0.1, 0.04, 12);   // bollards at the kerb

  // ================= planting =================
  const inside = (x, z) => Math.hypot(x, z - PZ) < RING + 2.2 || (Math.abs(x) < 8 && z < DEPTH) || (z < 3.5 && Math.abs(x) < 17.5);
  const big = [], put = (x, z, h) => { if (!inside(x, z)) big.push([x, z, h]); };
  for (const s of [-1, 1]) {
    for (const [x, z, h] of [[12.5, 6.5, 10.5], [20.5, 9, 12.5], [29, 6.5, 12], [35, 12, 11], [26, 18, 13], [34.5, 26, 12], [23.5, 33, 11.5], [33, 41, 12.5], [24, 50, 12], [34, 58, 13], [25.5, 67, 11.5], [34, 76, 12.5], [24.5, 85, 12], [34, 94, 13], [26, 102, 11]]) put(s * x + (R() - 0.5) * 2, z + (R() - 0.5) * 2, h);
    for (let z = PZ + RING + 5; z < DEPTH - 2; z += 9.5) big.push([s * 9.4, z, 9.5]);                                 // avenue rows
  }
  for (let x = -HALF + 4; x < HALF; x += 8.5) big.push([x, CANAL(x) + 3.1, 9]);                                       // promenade row
  const trees = broadleafTrees(big, { seed: 7, low }); add(trees.group);
  const palmList = []; for (let i = 0; i < 10; i++) { const a = (i + 0.5) / 10 * Math.PI * 2; if (Math.abs(Math.cos(a)) > 0.97 || Math.sin(a) < -0.8) continue; palmList.push([Math.cos(a) * (RING + 2.6), PZ + Math.sin(a) * (RING + 2.6), 10.5 + R()]); }
  const palms = royalPalms(palmList, { seed: 3 }); add(palms.group);
  const cones = conifers([[10.4, 11.2, 12], [-10.4, 11.2, 12.5], [15.6, 6.2, 9.5], [-15.6, 6.2, 9]], { seed: 9 }); add(cones.group);
  for (const [x, z, r] of [...trees.trunks, ...palms.trunks, ...cones.trunks]) c.slab('generic', x - r, 0, z - r, 2 * r, 3, 2 * r);
  // clipped shrubs: the ball shrubs collected above, two cloud-pruned groups on the terrace, low hedges along the paths
  for (const s of [-1, 1]) for (const [dx, dz, r, y] of [[0, 0, 0.7, 1.35], [0.7, 0.25, 0.48, 1.0], [-0.6, 0.2, 0.52, 1.1], [0.15, -0.1, 0.4, 2.1]]) { const a = Math.PI * 1.5 + s * 0.9, rr = (TR0 + TR1) / 2; balls.push([Math.cos(a) * rr + dx, PZ + Math.sin(a) * rr + dz, r, y]); }
  add(shrubs(balls.filter(b => !b[3]).map(([x, z, r]) => [x, z, r]), { seed: 6 })); add(shrubsAt(balls));     // on the ground; lifted on stems or planters
  for (const s of [-1, 1]) { v.slab(hedge, s * 8.5 - 0.35, 0, 1.2, 0.7, 0.75, 8.0); v.slab(hedge, s * (RING + 1.2) - (s > 0 ? 0 : HALF - RING - 2), 0, PZ + 2.5, HALF - RING - 2, 0.8, 0.8); v.slab(hedge, s * (RING + 1.2) - (s > 0 ? 0 : HALF - RING - 2), 0, PZ - 3.3, HALF - RING - 2, 0.8, 0.8); }
  const beds = []; for (let i = 0; i < (low ? 500 : 1200); i++) { const s = R() < 0.5 ? -1 : 1; beds.push([s * (8.95 + R() * 1.1), 1.4 + R() * 7.6]); }
  add(flowers(beds, [0xe84a3a, 0xf2b61f, 0xf6d84a, 0xffffff, 0xd8262b], { seed: 8, y: 0.22, size: 0.3 }));
  for (const s of [-1, 1]) v.slab(pbr('hedge', [0x2a4a22]), s > 0 ? 8.9 : -10.1, 0, 1.3, 1.2, 0.26, 7.8);                  // leafy bed under them

  // ================= assemble =================
  add(v.build({ name: 'gate-visual' }));
  const cg = add(c.build({ name: 'gate-colliders' })); cg.visible = false; cg.updateWorldMatrix(true, true); cg.traverse(o => { if (o.isMesh) ctx.collide(o); });

  // places for the menu and the start of the demo (world coordinates; heading 270 = looking west, into the campus)
  if (ctx.place) {
    const P = (name, x, z, yaw, y = 0, fly = false, pitch = 0) => { const w = toWorld(x, z); ctx.place(name, w[0], w[1], yaw, y, fly, pitch); };
    P('校门', 0.6, -20.5, 270, 0, false, 0.06);
    P('校门内 · 水池', 5.5, 11.5, 250, 0, false, -0.04);
    P('水池西侧（回望校门）', -2, PZ + RING - 1.5, 93, 0, false, 0.03);
    P('航拍：校门', 22, -34, 303, 21, true, -0.33);
  }
  // The water draws the scene a second time, mirrored. Keep that cheap: once per frame (the ambient-occlusion pass would
  // trigger it again) and without the parts of the campus that are too far away to show in the pool.
  let frameNo = 0, lastMirror = -1, far = null;
  const mirror = water.onBeforeRender, pool = new THREE.Vector3(...toWorld(0, PZ).flatMap((q, i) => (i ? [0, q] : [q]))), box = new THREE.Box3(), centre = new THREE.Vector3();
  water.onBeforeRender = function (renderer, scene, camera) {
    if (frameNo === lastMirror) return; lastMirror = frameNo;
    if (!far) { far = []; const root = G.parent && G.parent.parent; if (root) for (const g of root.children) { if (g === G.parent || !g.visible) continue; box.setFromObject(g); if (box.isEmpty()) continue; box.getCenter(centre); if (box.distanceToPoint(pool) > 130) far.push(g); } }
    for (const g of far) g.visible = false;
    try { mirror.call(this, renderer, scene, camera); } finally { for (const g of far) g.visible = true; }
  };
  // per-frame: water, droplets, leaves
  if (ctx.animate) {
    const dir = new THREE.Vector3(), tmp = new THREE.Vector3(), size = new THREE.Vector2();
    ctx.animate((dt, t, env) => {
      frameNo++;
      water.material.uniforms.time.value = t * 0.55; fountain.material.uniforms.uTime.value = t; WIND.value = t;
      const L = env && env.lighting, sun = L && (L.suns ? L.suns[0] : L.sun);
      if (sun) {
        dir.copy(sun.position).sub(sun.target.position).normalize(); if (dir.y < 0.02) dir.set(0.3, 0.6, 0.2).normalize();
        water.material.uniforms.sunDirection.value.copy(dir);
        const day = Math.min(1, Math.max(0, L.hemi ? L.hemi.intensity : 1)), k = 0.25 + 0.75 * day;
        water.material.uniforms.sunColor.value.setScalar(0.25 + 0.75 * day); fountain.material.uniforms.uLight.value = 0.35 + 0.75 * day; void k;
      }
      if (env && env.renderer) { env.renderer.getDrawingBufferSize(size); fountain.material.uniforms.uScale.value = size.y * 0.9; }
      void tmp;
    });
  }
}

/** Second layer of the ball shrubs: the same balls lifted on short stems where a height is given (planters, cloud-pruned groups). */
function shrubsAt(list) {
  const lifted = list.filter(b => b[3] > 0), g = new THREE.Group();
  const stems = new Batch(); for (const [x, z, r, y] of lifted) if (y > 0.9) stems.cyl(pbr('bark'), x, 0.7, z, 0.06, y - 0.6, 6, false);
  g.add(stems.build({ name: 'shrub-stems' }));
  const top = shrubs(lifted.map(([x, z, r]) => [x, z, r]), { seed: 16 }); top.position.y = 0; g.add(top);
  const m = new THREE.Matrix4(), p = new THREE.Vector3(), q = new THREE.Quaternion(), s = new THREE.Vector3();
  lifted.forEach(([, , , y], i) => { top.getMatrixAt(i, m); m.decompose(p, q, s); p.y = y + 0.16 * s.x; top.setMatrixAt(i, m.compose(p, q, s)); });
  return g;
}
