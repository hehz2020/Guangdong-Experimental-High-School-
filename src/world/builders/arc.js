// Long curved building north of the teaching core (item "arc-building"), inside and out.
// (Showpiece pass in progress: this stage has the exterior, the roof garden and solid colliders; the interior follows.)
//
// DEPTH (the one thing here that does not come straight from the data item)
// The item is a band 13.7 m deep. Its convex (north) edge is the outer roof edge; its concave edge lies at the inner
// side of the row of roof openings. The second reading of the mosaic (eight cross-sections; scratch file
// shots/measure/corrections.json) gives this roof section, from the outer edge inward: solid roof about 9 m, a row of
// openings 5.2 m, a solid strip 4.3 m, 68 to 72 px (about 19 m) in all. The item keeps its band, so the extra depth is a
// constant in this file, measured from the band's concave edge: the canopy's inner edge lies INNER = 4.3 m beyond that
// edge, and the concave facade EXT = INNER - OVI = 3.3 m beyond it. Built that way the canopy is 18.6 m deep:
// 9.1 m solid, 5.2 m of openings, 4.3 m solid.
// The inner strip is NOT modelled as a deep eave in front of a facade that stays on the band, because of what the
// 2022 "一本书的梦" frames show:
// - frames 14, 16, 17 (from below, brightness profiles beside the columns): under the concave fascia first a solid
//   soffit, then the openings (sky and distant towers seen through them), then the white face of a deep beam, then
//   dark soffit. So the solid strip is on the concave side of the openings, as in the mosaic.
// - frame 18 (camera between parapet and canopy level): the big round columns stand directly behind the wide white
//   coping of the red parapet, with shrubs and trees right behind them; in frames 14, 16, 17 and 18 their tops meet
//   the soffit a quarter to a half of the way across the solid strip, that is 1 to 2 m behind the fascia.
// - frame 16: the red-framed facade is one vertical plane from that coping down to the ground.
// So the roof garden and the facade reach the inner edge, and the canopy overhangs the facade by about a metre.
//
// SEEN in the references
// - Concave (south) face, 2022 frames 9-18: a red frame (wide red end pier, red band from the top windows up to the
//   parapet, wide white coping) around a cream field with four rows of ribbon windows; a white ledge over each
//   window row with air-conditioner units standing on it; a white surround to the top row; curtains behind the glass.
//   The red cladding is a speckled orange-red tile (the notes call it red brick). 2018 frames 67-69 show the same
//   red-framed field starting right behind the west corner, so the motif is repeated along the whole face.
// - Roof, frames 14-18, frame 58 and 2018 frames 2-3: a roof garden behind the red parapet and, over it, a flat grey
//   concrete canopy with a deep white edge. Frame 58 looks at it from the north (from the new building's roof): a
//   wide solid strip, then rectangular openings with white rims and trees growing up through them, then a narrow
//   strip. White cross beams run across the canopy at equal steps: 21.9 px = 6.0 m apart along the row of openings
//   in the mosaic (nine beams between px x 1275 and 1450), modelled as every second bay (5.9 m on the concave face).
//   On the concave side round white columns stand under three of every five beams (gaps of one, two and two steps;
//   frames 14, 16 and 17). A smaller post stands under the far side of the openings (frame 17).
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
// - That the extra depth is the same along the whole building, the west end under the tilted roof included (the eight
//   cross-sections lie between px x 1010 and 1575; near the east end the roof is about 80 px deep), and that every
//   floor is as deep as the top one (frame 16 shows one field of the facade; the mosaic cannot show the concave face).
//   The canopy overhang beyond the concave facade (1.0 m, from the column tops) and beyond the convex one (0.6 m).
// - Which stretch of the concave face the 2022 frames show, hence the number of red-framed fields (five) and the
//   width of the red piers between them (two bays); bay length 3 m; pane size.
// - Storey heights: item.height (an estimate) is split 1.2 : 1 : 1 : 1 storeys, then parapet, posts and canopy edge in
//   the proportions read from frame 16. The canopy top is at item.height.
// - The tilted west roof: its plan outline, fold line and overhangs, its rise (0.37 x item.height above the canopy at
//   the tip, read from frames 53 and 67, so the tip stands ABOVE item.height), and the number and exact places of the
//   tall columns. The louvred panel's size, number of slats and the two props under it. The glass box's depth.
// - Canopy details: where along the building the column rhythm starts; column diameter (0.6 m); that the posts on the
//   convex parapet and the posts under the far side of the openings stand under the same beams as the columns; the
//   size of the deep beam and of the rims; that the row of openings starts where the flat canopy is deep enough
//   beside the tilted roof and stops one bay short of the east end; the width of the coping (0.6 m).
// - Size and position of the cream panel and its windows on the east end wall.
//
// IMAGINED (the owner asked for a complete, good-looking building and said facts and proportions need not be exact)
// - The whole convex (north) face below the parapet: plinth, cream render, a window per bay between piers, white
//   ledges with air-conditioners, rainwater pipes, two service doors. Its first bays, under the tilted roof, are red
//   (seen); where the red stops is a guess.
// - The ground floor everywhere (hidden by planting or trees in every frame): a granite plinth with the ground floor
//   three steps above the pavement; a main entrance in the middle field (three glazed bays, a deep canopy on steel
//   columns, standing red letters) and a glazed double door with steps and a small canopy in each other field.
// - The building's name 求实楼 (after the school's motto) and every sign text.
// - Everything at close range: window frames, drapes and blinds, the dark rooms behind the windows of the parts that
//   cannot be entered, pipes, stains, the paved apron at the foot of the concave face.
// - The roof garden's layout (planting is seen, its layout is not): hedged beds along both parapets, a timber walk,
//   lawn with trees under the openings, a paved promenade with benches, low lights.
// NOT MODELLED: the green bicycle shelter at the foot of the west end (2018 frames 55-56); the dark green glazed
// section beside the east end (2018 frame 2); stretches of the roof where the mosaic shows no dark openings.
// Where the round dome building stands in the convex face the wall is left plain (dome.js builds that junction).
import { THREE } from '../../kit.js';
import { Batch } from '../../batch.js';
import { pbr, plain, SURFACES } from '../../hifi.js';
import { broadleafTrees, shrubs, flowers } from '../../flora.js';
import { LIT } from '../../street.js';
import { textTexture } from '../../signs.js';

const BAY = 2.97, PANES = 3, ATLAS = 8;      // bay length on the concave face = three window panes; panes in one repeat of the glass texture
const T = 0.3, PROUD = 0.15, OV = 0.6;       // wall thickness; how far the red frame stands proud of the cream field; canopy overhang beyond the convex face
const SLAB = 0.25, FASCIA = 0.8;             // canopy slab thickness and depth of its white edge
// Roof section (see DEPTH in the header). INNER: the solid inner strip of the canopy, measured from the data band's concave
// edge; VOID: depth of the row of openings, which ends at that edge; OVI: canopy overhang beyond the concave facade.
const INNER = 4.3, VOID = 5.2, OVI = 1.0;
const EXT = INNER - OVI;                     // how far the concave facade stands beyond the data band's concave edge
const D1 = EXT, D2 = EXT + VOID;             // the row of roof openings lies between these distances from the concave facade
const STN = 2, COLS = [0, 1, 3];             // a cross beam every STN bays; columns under these beams of every five
const COL_R = 0.3, COL_D = 0.75, COPE = 0.6; // round columns behind the concave parapet: radius, distance in from the facade; coping width
const GX = 3.6, GD = 3.6, RECESS = 2.4;      // glass box at the west end (width, depth); how far the cream end wall sits back
const GF = 0.45;                             // IMAGINED: the ground floor stands three steps above the pavement
const UP = [0, 1, 0], DOWN = [0, -1, 0];
const SANS = '"PingFang SC","Microsoft YaHei","Noto Sans CJK SC","Source Han Sans SC","WenQuanYi Zen Hei",sans-serif';

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
/**
 * The plan: the two long edges, smoothed and cut into NB bays of equal length on the concave side. I[j], O[j]: bay corners
 * on the concave facade and on the convex one; X[j]: unit vector across the building at cross-section j (concave to convex);
 * W[j]: depth there. Pure numbers, so dome.js and the walk tests can use it.
 */
