// Procedural PBR surfaces: colour, normal and roughness maps computed in code at load time (no image files).
// Used by the "realistic" parts (the gate and pool scene first). Texture coordinates are in metres everywhere, so a
// surface is defined with the size in metres that one repeat of its texture covers.
import * as THREE from 'three';

let ANISO = 8;
/** Called once by the page with the renderer's capabilities. */
export function setTextureQuality({ anisotropy = 8 } = {}) { ANISO = Math.max(1, Math.min(16, anisotropy)); }

// ---- deterministic noise ------------------------------------------------------------------------------------------
export function rng(seed) { let s = (seed >>> 0) || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const sm = t => t * t * (3 - 2 * t);
/** Tileable value noise, S x S samples, `cells` lattice cells per side, values 0..1. */
function valueNoise(S, cells, seed) {
  const r = rng(seed), g = new Float32Array(cells * cells); for (let i = 0; i < g.length; i++) g[i] = r();
  const out = new Float32Array(S * S), k = cells / S;
  for (let y = 0; y < S; y++) {
    const fy = y * k, y0 = Math.floor(fy), ty = sm(fy - y0), ya = (y0 % cells) * cells, yb = ((y0 + 1) % cells) * cells;
    for (let x = 0; x < S; x++) {
      const fx = x * k, x0 = Math.floor(fx), tx = sm(fx - x0), xa = x0 % cells, xb = (x0 + 1) % cells;
      const a = g[ya + xa] + (g[ya + xb] - g[ya + xa]) * tx, b = g[yb + xa] + (g[yb + xb] - g[yb + xa]) * tx;
      out[y * S + x] = a + (b - a) * ty;
    }
  }
  return out;
}
/** Fractal sum of value noise, normalised to 0..1. */
function fbm(S, cells, octaves, seed, gain = 0.5) {
  const out = new Float32Array(S * S); let amp = 1, total = 0;
  for (let o = 0; o < octaves; o++) {
    const n = valueNoise(S, Math.min(S / 2, cells << o), seed + o * 101);
    for (let i = 0; i < out.length; i++) out[i] += n[i] * amp;
    total += amp; amp *= gain;
  }
  for (let i = 0; i < out.length; i++) out[i] /= total;
  return out;
}
function white(S, seed) { const r = rng(seed), o = new Float32Array(S * S); for (let i = 0; i < o.length; i++) o[i] = r(); return o; }

// ---- from arrays to textures --------------------------------------------------------------------------------------
function tex(canvas, tile, srgb) {
  const t = new THREE.CanvasTexture(canvas); t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(1 / tile[0], 1 / tile[1]); t.anisotropy = ANISO; if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
function canvasOf(S, fill) {
  const c = document.createElement('canvas'); c.width = c.height = S; const g = c.getContext('2d'), im = g.createImageData(S, S);
  fill(im.data); g.putImageData(im, 0, 0); return c;
}
/**
 * Builds the three maps of one surface.
 * col(i, x, y) -> [r, g, b] in sRGB bytes; height: Float32Array (any range); rough(i) -> 0..1.
 * strength: how strongly the height field bends the normals; tile: metres covered by one repeat.
 */
function surface(S, { col, height, rough, strength = 2, tile = 2 }) {
  const size = Array.isArray(tile) ? tile : [tile, tile];
  const map = tex(canvasOf(S, d => { for (let y = 0, i = 0; y < S; y++) for (let x = 0; x < S; x++, i++) { const c = col(i, x, y); d[i * 4] = c[0]; d[i * 4 + 1] = c[1]; d[i * 4 + 2] = c[2]; d[i * 4 + 3] = 255; } }), size, true);
  const out = { map };
  if (height) out.normalMap = tex(canvasOf(S, d => {
    for (let y = 0, i = 0; y < S; y++) for (let x = 0; x < S; x++, i++) {
      const xl = height[y * S + (x + S - 1) % S], xr = height[y * S + (x + 1) % S], yu = height[((y + S - 1) % S) * S + x], yd = height[((y + 1) % S) * S + x];
      let nx = (xl - xr) * strength, ny = (yd - yu) * strength; const l = 1 / Math.hypot(nx, ny, 1); nx *= l; ny *= l;   // canvas rows run downward, texture v upward
      d[i * 4] = (nx * 0.5 + 0.5) * 255; d[i * 4 + 1] = (ny * 0.5 + 0.5) * 255; d[i * 4 + 2] = (l * 0.5 + 0.5) * 255; d[i * 4 + 3] = 255;
    }
  }), size, false);
  if (rough) out.roughnessMap = tex(canvasOf(S, d => { for (let i = 0; i < S * S; i++) { const v = Math.max(0, Math.min(1, rough(i))) * 255; d[i * 4] = 0; d[i * 4 + 1] = v; d[i * 4 + 2] = 0; d[i * 4 + 3] = 255; } }), size, false);
  return out;
}
const rgbOf = hex => [hex >> 16 & 255, hex >> 8 & 255, hex & 255];
const mul = (c, k) => [c[0] * k, c[1] * k, c[2] * k];
const mix = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

/** Joint mask of a grid of nx by ny slabs per repeat, optionally with every other row shifted by half a slab. 1 in a joint, 0 on a slab; also returns the slab index. */
function joints(S, nx, ny, widthPx, stagger = false) {
  const m = new Float32Array(S * S), id = new Uint16Array(S * S), w = S / nx, h = S / ny;
  for (let y = 0; y < S; y++) {
    const row = Math.floor(y / h), fy = y - row * h, off = stagger && row % 2 ? w / 2 : 0;
    for (let x = 0; x < S; x++) {
      const xx = (x + off) % S, colm = Math.floor(xx / w), fx = xx - colm * w;
      const d = Math.min(fx, w - fx, fy, h - fy);
      m[y * S + x] = d < widthPx ? 1 - d / widthPx : 0; id[y * S + x] = row * nx + colm;
    }
  }
  return { m, id };
}

// ---- the surfaces -------------------------------------------------------------------------------------------------
const made = new Map();
const once = (key, f) => { if (!made.has(key)) made.set(key, f()); return made.get(key); };

/** Named surfaces. Each returns { map, normalMap, roughnessMap, roughness, metalness } ready for MeshStandardMaterial. */
export const SURFACES = {
  // polished stone with crystals: dark-red granite for the name wall, black for copings
  granitePolished: (hex = 0x6e2420, seed = 3) => once('gp' + hex, () => {
    const S = 512, base = rgbOf(hex), w1 = white(S, seed), w2 = valueNoise(S, 128, seed + 1), big = fbm(S, 6, 3, seed + 2);
    return { ...surface(S, { tile: 1.6, strength: 0.25, height: w2,
      col: i => { const k = 0.72 + 0.5 * w2[i] + 0.18 * (big[i] - 0.5); let c = mul(base, k); if (w1[i] > 0.93) c = mix(c, [226, 214, 204], 0.55); else if (w1[i] < 0.1) c = mul(c, 0.45); return c; },
      rough: i => 0.16 + 0.1 * w2[i] }), roughness: 1, metalness: 0 };
  }),
  // flamed granite slabs with joints: plaza paving (two tones mixed by slab)
  paving: (hexA = 0xb9b3a7, hexB = 0x9c968c, nx = 4, ny = 8, tile = [2.4, 2.4], seed = 11, stagger = true) => once(`pv${hexA}${hexB}${nx}${ny}${tile}`, () => {
    const S = 512, a = rgbOf(hexA), b = rgbOf(hexB), sp = white(S, seed), n = fbm(S, 8, 4, seed + 1), j = joints(S, nx, ny, 2.2, stagger), r = rng(seed + 5);
    const tone = Array.from({ length: nx * ny }, () => r());
    const height = new Float32Array(S * S); for (let i = 0; i < height.length; i++) height[i] = (1 - j.m[i]) * (0.75 + 0.25 * n[i]) + 0.06 * sp[i];
    return { ...surface(S, { tile, strength: 3.2, height,
      col: i => { const t = tone[j.id[i]]; let c = mix(a, b, t > 0.72 ? 1 : t * 0.35); c = mul(c, 0.9 + 0.16 * n[i] + 0.1 * (sp[i] - 0.5)); return mix(c, [70, 68, 64], j.m[i] * 0.8); },
      rough: i => 0.78 + 0.16 * n[i] }), roughness: 1, metalness: 0 };
  }),
  // small dark setts for the driveway
  setts: () => once('setts', () => {
    const S = 512, sp = white(S, 21), n = fbm(S, 10, 4, 22), j = joints(S, 10, 10, 2.4, true), r = rng(23), tone = Array.from({ length: 100 }, () => 0.78 + 0.34 * r());
    const height = new Float32Array(S * S); for (let i = 0; i < height.length; i++) height[i] = (1 - j.m[i]) * (0.6 + 0.4 * n[i]);
    return { ...surface(S, { tile: [1.6, 1.6], strength: 4, height,
      col: i => mix(mul([112, 108, 104], tone[j.id[i]] * (0.9 + 0.2 * sp[i])), [52, 50, 48], j.m[i] * 0.85), rough: i => 0.7 + 0.2 * n[i] }), roughness: 1, metalness: 0 };
  }),
  asphalt: (hex = 0x3a3c3f) => once('as' + hex, () => {
    const S = 512, sp = white(S, 31), n = fbm(S, 6, 5, 32), fine = valueNoise(S, 256, 33), base = rgbOf(hex);
    return { ...surface(S, { tile: 3, strength: 1.6, height: fine,
      col: i => { let c = mul(base, 0.8 + 0.3 * n[i] + 0.25 * (fine[i] - 0.5)); if (sp[i] > 0.965) c = mix(c, [150, 148, 142], 0.6); return c; }, rough: i => 0.86 + 0.1 * fine[i] }), roughness: 1, metalness: 0 };
  }),
  concrete: (hex = 0xbdb9b0) => once('co' + hex, () => {
    const S = 512, n = fbm(S, 5, 5, 41), fine = valueNoise(S, 200, 42), base = rgbOf(hex);
    return { ...surface(S, { tile: 3, strength: 0.8, height: fine, col: i => mul(base, 0.86 + 0.22 * n[i] + 0.08 * (fine[i] - 0.5)), rough: i => 0.8 + 0.15 * n[i] }), roughness: 1, metalness: 0 };
  }),
  // white or coloured wall panels with open joints (aluminium composite or stone cladding). Not called "panels": the lighting
  // module takes any material name containing "pane" for window glass.
  cladding: (hex = 0xf2f0ea, w = 1.2, h = 0.6, rough = 0.5) => once(`cl${hex}${w}${h}${rough}`, () => {
    const S = 512, n = fbm(S, 4, 3, 51), j = joints(S, 2, 2, 1.6), base = rgbOf(hex);
    const height = new Float32Array(S * S); for (let i = 0; i < height.length; i++) height[i] = 1 - j.m[i];
    return { ...surface(S, { tile: [w * 2, h * 2], strength: 2.2, height, col: i => mix(mul(base, 0.95 + 0.07 * n[i]), mul(base, 0.5), j.m[i] * 0.9), rough: i => rough + 0.12 * n[i] + 0.3 * j.m[i] }), roughness: 1, metalness: 0 };
  }),
  // brushed stainless steel: streaks along u
  steel: (hex = 0xc9cdd1) => once('st' + hex, () => {
    const S = 256, base = rgbOf(hex), r = rng(61), rows = new Float32Array(S); for (let y = 0; y < S; y++) rows[y] = r();
    const n = fbm(S, 3, 3, 62), height = new Float32Array(S * S); for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) height[y * S + x] = rows[y] * 0.6 + rows[(y + 1) % S] * 0.4;
    return { ...surface(S, { tile: 0.5, strength: 0.35, height, col: (i, x, y) => mul(base, 0.9 + 0.14 * rows[y] + 0.05 * n[i]), rough: (i) => 0.22 + 0.16 * rows[Math.floor(i / S)] }), roughness: 1, metalness: 1 };
  }),
  // short mown lawn
  lawn: () => once('lawn', () => {
    const S = 512, fine = white(S, 71), n1 = fbm(S, 10, 4, 72), n2 = fbm(S, 3, 3, 73), blades = valueNoise(S, 256, 74);
    return { ...surface(S, { tile: 3.5, strength: 2.4, height: blades,
      col: i => { const k = 0.62 + 0.5 * n1[i] + 0.3 * (blades[i] - 0.5) + 0.12 * (fine[i] - 0.5), y = n2[i]; return [(58 + 34 * y) * k, (112 + 26 * y) * k, (42 + 10 * y) * k]; }, rough: () => 0.92 }), roughness: 1, metalness: 0 };
  }),
  // leafy surface for clipped hedges and bedding plants
  hedge: (hex = 0x2f5a2a) => once('hd' + hex, () => {
    const S = 256, base = rgbOf(hex), cells = valueNoise(S, 48, 81), fine = valueNoise(S, 128, 82);
    return { ...surface(S, { tile: 1.1, strength: 5, height: cells, col: i => mul(base, 0.45 + 1.0 * cells[i] + 0.3 * (fine[i] - 0.5)), rough: () => 0.85 }), roughness: 1, metalness: 0 };
  }),
  bark: (hex = 0x6a5a4a) => once('bk' + hex, () => {
    const S = 256, base = rgbOf(hex), r = rng(91), cols = new Float32Array(S); for (let x = 0; x < S; x++) cols[x] = r();
    const n = fbm(S, 6, 4, 92), height = new Float32Array(S * S);
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) height[y * S + x] = 0.55 * (cols[x] * 0.5 + cols[(x + 1) % S] * 0.5) + 0.45 * n[y * S + x];
    return { ...surface(S, { tile: [1.2, 2.4], strength: 4, height, col: i => mul(base, 0.55 + 0.9 * height[i]), rough: () => 0.95 }), roughness: 1, metalness: 0 };
  }),
  // ringed grey trunk of a royal palm
  palmTrunk: () => once('palm', () => {
    const S = 256, n = fbm(S, 5, 4, 95), height = new Float32Array(S * S);
    for (let y = 0; y < S; y++) { const ring = Math.pow(Math.abs(Math.sin(y / S * Math.PI * 6)), 14); for (let x = 0; x < S; x++) height[y * S + x] = 1 - ring * 0.9 + 0.2 * n[y * S + x]; }
    return { ...surface(S, { tile: [1.4, 2.2], strength: 3, height, col: i => mul([168, 162, 150], 0.55 + 0.42 * height[i] + 0.12 * n[i]), rough: () => 0.9 }), roughness: 1, metalness: 0 };
  }),
  rock: () => once('rock', () => {
    const S = 512, n = fbm(S, 4, 6, 97, 0.55), fine = valueNoise(S, 160, 98);
    return { ...surface(S, { tile: 2.5, strength: 5, height: n, col: i => mul([150, 142, 128], 0.6 + 0.6 * n[i] + 0.15 * (fine[i] - 0.5)), rough: i => 0.75 + 0.2 * fine[i] }), roughness: 1, metalness: 0 };
  }),
  // small glazed tiles: pool lining
  mosaic: (hex = 0x2f8f96) => once('mo' + hex, () => {
    const S = 256, base = rgbOf(hex), j = joints(S, 16, 16, 1.2), r = rng(99), tone = Array.from({ length: 256 }, () => 0.8 + 0.4 * r());
    const height = new Float32Array(S * S); for (let i = 0; i < height.length; i++) height[i] = 1 - j.m[i];
    return { ...surface(S, { tile: 0.8, strength: 1.5, height, col: i => mix(mul(base, tone[j.id[i]]), [200, 205, 200], j.m[i] * 0.7), rough: i => 0.25 + 0.5 * j.m[i] }), roughness: 1, metalness: 0 };
  }),
  // timber-look soffit boards
  timber: (hex = 0xa9743f) => once('tb' + hex, () => {
    const S = 256, base = rgbOf(hex), r = rng(101), n = fbm(S, 4, 4, 102), j = joints(S, 1, 8, 1.4), tone = Array.from({ length: 8 }, () => 0.85 + 0.3 * r());
    const grain = new Float32Array(S * S); for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) grain[y * S + x] = Math.sin((x * 0.02 + n[y * S + x] * 6) * 6.283) * 0.5 + 0.5;
    const height = new Float32Array(S * S); for (let i = 0; i < height.length; i++) height[i] = (1 - j.m[i]) + 0.05 * grain[i];
    return { ...surface(S, { tile: [2.4, 1.2], strength: 2, height, col: i => mix(mul(base, tone[j.id[i]] * (0.86 + 0.2 * grain[i])), mul(base, 0.3), j.m[i]), rough: () => 0.55 }), roughness: 1, metalness: 0 };
  }),
};

