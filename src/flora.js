// Plants for the "realistic" parts: broadleaf trees and royal palms built from leaf cards (small textured quads with
// cut-out leaves), clipped hedges, shrubs and bedding flowers. Everything is generated in code; nothing is a photograph.
// All of it is generic planting, not a survey of real trees.
import * as THREE from 'three';
import { rng, pbr, plain } from './hifi.js';

/** Shared clock for the gentle sway of leaves (seconds); the page advances it. */
export const WIND = { value: 0 };

// ---- textures -----------------------------------------------------------------------------------------------------
/** RGBA texture from a canvas whose transparent pixels are given the average colour, so cut-out edges do not turn dark in the mipmaps. */
function cutout(canvas, avg) {
  const S = canvas.width, H = canvas.height, d = canvas.getContext('2d').getImageData(0, 0, S, H).data;
  const out = new Uint8Array(S * H * 4);
  for (let y = 0; y < H; y++) for (let x = 0; x < S; x++) {             // flip rows: data textures start at the bottom
    const i = (y * S + x) * 4, o = ((H - 1 - y) * S + x) * 4, a = d[i + 3] / 255;
    out[o] = d[i] * a + avg[0] * (1 - a); out[o + 1] = d[i + 1] * a + avg[1] * (1 - a); out[o + 2] = d[i + 2] * a + avg[2] * (1 - a); out[o + 3] = d[i + 3];
  }
  const t = new THREE.DataTexture(out, S, H, THREE.RGBAFormat); t.colorSpace = THREE.SRGBColorSpace;
  t.magFilter = THREE.LinearFilter; t.minFilter = THREE.LinearMipmapLinearFilter; t.generateMipmaps = true; t.anisotropy = 4; t.needsUpdate = true;
  return t;
}
const texCache = new Map();
function leafCluster(hue) {
  const key = 'leaf' + hue; if (texCache.has(key)) return texCache.get(key);
  const S = 512, c = document.createElement('canvas'); c.width = c.height = S; const g = c.getContext('2d'), r = rng(700 + hue);
  for (let i = 0; i < 150; i++) {
    const a = r() * 6.283, d = Math.pow(r(), 0.7) * S * (0.3 + 0.1 * Math.abs(Math.sin(a * 2.5 + 1.0))), x = S / 2 + Math.cos(a) * d, y = S / 2 + Math.sin(a) * d, len = 40 + r() * 46, wid = len * (0.38 + 0.2 * r()), l = 20 + r() * 22;
    g.save(); g.translate(x, y); g.rotate(r() * 6.283);
    g.fillStyle = `hsl(${hue - 16 + r() * 30},${40 + r() * 25}%,${l}%)`;
    g.beginPath(); g.moveTo(-len / 2, 0); g.quadraticCurveTo(0, -wid, len / 2, 0); g.quadraticCurveTo(0, wid, -len / 2, 0); g.fill();
    g.strokeStyle = `hsla(${hue},35%,${l + 16}%,0.55)`; g.lineWidth = 2; g.beginPath(); g.moveTo(-len / 2, 0); g.lineTo(len / 2, 0); g.stroke();
    g.restore();
  }
  const t = cutout(c, [44, 82, 34]); texCache.set(key, t); return t;
}
function frondTexture() {
  if (texCache.has('frond')) return texCache.get('frond');
  const W = 128, H = 512, c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d'), r = rng(733);
  for (let y = 6; y < H - 4; y += 5) {                      // leaflets leave the midrib (left edge, u = 0) and sweep toward the tip (top)
    const len = W * (0.55 + 0.45 * Math.sin(Math.PI * Math.min(1, (H - y) / H * 1.15))) * (0.85 + 0.15 * r()), l = 24 + r() * 16;
    g.strokeStyle = `hsl(${92 + r() * 18},${45 + r() * 20}%,${l}%)`; g.lineWidth = 3.2 + r() * 1.4; g.lineCap = 'round';
    g.beginPath(); g.moveTo(0, y); g.quadraticCurveTo(len * 0.5, y - 10, len, y - 26 - r() * 10); g.stroke();
  }
  g.strokeStyle = '#6f8f3a'; g.lineWidth = 7; g.beginPath(); g.moveTo(2, H); g.lineTo(2, 0); g.stroke();
  const t = cutout(c, [52, 94, 38]); texCache.set('frond', t); return t;
}

