// Long six-storey blocks south-east of the gymnasium (items dorm-*-slab), inside and out, drawn as the students'
// dormitories. Their real use is NOT established: the measurement notes call them dormitories and nothing confirms it.
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
//     glazed section and the white pier west of it.
// From the satellite image: outlines, the long axis (block B south is turned about 10 degrees), a beige flat roof,
// rooftop plant on the half away from the courtyard (one light-blue item and white ribbed blocks per block).
//
// ASSUMED (kept from the first version; not seen in any reference):
//   - six storeys and the overall height; that the three blocks not seen in the video repeat block A north's street
//     face (without the colonnade or the lettering); access galleries on the courtyard side of every block;
//   - the corner notches at the south-east of blocks A north and B north are not modelled (plain rectangles).
//
// IMAGINED (the owner asked for a complete, good-looking, lived-in place and said it need not be factual):
//   - the rest of the fascia lettering: 面向世界 is completed to the well-known sentence 面向现代化 面向世界 面向未来;
//     only the middle four characters and their position are seen;
//   - the plan. A room is a balcony plus a wet cell on the street side: rooms are mirrored in pairs, so that two wet
//     cells make one brick pier with two small windows and two balconies make one recess with a white fin (the "post")
//     in the middle. Every dimension follows from that (rooms about 3.65 m wide, storeys 3.0 m, ground floor 0.3 m
//     above the ground on a dark plinth, fascia 2.5 m);
//   - what is where: end bays (closed service rooms), rooms, a stair core in the white pier bay, a common room behind
//     the dark glazing (the entrance lobby on the ground floor; in block A north the lobby is behind the colonnade and
//     the ground-floor common room is an activity room), a wash room in the second white bay, rooms, an end bay;
//     block A north has a second stair beside the lobby; the south blocks' galleries run on as bridges to the round
//     towers (round-tower.js); what the light-blue roof item and the ribbed blocks are (a water tank, solar heaters);
//   - every finish and fitting: plinth, window frames and sills, balcony rails, drying rails and washing, outdoor
//     units, pipes, doors, number plates, lamps, the porch steps, canopies and signs, roof parapet and lightning rods,
//     the soft dirt on the walls, and everything inside (lobby, stairs, wash rooms, common rooms, furnished rooms).
//
// Collision: floors, stairs (one inclined plate per flight), walls, balustrades (2 m tall for the walker), columns,
// roof deck and parapets. Rooms with closed doors are closed for the walker too. Collider boxes never share a face
// plane where they overlap (the octree of the player degenerates on coincident faces): they are stacked with small
// gaps or pass through one another.
import { THREE, mat } from '../../kit.js';
import { Batch } from '../../batch.js';
import { plain, SURFACES, rng } from '../../hifi.js';
import { LIT } from '../../street.js';

export const FLOORS = 6, FH = 3.0, BASE = 0.3;
const SLAB = 0.15, CEIL = FH - SLAB;                  // floor slab; clear height of a storey
const FACE = 0.25;                                     // the walls stand this far inside the roof outline; the fascia projects to the outline
const BALC = 1.5, GALLERY = 2.0, WALL = 0.2;           // balcony depth, gallery depth, wall thickness
const PIER = 3.75, GLAZED = 11.5, END_MIN = 4.2, END_W = 4.45, ROOM_W = 3.55, WET = 1.3, PORCH = 1.8, RECESS = 0.3;
export const STEPS = 10, GO = 0.28, RISE = FH / 2 / STEPS, FLIGHT = 1.6;
const CJK = '"PingFang SC","Microsoft YaHei","Heiti SC","SimHei","Noto Sans CJK SC","Source Han Sans SC","WenQuanYi Zen Hei",sans-serif';

// Per-block particulars. Rooftop positions are metres from the west end of the roof, read off the satellite image.
const SPECIAL = {
  'dorm-a-north-slab': { colonnade: 24, open: 2, name: '一栋', slogan: true, blue: [45.3, 49.4], ribbed: [[49.6, 62.4], [64.2, 71.2]] },
  'dorm-a-south-slab': { open: 1, name: '二栋', blue: [42.3, 46.4], ribbed: [[51.1, 58.2], [64.8, 72.5]] },
  'dorm-b-north-slab': { open: 1, name: '三栋', blue: [39.3, 43.4], ribbed: [[57.1, 65.4]] },
  'dorm-b-south-slab': { open: 1, name: '四栋', blue: [59.4, 63.6], ribbed: [[44.9, 59.4]] },
};

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
const seedOf = id => [...id].reduce((s, ch) => (s * 31 + ch.charCodeAt(0)) >>> 0, 7);

/**
 * Where a round tower is drawn. The measured circles reach a little into the link blocks north of them (positions are
 * good to about 2 m); the tower is moved south just far enough to stand clear. Used by this file and by round-tower.js.
 */
export function towerSite(t, campus) {
  let cx = t.cx, cz = t.cz; const R = t.radius;
  for (const o of (campus ? campus.items : [])) if (/-east-link$/.test(o.id) && o.points) {
    const xs = o.points.map(p => p[0]), zs = o.points.map(p => p[1]), w = Math.min(...xs), e = Math.max(...xs), s = Math.max(...zs);
    if (cx > w && cx < e && cz > s - 1 && cz - R < s + 0.1) cz = s + 0.1 + R;
  }
  return { cx, cz, R };
}

/**
 * Every position of the plan as plain numbers (no geometry), so that the walk test and round-tower.js stay in step
 * with the builder. Along the block: x from its west end. Across: d = distance behind the street face (the face away
 * from the courtyard), so that all four blocks share one description; zAt(d) gives the local z.
 */
export function plan(item, campus) {
  const f = frameOf(item.points), { L, D } = f, H = item.height, sp = SPECIAL[item.id] || {};
  // The courtyard side is the one facing the nearest other block of this kind; the street face is the opposite one.
  let streetNorth = true, nearest = Infinity;
  const me = centroid(item.points);
  for (const o of (campus ? campus.items : [])) {
    if (o === item || o.style !== item.style || !o.points) continue;
    const p = centroid(o.points), dist = Math.hypot(p[0] - me[0], p[1] - me[1]);
    if (dist < nearest) { nearest = dist; streetNorth = (p[0] - f.ox) * f.wx + (p[1] - f.oz) * f.wz > D / 2; }
  }
  const col = sp.colonnade || 0, xa = FACE + 0.3, xb = L - FACE - 0.3, back = FACE + BALC, court = D - FACE - GALLERY, gx = D - FACE;
  const level = k => BASE + k * FH, yF = level(FLOORS), yDeck = H - 1.2;
  const zAt = d => (streetNorth ? d : D - d), cs = Math.cos(f.angle), sn = Math.sin(f.angle);
  const toWorld = (x, d) => { const z = zAt(d); return [f.ox + x * cs + z * sn, f.oz - x * sn + z * cs]; };
  const toLocal = (wx, wz) => { const dx = wx - f.ox, dz = wz - f.oz, z = dx * sn + dz * cs; return [dx * cs - dz * sn, streetNorth ? z : D - z]; };
  /** Heading (degrees, 0 = north, 90 = east) of a direction given along the block (ax) and across it (ad). */
  const yawOf = (ax, ad) => { const [x0, z0] = toWorld(0, 0), [x1, z1] = toWorld(ax, ad); return Math.atan2(x1 - x0, -(z1 - z0)) * 180 / Math.PI; };

  // ---- sections from west to east ----
  const sections = []; let x = xa;
  const push = (kind, len, extra = {}) => { const s = { kind, x0: x, x1: x + len, ...extra }; sections.push(s); x += len; return s; };
  const xEnd = col ? L - col : xb, fixed = (col ? 3 : 2) * PIER + GLAZED + (col ? END_W : 2 * END_MIN);
  const avail = xEnd - xa - fixed, n = Math.max(2, Math.floor(avail / 2 / ROOM_W)), w = Math.min(3.85, avail / (2 * n)), spare = avail - 2 * n * w;
  push('end', col ? END_W + spare : END_MIN + spare / 2); push('rooms', n * w, { n, w }); push('stair', PIER);
  push('common', GLAZED, { lobby: !col }); push('wash', PIER); push('rooms', n * w, { n, w });
  if (col) { push('stair', PIER); push('lobby', xb - x); } else push('end', xb - x);

  const rooms = [];
  sections.filter(s => s.kind === 'rooms').forEach((s, si) => {
    s.si = si; s.rooms = [];
    for (let j = 0; j < s.n; j++) {
      const x0 = s.x0 + j * s.w, x1 = x0 + s.w, wetW = j % 2 === 0, px0 = wetW ? x0 : x1 - WET, px1 = px0 + WET, xc = (x0 + x1) / 2;
      const r = { sec: s, j, i: rooms.length, x0, x1, xc, wetW, px0, px1, bx0: wetW ? px1 : x0, bx1: wetW ? x1 : px0,
        door: [xc - 0.5, xc + 0.5], win: wetW ? [xc + 0.75, xc + 1.6] : [xc - 1.6, xc - 0.75],            // on the gallery
        bdoor: wetW ? [px1 + 0.1, px1 + 1.0] : [px0 - 1.0, px0 - 0.1], bwin: wetW ? [px1 + 1.15, px1 + 2.2] : [px0 - 2.2, px0 - 1.15] };   // on the balcony
      rooms.push(r); s.rooms.push(r);
    }
  });
  const nOpen = sp.open || 1;
  /** Is room r furnished and open on storey k (0 = ground)? */
  const isOpen = (k, r) => { for (let q = 0; q < nOpen; q++) if ((k * 2 + r.sec.si * 3 + q * 3 + 1) % r.sec.n === r.j) return true; return false; };
  const zl = court - 0.3, zh = zl - STEPS * GO, zb = zh - 1.5;
  const stairs = sections.filter(s => s.kind === 'stair').map(s => (s.st = { x0: s.x0, x1: s.x1, xw0: s.x0 + 0.1, xw1: s.x1 - 0.1,
    xB0: s.x0 + 0.1, xB1: s.x0 + 0.1 + FLIGHT, xA0: s.x1 - 0.1 - FLIGHT, xA1: s.x1 - 0.1, zl, zh, zb }));

  // ---- bridge to a round tower standing off the east end (the south blocks) ----
  let bridge = null;
  if (!col) for (const t of (campus ? campus.items : [])) if (t.style === 'round-tower' && t.shape === 'circle') {
    const s = towerSite(t, campus), [tx, td] = toLocal(s.cx, s.cz), d0 = court, d1 = gx;
    if (tx < L + 1 || tx - s.R > L + 5 || Math.abs(td - (d0 + d1) / 2) > s.R - 0.6) continue;
    const xe = d => tx - Math.sqrt(Math.max(0.01, s.R * s.R - (d - td) * (d - td)));                       // where the tower's outline is met at depth d
    const az = d => { const [wx, wz] = toWorld(xe(d), d); return Math.atan2(wz - s.cz, wx - s.cx); };
    bridge = { tower: t.id, cx: s.cx, cz: s.cz, R: s.R, tx, td, d0, d1, x0: L - FACE, xe, az0: az(d0), az1: az(d1), levels: Array.from({ length: FLOORS }, (_, k) => level(k)) };
  }
  return { f, L, D, H, streetNorth, col, xa, xb, back, court, gx, yF, yDeck, sections, rooms, stairs, bridge, level, zAt, toWorld, toLocal, yawOf, isOpen, name: sp.name || '' };
}
/** The bridge that meets round tower `towerId`, if one of the long blocks sends one. */
export function bridgeFor(towerId, campus) {
  for (const it of (campus ? campus.items : [])) if (it.style === 'slab-block' && it.points) { const p = plan(it, campus); if (p.bridge && p.bridge.tower === towerId) return p.bridge; }
  return null;
}

