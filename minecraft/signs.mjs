// Writes every lettered sign of the 3D campus that boards.mjs does not cover (room and office signs, door plates of
// the other buildings, the library's and the dome's panels, toilets, slogans, countdown boards...) to a JSON file, for
// signs.py, which sets their words in the map as text displays.
//
// usage: node minecraft/signs.mjs <page url> <signs.json>
//
// How the words are found: the 3D site paints all its lettering onto canvases with fillText. The script wraps
// fillText before the page loads (in the browser only; the site's code is not changed) and keeps, per canvas, each
// string with where it was drawn (after the canvas transform), its colour and font. Then every vertical quad (four
// vertices) of a mesh textured from such a canvas is a sign: the strings drawn inside the quad's texture rectangle are
// its words, in rows top to bottom; its ground colour is the canvas's colour at the quad's middle.
// The sheets boards.mjs reads (the teaching blocks' chalkboards and prints) are left to it.
// Record: { c, n, w, h, lines: [[text, colour]...], bg, m } in world metres (c: centre, n: facing, w and h: size).
import { createRequire } from 'node:module';
import fs from 'node:fs';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const [url, out] = process.argv.slice(2);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 320, height: 200 } });
await page.addInitScript(() => {
  const rec = new WeakMap(); window.__textRec = rec;
  const wrap = name => {
    const orig = CanvasRenderingContext2D.prototype[name];
    CanvasRenderingContext2D.prototype[name] = function (text, x, y, maxW) {
      try {
        const t = this.getTransform(), px = t.a * x + t.c * y + t.e, py = t.b * x + t.d * y + t.f;
        const size = (parseFloat((String(this.font).match(/(\d+(\.\d+)?)px/) || [0, 12])[1]) || 12) * Math.hypot(t.c, t.d);
        let a = rec.get(this.canvas); if (!a) rec.set(this.canvas, (a = []));
        a.push({ text: String(text), x: px, y: py, size, fill: typeof this.fillStyle === 'string' ? this.fillStyle : '#000000', align: this.textAlign, base: this.textBaseline, stroke: name === 'strokeText' });
      } catch (e) { /* only a record */ }
      return orig.apply(this, arguments);
    };
  };
  wrap('fillText');
});
const sep = url.includes('?') ? '&' : '?';
await page.goto(url + sep + 'lightdebug=1&ui=0&shadows=0&post=0&aa=0&time=12&quality=high', { waitUntil: 'load' });
await page.waitForFunction(() => window.__app && window.__app.ready && window.__engine, null, { timeout: 900000, polling: 500 });
const res = await page.evaluate(() => {
  const E = window.__engine, root = E.root, rec = window.__textRec;
  for (const d of E.details) d.obj.visible = true;
  root.updateMatrixWorld(true);
  const SKIP_MAT = /^(sw-chalkboards|sw-prints|ts-chalkboards|ts-prints)$/;
  const norm = document.createElement('canvas').getContext('2d');
  const hex = s => { norm.fillStyle = '#000000'; norm.fillStyle = s; return norm.fillStyle; };
  const pix = new Map();
  const colourAt = (canvas, u, v) => {
    try {
      let g = pix.get(canvas); if (!g) { g = canvas.getContext('2d'); pix.set(canvas, g); }
      const d = g.getImageData(Math.max(0, Math.min(canvas.width - 1, Math.floor(u * canvas.width))), Math.max(0, Math.min(canvas.height - 1, Math.floor((1 - v) * canvas.height))), 1, 1).data;
      return '#' + [d[0], d[1], d[2]].map(c => c.toString(16).padStart(2, '0')).join('');
    } catch (e) { return null; }
  };
  const signs = [], seen = new Set();
  root.traverse(o => {
    if (!o.isMesh || o.isInstancedMesh) return;
    const mats = [].concat(o.material);
    if (mats.length !== 1 || SKIP_MAT.test(mats[0].name || '')) return;
    const map = mats[0].map, img = map && map.image;
    if (!img || !rec.get(img)) return;
    const texts = rec.get(img).filter(t => t.text.trim()), W = img.width, H = img.height;
    const pos = o.geometry.attributes.position, uv = o.geometry.attributes.uv;
    if (!pos || !uv || pos.count % 4) return;
    const V = o.position.constructor, flipY = map.flipY !== false;
    const m = map.matrix && map.matrixAutoUpdate !== undefined ? (map.updateMatrix(), map.matrix) : null;
    for (let q = 0; q < pos.count; q += 4) {
      const P = [0, 1, 2, 3].map(k => new V().fromBufferAttribute(pos, q + k).applyMatrix4(o.matrixWorld));
      const n = new V().subVectors(P[1], P[0]).cross(new V().subVectors(P[2], P[0])).normalize();
      if (Math.abs(n.y) > 0.5) continue;
      const us = [], vs = [];
      for (let k = 0; k < 4; k++) {
        let u = uv.getX(q + k), v = uv.getY(q + k);
        if (m) { const e = m.elements, u2 = e[0] * u + e[3] * v + e[6], v2 = e[1] * u + e[4] * v + e[7]; u = u2; v = v2; }
        us.push(u); vs.push(v);
      }
      const u0 = Math.min(...us), u1 = Math.max(...us), v0 = Math.min(...vs), v1 = Math.max(...vs);
      if (u1 - u0 > 1.01 || v1 - v0 > 1.01 || u0 < -0.01 || v0 < -0.01 || u1 > 1.01 || v1 > 1.01) continue;   // a repeating texture: not a sign
      // the texture rectangle in canvas pixels (rows from the top)
      const x0 = u0 * W, x1 = u1 * W, y0 = (flipY ? 1 - v1 : v0) * H, y1 = (flipY ? 1 - v0 : v1) * H;
      const inside = texts.filter(t => t.x >= x0 - 2 && t.x <= x1 + 2 && t.y >= y0 - 2 && t.y <= y1 + 2);
      if (!inside.length) continue;
      inside.sort((a, b) => a.y - b.y || a.x - b.x);
      const rows = [];
      for (const t of inside) {
        const r = rows.length && Math.abs(rows[rows.length - 1].y - t.y) < Math.max(4, t.size * 0.5) ? rows[rows.length - 1] : null;
        if (r) { r.items.push(t); } else rows.push({ y: t.y, items: [t] });
      }
      const lines = rows.map(r => { r.items.sort((a, b) => a.x - b.x); return [r.items.map(t => t.text).join(' ').replace(/\s+/g, ' ').trim(), hex(r.items[0].fill)]; }).filter(l => l[0]);
      if (!lines.length) continue;
      const c = P.reduce((s, p) => s.add(p), new V()).multiplyScalar(0.25);
      const ys = P.map(p => p.y), hgt = Math.max(...ys) - Math.min(...ys);
      const wid = Math.max(...P.map(p => Math.hypot(p.x - c.x, p.z - c.z))) * 2;
      const key = c.x.toFixed(1) + ',' + c.y.toFixed(1) + ',' + c.z.toFixed(1) + n.x.toFixed(1) + n.z.toFixed(1);
      if (seen.has(key)) continue; seen.add(key);
      const flat = lines.map(l => l[0]).join('');
      signs.push({ c: [c.x, c.y, c.z].map(v => +v.toFixed(3)), n: [n.x, n.y, n.z].map(v => +v.toFixed(3)), w: +wid.toFixed(2), h: +hgt.toFixed(2),
        lines, bg: colourAt(img, (u0 + u1) / 2, (v0 + v1) / 2), m: mats[0].name || '', chars: flat.length });
    }
  });
  return signs;
});
fs.writeFileSync(out, JSON.stringify(res));
const byMat = {}; for (const s of res) byMat[s.m] = (byMat[s.m] || 0) + 1;
console.log(res.length, 'signs', JSON.stringify(byMat).slice(0, 600));
await browser.close();
