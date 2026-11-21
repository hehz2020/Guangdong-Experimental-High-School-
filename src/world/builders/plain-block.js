// Smaller blocks of the teaching zone and the two link blocks of the south-east slabs (style "plain").
// This file also holds the KIT that stair-tower.js, stair-core.js, sign-wing.js, clock-tower.js, walkway.js, canopy.js and
// plaza.js import, so that the eight builders share one look and few draw calls: finishes by class (lm, mergeFlat),
// facades with real openings (facade, windowIn, doorSet, louvre, curtain, pierce, wallHit), weathering (stain, rwp,
// lightning), a dog-leg stair that can be climbed (stair), lettered cards (textCard, card).
//
// SEEN in the 2018 footage:
//   slab-north-ne-wing (frames 3 and 4, from the north-east; the L-shaped satellite outline fits what they show):
//     - south part: white walls, grey roof, cream parapet; a dark ribbon window on its east face (top storey, a second one
//       below), a small window and an air-conditioner unit on its short north return;
//     - north part, east face: set back, dark ribbon glazing above a dark-red balcony front, an outdoor unit below;
//     - a dark-red vertical stair element with one small window at the north-east corner, a little taller than the roofs;
//     - north face: cream wall with two small green windows under a parapet that rises as a wedge beside the red element.
//   block-north-of-canopy-east-end (frames 6 and 7, from the east): a plain white box about as tall as the slabs; the east
//     face is blank except for ONE column of small square windows and a red item at its foot; the top of the south face
//     is plain white. Satellite image: dark roof with three small white boxes (positions converted from the image).
//   Satellite image only: beige roofs with white parapets on the two "se" blocks, pale roofs on the links.
//
// ASSUMED (not visible in any reference):
//   - slab-north-se-block, slab-south-se-block: everything except outline and roof. They continue the neighbouring slabs'
//     pattern (white grid, dark-red spandrels, window strips), three storeys of 3.6 m, a door each;
//   - slab-north-ne-wing: storey heights (3 x 3.6 m), the ground level (hidden by trees), the west and south faces, the
//     roofs of the two parts being 0.6 m apart in height, all sizes of windows; the wedge is drawn 1.1 m high;
//     its outline is built as three rectangles (the slightly skewed north edge is squared off at its mean position);
//   - block-north-of-canopy-east-end: the lower part of the south face and the whole north and west faces (same small
//     square windows), the height of the roof boxes; the red item is drawn as a hose cabinet;
//   - teaching-slab-west-link-e: all of it beyond the outline (white, one window per bay and storey);
//   - dorm-a-east-link, dorm-b-east-link: all of it beyond the outline (white, short slot windows like the end walls of the
//     neighbouring slabs, a top band at the height of their fascia, a door on the courtyard side).
//
// IMAGINED (the owner asked for finished buildings and said that imagination should fill in what no reference shows):
//   - finishes everywhere: glazed tile, windows set back in their openings with sills and frames, a dark tile base course,
//     door sets with frames, canopies, steps, lamps and blank plates, rainwater pipes with hoppers, dirt streaks under
//     sills and copings, outdoor units, lightning rods and strips on the parapets;
//   - block-north-of-canopy-east-end: its ground floor toward the plaza is a glazed room that can be entered: a small
//     EXHIBITION OF SCHOOL HISTORY. Everything in it is made up: six picture boards (tinted pictures of nothing in
//     particular, captions as grey lines, no words), the plate 校史陈列 over them, two glass cases with cups, a model of
//     the campus built from the outlines of campus-data.js at 1 : 250, benches, a visitors' book; a back door on the north;
//   - teaching-slab-west-link-e: its ground floor is a glazed lobby toward the plaza that can be entered (pin boards with
//     blank sheets, benches);
//   - second refinement round, a room behind the door of every other block, its door standing open and the glass in front
//     of it clear: in slab-north-se-block a MAIL ROOM (pigeonholes with letters, a counter, parcels, a desk), its east face
//     glazed on the ground floor; in slab-south-se-block a SCHOOL CLINIC (couch with a curtain, desk, medicine cabinet,
//     scale, basin, an eye chart of letters E and Ш) behind a tinted glazed front; in the south part of
//     slab-north-ne-wing a PRINT ROOM (two copiers, a counter with bundles of papers, shelves of paper, a guillotine, a desk),
//     entered from its east and west doors; in dorm-a-east-link a LAUNDRY (washing machines, a tiled trough with taps and
//     basins, a folding table, a rack of drying clothes), in dorm-b-east-link a HOT-WATER ROOM (a steel boiler with taps
//     over a tiled trough, shelves of thermos flasks, a bench). The uses and the plates beside the doors are made up:
//     收发室, 医务室, 文印室, 洗衣房, 开水房. The links' upper floors stay closed: the galleries of the dormitory blocks end
//     at closed balustrades (slab-block.js) and the round towers' parapets are closed toward them (round-tower.js), so no
//     passage through a link can be made from this file;
//   - the far look of the glazed tile: farMips() / farTile() fade the tile picture to its mean colour where a tile becomes
//     smaller than a few texels, so that walls read as tile close up and as an even colour from afar.
// Colliders: each block is solid up to its roof plane (plus parapets and roof boxes); the rooms are hollow, with walls,
// their doorways, and blocks for the furniture that stands in the way (cases, tables, counters, shelves, machines, benches).
import { THREE, mat, bbox, itemPolygon } from '../../kit.js';
import { Batch } from '../../batch.js';
import { SURFACES } from '../../hifi.js';
import { LIT } from '../../street.js';

const ALL = 'EWUDSN', skipCache = {};
const skipOf = faces => skipCache[faces] ?? (skipCache[faces] = [...ALL].filter(f => !faces.includes(f)).join(''));
/** Box by low corner and size, in the batch's frame, drawing only the listed faces (E W U D S N = +x -x +y -y +z -z). */
export const F = (b, m, x, y, z, sx, sy, sz, faces = ALL) => b.slab(m, x, y, z, sx, sy, sz, skipOf(faces));

// ---- finishes -------------------------------------------------------------------------------------------------------
// Every surface belongs to a CLASS: one real material per class, shared by all the builders that use this kit, with the
// colour of each part carried in the vertices. So a whole building is drawn in three or four calls (tile, paint, glass)
// however many colours it has. Textures come from hifi.js and are the ones the palette of kit.js already made.
//   tile   small glazed facade tiles with joints (white, cream, dark red, the dark base course)
//   flat   paint, plaster, coated metal: no texture (the page adds its fine grain)
//   glass  tinted glazing with a painted reflection and a tilt per pane; glows after dusk (the lighting module goes by name)
//   clear  the same, see-through: curtain walls with a stair or a lobby behind them
//   stone  cast stone and concrete: steps, copings, kerbs, plinths
//   floor  granite slabs 0.8 m: lobby floors, landings, paving
//   steel  brushed stainless steel: handrails, door furniture, column collars
const BASE = { tile: 0xf1efe8, stone: 0xb9b6ad, glass: 0xa9cdd4, clear: 0xa9cdd4, floor: 0xa8a39a, steel: 0xc9cdd1 };

// ---- facade tile seen from afar ------------------------------------------------------------------------------------------
// The glazed tile of hifi.js has 6 x 6 tiles of slightly different tone in every 0.6 m. Where a tile shrinks to a pixel or
// two on the screen, the generated mipmaps keep that variation at the size of a pixel and the wall reads as a fine
// checkerboard (seen from 20 to 150 m). These copies carry mipmaps of their own: the finer levels are the picture scaled down,
// the level where a tile is about five texels is half way to the wall's mean colour, and the coarser ones are that mean colour.
const farCache = new Map();
/** A copy of a canvas texture whose mip levels fade to the picture's mean value (see above). */
export function farMips(tex) {
  if (!tex || typeof document === 'undefined' || !tex.image || !tex.image.width) return tex;
  if (farCache.has(tex)) return farCache.get(tex);
  const src = tex.image, S = src.width, px = src.getContext('2d').getImageData(0, 0, S, S).data, mean = [0, 0, 0, 0];
  for (let i = 0; i < px.length; i += 4) for (let c = 0; c < 4; c++) mean[c] += px[i + c];
  const n = px.length / 4, css = `rgba(${Math.round(mean[0] / n)},${Math.round(mean[1] / n)},${Math.round(mean[2] / n)},${(mean[3] / n / 255).toFixed(3)})`;
  const mips = [src]; let prev = src;
  for (let size = S >> 1; size >= 1; size >>= 1) {
    const c = document.createElement('canvas'); c.width = c.height = size; const g = c.getContext('2d');
    if (size >= 32) { g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high'; g.drawImage(prev, 0, 0, size, size); }
    if (size <= 32) { g.globalAlpha = size === 32 ? 0.5 : 1; g.fillStyle = css; g.fillRect(0, 0, size, size); g.globalAlpha = 1; }
    mips.push(c); prev = c;
  }
  const t = tex.clone(); t.mipmaps = mips; t.generateMipmaps = false; t.minFilter = THREE.LinearMipmapLinearFilter; t.needsUpdate = true;
  farCache.set(tex, t); return t;
}
const farMats = new Map();
/** The kit's palette tile (mat('wallWhite'), mat('wallMaroon') ...) with far mipmaps: a material of its own, the shared one is left alone. */
export function farTile(name) {
  if (farMats.has(name)) return farMats.get(name);
  const m = mat(name).clone(); m.name = name;                           // the same name: the lighting module and the grain pass see the same finish
  for (const k of ['map', 'normalMap', 'roughnessMap']) if (m[k]) m[k] = farMips(m[k]);
  farMats.set(name, m); return m;
}
const classes = {};
export function classMaterial(cls) {
  if (classes[cls]) return classes[cls];
  const S = o => new THREE.MeshStandardMaterial({ vertexColors: true, ...o }), tex = s => ({ map: s.map, normalMap: s.normalMap || null, roughnessMap: s.roughnessMap || null, roughness: s.roughness, metalness: s.metalness });
  let m;
  if (typeof document === 'undefined' || cls === 'flat') m = S({ roughness: 0.8, metalness: 0.03 });
  else if (cls === 'tile') { const t = SURFACES.tiles(BASE.tile, 6, 0.6, 0.5); m = S(tex({ ...t, map: farMips(t.map), normalMap: farMips(t.normalMap), roughnessMap: farMips(t.roughnessMap) })); }
  else if (cls === 'stone') m = S(tex(SURFACES.concrete(BASE.stone)));
  else if (cls === 'floor') m = S({ ...tex(SURFACES.paving(0xa8a39a, 0x9a958c, 2, 2, [1.6, 1.6], 17, false)), envMapIntensity: 0.6 });
  else if (cls === 'steel') m = S(tex(SURFACES.steel()));
  else {                                                 // glass, clear: panes 1.3 m by 0.975 m (four rows to a 3.9 m storey)
    const g = SURFACES.glazing(BASE.glass, 4, 4, [5.2, 3.9], 7);
    m = S({ map: g.map, normalMap: g.normalMap, roughness: 0.06, metalness: 0.55, envMapIntensity: 1.4 });
    if (cls === 'clear') { m.transparent = true; m.opacity = 0.46; m.depthWrite = false; m.metalness = 0.3; }
  }
  m.name = { tile: 'ends-tile', flat: 'ends-flat', glass: 'ends-glass-panes', clear: 'ends-glass-clear', stone: 'ends-stone', floor: 'ends-floor', steel: 'ends-steel' }[cls];
  return (classes[cls] = m);
}
// name: [class, colour]. Proxies only: finish() folds every part into its class mesh and these are never drawn themselves.
const PARTS = {
  white: ['tile', 0xf1efe8], cream: ['tile', 0xe6d9b4], maroon: ['tile', 0x86302c], base: ['tile', 0x5b5f62], tileGrey: ['tile', 0xb9bcbc], tileGreen: ['tile', 0xcfe0d2],
  cope: ['flat', 0xdedbd2], dark: ['flat', 0x24272a], shade: ['flat', 0x8d8f8c], roof: ['flat', 0x6c6e70], roofBeige: ['flat', 0x9a9282], roofPale: ['flat', 0xd3d0c7],
  plaster: ['flat', 0xe9e6dc], ceil: ['flat', 0xf0eee6], concrete: ['flat', 0xb1aea5], tread: ['flat', 0x9d9a92], rail: ['flat', 0x47525c], red: ['flat', 0xb8322a], alu: ['flat', 0xc4c8cc],
  pvc: ['flat', 0xe1dfd7], door: ['flat', 0x6d7478], frame: ['flat', 0xf4f4f2], frameDark: ['flat', 0x3a4046], wood: ['flat', 0x9a6a42], woodDark: ['flat', 0x6b4a30], green: ['flat', 0x2f6b4f],
  blue: ['flat', 0x2f5f9e], yellow: ['flat', 0xd9b23a], soil: ['flat', 0x4b3d2f], dado: ['flat', 0xb3d0be], dadoLine: ['flat', 0x5f9a80], black: ['flat', 0x141516], sheet: ['flat', 0xf4f1e6],
  glassWin: ['glass', 0x3b4f58], glassGreen: ['glass', 0x4f9482], glassPale: ['glass', 0xa6cdbc], glassTeal: ['glass', 0x3f8f84], glassCore: ['clear', 0x7fc2aa], glassLobby: ['clear', 0xa9d2cc],
  stone: ['stone', 0xb9b6ad], stoneLight: ['stone', 0xd4d1c8], stoneDark: ['stone', 0x6f6d69], terrazzo: ['stone', 0xbdb6a4], granite: ['floor', 0xa8a39a], graniteDark: ['floor', 0x5f5c58], graniteRed: ['floor', 0x8a4a40],
  graniteLight: ['floor', 0xc9c4b8], steel: ['steel', 0xc9cdd1], brass: ['steel', 0xc9a45a],
};
const local = {};
/** Finish by name (see PARTS); 'lamp' is the one self-lit material: it stays a mesh of its own and brightens after dusk. */
export function lm(name) {
  if (local[name]) return local[name];
  let m;
  if (name === 'lamp') { m = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.6, emissive: 0xfff4d8, emissiveIntensity: 0.9 }); m.name = 'ends-lamp'; }
  else {
    const [cls, hex] = PARTS[name], c = new THREE.Color(hex), b = BASE[cls] ? new THREE.Color(BASE[cls]) : null;
    if (b) c.setRGB(c.r / b.r, c.g / b.g, c.b / b.b);
    m = new THREE.MeshStandardMaterial({ color: 0xffffff }); m.color.copy(c); m.userData.cls = cls; m.name = 'ends-part-' + name;
  }
  return (local[name] = m);
}
/** A part of class `cls` in any colour (for one-off tints). */
export function tint(cls, hex) {
  const key = cls + ':' + hex; if (local[key]) return local[key];
  const c = new THREE.Color(hex), b = BASE[cls] ? new THREE.Color(BASE[cls]) : null; if (b) c.setRGB(c.r / b.r, c.g / b.g, c.b / b.b);
  const m = new THREE.MeshStandardMaterial({ color: 0xffffff }); m.color.copy(c); m.userData.cls = cls; m.name = 'ends-part-' + key;
  return (local[key] = m);
}

