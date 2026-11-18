// Link walkway along the west ends of the two east teaching slabs (link-corridor-west) and the small roof at its north end
// (link-corridor-north-pavilion): built as an ELEVATED DECK WITH PARAPETS on columns, open underneath.
//
// HEIGHT: both data items now say 7.8 m (they said 4 m, "single-storey covered walkway assumed", when this builder was
// written). The builder still does not read item.height: the deck's walking surface is at its own constant DECK = 7.8 m,
// the parapet tops at 8.85 m; if the data height is changed, DECK must be changed too. Reasons for 7.8 m: in the 2018
// footage (the frames between sampled frames 7 and 8, camera above the south slab looking west) the white structure
// meets the south slab's north-west corner between the third and fourth window rows counted from the roof, which is the
// floor of the third storey (2 x 3.9 m); the study of the satellite image that located the clock tower got 7 to 8 m for
// its top from the shadows.
//
// SEEN in those frames: a narrow white structure along the east edge of the open paving, leaving the south slab's north-west
//   corner toward the north; from above it shows two raised white edges with a grey surface between them (read as parapets
//   and a deck, not as a roof with a thin upstand: the white edges are about a quarter of the width). On the satellite
//   image: a white ribbon about 3.3 m wide and 56 m long, bright where sunlit, and a small white rectangle with a parapet
//   outline at its north end.
//
// ASSUMED (nothing under the deck is visible in any reference; kept plain):
//   - that it is one deck only (no second deck at the level of the second storey), open underneath;
//   - the columns (0.4 m square, a pair at every bend of the measured outline, 5.5 to 8.3 m apart), the beams, the slab
//     thickness, the parapet height (1.05 m) and that the parapets are unbroken (where the deck joins the slabs is not
//     visible, so no openings are drawn and the deck cannot be reached on foot);
//   - the pavilion at the north end is drawn as the deck's end bay at the same level on four columns;
//   - the paved strip with kerbs on the ground under the deck, the ceiling lamps.
// Where the measured outline runs into a neighbouring building (it overlaps the block north-east of the canopy by up to
// 1 m), the columns that would stand inside that building are left out.
// Colliders: columns, the deck surface and the parapets (a player leaving drone mode above the deck lands on it).
import { flat } from '../../kit.js';
import { F, lm, shell, finish } from './plain-block.js';
import { pavingMaterial, blockedBy, inPoly } from './plaza.js';

const DECK = 7.8, SLAB = 0.25, PARAPET = 1.05, COL = 0.4;

