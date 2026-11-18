// Builds the campus from campus-data.js. Each item is handed to the builder registered for its style;
// items without one fall back to plain massing.
import { THREE, mat, flat, prism, stadium, box } from '../kit.js';
import { build as generic } from './builders/generic.js';

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
};

// Modules that add things not tied to one data item (track furniture, courts, landscape...). Each exports build(ctx).
export const EXTRAS = [
  './extras/landscape.js',
  './extras/track-field.js',
  './extras/courts.js',
];

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
  const detail = (obj, x, z, range) => { details.push({ obj, x, z, range }); return obj; };

  // ground
  // Tessellated and 5 cm below zero: as two huge triangles at y 0 it won the depth test against the paving, lawn, road and water
  // layers lying a few millimetres above it at some window sizes and from the air. The collision floor stays at 0.
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(1400, 1400, 28, 28), mat('earth'));
  ground.rotation.x = -Math.PI / 2; ground.position.y = -0.05; ground.receiveShadow = true; root.add(ground);
  const floor = box(0, 0, 1400, 1400, -1, 0, mat('earth')); colliders.add(floor);

  // running track: standard geometry from the data file
  const t = campus.track;
  const outer = stadium(t.cx, t.cz, t.straight, t.outerRadius), inner = stadium(t.cx, t.cz, t.straight, t.innerRadius);
  // Green apron round the track. On the east side a paved road runs right along the kerb (satellite image; 2018 footage shows a
  // railing between track and road), so the apron is cut back to a narrow strip there.
  root.add(flat(stadium(t.cx, t.cz, t.straight, t.outerRadius + 3.5).map(([x, z]) => [Math.min(x, t.cx + t.outerRadius + 0.9), z]), 0.02, mat('apronGreen')));
  root.add(flat(outer, 0.04, mat('trackRed')));
  const f = t.infield;
  // Infield grass: the measured rectangle with its corners clipped by the inner edge of the bends (as seen in the 2022 overhead frames).
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  root.add(flat(stadium(t.cx, t.cz, t.straight, t.innerRadius - 0.4).map(([x, z]) => [clamp(x, f.cx - f.sizeX / 2, f.cx + f.sizeX / 2), clamp(z, f.cz - f.sizeZ / 2, f.cz + f.sizeZ / 2)]), 0.06, mat('grass')));
  const lineMat = new THREE.LineBasicMaterial({ color: 0xffffff });
  for (let i = 0; i <= t.lanes; i++) {
    const pts = stadium(t.cx, t.cz, t.straight, t.innerRadius + i * t.laneWidth).map(([x, z]) => new THREE.Vector3(x, 0.07, z));
    root.add(new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(pts), lineMat));
  }

  for (const item of campus.items) {
    if (only && !only.has(item.id)) continue;
    const group = new THREE.Group(); group.name = item.id; root.add(group);
    const ctx = {
      campus, item, detail, lowPower: !!env.lowPower,
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
  for (const path of [...(only && !env.extras ? [] : EXTRAS), ...tryExtras]) {
    const group = new THREE.Group(); group.name = path; root.add(group);
    const ctx = {
      campus, detail, lowPower: !!env.lowPower,
      add: obj => { group.add(obj); return obj; },
      collide: mesh => { mesh.updateWorldMatrix(true, false); const c = new THREE.Mesh(mesh.geometry); c.matrixAutoUpdate = false; c.matrix.copy(mesh.matrixWorld); colliders.add(c); return mesh; },
    };
    try { (await import(path)).build(ctx); report.built.push(path); }
    catch (err) { console.error('extra module failed:', path, err); group.clear(); report.failed.push(path); }
  }
  return { root, colliders, report, details };
}