/** Folds every mesh of `group` whose material is a part (see lm) into one mesh per class. */
export function mergeFlat(group, castShadow) {
  const by = new Map();
  for (const m of group.children) if (m.isMesh && !m.isInstancedMesh && m.material.userData.cls) { const k = m.material.userData.cls; if (!by.has(k)) by.set(k, []); by.get(k).push(m); }
  for (const [cls, take] of by) {
    let nv = 0, ni = 0; for (const m of take) { nv += m.geometry.attributes.position.count; ni += m.geometry.index.count; }
    const pos = new Float32Array(nv * 3), nor = new Float32Array(nv * 3), col = new Float32Array(nv * 3), uv = new Float32Array(nv * 2), idx = new Uint32Array(ni);
    let v0 = 0, i0 = 0;
    for (const m of take) {
      const g = m.geometry, n = g.attributes.position.count, c = m.material.color, ix = g.index.array;
      pos.set(g.attributes.position.array, v0 * 3); nor.set(g.attributes.normal.array, v0 * 3); uv.set(g.attributes.uv.array, v0 * 2);
      for (let i = 0; i < n; i++) { col[(v0 + i) * 3] = c.r; col[(v0 + i) * 3 + 1] = c.g; col[(v0 + i) * 3 + 2] = c.b; }
      for (let i = 0; i < ix.length; i++) idx[i0 + i] = ix[i] + v0;
      v0 += n; i0 += ix.length; group.remove(m); g.dispose();
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.BufferAttribute(nor, 3)); g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    if (cls !== 'flat') g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
    g.setIndex(new THREE.BufferAttribute(idx, 1));
    const mesh = new THREE.Mesh(g, classMaterial(cls)); mesh.castShadow = castShadow && cls !== 'glass' && cls !== 'clear'; mesh.receiveShadow = true; mesh.name = group.name + '-' + cls;
    if (cls === 'clear') mesh.renderOrder = 2;
    group.add(mesh);
  }
  return group;
}

/**
 * Batches of one item: v = always drawn, d = fittings shown only near the viewer, i = interiors (shown from closer still),
 * c = invisible colliders. vx, dx, ix: ready-made objects (instanced plants, lettering) to add to the three groups.
 */
export function shell(ctx) { return { v: new Batch(), d: new Batch(), i: new Batch(), c: new Batch(), vx: [], dx: [], ix: [], low: !!ctx.lowPower, ctx }; }
export function finish(S, item, ctx, x, z, range, inner = Math.min(range, S.low ? 34 : 46)) {
  const vg = mergeFlat(S.v.build({ name: item.id }), true); for (const o of S.vx) vg.add(o); ctx.add(vg);
  const dg = mergeFlat(S.d.build({ name: item.id + '-detail', castShadow: false }), false); for (const o of S.dx) dg.add(o);
  if (dg.children.length) ctx.detail(ctx.add(dg), x, z, range);
  const ig = mergeFlat(S.i.build({ name: item.id + '-inside', castShadow: false }), false); for (const o of S.ix) ig.add(o);
  if (ig.children.length) ctx.detail(ctx.add(ig), x, z, inner);
  const cg = ctx.add(S.c.build({ name: item.id + '-colliders' })); cg.visible = false;
  cg.traverse(o => { if (o.isMesh) ctx.collide(o); });
  return vg;
}
export const hit = (S, x, y, z, sx, sy, sz) => S.c.slab('generic', x, y, z, sx, sy, sz);

/**
 * Drawing on one facade. side: 'N' 'S' 'E' 'W' (the way the facade looks); p: its plane (z for N/S, x for E/W).
 * Returns put(batch, material, u0, u1, y0, y1, d0, d1, faces): a box from u0 to u1 along the facade (x for N/S, z for E/W),
 * between depths d0 and d1 measured outward from the plane. faces: F front, B back, L low-u end, R high-u end, U, D.
 */
export function face(side, p) {
  const out = side === 'N' || side === 'W' ? -1 : 1, alongX = side === 'N' || side === 'S';
  const map = alongX ? { F: out > 0 ? 'S' : 'N', B: out > 0 ? 'N' : 'S', L: 'W', R: 'E', U: 'U', D: 'D' } : { F: out > 0 ? 'E' : 'W', B: out > 0 ? 'W' : 'E', L: 'N', R: 'S', U: 'U', D: 'D' };
  const cache = {};
  const put = (b, m, u0, u1, y0, y1, d0 = 0, d1 = 0.05, faces = 'FLRUD') => {
    const lo = out > 0 ? p + d0 : p - d1, wf = cache[faces] ?? (cache[faces] = [...faces].map(f => map[f]).join(''));
    return alongX ? F(b, m, u0, y0, lo, u1 - u0, y1 - y0, d1 - d0, wf) : F(b, m, lo, y0, u0, d1 - d0, y1 - y0, u1 - u0, wf);
  };
  put.plane = p; put.out = out; put.alongX = alongX; put.side = side;
  return put;
}

// ---- facades with real openings ------------------------------------------------------------------------------------------
/** Boxes over the rectangle u0..u1, y0..y1 of a facade, leaving out the holes [[ua, ub, ya, yb]...]. */
export function pierce(b, m, put, u0, u1, y0, y1, holes, d0 = -0.01, d1 = 0, faces = 'F') {
  const ys = [...new Set([y0, y1, ...holes.flatMap(h => [h[2], h[3]])].filter(y => y >= y0 - 1e-6 && y <= y1 + 1e-6))].sort((a, c) => a - c);
  for (let i = 0; i + 1 < ys.length; i++) {
    const ya = ys[i], yb = ys[i + 1], ym = (ya + yb) / 2; if (yb - ya < 1e-4) continue;
    const cuts = holes.filter(h => h[2] < ym && h[3] > ym && h[0] < u1 && h[1] > u0).map(h => [Math.max(u0, h[0]), Math.min(u1, h[1])]).sort((a, c) => a[0] - c[0]);
    let u = u0;
    for (const [a, c] of cuts) { if (a > u + 1e-4) put(b, m, u, a, ya, yb, d0, d1, faces); u = Math.max(u, c); }
    if (u1 > u + 1e-4) put(b, m, u, u1, ya, yb, d0, d1, faces);
  }
}
/** Collider of a wall t thick behind the facade plane, between u0..u1 and y0..y1, with doorways left open (holes as in pierce; doorways above one another are fine). */
export function wallHit(S, put, u0, u1, y0, y1, holes = [], t = 0.12) {
  const cols = [];                                           // doorways that share a stretch of the wall form one column
  for (const h of holes.filter(q => q[0] < u1 && q[1] > u0).sort((a, b) => a[0] - b[0])) {
    const c = cols[cols.length - 1];
    if (c && h[0] < c.b - 0.01) { c.b = Math.max(c.b, h[1]); c.ys.push([h[2], h[3]]); } else cols.push({ a: Math.max(u0, h[0]), b: Math.min(u1, h[1]), ys: [[h[2], h[3]]] });
  }
  let u = u0;
  for (const c of cols) {
    if (c.a > u + 0.01) put(S.c, 'generic', u, c.a, y0, y1, -t, 0, 'FBLRUD');
    let y = y0;
    for (const [ya, yb] of c.ys.sort((p, q) => p[0] - q[0])) { if (ya > y + 0.01) put(S.c, 'generic', c.a, c.b, y, Math.min(ya, y1), -t, 0, 'FBLRUD'); y = Math.max(y, yb); }
    if (y1 > y + 0.01) put(S.c, 'generic', c.a, c.b, y, y1, -t, 0, 'FBLRUD');
    u = Math.max(u, c.b);
  }
  if (u1 > u + 0.01) put(S.c, 'generic', u, u1, y0, y1, -t, 0, 'FBLRUD');
}
/**
 * Curtain wall: see-through glass in a white frame, a spandrel band at every floor level, a slim transom at mid storey;
 * visible from both sides. holes: doorways [[ua, ub, ya, yb]...]. Returns nothing; colliders are the caller's (wallHit).
 */
export function curtain(S, put, u0, u1, y0, y1, levels, holes = [], o = {}) {
  const G = o.glass || lm('glassCore'), FR = o.bars || lm('frame'), n = Math.max(1, Math.round((u1 - u0) / (o.pitch ?? 1.3))), t = o.t ?? 0.12;
  pierce(S.v, G, put, u0, u1, y0, y1, holes, -t / 2 - 0.01, -t / 2 + 0.01, 'FB');
  for (let i = 0; i <= n; i++) { const u = u0 + (u1 - u0) * i / n, a = Math.max(u0, u - 0.035), b = Math.min(u1, u + 0.035); pierce(S.v, FR, put, a, b, y0, y1, holes, -t, 0.02, 'FBLR'); }
  pierce(S.v, FR, put, u0, u1, y0, y0 + 0.12, holes, -t, 0.02, 'FBU'); pierce(S.v, FR, put, u0, u1, y1 - 0.1, y1, holes, -t, 0.02, 'FBD');
  for (let k = 0; k < levels.length; k++) {
    const y = levels[k];
    if (y > y0 + 0.5 && y < y1 - 0.3) pierce(S.v, o.band || lm('cope'), put, u0, u1, y - 0.3, y + 0.08, holes, -t, 0.03, 'FBUD');
    const ym = k + 1 < levels.length ? (y + levels[k + 1]) / 2 : y + (levels[1] - levels[0]) / 2;
    if (ym < y1 - 0.5) pierce(S.v, FR, put, u0, u1, ym - 0.03, ym + 0.03, holes, -t + 0.01, 0.01, 'FBUD');
  }
}
/** Corners of an upright rectangle on a facade, d metres proud of it, in the order Batch.quad wants (bottom left, bottom right, top right, top left for someone looking at the wall). */
export function quadOn(put, u0, u1, y0, y1, d = 0.02) {
  const pd = put.plane + put.out * d, flip = put.side === 'N' || put.side === 'E', ua = flip ? u1 : u0, ub = flip ? u0 : u1;
  return put.alongX ? [[ua, y0, pd], [ub, y0, pd], [ub, y1, pd], [ua, y1, pd]] : [[pd, y0, ua], [pd, y0, ub], [pd, y1, ub], [pd, y1, ua]];
}
const stains = new Map();
/** Material of a stain card `len` metres tall (rounded to 0.2 m). Use it on a Batch.quad listed bottom left, bottom right, top right, top left. */
export function stainMat(len) {
  const key = Math.max(2, Math.round(len * 5)), L = key / 5; let m = stains.get(key);
  if (!m) {
    let map = stains.get('map');
    if (!map) {
      const W = 128, H = 128, c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d'); let sd = 77;
      const r = () => ((sd = (sd * 1664525 + 1013904223) >>> 0) / 4294967296);
      for (let x = 0; x < W; x += 2) { const al = 0.04 + 0.34 * r() * r(), l = H * (0.35 + 0.65 * r()), gr = g.createLinearGradient(0, 0, 0, l); gr.addColorStop(0, `rgba(70,68,60,${al.toFixed(3)})`); gr.addColorStop(1, 'rgba(70,68,60,0)'); g.fillStyle = gr; g.fillRect(x, 0, 2, l); }
      map = new THREE.CanvasTexture(c); map.colorSpace = THREE.SRGBColorSpace; stains.set('map', map);
    }
    const t = map.clone(); t.wrapS = THREE.RepeatWrapping; t.repeat.set(1 / 1.6, 1 / L); t.needsUpdate = true;
    m = new THREE.MeshStandardMaterial({ map: t, transparent: true, depthWrite: false, roughness: 0.95, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -4 });
    m.name = 'ends-stain'; m.userData.noGrain = true; m.userData.len = L; stains.set(key, m);
  }
  return m;
}
/** Dirt washed down a wall below a sill, a coping or a spout: a streaked see-through card just proud of the wall (near view). */
export function stain(S, put, u0, u1, yTop, len = 0.6, d = 0.012) {
  if (S.low || typeof document === 'undefined') return;
  const m = stainMat(len);
  S.d.quad(m, ...quadOn(put, u0, u1, yTop - m.userData.len, yTop, d));
}
/**
 * One facade as a wall with real openings. side, p as in face(); the wall is the rectangle u0..u1, y0..y1.
 * o.mat: wall finish; o.rev: depth of the window reveals; o.t: wall thickness when its inner face is to be drawn too
 * (o.inner: its finish). Call win()/door()/hole() for every opening and then done().
 */
export function facade(S, side, p, u0, u1, y0, y1, o = {}) {
  const put = face(side, p), holes = [], mat = o.mat || lm('white'), rev = o.rev ?? 0.14;
  const A = {
    put, holes, side, p,
    hole(ua, ub, ya, yb, through = false) {
      holes.push([ua, ub, ya, yb]);
      if (through && o.t) { const R = o.revMat || lm('cope'), e = 0.01; put(S.v, R, ua - e, ua, ya, yb, -o.t, 0, 'R'); put(S.v, R, ub, ub + e, ya, yb, -o.t, 0, 'L'); put(S.v, R, ua, ub, yb, yb + e, -o.t, 0, 'D'); }
      return A;
    },
    win(ua, ub, ya, yb, w = {}) { holes.push([ua, ub, ya, yb]); windowIn(S, put, ua, ub, ya, yb, { rev: o.t ? Math.min(rev, o.t - 0.06) : rev, wall: mat, t: o.t, ...w }); return A; },
    door(uc, d = {}) { const h = doorSet(S, put, uc, { rev: o.t ? o.t / 2 : rev, wall: mat, t: o.t, ...d }); holes.push(h); return A; },
    done() {
      pierce(S.v, mat, put, u0, u1, y0, y1, holes);
      if (o.t) pierce(o.innerBatch || S.v, o.inner || lm('plaster'), put, o.iu0 ?? u0, o.iu1 ?? u1, o.iy0 ?? y0, o.iy1 ?? y1, holes, -o.t, -o.t + 0.01, 'B');
      return A;
    },
  };
  return A;
}
/**
 * A window set back in its opening: reveals, glass, frame with n mullions and an optional transom (height above the
 * sill), a projecting sill with a stain under it. o.glass: finish of the panes; o.bars: finish of the frame.
 */
export function windowIn(S, put, ua, ub, ya, yb, o = {}) {
  const rev = o.rev ?? 0.14, G = o.glass || lm('glassWin'), FR = o.bars || lm('frame'), R = o.revMat || lm('cope'), e = 0.01, t = o.fw ?? 0.055, n = o.n ?? 1, g = -rev;
  put(S.v, R, ua - e, ua, ya, yb, g, 0, 'R'); put(S.v, R, ub, ub + e, ya, yb, g, 0, 'L'); put(S.v, R, ua, ub, yb, yb + e, g, 0, 'D'); put(S.v, R, ua, ub, ya - e, ya, g, 0, 'U');
  put(S.v, G, ua, ub, ya, yb, g - 0.02, g, 'F');
  if (o.t) {                                              // seen from inside as well
    put(S.v, o.glassIn || lm('glassLobby'), ua, ub, ya, yb, g - 0.03, g - 0.02, 'B');
    put(S.v, R, ua - e, ua, ya, yb, -o.t, g - 0.03, 'R'); put(S.v, R, ub, ub + e, ya, yb, -o.t, g - 0.03, 'L'); put(S.v, R, ua, ub, yb, yb + e, -o.t, g - 0.03, 'D'); put(S.v, R, ua, ub, ya - e, ya, -o.t, g - 0.03, 'U');
  }
  const fr = o.t ? 'FBUD' : 'FUD', fs = o.t ? 'FBLR' : 'FLR';
  put(S.v, FR, ua, ub, yb - t, yb, g - (o.t ? 0.03 : 0), g + 0.045, fr); put(S.v, FR, ua, ub, ya, ya + t, g - (o.t ? 0.03 : 0), g + 0.045, fr);
  put(S.v, FR, ua, ua + t, ya + t, yb - t, g - (o.t ? 0.03 : 0), g + 0.045, fs); put(S.v, FR, ub - t, ub, ya + t, yb - t, g - (o.t ? 0.03 : 0), g + 0.045, fs);
  for (let i = 1; i <= n; i++) { const u = ua + (ub - ua) * i / (n + 1); put(S.v, FR, u - 0.022, u + 0.022, ya + t, yb - t, g - (o.t ? 0.03 : 0), g + 0.04, fs); }
  if (o.transom) put(S.v, FR, ua + t, ub - t, ya + o.transom - 0.022, ya + o.transom + 0.022, g - (o.t ? 0.03 : 0), g + 0.04, fr);
  if (o.sill !== false) { put(S.v, lm('cope'), ua - 0.06, ub + 0.06, ya - 0.06, ya, g, 0.07, 'FLRUD'); if (o.stain !== false) stain(S, put, ua - 0.04, ub + 0.04, ya - 0.06, o.stainLen ?? 0.5); }
  if (o.hood) put(S.v, lm('cope'), ua - 0.1, ub + 0.1, yb + 0.02, yb + 0.1, 0, o.hood, 'FLRUD');
  if (o.grille) for (let y = ya + 0.14; y < yb - 0.06; y += 0.14) put(S.d, lm('alu'), ua + 0.03, ub - 0.03, y, y + 0.012, g + 0.05, g + 0.07, 'FUD');   // security bars
}
/** Aluminium louvre set in an opening: blades with dark gaps between them. */
export function louvre(S, put, ua, ub, ya, yb, o = {}) {
  const rev = o.rev ?? 0.1, FR = o.bars || lm('alu'), e = 0.01, n = Math.max(3, Math.round((yb - ya) / (o.pitch ?? 0.11)));
  put(S.v, lm('dark'), ua, ub, ya, yb, -rev - 0.02, -rev, 'F');
  put(S.v, FR, ua - e, ua + 0.04, ya, yb, -rev, 0.015, 'FR'); put(S.v, FR, ub - 0.04, ub + e, ya, yb, -rev, 0.015, 'FL'); put(S.v, FR, ua, ub, yb - 0.04, yb + e, -rev, 0.015, 'FD'); put(S.v, FR, ua, ub, ya - e, ya + 0.04, -rev, 0.015, 'FU');
  const b = S.low ? S.v : (o.far ? S.v : S.d), step = (yb - ya - 0.08) / n;
  for (let i = 0; i < n; i++) { const y = ya + 0.04 + i * step; put(b, FR, ua + 0.04, ub - 0.04, y + step * 0.25, y + step * 0.8, -rev + 0.01, -0.005, 'FU'); }
  return [ua, ub, ya, yb];
}
/**
 * Door set in an opening: frame, two leaves (o.glazed: glass leaves with rails and a fanlight), kick plates, handles, a step,
 * a canopy on brackets, a lamp, a plate beside it (blank). Returns the hole [ua, ub, ya, yb] it needs in the wall.
 * o.open: draw no leaves (a doorway to walk through); o.y0: threshold height.
 */
