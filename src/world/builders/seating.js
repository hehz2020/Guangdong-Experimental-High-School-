// West grandstand, open seating bank (item grandstand-seating): stepped concrete tiers of individual moulded seats facing
// east toward the track, in front of the stand building (grandstand.js builds the concourse behind the top tier).
// This file also holds what the two grandstand builders share: small geometry helpers, the surfaces drawn in code
// (ribbed sheet, grating), the reflecting glass, the lamp that follows the time of day, the sign plates, detail tiers.
//
// SEEN in the references:
// - 2018 drone video frames 12-14, 33, 34, 38-41, 46-48, 61-63: three seat blocks of equal length; white front parapet
//   with a railing on top; a base wall with doors under it; a rostrum projecting from the middle block with a white
//   stair along the front wall at each end of it; a slim open stair at the south end (frames 39, 47); raked white end
//   parapets; pale aisle stairs between the sub-blocks.
// - 2022 sports-day video frames 2, 6, 9, 42-43, 49-55 and stills at 0:12-0:15: the base wall is red brick with grey
//   doors and small high windows, the parapet band is cream-white with a steel railing, the stairs have white solid
//   balustrades with a steel handrail.
// - Satellite image: aisle positions along the bank (fractions in AISLES); seat colours blue, red, green from north to
//   south (the 2022 frames still show a red middle block and green between the tents on the south block).
//
// IMAGINED (the brief asks for a showpiece; none of this can be read off a reference):
// - Ten rows and every vertical size. The data height (5 m to the top tier) is used as given; the front walkway is at
//   0.48 of it. The real stand looks about 1.5 times taller, so the rake here is flatter than the original.
// - The seat itself (a moulded shell with a low back on a galvanised rail), its pitch, the painted seat numbers on the
//   treads and the row numbers beside the aisles (plain numbering, 1 upward).
// - Aisle half steps with yellow nosings, the handrails, the rail behind the top row, the drainage channel along the
//   front parapet with its spouts and downpipes, the paved strip and channel at the foot of the wall.
// - What is behind each door of the base wall. The doors carry generic room plates (toilets, equipment store, first
//   aid, changing rooms, switch room and so on); the real uses are not known. Count and positions of doors and windows.
// - A stair at the north end mirroring the one seen at the south end. The rostrum's desks, its lettering (主席台, the
//   ordinary word for a rostrum) and the three flag poles (without flags) in front of it.
// - The rostrum and its stairs project 2.0 m east of the measured outline (outside the strip that was measured).
// Collision: tier boxes, inclined plates on every aisle and stair, the walls. Every guard (front parapet, rostrum
// parapet, stair balustrades, end walls, the rail behind the top row) is one solid of its full thickness reaching
// 1.7 m above the floor beside it, flush with its outer face, so there is no ledge to jump onto. Seats and aisle
// handrails have no collision so that rows and aisles can be walked.
import { THREE, bbox } from '../../kit.js';
import { Batch } from '../../batch.js';
import { pbr, plain, SURFACES, rng } from '../../hifi.js';
import { textTexture } from '../../signs.js';
import { LIT } from '../../street.js';

export const ROWS = 10;         // seat rows
export const WALK = 1.6;        // front walkway between the parapet and the first riser
export const PAR = 0.25;        // thickness of parapets and end walls
export const RISER = 0.16, TREAD = 0.28;                                      // access stairs
export const PITCH = 0.5;       // seat spacing along a row
export const BARRIER = 1.7;     // height of a guard's collider above the floor beside it (a running jump clears 1.1 m)
const BLOCKS = [[0.330, 0x2a62c8], [0.662, 0xcc372b], [2, 0x1c9c68]];         // [south limit as a fraction of the length, seat colour], north to south
const AISLES = [0.065, 0.195, 0.330, 0.441, 0.552, 0.662, 0.805, 0.935];      // aisle centres as fractions of the length from the north end
const ROSTRUM = [0.396, 0.596], OUT = 2.0;                                    // rostrum extent (fractions), projection
const SANS = '"Noto Sans CJK SC","Source Han Sans SC","PingFang SC","Microsoft YaHei","WenQuanYi Zen Hei","Helvetica Neue",Arial,sans-serif';

/** The sizes both grandstand builders and the walk test derive from the item. */
export function layout(item) {
  const o = bbox(item.points), H = item.height, W = o.w, E = o.e, N = o.n, S = o.s, L = S - N;
  const nR = Math.max(6, Math.round(0.48 * H / RISER)), yF = nR * RISER;        // front walkway level = a whole number of stair risers
  const rise = (H - yF) / ROWS, xT = E - PAR - WALK, td = (xT - W) / ROWS;      // xT: foot of the first riser; td: tread depth of a row
  const zR0 = N + ROSTRUM[0] * L, zR1 = N + ROSTRUM[1] * L;
  return { W, E, N, S, L, H, nR, yF, rise, xT, td, zR0, zR1, xR: E + OUT, zm: (zR0 + zR1) / 2, run: (nR - 1) * TREAD };
}

