// Writes the basketball backboards of the 3D campus (the gym's six baskets hung from the roof, the courts' sixteen on
// posts) to a JSON file, for hoops.py: [{ c: centre [x, y, z], n: the way the board faces (into the court), w, h }]
// in world metres. A board is a quad (four vertices) of a mesh whose material is a backboard's.
//
// usage: node minecraft/hoops.mjs <page url> <hoops.json>
import { createRequire } from 'node:module';
import fs from 'node:fs';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const [url, out] = process.argv.slice(2);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 320, height: 200 } });
const sep = url.includes('?') ? '&' : '?';
await page.goto(url + sep + 'lightdebug=1&ui=0&shadows=0&post=0&aa=0&time=12&quality=high', { waitUntil: 'load' });
await page.waitForFunction(() => window.__app && window.__app.ready && window.__engine, null, { timeout: 900000, polling: 500 });
const boards = await page.evaluate(() => {
  const E = window.__engine, root = E.root;
  for (const d of E.details) d.obj.visible = true;
  root.updateMatrixWorld(true);
  const outs = [], seen = new Set();
  root.traverse(o => {
    if (!o.isMesh || o.isInstancedMesh) return;
    const mats = [].concat(o.material);
    if (mats.length !== 1 || !/backboard/.test(mats[0].name || '')) return;
    const V = o.position.constructor, pos = o.geometry.attributes.position;
    if (pos.count % 4) return;
    for (let q = 0; q < pos.count; q += 4) {
      const P = [0, 1, 2, 3].map(k => new V().fromBufferAttribute(pos, q + k).applyMatrix4(o.matrixWorld));
      const c = P.reduce((s, p) => s.add(p), new V()).multiplyScalar(0.25);
      const n = new V().subVectors(P[1], P[0]).cross(new V().subVectors(P[3], P[0])).normalize();
      const key = c.x.toFixed(1) + ',' + c.y.toFixed(1) + ',' + c.z.toFixed(1); if (seen.has(key)) continue; seen.add(key);
      outs.push({ c: [c.x, c.y, c.z].map(v => +v.toFixed(3)), n: [n.x, n.y, n.z].map(v => +v.toFixed(3)), w: +P[0].distanceTo(P[1]).toFixed(2), h: +P[0].distanceTo(P[3]).toFixed(2), m: mats[0].name });
    }
  });
  return outs;
});
fs.writeFileSync(out, JSON.stringify(boards));
console.log(boards.length, 'backboards', JSON.stringify(boards.slice(0, 2)));
await browser.close();
