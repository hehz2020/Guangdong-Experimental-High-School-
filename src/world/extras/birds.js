// Birds: a flock of small birds wheeling over the canal and the tree rows, egrets standing in the canal and now and then
// flying slowly along it, pigeons pecking on the paving inside the gate that fly up when the walker comes close and
// come back down a while later. By day only; none on phones (ctx.lowPower).
// ALL IMAGINED: which birds live here, how many, where they stand. Bodies and wings are drawn in code (no image, no
// model); wings flap by turning instanced plates about the shoulder. Stock materials only.
import { timed } from '../../life/timing.js';
import * as THREE from 'three';
import { CANAL } from './landscape.js';

const TAU = Math.PI * 2;
const rnd = s => { let x = s >>> 0 || 1; return () => ((x = (x * 1664525 + 1013904223) >>> 0) / 4294967296); };

/** A spindle body along +z (head forward) from rings [z, half width, half height, y offset, colour]. */
function spindle(rings, segs = 8) {
  const pos = [], col = [], idx = [];
  rings.forEach(([z, w, h, y, c]) => { for (let i = 0; i < segs; i++) { const a = i / segs * TAU; pos.push(Math.cos(a) * w, y + Math.sin(a) * h, z); col.push(...c); } });
  for (let r = 0; r < rings.length - 1; r++) for (let i = 0; i < segs; i++) { const a = r * segs + i, b = r * segs + (i + 1) % segs, c = a + segs, d = b + segs; idx.push(a, b, c, b, d, c); }
  const tip = (r, z, c) => { const ci = pos.length / 3; pos.push(0, rings[r][3], z); col.push(...c); for (let i = 0; i < segs; i++) { const a = r * segs + i, b = r * segs + (i + 1) % segs; r ? idx.push(ci, a, b) : idx.push(ci, b, a); } };
  tip(0, rings[0][0] - 0.01, rings[0][4]); tip(rings.length - 1, rings[rings.length - 1][0] + 0.01, rings[rings.length - 1][4]);
  return { pos, col, idx };
}
function merge(parts) {
  const pos = [], col = [], idx = [];
  for (const p of parts) { const b = pos.length / 3; pos.push(...p.pos); col.push(...p.col); idx.push(...p.idx.map(i => i + b)); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g.setIndex(idx); g.computeVertexNormals(); return g;
}
const moved = (p, dx, dy, dz, rx = 0) => { const c = Math.cos(rx), s = Math.sin(rx); const pos = p.pos.slice(); for (let i = 0; i < pos.length; i += 3) { const y = pos[i + 1], z = pos[i + 2]; pos[i + 1] = y * c - z * s + dy; pos[i + 2] = y * s + z * c + dz; pos[i] += dx; } return { ...p, pos }; };
const stick = (a, b, r, c) => { const dx = b[0] - a[0], dy = b[1] - a[1], dz = b[2] - a[2], len = Math.hypot(dx, dy, dz), p = spindle([[0, r, r, 0, c], [len, r * 0.8, r * 0.8, 0, c]], 4);
  const yaw = Math.atan2(dx, dz), pitch = -Math.asin(dy / len), pos = p.pos.slice();
  for (let i = 0; i < pos.length; i += 3) { let x = pos[i], y = pos[i + 1], z = pos[i + 2]; const y2 = y * Math.cos(pitch) - z * Math.sin(pitch), z2 = y * Math.sin(pitch) + z * Math.cos(pitch); pos[i] = x * Math.cos(yaw) + z2 * Math.sin(yaw) + a[0]; pos[i + 1] = y2 + a[1]; pos[i + 2] = -x * Math.sin(yaw) + z2 * Math.cos(yaw) + a[2]; }
  return { ...p, pos }; };

export function birdGeometries() {
  const W = [0.95, 0.95, 0.93], Y = [0.85, 0.65, 0.15], K = [0.08, 0.08, 0.08], G1 = [0.48, 0.5, 0.55], G2 = [0.33, 0.36, 0.42], IR = [0.42, 0.55, 0.5], BR = [0.28, 0.22, 0.18], BL = [0.85, 0.8, 0.72];
  // small bird (a swallow-like dark back and pale belly), about 0.16 m
  const small = merge([spindle([[-0.09, 0.006, 0.006, 0.005, BR], [-0.05, 0.016, 0.014, 0, BR], [0.0, 0.022, 0.022, 0, BR], [0.04, 0.018, 0.018, 0.004, BR], [0.065, 0.01, 0.01, 0.006, K]], 6),
    moved(spindle([[-0.15, 0.002, 0.002, 0, K], [-0.09, 0.012, 0.003, 0, BR]], 4), 0, 0.004, 0)]);
  // pigeon: grey body, darker head and tail, an iridescent neck, pale bill, red-pink feet
  const pigeon = merge([spindle([[-0.16, 0.01, 0.006, 0.02, G2], [-0.11, 0.045, 0.02, 0.02, G2], [-0.05, 0.06, 0.055, 0.0, G1], [0.03, 0.055, 0.06, 0.0, G1], [0.08, 0.035, 0.04, 0.03, IR], [0.11, 0.025, 0.028, 0.07, G2], [0.135, 0.02, 0.022, 0.085, G2], [0.15, 0.008, 0.008, 0.08, BL]], 8),
    stick([0.02, -0.05, 0.0], [0.03, -0.12, 0.01], 0.006, [0.75, 0.35, 0.35]), stick([-0.02, -0.05, 0.0], [-0.03, -0.12, 0.01], 0.006, [0.75, 0.35, 0.35])]);
  // egret standing: white body, long S-shaped neck, yellow bill, black legs (origin at the feet)
  const egret = merge([spindle([[-0.3, 0.01, 0.01, 0.62, W], [-0.2, 0.07, 0.06, 0.6, W], [-0.05, 0.1, 0.1, 0.6, W], [0.08, 0.08, 0.09, 0.64, W], [0.14, 0.04, 0.05, 0.7, W]], 8),
    stick([0.12, 0.7, 0], [0.18, 0.92, 0], 0.03, W), stick([0.18, 0.92, 0], [0.1, 1.08, 0], 0.025, W), stick([0.1, 1.08, 0], [0.16, 1.22, 0], 0.024, W),
    spindle([[0.12, 0.025, 0.028, 1.24, W], [0.19, 0.03, 0.03, 1.25, W], [0.23, 0.02, 0.02, 1.25, W], [0.36, 0.006, 0.006, 1.23, Y]], 6),
    stick([0.0, 0.58, 0.04], [0.01, 0.0, 0.05], 0.012, K), stick([0.0, 0.58, -0.04], [-0.03, 0.0, -0.06], 0.012, K)]);
  // egret flying: neck folded back, legs trailing (origin at the body), along +z
  const egretFly = merge([spindle([[-0.35, 0.01, 0.01, 0, W], [-0.25, 0.08, 0.07, 0, W], [-0.05, 0.1, 0.1, 0, W], [0.12, 0.08, 0.08, 0.02, W], [0.22, 0.05, 0.06, 0.04, W], [0.3, 0.04, 0.045, 0.05, W], [0.36, 0.015, 0.015, 0.04, Y], [0.48, 0.004, 0.004, 0.03, Y]], 8),
    stick([0, -0.05, -0.25], [0.02, -0.06, -0.85], 0.01, K), stick([0, -0.05, -0.25], [-0.02, -0.06, -0.85], 0.01, K)]);
  // wing: a tapered plate, shoulder at the origin, span along +x, chord along z (leading edge at +z)
  const wingShape = (span, chord, tip) => { const g = new THREE.BufferGeometry(), p = [0, 0, chord * 0.45, span * 0.5, 0.01, chord * 0.5, span, 0.02, tip * 0.6, span * 0.95, 0.0, -tip * 0.4, span * 0.5, -0.005, -chord * 0.55, 0, 0, -chord * 0.5];
    g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3)); g.setIndex([0, 1, 5, 1, 4, 5, 1, 2, 4, 2, 3, 4]); g.computeVertexNormals(); return g; };
  return { small, pigeon, egret, egretFly, wing: wingShape(1, 0.32, 0.18) };
}

