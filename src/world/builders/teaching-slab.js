// Five-storey teaching slab (the east pair: slab-north and slab-south), inside and out.
//
// SEEN in the 2018 drone footage (frames 5-8, north faces and roofs only; read from 360p frames, so sizes are by proportion):
//   - white grid of piers and floor bands; under every window row a dark-red spandrel about 1 m high; window strips about
//     2.3 m high with a transom near the top and 5-6 mullions per bay; a white band about 0.6 m between the storeys;
//   - top row: two separate, squarer openings per bay with a white pier between them and a tall white fascia above;
//   - ground level darker than the rest (modelled as a recessed dark base with tinted glass);
//   - east part: six bays between a wide white end pier and a full-height vertical break; west of the break a narrow window
//     column and three tighter bays;
//   - roof: dark membrane, white parapets, pale box units joined by duct runs, a pale-red band and a red pipe along the tall
//     south parapet; on the western part the north parapet is a wider white box about 1 m higher (its east end is visible);
//     a small flat-roofed white pavilion near the west end (frame 8, south slab; repeated on the north slab);
//   - the satellite outline puts the break 18.7 m (north slab) and 19.5 m (south slab) from the west end; that is used.
// NOT RESOLVED: the satellite roof edge of the western part lies about 2.8 m further south than the eastern part. A 1 m
//   higher parapet explains about a quarter of that; whether the rest is a set-back of the facade could not be decided from
//   the frames, so both parts are built in one plane with a joint between them.
//
// ASSUMED (no reference shows any of it; kept plain, typical of Guangdong school buildings, and without any lettering):
//   - the whole south side: open corridor with columns, edge beams, solid balustrade with a dark-red band and a steel rail,
//     rainwater pipes, ceiling lights, air-conditioner outdoor units above the corridor windows;
//   - the plan: a staircase in the west bay with windows at its half landings, one classroom and a teachers' office in the
//     western part, three classrooms in the eastern part, a water-dispenser niche in the east end pier, two closed doors
//     (toilets, not enterable, nothing behind them) in the east end wall of the corridor;
//   - every interior: floor, dado and wall finishes, platform, blackboard (blank), console, projector, screen, clock, fans,
//     lights, curtains, air-conditioners, lockers, pin boards (blank), broom corner, desks, chairs and books, doors with
//     glass panels and closers, blank class plates and blank floor plates, bins, hose cabinet, stair flights, stringers,
//     nosings and handrails; classrooms face east so that daylight from the north windows falls from the pupils' left;
//   - the use of the block at the south-west corner (plain, closed) and of the roof pavilion.
// Furniture has no collision. Everything small sits behind ctx.detail in three tiers (corridor/facade fittings, interiors,
// fine objects); ctx.lowPower thins it out.
import { THREE, mat, bbox } from '../../kit.js';
import { Batch } from '../../batch.js';

