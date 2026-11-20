// Round building with a white observatory-type dome, north of the arc building (item "dome"), inside and out.
//
// SEEN in the references
// - 2018 frames 2-3 (right edge of the frame, from the north-east): a pale grey-white drum with small square punched
//   windows, widely spaced (about 20 degrees apart), three rows visible above the trees; on top of the drum a recessed,
//   shaded band with a post in it, then a flat white ring that projects beyond that band but is narrower than the
//   drum, then a smooth white dome narrower than the ring.
// - 2022 "一本书的梦" frame 58 (from the new building's roof): the dome is cream-white, a little less than a hemisphere,
//   sitting on the flat white disc, which stands on a few slender posts above a lower curved wall.
// - The data item gives the drum as about 24.7 m across and the dome as about 13 m across (satellite).
//
// ASSUMED (no reference supports these)
// - Split of item.height (an estimate): four storeys of drum, a recessed top storey, ring, dome. The dome top is at item.height.
// - The ground-floor window row (hidden by trees); 18 window columns all the way round (only one side is seen);
//   window size 1.4 m.
// - The recessed band under the ring: a plain wall with 12 round posts; ring and band radii (0.77 and 0.66 of the
//   drum radius, read off frame 2); the low parapet round the terrace.
// - Dome profile: a spherical cap, rise 0.34 of its diameter, on a short upstand.
//
// IMAGINED (the owner asked for a complete, good-looking building, inside too, and said facts need not be exact)
// - Outside at close range: the drum's cladding in white sheets with open joints, window frames, sills and rain streaks;
//   the dome's ribs, its observing slit (drawn open, the shutter parked over the top) and the two rails beside it;
//   the door on the east side with its granite surround, steps, canopy and plate; lightning rods on the ring with tapes
//   down the drum.
// - Where the drum stands in the arc building's convex face (the two outlines overlap by about 5 m), the inside is closed
//   by a straight wall in front of that face. The windows of the drum that would open into the arc building are left out.
// - Everything inside. Ground floor: a round hall three storeys high with a model of the solar system round the
//   telescope pier (the sun as a lamp), orbits and a meridian line in brass in a dark floor, star charts, show cases, a
//   starry ceiling. A stair winds up the drum wall to the fourth storey (activity room with charts and models), and a
//   straight flight leads from there to the observatory room under the dome: a refractor on an equatorial mount on its
//   pier, the slit, a control desk, charts, an observing ladder.
// - All texts (天文台, 仰望星空, the chart captions).
// NOT MODELLED: the terrace round the top storey cannot be reached; the dome does not turn.
import { THREE } from '../../kit.js';
import { Batch } from '../../batch.js';
import { pbr, plain, SURFACES } from '../../hifi.js';
import { LIT } from '../../street.js';
import { textTexture } from '../../signs.js';
import { layout } from './arc.js';

const N = 18, WW = 1.4, WT = 0.3;                    // window columns; window size; wall thickness of the drum
const TAU = Math.PI * 2, RAD = Math.PI / 180;
const SANS = '"PingFang SC","Microsoft YaHei","Noto Sans CJK SC","Source Han Sans SC","WenQuanYi Zen Hei",sans-serif';
function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

/** Adds curved surfaces with smooth normals round a vertical axis to a Batch (texture coordinates in metres). */
class Surf {
  constructor(cx, cz, batch) { this.cx = cx; this.cz = cz; this.batch = batch; }      // writes into a Batch, so that one mesh per material comes out of both
  part(material) { return this.batch._part(material); }
  /** Piece of a cylinder wall between angles a0 < a1 and heights y0 < y1. side +1 faces outward, -1 inward. */
  wall(material, r, a0, a1, y0, y1, seg, side = 1, uScale = 1) {
    const p = this.part(material), base = p.pos.length / 3;
    for (let i = 0; i <= seg; i++) {
      const a = a0 + (a1 - a0) * i / seg, c = Math.cos(a), s = Math.sin(a);
      for (const y of [y0, y1]) { p.pos.push(this.cx + r * c, y, this.cz + r * s); p.nor.push(side * c, 0, side * s); p.uv.push(a * r * uScale, y); }
    }
    for (let i = 0; i < seg; i++) { const k = base + 2 * i; if (side > 0) p.idx.push(k, k + 1, k + 3, k, k + 3, k + 2); else p.idx.push(k, k + 3, k + 1, k, k + 2, k + 3); }
    return this;
  }
  /** Flat ring between radii r0 < r1 at height y, all round or between two angles. side +1 faces up, -1 down. */
  ring(material, r0, r1, y, seg, side = 1, a0 = 0, a1 = TAU) {
    const p = this.part(material), base = p.pos.length / 3;
    for (let i = 0; i <= seg; i++) {
      const a = a0 + (a1 - a0) * i / seg, c = Math.cos(a), s = Math.sin(a);
      for (const r of [r0, r1]) { p.pos.push(this.cx + r * c, y, this.cz + r * s); p.nor.push(0, side, 0); p.uv.push(r * c, r * s); }
    }
    for (let i = 0; i < seg; i++) { const k = base + 2 * i; if (side > 0) p.idx.push(k, k + 2, k + 3, k, k + 3, k + 1); else p.idx.push(k, k + 3, k + 2, k, k + 1, k + 3); }
    return this;
  }
  /** Grid of nu by nv cells; at(i, j) gives { p: [x, y, z] (relative to the axis), n, uv }; cells for which keep(i, j) is false are left open. */
  grid(material, nu, nv, at, keep = null, flip = false) {
    const p = this.part(material), base = p.pos.length / 3;
    for (let i = 0; i <= nu; i++) for (let j = 0; j <= nv; j++) { const q = at(i, j); p.pos.push(this.cx + q.p[0], q.p[1], this.cz + q.p[2]); p.nor.push(...q.n); p.uv.push(...q.uv); }
    for (let i = 0; i < nu; i++) for (let j = 0; j < nv; j++) {
      if (keep && !keep(i, j)) continue;
      const a = base + i * (nv + 1) + j, b = a + nv + 1;
      if (flip) p.idx.push(a, b + 1, a + 1, a, b, b + 1); else p.idx.push(a, a + 1, b + 1, a, b + 1, b);
    }
    return this;
  }
}
/** Quad with its own texture coordinates, corners counter-clockwise seen from the side it faces; current frame of the batch. */
function uvq(b, material, p0, p1, p2, p3, u0 = 0, v0 = 0, u1 = 1, v1 = 1) {
  const p = b._part(material), base = p.pos.length / 3, e = [p1[0] - p0[0], p1[1] - p0[1], p1[2] - p0[2]], f = [p3[0] - p0[0], p3[1] - p0[1], p3[2] - p0[2]];
  let n = [e[1] * f[2] - e[2] * f[1], e[2] * f[0] - e[0] * f[2], e[0] * f[1] - e[1] * f[0]]; const l = Math.hypot(n[0], n[1], n[2]) || 1; n = n.map(q => q / l);
  for (const [q, s, t] of [[p0, u0, v0], [p1, u1, v0], [p2, u1, v1], [p3, u0, v1]]) b._vert(p, q[0], q[1], q[2], n[0], n[1], n[2], s, t);
  p.idx.push(base, base + 1, base + 2, base, base + 2, base + 3);
}
/** Collider quad that faces up whatever the order of its corners. */
function upQuad(c, p0, p1, p2, p3) {
  const tri = Math.hypot(p3[0] - p0[0], p3[2] - p0[2]) < 1e-9, e = [p1[0] - p0[0], p1[2] - p0[2]], f = tri ? [p2[0] - p0[0], p2[2] - p0[2]] : [p3[0] - p0[0], p3[2] - p0[2]];
  if (tri) { if (e[1] * f[0] - e[0] * f[1] >= 0) c.quad('generic', p0, p1, p2, p2); else c.quad('generic', p0, p2, p1, p1); return; }
  if (e[1] * f[0] - e[0] * f[1] >= 0) c.quad('generic', p0, p1, p2, p3); else c.quad('generic', p0, p3, p2, p1);
}
function canvasTex(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}