export function layout(item) {
  const half = item.points.length >> 1;
  let ea = item.points.slice(0, half), eb = item.points.slice(half).reverse();      // facing points of the two long edges
  if (ea[0][0] > ea[half - 1][0]) { ea.reverse(); eb.reverse(); }                    // run west to east
  const polyLen = p => p.slice(1).reduce((s, q, i) => s + dist(q, p[i]), 0);
  const [inn, out] = polyLen(ea) <= polyLen(eb) ? [ea, eb] : [eb, ea];               // the shorter edge is the concave one
  const dn = smooth(out, 24), di = smooth(inn, 24).map((p, k) => add(p, mul(unit(sub(p, dn[k])), EXT))), cum = [0];   // the facade stands EXT beyond the band
  for (let i = 1; i < di.length; i++) cum.push(cum[i - 1] + dist(di[i], di[i - 1]));
  const total = cum[cum.length - 1], NB = Math.max(16, Math.round(total / BAY)), bay = total / NB;
  const I = [], O = [];
  for (let j = 0, k = 0; j <= NB; j++) {
    const s = Math.min(j * bay, total); while (k < cum.length - 2 && cum[k + 1] < s) k++;
    const f = (s - cum[k]) / (cum[k + 1] - cum[k]); I.push(mix(di[k], di[k + 1], f)); O.push(mix(dn[k], dn[k + 1], f));
  }
  return { NB, bay, I, O, W: I.map((p, j) => dist(p, O[j])), X: I.map((p, j) => unit(sub(O[j], p))) };
}
/** Local frame running from A to B: +X along the wall, +Z to the right of that direction (the outside when walking with the building on the left). `back`: the local x of A (keeps textures running on from bay to bay). Returns the length. */
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
/** Quad with its own texture coordinates: corners p0..p3 in order (counter-clockwise seen from the side it faces), (u0, v0) at p0 to (u1, v1) at p2. Current frame of the batch. */
function uvq(b, material, p0, p1, p2, p3, u0 = 0, v0 = 0, u1 = 1, v1 = 1) {
  const p = b._part(material), base = p.pos.length / 3, e = [p1[0] - p0[0], p1[1] - p0[1], p1[2] - p0[2]], f = [p3[0] - p0[0], p3[1] - p0[1], p3[2] - p0[2]];
  let n = [e[1] * f[2] - e[2] * f[1], e[2] * f[0] - e[0] * f[2], e[0] * f[1] - e[1] * f[0]]; const l = Math.hypot(n[0], n[1], n[2]) || 1; n = n.map(q => q / l);
  for (const [q, s, t] of [[p0, u0, v0], [p1, u1, v0], [p2, u1, v1], [p3, u0, v1]]) b._vert(p, q[0], q[1], q[2], n[0], n[1], n[2], s, t);
  p.idx.push(base, base + 1, base + 2, base, base + 2, base + 3);
}

