// West grandstand building (item grandstand-roof: the measured outline is the main block's roof). Exterior only.
//
// Seen in the references:
// - 2018 drone video frames 12-14, 31-35, 38-41, 46-48, 61-63 and 2022 sports-day video frames 2, 9, 42-43 (plus stills
//   at 0:03 and 1:43-1:46): brick-red main block; wide white full-height pilasters with a tall narrow teal window on
//   each side and a small white railing at the window sill; a continuous clerestory band with white mullions; a thin
//   flat pale roof with a deep eave and slightly bowed ends (satellite image); a ribbon of white-framed glazing at the
//   level of the top seating tier.
//   Pilasters: frame 48 shows 9 white verticals. Their spacing there (and in frame 63) is regular for the first eight,
//   the ninth is the north corner pier after a shorter bay (about 0.7 of a bay), and that is what is built.
// - South wing: lower brick wall set back a little, one pair of smaller windows per bay, thin white columns in the
//   rhythm of the main bays carrying an open white pergola at the height of the clerestory sill, a white balcony in the
//   second bay with a white stair down to the terrace, and at the south end a round stair tower: brick below, a glazed
//   drum with white ribs above, flat overhanging disc roof. The 2018 frame 48 crops the wing after three columns; frame
//   39 and the 2022 still at 0:03 show the row continuing to the tower, five columns in all.
// - North end: lower white flat-roofed portal with glazing facing the track and a white screen wall at its north end.
//
// ASSUMED (hidden, unclear or not measurable in any reference):
// - Eave depth (2.0 m all round) and therefore the wall positions inside the measured roof outline.
// - All vertical sizes. The data height (15 m) is used as given and the facade is divided in the proportions seen in
//   frames 41 and 48; only the ribbon glazing is kept at door height. Judged by door and people sizes in frames 41/48
//   the real building looks nearer 21 m, so the model is probably squatter than the original.
// - West face and both end walls of the main block (pilasters and clerestory repeated, no windows); the 2022 still at
//   1:43 only shows that the south end wall above the wing also has white pilasters.
// - Plan of the south wing behind its east wall (a wedge whose west edge runs diagonally to the tower, read off the
//   satellite image under trees), its roof, the tower's exact position and radius, the slit windows in its brick part.
// - The balcony stair is a single straight flight (the footage shows a white zigzag stringer, probably two flights).
// - Plan and details of the north portal; its columns; the screen wall height.
// - The terrace behind the top tier (width set by the eave), its paving and its end parapets.
// - No interior: the glazing is opaque and the block is solid for collision. The tower and doors cannot be entered.
// Collision: the block, wing, tower and portal as simple solids; the terrace, balcony and its stair are walkable.
import { THREE, mat, bbox, prism } from '../../kit.js';
import { Batch } from '../../batch.js';

const EAVE = 2.0;               // roof overhang beyond the walls
const PW = 1.45, PD = 0.35;     // pilaster width and projection
const WIN = 1.15;               // tall window width
const BOW = 1.2;                // how far the middle of each end eave bows out beyond its corners
const RISER = 0.16, TREAD = 0.28;

const local = {};
function lm(name) {
  if (!local[name]) {
    local[name] = name === 'teal' ? new THREE.MeshStandardMaterial({ color: 0x2f9f8a, roughness: 0.12, metalness: 0.3 })      // window glass as it reads in the footage
      : name === 'pale' ? new THREE.MeshStandardMaterial({ color: 0xb9c7c9, roughness: 0.25, metalness: 0 })                  // clerestory glass (reads pale grey in the footage)
      : name === 'ribbon' ? new THREE.MeshStandardMaterial({ color: 0x567274, roughness: 0.15, metalness: 0.2 })              // glazing at terrace level
      : new THREE.MeshStandardMaterial({ color: 0xf1efe8, roughness: 0.8 });                                                 // untextured white
  }
  return local[name];
}

