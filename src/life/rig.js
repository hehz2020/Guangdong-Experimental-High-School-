// Skeleton of the people (src/world/extras/people.js): 18 bones, forward kinematics into skin matrices and a two-bone
// leg solver. Pure arithmetic on typed arrays, no three.js objects, so that a few hundred people cost little per frame.
//
// Person space: x to the person's LEFT, y up, z FORWARD, metres, feet on y = 0. Rest pose: standing, arms hanging a
// little away from the body, palms toward the thighs. Every bone's rest frame is the person frame (no rest rotation).
// A joint turns by three angles: trunk, neck and head as R = Ry(yaw) * Rx(pitch) * Rz(roll) (three.js Euler order 'YXZ'),
// arms and legs as R = Rx(pitch) * Rz(roll) * Ry(yaw), so that their yaw is a twist about their own length:
//   pitch > 0 swings a hanging limb BACKWARD and tilts an upright one (spine, head) FORWARD; knees and toes-down are > 0,
//     a thigh or arm swung forward is < 0, an elbow bent is < 0;
//   roll > 0 swings a hanging limb toward the person's left (left arm out, right arm in) and tilts the trunk to the right;
//   yaw > 0 turns toward the person's left.
// The two body shapes (sex 0: a youth of about 1.72 m, sex 1: a girl or woman of about 1.62 m) have the same bones at
// different places; a person's joints are a blend of the two, and the person's height comes from the instance scale.
// Nothing here is measured: proportions are textbook averages chosen by eye.

export const B = { pelvis: 0, spine: 1, chest: 2, neck: 3, head: 4, uaL: 5, faL: 6, handL: 7, uaR: 8, faR: 9, handR: 10, thL: 11, shL: 12, footL: 13, thR: 14, shR: 15, footR: 16, hair: 17 };
export const NB = 18;
export const PARENT = [-1, 0, 1, 2, 3, 2, 5, 6, 2, 8, 9, 0, 11, 12, 0, 14, 15, 4];
const mirror = j => { const o = j.slice(); for (const [l, r] of [[5, 8], [6, 9], [7, 10], [11, 14], [12, 15], [13, 16]]) o[r] = [-j[l][0], j[l][1], j[l][2]]; return o; };
// joint positions, male reference (height about 1.72 m)
export const JM = mirror([
  [0, 0.975, 0], [0, 1.07, -0.005], [0, 1.24, -0.012], [0, 1.452, -0.026], [0, 1.545, -0.012],
  [0.18, 1.378, -0.032], [0.204, 1.08, -0.048], [0.216, 0.835, -0.024], null, null, null,
  [0.088, 0.905, 0.0], [0.093, 0.492, 0.008], [0.098, 0.078, -0.028], null, null, null, [0, 1.66, -0.105]]);
// female reference (about 1.62 m)
export const JF = mirror([
  [0, 0.925, 0], [0, 1.01, -0.006], [0, 1.165, -0.014], [0, 1.37, -0.026], [0, 1.452, -0.012],
  [0.157, 1.298, -0.03], [0.176, 1.02, -0.046], [0.186, 0.792, -0.022], null, null, null,
  [0.087, 0.857, 0.0], [0.089, 0.47, 0.008], [0.093, 0.073, -0.026], null, null, null, [0, 1.555, -0.1]]);

/** Joint positions of a person between the two references (sex 0..1): Float32Array(NB * 3). */
export function skeleton(sex) {
  const j = new Float32Array(NB * 3);
  for (let b = 0; b < NB; b++) for (let k = 0; k < 3; k++) j[b * 3 + k] = JM[b][k] + (JF[b][k] - JM[b][k]) * sex;
  const len = (a, c) => Math.hypot(j[c * 3] - j[a * 3], j[c * 3 + 1] - j[a * 3 + 1], j[c * 3 + 2] - j[a * 3 + 2]);
  return { j, sex, thigh: len(11, 12), shin: len(12, 13), hip: j[11 * 3], ankleY: j[13 * 3 + 1], pelvisY: j[1], upper: len(5, 6), fore: len(6, 7) };
}

