// Poses of the people, computed from a phase and a few parameters (no motion data): walking and running with planted
// feet (the legs are solved so that a foot on the ground does not slide), standing with the weight on one leg, sitting,
// writing at a desk, eating, dribbling and shooting a basketball, sweeping, holding things. Conventions in rig.js.
// Every movement is made up here (no motion capture), as are the people who make them.
// Every curve here is chosen by eye.
import { B, OFF, legIK } from './rig.js';

const TAU = Math.PI * 2;
const ss = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const fr = x => x - Math.floor(x);
const set = (p, b, x, y = 0, z = 0) => { p[b * 3] = x; p[b * 3 + 1] = y; p[b * 3 + 2] = z; };
const addA = (p, b, x, y = 0, z = 0) => { p[b * 3] += x; p[b * 3 + 1] += y; p[b * 3 + 2] += z; };

/** Clears a pose to the rest pose. */
export function rest(p) { p.fill(0); return p; }

/** Arms by kind. k: 'swing' (with phase c = cos, amplitude a), 'hang', 'cross', 'back', 'phone', 'umbrella', 'pockets', 'books', 'hips' */
export function arms(p, kind, a = 0, c = 0, t = 0) {
  const sw = a * c;
  switch (kind) {
    case 'cross': set(p, B.uaL, -0.28, -1.35, 0.2); set(p, B.faL, -1.85, 0, 0); set(p, B.uaR, -0.32, 1.35, -0.2); set(p, B.faR, -1.75, 0, 0); set(p, B.handL, 0.1, 0, 0); set(p, B.handR, 0.1, 0, 0); break;
    case 'back': set(p, B.uaL, 0.32, -1.35, 0.1); set(p, B.faL, -1.35, 0, 0); set(p, B.uaR, 0.32, 1.35, -0.1); set(p, B.faR, -1.35, 0, 0); set(p, B.handL, 0, 0, 0); set(p, B.handR, 0, 0, 0); break;
    case 'phone': set(p, B.uaL, -0.18 - sw * 0.2, 0, 0.12); set(p, B.faL, -0.35, 0, 0); set(p, B.uaR, -0.16, 0.1, -0.06); set(p, B.faR, -1.5, 0.9, 0); set(p, B.handR, 0.2, 0, -0.25); break;
    case 'phone2': set(p, B.uaL, -0.2, -0.1, 0.06); set(p, B.faL, -1.45, -0.9, 0); set(p, B.uaR, -0.16, 0.1, -0.06); set(p, B.faR, -1.5, 0.9, 0); set(p, B.handR, 0.2, 0, -0.25); set(p, B.handL, 0.2, 0, 0.25); break;
    case 'umbrella': set(p, B.uaL, sw * 0.8, 0, 0.1); set(p, B.faL, -0.25 - 0.15 * Math.max(0, -c), 0, 0); set(p, B.uaR, -0.3, 0.12, -0.1); set(p, B.faR, -1.3, 0.2, 0); set(p, B.handR, 0, 0, 0.1); break;
    case 'books': set(p, B.uaL, sw * 0.8, 0, 0.1); set(p, B.faL, -0.25 - 0.15 * Math.max(0, -c), 0, 0); set(p, B.uaR, -0.06, -0.06, -0.04); set(p, B.faR, -1.2, -0.25, 0); set(p, B.handR, 0.3, 0, -0.2); break;
    case 'pockets': set(p, B.uaL, 0.12, 0, 0.16); set(p, B.faL, -0.55, 0, 0); set(p, B.uaR, 0.12, 0, -0.16); set(p, B.faR, -0.55, 0, 0); set(p, B.handL, 0.4, 0, 0); set(p, B.handR, 0.4, 0, 0); break;
    case 'hips': set(p, B.uaL, 0.1, 0, 0.55); set(p, B.faL, -1.35, 0.4, 0); set(p, B.uaR, 0.02, 0, -0.12); set(p, B.faR, -0.25, 0, 0); set(p, B.handL, 0, 0, 0.3); break;
    case 'gesture': { const g = Math.sin(t * 2.3) * 0.5 + Math.sin(t * 3.7) * 0.3; set(p, B.uaL, 0.04, 0, 0.1); set(p, B.faL, -0.3, 0, 0); set(p, B.uaR, -0.32 - 0.15 * g, 0.15, -0.2); set(p, B.faR, -1.2 - 0.3 * g, 0.5, 0); set(p, B.handR, 0.1, 0, 0.3 * g); break; }
    default: {                                                                              // swinging (walking) or hanging
      set(p, B.uaL, sw - 0.05, 0, 0.035); set(p, B.uaR, -sw - 0.05, 0, -0.035);
      set(p, B.faL, -0.26 - 0.32 * Math.max(0, -c) * a * 3, -0.55, 0); set(p, B.faR, -0.26 - 0.32 * Math.max(0, c) * a * 3, 0.55, 0);
      set(p, B.handL, 0.12, 0, -0.05); set(p, B.handR, 0.12, 0, 0.05);
    }
  }
}

