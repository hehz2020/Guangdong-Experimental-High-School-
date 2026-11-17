// Five-storey teaching slab (the east pair). Exterior follows the 2018 footage: white frame and piers, dark-red
// spandrels under strip windows on the north face, squarer openings on the top floor, flat roof with parapet.
//
// ASSUMED, not seen in any reference: the south side as an open corridor, everything indoors (classroom size,
// furniture, blackboards) and the staircase at the west end. Typical layout for schools of this type.
import { THREE, mat, bbox } from '../../kit.js';
import { Batch } from '../../batch.js';

const FH = 3.9, FLOORS = 5, INSET = 0.3, WALL = 0.24, BAY = 4.4, ROOM = 2 * BAY, CORRIDOR = 2.6;
const local = {};
function lm(name) {
  if (!local[name]) {
    local[name] = name === 'board' ? new THREE.MeshStandardMaterial({ color: 0x1f4a3a, roughness: 0.9 })
      : name === 'lamp' ? new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xfff4d8, emissiveIntensity: 0.9 })
      : new THREE.MeshStandardMaterial({ color: 0xb08d57, roughness: 0.95 });   // cork
  }
  return local[name];
}

export function build(item, ctx) {
  const bar = item.mainBar || (b => ({ w: b.w, e: b.e, n: b.n, s: b.s }))(bbox(item.points));
  const L = bar.e - bar.w, D = bar.s - bar.n, roofY = FLOORS * FH;
  const nRooms = Math.max(1, Math.floor((L - 4.0) / ROOM)), x0 = L - nRooms * ROOM;       // stair zone is x 0..x0 at the west end
  // A deeper outline (the west slab is about 17 m) keeps the classroom depth and gets a wider open gallery on the south side.
  const corridor = D > 13.5 ? D - 9.5 : CORRIDOR;
  const zN = INSET, zS = D - INSET, zc = zS - corridor;                                    // zc: corridor/classroom boundary
  const v = new Batch().frame(bar.w, bar.n), c = new Batch().frame(bar.w, bar.n);          // visual and collision batches
  const fu = new Batch().frame(bar.w, bar.n);                                              // furniture: built separately so it can be hidden at a distance
  const both = (m, ...a) => { v.slab(m, ...a); c.slab('generic', ...a); };

  for (let k = 0; k < FLOORS; k++) {
    const y = k * FH, ground = k === 0, top = k === FLOORS - 1;
    // floor plates (classrooms + corridor, and the corridor strip beside the stairwell)
    if (!ground) { both('wallWhite', x0, y - 0.15, zN, L - INSET - x0, 0.15, zS - zN); both('wallWhite', INSET, y - 0.15, zc - 1.3, x0 - INSET, 0.15, zS - zc + 1.3); }
    v.slab('floorGrey', INSET, y, zN, L - 2 * INSET, 0.02, zS - zN, 'D');
    // --- north face: piers, spandrels, strip windows ---
    const spandrel = ground ? 'wallMaroon' : 'wallMaroon', lintel = ground ? 'wallMaroon' : 'wallWhite';
    for (let j = 0; j <= 2 * nRooms; j++) both('wallWhite', x0 + j * BAY - 0.25, y, zN, 0.5, FH, WALL);
    for (let j = 0; j < 2 * nRooms; j++) {
      const xa = x0 + j * BAY + 0.25, w = BAY - 0.5;
      both(spandrel, xa, y, zN, w, 0.95, WALL); both(lintel, xa, y + 2.95, zN, w, FH - 2.95, WALL);
      c.slab('generic', xa, y + 0.95, zN + 0.08, w, 2.0, 0.08);
      if (top) {                                     // squarer separate openings on the top floor
        both('wallWhite', xa + w / 2 - 0.3, y + 0.95, zN, 0.6, 2.0, WALL);
        for (const s of [0, 1]) { const xw = xa + s * (w / 2 + 0.3), ww = w / 2 - 0.3; v.slab('glassClear', xw, y + 0.95, zN + 0.1, ww, 2.0, 0.03); v.slab('metalWhite', xw + ww / 2 - 0.03, y + 0.95, zN + 0.07, 0.06, 2.0, 0.09); }
      } else {
        v.slab(ground ? 'glassDark' : 'glassClear', xa, y + 0.95, zN + 0.1, w, 2.0, 0.03);
        for (const f of [1 / 3, 2 / 3]) v.slab('metalWhite', xa + w * f - 0.03, y + 0.95, zN + 0.07, 0.06, 2.0, 0.09);
        v.slab('metalWhite', xa, y + 2.25, zN + 0.07, w, 0.06, 0.09);
      }
    }
    // stairwell north wall with a tall glazed strip
    both('wallWhite', INSET, y, zN, 1.2, FH, WALL); both('wallWhite', 2.6, y, zN, x0 - 0.25 - 2.6, FH, WALL);
    both('wallWhite', 1.5, y, zN, 1.1, 0.6, WALL); both('wallWhite', 1.5, y + 3.3, zN, 1.1, FH - 3.3, WALL);
    v.slab('glassGreen', 1.5, y + 0.6, zN + 0.1, 1.1, 2.7, 0.03); c.slab('generic', 1.5, y + 0.6, zN + 0.08, 1.1, 2.7, 0.08);
    // end walls
    both('wallWhite', INSET, y, zN, WALL, FH, zS - zN); both('wallWhite', L - INSET - WALL, y, zN, WALL, FH, zS - zN);
    both('wallMaroon', L - INSET - 0.02, y + 0.2, zN + 1.0, 0.04, FH - 0.6, 1.2);
    // --- south side: open corridor with columns and a solid balustrade ---
    for (let j = 0; j <= 2 * nRooms; j++) both('wallWhite', x0 + j * BAY - 0.2, y, zS - 0.4, 0.4, FH, 0.4);
    both('wallWhite', INSET + WALL, y, zS - 0.4, 0.4, FH, 0.4);
    v.slab('wallWhite', INSET, y + FH - 0.65, zS - 0.25, L - 2 * INSET, 0.5, 0.25);                     // edge beam band
    if (!ground) { both('wallWhite', INSET + WALL, y, zS - 0.12, L - 2 * INSET - 2 * WALL, 1.1, 0.12); v.slab('wallMaroon', INSET + WALL, y + 0.25, zS - 0.005, L - 2 * INSET - 2 * WALL, 0.5, 0.01); }
    // --- classroom/corridor wall: two doors and high windows per room ---
    for (let r = 0; r < nRooms; r++) {
      const xa = x0 + r * ROOM, xb = xa + ROOM, zw = zc - 0.2;
      both('wallCream', xa, y, zw, 0.6, FH - 0.15, 0.2); both('wallCream', xb - 0.6, y, zw, 0.6, FH - 0.15, 0.2);
      for (const xd of [xa + 0.6, xb - 1.6]) { both('wallCream', xd, y + 2.1, zw, 1.0, FH - 0.15 - 2.1, 0.2); v.slab('woodDark', xd - 0.04, y, zw - 0.02, 0.04, 2.1, 0.24); v.slab('woodDark', xd + 1.0, y, zw - 0.02, 0.04, 2.1, 0.24); }
      const xm = xa + 1.6, wm = ROOM - 3.2;
      both('wallCream', xm, y, zw, wm, 1.6, 0.2); both('wallCream', xm, y + 2.6, zw, wm, FH - 0.15 - 2.6, 0.2);
      v.slab('glassClear', xm, y + 1.6, zw + 0.08, wm, 1.0, 0.03); c.slab('generic', xm, y + 1.6, zw + 0.06, wm, 1.0, 0.08);
      for (let i = 1; i < 4; i++) v.slab('metalWhite', xm + wm * i / 4 - 0.025, y + 1.6, zw + 0.05, 0.05, 1.0, 0.1);
      // partitions between rooms
      both('wallWhite', xa - 0.1, y, zN + WALL, 0.2, FH - 0.15, zw - zN - WALL);
      // --- furniture (walk-through, no collision) ---
      const zi0 = zN + WALL, depth = zw - zi0, zmid = zi0 + depth / 2;
      fu.slab('board', xa + 0.1, y + 0.9, zmid - 2.0, 0.04, 1.2, 4.0); fu.slab('metalWhite', xa + 0.1, y + 0.86, zmid - 2.05, 0.08, 0.04, 4.1);
      fu.slab('wood', xa + 0.1, y + 0.02, zmid - 2.6, 1.3, 0.18, 5.2); fu.slab('woodDark', xa + 0.75, y + 0.2, zmid - 0.35, 0.5, 0.95, 0.7);
      fu.slab('cork', xb - 0.14, y + 1.0, zmid - 1.5, 0.03, 1.1, 3.0);
      for (const lx of [xa + 2.6, xa + 5.2, xa + 7.6]) for (const lz of [zmid - depth / 4, zmid + depth / 4]) fu.slab('lamp', lx - 0.1, y + FH - 0.22, lz - 0.6, 0.2, 0.05, 1.2);
      const cols = [-2.2, -1.6, -0.3, 0.3, 1.6, 2.2];           // three pairs with two aisles
      for (let row = 0; row < 7; row++) for (const dz of cols) {
        const dx = xa + 2.5 + row * 0.82, z = zmid + dz;
        fu.slab('wood', dx, y + 0.72, z - 0.28, 0.42, 0.03, 0.56); fu.slab('steel', dx + 0.02, y + 0.02, z - 0.27, 0.03, 0.7, 0.03); fu.slab('steel', dx + 0.02, y + 0.02, z + 0.24, 0.03, 0.7, 0.03);
        fu.slab('steel', dx + 0.37, y + 0.02, z - 0.27, 0.03, 0.7, 0.54);
        fu.slab('wood', dx + 0.5, y + 0.43, z - 0.19, 0.36, 0.03, 0.38); fu.slab('wood', dx + 0.84, y + 0.46, z - 0.19, 0.03, 0.4, 0.38); fu.slab('steel', dx + 0.52, y + 0.02, z - 0.17, 0.32, 0.41, 0.03); fu.slab('steel', dx + 0.52, y + 0.02, z + 0.14, 0.32, 0.41, 0.03);
      }
    }
    both('wallWhite', x0 - 0.1, y, zc - 1.3, 0.2, FH - 0.15, 1.1);   // short return wall at the stair landing (keeps the wall line)
    // --- staircase in the west zone: two flights per storey around a spine wall ---
    const sx0 = INSET + WALL, sw = (x0 - 0.1 - sx0 - 0.2) / 2, run = 13 * 0.28, zl = zc - 1.3;   // zl: north edge of the floor landing
    both('wallWhite', sx0 + sw, y, zl - run, 0.2, FH, run);                                      // spine between the flights
    both('wallWhite', sx0, y + FH / 2 - 0.15, zN + WALL, 2 * sw + 0.2, 0.15, zl - run - zN - WALL);   // half landing, reaching the north wall so there is no gap to fall through
    if (!top) for (let i = 0; i < 13; i++) {
      v.slab('concrete', sx0 + sw + 0.2, y + i * 0.15 - 0.15, zl - (i + 1) * 0.28, sw, 0.3, 0.28);                 // flight A: east half, climbing north
      v.slab('concrete', sx0, y + FH / 2 + i * 0.15 - 0.15, zl - run + i * 0.28, sw, 0.3, 0.28);                   // flight B: west half, climbing south
    } else both('wallWhite', sx0, y, zl - 0.1, 2 * sw + 0.2, 1.1, 0.1);                           // guard at the top of the stairwell
  }
  // roof, parapet, rooftop plant
  both('roofGrey', 0, roofY - 0.3, 0, L, 0.3, D);
  for (const [x, z, sx, sz] of [[0, 0, L, 0.2], [0, D - 0.2, L, 0.2], [0, 0, 0.2, D], [L - 0.2, 0, 0.2, D]]) both('wallWhite', x, roofY, z, sx, 1.2, sz);
  for (let i = 0; i < 5; i++) v.slab('roofPale', x0 + 4 + i * 8.2, roofY, D * 0.35, 2.4, 1.0, 1.6);
  v.slab('red', 1, roofY + 0.25, D - 0.5, L - 2, 0.12, 0.12);

  // south-west annex seen on the roof outline: plain block (use unknown, probably services)
  const south = item.points.filter(p => p[1] > bar.s + 1);
  if (south.length >= 2) {
    const a = bbox(south), ax = a.w - bar.w, aw = a.sx, az = D - INSET, ad = a.s - bar.s + INSET;
    both('wallWhite', ax, 0, az, aw, roofY + 1.2, ad);
    for (let k = 0; k < FLOORS; k++) v.slab('glassDark', ax + aw * 0.25, k * FH + 1.6, az + ad - 0.005, aw * 0.5, 0.7, 0.03);
  }

  for (const key of ['board', 'lamp', 'cork']) if (fu.parts.has(key)) fu.parts.get(key).material = lm(key);
  ctx.add(v.build({ name: item.id + '-visual' }));
  ctx.detail(ctx.add(fu.build({ name: item.id + '-furniture', castShadow: false })), bar.w + L / 2, bar.n + D / 2, L / 2 + 45);
  const cg = ctx.add(c.build({ name: item.id + '-colliders' })); cg.visible = false;

  // stair ramps (collision only): one inclined plate per flight, so the capsule walks up smoothly
  const ramps = new THREE.Group(); ramps.position.set(bar.w, 0, bar.n); ramps.visible = false; ctx.add(ramps);
  const sx0 = INSET + WALL, sw = (x0 - 0.1 - sx0 - 0.2) / 2, run = 13 * 0.28, zl = zc - 1.3, len = Math.hypot(run, FH / 2), ang = Math.atan2(FH / 2, run);
  for (let k = 0; k < FLOORS - 1; k++) for (const flight of ['A', 'B']) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(sw, 0.2, len));
    const yMid = k * FH + (flight === 'A' ? FH / 4 : FH * 3 / 4) - 0.1 * Math.cos(ang);
    m.position.set(flight === 'A' ? sx0 + sw + 0.2 + sw / 2 : sx0 + sw / 2, yMid, zl - run / 2);
    m.rotation.x = flight === 'A' ? ang : -ang;          // rotating about +X by a positive angle lowers the +z (south) end: A rises toward north, B toward south
    ramps.add(m);
  }
  cg.traverse(o => { if (o.isMesh) ctx.collide(o); });
  ramps.children.forEach(m => ctx.collide(m));
}
