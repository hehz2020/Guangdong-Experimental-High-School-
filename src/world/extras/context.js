// Context buildings: everything around the modelled core that has no entry in campus-data.js, so that the campus does
// not end in empty lawn - the building group at the south end, the buildings north of the arc building, sheds west and
// south-west of the track - plus ONE block inside the core (the pergola-roofed block west of the clock tower).
// Exteriors only, mid-detail massing; none can be entered.
//
// The numbers in the DATA block below are a copy of "buildings" in data/context.json (which also records the pixel
// readings, the basis of every height, the confidence and what was left out). Both were written from the same roof
// outlines, read ONCE off gridded enlargements of the zoom-19 satellite mosaic (not in the repository); a roof pixel at
// height h was moved by (+0.243 h, -2.0 h) px to its ground position, as scripts/build-campus-data.mjs does. There is
// no generator script in the repository: a change must be made in both places.
//
// SEEN (and where)
//   core-pergola-block   2022 video, frame 60 (from the east): long narrow block running west from the clock tower along
//                        the south edge of the plaza canopy; white; slatted pergola-like panels on the south strip of
//                        its roof; tall white fins and dark green glazing on its east end. Satellite: roof outline.
//   south-round-pavilion 2018 video, frames 49-51, 64, 66 (the "tall open portico at the south end of the track"): a
//                        thin round roof disc on a ring of tall slender white columns round a dark-glazed drum with
//                        white floor bands, a ring beam at about three quarters of the height. Satellite: pale ring of
//                        8.8 m radius with a grey-green disc and a pale object at its centre.
//   south-low-link       2018 video, frame 64: a low red-brown block with white bands beside the pavilion.
//   south-court-complex  PROBABLY the "white-and-red block" and the "rounded white building with blue windows" of the
//                        same frames (matched by bearing only): white frame with red-brown infill panels on the long
//                        north face, white end wall with a blue-green glazed stair strip, round white tower with blue
//                        ribbon windows. Satellite: outline, pale roofs covered with small units.
//   all the others       satellite only: roof outline and roof colour (the median colour of the roof in the image,
//                        slightly lightened). Whether any of them belongs to the school is NOT known; none is named.
//
// ASSUMED (not shown by any reference; kept plain, no lettering, no signs)
//   - Every height that data/context.json marks ASSUMED (all north buildings, all sheds, the annex of the E-shaped
//     complex). The tall building's 75 m rests on one reading of a 150 px facade; +-10 m.
//   - Storey heights, window sizes and spacing, sills, parapets (0.6 m), door positions and door canopies everywhere.
//   - Wall colours of every face not seen in the video: the E-shaped complex (cream), the north buildings (white or
//     cream), sheds (grey). The tall building's reddish wall is the sunlit east face in the image; its other faces and
//     its white floor bands are extended from that face.
//   - core-pergola-block: five storeys; the north, south and west faces (white, punched windows; ribbon windows toward
//     the plaza); how far the fins and the glazing run on the east end; the pergola as five framed panels of slats level
//     with the parapet (the frame shows about five panels, their construction is not visible). Its outline is trimmed
//     to stay 0.3 m clear of the clock tower and the glass stair block and 0.5 m clear of the canopy edge.
//     THE GROUND STOREY IS DRAWN OPEN ON COLUMNS between two solid end cores, with the column lines set half a bay
//     either side of the canopy's axis: no reference shows the ground storey (trees hide it in frame 60). An open
//     ground storey is common in this climate and keeps the plaza reachable from the south, as it was before this
//     block was added; it may well be closed in reality.
//   - south-round-pavilion: drum radius (5.5 m), twelve columns on a 7.6 m ring, four glazed levels, the door.
//   - south-court-complex: all courtyard faces, the east parts, the south bars (white with punched windows), five
//     storeys; the round tower's ribbon windows are continued all round. Roof units are a plain row of boxes.
//   - Skewed outlines are squared, the S-curved parapet of north-wavy-parapet-block is straight, light wells and roof
//     openings are left out (see "notModelled" in data/context.json).
//   - south-tall-building is the least certain entry: its 75 m come from the mosaic alone, and the 2018 frames that
//     look its way show open sky (built later, or misread). To drop it, delete its line in the DATA block below.
//   - The ground under the south group beyond the landscape survey (z 150.5 to 246, x 20 to 215) is one plain paving
//     rectangle: the image shows paved yards and parking there, but neither extent nor surface was measured.
//
// Collision: one prism per part from the ground to its roof plane (roof included, so a player leaving drone mode above
// a building lands on it); the pavilion has its drum and its roof disc (the ring of columns can be walked through);
// the pergola block has its upper storeys, its two end cores and its ground-storey columns.
//
// Cost, measured as the difference of the renderer totals in the default overview with and without this module
// (31 parts): 9 draw calls and about 18,200 triangles in the main pass (13,000 with lowPower, which doubles the window
// bays and drops the roof units); with shadows on, 33 calls and about 72,700 triangles in all, because the meshes are
// drawn again into the three shadow cascades (with lowPower only the core and south groups cast shadows). One matt and
// one glass mesh per group (core, south, north, west), the pergola slats (shown within 160 m) and one paving quad.
import { THREE, mat, flat, prism, circlePoints } from '../../kit.js';
import { CAMPUS } from '../../campus-data.js';