/**
 * Walking. ph: cycle phase 0..1 (left heel strike at 0), v: speed in person units (metres / height scale) per second,
 * o: { arms: kind, look: [yaw, pitch], lean, bounce }.
 */
export function walk(p, sk, ph, v, o = {}) {
  rest(p);
  const T = cycleTime(v), stride = v * T, beta = 0.6, k = Math.min(1.4, v / 1.3);
  // pelvis: bob (low in double support), sway over the stance foot, turn with the swinging leg, list toward the swing side
  p[OFF] = 0.022 * Math.sin(TAU * ph) * (0.7 + 0.3 * k);
  p[OFF + 1] = -0.012 - 0.014 * k * Math.cos(2 * TAU * (ph - 0.3)) - 0.006 * k;
  p[OFF + 2] = 0;
  set(p, B.pelvis, 0.04 + 0.03 * k + (o.lean || 0), -0.09 * k * Math.cos(TAU * ph), 0.06 * k * Math.sin(TAU * (ph + 0.05)));
  // spine and chest turn against the pelvis; the head keeps looking where it wants
  set(p, B.spine, -0.01, 0.07 * k * Math.cos(TAU * ph), -0.035 * k * Math.sin(TAU * (ph + 0.05)));
  set(p, B.chest, -0.02 + 0.006 * Math.cos(2 * TAU * ph), 0.09 * k * Math.cos(TAU * ph), -0.02 * k * Math.sin(TAU * (ph + 0.05)));
  const look = o.look || [0, 0], twist = (-0.09 + 0.07 + 0.09) * k * Math.cos(TAU * ph);
  set(p, B.neck, 0.02, (look[0] - twist) * 0.4, 0.015 * k * Math.sin(TAU * (ph + 0.05)));
  set(p, B.head, 0.04 + look[1] - 0.01 * Math.cos(2 * TAU * (ph - 0.35)), (look[0] - twist) * 0.6, 0);
  // legs
  for (const side of [0, 1]) {
    const u = fr(ph - side * 0.5), x = (side ? -1 : 1) * (sk.hip + 0.012), base = sk.ankleY;
    let z, y, pitch;
    if (u < beta) {                                                                       // stance: the foot stays where it landed
      const s = u / beta; z = stride * (0.5 - s) * (beta) + 0.02;
      pitch = s < 0.12 ? -0.25 * (1 - s / 0.12) : s > 0.62 ? 0.62 * ss(0.62, 1, s) : 0;
    } else {                                                                              // swing: lift and carry forward
      const s = (u - beta) / (1 - beta), e = s * s * (3 - 2 * s); z = stride * beta * (-0.5 + e) + 0.02;
      y = 0.06 * k * Math.sin(Math.PI * Math.min(1, s * 1.15)) + 0.012;
      pitch = 0.55 * (1 - ss(0, 0.45, s)) - 0.22 * ss(0.55, 1, s);
    }
    // the ankle rides up when the foot rolls onto its toes or lands on its heel
    y = (y || 0) + base + (pitch > 0 ? 0.13 * Math.sin(pitch) : 0.07 * Math.sin(-pitch));
    if (pitch > 0) z -= 0.13 * (1 - Math.cos(pitch)); else z += 0.07 * (1 - Math.cos(pitch));
    legIK(sk, p, side, x, y, z, pitch);
  }
  arms(p, o.arms || 'swing', 0.26 * k, Math.cos(TAU * (ph - 0.04)), ph * T);
  return T;
}
/** Seconds per walking cycle (two steps) at a speed. */
export const cycleTime = v => 2 / (1.75 * Math.pow(Math.max(0.3, v) / 1.3, 0.42));
/** Seconds per running cycle at a speed. */
export const runCycleTime = v => 2 / (2.6 + 0.12 * Math.max(0, v - 3));

