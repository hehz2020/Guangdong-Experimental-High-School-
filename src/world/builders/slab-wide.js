// West teaching slab (item teaching-slab-west), just north of the gymnasium, inside and out.
//
// SEEN in the 2018 footage, all from the west or south-west and from far away (frames 43, 53, 58, 67-69):
//   - west end, from north to south: a white end bay with two columns of small square windows, a dark-red full-height
//     wall panel, then white slab-and-balustrade bands with dark gaps between them (five bands above the trees);
//   - a thin flat white roof slab that floats on thin posts above the top of the walls and overhangs the west end;
//   - a full-height green glass stair tower with tall white fins south of all that. It is a separate item
//     (teaching-slab-west-annex-w, builder stair-core.js) and is NOT modelled here.
// READ FROM THE SATELLITE MOSAIC (second reading, shots/measure; stored here only as numbers):
//   - the roof: cream, 47.8 m long; its north edge steps 2.4 m south for the eastern 18 m; the west end is pointed
//     (tip 1.1 m west of the north-west corner and 2.9 m south of it, then a diagonal to the south edge 4.3 m east);
//   - a bright line 11 m south of the north edge (drawn as a low white kerb) and a greyer strip 2.5 m wide beyond it
//     between 4.7 and 41.2 m from the west end (drawn as part of the roof slab; what it really is, is not established);
//   - five or six small dark squares along the roof, one at the west tip and two at the step (drawn as low dark units;
//     whether they are units or openings cannot be told);
//   - the north facade, seen obliquely: floor lines and closely spaced vertical lines. Only that much is taken from it:
//     five window bands with white piers. The data item is still the plain bounding rectangle, so the step and the
//     pointed end are kept in SHAPE below as offsets from its north-west corner; a polygon in the data replaces them.
//
// ASSUMED (no reference shows any of it; kept plain, typical of Guangdong school buildings, no lettering anywhere):
//   - five storeys of 3.6 m, a parapeted roof deck at 18 m and the roof slab floating 2.35 m above it, fitted to the
//     estimated height (the footage allows five or six levels; the stair-tower builder uses the same 3.6 m);
//   - the plan: ONE row of rooms 8 m deep on the north (5.6 m deep behind the stepped part) and an open corridor
//     2.7 m wide on the south with columns, edge beams, solid balustrades and a steel rail; the walls stand 0.8 m
//     inside the roof's north edge and the corridor face 1 m south of the bright line;
//   - the uses of the rooms: two classrooms and a teachers' office in the deep part; behind the step a laboratory and
//     a preparation room on the two lower floors, a small classroom and an office above; a closed block at the west
//     end behind the small square windows (not enterable, nothing inside) with one closed door;
//   - the whole north face in detail (sill and head heights, pier widths, window frames) and the plain east end;
//   - the staircase inside the east end with windows at its half landings. It exists so that the corridors can be
//     reached on foot; the real stairs are in the glass tower;
//   - every interior: floor, dado and wall finishes, platforms, blank blackboards with trays, consoles, projectors,
//     screens, clocks, fans, lights, curtains, air-conditioners, lockers, blank pin boards, desks, chairs, books,
//     laboratory benches with sinks and stools, shelving, office desks, doors with glass panels, blank class plates,
//     bins, hose cabinets, the water-dispenser niche, stair flights, nosings, stringers and handrails;
//   - on the outside at close range: window frames and sills, rail posts, copings, column caps, rainwater pipes, the
//     paved aprons, the units on the roof deck under the floating slab.
// Furniture has no collision. Everything small sits behind ctx.detail in three tiers (corridor/facade fittings,
// interiors, fine objects); ctx.lowPower thins it out. Barrier colliders are 1.7 m tall where the visible balustrade
// is lower (a jump clears 1.1 m). The roof slab is solid for the player, so leaving drone mode above it ends on it.
import { THREE } from '../../kit.js';
import { Batch } from '../../batch.js';

const FLOORS = 5, WALL = 0.24, SLAB = 0.35, PARAPET = 1.1, GAP = 1.25, CORRIDOR = 2.85, STEPS = 12, GO = 0.3, FLIGHT = 1.3, BAY = 4.8;
const SILL = 0.9, HEAD = 2.85;                         // north windows
const OVER = { w: 1.5, n: 0.8, e: 0.3 };               // how far the roof slab overhangs the walls
// second reading of the mosaic, metres from the north-west corner of the roof rectangle (used while the data item is a rectangle)
const SHAPE = { stepX: 29.9, stepZ: 2.4, tip: [-1.1, 2.9], cutX: 4.3, strip: 2.5 };
const STRIP_X = [4.7, 41.2], KERB_X = [4.3, 41.2];
const UNITS = [[0.03, 3.2, 1.2], [0.195, 4.0, 2.0], [0.4, 4.0, 2.0], [0.59, 3.3, 1.6], [0.6, 6.8, 1.6], [0.79, 5.9, 2.0]];   // [fraction of the length, metres south of the north edge, size]

/**
 * Every position of the plan, in metres in the slab's own frame: origin (ox, oz) = north-west corner of the roof
 * rectangle, x east, z south. Pure numbers (no geometry), so walk tests can import it and stay in step with the builder.
 */
export function plan(item, campus) {
  const P = item.points, n = Math.min(...P.map(q => q[1])), s = Math.max(...P.map(q => q[1])), e = Math.max(...P.map(q => q[0]));
  const northX = P.filter(q => q[1] < n + 0.5).map(q => q[0]), w = Math.min(...northX), L = e - w, H = item.height;
  let { stepX, stepZ, tip, cutX, strip } = SHAPE;
  if (P.length > 4) {                                  // a polygon in the data: read the step, the tip and the cut corner from it; it ends at the bright line
    const ne = Math.max(...northX), t = P.reduce((a, b) => (b[0] < a[0] ? b : a));
    stepX = ne < e - 1 ? ne - w : L; stepZ = ne < e - 1 ? Math.min(...P.filter(q => q[0] > e - 0.5).map(q => q[1])) - n : 0;
    tip = t[0] < w - 0.3 ? [t[0] - w, t[1] - n] : [0, 0]; cutX = Math.max(0, Math.min(...P.filter(q => q[1] > s - 0.5).map(q => q[0])) - w); strip = 0;
  }
  const zP = s - n - strip;                            // the bright line
  const FH = (H - SLAB - GAP - PARAPET) / FLOORS, roofY = FLOORS * FH;
  const X0 = OVER.w, X1 = L - OVER.e, zN = OVER.n, zS = zP + 1.0, zc = zS - CORRIDOR, zw = zc - 0.2;
  // the glass stair tower may reach into the west end: keep the rooms east of it
  let aE = -Infinity;
  for (const it of (campus && campus.items) || []) if (it.style === 'stair-core' && it.points) {
    const ax = it.points.map(q => q[0] - w), az = it.points.map(q => q[1] - n);
    if (Math.min(...ax) < X0 + 3 && Math.max(...ax) > X0 && Math.max(...az) > zN && Math.min(...az) < zc) aE = Math.max(aE, Math.max(...ax));
  }
  const xA = Math.max(X0 + 4.4, aE + 0.35);            // east side of the closed west block
  const xs1 = X1 - WALL, xs0 = xs1 - 2 * FLIGHT - 0.2, xH = xs0 - 0.1;     // stair hall between xs0 and xs1
  const stepped = stepZ > 0.5 && stepX > xA + 8 && stepX < xH - 4;
  const zones = stepped ? [{ a: xA, b: stepX, zn: zN }, { a: stepX, b: xH, zn: zN + stepZ }] : [{ a: xA, b: xH, zn: zN }];
  const rooms = [];
  for (const z of zones) {
    const nb = Math.max(1, Math.round((z.b - z.a) / BAY)), bw = (z.b - z.a) / nb;
    z.lines = Array.from({ length: nb + 1 }, (_, i) => z.a + i * bw);
    for (let i = 0; i < nb;) {
      const take = nb - i >= 2 ? 2 : 1, a = z.a + i * bw;
      rooms.push({ a, b: a + take * bw, zn: z.zn, zi: z.zn + WALL, shallow: zw - z.zn - WALL < 7, bays: Array.from({ length: take }, (_, j) => [a + j * bw, a + (j + 1) * bw]) });
      i += take;
    }
  }
  if (rooms[rooms.length - 1].bays.length === 1) rooms[rooms.length - 1].niche = true;   // water-dispenser niche beside the stair hall (a one-door room has the wall for it)
  const run = STEPS * GO, zl = zc - 0.6, zh = zl - run, zsn = zones[zones.length - 1].zn + WALL;
  return { ox: w, oz: n, L, D: s - n, H, FH, FLOORS, roofY, X0, X1, zN, zP, zS, zc, zw, xA, xs0, xs1, xH, stepped, stepX, stepZ, tip, cutX, strip, zones, rooms,
    run, zl, zh, zsn, xb1: xs0 + FLIGHT, xa1: xs0 + FLIGHT + 0.2, xa2: xs1 };
}
/** What a room is used as on storey k (0 = ground). All assumed. */
export const kindOf = (r, k) => (r.bays.length === 1 ? (r.shallow && k < 2 ? 'prep' : 'office') : r.shallow && k < 2 ? 'lab' : 'class');
/** Door openings of a room: [west jamb, hinge side]; each is 1 m wide. */
export const doorsOf = r => (r.bays.length > 1 ? [[r.a + 0.6, 'W'], [r.b - 1.6, 'E']] : [[r.a + 0.6, 'W']]);
const winsOf = r => { const a = r.a + 2.1, b = r.bays.length > 1 ? r.b - 2.1 : r.b - (r.niche ? 1.75 : 0.8), m = (a + b) / 2; return b - a < 3.4 ? [[a, b]] : [[a, m - 0.7], [m + 0.7, b]]; };

const ALL = 'EWUDSN', skipCache = {};
const skipOf = faces => skipCache[faces] ?? (skipCache[faces] = [...ALL].filter(f => !faces.includes(f)).join(''));

