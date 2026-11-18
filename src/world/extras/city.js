// The city round the campus: housing blocks and towers beyond the main road, to the west, south and east; the metro
// depot east of the canal (sheds, sidings, trains); traffic on the main road; a hazy ring of far blocks.
//
// IMAGINED, apart from three things read roughly off a small overview of the satellite mosaic and kept from the earlier
// backdrop (data/landscape.json, "backdrop"): ten housing towers north of the campus, the four long depot sheds east of
// the canal and the gravel yard between them and the canal. The 2018 and 2022 aerial footage shows that kind of
// surrounding (towers to the north and north-east, long sheds across the canal); nothing else here was measured. No
// street, block or vehicle stands for a real one.
//
// Where the city is drawn: beyond the far kerb of the main road; west of x -128; south of z 262 (south of z 160 west of
// x 10); east of the depot. The strip between those lines and the surveyed campus is left to the landscape module.
//
// Collision: one block per lot, per tower and per shed, so nothing here can be walked through. Lit windows after dusk
// come from an emissive map driven by the lighting module's night level.
import { THREE, mat } from '../../kit.js';
import { Batch } from '../../batch.js';
import { pbr, plain, rng } from '../../hifi.js';
import { BACKDROP, CANAL, ROAD_LINES, groundMesh } from './landscape.js';

const SQ = [[-736, -728], [764, -728], [764, 771], [-736, 771]];
// the main road is one straight line; n points to its far (north-west) side
const A = [-193.2, -78.0], U = [0.8360, -0.5488], N = [-0.5488, -0.8360];
const beyondRoad = (x, z) => (x - A[0]) * N[0] + (z - A[1]) * N[1];
const xw = z => CANAL.westEdge[0][0] + (CANAL.westEdge[1][0] - CANAL.westEdge[0][0]) * (z - CANAL.westEdge[0][1]) / (CANAL.westEdge[1][1] - CANAL.westEdge[0][1]);
const xe = z => CANAL.eastEdge[0][0] + (CANAL.eastEdge[1][0] - CANAL.eastEdge[0][0]) * (z - CANAL.eastEdge[0][1]) / (CANAL.eastEdge[1][1] - CANAL.eastEdge[0][1]);
const DEPOT = 118;                                     // depth of the depot behind the east bank
/** Convex polygon cut by the half-plane f(x, z) >= 0 (f linear). */
function clip(poly, f) {
  const out = [];
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i], b = poly[(i + 1) % poly.length], fa = f(a[0], a[1]), fb = f(b[0], b[1]);
    if (fa >= 0) out.push(a);
    if ((fa >= 0) !== (fb >= 0)) { const t = fa / (fa - fb); out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]); }
  }
  return out;
}
const cut = (poly, ...fs) => fs.reduce((p, f) => clip(p, f), poly);
const SE = (x, z) => -20.5 - beyondRoad(x, z);
// [outline, angle of the block grid]
const ZONES = [
  [cut(SQ, (x, z) => beyondRoad(x, z) - 21.5), Math.atan2(-U[1], U[0])],
  [cut(SQ, SE, x => -128 - x), 0],
  [cut(SQ, SE, x => x + 128, x => 10 - x, (x, z) => z - 160), 0],
  [cut(SQ, SE, x => x - 10, (x, z) => z - 262, (x, z) => xw(z) - 30 - x), 0],
  [cut(SQ, SE, (x, z) => z - 262, (x, z) => x - xe(z) - 30), 0],
  [cut(SQ, SE, (x, z) => 262 - z, (x, z) => x - xe(z) - DEPOT), Math.atan2(-(CANAL.westEdge[1][1] - CANAL.westEdge[0][1]), CANAL.westEdge[1][0] - CANAL.westEdge[0][0])],
].filter(([p]) => p.length >= 3);
const inside = (poly, x, z) => { let on = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const [ax, az] = poly[j], [bx, bz] = poly[i]; if ((az > z) !== (bz > z) && x < (bx - ax) * (z - az) / (bz - az) + ax) on = !on; } return on; };

