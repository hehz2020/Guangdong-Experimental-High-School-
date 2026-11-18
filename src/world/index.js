// Builds the campus from campus-data.js. Each item is handed to the builder registered for its style;
// items without one fall back to plain massing.
import { THREE, mat, flat, prism, stadium, box } from '../kit.js';
import { build as generic } from './builders/generic.js';
import { CANAL } from './extras/landscape.js';
import { lightPools } from '../street.js';

export const BUILDERS = {
  // style -> module path, filled in as dedicated builders are written
  'teaching-slab': './builders/teaching-slab.js',
  'teaching-slab-wide': './builders/slab-wide.js',
  'clock-tower': './builders/clock-tower.js',
  'stair-core': './builders/stair-core.js',
  'stair-tower-oculus': './builders/stair-tower.js',
  'sign-wing': './builders/sign-wing.js',
  'walkway': './builders/walkway.js',
  'space-frame': './builders/canopy.js',
  'plaza': './builders/plaza.js',
  'gym': './builders/gym.js',
  'grandstand': './builders/grandstand.js',
  'seating': './builders/seating.js',
  'none': './builders/none.js',
  'new-building': './builders/new-building.js',
  'arc': './builders/arc.js',
  'dome': './builders/dome.js',
  'slab-block': './builders/slab-block.js',
  'round-tower': './builders/round-tower.js',
  'plain': './builders/plain-block.js',
};

// Modules that add things not tied to one data item (track furniture, courts, landscape...). Each exports build(ctx).
export const EXTRAS = [
  './extras/athletics.js',
  './extras/gate.js',
  './extras/context.js',
  './extras/landscape.js',
  './extras/city.js',
  './extras/track-field.js',
  './extras/courts.js',
];

/**
 * The ground: 1500 m square, tessellated, facing up, texture coordinates in metres. canal: { westEdge, eastEdge } (two
 * points each, north end first) or null; between the two edges, over their length, the ground is left open.
 */
function groundGeometry(canal) {
  const X0 = -736.3, X1 = 763.7, Z0 = -728.7, Z1 = 771.3, pos = [], idx = [];
  const rows = []; for (let i = 0; i <= 30; i++) rows.push(Z0 + (Z1 - Z0) * i / 30);
  let zc0 = Infinity, zc1 = -Infinity, xw = () => 0, xe = () => 0;
  if (canal) {
    const { westEdge: w, eastEdge: e } = canal; zc0 = w[0][1]; zc1 = w[1][1]; rows.push(zc0, zc1); rows.sort((a, b) => a - b);
    xw = z => w[0][0] + (w[1][0] - w[0][0]) * (z - w[0][1]) / (w[1][1] - w[0][1]); xe = z => e[0][0] + (e[1][0] - e[0][0]) * (z - e[0][1]) / (e[1][1] - e[0][1]);
  }
  const strip = (za, zb, xa0, xa1, xb0, xb1, n) => {     // a band between two rows, from x0 to x1 on each, in n columns
    const base = pos.length / 3;
    for (let i = 0; i <= n; i++) { pos.push(xa0 + (xa1 - xa0) * i / n, 0, za, xb0 + (xb1 - xb0) * i / n, 0, zb); }
    for (let i = 0; i < n; i++) { const q = base + i * 2; idx.push(q, q + 1, q + 3, q, q + 3, q + 2); }
  };
  for (let i = 0; i < rows.length - 1; i++) {
    const za = rows[i], zb = rows[i + 1]; if (zb - za < 1e-6) continue;
    if (za >= zc0 - 1e-6 && zb <= zc1 + 1e-6) { strip(za, zb, X0, xw(za), X0, xw(zb), 22); strip(za, zb, xe(za), X1, xe(zb), X1, 8); }
    else strip(za, zb, X0, X1, X0, X1, 30);
  }
  const g = new THREE.BufferGeometry(), n = pos.length / 3, nor = new Float32Array(pos.length), uv = new Float32Array(n * 2);
  for (let i = 0; i < n; i++) { nor[i * 3 + 1] = 1; uv[i * 2] = pos[i * 3]; uv[i * 2 + 1] = -pos[i * 3 + 2]; }
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx); return g;
}

/**
 * only: optional Set of item ids to build (others are skipped), for close-up checks of one building.
 * tryBuilders: optional { style: './builders/file.js' } used on top of BUILDERS for this page load (testing a builder before it is registered).
 * tryExtras: optional list of './extras/file.js' loaded in addition to EXTRAS.
 */