// ---- textures drawn in code (no lettering anywhere) ----
function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const rgb = (c, k = 1) => `rgb(${c.map(ch => Math.max(0, Math.min(255, Math.round(ch * k)))).join(',')})`;
function canvasTex(w, h, draw, mx, my = mx) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(1 / mx, 1 / my); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  return t;
}
const speckleTex = (c, metres, lo = 0.88, span = 0.24, n = 1400) => canvasTex(128, 128, (g, S) => {
  const r = rng(c[0] * 7 + c[2]); g.fillStyle = rgb(c); g.fillRect(0, 0, S, S);
  for (let i = 0; i < n; i++) { g.fillStyle = rgb(c, lo + r() * span); const s = 1 + r() * 3; g.fillRect(r() * S, r() * S, s, s); }
}, metres);
const tileTex = (c, metres) => canvasTex(128, 128, (g, S) => {             // 2 x 2 tiles per repeat
  const r = rng(11);
  for (let y = 0; y < 2; y++) for (let x = 0; x < 2; x++) { g.fillStyle = rgb(c, 0.96 + r() * 0.07); g.fillRect(x * 64, y * 64, 64, 64); }
  g.strokeStyle = rgb(c, 0.78); g.lineWidth = 1.5;
  for (let i = 0; i <= 2; i++) { g.beginPath(); g.moveTo(i * 64, 0); g.lineTo(i * 64, S); g.moveTo(0, i * 64); g.lineTo(S, i * 64); g.stroke(); }
}, metres);
const drapeTex = () => canvasTex(64, 8, (g, W, H) => {                     // vertical pleats
  for (let x = 0; x < W; x++) { g.fillStyle = rgb([196, 186, 150], 0.84 + 0.16 * Math.abs(Math.sin(x / W * Math.PI * 4))); g.fillRect(x, 0, 1, H); }
}, 0.42, 1);
const lockerTex = () => canvasTex(64, 64, (g, S) => {                      // one 0.4 m locker door: outline, three vent slits, a pull
  g.fillStyle = '#a9b3a2'; g.fillRect(0, 0, S, S); g.strokeStyle = '#6c7667'; g.lineWidth = 3; g.strokeRect(1.5, 1.5, S - 3, S - 3);
  g.fillStyle = '#6c7667'; for (let i = 0; i < 3; i++) g.fillRect(18, 12 + i * 6, 28, 2);
  g.fillStyle = '#e8e8e4'; g.fillRect(50, 30, 5, 8);
}, 0.4);
const boardTex = () => canvasTex(256, 64, (g, W, H) => {                   // blank blackboard with faint wiping marks
  const r = rng(53); g.fillStyle = '#24463a'; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 60; i++) { g.fillStyle = `rgba(255,255,255,${0.012 + r() * 0.02})`; g.fillRect(r() * W, r() * H, 20 + r() * 70, 3 + r() * 8); }
}, 4.2, 1.25);

const local = {};
function lm(name) {
  if (local[name]) return local[name];
  const S = (color, roughness = 0.85, metalness = 0, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness, metalness, ...extra });
  const T = (map, roughness = 0.85) => S(0xffffff, roughness, 0, { map });
  const make = {
    plaster: () => S(0xf0ede3, 0.92, 0, { emissive: 0xf0ede3, emissiveIntensity: 0.06 }),
    ceil: () => S(0xe9e6dc, 0.95, 0, { emissive: 0xe9e6dc, emissiveIntensity: 0.16 }),
    dado: () => S(0xc9d6b4, 0.8), corr: () => S(0xece4cf, 0.9), dark: () => S(0x24272a, 0.7), white: () => S(0xf3f2ee, 0.6),
    glassN: () => S(0x2f3d44, 0.06, 0.35, { transparent: true, opacity: 0.5, depthWrite: false }),            // north strips: read dark from outside
    glassC: () => S(0x9fc3cc, 0.05, 0.35, { transparent: true, opacity: 0.32, depthWrite: false }),           // corridor windows and door panels
    terrazzo: () => T(speckleTex([182, 178, 164], 2.4), 0.85), ctile: () => T(tileTex([205, 198, 184], 1.2), 0.8), cborder: () => S(0x70685f, 0.6),
    deck: () => T(speckleTex([96, 98, 98], 6, 0.72, 0.5), 0.95), roofCream: () => T(speckleTex([214, 200, 170], 5, 0.9, 0.16), 0.9), roofStrip: () => T(speckleTex([176, 176, 168], 5, 0.9, 0.16), 0.9),
    board: () => T(boardTex(), 0.9), cork: () => T(speckleTex([176, 141, 87], 1.0), 0.95), alu: () => S(0xc4c8cc, 0.45, 0.35),
    lamp: () => S(0xffffff, 0.6, 0, { emissive: 0xfff4d8, emissiveIntensity: 0.9 }),
    drape: () => T(drapeTex(), 0.95), locker: () => T(lockerTex(), 0.6), lockerBody: () => S(0xa3ad9c, 0.6),
    platform: () => S(0x9b8f7e, 0.8), deskTop: () => S(0xdcc091, 0.65), deskSteel: () => S(0x5f7184, 0.5, 0.2), seat: () => S(0xc99a5f, 0.7),
    benchTop: () => S(0x2e3336, 0.5), benchBody: () => S(0xd8d4c6, 0.7), stool: () => S(0x8a5a34, 0.7),
    binGrey: () => S(0x6b7377, 0.7), binGreen: () => S(0x3d8a55, 0.7), red: () => S(0xb8322a, 0.6), plate: () => S(0x2f5f9e, 0.5),
    door: () => S(0xb98452, 0.6), doorFrame: () => S(0x6f4b31, 0.6),
    tread: () => T(speckleTex([172, 168, 158], 1.6), 0.7), nosing: () => S(0x3b3b3b, 0.8), rail: () => S(0x8f979c, 0.4, 0.5),
    pvc: () => S(0xe4e2da, 0.7), fan: () => S(0xe9e7e0, 0.6), steelBox: () => S(0xb9bec2, 0.4, 0.5),
    sheetA: () => S(0xf4f1e6, 0.9), sheetB: () => S(0xf3e3a4, 0.9), sheetC: () => S(0xbfd9ee, 0.9), book: () => S(0xffffff, 0.85),
  };
  const m = make[name](); m.name = 'sw-' + name;      // named, so the lighting module does not take smooth ones for window glass
  return (local[name] = m);
}

// Draw-call saver: all plain-coloured, untextured, opaque parts of a group become ONE mesh with vertex colours.
let flatMat = null;
function mergeFlat(group, castShadow) {
  const take = group.children.filter(m => { const t = m.material; return m.isMesh && !m.isInstancedMesh && !t.map && !t.transparent && !/glass/i.test(t.name) && t.emissiveIntensity * (t.emissive.r + t.emissive.g + t.emissive.b) < 0.3; });
  if (take.length < 2) return group;
  let nv = 0, ni = 0; for (const m of take) { nv += m.geometry.attributes.position.count; ni += m.geometry.index.count; }
  const pos = new Float32Array(nv * 3), nor = new Float32Array(nv * 3), col = new Float32Array(nv * 3), idx = new Uint32Array(ni);
  let v0 = 0, i0 = 0;
  for (const m of take) {
    const g = m.geometry, n = g.attributes.position.count, c = m.material.color, ix = g.index.array;
    pos.set(g.attributes.position.array, v0 * 3); nor.set(g.attributes.normal.array, v0 * 3);
    for (let i = 0; i < n; i++) { col[(v0 + i) * 3] = c.r; col[(v0 + i) * 3 + 1] = c.g; col[(v0 + i) * 3 + 2] = c.b; }
    for (let i = 0; i < ix.length; i++) idx[i0 + i] = ix[i] + v0;
    v0 += n; i0 += ix.length; group.remove(m); g.dispose();
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.BufferAttribute(nor, 3)); g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  g.setIndex(new THREE.BufferAttribute(idx, 1));
  if (!flatMat) { flatMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.78, metalness: 0.03 }); flatMat.name = 'sw-flat'; }
  const mesh = new THREE.Mesh(g, flatMat); mesh.castShadow = castShadow; mesh.receiveShadow = true; group.add(mesh);
  return group;
}

// One pupil's desk with its chair pushed in, facing +x; origin on the floor under the middle of the desk top.
let deskParts = null;
function deskSet(low) {
  if (deskParts) return deskParts;
  const b = new Batch(), TOP = lm('deskTop'), ST = lm('deskSteel'), SE = lm('seat');
  b.box(TOP, 0, 0.735, 0, 0.42, 0.03, 0.58);
  b.box(ST, 0, 0.65, 0, 0.36, 0.14, 0.54, 'U');                                                 // book box under the top
  if (low) for (const z of [-0.27, 0.27]) b.box(ST, 0, 0.29, z, 0.34, 0.58, 0.02, 'UD');
  else for (const x of [-0.17, 0.17]) for (const z of [-0.27, 0.27]) b.box(ST, x, 0.29, z, 0.03, 0.58, 0.03, 'UD');
  b.box(SE, -0.34, 0.435, 0, 0.36, 0.03, 0.38); b.box(SE, -0.535, 0.67, 0, 0.03, 0.34, 0.38, 'D');   // seat and back
  if (low) for (const z of [-0.175, 0.175]) b.box(ST, -0.34, 0.21, z, 0.34, 0.42, 0.02, 'UD');
  else for (const z of [-0.175, 0.175]) { b.box(ST, -0.175, 0.21, z, 0.025, 0.42, 0.025, 'UD'); b.box(ST, -0.525, 0.42, z, 0.025, 0.84, 0.025, 'UD'); }
  return (deskParts = mergeFlat(b.build({ castShadow: false }), false).children);
}