// ---- materials ----------------------------------------------------------------------------------------------------
const matCache = new Map();
/** Cut-out foliage material: both sides lit alike (normals are not flipped for back faces) and a slow sway. */
function foliage(map, name, sway = 0.05) {
  if (matCache.has(name)) return matCache.get(name);
  const m = new THREE.MeshStandardMaterial({ map, alphaTest: 0.42, side: THREE.DoubleSide, vertexColors: true, roughness: 0.82, metalness: 0 });
  m.name = 'hifi-' + name; m.alphaToCoverage = true;
  m.onBeforeCompile = shader => {
    shader.uniforms.uWind = WIND;
    shader.vertexShader = shader.vertexShader.replace('#include <common>', '#include <common>\nuniform float uWind;')
      .replace('#include <begin_vertex>', `#include <begin_vertex>
        { float ph = position.x * 0.7 + position.z * 0.9 + position.y * 0.4;
          #ifdef USE_INSTANCING
            ph += instanceMatrix[3].x * 0.31 + instanceMatrix[3].z * 0.17;
          #endif
          transformed += vec3(sin(uWind * 1.3 + ph), 0.35 * sin(uWind * 1.9 + ph * 1.7), cos(uWind * 1.1 + ph * 1.3)) * ${sway.toFixed(3)}; }`);
    shader.fragmentShader = shader.fragmentShader.replace('#include <normal_fragment_begin>', THREE.ShaderChunk.normal_fragment_begin.replace('gl_FrontFacing ? 1.0 : - 1.0', '1.0'));
  };
  m.customProgramCacheKey = () => 'foliage' + sway;
  matCache.set(name, m); return m;
}

// ---- geometry helpers -----------------------------------------------------------------------------------------------
/** Tube along points with a radius at each point; texture coordinates in metres (around, along). */
function tube(points, radii, seg = 8) {
  const pos = [], nor = [], uv = [], idx = [], up = new THREE.Vector3(0, 1, 0), t = new THREE.Vector3(), a = new THREE.Vector3(), b = new THREE.Vector3(); let len = 0;
  points.forEach((p, i) => {
    t.subVectors(points[Math.min(points.length - 1, i + 1)], points[Math.max(0, i - 1)]).normalize();
    a.crossVectors(t, Math.abs(t.y) > 0.99 ? new THREE.Vector3(1, 0, 0) : up).normalize(); b.crossVectors(t, a).normalize();
    if (i) len += p.distanceTo(points[i - 1]);
    for (let j = 0; j <= seg; j++) {
      const ang = j / seg * Math.PI * 2, c = Math.cos(ang), s = Math.sin(ang), nx = a.x * c + b.x * s, ny = a.y * c + b.y * s, nz = a.z * c + b.z * s;
      pos.push(p.x + nx * radii[i], p.y + ny * radii[i], p.z + nz * radii[i]); nor.push(nx, ny, nz); uv.push(ang * radii[0], len);
    }
  });
  for (let i = 0; i < points.length - 1; i++) for (let j = 0; j < seg; j++) { const k = i * (seg + 1) + j; idx.push(k, k + seg + 1, k + 1, k + 1, k + seg + 1, k + seg + 2); }
  return { pos, nor, uv, idx };
}
function geometryOf(parts, withColor = false) {
  const pos = [], nor = [], uv = [], col = [], idx = [];
  for (const p of parts) { const base = pos.length / 3; pos.push(...p.pos); nor.push(...p.nor); uv.push(...p.uv); if (withColor) col.push(...p.col); for (const i of p.idx) idx.push(base + i); }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  if (withColor) g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  g.setIndex(idx); return g;
}