// ---- facades -------------------------------------------------------------------------------------------------------
const WALLS = [['#e6dccb', '#b9ad9a'], ['#d9c7b8', '#a8907f'], ['#ecebe6', '#aeb4b8'], ['#e3d6a8', '#b0a07a'], ['#cfd6da', '#8f9aa2'], ['#d8b9a8', '#9c7f72']];
/** Housing facade, 8 bays by 6 storeys per repeat (24 x 18 m): windows, balconies, air-conditioning units; and its lit-window map. */
function facade(k, tower = false) {
  const S = 512, cv = document.createElement('canvas'), ev = document.createElement('canvas'); cv.width = cv.height = ev.width = ev.height = S;
  const g = cv.getContext('2d'), e = ev.getContext('2d'), r = rng(4000 + k * 97 + (tower ? 13 : 0)), [wall, trim] = WALLS[k % WALLS.length], bw = S / 8, sh = S / 6;
  g.fillStyle = wall; g.fillRect(0, 0, S, S); e.fillStyle = '#000'; e.fillRect(0, 0, S, S);
  for (let i = 0; i < 2600; i++) { g.fillStyle = `rgba(${r() < 0.5 ? '0,0,0' : '255,255,255'},${0.02 + 0.03 * r()})`; g.fillRect(r() * S, r() * S, 2 + r() * 6, 2 + r() * 14); }
  for (let s = 0; s < 6; s++) {
    g.fillStyle = trim; g.fillRect(0, s * sh + sh - 5, S, 5);                                     // floor band
    for (let b = 0; b < 8; b++) {
      const x = b * bw, y = s * sh, balcony = tower ? b % 4 === 1 || b % 4 === 2 : b % 2 === 0, lit = r() < 0.34, warm = `hsl(${32 + r() * 18},${55 + r() * 30}%,${58 + r() * 22}%)`;
      const wx = x + bw * 0.16, wy = y + sh * 0.18, ww = bw * 0.68, wh = sh * (balcony ? 0.62 : 0.5);
      g.fillStyle = '#39454d'; g.fillRect(wx, wy, ww, wh);
      const sky = g.createLinearGradient(0, wy, 0, wy + wh); sky.addColorStop(0, 'rgba(150,180,200,0.55)'); sky.addColorStop(1, 'rgba(40,55,62,0.2)'); g.fillStyle = sky; g.fillRect(wx, wy, ww, wh);
      if (r() < 0.45) { g.fillStyle = `rgba(${200 + r() * 40},${190 + r() * 40},${170 + r() * 40},0.75)`; g.fillRect(wx + (r() < 0.5 ? 0 : ww * 0.55), wy, ww * 0.45, wh); }   // a drawn curtain
      g.strokeStyle = '#e9e7e0'; g.lineWidth = 2; g.strokeRect(wx, wy, ww, wh); g.beginPath(); g.moveTo(wx + ww / 2, wy); g.lineTo(wx + ww / 2, wy + wh); g.stroke();
      if (lit) { e.fillStyle = warm; e.fillRect(wx + 2, wy + 2, ww - 4, wh - 4); if (r() < 0.3) { e.fillStyle = 'rgba(190,210,255,0.9)'; e.fillRect(wx + 2, wy + 2, ww - 4, wh - 4); } }
      if (balcony) {                                                                             // slab, railing, washing
        g.fillStyle = trim; g.fillRect(x + 3, y + sh * 0.8, bw - 6, sh * 0.07);
        g.strokeStyle = 'rgba(60,66,70,0.9)'; g.lineWidth = 1.2; for (let q = 0; q <= 8; q++) { g.beginPath(); g.moveTo(x + 4 + q * (bw - 8) / 8, y + sh * 0.58); g.lineTo(x + 4 + q * (bw - 8) / 8, y + sh * 0.8); g.stroke(); }
        g.beginPath(); g.moveTo(x + 4, y + sh * 0.58); g.lineTo(x + bw - 4, y + sh * 0.58); g.stroke();
        if (r() < 0.5) for (let q = 0; q < 3; q++) { g.fillStyle = `hsl(${r() * 360},${30 + r() * 40}%,${45 + r() * 35}%)`; g.fillRect(x + 8 + q * bw * 0.25, y + sh * 0.22, bw * 0.16, sh * (0.18 + 0.14 * r())); }
      } else if (r() < 0.7) { g.fillStyle = '#d9d9d4'; g.fillRect(x + bw * 0.3, y + sh * 0.72, bw * 0.4, sh * 0.16); g.fillStyle = '#8b8f92'; g.beginPath(); g.arc(x + bw * 0.5, y + sh * 0.8, sh * 0.055, 0, 6.283); g.fill(); }
    }
  }
  for (let i = 0; i < 14; i++) { const x = r() * S, y = r() * S; const st = g.createLinearGradient(0, y, 0, y + 70); st.addColorStop(0, 'rgba(70,62,50,0.16)'); st.addColorStop(1, 'rgba(70,62,50,0)'); g.fillStyle = st; g.fillRect(x, y, 3 + r() * 5, 70); }
  const tex = cvs => { const t = new THREE.CanvasTexture(cvs); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(1 / 24, 1 / 18); t.anisotropy = 8; return t; };
  const m = new THREE.MeshStandardMaterial({ map: tex(cv), roughness: 0.82, emissive: 0xffffff, emissiveMap: tex(ev), emissiveIntensity: 0 }); m.name = 'hifi-cityfront'; return m;
}
/** Shop fronts and offices: 6 bays by 4 storeys per repeat (24 x 16 m), long ribbon glazing over a row of signs. */
function shopfront(k) {
  const S = 512, cv = document.createElement('canvas'), ev = document.createElement('canvas'); cv.width = cv.height = ev.width = ev.height = S;
  const g = cv.getContext('2d'), e = ev.getContext('2d'), r = rng(6100 + k * 31), sh = S / 4;
  g.fillStyle = ['#d5d1c8', '#c9cdd0', '#dccfbe'][k % 3]; g.fillRect(0, 0, S, S); e.fillStyle = '#000'; e.fillRect(0, 0, S, S);
  for (let s = 0; s < 4; s++) { const y = s * sh;
    g.fillStyle = '#34424b'; g.fillRect(0, y + sh * 0.2, S, sh * 0.5); const sky = g.createLinearGradient(0, y + sh * 0.2, 0, y + sh * 0.7); sky.addColorStop(0, 'rgba(160,190,205,0.6)'); sky.addColorStop(1, 'rgba(40,55,62,0.15)'); g.fillStyle = sky; g.fillRect(0, y + sh * 0.2, S, sh * 0.5);
    g.strokeStyle = '#dfe2e2'; g.lineWidth = 2; for (let q = 0; q <= 12; q++) { g.beginPath(); g.moveTo(q * S / 12, y + sh * 0.2); g.lineTo(q * S / 12, y + sh * 0.7); g.stroke(); }
    for (let q = 0; q < 12; q++) if (r() < 0.4) { e.fillStyle = r() < 0.6 ? '#fff0cf' : '#dfeaff'; e.fillRect(q * S / 12 + 2, y + sh * 0.2 + 2, S / 12 - 4, sh * 0.5 - 4); }
  }
  for (let q = 0; q < 6; q++) { const hue = Math.floor(r() * 360); g.fillStyle = `hsl(${hue},${55 + r() * 30}%,${38 + r() * 20}%)`; g.fillRect(q * S / 6 + 3, S - sh * 0.26, S / 6 - 6, sh * 0.2); e.fillStyle = `hsl(${hue},70%,55%)`; e.fillRect(q * S / 6 + 3, S - sh * 0.26, S / 6 - 6, sh * 0.2);
    g.fillStyle = 'rgba(255,255,255,0.85)'; for (let c = 0; c < 4; c++) g.fillRect(q * S / 6 + 12 + c * 16, S - sh * 0.21, 11, sh * 0.1); }
  const tex = cvs => { const t = new THREE.CanvasTexture(cvs); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(1 / 24, 1 / 16); t.anisotropy = 8; return t; };
  const m = new THREE.MeshStandardMaterial({ map: tex(cv), roughness: 0.6, emissive: 0xffffff, emissiveMap: tex(ev), emissiveIntensity: 0 }); m.name = 'hifi-cityshops'; return m;
}
/** Metro car side, one car (19.5 x 3.7 m) per repeat. */
function carSide() {
  const W = 1024, H = 192, cv = document.createElement('canvas'); cv.width = W; cv.height = H; const g = cv.getContext('2d');
  g.fillStyle = '#eceef0'; g.fillRect(0, 0, W, H); g.fillStyle = '#e2b521'; g.fillRect(0, H * 0.66, W, H * 0.06); g.fillStyle = '#3a3f45'; g.fillRect(0, H * 0.84, W, H * 0.16);
  g.fillStyle = '#1f2a31'; for (let i = 0; i < 5; i++) g.fillRect(W * (0.05 + i * 0.19), H * 0.2, W * 0.1, H * 0.36);
  g.fillStyle = '#d7dadd'; g.strokeStyle = '#8f959b'; g.lineWidth = 3; for (let i = 0; i < 4; i++) { const x = W * (0.165 + i * 0.19); g.fillRect(x, H * 0.14, W * 0.066, H * 0.68); g.strokeRect(x, H * 0.14, W * 0.066, H * 0.68); g.fillStyle = '#1f2a31'; g.fillRect(x + 6, H * 0.2, W * 0.066 - 12, H * 0.3); g.fillStyle = '#d7dadd'; }
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(1 / 19.5, 1 / 3.7); t.offset.y = -0.3 / 3.7; t.anisotropy = 8;
  const m = new THREE.MeshStandardMaterial({ map: t, roughness: 0.35, metalness: 0.3 }); m.name = 'hifi-metrocar'; return m;
}

