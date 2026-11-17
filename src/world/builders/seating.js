// West grandstand, open seating strip (item grandstand-seating): stepped concrete tiers of individual seats facing east
// toward the track, in front of the stand building (grandstand.js builds the terrace behind the top tier).
//
// Seen in the references:
// - 2018 drone video frames 12-14, 33, 34, 38-41, 46-48, 61-63: three seat blocks of equal length; white front parapet
//   with a railing on top; a base wall with doors under it; a rostrum projecting from the middle block with a white
//   stair along the front wall at each end of it; a slim open stair at the south end (frames 39, 47); raked white end
//   parapets; pale aisle stairs between the sub-blocks.
// - 2022 sports-day video frames 2, 6, 9, 42-43, 49-55 and stills at 0:12-0:15: the base wall is red brick with grey
//   doors and small high windows, the parapet band is cream-white with a steel railing, the stairs have white solid
//   balustrades with a steel handrail.
// - Satellite image: aisle positions along the strip (fractions in AISLES).
//
// SEAT COLOURS: blue (north block), red (middle), green (south). The brief asked for "all blue, the 2022 state", but
// the 2022 frames do not show that: at 0:03 and in frames 9 and 43 the middle block is still red, and the south block,
// mostly hidden under blue event tents, shows green between the tents. The north block is blue in both years. To get
// an all-blue stand change BLOCKS below to three 'seatBlue' entries.
//
// ASSUMED (not measurable in any reference):
// - Number of rows (8) and all vertical sizes. The data height (5 m to the top tier) is used as given; the front walkway
//   is put at 0.48 of it because the parapet sits about half way up in frames 41 and 48. In the frames the stand looks
//   roughly 1.5 times taller than this (door-height scale), so the rake here is flatter than the real one.
// - Seat size and pitch, the rail the seats stand on.
// - End aisles beside both end walls; count and exact positions of doors and windows in the base wall.
// - The rostrum and its two stairs project 2.0 m east of the measured outline (they are outside the strip that was
//   measured); the south-end stair likewise. Stair width, riser and tread sizes.
// - Under the tiers the stand is solid (no rooms are modelled behind the doors). Banners are temporary and left out.
// Collision: tier boxes, inclined plates on every aisle and stair, parapets and railings. Seats have no collision so
// that a row can be walked along.
import { THREE, bbox } from '../../kit.js';
import { Batch } from '../../batch.js';

const ROWS = 8;                 // seat rows
const WALK = 1.6;               // front walkway between the parapet and the first riser
const PAR = 0.25;               // thickness of parapets and end walls
const RISER = 0.16, TREAD = 0.28;                                             // access stairs
const PITCH = 0.5;              // seat spacing along a row
const BLOCKS = [[0.330, 'seatBlue'], [0.662, 'seatRed'], [2, 'seatGreen']];   // [south limit as a fraction of the length, seat material], north to south
const AISLES = [0.065, 0.195, 0.330, 0.441, 0.552, 0.662, 0.805, 0.935];      // aisle centres as fractions of the length from the north end
const ROSTRUM = [0.396, 0.596], OUT = 2.0, LAND = 1.8;                        // rostrum extent (fractions), projection, stair landing length

let plainWhite = null;          // untextured white for raked parts (a tiled texture would shear on them)
const white = () => plainWhite || (plainWhite = new THREE.MeshStandardMaterial({ color: 0xf1efe8, roughness: 0.8 }));

