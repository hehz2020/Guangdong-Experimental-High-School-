// Moving traffic: cars, taxis, buses and electric scooters on the main road north-west of the campus, stopping at a
// signalled crossing and at a bus stop and moving off again; cars on the street before the gate (some stop at the gate
// in the morning to drop pupils); bicycles and now and then a car on the lane between the track and the gymnasium.
//
// ALL IMAGINED: the vehicles are generic (no make, no livery, no lettering, no number plates that could be read), the
// crossing, its signals and the bus stop are invented, as are the amounts of traffic. The main road's lanes follow the
// division landscape.js draws (three lanes and a cycle lane each way, driving on the right).
// Vehicles follow each other with a simple car-following rule (the "intelligent driver model"); they stop for a red
// signal, at the bus stop, and for the viewer standing in their lane. Nothing here collides with anything.
// Cost: one instanced mesh per vehicle part (paint, trim with glass, tyres and lamps), stock materials only.
//
// The parked-looking cars and buses of extras/city.js (its block "traffic on the main road") stand in the same lanes:
// once this module is in use they should be removed there.
import { timed } from '../../life/timing.js';
import * as THREE from 'three';
import { ROAD_LINES } from './landscape.js';
import { signalAt, DROPS } from '../../life/signal.js';

const rnd = s => { let x = s >>> 0 || 1; return () => ((x = (x * 1664525 + 1013904223) >>> 0) / 4294967296); };