/* <context-data> copy of "buildings" in data/context.json (ground outlines in metres) - edit there, not here */
const DATA = [
  {"id":"core-pergola-block","group":"core","parts":[{"id":"main","height":20.7,"look":{"kind":"pergola-block","wall":"white","roof":"beige","storeys":5,"storeyH":3.9},"shape":"polygon","points":[[148.8,-73.2],[190.8,-73.2],[190.8,-57.8],[148.8,-57.8]],"roofColourInImage":"#656149","pergolaStripDepthM":6.6}]},
  {"id":"south-round-pavilion","group":"south","parts":[{"id":"disc","height":15,"look":{"kind":"pavilion","wall":"white","roof":"pale","storeys":4,"storeyH":3.6},"shape":"circle","cx":28.9,"cz":108.2,"radius":8.8,"roofColourInImage":"#8a8f7b","drumRadiusM":5.5,"columnRingRadiusM":7.6,"columns":12}]},
  {"id":"south-low-link","group":"south","parts":[{"id":"main","height":6.5,"look":{"kind":"block","wall":"redBrown","band":"white","roof":"pale","win":"bands","storeys":2,"storeyH":3.0},"shape":"polygon","points":[[39.3,111.0],[52.5,111.0],[52.5,125.3],[39.3,125.3]],"roofColourInImage":"#baae91"}]},
  {"id":"south-court-complex","group":"south","parts":[{"id":"north-bar","height":18,"look":{"kind":"block","wall":"white","roof":"pale","win":"brick-bays","storeys":5,"storeyH":3.4,"roofUnits":true,"accent":"redBrown","stairStrip":"W"},"shape":"polygon","points":[[56.6,92.3],[129.3,92.3],[129.3,103.0],[56.6,103.0]],"roofColourInImage":"#bdb6a4"},{"id":"west-bar","height":18,"look":{"kind":"block","wall":"white","roof":"pale","win":"bands","storeys":5,"storeyH":3.4,"roofUnits":true,"glass":"blue"},"shape":"polygon","points":[[56.6,103.0],[66.2,103.0],[66.2,121.1],[56.6,121.1]],"roofColourInImage":"#beb59a"},{"id":"south-west-bar","height":18,"look":{"kind":"block","wall":"white","roof":"pale","win":"punched","storeys":5,"storeyH":3.4,"roofUnits":true},"shape":"polygon","points":[[63.4,121.1],[95.0,121.1],[95.0,130.5],[63.4,130.5]],"roofColourInImage":"#a09783"},{"id":"south-east-bar","height":18,"look":{"kind":"block","wall":"white","roof":"pale","win":"punched","storeys":5,"storeyH":3.4,"roofUnits":true},"shape":"polygon","points":[[95.0,114.8],[128.8,114.8],[128.8,126.6],[95.0,126.6]],"roofColourInImage":"#aaa593"},{"id":"link","height":18,"look":{"kind":"block","wall":"white","roof":"pale","win":"punched","storeys":5,"storeyH":3.4,"roofUnits":false},"shape":"polygon","points":[[92.3,103.0],[95.0,103.0],[95.0,121.1],[92.3,121.1]],"roofColourInImage":"#d7cbb7"},{"id":"east-end","height":18,"look":{"kind":"block","wall":"white","roof":"pale","win":"punched","storeys":5,"storeyH":3.4,"roofUnits":false},"shape":"polygon","points":[[123.9,103.0],[129.9,103.0],[129.9,114.8],[123.9,114.8]],"roofColourInImage":"#9a9379"},{"id":"round-tower","height":18,"look":{"kind":"drum","wall":"white","roof":"pale","win":"bands","glass":"blue","storeys":5,"storeyH":3.4},"shape":"circle","cx":58.5,"cz":127.2,"radius":4.9,"roofColourInImage":"#a79e86"}]},
  {"id":"south-e-complex","group":"south","parts":[{"id":"bar-1","height":21.6,"look":{"kind":"block","wall":"cream","roof":"pale","win":"punched","storeys":6,"storeyH":3.5},"shape":"polygon","points":[[54.0,151.3],[126.8,151.3],[126.8,169.2],[54.0,169.2]],"roofColourInImage":"#d1c5ab"},{"id":"bar-2","height":21.6,"look":{"kind":"block","wall":"cream","roof":"pale","win":"punched","storeys":6,"storeyH":3.5},"shape":"polygon","points":[[62.3,196.6],[126.8,196.6],[126.8,211.7],[62.3,211.7]],"roofColourInImage":"#5c5542"},{"id":"bar-3","height":21.6,"look":{"kind":"block","wall":"cream","roof":"pale","win":"punched","storeys":6,"storeyH":3.5},"shape":"polygon","points":[[91.1,226.8],[126.8,226.8],[126.8,239.2],[91.1,239.2]],"roofColourInImage":"#797461"},{"id":"spine","height":21.6,"look":{"kind":"block","wall":"cream","roof":"pale","win":"bands","storeys":6,"storeyH":3.5},"shape":"polygon","points":[[126.8,152.7],[137.8,152.7],[137.8,239.2],[126.8,239.2]],"roofColourInImage":"#8b806b"},{"id":"north-west-annex","height":8,"look":{"kind":"block","wall":"white","roof":"pale","win":"bands","storeys":2,"storeyH":3.6},"shape":"polygon","points":[[29.2,160.1],[51.8,160.1],[51.8,183.5],[29.2,183.5]],"roofColourInImage":"#cec5af"}]},
  {"id":"south-tall-building","group":"south","parts":[{"id":"main","height":75,"look":{"kind":"tower","wall":"pinkBrown","band":"white","roof":"pale","win":"punched","storeys":25,"storeyH":2.96},"shape":"polygon","points":[[149.1,169.5],[203.2,169.5],[203.2,209.9],[149.1,209.9]],"roofColourInImage":"#aaa38d"},{"id":"west-part","height":75,"look":{"kind":"tower","wall":"pinkBrown","band":"white","roof":"pale","win":"punched","storeys":25,"storeyH":2.96},"shape":"polygon","points":[[141.4,193.4],[149.1,193.4],[149.1,212.6],[141.4,212.6]],"roofColourInImage":"#58523e"}]},
  {"id":"north-dark-roof-block","group":"north","parts":[{"id":"main","height":7.5,"look":{"kind":"block","wall":"cream","roof":"dark","win":"punched","storeys":2,"storeyH":3.4},"shape":"polygon","points":[[74.3,-195.3],[92.9,-204.9],[106.7,-188.4],[88.8,-177.5]],"roofColourInImage":"#544f3b"}]},
  {"id":"north-wavy-parapet-block","group":"north","parts":[{"id":"main","height":8,"look":{"kind":"block","wall":"white","roof":"pale","win":"bands","storeys":2,"storeyH":3.7},"shape":"polygon","points":[[185.5,-256.3],[208.9,-272.2],[219.3,-257.4],[196.8,-243.7]],"roofColourInImage":"#b3ab92"}]},
  {"id":"north-white-shed","group":"north","parts":[{"id":"main","height":6,"look":{"kind":"shed","wall":"grey","roof":"whiteMetal","win":"bands","storeys":1,"storeyH":5.6},"shape":"polygon","points":[[241.7,-276.9],[252.7,-283.2],[257.6,-274.1],[246.7,-267.3]],"roofColourInImage":"#eeedde"}]},
  {"id":"north-long-white-shed","group":"north","parts":[{"id":"main","height":6,"look":{"kind":"shed","wall":"grey","roof":"whiteMetal","win":"bands","storeys":1,"storeyH":5.6},"shape":"polygon","points":[[276.3,-259.6],[285.1,-259.0],[284.0,-225.5],[274.1,-226.1]],"roofColourInImage":"#f4f2e2"},{"id":"south-part","height":5,"look":{"kind":"shed","wall":"grey","roof":"whiteMetal","win":"none","storeys":1,"storeyH":4.6},"shape":"polygon","points":[[278.2,-223.3],[284.0,-223.3],[284.0,-211.8],[278.2,-211.8]],"roofColourInImage":"#c6bfab"}]},
  {"id":"north-east-pale-complex","group":"north","parts":[{"id":"north-block","height":10,"look":{"kind":"block","wall":"white","roof":"pale","win":"bands","storeys":3,"storeyH":3.1},"shape":"polygon","points":[[252.4,-206.3],[275.8,-206.3],[275.8,-191.2],[252.4,-191.2]],"roofColourInImage":"#b4ab95"},{"id":"south-block","height":10,"look":{"kind":"block","wall":"white","roof":"pale","win":"punched","storeys":3,"storeyH":3.1},"shape":"polygon","points":[[260.7,-191.2],[274.4,-191.2],[274.4,-177.5],[260.7,-177.5]],"roofColourInImage":"#bbb29c"}]},
  {"id":"west-sheds-north-of-stand","group":"west","parts":[{"id":"a","height":3.2,"look":{"kind":"shed","wall":"grey","roof":"pale","win":"none","storeys":1,"storeyH":2.8},"shape":"polygon","points":[[-104.6,-81.7],[-60.6,-103.9],[-62.8,-108.3],[-106.8,-86.1]],"roofColourInImage":"#e0d4bd"},{"id":"b","height":3.2,"look":{"kind":"shed","wall":"grey","roof":"pale","win":"none","storeys":1,"storeyH":2.8},"shape":"polygon","points":[[-100.3,-73.8],[-74.4,-86.5],[-76.5,-90.7],[-102.3,-78.0]],"roofColourInImage":"#e2d6bf"}]},
  {"id":"southwest-sheds","group":"west","parts":[{"id":"dark","height":3.2,"look":{"kind":"shed","wall":"grey","roof":"grey","win":"none","storeys":1,"storeyH":2.8},"shape":"polygon","points":[[-89.7,123.5],[-78.2,123.5],[-78.2,127.1],[-89.7,127.1]],"roofColourInImage":"#675b45"},{"id":"blue","height":3.2,"look":{"kind":"shed","wall":"grey","roof":"blue","win":"none","storeys":1,"storeyH":2.8},"shape":"polygon","points":[[-103.2,129.3],[-96.9,129.3],[-96.9,135.3],[-103.2,135.3]],"roofColourInImage":"#808393"},{"id":"red","height":3.2,"look":{"kind":"shed","wall":"grey","roof":"redTile","win":"none","storeys":1,"storeyH":2.8},"shape":"polygon","points":[[-76.0,132.6],[-67.8,132.6],[-67.8,138.9],[-76.0,138.9]],"roofColourInImage":"#ba8a75"}]},
  {"id":"south-small-roofs","group":"west","parts":[{"id":"a","height":3.2,"look":{"kind":"shed","wall":"grey","roof":"pale","win":"none","storeys":1,"storeyH":2.8},"shape":"polygon","points":[[-32.9,108.1],[-28.2,108.1],[-28.2,116.1],[-32.9,116.1]],"roofColourInImage":"#cac1a0"},{"id":"b","height":3.2,"look":{"kind":"shed","wall":"grey","roof":"pale","win":"bands","storeys":1,"storeyH":2.8},"shape":"polygon","points":[[-24.9,127.6],[-12.8,127.6],[-12.8,134.8],[-24.9,134.8]],"roofColourInImage":"#cec1a8"}]}
];
/* </context-data> */

