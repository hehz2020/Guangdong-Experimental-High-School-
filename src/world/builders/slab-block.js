// Long six-storey blocks south-east of the gymnasium (their use is not established). Per the 2018 footage (frames 2-9,
// 29-30, 49-51): white frame, piers and a continuous top fascia; dark-red recessed bays with white-framed windows and
// balconies; white end walls with short horizontal slot windows. Block A north carries red characters on its fascia, of
// which only 面向世界 was reasonably legible, so only that is shown; its east end is a taller glazed section behind slender
// full-height white columns.
// ASSUMED: bay width, storey height (3.3 m), the south faces (given the same treatment). Exterior only.
// The long axis is taken from the outline, so the rotated block is handled too.
import { Batch } from '../../batch.js';
import { signPlane } from '../../signs.js';

export function build(item, ctx) {
  const p = item.points, e01 = Math.hypot(p[1][0] - p[0][0], p[1][1] - p[0][1]), e12 = Math.hypot(p[2][0] - p[1][0], p[2][1] - p[1][1]);
  const [o, q] = e01 >= e12 ? [p[0], p[1]] : [p[1], p[2]], L = Math.max(e01, e12), D = Math.min(e01, e12);
  const a = Math.atan2(-(q[1] - o[1]), q[0] - o[0]), H = item.height, floors = 6, FH = (H - 1.4) / floors, bay = 3.6, nb = Math.floor((L - 1.2) / bay), x0 = (L - nb * bay) / 2;
  // which side of the edge o->q is the building on: test the next vertex
  const far = e01 >= e12 ? p[2] : p[3], side = (Math.sin(a) * (far[0] - o[0]) + Math.cos(a) * (far[1] - o[1])) > 0 ? 1 : -1;
  const v = new Batch().frame(o[0], o[1], a), zA = side > 0 ? 0 : -D;       // building spans local z from zA to zA + D
  v.slab('wallWhite', 0, 0, zA, L, H - 1.4, D).slab('wallWhite', -0.2, H - 1.4, zA - 0.2, L + 0.4, 1.4, D + 0.4).slab('roofGrey', 0.2, H - 0.3, zA + 0.2, L - 0.4, 0.31, D - 0.4);
  for (const z of [zA - 0.03, zA + D - 0.02]) for (let k = 0; k < floors; k++) for (let j = 0; j < nb; j++) {
    const x = x0 + j * bay + 0.35, w = bay - 0.7, y = k * FH;
    v.slab('wallMaroon', x, y + 0.15, z, w, FH - 0.3, 0.05).slab('glassDark', x + 0.3, y + 1.0, z - 0.01, w - 0.6, FH - 1.9, 0.07).slab('metalWhite', x, y + 0.15, z - 0.03, w, 0.9, 0.06);
  }
  for (const x of [-0.03, L - 0.02]) for (let k = 0; k < floors; k++) v.slab('glassDark', x, k * FH + 1.6, zA + D * 0.3, 0.05, 0.5, D * 0.4);
  if (item.id === 'dorm-a-north-slab') {                                    // east end: glazed section behind tall slender columns
    const xe = a === 0 || Math.cos(a) > 0 ? L : 0, dir = xe === 0 ? -1 : 1;
    v.slab('glassTeal', xe - (dir > 0 ? 22 : -0), 0, zA - 0.5, 22, H + 1.5, 0.3);
    for (let i = 0; i < 6; i++) v.cyl('wallWhite', xe - dir * (2 + i * 3.8), 0, zA - 2.2, 0.28, H + 1.5, 10);
    v.slab('wallWhite', xe - (dir > 0 ? 23 : -0), H + 1.5, zA - 3, 23, 0.4, 4);
  }
  ctx.add(v.build({ name: item.id }));
  if (item.id === 'dorm-a-north-slab') {
    const mx = o[0] + Math.cos(a) * L * 0.35 - Math.sin(a) * (zA - 0.25), mz = o[1] - Math.sin(a) * L * 0.35 - Math.cos(a) * (-(zA - 0.25));
    ctx.add(signPlane('面向世界', mx, H - 0.7, o[1] + zA - 0.26, 9, Math.PI));
    void mz;
  }
  const c = new Batch().frame(o[0], o[1], a).slab('generic', 0, 0, zA, L, H, D).build();
  ctx.add(c).visible = false; c.children.forEach(m => ctx.collide(m));
}