export function doorSet(S, put, uc, o = {}) {
  const w = o.w ?? 1.5, h = o.h ?? 2.2, y0 = o.y0 ?? 0, rev = o.rev ?? 0.14, fan = o.fan ?? (o.glazed ? 0.5 : 0), y1 = y0 + h, yt = y1 + fan, FR = o.bars || lm(o.glazed ? 'frameDark' : 'frame'), R = o.revMat || lm('cope');
  const ua = uc - w / 2 - 0.07, ub = uc + w / 2 + 0.07, e = 0.01, g = -rev, T = o.t || 0;
  const back = T ? -T : g;
  put(S.v, R, ua - e, ua, y0, yt + 0.07, back, 0, 'R'); put(S.v, R, ub, ub + e, y0, yt + 0.07, back, 0, 'L'); put(S.v, R, ua, ub, yt + 0.07, yt + 0.07 + e, back, 0, 'D');
  const fa = T ? 'FBLR' : 'FLR', fb = T ? 'FBUD' : 'FUD';
  put(S.v, FR, ua, ua + 0.07, y0, yt + 0.07, g - 0.03, g + 0.05, fa); put(S.v, FR, ub - 0.07, ub, y0, yt + 0.07, g - 0.03, g + 0.05, fa); put(S.v, FR, ua + 0.07, ub - 0.07, yt, yt + 0.07, g - 0.03, g + 0.05, fb);
  if (fan) { put(S.v, FR, ua + 0.07, ub - 0.07, y1 - 0.03, y1 + 0.03, g - 0.03, g + 0.05, fb); put(S.v, o.glass || lm('glassLobby'), ua + 0.07, ub - 0.07, y1 + 0.03, yt, g - 0.01, g, T ? 'FB' : 'F'); }
  if (o.swing) {                                           // leaves standing open at right angles to the wall: a doorway to walk through
    const lw = w > 1.15 ? w / 2 : w, d0 = o.swing === 'in' ? back - lw : 0.02, d1 = o.swing === 'in' ? back : 0.02 + lw, LM = o.glazed ? (o.glass || lm('glassLobby')) : (o.leaf || lm('door'));
    for (const [u, fc] of w > 1.15 ? [[ua + 0.075, 'LR'], [ub - 0.105, 'LR']] : [[ua + 0.075, 'LR']]) {
      put(S.v, LM, u, u + 0.03, y0 + 0.02, y1 - 0.03, d0, d1, fc + 'FB');
      if (o.glazed) { put(S.v, FR, u - 0.005, u + 0.035, y0 + 0.02, y0 + 0.2, d0, d1, 'LRUFB'); put(S.v, FR, u - 0.005, u + 0.035, y1 - 0.12, y1 - 0.03, d0, d1, 'LRDFB'); }
    }
  } else if (!o.open) {
    const leaves = w > 1.15 ? 2 : 1, lw = w / leaves;
    for (let i = 0; i < leaves; i++) {
      const a = uc - w / 2 + i * lw + 0.008, b = a + lw - 0.016;
      if (o.glazed) {
        put(S.v, o.glass || lm('glassLobby'), a, b, y0 + 0.02, y1 - 0.03, g - 0.01, g, T ? 'FB' : 'F');
        put(S.v, FR, a, b, y0 + 0.02, y0 + 0.2, g - 0.02, g + 0.02, fb); put(S.v, FR, a, b, y1 - 0.12, y1 - 0.03, g - 0.02, g + 0.02, fb);
        put(S.v, FR, a, a + 0.06, y0 + 0.2, y1 - 0.12, g - 0.02, g + 0.02, fa); put(S.v, FR, b - 0.06, b, y0 + 0.2, y1 - 0.12, g - 0.02, g + 0.02, fa);
        const hx = leaves === 2 ? (i ? a + 0.12 : b - 0.12) : b - 0.12; put(S.d, lm('steel'), hx - 0.015, hx + 0.015, y0 + 0.75, y0 + 1.45, g + 0.03, g + 0.075, 'FLRUD'); if (T) put(S.d, lm('steel'), hx - 0.015, hx + 0.015, y0 + 0.75, y0 + 1.45, g - 0.075, g - 0.03, 'BLRUD');
      } else {
        put(S.v, o.leaf || lm('door'), a, b, y0 + 0.02, y1 - 0.03, g - 0.03, g + 0.015, T ? 'FBLR' : 'FLR');
        put(S.d, lm('alu'), a, b, y0 + 0.02, y0 + 0.24, g + 0.015, g + 0.02, 'F');                                                 // kick plate
        if (o.vision !== false) { put(S.d, lm('frame'), a + lw / 2 - 0.16, a + lw / 2 + 0.16, y0 + 1.2, y0 + 1.86, g + 0.015, g + 0.022, 'FLRUD'); put(S.d, lm('glassWin'), a + lw / 2 - 0.13, a + lw / 2 + 0.13, y0 + 1.23, y0 + 1.83, g + 0.022, g + 0.026, 'F'); }
        const hx = leaves === 2 ? (i ? a + 0.1 : b - 0.1) : b - 0.1; put(S.d, lm('steel'), hx - 0.02, hx + 0.02, y0 + 0.92, y0 + 1.22, g + 0.02, g + 0.075, 'FLRUD');
      }
    }
  }
  if (o.step !== false) put(S.v, lm('concrete'), ua - 0.25, ub + 0.25, Math.max(0, y0 - 0.14), y0 + 0.02, back, o.stepOut ?? 0.55, 'FLRU');
  if (o.canopy) {                                          // flat concrete canopy with a drip edge, on two brackets
    const c = o.canopy, yc = yt + 0.32;
    put(S.v, lm('cope'), ua - 0.45, ub + 0.45, yc, yc + 0.12, 0, c, 'FLRUD'); put(S.v, lm('cope'), ua - 0.45, ub + 0.45, yc + 0.12, yc + 0.2, c - 0.08, c, 'FBLRU');
    for (const u of [ua - 0.3, ub + 0.3]) put(S.v, lm('cope'), u - 0.05, u + 0.05, yc - 0.22, yc, 0, c * 0.7, 'FLRD');
    stain(S, put, ua - 0.4, ub + 0.4, yc, 0.35);
    // a porch deep enough to stand under counts as indoors for the lighting (the lamp that follows the viewer comes on)
    if (c >= 1.2 && S.ctx && S.ctx.indoor) {
      const a = put.plane, e = put.plane + put.out * c, lo = Math.min(a, e), hi = Math.max(a, e), u0 = ua - 0.45, u1 = ub + 0.45;
      S.ctx.indoor(put.alongX ? [[u0, lo], [u1, lo], [u1, hi], [u0, hi]] : [[lo, u0], [hi, u0], [hi, u1], [lo, u1]], yc, y0 - 0.6);
    }
  }
  if (o.lamp !== false) { const yl = yt + (o.canopy ? 0.18 : 0.3); put(S.d, lm('alu'), uc - 0.05, uc + 0.05, yl, yl + 0.12, 0, 0.1, 'FLRU'); put(S.d, lm('lamp'), uc - 0.14, uc + 0.14, yl - 0.07, yl + 0.005, 0.02, 0.2, 'FLRD'); }
  if (o.plate !== false) { put(S.d, lm('steel'), ub + 0.18, ub + 0.48, y0 + 1.45, y0 + 1.65, 0, 0.012, 'FLRUD'); if (o.plateMat) card(S.d, put, o.plateMat, ub + 0.19, ub + 0.47, y0 + 1.46, y0 + 1.64, 0.016); }
  return [ua, ub, y0, yt + 0.07];
}
/** Round rainwater pipe with a hopper head, brackets and a shoe, from y1 down to y0 (near view). */
export function rwp(S, put, u, y1, y0 = 0.12, mat = lm('pvc')) {
  const b = S.d;
  put(b, mat, u - 0.05, u + 0.05, y0, y1 - 0.3, 0.03, 0.13, 'FLR'); put(b, mat, u - 0.12, u + 0.12, y1 - 0.3, y1, 0.01, 0.2, 'FLRUD');
  for (let y = Math.max(y0 + 1.2, 1.6); y < y1 - 0.6; y += 1.95) put(b, lm('shade'), u - 0.075, u + 0.075, y, y + 0.04, 0, 0.145, 'FLRUD');
  put(b, mat, u - 0.05, u + 0.05, y0 - 0.1, y0, 0.03, 0.26, 'FLRU');
  stain(S, put, u - 0.25, u + 0.25, y0 + 0.5, 0.5);
}
/** Lightning protection along a parapet: a strip on stand-offs round the rectangle r at height y, rods at the corners, one down conductor. */
export function lightning(S, r, y, down = null) {
  const A = lm('alu'), b = S.d;
  for (const [x, z, sx, sz] of [[r.w + 0.08, r.n + 0.08, r.e - r.w - 0.16, 0.02], [r.w + 0.08, r.s - 0.1, r.e - r.w - 0.16, 0.02], [r.w + 0.08, r.n + 0.08, 0.02, r.s - r.n - 0.16], [r.e - 0.1, r.n + 0.08, 0.02, r.s - r.n - 0.16]]) F(b, A, x, y + 0.1, z, sx, 0.012, sz, 'NSEWUD');
  if (!S.low) for (const [x, z] of [[r.w + 0.09, r.n + 0.09], [r.e - 0.09, r.n + 0.09], [r.e - 0.09, r.s - 0.09], [r.w + 0.09, r.s - 0.09]]) { F(b, A, x - 0.008, y, z - 0.008, 0.016, 0.9, 0.016, 'NSEWU'); F(b, lm('shade'), x - 0.04, y, z - 0.04, 0.08, 0.05, 0.08, 'NSEWU'); }
  if (down) down(b, A);
}

// ---- stairs to walk on ---------------------------------------------------------------------------------------------------
const M4 = new THREE.Matrix4(), R4 = new THREE.Matrix4();
/** Slab whose TOP runs from (xa, ya) to (xb, yb) in the x-y plane of the frame `base`, between z0 and z1, th thick. */
export function slope(b, base, m, xa, ya, xb, yb, z0, z1, th, faces = ALL) {
  const dx = xb - xa, dy = yb - ya, len = Math.hypot(dx, dy), a = Math.atan2(dy, dx);
  M4.copy(base).multiply(R4.makeRotationZ(a).setPosition((xa + xb) / 2 + Math.sin(a) * th / 2, (ya + yb) / 2 - Math.cos(a) * th / 2, (z0 + z1) / 2));
  b.setMatrix(M4).box(m, 0, 0, 0, len, th, z1 - z0, skipOf(faces));
}
/**
 * Dog-leg stair that the player can climb. Its own frame: origin (o.x, o.z), turned by o.ang as Batch.frame does (0: +X
 * east, quarter turn: +X north); flights run along +X from the edge of the floor landings (x = 0) to the edge of the half
 * landings (x = run). Flight A (up from a floor) is on the +Z side of the well, flight B (on to the next floor) on the -Z
 * side. o.levels: floor heights, lowest first; o.w: flight width; o.gap: width of the well; o.steps, o.go: per flight;
 * o.landB: depth of the half landings. Floors, walls and the guard at the top are the caller's.
 * Always drawn: soffit slabs, half landings, stringers. Near view: treads with nosings, balusters, handrails, storey numbers.
 * Colliders: one ramp per flight through the middle of its treads, the half landings, a wall in the well (full height).
 * Returns { run, base, P } (P(x, y, z): world position of a point of the stair's frame).
 */