// ---- geometry helpers -----------------------------------------------------------------------------------------------
/** Solid with 8 corners: P[0..3] one end face in ring order, P[4..7] the matching corners of the other end. Faces are wound outward. omit: face indices to leave out (0, 1 the ends; 2-5 the sides in ring order from edge 0-1). */
export function hexa(b, m, P, omit = []) {
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
/** Prism from z0 to z1 with cross-section q = [[x, y] x 4] / from x0 to x1 with cross-section q = [[z, y] x 4]. */
export const prismZ = (b, m, q, z0, z1, omit) => hexa(b, m, [...q.map(([x, y]) => [x, y, z0]), ...q.map(([x, y]) => [x, y, z1])], omit);
export const prismX = (b, m, q, x0, x1, omit) => hexa(b, m, [...q.map(([z, y]) => [x0, y, z]), ...q.map(([z, y]) => [x1, y, z])], omit);
/** Box between two corners, whichever way round they are given. */
export const S3 = (b, m, x0, x1, y0, y1, z0, z1, skip) => b.slab(m, Math.min(x0, x1), y0, Math.min(z0, z1), Math.abs(x1 - x0), y1 - y0, Math.abs(z1 - z0), skip);

/** A Batch that also takes quads with their own texture coordinates (signs, number strips). */
export class Batch2 extends Batch {
  /** a lower-left, b lower-right, c upper-right, d upper-left as seen from the front; the rectangle u0..u1, v0..v1 of the texture is mapped onto it. */
  uvq(material, a, b, c, d, u0 = 0, v0 = 0, u1 = 1, v1 = 1) {
    const p = this._part(material), base = p.pos.length / 3;
    const n = new THREE.Vector3().subVectors(new THREE.Vector3(...b), new THREE.Vector3(...a)).cross(new THREE.Vector3().subVectors(new THREE.Vector3(...d), new THREE.Vector3(...a))).normalize();
    [[a, u0, v0], [b, u1, v0], [c, u1, v1], [d, u0, v1]].forEach(([q, u, w]) => this._vert(p, q[0], q[1], q[2], n.x, n.y, n.z, u, w));
    p.idx.push(base, base + 1, base + 2, base, base + 2, base + 3); return this;
  }
  /** Bar between two points in world coordinates; the frame is put back to the world frame afterwards. */
  bar(material, a, b, t = 0.05) { this.strut(material, a, b, t); return this.frame(0, 0, 0); }
}
/** Many copies of one geometry: matrices is a list of THREE.Matrix4. */
export function instanced(geometry, material, matrices, name) {
  const im = new THREE.InstancedMesh(geometry, material, matrices.length); matrices.forEach((m, i) => im.setMatrixAt(i, m));
  im.instanceMatrix.needsUpdate = true; im.castShadow = im.receiveShadow = true; im.name = name; im.computeBoundingBox(); im.computeBoundingSphere(); return im;
}
/**
 * Small things that are only drawn near the viewer, in tiers along z: at(z) gives the batch of the tier that z falls in,
 * finish() adds them. On phones (ctx.lowPower) nothing is kept.
 */
export function tiers(ctx, x, z0, z1, range, name, size = 30) {
  const n = Math.max(1, Math.round((z1 - z0) / size)), list = Array.from({ length: n }, () => new Batch2());
  return {
    at: z => list[Math.max(0, Math.min(n - 1, Math.floor((z - z0) / (z1 - z0) * n)))],
    finish() {
      if (ctx.lowPower) return;
      list.forEach((b, i) => { const g = b.build({ name: `${name}-fine-${i}`, castShadow: false }); if (g.children.length) ctx.detail(ctx.add(g), x, z0 + (i + 0.5) * (z1 - z0) / n, range); });
    },
  };
}

// ---- surfaces drawn in code -------------------------------------------------------------------------------------------
const made = new Map();
/**
 * A small tileable surface: hgt(u, v) -> 0..1 over one repeat (v runs down the canvas), col(h, u, v) -> [r, g, b] bytes.
 * tile: metres covered by one repeat [along u, along v].
 */
export function surf(name, W, H, tile, hgt, col, { strength = 2, roughness = 0.6, metalness = 0, over = {} } = {}) {
  if (made.has(name)) return made.get(name);
  const h = new Float32Array(W * H); for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) h[y * W + x] = hgt(x / W, y / H);
  const mk = (fill, srgb) => {
    const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d'), im = g.createImageData(W, H); fill(im.data); g.putImageData(im, 0, 0);
    const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(1 / tile[0], 1 / tile[1]); t.anisotropy = 8; if (srgb) t.colorSpace = THREE.SRGBColorSpace; return t;
  };
  const map = mk(d => { for (let i = 0; i < W * H; i++) { const q = col(h[i], (i % W) / W, Math.floor(i / W) / H); d[i * 4] = q[0]; d[i * 4 + 1] = q[1]; d[i * 4 + 2] = q[2]; d[i * 4 + 3] = 255; } }, true);
  const normalMap = mk(d => { for (let y = 0, i = 0; y < H; y++) for (let x = 0; x < W; x++, i++) {
    let nx = (h[y * W + (x + W - 1) % W] - h[y * W + (x + 1) % W]) * strength, ny = (h[((y + 1) % H) * W + x] - h[((y + H - 1) % H) * W + x]) * strength; const l = 1 / Math.hypot(nx, ny, 1);
    d[i * 4] = (nx * l * 0.5 + 0.5) * 255; d[i * 4 + 1] = (ny * l * 0.5 + 0.5) * 255; d[i * 4 + 2] = (l * 0.5 + 0.5) * 255; d[i * 4 + 3] = 255;
  } }, false);
  const m = new THREE.MeshStandardMaterial({ map, normalMap, roughness, metalness, ...over }); m.name = name; made.set(name, m); return m;
}
const rib = t => { const q = Math.abs((t % 1) - 0.5) * 2; return 1 - Math.min(1, Math.max(0, (q - 0.1) / 0.14)); };   // a narrow raised rib in the middle of each repeat
const shade = (hex, k) => [(hex >> 16 & 255) * k, (hex >> 8 & 255) * k, (hex & 255) * k];

/** Shared materials of the stand. Names avoid the words the lighting module takes for window glass. */
export const M = {
  steel: () => pbr('steel'),                                                  // brushed stainless: railings
  galv: () => plain('galvanised', 0x9aa1a5, 0.5, 0.75),                       // seat rails, purlins, gratings' frames
  beam: () => plain('steelpaint', 0xe9ebea, 0.42, 0.25),                      // painted structural steel
  white: () => plain('standwhite', 0xf1efe8, 0.8, 0),                         // untextured white for raked parts (a tiled texture would shear on them)
  paint: () => plain('nosing-white', 0xe6e3d8, 0.7, 0),
  yellow: () => plain('nosing-yellow', 0xe0b12a, 0.68, 0),
  dark: () => plain('darkmetal', 0x2b2d30, 0.5, 0.6),
  frame: () => plain('aluframe', 0xeef0ee, 0.4, 0.5),                         // powder-coated aluminium frames
  door: () => plain('doorpaint', 0x587585, 0.48, 0.25),
  pipe: () => plain('pvcpipe', 0xe9e7df, 0.5, 0),
  gold: () => plain('goldtrim', 0xd8a93a, 0.35, 0.9),
  deck: () => pbr('paving', [0xc2bdb2, 0xaea99e, 3, 3, [1.8, 1.8], 29, false]),   // 0.6 m pavers: walkway, rostrum, concourse
  plinth: () => pbr('granitePolished', [0x6f6a66, 9]),
  timber: () => pbr('timber'),
  soffit: () => surf('stand-soffit', 64, 4, [0.3, 1], u => rib(u), h => shade(0xe4e6e4, 0.86 + 0.14 * h), { strength: 1.5, roughness: 0.5, metalness: 0.3 }),          // ribs every 0.3 m along u
  roofSheet: () => surf('stand-roofsheet', 4, 64, [1, 0.45], (u, v) => rib(v), h => shade(0xdfe1dc, 0.9 + 0.1 * h), { strength: 1.5, roughness: 0.55, metalness: 0.3 }),   // standing seams every 0.45 m along v
  shutter: () => surf('stand-shutter', 4, 32, [1, 0.09], (u, v) => 0.5 - 0.5 * Math.cos(v * 2 * Math.PI), h => shade(0x9aa3a8, 0.7 + 0.3 * h), { strength: 2.2, roughness: 0.45, metalness: 0.55 }),   // roller-shutter slats
  grate: () => surf('stand-grate', 64, 16, [0.3, 0.22], (u, v) => (((u * 6) % 1) < 0.5 && v > 0.12 && v < 0.88 ? 0 : 1), h => (h > 0.5 ? [84, 88, 90] : [14, 15, 16]), { strength: 3, roughness: 0.55, metalness: 0.6 }),   // slotted channel cover
};

