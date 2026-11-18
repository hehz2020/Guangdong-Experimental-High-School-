// Street and garden furniture shared by the ground-level modules: lamps, street lights, benches, litter bins, notice
// boards, bicycle racks, bollards, tree pits, direction signs.
//
// IMAGINED: no reference shows the school's furniture closely. These are the things a campus of this kind has, drawn so
// that the grounds read as a used place. Sizes are ordinary catalogue sizes.
//
// Each function adds solids to a visible Batch `v` and, where the thing blocks the way, a simple block to a collider
// Batch `c` (pass null to leave it out). Positions are world coordinates; `ang` follows Batch.frame (0 = local +X east,
// positive turns toward north). The batch frames are reset when a function returns.
import * as THREE from 'three';
import { pbr, plain, rng } from './hifi.js';

const CJK = '"PingFang SC","Microsoft YaHei","Noto Sans CJK SC","Source Han Sans SC","WenQuanYi Zen Hei",sans-serif';
const cache = new Map(), once = (key, make) => { if (!cache.has(key)) cache.set(key, make()); return cache.get(key); };

export const FURNITURE = {
  dark: () => plain('darkmetal', 0x2b2d30, 0.5, 0.6),
  green: () => plain('parkgreen', 0x24513c, 0.5, 0.35),
  steel: () => pbr('steel'),
  lamp: () => plain('lamp', 0xfff1d6, 0.4, 0, { emissive: 0xffe2b0, emissiveIntensity: 1.4 }),
  stone: () => pbr('paving', [0xa8a39a, 0x9a958c, 2, 2, [1.6, 1.6], 17, false]),
  kerb: () => pbr('concrete', [0xcbc7bd]),
  timber: () => pbr('timber'),
  soil: () => plain('soil', 0x4b3d2f, 1, 0),
  white: () => plain('whitepaint', 0xf4f3ef, 0.45, 0),
  blue: () => plain('signblue', 0x1f5fa8, 0.5, 0.2),
  binBlue: () => plain('binblue', 0x2a63a8, 0.45, 0.1),
  binGrey: () => plain('bingrey', 0x6d7175, 0.45, 0.1),
  binGreen: () => plain('bingreen', 0x2f7d46, 0.45, 0.1),
  binRed: () => plain('binred', 0xb5352c, 0.45, 0.1),
  rubberBlack: () => plain('rubberblack', 0x1b1b1d, 0.85, 0),
};
const F = FURNITURE;

/** Where lamps stand, in world coordinates: [x, z, radius of the pool of light on the ground]. Filled by the lamp functions here (and by modules that draw their own lamps). */
export const LIT = [];
/**
 * Pools of warm light on the ground under every lamp recorded in LIT, shown after dusk. Returns { mesh, update(env) } or
 * null if there are no lamps; call update with what ctx.animate hands over ({ lighting }).
 */
export function lightPools() {
  if (!LIT.length) return null;
  const S = 128, cv = document.createElement('canvas'); cv.width = cv.height = S; const g = cv.getContext('2d');
  const gr = g.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2); gr.addColorStop(0, '#ffffff'); gr.addColorStop(0.25, '#9a9a9a'); gr.addColorStop(0.6, '#2e2e2e'); gr.addColorStop(1, '#000000');
  g.fillStyle = gr; g.fillRect(0, 0, S, S);
  const map = new THREE.CanvasTexture(cv), power = { value: 0 };
  const material = new THREE.ShaderMaterial({
    uniforms: { map: { value: map }, uPower: power, uColor: { value: new THREE.Color(1.0, 0.78, 0.5) } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false,
    vertexShader: 'varying vec2 vUv;\nvoid main() { vUv = uv; gl_Position = projectionMatrix * viewMatrix * modelMatrix * instanceMatrix * vec4( position, 1.0 ); }',
    fragmentShader: 'uniform sampler2D map; uniform float uPower; uniform vec3 uColor; varying vec2 vUv;\nvoid main() { float a = texture2D( map, vUv ).r * uPower; gl_FragColor = vec4( uColor * a, 1.0 ); }',
  });
  material.name = 'lamp-pools';
  const geo = new THREE.PlaneGeometry(2, 2); geo.rotateX(-Math.PI / 2);
  const mesh = new THREE.InstancedMesh(geo, material, LIT.length), M = new THREE.Matrix4();
  LIT.forEach(([x, z, r], i) => mesh.setMatrixAt(i, M.makeScale(r, 1, r).setPosition(x, 0.075, z)));
  mesh.frustumCulled = false; mesh.renderOrder = 60; mesh.visible = false; mesh.name = 'lamp-pools';
  return { mesh, update(env) { const n = env && env.lighting && env.lighting.night ? env.lighting.night() : 0; power.value = 0.5 * n; mesh.visible = n > 0.02; } };
}