export function stair(S, o) {
  const { x, z, ang = 0, levels, w = 1.4, gap = 0.2, go = 0.28, landB = 1.4 } = o, base = new THREE.Matrix4().makeRotationY(ang).setPosition(x, 0, z);
  const steps = o.steps ?? 13, run = steps * go, zA0 = gap / 2, zA1 = gap / 2 + w, zB0 = -gap / 2 - w, zB1 = -gap / 2, th = 0.16;
  const SOF = o.soffit || lm('plaster'), TR = o.tread || lm('terrazzo'), NO = lm('dark'), ST = o.stringer || lm('cope'), RL = lm('steel'), LAND = o.landing || lm('granite'), OW = o.outerMat || lm('white'), CP = lm('cope');
  const P = (px, py, pz) => { const v = new THREE.Vector3(px, py, pz).applyMatrix4(base); return [v.x, v.y, v.z]; };
  const home = b => b.setMatrix(base);
  const rail = (b, a, c, t = 0.045) => { b.strut(RL, P(...a), P(...c), t); home(b); };
  const tw = 0.12, yLo = levels[0], yHi = levels[levels.length - 1];
  [S.v, S.d, S.i, S.c].forEach(home);
  for (let k = 0; k + 1 < levels.length; k++) {
    const y0 = levels[k], y1 = levels[k + 1], ym = (y0 + y1) / 2, rise = (ym - y0) / steps;
    // half landing
    F(S.v, LAND, run, ym - 0.02, zB0, landB, 0.02, zA1 - zB0, 'U'); F(S.v, SOF, run, ym - th, zB0, landB, th - 0.02, zA1 - zB0, 'DWENS');
    F(S.c, 'generic', run - go / 2, ym - th, zB0, landB + go / 2, th, zA1 - zB0);
    if (o.outer) {                                           // solid balustrade round the half landing
      const walls = [[run, zA1, landB + tw, tw], [run, zB0 - tw, landB + tw, tw]]; if (o.outerEnd !== false) walls.push([run + landB, zB0, tw, zA1 - zB0]);
      for (const [wx, wz, sx, sz] of walls) { F(S.v, OW, wx, ym - th, wz, sx, th + 1.05, sz, 'NSEWD'); F(S.v, CP, wx - 0.02, ym + 1.05, wz - 0.02, sx + 0.04, 0.05, sz + 0.04, 'NSEWUD'); F(S.c, 'generic', wx, ym + 0.01, wz, sx, 1.74, sz); }
    }
    for (const [za, zb, xa, ya, xb, yb, well] of [[zA0, zA1, 0, y0, run, ym, zA0], [zB0, zB1, run, ym, 0, y1, zB1]]) {
      const up = xb > xa ? 1 : -1, sgn = well === zA0 ? 1 : -1;
      slope(S.v, base, SOF, xa, ya - 0.03, xb, yb - 0.03, za, zb, 0.13, 'DSN'); home(S.v);                                       // waist slab under the treads
      slope(S.c, base, 'generic', xa - up * go / 2, ya, xb - up * go / 2, yb, za, zb, 0.2); home(S.c);                            // the ramp the walker climbs
      if (!o.spine) { slope(S.v, base, ST, xa, ya + 0.3, xb, yb + 0.3, well - 0.02, well + 0.02, 0.36, 'UDSNEW'); home(S.v); }    // stringer on the well side
      if (o.outer) {                                         // solid balustrade on the outer side, with a coping
        const zo = well === zA0 ? zA1 : zB0 - tw;
        // a slab with upright ends: its top follows the flight 1.05 m above the nosings, its underside hides the waist slab
        const lo = -0.42, hi = 1.05 + rise, A0 = [xa, ya + lo], A1 = [xa, ya + hi], B0 = [xb, yb + lo], B1 = [xb, yb + hi], z0 = zo, z1 = zo + tw, L = up > 0 ? [A0, B0, B1, A1] : [B0, A0, A1, B1];
        home(S.v);
        S.v.quad(OW, [L[0][0], L[0][1], z1], [L[1][0], L[1][1], z1], [L[2][0], L[2][1], z1], [L[3][0], L[3][1], z1]);             // face toward +Z
        S.v.quad(OW, [L[1][0], L[1][1], z0], [L[0][0], L[0][1], z0], [L[3][0], L[3][1], z0], [L[2][0], L[2][1], z0]);             // face toward -Z
        S.v.quad(CP, [L[3][0], L[3][1], z1 + 0.02], [L[2][0], L[2][1], z1 + 0.02], [L[2][0], L[2][1], z0 - 0.02], [L[3][0], L[3][1], z0 - 0.02]);   // top
        S.v.quad(OW, [L[0][0], L[0][1], z0], [L[1][0], L[1][1], z0], [L[1][0], L[1][1], z1], [L[0][0], L[0][1], z1]);             // underside
        S.v.quad(OW, [L[0][0], L[0][1], z0], [L[0][0], L[0][1], z1], [L[3][0], L[3][1], z1], [L[3][0], L[3][1], z0]);             // low-x end
        S.v.quad(OW, [L[1][0], L[1][1], z1], [L[1][0], L[1][1], z0], [L[2][0], L[2][1], z0], [L[2][0], L[2][1], z1]);             // high-x end
        slope(S.c, base, 'generic', xa, ya + 1.75, xb, yb + 1.75, zo, zo + tw, 2.3); home(S.c);
      }
      const tb = S.low ? S.v : S.d;
      for (let i = 0; i < steps; i++) {
        const xs = up > 0 ? xa + i * go : xa - (i + 1) * go, yt = ya + (i + 1) * rise;
        F(tb, TR, xs, yt - rise, za, go, rise, zb - za, up > 0 ? 'UW' : 'UE');
        if (!S.low) F(S.d, NO, up > 0 ? xs : xs + go - 0.04, yt - 0.006, za, 0.04, 0.008, zb - za, 'U' + (up > 0 ? 'W' : 'E'));     // nosing strip
        if (!S.low && !o.spine && i % 2 === 0) F(S.d, RL, xs + go / 2 - 0.01, yt, well - 0.01, 0.02, 0.9, 0.02, 'NSEW');          // balusters
      }
      const zr = well + (o.spine ? sgn * 0.07 : 0);
      rail(S.d, [xa, ya + 0.95 + rise, zr], [xb, yb + 0.95 + rise, zr]);
      const wallZ = well === zA0 ? zA1 - 0.07 : zB0 + 0.07;                                                                       // a second rail on the wall side
      if (o.wallRail !== false) rail(S.d, [xa, ya + 0.95 + rise, wallZ], [xb, yb + 0.95 + rise, wallZ], 0.04);
    }
    if (!o.spine) {                                          // the rail turns round the well at the half landing
      rail(S.d, [run, ym + 0.95 + rise, zA0], [run + 0.12, ym + 0.95 + rise, zA0]); rail(S.d, [run + 0.12, ym + 0.95 + rise, zA0], [run + 0.12, ym + 0.95 + rise, zB1]); rail(S.d, [run + 0.12, ym + 0.95 + rise, zB1], [run, ym + 0.95 + rise, zB1]);
      F(S.d, RL, run + 0.11, ym, -0.01, 0.02, 0.95, 0.02, 'NSEW');
    }
  }
  if (o.spine) { F(S.v, o.spineMat || OW, 0, yLo, zB1, run, yHi + 1.05 - yLo, gap, 'NSEW'); F(S.v, CP, -0.02, yHi + 1.05, zB1 - 0.02, run + 0.04, 0.05, gap + 0.04, 'NSEWUD'); }
  if (gap >= 0.08) F(S.c, 'generic', 0.02, yLo, zB1 + 0.01, run - 0.04, yHi + 1.75 - yLo, gap - 0.02);
  [S.v, S.d, S.i, S.c].forEach(b => b.frame());
  return { run, base, P, zA0, zA1, zB0, zB1, tw };
}
/** Card with a storey number (or any short text) drawn once; returns a material for a quad of w by h metres. */
const cards = new Map();
export function textCard(text, w, h, { bg = '#1f5fa8', fg = '#ffffff', font = 'bold', size = 0.62, border = null } = {}) {
  const key = [text, w, h, bg, fg, size, border].join('|'); if (cards.has(key)) return cards.get(key);
  const m = new THREE.MeshStandardMaterial({ roughness: 0.5 }); m.name = 'ends-card';
  if (typeof document !== 'undefined') {
    const W = 256, H = Math.max(32, Math.round(W * h / w)), c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
    g.fillStyle = bg; g.fillRect(0, 0, W, H); if (border) { g.strokeStyle = border; g.lineWidth = 8; g.strokeRect(4, 4, W - 8, H - 8); }
    g.fillStyle = fg; g.textAlign = 'center'; g.textBaseline = 'middle';
    let px = Math.round(H * size); g.font = `${font} ${px}px "PingFang SC","Microsoft YaHei","Noto Sans CJK SC","Source Han Sans SC","WenQuanYi Zen Hei",sans-serif`;
    const tw = g.measureText(text).width; if (tw > W * 0.9) { px = Math.floor(px * W * 0.9 / tw); g.font = g.font.replace(/\d+px/, px + 'px'); }
    g.fillText(text, W / 2, H * 0.53);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(1 / w, 1 / h); m.map = t;
  }
  cards.set(key, m); return m;
}
/** Upright card on a facade: its texture shows exactly once between u0..u1 and y0..y1. */
export const card = (b, put, m, u0, u1, y0, y1, d = 0.02) => b.quad(m, ...quadOn(put, u0, u1, y0, y1, d));

/**
 * The teaching slabs' pattern on one facade: white piers and floor bands standing proud of a recessed infill
 * (spandrel, then a window strip with a transom and mullions) in every bay and storey.
 */
export function grid(S, put, u0, u1, floors, FH, { y0 = 0, bay = 3.8, spandrel = lm('maroon'), head = 3.2, sillH = 0.95, proud = 0.14, transomAt = 2.55, glass0 = null } = {}) {
  const W = lm('white'), nb = Math.max(1, Math.round((u1 - u0) / bay)), bw = (u1 - u0) / nb, FR = lm('frame');
  for (let i = 0; i <= nb; i++) { const u = u0 + i * bw, hw = i === 0 || i === nb ? 0.3 : 0.22; put(S.v, W, Math.max(u0, u - hw), Math.min(u1, u + hw), y0, y0 + floors * FH, 0, proud, 'FLR'); }
  for (let k = 0; k < floors; k++) {
    const y = y0 + k * FH, hd = Math.min(head, FH - 0.4);
    put(S.v, W, u0, u1, y + hd, y + FH, 0, proud - 0.03, 'FUD');                                     // floor band
    put(S.v, k === 0 ? lm('base') : spandrel, u0, u1, y, y + sillH, 0, 0.05, 'FU');                  // spandrel (dark at ground level)
    put(S.v, lm('cope'), u0, u1, y + sillH, y + sillH + 0.04, 0, 0.08, 'FUD');                       // sill
    const G = k === 0 && glass0 ? glass0 : lm('glassWin');
    put(S.v, G, u0, u1, y + sillH + 0.04, y + hd, 0, 0.02, k === 0 && glass0 ? 'FB' : 'F');
    for (let i = 0; i < nb; i++) {
      const a = u0 + i * bw + 0.22, b = a + bw - 0.44, n = Math.max(1, Math.round((b - a) / 0.75) - 1);
      put(S.v, FR, a, b, y + transomAt - 0.03, y + transomAt + 0.03, 0.02, 0.07, 'FUD');
      for (let j = 1; j <= n; j++) { const u = a + (b - a) * j / (n + 1); put(S.v, FR, u - 0.025, u + 0.025, y + sillH, y + hd, 0.02, 0.07, 'FLR'); }
    }
    if (k > 0) stain(S, put, u0, u1, y + 0.0, 0.4, proud - 0.02);
  }
}

/**
 * Roof, parapet with coping and colliders of one rectangular part, and those of its outer walls that are listed in
 * `faces` as plain boxes (walls with openings are drawn by facade() instead). r = { w, e, n, s }; H = top of the parapet.
 * hollow: { x0, x1, z0, z1, h }: a room on the ground floor that the solid collider leaves out (its walls are the caller's).
 */
export function body(S, r, H, { wall = lm('white'), roof = lm('roof'), par = 0.9, parMat = wall, y0 = 0, faces = 'NSEW', cope = true, collide = true, hollow = null } = {}) {
  const sx = r.e - r.w, sz = r.s - r.n, yr = H - par, t = 0.2, tf = cope ? '' : 'U';
  if (faces) F(S.v, wall, r.w, y0, r.n, sx, H - y0, sz, faces);
  F(S.v, roof, r.w + t, yr - 0.1, r.n + t, sx - 2 * t, 0.1, sz - 2 * t, 'U');
  F(S.v, parMat, r.w, yr, r.n, sx, par, t, 'S' + tf); F(S.v, parMat, r.w, yr, r.s - t, sx, par, t, 'N' + tf);
  F(S.v, parMat, r.w, yr, r.n + t, t, par, sz - 2 * t, 'E' + tf); F(S.v, parMat, r.e - t, yr, r.n + t, t, par, sz - 2 * t, 'W' + tf);
  if (cope) {
    const C = lm('cope'), o = 0.05, h = 0.07;
    F(S.v, C, r.w - o, H, r.n - o, sx + 2 * o, h, t + 2 * o, 'NSEWUD'); F(S.v, C, r.w - o, H, r.s - t - o, sx + 2 * o, h, t + 2 * o, 'NSEWUD');
    F(S.v, C, r.w - o, H, r.n + t + o, t + 2 * o, h, sz - 2 * t - 2 * o, 'EWUD'); F(S.v, C, r.e - t - o, H, r.n + t + o, t + 2 * o, h, sz - 2 * t - 2 * o, 'EWUD');
  }
  if (collide) {
    if (!hollow) hit(S, r.w, y0, r.n, sx, yr - y0, sz);
    else {                                                   // solid above the room, and round it on the ground floor
      const q = hollow; hit(S, r.w, q.h, r.n, sx, yr - q.h, sz);
      if (q.z0 > r.n + 0.02) hit(S, r.w, y0, r.n, sx, q.h - 0.001, q.z0 - r.n); if (q.z1 < r.s - 0.02) hit(S, r.w, y0, q.z1, sx, q.h - 0.001, r.s - q.z1);
      if (q.x0 > r.w + 0.02) hit(S, r.w, y0, q.z0 + 0.001, q.x0 - r.w, q.h - 0.001, q.z1 - q.z0 - 0.002); if (q.x1 < r.e - 0.02) hit(S, q.x1, y0, q.z0 + 0.001, r.e - q.x1, q.h - 0.001, q.z1 - q.z0 - 0.002);
    }
    hit(S, r.w, yr, r.n, sx, par, t); hit(S, r.w, yr, r.s - t, sx, par, t); hit(S, r.w, yr, r.n + t, t, par, sz - 2 * t); hit(S, r.e - t, yr, r.n + t, t, par, sz - 2 * t);
  }
  return yr;
}

// ---- small fittings (near-view detail) ----
export const ac = (S, put, u, y) => {                                               // outdoor unit on two brackets, its drain staining the wall
  put(S.d, lm('frame'), u - 0.4, u + 0.4, y, y + 0.55, 0.06, 0.38, 'FLRUD'); put(S.d, lm('dark'), u - 0.3, u + 0.12, y + 0.07, y + 0.48, 0.38, 0.386, 'F');
  for (const s of [-0.3, 0.27]) put(S.d, lm('alu'), u + s, u + s + 0.03, y - 0.04, y, 0, 0.4, 'FLRD');
  stain(S, put, u - 0.3, u + 0.3, y - 0.04, 0.8);
};
/** Inclined slab whose top runs from a to c ([x, y, z] on its centre line), w wide, th thick. Leaves the batch in the world frame. */
export function ramp(b, m, a, c, w, th = 0.16, faces = ALL) {
  const A = new THREE.Vector3(...a), C = new THREE.Vector3(...c), d = new THREE.Vector3().subVectors(C, A), len = d.length();
  const X = d.clone().normalize(), Z = new THREE.Vector3(-d.z, 0, d.x).normalize(), Y = new THREE.Vector3().crossVectors(Z, X);
  b.setMatrix(new THREE.Matrix4().makeBasis(X, Y, Z).setPosition(A.add(C).multiplyScalar(0.5).addScaledVector(Y, -th / 2)));
  b.box(m, 0, 0, 0, len, th, w, skipOf(faces)); b.frame();
}
/** `cols` equal windows per storey in a facade made with facade(), spread over u0..u1. */
export function punch(A, u0, u1, floors, FH, { cols = 2, w = 1.2, h = 1.4, sill = 1.0, n = 1, from = 0, y0 = 0, glass, transom, skip } = {}) {
  for (let k = from; k < floors; k++) for (let i = 0; i < cols; i++) {
    if (skip && skip(k, i)) continue;
    const u = u0 + (u1 - u0) * (i + 0.5) / cols;
    A.win(u - w / 2, u + w / 2, y0 + k * FH + sill, y0 + k * FH + sill + h, { n, glass, transom });
  }
}
/** A door set on a solid wall (no opening behind it): frame, leaves and canopy stand just proud of the wall. Returns its extent along the wall. */
export function doorOn(S, side, plane, uc, o = {}) {
  const out = side === 'N' || side === 'W' ? -1 : 1, put = face(side, plane + out * 0.14), w = o.w ?? 1.4;
  const h = doorSet(S, put, uc, { rev: 0.05, canopy: 1.0, ...o, w });
  put(S.v, o.wall || lm('white'), h[0] - 0.02, h[1] + 0.02, h[2], h[3], -0.12, -0.1, 'F');
  return h;
}
/** Dark base course along a facade, left out where the doors are. */
export const plinth = (S, put, u0, u1, holes = [], h = 0.45) => pierce(S.v, lm('base'), put, u0, u1, 0, h, holes.filter(q => q[2] < 0.3), 0, 0.03, 'FU');