export function build(ctx) {
  if (ctx.lowPower) return;                                                       // phones: no birds
  const G = birdGeometries(), group = new THREE.Group(); group.name = 'birds'; ctx.add(group);
  const bodyMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.8 }); bodyMat.name = 'life-birds';
  const wingMat = new THREE.MeshStandardMaterial({ roughness: 0.85, side: THREE.DoubleSide }); wingMat.name = 'life-bird-wings';
  const r = rnd(321);
  const im = (geo, mat, n, name) => { const m = new THREE.InstancedMesh(geo, mat, n); m.count = 0; m.frustumCulled = false; m.castShadow = false; m.receiveShadow = true; m.name = name; m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); group.add(m); return m; };
  const NS = 26, NP = 16, NE = 5, NF = 2;
  const smallM = im(G.small, bodyMat, NS, 'birds-small'), pigeonM = im(G.pigeon, bodyMat, NP, 'birds-pigeons'), egretM = im(G.egret, bodyMat, NE, 'birds-egrets'), flyM = im(G.egretFly, bodyMat, NF, 'birds-egrets-flying');
  const wingM = im(G.wing, wingMat, 2 * (NS + NP + NF), 'birds-wings'); wingM.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(2 * (NS + NP + NF) * 3), 3);
  const westX = z => CANAL.westEdge[0][0] + (CANAL.westEdge[1][0] - CANAL.westEdge[0][0]) * (z - CANAL.westEdge[0][1]) / (CANAL.westEdge[1][1] - CANAL.westEdge[0][1]);
  const WATER = -1.45;
  // the flock
  const flock = Array.from({ length: NS }, (_, i) => ({ ph: r() * TAU, rad: 6 + r() * 14, h: (r() - 0.5) * 6, w: 0.45 + r() * 0.25, flap: r() * TAU, p: new THREE.Vector3(), q: new THREE.Vector3() }));
  // egrets in the water near the west wall, and two flying along the canal
  const egrets = [-96, -70, -33, 14, 47].map((z, i) => ({ x: westX(z) + 1.2 + r() * 3, z, yaw: (r() - 0.5) * 2 + Math.PI, t: r() * 10, i }));
  const fliers = Array.from({ length: NF }, (_, i) => ({ s: r() * 400, v: 7 + r() * 2, h: 6 + r() * 5, off: 4 + r() * 12, flap: r() * TAU, dir: i ? 1 : -1 }));
  // pigeons on the pale paving inside the gate
  const home = [240.5, -15.5];
  const pigeons = Array.from({ length: NP }, () => ({ x: home[0] + (r() - 0.5) * 6, z: home[1] + (r() - 0.5) * 5, yaw: r() * TAU, peck: r() * 10, state: 'ground', t: 0, vx: 0, vy: 0, vz: 0, flap: r() * TAU, y: 0, a: r() * TAU, gx: 0, gz: 0 }));
  const M = new THREE.Matrix4(), Q = new THREE.Quaternion(), Q2 = new THREE.Quaternion(), V = new THREE.Vector3(), S = new THREE.Vector3(1, 1, 1), YA = new THREE.Vector3(0, 1, 0), ZA = new THREE.Vector3(0, 0, 1), XA = new THREE.Vector3(1, 0, 0), E = new THREE.Euler();
  let wn = 0;
  const wings = (pos, yaw, pitch, roll, scale, span, ang, colour, shoulder = 0) => {
    for (const s of [1, -1]) {
      E.set(pitch, yaw, roll, 'YXZ'); Q.setFromEuler(E); Q2.setFromAxisAngle(ZA, s * ang); const q = Q.clone().multiply(Q2);
      V.set(s * shoulder * scale, 0.01 * scale, 0).applyQuaternion(Q).add(pos); M.compose(V, q, S.set(s * span * scale, scale, scale)); wingM.setMatrixAt(wn, M); wingM.instanceColor.setXYZ(wn++, colour[0], colour[1], colour[2]);
    }
  };
  ctx.animate(timed('birds', (dt, t, env) => {
    if (!env || !env.camera) return;
    const L = env.lighting, night = L && L.night ? L.night() : 0, hour = L && L.getTime ? L.getTime() : 10, day = night < 0.6 && hour > 5.8;
    group.visible = day; if (!day) return;
    wn = 0; const cam = env.camera.position, P = new THREE.Vector3();
    // flock: wheeling round a centre that drifts along the canal and over the tree rows on its banks
    const cz = -40 + 70 * Math.sin(t * 0.021), cx = westX(cz) - 6 + 10 * Math.sin(t * 0.033), cy = 14 + 3 * Math.sin(t * 0.05);
    flock.forEach((b, i) => {
      const w = b.w, a = t * w + b.ph, rad = b.rad * (0.8 + 0.2 * Math.sin(t * 0.3 + i));
      P.set(cx + Math.cos(a) * rad + 3 * Math.sin(t * 0.7 + i), cy + b.h + 1.5 * Math.sin(2 * a + i), cz + Math.sin(a) * rad * 0.7);
      const vx = P.x - b.p.x, vy = P.y - b.p.y, vz = P.z - b.p.z; b.p.copy(P);
      const yaw = Math.atan2(vx, vz), pitch = -Math.atan2(vy, Math.hypot(vx, vz) || 1e-3), bank = Math.max(-0.8, Math.min(0.8, (yaw - (b.lastYaw ?? yaw)) * 20)); b.lastYaw = yaw;
      const glide = Math.sin(t * 0.9 + i * 1.3) > 0.4, flap = glide ? 0.15 : Math.sin(t * 22 + b.flap) * 0.75;
      E.set(pitch, yaw, -bank, 'YXZ'); Q.setFromEuler(E); M.compose(P, Q, S.set(1, 1, 1)); smallM.setMatrixAt(i, M);
      wings(P, yaw, pitch, -bank, 1, 0.13, flap, [0.25, 0.2, 0.17]);
    });
    smallM.count = NS; smallM.instanceMatrix.needsUpdate = true;
    // egrets standing: now and then they turn, stretch, peck at the water
    egrets.forEach((e, i) => {
      const k = Math.sin(t * 0.2 + e.t), peck = Math.max(0, Math.sin(t * 0.7 + e.t * 3)) ** 8;
      E.set(0.25 * peck, e.yaw + 0.4 * Math.sin(t * 0.05 + e.t), 0, 'YXZ'); Q.setFromEuler(E);
      M.compose(V.set(e.x, WATER - 0.16 - 0.03 * k, e.z), Q, S.set(1, 1, 1)); egretM.setMatrixAt(i, M);
    });
    egretM.count = NE; egretM.instanceMatrix.needsUpdate = true;
    // egrets flying slowly along the canal, high over the water, then out of sight and back
    fliers.forEach((f, i) => {
      f.s += f.v * dt; if (f.s > 520) f.s = 0;
      const z = f.dir > 0 ? -260 + f.s : 260 - f.s, x = westX(z) + 11 + f.off * 0.3 + 2 * Math.sin(t * 0.3 + i), y = f.h + 1.2 * Math.sin(t * 0.4 + i);
      P.set(x, y, z); const yaw = f.dir > 0 ? Math.atan2(westX(z + 1) - westX(z), 1) : Math.atan2(westX(z - 1) - westX(z), -1);
      E.set(0.05, yaw, 0, 'YXZ'); Q.setFromEuler(E); M.compose(P, Q, S.set(1, 1, 1)); flyM.setMatrixAt(i, M);
      wings(P, yaw, 0.05, 0, 1, 0.75, Math.sin(t * 3.6 + f.flap) * 0.55 + 0.1, [0.95, 0.95, 0.93], 0.06);
    });
    flyM.count = NF; flyM.instanceMatrix.needsUpdate = true;
    // pigeons: peck and shuffle; fly up when the walker comes within 5 m, circle and settle again
    const near = Math.hypot(cam.x - home[0], cam.z - home[1]) < 9 && cam.y < 4;
    pigeons.forEach((p, i) => {
      const d = Math.hypot(cam.x - p.x, cam.z - p.z);
      if (p.state === 'ground') {
        p.peck += dt; if (Math.sin(p.peck * 1.7 + i) > 0.97) p.yaw += (r() - 0.5) * 1.5;
        const step = Math.max(0, Math.sin(p.peck * 0.8 + i * 2)) * 0.12 * dt; p.x += Math.sin(p.yaw) * step; p.z += Math.cos(p.yaw) * step;
        if (Math.hypot(p.x - home[0], p.z - home[1]) > 4.5) p.yaw = Math.atan2(home[0] - p.x, home[1] - p.z);
        if (d < 5 && cam.y < 4) { p.state = 'up'; p.t = 0; const a = Math.atan2(p.x - cam.x, p.z - cam.z) + (r() - 0.5) * 0.8; p.vx = Math.sin(a) * 5; p.vz = Math.cos(a) * 5; p.vy = 4 + r() * 2; p.a = r() * TAU; }
      } else if (p.state === 'up') {
        p.t += dt; p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt; p.vy *= 1 - dt * 0.6;
        if (p.t > 2.2) { p.state = 'circle'; p.t = 0; }
      } else if (p.state === 'circle') {
        p.t += dt; p.a += dt * 0.55; const tx = home[0] + Math.cos(p.a) * 16, tz = home[1] + Math.sin(p.a) * 16, ty = 9 + 2 * Math.sin(p.a * 2 + i);
        p.vx += (tx - p.x - p.vx) * dt * 1.5; p.vz += (tz - p.z - p.vz) * dt * 1.5; p.vy += (ty - p.y - p.vy) * dt * 1.5; p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt;
        if (p.t > 18 && !near) { p.state = 'down'; p.t = 0; p.gx = home[0] + (r() - 0.5) * 6; p.gz = home[1] + (r() - 0.5) * 5; }
      } else {
        p.t += dt; const k = Math.min(1, dt * 1.2); p.x += (p.gx - p.x) * k; p.z += (p.gz - p.z) * k; p.y += (0 - p.y) * k; p.vx = p.gx - p.x; p.vz = p.gz - p.z; p.vy = -p.y;
        if (p.y < 0.05) { p.y = 0; p.state = 'ground'; p.yaw = r() * TAU; }
      }
      const fly = p.state !== 'ground';
      const yaw = fly ? Math.atan2(p.vx, p.vz) : p.yaw, pitch = fly ? -Math.atan2(p.vy, Math.hypot(p.vx, p.vz) || 1e-3) * 0.6 : Math.max(0, Math.sin(p.peck * 3 + i)) ** 6 * 0.6;
      P.set(p.x, p.y + 0.12, p.z); E.set(pitch, yaw, 0, 'YXZ'); Q.setFromEuler(E); M.compose(P, Q, S.set(1, 1, 1)); pigeonM.setMatrixAt(i, M);
      if (fly) wings(P, yaw, pitch, 0, 1, 0.32, Math.sin(t * 13 + p.flap) * 0.8, [0.45, 0.47, 0.52], 0.03);
    });
    pigeonM.count = NP; pigeonM.instanceMatrix.needsUpdate = true;
    wingM.count = wn; wingM.instanceMatrix.needsUpdate = true; wingM.instanceColor.needsUpdate = true;
  }));
}
