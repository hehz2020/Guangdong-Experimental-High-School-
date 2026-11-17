// Round building with a white observatory-type dome (2018 footage frames 2-3; 2022 "一本书的梦" frame 58): pale drum with
// small square windows widely spaced in at least three rows, a flat projecting ring, and a smooth shallow white dome.
// ASSUMED: number of windows per row, the split of the height between drum and dome. Exterior only.
import { THREE, mat } from '../../kit.js';
import { Batch } from '../../batch.js';

export function build(item, ctx) {
  const { cx, cz, radius: R } = item, H = item.height, drum = H - R * 0.55;
  const v = new Batch().frame(cx, cz);
  v.cyl('wallWhite', 0, 0, 0, R * 0.92, drum, 36).cyl('concrete', 0, drum, 0, R * 1.04, 0.35, 36);
  for (let row = 0; row < 4; row++) for (let i = 0; i < 14; i++) {
    const a = i / 14 * Math.PI * 2, y = 2.2 + row * (drum - 4) / 4;
    v.frame(cx + Math.cos(a) * R * 0.93, cz + Math.sin(a) * R * 0.93, -a + Math.PI / 2).box('glassDark', 0, y + 0.6, 0, 1.2, 1.2, 0.08);
  }
  ctx.add(v.build({ name: item.id }));
  const dome = new THREE.Mesh(new THREE.SphereGeometry(R * 0.86, 32, 12, 0, Math.PI * 2, 0, Math.PI / 2), mat('metalWhite'));
  dome.scale.y = 0.62; dome.position.set(cx, drum + 0.35, cz); dome.castShadow = true; ctx.add(dome);
  const c = new Batch().frame(cx, cz).cyl('generic', 0, 0, 0, R * 0.92, drum, 24).build();
  ctx.add(c).visible = false; c.children.forEach(m => ctx.collide(m));
}