function within(v, c, x, z, ang, fn) { v.frame(x, z, ang); if (c) c.frame(x, z, ang); fn(); v.frame(); if (c) c.frame(); }

/** A card texture that shows exactly once on a quad of w by h metres built with Batch.quad (its texture coordinates are metres). */
function cardTexture(canvas, w, h) {
  const t = new THREE.CanvasTexture(canvas); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(1 / w, 1 / h); return t;
}

/** Garden lamp: slim dark post with an opal lantern. h: height of the lantern's underside. World coordinates (the batch frame must be the default). */
export function gardenLamp(v, c, x, z, h = 3.9) {
  v.cyl(F.dark(), x, 0, z, 0.13, 0.08, 12).cyl(F.dark(), x, 0.08, z, 0.1, 0.42, 12).cyl(F.dark(), x, 0.5, z, 0.065, h - 0.56, 10).cyl(F.dark(), x, h - 0.06, z, 0.11, 0.06, 12)
    .cyl(F.lamp(), x, h, z, 0.16, 0.42, 14).cyl(F.dark(), x, h + 0.42, z, 0.2, 0.05, 14).cyl(F.dark(), x, h + 0.47, z, 0.06, 0.1, 8);
  if (c) c.slab('generic', x - 0.1, 0, z - 0.1, 0.2, h, 0.2);
  LIT.push([x, z, 6]);
}

/** Road light: tapered column, a rising arm over the carriageway (local +X) and a flat LED head. */
export function streetLight(v, c, x, z, ang, h = 8.5, arm = 2.2) {
  const cs = Math.cos(ang), sn = Math.sin(ang), wx = d => x + cs * d, wz = d => z - sn * d;
  v.frame();
  v.cyl(F.steel(), x, 0, z, 0.2, 0.06, 12).cyl(F.steel(), x, 0.06, z, 0.11, h * 0.45, 12).cyl(F.steel(), x, 0.06 + h * 0.45, z, 0.085, h * 0.55 - 0.06, 12);
  v.strut(F.steel(), [x, h - 0.1, z], [wx(arm), h + 0.35, wz(arm)], 0.09);
  v.frame(wx(arm + 0.25), wz(arm + 0.25), ang, h + 0.36);
  v.box(F.dark(), 0, 0, 0, 0.8, 0.09, 0.3).box(F.lamp(), 0, -0.055, 0, 0.62, 0.02, 0.22);
  v.frame();
  if (c) { c.frame(); c.slab('generic', x - 0.15, 0, z - 0.15, 0.3, 3, 0.3); }
  LIT.push([wx(arm + 0.25), wz(arm + 0.25), h * 1.25]);
}

/** Park bench: cast legs, timber slats, a leaning back. Faces local +Z; 1.8 m long. */
export function bench(v, c, x, z, ang, back = true) {
  within(v, c, x, z, ang, () => {
    for (const s of [-0.72, 0.72]) {
      v.box(F.dark(), s, 0.21, 0, 0.06, 0.42, 0.46).box(F.dark(), s, 0.02, 0, 0.1, 0.04, 0.56);
      if (back) v.box(F.dark(), s, 0.62, -0.25, 0.06, 0.46, 0.05).box(F.dark(), s, 0.6, 0.02, 0.05, 0.04, 0.5);     // back stay and arm rest
    }
    for (let i = 0; i < 5; i++) v.box(F.timber(), 0, 0.445, -0.2 + i * 0.1, 1.8, 0.04, 0.085);
    if (back) for (let i = 0; i < 3; i++) v.box(F.timber(), 0, 0.58 + i * 0.115, -0.26 - i * 0.022, 1.8, 0.09, 0.035);
    if (c) c.box('generic', 0, 0.3, -0.03, 1.8, 0.6, 0.55);
  });
}

