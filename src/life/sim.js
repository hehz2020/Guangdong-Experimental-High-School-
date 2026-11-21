// The population: everyone the people module shows, what they are doing, where they are, and which of them are drawn.
// Walkers follow routes on the path network (paths.js) with a sideways place of their own on the path, keep to the
// right, walk in twos and threes, turn their heads now and then and step aside for the viewer; the others stand in
// groups, sit, run, play or work, and are made and cleared as the time of day changes (day.js). Only the people in view
// within a range are drawn, the nearest with the detailed body; poses of far people are refreshed less often.
// Everything about who does what and where is imagined (see people.js).
import * as THREE from 'three';
import { newPose, fk, NB } from './rig.js';
import * as AN from './anim.js';
import { dress, rng } from './dress.js';
import { A, bit } from './body.js';
import { route } from './paths.js';

const TAU = Math.PI * 2;
let NEXT_ID = 1;

/** A person: appearance from dress(), plus the fields the renderer reads. */
export function person(role, seed, kind) {
  const d = dress(role, seed);
  return { id: NEXT_ID++, kind, role, seed, pal: d.pal, mask: d.mask, carry: d.carry, sex: d.sex, scale: d.scale, girth: d.girth, sk: d.sk, extras: d.extras,
    x: 0, y: 0, z: 0, yaw: 0, pose: newPose(), mats: new Float32Array(NB * 12), poseAt: -99, lookY: 0, lookP: 0, lookT: 0, lookTY: 0, lookTP: 0, r: rng(seed * 31 + 7) };
}

// ---- walking along a route ---------------------------------------------------------------------------------------------
/** Flattens a route (list of [edge, forward]) into one polyline with per-segment half-widths. */
export function routeLine(G, r) {
  const xs = [], zs = [], ws = [];
  for (const [e, fwd] of r) {
    const E = G.edges[e], pts = fwd ? E.pts : E.pts.slice().reverse();
    for (let i = xs.length ? 1 : 0; i < pts.length; i++) { xs.push(pts[i][0]); zs.push(pts[i][1]); if (xs.length > 1) ws.push(E.w); }
  }
  const n = xs.length, cum = new Float32Array(n), nx = new Float32Array(n), nz = new Float32Array(n);
  for (let i = 1; i < n; i++) cum[i] = cum[i - 1] + Math.hypot(xs[i] - xs[i - 1], zs[i] - zs[i - 1]);
  for (let i = 0; i < n - 1; i++) { const l = cum[i + 1] - cum[i] || 1; nx[i] = -(zs[i + 1] - zs[i]) / l; nz[i] = (xs[i + 1] - xs[i]) / l; }
  return { xs, zs, ws, cum, nx, nz, n, len: cum[n - 1], y: r.length ? G.edges[r[0][0]].y : 0 };
}
const _p = [0, 0, 0, 0];
/** Point at arc length s with lateral fraction u (of the path's half-width) plus extra metres `extra`: [x, z, dirx, dirz]. Corners are rounded. */
function along(L, a, s, u, extra) {
  let i = a.seg; while (i < L.n - 2 && s > L.cum[i + 1]) i++; a.seg = i;
  const s0 = L.cum[i], s1 = L.cum[i + 1], len = s1 - s0 || 1e-6, t = Math.max(0, Math.min(1, (s - s0) / len));
  let x = L.xs[i] + (L.xs[i + 1] - L.xs[i]) * t, z = L.zs[i] + (L.zs[i + 1] - L.zs[i]) * t, dx = (L.xs[i + 1] - L.xs[i]) / len, dz = (L.zs[i + 1] - L.zs[i]) / len;
  let nx = L.nx[i], nz = L.nz[i], w = L.ws[i];
  const R = Math.min(2.2, len / 2);
  if (i < L.n - 2 && s1 - s < R) {                                         // approaching a corner: round it, blend the side direction
    const l2 = L.cum[i + 2] - s1, R2 = Math.min(R, l2 / 2), k = 1 - (s1 - s) / R;
    const ax = L.xs[i + 1] - dx * R, az = L.zs[i + 1] - dz * R, d2x = (L.xs[i + 2] - L.xs[i + 1]) / (l2 || 1), d2z = (L.zs[i + 2] - L.zs[i + 1]) / (l2 || 1);
    const bx = L.xs[i + 1] + d2x * R2, bz = L.zs[i + 1] + d2z * R2, q = 0.5 * k;
    x = (1 - q) * (1 - q) * ax + 2 * (1 - q) * q * L.xs[i + 1] + q * q * bx; z = (1 - q) * (1 - q) * az + 2 * (1 - q) * q * L.zs[i + 1] + q * q * bz;
    nx = nx * (1 - q) + L.nx[i + 1] * q; nz = nz * (1 - q) + L.nz[i + 1] * q; w = w * (1 - q) + L.ws[i + 1] * q; dx = dx * (1 - q) + d2x * q; dz = dz * (1 - q) + d2z * q;
  } else if (i > 0 && s - s0 < R) {
    const l0 = s0 - L.cum[i - 1], R0 = Math.min(R, l0 / 2), k = 1 - (s - s0) / R, q = 0.5 * k;
    const d0x = (L.xs[i] - L.xs[i - 1]) / (l0 || 1), d0z = (L.zs[i] - L.zs[i - 1]) / (l0 || 1);
    const ax = L.xs[i] - d0x * R0, az = L.zs[i] - d0z * R0, bx = L.xs[i] + dx * R, bz = L.zs[i] + dz * R, qq = 1 - q;     // q runs 0.5 at the corner to 0
    x = (1 - qq) * (1 - qq) * ax + 2 * (1 - qq) * qq * L.xs[i] + qq * qq * bx; z = (1 - qq) * (1 - qq) * az + 2 * (1 - qq) * qq * L.zs[i] + qq * qq * bz;
    nx = nx * (1 - q) + L.nx[i - 1] * q; nz = nz * (1 - q) + L.nz[i - 1] * q; w = w * (1 - q) + L.ws[i - 1] * q; dx = dx * (1 - q) + d0x * q; dz = dz * (1 - q) + d0z * q;
  }
  const nl = Math.hypot(nx, nz) || 1, o = u * Math.max(0, w - 0.28) + extra;
  _p[0] = x + nx / nl * o; _p[1] = z + nz / nl * o; _p[2] = dx; _p[3] = dz; return _p;
}

