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
import { tree } from '../../plants.js';

// Ground footprint in metres (x east, z south, origin at the centre of the track). See FOOTPRINT above.
const FOOT = { A: [147.85, -205.69], B: [194.54, -235.91], C: [215.97, -211.46], D: [214.05, -194.15], E: [151.42, -188.93] };
const FH = 3.9, H = 6 * FH;                    // storey height and roof level (23.4 m)
const F0 = 0.3, F2 = 4.2, F3 = 2 * FH;         // library floor, gallery floor, terrace = third floor (7.8 m)
const CEIL1 = 3.55, CEIL2 = 7.0;               // ceilings of the two library levels
const SIGN = '广东实验中学';
const BRUSH = '"STXingkai","华文行楷","Xingkai SC","STKaiti","华文楷体","Kaiti SC","KaiTi","楷体","AR PL UKai CN","Songti SC","SimSun","Noto Serif CJK SC",serif';
const TERR = 'terracotta';

// ---------------------------------------------------------------- textures and materials
const rng = seed => { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); };
function canvasTexture(w, h, draw, tileX = 0, tileY = tileX) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  if (tileX) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(1 / tileX, 1 / tileY); }
  return t;
}
const shade = (rgb, k) => `rgb(${rgb.map(ch => Math.max(0, Math.min(255, Math.round(ch * k)))).join(',')})`;
// small square tiles, 0.1 m (the podium's terracotta tile)
const mosaicTexture = () => canvasTexture(256, 256, (g, S) => {
  const r = rng(7);
  for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) { g.fillStyle = shade([168, 72, 48], 0.95 + r() * 0.1); g.fillRect(x * 32, y * 32, 32, 32); }
  g.strokeStyle = 'rgba(70,28,18,0.35)'; g.lineWidth = 1.2;
  for (let i = 0; i <= 8; i++) { g.beginPath(); g.moveTo(i * 32, 0); g.lineTo(i * 32, S); g.moveTo(0, i * 32); g.lineTo(S, i * 32); g.stroke(); }
}, 0.8);
// pale grey stone panels 1.2 x 0.6 m
const stoneTexture = () => canvasTexture(512, 512, (g, S) => {
  const r = rng(11);
  for (let y = 0; y < 4; y++) for (let x = -1; x < 2; x++) { g.fillStyle = shade([206, 206, 203], 0.96 + r() * 0.07); g.fillRect(x * 256 + (y % 2 ? 128 : 0), y * 128, 256, 128); }
  g.strokeStyle = 'rgba(120,120,118,0.6)'; g.lineWidth = 2;
  for (let y = 0; y <= 4; y++) { g.beginPath(); g.moveTo(0, y * 128); g.lineTo(S, y * 128); g.stroke(); for (let x = -1; x < 3; x++) { const px = x * 256 + (y % 2 ? 128 : 0); g.beginPath(); g.moveTo(px, y * 128); g.lineTo(px, y * 128 + 128); g.stroke(); } }
}, 2.4);
// pale granite pavers 0.6 x 0.3 m with a brown band every 9.6 m both ways and scattered darker stones (frames 28-33)
const pavingTexture = () => canvasTexture(1024, 1024, (g, S) => {
  const r = rng(23);
  for (let row = 0; row < 32; row++) for (let i = -1; i < 16; i++) {
    const x = i * 64 + (row % 2 ? 32 : 0), y = row * 32, band = row < 4 || (x >= 0 && x < 128);
    g.fillStyle = band ? shade([198, 187, 168], 0.97 + r() * 0.06) : r() < 0.06 ? shade([190, 186, 178], 0.97 + r() * 0.05) : shade([215, 213, 207], 0.97 + r() * 0.06);
    g.fillRect(x, y, 64, 32);
  }
  g.strokeStyle = 'rgba(150,146,138,0.55)'; g.lineWidth = 1;
  for (let row = 0; row <= 32; row++) { g.beginPath(); g.moveTo(0, row * 32); g.lineTo(S, row * 32); g.stroke(); for (let i = -1; i < 17; i++) { const x = i * 64 + (row % 2 ? 32 : 0); g.beginPath(); g.moveTo(x, row * 32); g.lineTo(x, row * 32 + 32); g.stroke(); } }
}, 9.6);
// one 3.2 m length of ribbon window: dark glass, frames, pale curtains, a guard rail of small arches (frame 25)
const ribbonTexture = () => canvasTexture(512, 256, (g, W, Hc) => {
  const r = rng(41); g.fillStyle = '#222b2e'; g.fillRect(0, 0, W, Hc);
  for (let i = 0; i < 4; i++) {
    const x0 = i * 128, k = r(), a = k < 0.2 ? null : k < 0.55 ? [0, 128] : k < 0.8 ? [0, 70] : [58, 128];
    if (a) for (let x = a[0]; x < a[1]; x += 6) { g.fillStyle = shade([188, 199, 186], 0.86 + 0.14 * ((x / 6) % 2) + r() * 0.05); g.fillRect(x0 + x, 6, 6, Hc - 12); }
  }
  g.strokeStyle = '#dcdedb'; g.lineWidth = 2.5;
  for (let x = 0; x < W; x += 26) { g.beginPath(); g.arc(x + 13, 238, 11, Math.PI, 0); g.stroke(); }
  g.fillStyle = '#dcdedb'; g.fillRect(0, 198, W, 3); g.fillRect(0, 238, W, 3);
  g.fillStyle = '#14181a'; for (let i = 0; i <= 4; i++) g.fillRect(i * 128 - 3, 0, 6, Hc); g.fillRect(0, 0, W, 6); g.fillRect(0, Hc - 8, W, 8);
}, 3.2, 1.5);
// five shelves of books, 2.4 m wide: board at the bottom of each row, coloured spines, a strip light under the board above
const BOOK_W = 2.4, ROW = 0.46, BOOK_ROWS = 5;
const bookTexture = () => canvasTexture(1024, 1024, (g, W, Hc) => {
  const r = rng(97), rowPx = Hc / BOOK_ROWS;
  const colours = [[236, 230, 214], [222, 214, 196], [58, 96, 160], [44, 126, 84], [186, 48, 44], [226, 184, 70], [70, 150, 160], [52, 54, 70], [208, 120, 60], [150, 86, 150], [240, 240, 236], [96, 160, 90]];
  for (let row = 0; row < BOOK_ROWS; row++) {
    const top = row * rowPx, base = top + rowPx - 16;                  // canvas y runs downward
    const back = g.createLinearGradient(0, top, 0, base); back.addColorStop(0, '#f6e2b6'); back.addColorStop(0.35, '#d2b382'); back.addColorStop(1, '#b99a6a');
    g.fillStyle = back; g.fillRect(0, top, W, rowPx);
    let x = 6;
    while (x < W - 10) {
      if (r() < 0.07) { x += 20 + r() * 70; continue; }                // a gap on the shelf
      const n = 2 + Math.floor(r() * 7), col = colours[Math.floor(r() * colours.length)], bw = 9 + r() * 12, bh = (0.6 + r() * 0.24) * (rowPx - 20);
      for (let i = 0; i < n && x < W - 10; i++) {
        g.fillStyle = shade(col, 0.9 + r() * 0.2); g.fillRect(x, base - bh, bw - 1, bh);
        g.fillStyle = 'rgba(255,255,255,0.35)'; g.fillRect(x + 2, base - bh * 0.78, bw - 5, bh * 0.2);          // title label
        g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(x + bw - 1, base - bh, 1, bh);
        x += bw;
      }
    }
    g.fillStyle = '#e6cfa2'; g.fillRect(0, base, W, 16); g.fillStyle = '#c3a676'; g.fillRect(0, base + 13, W, 3);        // shelf board
    g.fillStyle = '#fff6da'; g.fillRect(0, top, W, 4);                                                                    // strip light
    g.fillStyle = '#d9c092'; for (let i = 0; i <= 3; i++) g.fillRect(Math.min(W - 7, i * W / 3), top, 7, rowPx);          // uprights every 0.8 m
  }
}, BOOK_W, ROW * BOOK_ROWS);
const barsTexture = () => canvasTexture(64, 8, (g, W, Hc) => { g.clearRect(0, 0, W, Hc); g.fillStyle = '#ffffff'; g.fillRect(26, 0, 11, Hc); }, 0.13, 1);
const slatsTexture = () => canvasTexture(64, 8, (g, W, Hc) => { g.clearRect(0, 0, W, Hc); g.fillStyle = '#ffffff'; g.fillRect(8, 0, 36, Hc); }, 0.3, 1);
const arrowTexture = () => canvasTexture(128, 512, (g, W, Hc) => {
  g.clearRect(0, 0, W, Hc); g.fillStyle = '#f2f2ee'; g.fillRect(52, 150, 24, 330);
  g.beginPath(); g.moveTo(64, 30); g.lineTo(112, 170); g.lineTo(16, 170); g.closePath(); g.fill();
}, 1.2, 4.8);
const SIGN_PITCH = 2.6;                        // metres from one character to the next
const signTexture = () => canvasTexture(256 * SIGN.length, 256, (g, W, Hc) => {
  g.clearRect(0, 0, W, Hc); g.font = `218px ${BRUSH}`; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillStyle = '#d6201e'; g.strokeStyle = '#8f1210'; g.lineWidth = 5; g.lineJoin = 'round';
  [...SIGN].forEach((ch, i) => { g.strokeText(ch, (i + 0.5) * 256, Hc / 2 + 8); g.fillText(ch, (i + 0.5) * 256, Hc / 2 + 8); });
}, SIGN_PITCH * SIGN.length, SIGN_PITCH);