// ---- broadleaf tree -------------------------------------------------------------------------------------------------
/** One tree shape: { trunk, crown } geometries, built around the origin with the foot at y = 0. */
function broadleafShape(seed, { height = 11, spread = 5.2, cards = 300 } = {}) {
  const r = rng(seed), V = (x, y, z) => new THREE.Vector3(x, y, z);
  const trunkH = height * (0.36 + 0.08 * r()), cy = trunkH + (height - trunkH) * 0.5, ry = (height - trunkH) * 0.62, lean = V((r() - 0.5) * 0.5, 0, (r() - 0.5) * 0.5);
  const parts = [tube([V(0, 0, 0), V(lean.x * 0.3, trunkH * 0.5, lean.z * 0.3), V(lean.x, trunkH, lean.z)], [0.34 + 0.02 * height, 0.26, 0.2], 9)];
  const clusters = [];
  for (let i = 0; i < 11; i++) {
    const az = i * 2.399 + r() * 0.5, el = -0.15 + 1.25 * r(), k = 0.5 + 0.38 * r();
    clusters.push(V(Math.cos(az) * Math.cos(el) * spread * k, cy + Math.sin(el) * ry * (0.55 + 0.4 * r()), Math.sin(az) * Math.cos(el) * spread * k));
  }
  for (let i = 0; i < 6; i++) {                             // boughs from the top of the trunk into the first clusters
    const c = clusters[i], mid = V(lean.x + (c.x - lean.x) * 0.45, trunkH + (c.y - trunkH) * 0.6, lean.z + (c.z - lean.z) * 0.45);
    parts.push(tube([V(lean.x, trunkH - 0.3, lean.z), mid, c], [0.15, 0.1, 0.04], 6));
  }
  const crown = { pos: [], nor: [], uv: [], col: [], idx: [] }, centre = V(0, cy, 0), n = V(), t1 = V(), t2 = V(), p = V(), sn = V();
  for (let i = 0; i < cards; i++) {
    const c = clusters[i % clusters.length], rad = 1.7 + 0.9 * r();
    do { p.set(r() * 2 - 1, r() * 2 - 1, r() * 2 - 1); } while (p.lengthSq() > 1);
    p.multiplyScalar(rad).add(c);
    n.copy(p).sub(centre).normalize().add(V(r() - 0.5, r() - 0.5, r() - 0.5).multiplyScalar(1.1)).normalize();
    t1.crossVectors(n, Math.abs(n.y) > 0.9 ? V(1, 0, 0) : V(0, 1, 0)).normalize(); t2.crossVectors(n, t1);
    const ang = r() * 6.283, s = (1.5 + 1.1 * r()) * 0.5, ca = Math.cos(ang) * s, sa = Math.sin(ang) * s, base = crown.pos.length / 3;
    sn.copy(p).sub(centre); sn.y *= 0.7; sn.normalize().lerp(V(0, 1, 0), 0.28).normalize();
    const depth = Math.min(1, p.clone().sub(centre).length() / (spread * 0.9)), shade = (0.5 + 0.55 * depth + 0.16 * (p.y - cy) / ry) * (0.86 + 0.22 * r()), warm = 0.94 + 0.12 * r();
    for (const [u, v] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
      const x = u * ca - v * sa, y = u * sa + v * ca;
      crown.pos.push(p.x + t1.x * x + t2.x * y, p.y + t1.y * x + t2.y * y, p.z + t1.z * x + t2.z * y); crown.nor.push(sn.x, sn.y, sn.z);
      crown.uv.push(u * 0.5 + 0.5, v * 0.5 + 0.5); crown.col.push(shade * warm, shade, shade * (2 - warm) * 0.96);
    }
    crown.idx.push(base, base + 1, base + 2, base, base + 2, base + 3);
  }
  return { trunk: geometryOf(parts), crown: geometryOf([crown], true) };
}

// ---- royal palm -----------------------------------------------------------------------------------------------------
function palmShape(seed, { height = 10.5 } = {}) {
  const r = rng(seed), V = (x, y, z) => new THREE.Vector3(x, y, z), top = height * 0.8;
  const trunk = geometryOf([tube([V(0, 0, 0), V(0, 0.5, 0), V(0, 1.8, 0), V(0, top * 0.6, 0), V(0, top, 0)], [0.42, 0.36, 0.27, 0.22, 0.2], 12)]);
  const shaft = geometryOf([tube([V(0, top, 0), V(0, top + (height - top) * 0.55, 0), V(0, height, 0)], [0.22, 0.2, 0.13], 12)]);
  const f = { pos: [], nor: [], uv: [], col: [], idx: [] }, up = V(0, 1, 0), T = V(), Sd = V(), N = V(), P = V();
  const fronds = 17, SEG = 9, L = 4.3;
  for (let i = 0; i < fronds; i++) {
    const az = i * 2.399 + r() * 0.4, k = i / (fronds - 1), el0 = 1.25 - 1.45 * k + (r() - 0.5) * 0.2, bend = 0.9 + 0.8 * k, len = L * (0.8 + 0.3 * (1 - Math.abs(k - 0.5) * 2)) * (0.9 + 0.2 * r());
    P.set(0, height - 0.15, 0); const shade = 0.72 + 0.34 * (1 - k);
    for (let s = 0; s <= SEG; s++) {
      const t = s / SEG, el = el0 - bend * t * t;
      T.set(Math.cos(az) * Math.cos(el), Math.sin(el), Math.sin(az) * Math.cos(el));
      Sd.crossVectors(T, up).normalize(); N.crossVectors(Sd, T).normalize();
      const w = 1.0 * Math.pow(Math.sin(Math.PI * (0.06 + 0.9 * t)), 0.55), droop = 0.42;
      for (const side of [-1, 1]) {
        const base = f.pos.length / 3;
        f.pos.push(P.x, P.y, P.z, P.x + (Sd.x * side * Math.cos(droop) - N.x * Math.sin(droop)) * w, P.y + (Sd.y * side * Math.cos(droop) - N.y * Math.sin(droop)) * w, P.z + (Sd.z * side * Math.cos(droop) - N.z * Math.sin(droop)) * w);
        f.nor.push(N.x, N.y, N.z, N.x, N.y, N.z); f.uv.push(0.02, t, 1, t); f.col.push(shade, shade, shade, shade * 0.9, shade * 0.95, shade * 0.9);
        if (s < SEG) { const a = base, b = base + 1, c = base + 4, d = base + 5; side > 0 ? f.idx.push(a, b, d, a, d, c) : f.idx.push(a, d, b, a, c, d); }
      }
      P.addScaledVector(T, len / SEG);
    }
  }
  return { trunk, shaft, fronds: geometryOf([f], true) };
}

