import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';

const EYE_HEIGHT = 1.6;      // metres
const RADIUS = 0.4;          // player collision radius, metres
const WALK = 1.5, RUN = 4.5; // metres per second

// Footprints that do not block walking. This is a modelling judgement taken from the
// reference footage, not a measurement: the plaza canopy is an open space-frame roof
// on columns with people walking underneath it.
const WALK_UNDER = new Set(['plaza-canopy']);

function distToSegment(px, pz, ax, az, bx, bz) {
  const dx = bx - ax, dz = bz - az, len2 = dx * dx + dz * dz;
  const t = len2 ? Math.max(0, Math.min(1, ((px - ax) * dx + (pz - az) * dz) / len2)) : 0;
  return Math.hypot(px - (ax + t * dx), pz - (az + t * dz));
}

function makeBlockers(campus) {
  return campus.buildings.filter(b => !WALK_UNDER.has(b.id)).map(b => {
    const f = b.footprint;
    if (b.shape === 'rect') return (x, z) => Math.abs(x - f.cx) < f.sizeX / 2 + RADIUS && Math.abs(z - f.cz) < f.sizeZ / 2 + RADIUS;
    if (b.shape === 'circle') return (x, z) => Math.hypot(x - f.cx, z - f.cz) < f.radius + RADIUS;
    if (b.shape === 'polyline-band') return (x, z) => {
      const p = f.centreline;
      for (let i = 0; i < p.length - 1; i++) if (distToSegment(x, z, p[i][0], p[i][1], p[i + 1][0], p[i + 1][1]) < f.depth / 2 + RADIUS) return true;
      return false;
    };
    return () => false;
  });
}

export function createPlayer(camera, domElement, campus) {
  const controls = new PointerLockControls(camera, domElement);
  const blockers = makeBlockers(campus);
  const blocked = (x, z) => blockers.some(hit => hit(x, z));
  const keys = { f: false, b: false, l: false, r: false, run: false };
  const dir = new THREE.Vector3();

  // start at the south end of the infield, facing north
  const start = campus.track.infield;
  camera.position.set(start.cx, EYE_HEIGHT, start.cz + start.sizeZ / 2 - 5);
  camera.rotation.set(0, 0, 0, 'YXZ');

  const map = { KeyW: 'f', ArrowUp: 'f', KeyS: 'b', ArrowDown: 'b', KeyA: 'l', ArrowLeft: 'l', KeyD: 'r', ArrowRight: 'r', ShiftLeft: 'run', ShiftRight: 'run' };
  addEventListener('keydown', e => { if (map[e.code]) { keys[map[e.code]] = true; e.preventDefault(); } });
  addEventListener('keyup', e => { if (map[e.code]) keys[map[e.code]] = false; });
  // Pointer lock exists only on mouse-driven browsers. Asking for it elsewhere makes the
  // controls log an error, so check first and report whether the request was made.
  const canLock = 'pointerLockElement' in document && matchMedia('(pointer: fine)').matches;
  function requestLock() { if (canLock && !controls.isLocked) controls.lock(); return canLock; }
  domElement.addEventListener('click', requestLock);

  function advance(input, dt) {
    const fwd = (input.f ? 1 : 0) - (input.b ? 1 : 0), side = (input.r ? 1 : 0) - (input.l ? 1 : 0);
    if (!fwd && !side) return;
    controls.getDirection(dir);
    let fx = dir.x, fz = dir.z; const n = Math.hypot(fx, fz) || 1; fx /= n; fz /= n;
    const rx = -fz, rz = fx;                               // right = forward x up
    let mx = fx * fwd + rx * side, mz = fz * fwd + rz * side;
    const m = Math.hypot(mx, mz) || 1, d = (input.run ? RUN : WALK) * dt;
    mx = mx / m * d; mz = mz / m * d;
    const p = camera.position;
    if (blocked(p.x, p.z)) { p.x += mx; p.z += mz; return; } // already inside a footprint: let the player walk out
    if (!blocked(p.x + mx, p.z + mz)) { p.x += mx; p.z += mz; }
    else if (!blocked(p.x + mx, p.z)) p.x += mx;           // slide along the wall
    else if (!blocked(p.x, p.z + mz)) p.z += mz;
  }

  return {
    controls, canLock, requestLock,
    update(dt) { advance(keys, dt); camera.position.y = EYE_HEIGHT; },
    setPose(x, z, yawDeg) { camera.position.set(x, EYE_HEIGHT, z); camera.rotation.set(0, -yawDeg * Math.PI / 180, 0, 'YXZ'); return this.pose(); },
    step(input, seconds) { const h = 1 / 60; for (let t = 0; t < seconds - 1e-9; t += h) advance(input, h); return this.pose(); },
    // yawDeg: 0 = facing north, positive = turned toward east (clockwise seen from above)
    pose() { const p = camera.position; return { x: +p.x.toFixed(2), z: +p.z.toFixed(2), yawDeg: +(-camera.rotation.y * 180 / Math.PI).toFixed(2) || 0, blocked: blocked(p.x, p.z) }; },
  };
}
