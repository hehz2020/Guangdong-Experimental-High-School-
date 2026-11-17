// Round towers at the east ends of the long blocks (items dorm-*-round-tower). Exterior only; not enterable.
//
// SEEN, in the satellite image only (no video frame shows them): a white ring about 10 m across at the east end of
// each block. Tower A's top shows two concentric white arcs, C-shaped and open toward the north-west, like the top of
// a spiral stair or ramp. Tower B's top is a clean light ring around a dark, roughly octagonal centre about 5.8 m across.
//
// ASSUMED: everything about the elevation. Whether the spiral is a stair or a ramp is not established, so it is
// drawn as a smooth helical band (one turn per storey, six turns) with a solid white parapet, carried on eight white
// piers around an open central well. The direction of climb, the pier count, the parapet height, the flat ring roof
// on tower B and the open top on tower A are choices made to match the two roof views. Height is the data estimate.
import { bbox, itemPolygon } from '../../kit.js';
import { Batch } from '../../batch.js';

const TURNS = 6, SEG = 28, PARAPET = 1.1, SLAB = 0.25, WALL = 0.18;
const END_ANGLE = Math.atan2(-1, -1);                   // the top of the spiral ends toward the north-west (x = cos a, z = sin a)
const OPEN_TOP = { 'dorm-a-round-tower': true };        // tower A shows the spiral itself from above; the others get a flat ring roof

export function build(item, ctx) {
  const b = bbox(itemPolygon(item));
  const cx = item.shape === 'circle' ? item.cx : b.cx, cz = item.shape === 'circle' ? item.cz : b.cz;
  const R = item.shape === 'circle' ? item.radius : Math.min(b.sx, b.sz) / 2, H = item.height;
  const open = !!OPEN_TOP[item.id], r1 = 0.56 * R, r2 = R - 0.03, ri = r2 - WALL;
  const top = open ? H - PARAPET : H - 0.25 - 2.3;      // level the spiral reaches (under the ring roof there is headroom)
  const v = new Batch().frame(cx, cz, 0);
  const P = (a, r, y) => [r * Math.cos(a), y, r * Math.sin(a)];
  // quad whose front must face the direction (nx, ny, nz): reorders the corners if they wind the other way
  const face = (m, p, nx, ny, nz) => {
    const e1 = [p[1][0] - p[0][0], p[1][1] - p[0][1], p[1][2] - p[0][2]], e2 = [p[3][0] - p[0][0], p[3][1] - p[0][1], p[3][2] - p[0][2]];
    const n = [e1[1] * e2[2] - e1[2] * e2[1], e1[2] * e2[0] - e1[0] * e2[2], e1[0] * e2[1] - e1[1] * e2[0]];
    if (n[0] * nx + n[1] * ny + n[2] * nz < 0) p = [p[0], p[3], p[2], p[1]];
    v.quad(m, ...p);
  };

  // ---- helical band: parapet outside and inside, its top, the walking surface and the soffit ----
  const total = TURNS * SEG, a0 = END_ANGLE - TURNS * 2 * Math.PI;
  for (let i = 0; i < total; i++) {
    const a = a0 + i * 2 * Math.PI / SEG, a2 = a + 2 * Math.PI / SEG, y = top * i / total, y2 = top * (i + 1) / total;
    const am = (a + a2) / 2, ox = Math.cos(am), oz = Math.sin(am);
    face('wallWhite', [P(a, r2, y - SLAB), P(a2, r2, y2 - SLAB), P(a2, r2, y2 + PARAPET), P(a, r2, y + PARAPET)], ox, 0, oz);
    face('wallWhite', [P(a, ri, y), P(a2, ri, y2), P(a2, ri, y2 + PARAPET), P(a, ri, y + PARAPET)], -ox, 0, -oz);
    face('wallWhite', [P(a, ri, y + PARAPET), P(a2, ri, y2 + PARAPET), P(a2, r2, y2 + PARAPET), P(a, r2, y + PARAPET)], 0, 1, 0);
    face('concrete', [P(a, r1, y), P(a2, r1, y2), P(a2, ri, y2), P(a, ri, y)], 0, 1, 0);
    face('wallWhite', [P(a, r1, y - SLAB), P(a2, r1, y2 - SLAB), P(a2, r2, y2 - SLAB), P(a, r2, y - SLAB)], 0, -1, 0);
  }
  // closing faces at the top end of the band
  const ae = END_ANGLE;
  face('wallWhite', [P(ae, r1, top - SLAB), P(ae, r2, top - SLAB), P(ae, r2, top), P(ae, r1, top)], -Math.sin(ae), 0, Math.cos(ae));
  face('wallWhite', [P(ae, ri, top), P(ae, r2, top), P(ae, r2, top + PARAPET), P(ae, ri, top + PARAPET)], -Math.sin(ae), 0, Math.cos(ae));

  // ---- central well: white wall, dark inside when seen from above ----
  v.cyl('wallWhite', 0, 0, 0, r1, H - (open ? 0.6 : 0.25), 8, false);
  v.cyl('asphalt', 0, H - 1.8, 0, r1 - 0.02, 0.05, 8, true);

  // ---- flat ring roof (towers other than A) ----
  if (!open) {
    for (let i = 0; i < SEG; i++) {
      const a = i * 2 * Math.PI / SEG, a2 = a + 2 * Math.PI / SEG, am = (a + a2) / 2, ox = Math.cos(am), oz = Math.sin(am), y = H - 0.25;
      face('roofPale', [P(a, r1, H), P(a2, r1, H), P(a2, R, H), P(a, R, H)], 0, 1, 0);
      face('wallWhite', [P(a, r1, y), P(a2, r1, y), P(a2, R, y), P(a, R, y)], 0, -1, 0);
      face('wallWhite', [P(a, R, y), P(a2, R, y), P(a2, R, H), P(a, R, H)], ox, 0, oz);
    }
  }

  // ---- eight piers carrying the band ----
  for (let j = 0; j < 8; j++) {
    const a = END_ANGLE + j * Math.PI / 4;
    v.frame(cx, cz, -a).box('wallWhite', r2 - 0.14, H / 2, 0, 0.36, H, 0.55);
  }
  ctx.add(v.build({ name: item.id + '-visual' }));

  const c = new Batch().frame(cx, cz, 0).cyl('generic', 0, 0, 0, R, H, 18, true).build({ name: item.id + '-collider' });
  ctx.add(c).visible = false; c.children.forEach(m => ctx.collide(m));
}
