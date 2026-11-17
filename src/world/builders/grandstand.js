// West grandstand building (2018 footage frames 12-14, 31-35, 38-41, 46-48; 2022 sports-day frames 2, 42-43):
// brick-red wall with 9 white full-height pilasters (8 bays), each pilaster flanked by tall narrow teal windows, a
// clerestory band above, and a thin flat white roof with a wide overhanging eave above a covered upper tier of seats;
// a dark-red base wall below; at the south end a cylindrical glazed stair tower with a flat disc roof; at the north end
// a lower white flat-roofed portal on columns.
// ASSUMED: the split of the measured roof outline between the building (west part) and the covered upper tier (east
// part); all heights of the bands; the rear (west) face. Exterior only.
import { bbox } from '../../kit.js';
import { Batch } from '../../batch.js';

export function build(item, ctx) {
  const b = bbox(item.points), W = b.sx, D = b.sz, H = item.height, body = W * 0.55, wallTop = H - 0.6, tier0 = 5.0;
  const v = new Batch().frame(b.w, b.n), c = new Batch().frame(b.w, b.n);
  const both = (m, ...a) => { v.slab(m, ...a); c.slab('generic', ...a); };
  both('brickRed', 0, 0, 0, body, wallTop, D);                                           // main block
  v.slab('wallWhite', -1.5, wallTop, -2, W + 3.5, 0.6, D + 4);                           // thin roof slab, overhanging
  // east face of the block above the upper tier: pilasters, teal windows, clerestory
  for (let i = 0; i <= 8; i++) {
    const z = i * (D - 0.8) / 8;
    v.slab('wallWhite', body, tier0, z, 0.35, wallTop - tier0, 0.8);
    for (const dz of [-0.9, 0.9]) if (z + dz > 0 && z + dz < D - 0.7) v.slab('glassTeal', body, tier0 + 2.2, z + dz + 0.05, 0.08, 4.2, 0.7).slab('metalWhite', body + 0.06, tier0 + 2.2, z + dz, 0.06, 0.12, 0.8);
  }
  v.slab('glassDark', body, wallTop - 2.0, 0, 0.06, 1.3, D);
  for (let i = 0; i <= 32; i++) v.slab('metalWhite', body + 0.04, wallTop - 2.0, i * (D - 0.08) / 32, 0.05, 1.3, 0.08);
  // covered upper tier: steps rising toward the building, seats, dark-red base wall facing the track
  const rows = 9, depth = (W - body) / rows;
  for (let r = 0; r < rows; r++) { both('concrete', W - (r + 1) * depth, 0, 0, depth, tier0 + r * 0.42, D); v.slab('seatBlue', W - (r + 1) * depth + 0.25, tier0 + r * 0.42, 1, 0.45, 0.12, D - 2); }
  v.slab('wallMaroon', W - 0.02, 0, 0, 0.06, tier0 - 0.9, D).slab('wallWhite', W, tier0 - 0.9, 0, 0.12, 1.0, D);
  for (let i = 1; i < 8; i++) v.slab('black', W + 0.02, 0, i * D / 8 - 0.6, 0.05, 2.2, 1.2);
  // rear face: plain with small windows
  for (let i = 0; i < 12; i++) v.slab('glassDark', -0.03, 3 + (i % 2) * 4.2, 3 + i * (D - 6) / 12, 0.05, 1.4, 2.2);
  // south end: round glazed stair tower with a disc roof
  v.frame(b.w + body * 0.7, b.s + 5.5).cyl('glassTeal', 0, 0, 0, 3.6, H - 2.5, 20).cyl('wallWhite', 0, H - 2.5, 0, 4.6, 0.35, 24);
  for (let k = 1; k < 4; k++) v.cyl('metalWhite', 0, k * 3.1, 0, 3.66, 0.18, 20, false);
  c.frame(b.w + body * 0.7, b.s + 5.5).box('generic', 0, (H - 2.5) / 2, 0, 6.4, H - 2.5, 6.4);
  // north end: lower white portal on columns
  v.frame(b.w, b.n).slab('wallWhite', body * 0.2, 5.2, -9, body * 0.9, 0.4, 9).slab('glassDark', body * 0.3, 0, -7.5, body * 0.6, 5.2, 6);
  c.frame(b.w, b.n).slab('generic', body * 0.3, 0, -7.5, body * 0.6, 5.2, 6);
  for (const x of [body * 0.22, body * 1.08]) for (const z of [-8.6, -0.8]) v.frame(b.w + x, b.n + z).cyl('wallWhite', 0, 0, 0, 0.25, 5.2, 10);
  ctx.add(v.build({ name: item.id }));
  const cg = c.build(); ctx.add(cg).visible = false; cg.children.forEach(m => ctx.collide(m));
}
