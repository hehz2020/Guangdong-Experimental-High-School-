// Long curved building north of the teaching core (item "arc-building"). Exterior only: nobody can go in or onto the roof.
//
// SEEN in the references
// - Concave (south) face, 2022 "一本书的梦" frames 9-18: a red frame (wide red end pier, red band from the top windows
//   up to the parapet, white coping) around a cream field with four rows of ribbon windows; a white ledge over each
//   window row with air-conditioner units standing on it; a white surround to the top row; curtains behind the glass.
//   The red cladding is a speckled orange-red tile (the notes call it red brick). 2018 frames 67-69 show the same
//   red-framed field starting right behind the west corner, so the motif is repeated along the whole face.
// - Roof, same frames plus frame 58 and 2018 frames 2-3: a roof garden behind the red parapet and, over it, a flat grey
//   concrete canopy on white posts with a deep white edge, pierced near the south edge by a row of long rectangular
//   openings with white rims (the "pergola" seen from below); trees grow up through the openings.
// - West end, 2018 frames 24-25, 43, 53, 55-56, 67-69 and 10: cream end wall with wide windows (three rows visible)
//   and a column of narrow ones; a blue-green glass curtain-wall box at the outer corner, taller than the cream wall;
//   a sloping white louvred panel over the cream wall; one large roof plane that tilts up toward the outer west corner,
//   carried on very tall slender white columns (inner corner, beside the glass box, free-standing beyond the outer corner).
// - East end, 2018 frames 2-3 (that this block is the arc's east end is the facade notes' guess): dark-red end wall with
//   a large cream panel holding a few small windows, open top level under the canopy.
// - North side, frame 58: red parapet, white posts and the canopy edge; nothing below the parapet is visible.
//   2018 frames 43, 53 and 67 show red wall behind the glass box on the outer side of the west end, with white columns
//   standing in front of it.
//
// ASSUMED (no reference supports these)
// - The whole convex (north) face below the parapet: kept plain, the same bands and ribbon windows as the concave
//   face but without ledges, air-conditioners, red piers or doors. Its first bays, under the tilted roof, are red
//   (see above); where the red stops and how the windows sit in it is a guess.
// - Which stretch of the concave face the 2022 frames show, hence the number of red-framed fields (five) and the
//   width of the red piers between them (two bays); bay length 3 m; pane size; curtain colours per window.
// - Storey heights: item.height (an estimate) is split 1.2 : 1 : 1 : 1 storeys, then parapet, posts and canopy edge in
//   the proportions read from frame 16. The canopy top is at item.height.
// - The ground floor everywhere (hidden by planting or trees in every frame): a fourth window row and one plain
//   glazed double door in the middle of each field.
// - The tilted west roof: its plan outline, fold line and overhangs, its rise (0.37 x item.height above the canopy at
//   the tip, read from frames 53 and 67, so the tip stands ABOVE item.height), and the number and exact places of the
//   tall columns. The louvred panel's size, number of slats and the two props under it. The glass box's depth.
// - Canopy details: post spacing (every third bay), cross beams, size of the openings, interior posts.
// - Positions and sizes of the rooftop trees and shrubs (planting is seen, its layout is not); they use the shared
//   tree shape from plants.js.
// - Size and position of the cream panel and its windows on the east end wall.
// NOT MODELLED: interiors; the green bicycle shelter at the foot of the west end (2018 frames 55-56); the dark green
// glazed section beside the east end (2018 frame 2); the junction with the round dome building.
import { THREE, mat } from '../../kit.js';
import { Batch } from '../../batch.js';
import { tree } from '../../plants.js';

const BAY = 2.97, PANES = 3, ATLAS = 8;      // bay length on the concave face = three window panes; panes drawn in the window texture
const T = 0.3, PROUD = 0.15, OV = 0.6;       // wall thickness; how far the red frame stands proud of the cream field; canopy overhang
const SLAB = 0.25, FASCIA = 0.8;             // canopy slab thickness and depth of its white edge
const D1 = 1.4, D2 = 4.6;                    // the row of roof openings lies between these distances from the south edge
const GX = 3.6, GD = 3.6, RECESS = 2.4;      // glass box at the west end (width, depth); how far the cream end wall sits back
const UP = [0, 1, 0], DOWN = [0, -1, 0];

