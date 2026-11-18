// Shared helpers for everything that builds geometry. Coordinates: x east, y up, z south, metres.
import * as THREE from 'three';
import { SURFACES, waterNormals } from './hifi.js';

const cache = new Map();
// name: [colour, roughness, texture kind, tile size in metres]
const PALETTE = {
  wallWhite: [0xf1efe8, 0.8, 'tile', 0.6], wallCream: [0xe9dcb8, 0.85, 'tile', 0.6], wallMaroon: [0x8a2f2b, 0.75, 'tile', 0.45],
  brickRed: [0xa5452f, 0.9, 'brick', 1.0], terracotta: [0xb5563a, 0.85, 'panel', 1.2], concrete: [0xb9b6ad, 0.92, 'noise', 3],
  roofGrey: [0x6f7173, 0.95, 'noise', 4], roofPale: [0xdcdad2, 0.8, 'noise', 4], metalWhite: [0xf4f4f2, 0.45], steel: [0xb8bcc0, 0.35],
  glassTeal: [0x2f7d78, 0.08], glassDark: [0x1f2a30, 0.06], glassGreen: [0x5fa590, 0.08], glassClear: [0x9fc3cc, 0.05],
  trackRed: [0x9c4235, 0.95, 'noise', 2], apronGreen: [0x2f8a6a, 0.95, 'noise', 2], grass: [0x5f9a4a, 1.0, 'grass', 4], lawn: [0x6aa552, 1.0, 'grass', 2.6],
  paving: [0xc9c3b6, 0.9, 'paving', 1.2], pavingRed: [0xb98a78, 0.9, 'paving', 1.2], asphalt: [0x55585c, 0.95, 'noise', 3], water: [0x3d5a55, 0.15],
  earth: [0x62994b, 1.0, 'grass', 2.9], generic: [0xd9d6cf, 0.9], courtGreen: [0x2f7a55, 0.9, 'noise', 2], courtRed: [0xa9483d, 0.9, 'noise', 2],
  seatBlue: [0x2f5fb3, 0.6], seatRed: [0xc0392b, 0.6], seatGreen: [0x2e9c6b, 0.6], wood: [0xc9a878, 0.7, 'wood', 1.2], woodDark: [0x8a5a34, 0.7, 'wood', 1.2],
  floorGrey: [0x8f8f8b, 0.6, 'paving', 0.8], black: [0x18181a, 0.6], white: [0xffffff, 0.6], red: [0xc8201c, 0.6], gold: [0xd9a520, 0.4], granite: [0x7a2f2a, 0.35, 'noise', 1],
};
const GLASS = new Set(['glassTeal', 'glassDark', 'glassGreen', 'glassClear', 'water']);

// Deterministic pseudo-random numbers so generated textures are identical on every load.
function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
function canvasTexture(kind, hex, tile) {
  const S = 256, c = document.createElement('canvas'); c.width = c.height = S;
  const g = c.getContext('2d'), r = rng(hex ^ 0x9e3779b9);
  // Work on the raw sRGB bytes: THREE.Color would convert the hex value to linear space and darken the canvas.
  const rgb = [hex >> 16 & 255, hex >> 8 & 255, hex & 255];
  const shade = k => `rgb(${rgb.map(ch => Math.max(0, Math.min(255, Math.round(ch * k)))).join(',')})`;
  g.fillStyle = shade(1); g.fillRect(0, 0, S, S);
  if (kind === 'brick') {            // 1 m tile: 4 bricks wide, 12 courses
    const bw = S / 4, bh = S / 12; g.fillStyle = shade(0.72); g.fillRect(0, 0, S, S);
    for (let row = 0; row < 12; row++) for (let i = -1; i < 4; i++) {
      g.fillStyle = shade(0.88 + r() * 0.22); g.fillRect(i * bw + (row % 2 ? bw / 2 : 0) + 1.5, row * bh + 1.5, bw - 3, bh - 3);
    }
  } else if (kind === 'tile' || kind === 'paving' || kind === 'panel') {
    const n = kind === 'tile' ? 6 : kind === 'paving' ? 3 : 2, w = S / n;
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) { g.fillStyle = shade(0.95 + r() * 0.08); g.fillRect(x * w, y * w, w, w); }
    g.strokeStyle = shade(kind === 'paving' ? 0.8 : 0.93); g.lineWidth = kind === 'tile' ? 1 : 2.5;
    for (let i = 0; i <= n; i++) { g.beginPath(); g.moveTo(i * w, 0); g.lineTo(i * w, S); g.moveTo(0, i * w); g.lineTo(S, i * w); g.stroke(); }
  } else if (kind === 'wood') {
    for (let y = 0; y < S; y += 2) { g.fillStyle = shade(0.9 + r() * 0.16); g.fillRect(0, y, S, 2); }
    g.strokeStyle = shade(0.75); g.lineWidth = 1.5; for (let i = 0; i <= 4; i++) { g.beginPath(); g.moveTo(0, i * S / 4); g.lineTo(S, i * S / 4); g.stroke(); }
  } else {                           // 'noise' and 'grass': mottled speckle
    const n = kind === 'grass' ? 9000 : 5000, lo = kind === 'grass' ? 0.8 : 0.9, span = kind === 'grass' ? 0.4 : 0.2;
    for (let i = 0; i < n; i++) { g.fillStyle = shade(lo + r() * span); const s = 1 + r() * (kind === 'grass' ? 3 : 5); g.fillRect(r() * S, r() * S, s, s); }
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(1 / tile, 1 / tile); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  return t;
}
/**
 * Shared material by palette name. Textured ones tile in real metres (texture coordinates must be in metres).
 * The surfaces come from hifi.js: colour, normal and roughness maps computed in code. Glass carries a painted reflection
 * and a slight tilt per pane; its names are kept because the lighting module lights windows by name after dusk.
 */
