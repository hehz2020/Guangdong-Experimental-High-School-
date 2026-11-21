// Writes the lettered cards of the 3D teaching blocks (the day's lesson on every chalkboard, the class's chalk drawing
// and the slogan on the back wall) to a JSON file, for boards.py, which puts their words into the map as text displays.
// At one metre a chalkboard is four dark blocks; the words on it are what makes it a classroom.
//
// usage: node minecraft/boards.mjs <page url> <boards.json>
//
// The cards are quads of the Cards class (src/world/builders/slab-wide.js), textured from canvas atlases: each atlas
// keeps the rectangle of every picture it drew under a key ('board3', 'slogan1', 'art5'...). Those atlases are not
// exported, so this script serves the page a copy of slab-wide.js and teaching-slab.js that hands them (and the texts
// behind the keys) to window; the files in the repository are not changed. A card's key is the atlas rectangle that
// holds its top left texture corner.
// Record: { key, sheet: 'west' | 'east', c: centre [x, y, z], n: facing [x, y, z], w, h } in world metres; plus the texts:
// { lessons: { west: [...], east: [...] }, slogans: [...], art: [...] }.
import { createRequire } from 'node:module';
import fs from 'node:fs';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const [url, out] = process.argv.slice(2);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 320, height: 200 } });
const patch = (re, edits) => page.route(re, async route => {
  const r = await route.fetch(); let body = await r.text();
  for (const [a, b] of edits) { if (!body.includes(a)) throw new Error('boards.mjs: the 3D source changed, cannot find: ' + a); body = body.replace(a, b); }
  await route.fulfill({ response: r, body, headers: { ...r.headers(), 'content-type': 'text/javascript' } });
});
await patch(/\/slab-wide\.js(\?.*)?$/, [
  ['this.x = 0; this.y = 0; this.row = 0; this.uv = {};', 'this.x = 0; this.y = 0; this.row = 0; this.uv = {}; (window.__atlases ||= []).push(this);'],
  ['export { Atlas,', 'window.__texts = { LESSONS, SLOGANS, ART };\nexport { Atlas,'],
]);
await patch(/\/teaching-slab\.js(\?.*)?$/, [
  ['const uv = {}; let x = 0, y = 0, row = 0;', 'const uv = {}; window.__east = { uv, c }; let x = 0, y = 0, row = 0;'],
  ['let EAST = null;', 'let EAST = null; setTimeout(() => { window.__eastLessons = EAST_LESSONS; });'],
]);
const sep = url.includes('?') ? '&' : '?';
await page.goto(url + sep + 'lightdebug=1&ui=0&shadows=0&post=0&aa=0&time=12&quality=high', { waitUntil: 'load' });
await page.waitForFunction(() => window.__app && window.__app.ready && window.__engine, null, { timeout: 900000, polling: 500 });
const res = await page.evaluate(() => {
  const E = window.__engine, root = E.root;
  for (const d of E.details) d.obj.visible = true;
  root.updateMatrixWorld(true);
  const sheets = [];
  for (const a of window.__atlases || []) sheets.push({ canvas: a.c, uv: a.uv, sheet: 'west' });
  if (window.__east) sheets.push({ canvas: window.__east.c, uv: window.__east.uv, sheet: 'east' });
  const cards = [];
  let V = null;
  root.traverse(o => {
    if (!o.isMesh || o.isInstancedMesh) return;
    const mats = [].concat(o.material);
    if (mats.length !== 1 || !mats[0].map || !mats[0].map.image) return;
    const sh = sheets.find(s => s.canvas === mats[0].map.image); if (!sh) return;
    if (!V) V = o.position.constructor;
    const pos = o.geometry.attributes.position, uv = o.geometry.attributes.uv, nor = o.geometry.attributes.normal;
    if (!pos || !uv || pos.count % 4) return;
    for (let q = 0; q < pos.count; q += 4) {
      const P = [0, 1, 2, 3].map(k => new V().fromBufferAttribute(pos, q + k).applyMatrix4(o.matrixWorld));
      const n = new V().fromBufferAttribute(nor, q).transformDirection(o.matrixWorld);
      if (Math.abs(n.y) > 0.5) continue;                       // a card lying flat (desk tops, floor plates)
      const u0 = uv.getX(q), v1 = uv.getY(q + 2), tu = u0 + 0.0005, tv = v1 - 0.0005;
      let key = null;
      for (const [k, r] of Object.entries(sh.uv)) if (tu >= r[0] && tu <= r[2] && tv >= r[1] && tv <= r[3]) { key = k; break; }
      if (!key || !/^(board|slogan|art)\d+$/.test(key)) continue;
      const c = P.reduce((s, p) => s.add(p), new V()).multiplyScalar(0.25);
      cards.push({ key, sheet: sh.sheet, c: [c.x, c.y, c.z].map(v => +v.toFixed(3)), n: [n.x, n.y, n.z].map(v => +v.toFixed(3)),
        w: +P[0].distanceTo(P[1]).toFixed(3), h: +P[0].distanceTo(P[3]).toFixed(3) });
    }
  });
  const T = window.__texts || {};
  return { cards, lessons: { west: T.LESSONS || [], east: window.__eastLessons || [] }, slogans: T.SLOGANS || [], art: (T.ART || []).map(a => a[0]) };
});
fs.writeFileSync(out, JSON.stringify(res));
const n = {}; for (const c of res.cards) { const k = c.sheet + ':' + c.key.replace(/\d+$/, ''); n[k] = (n[k] || 0) + 1; }
console.log(res.cards.length, 'cards', JSON.stringify(n), 'lessons', res.lessons.west.length, '+', res.lessons.east.length);
await browser.close();
