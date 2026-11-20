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
//     the soft dirt on the walls, and everything inside (lobby, stairs, wash rooms, common rooms, furnished rooms);
//   - the names on the entrance signs (学生公寓 一栋 to 四栋) and every word on the signs, notices and posters;
//   - what the large glazed walls show after dusk (lit rooms with blinds, drapes and people: a drawn picture used as
//     their emissive map), the bedding, bed curtains and mosquito nets, the potted plants (flora.js foliage);
//   - which rooms stand open and furnished: two in each row of rooms on every storey of block A north, one in the
//     other blocks (isOpen() in plan()). All other room doors are closed and nothing is built behind them.
//
// What is drawn when: the shell (walls, floors, glass, balcony fronts, the shells of the open rooms) always; outdoor
// units, washing, gallery lamps, the clear lobby glass, entrance signs and the dirt within about 150 m; frames, rails,
// pipes, door numbers and the other small fittings in lengths of 24 m, each within about 50 m; stairs, furniture and
// room contents section by section (rooms within about 30 m, glass-fronted lobbies and common rooms 45 m), their
// smallest things nearer still.
//
// Collision: the boundary of the space a walker can be in, as one-sided quads that face it: floors, stair flights (one
// inclined quad each), the faces of walls, balustrades (2 m tall for the walker), columns at ground level, the fronts of
// the furniture, roof deck and parapets. Rooms with closed doors are closed for the walker too. Boxes are avoided on
// purpose: the player's octree is 1400 m wide but only 22 m tall, so its cells are very flat, and every place where more
// than four upright faces come close together costs thousands of cells per metre of height (the first version of this
// file, built from boxes, made two million cells per block).
import { THREE, mat } from '../../kit.js';
import { Batch } from '../../batch.js';
import { plain, SURFACES, rng } from '../../hifi.js';
import { LIT } from '../../street.js';
import { shrubs, broadleafTrees, useStockShaders } from '../../flora.js';

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
  const glassOf = (hex, name, tint, tile, seed = 9) => {
    if (typeof document === 'undefined') { const q = new THREE.MeshStandardMaterial({ color: hex }); q.name = name; return q; }     // no canvas (checks run outside a browser)
    const s = SURFACES.glazing(hex, 3, 3, [3.6, 3.6], seed), map = s.map.clone(), nm = s.normalMap.clone();
    for (const t of [map, nm]) { t.repeat.set(1 / tile[0], 1 / tile[1]); t.needsUpdate = true; }
    const q = new THREE.MeshStandardMaterial({ map, normalMap: nm, color: tint, roughness: 0.06, metalness: 0.55, envMapIntensity: 1.4 }); q.name = name; return q;
  };
  const clear = new THREE.MeshStandardMaterial({ color: 0xa9cfc8, roughness: 0.05, metalness: 0.3, transparent: true, opacity: 0.28, depthWrite: false, envMapIntensity: 1.4 }); clear.name = 'hifi-dormlobbyglass';
  MATS = {
    tile: mat('wallWhite'), brick: mat('brickRed'), floor: mat('paving'),
    win: glassOf(0x4c6672, 'hifi-dormwindow', 0xffffff, [3.6, 3.0]), cwall: glassOf(0x4c6672, 'hifi-dormcurtainwall', 0xa3b6be, [2.875, 3.0]),
    teal: glassOf(0x3f9a8e, 'hifi-dormtealglass', 0xffffff, [3.9, 3.0]), view: glassOf(0xa9cdd4, 'hifi-dormviewglass', 0xffffff, [3.6, 3.0], 10), clear,
    lamp: plain('lamp', 0xfff1d6, 0.4, 0, { emissive: 0xffe2b0, emissiveIntensity: 1.4 }),
    // ceilings give off a little light of their own: the page's indoor lamp hangs at ceiling height and cannot light them
    plaster: flat('plaster', 0xf1eee5, 0.9), ceil: plain('dormceiling', 0xf3f1ea, 0.92, 0, { emissive: 0xe9e6dc, emissiveIntensity: 0.16 }), gwall: flat('gallerywall', 0xefe8d6, 0.88), dado: flat('dado', 0xcbd3bf, 0.7),
    plinth: flat('plinth', 0x5d5b58, 0.55), maroon: flat('maroon', 0x7c2f2b, 0.6), roof: flat('roofdeck', 0xcdbf9e, 0.95), white: flat('whitepaint', 0xf3f2ee, 0.6),
    frame: flat('frame', 0xf0f0ec, 0.45), door: flat('doorleaf', 0x9a6b3f, 0.6), doorDark: flat('doorframe', 0x6a4a31, 0.6), pvc: flat('pvc', 0xdcd9d0, 0.7),
    ac: flat('acunit', 0xe9e8e3, 0.55), dark: flat('darkpart', 0x2a2c2f, 0.6), concrete: flat('concrete', 0xb7b4ab, 0.92), tread: flat('tread', 0xaaa69c, 0.75), nosing: flat('nosing', 0x4a4a48, 0.8),
    inox: flat('inox', 0xcdd1d5, 0.3, 0.9), blue: flat('tankblue', 0x8fc4e6, 0.5), solar: flat('solar', 0x1d2740, 0.3), stone: flat('stonestep', 0xa9a49a, 0.8),
    red: flat('red', 0xb8322a, 0.6), green: flat('green', 0x3d8a55, 0.7), basin: flat('basin', 0xf6f6f4, 0.3),
  };
  return MATS;
}

// Draw-call saver: every plain-coloured, untextured, opaque part of a group becomes one mesh with vertex colours (three:
// rough paint and plaster, which take the page's surface grain; smooth things such as furniture, frames and doors, which
// must not look lumpy; bare metal).
let FLAT = null, SMOOTH = null, INOX = null;
const isFlat = t => !t.map && !t.transparent && !(t.alphaTest > 0) && !/glass|window|curtain/i.test(t.name) && t.emissiveIntensity * (t.emissive.r + t.emissive.g + t.emissive.b) < 0.3;
export function mergeFlat(group, castShadow) {
  if (!FLAT) {
    FLAT = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.72, metalness: 0.02 }); FLAT.name = 'hifi-dormflat';
    SMOOTH = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.5, metalness: 0.02 }); SMOOTH.name = 'hifi-dormsmooth'; SMOOTH.userData.noGrain = true;
    INOX = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.32, metalness: 0.9 }); INOX.name = 'hifi-dorminox';
  }
  const kindOf = t => (t.metalness > 0.5 ? 2 : t.roughness < 0.65 ? 1 : 0);
  for (const [kind, material] of [[0, FLAT], [1, SMOOTH], [2, INOX]]) {
    const take = group.children.filter(q => q.isMesh && !q.isInstancedMesh && isFlat(q.material) && kindOf(q.material) === kind);
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
    im.data[o] = 92; im.data[o + 1] = 86; im.data[o + 2] = 76; im.data[o + 3] = Math.min(120, 255 * (0.34 * s + 0.06 * blot * (1 - 0.5 * t)));
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
  const red = new THREE.MeshStandardMaterial({ map: t, color: 0xc0261e, alphaTest: 0.4, roughness: 0.55, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -4 }); red.name = 'hifi-dormletters';   // offset: the letters lie 3 cm off the wall and are seen from 300 m
  const uv = ch => { const i = chars.indexOf(ch), cx = i % cols, cy = Math.floor(i / cols); return [cx / cols, 1 - (cy + 1) / rows, (cx + 1) / cols, 1 - cy / rows]; };
  return (GLYPHS = { red, uv });
}

// Small things with pictures or writing on them (posters, door numbers, signs, notices, machine fronts): one 1024 px atlas.
let ATLAS = null;
function atlas() {
  if (ATLAS) return ATLAS;
  const S = 1024, c = document.createElement('canvas'); c.width = c.height = S;
  const g = c.getContext('2d'), cells = {}, r = rng(977);
  g.fillStyle = '#f4f2ec'; g.fillRect(0, 0, S, S);
  const cell = (name, x, y, w, h, draw) => { cells[name] = [(x + 1) / S, 1 - (y + h - 1) / S, (x + w - 1) / S, 1 - (y + 1) / S]; g.save(); g.translate(x, y); g.beginPath(); g.rect(0, 0, w, h); g.clip(); draw(w, h); g.restore(); };
  const fill = (colour, x, y, w, h) => { g.fillStyle = colour; g.fillRect(x, y, w, h); };
  const text = (t, x, y, px, colour, weight = 'bold') => { g.font = `${weight} ${px}px ${CJK}`; g.fillStyle = colour; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(t, x, y); };
  const para = (x, y, w, n, gap = 8, colour = '#8b8880') => { g.fillStyle = colour; for (let i = 0; i < n; i++) g.fillRect(x, y + i * gap, w * (i === n - 1 ? 0.5 + 0.3 * r() : 1), 3); };
  const sign = (name, x, y, w, h, bg, t, px, fg = '#ffffff') => cell(name, x, y, w, h, () => { fill(bg, 0, 0, w, h); g.strokeStyle = fg; g.lineWidth = 2; g.strokeRect(4, 4, w - 8, h - 8); text(t, w / 2, h / 2 + 1, px, fg); });
  // row A: six posters, the house rules, the timetable (128 x 176 each)
  const PW = 128, PH = 176;
  cell('p0', 0, 0, PW, PH, (w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#0b1d3f'); gr.addColorStop(1, '#3c6aa6'); fill(gr, 0, 0, w, h); g.fillStyle = '#ffffff'; for (let i = 0; i < 70; i++) g.fillRect(r() * w, r() * h * 0.7, 1.5, 1.5);
    g.fillStyle = '#14213a'; g.beginPath(); g.moveTo(0, h); g.lineTo(w * 0.3, h * 0.62); g.lineTo(w * 0.55, h * 0.8); g.lineTo(w * 0.8, h * 0.55); g.lineTo(w, h * 0.75); g.lineTo(w, h); g.fill(); text('星辰大海', w / 2, h * 0.91, 15, '#e8eef8'); });
  cell('p1', PW, 0, PW, PH, (w, h) => { fill('#b3261e', 0, 0, w, h); text('拼', w / 2, h * 0.38, 86, '#f6d24a'); text('今日事 今日毕', w / 2, h * 0.8, 14, '#ffffff'); fill('#f6d24a', w * 0.15, h * 0.88, w * 0.7, 3); });
  cell('p2', PW * 2, 0, PW, PH, (w, h) => { fill('#e7862c', 0, 0, w, h); fill('#c96a17', 0, h * 0.7, w, h * 0.3); g.fillStyle = '#3a2412'; g.beginPath(); g.arc(w / 2, h * 0.42, 38, 0, 6.283); g.fill();
    g.strokeStyle = '#e7862c'; g.lineWidth = 3; g.beginPath(); g.moveTo(w / 2 - 38, h * 0.42); g.lineTo(w / 2 + 38, h * 0.42); g.moveTo(w / 2, h * 0.42 - 38); g.lineTo(w / 2, h * 0.42 + 38); g.stroke(); g.beginPath(); g.arc(w / 2 - 50, h * 0.42, 40, -0.7, 0.7); g.stroke(); g.beginPath(); g.arc(w / 2 + 50, h * 0.42, 40, 2.44, 3.84); g.stroke();
    text('热 爱', w / 2, h * 0.86, 22, '#ffffff'); });
  cell('p3', PW * 3, 0, PW, PH, (w, h) => { fill('#f3b6c6', 0, 0, w, h); g.fillStyle = '#8fc3ea'; g.beginPath(); g.moveTo(0, h); g.lineTo(w, h * 0.35); g.lineTo(w, h); g.fill(); g.fillStyle = '#ffffff'; g.beginPath();
    for (let i = 0; i < 10; i++) { const a = -1.571 + i * 0.6283, q = i % 2 ? 16 : 38; g.lineTo(w / 2 + Math.cos(a) * q, h * 0.4 + Math.sin(a) * q); } g.fill(); text('青 春', w / 2, h * 0.82, 26, '#ffffff'); });
  cell('p4', PW * 4, 0, PW, PH, (w, h) => { fill('#fbfaf5', 0, 0, w, h); fill('#c0261e', 0, 0, w, h * 0.2); text('高考倒计时', w / 2, h * 0.1, 17, '#ffffff'); text('100', w / 2, h * 0.5, 62, '#c0261e'); text('天', w / 2, h * 0.78, 24, '#33373d'); fill('#c0261e', w * 0.2, h * 0.9, w * 0.6, 3); });
  cell('p5', PW * 5, 0, PW, PH, (w, h) => { fill('#17181c', 0, 0, w, h); const cs = ['#e84a5f', '#ff847c', '#fecea8', '#99b898', '#45ada8', '#547980']; for (let i = 0; i < 12; i++) { const bh = h * (0.15 + 0.45 * r()); fill(cs[i % 6], 10 + i * 9, h * 0.7 - bh, 6, bh); } text('MUSIC', w / 2, h * 0.84, 22, '#f4f2ec'); });
  cell('rules', PW * 6, 0, PW, PH, (w, h) => { fill('#fbfaf5', 0, 0, w, h); text('宿舍管理规定', w / 2, 18, 15, '#b3261e'); fill('#b3261e', 12, 30, w - 24, 2); for (let i = 0; i < 6; i++) para(14, 40 + i * 22, w - 28, 3, 6); g.strokeStyle = '#c9c5ba'; g.strokeRect(1, 1, w - 2, h - 2); });
  cell('timetable', PW * 7, 0, PW, PH, (w, h) => { fill('#fbfaf5', 0, 0, w, h); fill('#1f5fa8', 0, 0, w, 28); text('作息时间表', w / 2, 15, 15, '#ffffff'); g.strokeStyle = '#9aa3ad'; g.lineWidth = 1;
    for (let i = 0; i < 12; i++) { const yy = 36 + i * 11.5; g.strokeRect(10, yy, w - 20, 11.5); fill('#55606b', 14, yy + 4, 30, 3); fill('#8b8880', 52, yy + 4, 40 + 20 * r(), 3); } g.beginPath(); g.moveTo(48, 36); g.lineTo(48, 174); g.stroke(); });
  // row B: door numbers 101 to 616 (64 x 32 each)
  for (let k = 1; k <= 6; k++) for (let i = 1; i <= 16; i++) cell('n' + k + String(i).padStart(2, '0'), (i - 1) * 64, 176 + (k - 1) * 32, 64, 32, (w, h) => { fill('#1d4f9c', 0, 0, w, h); g.strokeStyle = '#ffffff'; g.lineWidth = 1.5; g.strokeRect(3, 3, w - 6, h - 6); text(k + String(i).padStart(2, '0'), w / 2, h / 2 + 1, 19, '#ffffff'); });
  // rows C and D: signs
  let x = 0; const row = (y, list) => { x = 0; for (const [name, w, bg, t, px, fg] of list) { sign(name, x, y, w, 64, bg, t, px, fg); x += w; } };
  row(368, [['duty', 224, '#8a5a2b', '宿管值班台', 32], ['exit', 160, '#1f8a4c', '安全出口', 30], ['wash', 128, '#1d4f9c', '盥洗室', 30], ['activity', 128, '#1d4f9c', '活动室', 30], ['study', 128, '#1d4f9c', '自习室', 30], ['water', 128, '#1d4f9c', '开水间', 30], ['f1', 64, '#f4f2ec', '1F', 34, '#33373d'], ['f2', 64, '#f4f2ec', '2F', 34, '#33373d']]);
  row(432, [['f3', 64, '#f4f2ec', '3F', 34, '#33373d'], ['f4', 64, '#f4f2ec', '4F', 34, '#33373d'], ['f5', 64, '#f4f2ec', '5F', 34, '#33373d'], ['f6', 64, '#f4f2ec', '6F', 34, '#33373d'], ['banner', 256, '#c0261e', '文明宿舍', 36, '#f6d24a'], ['notice', 160, '#1f5fa8', '通知公告', 30], ['save', 128, '#2a8a96', '节约用水', 26], ['slip', 128, '#e0a020', '小心地滑', 26, '#33373d'], ['store', 96, '#1d4f9c', '储物间', 24]]);
  // row E: pictures
  cell('map', 0, 496, 256, 144, (w, h) => { fill('#7fb2d8', 0, 0, w, h); g.fillStyle = '#7fae6a'; for (const [cx, cy, rx, ry] of [[48, 48, 34, 22], [62, 96, 16, 30], [128, 44, 22, 18], [136, 86, 18, 28], [186, 50, 44, 26], [214, 104, 16, 10], [176, 78, 12, 9]]) { g.beginPath(); g.ellipse(cx, cy, rx, ry, 0.2, 0, 6.283); g.fill(); }
    g.strokeStyle = 'rgba(255,255,255,0.5)'; g.lineWidth = 1; for (let i = 1; i < 6; i++) { g.beginPath(); g.moveTo(0, i * 24); g.lineTo(w, i * 24); g.moveTo(i * 43, 0); g.lineTo(i * 43, h); g.stroke(); } fill('#ffffff', 0, 0, w, 3); fill('#ffffff', 0, h - 3, w, 3); g.fillStyle = '#c0261e'; g.beginPath(); g.arc(196, 62, 3, 0, 6.283); g.fill(); });
  cell('tv', 256, 496, 128, 80, (w, h) => { fill('#12151a', 0, 0, w, h); const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, '#2b6cb0'); gr.addColorStop(1, '#63b3ed'); fill(gr, 5, 5, w - 10, h - 10); text('今日值班', w / 2, 24, 15, '#ffffff'); para(18, 40, w - 36, 4, 8, '#e6f0fa'); });
  cell('vending', 384, 496, 96, 160, (w, h) => { fill('#c0392b', 0, 0, w, h); fill('#1b2530', 8, 10, w - 32, h * 0.62); const cs = ['#e74c3c', '#f1c40f', '#2ecc71', '#3498db', '#e67e22', '#ecf0f1']; for (let j = 0; j < 5; j++) for (let i = 0; i < 5; i++) fill(cs[(i + j * 2) % 6], 12 + i * 11.5, 14 + j * 19, 8, 15);
    fill('#1b2530', w - 20, 30, 14, 40); fill('#dfe6e9', w - 19, 76, 12, 8); fill('#1b2530', 14, h * 0.76, w - 40, 22); text('饮料', w / 2 - 6, h * 0.94, 13, '#ffffff'); });
  cell('washer', 480, 496, 96, 112, (w, h) => { fill('#eef0f1', 0, 0, w, h); fill('#cfd6da', 0, 0, w, 20); g.fillStyle = '#56606b'; g.beginPath(); g.arc(w / 2, 66, 32, 0, 6.283); g.fill(); g.fillStyle = '#9fc3d6'; g.beginPath(); g.arc(w / 2, 66, 25, 0, 6.283); g.fill(); g.fillStyle = '#56606b'; g.beginPath(); g.arc(18, 10, 5, 0, 6.283); g.fill(); fill('#56606b', 50, 7, 34, 6); });
  cell('hose', 576, 496, 96, 128, (w, h) => { fill('#c0261e', 0, 0, w, h); fill('#e9e6df', 8, 8, w - 16, h - 16); fill('#c0261e', 12, 12, w - 24, h - 24); text('消火栓', w / 2, h * 0.3, 20, '#ffffff'); text('119', w / 2, h * 0.62, 26, '#ffffff'); });
  cell('calendar', 672, 496, 64, 96, (w, h) => { fill('#fbfaf5', 0, 0, w, h); fill('#c0261e', 0, 0, w, 22); text('11月', w / 2, 12, 13, '#ffffff'); g.fillStyle = '#55606b'; for (let j = 0; j < 5; j++) for (let i = 0; i < 7; i++) g.fillRect(5 + i * 8, 30 + j * 12, 4, 5); g.strokeStyle = '#c9c5ba'; g.strokeRect(1, 1, w - 2, h - 2); });
  cell('keys', 736, 496, 128, 96, (w, h) => { fill('#e8e3d6', 0, 0, w, h); g.strokeStyle = '#8a7a5a'; g.lineWidth = 3; g.strokeRect(2, 2, w - 4, h - 4); for (let j = 0; j < 4; j++) for (let i = 0; i < 8; i++) { fill('#8a8f96', 12 + i * 14, 12 + j * 21, 2, 6); if (r() < 0.8) fill(['#c9a227', '#b8322a', '#2f5f9e', '#3d8a55'][(i + j) % 4], 10 + i * 14, 18 + j * 21, 6, 9); } });
  cell('parcel', 864, 496, 64, 48, (w, h) => { fill('#12151a', 0, 0, w, h); fill('#2b6cb0', 4, 4, w - 8, h - 8); text('取件', w / 2, h / 2, 16, '#ffffff'); });
  cell('clock', 928, 496, 64, 64, (w, h) => { fill('#f4f2ec', 0, 0, w, h); g.fillStyle = '#33373d'; g.beginPath(); g.arc(32, 32, 30, 0, 6.283); g.fill(); g.fillStyle = '#fbfaf5'; g.beginPath(); g.arc(32, 32, 26, 0, 6.283); g.fill();
    g.strokeStyle = '#33373d'; g.lineWidth = 2; for (let i = 0; i < 12; i++) { const a = i * 0.5236; g.beginPath(); g.moveTo(32 + Math.cos(a) * 21, 32 + Math.sin(a) * 21); g.lineTo(32 + Math.cos(a) * 25, 32 + Math.sin(a) * 25); g.stroke(); } g.lineWidth = 3; g.beginPath(); g.moveTo(32, 32); g.lineTo(32, 13); g.moveTo(32, 32); g.lineTo(45, 38); g.stroke(); });
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  const material = new THREE.MeshStandardMaterial({ map: t, roughness: 0.6 }); material.name = 'hifi-dormsigns';
  return (ATLAS = { material, uv: name => cells[name] || null });
}

