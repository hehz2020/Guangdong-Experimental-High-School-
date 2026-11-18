// Collects many simple solids and emits ONE merged mesh per material, with texture coordinates in metres
// so tiled textures (brick, tile, paving) keep a constant real-world scale on every part.
//
//   const b = new Batch();
//   b.frame(x, z, angle);                 // local frame: origin at (x, 0, z), local +X rotated by `angle` radians from east toward north
//   b.box('brickRed', cx, cy, cz, sx, sy, sz);   // centre and size, in the current local frame (y is up)
//   b.cyl('metalWhite', cx, y0, cz, radius, height);
//   group.add(b.build());                 // THREE.Group, one Mesh per material
import * as THREE from 'three';
import { mat } from './kit.js';
import { broadleafTrees, royalPalms } from './flora.js';

const FACES = [ // normal, then the two in-plane axes (u, v) used for texture coordinates
  { n: [1, 0, 0], u: [0, 0, -1], v: [0, 1, 0] }, { n: [-1, 0, 0], u: [0, 0, 1], v: [0, 1, 0] },
  { n: [0, 1, 0], u: [1, 0, 0], v: [0, 0, -1] }, { n: [0, -1, 0], u: [1, 0, 0], v: [0, 0, 1] },
  { n: [0, 0, 1], u: [1, 0, 0], v: [0, 1, 0] }, { n: [0, 0, -1], u: [-1, 0, 0], v: [0, 1, 0] },
];

