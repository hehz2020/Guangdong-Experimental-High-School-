// Open paved court east of the canopy (item plaza-east-of-canopy), and the paving, drain gratings and small helpers
// shared with the floor under the canopy (canopy.js) and the strip under the link walkway (walkway.js).
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
// ASSUMED: slab size of the paving (0.6 m), the spacing of the dash marks (3 m both ways), size of the stelae (0.45 m square,
//   1.5 m high, on a pale base), their spacing (6 m) and that of the palms between them.
//
// IMAGINED (the owner asked for a finished, good-looking place and said that imagination should fill in what is not known):
//   - the court's centrepiece: a round bed of flowers in a granite kerb with an armillary sphere of stainless rings on a
//     dark granite drum (a sculpture made up for this model; it carries no inscription), set in two rings of darker paving;
//   - two shade trees in granite-framed pits on the north side, two benches turned toward the sphere, garden lamps, a pair of
//     litter bins, two planter boxes with shrubs and flowers beside the glass stair block's north door;
//   - slot drains along the north and west edges of the court; the flamed-granite look of the paving itself.
// The measured rectangle also covers ground that the glass stair block and the tower stand on (the data notes say so): marks,
// stelae, palms and furniture are left out wherever another solid item or the link walkway stands.
// Level of detail: paving, rings, marks, stelae, kerbs and the sphere are always drawn; trees, palms, flowers, shrubs, benches,
// lamps, bins and gratings only within about 120 m. Colliders: stelae, the bed's kerb and drum, planters, benches, lamp posts,
// tree trunks, bins.
import { THREE, flat, bbox, itemPolygon } from '../../kit.js';
import { Batch } from '../../batch.js';
import { pbr } from '../../hifi.js';
import { flatPoly, arc } from '../../shapes.js';
import { royalPalms, broadleafTrees, shrubs, flowers } from '../../flora.js';
import { gardenLamp, bench, bins, planter, treePit } from '../../street.js';
import { lm, mergeFlat, classMaterial } from './plain-block.js';

