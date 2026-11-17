// Open seating strip in front of the grandstand, facing east toward the track: stepped concrete tiers with rows of
// individual seats, white end parapets. Seats are all blue, the 2022 state (in 2018 they were blue, red and green blocks).
// ASSUMED: number of tiers and their rise, aisle spacing. The tiers are walkable: collision is one inclined plate.
import { THREE, bbox } from '../../kit.js';
import { Batch } from '../../batch.js';

export function build(item, ctx) {
  const b = bbox(item.points), W = b.sx, D = b.sz, H = item.height, rows = 8, depth = W / rows, rise = (H - 0.6) / (rows - 1);
  const v = new Batch().frame(b.w, b.n);
  for (let r = 0; r < rows; r++) {
    const x = W - (r + 1) * depth, y = 0.6 + r * rise;
    v.slab('concrete', x, 0, 0, depth, y, D);
    for (let z = 0.8; z < D - 1; z += 0.56) { if (Math.floor(z / 13.5) !== Math.floor((z + 1.5) / 13.5)) continue;       // leave aisles
      v.slab('seatBlue', x + 0.3, y, z, 0.42, 0.1, 0.44).slab('seatBlue', x + 0.28, y + 0.1, z, 0.06, 0.36, 0.44); }
  }
  v.slab('wallWhite', 0, 0, -0.2, W, H + 0.9, 0.2).slab('wallWhite', 0, 0, D, W, H + 0.9, 0.2).slab('wallWhite', W, 0, 0, 0.15, 1.1, D);
  for (let z = 13.5; z < D; z += 13.5) for (let s = 0; s < 4; s++) v.slab('concrete', W + 0.15 + (3 - s) * 0.3, 0, z - 0.75, 0.3, 0.15 * (s + 1), 1.5);   // access steps from the apron
  ctx.add(v.build({ name: item.id }));
  // collision: one ramp from the apron up to the back row, plus the end walls
  const run = W + 1.4, len = Math.hypot(run, H), ramp = new THREE.Mesh(new THREE.BoxGeometry(len, 0.3, D));
  ramp.position.set(b.w + W / 2 + 0.7, H / 2 - 0.15, b.cz); ramp.rotation.z = -Math.atan2(H, run); ramp.visible = false;   // rises toward the west
  ctx.add(ramp); ctx.collide(ramp);
  const c = new Batch().frame(b.w, b.n).slab('generic', 0, 0, -0.2, W, H + 0.9, 0.2).slab('generic', 0, 0, D, W, H + 0.9, 0.2).build();
  ctx.add(c).visible = false; c.children.forEach(m => ctx.collide(m));
}
