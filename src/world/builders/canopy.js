// Space-frame canopy over the central plaza, and the floor under it.
//
// SEEN in the 2018 footage (frames 5 to 10 and the frames between them, from the east and north-east) and on the satellite
// image:
//   - one flat rectangular roof of pale, slightly translucent sheets; from above a grid shows through, about 1.3 m by
//     2.5 m; the satellite image shows 16 or 17 raised ribs running north-south over the 40.7 m width;
//   - under it a white double-layer steel space frame: along the free east edge a top chord, a bottom chord half a module
//     further in and V-shaped diagonals between them; depth about 1.8 m, module about 2.5 to 2.7 m (estimated from a frame
//     whose camera position was resected by the tower-location agent);
//   - the east edge spans free between the glass stair block and the block to the north: no columns are visible along it;
//     a white column stands at the south-east corner beside the glass block; no columns in the middle of the plaza;
//   - the south edge sits against a five-storey white block that is NOT in the data, the west side faces a building with
//     planted corridors; so in reality the frame bears mostly on its neighbours;
//   - floor: pale paving; along the west side a wavy black-and-white band with three round stepped planters, a palm in each.
//
// ASSUMED (kept plain):
//   - equal modules both ways (the outline divided into modules of about 2.5 m), the member sizes, ball nodes at every joint;
//   - the sheets are drawn opaque: the frame that shows faintly through the real ones is painted on the top surface as
//     lines at the module grid, with a seam at half a module;
//   - all columns except the one at the south-east corner: a row under the outer bottom-chord nodes along the south, west
//     and north edges, standing in for the buildings the real frame bears on; none along the east edge between its corners;
//   - the underside of the roof (pale sheets on purlins), the nine floodlights under the frame;
//   - the exact place and width of the wavy band (2.4 m wide, 5 m from the west edge), the drawing of its waves, the size of
//     the planters (4 m and 2.8 m across, two steps of 0.4 m), the height of the palms.
//
// Two levels of detail: the roof, the edge trusses, the columns and the floor are always drawn (about 2,400 triangles in
// 10 draw calls, measured); the inner frame (diagonals and ball nodes as two instanced meshes, chords as one merged mesh)
// and the floodlights are shown only near the canopy through ctx.detail (about 18,700 triangles more in 5 draw calls;
// fewer on phones: three-sided diagonals, no top nodes). From the air the inner frame is hidden by the roof anyway.
// The measured outline reaches 0.3 m into the glass stair block and 0.6 m into the block north-east of the canopy (both
// within the stated accuracy of the measurements): the roof simply runs into them, as the real one springs from them.
// Colliders: every column, the three planters, and a thin slab at roof level so that a player leaving drone mode above the
// canopy lands on it.
import { THREE, flat, bbox } from '../../kit.js';
import { Batch } from '../../batch.js';
import { palm } from '../../plants.js';
import { pavingMaterial, blockedBy } from './plaza.js';

const MODULE = 2.5, DEPTH = 1.8;