// ---------------------------------------------------------------- outlines
const rectOf = pts => { const xs = pts.map(p => p[0]), zs = pts.map(p => p[1]); return { w: Math.min(...xs), e: Math.max(...xs), n: Math.min(...zs), s: Math.max(...zs) }; };
const itemBox = (campus, id) => { const it = campus.items.find(i => i.id === id); return it && it.points ? rectOf(it.points) : null; };
/** Ground polygon of a part. The pergola block is trimmed against its neighbours as they are placed NOW in campus-data. */
function outline(b, p, campus) {
  if (p.shape === 'circle') return circlePoints(p.cx, p.cz, p.radius, 24);
  if (b.id !== 'core-pergola-block') return p.points;
  const r = rectOf(p.points), tower = itemBox(campus, 'clock-tower'), stair = itemBox(campus, 'glass-stair-block'), canopy = itemBox(campus, 'plaza-canopy');
  if (tower && tower.w > r.w + 10) r.e = Math.min(r.e, tower.w - 0.3);
  if (stair && stair.w > r.w + 10 && stair.s > r.n) r.e = Math.min(r.e, stair.w - 0.3);
  if (canopy && canopy.s < r.s - 4) r.n = Math.max(r.n, canopy.s + 0.5);
  return [[r.w, r.n], [r.e, r.n], [r.e, r.s], [r.w, r.s]];
}
const APRON = [20, 215, 150.5, 246];                 // west, east, north, south of the paving under the south group ("groundApron" in data/context.json)
/** Ground polygons [[x,z],...] of everything this module builds: for keeping trees out and for the minimap. */
export const FOOTPRINTS = DATA.flatMap(b => b.parts.map(p => outline(b, p, CAMPUS).map(([x, z]) => [Math.round(x * 10) / 10, Math.round(z * 10) / 10])));