/**
 * The population. ctx: { G, ends (name -> node index list), crowd, safe, low, places (keep-off points [x, z]) }.
 */
export class Population {
  constructor(o) {
    Object.assign(this, o);
    this.walkers = []; this.still = []; this.extra = [];             // extra: agents owned by activities (sport), drawn like the others
    this.routes = new Map(); this.frame = 0; this.time = 0; this.stats = { walkers: 0, still: 0, drawn: [0, 0, 0], visible: 0 };
    this.frustum = new THREE.Frustum(); this.pv = new THREE.Matrix4(); this.sphere = new THREE.Sphere(new THREE.Vector3(), 1.3);
    this.vis = [];
    this.caps = o.caps;
  }
  routeBetween(a, b) {
    const key = a + '>' + b; if (this.routes.has(key)) return this.routes.get(key);
    const r = route(this.G, a, b), L = r && r.length ? routeLine(this.G, r) : null; this.routes.set(key, L); return L;
  }
  /** A walker (or a little group walking together) from node a to node b. warm: start somewhere along the way. */
  walk(a, b, roles, seed, warm = false, n = 1) {
    const L = this.routeBetween(a, b); if (!L || L.len < 3) return 0;
    const r = rng(seed), s0 = warm ? r() * L.len * 0.92 : 0, v = (0.95 + 0.3 * r()) * (roles === 'teacher' ? 1.25 : 1.33), base = 0.15 + 0.55 * r();                // keep to the right (positive offsets lie to the right of travel)
    for (let k = 0; k < n; k++) {
      const role = typeof roles === 'string' ? roles : pickRole(roles, r());
      const p = person(role, Math.floor(r() * 1e9), 'walk');
      Object.assign(p, { L, s: s0 - k * 0.25 * r(), seg: 0, v, u: Math.max(-0.95, Math.min(0.95, base + (k - (n - 1) / 2) * (0.75 / Math.max(0.8, L.ws[0] || 1)))),
        ph: r(), dodge: 0, arms: 'swing', y: L.y });
      // things in the hands: an umbrella against the sun, a phone, a bottle, books (teachers)
      const h = this.hour, sunny = h > 10 && h < 16.5 && !this.night;
      if (role === 'teacher' && (p.carry & (bit(A.books) | bit(A.folder)))) p.arms = 'books';
      else if (sunny && p.extras.umbrella) { p.carry |= bit(A.umbrella); p.arms = 'umbrella'; }
      else if (p.extras.phone && n === 1) { p.carry |= bit(A.phone); p.arms = 'phone'; p.pal[20] = p.pal[20] || 0x2a2c30; }
      else if (p.extras.bottle) p.carry |= bit(A.bottle);
      if (role === 'sport') p.carry &= ~bit(A.backpack);
      const q = along(L, p, Math.max(0, p.s), p.u, 0); p.x = q[0]; p.z = q[1]; p.yaw = Math.atan2(q[2], q[3]);
      this.walkers.push(p);
    }
    return n;
  }
  /** A walker starting off the network at (x, z) (a pupil getting out of a car), joining it at its nearest node, to node b. */
  walkFrom(x, z, a, b, seed, n = 1) {
    const base = this.routeBetween(a, b); if (!base) return 0;
    const L = { ...base, xs: [x, ...base.xs], zs: [z, ...base.zs], ws: [0.4, ...base.ws] }, n0 = L.xs.length;
    L.n = n0; L.cum = new Float32Array(n0); L.nx = new Float32Array(n0); L.nz = new Float32Array(n0);
    for (let i = 1; i < n0; i++) L.cum[i] = L.cum[i - 1] + Math.hypot(L.xs[i] - L.xs[i - 1], L.zs[i] - L.zs[i - 1]);
    for (let i = 0; i < n0 - 1; i++) { const l = L.cum[i + 1] - L.cum[i] || 1; L.nx[i] = -(L.zs[i + 1] - L.zs[i]) / l; L.nz[i] = (L.xs[i + 1] - L.xs[i]) / l; }
    L.len = L.cum[n0 - 1];
    const r = rng(seed);
    for (let k = 0; k < n; k++) {
      const p = person('student', Math.floor(r() * 1e9), 'walk');
      Object.assign(p, { L, s: -k * 0.6, seg: 0, v: 1.25 + 0.2 * r(), u: 0.2 + 0.3 * r() - k * 0.5, ph: r(), dodge: 0, arms: 'swing', y: 0 });
      p.x = x; p.z = z; p.yaw = Math.atan2(L.xs[1] - x, L.zs[1] - z); this.walkers.push(p);
    }
    return n;
  }
  /** Walkers along one gallery edge between two doors: from arc length s0 to s1 (s1 < s0 walks the other way). */
  walkSpan(e, s0, s1, seed, n = 1) {
    const fwd = s1 >= s0, key = 'edge' + e + (fwd ? '+' : '-');
    let L = this.routes.get(key); if (!L) { L = routeLine(this.G, [[e, fwd]]); this.routes.set(key, L); }
    const r = rng(seed), a = fwd ? s0 : L.len - s0, b = fwd ? s1 : L.len - s1, base = 0.1 + 0.5 * r(), v = 1.0 + 0.35 * r();
    for (let k = 0; k < n; k++) {
      const p = person('student', Math.floor(r() * 1e9), 'walk');
      Object.assign(p, { L, s: a - k * 0.3, sEnd: b, seg: 0, v, u: Math.max(-0.9, Math.min(0.9, base - k * 0.7)), ph: r(), dodge: 0, arms: 'swing', y: L.y }); p.carry = 0;
      const q = along(L, p, Math.max(0, p.s), p.u, 0); p.x = q[0]; p.z = q[1]; p.yaw = Math.atan2(q[2], q[3]);
      this.walkers.push(p);
    }
  }
  /** Clears the stationary people of a category (or all). */
  clear(cat) { this.still = cat ? this.still.filter(p => p.cat !== cat) : []; }
  add(p, cat) { p.cat = cat; this.still.push(p); return p; }
  /** True if (x, z) is closer than m metres to a menu place (where the viewer may be set down). */
  nearPlace(x, z, m = 2.2) { for (const q of this.places) if (Math.abs(q[0] - x) < m && Math.abs(q[1] - z) < m && Math.hypot(q[0] - x, q[1] - z) < m) return true; return false; }

