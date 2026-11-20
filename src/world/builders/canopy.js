// Space-frame canopy over the central plaza, and the floor under it.
//
// SEEN in the 2018 footage (frames 5 to 10 and the frames between them, from the east and north-east) and on the satellite
// image:
//   - one flat rectangular roof of pale, slightly translucent sheets; from above a grid shows through, about 1.3 m by
//     2.5 m; the satellite image shows 16 or 17 raised ribs running north-south over the 40.7 m width;
//   - under it a white double-layer steel space frame: along the free east edge a top chord, a bottom chord half a module
//     further in and V-shaped diagonals between them; depth about 1.8 m, module about 2.5 to 2.7 m (estimated from one
//     2018 frame, 27.5 s into the footage, whose camera position was reconstructed from the corners of the south slab's
//     roof: the same frame that fixed the clock tower's position);
//   - the east edge spans free between the glass stair block and the block to the north: no columns are visible along it;
//     a white column stands at the south-east corner beside the glass block; no columns in the middle of the plaza;
//   - the south edge sits against a five-storey white block (not an item of campus-data.js; it is core-pergola-block in
//     data/context.json and is built by extras/context.js), the west side faces a building with planted corridors; so in
//     reality the frame bears mostly on its neighbours;
//   - floor: pale paving; along the west side a wavy black-and-white band with three round stepped planters, a palm in each.
//
// ASSUMED: equal modules both ways (the outline divided into modules of about 2.5 m), the member sizes, ball nodes at every
//   joint; all columns except the one at the south-east corner (a row under the outer bottom-chord nodes along the south,
//   west and north edges, standing in for the buildings the real frame bears on; none along the east edge between its
//   corners); the exact place and width of the wavy band (2.4 m wide, 5 m from the west edge), the drawing of its waves,
//   the size of the planters (4 m and 2.8 m across, two steps of 0.4 m), the height of the palms.
//
// IMAGINED (the owner asked for a finished place and said that imagination should fill in what no reference shows):
//   - the columns' finish: a granite plinth, a stainless collar, a white tube with joint rings and four raking struts that
//     branch from its head to the neighbouring nodes; an aluminium fascia round the roof, rainwater pipes down four columns;
//   - the look of the sheets from below: they let daylight through, so by day the underside is brighter than the steel in
//     front of it, and after dusk it is lit warm from below by sixteen floodlights hung from the frame (they brighten at
//     dusk and throw pools of light on the floor);
//   - the floor's pattern: bands of darker granite on every second module line, so that the paving repeats the frame above;
//     slot drains under the north and south eaves; flowers and clipped shrubs round the palms;
//   - furniture: benches beside the columns, litter bins, a notice board on the north side (its posters are the made-up
//     ones of street.js).
//
// Two levels of detail: the roof, the edge trusses, the columns, the floodlights and the floor are always drawn; the inner
// frame (round tubes and ball nodes as two instanced meshes: about 1,800 members and 545 nodes), the palms, plants and
// furniture are shown only near the canopy through ctx.detail. From the air the inner frame is hidden by the roof anyway.
// The measured outline reaches 0.3 m into the glass stair block and 0.6 m into the block north-east of the canopy (both
// within the stated accuracy of the measurements): the roof simply runs into them, as the real one springs from them.
// Colliders: every column and its plinth, the three planters, benches, bins, the notice board, and a slab at roof level so
// that a player leaving drone mode above the canopy lands on it.
import { THREE, flat, bbox } from '../../kit.js';
import { Batch } from '../../batch.js';
import { royalPalms, shrubs, flowers } from '../../flora.js';
import { bench, bins, noticeBoard, LIT } from '../../street.js';
import { pavingMaterial, bandMaterial, blockedBy, drain } from './plaza.js';
import { lm, mergeFlat } from './plain-block.js';

const MODULE = 2.5, DEPTH = 1.8;