// Solid with 8 corners: P[0..3] one end face in ring order, P[4..7] the matching corners of the other end. Faces are wound outward.
function hexa(b, m, P) {
  const cen = [0, 1, 2].map(i => P.reduce((s, p) => s + p[i], 0) / 8);
  for (const f of [[0, 1, 2, 3], [4, 5, 6, 7], [0, 1, 5, 4], [1, 2, 6, 5], [2, 3, 7, 6], [3, 0, 4, 7]]) {
    const [A, B, C, D] = f.map(i => P[i]);
    const u = [0, 1, 2].map(i => B[i] - A[i]), w = [0, 1, 2].map(i => D[i] - A[i]);
    const n = [u[1] * w[2] - u[2] * w[1], u[2] * w[0] - u[0] * w[2], u[0] * w[1] - u[1] * w[0]];
    const out = [0, 1, 2].map(i => (A[i] + B[i] + C[i] + D[i]) / 4 - cen[i]);
    if (n[0] * out[0] + n[1] * out[1] + n[2] * out[2] >= 0) b.quad(m, A, B, C, D); else b.quad(m, A, D, C, B);
  }
}
// Prism from x0 to x1 with cross-section q = [[z, y] x 4].
const prismX = (b, m, q, x0, x1) => hexa(b, m, [...q.map(([z, y]) => [x0, y, z]), ...q.map(([z, y]) => [x1, y, z])]);
const S3 = (b, m, x0, x1, y0, y1, z0, z1, skip) => b.slab(m, Math.min(x0, x1), y0, Math.min(z0, z1), Math.abs(x1 - x0), y1 - y0, Math.abs(z1 - z0), skip);

// Everything below draws on a wall plane at local x = 0 that faces local +x and runs along local z (see Batch.frame).
function tallWindow(v, zc, y0, y1) {
  const h = y1 - y0, low = 0.95;                                                // low: the two bottom sashes
  v.box(lm('teal'), 0.03, (y0 + y1) / 2, zc, 0.06, h, WIN, 'W');
  for (const s of [-1, 1]) v.box('metalWhite', 0.06, (y0 + y1) / 2, zc + s * (WIN / 2 - 0.03), 0.1, h, 0.06, 'W');
  for (const y of [y0 + 0.03, y1 - 0.03, y0 + low, y0 + low + (h - low) / 3, y0 + low + 2 * (h - low) / 3]) v.box('metalWhite', 0.06, y, zc, 0.1, 0.06, WIN, 'W');
  v.box('metalWhite', 0.06, y0 + low / 2, zc, 0.1, low, 0.05, 'W');
  // small white railing on a sill ledge
  v.box('metalWhite', 0.2, y0 - 0.05, zc, 0.4, 0.1, WIN + 0.16, 'W');
  for (const y of [y0 + 0.3, y0 + 0.6]) {
    v.box('metalWhite', 0.38, y, zc, 0.04, 0.04, WIN + 0.16);
    for (const s of [-1, 1]) v.box('metalWhite', 0.2, y, zc + s * (WIN / 2 + 0.06), 0.36, 0.04, 0.04);
  }
  for (const s of [-1, 0, 1]) v.box('metalWhite', 0.38, y0 + 0.3, zc + s * (WIN / 2 + 0.06), 0.04, 0.6, 0.04);
}
function smallWindow(v, zc, w, y0, y1) {
  v.box('glassTeal', 0.03, (y0 + y1) / 2, zc, 0.06, y1 - y0, w, 'W');
  for (const s of [-1, 1]) v.box('metalWhite', 0.06, (y0 + y1) / 2, zc + s * (w / 2 - 0.03), 0.1, y1 - y0, 0.06, 'W');
  for (const y of [y0 + 0.03, y1 - 0.03, y0 + (y1 - y0) * 0.36]) v.box('metalWhite', 0.06, y, zc, 0.1, 0.06, w, 'W');
}
// Ribbon of white-framed glazing from y0 to y1 between z0 and z1.
function ribbon(v, z0, z1, y0, y1, step = 1.23) {
  if (z1 - z0 < 0.5) return;
  v.box(lm('ribbon'), 0.025, (y0 + y1) / 2, (z0 + z1) / 2, 0.05, y1 - y0, z1 - z0, 'W');
  v.box('metalWhite', 0.05, y0 + 0.06, (z0 + z1) / 2, 0.1, 0.12, z1 - z0, 'W').box('metalWhite', 0.05, y1 - 0.45, (z0 + z1) / 2, 0.1, 0.06, z1 - z0, 'W');
  const n = Math.max(1, Math.round((z1 - z0) / step));
  for (let i = 0; i <= n; i++) v.box('metalWhite', 0.06, (y0 + y1) / 2, z0 + (z1 - z0) * i / n, 0.12, y1 - y0, 0.09, 'W');
}
// Clerestory: sill band, pale glass, mullions; posts over the pilasters.
function clerestory(v, len, pil, L) {
  v.box('wallWhite', 0.1, (L.yCl0 + L.yCl1) / 2, len / 2, 0.2, L.yCl1 - L.yCl0, len, 'W');
  v.box(lm('pale'), 0.03, (L.yCl1 + L.ySof) / 2, len / 2, 0.06, L.ySof - L.yCl1, len, 'W');
  v.box('metalWhite', 0.06, L.ySof - 0.06, len / 2, 0.1, 0.12, len, 'W');
  for (const z of pil) v.box('wallWhite', 0.125, (L.yCl1 + L.ySof) / 2, z, 0.25, L.ySof - L.yCl1, 0.5, 'W');
  const all = [0, ...[...pil].sort((p, q) => p - q), len];
  for (let i = 0; i + 1 < all.length; i++) {
    const n = Math.max(1, Math.round((all[i + 1] - all[i]) / 2.46));
    for (let j = 1; j < n; j++) v.box('metalWhite', 0.06, (L.yCl1 + L.ySof) / 2, all[i] + (all[i + 1] - all[i]) * j / n, 0.1, L.ySof - L.yCl1, 0.1, 'W');
  }
}