/** Running (jogging to sprinting). v in person units per second. */
export function run(p, sk, ph, v, o = {}) {
  rest(p);
  const T = runCycleTime(v), stride = v * T, beta = 0.36, k = Math.min(1.6, v / 4);
  p[OFF] = 0.012 * Math.sin(TAU * ph);
  p[OFF + 1] = -0.07 - 0.035 * Math.cos(2 * TAU * (ph - 0.18 - 0.5)) * 0.5 - 0.02 * k;
  set(p, B.pelvis, 0.12 + 0.06 * k, -0.11 * Math.cos(TAU * ph), 0.05 * Math.sin(TAU * (ph + 0.05)));
  set(p, B.spine, 0.02, 0.1 * Math.cos(TAU * ph), -0.02 * Math.sin(TAU * ph));
  set(p, B.chest, 0.02, 0.13 * Math.cos(TAU * ph), 0);
  const look = o.look || [0, 0];
  set(p, B.neck, -0.05, look[0] * 0.4 - 0.1 * Math.cos(TAU * ph), 0); set(p, B.head, -0.08 + look[1], look[0] * 0.6 - 0.1 * Math.cos(TAU * ph), 0);
  for (const side of [0, 1]) {
    const u = fr(ph - side * 0.5), x = (side ? -1 : 1) * (sk.hip - 0.005);
    let z, y = sk.ankleY, pitch;
    if (u < beta) { const s = u / beta; z = stride * beta * (0.5 - s) + 0.06; pitch = s < 0.15 ? -0.1 : 0.7 * ss(0.5, 1, s); y += s > 0.5 ? 0.1 * Math.sin(pitch) : 0; }
    else { const s = (u - beta) / (1 - beta), e = s * s * (3 - 2 * s); z = stride * beta * (-0.5 + e) + 0.06 - 0.25 * k * Math.sin(Math.PI * Math.min(1, s * 1.3)) * (1 - s);
      y += (0.1 + 0.28 * k) * Math.sin(Math.PI * Math.min(1, s * 1.25)) * (1 - 0.35 * s); pitch = 0.7 - 0.85 * ss(0.2, 0.95, s); }
    legIK(sk, p, side, x, y, z, pitch);
  }
  const c = Math.cos(TAU * (ph - 0.02)), a = 0.55 + 0.2 * k;
  set(p, B.uaL, a * c - 0.1, 0, 0.16); set(p, B.uaR, -a * c - 0.1, 0, -0.16);
  set(p, B.faL, -1.45 - 0.25 * c, 0.2, 0); set(p, B.faR, -1.45 + 0.25 * c, -0.2, 0);
  set(p, B.handL, 0.1, 0, -0.1); set(p, B.handR, 0.1, 0, 0.1);
  return T;
}

/**
 * Standing. t: seconds (drives the slow shifts), w: weight side -1..1 (1 = on the left leg), o: { arms, look, stance }.
 */