  update(dt, cam) {
    this.frame++; this.time += dt;
    // walkers
    const ws = this.walkers;
    for (let i = ws.length - 1; i >= 0; i--) {
      const p = ws[i];
      // step aside for the viewer: if the eye is close ahead, drift to the side away from it and slow a little
      let slow = 1;
      if (cam) {
        const dx = cam.x - p.x, dz = cam.z - p.z, d2 = dx * dx + dz * dz;
        if (d2 < 9 && Math.abs(cam.y - 1.6 - p.y) < 1.2) {
          const fx = Math.sin(p.yaw), fz = Math.cos(p.yaw), ahead = dx * fx + dz * fz, side = dx * -fz + dz * fx;   // side > 0: the viewer is on the walker's left... in world terms (-fz, fx)
          if (ahead > -0.5) { const want = (side > 0 ? -1 : 1) * Math.max(0, 1.25 - Math.abs(side)) * 1.4; p.dodge += (want - p.dodge) * Math.min(1, dt * 3); slow = ahead < 1.2 && Math.abs(side) < 0.7 ? 0.4 : 0.85; }
        } else p.dodge *= Math.max(0, 1 - dt * 0.8);
      }
      p.s += p.v * slow * dt;
      if (p.s >= (p.sEnd ?? p.L.len)) { ws.splice(i, 1); continue; }
      if (p.s < 0) continue;
      const q = along(p.L, p, p.s, p.u, p.dodge);
      p.x = q[0]; p.z = q[1]; p.y = p.L.y;
      const want = Math.atan2(q[2], q[3]); let d = want - p.yaw; d -= Math.round(d / TAU) * TAU; p.yaw += d * Math.min(1, dt * 7);
      p.ph = (p.ph + dt * slow / AN.cycleTime(p.v * slow / p.scale)) % 1;
    }
    this.stats.walkers = ws.length; this.stats.still = this.still.length;
  }