// What the large glazed walls show after dusk: lit rooms behind the glass, one cell per bay and storey (8 bays by 4 storeys,
// repeating): ceilings with their lights, blinds let down to different heights, drapes, a few dark bays, things and heads
// against the light. It is the emissive map of that glass; the builder raises its strength with lighting.night().
let LITROOMS = null;
function litRooms() {
  if (LITROOMS) return LITROOMS;
  const NX = 8, NY = 4, S = 512, cw = S / NX, ch = S / NY, c = document.createElement('canvas'); c.width = c.height = S;
  const g = c.getContext('2d'), r = rng(5151), rgb = (q, k) => `rgb(${q.map(v => Math.round(v * k)).join(',')})`;
  g.fillStyle = '#000000'; g.fillRect(0, 0, S, S);
  for (let j = 0; j < NY; j++) for (let i = 0; i < NX; i++) {
    const x = i * cw, top = j * ch + ch * 0.05, bot = j * ch + ch * 0.95, dark = r() < 0.17, k = dark ? 0.08 + 0.08 * r() : 0.6 + 0.4 * r(), warm = r() < 0.55 ? [255, 204, 138] : [255, 230, 194];
    const gr = g.createLinearGradient(0, top, 0, bot); gr.addColorStop(0, rgb(warm, k)); gr.addColorStop(1, rgb(warm, k * 0.6));
    g.fillStyle = gr; g.fillRect(x + 2, top, cw - 4, bot - top);
    if (!dark) { g.fillStyle = 'rgba(255,250,236,0.95)'; for (const t of [0.28, 0.72]) g.fillRect(x + cw * t - 7, top + 5, 14, 3); }                    // ceiling lights
    g.fillStyle = `rgba(28,22,16,${dark ? 0.5 : 0.62})`;                                                                                          // a cupboard, heads at the tables
    if (r() < 0.5) g.fillRect(x + cw * (0.08 + 0.5 * r()), bot - ch * (0.42 + 0.14 * r()), cw * 0.24, ch * 0.6);
    g.fillStyle = `rgba(28,22,16,${dark ? 0.4 : 0.5})`;
    for (let q = 0, n = Math.floor(r() * 2.4); q < n; q++) { const px = x + cw * (0.2 + 0.6 * r()), py = bot - ch * (0.1 + 0.05 * r()); g.beginPath(); g.arc(px, py - 5, 3.4, 0, 6.283); g.fill(); g.beginPath(); g.ellipse(px, bot, 8, bot - py + 1, 0, Math.PI, 6.283); g.fill(); }   // someone sitting: head and shoulders
    const kind = r();
    if (kind < 0.45) { const len = (bot - top) * (0.15 + 0.6 * r()); g.fillStyle = `rgba(${dark ? '40,36,32' : '170,150,116'},0.84)`; g.fillRect(x + 2, top, cw - 4, len); g.fillStyle = 'rgba(0,0,0,0.22)'; for (let yy = top + 3; yy < top + len; yy += 5) g.fillRect(x + 2, yy, cw - 4, 1); }   // a blind
    else if (kind < 0.78) { g.fillStyle = `rgba(${dark ? '34,30,30' : '150,108,90'},0.86)`; g.fillRect(x + 2, top, cw * (0.1 + 0.16 * r()), bot - top); if (r() < 0.7) { const w2 = cw * (0.1 + 0.16 * r()); g.fillRect(x + cw - 2 - w2, top, w2, bot - top); } }   // drapes
  }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  return (LITROOMS = t);
}

// Soft things, instanced: mattress, pillow, a layer of a folded quilt, a quilt thrown back, a sheet edge hanging over the
// frame, a pleated bed curtain, a mosquito net. Each has its +x toward the aisle and its length along z, centred.
let SOFT = null;
function softShapes() {
  if (SOFT) return SOFT;
  const pw = (v, e) => Math.sign(v) * Math.pow(Math.abs(v), e);
  /** A box with rounded edges and corners (e near 0: sharp, 1: an ellipsoid), smooth normals. */
  const soft = (sx, sy, sz, e, ws = 10, hs = 6) => {
    const g = new THREE.SphereGeometry(1, ws, hs), p = g.attributes.position;
    for (let i = 0; i < p.count; i++) p.setXYZ(i, pw(p.getX(i), e) * sx / 2, pw(p.getY(i), e) * sy / 2, pw(p.getZ(i), e) * sz / 2);
    g.deleteAttribute('uv'); g.computeVertexNormals(); return g;
  };
  /** A sheet over a grid: point(u, w) -> [x, y, z] for u, w in 0..1; faces the side of increasing w cross increasing u. */
  const sheetOf = (nu, nw, point) => {
    const pos = [], idx = [];
    for (let j = 0; j <= nw; j++) for (let i = 0; i <= nu; i++) pos.push(...point(i / nu, j / nw));
    for (let j = 0; j < nw; j++) for (let i = 0; i < nu; i++) { const a = j * (nu + 1) + i, b = a + 1, q = a + nu + 1; idx.push(a, q, b, b, q, q + 1); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals(); return g;
  };
  const clothM = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.95, side: THREE.DoubleSide }); clothM.name = 'hifi-dormbedding';
  const netM = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9, transparent: true, opacity: 0.2, depthWrite: false, side: THREE.DoubleSide }); netM.name = 'hifi-dormbednet';
  return (SOFT = { clothM, netM,
    mattress: soft(0.87, 0.105, 1.9, 0.28, 8, 4), pillow: soft(0.5, 0.14, 0.3, 0.62, 8, 5), fold: soft(0.56, 0.1, 0.46, 0.36, 8, 4), net: soft(0.9, 0.92, 1.94, 0.3, 8, 4),
    // thrown back: lies in soft waves on the mattress and hangs over its aisle edge
    spread: sheetOf(8, 8, (u, w) => { const x = -0.44 + u * 1.0, over = Math.max(0, x - 0.4); return [x - over * 0.45, 0.07 + 0.028 * Math.sin(u * 7 + w * 9) * Math.cos(w * 5.3 + 1) + 0.016 * Math.sin(w * 13 + u * 3) - over * 1.3 - (w < 0.06 || w > 0.94 ? 0.03 : 0), -0.68 + w * 1.36]; }),
    // hanging edge of a sheet: a wavy strip below the top of the mattress
    sheet: sheetOf(1, 12, (u, w) => [u * (0.014 + 0.008 * Math.sin(w * 31)), -u * (0.12 + 0.035 * Math.sin(w * 17 + 1)), 0.95 - w * 1.9]),
    // bed curtain: pleats, one unit long and one unit high
    drape: sheetOf(1, 24, (u, w) => [(Math.round(w * 24) % 2 ? 1 : -1) * (0.016 + 0.014 * u), 0.5 - u, 0.5 - w]) });
}