// ---------------------------------------------------------------------------------------------------------------------
// materials (shared by the four blocks). Textured ones reuse the palette's surfaces, so no new texture is computed.
// Names matter: the lighting module lights anything called glass, window or curtain after dusk.
let MATS = null;
export function mats() {
  if (MATS) return MATS;
  const flat = (name, color, rough = 0.8, metal = 0) => plain('dorm' + name, color, rough, metal);
  const glassOf = (hex, name, tint, tile) => {
    const s = SURFACES.glazing(hex, 3, 3, [3.6, 3.6], 9), map = s.map.clone(), nm = s.normalMap.clone();
    for (const t of [map, nm]) { t.repeat.set(1 / tile[0], 1 / tile[1]); t.needsUpdate = true; }
    const q = new THREE.MeshStandardMaterial({ map, normalMap: nm, color: tint, roughness: 0.06, metalness: 0.55, envMapIntensity: 1.4 }); q.name = name; return q;
  };
  const clear = new THREE.MeshStandardMaterial({ color: 0xa9cfc8, roughness: 0.05, metalness: 0.3, transparent: true, opacity: 0.28, depthWrite: false, envMapIntensity: 1.4 }); clear.name = 'hifi-dormlobbyglass';
  MATS = {
    tile: mat('wallWhite'), brick: mat('brickRed'), floor: mat('paving'),
    win: glassOf(0x4c6672, 'hifi-dormwindow', 0xffffff, [3.6, 3.0]), cwall: glassOf(0x4c6672, 'hifi-dormcurtainwall', 0xa3b6be, [2.875, 3.0]),
    teal: glassOf(0x3f9a8e, 'hifi-dormtealglass', 0xffffff, [3.9, 3.0]), clear,
    lamp: plain('lamp', 0xfff1d6, 0.4, 0, { emissive: 0xffe2b0, emissiveIntensity: 1.4 }),
    plaster: flat('plaster', 0xf1eee5, 0.9), ceil: flat('ceiling', 0xf3f1ea, 0.92), gwall: flat('gallerywall', 0xefe8d6, 0.88), dado: flat('dado', 0xcbd3bf, 0.7),
    plinth: flat('plinth', 0x5d5b58, 0.55), maroon: flat('maroon', 0x7c2f2b, 0.6), roof: flat('roofdeck', 0xcdbf9e, 0.95), white: flat('whitepaint', 0xf3f2ee, 0.6),
    frame: flat('frame', 0xf0f0ec, 0.45), door: flat('doorleaf', 0x9a6b3f, 0.6), doorDark: flat('doorframe', 0x6a4a31, 0.6), pvc: flat('pvc', 0xdcd9d0, 0.7),
    ac: flat('acunit', 0xe9e8e3, 0.55), dark: flat('darkpart', 0x2a2c2f, 0.6), concrete: flat('concrete', 0xb7b4ab, 0.92), tread: flat('tread', 0xaaa69c, 0.75), nosing: flat('nosing', 0x4a4a48, 0.8),
    inox: flat('inox', 0xcdd1d5, 0.3, 0.9), blue: flat('tankblue', 0x8fc4e6, 0.5), solar: flat('solar', 0x1d2740, 0.3), stone: flat('stonestep', 0xa9a49a, 0.8),
    red: flat('red', 0xb8322a, 0.6), green: flat('green', 0x3d8a55, 0.7), basin: flat('basin', 0xf6f6f4, 0.3),
  };
  return MATS;
}

// Draw-call saver: every plain-coloured, untextured, opaque part of a group becomes one mesh with vertex colours (two:
// one for painted things, one for bare metal).
let FLAT = null, INOX = null;
const isFlat = t => !t.map && !t.transparent && !(t.alphaTest > 0) && !/glass|window|curtain/i.test(t.name) && t.emissiveIntensity * (t.emissive.r + t.emissive.g + t.emissive.b) < 0.3;
export function mergeFlat(group, castShadow) {
  if (!FLAT) {
    FLAT = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.8, metalness: 0.02 }); FLAT.name = 'hifi-dormflat';
    INOX = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.32, metalness: 0.9 }); INOX.name = 'hifi-dorminox';
  }
  for (const [metal, material] of [[false, FLAT], [true, INOX]]) {
    const take = group.children.filter(q => q.isMesh && !q.isInstancedMesh && isFlat(q.material) && (q.material.metalness > 0.5) === metal);
    if (!take.length) continue;
    let nv = 0, ni = 0; for (const q of take) { nv += q.geometry.attributes.position.count; ni += q.geometry.index.count; }
    const pos = new Float32Array(nv * 3), nor = new Float32Array(nv * 3), colr = new Float32Array(nv * 3), idx = new Uint32Array(ni);
    let v0 = 0, i0 = 0;
    for (const q of take) {
      const g = q.geometry, n = g.attributes.position.count, c = q.material.color, ix = g.index.array;
      pos.set(g.attributes.position.array, v0 * 3); nor.set(g.attributes.normal.array, v0 * 3);
      for (let i = 0; i < n; i++) { colr[(v0 + i) * 3] = c.r; colr[(v0 + i) * 3 + 1] = c.g; colr[(v0 + i) * 3 + 2] = c.b; }
      for (let i = 0; i < ix.length; i++) idx[i0 + i] = ix[i] + v0;
      v0 += n; i0 += ix.length; group.remove(q); g.dispose();
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.BufferAttribute(nor, 3)); g.setAttribute('color', new THREE.BufferAttribute(colr, 3));
    g.setIndex(new THREE.BufferAttribute(idx, 1));
    const mesh = new THREE.Mesh(g, material); mesh.castShadow = castShadow; mesh.receiveShadow = true; group.add(mesh);
  }
  return group;
}