const FH = 3.9, FLOORS = 5, INSET = 0.3, WALL = 0.24, CORRIDOR = 2.6, X0 = 4.6, RISE = 0.15, GO = 0.28, STEPS = 13;
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
  const r = rng(9);
  for (let y = 0; y < 2; y++) for (let x = 0; x < 2; x++) { g.fillStyle = rgb(c, 0.96 + r() * 0.07); g.fillRect(x * 64, y * 64, 64, 64); }
  g.strokeStyle = rgb(c, 0.78); g.lineWidth = 1.5;
  for (let i = 0; i <= 2; i++) { g.beginPath(); g.moveTo(i * 64, 0); g.lineTo(i * 64, S); g.moveTo(0, i * 64); g.lineTo(S, i * 64); g.stroke(); }
}, metres);
const drapeTex = () => canvasTex(64, 8, (g, W, H) => {                     // vertical pleats
  for (let x = 0; x < W; x++) { g.fillStyle = rgb([156, 184, 206], 0.84 + 0.16 * Math.abs(Math.sin(x / W * Math.PI * 4))); g.fillRect(x, 0, 1, H); }
}, 0.42, 1);
const lockerTex = () => canvasTex(64, 64, (g, S) => {                      // one 0.4 m locker door: outline, three vent slits, a pull
  g.fillStyle = '#93a8b8'; g.fillRect(0, 0, S, S); g.strokeStyle = '#5e7181'; g.lineWidth = 3; g.strokeRect(1.5, 1.5, S - 3, S - 3);
  g.fillStyle = '#5e7181'; for (let i = 0; i < 3; i++) g.fillRect(18, 12 + i * 6, 28, 2);
  g.fillStyle = '#e8e8e4'; g.fillRect(50, 30, 5, 8);
}, 0.4);
const boardTex = () => canvasTex(256, 64, (g, W, H) => {                   // blank blackboard with faint wiping marks
  const r = rng(77); g.fillStyle = '#23483a'; g.fillRect(0, 0, W, H);
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
    dado: () => S(0xb7d2c1, 0.8), corr: () => S(0xeadfc4, 0.9), base: () => S(0x4d5154, 0.85), dark: () => S(0x24272a, 0.7),
    glassTint: () => S(0x1c2a30, 0.06, 0.35, { transparent: true, opacity: 0.66, depthWrite: false }),      // ground level
    glassN: () => S(0x2f3d44, 0.06, 0.35, { transparent: true, opacity: 0.5, depthWrite: false }),            // north strips: read dark from outside, as in the footage
    terrazzo: () => T(speckleTex([178, 177, 166], 2.4), 0.85), ctile: () => T(tileTex([216, 204, 180], 1.2), 0.8), cborder: () => S(0x8d5f4d, 0.6),
    roof: () => T(speckleTex([84, 86, 87], 6, 0.72, 0.5), 0.95), pink: () => S(0xb89490, 0.9),
    board: () => T(boardTex(), 0.9), cork: () => T(speckleTex([176, 141, 87], 1.0), 0.95), alu: () => S(0xc4c8cc, 0.45, 0.35),
    lamp: () => S(0xffffff, 0.6, 0, { emissive: 0xfff4d8, emissiveIntensity: 0.9 }),
    drape: () => T(drapeTex(), 0.95), locker: () => T(lockerTex(), 0.6), lockerBody: () => S(0x8ea2b2, 0.6),
    platform: () => S(0x9b8f7e, 0.8), deskTop: () => S(0xdcc091, 0.65), deskSteel: () => S(0x5f7184, 0.5, 0.2), seat: () => S(0xc99a5f, 0.7),
    white: () => S(0xf3f2ee, 0.6), binGrey: () => S(0x6b7377, 0.7), binGreen: () => S(0x3d8a55, 0.7), red: () => S(0xb8322a, 0.6),
    straw: () => S(0xc4a55c, 0.9), plate: () => S(0x2f5f9e, 0.5), plateRed: () => S(0xb5564f, 0.5),
    door: () => S(0xb98452, 0.6), doorFrame: () => S(0x6f4b31, 0.6),
    tread: () => T(speckleTex([172, 168, 158], 1.6), 0.7), nosing: () => S(0x3b3b3b, 0.8), rail: () => S(0x35506e, 0.5, 0.2),
    pvc: () => S(0xe4e2da, 0.7), fan: () => S(0xe9e7e0, 0.6), steelBox: () => S(0xb9bec2, 0.4, 0.5),
    sheetA: () => S(0xf4f1e6, 0.9), sheetB: () => S(0xf3e3a4, 0.9), sheetC: () => S(0xbfd9ee, 0.9), book: () => S(0xffffff, 0.85),
  };
  const m = make[name](); m.name = 'ts-' + name;      // named, so the lighting module does not take smooth ones for window glass
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
  if (!flatMat) { flatMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.78, metalness: 0.03 }); flatMat.name = 'ts-flat'; }
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
  const bar = item.mainBar || (b => ({ w: b.w, e: b.e, n: b.n, s: b.s }))(bbox(item.points));
  const L = bar.e - bar.w, D = bar.s - bar.n, roofY = FLOORS * FH, yTop = roofY - 0.3, low = !!ctx.lowPower;
  const zN = INSET, zi = zN + WALL, zS = D - INSET, zc = zS - CORRIDOR, zw = zc - 0.2, zmid = (zi + zw) / 2, depth = zw - zi;
  const xW = INSET + WALL, xEnd = L - INSET - WALL, x0 = X0;                 // inner faces of the end walls; east side of the stair bay
  // the vertical break: where the north edge of the measured roof outline steps
  const stepPts = item.points.map(p => [p[0] - bar.w, p[1]]).filter(p => p[1] < bar.n + 2.5 && p[0] > 8 && p[0] < L - 8);
  const xB = stepPts.length ? stepPts[0][0] : Math.round(L * 3.9) / 10, xE = L - INSET - 1.6;
  const bw = Math.min(4.1, (xB - x0 - 1.8) / 3), be = (xE - xB) / 6;
  const bays = [];
  for (let i = 0; i < 3; i++) bays.push({ a: x0 + i * bw, b: x0 + (i + 1) * bw, west: true });
  bays.push({ a: x0 + 3 * bw, b: xB, west: true, narrow: true });
  for (let i = 0; i < 6; i++) bays.push({ a: xB + i * be, b: xB + (i + 1) * be });
  const rooms = [{ a: x0, b: x0 + 2 * bw, kind: 'class' }, { a: x0 + 2 * bw, b: xB, kind: 'office' }];
  for (let i = 0; i < 3; i++) rooms.push({ a: xB + 2 * i * be, b: xB + 2 * (i + 1) * be, kind: 'class' });
  const ceilOf = k => (k === FLOORS - 1 ? yTop : (k + 1) * FH - 0.15);
  // staircase (west bay): two flights per storey round a narrow well; zl = north edge of the floor landing, zh = south edge of the half landing
  const sx0 = xW, sw = (x0 - 0.1 - sx0 - 0.2) / 2, run = STEPS * GO, zl = zc - 1.3, zh = zl - run, xb1 = sx0 + sw, xa1 = xb1 + 0.2, xa2 = xa1 + sw;
  // block at the south-west corner of the measured outline
  const southPts = item.points.filter(p => p[1] > bar.s + 1), annex = southPts.length >= 2 ? bbox(southPts) : null;
  const ax = annex ? annex.w - bar.w : 0, aw = annex ? annex.sx : 0, ad = annex ? annex.s - bar.s + INSET : 0;

  const v = new Batch(), c = new Batch(), ex = new Batch(), fu = new Batch(), fx = new Batch();   // shell, colliders, corridor/facade fittings, interiors, fine objects
  const home = b => b.frame(bar.w, bar.n); [v, c, ex, fu, fx].forEach(home);
  const F = (b, m, x, y, z, sx, sy, sz, faces) => b.slab(m, x, y, z, sx, sy, sz, skipOf(faces));   // box drawing only the listed faces
  const hit = (x, y, z, sx, sy, sz) => c.slab('generic', x, y, z, sx, sy, sz);
  const W = 'wallWhite', R = 'wallMaroon', GL = 'glassClear', MW = 'metalWhite';
  const PL = lm('plaster'), CE = lm('ceil'), DA = lm('dado'), CO = lm('corr'), DK = lm('dark'), AL = lm('alu'), WH = lm('white'), LAMP = lm('lamp'), RAIL = lm('rail');
  // inclined slab whose TOP surface runs from (zA, yA) to (zB, yB), between xa and xb
  const incl = (b, m, xa, xb, zA, yA, zB, yB, th, faces) => {
    const [zn, yn, zs, ys] = zA < zB ? [zA, yA, zB, yB] : [zB, yB, zA, yA], len = Math.hypot(zs - zn, ys - yn), ang = Math.atan2(yn - ys, zs - zn);
    b.setMatrix(new THREE.Matrix4().makeRotationX(ang).setPosition(bar.w + (xa + xb) / 2, (yn + ys) / 2 - Math.cos(ang) * th / 2, bar.n + (zn + zs) / 2 - Math.sin(ang) * th / 2));
    b.box(m, 0, 0, 0, xb - xa, th, len, skipOf(faces)); home(b);
  };
  const stick = (b, m, p, q, t) => { b.strut(m, [bar.w + p[0], p[1], bar.n + p[2]], [bar.w + q[0], q[1], bar.n + q[2]], t); home(b); };

  // ================= SHELL (always drawn) and colliders =================
  // ---- north face ----
  const pier = (xa, xb) => { F(v, W, xa, 0, zN - 0.06, xb - xa, yTop, WALL + 0.06, 'NEW'); F(v, PL, xa, 0, zN, xb - xa, yTop, WALL + 0.004, 'S'); hit(xa, 0, zN, xb - xa, yTop, WALL); };
  for (let i = 0; i <= 3; i++) pier(x0 + i * bw - 0.25, x0 + i * bw + 0.25);
  pier(xB - 0.38, xB - 0.04); pier(xB + 0.04, xB + 0.38); F(v, DK, xB - 0.04, 0, zN + 0.04, 0.08, yTop, 0.1, 'N'); hit(xB - 0.04, 0, zN, 0.08, yTop, WALL);   // joint
  for (let i = 1; i < 6; i++) pier(xB + i * be - 0.25, xB + i * be + 0.25);
  pier(xE - 0.25, L - INSET);                                                   // wide white end pier
  const bars = (b, xa, w, y0, h, yT, n) => {                                    // window frame: one transom and n mullions
    F(b, MW, xa, yT - 0.03, zN + 0.07, w, 0.06, 0.08, 'NSUD');
    for (let i = 1; i <= n; i++) F(b, MW, xa + w * i / (n + 1) - 0.025, y0, zN + 0.07, 0.05, h, 0.08, 'NSEW');
  };
  const wx = x0 + 0.25, wlen = xE - 0.25 - wx;
  for (let k = 0; k < FLOORS; k++) {
    const y = k * FH, ground = k === 0, top = k === FLOORS - 1, head = top ? 2.9 : 3.3, by = y + head, bh = (top ? yTop : y + FH) - by;
    if (ground) F(v, lm('base'), wx, y, zN + 0.1, wlen, 0.95, WALL - 0.1, 'N'); else F(v, R, wx, y, zN, wlen, 0.95, WALL, 'N');      // spandrel
    F(v, DA, wx, y, zN, wlen, 0.95, WALL, 'S'); F(v, W, wx, y, zN, wlen, 0.95, WALL, 'U'); hit(wx, y, zN, wlen, 0.95, WALL);
    F(v, W, wx, by, zN - 0.05, wlen, bh, WALL + 0.05, 'ND'); F(v, PL, wx, by, zN, wlen, bh, WALL, 'S'); hit(wx, by, zN, wlen, bh, WALL);   // white band
    F(v, lm(ground ? 'glassTint' : 'glassN'), wx, y + 0.95, zN + 0.1, wlen, head - 0.95, 0.02, 'NS'); hit(wx, y + 0.95, zN + 0.08, wlen, head - 0.95, 0.08);
    for (const b of bays) {
      const wa = b.a + 0.25, ww = b.b - b.a - 0.5;
      if (top) {                                                                // two squarer openings per bay
        const n = b.narrow ? 1 : 2, pw = b.west ? 0.4 : 0.5, ow = (ww - (n - 1) * pw) / n;
        if (n === 2) { F(v, W, wa + ow, y + 0.95, zN - 0.05, pw, head - 0.95, WALL + 0.05, 'NEW'); F(v, PL, wa + ow, y + 0.95, zN, pw, head - 0.95, WALL, 'S'); }
        for (let i = 0; i < n; i++) bars(v, wa + i * (ow + pw), ow, y + 0.95, head - 0.95, y + 2.3, ow > 1.7 ? 2 : 1);
      } else bars(v, wa, ww, y + 0.95, head - 0.95, y + 2.55, Math.max(1, Math.round(ww / 0.7) - 1));
    }
  }
  // stair bay: solid wall with a pair of narrow windows at every half landing
  const swa = (xW + x0 - 0.25) / 2 - 1.05, swb = swa + 2.1;
  F(v, W, xW, 0, zN, swa - xW, yTop, WALL, 'NE'); F(v, PL, xW, 0, zN, swa - xW, yTop, WALL, 'S');
  F(v, W, swb, 0, zN, x0 - 0.25 - swb, yTop, WALL, 'NW'); F(v, PL, swb, 0, zN, x0 - 0.25 - swb, yTop, WALL, 'S');
  hit(xW, 0, zN, x0 - 0.25 - xW, yTop, WALL);
  for (let k = 0, yy = 0; k < FLOORS; k++) {
    const ya = k < FLOORS - 1 ? k * FH + FH / 2 + 0.95 : yTop;
    F(v, W, swa, yy, zN, 2.1, ya - yy, WALL, 'NUD'); F(v, PL, swa, yy, zN, 2.1, ya - yy, WALL, 'S');
    if (k < FLOORS - 1) {
      F(v, GL, swa, ya, zN + 0.1, 2.1, 1.5, 0.02, 'NS'); F(v, W, swa + 0.9, ya, zN, 0.3, 1.5, WALL, 'NEW'); F(v, PL, swa + 0.9, ya, zN, 0.3, 1.5, WALL, 'S');
      for (const xx of [swa, swa + 1.2]) F(v, MW, xx, ya + 0.95, zN + 0.07, 0.9, 0.05, 0.08, 'NSUD');
    }
    yy = ya + 1.5;
  }
  // ---- end walls ----
  F(v, W, INSET, 0, zN, WALL, yTop, zS - zN, 'WNS'); F(v, PL, INSET, 0, zN, WALL, yTop, zS - zN, 'E'); hit(INSET, 0, zN, WALL, yTop, zS - zN);
  F(v, W, xEnd, 0, zN, WALL, yTop, zS - zN, 'ENS'); F(v, CO, xEnd, 0, zN, WALL, yTop, zS - zN, 'W'); hit(xEnd, 0, zN, WALL, yTop, zS - zN);
  F(v, R, L - INSET, 0.2, zN + 1.0, 0.03, yTop - 0.6, 1.2, 'ENS');
  // ---- partitions between the rooms (full height) ----
  for (const xp of [x0, ...rooms.map(r => r.b)]) { F(v, PL, xp - 0.1, 0, zi, 0.2, yTop, zw - zi, 'EW'); hit(xp - 0.1, 0, zi, 0.2, yTop, zw - zi); }
  // ---- south side: columns, edge beams, balustrades ----
  const cols = [xW + 0.2, x0, x0 + bw, x0 + 2 * bw, x0 + 3 * bw, xB, ...[1, 2, 3, 4, 5].map(i => xB + i * be), xEnd - 0.2];
  for (const x of cols) { F(v, W, x - 0.2, 0, zS - 0.4, 0.4, yTop, 0.4, 'NSEW'); hit(x - 0.2, 0, zS - 0.4, 0.4, yTop, 0.4); }
  const bx = annex ? Math.max(xW, ax + aw) : xW, blen = xEnd - bx;                 // the balustrade starts east of the corner block
  for (let k = 1; k <= FLOORS; k++) {
    const y = k * FH, roofLevel = k === FLOORS;
    F(v, W, INSET, y - 0.65, zS - 0.25, L - 2 * INSET, roofLevel ? 0.35 : 0.65, 0.27, 'NSD');                                   // edge beam
    if (roofLevel) break;
    F(v, W, bx, y, zS - 0.12, blen, 0.9, 0.12, 'NSU'); F(v, R, bx, y + 0.2, zS, blen, 0.45, 0.012, 'S'); hit(xW, y, zS - 0.12, xEnd - xW, 1.7, 0.12);   // collider taller than the visible 0.9 m balustrade: a jump cleared 1.1 m
  }
  // ---- floors, ceilings and the wall between classrooms and corridor ----
  const doorsOf = r => (r.kind === 'office' ? [[r.a + 0.6, 'W']] : [[r.a + 0.6, 'W'], [r.b - 1.6, 'E']]);   // [west jamb, hinge side]
  const winsOf = r => { const a = r.a + 2.1, b = r.kind === 'office' ? r.b - 1.0 : r.b - 2.1, m = (a + b) / 2; return b - a < 3.4 ? [[a, b]] : [[a, m - 0.7], [m + 0.7, b]]; };
  const ops = [];
  for (const r of rooms) { for (const [xd] of doorsOf(r)) ops.push([xd, xd + 1.0, 'door']); for (const [a, b] of winsOf(r)) ops.push([a, b, 'win']); }
  ops.push([xE + 0.15, xEnd, 'niche']); ops.sort((p, q) => p[0] - q[0]);
  const seg = (xa, xb, y0, h, faces) => {                                          // piece of the corridor wall: plaster inside, cream outside
    if (faces.includes('N')) F(v, PL, xa, y0, zw, xb - xa, h, 0.2, 'N');
    F(v, CO, xa, y0, zw, xb - xa, h, 0.2, faces.replace('N', '')); hit(xa, y0, zw, xb - xa, h, 0.2);
  };
  const TZ = lm('terrazzo'), CT = lm('ctile'), CB = lm('cborder'), cw = zS - 0.12 - zc;
  for (let k = 0; k < FLOORS; k++) {
    const y = k * FH;
    if (k > 0) {
      F(v, CE, x0, y - 0.15, zN, L - INSET - x0, 0.15, zS - zN, 'D'); hit(x0, y - 0.15, zN, L - INSET - x0, 0.15, zS - zN);
      F(v, CE, INSET, y - 0.15, zl, x0 - INSET, 0.15, zS - zl, 'D'); hit(INSET, y - 0.15, zl, x0 - INSET, 0.15, zS - zl);
    }
    F(v, TZ, x0 - 0.1, y, zi, xEnd - x0 + 0.1, 0.02, zc - zi, 'U');                                                            // classroom floor
    F(v, CT, xW, y, zc + 0.18, xEnd - xW, 0.02, cw - 0.36, 'U');                                                               // corridor: tiles with a border
    F(v, CB, xW, y, zc, xEnd - xW, 0.02, 0.18, 'U'); F(v, CB, xW, y, zc + cw - 0.18, xEnd - xW, 0.02, 0.18, 'U');
    F(v, CT, xW, y, k ? zl : zi, x0 - 0.1 - xW, 0.02, zc - (k ? zl : zi), 'U');                                                // stair landing / stair hall floor
    let x = x0 - 0.1;
    for (const [a, b, t] of ops) {
      seg(x, a, y, 2.6, 'NSEW');
      if (t === 'win') { seg(a, b, y, 1.3, 'NSU'); F(v, GL, a, y + 1.3, zw + 0.09, b - a, 1.3, 0.02, 'NS'); hit(a, y + 1.3, zw + 0.06, b - a, 1.3, 0.08); }
      else seg(a, b, y + 2.1, 0.5, 'NSD');
      x = b;
    }
    seg(x0 - 0.1, xEnd, y + 2.6, 1.15, 'NSD');
    // water niche in the east end pier: back wall and ceiling
    F(v, CO, xE + 0.1, y, zw - 0.66, xEnd - xE - 0.1, 2.1, 0.06, 'S'); F(v, CO, xE + 0.1, y + 2.1, zw - 0.6, xEnd - xE - 0.1, 0.05, 0.6, 'D'); hit(xE + 0.1, y, zw - 0.7, xEnd - xE - 0.1, 3.75, 0.1);
  }
  // ---- staircase: landings, guard, colliders (the visible flights are interior detail) ----
  hit(xb1, 0, zh, 0.2, yTop, run);                                                 // well between the flights: closed for the player
  for (let k = 0; k < FLOORS; k++) {
    const ym = k * FH + FH / 2;
    hit(sx0, ym - 0.15, zi, 2 * sw + 0.2, 0.15, zh - zi);
    if (k < FLOORS - 1) { F(v, CT, sx0, ym - 0.15, zi, 2 * sw + 0.2, 0.15, zh - zi, 'U'); F(v, CE, sx0, ym - 0.15, zi, 2 * sw + 0.2, 0.15, zh - zi, 'DS'); }
  }
  const yT4 = (FLOORS - 1) * FH;                                                   // top floor: guard over the void above the last flight A
  F(v, W, xb1, yT4, zl - 0.1, sw + 0.2, 1.05, 0.1, 'NSUW'); hit(xb1, yT4, zl - 0.1, sw + 0.2, 1.7, 0.1);
  // ---- roof ----
  F(v, lm('roof'), 0, yTop, 0, L, 0.3, D, 'U'); F(v, W, 0, yTop, 0, L, 0.3, D, 'NSEW'); F(v, CE, 0, yTop, 0, L, 0.3, D, 'D'); hit(0, yTop, 0, L, 0.3, D);
  const parapet = (x, z, sx, sz, h) => { F(v, W, x, roofY, z, sx, h, sz, 'NSEWU'); hit(x, roofY, z, sx, h, sz); };
  parapet(xB, 0, L - xB, 0.2, 1.2); parapet(0, 0, xB, 1.2, 2.25);                  // north: plain in the east, a wider and higher box on the western part
  parapet(0, D - 0.2, L, 0.2, 1.6); parapet(0, 1.2, 0.2, D - 1.4, 1.2); parapet(L - 0.2, 0.2, 0.2, D - 0.4, 1.2);
  const RP = 'roofPale', zd = D * 0.56;
  [0.2, 0.33, 0.46, 0.6, 0.73, 0.86].forEach((f, i) => {                           // pale units, each with a branch to the long duct
    const x = f * L, z = D * (i % 2 ? 0.34 : 0.42);
    F(v, RP, x - 1.1, roofY + 0.12, z - 0.7, 2.2, 0.8, 1.4, 'NSEWU'); F(v, DK, x - 1.0, roofY, z - 0.6, 2.0, 0.12, 1.2, 'NSEW');
    F(v, RP, x - 0.25, roofY + 0.1, z + 0.7, 0.5, 0.36, zd - z - 0.7, 'EWU');
  });
  F(v, RP, L * 0.14, roofY + 0.08, zd, L * 0.76, 0.42, 0.6, 'NSEWU');
  for (const f of [0.22, 0.27]) F(v, DK, 2, roofY, D * f, L - 4, 0.06, 0.07, 'NSU');                                            // conduits
  F(v, lm('pink'), 1.5, roofY, D - 1.3, L - 3, 0.2, 0.8, 'NEWU');                                                               // pale-red band along the south parapet
  F(v, 'red', 1, roofY + 0.5, D - 0.34, L - 2.1, 0.1, 0.1, 'NUD'); F(v, 'red', L - 1.2, roofY, D - 0.34, 0.1, 1.55, 0.1, 'NEW');   // red pipe and its riser
  F(v, W, 0.5, roofY, D - 4.0, 3.9, 2.5, 3.2, 'NSEW'); hit(0.5, roofY, D - 4.0, 3.9, 2.5, 3.2);                                 // roof pavilion
  F(v, W, 0.25, roofY + 2.5, D - 4.3, 4.5, 0.15, 3.8, 'NSEWUD'); F(v, DK, 4.4, roofY, D - 2.9, 0.02, 2.0, 0.9, 'E');
  // ---- block at the south-west corner: plain and closed ----
  if (annex) {
    F(v, W, ax, 0, zS, aw, yTop, ad, 'ESW'); F(v, CO, ax, 0, zS, aw, yTop, ad, 'N'); F(v, W, ax, yTop, D, aw, 1.5, ad - INSET, 'NESWU');
    hit(ax, 0, zS, aw, roofY + 1.2, ad);
    for (let k = 0; k < FLOORS; k++) F(v, 'glassDark', ax + aw * 0.25, k * FH + 1.6, zS + ad - 0.01, aw * 0.5, 0.7, 0.03, 'S');
  }

  // ================= CORRIDOR AND FACADE FITTINGS (middle range) =================
  const PV = lm('pvc'), RED = lm('red'), DOOR = lm('door'), DFR = lm('doorFrame'), PLT = lm('plate'), SB = lm('steelBox');
  cols.forEach((x, i) => { if (i % 2 === 1 || i === cols.length - 1) ex.cyl(PV, x, 0, zS + 0.07, 0.055, yTop, 8, false); });      // rainwater pipes
  for (let k = 0; k < FLOORS; k++) {
    const y = k * FH, cy = ceilOf(k);
    if (k > 0) {                                                                   // coping and steel rail on the balustrade
      F(ex, W, bx, y + 0.9, zS - 0.16, blen, 0.04, 0.18, 'NSUD'); F(ex, RAIL, bx, y + 1.07, zS - 0.085, blen, 0.04, 0.05, 'NSUD');
      for (let x = bx + 0.6; x < xEnd - 0.3; x += low ? 2.4 : 1.2) F(ex, RAIL, x - 0.012, y + 0.94, zS - 0.072, 0.024, 0.13, 0.024, 'NSEW');
    }
    for (const x of cols.slice(1, -1)) F(ex, W, x - 0.12, cy - 0.4, zc, 0.24, 0.4, zS - 0.25 - zc, 'EWD');                       // beams across the corridor
    for (const b of bays) F(ex, LAMP, (b.a + b.b) / 2 - 0.18, cy - 0.06, zc + cw / 2 - 0.18, 0.36, 0.06, 0.36, 'NSEWD');         // ceiling lights
    F(ex, LAMP, (xW + x0) / 2 - 0.18, cy - 0.06, zc + cw / 2 - 0.18, 0.36, 0.06, 0.36, 'NSEWD');
    // dado on the corridor side, between the door openings
    let xs = x0 - 0.1;
    for (const [a, b, t] of ops) if (t !== 'win') { F(ex, DA, xs, y + 0.02, zc, a - xs, 0.95, 0.008, 'S'); F(fu, DA, Math.max(xs, x0 + 0.1), y + 0.02, zw - 0.008, a - Math.max(xs, x0 + 0.1), 0.95, 0.008, 'N'); xs = b; }
    for (const r of rooms) {
      const cls = r.kind === 'class';
      for (const [a, b] of winsOf(r)) {                                            // sliding-window frames
        for (const yy of [y + 1.3, y + 2.55]) F(ex, MW, a, yy, zw + 0.06, b - a, 0.05, 0.08, 'NSUD');
        for (const xx of [a, (a + b) / 2 - 0.025, b - 0.05]) F(ex, MW, xx, y + 1.35, zw + 0.06, 0.05, 1.2, 0.08, 'NSEW');
        const xm = (a + b) / 2;                                                    // air-conditioner: outdoor unit above the window
        if (cls || a === winsOf(r)[0][0]) {
          F(ex, WH, xm - 0.4, y + 2.75, zc, 0.8, 0.52, 0.3, 'SEWD'); F(ex, DK, xm - 0.3, y + 2.8, zc + 0.3, 0.42, 0.42, 0.006, 'S');
          for (const s of [-0.3, 0.27]) F(ex, AL, xm + s, y + 2.71, zc, 0.03, 0.04, 0.32, 'EWD');
          F(fu, WH, xm - 0.45, y + 2.76, zw - 0.21, 0.9, 0.29, 0.21, 'NEWUD'); F(fu, DK, xm - 0.4, y + 2.775, zw - 0.214, 0.8, 0.03, 0.006, 'N');   // indoor unit
        }
      }
      for (const [xd] of doorsOf(r)) {                                             // blank plates: one projecting above each door, one on the wall beside it
        F(ex, PLT, xd + 1.12, y + 2.22, zc, 0.02, 0.16, 0.36, 'EWSUD'); F(ex, WH, xd + 1.1, y + 1.5, zc, 0.2, 0.28, 0.012, 'SEWUD');
      }
      const wl = winsOf(r);
      if (wl.length === 2) {                                                       // blank pin board between the two windows
        const xm = (wl[0][1] + wl[1][0]) / 2;
        F(ex, lm('cork'), xm - 0.55, y + 1.15, zc, 1.1, 1.0, 0.02, 'S'); F(ex, AL, xm - 0.59, y + 1.11, zc, 1.18, 1.08, 0.014, 'SEWUD');
        if (!low) [['sheetA', -0.4, 0.55], ['sheetB', -0.05, 0.5], ['sheetC', 0.2, 0.12], ['sheetA', -0.35, 0.1]].forEach(([m, dx, dy]) => F(fx, lm(m), xm + dx, y + 1.2 + dy, zc + 0.02, 0.21, 0.3, 0.004, 'S'));
      }
    }
    // bins, hose cabinet with two extinguishers, water dispensers in the niche, closed toilet doors at the east end
    for (const xp of [x0 + 2 * bw, xB + 2 * be]) [['binGrey', -0.27], ['binGreen', 0.27]].forEach(([m, dx]) => { ex.cyl(lm(m), xp + dx, y + 0.02, zc + 0.26, 0.2, 0.6, 10); ex.cyl(DK, xp + dx, y + 0.62, zc + 0.26, 0.21, 0.03, 10); });
    F(ex, RED, xB - 0.2, y + 0.85, zc, 0.7, 0.95, 0.07, 'SEWUD'); F(ex, WH, xB - 0.14, y + 0.91, zc + 0.07, 0.58, 0.83, 0.004, 'S');
    for (const dx of [-0.42, -0.6]) { ex.cyl(RED, xB + dx, y + 0.02, zc + 0.11, 0.07, 0.42, 8); ex.cyl(DK, xB + dx, y + 0.44, zc + 0.11, 0.025, 0.1, 6); }
    for (const dx of [0.22, 0.72]) {
      F(ex, SB, xE + dx, y + 0.02, zw - 0.55, 0.42, 1.25, 0.38, 'SEWU'); F(ex, DK, xE + dx + 0.06, y + 0.74, zw - 0.17, 0.3, 0.3, 0.004, 'S');
      F(ex, AL, xE + dx + 0.04, y + 0.7, zw - 0.17, 0.34, 0.03, 0.1, 'SEWUD');
      if (!low) for (const tx of [0.12, 0.26]) F(fx, AL, xE + dx + tx, y + 0.84, zw - 0.17, 0.03, 0.06, 0.05, 'SEWUD');
    }
    [zc + 0.2, zc + 1.4].forEach((z0, i) => {
      F(ex, DOOR, xEnd - 0.03, y + 0.02, z0, 0.03, 2.05, 0.85, 'WNSU'); F(ex, DFR, xEnd - 0.05, y, z0 - 0.06, 0.05, 2.13, 0.06, 'WNS'); F(ex, DFR, xEnd - 0.05, y, z0 + 0.85, 0.05, 2.13, 0.06, 'WNS');
      F(ex, DFR, xEnd - 0.05, y + 2.07, z0, 0.05, 0.06, 0.85, 'WD'); F(ex, lm(i ? 'plateRed' : 'plate'), xEnd - 0.012, y + 2.2, z0 + 0.3, 0.012, 0.14, 0.25, 'WNSUD');
      F(fx, AL, xEnd - 0.08, y + 1.0, z0 + (i ? 0.08 : 0.67), 0.05, 0.03, 0.1, 'WNSUD');
    });
    F(ex, PLT, x0 - 0.115, y + 1.55, zl + 0.4, 0.015, 0.3, 0.3, 'WNSUD');                                                        // blank floor plate facing the stairs
  }

  // ================= INTERIORS (near range) =================
  const desks = [], books = [], rnd = rng(item.id.length * 97 + Math.round(L * 10));
  const fan = (x, z, cy) => {
    F(fu, AL, x - 0.012, cy - 0.55, z - 0.012, 0.024, 0.55, 0.024, 'NSEW'); fu.cyl(lm('fan'), x, cy - 0.67, z, 0.1, 0.12, 8);
    for (let i = 0; i < 3; i++) { fu.frame(bar.w + x, bar.n + z, i * 2.0944 + 0.4); fu.box(lm('fan'), 0.42, cy - 0.6, 0, 0.62, 0.012, 0.13, 'EW'); }
    home(fu);
  };
  const light = (x, z, cy, len = 1.2) => {                                         // hanging twin-tube fitting, long axis east-west
    F(fu, WH, x - len / 2, cy - 0.5, z - 0.1, len, 0.05, 0.2, 'NSEWU'); F(fu, LAMP, x - len / 2, cy - 0.51, z - 0.08, len, 0.012, 0.16, 'D');
    if (!low) for (const s of [-0.4, 0.4]) F(fu, AL, x + s * len - 0.006, cy - 0.45, z - 0.006, 0.012, 0.45, 0.012, 'NSEW');
  };
  const drapes = (r, y, head) => {
    for (const b of bays) if (b.a > r.a - 0.01 && b.b < r.b + 0.01) {
      const wa = b.a + 0.25, ww = b.b - b.a - 0.5;
      F(fu, AL, wa, y + head + 0.01, zi + 0.04, ww, 0.025, 0.04, 'SD');
      for (const xx of b.narrow ? [wa + 0.02] : [wa + 0.02, wa + ww - 0.44]) F(fu, lm('drape'), xx, y + 0.9, zi + 0.03, 0.42, head - 0.88, 0.09, 'NSEW');
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
  const dadoWalls = (r, y) => {
    F(fu, DA, r.a + 0.1, y + 0.02, zi, 0.008, 0.95, zw - zi, 'E'); F(fu, DA, r.b - 0.108, y + 0.02, zi, 0.008, 0.95, zw - zi, 'W');
    for (const xl of [...bays.map(b => b.a), xE]) if (xl > r.a - 0.01 && xl < r.b + 0.01) { const pa = Math.max(xl - 0.38, r.a + 0.1), pb = Math.min(xl + 0.38, r.b - 0.1); F(fu, DA, pa, y + 0.02, zi, pb - pa, 0.95, 0.012, 'S'); }
    for (const b of bays) if (b.a > r.a + 0.01 && b.a < r.b - 0.01) F(fu, PL, b.a - 0.125, ceilOf(Math.round(y / FH)) - 0.45, zi, 0.25, 0.45, zw - zi, 'EWD');   // ceiling beam
  };

  function classroom(r, y, k) {
    const xa = r.a + 0.1, xb = r.b - 0.1, len = xb - xa, cy = ceilOf(k), head = k === FLOORS - 1 ? 2.9 : 3.3;
    dadoWalls(r, y); drapes(r, y, head);
    // front (east): platform, console, blackboard with tray, screen, lights over the board, speaker, clock
    F(fu, lm('platform'), xb - 1.3, y + 0.02, zmid - 2.6, 1.3, 0.15, 5.2, 'UWNS');
    F(fu, lm('lockerBody'), xb - 0.95, y + 0.17, zmid - 2.45, 0.6, 0.9, 1.1, 'NSEW'); F(fu, DK, xb - 0.97, y + 1.07, zmid - 2.47, 0.64, 0.03, 1.14, 'NSEWUD');
    F(fu, DK, xb - 0.7, y + 1.1, zmid - 2.15, 0.03, 0.3, 0.45, 'NSEWU');
    F(fu, lm('board'), xb - 0.03, y + 0.95, zmid - 2.1, 0.03, 1.25, 4.2, 'W');
    for (const yy of [y + 0.91, y + 2.2]) F(fu, AL, xb - 0.045, yy, zmid - 2.14, 0.045, 0.04, 4.28, 'WUD');
    for (const zz of [zmid - 2.14, zmid + 2.1]) F(fu, AL, xb - 0.045, y + 0.95, zz, 0.045, 1.25, 0.04, 'WNS');
    F(fu, AL, xb - 0.12, y + 0.89, zmid - 2.1, 0.12, 0.02, 4.2, 'WUDNS');
    F(fu, WH, xb - 0.11, y + 2.5, zmid - 1.35, 0.11, 0.11, 2.7, 'WUDNS'); F(fu, WH, xb - 0.07, y + 2.22, zmid - 1.3, 0.008, 0.28, 2.6, 'W'); F(fu, DK, xb - 0.078, y + 2.2, zmid - 1.3, 0.02, 0.025, 2.6, 'WUD');
    for (const dz of [-1.1, 1.1]) { F(fu, WH, xb - 0.75, cy - 0.62, zmid + dz - 0.6, 0.14, 0.05, 1.2, 'NSEWU'); F(fu, LAMP, xb - 0.73, cy - 0.63, zmid + dz - 0.58, 0.1, 0.012, 1.16, 'D'); }
    F(fu, DK, xb - 0.14, y + 2.75, zmid + 1.75, 0.14, 0.32, 0.22, 'WNSUD');
    // projector on a ceiling pole
    F(fu, AL, xb - 3.3, cy - 0.5, zmid - 0.015, 0.03, 0.5, 0.03, 'NSEW'); F(fu, WH, xb - 3.48, cy - 0.62, zmid - 0.17, 0.36, 0.12, 0.34, 'NSEWUD'); F(fu, DK, xb - 3.12, cy - 0.6, zmid - 0.05, 0.02, 0.08, 0.1, 'ENSUD');
    // fans, lights, lockers, pin board, broom corner
    for (const fx_ of low ? [0.5] : [0.27, 0.73]) for (const s of [-1, 1]) fan(xa + len * fx_, zmid + s * depth * 0.17, cy);
    for (const fx_ of [0.25, 0.75]) for (const dz of [-0.38, 0, 0.38]) light(xa + len * fx_, zmid + dz * depth, cy);
    const lz = Math.floor((zw - 1.3 - zi - 1.1) / 0.4) * 0.4, z0 = zi + 1.1;
    F(fu, lm('lockerBody'), xa, y + 0.02, z0, 0.42, 1.25, lz, 'UNS'); F(fu, DK, xa, y + 0.02, z0, 0.425, 0.05, lz, 'E');
    fu.quad(lm('locker'), [xa + 0.421, y + 0.07, z0 + lz], [xa + 0.421, y + 0.07, z0], [xa + 0.421, y + 1.27, z0], [xa + 0.421, y + 1.27, z0 + lz]);
    F(fu, lm('cork'), xa, y + 1.5, zmid - 1.5, 0.02, 1.0, 3.0, 'E'); F(fu, AL, xa, y + 1.46, zmid - 1.54, 0.014, 1.08, 3.08, 'ENSUD');
    fu.cyl(lm('binGrey'), xa + 0.3, y + 0.02, zi + 0.3, 0.17, 0.45, 10); fu.cyl(RED, xa + 0.3, y + 0.02, zi + 0.75, 0.14, 0.26, 10);
    if (!low) {
      stick(fu, lm('door'), [xa + 0.66, y + 0.08, zi + 0.26], [xa + 0.7, y + 1.3, zi + 0.05], 0.025); F(fu, lm('straw'), xa + 0.52, y + 0.02, zi + 0.2, 0.3, 0.14, 0.06, 'NSEWU');   // broom
      stick(fu, AL, [xa + 0.98, y + 0.08, zi + 0.28], [xa + 1.0, y + 1.35, zi + 0.05], 0.025); F(fu, lm('binGrey'), xa + 0.86, y + 0.02, zi + 0.2, 0.26, 0.08, 0.12, 'NSEWU');   // mop
      F(fu, lm('binGreen'), xa + 0.5, y + 0.02, zi + 0.5, 0.24, 0.02, 0.24, 'NSEWU'); F(fu, lm('binGreen'), xa + 0.5, y + 0.02, zi + 0.74, 0.24, 0.1, 0.015, 'NSEWU');           // dustpan
      // clock, chalk and eraser, sheets on the pin board, switch plate
      fx.setMatrix(new THREE.Matrix4().makeRotationZ(Math.PI / 2).setPosition(bar.w + xb, y + 2.72, bar.n + zmid - 1.75));
      fx.cyl(DK, 0, 0, 0, 0.17, 0.03, 16); fx.cyl(WH, 0, 0, 0, 0.15, 0.036, 16); fx.box(DK, 0, 0.038, 0.04, 0.014, 0.004, 0.08); fx.box(DK, 0.055, 0.038, 0, 0.11, 0.004, 0.01); home(fx);
      [[0.4, 'white'], [0.47, 'white'], [0.56, 'sheetB'], [0.63, 'red']].forEach(([dz, m]) => F(fx, lm(m), xb - 0.09, y + 0.91, zmid + dz, 0.012, 0.012, 0.06, 'WUNS'));
      F(fx, DK, xb - 0.1, y + 0.91, zmid - 0.6, 0.05, 0.035, 0.13, 'WUNS');
      [['sheetA', -1.3, 0.6], ['sheetB', -0.9, 0.55], ['sheetC', -0.4, 0.12], ['sheetA', 0.1, 0.58], ['sheetC', 0.55, 0.15], ['sheetB', 1.0, 0.5]].forEach(([m, dz, dy]) => F(fx, lm(m), xa + 0.02, y + 1.55 + dy, zmid + dz, 0.004, 0.3, 0.21, 'E'));
      F(fx, WH, xb - 1.75, y + 1.3, zw - 0.012, 0.09, 0.09, 0.012, 'NEWUD');
    }
    // desks in four double columns, chairs pushed in, facing the board
    const rows = Math.max(1, Math.floor((len - 5.06) / 0.85) + 1), pitch = rows > 1 ? Math.min(0.95, (len - 5.06) / (rows - 1)) : 0;
    const aisle = Math.min(0.75, (depth - 0.9 - 4.8) / 3);
    for (let i = 0; i < rows; i++) for (let j = 0; j < 4; j++) for (const dz of [0.3, 0.9]) {
      const p = [xb - 2.51 - i * pitch, y + 0.02, zmid - (4.8 + 3 * aisle) / 2 + j * (1.2 + aisle) + dz]; desks.push(p);
      if (!low && rnd() < 0.62) { books.push([p[0] + 0.02, p[1] + 0.75, p[2] + (rnd() - 0.5) * 0.2, rnd(), 0]); if (rnd() < 0.3) books.push([p[0] + 0.03, p[1] + 0.772, p[2] + (rnd() - 0.5) * 0.2, rnd(), 1]); }
    }
    for (const [xd, side] of doorsOf(r)) leaf(xd, side, y);
  }

  function office(r, y, k) {                                                       // teachers' room: six desks in a block, cabinets, pin board
    const xa = r.a + 0.1, xb = r.b - 0.1, len = xb - xa, cy = ceilOf(k), xm = (xa + xb) / 2 + 0.3, LB = lm('lockerBody');
    dadoWalls(r, y); drapes(r, y, k === FLOORS - 1 ? 2.9 : 3.3);
    for (const s of [-1, 1]) for (const dz of [-1.5, 0, 1.5]) {
      const xd = xm + (s < 0 ? -0.72 : 0.04), z = zmid + dz - 0.2;
      F(fu, lm('deskTop'), xd, y + 0.74, z - 0.62, 0.68, 0.03, 1.24, 'NSEWUD'); F(fu, LB, xd + 0.04, y + 0.02, z - 0.6, 0.6, 0.72, 0.42, 'NSEW'); F(fu, LB, xd + (s < 0 ? 0.62 : 0.02), y + 0.02, z - 0.18, 0.04, 0.72, 0.78, 'EW');
      F(fu, DK, xd + (s < 0 ? 0.45 : 0.2), y + 0.8, z - 0.05, 0.03, 0.3, 0.46, 'NSEWU');                                         // monitor
      const xc = xd + (s < 0 ? -0.5 : 0.72);
      F(fu, lm('dark'), xc, y + 0.44, z + 0.0, 0.46, 0.06, 0.46, 'NSEWUD'); F(fu, lm('dark'), xc + (s < 0 ? 0 : 0.42), y + 0.5, z + 0.0, 0.04, 0.45, 0.46, 'NSEWU'); fu.cyl(AL, xc + 0.23, y + 0.02, z + 0.23, 0.03, 0.42, 6, false);
      if (!low && rnd() < 0.8) books.push([xd + 0.34, y + 0.77, z - 0.4, rnd(), 0]);
    }
    F(fu, LB, xm - 0.04, y + 0.74, zmid - 2.35, 0.08, 0.42, 4.3, 'NSEWU');                                                      // low screen between the facing desks
    const cz = Math.floor((depth - 2.6) / 0.9) * 0.9;
    F(fu, LB, xb - 0.45, y + 0.02, zi + 0.7, 0.45, 1.9, cz, 'WNSU'); for (let i = 1; i < cz / 0.9 - 0.01; i++) F(fu, DK, xb - 0.452, y + 0.06, zi + 0.7 + i * 0.9 - 0.004, 0.004, 1.84, 0.008, 'W');
    F(fu, lm('cork'), xa, y + 1.2, zmid - 1.2, 0.02, 1.0, 2.4, 'E'); F(fu, AL, xa, y + 1.16, zmid - 1.24, 0.014, 1.08, 2.48, 'ENSUD');
    F(fu, WH, xa + 0.05, y + 0.02, zi + 0.45, 0.32, 0.95, 0.32, 'NSEWU'); fu.cyl(lm('sheetC'), xa + 0.21, y + 0.97, zi + 0.61, 0.13, 0.32, 10);   // bottled-water dispenser
    for (const s of [-1, 1]) { fan(xa + len / 2, zmid + s * depth * 0.2, cy); for (const dz of [-0.36, 0, 0.36]) if (s < 0 || dz) light(xa + len * (s < 0 ? 0.3 : 0.72), zmid + dz * depth, cy, 1.0); }
    for (const [xd, side] of doorsOf(r)) leaf(xd, side, y);
  }

  for (let k = 0; k < FLOORS; k++) for (const r of rooms) (r.kind === 'class' ? classroom : office)(r, k * FH, k);

  // ---- stair flights: steps with nosings, soffit slabs, stringers, balusters, handrails ----
  const TR = lm('tread'), NO = lm('nosing');
  for (let k = 0; k < FLOORS - 1; k++) {
    const y = k * FH, ym = y + FH / 2, y1 = y + FH;
    for (let i = 0; i < STEPS; i++) {
      F(fu, TR, xa1, y + i * RISE, zl - (i + 1) * GO, sw, RISE, GO, 'USW'); F(fu, TR, sx0, ym + i * RISE, zh + i * GO, sw, RISE, GO, 'UNE');
      F(fu, NO, xa1, y + (i + 1) * RISE - 0.008, zl - i * GO - 0.04, sw, 0.012, 0.055, 'US'); F(fu, NO, sx0, ym + (i + 1) * RISE - 0.008, zh + i * GO - 0.015, sw, 0.012, 0.055, 'UN');
      if (!low || i % 2 === 0) {
        F(fu, RAIL, xa1 - 0.03, y + (i + 0.5) * RISE + 0.2, zl - (i + 0.5) * GO - 0.01, 0.02, RISE + 0.66, 0.02, 'NSEW');
        F(fu, RAIL, xb1 + 0.01, ym + (i + 0.5) * RISE + 0.2, zh + (i + 0.5) * GO - 0.01, 0.02, RISE + 0.66, 0.02, 'NSEW');
      }
    }
    for (const [xa, xb, zA, yA, zB, yB, well, wall] of [[xa1, xa2, zl, y, zh, ym, [xa1 - 0.035, xa1], [xa2 - 0.1, xa2 - 0.06]], [sx0, xb1, zh, ym, zl, y1, [xb1, xb1 + 0.035], [sx0 + 0.06, sx0 + 0.1]]]) {
      incl(fu, PL, xa, xb, zA, yA, zB, yB, 0.14, 'DEW');                                                                         // soffit slab
      incl(fu, WH, well[0], well[1], zA, yA + 0.23, zB, yB + 0.23, 0.37, 'EWUDNS');                                              // stringer on the well side
      incl(fu, RAIL, well[0] - 0.008, well[1] + 0.008, zA, yA + RISE + 0.9, zB, yB + RISE + 0.9, 0.05, 'EWUDNS');                // handrail on the balusters
      incl(fu, RAIL, wall[0], wall[1], zA, yA + RISE + 0.9, zB, yB + RISE + 0.9, 0.04, 'EWUDNS');                                // handrail on the wall
      incl(fu, DA, xa === xa1 ? xa2 - 0.008 : sx0, xa === xa1 ? xa2 : sx0 + 0.008, zA, yA + 0.3, zB, yB + 0.3, 0.3, xa === xa1 ? 'W' : 'E');   // painted skirting
    }
    F(fu, RAIL, xb1 - 0.01, ym + RISE + 0.85, zh - 0.05, 0.22, 0.05, 0.05, 'NSUDEW');                                            // rail turning round the well at the half landing
    F(fu, RAIL, xb1 - 0.01, y1 + RISE + 0.85, zl, 0.22, 0.05, 0.05, 'NSUDEW'); for (const xx of [xb1 + 0.005, xa1 - 0.03]) F(fu, RAIL, xx, y1, zl + 0.012, 0.024, 1.0, 0.024, 'NSEW');
    if (k === 0) F(fu, RAIL, xa1 - 0.04, 0, zl, 0.045, 1.1, 0.045, 'NSEWU');                                                     // newel post at the foot
    F(fu, LAMP, (sx0 + xa2) / 2 - 0.18, ym - 0.21, (zi + zh) / 2 - 0.18, 0.36, 0.06, 0.36, 'NSEWD');                             // lamp under the half landing
    for (const xx of [swa, swa + 1.2]) F(fu, MW, xx + 0.42, ym + 0.95, zN + 0.07, 0.05, 1.5, 0.08, 'NSEW');                      // mullions of the landing windows
  }

  // ================= assemble =================
  ctx.add(mergeFlat(v.build({ name: item.id + '-visual' }), true));
  const cx = bar.w + L / 2, cz = bar.n + D / 2;
  ctx.detail(ctx.add(mergeFlat(ex.build({ name: item.id + '-fittings', castShadow: false }), false)), cx, cz, L / 2 + (low ? 70 : 100));
  const fuG = mergeFlat(fu.build({ name: item.id + '-interior', castShadow: false }), false), fxG = mergeFlat(fx.build({ name: item.id + '-fine', castShadow: false }), false);
  const M = new THREE.Matrix4();
  for (const part of deskSet(low)) {                                               // one instanced mesh per material of the desk set
    const im = new THREE.InstancedMesh(part.geometry, part.material, desks.length); im.name = item.id + '-desks'; im.receiveShadow = true;
    desks.forEach((p, i) => im.setMatrixAt(i, M.makeTranslation(bar.w + p[0], p[1], bar.n + p[2])));
    im.computeBoundingSphere(); fuG.add(im);
  }
  if (books.length) {                                                              // closed books lying on the desks: plain covers, no titles
    const im = new THREE.InstancedMesh(new THREE.BoxGeometry(0.18, 0.02, 0.25), lm('book'), books.length), col = new THREE.Color(), q = new THREE.Quaternion(), up = new THREE.Vector3(0, 1, 0), one = new THREE.Vector3(1, 1, 1);
    const covers = [0x2f5f9e, 0xb8322a, 0x3d8a55, 0xd9a520, 0xe9e2cf, 0x6b4e8a, 0x2a8a96];
    books.forEach((p, i) => {
      im.setMatrixAt(i, M.compose(new THREE.Vector3(bar.w + p[0], p[1] + 0.011, bar.n + p[2]), q.setFromAxisAngle(up, (p[3] - 0.5) * (p[4] ? 1.2 : 0.5)), one));
      im.setColorAt(i, col.setHex(covers[Math.floor(p[3] * 977) % covers.length]));
    });
    im.name = item.id + '-books'; im.computeBoundingSphere(); fxG.add(im);
  }
  ctx.detail(ctx.add(fuG), cx, cz, L / 2 + (low ? 34 : 44));
  ctx.detail(ctx.add(fxG), cx, cz, L / 2 + (low ? 14 : 20));
  const cg = ctx.add(c.build({ name: item.id + '-colliders' })); cg.visible = false;

  // stair ramps (collision only): one inclined plate per flight, so the capsule walks up smoothly
  const ramps = new THREE.Group(); ramps.position.set(bar.w, 0, bar.n); ramps.visible = false; ctx.add(ramps);
  const rlen = Math.hypot(run, FH / 2), rang = Math.atan2(FH / 2, run);
  for (let k = 0; k < FLOORS - 1; k++) for (const flight of ['A', 'B']) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(sw, 0.2, rlen));
    m.position.set(flight === 'A' ? xa1 + sw / 2 : sx0 + sw / 2, k * FH + (flight === 'A' ? FH / 4 : FH * 3 / 4) - 0.1 * Math.cos(rang), zl - run / 2);
    m.rotation.x = flight === 'A' ? rang : -rang;          // rotating about +X by a positive angle lowers the +z (south) end: A rises toward north, B toward south
    ramps.add(m);
  }
  cg.traverse(o => { if (o.isMesh) ctx.collide(o); });
  ramps.children.forEach(m => ctx.collide(m));
}