export function mat(name) {
  if (!cache.has(name)) {
    const [color, roughness, kind, tile] = PALETTE[name] || PALETTE.generic;
    let m;
    if (typeof document === 'undefined') m = new THREE.MeshStandardMaterial({ color, roughness });
    else if (GLASS.has(name) && name !== 'water') {
      const s = SURFACES.glazing(name === 'glassDark' ? 0x4c6672 : name === 'glassTeal' ? 0x3f9a8e : name === 'glassGreen' ? 0x6fb59c : 0xa9cdd4, 3, 3, [3.6, 3.6], name.length);
      m = new THREE.MeshStandardMaterial({ map: s.map, normalMap: s.normalMap, roughness: 0.06, metalness: name === 'glassClear' ? 0.2 : 0.55, envMapIntensity: 1.4 });
      if (name === 'glassClear') { m.transparent = true; m.opacity = 0.34; m.depthWrite = false; }
    } else if (name === 'water') {
      m = new THREE.MeshStandardMaterial({ color: 0x24504c, roughness: 0.06, metalness: 0.45, normalMap: waterNormals(), envMapIntensity: 1.5 });
      m.normalMap = m.normalMap.clone(); m.normalMap.repeat.set(1 / 5, 1 / 5); m.normalMap.needsUpdate = true; m.normalScale.set(0.5, 0.5);
    } else if (kind) {
      const s = kind === 'tile' ? SURFACES.tiles(color, 6, tile, roughness - 0.3)
        : kind === 'brick' ? SURFACES.brick(color)
        : kind === 'paving' ? SURFACES.paving(color, shadeHex(color, 0.9), 3, 3, [tile, tile], color & 255, false)
        : kind === 'panel' ? SURFACES.cladding(color, tile / 2, tile / 2, 0.7)
        : kind === 'wood' ? SURFACES.boards(color, tile)
        : kind === 'grass' ? SURFACES.turf(color, tile)
        : name === 'asphalt' ? SURFACES.asphalt(color)
        : /track|apron|court/.test(name) ? SURFACES.rubber(color, tile)
        : SURFACES.concrete(color);
      m = new THREE.MeshStandardMaterial({ map: s.map, normalMap: s.normalMap || null, roughnessMap: s.roughnessMap || null, roughness: s.roughness, metalness: s.metalness });
    } else m = new THREE.MeshStandardMaterial({ color, roughness, metalness: name === 'steel' ? 0.85 : name === 'gold' ? 0.9 : 0 });
    m.name = name; cache.set(name, m);
  }
  return cache.get(name);
}
const shadeHex = (hex, k) => ((Math.round((hex >> 16 & 255) * k) << 16) | (Math.round((hex >> 8 & 255) * k) << 8) | Math.round((hex & 255) * k));
export const MATERIAL_NAMES = Object.keys(PALETTE);

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