// ================= the individual blocks =================
const rectOf = b => ({ w: b.w, e: b.e, n: b.n, s: b.s });
const planes = r => ({ N: face('N', r.n), S: face('S', r.s), E: face('E', r.e), W: face('W', r.w) });
const span = (r, side) => (side === 'N' || side === 'S' ? [r.w, r.e] : [r.n, r.s]);
const planeOf = (r, side) => (side === 'N' ? r.n : side === 'S' ? r.s : side === 'E' ? r.e : r.w);
export const other = (ctx, id) => { const it = ctx.campus && ctx.campus.items.find(i => i.id === id); return it ? bbox(itemPolygon(it)) : null; };
const occupy = (ctx, x0, z0, x1, z1) => { if (ctx.occupy) ctx.occupy([[x0, z0], [x1, z0], [x1, z1], [x0, z1]]); };
/** The ground before a door: kept free of the grounds' trees and lamps. */
export function apron(ctx, side, plane, uc, w = 2.6, d = 2.2) {
  const out = side === 'N' || side === 'W' ? -1 : 1, a = Math.min(plane, plane + out * d), b = Math.max(plane, plane + out * d);
  if (side === 'N' || side === 'S') occupy(ctx, uc - w / 2, a, uc + w / 2, b); else occupy(ctx, a, uc - w / 2, b, uc + w / 2);
}

// ---- ground-floor rooms behind the doors and the glass of the smaller blocks (IMAGINED, all of them) ----------------------
/** The inside of a room q = { x0, x1, z0, z1, h }: floor, ceiling with lamp panels, plastered walls with a skirting, the openings
 *  of each wall (holes: { N, S, E, W } lists as pierce() takes them) left out. Interior detail. */
function roomShell(S, q, holes = {}, { floor = lm('graniteLight'), dado = null } = {}) {
  const B = S.i, PL = lm('plaster');
  F(B, floor, q.x0, 0.0, q.z0, q.x1 - q.x0, 0.03, q.z1 - q.z0, 'U'); F(S.i, lm('ceil'), q.x0, q.h, q.z0, q.x1 - q.x0, 0.02, q.z1 - q.z0, 'D');
  for (const [k, put, a, c] of [['N', face('S', q.z0), q.x0, q.x1], ['S', face('N', q.z1), q.x0, q.x1], ['W', face('E', q.x0), q.z0, q.z1], ['E', face('W', q.x1), q.z0, q.z1]]) {
    const hs = holes[k] || [];
    pierce(B, PL, put, a, c, 0.03, q.h, hs, -0.01, 0, 'F'); pierce(B, lm('shade'), put, a, c, 0.03, 0.13, hs, -0.012, 0.004, 'FU');
    if (dado) { pierce(B, dado, put, a, c, 0.13, 1.2, hs, -0.012, 0.002, 'FU'); }
  }
  const nx = Math.max(1, Math.round((q.x1 - q.x0) / 2.6)), nz = Math.max(1, Math.round((q.z1 - q.z0) / 2.6));
  for (let i = 0; i < nx; i++) for (let j = 0; j < nz; j++) { const x = q.x0 + (q.x1 - q.x0) * (i + 0.5) / nx, z = q.z0 + (q.z1 - q.z0) * (j + 0.5) / nz; F(B, lm('frame'), x - 0.6, q.h - 0.04, z - 0.15, 1.2, 0.04, 0.3, 'NSEWD'); F(B, lm('lamp'), x - 0.56, q.h - 0.045, z - 0.11, 1.12, 0.006, 0.22, 'D'); LIT.push([x, z, 2.0, q.h - 0.05]); }
}
/** Shelving along a wall: uprights, boards and things on them in a few colours (boxes, files, folded paper). */
function shelves(S, x0, z0, x1, z1, h, levels, seed, cols = ['sheet', 'blue', 'yellow', 'woodDark', 'red', 'frame']) {
  const B = S.i, ST = lm('alu'), alongX = x1 - x0 > z1 - z0, L = alongX ? x1 - x0 : z1 - z0, D = alongX ? z1 - z0 : x1 - x0; let sd = seed;
  const r = () => ((sd = (sd * 1664525 + 1013904223) >>> 0) / 4294967296);
  for (let i = 0; i <= Math.round(L / 0.9); i++) { const u = Math.min(L - 0.03, i * L / Math.round(L / 0.9)); F(B, ST, alongX ? x0 + u : x0, 0.03, alongX ? z0 : z0 + u, alongX ? 0.03 : D, h, alongX ? D : 0.03, 'NSEW'); }
  for (let k = 0; k < levels; k++) {
    const y = 0.12 + k * (h - 0.2) / (levels - 1);
    F(B, ST, x0, y, z0, alongX ? L : D, 0.025, alongX ? D : L, 'NSEWUD');
    if (k === levels - 1) continue;
    for (let u = 0.05; u < L - 0.2;) { const w = 0.12 + r() * 0.35, hh = Math.min(0.32, 0.08 + r() * 0.3), m = lm(cols[Math.floor(r() * cols.length)]), dd = D * (0.6 + 0.3 * r()); if (r() < 0.85) F(B, m, alongX ? x0 + u : x0 + (D - dd) / 2, y + 0.025, alongX ? z0 + (D - dd) / 2 : z0 + u, alongX ? Math.min(w, L - u - 0.05) : dd, hh, alongX ? dd : Math.min(w, L - u - 0.05), 'NSEWU'); u += w + 0.03; }
  }
  hit(S, x0, 0.03, z0, alongX ? L : D, h, alongX ? D : L);
}
/** A plain desk (top, two side panels) with a chair; alongX: its long side runs east-west; front: +1/-1 the side the chair is on. */
function desk(S, x, z, alongX, front, { w = 1.4, d = 0.7, top = lm('wood'), monitor = true } = {}) {
  const B = S.i, sx = alongX ? w : d, sz = alongX ? d : w, x0 = x - sx / 2, z0 = z - sz / 2, DK = lm('dark');
  F(B, top, x0, 0.72, z0, sx, 0.035, sz, 'NSEWUD');
  for (const s of [0, 1]) F(B, lm('frame'), alongX ? x0 + s * (sx - 0.03) : x0, 0.03, alongX ? z0 : z0 + s * (sz - 0.03), alongX ? 0.03 : sx, 0.69, alongX ? sz : 0.03, 'NSEW');
  if (monitor) { const mx = alongX ? x : x - front * 0.18, mz = alongX ? z - front * 0.18 : z; F(B, DK, mx - (alongX ? 0.25 : 0.02), 0.755, mz - (alongX ? 0.02 : 0.25), alongX ? 0.5 : 0.04, 0.32, alongX ? 0.04 : 0.5, 'NSEWU'); F(B, DK, mx - 0.06, 0.755, mz - 0.06, 0.12, 0.08, 0.12, 'NSEWU'); }
  const cx = alongX ? x : x + front * (d / 2 + 0.25), cz = alongX ? z + front * (d / 2 + 0.25) : z;
  F(B, DK, cx - 0.23, 0.44, cz - 0.23, 0.46, 0.06, 0.46, 'NSEWUD'); F(B, DK, alongX ? cx - 0.23 : cx + front * 0.2, 0.5, alongX ? cz + front * 0.2 : cz - 0.23, alongX ? 0.46 : 0.05, 0.45, alongX ? 0.05 : 0.46, 'NSEWU'); B.cyl(lm('alu'), cx, 0.06, cz, 0.025, 0.38, 6, false);
  hit(S, x0, 0.03, z0, sx, 0.76, sz);
}
/** Lettered plate beside a door, outside (near view). */
const doorPlate = (S, put, u, y, text) => { put(S.d, lm('steel'), u, u + 0.5, y, y + 0.18, 0, 0.012, 'FLRUD'); card(S.d, put, textCard(text, 0.46, 0.15, { bg: '#1f5fa8' }), u + 0.02, u + 0.48, y + 0.015, y + 0.165, 0.016); };