export function stand(p, sk, t, w, o = {}) {
  rest(p);
  const breath = Math.sin(t * 1.6) * 0.012, wide = o.stance || 0;
  p[OFF] = 0.03 * w; p[OFF + 1] = -0.012 - 0.012 * Math.abs(w) - wide * 0.05; p[OFF + 2] = 0;
  set(p, B.pelvis, 0.03, 0.04 * w, 0.055 * w);
  set(p, B.spine, -0.02 + breath * 0.3, -0.02 * w, -0.03 * w);
  set(p, B.chest, -0.03 + breath, -0.02 * w, -0.025 * w);
  const look = o.look || [0, 0];
  set(p, B.neck, 0.02 + look[1] * 0.35, look[0] * 0.4, 0.02 * w); set(p, B.head, 0.02 + look[1] * 0.65, look[0] * 0.6, 0.01 * w + (o.tilt || 0));
  // feet: the loaded one under the hip, the other a little forward and out with a soft knee
  const fl = w >= 0, sx = sk.hip + 0.025 + wide * 0.12;
  legIK(sk, p, 0, sx + (fl ? 0 : 0.03), sk.ankleY + (fl ? 0 : 0.004), fl ? 0.0 : 0.07, 0, 0);
  legIK(sk, p, 1, -sx - (fl ? 0.03 : 0), sk.ankleY + (fl ? 0.004 : 0), fl ? 0.07 : 0.0, 0, 0);
  addA(p, fl ? B.footR : B.footL, 0, fl ? -0.25 : 0.25, 0);
  arms(p, o.arms || 'hang', 0, 0, t);
  if ((o.arms || 'hang') === 'hang') { addA(p, B.uaL, 0.03 + breath, 0, 0.02); addA(p, B.uaR, 0.03 + breath, 0, -0.02); }
}

/**
 * Sitting on a seat of height h (the person's origin is the front edge of the seat, facing away from the back rest).
 * o: { arms: 'lap' | 'desk' | 'eat' | 'phone' | 'talk', look, lean, t }
 */
export function sit(p, sk, h, o = {}) {
  rest(p);
  const t = o.t || 0, lean = o.lean || 0, hipY = h + 0.085;
  p[OFF + 1] = hipY - (sk.j[B.thL * 3 + 1]); p[OFF + 2] = -0.2;
  set(p, B.pelvis, -0.18 + lean * 0.5, 0, 0);
  set(p, B.spine, 0.1 + lean * 0.4 + Math.sin(t * 1.5) * 0.008, 0, 0);
  set(p, B.chest, 0.06 + lean * 0.3 + Math.sin(t * 1.5) * 0.012, 0, 0);
  const look = o.look || [0, 0];
  set(p, B.neck, 0.05 + look[1] * 0.4, look[0] * 0.4, 0); set(p, B.head, 0.03 + look[1] * 0.6, look[0] * 0.6, o.tilt || 0);
  const fz = o.feet ?? 0.27, spread = o.spread ?? 0.035;
  legIK(sk, p, 0, sk.hip + spread, sk.ankleY, fz, -0.05);
  legIK(sk, p, 1, -sk.hip - spread, sk.ankleY, fz + (o.cross ? -0.04 : 0.03), -0.05);
  switch (o.arms) {
    case 'desk': {                                                                  // forearms on the desk, writing with the right hand
      const wr = Math.sin(t * 7) * 0.04 + Math.sin(t * 2.1) * 0.05;
      set(p, B.uaL, -0.62, 0.12, 0.2); set(p, B.faL, -1.25, -0.35, 0); set(p, B.handL, 0.2, 0, 0.3);
      set(p, B.uaR, -0.66 + wr, -0.12, -0.18); set(p, B.faR, -1.2 - wr, 0.4, 0); set(p, B.handR, 0.35, 0, -0.2);
      addA(p, B.chest, 0.12, 0, 0); addA(p, B.head, 0.3, 0, 0); break;
    }
    case 'read': set(p, B.uaL, -0.5, 0.15, 0.16); set(p, B.faL, -1.5, -0.6, 0); set(p, B.uaR, -0.5, -0.15, -0.16); set(p, B.faR, -1.5, 0.6, 0); addA(p, B.head, 0.35, 0, 0); addA(p, B.chest, 0.06, 0, 0); break;
    case 'eat': {                                                                   // bowl in the left hand, chopsticks in the right, now and then to the mouth
      const bite = Math.max(0, Math.sin(t * 1.3)) ** 3;
      set(p, B.uaL, -0.55, 0.15, 0.16); set(p, B.faL, -1.35, -0.7, 0);
      set(p, B.uaR, -0.5 - 0.35 * bite, -0.12, -0.2 - 0.15 * bite); set(p, B.faR, -1.3 - 0.9 * bite, 0.5, 0); set(p, B.handR, 0.2 - 0.3 * bite, 0, 0);
      addA(p, B.head, 0.28 - 0.18 * bite, 0, 0); addA(p, B.chest, 0.1, 0, 0); break;
    }
    case 'phone': arms(p, 'phone2'); addA(p, B.head, 0.45, 0, 0); break;
    case 'talk': arms(p, 'gesture', 0, 0, t); set(p, B.uaL, -0.3, 0, 0.15); set(p, B.faL, -0.9, 0, 0); break;
    default: set(p, B.uaL, -0.3, 0, 0.14); set(p, B.faL, -0.85, -0.2, 0); set(p, B.uaR, -0.3, 0, -0.14); set(p, B.faR, -0.85, 0.2, 0); set(p, B.handL, 0.3, 0, 0); set(p, B.handR, 0.3, 0, 0);
  }
}

