// The athletics field: the 400 m track with its markings, the football pitch inside it and the field-event areas.
// world/index.js used to draw the bare track; this module replaces that.
//
// FROM THE DATA: a standard 400 m, 8-lane oval (straights 84.39 m, inner radius 36.5 m, lanes 1.22 m), the measured
// rectangle of infield grass, long axis north-south. The grandstand is on the west side, so the west straight is the home
// straight: races run anticlockwise and finish at its south end.
//
// IMAGINED (painted as on any standard track; nothing here was read off a reference):
//   - every marking: lane lines, the finish line, the staggered 400 m and 200 m starts, the 100 m and 110 m hurdles
//     starts with their lane numbers, the football pitch (68 x 105 m) and its mowing stripes;
//   - the straight extension ("chute") at the north end of the home straight that the 100 m start needs;
//   - the kerb and drain round the inside, goals with nets, corner flags, hurdles, the high-jump and shot-put areas,
//     the long-jump runway and pits, benches.
import * as THREE from 'three';
import { mat } from '../../kit.js';
import { Batch } from '../../batch.js';
import { pbr, plain, SURFACES, rng } from '../../hifi.js';
import { flatPoly, rect, arc, ribbon, strips, patch, stripMesh, clipZ } from '../../shapes.js';

const CHUTE = 29;                                     // metres of straight beyond the north end of the home straight
/** Ground the field needs beyond the oval, in world coordinates [[x, z]...]: the landscape keeps trees out of it. */
export function fieldKeepOut(t) { const R = t.outerRadius, hs = t.straight / 2; return rect(t.cx - R - 2.5, t.cz - hs - CHUTE - 2, t.cx - t.innerRadius + 1.5, t.cz - hs + 1); }

/** Half-oval path helpers. Points of the oval at radius r, n per bend, anticlockwise seen from above starting at the south end of the west straight. */
function oval(t, r, n = 96) {
  const hs = t.straight / 2, p = [];
  for (let i = 0; i <= n; i++) { const a = Math.PI * i / n; p.push([t.cx - r * Math.cos(a), t.cz + hs + r * Math.sin(a)]); }       // south bend, west to east
  for (let i = 0; i <= n; i++) { const a = Math.PI * i / n; p.push([t.cx + r * Math.cos(a), t.cz - hs - r * Math.sin(a)]); }       // north bend, east to west
  return p;
}