/** Mail room (收发室) behind the east door of the north block: a counter with a hatch, pigeonholes, parcels, a desk. */
function mailRoom(S, q) {
  const B = S.i, WD = lm('wood');
  // pigeonholes along the north wall: a grid of small compartments with letters in some of them
  const x0 = q.x0 + 0.2, x1 = q.x1 - 0.3, y0 = 0.9, y1 = 2.3, nx = Math.max(4, Math.round((x1 - x0) / 0.3)), ny = 5, d = 0.32; let sd = 51; const r = () => ((sd = (sd * 1664525 + 1013904223) >>> 0) / 4294967296);
  F(B, WD, x0, 0.03, q.z0, x1 - x0, y0 - 0.03, d, 'SU'); F(B, WD, x0, y0, q.z0, x1 - x0, y1 - y0, 0.02, 'S');
  for (let i = 0; i <= nx; i++) F(B, WD, x0 + i * (x1 - x0) / nx - 0.01, y0, q.z0, 0.02, y1 - y0, d, 'SEW');
  for (let j = 0; j <= ny; j++) F(B, WD, x0, y0 + j * (y1 - y0) / ny - 0.01, q.z0, x1 - x0, 0.02, d, 'SUD');
  for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) if (r() < 0.55) F(B, lm(r() < 0.7 ? 'sheet' : 'yellow'), x0 + i * (x1 - x0) / nx + 0.04, y0 + j * (y1 - y0) / ny + 0.01, q.z0 + 0.05, (x1 - x0) / nx - 0.08, 0.04 + 0.05 * r(), d - 0.1, 'NSEWU');
  hit(S, x0, 0.03, q.z0 + 0.01, x1 - x0, y1, d);
  // the counter across the room, its hatch toward the door; parcels on the floor and a desk behind
  const zc = q.z1 - 1.6;
  F(B, WD, q.x0 + 0.4, 0.03, zc, q.x1 - q.x0 - 1.6, 1.0, 0.5, 'NSEWU'); F(B, lm('graniteLight'), q.x0 + 0.38, 1.03, zc - 0.04, q.x1 - q.x0 - 1.56, 0.04, 0.58, 'NSEWUD');
  hit(S, q.x0 + 0.4, 0.03, zc, q.x1 - q.x0 - 1.6, 1.06, 0.5);
  desk(S, q.x0 + 1.2, q.z0 + 1.4, true, 1, { w: 1.2 });
  for (let i = 0; i < 6; i++) F(B, lm(i % 3 ? 'woodDark' : 'sheet'), q.x0 + 0.3 + (i % 3) * 0.45, 0.03 + Math.floor(i / 3) * 0.3, zc - 0.8 + (i % 2) * 0.05, 0.4, 0.28, 0.35, 'NSEWU');
  hit(S, q.x0 + 0.3, 0.03, zc - 0.8, 1.3, 0.6, 0.42);
}
/** School clinic (医务室) behind the north door of the south block: couch with a curtain, desk, medicine cabinet, scale, sink, eye chart. */
function clinic(S, q) {
  const B = S.i, WH = lm('frame'), ST = lm('steel');
  // examination couch along the west wall, a white sheet and a pillow, a curtain on a ceiling rail
  F(B, lm('blue'), q.x0 + 0.1, 0.6, q.z0 + 0.6, 0.75, 0.12, 1.9, 'NSEWU'); F(B, lm('sheet'), q.x0 + 0.12, 0.72, q.z0 + 0.62, 0.71, 0.02, 1.86, 'NSEWU'); F(B, lm('sheet'), q.x0 + 0.2, 0.74, q.z0 + 0.7, 0.55, 0.1, 0.35, 'NSEWU');
  for (const [dx, dz] of [[0.12, 0.62], [0.8, 0.62], [0.12, 2.45], [0.8, 2.45]]) F(B, ST, q.x0 + dx, 0.03, q.z0 + dz, 0.04, 0.57, 0.04, 'NSEW');
  hit(S, q.x0 + 0.1, 0.03, q.z0 + 0.6, 0.75, 0.82, 1.9);
  F(B, ST, q.x0 + 1.15, q.h - 0.3, q.z0 + 0.3, 0.03, 0.03, 2.5, 'NSEWD'); F(B, ST, q.x0 + 0.05, q.h - 0.3, q.z0 + 2.8, 1.13, 0.03, 0.03, 'NSEWD');
  for (let i = 0; i < 9; i++) F(B, lm('dadoLine'), q.x0 + 1.14, 0.35, q.z0 + 1.3 + i * 0.17, 0.02, q.h - 0.68, 0.14, 'EW');            // the curtain, half drawn
  // the doctor's desk under the north windows, a cabinet of medicines with glass doors, a scale, a basin, an eye chart
  desk(S, (q.x0 + q.x1) / 2 + 2.0, q.z0 + 0.6, true, 1, { w: 1.4 });
  F(B, WH, q.x1 - 0.45, 0.03, q.z0 + 0.6, 0.42, 1.9, 1.2, 'NSWU'); F(B, lm('glassLobby'), q.x1 - 0.46, 0.95, q.z0 + 0.63, 0.01, 0.9, 1.14, 'W');
  for (let k = 0; k < 3; k++) for (let i = 0; i < 6; i++) F(B, lm(['red', 'sheet', 'blue', 'yellow', 'sheet', 'dadoLine'][(i + k) % 6]), q.x1 - 0.4, 1.0 + k * 0.3, q.z0 + 0.68 + i * 0.18, 0.28, 0.12 + 0.05 * ((i * 7 + k) % 3), 0.13, 'NSEWU');
  hit(S, q.x1 - 0.45, 0.03, q.z0 + 0.6, 0.44, 1.9, 1.2);
  F(B, lm('graniteDark'), q.x1 - 1.6, 0.03, q.z1 - 0.6, 0.35, 0.06, 0.35, 'NSEWU'); F(B, WH, q.x1 - 1.47, 0.09, q.z1 - 0.32, 0.08, 1.1, 0.05, 'NSEWU'); F(B, lm('dark'), q.x1 - 1.52, 1.15, q.z1 - 0.34, 0.18, 0.1, 0.05, 'NSEWU');
  F(B, WH, q.x1 - 1.1, 0.03, q.z1 - 0.5, 0.6, 0.8, 0.45, 'NSWU'); F(B, lm('frame'), q.x1 - 1.05, 0.83, q.z1 - 0.48, 0.5, 0.04, 0.42, 'NSEWU'); F(B, lm('alu'), q.x1 - 1.05, 1.1, q.z1 - 0.02, 0.5, 0.6, 0.01, 'N');
  hit(S, q.x1 - 1.1, 0.03, q.z1 - 0.5, 0.6, 0.85, 0.45);
  card(B, face('E', q.x0), textCard('E  Ш  E', 0.4, 0.6, { bg: '#ffffff', fg: '#111111', size: 0.3 }), q.z1 - 1.4, q.z1 - 1.0, 1.2, 1.8, 0.01);
}
/** Print room (文印室) on the ground floor of the north-east wing: copiers, a long counter with stacks of papers in bundles, shelves of paper, a cutter. */
function printRoom(S, q) {
  const B = S.i;
  for (const x of [q.x0 + 0.5, q.x0 + 1.6]) { F(B, lm('frame'), x, 0.03, q.z0 + 0.15, 0.9, 1.0, 0.7, 'SEWU'); F(B, lm('alu'), x - 0.02, 1.03, q.z0 + 0.13, 0.94, 0.12, 0.74, 'NSEWU'); F(B, lm('dark'), x + 0.55, 1.15, q.z0 + 0.25, 0.3, 0.03, 0.2, 'NSEWU'); F(B, lm('dark'), x + 0.05, 0.4, q.z0 + 0.85, 0.8, 0.02, 0.01, 'S'); hit(S, x, 0.03, q.z0 + 0.15, 0.9, 1.15, 0.7); }
  const zc = (q.z0 + q.z1) / 2 + 0.3, cx0 = q.x0 + 1.0, cx1 = q.x1 - 1.6;
  F(B, lm('wood'), cx0, 0.85, zc - 0.45, cx1 - cx0, 0.04, 0.9, 'NSEWUD'); F(B, lm('frame'), cx0, 0.03, zc - 0.43, cx1 - cx0, 0.82, 0.86, 'NSEW'); hit(S, cx0, 0.03, zc - 0.45, cx1 - cx0, 0.9, 0.9);
  for (let i = 0; i < Math.floor((cx1 - cx0 - 0.4) / 0.5); i++) { const h = 0.12 + 0.1 * ((i * 5) % 3); F(B, lm(i % 4 === 1 ? 'yellow' : 'sheet'), cx0 + 0.2 + i * 0.5, 0.89, zc - 0.3 + (i % 2) * 0.25, 0.3, h, 0.21, 'NSEWU'); F(B, lm('woodDark'), cx0 + 0.32 + i * 0.5, 0.89, zc - 0.31 + (i % 2) * 0.25, 0.06, h + 0.005, 0.23, 'NSEWU'); }
  shelves(S, q.x0 + 2.9, q.z0 + 0.03, q.x1 - 0.3, q.z0 + 0.45, 2.0, 5, 77, ['sheet', 'sheet', 'blue', 'yellow', 'sheet']);
  F(B, lm('dark'), q.x0 + 0.2, 0.03, q.z1 - 0.9, 0.7, 0.75, 0.6, 'NSEWU'); F(B, lm('alu'), q.x0 + 0.22, 0.78, q.z1 - 0.88, 0.66, 0.04, 0.56, 'NSEWU'); hit(S, q.x0 + 0.2, 0.03, q.z1 - 0.9, 0.7, 0.8, 0.6);
  desk(S, q.x0 + 2.4, q.z1 - 0.45, true, -1, { w: 1.3 });
}
/** Laundry (洗衣房) in the ground floor of a dormitory link: washing machines along one wall, a wash trough, a folding table, a clothes rack. */
function laundry(S, q) {
  const B = S.i, WH = lm('frame'), DK = lm('dark'), n = Math.floor((q.z1 - q.z0 - 0.6) / 0.68);
  for (let i = 0; i < n; i++) {
    const z = q.z0 + 0.35 + i * 0.68, x = q.x1 - 0.66;
    F(B, WH, x, 0.03, z, 0.62, 0.85, 0.62, 'NSWU'); F(B, lm('alu'), x - 0.005, 0.7, z + 0.05, 0.01, 0.12, 0.52, 'W');
    B.frame(x - 0.006, z + 0.31); for (let k = 0; k < 12; k++) { const a0 = k / 12 * 6.2832, a1 = (k + 1) / 12 * 6.2832; B.quad(i % 2 ? lm('glassLobby') : DK, [0, 0.4 + Math.sin(a1) * 0.2, Math.cos(a1) * 0.2], [0, 0.4 + Math.sin(a0) * 0.2, Math.cos(a0) * 0.2], [0, 0.4, 0], [0, 0.4, 0]); } B.frame();
  }
  hit(S, q.x1 - 0.66, 0.03, q.z0 + 0.35, 0.65, 0.88, n * 0.68);
  const tx0 = q.x0 + 0.4, tx1 = q.x1 - 1.0;                                                   // tiled wash trough along the north wall with four taps
  F(B, lm('tileGreen'), tx0, 0.03, q.z0 + 0.02, tx1 - tx0, 0.8, 0.55, 'SEWU'); F(B, lm('tileGrey'), tx0 + 0.05, 0.6, q.z0 + 0.07, tx1 - tx0 - 0.1, 0.005, 0.45, 'U');
  for (let i = 0; i < 4; i++) { const x = tx0 + (tx1 - tx0) * (i + 0.5) / 4; F(B, lm('steel'), x - 0.015, 0.83, q.z0 + 0.03, 0.03, 0.25, 0.03, 'SEWU'); F(B, lm('steel'), x - 0.015, 1.05, q.z0 + 0.03, 0.03, 0.03, 0.18, 'SEWUD'); B.cyl(lm(['blue', 'red', 'yellow', 'green'][i]), x, 0.03, q.z0 + 0.95, 0.2, 0.18, 12); }
  hit(S, tx0, 0.03, q.z0 + 0.02, tx1 - tx0, 0.85, 0.55);
  const fx = (q.x0 + q.x1) / 2 - 0.6, fz = (q.z0 + q.z1) / 2 + 0.6;                       // folding table with folded clothes
  F(B, lm('wood'), fx - 0.9, 0.76, fz - 0.4, 1.8, 0.04, 0.8, 'NSEWUD'); for (const [dx, dz] of [[-0.85, -0.35], [0.8, -0.35], [-0.85, 0.3], [0.8, 0.3]]) F(B, lm('alu'), fx + dx, 0.03, fz + dz, 0.05, 0.73, 0.05, 'NSEW');
  for (let i = 0; i < 5; i++) F(B, lm(['blue', 'sheet', 'red', 'yellow', 'tileGreen'][i]), fx - 0.75 + i * 0.32, 0.8, fz - 0.2, 0.28, 0.05 + 0.03 * (i % 3), 0.32, 'NSEWU');
  hit(S, fx - 0.9, 0.03, fz - 0.4, 1.8, 0.8, 0.8);
  const rz = q.z1 - 0.5;                                                                        // a rack of clothes drying along the south wall
  F(B, lm('steel'), q.x0 + 0.5, 1.7, rz, 2.4, 0.03, 0.03, 'NSUD'); for (const x of [q.x0 + 0.5, q.x0 + 2.87]) F(B, lm('steel'), x, 0.03, rz, 0.03, 1.7, 0.03, 'NSEW');
  for (let i = 0; i < 7; i++) F(B, lm(['blue', 'sheet', 'red', 'frame', 'yellow', 'dadoLine', 'sheet'][i]), q.x0 + 0.6 + i * 0.32, 1.05 + 0.1 * (i % 2), rz - 0.02, 0.26, 0.62 - 0.1 * (i % 2), 0.02, 'NSEW');
  hit(S, q.x0 + 0.5, 0.03, rz - 0.05, 2.4, 1.75, 0.13);
}
/** Hot-water room (开水房) in the ground floor of a dormitory link: a steel boiler with taps over a tiled trough, a shelf of flasks. */
function boilerRoom(S, q) {
  const B = S.i, ST = lm('steel'), bx = q.x1 - 1.0, bz0 = q.z0 + 0.4, bz1 = q.z1 - 0.4;
  F(B, ST, bx, 0.03, bz0, 0.95, 2.0, bz1 - bz0, 'NSWU'); F(B, lm('dark'), bx - 0.01, 1.5, bz0 + 0.3, 0.01, 0.25, 0.4, 'W'); B.cyl(lm('frame'), bx - 0.02, 1.62, bz0 + 1.0, 0.1, 0.02, 12);
  for (const z of [bz0 + 0.2, bz1 - 0.2]) F(B, ST, bx + 0.3, 2.03, z - 0.05, 0.1, q.h - 2.03, 0.1, 'NSEW');
  hit(S, bx, 0.03, bz0, 0.95, 2.0, bz1 - bz0);
  const tz0 = bz0 + 0.3, tz1 = bz1 - 0.3, n = Math.max(3, Math.floor((tz1 - tz0) / 0.45));                       // taps out of the boiler's front over a tiled trough
  F(B, lm('tileGrey'), bx - 0.55, 0.03, tz0, 0.55, 0.6, tz1 - tz0, 'NSWU'); F(B, lm('dark'), bx - 0.5, 0.6, tz0 + 0.05, 0.45, 0.005, tz1 - tz0 - 0.1, 'U');
  for (let i = 0; i < n; i++) { const z = tz0 + (tz1 - tz0) * (i + 0.5) / n; F(B, ST, bx - 0.3, 1.0, z - 0.02, 0.3, 0.04, 0.04, 'NSWUD'); F(B, ST, bx - 0.32, 0.88, z - 0.02, 0.04, 0.14, 0.04, 'NSEW'); F(B, lm('red'), bx - 0.2, 1.04, z - 0.03, 0.06, 0.04, 0.06, 'NSEWU'); }
  hit(S, bx - 0.55, 0.03, tz0, 0.55, 0.65, tz1 - tz0);
  const sx0 = q.x0 + 0.3, sx1 = q.x1 - 1.8;                                                     // a shelf of thermos flasks along the north wall
  for (const y of [0.45, 1.05]) { F(B, lm('wood'), sx0, y, q.z0 + 0.05, sx1 - sx0, 0.04, 0.4, 'NSEWUD'); for (let x = sx0 + 0.15, i = 0; x < sx1 - 0.1; x += 0.22, i++) if ((i * 7 + (y > 1 ? 3 : 0)) % 5) { B.cyl(lm(['red', 'blue', 'yellow', 'dadoLine', 'frame'][(i + (y > 1 ? 2 : 0)) % 5]), x, y + 0.04, q.z0 + 0.25, 0.075, 0.36, 10); B.cyl(lm('dark'), x, y + 0.4, q.z0 + 0.25, 0.045, 0.06, 8); } }
  for (const x of [sx0, sx1 - 0.04]) F(B, lm('wood'), x, 0.03, q.z0 + 0.05, 0.04, 1.06, 0.4, 'NSEW');
  hit(S, sx0, 0.03, q.z0 + 0.05, sx1 - sx0, 1.5, 0.4);
  F(B, lm('frame'), q.x0 + 0.4, 0.03, q.z1 - 0.5, 1.6, 0.42, 0.4, 'NSEWU'); hit(S, q.x0 + 0.4, 0.03, q.z1 - 0.5, 1.6, 0.45, 0.4);              // a bench to wait on
}

// Three-storey blocks beside the east ends of the slabs: the slabs' own pattern, all ASSUMED.
/** The ground storey of a gridded face, glazed with clear glass between the piers, with doorways (holes): for faces with a room behind. */
export function glazedGround(S, put, u0, u1, FH, bay, holes = [], glass = lm('glassLobby')) {
  const nb = Math.max(1, Math.round((u1 - u0) / bay)), bw = (u1 - u0) / nb, head = Math.min(3.0, FH - 0.4);
  // piers in the rhythm of the floors above, but none in a doorway: the bays on either side of a dropped pier become one
  const piers = []; for (let i = 0; i <= nb; i++) { const u = u0 + i * bw, hw = i === 0 || i === nb ? 0.3 : 0.22; if (i === 0 || i === nb || !holes.some(h => h[1] > u - hw - 0.05 && h[0] < u + hw + 0.05)) piers.push([u, hw]); }
  for (const [u, hw] of piers) put(S.v, lm('white'), Math.max(u0, u - hw), Math.min(u1, u + hw), 0, FH, 0, 0.14, 'FLR');
  put(S.v, lm('white'), u0, u1, head, FH, 0, 0.11, 'FUD');
  for (let i = 0; i + 1 < piers.length; i++) {
    const ua = piers[i][0] + piers[i][1], ub = piers[i + 1][0] - piers[i + 1][1], hs = holes.filter(h => h[1] > ua && h[0] < ub);
    curtain(S, put, ua, ub, 0.45, head, [0, head + 0.4], hs, { t: 0.12, glass, pitch: 1.1 });
    pierce(S.v, lm('base'), put, ua, ub, 0, 0.45, hs, -0.12, 0.02, 'FBU');
  }
}

// Three-storey blocks beside the east ends of the slabs: the slabs' own pattern, all ASSUMED. Behind the door of each a room on
// the ground floor that can be entered (IMAGINED): the mail room (收发室) of the north one, the school clinic (医务室) of the
// south one; their door faces are glazed on the ground floor.
function seBlock(S, item, b, H, ctx) {
  const r = rectOf(b), FH = (H - 0.9) / 3, P = planes(r), north = item.id === 'slab-north-se-block';
  const wing = north ? other(ctx, 'sign-wing-between-slabs') : null;       // the north one stands partly inside the taller sign wing
  const wx = wing && wing.e > r.w + 1 && wing.e < r.e - 2.5 ? wing.e : r.w;
  const dSide = north ? 'E' : 'N', [a, c] = span(r, dSide), uc = (a + c) / 2, plane = planeOf(r, dSide);
  const q = { x0: wx + 0.25, x1: r.e - 0.25, z0: r.n + 0.25, z1: r.s - 0.25, h: FH - 0.2 };
  const hollow = { ...q, ...(dSide === 'E' ? { x1: r.e } : { z0: r.n }) };
  const yr = body(S, r, H, { roof: lm('roofBeige'), faces: '', hollow });
  F(S.v, lm('white'), r.w, FH, r.n, r.e - r.w, H - FH, r.s - r.n, north ? 'NES' : 'NESW'); if (north) F(S.v, lm('white'), r.w, 0, r.n, r.e - r.w, FH, r.s - r.n, 'NS');
  for (const side of north ? 'NES' : 'NESW') {
    let [u0, u1] = span(r, side);
    if (wing && side === 'S' && wing.e > u0 && wing.e < u1) u0 = wing.e;
    if (side === dSide) grid(S, P[side], u0, u1, 2, FH, { y0: FH, bay: 3.4, head: 3.0 });
    else grid(S, P[side], u0, u1, 3, FH, { bay: 3.4, head: 3.0 });
  }
  const dh = doorSet(S, P[dSide], uc, { w: 1.4, h: 2.2, t: 0.25, rev: 0.12, canopy: 1.1, swing: 'in', leaf: lm('door'), plate: false });
  glazedGround(S, P[dSide], a, c, FH, 3.4, [dh], north ? lm('glassLobby') : lm('glassPale')); apron(ctx, dSide, plane, uc);   // the clinic's front is tinted
  wallHit(S, P[dSide], a, c, 0, FH - 0.22, [dh], 0.2);
  doorPlate(S, P[dSide], dh[1] + 0.2, 1.4, north ? '收发室' : '医务室'); LIT.push(dSide === 'E' ? [r.e + 1.0, uc, 3.0, 2.7] : [uc, r.n - 1.0, 3.0, 2.7]);   // the lamp over the door
  // the room: the glazed front seen from inside as one band; on the clinic's other faces a window in each bay of the grid
  const band = (u0, u1) => [[u0 + 0.3, u1 - 0.3, 0.45, 3.0]];
  const holes = { [dSide]: [dh, ...band(a, c)] };
  if (!north) for (const side of 'ESW') { const [u0, u1] = span(r, side), nb = Math.max(1, Math.round((u1 - u0) / 3.4)); holes[side] = Array.from({ length: nb }, (_, i) => { const u = u0 + (u1 - u0) * (i + 0.5) / nb; return [u - 0.7, u + 0.7, 1.0, 2.55]; }); }
  roomShell(S, q, holes, { floor: lm('graniteLight'), dado: north ? null : lm('dado') });
  if (north) mailRoom(S, q); else clinic(S, q);
  rwp(S, P.E, r.n + 0.16, yr); rwp(S, P.E, r.s - 0.16, yr); if (!north) rwp(S, P.W, r.n + 0.16, yr);
  for (const side of north ? 'NE' : 'NW') { const [u0, u1] = span(r, side); stain(S, P[side], u0, u1, H, 0.6, 0.15); }
  lightning(S, r, H + 0.07);
  F(S.d, lm('frame'), r.w + 1.2, yr, r.n + 1.0, 1.1, 0.7, 0.8, 'NSEWU'); F(S.d, lm('dark'), r.w + 1.25, yr + 0.15, r.n + 1.8, 1.0, 0.4, 0.01, 'S');   // a condenser on the roof
}