// ---- small 2D helpers on [x, z] ----
const add = (a, ...r) => r.reduce((p, q) => [p[0] + q[0], p[1] + q[1]], a);
const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
const mul = (a, k) => [a[0] * k, a[1] * k];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1];
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const unit = a => mul(a, 1 / Math.hypot(a[0], a[1]));
const mix = (a, b, f) => [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
const P3 = (p, y) => [p[0], y, p[1]];
function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

/** Uniform Catmull-Rom through every point of an open polyline, `sub` samples per segment (the outline was traced as short chords of a smooth curve). */
function smooth(poly, steps) {
  const n = poly.length, P = [sub(mul(poly[0], 2), poly[1]), ...poly, sub(mul(poly[n - 1], 2), poly[n - 2])], out = [];
  for (let i = 0; i < n - 1; i++) for (let k = 0; k < steps; k++) {
    const t = k / steps, t2 = t * t, t3 = t2 * t, [a, b, c, d] = [P[i], P[i + 1], P[i + 2], P[i + 3]];
    out.push([0, 1].map(q => 0.5 * (2 * b[q] + (c[q] - a[q]) * t + (2 * a[q] - 5 * b[q] + 4 * c[q] - d[q]) * t2 + (3 * b[q] - a[q] - 3 * c[q] + d[q]) * t3)));
  }
  out.push(poly[n - 1]); return out;
}
/** Local frame running from A to B: +X along the wall, +Z to the right of that direction (the outside when walking with the building on the left). Returns the length. */
function along(b, A, B, y = 0, back = 0) {
  const dx = B[0] - A[0], dz = B[1] - A[1], L = Math.hypot(dx, dz);
  b.frame(A[0] - dx / L * back, A[1] - dz / L * back, Math.atan2(-dz, dx), y); return L;
}
/** Flat quad through four [x,y,z] corners given in order round the quad (two may coincide), turned to face `dir`. Needs the identity frame. */
function face(b, material, pts, dir) {
  let best = 0, area = -1, nrm = null;
  for (let i = 0; i < 4; i++) {                // start at the corner with the widest spread, so a collapsed corner never supplies the normal
    const a = pts[i], p = pts[(i + 1) % 4], q = pts[(i + 3) % 4], e = [p[0] - a[0], p[1] - a[1], p[2] - a[2]], f = [q[0] - a[0], q[1] - a[1], q[2] - a[2]];
    const n = [e[1] * f[2] - e[2] * f[1], e[2] * f[0] - e[0] * f[2], e[0] * f[1] - e[1] * f[0]], A = Math.hypot(n[0], n[1], n[2]);
    if (A > area) { area = A; best = i; nrm = n; }
  }
  if (area < 1e-6) return;
  const o = [0, 1, 2, 3].map(i => pts[(best + i) % 4]);
  if (nrm[0] * dir[0] + nrm[1] * dir[1] + nrm[2] * dir[2] < 0) b.quad(material, o[0], o[3], o[2], o[1]); else b.quad(material, o[0], o[1], o[2], o[3]);
}

// ---- materials drawn in code ----
function canvasTex(w, h, tileX, tileY, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h, rng(w * 31 + h * 7 + tileX * 1000));
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(1 / tileX, 1 / tileY); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  return t;
}
function drawRedTile(g, S, _h, r) {            // speckled orange-red cladding of frames 9-18
  g.fillStyle = 'rgb(182,80,50)'; g.fillRect(0, 0, S, S);
  for (let i = 0; i < 1500; i++) {
    const k = r(), x = r() * S, y = r() * S, len = 4 + r() * 9, a = (r() - 0.5) * 1.3;
    g.strokeStyle = k < 0.45 ? 'rgba(222,138,92,0.8)' : k < 0.78 ? 'rgba(140,56,38,0.8)' : 'rgba(232,182,132,0.7)';
    g.lineWidth = 2.2; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len); g.stroke();
  }
}
function drawWindows(g, W, H, r) {             // ATLAS panes side by side: aluminium frame, transom light, curtains
  const pw = W / ATLAS;
  for (let i = 0; i < ATLAS; i++) {
    const x = i * pw, k = r(), grad = g.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, '#c6ddd0'); grad.addColorStop(1, '#93b3a7'); g.fillStyle = grad; g.fillRect(x, 0, pw, H);
    if (k < 0.72) {                            // curtain, drawn fully or partly
      const lilac = r() < 0.45, cw = k < 0.5 ? pw : pw * (0.35 + r() * 0.3), cx = r() < 0.5 ? x : x + pw - cw;
      g.fillStyle = lilac ? '#cdc2d9' : '#e9f0e3'; g.fillRect(cx, 0, cw, H);
      g.strokeStyle = lilac ? '#b3a6c4' : '#cfdccb'; g.lineWidth = 2;
      for (let f = cx + 5; f < cx + cw - 2; f += 8 + r() * 6) { g.beginPath(); g.moveTo(f, 0); g.lineTo(f, H); g.stroke(); }
    } else if (k < 0.84) { g.fillStyle = 'rgba(40,52,52,0.6)'; g.fillRect(x, 0, pw, H); }   // open window, dark room
    g.fillStyle = '#eef0ec';
    g.fillRect(x, 0, 6, H); g.fillRect(x + pw - 6, 0, 6, H); g.fillRect(x, 0, pw, 8); g.fillRect(x, H - 8, pw, 8); g.fillRect(x, H * 0.28, pw, 7);
  }
}
function drawCurtainWall(g, S, _h, r) {        // 2 x 2 panes of blue-green glass with pale mullions
  const p = S / 2;
  for (let y = 0; y < 2; y++) for (let x = 0; x < 2; x++) {
    const k = 0.9 + r() * 0.2; g.fillStyle = `rgb(${Math.round(84 * k)},${Math.round(184 * k)},${Math.round(178 * k)})`; g.fillRect(x * p, y * p, p, p);
    const grad = g.createLinearGradient(x * p, y * p, x * p + p, y * p + p); grad.addColorStop(0, 'rgba(255,255,255,0.16)'); grad.addColorStop(0.5, 'rgba(255,255,255,0)');
    g.fillStyle = grad; g.fillRect(x * p, y * p, p, p);
  }
  g.fillStyle = '#d3e4e0';
  for (let i = 0; i <= 2; i++) { g.fillRect(i * p - 3, 0, 6, S); g.fillRect(0, i * p - 3, S, 6); }
}
let M = null;
function materials() {
  if (M) return M;
  const dom = typeof document !== 'undefined', std = o => new THREE.MeshStandardMaterial(o);
  M = {
    red: std({ color: dom ? 0xffffff : 0xa5452f, roughness: 0.9, map: dom ? canvasTex(256, 256, 1.2, 1.2, drawRedTile) : null }),
    win: std({ color: dom ? 0xffffff : 0x9fb5ac, roughness: 0.3, metalness: 0.1, map: dom ? canvasTex(1024, 256, 1, 1, drawWindows) : null }),
    curtain: std({ color: dom ? 0xffffff : 0x54b8b2, roughness: 0.15, metalness: 0.05, map: dom ? canvasTex(256, 256, 2.4, 2.4, drawCurtainWall) : null }),
    white: std({ color: 0xf1f0ea, roughness: 0.85 }),                       // painted concrete: posts, beams, ledges, columns
    ac: std({ color: 0xe6e6e0, roughness: 0.6 }), fan: std({ color: 0x565c60, roughness: 0.7 }), pane: std({ color: 0x7d968e, roughness: 0.2, metalness: 0.1 }),             // plain glass of the doors and small windows
  };
  return M;
}
export function build(item, ctx) {
  const H = item.height, m = materials(), rnd = rng(20221);

  // ---------- plan: the two long edges, smoothed and cut into bays of equal length on the concave side ----------
  const half = item.points.length >> 1;
  let ea = item.points.slice(0, half), eb = item.points.slice(half).reverse();      // facing points of the two long edges
  if (ea[0][0] > ea[half - 1][0]) { ea.reverse(); eb.reverse(); }                    // run west to east
  const polyLen = p => p.slice(1).reduce((s, q, i) => s + dist(q, p[i]), 0);
  const [inn, out] = polyLen(ea) <= polyLen(eb) ? [ea, eb] : [eb, ea];               // the shorter edge is the concave one
  const di = smooth(inn, 24), dn = smooth(out, 24), cum = [0];
  for (let i = 1; i < di.length; i++) cum.push(cum[i - 1] + dist(di[i], di[i - 1]));
  const total = cum[cum.length - 1], NB = Math.max(16, Math.round(total / BAY)), bay = total / NB, PW = bay / PANES;
  const I = [], O = [];                                                              // bay corners on the concave (I) and convex (O) edge
  for (let j = 0, k = 0; j <= NB; j++) {
    const s = Math.min(j * bay, total); while (k < cum.length - 2 && cum[k + 1] < s) k++;
    const f = (s - cum[k]) / (cum[k + 1] - cum[k]); I.push(mix(di[k], di[k + 1], f)); O.push(mix(dn[k], dn[k + 1], f));
  }
  const W = I.map((p, j) => dist(p, O[j])), X = I.map((p, j) => unit(sub(O[j], p)));
  const pt = (j, d) => add(I[j], mul(X[j], d));                                      // point on cross-section j, d metres in from the concave face

  // ---------- heights, all derived from item.height ----------
  const u = H / 5.75, floorY = [0, 1.2 * u, 2.2 * u, 3.2 * u], deck = 4.2 * u, WIN = 0.5 * u;
  const sill = floorY.map((y, k) => y + (k ? 0.28 : 0.42) * u), head = sill.map(s => s + WIN);
  const parapet = deck + 0.55 * u, beamY = H - FASCIA;
  if (m.win.map) m.win.map.repeat.set(1 / (ATLAS * PW), 1 / WIN);

  // red-framed fields along the concave face: pier (1 bay), then fields of `fb` bays separated by 2-bay piers
  const nF = Math.max(1, Math.round((NB - 3) / 12)), fb = Math.floor((NB - 3 - 2 * (nF - 1)) / nF);
  const fieldOf = new Array(NB).fill(-1), posIn = new Array(NB).fill(0);
  for (let f = 0, j = 1; f < nF; f++, j += fb + 2) for (let i = 0; i < fb; i++) { fieldOf[j + i] = f; posIn[j + i] = i; }

  // the tilted west roof is hinged on a fold line that runs from cross-section jfi on the concave edge to jfo on the convex edge
  const jfi = Math.min(NB - 4, Math.max(1, Math.round(6 / bay))), jfo = Math.min(NB - 2, Math.max(jfi + 2, Math.round(24.5 / bay)));

  const v = new Batch(), c = new Batch();
  // ribbon-window glass: the texture starts on a pane edge, at a random pane of the atlas; leaves the plain frame A->B set
  const glaze = (A, B, k, x0, len, z = -0.17) => {
    const off = PW * (1 + Math.floor(rnd() * ATLAS));
    along(v, A, B, sill[k], off - x0); v.slab(m.win, off, 0, z, len, WIN, 0.03, 'EWNUD'); along(v, A, B);
  };

  // ---------- concave (south) face ----------
  for (let j = 0; j < NB; j++) {
    const A = I[j], B = I[j + 1], L = along(v, A, B);
    v.slab(m.white, 0, parapet, -T - 0.03, L, 0.09, T + PROUD + 0.06, 'D');                    // coping
    if (fieldOf[j] < 0) { v.slab(m.red, 0, 0, -T, L, parapet, T + PROUD, 'D'); continue; }     // red pier, ground to parapet
    const first = posIn[j] === 0, last = posIn[j] === fb - 1, door = posIn[j] === (fb >> 1), ends = 'N' + (first ? '' : 'W') + (last ? '' : 'E');
    let y = 0;
    for (let k = 0; k < 4; k++) {                                                              // cream spandrel under each window row
      if (!(door && k === 0)) v.slab('wallCream', 0, y, -T, L, sill[k] - y, T, 'EWN');
      y = head[k];
    }
    v.slab(m.red, 0, y, -T, L, parapet - y, T + PROUD, 'EW');                                  // red band over the top row, also the parapet
    if (door) {                                                                                // ASSUMED plain glazed double door
      v.slab('wallCream', 0, 0, -T, 0.4, head[0], T, 'N').slab('wallCream', L - 0.4, 0, -T, 0.4, head[0], T, 'N');
      v.slab(m.pane, 0.4, 0, -0.2, L - 0.8, head[0], 0.04, 'EWNUD');
      for (const x of [0.4, L / 2 - 0.035, L - 0.47]) v.slab(m.white, x, 0, -0.2, 0.07, head[0], 0.09, 'ND');
      v.slab(m.white, 0.4, 2.2, -0.2, L - 0.8, 0.07, 0.09, 'N');
    }
    for (let k = 0; k < 4; k++) {
      const s = sill[k], hd = head[k];
      if (!(door && k === 0)) {
        v.slab(m.white, -0.05, s, -0.2, 0.1, WIN, 0.21, 'N');                                  // mullion on the bay joint
        if (last) v.slab(m.white, L - 0.05, s, -0.2, 0.1, WIN, 0.21, 'N');
        if (k < 3) v.slab(m.white, 0, s - 0.07, 0, L, 0.07, 0.1, ends);                        // sill
      }
      if (k < 3) {
        v.slab(m.white, 0, hd, 0, L, 0.1, k ? 0.45 : 0.7, ends);                               // ledge over the window head
        if (rnd() < 0.55) {                                                                    // air-conditioner units standing on it
          const n = rnd() < 0.3 ? 2 : 1, x0 = 0.25 + rnd() * (L - 1.3 - (n - 1) * 0.95);
          for (let i = 0; i < n; i++) {
            v.slab(m.ac, x0 + i * 0.95, hd + 0.1, 0.05, 0.8, 0.55, 0.3, 'N');
            v.slab(m.fan, x0 + i * 0.95 + 0.12, hd + 0.17, 0.35, 0.42, 0.42, 0.012, 'N');
          }
        }
      } else {                                                                                 // white surround of the top row
        v.slab(m.white, 0, hd - 0.1, -0.14, L, 0.1, 0.24, ends).slab(m.white, 0, s - 0.14, 0, L, 0.14, 0.1, ends);
        if (first) v.slab(m.white, 0, s - 0.14, 0, 0.14, WIN + 0.14, 0.1, 'N');
        if (last) v.slab(m.white, L - 0.14, s - 0.14, 0, 0.14, WIN + 0.14, 0.1, 'N');
      }
    }
    for (let k = door ? 1 : 0; k < 4; k++) glaze(A, B, k, 0, L);
  }

  // ---------- convex (north) face: ASSUMED, plain bands and ribbon windows. Bay 0 is the glass box of the west end ----------
  for (let j = 1; j < NB; j++) {
    const A = O[j + 1], B = O[j], L = along(v, A, B);
    v.slab(m.white, 0, parapet, -T - 0.03, L, 0.09, T + 0.06, 'D');
    if (j === NB - 1) { v.slab(m.red, 0, 0, -T, L, parapet, T + PROUD, 'D'); continue; }       // the red end wall turns the corner
    const wall = j < jfo ? m.red : 'wallCream';                                                // red behind the glass box, under the tilted roof (2018 frames 43, 53, 67)
    let y = 0;
    for (let k = 0; k < 4; k++) { v.slab(wall, 0, y, -T, L, sill[k] - y, T, 'EWN'); v.slab(m.white, 0, sill[k] - 0.07, 0, L, 0.07, 0.08, 'EWN'); y = head[k]; }
    v.slab(m.red, 0, y, -T, L, parapet - y, T, 'EW');                                          // red parapet band (frame 58)
    v.slab(wall, -0.25, 0, -T, 0.5, y, T + 0.06, 'N');                                          // pier on the bay joint
    for (let k = 0; k < 4; k++) glaze(A, B, k, 0, L);
  }

  // ---------- east end: red wall with a cream panel and a few small windows (2018 frames 2-3) ----------
  {
    const L = along(v, I[NB], O[NB]), px = 0.28 * L, pw = 0.64 * L;
    v.slab(m.red, -PROUD, 0, -T, L + 2 * PROUD, parapet, T + PROUD, 'D').slab(m.white, -PROUD, parapet, -T - 0.03, L + 2 * PROUD, 0.09, T + PROUD + 0.06, 'D');
    v.slab('wallCream', px, 1.0, PROUD, pw, deck - 2.4, 0.05, 'N');
    for (const k of [1, 2]) for (const f of [0.14, 0.44, 0.74]) {
      v.slab(m.pane, px + f * pw, sill[k], PROUD + 0.05, 1.0, 1.0, 0.08, 'N').slab(m.white, px + f * pw - 0.05, sill[k] - 0.07, PROUD + 0.05, 1.1, 0.07, 0.14, 'N');
    }
  }

  // ---------- west end: glass box at the outer corner, recessed cream wall with wide windows ----------
  const e = X[0], q = [e[1], -e[0]];                                                           // along the end wall toward the outer corner; outward (south-west)
  const W0 = along(v, O[0], I[0]), glassTop = Math.max(parapet + 1.2, Math.floor((H - 0.5) / 1.2) * 1.2);
  {
    v.slab(m.curtain, -0.1, 0, -GD, GX + 0.1, glassTop, GD + 0.1, 'D');
    for (const [x, z] of [[-0.1, 0.1], [GX, 0.1], [-0.1, -GD], [GX, -GD]]) v.slab(m.white, x - 0.15, 0, z - 0.15, 0.3, glassTop, 0.3, 'D');   // corner posts
    v.slab(m.white, -0.3, glassTop, -GD - 0.2, GX + 0.5, 0.25, GD + 0.5);
    const x0 = GX, x1 = W0 - T, ww = 4 * PW, wx = x1 - 1.3 - ww, sx = GX + 1.0, sw = 0.7, zw = -RECESS - T;
    let y = 0;
    for (let k = 0; k < 4; k++) {
      v.slab('wallCream', x0, y, zw, x1 - x0, sill[k] - y, T, 'EWN');
      for (const [a, b] of [[x0, sx], [sx + sw, wx], [wx + ww, x1]]) v.slab('wallCream', a, sill[k], zw, b - a, WIN, T, 'N');
      v.slab(m.pane, sx, sill[k], -RECESS - 0.16, sw, WIN, 0.03, 'EWNUD');
      v.slab(m.white, wx - 0.05, sill[k] - 0.07, -RECESS, ww + 0.1, 0.07, 0.08, 'N').slab(m.white, sx - 0.05, sill[k] - 0.07, -RECESS, sw + 0.1, 0.07, 0.08, 'N');
      y = head[k];
    }
    v.slab('wallCream', x0, y, zw, x1 - x0, parapet - y, T, 'EW').slab(m.white, x0, parapet, zw - 0.03, x1 - x0, 0.09, T + 0.06, 'D');
    for (let k = 0; k < 4; k++) glaze(O[0], I[0], k, wx, ww, -RECESS - 0.16);
    // sloping white louvred panel over the cream wall (2018 frames 53, 56, 67-69)
    const lx0 = GX + 0.5, lx1 = W0 - 0.7, zf = -RECESS + 0.3, yf = parapet + 0.25, zb = zf - 5.0, yb = yf + 2.9, n = 6;
    const sl = (xa, xb, f0, f1) => {
      const z0 = zf + (zb - zf) * f0, y0 = yf + (yb - yf) * f0, z1 = zf + (zb - zf) * f1, y1 = yf + (yb - yf) * f1;
      v.quad(m.white, [xa, y0, z0], [xb, y0, z0], [xb, y1, z1], [xa, y1, z1]).quad(m.white, [xa, y0 - 0.05, z0], [xa, y1 - 0.05, z1], [xb, y1 - 0.05, z1], [xb, y0 - 0.05, z0]);
    };
    for (let i = 0; i < n; i++) sl(lx0, lx1, i / n, (i + 0.62) / n);
    sl(lx0 - 0.12, lx0, 0, 1); sl(lx1, lx1 + 0.12, 0, 1);
    for (const x of [lx0 - 0.16, lx1 - 0.04]) v.slab(m.white, x, deck, zb - 0.1, 0.2, yb - deck, 0.2, 'D');      // ASSUMED props under its upper edge
  }

  // ---------- the tilted roof over the west end: a plane hinged on a fold line, rising toward the outer west corner ----------
  const TIP = 0.37 * H, WTH = 0.3;                                                              // rise of the tip above the flat canopy; slab thickness
  const tip = add(O[0], mul(e, 8.3), mul(q, 3.5)), swIn = add(I[0], mul(e, -OV), mul(q, 2.5));
  const Fi = pt(jfi, -OV), Fo = pt(jfo, W[jfo] + OV), fd = unit(sub(Fo, Fi));
  let fn = [fd[1], -fd[0]]; if (dot(sub(tip, Fi), fn) < 0) fn = mul(fn, -1);                   // across the fold line, toward the tip
  const slope = TIP / dot(sub(tip, Fi), fn), top = p => H + slope * Math.max(0, dot(sub(p, Fi), fn));
  const ovOut = j => OV + 5.4 * (1 - j / jfo);                                                 // overhang beyond the convex face, widest at the west end
  // dF[j]: how far across cross-section j the flat canopy reaches (the fold line west of jfo, the north edge east of it)
  const dF = I.map((p, j) => j <= jfi ? -OV : j < jfo ? -dot(sub(p, Fi), fn) / dot(X[j], fn) : W[j] + OV);
  v.frame(0, 0, 0);
  {
    const secs = [[swIn, tip]];
    for (let j = 0; j <= jfo; j++) secs.push([pt(j, dF[j]), j < jfo ? pt(j, W[j] + ovOut(j)) : Fo]);
    const edge = (p0, p1, outDir) => {                                                         // white edge of the tilted slab, seen from both sides
      const ring = [P3(p0, top(p0) - 0.5), P3(p1, top(p1) - 0.5), P3(p1, top(p1) + 0.06), P3(p0, top(p0) + 0.06)];
      face(v, m.white, ring, [outDir[0], 0, outDir[1]]); face(v, m.white, ring, [-outDir[0], 0, -outDir[1]]);
    };
    for (let s = 0; s < secs.length - 1; s++) {
      const [a0, b0] = secs[s], [a1, b1] = secs[s + 1], ring = [a0, a1, b1, b0];
      face(v, 'roofGrey', ring.map(p => P3(p, top(p))), UP); face(v, m.white, ring.map(p => P3(p, top(p) - WTH)), DOWN);
      const outward = sub(mix(b0, b1, 0.5), mix(a0, a1, 0.5));
      edge(b0, b1, outward); if (s <= jfi) edge(a0, a1, mul(outward, -1));
    }
    edge(swIn, tip, q);
    // very tall slender columns from the ground to the tilted roof (collide), and shorter posts on the convex parapet
    const cols = [add(I[0], mul(q, 0.55), mul(e, -0.55)), add(O[0], mul(e, -(GX + 0.45)), mul(q, 0.6)), add(O[0], mul(e, 0.65), mul(q, 0.6)), add(O[0], mul(e, 5.4), mul(q, 1.2))];
    for (const j of [2, 4, 6]) if (j < jfo) cols.push(pt(j, W[j] + ovOut(j) - 0.7));
    c.frame(0, 0, 0);
    for (const p of cols) { v.cyl(m.white, p[0], 0, p[1], 0.3, top(p) - WTH, 14, false); c.box('generic', p[0], 3, p[1], 0.6, 6, 0.6); }
    for (let j = jfi + 3; j < jfo; j += 3) { const p = pt(j, W[j] - 0.1); v.box(m.white, p[0], (parapet + top(p) - WTH) / 2, p[1], 0.45, top(p) - WTH - parapet, 0.45); }
  }

  // ---------- flat canopy east of the fold line: slab with a row of openings, white edge, cross beams and posts ----------
  for (let j = jfi; j < NB; j++) {
    for (const [d0, d1] of (j < jfo ? [[-OV, null]] : [[-OV, D1], [D2, null]])) {              // null: out to the fold line or the north edge
      const ring = [pt(j, d0), pt(j + 1, d0), pt(j + 1, d1 ?? dF[j + 1]), pt(j, d1 ?? dF[j])];
      face(v, 'roofGrey', ring.map(p => P3(p, H)), UP); face(v, m.white, ring.map(p => P3(p, H - SLAB)), DOWN);
    }
  }
  for (let j = jfi; j < NB; j++) {
    let L = along(v, pt(j, -OV), pt(j + 1, -OV)); v.slab(m.white, 0, beamY, -0.16, L, FASCIA + 0.05, 0.16, 'EW');                  // south edge
    if (j < jfo) continue;
    L = along(v, pt(j + 1, W[j + 1] + OV), pt(j, W[j] + OV)); v.slab(m.white, 0, beamY, -0.16, L, FASCIA + 0.05, 0.16, 'EW');      // north edge
    for (const d of [D1, D2]) { L = along(v, pt(j, d), pt(j + 1, d)); v.slab(m.white, 0, H - SLAB, -0.08, L, SLAB + 0.2, 0.16, 'EW'); }   // rims of the openings
  }
  { const L = along(v, pt(NB, -OV), pt(NB, W[NB] + OV)); v.slab(m.white, 0, beamY, -0.16, L, FASCIA + 0.05, 0.16); }                // east edge
  for (let j = jfi; j <= NB; j++) {
    if (!(j === NB || j === jfo || ((j - jfi) % 3 === 0 && NB - j >= 2))) continue;
    const full = j >= jfo, dEnd = dF[j], z = j === NB ? -0.3 : 0;                                // the last frame stands just inside the east end wall
    along(v, I[j], O[j]);                                                                       // local x = distance in from the concave face
    if (dEnd > 0.5) v.slab(m.white, -OV, beamY, z - 0.18, dEnd + OV, FASCIA - SLAB, 0.36, 'U');   // cross beam under the slab
    if (full) v.slab(m.white, D1, H - SLAB, z - 0.18, D2 - D1, SLAB + 0.2, 0.36, 'D');            // and across the row of openings
    v.box(m.white, 0.08, (parapet + 0.09 + beamY) / 2, z, 0.45, beamY - parapet - 0.09, 0.45, 'UD');                               // post on the south parapet
    if (full) {
      v.box(m.white, W[j] - 0.08, (parapet + 0.09 + beamY) / 2, z, 0.45, beamY - parapet - 0.09, 0.45, 'UD');                      // post on the north parapet
      v.box(m.white, D2 + 0.08, (deck + beamY) / 2, z, 0.35, beamY - deck, 0.35, 'UD');                                             // post inside the garden
    }
  }

  // ---------- roof garden: lawn, a paved strip, trees and shrubs (layout ASSUMED) ----------
  v.frame(0, 0, 0);
  const inset = mul(q, -RECESS - T), dk = (j, d) => j ? pt(j, d) : add(pt(0, Math.min(d, W[0] - GX)), inset);   // bay 0 starts behind the recessed end wall
  for (let j = 0; j < NB; j++) {
    const w0 = W[j], w1 = W[j + 1];
    face(v, 'lawn', [P3(dk(j, T), deck), P3(pt(j + 1, T), deck), P3(pt(j + 1, w1 - T), deck), P3(dk(j, w0 - T), deck)], UP);
    face(v, 'paving', [P3(dk(j, 0.44 * w0), deck + 0.02), P3(pt(j + 1, 0.44 * w1), deck + 0.02), P3(pt(j + 1, 0.56 * w1), deck + 0.02), P3(dk(j, 0.56 * w0), deck + 0.02)], UP);
  }
  for (let j = 1; j < NB; j++) {                                                               // none in bay 0: it would hang over the recessed end wall
    const n = 1 + (rnd() < 0.5 ? 1 : 0) + (rnd() < 0.25 ? 1 : 0), wmin = Math.min(W[j], W[j + 1]);
    for (let i = 0; i < n; i++) {
      const f = 0.2 + rnd() * 0.6, d = 1.0 + rnd() * (wmin - 2.0), p = mix(pt(j, d), pt(j + 1, d), f);
      const open = j >= jfo && d > D1 + 0.9 && d < D2 - 0.9, shrub = !open && rnd() < 0.3;
      tree(v, p[0], p[1], shrub ? 0.9 + rnd() * 0.6 : open ? 4.6 + rnd() * 1.6 : 2.0 + rnd() * 1.8, deck);   // only trees under an opening grow past the canopy
    }
  }

  // ---------- colliders: one box per bay up to the parapet, and the west end following its recess ----------
  for (let j = 1; j < NB; j++) { const L = along(c, I[j], I[j + 1]), w = Math.max(W[j], W[j + 1]); c.slab('generic', -0.2, 0, -w, L + 0.4, parapet, w + PROUD); }
  along(c, O[0], I[0]);
  c.slab('generic', -0.1, 0, -GD, GX + 0.2, parapet, GD + 0.1).slab('generic', GX, 0, -GD, W0 - GX + PROUD, parapet, GD - RECESS).slab('generic', W0 - T, 0, -RECESS, T + PROUD, parapet, RECESS);

  ctx.add(v.build({ name: item.id + '-visual' }));
  const cg = ctx.add(c.build({ name: item.id + '-colliders' })); cg.visible = false;
  cg.traverse(o => { if (o.isMesh) ctx.collide(o); });
}
