// Turns a box of the 3D campus into 1 m voxels for the Minecraft export.
//
// usage: node minecraft/voxelize.mjs <page url> <out.json> x0 x1 z0 z1 y0 y1 [--tile N] [--list-hidden]
//   --tile N: cut the box into N x N metre tiles (x and z) and write one file per tile, <out>_<i>_<j>.json
//   page url: the site served locally, e.g. http://127.0.0.1:8800/index.html (the script adds its own query)
//   x0..y1:   the box in world metres (x east, z south, y up; origin at the track centre)
//
// The page is loaded headless with ?lightdebug=1, which hands the scene to scripts (window.__engine). Every visible
// mesh under the campus root is sampled: points spread over each triangle (about every 0.3 m), each pushed 0.1 m into
// the solid the face bounds (along the reversed face normal), so that a floor's top at 3.9 m lands in the block below
// 3.9 and a wall face lands in the wall. Per block the script keeps, for each material, the sampled area, the mean
// height of the samples within the block (0..255), the mean colour of its samples (read from the texture at each
// sample's texture coordinates, so lines and window grids painted in textures survive) and which of the block's eight
// 0.5 m sub-cells were hit; build_world.py later picks a Minecraft block and its shape from that.
//
// What counts as "the campus": everything under the world root except the moving people, vehicles and birds, the
// invisible collision-only meshes, and things the page hides on purpose (see HIDDEN_OK). Groups the engine shows only
// near the viewer (ctx.detail entries, rooms per storey, the gym's interior tiers) are switched on first.
import { createRequire } from 'node:module';
import fs from 'node:fs';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const [url, out, ...rest] = process.argv.slice(2);
const listHidden = rest.includes('--list-hidden');
const ti = rest.indexOf('--tile'), tile = ti >= 0 ? +rest[ti + 1] : 0;
const [x0, x1, z0, z1, y0, y1] = rest.filter((a, i) => !a.startsWith('--') && !(ti >= 0 && i === ti + 1)).map(Number);
if (!url || !out || [x0, x1, z0, z1, y0, y1].some(v => !Number.isFinite(v))) {
  console.error('usage: node minecraft/voxelize.mjs <url> <out.json> x0 x1 z0 z1 y0 y1 [--list-hidden]'); process.exit(2);
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 320, height: 200 } });
const errs = []; page.on('pageerror', e => errs.push(e.message));
const sep = url.includes('?') ? '&' : '?';
const t0 = Date.now();
await page.goto(url + sep + 'lightdebug=1&ui=0&shadows=0&post=0&aa=0&time=12&quality=high', { waitUntil: 'load' });
await page.waitForFunction(() => window.__app && window.__app.ready && window.__engine, null, { timeout: 900000, polling: 500 });
console.log('loaded in', Math.round((Date.now() - t0) / 1000), 's', errs.length ? 'errors: ' + errs.join(' | ') : '');

