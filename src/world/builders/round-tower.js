// Round tower at the east end of a long block: a white ring about 10 m across whose top shows concentric arcs like a
// spiral stair or ramp (which of the two is not established). Modelled as a white drum with tall openings and a spiral
// band visible through them. Exterior only.
import { Batch } from '../../batch.js';

export function build(item, ctx) {
  const { cx, cz, radius: R } = item, H = item.height, v = new Batch().frame(cx, cz);
  v.cyl('concrete', 0, 0, 0, R * 0.55, H, 20).cyl('wallWhite', 0, H, 0, R, 0.4, 28);
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; v.frame(cx + Math.cos(a) * R * 0.96, cz + Math.sin(a) * R * 0.96, -a + Math.PI / 2).box('wallWhite', 0, H / 2, 0, 0.5, H, 0.3); }
  const turns = H / 3.3, steps = Math.round(turns * 24);
  for (let s = 0; s < steps; s++) {
    const a0 = s / 24 * Math.PI * 2, a1 = (s + 1) / 24 * Math.PI * 2, y0 = s / steps * H, y1 = (s + 1) / steps * H, r0 = R * 0.56, r1 = R * 0.93;
    v.frame(cx, cz).quad('wallWhite', [Math.cos(a0) * r0, y0, Math.sin(a0) * r0], [Math.cos(a0) * r1, y0, Math.sin(a0) * r1], [Math.cos(a1) * r1, y1, Math.sin(a1) * r1], [Math.cos(a1) * r0, y1, Math.sin(a1) * r0]);
    v.quad('wallWhite', [Math.cos(a1) * r0, y1, Math.sin(a1) * r0], [Math.cos(a1) * r1, y1, Math.sin(a1) * r1], [Math.cos(a0) * r1, y0, Math.sin(a0) * r1], [Math.cos(a0) * r0, y0, Math.sin(a0) * r0]);
  }
  ctx.add(v.build({ name: item.id }));
  const c = new Batch().frame(cx, cz).cyl('generic', 0, 0, 0, R, H, 20).build();
  ctx.add(c).visible = false; c.children.forEach(m => ctx.collide(m));
}
