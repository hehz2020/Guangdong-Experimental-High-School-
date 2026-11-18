// Open paved plaza east of the canopy (item plaza-east-of-canopy), and the paving shared with the floor under the canopy.
//
// SEEN in the 2018 footage (frames 7 to 10 and the frames between them):
//   - pale grey-beige paving in large squares with fine joints;
//   - short white dash marks on the open paving, in rows, each dash pointing east-west;
//   - along the east edge, beside the white link walkway: about four short dark red-brown stone stelae alternating with small
//     palms.
// SEEN BUT NOT BUILT: a fan of curved steps and a dark-red frame (a kiosk or gate) at the north-east corner of the open
//   paving (frame 8). They lie north of this item's measured rectangle and what the steps lead up to is not visible. Three
//   orange traffic cones (movable) are left out too.
//
// ASSUMED (kept plain):
//   - slab size of the paving (0.6 m, stronger joints every 3 m), the spacing of the dash marks (3 m both ways);
//   - size of the stelae (0.45 x 0.45 x 1.5 m on a pale base), their spacing (6 m) and that of the palms between them;
//   - the small square kerb round each palm.
// The measured rectangle also covers ground that the glass stair block and the tower stand on (the data notes say so): marks,
// stelae and palms are left out wherever another solid item or the link walkway stands.
import { THREE, flat, bbox, itemPolygon } from '../../kit.js';
import { Batch } from '../../batch.js';
import { palm } from '../../plants.js';

let pave = null;
/** Plaza paving: 0.6 m slabs, a stronger joint every 3 m. Texture coordinates in metres (as kit.flat and Batch give them). */
export function pavingMaterial() {
  if (pave) return pave;
  const S = 512, n = 5, w = S / n, c = document.createElement('canvas'); c.width = c.height = S;
  const g = c.getContext('2d'); let s = 20240611;
  const r = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    const k = 0.955 + r() * 0.07; g.fillStyle = `rgb(${Math.round(203 * k)},${Math.round(198 * k)},${Math.round(186 * k)})`; g.fillRect(x * w, y * w, w, w);
  }
  for (let i = 0; i < 2600; i++) { g.fillStyle = `rgba(${r() < 0.5 ? '90,86,78' : '235,232,224'},0.10)`; g.fillRect(r() * S, r() * S, 1 + r() * 3, 1 + r() * 3); }
  g.strokeStyle = 'rgba(120,115,105,0.75)'; g.lineWidth = 1.6;
  for (let i = 1; i < n; i++) { g.beginPath(); g.moveTo(i * w, 0); g.lineTo(i * w, S); g.moveTo(0, i * w); g.lineTo(S, i * w); g.stroke(); }
  g.fillStyle = 'rgba(104,100,92,0.9)'; g.fillRect(0, 0, S, 2.5); g.fillRect(0, S - 2.5, S, 2.5); g.fillRect(0, 0, 2.5, S); g.fillRect(S - 2.5, 0, 2.5, S);
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(1 / 3, 1 / 3); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  pave = new THREE.MeshStandardMaterial({ map: t, roughness: 0.92 }); pave.name = 'plaza-paving';
  return pave;
}

/** Point in polygon [[x, z], ...]. */
export const inPoly = (pts, x, z) => {
  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, zi] = pts[i], [xj, zj] = pts[j];
    if ((zi > z) !== (zj > z) && x < (xj - xi) * (z - zi) / (zj - zi) + xi) inside = !inside;
  }
  return inside;
};
/**
 * Returns blocked(x, z, margin): true where another item of the data stands (a solid one, or one of the given styles).
 * Used so that columns, marks and planting never end up inside a neighbour, wherever the items are moved to.
 */
export function blockedBy(ctx, self, styles = []) {
  const list = (ctx.campus ? ctx.campus.items : []).filter(i => i !== self && i.id !== self.id && ((i.solid && i.height > 2) || styles.includes(i.style)))
    .map(i => { const p = itemPolygon(i); return { p, b: bbox(p) }; });
  return (x, z, m = 0) => list.some(({ p, b }) => x > b.w - m && x < b.e + m && z > b.n - m && z < b.s + m &&
    [[0, 0], [m, 0], [-m, 0], [0, m], [0, -m]].some(([dx, dz]) => inPoly(p, x + dx, z + dz)));
}

export function build(item, ctx) {
  const b = bbox(item.points);
  ctx.add(flat(item.points, 0.04, pavingMaterial()));
  const v = new Batch(), c = new Batch(), blocked = blockedBy(ctx, item, ['walkway']);

  // white dash marks, one in the middle of every 3 m paving square of the open part
  const x0 = Math.ceil(b.w / 3) * 3 + 1.5, z0 = Math.ceil(b.n / 3) * 3 + 1.5;
  for (let x = x0; x < b.e - 0.6; x += 3) for (let z = z0; z < b.s - 0.3; z += 3) if (!blocked(x, z, 0.9)) v.slab('white', x - 0.5, 0.05, z - 0.08, 1.0, 0.012, 0.16, 'DEWSN');

  // stelae and small palms along the east edge, just west of the link walkway
  const walk = (ctx.campus ? ctx.campus.items : []).filter(i => i.style === 'walkway').map(i => itemPolygon(i));
  const edge = z => {                                   // west edge of the walkway at this z, or the rectangle's east edge
    let x = b.e;
    for (const p of walk) for (let i = 0, j = p.length - 1; i < p.length; j = i++) {
      const [xi, zi] = p[i], [xj, zj] = p[j];
      if ((zi > z) !== (zj > z)) x = Math.min(x, xi + (xj - xi) * (z - zi) / (zj - zi));
    }
    return x;
  };
  let k = 0;
  for (let z = b.n + 1.5; z < b.s - 1; z += 3, k++) {
    const x = edge(z) - 1.5;
    if (x < b.w + 1 || blocked(x, z, 1.2)) continue;
    if (k % 2 === 0) {
      v.frame(x, z).box('concrete', 0, 0.075, 0, 0.75, 0.15, 0.75, 'D').box('granite', 0, 0.9, 0, 0.45, 1.5, 0.45, 'D');
      c.frame(x, z).box('generic', 0, 0.85, 0, 0.6, 1.7, 0.6);
    } else {
      v.frame(x, z);
      for (const [dx, dz, sx, sz] of [[0, -0.6, 1.3, 0.1], [0, 0.6, 1.3, 0.1], [-0.6, 0, 0.1, 1.1], [0.6, 0, 0.1, 1.1]]) v.box('concrete', dx, 0.1, dz, sx, 0.12, sz, 'D');
      v.box('lawn', 0, 0.09, 0, 1.1, 0.02, 1.1, 'DEWSN');
      palm(v, x, z, 3.6, 0.08);
      c.frame(x, z).box('generic', 0, 1.2, 0, 0.4, 2.4, 0.4);
    }
  }
  v.frame(); c.frame();
  ctx.add(v.build({ name: item.id }));
  const cg = c.build(); ctx.add(cg).visible = false; cg.children.forEach(m => ctx.collide(m));
}