// ---- conifer (a tall, tiered tree of the kind that flanks formal entrances) ------------------------------------------
function needleTexture() {
  if (texCache.has('needles')) return texCache.get('needles');
  const S = 256, c = document.createElement('canvas'); c.width = c.height = S; const g = c.getContext('2d'), r = rng(751);
  for (let k = 0; k < 9; k++) {                           // twigs fanning out from the left edge, each lined with short needles
    const a = (k - 4) * 0.2 + (r() - 0.5) * 0.1, len = S * (0.7 + 0.28 * r());
    for (let s = 0.04; s < 1; s += 0.012) {
      const x = Math.cos(a) * len * s, y = S / 2 + Math.sin(a) * len * s, l = 16 + r() * 16, n = 9 + r() * 8, side = r() < 0.5 ? -1 : 1;
      g.strokeStyle = `hsl(${118 + r() * 26},${32 + r() * 22}%,${l}%)`; g.lineWidth = 2 + r() * 1.4;
      g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a + side * 0.9) * n, y + Math.sin(a + side * 0.9) * n); g.stroke();
    }
  }
  const t = cutout(c, [30, 62, 36]); texCache.set('needles', t); return t;
}
function coniferShape(seed, { height = 12, radius = 2.5, cards = 300 } = {}) {
  const r = rng(seed), V = (x, y, z) => new THREE.Vector3(x, y, z);
  const trunk = geometryOf([tube([V(0, 0, 0), V(0, height * 0.5, 0), V(0, height * 0.97, 0)], [0.24, 0.14, 0.03], 8)]);
  const f = { pos: [], nor: [], uv: [], col: [], idx: [] }, rad = V(), tan = V(), dirn = V(), up = V(0, 1, 0), sn = V();
  for (let i = 0; i < cards; i++) {
    const t = Math.pow(r(), 0.85), y = height * (0.1 + 0.88 * t), reach = radius * Math.pow(1 - t, 0.8) * (0.75 + 0.25 * r()) + 0.25, az = r() * 6.283, droop = 0.25 + 0.3 * r();
    rad.set(Math.cos(az), 0, Math.sin(az)); tan.set(-rad.z, 0, rad.x); dirn.copy(rad).multiplyScalar(Math.cos(droop)).addScaledVector(up, -Math.sin(droop));
    const half = 0.55 + 0.35 * (1 - t), base = f.pos.length / 3, shade = (0.55 + 0.5 * r()) * (0.72 + 0.3 * t);
    sn.copy(rad).multiplyScalar(0.55).addScaledVector(up, 0.83).normalize();
    for (const [u, w] of [[0, -1], [1, -1], [1, 1], [0, 1]]) {    // u along the branch from the trunk outward, w across
      f.pos.push(rad.x * 0.1 + dirn.x * reach * u + tan.x * w * half, y + dirn.y * reach * u, rad.z * 0.1 + dirn.z * reach * u + tan.z * w * half);
      f.nor.push(sn.x, sn.y, sn.z); f.uv.push(u, w * 0.5 + 0.5); f.col.push(shade * 0.95, shade, shade * 0.92);
    }
    f.idx.push(base, base + 1, base + 2, base, base + 2, base + 3);
  }
  return { trunk, crown: geometryOf([f], true) };
}
/** Tall conifers. list: [[x, z, height]...]. */
export function conifers(list, { seed = 5, low = false } = {}) {
  const group = new THREE.Group(), r = rng(seed * 613 + 1), inst = list.map(([x, z, h]) => [x, z, h / 12, r() * 6.283]);
  const shape = coniferShape(seed * 29, { cards: low ? 160 : 300 });
  group.add(instanced(shape.trunk, pbr('bark'), inst, 'hifi-conifer-trunks'), instanced(shape.crown, foliage(needleTexture(), 'needles', 0.03), inst, 'hifi-conifer-crowns'));
  return { group, trunks: list.map(([x, z]) => [x, z, 0.28]) };
}