  /** Head turns: glances about, and at the viewer when close and in front. */
  look(p, dt, cam) {
    p.lookT -= dt;
    if (p.lookT <= 0) { const r = p.r(); p.lookT = 1.2 + 3 * p.r(); p.lookTY = r < 0.55 ? 0 : (p.r() - 0.5) * 1.3; p.lookTP = (p.r() - 0.6) * 0.25; }
    let ty = p.lookTY, tp = p.lookTP;
    if (cam) {
      const dx = cam.x - p.x, dz = cam.z - p.z, d = Math.hypot(dx, dz);
      if (d < 7 && d > 0.6) {
        let a = Math.atan2(dx, dz) - p.yaw; a -= Math.round(a / TAU) * TAU;
        if (Math.abs(a) < 1.5 && (p.id % 3 !== 0)) { ty = Math.max(-1.1, Math.min(1.1, a)); tp = -Math.atan2(cam.y - (p.y + 1.55 * p.scale), d) * 0.8; }
      }
    }
    p.lookY += (ty - p.lookY) * Math.min(1, dt * 4); p.lookP += (tp - p.lookP) * Math.min(1, dt * 4);
    _look[0] = p.lookY; _look[1] = p.lookP; return _look;
  }

  /** Pose of a person at the current time (fills p.pose). */
  pose(p, dt, cam) {
    const t = this.time + (p.id % 97) * 0.37, look = this.look(p, dt, cam);
    switch (p.kind) {
      case 'walk': AN.walk(p.pose, p.sk, p.ph, p.v / p.scale, { arms: p.arms, look }); break;
      case 'sit': AN.sit(p.pose, p.sk, p.h / p.scale, { arms: p.arms, look: p.arms === 'desk' || p.arms === 'read' || p.arms === 'eat' ? [look[0] * 0.3, look[1] * 0.3] : look, t, lean: p.lean || 0, feet: p.feet, cross: p.cross }); break;
      case 'stand': AN.stand(p.pose, p.sk, t, p.w + 0.35 * Math.sin(t * 0.13 + p.id), { arms: p.arms, look, tilt: p.tilt || 0 }); break;
      case 'sweep': AN.sweep(p.pose, p.sk, t); break;
      case 'tend': AN.tend(p.pose, p.sk, t); break;
      case 'drill': AN.drill(p.pose, p.sk, this.drillT || 0); break;
      default: if (p.poseFn) p.poseFn(p, t, look);
    }
  }