// Solid with 8 corners: P[0..3] one end face in ring order, P[4..7] the matching corners of the other end. Faces are wound outward.
// omit: indices of faces to leave out (0 and 1 are the two ends, 2-5 the sides in ring order starting with edge 0-1).
function hexa(b, m, P, omit = []) {
  const cen = [0, 1, 2].map(i => P.reduce((s, p) => s + p[i], 0) / 8);
  [[0, 1, 2, 3], [4, 5, 6, 7], [0, 1, 5, 4], [1, 2, 6, 5], [2, 3, 7, 6], [3, 0, 4, 7]].forEach((f, fi) => {
    if (omit.includes(fi)) return;
    const [A, B, C, D] = f.map(i => P[i]);
    const u = [0, 1, 2].map(i => B[i] - A[i]), w = [0, 1, 2].map(i => D[i] - A[i]);
    const n = [u[1] * w[2] - u[2] * w[1], u[2] * w[0] - u[0] * w[2], u[0] * w[1] - u[1] * w[0]];
    const out = [0, 1, 2].map(i => (A[i] + B[i] + C[i] + D[i]) / 4 - cen[i]);
    if (n[0] * out[0] + n[1] * out[1] + n[2] * out[2] >= 0) b.quad(m, A, B, C, D); else b.quad(m, A, D, C, B);
  });
}
// Prism from z0 to z1 with cross-section q = [[x, y] x 4] / from x0 to x1 with cross-section q = [[z, y] x 4].
const prismZ = (b, m, q, z0, z1, omit) => hexa(b, m, [...q.map(([x, y]) => [x, y, z0]), ...q.map(([x, y]) => [x, y, z1])], omit);
const prismX = (b, m, q, x0, x1, omit) => hexa(b, m, [...q.map(([z, y]) => [x0, y, z]), ...q.map(([z, y]) => [x1, y, z])], omit);
const S3 = (b, m, x0, x1, y0, y1, z0, z1, skip) => b.slab(m, Math.min(x0, x1), y0, Math.min(z0, z1), Math.abs(x1 - x0), y1 - y0, Math.abs(z1 - z0), skip);

// Steel railing along z at a fixed x: posts, top rail and a mid rail.
function railZ(v, x, y0, y1, z0, z1) {
  if (z1 - z0 < 0.2) return;
  const n = Math.max(1, Math.round((z1 - z0) / 1.5));
  for (let i = 0; i <= n; i++) v.box('steel', x, (y0 + y1) / 2, z0 + (z1 - z0) * i / n, 0.05, y1 - y0, 0.05, 'D');
  v.box('steel', x, y1, (z0 + z1) / 2, 0.06, 0.05, z1 - z0).box('steel', x, (y0 + y1) / 2, (z0 + z1) / 2, 0.03, 0.03, z1 - z0);
}
// Framed panel (door or window) on a wall face at x that looks east.
function panelE(v, m, x, zc, w, y0, y1) {
  v.box(m, x + 0.02, (y0 + y1) / 2, zc, 0.04, y1 - y0, w, 'W');
  for (const s of [-1, 1]) v.box('metalWhite', x + 0.03, (y0 + y1) / 2, zc + s * (w / 2 + 0.03), 0.06, y1 - y0 + 0.12, 0.06, 'W');
  v.box('metalWhite', x + 0.03, y1 + 0.03, zc, 0.06, 0.06, w, 'W');
}

