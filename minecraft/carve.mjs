// For each candidate cell of doorways.py: would a person fit there in the 3D campus? (its own collision, as the walker)
//
// usage: node minecraft/carve.mjs <page url> <cands.json> <free.json>
// A capsule of radius 0.25 m from 0.45 m to 1.55 m above the cell's floor, at the cell's centre and at four points
// 0.2 m off it; the cell is free if any of them touches nothing.
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
  return cands.map(([x, y, z, h]) => {
    for (const [ox, oz] of [[0, 0], [0.2, 0], [-0.2, 0], [0, 0.2], [0, -0.2]]) {
      const cx = x + 0.5 + ox, cz = z + 0.5 + oz;
      cap.start.set(cx, h + 0.45 + 0.25, cz); cap.end.set(cx, h + 1.55, cz);
      if (!oct.capsuleIntersect(cap)) return 1;
    }
    return 0;
  });
}, cands);
fs.writeFileSync(out, JSON.stringify(free));
console.log(`${free.filter(Boolean).length} of ${free.length} candidate cells are free in the 3D campus`);
await browser.close();