export function build(item, ctx) {
  const P = plan(item, ctx.campus), { f, L, D, H, streetNorth, col, xa, xb, back, court, gx, yF, yDeck, sections, stairs, bridge, level, zAt, isOpen } = P;
  const low = !!ctx.lowPower, sp = SPECIAL[item.id] || {}, m = mats(), rnd = rng(seedOf(item.id)), canvasOk = typeof document !== 'undefined';
  const FM = new THREE.Matrix4().makeRotationY(f.angle).setPosition(f.ox, 0, f.oz);
  const newBatch = () => new Batch().setMatrix(FM);
  const v = newBatch(), ex = newBatch(), ex2 = newBatch();         // shell (always drawn); fittings seen from afar (outdoor units, washing, lamps); fine fittings
  const tiers = new Map();                                        // per section: interiors and fine objects, shown only from near
  const A = canvasOk ? atlas() : null, uvOf = name => (A ? A.uv(name) : null), exCards = A ? new Quads(A.material) : null;
  const tier = s => { if (!tiers.has(s)) tiers.set(s, { fu: newBatch(), fx: newBatch(), cards: A ? new Quads(A.material) : null, soft: { mattress: [], pillow: [], fold: [], spread: [], sheet: [], drape: [], net: [] } }); return tiers.get(s); };
  const dirt = canvasOk ? new Quads(grime()) : null, letters = canvasOk ? new Quads(glyphs().red) : null, letters2 = canvasOk ? new Quads(glyphs().red) : null;   // letters: the fascia (always drawn); letters2: entrance signs

  // ---- drawing helpers. Faces: W E (along the block), F K (street side, courtyard side), U D. ----
  const skips = {};
  const skipOf = faces => skips[faces] ?? (skips[faces] = [...'EWUDSN'].filter(q => !faces.includes(q === 'N' ? (streetNorth ? 'F' : 'K') : q === 'S' ? (streetNorth ? 'K' : 'F') : q)).join(''));
  const box = (b, material, x0, x1, d0, d1, y0, y1, faces = 'WEFKUD') => { if (x1 - x0 > 1e-4 && d1 - d0 > 1e-4 && y1 - y0 > 1e-4) b.slab(material, x0, y0, streetNorth ? d0 : D - d1, x1 - x0, y1 - y0, d1 - d0, skipOf(faces)); };
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
  /**
   * Wall with rectangular openings. ax 'x': runs along the block from u0 to u1, t0..t1 = its depth range; ax 'd': runs
   * across the block, t0..t1 = its x range. mA faces the low-t side (street side F, or west W), mB the other; either
   * may be null. ops: [{ a, b, y0, y1 }]. The pieces show their reveals.
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
  /** Instance matrix of a soft shape: centre (x, d, y), turned by yaw about the vertical (never mirrored), scaled. */
  const instM = (x, d, y, yaw = 0, sx = 1, sy = 1, sz = 1) => new THREE.Matrix4().makeRotationY(yaw).scale(new THREE.Vector3(sx, sy, sz)).setPosition(x, y, zAt(d)).premultiply(FM);
  /**
   * The large glazed walls: by day the tinted glass with its painted reflection; after dusk lit rooms (litRooms), aligned to
   * the bays (bay wide, the first one starting at xStart) and the storeys. Needs the per-frame hook; without it the glass
   * keeps its name and the page lights it like any window.
   */
  const litMats = [];
  const litGlass = (base, bay, xStart) => {
    if (!canvasOk || !ctx.animate) return base;
    const q = base.clone(), t = litRooms().clone();
    t.repeat.set(1 / (8 * bay), 1 / (4 * FH)); t.offset.set((streetNorth ? 1 : -1) * xStart / (8 * bay), -BASE / (4 * FH)); t.needsUpdate = true;
    q.name = 'hifi-dormlitbays'; q.emissiveMap = t; q.emissive.set(0xffffff); q.emissiveIntensity = 0; litMats.push(q); return q;
  };
  // ---- collision helpers: one-sided quads, each facing the side a walker is on ----
  const CP = [];
  /** pts: four [x, d, y] in order round the quad; n = [nx, nd, ny]: the direction it faces. */
  const cq = (pts, n) => {
    const q = pts.map(a => [a[0], a[2], zAt(a[1])]), nz = streetNorth ? n[1] : -n[1];
    const e1 = [q[1][0] - q[0][0], q[1][1] - q[0][1], q[1][2] - q[0][2]], e2 = [q[3][0] - q[0][0], q[3][1] - q[0][1], q[3][2] - q[0][2]];
    const cr = [e1[1] * e2[2] - e1[2] * e2[1], e1[2] * e2[0] - e1[0] * e2[2], e1[0] * e2[1] - e1[1] * e2[0]];
    const o = cr[0] * n[0] + cr[1] * n[2] + cr[2] * nz < 0 ? [q[0], q[3], q[2], q[1]] : q;
    for (const i of [0, 1, 2, 0, 2, 3]) { const w = new THREE.Vector3(...o[i]).applyMatrix4(FM); CP.push(w.x, w.y, w.z); }
  };
  const cFloor = (x0, x1, d0, d1, y) => cq([[x0, d0, y], [x1, d0, y], [x1, d1, y], [x0, d1, y]], [0, 0, 1]);
  /** Wall face along the block at depth d, facing nd (-1 the street side, 1 the courtyard side). */
  const cX = (x0, x1, d, y0, y1, nd) => { if (x1 - x0 > 0.01) cq([[x0, d, y0], [x1, d, y0], [x1, d, y1], [x0, d, y1]], [0, nd, 0]); };
  /** Wall face across the block at x, facing nx (-1 west, 1 east). */
  const cD = (d0, d1, x, y0, y1, nx) => { if (d1 - d0 > 0.01) cq([[x, d0, y0], [x, d1, y0], [x, d1, y1], [x, d0, y1]], [nx, 0, 0]); };
  const cRamp = (x0, x1, dA, yA, dB, yB) => cq([[x0, dA, yA], [x1, dA, yA], [x1, dB, yB], [x0, dB, yB]], [0, 0, 1]);
  /** The four upright faces of a free-standing block. */
  const cPost = (x0, x1, d0, d1, y0, y1) => { cX(x0, x1, d0, y0, y1, -1); cX(x0, x1, d1, y0, y1, 1); cD(d0, d1, x0, y0, y1, -1); cD(d0, d1, x1, y0, y1, 1); };
  /** Upright card of a Quads set: centre (x, d, y), facing (fx, fd) in plan, w by h, texture rectangle r. */
  const card = (Q, r, x, d, y, fx, fd, w, h) => {
    if (!Q || !r) return;
    const nz = streetNorth ? fd : -fd, rx = nz, rz = -fx, z = zAt(d);
    const at = (sx, sy) => new THREE.Vector3(x + rx * sx * w / 2, y + sy * h / 2, z + rz * sx * w / 2).applyMatrix4(FM);
    Q.add(at(-1, -1), at(1, -1), at(1, 1), at(-1, 1), r);
  };
  /** Dirt on a street-side (fd -1) or courtyard-side (fd 1) wall face at depth d: streaks from the top edge unless `up`. */
  const stain = (x0, x1, d, y0, y1, fd, strength = 1, up = false) => {
    const u = rnd() * 4, v1 = Math.min(1, 0.55 + 0.45 * strength), v0 = v1 - 0.62;                // weak dirt shows only the tails of the streaks
    card(dirt, up ? [u, v1, u + (x1 - x0) / 5, v0] : [u, v0, u + (x1 - x0) / 5, v1], (x0 + x1) / 2, d + fd * 0.012, (y0 + y1) / 2, 0, fd, x1 - x0, y1 - y0);
  };

  // ================= base: a dark plinth 0.3 m high under the whole block, a step along the courtyard =================
  const xG1 = bridge ? L - FACE : xb;                                     // east end of the galleries
  box(v, m.plinth, FACE, L - FACE, FACE, gx, 0, BASE, 'WEFK');
  box(v, m.stone, FACE, L - FACE, gx, gx + 0.32, 0, BASE / 2, 'UKWE');
  { const en = sections.find(s => s.kind === 'common' && s.lobby), xm = en ? (en.x0 + en.x1) / 2 : 0, x1 = col ? L - col : L - FACE;   // base course on the street face
    if (en) { box(v, m.plinth, FACE, xm - 3.0, FACE - 0.03, FACE, 0, 0.55, 'FUWE'); box(v, m.plinth, xm + 3.0, x1, FACE - 0.03, FACE, 0, 0.55, 'FUWE'); } else box(v, m.plinth, FACE, x1, FACE - 0.03, FACE, 0, 0.55, 'FUWE'); }
  if (bridge) { box(v, m.stone, L - FACE, L - FACE + 0.32, court, gx, 0, BASE / 2, 'UEFK'); }

  // ================= roof deck and fascia =================
  const lobbySec = sections.find(s => s.kind === 'lobby'), gd = FACE + PORCH;                                   // the glass wall behind the colonnade
  box(v, m.roof, 0.3, L - 0.3, 0.3, D - 0.3, yDeck - 0.05, yDeck, 'U');
  // fascia: a white band standing out to the roof outline on all four sides; its inner faces are the roof parapet
  const xF1 = col ? L - col : L, yFa = yF - 0.3;
  box(v, m.tile, 0, xF1, 0, 0.3, yFa, H, 'FKUDWE'); box(v, m.tile, 0, L, D - 0.3, D, yFa, H, 'FKUDWE');
  box(v, m.tile, 0, 0.3, 0.3, D - 0.3, yFa, H, 'WEUD'); box(v, m.tile, L - 0.3, L, col ? 6.0 : 0.3, D - 0.3, yFa, H, 'WEUD');

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
        frame(ex2, 'd', o.a, o.b, o.y0, o.y1, out === 'W' ? x0 + 0.06 : x1 - 0.12, out === 'W' ? x0 + 0.12 : x1 - 0.06, m.frame, 1);
        box(ex2, m.white, out === 'W' ? x0 - 0.05 : x1 - 0.1, out === 'W' ? x0 + 0.1 : x1 + 0.05, o.a - 0.05, o.b + 0.05, o.y0 - 0.05, o.y0, 'UDFK' + out);
      }
      if (openGallery) box(v, m.gwall, x0, x1, court - 0.02, court, y, y + CEIL, 'K');
      else { box(v, m.tile, x0, x1, court, gx, y, y + FH, out + 'K'); box(v, m.gwall, x0, x1, court, gx - 0.12, y, y + CEIL, inn); }
    }

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
      pane(v, 'x', o.a, o.b, o.y0, o.y1, FACE + 0.12, m.win); frame(ex2, 'x', o.a, o.b, o.y0, o.y1, FACE + 0.08, FACE + 0.14, m.frame, 1);
      box(ex2, m.white, o.a - 0.05, o.b + 0.05, FACE - 0.05, FACE + 0.08, o.y0 - 0.05, o.y0, 'FUDWE');
      stain(o.a - 0.1, o.b + 0.1, FACE, o.y0 - 1.3, o.y0 - 0.05, -1, 0.75);
    }
    stain(s.x0, s.x1, FACE, 0.55, 1.5, -1, 0.6, true);

  };
  /** Gallery wall of a section on storey k with its openings; inner: the material of its inside face (enterable spaces). */
  const galleryWall = (s, k, ops, inner) => {
    const y = level(k);
    wall(v, 'x', s.x0, s.x1, court - WALL, court, y, y + CEIL, ops, inner, m.gwall);
    let x = s.x0;                                                         // dado between the door openings
    for (const o of [...ops.filter(q => q.y0 < y + 0.2).sort((p, q) => p.a - q.a), { a: s.x1 }]) { box(v, m.dado, x, o.a, court, court + 0.012, y, y + 1.15, 'KU'); x = o.b; }
  };
  /** Closed door leaf in a gallery wall opening, with its frame. */
  const closedDoor = (a, b, y, h = 2.1, double = false) => {
    box(v, m.door, a + 0.04, b - 0.04, court - 0.13, court - 0.09, y, y + h, 'K'); frame(ex2, 'x', a, b, y - 0.04, y + h + 0.04, court - 0.16, court - 0.04, m.doorDark, double ? 1 : 0, 0, 0.045);
    box(ex2, m.inox, double ? (a + b) / 2 - 0.16 : b - 0.2, double ? (a + b) / 2 - 0.12 : b - 0.08, court - 0.09, court - 0.04, y + 0.98, y + 1.02); if (double) box(ex2, m.inox, (a + b) / 2 + 0.12, (a + b) / 2 + 0.16, court - 0.09, court - 0.04, y + 0.98, y + 1.02);
  };
  /** Interior shell of an enterable space: floor finish and ceiling. */
  const floorCeil = (x0, x1, d0, d1, y, top = CEIL) => { box(v, m.floor, x0, x1, d0, d1, y - 0.02, y, 'U'); box(v, m.ceil, x0, x1, d0, d1, y + top, y + top + 0.02, 'D'); };

  const acAt = (x, y) => {                                                // outdoor unit on two brackets, on the pier face
    box(ex, m.ac, x - 0.39, x + 0.39, FACE - 0.36, FACE - 0.06, y, y + 0.52, 'FWEUD'); box(ex, m.dark, x - 0.3, x + 0.1, FACE - 0.364, FACE - 0.36, y + 0.07, y + 0.45, 'F');
    for (const sx of [-0.3, 0.27]) box(ex2, m.inox, x + sx, x + sx + 0.03, FACE - 0.38, FACE, y - 0.04, y, 'FWED');
    box(ex2, m.pvc, x + 0.3, x + 0.34, FACE - 0.06, FACE, y + 0.3, y + 0.34, 'WEUD');
  };
  const WASH = [0xf4f4f0, 0xf4f4f0, 0xeef1f6, 0x27407a, 0x27407a, 0x5a86c2, 0xd8d8d2, 0xb9382f, 0xe6c84a, 0x6aa67c, 0xe7a4b4, 0x3a3d44];

  for (const s of sections) {
    if (s.kind === 'end') {
      // ---- closed service room: white bay, one closed door on the gallery ----
      whiteBay(s);
      const xm = (s.x0 + s.x1) / 2;
      for (let k = 0; k < FLOORS; k++) { galleryWall(s, k, [{ a: xm - 0.45, b: xm + 0.45, y0: level(k), y1: level(k) + 2.1 }], null); closedDoor(xm - 0.45, xm + 0.45, level(k)); }
    } else if (s.kind === 'rooms') {
      for (let k = 0; k < FLOORS; k++) box(v, m.ceil, s.x0, s.x1, FACE, back, level(k) + CEIL, level(k) + CEIL + 0.02, 'D');     // balcony ceilings
      for (const r of s.rooms) {
        const pc = (r.px0 + r.px1) / 2;
        if (r.wetW && r.j < s.n - 1) box(v, m.tile, r.x1 - 0.06, r.x1 + 0.06, FACE, back, BASE, yF - SLAB, 'WEF');   // fin between two balconies: the white post
        stain(r.px0, r.px1, FACE, level(1), yFa, -1, 0.35 + 0.5 * rnd());
        box(ex2, m.pvc, (r.wetW ? r.px0 : r.px1) - 0.035, (r.wetW ? r.px0 : r.px1) + 0.035, FACE - 0.1, FACE - 0.03, 0.4, yFa, 'FWE');   // drain stack on the pier
        for (let k = 0; k < FLOORS; k++) {
          const y = level(k), open = isOpen(k, r), ww = { a: pc - 0.3, b: pc + 0.3, y0: y + 1.45, y1: y + 2.25 };
          // brick pier half with the wet cell's window; the brick flank toward the balcony
          wall(v, 'x', r.px0, r.px1, FACE, FACE + WALL, y, y + FH, [ww], m.brick, null);
          pane(v, 'x', ww.a, ww.b, ww.y0, ww.y1, FACE + 0.11, m.win); frame(ex2, 'x', ww.a, ww.b, ww.y0, ww.y1, FACE + 0.07, FACE + 0.13, m.frame, 0, ww.y0 + 0.5, 0.045);
          box(ex2, m.white, ww.a - 0.05, ww.b + 0.05, FACE - 0.05, FACE + 0.07, ww.y0 - 0.05, ww.y0, 'FUDWE');
          box(v, m.brick, r.wetW ? r.px1 - 0.12 : r.px0, r.wetW ? r.px1 : r.px0 + 0.12, FACE + WALL, back, y, y + CEIL, r.wetW ? 'E' : 'W');
          const xfl = r.wetW ? r.px1 : r.px0, fs = r.wetW ? 1 : -1;                                           // the wet cell's door on the flank
          box(ex2, m.pvc, Math.min(xfl, xfl + fs * 0.025), Math.max(xfl, xfl + fs * 0.025), FACE + 0.4, FACE + 1.1, y + 0.02, y + 2.0, (r.wetW ? 'E' : 'W') + 'FKU');
          if (rnd() < 0.86) acAt(pc, y + 0.74);
          // balcony: front upstand with a rail, floor, back wall with a glazed door and a window
          box(v, m.tile, r.bx0, r.bx1, FACE, FACE + 0.1, y - SLAB, y + 0.95, 'FKU');
          stain(r.bx0, r.bx1, FACE, y - SLAB, y + 0.95, -1, 0.3 + 0.6 * rnd());
          box(ex2, m.inox, r.bx0, r.bx1, FACE + 0.03, FACE + 0.07, y + 1.07, y + 1.11); for (const t of [0.25, 0.75]) box(ex2, m.inox, r.bx0 + (r.bx1 - r.bx0) * t - 0.015, r.bx0 + (r.bx1 - r.bx0) * t + 0.015, FACE + 0.035, FACE + 0.065, y + 0.95, y + 1.07, 'WEFK');
          box(v, m.floor, r.bx0, r.bx1, FACE + 0.1, back, y - 0.02, y, 'U');
          const bd = { a: r.bdoor[0], b: r.bdoor[1], y0: y, y1: y + 2.1 }, bw = { a: r.bwin[0], b: r.bwin[1], y0: y + 0.9, y1: y + 2.1 };
          wall(v, 'x', r.bx0, r.bx1, back, back + WALL, y, y + CEIL, [bd, bw], m.maroon, open ? m.plaster : null);
          pane(v, 'x', bw.a, bw.b, bw.y0, bw.y1, back + 0.1, m.win); frame(ex2, 'x', bw.a, bw.b, bw.y0, bw.y1, back + 0.06, back + 0.12, m.frame, 1);
          if (open) {
            const ha = r.wetW ? bd.a - 0.84 : bd.b, hb = r.wetW ? bd.a : bd.b + 0.84;                          // the open leaf lies against the wall inside
            pane(v, 'x', ha + 0.03, hb - 0.03, y + 0.05, y + 2.05, back + WALL + 0.03, m.win); frame(ex2, 'x', ha, hb, y + 0.02, y + 2.08, back + WALL + 0.01, back + WALL + 0.05, m.frame, 0, y + 1.0);
            frame(ex2, 'x', bd.a - 0.04, bd.b + 0.04, y - 0.04, y + 2.14, back + 0.04, back + 0.14, m.frame);
            box(v, m.plaster, r.px0, r.px1, back, back + WALL, y, y + CEIL, 'K');
            // the room's shell: floor, ceiling, the two party walls
            floorCeil(r.x0 + 0.1, r.x1 - 0.1, back + WALL, court - WALL, y);
            box(v, m.plaster, r.x0 - 0.1, r.x0 + 0.1, back + WALL, court - WALL, y, y + CEIL, 'E'); box(v, m.plaster, r.x1 - 0.1, r.x1 + 0.1, back + WALL, court - WALL, y, y + CEIL, 'W');
          } else { pane(v, 'x', bd.a, bd.b, bd.y0, bd.y1, back + 0.1, m.win); frame(ex2, 'x', bd.a, bd.b, bd.y0, bd.y1, back + 0.06, back + 0.12, m.frame, 0, y + 1.0); }
          // drying rails under the balcony ceiling, with washing
          for (const dd of [0.5, 0.9]) box(ex2, m.inox, r.bx0 + 0.12, r.bx1 - 0.12, FACE + dd - 0.012, FACE + dd + 0.012, y + 2.5, y + 2.524);
          if (!low) for (let q = 0, n = Math.floor(rnd() * 5.5), xw = r.bx0 + 0.3 + rnd() * 0.2; q < n && xw < r.bx1 - 0.45; q++) {
            const w = 0.36 + rnd() * 0.16, hgt = 0.45 + rnd() * 0.4, dd = rnd() < 0.7 ? 0.5 : 0.9, colr = WASH[Math.floor(rnd() * WASH.length)];
            box(ex, plain('dormwash' + colr, colr, 0.9), xw, xw + w, FACE + dd - 0.012, FACE + dd + 0.012, y + 2.44 - hgt, y + 2.44, 'FKWED');
            box(ex2, m.dark, xw + w / 2 - 0.012, xw + w / 2 + 0.012, FACE + dd - 0.006, FACE + dd + 0.006, y + 2.44, y + 2.5, 'FKWE');
            xw += w + 0.06 + rnd() * 0.3;
          }
          // gallery side: door with a glazed transom, a high window; open rooms have their leaf swung in
          const gdoor = { a: r.door[0], b: r.door[1], y0: y, y1: y + 2.6 }, gw = { a: r.win[0], b: r.win[1], y0: y + 1.55, y1: y + 2.45 };
          galleryWall({ x0: r.x0, x1: r.x1 }, k, [gdoor, gw], open ? m.plaster : null);
          pane(v, 'x', gw.a, gw.b, gw.y0, gw.y1, court - 0.1, m.win); frame(ex2, 'x', gw.a, gw.b, gw.y0, gw.y1, court - 0.14, court - 0.06, m.frame, 1);
          pane(v, 'x', gdoor.a, gdoor.b, y + 2.15, y + 2.6, court - 0.1, m.win); frame(ex2, 'x', gdoor.a, gdoor.b, y - 0.04, y + 2.6, court - 0.15, court - 0.05, m.doorDark, 0, y + 2.12, 0.045);
          if (open) box(v, m.door, gdoor.a + 0.05, gdoor.a + 0.09, court - WALL - 0.9, court - WALL, y + 0.01, y + 2.08, 'WEFU');
          else { box(v, m.door, gdoor.a + 0.045, gdoor.b - 0.045, court - 0.13, court - 0.09, y, y + 2.1, 'K'); box(ex2, m.inox, gdoor.b - 0.2, gdoor.b - 0.08, court - 0.09, court - 0.04, y + 0.98, y + 1.02); }
        }
      }
    } else if (s.kind === 'stair') {
      whiteBay(s);
    } else if (s.kind === 'wash') {
      whiteBay(s, m.white);
      const xm = (s.x0 + s.x1) / 2;
      for (let k = 0; k < FLOORS; k++) {
        const y = level(k);
        galleryWall(s, k, [{ a: xm - 0.6, b: xm + 0.6, y0: y, y1: y + 2.2 }], m.white);
        floorCeil(s.x0 + 0.1, s.x1 - 0.1, FACE + WALL, court - WALL, y);
      }
    } else if (s.kind === 'common') {
      // ---- dark glazing between white floor bands, set back a little; the entrance lobby on the ground floor (not in block A north) ----
      const g0 = FACE + RECESS, xm = (s.x0 + s.x1) / 2, nb = Math.max(4, Math.round((s.x1 - s.x0) / 1.44)), bw = (s.x1 - s.x0) / nb;
      const dA = [s.x0 + 1.4, s.x0 + 3.0], dB = [s.x1 - 3.0, s.x1 - 1.4], wins = [[xm - 2.4, xm - 0.4], [xm + 0.4, xm + 2.4]], dusk = litGlass(m.cwall, bw, s.x0);
      for (let k = 0; k < FLOORS; k++) {
        const y = level(k), entry = k === 0 && s.lobby, glass = entry ? m.clear : dusk;
        if (entry) { box(v, m.tile, s.x0, xm - 1.2, FACE + 0.06, g0, y, y + 0.12, 'FUE'); box(v, m.tile, xm + 1.2, s.x1, FACE + 0.06, g0, y, y + 0.12, 'FUW'); }
        else box(v, m.tile, s.x0, s.x1, FACE + 0.06, g0, y - 0.45, y + 0.12, 'FUD');                           // floor band
        if (entry) { pane(ex, 'x', s.x0, xm - 1.2, y + 0.12, y + CEIL, g0, glass); pane(ex, 'x', xm + 1.2, s.x1, y + 0.12, y + CEIL, g0, glass); pane(ex, 'x', xm - 1.2, xm + 1.2, y + 2.4, y + CEIL, g0, glass); }
        else { box(v, glass, s.x0, s.x1, g0 - 0.008, g0 + 0.008, y + 0.12, y + CEIL, 'F'); box(tier(s).fu, m.view, s.x0, s.x1, g0 - 0.008, g0 + 0.008, y + 0.12, y + CEIL, 'K'); }   // dark from outside, a bright view from inside
        for (let i = 1; i < nb; i++) { const xq = s.x0 + i * bw; if (!entry || Math.abs(xq - xm) > 1.25) box(v, m.frame, xq - 0.03, xq + 0.03, g0 - 0.12, g0 + 0.04, y + 0.12, y + CEIL, 'FWEK'); }
        box(v, m.frame, s.x0, s.x1, g0 - 0.06, g0 + 0.04, y + 2.36, y + 2.44, 'FUDK'); if (!entry) box(v, m.frame, s.x0, s.x1, g0 - 0.06, g0 + 0.04, y + 0.96, y + 1.04, 'FUDK');
        const ops = [dA, dB].map(q => ({ a: q[0], b: q[1], y0: y, y1: y + 2.2 })).concat(wins.map(q => ({ a: q[0], b: q[1], y0: y + 1.0, y1: y + 2.3 })));
        galleryWall(s, k, ops, m.plaster);
        for (const q of wins) { pane(v, 'x', q[0], q[1], y + 1.0, y + 2.3, court - 0.1, m.win); frame(ex2, 'x', q[0], q[1], y + 1.0, y + 2.3, court - 0.14, court - 0.06, m.frame, 2); }
        for (const q of [dA, dB]) { frame(ex2, 'x', q[0] - 0.04, q[1] + 0.04, y - 0.04, y + 2.24, court - 0.16, court - 0.04, m.doorDark, 0, 0, 0.045);      // double doors standing open
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
  for (const X of colX) { box(v, m.tile, X - 0.18, X + 0.18, gx - 0.4, gx + 0.02, 0, yF - SLAB, 'WEFK'); }
  for (let k = 0; k < FLOORS; k++) {
    const y = level(k);
    box(v, m.floor, xa, xG1, court, gx - (k ? 0.12 : 0), y - 0.02, y, 'U'); box(v, m.ceil, xa, xG1, court, gx, y + CEIL, y + CEIL + 0.02, 'D');
    if (k) {                                                               // upstand with an edge beam, a steel rail on it
      box(v, m.tile, xa, xG1, gx - 0.12, gx, y - 0.45, y + 1.0, 'KUD'); box(v, m.gwall, xa, xG1, gx - 0.12, gx, y, y + 1.0, 'F');

      for (let x = xa; x < xG1 - 0.5; x += 12.2) stain(x, Math.min(xG1, x + 12.2), gx, y - 0.45, y + 1.0, 1, 0.15 + 0.3 * rnd());
      box(ex2, m.inox, xa, xG1, gx - 0.085, gx - 0.035, y + 1.1, y + 1.14);
      for (let x = xa + 0.6; x < xG1 - 0.3; x += low ? 2.4 : 1.2) box(ex2, m.inox, x - 0.012, x + 0.012, gx - 0.072, gx - 0.048, y + 1.0, y + 1.1, 'WEFK');
    }
    for (let i = 0; i < colX.length - 1; i++) if (colX[i + 1] - colX[i] > 2) {                                 // one ceiling lamp per bay
      const xm = (colX[i] + colX[i + 1]) / 2; box(ex, m.lamp, xm - 0.16, xm + 0.16, court + 0.84, court + 1.16, y + CEIL - 0.05, y + CEIL, 'DWEFK');
      if (k === 0 && i % 2 === 0) LIT.push([...P.toWorld(xm, gx + 1.3), 4.5]);
    }
  }
  for (let x = xa + 6; x < xG1 - 3; x += 14.6) box(ex2, m.pvc, x - 0.05, x + 0.05, gx, gx + 0.1, 0.1, yF - SLAB, 'KWE');   // rainwater pipes

  // ================= stair cores =================
  for (const s of sections) if (s.kind === 'stair') {
    const S = s.st, T = tier(s);
    box(v, m.plaster, S.xw0, S.xw1, S.zb - WALL, S.zb, BASE, yF - SLAB, 'K');
                                   // the well is closed for the walker
    box(v, m.floor, S.xw0, S.xw1, S.zb, S.zl, BASE - 0.02, BASE, 'U');
    box(v, m.plaster, S.xB0, S.xB1, S.zl - 0.1, S.zl, BASE, BASE + CEIL, 'K');   // store under the first flight
    box(T.fu, m.door, S.xB0 + 0.4, S.xB0 + 1.2, S.zl, S.zl + 0.02, BASE, BASE + 1.9, 'KWEU');
    for (let k = 0; k < FLOORS; k++) {
      const y = level(k), ym = y + FH / 2, y1 = y + FH, last = k === FLOORS - 1;
      box(v, m.floor, S.xw0, S.xw1, S.zl, court, y - 0.02, y, 'U');
      box(v, m.ceil, S.xw0, S.xw1, last ? S.zb : S.zl, court, y + CEIL, y + CEIL + 0.02, 'D');
      box(v, m.gwall, s.x0, s.x1, court - WALL, court, y + 2.45, y + CEIL, 'KFD');                              // beam over the opening to the gallery
      box(T.fu, m.lamp, (S.xw0 + S.xw1) / 2 - 0.5, (S.xw0 + S.xw1) / 2 + 0.5, S.zl + 0.2, S.zl + 0.28, y + CEIL - 0.04, y + CEIL, 'DWEFK');
      if (last) {                                                           // guard over the void of the last flight
        box(v, m.gwall, S.xA0, S.xA1, S.zl - 0.1, S.zl, y, y + 1.05, 'FKU');
        box(T.fu, m.inox, S.xA0, S.xA1, S.zl - 0.075, S.zl - 0.025, y + 1.1, y + 1.14);
        continue;
      }
      // half landing
      box(v, m.floor, S.xw0, S.xw1, S.zb, S.zh, ym - 0.02, ym, 'U'); box(v, m.ceil, S.xw0, S.xw1, S.zb, S.zh, ym - SLAB, ym - 0.02, 'DK');

      // flights: A (east half) rises toward the street, B (west half) comes back to the gallery
      incl(v, m.ceil, S.xA0, S.xA1, S.zl, y, S.zh, ym, 0.16, 'USN'); incl(v, m.ceil, S.xB0, S.xB1, S.zh, ym, S.zl, y1, 0.16, 'USN');

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

    }
    for (const [da, db, out] of [[d0, d0 + 0.12, 'F'], [d1 - 0.12, d1, 'K']]) {                                  // upstands on both edges
      const x1 = xe(out === 'F' ? da : db) + 0.05;
      box(v, m.tile, x0, x1, da, db, y - 0.45, y + 1.0, out + 'UD'); box(v, m.gwall, x0, x1, da, db, y, y + 1.0, out === 'F' ? 'K' : 'F');
      box(ex2, m.inox, x0, x1, (da + db) / 2 - 0.025, (da + db) / 2 + 0.025, y + 1.1, y + 1.14);
    }
  }

  // ================= block A north: the colonnade and the lobby behind its glass =================
  if (lobbySec) {
    const s = lobbySec, x0 = s.x0, span = L - x0, yCol = H - 0.75, y = BASE;
    // porch: platform to the roof outline, a step along its front
    box(v, m.plinth, x0, L - FACE, 0, FACE, 0, BASE, 'FWE'); box(v, m.floor, x0, xb, 0, gd, BASE - 0.02, BASE, 'U');
    box(v, m.stone, x0, L - FACE, -0.36, 0, 0, BASE / 2, 'UFWE');
    for (let i = 0; i < 6; i++) {                                           // six slender columns
      const cx = x0 + span / 12 + i * span / 6;
      cyl(v, m.white, cx, FACE + 0.45, BASE, 0.3, yCol - BASE, 18, false);
      cyl(v, m.plinth, cx, FACE + 0.45, BASE, 0.36, 0.12, 18);
    }
    // glass wall: clear on the ground floor with two door openings, teal above, white bands at the floor lines
    const doors = [x0 + span / 3, x0 + 2 * span / 3].map(xc => [xc - 1.0, xc + 1.0]);
    let xg = x0 + 0.1;
    for (const [a, b] of doors) { pane(ex, 'x', xg, a, y + 0.02, y + CEIL, gd, m.clear); pane(ex, 'x', a, b, y + 2.4, y + CEIL, gd, m.clear); xg = b; }
    pane(ex, 'x', xg, xb, y + 0.02, y + CEIL, gd, m.clear);
    box(v, litGlass(m.teal, (xb - x0) / Math.round((xb - x0) / 1.95), x0), x0 + 0.1, xb, gd, gd + 0.02, level(1), yF, 'F');
    for (let k = 1; k <= FLOORS; k++) box(v, m.tile, x0, xb, gd - 0.1, gd, level(k) - 0.38, level(k), 'FUD');
    const nm = Math.round((xb - x0) / 1.95);
    for (let i = 1; i < nm; i++) { const xq = x0 + i * (xb - x0) / nm, atDoor = doors.some(([a, b]) => xq > a + 0.05 && xq < b - 0.05); box(v, m.frame, xq - 0.035, xq + 0.035, gd - 0.07, gd + 0.03, atDoor ? y + 2.4 : y, yF - 0.02, 'FWEK'); }
    box(v, m.frame, x0, xb, gd - 0.05, gd + 0.03, y + 2.36, y + 2.44, 'FUDK');
    for (const [a, b] of doors) for (const xl of [a + 0.02, b - 0.02]) { frame(v, 'd', gd + 0.03, gd + 0.97, y + 0.02, y + 2.36, xl - 0.02, xl + 0.02, m.frame, 0, y + 1.05, 0.07); pane(ex, 'd', gd + 0.1, gd + 0.9, y + 0.09, y + 2.29, xl, m.clear); }   // glazed leaves swung in
    box(v, m.tile, x0, xb, gd - 0.1, gd + 0.4, yF - 0.02, yCol, 'FD');                                          // white band over the glass, under the roof slab
    box(v, m.tile, xb, L - FACE, FACE, 6.0, yF, yCol, 'EW'); box(v, m.tile, xb, xb + 0.02, FACE, gd, BASE, yCol, 'W'); box(v, m.tile, x0 - 0.02, x0, FACE, gd, BASE, yCol, 'E');
    box(v, m.white, x0, L, 0, 6.0, yCol, yCol + 0.6);              // thin roof slab over the columns
    for (let xr = x0 + 0.5; xr < L - 0.8; xr += 1.2) box(v, m.frame, xr, xr + 0.5, 0.3, 5.7, yCol + 0.6, H, 'WEFKU');   // ribbed strip seen from above
    stain(x0, L, 0, yCol, yCol + 0.6, -1, 0.7);
    // the lobby's shell and its doors to the gallery
    floorCeil(x0 + 0.1, xb, gd, court - WALL, y);
    const gA = [x0 + 3.0, x0 + 4.8], gB = [xb - 4.8, xb - 3.0], gw = [[x0 + 7.0, x0 + 9.4], [x0 + 11.0, x0 + 13.4], [x0 + 15.0, x0 + 17.4]];
    galleryWall(s, 0, [gA, gB].map(q => ({ a: q[0], b: q[1], y0: y, y1: y + 2.3 })).concat(gw.map(q => ({ a: q[0], b: q[1], y0: y + 1.0, y1: y + 2.3 }))), m.plaster);
    for (const q of gw) { pane(v, 'x', q[0], q[1], y + 1.0, y + 2.3, court - 0.1, m.win); frame(ex2, 'x', q[0], q[1], y + 1.0, y + 2.3, court - 0.14, court - 0.06, m.frame, 2); }
    for (const q of [gA, gB]) { frame(ex2, 'x', q[0] - 0.04, q[1] + 0.04, y - 0.04, y + 2.34, court - 0.16, court - 0.04, m.doorDark, 0, 0, 0.045);
      box(v, m.door, q[0], q[0] + 0.04, court - WALL - 0.88, court - WALL, y + 0.01, y + 2.26, 'WEFU'); box(v, m.door, q[1] - 0.04, q[1], court - WALL - 0.88, court - WALL, y + 0.01, y + 2.26, 'WEFU'); }
    box(v, m.plaster, xb - 0.01, xb + 0.01, gd, court - WALL, y, y + CEIL, 'W');
    for (let k = 1; k < FLOORS; k++) {                                      // rooms above the lobby: closed doors on the gallery
      const yk = level(k), ds = [x0 + 3.2, x0 + 11.2, xb - 4.4].map(a => [a, a + 1.2]);
      galleryWall(s, k, ds.map(q => ({ a: q[0], b: q[1], y0: yk, y1: yk + 2.1 })).concat([[x0 + 6.0, x0 + 9.0], [x0 + 14.2, x0 + 17.2]].map(q => ({ a: q[0], b: q[1], y0: yk + 1.3, y1: yk + 2.3 }))), null);
      for (const q of ds) closedDoor(q[0], q[1], yk, 2.1, true);
      for (const q of [[x0 + 6.0, x0 + 9.0], [x0 + 14.2, x0 + 17.2]]) { pane(v, 'x', q[0], q[1], yk + 1.3, yk + 2.3, court - 0.1, m.win); frame(ex2, 'x', q[0], q[1], yk + 1.3, yk + 2.3, court - 0.14, court - 0.06, m.frame, 3); }
    }
  }

  // ================= entrance of the other blocks: steps, a canopy on two columns, open glass doors =================
  for (const s of sections) if (s.kind === 'common' && s.lobby) {
    const xm = (s.x0 + s.x1) / 2, g0 = FACE + RECESS, y = BASE, a = xm - 3.0, b = xm + 3.0, dFront = -1.3;
    box(v, m.plinth, a, b, dFront, FACE, 0, BASE, 'FWE'); box(v, m.floor, a, b, dFront, g0, BASE - 0.02, BASE, 'U');
    box(v, m.stone, a, b, dFront - 0.36, dFront, 0, BASE / 2, 'UFWE');
    for (const sx of [-1, 1]) {
      const xc = xm + sx * 2.75;
      cyl(v, m.white, xc, dFront + 0.25, BASE, 0.09, 2.78, 12, false);
      box(v, m.stone, sx < 0 ? a - 0.5 : b, sx < 0 ? a : b + 0.5, dFront + 0.2, FACE - 0.03, 0, 0.62, 'FWEU');   // planter walls beside the steps
      frame(v, 'd', g0 + 0.03, g0 + 1.15, y + 0.02, y + 2.36, xm + sx * 1.18 - 0.02, xm + sx * 1.18 + 0.02, m.frame, 0, y + 1.05, 0.07); pane(ex, 'd', g0 + 0.1, g0 + 1.08, y + 0.09, y + 2.29, xm + sx * 1.18, m.clear);   // glazed leaves swung in
    }
    box(v, m.white, a - 0.3, b + 0.3, dFront - 0.25, FACE + 0.06, y + 2.78, y + 2.98); box(v, m.frame, a - 0.3, b + 0.3, dFront - 0.27, dFront - 0.25, y + 2.72, y + 3.3, 'FUDWE');

    box(ex2, m.lamp, xm - 0.8, xm + 0.8, dFront + 0.5, dFront + 0.62, y + 2.74, y + 2.78, 'DWEFK'); LIT.push([...P.toWorld(xm, dFront - 1.2), 5]);
    box(v, m.frame, xm - 1.24, xm - 1.18, g0 - 0.06, g0 + 0.04, y, y + 2.4, 'FWEK'); box(v, m.frame, xm + 1.18, xm + 1.24, g0 - 0.06, g0 + 0.04, y, y + 2.4, 'FWEK');
    if (letters2 && P.name) [...('学生公寓' + P.name)].forEach((ch, i, all) => { const dir = streetNorth ? 1 : -1, off = ((all.length - 1) / 2 - i) * 0.5 + (i > 3 ? -0.12 : 0.12); card(letters2, glyphs().uv(ch), xm + dir * off, dFront - 0.275, y + 3.02, 0, -1, 0.4, 0.4); });
  }

  // ================= roof: water tank, solar heaters, lightning rods =================
  if (sp.blue) { const xc = (sp.blue[0] + sp.blue[1]) / 2, r = Math.min(2.0, (sp.blue[1] - sp.blue[0]) / 2); cyl(v, m.blue, xc, 3.2, yDeck + 0.25, r, 1.6, 20); box(v, m.concrete, xc - r, xc + r, 3.2 - r, 3.2 + r, yDeck, yDeck + 0.25, 'WEFKU'); }
  for (const [a, b] of sp.ribbed || []) {
    const n = Math.max(1, Math.round((b - a) / 2.1)), w = (b - a) / n;
    for (let i = 0; i < n; i++) {
      const x0 = a + i * w + 0.12, x1 = a + (i + 1) * w - 0.12;
      const dLo = streetNorth ? 5.3 : 1.7, dHi = streetNorth ? 2.2 : 4.8;                                      // the collectors face south
      incl(v, m.solar, x0, x1, dLo, yDeck + 0.45, dHi, yDeck + 1.75, 0.06, 'D'); box(v, m.frame, x0 - 0.05, x1 + 0.05, Math.min(dHi, dHi + (dHi - dLo) * 0.2), Math.max(dHi, dHi + (dHi - dLo) * 0.2), yDeck + 1.5, yDeck + 2.05, 'WEFKU');   // collector and its tank
      for (const xl of [x0, x1 - 0.05]) { box(ex2, m.inox, xl, xl + 0.05, dHi - 0.025, dHi + 0.025, yDeck, yDeck + 1.5, 'WEFK'); box(ex2, m.inox, xl, xl + 0.05, dLo - 0.025, dLo + 0.025, yDeck, yDeck + 0.42, 'WEFK'); }
    }

  }
  for (const [x, d] of [[0.15, 0.15], [L - 0.15, D - 0.15], [0.15, D - 0.15], ...(col ? [] : [[L - 0.15, 0.15]]), [L / 2, D - 0.15], [L * 0.3, 0.15]]) cyl(ex2, m.inox, x, d, H, 0.018, 1.3, 5, false);
  box(ex2, m.dark, 0.5, xF1 - 0.5, 0.13, 0.17, H, H + 0.03, 'UFK'); box(ex2, m.dark, 0.5, L - 0.5, D - 0.17, D - 0.13, H, H + 0.03, 'UFK');   // lightning strip on the parapet

  // ================= fascia lettering (block A north) =================
  if (sp.slogan && letters) {
    const dir = streetNorth ? 1 : -1, pitch = 3.1, size = 1.5, xc = sections.find(s => s.kind === 'common').x0, yc = (yFa + H) / 2 + 0.05, uv = glyphs().uv;
    // the reader's left is east when the face looks north. Seen: 面向世界, centred on xc. Imagined: the phrases either side of it.
    [['面向现代化', 5.5], ['面向世界', 0], ['面向未来', -5]].forEach(([text, off]) => [...text].forEach((ch, i, all) => card(letters, uv(ch), xc + dir * (off + (all.length - 1) / 2 - i) * pitch, -0.03, yc, 0, -1, size, size)));
  }

  // ================= interiors and small things (shown from near) =================
  const tint = (hex, rough = 0.8, metal = 0) => plain('dormcol', hex, rough, metal);
  const SHEET = [0x8fb1d6, 0xcfd9e8, 0xe6d6b4, 0xa9c8a4, 0xe0b3bd, 0x97a6bd, 0xd6d6db], QUILT = [0x4f79b8, 0x6a9bd1, 0xd8c08a, 0x7fae7a, 0xd98a9a, 0x5b6f8f, 0xb9bcc6, 0x3f5f9a];
  const TOWEL = [0xf2e9d0, 0x7fb2d8, 0xe58f8f, 0x9bcf9b, 0xf0d060, 0xffffff], BOOK = [0x2f5f9e, 0xb8322a, 0x3d8a55, 0xd9a520, 0xe9e2cf, 0x6b4e8a, 0x2a8a96, 0xf4f4f0, 0x33373d];
  const CASE = [0x2f4f7f, 0xb23a3a, 0x3a3d44, 0xd9b23a, 0x7f8a94, 0x7a4fa0], SHOE = [0xf2f2f0, 0x2a2c2f, 0x3a66b0, 0xb8322a, 0x8a8f96], PAIL = [0xd04a3a, 0x3a7fd0, 0x4fae6a, 0xe9e2cf];
  /** Potted plant: a pot with a rim and soil; its foliage is added at the end (a leafy ball of flora.js, or a small tree in a tub when tall). */
  const greens = new Map();                                                   // per batch: what grows in the pots drawn into it
  const plant = (b, x, d, y, s = 1, tall = false) => {
    const G = greens.get(b) || greens.set(b, { balls: [], trees: [] }).get(b), r = (tall ? 0.25 : 0.17) * s, h = (tall ? 0.46 : 0.24) * s, pot = tint(tall ? 0x77726c : 0xa9583c, 0.75);
    cyl(b, pot, x, d, y, r * 0.84, h - 0.035 * s, 12, false); cyl(b, pot, x, d, y + h - 0.035 * s, r, 0.035 * s, 12); cyl(b, tint(0x3f3327, 0.95), x, d, y + h - 0.004, r * 0.84, 0.006, 10);
    if (tall) G.trees.push([x, d, y + h - 0.03, (1.15 + 0.25 * rnd()) * s]); else G.balls.push([x, d, y + h - 0.02, 0.27 * s]);
  };
  /** Chair seen from all sides: seat, back, four legs. dir: [dx, dd] the way it faces. */
  const chair = (F, X, material, x, d, y, dir) => {
    box(F, material, x - 0.2, x + 0.2, d - 0.2, d + 0.2, y + 0.43, y + 0.46);
    if (dir[0]) box(F, material, dir[0] > 0 ? x - 0.2 : x + 0.17, dir[0] > 0 ? x - 0.17 : x + 0.2, d - 0.2, d + 0.2, y + 0.46, y + 0.86); else box(F, material, x - 0.2, x + 0.2, dir[1] > 0 ? d - 0.2 : d + 0.17, dir[1] > 0 ? d - 0.17 : d + 0.2, y + 0.46, y + 0.86);
    for (const [a, c] of [[-0.19, -0.19], [-0.19, 0.16], [0.16, -0.19], [0.16, 0.16]]) box(X, m.dark, x + a, x + a + 0.03, d + c, d + c + 0.03, y, y + 0.43, 'WEFK');
  };
  /** Hanging tube light and its glowing underside, long axis along the block. */
  const tube = (F, x, d, yc, len = 1.2) => { box(F, m.white, x - len / 2, x + len / 2, d - 0.05, d + 0.05, yc - 0.06, yc, 'WEFKD'); box(F, m.lamp, x - len / 2 + 0.02, x + len / 2 - 0.02, d - 0.035, d + 0.035, yc - 0.075, yc - 0.06, 'DWEFK'); };
  const fan = (F, x, d, yc) => { box(F, m.inox, x - 0.012, x + 0.012, d - 0.012, d + 0.012, yc - 0.3, yc, 'WEFK'); cyl(F, m.white, x, d, yc - 0.38, 0.09, 0.09, 10); box(F, m.white, x - 0.62, x + 0.62, d - 0.06, d + 0.06, yc - 0.345, yc - 0.335); box(F, m.white, x - 0.06, x + 0.06, d - 0.62, d + 0.62, yc - 0.345, yc - 0.335); };

  /** Two-tier bunk against a side wall. XR(a, b): x range a..b metres from that wall; side 1 = west wall, -1 = east wall. */
  const PILLOW = [0xffffff, 0xf4efe2, 0xdfe8f2, 0xf2dfe4, 0xe9e2c9], CURT = [0x5f7fa8, 0xd9a0ad, 0x8f9399, 0x7fa58a, 0x33466b, 0xd8c9a8, 0x6b5a8a];
  const bunk = (B, F, X, C, XR, side, d0, y, R, steel, board, pick) => {
    const d1 = d0 + 2.0, mx = (XR(0.04, 0.91)[0] + XR(0.04, 0.91)[1]) / 2, md = (d0 + d1) / 2, turn = side > 0 ? 0 : Math.PI, xa0 = XR(0.915, 0.915)[0];   // bed centre; the shapes' +x toward the aisle; the aisle edge
    for (const a of [0, 0.91]) for (const d of [d0, d1 - 0.04]) box(F, steel, ...XR(a, a + 0.04), d, d + 0.04, y, y + 1.9, 'WEFK');
    for (const yb of [y + 0.42, y + 1.5]) {
      for (const a of [0, 0.92]) box(F, steel, ...XR(a, a + 0.03), d0 + 0.04, d1 - 0.04, yb - 0.07, yb, 'WEUD');
      for (const d of [d0, d1 - 0.03]) { box(F, steel, ...XR(0.04, 0.91), d, d + 0.03, yb - 0.07, yb, 'FKUD'); box(F, steel, ...XR(0.04, 0.91), d, d + 0.03, yb + 0.36, yb + 0.4, 'FKUD'); }
      box(F, board, ...XR(0.03, 0.92), d0 + 0.03, d1 - 0.03, yb - 0.03, yb, 'D');
      // bedding, soft and different from bed to bed: mattress under a sheet, a pillow, the quilt folded square at the foot or thrown back
      const top = yb + 0.105, quilt = pick(QUILT), made = R() < 0.66, atD0 = R() < 0.5, pd = atD0 ? d0 + 0.3 : d1 - 0.3, qd = atD0 ? d1 - 0.38 : d0 + 0.38;
      B.mattress.push([instM(mx, md, yb + 0.052), pick(SHEET)]);
      B.pillow.push([instM(mx + (R() - 0.5) * 0.14, pd + (R() - 0.5) * 0.06, top + 0.05, (R() - 0.5) * 0.5, 0.9 + 0.2 * R(), 0.8 + 0.4 * R(), 1), pick(PILLOW)]);
      if (made) { const yq = (R() - 0.5) * 0.16; B.fold.push([instM(mx, qd, top + 0.045, yq), quilt], [instM(mx + (R() - 0.5) * 0.03, qd, top + 0.135, yq + (R() - 0.5) * 0.08, 0.95, 1, 0.93), quilt]); }
      else B.spread.push([instM(mx, atD0 ? md + 0.24 : md - 0.24, top, turn, 1, 0.85 + 0.4 * R(), 1), quilt]);
      if (R() < 0.55) { const len = 0.45 + 0.5 * R(); B.sheet.push([instM(xa0, md + (R() - 0.5) * 1.8 * (1 - len), top - 0.015, turn, 1, 0.7 + 0.6 * R(), len), pick(SHEET)]); }   // a sheet edge hanging over the frame
      if (R() < 0.6) box(X, tint(pick(TOWEL), 0.95), ...XR(0.2, 0.52), d1 - 0.004, d1 + 0.016, yb + 0.02, yb + 0.4, 'KWEUD');   // towel over the end rail
    }
    box(F, steel, ...XR(0.92, 0.95), d0 + 0.62, d1 - 0.04, y + 1.8, y + 1.83, 'WEUD');                                    // guard rail of the upper bed
    // some beds have a curtain (the lower one hung from the upper frame, the upper one from a rod under the ceiling) or a mosquito net
    if (R() < 0.32) { const len = 1.36 * (0.45 + 0.55 * R()); B.drape.push([instM(XR(0.972, 0.972)[0], d1 - 0.03 - len / 2, y + 0.94, turn, 1, 0.94, len), pick(CURT)]); }
    const up = R();
    if (up < 0.22) { const len = 1.9 * (0.45 + 0.55 * R()); box(F, steel, ...XR(0.955, 0.975), d0, d1, y + 2.5, y + 2.52, 'WEUD'); for (const dq of [d0 + 0.2, d1 - 0.2]) box(X, steel, ...XR(0.96, 0.97), dq, dq + 0.01, y + 2.52, y + CEIL, 'WEFK');
      B.drape.push([instM(XR(0.966, 0.966)[0], d1 - len / 2, y + 2.0, turn, 1, 1.0, len), pick(CURT)]); }
    else if (up < 0.42) B.net.push([instM(mx, md, y + 1.605 + 0.46, 0, 1, 1, 1), 0xffffff]);
    for (const d of [d0 + 0.12, d0 + 0.5]) box(F, steel, ...XR(0.95, 0.98), d, d + 0.03, y, y + 1.5, 'WEFK');             // ladder
    for (const yr of [0.3, 0.62, 0.94, 1.26]) box(F, steel, ...XR(0.95, 0.98), d0 + 0.15, d0 + 0.5, y + yr, y + yr + 0.025, 'WEUD');
    for (let i = 0, n = 1 + Math.floor(R() * 3), d = d0 + 0.75 + R() * 0.2; i < n; i++, d += 0.33 + R() * 0.1) { const cs = tint(pick(SHOE), 0.7); for (const o of [0, 0.13]) box(X, cs, ...XR(0.62, 0.88), d + o, d + o + 0.1, y, y + 0.09, 'UWEFK'); }   // shoes under the bed
    if (R() < 0.7) cyl(X, tint(pick(PAIL), 0.5), XR(0.3, 0.3)[0], d1 - 0.4, y, 0.19, 0.11, 10);
    if (R() < 0.5) box(X, tint(0xb9a27c, 0.9), ...XR(0.08, 0.5), d0 + 0.75, d0 + 1.2, y, y + 0.3, 'UWEFK');
    if (R() < 0.6) card(C, uvOf('p' + Math.floor(R() * 6)), XR(0, 0)[0] + side * 0.008, d0 + 0.5 + R(), y + 2.2, side, 0, 0.42, 0.58);   // a poster by the upper bed
  };

  /** A furnished room for eight: desks by the balcony wall, bunks, lockers by the door; then its balcony. */
  const furnishRoom = (r, k) => {
    const T = tier(r.sec), F = T.fu, X = T.fx, C = T.cards, y = level(k), yc = y + CEIL, xi0 = r.x0 + 0.1, xi1 = r.x1 - 0.1, di0 = back + WALL, di1 = court - WALL, depth = di1 - di0, xc = r.xc;
    const R = rng(seedOf(item.id) * 7 + r.i * 97 + k * 131 + 3), pick = list => list[Math.floor(R() * list.length)];
    const steel = tint(pick([0x6f7f8f, 0x8a8f96, 0x5d6f86, 0x9a8f7a]), 0.5), wood = tint(0xcaa675, 0.6), lock = tint(pick([0xb9c2b4, 0xbfc7d1, 0xd2cbb8]), 0.6), board = tint(0xd8c39a, 0.7);
    const nb = depth >= 7.0 ? 2 : 1, lA = di0 + 1.45 + nb * 2.05, lB = di1 - 0.12;                            // bunks per side; the lockers' range
    for (const side of [1, -1]) {
      const xw = side > 0 ? xi0 : xi1, XR = (a, b) => (side > 0 ? [xw + a, xw + b] : [xw - b, xw - a]), ai = side > 0 ? 'E' : 'W', dA = di0 + 0.15, dB = di0 + 1.35;
      // desk: top, ends, drawers, two shelves with books above it, a chair
      box(F, wood, ...XR(0, 0.55), dA, dB, y + 0.73, y + 0.76); box(F, wood, ...XR(0.02, 0.53), dA, dA + 0.03, y, y + 0.73, 'FK' + ai); box(F, wood, ...XR(0.02, 0.53), dB - 0.03, dB, y, y + 0.73, 'FK' + ai);
      box(F, wood, ...XR(0.05, 0.5), dB - 0.45, dB - 0.03, y + 0.25, y + 0.73, ai + 'DF'); box(X, m.inox, ...XR(0.5, 0.52), dB - 0.3, dB - 0.18, y + 0.58, y + 0.6);
      for (const ys of [1.3, 1.62]) box(F, wood, ...XR(0, 0.22), dA, dB, y + ys, y + ys + 0.025);
      for (let d = dA + 0.04; d < dB - 0.1;) { const w = 0.025 + R() * 0.03; box(X, tint(pick(BOOK), 0.85), ...XR(0.02, 0.17 + R() * 0.04), d, d + w, y + 1.325, y + 1.5 + R() * 0.1, ai + 'UFK'); d += w + (R() < 0.12 ? 0.1 : 0.003); }
      chair(F, X, steel, XR(0.62, 0.62)[0], (dA + dB) / 2 - 0.15 + (R() - 0.5) * 0.2, y, [-side, 0]);
      // on the desk: a pile of books, a mug, a lamp, a laptop
      for (let i = 0, n = 1 + Math.floor(R() * 3), h = y + 0.76; i < n; i++, h += 0.03) box(X, tint(pick(BOOK), 0.85), ...XR(0.1 + R() * 0.03, 0.34 + R() * 0.03), dA + 0.1 + R() * 0.03, dA + 0.28 + R() * 0.03, h, h + 0.03, 'UWEFK');
      cyl(X, tint(pick(TOWEL), 0.4), XR(0.4, 0.4)[0], dA + 0.45, y + 0.76, 0.04, 0.09, 8);
      if (R() < 0.6) { const xl = XR(0.12, 0.12)[0], dl = dB - 0.12; cyl(X, m.dark, xl, dl, y + 0.76, 0.07, 0.02, 8); rod(X, m.dark, [xl, dl, y + 0.78], [xl + side * 0.1, dl - 0.12, y + 1.1], 0.02); box(X, m.white, Math.min(xl + side * 0.02, xl + side * 0.18), Math.max(xl + side * 0.02, xl + side * 0.18), dl - 0.2, dl - 0.08, y + 1.09, y + 1.12); }
      if (R() < 0.55) { box(X, tint(0x3a3d44, 0.4), ...XR(0.16, 0.42), dB - 0.75, dB - 0.4, y + 0.76, y + 0.775, 'UWEFK'); box(X, tint(0x26282c, 0.5), ...XR(0.13, 0.145), dB - 0.75, dB - 0.4, y + 0.775, y + 1.0, 'WEFKU'); box(X, tint(0x9db9dc, 0.3), ...XR(0.145, 0.148), dB - 0.73, dB - 0.42, y + 0.79, y + 0.985, ai); }
      for (let j = 0; j < nb; j++) bunk(T.soft, F, X, C, XR, side, di0 + 1.45 + j * 2.05, y, R, steel, board, pick);
      // lockers by the door: body, door joints, handles, cases and boxes on top
      const nd = Math.max(2, Math.round((lB - lA) / 0.42)), wd = (lB - lA) / nd;
      box(F, lock, ...XR(0, 0.5), lA, lB, y, y + 1.9, ai + 'UFK');
      for (let i = 1; i < nd; i++) box(X, m.dark, ...XR(0.5, 0.503), lA + i * wd - 0.004, lA + i * wd + 0.004, y + 0.04, y + 1.88, ai);
      box(X, m.dark, ...XR(0.5, 0.503), lA, lB, y + 0.945, y + 0.955, ai);
      for (let i = 0; i < nd; i++) for (const yh of [0.55, 1.4]) box(X, m.inox, ...XR(0.5, 0.515), lA + (i + 1) * wd - 0.09, lA + (i + 1) * wd - 0.06, y + yh, y + yh + 0.1);
      for (let d = lA + 0.05; d < lB - 0.5;) { const w = 0.45 + R() * 0.25, h = 0.2 + R() * 0.12; if (R() < 0.75) box(F, tint(pick(CASE), 0.5), ...XR(0.04, 0.46), d, d + w, y + 1.9, y + 1.9 + h); d += w + 0.06 + R() * 0.2; }
      // the walker meets the fronts of the furniture
      const xf = xw + side * 0.95, xl = xw + side * 0.5;
      cD(di0 + 0.12, lA, xf, y, y + 1.9, side); cX(Math.min(xf, xl), Math.max(xf, xl), lA, y, y + 1.9, 1); cD(lA, di1, xl, y, y + 1.9, side);
    }
    // ceiling fan, two tube lights, drapes at the balcony window
    fan(F, xc, (di0 + di1) / 2, yc); for (const t of [0.27, 0.73]) tube(F, xc, di0 + depth * t, yc);
    const drape = tint(pick([0x9fb7cf, 0xc8d6b0, 0xe0cfa8, 0xd6b7b0]), 0.95), [wa, wb] = r.bwin;
    box(F, drape, wa - 0.08, wa + 0.26, di0 + 0.03, di0 + 0.09, y + 0.82, y + 2.24, 'KWE'); box(F, drape, wb - 0.26, wb + 0.08, di0 + 0.03, di0 + 0.09, y + 0.82, y + 2.24, 'KWE'); box(X, m.inox, wa - 0.14, wb + 0.14, di0 + 0.05, di0 + 0.07, y + 2.24, y + 2.26);
    // by the door: vacuum flasks, a bin, a broom and dustpan; the house rules and a calendar on the walls
    const sx = r.wetW ? -1 : 1;
    for (let i = 0, n = 2 + Math.floor(R() * 2); i < n; i++) { const xq = xc + sx * (0.72 + i * 0.16); cyl(X, tint(pick([0xb8322a, 0x3d8a55, 0x2f5f9e, 0xc9cdd1]), 0.4), xq, di1 - 0.12, y, 0.055, 0.34, 8); cyl(X, m.white, xq, di1 - 0.12, y + 0.34, 0.035, 0.04, 8); }
    cyl(X, tint(0x6d7175, 0.6), xc - sx * 0.75, di1 - 0.2, y, 0.13, 0.3, 10); rod(X, wood, [xc - sx * 0.95, di1 - 0.05, y + 1.25], [xc - sx * 0.9, di1 - 0.25, y + 0.05], 0.025); box(X, tint(0xc9a14a, 0.9), xc - sx * 0.9 - 0.14, xc - sx * 0.9 + 0.14, di1 - 0.3, di1 - 0.22, y, y + 0.1);
    card(C, uvOf('rules'), xc - sx * 1.05, di1 - 0.008, y + 1.3, 0, -1, 0.3, 0.42); if (R() < 0.7) card(C, uvOf('calendar'), xi0 + 0.008, di0 + 0.75, y + 1.05, 1, 0, 0.26, 0.36);
    // balcony: basin with a tap, mirror and mugs on the fin side; a mop, a pail, slippers
    const fin = r.wetW ? r.bx1 - 0.06 : r.bx0 + 0.06, dir = r.wetW ? -1 : 1, BX = (a, b) => (dir > 0 ? [fin + a, fin + b] : [fin - b, fin - a]);
    box(F, m.basin, ...BX(0, 0.46), FACE + 0.72, FACE + 1.26, y + 0.64, y + 0.82); box(X, tint(0xaab6bd, 0.3), ...BX(0.05, 0.41), FACE + 0.77, FACE + 1.21, y + 0.82, y + 0.823, 'U'); box(F, m.basin, ...BX(0.02, 0.2), FACE + 0.89, FACE + 1.09, y, y + 0.64, 'WEFK');
    box(X, m.inox, ...BX(0.03, 0.06), FACE + 0.98, FACE + 1.0, y + 0.82, y + 0.98); box(X, m.inox, ...BX(0.03, 0.2), FACE + 0.98, FACE + 1.0, y + 0.96, y + 0.98);
    box(X, m.inox, ...BX(0, 0.012), FACE + 0.76, FACE + 1.22, y + 1.2, y + 1.75); box(F, m.white, ...BX(0, 0.12), FACE + 0.74, FACE + 1.24, y + 1.1, y + 1.12);
    for (let i = 0; i < 3; i++) if (R() < 0.8) cyl(X, tint(pick(TOWEL), 0.4), BX(0.06, 0.06)[0], FACE + 0.82 + i * 0.16, y + 1.12, 0.035, 0.09, 8);
    rod(X, wood, [BX(0.1, 0.1)[0], FACE + 0.2, y + 1.35], [BX(0.26, 0.26)[0], FACE + 0.36, y + 0.06], 0.025); box(X, tint(0xd9d2c0, 0.95), ...BX(0.16, 0.4), FACE + 0.3, FACE + 0.44, y, y + 0.08);
    cyl(X, tint(pick(PAIL), 0.5), BX(0.3, 0.3)[0], FACE + 0.56, y, 0.15, 0.26, 10);
    { const xs = (r.bdoor[0] + r.bdoor[1]) / 2 - dir * 0.2, cs = tint(pick(SHOE), 0.7); for (const o of [0, 0.13]) box(X, cs, xs + o, xs + o + 0.1, back - 0.34, back - 0.08, y, y + 0.06, 'UWEFK'); }
  };
  for (const s of sections) if (s.kind === 'rooms') for (const r of s.rooms) for (let k = 0; k < FLOORS; k++) if (isOpen(k, r)) furnishRoom(r, k);

  // ---- galleries: door numbers, signs, hose cabinets, bins, shoe racks, plants on the balustrade ----
  for (let k = 0; k < FLOORS; k++) {
    const y = level(k);
    for (const s of sections) {
      const xm = (s.x0 + s.x1) / 2, T = tier(s);
      if (s.kind === 'rooms') for (const r of s.rooms) {
        card(exCards, uvOf('n' + (k + 1) + String(r.i + 1).padStart(2, '0')), r.wetW ? r.door[0] - 0.24 : r.door[1] + 0.24, court + 0.012, y + 1.72, 0, 1, 0.28, 0.14);
        if (!low && rnd() < 0.3) {                                           // a shoe rack outside the door
          const xr = r.wetW ? r.door[0] - 0.95 : r.door[1] + 0.25, R = rng(r.i * 31 + k * 7 + 5);
          for (const ys of [0.02, 0.24, 0.46]) { box(T.fx, m.inox, xr, xr + 0.7, court + 0.02, court + 0.26, y + ys, y + ys + 0.015); for (let q = 0; q < 3; q++) if (R() < 0.75) { const cs = tint(SHOE[Math.floor(R() * SHOE.length)], 0.7); for (const o of [0, 0.11]) box(T.fx, cs, xr + 0.03 + q * 0.23 + o, xr + 0.03 + q * 0.23 + o + 0.09, court + 0.03, court + 0.25, y + ys + 0.015, y + ys + 0.1, 'UWEK'); } }
          for (const xx of [xr, xr + 0.68]) box(T.fx, m.inox, xx, xx + 0.02, court + 0.02, court + 0.26, y, y + 0.5, 'WEK');
        }
      } else if (s.kind === 'wash') card(exCards, uvOf('wash'), xm, court + 0.012, y + 2.5, 0, 1, 0.56, 0.28);
      else if (s.kind === 'common') { for (const xd of [s.x0 + 2.2, s.x1 - 2.2]) card(exCards, uvOf(k === 0 ? (s.lobby ? 'duty' : 'activity') : 'study'), xd, court + 0.012, y + 2.5, 0, 1, k === 0 && s.lobby ? 0.9 : 0.56, 0.28); }
      else if (s.kind === 'end') card(exCards, uvOf(s === sections[0] ? 'water' : 'store'), xm, court + 0.012, y + 2.32, 0, 1, s === sections[0] ? 0.5 : 0.42, 0.25);
      else if (s.kind === 'lobby' && k === 0) { for (const xd of [s.x0 + 3.9, s.x1 - 3.9]) card(exCards, uvOf('duty'), xd, court + 0.012, y + 2.55, 0, 1, 0.9, 0.26); }
      else if (s.kind === 'stair') {                                          // floor number and exit sign on the beam, a hose cabinet, extinguishers and bins beside the opening
        card(exCards, uvOf('f' + (k + 1)), xm - 0.5, court + 0.012, y + 2.65, 0, 1, 0.3, 0.3); card(exCards, uvOf('exit'), xm + 0.35, court + 0.012, y + 2.65, 0, 1, 0.6, 0.24);
        const xh = s.x1 + 0.35; box(ex2, m.red, xh, xh + 0.6, court, court + 0.14, y + 0.8, y + 1.6, 'KWEUD'); card(exCards, uvOf('hose'), xh + 0.3, court + 0.146, y + 1.2, 0, 1, 0.56, 0.75);
        for (const o of [0.78, 0.96]) { cyl(ex2, m.red, xh + o, court + 0.1, y, 0.065, 0.42, 8); cyl(ex2, m.dark, xh + o, court + 0.1, y + 0.42, 0.025, 0.1, 6); }
        cyl(ex2, tint(0x6d7175, 0.6), s.x0 - 0.5, court + 0.22, y, 0.19, 0.62, 10); cyl(ex2, m.green, s.x0 - 0.95, court + 0.22, y, 0.19, 0.62, 10);
      }
    }
    if (k && !low) for (let x = xa + 2 + rnd() * 4; x < xG1 - 2; x += 5 + rnd() * 9) plant(ex2, x, gx - 0.06, y + 1.0, 0.55 + rnd() * 0.25);      // pots on the balustrade
  }

  // ---- lobby: warden's desk, notice board, world map, sofa, lockers for parcels, a drinks machine, plants ----
  const lobbyFit = (s, x0, x1, dF, dB, doorsBack, doorsFront, y) => {
    const T = tier(s), F = T.fu, X = T.fx, C = T.cards, yc = y + CEIL, wood = tint(0xb98452, 0.55), dm = (dF + dB) / 2, R = rng(seedOf(item.id) + 77);
    const cxn = (doorsBack[0][1] + doorsBack[1][0]) / 2, cw = Math.min(1.7, (doorsBack[1][0] - doorsBack[0][1]) / 2 - 0.5), cF = dB - 2.1, cK = dB - 1.4;
    // the counter: a raised front with the sign, a lower desk behind it, returns at both ends
    box(F, wood, cxn - cw, cxn + cw, cF, cF + 0.12, y, y + 1.08, 'FKWE'); box(F, tint(0xe9e4d6, 0.4), cxn - cw - 0.03, cxn + cw + 0.03, cF - 0.04, cF + 0.3, y + 1.08, y + 1.12);
    box(F, tint(0xe9e4d6, 0.4), cxn - cw, cxn + cw, cF + 0.12, cK, y + 0.72, y + 0.76); for (const sx of [-1, 1]) box(F, wood, cxn + sx * cw - (sx > 0 ? 0.1 : 0), cxn + sx * cw + (sx > 0 ? 0 : 0.1), cF + 0.12, cK, y, y + 0.72, 'WEK');
    card(C, uvOf('duty'), cxn, cF - 0.008, y + 0.62, 0, -1, 1.2, 0.34);
    box(X, m.dark, cxn - 0.5, cxn - 0.05, cF + 0.34, cF + 0.37, y + 0.8, y + 1.1); box(X, m.dark, cxn - 0.3, cxn - 0.25, cF + 0.35, cF + 0.45, y + 0.76, y + 0.8); box(X, tint(0x9db9dc, 0.3), cxn - 0.48, cxn - 0.07, cF + 0.37, cF + 0.373, y + 0.82, y + 1.08, 'K');   // monitor
    box(X, m.white, cxn + 0.2, cxn + 0.5, cF + 0.4, cF + 0.62, y + 0.76, y + 0.78, 'UWEFK'); box(X, m.dark, cxn + 0.7, cxn + 0.86, cF + 0.4, cF + 0.6, y + 0.76, y + 0.82, 'UWEFK'); cyl(X, tint(0xf0d060, 0.4), cxn + 1.0, cF + 0.5, y + 0.76, 0.04, 0.1, 8);
    box(X, tint(0x2f5f9e, 0.7), cxn - cw + 0.15, cxn - cw + 0.4, cF + 0.02, cF + 0.26, y + 1.12, y + 1.14, 'UWEFK'); cyl(X, m.dark, cxn + cw - 0.3, cF + 0.14, y + 1.12, 0.03, 0.12, 6);   // the register and a pen pot on the counter
    chair(F, X, tint(0x33373d, 0.6), cxn, cK + 0.45, y, [0, -1]);
    cD(cF, cK, cxn - cw, y, y + 1.2, -1); cD(cF, cK, cxn + cw, y, y + 1.2, 1); cX(cxn - cw, cxn + cw, cF, y, y + 1.2, -1); cX(cxn - cw, cxn + cw, cK, y, y + 1.2, 1);
    // behind the desk on the back wall: key board, clock, the day's notices on a screen
    card(C, uvOf('keys'), cxn - 0.9, dB - 0.008, y + 1.55, 0, -1, 0.8, 0.6); card(C, uvOf('clock'), cxn + 0.1, dB - 0.008, y + 2.3, 0, -1, 0.36, 0.36); card(C, uvOf('tv'), cxn + 0.95, dB - 0.037, y + 1.75, 0, -1, 0.96, 0.6); box(F, m.dark, cxn + 0.45, cxn + 1.45, dB - 0.03, dB, y + 1.43, y + 2.07, 'FWEUD');
    // west wall: the notice board; east wall: the world map over a bench, the banner
    const nbw = Math.min(3.0, dB - dF - 2.2);
    box(F, tint(0xb58a55, 0.95), x0, x0 + 0.02, dm - nbw / 2, dm + nbw / 2, y + 0.95, y + 2.15, 'E'); frame(F, 'd', dm - nbw / 2 - 0.05, dm + nbw / 2 + 0.05, y + 0.9, y + 2.2, x0, x0 + 0.035, m.inox, 0, 0, 0.05);
    card(C, uvOf('notice'), x0 + 0.01, dm, y + 2.4, 1, 0, 1.0, 0.4); card(C, uvOf('rules'), x0 + 0.026, dm + nbw * 0.33, y + 1.55, 1, 0, 0.62, 0.86); card(C, uvOf('timetable'), x0 + 0.026, dm + nbw * 0.05, y + 1.55, 1, 0, 0.62, 0.86);
    for (let i = 0; i < 5; i++) box(X, tint([0xf4f1e6, 0xf3e3a4, 0xbfd9ee, 0xf2c4c4, 0xcfe8c9][i], 0.9), x0 + 0.02, x0 + 0.026, dm - nbw * 0.45 + (i % 3) * 0.3, dm - nbw * 0.45 + (i % 3) * 0.3 + 0.21, y + 1.1 + (i > 2 ? 0.5 : 0) + 0.04 * i, y + 1.4 + (i > 2 ? 0.5 : 0) + 0.04 * i, 'E');
    card(C, uvOf('map'), x1 - 0.01, dm, y + 1.75, -1, 0, 2.3, 1.3); card(C, uvOf('banner'), x1 - 0.01, dm, y + 2.62, -1, 0, 1.6, 0.3);
    for (let i = 0; i < 5; i++) box(F, wood, x1 - 0.5 + i * 0.09, x1 - 0.43 + i * 0.09, dm - 1.1, dm + 1.1, y + 0.42, y + 0.46); for (const dd of [-0.95, 0.95]) box(F, m.dark, x1 - 0.5, x1 - 0.06, dm + dd - 0.03, dm + dd + 0.03, y, y + 0.42, 'WEFK');
    cD(dm - 1.1, dm + 1.1, x1 - 0.52, y, y + 0.9, -1);
    // by the glass: a sofa and a low table, plants; mats inside the doors
    const sofa = tint(0x5f7184, 0.95), sX = x0 + 1.0, sD = dF + 0.5;
    box(F, sofa, sX, sX + 1.9, sD, sD + 0.8, y + 0.08, y + 0.42); box(F, sofa, sX, sX + 1.9, sD, sD + 0.2, y + 0.42, y + 0.85); for (const a of [sX, sX + 1.72]) box(F, sofa, a, a + 0.18, sD + 0.2, sD + 0.8, y + 0.42, y + 0.62);
    box(F, wood, sX + 0.4, sX + 1.5, sD + 1.25, sD + 1.8, y + 0.36, y + 0.4); for (const [a, c] of [[0.42, 1.27], [1.44, 1.27], [0.42, 1.74], [1.44, 1.74]]) box(X, m.dark, sX + a, sX + a + 0.04, sD + c, sD + c + 0.04, y, y + 0.36, 'WEFK');
    box(X, tint(0xf4f1e6, 0.9), sX + 0.6, sX + 0.9, sD + 1.35, sD + 1.56, y + 0.4, y + 0.41, 'U'); cyl(X, tint(0x2a8a96, 0.4), sX + 1.2, sD + 1.5, y + 0.4, 0.04, 0.09, 8);
    cPost(sX, sX + 1.9, sD, sD + 0.8, y, y + 0.9); cPost(sX + 0.4, sX + 1.5, sD + 1.25, sD + 1.8, y, y + 0.5);
    plant(F, x0 + 0.45, dF + 0.45, y, 1.6); plant(F, x1 - 0.45, dF + 0.45, y, 1.6);                                     // leafy pots in the corners, small trees in tubs beside the doors
    for (const xd of doorsFront) for (const o of doorsFront.length > 1 ? [-2.3] : [-2.2, 2.2]) plant(F, xd + o, dF + 1.25, y, 1, true);
    if (x1 - x0 > 14) plant(F, doorsFront[1] + 2.3, dF + 1.25, y, 1, true);
    plant(X, cxn + cw - 0.55, cF + 0.14, y + 1.12, 0.55);                                                                 // a small pot on the counter
    // on the back wall: lockers for parcels at the west end, a drinks machine and a water dispenser at the east end
    const pw = Math.min(2.6, doorsBack[0][0] - x0 - 0.3), pX = x0 + 0.1;
    if (pw > 0.9) { box(F, tint(0x6f8fb0, 0.5), pX, pX + pw, dB - 0.45, dB, y, y + 1.95, 'FWEU'); const nc = Math.round(pw / 0.45); for (let i = 1; i < nc; i++) box(X, m.dark, pX + i * pw / nc - 0.004, pX + i * pw / nc + 0.004, dB - 0.453, dB - 0.45, y + 0.05, y + 1.9, 'F');
      for (let j = 1; j < 6; j++) box(X, m.dark, pX, pX + pw, dB - 0.453, dB - 0.45, y + j * 0.32 - 0.004, y + j * 0.32 + 0.004, 'F'); card(C, uvOf('parcel'), pX + pw / 2, dB - 0.458, y + 1.2, 0, -1, 0.36, 0.27); cX(pX, pX + pw, dB - 0.45, y, y + 1.95, -1); cD(dB - 0.45, dB, pX + pw, y, y + 1.95, 1); }
    const vX = Math.min(x1 - 1.1, doorsBack[1][1] + 0.35);
    if (x1 - vX > 1.0) { box(F, tint(0xb8322a, 0.4), vX, vX + 0.95, dB - 0.8, dB, y, y + 1.9, 'WEU'); card(C, uvOf('vending'), vX + 0.475, dB - 0.806, y + 0.95, 0, -1, 0.95, 1.9); cX(vX, vX + 0.95, dB - 0.8, y, y + 1.9, -1); cD(dB - 0.8, dB, vX, y, y + 1.9, -1); cD(dB - 0.8, dB, vX + 0.95, y, y + 1.9, 1); }
    // ceiling lights, exit signs over the back doors
    for (let x = x0 + 1.8; x < x1 - 1; x += 3.4) for (const d of [dF + (dB - dF) * 0.3, dF + (dB - dF) * 0.72]) box(F, m.lamp, x - 0.3, x + 0.3, d - 0.3, d + 0.3, yc - 0.02, yc, 'DWEFK');
    for (const [a, b] of doorsBack) card(C, uvOf('exit'), (a + b) / 2, dB - 0.008, y + 2.6, 0, -1, 0.6, 0.22);
    for (let x = x0 + 3.9; x < x1 - 2; x += 3.9) box(F, m.ceil, x - 0.14, x + 0.14, dF, dB, yc - 0.28, yc, 'WED');            // beams across the ceiling
    // inside the entrance doors: mats, an umbrella stand, a folding sign on the wet floor
    for (const xd of doorsFront) { box(F, tint(0x7a2f2b, 0.95), xd - 0.9, xd + 0.9, dF + 0.15, dF + 1.25, y, y + 0.012, 'UWEFK'); cyl(F, m.dark, xd + 1.35, dF + 0.3, y, 0.14, 0.5, 10, false); for (let i = 0; i < 3; i++) rod(X, tint([0x2f5f9e, 0xb8322a, 0x33373d][i], 0.6), [xd + 1.3 + i * 0.05, dF + 0.28 + i * 0.03, y + 0.05], [xd + 1.34 + i * 0.03, dF + 0.34 - i * 0.04, y + 0.9], 0.03); }
    { const xs = doorsFront[0] - 1.6, ds = dF + 1.9, yel = tint(0xe0a020, 0.6); quad(F, yel, [[xs - 0.15, ds - 0.18, y], [xs + 0.15, ds - 0.18, y], [xs + 0.15, ds, y + 0.6], [xs - 0.15, ds, y + 0.6]], [0, -1, 0.3]); quad(F, yel, [[xs - 0.15, ds + 0.18, y], [xs + 0.15, ds + 0.18, y], [xs + 0.15, ds, y + 0.6], [xs - 0.15, ds, y + 0.6]], [0, 1, 0.3]); }
    if (x1 - x0 > 14) {                                                       // the long lobby of block A north: chairs along the back wall, a second sofa, a tall mirror
      const seat = tint(0x3d6fa8, 0.7), xr = cxn + cw + 2.2;
      for (let i = 0; i < 5; i++) chair(F, X, seat, xr + i * 0.56, dB - 0.35, y, [0, -1]); box(F, m.dark, xr - 0.25, xr + 2.5, dB - 0.4, dB - 0.34, y + 0.2, y + 0.24); cX(xr - 0.25, xr + 2.5, dB - 0.6, y, y + 0.9, -1);
      const sofa2 = tint(0x7a6a58, 0.95), eX = x1 - 3.2, eD = dF + 0.5;
      box(F, sofa2, eX, eX + 1.9, eD, eD + 0.8, y + 0.08, y + 0.42); box(F, sofa2, eX, eX + 1.9, eD, eD + 0.2, y + 0.42, y + 0.85); for (const a of [eX, eX + 1.72]) box(F, sofa2, a, a + 0.18, eD + 0.2, eD + 0.8, y + 0.42, y + 0.62); cPost(eX, eX + 1.9, eD, eD + 0.8, y, y + 0.9);
      box(F, m.inox, x0, x0 + 0.012, dF + 0.5, dF + 1.4, y + 0.25, y + 1.95, 'E'); frame(F, 'd', dF + 0.45, dF + 1.45, y + 0.2, y + 2.0, x0, x0 + 0.03, wood, 0, 0, 0.05);
    }
    void R;
  };
  if (lobbySec) lobbyFit(lobbySec, lobbySec.x0 + 0.1, xb, gd + 0.03, court - WALL, [[lobbySec.x0 + 3.0, lobbySec.x0 + 4.8], [xb - 4.8, xb - 3.0]], [lobbySec.x0 + (L - lobbySec.x0) / 3, lobbySec.x0 + 2 * (L - lobbySec.x0) / 3], BASE);
  for (const s of sections) if (s.kind === 'common' && s.lobby) lobbyFit(s, s.x0 + 0.1, s.x1 - 0.1, FACE + RECESS + 0.03, court - WALL, [[s.x0 + 1.4, s.x0 + 3.0], [s.x1 - 3.0, s.x1 - 1.4]], [(s.x0 + s.x1) / 2], BASE);

  // ---- common rooms: study tables, a bookcase, a television corner (block A north's ground floor: table tennis) ----
  for (const s of sections) if (s.kind === 'common') for (let k = s.lobby ? 1 : 0; k < FLOORS; k++) {
    const T = tier(s), F = T.fu, X = T.fx, C = T.cards, y = level(k), yc = y + CEIL, x0 = s.x0 + 0.1, x1 = s.x1 - 0.1, dF = FACE + RECESS + 0.03, dB = court - WALL, R = rng(seedOf(item.id) + k * 53 + 9), pick = list => list[Math.floor(R() * list.length)];
    const wood = tint(0xcaa675, 0.6), seat = tint(pick([0x3d6fa8, 0x4f8f6a, 0xb86a3a, 0x6d7175]), 0.7);
    if (k === 0) {                                                            // activity room: a table-tennis table, benches, a rack
      const tx = (x0 + x1) / 2 - 1.6, td = (dF + dB) / 2 - 0.3;
      box(F, tint(0x1f5f8a, 0.5), tx - 1.37, tx + 1.37, td - 0.76, td + 0.76, y + 0.74, y + 0.76); box(X, m.white, tx - 0.01, tx + 0.01, td - 0.84, td + 0.84, y + 0.76, y + 0.91, 'WEU'); box(X, m.white, tx - 1.37, tx + 1.37, td - 0.01, td + 0.01, y + 0.76, y + 0.762, 'U');
      for (const [a, c] of [[-1.1, -0.55], [1.06, -0.55], [-1.1, 0.51], [1.06, 0.51]]) box(F, m.dark, tx + a, tx + a + 0.04, td + c, td + c + 0.04, y, y + 0.74, 'WEFK');
      box(X, tint(0xb8322a, 0.6), tx - 0.9, tx - 0.74, td + 0.3, td + 0.46, y + 0.76, y + 0.775, 'UWEFK'); box(X, tint(0x2a2c2f, 0.6), tx + 0.7, tx + 0.86, td - 0.5, td - 0.34, y + 0.76, y + 0.775, 'UWEFK'); cyl(X, tint(0xf4a020, 0.5), tx + 0.3, td + 0.2, y + 0.76, 0.02, 0.04, 6);
      cPost(tx - 1.37, tx + 1.37, td - 0.76, td + 0.76, y, y + 0.9);
      for (const xbn of [x1 - 3.4, x1 - 1.2]) { for (let i = 0; i < 4; i++) box(F, wood, xbn - 0.9, xbn + 0.9, dB - 0.5 + i * 0.1, dB - 0.42 + i * 0.1, y + 0.42, y + 0.46); for (const o of [-0.8, 0.8]) box(F, m.dark, xbn + o - 0.03, xbn + o + 0.03, dB - 0.5, dB - 0.1, y, y + 0.42, 'WEFK'); }
      box(F, tint(0x8a8f96, 0.5), x1 - 0.45, x1, dF + 0.6, dF + 2.2, y, y + 1.6, 'WFKU'); for (const ys of [0.4, 0.8, 1.2]) box(X, m.dark, x1 - 0.453, x1 - 0.45, dF + 0.6, dF + 2.2, y + ys - 0.004, y + ys + 0.004, 'W'); cD(dF + 0.6, dF + 2.2, x1 - 0.45, y, y + 1.6, -1);
      card(C, uvOf('p2'), x1 - 0.01, dF + 3.6, y + 1.7, -1, 0, 0.9, 1.24);
    } else {                                                                  // study room: four tables with chairs
      for (const tx of [x0 + 2.5, x0 + 5.6]) for (const td of [dF + 1.8, dF + 4.4]) {
        box(F, wood, tx - 0.8, tx + 0.8, td - 0.4, td + 0.4, y + 0.72, y + 0.75); for (const [a, c] of [[-0.74, -0.34], [0.7, -0.34], [-0.74, 0.3], [0.7, 0.3]]) box(X, m.dark, tx + a, tx + a + 0.04, td + c, td + c + 0.04, y, y + 0.72, 'WEFK');
        for (const sx of [-0.4, 0.4]) { chair(F, X, seat, tx + sx + (R() - 0.5) * 0.1, td - 0.62 - R() * 0.15, y, [0, 1]); chair(F, X, seat, tx + sx + (R() - 0.5) * 0.1, td + 0.62 + R() * 0.15, y, [0, -1]); }
        for (let i = 0, n = Math.floor(R() * 4); i < n; i++) { const bx = tx - 0.6 + R() * 1.0, bd = td - 0.25 + R() * 0.3; box(X, tint(pick(BOOK), 0.85), bx, bx + 0.2, bd, bd + 0.27, y + 0.75, y + 0.78 + R() * 0.04, 'UWEFK'); }
        if (R() < 0.6) cyl(X, tint(pick(TOWEL), 0.4), tx + 0.55, td + 0.1, y + 0.75, 0.04, 0.1, 8);
        cPost(tx - 0.8, tx + 0.8, td - 0.4, td + 0.4, y, y + 0.9);
      }
      // bookcase on the west wall
      const bA = dF + 0.7, bB = dF + 4.3; box(F, wood, x0, x0 + 0.34, bA, bB, y, y + 2.0, 'EFKU');
      for (let j = 0; j < 5; j++) { const ys = y + 0.12 + j * 0.37; box(X, m.dark, x0 + 0.34, x0 + 0.343, bA, bB, ys - 0.03, ys, 'E'); for (let d = bA + 0.05; d < bB - 0.1;) { const w = 0.025 + R() * 0.035; if (R() < 0.9) box(X, tint(pick(BOOK), 0.85), x0 + 0.3, x0 + 0.345, d, d + w, ys, ys + 0.2 + R() * 0.1, 'EU'); d += w + (R() < 0.08 ? 0.15 : 0.004); } }
      cD(bA, bB, x0 + 0.34, y, y + 2.0, 1);
      // television corner at the east end: a screen on the wall, a sofa facing it
      box(F, m.dark, x1 - 0.06, x1, dF + 2.0, dF + 3.5, y + 1.2, y + 2.05, 'WFKUD'); card(C, uvOf('tv'), x1 - 0.066, dF + 2.75, y + 1.625, -1, 0, 1.4, 0.78);
      const sofa = tint(pick([0x5f7184, 0x7a6a58, 0x4f7a6a]), 0.95), sx0 = x1 - 3.3;
      box(F, sofa, sx0, sx0 + 0.8, dF + 1.8, dF + 3.7, y + 0.08, y + 0.42); box(F, sofa, sx0, sx0 + 0.2, dF + 1.8, dF + 3.7, y + 0.42, y + 0.85); for (const a of [dF + 1.8, dF + 3.52]) box(F, sofa, sx0 + 0.2, sx0 + 0.8, a, a + 0.18, y + 0.42, y + 0.62);
      cPost(sx0, sx0 + 0.8, dF + 1.8, dF + 3.7, y, y + 0.9);
      card(C, uvOf('p' + (k % 2 ? 4 : 0)), x0 + 0.01, dF + 5.3, y + 1.6, 1, 0, 0.6, 0.83);
    }
    // water dispenser by a door, plants by the glass, lights and fans
    box(F, m.white, x1 - 0.42, x1 - 0.08, dB - 0.4, dB - 0.06, y, y + 0.98, 'WFU'); cyl(F, tint(0x9fc8e6, 0.2), x1 - 0.25, dB - 0.23, y + 0.98, 0.13, 0.34, 10);
    plant(F, x0 + 0.45, dF + 0.42, y, 1.5); plant(F, x1 - 0.45, dF + 0.42, y, 1.5); plant(F, x0 + 4.05, dF + 1.15, y, 0.95, true);
    for (const tx of [0.2, 0.5, 0.8]) for (const td of [0.3, 0.72]) tube(F, x0 + (x1 - x0) * tx, dF + (dB - dF) * td, yc); fan(F, x0 + (x1 - x0) * 0.35, (dF + dB) / 2, yc); fan(F, x0 + (x1 - x0) * 0.65, (dF + dB) / 2, yc);
    card(C, uvOf('notice'), x1 - 1.6, dB - 0.008, y + 1.7, 0, -1, 0.8, 0.32); card(C, uvOf('rules'), x1 - 1.6, dB - 0.008, y + 1.2, 0, -1, 0.4, 0.55);
  }

  // ---- wash rooms: a long trough with taps and a mirror, cubicles, washing machines, a water boiler ----
  for (const s of sections) if (s.kind === 'wash') for (let k = 0; k < FLOORS; k++) {
    const T = tier(s), F = T.fu, X = T.fx, C = T.cards, y = level(k), yc = y + CEIL, x0 = s.x0 + 0.1, x1 = s.x1 - 0.1, dF = FACE + WALL, dB = court - WALL, tile = tint(0xdfe7ea, 0.35);
    const tA = dF + 0.5, tB = dB - 2.6;                                       // trough along the west wall
    box(F, tile, x0, x0 + 0.55, tA, tB, y + 0.55, y + 0.86, 'EFKU'); box(X, tint(0xaab6bd, 0.3), x0 + 0.06, x0 + 0.49, tA + 0.06, tB - 0.06, y + 0.86, y + 0.863, 'U'); box(F, tile, x0 + 0.1, x0 + 0.45, tA + 0.1, tB - 0.1, y, y + 0.55, 'EFK');
    box(F, m.inox, x0, x0 + 0.012, tA, tB, y + 1.15, y + 1.75, 'E'); box(X, m.inox, x0 + 0.04, x0 + 0.07, tA, tB, y + 1.02, y + 1.05);
    for (let d = tA + 0.4; d < tB - 0.2; d += 0.75) { box(X, m.inox, x0 + 0.04, x0 + 0.07, d - 0.012, d + 0.012, y + 0.9, y + 1.04); box(X, m.inox, x0 + 0.04, x0 + 0.2, d - 0.012, d + 0.012, y + 1.0, y + 1.025); if (!low && (d * 7 % 3) < 1.6) cyl(X, tint(PAIL[Math.floor(d * 3) % 4], 0.5), x0 + 0.28, d + 0.3, y + 0.863, 0.1, 0.12, 8); }
    cD(tA, tB, x0 + 0.55, y, y + 1.0, 1);
    const part = tint(0xb9d0c2, 0.5), cA = dF + 0.25, nc = Math.max(2, Math.floor((tB - cA) / 1.0)), cw = 1.0;      // cubicles along the east wall
    for (let i = 0; i <= nc; i++) box(F, part, x1 - 1.25, x1, cA + i * cw - 0.02, cA + i * cw + 0.02, y + 0.12, y + 1.95, 'FKWU');
    for (let i = 0; i < nc; i++) { box(F, part, x1 - 1.27, x1 - 1.23, cA + i * cw + 0.04, cA + (i + 1) * cw - 0.04, y + 0.12, y + 1.9, 'WU'); box(X, m.inox, x1 - 1.29, x1 - 1.27, cA + i * cw + 0.12, cA + i * cw + 0.16, y + 0.95, y + 1.07); }
    cD(cA - 0.02, cA + nc * cw + 0.02, x1 - 1.27, y, y + 1.95, -1); cX(x1 - 1.27, x1, cA + nc * cw + 0.02, y, y + 1.95, 1);
    // by the door: two washing machines, a boiler with taps, a mop sink; signs
    for (let i = 0; i < 2; i++) { const wd = dB - 0.75 - i * 0.68; box(F, m.white, x1 - 0.62, x1 - 0.02, wd, wd + 0.6, y, y + 0.86, 'WFKU'); card(C, uvOf('washer'), x1 - 0.626, wd + 0.3, y + 0.43, -1, 0, 0.6, 0.7); }
    cD(dB - 1.45, dB, x1 - 0.62, y, y + 0.9, -1);
    box(F, m.inox, x0, x0 + 0.4, dB - 1.2, dB - 0.6, y + 0.95, y + 1.75, 'EFKUD'); box(X, m.dark, x0 + 0.4, x0 + 0.403, dB - 1.1, dB - 0.7, y + 1.45, y + 1.65, 'E'); for (const o of [-1.05, -0.75]) box(X, m.inox, x0 + 0.4, x0 + 0.46, dB + o - 0.012, dB + o + 0.012, y + 1.05, y + 1.08);
    box(F, tile, x0, x0 + 0.5, dB - 0.55, dB - 0.05, y, y + 0.35, 'EFU');
    card(C, uvOf('save'), x0 + 0.008, tA + 1.2, y + 2.05, 1, 0, 0.5, 0.25); card(C, uvOf('slip'), x1 - 0.008, dB - 2.0, y + 1.6, -1, 0, 0.46, 0.23);
    box(X, m.pvc, x0 + 0.03, x0 + 0.09, tA, tB, y + 0.3, y + 0.36, 'EUD'); box(X, tint(0x6d7175, 0.5), (x0 + x1) / 2 - 0.08, (x0 + x1) / 2 + 0.08, (tA + tB) / 2 - 0.08, (tA + tB) / 2 + 0.08, y, y + 0.004, 'U');
    for (const t of [0.25, 0.7]) tube(F, (x0 + x1) / 2, dF + (dB - dF) * t, yc);
  }

  // ================= collision =================
  const yO = 2.6, entrySec = sections.find(s => s.kind === 'common' && s.lobby);      // yO: height of the faces that stop a walker on the ground outside
  { // outside at ground level: the street face (open at the porch and at the entrance), the two ends, the courtyard step as a ramp, the gallery columns
    const cuts = [];
    if (lobbySec) cuts.push([lobbySec.x0, L - FACE]);
    if (entrySec) { const xm = (entrySec.x0 + entrySec.x1) / 2; cuts.push([xm - 3.5, xm + 3.5]); }
    let x = FACE; for (const [a, b] of cuts.sort((p, q) => p[0] - q[0])) { cX(x, a, FACE, 0, yO, -1); x = b; } cX(x, L - FACE, FACE, 0, yO, -1);
    cD(FACE, gx, FACE, 0, yO, -1); cD(FACE, bridge ? court : gx, L - FACE, 0, yO, 1);
    cRamp(FACE, L - FACE, gx + 0.38, 0, gx - 0.02, BASE + 0.004);
    if (bridge) cq([[L - FACE + 0.38, court, 0], [L - FACE + 0.38, gx, 0], [L - FACE - 0.02, gx, BASE + 0.004], [L - FACE - 0.02, court, BASE + 0.004]], [0, 0, 1]);
    for (const X of colX) cPost(X - 0.18, X + 0.18, gx - 0.4, gx + 0.02, BASE, BASE + CEIL);
  }
  // floors of every storey (open only over the stair flights), the roof deck and its parapets
  for (let k = 0; k < FLOORS; k++) for (const s of sections) {
    const y = level(k);
    if (s.kind === 'stair') cFloor(s.x0, s.x1, s.st.zl, gx, y);
    else if (s.kind === 'lobby') { if (!k) cFloor(s.x0, L - FACE, 0, gd, y); cFloor(s.x0, s.x1, gd, gx, y); }
    else cFloor(s.x0, s.x1, FACE, gx, y);
  }
  if (bridge) for (let k = 0; k < FLOORS; k++) cFloor(xb, L - FACE, court, gx, level(k));
  cFloor(0.3, L - 0.3, 0.3, D - 0.3, yDeck); if (lobbySec) cFloor(lobbySec.x0, L, 0, 6.0, H - 0.15);
  cX(0.3, L - 0.3, 0.3, yDeck, H + 0.4, 1); cX(0.3, L - 0.3, D - 0.3, yDeck, H + 0.4, -1); cD(0.3, D - 0.3, 0.3, yDeck, H + 0.4, 1); cD(0.3, D - 0.3, L - 0.3, yDeck, H + 0.4, -1);
  if (sp.blue) { const xc = (sp.blue[0] + sp.blue[1]) / 2, r = Math.min(2.0, (sp.blue[1] - sp.blue[0]) / 2); cPost(xc - r, xc + r, 3.2 - r, 3.2 + r, yDeck, yDeck + 1.9); }
  for (const [a, b] of sp.ribbed || []) cPost(a, b, 1.5, 5.5, yDeck, yDeck + 1.9);
  // galleries: the wall with its open doorways, the two ends, the balustrade
  for (let k = 0; k < FLOORS; k++) {
    const y = level(k), t = y + CEIL, gaps = [];                              // [from, to, with jambs]
    for (const s of sections) {
      if (s.kind === 'stair') gaps.push([s.st.xw0, s.st.xw1, false]);
      else if (s.kind === 'rooms') { for (const r of s.rooms) if (isOpen(k, r)) gaps.push([r.door[0], r.door[1], true]); }
      else if (s.kind === 'common') gaps.push([s.x0 + 1.4, s.x0 + 3.0, true], [s.x1 - 3.0, s.x1 - 1.4, true]);
      else if (s.kind === 'wash') gaps.push([(s.x0 + s.x1) / 2 - 0.6, (s.x0 + s.x1) / 2 + 0.6, true]);
      else if (s.kind === 'lobby' && k === 0) gaps.push([s.x0 + 3.0, s.x0 + 4.8, true], [s.x1 - 4.8, s.x1 - 3.0, true]);
    }
    let x = xa;
    for (const [a, b, jambs] of gaps) { cX(x, a, court, y, t, 1); if (jambs) { cD(court - WALL, court, a, y, t, 1); cD(court - WALL, court, b, y, t, -1); } x = b; }
    cX(x, xG1, court, y, t, 1);
    cD(court, gx, xa, y, t, 1); if (!bridge) cD(court, gx, xb, y, t, -1);
    if (k) cX(xa, xG1, gx - 0.12, y, y + 2.0, -1);
  }
  // furnished rooms: the room, the doorway to the balcony, the balcony
  for (const s of sections) if (s.kind === 'rooms') for (const r of s.rooms) for (let k = 0; k < FLOORS; k++) if (isOpen(k, r)) {
    const y = level(k), t = y + CEIL, xi0 = r.x0 + 0.1, xi1 = r.x1 - 0.1, di0 = back + WALL, di1 = court - WALL;
    cX(xi0, r.door[0], di1, y, t, -1); cX(r.door[1], xi1, di1, y, t, -1);
    cD(di0, di1, xi0, y, t, 1); cD(di0, di1, xi1, y, t, -1);
    cX(xi0, r.bdoor[0], di0, y, t, 1); cX(r.bdoor[1], xi1, di0, y, t, 1);
    cD(back, di0, r.bdoor[0], y, t, 1); cD(back, di0, r.bdoor[1], y, t, -1);
    cX(r.bx0, r.bdoor[0], back, y, t, -1); cX(r.bdoor[1], r.bx1, back, y, t, -1);
    cD(FACE + 0.1, back, r.bx0 + (r.wetW ? 0 : 0.56), y, t, 1); cD(FACE + 0.1, back, r.bx1 - (r.wetW ? 0.56 : 0), y, t, -1);          // the flank; the front of the basin on the fin side
    cX(r.bx0, r.bx1, FACE + 0.1, y, y + 2.0, 1);
  }
  // common rooms, wash rooms, the lobbies
  for (const s of sections) for (let k = 0; k < FLOORS; k++) {
    const y = level(k), t = y + CEIL, di1 = court - WALL, xm = (s.x0 + s.x1) / 2;
    if (s.kind === 'common') {
      const g0 = FACE + RECESS;
      if (k === 0 && s.lobby) {                                                // glass with the open entrance doors, the sides of the recess
        for (const [a, b] of [[s.x0, xm - 1.2], [xm + 1.2, s.x1]]) { cX(a, b, g0 - 0.01, y, t, -1); cX(a, b, g0 + 0.03, y, t, 1); }
        cD(g0 - 0.01, g0 + 0.03, xm - 1.2, y, t, 1); cD(g0 - 0.01, g0 + 0.03, xm + 1.2, y, t, -1); cD(FACE, g0, s.x0, y, t, 1); cD(FACE, g0, s.x1, y, t, -1);
      } else cX(s.x0 + 0.1, s.x1 - 0.1, g0 + 0.03, y, t, 1);
      cD(g0, di1, s.x0 + 0.1, y, t, 1); cD(g0, di1, s.x1 - 0.1, y, t, -1);
      cX(s.x0 + 0.1, s.x0 + 1.4, di1, y, t, -1); cX(s.x0 + 3.0, s.x1 - 3.0, di1, y, t, -1); cX(s.x1 - 1.4, s.x1 - 0.1, di1, y, t, -1);
    } else if (s.kind === 'wash') {
      cX(s.x0 + 0.1, s.x1 - 0.1, FACE + WALL, y, t, 1); cD(FACE + WALL, di1, s.x0 + 0.1, y, t, 1); cD(FACE + WALL, di1, s.x1 - 0.1, y, t, -1);
      cX(s.x0 + 0.1, xm - 0.6, di1, y, t, -1); cX(xm + 0.6, s.x1 - 0.1, di1, y, t, -1);
    } else if (s.kind === 'lobby' && k === 0) {
      const x0 = s.x0, span = L - x0; let x = x0;
      for (const xc of [x0 + span / 3, x0 + 2 * span / 3]) { cX(x, xc - 1.0, gd - 0.01, y, t, -1); cX(x, xc - 1.0, gd + 0.03, y, t, 1); cD(gd - 0.01, gd + 0.03, xc - 1.0, y, t, 1); cD(gd - 0.01, gd + 0.03, xc + 1.0, y, t, -1); x = xc + 1.0; }
      cX(x, xb, gd - 0.01, y, t, -1); cX(x, xb, gd + 0.03, y, t, 1);
      cD(FACE, gd, x0, y, y + yO, 1); cD(FACE, gd, xb, y, y + yO, -1); cD(gd, di1, x0 + 0.1, y, t, 1); cD(gd, di1, xb, y, t, -1);
      cX(x0 + 0.1, x0 + 3.0, di1, y, t, -1); cX(x0 + 4.8, xb - 4.8, di1, y, t, -1); cX(xb - 3.0, xb, di1, y, t, -1);
      cRamp(x0, L - FACE, -0.44, 0, 0.02, BASE + 0.004);
      for (let i = 0; i < 6; i++) { const cx = x0 + span / 12 + i * span / 6; cPost(cx - 0.28, cx + 0.28, FACE + 0.17, FACE + 0.73, y, y + yO); }
    }
  }
  if (entrySec) {                                                              // the steps and canopy columns of the entrance
    const xm = (entrySec.x0 + entrySec.x1) / 2, a = xm - 3.0, b = xm + 3.0, dFront = -1.3;
    cFloor(a, b, dFront, FACE, BASE); cRamp(a, b, dFront - 0.44, 0, dFront + 0.02, BASE + 0.004);
    for (const sx of [-1, 1]) { const xc = xm + sx * 2.75; cPost(xc - 0.09, xc + 0.09, dFront + 0.16, dFront + 0.34, BASE, BASE + yO); cPost(sx < 0 ? a - 0.5 : b, sx < 0 ? a : b + 0.5, dFront + 0.2, FACE, 0, 1.4); }
  }
  // stair cores: side and back walls, the well, the store under the first flight, the guard on the top storey, half landings and flights
  for (const s of sections) if (s.kind === 'stair') {
    const S = s.st, top = yF - SLAB;
    cD(S.zb, court, S.xw0, BASE, top, 1); cD(S.zb, court, S.xw1, BASE, top, -1); cX(S.xw0, S.xw1, S.zb, BASE, top, 1);
    cD(S.zh, S.zl, S.xB1, BASE, top, -1); cD(S.zh, S.zl, S.xA0, BASE, top, 1); cX(S.xB1, S.xA0, S.zl, BASE, top, 1); cX(S.xB1, S.xA0, S.zh, BASE, top, -1);
    cX(S.xB0, S.xB1, S.zl, BASE, BASE + CEIL, 1);
    cX(S.xA0, S.xA1, S.zl, level(FLOORS - 1), level(FLOORS - 1) + 2.0, 1);
    for (let k = 0; k < FLOORS - 1; k++) { const y = level(k), ym = y + FH / 2; cFloor(S.xw0, S.xw1, S.zb, S.zh, ym); cRamp(S.xA0, S.xA1, S.zl, y, S.zh, ym); cRamp(S.xB0, S.xB1, S.zh, ym, S.zl, y + FH); }
  }
  // the bridge to the round tower
  if (bridge) for (let k = 1; k < FLOORS; k++) {
    const y = level(k), { d0, d1, x0, xe } = bridge, N = 6;
    for (let i = 0; i < N; i++) { const da = d0 + (d1 - d0) * i / N, db = d0 + (d1 - d0) * (i + 1) / N; cq([[x0, da, y], [xe(da) + 0.03, da, y], [xe(db) + 0.03, db, y], [x0, db, y]], [0, 0, 1]); }
    cX(x0, xe(d0), d0 + 0.12, y, y + 2.0, 1); cX(x0, xe(d1), d1 - 0.12, y, y + 2.0, -1);
  }

  // parts that stand outside the item's outline: tell the grounds, so that no tree or lamp is put there
  if (ctx.occupy) {
    const out = (x0, x1, d0, d1) => ctx.occupy([[x0, d0], [x1, d0], [x1, d1], [x0, d1]].map(q => P.toWorld(q[0], q[1])));
    out(0, L, D, D + 0.6);                                                    // the step along the courtyard
    if (lobbySec) out(lobbySec.x0, L, -0.7, 0);                               // porch steps
    if (entrySec) { const xm = (entrySec.x0 + entrySec.x1) / 2; out(xm - 3.8, xm + 3.8, -2.0, 0); }   // entrance steps and canopy
    if (bridge) out(L, bridge.tx, bridge.d0 - 0.2, bridge.d1 + 0.2);          // the bridge to the tower
  }

  // ================= assemble =================
  const vg = mergeFlat(v.build({ name: item.id + '-visual' }), true);
  { const mesh = letters && letters.build(item.id + '-lettering'); if (mesh) vg.add(mesh); }
  ctx.add(vg);
  const [wx, wz] = P.toWorld(L / 2, D / 2);
  const fg = mergeFlat(ex.build({ name: item.id + '-fittings', castShadow: false }), false);
  for (const Q of [dirt, letters2]) { const mesh = Q && Q.build(item.id + '-overlay'); if (mesh) fg.add(mesh); }
  ctx.detail(ctx.add(fg), wx, wz, L / 2 + (low ? 70 : 110));
  // the fine fittings are cut into lengths of about 24 m along the block, each shown only from near it
  const eg = mergeFlat(ex2.build({ name: item.id + '-fine-fittings', castShadow: false }), false); { const mesh = exCards && exCards.build(item.id + '-signs'); if (mesh) eg.add(mesh); }
  const nCut = Math.max(1, Math.round(L / 24)), cuts = Array.from({ length: nCut }, () => new THREE.Group()), ca = Math.cos(f.angle), sa = Math.sin(f.angle);
  for (const mesh of eg.children) {
    const g = mesh.geometry, pos = g.attributes.position.array, idx = g.index.array, lists = cuts.map(() => []);
    for (let i = 0; i < idx.length; i += 3) { const a = idx[i] * 3, x = (pos[a] - f.ox) * ca - (pos[a + 2] - f.oz) * sa; lists[Math.max(0, Math.min(nCut - 1, Math.floor(x / L * nCut)))].push(idx[i], idx[i + 1], idx[i + 2]); }
    lists.forEach((list, k) => { if (!list.length) return; const q = new THREE.BufferGeometry(); for (const name in g.attributes) q.setAttribute(name, g.attributes[name]); q.setIndex(list); const part = new THREE.Mesh(q, mesh.material); part.receiveShadow = true; cuts[k].add(part); });
  }
  cuts.forEach((part, k) => { part.name = item.id + '-fine-fittings-' + k; if (part.children.length) ctx.detail(ctx.add(part), ...P.toWorld((k + 0.5) * L / nCut, D / 2), L / nCut / 2 + (low ? 28 : 38)); });
  const shapes = softShapes(), hue = new THREE.Color();
  /** Foliage of the pots: leafy balls of flora.js lifted onto their soil; small trees for the tubs. list: [x, d, y of the soil, size]. */
  const leafy = (list, group, seed) => {
    if (!list.length || !canvasOk) return;
    const im = shrubs(list.map(([x, d, , r]) => [...P.toWorld(x, d), r]), { seed }), M = new THREE.Matrix4(), V = new THREE.Vector3(), Q = new THREE.Quaternion(), S = new THREE.Vector3();
    list.forEach(([, , y], i) => { im.getMatrixAt(i, M); M.decompose(V, Q, S); V.y = y + 0.16 * S.x; im.setMatrixAt(i, M.compose(V, Q, S)); });
    im.castShadow = false; im.frustumCulled = true; im.computeBoundingSphere(); group.add(im);
  };
  const treesIn = (list, group, seed) => {
    if (!list.length || !canvasOk) return;
    if (ctx.safe) useStockShaders(true);
    const t = broadleafTrees(list.map(([x, d, y, h]) => [...P.toWorld(x, d), h, y]), { seed, low: true }); t.group.traverse(o => { if (o.isMesh) o.castShadow = false; }); group.add(t.group);
  };
  { const G = greens.get(ex2); if (G) cuts.forEach((part, k) => leafy(G.balls.filter(q => Math.max(0, Math.min(nCut - 1, Math.floor(q[0] / L * nCut))) === k), part, 47 + k)); }
  for (const [s, T] of tiers) {
    const [sx, sz] = P.toWorld((s.x0 + s.x1) / 2, D / 2), half = (s.x1 - s.x0) / 2;
    const fu = mergeFlat(T.fu.build({ name: item.id + '-interior', castShadow: false }), false), fx = mergeFlat(T.fx.build({ name: item.id + '-fine', castShadow: false }), false);
    { const mesh = T.cards && T.cards.build(item.id + '-cards'); if (mesh) fu.add(mesh); }
    for (const kind in T.soft) {                                              // bedding, curtains and nets: one instanced mesh each
      const list = T.soft[kind]; if (!list.length) continue;
      const im = new THREE.InstancedMesh(shapes[kind], kind === 'net' ? shapes.netM : shapes.clothM, list.length);
      list.forEach(([M, hex], i) => { im.setMatrixAt(i, M); im.setColorAt(i, hue.setHex(hex)); });
      im.computeBoundingSphere(); im.castShadow = false; im.receiveShadow = true; im.name = item.id + '-' + kind; fu.add(im);
    }
    for (const [b, group] of [[T.fu, fu], [T.fx, fx]]) { const G = greens.get(b); if (G) { leafy(G.balls, group, 41); treesIn(G.trees, group, 43); } }
    const glazed = s.kind === 'lobby' || s.kind === 'common', reach = glazed ? 32 : s.kind === 'stair' ? 26 : 18;      // rooms are looked into from the galleries and the courtyard only
    if (fu.children.length) ctx.detail(ctx.add(fu), sx, sz, half + (low ? reach * 0.75 : reach));
    if (fx.children.length) ctx.detail(ctx.add(fx), sx, sz, half + (low ? 8 : glazed ? 15 : 10));
  }
  // after dusk the large glazed walls show lit rooms
  if (litMats.length) ctx.animate((dt, t, env) => { const n = env && env.lighting && env.lighting.night ? env.lighting.night() : 0; for (const q of litMats) q.emissiveIntensity = 1.2 * n; });
  const cgeo = new THREE.BufferGeometry(); cgeo.setAttribute('position', new THREE.Float32BufferAttribute(CP, 3));
  const cm = new THREE.Mesh(cgeo, mat('generic')); cm.visible = false; cm.name = item.id + '-colliders'; ctx.add(cm); ctx.collide(cm);
}
