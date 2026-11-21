// Sport for the people module: runners on the track, pick-up games on the basketball courts (one ball per court that is
// dribbled, passed, shot at the rim and rebounded), a PE class jogging in a pack, and the morning exercises on the
// field. ALL IMAGINED: who plays where and when, the rules of the little games, the exercise routine.
import * as THREE from 'three';
import * as AN from './anim.js';
import { B } from './rig.js';
import { person } from './sim.js';
import { rng } from './dress.js';
import { A, bit } from './body.js';

const TAU = Math.PI * 2;
const ss = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

// ---- the track ---------------------------------------------------------------------------------------------------------
/** Position and heading on a lane of radius r (from the bend centres) at distance s, running anticlockwise (infield on the left). */
function trackAt(T, r, s, out) {
  const L = T.straight, bend = Math.PI * r, lap = 2 * L + 2 * bend; s = ((s % lap) + lap) % lap;
  if (s < L) { out[0] = T.cx + r; out[1] = T.cz + L / 2 - s; out[2] = 0; out[3] = -1; }
  else if (s < L + bend) { const a = (s - L) / r; out[0] = T.cx + r * Math.cos(a); out[1] = T.cz - L / 2 - r * Math.sin(a); out[2] = -Math.sin(a); out[3] = -Math.cos(a); }
  else if (s < 2 * L + bend) { const q = s - L - bend; out[0] = T.cx - r; out[1] = T.cz - L / 2 + q; out[2] = 0; out[3] = 1; }
  else { const a = (s - 2 * L - bend) / r; out[0] = T.cx - r * Math.cos(a); out[1] = T.cz + L / 2 + r * Math.sin(a); out[2] = Math.sin(a); out[3] = Math.cos(a); }
  return lap;
}

