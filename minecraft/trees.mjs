// Writes every tree of the 3D campus (the leaf-card trees, palms and conifers of src/flora.js, which the builders scatter
// as instanced meshes) to a JSON file, for build_world.py --trees, so that the map can grow a Minecraft tree of the same
// shape in each place instead of the voxelized crown (a solid blob of leaves at one metre).
//
// usage: node minecraft/trees.mjs <page url> <trees.json>
//
// The shapes are read back from the 3D geometry, in world metres (y up from the ground), per tree:
//   broadleaf: { k: 'b', foot, top: the trunk's top, boughs: [[start, middle, end] x 6], clusters: [[x, y, z, rx, ry] x 11],
//               hue }  -- broadleafShape() draws the trunk as one tube of three rings (foot, middle, top) and six boughs of
//               three rings each, from the trunk's top into the first six leaf clusters; its leaf cards go round eleven
//               cluster centres (card i to cluster i % 11), each card within about 2.6 m of its centre (times the scale)
//   palm:      { k: 'p', foot, top: the trunk's top, crown: the crown shaft's top, s: scale }
//   conifer:   { k: 'c', foot, top, r: crown radius at its foot }
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
const trees = await page.evaluate(() => {
  const E = window.__engine, root = E.root;
  for (const d of E.details) d.obj.visible = true;
  root.updateMatrixWorld(true);
  let V = null, M = null;
  const ring = (pos, start, seg) => {                       // centre of one ring of a tube (seg + 1 vertices, the last = the first)
    const c = new V(); for (let j = 0; j < seg; j++) c.add(new V().fromBufferAttribute(pos, start + j)); return c.multiplyScalar(1 / seg);
  };
  const shapeCache = new Map();
  function broadleaf(trunkGeo, crownGeo) {
    const key = trunkGeo.uuid + crownGeo.uuid; if (shapeCache.has(key)) return shapeCache.get(key);
    const tp = trunkGeo.attributes.position, cp = crownGeo.attributes.position;
    const foot = ring(tp, 0, 9), top = ring(tp, 20, 9), boughs = [];
    for (let b = 0; b < 6; b++) { const base = 30 + b * 21; if (base + 21 > tp.count) break; boughs.push([ring(tp, base, 6), ring(tp, base + 7, 6), ring(tp, base + 14, 6)]); }
    const cards = cp.count / 4, sum = Array.from({ length: 11 }, () => [new V(), 0]), centres = [];
    for (let i = 0; i < cards; i++) { const c = new V(); for (let k = 0; k < 4; k++) c.add(new V().fromBufferAttribute(cp, i * 4 + k)); c.multiplyScalar(0.25); centres.push(c); sum[i % 11][0].add(c); sum[i % 11][1]++; }
    const clusters = sum.map(([s, n], k) => k < boughs.length ? boughs[k][2].clone() : s.multiplyScalar(1 / Math.max(1, n)));
    const radii = clusters.map((c, k) => { const d = centres.filter((_, i) => i % 11 === k).map(p => p.distanceTo(c)).sort((a, b) => a - b); return d.length ? d[Math.floor(d.length * 0.85)] : 2; });
    const s = { foot, top, boughs, clusters, radii }; shapeCache.set(key, s); return s;
  }
  const out = [], seen = new Set();
  root.traverse(o => {
    if (!o.isInstancedMesh || !/^hifi-(tree-crowns|palm-fronds|conifer-crowns)$/.test(o.name)) return;
    if (!V) { V = o.position.constructor; M = new o.matrixWorld.constructor(); }
    const sib = o.parent.children, at = sib.indexOf(o);
    const trunk = sib.slice(0, at).reverse().find(s => s.isInstancedMesh && /^hifi-(tree|palm|conifer)-trunks$/.test(s.name) && s.count === o.count);
    if (!trunk) return;
    const hue = +(String(o.material.name).match(/(\d+)$/) || [0, 100])[1];
    o.geometry.computeBoundingBox(); const bb = o.geometry.boundingBox;
    const shape = o.name === 'hifi-tree-crowns' ? broadleaf(trunk.geometry, o.geometry) : null;
    const shaft = o.name === 'hifi-palm-fronds' ? sib.find(s => s.name === 'hifi-palm-shafts' && s.count === o.count) : null;
    const W = (p, m) => { const q = p.clone().applyMatrix4(m); return [+q.x.toFixed(2), +q.y.toFixed(2), +q.z.toFixed(2)]; };
    for (let i = 0; i < o.count; i++) {
      o.getMatrixAt(i, M); M.premultiply(o.matrixWorld);
      const foot = W(new V(0, 0, 0), M), key = o.name + foot[0].toFixed(1) + ',' + foot[2].toFixed(1);
      if (seen.has(key)) continue; seen.add(key);
      const e = M.elements, sx = Math.hypot(e[0], e[1], e[2]), sy = Math.hypot(e[4], e[5], e[6]);
      if (shape) {
        out.push({ k: 'b', foot: W(shape.foot, M), top: W(shape.top, M), boughs: shape.boughs.map(b => b.map(p => W(p, M))),
          clusters: shape.clusters.map((c, j) => [...W(c, M), +(shape.radii[j] * sx).toFixed(2), +(shape.radii[j] * sy).toFixed(2)]), hue });
      } else if (shaft) {
        shaft.geometry.computeBoundingBox(); trunk.geometry.computeBoundingBox();
        out.push({ k: 'p', foot, top: W(new V(0, trunk.geometry.boundingBox.max.y, 0), M), crown: W(new V(0, shaft.geometry.boundingBox.max.y, 0), M), s: +sy.toFixed(3) });
      } else {
        out.push({ k: 'c', foot, top: W(new V(0, bb.max.y, 0), M), r: +(Math.max(-bb.min.x, bb.max.x, -bb.min.z, bb.max.z) * sx).toFixed(2) });
      }
    }
  });
  return out;
});
fs.writeFileSync(out, JSON.stringify(trees));
const n = {}; for (const t of trees) n[t.k] = (n[t.k] || 0) + 1;
console.log(trees.length, 'trees', JSON.stringify(n));
await browser.close();