export class Batch {
  constructor() { this.parts = new Map(); this.m = new THREE.Matrix4(); this.nm = new THREE.Matrix3(); }
  /** Set the local frame for the solids added next. angle 0 = local +X points east; positive turns toward north. */
  frame(x = 0, z = 0, angle = 0, y = 0) {
    this.m.makeRotationY(angle).setPosition(x, y, z); this.nm.getNormalMatrix(this.m); return this;
  }
  /** Use an arbitrary local frame (THREE.Matrix4). */
  setMatrix(m) { this.m.copy(m); this.nm.getNormalMatrix(this.m); return this; }
  /** Thin square bar from a to b, both [x, y, z] in world coordinates. Changes the current frame: call frame() again afterwards. */
  strut(material, a, b, t = 0.1) {
    const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), d = new THREE.Vector3().subVectors(B, A), len = d.length();
    if (len < 1e-6) return this;
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(1, 0, 0), d.normalize());
    this.setMatrix(new THREE.Matrix4().compose(A.add(B).multiplyScalar(0.5), q, new THREE.Vector3(1, 1, 1)));
    return this.box(material, 0, 0, 0, len, t, t);
  }
  _part(material) {
    const key = typeof material === 'string' ? material : material.uuid;
    if (!this.parts.has(key)) this.parts.set(key, { material: typeof material === 'string' ? mat(material) : material, pos: [], nor: [], uv: [], idx: [] });
    return this.parts.get(key);
  }
  _vert(p, x, y, z, nx, ny, nz, u, v) {
    const a = new THREE.Vector3(x, y, z).applyMatrix4(this.m), b = new THREE.Vector3(nx, ny, nz).applyMatrix3(this.nm).normalize();
    p.pos.push(a.x, a.y, a.z); p.nor.push(b.x, b.y, b.z); p.uv.push(u, v);
  }
  /** Box by centre and size in the local frame. skip: string of faces to leave out, from 'E','W','U','D','S','N' (local +x,-x,+y,-y,+z,-z). */
  box(material, cx, cy, cz, sx, sy, sz, skip = '') {
    if (sx <= 0 || sy <= 0 || sz <= 0) return this;
    const p = this._part(material), h = [sx / 2, sy / 2, sz / 2], c = [cx, cy, cz], names = 'EWUDSN';
    FACES.forEach((f, fi) => {
      if (skip.includes(names[fi])) return;
      const base = p.pos.length / 3;
      for (const [su, sv] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
        const q = [0, 1, 2].map(i => c[i] + f.n[i] * h[i] + f.u[i] * su * h[i] + f.v[i] * sv * h[i]);
        this._vert(p, q[0], q[1], q[2], f.n[0], f.n[1], f.n[2], q[0] * f.u[0] + q[1] * f.u[1] + q[2] * f.u[2], q[0] * f.v[0] + q[1] * f.v[1] + q[2] * f.v[2]);
      }
      p.idx.push(base, base + 1, base + 2, base, base + 2, base + 3);
    });
    return this;
  }
  /** Box given by its low corner and size (often handier for walls): x0,y0,z0 then sizes. */
  slab(material, x0, y0, z0, sx, sy, sz, skip) { return this.box(material, x0 + sx / 2, y0 + sy / 2, z0 + sz / 2, sx, sy, sz, skip); }
  /** Vertical cylinder standing on y0. */
  cyl(material, cx, y0, cz, radius, height, seg = 14, caps = true) {
    const p = this._part(material), base = p.pos.length / 3;
    for (let i = 0; i <= seg; i++) {
      const a = i / seg * Math.PI * 2, x = Math.cos(a), z = Math.sin(a), u = a * radius;
      this._vert(p, cx + x * radius, y0, cz + z * radius, x, 0, z, u, 0);
      this._vert(p, cx + x * radius, y0 + height, cz + z * radius, x, 0, z, u, height);
    }
    for (let i = 0; i < seg; i++) { const a = base + i * 2; p.idx.push(a, a + 1, a + 3, a, a + 3, a + 2); }
    if (caps) for (const [y, ny] of [[y0 + height, 1], [y0, -1]]) {
      const c0 = p.pos.length / 3; this._vert(p, cx, y, cz, 0, ny, 0, 0, 0);
      for (let i = 0; i <= seg; i++) { const a = i / seg * Math.PI * 2; this._vert(p, cx + Math.cos(a) * radius, y, cz + Math.sin(a) * radius, 0, ny, 0, Math.cos(a) * radius, Math.sin(a) * radius); }
      for (let i = 1; i <= seg; i++) ny > 0 ? p.idx.push(c0, c0 + i + 1, c0 + i) : p.idx.push(c0, c0 + i, c0 + i + 1);
    }
    return this;
  }
  /** Flat quad from four corners given in order (counter-clockwise seen from the side it should face), local frame. */
  quad(material, a, b, c, d) {
    const p = this._part(material), base = p.pos.length / 3;
    const n = new THREE.Vector3().subVectors(new THREE.Vector3(...b), new THREE.Vector3(...a)).cross(new THREE.Vector3().subVectors(new THREE.Vector3(...d), new THREE.Vector3(...a))).normalize();
    const w = new THREE.Vector3(...b).distanceTo(new THREE.Vector3(...a)), hgt = new THREE.Vector3(...d).distanceTo(new THREE.Vector3(...a));
    [[a, 0, 0], [b, w, 0], [c, w, hgt], [d, 0, hgt]].forEach(([q, u, v]) => this._vert(p, q[0], q[1], q[2], n.x, n.y, n.z, u, v));
    p.idx.push(base, base + 1, base + 2, base, base + 2, base + 3); return this;
  }
  /** One merged mesh per material. */
  build({ castShadow = true, receiveShadow = true, name = '' } = {}) {
    const group = new THREE.Group(); group.name = name;
    for (const p of this.parts.values()) {
      if (!p.idx.length) continue;
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(p.pos, 3));
      g.setAttribute('normal', new THREE.Float32BufferAttribute(p.nor, 3));
      g.setAttribute('uv', new THREE.Float32BufferAttribute(p.uv, 2));
      g.setIndex(p.idx);
      const mesh = new THREE.Mesh(g, p.material); mesh.castShadow = castShadow && !p.material.transparent; mesh.receiveShadow = receiveShadow;
      group.add(mesh);
    }
    // plants asked for through plants.js stand in the same coordinates as the batch
    if (this.plants) {
      if (this.plants.trees.length) group.add(broadleafTrees(this.plants.trees, { seed: 5 }).group);
      if (this.plants.palms.length) group.add(royalPalms(this.plants.palms, { seed: 6 }).group);
    }
    return group;
  }
}