/** A pose: angles (pitch, yaw, roll) per bone, then the pelvis offset from its rest place (x, y, z). */
export const POSE = NB * 3 + 3;
export const newPose = () => new Float32Array(POSE);
export const OFF = NB * 3;

// scratch: world rotation (3x3, row-major) and position of every bone
const WR = new Float32Array(NB * 9), WT = new Float32Array(NB * 3), LR = new Float32Array(9);
// limbs twist about their own length first: R = Rx(x) Rz(z) Ry(y); trunk, neck and head: R = Ry(y) Rx(x) Rz(z)
const LIMB = PARENT.map((p, b) => b >= 5 && b <= 16);
function rotLimb(out, o, x, y, z) {
  const cx = Math.cos(x), sx = Math.sin(x), cy = Math.cos(y), sy = Math.sin(y), cz = Math.cos(z), sz = Math.sin(z);
  // Rz * Ry
  const a00 = cz * cy, a01 = -sz, a02 = cz * sy, a10 = sz * cy, a11 = cz, a12 = sz * sy, a20 = -sy, a21 = 0, a22 = cy;
  out[o] = a00; out[o + 1] = a01; out[o + 2] = a02;
  out[o + 3] = cx * a10 - sx * a20; out[o + 4] = cx * a11 - sx * a21; out[o + 5] = cx * a12 - sx * a22;
  out[o + 6] = sx * a10 + cx * a20; out[o + 7] = sx * a11 + cx * a21; out[o + 8] = sx * a12 + cx * a22;
}
function rot(out, o, x, y, z) {                              // R = Ry(y) Rx(x) Rz(z), row-major
  const a = Math.cos(x), b = Math.sin(x), c = Math.cos(y), d = Math.sin(y), e = Math.cos(z), f = Math.sin(z);
  const ce = c * e, cf = c * f, de = d * e, df = d * f;
  out[o] = ce + df * b; out[o + 1] = de * b - cf; out[o + 2] = a * d;
  out[o + 3] = a * f; out[o + 4] = a * e; out[o + 5] = -b;
  out[o + 6] = cf * b - de; out[o + 7] = df + ce * b; out[o + 8] = a * c;
}

/**
 * Forward kinematics. Writes, for every bone, the skin matrix (world-of-bone times inverse rest) as three rows of
 * (r0, r1, r2, t): 12 floats per bone, NB * 12 in all, at out[o...]. Also leaves the bone frames in WR / WT (see bonePoint).
 */
export function fk(sk, pose, out, o) {
  const J = sk.j;
  for (let b = 0; b < NB; b++) {
    const p = PARENT[b], r = b * 9, t = b * 3;
    if (p < 0) {
      rot(WR, r, pose[0], pose[1], pose[2]);
      WT[0] = J[0] + pose[OFF]; WT[1] = J[1] + pose[OFF + 1]; WT[2] = J[2] + pose[OFF + 2];
    } else {
      (LIMB[b] ? rotLimb : rot)(LR, 0, pose[b * 3], pose[b * 3 + 1], pose[b * 3 + 2]);
      const pr = p * 9, pt = p * 3, dx = J[t] - J[pt], dy = J[t + 1] - J[pt + 1], dz = J[t + 2] - J[pt + 2];
      for (let i = 0; i < 3; i++) {
        const a0 = WR[pr + i * 3], a1 = WR[pr + i * 3 + 1], a2 = WR[pr + i * 3 + 2];
        WR[r + i * 3] = a0 * LR[0] + a1 * LR[3] + a2 * LR[6];
        WR[r + i * 3 + 1] = a0 * LR[1] + a1 * LR[4] + a2 * LR[7];
        WR[r + i * 3 + 2] = a0 * LR[2] + a1 * LR[5] + a2 * LR[8];
        WT[t + i] = WT[pt + i] + a0 * dx + a1 * dy + a2 * dz;
      }
    }
    const q = o + b * 12, jx = J[t], jy = J[t + 1], jz = J[t + 2];
    for (let i = 0; i < 3; i++) {
      const m0 = WR[r + i * 3], m1 = WR[r + i * 3 + 1], m2 = WR[r + i * 3 + 2];
      out[q + i * 4] = m0; out[q + i * 4 + 1] = m1; out[q + i * 4 + 2] = m2;
      out[q + i * 4 + 3] = WT[t + i] - (m0 * jx + m1 * jy + m2 * jz);
    }
  }
}
/** Where a point given in the rest pose ends up after the last fk() call (person space). */
export function bonePoint(b, x, y, z, sk, out) {
  const r = b * 9, t = b * 3, J = sk.j, dx = x - J[t], dy = y - J[t + 1], dz = z - J[t + 2];
  for (let i = 0; i < 3; i++) out[i] = WT[t + i] + WR[r + i * 3] * dx + WR[r + i * 3 + 1] * dy + WR[r + i * 3 + 2] * dz;
  return out;
}

