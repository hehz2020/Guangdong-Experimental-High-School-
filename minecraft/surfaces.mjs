// Where can a person stand in the 3D campus? For every 1 m column, every height at which the walker of the 3D site
// can stand: stair treads, landings, floors, roofs it can reach, ramps. build_world.py --surfaces rebuilds steps from
// these in Minecraft (the 1 m grid turns a flight of 0.16 m steps into a heap of blocks).
//
// usage: node minecraft/surfaces.mjs <page url> <out.json> x0 x1 z0 z1 ytop
// Per column (cell centre) a ray goes down through the 3D campus's collision (which hits only faces turned up), and
// each surface flatter than about 50 degrees is a spot if a capsule of radius 0.15 m (stair lanes are narrow and rarely centred on a block) from 0.25 m to 1.8 m above it is
// free (the 0.25 m lets the next step's riser or a ramp's slope pass under it); 'wide' is 2 where one of radius 0.45 m is free too (no wall within 0.45 m of the column's centre), 1 where one of
// radius 0.3 m is, 0 otherwise.
// Output: { box, spots: base64 Float32 [x, z, h, wide] * n }.
import { createRequire } from 'node:module';
import fs from 'node:fs';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const [url, out, ...b] = process.argv.slice(2);
const [x0, x1, z0, z1, ytop] = b.map(Number);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 320, height: 200 } });
await page.goto(url + (url.includes('?') ? '&' : '?') + 'lightdebug=1&ui=0&shadows=0&post=0&aa=0', { waitUntil: 'load' });
await page.waitForFunction(() => window.__app && window.__app.ready && window.__engine, null, { timeout: 900000, polling: 500 });
const t0 = Date.now();
const res = await page.evaluate(async ([x0, x1, z0, z1, ytop]) => {
  const { FastOctree } = await import('/src/octree.js');
  const { Capsule } = await import('three/addons/math/Capsule.js');
  const THREE = await import('three');
  const E = window.__engine;
  try { E.renderer.setAnimationLoop(null); } catch (e) {}
  E.colliders.updateMatrixWorld(true);
  const oct = new FastOctree(); oct.fromGraphNode(E.colliders);
  const ray = new THREE.Ray(new THREE.Vector3(), new THREE.Vector3(0, -1, 0));
  const cap = new Capsule(new THREE.Vector3(), new THREE.Vector3(), 0.15), wide = new Capsule(new THREE.Vector3(), new THREE.Vector3(), 0.45);
  const n = new THREE.Vector3(), e1 = new THREE.Vector3(), e2 = new THREE.Vector3();
  const spots = [];
  for (let x = x0; x < x1; x++) for (let z = z0; z < z1; z++) {
    const cx = x + 0.5, cz = z + 0.5;
    let y = ytop, guard = 0;
    while (y > -8 && guard++ < 60) {
      ray.origin.set(cx, y, cz);
      const hit = oct.rayIntersect(ray);
      if (!hit) break;
      const h = hit.position.y, t = hit.triangle;
      e1.subVectors(t.b, t.a); e2.subVectors(t.c, t.a); n.crossVectors(e1, e2).normalize();
      if (Math.abs(n.y) > 0.64) {
        cap.start.set(cx, h + 0.4, cz); cap.end.set(cx, h + 1.65, cz);
        if (!oct.capsuleIntersect(cap)) {
          wide.radius = 0.45; wide.start.set(cx, h + 0.7, cz); wide.end.set(cx, h + 1.35, cz);
          let w = oct.capsuleIntersect(wide) ? 0 : 2;
          if (!w) { wide.radius = 0.3; wide.start.set(cx, h + 0.55, cz); wide.end.set(cx, h + 1.5, cz); w = oct.capsuleIntersect(wide) ? 0 : 1; }
          spots.push(cx, cz, h, w);
        }
      }
      y = h - 0.03;
    }
  }
  const f = new Float32Array(spots), u = new Uint8Array(f.buffer); let s = '';
  for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000));
  return { n: spots.length / 4, spots: btoa(s) };
}, [x0, x1, z0, z1, ytop]);
fs.writeFileSync(out, JSON.stringify({ box: [x0, x1, z0, z1], n: res.n, spots: res.spots }));
console.log(`${res.n} standing spots in ${Math.round((Date.now() - t0) / 1000)} s -> ${out}`);
await browser.close();
