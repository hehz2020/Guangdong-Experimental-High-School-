// New comprehensive teaching building (style "new-building", item new-teaching-building), with the library on its two
// lowest storeys. The only references are the 2022 video "一本书的梦" (1280x720 frames, numbers below) and the satellite image.
//
// FOOTPRINT (kept here as the constant FOOT below; item.points is not read. data/measurements.json now holds the same
// five corners and the same 23.4 m, so the two agree to 0.1 m; a change must be made in both places)
// - Re-read on the zoom-19 satellite mosaic. The roof is a five-sided wedge; roof corners in image pixels:
//   A west (1236,829), B north (1406,719), C east (1484,808), D south-east (1477,871), E south-west (1249,890).
//   The south edge bows about 1.5 m northward at mid-length (it follows the arc building); it is drawn straight.
//   The data file's first outline lay 4 to 8 m too far north-west: it had taken part of the shadowed north-west facade
//   for roof. It has since been replaced by these corners.
// - Height: in frame 55 the north-west face is about 2.45 times as long as it is high (camera pitch worked out from the
//   converging verticals and the horizon). That face is 55.6 m long on the satellite image, so the building is about
//   23 m high: 6 storeys (planning record) x 3.9 m = 23.4 m is used. The data file said 25.2 m at first and now says 23.4 m.
// - Ground position = roof pixels moved by -23.4 m x the image lean (-0.243, 2.0 px per metre; it was -0.28, 2.3 until an
//   independent second reading re-calibrated it, which moved this footprint 1.9 m south), then converted to metres.
// - The dark triangle in the roof on the satellite image is a light well: (1343,822) (1399,786) (1425,822).
//
// FROM THE REFERENCES
// - Which face is which: frames 22-24 and 55-57 show the NORTH-WEST face (lit by the evening sun, the garden in front,
//   the sports court to its left); frames 19-20 and 25-33 show the SOUTH face, seen from the roof of the arc building.
// - North-west face (frames 55-57): two storeys of pale grey stone with paired windows above and doors, small windows and
//   louvre strips below; four terracotta storeys with a projecting ledge at every floor; from left to right a plain wing
//   with thin slots, a stack of recessed balconies, two long ribbon windows per floor with a strip of small high windows
//   over each, a second stack of balconies, then a box of pale vertical fins over the two top storeys which bridges
//   a four-storey-high portal; a full-height terracotta end wall closes the west corner. A driveway with lane arrows
//   runs into the portal; a two-storey wall (red band, glass band) closes its back, with a railing above it (frame 21).
// - Roof (frames 20, 55-58): pale roof, railing all round, on the north-west side two terracotta pavilions joined by a
//   pergola (terracotta posts and slats); six red characters 广东实验中学 on square lattice frames stand on the pergola's
//   front edge, facing north-west; a walled triangular opening (the light well); air-conditioning units.
// - South face (frames 20, 25-27): four terracotta storeys, ribbon windows with pale curtains and a small high strip
//   above each, ledges; a recess two storeys high in the upper middle; a two-storey void at the east end of the third
//   and fourth storeys; a strip of grey vertical fins from terrace to roof at the east end.
// - Terrace (frames 20, 25-28): the roof of the two-storey podium, deep at the west and narrow at the east (about
//   7.5 m to 2.5 m, worked out from frame 20), dark railing, terracotta-tile edge band, three pale rectangles on its floor.
// - Podium front (frames 28-33): from the west a terracotta-tile wall (with a louvre and a window), a glass curtain wall
//   in two tiers with a tile band between them, then the glass folds back to form a porch under the terrace: white
//   soffit, white round columns, a second-floor walkway with a tile band and dark railing on columns with flared heads,
//   glass entrance doors, a tile wall with a door, and at the east end a dog-leg external stair with red-brown solid
//   balustrades and dark railings beside two tall white columns. The porch floor is grey tile, two steps above the plaza.
// - In front (frames 28-33): pale granite paving with brown bands; a red sculpture (curving blades rising from stacked
//   red slabs) on a black plinth. The gold characters on the plinth are not legible, so the plinth is left blank.
// - Garden on the north-west side (frames 21, 55): lawn, curved pale paths, a round bed with a grey stone disc ringed by
//   red planting, a crescent of red flowers, grey stone benches, young trees held by tripods of orange poles.
// - Library (frames 34-53): frameless glass doors with long steel pulls; a low grey ceiling with downlights inside the
//   doors, then a white curved edge with a light cove where the hall opens up; a wide straight stair on the right with
//   dark treads, seating tiers on part of its width, a glass balustrade on a white flank, a sloping light line on the
//   wall beside it; a gallery level with a white solid parapet; a rounded-triangular opening in the ceiling with white
//   beams forming triangles, a downlight at every node and bright glazing behind; white round columns flaring into the
//   ceiling with a ring of light round the head; a large pale counter with round cut-outs in which people sit, each
//   cut-out ringed by short brass posts carrying a rail; green, beige and dark upholstered chairs on wooden legs;
//   light-wood bookshelves, tall (five shelves) and low (three), a strip light under every shelf; a shelf wall with
//   black alcoves and white doors; grey floor tiles; floor-to-ceiling windows with dark frames; long wooden tables with
//   a bar lamp on two brass posts.
//
// ASSUMED (no reference supports these)
// - THE WHOLE PLAN OF THE LIBRARY. The frames show the elements but not how they are laid out. Chosen arrangement: the
//   hall fills the middle of the two podium storeys; doors in the porch glass; a low lobby 5 m deep; the opening in the
//   gallery floor beyond it, with the counter-and-pod island under the skylight; the stair along the east wall rising
//   north; shelf wall with alcoves along the north-west wall on both levels; rows of tall shelves on the west side;
//   long lamp tables at the south windows on both levels; reading tables and low shelves round the opening.
//   The skylight is placed under the light well seen on the satellite image, which is the one fixed point.
// - Everything outside the hall on the two lower storeys (rooms behind the grey north-west wall and behind the east
//   and north-east walls) is closed and empty. Storeys three to six are closed: no interior.
// - Storey heights: ground floor 0.3 m above the plaza, gallery floor at 4.2 m, terrace and third floor at 7.8 m.
// - North-east and east faces: never seen in the video. They are drawn with the same vertical fins as the strip at the
//   south-east corner (on the satellite image the north-east face is a uniform grey-blue band) over a plain stone base.
// - The portal: the footage suggests the driveway goes down to a basement. Nothing below ground is modelled; the
//   driveway is level and ends at a closed dark door. Depth of the portal (14 to 17 m) and the recess over its back wall.
// - The stack of terraces in the south face's upper recess, the depth of every recess and balcony, what is behind them.
// - Window, door and louvre positions on the grey base (their kind is seen in frames 55-56, their spacing is not kept).
// - The external stair's exact layout (four flights, landings at the east), that it reaches the terrace, the opening
//   in the terrace where it arrives, and the small landing beside the walkway.
// - Positions of the porch columns; width of the walkway (3 m); the level driveway and paved aprons round the building.
// - Garden: positions and sizes of the round bed, paths, crescent bed, benches and trees (seen, not measured).
//   The plaza is paved for 23 m south of the building, which is where the data puts the arc building's wall.
// - The sculpture's exact form (six curved blades) and size. Curtain patterns, book colours, chair colours per seat.
// - The lettering font: whatever brush or Kai typeface the device has (the real characters are in a brush hand).
// NOT MODELLED: the basement and its ramp; the stair, lifts and rooms of the upper storeys; the white notice stand at
// the doors; people, bicycles; the neighbouring buildings seen in the footage.
import { THREE } from '../../kit.js';
import { Batch } from '../../batch.js';
import { pbr, SURFACES } from '../../hifi.js';
import { broadleafTrees, shrubs, flowers } from '../../flora.js';
import { gardenLamp, bench, bins, bollard, noticeBoard, LIT } from '../../street.js';

// Ground footprint in metres (x east, z south, origin at the centre of the track). See FOOTPRINT above.
const FOOT = { A: [147.85, -205.69], B: [194.54, -235.91], C: [215.97, -211.46], D: [214.05, -194.15], E: [151.42, -188.93] };
const FH = 3.9, H = 6 * FH;                    // storey height and roof level (23.4 m)
const F0 = 0.3, F2 = 4.2, F3 = 2 * FH;         // library floor, gallery floor, terrace = third floor (7.8 m)
const CEIL1 = 3.55, CEIL2 = 7.0;               // ceilings of the two library levels
const CU = 3.45;                               // ceiling of the upper storeys above their floor
const SIGN = '广东实验中学';
const BRUSH = '"STXingkai","华文行楷","Xingkai SC","STKaiti","华文楷体","Kaiti SC","KaiTi","楷体","AR PL UKai CN","Songti SC","SimSun","Noto Serif CJK SC",serif';
const CJK = '"PingFang SC","Microsoft YaHei","Noto Sans CJK SC","Source Han Sans SC","WenQuanYi Zen Hei",sans-serif';
const KAI = '"STKaiti","华文楷体","Kaiti SC","KaiTi","楷体","AR PL UKai CN","Songti SC","SimSun","Noto Serif CJK SC","WenQuanYi Zen Hei",serif';
const TAU = Math.PI * 2;

// ---------------------------------------------------------------- textures and materials
const rng = seed => { let s = (seed >>> 0) || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); };
function canvasTexture(w, h, draw, tileX = 0, tileY = tileX) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  if (tileX) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(1 / tileX, 1 / tileY); }
  return t;
}
const shade = (rgb, k) => `rgb(${rgb.map(ch => Math.max(0, Math.min(255, Math.round(ch * k)))).join(',')})`;
// one 3.2 m length of ribbon window seen from outside: tinted glass with a painted reflection, aluminium sashes, pale curtains
// drawn to different widths, a guard rail of small arches (frame 25)
const ribbonTexture = low => canvasTexture(low ? 512 : 1024, low ? 256 : 512, (g, W, Hc) => {
  const r = rng(41), k = W / 512, sky = g.createLinearGradient(0, 0, 0, Hc); sky.addColorStop(0, '#6c8a98'); sky.addColorStop(0.4, '#3a4f58'); sky.addColorStop(1, '#1c272b');
  g.fillStyle = sky; g.fillRect(0, 0, W, Hc);
  for (let i = 0; i < 4; i++) {
    const x0 = i * W / 4, q = r(), a = q < 0.2 ? null : q < 0.55 ? [0, 128] : q < 0.8 ? [0, 70] : [58, 128];
    if (!a) { g.fillStyle = 'rgba(8,12,14,0.5)'; g.fillRect(x0, 0, W / 8, Hc); continue; }                 // a sash slid open: the dark room
    for (let x = a[0]; x < a[1]; x += 2) { const f = 0.5 + 0.5 * Math.sin(x * 0.9 + i * 2); g.fillStyle = shade([200, 208, 194], 0.74 + 0.22 * f + r() * 0.04); g.fillRect(x0 + x * k, 6 * k, 2 * k, Hc - 12 * k); }
    g.fillStyle = 'rgba(70,100,112,0.22)'; g.fillRect(x0 + a[0] * k, 0, (a[1] - a[0]) * k, Hc * 0.45);          // the sky in the glass, over the curtain
  }
  g.strokeStyle = '#e4e6e3'; g.lineWidth = 2.5 * k;
  for (let x = 0; x < 512; x += 26) { g.beginPath(); g.arc((x + 13) * k, 238 * k, 11 * k, Math.PI, 0); g.stroke(); }
  g.fillStyle = '#e4e6e3'; g.fillRect(0, 198 * k, W, 3 * k); g.fillRect(0, 238 * k, W, 3 * k);
  g.fillStyle = '#343a3e'; for (let i = 0; i <= 4; i++) g.fillRect(i * W / 4 - 4 * k, 0, 8 * k, Hc); g.fillRect(0, 0, W, 7 * k); g.fillRect(0, Hc - 9 * k, W, 9 * k);
  g.fillStyle = '#1e2225'; for (let i = 0; i <= 4; i++) g.fillRect(i * W / 4 - 1 * k, 0, 2 * k, Hc); for (let i = 0; i < 4; i++) g.fillRect((i + 0.5) * W / 4 - 1.5 * k, 7 * k, 3 * k, Hc - 16 * k);
}, 3.2, 1.5);
// book spines: four bands of spines, each 3.2 m of shelf; a run of books is a quad that shows a piece of one band
const BOOK_BANDS = 4, BOOK_U = 3.2;
const bookTexture = () => { const t = canvasTexture(1024, 512, (g, W, Hc) => {
  const r = rng(97), bh = Hc / BOOK_BANDS;
  const mixed = [[236, 230, 214], [222, 214, 196], [58, 96, 160], [44, 126, 84], [186, 48, 44], [226, 184, 70], [70, 150, 160], [52, 54, 70], [208, 120, 60], [150, 86, 150], [240, 240, 236], [96, 160, 90]];
  const sets = [mixed, [[34, 58, 110], [128, 30, 34], [32, 84, 62], [92, 60, 40], [200, 170, 96]], [[238, 234, 222], [226, 230, 236], [244, 226, 196], [214, 226, 214]], mixed];
  for (let b = 0; b < BOOK_BANDS; b++) {
    const y0 = b * bh, pal = sets[b]; g.fillStyle = '#2c241b'; g.fillRect(0, y0, W, bh);
    let x = 0;
    while (x < W) {
      const col = pal[Math.floor(r() * pal.length)], n = b === 1 ? 5 + Math.floor(r() * 8) : 1 + Math.floor(r() * 4), bw = b === 2 ? 5 + r() * 6 : 9 + r() * 13, drop = b === 1 ? 2 : r() * bh * 0.1;
      for (let i = 0; i < n && x < W; i++) {
        const top = y0 + drop + (b === 1 ? 0 : r() * 3), hh = y0 + bh - top;
        g.fillStyle = shade(col, 0.88 + r() * 0.22); g.fillRect(x, top, bw - 0.6, hh);
        g.fillStyle = b === 2 ? 'rgba(60,60,70,0.5)' : 'rgba(255,255,255,0.4)'; g.fillRect(x + 2, top + hh * 0.14, bw - 4.6, hh * (0.22 + 0.2 * r()));       // title
        if (b === 1) { g.fillStyle = 'rgba(232,196,96,0.9)'; g.fillRect(x, top + hh * 0.08, bw - 0.6, 3); g.fillRect(x, top + hh * 0.62, bw - 0.6, 3); }
        g.fillStyle = '#f6f3e6'; g.fillRect(x + 1, y0 + bh - 20, bw - 2.6, 11);                                                                            // shelf-mark label
        g.fillStyle = 'rgba(0,0,0,0.32)'; g.fillRect(x + bw - 1, top, 1, hh);
        x += bw;
      }
    }
  }
}); t.wrapS = THREE.RepeatWrapping; t.repeat.set(1 / BOOK_U, 1); return t; };
const barsTexture = () => canvasTexture(64, 8, (g, W, Hc) => { g.clearRect(0, 0, W, Hc); g.fillStyle = '#ffffff'; g.fillRect(26, 0, 11, Hc); }, 0.13, 1);
const slatsTexture = () => canvasTexture(64, 8, (g, W, Hc) => { g.clearRect(0, 0, W, Hc); g.fillStyle = '#ffffff'; g.fillRect(8, 0, 36, Hc); }, 0.3, 1);
const louvreTexture = () => canvasTexture(8, 64, (g, W, Hc) => { for (let y = 0; y < Hc; y++) { const f = (y % 16) / 16; g.fillStyle = shade([150, 156, 160], f < 0.25 ? 0.3 : 0.62 + 0.5 * f); g.fillRect(0, y, W, 1); } }, 1, 0.4);
const arrowTexture = () => canvasTexture(128, 512, (g, W, Hc) => {
  g.clearRect(0, 0, W, Hc); g.fillStyle = '#f2f2ee'; g.fillRect(52, 150, 24, 330);
  g.beginPath(); g.moveTo(64, 30); g.lineTo(112, 170); g.lineTo(16, 170); g.closePath(); g.fill();
}, 1.2, 4.8);
// streaks of dirt that hang from an edge (the top of the quad), transparent elsewhere
const stainTexture = () => { const t = canvasTexture(256, 128, (g, W, Hc) => {
  const r = rng(2027), top = g.createLinearGradient(0, 0, 0, 44); top.addColorStop(0, 'rgba(60,46,36,0.16)'); top.addColorStop(1, 'rgba(60,46,36,0)'); g.fillStyle = top; g.fillRect(0, 0, W, 44);
  for (let i = 0; i < 46; i++) { const x = r() * W, w = 1.5 + r() * r() * 14, len = 14 + r() * r() * 112, gr = g.createLinearGradient(0, 0, 0, len); gr.addColorStop(0, `rgba(60,46,36,${0.06 + r() * 0.2})`); gr.addColorStop(1, 'rgba(60,46,36,0)'); g.fillStyle = gr; g.fillRect(x, 0, w, len); }
}); t.wrapS = THREE.RepeatWrapping; return t; };
const SIGN_PITCH = 2.6;                        // metres from one character to the next
const signTexture = () => canvasTexture(256 * SIGN.length, 256, (g, W, Hc) => {
  g.clearRect(0, 0, W, Hc); g.font = `218px ${BRUSH}`; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillStyle = '#d6201e'; g.strokeStyle = '#8f1210'; g.lineWidth = 5; g.lineJoin = 'round';
  [...SIGN].forEach((ch, i) => { g.strokeText(ch, (i + 0.5) * 256, Hc / 2 + 8); g.fillText(ch, (i + 0.5) * 256, Hc / 2 + 8); });
}, SIGN_PITCH * SIGN.length, SIGN_PITCH);

// Plain colours: any number of them costs nothing, because every group's plain parts are merged into one vertex-coloured
// mesh per finish (matte, gloss, metal) when the group is finished (mergeFlat).
const flats = new Map();
function C(hex, kind = 'matte') {
  const key = kind + hex; let m = flats.get(key);
  if (!m) { m = new THREE.MeshStandardMaterial({ color: hex }); m.userData.flat = kind; m.name = 'lib-c' + hex.toString(16); flats.set(key, m); }
  return m;
}
const flatMats = {};
function flatMat(kind) {
  if (!flatMats[kind]) { const [roughness, metalness] = { matte: [0.86, 0], gloss: [0.42, 0.02], metal: [0.38, 0.72] }[kind]; flatMats[kind] = new THREE.MeshStandardMaterial({ vertexColors: true, roughness, metalness }); flatMats[kind].name = 'lib-flat-' + kind; }
  return flatMats[kind];
}
function mergeFlat(group, castShadow) {
  const buckets = {};
  for (const m of group.children) if (m.isMesh && !m.isInstancedMesh && m.material.userData.flat) (buckets[m.material.userData.flat] ||= []).push(m);
  for (const key of Object.keys(buckets)) {
    const take = buckets[key]; let nv = 0, ni = 0; for (const m of take) { nv += m.geometry.attributes.position.count; ni += m.geometry.index.count; }
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
    const mesh = new THREE.Mesh(g, flatMat(key)); mesh.castShadow = castShadow; mesh.receiveShadow = true; group.add(mesh);
  }
  return group;
}
const MW = C(0xf4f4f2, 'gloss'), STL = C(0xb8bcc0, 'metal');      // white paint and bare steel, used everywhere

const local = {};
function lm(name) {
  if (local[name]) return local[name];
  const S = (color, roughness = 0.8, metalness = 0, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness, metalness, ...extra });
  const glow = (color, k) => S(0xffffff, 0.6, 0, { emissive: color, emissiveIntensity: k });
  const see = { transparent: true, depthWrite: false, side: THREE.DoubleSide };
  const pane = (color, opacity, metalness = 0.3, extra = {}) => { const s = SURFACES.glazing(0x8fb0b8, 8, 1, [8, 2], 41); return S(color, 0.05, metalness, { map: s.map, normalMap: s.normalMap, opacity, envMapIntensity: 1.3, ...see, ...extra }); };
  const make = {
    // surfaces from hifi.js (maps computed in code)
    terr: () => pbr('cladding', [0xa5503c, 1.2, 0.3, 0.72]),                                                  // terracotta panels 1.2 x 0.3 m with open joints
    mosaic: () => pbr('tiles', [0xa94a30, 8, 0.8, 0.5]),                                                      // small square tiles of the podium, 0.1 m
    stone: () => pbr('cladding', [0xd3d2cd, 1.2, 0.6, 0.62]),                                                 // honed pale stone, 1.2 x 0.6 m
    plaza: () => pbr('paving', [0xd9d6cf, 0xc8c3b7, 4, 8, [2.4, 2.4], 23, true]),                             // pale granite pavers 0.6 x 0.3 m
    band: () => pbr('paving', [0xc3b196, 0xb09d80, 4, 8, [2.4, 2.4], 29, true]),                              // the brown bands in the plaza
    tile: () => pbr('tiles', [0xd9d6cc, 2, 1.2, 0.34]),                                                       // polished floor tiles 0.6 m (upper storeys)
    boards: () => pbr('boards', [0xc9a878, 1.2]), carpet: () => pbr('rubber', [0x4a5568, 2]), concrete: () => pbr('concrete', [0xbdb9b0]), steel: () => pbr('steel'),
    timber: () => pbr('timber'), hedge: () => pbr('hedge'), setts: () => pbr('setts'), granite: () => pbr('granitePolished', [0x34363a, 7]), kerb: () => pbr('concrete', [0xcbc7bd]),
    // drawn textures
    ribbon: () => { const s = SURFACES.glazing(0x8fb0b8, 8, 1, [8, 2], 41); return S(0xffffff, 0.12, 0.3, { map: ribbonTexture(lm.low), normalMap: s.normalMap, envMapIntensity: 1.2 }); },
    books: () => { const t = bookTexture(); return S(0xffffff, 0.8, 0, { map: t, emissive: 0xffffff, emissiveMap: t, emissiveIntensity: 0.3 }); },
    barsDark: () => S(0x2a2d30, 0.6, 0.3, { map: barsTexture(), ...see }),
    barsGrey: () => S(0xb9bdc0, 0.5, 0.4, { map: barsTexture(), ...see }),
    slats: () => S(0xb5502f, 0.8, 0, { map: slatsTexture(), ...see }),
    louvre: () => S(0xffffff, 0.5, 0.5, { map: louvreTexture() }),
    arrows: () => S(0xffffff, 0.9, 0, { map: arrowTexture(), transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }),
    stain: () => S(0xffffff, 1, 0, { map: stainTexture(), transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -2 }),
    sign: () => S(0xffffff, 0.5, 0, { map: signTexture(), transparent: true, alphaTest: 0.35, side: THREE.DoubleSide }),
    // glass. The names decide what lights up after dusk: "glass" does, "rail", "inner" and "rooflight" do not.
    glassLib: () => pane(0xcfe2e0, 0.36, 0.35),                                         // curtain wall of the podium
    glassWell: () => pane(0xd4e6e2, 0.3, 0.3),                                          // corridor glazing round the light well
    glassDoor: () => pane(0xdfeceb, 0.26, 0.25),                                        // glazed screens and door leaves indoors that face the open air
    glassRail: () => S(0xbfd8d6, 0.05, 0.2, { transparent: true, opacity: 0.28, depthWrite: false, side: THREE.DoubleSide }),      // balustrades, door leaves, partitions
    inner: () => S(0xdbe9ea, 0.04, 0.1, { transparent: true, opacity: 0.1, depthWrite: false }),                                   // the room side of a window: one looks out through it
    rooflight: () => S(0xd8ecf0, 0.04, 0.2, { transparent: true, opacity: 0.16, depthWrite: false, side: THREE.DoubleSide }),      // the skylight over the library
    // finishes that carry the indoor light (their own glow is raised after dusk, see the end of build)
    plaster: () => S(0xf3f1ea, 0.85, 0, { emissive: 0xf3f1ea, emissiveIntensity: 0.22 }), ceil: () => S(0xd9d3c6, 0.9, 0, { emissive: 0xd9d3c6, emissiveIntensity: 0.3 }),
    wallUp: () => S(0xf1eee4, 0.88, 0, { emissive: 0xf1eee4, emissiveIntensity: 0.16 }), ceilUp: () => S(0xf4f2ec, 0.92, 0, { emissive: 0xf4f2ec, emissiveIntensity: 0.26 }),
    lamp: () => glow(0xfff4d8, 1.3), cove: () => glow(0xffe9b0, 1.1), shadeWarm: () => S(0xf6e7c2, 0.7, 0, { emissive: 0xffd28a, emissiveIntensity: 0.55 }),
    leaf: () => S(0x3f7a3a, 0.95), flower: () => S(0xb0222c, 0.9),
    sculpt: () => S(0xc8141e, 0.3, 0.25, { side: THREE.DoubleSide, envMapIntensity: 1.2 }),
    // plain colours (merged)
    fin: () => C(0xd6dadd, 'gloss'), frame: () => C(0x25292c, 'gloss'), balu: () => C(0x8f3d2c), stairDark: () => C(0x505356), railDark: () => C(0x2a2d30, 'metal'),
    brass: () => C(0xc9a45c, 'metal'), chairGreen: () => C(0x3f8a4c), chairBeige: () => C(0xcdb994), chairDark: () => C(0x2b3530), chairCream: () => C(0xe4dcc6),
    tableTop: () => C(0xe2cfa6, 'gloss'), woodLight: () => C(0xdcc59c), alcove: () => C(0x121416), tier: () => C(0x77797b), pole: () => C(0xd9762b),
  };
  const m = (make[name] || (() => C(0xd9d6cf)))(); if (!m.name || (!m.name.startsWith('hifi-') && !m.name.startsWith('lib-c'))) m.name = 'lib-' + name;
  return (local[name] = m);
}

// ---------------------------------------------------------------- the lettering sheet
// Everything printed, written or shown on a screen in this building is a card cut from ONE texture sheet drawn in code.
// Every word on it is invented (see IMAGINED in the header).
class Atlas {
  constructor(low) { this.k = low ? 0.5 : 1; this.S = 2048 * this.k; this.c = document.createElement('canvas'); this.c.width = this.c.height = this.S; this.g = this.c.getContext('2d'); this.g.fillStyle = '#8a8a84'; this.g.fillRect(0, 0, this.S, this.S); this.x = 0; this.y = 0; this.row = 0; this.uv = {}; this.full = []; }
  put(key, w, h, draw) {
    const P = Math.max(2, Math.round(4 * this.k)), pw = Math.round(w * this.k), ph = Math.round(h * this.k), g = this.g, S = this.S;
    if (this.x + pw > S) { this.x = 0; this.y += this.row + P; this.row = 0; }
    if (this.y + ph > S) { this.full.push(key); return (this.uv[key] = [0.001, 0.001, 0.003, 0.003]); }
    g.save(); g.translate(this.x, this.y); g.beginPath(); g.rect(0, 0, pw, ph); g.clip(); g.scale(pw / w, ph / h); draw(g, w, h); g.restore();
    this.uv[key] = [(this.x + 0.6) / S, 1 - (this.y + ph - 0.6) / S, (this.x + pw - 0.6) / S, 1 - (this.y + 0.6) / S];
    this.x += pw + P; this.row = Math.max(this.row, ph); return this.uv[key];
  }
}
const TX = (g, s, x, y, px, col, font = CJK, align = 'left', weight = '') => { g.font = `${weight} ${px}px ${font}`; g.textAlign = align; g.textBaseline = 'middle'; g.fillStyle = col; g.fillText(s, x, y); };
const BX = (g, x, y, w, h, fill, line = null, lw = 1) => { if (fill) { g.fillStyle = fill; g.fillRect(x, y, w, h); } if (line) { g.strokeStyle = line; g.lineWidth = lw; g.strokeRect(x + lw / 2, y + lw / 2, w - lw, h - lw); } };
const ROWS = (g, x, y, w, n, pitch, col, h = 2.5, r = null) => { g.fillStyle = col; for (let i = 0; i < n; i++) g.fillRect(x, y + i * pitch, w * (i === n - 1 ? 0.55 : r ? 0.8 + 0.2 * r() : 1), h); };
// ---------------------------------------------------------------- geometry helpers (all work in the Batch's current frame)
// Batch has no triangle or polygon call, so these write through its _part/_vert (see the report).
function tri(b, m, A, B, C) {                  // counter-clockwise seen from the side it faces; planar texture coordinates in metres
  const p = b._part(m), base = p.pos.length / 3;
  const ux = B[0] - A[0], uy = B[1] - A[1], uz = B[2] - A[2], vx = C[0] - A[0], vy = C[1] - A[1], vz = C[2] - A[2];
  let nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx; const l = Math.hypot(nx, ny, nz) || 1; nx /= l; ny /= l; nz /= l;
  for (const q of [A, B, C]) b._vert(p, q[0], q[1], q[2], nx, ny, nz, Math.abs(ny) > 0.7 || Math.abs(nz) > Math.abs(nx) ? q[0] : q[2], Math.abs(ny) > 0.7 ? -q[2] : q[1]);
  p.idx.push(base, base + 1, base + 2);
}
/** Flat polygon [[x, z], ...] at height y, facing up or down; holes are polygons too. */
function cap(b, m, pts, y, up = true, holes = []) {
  const V = q => new THREE.Vector2(q[0], q[1]), all = [...pts, ...holes.flat()];
  for (const [i, j, k] of THREE.ShapeUtils.triangulateShape(pts.map(V), holes.map(h => h.map(V)))) {
    const a = all[i], e = all[j], f = all[k], cross = (e[0] - a[0]) * (f[1] - a[1]) - (e[1] - a[1]) * (f[0] - a[0]);
    if ((cross < 0) === up) tri(b, m, [a[0], y, a[1]], [e[0], y, e[1]], [f[0], y, f[1]]); else tri(b, m, [a[0], y, a[1]], [f[0], y, f[1]], [e[0], y, e[1]]);
  }
}
/** Vertical quad standing on the segment P-Q ([x, z]) and facing the side on which the point `toward` lies. y0 and y1 may be [atP, atQ]. */
function wallQuad(b, m, P, Q, y0, y1, toward, off = 0) {
  const s = (Q[0] - P[0]) * (toward[1] - P[1]) - (Q[1] - P[1]) * (toward[0] - P[0]), [a, e] = s > 0 ? [P, Q] : [Q, P], sw = s > 0 ? 0 : 1;
  const yl = Array.isArray(y0) ? y0 : [y0, y0], yh = Array.isArray(y1) ? y1 : [y1, y1], len = Math.hypot(e[0] - a[0], e[1] - a[1]) || 1;
  const ox = -(e[1] - a[1]) / len * off, oz = (e[0] - a[0]) / len * off;
  b.quad(m, [a[0] + ox, yl[sw], a[1] + oz], [e[0] + ox, yl[1 - sw], e[1] + oz], [e[0] + ox, yh[1 - sw], e[1] + oz], [a[0] + ox, yh[sw], a[1] + oz]);
}
/** Closed ring of wall quads round a polygon, facing inward or outward. */
function ringQuads(b, m, pts, y0, y1, inward) {
  let cx = 0, cz = 0; for (const p of pts) { cx += p[0] / pts.length; cz += p[1] / pts.length; }
  pts.forEach((p, i) => { const q = pts[(i + 1) % pts.length], mid = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2], t = inward ? [cx, cz] : [2 * mid[0] - cx, 2 * mid[1] - cz]; wallQuad(b, m, p, q, y0, y1, t); });
}
/** Solid over a polygon (convex or star-shaped about its centroid) from y0 to y1. */
function polyPrism(b, m, pts, y0, y1, top = true, bottom = false) {
  ringQuads(b, m, pts, y0, y1, false); if (top) cap(b, m, pts, y1, true); if (bottom) cap(b, m, pts, y0, false);
}
/** Quad with explicit texture coordinates (u0, v0) at A ... (u1, v1) at C; corners counter-clockwise seen from the front. */
function texQuad(b, m, A, B, C, D, u0, v0, u1, v1) {
  const p = b._part(m), base = p.pos.length / 3;
  const ux = B[0] - A[0], uy = B[1] - A[1], uz = B[2] - A[2], vx = D[0] - A[0], vy = D[1] - A[1], vz = D[2] - A[2];
  let nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx; const l = Math.hypot(nx, ny, nz) || 1; nx /= l; ny /= l; nz /= l;
  [[A, u0, v0], [B, u1, v0], [C, u1, v1], [D, u0, v1]].forEach(([q, u, w]) => b._vert(p, q[0], q[1], q[2], nx, ny, nz, u, w));
  p.idx.push(base, base + 1, base + 2, base, base + 2, base + 3);
}
/** Surface of revolution round a vertical axis; profile [[radius, y], ...] from bottom to top. */
function lathe(b, m, cx, cz, profile, seg = 12) {
  const p = b._part(m), base = p.pos.length / 3, n = profile.length;
  for (let j = 0; j < n; j++) {
    const [r, y] = profile[j], [r0, y0] = profile[Math.max(0, j - 1)], [r1, y1] = profile[Math.min(n - 1, j + 1)];
    const dr = r1 - r0, dy = y1 - y0, l = Math.hypot(dr, dy) || 1, nr = dy / l, ny = -dr / l;
    for (let i = 0; i <= seg; i++) { const a = i / seg * 2 * Math.PI, co = Math.cos(a), si = Math.sin(a); b._vert(p, cx + r * co, y, cz + r * si, nr * co, ny, nr * si, a * r, y); }
  }
  for (let j = 0; j < n - 1; j++) for (let i = 0; i < seg; i++) { const a = base + j * (seg + 1) + i, e = a + seg + 1; p.idx.push(a, e, e + 1, a, e + 1, a + 1); }
}
/** Flat ring sector at height y between radii r0 < r1 and angles a0 < a1 (angle 0 = local +x, growing toward +z). */
function ringTop(b, m, cx, cz, r0, r1, a0, a1, y, seg, up = true) {
  const P = (r, t) => [cx + r * Math.cos(t), y, cz + r * Math.sin(t)];
  for (let i = 0; i < seg; i++) {
    const t0 = a0 + (a1 - a0) * i / seg, t1 = a0 + (a1 - a0) * (i + 1) / seg, q = [P(r0, t0), P(r1, t0), P(r1, t1), P(r0, t1)];
    if (up) b.quad(m, q[0], q[3], q[2], q[1]); else b.quad(m, q[0], q[1], q[2], q[3]);
  }
}
/** Piece of a cylinder wall, facing outward or inward. */
function ringWall(b, m, cx, cz, r, a0, a1, y0, y1, seg, out = true) {
  for (let i = 0; i < seg; i++) {
    const t0 = a0 + (a1 - a0) * i / seg, t1 = a0 + (a1 - a0) * (i + 1) / seg;
    const A = [cx + r * Math.cos(t0), cz + r * Math.sin(t0)], B = [cx + r * Math.cos(t1), cz + r * Math.sin(t1)];
    if (out) b.quad(m, [B[0], y0, B[1]], [A[0], y0, A[1]], [A[0], y1, A[1]], [B[0], y1, B[1]]); else b.quad(m, [A[0], y0, A[1]], [B[0], y0, B[1]], [B[0], y1, B[1]], [A[0], y1, A[1]]);
  }
}
/** Square bar between two points given in the current frame (unlike Batch.strut, which wants world coordinates and resets the frame). */
const _q = new THREE.Quaternion(), _m = new THREE.Matrix4(), _X = new THREE.Vector3(1, 0, 0), _one = new THREE.Vector3(1, 1, 1);
function bar(b, m, p0, p1, t = 0.05, t2 = t) {
  const A = new THREE.Vector3(...p0), B = new THREE.Vector3(...p1), d = B.clone().sub(A), len = d.length(); if (len < 1e-6) return;
  const keep = b.m.clone(); _q.setFromUnitVectors(_X, d.normalize());
  b.setMatrix(keep.clone().multiply(_m.compose(A.add(B).multiplyScalar(0.5), _q, _one))); b.box(m, 0, 0, 0, len, t, t2); b.setMatrix(keep);
}
/** Slab under a quadrilateral top (four [x, y, z] corners, counter-clockwise seen from above): used for landings and stair ramps. */
function plate(b, m, q, t = 0.2) {
  const lo = q.map(p => [p[0], p[1] - t, p[2]]);
  b.quad(m, q[0], q[1], q[2], q[3]); b.quad(m, lo[3], lo[2], lo[1], lo[0]);
  for (let i = 0; i < 4; i++) { const j = (i + 1) % 4; b.quad(m, lo[i], lo[j], q[j], q[i]); }
}
/** Railing of thin vertical bars from P to Q ([x, z]) with a top rail and posts; the foot may slope (yP to yQ). */
function rail(b, P, Q, yP, yQ, h = 1.1, kind = 'Dark') {
  const len = Math.hypot(Q[0] - P[0], Q[1] - P[1]); if (len < 0.05) return;
  b.quad(lm('bars' + kind), [P[0], yP, P[1]], [Q[0], yQ, Q[1]], [Q[0], yQ + h - 0.03, Q[1]], [P[0], yP + h - 0.03, P[1]]);
  const top = kind === 'Grey' ? STL : lm('railDark');
  bar(b, top, [P[0], yP + h, P[1]], [Q[0], yQ + h, Q[1]], 0.06);
  const n = Math.max(1, Math.round(len / (kind === 'Grey' ? 4.8 : 2.4)));
  for (let i = 0; i <= n; i++) { const f = i / n; b.box(top, P[0] + (Q[0] - P[0]) * f, yP + (yQ - yP) * f + h / 2, P[1] + (Q[1] - P[1]) * f, 0.05, h, 0.05, 'D'); }
}
// ---- 2D helpers on [x, z] ----
const sub = (a, b) => [a[0] - b[0], a[1] - b[1]], add = (a, b) => [a[0] + b[0], a[1] + b[1]], mul = (a, k) => [a[0] * k, a[1] * k];
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]), unit = a => mul(a, 1 / (Math.hypot(a[0], a[1]) || 1));
const lerp = (a, b, f) => [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
/** Points of the arc that rounds the corner C between the directions to P and to N (from the tangent point on CP to the one on CN). */
function fillet(P, C, N, r, n = 5) {
  const u = unit(sub(P, C)), w = unit(sub(N, C)), half = Math.acos(Math.max(-1, Math.min(1, u[0] * w[0] + u[1] * w[1]))) / 2;
  const t = r / Math.tan(half), ctr = add(C, mul(unit(add(u, w)), r / Math.sin(half))), p0 = add(C, mul(u, t)), p1 = add(C, mul(w, t));
  const a0 = Math.atan2(p0[1] - ctr[1], p0[0] - ctr[0]); let d = Math.atan2(p1[1] - ctr[1], p1[0] - ctr[0]) - a0;
  while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI;
  return Array.from({ length: n + 1 }, (_, i) => [ctr[0] + r * Math.cos(a0 + d * i / n), ctr[1] + r * Math.sin(a0 + d * i / n)]);
}
const rounded = (pts, r, n = 4) => pts.flatMap((p, i) => fillet(pts[(i + pts.length - 1) % pts.length], p, pts[(i + 1) % pts.length], r, n));
function inside(pt, poly) {
  let ok = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const a = poly[i], e = poly[j]; if ((a[1] > pt[1]) !== (e[1] > pt[1]) && pt[0] < (e[0] - a[0]) * (pt[1] - a[1]) / (e[1] - a[1]) + a[0]) ok = !ok; }
  return ok;
}

