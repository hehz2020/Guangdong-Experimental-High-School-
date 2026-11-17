// East stair tower of a teaching slab (2018 footage, frames 2-7): white tower slightly taller than the slab, an open
// loggia with posts as its top level, a pale green glazed band below, a dark-red vertical strip on the corner and a
// flat grey roof slab pierced by one circular opening.
// ASSUMED: proportions of the glazed band and loggia. Not enterable (the slab's own stair is at its west end).
import { THREE, mat, bbox } from '../../kit.js';
import { Batch } from '../../batch.js';

export function build(item, ctx) {
  const b = bbox(item.points), H = item.height, body = H - 4.0;
  const v = new Batch().frame(b.w, b.n);
  v.slab('wallWhite', 0, 0, 0, b.sx, body, b.sz);
  v.slab('glassGreen', b.sx - 0.02, 2.2, b.sz * 0.3, 0.05, body - 4, b.sz * 0.4);                 // glazed band on the east face
  for (let k = 1; k < 5; k++) v.slab('metalWhite', b.sx, k * 3.9, b.sz * 0.3, 0.06, 0.12, b.sz * 0.4);
  v.slab('wallMaroon', b.sx - 0.02, 0.5, -0.03, 0.06, body - 1, 0.9).slab('wallMaroon', b.sx - 0.9, 0.5, -0.04, 0.9, body - 1, 0.06);   // red strip wrapping the north-east corner
  for (const x of [0.1, b.sx / 2 - 0.15, b.sx - 0.4]) for (const z of [0.1, b.sz / 2 - 0.15, b.sz - 0.4]) if (!(x > 0.2 && x < b.sx - 0.5 && z > 0.2 && z < b.sz - 0.5)) v.slab('wallWhite', x, body, z, 0.3, 3.4, 0.3);
  v.slab('wallWhite', 0, body, 0, b.sx, 0.9, 0.12).slab('wallWhite', 0, body, b.sz - 0.12, b.sx, 0.9, 0.12).slab('wallWhite', 0, body, 0, 0.12, 0.9, b.sz).slab('wallWhite', b.sx - 0.12, body, 0, 0.12, 0.9, b.sz);
  ctx.add(v.build({ name: item.id }));
  // roof slab with a round opening
  const shape = new THREE.Shape([[-0.4, -0.4], [b.sx + 0.4, -0.4], [b.sx + 0.4, b.sz + 0.4], [-0.4, b.sz + 0.4]].map(([x, z]) => new THREE.Vector2(b.w + x, -(b.n + z))));
  const hole = new THREE.Path(); hole.absarc(b.cx, -b.cz, Math.min(b.sx, b.sz) * 0.28, 0, Math.PI * 2, true); shape.holes.push(hole);
  const g = new THREE.ExtrudeGeometry(shape, { depth: 0.35, bevelEnabled: false, curveSegments: 20 }); g.rotateX(-Math.PI / 2); g.translate(0, body + 3.4, 0);
  const roof = new THREE.Mesh(g, mat('roofGrey')); roof.castShadow = roof.receiveShadow = true; ctx.add(roof);
  const c = new Batch().frame(b.w, b.n).slab('generic', 0, 0, 0, b.sx, body + 0.9, b.sz).build();
  ctx.add(c).visible = false; c.children.forEach(m => ctx.collide(m));
}