// ---- geometry: boxes with bevelled tops, built per vehicle type --------------------------------------------------------
// trim colours by name; the emissive map picks lamp texels by uv
const TRIM = { glass: [0.07, 0.09, 0.11], tyre: [0.05, 0.05, 0.055], black: [0.08, 0.08, 0.09], chrome: [0.6, 0.62, 0.64], head: [1, 0.97, 0.9], tail: [0.75, 0.06, 0.05], amber: [0.95, 0.55, 0.1], white: [0.85, 0.85, 0.83], grey: [0.35, 0.36, 0.38], rider: [0.2, 0.22, 0.28], skin: [0.75, 0.55, 0.42], helmet: [0.85, 0.85, 0.85] };
const EMIT_U = { head: 0.375, tail: 0.625, amber: 0.875 };
class Shape {
  constructor() { this.pos = []; this.nor = []; this.col = []; this.uv = []; this.idx = []; }
  /** Box from x0..x1 (forward), y0..y1, z half-width w; the top shrunk by taper (fraction) front and back for a rounded look. */
  box(x0, x1, y0, y1, w, colour = 'paint', o = {}) {
    const tf = o.tf || 0, tb = o.tb || 0, tw = o.tw || 0, c = colour === 'paint' ? [1, 1, 1] : TRIM[colour], u = EMIT_U[colour] || 0.125;
    const L = x1 - x0, P = [[x0, y0, -w], [x1, y0, -w], [x1, y0, w], [x0, y0, w], [x0 + L * tb, y1, -w * (1 - tw)], [x1 - L * tf, y1, -w * (1 - tw)], [x1 - L * tf, y1, w * (1 - tw)], [x0 + L * tb, y1, w * (1 - tw)]];
    const F = [[0, 1, 2, 3], [7, 6, 5, 4], [0, 4, 5, 1], [1, 5, 6, 2], [2, 6, 7, 3], [3, 7, 4, 0]];
    for (const f of F) {
      const [a, b, cc] = [P[f[0]], P[f[1]], P[f[2]]], ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2], vx = cc[0] - a[0], vy = cc[1] - a[1], vz = cc[2] - a[2];
      let nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx; const l = Math.hypot(nx, ny, nz) || 1; nx /= l; ny /= l; nz /= l;
      const base = this.pos.length / 3; for (const k of f) { this.pos.push(...P[k]); this.nor.push(nx, ny, nz); this.col.push(...c); this.uv.push(u, 0.5); }
      this.idx.push(base, base + 1, base + 2, base, base + 2, base + 3);
    }
    return this;
  }
  /** Wheel: an octagonal disc pair (tyre) across z at (x, r) on side s. */
  wheel(x, r, z, wd = 0.22) {
    const n = 10, base = this.pos.length / 3, c = TRIM.tyre;
    for (const zz of [z - wd / 2, z + wd / 2]) for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; this.pos.push(x + Math.cos(a) * r, r + Math.sin(a) * r, zz); this.nor.push(Math.cos(a), Math.sin(a), 0); this.col.push(...c); this.uv.push(0.125, 0.5); }
    for (let i = 0; i < n; i++) { const a = base + i, b = base + (i + 1) % n, cc = base + n + (i + 1) % n, d = base + n + i; this.idx.push(a, b, cc, a, cc, d); }
    for (const [o, s] of [[0, -1], [n, 1]]) { const cI = this.pos.length / 3; this.pos.push(x, r, z + s * wd / 2); this.nor.push(0, 0, s); this.col.push(...TRIM.grey); this.uv.push(0.125, 0.5);
      for (let i = 0; i < n; i++) { const a = base + o + i, b = base + o + (i + 1) % n; s > 0 ? this.idx.push(cI, a, b) : this.idx.push(cI, b, a); } }
    return this;
  }
  /** Smooth body through stations [x, y bottom, y top, half width at the bottom, half width at the top]: rounded sections, closed ends. */
  loft(st, colour = 'paint', r = 0.12, uvU) {
    const c = colour === 'paint' ? [1, 1, 1] : TRIM[colour], u = uvU ?? (EMIT_U[colour] || 0.125), base = this.pos.length / 3, n = 16;
    const sec = ([x, y0, y1, w0, w1]) => { const pts = [], rr = Math.min(r, (y1 - y0) / 2.2, w1 * 0.9);
      // corners: bottom-left, bottom-right, top-right, top-left (z = width), each a quarter circle of 4 points
      const C = [[-w0 + rr, y0 + rr, Math.PI, 1.5 * Math.PI], [w0 - rr, y0 + rr, 1.5 * Math.PI, 2 * Math.PI], [w1 - rr, y1 - rr, 0, 0.5 * Math.PI], [-w1 + rr, y1 - rr, 0.5 * Math.PI, Math.PI]];
      for (const [cz, cy, a0, a1] of C) for (let i = 0; i < 4; i++) { const a = a0 + (a1 - a0) * i / 3; pts.push([x, cy + Math.sin(a) * rr, cz + Math.cos(a) * rr, Math.cos(a), Math.sin(a)]); }
      return pts; };
    const rings = st.map(sec);
    rings.forEach((ring, k) => { const dx = k === 0 ? -0.5 : k === rings.length - 1 ? 0.5 : 0; for (const [x, y, z, nz, ny] of ring) { const l = Math.hypot(nz, ny, dx) || 1; this.pos.push(x, y, z); this.nor.push(dx / l, ny / l, nz / l); this.col.push(...c); this.uv.push(u, 0.5); } });
    for (let k = 0; k < rings.length - 1; k++) for (let i = 0; i < n; i++) { const a = base + k * n + i, b = base + k * n + (i + 1) % n, cc = base + (k + 1) * n + (i + 1) % n, d = base + (k + 1) * n + i; this.idx.push(a, cc, b, a, d, cc); }
    for (const [k, dir] of [[0, -1], [rings.length - 1, 1]]) { const ci = this.pos.length / 3, [x, y0, y1] = st[k]; this.pos.push(x + dir * 0.02, (y0 + y1) / 2, 0); this.nor.push(dir, 0, 0); this.col.push(...c); this.uv.push(u, 0.5);
      for (let i = 0; i < n; i++) { const a = base + k * n + i, b = base + k * n + (i + 1) % n; dir > 0 ? this.idx.push(ci, b, a) : this.idx.push(ci, a, b); } }
    return this;
  }
  geo() {
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(this.pos, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(this.nor, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(this.col, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(this.uv, 2)); g.setIndex(this.idx); g.computeBoundingSphere(); return g;
  }
}
/** paint (tinted per vehicle) and trim (glass, tyres, lamps) geometries of each kind; vehicles face +x, length along x. */
export function vehicleGeometries() {
  const out = {};
  // saloon: also the taxi, which carries a roof sign; a lofted body, a dark glasshouse, a roof, lamps, black bumpers and wheel arches
  { const p = new Shape(), t = new Shape(), L = 4.6;
    p.loft([[-2.3, 0.36, 0.66, 0.8, 0.76], [-2.22, 0.3, 0.83, 0.87, 0.84], [-1.9, 0.27, 0.88, 0.89, 0.86], [-1.0, 0.26, 0.9, 0.9, 0.87], [0.8, 0.26, 0.88, 0.9, 0.87], [1.65, 0.28, 0.79, 0.89, 0.84], [2.18, 0.31, 0.66, 0.85, 0.78], [2.3, 0.37, 0.56, 0.79, 0.72]], 'paint', 0.14)
      .loft([[-1.22, 1.35, 1.43, 0.69, 0.64], [0.3, 1.37, 1.45, 0.7, 0.65]], 'paint', 0.03);
    t.loft([[-1.62, 0.86, 0.9, 0.84, 0.83], [-1.32, 0.86, 1.36, 0.84, 0.69], [-0.3, 0.88, 1.43, 0.85, 0.69], [0.45, 0.88, 1.41, 0.85, 0.69], [1.12, 0.87, 0.93, 0.85, 0.83]], 'glass', 0.08)
      .box(L / 2 - 0.12, L / 2 + 0.01, 0.58, 0.7, 0.8, 'head', { tf: 0.4 }).box(-L / 2 - 0.01, -L / 2 + 0.1, 0.62, 0.75, 0.8, 'tail', { tb: 0.4 })
      .box(L / 2 - 0.16, L / 2 + 0.04, 0.27, 0.45, 0.88, 'black').box(-L / 2 - 0.04, -L / 2 + 0.16, 0.27, 0.45, 0.88, 'black');
    for (const x of [-1.42, 1.38]) { t.box(x - 0.42, x + 0.42, 0.2, 0.74, 0.905, 'black', { tf: 0.3, tb: 0.3 }); for (const z of [-0.79, 0.79]) t.wheel(x, 0.33, z, 0.2); }
    out.car = { paint: p.geo(), trim: t.geo(), len: L, w: 1.8 }; }
  // SUV / people carrier
  { const p = new Shape(), t = new Shape(), L = 4.75;
    p.loft([[-2.37, 0.42, 0.95, 0.84, 0.82], [-2.3, 0.36, 1.08, 0.9, 0.88], [-1.6, 0.34, 1.1, 0.92, 0.89], [1.2, 0.34, 1.08, 0.92, 0.89], [2.05, 0.36, 0.98, 0.9, 0.84], [2.37, 0.42, 0.8, 0.83, 0.76]], 'paint', 0.14)
      .loft([[-2.28, 1.66, 1.75, 0.8, 0.76], [0.95, 1.68, 1.77, 0.8, 0.76]], 'paint', 0.03);
    t.loft([[-2.31, 1.08, 1.16, 0.87, 0.86], [-2.29, 1.08, 1.68, 0.87, 0.8], [0.9, 1.08, 1.7, 0.88, 0.8], [1.55, 1.07, 1.13, 0.88, 0.86]], 'glass', 0.08)
      .box(L / 2 - 0.12, L / 2 + 0.01, 0.76, 0.9, 0.8, 'head', { tf: 0.4 }).box(-L / 2 - 0.01, -L / 2 + 0.1, 0.88, 1.08, 0.8, 'tail', { tb: 0.4 })
      .box(L / 2 - 0.16, L / 2 + 0.04, 0.32, 0.55, 0.9, 'black').box(-L / 2 - 0.04, -L / 2 + 0.16, 0.32, 0.55, 0.9, 'black');
    for (const x of [-1.5, 1.45]) { t.box(x - 0.47, x + 0.47, 0.22, 0.86, 0.925, 'black', { tf: 0.3, tb: 0.3 }); for (const z of [-0.8, 0.8]) t.wheel(x, 0.37, z, 0.24); }
    out.suv = { paint: p.geo(), trim: t.geo(), len: L, w: 1.86 }; }
  // city bus
  { const p = new Shape(), t = new Shape(), L = 11.6, W = 1.27;
    p.loft([[-L / 2, 0.38, 2.98, W - 0.03, W - 0.07], [-L / 2 + 0.06, 0.34, 3.06, W, W - 0.03], [L / 2 - 0.08, 0.34, 3.06, W, W - 0.03], [L / 2, 0.4, 2.96, W - 0.03, W - 0.08]], 'paint', 0.2);
    t.box(-L / 2 + 0.3, L / 2 - 0.05, 1.25, 2.5, W + 0.015, 'glass').box(L / 2 - 0.05, L / 2 + 0.03, 1.1, 2.7, W - 0.12, 'glass').box(-L / 2 - 0.03, -L / 2 + 0.05, 1.6, 2.6, W - 0.15, 'glass')
      .box(-L / 2, L / 2, 2.55, 3.0, W + 0.012, 'white').box(L / 2 - 0.02, L / 2 + 0.04, 0.6, 0.8, 1.05, 'head').box(-L / 2 - 0.04, -L / 2 + 0.02, 0.7, 1.0, 1.1, 'tail')
      .box(3.4, 4.6, 0.4, 2.45, W + 0.02, 'black').box(-1.2, 0.0, 0.4, 2.45, W + 0.02, 'black');
    for (const x of [-3.7, 3.5]) for (const z of [-1.05, 1.05]) t.wheel(x, 0.5, z, 0.3);
    out.bus = { paint: p.geo(), trim: t.geo(), len: L, w: 2.55 }; }
  // electric scooter with its rider (a helmet, a dark jacket), all in trim colours; and a bicycle with a rider
  { const p = new Shape(), t = new Shape();
    p.box(-0.6, 0.6, 0.25, 0.55, 0.2, 'paint', { tf: 0.2, tb: 0.1 }).box(0.45, 0.65, 0.5, 1.05, 0.12, 'paint');
    t.wheel(-0.62, 0.24, 0, 0.1).wheel(0.68, 0.24, 0, 0.1).box(0.5, 0.58, 1.0, 1.06, 0.36, 'black')
      .box(-0.35, 0.05, 0.6, 0.72, 0.16, 'rider').box(-0.28, 0.08, 0.72, 1.32, 0.2, 'rider', { tf: 0.25 }).box(-0.18, 0.04, 1.33, 1.56, 0.11, 'helmet', { tf: 0.25, tb: 0.25, tw: 0.2 })
      .box(-0.05, 0.4, 0.35, 0.68, 0.18, 'grey').box(0.0, 0.5, 1.12, 1.22, 0.24, 'rider').box(0.6, 0.7, 0.78, 0.88, 0.07, 'head');
    out.scooter = { paint: p.geo(), trim: t.geo(), len: 1.8, w: 0.7 }; }
  { const p = new Shape(), t = new Shape();
    p.box(-0.45, 0.45, 0.48, 0.55, 0.025, 'paint').box(-0.05, 0.02, 0.45, 0.9, 0.025, 'paint').box(0.42, 0.48, 0.4, 1.0, 0.025, 'paint');
    t.wheel(-0.52, 0.34, 0, 0.05).wheel(0.55, 0.34, 0, 0.05).box(0.42, 0.5, 1.0, 1.04, 0.28, 'black')
      .box(-0.2, 0.08, 0.92, 1.0, 0.12, 'rider').box(-0.16, 0.14, 0.98, 1.55, 0.17, 'rider', { tf: 0.4 }).box(-0.08, 0.12, 1.55, 1.78, 0.1, 'skin', { tf: 0.2, tb: 0.2 })
      .box(-0.1, 0.2, 0.35, 0.95, 0.12, 'rider').box(0.1, 0.45, 1.3, 1.38, 0.2, 'skin');
    out.bike = { paint: p.geo(), trim: t.geo(), len: 1.7, w: 0.6 }; }
  // taxi roof sign
  { const t = new Shape(); t.box(-0.35, 0.35, 1.42, 1.6, 0.28, 'amber', { tf: 0.2, tb: 0.2 }); out.sign = { trim: t.geo() }; }
  return out;
}
function emissiveMap() {
  const c = document.createElement('canvas'); c.width = 4; c.height = 1; const g = c.getContext('2d');
  [['#000', 0], ['#fff', 1], ['#f22', 2], ['#fa3', 3]].forEach(([f, i]) => { g.fillStyle = f; g.fillRect(i, 0, 1, 1); });
  const t = new THREE.CanvasTexture(c); t.magFilter = t.minFilter = THREE.NearestFilter; t.colorSpace = THREE.SRGBColorSpace; return t;
}

const PAINT = [0xf2f2f0, 0xf2f2f0, 0xf0efea, 0xf4f4f2, 0x1d1e21, 0x16171a, 0xb9bcc0, 0x9a9da2, 0x6f7377, 0x2b3f63, 0x8c2a24, 0xc9bfa6, 0x37404a];
const TAXI = [0x3f8fd0, 0x3f8fd0, 0x5da64a];            // generic taxi colours, no livery
const BUS = [0x3f8f4a, 0x2f6fb0, 0x3f8f4a];
const SCOOT = [0xe9e6de, 0x2c2e33, 0xb83a32, 0x3a6fb0, 0x9fa3a8, 0xe0c050, 0x6fb0a0];

export function build(ctx) {
  const low = !!ctx.lowPower, K = vehicleGeometries(), group = new THREE.Group(); group.name = 'moving-traffic'; ctx.add(group);
  const paintMat = new THREE.MeshStandardMaterial({ roughness: 0.32, metalness: 0.45, envMapIntensity: 1.1 }); paintMat.name = 'life-carpaint';
  const trimMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.4, metalness: 0.2, emissive: 0xffffff, emissiveMap: emissiveMap(), emissiveIntensity: 0 }); trimMat.name = 'life-cartrim';
  trimMat.userData.glow = false;                                                    // the lighting module must not take these for lamps of its own
  const CAP = { car: low ? 30 : 70, suv: low ? 14 : 30, bus: low ? 4 : 8, scooter: low ? 10 : 26, bike: low ? 6 : 14, sign: low ? 8 : 16 };
  const meshes = {};
  for (const k of ['car', 'suv', 'bus', 'scooter', 'bike']) {
    const P = new THREE.InstancedMesh(K[k].paint, paintMat, CAP[k]), T = new THREE.InstancedMesh(K[k].trim, trimMat, CAP[k]);
    P.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(CAP[k] * 3).fill(1), 3);
    for (const m of [P, T]) { m.count = 0; m.frustumCulled = false; m.castShadow = false; m.receiveShadow = true; m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); group.add(m); }
    P.name = 'traffic-' + k + '-paint'; T.name = 'traffic-' + k + '-trim'; meshes[k] = { P, T };
  }
  const sign = new THREE.InstancedMesh(K.sign.trim, trimMat, CAP.sign); sign.count = 0; sign.frustumCulled = false; sign.name = 'traffic-taxi-signs'; group.add(sign);

  // ---- lanes ---------------------------------------------------------------------------------------------------------------
  // a lane: polyline, cumulative length, kinds of vehicles, a rate (vehicles per minute), stops (signal, bus stop)
  const lanes = [];
  const polyline = pts => { const cum = [0]; for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1])); return { pts, cum, len: cum[cum.length - 1] }; };
  const offset = (pts, d) => pts.map((p, i) => { const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)], dx = b[0] - a[0], dz = b[1] - a[1], l = Math.hypot(dx, dz) || 1; return [p[0] - dz / l * d, p[1] + dx / l * d]; });
  const art = ROAD_LINES.find(r => r.kind === 'arterial');
  // the crossing and the bus stops on the main road: at the point of the road nearest the campus centre
  let crossS = 0;
  if (art) {
    const ab = [art.points[0], art.points[art.points.length - 1]], d = [ab[1][0] - ab[0][0], ab[1][1] - ab[0][1]], len = Math.hypot(...d), u = [d[0] / len, d[1] / len];
    const sNear = ((60 - ab[0][0]) * u[0] + (-60 - ab[0][1]) * u[1]);                  // nearest to the campus centre
    const s0 = Math.max(0, sNear - 520), s1 = Math.min(len, sNear + 520);
    const at = s => [ab[0][0] + u[0] * s, ab[0][1] + u[1] * s], fwd = [at(s0), at(s1)], back = [at(s1), at(s0)];
    crossS = sNear - s0;
    // driving on the right: offset(points, +d) is the right-hand side of the direction of travel; lane offsets as landscape.js draws them
    for (const [pts, dir] of [[fwd, 1], [back, -1]]) {
      const cross = dir > 0 ? crossS - 7 : (s1 - s0) - crossS - 7;                 // stop line 7 m before the crossing's centre
      [[3.3, 'mix', 11], [6.9, 'mix', 10], [10.5, 'kerb', 8], [14.4, 'cycle', 5]].forEach(([o, mix, rate], li) => {
        const pl = polyline(offset(pts, o));
        lanes.push({ ...pl, mix, rate: rate * (low ? 0.4 : 1), v0: mix === 'cycle' ? 6.5 : 15 - li * 0.8, stops: [{ s: cross, signal: true }, ...(mix === 'kerb' ? [{ s: cross + 70, bus: true }] : [])], cars: [], acc: Math.random() * 3, name: 'main' + dir + li });
      });
    }
  }
  // the street before the gate: the canal road north part, the gate's own street, the south part (two lanes)
  const rn = ROAD_LINES.find(r => r.id === 'road-canal-north'), rs = ROAD_LINES.find(r => r.id === 'road-canal-south');
  if (rn && rs) {
    const south = [...rn.points, [271.2, -40], [271, 0], ...rs.points.slice(0)], north = south.slice().reverse();
    const gateS = polyline(south); let sg = 0; for (let i = 1; i < south.length; i++) if (south[i][1] >= -20) { sg = gateS.cum[i - 1] + (-20 - south[i - 1][1]) / (south[i][1] - south[i - 1][1]) * (gateS.cum[i] - gateS.cum[i - 1]); break; }
    lanes.push({ ...polyline(offset(south, 1.75)), mix: 'street', rate: 2.2 * (low ? 0.5 : 1), v0: 9, stops: [{ s: sg - 3, drop: true }], cars: [], acc: 0, name: 'streetS' });
    lanes.push({ ...polyline(offset(north, 1.75)), mix: 'street', rate: 2.2 * (low ? 0.5 : 1), v0: 9, stops: [{ s: gateS.len - sg - 9, drop: true }], cars: [], acc: 1, name: 'streetN' });
  }
  // the lane between the track and the gymnasium: bicycles both ways, now and then a car going north (east half of the lane)
  const lt = ROAD_LINES.find(r => r.id === 'road-track-east');
  if (lt) {
    const x = lt.points[0][0], a = lt.points[0][1] + 2, b = lt.points[1][1] - 2;
    lanes.push({ ...polyline([[x + 1.9, b], [x + 1.9, a]]), mix: 'campus', rate: 0.9 * (low ? 0.5 : 1), v0: 6, stops: [], cars: [], acc: 0.5, name: 'laneN' });
    lanes.push({ ...polyline([[x + 0.6, a], [x + 0.6, b]]), mix: 'bike', rate: 0.6 * (low ? 0.5 : 1), v0: 4.5, stops: [], cars: [], acc: 0.2, name: 'laneS' });
  }
  const pointAt = (L, s, out) => { let i = 1; while (i < L.pts.length - 1 && L.cum[i] < s) i++; const a = L.pts[i - 1], b = L.pts[i], t = (s - L.cum[i - 1]) / ((L.cum[i] - L.cum[i - 1]) || 1);
    out[0] = a[0] + (b[0] - a[0]) * t; out[1] = a[1] + (b[1] - a[1]) * t; out[2] = Math.atan2(-(b[1] - a[1]), b[0] - a[0]); return out; };

  let seed = 7, hour = 9;
  const R = rnd(4242);
  function kindFor(mix) {
    const r = R();
    if (mix === 'cycle') return r < 0.75 ? 'scooter' : 'bike';
    if (mix === 'bike') return 'bike';
    if (mix === 'campus') return r < 0.25 ? 'car' : 'bike';
    if (mix === 'street') return r < 0.75 ? 'car' : 'suv';
    if (mix === 'kerb') return r < 0.16 ? 'bus' : r < 0.55 ? 'car' : r < 0.75 ? 'suv' : 'scooter';
    return r < 0.66 ? 'car' : r < 0.97 ? 'suv' : 'bus';
  }
  function newVehicle(L, s, v) {
    const k = kindFor(L.mix), taxi = k === 'car' && R() < 0.22, colour = k === 'bus' ? BUS[Math.floor(R() * BUS.length)] : k === 'scooter' || k === 'bike' ? SCOOT[Math.floor(R() * SCOOT.length)] : taxi ? TAXI[Math.floor(R() * TAXI.length)] : PAINT[Math.floor(R() * PAINT.length)];
    return { k, taxi, colour: new THREE.Color(colour), s, v, len: K[k].len, v0: L.v0 * (k === 'bus' ? 0.85 : k === 'scooter' ? 0.75 : 0.9 + 0.2 * R()), wait: 0, served: new Set(), drop: L.mix === 'street' && hour > 6.5 && hour < 7.8 && R() < 0.6 };
  }
  // fill the lanes as if traffic had been running
  function prime() {
    for (const L of lanes) { L.cars = []; let s = L.len - 5; const gap = L.mix === 'campus' || L.mix === 'bike' ? 120 : L.mix === 'street' ? 60 : 28;
      while (s > 0) { const c = newVehicle(L, s, L.v0 * 0.8); L.cars.unshift(c); s -= c.len + gap * (0.5 + R()) * busy(); }
      L.cars.sort((a, b) => b.s - a.s); }
  }
  // how busy the roads are by the hour: rush hours, quiet at night (imagined)
  const busy = () => (hour < 6 ? 0.25 : hour < 7 ? 0.7 : hour < 9 ? 1.3 : hour < 17 ? 1 : hour < 19.5 ? 1.25 : hour < 22 ? 0.8 : 0.35);

  const IDM = { a: 1.4, b: 2.2, s0: 2.2, T: 1.2 };
  const tmp = [0, 0, 0], M = new THREE.Matrix4(), Q = new THREE.Quaternion(), V = new THREE.Vector3(), S1 = new THREE.Vector3(1, 1, 1), Y = new THREE.Vector3(0, 1, 0), frustum = new THREE.Frustum(), PV = new THREE.Matrix4(), sph = new THREE.Sphere(new THREE.Vector3(), 6);
  let first = true;
  ctx.animate(timed('traffic', (dt, seconds, env) => {
    if (!env || !env.camera) return;
    const L0 = env.lighting, h = L0 && L0.getTime ? L0.getTime() : 9, night = L0 && L0.night ? L0.night() : 0;
    if (first || Math.abs(h - hour) > 0.25) { hour = h; prime(); first = false; } hour = h;
    const sig = signalAt(seconds), cam = env.camera.position;
    for (const L of lanes) {
      // new vehicles at the start of the lane
      L.acc += dt * L.rate * busy() / 60;
      if (L.acc >= 1) { const last = L.cars[L.cars.length - 1]; if (!last || last.s > last.len + 12) { L.cars.push(newVehicle(L, 0, L.v0 * 0.8)); L.acc -= 1; } else L.acc = 1; }
      for (let i = 0; i < L.cars.length; i++) {
        const c = L.cars[i], lead = L.cars[i - 1];
        let gap = lead ? lead.s - lead.len / 2 - (c.s + c.len / 2) : 1e9, dv = lead ? c.v - lead.v : 0;
        // stops: a red or amber signal (if it can still stop), the bus stop for buses, the gate for cars dropping pupils
        for (const st of L.stops) {
          const ds = st.s - (c.s + c.len / 2); if (ds < -1 || ds > 120) continue;
          let stop = false;
          if (st.signal && !sig.carsGo && (ds > c.v * c.v / (2 * 4) || c.v < 1)) stop = true;
          if (st.bus && c.k === 'bus' && !c.served.has(st)) stop = true;
          if (st.drop && c.drop && !c.served.has(st)) stop = true;
          if (stop && ds < gap) { gap = Math.max(0.01, ds); dv = c.v; }
          if (stop && ds < 1.5 && c.v < 0.3 && st.drop && c.wait === 0 && DROPS.length < 8) { pointAt(L, c.s, tmp); const fx = Math.cos(tmp[2]), fz = -Math.sin(tmp[2]); DROPS.push({ x: tmp[0] - fz * 1.5, z: tmp[1] + fx * 1.5, n: 1 + (R() < 0.3 ? 1 : 0) }); }
          if (stop && ds < 1.5 && c.v < 0.3 && (st.bus || st.drop)) { c.wait += dt; if (c.wait > (st.bus ? 14 : 6)) { c.served.add(st); c.wait = 0; } }
        }
        // the viewer standing in the lane (within 1.7 m of its line, on the ground)
        pointAt(L, Math.min(L.len, c.s + c.len / 2 + 8), tmp);
        if (cam.y < 4) { const fx = Math.cos(tmp[2]), fz = -Math.sin(tmp[2]); pointAt(L, c.s, tmp); const dx = cam.x - tmp[0], dz = cam.z - tmp[1], ahead = dx * fx + dz * fz, side = Math.abs(-dx * fz + dz * fx);
          if (ahead > 0 && ahead < 30 && side < 2.3) { const d = ahead - c.len / 2 - 1.2; if (d < gap) { gap = Math.max(0.01, d); dv = c.v; } } }
        const sStar = IDM.s0 + Math.max(0, c.v * IDM.T + c.v * dv / (2 * Math.sqrt(IDM.a * IDM.b))), acc = IDM.a * (1 - Math.pow(c.v / c.v0, 4) - (sStar / Math.max(0.1, gap)) ** 2);
        c.v = Math.max(0, c.v + Math.max(-7, acc) * dt); c.s += c.v * dt;
      }
      while (L.cars.length && L.cars[0].s > L.len) L.cars.shift();
    }
    // draw: everything within 360 m in view
    const cx = cam.x, cz = cam.z, Rm = low ? 220 : 360; env.camera.updateMatrixWorld(); PV.multiplyMatrices(env.camera.projectionMatrix, env.camera.matrixWorldInverse); frustum.setFromProjectionMatrix(PV);
    const n = { car: 0, suv: 0, bus: 0, scooter: 0, bike: 0 }; let ns = 0;
    for (const L of lanes) for (const c of L.cars) {
      pointAt(L, c.s, tmp); const dx = tmp[0] - cx, dz = tmp[1] - cz; if (dx * dx + dz * dz > Rm * Rm) continue;
      sph.center.set(tmp[0], 1, tmp[1]); sph.radius = c.len; if (!frustum.intersectsSphere(sph)) continue;
      const m = meshes[c.k]; if (n[c.k] >= CAP[c.k]) continue;
      Q.setFromAxisAngle(Y, tmp[2]); M.compose(V.set(tmp[0], 0.02, tmp[1]), Q, S1);
      m.P.setMatrixAt(n[c.k], M); m.T.setMatrixAt(n[c.k], M); m.P.instanceColor.setXYZ(n[c.k], c.colour.r, c.colour.g, c.colour.b); n[c.k]++;
      if (c.taxi && ns < CAP.sign) sign.setMatrixAt(ns++, M);
    }
    for (const k in meshes) { const m = meshes[k]; m.P.count = m.T.count = n[k]; m.P.instanceMatrix.needsUpdate = m.T.instanceMatrix.needsUpdate = true; m.P.instanceColor.needsUpdate = true; }
    sign.count = ns; sign.instanceMatrix.needsUpdate = true;
    trimMat.emissiveIntensity = 0.15 + 2.2 * night;
    sigLamps.update(sig, night);
  }));

  // ---- the crossing: zebra stripes, four signal posts with lamps for cars and people ------------------------------------
  const sigLamps = { update() {} };
  if (art) {
    const ab = [art.points[0], art.points[art.points.length - 1]], d = [ab[1][0] - ab[0][0], ab[1][1] - ab[0][1]], len = Math.hypot(...d), u = [d[0] / len, d[1] / len], nrm = [-u[1], u[0]];
    const sNear = ((60 - ab[0][0]) * u[0] + (-60 - ab[0][1]) * u[1]), c0 = [ab[0][0] + u[0] * sNear, ab[0][1] + u[1] * sNear], ang = Math.atan2(-u[1], u[0]);
    const stripes = new Shape(); for (let o = -15.9; o <= 15.95; o += 1.0) { if (Math.abs(o) < 1.7) continue; stripes.box(-2.5, 2.5, 0.03, 0.035, 0.22, 'white'); stripes.pos.splice(stripes.pos.length - 72, 72, ...stripes.pos.slice(-72).map((v, i) => (i % 3 === 2 ? v + o : v))); }
    const zm = new THREE.Mesh(stripes.geo(), new THREE.MeshStandardMaterial({ color: 0xe9e6dc, roughness: 0.7, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -6 }));
    zm.material.name = 'life-zebra'; zm.position.set(c0[0], 0, c0[1]); zm.rotation.y = ang; zm.renderOrder = 45; zm.receiveShadow = true; group.add(zm);
    const posts = new Shape(), lampPos = [];
    for (const [o, f] of [[17.6, -1], [0.3, -1], [-17.6, 1], [-0.3, 1]]) {             // forward traffic keeps to local +z and meets its posts at x < 0
      const x = f * 2.9, z = o; posts.box(x - 0.08, x + 0.08, 0, 4.2, 0.08, 'grey').box(x - 0.2, x + 0.2, 3.1, 4.1, 0.16, 'black').box(x - 0.15, x + 0.15, 1.9, 2.5, 0.13, 'black');
      posts.pos.splice(posts.pos.length - 72 * 3, 72 * 3, ...posts.pos.slice(-72 * 3).map((v, i) => (i % 3 === 2 ? v + z : v)));
      lampPos.push([x + f * 0.21, 3.85, z, 'car-red'], [x + f * 0.21, 3.35, z, 'car-green'], [x - f * 0.16, 2.35, z, 'walk-red'], [x - f * 0.16, 2.05, z, 'walk-green']);
    }
    const pm = new THREE.Mesh(posts.geo(), trimMat); pm.position.copy(zm.position); pm.rotation.y = ang; pm.castShadow = true; group.add(pm);
    const lampMat = new THREE.MeshBasicMaterial({ color: 0xffffff }); lampMat.name = 'life-signal-lamps';
    const lamps = new THREE.InstancedMesh(new THREE.SphereGeometry(0.09, 8, 6), lampMat, lampPos.length); lamps.name = 'traffic-signal-lamps';
    const base = new THREE.Matrix4().makeRotationY(ang).setPosition(c0[0], 0, c0[1]); lampPos.forEach((p, i) => lamps.setMatrixAt(i, new THREE.Matrix4().makeTranslation(p[0], p[1], p[2]).premultiply(base)));
    lamps.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(lampPos.length * 3), 3); group.add(lamps);
    const on = { 'car-red': [1, 0.12, 0.08], 'car-green': [0.2, 1, 0.45], 'walk-red': [1, 0.12, 0.08], 'walk-green': [0.2, 1, 0.45] }, off = 0.07;
    sigLamps.update = sig => { lampMat.color.setRGB(1, 1, 1);                      // the lighting module dims unlit materials by night; these are lamps
      lampPos.forEach((p, i) => { const lit = p[3] === 'car-red' ? !sig.carsGo : p[3] === 'car-green' ? sig.carsGo : p[3] === 'walk-green' ? sig.walk : !sig.walk; const c = on[p[3]];
      lamps.instanceColor.setXYZ(i, lit ? c[0] : c[0] * off, lit ? c[1] : c[1] * off, lit ? c[2] : c[2] * off); }); lamps.instanceColor.needsUpdate = true; };
    if (typeof window !== 'undefined') window.__crossing = { x: c0[0], z: c0[1], ang };
  }
  if (typeof window !== 'undefined') window.__traffic = { lanes, stats: () => lanes.map(L => [L.name, L.cars.length]) };
}
