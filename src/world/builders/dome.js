// Round building with a white observatory-type dome, north of the arc building (item "dome"). Exterior only.
//
// SEEN in the references
// - 2018 frames 2-3 (right edge of the frame, from the north-east): a pale grey-white drum with small square punched
//   windows, widely spaced (about 20 degrees apart), three rows visible above the trees; on top of the drum a recessed,
//   shaded band with a post in it, then a flat white ring that projects beyond that band but is narrower than the
//   drum, then a smooth white dome narrower than the ring.
// - 2022 "一本书的梦" frame 58 (from the new building's roof): the dome is cream-white, a little less than a hemisphere,
//   sitting on the flat white disc, which stands on a few slender posts above a lower curved wall.
// - The data item gives the drum as about 24.7 m across and the dome as about 13 m across (satellite).
//
// ASSUMED (no reference supports these)
// - Split of item.height (an estimate): four storeys of drum, a recessed top storey, ring, dome. The dome top is at item.height.
// - The ground-floor window row (hidden by trees); 18 window columns all the way round (only one side is seen);
//   window size 1.4 m; depth of the reveals.
// - The recessed band under the ring: a plain wall with 12 round posts; ring and band radii (0.77 and 0.66 of the
//   drum radius, read off frame 2); the low parapet round the terrace.
// - Dome profile: a spherical cap, rise 0.34 of its diameter, on a short upstand. No slit or shutter is modelled
//   (none is visible).
// NOT MODELLED: any entrance (none is visible in the references), the junction with the arc building, interiors.
import { THREE, mat } from '../../kit.js';
import { Batch } from '../../batch.js';

const N = 18, SEG = 4, WW = 1.4, REVEAL = 0.28;      // window columns; wall segments between two windows; window size; depth of the punched openings
const TAU = Math.PI * 2;

/** Collects curved surfaces with smooth normals round a vertical axis and emits one mesh per material (texture coordinates in metres). */
class Surf {
  constructor(cx, cz) { this.cx = cx; this.cz = cz; this.parts = new Map(); }
  part(material) {
    const key = typeof material === 'string' ? material : material.uuid;
    if (!this.parts.has(key)) this.parts.set(key, { material: typeof material === 'string' ? mat(material) : material, pos: [], nor: [], uv: [], idx: [] });
    return this.parts.get(key);
  }
  /** Piece of a cylinder wall between angles a0 < a1 and heights y0 < y1. side +1 faces outward, -1 inward. */
  wall(material, r, a0, a1, y0, y1, seg, side = 1, uScale = 1) {
    const p = this.part(material), base = p.pos.length / 3;
    for (let i = 0; i <= seg; i++) {
      const a = a0 + (a1 - a0) * i / seg, c = Math.cos(a), s = Math.sin(a);
      for (const y of [y0, y1]) { p.pos.push(this.cx + r * c, y, this.cz + r * s); p.nor.push(side * c, 0, side * s); p.uv.push(a * r * uScale, y); }
    }
    for (let i = 0; i < seg; i++) { const k = base + 2 * i; if (side > 0) p.idx.push(k, k + 1, k + 3, k, k + 3, k + 2); else p.idx.push(k, k + 3, k + 1, k, k + 2, k + 3); }
    return this;
  }
  /** Flat ring between radii r0 < r1 at height y. side +1 faces up, -1 down. */
  ring(material, r0, r1, y, seg, side = 1) {
    const p = this.part(material), base = p.pos.length / 3;
    for (let i = 0; i <= seg; i++) {
      const a = i / seg * TAU, c = Math.cos(a), s = Math.sin(a);
      for (const r of [r0, r1]) { p.pos.push(this.cx + r * c, y, this.cz + r * s); p.nor.push(0, side, 0); p.uv.push(r * c, r * s); }
    }
    for (let i = 0; i < seg; i++) { const k = base + 2 * i; if (side > 0) p.idx.push(k, k + 2, k + 3, k, k + 3, k + 1); else p.idx.push(k, k + 3, k + 2, k, k + 1, k + 3); }
    return this;
  }
  /** Spherical cap of base radius r and height rise, its top at yTop. */
  cap(material, r, rise, yTop, rings, seg) {
    const p = this.part(material), base = p.pos.length / 3, Rs = (r * r + rise * rise) / (2 * rise), yc = yTop - Rs, phiMax = Math.asin(Math.min(1, r / Rs));
    for (let i = 0; i <= rings; i++) for (let j = 0; j <= seg; j++) {
      const phi = phiMax * i / rings, th = j / seg * TAU, sp = Math.sin(phi), cp = Math.cos(phi), c = Math.cos(th), s = Math.sin(th);
      p.pos.push(this.cx + Rs * sp * c, yc + Rs * cp, this.cz + Rs * sp * s); p.nor.push(sp * c, cp, sp * s); p.uv.push(th * r, phi * Rs);
    }
    for (let i = 0; i < rings; i++) for (let j = 0; j < seg; j++) { const a = base + i * (seg + 1) + j, b = a + seg + 1; p.idx.push(a, a + 1, b + 1, a, b + 1, b); }
    return this;
  }
  build(name) {
    const group = new THREE.Group(); group.name = name;
    for (const p of this.parts.values()) {
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(p.pos, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(p.nor, 3));
      g.setAttribute('uv', new THREE.Float32BufferAttribute(p.uv, 2)); g.setIndex(p.idx);
      const mesh = new THREE.Mesh(g, p.material); mesh.castShadow = mesh.receiveShadow = true; group.add(mesh);
    }
    return group;
  }
}

