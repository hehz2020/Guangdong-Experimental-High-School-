// Simple vegetation added to a Batch (so a whole row of trees is one or two draw calls).
import * as THREE from 'three';

const mats = {};
function pm(name) {
  if (!mats[name]) mats[name] = new THREE.MeshStandardMaterial({ color: { trunk: 0x6b5a45, palmTrunk: 0x8a7a62, leaf: 0x3f7a3a, leafDark: 0x2f6332, frond: 0x4d8a3c }[name], roughness: 0.95, side: name === 'frond' ? THREE.DoubleSide : THREE.FrontSide });
  return mats[name];
}
const rnd = (x, z, k = 1) => { const s = Math.sin(x * 12.9898 + z * 78.233 + k * 37.719) * 43758.5453; return s - Math.floor(s); };

/** Palm: slender trunk and a crown of drooping fronds. */
export function palm(batch, x, z, h = 6, y0 = 0) {
  batch.frame(x, z, 0, y0).cyl(pm('palmTrunk'), 0, 0, 0, 0.16, h, 8, false);
  const n = 9, len = h * 0.42;
  for (let i = 0; i < n; i++) {
    const a = i / n * Math.PI * 2 + rnd(x, z) * 6, c = Math.cos(a), s = Math.sin(a);
    const base = [x, y0 + h, z], mid = [x + c * len * 0.55, y0 + h + len * 0.22, z + s * len * 0.55], tip = [x + c * len, y0 + h - len * 0.25, z + s * len];
    const side = [-s * 0.35, 0, c * 0.35];
    batch.frame(0, 0, 0).quad(pm('frond'), [base[0] - side[0], base[1], base[2] - side[2]], [base[0] + side[0], base[1], base[2] + side[2]], [mid[0] + side[0], mid[1], mid[2] + side[2]], [mid[0] - side[0], mid[1], mid[2] - side[2]]);
    batch.quad(pm('frond'), [mid[0] - side[0], mid[1], mid[2] - side[2]], [mid[0] + side[0], mid[1], mid[2] + side[2]], [tip[0], tip[1], tip[2]], [tip[0], tip[1], tip[2]]);
  }
  batch.frame(0, 0, 0);
}
/** Broadleaf tree: trunk and a few stacked crown blobs (low-polygon). */
export function tree(batch, x, z, h = 8, y0 = 0) {
  const r = h * (0.26 + rnd(x, z, 2) * 0.1);
  batch.frame(x, z, rnd(x, z, 3) * 3, y0).cyl(pm('trunk'), 0, 0, 0, 0.14 + h * 0.012, h * 0.45, 7, false);
  batch.cyl(pm('leafDark'), 0, h * 0.36, 0, r, h * 0.3, 9).cyl(pm('leaf'), 0.15 * r, h * 0.58, -0.1 * r, r * 0.82, h * 0.26, 9).cyl(pm('leaf'), -0.1 * r, h * 0.78, 0.1 * r, r * 0.55, h * 0.2, 8);
  batch.frame(0, 0, 0);
}