export function build(ctx) {
  const t = ctx.campus.track, f = t.infield, hs = t.straight / 2, R0 = t.innerRadius, LW = t.laneWidth, N = t.lanes, R = t.outerRadius, low = !!ctx.lowPower;
  const add = o => ctx.add(o), v = new Batch(), c = new Batch(), rnd = rng(4001);
  const rubber = mat('trackRed'), green = mat('apronGreen');
  const paint = plain('linepaint', 0xf1efe8, 0.62, 0), yellowPaint = plain('linepaint-yellow', 0xe3b52a, 0.62, 0);

  // ---------------- surfaces ----------------
  const xW = t.cx - R, zN = t.cz - hs;                                                      // west edge of the track, north end of the straights
  add(flatPoly(oval(t, R + 3.5).map(([x, z]) => [Math.min(x, t.cx + R + 0.9), z]), 0.02, green, { order: 1 }));     // apron (cut back on the east: a road runs along the kerb)
  add(flatPoly(rect(xW - 1.6, zN - CHUTE - 1.2, t.cx - R0 + 0.9, zN + 0.5), 0.022, green, { order: 1 }));          // apron round the chute
  add(flatPoly(oval(t, R), 0.04, rubber, { order: 2, offset: -1 }));
  add(flatPoly(rect(xW, zN - CHUTE, t.cx - R0, zN + 0.3), 0.041, rubber, { order: 2, offset: -1 }));                // the chute
  // infield grass in mown bands: the measured rectangle with its corners clipped by the bends
  const clamp = (q, lo, hi) => Math.max(lo, Math.min(hi, q));
  const grassPoly = oval(t, R0 - 0.45).map(([x, z]) => [clamp(x, f.cx - f.sizeX / 2, f.cx + f.sizeX / 2), clamp(z, f.cz - f.sizeZ / 2, f.cz + f.sizeZ / 2)]);
  const turfA = pbr('turf', [0x4f8f3f, 3.1]), turfB = pbr('turf', [0x5fa14a, 3.1]), bands = 18, z0 = f.cz - f.sizeZ / 2, bw = f.sizeZ / bands;
  for (let i = 0; i < bands; i++) { const part = clipZ(grassPoly, z0 + i * bw, z0 + (i + 1) * bw); if (part.length >= 3) add(flatPoly(part, 0.06, i % 2 ? turfA : turfB, { order: 3, offset: -2 })); }

  // ---------------- track markings ----------------
  const L = strips(), W = 0.05, y = 0.075;
  for (let i = 0; i <= N; i++) {
    ribbon(oval(t, R0 + i * LW), W, y, L, true);
    ribbon([[t.cx - R0 - i * LW, zN], [t.cx - R0 - i * LW, zN - CHUTE]], W, y, L);                                          // lanes of the chute
  }
  const lane = n => [R0 + (n - 1) * LW, R0 + n * LW], run = n => R0 + (n - 1) * LW + (n === 1 ? 0.3 : 0.2);                   // edges and measuring line of lane n
  const across = (z, x0, x1, w = W) => patch([[x0, z - w / 2], [x1, z - w / 2], [x1, z + w / 2], [x0, z + w / 2]], y, L);
  const zFinish = t.cz + hs, z100 = zFinish - 100, z110 = zFinish - 110;
  across(zFinish, t.cx - R - 0.1, t.cx - R0 + 0.1, 0.05);                                                                  // finish (also the 400 m start of lane 1)
  across(z100, xW, t.cx - R0); across(z110, xW, t.cx - R0);                                                                // 100 m and 110 m hurdles starts
  for (const z of [zFinish - 1, zFinish - 3, zFinish - 5]) for (let n = 1; n <= N; n++) across(z, t.cx - lane(n)[1] + 0.25, t.cx - lane(n)[1] + 0.33, 0.4);   // ticks before the finish
  // a line across one lane on a bend, at the angle th from the start of that bend; returns its middle and th
  const radial = (centreZ, sign, th, r0, r1) => { const P = r => [t.cx - sign * r * Math.cos(th), centreZ + sign * r * Math.sin(th)], qx = sign * Math.sin(th) * W / 2, qz = sign * Math.cos(th) * W / 2, a = P(r0), b = P(r1);
    patch([[a[0] - qx, a[1] - qz], [b[0] - qx, b[1] - qz], [b[0] + qx, b[1] + qz], [a[0] + qx, a[1] + qz]], y, L); return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, th]; };
  const starts400 = [], starts200 = [];
  for (let n = 2; n <= N; n++) {
    const d = (n - 1) * LW - 0.1, [r0, r1] = lane(n);
    starts400.push([n, ...radial(t.cz + hs, 1, 2 * Math.PI * d / run(n), r0, r1)]);                                           // on the south bend, measured from the finish
    starts200.push([n, ...radial(t.cz - hs, -1, Math.PI * d / run(n), r0, r1)]);                                              // on the north bend, measured from the end of the east straight
  }
  across(t.cz - hs, t.cx + lane(1)[0], t.cx + lane(1)[1]);                                                                   // 200 m start of lane 1
  add(stripMesh(L, paint, { order: 5, offset: -4 }));
  // lane numbers: one strip of digits, painted on the ground so that a runner on the line reads them
  { const cv = document.createElement('canvas'); cv.width = 8 * 64; cv.height = 96; const g = cv.getContext('2d'); g.fillStyle = '#fff'; g.font = 'bold 84px "Helvetica Neue",Arial,sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    for (let n = 1; n <= 8; n++) g.fillText(String(n), (n - 0.5) * 64, 52);
    const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
    const m = new THREE.MeshStandardMaterial({ map: tex, alphaTest: 0.4, roughness: 0.62, polygonOffset: true, polygonOffsetFactor: -5, polygonOffsetUnits: -10, side: THREE.DoubleSide }); m.name = 'hifi-lanenumbers';
    const pos = [], uv = [], idx = [], nor = [];
    const digit = (n, x, z, dirX, dirZ, h = 0.9) => {                      // dir: the way the runner faces; the digit's top points that way
      const rx = -dirZ, rz = dirX, w = h * 0.62, base = pos.length / 3, u0 = (n - 1) / 8, u1 = n / 8;
      for (const [a, b, uu, vv] of [[-1, -1, u0, 0], [1, -1, u1, 0], [1, 1, u1, 1], [-1, 1, u0, 1]]) { pos.push(x + rx * a * w / 2 + dirX * b * h / 2, y + 0.004, z + rz * a * w / 2 + dirZ * b * h / 2); nor.push(0, 1, 0); uv.push(uu, vv); }
      idx.push(base, base + 1, base + 2, base, base + 2, base + 3);
    };
    for (let n = 1; n <= N; n++) { const xm = t.cx - (lane(n)[0] + lane(n)[1]) / 2; digit(n, xm, z100 - 1.0, 0, 1); digit(n, xm, z110 - 1.0, 0, 1); digit(n, xm, zFinish - 7, 0, 1); }
    for (const [n, x, z, th] of starts400) { const tx = Math.sin(th), tz = Math.cos(th); digit(n, x - tx * 1.0, z - tz * 1.0, tx, tz); }
    for (const [n, x, z, th] of starts200) { const tx = -Math.sin(th), tz = -Math.cos(th); digit(n, x - tx * 1.0, z - tz * 1.0, tx, tz); }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); geo.setIndex(idx);
    const mesh = add(new THREE.Mesh(geo, m)); mesh.renderOrder = 6; mesh.receiveShadow = true; }
  // kerb and drain along the inside of lane 1
  { const K = strips(); ribbon(oval(t, R0 - 0.03), 0.06, 0.1, K, true); add(stripMesh(K, plain('kerb', 0xd7dadc, 0.4, 0.7), { order: 5, offset: -4 }));
    const D = strips(); ribbon(oval(t, R0 - 0.25), 0.3, 0.064, D, true); add(stripMesh(D, plain('drain', 0x3b3d40, 0.7, 0.4), { order: 4, offset: -3 })); }

  // ---------------- football pitch ----------------
  const PW = 68, PL = 105, px0 = f.cx - PW / 2, px1 = f.cx + PW / 2, pz0 = f.cz - PL / 2, pz1 = f.cz + PL / 2, lw = 0.12, P = strips(), py = 0.082;
  const seg = (xa, za, xb, zb) => { const dx = xb - xa, dz = zb - za, l = Math.hypot(dx, dz), ex = dx / l * lw / 2, ez = dz / l * lw / 2; ribbon([[xa - ex, za - ez], [xb + ex, zb + ez]], lw, py, P); };
  const box = (x0, zA, x1, zB) => { seg(x0, zA, x1, zA); seg(x1, zA, x1, zB); seg(x1, zB, x0, zB); seg(x0, zB, x0, zA); };
  box(px0, pz0, px1, pz1); seg(px0, f.cz, px1, f.cz); ribbon(arc(f.cx, f.cz, 9.15, 72), lw, py, P, true);
  ribbon(arc(f.cx, f.cz, 0.11, 16), 0.22, py, P, true);
  for (const s of [-1, 1]) {
    const gz = s < 0 ? pz0 : pz1, into = -s;
    box(f.cx - 20.16, gz, f.cx + 20.16, gz + into * 16.5); box(f.cx - 9.16, gz, f.cx + 9.16, gz + into * 5.5);
    ribbon(arc(f.cx, gz + into * 11, 0.11, 16), 0.22, py, P, true);
    const half = Math.acos(5.5 / 9.15), mid = into > 0 ? Math.PI / 2 : -Math.PI / 2; ribbon(arc(f.cx, gz + into * 11, 9.15, 28, mid - half, mid + half), lw, py, P);
    for (const e of [-1, 1]) { const cxn = e < 0 ? px0 : px1, a0 = e < 0 ? (into > 0 ? 0 : -Math.PI / 2) : (into > 0 ? Math.PI / 2 : Math.PI); ribbon(arc(cxn, gz, 1, 10, a0, a0 + Math.PI / 2), lw, py, P); }
  }
  add(stripMesh(P, paint, { order: 6, offset: -5 }));
  // goals: round posts, a net on a back frame
  const net = (() => { const cv = document.createElement('canvas'); cv.width = cv.height = 64; const g = cv.getContext('2d'); g.strokeStyle = 'rgba(255,255,255,0.95)'; g.lineWidth = 3; g.strokeRect(0, 0, 64, 64);
    const tex = new THREE.CanvasTexture(cv); tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(1 / 0.12, 1 / 0.12); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
    const m = new THREE.MeshStandardMaterial({ map: tex, alphaTest: 0.35, side: THREE.DoubleSide, roughness: 0.8 }); m.name = 'hifi-net'; return m; })();
  const white = plain('goalpost', 0xf6f6f2, 0.4, 0.1);
  for (const s of [-1, 1]) {
    const gz = s < 0 ? pz0 : pz1, out = s;                                   // out: away from the pitch
    for (const e of [-1, 1]) { v.cyl(white, f.cx + e * 3.72, py - 0.02, gz, 0.06, 2.5, 12); v.strut(white, [f.cx + e * 3.72, 2.44, gz], [f.cx + e * 3.72, 0.06, gz + out * 2.0], 0.05); v.frame(0, 0, 0); c.box('generic', f.cx + e * 3.72, 1.25, gz, 0.14, 2.5, 0.14); }
    v.strut(white, [f.cx - 3.78, 2.5, gz], [f.cx + 3.78, 2.5, gz], 0.12); v.strut(white, [f.cx - 3.72, 0.06, gz + out * 2.0], [f.cx + 3.72, 0.06, gz + out * 2.0], 0.05); v.frame(0, 0, 0);
    v.quad(net, [f.cx - 3.72, 2.44, gz], [f.cx + 3.72, 2.44, gz], [f.cx + 3.72, 0.06, gz + out * 2.0], [f.cx - 3.72, 0.06, gz + out * 2.0]);
    for (const e of [-1, 1]) v.quad(net, [f.cx + e * 3.72, 0.06, gz], [f.cx + e * 3.72, 2.44, gz], [f.cx + e * 3.72, 0.06, gz + out * 2.0], [f.cx + e * 3.72, 0.06, gz + out * 1.0]);
    for (const e of [-1, 1]) { v.cyl(plain('cornerpole', 0xf2f2ee, 0.5, 0), e < 0 ? px0 : px1, py, gz, 0.015, 1.5, 6); v.frame(e < 0 ? px0 : px1, gz, 0).box(plain('cornerflag', 0xe8c22e, 0.7, 0), 0.2, 1.36, 0, 0.4, 0.26, 0.01); v.frame(0, 0, 0); }
  }

  // ---------------- field events ----------------
  const sand = plain('sand', 0xd8c79c, 1, 0), board = plain('takeoff', 0xf4f2ec, 0.6, 0);
  const lx = xW - 5.4;                                                        // long-jump runway between the home straight and the stand
  add(flatPoly(rect(lx - 0.61, t.cz - 24, lx + 0.61, t.cz + 24), 0.045, rubber, { order: 2, offset: -1 }));
  for (const s of [-1, 1]) {
    add(flatPoly(rect(lx - 1.4, t.cz + s * 24 + (s > 0 ? 0 : -9), lx + 1.4, t.cz + s * 24 + (s > 0 ? 9 : 0)), 0.07, sand, { order: 3, offset: -2 }));
    v.frame(lx, t.cz + s * 21, 0).box(board, 0, 0.05, 0, 1.22, 0.02, 0.2); v.frame(lx, t.cz + s * 28.5, 0);
    for (const [dx, dz, sx, sz] of [[-1.5, 0, 0.12, 9.2], [1.5, 0, 0.12, 9.2], [0, -4.6, 3.1, 0.12], [0, 4.6, 3.1, 0.12]]) v.box('concrete', dx, 0.06, dz, sx, 0.12, sz);
  }
  v.frame(0, 0, 0);
  // high jump in the south D: landing mats on the pitch side of the bar, the run-up fan toward the bend
  { const hx = t.cx, hz = t.cz + hs + 16.5, blue = plain('mat-blue', 0x2c56a8, 0.75, 0), cover = plain('mat-cover', 0x9aa3ad, 0.8, 0);
    v.frame(hx, hz, 0).box(blue, 0, 0.3, -1.6, 5, 0.6, 3).box(cover, 0, 0.62, -1.6, 4.9, 0.05, 2.9).box(blue, 0, 0.12, -3.6, 5, 0.24, 1.0);
    for (const e of [-1, 1]) { v.cyl('steel', e * 2.1, 0, 0.1, 0.03, 2.3, 8).box('steel', e * 2.1, 0.03, 0.1, 0.5, 0.05, 0.5); }
    v.strut(plain('bar', 0xf2d23a, 0.5, 0), [hx - 2.1, 1.6, hz + 0.1], [hx + 2.1, 1.6, hz + 0.1], 0.03); v.frame(0, 0, 0);
    c.frame(hx, hz, 0).box('generic', 0, 0.3, -1.6, 5, 0.6, 3); c.frame(0, 0, 0);
    const fan = strips(); for (let i = 0; i <= 6; i++) { const a = Math.PI / 2 + (i - 3) * 0.26; ribbon([[hx, hz + 0.4], [hx + Math.cos(a) * 13, hz + 0.4 + Math.sin(a) * 13]], 0.05, y, fan); }
    add(stripMesh(fan, paint, { order: 5, offset: -4 })); }
  // shot put in the north D: circle, stop board and sector lines toward the pitch
  { const sx = t.cx + 9, sz = zN - 16, ring = strips(); ribbon(arc(sx, sz, 1.07, 40), 0.07, 0.085, ring, true);
    for (const e of [-1, 1]) { const a = Math.PI / 2 + e * 0.305; ribbon([[sx + Math.cos(a) * 1.07, sz + Math.sin(a) * 1.07], [sx + Math.cos(a) * 17, sz + Math.sin(a) * 17]], 0.05, 0.085, ring); }
    add(flatPoly(arc(sx, sz, 1.07, 40), 0.07, mat('concrete'), { order: 3, offset: -2 })); add(stripMesh(ring, paint, { order: 6, offset: -5 }));
    v.frame(sx, sz, 0).box(board, 0, 0.13, 1.12, 1.22, 0.1, 0.11); v.frame(0, 0, 0); }
  // a flight of hurdles set out on the chute, benches by the home straight
  { const bar = plain('hurdle', 0xf4f2ec, 0.55, 0), black = plain('hurdle-black', 0x1c1c1e, 0.55, 0), zh = z100 + 13.72;
    for (let n = 1; n <= N; n++) { const xm = t.cx - (lane(n)[0] + lane(n)[1]) / 2; v.frame(xm, zh, 0);
      for (const e of [-1, 1]) v.box('steel', e * 0.5, 0.5, 0, 0.03, 1.0, 0.03).box('steel', e * 0.5, 0.02, 0.3, 0.04, 0.04, 0.7);
      v.box(bar, 0, 1.03, 0, 1.19, 0.07, 0.02); for (const e of [-1, 0, 1]) v.box(black, e * 0.36, 1.03, 0.001, 0.14, 0.07, 0.022); }
    v.frame(0, 0, 0); }
  { const wood = pbr('timber'), bx = xW - 2.6; for (const z of [-30, -10, 10, 30]) { v.frame(bx, t.cz + z, 0).box('steel', 0, 0.2, -0.9, 0.3, 0.4, 0.05).box('steel', 0, 0.2, 0.9, 0.3, 0.4, 0.05).box(wood, 0, 0.43, 0, 0.36, 0.05, 2.2); c.frame(bx, t.cz + z, 0).box('generic', 0, 0.25, 0, 0.4, 0.5, 2.2); } v.frame(0, 0, 0); c.frame(0, 0, 0); }

  void rnd; void low; void SURFACES; void yellowPaint;
  add(v.build({ name: 'athletics' }));
  const cg = c.build(); add(cg).visible = false; cg.children.forEach(m => ctx.collide(m));
}