let M = null;
function materials(mx, mz) {
  if (M) return M;
  const canvas = (w, h, draw) => { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); return c; };
  const tex = (c, rx, rz) => { const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, rz); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; };
  let s = 5; const r = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  // top: one module per repeat. Lines at the canvas edges are the frame's top chords showing through the sheets; the line
  // across the middle is the sheet seam at half a module. A little dirt has settled along the ribs.
  const top = canvas(256, 256, (g, w, h) => {
    g.fillStyle = '#dfe2da'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 500; i++) { g.fillStyle = `rgba(110,112,100,${(0.02 + 0.05 * r()).toFixed(3)})`; g.fillRect(r() * w, r() * h, 2 + r() * 10, 2 + r() * 5); }
    g.fillStyle = 'rgba(255,255,255,0.35)'; g.fillRect(12, 0, 40, h);                             // light along each rib
    g.fillStyle = 'rgba(96,100,92,0.28)'; g.fillRect(w - 26, 0, 20, h);                           // dirt in the lee of the rib
    g.fillStyle = 'rgba(112,120,114,0.75)'; g.fillRect(0, 0, 6, h); g.fillRect(w - 6, 0, 6, h);   // north-south rib lines
    g.fillStyle = 'rgba(120,128,122,0.70)'; g.fillRect(0, 0, w, 5); g.fillRect(0, h - 5, w, 5);   // east-west chord lines
    g.fillStyle = 'rgba(130,138,132,0.55)'; g.fillRect(0, h / 2 - 3, w, 6);                       // sheet seam
  });
  // underside: sheets that let the daylight through, purlin shadows at half modules, the top chords as a darker grid
  const under = canvas(256, 256, (g, w, h) => {
    g.fillStyle = '#eef0e8'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 6; i++) { g.fillStyle = `rgba(255,255,255,${0.1 + 0.05 * (i % 2)})`; g.fillRect(i * w / 6 + 4, 0, w / 6 - 8, h); }   // the corrugation of the sheets
    for (let i = 0; i < 260; i++) { g.fillStyle = `rgba(120,124,108,${(0.02 + 0.05 * r()).toFixed(3)})`; g.fillRect(r() * w, r() * h, 3 + r() * 14, 2 + r() * 6); }   // leaves and dust lying on top
    g.fillStyle = 'rgba(96,102,96,0.55)'; g.fillRect(0, h / 2 - 4, w, 8); g.fillRect(0, h / 4 - 2, w, 4); g.fillRect(0, 3 * h / 4 - 2, w, 4);
    g.fillStyle = 'rgba(70,76,72,0.8)'; g.fillRect(0, 0, 8, h); g.fillRect(w - 8, 0, 8, h); g.fillRect(0, 0, w, 8); g.fillRect(0, h - 8, w, 8);
  });
  // wavy band: 2.4 m across (canvas x), one 6 m wave length along (canvas y)
  const band = canvas(128, 512, (g, w, h) => {
    g.fillStyle = '#efede6'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 400; i++) { g.fillStyle = `rgba(90,88,80,${(0.03 + 0.05 * r()).toFixed(3)})`; g.fillRect(r() * w, r() * h, 1 + r() * 3, 1 + r() * 3); }
    g.fillStyle = '#202022';
    for (const [x0, half] of [[0.2, 0.085], [0.5, 0.085], [0.8, 0.085]]) {
      g.beginPath();
      for (let y = 0; y <= h; y += 4) g.lineTo((x0 - half + 0.1 * Math.sin(y / h * 2 * Math.PI)) * w, y);
      for (let y = h; y >= 0; y -= 4) g.lineTo((x0 + half + 0.1 * Math.sin(y / h * 2 * Math.PI)) * w, y);
      g.closePath(); g.fill();
    }
    g.strokeStyle = 'rgba(60,58,54,0.5)'; g.lineWidth = 1; for (let y = 0; y < h; y += h / 20) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }   // joints of the mosaic strips
  });
  const S = (name, o) => { const m = new THREE.MeshStandardMaterial(o); m.name = name; return m; };   // names must not contain "pane" or "glass": lighting.js makes those glow at night
  const ut = tex(under, 1 / mx, 1 / mz);
  M = {
    top: S('canopy-roof-top', { map: tex(top, 1 / mx, 1 / mz), roughness: 0.55 }),
    under: S('canopy-roof-under', { map: ut, roughness: 0.9, emissive: 0xffffff, emissiveMap: ut, emissiveIntensity: 0.6 }),
    steel: S('canopy-steel', { color: 0xf1f1ec, roughness: 0.45, emissive: 0xffd9a0, emissiveIntensity: 0 }),
    band: S('canopy-wavy-band', { map: tex(band, 1 / 2.4, 1 / 6), roughness: 0.7, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -4 }),
  };
  M.under.userData.noGrain = true;
  return M;
}