/**
 * Tinted curtain-wall glass. Real panes are never quite in one plane and they mirror what stands opposite, so every pane
 * gets its own slight tilt (in the normal map) and the colour carries a painted reflection: sky above, a dark band of
 * trees below. nx by ny panes per repeat; tile: metres covered by one repeat.
 */
SURFACES.glazing = (hex = 0x2a7a66, nx = 4, ny = 6, tile = [4.8, 5.76], seed = 5) => once(`gz${hex}${nx}${ny}${tile}`, () => {
  const S = 512, base = rgbOf(hex), r = rng(seed * 131), trees = fbm(S, 5, 4, seed + 7), cloud = fbm(S, 3, 3, seed + 9);
  const tilt = Array.from({ length: nx * ny }, () => [(r() - 0.5) * 0.11, (r() - 0.5) * 0.11, 0.9 + 0.2 * r()]);
  const pane = (x, y) => Math.min(ny - 1, Math.floor(y / S * ny)) * nx + Math.min(nx - 1, Math.floor(x / S * nx));
  const size = [tile[0], tile[1]];
  const map = tex(canvasOf(S, d => { for (let y = 0, i = 0; y < S; y++) for (let x = 0; x < S; x++, i++) {
    const v = 1 - y / S, p = tilt[pane(x, y)], horizon = 0.34 + 0.2 * (trees[i] - 0.5);          // v: 0 at the bottom of the repeat, 1 at the top
    let k = v > horizon ? 0.95 + 0.75 * (v - horizon) + 0.35 * (cloud[i] - 0.5) : 0.42 + 0.5 * trees[i] * (v / horizon);
    k *= p[2]; d[i * 4] = Math.min(255, base[0] * k + (v > horizon ? 26 * (v - horizon) : 0)); d[i * 4 + 1] = Math.min(255, base[1] * k); d[i * 4 + 2] = Math.min(255, base[2] * k + (v > horizon ? 30 * (v - horizon) : 0)); d[i * 4 + 3] = 255;
  } }), size, true);
  const normalMap = tex(canvasOf(S, d => { for (let y = 0, i = 0; y < S; y++) for (let x = 0; x < S; x++, i++) {
    const p = tilt[pane(x, y)], l = 1 / Math.hypot(p[0], p[1], 1);
    d[i * 4] = (p[0] * l * 0.5 + 0.5) * 255; d[i * 4 + 1] = (p[1] * l * 0.5 + 0.5) * 255; d[i * 4 + 2] = (l * 0.5 + 0.5) * 255; d[i * 4 + 3] = 255;
  } }), size, false);
  return { map, normalMap, roughness: 0.05, metalness: 0.62 };
});