// ---------------------------------------------------------------- instanced furniture
// Chairs, stools, stands: one geometry per kind, drawn as two instanced meshes: "body" takes a colour per piece (the
// upholstery), "frame" keeps its own colours (legs, steel). All pieces face their local +x and stand on y = 0.
const shapeCache = {}, _v = new THREE.Vector3();
function shapeOf(key) {
  if (shapeCache[key]) return shapeCache[key];
  const body = new Batch(), frame = new Batch(), WH = C(0xffffff), WD = C(0x8a6a48), DK = C(0x2a2c2f), ST = C(0x8f959b);
  const legs = (b, m, hx, hz, h, t = 0.03, splay = 0.03) => { for (const sx of [-1, 1]) for (const sz of [-1, 1]) bar(b, m, [sx * hx, h, sz * hz], [sx * (hx + splay), 0, sz * (hz + splay)], t); };
  if (key === 'tub') {                                               // tub chair of the library (frames 40-41): round cushion, wrap-round back, splayed wooden legs
    body.cyl(WH, 0, 0.36, 0, 0.27, 0.1, 12); ringWall(body, WH, 0, 0, 0.31, Math.PI - 1.75, Math.PI + 1.75, 0.33, 0.8, 9, true); ringWall(body, WH, 0, 0, 0.26, Math.PI - 1.75, Math.PI + 1.75, 0.44, 0.8, 9, false);
    ringTop(body, WH, 0, 0, 0.26, 0.31, Math.PI - 1.75, Math.PI + 1.75, 0.8, 9); legs(frame, WD, 0.16, 0.16, 0.36, 0.035, 0.06);
  } else if (key === 'task') {                                       // swivel chair
    body.box(WH, 0, 0.46, 0, 0.46, 0.07, 0.46); body.box(WH, -0.22, 0.78, 0, 0.05, 0.46, 0.42);
    frame.cyl(DK, 0, 0.08, 0, 0.03, 0.36, 6, false); for (let i = 0; i < 5; i++) bar(frame, DK, [0, 0.1, 0], [0.3 * Math.cos(i * 1.257), 0.04, 0.3 * Math.sin(i * 1.257)], 0.035); bar(frame, DK, [-0.2, 0.46, 0], [-0.24, 0.6, 0], 0.04);
  } else if (key === 'stool') {
    body.cyl(WH, 0, 0.44, 0, 0.17, 0.035, 10); legs(frame, ST, 0.1, 0.1, 0.44, 0.022, 0.05); frame.box(ST, 0, 0.16, 0, 0.3, 0.015, 0.3, 'UD');
  } else if (key === 'chair') {                                      // plain four-legged chair
    body.box(WH, 0, 0.445, 0, 0.42, 0.035, 0.42); body.box(WH, -0.2, 0.76, 0, 0.03, 0.3, 0.4);
    legs(frame, ST, 0.18, 0.18, 0.43, 0.024, 0.01); for (const z of [-0.18, 0.18]) bar(frame, ST, [-0.19, 0.43, z], [-0.21, 0.9, z], 0.024);
  } else if (key === 'seat') {                                       // fixed lecture seat with a writing tablet
    body.box(WH, 0.02, 0.43, 0, 0.44, 0.08, 0.46); body.box(WH, -0.22, 0.72, 0, 0.07, 0.52, 0.46);
    for (const z of [-0.26, 0.26]) frame.box(DK, -0.02, 0.33, z, 0.5, 0.66, 0.035, 'D'); frame.box(WD, 0.14, 0.68, 0.28, 0.26, 0.02, 0.3);
  } else if (key === 'easel') {
    const E = C(0xb98a55); for (const z of [-0.3, 0.3]) bar(frame, E, [0.1, 0, z], [-0.1, 1.85, z * 0.15], 0.04); bar(frame, E, [-0.75, 0, 0], [-0.1, 1.8, 0], 0.04);
    frame.box(E, 0.07, 0.74, 0, 0.09, 0.03, 0.72); frame.box(E, -0.07, 1.62, 0, 0.05, 0.05, 0.3);
  } else if (key === 'mstand') {
    frame.cyl(DK, 0, 0, 0, 0.012, 1.05, 6, false); for (let i = 0; i < 3; i++) bar(frame, DK, [0, 0.25, 0], [0.26 * Math.cos(i * 2.094), 0, 0.26 * Math.sin(i * 2.094)], 0.015); frame.box(DK, 0.015, 1.2, 0, 0.012, 0.3, 0.46);
  }
  const geo = b => { const g = mergeFlat(b.build({ castShadow: false }), false); return g.children.length ? g.children[0].geometry : null; };
  return (shapeCache[key] = { body: geo(body), frame: geo(frame) });
}
class Inst {
  constructor() { this.list = new Map(); }
  put(key, m4, hex = 0xffffff) { let l = this.list.get(key); if (!l) this.list.set(key, (l = [])); l.push([m4, hex]); }
  build(group, name) {
    const col = new THREE.Color();
    for (const [key, l] of this.list) { const sh = shapeOf(key);
      for (const part of ['body', 'frame']) { if (!sh[part]) continue; const im = new THREE.InstancedMesh(sh[part], flatMat('matte'), l.length);
        l.forEach(([m, hex], i) => { im.setMatrixAt(i, m); if (part === 'body') im.setColorAt(i, col.setHex(hex)); });
        im.name = name + '-' + key + '-' + part; im.castShadow = false; im.receiveShadow = true; im.frustumCulled = false; group.add(im); } }
    return group;
  }
}

