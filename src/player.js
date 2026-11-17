// First-person player: pointer-lock look, keyboard movement, capsule-versus-octree collision in 3D
// (so floors, stairs and upper storeys work), gravity and a small jump.
import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { Octree } from 'three/addons/math/Octree.js';
import { Capsule } from 'three/addons/math/Capsule.js';

export const PLAYER = { radius: 0.35, eye: 1.6, walk: 3.2, run: 8.0, gravity: 30, jump: 6.5, response: 10 };
const SUB = 1 / 120;                                   // fixed physics step, seconds

export function createPlayer(camera, domElement, colliders, start = { x: 0, z: 0, yawDeg: 0 }) {
  const controls = new PointerLockControls(camera, domElement);
  colliders.updateWorldMatrix(true, true);
  const octree = new Octree(); octree.fromGraphNode(colliders);
  const capsule = new Capsule(new THREE.Vector3(), new THREE.Vector3(), PLAYER.radius);
  const vel = new THREE.Vector3(), dir = new THREE.Vector3(), push = new THREE.Vector3();
  const keys = { f: false, b: false, l: false, r: false, run: false, jump: false };
  let onFloor = false, floorTimer = 0, carry = 0;       // floorTimer: seconds of grace after the last floor contact

  function place(x, y, z) {
    capsule.start.set(x, y + PLAYER.radius, z); capsule.end.set(x, y + PLAYER.eye - 0.05, z); vel.set(0, 0, 0);
    camera.position.set(x, y + PLAYER.eye, z);
  }
  camera.rotation.set(0, -start.yawDeg * Math.PI / 180, 0, 'YXZ');
  place(start.x, start.y ?? 0, start.z);

  const map = { KeyW: 'f', ArrowUp: 'f', KeyS: 'b', ArrowDown: 'b', KeyA: 'l', ArrowLeft: 'l', KeyD: 'r', ArrowRight: 'r', ShiftLeft: 'run', ShiftRight: 'run', Space: 'jump' };
  addEventListener('keydown', e => { if (map[e.code]) { keys[map[e.code]] = true; e.preventDefault(); } });
  addEventListener('keyup', e => { if (map[e.code]) keys[map[e.code]] = false; });
  addEventListener('blur', () => { for (const k in keys) keys[k] = false; });

  // Pointer lock exists only on mouse-driven browsers; asking for it elsewhere makes the controls log an error.
  const canLock = 'pointerLockElement' in document && matchMedia('(pointer: fine)').matches;
  function requestLock() { if (canLock && !controls.isLocked) controls.lock(); return canLock; }
  domElement.addEventListener('click', requestLock);

  function sub(input, dt) {
    const fwd = (input.f ? 1 : 0) - (input.b ? 1 : 0) + (input.moveY || 0), side = (input.r ? 1 : 0) - (input.l ? 1 : 0) + (input.moveX || 0);
    // Standing still on a floor: sleep, so the contact flag is stable and the player does not creep down slopes.
    if (onFloor && !fwd && !side && !input.jump && Math.hypot(vel.x, vel.z) < 0.05) { vel.set(0, 0, 0); floorTimer = 0.1; return; }
    controls.getDirection(dir);
    let fx = dir.x, fz = dir.z; const n = Math.hypot(fx, fz) || 1; fx /= n; fz /= n;
    let wx = fx * fwd - fz * side, wz = fz * fwd + fx * side;            // right = forward x up = (-fz, 0, fx)
    const m = Math.hypot(wx, wz), speed = input.run ? PLAYER.run : PLAYER.walk;
    if (m > 1) { wx /= m; wz /= m; }
    const k = Math.min(1, (onFloor ? PLAYER.response : PLAYER.response * 0.25) * dt);
    vel.x += (wx * speed - vel.x) * k; vel.z += (wz * speed - vel.z) * k;
    if (onFloor && input.jump && vel.y <= 0.01) { vel.y = PLAYER.jump; floorTimer = 0; }
    vel.y -= PLAYER.gravity * dt;                                        // always, so a resting player keeps touching the floor
    capsule.translate(push.copy(vel).multiplyScalar(dt));
    const hit = octree.capsuleIntersect(capsule);
    floorTimer -= dt;
    if (hit) {
      if (hit.normal.y > 0.35) { floorTimer = 0.1; if (vel.y < 0) vel.y = 0; }
      else vel.addScaledVector(hit.normal, -hit.normal.dot(vel));
      if (hit.depth >= 1e-10) capsule.translate(hit.normal.multiplyScalar(hit.depth));
    }
    onFloor = floorTimer > 0;
    if (capsule.start.y < -30) place(start.x, start.y ?? 0, start.z);       // fell out of the world
  }
  function sync() { camera.position.set(capsule.end.x, capsule.end.y + 0.05, capsule.end.z); }

  return {
    controls, canLock, requestLock, keys,
    update(dt, extra) {
      carry = Math.min(carry + dt, 0.25);
      const input = extra ? { ...keys, ...extra } : keys;
      while (carry >= SUB) { sub(input, SUB); carry -= SUB; }
      sync();
    },
    // deterministic hooks for automated checks
    setPose(x, z, yawDeg, y = 0) { camera.rotation.set(0, -yawDeg * Math.PI / 180, 0, 'YXZ'); place(x, y, z); onFloor = false; floorTimer = 0; return this.pose(); },
    step(input, seconds) { for (let t = 0; t < seconds - 1e-9; t += SUB) sub(input, SUB); sync(); return this.pose(); },
    // yawDeg: 0 = facing north, positive = turned toward east
    pose() {
      return { x: +capsule.start.x.toFixed(2), y: +(capsule.start.y - PLAYER.radius).toFixed(2), z: +capsule.start.z.toFixed(2),
        yawDeg: +(-camera.rotation.y * 180 / Math.PI).toFixed(2) || 0, onFloor };
    },
  };
}