/** Plaza paving: flamed granite slabs of 0.6 m in two tones. Texture coordinates in metres (as kit.flat and Batch give them). */
export function pavingMaterial() { return pbr('paving', [0xcdc8bc, 0xb6b0a4, 5, 5, [3, 3], 43, false]); }
/** Darker granite for bands and rings in the paving. */
export const bandMaterial = () => pbr('paving', [0x8b877f, 0x7a766f, 4, 1, [2.4, 0.3], 47, false], { polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -4 });
let grate = null;
/** Cast-iron slot grating of a linear drain, 0.2 m wide. */
export function gratingMaterial() {
  if (grate) return grate;
  const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d');
  g.fillStyle = '#5a5c5e'; g.fillRect(0, 0, 64, 64); g.fillStyle = '#17181a'; for (let i = 0; i < 4; i++) g.fillRect(8 + i * 16, 6, 7, 52);
  g.strokeStyle = '#7a7c7e'; g.lineWidth = 2; g.strokeRect(1, 1, 62, 62);
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(1 / 0.4, 1 / 0.2); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  grate = new THREE.MeshStandardMaterial({ map: t, roughness: 0.6, metalness: 0.5, polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -6 }); grate.name = 'plaza-grating';
  return grate;
}
/** Slot drain on the ground from (x0, z0) to (x1, z1), axis-parallel. */
export function drain(b, x0, z0, x1, z1, y = 0.046) {
  const m = gratingMaterial();
  if (Math.abs(x1 - x0) > Math.abs(z1 - z0)) b.quad(m, [x0, y, z0 + 0.1], [x1, y, z0 + 0.1], [x1, y, z0 - 0.1], [x0, y, z0 - 0.1]);
  else b.quad(m, [x0 - 0.1, y, z0], [x0 - 0.1, y, z1], [x0 + 0.1, y, z1], [x0 + 0.1, y, z0]);
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

/** Several stock geometries as one, each with a matrix and a colour [r, g, b] (linear): position, normal, uv, color. */
export function fuse(parts) {
  let nv = 0, ni = 0; for (const [g] of parts) { nv += g.attributes.position.count; ni += g.index.count; }
  const pos = new Float32Array(nv * 3), nor = new Float32Array(nv * 3), uv = new Float32Array(nv * 2), col = new Float32Array(nv * 3), idx = new Uint32Array(ni), p = new THREE.Vector3(), nm = new THREE.Matrix3();
  let v0 = 0, i0 = 0;
  for (const [g, m, c = [1, 1, 1], uvScale = 1] of parts) {
    const A = g.attributes.position, N = g.attributes.normal, U = g.attributes.uv; nm.getNormalMatrix(m);
    for (let i = 0; i < A.count; i++) {
      p.fromBufferAttribute(A, i).applyMatrix4(m); pos[(v0 + i) * 3] = p.x; pos[(v0 + i) * 3 + 1] = p.y; pos[(v0 + i) * 3 + 2] = p.z;
      p.fromBufferAttribute(N, i).applyMatrix3(nm).normalize(); nor[(v0 + i) * 3] = p.x; nor[(v0 + i) * 3 + 1] = p.y; nor[(v0 + i) * 3 + 2] = p.z;
      if (U) { uv[(v0 + i) * 2] = U.getX(i) * uvScale; uv[(v0 + i) * 2 + 1] = U.getY(i) * uvScale; }
      col[(v0 + i) * 3] = c[0]; col[(v0 + i) * 3 + 1] = c[1]; col[(v0 + i) * 3 + 2] = c[2];
    }
    for (let i = 0; i < g.index.count; i++) idx[i0 + i] = g.index.array[i] + v0;
    v0 += A.count; i0 += g.index.count; g.dispose();
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.BufferAttribute(pos, 3)); out.setAttribute('normal', new THREE.BufferAttribute(nor, 3)); out.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  out.setAttribute('color', new THREE.BufferAttribute(col, 3)); out.setIndex(new THREE.BufferAttribute(idx, 1));
  return out;
}

/** The armillary sphere: three rings, a meridian, an equatorial band with hour studs, a tilted axis with a small globe. Centre (x, y, z), radius R. */
function armillary(x, y, z, R, low) {
  const E = (rx, ry, rz) => new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(rx, ry, rz)).setPosition(x, y, z), parts = [], seg = low ? 28 : 48, tb = low ? 5 : 8;
  const steel = [1, 1, 1], brass = [1.0, 0.82, 0.48];
  const ring = (r, tube, m, c = steel) => parts.push([new THREE.TorusGeometry(r, tube, tb, seg), m, c, 3]);
  const tilt = 0.41;                                                           // the axis leans like the earth's
  ring(R, 0.05, E(Math.PI / 2, 0, 0));                                         // horizon ring
  ring(R, 0.05, E(0, 0.3, 0));                                                 // meridian
  ring(R * 0.93, 0.04, E(Math.PI / 2 - tilt, 0.3, 0), brass);                  // equator of the tilted sphere
  ring(R * 0.93, 0.03, E(-tilt, 0.3 + Math.PI / 2, 0));                        // colure
  ring(R * 0.78, 0.028, E(Math.PI / 2 - tilt - 0.41, 0.3, 0), brass);          // ecliptic
  const ax = new THREE.Vector3(0, 1, 0).applyEuler(new THREE.Euler(-tilt, 0.3, 0, 'YXZ'));
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), ax), one = new THREE.Vector3(1, 1, 1), at = k => new THREE.Vector3(x, y, z).addScaledVector(ax, k);
  parts.push([new THREE.CylinderGeometry(0.022, 0.022, 2 * R + 0.5, 6, 1), new THREE.Matrix4().compose(at(0), q, one), steel, 3]);
  parts.push([new THREE.SphereGeometry(0.2, low ? 10 : 16, low ? 8 : 12), new THREE.Matrix4().compose(at(0), q, one), brass, 3]);
  for (const k of [-R - 0.25, R + 0.25]) parts.push([new THREE.SphereGeometry(0.06, 8, 6), new THREE.Matrix4().compose(at(k), q, one), brass, 3]);
  // four brackets from the drum up to the horizon ring
  for (let i = 0; i < 4; i++) {
    const a = i * Math.PI / 2 + 0.3, top = new THREE.Vector3(x + Math.cos(a) * R, y, z + Math.sin(a) * R), foot = new THREE.Vector3(x + Math.cos(a) * 0.55, y - R - 0.12, z + Math.sin(a) * 0.55);
    const d = top.clone().sub(foot), len = d.length(), qq = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
    parts.push([new THREE.CylinderGeometry(0.03, 0.045, len, 6, 1), new THREE.Matrix4().compose(foot.add(top).multiplyScalar(0.5), qq, one), steel, 3]);
  }
  const mesh = new THREE.Mesh(fuse(parts), classMaterial('steel')); mesh.castShadow = true; mesh.receiveShadow = true; mesh.name = 'plaza-sphere';
  return mesh;
}

