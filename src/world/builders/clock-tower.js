// Clock tower beside the plaza canopy, after the 2018 footage (frames 6-10, 43) and the 2022 dusk aerial:
// white square shaft, an open finned middle section with green glass behind, a thin cantilevered platform,
// a white head framed by a dark-red cap that carries the school emblem (not a clock), a dark-red vertical
// slab down one side, and a lattice mast.
// ASSUMED: the split of the height between base, fins and head; which side the red slab is on (east);
// the emblem is an approximation drawn from a verbal description. The external stair on the south side is omitted.
import { THREE, bbox } from '../../kit.js';
import { Batch } from '../../batch.js';
import { emblemTexture } from '../../signs.js';

export function build(item, ctx) {
  const b = bbox(item.points), s = Math.min(b.sx, b.sz), H = item.height, top = H - 2;          // top: roof of the head; the mast uses the rest
  const yFin0 = top * 0.47, yFin1 = top * 0.7, yHead1 = top;
  const v = new Batch().frame(b.cx - s / 2, b.cz - s / 2);
  v.slab('wallWhite', 0, 0, 0, s, yFin0, s);                                                    // solid base shaft
  v.slab('glassGreen', 0.5, yFin0, 0.5, s - 1, yFin1 - yFin0, s - 1);                           // glazed core behind the fins
  for (const [x, z] of [[0, 0], [s - 0.4, 0], [0, s - 0.4], [s - 0.4, s - 0.4]]) v.slab('wallWhite', x, yFin0, z, 0.4, yFin1 - yFin0, 0.4);
  for (let i = 1; i <= 4; i++) { const p = i * s / 5 - 0.1;
    v.slab('wallWhite', p, yFin0, 0, 0.2, yFin1 - yFin0, 0.35).slab('wallWhite', p, yFin0, s - 0.35, 0.2, yFin1 - yFin0, 0.35);
    v.slab('wallWhite', 0, yFin0, p, 0.35, yFin1 - yFin0, 0.2).slab('wallWhite', s - 0.35, yFin0, p, 0.35, yFin1 - yFin0, 0.2); }
  v.slab('concrete', -1.3, yFin1, -1.3, s + 2.6, 0.3, s + 2.6);                                  // cantilevered platform
  v.slab('wallWhite', 0, yFin1 + 0.3, 0, s, yHead1 - yFin1 - 0.3, s);                            // head
  v.slab('wallMaroon', -0.25, yHead1 - 3.2, -0.25, s + 0.5, 3.2, s + 0.5);                       // dark-red cap band
  v.slab('wallMaroon', s - 0.05, top * 0.2, s * 0.55, 0.45, yHead1 - top * 0.2, s * 0.35);       // dark-red vertical slab on the east side
  v.slab('roofGrey', -0.25, yHead1, -0.25, s + 0.5, 0.25, s + 0.5);
  v.cyl('steel', s / 2, yHead1, s / 2, 0.07, H - yHead1 + 3, 6, false);
  for (let i = 1; i <= 3; i++) v.slab('steel', s / 2 - 0.5, yHead1 + i * 1.2, s / 2 - 0.03, 1.0, 0.05, 0.06);
  ctx.add(v.build({ name: 'clock-tower' }));

  // emblem on each face of the head
  const mat = new THREE.MeshStandardMaterial({ map: emblemTexture('#ffffff'), roughness: 0.7 }), size = s * 0.62, y = (yFin1 + 0.3 + yHead1 - 3.2) / 2;
  for (const [dx, dz, rot] of [[0, 1, 0], [0, -1, Math.PI], [1, 0, Math.PI / 2], [-1, 0, -Math.PI / 2]]) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(size, size), mat);
    m.position.set(b.cx + dx * (s / 2 + 0.03), y, b.cz + dz * (s / 2 + 0.03)); m.rotation.y = rot; ctx.add(m);
  }
  const c = new Batch().frame(b.cx - s / 2, b.cz - s / 2).slab('generic', 0, 0, 0, s, H, s).build();
  ctx.add(c).visible = false; c.children.forEach(m => ctx.collide(m));
}