/** Ripple normals for the water surface (tileable): several crossing wave trains plus fine noise. */
export function waterNormals() {
  return once('waterN', () => {
    const S = 256, n = fbm(S, 8, 4, 111), h = new Float32Array(S * S);
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
      const u = x / S * 6.283, v = y / S * 6.283;
      h[y * S + x] = 0.5 * Math.sin(3 * u + 2 * v) + 0.35 * Math.sin(5 * v - 2 * u + 1.3) + 0.25 * Math.sin(7 * u + 6 * v + 0.6) + 0.2 * Math.sin(11 * v - 9 * u) + 1.2 * n[y * S + x];
    }
    const t = surface(S, { tile: 1, strength: 1.4, height: h, col: () => [128, 128, 255] }).normalMap;
    t.repeat.set(1, 1); return t;
  });
}

const mats = new Map();
/**
 * Shared material of a named surface, e.g. pbr('paving') or pbr('granitePolished', 0x6e2420). Extra properties for
 * MeshStandardMaterial go in `over`. Every material gets a name starting with "hifi-": the lighting module treats unnamed
 * smooth materials as window glass.
 */
export function pbr(kind, args = [], over = {}) {
  const key = kind + JSON.stringify(args) + JSON.stringify(over);
  if (!mats.has(key)) {
    const s = SURFACES[kind](...args), { normalScale = 1, ...rest } = over;
    const m = new THREE.MeshStandardMaterial({ map: s.map, normalMap: s.normalMap || null, roughnessMap: s.roughnessMap || null, roughness: s.roughness, metalness: s.metalness, ...rest });
    if (s.normalMap) m.normalScale.set(normalScale, normalScale);
    m.name = 'hifi-' + kind; mats.set(key, m);
  }
  return mats.get(key);
}
/** Plain smooth material (painted metal, glossy paint, gold): no texture. */
export function plain(name, color, roughness = 0.5, metalness = 0, over = {}) {
  const key = 'plain' + name + color + roughness + metalness + JSON.stringify(over);
  if (!mats.has(key)) { const m = new THREE.MeshStandardMaterial({ color, roughness, metalness, ...over }); m.name = 'hifi-' + name; mats.set(key, m); }
  return mats.get(key);
}