// ---------------------------------------------------------------- colours (linear, for vertex colours)
const C = hex => { const c = new THREE.Color(hex); return [c.r, c.g, c.b]; };
const WALL = { white: C(0xf0eee6), cream: C(0xe7dcc0), redBrown: C(0x8f4a3a), pinkBrown: C(0xb4826c), grey: C(0xb4b1a8) };
const GLASS = { dark: C(0x26343b), blue: C(0x3d6e96), teal: C(0x1f4b52), green: C(0x2b5a4b) };
const COPE = C(0xe3e0d6), DOOR = C(0x1d2a30), UNIT = C(0xd8d8d2), SLAT = C(0xf2f2ee), DECK = C(0x5c5a55);
const roofColour = p => { const c = new THREE.Color(p.roofColourInImage || '#b9b6ad'); c.lerp(new THREE.Color(0xffffff), 0.12); return [c.r, c.g, c.b]; };

// ---------------------------------------------------------------- a small mesh writer: positions, normals, colours
class Soup {
  constructor() { this.p = []; this.n = []; this.c = []; this.i = []; }
  /** Convex polygon from corners in loop order (either direction), facing `nrm`. */
  face(corners, nrm, col) {
    const base = this.p.length / 3, a = corners[0], b = corners[1], c = corners[2];
    for (const q of corners) { this.p.push(q[0], q[1], q[2]); this.n.push(nrm[0], nrm[1], nrm[2]); this.c.push(col[0], col[1], col[2]); }
    const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2], vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
    const ccw = (uy * vz - uz * vy) * nrm[0] + (uz * vx - ux * vz) * nrm[1] + (ux * vy - uy * vx) * nrm[2] >= 0;
    for (let k = 1; k < corners.length - 1; k++) ccw ? this.i.push(base, base + k, base + k + 1) : this.i.push(base, base + k + 1, base + k);
  }
  /** Box with one horizontal axis along (ax, az); sx along that axis, sz across it. */
  box(cx, cz, ax, az, sx, sz, y0, y1, col, bottom = false) {
    const hx = sx / 2, hz = sz / 2, P = (u, w, y) => [cx + ax * u - az * w, y, cz + az * u + ax * w];
    this.face([P(-hx, hz, y0), P(hx, hz, y0), P(hx, hz, y1), P(-hx, hz, y1)], [-az, 0, ax], col);
    this.face([P(-hx, -hz, y0), P(hx, -hz, y0), P(hx, -hz, y1), P(-hx, -hz, y1)], [az, 0, -ax], col);
    this.face([P(hx, -hz, y0), P(hx, hz, y0), P(hx, hz, y1), P(hx, -hz, y1)], [ax, 0, az], col);
    this.face([P(-hx, -hz, y0), P(-hx, hz, y0), P(-hx, hz, y1), P(-hx, -hz, y1)], [-ax, 0, -az], col);
    this.face([P(-hx, -hz, y1), P(hx, -hz, y1), P(hx, hz, y1), P(-hx, hz, y1)], [0, 1, 0], col);
    if (bottom) this.face([P(-hx, -hz, y0), P(hx, -hz, y0), P(hx, hz, y0), P(-hx, hz, y0)], [0, -1, 0], col);
  }
  /** Side of a vertical cylinder (smooth normals). */
  tube(cx, cz, r, y0, y1, col, seg) {
    for (let k = 0; k < seg; k++) {
      const a0 = k / seg * 2 * Math.PI, a1 = (k + 1) / seg * 2 * Math.PI, am = (a0 + a1) / 2;
      this.face([[cx + r * Math.cos(a0), y0, cz + r * Math.sin(a0)], [cx + r * Math.cos(a1), y0, cz + r * Math.sin(a1)], [cx + r * Math.cos(a1), y1, cz + r * Math.sin(a1)], [cx + r * Math.cos(a0), y1, cz + r * Math.sin(a0)]], [Math.cos(am), 0, Math.sin(am)], col);
    }
  }
  /** Horizontal ring (r0 = 0 gives a disc) facing up or down. */
  ring(cx, cz, r0, r1, y, col, seg, up = true) {
    const n = [0, up ? 1 : -1, 0];
    for (let k = 0; k < seg; k++) {
      const a0 = k / seg * 2 * Math.PI, a1 = (k + 1) / seg * 2 * Math.PI, o0 = [cx + r1 * Math.cos(a0), y, cz + r1 * Math.sin(a0)], o1 = [cx + r1 * Math.cos(a1), y, cz + r1 * Math.sin(a1)];
      if (r0 > 0) this.face([o0, o1, [cx + r0 * Math.cos(a1), y, cz + r0 * Math.sin(a1)], [cx + r0 * Math.cos(a0), y, cz + r0 * Math.sin(a0)]], n, col);
      else this.face([o0, o1, [cx, y, cz]], n, col);
    }
  }
  mesh(material) {
    if (!this.i.length) return null;
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(this.p, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(this.n, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(this.c, 3));
    g.setIndex(this.i);
    return new THREE.Mesh(g, material);
  }
}