export function build(item, ctx) {
  const r = bbox(item.points), H = item.height;
  const seat = ctx.campus.items.find(i => i.id === 'grandstand-seating'), sb = seat ? bbox(seat.points) : null;
  const yT = seat ? seat.height : Math.round(H / 3);                            // terrace level = top seating tier
  const xS = sb ? sb.w : r.e + 0.3, zTn = sb ? sb.n : r.n - 6, zTs = sb ? sb.s : r.s + 40.4;   // back edge and ends of the seating strip
  const xE = r.e - EAVE, xW = r.w + EAVE, zN = r.n + EAVE, zS = r.s - EAVE;     // main walls
  const L = { yT, yRib: yT + 2.0, yBand: yT + 2.3, yCl0: H - 2.3, yCl1: H - 2.05, ySof: H - 0.55 };
  const v = new Batch(), c = new Batch();
  const both = (m, ...a) => { S3(v, m, ...a); S3(c, 'generic', ...a); };
  const world = () => v.frame(0, 0, 0);

  // ---------------- main block ----------------
  both('brickRed', xW, xE, 0, L.ySof, zN, zS, 'DU');
  const lenE = zS - zN, lenN = xE - xW;
  const bay = (lenE - PW / 2 - 0.4) / 7.72;                                     // eight regular pilasters, then a 0.72 bay to the corner pier
  const pilE = Array.from({ length: 8 }, (_, i) => lenE - PW / 2 - i * bay);    // local z measured from the north end
  const yW0 = L.yBand + 0.25 * (L.yCl0 - L.yBand), yW1 = L.yCl0 - 0.2;          // tall windows
  // east face
  v.frame(xE, zN, 0);
  ribbon(v, 0, lenE, yT, L.yRib);
  v.box('wallWhite', PD / 2, (L.yRib + L.yBand) / 2, lenE / 2, PD, L.yBand - L.yRib, lenE, 'W');
  for (const z of pilE) {
    v.box('wallWhite', PD / 2, (L.yBand + L.yCl0) / 2, z, PD, L.yCl0 - L.yBand, PW, 'WUD');
    v.box('wallWhite', 0.1, (yT + L.yRib) / 2, z, 0.2, L.yRib - yT, 0.5, 'WUD');
    for (const s of [-1, 1]) { const zc = z + s * (PW / 2 + 0.08 + WIN / 2); if (zc + WIN / 2 < lenE - 0.05 && zc - WIN / 2 > 0.9) tallWindow(v, zc, yW0, yW1); }
  }
  v.box('wallWhite', PD / 2, (L.yBand + L.yCl0) / 2, 0.4, PD, L.yCl0 - L.yBand, 0.8, 'WUD');
  clerestory(v, lenE, [0.25, ...pilE], L);
  // west face (assumed), then the two end walls
  const plain = (len, pil) => { for (const z of pil) v.box('wallWhite', PD / 2, L.yCl0 / 2, z, PD, L.yCl0, PW, 'WUD'); clerestory(v, len, pil, L); };
  v.frame(xW, zS, Math.PI); plain(lenE, Array.from({ length: 9 }, (_, i) => PW / 2 + i * (lenE - PW) / 8));
  const pilN = Array.from({ length: 5 }, (_, i) => PW / 2 + i * (lenN - PW) / 4);
  v.frame(xW, zN, Math.PI / 2); plain(lenN, pilN);
  v.frame(xE, zS, -Math.PI / 2); plain(lenN, pilN);
  world();

  // roof: thin white slab with bowed ends over a thicker inset layer, pale sheet on top
  const ring = [], n = 12, bow = i => BOW * (1 - (2 * i / n - 1) ** 2);
  for (let i = 0; i <= n; i++) ring.push([r.w + r.sx * i / n, r.n + BOW - bow(i)]);
  for (let i = n; i >= 0; i--) ring.push([r.w + r.sx * i / n, r.s - BOW + bow(i)]);
  ctx.add(prism(ring, H - 0.3, H - 0.04, lm('white')));
  ctx.add(prism(ring.map(([x, z]) => [r.cx + (x - r.cx) * (1 - 0.7 / (r.sx / 2)), r.cz + (z - r.cz) * (1 - 0.7 / (r.sz / 2))]), H - 0.04, H, mat('roofPale')));
  S3(v, lm('white'), r.w + 0.9, r.e - 0.9, L.ySof, H - 0.3, r.n + BOW + 0.3, r.s - BOW - 0.3, 'U');

  // ---------------- terrace behind the top tier (under the eave and the pergola) ----------------
  const xWg = xE - 1.2;                                                         // face of the south wing wall
  const zPn = zN - 8.9;                                                         // north end of the portal
  for (const [x0, z0, z1] of [[xE, zPn + 0.3, zN], [xE, zN, zS], [xWg, zS, zTs]]) {
    both('brickRed', x0, xS, 0, yT - 0.03, z0, z1, 'DU'); S3(v, 'concrete', x0, xS, yT - 0.03, yT, z0, z1, 'D'); S3(c, 'generic', x0, xS, yT - 0.03, yT, z0, z1, 'D');
  }

  // ---------------- south wing ----------------
  const yWing = yT + 0.66 * (H - yT), yPer = L.yCl1;                            // wall top; pergola top (level with the clerestory sill)
  const cz = zTs - 4.2, cx = xWg - 3.7, R = 3.9;                                // stair tower centre and radius
  const wing = [[xWg, zS], [xWg, cz - 0.6], [cx - 3.6, cz + 0.4], [xW + 2.0, zS]];
  ctx.collide(ctx.add(prism(wing, 0, yWing, mat('brickRed'))));
  ctx.add(prism(wing, yWing, yWing + 0.06, mat('roofGrey')));
  const lenW = cz - 1.3 - zS;                                                   // east wall up to where the tower takes over
  const zc0 = zS - PW / 2, cols = [];                                           // columns continue the main bay rhythm
  for (let k = 1; zc0 + k * bay < cz - 1; k++) cols.push(zc0 + k * bay);
  v.frame(xWg, zS, 0);
  ribbon(v, 0, lenW, yT, L.yRib);
  v.box('wallWhite', 0.075, (L.yRib + L.yBand) / 2, lenW / 2, 0.15, L.yBand - L.yRib, lenW, 'W');
  v.box('wallWhite', 0.05, yWing - 0.1, lenW / 2, 0.3, 0.26, lenW);                                                       // coping
  const yS0 = yT + 0.45 * (yWing - yT), yS1 = yT + 0.8 * (yWing - yT);
  for (const z of cols) for (const s of [-1, 1]) if (z - zS + s * 0.95 < lenW - 0.7) smallWindow(v, z - zS + s * 0.95, 1.0, yS0, yS1);
  smallWindow(v, 0.95 + PW / 2, 1.0, yS0, yS1);
  world();
  // columns and pergola
  const xc = xS - 0.5, zPe = (cols.length ? cols[cols.length - 1] : zS) + 0.4;
  for (const z of cols) { both('wallWhite', xc - 0.22, xc + 0.22, yT, yPer - 0.35, z - 0.22, z + 0.22, 'UD'); S3(v, 'wallWhite', xWg - 0.35, xWg - 0.05, yWing, yPer - 0.35, z - 0.15, z + 0.15, 'UD'); S3(v, lm('white'), xWg - 0.35, xc + 0.22, yPer - 0.35, yPer, z - 0.15, z + 0.15); }
  for (const x of [xc, xWg - 0.2]) S3(v, lm('white'), x - 0.15, x + 0.15, yPer - 0.35, yPer, zS, zPe);
  for (let z = zS + 0.6; z < zPe - 0.2; z += 0.9) S3(v, lm('white'), xWg - 0.05, xc - 0.15, yPer - 0.24, yPer, z - 0.06, z + 0.06);
  // balcony in the second bay, with a stair down to the terrace
  if (cols.length >= 2) {
    const nR = 15, yB = yT + nR * RISER, z0 = cols[0], z1 = cols[1], xb = xS - 0.3, sx1 = xS - 0.9, sx0 = sx1 - 1.4;
    both(lm('white'), xWg, xb, yB - 0.25, yB, z0, z1);
    const guard = (x0, x1, za, zb) => { both(lm('white'), x0, x1, yB, yB + 0.45, za, zb, 'D'); S3(c, 'generic', x0, x1, yB + 0.45, yB + 1.05, za, zb, 'D'); };
    guard(xb - 0.12, xb, z0, z1); guard(xWg, xb, z0, z0 + 0.12); guard(xWg, sx0, z1 - 0.12, z1); guard(sx1, xb, z1 - 0.12, z1);
    for (const [xa, xb2, za, zb] of [[xb - 0.06, xb - 0.06, z0, z1], [xWg, xb, z0 + 0.06, z0 + 0.06], [xWg, sx0, z1 - 0.06, z1 - 0.06]]) {   // steel rail on the guard
      S3(v, 'steel', xa - 0.025, xb2 + 0.025, yB + 1.0, yB + 1.05, za - 0.025, zb + 0.025);
      const len = Math.max(xb2 - xa, zb - za), m = Math.max(1, Math.round(len / 1.3));
      for (let i = 0; i <= m; i++) v.box('steel', xa + (xb2 - xa) * i / m, yB + 0.72, za + (zb - za) * i / m, 0.04, 0.56, 0.04, 'UD');
    }
    v.frame(xWg, zS, 0).box('metalWhite', 0.04, yB + 1.05, z0 - zS + 2.6, 0.08, 2.1, 1.0, 'W').box('glassDark', 0.09, yB + 1.45, z0 - zS + 2.6, 0.02, 0.9, 0.6, 'W'); world();   // door onto the balcony
    const line = d => yB - (d + TREAD / 2) * RISER / TREAD, far = (nR - 1) * TREAD + 0.25;
    for (let i = 1; i < nR; i++) S3(v, 'concrete', sx0, sx1, Math.max(yT, yT + i * RISER - 0.3), yT + i * RISER, z1 + (nR - 1 - i) * TREAD, z1 + (nR - i) * TREAD);
    prismX(c, 'generic', [[z1 - TREAD / 2, yB - 0.2], [z1 - TREAD / 2, yB], [z1 + (nR - 0.5) * TREAD, yT], [z1 + (nR - 0.5) * TREAD, yT - 0.2]], sx0, sx1);
    for (const [xa, xb2] of [[sx0 - 0.12, sx0], [sx1, sx1 + 0.12]]) {
      prismX(v, lm('white'), [[z1, line(0) - 0.3], [z1, line(0) + 0.53], [z1 + far, line(far) + 0.53], [z1 + far, line(far) - 0.3]], xa, xb2);
      prismX(c, 'generic', [[z1, line(0) - 0.3], [z1, line(0) + 1.05], [z1 + far, line(far) + 1.05], [z1 + far, line(far) - 0.3]], xa, xb2);
      prismX(v, 'steel', [[z1, line(0) + 0.98], [z1, line(0) + 1.03], [z1 + far, line(far) + 1.03], [z1 + far, line(far) + 0.98]], (xa + xb2) / 2 - 0.025, (xa + xb2) / 2 + 0.025);
      for (let t = 0.3; t < far; t += 1.1) v.box('steel', (xa + xb2) / 2, line(t) + 0.76, z1 + t, 0.04, 0.48, 0.04, 'UD');
    }
  }

  // ---------------- round stair tower at the south end ----------------
  const yTB = yT + 0.36 * (H - yT), yTT = H - 1.8;
  v.cyl('brickRed', cx, 0, cz, R, yTB, 36, false).cyl('wallWhite', cx, yTB, cz, R + 0.1, 0.3, 36).cyl(lm('teal'), cx, yTB + 0.3, cz, R - 0.12, yTT - yTB - 0.3, 36, false);
  v.cyl('metalWhite', cx, (yTB + 0.3 + yTT) / 2 - 0.06, cz, R - 0.06, 0.12, 36, false).cyl(lm('white'), cx, yTT, cz, R + 0.8, 0.4, 40);
  for (let i = 0; i < 16; i++) {
    const a = i / 16 * Math.PI * 2;
    v.frame(cx, cz, a).box('wallWhite', R - 0.02, (yTB + 0.3 + yTT) / 2, 0, 0.3, yTT - yTB - 0.3, 0.3, 'UD');
    if (i % 2 === 0 && Math.cos(a) > -0.3) for (const y of [yT + 0.5, yT + 0.5 + (yTB - yT) * 0.5]) v.box('glassTeal', R, y + 0.6, Math.sin(Math.PI / 16) * R, 0.06, 1.2, 0.5, 'W');   // slit windows (assumed)
  }
  world();
  c.cyl('generic', cx, 0, cz, R, yTT, 14);
  // parapets closing the south end of the terrace
  both('wallWhite', xWg, xS, yT, yT + 1.0, zTs - 0.2, zTs, 'D'); both('wallWhite', xWg - 0.2, xWg, yT - 0.5, yT + 1.0, cz + 0.5, zTs);

  // ---------------- north portal ----------------
  const yP = yT + 0.45 * (H - yT), xPw = xE - 6.5;
  both('wallWhite', xPw, xE, 0, yP - 0.3, zPn, zN, 'DU');                                                                   // core
  both('wallWhite', xE, xS, 0, yT + 2.8, zPn, zPn + 0.3, 'D');                                                              // screen wall at the north end
  S3(v, lm('white'), xPw - 1.0, xS + 1.0, yP - 0.3, yP, zPn - 1.2, zN);                                                     // flat roof
  for (const z of [zN - 4.45, zPn + 0.75]) both('wallWhite', xS - 0.75, xS - 0.35, yT, yP - 0.3, z - 0.2, z + 0.2, 'UD');
  v.frame(xE, zPn, 0);
  const g0 = 3.2, g1 = zN - zPn - 0.3;                                                                                      // glazed stretch of the east wall
  v.box(lm('teal'), 0.03, (yT + yP - 0.5) / 2, (g0 + g1) / 2, 0.06, yP - 0.5 - yT, g1 - g0, 'W');
  for (let i = 0, m = Math.round((g1 - g0) / 1.06); i <= m; i++) v.box('metalWhite', 0.06, (yT + yP - 0.5) / 2, g0 + (g1 - g0) * i / m, 0.1, yP - 0.5 - yT, 0.08, 'W');
  for (const y of [yT + 0.06, yT + 2.1, yT + 2.5, yP - 0.56]) v.box('metalWhite', 0.06, y, (g0 + g1) / 2, 0.1, 0.1, g1 - g0, 'W');
  world();

  ctx.add(v.build({ name: item.id + '-visual' }));
  const cg = ctx.add(c.build({ name: item.id + '-colliders' })); cg.visible = false;
  cg.traverse(m => { if (m.isMesh) ctx.collide(m); });
}