/** Basketball: stance and arms. mode 'dribble' (t drives the bounce), 'shoot' (s 0..1 through the shot), 'defend', 'wait'. Returns the hand height wanted (for the ball). */
export function hoops(p, sk, t, mode, s = 0, o = {}) {
  rest(p);
  const look = o.look || [0, 0];
  if (mode === 'shoot') {
    // crouch (0-0.3), rise and jump (0.3-0.6), release at the top (0.6), land (0.8-1)
    const crouch = ss(0, 0.3, s) * (1 - ss(0.3, 0.5, s)) + 0.3 * ss(0.8, 0.9, s) * (1 - ss(0.9, 1, s));
    p[OFF + 1] = -0.16 * crouch; p[OFF + 2] = 0;
    set(p, B.pelvis, 0.2 * crouch, 0, 0); set(p, B.chest, 0.1 * crouch - 0.08 * ss(0.4, 0.6, s), 0, 0);
    set(p, B.head, -0.25 * ss(0.2, 0.5, s) * (1 - ss(0.8, 1, s)) + look[1], look[0] * 0.6, 0); set(p, B.neck, 0, look[0] * 0.4, 0);
    const up = ss(0.15, 0.55, s) * (1 - ss(0.85, 1, s)), ext = ss(0.5, 0.65, s) * (1 - ss(0.85, 1, s));
    set(p, B.uaR, -0.9 - 1.6 * up, -0.1, -0.15); set(p, B.faR, -1.9 + 1.6 * ext, 0, 0); set(p, B.handR, -0.6 + 1.4 * ext, 0, 0);
    set(p, B.uaL, -0.9 - 1.4 * up, 0.2, 0.3); set(p, B.faL, -1.7 + 0.6 * ext, 0, 0);
    const w = 0.13;
    legIK(sk, p, 0, sk.hip + 0.02, sk.ankleY, 0.03, 0); legIK(sk, p, 1, -sk.hip - 0.02, sk.ankleY, -0.03, 0);
    void w;
    return 0;
  }
  const low = mode === 'defend' ? 0.13 : 0.09;
  p[OFF + 1] = -low + Math.sin(t * 3) * 0.006; p[OFF] = Math.sin(t * 1.1) * 0.02;
  set(p, B.pelvis, 0.28, 0, 0); set(p, B.spine, 0.05, 0, 0); set(p, B.chest, 0.05, 0, 0);
  set(p, B.neck, -0.15 + look[1] * 0.4, look[0] * 0.4, 0); set(p, B.head, -0.2 + look[1] * 0.6, look[0] * 0.6, 0);
  legIK(sk, p, 0, sk.hip + 0.09, sk.ankleY, 0.05, 0, 0.1); legIK(sk, p, 1, -sk.hip - 0.09, sk.ankleY, -0.06, 0, 0.1);
  if (mode === 'dribble') {
    const b = 0.5 + 0.5 * Math.cos(t * TAU * 1.8);                                    // 1 = hand at the top
    set(p, B.uaR, -0.35 + 0.1 * b, 0, -0.22); set(p, B.faR, -0.6 - 0.45 * b, 0, 0); set(p, B.handR, -0.2 + 0.7 * (1 - b), 0, 0);
    set(p, B.uaL, -0.45, 0.2, 0.45); set(p, B.faL, -0.9, 0, 0);
  } else if (mode === 'defend') {
    set(p, B.uaL, -0.2, 0, 0.8 + 0.1 * Math.sin(t * 2)); set(p, B.faL, -0.5, 0, 0); set(p, B.uaR, -0.2, 0, -0.8 - 0.1 * Math.sin(t * 2.3)); set(p, B.faR, -0.5, 0, 0);
  } else {
    set(p, B.uaL, -0.25, 0, 0.2); set(p, B.faL, -0.7, 0, 0); set(p, B.uaR, -0.25, 0, -0.2); set(p, B.faR, -0.7, 0, 0);
  }
  return 0;
}