/** A pair of litter bins under one hood, as on Guangzhou streets: recyclables (blue) and other waste (grey). */
export function bins(v, c, x, z, ang, four = false) {
  within(v, c, x, z, ang, () => {
    const cols = four ? [F.binBlue(), F.binGreen(), F.binRed(), F.binGrey()] : [F.binBlue(), F.binGrey()], n = cols.length, w = 0.46;
    cols.forEach((m, i) => {
      const cx = (i - (n - 1) / 2) * (w + 0.05);
      v.box(m, cx, 0.5, 0, w, 0.78, 0.4).box(F.dark(), cx, 0.72, 0.205, w * 0.62, 0.12, 0.01).box(F.white(), cx, 0.42, 0.203, w * 0.5, 0.2, 0.008);
    });
    const span = n * (w + 0.05) + 0.06;
    v.box(F.steel(), 0, 0.06, 0, span, 0.05, 0.42).box(F.steel(), 0, 0.98, 0, span + 0.06, 0.04, 0.5);
    for (const s of [-1, 1]) v.box(F.steel(), s * span / 2, 0.5, 0, 0.03, 0.96, 0.42);
    if (c) c.box('generic', 0, 0.5, 0, span, 1, 0.5);
  });
}

/** Steel bollard. */
export function bollard(v, x, z, h = 0.75) { v.cyl(F.steel(), x, 0, z, 0.085, h, 12).cyl(F.steel(), x, h, z, 0.1, 0.04, 12); }

/** Square tree pit in paving: a granite frame round bare soil. s: outer size. */
export function treePit(v, x, z, s = 1.6, ang = 0) {
  v.frame(x, z, ang);
  const k = 0.14, h = 0.07;
  v.box(F.kerb(), 0, h / 2, -(s - k) / 2, s, h, k).box(F.kerb(), 0, h / 2, (s - k) / 2, s, h, k).box(F.kerb(), -(s - k) / 2, h / 2, 0, k, h, s - 2 * k).box(F.kerb(), (s - k) / 2, h / 2, 0, k, h, s - 2 * k)
    .box(F.soil(), 0, 0.02, 0, s - 2 * k, 0.04, s - 2 * k, 'D');
  v.frame();
}

