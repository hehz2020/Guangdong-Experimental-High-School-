// Five-storey teaching slab (the east pair: slab-north and slab-south), inside and out.
//
// SEEN in the 2018 drone footage (frames 5-8, north faces and roofs only; read from 360p frames, so sizes are by proportion):
//   - white grid of piers and floor bands; under every window row a dark-red spandrel about 1 m high; window strips about
//     2.3 m high with a transom near the top and 5-6 mullions per bay; a white band about 0.6 m between the storeys;
//   - top row: two separate, squarer openings per bay with a white pier between them and a tall white fascia above;
//   - ground level darker than the rest (modelled as a recessed dark base with tinted glass);
//   - east part: six bays between a wide white end pier and a full-height vertical break; west of the break a narrow window
//     column and three tighter bays;
//   - roof: dark membrane, white parapets, pale box units joined by duct runs, a pale-red band and a red pipe along the tall
//     south parapet; on the western part the north parapet is a wider white box about 1 m higher (its east end is visible);
//     a small flat-roofed white pavilion near the west end (frame 8, south slab; repeated on the north slab);
//   - the satellite outline puts the break 18.7 m (north slab) and 19.5 m (south slab) from the west end; that is used.
// NOT RESOLVED: the satellite roof edge of the western part lies about 2.8 m further south than the eastern part. A 1 m
//   higher parapet explains about a quarter of that; whether the rest is a set-back of the facade could not be decided from
//   the frames, so both parts are built in one plane with a joint between them.
//
// IMAGINED (no reference shows any of it; the owner asked for a complete, good-looking building and said that where nothing
// is known imagination should fill in; typical of Guangdong school buildings, and without any invented lettering):
//   - the whole south side: open corridor with columns, edge beams, solid balustrade with a dark-red band, a stainless
//     handrail, a drainage channel with spouts, planter troughs, rainwater pipes, ceiling lamps, air-conditioner outdoor
//     units above the corridor windows, a wash trough with a mirror at the west end, hose cabinets, bins, exit signs;
//   - the plan: a staircase in the west bay with windows at its half landings, one classroom and a teachers' office in the
//     western part, three classrooms in the eastern part, a hot-water niche in the east end pier, two closed doors in the
//     east end wall of the corridor (ground and top storey; on storeys 2 to 4 the doorway described next takes their place);
//   - doorways out of the end walls, so that the neighbouring builders' stairs join the corridors: on storeys 2 to 4 a
//     door 0.9 m wide at the east end of the corridor leads onto the balcony of the stair tower (stair-tower.js); on
//     storey 3 a door 1.3 m wide in the west wall of the stair hall leads onto the spur of the elevated walkway
//     (walkway.js). Timber frames as on the classroom doors, leaves folded back against the wall, an exit pictogram over each;
//   - every interior: terrazzo floors with brass strips, painted walls with a glossy dado, teaching platform, chalkboard
//     (blank, wiped), console with a monitor, lectern with a globe, projector and screen, clock (no numerals), blank duty
//     and timetable frames, loudspeakers, fans (they turn), lamps, curtains, air-conditioners, lockers, a book corner,
//     pin boards (blank sheets), broom corner, water dispenser, desks and chairs with bags, books, pencil cases and
//     bottles; in the office desks between low screens with monitors, shelves of files, a sofa and tea table, a copier;
//     classrooms face east so that daylight from the north windows falls from the pupils' left;
//   - outside: window sills, sashes slid open here and there, condensers on brackets with drain stacks, downpipes, the
//     planting strip along the north face, bicycles by the corner block; on the roof copings, a lightning strip, water
//     tanks, solar water heaters, fan grilles, vents, a paved walkway; the use of the corner block and the roof pavilion.
// Furniture has no collision. Everything small sits behind ctx.detail in three tiers (corridor/facade fittings, interiors,
// fine objects); ctx.lowPower thins it out. Only stock three.js shaders are used (nothing to switch off in safe mode).
import { THREE, mat, bbox } from '../../kit.js';
import { Batch } from '../../batch.js';
import { plain, pbr, SURFACES } from '../../hifi.js';
import { shrubs } from '../../flora.js';
import { LIT } from '../../street.js';

const FH = 3.9, FLOORS = 5, INSET = 0.3, WALL = 0.24, CORRIDOR = 2.6, X0 = 4.6, RISE = 0.15, GO = 0.28, STEPS = 13;
const ALL = 'EWUDSN', skipCache = {};
const skipOf = faces => skipCache[faces] ?? (skipCache[faces] = [...ALL].filter(f => !faces.includes(f)).join(''));
const UP = new THREE.Vector3(0, 1, 0), ONE = new THREE.Vector3(1, 1, 1);

// ---- textures drawn in code (no lettering anywhere) ----
function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const rgb = (c, k = 1) => `rgb(${c.map(ch => Math.max(0, Math.min(255, Math.round(ch * k)))).join(',')})`;
const rgbOf = hex => [hex >> 16 & 255, hex >> 8 & 255, hex & 255];
function canvasTex(w, h, draw, mx, my = mx) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(1 / mx, 1 / my); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  return t;
}
// The recipe of hifi.js for surfaces of this building only: tileable noise, then colour, normal and roughness maps; metres per repeat.
const sm = t => t * t * (3 - 2 * t);
function vnoise(S, cells, seed) {
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
function fbm(S, cells, octaves, seed, gain = 0.5) {
  const out = new Float32Array(S * S); let amp = 1, total = 0;
  for (let o = 0; o < octaves; o++) { const n = vnoise(S, Math.min(S / 2, cells << o), seed + o * 101); for (let i = 0; i < out.length; i++) out[i] += n[i] * amp; total += amp; amp *= gain; }
  for (let i = 0; i < out.length; i++) out[i] /= total;
  return out;
}
function texOf(S, fill, tile, srgb) {
  const c = document.createElement('canvas'); c.width = c.height = S; const g = c.getContext('2d'), im = g.createImageData(S, S); fill(im.data); g.putImageData(im, 0, 0);
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(1 / tile[0], 1 / tile[1]); t.anisotropy = 8; if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
function maps(S, { col, height, rough, strength = 2, tile = [1, 1] }) {
  const out = { map: texOf(S, d => { for (let y = 0, i = 0; y < S; y++) for (let x = 0; x < S; x++, i++) { const c = col(i, x, y); d[i * 4] = c[0]; d[i * 4 + 1] = c[1]; d[i * 4 + 2] = c[2]; d[i * 4 + 3] = 255; } }, tile, true) };
  if (height) out.normalMap = texOf(S, d => {
    for (let y = 0, i = 0; y < S; y++) for (let x = 0; x < S; x++, i++) {
      const xl = height[y * S + (x + S - 1) % S], xr = height[y * S + (x + 1) % S], yu = height[((y + S - 1) % S) * S + x], yd = height[((y + 1) % S) * S + x];
      let nx = (xl - xr) * strength, ny = (yd - yu) * strength; const l = 1 / Math.hypot(nx, ny, 1); nx *= l; ny *= l;
      d[i * 4] = (nx * 0.5 + 0.5) * 255; d[i * 4 + 1] = (ny * 0.5 + 0.5) * 255; d[i * 4 + 2] = (l * 0.5 + 0.5) * 255; d[i * 4 + 3] = 255;
    }
  }, tile, false);
  if (rough) out.roughnessMap = texOf(S, d => { for (let i = 0; i < S * S; i++) { d[i * 4] = 0; d[i * 4 + 1] = Math.max(0, Math.min(1, rough(i))) * 255; d[i * 4 + 2] = 0; d[i * 4 + 3] = 255; } }, tile, false);
  return out;
}
const std = (name, props) => { const m = new THREE.MeshStandardMaterial(props); m.name = 'ts-' + name; return m; };

// terrazzo: stone chips in a cement matrix, ground smooth, with brass strips dividing it into panels (panels 0: none)
function terrazzo(name, base, tile, panels, gloss) {
  const S = 512, chips = vnoise(S, 170, 11), chips2 = vnoise(S, 102, 12), pick = vnoise(S, 150, 13), big = fbm(S, 4, 3, 14), w = panels ? S / panels : 1;
  const tones = [[238, 234, 224], [146, 142, 134], [198, 174, 130], [152, 164, 154], [216, 208, 192]];
  return std(name, { ...maps(S, { tile: [tile, tile], strength: 0.3, height: chips,
    col: (i, x, y) => {
      if (panels && Math.min(x % w, w - x % w, y % w, w - y % w) < 1.2) return [178, 152, 98];
      const k = 0.93 + 0.14 * big[i];
      if (chips[i] > 0.66) return tones[Math.floor(pick[i] * 4.999)];
      if (chips2[i] > 0.72) return tones[(Math.floor(pick[i] * 4.999) + 2) % 5].map(q => q * 0.92);
      return [base[0] * k, base[1] * k, base[2] * k];
    }, rough: i => gloss + 0.14 * big[i] - (chips[i] > 0.66 ? 0.05 : 0) }), roughness: 1, metalness: 0, envMapIntensity: 0.3 });
}
// timber-look laminate: grain along v (the long side of a desk top, the height of a door), no joints
function laminate(name, hex, rough = 0.42) {
  const S = 256, base = rgbOf(hex), n = fbm(S, 3, 4, hex & 255), fine = vnoise(S, 128, 7), g = new Float32Array(S * S);
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) g[y * S + x] = Math.sin((x / S * 26 + n[y * S + x] * 4.5 + y / S) * 6.2832) * 0.5 + 0.5;
  return std(name, { ...maps(S, { tile: [0.6, 1.2], strength: 0.3, height: g, col: i => { const k = 0.95 + 0.07 * g[i] + 0.05 * (fine[i] - 0.5) + 0.06 * (n[i] - 0.5); return [base[0] * k, base[1] * k, base[2] * k]; }, rough: i => rough + 0.1 * g[i] }), roughness: 1, metalness: 0, envMapIntensity: 0.5 });
}
function drapeCloth() {                                                      // hanging cloth: three pleats per 0.42 m
  const S = 128, n = fbm(S, 4, 3, 5), h = new Float32Array(S * S);
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) h[y * S + x] = Math.abs(Math.sin((x / S * 3 + 0.07 * n[y * S + x]) * Math.PI));
  return std('drape', { ...maps(S, { tile: [0.42, 1.3], strength: 5, height: h, col: i => { const k = 0.7 + 0.36 * h[i]; return [160 * k, 184 * k, 203 * k]; }, rough: () => 0.95 }), roughness: 1, metalness: 0 });
}
const speckleTex = (c, metres, lo = 0.88, span = 0.24, n = 1400) => canvasTex(128, 128, (g, S) => {
  const r = rng(c[0] * 7 + c[2]); g.fillStyle = rgb(c); g.fillRect(0, 0, S, S);
  for (let i = 0; i < n; i++) { g.fillStyle = rgb(c, lo + r() * span); const s = 1 + r() * 3; g.fillRect(r() * S, r() * S, s, s); }
}, metres);
const boardTex = () => canvasTex(1024, 256, (g, W, H) => {                 // blank chalkboard after a day's use: wiped swathes and chalk dust, nothing written
  const r = rng(77); g.fillStyle = '#21463a'; g.fillRect(0, 0, W, H); g.lineCap = 'round';
  for (let i = 0; i < 80; i++) {
    const x = r() * W, y = r() * H, len = 70 + r() * 260, a = (r() - 0.5) * 0.5, bow = (r() - 0.5) * 50; g.strokeStyle = `rgba(232,240,230,${(0.014 + r() * 0.03).toFixed(3)})`; g.lineWidth = 14 + r() * 28;
    for (const ox of [-W, 0, W]) for (const oy of [-H, 0, H]) { g.beginPath(); g.moveTo(x + ox, y + oy); g.quadraticCurveTo(x + ox + len / 2, y + oy + bow, x + ox + len * Math.cos(a), y + oy + len * Math.sin(a)); g.stroke(); }
  }
  for (let i = 0; i < 900; i++) { g.fillStyle = `rgba(240,244,236,${(0.02 + r() * 0.06).toFixed(3)})`; g.fillRect(r() * W, r() * H, 1 + r() * 2, 1 + r() * 2); }
}, 4.2, 1.25);
const lockerTex = () => canvasTex(128, 128, (g, S) => {                    // one 0.4 m locker door: vent slits, a blank name card, a lock
  g.fillStyle = '#8fa5b6'; g.fillRect(0, 0, S, S);
  const gr = g.createLinearGradient(0, 0, S, 0); gr.addColorStop(0, 'rgba(255,255,255,0.12)'); gr.addColorStop(0.5, 'rgba(255,255,255,0)'); gr.addColorStop(1, 'rgba(0,0,0,0.12)'); g.fillStyle = gr; g.fillRect(0, 0, S, S);
  g.strokeStyle = '#56697a'; g.lineWidth = 5; g.strokeRect(2.5, 2.5, S - 5, S - 5);
  g.fillStyle = '#51636f'; for (let i = 0; i < 4; i++) g.fillRect(34, 20 + i * 9, 60, 3);
  g.fillStyle = '#f1efe8'; g.fillRect(40, 66, 48, 20); g.strokeStyle = '#6a7a86'; g.lineWidth = 1.5; g.strokeRect(40, 66, 48, 20);
  g.fillStyle = '#d9dcde'; g.beginPath(); g.arc(104, 76, 5, 0, 6.283); g.fill(); g.fillStyle = '#39424a'; g.fillRect(103, 73, 2, 6);
}, 0.4);
const spinesTex = files => canvasTex(512, 256, (g, W, H) => {              // two shelves of books (or lever-arch files with blank labels) seen from the front
  const r = rng(files ? 41 : 23), rh = H / 2;
  g.fillStyle = '#3a3128'; g.fillRect(0, 0, W, H);
  const cols = files ? ['#2f5f9e', '#27313a', '#8a8f94', '#2f5f9e', '#3d7a5a', '#a3352c'] : ['#b8322a', '#2f5f9e', '#3d8a55', '#d9a520', '#e9e2cf', '#6b4e8a', '#2a8a96', '#d4763a', '#f0ede6', '#44484c'];
  for (let j = 0; j < 2; j++) {
    const y1 = (j + 1) * rh - 8; g.fillStyle = '#c9a878'; g.fillRect(0, y1, W, 8);
    for (let x = 3; x < W - 30;) {
      if (r() < (files ? 0.07 : 0.1)) { x += 8 + r() * 26; continue; }
      const w = files ? 24 + (r() < 0.3 ? 8 : 0) : 6 + r() * 12, h = files ? rh - 26 : rh * (0.55 + 0.32 * r());
      g.fillStyle = cols[Math.floor(r() * cols.length)]; g.fillRect(x, y1 - h, w - 1, h);
      g.fillStyle = 'rgba(255,255,255,0.14)'; g.fillRect(x, y1 - h, 1.5, h); g.fillStyle = 'rgba(0,0,0,0.22)'; g.fillRect(x + w - 2.5, y1 - h, 1.5, h);
      if (files) { g.fillStyle = '#f3f1ea'; g.fillRect(x + 4, y1 - h + 12, w - 9, 34); g.fillStyle = '#1b1f22'; g.beginPath(); g.arc(x + w / 2 - 0.5, y1 - 16, 4.5, 0, 6.283); g.fill(); }
      else if (r() < 0.5) { g.fillStyle = 'rgba(255,255,255,0.35)'; g.fillRect(x + 1, y1 - h + 6 + r() * 10, w - 3, 3); }
      x += w;
    }
  }
}, files ? 1.8 : 1.4, files ? 0.84 : 0.76);
const globeTex = () => canvasTex(256, 128, (g, W, H) => {                  // a school globe: invented land shapes, not a map
  const n = fbm(256, 4, 4, 91), im = g.createImageData(W, H), d = im.data;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = (y * W + x) * 4, h = n[y * 2 * 256 + x], lat = Math.abs(y / H - 0.5) * 2, land = h + 0.08 * (1 - lat) > 0.56;
    const c = lat > 0.9 ? [236, 240, 240] : land ? (h > 0.64 ? [196, 170, 110] : [108, 160, 96]) : [58 + 30 * h, 120 + 40 * h, 190];
    d[i] = c[0]; d[i + 1] = c[1]; d[i + 2] = c[2]; d[i + 3] = 255;
  }
  g.putImageData(im, 0, 0); g.strokeStyle = 'rgba(255,255,255,0.25)'; g.lineWidth = 1;
  for (let k = 1; k < 6; k++) { g.beginPath(); g.moveTo(0, H * k / 6); g.lineTo(W, H * k / 6); g.stroke(); }
  for (let k = 0; k < 12; k++) { g.beginPath(); g.moveTo(W * k / 12, 0); g.lineTo(W * k / 12, H); g.stroke(); }
}, 1, 1);
const clockTex = () => canvasTex(128, 128, (g, S) => {                     // wall clock: ticks and hands, no numerals
  g.clearRect(0, 0, S, S); g.fillStyle = '#2a2d30'; g.beginPath(); g.arc(64, 64, 62, 0, 6.283); g.fill(); g.fillStyle = '#f6f5f0'; g.beginPath(); g.arc(64, 64, 55, 0, 6.283); g.fill();
  g.strokeStyle = '#2a2d30';
  for (let i = 0; i < 12; i++) { const a = i / 12 * 6.283; g.lineWidth = i % 3 ? 2 : 4; g.beginPath(); g.moveTo(64 + Math.cos(a) * 44, 64 + Math.sin(a) * 44); g.lineTo(64 + Math.cos(a) * 51, 64 + Math.sin(a) * 51); g.stroke(); }
  g.lineCap = 'round'; g.lineWidth = 5; g.beginPath(); g.moveTo(64, 64); g.lineTo(42, 48); g.stroke(); g.lineWidth = 3; g.beginPath(); g.moveTo(64, 64); g.lineTo(78, 24); g.stroke();
  g.strokeStyle = '#b8322a'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(64, 64); g.lineTo(94, 94); g.stroke(); g.fillStyle = '#2a2d30'; g.beginPath(); g.arc(64, 64, 4, 0, 6.283); g.fill();
}, 0.34);
const rosterTex = () => canvasTex(128, 176, (g, W, H) => {                 // framed sheet with a ruled grid and a plain header band: a blank duty roster
  g.fillStyle = '#b9bec2'; g.fillRect(0, 0, W, H); g.fillStyle = '#fbfaf5'; g.fillRect(5, 5, W - 10, H - 10); g.fillStyle = '#c0483c'; g.fillRect(5, 5, W - 10, 20);
  g.strokeStyle = '#9aa3aa'; g.lineWidth = 1;
  for (let i = 0; i <= 6; i++) { const y = 34 + i * 21; g.beginPath(); g.moveTo(12, y); g.lineTo(W - 12, y); g.stroke(); }
  for (let i = 0; i <= 5; i++) { const x = 12 + i * (W - 24) / 5; g.beginPath(); g.moveTo(x, 34); g.lineTo(x, 160); g.stroke(); }
}, 0.5, 0.7);
const wcTex = kind => canvasTex(kind ? 128 : 256, 128, (g, W, H) => {         // toilet pictograms: a man and a woman (kind 0), the man (1) or the woman (2) alone
  g.fillStyle = '#f4f3ee'; g.fillRect(0, 0, W, H);
  const fig = (cx, col, dress) => {
    g.fillStyle = col; g.beginPath(); g.arc(cx, 26, 12, 0, 6.283); g.fill();
    if (dress) { g.beginPath(); g.moveTo(cx - 12, 42); g.lineTo(cx + 12, 42); g.lineTo(cx + 26, 92); g.lineTo(cx - 26, 92); g.closePath(); g.fill(); g.fillRect(cx - 12, 92, 9, 28); g.fillRect(cx + 3, 92, 9, 28); }
    else { g.fillRect(cx - 17, 42, 34, 44); g.fillRect(cx - 14, 86, 12, 34); g.fillRect(cx + 2, 86, 12, 34); }
  };
  if (kind) fig(64, kind === 1 ? '#2f5f9e' : '#b8322a', kind === 2);
  else { fig(70, '#2f5f9e', false); fig(186, '#b8322a', true); g.fillStyle = '#8a8f94'; g.fillRect(126, 14, 4, 100); }
}, kind ? 0.25 : 0.5, 0.25);
const exitTex = () => canvasTex(256, 96, (g, W, H) => {                    // emergency-exit pictogram: a figure in a doorway and an arrow
  g.fillStyle = '#1f8f4a'; g.fillRect(0, 0, W, H); g.fillStyle = '#ffffff'; g.strokeStyle = '#ffffff'; g.lineCap = 'round'; g.lineJoin = 'round';
  g.fillRect(44, 14, 62, 68); g.fillStyle = '#1f8f4a'; g.fillRect(52, 22, 46, 60); g.fillStyle = '#ffffff'; g.beginPath(); g.arc(72, 32, 7, 0, 6.283); g.fill();
  g.lineWidth = 7; g.beginPath(); g.moveTo(72, 42); g.lineTo(68, 58); g.lineTo(80, 66); g.lineTo(78, 78); g.moveTo(68, 58); g.lineTo(58, 70); g.moveTo(72, 46); g.lineTo(60, 50); g.moveTo(72, 46); g.lineTo(86, 52); g.stroke();
  g.lineWidth = 9; g.beginPath(); g.moveTo(136, 48); g.lineTo(216, 48); g.moveTo(190, 26); g.lineTo(216, 48); g.lineTo(190, 70); g.stroke();
}, 0.4, 0.15);