export function build(item, ctx) {
  const { A, B, D, E } = FOOT;
  // ---- frames. L: origin at the south-west corner E, +X along the south face toward D, +Z out of the building (south), -Z into it.
  const aS = Math.atan2(-(D[1] - E[1]), D[0] - E[0]), cs = Math.cos(aS), sn = Math.sin(aS);
  const toL = ([x, z]) => [(x - E[0]) * cs - (z - E[1]) * sn, (x - E[0]) * sn + (z - E[1]) * cs];
  const toW = ([X, Z]) => [E[0] + X * cs + Z * sn, E[1] - X * sn + Z * cs];
  const LE = [0, 0], LD = toL(D), LC = toL(FOOT.C), LB = toL(B), LA = toL(A);
  const home = b => b.frame(E[0], E[1], aS);
  const at = (b, X, Z, yaw = 0, y = 0) => { const w = toW([X, Z]); return b.frame(w[0], w[1], aS + yaw, y); };
  /** Frame along the edge P -> Q (L coordinates): local +x along it, +z to its right. Returns the length. */
  const along = (b, P, Q, y = 0) => { const w = toW(P); b.frame(w[0], w[1], aS + Math.atan2(-(Q[1] - P[1]), Q[0] - P[0]), y); return dist(P, Q); };
  const v = new Batch(), c = new Batch(), iv = new Batch(), fu = new Batch(), fx = new Batch(), gx = new Batch();   // shell, colliders, interior, furniture, fine detail, outdoor detail
  for (const b of [v, c, iv, fu, fx, gx]) home(b);
  const G = 'generic';
  lm.low = !!ctx.lowPower; const low = lm.low, TERR = lm('terr');
  // ---- frames of the two oblique faces (used by everything indoors above and beside the library)
  const dot = (a, e) => a[0] * e[0] + a[1] * e[1];
  const uN = unit(sub(LA, LB)), inN = [uN[1], -uN[0]];                // along the north-west face from its north end B, and into the building
  const Nf = (s, d) => [LB[0] + uN[0] * s + inN[0] * d, LB[1] + uN[1] * s + inN[1] * d];
  const uE = unit(sub(LB, LC)), inE = [uE[1], -uE[0]];                // along the north-east face from the east corner C, and into the building
  const Ef = (t, e) => [LC[0] + uE[0] * t + inE[0] * e, LC[1] + uE[1] * t + inE[1] * e];
  const UPF = [F3, F3 + FH, F3 + 2 * FH, F3 + 3 * FH], LEVELS = [F0, F2, ...UPF, H];       // floors of storeys 3 to 6; every level the stair serves
  // the stair under the western roof pavilion: landings between SS0 and SS1 (metres from B), flights from SS1, half landings to SS2; SD0..SD1 metres in from the face
  const SS0 = 34.75, SS1 = 36.15, SS2 = 41.05, SD0 = 2.55, SD1 = 5.55, ND = [32.8, 34.4];                    // ND: the door of the stair hall in the stone base
  const STAIRHOLE = [Nf(SS1, SD0), Nf(SS2, SD0), Nf(SS2, SD1), Nf(SS1, SD1)];
  // ---- the lettering sheet: cards are drawn on first use; the two materials show the same sheet, the second one self-lit (screens, exit signs)
  const SH = new Atlas(low), sheetTex = new THREE.CanvasTexture(SH.c); sheetTex.colorSpace = THREE.SRGBColorSpace; sheetTex.anisotropy = 8;
  const PR = new THREE.MeshStandardMaterial({ map: sheetTex, roughness: 0.55 }); PR.name = 'lib-prints';
  const PRL = new THREE.MeshStandardMaterial({ map: sheetTex, roughness: 0.6, emissive: 0xffffff, emissiveMap: sheetTex, emissiveIntensity: 0.85 }); PRL.name = 'lib-screens';
  const U = (key, w, h, draw) => SH.uv[key] || SH.put(key, w, h, draw);
  /** Upright card in the current frame of b, facing +z (sg 1) or -z (sg -1); (x, y) is its lower corner with the smaller x. */
  const cardZ = (b, uv, x, y, z, w, h, sg = 1, lit = false) => (sg > 0 ? texQuad(b, lit ? PRL : PR, [x, y, z], [x + w, y, z], [x + w, y + h, z], [x, y + h, z], uv[0], uv[1], uv[2], uv[3])
    : texQuad(b, lit ? PRL : PR, [x + w, y, z], [x, y, z], [x, y + h, z], [x + w, y + h, z], uv[0], uv[1], uv[2], uv[3]));
  /** The same facing +x (sg 1) or -x (sg -1); (z, y) is its lower corner with the smaller z, w runs along z. */
  const cardX = (b, uv, x, y, z, w, h, sg = 1, lit = false) => (sg > 0 ? texQuad(b, lit ? PRL : PR, [x, y, z + w], [x, y, z], [x, y + h, z], [x, y + h, z + w], uv[0], uv[1], uv[2], uv[3])
    : texQuad(b, lit ? PRL : PR, [x, y, z], [x, y, z + w], [x, y + h, z + w], [x, y + h, z], uv[0], uv[1], uv[2], uv[3]));
  /** Card lying flat, face up, read by someone standing on its +z side. */
  const cardY = (b, uv, x, y, z, w, d, lit = false) => texQuad(b, lit ? PRL : PR, [x, y, z + d], [x + w, y, z + d], [x + w, y, z], [x, y, z], uv[0], uv[1], uv[2], uv[3]);
  const plateCard = (num, name) => U('pl' + num + name, 216, 74, (g, W, Hh) => { BX(g, 0, 0, W, Hh, '#1d4f9c'); BX(g, 3, 3, W - 6, Hh - 6, null, '#ffffff', 2); BX(g, 7, 7, 60, Hh - 14, '#ffffff');
    TX(g, num, 37, Hh / 2 + 1, num.length > 3 ? 20 : 25, '#1d4f9c', CJK, 'center', 'bold'); TX(g, name, 72 + (W - 80) / 2, Hh / 2 + 1, name.length > 5 ? 19 : 24, '#ffffff', CJK, 'center', 'bold'); });
  const signCard = (text, bg = '#f7f9fb', fg = '#1d4f9c', w = 240, h = 80) => U('sg' + text + bg, w, h, (g, W, Hh) => { BX(g, 0, 0, W, Hh, bg, fg, 3); TX(g, text, W / 2, Hh / 2 + 1, Math.min(Hh * 0.52, (W - 16) / Math.max(1, text.length) * 1.05), fg, CJK, 'center', 'bold'); });
  const exitCard = () => U('exit', 200, 70, (g, W, Hh) => { BX(g, 0, 0, W, Hh, '#0d8a4a'); g.fillStyle = '#fff'; g.beginPath(); g.arc(38, 18, 7, 0, TAU); g.fill();
    g.strokeStyle = '#fff'; g.lineWidth = 6; g.lineCap = 'round'; g.beginPath(); g.moveTo(40, 28); g.lineTo(32, 44); g.lineTo(22, 58); g.moveTo(32, 44); g.lineTo(44, 54); g.lineTo(48, 62); g.moveTo(38, 32); g.lineTo(52, 36); g.moveTo(36, 32); g.lineTo(24, 38); g.stroke();
    TX(g, '安全出口', 128, 24, 24, '#fff', CJK, 'center', 'bold'); TX(g, 'EXIT', 128, 51, 20, '#fff', CJK, 'center', 'bold'); });
  const floorCard = n => U('fl' + n, 160, 160, (g, Sz) => { BX(g, 0, 0, Sz, Sz, '#f7f7f3'); g.beginPath(); g.arc(Sz / 2, Sz / 2, 68, 0, TAU); g.fillStyle = '#1d4f9c'; g.fill(); TX(g, n + 'F', Sz / 2, Sz / 2 + 4, 66, '#fff', CJK, 'center', 'bold'); });
  /** Collision wall on the segment P-Q (L coordinates). */
  const block = (P, Q, y0, y1, t = 0.24) => { const len = along(c, P, Q); c.slab(G, 0, y0, -t / 2, len, y1 - y0, t); home(c); };
  const blockBox = (X0, Z0, X1, Z1, y0, y1) => c.slab(G, Math.min(X0, X1), y0, Math.min(Z0, Z1), Math.abs(X1 - X0), y1 - y0, Math.abs(Z1 - Z0));

  // ================================================================= UPPER STOREYS (3 to 6): closed, facades only
  const T = 0.45;                                                     // depth of the window reveals
  const face = (m, x0, x1, y0, y1, z = 0.012) => v.quad(m, [x0, y0, z], [x1, y0, z], [x1, y1, z], [x0, y1, z]);
  // one bay of one storey in the current edge frame. s solid, x solid with a thin slot, r ribbon window, b recessed balcony, t open terrace recess, l fins, m tall fins, o open
  const storey = (x0, x1, y0, type, k) => {
    const w = x1 - x0, zg = -T + 0.06; if (type === 'o' || w <= 0.01) return;
    if (type === 's' || type === 'x' || type === 'l' || type === 'm') v.slab(TERR, x0, y0, -T, w, FH, T, 'N');
    if (type === 'x') face('glassDark', x0 + 1.5, x1 - 1.2, y0 + 3.22, y0 + 3.5);
    if (type === 'l') {
      face('glassDark', x0 + 0.3, x1 - 0.3, y0 + 1.0, y0 + 2.5);
      for (let x = x0 + 0.225; x < x1 - 0.05; x += 0.45) v.box(lm('fin'), x, y0 + FH / 2, 0.33, 0.08, FH - 0.3, 0.5, 'UDN');
    }
    if (type === 'm') {                                             // fins two storeys tall (the unseen faces)
      face('glassDark', x0 + 0.3, x1 - 0.3, y0 + 1.0, y0 + 2.5);
      if (k % 2 === 0) for (let x = x0 + 0.225; x < x1 - 0.05; x += 0.45) v.box(lm('fin'), x, y0 + FH, 0.33, 0.08, 2 * FH - 0.3, 0.5, 'UDN');
    }
    if (type === 'r') {
      v.slab(TERR, x0, y0, -T, w, 1.0, T, 'N'); face(lm('ribbon'), x0, x1, y0 + 1.0, y0 + 2.45, zg);
      v.slab(TERR, x0, y0 + 2.45, -T, w, 0.45, T, 'N'); face('glassDark', x0, x1, y0 + 2.9, y0 + 3.4, zg);
      for (const f of [1 / 3, 2 / 3]) v.slab(TERR, x0 + w * f - 0.25, y0 + 2.9, -T, 0.5, 0.5, T, 'NUD');
      v.slab(TERR, x0, y0 + 3.4, -T, w, FH - 3.4, T, 'N');
    }
    if (type === 'b' || type === 't' || type === 'B' || type === 'T') {
      const open = type === 'B' || type === 'T', tt = type.toLowerCase(), d = tt === 't' ? 5 : 2.4, R = TERR;      // B and T: the back wall with its door is drawn with the rooms behind
      if (tt === 't' || k === 0) rail(v, [x0, -0.12], [x1, -0.12], y0, y0, 1.1); else v.slab(TERR, x0, y0, -0.25, w, 1.15, 0.25);
      v.quad('floorGrey', [x0, y0 + 0.01, -d], [x0, y0 + 0.01, 0], [x1, y0 + 0.01, 0], [x1, y0 + 0.01, -d]);
      if (!open) v.quad(R, [x0, y0, -d], [x1, y0, -d], [x1, y0 + FH, -d], [x0, y0 + FH, -d]);
      v.quad(R, [x0, y0, 0], [x0, y0, -d], [x0, y0 + FH, -d], [x0, y0 + FH, 0]); v.quad(R, [x1, y0, -d], [x1, y0, 0], [x1, y0 + FH, 0], [x1, y0 + FH, -d]);
      v.slab(TERR, x0, y0 + 3.4, -T, w, FH - 3.4, T, 'N');
      v.quad(R, [x0, y0 + 3.4, -d], [x1, y0 + 3.4, -d], [x1, y0 + 3.4, -T], [x0, y0 + 3.4, -T]);
      if (!open) face('glassDark', x0 + 0.6, x1 - 0.6, y0 + 0.1, y0 + 2.4, -d + 0.02);
    }
  };
  const facade = (P, Q, floors, ledges) => {
    const len = along(v, P, Q);
    floors.forEach((bays, k) => bays.forEach(([x0, x1, type]) => storey(x0, Math.min(x1, len), F3 + k * FH, type, k)));
    for (const [y, x0, x1, d] of ledges) v.slab(TERR, x0, y - 0.15, -0.02, x1 - x0, 0.3, d + 0.02);
    return len;
  };
  const LS = dist(LE, LD), LNW = dist(LB, LA), LNE = dist(LC, LB), LEa = dist(LD, LC), LW = dist(LA, LE);
  const VOID_S = [47, 55.5], FIN_S = 55.5;                            // south face: two-storey void and the start of the fin strip
  // south face (frames 20, 25-27)
  { const lo = [[0, 1.5, 's'], [1.5, 9.5, 'r'], [9.5, 11.5, 's'], [11.5, 19.5, 'r'], [19.5, 21.5, 's'], [21.5, 28, 'r'], [28, 30, 's'], [30, 38, 'r'], [38, 39.5, 's'], [39.5, 46, 'r'], [46, VOID_S[0], 's'], [VOID_S[0], VOID_S[1], 'o'], [FIN_S, LS, 'l']];
    const hi = [[0, 1.5, 's'], [1.5, 9.5, 'r'], [9.5, 11.5, 's'], [11.5, 19.5, 'r'], [19.5, 21, 's'], [21, 28.5, 'T'], [28.5, 30, 's'], [30, 38, 'r'], [38, 39.5, 's'], [39.5, 46, 'r'], [46, 48, 's'], [48, 54.5, 'r'], [54.5, FIN_S, 's'], [FIN_S, LS, 'l']];
    facade(LE, LD, [lo, lo, hi, hi], [[F3 + FH, 0, FIN_S, 0.35], [F3 + 2 * FH, 0, FIN_S, 0.5], [F3 + 3 * FH, 0, FIN_S, 0.35], [H, 0, LS, 0.3]]); }
  // north-west face, from the north corner B to the west corner A (frames 55-57). Distances along it measured from A in frame 55.
  const PORTAL = [LNW - 11.03, LNW - 2.89];                           // mouth of the portal along this face
  { const mid = [[0, 10.4, 'x'], [10.4, 16.5, 'b'], [16.5, 17.3, 's'], [17.3, 24.6, 'r'], [24.6, 25.7, 's'], [25.7, 32.9, 'r'], [32.9, 33.7, 's'], [33.7, 40.1, 'B']];
    const lo = [...mid, [40.1, PORTAL[0], 's']], hi = [...mid, [40.1, LNW, 'l']];
    facade(LB, LA, [lo, lo, hi, hi], [[F3, 0, PORTAL[0], 0.3], [F3 + FH, 0, PORTAL[0], 0.35], [F3 + 2 * FH, 0, 40.1, 0.5], [F3 + 3 * FH, 0, 40.1, 0.35], [H, 0, LNW, 0.3]]); }
  // north-east and east faces: not seen anywhere, drawn with fins (see ASSUMED)
  facade(LC, LB, [0, 1, 2, 3].map(() => [[0, LNE, 'm']]), [[H, 0, LNE, 0.3]]);
  facade(LD, LC, [0, 1, 2, 3].map(() => [[0, LEa, 'm']]), [[H, 0, LEa, 0.3]]);

  // ================================================================= WEST CORNER: end wall, portal, driveway
  // frame W along the west end A -> E; +z outward (west), -z into the building
  const PW = 2.7, PE = 10.3, PBACK = 13, PH = 15.0;                   // thickness of the end wall, far side of the portal, its back wall, its height
  const nwX = z => 0.381 * z;                                         // where the north-west face cuts this frame (x as a function of z, z <= 0)
  along(v, LA, LE);
  polyPrism(v, TERR, [[0, 0], [LW, 0], [LW + 0.345, -PW], [nwX(-PW), -PW]], 0, H, false);
  v.quad(TERR, [nwX(-PE), 0, -PE], [PBACK, 0, -PE], [PBACK, PH, -PE], [nwX(-PE), PH, -PE]);                    // flank of the main body
  v.quad(TERR, [PBACK, 0, -PE], [PBACK, 0, -PW], [PBACK, PH, -PW], [PBACK, PH, -PE]);                          // back wall
  cap(v, TERR, [[nwX(-PW), -PW], [PBACK, -PW], [PBACK, -PE], [nwX(-PE), -PE]], PH, false);                       // soffit under the fin box
  cap(v, 'asphalt', [[nwX(-PW) - 9, -PW - 0.2], [PBACK, -PW], [PBACK, -PE], [nwX(-PE) - 9, -PE + 0.2]], 0.07, true);   // driveway, running out to the north-west
  for (const [x, z] of [[2, -4.7], [2, -8.2], [8, -4.7], [8, -8.2]]) v.quad(lm('arrows'), [x + 4.8, 0.09, z + 0.6], [x + 4.8, 0.09, z - 0.6], [x, 0.09, z - 0.6], [x, 0.09, z + 0.6]);
  { const xb = PBACK - 0.02, q = (m, z0, z1, y0, y1, dx = 0) => v.quad(m, [xb - dx, y0, z0], [xb - dx, y0, z1], [xb - dx, y1, z1], [xb - dx, y1, z0]);
    q('glassDark', -PE + 1, -PW - 1, 0.05, 2.6); q(lm('mosaic'), -PE, -PW, 2.6, 4.3); q('glassDark', -PE, -PW, 4.3, 7.1); q('glassDark', -PE, -PW, F3 + 0.1, F3 + 2.8, 0.01);
    rail(v, [xb - 0.1, -PE], [xb - 0.1, -PW], F3, F3, 1.1); }
  along(v, LB, LA); v.slab(TERR, PORTAL[0], PH, -T, LNW - PORTAL[0], F3 + 2 * FH - PH, T, 'N');                        // lintel between the portal and the fins
  along(c, LA, LE); c.slab(G, -0.5, 0, -PW, LW + 0.8, H, PW); c.slab(G, nwX(-PE), 0, -PE - 0.3, PBACK - nwX(-PE), 15, 0.3); c.slab(G, PBACK, 0, -PE, 0.3, 15, PE - PW); home(c);

  // ================================================================= ROOF (frames 20, 55-58)
  home(v);
  const LWELL = rounded([[27.3, -16.5], [43.4, -25.0], [49.7, -14.6]], 1.3, 4);      // light well, from the satellite image
  const wellC = [40.13, -18.7];
  cap(v, 'roofPale', [LE, LD, LC, LB, LA], H, true, [LWELL, STAIRHOLE]);
  cap(c, G, [LE, LD, LC, LB, LA], H - 0.02, true, [STAIRHOLE]);                        // roof collider, light well covered: a player leaving drone mode above the building lands here
  { const outer = LWELL.map(p => add(p, mul(unit(sub(p, wellC)), 0.25)));
    ringQuads(v, TERR, LWELL, H, H + 0.9, true); ringQuads(v, TERR, outer, H, H + 0.9, false);
    LWELL.forEach((p, i) => { const j = (i + 1) % LWELL.length; cap(v, TERR, [p, LWELL[j], outer[j], outer[i]], H + 0.9, true); }); }
  cap(v, 'glassDark', LWELL, 8.62, true);
  for (const [P, Q, inset] of [[LE, LD, 1.5], [LD, LC, 0.2], [LC, LB, 0.2], [LB, LA, 0.2], [LA, LE, 0.2]]) {
    const len = along(v, P, Q); v.slab(TERR, 0, H, -0.3, len, 0.25, 0.3, 'D'); rail(v, [0.3, -inset], [len - 0.3, -inset], H + (inset > 1 ? 0 : 0.25), H + (inset > 1 ? 0 : 0.25), 1.05, 'Grey');
  }
  // pavilions, pergola and the sign along the north-west edge
  along(v, LB, LA);
  { const z0 = -8.5, z1 = -2.0, yt = H + 3.6, boxes = [[LNW - 44, LNW - 39.1], [LNW - 21.1, LNW - 14.3]], px0 = boxes[0][1], px1 = boxes[1][0];
    for (const [x0, x1] of boxes) { v.slab(TERR, x0, H, z0, x1 - x0, 3.6, z1 - z0, x0 > 30 ? 'DW' : 'D');      // the western one is hollow: its east wall has the door of the stair v.slab('roofPale', x0 - 0.1, yt, z0 - 0.1, x1 - x0 + 0.2, 0.12, z1 - z0 + 0.2);
      v.quad('glassDark', [x0 + 0.8, H + 1.2, z1 + 0.01], [x1 - 0.8, H + 1.2, z1 + 0.01], [x1 - 0.8, H + 2.6, z1 + 0.01], [x0 + 0.8, H + 2.6, z1 + 0.01]); }
    const P = TERR;
    for (let i = 1; i < 3; i++) for (const z of [z0 + 0.2, z1 - 0.2]) v.box(P, px0 + (px1 - px0) * i / 3, H + 1.75, z, 0.2, 3.5, 0.2, 'D');
    for (const z of [z0 + 0.2, z1 - 0.2]) v.box(P, (px0 + px1) / 2, yt - 0.15, z, px1 - px0, 0.3, 0.25);
    v.quad(lm('slats'), [px0, yt + 0.02, z1], [px1, yt + 0.02, z1], [px1, yt + 0.02, z0], [px0, yt + 0.02, z0]);
    // six characters on square lattice frames, read from the north-west (frames 55-57)
    const sw = SIGN_PITCH * SIGN.length, xs = (px0 + px1 - sw) / 2, ys = yt + 0.2, zs = z1 - 0.15;
    v.quad(lm('sign'), [xs, ys, zs + 0.12], [xs + sw, ys, zs + 0.12], [xs + sw, ys + SIGN_PITCH, zs + 0.12], [xs, ys + SIGN_PITCH, zs + 0.12]);
    for (let i = 0; i < SIGN.length; i++) {
      const a = xs + i * SIGN_PITCH + 0.15, e = a + SIGN_PITCH - 0.3, y1 = ys + SIGN_PITCH - 0.1;
      for (const [p, q] of [[[a, ys, zs], [a, y1, zs]], [[e, ys, zs], [e, y1, zs]], [[a, y1, zs], [e, y1, zs]], [[a, ys, zs], [e, ys, zs]], [[a, ys, zs], [e, y1, zs]], [[a, y1, zs], [a + 0.6, ys, zs - 1.2]], [[e, y1, zs], [e - 0.6, ys, zs - 1.2]]]) bar(v, STL, p, q, 0.06);
    }
    v.slab(MW, LNW - 13.2, H, -5, 1.0, 1.3, 1.6);                                                          // air-conditioning unit beside the pavilion
  }
  home(v); for (const [x, z] of [[58, -9], [60.2, -9.4], [62.4, -9.8]]) v.slab(MW, x, H, z, 1.8, 1.4, 1.1);      // units at the east end (frame 20)

  // ================================================================= LOWER STOREYS: outer walls (not the podium front)
  { const FR0 = lm('frame'), win = (x, y, w, h) => { face('glassDark', x, x + w, y, y + h); v.slab(MW, x - 0.08, y - 0.07, 0, w + 0.16, 0.07, 0.07); v.slab(FR0, x - 0.05, y, 0, 0.05, h + 0.05, 0.045, 'D'); v.slab(FR0, x + w, y, 0, 0.05, h + 0.05, 0.045, 'D'); v.slab(FR0, x, y + h, 0, w, 0.05, 0.045); v.slab(FR0, x + w / 2 - 0.02, y, 0, 0.04, h, 0.03, 'UD'); };
    // a pair of cream steel doors in the stone base (frame 55): leaves, frame, pulls, a lamp over them
    const baseDoor = x => { const CR = C(0xe6dfc9, 'gloss'); for (const i of [0, 1]) { v.slab(CR, x + 0.2 + i * 0.8, 0.05, 0, 0.79, 2.25, 0.04, 'D'); v.slab(STL, x + (i ? 1.06 : 0.9), 0.95, 0.04, 0.03, 0.3, 0.035); face('glassDark', x + 0.47 + i * 0.8, x + 0.73 + i * 0.8, 1.35, 1.95, 0.045); }
      v.slab(FR0, x + 0.14, 0.05, 0, 0.06, 2.31, 0.06, 'D'); v.slab(FR0, x + 1.8, 0.05, 0, 0.06, 2.31, 0.06, 'D'); v.slab(FR0, x + 0.14, 2.3, 0, 1.72, 0.06, 0.06); v.slab(lm('lamp'), x + 0.8, 2.5, 0, 0.4, 0.07, 0.09); };
    // north-west: pale grey stone, paired windows above, doors, small windows and louvre strips below (frames 55-56)
    let len = along(v, LB, LA); v.slab(lm('stone'), 0, 0, -0.35, ND[0], F3, 0.35, 'N'); v.slab(lm('stone'), ND[1], 0, -0.35, PORTAL[0] - ND[1], F3, 0.35, 'N'); v.slab(lm('stone'), ND[0], 2.45, -0.35, ND[1] - ND[0], F3 - 2.45, 0.35, 'N');
    for (let x = 2.6; x < PORTAL[0] - 3; x += 6) { win(x, 4.9, 1.1, 1.8); win(x + 1.6, 4.9, 1.1, 1.8);
      if (Math.round(x / 6) % 2) { if (Math.abs(x + 0.2 - ND[0]) > 0.5) baseDoor(x); win(x + 2.4, 1.3, 0.7, 1.0); } else { face(lm('louvre'), x - 0.4, x + 3.4, 2.5, 3.0); v.slab(FR0, x - 0.45, 2.45, 0, 3.9, 0.05, 0.04); v.slab(FR0, x - 0.45, 3.0, 0, 3.9, 0.05, 0.04); } }
    v.slab(lm('stone'), 20.6, 0, 0, 6, 0.28, 2.4); v.slab(lm('stone'), 20.2, 0, 0, 6.8, 0.14, 2.8); along(c, LB, LA); c.slab(G, 20.6, 0, 0, 6, 0.28, 2.4);                      // steps at the middle door
    along(c, LB, LA); c.slab(G, 0, 0, -0.35, ND[0], H, 0.35); c.slab(G, ND[1], 0, -0.35, PORTAL[0] - ND[1], H, 0.35); c.slab(G, ND[0], 2.5, -0.35, ND[1] - ND[0], H - 2.5, 0.35);
    // north-east and east: plain stone base with a row of windows (assumed)
    len = along(v, LC, LB); v.slab(lm('stone'), 0, 0, -0.35, len, F3, 0.35, 'N'); for (let x = 3; x < len - 3; x += 5.5) { win(x, 4.9, 1.1, 1.8); win(x + 1.6, 4.9, 1.1, 1.8); }
    along(c, LC, LB); c.slab(G, 0, 0, -0.35, len, H, 0.35);
    len = along(v, LD, LC); v.slab(lm('stone'), 1.0, 0, -0.35, len - 1.0, F3, 0.35, 'N'); for (let x = 4; x < len - 3; x += 5.5) { win(x, 4.9, 1.1, 1.8); win(x + 1.6, 4.9, 1.1, 1.8); }
    along(c, LD, LC); c.slab(G, 0, 0, -0.35, len, H, 0.35);
    // south face west of the terrace: the terracotta runs to the ground (frame 20)
    home(v); v.slab(TERR, PW, 0, -0.35, 16 - PW, F3, 0.35, 'N'); home(c); c.slab(G, 0, 0, -0.35, 16.3, H, 0.35); }

  // ================================================================= PODIUM, TERRACE, PORCH (frames 20, 25-33)
  const zf = X => 7.5 - 0.109 * (X - 16);                              // front line of the podium = edge of the terrace (L coordinates)
  const PF0 = [16, zf(16)], PF1 = [63.4, zf(63.4)], kF = dist(PF0, PF1) / (63.4 - 16), xf = X => (X - 16) * kF;     // front frame: x' = xf(X)
  const XG0 = 24, XG1 = 36, XP = 39, XE = 56, ZG = -1, XS = 58.4;     // glass front from XG0 to XG1, porch glass from XP to XE at Z = ZG, external stair from XS
  const MOS = lm('mosaic'), GL = lm('glassLib'), FR = lm('frame');
  // --- front line: tile wall, two-tier glass wall, terrace edge band
  along(v, PF0, PF1);
  v.slab(MOS, 0, 0, -0.3, xf(XG0), 7.0, 0.3, 'N'); v.slab(MOS, 0, 7.0, -0.3, xf(XS), 1.0, 0.3);
  v.slab(MW, xf(XG1), 6.88, -0.3, xf(XS) - xf(XG1), 0.12, 0.3);
  face(lm('frame'), 2.2, 3.2, 4.6, 6.4); face(lm('frame'), 4.6, 7.0, 4.7, 6.3); face('glassDark', 4.72, 6.88, 4.82, 6.18, 0.02);        // louvre and window on the tile wall (frames 29-30)
  { const x0 = xf(XG0), x1 = xf(XG1), w = x1 - x0, n = Math.round(w / 1.5), zq = -0.12;
    v.slab(lm('balu'), x0, 0, -0.25, w, F0, 0.25); v.slab(MOS, x0, 3.7, -0.3, w, 0.9, 0.3);
    v.quad(GL, [x0, F0, zq], [x1, F0, zq], [x1, 3.7, zq], [x0, 3.7, zq]); v.quad(GL, [x0, 4.6, zq], [x1, 4.6, zq], [x1, 7.0, zq], [x0, 7.0, zq]);
    for (let i = 0; i <= n; i++) { const x = x0 + w * i / n - 0.04; v.slab(FR, x, F0, -0.2, 0.08, 3.4, 0.14); v.slab(FR, x, 4.6, -0.2, 0.08, 2.4, 0.14); }
    for (const y of [3.1, 6.45]) v.slab(FR, x0, y, -0.18, w, 0.07, 0.1);
    v.quad(lm('plaster'), [x1, 3.7, -0.31], [x0, 3.7, -0.31], [x0, 4.6, -0.31], [x1, 4.6, -0.31]); }                   // inside of the band
  along(c, PF0, PF1); c.slab(G, 0, 0, -0.3, xf(XG1), 8, 0.3); home(c);
  // --- west flank of the podium, the fold of the glass wall, the porch glass with the doors, the tile wall east of it
  home(v); v.slab(MOS, 16, 0, 0, 0.3, 8.0, zf(16) - 0.05, 'E'); blockBox(16, 0, 16.3, zf(16), 0, 8);
  const FOLD0 = [XG1, zf(XG1) - 0.15], FOLD1 = [XP, ZG], DOOR = [45.6, 47.4];
  const glazing = (P, Q, gaps = []) => {                               // two tiers of glass with a tile band at the gallery floor, between P and Q (L coordinates)
    const len = along(v, P, Q), n = Math.max(1, Math.round(len / 1.4));
    v.slab(MOS, 0, 3.6, -0.12, len, 0.7, 0.24); v.slab(MW, 0, 7.0, -0.12, len, 0.3, 0.24);
    v.quad(GL, [0, 4.3, 0], [len, 4.3, 0], [len, 7.0, 0], [0, 7.0, 0]);
    let s = 0; for (const [g0, g1] of [...gaps, [len, len]]) { if (g0 > s) v.quad(GL, [s, F0, 0], [g0, F0, 0], [g0, 3.6, 0], [s, 3.6, 0]); if (g1 > g0) v.quad(GL, [g0, 2.5, 0], [g1, 2.5, 0], [g1, 3.6, 0], [g0, 3.6, 0]); s = g1; }
    for (let i = 0; i <= n; i++) { const x = len * i / n; v.slab(FR, x - 0.04, 4.3, -0.07, 0.08, 2.7, 0.14); if (!gaps.some(([g0, g1]) => x > g0 - 0.1 && x < g1 + 0.1)) v.slab(FR, x - 0.04, F0, -0.07, 0.08, 3.3, 0.14); }
    v.slab(FR, 0, 6.45, -0.06, len, 0.07, 0.12); v.slab(FR, 0, 3.1, -0.06, len, 0.07, 0.12);
    along(c, P, Q); s = 0; for (const [g0, g1] of [...gaps, [len, len]]) { if (g0 > s) c.slab(G, s, 0, -0.12, g0 - s, 7.3, 0.24); if (g1 > g0) c.slab(G, g0, 2.5, -0.12, g1 - g0, 4.8, 0.24); s = g1; }
    home(c); home(v);
  };
  glazing(FOLD0, FOLD1); glazing([XP, ZG], [XE, ZG], [[DOOR[0] - XP, DOOR[1] - XP]]);
  for (const x of DOOR) { v.slab(FR, x - 0.04, F0, ZG - 0.07, 0.08, 2.25, 0.14); fx.quad(lm('glassRail'), [x, F0 + 0.03, ZG - 0.9], [x, F0 + 0.03, ZG], [x, 2.45, ZG], [x, 2.45, ZG - 0.9]);       // door leaves standing open
    for (const s of [-0.03, 0.03]) fx.slab(STL, x + s - 0.015, F0 + 0.5, ZG - 0.82, 0.03, 1.5, 0.03); }
  v.slab(FR, DOOR[0], 2.45, ZG - 0.06, DOOR[1] - DOOR[0], 0.07, 0.12);
  { const xe = LD[0] + 0.2; v.slab(MOS, XE, 0, ZG - 0.25, xe - XE, F3, 0.25, 'N'); blockBox(XE, ZG - 0.25, xe, ZG, 0, F3);
    cap(v, MW, [[XS, ZG], [xe, ZG], [LD[0], 0], [XS, 0]], F3 - 0.01, false);                                 // underside of the upper storeys over the stair
    face(MW, XE + 0.7, XE + 1.7, F0, F0 + 2.1, ZG + 0.012); }
  // --- terrace: deck, railings, the three pale rectangles, the void at the east end of storeys 3 and 4
  const TER = [[16, 0], [16, zf(16)], [XS, zf(XS)], [XS, 0], [VOID_S[1], 0], [VOID_S[1], -8], [VOID_S[0], -8], [VOID_S[0], 0]];
  cap(v, 'floorGrey', TER, F3 + 0.004, true); cap(c, G, TER, F3, true);
  for (const [x0, x1] of [[20, 27], [29, 36], [38, 44]]) cap(v, 'roofPale', rounded([[x0, 1.4], [x1, 1.4], [x1, zf(x1) - 1.4], [x0, zf(x0) - 1.4]], 0.6, 3), F3 + 0.02, true);
  cap(v, MW, [[XP, ZG], [XS, ZG], [XS, zf(XS) - 0.3], [XG1, zf(XG1) - 0.3]], 6.88, false);                // soffit over the porch
  rail(v, [16.1, 0.1], [16.1, zf(16) - 0.1], F3, F3); rail(v, [16.1, zf(16.1) - 0.12], [XS, zf(XS) - 0.12], F3, F3);
  rail(v, [XS, zf(XS) - 0.12], [XS, 2.0], F3, F3); rail(v, [XS, 0.7], [XS, 0.05], F3, F3);
  block([16.1, 0.1], [16.1, zf(16)], F3, F3 + 1.3, 0.1); block([16.1, zf(16.1) - 0.1], [XS, zf(XS) - 0.1], F3, F3 + 1.3, 0.1); block([XS, zf(XS)], [XS, 2.0], F3, F3 + 1.3, 0.1); block([XS, 0.7], [XS, 0], F3, F3 + 1.3, 0.1);
  { const [x0, x1] = VOID_S, R = TERR, yt = F3 + 2 * FH - 0.5;
    v.quad(R, [x0, F3, 0], [x0, F3, -8], [x0, yt, -8], [x0, yt, 0]); v.quad(R, [x1, F3, -8], [x1, F3, 0], [x1, yt, 0], [x1, yt, -8]);
    v.quad(R, [x0, yt, -8], [x1, yt, -8], [x1, yt, -T], [x0, yt, -T]); v.slab(TERR, x0, yt, -T, x1 - x0, 0.5, T, 'N');
    blockBox(x0 - 0.3, -8, x0, 0, F3, F3 + 2 * FH); blockBox(x1, -8, x1 + 0.3, 0, F3, F3 + 2 * FH);
    blockBox(16.3, -0.3, x0, 0, F3, H); blockBox(x1, -0.3, LS, 0, F3, H); blockBox(x0, -0.3, x1, 0, F3 + 2 * FH, H); }                                    // the south face itself, for someone on the terrace
  // --- porch: platform two steps above the plaza, columns, soffit
  const PORCH = [[XP, ZG], [LD[0] + 0.6, ZG], [LD[0] + 0.6, zf(LD[0] + 0.6) + 1.6], [XG1, zf(XG1) + 1.6], FOLD0];
  cap(v, 'floorGrey', PORCH, F0 + 0.002, true); ringQuads(v, lm('stone'), PORCH, 0, F0, false); cap(c, G, PORCH, F0, true); ringQuads(c, G, PORCH, 0, F0, false);
  along(v, PF0, PF1); v.slab(lm('stone'), xf(XG1), 0, 1.6, xf(LD[0] + 0.6) - xf(XG1) + 0.4, 0.15, 0.4);
  along(c, PF0, PF1); { const x0 = xf(XG1), x1 = xf(LD[0] + 0.6); plate(c, G, [[x0, F0, 1.6], [x0, 0, 2.2], [x1, 0, 2.2], [x1, F0, 1.6]], 0.1); } home(c);
  home(v); { const xe = LD[0] + 0.6, z1 = zf(xe) + 1.6; v.slab(lm('stone'), xe, 0, ZG, 0.4, 0.15, z1 - ZG + 0.4); plate(c, G, [[xe, F0, ZG], [xe, F0, z1], [xe + 0.6, 0, z1], [xe + 0.6, 0, ZG]], 0.1); }
  const column = (b, X, Z, y0, y1, r = 0.42, flare = 0) => {           // white round column; flare > 0 widens the head into the slab above (frames 31, 37, 43)
    at(b, X, Z); b.cyl(MW, 0, y0, 0, r, y1 - y0 - flare, 14, false);
    if (flare) lathe(b, MW, 0, 0, [[r, y1 - flare], [r * 1.25, y1 - flare * 0.62], [r * 1.9, y1 - flare * 0.28], [r * 3.2, y1 - 0.02], [r * 3.3, y1]], 14);
    home(b); at(c, X, Z); c.box(G, 0, (y0 + y1) / 2, 0, r * 1.7, y1 - y0, r * 1.7); home(c);
  };
  for (const X of [41.5, 51.5]) column(v, X, zf(X) - 0.75, F0, 6.88);
  for (const X of [59.2, 63.1]) column(v, X, 4.0, F0, 7.3, 0.4);
  home(v); v.slab(MW, XS - 0.3, 7.3, 3.4, LD[0] + 0.9 - XS, 0.5, 1.0);                                       // beam on the two tall columns beside the stair
  // --- second-floor walkway on columns with flared heads (frame 31)
  const WX0 = 39.6, WZ1 = 2.0;
  v.slab(MW, WX0, F2 - 0.45, ZG, XS - WX0, 0.43, WZ1 - ZG); v.slab('floorGrey', WX0, F2 - 0.02, ZG, XS - WX0, 0.02, WZ1 - ZG, 'D');
  v.slab(MOS, WX0, F2 - 0.7, WZ1, XS - WX0 - 1.4, 0.8, 0.1); v.slab(MOS, WX0 - 0.1, F2 - 0.7, ZG + 0.15, 0.1, 0.8, WZ1 - ZG - 0.05);
  rail(v, [WX0, WZ1 + 0.05], [XS - 1.4, WZ1 + 0.05], F2, F2); rail(v, [WX0 - 0.05, ZG + 0.2], [WX0 - 0.05, WZ1], F2, F2);
  plate(c, G, [[WX0, F2, ZG], [WX0, F2, WZ1], [XS, F2, WZ1], [XS, F2, ZG]], 0.3);
  block([WX0, WZ1], [XS - 1.4, WZ1], F2, F2 + 1.3, 0.1); block([WX0, ZG], [WX0, WZ1], F2, F2 + 1.3, 0.1);
  for (const X of [43.5, 54]) column(v, X, WZ1 - 0.5, F0, F2 - 0.45, 0.33, 0.9);
  // --- external stair at the east end (frames 26, 31, 32): four flights along the front, landings at the east
  { const ST = lm('stairDark'), BA = lm('balu'), zn = [0.7, 2.0], zs = [2.0, 3.3], xe = XS + 5.0, R = 0.15, TR = 0.28;
    const flight = (x0, y0, dir, n, [z0, z1]) => {                    // n risers going east (dir 1) or west (-1) from x0, y0
      const x1 = x0 + dir * n * TR, y1 = y0 + n * R, xa = Math.min(x0, x1), xb = Math.max(x0, x1), ya = dir > 0 ? y0 : y1, yb = dir > 0 ? y1 : y0;
      for (let i = 0; i < n; i++) v.slab(ST, dir > 0 ? x0 + i * TR : x0 - (i + 1) * TR, y0 + i * R - 0.12, z0 + 0.06, TR, R + 0.12, z1 - z0 - 0.12);
      for (const z of [z0, z1]) { wallQuad(v, BA, [xa, z], [xb, z], [ya - 0.3, yb - 0.3], [ya + 0.35, yb + 0.35], [xa, z + 9]); wallQuad(v, BA, [xa, z], [xb, z], [ya - 0.3, yb - 0.3], [ya + 0.35, yb + 0.35], [xa, z - 9]); }
      rail(v, [xa, z0], [xb, z0], ya + 0.35, yb + 0.35, 0.65); rail(v, [xa, z1], [xb, z1], ya + 0.35, yb + 0.35, 0.65);
      plate(c, G, [[xa, ya, z0], [xa, ya, z1], [xb, yb, z1], [xb, yb, z0]], 0.15);
      return x1;
    };
    const landing = (x0, x1, y, z0 = zn[0], z1 = zs[1]) => { v.slab(ST, x0, y - 0.15, z0, x1 - x0, 0.15, z1 - z0); plate(c, G, [[x0, y, z0], [x0, y, z1], [x1, y, z1], [x1, y, z0]], 0.15); };
    const ym1 = F0 + 13 * R, ym2 = F2 + 12 * R;
    const a = flight(XS, F0, 1, 13, zs); landing(a, xe, ym1); flight(a, ym1, -1, 13, zn);
    landing(XS - 1.4, XS, F2, zs[0], zs[1]);
    const e = flight(XS, F2, 1, 12, zs); landing(e, xe, ym2); flight(e, ym2, -1, 12, zn);
    // red-brown base and balustrades of the landings, railings on top
    v.slab(BA, a, 0, zn[0], xe - a, ym1 - 0.15, zs[1] - zn[0], 'U');
    for (const y of [ym1, ym2]) { const x0 = y === ym1 ? a : e; wallQuad(v, BA, [xe, zn[0]], [xe, zs[1]], y - 0.3, y + 0.35, [xe + 9, 1]); wallQuad(v, BA, [xe, zn[0]], [xe, zs[1]], y - 0.3, y + 0.35, [xe - 9, 1]);
      rail(v, [xe, zn[0]], [xe, zs[1]], y + 0.35, y + 0.35, 0.65); rail(v, [x0, zs[1]], [xe, zs[1]], y + 0.35, y + 0.35, 0.65); rail(v, [x0, zn[0]], [xe, zn[0]], y + 0.35, y + 0.35, 0.65); }
    rail(v, [XS - 1.4, zs[0] + 0.05], [XS - 1.4, zs[1]], F2, F2); rail(v, [XS - 1.4, zs[1]], [XS, zs[1]], F2, F2);
    rail(v, [XS, zn[0]], [xe, zn[0]], F3, F3); rail(v, [XS, zs[1]], [xe, zs[1]], F3, F3); rail(v, [xe, zn[0]], [xe, zs[1]], F3, F3);       // round the stair well at terrace level
    v.slab(BA, XS - 0.1, F0, zn[0], 0.1, F2 - 0.45 - F0, zn[1] - zn[0]);                                               // closes the space under the top of the second flight
    blockBox(XS, zn[0] - 0.1, xe, zn[0], F0, F3 + 1.3); blockBox(XS, zs[1], xe, zs[1] + 0.1, F0, F3 + 1.3); blockBox(xe, zn[0], xe + 0.1, zs[1], F0, F3 + 1.3);
    blockBox(XS, zn[1] - 0.05, e, zn[1] + 0.05, F0, F3 + 1.3); blockBox(XS - 0.1, zn[0], XS, zn[1], F0, F2 - 0.3);
    // the east end of the walkway between the glass wall and the stair's north flank was open: a 3.9 m drop to the porch
    blockBox(XS, ZG, XS + 0.1, zn[0], F2, F2 + 1.6); rail(v, [XS + 0.05, ZG + 0.1], [XS + 0.05, zn[0] - 0.1], F2, F2);
    blockBox(XS - 1.5, zs[0], XS - 1.4, zs[1], F2, F2 + 1.3); blockBox(XS - 1.4, zs[1], XS, zs[1] + 0.1, F2, F2 + 1.3); blockBox(a, zn[0], xe, zs[1], F0, ym1 - 0.2); }

  // ================================================================= LIBRARY SHELL (always drawn, so the glass never shows an empty building)
  const HALL = [[XG0, zf(XG0) - 0.3], [XG1, zf(XG1) - 0.3], [XP, ZG - 0.1], [XE, ZG - 0.1], [XE, -19.1], [45.5, -33.4], [XG0, -21.9]];
  const hallC = [38, -12], LDOOR = [-18.4, -17.2];                     // LDOOR: the door in the west wall that leads to the stair hall
  // opening in the gallery floor: from the east wall round to the top of the stair (an open path), rounded at three corners
  const SX0 = 51, SZ0 = -7, SZ1 = -14.8;                               // indoor stair: between SX0 and the east wall, foot at SZ0, top at SZ1
  const Vs1 = [XE, -6], Vs2 = [30, -6], Vw = [26.5, -17.5], Vn = [43.5, -27.2], Vne = [SX0, SZ1];
  const voidPath = [Vs1, ...fillet(Vs1, Vs2, Vw, 2.5, 5), ...fillet(Vs2, Vw, Vn, 2.5, 5), ...fillet(Vw, Vn, Vne, 3, 6), Vne];
  const VOIDP = [...voidPath, [XE, SZ1]], voidC = [40, -15];
  const GAL = [HALL[0], HALL[1], HALL[2], HALL[3], ...voidPath, [XE, SZ1], HALL[4], HALL[5], HALL[6]];
  const SKY = LWELL.map(p => lerp(wellC, p, 0.85));                   // opening of the skylight in the ceiling, under the light well
  cap(v, 'floorGrey', HALL, F0, true); cap(c, G, HALL, F0, true);
  cap(v, 'floorGrey', GAL, F2, true); cap(v, lm('ceil'), GAL, CEIL1, false); cap(c, G, GAL, F2, true); cap(c, G, GAL, CEIL1, false);
  cap(v, lm('ceil'), GAL, CEIL2, false); cap(v, lm('plaster'), VOIDP, CEIL2, false, [SKY]);
  ringQuads(v, lm('plaster'), SKY, CEIL2, 8.5, true); cap(v, lm('cove'), SKY, 8.5, false);
  ringQuads(v, lm('cove'), SKY.map(p => lerp(wellC, p, 0.997)), CEIL2 + 0.03, CEIL2 + 0.15, true);                  // light cove round the skylight (frames 37-38)
  for (let i = 3; i < 6; i++) { const P = HALL[i], Q = HALL[(i + 1) % 7]; wallQuad(v, lm('plaster'), P, Q, F0, CEIL2, hallC); block(P, Q, 0, CEIL2 + 0.3, 0.3); }
  { const P = HALL[6], Q = HALL[0], PL = lm('plaster');                // west wall: a door to the stair hall on each level (imagined)
    wallQuad(v, PL, P, [XG0, LDOOR[0]], F0, CEIL2, hallC); wallQuad(v, PL, [XG0, LDOOR[1]], Q, F0, CEIL2, hallC); wallQuad(v, PL, [XG0, LDOOR[0]], [XG0, LDOOR[1]], F0 + 2.2, F2, hallC); wallQuad(v, PL, [XG0, LDOOR[0]], [XG0, LDOOR[1]], F2 + 2.2, CEIL2, hallC);
    block(P, [XG0, LDOOR[0]], 0, CEIL2 + 0.3, 0.3); block([XG0, LDOOR[1]], Q, 0, CEIL2 + 0.3, 0.3); }
  for (let i = 0; i < voidPath.length - 1; i++) {                     // edge of the gallery: white band and solid parapet (frames 36-38), light cove under it
    const P = voidPath[i], Q = voidPath[i + 1], out = add(lerp(P, Q, 0.5), sub(lerp(P, Q, 0.5), voidC));
    wallQuad(v, lm('plaster'), P, Q, CEIL1, F2 + 1.05, voidC); wallQuad(v, lm('plaster'), P, Q, F2, F2 + 1.05, out); wallQuad(v, lm('cove'), P, Q, CEIL1 + 0.02, CEIL1 + 0.12, voidC, 0.01);
    bar(v, lm('plaster'), [P[0], F2 + 1.05, P[1]], [Q[0], F2 + 1.05, Q[1]], 0.05, 0.16);
    const len = along(c, P, Q); c.slab(G, 0, F2, -0.06, len, 1.25, 0.12); home(c);
  }

  // ================================================================= LIBRARY INTERIOR (drawn when the viewer is near)
  // --- stair: 26 risers along the east wall, seating tiers on its west part, glass balustrade (frames 35-38)
  { const n = 26, R = (F2 - F0) / n, TR = (SZ0 - SZ1) / n, ST = lm('stairDark'), xt = SX0 + 2.0, PL = lm('plaster');
    for (let i = 0; i < n; i++) iv.slab(ST, xt, F0 + i * R - 0.02, SZ0 - (i + 1) * TR, XE - xt, R + 0.02, TR, 'DEW');
    for (let i = 0; i < n / 2; i++) { iv.slab(ST, SX0, F0 + 2 * i * R, SZ0 - (i + 1) * 2 * TR, xt - SX0, 2 * R, 2 * TR, 'DW');
      if (i % 3 === 1) fx.slab(lm('tier'), SX0 + 0.3, F0 + (2 * i + 2) * R, SZ0 - (i + 1) * 2 * TR + 0.08, 1.3, 0.07, 2 * TR - 0.16, 'D'); }
    wallQuad(iv, PL, [SX0, SZ0], [SX0, SZ1], F0, [F0 + 0.12, F2 + 0.12], [0, SZ0]);                                   // white flank toward the hall
    wallQuad(iv, lm('glassRail'), [SX0, SZ0], [SX0, SZ1], [F0 + 0.12, F2 + 0.12], [F0 + 1.15, F2 + 1.15], [0, SZ0]);
    bar(iv, STL, [SX0, F0 + 1.15, SZ0], [SX0, F2 + 1.15, SZ1], 0.05); bar(iv, STL, [SX0, F0, SZ0], [SX0, F0 + 1.15, SZ0], 0.05);
    wallQuad(iv, PL, [SX0, SZ1], [XE, SZ1], F0, CEIL1, [SX0, SZ1 - 9]);                                                // closed under the top of the stair
    bar(fx, lm('lamp'), [XE - 0.03, F0 + 1.9, SZ0 + 0.5], [XE - 0.03, F2 + 1.9, SZ1 + 0.5], 0.05, 0.03);               // sloping light line on the wall (frame 36)
    plate(c, G, [[SX0, F2, SZ1], [SX0, F0, SZ0], [XE, F0, SZ0], [XE, F2, SZ1]], 0.2);
    for (const side of [-9, 9]) wallQuad(c, G, [SX0, SZ0], [SX0, SZ1], F0, [F0 + 1.2, F2 + 1.3], [SX0 + side, SZ0]);
    blockBox(SX0, SZ1 - 0.2, XE, SZ1, F0, CEIL1); }
  // --- columns flaring into the ceilings, a ring of light round each head (frames 37, 38, 43, 50)
  for (const [X, Z] of [[38.6, -4.6], [52.5, -3.3], [30.0, -3.2], [33.8, 1.2], [26.6, -5.5], [31.85, -23.15], [40.05, -27.53], [51.5, -19.6]]) for (const [y0, y1] of [[F0, CEIL1], [F2, CEIL2]]) {
    column(iv, X, Z, y0, y1, 0.36, 1.25); at(fx, X, Z); ringTop(fx, lm('lamp'), 0, 0, 1.3, 1.37, 0, 2 * Math.PI, y1 - 0.015, 20, false); home(fx);
  }
  // --- triangulated beams of the skylight with a downlight at every node (frames 37-39)
  { const P = lm('plaster'), s = 2.9, h = s * Math.sqrt(3) / 2, o = [26, -27], yb = 8.02, nodes = [];
    const clip = (p, q) => { const pts = []; for (let i = 0; i <= 60; i++) { const t = lerp(p, q, i / 60); if (inside(t, SKY)) pts.push(t); } return pts.length > 1 ? [pts[0], pts[pts.length - 1]] : null; };
    for (let j = -2; j < 9; j++) { const z = o[1] + j * h, seg = clip([20, z], [56, z]); if (seg) bar(iv, P, [seg[0][0], yb, seg[0][1]], [seg[1][0], yb, seg[1][1]], 0.45, 0.2); }
    for (const dir of [1, -1]) for (let i = -6; i < 22; i++) { const x = o[0] + i * s, seg = clip([x, o[1]], [x + dir * 14 * s / 2, o[1] + 14 * h]) ; if (seg) bar(iv, P, [seg[0][0], yb, seg[0][1]], [seg[1][0], yb, seg[1][1]], 0.45, 0.2); }
    for (let j = -2; j < 9; j++) for (let i = -6; i < 16; i++) { const t = [o[0] + i * s + (j % 2 ? s / 2 : 0), o[1] + j * h]; if (inside(t, SKY)) nodes.push(t); }
    for (const [x, z] of nodes) { fx.cyl(MW, x, yb - 0.38, z, 0.17, 0.16, 10, false); ringTop(fx, lm('lamp'), x, z, 0.01, 0.15, 0, 2 * Math.PI, yb - 0.375, 10, false); } }
  // --- downlights in the two flat ceilings
  for (const [y, poly] of [[CEIL1, GAL], [CEIL2, GAL]]) for (let X = 25.5; X < 56; X += 3) for (let Z = -32; Z < 6; Z += 3) {
    if (inside([X, Z], poly) && inside([X + 0.6, Z], poly) && inside([X - 0.6, Z], poly) && inside([X, Z + 0.6], poly) && inside([X, Z - 0.6], poly)) fx.quad(lm('lamp'), [X - 0.09, y - 0.012, Z - 0.09], [X + 0.09, y - 0.012, Z - 0.09], [X + 0.09, y - 0.012, Z + 0.09], [X - 0.09, y - 0.012, Z + 0.09]);
  }

  // ----------------------------------------------------------------- furniture
  const BK = lm('books'), WL = lm('woodLight'), PAPER = C(0xe9e3d2), CLOTH = C(0x5d544a), ROW = 0.4, bkr = rng(1234);
  /**
   * A row of books standing on a board, in the current frame of b: x along the shelf, the spines look toward +z (dir 1) or
   * -z (dir -1). The row is made of runs of books; each run is a small block of its own height and depth whose front shows
   * a piece of one band of the spine texture, so the tops step up and down and some runs stand further back.
   */
  const bookRow = (b, x0, x1, y, zFront, dir, maxH) => {
    let x = x0 + 0.01;
    while (x < x1 - 0.07) {
      if (bkr() < 0.07) { x += 0.05 + bkr() * 0.22; continue; }                                    // a gap on the shelf
      const w = Math.min(x1 - 0.01 - x, 0.1 + bkr() * 0.42), h = Math.min(maxH, 0.19 + bkr() * 0.12), dp = 0.13 + bkr() * 0.07, zf = zFront - dir * bkr() * 0.03, zb = zf - dir * dp;
      const band = Math.floor(bkr() * BOOK_BANDS), u0 = bkr() * BOOK_U, v0 = 1 - (band + 1) / BOOK_BANDS + 0.004, v1 = 1 - band / BOOK_BANDS - 0.004;
      if (dir > 0) { texQuad(b, BK, [x, y, zf], [x + w, y, zf], [x + w, y + h, zf], [x, y + h, zf], u0, v0, u0 + w, v1); b.quad(PAPER, [x, y + h, zf], [x + w, y + h, zf], [x + w, y + h, zb], [x, y + h, zb]); }
      else { texQuad(b, BK, [x + w, y, zf], [x, y, zf], [x, y + h, zf], [x + w, y + h, zf], u0, v0, u0 + w, v1); b.quad(PAPER, [x + w, y + h, zf], [x, y + h, zf], [x, y + h, zb], [x + w, y + h, zb]); }
      b.box(CLOTH, x + w / 2, y + h / 2, (zf + zb) / 2, w, h, dp, 'UDSN');
      x += w;
    }
  };
  /** Bookcase in the current frames of b (carcass and books) and bl (strip lights; may be null): its length along x, centred on the origin; books on both faces unless oneSided (then they look toward +z). */
  const bookcase = (b, bl, len, rows = 5, oneSided = false, pitch = ROW) => {
    const h = 0.1 + rows * pitch + 0.04, d = oneSided ? 0.34 : 0.6, nb = Math.max(1, Math.round(len / 0.9)), LMP = lm('lamp');
    b.box(WL, 0, 0.05, 0, len, 0.1, d - 0.06, 'D'); b.box(WL, 0, h - 0.02, 0, len + 0.02, 0.04, d + 0.02);                         // plinth and top
    for (let i = 0; i <= nb; i++) b.box(WL, -len / 2 + 0.015 + (len - 0.03) * i / nb, h / 2 + 0.03, 0, 0.03, h - 0.1, d, 'UD');     // uprights
    b.box(WL, 0, h / 2 + 0.03, oneSided ? -d / 2 + 0.012 : 0, len - 0.04, h - 0.1, 0.02, 'UDEW');                                   // back board
    for (let r = 0; r < rows; r++) {
      const yb = 0.1 + r * pitch; if (r) b.box(WL, 0, yb - 0.011, 0, len - 0.04, 0.022, d - 0.02, 'EW');
      for (const dir of oneSided ? [1] : [1, -1]) {
        for (let i = 0; i < nb; i++) bookRow(b, -len / 2 + 0.03 + (len - 0.03) * i / nb, -len / 2 + (len - 0.03) * (i + 1) / nb, yb, dir * (d / 2 - 0.035), dir, pitch - 0.06);
        if (bl && !low) bl.box(LMP, 0, yb + pitch - 0.026, dir * (d / 2 - 0.03), len - 0.12, 0.008, 0.014, 'UEW');                  // strip light under the board above
      }
    }
    return [h, d];
  };
  /** Bookcase of the library standing at (X, Z), its length along the direction yaw. Collides. */
  const shelf = (X, Z, yaw, len, rows = 5, oneSided = false, y = F0, pitch = ROW) => {
    at(fu, X, Z, yaw, y); at(fx, X, Z, yaw, y); const [h, d] = bookcase(fu, fx, len, rows, oneSided, pitch);
    home(fu); home(fx); at(c, X, Z, yaw, y); c.box(G, 0, h / 2, 0, len, h, d); home(c);
  };
  /** Upholstered armchair on wooden legs, facing the direction yaw (0 = local +X). */
  const chair = (X, Z, yaw, col, y = F0, k = 1) => {
    at(fu, X, Z, yaw, y); const m = lm(col);
    fu.box(m, 0, 0.42 * k, 0, 0.5 * k, 0.13, 0.52 * k, 'D'); fu.box(m, -0.24 * k, 0.7 * k, 0, 0.1, 0.5 * k, 0.52 * k, 'D');
    for (const s of [-1, 1]) { fu.box(m, -0.03, 0.57 * k, s * 0.27 * k, 0.42 * k, 0.2, 0.06, 'D'); for (const e of [-1, 1]) fu.box(lm('woodLight'), e * 0.19 * k, 0.18 * k, s * 0.2 * k, 0.04, 0.36 * k, 0.04, 'UD'); }
    home(fu);
  };
  /** Table with panel legs; chairs on both long sides; lamp = bar lamp on two brass posts (frames 50-53). */
  const table = (X, Z, yaw, len, wid, seats, cols, y = F0, lamp = false) => {
    at(fu, X, Z, yaw, y); fu.box(lm('tableTop'), 0, 0.735, 0, len, 0.05, wid);
    for (const s of len > 3 ? [-1, 0, 1] : [-1, 1]) fu.box(lm('tableTop'), s * (len / 2 - 0.15), 0.355, 0, 0.05, 0.71, wid - 0.2, 'UD');
    if (lamp) { at(fx, X, Z, yaw, y); for (const s of [-1, 1]) fx.cyl(lm('brass'), s * len * 0.3, 0.76, 0, 0.022, 0.5, 6, false); fx.box(lm('brass'), 0, 1.27, 0, len * 0.6 + 0.06, 0.035, 0.045); fx.box(lm('lamp'), 0, 1.248, 0, len * 0.6 - 0.1, 0.012, 0.03); home(fx); }
    home(fu); at(c, X, Z, yaw, y); c.box(G, 0, 0.4, 0, len, 0.8, wid); home(c);
    const co = Math.cos(yaw), si = Math.sin(yaw);
    for (let i = 0; i < seats; i++) for (const s of [-1, 1]) {
      const lx = -len / 2 + len * (i + 0.5) / seats, lz = s * (wid / 2 + 0.38);
      chair(X + lx * co + lz * si, Z - lx * si + lz * co, yaw + (s > 0 ? Math.PI / 2 : -Math.PI / 2), cols[(i + (s > 0 ? 1 : 0)) % cols.length], y);
    }
  };
  /** Round reading pod: a ring of counter open on one side, chairs inside facing the counter, brass posts and rail round the inner edge (frames 40-41). */
  const pod = (X, Z, gap, cols) => {
    const r0 = 1.45, r1 = 2.45, a0 = gap + 0.45, a1 = gap + 2 * Math.PI - 0.45, TT = lm('tableTop'), PL = lm('plaster'), BR = lm('brass');
    at(fu, X, Z, 0, F0); ringTop(fu, TT, 0, 0, r0, r1, a0, a1, 0.76, 20); ringWall(fu, PL, 0, 0, r1, a0, a1, 0, 0.76, 20, true); ringWall(fu, PL, 0, 0, r1 - 0.04, a0, a1, 0, 0.72, 20, false);
    ringWall(fu, TT, 0, 0, r0, a0, a1, 0.7, 0.76, 20, false);
    for (const a of [a0, a1]) { const p = [Math.cos(a), Math.sin(a)]; wallQuad(fu, PL, mul(p, r0 + 0.5), mul(p, r1), 0, 0.76, [Math.cos(gap) * 3, Math.sin(gap) * 3]); }
    home(fu); at(fx, X, Z, 0, F0);
    const np = 11; let prev = null;
    for (let i = 0; i <= np; i++) { const a = a0 + 0.05 + (a1 - a0 - 0.1) * i / np, p = [(r0 + 0.07) * Math.cos(a), 1.12, (r0 + 0.07) * Math.sin(a)];
      fx.cyl(BR, p[0], 0.76, p[2], 0.018, 0.36, 6, false); if (prev) bar(fx, BR, prev, p, 0.022); prev = p; }
    home(fx);
    for (let i = 0; i < 4; i++) { const a = a0 + 0.5 + (a1 - a0 - 1.0) * i / 3; chair(X + 0.86 * Math.cos(a), Z + 0.86 * Math.sin(a), -a, cols[i % cols.length]); }
    at(c, X, Z, 0, F0); c.box(G, 0, 0.5, 0, 3.5, 1.0, 3.5); home(c);
  };
  const plant = (b, X, Z, y = F0, k = 1) => { at(b, X, Z, 0, y); b.cyl(MW, 0, 0, 0, 0.15 * k, 0.42 * k, 8); lathe(b, lm('leaf'), 0, 0, [[0.04, 0.4], [0.24, 0.55], [0.3, 0.8], [0.2, 1.05], [0.02, 1.2]].map(([r, h]) => [r * k, h * k]), 7); home(b); };

  const GRN = ['chairGreen', 'chairBeige', 'chairGreen', 'chairCream'], BEI = ['chairBeige', 'chairDark', 'chairBeige'];
  // ground floor
  pod(34.6, -11.0, 2.26, GRN); pod(39.2, -12.4, 0.69, GRN); pod(35.4, -15.7, -2.45, GRN); pod(40.0, -17.0, -0.86, GRN);
  for (const [X, Z, yaw] of [[33.5, -7.6, 0], [38.5, -7.6, 0], [44.5, -10.5, Math.PI / 2], [44.9, -16.5, Math.PI / 2], [30.3, -13.5, 1.27]]) shelf(X, Z, yaw, 3.4, 3, false, F0, 0.38);   // low shelves round the island
  // shelf wall with two black alcoves along the north-west wall, tables in front (frame 36)
  const NW0 = HALL[6], NW1 = HALL[5], nwLen = dist(NW0, NW1), nwDir = unit(sub(NW1, NW0)), nwIn = [-nwDir[1], nwDir[0]], nwYaw = Math.atan2(-nwDir[1], nwDir[0]);
  const onNW = (s, off) => add(add(NW0, mul(nwDir, s)), mul(nwIn, off));
  const shelfWall = (y, parts, rows) => {
    for (const [s0, s1, kind] of parts) {
      const mid = onNW((s0 + s1) / 2, 0.2);
      if (kind === 'shelf') shelf(mid[0], mid[1], nwYaw, s1 - s0, rows, true, y);
      else { along(fu, onNW(s0, 0), onNW(s1, 0), y); const w = s1 - s0, door = kind === 'door';
        fu.slab(lm('plaster'), 0, 0, 0.0, w, 0.1 + rows * ROW + 0.04, 0.34, 'N');
        const q = (m, x0, x1, y0, y1, z) => fu.quad(m, [x0, y0, z], [x1, y0, z], [x1, y1, z], [x0, y1, z]);
        if (door) q(lm('alcove'), w / 2 - 0.5, w / 2 + 0.5, 0, 2.1, 0.345); else q(lm('alcove'), 0.14, w - 0.14, 0.45, 2.15, 0.345);
        if (door) q(lm('plaster'), w / 2 - 0.46, w / 2 + 0.46, 0, 2.06, 0.35);
        home(fu); }
    }
    block(onNW(0, 0.2), onNW(nwLen, 0.2), y, y + 2.5, 0.4);
  };
  shelfWall(F0, [[0.6, 5.2, 'shelf'], [5.2, 8.4, 'alcove'], [8.4, 11.2, 'shelf'], [11.2, 14.4, 'alcove'], [14.4, 23.6, 'shelf']], 6);
  shelfWall(F2, [[0.6, 7, 'shelf'], [7, 8.6, 'door'], [8.6, 12.6, 'shelf'], [12.6, 15.8, 'alcove'], [15.8, 20, 'shelf'], [20, 21.6, 'door'], [21.6, 23.6, 'shelf']], 5);
  for (const s of [4.5, 10.5, 13.6]) { const p = onNW(s, 2.7); table(p[0], p[1], nwYaw, 1.7, 0.9, 2, BEI); }
  // rows of tall shelves on the west side, armchairs at their ends (frames 43-45)
  for (const Z of [3.6, 0.6, -2.4]) shelf(26.4, Z, 0, 3.6);
  for (const Z of [-9.0, -12.0]) shelf(26.0, Z, 0, 3.0);
  for (const [X, Z, yaw] of [[29.1, 2.2, Math.PI], [29.1, 0.2, Math.PI], [28.6, -10.5, Math.PI]]) chair(X, Z, yaw, 'chairCream', F0, 1.25);
  // long lamp tables at the south windows, round desk beside the doors, gates, plants, rope posts at the stair (frames 35-36, 42, 50)
  table(32.6, 3.5, aTan(zf), 4.6, 1.0, 4, GRN, F0, true);
  { const X = 42.6, Z = -3.9, a0 = 0.6, a1 = Math.PI + 1.6; at(fu, X, Z, 0, F0); ringWall(fu, lm('chairBeige'), 0, 0, 1.5, a0, a1, 0, 1.0, 16, true); ringWall(fu, lm('plaster'), 0, 0, 1.1, a0, a1, 0, 1.0, 16, false); ringTop(fu, lm('plaster'), 0, 0, 1.1, 1.55, a0, a1, 1.02, 16); home(fu);
    at(c, X, Z, 0, F0); c.box(G, 0, 0.5, 0, 2.7, 1.0, 2.7); home(c); }
  for (const X of [DOOR[0] - 0.25, DOOR[1] + 0.25]) fx.slab(MW, X - 0.05, F0, ZG - 2.6, 0.1, 1.5, 0.6);
  plant(fx, 50.3, -7.4, F0, 1.5); plant(fx, 49.6, -8.2); plant(fx, 39.6, -2.0, F0, 1.3);
  for (const X of [52.2, 54.8]) fx.cyl(STL, X, F0, SZ0 + 0.9, 0.03, 0.95, 6); bar(fx, C(0xc8201c), [52.2, F0 + 0.85, SZ0 + 0.9], [54.8, F0 + 0.85, SZ0 + 0.9], 0.04);
  // gallery level
  table(28.5, 3.4, aTan(zf), 4.6, 1.0, 4, GRN, F2, true); table(34.2, 2.6, aTan(zf), 4.6, 1.0, 4, BEI, F2, true);
  table(44.0, -3.2, 0, 4.4, 1.0, 4, GRN, F2, true); table(49.6, -3.2, 0, 4.4, 1.0, 4, BEI, F2, true);
  for (const [X, Z, yaw] of [[26.0, -1.5, Math.PI / 2], [26.0, -8.5, Math.PI / 2]]) shelf(X, Z, yaw, 3.4, 3, false, F2, 0.38);
  for (const [X, Z] of [[51.9, -23.75], [48.3, -28.65]]) shelf(X, Z, 2.204 + Math.PI, 3.4, 3, true, F2, 0.38);            // low shelves against the north-east wall
  for (const [X, Z, yaw] of [[54.6, -17.6, Math.PI], [54.6, -16.0, Math.PI], [26.3, -13.2, 0]]) chair(X, Z, yaw, 'chairCream', F2, 1.25);
  plant(fx, 55.2, -15.6, F2, 1.4); plant(fx, 24.8, -20.0, F2, 1.4);

  // ================================================================= STAIR CORE, HALLS AND CORRIDORS (all imagined)
  // Plan: the stair stands behind the western stack of balconies of the north-west face and comes out in the western roof
  // pavilion; its landings open onto those balconies. A lobby with two lifts lies inside of it. On the two library storeys
  // the lobby has a door from the garden (ground) and a door into the library hall (both levels). On storeys 3 to 6 the
  // lobby widens into a hall from which a corridor runs round the light well; rooms lie between the corridor and the faces.
  const uf = new Batch(); home(uf);                                   // fittings of halls, corridors and stair (shown within about 100 m)
  const WU = lm('wallUp'), CEU = lm('ceilUp'), TILE = lm('tile'), DADO = pbr('tiles', [0xe6e2d4, 4, 1.2, 0.36]), GD = lm('glassDoor'), GRL = lm('glassRail'), FRM = C(0x3a3f44, 'metal'), DOORC = C(0xb07a48, 'gloss'), DOORF = C(0x76502f, 'gloss'), LAMP = lm('lamp');
  const TRIM = [C(0x4f7396, 'gloss'), C(0x4f8a62, 'gloss'), C(0xc27a2c, 'gloss'), C(0x8a5aa0, 'gloss')];             // one colour per upper storey
  /**
   * Wall on P-Q (L coordinates) from y0 to y1 with rectangular holes [[a0, a1, h0, h1]...] (metres along it from P, heights above y0).
   * Face A looks toward the point `toward` and stands on the line; face B, if mB is given, stands `thick` behind it. Returns 1 if A looks to the right of P-Q.
   */
  const panelWall = (b, P, Q, y0, y1, holes, toward, mA, mB = null, thick = 0.2) => {
    const len = dist(P, Q), d = unit(sub(Q, P)), rt = [-d[1], d[0]], sg = dot(sub(toward, P), rt) > 0 ? 1 : -1, cuts = [0, len];
    for (const h of holes) cuts.push(Math.max(0, h[0]), Math.min(len, h[1]));
    cuts.sort((a, e) => a - e);
    const face = (m, a, e, ya, yb, off, s) => { if (e - a < 0.01 || yb - ya < 0.01) return; const p = add(add(P, mul(d, a)), mul(rt, off)), q = add(add(P, mul(d, e)), mul(rt, off));
      if (s > 0) b.quad(m, [p[0], ya, p[1]], [q[0], ya, q[1]], [q[0], yb, q[1]], [p[0], yb, p[1]]); else b.quad(m, [q[0], ya, q[1]], [p[0], ya, p[1]], [p[0], yb, p[1]], [q[0], yb, q[1]]); };
    for (let i = 0; i < cuts.length - 1; i++) {
      const a = cuts[i], e = cuts[i + 1], mid = (a + e) / 2, h = holes.find(q => mid > q[0] && mid < q[1]);
      for (const [m, off, s] of mB ? [[mA, 0, sg], [mB, -sg * thick, -sg]] : [[mA, 0, sg]]) { if (!h) face(m, a, e, y0, y1, off, s); else { face(m, a, e, y0, y0 + h[2], off, s); face(m, a, e, y0 + h[3], y1, off, s); } }
    }
    return sg;
  };
  /** Door set in the frame of b: x along the wall, the public side at +z * sg, the wall 0.2 m thick behind the line. type 'shut', 'open' (leaf swung into the room), 'lift', 'gap' (a cased opening). */
  const doorSet = (b, x, w, sg, type, uv) => {
    const hD = type === 'gap' ? 2.3 : 2.1, zc = -sg * 0.1, FM = type === 'lift' ? STL : type === 'gap' ? MW : DOORF;
    b.box(FM, x - 0.035, hD / 2, zc, 0.07, hD, 0.25, 'D'); b.box(FM, x + w + 0.035, hD / 2, zc, 0.07, hD, 0.25, 'D'); b.box(FM, x + w / 2, hD + 0.035, zc, w + 0.14, 0.07, 0.25);
    if (type === 'lift') {
      for (const i of [0, 1]) b.box(C(0xaeb4b9, 'metal'), x + w * (0.25 + 0.5 * i), hD / 2, zc, w / 2 - 0.006, hD, 0.04, 'D');
      cardZ(b, U('liftind', 120, 44, (g, W, Hh) => { BX(g, 0, 0, W, Hh, '#101214'); TX(g, '▲', 28, Hh / 2 + 1, 26, '#ff9a3c', CJK, 'center'); TX(g, '1', 80, Hh / 2 + 2, 32, '#ff9a3c', CJK, 'center', 'bold'); }), x + w / 2 - 0.19, hD + 0.1, sg * 0.012, 0.38, 0.14, sg, true);
      b.box(STL, x + w + 0.3, 1.15, sg * 0.01, 0.09, 0.22, 0.02); b.box(LAMP, x + w + 0.3, 1.19, sg * 0.022, 0.03, 0.03, 0.006);
    } else if (type !== 'gap') {
      const n = w > 1.3 ? 2 : 1, lw = w / n;
      for (let i = 0; i < n; i++) {
        const x0 = x + i * lw, latch = n === 2 ? (i ? x0 + 0.1 : x0 + lw - 0.1) : x0 + lw - 0.1;
        if (type === 'shut') { b.box(DOORC, x0 + lw / 2, hD / 2, zc, lw - 0.012, hD - 0.01, 0.045, 'D'); b.quad('glassDark', ...(sg > 0 ? [[x0 + lw / 2 - 0.09, 1.05, zc + 0.024], [x0 + lw / 2 + 0.09, 1.05, zc + 0.024], [x0 + lw / 2 + 0.09, 1.8, zc + 0.024], [x0 + lw / 2 - 0.09, 1.8, zc + 0.024]] : [[x0 + lw / 2 + 0.09, 1.05, zc - 0.024], [x0 + lw / 2 - 0.09, 1.05, zc - 0.024], [x0 + lw / 2 - 0.09, 1.8, zc - 0.024], [x0 + lw / 2 + 0.09, 1.8, zc - 0.024]]));
          b.box(STL, latch, 1.02, zc + sg * 0.05, 0.13, 0.025, 0.05); b.box(STL, x0 + lw / 2, 0.14, zc + sg * 0.024, lw - 0.05, 0.22, 0.004); }
        else { const hx = i ? x0 + lw - 0.03 : x0 + 0.03; b.box(DOORC, hx, hD / 2, -sg * (0.2 + lw / 2), 0.045, hD - 0.01, lw - 0.012, 'D'); b.box(STL, hx + (i ? -0.04 : 0.04), 1.02, -sg * (0.1 + lw), 0.05, 0.025, 0.13); }
      }
    }
    if (uv) cardZ(b, uv, x + w + 0.16, 1.42, sg * 0.012, 0.34, 0.116, sg);
  };
  /**
   * Wall of a public room on P-Q with its doors: gaps [[start, width, type, plate]...] along it. The face toward `toward` gets a tiled dado with a
   * coloured line; colliders run through shut doors and stop at open ones. b: the batch for the wall face (v, or uf on the two library storeys).
   */
  const wallU = (b, P, Q, y, toward, gaps = [], h = CU, trim = TRIM[0]) => {
    const len = dist(P, Q), d = unit(sub(Q, P)), pt = a => add(P, mul(d, a)), G2 = gaps.slice().sort((a, e) => a[0] - e[0]);
    const holes = G2.map(g => [g[0], g[0] + g[1], 0, g[2] === 'gap' ? 2.3 : 2.17]);
    const sg = panelWall(b, P, Q, y, y + 1.1, holes, toward, DADO); panelWall(b, P, Q, y + 1.1, y + 1.14, holes, toward, trim); panelWall(b, P, Q, y + 1.14, y + h, holes.map(q => [q[0], q[1], 0, q[3] - 1.14]), toward, WU);
    let c0 = 0;
    for (const [a, w, type, uv] of G2) {
      if (type === 'open' || type === 'gap') { if (a > c0 + 0.02) block(pt(c0), pt(a), y, y + h, 0.2); c0 = a + w; }
      along(uf, P, Q, y); doorSet(uf, a, w, sg, type, uv); home(uf);
    }
    if (len > c0 + 0.02) block(pt(c0), pt(len), y, y + h, 0.2);
    return sg;
  };
  /** Glazed screen on P-Q with an optional pair of glass doors standing open toward the outside; the inside is toward `toward`. */
  const screen = (P, Q, y, toward, door = null, hG = 2.6) => {
    const len = dist(P, Q), d = unit(sub(Q, P)), pt = a => add(P, mul(d, a)), sg = panelWall(v, P, Q, y, y + FH, [[0.3, len - 0.3, 0.06, hG]], toward, WU, TERR, 0.2);
    const off = mul([-d[1], d[0]], -sg * 0.1), Pm = add(P, off), Qm = add(Q, off);
    panelWall(v, add(Pm, mul(d, 0.3)), add(Qm, mul(d, -0.3)), y + 0.06, y + hG, door ? [[door[0] - 0.3, door[1] - 0.3, 0, 2.2]] : [], toward, GD);
    along(v, P, Q, y); const zc = -sg * 0.1, n = Math.max(2, Math.round((len - 0.6) / 1.3));
    for (let i = 0; i <= n; i++) { const x = 0.3 + (len - 0.6) * i / n; if (!door || x < door[0] - 0.2 || x > door[1] + 0.2) v.box(FRM, x, (hG + 0.06) / 2, zc, 0.06, hG - 0.06, 0.14, 'UD'); }
    v.box(FRM, len / 2, 0.09, zc, len - 0.6, 0.06, 0.14); v.box(FRM, len / 2, hG - 0.03, zc, len - 0.6, 0.06, 0.14);
    if (door) { for (const x of door) { v.box(FRM, x, 1.13, zc, 0.07, 2.26, 0.16, 'D'); const zl = -sg * 0.2, q = [[x, 0.04, zl], [x, 0.04, zl - sg * 0.78], [x, 2.2, zl - sg * 0.78], [x, 2.2, zl]]; v.quad(GRL, ...q); v.box(STL, x, 1.1, zl - sg * 0.68, 0.06, 0.5, 0.025); }
      v.box(FRM, (door[0] + door[1]) / 2, 2.23, zc, door[1] - door[0], 0.07, 0.16); }
    home(v);
    if (door) { block(P, pt(door[0]), y, y + FH, 0.2); block(pt(door[1]), Q, y, y + FH, 0.2); } else block(P, Q, y, y + FH, 0.2);
  };
  // ---- the stair: seven levels, two flights between each pair (frame: x = metres from B along the face, z = -(metres in from the face))
  { const FW = 1.4, T = 0.27, TRD = C(0xb9b6ac), NOS = C(0x2f3133), zo = [-SD0 - FW, -SD0], zi = [-SD1, -SD1 + FW], mid = Nf(38, 4);
    along(uf, LB, LA); along(c, LB, LA);
    for (let i = 0; i < LEVELS.length - 1; i++) {
      const y0 = LEVELS[i], y1 = LEVELS[i + 1], n = Math.round((y1 - y0) / 0.15), m = n / 2, R = (y1 - y0) / n, ym = y0 + m * R, se = SS1 + m * T;
      for (let j = 0; j < m; j++) {
        uf.slab(TRD, SS1 + j * T, y0 + j * R - 0.03, zo[0], T, R + 0.03, FW, 'D'); uf.slab(NOS, SS1 + j * T - 0.01, y0 + (j + 1) * R - 0.012, zo[0], 0.05, 0.014, FW, 'D');
        uf.slab(TRD, se - (j + 1) * T, ym + j * R - 0.03, zi[0], T, R + 0.03, FW, 'D'); uf.slab(NOS, se - j * T - 0.04, ym + (j + 1) * R - 0.012, zi[0], 0.05, 0.014, FW, 'D');
      }
      plate(uf, MW, [[SS1, y0 - 0.03, zo[0]], [SS1, y0 - 0.03, zo[1]], [se, ym - 0.03, zo[1]], [se, ym - 0.03, zo[0]]], 0.13);
      plate(uf, MW, [[SS1, y1 - 0.03, zi[0]], [SS1, y1 - 0.03, zi[1]], [se, ym - 0.03, zi[1]], [se, ym - 0.03, zi[0]]], 0.13);
      plate(c, G, [[SS1, y0, zo[0]], [SS1, y0, zo[1]], [se, ym, zo[1]], [se, ym, zo[0]]], 0.2);
      plate(c, G, [[SS1, y1, zi[0]], [SS1, y1, zi[1]], [se, ym, zi[1]], [se, ym, zi[0]]], 0.2);
      uf.slab(TRD, se, ym - 0.16, -SD1, SS2 - se, 0.16, SD1 - SD0); c.slab(G, se, ym - 0.2, -SD1, SS2 - se, 0.2, SD1 - SD0);       // half landing
      rail(uf, [SS1, zo[0] - 0.03], [se, zo[0] - 0.03], y0, ym, 0.95, 'Grey'); rail(uf, [se, zi[1] + 0.03], [SS1, zi[1] + 0.03], ym, y1, 0.95, 'Grey'); rail(uf, [se + 0.03, zi[1] + 0.03], [se + 0.03, zo[0] - 0.03], ym, ym, 0.95, 'Grey');
      bar(uf, STL, [SS1 + 0.1, y0 + 0.95, zo[1] - 0.06], [se, ym + 0.95, zo[1] - 0.06], 0.04); bar(uf, STL, [se, ym + 0.95, zi[0] + 0.06], [SS1 + 0.1, y1 + 0.95, zi[0] + 0.06], 0.04);     // handrails on the walls
      uf.box(LAMP, SS2 - 0.02, ym + 2.3, -(SD0 + SD1) / 2, 0.03, 0.12, 0.9, 'E');                                                           // light over the half landing
    }
    LEVELS.forEach((y, i) => {                                         // floor landings: finish, number, exit sign; a floor of their own on the two library storeys
      uf.quad(TILE, [SS0 - 0.15, y + 0.004, -5.7], [SS0 - 0.15, y + 0.004, -SD0 + 0.15], [SS1, y + 0.004, -SD0 + 0.15], [SS1, y + 0.004, -5.7]);
      if (i < 2) { c.slab(G, SS0 - 0.15, y - 0.2, -5.7, SS1 - SS0 + 0.15, 0.2, 5.7 - SD0 + 0.15); uf.slab(MW, SS0 - 0.15, y - 0.2, -5.7, SS1 - SS0 + 0.15, 0.19, 5.7 - SD0 + 0.15, 'U'); }
      cardX(uf, floorCard(i + 1 > 6 ? 'R' : i + 1), SS0 + 0.012, y + 1.5, -4.3, 0.5, 0.5, 1);
      cardZ(uf, exitCard(), SS0 + 0.4, y + 2.42, -5.716, 0.6, 0.21, -1, true);
      if (i >= 1 && i < 6) uf.quad(CEU, [SS0 - 0.15, LEVELS[i + 1] - 0.45, -5.7], [SS1, LEVELS[i + 1] - 0.45, -5.7], [SS1, LEVELS[i + 1] - 0.45, -SD0 + 0.15], [SS0 - 0.15, LEVELS[i + 1] - 0.45, -SD0 + 0.15]);
      uf.box(LAMP, SS0 + 0.7, y + (i < 6 ? (LEVELS[i + 1] - y) - 0.48 : 3.46), -(SD0 + SD1) / 2, 0.16, 0.02, 1.2);
    });
    c.slab(G, SS1, F0, -SD0 - FW - 0.16, SS2 - 1.4 - SS1, H + 1.1 - F0, 0.12);                                                              // between the flights
    c.slab(G, SS1, F0, zi[0], 0.1, 2.3, FW);                                                                                                // the foot of the stair: no way under the upper flight
    uf.slab(WU, SS1, F0, zi[0], 0.1, 2.3, FW, 'D');
    c.slab(G, SS1, H, zo[0], 0.1, 1.3, FW); rail(uf, [SS1 + 0.05, zo[0]], [SS1 + 0.05, zo[1]], H, H, 1.05, 'Grey');                         // guard at the top
    home(uf);
    // the walls of the stair well: one tall face each (always drawn: they show through the balcony glass)
    panelWall(v, Nf(SS0, SD0), Nf(SS0, 5.7), F0, H + 3.5, [], mid, WU); panelWall(v, Nf(SS2, SD0), Nf(SS2, SD1), F0, H + 3.5, [], mid, WU); panelWall(v, Nf(SS1, SD1), Nf(SS2, SD1), F0, H + 3.5, [], mid, WU);
    panelWall(v, Nf(SS0 - 0.15, SD0), Nf(SS2 + 0.15, SD0), F0, F3, [], mid, WU); panelWall(v, Nf(SS0 - 0.15, SD0), Nf(SS2 + 0.15, SD0), H, H + 3.5, [], mid, WU);
    LEVELS.forEach((y, i) => panelWall(v, Nf(SS0, SD1), Nf(SS1, SD1), y + 2.3, i < 6 ? LEVELS[i + 1] : H + 3.5, [], mid, WU));                 // over the openings to the lobby
    cap(v, CEU, [Nf(34.6, 2.3), Nf(41.2, 2.3), Nf(41.2, 8.3), Nf(34.6, 8.3)], H + 3.5, false);
    c.slab(G, SS0 - 0.15, F0, -5.7, 0.15, H + 3.6 - F0, 5.7 - 2.4); c.slab(G, SS2, F0, -5.7, 0.15, H + 3.6 - F0, 5.7 - 2.4);                 // east and west walls
    c.slab(G, SS0 - 0.15, F0, -SD0, 0.35, H + 3.6 - F0, 0.15); c.slab(G, 35.95, F0, -SD0, SS2 + 0.15 - 35.95, H + 3.6 - F0, 0.15);           // outer wall beside the balcony doors
    c.slab(G, 34.95, F0, -SD0, 1.0, F3 - F0, 0.15); c.slab(G, 34.95, H, -SD0, 1.0, 3.6, 0.15);
    // the balconies of storeys 3 to 6 (the western stack, frames 55-57): a glazed screen with a door from each landing
    c.slab(G, 33.58, F3, -2.4, 0.12, H - F3, 2.05); c.slab(G, 40.1, F3, -2.4, 0.12, H - F3, 2.05);
    for (const y of UPF) {
      panelWall(v, Nf(33.7, 2.4), Nf(40.1, 2.4), y, y + FH, [[34.95 - 33.7, 35.95 - 33.7, 0, 2.15], [SS1 - 33.7, 39.6 - 33.7, 0.1, 2.4]], Nf(37, 0), TERR);
      panelWall(v, Nf(SS0 - 0.15, SD0), Nf(SS2 + 0.15, SD0), y, y + FH, [[34.95 - 34.6, 35.95 - 34.6, 0, 2.15], [SS1 - 34.6, 39.6 - 34.6, 0.1, 2.4]], mid, WU);
      panelWall(v, Nf(SS1, 2.47), Nf(39.6, 2.47), y + 0.1, y + 2.4, [], Nf(37, 0), GD);
      along(v, LB, LA, y);
      for (const s of [SS1, 37.3, 38.45, 39.6]) v.box(FRM, s, 1.25, -2.475, 0.06, 2.3, 0.17, 'UD'); v.box(FRM, (SS1 + 39.6) / 2, 0.1, -2.475, 39.6 - SS1, 0.06, 0.17); v.box(FRM, (SS1 + 39.6) / 2, 2.4, -2.475, 39.6 - SS1, 0.06, 0.17);
      for (const s of [34.95, 35.95]) v.box(FRM, s, 1.08, -2.475, 0.06, 2.16, 0.19, 'D'); v.box(FRM, 35.45, 2.18, -2.475, 1.06, 0.06, 0.19);
      v.quad(GRL, [34.98, 0.04, -2.38], [34.98, 0.04, -1.45], [34.98, 2.14, -1.45], [34.98, 2.14, -2.38]); v.box(STL, 34.98, 1.1, -1.55, 0.06, 0.5, 0.025);       // the door leaf stands open on the balcony
      v.box(LAMP, 36.9, FH - 0.52, -1.2, 0.3, 0.03, 0.3);
      home(v);
    }
    home(c);
  }
  // ---- lobby on the two library storeys: from the garden door (ground) and the library doors (both levels) to the stair and the lifts
  const dWat = Z => (Z - LB[1] - uN[1] * 41.3) / inN[1];              // metres in from the face at which the line 41.3 m from B crosses a given Z
  { const GL = [Nf(41.3, 5.7), Nf(34.6, 5.7), Nf(34.6, 0.35), Nf(32.5, 0.35), [XG0, -20.9], [XG0, -15.6], Nf(41.3, dWat(-15.6))], ctr = [19, -18.4], dW = dWat(-15.6);
    [[F0, CEIL1 - F0], [F2, CEIL2 - F2]].forEach(([y, h], lv) => {
      cap(uf, TILE, GL, y + 0.004, true); cap(uf, CEU, GL, y + h, false); cap(c, G, GL, y, true);
      wallU(uf, GL[0], GL[1], y, ctr, [[41.3 - SS1, SS1 - SS0, 'gap']], h);
      wallU(uf, GL[1], GL[2], y, ctr, [], h); wallU(uf, GL[3], GL[4], y, ctr, [], h); const sgS = wallU(uf, GL[5], GL[6], y, ctr, [], h);
      wallU(uf, GL[6], GL[0], y, ctr, [[dW - 8.5, 1.1, 'lift'], [dW - 7.1, 1.1, 'lift']], h);
      // the wall to the library (its collider is the hall's own): door hole, sign over it
      const zd = [LDOOR[0] + 20.9, LDOOR[1] + 20.9]; panelWall(uf, GL[4], GL[5], y, y + h, [[zd[0], zd[1], 0, 2.2]], ctr, WU);
      at(uf, XG0, 0, 0, y); for (const z of LDOOR) { uf.box(FRM, 0, 1.1, z, 0.34, 2.2, 0.06, 'D'); uf.quad(GRL, [-0.16, 0.04, z], [-0.95, 0.04, z], [-0.95, 2.16, z], [-0.16, 2.16, z]); uf.box(STL, -0.82, 1.1, z, 0.025, 0.5, 0.06); }
      uf.box(FRM, 0, 2.23, (LDOOR[0] + LDOOR[1]) / 2, 0.34, 0.06, LDOOR[1] - LDOOR[0]);
      cardX(uf, signCard('图书馆  LIBRARY', '#1d4f9c', '#ffffff', 360, 80), -0.012, 2.42, (LDOOR[0] + LDOOR[1]) / 2 - 0.55, 1.1, 0.245, -1);
      cardX(uf, signCard('楼梯 · 电梯', '#f7f9fb', '#1d4f9c', 300, 80), 0.012, 2.42, (LDOOR[0] + LDOOR[1]) / 2 - 0.5, 1.0, 0.265, 1);
      home(uf);
      // the outer wall: the garden door on the ground, a window above it
      if (lv === 0) panelWall(uf, GL[2], GL[3], y, y + h, [[34.6 - ND[1], 34.6 - ND[0], 0, 2.2]], ctr, WU); else panelWall(uf, GL[2], GL[3], y, y + h, [[0.9, 2.0, 0.7, 2.5]], ctr, WU);
      along(uf, GL[5], GL[6], y); cardZ(uf, floorCard(lv + 1), 4.0, 1.6, sgS * 0.012, 0.6, 0.6, sgS); home(uf);
      for (const [X, Z] of [[16.5, -17.6], [20.2, -18.6], [21.6, -22.6], [18.6, -25.0]]) uf.box(LAMP, X, y + h - 0.012, Z, 1.2, 0.02, 0.16);
    });
    // the garden door: a glazed pair standing open, a transom, a canopy, steps (frame: x from B along the face, z out of the building)
    along(uf, LB, LA); along(c, LB, LA); along(v, LB, LA);
    for (const s of ND) { uf.box(FRM, s, 1.22, -0.17, 0.07, 2.45, 0.36, 'D'); uf.quad(GRL, [s, F0 + 0.04, -0.36], [s, F0 + 0.04, -1.14], [s, 2.42, -1.14], [s, 2.42, -0.36]); uf.box(STL, s, 1.35, -1.02, 0.06, 0.5, 0.025); }
    uf.box(FRM, (ND[0] + ND[1]) / 2, 2.42, -0.17, ND[1] - ND[0], 0.07, 0.36);
    v.slab(lm('granite'), ND[0], 0.0, -0.36, ND[1] - ND[0], F0, 0.36, 'D'); c.slab(G, ND[0], 0, -0.4, ND[1] - ND[0], F0, 0.4);
    v.slab(lm('stone'), 32, 0, 0, 3.2, F0, 1.5, 'DN'); v.slab(lm('stone'), 31.8, 0, 1.5, 3.6, 0.15, 0.4, 'DN'); c.slab(G, 32, 0, 0, 3.2, F0, 1.5); plate(c, G, [[32, F0, 1.5], [32, 0, 2.1], [35.2, 0, 2.1], [35.2, F0, 1.5]], 0.1);
    v.slab(MW, 31.9, 2.72, 0, 3.4, 0.07, 1.5); for (const s of [32.2, 35.0]) bar(v, STL, [s, 2.76, 1.35], [s, 3.5, 0.02], 0.03);
    v.slab(LAMP, 33.3, 2.69, 0.5, 0.6, 0.02, 0.2);
    cardZ(v, signCard('综合楼 · 北门', '#2a2d30', '#e9c46a', 320, 80), 31.95, 1.45, 0.012, 0.72, 0.18, 1);
    home(uf); home(c); home(v);
  }
  // ---- storeys 3 to 6: hall, corridor round the light well, the walls with all the doors
  const ZS = -11.6, DN = 11.3, DE = 10.4, SLOB = 41.3, SHALL = 33.4;   // inner walls of the south, north-west and north-east wings; west wall of the hall; east wall of the lobby
  const tipS = (DE - dot(sub(Nf(0, DN), LC), inE)) / dot(uN, inE), tSE = (ZS - LC[1] - inE[1] * DE) / uE[1];
  const A1 = Nf(SLOB, 5.7), A2 = Nf(SHALL, 5.7), A3 = Nf(SHALL, DN), A4 = Nf(tipS, DN), A5 = Ef(tSE, DE), AW = Nf(SLOB, dWat(ZS));
  const LWo = LWELL.map(p => add(p, mul(unit(sub(p, wellC)), 0.2)));   // the corridor side of the wall round the light well
  const NAMES = [
    { B2: '创客空间', B1: '通用技术教室', E3: '机器人实验室', E2: '物理探究实验室', E1: '数字化实验室', SE: '教具室', S4: '网络管理室', A: '计算机教室', S2: '信息技术教研组', S1: '储藏室' },
    { B2: '音乐教室', B1: '琴房', E3: '舞蹈排练厅', E2: '合唱排练室', E1: '器乐排练室', SE: '乐器室', S4: '书法教室', A: '美术教室', S2: '陶艺工作室', S1: '画具室' },
    { B2: '教师办公室', B1: '备课室', E3: '心理辅导室', E2: '团委 学生会', E1: '会议室', SE: '文印室', S5: '录播教室', S4: '多媒体教室', A: '阶梯教室', S1: '档案室' },
    { B2: '校园电视台', B1: '广播站', E3: '天文社', E2: '模拟联合国', E1: '校史陈列室', SE: '器材室', S5: '社团活动室', S4: '录音室', A: '研讨阅览室', S1: '储藏室' }];
  const Wf = (x, z) => { const u = unit(sub(LE, LA)); return [LA[0] + u[0] * x - u[1] * z, LA[1] + u[1] * x + u[0] * z]; };      // the frame of the west end (x from A toward E, z outward)
  LWELL.forEach((p, i) => block(p, LWELL[(i + 1) % LWELL.length], F3, H, 0.2));
  UPF.forEach((y, k) => {
    const lo = k < 2, south = lo ? [[55.5, ZS], [55.5, -8.2], [47, -8.2], [47, ZS]] : [[28.9, ZS], [28.9, -5.2], [20.6, -5.2], [20.6, ZS]], PUB = [A1, A2, A3, A4, A5, ...south, AW];
    const nm = NAMES[k], pl = (i, key) => plateCard(String((k + 3) * 100 + i), nm[key]), tr = TRIM[k], W = (P, Q, toward, gaps) => wallU(v, P, Q, y, toward, gaps, CU, tr), dW = dWat(ZS);
    cap(v, TILE, PUB, y + 0.004, true, [LWo]); cap(v, CEU, PUB, y + CU, false, [LWo]);
    cap(c, G, lo ? [LE, [VOID_S[0], 0], [VOID_S[0], -8], [VOID_S[1], -8], [VOID_S[1], 0], LD, LC, LB, Wf(nwX(-PE), -PE), Wf(PBACK, -PE), Wf(PBACK, -PW), Wf(nwX(-PW), -PW), LA] : [LE, LD, LC, LB, LA], y, true, [LWELL, STAIRHOLE]);
    W(A1, A2, Nf(37, 8), [[SLOB - SS1, SS1 - SS0, 'gap']]); W(A2, A3, Nf(36, 9));
    W(A3, A4, Nf(20, DN + 1.5), [[0.8, 1, 'shut'], [6.4, 1, 'open', pl(1, 'B2')], [9, 1, 'shut'], [14.75, 1, 'shut', pl(2, 'B1')], [19.2, 1.6, 'shut', signCard('楼梯间', '#0d8a4a', '#ffffff')], [SHALL - 10.3, 1.2, 'gap']]);
    W(A4, A5, wellC, [[2.6, 1, 'shut', pl(3, 'E3')], [9.6, 1, 'shut', pl(4, 'E2')], [16.6, 1, 'shut', pl(5, 'E1')]]);
    if (lo) {
      W(A5, [55.5, ZS], wellC, [[0.42, 1, 'shut', pl(6, 'SE')]]); W([55.5, ZS], [55.5, -8.2], [51, -10]); W([47, -8.2], [47, ZS], [51, -10]);
      screen([55.5, -8.2], [47, -8.2], y, [51, -10], k === 0 ? [3.5, 5.1] : null);                                     // foyer behind the two-storey void: the door to the terrace on storey 3
      W([47, ZS], AW, [30, ZS - 1], [[4.5, 1, 'shut', pl(8, 'S4')], [9.1, 1, 'shut'], [16.2, 1, 'open', pl(9, 'A')], [22.5, 1, 'shut', pl(10, 'S2')], [28, 1, 'shut', pl(11, 'S1')]]);
    } else {
      W(A5, [28.9, ZS], wellC, [[0.42, 1, 'shut', pl(6, 'SE')], [A5[0] - 51, 1, 'shut', pl(7, 'S5')], [A5[0] - 42.5, 1, 'shut', pl(8, 'S4')], [A5[0] - 37.9, 1, 'shut'], [A5[0] - 30.8, 1, 'open', pl(9, 'A')]]);
      W([28.9, ZS], [28.9, -5.2], [24.7, -8]); W([20.6, -5.2], [20.6, ZS], [24.7, -8]);
      screen([28.9, -5.2], [20.6, -5.2], y, [24.7, -8], [3.3, 4.9]);                                                   // lounge behind the recessed terrace of the south face
      blockBox(20.9, -5, 21, -0.3, y, y + FH); blockBox(28.5, -5, 28.6, -0.3, y, y + FH);
      W([20.6, ZS], AW, [19, ZS - 1], [[1.6, 1, 'shut', pl(11, 'S1')]]);
    }
    W(AW, A1, Nf(38, 9), [[dW - 8.5, 1.1, 'lift'], [dW - 7.1, 1.1, 'lift']]);
    // round the light well: sill, glass, head; terracotta toward the well
    const SILL = C(0xe9e7e1, 'gloss');
    LWELL.forEach((p, i) => { const j = (i + 1) % LWELL.length, q = LWELL[j], po = LWo[i], qo = LWo[j], mo = lerp(po, qo, 0.5), out = add(mo, sub(mo, wellC)), len = dist(p, q);
      wallQuad(v, TERR, p, q, k ? y : 8.6, y + 0.9, wellC); wallQuad(v, TERR, p, q, y + 3.0, y + FH, wellC); wallQuad(v, lm('glassWell'), p, q, y + 0.9, y + 3.0, wellC);
      wallQuad(v, DADO, po, qo, y, y + 0.9, out); wallQuad(v, WU, po, qo, y + 3.0, y + CU, out);
      cap(v, SILL, [p, q, qo, po], y + 0.9, true); cap(v, WU, [p, q, qo, po], y + 3.0, false);
      along(v, p, q, y); const n = Math.max(1, Math.round(len / 1.5)); for (let e = 0; e < n; e++) v.box(FRM, len * e / n, 1.95, 0, 0.06, 2.1, 0.12, 'UD');
      v.box(FRM, len / 2, 0.93, 0, len, 0.06, 0.12); v.box(FRM, len / 2, 2.97, 0, len, 0.06, 0.12); home(v);
    });
    // lights in the ceiling, on a grid
    for (let X = 14; X < 60; X += 3.2) for (let Z = -31; Z < -5; Z += 3.2) { const ok = q => inside(q, PUB) && !inside(q, LWo); if (ok([X, Z]) && ok([X + 0.9, Z]) && ok([X - 0.9, Z]) && ok([X, Z + 0.5]) && ok([X, Z - 0.5])) uf.box(LAMP, X, y + CU - 0.012, Z, 1.2, 0.02, 0.16); }
    // signs of the hall: the storey, exit signs
    along(uf, A2, A3, y); { const sg = dot(sub(Nf(36, 9), A2), [-(A3[1] - A2[1]), A3[0] - A2[0]]) > 0 ? 1 : -1; cardZ(uf, floorCard(k + 3), 2.3, 1.75, sg * 0.012, 0.7, 0.7, sg); } home(uf);
  });
  // ---- the western roof pavilion: the stair comes out here; a steel door leads out under the pergola
  { panelWall(v, Nf(34.5, 2), Nf(34.5, 8.5), H, H + 3.6, [[4.1, 5.3, 0, 2.15]], Nf(30, 5), TERR, WU, 0.25);
    panelWall(v, Nf(SS2, SD1), Nf(SS2, 8.25), H, H + 3.5, [], Nf(38, 7), WU); panelWall(v, Nf(34.75, 8.25), Nf(SS2, 8.25), H, H + 3.5, [], Nf(38, 7), WU); panelWall(v, Nf(SS1, 5.7), Nf(SS2, 5.7), H, H + 3.5, [], Nf(38, 7), WU);
    panelWall(v, Nf(SS0, 5.7), Nf(SS1, 5.7), H + 2.3, H + 3.5, [], Nf(35.4, 7), WU);
    cap(v, TILE, [Nf(34.75, SD0), Nf(SS1, SD0), Nf(SS1, 5.7), Nf(SS2, 5.7), Nf(SS2, 8.25), Nf(34.75, 8.25)], H + 0.006, true);
    along(v, LB, LA, H); along(c, LB, LA, H);
    for (const d of [6.1, 7.3]) v.box(FRM, 34.625, 1.08, -d, 0.27, 2.16, 0.06, 'D'); v.box(FRM, 34.625, 2.18, -6.7, 0.27, 0.06, 1.26);
    v.box(C(0x8e9a94, 'metal'), 33.95, 1.07, -6.12, 1.1, 2.1, 0.045, 'D'); v.box(STL, 33.5, 1.05, -6.16, 0.12, 0.03, 0.05);          // the door leaf stands open against the wall
    v.box(LAMP, 37.9, 3.48, -7, 1.2, 0.02, 0.16);
    cardZ(v, exitCard(), 34.9, 2.5, -8.23, 0.6, 0.21, 1, true);
    c.slab(G, SS2, 0, -8.5, 0.25, 3.6, 8.5 - SD1); c.slab(G, 34.5, 0, -8.5, 6.8, 3.6, 0.25); c.slab(G, 34.5, 0, -6.1, 0.25, 3.6, 0.4); c.slab(G, 34.5, 0, -8.25, 0.25, 3.6, 0.95);
    c.slab(G, SS1, 0, -5.7, SS2 - SS1, 3.6, 0.15); c.slab(G, 34.5, 3.5, -8.5, 6.8, 0.22, 6.5);
    c.slab(G, 11.6, 0, -8.5, 4.9, 3.6, 6.5);                                                                                        // the eastern pavilion is closed
    home(v); home(c);
  }

  // ================================================================= ROOMS OF STOREYS 3 TO 6 (all imagined)
  // One batch and one set of instanced furniture per storey; a storey's rooms are drawn only while the viewer is on or near that storey.
  const RB = UPF.map(() => { const b = new Batch(); home(b); return b; }), RI = UPF.map(() => new Inst()), RP = UPF.map(() => []);      // RP: potted plants [x, y, z, radius] in world coordinates
  const yawN = Math.atan2(-uN[1], uN[0]), INNER = lm('inner'), ALU = C(0xc9cdd0, 'metal'), DKM = C(0x2a2c2f), WOOD = C(0xd9bd8c, 'gloss'), GREYM = C(0x5a6068, 'metal');
  /** A room: frame with the origin in the corner on the corridor wall, +x along that wall, +z toward the windows, y = 0 on its floor. */
  const mkRoom = (k, o, yaw, W, D) => {
    const b = RB[k], y = UPF[k], co = Math.cos(yaw), si = Math.sin(yaw), fr = () => at(b, o[0], o[1], yaw, y);
    const R = { k, b, y, W, D, fr,
      toL: (x, z) => [o[0] + x * co + z * si, o[1] - x * si + z * co],
      sub: (x, z, a = 0, y0 = 0) => { const p = R.toL(x, z); at(b, p[0], p[1], yaw + a, y + y0); },                 // a frame inside the room, turned by a
      put: (key, x, z, a = 0, hex = 0xffffff, y0 = 0, s = 1) => { fr(); RI[k].put(key, b.m.clone().multiply(_m.makeRotationY(a).setPosition(x, y0, z)).scale(_v.set(s, s, s)), hex); },
      col: (x0, z0, x1, z1, h = 1, y0 = 0) => { at(c, o[0], o[1], yaw, y); c.slab(G, Math.min(x0, x1), y0, Math.min(z0, z1), Math.abs(x1 - x0), h, Math.abs(z1 - z0)); home(c); },
      pot: (x, z, r = 0.3, y0 = 0, hp = 0.4) => { fr(); b.cyl(C(0xf1efe9, 'gloss'), x, y0, z, r * 0.62, hp, 10); const w = toW(R.toL(x, z)); RP[k].push([w[0], y + y0 + hp, w[1], r]); } };
    fr(); return R;
  };
  /** Wall in the plane z of the current frame, looking toward +z (sg 1) or -z (sg -1), from x0 to x1, with holes [[xa, xb, ya, yb]...]. */
  const zWall = (b, z, sg, x0, x1, holes, m = WU, h = CU) => {
    const cuts = [x0, x1]; for (const q of holes) cuts.push(q[0], q[1]); cuts.sort((a, e) => a - e);
    for (let i = 0; i < cuts.length - 1; i++) { const a = cuts[i], e = cuts[i + 1]; if (e - a < 0.01) continue;
      const hs = holes.filter(q => (a + e) / 2 > q[0] && (a + e) / 2 < q[1]).sort((p, q) => p[2] - q[2]); let y0 = 0;
      for (const q of [...hs, [0, 0, h, h]]) { if (q[2] - y0 > 0.01) { if (sg > 0) b.quad(m, [a, y0, z], [e, y0, z], [e, q[2], z], [a, q[2], z]); else b.quad(m, [e, y0, z], [a, y0, z], [a, q[2], z], [e, q[2], z]); } y0 = q[3]; } }
  };
  /** The same in the plane x, looking toward +x (sg 1) or -x (sg -1), from z0 to z1. */
  const xWall = (b, x, sg, z0, z1, holes, m = WU, h = CU) => {
    const cuts = [z0, z1]; for (const q of holes) cuts.push(q[0], q[1]); cuts.sort((a, e) => a - e);
    for (let i = 0; i < cuts.length - 1; i++) { const a = cuts[i], e = cuts[i + 1]; if (e - a < 0.01) continue;
      const hs = holes.filter(q => (a + e) / 2 > q[0] && (a + e) / 2 < q[1]).sort((p, q) => p[2] - q[2]); let y0 = 0;
      for (const q of [...hs, [0, 0, h, h]]) { if (q[2] - y0 > 0.01) { if (sg > 0) b.quad(m, [x, y0, e], [x, y0, a], [x, q[2], a], [x, q[2], e]); else b.quad(m, [x, y0, a], [x, y0, e], [x, q[2], e], [x, q[2], a]); } y0 = q[3]; } }
  };
  /** Floor, ceiling, walls of a room seen from inside; doors [[x, width]...] in the corridor wall, ribbons [[xa, xb]...] = the ribbon windows of the face. */
  const roomShell = (R, floor, doors, ribbons, wall = WU) => {
    const { b, W, D } = R;
    b.quad(floor, [0, 0.004, D], [W, 0.004, D], [W, 0.004, 0], [0, 0.004, 0]); b.quad(CEU, [0, CU, 0], [W, CU, 0], [W, CU, D], [0, CU, D]);
    xWall(b, 0, 1, 0, D, [], wall); xWall(b, W, -1, 0, D, [], wall); zWall(b, 0, 1, 0, W, doors.map(([x, w]) => [x, x + w, 0, 2.17]), wall);
    const holes = []; for (const [xa, xb] of ribbons) { const w = xb - xa; holes.push([xa, xb, 1.0, 2.45], [xa, xa + w / 3 - 0.25, 2.9, 3.4], [xa + w / 3 + 0.25, xa + 2 * w / 3 - 0.25, 2.9, 3.4], [xa + 2 * w / 3 + 0.25, xb, 2.9, 3.4]); }
    zWall(b, D, -1, 0, W, holes, wall);
    for (const [xa, xb] of ribbons) {                                // the room side of a ribbon window: a pane one looks out through, sashes, a sill board
      b.quad(INNER, [xb, 1.0, D + 0.02], [xa, 1.0, D + 0.02], [xa, 2.45, D + 0.02], [xb, 2.45, D + 0.02]);
      for (let x = xa; x < xb + 0.01; x += 0.8) b.box(ALU, Math.min(x, xb), 1.725, D + 0.01, 0.05, 1.45, 0.05, 'UD');
      b.box(MW, (xa + xb) / 2, 1.0, D - 0.07, xb - xa + 0.1, 0.04, 0.18); b.box(ALU, (xa + xb) / 2, 2.44, D + 0.01, xb - xa, 0.05, 0.05); b.box(ALU, (xa + xb) / 2, 1.02, D + 0.01, xb - xa, 0.04, 0.05);
    }
    R.col(-0.2, 0, 0, D, CU); R.col(W, 0, W + 0.2, D, CU);
  };
  /** Curtain hanging in the plane z from xa to xb: pleats as a zigzag of strips, seen from the room (-z side). */
  const drape = (b, xa, xb, z, hex, y0 = 0.95, y1 = 2.62) => { const n = Math.max(2, Math.round((xb - xa) / 0.11)), A = C(hex), B2 = C(hex);
    for (let i = 0; i < n; i++) { const x0 = xa + (xb - xa) * i / n, x1 = xa + (xb - xa) * (i + 1) / n, z0 = z - (i % 2 ? 0.035 : 0), z1 = z - (i % 2 ? 0 : 0.035); b.quad(i % 2 ? A : B2, [x1, y0, z1], [x0, y0, z0], [x0, y1, z0], [x1, y1, z1]); }
    b.box(ALU, (xa + xb) / 2, y1 + 0.02, z - 0.02, xb - xa + 0.1, 0.03, 0.03); };
  /** Light panels in the ceiling of a room, nx by nz. */
  const ceilLights = (R, nx, nz, w = 1.2, d = 0.3) => { for (let i = 0; i < nx; i++) for (let j = 0; j < nz; j++) R.b.box(LAMP, R.W * (i + 0.5) / nx, CU - 0.012, R.D * (j + 0.5) / nz, w, 0.02, d); };
  /** Table: a top on four legs, low corner (x, z). */
  const tbl = (b, x, z, w, d, h = 0.74, top = WOOD, leg = GREYM, t = 0.04) => { b.slab(top, x, h - t, z, w, t, d); for (const [lx, lz] of [[x + 0.04, z + 0.04], [x + w - 0.08, z + 0.04], [x + 0.04, z + d - 0.08], [x + w - 0.08, z + d - 0.08]]) b.slab(leg, lx, 0, lz, 0.04, h - t, 0.04, 'UD'); };
  const scr = i => U('scr' + i, 128, 80, (g, W, Hh) => { const r = rng(300 + i * 17);
    if (i === 0) { BX(g, 0, 0, W, Hh, '#1e2430'); BX(g, 0, 0, 26, Hh, '#161b24'); for (let q = 0; q < 9; q++) { g.fillStyle = ['#7fb7ff', '#c8a2ff', '#9be3a8', '#f2c57c', '#e6e6e6'][Math.floor(r() * 5)]; g.fillRect(32 + (q % 3) * 6, 8 + q * 7.5, 20 + r() * 56, 3); } }
    else if (i === 1) { const gr = g.createLinearGradient(0, 0, W, Hh); gr.addColorStop(0, '#2b6cb0'); gr.addColorStop(1, '#63b3ed'); g.fillStyle = gr; g.fillRect(0, 0, W, Hh); BX(g, 20, 12, 78, 50, '#f7f7f5', '#555', 1); BX(g, 20, 12, 78, 7, '#3a4a5c'); ROWS(g, 26, 26, 64, 5, 6, '#8b8f96', 2, r); BX(g, 0, Hh - 7, W, 7, '#1c2530'); }
    else if (i === 2) { BX(g, 0, 0, W, Hh, '#f4f6f4'); BX(g, 0, 0, W, 9, '#1f7a45'); for (let y = 14; y < Hh; y += 7) { g.fillStyle = '#c9cfcc'; g.fillRect(0, y, W, 1); } for (let x = 18; x < W; x += 22) { g.fillStyle = '#c9cfcc'; g.fillRect(x, 9, 1, Hh); } for (let q = 0; q < 14; q++) BX(g, 20 + Math.floor(r() * 5) * 22, 16 + Math.floor(r() * 9) * 7, 16, 4, '#6d7f77'); }
    else { BX(g, 0, 0, W, Hh, '#101418'); BX(g, 6, 6, 74, 46, '#2f6f8f'); BX(g, 86, 6, 36, 21, '#8f5f2f'); BX(g, 86, 31, 36, 21, '#3f7f4f'); for (let q = 0; q < 12; q++) BX(g, 6 + q * 10, 60, 7, 4 + r() * 12, '#7fdf9f'); } });
  /** A flat screen on a stand, facing dir (+1: toward +x, -1: toward -x) with its foot at (x, z) on a table at height y, and a keyboard in front of it. */
  const pcAt = (b, x, y, z, dir, kind = 0, kb = true) => { b.box(DKM, x, y + 0.01, z, 0.18, 0.02, 0.22); b.box(DKM, x, y + 0.12, z, 0.03, 0.2, 0.05); b.box(DKM, x, y + 0.34, z, 0.03, 0.32, 0.52);
    cardX(b, scr(kind), x + dir * 0.017, y + 0.2, z - 0.24, 0.48, 0.28, dir, true); if (kb) { b.box(C(0x3a3d42), x + dir * 0.3, y + 0.012, z, 0.14, 0.02, 0.42); b.box(C(0x3a3d42), x + dir * 0.3, y + 0.012, z + 0.32, 0.1, 0.03, 0.06); } };
  /** A pile of books or exercise books. */
  const pile = (b, x, y, z, n, seed, w = 0.2, d = 0.28) => { const r = rng(seed * 31 + 7), cols = [0x2f5fa8, 0xb8322a, 0x2f8a55, 0xe0b020, 0xf2efe6, 0x7a4fa0, 0xd9772b, 0x3a3d42]; let yy = y;
    for (let i = 0; i < n; i++) { const t = 0.012 + r() * 0.02; b.box(C(cols[Math.floor(r() * cols.length)]), x + (r() - 0.5) * 0.03, yy + t / 2, z + (r() - 0.5) * 0.03, w * (0.85 + 0.15 * r()), t, d * (0.85 + 0.15 * r()), 'D'); yy += t; } };
  const poster = (title, col, i = 0) => U('po' + title, 200, 280, (g, W, Hh) => { const r = rng(911 + i * 37 + title.length); BX(g, 0, 0, W, Hh, '#f6f3ea', 'rgba(0,0,0,0.3)', 2); BX(g, 0, 0, W, 46, col); TX(g, title, W / 2, 24, title.length > 6 ? 20 : 26, '#fff', CJK, 'center', 'bold');
    let y = 58; while (y < Hh - 30) { if (r() < 0.35 && y < Hh * 0.6) { const ph = 44 + r() * 20; for (let q = 0; q < 2; q++) { const hue = Math.floor(r() * 360), gr = g.createLinearGradient(0, y, 0, y + ph); gr.addColorStop(0, `hsl(${hue},40%,72%)`); gr.addColorStop(1, `hsl(${(hue + 40) % 360},35%,42%)`); g.fillStyle = gr; g.fillRect(14 + q * 90, y, 82, ph); } y += ph + 10; }
      else { BX(g, 14, y, 60 + r() * 60, 6, col); y += 12; const n = 3 + Math.floor(r() * 4); ROWS(g, 14, y, W - 28, n, 9, '#8b8880', 3.5, r); y += n * 9 + 8; } } });

  // ---- toilets in the plain north wing of every upper storey (the face there has only thin high slots, frames 55-57)
  const TILEW = pbr('tiles', [0xeef0ec, 4, 1.2, 0.3]), TILEF = pbr('tiles', [0x9aa3a6, 4, 1.2, 0.5]), PART = C(0xcfd8dc, 'gloss'), CER = C(0xfafaf7, 'gloss');
  const wcSign = () => U('wc', 240, 100, (g, W, Hh) => { BX(g, 0, 0, W, Hh, '#1d4f9c'); g.fillStyle = '#fff'; for (const [x, f] of [[42, 0], [198, 1]]) { g.beginPath(); g.arc(x, 24, 9, 0, TAU); g.fill(); if (f) { g.beginPath(); g.moveTo(x, 34); g.lineTo(x + 17, 70); g.lineTo(x - 17, 70); g.closePath(); g.fill(); g.fillRect(x - 8, 70, 6, 22); g.fillRect(x + 2, 70, 6, 22); } else { g.fillRect(x - 12, 36, 24, 32); g.fillRect(x - 10, 68, 8, 26); g.fillRect(x + 2, 68, 8, 26); } }
    TX(g, '卫生间', W / 2, 40, 30, '#fff', CJK, 'center', 'bold'); TX(g, 'Toilets', W / 2, 74, 18, '#fff', CJK, 'center'); });
  UPF.forEach((y, k) => {
    const R = mkRoom(k, Nf(0.6, DN - 0.2), yawN, 9.6, DN - 0.65), { b, W, D } = R, xm = 5.3, zv = 2.9, gx0 = 33.4 - 23.25 - 1.2 - 0.6;      // xm: wall between the two rooms; zv: depth of the wash room; the way in at x gx0 .. gx0 + 1.2
    b.quad(TILEF, [0, 0.004, D], [W, 0.004, D], [W, 0.004, 0], [0, 0.004, 0]); b.quad(CEU, [0, CU, 0], [W, CU, 0], [W, CU, D], [0, CU, D]);
    xWall(b, 0, 1, 0, D, [], TILEW); xWall(b, W, -1, 0, D, [], TILEW); zWall(b, 0, 1, 0, W, [[gx0, gx0 + 1.2, 0, 2.3]], TILEW); zWall(b, D, -1, 0, W, [[1.5, W - 1.2, 3.22, 3.45]], TILEW);
    // partitions: men's room on the left (x < xm), the wash room behind the way in, women's room beyond it
    xWall(b, xm - 0.06, -1, 0, D, [[1.1, 2.0, 0, 2.1]], TILEW); xWall(b, xm + 0.06, 1, 0, D, [[1.1, 2.0, 0, 2.1]], TILEW); zWall(b, zv - 0.06, -1, xm, W, [[7.4, 8.3, 0, 2.1]], TILEW); zWall(b, zv + 0.06, 1, xm, W, [[7.4, 8.3, 0, 2.1]], TILEW);
    R.col(xm - 0.1, 0, xm + 0.1, 1.1, CU); R.col(xm - 0.1, 2.0, xm + 0.1, D, CU); R.col(xm, zv - 0.1, 7.4, zv + 0.1, CU); R.col(8.3, zv - 0.1, W, zv + 0.1, CU); R.col(-0.2, 0, 0, D, CU); R.col(W, 0, W + 0.2, D, CU); R.col(0, D, W, D + 0.2, CU);
    for (const [x, z, sx, sz] of [[xm, 1.1, 0.14, 0.05], [xm, 2.0, 0.14, 0.05], [7.4, zv, 0.05, 0.14], [8.3, zv, 0.05, 0.14]]) b.box(MW, x, 1.05, z, sx, 2.1, sz, 'D');
    cardX(b, plateCard('男', '卫生间'), xm + 0.07, 1.5, 2.15, 0.34, 0.116, 1); cardZ(b, plateCard('女', '卫生间'), 6.95, 1.5, zv - 0.07, 0.34, 0.116, -1);
    // wash room: a trough of basins under a mirror, a hand dryer, a bin
    b.slab(CER, xm + 0.3, 0.78, zv - 0.62, 1.9, 0.1, 0.5); b.slab(C(0xd9dee0, 'gloss'), xm + 0.34, 0.82, zv - 0.58, 1.82, 0.065, 0.42, 'D'); b.slab(MW, xm + 0.3, 0, zv - 0.5, 1.9, 0.78, 0.3, 'U'); for (const x of [xm + 0.75, xm + 1.75]) { b.cyl(STL, x, 0.88, zv - 0.14, 0.012, 0.16, 6); b.box(STL, x, 1.03, zv - 0.2, 0.02, 0.02, 0.14); }
    b.quad('glassClear', [xm + 2.2, 1.1, zv - 0.07], [xm + 0.3, 1.1, zv - 0.07], [xm + 0.3, 2.0, zv - 0.07], [xm + 2.2, 2.0, zv - 0.07]); b.box(ALU, xm + 1.25, 1.55, zv - 0.065, 1.96, 0.96, 0.01, 'N');
    b.box(MW, W - 0.1, 1.25, 1.6, 0.18, 0.3, 0.26); b.cyl(GREYM, W - 0.3, 0, 0.5, 0.16, 0.5, 10); R.col(xm + 0.3, zv - 0.65, xm + 2.2, zv - 0.1, 0.9);
    cardZ(b, signCard('节约用水', '#eaf6ee', '#1a7a3c', 200, 70), xm + 2.45, 1.5, zv - 0.07, 0.4, 0.14, -1);
    // men's room: urinals with screens on the outer wall, three cubicles at the far end, basins, a mop sink
    for (let i = 0; i < 4; i++) { const z = 3.2 + i * 0.85; b.box(CER, 0.16, 0.75, z, 0.3, 0.7, 0.36); b.box(CER, 0.2, 0.42, z, 0.36, 0.1, 0.4); b.box(STL, 0.06, 1.22, z, 0.06, 0.1, 0.06); if (i) b.box(PART, 0.22, 0.95, z - 0.425, 0.42, 0.9, 0.025); }
    R.col(0, 2.8, 0.42, 6.2, 1.2);
    const cubicles = (x0, z0, n, alongX, depth, open) => { for (let i = 0; i <= n; i++) { if (alongX) b.box(PART, x0 + i * 1.0, 1.15, z0 + depth / 2, 0.03, 2.0, depth, ''); else b.box(PART, x0 + depth / 2, 1.15, z0 + i * 1.0, depth, 2.0, 0.03, ''); }
      for (let i = 0; i < n; i++) { const a = i === open ? 0.5 : 0;                                   // doors (one stands ajar), a pan in each
        if (alongX) { b.box(PART, x0 + i * 1.0 + 0.5 - a * 0.3, 1.15, z0 + a * 0.3, 0.66 * (1 - a * 0.5), 2.0, 0.025); b.box(PART, x0 + i * 1.0 + 0.09, 1.15, z0, 0.16, 2.0, 0.03); b.box(PART, x0 + i * 1.0 + 0.91, 1.15, z0, 0.16, 2.0, 0.03); b.box(CER, x0 + i * 1.0 + 0.5, 0.2, z0 + depth - 0.45, 0.38, 0.4, 0.6); b.box(CER, x0 + i * 1.0 + 0.5, 0.6, z0 + depth - 0.12, 0.42, 0.4, 0.18); }
        else { b.box(PART, x0 + a * 0.3, 1.15, z0 + i * 1.0 + 0.5 - a * 0.3, 0.025, 2.0, 0.66 * (1 - a * 0.5)); b.box(PART, x0, 1.15, z0 + i * 1.0 + 0.09, 0.03, 2.0, 0.16); b.box(PART, x0, 1.15, z0 + i * 1.0 + 0.91, 0.03, 2.0, 0.16); b.box(CER, x0 + depth - 0.45, 0.2, z0 + i * 1.0 + 0.5, 0.6, 0.4, 0.38); b.box(CER, x0 + depth - 0.12, 0.6, z0 + i * 1.0 + 0.5, 0.18, 0.4, 0.42); } } };
    cubicles(0.15, D - 1.5, 3, true, 1.5, 1); R.col(0, D - 1.55, 3.2, D, 2.2);
    b.slab(CER, 3.9, 0.3, D - 0.6, 0.8, 0.3, 0.55); b.slab(MW, 3.9, 0, D - 0.6, 0.8, 0.3, 0.55, 'U'); b.box(STL, 4.3, 0.95, D - 0.08, 0.03, 0.5, 0.03); R.col(3.85, D - 0.65, 4.75, D, 0.7);
    for (const z of [4.6, 5.6]) { b.box(CER, xm - 0.32, 0.8, z, 0.44, 0.14, 0.52); b.box(STL, xm - 0.14, 0.98, z, 0.03, 0.14, 0.03); } b.quad('glassClear', [xm - 0.07, 1.1, 4.2], [xm - 0.07, 1.1, 6.0], [xm - 0.07, 2.0, 6.0], [xm - 0.07, 2.0, 4.2]); R.col(xm - 0.55, 4.3, xm - 0.1, 5.9, 0.95);
    // women's room: four cubicles along the east wall, basins opposite
    cubicles(W - 1.55, zv + 0.5, 4, false, 1.55, 2); R.col(W - 1.6, zv + 0.45, W, zv + 4.55, 2.2);
    for (const z of [zv + 1.3, zv + 2.3]) { b.box(CER, xm + 0.38, 0.8, z, 0.44, 0.14, 0.52); b.box(STL, xm + 0.2, 0.98, z, 0.03, 0.14, 0.03); } b.quad('glassClear', [xm + 0.07, 1.1, zv + 2.7], [xm + 0.07, 1.1, zv + 0.9], [xm + 0.07, 2.0, zv + 0.9], [xm + 0.07, 2.0, zv + 2.7]); R.col(xm + 0.1, zv + 1.0, xm + 0.6, zv + 2.6, 0.95);
    for (const [x, z] of [[2.6, 2.4], [2.6, 6.5], [7.4, 1.4], [7.2, 5.4], [7.2, 8.6]]) b.box(LAMP, x, CU - 0.012, z, 0.6, 0.02, 0.6);
    // the sign over the way in, seen from the corridor
    along(uf, A3, A4, y); cardZ(uf, wcSign(), 23.25 + 0.2, 2.42, (dot(sub(Nf(20, DN + 1.5), A3), [-(A4[1] - A3[1]), A4[0] - A3[0]]) > 0 ? 1 : -1) * 0.02, 0.8, 0.333, dot(sub(Nf(20, DN + 1.5), A3), [-(A4[1] - A3[1]), A4[0] - A3[0]]) > 0 ? 1 : -1); home(uf);
  });

  // ---- the furnished rooms: A = the room behind the fourth ribbon of the south face, B = the room behind the western ribbon of the north-west face
  const roomA = k => mkRoom(k, [29.1, ZS + 0.2], 0, 9.55, -0.45 - ZS - 0.2), roomB = k => mkRoom(k, Nf(25.25, DN - 0.2), yawN, 8.05, DN - 0.65);
  const DA = [[0.7, 1], [7.8, 1]], RIBA = [[0.9, 8.9]], DB = [[0.75, 1], [6.35, 1]], RIBB = [[0.45, 7.65]];
  const slide = (title, lines, bg) => U('sl' + title, 400, 225, (g, W, Hh) => { BX(g, 0, 0, W, Hh, bg); BX(g, 0, 0, W, 44, 'rgba(255,255,255,0.12)'); TX(g, title, 20, 24, 22, '#ffffff', CJK, 'left', 'bold'); lines.forEach((s, i) => { BX(g, 22, 66 + i * 34, 8, 8, '#f2c94c'); TX(g, s, 40, 70 + i * 34, 19, '#e8eef2', CJK); }); TX(g, '广东实验中学', W - 14, Hh - 14, 11, 'rgba(255,255,255,0.5)', CJK, 'right'); });
  const art = i => U('art' + i, 160, 120, (g, W, Hh) => { const r = rng(500 + i * 13);
    if (i === 0) { const gr = g.createLinearGradient(0, 0, 0, Hh); gr.addColorStop(0, '#3b2a6b'); gr.addColorStop(0.55, '#f08a3c'); gr.addColorStop(1, '#f6d06a'); g.fillStyle = gr; g.fillRect(0, 0, W, Hh); g.fillStyle = '#fff3c4'; g.beginPath(); g.arc(104, 70, 16, 0, TAU); g.fill(); g.fillStyle = '#2a2433'; g.beginPath(); g.moveTo(0, Hh); g.lineTo(0, 86); g.lineTo(46, 70); g.lineTo(90, 92); g.lineTo(130, 78); g.lineTo(W, 96); g.lineTo(W, Hh); g.fill(); }
    else if (i === 1) { BX(g, 0, 0, W, Hh, '#f4f1e6'); for (const [x, y, w, h, c2] of [[0, 0, 60, 50, '#c8262c'], [64, 0, 96, 30, '#f4f1e6'], [64, 34, 40, 86, '#1f4fa0'], [108, 34, 52, 50, '#f2c230'], [0, 54, 60, 66, '#f4f1e6'], [108, 88, 52, 32, '#111']]) BX(g, x, y, w, h, c2, '#111', 3); }
    else if (i === 2) { BX(g, 0, 0, W, Hh, '#cfc3a6'); BX(g, 0, 78, W, 42, '#7a5a3c'); for (const [x, c2] of [[46, '#c8362c'], [72, '#d9a22b'], [96, '#7fa83a']]) { g.fillStyle = c2; g.beginPath(); g.arc(x, 74, 13, 0, TAU); g.fill(); } BX(g, 118, 30, 14, 50, '#2f5f4a'); BX(g, 121, 18, 8, 14, '#2f5f4a'); }
    else if (i === 3) { for (let y = 0; y < Hh; y += 6) { g.fillStyle = y < 50 ? shade([150, 200, 235], 0.9 + r() * 0.15) : shade([40, 110, 170], 0.8 + r() * 0.3); g.fillRect(0, y, W, 6); } g.fillStyle = '#fff'; g.beginPath(); g.moveTo(84, 22); g.lineTo(84, 66); g.lineTo(112, 66); g.fill(); BX(g, 70, 68, 50, 7, '#7a4a2a'); }
    else if (i === 4) { BX(g, 0, 0, W, Hh, '#f6efe0'); for (let q = 0; q < 9; q++) { const x = 20 + q * 15 + r() * 6, y = 30 + r() * 40; g.strokeStyle = '#3f7a3a'; g.lineWidth = 3; g.beginPath(); g.moveTo(x, Hh); g.lineTo(x + (r() - 0.5) * 10, y); g.stroke(); g.fillStyle = ['#e0465a', '#f2a03c', '#c86ad0', '#f2d23c'][q % 4]; g.beginPath(); g.arc(x, y, 8 + r() * 4, 0, TAU); g.fill(); } }
    else { BX(g, 0, 0, W, Hh, '#efe6d0'); g.strokeStyle = '#222'; g.lineCap = 'round'; for (let q = 0; q < 4; q++) { const x = 30 + q * 30; g.lineWidth = 6; g.beginPath(); g.moveTo(x, Hh); g.lineTo(x + 10, 8); g.stroke(); g.lineWidth = 3; for (let e = 0; e < 4; e++) { const y = 20 + e * 22; g.beginPath(); g.moveTo(x + 4, y); g.lineTo(x + 24, y - 10); g.moveTo(x + 4, y); g.lineTo(x - 16, y - 8); g.stroke(); } } BX(g, 132, 84, 16, 16, '#b3261e'); } });
  const sketch = i => U('sk' + i, 120, 160, (g, W, Hh) => { const r = rng(40 + i); BX(g, 0, 0, W, Hh, '#f1ece0'); g.strokeStyle = 'rgba(60,60,64,0.75)'; g.lineWidth = 1.6; g.beginPath(); g.ellipse(60, 118, 46, 12, 0, 0, TAU); g.stroke(); g.strokeRect(30 + i * 4, 84, 26, 26); g.beginPath(); g.ellipse(74, 76 - i * 3, 14, 30, 0, 0, TAU); g.stroke(); g.beginPath(); g.moveTo(84, 110); g.lineTo(98, 64); g.lineTo(108, 110); g.stroke();
    for (let q = 0; q < 26 + i * 12; q++) { const x = 20 + r() * 80, y = 60 + r() * 60; g.strokeStyle = 'rgba(60,60,64,0.25)'; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 10, y - 8); g.stroke(); } });

  // ---- storey 3, room A: computer room
  { const R = roomA(0), { b, W, D } = R; roomShell(R, lm('carpet'), DA, RIBA);
    cardX(b, slide('信息技术 · Python 入门', ['for i in range(10):', '    print(i * i)', '列表、循环与函数', '今日任务：猜数字游戏'], '#17324d'), 0.02, 0.95, 3.4, 3.9, 2.2, 1, true); b.box(ALU, 0.012, 2.05, 5.35, 0.02, 2.28, 3.98, 'W');
    tbl(b, 1.1, 7.6, 0.7, 1.6); pcAt(b, 1.6, 0.74, 8.4, -1, 1); R.put('task', 0.72, 8.4, 0, 0x3a4a5c); pile(b, 1.4, 0.74, 7.9, 6, 3); R.col(1.1, 7.6, 1.8, 9.2, 0.8);
    b.slab(DKM, 0.1, 0, 9.9, 0.7, 2.0, 0.8); for (let i = 0; i < 8; i++) b.box(i % 3 ? C(0x3fd07a) : C(0xf2a03c), 0.805, 0.4 + i * 0.19, 10.0 + (i % 4) * 0.15, 0.01, 0.02, 0.03); R.col(0.1, 9.9, 0.8, 10.7, 2);
    const GR = C(0x9aa3ab), TOP = C(0xe9e6dc, 'gloss'), cols = [0x2f4f7f, 0x35588c, 0x2b4a70];
    [3.1, 4.7, 6.3, 7.9].forEach((xr, row) => { for (const z0 of [1.3, 6.0]) {
      b.slab(TOP, xr - 0.35, 0.7, z0, 0.65, 0.04, 3.3); b.slab(GR, xr - 0.35, 0.1, z0, 0.02, 0.6, 3.3); b.slab(GR, xr - 0.35, 0, z0, 0.65, 0.7, 0.03, 'U'); b.slab(GR, xr - 0.35, 0, z0 + 3.27, 0.65, 0.7, 0.03, 'U'); R.col(xr - 0.35, z0, xr + 0.3, z0 + 3.3, 0.8);
      for (let i = 0; i < 4; i++) { const zc = z0 + 0.41 + i * 0.826; pcAt(b, xr - 0.15, 0.74, zc, 1, (i + row) % 3); b.slab(DKM, xr - 0.3, 0.02, zc + 0.24, 0.4, 0.38, 0.17); R.put('task', xr + 0.62, zc + ((i * 7 + row * 3) % 5 - 2) * 0.03, Math.PI + ((i + row) % 3 - 1) * 0.25, cols[(i + row) % 3]); } } });
    b.slab(C(0xd9d6ca), W - 0.45, 0, 1.0, 0.45, 1.9, 3.0); for (let i = 1; i < 4; i++) b.box(DKM, W - 0.455, 0.95, 1.0 + i * 0.75, 0.01, 1.86, 0.012); R.col(W - 0.45, 1.0, W, 4.0, 2);
    cardX(b, poster('上机守则', '#1f6fb5'), W - 0.012, 1.25, 5.0, 0.6, 0.84, -1); cardX(b, poster('网络安全', '#b3261e', 1), W - 0.012, 1.25, 5.8, 0.6, 0.84, -1);
    b.slab(MW, W - 0.5, 0, 9.9, 0.5, 1.8, 0.6); b.box(DKM, W - 0.505, 1.55, 10.2, 0.01, 0.12, 0.44); R.col(W - 0.5, 9.9, W, 10.5, 1.8);
    tbl(b, 3.0, 0.1, 1.6, 0.6); b.slab(C(0xe6e4dc), 3.2, 0.74, 0.18, 0.5, 0.28, 0.42); b.box(DKM, 3.45, 0.9, 0.61, 0.3, 0.06, 0.01); pile(b, 4.2, 0.74, 0.4, 5, 9, 0.22, 0.3); R.col(3.0, 0.1, 4.6, 0.7, 0.8);
    b.box(MW, 2.8, CU - 0.22, 5.35, 0.36, 0.12, 0.3); b.box(MW, 2.8, CU - 0.08, 5.35, 0.04, 0.16, 0.04); ceilLights(R, 3, 3);
    drape(b, 0.9, 1.9, D - 0.07, 0x8fa8c0); drape(b, 7.9, 8.9, D - 0.07, 0x8fa8c0); R.pot(2.3, 10.4, 0.36); }

  // ---- storey 3, room B: maker space
  { const R = roomB(0), { b, W, D } = R; roomShell(R, lm('concrete'), DB, RIBB);
    const TT = C(0xc9a878, 'gloss'), sc = [0xd9482b, 0xe0b020, 0x2f6fb5, 0x2f8a55];
    [[1.9, 1.7], [4.6, 1.7], [1.9, 4.5], [4.6, 4.5]].forEach(([x, z], t) => { tbl(b, x, z, 1.8, 0.9, 0.78, TT, DKM, 0.06); R.col(x, z, x + 1.8, z + 0.9, 0.82);
      [[0.45, -0.32], [1.35, -0.32], [0.45, 1.22], [1.35, 1.22]].forEach(([dx, dz], i) => R.put('stool', x + dx, z + dz, i, sc[(i + t) % 4]));
      if (t === 0) { b.box(C(0x2f6fb5), x + 0.5, 0.83, z + 0.4, 0.24, 0.05, 0.15); for (const [wx, wz] of [[-0.08, -0.09], [0.08, -0.09], [-0.08, 0.09], [0.08, 0.09]]) b.box(DKM, x + 0.5 + wx, 0.81, z + 0.4 + wz, 0.07, 0.07, 0.03); b.box(MW, x + 0.6, 0.87, z + 0.4, 0.04, 0.03, 0.08);
        b.box(C(0xe9e6da), x + 1.2, 0.786, z + 0.3, 0.17, 0.012, 0.06); for (let i = 0; i < 5; i++) bar(b, C(sc[i % 4]), [x + 1.14 + i * 0.03, 0.8, z + 0.3], [x + 1.0 + i * 0.05, 0.8, z + 0.55], 0.006); b.box(C(0x1f7a6a), x + 1.05, 0.786, z + 0.6, 0.11, 0.012, 0.07); }
      if (t === 1) { b.box(C(0xb8322a), x + 0.5, 0.87, z + 0.45, 0.42, 0.18, 0.2); b.box(DKM, x + 0.5, 0.98, z + 0.45, 0.2, 0.03, 0.03); b.box(C(0x2f7a55), x + 1.25, 0.783, z + 0.45, 0.6, 0.006, 0.45, 'D'); b.box(ALU, x + 1.2, 0.79, z + 0.5, 0.32, 0.004, 0.03); }
      if (t === 2) { b.box(C(0x8f959b), x + 0.5, 0.79, z + 0.45, 0.32, 0.016, 0.22); cardZ(b, scr(0), x + 0.34, 0.8, z + 0.345, 0.32, 0.2, 1, true); b.box(C(0x8f959b), x + 0.5, 0.9, z + 0.335, 0.33, 0.21, 0.01); b.box(DKM, x + 1.3, 0.82, z + 0.4, 0.14, 0.08, 0.12); bar(b, ALU, [x + 1.4, 0.8, z + 0.6], [x + 1.48, 0.95, z + 0.6], 0.012); }
      if (t === 3) { const P = C(0xe2c58f); b.box(P, x + 0.9, 0.8, z + 0.45, 0.9, 0.03, 0.09); b.box(P, x + 0.8, 0.805, z + 0.45, 0.16, 0.012, 0.8); b.box(P, x + 1.3, 0.83, z + 0.45, 0.012, 0.09, 0.1); b.box(P, x + 1.28, 0.8, z + 0.45, 0.1, 0.012, 0.3); pile(b, x + 0.3, 0.78, z + 0.6, 4, 21, 0.3, 0.22); } });
    b.slab(TT, 2.3, 0.86, 0.05, 3.6, 0.05, 0.6); b.slab(C(0x4a6a8a), 2.3, 0, 0.1, 3.6, 0.86, 0.5); for (let i = 1; i < 6; i++) b.box(DKM, 2.3 + i * 0.6, 0.45, 0.605, 0.012, 0.8, 0.01); R.col(2.3, 0, 5.9, 0.65, 0.95);
    cardZ(b, U('pegboard', 480, 195, (g, W2, Hh) => { BX(g, 0, 0, W2, Hh, '#c9a878'); g.fillStyle = 'rgba(60,40,20,0.35)'; for (let x = 8; x < W2; x += 12) for (let y = 8; y < Hh; y += 12) g.fillRect(x, y, 2, 2);
      g.strokeStyle = '#2a2c2f'; g.lineCap = 'round'; for (let i = 0; i < 7; i++) { const x = 30 + i * 30; g.lineWidth = 5; g.beginPath(); g.moveTo(x, 30); g.lineTo(x, 110 + (i % 3) * 14); g.stroke(); g.fillStyle = ['#d9482b', '#e0b020', '#2f6fb5'][i % 3]; g.fillRect(x - 5, 100 + (i % 3) * 14, 10, 40); }
      for (let i = 0; i < 4; i++) { const x = 262 + i * 34; g.fillStyle = '#8f959b'; g.fillRect(x, 26, 22, 14); g.fillStyle = '#7a5a3c'; g.fillRect(x + 8, 40, 6, 70); } g.strokeStyle = '#8f959b'; g.lineWidth = 6; for (let i = 0; i < 3; i++) { g.beginPath(); g.arc(424, 46 + i * 50, 16 - i * 3, 0.6, 5.6); g.stroke(); } BX(g, 240, 136, 150, 40, '#e9e6da', '#555', 2); TX(g, '工具用后归位', 315, 157, 20, '#b3261e', CJK, 'center', 'bold'); }), 2.5, 1.1, 0.012, 3.2, 1.3, 1);
    b.box(GREYM, 5.5, 1.2, 0.4, 0.06, 0.7, 0.06); b.box(GREYM, 5.5, 1.5, 0.3, 0.16, 0.2, 0.3); b.box(GREYM, 5.5, 0.93, 0.3, 0.26, 0.04, 0.3); b.box(C(0x2f6fb5), 3.0, 0.97, 0.45, 0.2, 0.12, 0.14); b.box(GREYM, 3.0, 1.0, 0.56, 0.1, 0.04, 0.1);
    b.slab(TT, W - 0.7, 0.76, 1.2, 0.7, 0.04, 4.8); b.slab(C(0xe3e0d4), W - 0.66, 0, 1.25, 0.62, 0.76, 4.7); R.col(W - 0.7, 1.2, W, 6.0, 0.85);
    for (const z of [1.8, 3.0, 4.2]) { for (const [dx, dz] of [[-0.2, -0.2], [0.2, -0.2], [-0.2, 0.2], [0.2, 0.2]]) b.box(DKM, W - 0.35 + dx, 1.05, z + dz, 0.035, 0.5, 0.035, 'UD'); b.box(DKM, W - 0.35, 0.815, z, 0.46, 0.03, 0.46); b.box(DKM, W - 0.35, 1.315, z, 0.46, 0.03, 0.46); b.box(ALU, W - 0.35, 0.9, z, 0.3, 0.01, 0.3); b.box(C(0xf2801c), W - 0.35, 0.94, z, 0.08, 0.07 + (z % 1) * 0.1, 0.08); b.box(LAMP, W - 0.35, 1.295, z, 0.3, 0.008, 0.04, 'U'); }
    b.slab(C(0x8f959b), W - 0.68, 0.8, 4.9, 0.64, 0.34, 0.9); b.box(C(0x20262b, 'gloss'), W - 0.36, 1.145, 5.35, 0.5, 0.01, 0.6); cardX(b, signCard('激光 · 当心', '#f4d21f', '#222222', 200, 70), W - 0.685, 0.88, 5.1, 0.4, 0.14, -1);
    b.slab(TT, W - 0.3, 1.55, 1.4, 0.3, 0.03, 4.2); for (let i = 0; i < 9; i++) b.cyl(C(sc[i % 4]), W - 0.15, 1.58 + (i % 2) * 0.07, 1.6 + Math.floor(i / 2) * 0.5, 0.1, 0.065, 10);
    b.slab(MW, 0.6, 0, D - 0.5, 6.8, 0.85, 0.45); b.slab(TT, 0.58, 0.85, D - 0.52, 6.84, 0.03, 0.5); for (let i = 0; i < 14; i++) for (let j = 0; j < 3; j++) b.box(C([0xd9482b, 0xe0b020, 0x2f6fb5, 0x2f8a55, 0x8f959b][(i * 3 + j * 2) % 5]), 0.86 + i * 0.48, 0.16 + j * 0.27, D - 0.505, 0.42, 0.22, 0.012, 'S'); R.col(0.6, D - 0.55, 7.4, D, 0.9);
    cardX(b, U('wbMaker', 360, 156, (g, W2, Hh) => { BX(g, 0, 0, W2, Hh, '#fbfbf8', '#9aa0a6', 4); TX(g, '桥梁承重挑战  ·  第三周', 14, 20, 16, '#1f4fa0', KAI, 'left', 'bold'); g.strokeStyle = '#b3261e'; g.lineWidth = 2; g.beginPath(); g.moveTo(30, 110); g.lineTo(170, 110); for (let i = 0; i < 7; i++) { g.moveTo(30 + i * 20, 110); g.lineTo(40 + i * 20, 80); g.lineTo(50 + i * 20, 110); } g.moveTo(40, 80); g.lineTo(160, 80); g.stroke();
      ['1. 画草图', '2. 激光切割', '3. 胶合、测试', '4. 改进再测'].forEach((s, i) => TX(g, s, 200, 52 + i * 24, 15, '#222', KAI)); TX(g, 'F', 100, 62, 14, '#1a7a3c', KAI, 'center'); }), 0.02, 0.95, 2.6, 3.0, 1.3, 1);
    cardX(b, scr(3), 0.035, 1.25, 6.6, 1.6, 1.0, 1, true); b.box(DKM, 0.02, 1.75, 7.4, 0.03, 1.06, 1.66, 'W');
    cardY(b, U('track', 320, 274, (g, W2, Hh) => { BX(g, 0, 0, W2, Hh, '#f7f7f3'); g.strokeStyle = '#111'; g.lineWidth = 9; g.lineJoin = 'round'; g.beginPath(); g.moveTo(50, 60); g.bezierCurveTo(160, 10, 290, 60, 250, 130); g.bezierCurveTo(220, 190, 300, 230, 220, 244); g.bezierCurveTo(120, 262, 30, 230, 70, 160); g.bezierCurveTo(100, 110, 10, 100, 50, 60); g.stroke(); BX(g, 140, 120, 34, 34, '#d9482b'); BX(g, 20, 20, 26, 26, '#2f8a55'); }), 2.6, 0.012, 6.6, 2.8, 2.4);
    for (const [x, z, sx, sz] of [[4.0, 6.55, 2.9, 0.05], [4.0, 9.05, 2.9, 0.05], [2.575, 7.8, 0.05, 2.5], [5.425, 7.8, 0.05, 2.5]]) b.box(TT, x, 0.04, z, sx, 0.08, sz, 'D');
    for (const [x, z, h] of [[3.4, 7.2, 0x2f6fb5], [4.7, 8.4, 0xd9482b]]) { b.box(C(h), x, 0.07, z, 0.2, 0.06, 0.14); b.box(DKM, x, 0.05, z, 0.12, 0.08, 0.18); }
    cardX(b, poster('安全操作规程', '#c2410c', 2), W - 0.012, 1.3, 6.6, 0.6, 0.84, -1); cardX(b, poster('创客马拉松', '#6d3fa0', 3), W - 0.012, 1.3, 7.4, 0.6, 0.84, -1);
    b.box(ALU, W / 2, CU - 0.3, D / 2, 0.3, 0.05, D - 1); ceilLights(R, 2, 3); R.pot(0.4, 9.6, 0.34, 0.88, 0.25); }

  // ---- storey 4, room A: art studio
  { const R = roomA(1), { b, W, D } = R, CX = 5.2, CZ = 5.6, r = rng(81), CER2 = C(0xf3f1ea); roomShell(R, lm('boards'), DA, RIBA);
    b.cyl(C(0x8a6a48), CX, 0, CZ, 0.07, 0.7, 8); b.cyl(WOOD, CX, 0.7, CZ, 0.65, 0.04, 20); lathe(b, C(0x6a86b8), CX, CZ, [[0.72, 0.42], [0.7, 0.6], [0.67, 0.745], [0.2, 0.752]], 14);            // still life on a draped table
    lathe(b, CER2, CX - 0.15, CZ - 0.1, [[0.12, 0.75], [0.14, 0.8], [0.09, 0.86], [0.16, 0.95], [0.17, 1.02], [0.06, 1.07], [0.1, 1.14], [0.115, 1.22], [0.09, 1.3], [0.02, 1.33]], 10);
    lathe(b, C(0x2f5f9a, 'gloss'), CX + 0.25, CZ + 0.15, [[0.06, 0.75], [0.11, 0.82], [0.1, 0.92], [0.04, 1.0], [0.055, 1.03]], 10); b.box(CER2, CX + 0.2, 0.812, CZ - 0.2, 0.12, 0.12, 0.12); lathe(b, CER2, CX, CZ + 0.32, [[0.09, 0.752], [0.005, 0.95]], 10);
    for (const [dx, dz, h] of [[-0.2, 0.26, 0xc8362c], [-0.3, 0.16, 0xd9a22b], [-0.12, 0.34, 0x7fa83a]]) lathe(b, C(h), CX + dx, CZ + dz, [[0.005, 0.752], [0.045, 0.77], [0.05, 0.8], [0.03, 0.835], [0.005, 0.84]], 8);
    R.col(CX - 0.6, CZ - 0.6, CX + 0.6, CZ + 0.6, 0.8); bar(b, DKM, [3.7, 0, 3.9], [3.7, 1.9, 3.9], 0.03); b.box(DKM, 3.8, 1.9, 4.0, 0.22, 0.16, 0.22); b.box(LAMP, 3.86, 1.84, 4.06, 0.14, 0.02, 0.14);
    for (let i = 0; i < 9; i++) { const f = -2.0 + i * 0.5, px = CX + 2.9 * Math.cos(f), pz = CZ + 2.9 * Math.sin(f); R.put('easel', px, pz, -f); R.put('stool', CX + 3.65 * Math.cos(f), CZ + 3.65 * Math.sin(f), i, [0x8a6a48, 0x5a6068, 0xb5653a][i % 3]);
      R.sub(px, pz, -f); b.box(C(0xe9e4d6), 0.03, 1.16, 0, 0.02, 0.78, 0.6); cardX(b, i % 3 === 2 ? art(2) : sketch(i % 4), 0.045, 0.79, -0.28, 0.56, 0.74, 1); R.fr(); }
    for (let i = 0; i < 10; i++) { const z = 2.3 + (i % 5) * 1.25, y = i < 5 ? 1.0 : 1.85; cardX(b, art((i * 5 + 1) % 6), 0.03, y, z, 0.86, 0.645, 1); b.box(C(0x8a6a48), 0.015, y + 0.3225, z + 0.43, 0.03, 0.72, 0.94, 'W'); }
    tbl(b, 1.0, 8.6, 0.7, 1.5); pile(b, 1.3, 0.74, 9.0, 5, 12, 0.3, 0.4); for (let i = 0; i < 5; i++) b.cyl(C([0xd9482b, 0xe0b020, 0x2f6fb5, 0x2f8a55, 0xf2f2ee][i]), 1.2 + (i % 2) * 0.12, 0.74, 9.6 + i * 0.09, 0.035, 0.11, 8); R.col(1.0, 8.6, 1.7, 10.1, 0.8);
    b.slab(C(0xb9a888), 2.4, 0, 0.05, 2.4, 0.95, 0.75); for (let i = 1; i < 8; i++) b.box(DKM, 3.6, i * 0.118, 0.805, 2.3, 0.008, 0.01); for (let i = 0; i < 6; i++) b.cyl(C(0xf1ece0), 2.7 + i * 0.13, 0.95, 0.3 + (i % 2) * 0.12, 0.045, 0.75, 8); R.col(2.4, 0, 4.8, 0.82, 1);
    for (const x of [5.2, 6.8]) b.box(GREYM, x, 0.8, 0.35, 0.03, 1.6, 0.6); for (let i = 0; i < 7; i++) { b.box(GREYM, 6.0, 0.25 + i * 0.2, 0.35, 1.6, 0.012, 0.6); if (i % 3 !== 1) b.box(C([0xf1ece0, 0xe6d9b8, 0xdfe6ea][i % 3]), 5.9 + (i % 2) * 0.2, 0.262 + i * 0.2, 0.35, 1.1, 0.006, 0.5); } R.col(5.2, 0, 6.8, 0.7, 1.7);
    b.slab(C(0xe3e0d4), W - 0.6, 0, 1.5, 0.6, 0.85, 4.0); b.slab(STL, W - 0.62, 0.85, 1.5, 0.62, 0.03, 4.0); for (const z of [2.3, 4.3]) { b.box(C(0x55595e), W - 0.32, 0.882, z, 0.42, 0.006, 0.6); bar(b, STL, [W - 0.08, 0.88, z], [W - 0.08, 1.12, z], 0.025); bar(b, STL, [W - 0.08, 1.12, z], [W - 0.24, 1.12, z], 0.025); }
    for (let i = 0; i < 14; i++) b.cyl(C([0xd9482b, 0xe0b020, 0x2f6fb5, 0x2f8a55, 0xf2f2ee, 0x7a4fa0, 0x111111][i % 7]), W - 0.12, 0.88, 2.8 + i * 0.085, 0.032, 0.13, 7); for (let i = 0; i < 3; i++) { b.cyl(C(0x9fc3cc), W - 0.4, 0.88, 4.9 + i * 0.16, 0.05, 0.12, 8); bar(b, C(0x8a6a48), [W - 0.4, 0.95, 4.9 + i * 0.16], [W - 0.44, 1.2, 4.93 + i * 0.16], 0.012); }
    R.col(W - 0.62, 1.5, W, 5.5, 0.9); b.slab(WOOD, W - 0.35, 1.5, 1.6, 0.35, 0.03, 3.8); lathe(b, CER2, W - 0.18, 2.2, [[0.005, 1.53], [0.13, 1.6], [0.14, 1.68], [0.08, 1.78], [0.005, 1.8]], 10); b.cyl(CER2, W - 0.18, 1.53, 3.0, 0.09, 0.26, 12); lathe(b, CER2, W - 0.18, 3.8, [[0.11, 1.53], [0.005, 1.8]], 10); b.box(CER2, W - 0.18, 1.63, 4.6, 0.2, 0.2, 0.2);
    for (let i = 0; i < 4; i++) { b.slab(WOOD, W - 0.5, 0.05 + i * 0.5, 6.2, 0.5, 0.03, 3.6); if (i < 3) pile(b, W - 0.25, 0.08 + i * 0.5, 6.7 + i * 0.9, 6, 30 + i, 0.4, 0.5); } for (const z of [6.2, 9.77]) b.slab(WOOD, W - 0.5, 0, z, 0.5, 1.6, 0.03); R.col(W - 0.5, 6.2, W, 9.8, 1.6);
    for (let i = 0; i < 16; i++) b.box(C([0xd9482b, 0xe0b020, 0x2f6fb5, 0x2f8a55, 0xf2f2ee][i % 5]), 1.5 + r() * 7, 0.007, 1.5 + r() * 8.5, 0.08 + r() * 0.25, 0.002, 0.06 + r() * 0.2, 'D');
    ceilLights(R, 3, 3); drape(b, 0.9, 1.6, D - 0.07, 0xf1eee4); drape(b, 8.2, 8.9, D - 0.07, 0xf1eee4); R.pot(0.45, 2.0, 0.34); }

  // ---- storey 4, room B: music room
  { const R = roomB(1), { b, W, D } = R, PN = C(0x141518, 'gloss'), RIS = C(0x9a7b55); roomShell(R, lm('boards'), DB, RIBB);
    for (let j = 0; j < 3; j++) { const x0 = W - 2.95 + j * 0.95, h = 0.2 * (j + 1); b.slab(RIS, x0, 0, 1.0, j < 2 ? 0.94 : 0.95 + 0.1, h, D - 2.0, 'D'); b.slab(DKM, x0 - 0.01, h - 0.04, 1.0, 0.03, 0.045, D - 2.0, 'D'); R.col(x0, 1.0, x0 + 0.94, D - 1.0, h);
      for (let i = 0; i < 7; i++) R.put('chair', x0 + 0.5, 1.7 + i * 1.2, Math.PI, 0x8a2f2b, h); }
    R.sub(2.0, 8.0, 0.45); polyPrism(b, PN, [[-0.75, -0.72], [-0.75, 0.72], [0.25, 0.72], [0.8, 0.55], [1.08, 0.2], [1.02, -0.35], [0.6, -0.72]], 0.62, 0.94, true, true);              // grand piano
    b.box(PN, -0.87, 0.71, 0, 0.26, 0.1, 1.44); { const u = U('keys', 512, 44, (g, W2, Hh) => { BX(g, 0, 0, W2, Hh, '#fbfbf6'); for (let i = 0; i < 52; i++) { g.fillStyle = '#9a9a94'; g.fillRect(i * W2 / 52, 0, 1, Hh); if (![2, 6].includes(i % 7)) BX(g, (i + 0.7) * W2 / 52, 0, W2 / 52 * 0.6, Hh * 0.62, '#111'); } });
      texQuad(b, PR, [-0.99, 0.765, -0.7], [-0.99, 0.765, 0.7], [-0.84, 0.765, 0.7], [-0.84, 0.765, -0.7], u[0], u[1], u[2], u[3]); }
    b.box(PN, -0.6, 1.08, 0, 0.02, 0.26, 0.8); cardX(b, U('score', 100, 70, (g, W2, Hh) => { BX(g, 0, 0, W2, Hh, '#fbfaf2'); for (let s = 0; s < 4; s++) { for (let l = 0; l < 5; l++) { g.fillStyle = '#333'; g.fillRect(6, 8 + s * 16 + l * 2, W2 - 12, 0.6); } for (let n = 0; n < 9; n++) { g.beginPath(); g.ellipse(12 + n * 9.5, 9 + s * 16 + ((n * 5 + s * 3) % 9), 2, 1.5, -0.3, 0, TAU); g.fill(); } } }), -0.612, 0.97, -0.3, 0.6, 0.4, -1);
    for (const [x, z] of [[-0.5, -0.55], [-0.5, 0.55], [0.8, 0]]) b.cyl(PN, x, 0, z, 0.045, 0.62, 8); b.box(PN, -1.5, 0.47, 0, 0.36, 0.07, 0.8); for (const z of [-0.33, 0.33]) b.box(PN, -1.5, 0.22, z, 0.3, 0.44, 0.04, 'UD'); R.fr(); R.col(1.0, 6.9, 3.2, 9.2, 1.0);
    b.slab(RIS, 2.1, 0, 4.4, 0.9, 0.15, 0.9); R.col(2.1, 4.4, 3.0, 5.3, 0.15); R.put('mstand', 3.15, 4.85, Math.PI);
    for (let i = 0; i < 6; i++) { const z = 2.0 + i * 1.15; R.put('chair', 4.35, z, Math.PI, 0x2f4f7f); R.put('mstand', 3.8, z, 0); R.sub(3.8, z, 0); cardX(b, U('score'), 0.024, 1.07, -0.2, 0.4, 0.27, 1); R.fr(); }
    cardX(b, U('staff', 440, 156, (g, W2, Hh) => { BX(g, 0, 0, W2, Hh, '#fbfbf8', '#9aa0a6', 4); for (let s = 0; s < 3; s++) for (let l = 0; l < 5; l++) { g.fillStyle = '#b9bcc0'; g.fillRect(16, 24 + s * 46 + l * 7, W2 - 32, 1.5); }
      g.fillStyle = '#1d1d1f'; for (let n = 0; n < 14; n++) { const x = 60 + n * 24, y = 24 + ((n * 3) % 6) * 3.5; g.beginPath(); g.ellipse(x, y + 14, 5, 3.6, -0.35, 0, TAU); g.fill(); g.fillRect(x + 4, y - 8, 1.6, 22); } TX(g, '《送别》  李叔同', 150, 84, 15, '#1f4fa0', KAI, 'left', 'bold'); TX(g, '4/4   ♩ = 72', 18, 84, 14, '#b3261e', KAI); TX(g, '长亭外，古道边，芳草碧连天', 18, 130, 16, '#222', KAI); }), 0.02, 0.95, 2.4, 3.6, 1.276, 1);
    for (const z of [1.5, 6.9]) { b.box(DKM, 0.16, 2.7, z, 0.26, 0.42, 0.3); b.box(C(0x55595e), 0.295, 2.7, z, 0.01, 0.3, 0.2); }
    b.slab(C(0x9a7b55), 2.2, 0, 0.05, 2.8, 2.0, 0.5); b.quad(GRL, [2.25, 0.5, 0.56], [4.95, 0.5, 0.56], [4.95, 1.95, 0.56], [2.25, 1.95, 0.56]); for (let i = 0; i < 5; i++) lathe(b, C([0xb5653a, 0x8a2f2b, 0xd9a22b][i % 3]), 2.5 + i * 0.55, 0.3, [[0.1, 1.0], [0.13, 1.25], [0.15, 1.38], [0.14, 1.4]], 10); R.col(2.2, 0, 5.0, 0.6, 2);
    for (const x of [1.3, 2.9]) { b.box(DKM, x + 0.65, 0.76, D - 0.5, 1.3, 0.1, 0.32); const u = U('keys'); texQuad(b, PR, [x + 1.28, 0.812, D - 0.62], [x + 0.02, 0.812, D - 0.62], [x + 0.02, 0.812, D - 0.5], [x + 1.28, 0.812, D - 0.5], u[0], u[1], u[2], u[3]); for (const s of [0.2, 1.1]) { bar(b, DKM, [x + s, 0.72, D - 0.62], [x + s, 0, D - 0.3], 0.03); bar(b, DKM, [x + s, 0.72, D - 0.38], [x + s, 0, D - 0.7], 0.03); } R.put('stool', x + 0.65, D - 1.0, 0, 0x2a2c2f); }
    R.col(1.3, D - 0.7, 4.2, D, 0.85);
    for (let i = 0; i < 5; i++) { b.box(C([0x4f7396, 0xc27a2c][i % 2]), W - 0.02, 2.4, 1.6 + i * 1.9, 0.03, 1.0, 1.4, 'E'); }
    for (let i = 0; i < 12; i++) b.box(C([0xb8322a, 0xe0b020, 0x2f8a55, 0x2f6fb5][i % 4]), 5.0 - 0.3, 0.86, 9.2 + i * 0.07 - 0.4, 0.5 - i * 0.02, 0.02, 0.055); b.box(DKM, 4.7, 0.42, 9.2, 0.5, 0.84, 0.9, 'U');
    ceilLights(R, 2, 3); drape(b, 0.45, 1.7, D - 0.08, 0x7a2f3a, 0.1, 3.3); drape(b, 6.4, 7.65, D - 0.08, 0x7a2f3a, 0.1, 3.3); R.pot(0.45, 0.5, 0.3); }

  // ---- storey 5, room A: lecture room with stepped rows
  { const R = roomA(2), { b, W, D } = R, CP = C(0x49536a), cols = [0x2f4f7f, 0x35588c, 0x2b4a70]; roomShell(R, lm('carpet'), DA, RIBA);
    for (let j = 1; j <= 5; j++) { const x0 = 3.2 + j + 0.005, x1 = j < 5 ? x0 + 0.99 : W, h = 0.16 * j; b.slab(CP, x0, 0, 0, x1 - x0, h, D, 'D'); R.col(x0, 0, x1, D, h); for (const z of [0.55, 5.5, 10.4]) b.box(LAMP, x0 - 0.004, h - 0.035, z, 0.012, 0.02, 0.9, 'E'); }
    for (let j = 0; j < 6; j++) for (const z0 of [1.2, 6.1]) { for (let i = 0; i < 6; i++) R.put('seat', 3.75 + j, z0 + 0.31 + i * 0.62, Math.PI, cols[(i + j) % 3], 0.16 * j); R.col(3.45 + j, z0, 4.05 + j, z0 + 3.72, 0.9, 0.16 * j); }
    cardX(b, slide('光合作用 —— 细胞的能量工厂', ['叶绿体：类囊体与基质', '光反应 → ATP、NADPH', '暗反应：卡尔文循环', '思考：影响速率的因素？'], '#12303a'), 0.02, 1.0, 3.4, 4.0, 2.25, 1, true); b.box(ALU, 0.012, 2.125, 5.4, 0.02, 2.33, 4.08, 'W');
    b.slab(C(0x8a6a48, 'gloss'), 1.5, 0, 2.3, 0.5, 1.1, 0.6); b.box(C(0x8f959b), 1.75, 1.115, 2.6, 0.3, 0.014, 0.22); bar(b, DKM, [1.6, 1.1, 2.4], [1.72, 1.36, 2.42], 0.014); R.col(1.5, 2.3, 2.0, 2.9, 1.1);
    tbl(b, 1.3, 4.3, 0.8, 2.6, 0.9, C(0x2a2d30, 'gloss'), GREYM); R.col(1.3, 4.3, 2.1, 6.9, 0.9); for (let i = 0; i < 4; i++) lathe(b, C([0x9fc3cc, 0xb7e0c8, 0xf2d27c, 0xe6a6a0][i]), 1.7, 4.8 + i * 0.5, [[0.05, 0.9], [0.07, 0.94], [0.02, 1.02], [0.02, 1.1]], 8); b.box(C(0x8f959b), 1.7, 0.96, 6.6, 0.16, 0.12, 0.12);
    for (let z = 0.3; z < D - 0.2; z += 0.14) b.box(C(0xb98a55), W - 0.03, 2.1, z, 0.04, 2.5, 0.06, 'UDE');
    for (const [x, z] of [[2.6, 2.9], [2.6, 8.0], [5.6, 2.9], [5.6, 8.0], [8.3, 2.9], [8.3, 8.0]]) { b.box(MW, x, CU - 0.32, z, 2.2, 0.05, 3.6); for (const [dx, dz] of [[-0.6, -1], [0.6, -1], [-0.6, 1], [0.6, 1]]) b.box(LAMP, x + dx, CU - 0.35, z + dz, 0.22, 0.012, 0.22, 'U'); }
    b.box(MW, 3.4, CU - 0.5, 5.4, 0.36, 0.12, 0.3); for (const z of [2.2, 8.6]) b.box(DKM, 0.15, 2.8, z, 0.24, 0.4, 0.28);
    drape(b, 0.9, 6.8, D - 0.08, 0x3d4a66, 0.1, 3.3); cardX(b, poster('学术讲座预告', '#0f7a6a', 4), W - 0.06, 1.3, 0.3, 0.6, 0.84, -1); }

  // ---- storey 5, room B: staff room
  { const R = roomB(2), { b, W, D } = R, SC = C(0x6f7c88), SOFA = C(0x4a5a6e), TOPG = C(0xe9e6dc, 'gloss'); roomShell(R, lm('tile'), DB, RIBB);
    [[2.4, 2.4], [5.6, 2.4], [2.4, 5.4], [5.6, 5.4]].forEach(([xc, zc], q) => { b.box(SC, xc, 0.62, zc, 0.04, 1.24, 2.44); b.box(SC, xc, 0.62, zc, 1.4, 1.24, 0.04); R.col(xc - 0.7, zc - 1.2, xc + 0.7, zc + 1.2, 1.25);
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) { const i = (sx + 1) + (sz + 1) / 2 + q; b.slab(TOPG, sx > 0 ? xc + 0.03 : xc - 0.68, 0.7, sz > 0 ? zc + 0.03 : zc - 1.2, 0.65, 0.04, 1.17); b.box(GREYM, xc + sx * 0.66, 0.35, zc + sz * 1.185, 0.03, 0.7, 0.03, 'UD');
        pcAt(b, xc + sx * 0.2, 0.74, zc + sz * 0.55, sx, i % 3); pile(b, xc + sx * 0.42, 0.74, zc + sz * 1.0, 4 + (i * 3) % 8, i * 7 + 2, 0.19, 0.26); b.cyl(C([0xd9482b, 0x2f6fb5, 0xf2f2ee, 0x2f8a55][i % 4]), xc + sx * 0.5, 0.74, zc + sz * 0.16, 0.04, 0.1, 8);
        R.put('task', xc + sx * 1.02, zc + sz * 0.6 + (i % 3 - 1) * 0.06, sx > 0 ? Math.PI + (i % 3 - 1) * 0.3 : (i % 3 - 1) * 0.3, [0x3a4a5c, 0x2a2c2f, 0x5a3f3a][i % 3]); } });
    b.slab(C(0xd9d6ca), 2.2, 0, 0.05, 3.8, 1.95, 0.45); cardZ(b, U('binders', 256, 62, (g, W2, Hh) => { const r = rng(61); BX(g, 0, 0, W2, Hh, '#b9b6aa'); let x = 2; while (x < W2 - 6) { const w = 7 + r() * 5; BX(g, x, 3, w - 1, Hh - 6, ['#2f5fa8', '#b8322a', '#2f8a55', '#3a3d42', '#e0b020', '#f2efe6'][Math.floor(r() * 6)]); BX(g, x + 1.5, 10, w - 4, 16, '#fff'); x += w; } }), 2.25, 1.0, 0.505, 3.7, 0.9, 1);
    for (let i = 1; i < 5; i++) b.box(DKM, 2.2 + i * 0.76, 0.5, 0.505, 0.012, 0.96, 0.01); R.col(2.2, 0, 6.0, 0.55, 2);
    cardX(b, U('wbSched', 360, 160, (g, W2, Hh) => { BX(g, 0, 0, W2, Hh, '#fbfbf8', '#9aa0a6', 4); TX(g, '本周工作安排', 14, 18, 16, '#b3261e', KAI, 'left', 'bold'); g.strokeStyle = '#1f4fa0'; g.lineWidth = 1.2; for (let i = 0; i <= 5; i++) { g.beginPath(); g.moveTo(14 + i * 66, 34); g.lineTo(14 + i * 66, 150); g.stroke(); } for (let j = 0; j <= 4; j++) { g.beginPath(); g.moveTo(14, 34 + j * 29); g.lineTo(344, 34 + j * 29); g.stroke(); }
      ['周一', '周二', '周三', '周四', '周五'].forEach((s, i) => TX(g, s, 47 + i * 66, 48, 13, '#1f4fa0', KAI, 'center', 'bold')); [['教研会', 0, 1], ['公开课', 1, 2], ['月考命题', 2, 1], ['家长会', 4, 3], ['集体备课', 3, 2], ['值周', 0, 3]].forEach(([s, i, j]) => TX(g, s, 47 + i * 66, 48 + j * 29, 12, '#222', KAI, 'center')); }), 0.02, 0.95, 2.8, 2.9, 1.29, 1);
    cardX(b, poster('教师发展中心通知', '#1f6fb5', 5), 0.02, 1.2, 6.2, 0.6, 0.84, 1); cardX(b, poster('党建园地', '#b3261e', 6), 0.02, 1.2, 7.0, 0.6, 0.84, 1);
    b.slab(C(0xe6e4dc), W - 0.65, 0, 1.3, 0.6, 1.0, 0.6); b.box(DKM, W - 0.35, 1.02, 1.6, 0.56, 0.04, 0.5); b.box(C(0x3fb0e0), W - 0.6, 0.9, 1.45, 0.02, 0.08, 0.14); b.slab(MW, W - 0.36, 0, 2.5, 0.32, 1.0, 0.32); b.cyl(C(0x7fb7e6), W - 0.2, 1.0, 2.66, 0.13, 0.36, 10);
    b.slab(MW, W - 0.64, 0, 3.3, 0.6, 1.65, 0.62); b.box(STL, W - 0.65, 1.0, 3.4, 0.02, 0.4, 0.03); R.col(W - 0.7, 1.2, W, 4.0, 1.7);
    b.slab(SOFA, W - 0.95, 0.12, 7.6, 0.9, 0.3, 2.2); b.slab(SOFA, W - 0.25, 0.12, 7.6, 0.2, 0.75, 2.2); for (const z of [7.4, 9.8]) b.slab(SOFA, W - 0.95, 0.12, z, 0.9, 0.5, 0.2); for (let i = 0; i < 3; i++) b.slab(C(0x566880), W - 0.9, 0.42, 7.63 + i * 0.725, 0.62, 0.1, 0.7); R.col(W - 0.95, 7.4, W, 10.0, 0.8);
    tbl(b, W - 2.25, 8.15, 0.6, 1.1, 0.42, C(0x8a6a48, 'gloss'), DKM); pile(b, W - 1.95, 0.42, 8.5, 3, 77, 0.22, 0.3); b.cyl(MW, W - 1.9, 0.42, 9.0, 0.045, 0.09, 8); b.box(C(0x8a7a6a), W - 1.9, 0.006, 8.7, 2.9, 0.004, 2.8, 'D');
    R.put('tub', W - 3.2, 8.2, 0, 0x5f7f8f, 0, 1.2); R.put('tub', W - 3.2, 9.3, 0.3, 0x5f7f8f, 0, 1.2); R.pot(W - 0.45, 10.25, 0.42); R.pot(0.5, 10.0, 0.4); R.pot(0.4, 0.45, 0.3);
    b.box(MW, 0.03, 2.55, 1.2, 0.03, 0.3, 0.3); ceilLights(R, 2, 3); drape(b, 0.45, 1.3, D - 0.07, 0xe6dcc0); drape(b, 6.8, 7.65, D - 0.07, 0xe6dcc0); }

  // ---- storey 6, room B: the school's television studio with its control room
  { const R = roomB(3), { b, W, D } = R, DW = C(0x3b3f45), XP = 5.4, DESK = C(0x1f4f8a, 'gloss'); roomShell(R, lm('carpet'), DB, [], DW);
    xWall(b, XP - 0.04, -1, 0, D, [[0.4, 1.3, 0, 2.1], [2.0, 8.0, 1.0, 2.2]], DW); xWall(b, XP + 0.04, 1, 0, D, [[0.4, 1.3, 0, 2.1], [2.0, 8.0, 1.0, 2.2]], DW); b.quad(GRL, [XP, 1.0, 2.0], [XP, 1.0, 8.0], [XP, 2.2, 8.0], [XP, 2.2, 2.0]);
    for (const [z, y0, y1] of [[2.0, 1.0, 2.2], [8.0, 1.0, 2.2], [0.4, 0, 2.1], [1.3, 0, 2.1]]) b.box(ALU, XP, (y0 + y1) / 2, z, 0.12, y1 - y0, 0.05); b.box(ALU, XP, 1.0, 5, 0.12, 0.05, 6); b.box(ALU, XP, 2.2, 5, 0.12, 0.05, 6); R.col(XP - 0.1, 1.3, XP + 0.1, D, CU); R.col(XP - 0.1, 0, XP + 0.1, 0.4, CU);
    cardX(b, U('backdrop', 440, 220, (g, W2, Hh) => { const gr = g.createLinearGradient(0, 0, W2, Hh); gr.addColorStop(0, '#0b2a5c'); gr.addColorStop(0.6, '#1f5fa8'); gr.addColorStop(1, '#3fa0d8'); g.fillStyle = gr; g.fillRect(0, 0, W2, Hh); g.strokeStyle = 'rgba(255,255,255,0.18)'; g.lineWidth = 2; for (let i = 0; i < 9; i++) { g.beginPath(); g.arc(330, 250, 60 + i * 26, 3.3, 5.6); g.stroke(); }
      TX(g, '校园电视台', 34, 84, 50, '#ffffff', CJK, 'left', 'bold'); TX(g, 'CAMPUS  TV', 36, 132, 22, '#cfe6ff', CJK, 'left', 'bold'); BX(g, 34, 154, 150, 4, '#f2c94c'); TX(g, '校园新闻  每周五播出', 34, 180, 16, '#e8f2ff', CJK); }), 0.03, 0.55, 3.1, 4.4, 2.2, 1, true);
    ringWall(b, DESK, 0.4, 5.3, 2.32, -0.6, 0.6, 0, 0.75, 10, true); ringWall(b, DESK, 0.4, 5.3, 1.78, -0.6, 0.6, 0, 0.75, 10, false); ringTop(b, MW, 0.4, 5.3, 1.75, 2.36, -0.6, 0.6, 0.76, 10); ringWall(b, LAMP, 0.4, 5.3, 2.325, -0.6, 0.6, 0.1, 0.14, 10, true); R.col(1.85, 4.0, 2.75, 6.6, 0.8);
    for (const z of [4.75, 5.85]) { R.put('task', 1.55, z, 0, 0x8a2f2b); bar(b, DKM, [2.3, 0.77, z], [2.38, 0.95, z], 0.012); b.box(DKM, 2.39, 0.96, z, 0.03, 0.03, 0.03); } b.box(C(0x8f959b), 2.15, 0.77, 5.3, 0.22, 0.014, 0.3);
    for (const [x, z, pr] of [[4.2, 3.5, 0], [4.5, 5.3, 1], [4.2, 7.1, 0]]) { R.sub(x, z, Math.PI + (z - 5.3) * 0.12); for (let i = 0; i < 3; i++) bar(b, DKM, [0, 1.15, 0], [0.5 * Math.cos(i * 2.094 + 1), 0, 0.5 * Math.sin(i * 2.094 + 1)], 0.03);
      b.box(DKM, 0, 1.36, 0, 0.5, 0.22, 0.2); b.box(DKM, 0.32, 1.36, 0, 0.16, 0.14, 0.14); b.box(C(0x4f6f9a, 'gloss'), 0.405, 1.36, 0, 0.01, 0.1, 0.1); b.box(DKM, -0.2, 1.52, 0.02, 0.16, 0.1, 0.03); b.box(LAMP, 0.26, 1.5, 0, 0.02, 0.02, 0.02);
      if (pr) { b.box(DKM, 0.5, 1.36, 0, 0.03, 0.34, 0.44); b.box(C(0x16181a), 0.52, 1.36, 0, 0.005, 0.3, 0.4); } R.fr(); }
    for (const x of [1.5, 3.4]) bar(b, GREYM, [x, 3.1, 0.6], [x, 3.1, 8.0], 0.05); for (const z of [2.0, 5.3, 7.6]) bar(b, GREYM, [0.6, 3.14, z], [4.8, 3.14, z], 0.05);
    for (const [x, z] of [[1.5, 3.6], [1.5, 5.3], [1.5, 7.0], [3.4, 3.2], [3.4, 5.3], [3.4, 7.4]]) { b.box(DKM, x, 2.9, z, 0.22, 0.26, 0.22); b.box(LAMP, x, 2.765, z, 0.16, 0.012, 0.16, 'U'); bar(b, DKM, [x, 3.03, z], [x, 3.1, z], 0.03); }
    b.quad(C(0x2fb44a), [XP - 0.06, 0, D - 0.02], [0.02, 0, D - 0.02], [0.02, 3.2, D - 0.02], [XP - 0.06, 3.2, D - 0.02]); b.box(C(0x2fb44a), XP / 2, 0.008, D - 1.2, XP - 0.2, 0.004, 2.4, 'D');
    bar(b, DKM, [1.0, 0, 8.4], [1.0, 1.9, 8.4], 0.03); b.box(DKM, 1.0, 1.95, 8.45, 0.7, 0.9, 0.08); b.box(LAMP, 1.0, 1.95, 8.495, 0.62, 0.82, 0.012, 'N'); R.put('stool', 2.6, 9.6, 0, 0x2a2c2f);
    cardZ(b, U('onair', 160, 60, (g, W2, Hh) => { BX(g, 0, 0, W2, Hh, '#2a0606', '#ff3b30', 4); TX(g, '直播中 ON AIR', W2 / 2, Hh / 2 + 1, 20, '#ff5a4f', CJK, 'center', 'bold'); }), 0.95, 2.3, 0.02, 0.6, 0.225, 1, true);
    for (const [a, e] of [[[2.9, 0.012, 1.2], [4.2, 0.012, 3.4]], [[4.2, 0.012, 3.4], [4.6, 0.012, 5.2]], [[1.2, 0.012, 8.2], [3.9, 0.012, 7.2]]]) bar(b, C(0x16181a), a, e, 0.025);
    b.slab(C(0x3a3d42), XP + 0.1, 0.72, 2.2, 0.8, 0.04, 5.6); for (const z of [2.2, 5.0, 7.77]) b.slab(C(0x3a3d42), XP + 0.1, 0, z, 0.8, 0.72, 0.03); R.col(XP + 0.1, 2.2, XP + 0.9, 7.8, 0.8);
    b.box(DKM, XP + 0.55, 0.81, 5.0, 0.5, 0.1, 1.7); cardY(b, U('mixer', 340, 100, (g, W2, Hh) => { BX(g, 0, 0, W2, Hh, '#1c1e22'); for (let i = 0; i < 24; i++) { const x = 10 + i * 13.5; BX(g, x + 2, 8, 2, 60, '#55595e'); BX(g, x, 14 + (i * 17 % 40), 7, 10, ['#e6e6e6', '#f2a03c', '#3fd07a'][i % 3]); BX(g, x, 78, 7, 7, i % 4 ? '#b8322a' : '#3fd07a'); } }), XP + 0.3, 0.862, 4.15, 1.7, 0.5);
    for (const [z, kd] of [[2.9, 3], [3.6, 1], [6.4, 3], [7.1, 0]]) pcAt(b, XP + 0.28, 0.76, z, 1, kd, false); R.put('task', XP + 1.3, 3.4, Math.PI, 0x2a2c2f); R.put('task', XP + 1.3, 6.0, Math.PI - 0.3, 0x2a2c2f);
    for (let i = 0; i < 4; i++) { cardX(b, scr([3, 1, 3, 2][i]), W - 0.03, 1.3 + (i % 2) * 0.62, 2.6 + Math.floor(i / 2) * 1.0, 0.92, 0.56, -1, true); }
    b.slab(DKM, W - 0.65, 0, 8.6, 0.6, 2.0, 0.7); for (let i = 0; i < 9; i++) b.box(i % 3 ? C(0x3fd07a) : C(0xf2a03c), W - 0.655, 0.4 + i * 0.17, 8.75 + (i % 4) * 0.13, 0.01, 0.02, 0.03); R.col(W - 0.65, 8.6, W, 9.3, 2);
    for (const [x, z] of [[XP + 1.3, 2.4], [XP + 1.3, 6.4]]) b.box(LAMP, x, CU - 0.012, z, 0.5, 0.02, 0.5); }

  // ---- storey 6, room A: reading and seminar room
  { const R = roomA(3), { b, W, D } = R, SOFA = C(0x8a5a3c), wc = [0xb5653a, 0x3f6f5a, 0xcdb994, 0x5a4a6e]; roomShell(R, pbr('rubber', [0x7a6652, 2]), DA, RIBA);
    for (const zc of [2.3, 5.5, 8.7]) { R.sub(W - 0.19, zc, -Math.PI / 2); bookcase(b, null, 3.1, 5, true, ROW); R.fr(); } R.col(W - 0.4, 0.7, W, 10.3, 2.2);
    [[2.9, 3.0], [5.9, 3.0], [2.9, 6.4], [5.9, 6.4]].forEach(([x, z], t) => { b.cyl(WOOD, x, 0.7, z, 0.62, 0.04, 20); b.cyl(DKM, x, 0.03, z, 0.06, 0.67, 8, false); b.cyl(DKM, x, 0, z, 0.3, 0.03, 12); R.col(x - 0.55, z - 0.55, x + 0.55, z + 0.55, 0.75);
      for (let i = 0; i < 4; i++) { const f = 0.785 + i * 1.571; R.put('chair', x + 0.95 * Math.cos(f), z + 0.95 * Math.sin(f), Math.PI - f, wc[(i + t) % 4]); }
      pile(b, x + 0.2, 0.74, z - 0.15, 3 + t, 90 + t, 0.2, 0.27); if (t === 1) { b.cyl(C(0xc9a45c), x - 0.2, 0.74, z + 0.1, 0.07, 0.02, 10); bar(b, C(0xc9a45c), [x - 0.2, 0.76, z + 0.1], [x - 0.2, 0.86, z + 0.1], 0.015); lathe(b, C(0x2f6fb5, 'gloss'), x - 0.2, z + 0.1, [[0.005, 0.86], [0.1, 0.9], [0.15, 1.01], [0.1, 1.12], [0.005, 1.16]], 12); }
      if (t === 2) { b.box(C(0x8f959b), x - 0.15, 0.748, z + 0.15, 0.32, 0.016, 0.22); cardZ(b, scr(1), x - 0.31, 0.76, z + 0.04, 0.32, 0.2, 1, true); b.box(C(0x8f959b), x - 0.15, 0.86, z + 0.03, 0.33, 0.21, 0.01); } });
    b.slab(SOFA, 0.25, 0.12, 7.5, 0.9, 0.3, 2.2); b.slab(SOFA, 0.05, 0.12, 7.5, 0.2, 0.75, 2.2); b.slab(SOFA, 1.6, 0.12, D - 1.05, 2.2, 0.3, 0.9); b.slab(SOFA, 1.6, 0.12, D - 0.3, 2.2, 0.75, 0.2); for (let i = 0; i < 3; i++) { b.slab(C(0xa06a48), 0.3, 0.42, 7.53 + i * 0.725, 0.62, 0.1, 0.7); b.slab(C(0xa06a48), 1.63 + i * 0.725, 0.42, D - 1.0, 0.7, 0.1, 0.62); }
    R.col(0.05, 7.5, 1.15, 9.7, 0.8); R.col(1.6, D - 1.05, 3.8, D, 0.8); tbl(b, 1.7, 8.3, 1.1, 0.6, 0.42, C(0x8a6a48, 'gloss'), DKM); b.box(C(0x9a6f5a), 2.2, 0.006, 8.7, 3.2, 0.004, 2.6, 'D');
    const mag = i => U('mag' + i, 90, 120, (g, W2, Hh) => { const hue = (i * 67) % 360; BX(g, 0, 0, W2, Hh, `hsl(${hue},45%,${i % 2 ? 34 : 86}%)`); TX(g, ['读者', '科学', '少年', '博物', '作文', '英语'][i], W2 / 2, 22, 26, i % 2 ? '#fff' : '#b3261e', KAI, 'center', 'bold'); const gr = g.createLinearGradient(0, 40, W2, Hh); gr.addColorStop(0, `hsl(${(hue + 40) % 360},50%,60%)`); gr.addColorStop(1, `hsl(${(hue + 150) % 360},40%,40%)`); g.fillStyle = gr; g.fillRect(8, 40, W2 - 16, 62); ROWS(g, 10, 106, W2 - 20, 2, 5, i % 2 ? '#eee' : '#555', 2); });
    cardY(b, mag(0), 1.8, 0.425, 8.4, 0.21, 0.28); cardY(b, mag(3), 2.3, 0.425, 8.5, 0.21, 0.28);
    bar(b, C(0xc9a45c), [0.5, 0, 10.3], [0.5, 1.5, 10.3], 0.03); b.cyl(C(0xc9a45c), 0.5, 0, 10.3, 0.16, 0.03, 12); lathe(b, lm('shadeWarm'), 0.5, 10.3, [[0.22, 1.42], [0.13, 1.72]], 14);
    cardX(b, U('map', 480, 250, (g, W2, Hh) => { const r = rng(7); BX(g, 0, 0, W2, Hh, '#9cc7e0', '#6a5a3c', 6); g.fillStyle = '#b9d49a'; for (const [x, y, rx, ry] of [[110, 90, 62, 46], [150, 170, 30, 44], [250, 80, 46, 30], [262, 150, 34, 50], [352, 96, 76, 52], [400, 196, 30, 20]]) { g.beginPath(); for (let a = 0; a <= 24; a++) { const k = 0.75 + 0.5 * r(), t = a / 24 * TAU; g.lineTo(x + Math.cos(t) * rx * k, y + Math.sin(t) * ry * k); } g.fill(); }
      g.strokeStyle = 'rgba(255,255,255,0.5)'; g.lineWidth = 1; for (let i = 1; i < 8; i++) { g.beginPath(); g.moveTo(i * 60, 6); g.lineTo(i * 60, Hh - 6); g.stroke(); } for (let j = 1; j < 5; j++) { g.beginPath(); g.moveTo(6, j * 50); g.lineTo(W2 - 6, j * 50); g.stroke(); } TX(g, '世界地图（示意）', 16, 20, 14, '#3a3a3a', KAI, 'left', 'bold'); }), 0.02, 1.0, 2.2, 3.65, 1.9, 1);
    b.slab(C(0x8a6a48, 'gloss'), 0.05, 0, 2.4, 0.42, 0.8, 3.2); for (let i = 0; i < 3; i++) lathe(b, C(0xd9a520, 'metal'), 0.26, 2.9 + i * 1.1, [[0.07, 0.8], [0.02, 0.86], [0.02, 0.95], [0.09, 1.02], [0.1, 1.12]], 8); R.col(0.05, 2.4, 0.5, 5.6, 0.85);
    b.slab(WOOD, 2.4, 0, 0.02, 4.0, 2.0, 0.08); for (let t = 0; t < 3; t++) { b.slab(WOOD, 2.4, 0.42 + t * 0.52, 0.1, 4.0, 0.03, 0.14); for (let i = 0; i < 10; i++) cardZ(b, mag((i + t * 2) % 6), 2.5 + i * 0.39, 0.46 + t * 0.52, 0.2 - 0.004 * i % 0.02, 0.3, 0.4, 1); } R.col(2.4, 0, 6.4, 0.3, 2);
    tbl(b, 6.0, 9.2, 0.8, 0.8, 0.5, WOOD, DKM); cardY(b, U('go', 160, 160, (g, S2) => { const r = rng(19); BX(g, 0, 0, S2, S2, '#dcb46a'); g.strokeStyle = '#3a2a14'; g.lineWidth = 1; for (let i = 0; i < 19; i++) { const q = 8 + i * 8; g.beginPath(); g.moveTo(q, 8); g.lineTo(q, 152); g.moveTo(8, q); g.lineTo(152, q); g.stroke(); } for (let i = 0; i < 46; i++) { g.fillStyle = i % 2 ? '#111' : '#f7f7f3'; g.beginPath(); g.arc(8 + Math.floor(r() * 19) * 8, 8 + Math.floor(r() * 19) * 8, 3.4, 0, TAU); g.fill(); } }), 6.1, 0.506, 9.3, 0.6, 0.6);
    R.put('stool', 6.4, 8.85, 0, 0x8a6a48); R.put('stool', 6.4, 10.3, 0, 0x8a6a48); R.col(6.0, 9.2, 6.8, 10.0, 0.5);
    R.pot(0.45, 6.6, 0.36); R.pot(4.6, 10.4, 0.4); R.pot(1.9, 0.5, 0.3); ceilLights(R, 3, 3); drape(b, 0.9, 1.7, D - 0.07, 0xd9c7a0); drape(b, 8.0, 8.9, D - 0.07, 0xd9c7a0); }

  // ================================================================= OUTSIDE: plaza, sculpture, aprons, garden, driveway
  home(v);
  const PZ = lm('plaza'), BAND = lm('band'), SG = lm('stone'), KERB = lm('kerb'), GRATE = C(0x3a3e42, 'metal'), LINE = C(0xf0f0ea);
  // street furniture from street.js stands in world coordinates
  const lampAt = (X, Z, h = 3.9) => { const w = toW([X, Z]); gx.frame(); c.frame(); gardenLamp(gx, c, w[0], w[1], h); home(gx); home(c); };
  const benchAt = (X, Z, yaw, back = true) => { const w = toW([X, Z]); bench(gx, c, w[0], w[1], aS + yaw, back); home(gx); home(c); };
  const binsAt = (X, Z, yaw, four = false) => { const w = toW([X, Z]); bins(gx, c, w[0], w[1], aS + yaw, four); home(gx); home(c); };
  const greens = [], blooms = [], trees = [];                          // shrubs [x, z, radius], flower spots [x, z] and trees [x, z, height], world coordinates
  const tripod = (w, hgt, seed) => { const k = hgt < 5.5 ? 0.7 : 1; for (let i = 0; i < 3; i++) { const a = i * 2.094 + seed; gx.strut(lm('pole'), [w[0] + 1.3 * k * Math.cos(a), 0, w[1] + 1.3 * k * Math.sin(a)], [w[0], 2.3 * k, w[1]], 0.06); } gx.strut(lm('pole'), [w[0] - 0.09, 2.2 * k, w[1]], [w[0] + 0.09, 2.2 * k, w[1]], 0.1); home(gx); };
  // ---- plaza (frames 28-33): pale granite pavers, a grid of brown bands, drain gratings
  cap(v, PZ, [[-2, 0], [16, 0], [16, 7.6], [XG1, zf(XG1) + 0.02], [XG1, zf(XG1) + 2.0], [LD[0] + 1.6, zf(LD[0]) + 2.0], [LD[0] + 1.6, -1], [LC[0] + 5, LC[1] - 2], [74, 0], [74, 23.2], [-2, 23.2]], 0.06, true);
  { const top = X => (X < 16 ? 0.05 : X < XG1 ? zf(X) + 0.1 : X < LD[0] + 1.6 ? zf(X) + 2.05 : -6), xs = [], zs = [8.2, 13, 17.8, 22.6], yb = 0.066;
    for (let X = 2.2; X < 73; X += 4.8) xs.push(X);
    for (const X of xs) { const z0 = Math.max(top(X - 0.3), top(X + 0.3)); v.quad(BAND, [X - 0.3, yb, 23.2], [X + 0.3, yb, 23.2], [X + 0.3, yb, z0], [X - 0.3, yb, z0]); }
    for (const Z of zs) for (let i = -1; i < xs.length; i++) { const x0 = i < 0 ? -2 : xs[i] + 0.3, x1 = i + 1 < xs.length ? xs[i + 1] - 0.3 : 74; if (Z - 0.3 > Math.max(top(x0), top(x1))) v.quad(BAND, [x0, yb, Z + 0.3], [x1, yb, Z + 0.3], [x1, yb, Z - 0.3], [x0, yb, Z - 0.3]); }
    for (const [X, Z] of [[11.8, 10.6], [31, 15.4], [50.2, 15.4], [69.4, 10.6], [21.4, 20.2], [59.8, 20.2]]) { v.box(GRATE, X, 0.069, Z, 0.5, 0.012, 0.5, 'D'); for (let i = 0; i < 5; i++) v.box(C(0x16181a), X - 0.18 + i * 0.09, 0.076, Z, 0.035, 0.002, 0.4, 'D'); }   // gratings (frame 30)
    along(v, PF0, PF1); v.slab(GRATE, xf(XG1), 0.06, 2.3, xf(LD[0] + 0.6) - xf(XG1), 0.012, 0.16, 'D'); home(v); }                 // slot drain at the foot of the porch steps
  along(v, LC, LB); v.slab(PZ, -2, 0, 0, LNE + 6, 0.04, 5, 'D'); v.slab(KERB, -2, 0, 5, LNE + 6, 0.1, 0.12);                        // pale walkway along the north-east face (satellite image)
  along(v, LB, LA); v.slab(PZ, -4, 0, 0, PORTAL[0] + 4, 0.04, 4.5, 'D'); v.slab(KERB, -4, 0, 4.5, PORTAL[0] + 4, 0.1, 0.12);        // paved strip along the north-west face (frame 55)
  for (let s = 3; s < PORTAL[0]; s += 9) v.box(GRATE, s, 0.046, 4.3, 0.6, 0.012, 0.25, 'D');
  home(v);
  // ---- sculpture (frames 29-30): black polished plinth, two red slabs, six curved red blades
  { const X = 20, Z = zf(20) + 4.2, RED = lm('sculpt'); at(v, X, Z, 0.25, 0.06);
    v.box(lm('granite'), 0, 0.42, 0, 1.6, 0.84, 1.05); v.box(RED, 0, 0.96, 0, 1.3, 0.24, 0.9); v.box(RED, 0.04, 1.2, 0.02, 1.12, 0.24, 0.8);
    for (const [ang, lean, hgt, wid] of [[0.45, 0.22, 2.4, 0.95], [2.7, 0.55, 1.5, 0.85], [-0.7, 0.7, 1.25, 0.8], [1.6, 0.85, 1.0, 0.75], [3.7, 0.95, 0.85, 0.75], [-2.0, 0.5, 1.7, 0.8]]) {
      const co = Math.cos(ang), si = Math.sin(ang), n = 10; let prev = null;
      for (let i = 0; i <= n; i++) { const t = i / n, out = 0.15 + lean * hgt * t * t, y = 1.32 + hgt * (t - 0.22 * t * t), w = wid * (1 - 0.8 * t * t) / 2, tw = 0.9 * t;      // each blade leans out, tapers and twists a little
        const sx = Math.cos(ang + tw), sz = Math.sin(ang + tw), p = [[co * out - sz * w, y, si * out + sx * w], [co * out + sz * w, y, si * out - sx * w]];
        if (prev) v.quad(RED, prev[0], prev[1], p[1], p[0]); prev = p; }
    }
    home(v); at(c, X, Z, 0.25, 0.05); c.box(G, 0, 1.2, 0, 1.6, 2.4, 1.05); home(c); }
  // plants in white pots at the porch columns (frames 31-33)
  for (const [X, Z] of [[42.2, zf(42) - 0.3], [52.2, zf(52) - 0.3], [58.6, 4.3], [62.5, 4.5]]) { plant(gx, X, Z, F0, 1.5); plant(gx, X + 0.45, Z + 0.25, F0, 1.0); }
  // plaza furniture (imagined): lamps, benches, bins, a notice board; the axis of the doors stays clear
  for (const [X, Z] of [[6, 21.5], [25, 21.5], [38, 21.5], [55, 21.5], [70, 21.5], [9, 9.5], [68, 6]]) lampAt(X, Z);
  for (const [X, Z, yaw] of [[12, 20.6, Math.PI], [29, 20.6, Math.PI], [34, 20.6, Math.PI], [59, 20.6, Math.PI], [64, 20.6, Math.PI], [3.2, 9, Math.PI / 2]]) benchAt(X, Z, yaw);
  binsAt(31.5, 21.2, Math.PI); binsAt(61.5, 21.2, Math.PI); binsAt(65.6, 3.2, -Math.PI / 2, true);
  { const w = toW([70.5, 13]); noticeBoard(gx, c, w[0], w[1], aS - Math.PI / 2, 3, 2); home(gx); home(c); }
  { at(gx, 17.2, zf(17.2) + 0.02, 0, 3.3); gx.box(MW, 0, 0, 0.09, 0.1, 0.12, 0.18); gx.box(MW, 0, -0.1, 0.24, 0.09, 0.09, 0.2); gx.cyl(C(0x16181a), 0, -0.2, 0.3, 0.05, 0.06, 8); home(gx); }      // camera on the tile wall (frame 30)
  // ---- garden north-west of the building (frames 21, 55): everything here is placed by eye
  { const nwOut = unit(sub(toL([A[0] - 0.5433, A[1] - 0.8395]), LA)), nwAlong = unit(sub(LB, LA)), P = (s, d) => add(add(LA, mul(nwAlong, s)), mul(nwOut, d)), yawG = Math.atan2(-nwAlong[1], nwAlong[0]);
    home(v); cap(v, 'lawn', [P(12, 4.6), P(LNW + 2, 4.6), P(LNW + 2, 17), P(12, 19)], 0.045, true);
    const circ = (r, n, a0 = 0, a1 = 2 * Math.PI) => Array.from({ length: a1 - a0 > 6.28 ? n : n + 1 }, (_, i) => [r * Math.cos(a0 + (a1 - a0) * i / n), r * Math.sin(a0 + (a1 - a0) * i / n)]);
    const sector = (r0, r1, a0, a1, n) => [...circ(r1, n, a0, a1), ...circ(r0, n, a0, a1).reverse()];
    const bed = P(-6, 15), FLO = pbr('hedge', [0x8f2030]);                                                        // round bed with a stone disc, a ring of red-leaved planting and a ring path (frame 21)
    at(v, bed[0], bed[1]); cap(v, PZ, circ(6.2, 28), 0.065, true, [circ(3.8, 24)]); ringTop(v, FLO, 0, 0, 2.7, 3.8, 0, 2 * Math.PI, 0.34, 24); ringWall(v, FLO, 0, 0, 3.8, 0, 2 * Math.PI, 0, 0.34, 24, true);
    ringWall(v, KERB, 0, 0, 3.86, 0, 2 * Math.PI, 0, 0.12, 24, true); ringTop(v, KERB, 0, 0, 3.8, 3.86, 0, 2 * Math.PI, 0.12, 24);
    v.cyl(SG, 0, 0, 0, 2.7, 0.45, 28); v.cyl(lm('granite'), 0, 0.45, 0, 1.1, 0.03, 24); cap(v, PZ, sector(12.5, 14.6, -0.4, 1.5, 20), 0.065, true);   // an arc of path that leads round the west corner
    cap(v, FLO, sector(8.6, 11, -1.5, -0.45, 10), 0.2, true); ringWall(v, FLO, 0, 0, 11, -1.5, -0.45, 0, 0.2, 10, true); ringWall(v, FLO, 0, 0, 8.6, -1.5, -0.45, 0, 0.2, 10, false); home(v);   // crescent of red flowers (frames 21, 22, 55)
    { const r = rng(77); for (let i = 0; i < (low ? 60 : 150); i++) { const a = -1.5 + 1.05 * r(), q = 8.8 + 2.0 * r(); blooms.push(toW([bed[0] + q * Math.cos(a), bed[1] + q * Math.sin(a)])); }
      for (let i = 0; i < (low ? 30 : 70); i++) { const a = r() * TAU, q = 2.85 + 0.85 * r(); blooms.push(toW([bed[0] + q * Math.cos(a), bed[1] + q * Math.sin(a)])); } }
    at(c, bed[0], bed[1]); c.box(G, 0, 0.25, 0, 4.6, 0.5, 4.6); home(c);
    for (const [s, d] of [[2, 12], [-13, 11]]) { const p = P(s, d); at(gx, p[0], p[1], 0.6); gx.box(SG, 0, 0.25, 0, 2.2, 0.5, 0.7); home(gx); at(c, p[0], p[1], 0.6); c.box(G, 0, 0.25, 0, 2.2, 0.5, 0.7); home(c); }      // stone benches
    const round = P(13, 14); at(v, round[0], round[1]); cap(v, PZ, circ(4.2, 24), 0.065, true); v.box(SG, 0.5, 0.3, 0.3, 1.8, 0.5, 1.0); home(v);        // small round paved place with a stone block (frame 55)
    at(c, round[0], round[1]); c.box(G, 0.5, 0.3, 0.3, 1.8, 0.6, 1.0); home(c);
    const pad = P(47, 12); at(v, pad[0], pad[1], yawG); v.box(PZ, 0, 0.035, 0, 7, 0.07, 3.2, 'D'); for (const x of [-2, 0.4, 2.6]) v.box(SG, x, 0.29, 0.3, 1.5, 0.44, 0.55, 'D'); home(v);   // pale paved pad with stone seats (frame 55, left)
    at(c, pad[0], pad[1], yawG); c.box(G, 0.3, 0.26, 0.3, 6.1, 0.52, 0.55); home(c);
    along(v, P(32, 4.6), P(32, 12)); v.slab(PZ, 0, 0, -1.5, 7.4, 0.07, 3, 'D'); home(v);                                                               // path from the middle door
    along(v, P(22, 4.6), P(22, 8.6)); v.slab(PZ, 0, 0, -1.4, 4, 0.07, 2.8, 'D'); home(v);                                                              // path from the door of the stair hall (imagined)
    along(v, P(14.3, 9.6), P(30.5, 9.6)); v.slab(PZ, 0, 0, -1, 16.2, 0.07, 2, 'D'); home(v);                                                           // cross path (imagined)
    // young trees held by tripods of orange poles: a row along the paved strip (frame 55) and a few larger ones
    const young = [[15, 6.6, 4.2], [18.4, 6.6, 4.6], [26, 6.6, 4.4], [28.6, 6.6, 4], [36, 6.6, 4.5], [39.6, 6.6, 4.2], [43.2, 6.6, 4.6], [46.8, 6.6, 4.1], [50.4, 6.6, 4.4], [54, 6.6, 4.3],
      [28.2, 12.6, 9], [17.5, 13.4, 6], [38, 12.5, 6.5], [-4, 6, 8], [-10, 19.5, 6.5], [6, 22, 6], [24, 18, 7], [44, 18.5, 6.5], [57, 13, 6]];
    for (const [s, d, hgt] of young) { const w = toW(P(s, d)); trees.push([w[0], w[1], hgt]); tripod(w, hgt, s); }
    // imagined: lamps along the strip (the footage shows black posts there), benches, bins, shrubs
    for (const [s, d] of [[12.5, 5], [24.6, 5], [34.6, 5], [45, 5], [55, 5], [-1.5, 9.5], [8, 17.5], [22, 11.4]]) { const p = P(s, d); lampAt(p[0], p[1]); }
    for (const [s, d, turn] of [[19, 11.2, Math.PI], [26, 11.2, Math.PI], [9.6, 16.6, Math.PI * 0.7]]) { const p = P(s, d); benchAt(p[0], p[1], yawG + turn); }
    { const p = P(24, 11); binsAt(p[0], p[1], yawG + Math.PI); }
    { const r = rng(55); for (const [s, d, n, rad] of [[43, 13.4, 5, 0.55], [51.5, 13.4, 5, 0.55], [16.5, 9, 3, 0.5], [30.2, 12.6, 4, 0.45], [33.8, 12.6, 4, 0.45], [9, 12, 4, 0.6], [35, 16, 5, 0.7], [52, 9, 4, 0.5], [20, 15.5, 4, 0.65]])
      for (let i = 0; i < n; i++) greens.push([...toW(P(s + (r() - 0.5) * n * 0.6, d + (r() - 0.5) * 1.2)), rad * (0.8 + 0.5 * r())]); }
  }
  // ---- driveway into the portal (frame 55 shows the driveway and its arrows; kerbs, lines, height bar and barrier are imagined)
  { const zc = -(PW + PE) / 2, RW = C(0xd8362c), YL = C(0xf2c230), DK = C(0x1c1d1f), xo = nwX(zc) - 9;
    along(v, LA, LE); along(gx, LA, LE); along(c, LA, LE);
    for (const z of [-PW - 0.06, -PE - 0.06]) v.slab(KERB, nwX(z) - 9, 0, z, 9, 0.14, 0.12);
    for (let x = xo + 0.6; x < PBACK - 2.6; x += 3) v.box(LINE, x + 0.75, 0.083, zc, 1.5, 0.004, 0.12, 'D');                     // centre line
    for (const z of [-PW - 0.4, -PE + 0.4]) v.box(LINE, (xo + PBACK) / 2, 0.083, z, PBACK - xo, 0.004, 0.1, 'D');                 // edge lines
    v.box(LINE, PBACK - 1.3, 0.083, zc, 0.3, 0.004, PE - PW - 1, 'D');                                                           // stop line before the shutter
    // height bar hanging from a gantry just inside the mouth
    for (const z of [-PW - 0.22, -PE + 0.22]) { for (let i = 0; i < 6; i++) gx.box(i % 2 ? DK : YL, 0.6, 0.225 + i * 0.45, z, 0.12, 0.45, 0.12, 'UD'); c.box(G, 0.6, 1.35, z, 0.18, 2.7, 0.18); }
    gx.box(DK, 0.6, 2.76, zc, 0.12, 0.12, PE - PW - 0.3); for (const z of [-PW - 1.2, zc, -PE + 1.2]) gx.box(STL, 0.6, 2.52, z, 0.015, 0.36, 0.015, 'UD');
    for (let i = 0; i < 10; i++) gx.box(i % 2 ? MW : RW, 0.6, 2.3, -PW - 0.6 - (i + 0.5) * (PE - PW - 1.2) / 10, 0.08, 0.14, (PE - PW - 1.2) / 10, i === 0 || i === 9 ? '' : 'NS');
    // barrier on a small island between the lanes: the arm of the entry lane is up, that of the exit lane down
    v.slab(KERB, -6.8, 0.07, zc - 0.3, 2.6, 0.1, 0.6); gx.box(YL, -5.5, 0.67, zc, 0.36, 1.0, 0.36, 'D'); gx.box(DK, -5.5, 1.19, zc, 0.4, 0.04, 0.4); c.box(G, -5.5, 0.7, zc, 0.42, 1.3, 0.42);
    for (let i = 0; i < 5; i++) gx.box(i % 2 ? MW : RW, -5.5, 1.02, zc - 0.25 - (i + 0.5) * 0.66, 0.06, 0.1, 0.66, 'NS');
    bar(gx, RW, [-5.5, 1.02, zc + 0.2], [-5.5, 3.9, zc + 1.25], 0.07, 0.1); bar(gx, MW, [-5.5, 1.9, zc + 0.52], [-5.5, 2.5, zc + 0.74], 0.075, 0.105);
    // wall lights along both flanks, a convex mirror outside
    for (const x of [2, 6, 10]) { gx.box(lm('lamp'), x, 3.3, -PW - 0.05, 0.5, 0.1, 0.07, 'S'); gx.box(lm('lamp'), x, 3.3, -PE + 0.05, 0.5, 0.1, 0.07, 'N'); }
    gx.cyl(STL, xo + 0.6, 0, -PE - 0.7, 0.04, 2.3, 8); gx.box(C(0xe2701c), xo + 0.6, 2.45, -PE - 0.7, 0.06, 0.6, 0.6); gx.box(STL, xo + 0.635, 2.45, -PE - 0.7, 0.01, 0.52, 0.52, 'W');
    home(v); home(gx); home(c); }
  // ================================================================= ASSEMBLY
  // tree trunks collide (thin posts)
  c.frame(); for (const [x, z] of trees) c.slab(G, x - 0.1, 0, z - 0.1, 0.2, 2.2, 0.2); home(c);
  // flat panes, ground surfaces, indoor finishes and stains are not drawn into the shadow map
  const NO_SHADOW = new Set([lm('plaza'), lm('band'), lm('plaster'), lm('ceil'), lm('wallUp'), lm('ceilUp'), lm('cove'), lm('ribbon'), lm('stain'), lm('tile'), lm('lamp')]), NO_SHADOW_NAMES = new Set(['glassDark', 'lawn', 'asphalt', 'floorGrey']);
  const finish = (b, name, shadow) => {
    const g = mergeFlat(b.build({ name: item.id + '-' + name, castShadow: shadow }), shadow);
    g.traverse(o => { if (!o.isMesh) return; if (o.material.transparent) o.renderOrder = 1; if (NO_SHADOW.has(o.material) || NO_SHADOW_NAMES.has(o.material.name)) o.castShadow = false; });
    return ctx.add(g);
  };
  finish(v, 'shell', true);
  const mid = toW([40, -12]);
  ctx.detail(finish(iv, 'interior', false), mid[0], mid[1], 140);
  ctx.detail(finish(uf, 'fittings', false), mid[0], mid[1], 105);
  ctx.detail(finish(fu, 'furniture', false), mid[0], mid[1], 70);
  ctx.detail(finish(fx, 'fine', false), mid[0], mid[1], 45);
  const gxG = finish(gx, 'outdoor-detail', false);
  if (greens.length) gxG.add(shrubs(greens, { seed: 5 }));
  if (blooms.length) gxG.add(flowers(blooms, [0xd22a36, 0xe2485c, 0xc21f4a], { seed: 3, size: 0.42, y: 0.18 }));
  ctx.detail(gxG, mid[0], mid[1], 170);
  if (trees.length) ctx.add(broadleafTrees(trees, { seed: 9, low }).group);
  // rooms of storeys 3 to 6: shown only while the viewer is on or near that storey (and near the building)
  const ctrW = toW([32, -17]), M4 = new THREE.Matrix4(), P3 = new THREE.Vector3(), Q4 = new THREE.Quaternion(), S3 = new THREE.Vector3();
  const potted = (list, seed) => { const im = shrubs(list.map(([x, , z, r]) => [x, z, r]), { seed }); list.forEach(([, yy], i) => { im.getMatrixAt(i, M4); M4.decompose(P3, Q4, S3); P3.y = yy + 0.16 * S3.x; im.setMatrixAt(i, M4.compose(P3, Q4, S3)); }); im.castShadow = false; return im; };
  const roomGroups = UPF.map((y, k) => { const g = mergeFlat(RB[k].build({ name: item.id + '-rooms-' + (k + 3), castShadow: false }), false); RI[k].build(g, item.id + '-rooms-' + (k + 3)); if (RP[k].length) g.add(potted(RP[k], 40 + k));
    g.traverse(o => { if (o.isMesh && o.material.transparent) o.renderOrder = 1; }); return ctx.add(g); });
  if (ctx.animate) ctx.animate((dt, t, env) => { const p = env && env.camera ? env.camera.position : null; if (!p) return; const near = Math.hypot(p.x - ctrW[0], p.z - ctrW[1]) < 62;
    roomGroups.forEach((g, k) => { g.visible = near && p.y > UPF[k] - 4.2 && p.y < UPF[k] + 4.4; }); });
  const cg = ctx.add(c.build({ name: item.id + '-colliders' })); cg.visible = false;
  cg.traverse(o => { if (o.isMesh) ctx.collide(o); });
  // after dusk the lights are on: the indoor finishes glow a little more (the lighting module lights the glass and the lamps)
  if (ctx.animate) {
    const glowing = [[lm('plaster'), 0.22, 0.2], [lm('ceil'), 0.3, 0.25], [lm('wallUp'), 0.16, 0.22], [lm('ceilUp'), 0.26, 0.3]]; let last = -1;
    ctx.animate((dt, t, env) => { const n = env && env.lighting && env.lighting.night ? env.lighting.night() : 0; if (Math.abs(n - last) < 0.01) return; last = n; for (const [m, base, more] of glowing) m.emissiveIntensity = base + more * n; });
  }

  function aTan(f) { return Math.atan2(-(f(40) - f(30)), 10); }       // heading of the podium front in the L frame
}