const X = new THREE.Vector3(1, 0, 0), Y = new THREE.Vector3(0, 1, 0), q = new THREE.Quaternion(), mtx = new THREE.Matrix4(), one = new THREE.Vector3(1, 1, 1);
/** Open-ended square bar between two points [x, y, z] in world coordinates (8 triangles). Leaves the batch in an arbitrary frame. */
function bar(batch, material, a, b, t) {
  const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), d = new THREE.Vector3().subVectors(B, A), len = d.length();
  q.setFromUnitVectors(X, d.normalize());
  batch.setMatrix(mtx.compose(A.add(B).multiplyScalar(0.5), q, one)).box(material, 0, 0, 0, len, t, t, 'EW');
}
/** Flat ring facing up between radii r0 and r1, in the batch's current frame. */
function ring(batch, material, y, r0, r1, seg = 24) {
  const p = (r, i) => [Math.cos(i / seg * 2 * Math.PI) * r, y, Math.sin(i / seg * 2 * Math.PI) * r];
  for (let i = 0; i < seg; i++) batch.quad(material, p(r1, i + 1), p(r1, i), p(r0, i), p(r0, i + 1));
}
/** Symmetric choice of support nodes along an edge of n bottom nodes: both ends, then every third, the middle left free. */
function supports(n) {
  const out = new Set();
  for (let i = 0; i < n / 2 - 1; i += 3) { out.add(i); out.add(n - 1 - i); }
  return [...out].sort((a, b) => a - b);
}