export function build(item, ctx) {
  const p = plan(item, ctx.campus), low = !!ctx.lowPower;
  const { L, H, FH, roofY, X0, X1, zN, zP, zS, zc, zw, xA, xs0, xs1, zones, rooms, run, zl, zh, zsn, xb1, xa1, xa2 } = p;
  const yTop = roofY - 0.3, yS = H - SLAB, cw = zS - 0.12 - zc, RISE = FH / 2 / STEPS, zE = zones[zones.length - 1].zn;
  const ceilOf = k => (k === FLOORS - 1 ? yTop : (k + 1) * FH - 0.15);

  const v = new Batch(), c = new Batch(), ex = new Batch(), fu = new Batch(), fx = new Batch();   // shell, colliders, corridor/facade fittings, interiors, fine objects
  const home = b => b.frame(p.ox, p.oz); [v, c, ex, fu, fx].forEach(home);
  const F = (b, m, x, y, z, sx, sy, sz, faces) => b.slab(m, x, y, z, sx, sy, sz, skipOf(faces));   // box drawing only the listed faces
  const hit = (x, y, z, sx, sy, sz) => c.slab('generic', x, y, z, sx, sy, sz);
  const W = 'wallWhite', R = 'wallMaroon', MW = 'metalWhite', GLN = lm('glassN'), GL = lm('glassC');
  const PL = lm('plaster'), CE = lm('ceil'), DA = lm('dado'), CO = lm('corr'), DK = lm('dark'), AL = lm('alu'), WH = lm('white'), LAMP = lm('lamp'), RAIL = lm('rail');
  // inclined slab whose TOP surface runs from (zA, yA) to (zB, yB), between xa and xb
  const incl = (b, m, xa, xb, zA, yA, zB, yB, th, faces) => {
    const [zn, yn, zs, ys] = zA < zB ? [zA, yA, zB, yB] : [zB, yB, zA, yA], len = Math.hypot(zs - zn, ys - yn), ang = Math.atan2(yn - ys, zs - zn);
    b.setMatrix(new THREE.Matrix4().makeRotationX(ang).setPosition(p.ox + (xa + xb) / 2, (yn + ys) / 2 - Math.cos(ang) * th / 2, p.oz + (zn + zs) / 2 - Math.sin(ang) * th / 2));
    b.box(m, 0, 0, 0, xb - xa, th, len, skipOf(faces)); home(b);
  };
  const stick = (b, m, a, q, t) => { b.strut(m, [p.ox + a[0], a[1], p.oz + a[2]], [p.ox + q[0], q[1], p.oz + q[2]], t); home(b); };

  // ================= SHELL (always drawn) and colliders =================
  // ---- north face of the rooms: piers at the bay lines, two slim piers per bay, glass strips, white bands ----
  zones.forEach((z, i) => {
    const xa = i ? z.a + 0.1 : z.a, xb = i < zones.length - 1 ? z.b + 0.1 : xs0, zn = z.zn, len = xb - xa;
    hit(xa, 0, zn, len, roofY, WALL);
    for (const x of z.lines) { const pa = Math.max(xa, x - 0.25), pb = Math.min(xb, x + 0.25); F(v, W, pa, 0, zn - 0.06, pb - pa, yTop, WALL + 0.06, 'NEW'); F(v, PL, pa, 0, zn, pb - pa, yTop, WALL + 0.004, 'S'); }
    for (let k = 0; k < FLOORS; k++) {
      const y = k * FH, by = y + HEAD, bh = (k === FLOORS - 1 ? yTop : y + FH) - by;
      F(v, W, xa, y, zn, len, SILL, WALL, 'NU'); F(v, DA, xa, y, zn, len, SILL, WALL, 'S');                                       // spandrel
      F(v, W, xa, by, zn - 0.03, len, bh, WALL + 0.03, 'ND'); F(v, PL, xa, by, zn, len, bh, WALL, 'S');                           // band over the windows
      F(v, GLN, xa, y + SILL, zn + 0.1, len, HEAD - SILL, 0.02, 'NS');
      for (let j = 0; j < z.lines.length - 1; j++) for (const t of [1 / 3, 2 / 3]) {
        const x = z.lines[j] + 0.25 + (z.lines[j + 1] - z.lines[j] - 0.5) * t - 0.1;
        F(v, W, x, y + SILL, zn, 0.2, HEAD - SILL, WALL, 'NEW'); F(v, PL, x, y + SILL, zn, 0.2, HEAD - SILL, WALL, 'S');
      }
    }
  });
  if (zones.length > 1) {                                                          // the step in the north face: a short wall facing east
    const xq = zones[0].b, zb = zones[1].zn;
    F(v, W, xq - 0.1, 0, zN, 0.2, yTop, zb - zN, 'E'); F(v, PL, xq - 0.1, 0, zN + WALL, 0.2, yTop, zw - zN - WALL, 'W'); F(v, PL, xq - 0.1, 0, zb + WALL, 0.2, yTop, zw - zb - WALL, 'E');
    hit(xq - 0.1, 0, zN, 0.2, roofY, zw - zN);
  }
  // ---- closed block at the west end: white bay with small square windows, dark-red panel ----
  const zr = zN + (zc - zN) * 0.62;
  F(v, W, X0, 0, zN, WALL, roofY + PARAPET, zr - zN, 'WNU'); F(v, R, X0 - 0.06, 0, zr, WALL + 0.06, roofY + PARAPET, zc - zr, 'WNSU');
  F(v, W, X0, 0, zN, xA - X0, yTop, WALL, 'N'); F(v, PL, xA - 0.1, 0, zN + WALL, 0.2, yTop, zw - zN - WALL, 'E');
  hit(X0, 0, zN, xA + 0.1 - X0, roofY, zc - zN); hit(X0, roofY, zN, WALL, 1.7, zc - zN);
  for (let k = 0; k < FLOORS; k++) for (const t of [0.3, 0.7]) {
    F(v, 'glassDark', X0 - 0.02, k * FH + 1.35, zN + (zr - zN) * t - 0.55, 0.03, 1.1, 1.1, 'W');
    F(v, 'glassDark', X0 + (xA - X0) * t - 0.45, k * FH + 1.6, zN - 0.02, 0.9, 0.9, 0.03, 'N');
  }
  // ---- east end wall, stair hall walls (windows at the half landings) ----
  F(v, W, xs1, 0, zE, WALL, yTop, zS - zE, 'ENS'); F(v, CO, xs1, 0, zE, WALL, yTop, zS - zE, 'W'); hit(xs1, 0, zE, WALL, roofY, zS - zE);
  F(v, PL, xs0 - 0.2, 0, zsn, 0.2, yTop, zw - zsn, 'W'); F(v, CO, xs0 - 0.2, 0, zsn, 0.2, yTop, zw - zsn, 'E'); hit(xs0 - 0.2, 0, zsn, 0.2, roofY, zc - zsn);
  const swa = (xs0 + xs1) / 2 - 0.8, swb = swa + 1.6;
  F(v, W, xs0, 0, zE, swa - xs0, yTop, WALL, 'N'); F(v, CO, xs0, 0, zE, swa - xs0, yTop, WALL, 'SE');
  F(v, W, swb, 0, zE, xs1 - swb, yTop, WALL, 'N'); F(v, CO, swb, 0, zE, xs1 - swb, yTop, WALL, 'SW');
  hit(xs0, 0, zE, xs1 - xs0, roofY, WALL);
  for (let k = 0, yy = 0; k < FLOORS; k++) {
    const ya = k < FLOORS - 1 ? k * FH + FH / 2 + 0.95 : yTop;
    F(v, W, swa, yy, zE, 1.6, ya - yy, WALL, 'NUD'); F(v, CO, swa, yy, zE, 1.6, ya - yy, WALL, 'S');
    if (k < FLOORS - 1) F(v, GLN, swa, ya, zE + 0.1, 1.6, 1.4, 0.02, 'NS');
    yy = ya + 1.4;
  }
  // ---- partitions between rooms of the same depth ----
  rooms.forEach((r, i) => { const nx = rooms[i + 1]; if (nx && nx.zn === r.zn) { F(v, PL, r.b - 0.1, 0, r.zi, 0.2, yTop, zw - r.zi, 'EW'); hit(r.b - 0.1, 0, r.zi, 0.2, yTop, zw - r.zi); } });
  // ---- south side: columns, edge beams, solid balustrades ----
  const cols = [X0 + 0.2, ...new Set(zones.flatMap(z => z.lines)), xs1 - 0.2];
  for (const x of cols) { F(v, W, x - 0.2, 0, zS - 0.42, 0.4, yTop, 0.42, 'NSEW'); hit(x - 0.2, 0, zS - 0.42, 0.4, yTop, 0.42); }
  for (let k = 1; k <= FLOORS; k++) {
    const y = k * FH, top = k === FLOORS;
    F(v, W, X0, y - 0.6, zS - 0.3, X1 - X0, top ? 0.3 : 0.6, 0.3, 'NSD');                                                       // edge beam
    if (top) break;
    F(v, W, X0, y, zS - 0.12, X1 - X0, 0.85, 0.12, 'NSU'); hit(X0, y, zS - 0.12, X1 - X0, 1.7, 0.12);                           // collider taller than the visible balustrade
    F(v, W, X0, y - 0.15, zc, 0.12, 1.0, zS - 0.12 - zc, 'EWU'); hit(X0, y, zc, 0.12, 1.7, zS - zc);                            // across the west end of the corridor
  }
  // ---- floors, ceilings, the wall between rooms and corridor ----
  const ops = [];
  for (const r of rooms) {
    for (const [xd] of doorsOf(r)) ops.push([xd, xd + 1.0, 'door']);
    for (const [a, b] of winsOf(r)) ops.push([a, b, 'win']);
    if (r.niche) ops.push([r.b - 1.4, r.b - 0.1, 'niche']);
  }
  ops.sort((a, b) => a[0] - b[0]);
  const seg = (xa, xb, y0, h, faces) => {                                          // piece of the corridor wall: plaster inside, cream outside
    if (faces.includes('N')) F(v, PL, xa, y0, zw, xb - xa, h, 0.2, 'N');
    F(v, CO, xa, y0, zw, xb - xa, h, 0.2, faces.replace('N', '')); hit(xa, y0, zw, xb - xa, h, 0.2);
  };
  const plates = zones.map((z, i) => [i ? z.a + 0.1 : X0, i < zones.length - 1 ? z.b + 0.1 : xs0 - 0.2, z.zn]);   // floor plates west of the stair hall: [west, east, north edge]
  const TZ = lm('terrazzo'), CT = lm('ctile'), CB = lm('cborder');
  for (let k = 0; k < FLOORS; k++) {
    const y = k * FH, cy = ceilOf(k);
    if (k) {
      for (const [xa, xb, zn] of plates) { F(v, CE, xa, y - 0.15, zn, xb - xa, 0.15, zS - zn, 'D'); hit(xa, y - 0.15, zn, xb - xa, 0.15, zS - zn); }
      F(v, CE, xs0 - 0.2, y - 0.15, zl, X1 - xs0 + 0.2, 0.15, zS - zl, 'DN'); hit(xs0 - 0.2, y - 0.15, zl, X1 - xs0 + 0.2, 0.15, zS - zl);
    }
    for (const r of rooms) F(v, TZ, r.a - 0.1, y, r.zi, r.b - r.a, 0.02, zc - r.zi, 'U');                                       // room floors
    F(v, CT, X0, y, zc + 0.18, xs1 - X0, 0.02, cw - 0.36, 'U');                                                                 // corridor: tiles with a darker border
    F(v, CB, X0, y, zc, xs1 - X0, 0.02, 0.18, 'U'); F(v, CB, X0, y, zc + cw - 0.18, xs1 - X0, 0.02, 0.18, 'U');
    F(v, CT, xs0, y, k ? zl : zsn, xs1 - xs0, 0.02, zc - (k ? zl : zsn), 'U');                                                  // stair landing / stair hall floor
    let x = X0;
    for (const [a, b, t] of ops) {
      seg(x, a, y, 2.6, 'NSEW');
      if (t === 'win') { seg(a, b, y, 1.3, 'NSU'); F(v, GL, a, y + 1.3, zw + 0.09, b - a, 1.3, 0.02, 'NS'); hit(a, y + 1.3, zw + 0.06, b - a, 1.3, 0.08); }
      else seg(a, b, y + 2.1, 0.5, 'NSD');
      if (t === 'niche') {                                                         // recess with a solid back; the dispensers stand in it
        F(v, CO, a, y, zc - 0.78, b - a, 2.1, 0.06, 'S'); F(v, CO, a - 0.05, y, zc - 0.78, 0.05, 2.1, 0.58, 'E'); F(v, CO, b, y, zc - 0.78, 0.05, 2.1, 0.58, 'W');
        F(v, CO, a, y + 2.1, zc - 0.78, b - a, 0.05, 0.58, 'D'); F(v, PL, a - 0.06, y, zc - 0.8, b - a + 0.12, cy - y, 0.6, 'NW'); hit(a - 0.06, y, zc - 0.8, b - a + 0.12, cy - y, 0.62);
      }
      x = b;
    }
    seg(x, xs0, y, 2.6, 'NSEW'); seg(X0, xs0, y + 2.6, cy - y - 2.6, 'NSD');
  }
  // ---- staircase: landings, guard, colliders (the visible flights are interior detail) ----
  hit(xb1, 0, zh, 0.2, yTop, run);                                                 // well between the flights: closed for the player
  for (let k = 0; k < FLOORS - 1; k++) {
    const ym = k * FH + FH / 2;
    hit(xs0, ym - 0.15, zsn, xs1 - xs0, 0.15, zh - zsn); F(v, CT, xs0, ym - 0.15, zsn, xs1 - xs0, 0.15, zh - zsn, 'U'); F(v, CE, xs0, ym - 0.15, zsn, xs1 - xs0, 0.15, zh - zsn, 'DS');
  }
  const yT4 = (FLOORS - 1) * FH;                                                   // top floor: guard over the void above the last flight A
  F(v, W, xb1, yT4, zl - 0.1, xa2 - xb1, 1.05, 0.1, 'NSUW'); hit(xb1, yT4, zl - 0.1, xa2 - xb1, 1.7, 0.1);
  // ---- roof deck with parapets ----
  const DECK = lm('deck'), par = (x, z, sx, sz) => { F(v, W, x, roofY, z, sx, PARAPET, sz, 'NSEWU'); hit(x, roofY, z, sx, 1.7, sz); };
  zones.forEach((z, i) => {
    const xa = i ? z.a + 0.1 : X0, xb = i < zones.length - 1 ? z.b + 0.1 : X1, zn = z.zn;
    F(v, DECK, xa, yTop, zn, xb - xa, 0.3, zS - zn, 'U'); F(v, W, xa, yTop, zn, xb - xa, 0.3, zS - zn, 'NSEW'); F(v, CE, xa, yTop, zn, xb - xa, 0.3, zS - zn, 'D'); hit(xa, yTop, zn, xb - xa, 0.3, zS - zn);
    par(xa + (i ? 0 : WALL), zn, xb - xa - (i ? 0 : WALL), 0.2);
    if (i) par(xa, zones[i - 1].zn, 0.2, zn - zones[i - 1].zn);
  });
  par(X0, zS - 0.2, X1 - X0, 0.2); par(X0, zc, 0.2, zS - 0.2 - zc); par(X1 - 0.2, zE + 0.2, 0.2, zS - zE - 0.4);
  // ---- posts and the floating roof slab (solid for the player, without openings) ----
  const xp = p.cutX + 0.7, post = (x, z) => F(v, WH, x - 0.14, roofY, z - 0.14, 0.28, yS - roofY, 0.28, 'NSEW');
  for (const x of cols) if (x > xp) post(x, zP - 0.6);
  for (const z of zones) for (const x of z.lines) post(x + (x === z.a && z !== zones[0] ? 0.4 : 0), z.zn + 0.35);
  post(X0 + 0.2, zN + 0.35); post(X0 + 0.2, zN + 3.6);
  const CREAM = lm('roofCream'), P3 = (q, y) => [q[0], y, q[1]];
  const prow = [[0, 0], p.tip, [p.cutX, zP], [xp, zP], [xp, 0]];                    // counter-clockwise on a north-up map
  for (let i = 1; i < prow.length - 1; i++) {
    v.quad(CREAM, P3(prow[0], H), P3(prow[i], H), P3(prow[i + 1], H), P3(prow[i + 1], H));
    v.quad(WH, P3(prow[0], yS), P3(prow[i + 1], yS), P3(prow[i], yS), P3(prow[i], yS));
  }
  for (let i = 0; i < 3; i++) v.quad(WH, P3(prow[i], yS), P3(prow[i + 1], yS), P3(prow[i + 1], H), P3(prow[i], H));
  v.quad(WH, P3(prow[4], yS), P3(prow[0], yS), P3(prow[0], H), P3(prow[4], H));
  hit(0, yS, 0, xp, SLAB, zP);
  const roofBox = (x, z, sx, sz, top, faces) => { F(v, WH, x, yS, z, sx, SLAB, sz, faces); F(v, top, x, yS, z, sx, SLAB, sz, 'U'); hit(x, yS, z, sx, SLAB, sz); };
  const xq = p.stepped ? p.stepX : L;
  roofBox(xp, 0, xq - xp, zP, CREAM, p.stepped ? 'NSD' : 'NSED');
  if (p.stepped) { roofBox(xq, p.stepZ, L - xq, zP - p.stepZ, CREAM, 'NSED'); F(v, WH, xq - 0.01, yS, 0, 0.01, SLAB, p.stepZ, 'E'); }
  if (p.strip > 0) roofBox(STRIP_X[0], zP, Math.min(L, STRIP_X[1]) - STRIP_X[0], p.strip, lm('roofStrip'), 'SEWD');
  F(v, WH, KERB_X[0], H, zP - 0.2, Math.min(L, KERB_X[1]) - KERB_X[0], 0.25, 0.2, 'NSEWU');                                     // the bright line
  for (const [t, z, s] of UNITS) { F(v, DK, L * t - s / 2, H, z - s / 2, s, 0.6, s, 'NSEWU'); hit(L * t - s / 2, H, z - s / 2, s, 0.6, s); }

  // ================= CORRIDOR AND FACADE FITTINGS (middle range) =================
  const PV = lm('pvc'), DOOR = lm('door'), DFR = lm('doorFrame'), PLT = lm('plate'), SB = lm('steelBox');
  // north windows: aluminium frames and projecting sills
  zones.forEach((z, i) => {
    const xa = i ? z.a + 0.1 : z.a, xb = i < zones.length - 1 ? z.b + 0.1 : xs0, zn = z.zn;
    for (let k = 0; k < FLOORS; k++) {
      const y = k * FH;
      F(ex, WH, xa, y + SILL - 0.06, zn - 0.08, xb - xa, 0.06, 0.08, 'NUD');                                                    // sill
      for (let j = 0; j < z.lines.length - 1; j++) {
        const a = z.lines[j] + 0.25, b = z.lines[j + 1] - 0.25, u = (b - a - 0.4) / 3;
        F(ex, MW, a, y + 2.25, zn + 0.07, b - a, 0.05, 0.08, 'NSUD');                                                          // transom
        for (let q = 0; q < 3; q++) {
          const xu = a + q * (u + 0.2);
          F(ex, MW, xu + u / 2 - 0.025, y + SILL, zn + 0.07, 0.05, 2.25 - SILL, 0.08, 'NSEW');                                   // mullion of the sliding pair
          if (!low) { F(ex, MW, xu, y + SILL, zn + 0.07, u, 0.04, 0.08, 'NSU'); F(ex, MW, xu, y + HEAD - 0.04, zn + 0.07, u, 0.04, 0.08, 'NSD'); }
        }
      }
    }
    for (const x of z.lines) if (x > xa + 1 && x < xb - 1 && Math.round((x - z.a) / (z.lines[1] - z.a)) % 2 === 1) ex.cyl(PV, x, 0, zn - 0.12, 0.055, yTop, 8, false);   // rainwater pipes on the north piers
  });
  for (let k = 0; k < FLOORS; k++) {                                               // west end: frames and sills of the small square windows; landing windows
    const y = k * FH;
    for (const t of [0.3, 0.7]) {
      const z0 = zN + (zr - zN) * t - 0.55;
      F(ex, WH, X0 - 0.07, y + 1.29, z0 - 0.05, 0.07, 0.06, 1.2, 'WUDNS'); F(ex, MW, X0 - 0.04, y + 1.35, z0 + 0.525, 0.03, 1.1, 0.05, 'WNS'); F(ex, MW, X0 - 0.04, y + 1.875, z0, 0.03, 0.05, 1.1, 'WUD');
      const x0 = X0 + (xA - X0) * t - 0.45;
      F(ex, WH, x0 - 0.05, y + 1.54, zN - 0.07, 1.0, 0.06, 0.07, 'NUDEW'); F(ex, MW, x0 + 0.425, y + 1.6, zN - 0.04, 0.05, 0.9, 0.03, 'NEW');
    }
    if (k < FLOORS - 1) { const ya = y + FH / 2 + 0.95; F(ex, MW, swa + 0.775, ya, zE + 0.07, 0.05, 1.4, 0.08, 'NSEW'); F(ex, WH, swa - 0.05, ya - 0.06, zE - 0.07, 1.7, 0.06, 0.07, 'NUDEW'); }
  }
  // south face and corridors
  cols.forEach((x, i) => { if (i % 2 === 1) ex.cyl(PV, x, 0, zS + 0.07, 0.055, yTop, 8, false); });                               // rainwater pipes
  for (const x of cols) for (let k = 1; k <= FLOORS; k++) F(ex, W, x - 0.25, k * FH - 0.68, zS - 0.47, 0.5, 0.08, 0.52, 'NSEWD');  // column caps under the edge beams
  for (const [x, z, sx, sz] of [[X0, zS - 0.24, X1 - X0, 0.28], [X0 - 0.04, zc, 0.28, zS - zc], [X1 - 0.24, zE, 0.28, zS - zE], ...zones.map((z, i) => [i ? z.a + 0.1 : X0, z.zn - 0.04, (i < zones.length - 1 ? z.b + 0.1 : X1) - (i ? z.a + 0.1 : X0), 0.28])])
    F(ex, WH, x, roofY + PARAPET, z, sx, 0.06, sz, 'NSEWUD');                                                                    // parapet copings
  for (const [t, z] of [[0.22, 0.45], [0.48, 0.4], [0.7, 0.55]]) {                                                               // plain units on the deck under the floating slab
    const x = xA + (xs0 - xA) * t, zz = zE + (zc - zE) * z;
    F(ex, lm('roofStrip'), x - 0.9, roofY + 0.1, zz - 0.6, 1.8, 0.9, 1.2, 'NSEWU'); F(ex, DK, x - 0.8, roofY, zz - 0.5, 1.6, 0.1, 1.0, 'NSEW');
  }
  F(ex, DK, xA, roofY, zc + 0.3, xs0 - xA, 0.06, 0.07, 'NSU');                                                                   // conduit
  F(ex, 'concrete', X0 - 0.3, 0, zS, X1 - X0 + 0.6, 0.03, 0.6, 'USEW');                                                         // paved aprons at the foot of both long faces
  zones.forEach((z, i) => { const xa = i ? z.a + 0.1 : X0; F(ex, 'concrete', xa, 0, z.zn - 0.6, (i < zones.length - 1 ? z.b + 0.1 : X1) - xa, 0.03, 0.6, 'UNEW'); });
  const dz = cw / 2;
  for (let k = 0; k < FLOORS; k++) {
    const y = k * FH, cy = ceilOf(k);
    if (k) {                                                                       // coping and steel rail on the balustrades
      F(ex, WH, X0, y + 0.85, zS - 0.16, X1 - X0, 0.04, 0.2, 'NSUD'); F(ex, RAIL, X0, y + 1.07, zS - 0.085, X1 - X0, 0.04, 0.05, 'NSUD');
      for (let x = X0 + 0.6; x < X1 - 0.3; x += low ? 2.4 : 1.2) F(ex, RAIL, x - 0.012, y + 0.89, zS - 0.072, 0.024, 0.18, 0.024, 'NSEW');
      F(ex, RAIL, X0 + 0.035, y + 1.07, zc, 0.05, 0.04, zS - zc, 'EWUD');
    }
    for (const x of cols.slice(1, -1)) F(ex, W, x - 0.12, cy - 0.4, zc, 0.24, 0.4, zS - 0.3 - zc, 'EWD');                        // beams across the corridor
    for (const z of zones) for (let j = 0; j < z.lines.length - 1; j++) F(ex, LAMP, (z.lines[j] + z.lines[j + 1]) / 2 - 0.18, cy - 0.06, zc + dz - 0.18, 0.36, 0.06, 0.36, 'NSEWD');   // ceiling lights
    F(ex, LAMP, (xs0 + xs1) / 2 - 0.18, cy - 0.06, zc + dz - 0.18, 0.36, 0.06, 0.36, 'NSEWD'); F(ex, LAMP, (X0 + xA) / 2 + 0.6, cy - 0.06, zc + dz - 0.18, 0.36, 0.06, 0.36, 'NSEWD');
    let xs = X0 + WALL;                                                            // dado on the corridor side, between the door openings
    for (const [a, b, t] of [...ops, [xs0, xs0, 'end']]) if (t !== 'win') { F(ex, DA, xs, y + 0.02, zc, a - xs, 0.95, 0.008, 'S'); xs = b; }
    for (const r of rooms) {
      const kind = kindOf(r, k), wl = winsOf(r);
      for (const [a, b] of wl) {                                                   // sliding-window frames
        for (const yy of [y + 1.3, y + 2.55]) F(ex, MW, a, yy, zw + 0.06, b - a, 0.05, 0.08, 'NSUD');
        for (const xx of [a, (a + b) / 2 - 0.025, b - 0.05]) F(ex, MW, xx, y + 1.35, zw + 0.06, 0.05, 1.2, 0.08, 'NSEW');
        const xm = (a + b) / 2;                                                    // air-conditioner: outdoor unit above the window, indoor unit behind it
        if (kind !== 'prep' && (r.bays.length > 1 || a === wl[0][0])) {
          F(ex, WH, xm - 0.4, y + 2.72, zc, 0.8, 0.5, 0.3, 'SEWD'); F(ex, DK, xm - 0.3, y + 2.76, zc + 0.3, 0.42, 0.42, 0.006, 'S');
          for (const s of [-0.3, 0.27]) F(ex, AL, xm + s, y + 2.68, zc, 0.03, 0.04, 0.32, 'EWD');
          F(fu, WH, xm - 0.45, y + 2.74, zw - 0.21, 0.9, 0.29, 0.21, 'NEWUD'); F(fu, DK, xm - 0.4, y + 2.755, zw - 0.214, 0.8, 0.03, 0.006, 'N');
        }
      }
      for (const [xd] of doorsOf(r)) { F(ex, PLT, xd + 1.12, y + 2.22, zc, 0.02, 0.16, 0.36, 'EWSUD'); F(ex, WH, xd + 1.1, y + 1.5, zc, 0.2, 0.28, 0.012, 'SEWUD'); }   // blank plates
      if (wl.length === 2) {                                                       // blank pin board between the two windows
        const xm = (wl[0][1] + wl[1][0]) / 2;
        F(ex, lm('cork'), xm - 0.55, y + 1.15, zc, 1.1, 1.0, 0.02, 'S'); F(ex, AL, xm - 0.59, y + 1.11, zc, 1.18, 1.08, 0.014, 'SEWUD');
        if (!low) [['sheetA', -0.4, 0.55], ['sheetB', -0.05, 0.5], ['sheetC', 0.2, 0.12], ['sheetA', -0.35, 0.1]].forEach(([m, dx, dy]) => F(fx, lm(m), xm + dx, y + 1.2 + dy, zc + 0.02, 0.21, 0.3, 0.004, 'S'));
        [['binGrey', -0.27], ['binGreen', 0.27]].forEach(([m, dx]) => { ex.cyl(lm(m), xm + dx, y + 0.02, zc + 0.26, 0.2, 0.6, 10); ex.cyl(DK, xm + dx, y + 0.62, zc + 0.26, 0.21, 0.03, 10); });   // bins under it
      }
      if (r.niche) for (const dx of [0.12, 0.72]) {                                // two water dispensers in the niche
        const x = r.b - 1.4 + dx;
        F(ex, SB, x, y + 0.02, zc - 0.66, 0.44, 1.25, 0.4, 'SEWU'); F(ex, DK, x + 0.07, y + 0.74, zc - 0.26, 0.3, 0.3, 0.004, 'S'); F(ex, AL, x + 0.05, y + 0.7, zc - 0.26, 0.34, 0.03, 0.1, 'SEWUD');
        if (!low) for (const tx of [0.13, 0.27]) F(fx, AL, x + tx, y + 0.84, zc - 0.26, 0.03, 0.06, 0.05, 'SEWUD');
      }
    }
    if (rooms.length > 2) {                                                        // hose cabinet (blank front) and two extinguishers
      const xc = rooms[1].b, RED = lm('red');
      F(ex, RED, xc - 0.2, y + 0.85, zc, 0.7, 0.95, 0.07, 'SEWUD'); F(ex, WH, xc - 0.14, y + 0.91, zc + 0.07, 0.58, 0.83, 0.004, 'S');
      for (const dx of [-0.36, -0.52]) { ex.cyl(RED, xc + dx, y + 0.02, zc + 0.11, 0.07, 0.42, 8); ex.cyl(DK, xc + dx, y + 0.44, zc + 0.11, 0.025, 0.1, 6); }
    }
    // closed door of the west block
    const xd = xA - 1.05;
    F(ex, DOOR, xd, y + 0.02, zc, 0.85, 2.05, 0.03, 'SEWU'); F(ex, DFR, xd - 0.06, y, zc, 0.06, 2.13, 0.05, 'SEW'); F(ex, DFR, xd + 0.85, y, zc, 0.06, 2.13, 0.05, 'SEW'); F(ex, DFR, xd, y + 2.07, zc, 0.85, 0.06, 0.05, 'SD');
    F(ex, WH, xd + 0.3, y + 2.2, zc, 0.25, 0.14, 0.012, 'SEWUD'); F(fx, AL, xd + 0.68, y + 1.0, zc + 0.03, 0.1, 0.03, 0.05, 'SEWUD');
  }

  // ================= INTERIORS (near range) =================
  const desks = [], books = [], rnd = rng(item.id.length * 131 + Math.round(L * 10));
  const fan = (x, z, cy) => {
    F(fu, AL, x - 0.012, cy - 0.55, z - 0.012, 0.024, 0.55, 0.024, 'NSEW'); fu.cyl(lm('fan'), x, cy - 0.67, z, 0.1, 0.12, 8);
    for (let i = 0; i < 3; i++) { fu.frame(p.ox + x, p.oz + z, i * 2.0944 + 0.4); fu.box(lm('fan'), 0.42, cy - 0.6, 0, 0.62, 0.012, 0.13, 'EW'); }
    home(fu);
  };
  const light = (x, z, cy, len = 1.2) => {                                         // hanging twin-tube fitting, long axis east-west
    F(fu, WH, x - len / 2, cy - 0.5, z - 0.1, len, 0.05, 0.2, 'NSEWU'); F(fu, LAMP, x - len / 2, cy - 0.51, z - 0.08, len, 0.012, 0.16, 'D');
    if (!low) for (const s of [-0.4, 0.4]) F(fu, AL, x + s * len - 0.006, cy - 0.45, z - 0.006, 0.012, 0.45, 0.012, 'NSEW');
  };
  const shellOf = (r, y, k) => {                                                   // dado, ceiling beams, curtains: common to every room
    const zi = r.zi;
    F(fu, DA, r.a + 0.1, y + 0.02, zi, 0.008, 0.95, zw - zi, 'E'); F(fu, DA, r.b - 0.108, y + 0.02, zi, 0.008, 0.95, zw - zi, 'W');
    let xs = r.a + 0.1;
    for (const [a, b, t] of [...ops.filter(o => o[0] > r.a && o[1] < r.b + 0.01), [r.b - 0.1, 0, 'end']]) if (t !== 'win') { F(fu, DA, xs, y + 0.02, zw - 0.008, a - xs, 0.95, 0.008, 'N'); xs = b; }
    for (const [a, b] of r.bays) {
      if (a > r.a + 0.01) F(fu, PL, a - 0.125, ceilOf(k) - 0.45, zi, 0.25, 0.45, zw - zi, 'EWD');                                // ceiling beam
      for (const xl of [a, b]) { const pa = Math.max(xl - 0.25, r.a + 0.1), pb = Math.min(xl + 0.25, r.b - 0.1); F(fu, DA, pa, y + 0.02, zi, pb - pa, 0.95, 0.012, 'S'); }
      const wa = a + 0.25, ww = b - a - 0.5;
      F(fu, AL, wa, y + HEAD + 0.01, zi + 0.04, ww, 0.025, 0.04, 'SD');
      for (const xx of [wa + 0.02, wa + ww - 0.44]) F(fu, lm('drape'), xx, y + SILL - 0.05, zi + 0.03, 0.42, HEAD - SILL + 0.07, 0.09, 'NSEW');
    }
  };
  const leaf = (xd, side, y) => {                                                  // open door leaf, frame, vision panel, closer, handle
    const xl = side === 'W' ? xd + 0.05 : xd + 0.905, DL = lm('door');
    for (const xx of [xd, xd + 0.95]) F(fu, DFR, xx, y, zw - 0.02, 0.05, 2.1, 0.24, 'NSEW'); F(fu, DFR, xd, y + 2.05, zw - 0.02, 1.0, 0.05, 0.24, 'NSD');
    F(fu, DL, xl, y + 0.02, zw - 0.97, 0.045, 1.13, 0.95, 'EWN'); F(fu, DL, xl, y + 1.85, zw - 0.97, 0.045, 0.22, 0.95, 'EWNU');
    F(fu, DL, xl, y + 1.15, zw - 0.97, 0.045, 0.7, 0.12, 'EWNS'); F(fu, DL, xl, y + 1.15, zw - 0.6, 0.045, 0.7, 0.58, 'EWN');
    F(fu, GL, xl + 0.015, y + 1.15, zw - 0.85, 0.012, 0.7, 0.25, 'EW');
    F(fx, AL, xl - 0.003, y + 0.02, zw - 0.97, 0.051, 0.22, 0.95, 'EW');                                                        // kick plate
    F(fx, AL, xl - 0.03, y + 1.0, zw - 0.93, 0.105, 0.03, 0.12, 'EWNSUD');                                                      // lever handles
    F(fx, DK, xl + (side === 'W' ? 0.045 : -0.05), y + 1.98, zw - 0.3, 0.05, 0.06, 0.24, 'EWNSD');                              // closer body
    F(fx, AL, xl + (side === 'W' ? 0.06 : -0.3), y + 2.04, zw - 0.045, 0.285, 0.012, 0.025, 'NSUD');                            // closer arm
  };
  const front = (r, y, k, bl) => {                                                 // east wall: blank blackboard with tray, lights over it, screen case, speaker, clock
    const xb = r.b - 0.1, zmid = (r.zi + zw) / 2, cy = ceilOf(k), h = bl / 2;
    F(fu, lm('board'), xb - 0.03, y + 0.95, zmid - h, 0.03, 1.25, bl, 'W');
    for (const yy of [y + 0.91, y + 2.2]) F(fu, AL, xb - 0.045, yy, zmid - h - 0.04, 0.045, 0.04, bl + 0.08, 'WUD');
    for (const zz of [zmid - h - 0.04, zmid + h]) F(fu, AL, xb - 0.045, y + 0.95, zz, 0.045, 1.25, 0.04, 'WNS');
    F(fu, AL, xb - 0.12, y + 0.89, zmid - h, 0.12, 0.02, bl, 'WUDNS');
    F(fu, WH, xb - 0.11, y + 2.5, zmid - h * 0.64, 0.11, 0.11, bl * 0.64, 'WUDNS'); F(fu, DK, xb - 0.14, y + 2.75, zmid + h - 0.35, 0.14, 0.32, 0.22, 'WNSUD');
    for (const s of [-0.5, 0.5]) { F(fu, WH, xb - 0.75, cy - 0.62, zmid + s * h - 0.6, 0.14, 0.05, 1.2, 'NSEWU'); F(fu, LAMP, xb - 0.73, cy - 0.63, zmid + s * h - 0.58, 0.1, 0.012, 1.16, 'D'); }
    if (!low) {
      fx.setMatrix(new THREE.Matrix4().makeRotationZ(Math.PI / 2).setPosition(p.ox + xb, y + 2.72, p.oz + zmid - h + 0.35));
      fx.cyl(DK, 0, 0, 0, 0.17, 0.03, 16); fx.cyl(WH, 0, 0, 0, 0.15, 0.036, 16); fx.box(DK, 0, 0.038, 0.04, 0.014, 0.004, 0.08); fx.box(DK, 0.055, 0.038, 0, 0.11, 0.004, 0.01); home(fx);
      [[0.4, 'white'], [0.47, 'white'], [0.56, 'sheetB'], [0.63, 'red']].forEach(([d, m]) => F(fx, lm(m), xb - 0.09, y + 0.91, zmid + d, 0.012, 0.012, 0.06, 'WUNS'));   // chalk
      F(fx, DK, xb - 0.1, y + 0.91, zmid - 0.6, 0.05, 0.035, 0.13, 'WUNS');                                                     // eraser
    }
  };

  function classroom(r, y, k) {
    const xa = r.a + 0.1, xb = r.b - 0.1, len = xb - xa, cy = ceilOf(k), zi = r.zi, depth = zw - zi, zmid = (zi + zw) / 2;
    const bl = Math.min(4.2, depth - 2.6), pl = bl + (r.shallow ? 0.6 : 1.0), LB = lm('lockerBody');
    shellOf(r, y, k); front(r, y, k, bl);
    F(fu, lm('platform'), xb - 1.3, y + 0.02, zmid - pl / 2, 1.3, 0.15, pl, 'UWNS');                                            // raised platform
    F(fu, LB, xb - 0.95, y + 0.17, zmid - pl / 2 + 0.15, 0.6, 0.9, 1.1, 'NSEW'); F(fu, DK, xb - 0.97, y + 1.07, zmid - pl / 2 + 0.13, 0.64, 0.03, 1.14, 'NSEWUD');   // teacher's console
    F(fu, DK, xb - 0.7, y + 1.1, zmid - pl / 2 + 0.45, 0.03, 0.3, 0.45, 'NSEWU');
    F(fu, AL, xb - 3.3, cy - 0.5, zmid - 0.015, 0.03, 0.5, 0.03, 'NSEW'); F(fu, WH, xb - 3.48, cy - 0.62, zmid - 0.17, 0.36, 0.12, 0.34, 'NSEWUD'); F(fu, DK, xb - 3.12, cy - 0.6, zmid - 0.05, 0.02, 0.08, 0.1, 'ENSUD');   // projector
    for (const t of low ? [0.5] : [0.27, 0.73]) for (const s of [-1, 1]) fan(xa + len * t, zmid + s * depth * 0.17, cy);
    for (const t of [0.25, 0.75]) for (const d of r.shallow ? [-0.25, 0.25] : [-0.38, 0, 0.38]) light(xa + len * t, zmid + d * depth, cy);
    const lz = Math.floor((zw - 1.3 - zi - 1.1) / 0.4) * 0.4, z0 = zi + 1.1;                                                    // lockers and pin board on the back wall
    F(fu, LB, xa, y + 0.02, z0, 0.42, 1.25, lz, 'UNS'); F(fu, DK, xa, y + 0.02, z0, 0.425, 0.05, lz, 'E');
    fu.quad(lm('locker'), [xa + 0.421, y + 0.07, z0 + lz], [xa + 0.421, y + 0.07, z0], [xa + 0.421, y + 1.27, z0], [xa + 0.421, y + 1.27, z0 + lz]);
    const pb = Math.min(3.0, depth - 2.8);
    F(fu, lm('cork'), xa, y + 1.5, zmid - pb / 2, 0.02, 1.0, pb, 'E'); F(fu, AL, xa, y + 1.46, zmid - pb / 2 - 0.04, 0.014, 1.08, pb + 0.08, 'ENSUD');
    fu.cyl(lm('binGrey'), xa + 0.3, y + 0.02, zi + 0.3, 0.17, 0.45, 10); fu.cyl(lm('red'), xa + 0.3, y + 0.02, zi + 0.75, 0.14, 0.26, 10);
    if (!low) {
      stick(fu, lm('door'), [xa + 0.66, y + 0.08, zi + 0.26], [xa + 0.7, y + 1.3, zi + 0.05], 0.025); F(fu, lm('seat'), xa + 0.52, y + 0.02, zi + 0.2, 0.3, 0.14, 0.06, 'NSEWU');   // broom
      [['sheetA', -0.45, 0.6], ['sheetB', -0.2, 0.55], ['sheetC', 0.05, 0.12], ['sheetA', 0.3, 0.58]].forEach(([m, t, dy]) => F(fx, lm(m), xa + 0.02, y + 1.55 + dy, zmid + t * pb, 0.004, 0.3, 0.21, 'E'));
      F(fx, WH, xb - 1.75, y + 1.3, zw - 0.012, 0.09, 0.09, 0.012, 'NEWUD');                                                    // switch plate
    }
    // desks in double columns, chairs pushed in, facing the board
    const nc = depth >= 7.2 ? 4 : 3, rows = Math.max(1, Math.floor((len - 5.06) / 0.85) + 1), pitch = rows > 1 ? Math.min(0.95, (len - 5.06) / (rows - 1)) : 0;
    const aisle = Math.min(0.75, (depth - 0.9 - nc * 1.2) / (nc - 1));
    for (let i = 0; i < rows; i++) for (let j = 0; j < nc; j++) for (const d of [0.3, 0.9]) {
      const q = [xb - 2.51 - i * pitch, y + 0.02, zmid - (nc * 1.2 + (nc - 1) * aisle) / 2 + j * (1.2 + aisle) + d]; desks.push(q);
      if (!low && rnd() < 0.62) { books.push([q[0] + 0.02, q[1] + 0.75, q[2] + (rnd() - 0.5) * 0.2, rnd(), 0]); if (rnd() < 0.3) books.push([q[0] + 0.03, q[1] + 0.772, q[2] + (rnd() - 0.5) * 0.2, rnd(), 1]); }
    }
  }

  function office(r, y, k) {                                                       // teachers' room: six desks in a block, cabinets, pin board
    const xa = r.a + 0.1, xb = r.b - 0.1, len = xb - xa, cy = ceilOf(k), zi = r.zi, depth = zw - zi, zmid = (zi + zw) / 2, xm = (xa + xb) / 2 + 0.2, LB = lm('lockerBody');
    shellOf(r, y, k);
    const zo = r.niche ? -0.45 : 0, sp = Math.min(1.5, (depth - 2.6) / 2);
    for (const s of [-1, 1]) for (const d of [-sp, 0, sp]) {
      const xd = xm + (s < 0 ? -0.72 : 0.04), z = zmid + zo + d - 0.2;
      F(fu, lm('deskTop'), xd, y + 0.74, z - 0.62, 0.68, 0.03, 1.24, 'NSEWUD'); F(fu, LB, xd + 0.04, y + 0.02, z - 0.6, 0.6, 0.72, 0.42, 'NSEW'); F(fu, LB, xd + (s < 0 ? 0.62 : 0.02), y + 0.02, z - 0.18, 0.04, 0.72, 0.78, 'EW');
      F(fu, DK, xd + (s < 0 ? 0.45 : 0.2), y + 0.8, z - 0.05, 0.03, 0.3, 0.46, 'NSEWU');                                         // monitor
      const xc = xd + (s < 0 ? -0.5 : 0.72);
      F(fu, DK, xc, y + 0.44, z, 0.46, 0.06, 0.46, 'NSEWUD'); F(fu, DK, xc + (s < 0 ? 0 : 0.42), y + 0.5, z, 0.04, 0.45, 0.46, 'NSEWU'); fu.cyl(AL, xc + 0.23, y + 0.02, z + 0.23, 0.03, 0.42, 6, false);
      if (!low && rnd() < 0.8) books.push([xd + 0.34, y + 0.77, z - 0.4, rnd(), 0]);
    }
    F(fu, LB, xm - 0.04, y + 0.74, zmid + zo - sp - 0.85, 0.08, 0.42, 2 * sp + 1.3, 'NSEWU');                                    // low screen between the facing desks
    const cz = Math.floor((depth - (r.niche ? 3.2 : 2.6)) / 0.9) * 0.9;
    F(fu, LB, xb - 0.45, y + 0.02, zi + 0.7, 0.45, 1.9, cz, 'WNSU'); for (let i = 1; i < cz / 0.9 - 0.01; i++) F(fu, DK, xb - 0.452, y + 0.06, zi + 0.7 + i * 0.9 - 0.004, 0.004, 1.84, 0.008, 'W');
    const pb = Math.min(2.4, depth - 3.4);
    F(fu, lm('cork'), xa, y + 1.2, zmid - pb / 2, 0.02, 1.0, pb, 'E'); F(fu, AL, xa, y + 1.16, zmid - pb / 2 - 0.04, 0.014, 1.08, pb + 0.08, 'ENSUD');
    F(fu, WH, xa + 0.05, y + 0.02, zi + 0.45, 0.32, 0.95, 0.32, 'NSEWU'); fu.cyl(lm('sheetC'), xa + 0.21, y + 0.97, zi + 0.61, 0.13, 0.32, 10);   // bottled-water dispenser
    for (const s of [-1, 1]) { fan(xa + len / 2, zmid + s * depth * 0.2, cy); for (const d of [-0.3, 0.3]) light(xa + len * (s < 0 ? 0.3 : 0.72), zmid + d * depth, cy, 1.0); }
  }

  function lab(r, y, k) {                                                          // laboratory: fixed benches with sinks, stools, demonstration bench, cabinet
    const xa = r.a + 0.1, xb = r.b - 0.1, len = xb - xa, cy = ceilOf(k), zi = r.zi, depth = zw - zi, zmid = (zi + zw) / 2, BB = lm('benchBody'), BT = lm('benchTop');
    const bl = Math.min(4.2, depth - 2.6);
    shellOf(r, y, k); front(r, y, k, bl);
    F(fu, lm('platform'), xb - 1.5, y + 0.02, zmid - bl / 2 - 0.3, 1.5, 0.15, bl + 0.6, 'UWNS');
    const bench = (x, z0, lz, y0, south) => {                                      // runs north-south; the sink sits at its north or south end
      F(fu, BB, x + 0.03, y0, z0 + 0.03, 0.54, 0.78, lz - 0.06, 'NSEW'); F(fu, BT, x, y0 + 0.78, z0, 0.6, 0.04, lz, 'NSEWUD');
      const zk = south ? z0 + lz - 0.5 : z0 + 0.14;
      F(fu, AL, x + 0.12, y0 + 0.821, zk, 0.36, 0.004, 0.36, 'U'); F(fu, DK, x + 0.16, y0 + 0.824, zk + 0.04, 0.28, 0.004, 0.28, 'U');
      if (!low) { F(fx, AL, x + 0.5, y0 + 0.82, zk + 0.17, 0.025, 0.28, 0.025, 'NSEW'); F(fx, AL, x + 0.36, y0 + 1.08, zk + 0.17, 0.165, 0.025, 0.025, 'NSUDW'); }   // tap
    };
    bench(xb - 1.2, zmid - 1.2, 2.4, y + 0.17, true);
    const lz = (depth - 1.9) / 2, rows = Math.max(1, Math.floor((len - 4.4) / 1.5) + 1), ns = Math.max(1, Math.floor((lz - 0.5) / 0.6));
    for (let i = 0; i < rows; i++) for (const s of [-1, 1]) {
      const x = xb - 3.2 - i * 1.5, z0 = s < 0 ? zmid - 0.45 - lz : zmid + 0.45;
      bench(x, z0, lz, y + 0.02, s < 0);
      for (let j = 0; j < ns; j++) {
        const sz = s < 0 ? z0 + 0.3 + j * 0.6 : z0 + lz - 0.3 - j * 0.6;
        fu.cyl(lm('stool'), x - 0.3, y + 0.45, sz, 0.15, 0.03, 8); fu.cyl(AL, x - 0.3, y + 0.02, sz, 0.025, 0.43, 5, false);
      }
    }
    const cz = Math.floor((depth - 2.6) / 0.9) * 0.9;                              // cabinet on the back wall
    F(fu, lm('lockerBody'), xa, y + 0.02, zi + 1.2, 0.45, 1.9, cz, 'ENSU'); for (let i = 1; i < cz / 0.9 - 0.01; i++) F(fu, DK, xa + 0.448, y + 0.06, zi + 1.2 + i * 0.9 - 0.004, 0.004, 1.84, 0.008, 'E');
    for (const t of low ? [0.5] : [0.27, 0.73]) fan(xa + len * t, zmid, cy);
    for (const t of [0.25, 0.75]) for (const d of [-0.25, 0.25]) light(xa + len * t, zmid + d * depth, cy);
  }

  function prep(r, y, k) {                                                         // preparation room: shelving, closed cabinets, a table, a sink unit
    const xa = r.a + 0.1, xb = r.b - 0.1, len = xb - xa, cy = ceilOf(k), zi = r.zi, depth = zw - zi, zmid = (zi + zw) / 2, LB = lm('lockerBody'), xm = (xa + xb) / 2;
    shellOf(r, y, k);
    const sl = depth - (r.niche ? 2.2 : 1.6);                                      // open shelving on the east wall
    for (const zz of [zi + 0.6, zi + 0.6 + sl - 0.03]) F(fu, LB, xb - 0.4, y + 0.02, zz, 0.4, 1.9, 0.03, 'NSWU');
    for (let i = 0; i < 5; i++) { F(fu, LB, xb - 0.4, y + 0.12 + i * 0.44, zi + 0.63, 0.4, 0.03, sl - 0.06, 'UDW'); if (!low && i < 4) for (let j = 0; j < 3; j++) F(fu, lm(['sheetA', 'sheetC', 'binGrey'][(i + j) % 3]), xb - 0.34, y + 0.15 + i * 0.44, zi + 0.8 + j * (sl - 0.9) / 2.2, 0.26, 0.2 + 0.06 * ((i + j) % 2), 0.4, 'NSWU'); }
    const cz = Math.floor((depth - 2.4) / 0.9) * 0.9;                              // closed cabinets on the west wall
    F(fu, LB, xa, y + 0.02, zi + 0.7, 0.45, 1.9, cz, 'ENSU'); for (let i = 1; i < cz / 0.9 - 0.01; i++) F(fu, DK, xa + 0.448, y + 0.06, zi + 0.7 + i * 0.9 - 0.004, 0.004, 1.84, 0.008, 'E');
    F(fu, lm('deskTop'), xm - 0.45, y + 0.74, zmid - 0.9, 0.9, 0.03, 1.8, 'NSEWUD');                                            // table
    for (const dx of [-0.4, 0.37]) for (const d of [-0.85, 0.82]) F(fu, lm('deskSteel'), xm + dx, y + 0.02, zmid + d, 0.03, 0.72, 0.03, 'NSEW');
    F(fu, SB, xm - 0.6, y + 0.02, zi + 0.02, 1.2, 0.85, 0.55, 'SEWU'); F(fu, DK, xm - 0.45, y + 0.872, zi + 0.12, 0.5, 0.004, 0.36, 'U');   // sink unit under the window
    fan(xm, zmid, cy); for (const d of [-0.25, 0.25]) light(xm, zmid + d * depth, cy, 1.0);
  }

  const ROOM = { class: classroom, office, lab, prep };
  for (let k = 0; k < FLOORS; k++) for (const r of rooms) { ROOM[kindOf(r, k)](r, k * FH, k); for (const [xd, side] of doorsOf(r)) leaf(xd, side, k * FH); }

  // ---- stair flights: steps with nosings, soffit slabs, stringers, balusters, handrails ----
  const TR = lm('tread'), NO = lm('nosing');
  for (let k = 0; k < FLOORS - 1; k++) {
    const y = k * FH, ym = y + FH / 2, y1 = y + FH;
    for (let i = 0; i < STEPS; i++) {
      F(fu, TR, xa1, y + i * RISE, zl - (i + 1) * GO, FLIGHT, RISE, GO, 'USW'); F(fu, TR, xs0, ym + i * RISE, zh + i * GO, FLIGHT, RISE, GO, 'UNE');
      F(fu, NO, xa1, y + (i + 1) * RISE - 0.008, zl - i * GO - 0.04, FLIGHT, 0.012, 0.055, 'US'); F(fu, NO, xs0, ym + (i + 1) * RISE - 0.008, zh + i * GO - 0.015, FLIGHT, 0.012, 0.055, 'UN');
      if (!low || i % 2 === 0) {
        F(fu, RAIL, xa1 - 0.03, y + (i + 0.5) * RISE + 0.2, zl - (i + 0.5) * GO - 0.01, 0.02, RISE + 0.66, 0.02, 'NSEW');
        F(fu, RAIL, xb1 + 0.01, ym + (i + 0.5) * RISE + 0.2, zh + (i + 0.5) * GO - 0.01, 0.02, RISE + 0.66, 0.02, 'NSEW');
      }
    }
    for (const [xa, xb, zA, yA, zB, yB, well, wall] of [[xa1, xa2, zl, y, zh, ym, [xa1 - 0.035, xa1], [xa2 - 0.1, xa2 - 0.06]], [xs0, xb1, zh, ym, zl, y1, [xb1, xb1 + 0.035], [xs0 + 0.06, xs0 + 0.1]]]) {
      incl(fu, PL, xa, xb, zA, yA, zB, yB, 0.14, 'DEW');                                                                         // soffit slab
      incl(fu, WH, well[0], well[1], zA, yA + 0.23, zB, yB + 0.23, 0.37, 'EWUDNS');                                              // stringer on the well side
      incl(fu, RAIL, well[0] - 0.008, well[1] + 0.008, zA, yA + RISE + 0.9, zB, yB + RISE + 0.9, 0.05, 'EWUDNS');                // handrail on the balusters
      incl(fu, RAIL, wall[0], wall[1], zA, yA + RISE + 0.9, zB, yB + RISE + 0.9, 0.04, 'EWUDNS');                                // handrail on the wall
      incl(fu, DA, xa === xa1 ? xa2 - 0.008 : xs0, xa === xa1 ? xa2 : xs0 + 0.008, zA, yA + 0.3, zB, yB + 0.3, 0.3, xa === xa1 ? 'W' : 'E');   // painted skirting
    }
    F(fu, RAIL, xb1 - 0.01, ym + RISE + 0.85, zh - 0.05, 0.22, 0.05, 0.05, 'NSUDEW');                                            // rail turning round the well at the half landing
    F(fu, RAIL, xb1 - 0.01, y1 + RISE + 0.85, zl, 0.22, 0.05, 0.05, 'NSUDEW'); for (const xx of [xb1 + 0.005, xa1 - 0.03]) F(fu, RAIL, xx, y1, zl + 0.012, 0.024, 1.0, 0.024, 'NSEW');
    if (k === 0) F(fu, RAIL, xa1 - 0.04, 0, zl, 0.045, 1.1, 0.045, 'NSEWU');                                                     // newel post at the foot
    F(fu, LAMP, (xs0 + xa2) / 2 - 0.18, ym - 0.21, (zsn + zh) / 2 - 0.18, 0.36, 0.06, 0.36, 'NSEWD');                            // lamp under the half landing
  }
  F(fu, RAIL, xb1, yT4 + 1.07, zl - 0.085, xa2 - xb1, 0.04, 0.05, 'NSUD');                                                       // rail on the top-floor guard

  // ================= assemble =================
  ctx.add(mergeFlat(v.build({ name: item.id + '-visual' }), true));
  const cx = p.ox + L / 2, cz = p.oz + p.D / 2;
  ctx.detail(ctx.add(mergeFlat(ex.build({ name: item.id + '-fittings', castShadow: false }), false)), cx, cz, L / 2 + (low ? 70 : 100));
  const fuG = mergeFlat(fu.build({ name: item.id + '-interior', castShadow: false }), false), fxG = mergeFlat(fx.build({ name: item.id + '-fine', castShadow: false }), false);
  const M = new THREE.Matrix4();
  if (desks.length) for (const part of deskSet(low)) {                             // one instanced mesh per material of the desk set
    const im = new THREE.InstancedMesh(part.geometry, part.material, desks.length); im.name = item.id + '-desks'; im.receiveShadow = true;
    desks.forEach((q, i) => im.setMatrixAt(i, M.makeTranslation(p.ox + q[0], q[1], p.oz + q[2])));
    im.computeBoundingSphere(); fuG.add(im);
  }
  if (books.length) {                                                              // closed books lying on the desks: plain covers, no titles
    const im = new THREE.InstancedMesh(new THREE.BoxGeometry(0.18, 0.02, 0.25), lm('book'), books.length), col = new THREE.Color(), q = new THREE.Quaternion(), up = new THREE.Vector3(0, 1, 0), one = new THREE.Vector3(1, 1, 1);
    const covers = [0x2f5f9e, 0xb8322a, 0x3d8a55, 0xd9a520, 0xe9e2cf, 0x6b4e8a, 0x2a8a96];
    books.forEach((b, i) => {
      im.setMatrixAt(i, M.compose(new THREE.Vector3(p.ox + b[0], b[1] + 0.011, p.oz + b[2]), q.setFromAxisAngle(up, (b[3] - 0.5) * (b[4] ? 1.2 : 0.5)), one));
      im.setColorAt(i, col.setHex(covers[Math.floor(b[3] * 977) % covers.length]));
    });
    im.name = item.id + '-books'; im.computeBoundingSphere(); fxG.add(im);
  }
  ctx.detail(ctx.add(fuG), cx, cz, L / 2 + (low ? 34 : 44));
  ctx.detail(ctx.add(fxG), cx, cz, L / 2 + (low ? 14 : 20));
  const cg = ctx.add(c.build({ name: item.id + '-colliders' })); cg.visible = false;

  // stair ramps (collision only): one inclined plate per flight, so the capsule walks up smoothly
  const ramps = new THREE.Group(); ramps.position.set(p.ox, 0, p.oz); ramps.visible = false; ctx.add(ramps);
  const rlen = Math.hypot(run, FH / 2), rang = Math.atan2(FH / 2, run);
  for (let k = 0; k < FLOORS - 1; k++) for (const flight of ['A', 'B']) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(FLIGHT, 0.2, rlen));
    m.position.set(flight === 'A' ? xa1 + FLIGHT / 2 : xs0 + FLIGHT / 2, k * FH + (flight === 'A' ? FH / 4 : FH * 3 / 4) - 0.1 * Math.cos(rang), zl - run / 2);
    m.rotation.x = flight === 'A' ? rang : -rang;        // a positive turn about +X lowers the south end: A rises toward north, B toward south
    ramps.add(m);
  }
  cg.traverse(o => { if (o.isMesh) ctx.collide(o); });
  ramps.children.forEach(m => ctx.collide(m));
}
