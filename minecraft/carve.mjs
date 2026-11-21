// For each candidate cell of doorways.py: would a person fit there in the 3D campus? (its own collision, as the walker)
//
// usage: node minecraft/carve.mjs <page url> <cands.json> <free.json>
// A capsule of radius 0.25 m from 0.45 m to 1.8 m above the cell's floor, moved through the cell along the walking axis.
import { createRequire } from 'node:module';
import fs from 'node:fs';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const [url, candsFile, out] = process.argv.slice(2);
const cands = JSON.parse(fs.readFileSync(candsFile, 'utf8'));
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 320, height: 200 } });
await page.goto(url + (url.includes('?') ? '&' : '?') + 'lightdebug=1&ui=0&shadows=0&post=0&aa=0', { waitUntil: 'load' });
await page.waitForFunction(() => window.__app && window.__app.ready && window.__engine, null, { timeout: 900000, polling: 500 });
const free = await page.evaluate(async cands => {
  const { FastOctree } = await import('/src/octree.js');
  const { Capsule } = await import('three/addons/math/Capsule.js');
  const THREE = await import('three');
  const E = window.__engine;
  try { E.renderer.setAnimationLoop(null); } catch (e) {}
  E.colliders.updateMatrixWorld(true);
  const oct = new FastOctree(); oct.fromGraphNode(E.colliders);
  const cap = new Capsule(new THREE.Vector3(), new THREE.Vector3(), 0.25);
  // Walk through: from the middle of the cell before to the middle of the cell after (along the walking axis), at
  // the cell's middle or 0.25 m to either side; free if one of those three lines touches nothing all the way. A thin
  // wall on a block edge is crossed, so it is found wherever it lies in the cell.
  const hit = (cx, h, cz) => { cap.start.set(cx, h + 0.45 + 0.25, cz); cap.end.set(cx, h + 1.55, cz); return !!oct.capsuleIntersect(cap); };
  return cands.map(([x, y, z, h, axis]) => {
    for (const side of [0, 0.25, -0.25]) {
      let clear = true;
      for (let t = -1; t <= 1.0001 && clear; t += 0.2) {
        const cx = x + 0.5 + (axis === 'x' ? t : side), cz = z + 0.5 + (axis === 'x' ? side : t);
        if (hit(cx, h, cz)) clear = false;
      }
      if (clear) return 1;
    }
    return 0;
  });
}, cands);
fs.writeFileSync(out, JSON.stringify(free));
console.log(`${free.filter(Boolean).length} of ${free.length} candidate cells are free in the 3D campus`);
await browser.close();
