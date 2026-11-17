// Plaza canopy (2018 footage, frames 5-10; 2022 dusk aerial): one large flat roof of pale panels with a square grid on
// a white triangulated steel space frame about 2.5 m deep, at the roof level of the neighbouring five-storey blocks,
// with no columns in the middle of the plaza. Below it: paving with a patterned band and three round stepped planters
// with palms along the west side.
// ASSUMED: module size of the frame (4 m), the perimeter columns (in reality it bears on the neighbouring buildings),
// the exact paving pattern and planter sizes.
import { THREE, mat, flat, bbox } from '../../kit.js';
import { Batch } from '../../batch.js';
import { palm } from '../../plants.js';

let panel;
export function build(item, ctx) {
  const b = bbox(item.points), H = item.height, depth = 2.5, yT = H - 0.3, yB = yT - depth, M = 4;
  const nx = Math.round(b.sx / M), nz = Math.round(b.sz / M), mx = b.sx / nx, mz = b.sz / nz;
  if (!panel) {
    const cv = document.createElement('canvas'); cv.width = cv.height = 128; const g = cv.getContext('2d');
    g.fillStyle = '#e4e3dc'; g.fillRect(0, 0, 128, 128); g.strokeStyle = '#a9a8a0'; g.lineWidth = 3; g.strokeRect(1, 1, 126, 126);
    const t = new THREE.CanvasTexture(cv); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(1 / 2, 1 / 2); t.colorSpace = THREE.SRGBColorSpace;
    panel = new THREE.MeshStandardMaterial({ map: t, roughness: 0.6 });
  }
  const v = new Batch().frame(b.w, b.n);
  v.slab(panel, -0.6, yT, -0.6, b.sx + 1.2, 0.3, b.sz + 1.2);
  const W = 'metalWhite', top = (i, k) => [b.w + i * mx, yT, b.n + k * mz], bot = (i, k) => [b.w + (i + 0.5) * mx, yB, b.n + (k + 0.5) * mz];
  for (let i = 0; i <= nx; i++) v.strut(W, top(i, 0), top(i, nz), 0.12);
  for (let k = 0; k <= nz; k++) v.strut(W, top(0, k), top(nx, k), 0.12);
  for (let i = 0; i < nx; i++) v.strut(W, bot(i, 0), bot(i, nz - 1), 0.12);
  for (let k = 0; k < nz; k++) v.strut(W, bot(0, k), bot(nx - 1, k), 0.12);
  for (let i = 0; i < nx; i++) for (let k = 0; k < nz; k++) for (const [di, dk] of [[0, 0], [1, 0], [0, 1], [1, 1]]) v.strut(W, bot(i, k), top(i + di, k + dk), 0.08);
  // perimeter columns
  const c = new Batch(), cols = [];
  for (let i = 0; i <= nx; i += 2) cols.push([b.w + i * mx, b.n], [b.w + i * mx, b.s]);
  for (let k = 2; k < nz; k += 2) cols.push([b.w, b.n + k * mz], [b.e, b.n + k * mz]);
  for (const [x, z] of cols) { v.frame(x, z).cyl(W, 0, 0, 0, 0.3, yT, 12); c.frame(x, z).box('generic', 0, yT / 2, 0, 0.6, yT, 0.6); }
  // floor: paving, a striped band along the west side, three stepped planters with palms
  ctx.add(flat([[b.w, b.n], [b.e, b.n], [b.e, b.s], [b.w, b.s]], 0.04, mat('paving')));
  v.frame(b.w, b.n);
  for (let k = 0; k < Math.floor(b.sz / 0.8); k++) v.slab(k % 2 ? 'black' : 'white', 2.2, 0.04, k * 0.8, 1.6, 0.02, 0.8, 'D');
  for (const f of [0.22, 0.5, 0.78]) {
    const px = 6.5, pz = b.sz * f;
    v.frame(b.w + px, b.n + pz).cyl('wallWhite', 0, 0, 0, 2.3, 0.45, 20).cyl('wallWhite', 0, 0.45, 0, 1.6, 0.45, 20).cyl('lawn', 0, 0.9, 0, 1.45, 0.05, 20);
    c.frame(b.w + px, b.n + pz).box('generic', 0, 0.45, 0, 3.2, 0.9, 3.2);
    palm(v, b.w + px, b.n + pz, 7, 0.9);
  }
  ctx.add(v.build({ name: item.id }));
  const cg = c.build(); ctx.add(cg).visible = false; cg.children.forEach(m => ctx.collide(m));
}