// ---- materials ----
let MT = null;
function materials() {
  if (MT) return MT;
  const P = (name, color, rough = 0.8, metal = 0, over = {}) => plain('ts-' + name, color, rough, metal, over);
  const keep = m => { m.userData.keep = true; return m; };           // not folded into the vertex-coloured mesh: its gloss or glow matters
  const T = (name, map, rough = 0.85, over = {}) => std(name, { map, roughness: rough, ...over });
  const gz = SURFACES.glazing(0x5a7480, 6, 1, [4.2, FH], 3);          // one row of panes per storey: sky above, a band of trees below
  const G = (name, color, opacity) => std(name, { map: gz.map, normalMap: gz.normalMap, color, roughness: 0.05, metalness: 0.55, envMapIntensity: 1.5, transparent: true, opacity, depthWrite: false });
  MT = {
    W: mat('wallWhite'), R: mat('wallMaroon'), MW: mat('metalWhite'), GL: mat('glassClear'), RP: mat('roofPale'), GD: mat('glassDark'), KRED: mat('red'),
    PL: keep(P('plaster', 0xf0ede3, 0.92, 0, { emissive: 0xf0ede3, emissiveIntensity: 0.05 })), CE: keep(P('ceil', 0xe9e6dc, 0.95, 0, { emissive: 0xe9e6dc, emissiveIntensity: 0.16 })),
    DA: keep(P('dado', 0xb3d0be, 0.4, 0, { envMapIntensity: 0.5 })), DAL: P('dadoline', 0x5f9a80, 0.55), CO: keep(P('corr', 0xeee6d2, 0.9, 0, { emissive: 0xeee6d2, emissiveIntensity: 0.03 })), DK: P('dark', 0x24272a, 0.7),
    BASE: pbr('granitePolished', [0x3b3e42, 7]), CTILE: pbr('tiles', [0xe4ebe4, 4, 0.6, 0.2]),
    // the same pane seen from outside (it mirrors the sky and glows after dusk) and from inside (clear)
    glassOut: G('glass-north', 0xffffff, 0.8), glassG: G('glass-ground', 0x8e969a, 0.88),
    glassIn: std('lite-inner', { color: 0xd6e6ea, roughness: 0.08, metalness: 0, transparent: true, opacity: 0.1, depthWrite: false }),
    TZ: terrazzo('terrazzo', [212, 203, 181], 2.4, 2, 0.24), TR: terrazzo('terrazzo-step', [186, 181, 170], 1.6, 0, 0.36),
    CT: pbr('tiles', [0xe2d3b2, 2, 1.2, 0.32], { envMapIntensity: 0.45 }), CB: pbr('tiles', [0x8d5f4d, 4, 0.72, 0.3], { envMapIntensity: 0.45 }), WT: pbr('tiles', [0xf3f4f0, 3, 0.6, 0.18], { envMapIntensity: 0.5 }), FT: pbr('tiles', [0xa9aba6, 2, 0.6, 0.5], { envMapIntensity: 0.4 }),
    ROOF: pbr('asphalt', [0x4a4c4e]), PINK: P('pink', 0xb89490, 0.9), WALK: pbr('paving', [0xbdb7ab, 0xa8a297, 2, 2, [1.0, 1.0], 31, false]),
    COP: pbr('concrete', [0xd4d1c8]), KERB: pbr('concrete', [0xa9a69e]), BED: pbr('hedge', [0x35532c]), HEDGE: pbr('hedge', [0x3f6b34]),
    SS: pbr('steel'), AL: keep(P('alu', 0xc6cacd, 0.36, 0.8)), BRASS: keep(P('brass', 0xb39a5c, 0.4, 0.85)), GLOSS: keep(P('gloss-dark', 0x101316, 0.12, 0.35)),
    MIRROR: keep(P('mirror', 0xe6ecee, 0.04, 1)), FROST: keep(P('frosted', 0xdfe9ea, 0.6, 0, { emissive: 0xdfe9ea, emissiveIntensity: 0.4 })), BASIN: P('basin', 0xcfd6d8, 0.4), SOLAR: keep(P('solar', 0x18202c, 0.2, 0.6)),
    LAMP: P('lamp', 0xffffff, 0.6, 0, { emissive: 0xfff4d8, emissiveIntensity: 0.9 }),
    WH: P('white', 0xf3f2ee, 0.6), PV: P('pvc', 0xe6e4dc, 0.6), RED: P('red', 0xb8322a, 0.55), GRAT: P('grating', 0x55595a, 0.7), SOIL: P('soil', 0x4a3b2c, 1),
    POT: P('terracotta', 0xb5653f, 0.85), CON: P('console', 0x8e9aa4, 0.6), LB: P('cabinet', 0x8ea2b2, 0.6), SCR: P('desk-divider', 0x7d93a6, 0.95),
    SOFA: P('sofa', 0x5b4636, 0.6), CUSH: P('cushion', 0x6c5644, 0.7), FAN: P('fan', 0xe9e7e0, 0.6), BINA: P('bin-grey', 0x6b7377, 0.7), BINB: P('bin-green', 0x3d8a55, 0.7),
    STRAW: P('straw', 0xc4a55c, 0.9), PLT: P('plate', 0x2f5f9e, 0.5), PLTR: P('plate-red', 0xb5564f, 0.5), DFR: P('door-frame', 0x6f4b31, 0.6), BLUE: P('bottle', 0x9fc8e6, 0.35),
    SHA: P('sheet-a', 0xf4f1e6, 0.9), SHB: P('sheet-b', 0xf3e3a4, 0.9), SHC: P('sheet-c', 0xbfd9ee, 0.9), TYRE: P('tyre', 0x1b1c1e, 0.85),
    BOARD: T('board', boardTex(), 0.88), CORK: T('cork', speckleTex([176, 141, 87], 1.0), 0.95), LOCK: T('locker', lockerTex(), 0.55),
    BOOKS: T('spines-books', spinesTex(false), 0.8), FILES: T('spines-files', spinesTex(true), 0.7), GLOBE: T('globe', globeTex(), 0.45),
    CLOCK: T('clock', clockTex(), 0.5, { alphaTest: 0.5 }), ROSTER: T('roster', rosterTex(), 0.7), WC: T('wc-sign', wcTex(0), 0.6), WCM: T('wc-men', wcTex(1), 0.6), WCW: T('wc-women', wcTex(2), 0.6),
    EXIT: std('exit-sign', { map: exitTex(), roughness: 0.6, emissive: 0xffffff, emissiveIntensity: 0.55 }),
    DRAPE: drapeCloth(), DAIS: pbr('boards', [0xa98458, 1.2], { envMapIntensity: 0.4 }),
    deskTop: laminate('laminate-desk', 0xdcc091), seat: laminate('laminate-seat', 0xc99a5f, 0.5), door: laminate('laminate-door', 0xb98452), oak: laminate('laminate-oak', 0xcdb086),
    deskSteel: P('desk-steel', 0x56677a, 0.5, 0.2),
    // instanced things take their colour per instance
    bag: P('bag', 0xffffff, 0.85, 0, { vertexColors: true }), book: P('book', 0xffffff, 0.8), caseM: P('pencil-case', 0xffffff, 0.6), bottle: keep(P('flask', 0xffffff, 0.3, 0.1)),
    leaf: pbr('hedge', [0x4a7a3a]), potI: P('pot', 0xffffff, 0.8), bike: keep(P('bike-frame', 0xffffff, 0.4, 0.5)),
  };
  MT.EXIT.emissiveMap = MT.EXIT.map;
  return MT;
}
// After dusk the room lights are on: ceilings and walls glow a little (seen through the windows from outside). The page's hemisphere light
// carries the amount of daylight (0..1), as it does for the gymnasium.
let skyLight = null;
function followDaylight(renderer, scene) {
  if (!skyLight || skyLight.parent !== scene) skyLight = scene.children.find(o => o.isHemisphereLight) || null;
  const day = skyLight ? Math.min(1, Math.max(0, skyLight.intensity)) : 1, night = 1 - Math.min(1, Math.max(0, (day - 0.06) / 0.5));
  MT.CE.emissiveIntensity = 0.16 + 0.38 * night; MT.PL.emissiveIntensity = 0.05 + 0.27 * night; MT.CO.emissiveIntensity = 0.03 + 0.25 * night; MT.FROST.emissiveIntensity = 0.06 + 0.34 * day;
}

// Draw-call saver: all plain-coloured, matt, opaque parts of a group become ONE mesh with vertex colours.
let flatMat = null;
function mergeFlat(group, castShadow) {
  const take = group.children.filter(m => { const t = m.material; return m.isMesh && !m.isInstancedMesh && !t.map && !t.transparent && !t.userData.keep && !/glass/i.test(t.name) && t.emissiveIntensity * (t.emissive.r + t.emissive.g + t.emissive.b) < 0.3; });
  if (take.length < 2) return group;
  let nv = 0, ni = 0; for (const m of take) { nv += m.geometry.attributes.position.count; ni += m.geometry.index.count; }
  const pos = new Float32Array(nv * 3), nor = new Float32Array(nv * 3), col = new Float32Array(nv * 3), idx = new Uint32Array(ni);
  let v0 = 0, i0 = 0;
  for (const m of take) {
    const g = m.geometry, n = g.attributes.position.count, c = m.material.color, ix = g.index.array;
    pos.set(g.attributes.position.array, v0 * 3); nor.set(g.attributes.normal.array, v0 * 3);
    for (let i = 0; i < n; i++) { col[(v0 + i) * 3] = c.r; col[(v0 + i) * 3 + 1] = c.g; col[(v0 + i) * 3 + 2] = c.b; }
    for (let i = 0; i < ix.length; i++) idx[i0 + i] = ix[i] + v0;
    v0 += n; i0 += ix.length; group.remove(m); g.dispose();
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.BufferAttribute(nor, 3)); g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  g.setIndex(new THREE.BufferAttribute(idx, 1));
  if (!flatMat) { flatMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.78, metalness: 0.03 }); flatMat.name = 'ts-flat'; }
  const mesh = new THREE.Mesh(g, flatMat); mesh.castShadow = castShadow; mesh.receiveShadow = true; group.add(mesh);
  return group;
}
/** Several stock geometries as one: [[geometry, Matrix4]...]. */
function mergeGeos(parts) {
  let nv = 0, ni = 0; for (const [g] of parts) { nv += g.attributes.position.count; ni += g.index.count; }
  const pos = new Float32Array(nv * 3), nor = new Float32Array(nv * 3), uv = new Float32Array(nv * 2), idx = new Uint32Array(ni), p = new THREE.Vector3(), nm = new THREE.Matrix3();
  const tinted = parts.some(q => q[2] !== undefined), col = tinted ? new Float32Array(nv * 3) : null;
  let v0 = 0, i0 = 0;
  for (const [g, m, tint = 1] of parts) {
    const A = g.attributes.position, N = g.attributes.normal, U = g.attributes.uv; nm.getNormalMatrix(m);
    if (col) col.fill(tint, v0 * 3, (v0 + A.count) * 3);
    for (let i = 0; i < A.count; i++) {
      p.fromBufferAttribute(A, i).applyMatrix4(m); pos[(v0 + i) * 3] = p.x; pos[(v0 + i) * 3 + 1] = p.y; pos[(v0 + i) * 3 + 2] = p.z;
      p.fromBufferAttribute(N, i).applyMatrix3(nm).normalize(); nor[(v0 + i) * 3] = p.x; nor[(v0 + i) * 3 + 1] = p.y; nor[(v0 + i) * 3 + 2] = p.z;
      if (U) { uv[(v0 + i) * 2] = U.getX(i); uv[(v0 + i) * 2 + 1] = U.getY(i); }
    }
    for (let i = 0; i < g.index.count; i++) idx[i0 + i] = g.index.array[i] + v0;
    v0 += A.count; i0 += g.index.count;
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.BufferAttribute(pos, 3)); out.setAttribute('normal', new THREE.BufferAttribute(nor, 3)); out.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); out.setIndex(new THREE.BufferAttribute(idx, 1));
  if (col) out.setAttribute('color', new THREE.BufferAttribute(col, 3));
  return out;
}
const TM = (x, y, z, rx = 0, ry = 0, rz = 0) => new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz)), ONE);
const rod = (a, b, r, seg = 5) => {                                        // round bar between two points, for mergeGeos
  const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), d = B.clone().sub(A), len = d.length();
  return [new THREE.CylinderGeometry(r, r, len, seg, 1), new THREE.Matrix4().compose(A.add(B).multiplyScalar(0.5), new THREE.Quaternion().setFromUnitVectors(UP, d.normalize()), ONE)];
};

// One pupil's desk with its chair pushed in, facing +x; origin on the floor under the middle of the desk top.
let deskParts = null;
function deskSet(low) {
  if (deskParts) return deskParts;
  const b = new Batch(), M = materials(), TOP = M.deskTop, ST = M.deskSteel, SE = M.seat;
  b.box(TOP, 0, 0.735, 0, 0.42, 0.03, 0.6);
  b.box(ST, 0.01, 0.655, 0, 0.36, 0.13, 0.54, 'UW');                                              // book box under the top, open toward the pupil
  if (low) for (const z of [-0.28, 0.28]) b.box(ST, 0, 0.3, z, 0.34, 0.6, 0.02, 'UD');
  else for (const x of [-0.18, 0.18]) for (const z of [-0.28, 0.28]) b.box(ST, x, 0.36, z, 0.028, 0.72, 0.028, 'UD');
  b.box(SE, -0.34, 0.435, 0, 0.37, 0.022, 0.38); b.box(SE, -0.535, 0.7, 0, 0.022, 0.26, 0.38);     // seat and back
  if (low) for (const z of [-0.175, 0.175]) b.box(ST, -0.34, 0.21, z, 0.34, 0.42, 0.02, 'UD');
  else for (const z of [-0.17, 0.17]) { b.box(ST, -0.18, 0.212, z, 0.025, 0.424, 0.025, 'UD'); b.box(ST, -0.525, 0.415, z, 0.025, 0.83, 0.025, 'UD'); }
  return (deskParts = b.build({ castShadow: false }).children);
}
const shapes = {};
const shape = (name, make) => shapes[name] || (shapes[name] = make());
const bagGeo = () => shape('bag', () => mergeGeos([[new THREE.BoxGeometry(0.11, 0.33, 0.27), TM(0, 0, 0), 1], [new THREE.BoxGeometry(0.035, 0.15, 0.2), TM(-0.07, -0.07, 0), 1.45], [new THREE.BoxGeometry(0.09, 0.035, 0.23), TM(0, 0.18, 0, 0, 0, 0.12), 0.7],
  [new THREE.BoxGeometry(0.015, 0.012, 0.21), TM(-0.09, -0.01, 0), 0.5]]));   // body, lighter pocket with a zip, flap
