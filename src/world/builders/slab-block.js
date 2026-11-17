// Long six-storey blocks south-east of the gymnasium (items dorm-*-slab). Their use is NOT established. Exterior only.
//
// SEEN in the 2018 footage (frames 6-9: north face of block A north across the garden; frames 29-30 and 49-51: sister
// blocks of the same design seen from the courts and the field):
//   - a deep white fascia band along the top, about one storey tall, carrying widely spaced red characters;
//   - under it, sections of red brick piers (two small windows per floor) alternating with recessed bays that have a
//     pale balcony front, a white post and a dark back wall;
//   - narrow white pier bays with one short horizontal slot per floor between the sections, a dark glazed section
//     in the middle, white end bays, and white end walls with short horizontal slot windows;
//   - block A north only: its east end (about 24 m) is tall glazing behind six slender full-height white columns
//     under a thin white roof slab (bright ribbed strip in the satellite image);
//   - lettering: only the four characters 面向世界 are legible (frame 9); they sit over the junction of the dark
//     glazed section and the white pier west of it. The other characters on that fascia are NOT reproduced.
// From the satellite image: outlines, the long axis (block B south is turned about 10 degrees), a beige flat roof,
// rooftop plant on the half away from the courtyard (one light-blue item and white ribbed blocks per block).
//
// ASSUMED (not seen in any reference; kept plain):
//   - six storeys of 3.0 m plus a 2.8 m fascia, fitted to the estimated overall height;
//   - section lengths (22 m brick sections, 11.5 m glazed section, 3.75 m piers, 5 m end bays) are proportions read
//     off frame 7, not measurements, and are stretched to each block's length;
//   - that the three blocks not seen in the video repeat block A north's street face (without the colonnade or text);
//   - the courtyard-facing side of every block: open access galleries with white slab edges and balustrades in front
//     of a white wall with doors and windows (the satellite image only shows floor lines in shade there);
//   - everything at ground level, which trees hide in all frames; window and door sizes; heights of rooftop plant;
//   - the corner notches at the south-east of blocks A north and B north are not modelled (plain rectangles).
import { THREE } from '../../kit.js';
import { Batch } from '../../batch.js';

const FLOORS = 6, FASCIA = 2.8;
const FACE = 0.25;        // the walls stand this far inside the roof outline; the fascia projects to the outline
const RECESS = 1.3;       // depth of the balcony recesses on the street face
const GALLERY = 1.7;      // depth of the access galleries on the courtyard face
const END = 5.0, PIER = 3.75, RED = 22, GLAZED = 11.5, PORCH = 1.8;

// Per-block particulars. Rooftop positions are metres from the west end of the roof, read off the satellite image.
const SPECIAL = {
  'dorm-a-north-slab': { colonnade: 24, slogan: '面向世界', blue: [45.3, 49.4], ribbed: [[49.6, 62.4], [64.2, 71.2]] },
  'dorm-a-south-slab': { blue: [42.3, 46.4], ribbed: [[51.1, 58.2], [64.8, 72.5]] },
  'dorm-b-north-slab': { blue: [39.3, 43.4], ribbed: [[57.1, 65.4]] },
  'dorm-b-south-slab': { blue: [59.4, 63.6], ribbed: [[44.9, 59.4]] },
};

const local = {};
function lm(name) {
  if (!local[name]) {
    local[name] = name === 'blue' ? new THREE.MeshStandardMaterial({ color: 0x8fc4e6, roughness: 0.6 })      // the light-blue rooftop item
      : new THREE.MeshStandardMaterial({ color: 0x2c3b40, roughness: 0.12, metalness: 0.35 });               // 'curtain': the dark glazed section
  }
  return local[name];
}

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
  return { ox: u0 * ux + w0 * wx, oz: u0 * uz + w0 * wz, angle: Math.atan2(-uz, ux), L: u1 - u0, D: w1 - w0, wx, wz };
}
const centroid = pts => [pts.reduce((s, p) => s + p[0], 0) / pts.length, pts.reduce((s, p) => s + p[1], 0) / pts.length];

