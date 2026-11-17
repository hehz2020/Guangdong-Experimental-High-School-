// Shared helpers for everything that builds geometry. Coordinates: x east, y up, z south, metres.
import * as THREE from 'three';

const cache = new Map();
const PALETTE = {
  wallWhite: [0xf1efe8, 0.85], wallCream: [0xe9dcb8, 0.85], wallMaroon: [0x8a2f2b, 0.8], brickRed: [0xa5452f, 0.9],
  terracotta: [0xb5563a, 0.85], concrete: [0xb9b6ad, 0.9], roofGrey: [0x6f7173, 0.95], roofPale: [0xdcdad2, 0.8],
  metalWhite: [0xf4f4f2, 0.5], glassTeal: [0x3f8f86, 0.25], glassDark: [0x2c3a40, 0.2], glassGreen: [0x6fae9a, 0.2],
  trackRed: [0x9c4235, 0.95], apronGreen: [0x2f8a6a, 0.95], grass: [0x5f9a4a, 1.0], lawn: [0x6aa552, 1.0],
  paving: [0xc9c3b6, 0.95], asphalt: [0x55585c, 0.95], water: [0x3d5a55, 0.3], earth: [0x77805f, 1.0], generic: [0xd9d6cf, 0.9],
  courtGreen: [0x2f7a55, 0.95], courtRed: [0xa9483d, 0.95], seatBlue: [0x2f5fb3, 0.8], steel: [0xb8bcc0, 0.4],
};
/** Shared MeshStandardMaterial by palette name. */
export function mat(name) {
  if (!cache.has(name)) {
    const [color, roughness] = PALETTE[name] || PALETTE.generic;
    cache.set(name, new THREE.MeshStandardMaterial({ color, roughness, metalness: name === 'steel' ? 0.6 : 0 }));
  }
  return cache.get(name);
}

/** Prism over a ground polygon [[x,z],...] from y0 to y1. */
export function prism(points, y0, y1, material) {
  const shape = new THREE.Shape(points.map(([x, z]) => new THREE.Vector2(x, -z)));
  const geo = new THREE.ExtrudeGeometry(shape, { depth: y1 - y0, bevelEnabled: false });
  geo.rotateX(-Math.PI / 2); geo.translate(0, y0, 0);
  const m = new THREE.Mesh(geo, material); m.castShadow = m.receiveShadow = true; return m;
}
/** Flat polygon lying on the ground at height y. */
export function flat(points, y, material) {
  const geo = new THREE.ShapeGeometry(new THREE.Shape(points.map(([x, z]) => new THREE.Vector2(x, -z))));
  geo.rotateX(-Math.PI / 2); geo.translate(0, y, 0);
  const m = new THREE.Mesh(geo, material); m.receiveShadow = true; return m;
}
/** Axis-aligned box given its centre, size and base height. */
export function box(cx, cz, sx, sz, y0, y1, material) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(sx, y1 - y0, sz), material);
  m.position.set(cx, (y0 + y1) / 2, cz); m.castShadow = m.receiveShadow = true; return m;
}
export function bbox(points) {
  let w = Infinity, e = -Infinity, n = Infinity, s = -Infinity;
  for (const [x, z] of points) { w = Math.min(w, x); e = Math.max(e, x); n = Math.min(n, z); s = Math.max(s, z); }
  return { w, e, n, s, cx: (w + e) / 2, cz: (n + s) / 2, sx: e - w, sz: s - n };
}
export function circlePoints(cx, cz, r, n = 40) {
  return Array.from({ length: n }, (_, i) => [cx + r * Math.cos(i / n * 2 * Math.PI), cz + r * Math.sin(i / n * 2 * Math.PI)]);
}
/** Ground polygon of an item whatever its shape. */
export function itemPolygon(item) { return item.shape === 'circle' ? circlePoints(item.cx, item.cz, item.radius) : item.points; }

/** Stadium outline (two straights joined by semicircles), long axis north-south, as [[x,z],...]. */
export function stadium(cx, cz, straight, radius, n = 48) {
  const pts = [], hs = straight / 2;
  for (let i = 0; i <= n; i++) { const a = Math.PI * i / n; pts.push([cx + radius * Math.cos(a), cz + hs + radius * Math.sin(a)]); }      // south bend, east to west
  for (let i = 0; i <= n; i++) { const a = Math.PI + Math.PI * i / n; pts.push([cx + radius * Math.cos(a), cz - hs + radius * Math.sin(a)]); } // north bend, west to east
  return pts;
}
export { THREE };