export function build(item, ctx) {
  const b = bbox(item.points), low = !!ctx.lowPower;
  ctx.add(flat(item.points, 0.04, pavingMaterial()));
  const v = new Batch(), d = new Batch(), c = new Batch(), blocked = blockedBy(ctx, item, ['walkway']);
  const WH = lm('frame'), GL = lm('graniteLight'), GD = lm('graniteDark'), GR = lm('graniteRed'), ST = lm('stoneLight'), SOIL = lm('soil');

  // west edge of the walkway at this z, or the rectangle's east edge
  const walk = (ctx.campus ? ctx.campus.items : []).filter(i => i.style === 'walkway').map(i => itemPolygon(i));
  const edge = z => {
    let x = b.e;
    for (const p of walk) for (let i = 0, j = p.length - 1; i < p.length; j = i++) {
      const [xi, zi] = p[i], [xj, zj] = p[j];
      if ((zi > z) !== (zj > z)) x = Math.min(x, xi + (xj - xi) * (z - zi) / (zj - zi));
    }
    return x;
  };
  // the open part of the court: north of whatever solid item stands in the rectangle (the glass stair block)
  let zOpen = b.s; for (let z = b.n + 1; z < b.s; z += 0.5) if (blocked(b.cx, z, 0.5)) { zOpen = z - 0.5; break; }
  const cx = b.w + (Math.min(edge(b.n + 6), b.e) - 1.6 - b.w) * 0.5 + 0.9, cz = (b.n + zOpen) / 2 + 0.3, big = zOpen - b.n > 9 && !blocked(cx, cz, 3.5);

  // ---- white dash marks, one in the middle of every 3 m paving square of the open part (SEEN)
  const x0 = Math.ceil(b.w / 3) * 3 + 1.5, z0 = Math.ceil(b.n / 3) * 3 + 1.5;
  for (let x = x0; x < b.e - 0.6; x += 3) for (let z = z0; z < b.s - 0.3; z += 3) if (!blocked(x, z, 0.9) && !(big && Math.hypot(x - cx, z - cz) < 4.1)) v.slab(WH, x - 0.5, 0.045, z - 0.08, 1.0, 0.008, 0.16, 'DEWSN');

  // ---- stelae and small palms along the east edge, just west of the link walkway (SEEN)
  const palms = [], trunks = [], shrubList = [], bloom = [];
  let k = 0;
  for (let z = b.n + 1.5; z < b.s - 1; z += 3, k++) {
    const x = edge(z) - 1.5;
    if (x < b.w + 1 || blocked(x, z, 1.2)) continue;
    if (k % 2 === 0) {
      v.frame(x, z).box(ST, 0, 0.09, 0, 0.8, 0.18, 0.8, 'D').box(GR, 0, 0.93, 0, 0.45, 1.5, 0.45, 'D').box(GR, 0, 1.7, 0, 0.5, 0.05, 0.5);
      c.frame(x, z).box('generic', 0, 0.87, 0, 0.6, 1.74, 0.6);
    } else {
      v.frame(x, z);
      for (const [dx, dz, sx, sz] of [[0, -0.62, 1.36, 0.12], [0, 0.62, 1.36, 0.12], [-0.62, 0, 0.12, 1.12], [0.62, 0, 0.12, 1.12]]) v.box(ST, dx, 0.09, dz, sx, 0.18, sz, 'D');
      v.box(SOIL, 0, 0.1, 0, 1.12, 0.04, 1.12, 'DEWSN');
      palms.push([x, z, 3.8, 0.1]); for (const [dx, dz] of [[-0.36, -0.3], [0.34, -0.36], [0.3, 0.36], [-0.34, 0.34]]) shrubList.push([x + dx, z + dz, 0.2]);
      c.frame(x, z).box('generic', 0, 1.2, 0, 0.4, 2.4, 0.4);
    }
  }
  v.frame(); c.frame();

  // ---- the centrepiece: two rings of darker paving, a flower bed in a granite kerb, the sphere on a drum
  if (big) {
    const band = bandMaterial();
    for (const [r0, r1] of [[3.0, 3.3], [3.75, 3.9]]) ctx.add(flatPoly(arc(cx, cz, r1, 64), 0.047, band, { holes: [arc(cx, cz, r0, 64)], order: 1 }));
    v.frame(cx, cz);
    // kerb ring (16 sides), soil, drum in two steps
    const N = 20, ro = 1.95, ri = 1.75;
    for (let i = 0; i < N; i++) {
      const a0 = i / N * 2 * Math.PI, a1 = (i + 1) / N * 2 * Math.PI, P = (r, a, y) => [Math.cos(a) * r, y, Math.sin(a) * r];
      v.quad(GL, P(ro, a1, 0.32), P(ro, a0, 0.32), P(ri, a0, 0.32), P(ri, a1, 0.32));                 // top
      v.quad(GL, P(ro, a1, 0), P(ro, a0, 0), P(ro, a0, 0.32), P(ro, a1, 0.32));                       // outer face
      v.quad(GL, P(ri, a0, 0.2), P(ri, a1, 0.2), P(ri, a1, 0.32), P(ri, a0, 0.32));                   // inner face
      v.quad(SOIL, P(ri, a1, 0.22), P(ri, a0, 0.22), P(0.7, a0, 0.22), P(0.7, a1, 0.22));
    }
    v.cyl(GD, 0, 0, 0, 0.95, 0.55, 28).cyl(GL, 0, 0.55, 0, 0.8, 0.1, 28).cyl(GD, 0, 0.65, 0, 0.62, 0.42, 28);
    v.frame();
    c.frame(cx, cz).cyl('generic', 0, 0, 0, ro, 0.32, 12).cyl('generic', 0, 0.33, 0, 0.9, 2.9, 10); c.frame();
    const R = 1.15; ctx.add(armillary(cx, 1.07 + R + 0.12, cz, R, low));
    let s = 91; const rnd = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
    for (let i = 0; i < (low ? 60 : 150); i++) { const a = rnd() * 6.283, r = 1.0 + 0.72 * Math.sqrt(rnd()); bloom.push([cx + Math.cos(a) * r, cz + Math.sin(a) * r]); }
    for (let i = 0; i < 8; i++) { const a = i / 8 * 6.283 + 0.2; shrubList.push([cx + Math.cos(a) * 1.18, cz + Math.sin(a) * 1.18, 0.2]); }
  }

  // ---- furniture (near view): trees in pits, benches, lamps, bins, planters, slot drains
  const trees = [];
  if (big) {
    for (const [tx, tz] of [[cx - 3.6, b.n + 1.5], [cx + 2.7, b.n + 1.5]]) if (!blocked(tx, tz, 1.5)) { treePit(d, tx, tz, 1.7); trees.push([tx, tz, 8.5]); trunks.push([tx, tz]); }
    bench(d, c, cx - 4.6, cz + 0.4, Math.PI / 2); bench(d, c, cx - 0.2, b.n + 1.2, 0);
    gardenLamp(d, c, b.w + 1.1, b.n + 0.9); gardenLamp(d, c, Math.min(edge(cz - 0.8), b.e) - 1.5, cz - 0.8); gardenLamp(d, c, b.w + 1.0, zOpen - 0.9);
    bins(d, c, cx - 4.7, cz - 2.4, Math.PI / 2);
    // planter boxes either side of the glass block's north door
    for (const px of [cx - 3.1, cx + 1.3]) if (!blocked(px, zOpen - 0.75, 0.3)) {
      planter(d, c, px, zOpen - 0.75, 0, 2.2, 0.8, 0.5);
      for (let i = 0; i < 4; i++) shrubList.push([px - 0.75 + i * 0.5, zOpen - 0.75, 0.24, 0.5]);
      for (let i = 0; i < (low ? 6 : 14); i++) bloom.push([px - 0.95 + 1.9 * ((i * 0.618) % 1), zOpen - 0.75 + (i % 2 ? 0.26 : -0.26), 0.44]);
    }
    drain(d, b.w + 0.3, b.n + 0.25, Math.min(edge(b.n), b.e) - 0.4, b.n + 0.25); drain(d, b.w + 1.75, b.n + 0.6, b.w + 1.75, zOpen - 0.3);
  }
  for (const [tx, tz] of trunks) c.slab('generic', tx - 0.25, 0, tz - 0.25, 0.5, 3, 0.5);

  ctx.add(mergeFlat(v.build({ name: item.id }), true));
  const near = mergeFlat(d.build({ name: item.id + '-furniture' }), true);
  if (palms.length) near.add(royalPalms(palms, { seed: 9 }).group);
  if (trees.length) near.add(broadleafTrees(trees, { seed: 4, low }).group);
  const lowBeds = shrubList.filter(q => q[3] === undefined), highBeds = shrubList.filter(q => q[3] !== undefined);
  if (lowBeds.length) near.add(shrubs(lowBeds, { seed: 12, hex: 0x3a6a30 }));
  if (highBeds.length) { const sh = shrubs(highBeds.map(q => [q[0], q[1], q[2]]), { seed: 13 }); sh.position.y = 0.42; near.add(sh); }
  const bedFlowers = bloom.filter(q => q[2] === undefined), boxFlowers = bloom.filter(q => q[2] !== undefined);
  if (bedFlowers.length) near.add(flowers(bedFlowers, [0xd8342c, 0xf2c230, 0xf0f0e8], { seed: 6, size: 0.34, y: 0.22 }));
  if (boxFlowers.length) near.add(flowers(boxFlowers.map(q => [q[0], q[1]]), [0xe0559a, 0xf2c230], { seed: 7, size: 0.3, y: 0.44 }));
  ctx.detail(ctx.add(near), b.cx, b.cz, low ? 80 : 125);
  const cg = c.build(); ctx.add(cg).visible = false; cg.children.forEach(m => ctx.collide(m));
}
