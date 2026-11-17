// Lower wing between the two slabs' east ends, carrying the rooftop school-name sign (2018 footage, frames 4-6):
// a white screen wall about one storey tall with large individual red characters 广东实验中学, read left to right and
// facing north / north-north-east, with a flat grey slab projecting in front of and below it.
// ASSUMED: the wing's own facades (plain white with window bands); the sign wall stands on the wing's north edge.
import { bbox } from '../../kit.js';
import { Batch } from '../../batch.js';
import { signPlane } from '../../signs.js';

export function build(item, ctx) {
  const b = bbox(item.points), H = item.height, wallH = 5.4;   // tall enough for the lettering to show over the north slab from the north-east, as in frame 5
  const v = new Batch().frame(b.w, b.n);
  v.slab('wallWhite', 0, 0, 0, b.sx, H, b.sz);
  for (let k = 0; k < Math.floor(H / 3.9); k++) {
    v.slab('glassDark', b.sx - 0.02, k * 3.9 + 1.0, 1.2, 0.05, 1.7, b.sz - 2.4).slab('wallMaroon', b.sx - 0.01, k * 3.9 + 0.15, 1.2, 0.03, 0.8, b.sz - 2.4);
    for (let i = 1; i < 6; i++) v.slab('metalWhite', b.sx, k * 3.9 + 1.0, 1.2 + i * (b.sz - 2.4) / 6, 0.06, 1.7, 0.08);
  }
  v.slab('roofGrey', -0.1, H, -1.6, b.sx + 0.2, 0.2, b.sz + 1.7);                                  // roof, projecting north in front of the sign
  v.slab('wallWhite', 0, H + 0.2, 0, b.sx, wallH, 0.3);                                            // sign wall along the north edge
  v.slab('red', 0, H + 0.25, -0.08, b.sx, 0.12, 0.08);
  ctx.add(v.build({ name: item.id }));
  ctx.add(signPlane('广东实验中学', b.cx, H + 0.2 + wallH * 0.55, b.n - 0.03, b.sx * 0.94, Math.PI));   // faces north
  const c = new Batch().frame(b.w, b.n).slab('generic', 0, 0, 0, b.sx, H, b.sz).build();
  ctx.add(c).visible = false; c.children.forEach(m => ctx.collide(m));
}
