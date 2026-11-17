// Fallback massing for any item that has no dedicated builder yet: a plain prism at the estimated height.
import { mat, prism, flat, bbox, itemPolygon, box } from '../../kit.js';

const GROUND = { road: 'asphalt', pavement: 'paving', plaza: 'paving', garden: 'lawn', water: 'water' };

export function build(item, ctx) {
  const pts = itemPolygon(item);
  if (item.height <= 0) {                                   // ground surfaces
    ctx.add(flat(pts, item.style === 'water' ? 0.01 : 0.03, mat(GROUND[item.style] || 'paving')));
    return;
  }
  if (item.walkUnder) {                                     // roof on corner posts, open underneath
    ctx.add(prism(pts, item.height - 1.2, item.height, mat('roofPale')));
    const b = bbox(pts);
    for (const [x, z] of [[b.w + 0.6, b.n + 0.6], [b.e - 0.6, b.n + 0.6], [b.e - 0.6, b.s - 0.6], [b.w + 0.6, b.s - 0.6]]) {
      const post = box(x, z, 0.6, 0.6, 0, item.height - 1.2, mat('metalWhite')); ctx.add(post); ctx.collide(post);
    }
    return;
  }
  const body = prism(pts, 0, item.height, mat(item.solid ? 'generic' : 'roofPale'));
  ctx.add(body);
  if (item.solid) ctx.collide(body);
}
