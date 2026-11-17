// Gymnasium east of the track (style "gym", item gym-main). One tall hall under a shallow cream barrel vault.
//
// FROM THE REFERENCES
// - Outline: the item outline is the ROOF outline measured on the satellite image, so the walls stand inside it by the
//   width of the eaves.
// - Roof (2018 frames 8-10, 43, 53, 58; 2022 frames 20-21; satellite): cream sheet, crown running north-south, straight
//   horizontal eaves on the east and west, arch profile on the north and south ends, pale fascia. The vault is drawn
//   lopsided - crown about two thirds of the way east, east eave much higher than the west one - because both bowed roof
//   edges on the oblique satellite image peak there and hardly come down again toward the east, and because the east
//   columns are described as tall. Three raised strips cross the crown (satellite; seen end-on as marks in frame 43).
//   The glazed/white strip along the east edge is the data item gym-roof-east-edge-feature (frame 21 shows its glazed
//   grid from below); it is drawn here because that item has no builder of its own.
// - West face (2018 frames 43, 67-71, 54; 2022 frames 13-21): white columns on a 5.5 / 7.8 / 7.8 / 11.4 / 7.8 / 7.8 / 5.5 m
//   rhythm (read off frame 43), three dark-red wall panels (short, long, medium) with white copings, the slogan and
//   emblem in gold on the long one, a band of teal glazing in two rows, a white band, dark clerestory panes, glazing
//   running to the ground in the gaps beside the long panel with one door in each gap, floodlights on V-shaped stays
//   at the columns, a low white stepped platform with a white block at each end, small bollard lights, a white plaque
//   on the short panel and a small window in the medium one.
// - North end (frame 58, satellite): white columns, red brick, dark clerestory glazing with its top following the arch,
//   tall narrow windows with white sills near the north-west corner, a white lower wall section in the middle bays.
// - South face (frame 20): red brick with white pilasters, a white band above the ground storey, tall window strips above.
// - East face (frames 9, 10, 21): tall slender columns (dark red below, silver-grey above) carrying the eave over the
//   forecourt, a white band at first-floor level (drawn as a gallery with a solid parapet), dark glazing behind it,
//   two tan panels, white wall at both ends, a dark recessed ground level. Frame 21 looks north under this eave.
// - Slogan, legible in frame 71: 今天我以省实为荣 (emblem) 明天省实以我为荣.
//
// ASSUMED (not supported by any reference)
// - Every dimension: all were scaled from 640x360 video frames against the outline and the estimated 15 m height.
//   Eave widths (4.5 m west, 12 m east, 1.5 m north, 4 m south) are estimates; the 12 m on the east comes from the
//   satellite image, where the north face stops well short of the east roof edge.
// - The emblem is a simplified drawing of what frame 71 shows (gold-edged diamond, dark green field, red swirl over a
//   white open book), not the real artwork. The lettering uses whatever brush or Kai typeface the device has.
// - South end above about 8 m (hidden by trees): clerestory copied from the north end. South doors: positions invented.
// - North face: the lower parts of the east bays (hidden by trees) are plain brick.
// - East face: depth and height of the gallery, the piers under it, the ground-level glazing, where exactly the tan
//   panels and white wall parts sit.
// - THE WHOLE INTERIOR. No interior view exists. It is one open hall with a wooden floor raised to the level of the
//   west platform, three basketball courts side by side, hoops, concrete bleachers with blue seats along the east
//   wall, a pale ceiling and hanging lamps. Only the two west doors are open; all other doors are closed.
import { THREE, bbox } from '../../kit.js';
import { Batch } from '../../batch.js';

const F = 0.6;                                             // level of the west platform and of the hall floor
const BRUSH = '"STXingkai","华文行楷","Xingkai SC","STKaiti","华文楷体","Kaiti SC","KaiTi","楷体","AR PL UKai CN","Songti SC","SimSun","Noto Serif CJK SC",serif';
const SLOGAN = ['今天我以省实为荣', '明天省实以我为荣'];
const SLOGAN_PITCHES = 17.9;                               // 16 characters plus 1.9 character widths for the emblem
const COURT = { len: 32, wid: 19 };                        // painted area: a 28 x 15 m court plus 2 m of run-off