/** Quads with their own texture coordinates (cut-out letters, soft dirt, cards of an atlas), all in one mesh. */
export class Quads {
  constructor(material) { this.material = material; this.pos = []; this.nor = []; this.uv = []; this.idx = []; }
  /** Corners in world coordinates as the reader sees them (bottom-left, bottom-right, top-right, top-left); r = [u0, v0, u1, v1]. */
  add(bl, br, tr, tl, r) {
    const n = new THREE.Vector3().subVectors(br, bl).cross(new THREE.Vector3().subVectors(tl, bl)).normalize(), base = this.pos.length / 3;
    for (const [p, u, v] of [[bl, r[0], r[1]], [br, r[2], r[1]], [tr, r[2], r[3]], [tl, r[0], r[3]]]) { this.pos.push(p.x, p.y, p.z); this.nor.push(n.x, n.y, n.z); this.uv.push(u, v); }
    this.idx.push(base, base + 1, base + 2, base, base + 2, base + 3);
  }
  build(name) {
    if (!this.idx.length) return null;
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(this.pos, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(this.nor, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(this.uv, 2)); g.setIndex(this.idx);
    const mesh = new THREE.Mesh(g, this.material); mesh.name = name; mesh.receiveShadow = true; return mesh;
  }
}

// Soft dirt: streaks that run down from an edge and fade, over faint blotches. Alpha only; tiles along u.
let GRIME = null;
function grime() {
  if (GRIME) return GRIME;
  const W = 256, Hh = 128, c = document.createElement('canvas'); c.width = W; c.height = Hh;
  const g = c.getContext('2d'), im = g.createImageData(W, Hh), r = rng(4711), raw = Array.from({ length: W }, () => r()), len = new Float32Array(W);
  for (let x = 0; x < W; x++) len[x] = 0.5 * raw[x] + 0.25 * (raw[(x + 1) % W] + raw[(x + W - 1) % W]) + 0.35 * Math.sin(x / W * 6.283 * 3 + 1) * Math.sin(x / W * 6.283 * 7);
  for (let y = 0; y < Hh; y++) for (let x = 0; x < W; x++) {
    const t = y / Hh, s = Math.max(0, len[x] * 1.5 - t * 2.2), blot = 0.5 + 0.5 * Math.sin(x / W * 6.283 * 2 + 3 * Math.sin(t * 5)) * Math.cos(t * 7 + x / W * 6.283), o = (y * W + x) * 4;
    im.data[o] = 92; im.data[o + 1] = 86; im.data[o + 2] = 76; im.data[o + 3] = Math.min(150, 255 * (0.42 * s + 0.07 * blot * (1 - 0.5 * t)));
  }
  g.putImageData(im, 0, 0);
  const t = new THREE.CanvasTexture(c); t.wrapS = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace;
  GRIME = new THREE.MeshStandardMaterial({ map: t, transparent: true, depthWrite: false, roughness: 1, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -4 }); GRIME.name = 'hifi-dormgrime';
  return GRIME;
}

// Cut-out characters for the fascia and the entrance signs: one small atlas, white glyphs tinted by the material.
const GLYPH_TEXT = '面向现代化世界未来学生公寓栋一二三四';
let GLYPHS = null;
function glyphs() {
  if (GLYPHS) return GLYPHS;
  const chars = [...GLYPH_TEXT], S = 128, cols = 9, rows = Math.ceil(chars.length / cols), c = document.createElement('canvas'); c.width = cols * S; c.height = rows * S;
  const g = c.getContext('2d'); g.font = `bold ${Math.round(S * 0.84)}px ${CJK}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = g.strokeStyle = '#ffffff'; g.lineWidth = S * 0.03; g.lineJoin = 'round';
  chars.forEach((ch, i) => { const x = (i % cols + 0.5) * S, y = (Math.floor(i / cols) + 0.5) * S + S * 0.04; g.fillText(ch, x, y); g.strokeText(ch, x, y); });
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  const red = new THREE.MeshStandardMaterial({ map: t, color: 0xc0261e, alphaTest: 0.4, roughness: 0.55 }); red.name = 'hifi-dormletters';
  const uv = ch => { const i = chars.indexOf(ch), cx = i % cols, cy = Math.floor(i / cols); return [cx / cols, 1 - (cy + 1) / rows, (cx + 1) / cols, 1 - cy / rows]; };
  return (GLYPHS = { red, uv });
}

export function build(item, ctx) {
  const P = plan(item, ctx.campus), { f, L, D, H, streetNorth, col, xa, xb, back, court, gx, yF, yDeck, sections, stairs, bridge, level, zAt, isOpen } = P;
  const low = !!ctx.lowPower, sp = SPECIAL[item.id] || {}, m = mats(), rnd = rng(seedOf(item.id)), canvasOk = typeof document !== 'undefined';
  const FM = new THREE.Matrix4().makeRotationY(f.angle).setPosition(f.ox, 0, f.oz);
  const newBatch = () => new Batch().setMatrix(FM);
  const v = newBatch(), ex = newBatch(), c = newBatch();          // shell (always drawn), exterior fittings (middle range), colliders
  const tiers = new Map();                                        // per section: interiors and fine objects, shown only from near
  const tier = s => { if (!tiers.has(s)) tiers.set(s, { fu: newBatch(), fx: newBatch() }); return tiers.get(s); };
  const dirt = canvasOk ? new Quads(grime()) : null, letters = canvasOk ? new Quads(glyphs().red) : null;

  // ---- drawing helpers. Faces: W E (along the block), F K (street side, courtyard side), U D. ----
  const skips = {};
  const skipOf = faces => skips[faces] ?? (skips[faces] = [...'EWUDSN'].filter(q => !faces.includes(q === 'N' ? (streetNorth ? 'F' : 'K') : q === 'S' ? (streetNorth ? 'K' : 'F') : q)).join(''));
  const box = (b, material, x0, x1, d0, d1, y0, y1, faces = 'WEFKUD') => { if (x1 - x0 > 1e-4 && d1 - d0 > 1e-4 && y1 - y0 > 1e-4) b.slab(material, x0, y0, streetNorth ? d0 : D - d1, x1 - x0, y1 - y0, d1 - d0, skipOf(faces)); };
  const hit = (x0, x1, d0, d1, y0, y1) => box(c, 'generic', x0, x1, d0, d1, y0, y1);
  const W3 = (x, d, y) => new THREE.Vector3(x, y, zAt(d)).applyMatrix4(FM);
  const rod = (b, material, p, q, t = 0.04) => { b.strut(material, W3(...p).toArray(), W3(...q).toArray(), t); b.setMatrix(FM); };
  const cyl = (b, material, x, d, y0, r, h, seg = 12, caps = true) => b.cyl(material, x, y0, zAt(d), r, h, seg, caps);
  /** Flat quad from four [x, d, y] corners, made to face the direction n = [nx, nd, ny]. */
  const quad = (b, material, p, n) => {
    const q = p.map(a => [a[0], a[2], zAt(a[1])]), nz = streetNorth ? n[1] : -n[1];
    const e1 = [q[1][0] - q[0][0], q[1][1] - q[0][1], q[1][2] - q[0][2]], e2 = [q[3][0] - q[0][0], q[3][1] - q[0][1], q[3][2] - q[0][2]];
    const cr = [e1[1] * e2[2] - e1[2] * e2[1], e1[2] * e2[0] - e1[0] * e2[2], e1[0] * e2[1] - e1[1] * e2[0]];
    if (cr[0] * n[0] + cr[1] * n[2] + cr[2] * nz < 0) b.quad(material, q[0], q[3], q[2], q[1]); else b.quad(material, ...q);
  };
  /** Slab whose TOP runs from (dA, yA) to (dB, yB) between x0 and x1; skip: Batch face letters to leave out (U D top/bottom, E W sides, S N ends). */
  const incl = (b, material, x0, x1, dA, yA, dB, yB, th, skip = '') => {
    const zA = zAt(dA), zB = zAt(dB), [zn, yn, zs, ys] = zA < zB ? [zA, yA, zB, yB] : [zB, yB, zA, yA], len = Math.hypot(zs - zn, ys - yn), ang = Math.atan2(yn - ys, zs - zn);
    const R = new THREE.Matrix4().makeRotationX(ang).setPosition((x0 + x1) / 2, (yn + ys) / 2 - Math.cos(ang) * th / 2, (zn + zs) / 2 - Math.sin(ang) * th / 2);
    b.setMatrix(FM.clone().multiply(R)); b.box(material, 0, 0, 0, x1 - x0, th, len, skip); b.setMatrix(FM);
  };
  /** The same along the block: a slab whose top runs from (xA, yA) to (xB, yB) between depths d0 and d1. */
  const inclX = (b, material, d0, d1, xA, yA, xB, yB, th, skip = '') => {
    const [x0, y0, x1, y1] = xA < xB ? [xA, yA, xB, yB] : [xB, yB, xA, yA], len = Math.hypot(x1 - x0, y1 - y0), ang = Math.atan2(y1 - y0, x1 - x0);
    const R = new THREE.Matrix4().makeRotationZ(ang).setPosition((x0 + x1) / 2 + Math.sin(ang) * th / 2, (y0 + y1) / 2 - Math.cos(ang) * th / 2, (streetNorth ? d0 : D - d1) + (d1 - d0) / 2);
    b.setMatrix(FM.clone().multiply(R)); b.box(material, 0, 0, 0, len, th, d1 - d0, skip); b.setMatrix(FM);
  };
  /**
   * Wall with rectangular openings. ax 'x': runs along the block from u0 to u1, t0..t1 = its depth range; ax 'd': runs
   * across the block, t0..t1 = its x range. mA faces the low-t side (street side F, or west W), mB the other; either
   * may be null. ops: [{ a, b, y0, y1 }]. The pieces show their reveals. No colliders.
   */
  const wall = (b, ax, u0, u1, t0, t1, y0, y1, ops, mA, mB) => {
    const lo = ax === 'x' ? 'F' : 'W', hi = ax === 'x' ? 'K' : 'E', e0 = ax === 'x' ? 'W' : 'F', e1 = ax === 'x' ? 'E' : 'K';
    const put = (a, bb, ya, yb, extra) => {
      if (bb - a < 1e-4 || yb - ya < 1e-4) return;
      const q = ax === 'x' ? [a, bb, t0, t1] : [t0, t1, a, bb];
      if (mA) box(b, mA, ...q, ya, yb, lo + extra); if (mB) box(b, mB, ...q, ya, yb, hi + (mA ? '' : extra));
    };
    let u = u0; const list = (ops || []).slice().sort((p, q) => p.a - q.a);
    list.forEach((o, i) => { put(u, o.a, y0, y1, e1 + (i ? e0 : '')); put(o.a, o.b, y0, o.y0, 'U'); put(o.a, o.b, o.y1, y1, 'D'); u = o.b; });
    put(u, u1, y0, y1, list.length ? e0 : '');
  };
  /** Glass in an opening: a thin sheet at t, both faces. */
  const pane = (b, ax, a, bb, ya, yb, t, material) => (ax === 'x' ? box(b, material, a, bb, t - 0.008, t + 0.008, ya, yb, 'FK') : box(b, material, t - 0.008, t + 0.008, a, bb, ya, yb, 'WE'));
  /** Frame of an opening between t0 and t1: four bars, `mull` uprights, a transom at height `transom`. */
  const frame = (b, ax, a, bb, ya, yb, t0, t1, material, mull = 0, transom = 0, w = 0.05) => {
    const bar = (p, q, y0, y1) => (ax === 'x' ? box(b, material, p, q, t0, t1, y0, y1) : box(b, material, t0, t1, p, q, y0, y1));
    bar(a, bb, ya, ya + w); bar(a, bb, yb - w, yb); bar(a, a + w, ya + w, yb - w); bar(bb - w, bb, ya + w, yb - w);
    for (let i = 1; i <= mull; i++) { const u = a + (bb - a) * i / (mull + 1); bar(u - w / 2, u + w / 2, ya + w, yb - w); }
    if (transom) bar(a + w, bb - w, transom - w / 2, transom + w / 2);
  };
  /** Collider of a wall along the block with door openings [[a, b, height]]: full-height strips and lintels. */
  const hitX = (x0, x1, d0, d1, y, doors = [], top = CEIL) => {
    let x = x0 + 0.005;
    for (const [a, b, h] of doors) { hit(x, a, d0, d1, y + 0.02, y + top - 0.02); hit(a + 0.005, b - 0.005, d0, d1, y + h, y + top - 0.02); x = b; }
    hit(x, x1 - 0.005, d0, d1, y + 0.02, y + top - 0.02);
  };
  /** Upright card of a Quads set: centre (x, d, y), facing (fx, fd) in plan, w by h, texture rectangle r. */
  const card = (Q, r, x, d, y, fx, fd, w, h) => {
    if (!Q) return;
    const nz = streetNorth ? fd : -fd, rx = nz, rz = -fx, z = zAt(d);
    const at = (sx, sy) => new THREE.Vector3(x + rx * sx * w / 2, y + sy * h / 2, z + rz * sx * w / 2).applyMatrix4(FM);
    Q.add(at(-1, -1), at(1, -1), at(1, 1), at(-1, 1), r);
  };
  /** Dirt on a street-side (fd -1) or courtyard-side (fd 1) wall face at depth d: streaks from the top edge unless `up`. */
  const stain = (x0, x1, d, y0, y1, fd, strength = 1, up = false) => {
    const u = rnd() * 4, v0 = 1 - Math.min(1, 0.45 + 0.55 * strength);
    card(dirt, up ? [u, 1, u + (x1 - x0) / 5, 0.25] : [u, v0, u + (x1 - x0) / 5, 1], (x0 + x1) / 2, d + fd * 0.012, (y0 + y1) / 2, 0, fd, x1 - x0, y1 - y0);
  };

  // ================= base: a dark plinth 0.3 m high under the whole block, a step along the courtyard =================
  const xG1 = bridge ? L - FACE : xb;                                     // east end of the galleries
  box(v, m.plinth, FACE, L - FACE, FACE, gx, 0, BASE, 'WEFK'); hit(FACE, L - FACE, FACE, gx, -0.2, BASE);
  box(v, m.stone, FACE, L - FACE, gx, gx + 0.32, 0, BASE / 2, 'UKWE'); incl(c, 'generic', FACE, L - FACE, gx + 0.38, 0, gx - 0.02, BASE + 0.01, 0.2);
  { const en = sections.find(s => s.kind === 'common' && s.lobby), xm = en ? (en.x0 + en.x1) / 2 : 0, x1 = col ? L - col : L - FACE;   // base course on the street face
    if (en) { box(v, m.plinth, FACE, xm - 3.0, FACE - 0.03, FACE, 0, 0.55, 'FUWE'); box(v, m.plinth, xm + 3.0, x1, FACE - 0.03, FACE, 0, 0.55, 'FUWE'); } else box(v, m.plinth, FACE, x1, FACE - 0.03, FACE, 0, 0.55, 'FUWE'); }
  if (bridge) { box(v, m.stone, L - FACE, L - FACE + 0.32, court, gx, 0, BASE / 2, 'UEFK'); inclX(c, 'generic', court + 0.01, gx - 0.01, L - FACE - 0.02, BASE + 0.01, L - FACE + 0.38, 0, 0.2); }

  // ================= floor plates (colliders), roof =================
  const lobbySec = sections.find(s => s.kind === 'lobby'), gd = FACE + PORCH;                                   // the glass wall behind the colonnade
  for (let k = 1; k < FLOORS; k++) for (const s of sections) {
    const y = level(k);
    if (s.kind === 'stair') hit(s.x0 + 0.005, s.x1 - 0.005, s.st.zl, gx - 0.01, y - SLAB, y);
    else hit(s.x0 + 0.005, s.x1 - 0.005, s.kind === 'lobby' ? gd : FACE + 0.01, gx - 0.01, y - SLAB, y);
  }
  box(v, m.roof, 0.3, L - 0.3, 0.3, D - 0.3, yDeck - 0.05, yDeck, 'U'); hit(0.31, L - 0.31, 0.31, D - 0.31, yDeck - 0.3, yDeck);
  // fascia: a white band standing out to the roof outline on all four sides; its inner faces are the roof parapet
  const xF1 = col ? L - col : L, yFa = yF - 0.3;
  box(v, m.tile, 0, xF1, 0, 0.3, yFa, H, 'FKUDWE'); box(v, m.tile, 0, L, D - 0.3, D, yFa, H, 'FKUDWE');
  box(v, m.tile, 0, 0.3, 0.3, D - 0.3, yFa, H, 'WEUD'); box(v, m.tile, L - 0.3, L, col ? 6.0 : 0.3, D - 0.3, yFa, H, 'WEUD');
  hit(0, xF1, 0, 0.3, yDeck + 0.01, H); hit(0, L, D - 0.3, D, yDeck + 0.01, H); hit(0, 0.3, 0.31, D - 0.31, yDeck + 0.01, H); hit(L - 0.3, L, col ? 6.0 : 0.31, D - 0.31, yDeck + 0.01, H);
  for (let x = 0; x < xF1 - 0.5; x += 9.6) stain(x, Math.min(xF1, x + 9.6), 0, yFa, H, -1, 0.9);
  for (let x = 0; x < L - 0.5; x += 9.6) stain(x, Math.min(L, x + 9.6), D, yFa, H, 1, 0.9);

  // ================= end walls: white, two slot windows per floor =================
  const endWall = (x0, x1, out, openGallery) => {
    const inn = out === 'W' ? 'E' : 'W';
    for (let k = 0; k < FLOORS; k++) {
      const y = level(k), ops = [0.3, 0.64].map(t => ({ a: FACE + (court - FACE) * t - 0.65, b: FACE + (court - FACE) * t + 0.65, y0: y + 1.75, y1: y + 2.2 }));
      wall(v, 'd', FACE, court, x0, x1, y, y + FH, ops, out === 'W' ? m.tile : null, out === 'E' ? m.tile : null);
      for (const o of ops) {
        pane(v, 'd', o.a, o.b, o.y0, o.y1, out === 'W' ? x0 + 0.1 : x1 - 0.1, m.win);
        frame(ex, 'd', o.a, o.b, o.y0, o.y1, out === 'W' ? x0 + 0.06 : x1 - 0.12, out === 'W' ? x0 + 0.12 : x1 - 0.06, m.frame, 1);
        box(ex, m.white, out === 'W' ? x0 - 0.05 : x1 - 0.1, out === 'W' ? x0 + 0.1 : x1 + 0.05, o.a - 0.05, o.b + 0.05, o.y0 - 0.05, o.y0, 'UDFK' + out);
      }
      if (openGallery) box(v, m.gwall, x0, x1, court - 0.02, court, y, y + CEIL, 'K');
      else { box(v, m.tile, x0, x1, court, gx, y, y + FH, out + 'K'); box(v, m.gwall, x0, x1, court, gx - 0.12, y, y + CEIL, inn); }
    }
    hit(x0, x1, FACE + 0.01, openGallery ? court - 0.01 : gx - 0.01, BASE + 0.02, yF);
  };
  endWall(FACE, xa, 'W', false);
  endWall(xb, L - FACE, 'E', !!bridge);

  // ================= sections =================
  const slotOf = (s, k) => { const xm = (s.x0 + s.x1) / 2, y = level(k); return { a: xm - 0.65, b: xm + 0.65, y0: y + 1.75, y1: y + 2.2 }; };
  /** Street face of a white bay: wall with one slot window per floor. inner: material of its inside face (enterable bays). */
  const whiteBay = (s, inner = null) => {
    for (let k = 0; k < FLOORS; k++) {
      const y = level(k), o = slotOf(s, k);
      wall(v, 'x', s.x0, s.x1, FACE, FACE + WALL, y, y + FH, [o], m.tile, inner);
      pane(v, 'x', o.a, o.b, o.y0, o.y1, FACE + 0.12, m.win); frame(ex, 'x', o.a, o.b, o.y0, o.y1, FACE + 0.08, FACE + 0.14, m.frame, 1);
      box(ex, m.white, o.a - 0.05, o.b + 0.05, FACE - 0.05, FACE + 0.08, o.y0 - 0.05, o.y0, 'FUDWE');
      stain(o.a - 0.1, o.b + 0.1, FACE, o.y0 - 1.3, o.y0 - 0.05, -1, 0.75);
    }
    stain(s.x0, s.x1, FACE, 0.55, 1.5, -1, 0.6, true);
    hit(s.x0 + 0.005, s.x1 - 0.005, FACE, FACE + WALL, BASE + 0.02, yF);
  };
  /** Gallery wall of a section on storey k with openings; doors: [[a, b, height]] left open for the walker. */
  const galleryWall = (s, k, ops, inner, doors) => {
    const y = level(k);
    wall(v, 'x', s.x0, s.x1, court - WALL, court, y, y + CEIL, ops, inner, m.gwall);
    let x = s.x0;                                                         // dado between the door openings
    for (const o of [...ops.filter(q => q.y0 < y + 0.2).sort((p, q) => p.a - q.a), { a: s.x1 }]) { box(v, m.dado, x, o.a, court, court + 0.006, y, y + 1.15, 'KU'); x = o.b; }
    hitX(s.x0, s.x1, court - WALL, court, y, doors);
  };
  /** Closed door leaf in a gallery wall opening, with its frame. */
  const closedDoor = (a, b, y, h = 2.1, double = false) => {
    box(v, m.door, a + 0.04, b - 0.04, court - 0.13, court - 0.09, y, y + h, 'K'); frame(ex, 'x', a, b, y - 0.04, y + h + 0.04, court - 0.16, court - 0.04, m.doorDark, double ? 1 : 0, 0, 0.045);
    box(ex, m.inox, double ? (a + b) / 2 - 0.16 : b - 0.2, double ? (a + b) / 2 - 0.12 : b - 0.08, court - 0.09, court - 0.04, y + 0.98, y + 1.02); if (double) box(ex, m.inox, (a + b) / 2 + 0.12, (a + b) / 2 + 0.16, court - 0.09, court - 0.04, y + 0.98, y + 1.02);
  };
  /** Interior shell of an enterable space: floor finish and ceiling. */
  const floorCeil = (x0, x1, d0, d1, y, top = CEIL) => { box(v, m.floor, x0, x1, d0, d1, y - 0.02, y, 'U'); box(v, m.ceil, x0, x1, d0, d1, y + top, y + top + 0.02, 'D'); };

  const acAt = (x, y) => {                                                // outdoor unit on two brackets, on the pier face
    box(ex, m.ac, x - 0.39, x + 0.39, FACE - 0.36, FACE - 0.06, y, y + 0.52, 'FWEUD'); box(ex, m.dark, x - 0.3, x + 0.1, FACE - 0.364, FACE - 0.36, y + 0.07, y + 0.45, 'F');
    for (const sx of [-0.3, 0.27]) box(ex, m.inox, x + sx, x + sx + 0.03, FACE - 0.38, FACE, y - 0.04, y, 'FWED');
    box(ex, m.pvc, x + 0.3, x + 0.34, FACE - 0.06, FACE, y + 0.3, y + 0.34, 'WEUD');
  };
  const WASH = [0xf4f4f0, 0xf4f4f0, 0xeef1f6, 0x27407a, 0x27407a, 0x5a86c2, 0xd8d8d2, 0xb9382f, 0xe6c84a, 0x6aa67c, 0xe7a4b4, 0x3a3d44];

  for (const s of sections) {
    if (s.kind === 'end') {
      // ---- closed service room: white bay, one closed door on the gallery ----
      whiteBay(s);
      const xm = (s.x0 + s.x1) / 2;
      for (let k = 0; k < FLOORS; k++) { galleryWall(s, k, [{ a: xm - 0.45, b: xm + 0.45, y0: level(k), y1: level(k) + 2.1 }], null, []); closedDoor(xm - 0.45, xm + 0.45, level(k)); }
    } else if (s.kind === 'rooms') {
      for (let k = 0; k < FLOORS; k++) box(v, m.ceil, s.x0, s.x1, FACE, back, level(k) + CEIL, level(k) + CEIL + 0.02, 'D');     // balcony ceilings
      for (const r of s.rooms) {
        const pc = (r.px0 + r.px1) / 2;
        hit(r.px0 + 0.005, r.px1 - 0.005, FACE, back + WALL, BASE + 0.02, yF);                                // the wet cell is closed
        if (r.j < s.n - 1) hit(r.x1 - 0.1, r.x1 + 0.1, back + WALL + 0.01, court - WALL - 0.01, BASE + 0.02, yF);   // party wall
        if (r.wetW && r.j < s.n - 1) {                                                                        // fin between two balconies: the white post
          box(v, m.tile, r.x1 - 0.06, r.x1 + 0.06, FACE, back, BASE, yF - SLAB, 'WEF'); hit(r.x1 - 0.05, r.x1 + 0.05, FACE + 0.11, back - 0.01, BASE + 0.02, yF);
        }
        stain(r.px0, r.px1, FACE, level(1), yFa, -1, 0.35 + 0.5 * rnd());
        box(ex, m.pvc, (r.wetW ? r.px0 : r.px1) - 0.035, (r.wetW ? r.px0 : r.px1) + 0.035, FACE - 0.1, FACE - 0.03, 0.4, yFa, 'FWE');   // drain stack on the pier
        for (let k = 0; k < FLOORS; k++) {
          const y = level(k), open = isOpen(k, r), ww = { a: pc - 0.3, b: pc + 0.3, y0: y + 1.45, y1: y + 2.25 };
          // brick pier half with the wet cell's window; the brick flank toward the balcony
          wall(v, 'x', r.px0, r.px1, FACE, FACE + WALL, y, y + FH, [ww], m.brick, null);
          pane(v, 'x', ww.a, ww.b, ww.y0, ww.y1, FACE + 0.11, m.win); frame(ex, 'x', ww.a, ww.b, ww.y0, ww.y1, FACE + 0.07, FACE + 0.13, m.frame, 0, ww.y0 + 0.5, 0.045);
          box(ex, m.white, ww.a - 0.05, ww.b + 0.05, FACE - 0.05, FACE + 0.07, ww.y0 - 0.05, ww.y0, 'FUDWE');
          box(v, m.brick, r.wetW ? r.px1 - 0.12 : r.px0, r.wetW ? r.px1 : r.px0 + 0.12, FACE + WALL, back, y, y + CEIL, r.wetW ? 'E' : 'W');
          const xfl = r.wetW ? r.px1 : r.px0, fs = r.wetW ? 1 : -1;                                           // the wet cell's door on the flank
          box(ex, m.pvc, Math.min(xfl, xfl + fs * 0.025), Math.max(xfl, xfl + fs * 0.025), FACE + 0.4, FACE + 1.1, y + 0.02, y + 2.0, (r.wetW ? 'E' : 'W') + 'FKU');
          if (rnd() < 0.86) acAt(pc, y + 0.74);
          // balcony: front upstand with a rail, floor, back wall with a glazed door and a window
          box(v, m.tile, r.bx0, r.bx1, FACE, FACE + 0.1, y - SLAB, y + 0.95, 'FKU'); hit(r.bx0 + 0.005, r.bx1 - 0.005, FACE, FACE + 0.1, y + 0.02, y + 2.0);
          stain(r.bx0, r.bx1, FACE, y - SLAB, y + 0.95, -1, 0.3 + 0.6 * rnd());
          box(ex, m.inox, r.bx0, r.bx1, FACE + 0.03, FACE + 0.07, y + 1.07, y + 1.11); for (const t of [0.25, 0.75]) box(ex, m.inox, r.bx0 + (r.bx1 - r.bx0) * t - 0.015, r.bx0 + (r.bx1 - r.bx0) * t + 0.015, FACE + 0.035, FACE + 0.065, y + 0.95, y + 1.07, 'WEFK');
          box(v, m.floor, r.bx0, r.bx1, FACE + 0.1, back, y - 0.02, y, 'U');
          const bd = { a: r.bdoor[0], b: r.bdoor[1], y0: y, y1: y + 2.1 }, bw = { a: r.bwin[0], b: r.bwin[1], y0: y + 0.9, y1: y + 2.1 };
          wall(v, 'x', r.bx0, r.bx1, back, back + WALL, y, y + CEIL, [bd, bw], m.maroon, open ? m.plaster : null);
          pane(v, 'x', bw.a, bw.b, bw.y0, bw.y1, back + 0.1, m.win); frame(ex, 'x', bw.a, bw.b, bw.y0, bw.y1, back + 0.06, back + 0.12, m.frame, 1);
          if (open) {
            hitX(r.bx0, r.bx1, back, back + WALL, y, [[bd.a, bd.b, 2.1]]);
            const ha = r.wetW ? bd.a - 0.84 : bd.b, hb = r.wetW ? bd.a : bd.b + 0.84;                          // the open leaf lies against the wall inside
            pane(v, 'x', ha + 0.03, hb - 0.03, y + 0.05, y + 2.05, back + WALL + 0.03, m.win); frame(ex, 'x', ha, hb, y + 0.02, y + 2.08, back + WALL + 0.01, back + WALL + 0.05, m.frame, 0, y + 1.0);
            frame(ex, 'x', bd.a - 0.04, bd.b + 0.04, y - 0.04, y + 2.14, back + 0.04, back + 0.14, m.frame);
            box(v, m.plaster, r.px0, r.px1, back, back + WALL, y, y + CEIL, 'K');
            // the room's shell: floor, ceiling, the two party walls
            floorCeil(r.x0 + 0.1, r.x1 - 0.1, back + WALL, court - WALL, y);
            box(v, m.plaster, r.x0 - 0.1, r.x0 + 0.1, back + WALL, court - WALL, y, y + CEIL, 'E'); box(v, m.plaster, r.x1 - 0.1, r.x1 + 0.1, back + WALL, court - WALL, y, y + CEIL, 'W');
          } else {
            hit(r.bx0 + 0.005, r.bx1 - 0.005, back, back + WALL, y + 0.02, y + CEIL - 0.02);
            pane(v, 'x', bd.a, bd.b, bd.y0, bd.y1, back + 0.1, m.win); frame(ex, 'x', bd.a, bd.b, bd.y0, bd.y1, back + 0.06, back + 0.12, m.frame, 0, y + 1.0);
          }
          // drying rails under the balcony ceiling, with washing
          for (const dd of [0.5, 0.9]) box(ex, m.inox, r.bx0 + 0.12, r.bx1 - 0.12, FACE + dd - 0.012, FACE + dd + 0.012, y + 2.5, y + 2.524);
          if (!low) for (let q = 0, n = Math.floor(rnd() * 5.5), xw = r.bx0 + 0.3 + rnd() * 0.2; q < n && xw < r.bx1 - 0.45; q++) {
            const w = 0.36 + rnd() * 0.16, hgt = 0.45 + rnd() * 0.4, dd = rnd() < 0.7 ? 0.5 : 0.9, colr = WASH[Math.floor(rnd() * WASH.length)];
            box(ex, plain('dormwash' + colr, colr, 0.9), xw, xw + w, FACE + dd - 0.012, FACE + dd + 0.012, y + 2.44 - hgt, y + 2.44);
            box(ex, m.dark, xw + w / 2 - 0.012, xw + w / 2 + 0.012, FACE + dd - 0.006, FACE + dd + 0.006, y + 2.44, y + 2.5, 'FKWE');
            xw += w + 0.06 + rnd() * 0.3;
          }
          // gallery side: door with a glazed transom, a high window; open rooms have their leaf swung in
          const gdoor = { a: r.door[0], b: r.door[1], y0: y, y1: y + 2.6 }, gw = { a: r.win[0], b: r.win[1], y0: y + 1.55, y1: y + 2.45 };
          galleryWall({ x0: r.x0, x1: r.x1 }, k, [gdoor, gw], open ? m.plaster : null, open ? [[gdoor.a, gdoor.b, 2.6]] : []);
          pane(v, 'x', gw.a, gw.b, gw.y0, gw.y1, court - 0.1, m.win); frame(ex, 'x', gw.a, gw.b, gw.y0, gw.y1, court - 0.14, court - 0.06, m.frame, 1);
          pane(v, 'x', gdoor.a, gdoor.b, y + 2.15, y + 2.6, court - 0.1, m.win); frame(ex, 'x', gdoor.a, gdoor.b, y - 0.04, y + 2.6, court - 0.15, court - 0.05, m.doorDark, 0, y + 2.12, 0.045);
          if (open) box(v, m.door, gdoor.a + 0.05, gdoor.a + 0.09, court - WALL - 0.9, court - WALL, y + 0.01, y + 2.08, 'WEFU');
          else { box(v, m.door, gdoor.a + 0.045, gdoor.b - 0.045, court - 0.13, court - 0.09, y, y + 2.1, 'K'); box(ex, m.inox, gdoor.b - 0.2, gdoor.b - 0.08, court - 0.09, court - 0.04, y + 0.98, y + 1.02); }
        }
      }
    } else if (s.kind === 'stair') {
      whiteBay(s);
    } else if (s.kind === 'wash') {
      whiteBay(s, m.white);
      const xm = (s.x0 + s.x1) / 2;
      for (let k = 0; k < FLOORS; k++) {
        const y = level(k);
        galleryWall(s, k, [{ a: xm - 0.6, b: xm + 0.6, y0: y, y1: y + 2.2 }], m.white, [[xm - 0.6, xm + 0.6, 2.2]]);
        floorCeil(s.x0 + 0.1, s.x1 - 0.1, FACE + WALL, court - WALL, y);
      }
    } else if (s.kind === 'common') {
      // ---- dark glazing between white floor bands, set back a little; the entrance lobby on the ground floor (not in block A north) ----
      const g0 = FACE + RECESS, xm = (s.x0 + s.x1) / 2, nb = Math.max(4, Math.round((s.x1 - s.x0) / 1.44)), bw = (s.x1 - s.x0) / nb;
      const dA = [s.x0 + 1.4, s.x0 + 3.0], dB = [s.x1 - 3.0, s.x1 - 1.4], wins = [[xm - 2.4, xm - 0.4], [xm + 0.4, xm + 2.4]];
      for (let k = 0; k < FLOORS; k++) {
        const y = level(k), entry = k === 0 && s.lobby, glass = entry ? m.clear : m.cwall;
        if (entry) { box(v, m.tile, s.x0, xm - 1.2, FACE + 0.06, g0, y, y + 0.12, 'FUE'); box(v, m.tile, xm + 1.2, s.x1, FACE + 0.06, g0, y, y + 0.12, 'FUW'); }
        else box(v, m.tile, s.x0, s.x1, FACE + 0.06, g0, y - 0.45, y + 0.12, 'FUD');                           // floor band
        if (entry) { pane(v, 'x', s.x0, xm - 1.2, y + 0.12, y + CEIL, g0, glass); pane(v, 'x', xm + 1.2, s.x1, y + 0.12, y + CEIL, g0, glass); pane(v, 'x', xm - 1.2, xm + 1.2, y + 2.4, y + CEIL, g0, glass); }
        else pane(v, 'x', s.x0, s.x1, y + 0.12, y + CEIL, g0, glass);
        for (let i = 1; i < nb; i++) { const xq = s.x0 + i * bw; if (!entry || Math.abs(xq - xm) > 1.25) box(v, m.frame, xq - 0.03, xq + 0.03, g0 - 0.12, g0 + 0.04, y + 0.12, y + CEIL, 'FWEK'); }
        box(v, m.frame, s.x0, s.x1, g0 - 0.06, g0 + 0.04, y + 2.36, y + 2.44, 'FUDK'); if (!entry) box(v, m.frame, s.x0, s.x1, g0 - 0.06, g0 + 0.04, y + 0.96, y + 1.04, 'FUDK');
        if (entry) { hit(s.x0 + 0.005, xm - 1.2, g0 - 0.04, g0 + 0.06, y + 0.02, y + CEIL - 0.02); hit(xm + 1.2, s.x1 - 0.005, g0 - 0.04, g0 + 0.06, y + 0.02, y + CEIL - 0.02); hit(xm - 1.195, xm + 1.195, g0 - 0.04, g0 + 0.06, y + 2.4, y + CEIL - 0.02); }
        else hit(s.x0 + 0.005, s.x1 - 0.005, FACE, g0 + 0.06, y + 0.02, y + CEIL - 0.02);
        const ops = [dA, dB].map(q => ({ a: q[0], b: q[1], y0: y, y1: y + 2.2 })).concat(wins.map(q => ({ a: q[0], b: q[1], y0: y + 1.0, y1: y + 2.3 })));
        galleryWall(s, k, ops, m.plaster, [[dA[0], dA[1], 2.2], [dB[0], dB[1], 2.2]]);
        for (const q of wins) { pane(v, 'x', q[0], q[1], y + 1.0, y + 2.3, court - 0.1, m.win); frame(ex, 'x', q[0], q[1], y + 1.0, y + 2.3, court - 0.14, court - 0.06, m.frame, 2); }
        for (const q of [dA, dB]) { frame(ex, 'x', q[0] - 0.04, q[1] + 0.04, y - 0.04, y + 2.24, court - 0.16, court - 0.04, m.doorDark, 0, 0, 0.045);      // double doors standing open
          box(v, m.door, q[0], q[0] + 0.04, court - WALL - 0.78, court - WALL, y + 0.01, y + 2.16, 'WEFU'); box(v, m.door, q[1] - 0.04, q[1], court - WALL - 0.78, court - WALL, y + 0.01, y + 2.16, 'WEFU'); }
        floorCeil(s.x0 + 0.1, s.x1 - 0.1, g0, court - WALL, y);
      }
      box(v, m.tile, s.x0, s.x1, FACE + 0.06, g0, yF - 0.45, yF, 'FD');
      stain(s.x0, s.x1, FACE + 0.06, 0.3, 0.42, -1, 0.5, true);
    }
  }

  // ================= walls between the sections =================
  const sideFaces = (s, side, k) => {                                     // what shows of a section's west or east boundary wall, from inside it
    if (s.kind === 'rooms') { const r = side === 'W' ? s.rooms[0] : s.rooms[s.n - 1], out = []; if ((side === 'W') !== r.wetW) out.push([FACE, back, m.tile]); if (isOpen(k, r)) out.push([back + WALL, court - WALL, m.plaster]); return out; }
    if (s.kind === 'stair') return [[s.st.zb, court, m.plaster]];
    if (s.kind === 'common') return [[FACE + RECESS, court - WALL, m.plaster]];
    if (s.kind === 'wash') return [[FACE + WALL, court - WALL, m.white]];
    if (s.kind === 'lobby') return k === 0 ? [[gd, court - WALL, m.plaster]] : [];
    return [];
  };
  for (let i = 0; i < sections.length - 1; i++) {
    const X = sections[i].x1, A = sections[i], B = sections[i + 1];
    for (let k = 0; k < FLOORS; k++) {
      const y = level(k);
      for (const [d0, d1, material] of sideFaces(A, 'E', k)) box(v, material, X - 0.1, X + 0.1, d0, d1, y, y + CEIL, 'W');
      for (const [d0, d1, material] of sideFaces(B, 'W', k)) box(v, material, X - 0.1, X + 0.1, d0, d1, y, y + CEIL, 'E');
    }
    if (A.kind === 'stair') box(v, m.gwall, X - 0.1, X, court - 0.02, court, BASE, yF - SLAB, 'K');
    if (B.kind === 'stair') box(v, m.gwall, X, X + 0.1, court - 0.02, court, BASE, yF - SLAB, 'K');
    hit(X - 0.1, X + 0.1, FACE + WALL + 0.01, court - 0.01, BASE + 0.02, yF);
  }
  for (const s of [sections[0], sections[sections.length - 1]]) if (s.kind !== 'end') {                         // an enterable section against an end wall
    const side = s === sections[0] ? 'W' : 'E', X = side === 'W' ? s.x0 : s.x1;
    for (let k = 0; k < FLOORS; k++) for (const [d0, d1, material] of sideFaces(s, side, k)) box(v, material, X - 0.01, X + 0.01, d0, d1, level(k), level(k) + CEIL, side === 'W' ? 'E' : 'W');
  }

  // ================= galleries on the courtyard side =================
  const colsAt = new Set();
  for (const s of sections) { colsAt.add(+s.x0.toFixed(2)); if (s.kind === 'rooms') for (let j = 2; j < s.n; j += 2) colsAt.add(+(s.x0 + j * s.w).toFixed(2)); if (s.kind === 'common' || s.kind === 'lobby') { const nseg = Math.ceil((s.x1 - s.x0) / 7.4); for (let j = 1; j < nseg; j++) colsAt.add(+(s.x0 + (s.x1 - s.x0) * j / nseg).toFixed(2)); } }
  colsAt.add(+xG1.toFixed(2));
  const colX = [...colsAt].sort((a, b) => a - b).map(x => Math.max(xa + 0.18, Math.min(xG1 - 0.18, x)));
  for (const X of colX) { box(v, m.tile, X - 0.18, X + 0.18, gx - 0.4, gx + 0.02, 0, yF - SLAB, 'WEFK'); hit(X - 0.18, X + 0.18, gx - 0.4, gx + 0.02, BASE + 0.02, yF); }
  for (let k = 0; k < FLOORS; k++) {
    const y = level(k);
    box(v, m.floor, xa, xG1, court, gx - (k ? 0.12 : 0), y - 0.02, y, 'U'); box(v, m.ceil, xa, xG1, court, gx, y + CEIL, y + CEIL + 0.02, 'D');
    if (k) {                                                               // upstand with an edge beam, a steel rail on it
      box(v, m.tile, xa, xG1, gx - 0.12, gx, y - 0.45, y + 1.0, 'KUD'); box(v, m.gwall, xa, xG1, gx - 0.12, gx, y, y + 1.0, 'F');
      hit(FACE + 0.31, L - FACE - 0.31, gx - 0.12, gx, y + 0.02, y + 2.0);
      stain(FACE, L / 2, gx, y - 0.45, y + 1.0, 1, 0.5); stain(L / 2, L - FACE, gx, y - 0.45, y + 1.0, 1, 0.5);
      box(ex, m.inox, xa, xG1, gx - 0.085, gx - 0.035, y + 1.1, y + 1.14);
      for (let x = xa + 0.6; x < xG1 - 0.3; x += low ? 2.4 : 1.2) box(ex, m.inox, x - 0.012, x + 0.012, gx - 0.072, gx - 0.048, y + 1.0, y + 1.1, 'WEFK');
    }
    for (let i = 0; i < colX.length - 1; i++) if (colX[i + 1] - colX[i] > 2) {                                 // one ceiling lamp per bay
      const xm = (colX[i] + colX[i + 1]) / 2; box(ex, m.lamp, xm - 0.16, xm + 0.16, court + 0.84, court + 1.16, y + CEIL - 0.05, y + CEIL, 'DWEFK');
      if (k === 0 && i % 2 === 0) LIT.push([...P.toWorld(xm, gx + 1.3), 4.5]);
    }
  }
  for (let x = xa + 6; x < xG1 - 3; x += 14.6) box(ex, m.pvc, x - 0.05, x + 0.05, gx, gx + 0.1, 0.1, yF - SLAB, 'KWE');   // rainwater pipes

  // ================= stair cores =================
  for (const s of sections) if (s.kind === 'stair') {
    const S = s.st, T = tier(s);
    box(v, m.plaster, S.xw0, S.xw1, S.zb - WALL, S.zb, BASE, yF - SLAB, 'K'); hit(S.xw0 + 0.01, S.xw1 - 0.01, S.zb - WALL, S.zb - 0.01, BASE + 0.02, yF);
    hit(S.xB1 + 0.01, S.xA0 - 0.01, S.zh + 0.01, S.zl - 0.01, BASE + 0.02, yF);                                // the well is closed for the walker
    box(v, m.floor, S.xw0, S.xw1, S.zb, S.zl, BASE - 0.02, BASE, 'U');
    box(v, m.plaster, S.xB0, S.xB1, S.zl - 0.1, S.zl, BASE, BASE + CEIL, 'K'); hit(S.xB0 + 0.01, S.xB1 - 0.01, S.zl - 0.1, S.zl - 0.01, BASE + 0.02, BASE + CEIL - 0.02);   // store under the first flight
    box(T.fu, m.door, S.xB0 + 0.4, S.xB0 + 1.2, S.zl, S.zl + 0.02, BASE, BASE + 1.9, 'KWEU');
    for (let k = 0; k < FLOORS; k++) {
      const y = level(k), ym = y + FH / 2, y1 = y + FH, last = k === FLOORS - 1;
      box(v, m.floor, S.xw0, S.xw1, S.zl, court, y - 0.02, y, 'U');
      box(v, m.ceil, S.xw0, S.xw1, last ? S.zb : S.zl, court, y + CEIL, y + CEIL + 0.02, 'D');
      box(v, m.gwall, s.x0, s.x1, court - WALL, court, y + 2.45, y + CEIL, 'KFD');                              // beam over the opening to the gallery
      box(T.fu, m.lamp, (S.xw0 + S.xw1) / 2 - 0.5, (S.xw0 + S.xw1) / 2 + 0.5, S.zl + 0.2, S.zl + 0.28, y + CEIL - 0.04, y + CEIL, 'DWEFK');
      if (last) {                                                           // guard over the void of the last flight
        box(v, m.gwall, S.xA0, S.xA1, S.zl - 0.1, S.zl, y, y + 1.05, 'FKU'); hit(S.xA0 + 0.01, S.xA1 - 0.01, S.zl - 0.1, S.zl - 0.01, y + 0.02, y + 2.0);
        box(T.fu, m.inox, S.xA0, S.xA1, S.zl - 0.075, S.zl - 0.025, y + 1.1, y + 1.14);
        continue;
      }
      // half landing
      box(v, m.floor, S.xw0, S.xw1, S.zb, S.zh, ym - 0.02, ym, 'U'); box(v, m.ceil, S.xw0, S.xw1, S.zb, S.zh, ym - SLAB, ym - 0.02, 'DK');
      hit(S.xw0 + 0.01, S.xw1 - 0.01, S.zb + 0.01, S.zh, ym - SLAB, ym);
      // flights: A (east half) rises toward the street, B (west half) comes back to the gallery
      incl(v, m.ceil, S.xA0, S.xA1, S.zl, y, S.zh, ym, 0.16, 'USN'); incl(v, m.ceil, S.xB0, S.xB1, S.zh, ym, S.zl, y1, 0.16, 'USN');
      incl(c, 'generic', S.xA0 + 0.01, S.xA1 - 0.01, S.zl, y, S.zh, ym, 0.2); incl(c, 'generic', S.xB0 + 0.01, S.xB1 - 0.01, S.zh, ym, S.zl, y1, 0.2);
      for (let i = 0; i < STEPS; i++) {
        box(T.fu, m.tread, S.xA0, S.xA1, S.zl - (i + 1) * GO, S.zl - i * GO, y + i * RISE, y + (i + 1) * RISE, 'UKW');
        box(T.fu, m.tread, S.xB0, S.xB1, S.zh + i * GO, S.zh + (i + 1) * GO, ym + i * RISE, ym + (i + 1) * RISE, 'UFE');
        box(T.fu, m.nosing, S.xA0, S.xA1, S.zl - i * GO - 0.05, S.zl - i * GO + 0.005, y + (i + 1) * RISE - 0.004, y + (i + 1) * RISE + 0.006, 'UK');
        box(T.fu, m.nosing, S.xB0, S.xB1, S.zh + i * GO - 0.005, S.zh + i * GO + 0.05, ym + (i + 1) * RISE - 0.004, ym + (i + 1) * RISE + 0.006, 'UF');
        if (!low || i % 2 === 0) {                                          // balusters on the well side
          box(T.fu, m.inox, S.xA0 + 0.02, S.xA0 + 0.045, S.zl - (i + 0.5) * GO - 0.012, S.zl - (i + 0.5) * GO + 0.012, y + (i + 1) * RISE, y + (i + 0.5) * RISE + 0.93, 'WEFK');
          box(T.fu, m.inox, S.xB1 - 0.045, S.xB1 - 0.02, S.zh + (i + 0.5) * GO - 0.012, S.zh + (i + 0.5) * GO + 0.012, ym + (i + 1) * RISE, ym + (i + 0.5) * RISE + 0.93, 'WEFK');
        }
      }
      rod(T.fu, m.inox, [S.xA0 + 0.032, S.zl, y + 0.95], [S.xA0 + 0.032, S.zh, ym + 0.95], 0.05); rod(T.fu, m.inox, [S.xB1 - 0.032, S.zh, ym + 0.95], [S.xB1 - 0.032, S.zl, y1 + 0.95], 0.05);
      rod(T.fu, m.inox, [S.xA1 - 0.06, S.zl, y + 0.95], [S.xA1 - 0.06, S.zh, ym + 0.95], 0.04); rod(T.fu, m.inox, [S.xB0 + 0.06, S.zh, ym + 0.95], [S.xB0 + 0.06, S.zl, y1 + 0.95], 0.04);
      box(T.fu, m.inox, S.xB1 - 0.057, S.xA0 + 0.057, S.zh - 0.06, S.zh - 0.01, ym + 0.93, ym + 0.98);          // the rail turns round the well
      { const yl = k === FLOORS - 2 ? y1 + CEIL : ym + CEIL; box(T.fu, m.lamp, (S.xw0 + S.xw1) / 2 - 0.5, (S.xw0 + S.xw1) / 2 + 0.5, S.zb + 0.5, S.zb + 0.58, yl - 0.04, yl, 'DWEFK'); }
    }
  }

  // ================= bridge to the round tower (south blocks) =================
  if (bridge) for (let k = 1; k < FLOORS; k++) {
    const y = level(k), { d0, d1, x0, xe } = bridge, N = 8;
    for (let i = 0; i < N; i++) {
      const da = d0 + (d1 - d0) * i / N, db = d0 + (d1 - d0) * (i + 1) / N, xA = xe(da), xB = xe(db);
      quad(v, m.floor, [[x0, da, y], [xA, da, y], [xB, db, y], [x0, db, y]], [0, 0, 1]); quad(v, m.ceil, [[x0, da, y - SLAB], [xA, da, y - SLAB], [xB, db, y - SLAB], [x0, db, y - SLAB]], [0, 0, -1]);
      hit(x0 + 0.01, Math.max(xA, xB) + 0.05, da + 0.003, db - 0.003, y - SLAB, y - 0.004);
    }
    for (const [da, db, out] of [[d0, d0 + 0.12, 'F'], [d1 - 0.12, d1, 'K']]) {                                  // upstands on both edges
      const x1 = xe(out === 'F' ? da : db) + 0.05;
      box(v, m.tile, x0, x1, da, db, y - 0.45, y + 1.0, out + 'UD'); box(v, m.gwall, x0, x1, da, db, y, y + 1.0, out === 'F' ? 'K' : 'F');
      if (out === 'F') hit(x0 + 0.01, x1, da, db, y + 0.02, y + 2.0); else hit(L - FACE - 0.3, x1, da, db - 0.003, y + 0.03, y + 2.0);
      box(ex, m.inox, x0, x1, (da + db) / 2 - 0.025, (da + db) / 2 + 0.025, y + 1.1, y + 1.14);
    }
  }

  // ================= block A north: the colonnade and the lobby behind its glass =================
  if (lobbySec) {
    const s = lobbySec, x0 = s.x0, span = L - x0, yCol = H - 0.75, y = BASE;
    // porch: platform to the roof outline, a step along its front
    box(v, m.plinth, x0, L - FACE, 0, FACE, 0, BASE, 'FWE'); box(v, m.floor, x0, xb, 0, gd, BASE - 0.02, BASE, 'U'); hit(x0, L - FACE, 0, FACE - 0.01, -0.2, BASE);
    box(v, m.stone, x0, L - FACE, -0.36, 0, 0, BASE / 2, 'UFWE'); incl(c, 'generic', x0, L - FACE, -0.44, 0, 0.02, BASE + 0.01, 0.2);
    for (let i = 0; i < 6; i++) {                                           // six slender columns
      const cx = x0 + span / 12 + i * span / 6;
      cyl(v, m.white, cx, FACE + 0.45, BASE, 0.3, yCol - BASE, 18, false); hit(cx - 0.28, cx + 0.28, FACE + 0.17, FACE + 0.73, BASE + 0.02, yCol);
      cyl(v, m.plinth, cx, FACE + 0.45, BASE, 0.36, 0.12, 18);
    }
    // glass wall: clear on the ground floor with two door openings, teal above, white bands at the floor lines
    const doors = [x0 + span / 3, x0 + 2 * span / 3].map(xc => [xc - 1.0, xc + 1.0]);
    let xg = x0 + 0.1;
    for (const [a, b] of doors) { pane(v, 'x', xg, a, y + 0.02, y + CEIL, gd, m.clear); pane(v, 'x', a, b, y + 2.4, y + CEIL, gd, m.clear); hit(xg, a, gd - 0.04, gd + 0.06, y + 0.02, y + CEIL - 0.02); hit(a + 0.005, b - 0.005, gd - 0.04, gd + 0.06, y + 2.4, y + CEIL - 0.02); xg = b; }
    pane(v, 'x', xg, xb, y + 0.02, y + CEIL, gd, m.clear); hit(xg, xb - 0.005, gd - 0.04, gd + 0.06, y + 0.02, y + CEIL - 0.02);
    box(v, m.teal, x0 + 0.1, xb, gd, gd + 0.02, level(1), yCol, 'F'); hit(x0 + 0.005, xb - 0.005, gd - 0.04, gd + 0.06, level(1) + 0.02, yCol - 0.02);
    for (let k = 1; k <= FLOORS; k++) box(v, m.tile, x0, xb, gd - 0.1, gd, level(k) - 0.38, level(k), 'FUD');
    const nm = Math.round((xb - x0) / 1.95);
    for (let i = 1; i < nm; i++) { const xq = x0 + i * (xb - x0) / nm, atDoor = doors.some(([a, b]) => xq > a + 0.05 && xq < b - 0.05); box(v, m.frame, xq - 0.035, xq + 0.035, gd - 0.07, gd + 0.03, atDoor ? y + 2.4 : y, yCol, 'FWEK'); }
    box(v, m.frame, x0, xb, gd - 0.05, gd + 0.03, y + 2.36, y + 2.44, 'FUDK');
    for (const [a, b] of doors) for (const xl of [a + 0.02, b - 0.02]) { frame(v, 'd', gd + 0.03, gd + 0.97, y + 0.02, y + 2.36, xl - 0.02, xl + 0.02, m.frame, 0, y + 1.05, 0.07); pane(v, 'd', gd + 0.1, gd + 0.9, y + 0.09, y + 2.29, xl, m.clear); }   // glazed leaves swung in
    box(v, m.tile, x0, xb, gd + 0.06, gd + 0.4, yF, yCol, 'F');                                                 // upstand behind the top of the glass
    box(v, m.tile, xb, L - FACE, FACE, 6.0, yF, yCol, 'EW'); box(v, m.tile, xb, xb + 0.02, FACE, gd, BASE, yCol, 'W'); box(v, m.tile, x0 - 0.02, x0, FACE, gd, BASE, yCol, 'E');
    box(v, m.white, x0, L, 0, 6.0, yCol, yCol + 0.6); hit(x0 + 0.01, L, 0, 6.0, yCol, yCol + 0.6);              // thin roof slab over the columns
    for (let xr = x0 + 0.5; xr < L - 0.8; xr += 1.2) box(v, m.frame, xr, xr + 0.5, 0.3, 5.7, yCol + 0.6, H, 'WEFKU');   // ribbed strip seen from above
    stain(x0, L, 0, yCol, yCol + 0.6, -1, 0.7);
    // the lobby's shell and its doors to the gallery
    floorCeil(x0 + 0.1, xb, gd, court - WALL, y);
    const gA = [x0 + 3.0, x0 + 4.8], gB = [xb - 4.8, xb - 3.0], gw = [[x0 + 7.0, x0 + 9.4], [x0 + 11.0, x0 + 13.4], [x0 + 15.0, x0 + 17.4]];
    galleryWall(s, 0, [gA, gB].map(q => ({ a: q[0], b: q[1], y0: y, y1: y + 2.3 })).concat(gw.map(q => ({ a: q[0], b: q[1], y0: y + 1.0, y1: y + 2.3 }))), m.plaster, [[gA[0], gA[1], 2.3], [gB[0], gB[1], 2.3]]);
    for (const q of gw) { pane(v, 'x', q[0], q[1], y + 1.0, y + 2.3, court - 0.1, m.win); frame(ex, 'x', q[0], q[1], y + 1.0, y + 2.3, court - 0.14, court - 0.06, m.frame, 2); }
    for (const q of [gA, gB]) { frame(ex, 'x', q[0] - 0.04, q[1] + 0.04, y - 0.04, y + 2.34, court - 0.16, court - 0.04, m.doorDark, 0, 0, 0.045);
      box(v, m.door, q[0], q[0] + 0.04, court - WALL - 0.88, court - WALL, y + 0.01, y + 2.26, 'WEFU'); box(v, m.door, q[1] - 0.04, q[1], court - WALL - 0.88, court - WALL, y + 0.01, y + 2.26, 'WEFU'); }
    box(v, m.plaster, xb - 0.01, xb + 0.01, gd, court - WALL, y, y + CEIL, 'W');
    for (let k = 1; k < FLOORS; k++) {                                      // rooms above the lobby: closed doors on the gallery
      const yk = level(k), ds = [x0 + 3.2, x0 + 11.2, xb - 4.4].map(a => [a, a + 1.2]);
      galleryWall(s, k, ds.map(q => ({ a: q[0], b: q[1], y0: yk, y1: yk + 2.1 })).concat([[x0 + 6.0, x0 + 9.0], [x0 + 14.2, x0 + 17.2]].map(q => ({ a: q[0], b: q[1], y0: yk + 1.3, y1: yk + 2.3 }))), null, []);
      for (const q of ds) closedDoor(q[0], q[1], yk, 2.1, true);
      for (const q of [[x0 + 6.0, x0 + 9.0], [x0 + 14.2, x0 + 17.2]]) { pane(v, 'x', q[0], q[1], yk + 1.3, yk + 2.3, court - 0.1, m.win); frame(ex, 'x', q[0], q[1], yk + 1.3, yk + 2.3, court - 0.14, court - 0.06, m.frame, 3); }
    }
  }

  // ================= entrance of the other blocks: steps, a canopy on two columns, open glass doors =================
  for (const s of sections) if (s.kind === 'common' && s.lobby) {
    const xm = (s.x0 + s.x1) / 2, g0 = FACE + RECESS, y = BASE, a = xm - 3.0, b = xm + 3.0, dFront = -1.3;
    box(v, m.plinth, a, b, dFront, FACE, 0, BASE, 'FWE'); box(v, m.floor, a, b, dFront, g0, BASE - 0.02, BASE, 'U'); hit(a, b, dFront, FACE - 0.01, -0.2, BASE);
    box(v, m.stone, a, b, dFront - 0.36, dFront, 0, BASE / 2, 'UFWE'); incl(c, 'generic', a, b, dFront - 0.44, 0, dFront + 0.02, BASE + 0.01, 0.2);
    for (const sx of [-1, 1]) {
      const xc = xm + sx * 2.75;
      cyl(v, m.inox, xc, dFront + 0.25, BASE, 0.09, 2.78, 12, false); hit(xc - 0.09, xc + 0.09, dFront + 0.16, dFront + 0.34, BASE + 0.02, BASE + 2.8);
      box(v, m.stone, sx < 0 ? a - 0.5 : b, sx < 0 ? a : b + 0.5, dFront + 0.2, FACE - 0.03, 0, 0.62, 'FWEU'); hit(sx < 0 ? a - 0.5 : b, sx < 0 ? a : b + 0.5, dFront + 0.2, FACE - 0.03, 0.02, 1.2);   // planter walls beside the steps
      frame(v, 'd', g0 + 0.03, g0 + 1.15, y + 0.02, y + 2.36, xm + sx * 1.18 - 0.02, xm + sx * 1.18 + 0.02, m.frame, 0, y + 1.05, 0.07); pane(v, 'd', g0 + 0.1, g0 + 1.08, y + 0.09, y + 2.29, xm + sx * 1.18, m.clear);   // glazed leaves swung in
    }
    box(v, m.white, a - 0.3, b + 0.3, dFront - 0.25, FACE + 0.06, y + 2.78, y + 2.98); box(v, m.frame, a - 0.3, b + 0.3, dFront - 0.27, dFront - 0.25, y + 2.72, y + 3.3, 'FUDWE');
    hit(a - 0.3, b + 0.3, dFront - 0.25, FACE - 0.01, y + 2.78, y + 2.98);
    box(ex, m.lamp, xm - 0.8, xm + 0.8, dFront + 0.5, dFront + 0.62, y + 2.74, y + 2.78, 'DWEFK'); LIT.push([...P.toWorld(xm, dFront - 1.2), 5]);
    box(v, m.frame, xm - 1.24, xm - 1.18, g0 - 0.06, g0 + 0.04, y, y + 2.4, 'FWEK'); box(v, m.frame, xm + 1.18, xm + 1.24, g0 - 0.06, g0 + 0.04, y, y + 2.4, 'FWEK');
    if (letters && P.name) [...('学生公寓' + P.name)].forEach((ch, i, all) => { const dir = streetNorth ? 1 : -1, off = ((all.length - 1) / 2 - i) * 0.5 + (i > 3 ? -0.12 : 0.12); card(letters, glyphs().uv(ch), xm + dir * off, dFront - 0.275, y + 3.02, 0, -1, 0.4, 0.4); });
  }

  // ================= roof: water tank, solar heaters, lightning rods =================
  if (sp.blue) { const xc = (sp.blue[0] + sp.blue[1]) / 2, r = Math.min(2.0, (sp.blue[1] - sp.blue[0]) / 2); cyl(v, m.blue, xc, 3.2, yDeck + 0.25, r, 1.6, 20); box(v, m.concrete, xc - r, xc + r, 3.2 - r, 3.2 + r, yDeck, yDeck + 0.25, 'WEFKU'); hit(xc - r, xc + r, 3.2 - r, 3.2 + r, yDeck + 0.01, yDeck + 1.85); }
  for (const [a, b] of sp.ribbed || []) {
    const n = Math.max(1, Math.round((b - a) / 2.1)), w = (b - a) / n;
    for (let i = 0; i < n; i++) {
      const x0 = a + i * w + 0.12, x1 = a + (i + 1) * w - 0.12;
      const dLo = streetNorth ? 5.3 : 1.7, dHi = streetNorth ? 2.2 : 4.8;                                      // the collectors face south
      incl(v, m.solar, x0, x1, dLo, yDeck + 0.45, dHi, yDeck + 1.75, 0.06, 'D'); box(v, m.frame, x0 - 0.05, x1 + 0.05, Math.min(dHi, dHi + (dHi - dLo) * 0.2), Math.max(dHi, dHi + (dHi - dLo) * 0.2), yDeck + 1.5, yDeck + 2.05, 'WEFKU');   // collector and its tank
      for (const xl of [x0, x1 - 0.05]) { box(ex, m.inox, xl, xl + 0.05, dHi - 0.025, dHi + 0.025, yDeck, yDeck + 1.5, 'WEFK'); box(ex, m.inox, xl, xl + 0.05, dLo - 0.025, dLo + 0.025, yDeck, yDeck + 0.42, 'WEFK'); }
    }
    hit(a, b, 1.5, 5.5, yDeck + 0.01, yDeck + 1.9);
  }
  for (const [x, d] of [[0.15, 0.15], [L - 0.15, D - 0.15], [0.15, D - 0.15], ...(col ? [] : [[L - 0.15, 0.15]]), [L / 2, D - 0.15], [L * 0.3, 0.15]]) cyl(ex, m.inox, x, d, H, 0.018, 1.3, 5, false);
  box(ex, m.dark, 0.5, xF1 - 0.5, 0.13, 0.17, H, H + 0.03, 'UFK'); box(ex, m.dark, 0.5, L - 0.5, D - 0.17, D - 0.13, H, H + 0.03, 'UFK');   // lightning strip on the parapet

  // ================= fascia lettering (block A north) =================
  if (sp.slogan && letters) {
    const dir = streetNorth ? 1 : -1, pitch = 3.1, size = 1.5, xc = sections.find(s => s.kind === 'common').x0, yc = (yFa + H) / 2 + 0.05, uv = glyphs().uv;
    // the reader's left is east when the face looks north. Seen: 面向世界, centred on xc. Imagined: the phrases either side of it.
    [['面向现代化', 5.5], ['面向世界', 0], ['面向未来', -5]].forEach(([text, off]) => [...text].forEach((ch, i, all) => card(letters, uv(ch), xc + dir * (off + (all.length - 1) / 2 - i) * pitch, -0.03, yc, 0, -1, size, size)));
  }

  // ================= assemble =================
  const vg = mergeFlat(v.build({ name: item.id + '-visual' }), true);
  for (const Q of [dirt, letters]) { const mesh = Q && Q.build(item.id + '-overlay'); if (mesh) vg.add(mesh); }
  ctx.add(vg);
  const [wx, wz] = P.toWorld(L / 2, D / 2);
  ctx.detail(ctx.add(mergeFlat(ex.build({ name: item.id + '-fittings', castShadow: false }), false)), wx, wz, L / 2 + (low ? 70 : 110));
  for (const [s, T] of tiers) {
    const [sx, sz] = P.toWorld((s.x0 + s.x1) / 2, D / 2), half = (s.x1 - s.x0) / 2;
    const fu = mergeFlat(T.fu.build({ name: item.id + '-interior', castShadow: false }), false), fx = mergeFlat(T.fx.build({ name: item.id + '-fine', castShadow: false }), false);
    if (fu.children.length) ctx.detail(ctx.add(fu), sx, sz, half + (low ? 30 : 42));
    if (fx.children.length) ctx.detail(ctx.add(fx), sx, sz, half + (low ? 14 : 20));
  }
  const cg = ctx.add(c.build({ name: item.id + '-colliders' })); cg.visible = false;
  cg.traverse(o => { if (o.isMesh) ctx.collide(o); });
}
