// The collision octree, built faster. three's Octree (addons/math/Octree.js) tests every triangle against all eight
// children at every level with a full separating-axis test, allocating arrays for each test, and makes all eight
// children of every node it splits, empty or not. For this campus (about 81,000 collision triangles, many of them large,
// so the same triangle sits in about 80 leaves and the tree has millions of nodes) that took 11 to 16 s of the load
// (measured in the software renderer here, 2026-11-21, on a machine shared with other jobs).
//
// FastOctree builds exactly the same tree: the same boxes, the same children in the same order, the same triangles in
// the same order in every leaf, so every query (the player's capsule test) gives the same answer. Checked by building
// both from the campus's colliders and comparing them node by node and triangle by triangle (see the engine pass 2 notes).
//  - triangles are read straight from each geometry's index and positions (Octree.fromGraphNode first copies every
//    attribute of every geometry through toNonIndexed());
//  - each triangle's bounding box is computed once; one that lies clearly on one side of all three middle planes of a
//    box goes straight to its one child (it meets the box, so it meets that child and no other); only triangles that
//    cross or touch a middle plane are tested child by child: a child its bounding box misses is skipped (the full
//    test's box-face axes would reject it), a child that holds it entirely takes it, the rest get the full test;
//  - only children that receive triangles are made (three's are made and then dropped when empty), and child nodes
//    carry only what queries use (box, subTrees, triangles).
import * as THREE from 'three';
import { Octree } from 'three/addons/math/Octree.js';

const EPS = 1e-6;
export class FastOctree extends Octree {
  fromGraphNode(group) {
    group.updateWorldMatrix(true, true);
    group.traverse(obj => {
      if (obj.isMesh !== true || !this.layers.test(obj.layers)) return;
      const pos = obj.geometry.getAttribute('position'), index = obj.geometry.index, m = obj.matrixWorld;
      if (!pos) return;
      const n = index ? index.count : pos.count;
      for (let i = 0; i < n; i += 3) {
        const t = new THREE.Triangle();
        t.a.fromBufferAttribute(pos, index ? index.getX(i) : i).applyMatrix4(m);
        t.b.fromBufferAttribute(pos, index ? index.getX(i + 1) : i + 1).applyMatrix4(m);
        t.c.fromBufferAttribute(pos, index ? index.getX(i + 2) : i + 2).applyMatrix4(m);
        this.addTriangle(t);
      }
    });
    this.build();
    return this;
  }
  build() {
    this.calcBox();
    const tris = this.triangles, n = tris.length, bb = new Float64Array(n * 6);
    for (let i = 0; i < n; i++) {
      const { a, b, c } = tris[i], o = i * 6;
      bb[o] = Math.min(a.x, b.x, c.x); bb[o + 1] = Math.min(a.y, b.y, c.y); bb[o + 2] = Math.min(a.z, b.z, c.z);
      bb[o + 3] = Math.max(a.x, b.x, c.x); bb[o + 4] = Math.max(a.y, b.y, c.y); bb[o + 5] = Math.max(a.z, b.z, c.z);
    }
    const all = new Int32Array(n); for (let i = 0; i < n; i++) all[i] = i;
    this.triangles = [];
    splitNode(this, all, 0, tris, bb, this.trianglesPerLeaf, this.maxLevel, this.layers);
    return this;
  }
}