// ---- public: scatter instances ----------------------------------------------------------------------------------------
function instanced(geo, material, list, name, { cast = true } = {}) {
  const m = new THREE.InstancedMesh(geo, material, list.length), M = new THREE.Matrix4(), q = new THREE.Quaternion(), up = new THREE.Vector3(0, 1, 0);
  list.forEach(([x, z, s, rot, y = 0], i) => m.setMatrixAt(i, M.compose(new THREE.Vector3(x, y, z), q.setFromAxisAngle(up, rot), new THREE.Vector3(s, s, s))));
  m.castShadow = cast; m.receiveShadow = true; m.name = name; m.frustumCulled = false; return m;
}
/**
 * Broadleaf trees. list: [[x, z, height]...] in the parent's coordinates. Returns a Group; `trunks` lists [x, z, radius]
 * for colliders. `low` halves the number of leaf cards.
 */
export function broadleafTrees(list, { seed = 1, low = false, hue = 100 } = {}) {
  const group = new THREE.Group(), r = rng(seed * 977 + 5), variants = 3, per = Array.from({ length: variants }, () => []);
  list.forEach(([x, z, h], i) => per[i % variants].push([x, z, (h / 11) * (0.92 + 0.16 * r()), r() * 6.283]));
  const bark = pbr('bark'), leaves = foliage(leafCluster(hue), 'leaves' + hue, 0.05);
  per.forEach((inst, v) => {
    if (!inst.length) return;
    const shape = broadleafShape(seed * 31 + v * 7, { cards: low ? 150 : 300 });
    group.add(instanced(shape.trunk, bark, inst, 'hifi-tree-trunks'), instanced(shape.crown, leaves, inst, 'hifi-tree-crowns'));
  });
  return { group, trunks: list.map(([x, z, h]) => [x, z, 0.3 + 0.02 * h]) };
}
/** Royal palms. list: [[x, z, height]...]. */
export function royalPalms(list, { seed = 2 } = {}) {
  const group = new THREE.Group(), r = rng(seed * 911 + 3), variants = 2, per = Array.from({ length: variants }, () => []);
  list.forEach(([x, z, h], i) => per[i % variants].push([x, z, (h / 10.5) * (0.95 + 0.1 * r()), r() * 6.283]));
  const fr = foliage(frondTexture(), 'fronds', 0.07), trunkMat = pbr('palmTrunk'), shaftMat = plain('crownshaft', 0x6a8f44, 0.5, 0);
  per.forEach((inst, v) => {
    if (!inst.length) return;
    const shape = palmShape(seed * 17 + v * 5);
    group.add(instanced(shape.trunk, trunkMat, inst, 'hifi-palm-trunks'), instanced(shape.shaft, shaftMat, inst, 'hifi-palm-shafts'), instanced(shape.fronds, fr, inst, 'hifi-palm-fronds'));
  });
  return { group, trunks: list.map(([x, z]) => [x, z, 0.36]) };
}
/** Rounded shrubs. list: [[x, z, radius]...]. */
export function shrubs(list, { seed = 3, hex = 0x2f5a2a } = {}) {
  const r = rng(seed * 733), geo = new THREE.IcosahedronGeometry(1, 2), p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) { const k = 1 + 0.16 * (rng(i * 13 + 7)() - 0.5); p.setXYZ(i, p.getX(i) * k, Math.max(-0.2, p.getY(i)) * 0.78 * k, p.getZ(i) * k); }
  const nrm = geo.attributes.normal, w = new THREE.Vector3();          // smooth normals (the geometry has one vertex per face corner)
  for (let i = 0; i < p.count; i++) { w.set(p.getX(i), p.getY(i) * 1.3 + 0.1, p.getZ(i)).normalize(); nrm.setXYZ(i, w.x, w.y, w.z); }
  const uv = geo.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * 4, uv.getY(i) * 2);
  return instanced(geo, pbr('hedge', [hex]), list.map(([x, z, rad]) => [x, z, rad * (0.9 + 0.2 * r()), r() * 6.283, rad * 0.12]), 'hifi-shrubs');
}
function bloomTexture(hex) {
  const key = 'bloom' + hex; if (texCache.has(key)) return texCache.get(key);
  const S = 128, c = document.createElement('canvas'); c.width = c.height = S; const g = c.getContext('2d'), r = rng(761 + hex);
  const rgb = [hex >> 16 & 255, hex >> 8 & 255, hex & 255], css = k => `rgb(${rgb.map(v => Math.min(255, Math.round(v * k))).join(',')})`;
  for (let i = 0; i < 26; i++) {                           // leaves and stems fanning up from the bottom edge
    const x0 = S * (0.2 + 0.6 * r()), a = -Math.PI / 2 + (r() - 0.5) * 1.5, len = S * (0.3 + 0.35 * r());
    g.strokeStyle = `hsl(${95 + r() * 30},${38 + r() * 20}%,${18 + r() * 16}%)`; g.lineWidth = 3 + r() * 5; g.lineCap = 'round';
    g.beginPath(); g.moveTo(x0, S); g.quadraticCurveTo(x0 + Math.cos(a) * len * 0.4, S - len * 0.6, x0 + Math.cos(a) * len, S + Math.sin(a) * len); g.stroke();
  }
  for (let i = 0; i < 9; i++) {                            // blooms: five petals round a yellow eye
    const x = S * (0.14 + 0.72 * r()), y = S * (0.12 + 0.5 * r()), rad = 7 + r() * 6, k = 0.82 + 0.3 * r();
    for (let p = 0; p < 5; p++) { const a = p / 5 * 6.283 + r(); g.fillStyle = css(k * (0.9 + 0.15 * r())); g.beginPath(); g.ellipse(x + Math.cos(a) * rad * 0.55, y + Math.sin(a) * rad * 0.55, rad * 0.62, rad * 0.45, a, 0, 6.283); g.fill(); }
    g.fillStyle = '#e8c330'; g.beginPath(); g.arc(x, y, rad * 0.26, 0, 6.283); g.fill();
  }
  const t = cutout(c, [40, 70, 30]); texCache.set(key, t); return t;
}
/**
 * Bedding flowers: small upright crossed cards with cut-out blooms, one instanced mesh per colour.
 * spots: [[x, z]...]; colours: hex list. y: height of the soil the plants stand on.
 */