const glassCache = new Map();
/**
 * Reflecting glass for one size of window: nx by ny panes over a field w by h metres. Used with Batch.quad, whose
 * texture coordinates start at the quad's first corner, so every window carries the whole painted reflection (sky
 * above, trees below) and the panes line up with its bars. The name decides whether it glows after dusk.
 */
export function glass(name, hex, nx, ny, w, h, over = {}) {
  const key = [name, hex, nx, ny, w.toFixed(3), h.toFixed(3)].join('|');
  if (!glassCache.has(key)) {
    const s = SURFACES.glazing(hex, nx, ny, [1, 1], 5), map = s.map.clone(), nm = s.normalMap.clone();
    for (const t of [map, nm]) { t.repeat.set(1 / w, 1 / h); t.needsUpdate = true; }
    const m = new THREE.MeshStandardMaterial({ map, normalMap: nm, roughness: 0.06, metalness: 0.6, envMapIntensity: 1.5, ...over }); m.name = name; glassCache.set(key, m);
  }
  return glassCache.get(key);
}

let lampMaterial = null;
/** Lamp glass of the stand: dim by day, bright after dusk (driven by nightly(), not by the lighting module). */
export function lamp() {
  if (!lampMaterial) { lampMaterial = new THREE.MeshStandardMaterial({ color: 0xfff4e0, roughness: 0.4, emissive: 0xffe2b0, emissiveIntensity: 0.35 }); lampMaterial.name = 'hifi-standlamp'; lampMaterial.userData.glow = 0.35; }
  return lampMaterial;
}
/**
 * Calls fn(k) whenever the time of day changes: k = 0 by day, 1 when it is dark. Item builders get no per-frame hook
 * (ctx.animate exists for the extras only), so without one the call rides on `anchor`, a mesh that is always drawn.
 */
export function nightly(ctx, anchor, fn) {
  let last = -1, hemi = null;
  const run = (scene, lighting) => {
    let k = 0;
    if (lighting && lighting.night) k = lighting.night();
    else {
      if (lighting && lighting.hemi) hemi = lighting.hemi; else if (scene && (!hemi || hemi.parent !== scene)) hemi = scene.children.find(o => o.isHemisphereLight) || null;
      k = hemi ? 1 - THREE.MathUtils.smoothstep(hemi.intensity, 0.1, 0.45) : 0;
    }
    if (Math.abs(k - last) > 0.002) { last = k; lamp().emissiveIntensity = 0.35 + 3.4 * k; fn(k); }
  };
  if (ctx.animate) ctx.animate((dt, seconds, env) => run(null, env && env.lighting));
  else if (anchor) { anchor.frustumCulled = false; anchor.onBeforeRender = (renderer, scene) => run(scene, null); }
}

// ---- lettering ----------------------------------------------------------------------------------------------------------
const PLATES = [['男卫生间', 'man'], ['女卫生间', 'woman'], ['器材室', 'ball'], ['医务室', 'cross'], ['配电房', 'bolt'], ['男更衣室', 'man'], ['女更衣室', 'woman'], ['裁判休息室', 'flag'],
  ['检录处', 'flag'], ['储藏室', 'box'], ['工具间', 'box'], ['淋浴间', 'drop'], ['广播室', 'horn'], ['楼梯', 'stair'], ['入口', 'arrow'], ['办公室', 'dot'], ['体育器材', 'ball'], ['饮水处', 'drop']];
function drawIcon(g, icon) {
  const poly = pts => { g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); };
  const disc = (x, y, r) => { g.beginPath(); g.arc(x, y, r, 0, 6.2832); g.fill(); };
  if (icon === 'man') { disc(0, -27, 9); g.fillRect(-12, -15, 24, 28); g.fillRect(-11, 13, 9, 23); g.fillRect(2, 13, 9, 23); }
  else if (icon === 'woman') { disc(0, -27, 9); poly([[0, -17], [-19, 17], [19, 17]]); g.fill(); g.fillRect(-9, 17, 7, 19); g.fillRect(2, 17, 7, 19); }
  else if (icon === 'cross') { g.fillRect(-10, -31, 20, 62); g.fillRect(-31, -10, 62, 20); }
  else if (icon === 'bolt') { poly([[8, -35], [-17, 5], [-2, 5], [-9, 35], [17, -7], [3, -7]]); g.fill(); }
  else if (icon === 'ball') { g.beginPath(); g.arc(0, 0, 27, 0, 6.2832); g.stroke(); g.beginPath(); g.arc(-34, 0, 27, -0.8, 0.8); g.stroke(); g.beginPath(); g.arc(34, 0, 27, 2.34, 3.94); g.stroke(); }
  else if (icon === 'flag') { poly([[-15, -32], [-15, 34]]); g.stroke(); poly([[-15, -32], [24, -19], [-15, -6]]); g.fill(); }
  else if (icon === 'box') { g.strokeRect(-25, -21, 50, 42); poly([[-25, -5], [25, -5]]); g.stroke(); poly([[-6, -5], [-6, 6], [6, 6], [6, -5]]); g.stroke(); }
  else if (icon === 'drop') { poly([[0, -33], [-17, 4], [17, 4]]); g.fill(); disc(0, 10, 18); }
  else if (icon === 'horn') { poly([[-28, -9], [-11, -9], [12, -27], [12, 27], [-11, 9], [-28, 9]]); g.fill(); g.beginPath(); g.arc(12, 0, 16, -0.9, 0.9); g.stroke(); }
  else if (icon === 'stair') { poly([[-30, 28], [-11, 28], [-11, 9], [8, 9], [8, -10], [27, -10], [27, -28]]); g.stroke(); }
  else if (icon === 'arrow') { poly([[-29, 0], [25, 0]]); g.stroke(); poly([[6, -19], [26, 0], [6, 19]]); g.stroke(); }
  else disc(0, 0, 11);
}
let plateMaterial = null;
/** Room plates (0.6 by 0.24 m): plate(batch, text, a, b, c, d) puts one on a quad given as for Batch2.uvq. */
export function plate(batch, text, a, b, c, d) {
  const CW = 320, CH = 128, cols = 3, rows = Math.ceil(PLATES.length / cols);
  if (!plateMaterial) {
    const cv = document.createElement('canvas'); cv.width = cols * CW; cv.height = rows * CH; const g = cv.getContext('2d');
    const rr = (x, y, w, h, r) => { g.beginPath(); if (g.roundRect) g.roundRect(x, y, w, h, r); else g.rect(x, y, w, h); };
    PLATES.forEach(([label, icon], i) => {
      const x = (i % cols) * CW, y = Math.floor(i / cols) * CH, ink = icon === 'bolt' ? '#1a1a1a' : '#ffffff';
      g.fillStyle = '#dfe0dc'; g.fillRect(x, y, CW, CH);
      g.fillStyle = icon === 'bolt' ? '#e0aa18' : icon === 'cross' ? '#1f8a55' : '#1d4f9c'; rr(x + 4, y + 4, CW - 8, CH - 8, 14); g.fill();
      g.strokeStyle = ink; g.lineWidth = 3; rr(x + 11, y + 11, CW - 22, CH - 22, 9); g.stroke();
      g.save(); g.translate(x + 64, y + 64); g.fillStyle = g.strokeStyle = ink; g.lineWidth = 7; g.lineCap = g.lineJoin = 'round'; drawIcon(g, icon); g.restore();
      g.fillStyle = ink; g.textBaseline = 'middle'; g.textAlign = 'center'; g.font = `bold ${label.length > 4 ? 36 : label.length > 3 ? 44 : 54}px ${SANS}`; g.fillText(label, x + 116 + (CW - 130) / 2, y + 67);
    });
    const map = new THREE.CanvasTexture(cv); map.colorSpace = THREE.SRGBColorSpace; map.anisotropy = 8;
    plateMaterial = new THREE.MeshStandardMaterial({ map, roughness: 0.42, metalness: 0.15 }); plateMaterial.name = 'hifi-roomsigns';
  }
  const i = Math.max(0, PLATES.findIndex(p => p[0] === text)), u0 = (i % cols) / cols, v1 = 1 - Math.floor(i / cols) / rows;
  return batch.uvq(plateMaterial, a, b, c, d, u0, v1 - 1 / rows, u0 + 1 / cols, v1);
}
let digitMaterials = null;
/** The numbers 1 to 32 in a row on one strip; [white paint, black paint]. Cell n - 1 holds the number n. */
function digits() {
  if (!digitMaterials) {
    const cv = document.createElement('canvas'); cv.width = 2048; cv.height = 64; const g = cv.getContext('2d');
    g.fillStyle = '#fff'; g.font = `bold 44px ${SANS}`; g.textAlign = 'center'; g.textBaseline = 'middle';
    for (let n = 1; n <= 32; n++) g.fillText(String(n), (n - 0.5) * 64, 35);
    const map = new THREE.CanvasTexture(cv); map.colorSpace = THREE.SRGBColorSpace; map.anisotropy = 8;
    digitMaterials = [0xf1efe6, 0x1c1c1e].map((color, i) => { const m = new THREE.MeshStandardMaterial({ map, color, alphaTest: 0.4, roughness: 0.75, polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -6 }); m.name = 'hifi-standnumbers' + i; return m; });
  }
  return digitMaterials;
}