export async function buildWorld(campus, only = null, tryBuilders = {}, tryExtras = [], env = {}) {
  const builders = { ...BUILDERS, ...tryBuilders };
  const root = new THREE.Group(); root.name = 'campus';
  const colliders = new THREE.Group(); colliders.name = 'colliders';
  const report = { built: [], fallback: [], failed: [] };
  const details = [];        // { obj, x, z, range }: small things that are only shown when the viewer is within range metres
  const updaters = [];       // functions (dt, seconds, { camera, lighting, renderer }) called every frame: water, fountains, leaves
  const places = [];         // extra entries for the places menu, offered by extras: { name, x, z, yaw, y, fly, pitch }
  const detail = (obj, x, z, range) => { details.push({ obj, x, z, range }); return obj; };

  // ground
  // Tessellated and 5 cm below zero: as two huge triangles at y 0 it won the depth test against the paving, lawn, road and water
  // layers lying a few millimetres above it at some window sizes and from the air. The collision floor stays at 0.
  // The grid is shifted by an odd amount: with a vertex exactly under the eye and a level view (the centre of the track was
  // one) the software renderer drew the whole ground in the earth colour.
  // The canal is a channel below ground level (extras/landscape.js lines it and fills it with water), so the ground is
  // open between its two edges. Without the extras (a close-up of chosen items) the ground is whole.
  const ground = new THREE.Mesh(groundGeometry(only && !env.extras ? null : CANAL), mat('earth'));
  ground.position.y = -0.05; ground.receiveShadow = true; ground.name = 'ground'; root.add(ground);
  const floor = box(0, 0, 1400, 1400, -1, 0, mat('earth')); colliders.add(floor);

  // (the running track, the pitch and their markings are drawn by extras/athletics.js)

  const todo = campus.items.filter(i => !only || only.has(i.id)); let done = 0;
  for (const item of campus.items) {
    if (only && !only.has(item.id)) continue;
    if (env.progress) await env.progress('item', ++done, todo.length);       // lets the page show progress between builders
    const group = new THREE.Group(); group.name = item.id; root.add(group);
    const ctx = {
      campus, item, detail, lowPower: !!env.lowPower, safe: !!env.safe,
      // per-frame hook, as the extras have: fn(dt, seconds, { camera, lighting, renderer })
      animate: fn => { updaters.push(fn); },
      add: obj => { group.add(obj); return obj; },
      // register a mesh (in world coordinates) that the player cannot walk through
      // Call after ctx.add (the mesh needs its parents to know where it is). For an invisible barrier, add a mesh and set visible = false.
      collide: mesh => {
        mesh.updateWorldMatrix(true, false);
        const c = new THREE.Mesh(mesh.geometry); c.matrixAutoUpdate = false; c.matrix.copy(mesh.matrixWorld); colliders.add(c); return mesh;
      },
    };
    const path = builders[item.style];
    try {
      if (path) { (await import(path)).build(item, ctx); report.built.push(item.id); }
      else { generic(item, ctx); report.fallback.push(item.id); }
    } catch (err) {
      console.error('builder failed for', item.id, err);
      group.clear(); generic(item, ctx); report.failed.push(item.id);
    }
  }
  // With ?only= (a close-up of chosen items) the standing extras are left out unless ?extras=1 asks for them.
  const extras = [...(only && !env.extras ? [] : EXTRAS), ...tryExtras]; let k = 0;
  for (const path of extras) {
    if (env.progress) await env.progress('extra', ++k, extras.length);
    const group = new THREE.Group(); group.name = path; root.add(group);
    const ctx = {
      campus, detail, lowPower: !!env.lowPower, safe: !!env.safe,
      add: obj => { group.add(obj); return obj; },
      collide: mesh => { mesh.updateWorldMatrix(true, false); const c = new THREE.Mesh(mesh.geometry); c.matrixAutoUpdate = false; c.matrix.copy(mesh.matrixWorld); colliders.add(c); return mesh; },
      animate: fn => { updaters.push(fn); },
      place: (name, x, z, yaw, y = 0, fly = false, pitch = 0) => { places.push({ name, x, z, yaw, y, fly, pitch }); },
    };
    try { (await import(path)).build(ctx); report.built.push(path); }
    catch (err) { console.error('extra module failed:', path, err); group.clear(); report.failed.push(path); }
  }
  // pools of light under every lamp the modules recorded, after dusk (not in safe mode: it is a custom shader)
  if (!env.safe) { const pools = lightPools(); if (pools) { root.add(pools.mesh); updaters.push((dt, t, e) => pools.update(e)); } }
  return { root, colliders, report, details, updaters, places };
}
