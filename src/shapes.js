// Flat and swept geometry used by the ground-level modules: polygons, ribbons along a path, solids of revolution.
// Texture coordinates are in metres everywhere.
import * as THREE from 'three';

function finish(pos, nor, uv, idx) {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); return g;
}
/** A material that sits on top of what lies under it without flicker: its own copy with a depth offset. */
export function layered(material, offset) {
  if (!offset) return material;
  const key = '_layer' + offset; if (!material.userData[key]) { const m = material.clone(); m.name = material.name; m.polygonOffset = true; m.polygonOffsetFactor = offset; m.polygonOffsetUnits = offset * 2; material.userData[key] = m; }
  return material.userData[key];
}
/** Geometry of a flat polygon [[x, z]...] at height y, facing up. holes: list of point lists. */
export function polyGeometry(pts, y, holes = []) {
  const V = q => new THREE.Vector2(q[0], q[1]), all = [...pts, ...holes.flat()], pos = [], nor = [], uv = [], idx = [];
  for (const [x, z] of all) { pos.push(x, y, z); nor.push(0, 1, 0); uv.push(x, z); }
  for (const [a, b, c] of THREE.ShapeUtils.triangulateShape(pts.map(V), holes.map(h => h.map(V)))) {
    const cr = (all[b][0] - all[a][0]) * (all[c][1] - all[a][1]) - (all[b][1] - all[a][1]) * (all[c][0] - all[a][0]);
    cr < 0 ? idx.push(a, b, c) : idx.push(a, c, b);
  }
  return finish(pos, nor, uv, idx);
}
/** Mesh of a flat polygon. order: render order; offset: negative values win the depth test against lower layers. */
export function flatPoly(pts, y, material, { holes = [], order = 0, offset = 0 } = {}) {
  const mesh = new THREE.Mesh(polyGeometry(pts, y, holes), layered(material, offset)); mesh.receiveShadow = true; mesh.renderOrder = order; return mesh;
}
export const rect = (x0, z0, x1, z1) => [[x0, z0], [x1, z0], [x1, z1], [x0, z1]];
/** Points on a circle or an arc (a0 to a1, radians; angle 0 points to +x, a quarter turn to +z). */
export function arc(cx, cz, r, n = 48, a0 = 0, a1 = Math.PI * 2) {
  const full = a1 - a0 >= Math.PI * 2 - 1e-6;
  return Array.from({ length: n }, (_, i) => { const a = a0 + (a1 - a0) * i / (full ? n : n - 1); return [cx + Math.cos(a) * r, cz + Math.sin(a) * r]; });
}
/**
 * Flat ribbon of a given width along a path [[x, z]...] at height y (a painted line, a kerb top). closed joins the ends.
 * Several ribbons can share one geometry: pass `into` (an object { pos, nor, uv, idx }) and build it with ribbonMesh.
 */
export function ribbon(path, width, y, into, closed = false) {
  const n = path.length, h = width / 2, base = into.pos.length / 3; let len = 0;
  for (let i = 0; i < n; i++) {
    const a = path[closed ? (i + n - 1) % n : Math.max(0, i - 1)], b = path[closed ? (i + 1) % n : Math.min(n - 1, i + 1)];
    let dx = b[0] - a[0], dz = b[1] - a[1]; const l = Math.hypot(dx, dz) || 1; dx /= l; dz /= l;
    if (i) len += Math.hypot(path[i][0] - path[i - 1][0], path[i][1] - path[i - 1][1]);
    into.pos.push(path[i][0] - dz * h, y, path[i][1] + dx * h, path[i][0] + dz * h, y, path[i][1] - dx * h);
    into.nor.push(0, 1, 0, 0, 1, 0); into.uv.push(0, len, width, len);
  }
  const segs = closed ? n : n - 1;
  for (let i = 0; i < segs; i++) { const p = base + i * 2, q = base + ((i + 1) % n) * 2; into.idx.push(p, q, p + 1, p + 1, q, q + 1); }
  return into;
}
export const strips = () => ({ pos: [], nor: [], uv: [], idx: [] });
/** A filled quad on the ground from four corners in order, into a shared strip geometry. */
export function patch(q, y, into) {
  const base = into.pos.length / 3; for (const [x, z] of q) { into.pos.push(x, y, z); into.nor.push(0, 1, 0); into.uv.push(x, z); }
  const cr = (q[1][0] - q[0][0]) * (q[2][1] - q[0][1]) - (q[1][1] - q[0][1]) * (q[2][0] - q[0][0]);
  cr < 0 ? into.idx.push(base, base + 1, base + 2, base, base + 2, base + 3) : into.idx.push(base, base + 2, base + 1, base, base + 3, base + 2);
  return into;
}
/** Mesh from a shared strip geometry; faces up whichever way the path ran. */
export function stripMesh(into, material, { order = 0, offset = 0 } = {}) {
  const m = layered(material, offset).clone(); m.name = material.name; m.side = THREE.DoubleSide;
  if (offset) { m.polygonOffset = true; m.polygonOffsetFactor = offset; m.polygonOffsetUnits = offset * 2; }
  const mesh = new THREE.Mesh(finish(into.pos, into.nor, into.uv, into.idx), m); mesh.receiveShadow = true; mesh.renderOrder = order; return mesh;
}
/** Convex polygon cut to the band z0..z1. */
export function clipZ(poly, z0, z1) {
  const cut = (pts, keep, at) => { const out = []; for (let i = 0; i < pts.length; i++) { const a = pts[i], b = pts[(i + 1) % pts.length], ia = keep(a[1]), ib = keep(b[1]);
    if (ia) out.push(a); if (ia !== ib) { const t = (at - a[1]) / (b[1] - a[1]); out.push([a[0] + (b[0] - a[0]) * t, at]); } } return out; };
  return cut(cut(poly, z => z >= z0, z0), z => z <= z1, z1);
}
/**
 * Solid of revolution about the vertical through (cx, cz): profile [[radius, y]...] listed bottom to top on the outside;
 * flat-shaded per profile segment. a0, a1: an arc instead of the full turn.
 */
export function lathe(profile, cx, cz, material, seg = 64, a0 = 0, a1 = Math.PI * 2) {
  const pos = [], nor = [], uv = [], idx = [];
  for (let k = 0; k < profile.length - 1; k++) {
    const [r0, y0] = profile[k], [r1, y1] = profile[k + 1], len = Math.hypot(r1 - r0, y1 - y0) || 1, ny = (r0 - r1) / len, nr = (y1 - y0) / len, base = pos.length / 3;
    for (let i = 0; i <= seg; i++) {
      const a = a0 + (a1 - a0) * i / seg, c = Math.cos(a), s = Math.sin(a);
      pos.push(cx + c * r0, y0, cz + s * r0, cx + c * r1, y1, cz + s * r1); nor.push(c * nr, ny, s * nr, c * nr, ny, s * nr);
      uv.push(a * (r0 + r1) / 2, 0, a * (r0 + r1) / 2, len);
    }
    for (let i = 0; i < seg; i++) { const q = base + i * 2; idx.push(q, q + 1, q + 3, q, q + 3, q + 2); }
  }
  const mesh = new THREE.Mesh(finish(pos, nor, uv, idx), material); mesh.castShadow = mesh.receiveShadow = true; return mesh;
}
