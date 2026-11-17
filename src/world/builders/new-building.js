// New comprehensive teaching building (2022 footage "一本书的梦", frames 19-27 and 55-58): lower two storeys in pale grey
// stone, four upper storeys in terracotta red with deep horizontal ribbon windows, a roof with a steel frame carrying red
// characters 广东实验中学.
// LOW CONFIDENCE: the outline is a single reading that could not separate a podium from the main bar, so this is a
// simplified mass on the whole outline. ASSUMED: that the sign stands on the west edge facing the garden; window bands on
// every face; no louvred end, portal, terrace or interior (the library seen in the footage is not modelled yet).
import { mat, prism, bbox } from '../../kit.js';
import { Batch } from '../../batch.js';
import { signPlane } from '../../signs.js';

export function build(item, ctx) {
  const pts = item.points, H = item.height, FH = H / 6, b = bbox(pts);
  ctx.add(prism(pts, 0, 2 * FH, mat('concrete'))); ctx.add(prism(pts, 2 * FH, H, mat('terracotta')));
  const v = new Batch();
  for (let i = 0; i < pts.length; i++) {
    const [x0, z0] = pts[i], [x1, z1] = pts[(i + 1) % pts.length], len = Math.hypot(x1 - x0, z1 - z0), a = Math.atan2(-(z1 - z0), x1 - x0);
    const mx = (x0 + x1) / 2 + Math.sin(a), mz = (z0 + z1) / 2 + Math.cos(a);                       // a point one metre to the right of the edge
    const out = Math.hypot(mx - b.cx, mz - b.cz) > Math.hypot((x0 + x1) / 2 - b.cx, (z0 + z1) / 2 - b.cz) ? 1 : -1;
    v.frame(x0, z0, a);
    for (let k = 0; k < 6; k++) v.slab('glassDark', 1.0, k * FH + 1.2, out > 0 ? 0.02 : -0.1, len - 2.0, FH - 2.3, 0.08);
  }
  // roof: parapet-free slab, steel sign frame on the west edge
  ctx.add(prism(pts, H, H + 0.15, mat('roofGrey')));
  v.frame(b.w, b.cz);
  for (let i = 0; i <= 6; i++) v.box('steel', 1.0, H + 2.0, -9 + i * 3, 0.12, 4.0, 0.12);
  v.box('steel', 1.0, H + 3.9, 0, 0.12, 0.12, 18.2);
  ctx.add(v.build({ name: item.id }));
  ctx.add(signPlane('广东实验中学', b.w + 0.9, H + 2.6, b.cz, 17, -Math.PI / 2));      // faces west toward the garden
  const body = prism(pts, 0, H, mat('generic')); body.visible = false; ctx.add(body); ctx.collide(body);
}