/** One moulded seat, facing +x, standing on y = 0: a shell with a dished pan, a low back and a rolled rim. 22 triangles. */
function seatGeometry() {
  const P = [[0.235, 0.362, 0.2], [0.25, 0.425, 0.212], [0.12, 0.412, 0.216], [-0.07, 0.402, 0.216], [-0.165, 0.45, 0.214], [-0.205, 0.6, 0.21], [-0.228, 0.742, 0.198], [-0.254, 0.748, 0.184]];
  const pos = [], idx = [];
  for (const [x, y, w] of P) pos.push(x, y, -w, x, y, w);
  for (let i = 0; i + 1 < P.length; i++) { const a = 2 * i; idx.push(a, a + 3, a + 1, a, a + 2, a + 3); }
  for (const s of [-1, 1]) {                                                   // skirts under the pan's side edges: they round the rim
    const base = pos.length / 3; for (let i = 1; i <= 3; i++) pos.push(P[i][0], P[i][1] - 0.055, s * (P[i][2] - 0.016));
    for (let i = 1; i < 3; i++) { const t0 = 2 * i + (s > 0 ? 1 : 0), t1 = t0 + 2, s0 = base + i - 1, s1 = s0 + 1; if (s > 0) idx.push(t0, t1, s1, t0, s1, s0); else idx.push(t0, s1, t1, t0, s0, s1); }
  }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals(); return g;
}

/** Steel railing along z at a fixed x: posts, a top rail and two lower rails. */
export function railZ(v, x, y0, y1, z0, z1, m = M.steel()) {
  if (z1 - z0 < 0.2) return;
  const n = Math.max(1, Math.round((z1 - z0) / 1.5));
  for (let i = 0; i <= n; i++) v.box(m, x, (y0 + y1) / 2, z0 + (z1 - z0) * i / n, 0.05, y1 - y0, 0.05, 'D');
  v.box(m, x, y1, (z0 + z1) / 2, 0.06, 0.05, z1 - z0);
  for (const k of [0.36, 0.68]) v.box(m, x, y0 + (y1 - y0) * k, (z0 + z1) / 2, 0.03, 0.03, z1 - z0);
}