let M = null;
function materials(mx, mz) {
  if (M) return M;
  const canvas = (w, h, draw) => { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); return c; };
  const tex = (c, rx, rz) => { const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, rz); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; };
  // top: one module per repeat. Lines at the canvas edges are the frame's top chords showing through the sheets; the line
  // across the middle is the sheet seam at half a module.
  const top = canvas(256, 256, (g, w, h) => {
    g.fillStyle = '#dfe2da'; g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(255,255,255,0.35)'; g.fillRect(10, 0, 40, h);                      // light along each rib
    g.fillStyle = 'rgba(112,120,114,0.75)'; g.fillRect(0, 0, 6, h); g.fillRect(w - 6, 0, 6, h);   // north-south rib lines
    g.fillStyle = 'rgba(120,128,122,0.70)'; g.fillRect(0, 0, w, 5); g.fillRect(0, h - 5, w, 5);   // east-west chord lines
    g.fillStyle = 'rgba(130,138,132,0.55)'; g.fillRect(0, h / 2 - 3, w, 6);                       // sheet seam
  });
  // underside: pale sheets, purlin lines at half modules, the top-chord grid drawn on it for the far view
  const under = canvas(256, 256, (g, w, h) => {
    g.fillStyle = '#d9dcd4'; g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(120,126,120,0.5)'; g.fillRect(0, h / 2 - 3, w, 6);
    g.fillStyle = '#f4f4f0'; g.fillRect(0, 0, 9, h); g.fillRect(w - 9, 0, 9, h); g.fillRect(0, 0, w, 9); g.fillRect(0, h - 9, w, 9);
  });
  // wavy band: 2.4 m across (canvas x), one 6 m wave length along (canvas y)
  const band = canvas(128, 512, (g, w, h) => {
    g.fillStyle = '#f1efe8'; g.fillRect(0, 0, w, h); g.fillStyle = '#1d1d1f';
    for (const [x0, half] of [[0.2, 0.085], [0.5, 0.085], [0.8, 0.085]]) {
      g.beginPath();
      for (let y = 0; y <= h; y += 4) g.lineTo((x0 - half + 0.1 * Math.sin(y / h * 2 * Math.PI)) * w, y);
      for (let y = h; y >= 0; y -= 4) g.lineTo((x0 + half + 0.1 * Math.sin(y / h * 2 * Math.PI)) * w, y);
      g.closePath(); g.fill();
    }
  });
  const S = (name, o) => { const m = new THREE.MeshStandardMaterial(o); m.name = name; return m; };   // names must not contain "pane" or "glass": lighting.js makes those glow at night
  M = {
    top: S('canopy-roof-top', { map: tex(top, 1 / mx, 1 / mz), roughness: 0.6 }),
    under: S('canopy-roof-under', { map: tex(under, 1 / mx, 1 / mz), roughness: 0.9 }),
    steel: S('canopy-steel', { color: 0xf3f3ef, roughness: 0.5 }),
    band: S('canopy-wavy-band', { map: tex(band, 1 / 2.4, 1 / 6), roughness: 0.85 }),
    lamp: S('canopy-floodlight', { color: 0xffffff, roughness: 0.6, emissive: 0xfff4d8, emissiveIntensity: 0.9 }),
    dark: S('canopy-lamp-housing', { color: 0x3a3e42, roughness: 0.6 }),
  };
  return M;
}

