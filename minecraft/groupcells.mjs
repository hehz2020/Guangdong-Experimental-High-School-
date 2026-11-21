// Writes the 1 m columns that the meshes of some named groups of the 3D campus occupy, with the height range they
// span in each, for build_world.py (--balustrades): e.g. the canal's stone balustrade, which the voxels turn into a
// solid kerb wall, becomes a row of the game's wall blocks.
//
// usage: node minecraft/groupcells.mjs <page url> <out.json> <group name regex>
// Out: [[x, z, lowest y, highest y], ...] in world metres (x, z: the column's lower corner).
import { createRequire } from 'node:module';
import fs from 'node:fs';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const [url, out, pattern] = process.argv.slice(2);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 320, height: 200 } });
const sep = url.includes('?') ? '&' : '?';
await page.goto(url + sep + 'lightdebug=1&ui=0&shadows=0&post=0&aa=0&time=12&quality=high', { waitUntil: 'load' });
await page.waitForFunction(() => window.__app && window.__app.ready && window.__engine, null, { timeout: 900000, polling: 500 });
const cells = await page.evaluate(src => {
  const re = new RegExp(src), E = window.__engine, root = E.root;
  for (const d of E.details) d.obj.visible = true;
  root.updateMatrixWorld(true);
  const col = new Map();
  const groups = []; root.traverse(o => { if (re.test(o.name || '')) groups.push(o); });
  for (const g of groups) g.traverse(o => {
    if (!o.isMesh) return;
    const pos = o.geometry.attributes.position, idx = o.geometry.index, V = o.position.constructor;
    const a = new V(), b = new V(), c = new V(), p = new V();
    const tri = idx ? idx.count / 3 : pos.count / 3;
    for (let t = 0; t < tri; t++) {
      const i0 = idx ? idx.getX(t * 3) : t * 3, i1 = idx ? idx.getX(t * 3 + 1) : t * 3 + 1, i2 = idx ? idx.getX(t * 3 + 2) : t * 3 + 2;
      a.fromBufferAttribute(pos, i0).applyMatrix4(o.matrixWorld); b.fromBufferAttribute(pos, i1).applyMatrix4(o.matrixWorld); c.fromBufferAttribute(pos, i2).applyMatrix4(o.matrixWorld);
      const n = Math.max(1, Math.ceil(Math.max(a.distanceTo(b), b.distanceTo(c), c.distanceTo(a)) / 0.25));
      for (let i = 0; i <= n; i++) for (let j = 0; j <= n - i; j++) {
        const u = i / n, v = j / n; p.copy(a).multiplyScalar(1 - u - v).addScaledVector(b, u).addScaledVector(c, v);
        const k = Math.floor(p.x) + ',' + Math.floor(p.z), e = col.get(k);
        if (!e) col.set(k, [Math.floor(p.x), Math.floor(p.z), p.y, p.y]); else { e[2] = Math.min(e[2], p.y); e[3] = Math.max(e[3], p.y); }
      }
    }
  });
  return [...col.values()].map(([x, z, lo, hi]) => [x, z, +lo.toFixed(2), +hi.toFixed(2)]);
}, pattern);
fs.writeFileSync(out, JSON.stringify(cells));
console.log(cells.length, 'columns');
await browser.close();
