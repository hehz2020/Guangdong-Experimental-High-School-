// Long curved building north of the teaching core. Concave (south) face per the 2022 footage ("一本书的梦", frames 9-18):
// red brick end walls, cream horizontal spandrel bands, four rows of ribbon windows with air-conditioner units on small
// ledges, and a white concrete pergola with planting on the roof.
// ASSUMED: the convex (north) face, which no reference shows (given the same bands and windows); bay widths; the
// pergola layout. The wedge-shaped roof on tall columns at the west end (2018 footage) is simplified to a raised slab.
// Exterior only. The outline is a band built from a centreline: the first half of the points is one long edge, the
// second half the other edge reversed.
import { mat, prism } from '../../kit.js';
import { Batch } from '../../batch.js';

export function build(item, ctx) {
  const pts = item.points, n = pts.length / 2, H = item.height, roofY = H - 3.0, floors = 4, FH = roofY / floors;
  const A = pts.slice(0, n), Bq = pts.slice(n).reverse();              // A[i] and Bq[i] face each other across the building
  const cz = pts.reduce((s, p) => s + p[1], 0) / pts.length;
  const south = (A.reduce((s, p) => s + p[1], 0) / n) > (Bq.reduce((s, p) => s + p[1], 0) / n) ? A : Bq, north = south === A ? Bq : A;
  ctx.add(prism(pts, 0, roofY, mat('wallCream')));
  const v = new Batch();
  const face = (edge, outward) => {
    for (let i = 0; i < edge.length - 1; i++) {
      const [x0, z0] = edge[i], [x1, z1] = edge[i + 1], len = Math.hypot(x1 - x0, z1 - z0), a = Math.atan2(-(z1 - z0), x1 - x0);
      // local +Z of the frame points to the right of the direction of travel; flip so that windows sit on the outward side
      const mx = (x0 + x1) / 2, mz = (z0 + z1) / 2, rightX = Math.sin(a), rightZ = Math.cos(a);
      const out = ((mx + rightX) - outward[0]) ** 2 + ((mz + rightZ) - outward[1]) ** 2 < ((mx - rightX) - outward[0]) ** 2 + ((mz - rightZ) - outward[1]) ** 2 ? 1 : -1;   // +1: local +Z points outward
      v.frame(x0, z0, a);
      const zf = out > 0 ? 0.02 : -0.1;
      for (let k = 0; k < floors; k++) {
        v.slab('glassDark', 0.3, k * FH + 1.0, zf, len - 0.6, FH - 1.9, 0.08);
        for (let d = 2.2; d < len - 0.5; d += 2.2) v.slab('metalWhite', d, k * FH + 1.0, zf - 0.01, 0.07, FH - 1.9, 0.1);
        for (let d = 1.6; d < len - 1.5; d += 4.4) v.slab('wallWhite', d, k * FH + 0.25, out > 0 ? 0.1 : -0.75, 0.9, 0.6, 0.65);     // air-conditioner units on ledges
      }
    }
  };
  // centre of the arc's far side tells each face which way is outward
  const mid = edge => edge[Math.floor(edge.length / 2)];
  face(south, [mid(south)[0], mid(south)[1] + 30]); face(north, [mid(north)[0], mid(north)[1] - 30]);
  // red brick end walls
  for (const [p, q] of [[A[0], Bq[0]], [A[n - 1], Bq[n - 1]]]) {
    const len = Math.hypot(q[0] - p[0], q[1] - p[1]), a = Math.atan2(-(q[1] - p[1]), q[0] - p[0]);
    v.frame(p[0], p[1], a).slab('brickRed', -0.3, 0, -0.35, len + 0.6, roofY + 1.0, 0.7);
  }
  // roof pergola: posts along both edges, beams across, planting boxes
  for (let i = 0; i < n; i++) {
    const p = A[i], q = Bq[i];
    v.strut('wallWhite', [p[0], roofY + 3.0, p[1]], [q[0], roofY + 3.0, q[1]], 0.3);
    for (const e of [p, q]) v.frame(e[0], e[1]).box('wallWhite', 0, roofY + 1.5, 0, 0.35, 3.0, 0.35);
    if (i < n - 1) { v.strut('wallWhite', [p[0], roofY + 3.0, p[1]], [A[i + 1][0], roofY + 3.0, A[i + 1][1]], 0.3).strut('wallWhite', [q[0], roofY + 3.0, q[1]], [Bq[i + 1][0], roofY + 3.0, Bq[i + 1][1]], 0.3);
      const mx = (p[0] + q[0] + A[i + 1][0] + Bq[i + 1][0]) / 4, mz = (p[1] + q[1] + A[i + 1][1] + Bq[i + 1][1]) / 4;
      v.frame(mx, mz).box('lawn', 0, roofY + 0.5, 0, 6, 1.0, 5).box('wallWhite', 0, roofY + 0.2, 0, 6.4, 0.4, 5.4); }
  }
  v.frame(0, 0);
  ctx.add(v.build({ name: item.id }));
  const body = prism(pts, 0, roofY, mat('generic')); body.visible = false; ctx.add(body); ctx.collide(body);
  void cz;
}
