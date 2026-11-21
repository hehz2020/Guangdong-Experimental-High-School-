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
// height of the samples within the block (0..255) and which of the block's eight 0.5 m sub-cells were hit; build_world.py later picks a Minecraft block and its shape from that.
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
  const SKIP_GROUPS = /^(people|moving-traffic|birds)$/;           // alive things: not part of the map
  const SKIP_NAMES = /collid|barrier|^traffic-|^people-|^bird/i;
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
  window.__voxBox = box => {

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
  const matId = (m, vc) => {
    const col = m.color ? m.color.getHex() : 0xffffff, key = m.uuid + (vc ? '|' + vc : '');
    if (matIndex.has(key)) return matIndex.get(key);
    let rgb = [(col >> 16) & 255, (col >> 8) & 255, col & 255];
    if (vc) rgb = rgb.map((c, i) => c * ((vc >> (16 - 8 * i)) & 255) / 255);
    const tm = meanOf(m.map);
    if (tm) rgb = rgb.map((c, i) => c * tm[i] / 255);
    const em = m.emissive ? m.emissive.getHex() : 0;
    const info = { name: m.name || '', type: m.type, rgb: rgb.map(Math.round), map: !!m.map, mapAlpha: tm && tm[3] !== undefined ? +tm[3].toFixed(2) : null,
      opacity: m.opacity, transparent: !!m.transparent, alphaTest: m.alphaTest || 0, metal: m.metalness ?? null, rough: m.roughness ?? null,
      emissive: [(em >> 16) & 255, (em >> 8) & 255, em & 255], emissiveIntensity: m.emissiveIntensity ?? 0, emissiveMap: !!m.emissiveMap, area: 0 };
    const id = mats.length; mats.push(info); matIndex.set(key, id); return id;
  };
  const visibleChain = o => { for (let p = o; p; p = p.parent) { if (!p.visible) return false; if (p === root) return true; } return true; };
  const skipChain = o => { for (let p = o; p && p !== root; p = p.parent) if (SKIP_GROUPS.test(p.name || '') || SKIP_NAMES.test(p.name || '')) return true; return false; };

  const a = new Float64Array(3), b = new Float64Array(3), c = new Float64Array(3);
  const M = new Float64Array(16);
  const mul = (A, B) => { const R = new Float64Array(16); for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { let s = 0; for (let k = 0; k < 4; k++) s += A[k * 4 + j] * B[i * 4 + k]; R[i * 4 + j] = s; } return R; };
  const xf = (e, p, i, o) => { const x = p.getX(i), y = p.getY(i), z = p.getZ(i); o[0] = e[0] * x + e[4] * y + e[8] * z + e[12]; o[1] = e[1] * x + e[5] * y + e[9] * z + e[13]; o[2] = e[2] * x + e[6] * y + e[10] * z + e[14]; };
  let tris = 0, samples = 0, meshes = 0;
  const addTri = (mid) => {
    const minx = Math.min(a[0], b[0], c[0]), maxx = Math.max(a[0], b[0], c[0]), miny = Math.min(a[1], b[1], c[1]), maxy = Math.max(a[1], b[1], c[1]);
    const minz = Math.min(a[2], b[2], c[2]), maxz = Math.max(a[2], b[2], c[2]);
    if (maxx < X0 - 1 || minx > X1 + 1 || maxz < Z0 - 1 || minz > Z1 + 1 || maxy < Y0 - 1 || miny > Y1 + 1) return;
    const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2], vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
    let nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx; const n2 = Math.hypot(nx, ny, nz); if (n2 < 1e-9) return;
    const area = n2 / 2; nx /= n2; ny /= n2; nz /= n2; tris++;
    const L = Math.max(Math.hypot(ux, uy, uz), Math.hypot(vx, vy, vz), Math.hypot(b[0] - c[0], b[1] - c[1], b[2] - c[2]));
    const n = Math.max(1, Math.ceil(L / SP)); let cnt = 0;
    const pts = [];
    for (let i = 0; i <= n; i++) for (let j = 0; j <= n - i; j++) {
      const s = (i + (n === 1 ? 1 / 3 : 0)) / n, t = (j + (n === 1 ? 1 / 3 : 0)) / n; if (s + t > 1.0001) continue;
      pts.push(a[0] + ux * s + vx * t - nx * PUSH, a[1] + uy * s + vy * t - ny * PUSH, a[2] + uz * s + vz * t - nz * PUSH); cnt++;
    }
    const w = area / cnt; mats[mid].area += area;
    for (let k = 0; k < pts.length; k += 3) {
      const px = pts[k] - X0, py = pts[k + 1] - Y0, pz = pts[k + 2] - Z0;
      if (px < 0 || py < 0 || pz < 0 || px >= NX || py >= NY || pz >= NZ) continue;
      const bx = Math.floor(px), by = Math.floor(py), bz = Math.floor(pz);
      const sub = ((px - bx) >= 0.5 ? 1 : 0) | ((pz - bz) >= 0.5 ? 2 : 0) | ((py - by) >= 0.5 ? 4 : 0);
      const key = ((by * NZ + bz) * NX + bx) * 4096 + mid;
      let e = cell.get(key); if (!e) { e = [0, 0, 0]; cell.set(key, e); }
      e[0] += w; e[1] |= 1 << sub; e[2] += w * (py - by); samples++;
    }
  };
  root.traverse(o => {
    if (!o.isMesh || o.isSkinnedMesh || !o.geometry || !o.geometry.attributes.position) return;
    if (!visibleChain(o) || skipChain(o)) return;
    const g = o.geometry, pos = g.attributes.position, idx = g.index, mlist = [].concat(o.material);
    if (mlist.some(m => !m || m.visible === false || m.colorWrite === false)) return;
    const vcol = g.attributes.color && mlist[0].vertexColors ? g.attributes.color : null;
    const groups = g.groups && g.groups.length ? g.groups : [{ start: 0, count: idx ? idx.count : pos.count, materialIndex: 0 }];
    const inst = o.isInstancedMesh ? o.count : 1, base = o.matrixWorld.elements;
    meshes++;
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
          addTri(matId(m, vc));
        }
      }
    }
  });
  // pack: one row per (block, material)
  const n = cell.size, blk = new Int32Array(n), mid = new Uint16Array(n), area = new Float32Array(n), sub = new Uint8Array(n), hy = new Uint8Array(n); let k = 0;
  for (const [key, e] of cell) { blk[k] = Math.floor(key / 4096); mid[k] = key % 4096; area[k] = e[0]; sub[k] = e[1]; hy[k] = Math.min(255, Math.round(e[2] / e[0] * 255)); k++; }
  const b64 = arr => { const u = new Uint8Array(arr.buffer); let s = ''; for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000)); return btoa(s); };
  // the outlines of the items in the box, for naming in the report
  return { box, size: [NX, NY, NZ], stats: { meshes, tris, samples, rows: n }, mats, blk: b64(blk), mid: b64(mid), area: b64(area), sub: b64(sub), hy: b64(hy) };
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