// Low L-shaped building north of the north slab's east end, after frames 3 and 4.
function neWing(S, item, b, H, ctx) {
  const p = item.points;
  if (!p || p.length !== 8) return generic(S, item, b, H, ctx);
  const xw = b.w, xe = b.e, xm = p[1][0], xc = p[5][0], zn = (p[0][1] + p[1][1]) / 2, zm = p[2][1], zs = b.s, zc = p[6][1];
  const FH = (H - 0.9) / 3, HA = H - 0.6, CR = lm('cream'), MR = lm('maroon'), GG = lm('glassGreen'), W = lm('white');
  const A = { w: xw, e: xm, n: zn, s: zm }, B = { w: xc, e: xe, n: zm, s: zs }, C = { w: xw, e: xc, n: zm, s: zc };
  const qB = { x0: xc + 0.25, x1: xe - 0.25, z0: zm + 0.25, z1: zs - 0.25, h: FH - 0.2 };                     // the print room on B's ground floor (IMAGINED)
  const yB = body(S, B, H, { parMat: CR, faces: '', hollow: { ...qB, x0: xc, x1: xe } }), yA = body(S, A, HA, { parMat: CR, faces: '' }); body(S, C, HA, { parMat: CR, faces: '' });
  hit(S, xc - 0.01, 0, zm + 0.26, 0.26, FH - 0.21, zc - zm - 0.26);                                                 // the party wall with C
  const fa = (side, plane, u0, u1, top, mat = W) => facade(S, side, plane, u0, u1, 0, top, { mat });
  // -- south part, east face: ribbon windows (top one seen, the others continue it) and a door
  const BE = fa('E', xe, zm, zs, H);
  for (let k = 0; k < 3; k++) BE.win(zm + 1.0, k ? zs - 1.4 : zs - 3.4, k * FH + 1.0, k * FH + 2.6, k ? { n: 5, transom: 1.15 } : { n: 3, transom: 1.15, glass: lm('glassLobby'), t: 0.25 });
  const hd = BE.door(zs - 1.9, { w: 1.3, canopy: 1.0, leaf: lm('door'), swing: 'in', t: 0.25, rev: 0.12 }).holes.slice(-1); BE.done(); plinth(S, BE.put, zm, zs, hd); apron(ctx, 'E', xe, zs - 1.9);
  wallHit(S, BE.put, zm, zs, 0, FH - 0.22, hd, 0.25); doorPlate(S, BE.put, hd[0][1] + 0.15, 1.4, '文印室'); LIT.push([xe + 1.0, zs - 1.9, 3.0, 2.7]);
  rwp(S, BE.put, zs - 0.4, yB);
  // -- its north return: one small window per upper storey, an outdoor unit
  const BN = fa('N', zm, xm, xe, H); for (let k = 1; k < 3; k++) BN.win(xm + 1.1, xm + 2.1, k * FH + 1.1, k * FH + 2.4, { n: 0 }); BN.done(); ac(S, BN.put, xm + 3.0, FH + 0.9);
  // -- north part, east face: dark ribbon glazing over a dark-red balcony front (SEEN)
  const AE = fa('E', xm, zn, zm, HA), ua = zn + 2.6, ub = zm - 0.5;
  AE.win(ua + 0.4, ub, 2 * FH + 0.9, 2 * FH + 2.9, { n: 4, transom: 1.5, sill: false }); AE.win(ua + 0.4, ub, FH + 0.15, FH + 2.7, { n: 3, sill: false });
  AE.win(ua + 0.4, ub - 1.8, 0.9, 2.7, { n: 2, sill: false }); const hd2 = AE.door(ub - 0.85, { w: 1.0, leaf: lm('door'), plate: false }).holes.slice(-1); AE.done(); plinth(S, AE.put, zn + 2.6, zm, hd2);
  AE.put(S.v, lm('concrete'), ua + 0.2, ub + 0.2, FH - 0.15, FH, 0, 0.75, 'FLRUD'); AE.put(S.v, MR, ua + 0.2, ub + 0.2, FH, FH + 1.0, 0.65, 0.75, 'FBLRU');   // balcony slab and front
  hit(S, xm, FH - 0.15, ua + 0.2, 0.75, 1.15, ub - ua); ac(S, AE.put, ub - 0.85, 2.75); stain(S, face('E', xm + 0.75), ua + 0.2, ub + 0.2, FH + 1.0, 0.6);
  // -- dark-red stair element at the north-east corner, a little taller, one small window near the top (SEEN)
  const T = { w: xm - 1.9, e: xm + 0.5, n: zn - 0.3, s: zn + 2.6 }, HT = HA + 0.9;
  const TE = fa('E', T.e, T.n, T.s, HT, MR), TN = fa('N', T.n, T.w, T.e, HT, MR);
  TE.win(T.n + 0.9, T.n + 2.0, 2 * FH + 1.2, 2 * FH + 2.6, { n: 0, glass: GG }); TE.done(); TN.win(T.w + 0.7, T.w + 1.3, FH + 1.9, FH + 3.3, { n: 0, glass: GG, sill: false }); TN.done();
  F(S.v, MR, T.w, 0, T.n, T.e - T.w, HT, T.s - T.n, 'SW'); F(S.v, lm('roof'), T.w - 0.1, HT, T.n - 0.1, T.e - T.w + 0.2, 0.12, T.s - T.n + 0.2, 'NSEWUD');
  hit(S, T.w, 0, T.n, T.e - T.w, HT + 0.12, T.s - T.n);
  // -- north face: cream, two small green windows; the parapet rises as a wedge beside the red element (SEEN)
  const AN = fa('N', A.n, xw, T.w, HA, CR), uE = T.w;
  AN.win(uE - 2.6, uE - 1.3, 2 * FH + 1.2, 2 * FH + 2.5, { n: 1, glass: GG }); AN.win(uE - 6.1, uE - 4.6, 2 * FH + 1.2, 2 * FH + 2.5, { n: 1, glass: GG }); AN.done(); plinth(S, AN.put, xw, T.w);
  const wx0 = uE - 3.4, y0 = HA, yl = HA + 0.25, yh = HA + 1.1, z0 = A.n, z1 = A.n + 0.2;
  S.v.quad(CR, [uE, y0, z0], [wx0, y0, z0], [wx0, yh, z0], [uE, yl, z0]); S.v.quad(CR, [wx0, y0, z1], [uE, y0, z1], [uE, yl, z1], [wx0, yh, z1]);
  S.v.quad(lm('cope'), [uE, yl, z0], [wx0, yh, z0], [wx0, yh, z1], [uE, yl, z1]); S.v.quad(CR, [wx0, y0, z0], [wx0, y0, z1], [wx0, yh, z1], [wx0, yh, z0]);
  rwp(S, AN.put, xw + 0.4, yA); stain(S, AN.put, xw, wx0, HA, 0.8);
  // -- faces not seen: a few plain windows and a back door
  const WW = fa('W', xw, zn, zc, HA); punch(WW, zn + 0.8, zc - 0.6, 3, FH, { cols: 3, w: 1.3 }); WW.done(); plinth(S, WW.put, zn, zc);
  const CS = fa('S', zc, xw, xc, HA); punch(CS, xw + 0.5, xc - 0.3, 3, FH, { cols: 1, w: 1.4 }); CS.done(); plinth(S, CS.put, xw, xc);
  const BW = fa('W', xc, zc, zs, H); punch(BW, zc + 0.6, zs - 0.4, 3, FH, { cols: 1, w: 1.4, from: 1 }); const hd3 = BW.door((zc + zs) / 2 + 0.3, { w: 1.2, leaf: lm('door'), swing: 'in', t: 0.25, rev: 0.12 }).holes.slice(-1); BW.done(); plinth(S, BW.put, zc, zs, hd3);
  wallHit(S, BW.put, zc, zs, 0, FH - 0.22, hd3, 0.25); LIT.push([xc - 1.0, (zc + zs) / 2 + 0.3, 2.6, 2.7]);
  const BS = fa('S', zs, xc, xe, H); punch(BS, xc + 0.8, xe - 0.8, 3, FH, { cols: 2, w: 1.0, h: 1.0, sill: 1.4, from: 1 });
  const sw = [0, 1].map(i => xc + 0.8 + (xe - xc - 1.6) * (i + 0.5) / 2); for (const u of sw) BS.win(u - 0.5, u + 0.5, 1.4, 2.4, { n: 1, glass: lm('glassLobby'), t: 0.25 }); BS.done(); plinth(S, BS.put, xc, xe);
  roomShell(S, qB, { E: [...hd, [zm + 1.0, zs - 3.4, 1.0, 2.6]], W: hd3, S: sw.map(u => [u - 0.5, u + 0.5, 1.4, 2.4]) });
  printRoom(S, qB);
  F(S.v, W, xc, HA - 0.6, zm, 0.02, H - HA + 0.6, zc - zm, 'W'); F(S.v, W, xc, HA - 0.6, zm, xm - xc, H - HA + 0.6, 0.02, 'N');   // the taller part's walls above the lower roofs
  lightning(S, B, H + 0.07); lightning(S, { w: xw, e: xm, n: zn, s: zm }, HA + 0.07);
}

// ---- the exhibition on the ground floor of the block north of the canopy: all of it invented --------------------------
let boards = null;
/** Six picture boards: tinted photographs that show nothing in particular, captions as grey lines, no words. */
function boardMaterials() {
  if (boards) return boards;
  boards = [];
  for (let k = 0; k < 6; k++) {
    const m = new THREE.MeshStandardMaterial({ roughness: 0.55 }); m.name = 'ends-board';
    if (typeof document !== 'undefined') {
      const W = 256, Hh = 192, c = document.createElement('canvas'); c.width = W; c.height = Hh; const g = c.getContext('2d'); let sd = 300 + k * 71;
      const r = () => ((sd = (sd * 1664525 + 1013904223) >>> 0) / 4294967296);
      g.fillStyle = '#f5f1e6'; g.fillRect(0, 0, W, Hh); g.fillStyle = ['#8a2f2b', '#1f5f8a', '#2f6b4f', '#8a6a2b', '#5a3f7a', '#8a2f2b'][k]; g.fillRect(0, 0, W, 20);
      const sepia = k < 2;
      for (let i = 0, x = 10; i < 3; i++) {                  // three photographs: sky, a band of buildings or trees, ground
        const w = 68 + r() * 10, h = 60 + r() * 30, y = 30 + r() * 12, hue = sepia ? 35 : 190 + r() * 40;
        const gr = g.createLinearGradient(0, y, 0, y + h); gr.addColorStop(0, `hsl(${hue},${sepia ? 25 : 45}%,${sepia ? 78 : 76}%)`); gr.addColorStop(0.55, `hsl(${hue},${sepia ? 20 : 30}%,${sepia ? 62 : 70}%)`); gr.addColorStop(0.56, `hsl(${sepia ? 32 : 110},${sepia ? 22 : 30}%,${sepia ? 40 : 38}%)`); gr.addColorStop(1, `hsl(${sepia ? 30 : 40},${sepia ? 20 : 18}%,${sepia ? 52 : 60}%)`);
        g.fillStyle = gr; g.fillRect(x, y, w, h);
        g.fillStyle = sepia ? 'rgba(240,230,205,0.8)' : 'rgba(245,245,240,0.85)'; for (let q = 0; q < 3; q++) g.fillRect(x + 6 + q * (w - 12) / 3, y + h * (0.3 + 0.15 * r()), (w - 20) / 3, h * 0.28);
        g.strokeStyle = 'rgba(0,0,0,0.3)'; g.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1); x += w + 9;
      }
      for (let y = 136; y < Hh - 10; y += 9) { g.fillStyle = '#8f8b82'; g.fillRect(12, y, (W - 24) * (y > Hh - 24 ? 0.45 + 0.3 * r() : 1), 3); }
      const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(1 / 1.6, 1 / 1.2); m.map = t;
    }
    boards.push(m);
  }
  return boards;
}
function exhibition(S, ctx, q, PS) {
  const B = S.i, PL = lm('plaster'), ST = lm('steel'), GD = lm('graniteDark'), WD = lm('wood'), xm = (q.x0 + q.x1) / 2, back = face('S', q.z0), bm = boardMaterials();
  // picture boards along the back wall above a dark-red rail, a title plate over the middle
  back(B, lm('maroon'), q.x0 + 0.3, q.x1 - 0.3, 0.95, 1.05, 0, 0.03, 'FUD');
  const n = 6, pitch = (q.x1 - q.x0 - 1.2) / n;
  for (let k = 0; k < n; k++) { const u = q.x0 + 0.6 + (k + 0.5) * pitch; back(B, lm('frameDark'), u - 0.84, u + 0.84, 1.26, 2.54, 0, 0.03, 'FLRUD'); card(B, back, bm[k], u - 0.8, u + 0.8, 1.3, 2.5, 0.034); }
  card(B, back, textCard('校史陈列', 1.6, 0.34, { bg: '#7a2622', fg: '#f3e6c4', size: 0.66 }), xm - 0.8, xm + 0.8, 2.72, 3.06, 0.02);
  // two glass cases with cups and medals on dark plinths
  for (const x of [q.x0 + 2.2, q.x1 - 2.2]) {
    const z = (q.z0 + q.z1) / 2 + 0.4;
    F(B, GD, x - 0.7, 0.02, z - 0.35, 1.4, 0.8, 0.7, 'NSEWU'); F(B, lm('glassLobby'), x - 0.66, 0.82, z - 0.31, 1.32, 0.6, 0.62, 'NSEWU'); F(B, ST, x - 0.7, 1.42, z - 0.35, 1.4, 0.03, 0.7, 'NSEWUD');
    B.frame(x, z); for (const [dx, h] of [[-0.42, 0.34], [-0.12, 0.26], [0.2, 0.38], [0.46, 0.22]]) B.cyl(lm('brass'), dx, 0.82, 0, 0.07, 0.04, 10).cyl(lm('brass'), dx, 0.86, 0, 0.02, h * 0.4, 6, false).cyl(lm('brass'), dx, 0.86 + h * 0.4, 0, 0.065, h * 0.6, 10); B.frame();
    hit(S, x - 0.7, 0.03, z - 0.35, 1.4, 1.4, 0.7);
  }
  // a model of the campus on a table: the outlines of campus-data.js at 1 : 250
  const tz = (q.z0 + q.z1) / 2 + 0.5, k = 1 / 250, ox = 120, oz = -70;
  F(B, WD, xm - 1.5, 0.02, tz - 1.0, 3.0, 0.72, 2.0, 'NSEW'); F(B, lm('green'), xm - 1.5, 0.74, tz - 1.0, 3.0, 0.02, 2.0, 'NSEWU'); hit(S, xm - 1.5, 0.03, tz - 1.0, 3.0, 0.8, 2.0);
  for (const it of ctx.campus ? ctx.campus.items : []) if (it.solid && it.points && it.height > 2) {
    const bb = bbox(it.points), x = xm + (bb.cx - ox) * k, z = tz + (bb.cz - oz) * k; if (Math.abs(x - xm) > 1.4 || Math.abs(z - tz) > 0.95) continue;
    F(B, it.style === 'clock-tower' ? lm('maroon') : lm('frame'), x - bb.sx * k / 2, 0.76, z - bb.sz * k / 2, bb.sx * k, it.height * k, bb.sz * k, 'NSEWU');
  }
  F(B, ST, xm - 1.52, 0.76, tz - 1.02, 3.04, 0.02, 0.03, 'NSEWU'); F(B, ST, xm - 1.52, 0.76, tz + 0.99, 3.04, 0.02, 0.03, 'NSEWU');
  // benches under the windows of the front, a visitors' book on a stand
  for (const x of [q.x0 + 1.4, q.x1 - 1.4]) { for (const s of [-0.6, 0.6]) F(B, ST, x + s - 0.02, 0.02, q.z1 - 0.75, 0.04, 0.4, 0.4, 'NSEW'); for (let i = 0; i < 4; i++) F(B, WD, x - 0.75, 0.42, q.z1 - 0.75 + i * 0.105, 1.5, 0.035, 0.085, 'NSEWUD'); hit(S, x - 0.75, 0.03, q.z1 - 0.75, 1.5, 0.43, 0.4); }
  F(B, WD, xm + 2.6, 0.02, q.z1 - 1.5, 0.5, 0.95, 0.4, 'NSEW'); F(B, WD, xm + 2.56, 0.97, q.z1 - 1.54, 0.58, 0.04, 0.48, 'NSEWUD'); F(B, lm('sheet'), xm + 2.64, 1.01, q.z1 - 1.46, 0.42, 0.02, 0.3, 'NSEWU');
}
/**
 * A room on the ground floor behind a glazed front on face `side` of the block r: curtain wall with an open glazed door,
 * plastered walls, granite floor, ceiling with lamps. q: { x0, x1, z0, z1, h }. Returns the door's hole.
 */