export function build(item, ctx) {
  const G = layout(item), { W, E, N, S, L, H, nR, yF, rise, xT, td, zR0, zR1, xR, zm, run } = G;
  const v = new Batch2(), c = new Batch(), fine = tiers(ctx, (W + E) / 2, N, S, 46, item.id), R = rng(9107);
  const both = (m, ...a) => { S3(v, m, ...a); S3(c, 'generic', ...a); };
  const at = f => N + f * L, conc = 'concrete', deck = M.deck(), steel = M.steel(), galv = M.galv(), yellow = M.yellow();
  const [numWhite, numBlack] = digits();

  // --- tiers and front walkway (solid down to the ground), painted nosings ---
  for (let k = 1; k <= ROWS; k++) {
    const xw = xT - k * td, y = yF + k * rise;
    both(conc, xw, xw + td, 0, y, N, S, k < ROWS ? 'DNSW' : 'DNS');
    S3(v, M.paint(), xw + td - 0.07, xw + td + 0.012, y - 0.06, y + 0.004, N + PAR, S - PAR, 'DW');
  }
  both(deck, xT, E - PAR, 0, yF, N, S, 'DNSEW');
  v.quad(M.grate(), [E - PAR - 0.3, yF + 0.004, N + PAR], [E - PAR - 0.3, yF + 0.004, S - PAR], [E - PAR - 0.08, yF + 0.004, S - PAR], [E - PAR - 0.08, yF + 0.004, N + PAR]);   // drainage channel at the foot of the bank

  // --- aisles: half steps with yellow nosings (visual) and one inclined plate each (collision); handrails ---
  const aisles = [{ z: N + PAR + 0.7, hw: 0.7, wall: N + PAR }, ...AISLES.map(f => ({ z: at(f), hw: BLOCKS.some(b => b[0] === f) ? 0.85 : 0.7 })), { z: S - PAR - 0.7, hw: 0.7, wall: S - PAR }];
  const railY = x => yF + rise + (xT - x) * rise / td + 0.9;                    // 0.9 m above the line through the nosings
  const xa = xT + td / 2 - 0.04, xb = W + td * 0.45;                            // foot and head of the aisle handrails
  for (const a of aisles) {
    const z0 = a.z - a.hw, z1 = a.z + a.hw;
    for (let k = 0; k <= ROWS; k++) {
      const xw = xT - k * td, y = yF + k * rise;
      if (k < ROWS) { S3(v, conc, xw, xw + td / 2, y, y + rise / 2, z0, z1, 'DW'); S3(v, yellow, xw + td / 2 - 0.06, xw + td / 2 + 0.014, y + rise / 2 - 0.05, y + rise / 2 + 0.006, z0, z1, 'DW'); }
      if (k > 0) S3(v, yellow, xw + td - 0.06, xw + td + 0.018, y - 0.05, y + 0.008, z0, z1, 'DW');
    }
    // the plate passes through the middle of every half tread, so it meets each row level where the row is walked
    prismZ(c, 'generic', [[xT + 0.75 * td, yF - 0.25], [xT + 0.75 * td, yF], [xT - (ROWS - 0.75) * td, H], [xT - (ROWS - 0.75) * td, H - 0.25]], z0, z1);
    const zr = a.wall !== undefined ? a.wall + Math.sign(a.z - a.wall) * 0.09 : a.z;      // end aisles: the rail hangs on the end wall
    for (const dy of [0, -0.34]) if (dy === 0 || a.wall === undefined) v.bar(steel, [xa, railY(xa) + dy, zr], [xb, railY(xb) + dy, zr], 0.045);
    if (a.wall === undefined) for (let k = 0; k <= ROWS; k += 2) {
      const x = k === 0 ? xa : k === ROWS ? xb : xT - (k - 1) * td - 0.09, y = k === 0 ? yF + rise / 2 : yF + k * rise;
      v.box(steel, x, (y + railY(x)) / 2, zr, 0.045, railY(x) - y, 0.045, 'D');
    } else for (let k = 1; k <= ROWS; k += 3) { const x = xT - (k - 1) * td - 0.3; v.box(steel, x, railY(x) - 0.03, (zr + a.wall) / 2, 0.03, 0.03, Math.abs(zr - a.wall)); }
    // row numbers painted on the tread where each row leaves the aisle (upright for whoever climbs it)
    for (let k = 1; k <= ROWS; k++) for (const s of a.wall !== undefined ? [Math.sign(a.z - a.wall)] : [-1, 1]) {
      const x = xT - k * td + 0.74 * td, y = yF + k * rise + 0.009, zc = a.z + s * (a.hw - 0.2), f = fine.at(zc), q = 0.1;
      S3(f, yellow, x - 0.13, x + 0.13, y - 0.004, y, zc - 0.13, zc + 0.13, 'D');
      f.uvq(numBlack, [x + q, y + 0.002, zc + q], [x + q, y + 0.002, zc - q], [x - q, y + 0.002, zc - q], [x - q, y + 0.002, zc + q], (k - 1) / 32, 0, k / 32, 1);
    }
  }

  // --- seats: one instanced shell per seat on a galvanised rail; seat numbers painted on the tread before each seat ---
  const seats = [], col = new THREE.Color();
  for (let i = 0; i + 1 < aisles.length; i++) {
    const z0 = aisles[i].z + aisles[i].hw, z1 = aisles[i + 1].z - aisles[i + 1].hw, n = Math.min(32, Math.floor((z1 - z0 - 0.16) / PITCH));
    if (n < 1) continue;
    const zc = (z0 + z1) / 2, hex = BLOCKS.find(b => (zc - N) / L < b[0])[1], zs = zc - (n - 1) * PITCH / 2, f = fine.at(zc);
    for (let k = 1; k <= ROWS; k++) {
      const xw = xT - k * td, y = yF + k * rise, xs = xw + 0.34;
      for (let j = 0; j < n; j++) seats.push([xs, y, zs + j * PITCH, hex]);
      v.box(galv, xs + 0.02, y + 0.345, zc, 0.05, 0.07, n * PITCH - 0.06);
      for (let j = 0; j <= n; j += 3) { const z = zs + (Math.min(j, n) - 0.5) * PITCH; v.box(galv, xs + 0.02, y + 0.155, z, 0.05, 0.31, 0.05, 'UD'); f.box(galv, xs + 0.02, y + 0.006, z, 0.16, 0.012, 0.12, 'D'); }
      if (n % 3) { const z = zs + (n - 0.5) * PITCH; v.box(galv, xs + 0.02, y + 0.155, z, 0.05, 0.31, 0.05, 'UD'); }
      const xn = xw + td - 0.1, q = 0.065;                                       // seat numbers, upright for someone facing the seats
      for (let j = 0; j < n; j++) { const z = zs + j * PITCH; f.uvq(numWhite, [xn, y + 0.003, z + q], [xn, y + 0.003, z - q], [xn - 2 * q, y + 0.003, z - q], [xn - 2 * q, y + 0.003, z + q], j / 32, 0, (j + 1) / 32, 1); }
    }
  }
  {
    const shell = plain('seatshell', 0xffffff, 0.42, 0, { side: THREE.DoubleSide }), im = new THREE.InstancedMesh(seatGeometry(), shell, seats.length), m4 = new THREE.Matrix4();
    seats.forEach(([x, y, z, hex], i) => {
      im.setMatrixAt(i, m4.makeTranslation(x, y, z));
      const k = R(); col.set(hex).multiplyScalar(0.9 + 0.16 * R()); if (k > 0.975) col.lerp(new THREE.Color(0xffffff), 0.09);      // sun-faded unevenly; a few newer replacements
      im.setColorAt(i, col);
    });
    im.instanceMatrix.needsUpdate = true; if (im.instanceColor) im.instanceColor.needsUpdate = true;
    im.castShadow = im.receiveShadow = true; im.name = item.id + '-seats'; im.computeBoundingBox(); im.computeBoundingSphere(); ctx.add(im);
  }
  // rail behind the top row, open at the aisles
  for (let i = 0; i + 1 < aisles.length; i++) {
    const z0 = aisles[i].z + aisles[i].hw, z1 = aisles[i + 1].z - aisles[i + 1].hw;
    railZ(v, W + 0.04, H, H + 1.0, z0, z1); S3(c, 'generic', W + 0.01, W + 0.07, H - 0.2, H + BARRIER, z0, z1);
  }

  // --- stairs. A flight tops out at zTop and runs down in direction d (-1 north, +1 south) between x0 and x1 ---
  const line = dist => yF - (dist + TREAD / 2) * RISER / TREAD;                 // height of the line through the tread centres, by distance from the top
  function flight(zTop, d, x0, x1) {
    for (let i = 1; i <= nR; i++) {
      const za = zTop + d * (nR - 1 - i) * TREAD, zb = zTop + d * (nR - i) * TREAD;
      if (i < nR) S3(v, conc, x0, x1, 0, i * RISER, za, zb, 'D');
      S3(v, i === 1 || i === nR ? yellow : M.paint(), x0 + 0.02, x1 - 0.02, i * RISER - 0.04, i * RISER + 0.005, zb - d * 0.05, zb + d * 0.012, 'D');
    }
    prismX(c, 'generic', [[zTop - d * TREAD / 2, yF - 0.25], [zTop - d * TREAD / 2, yF], [zTop + d * (nR - 0.5) * TREAD, 0], [zTop + d * (nR - 0.5) * TREAD, -0.25]], x0, x1);
  }
  // handrail along a flight at x, 0.9 m above the tread line, on short brackets or on posts
  function handrail(zTop, d, x, posts, wallX) {
    const far = run + 0.1;
    v.bar(steel, [x, line(0) + 0.95, zTop], [x, line(far) + 0.95, zTop + d * far], 0.045);
    for (let t = 0.25; t < far; t += 1.15) {
      if (posts) v.box(steel, x, line(t) + 0.47, zTop + d * t, 0.045, 0.95, 0.045, 'UD');
      else v.box(steel, (x + wallX) / 2, line(t) + 0.92, zTop + d * t, Math.abs(x - wallX), 0.03, 0.03);
    }
    if (posts) v.bar(steel, [x, line(0) + 0.5, zTop], [x, line(far) + 0.5, zTop + d * far], 0.03);
  }
  // solid white balustrade with a steel handrail on the outer (east) side of a flight, on a brick wall
  function balustrade(zTop, d, x0, x1) {
    const far = run + 0.2, zFar = zTop + d * far;
    prismX(v, M.white(), [[zTop, line(0) - 0.42], [zTop, line(0) + 0.53], [zFar, line(far) + 0.53], [zFar, line(far) - 0.42]], x0, x1 + 0.05);
    for (let i = 0; i * TREAD < far; i++) {                                     // brick under the band: nested boxes whose stepped tops the band hides
      const top = line(i * TREAD) - 0.32;
      if (top > 0.05) S3(v, 'brickRed', x0, x1, 0, top, zTop, zTop + d * Math.min(far, (i + 1) * TREAD), 'DUNS');
    }
    S3(v, 'wallWhite', x0 - 0.05, x1 + 0.1, 0, line(far) + 0.75, zFar - d * 0.02, zFar + d * 0.3, 'D');                      // newel pier at the foot
    handrail(zTop, d, (x0 + x1) / 2 + 0.03, true);
    prismX(c, 'generic', [[zTop, 0], [zTop, line(0) + BARRIER], [zFar + d * 0.3, line(far) + BARRIER], [zFar + d * 0.3, 0]], x0, x1 + 0.05);
  }
  // slim stair along the front wall at an end of the bank: rises to a landing that opens onto the walkway (the south one
  // is in the 2018 frames 39 and 47; the north one mirrors it)
  const xo = E + 1.25, LAND = 1.6;
  function endStair(zTop, d) {
    const zL = zTop - d * LAND, far = run + 0.2;                                // zL: the closed end of the landing
    flight(zTop, d, E + 0.05, xo);
    both(conc, E + 0.05, xo, 0, yF, zL, zTop, 'DW'); S3(v, deck, E + 0.05, xo, yF, yF + 0.004, zL, zTop, 'DW');
    railZ(v, xo - 0.03, yF, yF + 1.05, Math.min(zL, zTop) + 0.03, Math.max(zL, zTop));
    for (const k of [0.36, 0.68, 1]) v.box(steel, (E + xo) / 2, yF + 1.05 * k, zL + d * 0.03, xo - E - 0.05, k === 1 ? 0.05 : 0.03, k === 1 ? 0.06 : 0.03);
    handrail(zTop, d, xo - 0.03, true); handrail(zTop, d, E + 0.14, false, E + 0.05);
    S3(c, 'generic', xo - 0.07, xo, 0, yF + BARRIER, zL, zTop, 'D'); S3(c, 'generic', E, xo, 0, yF + BARRIER, zL, zL + d * 0.07, 'D');
    prismX(c, 'generic', [[zTop, 0], [zTop, line(0) + BARRIER], [zTop + d * far, line(far) + BARRIER], [zTop + d * far, 0]], xo - 0.07, xo);
    return [Math.min(zL, zTop) + 0.1, Math.max(zL, zTop) - 0.1];                // the opening in the front parapet
  }
  const gapS = endStair(S - 0.4 - run, 1), gapN = endStair(N + 0.4 + run, -1);
  for (const [zTop, d] of [[zR0, -1], [zR1, 1]]) { flight(zTop, d, E + 0.05, xR - 0.2); balustrade(zTop, d, xR - 0.2, xR); handrail(zTop, d, E + 0.14, false, E + 0.05); }

  // --- front wall: brick with doors and windows set back in it, a granite course, the white parapet band and its railing ---
  const frame = M.frame(), dgl = (w, h) => glass('stand-glassdark', 0x4c6672, 2, 1, w, h);
  function opening(x, a, b, o) {
    const zc = (a + b) / 2, f = fine.at(zc), xr = x - 0.12, top = o.y1;         // xr: plane of the leaf, set back in the reveal
    if (o.kind === 'window') {
      v.quad(dgl(b - a, top - o.y0), [xr, o.y0, b], [xr, o.y0, a], [xr, top, a], [xr, top, b]);
      for (const z of [a + 0.025, b - 0.025, zc]) S3(v, frame, xr, xr + 0.05, o.y0, top, z - 0.025, z + 0.025, 'W');
      for (const y of [o.y0 + 0.025, top - 0.025]) S3(v, frame, xr, xr + 0.05, y - 0.025, y + 0.025, a, b, 'W');
      S3(v, 'wallWhite', xr, x + 0.04, o.y0 - 0.06, o.y0, a - 0.05, b + 0.05, 'W');
      return;
    }
    if (o.kind === 'shutter') {
      S3(v, M.shutter(), xr - 0.04, xr, 0, top, a, b, 'W'); S3(v, galv, xr, xr + 0.05, 0, 0.1, a, b, 'W');
      for (const z of [a + 0.04, b - 0.04]) S3(v, galv, xr, xr + 0.08, 0, top, z - 0.04, z + 0.04, 'W');
      S3(f, M.dark(), xr + 0.05, xr + 0.08, 0.02, 0.09, zc - 0.09, zc + 0.09);
    } else {
      S3(v, o.kind === 'louvre' ? M.shutter() : M.door(), xr - 0.04, xr, 0, top, a, b, 'W');
      for (const z of [a + 0.03, b - 0.03]) S3(v, frame, xr, xr + 0.045, 0, top, z - 0.03, z + 0.03, 'W');
      S3(v, frame, xr, xr + 0.045, top - 0.06, top, a, b, 'W');
      const leaves = o.kind === 'double' ? [[a + 0.06, zc - 0.004, 1], [zc + 0.004, b - 0.06, -1]] : [[a + 0.06, b - 0.06, 1]];
      if (o.kind === 'double') S3(v, M.dark(), xr, xr + 0.004, 0, top - 0.06, zc - 0.006, zc + 0.006, 'W');
      for (const [l0, l1, hand] of leaves) {
        const zh = hand > 0 ? l0 + 0.09 : l1 - 0.09;                            // latch side
        S3(f, steel, xr, xr + 0.006, 0.02, 0.26, l0 + 0.02, l1 - 0.02, 'W');                                              // kick plate
        S3(f, steel, xr, xr + 0.012, 0.96, 1.12, zh - 0.022, zh + 0.022, 'W'); S3(f, steel, xr + 0.035, xr + 0.055, 1.03, 1.05, zh - 0.02, zh + hand * 0.11);   // escutcheon and lever
        if (o.kind !== 'louvre') { const zv = hand > 0 ? l0 + 0.2 : l1 - 0.2; S3(v, M.dark(), xr, xr + 0.006, 1.22, 1.72, zv - 0.07, zv + 0.07, 'W'); }   // vision slot
        for (const y of [0.3, top - 0.35]) S3(f, steel, xr, xr + 0.02, y - 0.05, y + 0.05, (hand > 0 ? l1 : l0) - 0.012, (hand > 0 ? l1 : l0) + 0.012);    // hinges
      }
    }
    S3(v, conc, xr, x + 0.12, 0, 0.035, a - 0.04, b + 0.04, 'DW');                                                        // threshold
    if (o.plate) { const xp = x + 0.058, y0 = top + 0.14; plate(f, o.plate, [xp, y0, zc + 0.3], [xp, y0, zc - 0.3], [xp, y0 + 0.24, zc - 0.3], [xp, y0 + 0.24, zc + 0.3]); }
    LIT.push([x + 1.0, zc, 2.6]);                                                                                         // a pool of light before the door after dusk
    S3(v, lamp(), x + 0.07, x + 0.13, top + 0.52, top + 0.62, zc - 0.15, zc + 0.15); S3(v, M.dark(), x + 0.05, x + 0.08, top + 0.5, top + 0.64, zc - 0.17, zc + 0.17, 'W');   // bulkhead lamp
  }
  // wall facing east at x from zA to zB, yTop high; ops: [fraction of the length, width, kind, plate]
  function wallE(x, zA, zB, yTop, ops) {
    let zp = zA;
    for (const [fr, w, kind, text] of ops) {
      const o = { kind, plate: text, y0: kind === 'window' ? yTop - 0.72 : 0, y1: kind === 'window' ? yTop - 0.17 : yTop }, a = at(fr) - w / 2, b = a + w;
      S3(v, 'brickRed', x - PAR, x, 0, yTop, zp, a, 'DWU'); S3(v, M.plinth(), x, x + 0.025, 0, 0.22, zp, a, 'DW');
      if (o.y0 > 0) { S3(v, 'brickRed', x - PAR, x, 0, o.y0, a, b, 'DWNSU'); S3(v, M.plinth(), x, x + 0.025, 0, 0.22, a, b, 'DWNS'); }
      if (o.y1 < yTop) S3(v, 'brickRed', x - PAR, x, o.y1, yTop, a, b, 'UWNS');
      opening(x, a, b, o); zp = b;
    }
    S3(v, 'brickRed', x - PAR, x, 0, yTop, zp, zB, 'DWU'); S3(v, M.plinth(), x, x + 0.025, 0, 0.22, zp, zB, 'DW');
  }
  const OPS = [[0.085, 0.95, 'single', '男卫生间'], [0.108, 0.95, 'single', '女卫生间'], [0.15, 1.3, 'window'], [0.175, 1.3, 'window'], [0.205, 2.6, 'shutter', '器材室'], [0.24, 1.0, 'single', '体育器材'],
    [0.262, 1.3, 'window'], [0.285, 1.0, 'single', '医务室'], [0.31, 1.3, 'window'], [0.335, 0.95, 'louvre', '配电房'],
    [0.66, 1.6, 'double', '检录处'], [0.685, 1.3, 'window'], [0.71, 0.95, 'single', '男更衣室'], [0.735, 0.95, 'single', '女更衣室'], [0.76, 1.3, 'window'], [0.785, 0.95, 'single', '淋浴间'],
    [0.81, 1.3, 'window'], [0.84, 2.6, 'shutter', '器材室'], [0.875, 1.0, 'single', '裁判休息室'], [0.9, 1.3, 'window'], [0.925, 0.95, 'single', '工具间']];
  const yB = yF - 0.4;                                                          // top of the brick: the white band starts here
  wallE(E, N, zR0, yB, OPS.filter(o => o[0] < ROSTRUM[0])); wallE(E, zR1, S, yB, OPS.filter(o => o[0] > ROSTRUM[1]));
  S3(v, 'wallWhite', E - PAR, E + 0.05, yB, yF, N, S, 'W'); S3(c, 'generic', E - PAR, E + 0.05, 0, yF, N, S, 'DW');
  let zPrev = N + PAR;
  for (const [g0, g1] of [gapN, [zR0, zR1], gapS, [S - PAR, S]]) {
    if (g0 - zPrev > 0.3) {
      S3(v, 'wallWhite', E - PAR, E + 0.05, yF, yF + 0.4, zPrev, g0, 'D'); S3(v, M.plinth(), E - PAR - 0.02, E + 0.07, yF + 0.4, yF + 0.44, zPrev, g0, 'D');
      railZ(v, E - PAR / 2 + 0.02, yF + 0.44, yF + 1.1, zPrev + 0.05, g0 - 0.05);
      S3(c, 'generic', E - PAR, E + 0.05, yF, yF + BARRIER, zPrev, g0, 'D');    // the whole thickness, flush with the outer face: no ledge outside the rail
    }
    zPrev = g1;
  }
  // spouts of the walkway channel and their downpipes, kept clear of doors, windows and stairs
  const busy = z => (z > zR0 - run - 1 && z < zR1 + run + 1) || z < gapN[1] + 0.6 || z > gapS[0] - 0.6 || OPS.some(([fr, w]) => Math.abs(z - at(fr)) < w / 2 + 0.45);
  for (let z = N + 9; z < S - 6; z += 7.7) {
    let zz = z; for (let i = 0; i < 4 && busy(zz); i++) zz += 1.1;
    if (busy(zz)) continue;
    S3(v, M.pipe(), E + 0.05, E + 0.2, yB + 0.06, yB + 0.2, zz - 0.08, zz + 0.08); v.cyl(M.pipe(), E + 0.11, 0.06, zz, 0.045, yB + 0.02, 10, false);
    for (const y of [0.45, yB - 0.3]) S3(v, galv, E, E + 0.17, y, y + 0.03, zz - 0.07, zz + 0.07);
  }
  // paved strip at the foot of the wall with a channel along its outer edge (the walking floor stays flat)
  const strip = (z0, z1, x1) => { S3(v, deck, E, x1, 0, 0.05, z0, z1, 'DW'); v.quad(M.grate(), [x1 - 0.24, 0.054, z0], [x1 - 0.24, 0.054, z1], [x1 - 0.02, 0.054, z1], [x1 - 0.02, 0.054, z0]); };
  strip(N - 0.3, zR0 - run - 1.2, E + 2.15); strip(zR0 - run - 1.2, zR1 + run + 1.2, E + OUT + 0.75); strip(zR1 + run + 1.2, S + 0.3, E + 2.15);

  // --- rostrum: platform at walkway level in front of the middle block, open to the walkway ---
  wallE(xR, zR0, zR1, yF - 0.5, [[0.425, 1.0, 'single', '储藏室'], [0.452, 1.3, 'window'], [0.54, 1.3, 'window'], [0.567, 1.0, 'single', '办公室']]);
  S3(v, 'brickRed', E, xR - PAR, 0, yF - 0.5, zR0, zR1, 'DUEW');
  S3(v, 'wallWhite', E, xR + 0.05, yF - 0.5, yF - 0.03, zR0, zR1, 'WU'); S3(v, deck, E - PAR, xR + 0.05, yF - 0.03, yF + 0.003, zR0, zR1, 'DW');
  S3(c, 'generic', E, xR + 0.05, 0, yF, zR0, zR1, 'DW');
  S3(v, 'wallWhite', xR - 0.2, xR + 0.05, yF, yF + 0.45, zR0, zR1, 'D'); S3(v, M.plinth(), xR - 0.22, xR + 0.07, yF + 0.45, yF + 0.49, zR0, zR1, 'D');
  railZ(v, xR - 0.08, yF + 0.49, yF + 1.1, zR0 + 0.05, zR1 - 0.05);
  S3(c, 'generic', xR - 0.2, xR + 0.05, yF, yF + BARRIER, zR0, zR1, 'D');
  { // lettering on the band, desks on the platform
    const { texture, aspect } = textTexture('主席台', { color: '#b3261e', spacing: 0.5 }), h = 0.36;
    const m = new THREE.MeshStandardMaterial({ map: texture, alphaTest: 0.5, roughness: 0.5 }); m.name = 'hifi-standletters';
    const xs = xR + 0.056, y0 = yF - 0.45, hw = h * aspect / 2;
    v.uvq(m, [xs, y0, zm + hw], [xs, y0, zm - hw], [xs, y0 + h, zm - hw], [xs, y0 + h, zm + hw]);
    const wood = M.timber(), cloth = plain('desk-cloth', 0x8c1f1c, 0.85, 0);
    for (const dz of [-6.6, 0, 6.6]) {
      const z0 = zm + dz - 2.9, z1 = zm + dz + 2.9, x0 = xR - 1.25, x1 = xR - 0.6;
      S3(v, wood, x0 - 0.03, x1 + 0.03, yF + 0.72, yF + 0.76, z0 - 0.03, z1 + 0.03); S3(v, cloth, x1 - 0.02, x1, yF + 0.06, yF + 0.72, z0, z1, 'UD');
      for (const z of [z0 + 0.02, z1 - 0.02]) S3(v, cloth, x0, x1, yF + 0.06, yF + 0.72, z - 0.02, z + 0.02, 'UD');
      S3(c, 'generic', x0, x1, yF, yF + 0.76, z0, z1, 'D');
    }
  }
  // three flag poles (no flags) on a granite base in front of the rostrum
  {
    const xp = xR + 0.36, pole = plain('flagpole', 0xf2f3f1, 0.35, 0.4);
    S3(v, M.plinth(), xR + 0.06, xR + 0.66, 0, 0.34, zm - 2.7, zm + 2.7, 'DW'); S3(c, 'generic', xR + 0.05, xR + 0.66, 0, 1.9, zm - 2.7, zm + 2.7, 'DW');
    [[-1.9, 11.4], [0, 12.6], [1.9, 11.4]].forEach(([dz, h]) => {
      v.cyl(M.steel(), xp, 0.34, zm + dz, 0.11, 0.1, 14).cyl(pole, xp, 0.44, zm + dz, 0.062, h * 0.5, 12, false).cyl(pole, xp, 0.44 + h * 0.5, zm + dz, 0.046, h * 0.5 - 0.44, 12, false);
      v.cyl(M.gold(), xp, h, zm + dz, 0.07, 0.03, 12).cyl(M.gold(), xp, h + 0.03, zm + dz, 0.035, 0.07, 10).cyl(M.gold(), xp, h + 0.1, zm + dz, 0.06, 0.1, 12);
      v.cyl(M.dark(), xp + 0.085, 1.1, zm + dz, 0.006, h - 1.25, 4, false); S3(v, M.steel(), xp + 0.06, xp + 0.11, 1.05, 1.1, zm + dz - 0.015, zm + dz + 0.015);   // halyard and cleat
    });
  }

  // --- end walls: brick below, raked white parapet band along the rake ---
  for (const [z0, z1] of [[N, N + PAR], [S - PAR, S]]) {
    for (let k = 1; k <= ROWS; k++) {                                           // nested brick boxes; the raked band hides their stepped tops
      const xw = xT - k * td, y = yF + k * rise;
      S3(v, 'brickRed', W, xw + td, 0, y - 0.3, z0, z1, 'DUEW'); S3(c, 'generic', xw, xw + td, 0, y + BARRIER, z0, z1, 'D');
    }
    S3(v, 'brickRed', W, E, 0, yF - 0.3, z0, z1, 'DUEW'); S3(c, 'generic', xT, E + 0.05, 0, yF + BARRIER, z0, z1, 'D');
    S3(v, M.white(), xT, E + 0.05, yF - 0.4, yF + 0.9, z0 - 0.03, z1 + 0.03, 'W');
    prismZ(v, M.white(), [[xT, yF - 0.4], [xT, yF + 0.9], [W, H + 0.9], [W, H - 0.4]], z0 - 0.03, z1 + 0.03, [2]);
    prismZ(v, M.plinth(), [[xT, yF + 0.9], [xT, yF + 0.94], [W, H + 0.94], [W, H + 0.9]], z0 - 0.05, z1 + 0.05); S3(v, M.plinth(), xT, E + 0.07, yF + 0.9, yF + 0.94, z0 - 0.05, z1 + 0.05);
  }

  fine.finish();
  const vis = ctx.add(v.build({ name: item.id + '-visual' }));
  nightly(ctx, vis.children[0], () => {});
  const cg = ctx.add(c.build({ name: item.id + '-colliders' })); cg.visible = false;
  cg.traverse(m => { if (m.isMesh) ctx.collide(m); });
}
