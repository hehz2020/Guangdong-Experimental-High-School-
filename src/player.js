// First-person player: pointer-lock look, keyboard movement, capsule-versus-octree collision in 3D
// (so floors, stairs and upper storeys work), gravity and a small jump.
import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { Octree } from 'three/addons/math/Octree.js';
import { Capsule } from 'three/addons/math/Capsule.js';

export const PLAYER = { radius: 0.35, eye: 1.6, walk: 3.2, run: 8.0, gravity: 30, jump: 6.5, response: 10, fly: 14, flyFast: 40 };
const SUB = 1 / 120;                                   // fixed physics step, seconds
const LIMIT = 680;                                     // metres from the origin the player may go (the ground plane ends at 700)

export function createPlayer(camera, domElement, colliders, start = { x: 0, z: 0, yawDeg: 0 }) {
  const controls = new PointerLockControls(camera, domElement);
  colliders.updateWorldMatrix(true, true);
  const octree = new Octree(); octree.fromGraphNode(colliders);
  const capsule = new Capsule(new THREE.Vector3(), new THREE.Vector3(), PLAYER.radius);
  const vel = new THREE.Vector3(), dir = new THREE.Vector3(), push = new THREE.Vector3();
  const keys = { f: false, b: false, l: false, r: false, run: false, jump: false, down: false };
  let fly = false;                                       // drone mode: no gravity, no collision, movement follows the view direction
  let onFloor = false, floorTimer = 0, carry = 0;       // floorTimer: seconds of grace after the last floor contact

  function place(x, y, z) {
    capsule.start.set(x, y + PLAYER.radius, z); capsule.end.set(x, y + PLAYER.eye - 0.05, z); vel.set(0, 0, 0);
    camera.position.set(x, y + PLAYER.eye, z);
  }
  camera.rotation.set(0, -start.yawDeg * Math.PI / 180, 0, 'YXZ');
  place(start.x, start.y ?? 0, start.z);

  const map = { KeyW: 'f', ArrowUp: 'f', KeyS: 'b', ArrowDown: 'b', KeyA: 'l', ArrowLeft: 'l', KeyD: 'r', ArrowRight: 'r', ShiftLeft: 'run', ShiftRight: 'run', Space: 'jump', KeyC: 'down' };
  const flyListeners = [];
  function setFly(on) { fly = !!on; vel.set(0, 0, 0); onFloor = false; floorTimer = 0; flyListeners.forEach(f => f(fly)); }
  addEventListener('keydown', e => { if (map[e.code]) { keys[map[e.code]] = true; e.preventDefault(); } else if (e.code === 'KeyF' && !e.repeat) setFly(!fly); });
  addEventListener('keyup', e => { if (map[e.code]) keys[map[e.code]] = false; });
  addEventListener('blur', () => { for (const k in keys) keys[k] = false; });

  // Pointer lock exists only on mouse-driven browsers; asking for it elsewhere makes the controls log an error.
  const canLock = 'pointerLockElement' in document && matchMedia('(pointer: fine)').matches;
  function requestLock() { if (canLock && !controls.isLocked) controls.lock(); return canLock; }
  domElement.addEventListener('click', requestLock);

  // The ground is a 1400 m square. Walking off its edge used to drop the player and silently return them to the start;
  // now the edge simply stops them.
  function keepInside() {
    const dx = Math.max(-LIMIT, Math.min(LIMIT, capsule.start.x)) - capsule.start.x, dz = Math.max(-LIMIT, Math.min(LIMIT, capsule.start.z)) - capsule.start.z;
    if (dx || dz) { capsule.translate(push.set(dx, 0, dz)); if (dx) vel.x = 0; if (dz) vel.z = 0; }
  }
  function sub(input, dt) {
    const fwd = (input.f ? 1 : 0) - (input.b ? 1 : 0) + (input.moveY || 0), side = (input.r ? 1 : 0) - (input.l ? 1 : 0) + (input.moveX || 0);
    // Standing still on a floor: sleep, so the contact flag is stable and the player does not creep down slopes.
    if (onFloor && !fwd && !side && !input.jump && Math.hypot(vel.x, vel.z) < 0.05) { vel.set(0, 0, 0); floorTimer = 0.1; return; }
    if (fly) {
      controls.getDirection(dir);
      const h = Math.hypot(dir.x, dir.z) || 1, rx = -dir.z / h, rz = dir.x / h, sp = input.run ? PLAYER.flyFast : PLAYER.fly;
      const wy = dir.y * fwd + (input.jump ? 1 : 0) - (input.down ? 1 : 0), kf = Math.min(1, 6 * dt);
      vel.x += ((dir.x * fwd + rx * side) * sp - vel.x) * kf; vel.y += (wy * sp - vel.y) * kf; vel.z += ((dir.z * fwd + rz * side) * sp - vel.z) * kf;
      capsule.translate(push.copy(vel).multiplyScalar(dt));
      if (capsule.start.y < PLAYER.radius + 0.5) capsule.translate(push.set(0, PLAYER.radius + 0.5 - capsule.start.y, 0));   // stay above the ground
      keepInside(); onFloor = false; floorTimer = 0; return;
    }
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
    keepInside();
    if (capsule.start.y < -30) place(start.x, start.y ?? 0, start.z);       // fell out of the world
  }
  function sync() { camera.position.set(capsule.end.x, capsule.end.y + 0.05, capsule.end.z); }

  return {
    controls, canLock, requestLock, keys, setFly, isFly: () => fly, onFly: f => flyListeners.push(f),
    /** Turn the view by angles in radians (for touch look). Positive dYaw turns right, positive dPitch looks up. */
    look(dYaw, dPitch) {
      const e = camera.rotation; e.order = 'YXZ';
      e.y -= dYaw; e.x = Math.max(-1.45, Math.min(1.45, e.x + dPitch)); e.z = 0;
    },
    update(dt, extra) {
      carry = Math.max(0, Math.min(carry + dt, 0.25));   // never negative: a negative first frame delta used to freeze the player
      // Keyboard and on-screen controls are combined, not overwritten: the HUD reports run/jump false when nothing is touched.
      const input = extra ? { ...keys, moveX: extra.moveX || 0, moveY: extra.moveY || 0, run: keys.run || !!extra.run, jump: keys.jump || !!extra.jump, down: keys.down || !!extra.down } : keys;
      while (carry >= SUB) { sub(input, SUB); carry -= SUB; }
      sync();
    },
    // deterministic hooks for automated checks
    setPose(x, z, yawDeg, y = 0) { camera.rotation.set(0, -yawDeg * Math.PI / 180, 0, 'YXZ'); place(x, y, z); onFloor = false; floorTimer = 0; return this.pose(); },
    step(input, seconds) { for (let t = 0; t < seconds - 1e-9; t += SUB) sub(input, SUB); sync(); return this.pose(); },
    // yawDeg: 0 = facing north, positive = turned toward east
    pose() {
      return { x: +capsule.start.x.toFixed(2), y: +(capsule.start.y - PLAYER.radius).toFixed(2), z: +capsule.start.z.toFixed(2),
        yawDeg: +(-camera.rotation.y * 180 / Math.PI).toFixed(2) || 0, onFloor, fly };
    },
  };
}