let M = null;
function materials() {
  if (!M) M = {
    white: new THREE.MeshStandardMaterial({ color: 0xf1f0ea, roughness: 0.85 }),       // painted concrete: ring, posts, coping
    dome: new THREE.MeshStandardMaterial({ color: 0xf4f2e8, roughness: 0.5 }),          // smooth dome shell
  };
  return M;
}

export function build(item, ctx) {
  const { cx, cz, radius: R } = item, H = item.height, m = materials();
  // heights from item.height; radii from the item radius
  const Rd = 0.525 * R, Rring = 0.77 * R, Rg = 0.66 * R, Rpost = 0.735 * R;             // dome, flat ring, recessed top storey, posts
  const rise = 0.68 * Rd, upstand = 0.5, ringT = 0.4, gallery = 0.13 * H, parapet = 0.9;
  const ringTop = H - rise - upstand, ringBot = ringTop - ringT, terrace = ringBot - gallery, storey = terrace / 4, sillH = 0.3 * storey;
  const s = new Surf(cx, cz), b = new Batch();

  // ---- drum: wall with punched square windows. Every band uses the same vertex angles, so the openings are watertight ----
  const mod = TAU / N, ha = Math.asin(WW / 2 / R), a0 = mod / 2, wallTop = terrace + parapet;
  const us = Math.round(TAU * R / 0.6) * 0.6 / (TAU * R);                                // whole number of 0.6 m tiles round the drum: no seam
  const band = (y0, y1, windows) => {
    for (let i = 0; i < N; i++) {
      const a = a0 + i * mod;
      if (!windows) s.wall('wallWhite', R, a - ha, a + ha, y0, y1, 1, 1, us);
      s.wall('wallWhite', R, a + ha, a + mod - ha, y0, y1, SEG, 1, us);
    }
  };
  let y = 0;
  for (let f = 0; f < 4; f++) { const sl = f * storey + sillH; band(y, sl, false); band(sl, sl + WW, true); y = sl + WW; }
  band(y, wallTop, false);
  const xr = R * Math.cos(ha), w = WW / 2, xi = xr - REVEAL;                             // opening plane and back of the reveal, along the window's own radius
  for (let f = 0; f < 4; f++) for (let i = 0; i < N; i++) {
    const sl = f * storey + sillH, tp = sl + WW;
    b.frame(cx, cz, -(a0 + i * mod));                                                    // local +X points out through the window, +Z along the wall
    b.box('glassDark', xi - 0.02, sl + w, 0, 0.04, WW, WW, 'WUDSN');
    b.box(m.white, xi + 0.02, sl + w, 0, 0.05, WW, 0.06, 'W').box(m.white, xi + 0.02, sl + w, 0, 0.05, 0.06, WW, 'W');                    // glazing bars
    b.quad('wallWhite', [xi, sl, w], [xr, sl, w], [xr, sl, -w], [xi, sl, -w]);                                                           // sill
    b.quad('wallWhite', [xi, tp, -w], [xr, tp, -w], [xr, tp, w], [xi, tp, w]);                                                           // head
    b.quad('wallWhite', [xi, sl, -w], [xr, sl, -w], [xr, tp, -w], [xi, tp, -w]);                                                         // jambs
    b.quad('wallWhite', [xr, sl, w], [xi, sl, w], [xi, tp, w], [xr, tp, w]);
  }

  // ---- terrace on the drum with a low parapet, recessed top storey with posts ----
  s.ring('roofGrey', Rg - 0.05, R - 0.25, terrace, 60, 1).wall('wallWhite', R - 0.25, 0, TAU, terrace, wallTop, 60, -1);
  s.ring(m.white, R - 0.3, R + 0.06, wallTop, 90, 1).wall(m.white, R + 0.06, 0, TAU, wallTop - 0.1, wallTop, 90, 1).ring(m.white, R - 0.02, R + 0.06, wallTop - 0.1, 90, -1);
  s.wall('wallWhite', Rg, 0, TAU, terrace, ringBot, 60, 1);
  b.frame(cx, cz);
  for (let i = 0; i < 12; i++) { const a = (i + 0.5) / 12 * TAU; b.cyl(m.white, Rpost * Math.cos(a), terrace, Rpost * Math.sin(a), 0.16, gallery, 10, false); }

  // ---- flat projecting ring and the dome ----
  s.ring(m.white, Rd - 0.1, Rring, ringTop, 72, 1).ring(m.white, Rg - 0.05, Rring, ringBot, 72, -1).wall(m.white, Rring, 0, TAU, ringBot, ringTop, 72, 1);
  s.wall(m.dome, Rd, 0, TAU, ringTop, ringTop + upstand, 64, 1).cap(m.dome, Rd, rise, H, 14, 64);

  ctx.add(s.build(item.id + '-shell'));
  ctx.add(b.build({ name: item.id + '-details' }));
  // collider: the drum up to its parapet (nobody can get onto the terrace)
  const cg = ctx.add(new Batch().frame(cx, cz).cyl('generic', 0, 0, 0, R, wallTop, 24).build({ name: item.id + '-colliders' })); cg.visible = false;
  cg.traverse(o => { if (o.isMesh) ctx.collide(o); });
}
