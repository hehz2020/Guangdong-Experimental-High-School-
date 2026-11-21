// Gymnasium east of the track (style "gym", item gym-main). One tall hall under a shallow cream barrel vault, built
// for looks inside and out.
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
// IMAGINED (the owner asked for a complete, good-looking building; none of this is supported by a reference)
// - Every dimension: all were scaled from 640x360 video frames against the outline and the estimated 15 m height.
//   Eave widths (4.5 m west, 12 m east, 1.5 m north, 4 m south) are estimates.
// - The emblem is a simplified drawing of what frame 71 shows, not the real artwork.
// - How the red walls are made (cassette panels with open joints and visible fixings on a dark granite plinth), the
//   door sets and their canopies, the granite of the platform, downpipes, gutters, seams of the roof sheet, the roof-top
//   air handlers, the stoops and doors of the south face, the lamps, the planting beds, the paving.
// - South end above about 8 m (hidden by trees): clerestory copied from the north end.
// - East face: depth and height of the gallery, the piers under it, the ground-level glazing, the doors.
// - THE WHOLE INTERIOR. No interior view exists. It is drawn as a multi-use school hall: a sprung maple floor with a
//   main basketball court before the stand, two cross courts and a volleyball court west of it, badminton courts
//   over them; six baskets hung from the roof; arched steel trusses, purlins and bracing under a profiled deck with
//   three rooflights (the three strips of the satellite image); high-bay lamps; supply-air ducts; acoustic lining
//   above a timber dado; a stand of eight rows with moulded seats along the east wall whose top walkway is level
//   with the east gallery and opens onto it through three doors; scoreboard, team benches, scorer's table, ball
//   trolleys, wall bars, stored volleyball posts, hose cabinets, exit signs, a store under the stand.
// - When the interior is drawn: only from inside the hall or within 30 m of its walls (where the doors and the glazing show
//   it), the fine things only within 52 m of its middle as well (second refinement round; it used to be drawn from 100 m).
// - The light inside: the hall is rendered into a cube map (twice, so that one bounce of light is in it) whenever the
//   time of day has moved on; every surface of the interior is lit by that map, and the floor mirrors it.
import { THREE, bbox } from '../../kit.js';
import { Batch } from '../../batch.js';
import { pbr, plain, rng } from '../../hifi.js';
import { strips, ribbon, patch as fillQuad } from '../../shapes.js';
import { shrubs, flowers, useStockShaders } from '../../flora.js';
import { LIT, bench, bins } from '../../street.js';

const F = 0.6;                                             // level of the west platform and of the hall floor
const BRUSH = '"STXingkai","华文行楷","Xingkai SC","STKaiti","华文楷体","Kaiti SC","KaiTi","楷体","AR PL UKai CN","Songti SC","SimSun","Noto Serif CJK SC",serif';
const SANS = '"PingFang SC","Microsoft YaHei","Noto Sans CJK SC","Source Han Sans SC","WenQuanYi Zen Hei","Heiti SC",sans-serif';
const SLOGAN = ['今天我以省实为荣', '明天省实以我为荣'];
const SLOGAN_PITCHES = 17.9;                               // 16 characters plus 1.9 character widths for the emblem
const UP = new THREE.Vector3(0, 1, 0), ONE = new THREE.Vector3(1, 1, 1), TAU = Math.PI * 2;