/**
 * Two-bone leg solver. Puts the ankle of leg `side` (0 left, 1 right) at (x, y, z) in person space with the sole at
 * pitch footPitch (radians, 0 flat, > 0 toes down) and turns the knee forward. Uses the pelvis angles and offset already
 * in the pose. lift: extra hip roll outward (radians), for wide stances.
 */
export function legIK(sk, pose, side, x, y, z, footPitch, lift = 0) {
  const J = sk.j, th = side ? 14 : 11, sh = th + 1, ft = th + 2;
  rot(LR, 0, pose[0], pose[1], pose[2]);
  // hip joint in person space
  const hx = J[th * 3] - J[0], hy = J[th * 3 + 1] - J[1], hz = J[th * 3 + 2] - J[2];
  const px = J[0] + pose[OFF] + LR[0] * hx + LR[1] * hy + LR[2] * hz;
  const py = J[1] + pose[OFF + 1] + LR[3] * hx + LR[4] * hy + LR[5] * hz;
  const pz = J[2] + pose[OFF + 2] + LR[6] * hx + LR[7] * hy + LR[8] * hz;
  // target relative to the hip, in pelvis space (transpose of the pelvis rotation)
  const wx = x - px, wy = y - py, wz = z - pz;
  const dx = LR[0] * wx + LR[3] * wy + LR[6] * wz, dy = LR[1] * wx + LR[4] * wy + LR[7] * wz, dz = LR[2] * wx + LR[5] * wy + LR[8] * wz;
  const L1 = sk.thigh, L2 = sk.shin;
  let dist = Math.hypot(dx, dy, dz); dist = Math.min(dist, (L1 + L2) * 0.9995); dist = Math.max(dist, Math.abs(L1 - L2) + 0.01);
  const roll = Math.atan2(dx, -dy) * 0.9 + (side ? -lift : lift);                    // sideways reach (the knee stays in the leg's plane)
  const alpha = Math.atan2(dz, Math.hypot(dy, dx));                                   // forward angle of the hip-to-ankle line
  const cosK = (L1 * L1 + L2 * L2 - dist * dist) / (2 * L1 * L2), knee = Math.PI - Math.acos(Math.max(-1, Math.min(1, cosK)));
  const beta = Math.acos(Math.max(-1, Math.min(1, (L1 * L1 + dist * dist - L2 * L2) / (2 * L1 * dist))));
  // rest directions of thigh and shin (a little off vertical)
  const rT = Math.atan2(J[sh * 3 + 2] - J[th * 3 + 2], J[th * 3 + 1] - J[sh * 3 + 1]), rS = Math.atan2(J[ft * 3 + 2] - J[sh * 3 + 2], J[sh * 3 + 1] - J[ft * 3 + 1]);
  pose[th * 3] = -(alpha + beta) + rT; pose[th * 3 + 1] = 0; pose[th * 3 + 2] = roll;
  pose[sh * 3] = knee + rS - rT; pose[sh * 3 + 1] = 0; pose[sh * 3 + 2] = 0;
  pose[ft * 3] = footPitch - (pose[0] + pose[th * 3] + pose[sh * 3]); pose[ft * 3 + 2] = -roll;
}

/** Copies a pose, or blends two: out = a + (b - a) * k (angles taken the short way round). */
export function blendPose(out, a, b, k) {
  for (let i = 0; i < POSE; i++) { let d = b[i] - a[i]; if (i < OFF) d = d - Math.round(d / (2 * Math.PI)) * 2 * Math.PI; out[i] = a[i] + d * k; }
  return out;
}