export function build(item, ctx) {
  const S = shell(ctx), pts = item.points, N = pts.length, quad = N === 4;
  const WH = lm('white'), CO = lm('concrete'), DK = lm('shade'), CP = lm('cope'), PL = lm('plaster');
  const others = (ctx.campus ? ctx.campus.items : []).filter(i => i !== item && i.id !== item.id && i.style === item.style && i.points);
  const shared = (p, q) => others.some(o => [p, q].every(a => o.points.some(b => Math.hypot(a[0] - b[0], a[1] - b[1]) < 0.06)));
  const blocked = blockedBy(ctx, item);
  const cxm = pts.reduce((a, p) => a + p[0], 0) / N, czm = pts.reduce((a, p) => a + p[1], 0) / N;

  // ---- cross-sections: the outline lists one long side and then the other one backwards
  const n = N / 2, sec = [];
  for (let i = 0; i < n; i++) sec.push([pts[i], pts[N - 1 - i]]);
  const hq = (b, m, a, bb, c, d, y, faceUp) => {                              // horizontal quad through four outline points, facing up or down
    const area = (bb[0] - a[0]) * (d[1] - a[1]) - (bb[1] - a[1]) * (d[0] - a[0]);
    const o = (area < 0) === faceUp ? [a, bb, c, d] : [a, d, c, bb];
    b.quad(m, ...o.map(p => [p[0], y, p[1]]));
  };
  S.v.frame(); S.c.frame();
  for (let i = 0; i + 1 < n; i++) {
    const [a0, b0] = sec[i], [a1, b1] = sec[i + 1];
    hq(S.v, DK, a0, a1, b1, b0, DECK, true); hq(S.v, PL, a0, a1, b1, b0, DECK - SLAB, false);
    hq(S.c, 'generic', a0, a1, b1, b0, DECK, true);
    if (!quad) { const mx = (a0[0] + a1[0] + b0[0] + b1[0]) / 4, mz = (a0[1] + a1[1] + b0[1] + b1[1]) / 4; F(S.d, lm('lamp'), mx - 0.18, DECK - SLAB - 0.05, mz - 0.18, 0.36, 0.05, 0.36, 'NSEWD'); }
  }
  if (quad) F(S.d, lm('lamp'), cxm - 0.18, DECK - SLAB - 0.05, czm - 0.18, 0.36, 0.05, 0.36, 'NSEWD');

  // ---- along every edge of the outline: edge beam, slab edge, parapet with coping, kerb on the ground (not on edges shared
  //      with the neighbouring walkway item)
  for (let i = 0; i < N; i++) {
    const p = pts[i], q = pts[(i + 1) % N];
    if (shared(p, q)) continue;
    const dx = q[0] - p[0], dz = q[1] - p[1], len = Math.hypot(dx, dz), ang = Math.atan2(-dz, dx);
    const nx = Math.sin(ang), nz = Math.cos(ang), s = inPoly(pts, (p[0] + q[0]) / 2 + nx * 0.05, (p[1] + q[1]) / 2 + nz * 0.05) ? 1 : -1;   // s: which local z is inside
    const e = 0.03;                                                            // small overlap at the bends
    S.v.frame(p[0], p[1], ang);
    S.v.box(WH, len / 2, DECK - (0.5 + SLAB) / 2, s * 0.15, len + 2 * e, 0.5 + SLAB, 0.3, 'U');                 // edge beam and slab edge
    S.v.box(WH, len / 2, DECK + PARAPET / 2, s * 0.075, len + 2 * e, PARAPET, 0.15, 'UD');                 // parapet
    S.v.box(CP, len / 2, DECK + PARAPET + 0.025, s * 0.075, len + 2 * e, 0.05, 0.21);                      // coping
    S.c.frame(p[0], p[1], ang).box('generic', len / 2, DECK + PARAPET / 2, s * 0.075, len + 2 * e, PARAPET, 0.15);
    const end = !quad && (i === n - 1 || i === N - 1);                         // the two short end edges of the strip get no kerb
    if (!end && !blocked((p[0] + q[0]) / 2, (p[1] + q[1]) / 2, 0.3)) S.d.frame(p[0], p[1], ang).box(CP, len / 2, 0.06, s * 0.06, len, 0.12, 0.12, 'D');
  }
  S.v.frame(); S.d.frame(); S.c.frame();

  // ---- columns with a cross beam between each pair
  const column = (x, z) => {
    if (blocked(x, z, COL / 2 + 0.05)) return false;
    F(S.v, WH, x - COL / 2, 0, z - COL / 2, COL, DECK - SLAB, COL, 'NSEW'); F(S.d, CO, x - COL / 2 - 0.06, 0, z - COL / 2 - 0.06, COL + 0.12, 0.12, COL + 0.12, 'NSEWU');
    F(S.c, 'generic', x - COL / 2, 0, z - COL / 2, COL, DECK - SLAB, COL, 'NSEW');
    return true;
  };
  const inset = 0.5;
  if (quad) {
    for (const p of pts) { const d = Math.hypot(cxm - p[0], czm - p[1]); column(p[0] + (cxm - p[0]) * inset * 1.4 / d, p[1] + (czm - p[1]) * inset * 1.4 / d); }
  } else for (let i = 0; i < n; i++) {
    const [a, b] = sec[i], w = Math.hypot(b[0] - a[0], b[1] - a[1]), t = inset / w;
    // the two end pairs stand 0.6 m in from the ends of the deck
    const o = sec[i === 0 ? 1 : i === n - 1 ? n - 2 : i], along = i === 0 || i === n - 1 ? 0.6 / Math.hypot((o[0][0] + o[1][0] - a[0] - b[0]) / 2, (o[0][1] + o[1][1] - a[1] - b[1]) / 2) : 0;
    const sx = ((o[0][0] + o[1][0]) / 2 - (a[0] + b[0]) / 2) * along, sz = ((o[0][1] + o[1][1]) / 2 - (a[1] + b[1]) / 2) * along;
    const c1 = [a[0] + (b[0] - a[0]) * t + sx, a[1] + (b[1] - a[1]) * t + sz], c2 = [b[0] + (a[0] - b[0]) * t + sx, b[1] + (a[1] - b[1]) * t + sz];
    const k1 = column(...c1), k2 = column(...c2);
    if (k1 || k2) {                                                            // cross beam, also where one end rests on a neighbouring building
      const ang = Math.atan2(-(c2[1] - c1[1]), c2[0] - c1[0]), len = Math.hypot(c2[0] - c1[0], c2[1] - c1[1]);
      S.v.frame(c1[0], c1[1], ang).box(WH, len / 2, DECK - SLAB - 0.25, 0, len, 0.5, 0.3, 'UEW'); S.v.frame();
    }
  }

  // ---- paved strip on the ground under the deck
  ctx.add(flat(pts, 0.045, pavingMaterial()));
  finish(S, item, ctx, cxm, czm, (quad ? 6 : 30) + (S.low ? 45 : 70));
}