  /** Chooses who is drawn and hands them to the crowd renderer. */
  draw(env, dt) {
    const cam = env.camera, crowd = this.crowd, R = this.range, R2 = R * R;
    cam.updateMatrixWorld(); this.pv.multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse); this.frustum.setFromProjectionMatrix(this.pv);
    const cx = cam.position.x, cy = cam.position.y, cz = cam.position.z, vis = this.vis; vis.length = 0;
    const consider = list => { for (const p of list) {
      if (p.hidden && p.hidden()) continue;
      const dx = p.x - cx, dz = p.z - cz, d2 = dx * dx + dz * dz; if (d2 > R2) continue;
      this.sphere.center.set(p.x, p.y + 0.9, p.z); if (!this.frustum.intersectsSphere(this.sphere)) continue;
      p.d2 = d2 + (p.y - cy + 1.6) * (p.y - cy + 1.6) * 2 + (p.indoor ? 900 : 0); vis.push(p);
    } };
    consider(this.walkers); consider(this.still); consider(this.extra);
    vis.sort((a, b) => a.d2 - b.d2);
    const camP = { x: cx, y: cy, z: cz }, caps = this.caps, n = [0, 0, 0], every = [1, 2, 4];
    crowd.begin();
    for (const p of vis) {
      const d = Math.sqrt(p.d2);
      let lod = d < 24 && n[0] < caps[0] ? 0 : d < 80 && n[1] < caps[1] ? 1 : n[2] < caps[2] ? 2 : -1;
      if (lod < 0) break;
      if (this.frame - p.poseAt >= every[lod] || p.lod !== lod) { this.pose(p, dt * (this.frame - p.poseAt), d < 12 ? camP : null); fk(p.sk, p.pose, p.mats, 0); p.poseAt = this.frame; }
      p.lod = lod;
      if (crowd.draw(p, lod)) n[lod]++;
    }
    crowd.end();
    this.stats.drawn = n; this.stats.visible = vis.length;
    return vis;
  }
}
const _look = [0, 0];
export function pickRole(roles, x) { let acc = 0; for (const [k, w] of Object.entries(roles)) { acc += w; if (x <= acc) return k; } return Object.keys(roles)[0]; }

// ---- contact shadows ------------------------------------------------------------------------------------------------------
/** A soft dark patch under each drawn person, stretched away from the sun. One instanced quad mesh; stock material. */
export function contactShadows(cap) {
  const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'), grad = g.createRadialGradient(32, 32, 2, 32, 32, 31);
  grad.addColorStop(0, 'rgba(0,0,0,0.85)'); grad.addColorStop(0.45, 'rgba(0,0,0,0.5)'); grad.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = grad; g.fillRect(0, 0, 64, 64);
  const tex = new THREE.CanvasTexture(c);
  const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, color: 0x000000, opacity: 0.5, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -8 });
  mat.name = 'life-contact-shadow';
  const geo = new THREE.PlaneGeometry(1, 1); geo.rotateX(-Math.PI / 2);
  const im = new THREE.InstancedMesh(geo, mat, cap); im.count = 0; im.frustumCulled = false; im.renderOrder = 60; im.name = 'people-contact-shadows'; im.castShadow = im.receiveShadow = false;
  im.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), v = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0);
  return {
    mesh: im,
    update(list, sunDir, strength) {
      let k = 0; const el = Math.max(0.12, sunDir.y), len = Math.min(3.2, 0.5 + 0.55 / Math.tan(Math.asin(Math.min(1, el)))), ang = Math.atan2(-sunDir.x, -sunDir.z);
      q.setFromAxisAngle(up, ang);
      for (const p of list) {
        if (k >= cap || p.lod === 2 || p.noShadow) continue;
        const sc = p.scale, shift = (len - 0.62) * 0.5 * sc;                // the patch starts at the feet and runs away from the sun
        v.set(p.x + Math.sin(ang) * shift, (p.floorY ?? p.y) + 0.035, p.z + Math.cos(ang) * shift);
        s.set(0.62 * sc * p.girth, 1, len * sc); m.compose(v, q, s); im.setMatrixAt(k++, m);
      }
      im.count = k; im.instanceMatrix.needsUpdate = true; mat.opacity = 0.42 * strength;
    },
  };
}
