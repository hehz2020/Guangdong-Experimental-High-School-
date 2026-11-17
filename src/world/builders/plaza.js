// Open paved plaza east of the canopy (2018 footage, frames 7-10): light paving with white dashed markings, small palms
// and a few short dark red-brown stone stelae along the east edge.
// ASSUMED: positions and counts of palms and stelae within the measured rectangle.
import { mat, flat, bbox } from '../../kit.js';
import { Batch } from '../../batch.js';
import { palm } from '../../plants.js';

export function build(item, ctx) {
  const b = bbox(item.points);
  ctx.add(flat(item.points, 0.04, mat('paving')));
  const v = new Batch(), c = new Batch();
  v.frame(b.w, b.n);
  for (let k = 0; k < Math.floor(b.sz / 2.4); k++) v.slab('white', b.sx * 0.45, 0.045, 1 + k * 2.4, 0.15, 0.01, 1.2, 'D');
  for (let i = 0; i < 4; i++) {
    const x = b.e - 1.2, z = b.n + b.sz * (0.15 + i * 0.23);
    v.frame(x, z).box('granite', 0, 0.7, 0, 0.5, 1.4, 0.5); c.frame(x, z).box('generic', 0, 0.7, 0, 0.5, 1.4, 0.5);
    palm(v, x - 1.8, z + 1.2, 3.2);
  }
  ctx.add(v.build({ name: item.id }));
  const cg = c.build(); ctx.add(cg).visible = false; cg.children.forEach(m => ctx.collide(m));
}