// ---- notice boards -------------------------------------------------------------------------------------------------
const POSTERS = [
  ['校园公告', '#b3261e'], ['光荣榜', '#b8860b'], ['社团招新', '#1f6fb5'], ['科技节', '#0f7a6a'], ['校运会', '#c2410c'], ['阅读之星', '#6d3fa0'],
];
function posterMaterial(k, w, h) {
  return once('poster' + k + w + h, () => {
    const [title, colour] = POSTERS[k % POSTERS.length], W = 384, H = Math.round(W * h / w), cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    const g = cv.getContext('2d'), r = rng(911 + k * 37);
    g.fillStyle = '#f6f3ea'; g.fillRect(0, 0, W, H);
    g.fillStyle = colour; g.fillRect(0, 0, W, H * 0.17);
    g.fillStyle = '#ffffff'; g.font = `bold ${Math.round(H * 0.09)}px ${CJK}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(title, W / 2, H * 0.09);
    let y = H * 0.21;
    while (y < H * 0.94) {
      if (r() < 0.38 && y < H * 0.7) {                     // a row of photographs
        const n = 2 + Math.floor(r() * 2), ph = H * (0.1 + 0.06 * r()), pw = (W * 0.86 - (n - 1) * 8) / n;
        for (let i = 0; i < n; i++) {
          const px = W * 0.07 + i * (pw + 8), hue = Math.floor(r() * 360);
          const gr = g.createLinearGradient(px, y, px, y + ph); gr.addColorStop(0, `hsl(${hue},35%,72%)`); gr.addColorStop(1, `hsl(${(hue + 40) % 360},30%,42%)`);
          g.fillStyle = gr; g.fillRect(px, y, pw, ph);
          g.fillStyle = 'rgba(255,255,255,0.55)'; for (let q = 0; q < 3; q++) g.fillRect(px + pw * (0.15 + 0.25 * q), y + ph * (0.45 + 0.1 * r()), pw * 0.12, ph * 0.5);
        }
        y += ph + 12;
      } else {                                             // a paragraph: a coloured sub-heading and grey lines
        g.fillStyle = colour; g.fillRect(W * 0.07, y, W * (0.2 + 0.25 * r()), 7); y += 14;
        const lines = 3 + Math.floor(r() * 4);
        for (let i = 0; i < lines && y < H * 0.94; i++) { g.fillStyle = '#8b8880'; g.fillRect(W * 0.07, y, W * (i === lines - 1 ? 0.3 + 0.4 * r() : 0.86), 4); y += 10; }
        y += 8;
      }
    }
    g.strokeStyle = 'rgba(0,0,0,0.25)'; g.lineWidth = 2; g.strokeRect(1, 1, W - 2, H - 2);
    const m = new THREE.MeshStandardMaterial({ map: cardTexture(cv, w, h), roughness: 0.18, metalness: 0, envMapIntensity: 0.9 }); m.name = 'hifi-poster'; return m;
  });
}
function headerMaterial(text, w, h) {
  return once('header' + text + w + h, () => {
    const W = 512, H = Math.max(16, Math.round(W * h / w)), cv = document.createElement('canvas'); cv.width = W; cv.height = H; const g = cv.getContext('2d');
    g.fillStyle = '#1d4f9c'; g.fillRect(0, 0, W, H); g.fillStyle = '#ffffff'; g.font = `bold ${Math.round(H * 0.62)}px ${CJK}`; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText([...text].join(' '), W / 2, H * 0.54);
    const m = new THREE.MeshStandardMaterial({ map: cardTexture(cv, w, h), roughness: 0.5 }); m.name = 'hifi-boardhead'; return m;
  });
}
/**
 * Notice board (宣传栏): a row of glazed poster cases under a small roof, on steel posts. Faces local +Z.
 * panels: number of cases; first: index of the first poster design.
 */
export function noticeBoard(v, c, x, z, ang, panels = 3, first = 0, title = '宣传栏') {
  within(v, c, x, z, ang, () => {
    const pw = 1.0, ph = 1.3, gap = 0.12, W = panels * pw + (panels + 1) * gap, y0 = 0.75;
    for (const s of [-1, 1]) v.box(F.steel(), s * (W / 2 + 0.05), 1.3, 0, 0.1, 2.6, 0.1);
    v.box(F.steel(), 0, y0 + ph / 2 + 0.02, -0.04, W, ph + 0.28, 0.06);                                              // back sheet
    v.box(F.steel(), 0, y0 - 0.14, 0, W, 0.05, 0.14).box(F.steel(), 0, y0 + ph + 0.16, 0, W, 0.05, 0.14);
    for (let i = 0; i < panels; i++) {
      const cx = -W / 2 + gap + pw / 2 + i * (pw + gap), m = posterMaterial(first + i, pw, ph);
      v.quad(m, [cx - pw / 2, y0, 0], [cx + pw / 2, y0, 0], [cx + pw / 2, y0 + ph, 0], [cx - pw / 2, y0 + ph, 0]);
      for (const s of [-1, 1]) v.box(F.dark(), cx + s * (pw / 2 + 0.015), y0 + ph / 2, 0.01, 0.03, ph + 0.06, 0.04);
      v.box(F.dark(), cx, y0 - 0.015, 0.01, pw + 0.06, 0.03, 0.04).box(F.dark(), cx, y0 + ph + 0.015, 0.01, pw + 0.06, 0.03, 0.04);
    }
    const hh = 0.3, hm = headerMaterial(title, W, hh);
    v.quad(hm, [-W / 2, 2.28, 0.03], [W / 2, 2.28, 0.03], [W / 2, 2.28 + hh, 0.03], [-W / 2, 2.28 + hh, 0.03]);
    v.box(F.steel(), 0, 2.43, -0.02, W, hh, 0.08);
    v.box(F.dark(), 0, 2.66, 0.12, W + 0.5, 0.05, 0.9);                                                               // roof
    v.box(F.lamp(), 0, 2.62, 0.3, W - 0.4, 0.02, 0.06);
    if (c) c.box('generic', 0, 1.3, 0, W + 0.2, 2.6, 0.24);
  });
}

// ---- bicycles ------------------------------------------------------------------------------------------------------
function bikeMaterial(k) {
  return once('bike' + k, () => {
    const W = 320, H = 192, cv = document.createElement('canvas'); cv.width = W; cv.height = H; const g = cv.getContext('2d');
    const colour = ['#c0392b', '#1f6fb5', '#2c2c2e', '#e0a020', '#2e8b57', '#dadada'][k % 6], R = 50, yA = H - R - 6, xB = 72, xF = W - 72;
    g.lineCap = 'round'; g.lineJoin = 'round';
    for (const cx of [xB, xF]) {
      g.strokeStyle = '#161616'; g.lineWidth = 7; g.beginPath(); g.arc(cx, yA, R, 0, 6.283); g.stroke();
      g.strokeStyle = '#9a9a9a'; g.lineWidth = 1.2; for (let i = 0; i < 14; i++) { const a = i / 14 * 6.283; g.beginPath(); g.moveTo(cx, yA); g.lineTo(cx + Math.cos(a) * (R - 3), yA + Math.sin(a) * (R - 3)); g.stroke(); }
      g.fillStyle = '#7a7a7a'; g.beginPath(); g.arc(cx, yA, 5, 0, 6.283); g.fill();
    }
    const bb = [150, yA + 2], seat = [128, 62], head = [232, 58];
    g.strokeStyle = colour; g.lineWidth = 7;
    g.beginPath(); g.moveTo(xB, yA); g.lineTo(...bb); g.lineTo(...seat); g.lineTo(xB, yA); g.stroke();                 // rear triangle
    g.beginPath(); g.moveTo(...bb); g.lineTo(head[0] - 6, head[1] + 22); g.lineTo(...seat); g.stroke();                // down tube, top tube
    g.beginPath(); g.moveTo(head[0], head[1]); g.lineTo(xF, yA); g.stroke();                                           // fork
    g.strokeStyle = '#1c1c1c'; g.lineWidth = 6; g.beginPath(); g.moveTo(seat[0], seat[1]); g.lineTo(seat[0] - 5, seat[1] - 16); g.stroke();
    g.lineWidth = 9; g.beginPath(); g.moveTo(seat[0] - 22, seat[1] - 19); g.lineTo(seat[0] + 12, seat[1] - 17); g.stroke();   // saddle
    g.lineWidth = 6; g.beginPath(); g.moveTo(head[0], head[1]); g.lineTo(head[0] - 5, head[1] - 20); g.lineTo(head[0] + 16, head[1] - 26); g.stroke();   // stem, bar
    g.fillStyle = '#555'; g.beginPath(); g.arc(bb[0], bb[1], 11, 0, 6.283); g.fill();                                  // chainring
    g.strokeStyle = '#333'; g.lineWidth = 4; g.beginPath(); g.moveTo(bb[0], bb[1]); g.lineTo(bb[0] + 14, bb[1] + 20); g.stroke();
    if (k % 2 === 0) { g.strokeStyle = '#3a3a3a'; g.lineWidth = 3; g.strokeRect(head[0] + 6, head[1] - 12, 34, 24); }  // basket
    const tex = cardTexture(cv, 1.7, 1.02);
    const m = new THREE.MeshStandardMaterial({ map: tex, alphaTest: 0.4, side: THREE.DoubleSide, roughness: 0.55, metalness: 0.2 }); m.name = 'hifi-bicycle'; return m;
  });
}
/** A row of parked bicycles at a steel rack. The row runs along local +X; n: number of stands, about two thirds taken. */
export function bikeRack(v, c, x, z, ang, n = 10, seed = 1) {
  const r = rng(seed * 331 + 5);
  within(v, c, x, z, ang, () => {
    const pitch = 0.62, L = n * pitch;
    v.box(F.steel(), 0, 0.03, 0.55, L + 0.2, 0.04, 0.05).box(F.steel(), 0, 0.03, -0.1, L + 0.2, 0.04, 0.05);
    for (let i = 0; i <= n; i++) { const cx = -L / 2 + i * pitch; v.box(F.steel(), cx, 0.2, 0.55, 0.035, 0.4, 0.035).box(F.steel(), cx, 0.2, -0.1, 0.035, 0.4, 0.035).box(F.steel(), cx, 0.4, 0.22, 0.035, 0.035, 0.7); }
    for (let i = 0; i < n; i++) {
      if (r() < 0.32) continue;
      const cx = -L / 2 + (i + 0.5) * pitch + (r() - 0.5) * 0.08, lean = (r() - 0.5) * 0.16, flip = r() < 0.5 ? 1 : -1, m = bikeMaterial(Math.floor(r() * 6));
      const z0 = 0.95 * flip + 0.1, z1 = -0.75 * flip + 0.1;        // the card runs across the rack (local Z), front wheel in the stand
      v.quad(m, [cx, 0, z0], [cx, 0, z1], [cx + lean, 1.02, z1], [cx + lean, 1.02, z0]);
    }
    if (c) c.box('generic', 0, 0.5, 0.1, L + 0.2, 1, 1.7);
  });
}

// ---- direction signs -----------------------------------------------------------------------------------------------
function plateMaterial(text, w, h, arrow) {
  return once('plate' + text + arrow, () => {
    const W = 512, H = Math.round(W * h / w), cv = document.createElement('canvas'); cv.width = W; cv.height = H; const g = cv.getContext('2d');
    g.fillStyle = '#1f5fa8'; g.fillRect(0, 0, W, H); g.strokeStyle = '#ffffff'; g.lineWidth = 5; g.strokeRect(6, 6, W - 12, H - 12);
    g.fillStyle = '#ffffff'; g.font = `bold ${Math.round(H * 0.54)}px ${CJK}`; g.textBaseline = 'middle'; g.textAlign = arrow > 0 ? 'left' : 'right';
    g.fillText(text, arrow > 0 ? W * 0.07 : W * 0.93, H * 0.54);
    const ax = arrow > 0 ? W * 0.86 : W * 0.14, s = H * 0.26 * arrow;
    g.beginPath(); g.moveTo(ax + s, H / 2); g.lineTo(ax - s * 0.2, H / 2 - Math.abs(s)); g.lineTo(ax - s * 0.2, H / 2 - Math.abs(s) * 0.4); g.lineTo(ax - s * 1.1, H / 2 - Math.abs(s) * 0.4);
    g.lineTo(ax - s * 1.1, H / 2 + Math.abs(s) * 0.4); g.lineTo(ax - s * 0.2, H / 2 + Math.abs(s) * 0.4); g.lineTo(ax - s * 0.2, H / 2 + Math.abs(s)); g.closePath(); g.fill();
    const m = new THREE.MeshStandardMaterial({ map: cardTexture(cv, w, h), roughness: 0.45, metalness: 0.2, side: THREE.DoubleSide }); m.name = 'hifi-signplate'; return m;
  });
}
/**
 * Finger post: a steel post with blue plates. plates: [[text, arrow]...] top to bottom, arrow +1 = pointing to local +X,
 * -1 = to local -X. The plates face local +Z (and read mirrored from behind, as thin plates do).
 */
export function fingerPost(v, c, x, z, ang, plates) {
  within(v, c, x, z, ang, () => {
    v.cyl(F.steel(), 0, 0, 0, 0.11, 0.05, 10).cyl(F.steel(), 0, 0.05, 0, 0.045, 2.75, 10).cyl(F.steel(), 0, 2.8, 0, 0.06, 0.05, 10);
    plates.forEach(([text, arrow], i) => {
      const w = 1.15, h = 0.24, y = 2.45 - i * 0.3, x0 = arrow > 0 ? 0.06 : -0.06 - w, m = plateMaterial(text, w, h, arrow);
      v.quad(m, [x0, y, 0.02], [x0 + w, y, 0.02], [x0 + w, y + h, 0.02], [x0, y + h, 0.02]);
    });
    if (c) c.slab('generic', -0.08, 0, -0.08, 0.16, 2.8, 0.16);
  });
}

/** Low stone planter box with soil: centre (x, z), size w by d, height h. The planting is the caller's. */
export function planter(v, c, x, z, ang, w, d, h = 0.45) {
  within(v, c, x, z, ang, () => {
    const t = 0.14;
    v.box(F.stone(), 0, h / 2, -(d - t) / 2, w, h, t).box(F.stone(), 0, h / 2, (d - t) / 2, w, h, t).box(F.stone(), -(w - t) / 2, h / 2, 0, t, h, d - 2 * t).box(F.stone(), (w - t) / 2, h / 2, 0, t, h, d - 2 * t)
      .box(F.soil(), 0, h - 0.06, 0, w - 2 * t, 0.04, d - 2 * t, 'D');
    if (c) c.box('generic', 0, h / 2, 0, w, h, d);
  });
}
