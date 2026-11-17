// Furniture of the athletics field (the track surface itself is drawn by world/index.js): football goals, the long-jump
// runway and sand pits beside the west straight, high-jump mats in the south D, a railing along the east straight, the
// retired fighter jet displayed outside the south-west bend (2022 sports-day frames 79-81) and the flag-raising platform.
// ASSUMED: the jet's type and exact shape (a generic delta-wing jet about 15 m long), its heading (nose toward the
// east-north-east as it appears in frame 81) and its position to within several metres (read off a video frame); the
// flag platform's position (described only as south of the arc building's west end and north-west of the gymnasium);
// sand pit and mat positions.
import { THREE } from '../../kit.js';
import { Batch } from '../../batch.js';

export function build(ctx) {
  const t = ctx.campus.track, f = t.infield, R = t.outerRadius, v = new Batch(), c = new Batch();
  const jet = new THREE.MeshStandardMaterial({ color: 0xb9c0c4, roughness: 0.45, metalness: 0.35, side: THREE.DoubleSide });
  const sand = new THREE.MeshStandardMaterial({ color: 0xd9c9a0, roughness: 1 });
  // football goals on the goal lines
  for (const end of [-1, 1]) { const z = f.cz + end * (f.sizeZ / 2 - 2.2);
    v.frame(f.cx, z).box('white', -3.66, 1.22, 0, 0.12, 2.44, 0.12).box('white', 3.66, 1.22, 0, 0.12, 2.44, 0.12).box('white', 0, 2.44, 0, 7.44, 0.12, 0.12).box('white', 0, 1.22, end * 1.6, 7.3, 0.03, 0.03); }
  // long-jump runway with two sand pits, between the west straight and the stand
  const lx = t.cx - R - 5.2;
  v.frame(lx, t.cz).box('trackRed', 0, 0.035, 0, 1.4, 0.03, 46).box(sand, 0, 0.05, -27.5, 3, 0.06, 9).box(sand, 0, 0.05, 27.5, 3, 0.06, 9);
  // high-jump mats in the south D
  for (const dx of [-7, 7]) { v.frame(t.cx + dx, t.cz + t.straight / 2 + 14).box('seatBlue', 0, 0.35, 0, 5, 0.7, 3); c.frame(t.cx + dx, t.cz + t.straight / 2 + 14).box('generic', 0, 0.35, 0, 5, 0.7, 3); }
  // railing along the east straight (visual only, so it does not fence the player out)
  for (let z = -40; z <= 40; z += 2.5) v.frame(t.cx + R + 4.6, t.cz + z).box('steel', 0, 0.55, 0, 0.05, 1.1, 0.05);
  v.frame(t.cx + R + 4.6, t.cz).box('steel', 0, 1.08, 0, 0.05, 0.05, 80).box('steel', 0, 0.6, 0, 0.04, 0.04, 80);
  // fighter jet on a plinth outside the south-west bend
  const jx = t.cx - 40, jz = t.cz + 81, a = 0.3;                      // heading: local +X turned a little from east toward north
  v.frame(jx, jz, a).box('concrete', -1, 1.0, 0, 3.2, 2.0, 1.6);
  c.frame(jx, jz, a).box('generic', -1, 1.0, 0, 3.2, 2.0, 1.6).box('generic', 0, 3.2, 0, 15, 1.6, 2);
  v.box(jet, -0.5, 3.2, 0, 10, 1.3, 1.3).box(jet, 5.4, 3.15, 0, 2, 1.0, 1.0).box(jet, 6.9, 3.1, 0, 1.2, 0.6, 0.6).box(jet, -6.0, 3.25, 0, 1.2, 1.0, 1.0)
    .box('glassDark', 3.3, 3.95, 0, 2.2, 0.5, 0.7).box(jet, 2.2, 2.55, 0, 3.0, 0.5, 1.0).box('black', -6.7, 3.25, 0, 0.3, 0.8, 0.8);
  for (const s of [-1, 1]) v.quad(jet, [2.6, 3.1, s * 0.6], [-5.2, 3.1, s * 0.6], [-5.6, 3.1, s * 4.6], [-4.0, 3.1, s * 4.6]);       // delta wings
  v.quad(jet, [-2.2, 3.8, 0], [-6.0, 3.8, 0], [-6.6, 6.0, 0], [-5.2, 6.0, 0]);                                                 // tail fin
  for (const s of [-1, 1]) v.quad(jet, [-4.4, 3.3, s * 0.6], [-6.0, 3.3, s * 0.6], [-6.4, 3.3, s * 2.0], [-5.6, 3.3, s * 2.0]);  // tailplanes
  // flag-raising platform (position assumed, see above)
  const px = 62, pz = -60;
  v.frame(px, pz).box('granite', 0, 0.15, 0, 4.4, 0.3, 4.4).box('granite', 0, 0.45, 0, 3.2, 0.3, 3.2).cyl('steel', 0, 0.6, 0, 0.09, 14, 10);
  c.frame(px, pz).box('generic', 0, 0.3, 0, 4.4, 0.6, 4.4);
  for (let i = 0; i < 8; i++) { const an = i / 8 * Math.PI * 2 + Math.PI / 8; v.cyl('steel', Math.cos(an) * 3.4, 0, Math.sin(an) * 3.4, 0.06, 0.9, 8); }
  v.box('red', 1.1, 13.4, 0, 2.1, 1.4, 0.03);
  ctx.add(v.build({ name: 'track-field' }));
  const cg = c.build(); ctx.add(cg).visible = false; cg.children.forEach(m => ctx.collide(m));
}