// ---------------------------------------------------------------- facades
/** Points in the order for which the outward normal of an edge with direction (dx, dz) is (dz, -dx). */
function ordered(pts) {
  let a = 0; for (let i = 0; i < pts.length; i++) { const p = pts[i], q = pts[(i + 1) % pts.length]; a += p[0] * q[1] - q[0] * p[1]; }
  return a >= 0 ? pts : [...pts].reverse();
}
function edgeOf(p, q) {
  const dx = q[0] - p[0], dz = q[1] - p[1], L = Math.hypot(dx, dz) || 1e-6, ux = dx / L, uz = dz / L, nx = uz, nz = -ux;
  return { L, ux, uz, nx, nz, n3: [nx, 0, nz], facing: Math.abs(nx) > Math.abs(nz) ? (nx > 0 ? 'E' : 'W') : (nz > 0 ? 'S' : 'N'), at: (u, y, w = 0) => [p[0] + ux * u + nx * w, y, p[1] + uz * u + nz * w] };
}
const strip = (S, E, u0, u1, y0, y1, col) => { if (u1 - u0 > 1e-3 && y1 - y0 > 1e-3) S.face([E.at(u0, y0), E.at(u1, y0), E.at(u1, y1), E.at(u0, y1)], E.n3, col); };

/**
 * One wall, built from strips that never overlap (no coplanar faces, so nothing flickers at a distance):
 * per storey an optional floor band, the sill zone, the window row (wall and glass alternating) and the head.
 * o: { h, top, storeys, wall, band, accent, glass, win, bay, from (first storey drawn, default 0) }
 */
function facade(G, E, o) {
  const { flat, glass } = G, sh = o.top / o.storeys, tall = sh > 4.5;
  const sill = tall ? sh * 0.5 : 0.95, winH = tall ? 1.2 : Math.min(1.7, sh - 1.55);
  let win = E.L < 3.2 ? 'none' : o.win;
  const stair = o.stairStrip && o.stairStrip === E.facing && E.L < 16;
  if (win === 'brick-bays' && E.L < 16) win = 'slots';
  for (let k = o.from || 0; k < o.storeys; k++) {
    const y0 = k * sh, yS = y0 + sill, yW = yS + winH, y1 = y0 + sh, infill = win === 'brick-bays' ? o.accent : o.wall;
    let ya = y0;
    if (o.band && k > 0) { strip(flat, E, 0, E.L, y0, y0 + 0.3, o.band); ya = y0 + 0.3; }
    if (stair) {                                     // glazed stair strip in an end wall, as in the 2018 frames
      const m = E.L / 2;
      strip(flat, E, 0, m - 1.1, ya, y1, o.wall); strip(flat, E, m + 1.1, E.L, ya, y1, o.wall);
      strip(glass, E, m - 1.1, m + 1.1, Math.max(ya, 0.5), y1 - 0.25, GLASS.teal); strip(flat, E, m - 1.1, m + 1.1, y1 - 0.25, y1, o.wall);
      if (k === 0) strip(flat, E, m - 1.1, m + 1.1, 0, 0.5, o.wall);
      continue;
    }
    strip(flat, E, 0, E.L, ya, yS, infill);
    strip(flat, E, 0, E.L, yW, y1, o.wall);
    if (win === 'none') strip(flat, E, 0, E.L, yS, yW, o.wall);
    else if (win === 'bands') { const m = Math.min(1.0, E.L * 0.12); strip(flat, E, 0, m, yS, yW, o.wall); strip(glass, E, m, E.L - m, yS, yW, o.glass); strip(flat, E, E.L - m, E.L, yS, yW, o.wall); }
    else if (win === 'brick-bays') {
      const n = Math.max(1, Math.round(E.L / o.bay)), bw = E.L / n, pier = 0.5, ww = (bw - pier) * 0.5;
      for (let i = 0; i < n; i++) {
        const u = i * bw, a = u + pier / 2, b = a + (bw - pier - ww) / 2;
        strip(flat, E, u - (i ? pier / 2 : 0), a, yS, yW, o.wall); strip(flat, E, a, b, yS, yW, infill); strip(glass, E, b, b + ww, yS, yW, o.glass); strip(flat, E, b + ww, u + bw - pier / 2, yS, yW, infill);
      }
      strip(flat, E, E.L - pier / 2, E.L, yS, yW, o.wall);
    } else {                                         // 'punched' and 'slots'
      const n = Math.max(1, Math.round(E.L / (win === 'slots' ? E.L / 2 : o.bay))), bw = E.L / n, ww = win === 'slots' ? 1.4 : bw * 0.52;
      const ys = win === 'slots' ? yW - 0.6 : yS;
      if (ys > yS) strip(flat, E, 0, E.L, yS, ys, o.wall);
      for (let i = 0; i < n; i++) { const a = i * bw + (bw - ww) / 2; strip(flat, E, i ? a - (bw - ww) : 0, a, ys, yW, o.wall); strip(glass, E, a, a + ww, ys, yW, o.glass); }
      strip(flat, E, E.L - (bw - ww) / 2, E.L, ys, yW, o.wall);
    }
  }
  strip(flat, E, 0, E.L, o.top, o.h, o.band || o.wall);          // parapet or eaves zone
}
/** Door with a small canopy at the middle of an edge (boxes standing proud of the wall, so nothing is coplanar). */
function door(G, E, w = 2.0) {
  const c = E.at(E.L / 2, 0, 0.05), k = E.at(E.L / 2, 0, 0.7);
  G.glass.box(c[0], c[2], E.ux, E.uz, w, 0.1, 0, 2.3, DOOR);
  G.flat.box(k[0], k[2], E.ux, E.uz, w + 1.2, 1.4, 2.6, 2.78, COPE, true);
}
function inset(pts, t) {                             // convex polygon moved inward by t
  const n = pts.length, out = [];
  for (let i = 0; i < n; i++) {
    const a = edgeOf(pts[(i + n - 1) % n], pts[i]), b = edgeOf(pts[i], pts[(i + 1) % n]);
    const s = 1 + a.nx * b.nx + a.nz * b.nz, k = t / (s < 0.2 ? 0.2 : s);
    out.push([pts[i][0] - (a.nx + b.nx) * k, pts[i][1] - (a.nz + b.nz) * k]);
  }
  return out;
}
function parapet(S, pts, yRoof, h, col) {
  const inn = inset(pts, 0.25);
  for (let i = 0; i < pts.length; i++) {
    const j = (i + 1) % pts.length, E = edgeOf(pts[i], pts[j]);
    S.face([[pts[i][0], h, pts[i][1]], [pts[j][0], h, pts[j][1]], [inn[j][0], h, inn[j][1]], [inn[i][0], h, inn[i][1]]], [0, 1, 0], col);
    S.face([[inn[i][0], yRoof, inn[i][1]], [inn[j][0], yRoof, inn[j][1]], [inn[j][0], h, inn[j][1]], [inn[i][0], h, inn[i][1]]], [-E.nx, 0, -E.nz], col);
  }
}