// ---- textures drawn in code ----
function canvasTex(w, h, draw, repeat = null) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(1 / repeat[0], 1 / repeat[1]); }
  return t;
}
const pleats = () => canvasTex(64, 8, (g, W, H) => {                        // vertical folds of a drape, one repeat = 0.42 m
  for (let x = 0; x < W; x++) { const k = Math.round(255 * (0.74 + 0.26 * Math.abs(Math.sin(x / W * Math.PI * 4)))); g.fillStyle = `rgb(${k},${k},${k})`; g.fillRect(x, 0, 1, H); }
}, [0.42, 1]);
const streaks = () => canvasTex(128, 128, (g, W, H) => {                    // rain streaks under copings and sills: dark at the top, fading out downward
  const r = rng(77); g.clearRect(0, 0, W, H);
  for (let i = 0; i < 26; i++) {
    const x = r() * W, w = 2 + r() * 9, len = H * (0.35 + 0.65 * r()), gr = g.createLinearGradient(0, 0, 0, len);
    gr.addColorStop(0, `rgba(58,50,42,${0.3 + 0.3 * r()})`); gr.addColorStop(1, 'rgba(58,50,42,0)'); g.fillStyle = gr; g.fillRect(x, 0, w, len);
  }
  const top = g.createLinearGradient(0, 0, 0, H * 0.18); top.addColorStop(0, 'rgba(58,50,42,0.3)'); top.addColorStop(1, 'rgba(58,50,42,0)'); g.fillStyle = top; g.fillRect(0, 0, W, H * 0.18);
}, [1, 1]);
/** One texture holding several sign plates as rows: lines = [[text, background, colour]...]. Returns { material, row(i) -> [v0, v1] }. */
function signAtlas(name, lines, rowH = 64, W = 512) {
  const n = lines.length, map = canvasTex(W, rowH * n, g => {
    lines.forEach(([text, bg = '#1f4f8f', fg = '#ffffff'], i) => {
      g.fillStyle = bg; g.fillRect(0, i * rowH, W, rowH); g.strokeStyle = 'rgba(255,255,255,0.35)'; g.lineWidth = 2; g.strokeRect(3, i * rowH + 3, W - 6, rowH - 6);
      g.fillStyle = fg; g.font = `bold ${Math.round(rowH * 0.56)}px ${SANS}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, W / 2, i * rowH + rowH * 0.54, W - 24);
    });
  });
  const material = new THREE.MeshStandardMaterial({ map, roughness: 0.4, metalness: 0.15 }); material.name = 'arc-' + name;
  return { material, row: i => [1 - (i + 1) / n, 1 - i / n] };
}

// ---- materials ----
let M = null;
function materials() {
  if (M) return M;
  const std = (name, o) => { const mm = new THREE.MeshStandardMaterial(o); mm.name = 'arc-' + name; return mm; };
  const P = (name, color, rough = 0.8, metal = 0, over = {}) => plain('arc-' + name, color, rough, metal, over);
  const gz = SURFACES.glazing(0x8fb0a4, ATLAS, 1, [ATLAS, 1], 7);                    // one row of panes: sky above, a dark band of trees below; u counts panes
  const cw = SURFACES.glazing(0x54b8b2, 2, 2, [2.4, 2.4], 13), name = textTexture('求实楼', { color: '#a8231c', spacing: 0.34 });
  const fold = pleats();
  M = {
    red: pbr('brick', [0xb4513a]),                                                    // the speckled orange-red facing of the frame
    cream: pbr('concrete', [0xe8dcba]),                                               // cream render of the fields
    ctop: pbr('concrete', [0x8f918f]),                                                // canopy top
    gran: pbr('granitePolished', [0x5c5856, 9]), stone: pbr('paving', [0xa8a39a, 0x9a958c, 2, 2, [1.6, 1.6], 17, false]),
    pave: pbr('paving', [0xc6bfae, 0xb2aa99, 3, 3, [1.8, 1.8], 23, false]), lawn: pbr('lawn'), hedge: pbr('hedge'),
    boards: pbr('boards', [0xa98458, 1.2]), timber: pbr('timber'), steel: pbr('steel'),
    white: P('whitepaint', 0xf1f0ea, 0.7), frame: P('frame', 0xe6e8e4, 0.45, 0.2), ac: P('acunit', 0xe2e2dc, 0.6), grille: P('grille', 0x4b5154, 0.7), pvc: P('pvc', 0xd9d7cf, 0.6),
    dark: P('darkroom', 0x1d2325, 0.95), bronze: P('bronze', 0x3a3632, 0.45, 0.6), soil: P('soil', 0x4b3d2f, 1), doorSteel: P('servicedoor', 0x8b9499, 0.5, 0.4),
    // the same glass seen from outside (it mirrors the sky and glows after dusk: the lighting module goes by the name) and from inside (clear)
    glass: std('glass-ribbon', { map: gz.map, normalMap: gz.normalMap, roughness: 0.05, metalness: 0.55, envMapIntensity: 1.5, transparent: true, opacity: 0.8, depthWrite: false }),
    lite: std('lite-inner', { color: 0xd6e6ea, roughness: 0.08, metalness: 0, transparent: true, opacity: 0.1, depthWrite: false }),
    gsolid: std('glass-small', { map: gz.map, normalMap: gz.normalMap, roughness: 0.05, metalness: 0.6, envMapIntensity: 1.5 }),
    gdoor: std('glass-door', { color: 0xa9cdd4, roughness: 0.05, metalness: 0.3, transparent: true, opacity: 0.34, depthWrite: false, envMapIntensity: 1.4 }),
    cw: std('curtainwall', { map: cw.map, normalMap: cw.normalMap, roughness: 0.05, metalness: 0.6, envMapIntensity: 1.5 }),
    drape: [std('drape-lilac', { map: fold, color: 0xcfc4da, roughness: 0.95, side: THREE.DoubleSide }), std('drape-pale', { map: fold, color: 0xe9efe3, roughness: 0.95, side: THREE.DoubleSide })],
    stain: std('streaks', { map: streaks(), transparent: true, depthWrite: false, roughness: 1, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -4 }),
    lamp: plain('lamp', 0xfff1d6, 0.4, 0, { emissive: 0xffe2b0, emissiveIntensity: 1.4 }),
    letters: std('letters', { map: name.texture, alphaTest: 0.5, roughness: 0.45, metalness: 0.1, side: THREE.DoubleSide }), lettersAspect: name.aspect,
    signs: signAtlas('signs', [['广东实验中学 · 求实楼', '#b08d57', '#2a1f14'], ['行政办公 · 艺术 · 信息技术', '#b08d57', '#2a1f14'], ['西门厅'], ['东门厅'], ['西区入口'], ['东区入口'], ['设备用房 · 闲人免进', '#8a2f2b']]),
  };
  for (const k of ['dark', 'white', 'frame', 'ac', 'grille', 'pvc', 'soil', 'bronze', 'doorSteel']) M[k].userData.flat = true;   // plain paints: merged into one vertex-coloured mesh
  return M;
}
// Draw-call saver: the plain-coloured parts marked userData.flat become ONE mesh with vertex colours.
let flatMat = null;
function mergeFlat(group, castShadow) {
  const take = group.children.filter(o => o.isMesh && !o.isInstancedMesh && o.material.userData.flat);
  if (take.length < 2) return group;
  let nv = 0, ni = 0; for (const o of take) { nv += o.geometry.attributes.position.count; ni += o.geometry.index.count; }
  const pos = new Float32Array(nv * 3), nor = new Float32Array(nv * 3), col = new Float32Array(nv * 3), idx = new Uint32Array(ni);
  let v0 = 0, i0 = 0;
  for (const o of take) {
    const g = o.geometry, n = g.attributes.position.count, c = o.material.color, ix = g.index.array;
    pos.set(g.attributes.position.array, v0 * 3); nor.set(g.attributes.normal.array, v0 * 3);
    for (let i = 0; i < n; i++) { col[(v0 + i) * 3] = c.r; col[(v0 + i) * 3 + 1] = c.g; col[(v0 + i) * 3 + 2] = c.b; }
    for (let i = 0; i < ix.length; i++) idx[i0 + i] = ix[i] + v0;
    v0 += n; i0 += ix.length; group.remove(o); g.dispose();
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.BufferAttribute(nor, 3)); g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  g.setIndex(new THREE.BufferAttribute(idx, 1));
  if (!flatMat) { flatMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.72, metalness: 0.03 }); flatMat.name = 'arc-flat'; }
  const mesh = new THREE.Mesh(g, flatMat); mesh.castShadow = castShadow; mesh.receiveShadow = true; group.add(mesh);
  return group;
}

export function build(item, ctx) {
  const H = item.height, m = materials(), rnd = rng(20221), low = !!ctx.lowPower;
  const { NB, bay, I, O, W, X } = layout(item), PW = bay / PANES;
  const pt = (j, d) => add(I[j], mul(X[j], d));                                      // point on cross-section j, d metres in from the concave face
  const at = (s, d) => { const j = Math.max(0, Math.min(NB - 1, Math.floor(s))); return mix(pt(j, d), pt(j + 1, d), s - j); };   // the same at a fractional station
  const drum = ((ctx.campus && ctx.campus.items) || []).find(i => i.style === 'dome');
  const nearDrum = (p, r) => !!drum && dist(p, [drum.cx, drum.cz]) < r;

  // ---------- heights, all derived from item.height ----------
  const u = H / 5.75, F = [GF, 1.2 * u, 2.2 * u, 3.2 * u], deck = 4.2 * u, WIN = 0.5 * u;
  const sill = [0.42 * u, F[1] + 0.28 * u, F[2] + 0.28 * u, F[3] + 0.28 * u], head = sill.map(s => s + WIN);
  const parapet = deck + 0.55 * u, beamY = H - FASCIA;

  // red-framed fields along the concave face: pier (1 bay), then fields of `fb` bays separated by 2-bay piers
  const nF = Math.max(1, Math.round((NB - 3) / 12)), fb = Math.floor((NB - 3 - 2 * (nF - 1)) / nF);
  const fieldOf = new Array(NB).fill(-1), posIn = new Array(NB).fill(0), doorOf = new Array(NB).fill(null);
  for (let f = 0, j = 1; f < nF; f++, j += fb + 2) { for (let i = 0; i < fb; i++) { fieldOf[j + i] = f; posIn[j + i] = i; } doorOf[j + (fb >> 1)] = 'side'; }
  const jMain = 1 + (nF >> 1) * (fb + 2) + (fb >> 1);                                // the main entrance: three bays in the middle of the middle field
  doorOf[jMain] = 'main'; doorOf[jMain - 1] = doorOf[jMain + 1] = 'flank';
  const isOpen = () => false;                                                        // bays that can be entered (none yet)

  // the tilted west roof is hinged on a fold line that runs from cross-section jfi on the concave edge to jfo on the convex edge
  const jfi = Math.min(NB - 4, Math.max(1, Math.round(6 / bay))), jfo = Math.min(NB - 2, Math.max(jfi + 2, Math.round(24.5 / bay)));

  const v = new Batch(), ex = new Batch(), c = new Batch();                          // always drawn; fine exterior fittings (near only); colliders
  const world = (A, B, x, z) => { const t = unit(sub(B, A)); return [A[0] + t[0] * x - t[1] * z, A[1] + t[1] * x + t[0] * z]; };   // local (x, z) of along(A, B) in world coordinates

  // ---------- parts shared by the faces (all in the current frame of v: x along the face, +z outward) ----------
  // Ribbon window on storey k between x0 and x1; zf: the outer face of the wall. Glass set back in an aluminium frame; behind it
  // drapes, and for the bays that cannot be entered a dark room.
  const ribbon = (x0, x1, k, zf, open, n = Math.max(1, Math.round((x1 - x0) / PW))) => {
    const s = sill[k], hd = head[k], pw = (x1 - x0) / n, zg = zf - 0.17, u0 = Math.floor(rnd() * ATLAS), back = open ? '' : 'N';
    uvq(v, m.glass, [x0, s, zg], [x1, s, zg], [x1, hd, zg], [x0, hd, zg], u0, 0, u0 + n, 1);
    if (open) uvq(v, m.lite, [x1, s, zg - 0.012], [x0, s, zg - 0.012], [x0, hd, zg - 0.012], [x1, hd, zg - 0.012]);
    v.slab(m.frame, x0, s, zg - 0.03, x1 - x0, 0.05, 0.06, 'EWD' + back).slab(m.frame, x0, hd - 0.05, zg - 0.03, x1 - x0, 0.05, 0.06, 'EWU' + back).slab(m.frame, x0, s + 0.7 * WIN, zg - 0.03, x1 - x0, 0.04, 0.06, 'EW' + back);
    for (let i = 1; i < n; i++) v.slab(m.frame, x0 + i * pw - 0.025, s + 0.05, zg - 0.03, 0.05, WIN - 0.1, 0.06, 'UD' + back);
    for (let i = 0; i < n; i++) {                                                    // drapes: drawn fully, partly, or gathered at the side
      const q = rnd(), dm = m.drape[rnd() < 0.45 ? 0 : 1], zd = zf - 0.36;
      if (open ? q > 0.3 : q > 0.72) continue;
      const w = open ? 0.22 + 0.12 * rnd() : q < 0.5 ? pw - 0.04 : pw * (0.3 + 0.3 * rnd()), xa = rnd() < 0.5 ? x0 + i * pw + 0.02 : x0 + (i + 1) * pw - 0.02 - w;
      v.quad(dm, [xa, s - 0.04, zd], [xa + w, s - 0.04, zd], [xa + w, hd + 0.04, zd], [xa, hd + 0.04, zd]);
    }
  };
  // Dark room behind the windows of a bay that cannot be entered: a back wall and a strip of floor and ceiling at each storey.
  const shadowBox = (x0, L, capW, capE) => {
    v.slab(m.dark, x0, GF, -1.05, L, deck - GF, 0.02, 'EWNUD');
    for (let k = 0; k <= 4; k++) { const y = k < 4 ? F[k] : deck; v.slab(m.dark, x0, y - 0.03, -1.03, L, 0.03, 1.03 - T, 'EWNS' + (k === 0 ? 'D' : k === 4 ? 'U' : '')); }
    if (capW) v.slab(m.dark, x0 - 0.02, GF, -1.03, 0.02, deck - GF, 1.03 - T, 'WNSUD');
    if (capE) v.slab(m.dark, x0 + L, GF, -1.03, 0.02, deck - GF, 1.03 - T, 'ENSUD');
  };
  const acUnit = (x, y, z) => {                                                      // outdoor unit standing on a ledge, its two pipes going into the wall
    v.slab(m.ac, x, y, z, 0.8, 0.55, 0.3, 'ND').slab(m.grille, x + 0.1, y + 0.06, z + 0.3, 0.44, 0.44, 0.012, 'NEWUD');
    if (!low) { ex.slab(m.pvc, x + 0.7, y + 0.55, z + 0.06, 0.05, 0.2, 0.05, 'D').slab(m.pvc, x + 0.7, y + 0.7, 0, 0.05, 0.05, z + 0.11, 'N').slab(m.grille, x + 0.04, y + 0.2, z + 0.3, 0.05, 0.16, 0.01, 'N'); }
  };
  const stain = (x, top, z, w, h) => { const s = rnd() * 4; uvq(v, m.stain, [x, top - h, z], [x + w, top - h, z], [x + w, top, z], [x, top, z], s, 0.01, s + w / 2.2, 0.99); };
  const pipe = (x, z, y0, y1) => {                                                   // rainwater pipe with a hopper head
    v.cyl(m.pvc, x, y0, z + 0.075, 0.055, y1 - y0, 8, false).slab(m.pvc, x - 0.13, y1, z, 0.26, 0.22, 0.2);
    if (!low) for (let y = y0 + 1.2; y < y1; y += 2.4) ex.slab(m.grille, x - 0.08, y, z, 0.16, 0.04, 0.14, 'N');
  };
  // glazed door leaf (bronze frame) starting at x, wl wide, in the plane z; `turn` swings it inward about its x edge
  const yt = GF + 2.25;                                                              // head of the door leaves; a fanlight above
  const leaf = (x, wl, z, turn = 0) => {
    const h = yt - GF - 0.02, B = (bx, by, sx, sy) => (turn ? v.slab(m.bronze, x - 0.025, GF + 0.02 + by, z - (bx + sx), 0.05, sy, sx) : v.slab(m.bronze, x + bx, GF + 0.02 + by, z - 0.015, sx, sy, 0.05));
    if (turn) v.slab(m.gdoor, x - 0.01, GF + 0.02, z - wl, 0.02, h, wl, 'UD'); else v.slab(m.gdoor, x, GF + 0.02, z, wl, h, 0.02, 'UD');
    B(0, 0, wl, 0.2); B(0, h - 0.09, wl, 0.09); B(0, 0.2, 0.07, h - 0.29); B(wl - 0.07, 0.2, 0.07, h - 0.29);
    if (!turn) v.slab(m.steel, x + (wl > 0.9 ? wl - 0.16 : wl / 2 - 0.02), GF + 0.85, z + 0.035, 0.03, 0.5, 0.03).slab(m.steel, x + (wl > 0.9 ? wl - 0.16 : wl / 2 - 0.02), GF + 0.85, z - 0.065, 0.03, 0.5, 0.03);   // pull handles
  };
  const doorBay = (o, L, kind, open) => {
    const yh = head[0], jw = kind === 'side' ? 0.4 : 0.14, a = o + jw, b = o + L - jw, w = b - a, zf = -0.21, gw = w - 0.14;
    v.slab(m.cream, o, GF, -T, jw, yh - GF, T, 'D').slab(m.cream, b, GF, -T, jw, yh - GF, T, 'D');                        // jambs
    for (const x of [a, b - 0.07]) v.slab(m.bronze, x, GF, zf, 0.07, yh - GF, 0.1, 'D');                                  // door frame
    v.slab(m.bronze, a, yt, zf, w, 0.07, 0.1, 'EW').slab(m.bronze, a, yh - 0.07, zf, w, 0.07, 0.1, 'EW').slab(m.gdoor, a + 0.07, yt + 0.07, zf + 0.04, gw, yh - yt - 0.14, 0.02, 'EWUD');
    if (kind === 'flank') { leaf(a + 0.07, gw / 2, zf + 0.04); leaf(a + 0.07 + gw / 2, gw / 2, zf + 0.04); }               // fixed lights beside the main door
    else if (kind === 'main') {                                                                                           // sliding doors: two fixed lights, two leaves (parked over them when open)
      const q = gw / 4; leaf(a + 0.07, q, zf + 0.04); leaf(b - 0.07 - q, q, zf + 0.04);
      leaf(a + 0.07 + (open ? 0.1 : q), q, zf - 0.03); leaf(a + 0.07 + (open ? 3 * q - 0.1 : 2 * q), q, zf - 0.03);
    } else if (open) { leaf(a + 0.1, gw / 2, zf, 1); leaf(b - 0.1, gw / 2, zf, 1); }                                       // double doors standing open
    else { leaf(a + 0.07, gw / 2, zf + 0.04); leaf(a + 0.07 + gw / 2, gw / 2, zf + 0.04); }
  };
  // Steps, landing and canopy in front of `n` door bays starting at bay j0 (frame along the chord of those bays).
  const porch = (j0, n, main, row) => {
    const A = I[j0], B = I[j0 + n], Lc = along(v, A, B), e = main ? 1.3 : 0.45, dz = main ? 3.0 : 1.5, x0 = -e, x1 = Lc + e, z0 = PROUD;
    along(c, A, B);
    for (let i = 0; i < 3; i++) { const g = (2 - i) * 0.32; v.slab(m.gran, x0 - g, i * 0.15, z0, x1 - x0 + 2 * g, 0.15, dz + g, 'DN'); }      // three steps on three sides
    c.quad('generic', [x0, GF, z0], [x0, GF, z0 + dz], [x1, GF, z0 + dz], [x1, GF, z0]);                                                  // collision: the landing and three ramps for the steps
    const s = 0.9, zb = z0 + dz;
    c.quad('generic', [x0, GF, zb], [x0 - s, 0, zb + s], [x1 + s, 0, zb + s], [x1, GF, zb]).quad('generic', [x0, GF, z0], [x0 - s, 0, z0], [x0 - s, 0, zb + s], [x0, GF, zb])
      .quad('generic', [x1, GF, zb], [x1 + s, 0, zb + s], [x1 + s, 0, z0], [x1, GF, z0]);
    const cy = head[0] + (main ? 0.42 : 0.24), ct = main ? 0.42 : 0.2, cz = main ? 4.6 : 2.1, xa = x0 - 0.25, xb = x1 + 0.25;
    v.slab(m.white, xa, cy, 0, xb - xa, ct, cz, 'N');                                                                                     // canopy slab with a steel edge
    v.slab(m.steel, xa - 0.02, cy + ct - 0.06, -0.0, xb - xa + 0.04, 0.08, cz + 0.02, 'ND');
    if (main) {
      v.slab(m.timber, xa + 0.3, cy - 0.03, 0.3, xb - xa - 0.6, 0.03, cz - 0.6, 'U');                                                     // timber soffit
      for (const x of [x0 + 0.45, Lc / 3, 2 * Lc / 3, x1 - 0.45]) {                                                                       // steel columns on granite bases
        v.cyl(m.gran, x, GF, zb - 0.6, 0.3, 0.5, 20).cyl(m.steel, x, GF + 0.5, zb - 0.6, 0.2, cy - GF - 0.5, 20, false); c.slab('generic', x - 0.25, GF, zb - 0.85, 0.5, 3, 0.5);
      }
      const lh = 0.95, lw = lh * m.lettersAspect, zl = cz - 0.5;                                                                          // the building's name: red letters standing on the canopy
      for (let i = 0; i < 3; i++) uvq(v, m.letters, [Lc / 2 - lw / 2, cy + ct + 0.06, zl + i * 0.03], [Lc / 2 + lw / 2, cy + ct + 0.06, zl + i * 0.03], [Lc / 2 + lw / 2, cy + ct + 0.06 + lh, zl + i * 0.03], [Lc / 2 - lw / 2, cy + ct + 0.06, zl + i * 0.03].map((q, k) => (k === 1 ? q + lh : q)));
      v.slab(m.steel, Lc / 2 - lw / 2 - 0.1, cy + ct, zl - 0.03, lw + 0.2, 0.06, 0.12);
      for (const [sx, row2] of [[x0 - 2.95, 0], [x1 + 1.05, 1]]) {                                                                        // granite steles with brass plates beside the steps
        const [r0, r1] = m.signs.row(row2), zs = z0 + 2.0;
        v.slab(m.gran, sx, 0, zs, 1.9, 1.15, 0.24, 'D'); c.slab('generic', sx, 0, zs, 1.9, 1.3, 0.24);
        uvq(v, m.signs.material, [sx + 0.15, 0.72, zs + 0.252], [sx + 1.75, 0.72, zs + 0.252], [sx + 1.75, 0.92, zs + 0.252], [sx + 0.15, 0.92, zs + 0.252], 0, r0, 1, r1);
      }
    } else {
      for (const x of [xa + 0.12, xb - 0.12]) { v.cyl(m.steel, x, GF, cz - 0.14, 0.05, cy - GF, 10, false); c.slab('generic', x - 0.1, GF, cz - 0.24, 0.2, 3, 0.2); }   // slim posts
      const [r0, r1] = m.signs.row(row); uvq(v, m.signs.material, [Lc / 2 - 0.8, cy + 0.0, cz + 0.012], [Lc / 2 + 0.8, cy, cz + 0.012], [Lc / 2 + 0.8, cy + 0.2, cz + 0.012], [Lc / 2 - 0.8, cy + 0.2, cz + 0.012], 0, r0, 1, r1);
    }
    for (const f of main ? [0.2, 0.5, 0.8] : [0.5]) { v.slab(m.lamp, Lc * f - 0.25, cy - 0.035, cz * 0.45, 0.5, 0.03, 0.18, 'U'); LIT.push([...world(A, B, Lc * f, cz * 0.6), main ? 5 : 3.5]); }
    for (const sx of main ? [-1, 1] : []) {                                                                                               // planters with clipped shrubs beside the steps
      const px = sx < 0 ? x0 - 2.6 : x1 + 1.4; v.slab(m.stone, px, 0, z0 + 0.3, 1.2, 0.6, 1.2, 'D').slab(m.hedge, px + 0.1, 0.6, z0 + 0.4, 1.0, 0.55, 1.0, 'D'); c.slab('generic', px, 0, z0 + 0.3, 1.2, 1.2, 1.2);
    }
    v.slab(m.pave, x0 - 2.2, 0, z0 + 1.67, x1 - x0 + 4.4, 0.07, main ? 10 : 4.2, 'D');                                                     // paved forecourt
  };

  // ---------- concave (south) face ----------
  for (let j = 0; j < NB; j++) {
    const o = j * bay, L = along(v, I[j], I[j + 1], 0, o), x1 = o + L, open = isOpen(j); along(ex, I[j], I[j + 1], 0, o);
    v.slab(m.gran, o, 0, -T, L, GF, T + PROUD + 0.05, 'DN');                                   // granite plinth
    v.slab(m.pave, o, 0, PROUD + 0.05, L, 0.07, 1.6, 'DN');                                    // paved apron
    v.slab(m.white, o, parapet, -COPE, L, 0.09, COPE + PROUD + 0.03, 'D');                     // wide coping (frame 18)
    if (fieldOf[j] < 0) {                                                                      // red pier, plinth to parapet
      v.slab(m.red, o, GF, -T, L, parapet - GF, T + PROUD, 'D');
      if (j && j + 1 < NB && fieldOf[j - 1] >= 0 && fieldOf[j + 1] < 0) pipe(x1, PROUD, GF, parapet - 0.55);
      if (rnd() < 0.6) stain(o + rnd() * L * 0.4, parapet, PROUD + 0.012, 0.8 + rnd() * 1.6, 1.4 + rnd() * 2.6);
      continue;
    }
    const first = posIn[j] === 0, last = posIn[j] === fb - 1, dk = doorOf[j], ends = 'N' + (first ? '' : 'W') + (last ? '' : 'E');
    let y = GF;
    for (let k = 0; k < 4; k++) { if (!(dk && k === 0)) v.slab(m.cream, o, y, -T, L, sill[k] - y, T, 'EWN'); y = head[k]; }   // cream spandrel under each window row
    v.slab(m.red, o, y, -T, L, parapet - y, T + PROUD, 'EW');                                  // red band over the top row, also the parapet
    if (rnd() < 0.35) stain(o + rnd() * L * 0.5, parapet, PROUD + 0.012, 0.5 + rnd() * 1.2, 0.7 + rnd() * 1.1);
    if (!open) shadowBox(o, L, first, last);
    if (dk) doorBay(o, L, dk, open);
    for (let k = 0; k < 4; k++) {
      const s = sill[k], hd = head[k], door = dk && k === 0;
      if (!door) {
        ribbon(o, x1, k, 0, open);
        v.slab(m.white, o - 0.05, s, -T, 0.1, WIN, T + 0.02, 'UD');                            // concrete mullion on the bay joint
        if (last) v.slab(m.white, x1 - 0.05, s, -T, 0.1, WIN, T + 0.02, 'UD');
        if (k < 3) v.slab(m.white, o, s - 0.07, 0, L, 0.07, 0.1, ends);                        // sill
        if (k && rnd() < 0.3) stain(o + rnd() * (L - 0.9), s - 0.07, 0.012, 0.4 + rnd() * 0.5, 0.35 + rnd() * 0.5);
      }
      if (k < 3) {
        if (door) continue;
        v.slab(m.white, o, hd, 0, L, 0.1, k ? 0.45 : 0.7, ends);                               // ledge over the window head
        if (rnd() < 0.55) {                                                                    // air-conditioner units standing on it
          const n = rnd() < 0.3 ? 2 : 1, xa = o + 0.25 + rnd() * (L - 1.3 - (n - 1) * 0.95);
          for (let i = 0; i < n; i++) acUnit(xa + i * 0.95, hd + 0.1, 0.06);
        }
      } else {                                                                                 // white surround of the top row
        v.slab(m.white, o, hd - 0.1, -0.14, L, 0.1, 0.24, ends).slab(m.white, o, s - 0.14, 0, L, 0.14, 0.1, ends);
        if (first) v.slab(m.white, o, s - 0.14, 0, 0.14, WIN + 0.14, 0.1, 'N');
        if (last) v.slab(m.white, x1 - 0.14, s - 0.14, 0, 0.14, WIN + 0.14, 0.1, 'N');
      }
    }
  }
  for (let j = 0; j < NB; j++) if (doorOf[j] === 'side') porch(j, 1, false, j < jMain ? (j < jMain - fb ? 4 : 2) : (j > jMain + fb + 2 ? 5 : 3));
  porch(jMain - 1, 3, true, 0);

  // ---------- convex (north) face: IMAGINED. A window per bay between piers, ledges, service doors. Bay 0 is the glass box of the west end ----------
  const offN = new Array(NB + 1).fill(0); for (let j = NB - 1; j >= 0; j--) offN[j] = offN[j + 1] + dist(O[j], O[j + 1]);   // distance of O[j] from the east corner along the face
  const hidden = j => nearDrum(O[j], drum.radius - 0.4) && nearDrum(O[j + 1], drum.radius - 0.4);                           // bays standing inside the round dome building
  const service = [Math.round(NB * 0.16), Math.round(NB * 0.76)];
  for (let j = 1; j < NB; j++) {
    const o = offN[j + 1], L = along(v, O[j + 1], O[j], 0, o), x1 = o + L, open = isOpen(j); along(ex, O[j + 1], O[j], 0, o);
    v.slab(m.gran, o, 0, -T, L, GF, T + 0.05, 'DN');
    v.slab(m.white, o, parapet, -T - 0.03, L, 0.09, T + 0.09, 'D');
    if (j === NB - 1 || (drum && hidden(j))) { v.slab(m.red, o, GF, -T, L, parapet - GF, T + (j === NB - 1 ? PROUD : 0), 'D'); continue; }   // the red end wall turns the corner
    const wall = j < jfo ? m.red : m.cream, svc = service.includes(j);                         // red behind the glass box, under the tilted roof (2018 frames 43, 53, 67)
    let y = GF;
    for (let k = 0; k < 4; k++) { if (!(svc && k === 0)) v.slab(wall, o, y, -T, L, sill[k] - y, T, 'EWN'); y = head[k]; }
    v.slab(m.red, o, y, -T, L, parapet - y, T, 'EW');                                          // red parapet band (frame 58)
    v.slab(wall, o - 0.25, GF, -T, 0.5, y - GF, T + 0.06, 'N');                                // pier on the bay joint
    if (j === NB - 2) v.slab(wall, x1 - 0.25, GF, -T, 0.25, y - GF, T + 0.06, 'N');
    if (j % 4 === 2) pipe(o, 0.06, GF, parapet - 0.55);
    if (rnd() < 0.3) stain(o + 0.3 + rnd() * L * 0.4, parapet, 0.012, 0.5 + rnd() * 1.2, 0.7 + rnd() * 1.4);
    if (!open) shadowBox(o, L, j === NB - 2 || (drum && hidden(j + 1)) || isOpen(j + 1), j === 1 || (drum && hidden(j - 1)) || isOpen(j - 1));
    for (let k = 0; k < 4; k++) {
      const s = sill[k], hd = head[k];
      if (svc && k === 0) {                                                                    // service door: steel leaves in a recess, two steps, a small canopy and a lamp
        const xd = o + L / 2 - 0.85, hh = hd - GF;
        v.slab(wall, o, GF, -T, xd - o, hh, T, 'N').slab(wall, xd + 1.7, GF, -T, x1 - xd - 1.7, hh, T, 'N').slab(wall, xd, GF + 2.2, -T, 1.7, hh - 2.2, T, 'N');
        v.slab(m.doorSteel, xd, GF, -0.2, 1.7, 2.2, 0.05, 'N').slab(m.grille, xd + 0.84, GF, -0.15, 0.02, 2.2, 0.01, 'N').slab(m.steel, xd + 0.7, GF + 0.95, -0.15, 0.04, 0.22, 0.05).slab(m.steel, xd + 0.96, GF + 0.95, -0.15, 0.04, 0.22, 0.05);
        for (let i = 0; i < 3; i++) v.slab(m.gran, xd - 0.3 - (2 - i) * 0.3, i * 0.15, 0.05, 2.3 + (2 - i) * 0.6, 0.15, 1.0 + (2 - i) * 0.3, 'DN');
        v.slab(m.white, xd - 0.4, GF + 2.45, 0, 2.5, 0.14, 1.3, 'N').slab(m.lamp, xd + 0.6, GF + 2.42, 0.5, 0.5, 0.03, 0.16, 'U'); LIT.push([...world(O[j + 1], O[j], xd - o + 0.85, 0.9), 3.5]);
        const [r0, r1] = m.signs.row(6); uvq(v, m.signs.material, [xd + 0.25, GF + 2.27, 0.012], [xd + 1.45, GF + 2.27, 0.012], [xd + 1.45, GF + 2.42, 0.012], [xd + 0.25, GF + 2.42, 0.012], 0, r0, 1, r1);
        along(c, O[j + 1], O[j]); c.quad('generic', [xd - o - 0.3, GF, 0.05], [xd - o - 0.3, GF, 1.05], [xd - o + 2.0, GF, 1.05], [xd - o + 2.0, GF, 0.05]).quad('generic', [xd - o - 0.3, GF, 1.05], [xd - o - 0.9, 0, 1.95], [xd - o + 2.6, 0, 1.95], [xd - o + 2.0, GF, 1.05]);
        continue;
      }
      ribbon(o + 0.25, x1 - 0.25, k, 0, open, PANES);
      v.slab(m.white, o, s - 0.07, 0, L, 0.07, 0.09, 'EWN');                                   // sill
      if (k < 3) {
        v.slab(m.white, o, hd, 0, L, 0.08, 0.36, 'EWN');                                       // ledge
        if (rnd() < 0.38) acUnit(o + 0.4 + rnd() * (L - 1.6), hd + 0.08, 0.04);
      } else v.slab(m.white, o, hd - 0.06, 0, L, 0.1, 0.12, 'EWN');
      if (k && rnd() < 0.25) stain(o + 0.3 + rnd() * (L - 1.2), s - 0.07, 0.012, 0.4 + rnd() * 0.5, 0.35 + rnd() * 0.5);
    }
  }

  // ---------- east end: red wall with a cream panel and a few small windows (2018 frames 2-3) ----------
  {
    const L = along(v, I[NB], O[NB]), px = 0.28 * L, pw = 0.64 * L;
    v.slab(m.gran, -PROUD, 0, -T, L + 2 * PROUD, GF, T + PROUD + 0.05, 'DN');
    v.slab(m.red, -PROUD, GF, -T, L + 2 * PROUD, parapet - GF, T + PROUD, 'D').slab(m.white, -PROUD, parapet, -T - 0.03, L + 2 * PROUD, 0.09, T + PROUD + 0.06, 'D');
    v.slab(m.cream, px, 1.0, PROUD, pw, deck - 2.4, 0.05, 'N');
    for (const k of [1, 2]) for (const f of [0.14, 0.44, 0.74]) {
      const x = px + f * pw;
      uvq(v, m.gsolid, [x, sill[k], PROUD + 0.07], [x + 1.0, sill[k], PROUD + 0.07], [x + 1.0, sill[k] + 1.0, PROUD + 0.07], [x, sill[k] + 1.0, PROUD + 0.07], 0, 0, 1, 1);
      v.slab(m.white, x - 0.06, sill[k] - 0.07, PROUD + 0.05, 1.12, 0.07, 0.14, 'N').slab(m.frame, x - 0.04, sill[k], PROUD + 0.05, 0.04, 1.04, 0.06, 'N').slab(m.frame, x + 1.0, sill[k], PROUD + 0.05, 0.04, 1.04, 0.06, 'N')
        .slab(m.frame, x, sill[k] + 1.0, PROUD + 0.05, 1.0, 0.04, 0.06, 'N').slab(m.frame, x + 0.48, sill[k], PROUD + 0.06, 0.04, 1.0, 0.03, 'N');
      stain(x + 0.1, sill[k] - 0.07, PROUD + 0.062, 0.8, 0.6 + rnd() * 0.5);
    }
    pipe(L * 0.14, PROUD, GF, parapet - 0.55); stain(L * 0.5, parapet, PROUD + 0.012, 2.4, 2.2); stain(L * 0.05, parapet, PROUD + 0.012, 1.2, 3.0);
  }

  // ---------- west end: glass box at the outer corner, recessed cream wall with wide windows ----------
  const e = X[0], q = [e[1], -e[0]];                                                           // along the end wall toward the outer corner; outward (south-west)
  const W0 = along(v, O[0], I[0]), glassTop = Math.max(parapet + 1.2, Math.floor((H - 0.5) / 1.2) * 1.2);
  {
    v.slab(m.cw, -0.1, 0, -GD, GX + 0.1, glassTop, GD + 0.1, 'D');
    for (const [x, z] of [[-0.1, 0.1], [GX, 0.1], [-0.1, -GD], [GX, -GD]]) v.slab(m.white, x - 0.15, 0, z - 0.15, 0.3, glassTop, 0.3, 'D');   // corner posts
    v.slab(m.white, -0.3, glassTop, -GD - 0.2, GX + 0.5, 0.25, GD + 0.5).slab(m.gran, -0.14, 0, -GD, GX + 0.18, 0.3, GD + 0.14, 'D');
    const x0 = GX, x1 = W0 - T, ww = 4 * PW, wx = x1 - 1.3 - ww, sx = GX + 1.0, sw = 0.7, zw = -RECESS - T;
    v.slab(m.gran, x0, 0, zw, x1 - x0, GF, T + 0.05, 'N');
    let y = GF;
    for (let k = 0; k < 4; k++) {
      v.slab(m.cream, x0, y, zw, x1 - x0, sill[k] - y, T, 'EWN');
      for (const [a, b] of [[x0, sx], [sx + sw, wx], [wx + ww, x1]]) v.slab(m.cream, a, sill[k], zw, b - a, WIN, T, 'N');
      ribbon(sx, sx + sw, k, -RECESS, false, 1); ribbon(wx, wx + ww, k, -RECESS, false, 4);
      v.slab(m.white, wx - 0.05, sill[k] - 0.07, -RECESS, ww + 0.1, 0.07, 0.08, 'N').slab(m.white, sx - 0.05, sill[k] - 0.07, -RECESS, sw + 0.1, 0.07, 0.08, 'N');
      y = head[k];
    }
    v.slab(m.dark, x0, GF, zw - 0.75, x1 - x0, deck - GF, 0.02, 'EWNUD');                      // dark rooms behind those windows
    for (let k = 0; k <= 4; k++) v.slab(m.dark, x0, (k < 4 ? F[k] : deck) - 0.03, zw - 0.75, x1 - x0, 0.03, 0.75, 'EWNS');
    v.slab(m.cream, x0, y, zw, x1 - x0, parapet - y, T, 'EW').slab(m.white, x0, parapet, zw - 0.03, x1 - x0, 0.09, T + 0.06, 'D');
    stain(x0 + 0.6, parapet, -RECESS + 0.012, 1.4, 1.6); stain(wx + 0.5, sill[2] - 0.07, -RECESS + 0.012, 1.2, 0.7);
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
  const tip = add(O[0], mul(e, 8.3), mul(q, 3.5)), swIn = add(I[0], mul(e, -OVI), mul(q, 2.5));
  const Fi = pt(jfi, -OVI), Fo = pt(jfo, W[jfo] + OV), fd = unit(sub(Fo, Fi));
  let fn = [fd[1], -fd[0]]; if (dot(sub(tip, Fi), fn) < 0) fn = mul(fn, -1);                   // across the fold line, toward the tip
  const slope = TIP / dot(sub(tip, Fi), fn), top = p => H + slope * Math.max(0, dot(sub(p, Fi), fn));
  const ovOut = j => OV + 5.4 * (1 - j / jfo);                                                 // overhang beyond the convex face, widest at the west end
  // dF[j]: how far across cross-section j the flat canopy reaches (the fold line west of jfo, the north edge east of it)
  const dF = I.map((p, j) => j <= jfi ? -OVI : j < jfo ? -dot(sub(p, Fi), fn) / dot(X[j], fn) : W[j] + OV);
  // bays whose flat canopy is deep enough carry the row of openings; the last bay before the east end is solid
  const holed = j => j >= jfi && j < NB - 1 && Math.min(dF[j], dF[j + 1]) > D2 + 1.2;
  v.frame(0, 0, 0); c.frame(0, 0, 0);
  {
    const secs = [[swIn, tip]];
    for (let j = 0; j <= jfo; j++) secs.push([pt(j, dF[j]), j < jfo ? pt(j, W[j] + ovOut(j)) : Fo]);
    const edge = (p0, p1, outDir) => {                                                         // white edge of the tilted slab, seen from both sides
      const ring = [P3(p0, top(p0) - 0.5), P3(p1, top(p1) - 0.5), P3(p1, top(p1) + 0.06), P3(p0, top(p0) + 0.06)];
      face(v, m.white, ring, [outDir[0], 0, outDir[1]]); face(v, m.white, ring, [-outDir[0], 0, -outDir[1]]);
    };
    for (let s = 0; s < secs.length - 1; s++) {
      const [a0, b0] = secs[s], [a1, b1] = secs[s + 1], ring = [a0, a1, b1, b0];
      face(v, m.ctop, ring.map(p => P3(p, top(p))), UP); face(v, m.white, ring.map(p => P3(p, top(p) - WTH)), DOWN);
      face(c, 'generic', ring.map(p => P3(p, top(p))), UP);                                    // collider: the tilted plane itself
      const outward = sub(mix(b0, b1, 0.5), mix(a0, a1, 0.5));
      edge(b0, b1, outward); if (s <= jfi) edge(a0, a1, mul(outward, -1));
    }
    edge(swIn, tip, q);
    // very tall slender columns from the ground to the tilted roof (collide), and shorter posts on the convex parapet
    const cols = [add(I[0], mul(q, 0.55), mul(e, -0.55)), add(O[0], mul(e, -(GX + 0.45)), mul(q, 0.6)), add(O[0], mul(e, 0.65), mul(q, 0.6)), add(O[0], mul(e, 5.4), mul(q, 1.2))];
    for (const j of [2, 4, 6]) if (j < jfo) cols.push(pt(j, W[j] + ovOut(j) - 0.7));
    for (const p of cols) { v.cyl(m.white, p[0], 0, p[1], 0.3, top(p) - WTH, 14, false).cyl(m.gran, p[0], 0, p[1], 0.38, 0.35, 14); c.box('generic', p[0], 3, p[1], 0.6, 6, 0.6); }
    for (let j = jfi + 3; j < jfo; j += 3) { const p = pt(j, W[j] - 0.1); v.box(m.white, p[0], (parapet + top(p) - WTH) / 2, p[1], 0.45, top(p) - WTH - parapet, 0.45); }
  }

  // ---------- flat canopy east of the fold line: solid strip, row of openings, solid strip; white edges, beams, columns ----------
  for (let j = jfi; j < NB; j++) {
    for (const [d0, d1] of (holed(j) ? [[-OVI, D1], [D2, null]] : [[-OVI, null]])) {            // null: out to the fold line or the convex edge
      const ring = [pt(j, d0), pt(j + 1, d0), pt(j + 1, d1 ?? dF[j + 1]), pt(j, d1 ?? dF[j])];
      face(v, m.ctop, ring.map(p => P3(p, H)), UP); face(v, m.white, ring.map(p => P3(p, H - SLAB)), DOWN);
    }
  }
  for (let j = jfi; j < NB; j++) {
    let L = along(v, pt(j, -OVI), pt(j + 1, -OVI)); v.slab(m.white, 0, beamY, -0.16, L, FASCIA + 0.05, 0.16, 'EW');                // concave edge
    if (rnd() < 0.4) stain(rnd() * L * 0.5, H - 0.02, 0.012, 0.6 + rnd() * 1.2, 0.3 + rnd() * 0.4);
    if (j >= jfo) { L = along(v, pt(j + 1, W[j + 1] + OV), pt(j, W[j] + OV)); v.slab(m.white, 0, beamY, -0.16, L, FASCIA + 0.05, 0.16, 'EW'); }   // convex edge
    if (!holed(j)) continue;
    L = along(v, pt(j, D1), pt(j + 1, D1)); v.slab(m.white, 0, H - SLAB, -0.08, L, SLAB + 0.2, 0.16, 'EW');                         // rim on the concave side
    L = along(v, pt(j, D2), pt(j + 1, D2)); v.slab(m.white, 0, beamY + 0.2, -0.3, L, FASCIA, 0.3, 'EW');                            // deep beam on the far side (frames 16-18)
  }
  { const L = along(v, pt(NB, -OVI), pt(NB, W[NB] + OV)); v.slab(m.white, 0, beamY, -0.16, L, FASCIA + 0.05, 0.16); }               // east edge
  const posts = [];                                                                             // posts inside the garden (they collide)
  for (let j = jfi; j <= NB; j++) {
    const k = (j - jfi) / STN, main = j === NB || j === jfo || (Number.isInteger(k) && NB - j >= 2);
    const inRow = holed(j - 1) || holed(j), rowEnd = holed(j - 1) !== holed(j);
    if (!main && !rowEnd) continue;
    const dEnd = dF[j], z = j === NB ? -0.45 : 0, bw = main ? 0.36 : 0.16;                      // the last frame stands just inside the east end wall
    along(v, I[j], O[j]);                                                                       // local x = distance in from the concave face
    if (inRow) v.slab(m.white, D1, H - SLAB, z - bw / 2, D2 - D1, SLAB + 0.2, bw, 'D');         // beam across the row of openings, or its end rim
    if (!main) continue;
    if (dEnd > 0.5) v.slab(m.white, -OVI, beamY, z - 0.18, dEnd + OVI, FASCIA - SLAB, 0.36, 'U');   // cross beam under the slab
    if (!(j === NB || j === jfo || COLS.includes(k % 5))) continue;
    const cp = pt(j, COL_D), full = j >= jfo;
    v.cyl(m.white, COL_D, deck, z, COL_R, Math.max(H - SLAB, top(cp) - WTH) - deck, 12, false);  // round column behind the concave parapet
    if (full) {
      v.box(m.white, W[j] - 0.08, (parapet + 0.09 + beamY) / 2, z, 0.45, beamY - parapet - 0.09, 0.45, 'UD');                      // post on the convex parapet
      v.box(m.white, D2 + 0.15, (deck + beamY) / 2, z, 0.35, beamY - deck, 0.35, 'UD');                                             // post inside the garden, under the deep beam
      posts.push(j);
    }
  }

  // ---------- roof garden (layout IMAGINED): hedged beds along both parapets, a timber walk, lawn with trees under the openings, a paved promenade ----------
  const G1 = 1.25, G2 = D1, G3 = D2 + 0.1, G4 = 13.2, yg = deck + 0.03;                          // depths where the surfaces change
  const big = [], bushes = [], blooms = [], seats = [];
  v.frame(0, 0, 0);
  const inset = mul(q, -RECESS - T), dk0 = d => add(pt(0, Math.min(d, W[0] - GX)), inset);       // bay 0 starts behind the recessed end wall
  face(v, m.lawn, [P3(dk0(T), yg), P3(pt(1, T), yg), P3(pt(1, W[1] - T), yg), P3(dk0(W[0] - T), yg)], UP);
  const strip = (mm, j, d0, d1) => uvq(v, mm, P3(pt(j, d0), yg), P3(pt(j + 1, d0), yg), P3(pt(j + 1, d1), yg), P3(pt(j, d1), yg), j * bay, d0, (j + 1) * bay, d1);
  for (let j = 1; j < NB; j++) {
    const wn = Math.min(W[j], W[j + 1]) - T - 1.0;
    v.frame(0, 0, 0); strip(m.boards, j, T, G2); strip(m.lawn, j, G2, G3); strip(m.pave, j, G3, G4); strip(m.lawn, j, G4, wn + 1.0);
    let L = along(v, I[j], I[j + 1], deck, j * bay);                                             // bed along the concave parapet: stone kerb, clipped hedge (the round columns rise out of it)
    v.slab(m.stone, j * bay, 0, -G1, L, 0.4, 0.1, 'DEW').slab(m.hedge, j * bay, 0.3, -G1 + 0.12, L, 0.6, G1 - 0.12 - T - 0.08, 'DEW');
    for (const d of [G2, G3, G4]) { L = along(v, pt(j, d), pt(j + 1, d), deck); v.slab(m.stone, 0, 0, -0.06, L, 0.1, 0.12, 'DEW'); }             // kerbs between the surfaces
    L = along(v, O[j + 1], O[j], deck, offN[j + 1]);                                             // bed along the convex parapet
    v.slab(m.stone, offN[j + 1], 0, -T - 1.0, L, 0.4, 0.1, 'DEW').slab(m.hedge, offN[j + 1], 0.3, -T - 0.9, L, 0.5, 0.82, 'DEW');
    along(c, I[j], I[j + 1], deck); c.slab('generic', 0, 0.02, -G1, bay, 1.0, G1 - T - 0.02);    // the beds stop the walker
    along(c, O[j + 1], O[j], deck); c.slab('generic', 0, 0.02, -T - 1.0, L, 1.0, 0.98);
    // planting: a tree under each roof opening, small trees and shrubs on the lawns, flowers along the promenade
    const clear = p => !nearDrum(p, drum ? drum.radius * 0.66 + 1.6 : 0);
    if (holed(j) && holed(j - 1) && (j - jfi) % STN === 1 && rnd() < 0.72) big.push([...at(j + (rnd() - 0.5) * 0.5, (D1 + D2) / 2 + (rnd() - 0.5) * 1.2), 6.6 + rnd() * 1.8, deck]);
    else if (rnd() < 0.3) big.push([...at(j + rnd(), G2 + 1 + rnd() * 3.2), (j < jfo ? 3.6 : 2.6) + rnd() * 1.2, deck]);
    if (rnd() < 0.22) { const p = at(j + rnd(), G4 + 1.0 + rnd() * 1.4); if (clear(p)) big.push([...p, 2.4 + rnd() * 1.2, deck]); }
    for (let i = 0; i < 2; i++) if (rnd() < 0.55) bushes.push([...at(j + rnd(), i ? G4 + 0.7 + rnd() * 1.6 : G2 + 0.6 + rnd() * 4.0), 0.4 + rnd() * 0.45]);
    if (!low) for (let i = 0; i < 9; i++) blooms.push(at(j + rnd(), rnd() < 0.5 ? G3 - 0.75 + rnd() * 0.5 : G4 + 0.2 + rnd() * 0.5));
    if (j % 4 === 2 && j > 2 && j < NB - 2) seats.push(j);
  }
  // benches on the promenade (timber slats on stone blocks), a planter box beside each, low lights along the lawn
  const sec = (b, s, d, y) => { const p = at(s, d), j = Math.max(0, Math.min(NB - 1, Math.floor(s))), xs = unit(mix(X[j], X[j + 1], s - j)); b.frame(p[0], p[1], Math.atan2(-xs[0], -xs[1]), y); };   // frame at station s: +x east along the building, +z toward the concave side
  for (const j of seats) {
    sec(v, j + 0.5, G4 - 0.55, deck); sec(c, j + 0.5, G4 - 0.55, deck);
    for (const sx of [-0.8, 0.8]) v.box(m.stone, sx, 0.22, 0, 0.16, 0.4, 0.44);
    for (let i = 0; i < 4; i++) v.box(m.timber, 0, 0.445, -0.18 + i * 0.12, 2.0, 0.045, 0.1);
    for (let i = 0; i < 2; i++) v.box(m.timber, 0, 0.62 + i * 0.14, -0.27 - i * 0.03, 2.0, 0.1, 0.035);
    v.box(m.steel, -0.8, 0.6, -0.26, 0.04, 0.42, 0.04).box(m.steel, 0.8, 0.6, -0.26, 0.04, 0.42, 0.04);
    c.box('generic', 0, 0.35, -0.05, 2.0, 0.66, 0.5);
    v.box(m.stone, 1.75, 0.3, -0.05, 0.9, 0.56, 0.9).box(m.soil, 1.75, 0.57, -0.05, 0.7, 0.04, 0.7, 'D'); c.box('generic', 1.75, 0.5, -0.05, 0.9, 0.96, 0.9);
    const pb = at(j + 0.5 + 1.75 / bay, G4 - 0.5); bushes.push([pb[0], pb[1], 0.5, 0.56]);
    sec(v, j + 0.5, G3 + 0.3, deck); v.cyl(m.bronze, -1.2, 0, 0, 0.05, 0.62, 8).cyl(m.lamp, -1.2, 0.62, 0, 0.065, 0.14, 8).cyl(m.bronze, -1.2, 0.76, 0, 0.08, 0.03, 8);
  }
  // a hedge across the garden where the recessed west end begins
  { const L = along(v, O[0], I[0], deck); v.slab(m.stone, T, 0, -GD - 0.75, L - 2 * T, 0.4, 0.75, 'D').slab(m.hedge, T + 0.1, 0.4, -GD - 0.65, L - 2 * T - 0.2, 0.55, 0.55, 'D'); along(c, O[0], I[0], deck); c.slab('generic', T, 0.02, -GD - 0.75, L - 2 * T, 1.0, 0.7); }

  // ---------- colliders ----------
  c.frame(0, 0, 0);
  for (let j = jfi; j < NB; j++) face(c, 'generic', [pt(j, -OVI), pt(j + 1, -OVI), pt(j + 1, dF[j + 1]), pt(j, dF[j])].map(p => P3(p, H)), UP);   // the flat canopy as one plate (it also closes the openings)
  for (let j = 1; j < NB; j++) {
    const xw = isOpen(j - 1) ? 0 : 0.35, xe = isOpen(j + 1) ? 0 : 0.35;
    let L = along(c, I[j], I[j + 1]); const w = Math.max(W[j], W[j + 1]);
    if (!isOpen(j)) c.slab('generic', -xw, 0, -w, L + xw + xe, deck, w + PROUD);                 // a bay that cannot be entered: solid up to the roof garden (overlapping, so the fan of boxes leaves no slit)
    const y0 = isOpen(j) ? 0 : deck - 0.4;                                                       // (the parapets start inside the solid: no coincident faces)
    c.slab('generic', -0.04, y0, -T, L + 0.08, parapet + 0.1 - y0, T + PROUD);                   // concave wall or parapet
    L = along(c, O[j + 1], O[j]); c.slab('generic', -0.04, y0, -T, L + 0.08, parapet + 0.1 - y0, T);                                               // convex wall or parapet
  }
  { const L = along(c, I[NB], O[NB]); c.slab('generic', -PROUD, deck - 0.4, -T, L + 2 * PROUD, parapet + 0.5 - deck, T + PROUD); }                     // east end parapet
  for (const j of posts) { along(c, I[j], O[j], deck); c.box('generic', D2 + 0.15, 1.52, j === NB ? -0.45 : 0, 0.4, 3, 0.4); }
  along(c, O[0], I[0]);                                                                         // the west end follows its recess
  c.slab('generic', -0.1, 0, -GD, GX + 0.2, parapet, GD + 0.1).slab('generic', GX, 0, -GD, W0 - GX + PROUD, parapet, GD - RECESS).slab('generic', W0 - T, 0, -RECESS, T + PROUD, parapet, RECESS);

  // ---------- assemble ----------
  const mid = at(NB / 2, 8.5);
  ctx.add(mergeFlat(v.build({ name: item.id + '-visual' }), true));
  ctx.detail(ctx.add(mergeFlat(ex.build({ name: item.id + '-fittings', castShadow: false }), false)), mid[0], mid[1], 170);
  const trees = broadleafTrees(big, { seed: 23, low: true }); ctx.add(trees.group);
  c.frame(0, 0, 0); for (const [x, z] of big) c.box('generic', x, deck + 1.22, z, 0.44, 2.4, 0.44);
  const ground = bushes.filter(b => !b[3]), raised = bushes.filter(b => b[3]);
  for (const [list, y] of [[ground, deck], [raised, deck + 0.56]]) if (list.length) { const sh = shrubs(list.map(([x, z, r]) => [x, z, r]), { seed: 31 }); sh.position.y = y; ctx.add(sh); }
  if (blooms.length) ctx.detail(ctx.add(flowers(blooms, [0xe84a3a, 0xf2b61f, 0xffffff, 0xe0407a], { seed: 12, y: yg, size: 0.3 })), mid[0], mid[1], 150);
  const cg = ctx.add(c.build({ name: item.id + '-colliders' })); cg.visible = false;
  cg.traverse(o => { if (o.isMesh) ctx.collide(o); });
}
