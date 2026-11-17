// Gymnasium east of the track (2018 footage frames 8-10, 20-21, 43, 49-54, 58, 67-71; 2022 sports-day frames 13-21):
// one tall hall under a shallow cream barrel vault whose crown runs north-south, with wide overhanging eaves.
// West face toward the track: white columns, a low white stepped platform, three dark-red wall panels with the slogan
// in gold on the long centre one, a band of teal glazing above and dark clerestory panes above that. East face: tall
// slender columns carrying the eave over a forecourt. South face: dark-red brick with white pilasters.
// ASSUMED: every dimension of the facade elements; the east face detail; the whole interior (wooden floor, court lines,
// bleachers) - no interior view exists. The west doorways are left open so the hall can be entered.
import { THREE, bbox } from '../../kit.js';
import { Batch } from '../../batch.js';
import { signPlane, emblemTexture } from '../../signs.js';

let roofMat;
export function build(item, ctx) {
  roofMat = roofMat || new THREE.MeshStandardMaterial({ color: 0xe9e2cf, roughness: 0.45, metalness: 0.25, side: THREE.DoubleSide });
  const b = bbox(item.points), L = b.sx, D = b.sz, top = item.height, eave = top - 4, T = 0.4;
  const v = new Batch().frame(b.w, b.n), c = new Batch().frame(b.w, b.n);
  const both = (m, ...a) => { v.slab(m, ...a); c.slab('generic', ...a); };
  // barrel vault: arch across the east-west width, constant along north-south, overhanging on all sides
  const N = 18, x0 = -3.5, x1 = L + 3.5, arch = x => eave + (top - eave) * (1 - ((x - L / 2) / (L / 2 + 3.5)) ** 2);
  for (let i = 0; i < N; i++) {
    const xa = x0 + (x1 - x0) * i / N, xb = x0 + (x1 - x0) * (i + 1) / N;
    v.quad(roofMat, [xa, arch(xa), D + 2], [xb, arch(xb), D + 2], [xb, arch(xb), -2], [xa, arch(xa), -2]);
    for (const z of [0, D - T]) v.quad('glassDark', [xa, eave - 0.05, z + T / 2], [xb, eave - 0.05, z + T / 2], [xb, arch(xb) - 0.15, z + T / 2], [xa, arch(xa) - 0.15, z + T / 2]);
  }
  // south and north walls: brick with white pilasters
  for (const z of [0, D - T]) { both('brickRed', 0, 0, z, L, eave, T); for (let i = 0; i <= 12; i++) v.slab('wallWhite', i * (L - 0.6) / 12, 0, z === 0 ? -0.12 : D - 0.02, 0.6, eave, 0.14); }
  // east wall: cream panels, a glazed gallery band, slender columns carrying the eave over the forecourt
  both('wallCream', L - T, 0, 0, T, eave, D);
  v.slab('glassDark', L - 0.02, 5.2, 2, 0.05, 2.6, D - 4).slab('glassDark', L - 0.02, 0.4, 2, 0.05, 2.6, D - 4);
  for (let i = 0; i <= 9; i++) { const z = 1 + i * (D - 2) / 9; v.frame(b.w + L + 3, b.n + z).cyl('metalWhite', 0, 0, 0, 0.28, eave, 12); c.frame(b.w + L + 3, b.n + z).box('generic', 0, eave / 2, 0, 0.5, eave, 0.5); }
  v.frame(b.w, b.n); c.frame(b.w, b.n);
  // west wall toward the track: three red panels with door gaps, teal glazing, dark clerestory
  const panels = [[5, 13], [16.5, D - 16.5], [D - 13, D - 5]], wallTop = 4.4;
  both('brickRed', 0, 0, 0, T, eave, 5); both('brickRed', 0, 0, D - 5, T, eave, 5);
  for (const [za, zb] of panels) both('wallMaroon', 0, 0, za, T, wallTop, zb - za);
  for (const [za, zb] of [[13, 16.5], [D - 16.5, D - 13]]) { both('wallMaroon', 0, 2.6, za, T, wallTop - 2.6, zb - za); v.slab('metalWhite', 0.1, 0, za, 0.08, 2.6, 0.1).slab('metalWhite', 0.1, 0, zb - 0.1, 0.08, 2.6, 0.1); }
  v.slab('glassTeal', 0.15, wallTop, 5, 0.05, 3.2, D - 10).slab('glassDark', 0.15, wallTop + 3.2, 5, 0.05, eave - wallTop - 3.9, D - 10).slab('wallWhite', 0, eave - 0.7, 5, T, 0.7, D - 10);
  c.slab('generic', 0, wallTop, 5, T, eave - wallTop, D - 10);
  for (let i = 0; i <= 16; i++) v.slab('metalWhite', 0.08, wallTop, 5 + i * (D - 10.1) / 16, 0.12, eave - wallTop - 0.7, 0.1);
  v.slab('metalWhite', 0.08, wallTop + 3.2, 5, 0.12, 0.12, D - 10);
  for (let i = 0; i < 7; i++) { const z = 6 + i * (D - 12) / 6; v.frame(b.w - 1.6, b.n + z).cyl('wallWhite', 0, 0.45, 0, 0.42, eave - 0.45, 14); c.frame(b.w - 1.6, b.n + z).box('generic', 0, eave / 2, 0, 0.8, eave, 0.8); v.frame(b.w, b.n).slab('black', -1.75, 6.6, z - 0.25, 0.3, 0.3, 0.5); }
  v.frame(b.w, b.n); c.frame(b.w, b.n);
  both('wallWhite', -4.2, 0, 4, 4.2, 0.22, D - 8); both('wallWhite', -3.0, 0.22, 4, 3.0, 0.23, D - 8);
  for (const z of [4, D - 5.2]) both('wallWhite', -3.0, 0.45, z, 1.2, 0.8, 1.2);
  // interior (assumed): wooden floor with court lines, bleachers along the east side
  v.slab('wood', T, 0, T, L - 2 * T, 0.05, D - 2 * T, 'D');
  const fx = L / 2 - 6, fz = D / 2;
  for (const [x, z, sx, sz] of [[fx - 14, fz - 7.5, 28, 0.08], [fx - 14, fz + 7.5, 28, 0.08], [fx - 14, fz - 7.5, 0.08, 15], [fx + 14, fz - 7.5, 0.08, 15.08], [fx, fz - 7.5, 0.08, 15]]) v.slab('white', x, 0.05, z, sx, 0.01, sz, 'D');
  for (let r = 0; r < 8; r++) both('concrete', L - T - 9 + r * 1.1, 0, 4, 1.1, 0.45 * (r + 1), D - 8);
  for (let r = 0; r < 8; r++) v.slab('seatBlue', L - T - 9 + r * 1.1 + 0.3, 0.45 * (r + 1), 4.3, 0.5, 0.12, D - 8.6);
  ctx.add(v.build({ name: item.id }));
  // slogan in gold on the long centre panel, facing west, read from north to south
  const zc = b.n + D / 2, x = b.w - 0.03, y = 2.5, w = (panels[1][1] - panels[1][0]) * 0.4;
  ctx.add(signPlane('今天我以省实为荣', x, y, zc - w / 2 - 1.6, w, -Math.PI / 2, { color: '#e2b23c', weight: 'bold', metal: true }));
  ctx.add(signPlane('明天省实以我为荣', x, y, zc + w / 2 + 1.6, w, -Math.PI / 2, { color: '#e2b23c', weight: 'bold', metal: true }));
  const em = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 2.2), new THREE.MeshStandardMaterial({ map: emblemTexture(null), transparent: true, roughness: 0.6 }));
  em.position.set(x, y, zc); em.rotation.y = -Math.PI / 2; ctx.add(em);
  const cg = c.build(); ctx.add(cg).visible = false; cg.children.forEach(m => ctx.collide(m));
}