// ---------------------------------------------------------------- the kinds of part
function block(G, pts, p, lowPower) {
  const L = p.look, h = p.height, shed = L.kind === 'shed', top = h - (shed ? 0.4 : 1.0), yRoof = shed ? h : h - 0.6;
  const o = { h, top, storeys: L.storeys, wall: WALL[L.wall], band: L.band && WALL[L.band], accent: L.accent && WALL[L.accent], glass: GLASS[L.glass || 'dark'], win: L.win,
    bay: (L.kind === 'tower' ? 5.4 : L.win === 'brick-bays' ? 3.6 : 3.8) * (lowPower ? 2 : 1), stairStrip: L.stairStrip };
  const edges = pts.map((q, i) => edgeOf(q, pts[(i + 1) % pts.length]));
  edges.forEach(E => facade(G, E, o));
  if (!shed) door(G, edges.reduce((a, b) => (b.L > a.L ? b : a)));
  G.flat.face(pts.map(([x, z]) => [x, yRoof, z]), [0, 1, 0], roofColour(p));
  if (!shed) parapet(G.flat, pts, yRoof, h, COPE);
  if (L.roofUnits && !lowPower) {                    // "roofs covered with small units": one plain row of boxes
    const E = edges.reduce((a, b) => (b.L > a.L ? b : a)), i = edges.indexOf(E), depth = edges[(i + 1) % edges.length].L;
    for (let u = 4; u < E.L - 3; u += 5.5) { const c = E.at(u, 0, -depth / 2); G.flat.box(c[0], c[2], E.ux, E.uz, 2.0, 1.3, yRoof, yRoof + 1.1, UNIT); }
  }
}
/** Round tower of the courtyard complex: white drum with ribbon windows on every storey. */
function drum(G, p) {
  const L = p.look, h = p.height, top = h - 1.0, sh = top / L.storeys, seg = 20, wall = WALL[L.wall], gl = GLASS[L.glass || 'dark'];
  for (let k = 0; k < L.storeys; k++) {
    const y0 = k * sh;
    G.flat.tube(p.cx, p.cz, p.radius, y0, y0 + 1.0, wall, seg); G.glass.tube(p.cx, p.cz, p.radius, y0 + 1.0, y0 + 2.5, gl, seg); G.flat.tube(p.cx, p.cz, p.radius, y0 + 2.5, y0 + sh, wall, seg);
  }
  G.flat.tube(p.cx, p.cz, p.radius, top, h, wall, seg);
  G.flat.ring(p.cx, p.cz, 0, p.radius, h - 0.6, roofColour(p), seg);
  G.flat.ring(p.cx, p.cz, p.radius - 0.25, p.radius, h, COPE, seg);
}
/** The round pavilion of the 2018 frames: glazed drum, ring of slender columns, thin round roof disc. */
function pavilion(G, p) {
  const { cx, cz, radius: R, height: h } = p, rd = p.drumRadiusM, rc = p.columnRingRadiusM, n = p.columns, slab = 0.45, top = h - slab, sh = top / p.look.storeys, seg = 28;
  for (let k = 0; k < p.look.storeys; k++) {           // drum: white floor bands, dark glazing between
    const y0 = k * sh;
    G.flat.tube(cx, cz, rd, y0, y0 + 0.55, WALL.white, seg); G.glass.tube(cx, cz, rd, y0 + 0.55, y0 + sh, GLASS.teal, seg);
  }
  G.flat.ring(cx, cz, 0, R, top, WALL.white, seg, false);                    // underside of the roof disc
  G.flat.tube(cx, cz, R, top, h, WALL.white, seg);
  G.flat.ring(cx, cz, rd + 1.1, R, h, C(0xdedacd), seg);                     // pale ring as in the image
  G.flat.ring(cx, cz, 0, rd + 1.1, h, roofColour(p), seg);                   // grey-green centre
  G.flat.tube(cx, cz, 1.5, h, h + 0.9, UNIT, 12); G.flat.ring(cx, cz, 0, 1.5, h + 0.9, UNIT, 12);   // pale object at the centre
  const yb = top * 0.74;
  for (let k = 0; k < n; k++) {
    const a = (k + 0.5) / n * 2 * Math.PI, a2 = (k + 1.5) / n * 2 * Math.PI, x = cx + rc * Math.cos(a), z = cz + rc * Math.sin(a), x2 = cx + rc * Math.cos(a2), z2 = cz + rc * Math.sin(a2);
    G.flat.tube(x, z, 0.26, 0, top, WALL.white, 8);
    const d = Math.hypot(x2 - x, z2 - z);                                     // ring beam from column to column
    G.flat.box((x + x2) / 2, (z + z2) / 2, (x2 - x) / d, (z2 - z) / d, d, 0.3, yb, yb + 0.45, WALL.white, true);
    G.flat.box(cx + (rc + rd) / 2 * Math.cos(a), cz + (rc + rd) / 2 * Math.sin(a), Math.cos(a), Math.sin(a), rc - rd, 0.25, yb + 0.05, yb + 0.4, WALL.white, true);   // tie back to the drum
  }
  const dc = [cx, cz - rd - 0.04];                                             // door on the north side (toward the track): ASSUMED
  G.glass.box(dc[0], dc[1], 1, 0, 2.4, 0.12, 0, 2.5, DOOR);
}
/**
 * The block west of the clock tower (2022 frame 60). Its ground storey is drawn OPEN on columns between two solid end
 * cores (ASSUMED, see the header). Returns { slats, colliders }: the slats are only worth drawing nearby.
 */