let M = null, skyLight = null;
function materials() {
  if (M) return M;
  const std = (name, o) => { const mm = new THREE.MeshStandardMaterial(o); mm.name = 'dome-' + name; return mm; };
  const P = (name, color, rough = 0.8, metal = 0, over = {}) => plain('dome-' + name, color, rough, metal, over);
  const gz = SURFACES.glazing(0x86a2a8, 4, 1, [4, 1], 21);
  const stars = (g, Wc, Hc, r, n) => { for (let i = 0; i < n; i++) { const k = r(), s = k > 0.97 ? 2.6 : k > 0.85 ? 1.6 : 0.9; g.fillStyle = `rgba(${225 + r() * 30},${225 + r() * 30},${205 + r() * 50},${0.55 + 0.45 * r()})`; g.beginPath(); g.arc(r() * Wc, r() * Hc, s, 0, 6.3); g.fill(); } };
  M = {
    clad: pbr('cladding', [0xe9e8e3, 1.2, 0.8, 0.5]),                                  // the drum: white sheets with open joints
    shell: pbr('cladding', [0xf3f1e7, 0.62, 1.6, 0.34]),                               // the dome: ribs parallel to the slit
    white: P('whitepaint', 0xf1f0ea, 0.7), shutter: P('shutter', 0xe3e4e0, 0.5, 0.3), gran: pbr('granitePolished', [0x5c5856, 9]), steel: pbr('steel'), roof: pbr('concrete', [0x8f918f]),
    frame: P('frame', 0x3d4246, 0.45, 0.5), black: P('black', 0x1b1d20, 0.5), brass: P('brass', 0xc9a04a, 0.3, 0.9), walnut: P('walnut', 0x8a5a34, 0.55), tread: P('tread', 0xb7b1a4, 0.7), nosing: P('nosing', 0x3b3b3b, 0.8),
    pl: P('plaster', 0xf0ede3, 0.78, 0, { emissive: 0xf0ede3, emissiveIntensity: 0.05 }), night: P('nightceiling', 0x121c38, 0.9, 0, { emissive: 0x0b1226, emissiveIntensity: 0.5 }),
    inner: P('shellinner', 0xdcdad2, 0.8, 0, { emissive: 0xdcdad2, emissiveIntensity: 0.04 }), concrete: pbr('concrete', [0xb8b5ac]),
    floor: pbr('granitePolished', [0x343b47, 5], { envMapIntensity: 0.6 }), boards: pbr('boards', [0xb08a5c, 1.2], { envMapIntensity: 0.4 }), vinyl: pbr('tiles', [0x8e9698, 2, 1.2, 0.5], { envMapIntensity: 0.3 }),
    glass: std('glass-square', { map: gz.map, normalMap: gz.normalMap, roughness: 0.05, metalness: 0.55, envMapIntensity: 1.5, transparent: true, opacity: 0.8, depthWrite: false }),
    lite: std('lite-inner', { color: 0xd6e6ea, roughness: 0.08, metalness: 0, transparent: true, opacity: 0.1, depthWrite: false }),
    gdoor: std('glass-door', { color: 0xa9cdd4, roughness: 0.05, metalness: 0.3, transparent: true, opacity: 0.34, depthWrite: false, envMapIntensity: 1.4 }),
    lamp: plain('lamp', 0xfff1d6, 0.4, 0, { emissive: 0xffe2b0, emissiveIntensity: 1.4 }), sun: P('sun', 0xffdca0, 0.6, 0, { emissive: 0xffa630, emissiveIntensity: 1.3 }), red: P('redlamp', 0xc8201c, 0.5, 0, { emissive: 0xff2010, emissiveIntensity: 0.8 }),
    planet: P('planet', 0xffffff, 0.75), tube: P('telescope', 0xf4f4f0, 0.25, 0.1), sofa: P('bench', 0x51606b, 0.8), cabinet: P('cabinet', 0x8ea2b2, 0.6), screen: P('monitor', 0x16324a, 0.3, 0, { emissive: 0x2a6fa8, emissiveIntensity: 0.6 }),
    stain: std('streaks', { map: canvasTex(128, 128, (g, Wc, Hc) => { const r = rng(79); for (let i = 0; i < 22; i++) { const x = r() * Wc, w = 2 + r() * 9, len = Hc * (0.35 + 0.65 * r()), gr = g.createLinearGradient(0, 0, 0, len); gr.addColorStop(0, `rgba(70,66,58,${0.25 + 0.3 * r()})`); gr.addColorStop(1, 'rgba(70,66,58,0)'); g.fillStyle = gr; g.fillRect(x, 0, w, len); } }), transparent: true, depthWrite: false, roughness: 1, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -4 }),
    // star charts: the northern sky as a disc, a band of the sky along the ecliptic, four information sheets
    chart: std('starchart', { roughness: 0.6, map: canvasTex(1024, 1024, (g, S) => {
      const r = rng(2718); g.fillStyle = '#e9e4d6'; g.fillRect(0, 0, S, S); g.fillStyle = '#0d1630'; g.beginPath(); g.arc(S / 2, S / 2, S * 0.47, 0, 6.3); g.fill(); g.save(); g.beginPath(); g.arc(S / 2, S / 2, S * 0.47, 0, 6.3); g.clip();
      g.strokeStyle = 'rgba(120,150,210,0.35)'; g.lineWidth = 1.5; for (let i = 1; i < 6; i++) { g.beginPath(); g.arc(S / 2, S / 2, S * 0.47 * i / 6, 0, 6.3); g.stroke(); } for (let i = 0; i < 12; i++) { g.beginPath(); g.moveTo(S / 2, S / 2); g.lineTo(S / 2 + Math.cos(i * 0.5236) * S, S / 2 + Math.sin(i * 0.5236) * S); g.stroke(); }
      g.fillStyle = 'rgba(150,170,220,0.10)'; for (let i = 0; i < 260; i++) { const a = i * 0.045 + r() * 0.3, d = S * (0.2 + 0.1 * Math.sin(i * 0.08)) + r() * 60; g.beginPath(); g.arc(S / 2 + Math.cos(a) * d, S / 2 + Math.sin(a) * d * 0.9, 16 + r() * 26, 0, 6.3); g.fill(); }
      g.strokeStyle = 'rgba(210,220,255,0.6)'; g.lineWidth = 1.6;
      for (let k = 0; k < 16; k++) { let x = S * (0.14 + 0.72 * r()), y = S * (0.14 + 0.72 * r()); g.beginPath(); g.moveTo(x, y); for (let i = 0; i < 3 + Math.floor(r() * 4); i++) { x += (r() - 0.5) * 120; y += (r() - 0.5) * 120; g.lineTo(x, y); g.fillStyle = '#fff'; g.fillRect(x - 2.5, y - 2.5, 5, 5); } g.stroke(); }
      stars(g, S, S, r, 900); g.restore(); g.strokeStyle = '#b08d57'; g.lineWidth = 10; g.beginPath(); g.arc(S / 2, S / 2, S * 0.475, 0, 6.3); g.stroke();
      g.fillStyle = '#5a4a36'; g.font = `bold 30px ${SANS}`; g.textAlign = 'center'; g.fillText('北', S / 2, 28); g.fillText('南', S / 2, S - 6); g.fillText('东', 18, S / 2 + 10); g.fillText('西', S - 18, S / 2 + 10);
    }) }),
    sheets: std('sheets', { roughness: 0.55, map: canvasTex(1024, 512, (g, Wc, Hc) => {
      const r = rng(31415), titles = ['太 阳 系', '月 相', '四 季 星 空', '望 远 镜', '银 河', '日 食 与 月 食', '二 十 四 节 气', '星 座'];
      for (let i = 0; i < 8; i++) {
        const x = (i % 4) * 256, y = Math.floor(i / 4) * 256; g.fillStyle = '#10182e'; g.fillRect(x, y, 256, 256); g.save(); g.beginPath(); g.rect(x, y, 256, 256); g.clip(); g.translate(x, y); stars(g, 256, 256, r, 70);
        g.fillStyle = '#e8d9a8'; g.font = `bold 26px ${SANS}`; g.textAlign = 'center'; g.fillText(titles[i], 128, 36);
        for (let q = 0; q < 4; q++) { const px = 40 + q * 58, rad = 10 + r() * 16, gr = g.createRadialGradient(px - rad * 0.3, 110 - rad * 0.3, 1, px, 110, rad); gr.addColorStop(0, `hsl(${Math.floor(r() * 360)},60%,78%)`); gr.addColorStop(1, `hsl(${Math.floor(r() * 360)},45%,30%)`); g.fillStyle = gr; g.beginPath(); g.arc(px, 110, rad, 0, 6.3); g.fill(); }
        g.fillStyle = 'rgba(220,225,240,0.75)'; for (let q = 0; q < 7; q++) g.fillRect(22, 160 + q * 12, q === 6 ? 110 : 212, 4); g.restore(); g.strokeStyle = '#b08d57'; g.lineWidth = 4; g.strokeRect(x + 3, y + 3, 250, 250);
      }
    }) }),
  };
  M.stain.map.wrapS = M.stain.map.wrapT = THREE.RepeatWrapping;
  for (const k of ['white', 'shutter', 'frame', 'black', 'walnut', 'tread', 'nosing', 'tube', 'sofa', 'cabinet']) M[k].userData.flat = true;
  return M;
}
// After dusk the lights are on inside: walls and ceilings glow a little (the page's hemisphere light carries the amount of daylight).
function followDaylight(renderer, scene) {
  if (!skyLight || skyLight.parent !== scene) skyLight = scene.children.find(o => o.isHemisphereLight) || null;
  const day = skyLight ? Math.min(1, Math.max(0, skyLight.intensity)) : 1, night = 1 - Math.min(1, Math.max(0, (day - 0.06) / 0.5));
  M.pl.emissiveIntensity = 0.05 + 0.28 * night; M.inner.emissiveIntensity = 0.04 + 0.2 * night;
}