function canvasTexture(w, h, draw, repeat = false) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  if (repeat) t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}
// Cream sheet with seams running north-south (the texture's v axis follows the arch), tile 2.4 m.
function roofTexture() {
  const t = canvasTexture(256, 256, (g, S) => {
    g.fillStyle = '#e9e3d0'; g.fillRect(0, 0, S, S);
    let s = 12345; const r = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
    for (let i = 0; i < 2500; i++) { const k = 232 + Math.round(r() * 16); g.fillStyle = `rgb(${k},${k - 5},${k - 24})`; g.fillRect(r() * S, r() * S, 2 + r() * 14, 1 + r() * 2); }
    for (let y = 0; y < S; y += 64) { g.fillStyle = 'rgba(120,110,88,0.45)'; g.fillRect(0, y, S, 2); g.fillStyle = 'rgba(255,255,250,0.5)'; g.fillRect(0, y + 2, S, 2); }
  }, true);
  t.repeat.set(1 / 2.4, 1 / 2.4); return t;
}
// Emblem as it appears in frame 71: gold-edged diamond, dark green field, red swirl over a white open book (simplified).
function drawEmblem(g, cx, cy, s) {
  g.save(); g.translate(cx, cy); g.lineJoin = 'round';
  g.beginPath(); g.moveTo(0, -s); g.lineTo(s, 0); g.lineTo(0, s); g.lineTo(-s, 0); g.closePath();
  g.fillStyle = '#1d3a2b'; g.fill(); g.strokeStyle = '#e6b83a'; g.lineWidth = s * 0.15; g.stroke();
  g.fillStyle = '#f2f1e6';
  for (const m of [-1, 1]) { g.beginPath(); g.moveTo(m * 0.56 * s, 0.06 * s); g.lineTo(m * 0.03 * s, 0.4 * s); g.lineTo(m * 0.03 * s, 0.66 * s); g.lineTo(m * 0.34 * s, 0.42 * s); g.closePath(); g.fill(); }
  g.lineWidth = s * 0.035; g.strokeStyle = '#f0d9a0';
  g.fillStyle = '#c5221f'; g.beginPath(); g.arc(-0.1 * s, -0.3 * s, 0.25 * s, 0, Math.PI * 2); g.fill(); g.stroke();
  g.fillStyle = '#e0652e'; g.beginPath(); g.arc(0.13 * s, -0.1 * s, 0.2 * s, 0, Math.PI * 2); g.fill(); g.stroke();
  g.restore();
}
function sloganTexture() {
  return canvasTexture(4096, 384, (g, W, Hc) => {
    const p = W / SLOGAN_PITCHES, size = p * 0.84;
    g.font = `${size}px ${BRUSH}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round';
    g.fillStyle = '#e6b83a'; g.strokeStyle = '#8f6412'; g.lineWidth = size * 0.035;
    const put = (ch, x) => { g.strokeText(ch, x, Hc / 2 + size * 0.04); g.fillText(ch, x, Hc / 2 + size * 0.04); };
    [...SLOGAN[0]].forEach((ch, i) => put(ch, (i + 0.5) * p));
    [...SLOGAN[1]].forEach((ch, i) => put(ch, (9.9 + i + 0.5) * p));
    drawEmblem(g, 8.95 * p, Hc / 2, Hc * 0.47);
  });
}
// Basketball court lines on a transparent ground (the wooden floor shows through). Long axis along the canvas width.
function courtTexture() {
  const S = 64;                                            // pixels per metre
  return canvasTexture(COURT.len * S, COURT.wid * S, (g, W, Hc) => {
    g.translate(W / 2, Hc / 2); g.scale(S, S); g.lineWidth = 0.06; g.strokeStyle = '#ffffff';
    g.fillStyle = 'rgba(226,196,140,0.35)'; g.fillRect(-14, -7.5, 28, 15);
    for (const e of [-1, 1]) { g.fillStyle = 'rgba(168,66,54,0.92)'; g.fillRect(e > 0 ? 14 - 5.8 : -14, -2.45, 5.8, 4.9); }
    g.beginPath(); g.arc(0, 0, 1.8, 0, Math.PI * 2); g.fill(); g.stroke();
    g.strokeRect(-14, -7.5, 28, 15); g.beginPath(); g.moveTo(0, -7.5); g.lineTo(0, 7.5); g.stroke();
    for (const e of [-1, 1]) {
      g.strokeRect(e > 0 ? 14 - 5.8 : -14, -2.45, 5.8, 4.9);
      g.beginPath(); g.arc(e * (14 - 5.8), 0, 1.8, 0, Math.PI * 2); g.stroke();
      const bx = e * (14 - 1.575), a = Math.asin(6.6 / 6.75), mid = e > 0 ? Math.PI : 0;      // three-point line
      g.beginPath(); g.moveTo(e * 14, -6.6); g.lineTo(bx - e * 6.75 * Math.cos(a), -6.6); g.arc(bx, 0, 6.75, mid + e * a, mid - e * a, e > 0); g.lineTo(e * 14, 6.6); g.stroke();
    }
  });
}
// Runs before a glass mesh is drawn: scales its glow by the scene's sky (hemisphere) light, so windows are not bright at night.
let skyLight = null;
function followDaylight(renderer, scene) {
  if (!skyLight || skyLight.parent !== scene) skyLight = scene.children.find(o => o.isHemisphereLight) || null;
  this.material.emissiveIntensity = this.material.userData.glow * (skyLight ? Math.min(1, Math.max(0.04, skyLight.intensity)) : 1);
}
const local = {};
function lm(name) {
  if (local[name]) return local[name];
  const S = (color, roughness = 0.8, metalness = 0, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness, metalness, ...extra });
  // Glass gets some emissive colour standing in for the daylight it reflects or lets through, so that it does not go
  // black under the eaves or from indoors; build() makes that glow follow the brightness of the sky.
  const G = (color, roughness, metalness, emissive, glow) => { const g = S(color, roughness, metalness, { emissive, emissiveIntensity: glow }); g.userData.glow = glow; return g; };
  const decal = { transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 };
  const m = name === 'roof' ? S(0xffffff, 0.6, 0.05, { map: roofTexture() })
    : name === 'soffit' ? S(0x4b4f54, 0.9)
    : name === 'ceiling' ? S(0xd9d8d0, 0.9)
    : name === 'tealA' ? G(0xa9ddd0, 0.35, 0, 0x9fd6c8, 0.35)        // upper, paler row of the teal band
    : name === 'tealB' ? G(0x62ab9e, 0.2, 0.1, 0x5aa89a, 0.3)
    : name === 'clere' ? G(0x39464b, 0.2, 0.15, 0x39464b, 0.25)      // dark clerestory and east glazing, seen from outside
    : name === 'glassIn' ? G(0xb7cdd4, 0.9, 0, 0xa9c0c8, 0.5)        // the same panes seen from inside, against the daylight
    : name === 'tealIn' ? G(0x9fd6c9, 0.9, 0, 0x7fbfae, 0.45)
    : name === 'beige' ? S(0xcbb48c, 0.85)
    : name === 'silver' ? S(0xb4b9bd, 0.45, 0.3)
    : name === 'monitor' ? S(0xbfc4c2, 0.5, 0.1)
    : name === 'skyTop' ? S(0xcfe0e6, 0.15, 0.2)           // glazed canopy seen from above
    : name === 'skyPanel' ? G(0xdfe9ee, 0.9, 0, 0xdfe9ee, 0.8)       // the same glazing seen from below, against the sky
    : name === 'lamp' ? S(0xffffff, 0.6, 0, { emissive: 0xfff4d8, emissiveIntensity: 0.9 })
    : name === 'rim' ? S(0xe2581e, 0.5)
    : name === 'slogan' ? S(0xffffff, 0.5, 0, { map: sloganTexture(), emissive: 0x3a2a08, ...decal })
    : S(0xffffff, 0.6, 0, { map: courtTexture(), ...decal });                                   // 'court'
  m.name = 'gym-' + name; return (local[name] = m);
}

export function build(item, ctx) {
  const b = bbox(item.points), LX = b.sx, LZ = b.sz, H = item.height, k = H / 15;
  // ---- roof profile: one circular arc across the east-west width, level along north-south ----
  const dW = 5 * k, dE = 1.4 * k, T = 0.45;                 // drop from the crown to the west and east edges; slab thickness
  let lo = dW, hi = 1e6;
  for (let i = 0; i < 80; i++) { const r = (lo + hi) / 2; if (Math.sqrt(2 * r * dW - dW * dW) + Math.sqrt(2 * r * dE - dE * dE) < LX) lo = r; else hi = r; }
  const R = (lo + hi) / 2, cx = Math.sqrt(2 * R * dW - dW * dW);
  const yTop = x => H - R + Math.sqrt(R * R - (x - cx) * (x - cx)), yBot = x => yTop(x) - T;

  // ---- plan: wall lines inside the roof outline (local x east from the west roof edge, local z south from the north edge) ----
  const xW = Math.min(4.5, LX * 0.06), xE = LX - Math.min(12, LX * 0.15), zN = 1.5, zS = LZ - 4, Lw = zS - zN, f = Lw / 53.6;
  const z = t => zN + t;                                    // t: metres along the west and east faces from the north wall corner
  const yRed = 5.75 * k, yCope = yRed + 0.2, yBand = 7.7 * k, ySill = 8.15 * k, yMid = (yCope + yBand) / 2;
  const colT = [5.5, 13.3, 21.1, 32.5, 40.3, 48.1].map(t => t * f);                           // intermediate column lines
  const panels = [[2.3, 11.5], [15.1, 38.5], [42.1, 51.6]].map(p => p.map(t => t * f));       // red panels: short, long, medium
  const tP0 = 8.6 * f, tP1 = 45 * f, cube = 2.6;            // platform ends and the length of its end blocks

  const v = new Batch().frame(b.w, b.n), c = new Batch().frame(b.w, b.n);                     // visual and collision batches
  const both = (m, ...a) => { v.slab(m, ...a); c.slab('generic', ...a); };
  const cut = (a, e, holes) => { const out = []; let s = a; for (const [h0, h1] of holes) { if (h1 <= s || h0 >= e) continue; if (h0 > s + 1e-6) out.push([s, h0]); s = Math.max(s, h1); } if (e > s + 1e-6) out.push([s, e]); return out; };
  // surface following the arch between x0 and x1 at height yf(x), facing up or down
  const patch = (m, x0, x1, z0, z1, yf, up = true, step = 2.5) => {
    const n = Math.max(1, Math.ceil((x1 - x0) / step));
    for (let i = 0; i < n; i++) {
      const xa = x0 + (x1 - x0) * i / n, xb = x0 + (x1 - x0) * (i + 1) / n, ya = yf(xa), yb = yf(xb);
      if (up) v.quad(m, [xa, ya, z0], [xa, ya, z1], [xb, yb, z1], [xb, yb, z0]); else v.quad(m, [xa, ya, z0], [xb, yb, z0], [xb, yb, z1], [xa, ya, z1]);
    }
  };
  // vertical face in the plane z = zp between two curves, facing south (+z) or north
  const zface = (m, x0, x1, zp, lowf, highf, south, step = 2.5) => {
    const n = Math.max(1, Math.ceil((x1 - x0) / step));
    for (let i = 0; i < n; i++) {
      const xa = x0 + (x1 - x0) * i / n, xb = x0 + (x1 - x0) * (i + 1) / n;
      if (south) v.quad(m, [xa, lowf(xa), zp], [xb, lowf(xb), zp], [xb, highf(xb), zp], [xa, highf(xa), zp]);
      else v.quad(m, [xb, lowf(xb), zp], [xa, lowf(xa), zp], [xa, highf(xa), zp], [xb, highf(xb), zp]);
    }
  };

  const inner = (m, x, y0, y1, z0, z1) => v.quad(m, [x, y0, z1], [x, y0, z0], [x, y1, z0], [x, y1, z1]);    // pane facing east, into the hall

  v.slab('paving', 0, 0, 0, LX, 0.04, LZ, 'D');             // paving under the eaves

  // ================= WEST FACE toward the track =================
  for (const [x, zc] of [[xW, zN], [xW, zS - 1.3], [xE - 1.3, zN], [xE - 1.3, zS - 1.3]]) both('wallWhite', x, 0, zc, 1.3, yBot(x + 0.65) + 0.2, 1.3);   // corner columns of the hall
  const hCol = yBot(xW + 0.45) + 0.2;
  for (const t of colT) both('wallWhite', xW, 0, z(t) - 0.45, 0.9, hCol, 0.9);
  for (const [t0, t1] of panels) {
    both('wallMaroon', xW - 0.1, 0, z(t0), 0.5, yRed, t1 - t0);
    v.slab('wallWhite', xW - 0.16, yRed, z(t0) - 0.03, 0.62, 0.2, t1 - t0 + 0.06);            // coping
    v.slab('wallWhite', xW + 0.4, F, z(t0), 0.05, yCope - F, t1 - t0);                        // plaster on the inside
  }
  const colSpans = [[0, 1.3], ...colT.map(t => [t - 0.45, t + 0.45]), [Lw - 1.3, Lw]];
  const solid = [...colSpans, ...panels].sort((p, q) => p[0] - q[0]);
  // glazing that runs to the ground beside the panels; one door in each gap next to the long panel (frame 70)
  for (const [a, e] of cut(0, Lw, solid)) {
    const w = e - a, door = Math.abs(e - panels[1][0]) < 1e-6 || Math.abs(a - panels[1][1]) < 1e-6, y0 = a >= tP0 && e <= tP1 ? F : 0, yg = door ? F + 2.45 : y0;
    v.slab(lm('tealB'), xW + 0.3, yg, z(a), 0.08, yCope - yg, w); inner(lm('tealIn'), xW + 0.4, Math.max(yg, F), yCope, z(a), z(e));
    for (let y = yg + 0.95; y < yCope - 0.4; y += 0.95) v.slab('metalWhite', xW + 0.26, y, z(a), 0.16, 0.06, w);
    v.slab('metalWhite', xW + 0.26, yg, z(a) + w / 2 - 0.03, 0.16, yCope - yg, 0.06);
    c.slab('generic', xW + 0.2, yg, z(a), 0.3, yCope - yg, w);
    if (!door) continue;
    v.slab('metalWhite', xW + 0.22, F, z(a), 0.24, 2.35, 0.07).slab('metalWhite', xW + 0.22, F, z(e) - 0.07, 0.24, 2.35, 0.07).slab('metalWhite', xW + 0.22, F + 2.35, z(a), 0.24, 0.1, w);
    for (const zl of [z(a) + 0.07, z(e) - 0.11]) v.slab(lm('tealB'), xW + 0.46, F + 0.05, zl, 0.6, 2.25, 0.04);   // leaves standing open, swung into the hall
  }
  // teal band (two rows), white band, clerestory, lintel
  for (const [a, e] of cut(0, Lw, colSpans)) {
    const w = e - a, n = Math.max(1, Math.round(w / 1.8)), nu = Math.max(1, Math.round(w / 3.7)), yCl = yBot(xW + 0.3) - 0.25;
    v.slab(lm('tealB'), xW + 0.3, yCope, z(a), 0.08, yMid - yCope, w).slab(lm('tealA'), xW + 0.3, yMid, z(a), 0.08, yBand - yMid, w);
    for (let i = 1; i < n; i++) v.slab('metalWhite', xW + 0.26, yCope, z(a + w * i / n) - 0.035, 0.16, yBand - yCope, 0.07);
    v.slab('metalWhite', xW + 0.26, yMid - 0.035, z(a), 0.16, 0.07, w);
    v.slab(lm('clere'), xW + 0.3, ySill, z(a), 0.08, yCl - ySill, w);
    inner(lm('tealIn'), xW + 0.4, yCope, yBand, z(a), z(e)); inner(lm('glassIn'), xW + 0.4, ySill, yCl, z(a), z(e));
    for (let i = 0; i < nu; i++) {
      if (i) v.slab('wallWhite', xW + 0.24, ySill, z(a + w * i / nu) - 0.11, 0.2, yCl - ySill, 0.22);
      v.slab('metalWhite', xW + 0.27, ySill, z(a + w * (i + 0.5) / nu) - 0.025, 0.14, yCl - ySill, 0.05);
    }
    v.slab('wallWhite', xW + 0.12, yCl, z(a), 0.45, yBot(xW + 0.57) + 0.1 - yCl, w);
    v.slab('wallWhite', xW + 0.12, yBand, z(a), 0.45, ySill - yBand, w);
    c.slab('generic', xW + 0.2, yCope, z(a), 0.3, 3, w);
  }
  // floodlights at the columns, each hanging at the foot of a V of stays that run up to the eave
  for (const t of colT) {
    v.slab('black', xW - 0.6, yBand - 0.5, z(t) - 0.28, 0.32, 0.42, 0.56).slab('steel', xW - 0.3, yBand - 0.12, z(t) - 0.04, 0.3, 0.08, 0.08);
    for (const s of [-1, 1]) v.strut('black', [b.w + xW - 0.02, yBand + 0.15, b.n + z(t) + s * 0.15], [b.w + xW - 2.8, yBot(xW - 2.8) + 0.03, b.n + z(t) + s * 1.1], 0.07);
    v.frame(b.w, b.n);
  }
  // low white stepped platform with a block at each end
  v.slab('wallWhite', 0.9, 0, z(tP0), xW - 0.5, F - 0.02, tP1 - tP0);                        // runs in under the wall line, so the doorways have a floor
  v.slab('floorGrey', 1.05, F - 0.02, z(tP0) + 0.15, xW - 0.65, 0.02, tP1 - tP0 - 0.3, 'D').slab('wallWhite', 0.9, F - 0.02, z(tP0), 0.15, 0.02, tP1 - tP0, 'D');
  c.slab('generic', 0.9, 0, z(tP0), xW - 0.5, F, tP1 - tP0);
  for (let i = 0; i < 3; i++) v.slab('wallWhite', 0.3 * i, 0, z(tP0) + cube, 0.3, 0.15 * (i + 1), tP1 - tP0 - 2 * cube);
  for (const zc of [z(tP0), z(tP1) - cube]) { both('wallWhite', 0, 0, zc, 2.4, 1.7, cube); v.slab('roofGrey', -0.02, 0.5, zc + 0.5, 0.03, 0.8, cube - 1.0); }
  for (let i = 0; i < 5; i++) v.slab('metalWhite', xW - 1.1, F, z(panels[1][0] + (panels[1][1] - panels[1][0]) * (i + 0.5) / 5), 0.12, 0.42, 0.12);   // bollard lights
  v.slab('white', xW - 0.13, F + 1.5, z(panels[0][0]) + 1.3, 0.03, 0.55, 0.85);                                   // plaque on the short panel (text not legible)
  const zw = z(panels[2][0]) + (panels[2][1] - panels[2][0]) * 0.36;                                              // small window in the medium panel
  v.slab('wallWhite', xW - 0.13, F + 1.35, zw, 0.04, 0.9, 1.5).slab(lm('tealB'), xW - 0.15, F + 1.45, zw + 0.1, 0.03, 0.7, 1.3);
  // slogan and emblem on the long panel, read from north to south
  const sw = (panels[1][1] - panels[1][0]) * 0.9, sh = sw * 384 / 4096, sy = F + (yRed - F) * 0.74, sz = z((panels[1][0] + panels[1][1]) / 2), sx = xW - 0.125;
  lm('slogan').map.repeat.set(1 / sw, 1 / sh);
  v.quad(lm('slogan'), [sx, sy - sh / 2, sz - sw / 2], [sx, sy - sh / 2, sz + sw / 2], [sx, sy + sh / 2, sz + sw / 2], [sx, sy + sh / 2, sz - sw / 2]);

  // ================= NORTH AND SOUTH ENDS =================
  const nb = 7, pitch = (xE - xW - 1.3) / nb, colX = i => xW + 0.65 + i * pitch, hw = i => (i === 0 || i === nb ? 0.65 : 0.45);
  for (const south of [false, true]) {
    const zb = south ? zS - 0.65 : zN + 0.2, zo = south ? zS - 0.2 : zN + 0.2, zi = south ? zb : zb + 0.45;     // brick wall 0.45 thick: its start, outer face and inner face
    v.slab('brickRed', xW + 1.3, 0, zb, xE - xW - 2.6, ySill - 0.2, 0.45);
    v.slab('wallWhite', xW + 1.3, ySill - 0.2, zb - 0.06, xE - xW - 2.6, 0.2, 0.57);                             // sill band under the clerestory
    v.slab('wallWhite', xW + 1.3, F, south ? zi - 0.05 : zi, xE - xW - 2.6, ySill - 0.2 - F, 0.05);              // plaster on the inside
    c.slab('generic', xW, 0, south ? zS - 0.9 : zN, xE - xW, H, 0.9);
    for (let i = 1; i < nb; i++) v.slab('wallWhite', colX(i) - 0.45, 0, south ? zS - 0.9 : zN, 0.9, yBot(colX(i)) + 0.2, 0.9);
    for (let i = 0; i < nb; i++) {
      const x0 = colX(i) + hw(i), w = colX(i + 1) - hw(i + 1) - x0;
      zface(lm('clere'), x0, x0 + w, south ? zb + 0.27 : zb + 0.18, () => ySill, yBot, south); zface(lm('glassIn'), x0, x0 + w, south ? zb + 0.18 : zb + 0.27, () => ySill, yBot, !south);
      for (let j = 1; j < 4; j++) { const xm = x0 + w * j / 4; v.slab('wallWhite', xm - 0.07, ySill, zb + 0.13, 0.14, yBot(xm) - ySill + 0.1, 0.2); }
      if (yBot(x0 + w / 2) - ySill > 3.4) v.slab('metalWhite', x0, ySill + 2.1 * k, zb + 0.15, w, 0.08, 0.16);     // transom where the panes get tall
      const fr = q => x0 + w * q;
      if (!south) {
        // tall narrow windows with white sills in the two bays next to the north-west corner (frame 58)
        for (const q of i === 0 ? [0.28, 0.5, 0.72] : i === 1 ? [0.3, 0.52] : []) v.slab(lm('tealB'), fr(q) - 0.4, 2.9, zo - 0.04, 0.8, 2.7, 0.05).slab('wallWhite', fr(q) - 0.5, 2.6, zo - 0.1, 1.0, 0.3, 0.12);
      } else {
        // tall window strips in three rows of panes above the white band (frame 20)
        for (const q of [0.2, 0.5, 0.8]) {
          v.slab(lm('tealA'), fr(q) - 0.8, 5.0 * k, zo - 0.01, 1.6, 2.7 * k, 0.05).slab('wallWhite', fr(q) - 0.9, 5.0 * k - 0.2, zo - 0.01, 1.8, 0.2, 0.12);
          for (const y of [5.9, 6.8]) v.slab('metalWhite', fr(q) - 0.8, y * k - 0.035, zo - 0.01, 1.6, 0.07, 0.08);
        }
        if (i === 1 || i === 5) v.slab('glassDark', fr(0.5) - 1.0, 0, zo - 0.01, 2.0, 2.4, 0.05).slab('wallWhite', fr(0.5) - 1.1, 2.4, zo - 0.01, 2.2, 0.12, 0.08).slab('metalWhite', fr(0.5) - 0.03, 0, zo - 0.01, 0.06, 2.4, 0.07);
      }
    }
    if (south) v.slab('wallWhite', xW + 1.3, 4.2, zo - 0.01, xE - xW - 2.6, 0.4, 0.14);                           // white band above the ground storey
  }
  // white lower wall section in the middle bays of the north face, with low dark windows (frame 58, satellite)
  { const xa = colX(3) - 0.45, xb = colX(6) + 0.45;
    both('wallWhite', xa, 0, zN - 0.5, xb - xa, 5.4, 0.75);
    for (let i = 3; i < 6; i++) for (const q of [0.27, 0.73]) v.slab('glassDark', colX(i) + pitch * q - 0.9, 1.0, zN - 0.53, 1.8, 1.1, 0.04); }

  // ================= EAST FACE: recessed wall, gallery, tall slender columns =================
  const xc = LX - 1.0, xd = xc + 0.45, yDeck = 4.2, hE = yBot(xE - 0.5) + 0.2, G = [0, 5.5, 13.3, 21.1, 32.5, 40.3, 48.1, 53.6].map(t => t * f);
  both('wallWhite', xE - 0.5, 0, z(1.3), 0.4, hE, Lw - 2.6);
  for (let j = 1; j < 7; j++) v.slab('wallWhite', xE - 0.1, 0, z(G[j]) - 0.3, 0.12, hE, 0.6);
  const glaze = (m, a, e, y0, y1, bars) => {
    v.slab(m, xE - 0.1, y0, z(a), 0.05, y1 - y0, e - a);
    const n = Math.max(1, Math.round((e - a) / 1.95));
    for (let i = 1; i < n; i++) v.slab('metalWhite', xE - 0.1, y0, z(a + (e - a) * i / n) - 0.03, 0.08, y1 - y0, 0.06);
    for (const y of bars) if (y > y0 && y < y1) v.slab('metalWhite', xE - 0.1, y - 0.03, z(a), 0.08, 0.06, e - a);
  };
  for (let j = 0; j < 7; j++) {                             // ground level under the gallery
    const a = j === 0 ? 1.3 : G[j] + 0.3, e = j === 6 ? Lw - 1.3 : G[j + 1] - 0.3;
    v.slab('wallMaroon', xE - 0.1, 0, z(a), 0.04, 0.5, e - a); glaze(lm('clere'), a, e, 0.5, yDeck - 0.6, [2.6]);
  }
  // gallery level: what frame 10 shows between the columns, from north to south (g = glazing, b = tan panel; the rest stays white wall)
  for (const [t0, t1, kind] of [[2.5, 5.2, 'g'], [5.8, 9.3, 'b'], [9.3, 13.0, 'g'], [13.6, 20.8, 'g'], [21.4, 32.2, 'g'], [32.8, 35.4, 'g'], [35.4, 40.0, 'b'], [40.6, 45.0, 'g']]) {
    const a = t0 * f, e = t1 * f, y0 = yDeck + 0.15, y1 = hE - 0.7, yt = Math.min(y1, 9.6 * k);
    if (kind === 'b') { v.slab(lm('beige'), xE - 0.1, y0, z(a), 0.06, y1 - y0, e - a); continue; }
    glaze(lm('clere'), a, e, y0, yt, [6.9 * k]); glaze(lm('tealB'), a, e, yt, y1, []);
  }
  v.slab('metalWhite', xE - 0.1, yDeck - 0.3, zN, xd - xE + 0.1, 0.3, Lw);                                         // gallery slab
  v.slab('floorGrey', xE - 0.1, yDeck, zN + 0.25, xd - xE - 0.05, 0.02, Lw - 0.5, 'D');
  v.slab('wallWhite', xd - 0.15, yDeck, zN, 0.15, 1.1, Lw);                                                       // solid parapet
  for (const zc of [zN, zS - 0.15]) v.slab('wallWhite', xE - 0.1, yDeck, zc, xd - xE + 0.1, 1.1, 0.15);          // parapet returns; the gallery is open at both ends (frame 21)
  for (const t of [0.45, ...G.slice(1, 7), Lw - 0.45]) {
    v.cyl('wallMaroon', xc, 0, z(t), 0.42, yDeck + 1.1, 16).cyl(lm('silver'), xc, yDeck + 1.1, z(t), 0.3, yBot(xc) - yDeck - 1.0, 16, false);
    c.slab('generic', xc - 0.4, 0, z(t) - 0.4, 0.8, 4, 0.8);
  }
  for (let j = 1; j < 7; j++) both('wallMaroon', (xE + xd) / 2 - 0.25, 0, z(G[j]) - 0.25, 0.5, yDeck - 0.3, 0.5);  // piers under the gallery

  // ================= ROOF =================
  // top sheet: its own mesh so the seams follow the arch with smooth shading
  { const seg = 64, pos = [], nor = [], uv = [], idx = []; let s = 0, px = 0, py = yTop(0);
    for (let i = 0; i <= seg; i++) {
      const x = LX * i / seg, y = yTop(x), nx = (x - cx) / R, ny = Math.sqrt(1 - nx * nx);
      s += Math.hypot(x - px, y - py); px = x; py = y;
      for (const zz of [0, LZ]) { pos.push(b.w + x, y, b.n + zz); nor.push(nx, ny, 0); uv.push(zz, s); }
    }
    for (let i = 0; i < seg; i++) { const a = 2 * i; idx.push(a, a + 1, a + 3, a, a + 3, a + 2); }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx);
    const roof = new THREE.Mesh(g, lm('roof')); roof.castShadow = roof.receiveShadow = true; roof.name = item.id + '-roof'; ctx.add(roof); }
  patch(lm('soffit'), 0, LX, 0, LZ, yBot, false, 3);
  patch(lm('ceiling'), xW + 0.45, xE - 0.5, zN + 0.65, zS - 0.65, x => yBot(x) - 0.04, false, 3);
  const fb = x => yTop(x) - 0.6;                            // fascia, 0.6 m deep
  v.quad('metalWhite', [0, fb(0), 0], [0, fb(0), LZ], [0, yTop(0), LZ], [0, yTop(0), 0]);
  v.quad('metalWhite', [LX, fb(LX), LZ], [LX, fb(LX), 0], [LX, yTop(LX), 0], [LX, yTop(LX), LZ]);
  zface('metalWhite', 0, LX, 0, fb, yTop, false, 2); zface('metalWhite', 0, LX, LZ, fb, yTop, true, 2);
  // three raised strips across the crown (satellite image)
  for (const dz of [-6.2, 0, 6.2]) {
    const zc = LZ / 2 + dz * LZ / 59.1, xa = LX * 0.47 - 13.3, xb = LX * 0.47 + 13.3, up = x => yTop(x) + 0.3;
    patch(lm('monitor'), xa, xb, zc - 0.65, zc + 0.65, up, true, 2);
    zface(lm('monitor'), xa, xb, zc - 0.65, yTop, up, false, 2); zface(lm('monitor'), xa, xb, zc + 0.65, yTop, up, true, 2);
    v.quad(lm('monitor'), [xa, yTop(xa), zc - 0.65], [xa, yTop(xa), zc + 0.65], [xa, up(xa), zc + 0.65], [xa, up(xa), zc - 0.65]);
    v.quad(lm('monitor'), [xb, yTop(xb), zc + 0.65], [xb, yTop(xb), zc - 0.65], [xb, up(xb), zc - 0.65], [xb, up(xb), zc + 0.65]);
  }
  // canopy strip along the east edge (data item gym-roof-east-edge-feature): white, with a glazed grid in its southern half
  { const feat = ((ctx.campus && ctx.campus.items) || []).find(i => i.id === 'gym-roof-east-edge-feature'), q = feat && feat.points ? bbox(feat.points) : null;
    const x0 = q ? Math.max(xE + 1, q.w - b.w) : LX - 4, x1 = q ? Math.max(LX + 0.3, q.e - b.w) : LX + 2, z0 = q ? Math.max(0.2, q.n - b.n) : LZ * 0.15, z1 = q ? Math.min(LZ - 0.2, q.s - b.n) : LZ * 0.9, zm = (z0 + z1) / 2;
    const top = x => yTop(x) + 0.1, low = x => yTop(x) - 0.12, sof = x => yBot(x) - 0.03, xs = xc + 0.45;      // top; underside beyond the roof edge; panels in the soffit
    patch('metalWhite', x0, x1, z0, zm, top, true, 1.5); patch(lm('skyTop'), x0, x1, zm, z1, top, true, 1.5);
    patch('metalWhite', LX, x1, z0, zm, low, false, 1.5); patch(lm('skyPanel'), LX, x1, zm, z1, low, false, 1.5); patch(lm('skyPanel'), xs, LX - 0.05, zm, z1, sof, false, 1.5);
    v.quad('metalWhite', [x1, low(x1), z1], [x1, low(x1), z0], [x1, top(x1), z0], [x1, top(x1), z1]);
    for (const [zz, south] of [[z0, false], [z1, true]]) { zface('metalWhite', x0, LX, zz, yTop, top, south, 1.5); zface('metalWhite', LX, x1, zz, low, top, south, 1.5); }
    const nz = Math.max(2, Math.round((z1 - zm) / 2.2));
    for (let i = 0; i <= nz; i++) { const zz = zm + (z1 - zm) * i / nz;                                           // glazing bars, above and below
      patch('metalWhite', x0, x1, zz - 0.05, zz + 0.05, x => top(x) + 0.03, true, 1.5); patch('metalWhite', LX, x1, zz - 0.05, zz + 0.05, x => low(x) - 0.03, false, 1.5); patch('metalWhite', xs, LX - 0.05, zz - 0.05, zz + 0.05, x => sof(x) - 0.03, false, 1.5); }
    for (let i = 0; i <= 3; i++) { const xx = x0 + (x1 - x0) * i / 3, under = xx > LX ? low : xx > xs ? sof : null;
      patch('metalWhite', xx - 0.05, xx + 0.05, zm, z1, x => top(x) + 0.03, true, 1); if (under) patch('metalWhite', xx - 0.05, xx + 0.05, zm, z1, x => under(x) - 0.03, false, 1); }
  }

  // ================= INTERIOR (assumed, see the header) =================
  const ix0 = xW + 0.4, ix1 = xE - 0.5, iz0 = zN + 0.65, iz1 = zS - 0.65, izc = (iz0 + iz1) / 2;
  both('wood', ix0, 0, iz0, ix1 - ix0, F, iz1 - iz0, 'D');
  // bleachers along the east wall: six concrete tiers with blue seats, aisles at both ends and in the middle
  const nt = 6, td = 0.8, th = 0.4, bx0 = ix1 - nt * td, bz0 = iz0 + Math.min(6, (iz1 - iz0) * 0.12), bz1 = iz1 - Math.min(6, (iz1 - iz0) * 0.12), aw = 1.4;
  const aisles = [[bz0, bz0 + aw], [(bz0 + bz1 - aw) / 2, (bz0 + bz1 + aw) / 2], [bz1 - aw, bz1]];
  for (let i = 0; i < nt; i++) {
    both('concrete', bx0 + i * td, F + i * th, bz0, (nt - i) * td, th, bz1 - bz0);
    for (const [a, e] of cut(bz0, bz1, aisles)) v.slab('seatBlue', bx0 + i * td + 0.36, F + (i + 1) * th, a + 0.1, 0.4, 0.06, e - a - 0.2);
    for (const [a, e] of aisles) v.slab('concrete', bx0 + i * td - td / 2, F + i * th, a, td / 2, th / 2, e - a);  // half steps in the aisles
  }
  // courts side by side, long axis north-south, with a hoop at each end
  const ux0 = ix0 + 1, ux1 = bx0 - 2, nc = Math.max(1, Math.min(3, Math.floor((ux1 - ux0) / COURT.wid)));
  if (iz1 - iz0 > COURT.len + 4) for (let i = 0; i < nc; i++) {
    const xm = ux0 + (ux1 - ux0) * (i + 0.5) / nc, y = F + 0.012;
    v.quad(lm('court'), [xm - COURT.wid / 2, y, izc - COURT.len / 2], [xm - COURT.wid / 2, y, izc + COURT.len / 2], [xm + COURT.wid / 2, y, izc + COURT.len / 2], [xm + COURT.wid / 2, y, izc - COURT.len / 2]);
    for (const s of [-1, 1]) {
      const zp = izc + s * 15, zb = izc + s * 12.8;
      both('steel', xm - 0.1, F, zp - 0.1, 0.2, 3.5, 0.2);
      v.slab('steel', xm - 0.06, F + 3.32, Math.min(zp, zb), 0.12, 0.12, Math.abs(zp - zb));
      v.slab('white', xm - 0.9, F + 2.9, zb - 0.025, 1.8, 1.05, 0.05);
      const zr = zb - s * 0.38;                                                                                   // ring: a square of four bars, 3.05 m above the floor
      v.slab(lm('rim'), xm - 0.24, F + 3.03, zr - 0.24, 0.48, 0.04, 0.04).slab(lm('rim'), xm - 0.24, F + 3.03, zr + 0.2, 0.48, 0.04, 0.04)
        .slab(lm('rim'), xm - 0.24, F + 3.03, zr - 0.24, 0.04, 0.04, 0.48).slab(lm('rim'), xm + 0.2, F + 3.03, zr - 0.24, 0.04, 0.04, 0.48);
    }
  }
  lm('court').map.repeat.set(1 / COURT.len, 1 / COURT.wid);
  for (let i = 0; i < 6; i++) for (let j = 0; j < 4; j++) {                                                       // hanging lamps
    const x = ix0 + (ix1 - ix0) * (i + 0.5) / 6, zz = iz0 + (iz1 - iz0) * (j + 0.5) / 4, y = yBot(x) - 1.3;
    v.slab(lm('lamp'), x - 0.35, y, zz - 0.35, 0.7, 0.1, 0.7).slab('steel', x - 0.02, y + 0.1, zz - 0.02, 0.04, 1.2, 0.04);
  }

  // ================= ASSEMBLY AND COLLISION =================
  const vis = ctx.add(v.build({ name: item.id + '-visual' }));
  vis.traverse(o => { if (!o.isMesh) return; if (o.material.transparent) o.renderOrder = 1; if (o.material.userData.glow) o.onBeforeRender = followDaylight; });
  const cg = ctx.add(c.build({ name: item.id + '-colliders' })); cg.visible = false;
  // inclined plates (collision only) over the platform steps and the bleacher aisles
  const ramps = new THREE.Group(); ramps.position.set(b.w, 0, b.n); ramps.visible = false; ctx.add(ramps);
  const ramp = (xa, ya, xb, yb, z0, z1) => {
    const len = Math.hypot(xb - xa, yb - ya), ang = Math.atan2(yb - ya, xb - xa), m = new THREE.Mesh(new THREE.BoxGeometry(len, 0.2, z1 - z0));
    m.position.set((xa + xb) / 2 + 0.1 * Math.sin(ang), (ya + yb) / 2 - 0.1 * Math.cos(ang), (z0 + z1) / 2); m.rotation.z = ang; ramps.add(m);   // top surface on the line from (xa, ya) to (xb, yb)
  };
  ramp(-0.15, 0, 0.9, F, z(tP0) + cube, z(tP1) - cube);
  for (const [a, e] of aisles) ramp(bx0 - td, F, bx0 + (nt - 1) * td, F + nt * th, a, e);
  cg.traverse(o => { if (o.isMesh) ctx.collide(o); });
  ramps.children.forEach(m => ctx.collide(m));
}