const setup = await page.evaluate(({ listHidden }) => {
  const E = window.__engine, root = E.root;
  let THREE_Color = null; root.traverse(o => { if (!THREE_Color && o.material && o.material.color) THREE_Color = o.material.color.constructor; });
  const SKIP_GROUPS = /^(people|moving-traffic|birds)$/;           // alive things: not part of the map
  const SKIP_NAMES = /collid|barrier|^traffic-|^people-|^bird/i;
  // Named furniture: not sampled; each instance is handed to build_world.py, which sets down a Minecraft piece for it.
  // 'skip' kinds are small things (books, bags, bedding folds) that would only be noise at one metre.
  const FURNITURE = [
    [/-desks?$|-task-body$/, 'desk'], [/-chairs?$|-chair-body$|-seat-body$|-stool-body$|-stool$|^arc-building-seat$/, 'chair'],
    [/^grandstand-seating-seats$|^seats$/, 'seat'], [/-mattress$/, 'bed'], [/^highbay-bodies$/, 'light'],
    [/-(pillow|fold|sheet|spread|drape|net)$|-books$|-bags$|-pencil-cases$|-bottles$|-globes?$|-globe-stands$|-room-pots$|^fixings$|^highbay-(lenses|rods)$|^basketballs$|-chair-frame$|-seat-frame$|-task-frame$|-stool-frame$|-tub-frame$|-fans$/, 'skip'],
  ];
  const furnitureKind = name => { for (const [re, k] of FURNITURE) if (re.test(name)) return k; return null; };
  // ---- switch on what the engine shows only near the viewer
  for (const d of E.details) d.obj.visible = true;
  const hidden = [];
  root.traverse(o => { if (!o.visible && o !== root) hidden.push(o); });
  if (listHidden) {
    const names = {};
    for (const o of hidden) { const k = (o.name || '(no name)') + ' [' + o.type + (o.material ? ' ' + [].concat(o.material).map(m => m.name).join(',') : '') + ']'; names[k] = (names[k] || 0) + 1; }
    return { hidden: names };
  }
  // A hidden object is drawn only if it is a group (room sets, interior tiers) and not a collider group.
  for (const o of hidden) if (!o.isMesh && !SKIP_NAMES.test(o.name || '')) o.visible = true;
  root.updateMatrixWorld(true);
  // The page keeps rendering between tiles, and its per-frame switches hide interiors again (the gym's tiers, the rooms
  // per storey, the culling of details): stop the loop and switch everything on again before each tile.
  try { if (E.renderer && E.renderer.setAnimationLoop) E.renderer.setAnimationLoop(null); } catch (e) {}
  const showAll = () => { for (const d of E.details) d.obj.visible = true; for (const o of hidden) if (!o.isMesh && !SKIP_NAMES.test(o.name || '')) o.visible = true; root.updateMatrixWorld(true); };
  window.__voxBox = box => {
    showAll();

  const [X0, X1, Z0, Z1, Y0, Y1] = box, NX = X1 - X0, NY = Y1 - Y0, NZ = Z1 - Z0;
  const SP = 0.3, PUSH = 0.1;
  const mats = [], matIndex = new Map(), texMean = new Map();
  const cell = new Map();                     // (block * 4096 + mat) -> [area, subMask]
  const meanOf = tex => {
    if (!tex || !tex.image) return null;
    if (texMean.has(tex)) return texMean.get(tex);
    let m = null;
    try {
      const im = tex.image;
      if (im.data && im.width) {              // DataTexture
        const d = im.data, n = im.width * im.height, step = Math.max(1, Math.floor(n / 4096)), ch = d.length / n; let r = 0, g = 0, b = 0, k = 0;
        for (let i = 0; i < n; i += step) { r += d[i * ch]; g += d[i * ch + 1]; b += d[i * ch + 2]; k++; }
        const s = d instanceof Float32Array ? 255 : 1; m = [r / k * s, g / k * s, b / k * s];
      } else {
        const c = document.createElement('canvas'); c.width = c.height = 32; const g2 = c.getContext('2d');
        g2.drawImage(im, 0, 0, 32, 32); const d = g2.getImageData(0, 0, 32, 32).data; let r = 0, g = 0, b = 0, a = 0;
        for (let i = 0; i < d.length; i += 4) { const w = d[i + 3] / 255; r += d[i] * w; g += d[i + 1] * w; b += d[i + 2] * w; a += w; }
        m = a > 0 ? [r / a, g / a, b / a, a / 1024] : null;
      }
    } catch (e) { m = null; }
    texMean.set(tex, m); return m;
  };
  // textures as pixels (at most 256 across), for the colour at each sample: lines on courts, window grids on facades
  const texPix = new Map();
  const pixOf = tex => {
    if (!tex || !tex.image) return null;
    if (texPix.has(tex)) return texPix.get(tex);
    let r = null;
    try {
      const im = tex.image;
      if (im.data && im.width && (im.data instanceof Uint8Array || im.data instanceof Uint8ClampedArray)) {
        const ch = im.data.length / (im.width * im.height);
        r = { w: im.width, h: im.height, d: im.data, ch, flip: !!tex.flipY };
      } else if (im.width && im.height) {
        const W = Math.min(256, im.width), H = Math.min(256, im.height), cv = document.createElement('canvas'); cv.width = W; cv.height = H;
        const g2 = cv.getContext('2d'); g2.drawImage(im, 0, 0, W, H);
        r = { w: W, h: H, d: g2.getImageData(0, 0, W, H).data, ch: 4, flip: tex.flipY !== false };
      }
      if (r) { tex.updateMatrix(); r.m = tex.matrix.elements.slice(); r.rs = tex.wrapS === 1000; r.rt = tex.wrapT === 1000; }
    } catch (e) { r = null; }
    texPix.set(tex, r); return r;
  };
  const texel = (T, u, v, out) => {
    const m = T.m, uu = m[0] * u + m[3] * v + m[6], vv = m[1] * u + m[4] * v + m[7];
    let x = T.rs ? uu - Math.floor(uu) : Math.min(1, Math.max(0, uu)), y = T.rt ? vv - Math.floor(vv) : Math.min(1, Math.max(0, vv));
    const px = Math.min(T.w - 1, Math.floor(x * T.w)), py = Math.min(T.h - 1, Math.floor((T.flip ? 1 - y : y) * T.h)), i = (py * T.w + px) * T.ch;
    out[0] = T.d[i]; out[1] = T.d[i + 1]; out[2] = T.d[i + 2];
  };
  const matId = (m, vc) => {
    const col = m.color ? m.color.getHex() : 0xffffff, key = m.uuid + (vc ? '|' + vc : '');
    if (matIndex.has(key)) return matIndex.get(key);
    let rgb = [(col >> 16) & 255, (col >> 8) & 255, col & 255];
    if (vc) rgb = rgb.map((c, i) => c * ((vc >> (16 - 8 * i)) & 255) / 255);
    const baseRgb = rgb.slice();
    const tm = meanOf(m.map);
    if (tm) rgb = rgb.map((c, i) => c * tm[i] / 255);
    const em = m.emissive ? m.emissive.getHex() : 0;
    const info = { name: m.name || '', type: m.type, rgb: rgb.map(Math.round), map: !!m.map, mapAlpha: tm && tm[3] !== undefined ? +tm[3].toFixed(2) : null,
      opacity: m.opacity, transparent: !!m.transparent, alphaTest: m.alphaTest || 0, metal: m.metalness ?? null, rough: m.roughness ?? null,
      emissive: [(em >> 16) & 255, (em >> 8) & 255, em & 255], emissiveIntensity: m.emissiveIntensity ?? 0, emissiveMap: !!m.emissiveMap, area: 0 };
    const id = mats.length; mats.push(info); matIndex.set(key, id); matBase[id] = baseRgb; matTex[id] = pixOf(m.map); return id;
  };
  const visibleChain = o => { for (let p = o; p; p = p.parent) { if (!p.visible) return false; if (p === root) return true; } return true; };
  const skipChain = o => { for (let p = o; p && p !== root; p = p.parent) if (SKIP_GROUPS.test(p.name || '') || SKIP_NAMES.test(p.name || '')) return true; return false; };

  const a = new Float64Array(3), b = new Float64Array(3), c = new Float64Array(3);
  const M = new Float64Array(16);
  const mul = (A, B) => { const R = new Float64Array(16); for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { let s = 0; for (let k = 0; k < 4; k++) s += A[k * 4 + j] * B[i * 4 + k]; R[i * 4 + j] = s; } return R; };
  const xf = (e, p, i, o) => { const x = p.getX(i), y = p.getY(i), z = p.getZ(i); o[0] = e[0] * x + e[4] * y + e[8] * z + e[12]; o[1] = e[1] * x + e[5] * y + e[9] * z + e[13]; o[2] = e[2] * x + e[6] * y + e[10] * z + e[14]; };
  let tris = 0, samples = 0, meshes = 0;
  const matBase = [], matTex = [], tc = [0, 0, 0];
  let UV = null;                     // for the triangle being sampled: [ua, va, ub, vb, uc, vc] or null
  const furniture = [];
  const addTri = (mid) => {
    const minx = Math.min(a[0], b[0], c[0]), maxx = Math.max(a[0], b[0], c[0]), miny = Math.min(a[1], b[1], c[1]), maxy = Math.max(a[1], b[1], c[1]);
    const minz = Math.min(a[2], b[2], c[2]), maxz = Math.max(a[2], b[2], c[2]);
    if (maxx < X0 - 1 || minx > X1 + 1 || maxz < Z0 - 1 || minz > Z1 + 1 || maxy < Y0 - 1 || miny > Y1 + 1) return;
    const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2], vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
    let nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx; const n2 = Math.hypot(nx, ny, nz); if (n2 < 1e-9) return;
    const area = n2 / 2; nx /= n2; ny /= n2; nz /= n2; tris++;
    const L = Math.max(Math.hypot(ux, uy, uz), Math.hypot(vx, vy, vz), Math.hypot(b[0] - c[0], b[1] - c[1], b[2] - c[2]));
    const n = Math.max(1, Math.ceil(L / SP)); let cnt = 0;
    const pts = [], st_ = [];
    for (let i = 0; i <= n; i++) for (let j = 0; j <= n - i; j++) {
      const s = (i + (n === 1 ? 1 / 3 : 0)) / n, t = (j + (n === 1 ? 1 / 3 : 0)) / n; if (s + t > 1.0001) continue;
      pts.push(a[0] + ux * s + vx * t - nx * PUSH, a[1] + uy * s + vy * t - ny * PUSH, a[2] + uz * s + vz * t - nz * PUSH); st_.push(s, t); cnt++;
    }
    const T = UV ? matTex[mid] : null, B = matBase[mid];
    const w = area / cnt; mats[mid].area += area;
    for (let k = 0; k < pts.length; k += 3) {
      const px = pts[k] - X0, py = pts[k + 1] - Y0, pz = pts[k + 2] - Z0;
      if (px < 0 || py < 0 || pz < 0 || px >= NX || py >= NY || pz >= NZ) continue;
      const bx = Math.floor(px), by = Math.floor(py), bz = Math.floor(pz);
      const sub = ((px - bx) >= 0.5 ? 1 : 0) | ((pz - bz) >= 0.5 ? 2 : 0) | ((py - by) >= 0.5 ? 4 : 0);
      const key = ((by * NZ + bz) * NX + bx) * 4096 + mid;
      let e = cell.get(key); if (!e) { e = [0, 0, 0, 0, 0, 0]; cell.set(key, e); }
      e[0] += w; e[1] |= 1 << sub; e[2] += w * (py - by); samples++;
      if (T) { const s = st_[k / 3 * 2], t = st_[k / 3 * 2 + 1]; texel(T, UV[0] + (UV[2] - UV[0]) * s + (UV[4] - UV[0]) * t, UV[1] + (UV[3] - UV[1]) * s + (UV[5] - UV[1]) * t, tc);
        e[3] += w * B[0] * tc[0] / 255; e[4] += w * B[1] * tc[1] / 255; e[5] += w * B[2] * tc[2] / 255; }
      else { const r = mats[mid].rgb; e[3] += w * r[0]; e[4] += w * r[1]; e[5] += w * r[2]; }
    }
  };
  root.traverse(o => {
    if (!o.isMesh || o.isSkinnedMesh || !o.geometry || !o.geometry.attributes.position) return;
    if (!visibleChain(o) || skipChain(o)) return;
    const g = o.geometry, pos = g.attributes.position, idx = g.index, mlist = [].concat(o.material);
    if (mlist.some(m => !m || m.visible === false || m.colorWrite === false)) return;
    const vcol = g.attributes.color && mlist[0].vertexColors ? g.attributes.color : null, uva = g.attributes.uv || null;
    const groups = g.groups && g.groups.length ? g.groups : [{ start: 0, count: idx ? idx.count : pos.count, materialIndex: 0 }];
    const inst = o.isInstancedMesh ? o.count : 1, base = o.matrixWorld.elements;
    meshes++;
    const fk = o.isInstancedMesh ? furnitureKind(o.name || '') : null;
    if (fk) {
      if (fk === 'skip') return;
      if (!g.boundingBox) g.computeBoundingBox();
      const bb = g.boundingBox, lc = [(bb.min.x + bb.max.x) / 2, (bb.min.y + bb.max.y) / 2, (bb.min.z + bb.max.z) / 2], C = new THREE_Color();
      for (let q = 0; q < o.count; q++) {
        const im = o.instanceMatrix.array; for (let k = 0; k < 16; k++) M[k] = im[q * 16 + k];
        const e = mul(base, M), x = e[0] * lc[0] + e[4] * lc[1] + e[8] * lc[2] + e[12], y = e[1] * lc[0] + e[5] * lc[1] + e[9] * lc[2] + e[13], z = e[2] * lc[0] + e[6] * lc[1] + e[10] * lc[2] + e[14];
        if (x < X0 || x >= X1 || z < Z0 || z >= Z1 || y < Y0 || y >= Y1) continue;
        const sx = Math.hypot(e[0], e[1], e[2]) * (bb.max.x - bb.min.x), sy = Math.hypot(e[4], e[5], e[6]) * (bb.max.y - bb.min.y), sz = Math.hypot(e[8], e[9], e[10]) * (bb.max.z - bb.min.z);
        let rgb = mlist[0].color ? [mlist[0].color.r, mlist[0].color.g, mlist[0].color.b] : [1, 1, 1];
        if (o.instanceColor) { o.getColorAt(q, C); rgb = [rgb[0] * C.r, rgb[1] * C.g, rgb[2] * C.b]; }
        const tm = meanOf(mlist[0].map); const toS = v => Math.round(255 * (v <= 0.0031308 ? v * 12.92 : 1.055 * Math.pow(v, 1 / 2.4) - 0.055));
        let srgb = rgb.map(toS); if (tm) srgb = srgb.map((c, i) => Math.round(c * tm[i] / 255));
        furniture.push({ k: fk, n: o.name, x: +x.toFixed(2), y: +(y - sy / 2).toFixed(2), top: +(y + sy / 2).toFixed(2), z: +z.toFixed(2), yaw: +Math.atan2(e[8], e[10]).toFixed(3), sx: +sx.toFixed(2), sy: +sy.toFixed(2), sz: +sz.toFixed(2), rgb: srgb });
      }
      return;
    }
    for (let q = 0; q < inst; q++) {
      let e = base;
      if (o.isInstancedMesh) {
        const im = o.instanceMatrix.array; for (let k = 0; k < 16; k++) M[k] = im[q * 16 + k];
        const tx = base[0] * M[12] + base[4] * M[13] + base[8] * M[14] + base[12], tz = base[2] * M[12] + base[6] * M[13] + base[10] * M[14] + base[14];
        if (tx < X0 - 40 || tx > X1 + 40 || tz < Z0 - 40 || tz > Z1 + 40) continue;
        e = mul(base, M);
      } else {
        if (!g.boundingBox) g.computeBoundingBox();
        const bb = g.boundingBox, cx = (bb.min.x + bb.max.x) / 2, cy = (bb.min.y + bb.max.y) / 2, cz = (bb.min.z + bb.max.z) / 2, r = bb.max.distanceTo(bb.min) / 2 * Math.max(1, Math.hypot(base[0], base[1], base[2]));
        const wx = base[0] * cx + base[4] * cy + base[8] * cz + base[12], wz = base[2] * cx + base[6] * cy + base[10] * cz + base[14];
        if (wx + r < X0 || wx - r > X1 || wz + r < Z0 || wz - r > Z1) continue;
      }
      for (const gr of groups) {
        const m = mlist[gr.materialIndex] || mlist[0]; if (!m) continue;
        const end = Math.min(gr.start + gr.count, idx ? idx.count : pos.count);
        for (let t = gr.start; t + 2 < end; t += 3) {
          const i0 = idx ? idx.getX(t) : t, i1 = idx ? idx.getX(t + 1) : t + 1, i2 = idx ? idx.getX(t + 2) : t + 2;
          xf(e, pos, i0, a); xf(e, pos, i1, b); xf(e, pos, i2, c);
          let vc = 0;
          if (vcol) { const q8 = v => Math.min(15, Math.floor(v * 16)) * 17; const r = (vcol.getX(i0) + vcol.getX(i1) + vcol.getX(i2)) / 3, gg = (vcol.getY(i0) + vcol.getY(i1) + vcol.getY(i2)) / 3, bb = (vcol.getZ(i0) + vcol.getZ(i1) + vcol.getZ(i2)) / 3; vc = (q8(r) << 16) | (q8(gg) << 8) | q8(bb); }
          const id_ = matId(m, vc);
          UV = (uva && matTex[id_]) ? [uva.getX(i0), uva.getY(i0), uva.getX(i1), uva.getY(i1), uva.getX(i2), uva.getY(i2)] : null;
          addTri(id_);
        }
      }
    }
  });
  // pack: one row per (block, material)
  const n = cell.size, blk = new Int32Array(n), mid = new Uint16Array(n), area = new Float32Array(n), sub = new Uint8Array(n), hy = new Uint8Array(n), rgb = new Uint8Array(n * 3); let k = 0;
  for (const [key, e] of cell) { blk[k] = Math.floor(key / 4096); mid[k] = key % 4096; area[k] = e[0]; sub[k] = e[1]; hy[k] = Math.min(255, Math.round(e[2] / e[0] * 255));
    rgb[k * 3] = Math.min(255, Math.round(e[3] / e[0])); rgb[k * 3 + 1] = Math.min(255, Math.round(e[4] / e[0])); rgb[k * 3 + 2] = Math.min(255, Math.round(e[5] / e[0])); k++; }
  const b64 = arr => { const u = new Uint8Array(arr.buffer); let s = ''; for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000)); return btoa(s); };
  // the outlines of the items in the box, for naming in the report
  return { box, size: [NX, NY, NZ], stats: { meshes, tris, samples, rows: n, furniture: furniture.length }, furniture, mats, blk: b64(blk), mid: b64(mid), area: b64(area), sub: b64(sub), hy: b64(hy), rgb: b64(rgb) };
  };
  return { ok: true };
}, { listHidden });

if (listHidden) { console.log(JSON.stringify(setup.hidden, null, 1)); await browser.close(); process.exit(0); }
const boxes = [];
if (tile > 0) {
  for (let i = 0, x = x0; x < x1; i++, x += tile) for (let j = 0, z = z0; z < z1; j++, z += tile)
    boxes.push({ box: [x, Math.min(x + tile, x1), z, Math.min(z + tile, z1), y0, y1], file: out.replace(/\.json$/, '') + `_${i}_${j}.json` });
} else boxes.push({ box: [x0, x1, z0, z1, y0, y1], file: out });
for (const { box, file } of boxes) {
  const result = await page.evaluate(b => window.__voxBox(b), box);
  fs.writeFileSync(file, JSON.stringify(result));
  console.log('box', result.box.join(' '), 'stats', JSON.stringify(result.stats), 'materials', result.mats.length, 'written', file, Math.round(fs.statSync(file).size / 1e6) + ' MB', 'at', Math.round((Date.now() - t0) / 1000), 's');
}
await browser.close();