// ---- textures drawn in code ---------------------------------------------------------------------------------------------
function canvasTexture(w, h, draw, repeat = false) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  if (repeat) t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
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
/** One line of plain lettering on a plate (functional signs only). */
function plate(text, w, h, fg, bg, size, draw) {
  return canvasTexture(w, h, g => {
    g.fillStyle = bg; g.fillRect(0, 0, w, h); if (draw) draw(g);
    g.fillStyle = fg; g.font = `bold ${size}px ${SANS}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, draw ? w * 0.6 : w / 2, h / 2 + size * 0.04);
  });
}
// Green exit sign: an arrow toward a doorway, then the words.
const exitTexture = () => plate('安全出口', 512, 160, '#ffffff', '#0b8f47', 84, g => {
  g.strokeStyle = '#fff'; g.fillStyle = '#fff'; g.lineWidth = 12; g.lineJoin = 'round';
  g.strokeRect(22, 30, 62, 100); g.beginPath(); g.moveTo(150, 80); g.lineTo(100, 80); g.stroke(); g.beginPath(); g.moveTo(96, 80); g.lineTo(122, 56); g.lineTo(122, 104); g.closePath(); g.fill();
});
// Scoreboard, switched off: unlit seven-segment digits on a black face.
function scoreboardTexture() {
  return canvasTexture(1024, 400, (g, W, Hc) => {
    g.fillStyle = '#08090b'; g.fillRect(0, 0, W, Hc); g.strokeStyle = '#23262b'; g.lineWidth = 6; g.strokeRect(10, 10, W - 20, Hc - 20);
    const digit = (x, y, w, h, colr) => {                  // all seven segments, as an unlit display shows them
      const t = w * 0.17, s = t * 0.5; g.fillStyle = colr;
      const hz = yy => { g.beginPath(); g.moveTo(x + s, yy); g.lineTo(x + t, yy - s); g.lineTo(x + w - t, yy - s); g.lineTo(x + w - s, yy); g.lineTo(x + w - t, yy + s); g.lineTo(x + t, yy + s); g.closePath(); g.fill(); };
      const vt = (xx, y0, y1) => { g.beginPath(); g.moveTo(xx, y0 + s); g.lineTo(xx + s, y0 + t); g.lineTo(xx + s, y1 - t); g.lineTo(xx, y1 - s); g.lineTo(xx - s, y1 - t); g.lineTo(xx - s, y0 + t); g.closePath(); g.fill(); };
      hz(y + s); hz(y + h / 2); hz(y + h - s); vt(x + s, y, y + h / 2); vt(x + w - s, y, y + h / 2); vt(x + s, y + h / 2, y + h); vt(x + w - s, y + h / 2, y + h);
    };
    const red = '#34120f', amber = '#33290d', green = '#12301a';
    for (let i = 0; i < 3; i++) { digit(50 + i * 92, 150, 72, 150, red); digit(W - 50 - 72 - (2 - i) * 92, 150, 72, 150, red); }
    for (let i = 0; i < 4; i++) digit(W / 2 - 200 + i * 96 + (i > 1 ? 24 : 0), 36, 68, 120, amber);
    g.fillStyle = amber; g.beginPath(); g.arc(W / 2, 76, 9, 0, TAU); g.arc(W / 2, 118, 9, 0, TAU); g.fill();
    digit(W / 2 - 30, 210, 60, 100, green);
    for (const x of [372, W - 372 - 44]) digit(x, 250, 44, 76, amber);
    g.fillStyle = '#1b1d21'; for (const x of [60, W - 60 - 250]) for (let i = 0; i < 5; i++) { g.beginPath(); g.arc(x + 25 + i * 50, 342, 11, 0, TAU); g.fill(); }
  });
}
// Glass backboard: clear, with the white border and the small rectangle over the ring.
function backboardTexture() {
  return canvasTexture(576, 336, (g, W, Hc) => {
    const s = W / 1.8;                                     // pixels per metre
    g.clearRect(0, 0, W, Hc); g.fillStyle = 'rgba(214,236,240,0.2)'; g.fillRect(0, 0, W, Hc);
    g.strokeStyle = '#ffffff'; g.lineWidth = 0.05 * s; g.strokeRect(0.025 * s, 0.025 * s, W - 0.05 * s, Hc - 0.05 * s);
    g.strokeRect(W / 2 - 0.295 * s, Hc - (0.15 + 0.45) * s, 0.59 * s, 0.45 * s);
  });
}
function netTexture() {
  const t = canvasTexture(64, 64, (g, S) => {
    g.clearRect(0, 0, S, S); g.strokeStyle = 'rgba(250,250,246,1)'; g.lineWidth = 7; g.lineCap = 'square';
    for (const [a, b2, c, d] of [[0, 0, S, S], [S, 0, 0, S], [-S, 0, S, 2 * S], [0, -S, 2 * S, S], [2 * S, 0, 0, 2 * S], [S, -S, -S, S]]) { g.beginPath(); g.moveTo(a, b2); g.lineTo(c, d); g.stroke(); }
  }, true);
  return t;
}
function ballTexture(volley) {
  return canvasTexture(256, 128, (g, W, Hc) => {
    if (volley) {
      g.fillStyle = '#f1efe6'; g.fillRect(0, 0, W, Hc);
      for (let i = 0; i < 6; i++) { g.fillStyle = i % 2 ? '#2a5fb8' : '#e8c22e'; g.beginPath(); g.moveTo(i * W / 6, 0); g.bezierCurveTo(i * W / 6 + 30, Hc * 0.4, i * W / 6 - 10, Hc * 0.7, i * W / 6 + 26, Hc); g.lineTo(i * W / 6 + 44, Hc); g.bezierCurveTo(i * W / 6 + 8, Hc * 0.7, i * W / 6 + 50, Hc * 0.4, i * W / 6 + 18, 0); g.closePath(); g.fill(); }
      return;
    }
    g.fillStyle = '#c8632b'; g.fillRect(0, 0, W, Hc);
    const r = rng(77); for (let i = 0; i < 2600; i++) { g.fillStyle = `rgba(${r() < 0.5 ? '90,40,14' : '236,150,90'},0.16)`; g.fillRect(r() * W, r() * Hc, 2, 2); }
    g.strokeStyle = '#1a1512'; g.lineWidth = 3.5;
    g.beginPath(); g.moveTo(0, Hc / 2); g.lineTo(W, Hc / 2); g.stroke();
    for (const x of [0, W / 2, W]) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, Hc); g.stroke(); }
    for (const x0 of [W / 4, 3 * W / 4]) for (const s of [-1, 1]) { g.beginPath(); g.moveTo(x0 + s * 26, 0); g.bezierCurveTo(x0 + s * 62, Hc * 0.3, x0 + s * 62, Hc * 0.7, x0 + s * 26, Hc); g.stroke(); }
  });
}
// What a frosted window pane lets through, seen from inside: sky above, a soft band of tree tops below.
function paneTexture(tint) {
  const t = canvasTexture(256, 256, (g, S) => {
    const grad = g.createLinearGradient(0, 0, 0, S); grad.addColorStop(0, '#f4f8fb'); grad.addColorStop(0.55, '#e3edf0'); grad.addColorStop(1, '#b9cdbf'); g.fillStyle = grad; g.fillRect(0, 0, S, S);
    const r = rng(tint ? 31 : 37);
    for (let i = 0; i < 46; i++) {
      const x = r() * S, y = S * (0.62 + 0.42 * r()), rad = 22 + 46 * r(), q = g.createRadialGradient(x, y, 0, x, y, rad);
      q.addColorStop(0, 'rgba(120,150,118,0.34)'); q.addColorStop(1, 'rgba(120,150,118,0)'); g.fillStyle = q;
      for (const dx of [-S, 0, S]) { g.beginPath(); g.arc(x + dx, y, rad, 0, TAU); g.fill(); }
    }
    if (tint) { g.globalCompositeOperation = 'multiply'; g.fillStyle = '#8fe0cf'; g.fillRect(0, 0, S, S); }
  });
  t.wrapS = THREE.RepeatWrapping; return t;
}

// ---- surfaces with colour, normal and roughness maps (the pattern of hifi.js; texture coordinates in metres) -------------
const sm = t => t * t * (3 - 2 * t);
function valueNoise(S, cells, seed) {
  const r = rng(seed), g = new Float32Array(cells * cells); for (let i = 0; i < g.length; i++) g[i] = r();
  const out = new Float32Array(S * S), k = cells / S;
  for (let y = 0; y < S; y++) {
    const fy = y * k, y0 = Math.floor(fy), ty = sm(fy - y0), ya = (y0 % cells) * cells, yb = ((y0 + 1) % cells) * cells;
    for (let x = 0; x < S; x++) {
      const fx = x * k, x0 = Math.floor(fx), tx = sm(fx - x0), xa = x0 % cells, xb = (x0 + 1) % cells;
      const a = g[ya + xa] + (g[ya + xb] - g[ya + xa]) * tx, b = g[yb + xa] + (g[yb + xb] - g[yb + xa]) * tx;
      out[y * S + x] = a + (b - a) * ty;
    }
  }
  return out;
}
function fbm(S, cells, octaves, seed) {
  const out = new Float32Array(S * S); let amp = 1, total = 0;
  for (let o = 0; o < octaves; o++) { const n = valueNoise(S, Math.min(S / 2, cells << o), seed + o * 101); for (let i = 0; i < out.length; i++) out[i] += n[i] * amp; total += amp; amp *= 0.5; }
  for (let i = 0; i < out.length; i++) out[i] /= total;
  return out;
}
function maps(S, tile, { col, height, rough, strength = 2 }) {
  const make = (fill, srgb) => {
    const c = document.createElement('canvas'); c.width = c.height = S; const g = c.getContext('2d'), im = g.createImageData(S, S); fill(im.data); g.putImageData(im, 0, 0);
    const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(1 / tile[0], 1 / tile[1]); t.anisotropy = 8; if (srgb) t.colorSpace = THREE.SRGBColorSpace; return t;
  };
  const out = { map: make(d => { for (let y = 0, i = 0; y < S; y++) for (let x = 0; x < S; x++, i++) { const q = col(i, x, y); d[i * 4] = q[0]; d[i * 4 + 1] = q[1]; d[i * 4 + 2] = q[2]; d[i * 4 + 3] = 255; } }, true) };
  if (height) out.normalMap = make(d => {
    for (let y = 0, i = 0; y < S; y++) for (let x = 0; x < S; x++, i++) {
      const xl = height[y * S + (x + S - 1) % S], xr = height[y * S + (x + 1) % S], yu = height[((y + S - 1) % S) * S + x], yd = height[((y + 1) % S) * S + x];
      let nx = (xl - xr) * strength, ny = (yd - yu) * strength; const l = 1 / Math.hypot(nx, ny, 1); nx *= l; ny *= l;
      d[i * 4] = (nx * 0.5 + 0.5) * 255; d[i * 4 + 1] = (ny * 0.5 + 0.5) * 255; d[i * 4 + 2] = (l * 0.5 + 0.5) * 255; d[i * 4 + 3] = 255;
    }
  }, false);
  if (rough) out.roughnessMap = make(d => { for (let i = 0; i < S * S; i++) { d[i * 4] = 0; d[i * 4 + 1] = Math.max(0, Math.min(1, rough(i))) * 255; d[i * 4 + 2] = 0; d[i * 4 + 3] = 255; } }, false);
  return out;
}
// Maple strip floor under a clear finish: 57 mm boards of random lengths running along v, each with its own tone and grain.
function mapleMaps(low) {
  const S = low ? 512 : 1024, NB = 32, bw = S / NB, LEN = 4.4, r = rng(9101), wear = fbm(S, 3, 4, 9103), K = 32, streak = new Float32Array(K * S);
  for (let i = 0; i < streak.length; i++) streak[i] = r();
  const piece = new Uint16Array(S * S), joint = new Float32Array(S * S), tones = [];
  for (let bd = 0; bd < NB; bd++) {
    const cuts = []; let y = r() * 0.7; while (y < LEN - 0.4) { cuts.push(Math.round(y / LEN * S)); y += 0.55 + 1.0 * r(); }
    const ids = cuts.map(() => { tones.push([0.93 + 0.11 * r(), r(), r()]); return tones.length - 1; });
    for (let py = 0; py < S; py++) {
      let q = cuts.length - 1, dj = S; for (let j = 0; j < cuts.length; j++) { if (cuts[j] <= py) q = j; const d = Math.abs(py - cuts[j]); dj = Math.min(dj, d, S - d); }
      for (let px = Math.round(bd * bw); px < Math.round((bd + 1) * bw); px++) {
        const i = py * S + px, dx = px - Math.round(bd * bw);
        piece[i] = ids[q]; joint[i] = Math.max(dx === 0 ? 1 : dx === 1 ? 0.3 : 0, dj === 0 ? 0.9 : dj === 1 ? 0.25 : 0);
      }
    }
  }
  const grain = (i, x, y) => { const id = piece[i], gy = y * K / S + id * 7, g0 = Math.floor(gy), t = gy - g0, gx = (x + id * 53) % S; return streak[(g0 % K) * S + gx] * (1 - t) + streak[((g0 + 1) % K) * S + gx] * t; };
  const height = new Float32Array(S * S); for (let i = 0; i < height.length; i++) height[i] = 1 - joint[i];
  return maps(S, [NB * 0.057, LEN], { strength: 1.3, height,
    col: (i, x, y) => {
      const t = tones[piece[i]], g = grain(i, x, y), k = t[0] * (0.95 + 0.09 * g) * (1 - 0.3 * joint[i]), warm = t[1] > 0.86 ? 0.4 : t[1] * 0.2, pale = t[2] > 0.75 ? 0.3 : 0;
      return [(233 - 14 * warm + 8 * pale) * k, (204 - 24 * warm + 12 * pale) * k, (157 - 30 * warm + 18 * pale) * k];
    },
    rough: (i) => 0.2 + 0.13 * wear[i] + 0.3 * joint[i] });
}
// Underside of a profiled steel deck: ribs along u.
function deckMaps() {
  const S = 256, n = fbm(S, 4, 3, 821), rib = y => { const p = (y % 64) / 64; return p < 0.3 ? 1 : p < 0.42 ? 1 - (p - 0.3) / 0.12 : p < 0.88 ? 0 : (p - 0.88) / 0.12; };
  const height = new Float32Array(S * S); for (let y = 0, i = 0; y < S; y++) for (let x = 0; x < S; x++, i++) height[i] = rib(y);
  return maps(S, [2, 0.8], { strength: 2.4, height, col: (i, x, y) => { const k = 0.82 + 0.15 * rib(y) + 0.05 * (n[i] - 0.5); return [226 * k, 228 * k, 224 * k]; }, rough: () => 0.55 });
}
// Fabric-faced acoustic boards, 1.2 by 0.8 m, with shadow gaps: two by two per repeat.
function acousticMaps() {
  const S = 512, r = rng(831), w = new Float32Array(S * S); for (let i = 0; i < w.length; i++) w[i] = r();
  const gap = (x, y) => { const fx = x % 256, fy = y % 256, d = Math.min(fx, 256 - fx, fy, 256 - fy); return d < 3 ? 1 - d / 3 : 0; }, tone = [1.0, 0.92, 0.95, 1.03];
  const height = new Float32Array(S * S); for (let y = 0, i = 0; y < S; y++) for (let x = 0; x < S; x++, i++) height[i] = 1 - gap(x, y) + 0.04 * w[i];
  return maps(S, [2.4, 1.6], { strength: 2.6, height, rough: () => 0.95,
    col: (i, x, y) => { const j = gap(x, y), k = tone[(y >> 8) * 2 + (x >> 8)] * (0.95 + 0.08 * w[i]) * (x % 4 === 0 || y % 4 === 0 ? 0.965 : 1) * (1 - 0.72 * j); return [207 * k, 200 * k, 184 * k]; } });
}
// Cream roof sheet with standing seams every 0.45 m along u.
function roofMaps() {
  const S = 256, n = fbm(S, 4, 4, 811), r = rng(812), row = Array.from({ length: S }, () => r());
  const seam = x => { const q = ((x % 64) + 64) % 64, d = Math.min(q, 64 - q); return d < 3 ? 1 - d / 3 : 0; };
  const height = new Float32Array(S * S); for (let y = 0, i = 0; y < S; y++) for (let x = 0; x < S; x++, i++) height[i] = seam(x);
  return maps(S, [1.8, 2.4], { strength: 3.2, height, rough: i => 0.5 + 0.2 * n[i],
    col: (i, x, y) => { const k = 0.93 + 0.1 * n[i] + 0.03 * (row[y] - 0.5) - 0.22 * seam(x - 4) + 0.05 * seam(x); return [233 * k, 227 * k, 208 * k]; } });
}

// ---- materials ----------------------------------------------------------------------------------------------------------
// The floor and the paint on it mirror the hall. A cube map belongs to one point, so the reflection is corrected for the
// place of each fragment: the mirrored ray is cut with the box of the hall, and the map is read toward that point.
const HALLBOX = { min: { value: new THREE.Vector3() }, max: { value: new THREE.Vector3() }, eye: { value: new THREE.Vector3() }, on: { value: 0 }, spec: { value: 0.45 }, diff: { value: 1 } };
function mirrorsHall(m) {
  m.onBeforeCompile = shader => {
    shader.uniforms.hallMin = HALLBOX.min; shader.uniforms.hallMax = HALLBOX.max; shader.uniforms.hallEye = HALLBOX.eye; shader.uniforms.hallOn = HALLBOX.on; shader.uniforms.hallSpec = HALLBOX.spec; shader.uniforms.hallDiff = HALLBOX.diff;
    shader.vertexShader = shader.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vHallPos;')
      .replace('#include <project_vertex>', '#include <project_vertex>\n\tvHallPos = ( modelMatrix * vec4( transformed, 1.0 ) ).xyz;');
    const line = 'reflectVec = transformDirectionByInverseViewMatrix( reflectVec, viewMatrix );';
    const chunk = THREE.ShaderChunk.envmap_physical_pars_fragment.replace(line, line + `
			if ( hallOn > 0.5 ) {
				vec3 hallDir = reflectVec + vec3( 1e-4 ) * ( 1.0 - step( 1e-4, abs( reflectVec ) ) );
				vec3 hallFar = max( ( hallMax - vHallPos ) / hallDir, ( hallMin - vHallPos ) / hallDir );
				reflectVec = normalize( vHallPos + hallDir * min( min( hallFar.x, hallFar.y ), hallFar.z ) - hallEye );
			}`);
    shader.fragmentShader = shader.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vHallPos;\nuniform vec3 hallMin;\nuniform vec3 hallMax;\nuniform vec3 hallEye;\nuniform float hallOn;\nuniform float hallSpec;\nuniform float hallDiff;')
      .replace('#include <envmap_physical_pars_fragment>', chunk)
      // The one lamp the lighting module hangs in the hall is strong after dark: straight under it the boards would bleach out and the finish
      // would show a single glaring spot. Its share is held back on the floor (hallSpec, hallDiff follow the daylight); what the floor
      // mirrors is the captured hall, with all its lamps.
      .replace('#include <lights_fragment_end>', '#include <lights_fragment_end>\n\treflectedLight.directSpecular *= hallSpec;\n\treflectedLight.directDiffuse *= hallDiff;');
  };
  m.customProgramCacheKey = () => 'gym-hallbox';
  return m;
}
let M = null;
function materials(low, plainShaders) {
  if (M) return M;
  const hall = [], dyn = [];
  const std = (name, o) => { const m = new THREE.MeshStandardMaterial(o); m.name = 'gym-' + name; return m; };
  const inn = (name, o, gain = 1) => { const m = std('in-' + name, o); m.userData.gain = gain; hall.push(m); return m; };                 // a material of the interior: lit by the hall's own light
  const from = (name, base, gain = 1) => { const m = base.clone(); m.name = 'gym-in-' + name; m.userData = { gain }; hall.push(m); return m; };
  const glazing = (name, args) => { const m = pbr('glazing', args, { envMapIntensity: 1.5 }).clone(); m.name = 'gym-' + name; return m; };
  // emissive strength by day and after dark; lamps come on at dusk. (userData.glow also tells the lighting module to leave the material alone.)
  const glow = (m, day, night, lamp = false) => { m.userData.glow = day; m.userData.night = night; m.userData.lamp = lamp; m.emissiveIntensity = day; dyn.push(m); return m; };
  const mirror = m => (plainShaders || low ? m : mirrorsHall(m));
  const paint = (name, color, k) => mirror(inn('paint-' + name, { color, roughness: 0.3, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -k, polygonOffsetUnits: -2 * k }));
  const decal = { transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 };
  M = {
    hall, dyn,
    // ---- outside
    roof: std('roof', { ...roofMaps(), roughness: 1, metalness: 0.05 }),
    soffit: std('soffit', { color: 0x4b4f54, roughness: 0.9 }),
    red: pbr('cladding', [0x8a2f2b, 1.2, 0.6, 0.62]),
    plinth: pbr('granitePolished', [0x4b4644, 7]),
    apron: pbr('paving', [0xb9b3a7, 0x9c968c, 4, 8, [2.4, 2.4], 11, true]),
    step: pbr('paving', [0xd2ccbf, 0xc0b9a9, 2, 2, [1.2, 1.2], 23, false]),
    kerb: pbr('paving', [0xa8a39a, 0x9a958c, 2, 2, [1.6, 1.6], 17, false]),
    hedge: pbr('hedge'), soil: pbr('hedge', [0x2a4a22]),
    steel: pbr('steel'),
    dark: plain('darkmetal', 0x2b2d30, 0.5, 0.6),
    pipe: plain('downpipe', 0xdcdcd8, 0.5, 0.3),
    fixing: std('fixing', { color: 0x6a2a26, roughness: 0.4, metalness: 0.5 }),                               // heads of the panel fixings, coated in the colour of the panels
    lampX: plain('lamp', 0xfff1d6, 0.4, 0, { emissive: 0xffe2b0, emissiveIntensity: 1.4 }),               // lamp glass outside: the lighting module makes it brighter after dusk
    teal: glazing('tealband', [0x3f9a8e, 4, 2, [7.2, 1.75], 5]),
    clere: glazing('clere', [0x44606c, 4, 1, [7.4, 2.0], 6]),
    clereE: glazing('clere-east', [0x3b5661, 4, 3, [7.8, 5.25], 7]),
    beige: std('beige', { color: 0xcbb48c, roughness: 0.85 }),
    silver: std('silver', { color: 0xb4b9bd, roughness: 0.45, metalness: 0.3 }),
    monitor: std('monitor', { color: 0xdfe6e6, roughness: 0.35, metalness: 0.05 }),
    unit: std('plant', { color: 0xa9aeb0, roughness: 0.6, metalness: 0.4 }),
    skyTop: std('skyTop', { color: 0xcfe0e6, roughness: 0.15, metalness: 0.2 }),                           // glazed canopy seen from above
    skyPanel: glow(std('skyPanel', { color: 0xdfe9ee, roughness: 0.9, emissive: 0xdfe9ee }), 0.8, 0.03),   // the same glazing seen from below, against the sky
    slogan: std('slogan', { color: 0xffffff, roughness: 0.5, metalness: 0, map: sloganTexture(), emissive: 0x3a2a08, ...decal }),
    // ---- inside
    floor: mirror(inn('floor', { ...mapleMaps(low), roughness: 1, metalness: 0 })),
    lineW: paint('white', 0xf2f0e8, 3), lineK: paint('dark', 0x24272c, 3), lineB: paint('blue', 0x2866c4, 4), lineG: paint('green', 0x1f8a4f, 5), stain: paint('maroon', 0x7c2c28, 2),
    wallP: inn('paint', { color: 0xece8dd, roughness: 0.85 }),
    dado: from('dado', pbr('timber', [0xb98a52])),
    acou: inn('acoustic', { ...acousticMaps(), roughness: 1 }),
    conc: from('concrete', pbr('concrete', [0xb4b1a8])),
    deck: inn('deck', { ...deckMaps(), roughness: 1, metalness: 0.1 }),
    truss: inn('steelwork', { color: 0xe9e7e0, roughness: 0.55, metalness: 0.1 }),
    galv: inn('galv', { color: 0xaab0b4, roughness: 0.4, metalness: 0.75 }),
    alu: inn('frame', { color: 0x8f969b, roughness: 0.5, metalness: 0.5 }),
    black: inn('black', { color: 0x1c1d20, roughness: 0.6 }),
    rubber: inn('rubber', { color: 0x4a5560, roughness: 0.9 }),
    nose: inn('nosing', { color: 0xd9b233, roughness: 0.7 }),
    seat: inn('seat', { color: 0xffffff, roughness: 0.42, vertexColors: true, side: THREE.DoubleSide }),
    pad: inn('pad', { color: 0x1f4f9c, roughness: 0.7 }),
    rim: inn('rim', { color: 0xe2581e, roughness: 0.45, metalness: 0.2 }),
    board: inn('backboard', { map: backboardTexture(), transparent: true, depthWrite: false, roughness: 0.06, side: THREE.DoubleSide }),
    net: inn('net', { map: netTexture(), alphaTest: 0.4, side: THREE.DoubleSide, roughness: 0.8 }),
    inox: from('inox', pbr('steel')),
    wood: from('benchwood', pbr('timber', [0xc79a5e])),
    cloth: inn('cloth', { color: 0x1f3f7a, roughness: 0.9 }),
    red2: inn('firered', { color: 0xb32a22, roughness: 0.5 }),
    brass: inn('brass', { color: 0xc9a14a, roughness: 0.35, metalness: 0.9 }),
    doorglaze: inn('doorglaze', { color: 0x9cc6c0, transparent: true, opacity: 0.32, roughness: 0.05, metalness: 0.2, depthWrite: false }),
    day: glow(inn('daylit', { color: 0x2c3438, roughness: 0.22, emissive: 0xffffff, emissiveMap: paneTexture(false) }), 1.5, 0.012),
    dayTeal: glow(inn('daylit-green', { color: 0x1f3a36, roughness: 0.22, emissive: 0xffffff, emissiveMap: paneTexture(true) }), 1.25, 0.01),
    rooflight: glow(inn('rooflight', { color: 0x30363a, roughness: 0.6, emissive: 0xf4f8ff }), 2.2, 0.008),
    lens: glow(inn('highbay-lens', { color: 0xdcdcda, roughness: 0.3, emissive: 0xfff0d6 }), 0.03, 6, true),
    lampBody: inn('highbay', { color: 0x8e9498, roughness: 0.45, metalness: 0.6 }),
    scoreboard: inn('scoreboard', { map: scoreboardTexture(), roughness: 0.9 }),
    exit: inn('exitsign', { color: 0x0a2a16, roughness: 0.5, emissive: 0xffffff, emissiveMap: exitTexture(), emissiveIntensity: 1.1 }),
    hoseSign: inn('hosesign', { map: plate('消火栓', 256, 96, '#ffffff', '#b32a22', 60), roughness: 0.5 }),
    storeSign: inn('storesign', { map: plate('器材室', 256, 96, '#2a2d31', '#e9e7e0', 60), roughness: 0.5 }),
    ball: inn('basketball', { map: ballTexture(false), roughness: 0.78 }),
    vball: inn('volleyball', { map: ballTexture(true), roughness: 0.6 }),
  };
  return M;
}

// ---- small geometry ------------------------------------------------------------------------------------------------------
/** Flat quad with its own texture coordinates, into a Batch (corners counter-clockwise seen from the front). */
function quadUV(bt, material, q, uv) {
  const p = bt._part(material), base = p.pos.length / 3;
  const ax = q[1][0] - q[0][0], ay = q[1][1] - q[0][1], az = q[1][2] - q[0][2], bx = q[3][0] - q[0][0], by = q[3][1] - q[0][1], bz = q[3][2] - q[0][2];
  let nx = ay * bz - az * by, ny = az * bx - ax * bz, nz = ax * by - ay * bx; const l = Math.hypot(nx, ny, nz) || 1; nx /= l; ny /= l; nz /= l;
  q.forEach((c, i) => bt._vert(p, c[0], c[1], c[2], nx, ny, nz, uv[i][0], uv[i][1]));
  p.idx.push(base, base + 1, base + 2, base, base + 2, base + 3);
}
/** Horizontal ring of round bar (a basket ring). */
function ring(bt, m, cx, cy, cz, R, r, seg = 24, tub = 6) {
  const p = bt._part(m), base = p.pos.length / 3;
  for (let i = 0; i <= seg; i++) { const a = i / seg * TAU, ca = Math.cos(a), sa = Math.sin(a);
    for (let j = 0; j <= tub; j++) { const t = j / tub * TAU, ct = Math.cos(t), st = Math.sin(t); bt._vert(p, cx + (R + r * ct) * ca, cy + r * st, cz + (R + r * ct) * sa, ct * ca, st, ct * sa, a * R, t * r); } }
  for (let i = 0; i < seg; i++) for (let j = 0; j < tub; j++) { const q = base + i * (tub + 1) + j; p.idx.push(q, q + 1, q + tub + 2, q, q + tub + 2, q + tub + 1); }
}
/** One moulded seat with its bracket, facing -x, standing on y = 0: a thin shell, lit on both sides. */
function seatGeometry(low) {
  const prof = low ? [[-0.21, 0.4], [0.12, 0.385], [0.2, 0.78]] : [[-0.225, 0.375], [-0.2, 0.405], [-0.05, 0.392], [0.09, 0.383], [0.15, 0.415], [0.18, 0.55], [0.2, 0.72], [0.215, 0.8]];
  const ws = low ? [-0.21, 0.21] : [-0.215, -0.12, 0.12, 0.215], pos = [], col = [], idx = [], nb = low ? 99 : 4;
  prof.forEach(([x, y], i) => ws.forEach(w => { const dish = !low && Math.abs(w) < 0.2 ? 0.014 : 0; pos.push(i >= nb ? x + dish : x, i >= nb ? y : y - dish, w); col.push(1, 1, 1); }));
  for (let i = 0; i < prof.length - 1; i++) for (let j = 0; j < ws.length - 1; j++) { const a = i * ws.length + j, c = a + ws.length; idx.push(a, c, c + 1, a, c + 1, a + 1); }
  const base = pos.length / 3, bx0 = -0.06, bx1 = 0.08, bz = 0.035, by = 0.385;                    // bracket: a dark box under the pan
  for (const [x, zz] of [[bx0, -bz], [bx1, -bz], [bx1, bz], [bx0, bz]]) { pos.push(x, 0, zz, x, by, zz); col.push(0.1, 0.1, 0.11, 0.1, 0.1, 0.11); }
  for (let i = 0; i < 4; i++) { const a = base + i * 2, c = base + ((i + 1) % 4) * 2; idx.push(a, a + 1, c + 1, a, c + 1, c); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g.setIndex(idx); g.computeVertexNormals();
  return g;
}

export function build(item, ctx) {
  const low = !!ctx.lowPower, safe = ctx.safe !== undefined ? !!ctx.safe : typeof location !== 'undefined' && /[?&]safe=1(&|$)/.test(location.search);
  if (safe) useStockShaders(true);
  materials(low, safe);
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
  // the hall inside: floor edges, the planes of the inner linings, the axis of the first view
  const ix0 = xW + 0.4, ix1 = xE - 0.5, iz0 = zN + 0.65, iz1 = zS - 0.65, izc = (iz0 + iz1) / 2, z0 = LZ / 2;
  const XI0 = xW + 0.43, XI1 = ix1 - 0.03, ZI0 = iz0 + 0.04, ZI1 = iz1 - 0.04;
  // the stand along the east wall: NT rows of seats, then a walkway level with the east gallery
  const NT = 8, TD = 0.85, TH = 0.4, GW = 1.9, AW = 1.4, bx0 = ix1 - GW - NT * TD, xWalk = bx0 + NT * TD, yDeck = F + (NT + 1) * TH;
  const sz0 = z0 - 21.5, sz1 = z0 + 21.5, aisleC = [-20.8, -10.4, 0, 10.4, 20.8].map(d => z0 + d), aisles = aisleC.map(q => [q - AW / 2, q + AW / 2]);
  const gdoor = [aisleC[1], aisleC[2], aisleC[3]], dcut = gdoor.map(q => [q - zN - 0.9, q - zN + 0.9]);      // doors from the walkway to the gallery, as spans in t
  // courts
  const MX = bx0 - 11.6, CX = ix0 + 17.6, CZ = [izc - 15.05, izc + 15.05];

  const mk = () => new Batch().frame(b.w, b.n);
  const v = mk(), c = mk(), vi = mk(), vf = mk(), xw = mk(), xe = mk(), xs = mk();                // shell, colliders, interior, interior small parts, small parts of the west, east and south faces
  const both = (m, ...a) => { v.slab(m, ...a); c.slab('generic', ...a); };
  const cut = (a, e, holes) => { const out = []; let s = a; for (const [h0, h1] of [...holes].sort((p, q) => p[0] - q[0])) { if (h1 <= s || h0 >= e) continue; if (h0 > s + 1e-6) out.push([s, h0]); s = Math.max(s, h1); } if (e > s + 1e-6) out.push([s, e]); return out; };
  const W3 = p => [b.w + p[0], p[1], b.n + p[2]];
  const bar = (bt, m, a, e, t = 0.1) => { bt.strut(m, W3(a), W3(e), t); bt.frame(b.w, b.n); };                               // square bar between two local points
  const rod = (bt, m, a, e, r, seg = 10, caps = false) => {                                                                  // round bar between two local points
    const d = new THREE.Vector3(e[0] - a[0], e[1] - a[1], e[2] - a[2]), len = d.length(); if (len < 1e-6) return;
    bt.setMatrix(new THREE.Matrix4().compose(new THREE.Vector3(...W3(a)), new THREE.Quaternion().setFromUnitVectors(UP, d.normalize()), ONE)); bt.cyl(m, 0, 0, 0, r, len, seg, caps); bt.frame(b.w, b.n);
  };
  const obox = (bt, m, x, y, zz, sx, sy, sz, ry = 0, rx = 0) => { bt.setMatrix(new THREE.Matrix4().compose(new THREE.Vector3(b.w + x, y, b.n + zz), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, 0, 'YXZ')), ONE)); bt.box(m, 0, 0, 0, sx, sy, sz); bt.frame(b.w, b.n); };
  // upright rectangle in the plane x = p (dir 'E' faces east, 'W' west) or z = p ('S' faces south, 'N' north), a0..a1 along the wall; uv = [u0, v0, u1, v1] from the lower left to the upper right corner as seen from the front
  const wall = (bt, m, dir, p, a0, a1, y0, y1, uv) => {
    if (a1 - a0 < 1e-4 || y1 - y0 < 1e-4) return;
    const flip = dir === 'E' || dir === 'N', l = flip ? a1 : a0, r = flip ? a0 : a1, P = (a, y) => (dir === 'E' || dir === 'W' ? [p, y, a] : [a, y, p]);
    const [u0, v0, u1, v1] = uv || [0, 0, a1 - a0, y1 - y0];
    quadUV(bt, m, [P(l, y0), P(r, y0), P(r, y1), P(l, y1)], [[u0, v0], [u1, v0], [u1, v1], [u0, v1]]);
  };
  // surface following the arch between x0 and x1 at height yf(x), facing up or down
  const patch = (bt, m, x0, x1, za, zb, yf, up = true, step = 2.5) => {
    const n = Math.max(1, Math.ceil((x1 - x0) / step));
    for (let i = 0; i < n; i++) {
      const xa = x0 + (x1 - x0) * i / n, xb = x0 + (x1 - x0) * (i + 1) / n, ya = yf(xa), yb = yf(xb);
      if (up) bt.quad(m, [xa, ya, za], [xa, ya, zb], [xb, yb, zb], [xb, yb, za]); else bt.quad(m, [xa, ya, za], [xb, yb, za], [xb, yb, zb], [xa, ya, zb]);
    }
  };
  // vertical face in the plane z = zp between two curves, facing south (+z) or north; uvf(x, y) gives the texture coordinates
  const zface = (bt, m, x0, x1, zp, lowf, highf, south, step = 2.5, uvf = (x, y) => [x - x0, y]) => {
    const n = Math.max(1, Math.ceil((x1 - x0) / step));
    for (let i = 0; i < n; i++) {
      const xa = x0 + (x1 - x0) * i / n, xb = x0 + (x1 - x0) * (i + 1) / n, l = south ? xa : xb, r = south ? xb : xa;
      quadUV(bt, m, [[l, lowf(l), zp], [r, lowf(r), zp], [r, highf(r), zp], [l, highf(l), zp]], [uvf(l, lowf(l)), uvf(r, lowf(r)), uvf(r, highf(r)), uvf(l, highf(l))]);
    }
  };
  // a door leaf hinged at (hx, hz), standing along `ang` (0 = toward east, a quarter turn = toward north); the push bar is on its local +z or -z side
  const leaf = (bt, hx, hz, ang, w, y, h, G, FR, side = 1) => {
    bt.frame(b.w + hx, b.n + hz, ang);
    bt.slab(FR, 0, y, -0.022, 0.07, h, 0.044).slab(FR, w - 0.07, y, -0.022, 0.07, h, 0.044).slab(FR, 0.07, y + h - 0.08, -0.022, w - 0.14, 0.08, 0.044).slab(FR, 0.07, y, -0.022, w - 0.14, 0.22, 0.044);
    bt.slab(G, 0.07, y + 0.22, -0.006, w - 0.14, h - 0.3, 0.012);
    bt.slab(FR, 0.1, y + 1.0, side > 0 ? 0.055 : -0.085, w - 0.2, 0.035, 0.03).slab(FR, 0.13, y + 1.005, side > 0 ? 0.022 : -0.06, 0.03, 0.025, 0.04).slab(FR, w - 0.16, y + 1.005, side > 0 ? 0.022 : -0.06, 0.03, 0.025, 0.04);
    bt.frame(b.w, b.n);
  };
  // inner lining of a wall: timber dado under a rail, fabric-faced acoustic boards above it
  const lining = (dir, p, a0, a1, y0, y1, dadoH = 2.4) => {
    if (a1 - a0 < 0.02) return;
    const yd = Math.min(y1, y0 + dadoH), out = dir === 'E' || dir === 'S' ? 1 : -1, ew = dir === 'E' || dir === 'W';
    wall(vi, M.dado, dir, p, a0, a1, y0, yd, [a0, y0, a1, yd]);
    if (y1 > yd + 0.05) wall(vi, M.acou, dir, p, a0, a1, yd, y1, [0, 0, Math.max(1, Math.round((a1 - a0) / 1.2)) * 1.2, Math.max(1, Math.round((y1 - yd) / 0.8)) * 0.8]);
    for (const [y, h, d] of [[y0, 0.12, 0.02], [yd - 0.05, 0.1, 0.035]]) { const q = out > 0 ? p : p - d; if (ew) vi.slab(M.wood, q, y, a0, d, h, a1 - a0); else vi.slab(M.wood, a0, y, q, a1 - a0, h, d); }
  };

  // paving under the eaves, with a kerb round it
  v.slab(M.apron, 0, 0, 0, LX, 0.04, LZ, 'D');
  for (const [x, zz, sx, sz] of [[0, 0, LX, 0.3], [0, LZ - 0.3, LX, 0.3], [0, 0.3, 0.3, LZ - 0.6], [LX - 0.3, 0.3, 0.3, LZ - 0.6]]) v.slab(M.kerb, x, 0, zz, sx, 0.046, sz, 'D');

  // ================= WEST FACE toward the track =================
  for (const [x, zc] of [[xW, zN], [xW, zS - 1.3], [xE - 1.3, zN], [xE - 1.3, zS - 1.3]]) both('wallWhite', x, 0, zc, 1.3, yBot(x + 0.65) + 0.2, 1.3);   // corner columns of the hall
  const hCol = yBot(xW + 0.45) + 0.2;
  for (const t of colT) both('wallWhite', xW, 0, z(t) - 0.45, 0.9, hCol, 0.9);
  // red walls: cassette panels 1.2 by 0.6 m (fitted to each wall) on a dark granite plinth, a fixing in each corner of every panel
  const yPl = F + 0.35, rows = Math.max(1, Math.round((yRed - yPl) / 0.6)), fixings = [];
  const sw = (panels[1][1] - panels[1][0]) * 0.9, sh = sw * 384 / 4096, sy = F + (yRed - F) * 0.74, szl = z((panels[1][0] + panels[1][1]) / 2), sx = xW - 0.125;   // slogan
  const colSpans = [[0, 1.3], ...colT.map(t => [t - 0.45, t + 0.45]), [Lw - 1.3, Lw]];
  panels.forEach(([t0, t1], pi) => {
    const L = t1 - t0, n = Math.max(1, Math.round(L / 1.2));
    v.slab(M.plinth, xW - 0.14, 0, z(t0) - 0.02, 0.54, yPl, L + 0.04);
    v.slab(M.red, xW - 0.1, yPl, z(t0), 0.5, yRed - yPl, L, 'WD'); wall(v, M.red, 'W', xW - 0.1, z(t0), z(t1), yPl, yRed, [0, 0, n * 1.2, rows * 0.6]);
    c.slab('generic', xW - 0.14, 0, z(t0), 0.54, yRed, L);
    v.slab('wallWhite', xW - 0.16, yRed, z(t0) - 0.03, 0.62, 0.2, L + 0.06);                    // coping
    for (let i = 0; i < n; i++) for (let j = 0; j < rows; j++) for (const [du, dv] of [[0.07, 0.12], [0.93, 0.12], [0.07, 0.88], [0.93, 0.88]]) {
      const fy = yPl + (j + dv) * (yRed - yPl) / rows, fz = z(t0) + (i + du) * L / n;
      if (pi === 1 && Math.abs(fy - sy) < sh / 2 + 0.05 && Math.abs(fz - szl) < sw / 2 + 0.05) continue;                    // none behind the lettering
      fixings.push([xW - 0.104, fy, fz]);
    }
    for (const [a, e] of cut(t0, t1, colSpans)) lining('E', XI0, z(a), z(e), F, yCope);                                      // inside
  });
  const solid = [...colSpans, ...panels].sort((p, q) => p[0] - q[0]), wdoors = [];
  // glazing that runs to the ground beside the panels; one door in each gap next to the long panel (frame 70)
  for (const [a, e] of cut(0, Lw, solid)) {
    const w = e - a, door = Math.abs(e - panels[1][0]) < 1e-6 || Math.abs(a - panels[1][1]) < 1e-6, y0 = a >= tP0 && e <= tP1 ? F : 0, yg = door ? F + 2.45 : y0, yi = Math.max(yg, F);
    const nr = Math.max(1, Math.round((yCope - yg) / 0.95));
    wall(v, M.teal, 'W', xW + 0.3, z(a), z(e), yg, yCope, [0, 0, 3.6, nr * 0.875]);
    wall(vi, M.dayTeal, 'E', XI0, z(a), z(e), yi, yCope, [z(a) / 4, 0, z(e) / 4, 1]);
    for (let i = 1; i < nr; i++) { const y = yg + (yCope - yg) * i / nr; v.slab('metalWhite', xW + 0.26, y - 0.03, z(a), 0.12, 0.06, w); if (y > yi) vi.slab(M.alu, XI0, y - 0.03, z(a), 0.035, 0.06, w); }
    v.slab('metalWhite', xW + 0.26, yg, z(a) + w / 2 - 0.03, 0.12, yCope - yg, 0.06); vi.slab(M.alu, XI0, yi, z(a) + w / 2 - 0.03, 0.035, yCope - yi, 0.06);
    c.slab('generic', xW + 0.2, yg, z(a), 0.3, yCope - yg, w);
    if (!door) continue;
    wdoors.push((a + e) / 2);
    const zc = z((a + e) / 2);
    v.slab('metalWhite', xW + 0.22, F, z(a), 0.24, 2.35, 0.07).slab('metalWhite', xW + 0.22, F, z(e) - 0.07, 0.24, 2.35, 0.07).slab('metalWhite', xW + 0.22, F + 2.35, z(a), 0.24, 0.1, w);
    vi.slab(M.alu, XI0, F, z(a), 0.04, 2.45, 0.08).slab(M.alu, XI0, F, z(e) - 0.08, 0.04, 2.45, 0.08).slab(M.alu, XI0, F + 2.35, z(a), 0.04, 0.1, w);
    v.slab(M.steel, xW + 0.2, F, z(a) + 0.07, 0.28, 0.012, w - 0.14);                                                         // threshold
    for (const zl of [z(a) + 0.095, z(e) - 0.095]) { leaf(vi, xW + 0.47, zl, 0, 0.57, F + 0.02, 2.28, M.doorglaze, M.inox, zl < zc ? 1 : -1); c.slab('generic', xW + 0.47, F, zl - 0.03, 0.57, 2.2, 0.06); }   // leaves standing open, swung into the hall
    vf.slab(M.black, XI0, F + 2.52, zc - 0.4, 0.07, 0.28, 0.8); wall(vf, M.exit, 'E', XI0 + 0.075, zc - 0.38, zc + 0.38, F + 2.54, F + 2.78, [0, 0, 1, 1]);
    // canopy: a white steel tray on two tie rods, a light under it
    v.slab('metalWhite', xW - 2.3, F + 2.75, zc - 1.4, 2.2, 0.1, 2.8).slab(M.dark, xW - 2.32, F + 2.74, zc - 1.42, 0.03, 0.12, 2.84).slab(M.lampX, xW - 1.45, F + 2.735, zc - 0.35, 0.3, 0.02, 0.7);
    for (const s of [-1, 1]) bar(v, M.steel, [xW - 0.1, F + 4.3, zc + s * 1.25], [xW - 2.1, F + 2.86, zc + s * 1.25], 0.035);
  }
  // teal band (two rows), white band, clerestory, lintel
  for (const [a, e] of cut(0, Lw, colSpans)) {
    const w = e - a, n = Math.max(1, Math.round(w / 1.8)), nu = Math.max(1, Math.round(w / 3.7)), yCl = yBot(xW + 0.3) - 0.25;
    wall(v, M.teal, 'W', xW + 0.3, z(a), z(e), yCope, yBand, [0, 0, n * 1.8, 1.75]);
    for (let i = 1; i < n; i++) { v.slab('metalWhite', xW + 0.26, yCope, z(a + w * i / n) - 0.035, 0.12, yBand - yCope, 0.07); vi.slab(M.alu, XI0, yCope, z(a + w * i / n) - 0.03, 0.035, yBand - yCope, 0.06); }
    v.slab('metalWhite', xW + 0.26, yMid - 0.035, z(a), 0.12, 0.07, w);
    wall(v, M.clere, 'W', xW + 0.3, z(a), z(e), ySill, yCl, [0, 0, nu * 3.7, 2.0]);
    for (let i = 0; i < nu; i++) {
      if (i) v.slab('wallWhite', xW + 0.24, ySill, z(a + w * i / nu) - 0.11, 0.2, yCl - ySill, 0.22);
      v.slab('metalWhite', xW + 0.27, ySill, z(a + w * (i + 0.5) / nu) - 0.025, 0.11, yCl - ySill, 0.05);
    }
    for (let i = 1; i < 2 * nu; i++) vi.slab(M.alu, XI0, ySill, z(a + w * i / (2 * nu)) - 0.03, 0.035, yCl - ySill, 0.06);
    v.slab('wallWhite', xW + 0.12, yCl, z(a), 0.3, yBot(xW + 0.42) + 0.1 - yCl, w);
    v.slab('wallWhite', xW + 0.12, yBand, z(a), 0.3, ySill - yBand, w);
    c.slab('generic', xW + 0.2, yCope, z(a), 0.3, hCol - yCope, w);
    // inside: the same bands
    wall(vi, M.dayTeal, 'E', XI0, z(a), z(e), yCope, yBand, [z(a) / 4, 0, z(e) / 4, 1]); wall(vi, M.wallP, 'E', XI0, z(a), z(e), yBand, ySill);
    wall(vi, M.day, 'E', XI0, z(a), z(e), ySill, yCl, [z(a) / 4, 0, z(e) / 4, 1]); wall(vi, M.wallP, 'E', XI0, z(a), z(e), yCl, yBot(XI0));
    vi.slab(M.alu, XI0, yCope - 0.03, z(a), 0.045, 0.06, w).slab(M.alu, XI0, yMid - 0.03, z(a), 0.035, 0.06, w).slab(M.alu, XI0, yBand - 0.03, z(a), 0.045, 0.06, w).slab(M.alu, XI0, ySill - 0.03, z(a), 0.045, 0.06, w);
  }
  // floodlights at the columns, each hanging at the foot of a V of stays that run up to the eave; a rain pipe down the north side of every column
  for (const t of colT) {
    v.slab('black', xW - 0.6, yBand - 0.5, z(t) - 0.28, 0.32, 0.42, 0.56).slab('steel', xW - 0.3, yBand - 0.12, z(t) - 0.04, 0.3, 0.08, 0.08).slab(M.lampX, xW - 0.615, yBand - 0.46, z(t) - 0.24, 0.02, 0.34, 0.48);
    for (const s of [-1, 1]) bar(v, 'black', [xW - 0.02, yBand + 0.15, z(t) + s * 0.15], [xW - 2.8, yBot(xW - 2.8) + 0.03, z(t) + s * 1.1], 0.07);
  }
  for (const t of [0.65, ...colT, Lw - 0.65]) {
    const zp = z(t) - (t < 1 || t > Lw - 1 ? 0.65 : 0.45) - 0.07, xp = xW + 0.5;
    v.cyl(M.pipe, xp, 0.05, zp, 0.055, yBot(xp) - 0.05, 10, false).slab(M.pipe, xp - 0.08, 0.04, zp - 0.08, 0.16, 0.14, 0.16);
    for (let y = 1.2; y < yBot(xp) - 0.5; y += 2.2) xw.slab(M.dark, xp - 0.07, y, zp - 0.07, 0.14, 0.03, 0.14);
  }
  // low stepped platform of pale granite with a white block at each end; steps with a dark nosing line
  v.slab(M.step, 0.9, 0, z(tP0), xW - 0.5, F - 0.02, tP1 - tP0);                               // runs in under the wall line, so the doorways have a floor
  v.slab(M.step, 1.05, F - 0.02, z(tP0) + 0.15, xW - 0.65, 0.02, tP1 - tP0 - 0.3, 'D').slab('wallWhite', 0.9, F - 0.02, z(tP0), 0.15, 0.02, tP1 - tP0, 'D');
  c.slab('generic', 0.9, 0, z(tP0), xW - 0.5, F, tP1 - tP0);
  for (let i = 0; i < 3; i++) {
    v.slab(M.step, 0.3 * i, 0, z(tP0) + cube, 0.3, 0.15 * (i + 1), tP1 - tP0 - 2 * cube);
    xw.slab(M.dark, 0.3 * i, 0.15 * (i + 1), z(tP0) + cube, 0.035, 0.004, tP1 - tP0 - 2 * cube);
  }
  xw.slab(M.dark, 0.9, F, z(tP0) + cube, 0.035, 0.004, tP1 - tP0 - 2 * cube);
  for (const zc of [z(tP0), z(tP1) - cube]) { both('wallWhite', 0, 0, zc, 2.4, 1.7, cube); v.slab('roofGrey', -0.02, 0.5, zc + 0.5, 0.03, 0.8, cube - 1.0); v.slab(M.plinth, -0.02, 0, zc - 0.02, 2.44, 0.12, cube + 0.04); }
  for (let i = 0; i < 5; i++) {                                                                                               // bollard lights
    const zl = z(panels[1][0] + (panels[1][1] - panels[1][0]) * (i + 0.5) / 5), xl = xW - 1.1;
    v.cyl(M.steel, xl, F, zl, 0.065, 0.5, 12).cyl(M.lampX, xl, F + 0.5, zl, 0.06, 0.12, 12, false).cyl(M.steel, xl, F + 0.62, zl, 0.075, 0.03, 12);
  }
  v.slab('white', xW - 0.13, F + 1.5, z(panels[0][0]) + 1.3, 0.03, 0.55, 0.85);                                   // plaque on the short panel (text not legible)
  const zw = z(panels[2][0]) + (panels[2][1] - panels[2][0]) * 0.36;                                              // small window in the medium panel
  v.slab('wallWhite', xW - 0.13, F + 1.35, zw, 0.04, 0.9, 1.5).slab(M.teal, xW - 0.15, F + 1.45, zw + 0.1, 0.03, 0.7, 1.3);
  // slogan and emblem on the long panel, read from north to south
  M.slogan.map.repeat.set(1 / sw, 1 / sh);
  v.quad(M.slogan, [sx, sy - sh / 2, szl - sw / 2], [sx, sy - sh / 2, szl + sw / 2], [sx, sy + sh / 2, szl + sw / 2], [sx, sy + sh / 2, szl - sw / 2]);

  // ================= NORTH AND SOUTH ENDS =================
  const nb = 7, pitch = (xE - xW - 1.3) / nb, colX = i => xW + 0.65 + i * pitch, hw = i => (i === 0 || i === nb ? 0.65 : 0.45), sdoors = [];
  for (const south of [false, true]) {
    const zb = south ? zS - 0.65 : zN + 0.2, zo = south ? zS - 0.2 : zN + 0.2;                                    // brick wall 0.45 thick: its start and its outer face
    const zin = south ? ZI1 : ZI0, din = south ? 'N' : 'S';                                                       // inner lining: its plane and the way it faces
    v.slab('brickRed', xW + 1.3, 0, zb, xE - xW - 2.6, ySill - 0.2, 0.45);
    v.slab(M.plinth, xW + 1.3, 0, south ? zo : zo - 0.035, xE - xW - 2.6, 0.45, 0.035);
    v.slab('wallWhite', xW + 1.3, ySill - 0.2, zb - 0.06, xE - xW - 2.6, 0.2, 0.57);                             // sill band under the clerestory
    c.slab('generic', xW, 0, south ? zS - 0.9 : zN, xE - xW, H, 0.9);
    for (let i = 1; i < nb; i++) v.slab('wallWhite', colX(i) - 0.45, 0, south ? zS - 0.9 : zN, 0.9, yBot(colX(i)) + 0.2, 0.9);
    for (let i = 0; i < nb; i++) {
      const x0 = colX(i) + hw(i), w = colX(i + 1) - hw(i + 1) - x0;
      zface(v, M.clere, x0, x0 + w, south ? zb + 0.27 : zb + 0.18, () => ySill, yBot, south, 2.5, (x, y) => [(x - x0) / w * 7.4, y - ySill]);
      zface(vi, M.day, x0, x0 + w, zin, () => ySill, x => yBot(x) - 0.03, !south, 2.5, (x, y) => [x / 4, (y - ySill) / 6]);
      for (let j = 1; j < 4; j++) { const xm = x0 + w * j / 4; v.slab('wallWhite', xm - 0.07, ySill, zb + 0.13, 0.14, yBot(xm) - ySill + 0.1, 0.2); vi.slab(M.alu, xm - 0.03, ySill, south ? zin - 0.035 : zin, 0.06, yBot(xm) - ySill, 0.035); }
      if (yBot(x0 + w / 2) - ySill > 3.4) { v.slab('metalWhite', x0, ySill + 2.1 * k, zb + 0.15, w, 0.08, 0.16); vi.slab(M.alu, x0, ySill + 2.1 * k, south ? zin - 0.035 : zin, w, 0.06, 0.035); }   // transom where the panes get tall
      lining(din, zin, x0, x0 + w, F, ySill - 0.2); wall(vi, M.wallP, din, zin, x0, x0 + w, ySill - 0.2, ySill);
      const fr = q => x0 + w * q;
      if (!south) {
        // tall narrow windows with white sills in the two bays next to the north-west corner (frame 58)
        for (const q of i === 0 ? [0.28, 0.5, 0.72] : i === 1 ? [0.3, 0.52] : []) v.slab(M.teal, fr(q) - 0.4, 2.9, zo - 0.04, 0.8, 2.7, 0.05).slab('wallWhite', fr(q) - 0.5, 2.6, zo - 0.1, 1.0, 0.3, 0.12);
      } else {
        // tall window strips in three rows of panes above the white band (frame 20)
        for (const q of [0.2, 0.5, 0.8]) {
          v.slab(M.teal, fr(q) - 0.8, 5.0 * k, zo - 0.01, 1.6, 2.7 * k, 0.05).slab('wallWhite', fr(q) - 0.9, 5.0 * k - 0.2, zo - 0.01, 1.8, 0.2, 0.12);
          for (const y of [5.9, 6.8]) v.slab('metalWhite', fr(q) - 0.8, y * k - 0.035, zo - 0.01, 1.6, 0.07, 0.08);
        }
        if (i === 1 || i === 5) sdoors.push(fr(0.5));
      }
    }
    if (south) v.slab('wallWhite', xW + 1.3, 4.2, zo - 0.01, xE - xW - 2.6, 0.4, 0.14);                           // white band above the ground storey
  }
  // white lower wall section in the middle bays of the north face, with low dark windows (frame 58, satellite)
  { const xa = colX(3) - 0.45, xb = colX(6) + 0.45;
    both('wallWhite', xa, 0, zN - 0.5, xb - xa, 5.4, 0.75); v.slab(M.plinth, xa - 0.02, 0, zN - 0.53, xb - xa + 0.04, 0.45, 0.04);
    for (let i = 3; i < 6; i++) for (const q of [0.27, 0.73]) v.slab('glassDark', colX(i) + pitch * q - 0.9, 1.0, zN - 0.53, 1.8, 1.1, 0.04); }
  // south doors: a stoop of four risers, a glazed double door at floor level under a small canopy; the same door from inside, with its exit sign
  const ramps = new THREE.Group(); ramps.position.set(b.w, 0, b.n); ramps.visible = false;
  const ramp = (xa, ya, xb, yb, za, zb) => {                 // inclined plate (collision only), sloping along x: its top surface on the line from (xa, ya) to (xb, yb)
    const len = Math.hypot(xb - xa, yb - ya), ang = Math.atan2(yb - ya, xb - xa), m = new THREE.Mesh(new THREE.BoxGeometry(len, 0.2, zb - za));
    m.position.set((xa + xb) / 2 + 0.1 * Math.sin(ang), (ya + yb) / 2 - 0.1 * Math.cos(ang), (za + zb) / 2); m.rotation.z = ang; ramps.add(m);
  };
  const rampZ = (za, ya, zb, yb, xa, xb) => {                // the same, sloping along z
    const len = Math.hypot(zb - za, yb - ya), ang = Math.atan2(yb - ya, zb - za), m = new THREE.Mesh(new THREE.BoxGeometry(xb - xa, 0.2, len));
    m.position.set((xa + xb) / 2, (ya + yb) / 2 - 0.1 * Math.cos(ang), (za + zb) / 2 + 0.1 * Math.sin(ang)); m.rotation.x = -ang; ramps.add(m);
  };
  for (const xd of sdoors) {
    const zo = zS - 0.2;
    v.slab(M.step, xd - 1.5, 0, zo, 3.0, F, 1.3); c.slab('generic', xd - 1.5, 0, zo, 3.0, F, 1.3);
    for (let i = 0; i < 3; i++) v.slab(M.step, xd - 1.5, 0, zo + 1.3 + 0.3 * i, 3.0, F - 0.15 * (i + 1), 0.3);
    rampZ(zo + 1.3, F, zo + 2.35, 0, xd - 1.5, xd + 1.5);
    v.slab('metalWhite', xd - 1.02, F, zo - 0.01, 2.04, 2.42, 0.07).slab(M.clere, xd - 0.94, F + 0.04, zo + 0.02, 1.88, 2.3, 0.05);
    xs.slab('metalWhite', xd - 0.03, F, zo + 0.05, 0.06, 2.34, 0.04).slab('metalWhite', xd - 0.94, F, zo + 0.05, 1.88, 0.2, 0.035);
    for (const s of [-1, 1]) rod(xs, M.steel, [xd + s * 0.12, F + 0.85, zo + 0.12], [xd + s * 0.12, F + 1.35, zo + 0.12], 0.014, 6);
    v.slab('metalWhite', xd - 1.6, F + 2.6, zo, 3.2, 0.1, 1.5).slab(M.dark, xd - 1.62, F + 2.59, zo + 1.5, 3.24, 0.12, 0.03).slab(M.lampX, xd - 0.3, F + 2.585, zo + 0.5, 0.6, 0.02, 0.3);
    for (const s of [-1, 1]) bar(v, M.steel, [xd + s * 1.4, F + 3.6, zo], [xd + s * 1.4, F + 2.7, zo + 1.35], 0.035);
    // inside
    vi.slab(M.alu, xd - 1.0, F, ZI1 - 0.05, 2.0, 2.4, 0.05); vf.slab(M.black, xd - 0.4, F + 2.5, ZI1 - 0.07, 0.8, 0.28, 0.07); wall(vf, M.exit, 'N', ZI1 - 0.075, xd - 0.38, xd + 0.38, F + 2.52, F + 2.76, [0, 0, 1, 1]);
    leaf(vi, xd - 0.92, ZI1 - 0.075, 0, 0.9, F + 0.02, 2.3, M.day, M.inox, -1); leaf(vi, xd + 0.92, ZI1 - 0.075, Math.PI, 0.9, F + 0.02, 2.3, M.day, M.inox, 1);
  }

  // ================= EAST FACE: recessed wall, gallery, tall slender columns =================
  const xc = LX - 1.0, xd = xc + 0.45, hE = yBot(xE - 0.5) + 0.2, G = [0, 5.5, 13.3, 21.1, 32.5, 40.3, 48.1, 53.6].map(t => t * f), y1E = hE - 0.7;
  // the wall: whole below the gallery and above the door heads, in pieces between the three doors to the stand
  both('wallWhite', xE - 0.5, 0, z(1.3), 0.4, yDeck, Lw - 2.6); both('wallWhite', xE - 0.5, yDeck + 2.3, z(1.3), 0.4, hE - yDeck - 2.3, Lw - 2.6);
  for (const [a, e] of cut(1.3, Lw - 1.3, dcut)) both('wallWhite', xE - 0.5, yDeck, z(a), 0.4, 2.3, e - a);
  for (let j = 1; j < 7; j++) v.slab('wallWhite', xE - 0.1, 0, z(G[j]) - 0.3, 0.12, hE, 0.6);
  const glaze = (m, a, e, y0, y1, bars) => {
    const n = Math.max(1, Math.round((e - a) / 1.95));
    wall(v, m, 'E', xE - 0.07, z(a), z(e), y0, y1, [0, 0, n * 1.95, m === M.teal ? 1.75 * Math.max(1, Math.round((y1 - y0) / 1.75)) : y1 - y0]);
    for (let i = 1; i < n; i++) v.slab('metalWhite', xE - 0.1, y0, z(a + (e - a) * i / n) - 0.03, 0.07, y1 - y0, 0.06);
    for (const y of bars) if (y > y0 && y < y1) v.slab('metalWhite', xE - 0.1, y - 0.03, z(a), 0.07, 0.06, e - a);
  };
  for (let j = 0; j < 7; j++) {                             // ground level under the gallery
    const a = j === 0 ? 1.3 : G[j] + 0.3, e = j === 6 ? Lw - 1.3 : G[j + 1] - 0.3, zm = z((a + e) / 2);
    v.slab(M.plinth, xE - 0.1, 0, z(a), 0.05, 0.5, e - a); glaze(M.clereE, a, e, 0.5, yDeck - 0.6, [2.6]);
    if (j === 2 || j === 4) {                              // a closed double door in two of the bays
      xe.slab('metalWhite', xE - 0.09, 0, zm - 0.98, 0.09, 2.36, 0.08).slab('metalWhite', xE - 0.09, 0, zm + 0.9, 0.09, 2.36, 0.08).slab('metalWhite', xE - 0.09, 2.3, zm - 0.98, 0.09, 0.08, 1.96).slab('metalWhite', xE - 0.09, 0, zm - 0.03, 0.09, 2.3, 0.06).slab(M.dark, xE - 0.08, 0, zm - 0.9, 0.085, 0.24, 1.8);
      for (const s of [-1, 1]) rod(xe, M.steel, [xE + 0.06, 0.85, zm + s * 0.13], [xE + 0.06, 1.4, zm + s * 0.13], 0.014, 6);
    }
    for (const q of [0.3, 0.7]) for (const x of [xE + 3.2, xE + 8.6]) xe.cyl(M.lampX, x, yDeck - 0.325, z(a + (e - a) * q), 0.13, 0.025, 12);   // lights in the soffit of the gallery
  }
  // gallery level: what frame 10 shows between the columns, from north to south (g = glazing, b = tan panel; the rest stays white wall)
  const gSpans = [];
  for (const [t0, t1, kind] of [[2.5, 5.2, 'g'], [5.8, 9.3, 'b'], [9.3, 13.0, 'g'], [13.6, 20.8, 'g'], [21.4, 32.2, 'g'], [32.8, 35.4, 'g'], [35.4, 40.0, 'b'], [40.6, 45.0, 'g']]) {
    const a = t0 * f, e = t1 * f, y0 = yDeck + 0.15, yt = Math.min(y1E, 9.6 * k);
    const part = (p, q, yl) => { if (kind === 'b') v.slab(M.beige, xE - 0.1, yl, z(p), 0.06, y1E - yl, q - p); else { if (yt > yl) glaze(M.clereE, p, q, yl, yt, [6.9 * k]); glaze(M.teal, p, q, Math.max(yt, yl), y1E, []); } };
    for (const [p, q] of cut(a, e, dcut)) part(p, q, y0);
    for (const [p, q] of dcut) if (q > a && p < e) part(Math.max(a, p), Math.min(e, q), yDeck + 2.38);
    if (kind === 'g') gSpans.push([a, e]);
  }
  // the same wall from inside, above the walkway of the stand: a timber sill wall, then panes or acoustic boards
  { const upper = (p, q, yl, glazed) => { if (glazed) wall(vi, M.day, 'W', XI1, z(p), z(q), yl, y1E, [z(p) / 4, (yl - yDeck) / (y1E - yDeck), z(q) / 4, 1]); else wall(vi, M.acou, 'W', XI1, z(p), z(q), yl, y1E, [0, 0, Math.max(1, Math.round((q - p) / 1.2)) * 1.2, Math.max(1, Math.round((y1E - yl) / 0.8)) * 0.8]); };
    const stretch = (a, e, glazed) => {
      for (const [p, q] of cut(a, e, dcut)) { wall(vi, M.dado, 'W', XI1, z(p), z(q), yDeck, yDeck + 1.2, [z(p), 0, z(q), 1.2]); vi.slab(M.wood, XI1 - 0.035, yDeck + 1.15, z(p), 0.035, 0.1, q - p); upper(p, q, yDeck + 1.2, glazed); }
      for (const [p, q] of dcut) if (q > a && p < e) upper(Math.max(a, p), Math.min(e, q), yDeck + 2.4, glazed);
      if (glazed) { const n = Math.max(1, Math.round((e - a) / 1.95)); for (let i = 1; i < n; i++) vi.slab(M.alu, XI1 - 0.035, yDeck + 2.4, z(a + (e - a) * i / n) - 0.03, 0.035, y1E - yDeck - 2.4, 0.06); for (const y of [6.9 * k, 9.6 * k]) vi.slab(M.alu, XI1 - 0.035, y - 0.03, z(a), 0.035, 0.06, e - a); }
    };
    for (const [a, e] of gSpans) stretch(a, e, true);
    for (const [a, e] of cut(1.3, Lw - 1.3, gSpans)) stretch(a, e, false);
    wall(vi, M.wallP, 'W', XI1, z(1.3), z(Lw - 1.3), y1E, yBot(XI1));
    for (const t of [...G.slice(1, 7)]) vi.slab(M.wallP, XI1 - 0.14, yDeck, z(t) - 0.3, 0.14, yBot(XI1 - 0.14) - yDeck, 0.6, 'ED');
    lining('W', XI1, iz0, sz0 - 0.2, F, yDeck); lining('W', XI1, sz1 + 0.2, iz1, F, yDeck); }
  // the three doors: frames, leaves standing open onto the gallery, exit signs inside
  for (const q of gdoor) {
    v.slab('metalWhite', xE - 0.52, yDeck, q - 0.9, 0.5, 2.3, 0.06).slab('metalWhite', xE - 0.52, yDeck, q + 0.84, 0.5, 2.3, 0.06).slab('metalWhite', xE - 0.52, yDeck + 2.24, q - 0.9, 0.5, 0.06, 1.8);
    for (const s of [-1, 1]) { leaf(xe, xE - 0.08, q + s * 0.86, 0, 0.84, yDeck + 0.02, 2.2, M.doorglaze, M.steel, -s); c.slab('generic', xE - 0.08, yDeck, q + s * 0.86 - 0.03, 0.84, 2.2, 0.06); }
    vf.slab(M.black, XI1 - 0.07, yDeck + 2.45, q - 0.4, 0.07, 0.28, 0.8); wall(vf, M.exit, 'W', XI1 - 0.075, q - 0.38, q + 0.38, yDeck + 2.47, yDeck + 2.71, [0, 0, 1, 1]);
  }
  // gallery: slab, paving, solid parapet with a steel rail; walkable from the stand
  both('metalWhite', xE - 0.1, yDeck - 0.3, zN, xd - xE + 0.1, 0.3, Lw);
  v.slab(M.step, xE - 0.1, yDeck, zN + 0.15, xd - xE - 0.05, 0.02, Lw - 0.3, 'D');
  v.slab('wallWhite', xd - 0.15, yDeck, zN, 0.15, 1.1, Lw); c.slab('generic', xd - 0.15, yDeck, zN, 0.15, 1.8, Lw);
  for (const zc of [zN, zS - 0.15]) { v.slab('wallWhite', xE - 0.1, yDeck, zc, xd - xE + 0.1, 1.1, 0.15); c.slab('generic', xE - 0.1, yDeck, zc, xd - xE + 0.1, 1.8, 0.15); }   // parapet returns; the gallery is open at both ends (frame 21)
  rod(xe, M.steel, [xd - 0.075, yDeck + 1.2, zN + 0.1], [xd - 0.075, yDeck + 1.2, zS - 0.1], 0.028, 8);
  for (let zz = zN + 1; zz < zS; zz += 2) xe.slab(M.steel, xd - 0.09, yDeck + 1.1, zz, 0.03, 0.1, 0.03);
  for (const t of [0.45, ...G.slice(1, 7), Lw - 0.45]) {
    v.cyl('wallMaroon', xc, 0, z(t), 0.42, yDeck + 1.1, 16).cyl(M.silver, xc, yDeck + 1.1, z(t), 0.3, yBot(xc) - yDeck - 1.0, 16, false).cyl(M.plinth, xc, 0, z(t), 0.47, 0.3, 16);
    c.slab('generic', xc - 0.4, 0, z(t) - 0.4, 0.8, yDeck + 3, 0.8);
  }
  for (let j = 1; j < 7; j++) both('wallMaroon', (xE + xd) / 2 - 0.25, 0, z(G[j]) - 0.25, 0.5, yDeck - 0.3, 0.5);  // piers under the gallery
  for (const t of [G[1], G[3], G[4], G[6]]) { v.cyl(M.pipe, xE + 0.1, 0.05, z(t) + 0.42, 0.055, hE - 0.3, 10, false); for (let y = 1.2; y < hE - 1; y += 2.2) xe.slab(M.dark, xE + 0.03, y, z(t) + 0.35, 0.14, 0.03, 0.14); }   // rain pipes

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
    const roof = new THREE.Mesh(g, M.roof); roof.castShadow = roof.receiveShadow = true; roof.name = item.id + '-roof'; ctx.add(roof); ctx.collide(roof); }   // also a collider: a player leaving drone mode above the hall lands on the roof
  patch(v, M.soffit, 0, LX, 0, LZ, yBot, false, 3);
  const fb = x => yTop(x) - 0.6;                            // fascia, 0.6 m deep
  v.quad('metalWhite', [0, fb(0), 0], [0, fb(0), LZ], [0, yTop(0), LZ], [0, yTop(0), 0]);
  v.quad('metalWhite', [LX, fb(LX), LZ], [LX, fb(LX), 0], [LX, yTop(LX), 0], [LX, yTop(LX), LZ]);
  zface(v, 'metalWhite', 0, LX, 0, fb, yTop, false, 2); zface(v, 'metalWhite', 0, LX, LZ, fb, yTop, true, 2);
  v.slab(M.silver, -0.2, yTop(0) - 0.32, 0, 0.2, 0.2, LZ).slab(M.silver, LX, yTop(LX) - 0.32, 0, 0.2, 0.2, LZ);          // box gutters along the two eaves
  // three raised rooflight strips across the crown (satellite image)
  const lights = [-6.2, 0, 6.2].map(dz => LZ / 2 + dz * LZ / 59.1), lxa = LX * 0.47 - 13.3, lxb = LX * 0.47 + 13.3;
  for (const zc of lights) {
    const up = x => yTop(x) + 0.3;
    patch(v, M.monitor, lxa, lxb, zc - 0.65, zc + 0.65, up, true, 2);
    zface(v, M.monitor, lxa, lxb, zc - 0.65, yTop, up, false, 2); zface(v, M.monitor, lxa, lxb, zc + 0.65, yTop, up, true, 2);
    v.quad(M.monitor, [lxa, yTop(lxa), zc - 0.65], [lxa, yTop(lxa), zc + 0.65], [lxa, up(lxa), zc + 0.65], [lxa, up(lxa), zc - 0.65]);
    v.quad(M.monitor, [lxb, yTop(lxb), zc + 0.65], [lxb, yTop(lxb), zc - 0.65], [lxb, up(lxb), zc - 0.65], [lxb, up(lxb), zc + 0.65]);
  }
  // canopy strip along the east edge (data item gym-roof-east-edge-feature): white, with a glazed grid in its southern half
  { const feat = ((ctx.campus && ctx.campus.items) || []).find(i => i.id === 'gym-roof-east-edge-feature'), q = feat && feat.points ? bbox(feat.points) : null;
    const x0 = q ? Math.max(xE + 1, q.w - b.w) : LX - 4, x1 = q ? Math.max(LX + 0.3, q.e - b.w) : LX + 2, za = q ? Math.max(0.2, q.n - b.n) : LZ * 0.15, zb = q ? Math.min(LZ - 0.2, q.s - b.n) : LZ * 0.9, zm = (za + zb) / 2;
    const top = x => yTop(x) + 0.1, lw = x => yTop(x) - 0.12, sof = x => yBot(x) - 0.03, xs0 = xc + 0.45;      // top; underside beyond the roof edge; panels in the soffit
    patch(v, 'metalWhite', x0, x1, za, zm, top, true, 1.5); patch(v, M.skyTop, x0, x1, zm, zb, top, true, 1.5);
    patch(v, 'metalWhite', LX, x1, za, zm, lw, false, 1.5); patch(v, M.skyPanel, LX, x1, zm, zb, lw, false, 1.5); patch(v, M.skyPanel, xs0, LX - 0.05, zm, zb, sof, false, 1.5);
    v.quad('metalWhite', [x1, lw(x1), zb], [x1, lw(x1), za], [x1, top(x1), za], [x1, top(x1), zb]);
    for (const [zz, south] of [[za, false], [zb, true]]) { zface(v, 'metalWhite', x0, LX, zz, yTop, top, south, 1.5); zface(v, 'metalWhite', LX, x1, zz, lw, top, south, 1.5); }
    const nz = Math.max(2, Math.round((zb - zm) / 2.2));
    for (let i = 0; i <= nz; i++) { const zz = zm + (zb - zm) * i / nz;                                           // glazing bars, above and below
      patch(v, 'metalWhite', x0, x1, zz - 0.05, zz + 0.05, x => top(x) + 0.03, true, 1.5); patch(v, 'metalWhite', LX, x1, zz - 0.05, zz + 0.05, x => lw(x) - 0.03, false, 1.5); patch(v, 'metalWhite', xs0, LX - 0.05, zz - 0.05, zz + 0.05, x => sof(x) - 0.03, false, 1.5); }
    for (let i = 0; i <= 3; i++) { const xx = x0 + (x1 - x0) * i / 3, under = xx > LX ? lw : xx > xs0 ? sof : null;
      patch(v, 'metalWhite', xx - 0.05, xx + 0.05, zm, zb, x => top(x) + 0.03, true, 1); if (under) patch(v, 'metalWhite', xx - 0.05, xx + 0.05, zm, zb, x => under(x) - 0.03, false, 1); }
  }

  // ================= INTERIOR (imagined, see the header) =================
  vi.slab(M.floor, ix0, F - 0.05, iz0, ix1 - ix0, 0.05, iz1 - iz0, 'DEWSN'); c.slab('generic', ix0, 0, iz0, ix1 - ix0, F, iz1 - iz0);
  for (const t of wdoors) vf.slab(M.inox, ix0 - 0.03, F, z(t) - 0.6, 0.06, 0.006, 1.2);
  // casings round the parts of the columns that stand in the hall, pilasters of the east wall
  for (const t of colT) vi.slab(M.wallP, XI0, F, z(t) - 0.47, xW + 0.92 - XI0, yBot(xW + 0.9) - F, 0.94, 'WD');
  for (const south of [false, true]) for (let i = 1; i < nb; i++) vi.slab(M.wallP, colX(i) - 0.47, F, south ? zS - 0.92 : iz0, 0.94, yBot(colX(i)) - F, south ? iz1 - zS + 0.92 : zN + 0.92 - iz0, 'D');
  for (const [x, sx, zz, sz] of [[XI0, xW + 1.32 - XI0, iz0, zN + 1.32 - iz0], [XI0, xW + 1.32 - XI0, zS - 1.32, iz1 - zS + 1.32], [xE - 1.32, XI1 - xE + 1.32, iz0, zN + 1.32 - iz0], [xE - 1.32, XI1 - xE + 1.32, zS - 1.32, iz1 - zS + 1.32]]) vi.slab(M.wallP, x, F, zz, sx, yBot(x + sx / 2) - F, sz, 'D');
  // underside of the roof: profiled deck, three rooflights
  patch(vi, M.deck, ix0, ix1, iz0, iz1, x => yBot(x) - 0.04, false, 3);
  for (const zc of lights) {
    patch(vi, M.rooflight, lxa, lxb, zc - 0.55, zc + 0.55, x => yBot(x) - 0.07, false, 3);
    for (const s of [-1, 1]) patch(vi, M.alu, lxa, lxb, zc + s * 0.58 - 0.04, zc + s * 0.58 + 0.04, x => yBot(x) - 0.1, false, 3);
  }

  // ---- roof structure: arched trusses on the column lines and one in the wide middle bay, purlins, bracing ----
  const trussZ = [...colT.map(t => z(t)), z(Lw / 2)].sort((p, q) => p - q), NP = 20, px = j => ix0 + 0.35 + (ix1 - ix0 - 0.7) * j / NP;
  const yTC = x => yBot(x) - 0.42, yBC = x => yTC(x) - 1.25 - 1.35 * Math.sin(Math.PI * Math.max(0, Math.min(1, (x - ix0) / (ix1 - ix0))));
  for (const tz of trussZ) {
    for (let j = 0; j < NP; j++) {
      const xa = px(j), xb = px(j + 1);
      bar(vi, M.truss, [xa, yTC(xa), tz], [xb, yTC(xb), tz], 0.2); bar(vi, M.truss, [xa, yBC(xa), tz], [xb, yBC(xb), tz], 0.2);
      bar(vi, M.truss, j % 2 ? [xa, yTC(xa), tz] : [xa, yBC(xa), tz], j % 2 ? [xb, yBC(xb), tz] : [xb, yTC(xb), tz], 0.12);
      if (j && !low) bar(vi, M.truss, [xa, yBC(xa), tz], [xa, yTC(xa), tz], 0.09);
    }
    for (const xa of [px(0), px(NP)]) { bar(vi, M.truss, [xa, yBC(xa) - 0.1, tz], [xa, yTC(xa) + 0.1, tz], 0.2); vi.slab(M.truss, xa - 0.3, yBC(xa) - 0.32, tz - 0.22, 0.6, 0.22, 0.44); }
  }
  for (const xa of [px(0), px(NP)]) bar(vi, M.truss, [xa, yBC(xa) - 0.2, z(colT[2])], [xa, yBC(xa) - 0.2, z(colT[3])], 0.34);     // the middle truss stands on a beam between two columns
  for (let j = 0; j <= NP; j++) vi.slab(M.galv, px(j) - 0.05, yBot(px(j)) - 0.27, iz0, 0.1, 0.23, iz1 - iz0, 'UNS');             // purlins
  for (const [za, zb] of [[trussZ[0], trussZ[1]], [trussZ[5], trussZ[6]]]) for (let j = 0; j < NP; j += low ? 2 : 1) {            // wind bracing in the two end bays
    const xa = px(j), xb = px(j + (low ? 2 : 1)); bar(vi, M.galv, [xa, yTC(xa) + 0.05, za], [xb, yTC(xb) + 0.05, zb], 0.045); bar(vi, M.galv, [xa, yTC(xa) + 0.05, zb], [xb, yTC(xb) + 0.05, za], 0.045);
  }
  for (const j of [4, 10, 16]) {                                                                                                   // ties along the bottom chords and sway frames between the trusses
    const x = px(j); bar(vi, M.truss, [x, yBC(x), iz0], [x, yBC(x), iz1], 0.1);
    if (!low) for (let i = 0; i < trussZ.length - 1; i++) { bar(vi, M.galv, [x, yBC(x), trussZ[i]], [x, yTC(x), trussZ[i + 1]], 0.045); bar(vi, M.galv, [x, yTC(x), trussZ[i]], [x, yBC(x), trussZ[i + 1]], 0.045); }
  }
  // ---- high-bay lamps: eight rows of eight, each on a rod from the purlins ----
  const lampAt = [], rowsZ = [iz0, ...trussZ, iz1];
  for (let i = 0; i < 8; i++) for (let j = 0; j < rowsZ.length - 1; j++) { const x = ix0 + (ix1 - ix0) * (i + 0.5) / 8; lampAt.push([x, yBC(x) - 0.3, (rowsZ[j] + rowsZ[j + 1]) / 2]); }
  const lampY = lampAt.reduce((s, p) => s + p[1], 0) / lampAt.length;
  // ---- supply-air ducts under the trusses, fed from two units on the roof ----
  for (const dx of [MX - 12.2, bx0 + 0.5]) {
    const yd = yBC(dx) - 0.55, zr = z0 - 3.15, r = 0.38;
    rod(vi, M.galv, [dx, yd, iz0 + 3], [dx, yd, iz1 - 3], r, low ? 10 : 16, true);
    for (let zz = iz0 + 3.5; zz < iz1 - 3; zz += 3) rod(vi, M.galv, [dx, yd, zz - 0.03], [dx, yd, zz + 0.03], r + 0.018, low ? 10 : 16, true);        // joints
    for (let zz = iz0 + 4.2, i = 0; zz < iz1 - 3.5; zz += 2.4, i++) { const s = i % 2 ? 1 : -1; rod(vi, M.galv, [dx + s * r * 0.6, yd - r * 0.7, zz], [dx + s * r * 0.95, yd - r * 1.25, zz], 0.1, 10, true); }   // nozzles
    for (const tz of trussZ) for (const s of [-1, 1]) bar(vi, M.galv, [dx + s * (r + 0.03), yBC(dx), tz + 0.25], [dx + s * (r + 0.03), yd, tz + 0.25], 0.025);
    rod(vi, M.galv, [dx, yd, zr], [dx, yBot(dx) - 0.05, zr], r, low ? 10 : 16, false);
    v.slab(M.unit, dx - 1.1, yTop(dx) - 0.15, zr - 0.8, 2.2, 1.45, 1.6); v.slab(M.dark, dx - 0.8, yTop(dx) + 0.35, zr - 0.82, 1.6, 0.7, 0.02).slab(M.dark, dx - 0.8, yTop(dx) + 0.35, zr + 0.8, 1.6, 0.7, 0.02);
    c.slab('generic', dx - 1.1, yTop(dx) - 0.15, zr - 0.8, 2.2, 1.45, 1.6);
  }

  // ---- floor markings: geometry on the boards, one mesh per paint ----
  const MK = { white: strips(), dark: strips(), blue: strips(), green: strips(), stain: strips() }, yL = F + 0.006;
  const frameOf = (ox, oz, alongX) => (u, w) => (alongX ? [ox + u, oz + w] : [ox + w, oz + u]);                 // a court: u along its length, w across
  const seg = (S, Tm, u0, w0, u1, w1, lw = 0.05) => { const d = Math.hypot(u1 - u0, w1 - w0), eu = (u1 - u0) / d * lw / 2, ew = (w1 - w0) / d * lw / 2; ribbon([Tm(u0 - eu, w0 - ew), Tm(u1 + eu, w1 + ew)], lw, yL, S); };
  const rect = (S, Tm, u0, w0, u1, w1, lw) => { seg(S, Tm, u0, w0, u1, w0, lw); seg(S, Tm, u1, w0, u1, w1, lw); seg(S, Tm, u1, w1, u0, w1, lw); seg(S, Tm, u0, w1, u0, w0, lw); };
  const curve = (S, Tm, cu, cw, r, a0, a1, lw = 0.05, n = 40, y = yL) => ribbon(Array.from({ length: n + 1 }, (_, i) => { const a = a0 + (a1 - a0) * i / n; return Tm(cu + r * Math.cos(a), cw + r * Math.sin(a)); }), lw, y, S);
  const basketball = (S, Tm, fill) => {
    rect(S, Tm, -14, -7.5, 14, 7.5); seg(S, Tm, 0, -7.5, 0, 7.5); curve(S, Tm, 0, 0, 1.8, 0, TAU, 0.05, 56);
    for (const e of [-1, 1]) {
      const bl = e * 14, ft = e * (14 - 5.8), bc = e * (14 - 1.575), half = e > 0 ? Math.PI / 2 : -Math.PI / 2;      // base line, free-throw line, point under the ring
      seg(S, Tm, bl, -2.45, ft, -2.45); seg(S, Tm, ft, -2.45, ft, 2.45); seg(S, Tm, ft, 2.45, bl, 2.45);
      curve(S, Tm, ft, 0, 1.8, half, half + Math.PI, 0.05, 28); curve(S, Tm, bc, 0, 1.25, half, half + Math.PI, 0.05, 20);
      const a = Math.asin(6.6 / 6.75), reach = 6.75 * Math.cos(a), mid = e > 0 ? Math.PI : 0;                          // three-point line
      seg(S, Tm, bl, -6.6, bc - e * reach, -6.6); seg(S, Tm, bl, 6.6, bc - e * reach, 6.6); curve(S, Tm, bc, 0, 6.75, mid - a, mid + a, 0.05, 44);
      for (const s of [-1, 1]) { for (const d of [1.75, 2.6, 3.0, 3.85, 4.7]) seg(S, Tm, bl - e * d, s * 2.47, bl - e * d, s * 2.57); seg(S, Tm, e * 5.675, s * 7.52, e * 5.675, s * 7.67); }
      if (fill) fillQuad([Tm(bl, -2.45), Tm(ft, -2.45), Tm(ft, 2.45), Tm(bl, 2.45)], F + 0.003, fill);
    }
    if (fill) curve(fill, Tm, 0, 0, 0.9, 0, TAU, 1.8, 56, F + 0.003);
  };
  const volleyball = (S, Tm) => { rect(S, Tm, -9, -4.5, 9, 4.5); for (const u of [-3, 0, 3]) seg(S, Tm, u, -4.5, u, 4.5); };
  const badminton = (S, Tm) => {
    rect(S, Tm, -6.7, -3.05, 6.7, 3.05, 0.04);
    for (const s of [-1, 1]) { seg(S, Tm, -6.7, s * 2.59, 6.7, s * 2.59, 0.04); seg(S, Tm, s * 1.98, -3.05, s * 1.98, 3.05, 0.04); seg(S, Tm, s * 5.94, -3.05, s * 5.94, 3.05, 0.04); seg(S, Tm, s * 1.98, 0, s * 6.7, 0, 0.04); }
  };
  basketball(MK.white, frameOf(MX, z0, false), MK.stain); volleyball(MK.blue, frameOf(MX, z0, false));
  for (const u of [-10.95, -3.65, 3.65, 10.95]) badminton(MK.green, frameOf(MX, z0 + u, true));
  for (const cz of CZ) { basketball(MK.dark, frameOf(CX, cz, true), null); for (const u of [-7, 7]) badminton(MK.green, frameOf(CX + u, cz, false)); }
  volleyball(MK.blue, frameOf(CX, z0, true));
  for (const [x, zz] of [[CX, z0 - 5.5], [CX, z0 + 5.5], [MX - 5.5, z0], [MX + 5.5, z0]]) vf.cyl(M.brass, x, F, zz, 0.06, 0.004, 14);     // covers of the sockets for the volleyball posts

  // ---- the stand: concrete tiers, aisles with half steps and nosings, side walls, walkway on top ----
  for (let i = 0; i <= NT; i++) {
    const x = bx0 + i * TD, y = F + i * TH;
    vi.slab(M.conc, x, y, sz0, ix1 - x, TH, sz1 - sz0, 'DE'); c.slab('generic', x, y, sz0, ix1 - x, TH, sz1 - sz0);   // colliders stacked, not nested: many coincident faces would choke the collision octree
    for (const [a, e] of aisles) {
      vi.slab(M.conc, x - TD / 2, y, a, TD / 2, TH / 2, e - a, 'DE').slab(M.nose, x - TD / 2 - 0.004, y + TH / 2 - 0.035, a, 0.05, 0.04, e - a).slab(M.nose, x - 0.004, y + TH - 0.035, a, 0.05, 0.04, e - a);
      vi.slab(M.rubber, x - TD / 2 + 0.046, y + TH / 2, a + 0.03, TD / 2 - 0.046, 0.006, e - a - 0.06, 'D').slab(M.rubber, x + 0.046, y + TH, a + 0.03, (i < NT ? TD / 2 : 0.6) - 0.046, 0.006, e - a - 0.06, 'D');
    }
    if (i < NT) for (const [a, e] of cut(sz0, sz1, aisles)) c.slab('generic', x + 0.3, y + TH, a, TD - 0.3, 0.85, e - a);        // a row of seats stops the walker
  }
  vi.slab(M.rubber, xWalk + 0.6, yDeck, sz0, ix1 - xWalk - 0.6, 0.006, sz1 - sz0, 'D');                                         // walkway finish
  wall(vi, M.dado, 'W', bx0 - 0.012, sz0, sz1, F, F + TH, [sz0, 0, sz1, TH]);                                                   // timber face of the first riser
  for (const [zw0, out] of [[sz0 - 0.2, 'N'], [sz1, 'S']]) {                                                                      // side walls: up the line of the nosings plus a metre, a timber cap, a handrail inside
    const yA = F + 1.0, yB = yDeck + 1.1, zo = out === 'N' ? zw0 : zw0 + 0.2, zi = out === 'N' ? zw0 + 0.2 : zw0;
    for (const [zp, front] of [[zo, out], [zi, out === 'N' ? 'S' : 'N']]) {
      const l = front === 'S' ? bx0 : xWalk, r = front === 'S' ? xWalk : bx0, yl = front === 'S' ? yA : yB, yr = front === 'S' ? yB : yA;
      quadUV(vi, M.wallP, [[l, F, zp], [r, F, zp], [r, yr, zp], [l, yl, zp]], [[0, 0], [NT * TD, 0], [NT * TD, yr - F], [0, yl - F]]);
      wall(vi, M.wallP, front, zp, xWalk, ix1, F, yB);
    }
    vi.quad(M.wallP, [bx0, F, zo], [bx0, F, zi], [bx0, yA, zi], [bx0, yA, zo]); vi.quad(M.wallP, [bx0, yA, zi], [bx0, F, zi], [bx0, F, zo], [bx0, yA, zo]);
    bar(vi, M.wood, [bx0 - 0.03, yA + 0.02, zw0 + 0.1], [xWalk, yB + 0.02, zw0 + 0.1], 0.24); vi.slab(M.wood, xWalk, yB - 0.1, zw0 - 0.02, ix1 - xWalk, 0.24, 0.24);
    for (let i = 0; i <= NT; i++) c.slab('generic', bx0 + i * TD - (i ? 0 : 0.1), 0, zw0, i < NT ? TD + (i ? 0 : 0.1) : ix1 - xWalk, F + (i + 1) * TH + 1.8, 0.2);
    const zr = out === 'N' ? zi + 0.07 : zi - 0.07;
    rod(vi, M.inox, [bx0 - 0.4, F + 0.95, zr], [xWalk + 0.2, yDeck + 0.95, zr], 0.022, 8, true);
    for (let i = 0; i <= NT; i += 2) rod(vi, M.inox, [bx0 + i * TD, F + i * TH + 0.93 + 0.4 * TH / TD, zr], [bx0 + i * TD, F + i * TH + 0.93 + 0.4 * TH / TD, zi], 0.012, 6);
  }
  for (const [a, e] of cut(sz0, sz1, aisles)) {                                                                                   // guard rail between the walkway and the back row
    c.slab('generic', xWalk + 0.02, yDeck, a, 0.06, 1.8, e - a);
    rod(vi, M.inox, [xWalk + 0.05, yDeck + 1.0, a + 0.02], [xWalk + 0.05, yDeck + 1.0, e - 0.02], 0.022, 8, true); rod(vi, M.inox, [xWalk + 0.05, yDeck + 0.55, a + 0.02], [xWalk + 0.05, yDeck + 0.55, e - 0.02], 0.012, 6);
    const np = Math.round((e - a) / 1.5); for (let i = 0; i <= np; i++) rod(vi, M.inox, [xWalk + 0.05, yDeck, a + 0.03 + (e - a - 0.06) * i / np], [xWalk + 0.05, yDeck + 1.0, a + 0.03 + (e - a - 0.06) * i / np], 0.018, 6);
  }
  // store under the stand: a door in its north side wall, with a plate beside it
  { const xs0 = xWalk - 2.6, zp = sz0 - 0.2;
    vf.slab(M.alu, xs0 - 0.06, F, zp - 0.03, 1.72, 2.16, 0.03).slab(M.galv, xs0, F, zp - 0.045, 0.79, 2.1, 0.02).slab(M.galv, xs0 + 0.81, F, zp - 0.045, 0.79, 2.1, 0.02);
    for (const s of [-1, 1]) rod(vf, M.inox, [xs0 + 0.8 + s * 0.09, F + 0.95, zp - 0.075], [xs0 + 0.8 + s * 0.09, F + 1.25, zp - 0.075], 0.012, 6, true);
    wall(vf, M.storeSign, 'N', zp - 0.012, xs0 - 0.75, xs0 - 0.25, F + 1.5, F + 1.69, [0, 0, 1, 1]); }

  // ---- baskets hung from the roof: glass board with its markings and a padded lower edge, ring, net, a mast with a back brace ----
  const beams = new Map();                                   // x -> [z from, z to]: beams between the trusses that the masts hang from
  const hang = (x, zz) => { const key = x.toFixed(2), za = Math.max(iz0, ...trussZ.filter(t => t <= zz)), zb = Math.min(iz1, ...trussZ.filter(t => t >= zz)), s = beams.get(key); beams.set(key, s ? [Math.min(s[0], za), Math.max(s[1], zb)] : [za, zb]); return yBC(x) - 0.2; };
  const rings = [];
  const basket = (bx, bz, dx, dz, clock) => {               // (bx, bz): middle of the board on plan; (dx, dz): unit vector from the board into the court
    const yb = F + 2.9, yr = F + 3.05, P = (s, n, y) => [bx + dx * n - dz * s, y, bz + dz * n + dx * s];         // s: sideways, n: out from the face of the board
    quadUV(vi, M.board, [P(-0.9, 0, yb), P(0.9, 0, yb), P(0.9, 0, yb + 1.05), P(-0.9, 0, yb + 1.05)], [[0, 0], [1, 0], [1, 1], [0, 1]]);
    bar(vi, M.alu, P(-0.93, -0.03, yb + 1.06), P(0.93, -0.03, yb + 1.06), 0.05); bar(vi, M.alu, P(-0.93, -0.03, yb - 0.01), P(0.93, -0.03, yb - 0.01), 0.05);
    for (const s of [-1, 1]) { bar(vi, M.alu, P(s * 0.92, -0.03, yb), P(s * 0.92, -0.03, yb + 1.05), 0.05); bar(vi, M.pad, P(s * 0.92, 0, yb - 0.02), P(s * 0.92, 0, yb + 0.36), 0.085); }
    bar(vi, M.pad, P(-0.96, 0, yb - 0.02), P(0.96, 0, yb - 0.02), 0.085);
    const rc = P(0, 0.375, yr); ring(vi, M.rim, rc[0], rc[1], rc[2], 0.225, 0.011); rings.push(rc);
    bar(vi, M.rim, P(0, 0.01, yr - 0.03), P(0, 0.16, yr - 0.03), 0.1); for (const s of [-1, 1]) bar(vi, M.rim, P(s * 0.05, 0.02, yr - 0.12), P(s * 0.12, 0.3, yr - 0.01), 0.018);
    if (clock) { bar(vi, M.black, P(-0.33, -0.12, yb + 1.36), P(0.33, -0.12, yb + 1.36), 0.42); bar(vi, M.alu, P(0, -0.12, yb + 1.06), P(0, -0.12, yb + 1.2), 0.06); }
    const mast = P(0, -0.3, 0), yM = hang(dx ? mast[0] : mast[0] - 0.3, mast[2]); if (!dx) hang(mast[0] + 0.3, mast[2]);
    const reach = 0.5 * (yM - yb - 1.6), back = P(0, -0.3 - reach, 0), yK = hang(dx ? back[0] : back[0] - 0.3, back[2]); if (!dx) hang(back[0] + 0.3, back[2]);
    for (const s of [-1, 1]) {
      bar(vi, M.truss, P(s * 0.3, -0.3, yb + 0.2), P(s * 0.3, -0.3, yM), 0.09); bar(vi, M.truss, P(s * 0.3, -0.3, yb + 1.6), P(s * 0.3, -0.3 - reach, yK), 0.07);
      for (const y of [yb + 0.25, yb + 0.9]) bar(vi, M.truss, P(s * 0.3, -0.3, y), P(s * 0.3, -0.04, y), 0.06);
    }
    for (let y = yb + 0.25; y < yM - 0.3; y += 1.3) bar(vi, M.truss, P(-0.3, -0.3, y), P(0.3, -0.3, y), 0.05);
    // net: a narrowing sleeve of cord
    const n = 12; for (let i = 0; i < n; i++) { const a0 = i / n * TAU, a1 = (i + 1) / n * TAU, q = (a, r, y) => [rc[0] + Math.cos(a) * r, y, rc[2] + Math.sin(a) * r];
      quadUV(vf, M.net, [q(a0, 0.14, yr - 0.43), q(a1, 0.14, yr - 0.43), q(a1, 0.222, yr - 0.01), q(a0, 0.222, yr - 0.01)], [[i * 0.5, 0], [i * 0.5 + 0.5, 0], [i * 0.5 + 0.5, 2.5], [i * 0.5, 2.5]]); }
  };
  basket(MX, z0 - 12.8, 0, 1, true); basket(MX, z0 + 12.8, 0, -1, true);
  for (const cz of CZ) { basket(CX - 12.8, cz, 1, 0, false); basket(CX + 12.8, cz, -1, 0, false); }
  for (const [key, [za, zb]] of beams) { const x = +key; bar(vi, M.truss, [x, yBC(x) - 0.12, za], [x, yBC(x) - 0.12, zb], 0.16); }

  // ---- scoreboard on the east wall, loudspeakers under the trusses ----
  vi.slab(M.black, ix1 - 0.75, 7.75, z0 - 3.0, 0.32, 2.5, 6.0); wall(vi, M.scoreboard, 'W', ix1 - 0.755, z0 - 2.9, z0 + 2.9, 7.85, 10.15, [0, 0, 1, 1]);
  for (const s of [-1, 1]) { vi.slab(M.alu, ix1 - 0.44, 8.2, z0 + s * 2.2 - 0.04, 0.41, 0.08, 0.08).slab(M.alu, ix1 - 0.44, 9.8, z0 + s * 2.2 - 0.04, 0.41, 0.08, 0.08); }
  for (const tz of [trussZ[1], trussZ[5]]) for (const x of [CX + 2, MX - 3]) {
    const y = yBC(x) - 0.75, s = tz < z0 ? 1 : -1;
    obox(vi, M.black, x, y, tz + s * 0.3, 0.55, 0.85, 0.5, 0, s * 0.42); obox(vf, M.alu, x, y, tz + s * 0.3 + s * 0.2, 0.47, 0.76, 0.14, 0, s * 0.42);
    for (const e of [-1, 1]) bar(vi, M.galv, [x + e * 0.2, yBC(x), tz], [x + e * 0.2, y + 0.38, tz + s * 0.2], 0.025);
  }

  // ---- scorer's table and team benches between the main court and the stand ----
  { const tx = MX + 9.1;                                     // front of the table
    vi.slab(M.cloth, tx, F, z0 - 1.9, 0.75, 0.74, 3.8).slab(M.wood, tx - 0.03, F + 0.74, z0 - 1.93, 0.81, 0.03, 3.86);
    vf.slab(M.black, tx + 0.15, F + 0.77, z0 - 0.35, 0.4, 0.24, 0.7).slab(M.black, tx + 0.2, F + 0.77, z0 + 0.9, 0.3, 0.04, 0.45).slab(M.red2, tx + 0.22, F + 0.77, z0 - 1.4, 0.12, 0.16, 0.26);
    for (const dz of [-1.2, 0, 1.2]) { const cx0 = tx + 0.95, zc = z0 + dz;                                                    // chairs
      vf.slab(M.pad, cx0, F + 0.42, zc - 0.22, 0.42, 0.045, 0.44).slab(M.pad, cx0 + 0.4, F + 0.5, zc - 0.22, 0.04, 0.38, 0.44);
      for (const [ax, az] of [[0.02, -0.2], [0.02, 0.17], [0.38, -0.2], [0.38, 0.17]]) vf.slab(M.inox, cx0 + ax, F, zc + az, 0.03, ax > 0.2 ? 0.88 : 0.42, 0.03); }
    c.slab('generic', tx, F, z0 - 1.9, 1.4, 1.0, 3.8);
    for (const [za, zb] of [[z0 - 9.4, z0 - 3.2], [z0 + 3.2, z0 + 9.4]]) {                                                       // benches: timber on steel frames, backs toward the stand
      for (const dx of [0.24, 0.42]) vi.slab(M.wood, tx + dx, F + 0.42, za, 0.16, 0.04, zb - za);
      for (const dy of [0.66, 0.84]) obox(vi, M.wood, tx + 0.66, F + dy, (za + zb) / 2, 0.035, 0.15, zb - za);
      for (let zz = za + 0.25; zz < zb; zz += (zb - za - 0.5) / 4) { vf.slab(M.inox, tx + 0.26, F, zz - 0.02, 0.04, 0.42, 0.04).slab(M.inox, tx + 0.62, F, zz - 0.02, 0.04, 0.95, 0.04).slab(M.inox, tx + 0.26, F + 0.38, zz - 0.02, 0.4, 0.04, 0.04); }
      c.slab('generic', tx + 0.2, F, za, 0.52, 1.0, zb - za);
    }
  }
  // ---- ball trolleys (the balls are instanced below), posts and net of the volleyball court stored at the south wall ----
  const balls = [], vballs = [], rb = rng(5150);
  const trolley = (x, zz, list, r) => {
    for (const [ax, az] of [[-0.45, -0.3], [0.45, -0.3], [0.45, 0.3], [-0.45, 0.3]]) { rod(vf, M.inox, [x + ax, F + 0.1, zz + az], [x + ax, F + 0.92, zz + az], 0.014, 6); vf.cyl(M.black, x + ax, F, zz + az, 0.04, 0.1, 8); }
    for (const y of [0.3, 0.92]) { rod(vf, M.inox, [x - 0.45, F + y, zz - 0.3], [x + 0.45, F + y, zz - 0.3], 0.012, 6); rod(vf, M.inox, [x - 0.45, F + y, zz + 0.3], [x + 0.45, F + y, zz + 0.3], 0.012, 6); rod(vf, M.inox, [x - 0.45, F + y, zz - 0.3], [x - 0.45, F + y, zz + 0.3], 0.012, 6); rod(vf, M.inox, [x + 0.45, F + y, zz - 0.3], [x + 0.45, F + y, zz + 0.3], 0.012, 6); }
    for (let i = 1; i < 6; i++) rod(vf, M.inox, [x - 0.45 + i * 0.15, F + 0.3, zz - 0.3], [x - 0.45 + i * 0.15, F + 0.3, zz + 0.3], 0.006, 5);
    for (let ly = 0; ly < 3; ly++) for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) if (ly < 2 || rb() < 0.6) list.push([x - 0.28 + i * 0.28 + (rb() - 0.5) * 0.04, F + 0.31 + r + ly * r * 1.75, zz - 0.14 + j * 0.28 + (rb() - 0.5) * 0.04, r]);
    c.slab('generic', x - 0.47, F, zz - 0.32, 0.94, 1.0, 0.64);
  };
  trolley(MX - 9.3, z0 - 4.6, balls, 0.122); trolley(CX + 10.3, z0 + 5.4, vballs, 0.105);
  balls.push([MX - 5.2, F + 0.122, z0 + 2.4, 0.122], [MX - 10.6, F + 0.122, z0 - 6.1, 0.122]); vballs.push([CX + 6.5, F + 0.105, z0 + 3.1, 0.105]);
  { const zp = iz1 - 0.55, x0 = CX - 6;                       // rack with the two posts, the rolled net on a stand, the referee's stand
    vf.slab(M.inox, x0 - 0.3, F, zp - 0.2, 1.3, 0.05, 0.4); c.slab('generic', x0 - 0.3, F, zp - 0.25, 3.6, 1.6, 0.5);
    for (const dx of [0, 0.7]) { vf.cyl(M.inox, x0 + dx, F + 0.05, zp, 0.045, 2.5, 10).cyl(M.pad, x0 + dx, F + 0.05, zp, 0.075, 1.75, 10, false); vf.slab(M.black, x0 + dx - 0.03, F + 2.25, zp - 0.09, 0.06, 0.12, 0.06); }
    rod(vf, M.wallP, [x0 + 1.5, F + 0.75, zp], [x0 + 3.0, F + 0.75, zp], 0.13, 12, true); rod(vf, M.black, [x0 + 1.52, F + 0.75, zp], [x0 + 2.98, F + 0.75, zp], 0.134, 12, false);
    for (const dx of [1.6, 2.9]) { vf.slab(M.inox, x0 + dx - 0.02, F, zp - 0.02, 0.04, 0.62, 0.04).slab(M.inox, x0 + dx - 0.2, F, zp - 0.02, 0.4, 0.03, 0.04); }
  }
  // ---- wall bars on the north wall, hose cabinets, a switch cabinet ----
  { const zb0 = zN + 0.92, x0 = CX - 3;
    for (let i = 0; i <= 5; i++) vf.slab(M.wood, x0 + i * 0.95 - 0.02, F + 0.1, ZI0, 0.04, 2.55, zb0 - ZI0 + 0.1);
    for (let i = 0; i < 5; i++) for (let j = 0; j < 13; j++) rod(vf, M.wood, [x0 + i * 0.95, F + 0.28 + j * 0.18, zb0 + (j === 12 ? 0.06 : 0)], [x0 + (i + 1) * 0.95, F + 0.28 + j * 0.18, zb0 + (j === 12 ? 0.06 : 0)], 0.018, 6);
    c.slab('generic', x0, F, zb0, 4.75, 2.7, 0.14); }
  const cabinet = (dir, p, a) => {                           // red hose cabinet standing 0.18 m out of a wall lining
    const out = dir === 'E' || dir === 'S' ? 1 : -1, q = out > 0 ? p : p - 0.18, ew = dir === 'E' || dir === 'W';
    if (ew) vf.slab(M.red2, q, F + 0.7, a - 0.35, 0.18, 0.95, 0.7); else vf.slab(M.red2, a - 0.35, F + 0.7, q, 0.7, 0.95, 0.18);
    wall(vf, M.hoseSign, dir, p + out * 0.184, a - 0.25, a + 0.25, F + 1.38, F + 1.57, [0, 0, 1, 1]); wall(vf, M.doorglaze, dir, p + out * 0.183, a - 0.27, a + 0.27, F + 0.78, F + 1.32);
  };
  cabinet('E', XI0, z(panels[1][0]) + 2.2); cabinet('E', XI0, z(panels[1][1]) - 2.2); cabinet('S', ZI0, MX - 9); cabinet('N', ZI1, MX - 9);
  vf.slab(M.galv, CX + 6, F + 1.1, ZI0, 0.8, 1.1, 0.16);

  // ================= PLANTING, LAMPS, SMALL PARTS OUTSIDE =================
  const garden = new THREE.Group(); garden.position.set(b.w, 0, b.n); garden.name = item.id + '-garden';
  const bushes = [], blooms = [], rg = rng(8808);
  const bed = (x0, za, x1, zb, front, hedge = true) => {     // a raised bed: granite kerb, soil, a clipped hedge along the back, ball shrubs, flowers along the front (front: 'W', 'N' or 'S')
    for (const [x, zz, sx, sz] of [[x0, za, x1 - x0, 0.14], [x0, zb - 0.14, x1 - x0, 0.14], [x0, za + 0.14, 0.14, zb - za - 0.28], [x1 - 0.14, za + 0.14, 0.14, zb - za - 0.28]]) v.slab(M.kerb, x, 0.04, zz, sx, 0.24, sz);
    v.slab(M.soil, x0 + 0.14, 0.04, za + 0.14, x1 - x0 - 0.28, 0.17, zb - za - 0.28);
    c.slab('generic', x0, 0, za, x1 - x0, 1.6, zb - za);
    const alongX = front !== 'W', len = alongX ? x1 - x0 : zb - za, deep = alongX ? zb - za : x1 - x0, hw2 = Math.min(0.6, deep * 0.4);
    if (hedge) { if (front === 'W') v.slab(M.hedge, x1 - 0.2 - hw2, 0.2, za + 0.25, hw2, 0.75, len - 0.5); else if (front === 'S') v.slab(M.hedge, x0 + 0.25, 0.2, za + 0.2, len - 0.5, 0.75, hw2); else v.slab(M.hedge, x0 + 0.25, 0.2, zb - 0.2 - hw2, len - 0.5, 0.75, hw2); }
    const mid = d => (front === 'W' ? x0 + deep * d : front === 'S' ? zb - deep * d : za + deep * d);         // a line at the share d of the depth from the front
    for (let q = 1.2; q < len - 0.8; q += 2.3) bushes.push(alongX ? [x0 + q, mid(0.5), 0.42 + 0.12 * rg()] : [mid(0.5), za + q, 0.42 + 0.12 * rg()]);
    for (let i = 0; i < len * (low ? 6 : 14); i++) { const along = 0.3 + (len - 0.6) * rg(), across = mid(0.2) + (rg() - 0.5) * 0.3; blooms.push(alongX ? [x0 + along, across] : [across, za + along]); }
  };
  bed(2.3, zN + 0.3, xW - 0.2, z(tP0) - 0.4, 'W'); bed(2.3, z(tP1) + 0.4, xW - 0.2, zS - 0.3, 'W');                               // west face, either side of the platform
  { const xa = sdoors[0] || colX(1) + pitch / 2, xb = sdoors[1] || colX(5) + pitch / 2;                                          // south face, between the stoops
    bed(colX(0) + 0.9, zS, xa - 2.0, zS + 1.5, 'S', false); bed(xa + 3.4, zS, xb - 2.0, zS + 1.5, 'S', false); bed(xb + 3.4, zS, colX(7) - 0.9, zS + 1.5, 'S', false); }
  bed(xW + 1.6, 0.25, colX(3) - 1.0, zN - 0.05, 'N', false);                                                                      // north face, west of the white wall section
  const shrubMesh = shrubs(bushes, { seed: 21 }); shrubMesh.position.y = 0.2; garden.add(shrubMesh);
  const flowerGroup = flowers(blooms, [0xd8262b, 0xf2b61f, 0xffffff, 0xe84a3a], { seed: 22, y: 0.2, size: 0.3 });
  // wall lights on the north and south faces and bollard lights by the south beds
  for (const south of [false, true]) for (const i of [1, 3, 5]) { const zf = south ? zS : zN - 0.14; v.slab(M.dark, colX(i) - 0.12, 3.2, zf, 0.24, 0.3, 0.14).slab(M.lampX, colX(i) - 0.09, 3.17, zf + 0.02, 0.18, 0.03, 0.1); LIT.push([b.w + colX(i), b.n + (south ? zS + 1.6 : zN - 1.4), 4.5]); }
  // pools of light on the ground after dusk (drawn by the page): under the floodlights of the west face, the canopies of the south doors, the lights in the soffit of the gallery
  for (const t of colT) LIT.push([b.w - 2.2, b.n + z(t), 7]);
  for (const xd of sdoors) LIT.push([b.w + xd, b.n + zS + 3.0, 4]);
  for (let j = 0; j < 7; j++) LIT.push([b.w + xE + 5.9, b.n + z((G[j] + G[j + 1]) / 2), 6.5]);
  // benches under the gallery, litter bins by the doors of the east and south faces (shared street furniture, world coordinates)
  for (const j of [1, 3, 5]) bench(xe, c, b.w + xE + 0.75, b.n + z((G[j] + G[j + 1]) / 2), Math.PI / 2);
  bins(xe, c, b.w + xE + 0.55, b.n + z(G[3]) + 1.5, Math.PI / 2); for (const xd of sdoors) bins(xs, c, b.w + xd + 2.4, b.n + zS + 0.45, 0);
  xe.frame(b.w, b.n); xs.frame(b.w, b.n); c.frame(b.w, b.n);

  // ================= ASSEMBLY, DETAIL TIERS AND COLLISION =================
  const HC = [b.w + (ix0 + ix1) / 2, b.n + izc];             // middle of the hall, world
  const vis = ctx.add(v.build({ name: item.id + '-visual' })); vis.traverse(o => { if (o.isMesh && o.material.transparent) o.renderOrder = 1; });
  ctx.detail(ctx.add(garden), b.cx, b.cz, 150); flowerGroup.position.set(b.w, 0, b.n); flowerGroup.name = item.id + '-flowers'; ctx.detail(ctx.add(flowerGroup), b.cx, b.cz, 110);
  const noShadow = g => { g.traverse(o => { if (o.isMesh) { o.castShadow = false; if (o.material.transparent) o.renderOrder = 2; } }); return g; };
  const tierI = ctx.add(noShadow(vi.build({ name: item.id + '-interior' }))), tierF = ctx.add(noShadow(vf.build({ name: item.id + '-interior-fine' })));
  const inner = new THREE.Group(); inner.position.set(b.w, 0, b.n); inner.name = item.id + '-interior-meshes'; ctx.add(inner);
  const innerFine = new THREE.Group(); innerFine.position.set(b.w, 0, b.n); innerFine.name = item.id + '-interior-fine-meshes'; ctx.add(innerFine);
  // The interior is drawn only where it can be seen: inside the hall, or within NEAR metres of its walls (through the doors
  // and the glazing); the fine tier also only within 52 m of the middle of the hall. It used to be drawn from 100 m round the
  // middle, which took in most of the running track (about 70,000 triangles that no one could see through the walls).
  const NEAR = 30, hx0 = b.w + ix0, hx1 = b.w + ix1, hz0 = b.n + iz0, hz1 = b.n + iz1;
  const showInside = (x, y, zz) => { const dx = Math.max(hx0 - x, 0, x - hx1), dz = Math.max(hz0 - zz, 0, zz - hz1); const d = Math.hypot(dx, dz); return [d < NEAR && y < H + 40, d < NEAR && y < H + 40 && Math.hypot(x - HC[0], zz - HC[1]) < 52]; };
  if (ctx.animate) {
    for (const o of [tierI, inner, tierF, innerFine]) o.visible = false;
    let last = -1;
    ctx.animate((dt, t, env) => {
      const cam = env && env.camera; if (!cam || st.busy) return;
      if (++last % 10) return;                                     // ten frames are fine for this (the page's own detail check runs every 15)
      const p = cam.matrixWorld.elements, [a, f] = showInside(p[12], p[13], p[14]);
      tierI.visible = inner.visible = a; tierF.visible = innerFine.visible = f;
    });
  } else { ctx.detail(tierI, HC[0], HC[1], 100); ctx.detail(inner, HC[0], HC[1], 100); ctx.detail(tierF, HC[0], HC[1], 52); ctx.detail(innerFine, HC[0], HC[1], 52); }
  ctx.detail(ctx.add(xw.build({ name: item.id + '-west-fine' })), b.w + xW, b.cz, 70);
  ctx.detail(ctx.add(xe.build({ name: item.id + '-east-fine' })), b.w + xE + 6, b.cz, 75);
  ctx.detail(ctx.add(xs.build({ name: item.id + '-south-fine' })), b.cx, b.n + zS, 60);
  const mx = new THREE.Matrix4(), q4 = new THREE.Quaternion(), v3 = new THREE.Vector3(), s3 = new THREE.Vector3();
  const instances = (geo, material, list, set, parent, name) => { const m = new THREE.InstancedMesh(geo, material, list.length); list.forEach((p, i) => set(p, i, m)); m.name = name; m.castShadow = false; m.receiveShadow = true; m.instanceMatrix.needsUpdate = true; parent.add(m); return m; };
  // markings
  for (const [S, m, order] of [[MK.stain, M.stain, 2], [MK.white, M.lineW, 3], [MK.dark, M.lineK, 3], [MK.blue, M.lineB, 4], [MK.green, M.lineG, 5]]) {
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(S.pos, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(S.nor, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(S.uv, 2)); g.setIndex(S.idx);
    const mesh = new THREE.Mesh(g, m); mesh.renderOrder = order; mesh.receiveShadow = true; mesh.name = 'court-' + m.name; inner.add(mesh);
  }
  // seats: one instanced mesh, rows a little lighter toward the top
  { const list = [], colr = new THREE.Color(), rs = rng(4242);
    for (let i = 0; i < NT; i++) for (const [a, e] of cut(sz0, sz1, aisles)) { const n = Math.floor((e - a - 0.1) / 0.5), o = (e - a - n * 0.5) / 2; for (let j = 0; j < n; j += low ? 2 : 1) list.push([bx0 + i * TD + 0.56, F + (i + 1) * TH, a + o + (j + 0.5) * 0.5, i]); }
    const geo = seatGeometry(low);
    instances(geo, M.seat, list, (p, i, m) => { m.setMatrixAt(i, mx.makeTranslation(p[0], p[1], p[2])); const t = p[3] / (NT - 1), kk = 0.94 + 0.12 * rs(); m.setColorAt(i, colr.setRGB((0.035 + 0.02 * t) * kk, (0.12 + 0.06 * t) * kk, (0.4 + 0.12 * t) * kk)); }, inner, 'seats');
  }
  // lamps: housing, lens and rod
  { const prof = [[0.05, 0.4], [0.075, 0.33], [0.1, 0.24], [0.21, 0.16], [0.25, 0.02], [0.25, 0]].map(([r, y]) => new THREE.Vector2(r, y)), body = new THREE.LatheGeometry(prof, low ? 8 : 14), lens = new THREE.CircleGeometry(0.235, low ? 8 : 14); lens.rotateX(Math.PI / 2);
    instances(body, M.lampBody, lampAt, (p, i, m) => m.setMatrixAt(i, mx.makeTranslation(p[0], p[1], p[2])), inner, 'highbay-bodies');
    instances(lens, M.lens, lampAt, (p, i, m) => m.setMatrixAt(i, mx.makeTranslation(p[0], p[1] + 0.012, p[2])), inner, 'highbay-lenses');
    instances(new THREE.CylinderGeometry(0.012, 0.012, 1, 5), M.galv, lampAt, (p, i, m) => { const top = yBot(p[0]) - 0.27; m.setMatrixAt(i, mx.compose(v3.set(p[0], (top + p[1] + 0.4) / 2, p[2]), q4.identity(), s3.set(1, top - p[1] - 0.4, 1))); }, inner, 'highbay-rods');
  }
  // balls
  { const geo = new THREE.SphereGeometry(1, low ? 10 : 16, low ? 8 : 12), eul = new THREE.Euler(), place = (p, i, m) => m.setMatrixAt(i, mx.compose(v3.set(p[0], p[1], p[2]), q4.setFromEuler(eul.set(rb() * 6, rb() * 6, rb() * 6)), s3.setScalar(p[3])));
    instances(geo, M.ball, balls, place, innerFine, 'basketballs'); instances(geo, M.vball, vballs, place, innerFine, 'volleyballs'); }
  // fixings of the cassette panels
  { const geo = new THREE.CircleGeometry(0.014, 6); geo.rotateY(-Math.PI / 2); const holder = new THREE.Group(); holder.position.set(b.w, 0, b.n); holder.name = item.id + '-fixings';
    instances(geo, M.fixing, fixings, (p, i, m) => m.setMatrixAt(i, mx.makeTranslation(p[0], p[1], p[2])), holder, 'fixings'); ctx.add(holder); ctx.detail(holder, b.w + xW, b.cz, 34); }

  const cg = ctx.add(c.build({ name: item.id + '-colliders' })); cg.visible = false;
  // inclined plates (collision only) over the platform steps and the aisles of the stand
  ctx.add(ramps);
  ramp(-0.15, 0, 0.9, F, z(tP0) + cube, z(tP1) - cube);
  for (const [a, e] of aisles) ramp(bx0 - TD, F, xWalk, yDeck, a, e);
  cg.traverse(o => { if (o.isMesh) ctx.collide(o); });
  ramps.children.forEach(m => ctx.collide(m));

  // ================= LIGHT =================
  // Emissive parts follow the daylight: panes and rooflights glow by day, the high-bay lamps come on at dusk. The hall is
  // captured into a cube map from its middle whenever the light has changed by about an hour, twice in a row: the first
  // capture holds the lamps, the panes and what the direct lights reach, the second one also what those light up.
  const st = { day: -1, capDay: -1, hours: null, sun: new THREE.Vector3(), at: -1e9, target: null, busy: false, queued: false, hemi: null, scene: null };
  const eye = new THREE.Vector3(b.w + (ix0 + bx0) / 2, F + 3.2, b.n + z0), dir = new THREE.Vector3();
  HALLBOX.min.value.set(b.w + ix0, F - 0.5, b.n + iz0); HALLBOX.max.value.set(b.w + ix1, lampY, b.n + iz1); HALLBOX.eye.value.copy(eye);
  const canProbe = !safe && !low; let pmrem = null;
  const TUNE = { gainDay: 1.5, gainNight: 0.6 };              // strength of the captured light on the interior, by day and after dark (the exposure is much higher at night)
  const capture = (renderer, scene) => {
    const env = scene.environment, mine = vis.parent, root = mine && mine.parent; if (!env || !root) return;
    st.busy = true;
    const hidden = [], shown = [], lamp = scene.children.find(o => o.isPointLight && o.name === 'indoor-lamp'), keep = lamp && [lamp.intensity, lamp.distance, lamp.position.clone()];
    const auto = renderer.shadowMap.autoUpdate, was = st.target;
    try {
      for (const o of root.children) if (o !== mine && o.visible) { o.visible = false; hidden.push(o); }
      for (const o of [tierI, tierF, inner, innerFine]) if (!o.visible) { o.visible = true; shown.push(o); }
      // the lamp the lighting module hangs in the middle of the hall while the viewer is inside: as it will be then
      if (lamp) { lamp.position.set(b.cx, H * 0.6, b.cz); lamp.distance = Math.hypot(LX, LZ) * 0.8; lamp.intensity = 5.5 * (1.1 + 4.4 * (1 - st.day)); lamp.updateMatrixWorld(); }
      renderer.shadowMap.autoUpdate = false;
      if (!pmrem) pmrem = new THREE.PMREMGenerator(renderer);
      for (const m of M.hall) { m.envMap = env; m.envMapIntensity = 0; } HALLBOX.on.value = 0;
      const first = pmrem.fromScene(scene, 0, 0.2, 400, { size: 256, position: eye });
      const gain = TUNE.gainNight + (TUNE.gainDay - TUNE.gainNight) * st.day;
      for (const m of M.hall) { m.envMap = first.texture; m.envMapIntensity = gain * m.userData.gain; } HALLBOX.on.value = 1;
      const second = pmrem.fromScene(scene, 0, 0.2, 400, { size: 256, position: eye });
      for (const m of M.hall) m.envMap = second.texture;
      first.dispose(); if (was) was.dispose(); st.target = second;
    } catch (err) {
      console.error('gymnasium: capturing the hall failed', err);
      for (const m of M.hall) { m.envMap = was ? was.texture : null; } if (!was) HALLBOX.on.value = 0;
    } finally {
      for (const o of hidden) o.visible = true; for (const o of shown) o.visible = false;
      if (lamp) { lamp.intensity = keep[0]; lamp.distance = keep[1]; lamp.position.copy(keep[2]); lamp.updateMatrixWorld(); }
      renderer.shadowMap.autoUpdate = auto; st.busy = false;
    }
  };
  // once a frame: emissive strengths; decide whether the hall has to be captured again
  const frame = (renderer, scene, camera, lighting, now) => {
    if (st.busy) return false;
    if (st.scene !== scene) { st.scene = scene; st.hemi = scene.children.find(o => o.isHemisphereLight) || null; }
    const day = st.hemi ? Math.min(1, Math.max(0.04, st.hemi.intensity)) : 1;
    if (day !== st.day) { st.day = day; HALLBOX.spec.value = 0.1 + 0.35 * day; HALLBOX.diff.value = 0.42 + 0.58 * day; const t = Math.min(1, Math.max(0, (day - 0.3) / 0.5)), on = 1 - t * t * (3 - 2 * t); for (const m of M.dyn) m.emissiveIntensity = m.userData.glow * day + m.userData.night * (m.userData.lamp ? on : 1 - day); }
    if (!canProbe || !scene.environment || now - st.at < 600) return false;
    const e = camera.matrixWorld.elements; if (Math.hypot(e[12] - HC[0], e[14] - HC[1]) > 75) return false;                      // only for a viewer in or near the hall
    const hours = lighting && lighting.getTime ? lighting.getTime() : null, sun = scene.children.find(o => o.isDirectionalLight);
    if (sun) dir.copy(sun.position).sub(sun.target.position).normalize();
    const moved = hours !== null && st.hours !== null ? Math.min(Math.abs(hours - st.hours), 24 - Math.abs(hours - st.hours)) >= 1 : sun ? dir.dot(st.sun) < 0.968 : false;
    if (st.target && !moved && Math.abs(day - st.capDay) < 0.1) return false;
    st.at = now; st.capDay = day; st.hours = hours; st.sun.copy(dir);
    return true;
  };
  if (typeof location !== 'undefined' && /[?&]gymdebug=1/.test(location.search)) globalThis.__gym = { M, TUNE, HALLBOX, st, again() { st.capDay = -9; st.at = -1e9; st.day = -1; } };   // for tuning runs only
  if (ctx.animate) ctx.animate((dt, t, env) => {
    let scene = vis; while (scene.parent) scene = scene.parent;
    if (scene.isScene && env && env.renderer && env.camera && frame(env.renderer, scene, env.camera, env.lighting, performance.now())) capture(env.renderer, scene);
  });
  else {
    // no per-frame hook for builders: a mesh that draws nothing is asked before every pass; the capture itself runs after the frame
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0, 0, 0, 0, 0, 0, 0], 3));
    const ticker = new THREE.Mesh(g, Object.assign(new THREE.MeshBasicMaterial({ colorWrite: false, depthWrite: false, depthTest: false }), { name: 'gym-ticker' }));
    ticker.frustumCulled = false; ticker.renderOrder = -10; ticker.castShadow = false; ticker.name = item.id + '-ticker'; ctx.add(ticker);
    ticker.onBeforeRender = (renderer, scene, camera) => {
      if (st.queued || !frame(renderer, scene, camera, null, performance.now())) return;
      st.queued = true; Promise.resolve().then(() => { st.queued = false; capture(renderer, scene); });
    };
  }
}