/** Sweeping with a long broom while standing or shuffling: t seconds. */
export function sweep(p, sk, t, o = {}) {
  stand(p, sk, t, 0.3 * Math.sin(t * 0.4), { look: o.look || [0, 0.3], stance: 0.4 });
  const sw = Math.sin(t * 3.2);
  addA(p, B.pelvis, 0.12, 0, 0); addA(p, B.chest, 0.15, -0.25 * sw, 0); addA(p, B.spine, 0.05, -0.1 * sw, 0);
  set(p, B.uaR, -0.55 + 0.1 * sw, 0.2, -0.05); set(p, B.faR, -0.55, 0.3, 0); set(p, B.handR, 0.4, 0, 0.3);
  set(p, B.uaL, -0.85 + 0.1 * sw, -0.2, 0.25); set(p, B.faL, -0.7, -0.4, 0); set(p, B.handL, 0, 0, -0.2);
}

/** Crouching or bending at a hedge or bed (gardener): t seconds. */
export function tend(p, sk, t, o = {}) {
  rest(p);
  p[OFF + 1] = -0.42; p[OFF + 2] = -0.08;
  set(p, B.pelvis, 0.55, 0, 0); set(p, B.spine, 0.15, 0, 0); set(p, B.chest, 0.1, 0, 0); set(p, B.head, -0.25, 0.2 * Math.sin(t * 0.3), 0);
  legIK(sk, p, 0, sk.hip + 0.07, sk.ankleY, 0.12, -0.1, 0.15); legIK(sk, p, 1, -sk.hip - 0.07, sk.ankleY + 0.02, -0.05, 0.3, 0.15);
  const w = Math.sin(t * 2.2);
  set(p, B.uaR, -0.9 + 0.15 * w, 0, -0.1); set(p, B.faR, -0.4, 0, 0); set(p, B.uaL, -0.7, 0, 0.1); set(p, B.faL, -0.5, 0, 0);
  void o;
}

/** Morning exercises: a slow, symmetrical routine (t seconds, everyone in step). */
export function drill(p, sk, t) {
  stand(p, sk, t, 0, { stance: 0.5 });
  const beat = (t / 1.0) % 8, a = Math.sin(Math.PI * fr(t / 2)), phase = Math.floor(t / 8) % 3;
  if (phase === 0) { set(p, B.uaL, -0.2, 0, 0.4 + 2.2 * a); set(p, B.uaR, -0.2, 0, -0.4 - 2.2 * a); set(p, B.faL, -0.1, 0, 0); set(p, B.faR, -0.1, 0, 0); }
  else if (phase === 1) { set(p, B.uaL, -0.3 - 2.4 * a, 0, 0.15); set(p, B.uaR, -0.3 - 2.4 * a, 0, -0.15); set(p, B.faL, -0.1, 0, 0); set(p, B.faR, -0.1, 0, 0); addA(p, B.head, -0.3 * a, 0, 0); }
  else { const s = Math.sin(TAU * fr(t / 4)); addA(p, B.chest, 0, 0.5 * s, 0); addA(p, B.spine, 0, 0.3 * s, 0); set(p, B.uaL, -0.1, 0, 1.4); set(p, B.uaR, -0.1, 0, -1.4); set(p, B.faL, -1.6, 0, 0); set(p, B.faR, -1.6, 0, 0); }
  void beat;
}