/** Widely spaced red characters on a transparent canvas; returns a material for a quad `width` x `height` metres. */
function sloganMaterial(text, width, height, pitch, size) {
  const S = 160, c = document.createElement('canvas'); c.width = Math.round(width * S); c.height = Math.round(height * S);
  const g = c.getContext('2d');
  g.font = `bold ${Math.round(size * S)}px "PingFang SC","Microsoft YaHei","Heiti SC","SimHei","Noto Sans CJK SC","Source Han Sans SC","WenQuanYi Zen Hei",sans-serif`;
  g.fillStyle = g.strokeStyle = '#c0261e'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.lineWidth = size * S * 0.035; g.lineJoin = 'round';     // a stroke on top of the fill: heavy strokes whatever font the system has
  const chars = [...text], x0 = (width - pitch * (chars.length - 1)) / 2;
  chars.forEach((ch, i) => { const cx = (x0 + i * pitch) * S, cy = c.height / 2 + size * S * 0.04; g.fillText(ch, cx, cy); g.strokeText(ch, cx, cy); });
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  t.repeat.set(1 / width, 1 / height);                       // Batch.quad gives texture coordinates in metres
  return new THREE.MeshStandardMaterial({ map: t, transparent: true, alphaTest: 0.08, roughness: 0.7 });
}

