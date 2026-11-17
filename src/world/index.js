// Builds the campus from campus-data.js. Each item is handed to the builder registered for its style;
// items without one fall back to plain massing.
import { THREE, mat, flat, prism, stadium, box } from '../kit.js';
import { build as generic } from './builders/generic.js';

export const BUILDERS = {
  // style -> module path, filled in as dedicated builders are written
};

export async function buildWorld(campus) {
  const root = new THREE.Group(); root.name = 'campus';
  const colliders = new THREE.Group(); colliders.name = 'colliders';
  const report = { built: [], fallback: [], failed: [] };

  // ground
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(1400, 1400), mat('earth'));
  ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; root.add(ground);
  const floor = box(0, 0, 1400, 1400, -1, 0, mat('earth')); colliders.add(floor);

  // running track: standard geometry from the data file
  const t = campus.track;
  const outer = stadium(t.cx, t.cz, t.straight, t.outerRadius), inner = stadium(t.cx, t.cz, t.straight, t.innerRadius);
  root.add(flat(stadium(t.cx, t.cz, t.straight, t.outerRadius + 3.5), 0.02, mat('apronGreen')));
  root.add(flat(outer, 0.04, mat('trackRed')));
  const f = t.infield;
  root.add(flat([[f.cx - f.sizeX / 2, f.cz - f.sizeZ / 2], [f.cx + f.sizeX / 2, f.cz - f.sizeZ / 2], [f.cx + f.sizeX / 2, f.cz + f.sizeZ / 2], [f.cx - f.sizeX / 2, f.cz + f.sizeZ / 2]], 0.06, mat('grass')));
  const lineMat = new THREE.LineBasicMaterial({ color: 0xffffff });
  for (let i = 0; i <= t.lanes; i++) {
    const pts = stadium(t.cx, t.cz, t.straight, t.innerRadius + i * t.laneWidth).map(([x, z]) => new THREE.Vector3(x, 0.07, z));
    root.add(new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(pts), lineMat));
  }

  for (const item of campus.items) {
    const group = new THREE.Group(); group.name = item.id; root.add(group);
    const ctx = {
      campus, item,
      add: obj => { group.add(obj); return obj; },
      // register a mesh (in world coordinates) that the player cannot walk through
      // Call after ctx.add (the mesh needs its parents to know where it is). For an invisible barrier, add a mesh and set visible = false.
      collide: mesh => {
        mesh.updateWorldMatrix(true, false);
        const c = new THREE.Mesh(mesh.geometry); c.matrixAutoUpdate = false; c.matrix.copy(mesh.matrixWorld); colliders.add(c); return mesh;
      },
    };
    const path = BUILDERS[item.style];
    try {
      if (path) { (await import(path)).build(item, ctx); report.built.push(item.id); }
      else { generic(item, ctx); report.fallback.push(item.id); }
    } catch (err) {
      console.error('builder failed for', item.id, err);
      group.clear(); generic(item, ctx); report.failed.push(item.id);
    }
  }
  return { root, colliders, report };
}
