// Covered walkway: a thin roof on slender columns, open underneath.
// ASSUMED: that it is a ground-level covered walk (the footage shows a white walkway with parapets leaving the south
// slab; whether it is roofed, or an elevated deck, was not established).
import { mat, prism } from '../../kit.js';
import { Batch } from '../../batch.js';

export function build(item, ctx) {
  const pts = item.points, n = pts.length / 2, H = Math.max(3.2, item.height);
  ctx.add(prism(pts, H - 0.35, H, mat('wallWhite')));
  const v = new Batch(), c = new Batch();
  for (let i = 0; i < n; i++) for (const p of [pts[i], pts[pts.length - 1 - i]]) {
    const q = pts[i] === p ? pts[pts.length - 1 - i] : pts[i], x = p[0] + (q[0] - p[0]) * 0.08, z = p[1] + (q[1] - p[1]) * 0.08;
    v.frame(x, z).box('metalWhite', 0, (H - 0.35) / 2, 0, 0.22, H - 0.35, 0.22); c.frame(x, z).box('generic', 0, (H - 0.35) / 2, 0, 0.22, H - 0.35, 0.22);
  }
  ctx.add(v.build({ name: item.id }));
  const cg = c.build(); ctx.add(cg).visible = false; cg.children.forEach(m => ctx.collide(m));
}