function lobby(S, ctx, r, side, q, uc, o = {}) {
  const plane = planeOf(r, side), put = face(side, plane), alongX = side === 'N' || side === 'S', [u0, u1] = alongX ? [q.x0, q.x1] : [q.z0, q.z1], t = 0.14, PL = lm('plaster');
  const hole = doorSet(S, put, uc, { w: o.w ?? 1.7, h: 2.3, glazed: true, t, rev: t / 2, fan: 0.45, swing: 'in', canopy: o.canopy ?? 1.4, step: false, plate: false, bars: lm('frameDark') });
  curtain(S, put, u0, u1, 0.3, q.h, [0, q.h + 0.4], [hole], { t, glass: lm('glassLobby'), pitch: 1.5 }); put(S.v, lm('base'), u0, hole[0], 0, 0.3, -t, 0.02, 'FBU'); put(S.v, lm('base'), hole[1], u1, 0, 0.3, -t, 0.02, 'FBU');
  wallHit(S, put, u0, u1, 0, q.h, [hole], t); put(S.v, lm('concrete'), uc - 1.4, uc + 1.4, 0, 0.03, 0, 1.5, 'FLRU'); apron(ctx, side, plane, uc, 3.2, 2.6);
  // inside: floor, ceiling, the three walls (the fourth is the glass)
  F(S.v, lm('tread'), q.x0, 0, q.z0, q.x1 - q.x0, 0.02, q.z1 - q.z0, 'U'); F(S.d, lm('graniteLight'), q.x0, 0.02, q.z0, q.x1 - q.x0, 0.004, q.z1 - q.z0, 'U'); F(S.v, lm('ceil'), q.x0, q.h, q.z0, q.x1 - q.x0, 0.02, q.z1 - q.z0, 'D');
  const walls = { N: [q.x0, q.h, q.z0 - 0.01, q.x1 - q.x0, 0.01, 'S'], S: [q.x0, q.h, q.z1, q.x1 - q.x0, 0.01, 'N'], W: [q.x0 - 0.01, q.h, q.z0, 0.01, q.z1 - q.z0, 'E'], E: [q.x1, q.h, q.z0, 0.01, q.z1 - q.z0, 'W'] };
  for (const s of 'NSEW') if (s !== side) { const [x, h, z, sx, sz, fc] = walls[s]; F(S.v, PL, x, 0, z, sx, h, sz, fc); }
  const nx = Math.max(1, Math.round((q.x1 - q.x0) / 3.2)), nz = Math.max(1, Math.round((q.z1 - q.z0) / 3.2));
  for (let i = 0; i < nx; i++) for (let j = 0; j < nz; j++) { const x = q.x0 + (q.x1 - q.x0) * (i + 0.5) / nx, z = q.z0 + (q.z1 - q.z0) * (j + 0.5) / nz; F(S.v, lm('frame'), x - 0.3, q.h - 0.035, z - 0.3, 0.6, 0.035, 0.6, 'NSEWD'); F(S.d, lm('lamp'), x - 0.27, q.h - 0.045, z - 0.27, 0.54, 0.012, 0.54, 'D'); LIT.push([x, z, 2.2, q.h - 0.05]); }
  return hole;
}

// Tall white box west of the north slab, after frames 6 and 7. Its ground floor toward the plaza is the exhibition (invented).
function canopyBlock(S, item, b, H, ctx) {
  const r = rectOf(b), FH = 3.9, par = Math.max(0.6, H - 5 * FH), P = planes(r), sz = r.s - r.n, W = lm('white');
  const q = { x0: r.w + 1.6, x1: r.e - 1.6, z0: r.s - 5.6, z1: r.s - 0.14, h: 3.6 }, uc = (q.x0 + q.x1) / 2;
  const yr = body(S, r, H, { par, faces: '', hollow: { ...q, z1: r.s } });
  const hole = lobby(S, ctx, r, 'S', q, uc); exhibition(S, ctx, q, P.S);
  const zc = r.s - 0.65 * sz;                                                    // the one window column of the east face (SEEN)
  const E = facade(S, 'E', r.e, r.n, r.s, 0, H, { mat: W }); for (let k = 0; k < 5; k++) E.win(zc - 0.55, zc + 0.55, k * FH + 2.05, k * FH + 3.15, { n: 1 }); E.done(); plinth(S, E.put, r.n, r.s);
  P.E(S.v, lm('red'), zc - 0.4, zc + 0.4, 0.5, 1.5, 0, 0.22, 'FLRU'); P.E(S.d, lm('glassWin'), zc - 0.33, zc + 0.33, 0.58, 1.42, 0.22, 0.225, 'F');   // red item at the foot (drawn as a hose cabinet)
  // south face: the glazed front below, small square windows above; the top storey is plain (SEEN)
  const So = facade(S, 'S', r.s, r.w, r.e, 0, H, { mat: W }); So.hole(q.x0, q.x1, 0, q.h + 0.02); punch(So, r.w + 1.5, r.e - 1.5, 4, FH, { cols: 3, w: 1.1, h: 1.1, sill: 2.05, from: 1 }); So.done();
  P.S(S.v, W, q.x0 - 0.02, q.x1 + 0.02, q.h + 0.02, q.h + 0.5, 0, 0.12, 'FLRUD'); plinth(S, P.S, r.w, q.x0); plinth(S, P.S, q.x1, r.e); stain(S, P.S, q.x0, q.x1, q.h + 0.02, 0.4, 0.13);
  const N = facade(S, 'N', r.n, r.w, r.e, 0, H, { mat: W }); punch(N, r.w + 1.5, r.e - 1.5, 5, FH, { cols: 3, w: 1.1, h: 1.1, sill: 2.05 }); const hn = N.door(r.w + (r.e - r.w) * 0.3, { w: 1.4, canopy: 1.1, leaf: lm('door') }).holes.slice(-1); N.done(); plinth(S, N.put, r.w, r.e, hn); apron(ctx, 'N', r.n, r.w + (r.e - r.w) * 0.3);
  const Wf = facade(S, 'W', r.w, r.n, r.s, 0, H, { mat: W }); punch(Wf, r.n + 2, r.s - 2, 5, FH, { cols: 2, w: 1.1, h: 1.1, sill: 2.05 }); Wf.done(); plinth(S, Wf.put, r.n, r.s);
  for (const side of 'NS') { rwp(S, P[side], r.w + 0.4, yr); rwp(S, P[side], r.e - 0.4, yr); }
  for (const side of 'NSEW') { const [a, c] = span(r, side); stain(S, P[side], a, c, H, 1.0); }
  ac(S, P.N, r.w + (r.e - r.w) * 0.62, FH + 0.6); ac(S, P.N, r.w + (r.e - r.w) * 0.62, 3 * FH + 0.6);
  // roof: three small white boxes where the satellite image shows them, on dark pads, with a duct between two of them
  const WH = lm('frame'), cl = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  for (const [x, z] of [[192.2, -120.5], [197.7, -120.5], [198.5, -112.2]]) {
    const cx = cl(x, r.w + 1.4, r.e - 1.4), cz = cl(z, r.n + 1.4, r.s - 1.4);
    F(S.v, WH, cx - 0.8, yr + 0.1, cz - 0.8, 1.6, 1.0, 1.6, 'NSEWU'); F(S.v, lm('dark'), cx - 0.9, yr, cz - 0.9, 1.8, 0.1, 1.8, 'NSEW'); hit(S, cx - 0.8, yr + 0.01, cz - 0.8, 1.6, 1.1, 1.6);
  }
  F(S.d, lm('roofPale'), r.w + 3.2, yr + 0.05, r.n + 2.3, 4.6, 0.3, 0.4, 'NSEWU'); F(S.d, lm('dark'), r.w + 1, yr, r.n + sz * 0.6, r.e - r.w - 2, 0.06, 0.07, 'NSU');
  lightning(S, r, H + 0.07);
}

// Narrow block at the east end of the west slab: all ASSUMED beyond its outline; its ground floor is a glazed lobby toward the plaza.
function westLink(S, item, b, H, ctx) {
  const r = rectOf(b), FH = 3.6, floors = 5, P = planes(r), nb = Math.max(2, Math.round((r.s - r.n) / 4)), W = lm('white');
  const q = { x0: r.w + 0.22, x1: r.e - 0.14, z0: r.n + 0.9, z1: r.s - 0.9, h: 3.2 }, uc = (q.z0 + q.z1) / 2;
  const yr = body(S, r, H, { par: 0.9, roof: lm('roofPale'), faces: 'W', hollow: { ...q, x1: r.e } });
  lobby(S, ctx, r, 'E', q, uc, { w: 1.6, canopy: 1.2 });
  const E = facade(S, 'E', r.e, r.n, r.s, 0, H, { mat: W }); E.hole(q.z0, q.z1, 0, q.h + 0.02);
  const uOf = i => r.n + 0.3 + (r.s - r.n - 0.6) * (i + 0.5) / nb;
  for (let k = 1; k < floors; k++) for (let i = 0; i < nb; i++) E.win(uOf(i) - 1.1, uOf(i) + 1.1, k * FH + 1.0, k * FH + 2.5, { n: 2, transom: 1.05 });
  E.done(); P.E(S.v, W, q.z0 - 0.02, q.z1 + 0.02, q.h + 0.02, q.h + 0.45, 0, 0.12, 'FLRUD'); plinth(S, P.E, r.n, q.z0); plinth(S, P.E, q.z1, r.s);
  for (let k = 2; k <= floors; k++) P.E(S.v, lm('cope'), r.n, r.s, k * FH - 0.1, k * FH + 0.1, 0, 0.04, 'FUD');             // thin floor lines
  for (const side of 'NS') { const A = facade(S, side, planeOf(r, side), r.w, r.e, 0, H, { mat: W }); punch(A, r.w, r.e, floors, FH, { cols: 1, w: 1.2 }); A.done(); plinth(S, A.put, r.w, r.e); }
  rwp(S, P.E, r.n + 0.2, yr); rwp(S, P.E, r.s - 0.2, yr); stain(S, P.E, r.n, r.s, H, 0.8); lightning(S, r, H + 0.07);
  // inside the lobby: two pin boards, benches, plants in tubs
  const back = face('E', q.x0);
  for (const z of [uc - 4.2, uc + 4.2]) if (z - 1.2 > q.z0 && z + 1.2 < q.z1) {
    back(S.i, lm('alu'), z - 1.05, z + 1.05, 1.0, 2.2, 0, 0.02, 'FLRUD'); back(S.i, lm('wood'), z - 1.0, z + 1.0, 1.05, 2.15, 0.02, 0.03, 'F');
    for (const [dz, dy, m] of [[-0.8, 0.55, 'sheet'], [-0.45, 0.2, 'yellow'], [0.0, 0.5, 'sheet'], [0.4, 0.15, 'sheet'], [0.62, 0.62, 'blue']]) back(S.i, lm(m), z + dz, z + dz + 0.21, 1.1 + dy, 1.4 + dy, 0.03, 0.034, 'F');
    for (const s of [-0.6, 0.6]) F(S.i, lm('steel'), q.x0 + 0.1, 0.02, z + s - 0.02, 0.4, 0.4, 0.04, 'NSEW'); for (let i = 0; i < 4; i++) F(S.i, lm('wood'), q.x0 + 0.1 + i * 0.105, 0.42, z - 0.75, 0.085, 0.035, 1.5, 'NSEWUD');
    hit(S, q.x0 + 0.1, 0.03, z - 0.75, 0.4, 0.43, 1.5);
  }
}

// Link block between the east ends of two long slabs: all ASSUMED beyond its outline. Its ground floor behind the door on the
// courtyard side is a room that can be entered (IMAGINED): a laundry in block A's link, a hot-water room in block B's. The
// links touch the north blocks' galleries (0.2 to 0.45 m off their balustrades) and, to the south, the round towers; the
// galleries end at closed balustrades in slab-block.js and the towers' parapets are closed on that side (round-tower.js),
// so no passage can be made through them from this file: the upper floors stay closed.
function dormLink(S, item, b, H, ctx) {
  const r = rectOf(b), FH = 3.0, floors = 6, top = floors * FH, W = lm('white'), laundryRoom = item.id === 'dorm-a-east-link';
  const q = { x0: r.w + 0.25, x1: r.e - 0.25, z0: r.n + 0.25, z1: r.s - 0.25, h: FH - 0.15 };
  const yr = body(S, r, H, { par: 1.0, roof: lm('roofPale'), faces: 'NS', hollow: { ...q, x0: r.w } });
  const holes = { W: [], E: [] };
  for (const side of 'EW') {
    const [a, c] = span(r, side), A = facade(S, side, planeOf(r, side), a, c, 0, H, { mat: W });
    punch(A, a + 0.6, c - 0.6, floors, FH, { cols: 2, w: 1.5, h: 0.6, sill: 1.5, n: 1, from: 1 });
    const gw = side === 'W' ? 0.7 : 1.5;                                                       // the ground floor's windows: clear, seen from inside too
    for (let i = 0; i < 2; i++) { const u = a + 0.6 + (c - a - 1.2) * (i + 0.5) / 2; A.win(u - gw / 2, u + gw / 2, 1.5, 2.1, { n: side === 'W' ? 0 : 1, glass: lm('glassLobby'), t: 0.25 }); holes[side].push([u - gw / 2, u + gw / 2, 1.5, 2.1]); }
    let dh = [];
    if (side === 'W') {
      dh = A.door((a + c) / 2, { w: 1.4, canopy: 1.0, leaf: lm('door'), swing: 'in', t: 0.25, rev: 0.12 }).holes.slice(-1); apron(ctx, 'W', r.w, (a + c) / 2);
      holes.W.push(...dh); wallHit(S, A.put, a, c, 0, q.h - 0.01, dh, 0.25); doorPlate(S, A.put, dh[0][1] + 0.15, 1.45, laundryRoom ? '洗衣房' : '开水房'); LIT.push([r.w - 1.0, (a + c) / 2, 3.0, 2.7]);
    }
    A.done(); plinth(S, A.put, a, c, dh);
    A.put(S.v, W, a, c, top, H, 0, 0.1, 'FD');                                 // top band at the height of the slabs' fascia
    rwp(S, A.put, a + 0.3, yr); stain(S, A.put, a, c, top, 0.6, 0.012);
  }
  roomShell(S, q, holes, { floor: lm('tileGrey'), dado: lm('tileGreen') });
  if (laundryRoom) laundry(S, q); else boilerRoom(S, q);
  F(S.v, lm('frame'), r.w + 1.0, yr, r.n + 1.0, 2.0, 0.9, 1.8, 'NSEWU'); hit(S, r.w + 1.0, yr + 0.01, r.n + 1.0, 2.0, 0.9, 1.8);   // one roof unit
  lightning(S, r, H + 0.07);
}

// Any other item of this style: a white block with punched windows.
function generic(S, item, b, H, ctx) {
  const r = rectOf(b), floors = Math.max(1, Math.round((H - 0.9) / 3.6)), FH = (H - 0.9) / floors, yr = body(S, r, H, { faces: '' });
  for (const side of 'NSEW') {
    const [a, c] = span(r, side), A = facade(S, side, planeOf(r, side), a, c, 0, H, {}); punch(A, a + 0.5, c - 0.5, floors, FH, { cols: Math.max(1, Math.round((c - a) / 4)), skip: (k, i) => side === 'S' && k === 0 && i === 0 });
    let holes = []; if (side === 'S') holes = A.door(a + (c - a) * 0.5 / Math.max(1, Math.round((c - a) / 4)), {}).holes.slice(-1);
    A.done(); plinth(S, A.put, a, c, holes);
  }
  rwp(S, face('S', r.s), r.w + 0.3, yr);
}

const SPECIAL = {
  'slab-north-ne-wing': neWing, 'slab-north-se-block': seBlock, 'slab-south-se-block': seBlock, 'block-north-of-canopy-east-end': canopyBlock,
  'teaching-slab-west-link-e': westLink, 'dorm-a-east-link': dormLink, 'dorm-b-east-link': dormLink,
};

export function build(item, ctx) {
  const S = shell(ctx), b = bbox(itemPolygon(item));
  (SPECIAL[item.id] || generic)(S, item, b, item.height, ctx);
  finish(S, item, ctx, b.cx, b.cz, Math.max(b.sx, b.sz) / 2 + (S.low ? 50 : 75));
}