const bottleGeo = () => shape('bottle', () => mergeGeos([[new THREE.CylinderGeometry(0.033, 0.033, 0.17, 8, 1), TM(0, 0.085, 0)], [new THREE.CylinderGeometry(0.02, 0.026, 0.035, 8, 1), TM(0, 0.187, 0)]]));
const fanGeo = () => shape('fan', () => mergeGeos([[new THREE.CylinderGeometry(0.1, 0.1, 0.12, 10, 1), TM(0, 0, 0)], ...[0, 1, 2].map(i => [new THREE.BoxGeometry(0.62, 0.012, 0.13), new THREE.Matrix4().makeRotationY(i * 2.0944).multiply(TM(0.42, 0.02, 0, 0.12, 0, 0))])]));
const leafGeo = () => shape('leaf', () => {                                // a rounded tuft of leaves, flat underneath
  const geo = new THREE.IcosahedronGeometry(1, 1), p = geo.attributes.position, nrm = geo.attributes.normal, uv = geo.attributes.uv, w = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) { const k = 1 + 0.22 * (rng(Math.round((p.getX(i) + 2) * 97 + (p.getY(i) + 2) * 311 + (p.getZ(i) + 2) * 733))() - 0.5); p.setXYZ(i, p.getX(i) * k, Math.max(-0.35, p.getY(i)) * k, p.getZ(i) * k); }
  for (let i = 0; i < p.count; i++) { w.set(p.getX(i), p.getY(i) * 1.2 + 0.15, p.getZ(i)).normalize(); nrm.setXYZ(i, w.x, w.y, w.z); uv.setXY(i, uv.getX(i) * 0.6, uv.getY(i) * 0.3); }
  return geo;
});
const bikeGeos = () => shape('bike', () => {                               // a plain city bicycle along x: [painted frame, black parts]
  const R = [-0.52, 0.33, 0], Fw = [0.52, 0.33, 0], BB = [-0.1, 0.3, 0], S = [-0.22, 0.82, 0], H = [0.36, 0.86, 0], Hb = [0.4, 0.66, 0];
  const frame = mergeGeos([rod(BB, S, 0.016), rod(S, H, 0.016), rod(BB, Hb, 0.018), rod(R, BB, 0.011), rod(R, S, 0.011), rod(Hb, Fw, 0.013), rod(Hb, [0.34, 0.99, 0], 0.013), rod([0.34, 0.99, -0.25], [0.34, 0.99, 0.25], 0.011),
    rod(S, [-0.24, 0.92, 0], 0.012), [new THREE.BoxGeometry(0.5, 0.012, 0.12), TM(-0.5, 0.69, 0)], [new THREE.TorusGeometry(0.295, 0.009, 4, 18), TM(-0.52, 0.33, 0)], [new THREE.TorusGeometry(0.295, 0.009, 4, 18), TM(0.52, 0.33, 0)]]);
  const black = mergeGeos([[new THREE.TorusGeometry(0.315, 0.021, 5, 18), TM(-0.52, 0.33, 0)], [new THREE.TorusGeometry(0.315, 0.021, 5, 18), TM(0.52, 0.33, 0)], [new THREE.BoxGeometry(0.25, 0.045, 0.14), TM(-0.26, 0.94, 0)],
    [new THREE.BoxGeometry(0.03, 0.03, 0.1), TM(0.34, 0.99, 0.24)], [new THREE.BoxGeometry(0.03, 0.03, 0.1), TM(0.34, 0.99, -0.24)], [new THREE.BoxGeometry(0.26, 0.17, 0.3), TM(0.58, 0.82, 0)], rod(BB, [-0.14, 0.02, 0.16], 0.008), [new THREE.BoxGeometry(0.09, 0.02, 0.36), TM(-0.1, 0.3, 0)]]);
  return [frame, black];
});