export function build(item, ctx) {
  const o = bbox(item.points), H = item.height, W = o.w, E = o.e, N = o.n, S = o.s, L = S - N;
  const nR = Math.max(6, Math.round(0.48 * H / RISER)), yF = nR * RISER;        // front walkway level = a whole number of stair risers
  const rise = (H - yF) / ROWS, xT = E - PAR - WALK, td = (xT - W) / ROWS;      // xT: foot of the first riser; td: tread depth of a row
  const v = new Batch(), c = new Batch();
  const both = (m, ...a) => { S3(v, m, ...a); S3(c, 'generic', ...a); };
  const at = f => N + f * L;

  // --- tiers and front walkway (solid down to the ground) ---
  for (let k = 1; k <= ROWS; k++) { const xw = xT - k * td; both('concrete', xw, xw + td, 0, yF + k * rise, N, S, k < ROWS ? 'DNSW' : 'DNS'); }
  both('concrete', xT, E - PAR, 0, yF, N, S, 'DNSEW');

  // --- aisles: pale half steps (visual) and one inclined plate each (collision) ---
  const aisles = [{ z: N + PAR + 0.6, hw: 0.6 }, ...AISLES.map(f => ({ z: at(f), hw: BLOCKS.some(b => b[0] === f) ? 0.8 : 0.6 })), { z: S - PAR - 0.6, hw: 0.6 }];
  for (const a of aisles) {
    const z0 = a.z - a.hw, z1 = a.z + a.hw;
    for (let k = 0; k <= ROWS; k++) {
      const xw = xT - k * td, y = yF + k * rise;
      if (k < ROWS) S3(v, 'roofPale', xw, xw + td / 2, y, y + rise / 2, z0, z1, 'DW');                        // half step on the west half of the tread
      if (k > 0) S3(v, 'roofPale', xw + (k < ROWS ? td / 2 : 0), xw + td + 0.02, y - 0.1, y + 0.03, z0, z1, 'DW'); // painted tread and nosing
    }
    // the plate passes through the middle of every half tread, so it meets each row level where the row is walked
    prismZ(c, 'generic', [[xT + 0.75 * td, yF - 0.25], [xT + 0.75 * td, yF], [xT - (ROWS - 0.75) * td, H], [xT - (ROWS - 0.75) * td, H - 0.25]], z0, z1);
  }

  // --- seats: back and pan on a rail, one colour per block ---
  for (let i = 0; i + 1 < aisles.length; i++) {
    const z0 = aisles[i].z + aisles[i].hw, z1 = aisles[i + 1].z - aisles[i + 1].hw, n = Math.floor((z1 - z0 - 0.1) / PITCH);
    if (n < 1) continue;
    const zm = (z0 + z1) / 2, m = BLOCKS.find(b => (zm - N) / L < b[0])[1], zs = zm - (n - 1) * PITCH / 2;
    for (let k = 1; k <= ROWS; k++) {
      const xw = xT - k * td, y = yF + k * rise;
      v.box('roofGrey', xw + 0.3, y + 0.33, zm, 0.06, 0.09, n * PITCH - 0.1);
      for (let j = 0; j < n; j++) {
        v.box(m, xw + 0.33, y + 0.4, zs + j * PITCH, 0.4, 0.05, 0.42).box(m, xw + 0.12, y + 0.57, zs + j * PITCH, 0.05, 0.4, 0.42, 'D');
        if (j % 3 === 0 || j === n - 1) v.box('roofGrey', xw + 0.3, y + 0.145, zs + j * PITCH, 0.05, 0.29, 0.05, 'UD');
      }
    }
  }

  // --- front: brick base wall, white parapet band, railing; openings where the stairs land ---
  const zR0 = at(ROSTRUM[0]), zR1 = at(ROSTRUM[1]), xR = E + OUT, run = (nR - 1) * TREAD;
  const zSt = S - 0.4 - run;                                                    // top of the south-end stair
  const gaps = [[zR0 + 0.15, zR0 + LAND], [zR1 - LAND, zR1 - 0.15], [zSt - 1.5, zSt - 0.1]];
  S3(v, 'brickRed', E - PAR, E, 0, yF - 0.4, N, S, 'DWU'); S3(v, 'wallWhite', E - PAR, E + 0.05, yF - 0.4, yF, N, S, 'W');
  S3(c, 'generic', E - PAR, E, 0, yF, N, S, 'DW');
  let zPrev = N + PAR;
  for (const [g0, g1] of [...gaps, [S - PAR, S]]) {
    both('wallWhite', E - PAR, E + 0.05, yF, yF + 0.4, zPrev, g0, 'D');
    railZ(v, E - PAR / 2, yF + 0.4, yF + 1.1, zPrev + 0.05, g0 - 0.05);
    S3(c, 'generic', E - PAR / 2 - 0.03, E - PAR / 2 + 0.03, yF + 0.4, yF + 1.1, zPrev, g0, 'D');
    zPrev = g1;
  }
  const clear = z => (z < zR0 - run - 1.5 || z > zR1 + run + 1.5) && z < zSt - 2.5;                 // free stretch of the main front wall
  for (const f of [0.05, 0.13, 0.26, 0.72, 0.86]) if (clear(at(f))) panelE(v, 'roofGrey', E, at(f), 1.0, 0, yF - 0.5);
  for (const f of [0.09, 0.17, 0.22, 0.30, 0.69, 0.76, 0.80, 0.90]) if (clear(at(f))) panelE(v, 'glassDark', E, at(f), 1.1, yF - 1.15, yF - 0.6);

  // --- rostrum: platform at walkway level in front of the middle block ---
  S3(v, 'brickRed', E, xR, 0, yF - 0.5, zR0, zR1, 'DWU'); S3(v, 'wallWhite', E, xR + 0.05, yF - 0.5, yF - 0.03, zR0, zR1, 'WU'); S3(v, 'concrete', E, xR + 0.05, yF - 0.03, yF, zR0, zR1, 'DW');
  S3(c, 'generic', E, xR, 0, yF, zR0, zR1, 'DW');
  both('wallWhite', xR - 0.2, xR + 0.05, yF, yF + 0.45, zR0, zR1, 'D');
  railZ(v, xR - 0.1, yF + 0.45, yF + 1.1, zR0 + 0.05, zR1 - 0.05);
  S3(c, 'generic', xR - 0.13, xR - 0.07, yF + 0.45, yF + 1.1, zR0, zR1, 'D');
  const zm = (zR0 + zR1) / 2;
  for (const dz of [-5.5, 5.5]) panelE(v, 'roofGrey', xR, zm + dz, 1.0, 0, yF - 0.6);
  for (const dz of [-8.2, -2.4, 2.4, 8.2]) panelE(v, 'glassDark', xR, zm + dz, 1.1, yF - 1.25, yF - 0.7);

  // --- stairs. A flight tops out at zTop and runs down in direction d (-1 north, +1 south) between x0 and x1 ---
  const line = dist => yF - (dist + TREAD / 2) * RISER / TREAD;                 // height of the line through the tread centres, by distance from the top
  function flight(zTop, d, x0, x1) {
    for (let i = 1; i < nR; i++) S3(v, 'concrete', x0, x1, 0, i * RISER, zTop + d * (nR - 1 - i) * TREAD, zTop + d * (nR - i) * TREAD, 'D');
    prismX(c, 'generic', [[zTop - d * TREAD / 2, yF - 0.25], [zTop - d * TREAD / 2, yF], [zTop + d * (nR - 0.5) * TREAD, 0], [zTop + d * (nR - 0.5) * TREAD, -0.25]], x0, x1);
  }
  // solid white balustrade with a steel handrail on the outer (east) side of a flight, on a brick wall
  function balustrade(zTop, d, x0, x1) {
    const far = run + 0.2, zFar = zTop + d * far;
    prismX(v, white(), [[zTop, line(0) - 0.42], [zTop, line(0) + 0.53], [zFar, line(far) + 0.53], [zFar, line(far) - 0.42]], x0, x1 + 0.05);
    for (let i = 0; i * TREAD < far; i++) {                                     // brick under the band: nested boxes whose stepped tops the band hides
      const top = line(i * TREAD) - 0.32;
      if (top > 0.05) S3(v, 'brickRed', x0, x1, 0, top, zTop, zTop + d * Math.min(far, (i + 1) * TREAD), 'DUNS');
    }
    S3(v, 'wallWhite', x0 - 0.05, x1 + 0.1, 0, line(far) + 0.75, zFar - d * 0.02, zFar + d * 0.3, 'D');                      // newel pier at the foot
    const xm = (x0 + x1) / 2;
    prismX(v, 'steel', [[zTop, line(0) + 0.93], [zTop, line(0) + 0.98], [zFar, line(far) + 0.98], [zFar, line(far) + 0.93]], xm - 0.03, xm + 0.03);
    for (let t = 0.3; t < far; t += 1.2) v.box('steel', xm, line(t) + 0.74, zTop + d * t, 0.04, 0.44, 0.04, 'UD');
    prismX(c, 'generic', [[zTop, 0], [zTop, line(0) + 1.0], [zFar + d * 0.3, line(far) + 1.0], [zFar + d * 0.3, 0]], x0, x1);
  }
  for (const [zTop, d] of [[zR0, -1], [zR1, 1]]) { flight(zTop, d, E, xR - 0.2); balustrade(zTop, d, xR - 0.2, xR); }

  // slim stair at the south end (2018 frames 39 and 47): rises northward to a landing, steel railing only
  const xo = E + 1.2;
  flight(zSt, 1, E, xo);
  both('concrete', E, xo, 0, yF, zSt - 1.6, zSt, 'DW');
  railZ(v, xo - 0.03, yF, yF + 1.0, zSt - 1.57, zSt);
  for (const x of [E + 0.03, xo - 0.03]) v.box('steel', x, yF + 0.5, zSt - 1.57, 0.05, 1.0, 0.05, 'D');
  v.box('steel', (E + xo) / 2, yF + 1.0, zSt - 1.57, xo - E, 0.05, 0.06).box('steel', (E + xo) / 2, yF + 0.5, zSt - 1.57, xo - E, 0.03, 0.03);
  prismX(v, 'steel', [[zSt, line(0) + 0.98], [zSt, line(0) + 1.03], [zSt + run, line(run) + 1.03], [zSt + run, line(run) + 0.98]], xo - 0.06, xo);
  for (let t = 0.2; t <= run; t += 0.93) v.box('steel', xo - 0.03, line(t) + 0.5, zSt + t, 0.05, 1.0, 0.05, 'UD');
  S3(c, 'generic', xo - 0.06, xo, 0, yF + 1.0, zSt - 1.6, zSt, 'D'); S3(c, 'generic', E, xo, 0, yF + 1.0, zSt - 1.63, zSt - 1.57, 'D');
  prismX(c, 'generic', [[zSt, 0], [zSt, line(0) + 1.03], [zSt + run + 0.2, line(run) + 1.03], [zSt + run + 0.2, 0]], xo - 0.06, xo);

  // --- end walls: brick below, raked white parapet band along the rake ---
  for (const [z0, z1] of [[N, N + PAR], [S - PAR, S]]) {
    for (let k = 1; k <= ROWS; k++) {                                           // nested brick boxes; the raked band hides their stepped tops
      const xw = xT - k * td, y = yF + k * rise;
      S3(v, 'brickRed', W, xw + td, 0, y - 0.3, z0, z1, 'DUEW'); S3(c, 'generic', xw, xw + td, 0, y + 0.9, z0, z1, 'D');
    }
    S3(v, 'brickRed', W, E, 0, yF - 0.3, z0, z1, 'DUEW'); S3(c, 'generic', xT, E, 0, yF + 0.9, z0, z1, 'D');
    S3(v, white(), xT, E + 0.05, yF - 0.4, yF + 0.9, z0 - 0.03, z1 + 0.03, 'W');
    prismZ(v, white(), [[xT, yF - 0.4], [xT, yF + 0.9], [W, H + 0.9], [W, H - 0.4]], z0 - 0.03, z1 + 0.03, [2]);
  }

  ctx.add(v.build({ name: item.id + '-visual' }));
  const cg = ctx.add(c.build({ name: item.id + '-colliders' })); cg.visible = false;
  cg.traverse(m => { if (m.isMesh) ctx.collide(m); });
}