function pergolaBlock(G, pts, p, axisX) {
  const r = rectOf(pts), h = p.height, top = h - 1.2, yRoof = h - 0.6, strip0 = r.s - p.pergolaStripDepthM, n = p.look.storeys, sh = top / n;
  const P = ordered(pts), edges = P.map((q, i) => edgeOf(q, P[(i + 1) % P.length])), bay = 4.2, core = 5.2;
  const base = { h, top, storeys: n, wall: WALL.white, glass: GLASS.dark, bay };
  const xa = r.w + core, xb = r.e - core;            // the open part of the ground storey lies between xa and xb
  for (const E of edges) {
    if (E.facing === 'E') {                           // east end: dark green glazing, white fins at its south end (frame 60)
      const finZone = Math.min(3.8, E.L * 0.3), south = E.at(0, 0)[2] > E.at(E.L, 0)[2];
      const g0 = south ? finZone : 1.0, g1 = south ? E.L - 1.0 : E.L - finZone;
      strip(G.flat, E, 0, g0, 0, h, WALL.white); strip(G.flat, E, g1, E.L, 0, h, WALL.white);
      strip(G.flat, E, g0, g1, 0, 1.0, WALL.white); strip(G.glass, E, g0, g1, 1.0, top, GLASS.green); strip(G.flat, E, g0, g1, top, h, WALL.white);
      for (let k = 1; k < n; k++) { const c = E.at((g0 + g1) / 2, 0, 0.06); G.flat.box(c[0], c[2], E.ux, E.uz, g1 - g0, 0.12, k * sh - 0.15, k * sh + 0.15, WALL.white, true); }
      for (let f = 0; f < 4; f++) { const u = south ? 0.35 + f * 0.95 : E.L - 0.35 - f * 0.95, c = E.at(u, 0, 0.3); G.flat.box(c[0], c[2], E.ux, E.uz, 0.18, 0.6, 2 * sh, h, WALL.white, true); }
    } else if (E.facing === 'W') facade(G, E, { ...base, win: 'punched' });
    else {                                            // long faces: storeys 2 to 5, and the walls of the two end cores below
      facade(G, E, { ...base, win: E.facing === 'N' ? 'bands' : 'punched', from: 1 });
      const westFirst = E.at(0, 0)[0] < E.at(E.L, 0)[0], u0 = westFirst ? core : E.L - core;
      strip(G.flat, E, 0, Math.min(u0, E.L - u0), 0, sh, WALL.white); strip(G.flat, E, Math.max(u0, E.L - u0), E.L, 0, sh, WALL.white);
    }
  }
  G.flat.face([[xa, 0, r.n], [xa, 0, r.s], [xa, sh, r.s], [xa, sh, r.n]], [1, 0, 0], WALL.white);          // inner faces of the cores
  G.flat.face([[xb, 0, r.n], [xb, 0, r.s], [xb, sh, r.s], [xb, sh, r.n]], [-1, 0, 0], WALL.white);
  G.flat.face([[xa, sh, r.n], [xb, sh, r.n], [xb, sh, r.s], [xa, sh, r.s]], [0, -1, 0], COPE);              // soffit
  const cols = new Soup(), half = Math.ceil((xb - xa) / bay / 2) + 1;
  for (let k = -half; k < half; k++) {                // column lines half a bay either side of the plaza axis, so the axis stays free
    const x = axisX + (k + 0.5) * bay;
    if (x < xa + 1 || x > xb - 1) continue;
    for (const z of [r.n + 0.3, r.s - 0.3]) { G.flat.box(x, z, 1, 0, 0.5, 0.5, 0, sh, WALL.white); cols.box(x, z, 1, 0, 0.5, 0.5, 0, sh, WALL.white); }
  }
  const sd = edges.find(E => E.facing === 'S'), dc = sd.at(sd.at(0, 0)[0] < sd.at(sd.L, 0)[0] ? core / 2 : sd.L - core / 2, 0, 0.05);
  G.glass.box(dc[0], dc[2], sd.ux, sd.uz, 1.8, 0.1, 0, 2.3, DOOR);                                           // door of the west core
  G.flat.face([[r.w, yRoof, r.n], [r.e, yRoof, r.n], [r.e, yRoof, strip0], [r.w, yRoof, strip0]], [0, 1, 0], roofColour(p));
  G.flat.face([[r.w, yRoof, strip0], [r.e, yRoof, strip0], [r.e, yRoof, r.s], [r.w, yRoof, r.s]], [0, 1, 0], DECK);
  parapet(G.flat, P, yRoof, h, COPE);
  // pergola: five framed panels over the south strip (always drawn), their slats only near the viewer
  const slats = new Soup(), np = 5, pb = (r.e - r.w - 1) / np, z0 = strip0 + 0.4, z1 = r.s - 0.5, yb = h - 0.05;
  for (let i = 0; i < np; i++) {
    const x0 = r.w + 0.5 + i * pb + 0.5, x1 = x0 + pb - 1.0, xm = (x0 + x1) / 2, zm = (z0 + z1) / 2;
    G.flat.box(xm, z0, 1, 0, x1 - x0, 0.22, yRoof, yb + 0.3, SLAT); G.flat.box(xm, z1, 1, 0, x1 - x0, 0.22, yRoof, yb + 0.3, SLAT);
    G.flat.box(x0, zm, 0, 1, z1 - z0, 0.22, yRoof, yb + 0.3, SLAT); G.flat.box(x1, zm, 0, 1, z1 - z0, 0.22, yRoof, yb + 0.3, SLAT);
    for (let x = x0 + 0.5; x < x1 - 0.2; x += 0.55) slats.box(x, zm, 0, 1, z1 - z0 - 0.2, 0.12, yb, yb + 0.22, SLAT, true);
  }
  const colliders = [prism(pts, sh, yRoof, null), prism([[r.w, r.n], [xa, r.n], [xa, r.s], [r.w, r.s]], 0, sh, null), prism([[xb, r.n], [r.e, r.n], [r.e, r.s], [xb, r.s]], 0, sh, null), cols.mesh(null)];
  return { slats, colliders };
}