export function build(item, ctx) {
  const M = materials(), { W, R, MW, GL, RP, PL, CE, DA, DAL, CO, DK, AL, SS, WH, LAMP, PV, RED, COP } = M;
  const bar = item.mainBar || (b => ({ w: b.w, e: b.e, n: b.n, s: b.s }))(bbox(item.points));
  const L = bar.e - bar.w, D = bar.s - bar.n, roofY = FLOORS * FH, yTop = roofY - 0.3, low = !!ctx.lowPower;
  const zN = INSET, zi = zN + WALL, zS = D - INSET, zc = zS - CORRIDOR, zw = zc - 0.2, zmid = (zi + zw) / 2, depth = zw - zi;
  const xW = INSET + WALL, xEnd = L - INSET - WALL, x0 = X0;                 // inner faces of the end walls; east side of the stair bay
  // the vertical break: where the north edge of the measured roof outline steps
  const stepPts = item.points.map(p => [p[0] - bar.w, p[1]]).filter(p => p[1] < bar.n + 2.5 && p[0] > 8 && p[0] < L - 8);
  const xB = stepPts.length ? stepPts[0][0] : Math.round(L * 3.9) / 10, xE = L - INSET - 1.6;
  const bw = Math.min(4.1, (xB - x0 - 1.8) / 3), be = (xE - xB) / 6;
  const bays = [];
  for (let i = 0; i < 3; i++) bays.push({ a: x0 + i * bw, b: x0 + (i + 1) * bw, west: true });
  bays.push({ a: x0 + 3 * bw, b: xB, west: true, narrow: true });
  for (let i = 0; i < 6; i++) bays.push({ a: xB + i * be, b: xB + (i + 1) * be });
  const rooms = [{ a: x0, b: x0 + 2 * bw, kind: 'class' }, { a: x0 + 2 * bw, b: xB, kind: 'office' }];
  for (let i = 0; i < 3; i++) rooms.push({ a: xB + 2 * i * be, b: xB + 2 * (i + 1) * be, kind: 'class' });
  const ceilOf = k => (k === FLOORS - 1 ? yTop : (k + 1) * FH - 0.15), headOf = k => (k === FLOORS - 1 ? 2.9 : 3.3);
  // staircase (west bay): two flights per storey round a narrow well; zl = north edge of the floor landing, zh = south edge of the half landing
  const sx0 = xW, sw = (x0 - 0.1 - sx0 - 0.2) / 2, run = STEPS * GO, zl = zc - 1.3, zh = zl - run, xb1 = sx0 + sw, xa1 = xb1 + 0.2, xa2 = xa1 + sw;
  // block at the south-west corner of the measured outline
  const southPts = item.points.filter(p => p[1] > bar.s + 1), annex = southPts.length >= 2 ? bbox(southPts) : null;
  const ax = annex ? annex.w - bar.w : 0, aw = annex ? annex.sx : 0, ad = annex ? annex.s - bar.s + INSET : 0;
  // that block holds the toilets: an entrance from the corridor (xd0..xd1), a wash lobby, a room either side behind the walls at xp
  const T = 0.2, xd0 = 3.0, xd1 = 4.1, xp = [2.5, 4.5], xt0 = ax + T, xt1 = ax + aw - T, zt0 = D - INSET + T, zt1 = D - INSET + ad - T;
  const wc = !!annex && xt0 < 1.0 && xt1 > 6.4 && ad > 4.2;

  const v = new Batch(), c = new Batch(), ex = new Batch(), fu = new Batch(), fx = new Batch();   // shell, colliders, corridor/facade fittings, interiors, fine objects
  const home = b => b.frame(bar.w, bar.n); [v, c, ex, fu, fx].forEach(home);
  const F = (b, m, x, y, z, sx, sy, sz, faces) => b.slab(m, x, y, z, sx, sy, sz, skipOf(faces));   // box drawing only the listed faces
  const hit = (x, y, z, sx, sy, sz) => c.slab('generic', x, y, z, sx, sy, sz);
  // inclined slab whose TOP surface runs from (zA, yA) to (zB, yB), between xa and xb
  const incl = (b, m, xa, xb, zA, yA, zB, yB, th, faces) => {
    const [zn, yn, zs, ys] = zA < zB ? [zA, yA, zB, yB] : [zB, yB, zA, yA], len = Math.hypot(zs - zn, ys - yn), ang = Math.atan2(yn - ys, zs - zn);
    b.setMatrix(new THREE.Matrix4().makeRotationX(ang).setPosition(bar.w + (xa + xb) / 2, (yn + ys) / 2 - Math.cos(ang) * th / 2, bar.n + (zn + zs) / 2 - Math.sin(ang) * th / 2));
    b.box(m, 0, 0, 0, xb - xa, th, len, skipOf(faces)); home(b);
  };
  const stick = (b, m, p, q, t) => { b.strut(m, [bar.w + p[0], p[1], bar.n + p[2]], [bar.w + q[0], q[1], bar.n + q[2]], t); home(b); };
  const tube = (b, m, p, q, r, seg = 8, caps = false) => {                    // round bar between two points
    const A = new THREE.Vector3(bar.w + p[0], p[1], bar.n + p[2]), d = new THREE.Vector3(q[0] - p[0], q[1] - p[1], q[2] - p[2]), len = d.length();
    b.setMatrix(new THREE.Matrix4().compose(A, new THREE.Quaternion().setFromUnitVectors(UP, d.normalize()), ONE)); b.cyl(m, 0, 0, 0, r, len, seg, caps); home(b);
  };
  // flat pieces that carry a picture once (texture coordinates run from 0 over the piece): facing west, east, south, north
  const quadW = (b, m, x, y0, y1, z0, z1) => b.quad(m, [x, y0, z0], [x, y0, z1], [x, y1, z1], [x, y1, z0]);
  const quadE = (b, m, x, y0, y1, z0, z1) => b.quad(m, [x, y0, z1], [x, y0, z0], [x, y1, z0], [x, y1, z1]);
  const quadS = (b, m, z, y0, y1, xa, xb) => b.quad(m, [xa, y0, z], [xb, y0, z], [xb, y1, z], [xa, y1, z]);
  const quadN = (b, m, z, y0, y1, xa, xb) => b.quad(m, [xb, y0, z], [xa, y0, z], [xa, y1, z], [xb, y1, z]);
  const rnd = rng(item.id.length * 97 + Math.round(L * 10)), sr = rng(item.id.length * 31 + 7);
  // things drawn as instances: [x, y, z, ...] in local coordinates
  const desks = [], bags = [], books = [], cases = [], bottles = [], globes = [], fans = [], plantsIn = [], plantsOut = [], openLights = [];
  const plant = (list, x, y, z, s = 1, tall = false, pot = true) => list.push([x, y, z, s, tall, pot, rnd()]);

  // ================= SHELL (always drawn) and colliders =================
  // ---- north face ----
  const pier = (xa, xb) => { F(v, W, xa, 0, zN - 0.06, xb - xa, yTop, WALL + 0.06, 'NEW'); F(v, PL, xa, 0, zN, xb - xa, yTop, WALL + 0.004, 'S'); hit(xa, 0, zN, xb - xa, yTop, WALL); };
  for (let i = 0; i <= 3; i++) pier(x0 + i * bw - 0.25, x0 + i * bw + 0.25);
  pier(xB - 0.38, xB - 0.04); pier(xB + 0.04, xB + 0.38); F(v, DK, xB - 0.04, 0, zN + 0.04, 0.08, yTop, 0.1, 'N'); hit(xB - 0.04, 0, zN, 0.08, yTop, WALL);   // joint
  for (let i = 1; i < 6; i++) pier(xB + i * be - 0.25, xB + i * be + 0.25);
  pier(xE - 0.25, L - INSET);                                                   // wide white end pier
  const bars = (b, xa, w, y0, h, yT, n) => {                                    // window frame: one transom and n mullions
    F(b, MW, xa, yT - 0.03, zN + 0.07, w, 0.06, 0.08, 'NSUD');
    for (let i = 1; i <= n; i++) F(b, MW, xa + w * i / (n + 1) - 0.025, y0, zN + 0.07, 0.05, h, 0.08, 'NSEW');
  };
  const glaze = (xa, w, y0, y1, ground) => { if (w < 0.02) return; F(v, ground ? M.glassG : M.glassOut, xa, y0, zN + 0.1, w, y1 - y0, 0.02, 'N'); F(v, M.glassIn, xa, y0, zN + 0.1, w, y1 - y0, 0.02, 'S'); };
  const wx = x0 + 0.25, wlen = xE - 0.25 - wx;
  for (let k = 0; k < FLOORS; k++) {
    const y = k * FH, ground = k === 0, top = k === FLOORS - 1, head = headOf(k), by = y + head, bh = (top ? yTop : y + FH) - by;
    if (ground) F(v, M.BASE, wx, y, zN + 0.1, wlen, 0.95, WALL - 0.1, 'N'); else F(v, R, wx, y, zN, wlen, 0.95, WALL, 'N');      // spandrel
    F(v, DA, wx, y, zN, wlen, 0.95, WALL, 'S'); F(v, W, wx, y, zN, wlen, 0.95, WALL, 'U'); hit(wx, y, zN, wlen, 0.95, WALL);
    F(v, W, wx, by, zN - 0.05, wlen, bh, WALL + 0.05, 'ND'); F(v, PL, wx, by, zN, wlen, bh, WALL, 'S'); hit(wx, by, zN, wlen, bh, WALL);   // white band
    hit(wx, y + 0.95, zN + 0.08, wlen, head - 0.95, 0.08);                                                                    // the glass
    for (const b of bays) {
      const wa = b.a + 0.25, ww = b.b - b.a - 0.5;
      if (top) {                                                                // two squarer openings per bay
        const n = b.narrow ? 1 : 2, pw = b.west ? 0.4 : 0.5, ow = (ww - (n - 1) * pw) / n;
        if (n === 2) { F(v, W, wa + ow, y + 0.95, zN - 0.05, pw, head - 0.95, WALL + 0.05, 'NEW'); F(v, PL, wa + ow, y + 0.95, zN, pw, head - 0.95, WALL, 'S'); }
        for (let i = 0; i < n; i++) { bars(v, wa + i * (ow + pw), ow, y + 0.95, head - 0.95, y + 2.3, ow > 1.7 ? 2 : 1); glaze(wa + i * (ow + pw), ow, y + 0.95, y + head, false); }
      } else {
        const n = Math.max(1, Math.round(ww / 0.7) - 1), lw = ww / (n + 1), yT = y + 2.55;
        bars(v, wa, ww, y + 0.95, head - 0.95, yT, n); glaze(wa, ww, yT, y + head, ground);
        // here and there a sash is slid open: no glass in that light, its frame doubled over the next one (drawn with the fittings)
        const open = !ground && !low && sr() < 0.22 ? 1 + Math.floor(sr() * Math.max(1, n - 1)) : -1;
        if (open < 0) glaze(wa, ww, y + 0.95, yT, ground);
        else { glaze(wa, open * lw, y + 0.95, yT, false); glaze(wa + (open + 1) * lw, ww - (open + 1) * lw, y + 0.95, yT, false); openLights.push([wa + (open - 1) * lw, lw, y]); }
      }
    }
  }
  // stair bay: solid wall with a pair of narrow windows at every half landing
  const swa = (xW + x0 - 0.25) / 2 - 1.05, swb = swa + 2.1;
  F(v, W, xW, 0, zN, swa - xW, yTop, WALL, 'NE'); F(v, PL, xW, 0, zN, swa - xW, yTop, WALL, 'S');
  F(v, W, swb, 0, zN, x0 - 0.25 - swb, yTop, WALL, 'NW'); F(v, PL, swb, 0, zN, x0 - 0.25 - swb, yTop, WALL, 'S');
  hit(xW, 0, zN, x0 - 0.25 - xW, yTop, WALL);
  for (let k = 0, yy = 0; k < FLOORS; k++) {
    const ya = k < FLOORS - 1 ? k * FH + FH / 2 + 0.95 : yTop;
    F(v, W, swa, yy, zN, 2.1, ya - yy, WALL, 'NUD'); F(v, PL, swa, yy, zN, 2.1, ya - yy, WALL, 'S');
    if (k < FLOORS - 1) {
      F(v, M.glassOut, swa, ya, zN + 0.1, 2.1, 1.5, 0.02, 'N'); F(v, M.glassIn, swa, ya, zN + 0.1, 2.1, 1.5, 0.02, 'S');
      F(v, W, swa + 0.9, ya, zN, 0.3, 1.5, WALL, 'NEW'); F(v, PL, swa + 0.9, ya, zN, 0.3, 1.5, WALL, 'S');
      for (const xx of [swa, swa + 1.2]) F(v, MW, xx, ya + 0.95, zN + 0.07, 0.9, 0.05, 0.08, 'NSUD');
    }
    yy = ya + 1.5;
  }
  // ---- end walls ----
  // Each end wall has doorways that lead out of the building: at the east end of the corridor onto the stair tower's balconies
  // (storeys 2 to 4, builder stair-tower.js), in the west wall of the stair hall onto the spur of the elevated walkway (storey 3,
  // builder walkway.js). zdE, zdW: their centre lines; the openings are 1.0 m and 1.4 m wide and 2.1 m high, frames included.
  const zdE = D - 1.6, zdW = D - 2.6, eDoor = k => k >= 1 && k <= 3, wDoor = k => k === 2;
  const endWall = (xw, out, inMat, zd, hw, has) => {        // xw: low-x face of the wall; out: its outer face, 'E' or 'W'
    const inn = out === 'E' ? 'W' : 'E';
    const piece = (ya, yb, za, zb, ends = '') => { if (yb - ya < 0.001) return; F(v, W, xw, ya, za, WALL, yb - ya, zb - za, out + ends); F(v, inMat, xw, ya, za, WALL, yb - ya, zb - za, inn); hit(xw, ya, za, WALL, yb - ya, zb - za); };
    piece(0, yTop, zN, zd - hw, 'N'); piece(0, yTop, zd + hw, zS, 'S');
    let y = 0;
    for (let k = 0; k < FLOORS; k++) if (has(k)) {
      const yk = k * FH;
      piece(y, yk, zd - hw, zd + hw);                                                    // the wall between one doorway and the next
      for (const zz of [zd - hw, zd + hw - 0.05]) F(v, M.DFR, xw - 0.01, yk, zz, WALL + 0.02, 2.1, 0.05, 'NSEW');   // timber frame, as on the classroom doors
      F(v, M.DFR, xw - 0.01, yk + 2.05, zd - hw + 0.05, WALL + 0.02, 0.05, 2 * hw - 0.1, 'EWD');
      F(v, M.CB, xw - 0.01, yk, zd - hw + 0.05, WALL + 0.02, 0.02, 2 * hw - 0.1, 'UEW');                           // threshold: level with the corridor floor
      y = yk + 2.1;
    }
    piece(y, yTop, zd - hw, zd + hw);
  };
  endWall(INSET, 'W', PL, zdW, 0.7, wDoor); endWall(xEnd, 'E', CO, zdE, 0.5, eDoor);
  F(v, R, L - INSET, 0.2, zN + 1.0, 0.03, yTop - 0.6, 1.2, 'ENS'); F(v, R, INSET - 0.03, 0.2, zN + 1.0, 0.03, yTop - 0.6, 1.2, 'WNS');
  // ---- partitions between the rooms (full height) ----
  for (const xp of [x0, ...rooms.map(r => r.b)]) { F(v, PL, xp - 0.1, 0, zi, 0.2, yTop, zw - zi, 'EW'); hit(xp - 0.1, 0, zi, 0.2, yTop, zw - zi); }
  // ---- south side: columns, edge beams, balustrades ----
  const cols = [xW + 0.2, x0, x0 + bw, x0 + 2 * bw, x0 + 3 * bw, xB, ...[1, 2, 3, 4, 5].map(i => xB + i * be), xEnd - 0.2];
  for (const x of cols) { F(v, W, x - 0.2, 0, zS - 0.4, 0.4, yTop, 0.4, 'NSEW'); hit(x - 0.2, 0, zS - 0.4, 0.4, yTop, 0.4); }
  const bx = annex ? Math.max(xW, ax + aw) : xW, blen = xEnd - bx;                 // the balustrade starts east of the corner block
  for (let k = 1; k <= FLOORS; k++) {
    const y = k * FH, roofLevel = k === FLOORS;
    F(v, W, INSET, y - 0.65, zS - 0.25, L - 2 * INSET, roofLevel ? 0.35 : 0.65, 0.27, 'NSD');                                   // edge beam
    if (roofLevel) break;
    F(v, W, bx, y, zS - 0.12, blen, 0.9, 0.12, 'NSU'); F(v, R, bx, y + 0.2, zS, blen, 0.45, 0.012, 'S');
    if (wc) { hit(xW, y, zS - 0.12, xd0 - xW, 1.7, 0.12); hit(xd1, y, zS - 0.12, xEnd - xd1, 1.7, 0.12); }                       // (a gap only where the toilet entrance is, in front of the corner block)
    else hit(xW, y, zS - 0.12, xEnd - xW, 1.7, 0.12);                                                                           // collider taller than the visible 0.9 m balustrade: a jump cleared 1.1 m
  }
  // ---- floors, ceilings and the wall between classrooms and corridor ----
  const doorsOf = r => (r.kind === 'office' ? [[r.a + 0.6, 'W']] : [[r.a + 0.6, 'W'], [r.b - 1.6, 'E']]);   // [west jamb, hinge side]
  const winsOf = r => { const a = r.a + 2.1, b = r.kind === 'office' ? r.b - 1.0 : r.b - 2.1, m = (a + b) / 2; return b - a < 3.4 ? [[a, b]] : [[a, m - 0.7], [m + 0.7, b]]; };
  const ops = [];
  for (const r of rooms) { for (const [xd] of doorsOf(r)) ops.push([xd, xd + 1.0, 'door']); for (const [a, b] of winsOf(r)) ops.push([a, b, 'win']); }
  ops.push([xE + 0.15, xEnd, 'niche']); ops.sort((p, q) => p[0] - q[0]);
  const seg = (xa, xb, y0, h, faces) => {                                          // piece of the corridor wall: plaster inside, cream outside
    if (faces.includes('N')) F(v, PL, xa, y0, zw, xb - xa, h, 0.2, 'N');
    F(v, CO, xa, y0, zw, xb - xa, h, 0.2, faces.replace('N', '')); hit(xa, y0, zw, xb - xa, h, 0.2);
  };
  const TZ = M.TZ, CT = M.CT, CB = M.CB, cw = zS - 0.12 - zc;
  for (let k = 0; k < FLOORS; k++) {
    const y = k * FH;
    if (k > 0) {
      F(v, CE, x0, y - 0.15, zN, L - INSET - x0, 0.15, zS - zN, 'D'); hit(x0, y - 0.15, zN, L - INSET - x0, 0.15, zS - zN);
      F(v, CE, INSET, y - 0.15, zl, x0 - INSET, 0.15, zS - zl, 'D'); hit(INSET, y - 0.15, zl, x0 - INSET, 0.15, zS - zl);
    }
    F(v, TZ, x0 - 0.1, y, zi, xEnd - x0 + 0.1, 0.02, zc - zi, 'U');                                                            // classroom floor
    F(v, CT, xW, y, zc + 0.18, xEnd - xW, 0.02, cw - 0.36, 'U');                                                               // corridor: tiles with a border
    F(v, CB, xW, y, zc, xEnd - xW, 0.02, 0.18, 'U'); F(v, CB, xW, y, zc + cw - 0.18, xEnd - xW, 0.02, 0.18, 'U');
    if (bx > xW) F(v, CB, xW, y, zc + cw, bx - xW, 0.02, 0.12, 'U');
    F(v, CT, xW, y, k ? zl : zi, x0 - 0.1 - xW, 0.02, zc - (k ? zl : zi), 'U');                                                // stair landing / stair hall floor
    let x = x0 - 0.1;
    for (const [a, b, t] of ops) {
      seg(x, a, y, 2.6, 'NSEW');
      if (t === 'win') { seg(a, b, y, 1.3, 'NSU'); F(v, GL, a, y + 1.3, zw + 0.09, b - a, 1.3, 0.02, 'S'); F(v, M.glassIn, a, y + 1.3, zw + 0.09, b - a, 1.3, 0.02, 'N'); hit(a, y + 1.3, zw + 0.06, b - a, 1.3, 0.08); }
      else seg(a, b, y + 2.1, 0.5, 'NSD');
      x = b;
    }
    seg(x0 - 0.1, xEnd, y + 2.6, 1.15, 'NSD');
    // water niche in the east end pier: back wall and ceiling
    F(v, CO, xE + 0.1, y, zw - 0.66, xEnd - xE - 0.1, 2.1, 0.06, 'S'); F(v, CO, xE + 0.1, y + 2.1, zw - 0.6, xEnd - xE - 0.1, 0.05, 0.6, 'D'); hit(xE + 0.1, y, zw - 0.7, xEnd - xE - 0.1, 3.75, 0.1);
  }
  // ---- staircase: landings, guard, colliders (the visible flights are interior detail) ----
  hit(xb1, 0, zh, 0.2, yTop, run);                                                 // well between the flights: closed for the player
  for (let k = 0; k < FLOORS; k++) {
    const ym = k * FH + FH / 2;
    hit(sx0, ym - 0.15, zi, 2 * sw + 0.2, 0.15, zh - zi);
    if (k < FLOORS - 1) { F(v, CT, sx0, ym - 0.15, zi, 2 * sw + 0.2, 0.15, zh - zi, 'U'); F(v, CE, sx0, ym - 0.15, zi, 2 * sw + 0.2, 0.15, zh - zi, 'DS'); }
  }
  const yT4 = (FLOORS - 1) * FH;                                                   // top floor: guard over the void above the last flight A
  F(v, W, xb1, yT4, zl - 0.1, sw + 0.2, 1.05, 0.1, 'NSUW'); hit(xb1, yT4, zl - 0.1, sw + 0.2, 1.7, 0.1);
  // ---- roof ----
  F(v, M.ROOF, 0, yTop, 0, L, 0.3, D, 'U'); F(v, W, 0, yTop, 0, L, 0.3, D, 'NSEW'); F(v, CE, 0, yTop, 0, L, 0.3, D, 'D'); hit(0, yTop, 0, L, 0.3, D);
  const parapets = [[xB, 0, L - xB, 0.2, 1.2], [0, 0, xB, 1.2, 2.25], [0, D - 0.2, L, 0.2, 1.6], [0, 1.2, 0.2, D - 1.4, 1.2], [L - 0.2, 0.2, 0.2, D - 0.4, 1.2]];   // north: plain in the east, a wider and higher box on the western part
  for (const [x, z, sx, sz, h] of parapets) { F(v, W, x, roofY, z, sx, h, sz, 'NSEWU'); hit(x, roofY, z, sx, h, sz); }
  const zd = D * 0.56, units = [0.2, 0.33, 0.46, 0.6, 0.73, 0.86].map((f, i) => [f * L, D * (i % 2 ? 0.34 : 0.42)]);
  for (const [x, z] of units) {                                                    // pale units, each with a branch to the long duct
    F(v, RP, x - 1.1, roofY + 0.12, z - 0.7, 2.2, 0.8, 1.4, 'NSEWU'); F(v, DK, x - 1.0, roofY, z - 0.6, 2.0, 0.12, 1.2, 'NSEW');
    F(v, RP, x - 0.25, roofY + 0.1, z + 0.7, 0.5, 0.36, zd - z - 0.7, 'EWU');
  }
  F(v, RP, L * 0.14, roofY + 0.08, zd, L * 0.76, 0.42, 0.6, 'NSEWU');
  for (const f of [0.22, 0.27]) F(v, DK, 2, roofY, D * f, L - 4, 0.06, 0.07, 'NSU');                                            // conduits
  F(v, M.PINK, 1.5, roofY, D - 1.3, L - 3, 0.2, 0.8, 'NEWU');                                                                   // pale-red band along the south parapet
  F(v, M.KRED, 1, roofY + 0.5, D - 0.34, L - 2.1, 0.1, 0.1, 'NUD'); F(v, M.KRED, L - 1.2, roofY, D - 0.34, 0.1, 1.55, 0.1, 'NEW');   // red pipe and its riser
  F(v, W, 0.5, roofY, D - 4.0, 3.9, 2.5, 3.2, 'NSEW'); hit(0.5, roofY, D - 4.0, 3.9, 2.5, 3.2);                                 // roof pavilion
  F(v, W, 0.25, roofY + 2.5, D - 4.3, 4.5, 0.15, 3.8, 'NSEWUD'); F(v, DK, 4.4, roofY, D - 2.9, 0.02, 2.0, 0.9, 'E');
  // ---- block at the south-west corner: the toilets (or, where it is too small for them, plain and closed) ----
  if (annex && !wc) {
    F(v, W, ax, 0, zS, aw, yTop, ad, 'ESW'); F(v, CO, ax, 0, zS, aw, yTop, ad, 'N'); F(v, W, ax, yTop, D, aw, 1.5, ad - INSET, 'NESWU');
    hit(ax, 0, zS, aw, roofY + 1.2, ad);
    for (let k = 0; k < FLOORS; k++) F(v, M.GD, ax + aw * 0.25, k * FH + 1.6, zS + ad - 0.01, aw * 0.5, 0.7, 0.03, 'S');
  }
  const wcLights = [[xt0 + 0.3, xp[0] - 0.2], [xp[0] + 0.4, xp[1] - 0.3], [xp[1] + 0.4, xt1 - 0.3]];                               // high frosted windows in the south wall
  if (wc) {
    F(v, W, ax, 0, zS, aw, yTop, ad, 'ESW'); F(v, W, ax, yTop, D, aw, 1.5, ad - INSET, 'NESWU');                                 // outside
    F(v, M.WT, ax, 0, zS, T, yTop, ad, 'E'); F(v, M.WT, xt1, 0, zS, T, yTop, ad, 'W'); F(v, M.WT, ax, 0, zt1, aw, yTop, T, 'N');  // tiled inside
    F(v, CO, ax, 0, zS, xd0 - ax, yTop, T, 'N'); F(v, M.WT, ax, 0, zS, xd0 - ax, yTop, T, 'SE');                                 // wall to the corridor, either side of the entrance
    F(v, CO, xd1, 0, zS, ax + aw - xd1, yTop, T, 'N'); F(v, M.WT, xd1, 0, zS, ax + aw - xd1, yTop, T, 'SW');
    hit(ax, 0, zS, T, yTop, ad); hit(xt1, 0, zS, T, yTop, ad); hit(ax, 0, zt1, aw, yTop, T); hit(ax, 0, zS, xd0 - ax, yTop, T); hit(xd1, 0, zS, ax + aw - xd1, yTop, T);
    hit(ax, yTop, zS, aw, roofY + 1.2 - yTop, ad);
    for (const x of xp) {                                                          // inner walls with a doorway each
      F(v, M.WT, x, 0, zt0, 0.1, yTop, 0.5, 'EWS'); F(v, M.WT, x, 0, zt0 + 1.4, 0.1, yTop, zt1 - zt0 - 1.4, 'EWN');
      hit(x, 0, zt0, 0.1, yTop, 0.5); hit(x, 0, zt0 + 1.4, 0.1, yTop, zt1 - zt0 - 1.4);
    }
    for (let k = 0; k < FLOORS; k++) {
      const y = k * FH, hgt = ceilOf(k) - y;
      F(v, M.FT, xt0, y, zt0, aw - 2 * T, 0.02, ad - 2 * T, 'U'); F(v, M.FT, xd0, y, zS, xd1 - xd0, 0.02, T, 'U');
      F(v, CE, xt0, y + hgt, zt0, aw - 2 * T, 0.15, ad - 2 * T, 'D'); if (k) hit(ax, y - 0.15, zS, aw, 0.15, ad);
      F(v, CO, xd0, y + 2.1, zS, xd1 - xd0, hgt - 2.1, T, 'ND'); F(v, M.WT, xd0, y + 2.1, zS, xd1 - xd0, hgt - 2.1, T, 'S'); hit(xd0, y + 2.1, zS, xd1 - xd0, FH - 2.1, T);
      for (const x of xp) { F(v, M.WT, x, y + 2.1, zt0 + 0.5, 0.1, hgt - 2.1, 0.9, 'EWD'); hit(x, y + 2.1, zt0 + 0.5, 0.1, FH - 2.1, 0.9); }
      for (const [xa, xb] of wcLights) { F(v, M.GD, xa, y + 1.7, zS + ad - 0.01, xb - xa, 0.7, 0.03, 'S'); F(v, M.FROST, xa, y + 1.7, zt1 - 0.012, xb - xa, 0.7, 0.012, 'N'); }
    }
  }

  // ================= CORRIDOR AND FACADE FITTINGS (middle range) =================
  const eastWC = !wc;                                                              // without a toilet block the two doors at the east end of the corridor are the (closed) toilets; with one they are store cupboards
  cols.forEach((x, i) => {                                                         // rainwater pipes on the south face, with collars
    if (i % 2 !== 1 && i !== cols.length - 1) return;
    ex.cyl(PV, x, 0, zS + 0.07, 0.055, yTop, 8, false); for (let yy = 1.4; yy < yTop; yy += FH / 2) ex.cyl(PV, x, yy, zS + 0.07, 0.068, 0.05, 8, false);
  });
  F(ex, M.GRAT, bx, 0.022, zS + 0.03, blen, 0.012, 0.26, 'U');                     // ground level: a drain grating along the open side
  for (let k = 0; k < FLOORS; k++) {
    const y = k * FH, cy = ceilOf(k), zl0 = zc + cw / 2;
    if (k > 0) {                                                                   // coping, stainless handrail on posts, drainage channel with spouts
      F(ex, COP, bx, y + 0.9, zS - 0.17, blen, 0.045, 0.2, 'NSUD');
      tube(ex, SS, [bx, y + 1.08, zS - 0.06], [xEnd, y + 1.08, zS - 0.06], 0.024);
      for (let x = bx + 0.3; x < xEnd - 0.1; x += low ? 2.4 : 1.2) ex.cyl(SS, x, y + 0.945, zS - 0.06, 0.012, 0.125, 5, false);
      F(ex, M.GRAT, bx, y + 0.021, zS - 0.3, blen, 0.004, 0.18, 'U');
      bays.forEach((b, i) => {
        const xc = (b.a + b.b) / 2; if (xc < bx + 0.5) return;
        ex.cyl(SS, xc + 0.8, y + 0.022, zS - 0.21, 0.05, 0.005, 10); tube(ex, PV, [xc + 0.8, y + 0.07, zS - 0.01], [xc + 0.8, y + 0.04, zS + 0.15], 0.022, 6, true);
        if (i % 2 === 0 && !b.narrow) {                                            // planter trough at the foot of the balustrade
          F(ex, M.POT, xc - 0.55, y + 0.02, zS - 0.54, 1.1, 0.24, 0.22, 'NSEWU'); F(ex, M.SOIL, xc - 0.52, y + 0.262, zS - 0.52, 1.04, 0.004, 0.18, 'U');
          for (const dx of low ? [0] : [-0.34, 0, 0.34]) plant(plantsOut, xc + dx, y + 0.2, zS - 0.43, 1.15 + 0.4 * rnd(), rnd() < 0.3, false);
        }
      });
    }
    for (const x of cols.slice(1, -1)) F(ex, CE, x - 0.12, cy - 0.4, zc, 0.24, 0.4, zS - 0.25 - zc, 'EWD');                      // beams across the corridor, painted like the ceiling
    for (const xl of [(xW + x0) / 2, ...bays.map(b => (b.a + b.b) / 2)]) { ex.cyl(WH, xl, cy - 0.06, zl0, 0.2, 0.06, 12); ex.cyl(LAMP, xl, cy - 0.076, zl0, 0.165, 0.016, 12); }   // ceiling lamps
    // glazed-tile dado on the corridor side and the painted one inside, between the door openings
    let xs = x0 - 0.1;
    for (const [a, b, t] of ops) if (t !== 'win') {
      F(ex, M.CTILE, xs, y + 0.02, zc, a - xs, 1.2, 0.01, 'S'); F(ex, DAL, xs, y + 1.22, zc, a - xs, 0.03, 0.014, 'SUD');
      const xi = Math.max(xs, x0 + 0.1); F(fu, DA, xi, y + 0.02, zw - 0.008, a - xi, 0.95, 0.008, 'N'); F(fu, DAL, xi, y + 0.97, zw - 0.012, a - xi, 0.025, 0.012, 'NUD');
      xs = b;
    }
    for (const r of rooms) {
      const wl = winsOf(r);
      for (const [a, b] of wl) {                                                   // sliding-window frames and a sill
        for (const yy of [y + 1.3, y + 2.55]) F(ex, MW, a, yy, zw + 0.06, b - a, 0.05, 0.08, 'NSUD');
        for (const xx of [a, (a + b) / 2 - 0.025, b - 0.05]) F(ex, MW, xx, y + 1.35, zw + 0.06, 0.05, 1.2, 0.08, 'NSEW');
        F(ex, COP, a - 0.03, y + 1.275, zc, b - a + 0.06, 0.03, 0.05, 'SEWUD');
      }
      {                                                                            // air-conditioner: outdoor unit above the first window, indoor unit behind it
        const xm = (wl[0][0] + wl[0][1]) / 2;
        F(ex, WH, xm - 0.4, y + 2.75, zc, 0.8, 0.52, 0.3, 'SEWD'); F(ex, DK, xm - 0.3, y + 2.8, zc + 0.3, 0.42, 0.42, 0.006, 'S');
        for (const s of [-0.3, 0.27]) F(ex, AL, xm + s, y + 2.71, zc, 0.03, 0.04, 0.32, 'EWD');
        F(ex, PV, xm + 0.3, y + 3.27, zc, 0.06, cy - y - 3.27, 0.05, 'SEW');                                                    // pipe cover up to the ceiling
        F(fu, WH, xm - 0.45, y + 2.76, zw - 0.21, 0.9, 0.29, 0.21, 'NEWUD'); F(fu, DK, xm - 0.4, y + 2.775, zw - 0.214, 0.8, 0.03, 0.006, 'N');
      }
      for (const [xd] of doorsOf(r)) {                                             // blank plates: one projecting above each door, one on the wall beside it
        F(ex, M.PLT, xd + 1.12, y + 2.22, zc, 0.02, 0.16, 0.36, 'EWSUD'); F(ex, WH, xd + 1.1, y + 1.5, zc, 0.2, 0.28, 0.012, 'SEWUD'); F(ex, AL, xd + 1.09, y + 1.49, zc, 0.22, 0.3, 0.006, 'SEWUD');
      }
      if (wl.length === 2) {                                                       // blank pin board between the two windows
        const xm = (wl[0][1] + wl[1][0]) / 2;
        F(ex, M.CORK, xm - 0.55, y + 1.3, zc, 1.1, 1.0, 0.02, 'S'); F(ex, AL, xm - 0.59, y + 1.26, zc, 1.18, 1.08, 0.014, 'SEWUD');
        if (!low) [['SHA', -0.4, 0.55], ['SHB', -0.05, 0.5], ['SHC', 0.2, 0.12], ['SHA', -0.35, 0.1]].forEach(([m, dx, dy]) => F(fx, M[m], xm + dx, y + 1.35 + dy, zc + 0.02, 0.21, 0.3, 0.004, 'S'));
      }
    }
    // bins, hose cabinet with two extinguishers and an alarm bell, hot-water dispensers in the niche, closed doors at the east end
    for (const xp of [x0 + 2 * bw, xB + 2 * be]) [[M.BINA, -0.27], [M.BINB, 0.27]].forEach(([m, dx]) => { ex.cyl(m, xp + dx, y + 0.02, zc + 0.26, 0.2, 0.6, 10); ex.cyl(DK, xp + dx, y + 0.62, zc + 0.26, 0.21, 0.03, 10); });
    F(ex, RED, xB - 0.2, y + 0.85, zc, 0.7, 0.95, 0.07, 'SEWUD'); F(ex, M.GLOSS, xB - 0.14, y + 0.91, zc + 0.07, 0.58, 0.83, 0.004, 'S'); F(ex, AL, xB + 0.4, y + 1.25, zc + 0.074, 0.025, 0.12, 0.012, 'SEWUD');
    F(ex, RED, xB + 0.1, y + 2.05, zc, 0.1, 0.1, 0.03, 'SEWUD'); tube(ex, RED, [xB - 0.05, y + 2.1, zc], [xB - 0.05, y + 2.1, zc + 0.06], 0.07, 10, true);
    for (const dx of [-0.42, -0.6]) { ex.cyl(RED, xB + dx, y + 0.02, zc + 0.11, 0.07, 0.42, 8); ex.cyl(DK, xB + dx, y + 0.44, zc + 0.11, 0.025, 0.1, 6); }
    for (const dx of [0.22, 0.72]) {
      F(ex, SS, xE + dx, y + 0.02, zw - 0.55, 0.42, 1.25, 0.38, 'SEWU'); F(ex, M.GLOSS, xE + dx + 0.06, y + 0.74, zw - 0.17, 0.3, 0.3, 0.004, 'S');
      F(ex, AL, xE + dx + 0.04, y + 0.7, zw - 0.17, 0.34, 0.03, 0.1, 'SEWUD');
      if (!low) for (const tx of [0.12, 0.26]) F(fx, AL, xE + dx + tx, y + 0.84, zw - 0.17, 0.03, 0.06, 0.05, 'SEWUD');
    }
    if (eDoor(k)) {                                                                // the doorway to the stair tower's balcony: two leaves folded back against the wall, an exit pictogram
      for (const [z0, len] of [[zdE - 0.96, 0.45], [zdE + 0.51, 0.4]]) {
        F(ex, M.door, xEnd - 0.045, y + 0.02, z0, 0.04, 2.03, len, 'WNSU'); F(ex, AL, xEnd - 0.049, y + 0.02, z0, 0.004, 0.22, len, 'W'); F(fx, AL, xEnd - 0.1, y + 1.0, z0 + len / 2 - 0.05, 0.055, 0.03, 0.1, 'WNSUD');
      }
      quadW(ex, M.EXIT, xEnd - 0.006, y + 2.2, y + 2.35, zdE - 0.2, zdE + 0.2);
    } else [zc + 0.2, zc + 1.4].forEach((z0, i) => {
      F(ex, M.door, xEnd - 0.03, y + 0.02, z0, 0.03, 2.05, 0.85, 'WNSU'); F(ex, M.DFR, xEnd - 0.05, y, z0 - 0.06, 0.05, 2.13, 0.06, 'WNS'); F(ex, M.DFR, xEnd - 0.05, y, z0 + 0.85, 0.05, 2.13, 0.06, 'WNS');
      F(ex, M.DFR, xEnd - 0.05, y + 2.07, z0, 0.05, 0.06, 0.85, 'WD'); F(ex, AL, xEnd - 0.034, y + 0.02, z0, 0.004, 0.22, 0.85, 'W');
      if (!eastWC) F(ex, i ? M.PLTR : M.PLT, xEnd - 0.012, y + 2.2, z0 + 0.3, 0.012, 0.14, 0.25, 'WNSUD');
      F(fx, AL, xEnd - 0.08, y + 1.0, z0 + (i ? 0.08 : 0.67), 0.05, 0.03, 0.1, 'WNSUD');
    });
    if (eastWC && !eDoor(k)) quadW(ex, M.WC, xEnd - 0.006, y + 2.2, y + 2.45, zc + 0.975, zc + 1.475);
    if (wDoor(k)) {                                                                // the doorway to the walkway's spur, in the west wall of the stair hall
      for (const [z0, len] of [[zdW - 1.36, 0.65], [zdW + 0.71, 0.65]]) {
        F(ex, M.door, xW + 0.005, y + 0.02, z0, 0.04, 2.03, len, 'ENSU'); F(ex, AL, xW + 0.045, y + 0.02, z0, 0.004, 0.22, len, 'E'); F(fx, AL, xW + 0.045, y + 1.0, z0 + len / 2 - 0.05, 0.055, 0.03, 0.1, 'ENSUD');
      }
      quadE(ex, M.EXIT, xW + 0.006, y + 2.2, y + 2.35, zdW - 0.2, zdW + 0.2);
    }
    F(ex, M.PLT, x0 - 0.115, y + 1.55, zl + 0.4, 0.015, 0.3, 0.3, 'WNSUD');                                                      // blank floor plate facing the stairs
    // exit sign hanging before the stair hall
    F(ex, DK, x0 - 0.42, cy - 0.63, zl0 - 0.22, 0.04, 0.19, 0.44, 'NSEWUD'); quadE(ex, M.EXIT, x0 - 0.378, cy - 0.61, cy - 0.46, zl0 - 0.2, zl0 + 0.2);
    for (const dz of [-0.17, 0.17]) F(ex, AL, x0 - 0.405, cy - 0.44, zl0 + dz, 0.01, 0.44, 0.01, 'NSEW');
    if (wc) {                                                                      // toilet entrance: steel trim, pictograms above, tiled dado beside it
      for (const xx of [xd0 - 0.05, xd1]) F(ex, AL, xx, y, zS - 0.012, 0.05, 2.15, 0.012, 'NEW'); F(ex, AL, xd0 - 0.05, y + 2.1, zS - 0.012, xd1 - xd0 + 0.1, 0.05, 0.012, 'NUD');
      quadN(ex, M.WC, zS - 0.004, y + 2.22, y + 2.47, (xd0 + xd1) / 2 - 0.25, (xd0 + xd1) / 2 + 0.25);
      F(ex, M.CTILE, xW + 0.4, y + 0.02, zS - 0.01, xd0 - 0.05 - xW - 0.4, 1.2, 0.01, 'N'); F(ex, DAL, xW + 0.4, y + 1.22, zS - 0.014, xd0 - 0.05 - xW - 0.4, 0.03, 0.014, 'NUD');
    }
    if (k === 0) for (const b of bays) if (!b.narrow) LIT.push([bar.w + (b.a + b.b) / 2, bar.n + zl0, 2.4]);
    // wash trough against the corner block: tiled, four taps, a mirror
    const tx0 = x0 + 0.35, tx1 = Math.min(ax + aw, x0 + bw - 0.2) - 0.3, tw = tx1 - tx0;
    if (annex && tw > 1.2) {
      F(ex, M.WT, tx0, y + 0.02, zS - 0.5, tw, 0.8, 0.06, 'NSEWU'); for (const xx of [tx0, tx1 - 0.06]) F(ex, M.WT, xx, y + 0.02, zS - 0.44, 0.06, 0.8, 0.44, 'EWU');
      F(ex, M.WT, tx0 + 0.06, y + 0.58, zS - 0.44, tw - 0.12, 0.02, 0.44, 'U'); F(ex, M.WT, tx0, y + 0.82, zS - 0.012, tw, 0.3, 0.012, 'N');
      F(ex, M.MIRROR, tx0 + 0.1, y + 1.2, zS - 0.014, tw - 0.2, 0.6, 0.008, 'N'); F(ex, AL, tx0 + 0.07, y + 1.17, zS - 0.008, tw - 0.14, 0.66, 0.008, 'NEWUD');
      const n = Math.max(2, Math.round(tw / 0.6));
      for (let i = 0; i < n; i++) { const xt = tx0 + tw * (i + 0.5) / n; ex.cyl(SS, xt, y + 0.82, zS - 0.07, 0.012, 0.13, 6); tube(ex, SS, [xt, y + 0.94, zS - 0.07], [xt, y + 0.92, zS - 0.2], 0.01, 6, true); }
    }
  }
  // ---- north face at close range: sills, slid sashes, condensers on brackets with their drain stacks, rainwater downpipes ----
  for (let k = 0; k < FLOORS; k++) for (const b of bays) F(ex, COP, b.a + 0.22, k * FH + 0.925, zN - 0.1, b.b - b.a - 0.44, 0.045, 0.11, 'NEWUD');
  for (const [x, lw, y] of openLights) {
    for (const xx of [x + 0.01, x + lw - 0.045]) F(ex, MW, xx, y + 0.95, zN + 0.15, 0.035, 1.6, 0.03, 'NSEW');
    for (const yy of [y + 0.95, y + 2.485]) F(ex, MW, x + 0.01, yy, zN + 0.15, lw - 0.02, 0.035, 0.03, 'NSUD');
  }
  for (const r of rooms) if (r.kind === 'class') {
    const xs = r.b - 0.15, xc = r.b - 1.25;                                        // drain stack on the pier, condenser beside it
    ex.cyl(PV, xs, 0.12, zN - 0.09, 0.02, (FLOORS - 1) * FH + headOf(FLOORS - 1), 6, false);
    for (let k = 0; k < FLOORS; k++) {
      const yb = k * FH + headOf(k) + 0.03;
      F(ex, WH, xc - 0.4, yb + 0.03, zN - 0.44, 0.8, 0.5, 0.3, 'NSEWUD'); F(ex, DK, xc - 0.33, yb + 0.07, zN - 0.444, 0.42, 0.42, 0.004, 'N'); F(ex, DK, xc + 0.16, yb + 0.1, zN - 0.444, 0.16, 0.34, 0.004, 'N');
      for (const s of [-0.3, 0.27]) { F(ex, AL, xc + s, yb, zN - 0.46, 0.03, 0.03, 0.4, 'EWUD'); stick(ex, AL, [xc + s + 0.015, yb, zN - 0.44], [xc + s + 0.015, yb - 0.3, zN - 0.06], 0.02); }
      tube(ex, PV, [xc + 0.4, yb + 0.1, zN - 0.2], [xs, yb + 0.06, zN - 0.2], 0.014, 5); tube(ex, PV, [xs, yb + 0.06, zN - 0.2], [xs, yb + 0.02, zN - 0.09], 0.014, 5);
    }
  }
  for (const xp of [x0 + 0.13, xB - 0.2, xB + 2 * be + 0.13, xB + 4 * be + 0.13, xE - 0.12]) {
    ex.cyl(PV, xp, 0.1, zN - 0.13, 0.055, roofY - 0.25, 8, false); F(ex, PV, xp - 0.11, roofY - 0.2, zN - 0.24, 0.22, 0.2, 0.2, 'NEWD');
    for (let yy = 1.5; yy < roofY - 1; yy += FH / 2) ex.cyl(PV, xp, yy, zN - 0.13, 0.068, 0.05, 8, false);
  }
  // ---- end walls: dark base course, storey joints, a downpipe ----
  for (const [xf, face] of [[INSET - 0.012, 'W'], [L - INSET, 'E']]) {
    F(ex, M.BASE, xf, 0, zN, 0.012, 0.95, zS - zN, face + 'NSU');
    for (let k = 1; k < FLOORS; k++) F(ex, DK, xf + (face === 'W' ? 0.008 : 0), k * FH - 0.02, zN, 0.004, 0.02, zS - zN, face);
  }
  ex.cyl(PV, INSET - 0.08, 0.1, zS - 0.9, 0.055, yTop - 0.2, 8, false);
  if (annex) {
    F(ex, M.BASE, ax - 0.012, 0, zS, 0.012, 0.95, ad, 'WNSU'); F(ex, M.BASE, ax, 0, zS + ad, aw, 0.95, 0.012, 'SEWU'); F(ex, M.BASE, ax + aw, 0, zS, 0.012, 0.95, ad, 'ENSU');
    if (wc) for (let k = 0; k < FLOORS; k++) for (const [xa, xb] of wcLights) { F(ex, COP, xa - 0.04, k * FH + 1.665, zS + ad, xb - xa + 0.08, 0.035, 0.08, 'SEWUD'); for (let xx = xa + 0.6; xx < xb - 0.3; xx += 0.6) F(ex, MW, xx, k * FH + 1.7, zS + ad + 0.02, 0.04, 0.7, 0.012, 'SEW'); }
    ex.cyl(PV, ax + aw - 0.5, 0.1, zS + ad + 0.07, 0.055, yTop, 8, false);
  }
  // ---- ground: planting strip along the north face, bicycles in the corner by the south-west block ----
  const shrubList = [];
  {
    const z0 = -1.3, z1 = zN - 0.07, list = [];
    F(ex, M.KERB, 0.3, 0, z0 - 0.12, L - 0.6, 0.15, 0.12, 'NSEWU'); for (const xx of [0.3, L - 0.42]) F(ex, M.KERB, xx, 0, z0, 0.12, 0.15, z1 - z0, 'EWU');
    F(ex, M.BED, 0.42, 0, z0, L - 0.84, 0.09, z1 - z0, 'U');
    for (let x = 1.3; x < L - 1; x += low ? 3.4 : 1.7) list.push([bar.w + x + (rnd() - 0.5) * 0.4, bar.n + (z0 + z1) / 2 - 0.1 + (rnd() - 0.5) * 0.3, 0.42 + 0.2 * rnd()]);
    for (let x = 2.15; x < L - 1.5 && !low; x += 3.4) list.push([bar.w + x, bar.n + z1 - 0.25, 0.24 + 0.08 * rnd()]);
    shrubList.push(...list);
  }
  const bikes = [];
  if (annex) {
    const xr = ax + aw + 0.12, n = Math.min(7, Math.floor((ad - 1.0) / 0.6));
    for (let i = 0; i < n; i++) {                                                  // hoops to lean and lock a bicycle against
      const z = zS + 0.75 + i * 0.6;
      for (const xx of [xr + 0.25, xr + 0.85]) ex.cyl(SS, xx, 0, z - 0.2, 0.016, 0.75, 6, false);
      tube(ex, SS, [xr + 0.25, 0.75, z - 0.2], [xr + 0.85, 0.75, z - 0.2], 0.016, 6);
      if (rnd() < (low ? 0.4 : 0.72)) bikes.push([xr + 0.95 + rnd() * 0.12, 0, z + 0.02, (i % 2 ? Math.PI : 0) + (rnd() - 0.5) * 0.12, rnd()]);
    }
  }
  // ---- roof at close range ----
  for (const [x, z, sx, sz, h] of parapets) F(ex, COP, x - 0.03, roofY + h, z - 0.03, sx + 0.06, 0.05, sz + 0.06, 'NSEWUD');      // copings
  {
    const strip = (xa, za, xb, zb, yy) => {                                        // lightning strip on stand-offs
      stick(ex, AL, [xa, yy + 0.13, za], [xb, yy + 0.13, zb], 0.014);
      const n = Math.max(2, Math.round(Math.hypot(xb - xa, zb - za) / 1.6)); for (let i = 0; i <= n; i++) F(ex, AL, xa + (xb - xa) * i / n - 0.006, yy + 0.05, za + (zb - za) * i / n - 0.006, 0.012, 0.08, 0.012, 'NSEW');
    };
    strip(0.1, D - 0.1, L - 0.1, D - 0.1, roofY + 1.6); strip(xB, 0.1, L - 0.1, 0.1, roofY + 1.2); strip(L - 0.1, 0.1, L - 0.1, D - 0.1, roofY + 1.2); strip(0.1, 0.6, xB, 0.6, roofY + 2.25);
    for (const [x, z, yy] of [[0.1, D - 0.1, 1.6], [L - 0.1, D - 0.1, 1.6], [L - 0.1, 0.1, 1.2], [0.1, 0.6, 2.25], [L / 2, D - 0.1, 1.6]]) ex.cyl(AL, x, roofY + yy + 0.05, z, 0.008, 0.6, 5, false);
    for (const [x, z] of units) { for (const dx of [-0.5, 0.5]) { ex.cyl(DK, x + dx, roofY + 0.92, z, 0.4, 0.03, 14); ex.cyl(AL, x + dx, roofY + 0.92, z, 0.1, 0.045, 8); } F(ex, DK, x - 0.9, roofY + 0.3, z - 0.704, 1.8, 0.4, 0.004, 'N'); }   // fan grilles and a louvre on the units
    // stainless water tanks on a steel stand
    for (const tz of [D * 0.28, D * 0.48]) {
      const txc = 2.3; ex.cyl(SS, txc, roofY + 0.45, tz, 0.8, 1.5, 20, false); ex.cyl(SS, txc, roofY + 1.95, tz, 0.82, 0.04, 20); ex.cyl(SS, txc, roofY + 1.99, tz, 0.3, 0.08, 12);
      for (const yy of [0.8, 1.2, 1.6]) ex.cyl(SS, txc, roofY + yy, tz, 0.81, 0.03, 20, false);
      F(ex, M.GRAT, txc - 0.85, roofY + 0.36, tz - 0.85, 1.7, 0.09, 1.7, 'NSEWUD'); for (const dx of [-0.75, 0.75]) for (const dz of [-0.75, 0.75]) F(ex, M.GRAT, txc + dx - 0.04, roofY, tz + dz - 0.04, 0.08, 0.36, 0.08, 'NSEW');
      tube(ex, PV, [txc + 0.8, roofY + 0.6, tz], [txc + 1.5, roofY + 0.1, tz], 0.03, 6);
    }
    // solar water heaters: a rack of dark tubes under a horizontal tank
    const hz = zd + 0.85;
    for (let i = 0; i < (low ? 3 : 6); i++) {
      const hx = L * 0.2 + i * 2.7; if (hx > L - 4) break;
      tube(ex, SS, [hx - 0.95, roofY + 1.25, hz + 0.15], [hx + 0.95, roofY + 1.25, hz + 0.15], 0.2, 12, true);
      for (const dx of [-0.85, 0.85]) { F(ex, AL, hx + dx - 0.02, roofY, hz + 0.13, 0.04, 1.05, 0.04, 'NSEW'); stick(ex, AL, [hx + dx, roofY + 1.08, hz + 0.2], [hx + dx, roofY + 0.12, hz + 1.5], 0.035); F(ex, AL, hx + dx - 0.02, roofY, hz + 1.46, 0.04, 0.14, 0.04, 'NSEW'); }
      for (let t = -0.8; t <= 0.81; t += low ? 0.32 : 0.16) tube(ex, M.SOLAR, [hx + t, roofY + 1.1, hz + 0.24], [hx + t, roofY + 0.17, hz + 1.5], 0.024, 5);
      F(ex, AL, hx - 0.9, roofY + 0.12, hz + 1.47, 1.8, 0.05, 0.06, 'NSEWU');
    }
    // paved walkway from the pavilion door, vents, the pavilion door and its lamp, pipe supports
    const wz = Math.max(D - 2.85, zd + 2.45);
    F(ex, M.WALK, 4.45, roofY, wz, L - 7, 0.04, 0.75, 'NSEWU');
    for (const f of [0.3, 0.52, 0.66, 0.9]) { ex.cyl(PV, L * f, roofY, D * 0.13, 0.055, 0.7, 8, false); ex.cyl(PV, L * f, roofY + 0.7, D * 0.13, 0.1, 0.06, 8); }
    F(ex, M.CON, 4.4, roofY + 0.02, D - 2.86, 0.03, 1.98, 0.82, 'ENSU'); F(ex, AL, 4.43, roofY + 1.0, D - 2.2, 0.04, 0.03, 0.1, 'ENSUD'); F(ex, LAMP, 4.4, roofY + 2.15, D - 2.55, 0.06, 0.1, 0.2, 'ENSUD');
    for (let x = 3; x < L - 2; x += 4) F(ex, M.GRAT, x - 0.03, roofY + 0.2, D - 0.36, 0.06, 0.3, 0.14, 'NEW');
    tube(ex, M.KRED, [L * 0.5, roofY + 0.55, D - 0.29], [L * 0.5, roofY + 0.55, D - 0.5], 0.03, 6, true); ex.cyl(M.KRED, L * 0.5, roofY + 0.47, D - 0.52, 0.09, 0.02, 10);
  }

  // ================= INTERIORS (near range) =================
  const fan = (x, z, cy) => { F(fu, AL, x - 0.012, cy - 0.55, z - 0.012, 0.024, 0.55, 0.024, 'NSEW'); fans.push([x, cy - 0.61, z, rnd() < 0.3 ? 0 : 3.5 + 2.5 * rnd(), rnd() * 6.283]); };
  const light = (x, z, cy, len = 1.2) => {                                         // hanging twin-tube fitting, long axis east-west
    F(fu, WH, x - len / 2, cy - 0.5, z - 0.1, len, 0.05, 0.2, 'NSEWU'); F(fu, LAMP, x - len / 2, cy - 0.51, z - 0.08, len, 0.012, 0.16, 'D');
    if (!low) for (const s of [-0.4, 0.4]) F(fu, AL, x + s * len - 0.006, cy - 0.45, z - 0.006, 0.012, 0.45, 0.012, 'NSEW');
  };
  const drapes = (r, y, head) => {                                                 // curtains on a track, some gathered at the side, some half drawn; a stone sill
    for (const b of bays) if (b.a > r.a - 0.01 && b.b < r.b + 0.01) {
      const wa = b.a + 0.25, ww = b.b - b.a - 0.5, pick = () => [0.42, 0.42, 0.84, 1.26][Math.floor(rnd() * 4)];
      F(fu, AL, wa, y + head + 0.01, zi + 0.04, ww, 0.025, 0.04, 'SD'); F(fu, COP, wa, y + 0.95, zN + 0.13, ww, 0.022, zi - zN - 0.11, 'USEW');
      const wl = b.narrow ? 0.42 : pick(), wr = pick();
      F(fu, M.DRAPE, wa + 0.02, y + 0.9, zi + 0.035, wl, head - 0.88, 0.05, 'NSEW'); if (!b.narrow) F(fu, M.DRAPE, wa + ww - 0.02 - wr, y + 0.9, zi + 0.035, wr, head - 0.88, 0.05, 'NSEW');
    }
  };
  const leaf = (xd, side, y) => {                                                  // open door leaf, frame, vision light, closer, handle
    const xl = side === 'W' ? xd + 0.05 : xd + 0.905, DL = M.door, DFR = M.DFR;
    for (const xx of [xd, xd + 0.95]) F(fu, DFR, xx, y, zw - 0.02, 0.05, 2.1, 0.24, 'NSEW'); F(fu, DFR, xd, y + 2.05, zw - 0.02, 1.0, 0.05, 0.24, 'NSD');
    F(fu, DL, xl, y + 0.02, zw - 0.97, 0.045, 1.13, 0.95, 'EWN'); F(fu, DL, xl, y + 1.85, zw - 0.97, 0.045, 0.22, 0.95, 'EWNU');
    F(fu, DL, xl, y + 1.15, zw - 0.97, 0.045, 0.7, 0.12, 'EWNS'); F(fu, DL, xl, y + 1.15, zw - 0.6, 0.045, 0.7, 0.58, 'EWN');
    F(fu, M.glassIn, xl + 0.015, y + 1.15, zw - 0.85, 0.012, 0.7, 0.25, 'EW');
    F(fx, AL, xl - 0.003, y + 0.02, zw - 0.97, 0.051, 0.22, 0.95, 'EW');                                                        // kick plate
    F(fx, AL, xl - 0.03, y + 1.0, zw - 0.93, 0.105, 0.03, 0.12, 'EWNSUD');                                                      // lever handles
    F(fx, DK, xl + (side === 'W' ? 0.045 : -0.05), y + 1.98, zw - 0.3, 0.05, 0.06, 0.24, 'EWNSD');                              // closer body
    F(fx, AL, xl + (side === 'W' ? 0.06 : -0.3), y + 2.04, zw - 0.045, 0.285, 0.012, 0.025, 'NSUD');                            // closer arm
  };
  const dadoWalls = (r, y) => {                                                    // glossy dado with a line on the side walls and the piers; ceiling beams
    for (const [xx, face] of [[r.a + 0.1, 'E'], [r.b - 0.108, 'W']]) { F(fu, DA, xx, y + 0.02, zi, 0.008, 0.95, zw - zi, face); F(fu, DAL, xx - (face === 'W' ? 0.004 : 0), y + 0.97, zi, 0.012, 0.025, zw - zi, face + 'UD'); }
    for (const xl of [...bays.map(b => b.a), xE]) if (xl > r.a - 0.01 && xl < r.b + 0.01) { const pa = Math.max(xl - 0.38, r.a + 0.1), pb = Math.min(xl + 0.38, r.b - 0.1); F(fu, DA, pa, y + 0.02, zi, pb - pa, 0.95, 0.012, 'S'); F(fu, DAL, pa, y + 0.97, zi, pb - pa, 0.025, 0.016, 'SUD'); }
    for (const b of bays) if (b.a > r.a + 0.01 && b.a < r.b - 0.01) F(fu, PL, b.a - 0.125, ceilOf(Math.round(y / FH)) - 0.45, zi, 0.25, 0.45, zw - zi, 'EWD');
  };
  const dispenser = (x, y, z) => {                                                 // bottled-water dispenser
    F(fu, WH, x, y + 0.02, z, 0.32, 0.95, 0.32, 'NSEWU'); fu.cyl(M.BLUE, x + 0.16, y + 0.97, z + 0.16, 0.13, 0.3, 10); fu.cyl(M.BLUE, x + 0.16, y + 1.27, z + 0.16, 0.05, 0.05, 8);
    F(fx, DK, x + 0.325, y + 0.6, z + 0.06, 0.004, 0.14, 0.2, 'E'); for (const dz of [0.1, 0.2]) F(fx, i2c(dz), x + 0.32, y + 0.76, z + dz - 0.012, 0.03, 0.04, 0.024, 'ENSUD');
  };
  const i2c = dz => (dz < 0.15 ? RED : M.PLT);
  const covers = [0x2f5f9e, 0xb8322a, 0x3d8a55, 0xd9a520, 0xe9e2cf, 0x6b4e8a, 0x2a8a96], bagCols = [0x2c3d5c, 0x2b2d31, 0x9c3a34, 0x2f7a7e, 0xcf8597, 0x6a6f76, 0x5b4b86, 0x3568a8, 0x4d7a4a];

  function classroom(r, y, k) {
    const xa = r.a + 0.1, xb = r.b - 0.1, len = xb - xa, cy = ceilOf(k), head = headOf(k);
    dadoWalls(r, y); drapes(r, y, head);
    // front (east): timber platform, console with a monitor, chalkboard with its tray, screen housing, board lamps, loudspeakers
    F(fu, M.DAIS, xb - 1.3, y + 0.02, zmid - 2.6, 1.3, 0.15, 5.2, 'UWNS'); F(fu, AL, xb - 1.31, y + 0.14, zmid - 2.6, 0.012, 0.032, 5.2, 'UW');
    F(fu, M.CON, xb - 1.0, y + 0.17, zmid - 2.5, 0.6, 0.86, 1.0, 'NSEW'); F(fu, DK, xb - 1.03, y + 1.03, zmid - 2.53, 0.66, 0.03, 1.06, 'NSEWUD');
    F(fu, DK, xb - 0.9, y + 1.14, zmid - 2.1, 0.5, 0.32, 0.03, 'NEWUD'); F(fu, M.GLOSS, xb - 0.88, y + 1.16, zmid - 2.071, 0.46, 0.28, 0.003, 'S'); F(fu, DK, xb - 0.68, y + 1.06, zmid - 2.11, 0.06, 0.09, 0.05, 'NSEW');
    F(fu, M.BOARD, xb - 0.03, y + 0.95, zmid - 2.1, 0.03, 1.25, 4.2, 'W');
    for (const yy of [y + 0.91, y + 2.2]) F(fu, AL, xb - 0.045, yy, zmid - 2.14, 0.045, 0.04, 4.28, 'WUD');
    for (const zz of [zmid - 2.14, zmid + 2.1]) F(fu, AL, xb - 0.045, y + 0.95, zz, 0.045, 1.25, 0.04, 'WNS');
    F(fu, AL, xb - 0.13, y + 0.885, zmid - 2.1, 0.13, 0.02, 4.2, 'WUDNS'); F(fu, AL, xb - 0.13, y + 0.905, zmid - 2.1, 0.01, 0.018, 4.2, 'WEU');
    F(fu, WH, xb - 0.11, y + 2.5, zmid - 1.35, 0.11, 0.11, 2.7, 'WUDNS'); F(fu, WH, xb - 0.07, y + 2.22, zmid - 1.3, 0.008, 0.28, 2.6, 'W'); F(fu, DK, xb - 0.078, y + 2.2, zmid - 1.3, 0.02, 0.025, 2.6, 'WUD');
    for (const dz of [-1.1, 1.1]) { F(fu, WH, xb - 0.75, cy - 0.62, zmid + dz - 0.6, 0.14, 0.05, 1.2, 'NSEWU'); F(fu, LAMP, xb - 0.73, cy - 0.63, zmid + dz - 0.58, 0.1, 0.012, 1.16, 'D'); }
    for (const dz of [-2.55, 2.33]) { F(fu, DK, xb - 0.16, y + 2.68, zmid + dz, 0.16, 0.32, 0.22, 'WNSUD'); F(fu, M.GRAT, xb - 0.164, y + 2.7, zmid + dz + 0.02, 0.004, 0.28, 0.18, 'W'); }
    // lectern with a globe and a pile of exercise books
    F(fu, M.oak, xb - 1.2, y + 0.17, zmid + 0.4, 0.44, 0.88, 1.0, 'NSEW'); F(fu, M.deskTop, xb - 1.24, y + 1.05, zmid + 0.36, 0.52, 0.03, 1.08, 'NSEWUD');
    // projector on a ceiling pole
    F(fu, AL, xb - 3.3, cy - 0.5, zmid - 0.015, 0.03, 0.5, 0.03, 'NSEW'); F(fu, WH, xb - 3.48, cy - 0.62, zmid - 0.17, 0.36, 0.12, 0.34, 'NSEWUD'); F(fu, M.GLOSS, xb - 3.12, cy - 0.6, zmid - 0.05, 0.02, 0.08, 0.1, 'ENSUD');
    // fans, lamps, air-conditioner on the window wall (its condenser hangs outside)
    for (const fx_ of low ? [0.5] : [0.27, 0.73]) for (const s of [-1, 1]) fan(xa + len * fx_, zmid + s * depth * 0.17, cy);
    for (const fx_ of [0.25, 0.75]) for (const dz of [-0.38, 0, 0.38]) light(xa + len * fx_, zmid + dz * depth, cy);
    F(fu, WH, r.b - 1.7, y + head + 0.07, zi, 0.9, 0.29, 0.21, 'SEWUD'); F(fu, DK, r.b - 1.65, y + head + 0.085, zi + 0.21, 0.8, 0.03, 0.006, 'S');
    // back (west): lockers with things on top, pin board, water dispenser, broom corner with a bucket
    const lz = Math.floor((zw - 1.4 - zi - 1.1) / 0.4) * 0.4, z0 = zi + 1.1;
    F(fu, M.LB, xa, y + 0.02, z0, 0.42, 1.25, lz, 'UNS'); F(fu, DK, xa, y + 0.02, z0, 0.425, 0.05, lz, 'E');
    fu.quad(M.LOCK, [xa + 0.421, y + 0.07, z0 + lz], [xa + 0.421, y + 0.07, z0], [xa + 0.421, y + 1.27, z0], [xa + 0.421, y + 1.27, z0 + lz]);
    F(fu, M.CORK, xa, y + 1.5, zmid - 1.5, 0.02, 1.0, 3.0, 'E'); F(fu, AL, xa, y + 1.46, zmid - 1.54, 0.014, 1.08, 3.08, 'ENSUD');
    dispenser(xa + 0.03, y, z0 + lz + 0.04);
    plant(plantsIn, xa + 0.2, y + 1.27, z0 + 0.3, 1.5, false); plant(plantsIn, xa + 0.2, y + 1.27, z0 + lz - 0.35, 1.3, true);
    fu.cyl(M.BINA, xa + 0.3, y + 0.02, zi + 0.3, 0.17, 0.45, 10); fu.cyl(RED, xa + 0.3, y + 0.02, zi + 0.75, 0.14, 0.26, 10, false); fu.cyl(DK, xa + 0.3, y + 0.03, zi + 0.75, 0.135, 0.2, 10);
    // book corner under the last window: an open case, plants on top
    const xs0 = xa + 1.3;
    F(fu, M.oak, xs0, y + 0.02, zi, 1.46, 0.9, 0.3, 'EWU'); F(fu, M.oak, xs0, y + 0.02, zi + 0.28, 1.46, 0.07, 0.02, 'S'); quadS(fu, M.BOOKS, zi + 0.27, y + 0.09, y + 0.85, xs0 + 0.03, xs0 + 1.43);
    plant(plantsIn, xs0 + 0.25, y + 0.92, zi + 0.15, 1.3, false);
    // potted plants on the window sill
    for (const b of bays) if (b.a > r.a - 0.01 && b.b < r.b + 0.01 && !b.narrow) for (const f of low ? [0.5] : [0.3, 0.62]) if (rnd() < 0.8) plant(plantsIn, b.a + (b.b - b.a) * (f + 0.1 * rnd()), y + 0.972, zi - 0.04, 0.62 + 0.2 * rnd(), rnd() < 0.35);
    if (!low) {
      stick(fu, M.door, [xa + 0.66, y + 0.08, zi + 0.26], [xa + 0.7, y + 1.3, zi + 0.05], 0.025); F(fu, M.STRAW, xa + 0.52, y + 0.02, zi + 0.2, 0.3, 0.14, 0.06, 'NSEWU');   // broom
      stick(fu, AL, [xa + 0.98, y + 0.08, zi + 0.28], [xa + 1.0, y + 1.35, zi + 0.05], 0.025); F(fu, M.BINA, xa + 0.86, y + 0.02, zi + 0.2, 0.26, 0.08, 0.12, 'NSEWU');     // mop
      F(fu, M.BINB, xa + 0.5, y + 0.02, zi + 0.5, 0.24, 0.02, 0.24, 'NSEWU'); F(fu, M.BINB, xa + 0.5, y + 0.02, zi + 0.74, 0.24, 0.1, 0.015, 'NSEWU');                     // dustpan
      // clock, blank duty roster and timetable frames, chalk and eraser, sheets on the pin board, switch plate, keyboard and microphone
      quadW(fx, M.CLOCK, xb - 0.012, y + 2.5, y + 2.84, zmid - 2.1, zmid - 1.76);
      quadW(fx, M.ROSTER, xb - 0.008, y + 1.25, y + 1.95, zmid + 2.5, zmid + 3.0); if (zw - zmid > 3.75) quadW(fx, M.ROSTER, xb - 0.008, y + 1.25, y + 1.95, zmid + 3.15, zmid + 3.65);
      [[0.4, WH], [0.47, WH], [0.56, M.SHB], [0.63, RED], [-1.2, WH], [-1.26, M.SHC]].forEach(([dz, m]) => F(fx, m, xb - 0.09, y + 0.905, zmid + dz, 0.012, 0.012, 0.06, 'WUNS'));
      F(fx, DK, xb - 0.1, y + 0.905, zmid - 0.6, 0.05, 0.035, 0.13, 'WUNS'); F(fx, M.SHA, xb - 0.1, y + 0.905, zmid - 0.6, 0.05, 0.012, 0.13, 'W');
      [['SHA', -1.3, 0.6], ['SHB', -0.9, 0.55], ['SHC', -0.4, 0.12], ['SHA', 0.1, 0.58], ['SHC', 0.55, 0.15], ['SHB', 1.0, 0.5]].forEach(([m, dz, dy]) => F(fx, M[m], xa + 0.02, y + 1.55 + dy, zmid + dz, 0.004, 0.3, 0.21, 'E'));
      F(fx, WH, xb - 1.75, y + 1.3, zw - 0.012, 0.09, 0.09, 0.012, 'NEWUD');
      F(fx, DK, xb - 0.92, y + 1.06, zmid - 1.95, 0.44, 0.015, 0.15, 'NSEWU'); tube(fx, DK, [xb - 0.5, y + 1.06, zmid - 1.62], [xb - 0.58, y + 1.34, zmid - 1.7], 0.006, 5);
      F(fx, WH, xb - 1.12, y + 1.08, zmid + 0.5, 0.1, 0.05, 0.16, 'NSEWU');                                                      // chalk box
      globes.push([xb - 0.98, y + 1.08, zmid + 1.18]);
      for (let i = 0; i < 4; i++) books.push([xb - 1.0, y + 1.08 + i * 0.021, zmid + 0.82, 0.5 + (rnd() - 0.5) * 0.3, 0, covers[4 + (i & 1) * 2]]);
      for (let i = 0; i < 3; i++) books.push([xa + 0.2, y + 1.27 + i * 0.021, z0 + lz * 0.55, rnd(), 1, covers[Math.floor(rnd() * 7)]]);
    }
    // desks in four double columns, chairs pushed in, facing the board; bags on chair backs, books, pencil cases and bottles on some desks
    const rows = Math.max(1, Math.floor((len - 5.06) / 0.85) + 1), pitch = rows > 1 ? Math.min(0.95, (len - 5.06) / (rows - 1)) : 0;
    const aisle = Math.min(0.75, (depth - 0.9 - 4.8) / 3);
    for (let i = 0; i < rows; i++) for (let j = 0; j < 4; j++) for (const dz of [0.3, 0.9]) {
      const p = [xb - 2.51 - i * pitch, y + 0.02, zmid - (4.8 + 3 * aisle) / 2 + j * (1.2 + aisle) + dz]; desks.push(p);
      if (rnd() < (low ? 0.2 : 0.46)) bags.push([p[0] - 0.63, p[1] + 0.62, p[2] + (rnd() - 0.5) * 0.06, (rnd() - 0.5) * 0.3, bagCols[Math.floor(rnd() * bagCols.length)]]);
      if (low) continue;
      const t = p[1] + 0.75;
      if (rnd() < 0.62) { const n = 1 + Math.floor(rnd() * 2.4), bz = p[2] + (rnd() - 0.5) * 0.24, ba = rnd(); for (let q = 0; q < n; q++) books.push([p[0] + 0.02 + (rnd() - 0.5) * 0.03, t + q * 0.021, bz, ba + (rnd() - 0.5) * 0.25, 0, covers[Math.floor(rnd() * 7)]]); }
      if (rnd() < 0.34) cases.push([p[0] - 0.1 + rnd() * 0.06, t + 0.018, p[2] + (rnd() - 0.5) * 0.3, (rnd() - 0.5) * 0.7, bagCols[Math.floor(rnd() * bagCols.length)]]);
      if (rnd() < 0.24) bottles.push([p[0] + 0.13, t, p[2] + (rnd() < 0.5 ? -0.22 : 0.22), 0, [0x9fc8e6, 0xe6eef2, 0xe9a0b4, 0x8fd0a8, 0xb9bec2, 0xf0c95a][Math.floor(rnd() * 6)]]);
    }
    for (const [xd, side] of doorsOf(r)) leaf(xd, side, y);
  }

  function office(r, y, k) {                                                       // teachers' room: six desks between low screens, files, a sofa and tea table, a copier
    const xa = r.a + 0.1, xb = r.b - 0.1, len = xb - xa, cy = ceilOf(k), xm = (xa + xb) / 2 + 0.3, LB = M.LB;
    dadoWalls(r, y); drapes(r, y, headOf(k));
    for (const s of [-1, 1]) for (const dz of [-1.5, 0, 1.5]) {
      const xd = xm + (s < 0 ? -0.72 : 0.04), z = zmid + dz - 0.2;
      F(fu, M.oak, xd, y + 0.74, z - 0.62, 0.68, 0.03, 1.24, 'NSEWUD'); F(fu, LB, xd + 0.04, y + 0.02, z - 0.6, 0.6, 0.72, 0.42, 'NSEW'); F(fu, LB, xd + (s < 0 ? 0.62 : 0.02), y + 0.02, z - 0.18, 0.04, 0.72, 0.78, 'EW');
      const xs = xd + (s < 0 ? 0.5 : 0.15);                                                                                      // monitor: its screen faces the chair
      F(fu, DK, xs, y + 0.86, z - 0.07, 0.03, 0.31, 0.5, 'NSEWUD'); F(fu, M.GLOSS, xs + (s < 0 ? -0.003 : 0.03), y + 0.875, z - 0.055, 0.003, 0.28, 0.47, s < 0 ? 'W' : 'E'); F(fu, DK, xs - 0.03, y + 0.77, z + 0.13, 0.09, 0.1, 0.1, 'NSEWU');
      const xc = xd + (s < 0 ? -0.5 : 0.72);                                                                                     // swivel chair
      F(fu, DK, xc, y + 0.44, z, 0.46, 0.07, 0.46, 'NSEWUD'); F(fu, DK, xc + (s < 0 ? 0 : 0.41), y + 0.56, z + 0.02, 0.05, 0.46, 0.42, 'NSEWU'); fu.cyl(AL, xc + 0.23, y + 0.08, z + 0.23, 0.025, 0.36, 6, false);
      F(fu, DK, xc + 0.01, y + 0.04, z + 0.21, 0.44, 0.04, 0.04, 'NSEWU'); F(fu, DK, xc + 0.21, y + 0.04, z + 0.01, 0.04, 0.04, 0.44, 'NSEWU');
      if (dz < 1) F(fu, M.SCR, xd, y + 0.77, z + 0.63, 0.68, 0.42, 0.03, 'NSEWU');                                               // side screen to the next desk
      if (low) continue;
      const xk = xd + (s < 0 ? 0.2 : 0.3);
      F(fx, DK, xk, y + 0.77, z - 0.03, 0.14, 0.015, 0.42, 'NSEWU'); F(fx, DK, xk + 0.03, y + 0.77, z + 0.44, 0.06, 0.02, 0.1, 'NSEWU');   // keyboard, mouse
      F(fx, M.SHA, xd + (s < 0 ? 0.1 : 0.3), y + 0.77, z - 0.55, 0.22, 0.03 + 0.03 * rnd(), 0.3, 'NSEWU');                        // a pile of papers
      fx.cyl(i2c(rnd() * 0.3), xd + (s < 0 ? 0.56 : 0.1), y + 0.77, z + 0.5, 0.04, 0.09, 8); fx.cyl(DK, xd + (s < 0 ? 0.56 : 0.1), y + 0.77, z - 0.45, 0.04, 0.1, 8);   // mug, pen pot
      if (rnd() < 0.8) books.push([xd + 0.34, y + 0.77, z - 0.4, rnd(), 0, covers[Math.floor(rnd() * 7)]]);
      if (rnd() < 0.4) plant(plantsIn, xd + (s < 0 ? 0.56 : 0.12), y + 0.77, z + 0.3, 0.8, rnd() < 0.5);
    }
    F(fu, M.SCR, xm - 0.04, y + 0.74, zmid - 2.35, 0.08, 0.5, 4.3, 'NSEWU'); F(fu, AL, xm - 0.045, y + 1.24, zmid - 2.35, 0.09, 0.012, 4.3, 'NSEWU');   // screen between the facing desks
    // east wall: cupboards below, open shelves of files above
    const cz = Math.floor((depth - 2.6) / 0.9) * 0.9, zc0 = zi + 0.7;
    F(fu, M.oak, xb - 0.45, y + 0.02, zc0, 0.45, 0.9, cz, 'WNSU'); for (let i = 1; i < cz / 0.45 - 0.01; i++) F(fu, DK, xb - 0.452, y + 0.06, zc0 + i * 0.45 - 0.003, 0.004, 0.84, 0.006, 'W');
    F(fu, M.oak, xb - 0.32, y + 0.92, zc0, 0.32, 0.96, cz, 'NSU'); for (let zz = 0; zz < cz - 0.1; zz += 1.8) quadW(fu, M.FILES, xb - 0.3, y + 0.96, y + 1.8, zc0 + zz, zc0 + Math.min(cz, zz + 1.8));
    if (!low) for (let i = 0.5; i < cz / 0.45; i++) F(fx, AL, xb - 0.46, y + 0.5, zc0 + i * 0.45 + (i % 2 < 1 ? 0.14 : -0.2), 0.012, 0.1, 0.012, 'WNSUD');
    plant(plantsIn, xb - 0.3, y + 0.02, zi + 0.36, 2.6, true);
    // west wall: sofa and tea table, pin board, copier, water dispenser
    F(fu, M.SOFA, xa + 0.02, y + 0.02, zi + 1.0, 0.85, 0.4, 2.0, 'ENSU'); F(fu, M.SOFA, xa + 0.02, y + 0.42, zi + 1.0, 0.22, 0.42, 2.0, 'ENSU');
    for (const zz of [zi + 1.0, zi + 2.82]) F(fu, M.SOFA, xa + 0.02, y + 0.42, zz, 0.85, 0.2, 0.18, 'ENSU');
    for (const zz of [zi + 1.2, zi + 2.02]) F(fu, M.CUSH, xa + 0.24, y + 0.42, zz, 0.62, 0.1, 0.78, 'ENSU');
    F(fu, M.oak, xa + 1.2, y + 0.38, zi + 1.45, 0.55, 0.04, 1.1, 'NSEWUD'); for (const dx of [0.03, 0.47]) for (const dzz of [0.03, 1.02]) F(fu, DK, xa + 1.2 + dx, y + 0.02, zi + 1.45 + dzz, 0.05, 0.36, 0.05, 'NSEW');
    if (!low) {
      F(fx, DK, xa + 1.27, y + 0.42, zi + 1.6, 0.4, 0.015, 0.5, 'NSEWU'); fx.cyl(SS, xa + 1.38, y + 0.435, zi + 1.72, 0.06, 0.14, 10); for (const [dx, dzz] of [[0.2, 0.1], [0.3, 0.22], [0.2, 0.34]]) fx.cyl(WH, xa + 1.27 + dx, y + 0.435, zi + 1.6 + dzz, 0.03, 0.05, 8);
      plant(plantsIn, xa + 1.47, y + 0.42, zi + 2.35, 0.9, false);
    }
    F(fu, M.CORK, xa, y + 1.2, zmid - 1.2, 0.02, 1.0, 2.4, 'E'); F(fu, AL, xa, y + 1.16, zmid - 1.24, 0.014, 1.08, 2.48, 'ENSUD');
    if (!low) { quadE(fx, M.ROSTER, xa + 0.024, y + 1.35, y + 2.05, zmid - 0.9, zmid - 0.4); [['SHA', 0.0, 0.5], ['SHC', 0.35, 0.45], ['SHB', 0.7, 0.1]].forEach(([m, dz, dy]) => F(fx, M[m], xa + 0.02, y + 1.25 + dy, zmid + dz, 0.004, 0.3, 0.21, 'E')); }
    const zp = zw - 2.35;                                                                                                        // copier
    F(fu, WH, xa + 0.03, y + 0.02, zp, 0.62, 0.95, 0.66, 'NSEWU'); F(fu, M.CON, xa + 0.01, y + 0.97, zp - 0.02, 0.66, 0.1, 0.7, 'NSEWU'); F(fu, DK, xa + 0.5, y + 1.07, zp + 0.1, 0.14, 0.03, 0.3, 'NSEWU');
    for (const yy of [0.2, 0.42]) F(fu, DK, xa + 0.652, y + yy, zp + 0.05, 0.004, 0.012, 0.56, 'E'); F(fu, M.CON, xa + 0.65, y + 0.68, zp + 0.1, 0.24, 0.02, 0.46, 'NSEWUD');
    dispenser(xa + 0.05, y, zi + 0.45);
    plant(plantsIn, xa + 1.6, y + 0.02, zw - 0.4, 2.3, false);
    for (const s of [-1, 1]) { fan(xa + len / 2, zmid + s * depth * 0.2, cy); for (const dz of [-0.36, 0, 0.36]) if (s < 0 || dz) light(xa + len * (s < 0 ? 0.3 : 0.72), zmid + dz * depth, cy, 1.0); }
    for (const [xd, side] of doorsOf(r)) leaf(xd, side, y);
  }

  function toilets(y, k) {                                                         // wash lobby with basins and a mirror; cubicles with squat pans on a step; urinals; a mop sink
    const cy = ceilOf(k), lx0 = xp[0] + 0.1, lx1 = xp[1], lw = lx1 - lx0, zq0 = zt0 + 1.55, n = 3, cq = (zt1 - zq0) / n, LB = M.LB;
    F(fu, M.BASE, lx0, y + 0.78, zt1 - 0.55, lw, 0.05, 0.55, 'NUD'); F(fu, M.WT, lx0, y + 0.02, zt1 - 0.5, lw, 0.76, 0.06, 'N');
    for (const f of [0.27, 0.73]) {
      const xc = lx0 + lw * f; fu.cyl(WH, xc, y + 0.8, zt1 - 0.29, 0.19, 0.04, 14); fu.cyl(M.BASIN, xc, y + 0.81, zt1 - 0.29, 0.155, 0.032, 14);
      fu.cyl(SS, xc, y + 0.83, zt1 - 0.07, 0.012, 0.14, 6); tube(fu, SS, [xc, y + 0.96, zt1 - 0.07], [xc, y + 0.93, zt1 - 0.21], 0.01, 6, true);
    }
    F(fu, M.MIRROR, lx0 + 0.1, y + 1.0, zt1 - 0.014, lw - 0.2, 0.6, 0.008, 'N'); F(fu, AL, lx0 + 0.07, y + 0.97, zt1 - 0.008, lw - 0.14, 0.66, 0.008, 'NEWUD');
    F(fu, WH, lx0, y + 1.1, zt1 - 1.5, 0.16, 0.28, 0.26, 'ENSUD'); fu.cyl(M.BINA, lx1 - 0.24, y + 0.02, zt1 - 0.85, 0.16, 0.5, 10);
    quadE(fu, M.WCM, xp[0] + 0.106, y + 2.2, y + 2.45, zt0 + 0.82, zt0 + 1.07); quadW(fu, M.WCW, xp[1] - 0.006, y + 2.2, y + 2.45, zt0 + 0.82, zt0 + 1.07);
    for (const xl of [(xt0 + xp[0]) / 2, (lx0 + lx1) / 2, (xp[1] + 0.1 + xt1) / 2]) { fu.cyl(WH, xl, cy - 0.06, (zt0 + zt1) / 2, 0.2, 0.06, 12); fu.cyl(LAMP, xl, cy - 0.076, (zt0 + zt1) / 2, 0.165, 0.016, 12); }
    for (const [xw, dir] of [[xt0, 1], [xt1, -1]]) {                               // a row of cubicles against the outer wall
      const xf = xw + dir * 1.25, xl = Math.min(xw, xf);
      F(fu, M.FT, xl, y + 0.02, zq0, 1.25, 0.14, zt1 - zq0, dir > 0 ? 'UEN' : 'UWN');
      F(fu, AL, xf - 0.02, y + 2.04, zq0, 0.04, 0.04, zt1 - zq0, 'EWUDN');
      for (let i = 0; i < n; i++) {
        const z0 = zq0 + i * cq, zc_ = z0 + cq / 2, side = (cq - 0.62) / 2;
        F(fu, LB, xl, y + 0.3, z0 - 0.015, 1.25, 1.75, 0.03, 'NSEWUD');
        F(fu, LB, xf - 0.015, y + 0.3, z0, 0.03, 1.75, side, 'EWNSUD'); F(fu, LB, xf - 0.015, y + 0.3, zc_ + 0.31, 0.03, 1.75, side, 'EWNSUD');
        if ((i + k) % 3 === 1) F(fu, M.CON, Math.min(xf, xf - dir * 0.6), y + 0.32, zc_ + 0.28, 0.6, 1.7, 0.03, 'NSEWUD');      // one door stands open
        else F(fu, M.CON, xf - 0.012, y + 0.32, zc_ - 0.31, 0.024, 1.7, 0.62, 'EWNSUD');
        const xc = xw + dir * 0.6;
        F(fu, WH, xc - 0.29, y + 0.158, zc_ - 0.14, 0.58, 0.012, 0.28, 'UNSEW'); F(fu, M.BASIN, xc - 0.21, y + 0.171, zc_ - 0.075, 0.42, 0.002, 0.15, 'U');
        tube(fu, SS, [xw + dir * 0.03, y + 0.2, zc_], [xw + dir * 0.03, y + 0.75, zc_], 0.014, 6); F(fu, SS, xw + (dir > 0 ? 0.01 : -0.07), y + 0.75, zc_ - 0.03, 0.06, 0.06, 0.06, 'NSEWUD');
        if (!low) fu.cyl(M.BINB, xw + dir * 1.05, y + 0.16, zc_ - cq / 2 + 0.16, 0.09, 0.22, 8);
      }
    }
    for (let i = 0; i < 3; i++) {                                                  // urinals on the inner wall of the men's room
      const z = zt0 + 1.95 + i * 0.75; if (z > zt1 - 0.3) break;
      F(fu, WH, xp[0] - 0.3, y + 0.42, z - 0.17, 0.3, 0.62, 0.34, 'WNSUD'); F(fu, M.BASIN, xp[0] - 0.302, y + 0.5, z - 0.11, 0.002, 0.46, 0.22, 'W');
      tube(fu, SS, [xp[0] - 0.05, y + 1.04, z], [xp[0] - 0.05, y + 1.3, z], 0.012, 6); F(fu, LB, xp[0] - 0.42, y + 0.5, z + 0.36, 0.42, 0.95, 0.02, 'NSWUD');
    }
    // mop sink in the corner of the men's room, with a mop and a bucket; hand dryer and bin in the women's room
    F(fu, M.WT, xt0, y + 0.02, zt0, 0.6, 0.42, 0.6, 'ESU'); F(fu, M.BASIN, xt0 + 0.06, y + 0.441, zt0 + 0.06, 0.48, 0.002, 0.48, 'U'); fu.cyl(SS, xt0 + 0.08, y + 0.44, zt0 + 0.3, 0.012, 0.4, 6);
    if (!low) { stick(fu, AL, [xt0 + 0.42, y + 0.44, zt0 + 0.3], [xt0 + 0.06, y + 1.5, zt0 + 0.5], 0.025); fu.cyl(RED, xt0 + 0.95, y + 0.02, zt0 + 0.3, 0.14, 0.26, 10, false); fu.cyl(DK, xt0 + 0.95, y + 0.03, zt0 + 0.3, 0.135, 0.2, 10); }
    F(fu, WH, xt1 - 0.16, y + 1.1, zt0 + 0.5, 0.16, 0.28, 0.26, 'WNSUD'); fu.cyl(M.BINA, xt1 - 0.3, y + 0.02, zt0 + 1.1, 0.16, 0.5, 10);
  }

  for (let k = 0; k < FLOORS; k++) { for (const r of rooms) (r.kind === 'class' ? classroom : office)(r, k * FH, k); if (wc) toilets(k * FH, k); }

  // ---- stair flights: terrazzo steps with brass nosing strips, soffit slabs, stringers, stainless balusters and handrails ----
  const TR = M.TR, NO = M.BRASS;
  for (let k = 0; k < FLOORS - 1; k++) {
    const y = k * FH, ym = y + FH / 2, y1 = y + FH;
    for (let i = 0; i < STEPS; i++) {
      F(fu, TR, xa1, y + i * RISE, zl - (i + 1) * GO, sw, RISE, GO, 'USW'); F(fu, TR, sx0, ym + i * RISE, zh + i * GO, sw, RISE, GO, 'UNE');
      F(fu, NO, xa1, y + (i + 1) * RISE - 0.004, zl - i * GO - 0.05, sw, 0.008, 0.035, 'US'); F(fu, NO, sx0, ym + (i + 1) * RISE - 0.004, zh + i * GO + 0.015, sw, 0.008, 0.035, 'UN');
      if (!low || i % 2 === 0) {
        fu.cyl(SS, xa1 - 0.02, y + (i + 0.5) * RISE + 0.2, zl - (i + 0.5) * GO, 0.009, RISE + 0.66, 5, false);
        fu.cyl(SS, xb1 + 0.02, ym + (i + 0.5) * RISE + 0.2, zh + (i + 0.5) * GO, 0.009, RISE + 0.66, 5, false);
      }
    }
    for (const [xa, xb, zA, yA, zB, yB, wellX, wallX, st0] of [[xa1, xa2, zl, y, zh, ym, xa1 - 0.02, xa2 - 0.07, xa1 - 0.035], [sx0, xb1, zh, ym, zl, y1, xb1 + 0.02, sx0 + 0.07, xb1]]) {
      incl(fu, PL, xa, xb, zA, yA, zB, yB, 0.14, 'DEW');                                                                         // soffit slab
      incl(fu, WH, st0, st0 + 0.035, zA, yA + 0.23, zB, yB + 0.23, 0.37, 'EWUDNS');                                              // stringer on the well side
      tube(fu, SS, [wellX, yA + RISE + 0.9, zA], [wellX, yB + RISE + 0.9, zB], 0.024);                                           // handrail on the balusters
      tube(fu, SS, [wallX, yA + RISE + 0.9, zA], [wallX, yB + RISE + 0.9, zB], 0.02);                                            // handrail on the wall
      for (const t of [0.12, 0.5, 0.88]) F(fu, SS, Math.min(wallX, xa === xa1 ? xa2 - 0.07 : sx0), yA + RISE + 0.89 + (yB - yA) * t, zA + (zB - zA) * t - 0.01, 0.07, 0.02, 0.02, 'NSUD');
      incl(fu, DA, xa === xa1 ? xa2 - 0.008 : sx0, xa === xa1 ? xa2 : sx0 + 0.008, zA, yA + 0.3, zB, yB + 0.3, 0.3, xa === xa1 ? 'W' : 'E');   // painted skirting
    }
    tube(fu, SS, [xb1 + 0.02, ym + RISE + 0.9, zh], [xb1 + 0.02, ym + RISE + 0.9, zh - 0.08], 0.024); tube(fu, SS, [xb1 + 0.02, ym + RISE + 0.9, zh - 0.08], [xa1 - 0.02, ym + RISE + 0.9, zh - 0.08], 0.024); tube(fu, SS, [xa1 - 0.02, ym + RISE + 0.9, zh - 0.08], [xa1 - 0.02, ym + RISE + 0.9, zh], 0.024);   // rail turning round the well
    tube(fu, SS, [xb1 + 0.02, y1 + RISE + 0.9, zl + 0.03], [xa1 - 0.02, y1 + RISE + 0.9, zl + 0.03], 0.024); for (const xx of [xb1 + 0.02, xa1 - 0.02]) fu.cyl(SS, xx, y1, zl + 0.03, 0.014, 1.05, 6, false);
    if (k === 0) fu.cyl(SS, xa1 - 0.02, 0, zl + 0.02, 0.022, 1.1, 8);                                                            // newel post at the foot
    fu.cyl(WH, (sx0 + xa2) / 2, ym - 0.21, (zi + zh) / 2, 0.2, 0.06, 12); fu.cyl(LAMP, (sx0 + xa2) / 2, ym - 0.226, (zi + zh) / 2, 0.165, 0.016, 12);   // lamp under the half landing
    for (const xx of [swa, swa + 1.2]) { F(fu, MW, xx + 0.42, ym + 0.95, zN + 0.07, 0.05, 1.5, 0.08, 'NSEW'); F(fu, COP, xx - 0.02, ym + 0.93, zN + 0.13, 0.94, 0.022, zi - zN - 0.1, 'USEW'); }   // mullions and sills of the landing windows
    if (!low) plant(plantsIn, sx0 + 0.3, ym, zi + 0.3, 2.2, k % 2 === 0);
    F(fu, M.PLT, sx0 + 0.004, ym + 1.5, zi + 1.6, 0.012, 0.3, 0.3, 'ENSUD');                                                     // blank plate at the half landing
  }

  // ================= assemble =================
  const shell = mergeFlat(v.build({ name: item.id + '-visual' }), true); ctx.add(shell);
  for (const m of shell.children) if (m.material === CE) m.onBeforeRender = followDaylight;
  const cx = bar.w + L / 2, cz = bar.n + D / 2, Mx = new THREE.Matrix4(), q = new THREE.Quaternion(), col = new THREE.Color(), V3 = (x, y, z) => new THREE.Vector3(bar.w + x, y, bar.n + z);
  // instanced mesh from a list [x, y, z, yaw, colour]; scale and tilt optional
  const instanced = (geo, material, list, name, place) => {
    const im = new THREE.InstancedMesh(geo, material, list.length); im.name = item.id + '-' + name; im.receiveShadow = true;
    list.forEach((p, i) => { place(p, i, im); }); im.computeBoundingSphere(); return im;
  };
  const yawAt = (p, i, im) => { im.setMatrixAt(i, Mx.compose(V3(p[0], p[1], p[2]), q.setFromAxisAngle(UP, p[3] || 0), ONE)); if (p[4] !== undefined) im.setColorAt(i, col.setHex(p[4])); };
  const leaves = (list, name) => {                                                 // potted plants: pots and tufts of leaves
    const out = [], pots = list.filter(p => p[5]);
    if (pots.length) out.push(instanced(shape('pot', () => new THREE.CylinderGeometry(0.085, 0.06, 0.13, 10, 1)), M.potI, pots, name + '-pots', (p, i, im) => {
      im.setMatrixAt(i, Mx.compose(V3(p[0], p[1] + 0.065 * p[3], p[2]), q.identity(), new THREE.Vector3(p[3], p[3], p[3]))); im.setColorAt(i, col.setHex([0xb5653f, 0xe9e6dc, 0x6b7377, 0xb5653f][Math.floor(p[6] * 4)]));
    }));
    if (list.length) out.push(instanced(leafGeo(), M.leaf, list, name + '-leaves', (p, i, im) => {
      const s = 0.13 * p[3], h = p[4] ? 1.9 : 1.05;
      im.setMatrixAt(i, Mx.compose(V3(p[0], p[1] + (p[5] ? 0.13 * p[3] : 0.05) + 0.3 * s * h, p[2]), q.setFromAxisAngle(UP, p[6] * 6.283), new THREE.Vector3(s * (p[4] ? 0.8 : 1.15), s * h, s * (p[4] ? 0.8 : 1.15))));
      im.setColorAt(i, col.setHex([0xffffff, 0xd8f0c0, 0xc0d8a8, 0xf0ffd8][Math.floor(p[6] * 4)]));
    }));
    return out;
  };
  const exG = mergeFlat(ex.build({ name: item.id + '-fittings', castShadow: false }), false);
  for (const im of leaves(plantsOut, 'corridor')) exG.add(im);
  if (shrubList.length) { const sh = shrubs(shrubList, { seed: item.id.length }); sh.castShadow = false; sh.computeBoundingSphere(); sh.frustumCulled = true; exG.add(sh); }
  if (bikes.length) {
    const [frameGeo, blackGeo] = bikeGeos(), paint = [0x1f2226, 0xb8322a, 0x2f5f9e, 0xe0b830, 0x7fc8b4, 0xf0efe9];
    exG.add(instanced(frameGeo, M.bike, bikes, 'bike-frames', (p, i, im) => { im.setMatrixAt(i, Mx.compose(V3(p[0], p[1], p[2]), q.setFromAxisAngle(UP, p[3]), ONE)); im.setColorAt(i, col.setHex(paint[Math.floor(p[4] * paint.length)])); }));
    exG.add(instanced(blackGeo, M.TYRE, bikes, 'bike-tyres', (p, i, im) => im.setMatrixAt(i, Mx.compose(V3(p[0], p[1], p[2]), q.setFromAxisAngle(UP, p[3]), ONE))));
  }
  ctx.detail(ctx.add(exG), cx, cz, L / 2 + (low ? 70 : 100));
  const fuG = mergeFlat(fu.build({ name: item.id + '-interior', castShadow: false }), false), fxG = mergeFlat(fx.build({ name: item.id + '-fine', castShadow: false }), false);
  for (const part of deskSet(low)) fuG.add(instanced(part.geometry, part.material, desks, 'desks', (p, i, im) => im.setMatrixAt(i, Mx.makeTranslation(bar.w + p[0], p[1], bar.n + p[2]))));
  if (bags.length) fuG.add(instanced(bagGeo(), M.bag, bags, 'bags', yawAt));
  for (const im of leaves(plantsIn, 'room')) fuG.add(im);
  if (fans.length) {                                                               // ceiling fans: most of them turn
    const im = instanced(fanGeo(), M.FAN, fans, 'fans', (p, i, mesh) => mesh.setMatrixAt(i, Mx.makeRotationY(p[4]).setPosition(bar.w + p[0], p[1], bar.n + p[2])));
    im.onBeforeRender = () => {
      const t = performance.now() / 1000;
      fans.forEach((p, i) => { if (p[3]) im.setMatrixAt(i, Mx.makeRotationY(p[4] + t * p[3]).setPosition(bar.w + p[0], p[1], bar.n + p[2])); });
      im.instanceMatrix.needsUpdate = true;
    };
    fuG.add(im);
  }
  if (books.length) fxG.add(instanced(shape('book', () => new THREE.BoxGeometry(0.18, 0.02, 0.25)), M.book, books, 'books', (p, i, im) => {     // closed books and exercise books: plain covers, no titles
    im.setMatrixAt(i, Mx.compose(V3(p[0], p[1] + 0.011, p[2]), q.setFromAxisAngle(UP, (p[3] - 0.5) * (p[4] ? 1.2 : 0.5)), ONE)); im.setColorAt(i, col.setHex(p[5]));
  }));
  if (cases.length) fxG.add(instanced(shape('case', () => new THREE.BoxGeometry(0.075, 0.036, 0.2)), M.caseM, cases, 'pencil-cases', yawAt));
  if (bottles.length) fxG.add(instanced(bottleGeo(), M.bottle, bottles, 'bottles', yawAt));
  if (globes.length) {
    fxG.add(instanced(shape('globe', () => new THREE.SphereGeometry(0.13, 14, 9)), M.GLOBE, globes, 'globes', (p, i, im) => im.setMatrixAt(i, Mx.compose(V3(p[0], p[1] + 0.2, p[2]), q.setFromEuler(new THREE.Euler(0.2, i * 1.3, 0.38)), ONE))));
    fxG.add(instanced(shape('globe-stand', () => mergeGeos([[new THREE.CylinderGeometry(0.075, 0.085, 0.02, 12, 1), TM(0, 0.01, 0)], [new THREE.CylinderGeometry(0.012, 0.012, 0.07, 6, 1), TM(0, 0.045, 0)], [new THREE.TorusGeometry(0.145, 0.006, 4, 16, Math.PI), TM(0, 0.2, 0, 0, 0, -Math.PI / 2 + 0.38)]])), M.BRASS, globes, 'globe-stands', (p, i, im) => im.setMatrixAt(i, Mx.makeTranslation(bar.w + p[0], p[1], bar.n + p[2]))));
  }
  ctx.detail(ctx.add(fuG), cx, cz, L / 2 + (low ? 34 : 44));
  ctx.detail(ctx.add(fxG), cx, cz, L / 2 + (low ? 14 : 20));
  const cg = ctx.add(c.build({ name: item.id + '-colliders' })); cg.visible = false;

  // stair ramps (collision only): one inclined plate per flight, so the capsule walks up smoothly
  const ramps = new THREE.Group(); ramps.position.set(bar.w, 0, bar.n); ramps.visible = false; ctx.add(ramps);
  const rlen = Math.hypot(run, FH / 2), rang = Math.atan2(FH / 2, run);
  for (let k = 0; k < FLOORS - 1; k++) for (const flight of ['A', 'B']) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(sw, 0.2, rlen));
    m.position.set(flight === 'A' ? xa1 + sw / 2 : sx0 + sw / 2, k * FH + (flight === 'A' ? FH / 4 : FH * 3 / 4) - 0.1 * Math.cos(rang), zl - run / 2);
    m.rotation.x = flight === 'A' ? rang : -rang;          // rotating about +X by a positive angle lowers the +z (south) end: A rises toward north, B toward south
    ramps.add(m);
  }
  cg.traverse(o => { if (o.isMesh) ctx.collide(o); });
  ramps.children.forEach(m => ctx.collide(m));
}