export function build(ctx) {
  const low = !!ctx.lowPower, r = rng(20261118);
  const F = [0, 1, 2, 3, 4, 5].map(k => facade(k)), T = [0, 2, 4, 5].map(k => facade(k, true)), SHOP = [0, 1, 2].map(shopfront), lit = [...F, ...T, ...SHOP];
  const roof = pbr('concrete', [0x9d9a92]), roofDark = pbr('concrete', [0x6f716f]), tank = pbr('steel'), asphalt = mat('asphalt'), lot = pbr('concrete', [0xb4b0a6]), green = mat('lawn');
  const colliders = [], solid = (x, z, a, sx, sy, sz) => { const m = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz)); m.position.set(x, sy / 2, z); m.rotation.y = a; colliders.push(m); };
  const towers = [...BACKDROP.towers, [-250, -470, 96], [-190, -520, 102], [-60, -500, 90], [40, -470, 96], [130, -520, 102], [220, -480, 90], [300, -540, 96], [390, -470, 84], [460, -540, 102]];

  // ---- ground of the city: asphalt everywhere, a paved or planted lot inside every street block
  ctx.add(groundMesh(ZONES.map(([outer]) => ({ outer })), 0.004, asphalt)).name = 'city-streets';
  const lots = [], parks = [], blobs = [];
  ZONES.forEach(([zone, angle], zi) => {
    const v = new Batch(), cs = Math.cos(angle), sn = Math.sin(angle), W = (a, b) => [a * cs + b * sn, -a * sn + b * cs];      // grid frame to world, about the origin
    const L = (x, z) => [x * cs - z * sn, x * sn + z * cs];
    let a0 = Infinity, a1 = -Infinity, b0 = Infinity, b1 = -Infinity; for (const [x, z] of zone) { const [a, b] = L(x, z); a0 = Math.min(a0, a); a1 = Math.max(a1, a); b0 = Math.min(b0, b); b1 = Math.max(b1, b); }
    const PA = 66, PB = 50, ST = 13;
    for (let a = Math.floor(a0 / PA) * PA; a < a1; a += PA) for (let b = Math.floor(b0 / PB) * PB; b < b1; b += PB) {
      const ca = a + PA / 2, cb = b + PB / 2, la = PA - ST, lb = PB - ST, corners = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([p, q]) => W(ca + p * la / 2, cb + q * lb / 2)), [cx, cz] = W(ca, cb);
      if (!corners.every(([x, z]) => inside(zone, x, z))) continue;
      if (towers.some(([tx, tz]) => Math.hypot(tx - cx, tz - cz) < 52)) continue;
      const kind = r(), far = Math.hypot(cx - 80, cz + 40) > 520;
      if (kind < 0.09) { parks.push({ outer: corners }); const n = far ? 5 : 9; for (let i = 0; i < n; i++) { const [x, z] = W(ca + (r() - 0.5) * (la - 6), cb + (r() - 0.5) * (lb - 6)); blobs.push([x, z, 7 + r() * 5]); } continue; }
      lots.push({ outer: corners }); solid(cx, cz, angle, la - 1, 24, lb - 1);
      for (const [p, q] of [[-1, -0.3], [1, 0.3]]) { const [x, z] = W(ca + p * (la / 2 + 2.2), cb + q * lb); if (inside(zone, x, z)) blobs.push([x, z, 6 + r() * 3]); }    // street trees
      v.frame(cx, cz, angle);
      const block = (m, x, z, sx, sz, h, top = roof) => { v.box(m, x, h / 2, z, sx, h, sz, 'UD').box(top, x, h + 0.2, z, sx + 0.5, 0.4, sz + 0.5); return h; };
      const clutter = (x, z, sx, sz, h) => { const n = 1 + Math.floor(r() * 3); for (let i = 0; i < n; i++) { const px = x + (r() - 0.5) * (sx - 5), pz = z + (r() - 0.5) * (sz - 4); r() < 0.5 ? v.box(roof, px, h + 1.6, pz, 3.2, 2.6, 3) : v.cyl(tank, px, h + 0.4, pz, 1.1, 1.8, 10); } };
      if (kind < 0.42) {                                   // two or three slab blocks side by side
        const n = r() < 0.5 ? 2 : 3, m = F[Math.floor(r() * F.length)], h = 3 * (7 + Math.floor(r() * 6)), d = 12 + r() * 2;
        for (let i = 0; i < n; i++) { const z = (i - (n - 1) / 2) * (lb / n), sx = la - 6 - r() * 8; block(m, (r() - 0.5) * 4, z, sx, Math.min(d, lb / n - 3), h); if (!low) clutter((r() - 0.5) * 4, z, sx, d, h); }
      } else if (kind < 0.62) {                            // a shopping podium with one or two towers
        const ph = 3 * (2 + Math.floor(r() * 2)) + 4; block(SHOP[Math.floor(r() * 3)], 0, 0, la - 3, lb - 3, ph, roofDark);
        const m = T[Math.floor(r() * T.length)], n = r() < 0.55 ? 2 : 1;
        for (let i = 0; i < n; i++) { const x = (i - (n - 1) / 2) * la * 0.46, h = 3 * (16 + Math.floor(r() * 14)); v.box(m, x, ph + (h - ph) / 2, 0, 20, h - ph, 20, 'UD').box(m, x, ph + (h - ph) / 2 - 2, 0, 12, h - ph - 4, 26, 'UD').box(roof, x, h + 0.2, 0, 20.5, 0.4, 20.5).box(roof, x, h + 2.2, 0, 8, 4, 8); solid(cx + (W(x, 0)[0]), cz + (W(x, 0)[1]), angle, 20, h, 20); }
      } else if (kind < 0.86) {                            // an older quarter: small six-storey houses close together
        const nx = 4, nz = 3;
        for (let i = 0; i < nx; i++) for (let j = 0; j < nz; j++) { if (r() < 0.08) continue; const m = F[Math.floor(r() * F.length)], h = 3 * (4 + Math.floor(r() * 4)), sx = la / nx - 2.2, sz = lb / nz - 2.2;
          const x = (i - (nx - 1) / 2) * (la / nx), z = (j - (nz - 1) / 2) * (lb / nz); block(m, x, z, sx, sz, h, r() < 0.5 ? roof : roofDark); if (!low && r() < 0.6) v.cyl(tank, x + 2, h + 0.4, z - 1.5, 0.9, 1.5, 8); }
      } else {                                             // an office block with a low wing
        const h = 3 * (9 + Math.floor(r() * 8)); block(SHOP[Math.floor(r() * 3)], -la * 0.12, 0, la * 0.62, lb - 8, h, roofDark); block(F[Math.floor(r() * F.length)], la * 0.34, 0, la * 0.24, lb - 4, 12);
        if (!low) clutter(-la * 0.12, 0, la * 0.62, lb - 8, h);
      }
    }
    const g = v.build({ name: 'city-' + zi, castShadow: false }); ctx.add(g);
  });
  ctx.add(groundMesh(lots, 0.006, lot)).name = 'city-lots';
  if (parks.length) ctx.add(groundMesh(parks, 0.006, green)).name = 'city-parks';

  // ---- the ten towers of the earlier backdrop and a second row, now with podiums, crowns and lit windows
  { const v = new Batch();
    towers.forEach(([x, z, h], i) => { const m = T[i % T.length], a = Math.atan2(-U[1], U[0]) + 0.2 * (r() - 0.5);
      v.frame(x, z, a).box(SHOP[i % 3], 0, 4, 0, 44, 8, 34, 'UD').box(roofDark, 0, 8.2, 0, 44.5, 0.4, 34.5)
        .box(m, 0, 8 + (h - 8) / 2, 0, 30, h - 8, 20, 'UD').box(m, 0, 8 + (h - 14) / 2, 0, 14, h - 14, 32, 'UD').box(roof, 0, h + 0.2, 0, 30.5, 0.4, 20.5).box(roof, 0, h + 2, 0, 10, 4, 10).box(roofDark, 0, h + 4.6, 0, 3, 1.2, 3);
      solid(x, z, a, 44, h, 34); });
    ctx.add(v.build({ name: 'city-towers', castShadow: false })); }

  // ---- street trees and park trees: plain rounded crowns on short trunks, one draw call each
  if (blobs.length) {
    const geo = new THREE.IcosahedronGeometry(1, 1), p = geo.attributes.position; for (let i = 0; i < p.count; i++) p.setY(i, p.getY(i) * 0.8 + 0.9);
    const crowns = new THREE.InstancedMesh(geo, pbr('hedge', [0x35602c]), blobs.length), trunks = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.06, 0.08, 1, 5), pbr('bark'), blobs.length), M = new THREE.Matrix4();
    blobs.forEach(([x, z, h], i) => { const s = h * 0.36; crowns.setMatrixAt(i, M.makeScale(s * (0.9 + 0.3 * r()), s, s * (0.9 + 0.3 * r())).setPosition(x, h * 0.36, z)); trunks.setMatrixAt(i, M.makeScale(h * 0.4, h * 0.5, h * 0.4).setPosition(x, h * 0.25, z)); });
    crowns.name = 'city-trees'; crowns.frustumCulled = trunks.frustumCulled = false; ctx.add(crowns); ctx.add(trunks);
  }

  // ---- the metro depot east of the canal: boundary wall, gravel yard, sheds, sidings and trains
  { const v = new Batch(), e = CANAL.eastEdge, dx = e[1][0] - e[0][0], dz = e[1][1] - e[0][1], len = Math.hypot(dx, dz), ang = Math.atan2(-dz, dx), east = [dz / len, -dx / len];
    const along = (s, t) => [e[0][0] + dx / len * s + east[0] * t, e[0][1] + dz / len * s + east[1] * t];           // s from the north end, t east of the bank
    const s0 = (-250 - e[0][1]) / (dz / len), s1 = (262 - e[0][1]) / (dz / len);
    ctx.add(groundMesh([{ outer: [along(s0, 9), along(s0, DEPOT), along(s1, DEPOT), along(s1, 9)] }], 0.008, pbr('asphalt', [0x9a917f]))).name = 'depot-yard';
    const wall = pbr('cladding', [0xe4dccb, 1.2, 0.6, 0.7]), cap = mat('brickRed'), shedWall = pbr('cladding', [0xb9bdc0, 1.2, 0.6, 0.6]), shedRoof = pbr('cladding', [0xe9ebec, 0.45, 6, 0.45]), rail = plain('railsteel', 0x5a5450, 0.45, 0.8), sleeper = pbr('concrete', [0x8c8478]);
    const [mx, mz] = along((s0 + s1) / 2, 8.6), metro = carSide(), carRoof = plain('carroof', 0xc9cdd0, 0.5, 0.4);
    v.frame(mx, mz, ang).box(wall, 0, 1.3, 0, s1 - s0, 2.6, 0.3).box(cap, 0, 2.68, 0, s1 - s0, 0.16, 0.44); solid(mx, mz, ang, s1 - s0, 3, 0.4);
    for (const [x1, z1, x2, z2, w, h] of BACKDROP.sheds) {
      const L = Math.hypot(x2 - x1, z2 - z1), a = Math.atan2(-(z2 - z1), x2 - x1), cx = (x1 + x2) / 2, cz = (z1 + z2) / 2;
      v.frame(cx, cz, a).box(shedWall, 0, (h - 0.4) / 2, 0, L, h - 0.4, w).box(shedWall, 0, h + 0.05, 0, L, 0.9, w * 0.5).box(mat('glassDark'), 0, h - 2.4, 0, L - 2, 1.3, w + 0.06, 'UDEW');
      for (const s of [-1, 1]) v.setMatrix(new THREE.Matrix4().makeRotationY(a).multiply(new THREE.Matrix4().makeRotationX(s * 0.16)).setPosition(cx - Math.sin(a) * s * w / 4, h + 0.75, cz - Math.cos(a) * s * w / 4)).box(shedRoof, 0, 0, 0, L + 1.2, 0.16, w / 2 + 0.9);
      v.frame(cx, cz, a).box(shedRoof, 0, h + 2.1, 0, L - 8, 0.9, 2.4);                                              // ridge ventilator
      solid(cx, cz, a, L, h, w);
      // sidings: tracks running out of both ends of a shed, a train on some of them
      if (w > 20) for (let k = -2; k <= 2; k++) for (const end of [-1, 1]) {
        const off = k * 4.8, run = 70;
        v.frame(cx, cz, a); for (const q of [-0.72, 0.72]) v.box(rail, end * (L / 2 + run / 2), 0.09, off + q, run, 0.14, 0.07);
        if (!low) for (let s = 1; s < run; s += 1.3) v.box(sleeper, end * (L / 2 + s), 0.03, off, 0.24, 0.05, 2.4);
        if (r() < 0.42) { const first = Math.ceil((L / 2 + 6) / 19.5); for (let i = 0; i < 3; i++) { const x = end * (first + i + 0.5) * 19.5; v.box(metro, x, 2.15, off, 19.5, 3.7, 2.8, 'UD').box(carRoof, x, 4.06, off, 19.1, 0.14, 2.5).box(roofDark, x, 0.2, off, 15, 0.4, 2.2); } }
      }
    }
    ctx.add(v.build({ name: 'depot' })); }

  // ---- traffic on the main road: parked nowhere, simply standing in their lanes
  { const v = new Batch(), road = ROAD_LINES.find(q => q.kind === 'arterial');
    if (road) {
      const glass = plain('carglazing', 0x1b2228, 0.15, 0.7), tyre = plain('rubberblack', 0x1b1b1d, 0.85, 0), paints = [0xf2f2f0, 0xf2f2f0, 0xc9ccd0, 0x202124, 0x8c2a24, 0x2b4a7a, 0x6f7376, 0xe8e2d0].map((c, i) => plain('carpaint' + i, c, 0.3, 0.55)), busPaint = plain('buspaint', 0x3f8f4a, 0.4, 0.3), lamp = plain('headlamp', 0xfff4dd, 0.3, 0, { emissive: 0xfff0cc, emissiveIntensity: 0.9 }), tail = plain('taillamp', 0x7a0f0c, 0.4, 0, { emissive: 0xc0140f, emissiveIntensity: 0.7 });
      const a = Math.atan2(-U[1], U[0]), L0 = -560, L1 = 560, n = low ? 30 : 64;
      for (let i = 0; i < n; i++) {
        const side = r() < 0.5 ? 1 : -1, lane = [3.3, 6.9, 10.5][Math.floor(r() * 3)], s = L0 + (L1 - L0) * (i + r() * 0.7) / n, x = 67.8 + U[0] * s + N[0] * side * lane, z = -249.3 + U[1] * s + N[1] * side * lane, bus = r() < 0.08;
        v.frame(x, z, a + (side > 0 ? Math.PI : 0));          // local +X is the way the vehicle faces
        if (bus) { v.box(busPaint, 0, 1.7, 0, 11.5, 2.6, 2.5).box(glass, 0.1, 2.15, 0, 11.3, 0.9, 2.54).box(lamp, 5.76, 0.8, 0, 0.03, 0.18, 1.9).box(tail, -5.76, 0.9, 0, 0.03, 0.2, 1.9); for (const wx of [-3.6, 3.6]) for (const wz of [-1.1, 1.1]) v.box(tyre, wx, 0.48, wz, 0.96, 0.96, 0.32); }
        else { const p = paints[Math.floor(r() * paints.length)], suv = r() < 0.35, hh = suv ? 0.95 : 0.72;
          v.box(p, 0, 0.3 + hh / 2, 0, 4.5, hh, 1.82).box(p, -0.25, 0.3 + hh + 0.27, 0, suv ? 3.0 : 2.3, 0.54, 1.6).box(glass, -0.25, 0.3 + hh + 0.28, 0, (suv ? 3.0 : 2.3) + 0.04, 0.4, 1.64).box(glass, -0.25, 0.3 + hh + 0.28, 0, (suv ? 3.0 : 2.3) - 0.5, 0.44, 1.66)
            .box(lamp, 2.26, 0.3 + hh * 0.62, 0, 0.03, 0.14, 1.5).box(tail, -2.26, 0.3 + hh * 0.66, 0, 0.03, 0.14, 1.5);
          for (const wx of [-1.4, 1.4]) for (const wz of [-0.82, 0.82]) v.box(tyre, wx, 0.33, wz, 0.66, 0.66, 0.24); }
      }
      ctx.add(v.build({ name: 'traffic' }));
    } }

  // ---- far blocks in the haze beyond the square the streets cover
  { const v = new Batch(), m = plain('fartown', 0x9aa4ad, 0.9, 0), n = low ? 160 : 340, far = plain('farground', 0x8b9084, 1, 0), [x0, z0] = SQ[0], [x1, z1] = SQ[2], E = 2600;
    v.frame().box(far, (x0 - E + x0) / 2, -0.3, 21, E, 0.4, 2 * E + 1500, 'D').box(far, (x1 + x1 + E) / 2, -0.3, 21, E, 0.4, 2 * E + 1500, 'D').box(far, 14, -0.3, (z0 - E + z0) / 2, x1 - x0, 0.4, E, 'D').box(far, 14, -0.3, (z1 + z1 + E) / 2, x1 - x0, 0.4, E, 'D');
    // slim towers in clusters, all square to one of two street grids, so that they read as a skyline and not as loose boxes
    for (let i = 0; i < n; i++) { const a = r() * 6.283, d = 900 + r() * 1300, x = 14 + Math.cos(a) * d, z = 21 + Math.sin(a) * d; if (x > x0 - 30 && x < x1 + 30 && z > z0 - 30 && z < z1 + 30) continue;
      const k = 1 + Math.floor(r() * 4), grid = r() < 0.5 ? 0.58 : 0.1;
      for (let j = 0; j < k; j++) { const h = 30 + r() * r() * 150, w = 18 + r() * 16; v.frame(x + (j % 2) * 46, z + Math.floor(j / 2) * 52, grid).box(m, 0, h / 2, 0, w, h, w * (0.7 + 0.5 * r()), 'D'); } }
    ctx.add(v.build({ name: 'far-town', castShadow: false })); }

  const cg = new THREE.Group(); for (const m of colliders) { cg.add(m); } cg.visible = false; ctx.add(cg); colliders.forEach(m => ctx.collide(m));

  // lit windows after dusk
  if (ctx.animate) ctx.animate((dt, t, env) => { const n = env && env.lighting && env.lighting.night ? env.lighting.night() : 0; if (lit[0].emissiveIntensity !== n) for (const m of lit) m.emissiveIntensity = n; });
}