const local = {};
function lm(name) {
  if (local[name]) return local[name];
  const S = (color, roughness = 0.8, metalness = 0, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness, metalness, ...extra });
  const glow = (color, k) => S(0xffffff, 0.6, 0, { emissive: color, emissiveIntensity: k });
  const see = { transparent: true, depthWrite: false, side: THREE.DoubleSide };
  const make = {
    mosaic: () => S(0xffffff, 0.75, 0, { map: mosaicTexture() }),
    stone: () => S(0xffffff, 0.85, 0, { map: stoneTexture() }),
    plaza: () => S(0xffffff, 0.85, 0, { map: pavingTexture() }),
    ribbon: () => S(0xffffff, 0.35, 0.1, { map: ribbonTexture() }),
    books: () => { const t = bookTexture(); return S(0xffffff, 0.8, 0, { map: t, emissive: 0xffffff, emissiveMap: t, emissiveIntensity: 0.32 }); },
    barsDark: () => S(0x2a2d30, 0.6, 0.3, { map: barsTexture(), ...see }),
    barsGrey: () => S(0xb9bdc0, 0.5, 0.4, { map: barsTexture(), ...see }),
    slats: () => S(0xb5502f, 0.8, 0, { map: slatsTexture(), ...see }),
    arrows: () => S(0xffffff, 0.9, 0, { map: arrowTexture(), transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }),
    sign: () => S(0xffffff, 0.5, 0, { map: signTexture(), transparent: true, alphaTest: 0.35, side: THREE.DoubleSide }),
    glassLib: () => S(0x4f666b, 0.06, 0.45, { transparent: true, opacity: 0.4, depthWrite: false, side: THREE.DoubleSide }),      // curtain wall of the podium
    glassRail: () => S(0xbfd8d6, 0.05, 0.2, { transparent: true, opacity: 0.28, depthWrite: false, side: THREE.DoubleSide }),      // balustrade of the indoor stair
    fin: () => S(0xd6dadd, 0.5, 0.2), frame: () => S(0x25292c, 0.5, 0.3),
    plaster: () => S(0xf3f1ea, 0.85, 0, { emissive: 0xf3f1ea, emissiveIntensity: 0.22 }), ceil: () => S(0xd9d3c6, 0.9, 0, { emissive: 0xd9d3c6, emissiveIntensity: 0.3 }), balu: () => S(0x8f3d2c, 0.8), stairDark: () => S(0x505356, 0.8),
    railDark: () => S(0x2a2d30, 0.5, 0.4),
    brass: () => S(0xc9a45c, 0.4, 0.35), chairGreen: () => S(0x3f8a4c, 0.85), chairBeige: () => S(0xcdb994, 0.85), chairDark: () => S(0x2b3530, 0.85), chairCream: () => S(0xe4dcc6, 0.85),
    tableTop: () => S(0xe2cfa6, 0.6), woodLight: () => S(0xdcc59c, 0.7), alcove: () => S(0x121416, 0.6), tier: () => S(0x77797b, 0.9),
    lamp: () => glow(0xfff4d8, 1.3), cove: () => glow(0xffe9b0, 1.1),
    leaf: () => S(0x3f7a3a, 0.95), flower: () => S(0xb0222c, 0.9), pole: () => S(0xd9762b, 0.7),
    sculpt: () => S(0xc8141e, 0.35, 0.15, { side: THREE.DoubleSide }),
  };
  const m = (make[name] || (() => S(0xd9d6cf)))(); m.name = 'lib-' + name; return (local[name] = m);
}

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
  const top = kind === 'Grey' ? 'steel' : lm('railDark');
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
    if (type === 'b' || type === 't') {
      const d = type === 't' ? 5 : 2.4, R = TERR;
      if (type === 't' || k === 0) rail(v, [x0, -0.12], [x1, -0.12], y0, y0, 1.1); else v.slab(TERR, x0, y0, -0.25, w, 1.15, 0.25);
      v.quad('floorGrey', [x0, y0 + 0.01, -d], [x0, y0 + 0.01, 0], [x1, y0 + 0.01, 0], [x1, y0 + 0.01, -d]);
      v.quad(R, [x0, y0, -d], [x1, y0, -d], [x1, y0 + FH, -d], [x0, y0 + FH, -d]);
      v.quad(R, [x0, y0, 0], [x0, y0, -d], [x0, y0 + FH, -d], [x0, y0 + FH, 0]); v.quad(R, [x1, y0, -d], [x1, y0, 0], [x1, y0 + FH, 0], [x1, y0 + FH, -d]);
      v.slab(TERR, x0, y0 + 3.4, -T, w, FH - 3.4, T, 'N');
      v.quad(R, [x0, y0 + 3.4, -d], [x1, y0 + 3.4, -d], [x1, y0 + 3.4, -T], [x0, y0 + 3.4, -T]);
      face('glassDark', x0 + 0.6, x1 - 0.6, y0 + 0.1, y0 + 2.4, -d + 0.02);
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
    const hi = [[0, 1.5, 's'], [1.5, 9.5, 'r'], [9.5, 11.5, 's'], [11.5, 19.5, 'r'], [19.5, 21, 's'], [21, 28.5, 't'], [28.5, 30, 's'], [30, 38, 'r'], [38, 39.5, 's'], [39.5, 46, 'r'], [46, 48, 's'], [48, 54.5, 'r'], [54.5, FIN_S, 's'], [FIN_S, LS, 'l']];
    facade(LE, LD, [lo, lo, hi, hi], [[F3 + FH, 0, FIN_S, 0.35], [F3 + 2 * FH, 0, FIN_S, 0.5], [F3 + 3 * FH, 0, FIN_S, 0.35], [H, 0, LS, 0.3]]); }
  // north-west face, from the north corner B to the west corner A (frames 55-57). Distances along it measured from A in frame 55.
  const PORTAL = [LNW - 11.03, LNW - 2.89];                           // mouth of the portal along this face
  { const mid = [[0, 10.4, 'x'], [10.4, 16.5, 'b'], [16.5, 17.3, 's'], [17.3, 24.6, 'r'], [24.6, 25.7, 's'], [25.7, 32.9, 'r'], [32.9, 33.7, 's'], [33.7, 40.1, 'b']];
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
  cap(v, 'roofPale', [LE, LD, LC, LB, LA], H, true, [LWELL]);
  cap(c, G, [LE, LD, LC, LB, LA], H - 0.02, true);                        // roof collider, light well covered: a player leaving drone mode above the building lands here
  { const outer = LWELL.map(p => add(p, mul(unit(sub(p, wellC)), 0.25)));
    ringQuads(v, TERR, LWELL, 8.6, H + 0.9, true); ringQuads(v, TERR, outer, H, H + 0.9, false);
    LWELL.forEach((p, i) => { const j = (i + 1) % LWELL.length; cap(v, TERR, [p, LWELL[j], outer[j], outer[i]], H + 0.9, true); }); }
  cap(v, 'glassDark', LWELL, 8.62, true);
  for (const [P, Q, inset] of [[LE, LD, 1.5], [LD, LC, 0.2], [LC, LB, 0.2], [LB, LA, 0.2], [LA, LE, 0.2]]) {
    const len = along(v, P, Q); v.slab(TERR, 0, H, -0.3, len, 0.25, 0.3, 'D'); rail(v, [0.3, -inset], [len - 0.3, -inset], H + (inset > 1 ? 0 : 0.25), H + (inset > 1 ? 0 : 0.25), 1.05, 'Grey');
  }
  // pavilions, pergola and the sign along the north-west edge
  along(v, LB, LA);
  { const z0 = -8.5, z1 = -2.0, yt = H + 3.6, boxes = [[LNW - 44, LNW - 39.1], [LNW - 21.1, LNW - 14.3]], px0 = boxes[0][1], px1 = boxes[1][0];
    for (const [x0, x1] of boxes) { v.slab(TERR, x0, H, z0, x1 - x0, 3.6, z1 - z0, 'D'); v.slab('roofPale', x0 - 0.1, yt, z0 - 0.1, x1 - x0 + 0.2, 0.12, z1 - z0 + 0.2);
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
      for (const [p, q] of [[[a, ys, zs], [a, y1, zs]], [[e, ys, zs], [e, y1, zs]], [[a, y1, zs], [e, y1, zs]], [[a, ys, zs], [e, ys, zs]], [[a, ys, zs], [e, y1, zs]], [[a, y1, zs], [a + 0.6, ys, zs - 1.2]], [[e, y1, zs], [e - 0.6, ys, zs - 1.2]]]) bar(v, 'steel', p, q, 0.06);
    }
    v.slab('metalWhite', LNW - 13.2, H, -5, 1.0, 1.3, 1.6);                                                          // air-conditioning unit beside the pavilion
  }
  home(v); for (const [x, z] of [[58, -9], [60.2, -9.4], [62.4, -9.8]]) v.slab('metalWhite', x, H, z, 1.8, 1.4, 1.1);      // units at the east end (frame 20)

  // ================================================================= LOWER STOREYS: outer walls (not the podium front)
  { const win = (x, y, w, h) => { face('glassDark', x, x + w, y, y + h); v.slab('metalWhite', x - 0.06, y - 0.08, 0, w + 0.12, 0.08, 0.06); };
    // north-west: pale grey stone, paired windows above, doors, small windows and louvre strips below (frames 55-56)
    let len = along(v, LB, LA); v.slab(lm('stone'), 0, 0, -0.35, PORTAL[0], F3, 0.35, 'N');
    for (let x = 2.6; x < PORTAL[0] - 3; x += 6) { win(x, 4.9, 1.1, 1.8); win(x + 1.6, 4.9, 1.1, 1.8);
      if (Math.round(x / 6) % 2) { face('metalWhite', x + 0.2, x + 1.8, 0.05, 2.3); face(lm('frame'), x + 0.98, x + 1.02, 0.05, 2.3, 0.02); win(x + 2.4, 1.3, 0.7, 1.0); } else face(lm('frame'), x - 0.4, x + 3.4, 2.5, 3.0); }
    v.slab(lm('stone'), 20.6, 0, 0, 6, 0.28, 2.4); v.slab(lm('stone'), 20.2, 0, 0, 6.8, 0.14, 2.8); along(c, LB, LA); c.slab(G, 20.6, 0, 0, 6, 0.28, 2.4);                      // steps at the middle door
    along(c, LB, LA); c.slab(G, 0, 0, -0.35, PORTAL[0], H, 0.35);
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
  v.slab('metalWhite', xf(XG1), 6.88, -0.3, xf(XS) - xf(XG1), 0.12, 0.3);
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
    v.slab(MOS, 0, 3.6, -0.12, len, 0.7, 0.24); v.slab('metalWhite', 0, 7.0, -0.12, len, 0.3, 0.24);
    v.quad(GL, [0, 4.3, 0], [len, 4.3, 0], [len, 7.0, 0], [0, 7.0, 0]);
    let s = 0; for (const [g0, g1] of [...gaps, [len, len]]) { if (g0 > s) v.quad(GL, [s, F0, 0], [g0, F0, 0], [g0, 3.6, 0], [s, 3.6, 0]); if (g1 > g0) v.quad(GL, [g0, 2.5, 0], [g1, 2.5, 0], [g1, 3.6, 0], [g0, 3.6, 0]); s = g1; }
    for (let i = 0; i <= n; i++) { const x = len * i / n; v.slab(FR, x - 0.04, 4.3, -0.07, 0.08, 2.7, 0.14); if (!gaps.some(([g0, g1]) => x > g0 - 0.1 && x < g1 + 0.1)) v.slab(FR, x - 0.04, F0, -0.07, 0.08, 3.3, 0.14); }
    v.slab(FR, 0, 6.45, -0.06, len, 0.07, 0.12); v.slab(FR, 0, 3.1, -0.06, len, 0.07, 0.12);
    along(c, P, Q); s = 0; for (const [g0, g1] of [...gaps, [len, len]]) { if (g0 > s) c.slab(G, s, 0, -0.12, g0 - s, 7.3, 0.24); if (g1 > g0) c.slab(G, g0, 2.5, -0.12, g1 - g0, 4.8, 0.24); s = g1; }
    home(c); home(v);
  };
  glazing(FOLD0, FOLD1); glazing([XP, ZG], [XE, ZG], [[DOOR[0] - XP, DOOR[1] - XP]]);
  for (const x of DOOR) { v.slab(FR, x - 0.04, F0, ZG - 0.07, 0.08, 2.25, 0.14); fx.quad(lm('glassRail'), [x, F0 + 0.03, ZG - 0.9], [x, F0 + 0.03, ZG], [x, 2.45, ZG], [x, 2.45, ZG - 0.9]);       // door leaves standing open
    for (const s of [-0.03, 0.03]) fx.slab('steel', x + s - 0.015, F0 + 0.5, ZG - 0.82, 0.03, 1.5, 0.03); }
  v.slab(FR, DOOR[0], 2.45, ZG - 0.06, DOOR[1] - DOOR[0], 0.07, 0.12);
  { const xe = LD[0] + 0.2; v.slab(MOS, XE, 0, ZG - 0.25, xe - XE, F3, 0.25, 'N'); blockBox(XE, ZG - 0.25, xe, ZG, 0, F3);
    cap(v, 'metalWhite', [[XS, ZG], [xe, ZG], [LD[0], 0], [XS, 0]], F3 - 0.01, false);                                 // underside of the upper storeys over the stair
    face('metalWhite', XE + 0.7, XE + 1.7, F0, F0 + 2.1, ZG + 0.012); }
  // --- terrace: deck, railings, the three pale rectangles, the void at the east end of storeys 3 and 4
  const TER = [[16, 0], [16, zf(16)], [XS, zf(XS)], [XS, 0], [VOID_S[1], 0], [VOID_S[1], -8], [VOID_S[0], -8], [VOID_S[0], 0]];
  cap(v, 'floorGrey', TER, F3 + 0.004, true); cap(c, G, TER, F3, true);
  for (const [x0, x1] of [[20, 27], [29, 36], [38, 44]]) cap(v, 'roofPale', rounded([[x0, 1.4], [x1, 1.4], [x1, zf(x1) - 1.4], [x0, zf(x0) - 1.4]], 0.6, 3), F3 + 0.02, true);
  cap(v, 'metalWhite', [[XP, ZG], [XS, ZG], [XS, zf(XS) - 0.3], [XG1, zf(XG1) - 0.3]], 6.88, false);                // soffit over the porch
  rail(v, [16.1, 0.1], [16.1, zf(16) - 0.1], F3, F3); rail(v, [16.1, zf(16.1) - 0.12], [XS, zf(XS) - 0.12], F3, F3);
  rail(v, [XS, zf(XS) - 0.12], [XS, 2.0], F3, F3); rail(v, [XS, 0.7], [XS, 0.05], F3, F3);
  block([16.1, 0.1], [16.1, zf(16)], F3, F3 + 1.3, 0.1); block([16.1, zf(16.1) - 0.1], [XS, zf(XS) - 0.1], F3, F3 + 1.3, 0.1); block([XS, zf(XS)], [XS, 2.0], F3, F3 + 1.3, 0.1); block([XS, 0.7], [XS, 0], F3, F3 + 1.3, 0.1);
  { const [x0, x1] = VOID_S, R = TERR, yt = F3 + 2 * FH - 0.5;
    v.quad(R, [x0, F3, -8], [x1, F3, -8], [x1, yt, -8], [x0, yt, -8]); v.quad(R, [x0, F3, 0], [x0, F3, -8], [x0, yt, -8], [x0, yt, 0]); v.quad(R, [x1, F3, -8], [x1, F3, 0], [x1, yt, 0], [x1, yt, -8]);
    v.quad(R, [x0, yt, -8], [x1, yt, -8], [x1, yt, -T], [x0, yt, -T]); v.slab(TERR, x0, yt, -T, x1 - x0, 0.5, T, 'N');
    v.quad('glassDark', [x0 + 1, F3 + 0.1, -7.98], [x1 - 1, F3 + 0.1, -7.98], [x1 - 1, F3 + 2.6, -7.98], [x0 + 1, F3 + 2.6, -7.98]);
    blockBox(x0 - 0.3, -8, x0, 0, F3, F3 + 3); blockBox(x1, -8, x1 + 0.3, 0, F3, F3 + 3); blockBox(x0, -8.3, x1, -8, F3, F3 + 3);
    blockBox(16, -0.3, x0, 0, F3, F3 + 3); blockBox(x1, -0.3, LS, 0, F3, F3 + 3); }                                    // the south face itself, for someone on the terrace
  // --- porch: platform two steps above the plaza, columns, soffit
  const PORCH = [[XP, ZG], [LD[0] + 0.6, ZG], [LD[0] + 0.6, zf(LD[0] + 0.6) + 1.6], [XG1, zf(XG1) + 1.6], FOLD0];
  cap(v, 'floorGrey', PORCH, F0 + 0.002, true); ringQuads(v, lm('stone'), PORCH, 0, F0, false); cap(c, G, PORCH, F0, true); ringQuads(c, G, PORCH, 0, F0, false);
  along(v, PF0, PF1); v.slab(lm('stone'), xf(XG1), 0, 1.6, xf(LD[0] + 0.6) - xf(XG1) + 0.4, 0.15, 0.4);
  along(c, PF0, PF1); { const x0 = xf(XG1), x1 = xf(LD[0] + 0.6); plate(c, G, [[x0, F0, 1.6], [x0, 0, 2.2], [x1, 0, 2.2], [x1, F0, 1.6]], 0.1); } home(c);
  home(v); { const xe = LD[0] + 0.6, z1 = zf(xe) + 1.6; v.slab(lm('stone'), xe, 0, ZG, 0.4, 0.15, z1 - ZG + 0.4); plate(c, G, [[xe, F0, ZG], [xe, F0, z1], [xe + 0.6, 0, z1], [xe + 0.6, 0, ZG]], 0.1); }
  const column = (b, X, Z, y0, y1, r = 0.42, flare = 0) => {           // white round column; flare > 0 widens the head into the slab above (frames 31, 37, 43)
    at(b, X, Z); b.cyl('metalWhite', 0, y0, 0, r, y1 - y0 - flare, 14, false);
    if (flare) lathe(b, 'metalWhite', 0, 0, [[r, y1 - flare], [r * 1.25, y1 - flare * 0.62], [r * 1.9, y1 - flare * 0.28], [r * 3.2, y1 - 0.02], [r * 3.3, y1]], 14);
    home(b); at(c, X, Z); c.box(G, 0, (y0 + y1) / 2, 0, r * 1.7, y1 - y0, r * 1.7); home(c);
  };
  for (const X of [41.5, 51.5]) column(v, X, zf(X) - 0.75, F0, 6.88);
  for (const X of [59.2, 63.1]) column(v, X, 4.0, F0, 7.3, 0.4);
  home(v); v.slab('metalWhite', XS - 0.3, 7.3, 3.4, LD[0] + 0.9 - XS, 0.5, 1.0);                                       // beam on the two tall columns beside the stair
  // --- second-floor walkway on columns with flared heads (frame 31)
  const WX0 = 39.6, WZ1 = 2.0;
  v.slab('metalWhite', WX0, F2 - 0.45, ZG, XS - WX0, 0.43, WZ1 - ZG); v.slab('floorGrey', WX0, F2 - 0.02, ZG, XS - WX0, 0.02, WZ1 - ZG, 'D');
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
  const hallC = [38, -12];
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
  for (let i = 3; i < 7; i++) { const P = HALL[i], Q = HALL[(i + 1) % 7]; wallQuad(v, lm('plaster'), P, Q, F0, CEIL2, hallC); block(P, Q, 0, CEIL2 + 0.3, 0.3); }
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
    bar(iv, 'steel', [SX0, F0 + 1.15, SZ0], [SX0, F2 + 1.15, SZ1], 0.05); bar(iv, 'steel', [SX0, F0, SZ0], [SX0, F0 + 1.15, SZ0], 0.05);
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
    for (const [x, z] of nodes) { fx.cyl('metalWhite', x, yb - 0.38, z, 0.17, 0.16, 10, false); ringTop(fx, lm('lamp'), x, z, 0.01, 0.15, 0, 2 * Math.PI, yb - 0.375, 10, false); } }
  // --- downlights in the two flat ceilings
  for (const [y, poly] of [[CEIL1, GAL], [CEIL2, GAL]]) for (let X = 25.5; X < 56; X += 3) for (let Z = -32; Z < 6; Z += 3) {
    if (inside([X, Z], poly) && inside([X + 0.6, Z], poly) && inside([X - 0.6, Z], poly) && inside([X, Z + 0.6], poly) && inside([X, Z - 0.6], poly)) fx.quad(lm('lamp'), [X - 0.09, y - 0.012, Z - 0.09], [X + 0.09, y - 0.012, Z - 0.09], [X + 0.09, y - 0.012, Z + 0.09], [X - 0.09, y - 0.012, Z + 0.09]);
  }

  // ----------------------------------------------------------------- furniture
  const BK = lm('books'), WL = lm('woodLight');
  /** Bookcase standing at (X, Z), its length along the direction yaw; books on both faces unless oneSided. Collides. */
  const shelf = (X, Z, yaw, len, rows = 5, oneSided = false, y = F0, pitch = ROW) => {
    const h = 0.1 + rows * pitch + 0.04, d = oneSided ? 0.36 : 0.56, u0 = ((X * 7.3 + Z * 3.1) % BOOK_W + BOOK_W) % BOOK_W;
    at(fu, X, Z, yaw, y); fu.box(WL, 0, h / 2, 0, len, h, d, 'D');
    texQuad(fu, BK, [-len / 2 + 0.04, 0.1, d / 2 + 0.012], [len / 2 - 0.04, 0.1, d / 2 + 0.012], [len / 2 - 0.04, h - 0.04, d / 2 + 0.012], [-len / 2 + 0.04, h - 0.04, d / 2 + 0.012], u0, 0, u0 + len - 0.08, rows * ROW);
    if (!oneSided) texQuad(fu, BK, [len / 2 - 0.04, 0.1, -d / 2 - 0.012], [-len / 2 + 0.04, 0.1, -d / 2 - 0.012], [-len / 2 + 0.04, h - 0.04, -d / 2 - 0.012], [len / 2 - 0.04, h - 0.04, -d / 2 - 0.012], u0 + 1.1, 0, u0 + 1.1 + len - 0.08, rows * ROW);
    home(fu); at(c, X, Z, yaw, y); c.box(G, 0, h / 2, 0, len, h, d); home(c);
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
  const plant = (b, X, Z, y = F0, k = 1) => { at(b, X, Z, 0, y); b.cyl('metalWhite', 0, 0, 0, 0.15 * k, 0.42 * k, 8); lathe(b, lm('leaf'), 0, 0, [[0.04, 0.4], [0.24, 0.55], [0.3, 0.8], [0.2, 1.05], [0.02, 1.2]].map(([r, h]) => [r * k, h * k]), 7); home(b); };

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
  for (const X of [DOOR[0] - 0.25, DOOR[1] + 0.25]) fx.slab('metalWhite', X - 0.05, F0, ZG - 2.6, 0.1, 1.5, 0.6);
  plant(fx, 50.3, -7.4, F0, 1.5); plant(fx, 49.6, -8.2); plant(fx, 39.6, -2.0, F0, 1.3);
  for (const X of [52.2, 54.8]) fx.cyl('steel', X, F0, SZ0 + 0.9, 0.03, 0.95, 6); bar(fx, 'red', [52.2, F0 + 0.85, SZ0 + 0.9], [54.8, F0 + 0.85, SZ0 + 0.9], 0.04);
  // gallery level
  table(28.5, 3.4, aTan(zf), 4.6, 1.0, 4, GRN, F2, true); table(34.2, 2.6, aTan(zf), 4.6, 1.0, 4, BEI, F2, true);
  table(44.0, -3.2, 0, 4.4, 1.0, 4, GRN, F2, true); table(49.6, -3.2, 0, 4.4, 1.0, 4, BEI, F2, true);
  for (const [X, Z, yaw] of [[26.0, -1.5, Math.PI / 2], [26.0, -8.5, Math.PI / 2]]) shelf(X, Z, yaw, 3.4, 3, false, F2, 0.38);
  for (const [X, Z] of [[51.9, -23.75], [48.3, -28.65]]) shelf(X, Z, 2.204 + Math.PI, 3.4, 3, true, F2, 0.38);            // low shelves against the north-east wall
  for (const [X, Z, yaw] of [[54.6, -17.6, Math.PI], [54.6, -16.0, Math.PI], [26.3, -13.2, 0]]) chair(X, Z, yaw, 'chairCream', F2, 1.25);
  plant(fx, 55.2, -15.6, F2, 1.4); plant(fx, 24.8, -20.0, F2, 1.4);

  // ================================================================= OUTSIDE: plaza, sculpture, aprons, garden
  home(v);
  cap(v, lm('plaza'), [[-2, 0], [16, 0], [16, 7.6], [XG1, zf(XG1) + 0.02], [XG1, zf(XG1) + 2.0], [LD[0] + 1.6, zf(LD[0]) + 2.0], [LD[0] + 1.6, -1], [LC[0] + 5, LC[1] - 2], [74, 0], [74, 23.2], [-2, 23.2]], 0.06, true);
  along(v, LC, LB); v.slab(lm('plaza'), -2, 0, 0, LNE + 6, 0.04, 5, 'D');                                               // pale walkway along the north-east face (satellite image)
  along(v, LB, LA); v.slab(lm('plaza'), -4, 0, 0, PORTAL[0] + 4, 0.04, 4.5, 'D');                                       // paved strip along the north-west face (frame 55)
  // sculpture (frames 29-30): black plinth, two red slabs, six curved red blades
  { const X = 20, Z = zf(20) + 4.2, RED = lm('sculpt'); at(v, X, Z, 0.25, 0.06);
    v.box(lm('frame'), 0, 0.42, 0, 1.6, 0.84, 1.05); v.box(RED, 0, 0.96, 0, 1.3, 0.24, 0.9); v.box(RED, 0.04, 1.2, 0.02, 1.12, 0.24, 0.8);
    for (const [ang, lean, hgt, wid] of [[0.45, 0.22, 2.4, 0.95], [2.7, 0.55, 1.5, 0.85], [-0.7, 0.7, 1.25, 0.8], [1.6, 0.85, 1.0, 0.75], [3.7, 0.95, 0.85, 0.75], [-2.0, 0.5, 1.7, 0.8]]) {
      const co = Math.cos(ang), si = Math.sin(ang), n = 6; let prev = null;
      for (let i = 0; i <= n; i++) { const t = i / n, out = 0.15 + lean * hgt * t * t, y = 1.32 + hgt * (t - 0.22 * t * t), w = wid * (1 - 0.8 * t * t) / 2, tw = 0.9 * t;      // each blade leans out, tapers and twists a little
        const sx = Math.cos(ang + tw), sz = Math.sin(ang + tw), p = [[co * out - sz * w, y, si * out + sx * w], [co * out + sz * w, y, si * out - sx * w]];
        if (prev) v.quad(RED, prev[0], prev[1], p[1], p[0]); prev = p; }
    }
    home(v); at(c, X, Z, 0.25, 0.05); c.box(G, 0, 1.2, 0, 1.6, 2.4, 1.05); home(c); }
  // plants in white pots at the porch columns (frames 31-33)
  for (const [X, Z] of [[42.2, zf(42) - 0.3], [52.2, zf(52) - 0.3], [58.6, 4.3], [62.5, 4.5]]) { plant(gx, X, Z, F0, 1.5); plant(gx, X + 0.45, Z + 0.25, F0, 1.0); }
  // garden north-west of the building (frames 21, 55): everything here is placed by eye
  { const nwOut = unit(sub(toL([A[0] - 0.5433, A[1] - 0.8395]), LA)), nwAlong = unit(sub(LB, LA)), P = (s, d) => add(add(LA, mul(nwAlong, s)), mul(nwOut, d));
    home(v); cap(v, 'lawn', [P(12, 4.5), P(LNW + 2, 4.5), P(LNW + 2, 17), P(12, 19)], 0.045, true);
    const circ = (r, n, a0 = 0, a1 = 2 * Math.PI) => Array.from({ length: a1 - a0 > 6.28 ? n : n + 1 }, (_, i) => [r * Math.cos(a0 + (a1 - a0) * i / n), r * Math.sin(a0 + (a1 - a0) * i / n)]);
    const sector = (r0, r1, a0, a1, n) => [...circ(r1, n, a0, a1), ...circ(r0, n, a0, a1).reverse()];
    const bed = P(-6, 15), SG = lm('stone'), PZ = lm('plaza'), FLO = lm('flower');                               // round bed with a stone disc, a ring of red planting and a ring path (frame 21)
    at(v, bed[0], bed[1]); cap(v, PZ, circ(6.2, 28), 0.065, true, [circ(3.8, 24)]); ringTop(v, FLO, 0, 0, 2.7, 3.8, 0, 2 * Math.PI, 0.3, 24); ringWall(v, FLO, 0, 0, 3.8, 0, 2 * Math.PI, 0, 0.3, 24, true);
    v.cyl(SG, 0, 0, 0, 2.7, 0.45, 28); cap(v, PZ, sector(12.5, 14.6, -0.4, 1.5, 20), 0.065, true);                      // an arc of path that leads round the west corner
    cap(v, FLO, sector(8.6, 11, -1.5, -0.45, 10), 0.2, true); ringWall(v, FLO, 0, 0, 11, -1.5, -0.45, 0, 0.2, 10, true); ringWall(v, FLO, 0, 0, 8.6, -1.5, -0.45, 0, 0.2, 10, false); home(v);   // crescent of red flowers (frames 21, 22, 55)
    at(c, bed[0], bed[1]); c.box(G, 0, 0.25, 0, 4.6, 0.5, 4.6); home(c);
    for (const [s, d] of [[2, 12], [-13, 11]]) { const p = P(s, d); at(gx, p[0], p[1], 0.6); gx.box(SG, 0, 0.25, 0, 2.2, 0.5, 0.7); home(gx); }      // stone benches
    const round = P(13, 14); at(v, round[0], round[1]); cap(v, PZ, circ(4.2, 24), 0.065, true); v.box(SG, 0.5, 0.3, 0.3, 1.8, 0.5, 1.0); home(v);        // small round paved place with a stone block (frame 55)
    const pad = P(47, 12); at(v, pad[0], pad[1], Math.atan2(-nwAlong[1], nwAlong[0])); v.box(PZ, 0, 0.035, 0, 7, 0.07, 3.2, 'D'); home(v);              // pale paved pad (frame 55, left)
    along(v, P(32, 4.5), P(32, 12)); v.slab(PZ, 0, 0, -1.5, 7.5, 0.07, 3, 'D'); home(v);                                                               // path from the middle door
    // young trees held by tripods of orange poles
    const tb = new Batch();
    for (const [s, d, hgt] of [[28.2, 11, 9], [18, 9, 6], [38, 9.5, 6], [46, 8, 5.5], [-4, 6, 8], [-10, 19.5, 6.5], [6, 22, 6]]) {
      const w = toW(P(s, d)); tree(tb, w[0], w[1], hgt);
      for (let i = 0; i < 3; i++) { const a = i * 2.094 + s; gx.strut(lm('pole'), [w[0] + 1.3 * Math.cos(a), 0, w[1] + 1.3 * Math.sin(a)], [w[0], 2.3, w[1]], 0.06); }
    }
    home(gx); ctx.add(tb.build({ name: item.id + '-trees' })); }

  // ================================================================= ASSEMBLY
  // flat panes, ground surfaces, indoor finishes, fins and railings are not drawn into the shadow map
  const NO_SHADOW = new Set(['steel', 'lib-fin', 'lib-railDark', 'glassDark', 'lawn', 'asphalt', 'lib-plaster', 'lib-ceil', 'lib-cove', 'lib-plaza', 'lib-flower', 'lib-ribbon', 'lib-frame']);
  const finish = (b, name, shadow) => {
    const g = b.build({ name: item.id + '-' + name, castShadow: shadow });
    g.traverse(o => { if (!o.isMesh) return; if (o.material.transparent) o.renderOrder = 1; if (NO_SHADOW.has(o.material.name)) o.castShadow = false; });
    return ctx.add(g);
  };
  finish(v, 'shell', true);
  const mid = toW([40, -12]);
  ctx.detail(finish(iv, 'interior', false), mid[0], mid[1], 140);
  ctx.detail(finish(fu, 'furniture', false), mid[0], mid[1], 70);
  ctx.detail(finish(fx, 'fine', false), mid[0], mid[1], 45);
  ctx.detail(finish(gx, 'outdoor-detail', false), mid[0], mid[1], 150);
  const cg = ctx.add(c.build({ name: item.id + '-colliders' })); cg.visible = false;
  cg.traverse(o => { if (o.isMesh) ctx.collide(o); });

  function aTan(f) { return Math.atan2(-(f(40) - f(30)), 10); }       // heading of the podium front in the L frame
}