export function build(item, ctx) {
  const { cx, cz, radius: R } = item, H = item.height, m = materials(), low = !!ctx.lowPower, rnd = rng(1609);
  // heights from item.height; radii from the item radius
  const Rd = 0.525 * R, Rring = 0.77 * R, Rg = 0.66 * R, Rpost = 0.735 * R;             // dome, flat ring, recessed top storey, posts
  const rise = 0.68 * Rd, upstand = 0.5, ringT = 0.4, gallery = 0.13 * H, parapet = 0.9;
  const ringTop = H - rise - upstand, ringBot = ringTop - ringT, terrace = ringBot - gallery, storey = terrace / 4, sillH = 0.3 * storey, wallTop = terrace + parapet;
  const Rin = R - WT, GH = 0.3, L3 = 3 * storey, OB = terrace, RO = Rg - 0.25;           // inner face of the drum; hall floor; fourth-storey floor; observatory floor and the inner radius of its wall
  const mod = TAU / N, ha = Math.asin(WW / 2 / R), a0 = mod / 2, AD = 0, had = Math.asin(0.95 / R), DH = GH + 2.5;   // windows; the door (east), its half angle and head
  // where the arc building's convex face cuts the drum: a straight wall inside, DW from the axis, facing the angle CUT
  let CUT = null, dc = Infinity;
  const arc = ((ctx.campus && ctx.campus.items) || []).find(i => i.style === 'arc' && i.points);
  if (arc) {
    const ins = layout(arc).O.filter(p => Math.hypot(p[0] - cx, p[1] - cz) < R + 3);
    if (ins.length >= 2) {
      const p = ins[0], q = ins[ins.length - 1], L = Math.hypot(q[0] - p[0], q[1] - p[1]); let nx = -(q[1] - p[1]) / L, nz = (q[0] - p[0]) / L, d = (p[0] - cx) * nx + (p[1] - cz) * nz;
      if (d < 0) { nx = -nx; nz = -nz; d = -d; }
      for (const o of ins) d = Math.min(d, (o[0] - cx) * nx + (o[1] - cz) * nz);
      if (d < R - 1.5 && d > 2) { dc = d; CUT = Math.atan2(nz, nx); }
    }
  }
  const DW = dc - 0.3, turn = a => Math.atan2(Math.sin(a), Math.cos(a)), inCut = (a, r = R, pad = 0.06) => CUT !== null && Math.abs(turn(a - CUT)) < Math.acos(Math.min(1, dc / r)) + pad;
  const b = new Batch(), c = new Batch(), fx = new Batch(), s = new Surf(cx, cz, b), si = new Surf(cx, cz, fx);   // always drawn; colliders; fittings, furniture and the floors inside (near only); curved surfaces into the first and the third
  const rad = (bb, a, y = 0) => bb.frame(cx, cz, -a, y);                                  // frame whose +x points outward at angle a, +z along the wall toward larger angles

  // ---------- drum wall: cladding outside, plaster inside, punched square windows, the door ----------
  const us = Math.round(TAU * R / 2.4) * 2.4 / (TAU * R);                                // whole number of sheets round the drum: no seam
  const wins = []; for (let i = 0; i < N; i++) { const a = a0 + i * mod; if (!inCut(a)) wins.push(a); }
  const rows = [0, 1, 2, 3].map(f => f * storey + sillH), cuts = [...new Set([0, GH, DH, wallTop, ...rows.flatMap(y => [y, y + WW])])].sort((p, q) => p - q);
  for (let i = 0; i < cuts.length - 1; i++) {
    const y0 = cuts[i], y1 = cuts[i + 1], ym = (y0 + y1) / 2, win = rows.some(y => ym > y && ym < y + WW), door = ym < DH;
    for (const [r, hw, side, mm, lo, hi] of [[R, ha, 1, m.clad, 0, wallTop], [Rin, Math.asin(WW / 2 / Rin), -1, m.pl, GH, terrace - 0.25]]) {
      const ya = Math.max(y0, lo), yb = Math.min(y1, hi); if (yb - ya < 1e-6) continue;
      let a = AD + had;                                                                  // once round, starting beside the door
      for (const w of win ? wins : []) { if (w - hw > a) s.wall(mm, r, a, w - hw, ya, yb, Math.max(1, Math.round((w - hw - a) / (5 * RAD))), side, us); a = w + hw; }
      s.wall(mm, r, a, AD + TAU - had, ya, yb, Math.max(1, Math.round((AD + TAU - had - a) / (5 * RAD))), side, us);
      if (!door) s.wall(mm, r, AD - had, AD + had, ya, yb, 2, side, us);
    }
  }
  const xr = R * Math.cos(ha), w = WW / 2, xg = xr - 0.2, xi = Rin * Math.cos(Math.asin(w / Rin)) - 0.004;   // opening plane, glass, inner face, along the window's own radius
  for (const a of wins) for (let f = 0; f < 4; f++) {
    const sl = rows[f], tp = sl + WW, inside = f < 3 || true;
    rad(b, a);
    { const g0 = Math.floor(rnd() * 4); uvq(b, m.glass, [xg, sl, w], [xg, sl, -w], [xg, tp, -w], [xg, tp, w], g0, 0, g0 + 1, 1); } uvq(b, m.lite, [xg - 0.012, sl, -w], [xg - 0.012, sl, w], [xg - 0.012, tp, w], [xg - 0.012, tp, -w]);
    b.box(m.frame, xg, sl + w, 0, 0.05, WW, 0.05).box(m.frame, xg, sl + w, 0, 0.05, 0.05, WW).box(m.frame, xg, sl + 0.025, 0, 0.06, 0.05, WW).box(m.frame, xg, tp - 0.025, 0, 0.06, 0.05, WW).box(m.frame, xg, sl + w, w - 0.025, 0.06, WW, 0.05).box(m.frame, xg, sl + w, -w + 0.025, 0.06, WW, 0.05);
    b.quad(m.clad, [xg, sl, w], [xr, sl, w], [xr, sl, -w], [xg, sl, -w]).quad(m.clad, [xg, tp, -w], [xr, tp, -w], [xr, tp, w], [xg, tp, w]).quad(m.clad, [xg, sl, -w], [xr, sl, -w], [xr, tp, -w], [xg, tp, -w]).quad(m.clad, [xr, sl, w], [xg, sl, w], [xg, tp, w], [xr, tp, w]);   // reveals outside
    if (inside) b.quad(m.pl, [xi, sl, w], [xg, sl, w], [xg, sl, -w], [xi, sl, -w]).quad(m.pl, [xi, tp, -w], [xg, tp, -w], [xg, tp, w], [xi, tp, w]).quad(m.pl, [xi, sl, -w], [xg, sl, -w], [xg, tp, -w], [xi, tp, -w]).quad(m.pl, [xg, sl, w], [xi, sl, w], [xi, tp, w], [xg, tp, w]);   // and inside
    b.box(m.white, xr + 0.03, sl - 0.035, 0, 0.14, 0.07, WW + 0.16);                                                                          // sill
    if (rnd() < 0.7) { const u0 = rnd() * 3, h = 0.5 + rnd() * 0.9; uvq(b, m.stain, [R + 0.012, sl - 0.07 - h, 0.72], [R + 0.012, sl - 0.07 - h, -0.72], [R + 0.012, sl - 0.07, -0.72], [R + 0.012, sl - 0.07, 0.72], u0, 0.01, u0 + 0.6, 0.99); }
  }
  for (let i = 0; i < 40; i++) { const a = i * TAU / 40 + rnd() * 0.1, u0 = rnd() * 3, h = 0.6 + rnd() * 1.6; if (inCut(a)) continue; rad(b, a); uvq(b, m.stain, [R + 0.03, wallTop - 0.1 - h, 0.55], [R + 0.03, wallTop - 0.1 - h, -0.55], [R + 0.03, wallTop - 0.1, -0.55], [R + 0.03, wallTop - 0.1, 0.55], u0, 0.01, u0 + 0.5, 0.99); }
  s.wall(m.gran, R + 0.04, AD + had + 0.01, AD + TAU - had - 0.01, 0, 0.35, 90, 1);                                                             // plinth course
  s.ring(m.gran, R, R + 0.04, 0.35, 90, 1, AD + had, AD + TAU - had);

  // ---------- the door (east): granite surround, glazed leaves standing open, steps, canopy, plate, lamp ----------
  rad(b, AD); rad(c, AD);
  {
    const x0 = R * Math.cos(had), dw = 0.95;
    b.slab(m.gran, x0 - WT - 0.02, GH, -dw - 0.22, WT + 0.2, DH - GH + 0.25, 0.22, 'D').slab(m.gran, x0 - WT - 0.02, GH, dw, WT + 0.2, DH - GH + 0.25, 0.22, 'D').slab(m.gran, x0 - WT - 0.02, DH, -dw, WT + 0.2, 0.25, 2 * dw, 'U');
    b.slab(m.gran, x0 - WT - 0.05, GH - 0.05, -dw, WT + 0.25, 0.05, 2 * dw);                                                                   // threshold
    for (const sg of [-1, 1]) {                                                                                                                 // leaves swung inward
      const z = sg * (dw - 0.04);
      b.slab(m.gdoor, x0 - WT - 0.9, GH + 0.02, z - 0.012, 0.9, 2.2, 0.024, 'UD').slab(m.frame, x0 - WT - 0.9, GH + 0.02, z - 0.025, 0.9, 0.18, 0.05).slab(m.frame, x0 - WT - 0.9, GH + 2.14, z - 0.025, 0.9, 0.08, 0.05).slab(m.frame, x0 - WT - 0.9, GH + 0.2, z - 0.025, 0.06, 1.94, 0.05).slab(m.frame, x0 - WT - 0.06, GH + 0.2, z - 0.025, 0.06, 1.94, 0.05);
      c.slab('generic', x0 - WT - 0.92, GH + 0.02, z - 0.03, 0.9, 2.2, 0.06);
    }
    b.slab(m.frame, x0 - 0.2, GH + 2.25, -dw, 0.06, 0.05, 2 * dw).slab(m.gdoor, x0 - 0.18, GH + 2.3, -dw, 0.02, DH - GH - 2.3, 2 * dw, 'UD');                // transom and fanlight
    for (let i = 0; i < 2; i++) b.slab(m.gran, R - 0.05, i * 0.15, -1.7 - (1 - i) * 0.3, 0.75 + (1 - i) * 0.3, 0.15, 3.4 + (1 - i) * 0.6, 'D');          // two steps
    b.slab(m.white, R - 0.1, DH + 0.45, -1.9, 1.9, 0.16, 3.8).slab(m.steel, R + 1.8, DH + 0.43, -1.92, 0.03, 0.2, 3.84).slab(m.lamp, R + 0.6, DH + 0.42, -0.25, 0.5, 0.03, 0.5, 'U');
    for (const z of [-1.75, 1.75]) b.cyl(m.steel, R + 1.6, 0, z, 0.05, DH + 0.45, 10, false);
    LIT.push([cx + (R + 1.0) * Math.cos(AD), cz + (R + 1.0) * Math.sin(AD), 4]);
    const t = textTexture('天文台', { color: '#f4efe2', background: '#23344a', spacing: 0.4 }), tm = new THREE.MeshStandardMaterial({ map: t.texture, roughness: 0.4, metalness: 0.2 }); tm.name = 'dome-plate';
    { const hz = 0.42 * t.aspect / 2, xs = R + 1.72; b.slab(m.frame, xs - 0.05, DH + 0.6, -hz - 0.06, 0.05, 0.54, 2 * hz + 0.12); uvq(b, tm, [xs + 0.004, DH + 0.66, hz], [xs + 0.004, DH + 0.66, -hz], [xs + 0.004, DH + 1.08, -hz], [xs + 0.004, DH + 1.08, hz]); }
    c.quad('generic', [x0 - WT - 0.3, GH, -dw - 0.2], [x0 - WT - 0.3, GH, dw + 0.2], [R + 0.7, GH, dw + 0.9], [R + 0.7, GH, -dw - 0.9]);                 // landing and a ramp for the steps
    c.quad('generic', [R + 0.7, GH, -dw - 0.9], [R + 0.7, GH, dw + 0.9], [R + 1.3, 0, dw + 0.9], [R + 1.3, 0, -dw - 0.9]);
    for (const z of [-1.75, 1.75]) c.slab('generic', R + 1.5, 0, z - 0.1, 0.2, 3, 0.2);
  }

  // ---------- terrace on the drum with a low parapet, recessed top storey with posts ----------
  s.ring(m.roof, Rg - 0.05, R - 0.25, terrace, 60, 1).wall(m.clad, R - 0.25, 0, TAU, terrace, wallTop, 60, -1);
  s.ring(m.white, R - 0.3, R + 0.06, wallTop, 90, 1).wall(m.white, R + 0.06, 0, TAU, wallTop - 0.1, wallTop, 90, 1).ring(m.white, R - 0.02, R + 0.06, wallTop - 0.1, 90, -1);
  s.wall(m.white, Rg, 0, TAU, terrace, ringBot, 60, 1).wall(m.pl, RO, 0, TAU, OB, ringBot, 60, -1);
  b.frame(cx, cz);
  for (let i = 0; i < 12; i++) { const a = (i + 0.5) / 12 * TAU; b.cyl(m.white, Rpost * Math.cos(a), terrace, Rpost * Math.sin(a), 0.16, gallery, 10, false); }
  rad(b, AD); b.slab(m.shutter, Rg, terrace, -0.5, 0.04, 2.05, 1.0).slab(m.shutter, RO - 0.04, OB, -0.5, 0.04, 2.05, 1.0);                               // door from the observatory to the terrace (shut)

  // ---------- flat projecting ring; the dome with its slit ----------
  s.ring(m.white, Rd - 0.1, Rring, ringTop, 72, 1).ring(m.white, Rg - 0.05, Rring, ringBot, 72, -1).wall(m.white, Rring, 0, TAU, ringBot, ringTop, 72, 1).ring(m.pl, Rd - 0.25, RO, ringBot, 72, -1);
  s.wall(m.shell, Rd, 0, TAU, ringTop, ringTop + upstand, 64, 1).wall(m.inner, Rd - 0.14, 0, TAU, ringBot, ringTop + upstand, 64, -1);
  const Rs = (Rd * Rd + rise * rise) / (2 * rise), yc = H - Rs, h0 = Rs - rise, SLIT = 55 * RAD, SW2 = 0.8;       // sphere of the cap; azimuth the slit faces (south-east); half its width
  const es = [Math.cos(SLIT), Math.sin(SLIT)], ep = [-es[1], es[0]];
  const lat = [-Rd, -5.2, -3.9, -2.6, -1.7, -SW2 - 0.18, -SW2, -0.4, 0, 0.4, SW2, SW2 + 0.18, 1.7, 2.6, 3.9, 5.2, Rd].map(x => Math.max(-Rd + 0.02, Math.min(Rd - 0.02, x))), NT = 28;
  const cap = (rr, sgn) => (i, j) => {                                                     // slices parallel to the slit, each an arc from the base on one side over the top to the other
    const x = lat[i] * rr / Rs, rho = Math.sqrt(Math.max(1e-6, rr * rr - x * x)), pm = Math.acos(Math.min(1, h0 * rr / Rs / rho)), psi = (j / NT * 2 - 1) * pm, q = rho * Math.sin(psi), y = rho * Math.cos(psi);
    return { p: [x * ep[0] + q * es[0], yc + y, x * ep[1] + q * es[1]], n: [sgn * (x * ep[0] + q * es[0]) / rr, sgn * y / rr, sgn * (x * ep[1] + q * es[1]) / rr], uv: [lat[i], rho * psi] };
  };
  const open = (i, j) => lat[i] >= -SW2 - 1e-6 && lat[i + 1] <= SW2 + 1e-6 && j >= 12 && j <= NT - 3;     // the slit: from a little past the top down to just above the ring
  s.grid(m.shell, lat.length - 1, NT, cap(Rs, 1), (i, j) => !open(i, j), true).grid(m.inner, lat.length - 1, NT, cap(Rs - 0.12, -1), (i, j) => !open(i, j));
  s.grid(m.shutter, lat.length - 1, NT, cap(Rs + 0.07, 1), (i, j) => lat[i] >= -SW2 - 0.19 && lat[i + 1] <= SW2 + 0.19 && j >= 1 && j <= 11, true);            // the shutter, parked over the top
  s.grid(m.shutter, lat.length - 1, NT, cap(Rs + 0.1, 1), (i, j) => (Math.abs(lat[i] + SW2 + 0.18) < 1e-6 || Math.abs(lat[i] - SW2) < 1e-6), true);             // its two rails
  for (const i of [6, 10]) s.grid(m.inner, 1, NT, (q, j) => { const o = cap(q ? Rs + 0.1 : Rs - 0.12, 1)(i, j); return { p: o.p, n: [ep[0] * (i === 6 ? 1 : -1), 0, ep[1] * (i === 6 ? 1 : -1)], uv: [q * 0.2, o.uv[1]] }; }, (q, j) => j >= 12 && j <= NT - 3, i === 10);   // the edges of the slit
  // lightning protection: four rods on the ring, tapes down the drum
  b.frame(cx, cz);
  for (let i = 0; i < 4; i++) { const a = (i + 0.5) * TAU / 4, x = (Rring - 0.15) * Math.cos(a), z = (Rring - 0.15) * Math.sin(a); b.cyl(m.steel, x, ringTop, z, 0.018, 2.6, 6).cyl(m.steel, x, ringTop, z, 0.06, 0.1, 8); }
  for (const a of [200 * RAD, 300 * RAD]) { rad(b, a); b.slab(m.frame, R + 0.005, 0.4, -0.02, 0.012, wallTop - 0.4, 0.04).slab(m.frame, R - 0.3, wallTop + 0.002, -0.02, 0.36, 0.012, 0.04); }

  // ================= INSIDE (IMAGINED) =================
  const flat = CUT !== null, half = flat ? Math.sqrt(Rin * Rin - DW * DW) : 0;
  const local = (bb, y = 0) => bb.frame(cx, cz, 0, y);                                    // x east, z south, from the axis
  // floors: hall, fourth storey (with the slot where the stair comes up), observatory (with the opening over the straight flight)
  const S0 = -12 * RAD, NSTEP = 58, RISE = (L3 - GH) / NSTEP, r0 = Rin - 1.5, rc = (r0 + Rin) / 2, dA = 0.36 / rc, LANDS = [19, 38], LA = 8 * RAD;
  const A = [S0]; for (let i = 0; i < NSTEP; i++) A.push(A[i] - dA - (LANDS.includes(i) ? LA : 0));       // tread i runs from angle A[i] down to A[i + 1]; its top is at GH + (i + 1) * RISE
  const SLOT0 = A[NSTEP], SLOT1 = A[NSTEP - 16];                                         // the slot in the fourth-storey floor over the top of the stair
  si.ring(m.floor, 0.0, Rin, GH, 72, 1).ring(m.night, 0.9, r0 - 0.06, L3 - 0.25, 72, -1).ring(m.night, r0 - 0.06, Rin, L3 - 0.25, 60, -1, SLOT1, SLOT0 + TAU); s.wall(m.pl, r0 - 0.06, SLOT0, SLOT1, L3 - 0.25, L3, 8, 1);
  si.ring(m.boards, 0.0, r0 - 0.06, L3, 72, 1).ring(m.boards, r0 - 0.06, Rin, L3, 60, 1, SLOT1, SLOT0 + TAU); s.ring(m.pl, RO, Rin, OB - 0.25, 60, -1);
  const FX0 = -2.7, FX1 = 3.0, FZ0 = -4.0, FZ1 = -2.8;                                   // opening in the observatory floor over the straight flight (x east, z south)
  {
    const xa = Math.sqrt(RO * RO - FZ0 * FZ0), xb = Math.sqrt(RO * RO - FZ1 * FZ1), aN = Math.atan2(FZ0, xa), aS = Math.atan2(FZ1, xb), pieces = [];
    const arcPts = (p, q, n) => Array.from({ length: n + 1 }, (_, i) => { const a = p + (q - p) * i / n; return [RO * Math.cos(a), RO * Math.sin(a)]; });
    pieces.push([[0, FZ0], ...arcPts(aN, -Math.PI - aN, 14)]);                             // north of the opening
    pieces.push([[0, FZ1], ...arcPts(Math.PI - aS, aS, 26).reverse()]);                    // south of it
    pieces.push([[FX0, FZ0], [-xa, FZ0], [-xb, FZ1], [FX0, FZ1]], [[FX1, FZ1], [xb, FZ1], [xa, FZ0], [FX1, FZ0]]);
    local(b); local(c); local(fx);
    for (const poly of pieces) for (let i = 1; i < poly.length - 1; i++) {
      const p0 = poly[0], p1 = poly[i], p2 = poly[i + 1], P = q => [q[0], OB, q[1]], cr = (p1[0] - p0[0]) * (p2[1] - p0[1]) - (p1[1] - p0[1]) * (p2[0] - p0[0]);
      const [u1, u2] = cr < 0 ? [p1, p2] : [p2, p1];
      fx.quad(m.vinyl, P(p0), P(u1), P(u2), P(u2)); c.quad('generic', P(p0), P(u1), P(u2), P(u2));
      fx._part(m.vinyl).uv.splice(-8, 8, p0[0], p0[1], u1[0], u1[1], u2[0], u2[1], u2[0], u2[1]);
      b.quad(m.pl, [p0[0], OB - 0.25, p0[1]], [u2[0], OB - 0.25, u2[1]], [u1[0], OB - 0.25, u1[1]], [u1[0], OB - 0.25, u1[1]]);   // the ceiling below
    }
  }
  // the straight wall in front of the arc building, with the big star chart
  if (flat) {
    rad(b, CUT); rad(c, CUT);
    b.slab(m.pl, DW, GH, -half, 0.25, OB - 0.25 - GH, 2 * half, 'EUDNS'); c.slab('generic', DW, 0, -half, 0.3, ringBot, 2 * half);
    const ho = Math.sqrt(Math.max(0.01, RO * RO - DW * DW)); b.slab(m.pl, DW, OB, -ho, 0.25, ringBot - OB, 2 * ho, 'EUDNS');
    uvq(fx.frame(cx, cz, -CUT), m.chart, [DW - 0.02, GH + 1.0, -2.3], [DW - 0.02, GH + 1.0, 2.3], [DW - 0.02, GH + 5.6, 2.3], [DW - 0.02, GH + 5.6, -2.3]);
    const t = textTexture('仰 望 星 空', { color: '#c9a04a', spacing: 0.2 }), tm = new THREE.MeshStandardMaterial({ map: t.texture, alphaTest: 0.5, roughness: 0.4, metalness: 0.5 }); tm.name = 'dome-letters';
    uvq(fx, tm, [DW - 0.02, GH + 6.2, -0.35 * t.aspect], [DW - 0.02, GH + 6.2, 0.35 * t.aspect], [DW - 0.02, GH + 6.9, 0.35 * t.aspect], [DW - 0.02, GH + 6.9, -0.35 * t.aspect]);
    for (let i = 0; i < 4; i++) { const z = (i < 2 ? -6.6 + i * 1.9 : 2.9 + (i - 2) * 1.9), u0 = (i % 4) / 4; uvq(fx.frame(cx, cz, -CUT), m.sheets, [DW - 0.02, GH + 1.2, z], [DW - 0.02, GH + 1.2, z + 1.7], [DW - 0.02, GH + 2.9, z + 1.7], [DW - 0.02, GH + 2.9, z], u0, 0.5, u0 + 0.25, 1); }
    for (let i = 0; i < 2; i++) uvq(fx.frame(cx, cz, -CUT), m.sheets, [DW - 0.02, L3 + 1.0, -4.4 + i * 5.6], [DW - 0.02, L3 + 1.0, -1.2 + i * 5.6], [DW - 0.02, L3 + 2.5, -1.2 + i * 5.6], [DW - 0.02, L3 + 2.5, -4.4 + i * 5.6], i * 0.5, 0, i * 0.5 + 0.5, 0.5);
    uvq(fx.frame(cx, cz, -CUT), m.chart, [DW - 0.02, OB + 0.75, -0.9], [DW - 0.02, OB + 0.75, 0.9], [DW - 0.02, OB + 2.55, 0.9], [DW - 0.02, OB + 2.55, -0.9]);
  }
  // the telescope pier through all floors; the sun round it and the planets on rods from the starry ceiling; orbits and the meridian in the floor
  local(b); local(c); local(fx);
  fx.cyl(m.concrete, 0, GH, 0, 0.9, OB + 0.45 - GH, 24).cyl(m.concrete, 0, OB + 0.45, 0, 0.45, 0.75, 18); c.slab('generic', -0.85, GH + 0.02, -0.85, 1.7, OB + 1.1 - GH, 1.7);
  const ORB = [2.3, 3.1, 4.0, 4.9, 6.3, 7.8, 9.0, 9.9], PR = [0.14, 0.26, 0.28, 0.2, 0.75, 0.62, 0.4, 0.38], PC = [0x9a8f84, 0xd9b36c, 0x3f78c9, 0xb5512f, 0xc9a074, 0xd8c28a, 0x9fd6d8, 0x4a6fd0];
  const planets = [], PA = [200, 250, 310, 165, 285, 215, 330, 255].map(a => a * RAD);     // all on the side away from the straight wall
  ORB.forEach((o, i) => {
    si.ring(m.brass, o - 0.022, o + 0.022, GH + 0.004, 96, 1);
    const x = o * Math.cos(PA[i]), z = o * Math.sin(PA[i]), y = GH + 4.3 + (i % 3) * 0.5; planets.push([x, y, z, PR[i], PC[i]]);
    fx.cyl(m.steel, x, y + PR[i], z, 0.008, L3 - 0.25 - y - PR[i], 5, false);
  });
  { const zn = -Rin + 0.5, len = Rin - 0.5 + (flat ? DW - 0.3 : Rin - 0.5);                                                                       // the meridian line (true north-south through the pier): brass in a pale band, a mark every metre
    fx.frame(cx, cz); fx.slab(m.white, -0.2, GH + 0.001, zn, 0.4, 0.004, len, 'D').slab(m.brass, -0.05, GH + 0.004, zn, 0.1, 0.004, len, 'D');
    for (let z = Math.ceil(zn); z < zn + len; z++) fx.slab(m.brass, -0.3, GH + 0.003, z - 0.02, 0.6, 0.004, 0.04, 'D'); }
  if (!low) for (let i = 0; i < 90; i++) { const a = rnd() * TAU, r = 1.2 + Math.sqrt(rnd()) * (Rin - 1.6), q = 0.02 + rnd() * 0.035; fx.slab(m.lamp, r * Math.cos(a) - q, L3 - 0.262, r * Math.sin(a) - q, 2 * q, 0.01, 2 * q, 'U'); }   // stars in the ceiling
  si.ring(m.lamp, Rin - 0.5, Rin - 0.38, L3 - 0.27, 72, -1);                                                                                      // a ring of light round the ceiling

  // ---------- the stair up the drum wall: hall to fourth storey (58 risers, two landings) ----------
  const yOf = i => GH + (i + 1) * RISE, lowPart = i => yOf(i) - 0.3 - GH < 2.3;
  let prev = null;
  for (let i = 0; i < NSTEP; i++) {
    const y = yOf(i), parts = LANDS.includes(i) ? 5 : 1, wa = (A[i] - A[i + 1]) / parts;
    for (let q = 0; q < parts; q++) {
      const am = A[i] - (q + 0.5) * wa, zw = wa * Rin + 0.03;
      rad(b, am); b.box(m.tread, rc + 0.01, y - 0.15, 0, Rin - r0 + 0.02, 0.3, zw, 'E'); if (!q) b.box(m.nosing, rc, y + 0.001, zw / 2 - 0.03, Rin - r0, 0.008, 0.05, 'DE');
      if (lowPart(i)) { rad(b, am); b.box(m.pl, r0 + 0.05, (GH + y - 0.3) / 2, 0, 0.1, y - 0.3 - GH, zw, 'UDE'); }                                // closed space under the first treads
      rad(c, am); c.box('generic', r0 - 0.04, lowPart(i) ? (GH + y + 1.1) / 2 : y + 0.375, 0, 0.06, lowPart(i) ? y + 1.1 - GH : 1.45, wa * r0 + 0.02);    // the balustrade (and the closed space) stops the walker
    }
    // collision: a ramp per tread (the landings level)
    const aa = A[i], ab = A[i] - dA, ae = A[i + 1], P = (r, a, yy) => [cx + r * Math.cos(a), yy, cz + r * Math.sin(a)];
    c.frame(0, 0, 0); upQuad(c, P(r0 - 0.02, aa, y - RISE), P(Rin, aa, y - RISE), P(Rin, ab, y), P(r0 - 0.02, ab, y)); if (ae < ab - 1e-6) upQuad(c, P(r0 - 0.02, ab, y), P(Rin, ab, y), P(Rin, ae, y), P(r0 - 0.02, ae, y));
    if (i % 2 === 0 || i === NSTEP - 1) {                                              // balustrade: posts, three rails; a rail on the wall
      const am = (A[i] + A[i + 1]) / 2, p = P(r0 + 0.04, am, y), wq = P(Rin - 0.07, am, y + 0.95);
      fx.frame(0, 0, 0); fx.cyl(m.steel, p[0], y, p[2], 0.02, 1.0, 6, false);
      if (prev) { for (const h of [1.0, 0.68, 0.36]) fx.strut(m.steel, [prev.p[0], prev.p[1] + h, prev.p[2]], [p[0], y + h, p[2]], h === 1.0 ? 0.05 : 0.025); fx.strut(m.steel, prev.w, wq, 0.04); }
      prev = { p, w: wq };
    }
  }
  { const i = 14, am = A[i + 1]; rad(b, am); b.box(m.pl, rc, (GH + yOf(i) - 0.3) / 2, 0, Rin - r0, yOf(i) - 0.3 - GH, 0.1, 'UD'); rad(c, am); c.box('generic', rc, (GH + yOf(i)) / 2, 0, Rin - r0, yOf(i) - GH, 0.1); }   // end of the closed space
  // fourth storey: floor colliders, the guard round the slot, the ring of columns under the top storey
  c.frame(0, 0, 0);
  for (let i = 0; i < 36; i++) {
    const a = i * 10 * RAD, a2 = a + 10 * RAD, P = (r, q, y) => [cx + r * Math.cos(q), y, cz + r * Math.sin(q)], inSlot = q => turn(q - SLOT0) > -0.001 && turn(q - SLOT0) < turn(SLOT1 - SLOT0) + 0.001;
    upQuad(c, P(0, a, GH), P(Rin, a, GH), P(Rin, a2, GH), P(0, a, GH)); upQuad(c, P(0, a, L3), P(r0 - 0.06, a, L3), P(r0 - 0.06, a2, L3), P(0, a, L3));
    upQuad(c, P(Rg - 0.05, a, terrace), P(R - 0.25, a, terrace), P(R - 0.25, a2, terrace), P(Rg - 0.05, a2, terrace)); upQuad(c, P(Rd - 0.1, a, ringTop), P(Rring, a, ringTop), P(Rring, a2, ringTop), P(Rd - 0.1, a2, ringTop));
    void inSlot;
  }
  { const n = 30, span = turn(SLOT1 - SLOT0), rest = TAU - span, P = (r, q, y) => [cx + r * Math.cos(q), y, cz + r * Math.sin(q)];
    for (let i = 0; i < n; i++) { const a = SLOT1 + rest * i / n, a2 = SLOT1 + rest * (i + 1) / n; upQuad(c, P(r0 - 0.06, a, L3), P(Rin, a, L3), P(Rin, a2, L3), P(r0 - 0.06, a2, L3)); }
    for (let i = 0; i < 8; i++) { const a = SLOT0 + span * (i + 0.5) / 8; rad(c, a); c.box('generic', r0 - 0.12, L3 + 0.6, 0, 0.06, 1.2, span / 8 * r0 + 0.02); rad(fx, a); fx.box(m.gdoor, r0 - 0.1, L3 + 0.5, 0, 0.02, 0.9, span / 8 * r0, 'UDNS').box(m.steel, r0 - 0.1, L3 + 1.0, 0, 0.05, 0.05, span / 8 * r0 + 0.01); }
    rad(c, SLOT1); c.box('generic', rc, L3 + 0.6, 0.05, Rin - r0 + 0.1, 1.2, 0.06); rad(fx, SLOT1); fx.box(m.gdoor, rc, L3 + 0.5, 0.05, Rin - r0, 0.9, 0.02, 'UDEW').box(m.steel, rc, L3 + 1.0, 0.05, Rin - r0 + 0.1, 0.05, 0.05);
  }
  local(b); for (let i = 0; i < 12; i++) { const a = (i + 0.5) / 12 * TAU; b.cyl(m.white, Rg * Math.cos(a), L3, Rg * Math.sin(a), 0.2, OB - 0.25 - L3, 12, false); local(c); c.box('generic', Rg * Math.cos(a), L3 + 1.4, Rg * Math.sin(a), 0.4, 2.8, 0.4); }
  // ---------- the straight flight from the fourth storey to the observatory (20 risers), and the guard round its opening ----------
  {
    const n = 20, rs = (OB - L3) / n, xt = FX0 + 0.3, go = (FX1 - xt) / n;             // it climbs eastward from xt
    local(b); local(fx); local(c);
    for (let i = 0; i < n; i++) { b.slab(m.tread, xt + i * go, L3, FZ0 + 0.05, go, (i + 1) * rs, FZ1 - FZ0 - 0.1, 'DE').slab(m.nosing, xt + i * go, L3 + (i + 1) * rs, FZ0 + 0.05, 0.05, 0.006, FZ1 - FZ0 - 0.1, 'D'); }
    for (const z of [FZ0, FZ1 - 0.05]) for (let i = 0; i < n; i++) b.slab(m.pl, xt + i * go, L3, z, go, (i + 1) * rs + 0.1, 0.05, 'DEW');   // closed sides under the flight
    b.slab(m.pl, FX1 - 0.05, L3, FZ0, 0.05, OB - 0.25 - L3, FZ1 - FZ0, 'DU');
    for (const z of [FZ0 + 0.03, FZ1 - 0.03]) { fx.strut(m.steel, [cx + xt, L3 + 1.0, cz + z], [cx + FX1, OB + 1.0, cz + z], 0.05); fx.frame(cx, cz); fx.slab(m.steel, FX0, OB + 0.975, z - 0.025, FX1 - FX0, 0.05, 0.05).slab(m.gdoor, FX0, OB + 0.05, z - 0.008, FX1 - FX0, 0.9, 0.016, 'UDEW'); }
    fx.slab(m.steel, FX0 - 0.025, OB + 0.975, FZ0, 0.05, 0.05, FZ1 - FZ0).slab(m.gdoor, FX0 - 0.008, OB + 0.05, FZ0, 0.016, 0.9, FZ1 - FZ0, 'UDNS');
    c.frame(cx, cz); upQuad(c, [xt, L3, FZ0], [xt, L3, FZ1], [FX1, OB, FZ1], [FX1, OB, FZ0]);
    c.slab('generic', FX0, L3 + 0.02, FZ0 - 0.06, FX1 - FX0, OB + 1.2 - L3, 0.06).slab('generic', FX0, L3 + 0.02, FZ1, FX1 - FX0, OB + 1.2 - L3, 0.06).slab('generic', FX0 - 0.06, OB + 0.02, FZ0, 0.06, 1.2, FZ1 - FZ0)
      .slab('generic', FX1 - 0.05, L3 + 0.02, FZ0, 0.05, OB - 0.3 - L3, FZ1 - FZ0);
  }

  // ---------- colliders of the shell: drum wall (the doorway left open), the wall of the observatory ----------
  const edges = [had + 0.004]; for (let a = 10 * RAD; a < TAU - had - 0.05; a += 5 * RAD) edges.push(a); edges.push(TAU - had - 0.004);
  for (let i = 0; i < edges.length - 1; i++) { const a = (edges[i] + edges[i + 1]) / 2, hwd = (edges[i + 1] - edges[i]) / 2; rad(c, AD + a); c.slab('generic', R * Math.cos(hwd) - WT, 0, -R * Math.sin(hwd) - 0.01, WT + R * (1 - Math.cos(hwd)), wallTop, 2 * R * Math.sin(hwd) + 0.02); }
  rad(c, AD); c.slab('generic', R * Math.cos(had) - WT, DH, -0.97, WT + 0.05, wallTop - DH, 1.94);                                               // over the door
  for (let i = 0; i < 36; i++) { rad(c, (i + 0.5) * 10 * RAD); c.slab('generic', RO, OB + 0.02, -0.72, 0.25, ringBot - OB, 1.44); }

  // ================= FITTINGS AND FURNITURE (near only) =================
  // hall: information sheets between the windows, show cases, benches, a desk by the door
  const sheet = (a, y, i, r = Rin, hw2 = 0.75, h = 1.5) => {                               // an information sheet on the curved wall at angle a
    if (inCut(a, r, 0.12)) return; rad(fx, a); const u0 = (i % 4) / 4, v0 = i % 8 < 4 ? 0.5 : 0, x = r - 0.03;
    uvq(fx, m.sheets, [x, y, -hw2], [x, y, hw2], [x, y + h, hw2], [x, y + h, -hw2], u0, v0, u0 + 0.25, v0 + 0.5); fx.box(m.frame, x + 0.012, y + h / 2, 0, 0.01, h + 0.06, 2 * hw2 + 0.06);
  };
  [160, 180, 200, 220].forEach((a, i) => sheet(a * RAD, GH + 1.1, i));                    // (the stair runs along the rest of the wall)
  local(fx); local(c);
  const caseAt = (x, z, kind) => {                                                         // a plinth with a glass hood and something under it
    fx.box(m.walnut, x, GH + 0.45, z, 0.9, 0.9, 0.9, 'D').box(m.gdoor, x, GH + 1.25, z, 0.8, 0.7, 0.8, 'D'); c.box('generic', x, GH + 0.82, z, 0.9, 1.6, 0.9);
    if (kind === 0) fx.box(m.black, x, GH + 1.05, z, 0.35, 0.28, 0.3).box(m.black, x + 0.1, GH + 1.2, z - 0.05, 0.2, 0.14, 0.2);                 // a meteorite
    else if (kind === 1) fx.cyl(m.brass, x, GH + 0.9, z, 0.22, 0.03, 20).box(m.brass, x, GH + 1.02, z + 0.02, 0.014, 0.2, 0.3);   // a sundial
    else planets.push([x, GH + 1.22, z, 0.26, kind === 2 ? 0x3f78c9 : 0xb9b4aa]);                                                                 // a globe of the earth, of the moon
  };
  caseAt(-5.2, -6.6, 0); caseAt(-7.8, -2.6, 1); caseAt(-7.6, 2.2, 2); caseAt(5.6, -7.0, 3);
  for (const [x, z, a] of [[-3.4, -9.6, 0.34], [-9.6, 0.2, 1.57], [7.2, 3.6, -1.1]]) { fx.frame(cx + x, cz + z, a, GH); fx.box(m.walnut, 0, 0.42, 0, 2.0, 0.06, 0.5).box(m.black, -0.8, 0.2, 0, 0.06, 0.4, 0.44).box(m.black, 0.8, 0.2, 0, 0.06, 0.4, 0.44); c.frame(cx + x, cz + z, a, GH); c.box('generic', 0, 0.27, 0, 2.0, 0.5, 0.5); }
  rad(fx, 20 * RAD, GH); rad(c, 20 * RAD, GH);                                             // information desk beside the door
  fx.slab(m.walnut, Rin - 2.6, 0, -1.2, 0.6, 1.05, 2.4, 'D').slab(m.gran, Rin - 2.66, 1.05, -1.26, 0.72, 0.04, 2.52).slab(m.screen, Rin - 2.2, 1.09, -0.3, 0.03, 0.3, 0.5).slab(m.black, Rin - 1.6, 0.44, -0.25, 0.46, 0.06, 0.46).slab(m.black, Rin - 1.2, 0.5, -0.25, 0.05, 0.5, 0.46);
  c.slab('generic', Rin - 2.66, 0.02, -1.26, 0.72, 1.1, 2.52);
  // fourth storey: activity room. Benches in two arcs facing the straight wall, a table of models, sheets on the walls
  for (let i = 1; i < 6; i++) for (const r of [6.3, 9.3]) {
    const a = (CUT ?? Math.PI / 2) + Math.PI + (i - 3) * (r > 8 ? 0.22 : 0.3), x = r * Math.cos(a), z = r * Math.sin(a); if (Math.hypot(x - 0.15, z + 3.4) < 3.6 && z < -1.8) continue;
    fx.frame(cx + x, cz + z, -a + Math.PI / 2, L3); fx.box(m.sofa, 0, 0.4, 0, 1.5, 0.08, 0.42).box(m.black, -0.6, 0.18, 0, 0.05, 0.36, 0.38).box(m.black, 0.6, 0.18, 0, 0.05, 0.36, 0.38); c.frame(cx + x, cz + z, -a + Math.PI / 2, L3); c.box('generic', 0, 0.27, 0, 1.5, 0.5, 0.42);
  }
  [160, 180, 200, 280, 300, 320, 340, 0, 20].forEach((a, i) => sheet(a * RAD, L3 + 0.75, i + 3, Rin, 0.7, 1.4));
  { const a = (CUT ?? Math.PI / 2) + 0.9, x = 5.2 * Math.cos(a), z = 5.2 * Math.sin(a); fx.frame(cx + x, cz + z, -a, L3); fx.box(m.walnut, 0, 0.74, 0, 1.0, 0.05, 2.6).box(m.black, 0, 0.37, -1.2, 0.8, 0.74, 0.05).box(m.black, 0, 0.37, 1.2, 0.8, 0.74, 0.05).cyl(m.tube, 0, 0.77, -0.7, 0.07, 0.6, 10).box(m.black, 0, 0.9, 0.2, 0.3, 0.26, 0.3); c.frame(cx + x, cz + z, -a, L3); c.box('generic', 0, 0.42, 0, 1.0, 0.8, 2.6); planets.push([x, L3 + 1.05, z, 0.24, 0x3f78c9]); }
  for (let i = 0; i < 8; i++) { const a = i * TAU / 8 + 0.3, r = 5.2; local(fx); fx.slab(m.lamp, r * Math.cos(a) - 0.3, OB - 0.28, r * Math.sin(a) - 0.3, 0.6, 0.03, 0.6, 'U'); }
  // observatory: the telescope on its mount, control desk, cabinet, observing ladder, lamps
  {
    const up = new THREE.Vector3(0, 1, 0), dir = new THREE.Vector3(es[0] * Math.cos(58 * RAD), Math.sin(58 * RAD), es[1] * Math.cos(58 * RAD)), pivot = new THREE.Vector3(cx, OB + 1.75, cz);
    const polar = new THREE.Vector3(0, Math.sin(23 * RAD), -Math.cos(23 * RAD));          // the polar axis: toward north, raised by the latitude of Guangzhou
    const along = (v, o) => new THREE.Matrix4().compose(o, new THREE.Quaternion().setFromUnitVectors(up, v.clone().normalize()), new THREE.Vector3(1, 1, 1));
    local(fx); fx.cyl(m.black, 0, OB + 1.2, 0, 0.3, 0.12, 16).box(m.black, 0, OB + 1.45, 0.05, 0.36, 0.5, 0.5);                                   // mount head on the pier
    fx.setMatrix(along(polar, pivot.clone().addScaledVector(polar, -0.45))); fx.cyl(m.black, 0, 0, 0, 0.11, 0.9, 12);                              // polar axis
    const dec = new THREE.Vector3().crossVectors(polar, dir).normalize(), tubeAt = pivot.clone().addScaledVector(dec, 0.42);
    fx.setMatrix(along(dec, pivot.clone().addScaledVector(dec, -1.1))); fx.cyl(m.steel, 0, 0, 0, 0.05, 1.6, 10).cyl(m.black, 0, 0.05, 0, 0.17, 0.14, 14).cyl(m.black, 0, 0.24, 0, 0.17, 0.14, 14);   // declination shaft with counterweights
    fx.setMatrix(along(dir, tubeAt.clone().addScaledVector(dir, -1.5)));                                                                           // the tube: 3.3 m refractor with a dew cap, focuser, finder
    fx.cyl(m.tube, 0, 0, 0, 0.17, 2.9, 20).cyl(m.tube, 0, 2.9, 0, 0.2, 0.42, 20, false).cyl(m.black, 0, 3.3, 0, 0.185, 0.02, 20).cyl(m.black, 0, -0.32, 0, 0.07, 0.32, 12).cyl(m.black, 0, 1.2, 0, 0.19, 0.5, 16).cyl(m.black, 0.26, 0.5, 0, 0.04, 0.8, 8).box(m.black, 0.16, 0.9, 0, 0.2, 0.05, 0.05);
    local(fx); local(c); c.box('generic', 0, OB + 1.6, 0, 1.3, 1.9, 1.3);
    // control desk on the west side, facing the telescope: two screens, keyboard, chair
    fx.slab(m.walnut, -6.3, OB + 0.72, -1.6, 0.8, 0.05, 3.2).slab(m.cabinet, -6.3, OB, -1.6, 0.8, 0.72, 0.06, 'UD').slab(m.cabinet, -6.3, OB, 1.54, 0.8, 0.72, 0.06, 'UD').slab(m.cabinet, -6.28, OB, -0.5, 0.5, 0.7, 1.0, 'UD');
    for (const z of [-0.9, 0.2]) fx.slab(m.black, -6.2, OB + 0.86, z, 0.03, 0.36, 0.62).slab(m.screen, -6.168, OB + 0.88, z + 0.02, 0.004, 0.32, 0.58).slab(m.black, -6.18, OB + 0.77, z + 0.26, 0.1, 0.1, 0.1);
    fx.slab(m.black, -5.95, OB + 0.775, -0.5, 0.16, 0.014, 0.44).slab(m.black, -5.35, OB + 0.44, -0.6, 0.46, 0.06, 0.46).slab(m.black, -4.94, OB + 0.5, -0.6, 0.05, 0.5, 0.46).slab(m.black, -5.15, OB, -0.4, 0.06, 0.44, 0.06, 'UD').slab(m.red, -6.25, OB + 1.5, 1.2, 0.08, 0.08, 0.08);
    c.slab('generic', -6.3, OB + 0.02, -1.6, 0.8, 1.2, 3.2);
    fx.slab(m.cabinet, 4.9, OB, 3.4, 0.6, 1.9, 1.2, 'D').slab(m.black, 4.89, OB + 0.1, 3.5, 0.004, 1.7, 1.0); c.slab('generic', 4.9, OB + 0.02, 3.4, 0.6, 1.9, 1.2);                               // equipment rack
    for (let i = 0; i < 3; i++) fx.slab(m.steel, 1.5 + i * 0.3, OB + i * 0.28, 1.6, 0.3, 0.28, 0.7, i ? 'D' : 'D'); fx.slab(m.steel, 2.38, OB + 0.84, 1.6, 0.03, 0.9, 0.03).slab(m.steel, 2.38, OB + 0.84, 2.27, 0.03, 0.9, 0.03).slab(m.steel, 2.38, OB + 1.72, 1.6, 0.03, 0.03, 0.7); c.slab('generic', 1.5, OB + 0.02, 1.6, 0.9, 0.84, 0.7);   // observing steps
    [200, 235, 270, 305].forEach((a, i) => { sheet(a * RAD, OB + 0.8, i + 4, RO, 0.7, 1.4); rad(fx, a * RAD); fx.slab(m.red, RO - 0.1, OB + 2.35, -0.05, 0.08, 0.08, 0.1); });
    local(fx); for (let i = 0; i < 4; i++) { const a = i * TAU / 4 + 0.6; fx.slab(m.lamp, 7.0 * Math.cos(a) - 0.2, ringBot - 0.03, 7.0 * Math.sin(a) - 0.2, 0.4, 0.03, 0.4, 'U'); }
    s.ring(m.steel, Rd - 0.42, Rd - 0.3, ringTop + 0.06, 72, 1).wall(m.steel, Rd - 0.42, 0, TAU, ringBot + 0.3, ringTop + 0.06, 72, -1);                                                         // the ring the dome turns on
  }

  if (ctx.occupy) { const P = (r, z) => [cx + r * Math.cos(AD) - z * Math.sin(AD), cz + r * Math.sin(AD) + z * Math.cos(AD)]; ctx.occupy([P(R - 0.3, -2.4), P(R + 2.6, -2.4), P(R + 2.6, 2.4), P(R - 0.3, 2.4)]); }   // steps and canopy of the door stand outside the drum: the grounds keep trees and lamps off them

  // ================= assemble =================
  const shell = ctx.add(mergeFlat(b.build({ name: item.id + '-shell' }), true));
  for (const o of shell.children) if (o.material === m.pl) { o.onBeforeRender = followDaylight; o.frustumCulled = false; }
  const fit = mergeFlat(fx.build({ name: item.id + '-fittings', castShadow: false }), false);
  { const geo = new THREE.SphereGeometry(1, 24, 16), im = new THREE.InstancedMesh(geo, m.planet, planets.length), M4 = new THREE.Matrix4(), col = new THREE.Color();   // the planets (and the globes in the show cases)
    planets.forEach(([x, y, z, r, hex], i) => { im.setMatrixAt(i, M4.makeScale(r, r, r).setPosition(cx + x, y, cz + z)); im.setColorAt(i, col.setHex(hex)); }); im.name = item.id + '-planets'; im.computeBoundingSphere(); fit.add(im);
    const sun = new THREE.Mesh(new THREE.SphereGeometry(1.5, 32, 20), m.sun); sun.position.set(cx, GH + 5.0, cz); fit.add(sun);
    const ringG = new THREE.RingGeometry(0.8, 1.25, 40); ringG.rotateX(-1.25); const sr = new THREE.Mesh(ringG, plain('dome-saturnring', 0xcdb98a, 0.8, 0, { side: THREE.DoubleSide })); sr.position.set(cx + planets[5][0], planets[5][1], cz + planets[5][2]); fit.add(sr); }
  ctx.detail(ctx.add(fit), cx, cz, 48);
  const cg = ctx.add(c.build({ name: item.id + '-colliders' })); cg.visible = false;
  cg.traverse(o => { if (o.isMesh) ctx.collide(o); });
}