export function flowers(spots, colours, { seed = 4, size = 0.3, y = 0.2 } = {}) {
  const r = rng(seed * 577), group = new THREE.Group(), per = colours.map(() => []);
  for (const s of spots) per[Math.floor(r() * colours.length)].push(s);
  const pos = [], nor = [], uv = [], idx = [];
  for (let k = 0; k < 3; k++) {                            // three cards crossing at the stem
    const a = k * Math.PI / 3, c = Math.cos(a) * 0.5, s = Math.sin(a) * 0.5, base = pos.length / 3;
    pos.push(-c, 0, -s, c, 0, s, c, 1, s, -c, 1, -s); for (let i = 0; i < 4; i++) nor.push(0, 1, 0); uv.push(0, 0, 1, 0, 1, 1, 0, 1); idx.push(base, base + 1, base + 2, base, base + 2, base + 3);
  }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); geo.setIndex(idx);
  geo.setAttribute('color', new THREE.Float32BufferAttribute(new Float32Array(36).fill(1), 3));
  const M = new THREE.Matrix4(), q = new THREE.Quaternion(), up = new THREE.Vector3(0, 1, 0);
  per.forEach((list, ci) => {
    if (!list.length) return;
    const mesh = new THREE.InstancedMesh(geo, foliage(bloomTexture(colours[ci]), 'bloom' + colours[ci], 0.012), list.length);
    list.forEach(([x, z], i) => { const s = size * (0.75 + 0.5 * r()); mesh.setMatrixAt(i, M.compose(new THREE.Vector3(x, y, z), q.setFromAxisAngle(up, r() * 6.283), new THREE.Vector3(s, s * (0.85 + 0.3 * r()), s))); });
    mesh.castShadow = false; mesh.receiveShadow = true; mesh.name = 'hifi-flowers'; mesh.frustumCulled = false; group.add(mesh);
  });
  return group;
}