export function build(item, ctx) {
  const b = bbox(item.points), H = item.height, low = !!ctx.lowPower;
  const nx = Math.max(2, Math.round(b.sx / MODULE)), nz = Math.max(2, Math.round(b.sz / MODULE)), mx = b.sx / nx, mz = b.sz / nz;
  const yT = H - 0.3, yB = yT - DEPTH, o = 0.35;                         // chord centre lines; o: overhang of the sheets beyond the frame
  const m = materials(mx, mz), W = lm('frame'), GD = lm('graniteDark'), GL = lm('graniteLight'), SS = lm('alu'), SH = lm('shade'), DK = lm('dark'), LAMP = lm('lamp');
  const top = (i, k) => [b.w + i * mx, yT, b.n + k * mz], bot = (i, k) => [b.w + (i + 0.5) * mx, yB, b.n + (k + 0.5) * mz];
  const v = new Batch(), c = new Batch(), d = new Batch();

  // ---- roof: sheets (top and underside textured separately), raised north-south ribs, an aluminium fascia
  v.frame(b.w, b.n);
  v.slab(m.top, -o, H - 0.05, -o, b.sx + 2 * o, 0.05, b.sz + 2 * o, 'DEWSN');
  v.slab(m.under, -o, H - 0.12, -o, b.sx + 2 * o, 0.05, b.sz + 2 * o, 'UEWSN');
  for (let i = 0; i <= nx; i++) v.slab(W, i * mx - 0.07, H, -o, 0.14, 0.07, b.sz + 2 * o, 'DSN');
  for (const [x, z, sx, sz, skip] of [[-o - 0.08, -o - 0.08, b.sx + 2 * o + 0.16, 0.08, ''], [-o - 0.08, b.sz + o, b.sx + 2 * o + 0.16, 0.08, ''],
    [-o - 0.08, -o, 0.08, b.sz + 2 * o, 'SN'], [b.sx + o, -o, 0.08, b.sz + 2 * o, 'SN']]) v.slab(W, x, H - 0.42, z, sx, 0.5, sz, skip);
  c.frame(b.w, b.n).slab('generic', -o, H - 0.2, -o, b.sx + 2 * o, 0.2, b.sz + 2 * o);

  // ---- edge trusses (always drawn): edge top chords, the outer ring of bottom chords, the diagonals between them
  const tc = 0.15, td = 0.11;
  v.slab(W, -tc / 2, yT - tc / 2, -tc / 2, b.sx + tc, tc, tc).slab(W, -tc / 2, yT - tc / 2, b.sz - tc / 2, b.sx + tc, tc, tc);
  v.slab(W, -tc / 2, yT - tc / 2, 0, tc, tc, b.sz, 'SN').slab(W, b.sx - tc / 2, yT - tc / 2, 0, tc, tc, b.sz, 'SN');
  const bx0 = 0.5 * mx, bx1 = (nx - 0.5) * mx, bz0 = 0.5 * mz, bz1 = (nz - 0.5) * mz;
  v.slab(W, bx0, yB - tc / 2, bz0 - tc / 2, bx1 - bx0, tc, tc, 'EW').slab(W, bx0, yB - tc / 2, bz1 - tc / 2, bx1 - bx0, tc, tc, 'EW');
  v.slab(W, bx0 - tc / 2, yB - tc / 2, bz0, tc, tc, bz1 - bz0, 'SN').slab(W, bx1 - tc / 2, yB - tc / 2, bz0, tc, tc, bz1 - bz0, 'SN');
  const tubes = [];                                                      // members left for the near view: [from, to, radius]
  for (let i = 0; i < nx; i++) for (let k = 0; k < nz; k++) for (const [di, dk] of [[0, 0], [1, 0], [0, 1], [1, 1]]) {
    const ti = i + di, tk = k + dk, edge = ti === 0 || ti === nx || tk === 0 || tk === nz;
    if (edge) bar(v, W, bot(i, k), top(ti, tk), td); else tubes.push([bot(i, k), top(ti, tk), 0.045]);
  }
  v.frame();

  // ---- columns under outer bottom nodes: south and north rows, west row; the east edge stays free between its corners
  const blocked = blockedBy(ctx, item), cols = [], stood = [];
  for (const i of supports(nx)) cols.push([i, 0], [i, nz - 1]);
  for (const k of supports(nz)) if (k > 0 && k < nz - 1) cols.push([0, k]);
  const yHead = yB - 2.3;
  for (const [i, k] of cols) {
    const [x, , z] = bot(i, k);
    if (blocked(x, z, 0.45)) continue;
    stood.push([i, k, x, z]);
    v.frame(x, z).box(GD, 0, 0.16, 0, 1.1, 0.32, 1.1, 'D').box(GL, 0, 0.37, 0, 0.92, 0.1, 0.92, 'D');                  // plinth
    v.cyl(SS, 0, 0.42, 0, 0.36, 0.28, 18, false).cyl(SS, 0, 0.7, 0, 0.33, 0.03, 18);                                    // collar
    v.cyl(W, 0, 0.7, 0, 0.3, yHead - 0.7, 16, false);
    for (let y = 3.6; y < yHead - 1; y += 3.0) v.cyl(SH, 0, y, 0, 0.308, 0.025, 16, false);                               // joints of the casing
    v.cyl(W, 0, yHead, 0, 0.36, 0.22, 16).cyl(W, 0, yHead + 0.22, 0, 0.17, yB - yHead - 0.22, 10, false);                 // head, stub up to the node
    v.frame();
    for (const [di, dk] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {                                                         // branches to the neighbouring nodes
      const ii = i + di, kk = k + dk; if (ii < 0 || ii >= nx || kk < 0 || kk >= nz) continue;
      bar(v, W, [x, yHead + 0.1, z], bot(ii, kk), 0.13);
    }
    v.frame();
    c.frame(x, z).box('generic', 0, 0.2, 0, 1.1, 0.4, 1.1).box('generic', 0, 0.41 + (yB - 0.5) / 2, 0, 0.62, yB - 0.5, 0.62);
  }
  c.frame();
  // rainwater pipes from the eaves down four columns of the north and south rows
  for (const [i, k, x, z] of stood) if ((k === 0 || k === nz - 1) && (i === 3 || i === nx - 4)) {
    const zp = z + (k === 0 ? -0.36 : 0.36), ze = k === 0 ? b.n - o : b.s + o;
    v.slab(W, x - 0.055, 0.5, zp - 0.055, 0.11, yB - 0.5, 0.11, 'D'); bar(v, W, [x, yB, zp], [x, H - 0.3, ze], 0.11); v.frame();
    for (let y = 2.4; y < yB; y += 3.0) v.slab(SH, x - 0.075, y, Math.min(z, zp) - 0.02, 0.15, 0.05, Math.abs(zp - z) + 0.04, 'D');
  }

  // ---- floodlights hung under bottom nodes (always drawn: they are the plaza's light after dusk)
  const fl = [...new Set([0.15, 0.38, 0.62, 0.85].map(f => Math.min(nx - 1, Math.round(f * (nx - 1)))))], fk = [...new Set([0.15, 0.38, 0.62, 0.85].map(f => Math.min(nz - 1, Math.round(f * (nz - 1)))))];
  for (const i of fl) for (const k of fk) {
    const [x, , z] = bot(i, k);
    v.frame(x, z).box(W, 0, yB - 0.26, 0, 0.05, 0.38, 0.05, 'UD').box(DK, 0, yB - 0.53, 0, 0.62, 0.18, 0.46, 'D').box(LAMP, 0, yB - 0.625, 0, 0.54, 0.012, 0.38, 'UEWSN');
    LIT.push([x, z, 8.5]);
  }
  v.frame();

  // ---- floor: paving, bands of darker granite on every second module line, the wavy band along the west side (SEEN)
  ctx.add(flat([[b.w, b.n], [b.e, b.n], [b.e, b.s], [b.w, b.s]], 0.04, pavingMaterial()));
  const bandX = Math.min(5, b.sx * 0.2), bandW = 2.4, bm = bandMaterial(), yb = 0.046, xa = b.w + bandX + bandW / 2 + 0.25;
  const fq = (x0, z0, x1, z1) => v.quad(bm, [x0, yb, z1], [x1, yb, z1], [x1, yb, z0], [x0, yb, z0]);
  for (let i = 4; i <= nx; i += 2) fq(b.w + i * mx - 0.15, b.n, b.w + i * mx + 0.15, b.s);
  for (let k = 2; k < nz; k += 2) fq(xa, b.n + k * mz - 0.15, b.e, b.n + k * mz + 0.15);
  fq(xa - 0.15, b.n, xa + 0.15, b.s);
  v.frame(b.w + bandX - bandW / 2, b.n).quad(m.band, [0, 0.047, b.sz], [bandW, 0.047, b.sz], [bandW, 0.047, 0], [0, 0.047, 0]);
  // three round stepped planters with palms on it
  const palms = [], bushes = [], bloom = [];
  let s = 23; const rnd = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  for (const f of [0.22, 0.5, 0.78]) {
    const px = b.w + bandX, pz = b.n + b.sz * f;
    v.frame(px, pz).cyl(GL, 0, 0, 0, 2.0, 0.4, 28, false).cyl(GL, 0, 0.4, 0, 1.4, 0.4, 24, false).cyl(GD, 0, 0, 0, 2.03, 0.06, 28, false);
    ring(v, GL, 0.4, 1.4, 2.0, 28); ring(v, GL, 0.8, 1.2, 1.4); ring(v, lm('soil'), 0.74, 0, 1.2, 12);
    for (let j = 0; j < 24; j++) { const a0 = j / 24 * 6.283, a1 = (j + 1) / 24 * 6.283; v.quad(GL, [Math.cos(a0) * 1.2, 0.74, Math.sin(a0) * 1.2], [Math.cos(a1) * 1.2, 0.74, Math.sin(a1) * 1.2], [Math.cos(a1) * 1.2, 0.8, Math.sin(a1) * 1.2], [Math.cos(a0) * 1.2, 0.8, Math.sin(a0) * 1.2]); }
    palms.push([px, pz, 6.5, 0.74]);
    for (let j = 0; j < 7; j++) { const a = j / 7 * 6.283 + f * 9; bushes.push([px + Math.cos(a) * 0.86, pz + Math.sin(a) * 0.86, 0.26]); }
    for (let j = 0; j < (low ? 14 : 36); j++) { const a = rnd() * 6.283, r = 0.35 + 0.75 * rnd(); bloom.push([px + Math.cos(a) * r, pz + Math.sin(a) * r]); }
    c.frame(px, pz).cyl('generic', 0, 0, 0, 2.0, 0.4, 10).cyl('generic', 0, 0.4, 0, 1.4, 0.4, 10).box('generic', 0, 2, 0, 0.4, 2.4, 0.4);
  }
  v.frame(); c.frame();

  // ---- furniture under the roof (near view): benches beside columns, bins, a notice board, slot drains under the eaves
  const zN = b.n + 0.5 * mz + 0.62, zS = b.s - 0.5 * mz - 0.62, colX = i => b.w + (i + 0.5) * mx;
  if (nx >= 14) {
    for (const [x, north] of [[colX(3) - 1.7, 1], [colX(3) + 1.7, 1], [colX(nx - 4) + 1.7, 1], [colX(3) - 1.7, 0], [colX(3) + 1.7, 0], [colX(nx - 4) - 1.7, 0], [colX(nx - 4) + 1.7, 0]])
      if (!blocked(x, north ? zN : zS, 1)) bench(d, c, x, north ? zN : zS, north ? 0 : Math.PI);
    bins(d, c, colX(6) + 1.3, zN - 0.2, 0); bins(d, c, colX(nx - 7) - 1.3, zS + 0.2, Math.PI, true);
    noticeBoard(d, c, (colX(nx - 7) + colX(nx - 4)) / 2 - 0.6, zN - 0.25, 0, 4, 2);
  }
  drain(d, b.w + 0.4, b.n + 0.32, b.e - 0.4, b.n + 0.32); drain(d, b.w + 0.4, b.s - 0.32, b.e - 0.4, b.s - 0.32);

  const vg = mergeFlat(v.build({ name: item.id }), true);
  vg.traverse(o2 => { if (o2.isMesh && (o2.material === m.under || o2.material === m.band || o2.material === bm)) o2.castShadow = false; });
  ctx.add(vg);
  const cg = c.build(); ctx.add(cg).visible = false; cg.children.forEach(mesh => ctx.collide(mesh));

  // ---- near view: the inner frame as round tubes and ball nodes, the planting, the furniture
  const near = mergeFlat(d.build({ name: item.id + '-near', castShadow: false }), false);
  const r1 = 0.06;
  for (let i = 1; i < nx; i++) for (let k = 0; k < nz; k++) tubes.push([top(i, k), top(i, k + 1), r1]);                    // inner top chords
  for (let k = 1; k < nz; k++) for (let i = 0; i < nx; i++) tubes.push([top(i, k), top(i + 1, k), r1]);
  for (let i = 1; i < nx - 1; i++) for (let k = 0; k < nz - 1; k++) tubes.push([bot(i, k), bot(i, k + 1), r1]);            // inner bottom chords
  for (let k = 1; k < nz - 1; k++) for (let i = 0; i < nx - 1; i++) tubes.push([bot(i, k), bot(i + 1, k), r1]);
  const tube = new THREE.CylinderGeometry(1, 1, 1, low ? 4 : 6, 1, true), tm = new THREE.InstancedMesh(tube, m.steel, tubes.length);
  const A = new THREE.Vector3(), B = new THREE.Vector3(), dir = new THREE.Vector3(), sc = new THREE.Vector3();
  tubes.forEach(([a, e, r], n) => {
    A.set(...a); B.set(...e); dir.subVectors(B, A); const len = dir.length();
    q.setFromUnitVectors(Y, dir.normalize()); tm.setMatrixAt(n, mtx.compose(A.add(B).multiplyScalar(0.5), q, sc.set(r, len, r)));
  });
  tm.name = 'members'; tm.instanceMatrix.needsUpdate = true; tm.computeBoundingSphere(); near.add(tm);
  const balls = [];
  for (let i = 0; i < nx; i++) for (let k = 0; k < nz; k++) balls.push(bot(i, k));
  for (let i = 0; i <= nx; i++) for (let k = 0; k <= nz; k++) balls.push(top(i, k));
  const ball = new THREE.InstancedMesh(low ? new THREE.OctahedronGeometry(0.14, 0) : new THREE.IcosahedronGeometry(0.14, 1), m.steel, balls.length);
  balls.forEach((p, n) => ball.setMatrixAt(n, mtx.makeTranslation(p[0], p[1], p[2])));
  ball.name = 'nodes'; ball.instanceMatrix.needsUpdate = true; ball.computeBoundingSphere(); near.add(ball);
  if (palms.length) near.add(royalPalms(palms, { seed: 6 }).group);
  if (bushes.length) { const sh = shrubs(bushes, { seed: 8, hex: 0x35622c }); sh.position.y = 0.72; near.add(sh); }
  if (bloom.length) near.add(flowers(bloom, [0xe8452f, 0xf5c531, 0xf2f0e6, 0xd94a8c], { seed: 3, size: 0.32, y: 0.74 }));
  ctx.detail(ctx.add(near), b.cx, b.cz, Math.hypot(b.sx, b.sz) / 2 + (low ? 55 : 90));

  // ---- by day the sheets glow with the light that comes through them; after dusk the floodlights light the roof from below
  if (ctx.animate) ctx.animate((dt, t, env) => {
    const n = env && env.lighting && env.lighting.night ? env.lighting.night() : 0;
    m.under.emissiveIntensity = 0.62 * (1 - n) + 0.2 * n; m.under.emissive.setRGB(1, 1 - 0.14 * n, 1 - 0.36 * n);
    m.steel.emissiveIntensity = 0.16 * n;
  });
}