// Draw-call saver: plain-coloured parts marked userData.flat become one vertex-coloured mesh.
let flatMat = null;
function mergeFlat(group, castShadow) {
  const take = group.children.filter(o => o.isMesh && !o.isInstancedMesh && o.material.userData.flat);
  if (take.length < 2) return group;
  let nv = 0, ni = 0; for (const o of take) { nv += o.geometry.attributes.position.count; ni += o.geometry.index.count; }
  const pos = new Float32Array(nv * 3), nor = new Float32Array(nv * 3), col = new Float32Array(nv * 3), idx = new Uint32Array(ni);
  let v0 = 0, i0 = 0;
  for (const o of take) {
    const g = o.geometry, n = g.attributes.position.count, cc = o.material.color, ix = g.index.array;
    pos.set(g.attributes.position.array, v0 * 3); nor.set(g.attributes.normal.array, v0 * 3);
    for (let i = 0; i < n; i++) { col[(v0 + i) * 3] = cc.r; col[(v0 + i) * 3 + 1] = cc.g; col[(v0 + i) * 3 + 2] = cc.b; }
    for (let i = 0; i < ix.length; i++) idx[i0 + i] = ix[i] + v0;
    v0 += n; i0 += ix.length; group.remove(o); g.dispose();
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.BufferAttribute(nor, 3)); g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  g.setIndex(new THREE.BufferAttribute(idx, 1));
  if (!flatMat) { flatMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.72, metalness: 0.03 }); flatMat.name = 'dome-flat'; }
  const mesh = new THREE.Mesh(g, flatMat); mesh.castShadow = castShadow; mesh.receiveShadow = true; group.add(mesh);
  return group;
}