let flatMat = null, glassMat = null;
export function build(ctx) {
  // One vertex-coloured material for all matt surfaces, one for all window glass ("glass" in the name: it glows at night).
  flatMat ??= Object.assign(new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.86, metalness: 0.02 }), { name: 'context-flat' });
  glassMat ??= Object.assign(new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.12, metalness: 0.35 }), { name: 'context-window-glass' });
  const groups = new Map();                           // one pair of meshes per group: core, south, north, west
  const soup = g => { if (!groups.has(g)) groups.set(g, { flat: new Soup(), glass: new Soup() }); return groups.get(g); };
  for (const b of DATA) {
    const G = soup(b.group);
    for (const p of b.parts) {
      const pts = outline(b, p, ctx.campus), kind = p.look.kind;
      if (kind === 'pavilion') {
        pavilion(G, p);
        ctx.collide(prism(circlePoints(p.cx, p.cz, p.drumRadiusM, 16), 0, p.height - 0.45, flatMat));
        ctx.collide(prism(circlePoints(p.cx, p.cz, p.radius, 20), p.height - 0.45, p.height, flatMat));
        continue;
      }
      if (kind === 'drum') drum(G, p);
      else if (kind === 'pergola-block') {
        const r = rectOf(pts), canopy = itemBox(ctx.campus, 'plaza-canopy');
        const out = pergolaBlock(G, pts, p, canopy ? (canopy.w + canopy.e) / 2 : (r.w + r.e) / 2), slats = out.slats.mesh(flatMat);
        if (slats) { slats.castShadow = !ctx.lowPower; ctx.add(slats); ctx.detail(slats, (r.w + r.e) / 2, (r.n + r.s) / 2, 160); }
        out.colliders.forEach(m => m && ctx.collide(m));
        continue;
      } else block(G, ordered(pts), p, ctx.lowPower);
      ctx.collide(prism(pts, 0, kind === 'shed' ? p.height : p.height - 0.6, flatMat));     // up to the roof plane, top face included
    }
  }
  for (const [name, G] of groups) {
    const a = G.flat.mesh(flatMat), g = G.glass.mesh(glassMat), casts = !ctx.lowPower || name === 'core' || name === 'south';   // phones: only the groups near the track cast shadows
    if (a) { a.name = 'context-' + name; a.castShadow = casts; a.receiveShadow = true; ctx.add(a); }
    // The glass casts shadows too: the walls are built from strips, so without it sunlight would pass through every window band.
    if (g) { g.name = 'context-' + name + '-glass'; g.castShadow = casts; g.receiveShadow = true; ctx.add(g); }
  }
  // Plain paving under the south group where the landscape module's survey window ends (z 150): schematic, see the header.
  const [w, e, n, s] = APRON; ctx.add(flat([[w, n], [e, n], [e, s], [w, s]], 0.015, mat('paving')));
}