export function build(item, ctx) {
  const f = frameOf(item.points), { L, D } = f, H = item.height, FH = (H - FASCIA) / FLOORS, yF = FLOORS * FH;
  const sp = SPECIAL[item.id] || {};

  // The courtyard side is the one facing the nearest other block of this kind; the street face is the opposite one.
  let streetNorth = true, nearest = Infinity;
  const me = centroid(item.points);
  for (const o of (ctx.campus ? ctx.campus.items : [])) {
    if (o === item || o.style !== item.style || !o.points) continue;
    const p = centroid(o.points), dist = Math.hypot(p[0] - me[0], p[1] - me[1]);
    if (dist < nearest) { nearest = dist; streetNorth = (p[0] - f.ox) * f.wx + (p[1] - f.oz) * f.wz > D / 2; }
  }

  const v = new Batch().frame(f.ox, f.oz, f.angle), c = new Batch().frame(f.ox, f.oz, f.angle);
  // Boxes are given as x0..x1 along the block (west to east), d0..d1 = depth behind the street face, y0..y1.
  const zAt = d => (streetNorth ? d : D - d);
  const put = (m, x0, x1, d0, d1, y0, y1) => v.slab(m, x0, y0, streetNorth ? d0 : D - d1, x1 - x0, y1 - y0, d1 - d0);
  const solid = (x0, x1, d0, d1, y0, y1) => c.slab('generic', x0, y0, streetNorth ? d0 : D - d1, x1 - x0, y1 - y0, d1 - d0);

  const col = sp.colonnade || 0, xa = FACE + 0.3, xb = L - FACE - 0.3;   // inside faces of the two end walls
  const back = FACE + RECESS, court = D - FACE - GALLERY;                 // street-side and courtyard-side faces of the core
  const yCol = H - 0.75;                                                  // underside of the colonnade roof slab

  // ---- core, end walls, roof deck, fascia ----
  put('wallWhite', xa, col ? L - col : xb, back, court, 0, yF);
  put('wallWhite', FACE, xa, FACE, D - FACE, 0, yF);
  put('wallWhite', xb, L - FACE, FACE, D - FACE, 0, yF);
  put('paving', 0.3, L - 0.3, 0.3, D - 0.3, yF, yF + 0.3);
  put('wallWhite', 0, col ? L - col : L, 0, 0.3, yF, H);
  put('wallWhite', 0, L, D - 0.3, D, yF, H);
  put('wallWhite', 0, 0.3, 0.3, D - 0.3, yF, H);
  put('wallWhite', L - 0.3, L, col ? 6.0 : 0.3, D - 0.3, yF, H);
  for (let k = 0; k < FLOORS; k++) for (const dm of [D * 0.33, D * 0.67]) {         // slot windows on both end walls
    put('glassDark', FACE - 0.03, FACE, dm - 0.7, dm + 0.7, k * FH + 1.75, k * FH + 2.2);
    put('glassDark', L - FACE, L - FACE + 0.03, dm - 0.7, dm + 0.7, k * FH + 1.75, k * FH + 2.2);
  }

  // ---- street face: sequence of sections from west to east ----
  const xSeqEnd = col ? L - col : L - FACE;
  const s = (xSeqEnd - xa - (END - xa) - (col ? PIER : END - FACE) - 2 * PIER) / (2 * RED + GLAZED);   // stretch of the long sections
  const seq = [['white', END - xa], ['red', RED * s], ['white', PIER], ['glazed', GLAZED * s], ['white', PIER], ['red', RED * s], ['white', col ? PIER : END - FACE - 0.3]];
  let x = xa, xGlazedWest = L / 2;
  for (const [kind, len] of seq) {
    const x0 = x, x1 = x + len; x = x1;
    if (kind === 'white') {
      put('wallWhite', x0, x1, FACE, back, 0, yF);
      const xm = (x0 + x1) / 2;
      for (let k = 0; k < FLOORS; k++) put('glassDark', xm - 0.65, xm + 0.65, FACE - 0.03, FACE, k * FH + 1.75, k * FH + 2.15);
    } else if (kind === 'red') {
      const n = 2 * Math.round((len / 3.14 - 1) / 2) + 1, w = len / n;                 // odd count: recess, pier, ..., recess
      for (let i = 0; i < n; i++) {
        const a = x0 + i * w, b = a + w, m = (a + b) / 2;
        if (i % 2) {                                                                   // brick pier with two small windows per floor
          put('brickRed', a, b, FACE, back, 0, yF);
          for (let k = 0; k < FLOORS; k++) for (const t of [0.3, 0.7]) {
            const xw = a + t * w, y = k * FH;
            put('metalWhite', xw - 0.36, xw + 0.36, FACE - 0.02, FACE, y + 1.05, y + 2.25);
            put('glassDark', xw - 0.27, xw + 0.27, FACE - 0.04, FACE - 0.02, y + 1.15, y + 2.15);
          }
        } else {                                                                       // recessed balcony bay
          put('wallMaroon', a, b, back - 0.06, back, 0, yF);
          for (let k = 0; k < FLOORS; k++) {
            const y = k * FH;
            if (k) put('wallWhite', a, b, FACE, back - 0.06, y - 0.12, y);
            put('metalWhite', a, b, FACE, FACE + 0.08, y, y + 1.0);
            put('metalWhite', m - 0.06, m + 0.06, FACE, FACE + 0.1, y + 1.0, y + FH - 0.12);
            put('glassDark', a + 0.35, b - 0.35, back - 0.1, back - 0.06, y + 0.05, y + 2.25);
            put('metalWhite', a + 0.3, b - 0.3, back - 0.11, back - 0.06, y + 2.25, y + 2.33);
          }
        }
      }
    } else {                                                                           // dark glazed section, slightly recessed
      xGlazedWest = x0;
      put(lm('curtain'), x0, x1, FACE + 0.5, FACE + 0.56, 0, yF);
      const n = Math.max(2, Math.round(len / 2.9));
      for (let i = 1; i < n; i++) put('metalWhite', x0 + i * len / n - 0.05, x0 + i * len / n + 0.05, FACE + 0.42, FACE + 0.5, 0, yF);
      for (let k = 1; k < FLOORS; k++) put('wallWhite', x0, x1, FACE + 0.3, FACE + 0.5, k * FH - 0.3, k * FH);
    }
  }

  // ---- block A north: tall glazing behind six slender columns at the east end ----
  if (col) {
    const x0 = L - col, gd = FACE + PORCH;
    put('glassTeal', x0, xb, gd, gd + 0.06, 0, yCol);
    for (let k = 1; k <= FLOORS; k++) put('wallWhite', x0, xb, gd - 0.1, gd, k * FH - 0.35, k * FH);
    const n = Math.round((xb - x0) / 2);
    for (let i = 1; i < n; i++) put('metalWhite', x0 + i * (xb - x0) / n - 0.04, x0 + i * (xb - x0) / n + 0.04, gd - 0.06, gd, 0, yCol);
    put('wallWhite', x0, xb, gd + 0.06, court, 0, yF);                             // core behind the glass
    put('wallWhite', x0, xb, gd + 0.06, gd + 0.4, yF, yCol);                       // upstand behind the top of the glass
    for (let i = 0; i < 6; i++) {
      const cx = x0 + col / 12 + i * col / 6;
      v.cyl('wallWhite', cx, 0, zAt(FACE + 0.45), 0.3, yCol, 16, false);
      solid(cx - 0.3, cx + 0.3, FACE + 0.15, FACE + 0.75, 0, yCol);
    }
    put('wallWhite', xb, L - FACE, FACE, 6.0, yF, yCol);                           // east end wall up to the slab
    put('wallWhite', x0, L, 0, 6.0, yCol, yCol + 0.6);                             // thin roof slab over the columns
    for (let xr = x0 + 0.5; xr < L - 0.8; xr += 1.2) put('metalWhite', xr, xr + 0.5, 0.3, 5.7, yCol + 0.6, H);   // ribbed strip seen from above
  }

  // ---- courtyard face: access galleries (assumed) ----
  for (let k = 1; k < FLOORS; k++) {
    put('wallWhite', xa, xb, court, D - FACE, k * FH - 0.15, k * FH);
    put('wallWhite', xa, xb, D - FACE - 0.12, D - FACE, k * FH, k * FH + 1.05);
  }
  const nCol = Math.max(2, Math.round((xb - xa) / 7.2));
  for (let j = 0; j <= nCol; j++) {
    const cx = xa + j * (xb - xa - 0.35) / nCol;
    put('wallWhite', cx, cx + 0.35, D - FACE - 0.38, D - FACE + 0.03, 0, yF);
    solid(cx, cx + 0.35, D - FACE - 0.38, D - FACE + 0.03, 0, yF);
  }
  const nBay = Math.max(1, Math.round((xb - xa) / 3.6)), bay = (xb - xa) / nBay;
  for (let j = 0; j < nBay; j++) for (let k = 0; k < FLOORS; k++) {
    const a = xa + j * bay, y = k * FH;
    put('woodDark', a + 0.5, a + 1.4, court, court + 0.04, y, y + 2.1);
    put('glassDark', a + 1.9, a + bay - 0.5, court, court + 0.04, y + 1.0, y + 2.1);
  }

  // ---- rooftop plant on the street half of the roof (positions from the satellite image, heights assumed) ----
  const deck = yF + 0.3;
  if (sp.blue) put(lm('blue'), sp.blue[0], sp.blue[1], 1.2, 5.2, deck, deck + 1.6);
  for (const [a, b] of sp.ribbed || []) {
    put('metalWhite', a, b, 1.2, 5.6, deck, deck + 1.0);
    for (let xr = a + 0.2; xr < b - 0.3; xr += 0.8) put('roofPale', xr, xr + 0.3, 1.2, 5.6, deck + 1.0, deck + 1.12);
  }

  // ---- the legible part of the fascia lettering ----
  if (sp.slogan && typeof document !== 'undefined') {
    const pitch = 3.1, size = 1.4, w = pitch * (sp.slogan.length - 1) + size + 0.4, h = size + 0.3;
    const y0 = yF + (FASCIA - h) / 2, z = zAt(-0.03), dir = streetNorth ? 1 : -1;   // the reader's left is east when the face looks north
    const xl = xGlazedWest + dir * w / 2, xr = xGlazedWest - dir * w / 2;
    v.quad(sloganMaterial(sp.slogan, w, h, pitch, size), [xl, y0, z], [xr, y0, z], [xr, y0 + h, z], [xl, y0 + h, z]);
  }

  ctx.add(v.build({ name: item.id + '-visual' }));

  // ---- collision: the mass of the block; the ground-level gallery and the colonnade porch stay open ----
  solid(FACE, col ? L - col : L - FACE, FACE, court, 0, H);
  if (col) { solid(L - col, L - FACE, FACE + PORCH, court, 0, H); solid(xb, L - FACE, FACE, FACE + PORCH, 0, H); }
  solid(FACE, xa, court, D - FACE, 0, H);
  solid(xb, L - FACE, court, D - FACE, 0, H);
  const cg = ctx.add(c.build({ name: item.id + '-colliders' })); cg.visible = false;
  cg.traverse(o => { if (o.isMesh) ctx.collide(o); });
}
