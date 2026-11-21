// Renders a block grid saved by build_world.py (--blocks, exported to .bin by export_preview.py) as plain coloured
// cubes, so the result can be looked at without the game. Not what Minecraft shows (no textures, no game lighting);
// only for checking shapes, colours and what is missing.
//
// usage: node minecraft/preview.mjs <site origin, e.g. http://127.0.0.1:8800> <blocks.bin> <outDir> name,x,y,z,yawDeg,pitchDeg[,fov[,cut]] ...
//   cut: draw only what lies below this height in metres (a floor plan seen from above)
//   x, y, z: camera position in world metres (y = metres above the ground); yaw 0 = looking north, 90 = east... (as in the site)
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const [origin, bin, outDir, ...views] = process.argv.slice(2);
fs.mkdirSync(outDir, { recursive: true });
const data = fs.readFileSync(bin);
const html = `<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;background:#9cc3e6}</style>
<script type="importmap">{"imports":{"three":"./vendor/three/three.module.js"}}</script></head><body>
<script type="module">
import * as THREE from 'three';
const res = await fetch('/__blocks.bin'); const buf = new DataView(await res.arrayBuffer());
const n = buf.getUint32(0, true), X0 = buf.getFloat32(4, true), Y0 = buf.getFloat32(8, true), Z0 = buf.getFloat32(12, true);
const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true }); renderer.setSize(1280, 720); document.body.appendChild(renderer.domElement);
const scene = new THREE.Scene(); scene.background = new THREE.Color(0x9cc3e6); scene.fog = new THREE.Fog(0x9cc3e6, 120, 420);
scene.add(new THREE.HemisphereLight(0xdfefff, 0x6a6050, 1.6)); const sun = new THREE.DirectionalLight(0xffffff, 2.2); sun.position.set(-0.5, 1, 0.35); scene.add(sun);
// shapes: 0 full, 1 bottom slab, 2 top slab, 3 stairs (drawn as full), 4 pane/bars running north-south, 5 water, 6 glass, 7 leaves,
// 8 pane/bars running east-west, 9 a post (iron bars or a pane joined to nothing), 10 a standing lantern, 11 a hanging lantern
const geos = [new THREE.BoxGeometry(1, 1, 1), new THREE.BoxGeometry(1, 0.5, 1).translate(0, -0.25, 0), new THREE.BoxGeometry(1, 0.5, 1).translate(0, 0.25, 0),
  new THREE.BoxGeometry(1, 1, 1), new THREE.BoxGeometry(0.12, 1, 1), new THREE.BoxGeometry(1, 0.9, 1).translate(0, -0.05, 0), new THREE.BoxGeometry(1, 1, 1), new THREE.BoxGeometry(1, 1, 1), new THREE.BoxGeometry(1, 1, 0.12),
  new THREE.BoxGeometry(0.14, 1, 0.14), new THREE.BoxGeometry(0.38, 0.45, 0.38).translate(0, -0.27, 0), new THREE.BoxGeometry(0.38, 0.45, 0.38).translate(0, 0.2, 0)];
const mats = [new THREE.MeshLambertMaterial(), new THREE.MeshLambertMaterial(), new THREE.MeshLambertMaterial(), new THREE.MeshLambertMaterial(), new THREE.MeshLambertMaterial(),
  new THREE.MeshLambertMaterial({ transparent: true, opacity: 0.75 }), new THREE.MeshLambertMaterial({ transparent: true, opacity: 0.45 }), new THREE.MeshLambertMaterial(), new THREE.MeshLambertMaterial(),
  new THREE.MeshLambertMaterial(), new THREE.MeshBasicMaterial(), new THREE.MeshBasicMaterial()];
const count = new Array(12).fill(0); for (let i = 0; i < n; i++) count[buf.getUint8(16 + i * 8 + 7)]++;
const ims = geos.map((g, k) => { const m = new THREE.InstancedMesh(g, mats[k], Math.max(1, count[k])); m.count = 0; scene.add(m); return m; });
const M = new THREE.Matrix4(), C = new THREE.Color();
for (let i = 0; i < n; i++) {
  const o = 16 + i * 8, x = buf.getInt16(o, true), y = buf.getInt16(o + 2, true), z = buf.getInt16(o + 4, true);
  const r = buf.getUint8(o + 6) & 0x7, k = buf.getUint8(o + 7);
  const col = buf.getUint32(16 + n * 8 + i * 4, true);
  const im = ims[k]; M.makeTranslation(X0 + x + 0.5, Y0 + y + 0.5, Z0 + z + 0.5); im.setMatrixAt(im.count, M);
  C.setRGB(((col >> 16) & 255) / 255, ((col >> 8) & 255) / 255, (col & 255) / 255, THREE.SRGBColorSpace); im.setColorAt(im.count, C); im.count++;
}
ims.forEach(m => { m.instanceMatrix.needsUpdate = true; if (m.instanceColor) m.instanceColor.needsUpdate = true; });
const cam = new THREE.PerspectiveCamera(60, 1280 / 720, 0.1, 2000);
renderer.localClippingEnabled = true; const clip = new THREE.Plane(new THREE.Vector3(0, -1, 0), 1e6); mats.forEach(m => { m.clippingPlanes = [clip]; });
window.shoot = (x, y, z, yaw, pitch, fov, cut) => { clip.constant = cut ? cut : 1e6; cam.fov = fov || 60; cam.updateProjectionMatrix(); cam.position.set(x, y, z);
  cam.rotation.set(0, 0, 0); cam.rotation.order = 'YXZ'; cam.rotation.y = -yaw * Math.PI / 180; cam.rotation.x = pitch * Math.PI / 180; renderer.render(scene, cam); return true; };
window.ready = true;
</script></body></html>`;
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
await page.route('**/__preview.html', r => r.fulfill({ status: 200, contentType: 'text/html', body: html }));
await page.route('**/__blocks.bin', r => r.fulfill({ status: 200, contentType: 'application/octet-stream', body: data }));
const errs = []; page.on('pageerror', e => errs.push(e.message)); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await page.goto(origin + '/__preview.html');
await page.waitForFunction(() => window.ready, null, { timeout: 300000 });
for (const v of views) {
  const [name, x, y, z, yaw, pitch, fov, cut] = v.split(',');
  await page.evaluate(a => window.shoot(...a), [+x, +y, +z, +yaw, +pitch, +(fov || 60), +(cut || 0)]);
  await page.screenshot({ path: path.join(outDir, name + '.jpg'), type: 'jpeg', quality: 85 });
  console.log('shot', name);
}
if (errs.length) console.log('errors', errs);
await browser.close();