/** A child node: what the queries of Octree use, without the root's bounds and layers objects of its own. */
function child(box, layers) {
  const o = Object.create(FastOctree.prototype);
  o.box = box; o.bounds = null; o.subTrees = []; o.triangles = []; o.layers = layers; o.trianglesPerLeaf = 8; o.maxLevel = 16;
  return o;
}
const MIN = new Float64Array(24);
// Box3.intersectsTriangle (separating-axis test) with the same arithmetic in the same order, so the same answer to the
// last bit, but without the arrays and vectors three.js makes on every call (they were most of the build's time).
function sep(ax, ay, az, ex, ey, ez, v0x, v0y, v0z, v1x, v1y, v1z, v2x, v2y, v2z) {
  const r = ex * Math.abs(ax) + ey * Math.abs(ay) + ez * Math.abs(az);
  const p0 = v0x * ax + v0y * ay + v0z * az, p1 = v1x * ax + v1y * ay + v1z * az, p2 = v2x * ax + v2y * ay + v2z * az;
  return Math.max(-Math.max(p0, p1, p2), Math.min(p0, p1, p2)) > r;
}
function boxMeetsTriangle(nx, ny, nz, Mx, My, Mz, t) {
  if (Mx < nx || My < ny || Mz < nz) return false;
  const cx = (nx + Mx) * 0.5, cy = (ny + My) * 0.5, cz = (nz + Mz) * 0.5, ex = Mx - cx, ey = My - cy, ez = Mz - cz;
  const v0x = t.a.x - cx, v0y = t.a.y - cy, v0z = t.a.z - cz, v1x = t.b.x - cx, v1y = t.b.y - cy, v1z = t.b.z - cz, v2x = t.c.x - cx, v2y = t.c.y - cy, v2z = t.c.z - cz;
  const f0x = v1x - v0x, f0y = v1y - v0y, f0z = v1z - v0z, f1x = v2x - v1x, f1y = v2y - v1y, f1z = v2z - v1z, f2x = v0x - v2x, f2y = v0y - v2y, f2z = v0z - v2z;
  if (sep(0, -f0z, f0y, ex, ey, ez, v0x, v0y, v0z, v1x, v1y, v1z, v2x, v2y, v2z) || sep(0, -f1z, f1y, ex, ey, ez, v0x, v0y, v0z, v1x, v1y, v1z, v2x, v2y, v2z) || sep(0, -f2z, f2y, ex, ey, ez, v0x, v0y, v0z, v1x, v1y, v1z, v2x, v2y, v2z) ||
      sep(f0z, 0, -f0x, ex, ey, ez, v0x, v0y, v0z, v1x, v1y, v1z, v2x, v2y, v2z) || sep(f1z, 0, -f1x, ex, ey, ez, v0x, v0y, v0z, v1x, v1y, v1z, v2x, v2y, v2z) || sep(f2z, 0, -f2x, ex, ey, ez, v0x, v0y, v0z, v1x, v1y, v1z, v2x, v2y, v2z) ||
      sep(-f0y, f0x, 0, ex, ey, ez, v0x, v0y, v0z, v1x, v1y, v1z, v2x, v2y, v2z) || sep(-f1y, f1x, 0, ex, ey, ez, v0x, v0y, v0z, v1x, v1y, v1z, v2x, v2y, v2z) || sep(-f2y, f2x, 0, ex, ey, ez, v0x, v0y, v0z, v1x, v1y, v1z, v2x, v2y, v2z)) return false;
  if (sep(1, 0, 0, ex, ey, ez, v0x, v0y, v0z, v1x, v1y, v1z, v2x, v2y, v2z) || sep(0, 1, 0, ex, ey, ez, v0x, v0y, v0z, v1x, v1y, v1z, v2x, v2y, v2z) || sep(0, 0, 1, ex, ey, ez, v0x, v0y, v0z, v1x, v1y, v1z, v2x, v2y, v2z)) return false;
  return !sep(f0y * f1z - f0z * f1y, f0z * f1x - f0x * f1z, f0x * f1y - f0y * f1x, ex, ey, ez, v0x, v0y, v0z, v1x, v1y, v1z, v2x, v2y, v2z);
}
function splitNode(node, list, level, tris, bb, perLeaf, maxLevel, layers) {
  const lo = node.box.min, hi = node.box.max, hx = (hi.x - lo.x) * 0.5, hy = (hi.y - lo.y) * 0.5, hz = (hi.z - lo.z) * 0.5;
  const mx = lo.x + hx, my = lo.y + hy, mz = lo.z + hz, lists = [null, null, null, null, null, null, null, null];
  // child c = x * 4 + y * 2 + z, its box as Octree.split makes it (min = parent min + (x, y, z) * half, max = min + half)
  const mins = MIN.slice(0, 24);
  for (let c = 0; c < 8; c++) { mins[c * 3] = lo.x + (c >> 2) * hx; mins[c * 3 + 1] = lo.y + ((c >> 1) & 1) * hy; mins[c * 3 + 2] = lo.z + (c & 1) * hz; }
  for (let k = list.length - 1; k >= 0; k--) {          // Octree.split pops the parent's triangles from the end
    const i = list[k], o = i * 6, x0 = bb[o], y0 = bb[o + 1], z0 = bb[o + 2], x1 = bb[o + 3], y1 = bb[o + 4], z1 = bb[o + 5];
    const sx = x1 < mx - EPS ? 0 : x0 > mx + EPS ? 1 : -1, sy = y1 < my - EPS ? 0 : y0 > my + EPS ? 1 : -1, sz = z1 < mz - EPS ? 0 : z0 > mz + EPS ? 1 : -1;
    if (sx >= 0 && sy >= 0 && sz >= 0) { const c = sx * 4 + sy * 2 + sz; (lists[c] || (lists[c] = [])).push(i); continue; }
    for (let c = 0; c < 8; c++) {
      const ax = mins[c * 3], ay = mins[c * 3 + 1], az = mins[c * 3 + 2], Mx = ax + hx, My = ay + hy, Mz = az + hz;
      if (x0 > Mx || x1 < ax || y0 > My || y1 < ay || z0 > Mz || z1 < az) continue;
      let take = x0 >= ax + EPS && x1 <= Mx - EPS && y0 >= ay + EPS && y1 <= My - EPS && z0 >= az + EPS && z1 <= Mz - EPS;
      if (!take) take = boxMeetsTriangle(ax, ay, az, Mx, My, Mz, tris[i]);
      if (take) (lists[c] || (lists[c] = [])).push(i);
    }
  }
  for (let c = 0; c < 8; c++) {
    const l = lists[c]; if (!l) continue;
    const ax = mins[c * 3], ay = mins[c * 3 + 1], az = mins[c * 3 + 2];
    const sub = child(new THREE.Box3(new THREE.Vector3(ax, ay, az), new THREE.Vector3(ax + hx, ay + hy, az + hz)), layers);
    sub.trianglesPerLeaf = perLeaf; sub.maxLevel = maxLevel;
    if (l.length > perLeaf && level < maxLevel) splitNode(sub, l, level + 1, tris, bb, perLeaf, maxLevel, layers);
    else sub.triangles = l.map(i => tris[i]);
    node.subTrees.push(sub);
  }
}
