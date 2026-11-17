// Glazed stair core: green-tinted curtain wall in a white grid, zigzag stair flights visible inside, flat grey roof
// with a white parapet box, dark-red strips on the short ends (2018 footage, frames 5-10 and 58).
// ASSUMED: pane sizes, the flights' exact arrangement. Not enterable.
import { THREE, bbox, itemPolygon } from '../../kit.js';
import { Batch } from '../../batch.js';

const FH = 3.9;
let glass;
export function build(item, ctx) {
  glass = glass || new THREE.MeshStandardMaterial({ color: 0x6fb39c, roughness: 0.08, metalness: 0.3, transparent: true, opacity: 0.5, depthWrite: false });
  const b = bbox(itemPolygon(item)), H = item.height, long = b.sx >= b.sz;
  const L = long ? b.sx : b.sz, D = long ? b.sz : b.sx;                         // L along the long side
  const v = new Batch().frame(long ? b.w : b.e, b.n, long ? 0 : -Math.PI / 2);   // local x along the long side
  const floors = Math.max(2, Math.round((H - 1) / FH)), panes = Math.max(2, Math.round(L / 2));
  for (const z of [0, D - 0.12]) {
    for (let i = 0; i <= panes; i++) v.slab('metalWhite', i * (L - 0.14) / panes, 0, z, 0.14, H - 0.6, 0.12);
    for (let k = 0; k <= floors; k++) v.slab('metalWhite', 0, Math.min(k * FH, H - 0.85), z, L, 0.25, 0.12);
    v.slab(glass, 0.07, 0.25, z + 0.04, L - 0.14, H - 1.1, 0.03);
  }
  for (const x of [0, L - 0.3]) { v.slab('wallWhite', x, 0, 0, 0.3, H - 0.6, D); v.slab('wallMaroon', x === 0 ? -0.03 : L - 0.01, 1, D * 0.25, 0.04, H - 3, D * 0.5); }
  v.slab('roofGrey', -0.2, H - 0.6, -0.2, L + 0.4, 0.25, D + 0.4).slab('wallWhite', L * 0.3, H - 0.35, D * 0.2, L * 0.4, 0.9, D * 0.6);
  // zigzag flights seen through the glass (visual only)
  for (let k = 0; k < floors; k++) {
    const y = k * FH, x0 = 0.6, x1 = L - 0.6, w = D / 2 - 0.3;
    v.quad('concrete', [x0, y, 0.25], [x0, y, 0.25 + w], [x1, y + FH / 2, 0.25 + w], [x1, y + FH / 2, 0.25]);
    v.quad('concrete', [x1, y + FH / 2, D - 0.25 - w], [x1, y + FH / 2, D - 0.25], [x0, y + FH, D - 0.25], [x0, y + FH, D - 0.25 - w]);
  }
  ctx.add(v.build({ name: item.id }));
  const c = new Batch().frame(long ? b.w : b.e, b.n, long ? 0 : -Math.PI / 2).slab('generic', 0, 0, 0, L, H, D).build();
  ctx.add(c).visible = false; c.children.forEach(m => ctx.collide(m));
}