export function createSport({ campus, pop, group, safe, low }) {
  const T = campus.track, C = campus.courts, tmp = [0, 0, 0, 0], v3 = [0, 0, 0];
  const lane = k => T.innerRadius + T.laneWidth * (k - 0.5);
  // ---- basketballs: one instanced sphere per court in play, stock material with drawn seams
  const ballTex = (() => { const c = document.createElement('canvas'); c.width = 128; c.height = 64; const g = c.getContext('2d'); g.fillStyle = '#d4682c'; g.fillRect(0, 0, 128, 64);
    for (let i = 0; i < 2000; i++) { g.fillStyle = `rgba(${90 + Math.random() * 40},${30 + Math.random() * 20},10,0.25)`; g.fillRect(Math.random() * 128, Math.random() * 64, 1, 1); }
    g.strokeStyle = '#2a1a12'; g.lineWidth = 2; g.beginPath(); g.moveTo(0, 32); g.lineTo(128, 32); g.moveTo(32, 0); g.lineTo(32, 64); g.moveTo(96, 0); g.lineTo(96, 64); g.stroke();
    g.beginPath(); g.ellipse(64, 32, 18, 30, 0, 0, TAU); g.stroke();
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; })();
  const ballMat = new THREE.MeshStandardMaterial({ map: ballTex, roughness: 0.75, metalness: 0 }); ballMat.name = 'life-basketball';
  const balls = new THREE.InstancedMesh(new THREE.SphereGeometry(0.12, 14, 10), ballMat, 8); balls.count = 0; balls.frustumCulled = false; balls.castShadow = false; balls.name = 'basketballs';
  balls.instanceMatrix.setUsage(THREE.DynamicDrawUsage); group.add(balls);
  const M = new THREE.Matrix4(), Q = new THREE.Quaternion(), S1 = new THREE.Vector3(1, 1, 1), P = new THREE.Vector3(), XAXIS = new THREE.Vector3(1, 0, 0);

  let runners = [], games = [], drillers = [];
  // ---- runners -------------------------------------------------------------------------------------------------------
  function makeRunners(n, pe, seed) {
    runners = []; const r = rng(seed);
    for (let i = 0; i < n; i++) {
      const p = person(r() < 0.8 ? 'sport' : 'student', 9000 + i * 13 + seed, 'run'); p.carry = 0;
      p.lane = lane(4 + Math.floor(r() * 5)); p.s = r() * 400; p.v = 2.7 + r() * 1.8; p.ph = r();
      runners.push(p);
    }
    if (pe) {                                                 // a PE class jogging two by two in a loose pack, the teacher on the infield
      const s0 = (seed * 37) % 400;
      for (let i = 0; i < 22; i++) { const p = person('sport', 9500 + i * 7 + seed, 'run'); p.carry = 0; p.lane = lane(1 + (i % 2)); p.s = s0 - Math.floor(i / 2) * 1.6 - r() * 0.4; p.v = 3.0; p.ph = r(); runners.push(p); }
      const t = person('teacher', 9700 + seed, 'stand'); t.carry = 0; t.w = 0.5; t.arms = 'cross'; t.x = T.cx + lane(1) - 6; t.z = T.cz - 8; t.yaw = Math.PI / 2; t.y = 0; runners.push(t);
    }
    for (const p of runners) if (p.kind === 'run') p.poseFn = (q, t, look) => AN.run(q.pose, q.sk, q.ph, q.v / q.scale, { look: [look[0] * 0.3, 0] });
  }
  // ---- basketball games ------------------------------------------------------------------------------------------------
  function hoopOf(col, row, end) { const x = C.columnCentresX[col], z = C.rowCentresZ[row], zr = z + end * (C.courtSize[1] / 2 - 1.2 - 0.38); return [x, 3.05, zr]; }
  function makeGames(n, seed) {
    games = []; if (!C) return; const r = rng(seed);
    const order = [5, 2, 6, 1, 4, 7, 0, 3];                              // courts in use, the nearest to the gymnasium path first
    for (let g = 0; g < Math.min(n, 8); g++) {
      const ci = order[g], col = ci % 4, row = Math.floor(ci / 4), end = r() < 0.5 ? -1 : 1, hoop = hoopOf(col, row, end), size = 4 + Math.floor(r() * 3);
      const players = [];
      for (let i = 0; i < size; i++) { const p = person(r() < 0.6 ? 'sport' : 'student', 8000 + g * 31 + i * 3 + seed, 'hoops'); p.carry = 0; p.team = i % 2; p.mode = 'wait'; p.tx = 0; p.tz = 0; p.ph = r(); players.push(p); }
      const G = { hoop, dir: -end, players, ball: [hoop[0], 0.12, hoop[2] - end * 5], owner: 0, phase: 'play', t: 0, dur: 2 + r() * 3, shot: null, r, offense: 0 };
      // spots round the basket (court-space: x across, d out from the baseline toward the centre)
      G.spot = (k, team) => { const a = [-1.2, -0.6, 0, 0.6, 1.2][k % 5], d = 4.8 + (k % 3) * 0.9 - (team !== G.offense ? 1.2 : 0); return [hoop[0] + Math.sin(a) * d, hoop[2] - end * (Math.cos(a) * d + 0.4)]; };
      players.forEach((p, i) => { const [x, z] = G.spot(i >> 1, p.team); p.x = x + (r() - 0.5); p.z = z + (r() - 0.5); p.y = 0; p.yaw = Math.atan2(hoop[0] - p.x, hoop[2] - p.z); p.k = i >> 1; });
      for (const p of players) p.poseFn = (q, t, look) => poseHoops(G, q, t, look);
      games.push(G);
    }
  }
  function poseHoops(G, p, t, look) {
    const lk = [look[0] * 0.4, look[1] * 0.4];
    if (p.mode === 'shoot') return AN.hoops(p.pose, p.sk, t, 'shoot', p.s, { look: lk });
    if (p.moving) {
      AN[p.speed > 2.2 ? 'run' : 'walk'](p.pose, p.sk, p.ph, p.speed / p.scale, { look: lk });
      if (G.players[G.owner] === p && G.phase === 'play') { const b = 0.5 + 0.5 * Math.cos(t * TAU * 1.8); p.pose[B.uaR * 3] = -0.35 + 0.1 * b; p.pose[B.uaR * 3 + 2] = -0.25; p.pose[B.faR * 3] = -0.6 - 0.45 * b; }
      return;
    }
    return AN.hoops(p.pose, p.sk, t, G.players[G.owner] === p && G.phase === 'play' ? 'dribble' : p.team === G.offense ? 'wait' : 'defend', 0, { look: lk });
  }
  function stepGame(G, dt, time) {
    const r = G.r, H = G.hoop, owner = G.players[G.owner];
    G.t += dt;
    for (const p of G.players) {                                  // move toward the target point, face the ball or the basket
      const dx = p.tx - p.x, dz = p.tz - p.z, d = Math.hypot(dx, dz);
      p.moving = d > 0.35 && p.mode !== 'shoot';
      if (p.moving) { p.speed = Math.min(d * 1.6, p.team === G.offense || G.phase === 'rebound' ? 4.2 : 3.2); p.x += dx / d * p.speed * dt; p.z += dz / d * p.speed * dt; p.ph = (p.ph + dt / (p.speed > 2.2 ? AN.runCycleTime(p.speed) : AN.cycleTime(p.speed))) % 1; }
      const fx = (p.moving ? dx : G.ball[0] - p.x), fz = (p.moving ? dz : G.ball[2] - p.z); let want = Math.atan2(fx, fz) - p.yaw; want -= Math.round(want / TAU) * TAU; p.yaw += want * Math.min(1, dt * 6);
    }
    if (G.phase === 'play') {
      // the owner dribbles to a spot; teammates take spots; defenders stand between their man and the basket
      if (G.t === dt || !G.planned) { G.planned = true; for (const p of G.players) { const [x, z] = G.spot(p.k + Math.floor(r() * 2), p.team); p.tx = x; p.tz = z; } }
      for (const p of G.players) if (p.team !== G.offense) { const m = G.players.find(q => q.team === G.offense && q.k === p.k) || owner; p.tx = m.x + (H[0] - m.x) * 0.3; p.tz = m.z + (H[2] - m.z) * 0.3; }
      { const J = owner.sk.j, m = owner.mats, o = B.handR * 12, x = J[B.handR * 3], y = J[B.handR * 3 + 1] - 0.12, z = J[B.handR * 3 + 2] + 0.05;     // the right hand, posed
        for (let i = 0; i < 3; i++) v3[i] = m[o + i * 4] * x + m[o + i * 4 + 1] * y + m[o + i * 4 + 2] * z + m[o + i * 4 + 3]; }
      const hx = owner.x + (Math.cos(owner.yaw) * v3[0] + Math.sin(owner.yaw) * v3[2]) * owner.scale, hz = owner.z + (-Math.sin(owner.yaw) * v3[0] + Math.cos(owner.yaw) * v3[2]) * owner.scale;
      const bounce = Math.abs(Math.sin(time * Math.PI * 1.8)); G.ball[0] = hx; G.ball[2] = hz; G.ball[1] = 0.12 + bounce * Math.max(0.3, v3[1] * owner.scale - 0.15);
      if (G.t > G.dur) {
        if (r() < 0.35) {                                           // a pass to a teammate
          const mates = G.players.filter(q => q.team === G.offense && q !== owner); const to = mates[Math.floor(r() * mates.length)];
          G.phase = 'pass'; G.t = 0; G.from = [G.ball[0], 1.2, G.ball[2]]; G.to = G.players.indexOf(to); G.dur = 0.55;
        } else { G.phase = 'shoot'; G.t = 0; owner.mode = 'shoot'; owner.s = 0; owner.tx = owner.x; owner.tz = owner.z; owner.yaw = Math.atan2(H[0] - owner.x, H[2] - owner.z); G.made = r() < 0.5; }
      }
    } else if (G.phase === 'pass') {
      const to = G.players[G.to], k = Math.min(1, G.t / G.dur);
      G.ball[0] = G.from[0] + (to.x - G.from[0]) * k; G.ball[2] = G.from[2] + (to.z - G.from[2]) * k; G.ball[1] = 1.2 + Math.sin(Math.PI * k) * 0.5;
      if (k >= 1) { G.owner = G.to; G.phase = 'play'; G.t = 0; G.dur = 1.5 + r() * 3; G.planned = false; }
    } else if (G.phase === 'shoot') {
      owner.s = Math.min(1, G.t / 1.15);
      if (owner.s < 0.62) { G.ball[0] = owner.x; G.ball[2] = owner.z; G.ball[1] = 1.0 + 1.7 * ss(0.15, 0.6, owner.s) * owner.scale; G.rel = null; }
      else {
        if (!G.rel) G.rel = { x: G.ball[0], y: G.ball[1], z: G.ball[2], t: G.t, aim: G.made ? [H[0], H[2]] : [H[0] + (r() - 0.5) * 0.7, H[2] + (r() - 0.5) * 0.7] };
        const k = Math.min(1, (G.t - G.rel.t) / 1.0), apex = Math.max(G.rel.y, H[1]) + 1.3;
        G.ball[0] = G.rel.x + (G.rel.aim[0] - G.rel.x) * k; G.ball[2] = G.rel.z + (G.rel.aim[1] - G.rel.z) * k;
        G.ball[1] = (1 - k) * (1 - k) * G.rel.y + 2 * (1 - k) * k * apex + k * k * H[1];
        for (const p of G.players) if (p !== owner) { p.tx = H[0] + (p.x - H[0]) * 0.45; p.tz = H[2] + (p.z - H[2]) * 0.45; }
        if (k >= 1) { owner.mode = 'wait'; G.phase = 'rebound'; G.t = 0; G.fall = { x: G.ball[0], z: G.ball[2], vx: G.made ? 0 : (r() - 0.5) * 3, vz: G.made ? 0 : (G.dir) * (1 + r() * 2), vy: G.made ? -1 : 2.5 }; }
      }
    } else if (G.phase === 'rebound') {
      const f = G.fall; f.vy -= 9.8 * dt; f.x += f.vx * dt; f.z += f.vz * dt; G.ball[0] = f.x; G.ball[2] = f.z; G.ball[1] += f.vy * dt;
      if (G.ball[1] < 0.12) { G.ball[1] = 0.12; f.vy = Math.abs(f.vy) * 0.55; f.vx *= 0.7; f.vz *= 0.7; }
      let best = null, bd = 1e9; for (const p of G.players) { const d = Math.hypot(p.x - f.x, p.z - f.z); if (d < bd) { bd = d; best = p; } p.tx = f.x; p.tz = f.z; }
      if (bd < 0.6 || G.t > 4) { G.owner = G.players.indexOf(best); if (best.team !== G.offense) G.offense = best.team; G.phase = 'play'; G.t = 0; G.dur = 1.5 + r() * 3; G.planned = false;
        for (const p of G.players) { p.tx = p.x; p.tz = p.z; } }
    }
  }
  // ---- morning exercises -------------------------------------------------------------------------------------------------
  function makeDrill(frac, seed) {
    drillers = []; if (frac <= 0) return; const r = rng(seed), rows = 12, cols = 16, n = Math.round(rows * cols * frac);
    for (let i = 0; i < rows * cols && drillers.length < n; i++) {
      const row = i % rows, col = Math.floor(i / rows);           // fill from the front (west) rows
      const p = person(r() < 0.5 ? 'student' : 'sport', 7000 + i * 11 + seed, 'drill'); p.carry = 0;
      p.x = T.cx - 22 + row * 2.6 + (r() - 0.5) * 0.25; p.z = T.cz - 33 + col * 4.4 + (r() - 0.5) * 0.25; p.y = 0; p.yaw = -Math.PI / 2;
      drillers.push(p);
    }
  }
  return {
    set(state, seed, hour) {
      makeRunners(Math.round((state.runners || 0) * (low ? 0.5 : 1)), !!state.pe && hour > 8 && hour < 17, seed);
      makeGames(state.courts || 0, seed + 1);
      makeDrill(state.drill || 0, seed + 2);
      pop.extra = [...runners, ...games.flatMap(g => g.players), ...drillers];
    },
    update(dt, time) {
      for (const p of runners) if (p.kind === 'run') {
        const lap = trackAt(T, p.lane, p.s, tmp); p.s = (p.s + p.v * dt) % lap; p.x = tmp[0]; p.z = tmp[1]; p.y = 0; p.yaw = Math.atan2(tmp[2], tmp[3]);
        p.ph = (p.ph + dt / AN.runCycleTime(p.v / p.scale)) % 1;
      }
      let k = 0;
      for (const G of games) { stepGame(G, dt, time); if (k < 8) { Q.setFromAxisAngle(XAXIS, time * 6); M.compose(P.set(G.ball[0], G.ball[1], G.ball[2]), Q, S1); balls.setMatrixAt(k++, M); } }
      balls.count = k; balls.instanceMatrix.needsUpdate = true;
      pop.drillT = time;
    },
    stats: () => ({ runners: runners.length, games: games.length, drill: drillers.length }),
  };
}