const X = new THREE.Vector3(1, 0, 0), Y = new THREE.Vector3(0, 1, 0), q = new THREE.Quaternion(), mtx = new THREE.Matrix4(), one = new THREE.Vector3(1, 1, 1);
/** Open-ended square bar between two points [x, y, z] in world coordinates (8 triangles). Leaves the batch in an arbitrary frame. */
function bar(batch, material, a, b, t) {
  const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), d = new THREE.Vector3().subVectors(B, A), len = d.length();
  q.setFromUnitVectors(X, d.normalize());
  batch.setMatrix(mtx.compose(A.add(B).multiplyScalar(0.5), q, one)).box(material, 0, 0, 0, len, t, t, 'EW');
}
/** Flat disc facing up, in the batch's current frame. */
function disc(batch, material, y, r, seg = 16) {
  const p = i => [Math.cos(i / seg * 2 * Math.PI) * r, y, Math.sin(i / seg * 2 * Math.PI) * r];
  for (let i = 0; i < seg; i += 2) batch.quad(material, [0, y, 0], p(i + 2), p(i + 1), p(i));
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
  const m = materials(mx, mz), W = m.steel;
  const top = (i, k) => [b.w + i * mx, yT, b.n + k * mz], bot = (i, k) => [b.w + (i + 0.5) * mx, yB, b.n + (k + 0.5) * mz];
  const v = new Batch(), c = new Batch();

  // ---- roof: sheets (top and underside textured separately), raised north-south ribs, a slim edge trim
  v.frame(b.w, b.n);
  v.slab(m.top, -o, H - 0.05, -o, b.sx + 2 * o, 0.05, b.sz + 2 * o, 'DEWSN');
  v.slab(m.under, -o, H - 0.12, -o, b.sx + 2 * o, 0.05, b.sz + 2 * o, 'UEWSN');
  for (let i = 0; i <= nx; i++) v.slab(W, i * mx - 0.07, H, -o, 0.14, 0.07, b.sz + 2 * o, 'DSN');
  for (const [x, z, sx, sz, skip] of [[-o - 0.06, -o - 0.06, b.sx + 2 * o + 0.12, 0.06, 'S'], [-o - 0.06, b.sz + o, b.sx + 2 * o + 0.12, 0.06, 'N'],
    [-o - 0.06, -o, 0.06, b.sz + 2 * o, 'ESN'], [b.sx + o, -o, 0.06, b.sz + 2 * o, 'WSN']]) v.slab(W, x, H - 0.2, z, sx, 0.24, sz, skip);
  c.frame(b.w, b.n).slab('generic', -o, H - 0.2, -o, b.sx + 2 * o, 0.2, b.sz + 2 * o);

  // ---- edge trusses (always drawn): edge top chords, the outer ring of bottom chords, the diagonals between them
  const tc = 0.15, td = 0.11;
  v.slab(W, -tc / 2, yT - tc / 2, -tc / 2, b.sx + tc, tc, tc).slab(W, -tc / 2, yT - tc / 2, b.sz - tc / 2, b.sx + tc, tc, tc);
  v.slab(W, -tc / 2, yT - tc / 2, 0, tc, tc, b.sz, 'SN').slab(W, b.sx - tc / 2, yT - tc / 2, 0, tc, tc, b.sz, 'SN');
  const bx0 = 0.5 * mx, bx1 = (nx - 0.5) * mx, bz0 = 0.5 * mz, bz1 = (nz - 0.5) * mz;
  v.slab(W, bx0, yB - tc / 2, bz0 - tc / 2, bx1 - bx0, tc, tc, 'EW').slab(W, bx0, yB - tc / 2, bz1 - tc / 2, bx1 - bx0, tc, tc, 'EW');
  v.slab(W, bx0 - tc / 2, yB - tc / 2, bz0, tc, tc, bz1 - bz0, 'SN').slab(W, bx1 - tc / 2, yB - tc / 2, bz0, tc, tc, bz1 - bz0, 'SN');
  const inner = [];                                                      // diagonals left for the near view: [from, to]
  for (let i = 0; i < nx; i++) for (let k = 0; k < nz; k++) for (const [di, dk] of [[0, 0], [1, 0], [0, 1], [1, 1]]) {
    const ti = i + di, tk = k + dk, edge = ti === 0 || ti === nx || tk === 0 || tk === nz;
    if (edge) bar(v, W, bot(i, k), top(ti, tk), td); else inner.push([bot(i, k), top(ti, tk)]);
  }

  // ---- columns under outer bottom nodes: south and north rows, west row; the east edge stays free between its corners
  const blocked = blockedBy(ctx, item), cols = [];
  for (const i of supports(nx)) cols.push([i, 0], [i, nz - 1]);
  for (const k of supports(nz)) if (k > 0 && k < nz - 1) cols.push([0, k]);
  for (const [i, k] of cols) {
    const [x, , z] = bot(i, k);
    if (blocked(x, z, 0.45)) continue;
    v.frame(x, z).cyl(W, 0, 0.25, 0, 0.27, yB - 0.45, 12, false).box('concrete', 0, 0.125, 0, 0.9, 0.25, 0.9, 'D').box(W, 0, yB - 0.14, 0, 0.7, 0.12, 0.7);
    c.frame(x, z).box('generic', 0, (yB - 0.1) / 2, 0, 0.6, yB - 0.1, 0.6);
  }

  // ---- floor: paving, the wavy band along the west side, three round stepped planters with palms on it
  ctx.add(flat([[b.w, b.n], [b.e, b.n], [b.e, b.s], [b.w, b.s]], 0.04, pavingMaterial()));
  const bandX = Math.min(5, b.sx * 0.2), bandW = 2.4;
  v.frame(b.w + bandX - bandW / 2, b.n).slab(m.band, 0, 0.04, 0, bandW, 0.012, b.sz, 'DEWSN');
  for (const f of [0.22, 0.5, 0.78]) {
    const px = b.w + bandX, pz = b.n + b.sz * f;
    v.frame(px, pz).cyl('wallWhite', 0, 0, 0, 2.0, 0.4, 16, false).cyl('wallWhite', 0, 0.4, 0, 1.4, 0.4, 16, false);
    disc(v, 'wallWhite', 0.4, 2.0); disc(v, 'wallWhite', 0.8, 1.4); disc(v, 'lawn', 0.82, 1.22);
    palm(v, px, pz, 6.5, 0.8);
    c.frame(px, pz).cyl('generic', 0, 0, 0, 2.0, 0.4, 10).cyl('generic', 0, 0.4, 0, 1.4, 0.4, 10).box('generic', 0, 2, 0, 0.4, 2.4, 0.4);
  }
  v.frame(); c.frame();
  const vg = v.build({ name: item.id });
  vg.traverse(o2 => { if (o2.isMesh && (o2.material === m.under || o2.material === m.band)) o2.castShadow = false; });
  ctx.add(vg);
  const cg = c.build(); ctx.add(cg).visible = false; cg.children.forEach(mesh => ctx.collide(mesh));

  // ---- near view: the inner frame and the floodlights
  const near = new THREE.Group(); near.name = item.id + '-frame';
  const d = new Batch().frame(b.w, b.n), ti = 0.12;
  for (let i = 1; i < nx; i++) d.slab(W, i * mx - ti / 2, yT - ti / 2, 0, ti, ti, b.sz, 'SNU');                      // inner top chords
  for (let k = 1; k < nz; k++) d.slab(W, 0, yT - ti / 2, k * mz - ti / 2, b.sx, ti, ti, 'EWU');
  for (let i = 1; i < nx - 1; i++) d.slab(W, (i + 0.5) * mx - ti / 2, yB - ti / 2, bz0, ti, ti, bz1 - bz0, 'SN');    // inner bottom chords
  for (let k = 1; k < nz - 1; k++) d.slab(W, bx0, yB - ti / 2, (k + 0.5) * mz - ti / 2, bx1 - bx0, ti, ti, 'EW');
  for (const fi of [0.2, 0.5, 0.8]) for (const fk of [0.2, 0.5, 0.8]) {                                               // floodlights hung under bottom nodes
    const [x, , z] = bot(Math.min(nx - 1, Math.round(fi * (nx - 1))), Math.min(nz - 1, Math.round(fk * (nz - 1))));
    d.frame(x, z).box(W, 0, yB - 0.22, 0, 0.05, 0.3, 0.05, 'UD').box(m.dark, 0, yB - 0.45, 0, 0.5, 0.16, 0.36, 'D').box(m.lamp, 0, yB - 0.535, 0, 0.44, 0.01, 0.3, 'UEWSN');
  }
  near.add(d.build({ name: 'chords', castShadow: false }));
  const tube = new THREE.CylinderGeometry(0.05, 0.05, 1, low ? 3 : 4, 1, true), diag = new THREE.InstancedMesh(tube, W, inner.length);
  const A = new THREE.Vector3(), B = new THREE.Vector3(), dir = new THREE.Vector3(), sc = new THREE.Vector3();
  inner.forEach(([a, e], n) => {
    A.set(...a); B.set(...e); dir.subVectors(B, A); const len = dir.length();
    q.setFromUnitVectors(Y, dir.normalize()); diag.setMatrixAt(n, mtx.compose(A.add(B).multiplyScalar(0.5), q, sc.set(1, len, 1)));
  });
  diag.name = 'diagonals'; diag.instanceMatrix.needsUpdate = true; near.add(diag);
  const balls = [];
  for (let i = 0; i < nx; i++) for (let k = 0; k < nz; k++) balls.push(bot(i, k));
  if (!low) for (let i = 0; i <= nx; i++) for (let k = 0; k <= nz; k++) balls.push(top(i, k));
  const ball = new THREE.InstancedMesh(low ? new THREE.OctahedronGeometry(0.15, 0) : new THREE.IcosahedronGeometry(0.15, 0), W, balls.length);
  balls.forEach((p, n) => ball.setMatrixAt(n, mtx.makeTranslation(p[0], p[1], p[2])));
  ball.name = 'nodes'; ball.instanceMatrix.needsUpdate = true; near.add(ball);
  ctx.detail(ctx.add(near), b.cx, b.cz, Math.hypot(b.sx, b.sz) / 2 + (low ? 55 : 90));
}
