// Context buildings: everything around the modelled core that has no entry in campus-data.js, so that the campus does
// not end in empty lawn - the building group at the south end, the buildings north of the arc building, sheds west and
// south-west of the track - plus ONE block inside the core (the pergola-roofed block west of the clock tower).
// Since the "showpiece" pass they are finished buildings seen from outside (tiled, rendered and brick walls, windows
// with reveals, balconies, galleries, roofs with plant, entrances, aprons); the round pavilion can be entered, the
// pergola block's ground storey is a walkable undercroft, a few ground floors show a shallow furnished room behind
// glass. WHETHER ANY OF THESE BUILDINGS BELONGS TO THE SCHOOL IS NOT KNOWN: none carries a name, and every use given to
// one of them here is invented (see IMAGINED).
//
// The numbers in the DATA block below are a copy of "buildings" in data/context.json (which also records the pixel
// readings, the basis of every height, the confidence and what was left out). Both were written from the same roof
// outlines, read ONCE off gridded enlargements of the zoom-19 satellite mosaic (not in the repository); a roof pixel at
// height h was moved by (+0.243 h, -2.0 h) px to its ground position, as scripts/build-campus-data.mjs does. Both are
// written by scripts/make-context.py, which holds the readings: change them there and run
//   python3 -I scripts/make-context.py <repository> /path/to/campus_z19.jpg     (needs the mosaic and Pillow)
// A hand edit of data/context.json or of the DATA block is overwritten by the next run. Everything else in this file
// (finishes, uses, entrances: the function config() and what follows it) is written by hand and is not generated.
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
// ASSUMED (not shown by any reference)
//   - Every height that data/context.json marks ASSUMED (all north buildings, all sheds, the annex of the E-shaped
//     complex). The tall building's 75 m rests on one reading of a 150 px facade; +-10 m.
//   - Storey heights, bay widths, window sizes, sills, parapets (0.6 m) everywhere.
//   - Wall colours of every face not seen in the video: the E-shaped complex (cream), the north buildings (white, cream
//     or brick), sheds (grey). The tall building's reddish wall is the sunlit east face in the image; its other faces
//     and its white floor bands are extended from that face.
//   - core-pergola-block: five storeys; the north, south and west faces (white, punched windows; ribbon windows toward
//     the plaza); how far the fins and the glazing run on the east end; the pergola as five framed panels of slats level
//     with the parapet (the frame shows about five panels, their construction is not visible). Its outline is trimmed
//     to stay 0.3 m clear of the clock tower and the glass stair block and 0.5 m clear of the canopy edge.
//     THE GROUND STOREY IS DRAWN OPEN ON COLUMNS between two solid end cores, with the column lines set half a bay
//     either side of the canopy's axis: no reference shows the ground storey (trees hide it in frame 60). An open
//     ground storey is common in this climate and keeps the plaza reachable from the south, as it was before this
//     block was added; it may well be closed in reality.
//   - south-round-pavilion: drum radius (5.5 m), twelve columns on a 7.6 m ring, four glazed levels.
//   - south-court-complex: that the red-brown infill of the north face is the back of recessed balconies; all courtyard
//     faces, the east parts, the south bars; five storeys; the round tower's ribbon windows are continued all round.
//   - Skewed outlines are squared, the S-curved parapet of north-wavy-parapet-block is straight, light wells and roof
//     openings are left out (see "notModelled" in data/context.json).
//   - south-tall-building is the least certain entry: its 75 m come from the mosaic alone, and the 2018 frames that
//     look its way show open sky (built later, or misread). To drop it, remove its bld(...) entry in
//     scripts/make-context.py and regenerate.
//   - The ground under the south group beyond the landscape survey (z 150.5 to 246, x 20 to 215) is one plain paving
//     rectangle: the image shows paved yards and parking there, but neither extent nor surface was measured.
//
// IMAGINED (the owner asked for complete, believable buildings, "a work of art", and said that they need not be factual;
// nothing below is taken from a reference, and none of it says that a building belongs to the school)
//   - EVERY USE given to a building, and with it every word on a plate, sign or poster:
//       core-pergola-block    a tuck shop (sign 小卖部) behind glass in the west core, a lift lobby behind glass in the east
//                             core, a door numbered 1; upper storeys drawn as rooms in use (curtains, blinds, lit after dusk)
//       south-round-pavilion  a reading and exhibition room on the ground floor (plates 阅览室, 展厅 on a sign pylon; a
//                             store room door 储藏室 in the round core; posters 摄影作品, 书画作品, 科普知识, 阅读推荐)
//       south-low-link        a tuck shop front (小卖部) on the north face, a reading room front (阅览室) on the west face,
//                             a plant room door (配电房) at the back
//       south-court-complex   housing: balconies with washing and air-conditioners, access galleries toward the courts,
//                             a gateway with a plate 值班室
//       south-e-complex       teaching-style bars (windows on the north, open galleries on the south, glazed stair strips,
//                             doors numbered 2 and 3); the low annex as a dining hall (sign 食堂) with extract ducts
//       south-tall-building   flats (balconies, window cages, air-conditioners), a glazed lobby numbered 8
//       north-dark-roof-block a two-storey brick house with a duty room (值班室); north-wavy-parapet-block: offices with
//                             a glazed lobby numbered 5; north-east-pale-complex: a door numbered 6, a post room (收发室)
//       the two white sheds   workshops or garages with roller doors numbered 1 to 7
//       the low sheds         stores and plant rooms (器材室, 储藏室, 工具间, 配电房, 值班室, 水泵房, 卫生间)
//     None of these words names an institution; the notice boards under the pergola block are the stock ones of street.js.
//   - The fabric of every building at close range: tile, brick, render and ribbed sheet; the kinds of window (sliding
//     sashes with top lights, flat windows behind cages of bars, balcony doors, ribbons, curtain wall), their curtains,
//     blinds, open sashes, washing and plants; sills, reveals, air-conditioners with their lines, rainwater pipes and
//     hoppers, streaks under the copings; door sets, canopies, steps, roller shutters; aprons with kerbs, planters with
//     shrubs, two bicycle sheds, lamps; on the roofs stair heads, water tanks, ducts, vents, lightning rods. The
//     satellite image shows "small units" on the roofs of the courtyard complex: that they are solar water heaters is a guess.
//   - Three passages at ground level through the courtyard complex, so that nobody set down in a courtyard is shut in:
//     a gateway through the north bar (x 77.5 to 81), the link between the two courts open under its first floor, a
//     passage through the east end (z 107.4 to 110.4). The gateway's forecourt and its two lamps.
//   - The round pavilion as a place: a doorway two facets wide toward the track's south bend (225 to 255 degrees), two
//     glass leaves standing open, clear glass round the ground floor, the room (board floor, lit ceiling, a round core
//     with posters and a door, three exhibition boards, low book shelves along the glass, two tables with stools, a
//     desk), the paved platform and the path, column bases and caps, twelve lamps under the disc, benches, two garden lamps.
//   - The pergola block's undercroft: paving with granite margins, tiled columns on granite bases, beams, ceiling
//     lights, benches, two notice boards, a bicycle rack, bins; granite base and white floor bands of the east end.
//   - After dusk: which rooms are lit and in what colour (every window variant of the facade sheet is a room of its
//     own), the light in the rooms behind clear glass, the pools of light under the lamps.
//
// HOW IT IS BUILT
//   Walls are quads in a wall frame (Geo, on top of Batch), merged into one mesh per material and group (core, south,
//   north, west); plain colours are merged into vertex-coloured meshes. Windows are cards cut from ONE sheet drawn in
//   code (colour, emissive and roughness/metalness canvases with the same layout); a card stands 12 cm behind the wall
//   plane and carries the reveal in its margin, so the walls have depth at two triangles a window. Doors, shutters,
//   plates and posters are cards of a second sheet. Three tiers: always drawn (walls, windows, roofs, entrances, the
//   pavilion, the undercroft's structure), "mid" within about 190 m of a building (sills, air-conditioners, washing,
//   pipes, streaks, lamps, the pergola's slats), "near" within about 75 m (furniture, plates, what stands in the rooms).
//   ctx.lowPower: flush windows (no recess), half-size sheets, no pipes, streaks or roof units.
//
// Collision: one prism per part from the ground to its roof plane (roof included, so a player leaving drone mode above
// a building lands on it). Exceptions: the three parts of the courtyard complex with a passage (the storeys above the
// passage as one prism, the ground storey as the pieces beside it); the pergola block (upper storeys, its two end
// cores, its columns); the pavilion (a box per glazed facet of the ground storey with the doorway left open, the
// storeys above as one prism, the roof disc, a box per column, the core and the furniture inside). Benches, racks,
// boards, bins, planters and lamp posts are boxes. Roof plant, canopies, steps (at most 12 cm) and the rooms behind
// glass have no colliders. Everything built outside the outlines in FOOTPRINTS is reported with ctx.occupy.
//
// Cost, counted over the meshes of this module (index counts; scratch script shots/ctx2/count.mjs, 31 parts):
//   always drawn   45 draw calls and about 41,000 triangles in the main pass: for each of the four groups one mesh per
//                  textured material (17 in the south group, 13 north, 9 core, 5 west) including up to three
//                  vertex-coloured ones, and one paving quad. The meshes are drawn again into the shadow cascades
//                  (with lowPower only the core and south groups cast shadows).
//   mid tier       47 calls and about 21,700 triangles if every building were near at once (each building has its own)
//   near tier      97 calls and about 8,300 triangles likewise, and four instanced meshes of shrubs (1,800 triangles)
//   Before the showpiece pass the whole module was 9 calls and about 18,200 triangles.
//   Textures made here: the facade sheet (2048 x 1024, with a half-size emissive and a quarter-size roughness/metalness
//   copy), the print sheet (1024 x 1024), a 64 x 4 rib normal map, a 256 x 64 streak map; one brick and one pink tile
//   surface of hifi.js that no other module uses. Everything else is shared with the rest of the campus.
import { THREE, mat, flat, prism, circlePoints } from '../../kit.js';
import { CAMPUS } from '../../campus-data.js';
import { Batch } from '../../batch.js';
import { pbr, rng } from '../../hifi.js';
import { FURNITURE, LIT, bench, bins, noticeBoard, bikeRack, gardenLamp, planter } from '../../street.js';
import { shrubs } from '../../flora.js';
import { layered } from '../../shapes.js';

/* <context-data> copy of "buildings" in data/context.json (ground outlines in metres), written by scripts/make-context.py - do not edit by hand */
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

// ---------------------------------------------------------------- small helpers
const TAU = Math.PI * 2, ALLF = 'EWUDSN';
/** Faces of a Batch box to draw -> the string of faces to skip. In a wall frame: E/W = right/left, S = front (outward), N = back. */
const keep = faces => [...ALLF].filter(c => !faces.includes(c)).join('');
const css = (c, k = 1) => `rgb(${Math.min(255, c[0] * k) | 0},${Math.min(255, c[1] * k) | 0},${Math.min(255, c[2] * k) | 0})`;
const inPoly = (poly, x, z) => { let c = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const [x1, z1] = poly[i], [x2, z2] = poly[j]; if ((z1 > z) !== (z2 > z) && x < (x2 - x1) * (z - z1) / (z2 - z1) + x1) c = !c; } return c; };
/** Points in the order for which the outward normal of an edge with direction (dx, dz) is (dz, -dx). */
function ordered(pts) {
  let a = 0; for (let i = 0; i < pts.length; i++) { const p = pts[i], q = pts[(i + 1) % pts.length]; a += p[0] * q[1] - q[0] * p[1]; }
  return a >= 0 ? pts : [...pts].reverse();
}
/**
 * Frame of a wall: origin (ox, oz), s runs along (rx, rz) to the RIGHT of somebody looking at the wall from outside,
 * w runs outward. Geo.on(F) makes these the local x (s), y (up) and z (w) of the solids added next.
 */
function mkFrame(ox, oz, rx, rz, L) {
  const nx = -rz, nz = rx;
  return { o: [ox, oz], rx, rz, nx, nz, L, ang: Math.atan2(-rz, rx), facing: Math.abs(nx) > Math.abs(nz) ? (nx > 0 ? 'E' : 'W') : (nz > 0 ? 'S' : 'N'),
    at: (s, w = 0) => [ox + rx * s + nx * w, oz + rz * s + nz * w], sub: (a, b) => mkFrame(ox + rx * a, oz + rz * a, rx, rz, b - a) };
}
/** Frame of the edge p -> q of an ordered outline (origin q: the left end for a viewer outside). */
const frameOf = (p, q) => { const L = Math.hypot(p[0] - q[0], p[1] - q[1]) || 1e-6; return mkFrame(q[0], q[1], (p[0] - q[0]) / L, (p[1] - q[1]) / L, L); };
/** Stretches [a, b] of a wall that are not covered by another part of the same building. */
function exposed(F, others) {
  const cuts = [0, F.L];
  for (const poly of others) for (const [x, z] of poly) { const s = (x - F.o[0]) * F.rx + (z - F.o[1]) * F.rz; if (s > 0.05 && s < F.L - 0.05) cuts.push(s); }
  cuts.sort((a, b) => a - b); const out = [];
  for (let i = 0; i < cuts.length - 1; i++) {
    const a = cuts[i], b = cuts[i + 1]; if (b - a < 0.05) continue;
    const [x, z] = F.at((a + b) / 2, 0.06); if (others.some(poly => inPoly(poly, x, z))) continue;
    if (out.length && Math.abs(out[out.length - 1][1] - a) < 1e-6) out[out.length - 1][1] = b; else out.push([a, b]);
  }
  return out;
}
/** [a, b] minus a list of gaps [[g0, g1]...]. */
function minus(a, b, gaps) {
  const out = []; let at = a;
  for (const [g0, g1] of [...gaps].sort((p, q) => p[0] - q[0])) { if (g0 > at + 0.02) out.push([at, Math.min(g0, b)]); at = Math.max(at, g1); }
  if (b > at + 0.02) out.push([at, b]); return out;
}

// ---------------------------------------------------------------- geometry writer
/** Batch with quads in a wall frame (texture coordinates in metres, or a rectangle of a sheet). */
class Geo extends Batch {
  on(F, y = 0) { return this.frame(F.o[0], F.o[1], F.ang, y); }
  /** Quad from four local corners in loop order, facing the local normal n; uv: one pair per corner. */
  q4(m, a, b, c, d, n, uv) {
    const p = this._part(m), base = p.pos.length / 3, P = [a, b, c, d];
    const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2], vx = d[0] - a[0], vy = d[1] - a[1], vz = d[2] - a[2];
    const ccw = (uy * vz - uz * vy) * n[0] + (uz * vx - ux * vz) * n[1] + (ux * vy - uy * vx) * n[2] >= 0;
    for (let i = 0; i < 4; i++) this._vert(p, P[i][0], P[i][1], P[i][2], n[0], n[1], n[2], uv[i][0], uv[i][1]);
    ccw ? p.idx.push(base, base + 1, base + 2, base, base + 2, base + 3) : p.idx.push(base, base + 2, base + 1, base, base + 3, base + 2);
    return this;
  }
  /** Upright quad in the wall plane moved out by w, facing outward. t: [u0, v0, u1, v1] of a sheet (u0 at the left). */
  wall(m, s0, s1, y0, y1, w = 0, t) {
    if (s1 - s0 < 2e-3 || y1 - y0 < 2e-3) return this; t = t || [s0, y0, s1, y1];
    return this.q4(m, [s0, y0, w], [s1, y0, w], [s1, y1, w], [s0, y1, w], [0, 0, 1], [[t[0], t[1]], [t[2], t[1]], [t[2], t[3]], [t[0], t[3]]]);
  }
  /** The same, facing inward. */
  back(m, s0, s1, y0, y1, w = 0, t) {
    if (s1 - s0 < 2e-3 || y1 - y0 < 2e-3) return this; t = t || [s0, y0, s1, y1];
    return this.q4(m, [s0, y0, w], [s1, y0, w], [s1, y1, w], [s0, y1, w], [0, 0, -1], [[t[2], t[1]], [t[0], t[1]], [t[0], t[3]], [t[2], t[3]]]);
  }
  /** Upright quad across the wall at s, from w0 to w1, facing right (dir 1) or left (-1). */
  jamb(m, s, w0, w1, y0, y1, dir) { return this.q4(m, [s, y0, w0], [s, y0, w1], [s, y1, w1], [s, y1, w0], [dir, 0, 0], [[w0, y0], [w1, y0], [w1, y1], [w0, y1]]); }
  /** Level quad at height y, facing up (1) or down (-1). */
  level(m, s0, s1, w0, w1, y, up = 1) { return this.q4(m, [s0, y, w0], [s1, y, w0], [s1, y, w1], [s0, y, w1], [0, up, 0], [[s0, w0], [s1, w0], [s1, w1], [s0, w1]]); }
  /** Convex polygon [[x, z]...] in WORLD coordinates at height y. Resets the frame. */
  poly(m, pts, y, up = 1) {
    this.frame(); const p = this._part(m), base = p.pos.length / 3;
    for (const [x, z] of pts) this._vert(p, x, y, z, 0, up, 0, x, z);
    const a = pts[0], b = pts[1], c = pts[2], ny = (b[1] - a[1]) * (c[0] - a[0]) - (b[0] - a[0]) * (c[1] - a[1]), same = ny * up > 0;
    for (let i = 1; i < pts.length - 1; i++) same ? p.idx.push(base, base + i, base + i + 1) : p.idx.push(base, base + i + 1, base + i);
    return this;
  }
  /** Upright wall along an arc round (cx, cz), WORLD coordinates, angles from +x toward +z; dir 1 faces outward, -1 inward. t: sheet rectangle repeated per segment. */
  arc(m, cx, cz, r, y0, y1, a0, a1, seg, dir = 1, t) {
    this.frame(); const p = this._part(m);
    for (let i = 0; i < seg; i++) {
      const b0 = a0 + (a1 - a0) * i / seg, b1 = a0 + (a1 - a0) * (i + 1) / seg, base = p.pos.length / 3, u = t || [b0 * r, y0, b1 * r, y1];
      for (const [b, y, uu, vv] of [[b0, y0, u[0], u[1]], [b1, y0, u[2], u[1]], [b1, y1, u[2], u[3]], [b0, y1, u[0], u[3]]]) this._vert(p, cx + Math.cos(b) * r, y, cz + Math.sin(b) * r, Math.cos(b) * dir, 0, Math.sin(b) * dir, dir > 0 && t ? u[0] + u[2] - uu : uu, vv);
      dir > 0 ? p.idx.push(base, base + 2, base + 1, base, base + 3, base + 2) : p.idx.push(base, base + 1, base + 2, base, base + 2, base + 3);
    }
    return this;
  }
  /** Level ring sector round (cx, cz) between radii r0 and r1, WORLD coordinates. */
  ring(m, cx, cz, r0, r1, y, a0 = 0, a1 = TAU, seg = 32, up = 1) {
    this.frame(); const p = this._part(m);
    for (let i = 0; i < seg; i++) {
      const b0 = a0 + (a1 - a0) * i / seg, b1 = a0 + (a1 - a0) * (i + 1) / seg, base = p.pos.length / 3;
      for (const [b, r] of [[b0, r1], [b1, r1], [b1, r0], [b0, r0]]) { const x = cx + Math.cos(b) * r, z = cz + Math.sin(b) * r; this._vert(p, x, y, z, 0, up, 0, x, z); }
      up > 0 ? p.idx.push(base, base + 2, base + 1, base, base + 3, base + 2) : p.idx.push(base, base + 1, base + 2, base, base + 2, base + 3);
    }
    return this;
  }
  /** A window of the facade sheet in the opening a..b, ys..yh, set back by d (0: flush with the wall). Returns the card's extent along s. */
  pane(kind, i, a, b, ys, yh, d = 0) {
    if (!d) { this.wall(M.win, a, b, ys, yh, 0, cellUV(kind, i, true)); return [a, b]; }
    const [, , , mx, mt, mb] = CELLS[kind], ks = mx / (CELL - 2 * mx) * (b - a), kv = (yh - ys) / (CELL - mt - mb);
    this.wall(M.win, a - ks, b + ks, ys - mb * kv, yh + mt * kv, -d, cellUV(kind, i, false)); return [a - ks, b + ks];
  }
}
/** The three tiers of a building: a always drawn, m shown within about 200 m, n shown nearby. */
class Tiers {
  constructor(a) { this.a = a; this.m = new Geo(); this.n = new Geo(); }
  on(F, y = 0) { this.a.on(F, y); this.m.on(F, y); this.n.on(F, y); return this; }
}

// Draw-call saver (as in slab-wide.js): all plain-coloured parts of a group become one mesh per finish with vertex colours.
const flatMats = {};
function mergeFlat(group, castShadow) {
  const buckets = {};
  for (const m of group.children) if (m.isMesh && m.material.userData.flat) (buckets[m.material.userData.flat] ||= []).push(m);
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
    if (!flatMats[key]) { const [roughness, metalness] = { matte: [0.86, 0], gloss: [0.42, 0.02], metal: [0.38, 0.72] }[key]; flatMats[key] = new THREE.MeshStandardMaterial({ vertexColors: true, roughness, metalness }); flatMats[key].name = 'context-flat-' + key; }
    const mesh = new THREE.Mesh(g, flatMats[key]); mesh.castShadow = castShadow; mesh.receiveShadow = true; group.add(mesh);
  }
  return group;
}
const paints = new Map();
/** Plain colour (merged into the vertex-coloured meshes above). */
function paint(hex, rough = 0.85, metal = 0) {
  const key = hex + '/' + rough + '/' + metal;
  if (!paints.has(key)) { const m = new THREE.MeshStandardMaterial({ color: hex, roughness: rough, metalness: metal }); m.name = 'context-flat'; m.userData.flat = metal >= 0.5 ? 'metal' : rough < 0.5 ? 'gloss' : 'matte'; paints.set(key, m); }
  return paints.get(key);
}

// ---------------------------------------------------------------- the facade sheet: every kind of window, drawn in code
// Three canvases with the same layout: colours by day, the light a window gives off after dusk (emissive map: every
// variant is a room of its own, lit warm, cool, dimly, by a screen, or dark), and roughness / metalness (glass mirrors,
// frames and reveals do not). A cell holds the window and, round it, the reveal of the wall: the card stands a little
// behind the wall plane, so the wall has depth without one extra triangle.
const CELL = 256, SHEET_W = 2048, SHEET_H = 1024;
/** Cells of the sheet: [row, first column, variants, side margin, top margin, bottom margin] in pixels. */
const CELLS = { slide: [0, 0, 8, 16, 16, 16], home: [1, 0, 8, 16, 16, 16], door: [2, 0, 4, 16, 16, 0], gbay: [2, 4, 4, 0, 0, 0], band: [3, 0, 4, 0, 16, 16], stair: [3, 4, 1, 0, 0, 0], cw: [3, 5, 2, 0, 0, 0], high: [3, 7, 1, 0, 16, 16] };
function cellUV(kind, i, inner) {
  const [row, c0, n, mx, mt, mb] = CELLS[kind], col = c0 + (((i % n) + n) % n), e = 0.7;
  const x0 = col * CELL + (inner ? mx : 0) + e, x1 = (col + 1) * CELL - (inner ? mx : 0) - e, y0 = row * CELL + (inner ? mt : 0) + e, y1 = (row + 1) * CELL - (inner ? mb : 0) - e;
  return [x0 / SHEET_W, 1 - y1 / SHEET_H, x1 / SHEET_W, 1 - y0 / SHEET_H];
}
const CLOTH = [[228, 214, 180], [126, 152, 190], [134, 172, 142], [214, 160, 158], [226, 200, 124], [238, 238, 230], [176, 150, 120], [150, 120, 160]];
const LIGHTS = [null, [255, 206, 140], [204, 218, 244], [150, 116, 66], [84, 110, 176]];      // unlit, warm, cool white, dim, the blue of a screen
const REVEAL = [200, 198, 190], REVEAL_HEX = 0xc8c6be, BAR = [176, 178, 182];
const VAR = {
  slide: [{ lit: 1 }, { lit: 1, c: 0, a: 0.42 }, { lit: 0, c: 1, a: 0.3, b: 0.3 }, { lit: 2, blind: 0.45 }, { lit: 0, open: 0.6 }, { lit: 1, c: 2, a: 1 }, { lit: 2, open: 0.35, c: 5, b: 0.3 }, { lit: 0, blind: 1 }],
  home: [{ lit: 1, c: 3, a: 1 }, { lit: 0 }, { lit: 1, c: 4, a: 0.5, wash: 1 }, { lit: 4, c: 5, a: 1 }, { lit: 0, c: 1, a: 1 }, { lit: 1, plant: 1 }, { lit: 0, open: 0.5, wash: 1 }, { lit: 3, c: 2, a: 0.5, plant: 1 }],
  door: [{ lit: 1, c: 0, a: 0.5 }, { lit: 0 }, { lit: 1, open: 0.5 }, { lit: 4, c: 5, a: 1 }],
  gbay: [{ lit: 1, door: [150, 104, 62] }, { lit: 0, door: [150, 104, 62], c: 0 }, { lit: 2, door: [110, 134, 124] }, { lit: 0, door: [110, 134, 124], c: 1 }],
  band: [{ lit: 2, blind: 0.3 }, { lit: 2 }, { lit: 0 }, { lit: 1, blind: 0.6 }],
  stair: [{ lit: 3 }], cw: [{ lit: 2 }, { lit: 0 }], high: [{ lit: 3 }],
};
/** Drawing tools for one cell on one of the three canvases. */
function pen(g, mode, lit) {
  const L = LIGHTS[lit], fill = (s, x, y, w, h) => { g.fillStyle = s; g.fillRect(x, y, w, h); };
  return {
    g, mode, L,
    /** Wall, frame, bar, door leaf: matt, unlit. */
    solid(c, x, y, w, h, metal) { fill(mode === 'day' ? css(c) : mode === 'night' ? '#000' : metal ? 'rgb(0,96,130)' : 'rgb(0,214,0)', x, y, w, h); },
    /** A wall under lamps (the back of a gallery): matt, dimly lit after dusk. */
    lamplit(c, x, y, w, h, k = 0.3) { fill(mode === 'day' ? css(c) : mode === 'night' ? css(c, k) : 'rgb(0,214,0)', x, y, w, h); },
    glass(x, y, w, h, tint = [118, 146, 166]) {
      if (mode === 'rm') return fill('rgb(0,14,165)', x, y, w, h);
      const gr = g.createLinearGradient(0, y, 0, y + h);
      if (mode === 'day') { gr.addColorStop(0, css(tint, 1.5)); gr.addColorStop(0.5, css(tint, 1.0)); gr.addColorStop(1, css(tint, 0.5)); }
      else if (L) { gr.addColorStop(0, css(L, 0.9)); gr.addColorStop(1, css(L, 0.5)); }
      else { gr.addColorStop(0, '#0b0e13'); gr.addColorStop(1, '#040507'); }
      fill(gr, x, y, w, h);
      if (mode === 'night' && L && lit < 3 && h > 90) { fill('#ffffff', x + w * 0.16, y + h * 0.1, w * 0.26, 4); fill('#ffffff', x + w * 0.6, y + h * 0.1, w * 0.26, 4); fill('rgba(0,0,0,0.38)', x + w * 0.08, y + h * 0.72, w * 0.34, h * 0.28); }
    },
    /** Opaque coloured glass of a curtain wall's spandrel. */
    spandrel(c, x, y, w, h) { fill(mode === 'day' ? css(c) : mode === 'night' ? '#020403' : 'rgb(0,30,140)', x, y, w, h); },
    cloth(c, x, y, w, h) {
      if (mode === 'rm') return fill('rgb(0,66,70)', x, y, w, h);
      fill(mode === 'day' ? css([c[0] * 0.8 + 16, c[1] * 0.8 + 22, c[2] * 0.8 + 26]) : L ? css([c[0] * L[0] / 255, c[1] * L[1] / 255, c[2] * L[2] / 255], 0.92) : '#07080b', x, y, w, h);
      for (let fx = x + 5; fx < x + w - 2; fx += 13) fill(mode === 'day' ? 'rgba(0,0,0,0.11)' : 'rgba(0,0,0,0.2)', fx, y, 3, h);
    },
    blind(x, y, w, h) {
      if (mode === 'rm') return fill('rgb(0,90,40)', x, y, w, h);
      fill(mode === 'day' ? '#d2d0c6' : L ? css(L, 0.8) : '#090a0c', x, y, w, h);
      for (let fy = y + 4; fy < y + h; fy += 7) fill('rgba(0,0,0,0.16)', x, fy, w, 2);
    },
    /** What shows where a sash is slid open: the room itself. */
    room(x, y, w, h) { fill(mode === 'day' ? '#161a1e' : mode === 'night' ? (L ? css(L, 0.9) : '#030405') : 'rgb(0,225,0)', x, y, w, h); },
  };
}
function reveal(P, top = 16, bottom = 16) {
  P.solid(REVEAL, 0, 0, CELL, CELL);
  if (top) P.solid([150, 148, 142], 0, 0, CELL, top);                        // the soffit of the opening lies in shade
  if (bottom) P.solid([226, 224, 216], 0, CELL - bottom, CELL, bottom);      // the sill catches the light
}
function paintCell(g, mode, kind, v) {
  const V = VAR[kind][v], P = pen(g, mode, V.lit), x = 16, y = 16, w = 224;
  if (kind === 'slide' || kind === 'home') {
    const home = kind === 'home', fr = home ? [104, 96, 86] : [234, 234, 230], h = 224, yt = home ? y : y + 60, t = 7, ox = V.open ? w / 2 * V.open : 0;
    reveal(P); P.glass(x, y, w, h, home ? [104, 128, 140] : [118, 146, 166]);
    if (V.c !== undefined) { if (V.a) P.cloth(CLOTH[V.c], x, y, w * V.a, h); if (V.b) P.cloth(CLOTH[V.c], x + w * (1 - V.b), y, w * V.b, h); }
    if (V.blind) P.blind(x, y, w, h * V.blind);
    if (ox) P.room(x + w - ox, yt, ox, y + h - yt);
    P.solid(fr, x, y, w, t); P.solid(fr, x, y + h - t, w, t); P.solid(fr, x, y, t, h); P.solid(fr, x + w - t, y, t, h);
    if (!home) { P.solid(fr, x, yt - 3, w, 6); P.solid(fr, x + w / 2 - 2, y, 4, yt - y); }
    for (const sx of [x + t, x + w / 2 - ox]) { const sw = w / 2 - t; P.solid(fr, sx, yt, 5, y + h - yt); P.solid(fr, sx + sw - 5, yt, 5, y + h - yt); P.solid(fr, sx, yt + 3, sw, 4); P.solid(fr, sx, y + h - t - 4, sw, 4); }
    if (home) {                                                             // the cage of bars every flat window here has, and what is kept in it
      if (V.wash) [[216, 90, 80], [240, 240, 236], [70, 110, 170], [230, 200, 90]].forEach((c, i) => P.solid(c, x + 18 + i * 50, y + 12, 36, 50 + (i % 2) * 14));
      if (V.plant) for (let i = 0; i < 3; i++) { P.solid([62, 112, 56], x + 22 + i * 66, y + h - 52, 40, 30); P.solid([150, 84, 60], x + 30 + i * 66, y + h - 24, 24, 16); }
      for (let i = 1; i < 10; i++) P.solid(BAR, x + i * w / 10 - 1, y, 2, h, true);
      for (const f of [0.02, 0.36, 0.7, 0.96]) P.solid(BAR, x, y + h * f, w, 3, true);
    }
  } else if (kind === 'door') {                                             // balcony door: two sliding leaves
    const fr = [228, 228, 224], h = 240, ox = V.open ? w / 2 * V.open : 0;
    reveal(P, 16, 0); P.glass(x, y, w, h, [100, 126, 140]);
    if (V.c !== undefined) P.cloth(CLOTH[V.c], x, y, w * V.a, h);
    if (ox) P.room(x + w - ox, y, ox, h);
    P.solid(fr, x, y, w, 7); P.solid(fr, x, y, 7, h); P.solid(fr, x + w - 7, y, 7, h); P.solid(fr, x, y + h - 9, w, 9);
    for (const sx of [x + 7, x + w / 2 - ox]) { const sw = w / 2 - 7; P.solid(fr, sx, y, 6, h); P.solid(fr, sx + sw - 6, y, 6, h); P.solid(fr, sx, y + h * 0.62, sw, 5); }
  } else if (kind === 'gbay') {                                             // one bay of a gallery's back wall: door with a fanlight, window, dado
    P.lamplit([232, 226, 208], 0, 0, CELL, CELL, 0.36); P.lamplit([150, 176, 160], 0, 169, CELL, 87, 0.3); P.lamplit([88, 92, 90], 0, 246, CELL, 10, 0.2);
    P.lamplit([96, 70, 44], 22, 40, 86, 216, 0.25); P.glass(27, 45, 76, 24); P.lamplit(V.door, 27, 74, 76, 182, 0.3); P.lamplit([40, 44, 48], 90, 168, 6, 14, 0.2); P.lamplit([40, 90, 160], 112, 86, 12, 30, 0.4);
    P.glass(132, 61, 104, 113); if (V.c !== undefined) P.cloth(CLOTH[V.c], 132, 61, 104, 113);
    for (const [fx, fy, fw, fh] of [[128, 57, 112, 5], [128, 172, 112, 6], [128, 57, 5, 121], [235, 57, 5, 121], [182, 57, 4, 121]]) P.lamplit([226, 228, 224], fx, fy, fw, fh, 0.3);
  } else if (kind === 'band') {                                             // a length of ribbon window: two panes, repeats sideways
    P.solid([150, 148, 142], 0, 0, CELL, 16); P.solid([226, 224, 216], 0, 240, CELL, 16); P.glass(0, 16, CELL, 224, [96, 138, 176]);
    if (V.blind) { P.blind(4, 16, 120, 224 * V.blind); P.blind(132, 16, 120, 224 * V.blind); }
    const fr = [226, 228, 226]; P.solid(fr, 0, 16, CELL, 6); P.solid(fr, 0, 233, CELL, 7); P.solid(fr, 0, 16, 3, 224); P.solid(fr, 125, 16, 6, 224); P.solid(fr, 253, 16, 3, 224); P.solid(fr, 0, 78, CELL, 5);
  } else if (kind === 'stair') {                                            // glazed stair strip: repeats upward; the flights show through
    P.glass(0, 0, CELL, CELL, [84, 150, 150]);
    if (mode !== 'rm') { g.fillStyle = mode === 'day' ? 'rgba(18,36,40,0.4)' : 'rgba(0,0,0,0.55)'; g.beginPath(); g.moveTo(0, 150); g.lineTo(CELL, 40); g.lineTo(CELL, 76); g.lineTo(0, 186); g.closePath(); g.fill(); g.fillRect(0, 236, CELL, 20); }
    const fr = [232, 234, 230]; for (const fx of [0, 125, 252]) P.solid(fr, fx, 0, fx === 125 ? 6 : 4, CELL); for (const fy of [0, 84, 168, 251]) P.solid(fr, 0, fy, CELL, 5);
  } else if (kind === 'cw') {                                               // green curtain wall: vision glass over an opaque spandrel
    P.glass(0, 0, CELL, 180, [86, 146, 120]); P.spandrel([44, 92, 74], 0, 180, CELL, 76);
    const fr = [222, 226, 222]; for (const fx of [0, 125, 252]) P.solid(fr, fx, 0, fx === 125 ? 6 : 4, CELL); for (const fy of [0, 177, 251]) P.solid(fr, 0, fy, CELL, 5);
  } else {                                                                  // 'high': wired-glass lights under the eaves of a shed
    P.solid([150, 148, 142], 0, 0, CELL, 16); P.solid([226, 224, 216], 0, 240, CELL, 16); P.glass(0, 16, CELL, 224, [150, 162, 160]);
    const fr = [92, 98, 100]; for (const fx of [0, 83, 168, 251]) P.solid(fr, fx, 16, 5, 224); P.solid(fr, 0, 16, CELL, 6); P.solid(fr, 0, 234, CELL, 6); P.solid(fr, 0, 126, CELL, 4);
  }
}
function sheetTexture(mode, scale, srgb) {
  const c = document.createElement('canvas'); c.width = SHEET_W * scale; c.height = SHEET_H * scale; const g = c.getContext('2d');
  g.fillStyle = mode === 'day' ? css(REVEAL) : mode === 'night' ? '#000' : 'rgb(0,214,0)'; g.fillRect(0, 0, c.width, c.height); g.scale(scale, scale);
  for (const kind of Object.keys(CELLS)) { const [row, c0, n] = CELLS[kind]; for (let v = 0; v < n; v++) { g.save(); g.translate((c0 + v) * CELL, row * CELL); g.beginPath(); g.rect(0, 0, CELL, CELL); g.clip(); paintCell(g, mode, kind, v); g.restore(); } }
  const t = new THREE.CanvasTexture(c); if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}

// ---------------------------------------------------------------- the print sheet: doors, shutters, plates, machines
const FONT = '"PingFang SC","Microsoft YaHei","Noto Sans CJK SC","Source Han Sans SC","WenQuanYi Zen Hei",sans-serif';
class Atlas {
  constructor(size) { this.S = size; this.k = size / 1024; this.c = document.createElement('canvas'); this.c.width = this.c.height = size; this.g = this.c.getContext('2d'); this.g.fillStyle = '#8a8a84'; this.g.fillRect(0, 0, size, size); this.x = 0; this.y = 0; this.row = 0; this.uv = {}; }
  /** Reserve w by h nominal pixels, draw with the top left corner as origin, keep the rectangle under `key`. */
  put(key, w, h, draw) {
    const pw = Math.round(w * this.k), ph = Math.round(h * this.k), g = this.g, S = this.S, P = 3;
    if (this.x + pw > S) { this.x = 0; this.y += this.row + P; this.row = 0; }
    if (this.y + ph > S) { console.warn('context.js: print sheet full, dropped', key); return (this.uv[key] = [0.001, 0.001, 0.003, 0.003]); }
    g.save(); g.translate(this.x, this.y); g.beginPath(); g.rect(0, 0, pw, ph); g.clip(); g.scale(pw / w, ph / h); draw(g, w, h); g.restore();
    this.uv[key] = [(this.x + 0.6) / S, 1 - (this.y + ph - 0.6) / S, (this.x + pw - 0.6) / S, 1 - (this.y + 0.6) / S];
    this.x += pw + P; this.row = Math.max(this.row, ph); return this.uv[key];
  }
}
const rect = (g, c, x, y, w, h) => { g.fillStyle = Array.isArray(c) ? css(c) : c; g.fillRect(x, y, w, h); };
const text = (g, s, x, y, px, col, align = 'center', weight = 'bold') => { g.font = `${weight} ${px}px ${FONT}`; g.textAlign = align; g.textBaseline = 'middle'; g.fillStyle = col; g.fillText(s, x, y); };
/** Every word on these plates is invented and deliberately neutral: room uses and numbers, never a name. */
const PLATES = ['值班室', '配电房', '水泵房', '工具间', '器材室', '储藏室', '卫生间', '小卖部', '阅览室', '展厅', '车棚', '收发室', '食堂', '消防控制室'];
const POSTERS = [['摄影作品', '#1f6fb5'], ['书画作品', '#b3261e'], ['科普知识', '#0f7a6a'], ['阅读推荐', '#b8860b']];
function printSheet(low) {
  const A = new Atlas(low ? 512 : 1024);
  A.put('doorGlass', 288, 300, (g, W, H) => {                               // aluminium double door with side lights: 2.4 by 2.5 m
    rect(g, [188, 192, 194], 0, 0, W, H); const gl = g.createLinearGradient(0, 0, 0, H); gl.addColorStop(0, '#7f97a6'); gl.addColorStop(0.5, '#4a5c68'); gl.addColorStop(1, '#27323a');
    for (const [x, w] of [[8, 52], [68, 72], [148, 72], [228, 52]]) { rect(g, gl, x, 46, w, H - 54); rect(g, gl, x, 8, w, 30); }
    rect(g, [150, 154, 158], 132, 150, 5, 70); rect(g, [150, 154, 158], 151, 150, 5, 70); rect(g, [120, 124, 128], 68, H - 26, 152, 18);
  });
  A.put('doorSteel', 144, 252, (g, W, H) => {                               // steel door of a plant room: 1.2 by 2.1 m
    rect(g, [96, 116, 108], 0, 0, W, H); rect(g, [84, 102, 96], 6, 6, W / 2 - 8, H - 12); rect(g, [84, 102, 96], W / 2 + 2, 6, W / 2 - 8, H - 12);
    for (let y = 190; y < 236; y += 7) { rect(g, [60, 74, 70], 14, y, W / 2 - 24, 3); rect(g, [60, 74, 70], W / 2 + 10, y, W / 2 - 24, 3); }
    rect(g, [200, 200, 196], W / 2 + 8, 120, 6, 22);
  });
  A.put('doorTimber', 108, 252, (g, W, H) => {                              // painted timber door: 0.9 by 2.1 m
    rect(g, [122, 84, 52], 0, 0, W, H); rect(g, [142, 100, 62], 6, 6, W - 12, H - 12); rect(g, [126, 88, 54], 16, 18, W - 32, 96); rect(g, [126, 88, 54], 16, 130, W - 32, 104); rect(g, [210, 206, 190], W - 18, 124, 7, 20);
  });
  A.put('roller', 256, 256, (g, W, H) => {                                  // roller shutter
    rect(g, [176, 180, 184], 0, 0, W, H); for (let y = 0; y < H; y += 8) { rect(g, [196, 200, 204], 0, y, W, 4); rect(g, [150, 154, 158], 0, y + 7, W, 1); }
    rect(g, [120, 124, 128], 0, H - 12, W, 12); rect(g, [90, 94, 98], W / 2 - 14, H - 26, 28, 10);
  });
  A.put('ac', 128, 88, (g, W, H) => {                                       // outdoor unit of an air-conditioner
    rect(g, [236, 236, 230], 0, 0, W, H); g.fillStyle = '#3a3f44'; g.beginPath(); g.arc(46, H / 2, 34, 0, TAU); g.fill();
    g.strokeStyle = '#c9cbc8'; g.lineWidth = 2; for (let r = 6; r < 34; r += 6) { g.beginPath(); g.arc(46, H / 2, r, 0, TAU); g.stroke(); }
    g.beginPath(); g.moveTo(12, H / 2); g.lineTo(80, H / 2); g.moveTo(46, 10); g.lineTo(46, H - 10); g.stroke();
    for (let y = 16; y < H - 12; y += 7) rect(g, [190, 192, 188], 92, y, 28, 3);
  });
  PLATES.forEach(s => A.put('p:' + s, 40 + 44 * [...s].length, 64, (g, W, H) => { rect(g, '#e9e9e4', 0, 0, W, H); rect(g, '#1d4f9c', 3, 3, W - 6, H - 6); text(g, s, W / 2, H / 2 + 2, 38, '#ffffff'); }));
  for (let i = 1; i <= 8; i++) A.put('n:' + i, 72, 72, (g, W, H) => { rect(g, '#f2f1ea', 0, 0, W, H); g.fillStyle = '#b3261e'; g.beginPath(); g.arc(W / 2, H / 2, 31, 0, TAU); g.fill(); text(g, String(i), W / 2, H / 2 + 3, 44, '#ffffff'); });
  const r = rng(977);
  A.put('shelves', 360, 200, (g, W, H) => {                                 // shop shelves full of goods
    rect(g, [226, 220, 204], 0, 0, W, H);
    for (let row = 0; row < 5; row++) { const y = 6 + row * 39; rect(g, [120, 92, 60], 0, y + 33, W, 5); for (let x = 4; x < W - 10;) { const w = 7 + r() * 12, h = 14 + r() * 18; rect(g, 'hsl(' + Math.floor(r() * 360) + ',' + (45 + r() * 40) + '%,' + (38 + r() * 34) + '%)', x, y + 33 - h, w, h); x += w + 1 + (r() < 0.12 ? 8 : 0); } }
  });
  A.put('fridge', 66, 176, (g, W, H) => {                                   // glass-fronted drinks cabinet
    rect(g, [38, 42, 48], 0, 0, W, H); rect(g, [210, 232, 244], 4, 4, W - 8, 16); rect(g, [150, 176, 190], 5, 24, W - 10, H - 40);
    for (let row = 0; row < 5; row++) for (let x = 8; x < W - 12; x += 8) rect(g, 'hsl(' + Math.floor(r() * 360) + ',70%,50%)', x, 30 + row * 27, 6, 20);
  });
  A.put('lift', 260, 225, (g, W, H) => {                                    // two lift doors in a stone wall
    rect(g, [206, 200, 188], 0, 0, W, H);
    for (const x of [22, 148]) { rect(g, [96, 100, 104], x - 5, 12, 100, H - 12); rect(g, [176, 180, 184], x, 18, 44, H - 18); rect(g, [168, 172, 176], x + 46, 18, 44, H - 18); rect(g, [24, 24, 26], x + 30, 2, 30, 9); rect(g, '#e03020', x + 42, 4, 5, 5); }
    rect(g, [60, 62, 66], 124, 96, 12, 30); rect(g, '#e8c040', 127, 102, 6, 6);
  });
  A.put('books', 240, 98, (g, W, H) => {                                    // two shelves of book spines
    rect(g, [150, 112, 70], 0, 0, W, H);
    for (const y of [4, 52]) { rect(g, [70, 52, 36], 3, y, W - 6, 42); for (let x = 5; x < W - 8;) { const w = 4 + r() * 6, h = 30 + r() * 10; rect(g, 'hsl(' + Math.floor(r() * 360) + ',' + (30 + r() * 40) + '%,' + (35 + r() * 35) + '%)', x, y + 42 - h, w, h); x += w + 0.6; } }
  });
  POSTERS.forEach(([title, colour], k) => A.put('poster' + k, 100, 150, (g, W, H) => {   // exhibition sheet: a heading, pictures, lines of text
    rect(g, '#f6f3ea', 0, 0, W, H); rect(g, colour, 0, 0, W, 24); text(g, title, W / 2, 13, 15, '#ffffff');
    for (let i = 0; i < 4; i++) { const x = 8 + (i % 2) * 44, y = 32 + Math.floor(i / 2) * 44, gr = g.createLinearGradient(x, y, x, y + 36), hue = Math.floor(r() * 360); gr.addColorStop(0, 'hsl(' + hue + ',35%,72%)'); gr.addColorStop(1, 'hsl(' + (hue + 40) % 360 + ',30%,40%)'); rect(g, gr, x, y, 40, 36); }
    for (let y = 124; y < 146; y += 6) rect(g, '#8b8880', 8, y, 60 + r() * 24, 2.5);
  }));
  const t = new THREE.CanvasTexture(A.c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  return { texture: t, uv: A.uv };
}
/** Corrugated sheet: a small normal map of ribs, 0.8 m per repeat. */
let ribs = null;
function ribbed(hex, name, rough = 0.55, metal = 0.25) {
  if (!ribs) {
    const S = 64, c = document.createElement('canvas'); c.width = S; c.height = 4; const g = c.getContext('2d');
    for (let x = 0; x < S; x++) { const a = x / S * TAU * 4; g.fillStyle = `rgb(${Math.round(128 - 96 * Math.cos(a))},128,${Math.round(255 * Math.sqrt(1 - 0.57 * Math.cos(a) ** 2))})`; g.fillRect(x, 0, 1, 4); }
    ribs = new THREE.CanvasTexture(c); ribs.wrapS = ribs.wrapT = THREE.RepeatWrapping; ribs.repeat.set(1 / 0.8, 1); ribs.anisotropy = 8;
  }
  const m = new THREE.MeshStandardMaterial({ color: hex, normalMap: ribs, roughness: rough, metalness: metal }); m.name = name; return m;
}
/** Weathering: grey streaks that hang down from the top edge of a card (2.4 m per repeat). */
function streaks() {
  const W = 256, H = 64, c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d'), r = rng(31);
  for (let i = 0; i < 70; i++) { const x = r() * W, w = 1 + r() * 5, len = H * (0.25 + 0.75 * r()), gr = g.createLinearGradient(0, 0, 0, len); gr.addColorStop(0, `rgba(70,66,58,${0.06 + 0.17 * r()})`); gr.addColorStop(1, 'rgba(70,66,58,0)'); g.fillStyle = gr; g.fillRect(x, 0, w, len); if (x + w > W) g.fillRect(x - W, 0, w, len); }
  const t = new THREE.CanvasTexture(c); t.wrapS = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace;
  const m = new THREE.MeshStandardMaterial({ map: t, transparent: true, depthWrite: false, roughness: 1, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -4 }); m.name = 'context-streaks'; return m;
}

// ---------------------------------------------------------------- materials (shared by all buildings of this module)
const M = {}, ROOM = [];                             // ROOM: [material, emissive intensity by day, gain after dusk]
let PR = null, R = Math.random;
const lit = (m, name, base, gain) => { if (name) m.name = name; m.userData.glow = false; ROOM.push([m, base, gain]); return m; };
function materials(low) {
  if (M.win) return;
  const day = sheetTexture('day', low ? 0.5 : 1, true), night = sheetTexture('night', low ? 0.25 : 0.5, true), rm = sheetTexture('rm', 0.25, false);
  // Not named "window" or "glass": this sheet brings its own light after dusk (the emissive map), room by room.
  M.win = new THREE.MeshStandardMaterial({ map: day, emissiveMap: night, emissive: 0xffffff, emissiveIntensity: 0, roughnessMap: rm, metalnessMap: rm, roughness: 1, metalness: 1, envMapIntensity: 1.25 });
  M.win.name = 'context-facade-sheet'; M.win.userData.noGrain = true; M.win.userData.glow = false;
  PR = printSheet(low);
  M.prints = new THREE.MeshStandardMaterial({ map: PR.texture, roughness: 0.6, metalness: 0.05 }); M.prints.name = 'context-prints';
  Object.assign(M, {
    white: mat('wallWhite'), cream: mat('wallCream'), redBrown: pbr('brick', [0x8a4436]), pinkBrown: pbr('tiles', [0xb98a74, 6, 0.6, 0.5]), grey: paint(0xb8b5ac, 0.9),
    render: paint(0xefede5, 0.9), frame: paint(0xf1f0ea, 0.8), cope: paint(0xe2dfd5, 0.85), reveal: paint(REVEAL_HEX, 0.9), sill: paint(0xe9e7df, 0.7), floor: paint(0x9a968c, 0.9), ceil: paint(0xdedbd0, 0.9),
    concrete: mat('concrete'), granite: pbr('granitePolished', [0x6f6a66, 9]), paving: mat('paving'), steel: paint(0xb9bec2, 0.4, 0.7), dark: paint(0x2b2d30, 0.6), unit: paint(0xd8d8d2, 0.7),
    wood: mat('wood'), glassClear: mat('glassClear'), lamp: FURNITURE.lamp(), alu: paint(0xc8ccd0, 0.38, 0.7), solar: paint(0x2a3b55, 0.4), grate: paint(0x4a4d50, 0.5, 0.6),
    // rooms seen through clear glass: their surfaces carry their own light after dusk
    roomWall: lit(new THREE.MeshStandardMaterial({ color: 0xf1ecdd, roughness: 0.9, emissive: 0xf1ecdd, emissiveIntensity: 0.03 }), 'context-room-wall', 0.03, 0.42),
    roomCeil: lit(new THREE.MeshStandardMaterial({ color: 0xf7f5ef, roughness: 0.92, emissive: 0xf7f5ef, emissiveIntensity: 0.05 }), 'context-room-ceiling', 0.05, 0.55),
    roomFloor: lit(pbr('boards', [0xc9a878, 1.2], { emissive: 0xffffff, emissiveIntensity: 0 }), null, 0, 0.3),
    printsLit: lit(new THREE.MeshStandardMaterial({ map: PR.texture, emissiveMap: PR.texture, emissive: 0xffffff, emissiveIntensity: 0, roughness: 0.6 }), 'context-prints-lit', 0, 0.55),
    tin: ribbed(0xdfe2e2, 'context-ribbed-sheet'), tinRoof: ribbed(0xeceee9, 'context-ribbed-roof'), 
    pipe: paint(0xe4e2da, 0.6), stain: streaks(), deck: paint(0x5c5a55, 0.95), slat: paint(0xf2f2ee, 0.7),
  });
  M.roomFloor.emissiveMap = M.roomFloor.map;
  M.ground = layered(pbr('paving', [0xb9b3a7, 0x9c968c, 4, 8, [2.4, 2.4], 11, true]), -3);   // paving this module lays over the grounds' own layers (the slab-wide surface, with a depth offset)
}

const WASH = [0xd85a50, 0xf0f0ec, 0x466eaa, 0xe6c85a, 0x5a9a6a, 0x8a6aa8, 0x30343a, 0xe89ab0];
/** Outdoor unit of an air-conditioner on a bracket, its line going up the wall; in the current wall frame of G. */
function acUnit(G, s, y) {
  G.box(M.unit, s, y + 0.27, 0.2, 0.8, 0.54, 0.3, keep('SEWUD')).wall(M.prints, s - 0.4, s + 0.4, y, y + 0.54, 0.352, PR.uv.ac).box(M.dark, s, y - 0.03, 0.18, 0.7, 0.04, 0.34, keep('SEWD')).box(M.pipe, s + 0.45, y + 0.6, 0.03, 0.04, 0.9, 0.04, keep('SEW'));
}
/** A plate of the print sheet on the wall, its right edge at s. */
function plate(G, key, s, y = 1.5, w = 0.02) {
  const t = PR.uv[key]; if (!t) return; const ph = key[0] === 'n' ? 0.34 : 0.18, pw = ph * (t[2] - t[0]) / (t[3] - t[1]);
  G.wall(M.prints, s - pw, s, y, y + ph, w, t);
}
// ---------------------------------------------------------------- facade schemes
// Each draws one storey of one stretch of wall, from s = 0 to L in the frame the tiers are set on, between y0 and y0 + sh,
// from pieces that never overlap in one plane (nothing flickers from far away). o: the finish (see config()).
const SCHEMES = {
  blank(T, L, y0, sh, o) {
    let ya = y0; if (o.band && y0 > 0.1) { T.a.wall(o.band, 0, L, y0, y0 + 0.3); ya = y0 + 0.3; }
    T.a.wall(o.wall, 0, L, ya, y0 + sh);
  },
  /** One window per bay, standing back in the wall. */
  punched(T, L, y0, sh, o) {
    const G = T.a, n = Math.max(1, Math.round(L / o.bay)), bw = L / n, ww = Math.min(o.ww, bw - 0.7), wh = Math.min(o.wh, sh - o.sill - 0.4), ys = y0 + o.sill, yh = ys + wh, d = o.d, mv = d ? wh / 14 : 0;
    if (ww < 0.7 || L < 2.2) return SCHEMES.blank(T, L, y0, sh, o);
    let ya = y0; if (o.band && y0 > 0.1) { G.wall(o.band, 0, L, y0, y0 + 0.3); ya = y0 + 0.3; }
    G.wall(o.wall, 0, L, ya, ys).wall(o.wall, 0, L, yh, y0 + sh);
    let prev = 0, pc = 0;
    for (let i = 0; i < n; i++) {
      const a = i * bw + (bw - ww) / 2, b = a + ww, [ca, cb] = G.pane(o.kind, Math.floor(R() * 8), a, b, ys, yh, d);
      G.wall(o.wall, prev, a, ys, yh); prev = b;
      if (d) { G.wall(M.reveal, pc, ca, ys - mv, yh + mv, -d); pc = cb; }
      if (!o.sills) T.m.box(M.sill, (a + b) / 2, ys - 0.035, 0.05, ww + 0.16, 0.07, 0.1, keep('SUDEW'));
      if (o.ac && y0 > 0.1 && R() < o.ac) acUnit(T.m, b - 0.42, ys - 0.72);
    }
    G.wall(o.wall, prev, L, ys, yh); if (d) G.wall(M.reveal, pc, L, ys - mv, yh + mv, -d);
    if (o.sills) G.box(M.sill, L / 2, ys - 0.035, 0.045, L, 0.07, 0.09, keep('SUD'));       // one sill course along the whole wall
  },
  /** A ribbon of windows between two end piers. */
  ribbon(T, L, y0, sh, o) {
    const G = T.a, e = Math.min(o.end ?? 0.9, L * 0.14), wh = Math.min(o.wh, sh - o.sill - 0.4), ys = y0 + o.sill, yh = ys + wh, d = o.d, mv = d ? wh / 14 : 0;
    if (L < 3.2) return SCHEMES.blank(T, L, y0, sh, o);
    const n = Math.max(1, Math.round((L - 2 * e) / (o.tile || 2.4))), tw = (L - 2 * e) / n, kind = o.kind === 'slide' || o.kind === 'home' ? 'band' : o.kind;
    let ya = y0; if (o.band && y0 > 0.1) { G.wall(o.band, 0, L, y0, y0 + 0.3); ya = y0 + 0.3; }
    G.wall(o.wall, 0, L, ya, ys).wall(o.wall, 0, L, yh, y0 + sh).wall(o.wall, 0, e, ys, yh).wall(o.wall, L - e, L, ys, yh);
    for (let i = 0; i < n; i++) G.pane(kind, Math.floor(R() * 4), e + i * tw, e + (i + 1) * tw, ys, yh, d);
    if (d) { G.wall(M.reveal, e - 0.4, e, ys - mv, yh + mv, -d).wall(M.reveal, L - e, L - e + 0.4, ys - mv, yh + mv, -d); }
    G.box(M.sill, L / 2, ys - 0.035, 0.045, L - 2 * e + 0.2, 0.07, 0.09, keep('SUDEW'));
  },
  /** Recessed balconies in a white frame: a brick balustrade panel, behind it the brick back wall with a door set. */
  loggia(T, L, y0, sh, o) {
    const G = T.a, n = Math.max(1, Math.round(L / o.bay)), bw = L / n, pier = 0.45, D = o.depth || 1.3, yb = y0 + sh - 0.5, rail = 1.05;
    G.wall(o.frame, 0, L, yb, y0 + sh);
    for (let i = 0; i <= n; i++) G.wall(o.frame, Math.max(0, i * bw - pier / 2), Math.min(L, i * bw + pier / 2), y0, yb);
    for (let i = 0; i < n; i++) {
      const a = i * bw + pier / 2, b = (i + 1) * bw - pier / 2, dw = Math.min(1.9, b - a - 0.5), da = a + (b - a - dw) * (i % 2 ? 0.2 : 0.8);
      G.wall(o.infill, a, b, y0, y0 + rail, -0.06).level(o.frame, a, b, -0.2, -0.06, y0 + rail).back(o.frame, a, b, y0 + 0.02, y0 + rail, -0.2);
      G.jamb(o.frame, a, -D, 0, y0, yb, 1).jamb(o.frame, b, -D, 0, y0, yb, -1).level(M.floor, a, b, -D, -0.2, y0 + 0.02).level(M.ceil, a, b, -D, 0, yb, -1);
      G.wall(M.win, da, da + dw, y0 + 0.02, y0 + 2.25, -D, cellUV('door', Math.floor(R() * 4), true));
      G.wall(o.infill, a, da, y0, yb, -D).wall(o.infill, da + dw, b, y0, yb, -D).wall(o.infill, da, da + dw, y0 + 2.25, yb, -D);
      if (R() < 0.6) {                                                      // washing on a pole under the balcony ceiling
        const x = a + 0.25 + R() * 0.5; T.m.box(M.steel, (a + b) / 2, yb - 0.2, -0.5, b - a - 0.2, 0.03, 0.03, keep('SUD'));
        for (let q = 0, nq = 2 + Math.floor(R() * 4); q < nq && x + q * 0.44 + 0.4 < b; q++) T.m.wall(paint(WASH[Math.floor(R() * WASH.length)], 0.95), x + q * 0.44, x + q * 0.44 + 0.38, yb - 0.75 - R() * 0.35, yb - 0.22, -0.5);
      }
      if (R() < 0.45) T.m.box(M.unit, i % 2 ? b - 0.5 : a + 0.5, y0 + 0.3, -D + 0.22, 0.78, 0.54, 0.3, keep('SEWU'));
    }
  },
  /** Open access gallery: balustrade, columns, and the corridor wall with its doors and windows behind. */
  gallery(T, L, y0, sh, o, k) {
    const G = T.a, n = Math.max(1, Math.round(L / o.bay)), bw = L / n, D = Math.min(o.depth || 2.0, 2.6), yb = y0 + sh - 0.45, rail = k ? 1.1 : 0, col = 0.4;
    G.wall(o.frame, 0, L, yb, y0 + sh);
    if (rail) G.wall(o.frame, 0, L, y0, y0 + rail).level(o.frame, 0, L, -0.14, 0, y0 + rail).back(o.frame, 0, L, y0 + 0.02, y0 + rail, -0.14);
    for (let i = 0; i <= n; i++) { const c = Math.min(L - col / 2, Math.max(col / 2, i * bw)); G.wall(o.frame, c - col / 2, c + col / 2, y0 + rail, yb).jamb(o.frame, c - col / 2, -col, 0, y0 + rail, yb, -1).jamb(o.frame, c + col / 2, -col, 0, y0 + rail, yb, 1); }
    G.level(M.floor, 0, L, -D, rail ? -0.14 : 0, y0 + 0.02).level(M.ceil, 0, L, -D, 0, yb, -1);
    for (let i = 0; i < n; i++) G.wall(M.win, i * bw, (i + 1) * bw, y0, yb, -D, cellUV('gbay', Math.floor(R() * 4)));
    G.jamb(o.frame, 0, -D, 0, y0, yb, 1).jamb(o.frame, L, -D, 0, y0, yb, -1);
  },
  /** A glazed stair strip in the middle of an end wall. */
  stairs(T, L, y0, sh, o) {
    const G = T.a, m = L / 2, hw = Math.min(1.25, L / 2 - 0.6), d = o.d;
    if (L < 4) return SCHEMES.blank(T, L, y0, sh, o);
    let ya = y0; if (o.band && y0 > 0.1) { G.wall(o.band, 0, m - hw, y0, y0 + 0.3).wall(o.band, m + hw, L, y0, y0 + 0.3); ya = y0 + 0.3; }
    G.wall(o.wall, 0, m - hw, ya, y0 + sh).wall(o.wall, m + hw, L, ya, y0 + sh).wall(M.win, m - hw, m + hw, y0, y0 + sh, -d, cellUV('stair', 0));
    if (d) G.jamb(M.reveal, m - hw, -d, 0, y0, y0 + sh, 1).jamb(M.reveal, m + hw, -d, 0, y0, y0 + sh, -1);
  },
  /** Flat tower: flush windows, a white band at every floor, a balcony on every third bay. */
  apart(T, L, y0, sh, o, k) {
    const G = T.a, n = Math.max(1, Math.round(L / o.bay)), bw = L / n, ys = y0 + 0.95, yh = y0 + sh - 0.45;
    G.wall(o.band, 0, L, y0, y0 + 0.3).wall(o.wall, 0, L, y0 + 0.3, ys).wall(o.wall, 0, L, yh, y0 + sh);
    let prev = 0;
    for (let i = 0; i < n; i++) {
      const bal = i % 3 === 1 && bw > 2.6, ww = Math.min(bal ? 1.9 : 1.5, bw - 0.6), a = i * bw + (bw - ww) / 2, b = a + ww;
      G.wall(o.wall, prev, a, ys, yh); prev = b;
      if (bal) {
        const t = cellUV('door', Math.floor(R() * 4), true); G.wall(M.win, a, b, ys, yh, 0, [t[0], t[3] - (t[3] - t[1]) * (yh - ys) / 2.25, t[2], t[3]]);
        G.box(o.band, (a + b) / 2, y0 + 0.65, 0.55, Math.min(bw - 0.3, ww + 1.2), 1.1, 1.1, keep('SEWDU'));
      } else { G.pane('home', Math.floor(R() * 8), a, b, ys, yh, 0); if (o.ac && R() < o.ac) acUnit(T.m, b + 0.5, ys - 0.2); }
    }
    G.wall(o.wall, prev, L, ys, yh);
  },
  /** Shed wall: concrete dado, ribbed sheet, a strip of wired glass under the eaves. */
  shed(T, L, y0, sh, o) {
    const G = T.a, dado = Math.min(1.0, sh * 0.3), win = o.high && L > 5 && sh > 4, yw = sh - 1.5, e = 1.0;
    G.wall(o.dado || M.concrete, 0, L, y0, dado).wall(o.wall, 0, L, dado, win ? yw : sh);
    if (!win) return;
    const n = Math.max(1, Math.round((L - 2 * e) / 2.4)), tw = (L - 2 * e) / n;
    G.wall(o.wall, 0, e, yw, yw + 0.8).wall(o.wall, L - e, L, yw, yw + 0.8).wall(o.wall, 0, L, yw + 0.8, sh);
    for (let i = 0; i < n; i++) G.pane('high', 0, e + i * tw, e + (i + 1) * tw, yw, yw + 0.8, 0);
  },
  /** Curtain wall between two piers. */
  curtain(T, L, y0, sh, o) {
    const G = T.a, e = Math.min(o.end ?? 0.6, L * 0.1), n = Math.max(1, Math.round((L - 2 * e) / 2.4)), tw = (L - 2 * e) / n;
    G.wall(o.wall, 0, e, y0, y0 + sh).wall(o.wall, L - e, L, y0, y0 + sh);
    for (let i = 0; i < n; i++) G.wall(M.win, e + i * tw, e + (i + 1) * tw, y0, y0 + sh, 0, cellUV('cw', (i + Math.round(y0)) % 3 ? 0 : 1));
  },
  /** Open ground storey: a beam on two end columns; what lies behind is drawn by the building. */
  open(T, L, y0, sh, o) {
    const G = T.a, yb = y0 + sh - 0.45; G.wall(o.frame, 0, L, yb, y0 + sh).level(M.ceil, 0, L, -(o.depth || 2), 0, yb, -1);
    for (const c of [0.2, L - 0.2]) G.box(o.frame, c, yb / 2, -0.2, 0.4, yb, 0.4, keep('SEWN'));
  },
};

// ---------------------------------------------------------------- entrances (ground storey; the frame F is set on the opening, 0..L)
const ENTRY = {
  /** Door set standing back in the wall, a canopy with a lamp over it, a granite step in front, a plate beside it. */
  door(T, L, sh, o, e, F) {
    const G = T.a, dh = Math.min(2.5, sh - 0.5), d = 0.2, key = e.print || 'doorGlass';
    G.wall(o.wall, 0, L, dh, sh).wall(M.prints, 0, L, 0, dh, -d, PR.uv[key]);
    G.jamb(M.reveal, 0, -d, 0, 0, dh, 1).jamb(M.reveal, L, -d, 0, 0, dh, -1).level(M.reveal, 0, L, -d, 0, dh, -1);
    if (e.canopy !== false) { G.box(M.cope, L / 2, dh + 0.3, 0.7, L + 1.4, 0.14, 1.4, keep('SEWUD')); T.m.box(M.lamp, L / 2, dh + 0.215, 0.7, 0.5, 0.03, 0.2, keep('D')); LIT.push([...F.at(L / 2, 1.3), 4]); }
    if (e.step !== false) G.box(M.granite, L / 2, 0.05, 0.6, L + 0.8, 0.1, 1.2, keep('SEWU'));
    if (e.plate) plate(T.n, e.plate, -0.14);
  },
  /** Roller shutter with a number over it. */
  roller(T, L, sh, o, e) {
    const G = T.a, dh = Math.min(e.h || 3.2, sh - 0.3), d = 0.1;
    G.wall(o.wall, 0, L, dh, sh).wall(M.prints, 0, L, 0, dh, -d, PR.uv.roller).wall(M.dark, 0, L, dh - 0.02, dh + 0.24, 0.04);
    G.jamb(M.steel, 0, -d, 0, 0, dh, 1).jamb(M.steel, L, -d, 0, 0, dh, -1).level(M.steel, 0, L, -d, 0.04, dh + 0.24, 1);
    if (e.plate) { const t = PR.uv[e.plate], pw = (e.plate[0] === 'n' ? 0.34 : 0.18) * (t[2] - t[0]) / (t[3] - t[1]); plate(T.m, e.plate, L / 2 + pw / 2, dh + (e.plate[0] === 'n' ? 0.4 : 0.3)); }
  },
  /** Glazed front with a furnished room behind it, a canopy (a sign on its edge), a threshold, planters. */
  lobby(T, L, sh, o, e, F) {
    const H = Math.min(2.9, sh - 0.45), G = T.a, N = T.n;
    shopfront(T, L, H, sh, o.wall, e.kind);
    if (e.sign) { const t = PR.uv[e.sign], pw = 0.36 * (t[2] - t[0]) / (t[3] - t[1]); G.box(M.frame, L / 2, H + 0.3, 0.6, L + 0.6, 0.5, 1.2, keep('SEWUD')); N.wall(M.prints, L / 2 - pw / 2, L / 2 + pw / 2, H + 0.12, H + 0.48, 1.21, t); }
    else G.box(M.cope, L / 2, H + 0.25, 0.8, L + 1.0, 0.14, 1.6, keep('SEWUD'));
    G.box(M.granite, L / 2, 0.04, 0.7, L + 0.6, 0.08, 1.4, keep('SEWU')); T.m.box(M.lamp, L / 2, H + 0.03, 0.6, Math.min(3, L - 1), 0.03, 0.2, keep('D')); LIT.push([...F.at(L / 2, 1.6), 5.5]);
    if (e.plate) plate(N, e.plate, -0.14);
    for (const s of [-0.75, L + 0.75]) { const [x, z] = F.at(s, 0.75); T.pots.push([x, z, F.ang]); }
  },
  /** A passage through the building at ground level (each face draws its half): beam, side walls, soffit with a lamp, paving. */
  pass(T, L, sh, o, e, F) {
    const G = T.a, H = sh - 0.5, D = e.depth, q = 0.5;                       // q: the portal's piers
    G.wall(o.frame, 0, q, 0, H).wall(o.frame, L - q, L, 0, H).wall(o.frame, 0, L, H, sh).jamb(M.render, q, -D, 0, 0, H, 1).jamb(M.render, L - q, -D, 0, 0, H, -1).level(M.ceil, q, L - q, -D, 0, H, -1).level(M.ground, q, L - q, -D, 1.5, 0.06);
    T.m.box(M.lamp, L / 2, H - 0.015, -D / 2, 0.3, 0.03, 1.2, keep('D')); LIT.push([...F.at(L / 2, -D / 2), 4.5]);
    if (e.plate) plate(T.n, e.plate, q - 0.01, 1.55);
  },
};

// ---------------------------------------------------------------- what each building is made of (ASSUMED and IMAGINED: see the header)
function config(b, p, low) {
  const L = p.look, wall = M[L.wall] || M.white;
  const C = { wall, cap: L.band ? M.frame : wall, sides: {}, over: {}, ground: null, groundSides: {}, entries: [], kit: L.kind === 'shed' ? 'none' : L.storeys >= 3 ? 'stair' : 'vents',
    base: { wall, band: L.band ? M.frame : null, bay: 3.8, ww: 1.8, wh: 1.7, sill: 0.95, d: low ? 0 : 0.12, kind: 'slide', sills: true, frame: M.frame, infill: M.redBrown } };
  const def = { punched: 'punched', bands: 'ribbon', 'brick-bays': 'loggia', none: 'blank' }[L.win] || 'punched';
  for (const f of 'NSEW') C.sides[f] = L.kind === 'shed' ? 'shed' : def;
  const set = (o, extra) => Object.assign(C.sides, o) && extra && Object.assign(C.base, extra);
  switch (b.id) {
    case 'south-low-link': Object.assign(C.base, { kind: 'band', wh: 1.6 });
      C.entries.push({ side: 'N', w: 6, type: 'lobby', kind: 'shop', sign: 'p:小卖部' }, { side: 'W', w: 6, type: 'lobby', kind: 'read', sign: 'p:阅览室' }, { side: 'S', w: 1.3, type: 'door', print: 'doorSteel', plate: 'p:配电房', canopy: false }); break;
    case 'south-court-complex':
      Object.assign(C.base, { kind: 'home', ww: 1.5, wh: 1.5, bay: 3.6, sills: false, depth: 1.3, ac: 0.5 }); C.kit = L.roofUnits ? 'solar' : 'vents';
      if (p.id === 'north-bar') {                                           // the gateway into the west court (IMAGINED)
        set({ N: 'loggia', S: 'gallery', W: 'stairs', E: 'punched' }); C.cut = { axis: 0, a: 77.5, b: 81 };
        C.entries.push({ side: 'N', type: 'pass', c: [79.25, 92.3], w: 4.5, depth: 5.4, plate: 'p:值班室' }, { side: 'S', type: 'pass', c: [79.25, 103], w: 4.5, depth: 5.4 });
      }
      else if (p.id === 'west-bar') { set({ W: 'ribbon', E: 'gallery', S: 'blank' }); C.over.W = { kind: 'band' }; }
      else if (p.id === 'south-west-bar') set({ S: 'loggia', N: 'gallery', W: 'blank', E: 'blank' });
      else if (p.id === 'south-east-bar') set({ S: 'loggia', N: 'gallery', E: 'punched', W: 'blank' });
      else if (p.id === 'link') { set({ W: 'gallery', E: 'gallery', N: 'blank', S: 'blank' }, { depth: 2.3, bay: 3.0 }); C.groundSides = { W: 'open', E: 'open' }; C.open = true; }
      else {                                                                // east end: a passage from the east court to the outside (IMAGINED)
        set({ E: 'punched', W: 'gallery', N: 'blank', S: 'blank' }); C.cut = { axis: 1, a: 107.4, b: 110.4 };
        C.entries.push({ side: 'E', type: 'pass', c: [129.9, 108.9], w: 4, depth: 3.05 }, { side: 'W', type: 'pass', c: [123.9, 108.9], w: 4, depth: 3.05 });
      }
      break;
    case 'south-e-complex':
      if (p.id === 'north-west-annex') { C.wall = C.base.wall = C.cap = M.render; Object.assign(C.base, { kind: 'band', wh: 2.3, sill: 0.75, tile: 2.4 }); set({ N: 'ribbon', S: 'ribbon', E: 'ribbon', W: 'ribbon' }); C.kit = 'ducts'; C.entries.push({ side: 'N', w: 9, type: 'lobby', kind: 'hall', sign: 'p:食堂' }, { side: 'W', w: 1.3, type: 'door', print: 'doorSteel', canopy: false }); }
      else if (p.id === 'spine') { set({ E: 'ribbon', W: 'gallery', N: 'stairs', S: 'stairs' }, { bay: 3.9 }); C.over.E = { kind: 'band' }; }
      else { set({ N: 'punched', S: 'gallery', W: 'stairs', E: 'blank' }, { bay: 3.0, ww: 2.1, wh: 1.8, ac: 0.3 }); if (p.id === 'bar-1') C.entries.push({ side: 'N', w: 2.4, type: 'door', plate: 'n:2', at: 0.3 }, { side: 'N', w: 2.4, type: 'door', plate: 'n:3', at: 0.75 }); }
      break;
    case 'south-tall-building':
      for (const f of 'NSEW') C.sides[f] = 'apart'; Object.assign(C.base, { bay: 3.6, band: M.frame, ac: 0.4 }); C.ground = { scheme: 'ribbon', kind: 'band', wh: 2.1, sill: 0.5, band: null }; C.kit = 'tower';
      if (p.id === 'main') C.entries.push({ side: 'N', w: 6, type: 'lobby', kind: 'lobby', plate: 'n:8' }, { side: 'W', w: 2.4, type: 'door', at: 0.3 });
      break;
    case 'north-dark-roof-block': C.wall = C.base.wall = M.redBrown; C.cap = M.frame; Object.assign(C.base, { kind: 'home', ww: 1.5, wh: 1.5, bay: 3.4, sills: false, ac: 0.45 }); C.entries.push({ side: 'auto', toward: [150, -150], w: 1.3, type: 'door', print: 'doorSteel', plate: 'p:值班室' }); break;
    case 'north-wavy-parapet-block': C.wall = C.base.wall = C.cap = M.render; Object.assign(C.base, { kind: 'band', wh: 1.9, sill: 0.8 }); C.entries.push({ side: 'auto', toward: [180, -200], w: 6, type: 'lobby', kind: 'lobby', plate: 'n:5' }); break;
    case 'north-white-shed': Object.assign(C.base, { wall: M.tin, high: true }); C.cap = M.tin; C.entries.push({ side: 'auto', toward: [230, -230], w: 3.4, type: 'roller', at: 0.28, plate: 'n:1' }, { side: 'auto', toward: [230, -230], w: 3.4, type: 'roller', at: 0.72, plate: 'n:2' }); break;
    case 'north-long-white-shed': Object.assign(C.base, { wall: M.tin, high: p.id === 'main' }); C.cap = M.tin;
      if (p.id === 'main') [0.12, 0.31, 0.5, 0.69, 0.88].forEach((at, i) => C.entries.push({ side: 'E', w: 3.6, type: 'roller', at, plate: 'n:' + (i + 3) })); else C.entries.push({ side: 'E', w: 2.8, type: 'roller', h: 2.8 });
      break;
    case 'north-east-pale-complex': Object.assign(C.base, { band: M.frame, ac: 0.3 }); C.over.N = { kind: 'band' }; C.entries.push(p.id === 'north-block' ? { side: 'S', w: 2.4, type: 'door', plate: 'n:6' } : { side: 'E', w: 1.3, type: 'door', print: 'doorTimber', plate: 'p:收发室' }); break;
    default: {                                                             // the low sheds west and south of the track: rendered walls, small windows, doors with plates
      Object.assign(C.base, { wall: M.grey, kind: 'slide', ww: 1.2, wh: 0.9, sill: 1.25, bay: 3.6, sills: false, d: low ? 0 : 0.1 }); C.cap = M.cope; C.kit = 'none';
      for (const f of 'NSEW') C.sides[f] = 'punched';
      const toward = b.id === 'west-sheds-north-of-stand' ? [-70, -30] : [0, 70];
      const doors = { 'west-sheds-north-of-stand/a': [['器材室', 0.08], ['储藏室', 0.29], ['工具间', 0.5], ['器材室', 0.71], ['配电房', 0.92, 'doorSteel']], 'west-sheds-north-of-stand/b': [['储藏室', 0.14], ['工具间', 0.5], ['值班室', 0.86]],
        'southwest-sheds/dark': [['工具间', 0.5, 'roller']], 'southwest-sheds/blue': [['配电房', 0.5, 'doorSteel']], 'southwest-sheds/red': [['水泵房', 0.5, 'doorSteel']], 'south-small-roofs/a': [['值班室', 0.5]], 'south-small-roofs/b': [['卫生间', 0.25], ['卫生间', 0.75]] }[b.id + '/' + p.id] || [];
      for (const [name, at, print = 'doorTimber'] of doors) C.entries.push(print === 'roller' ? { side: 'auto', toward, w: 3, type: 'roller', h: 2.3, at, plate: 'p:' + name } : { side: 'auto', toward, w: print === 'doorSteel' ? 1.3 : 1.0, type: 'door', print, plate: 'p:' + name, at, step: false });
    }
  }
  return C;
}

// ---------------------------------------------------------------- the kinds of part
function inset(pts, t) {                             // convex ordered polygon moved inward by t
  const n = pts.length, out = [];
  for (let i = 0; i < n; i++) {
    const a = frameOf(pts[(i + n - 1) % n], pts[i]), b = frameOf(pts[i], pts[(i + 1) % n]);
    const s = 1 + a.nx * b.nx + a.nz * b.nz, k = t / (s < 0.2 ? 0.2 : s);
    out.push([pts[i][0] - (a.nx + b.nx) * k, pts[i][1] - (a.nz + b.nz) * k]);
  }
  return out;
}
const roofPaint = p => { const c = new THREE.Color(p.roofColourInImage || '#b9b6ad'); c.lerp(new THREE.Color(0xffffff), 0.12); return paint(c.getHex(), 0.92); };
/** A block or a shed: walls by scheme, entrances, parapet, roof and what stands on it, pipes, streaks, apron. Returns { C, sh, yRoof }. */
function block(T, b, p, pts, others, low, ctx) {
  const L = p.look, h = p.height, shed = L.kind === 'shed', top = h - (shed ? 0.4 : 1.0), yRoof = shed ? h : h - 0.6, n = shed ? 1 : L.storeys, sh = top / n, C = config(b, p, low);
  const frames = pts.map((q, i) => frameOf(q, pts[(i + 1) % pts.length])), runs = frames.map(F => exposed(F, others).map(([a, c]) => F.sub(a, c)));
  const mx = pts.reduce((s, q) => s + q[0], 0) / pts.length, mz = pts.reduce((s, q) => s + q[1], 0) / pts.length;
  // entrances: on the longest free stretch of the named side, on the side that looks toward a point, or where a given point lies
  const gaps = new Map();
  for (const e of C.entries) {
    let best = null, score = -Infinity, at = 0;
    runs.forEach((list, i) => { for (const E of list) {
      const c = e.c ? (e.c[0] - E.o[0]) * E.rx + (e.c[1] - E.o[1]) * E.rz : E.L * (e.at ?? 0.5);
      if (E.L < e.w + 0.8 || (e.c ? c < 0 || c > E.L || E.facing !== e.side : e.side !== 'auto' && E.facing !== e.side)) continue;
      const sc = e.side === 'auto' ? (E.nx * (e.toward[0] - mx) + E.nz * (e.toward[1] - mz)) / (Math.hypot(e.toward[0] - mx, e.toward[1] - mz) || 1) * 40 + Math.min(E.L, 12) : E.L;
      if (sc > score) { score = sc; best = E; at = c; }
    } });
    if (!best) continue;
    const g0 = Math.max(0.4, Math.min(best.L - 0.4 - e.w, at - e.w / 2));
    if (!gaps.has(best)) gaps.set(best, []); gaps.get(best).push({ g: [g0, g0 + e.w], e });
  }
  runs.forEach((list, i) => { for (const E of list) {
    const f = frames[i].facing, mine = gaps.get(E) || [], oo = { ...C.base, ...(C.over[f] || {}) };
    for (let k = 0; k < n; k++) {
      const o = k === 0 && C.ground ? { ...oo, ...C.ground } : oo;
      const scheme = k === 0 ? (C.groundSides[f] || (C.ground && C.ground.scheme) || C.sides[f]) : C.sides[f];
      for (const [a, c] of k === 0 ? minus(0, E.L, mine.map(q => q.g)) : [[0, E.L]]) { const Fs = E.sub(a, c); T.on(Fs); SCHEMES[E.L < 1.2 ? 'blank' : scheme](T, Fs.L, k * sh, sh, o, k); }
    }
    for (const { g, e } of mine) { const Fg = E.sub(g[0], g[1]); T.on(Fg); ENTRY[e.type](T, g[1] - g[0], sh, oo, e, Fg); }
    T.on(E); T.a.wall(C.cap, 0, E.L, top, h);                               // parapet or eaves zone
    if (!shed) T.a.box(M.cope, E.L / 2, (yRoof + h) / 2, -0.13, E.L, h - yRoof, 0.26, keep('UN'));
    const plain = C.sides[f] !== 'loggia' && C.sides[f] !== 'gallery';
    if (E.L > 5 && !low) {                                                  // rainwater pipes with hoppers, streaks below the coping
      for (const s of E.L > 30 ? [0.3, E.L / 2, E.L - 0.3] : [0.3, E.L - 0.3]) if ((plain && C.sides[f] !== 'apart') || s !== E.L / 2) T.m.box(M.pipe, s, top / 2, 0.06, 0.11, top, 0.11, keep('SEW')).box(M.pipe, s, top - 0.1, 0.09, 0.26, 0.28, 0.2, keep('SEWUD'));
      const band = Math.min(1.4, sh - oo.sill - Math.min(oo.wh, sh - oo.sill - 0.4)) - 0.05;      // the wall between the top windows and the coping
      if (!shed && plain) T.m.wall(M.stain, 0, E.L, top - band, h - 0.05, 0.012, [0, 0, E.L / 2.4, 1]);
    }
    if (C.apron !== false && E.L > 3) {                                     // paved margin at the foot of the wall, with a kerb
      const w = shed ? 0.9 : 1.6; T.a.level(M.ground, 0, E.L, 0, w, 0.06).level(M.cope, 0, E.L, w, w + 0.15, 0.09);
      if (ctx.occupy) ctx.occupy([E.at(-0.3, 0), E.at(E.L + 0.3, 0), E.at(E.L + 0.3, w + 0.5), E.at(-0.3, w + 0.5)]);
    }
  } });
  T.a.poly(shed && L.roof === 'whiteMetal' ? M.tinRoof : roofPaint(p), pts, yRoof);
  roofKit(T, C.kit, frames, yRoof, low);
  if (!shed && !low) { T.m.frame(); for (const [x, z] of inset(pts, 0.14)) T.m.cyl(M.steel, x, h, z, 0.02, 1.3, 5, false); }      // lightning rods
  return { C, sh, yRoof };
}
/** Things on a flat roof, placed along the longest edge. Visual only (a walker set down on a roof walks through them). */
function roofKit(T, kit, frames, yRoof, low) {
  if (kit === 'none') return;
  const i = frames.reduce((a, F, k) => (F.L > frames[a].L ? k : a), 0), F = frames[i], depth = frames[(i + 1) % frames.length].L, G = T.a.on(F, yRoof), mid = -depth / 2;
  if (kit === 'stair' || kit === 'tower' || kit === 'solar') {             // stair head with a door, a pair of water tanks beside it
    const s = F.L * 0.24, hh = kit === 'tower' ? 4.2 : 2.7;
    G.box(M.render, s, hh / 2, mid - 0.6, 3.2, hh, Math.min(5, depth - 2.4), keep('SEWNU')).box(M.cope, s, hh + 0.08, mid - 0.6, 3.6, 0.16, Math.min(5.4, depth - 2), keep('SEWNU'));
    if (depth > 8) { G.cyl(M.steel, s + 3.4, 0.5, mid - 1.4, 0.95, 1.7, 12).cyl(M.steel, s + 3.4, 0.5, mid + 0.9, 0.95, 1.7, 12).box(M.concrete, s + 3.4, 0.25, mid - 0.25, 2.4, 0.5, 4.8, keep('SEWNU')); }
  }
  if (kit === 'tower') { const s = F.L * 0.7; G.box(M.render, s, 2.4, mid, 7, 4.8, Math.min(8, depth - 6), keep('SEWNU')).box(M.concrete, s - 7, 1.0, mid, 4.5, 2, 4.5, keep('SEWNU')); }
  if (kit === 'solar' && !low) for (let s = 4; s < F.L - 3; s += 5.5) {    // "roofs covered with small units": solar water heaters, a panel leaning on its tank
    if (Math.abs(s - F.L * 0.24) < 5) continue;
    G.q4(M.solar, [s - 0.8, 0.25, mid + 0.9], [s + 0.8, 0.25, mid + 0.9], [s + 0.8, 1.05, mid - 0.3], [s - 0.8, 1.05, mid - 0.3], [0, 0.84, 0.54], [[0, 0], [1, 0], [1, 1], [0, 1]]);
    G.box(M.unit, s, 1.1, mid - 0.55, 1.8, 0.45, 0.45, keep('SEWNU'));
  }
  if (kit === 'vents' || kit === 'ducts') for (let s = 3; s < F.L - 2; s += 6) G.box(M.unit, s, 0.45, mid, 1.3, 0.9, 1.1, keep('SEWNU'));
  if (kit === 'ducts') G.box(M.steel, F.L * 0.5, 0.75, mid + depth * 0.25, F.L * 0.5, 0.7, 0.9, keep('SEWNU')).box(M.steel, F.L * 0.75, 1.5, mid + depth * 0.25, 1.2, 1.4, 1.2, keep('SEWNU'));
}
/** Round tower of the courtyard complex: white drum with ribbon windows on every storey (2018 frames). */
function drum(T, p) {
  const L = p.look, h = p.height, top = h - 1.0, sh = top / L.storeys, seg = 24, G = T.a, { cx, cz, radius: r } = p;
  for (let k = 0; k < L.storeys; k++) {
    const y0 = k * sh;
    G.arc(M.white, cx, cz, r, y0, y0 + 1.0, 0, TAU, seg).arc(M.white, cx, cz, r, y0 + 2.5, y0 + sh, 0, TAU, seg);
    for (let i = 0; i < seg; i++) G.arc(M.win, cx, cz, r - 0.03, y0 + 1.0, y0 + 2.5, i / seg * TAU, (i + 1) / seg * TAU, 1, 1, cellUV('band', (i * 7 + k * 3) % 4, true));
  }
  G.arc(M.white, cx, cz, r, top, h, 0, TAU, seg).ring(roofPaint(p), cx, cz, 0, r - 0.25, h - 0.6, 0, TAU, seg).ring(M.cope, cx, cz, r - 0.25, r, h, 0, TAU, seg).arc(M.cope, cx, cz, r - 0.25, h - 0.6, h, 0, TAU, seg, -1);
}
/** A bicycle shed (IMAGINED): steel posts, a roof of ribbed sheet, a rack of bicycles on a concrete pad. The row runs from (x, z) along the direction of ang (as Batch.frame). */
function bikeShed(T, col, ctx, x, z, ang, len, seed) {
  const A = T.a, c = Math.cos(ang), s = Math.sin(ang), at = (u, w) => [x + c * u + s * w, z - s * u + c * w], nb = Math.max(2, Math.round(len / 3));
  A.frame(x, z, ang); A.box(M.tinRoof, len / 2, 2.4, 0.35, len + 0.6, 0.06, 2.7, keep('SNEWUD')).box(M.steel, len / 2, 2.31, -0.75, len, 0.1, 0.06, keep('SND')).level(M.ground, -0.3, len + 0.3, -1.0, 1.8, 0.06);
  for (let i = 0; i <= nb; i++) A.box(M.steel, i * len / nb, 1.18, -0.75, 0.08, 2.36, 0.08, keep('SNEW')).box(M.steel, i * len / nb, 2.31, 0.35, 0.06, 0.1, 2.6, keep('EWD'));
  A.frame(); T.n.frame(); col.frame(); bikeRack(T.n, col, ...at(len / 2, 0.1), ang, Math.floor((len - 0.4) / 0.62), seed);
  if (ctx.occupy) ctx.occupy([at(-0.6, -1.3), at(len + 0.6, -1.3), at(len + 0.6, 2.1), at(-0.6, 2.1)]);
}

/**
 * A glazed front with a shallow furnished room behind it (IMAGINED). The tiers are set on the opening, 0..L; H: height of
 * the opening, sh: of the storey. kind: 'shop', 'lobby' or 'read'. Nothing behind the glass can be reached: it is there
 * to be looked at. Its walls and ceiling carry their own light after dusk.
 */
function shopfront(T, L, H, sh, wall, kind) {
  const A = T.a, N = T.n, D = 2.6, base = 0.3, nb = Math.max(2, Math.round(L / 1.5)), bw = L / nb, door = kind === 'shop' ? nb - 1 : Math.floor(nb / 2);
  A.wall(wall, 0, L, H, sh);
  A.level(M.roomWall, 0, L, -D, 0, 0.05).level(M.roomWall, 0, L, -D, 0, H, -1).wall(M.roomWall, 0, L, 0, H, -D).jamb(M.roomWall, 0, -D, 0, 0, H, 1).jamb(M.roomWall, L, -D, 0, 0, H, -1);
  N.level(M.roomFloor, 0, L, -D, 0, 0.062).level(M.roomCeil, 0, L, -D, 0, H - 0.012, -1);          // boards and a white ceiling from nearby
  A.wall(M.glassClear, 0, L, 0.06, H, -0.06);
  for (let i = 0; i <= nb; i++) A.box(M.alu, Math.min(L - 0.03, Math.max(0.03, i * bw)), H / 2, -0.06, 0.06, H, 0.1, keep('SEW'));
  A.box(M.alu, L / 2, H - 0.03, -0.06, L, 0.06, 0.1, keep('SD')).box(M.alu, L / 2, 2.3, -0.06, L, 0.05, 0.1, keep('SUD'));
  for (let i = 0; i < nb; i++) {
    if (i !== door) A.box(M.granite, (i + 0.5) * bw, base / 2, -0.04, bw, base, 0.12, keep('SU'));
    else N.box(M.alu, (i + 0.5) * bw, 0.1, -0.06, bw - 0.06, 0.2, 0.06, keep('SU')).box(M.steel, (i + 0.5) * bw + bw * 0.3, 1.1, 0, 0.03, 0.45, 0.05, keep('SEWUD'));
  }
  N.box(M.lamp, L / 2, H - 0.02, -D / 2, Math.min(L - 1, 4), 0.03, 0.25, keep('D'));
  const P = (key, s0, s1, y0, y1, w = -D + 0.02) => N.wall(M.printsLit, s0, s1, y0, y1, w, PR.uv[key]);
  if (kind === 'shop') {                                                    // shelves of goods, a counter with a till, a drinks cabinet, crates
    for (let s = 0.2; s + 3.6 < L - bw; s += 3.8) P('shelves', s, s + 3.6, 0.15, 2.15);
    N.box(M.wood, 1.5, 0.5, -1.0, 2.4, 1.0, 0.6, keep('SEWU')).box(M.dark, 1.0, 1.12, -1.0, 0.4, 0.24, 0.36, keep('SEWU')).box(M.unit, L - bw - 0.7, 0.95, -D + 0.45, 0.72, 1.9, 0.66, keep('SEWU'));
    P('fridge', L - bw - 1.03, L - bw - 0.37, 0.08, 1.84, -D + 0.79);
    for (let i = 0; i < 3; i++) N.box(paint([0xc0392b, 0x2a63a8, 0xe0a020][i], 0.6), 3.2 + i * 0.55, 0.16 + (i % 2) * 0.3, -0.7, 0.5, 0.3 + (i % 2) * 0.6, 0.36, keep('SEWU'));
  } else if (kind === 'lobby') {                                            // a desk, lift doors, a sofa, a notice
    P('lift', L / 2 - 1.3, L / 2 + 1.3, 0.05, 2.3);
    N.box(M.wood, L * 0.22, 0.52, -1.5, 1.9, 1.05, 0.6, keep('SEWU')).box(M.frame, L * 0.22, 1.07, -1.5, 2.0, 0.04, 0.7, keep('SEWU'));
    N.box(paint(0x4a5a6e, 0.9), L * 0.8, 0.22, -1.9, 1.7, 0.44, 0.7, keep('SEWU')).box(paint(0x4a5a6e, 0.9), L * 0.8, 0.6, -2.2, 1.7, 0.4, 0.16, keep('SEWU'));
    if (L > 5.5) P('poster0', L - 1.3, L - 0.5, 1.0, 2.1);
  } else if (kind === 'hall') {                                             // dining tables with stools, a serving counter
    for (let s = 1.2; s < L - 1; s += 2.3) { N.box(M.wood, s, 0.72, -0.95, 1.5, 0.05, 0.7, keep('SEWUD')).box(M.dark, s, 0.36, -0.95, 1.2, 0.7, 0.05, keep('SN')); for (const [ds, dw] of [[-0.45, -0.4], [0.45, -0.4], [-0.45, -1.5], [0.45, -1.5]]) N.cyl(paint(0xd8a23a, 0.6), s + ds, 0.05, dw, 0.17, 0.42, 8); }
    N.box(M.steel, L / 2, 0.5, -D + 0.4, L - 1.2, 1.0, 0.6, keep('SEWU')); P('poster2', 0.5, 1.3, 1.25, 2.4); P('poster3', L - 1.3, L - 0.5, 1.25, 2.4);
  } else {                                                                  // 'read': book shelves, a table
    for (let s = 0.2; s + 2.4 < L; s += 2.5) { P('books', s, s + 2.4, 0.2, 1.15); P('books', s, s + 2.4, 1.2, 2.15); }
    N.box(M.wood, L / 2, 0.72, -1.2, 2.2, 0.05, 0.8, keep('SEWUD')).box(M.dark, L / 2, 0.36, -1.2, 1.9, 0.7, 0.06, keep('SN'));
  }
}

/**
 * The round pavilion of the 2018 frames: glazed drum, ring of slender columns, thin round roof disc. SEEN: the disc, the
 * columns, the ring beam, the dark-glazed drum with white floor bands. IMAGINED: that it can be entered (a doorway of two
 * facets toward the track's south bend), the room on the ground floor with its exhibition boards, book shelves, reading
 * tables and round core, the paved platform, the path, the lamps under the disc.
 */
function pavilion(T, p, col, ctx) {
  const { cx, cz, radius: Rd, height: h } = p, rd = p.drumRadiusM, rc = p.columnRingRadiusM, n = p.columns, top = h - 0.45, sh = top / p.look.storeys, A = T.a, N = T.n;
  const seg = 24, da = TAU / seg, PL = 0.06, rp = Rd + 0.7, yc = sh - 0.3, isDoor = i => i === 15 || i === 16, pt = (a, r) => [cx + r * Math.cos(a), cz + r * Math.sin(a)];
  const facet = i => { const [x1, z1] = pt((i + 1) * da, rd), [x0, z0] = pt(i * da, rd), L = Math.hypot(x0 - x1, z0 - z1); return mkFrame(x1, z1, (x0 - x1) / L, (z0 - z1) / L, L); };
  /** Frame of width w centred at angle a and radius r, facing outward (dir 1) or toward the centre (-1). */
  const tang = (a, r, w, dir = 1) => { const c = Math.cos(a), s = Math.sin(a); return mkFrame(cx + r * c - dir * s * w / 2, cz + r * s + dir * c * w / 2, dir * s, -dir * c, w); };
  // platform under the disc and the path toward the track
  A.ring(M.ground, cx, cz, rd - 0.15, rp - 0.62, PL, 0, TAU, 36).ring(M.grate, cx, cz, rp - 0.62, rp - 0.46, PL, 0, TAU, 36).ring(M.granite, cx, cz, rp - 0.46, rp, PL, 0, TAU, 36).arc(M.granite, cx, cz, rp, 0, PL, 0, TAU, 36);
  const ad = 16 * da, ux = Math.cos(ad), uz = Math.sin(ad), path = [[rp - 0.1, -1.6], [24, -1.6], [24, 1.6], [rp - 0.1, 1.6]].map(([r, t]) => [cx + ux * r - uz * t, cz + uz * r + ux * t]);
  A.poly(M.ground, path, 0.035);
  // the drum: white floor bands, glazing, mullions; clear glass on the ground storey
  for (let i = 0; i < seg; i++) {
    const F = facet(i), L = F.L; T.on(F);
    for (let k = 1; k <= 4; k++) A.wall(M.frame, 0, L, k === 4 ? top - 0.3 : k * sh - 0.3, k === 4 ? top : k * sh + 0.25, 0.03);
    for (let k = 1; k < 4; k++) A.wall(M.win, 0, L, k * sh + 0.25, (k + 1) * sh - 0.3, 0, cellUV('cw', R() < 0.6 ? 0 : 1));
    A.box(M.frame, 0, (sh + top) / 2, 0.02, 0.09, top - sh, 0.1, keep('SEW'));
    if (!isDoor(i)) {
      A.wall(M.glassClear, 0, L, PL + 0.3, yc).box(M.granite, L / 2, PL + 0.15, -0.06, L, 0.3, 0.12, keep('SNU')).box(M.frame, L / 2, 2.55, 0, L, 0.06, 0.1, keep('SNUD'));
      col.on(F).box('generic', L / 2, sh / 2 + 0.05, -0.02, L + 0.1, sh + 0.1, 0.24);
    } else A.wall(M.glassClear, 0, L, 2.5, yc).box(M.frame, L / 2, 2.46, 0, L, 0.08, 0.14, keep('SNUD'));
    if (i !== 15) A.box(M.frame, 0, (PL + yc) / 2, 0, 0.1, yc - PL, 0.14, keep('SNEW')); else A.box(M.frame, 0, (2.5 + yc) / 2, 0, 0.1, yc - 2.5, 0.14, keep('SNEW'));
  }
  // the two door leaves stand open, turned outward
  for (const [i, s] of [[16, 0.06], [15, facet(15).L - 0.06]]) {
    T.on(facet(i)); N.jamb(M.glassClear, s, 0.02, 1.3, 0.12, 2.4, 1).jamb(M.glassClear, s, 0.02, 1.3, 0.12, 2.4, -1);
    N.box(M.alu, s, 1.25, 0.05, 0.05, 2.4, 0.07, keep('SNEW')).box(M.alu, s, 1.25, 1.3, 0.05, 2.4, 0.07, keep('SNEW')).box(M.alu, s, 2.42, 0.67, 0.05, 0.07, 1.3, keep('EWUD')).box(M.alu, s, 0.1, 0.67, 0.05, 0.16, 1.3, keep('EWU'));
    N.box(M.steel, s, 1.1, 1.05, 0.09, 0.5, 0.03, keep('SNEW'));
    col.on(facet(i)).box('generic', s, 1.2, 0.68, 0.1, 2.4, 1.3);
  }
  { const F = tang(ad + 0.36, rd + 0.9, 0.56); T.on(F); N.box(M.dark, 0.28, 0.95, 0, 0.56, 1.9, 0.1, keep('SNEWU')).wall(M.prints, 0.05, 0.51, 1.5, 1.67, 0.052, PR.uv['p:阅览室']).wall(M.prints, 0.07, 0.49, 1.28, 1.44, 0.052, PR.uv['p:展厅']); col.on(F).box('generic', 0.28, 0.95, 0, 0.56, 1.9, 0.14); }
  // roof disc with the lamps under it, columns with bases and caps, ring beam, ties to the drum
  A.ring(M.frame, cx, cz, rd, Rd, top, 0, TAU, 36, -1).arc(M.frame, cx, cz, Rd, top, h, 0, TAU, 36).ring(paint(0xdedacd, 0.9), cx, cz, rd + 1.1, Rd, h, 0, TAU, 36).ring(roofPaint(p), cx, cz, 0, rd + 1.1, h, 0, TAU, 36);
  A.frame(); A.cyl(M.unit, cx, h, cz, 1.5, 0.9, 14).cyl(M.steel, cx, h + 0.9, cz, 0.03, 2.2, 5);
  const yb = top * 0.74;
  for (let k = 0; k < n; k++) {
    const a = (k + 0.5) / n * TAU, a2 = (k + 1.5) / n * TAU, [x, z] = pt(a, rc), [x2, z2] = pt(a2, rc), [xd, zd] = pt(a, rd), [xl, zl] = pt(k / n * TAU, 6.7);
    A.frame(); A.cyl(M.frame, x, 0, z, 0.26, top, 12, false).cyl(M.granite, x, 0, z, 0.42, 0.4, 12).cyl(M.frame, x, top - 0.14, z, 0.36, 0.14, 12);
    A.strut(M.frame, [x, yb + 0.22, z], [x2, yb + 0.22, z2], 0.4); A.strut(M.frame, [x, yb + 0.22, z], [xd, yb + 0.22, zd], 0.3);
    col.frame(); col.box('generic', x, top / 2, z, 0.5, top, 0.5);
    T.m.frame(); T.m.cyl(M.lamp, xl, top - 0.05, zl, 0.2, 0.05, 10); if (k % 2 === 0) LIT.push([xl, zl, 5]);
  }
  A.frame();
  // inside: boards on the floor, a lit ceiling, the round core, exhibition boards, low book shelves along the glass, tables, a desk
  A.ring(M.roomFloor, cx, cz, 0, rd - 0.1, PL + 0.012, 0, TAU, 24).ring(M.roomCeil, cx, cz, 0, rd - 0.02, yc, 0, TAU, 24, -1).arc(M.roomWall, cx, cz, 1.25, PL, yc, 0, TAU, 16);
  N.ring(M.lamp, cx, cz, 1.32, 1.5, yc - 0.01, 0, TAU, 24, -1); N.frame();
  for (let k = 0; k < 8; k++) { const [x, z] = pt((k + 0.5) / 8 * TAU, 3.5); N.cyl(M.lamp, x, yc - 0.03, z, 0.16, 0.03, 10); }
  for (const k of [0, 2, 3, 4, 5]) { T.on(tang(k / 6 * TAU + 0.5, 1.27, 1.0)); N.wall(M.printsLit, 0.05, 0.95, 0.85, 2.2, 0, PR.uv['poster' + (k % 4)]); }
  T.on(tang(ad - 2.6, 1.27, 1.0)); N.wall(M.printsLit, 0.05, 0.95, 0.06, 2.16, 0, PR.uv.doorTimber).wall(M.prints, 0.25, 0.75, 2.2, 2.36, 0, PR.uv['p:储藏室']);
  ctx.collide(prism(circlePoints(cx, cz, 1.25, 10), 0, yc, null));
  for (const [k, a] of [[0, 1.65], [1, 2.3], [2, 2.95]]) {                                // exhibition boards on legs, posters on both faces
    const F = tang(a, 3.5, 1.9); T.on(F);
    N.box(M.frame, 0.95, 1.3, 0, 1.9, 1.5, 0.06, keep('SNEWUD')).box(M.dark, 0.15, 0.3, 0, 0.05, 0.6, 0.4, keep('SNEW')).box(M.dark, 1.75, 0.3, 0, 0.05, 0.6, 0.4, keep('SNEW'));
    N.wall(M.printsLit, 0.1, 0.9, 0.68, 1.92, 0.035, PR.uv['poster' + k]).wall(M.printsLit, 1.0, 1.8, 0.68, 1.92, 0.035, PR.uv['poster' + (k + 1) % 4]).back(M.printsLit, 0.1, 0.9, 0.68, 1.92, -0.035, PR.uv['poster' + (k + 2) % 4]).back(M.printsLit, 1.0, 1.8, 0.68, 1.92, -0.035, PR.uv['poster' + (k + 3) % 4]);
    col.on(F).box('generic', 0.95, 1.0, 0, 1.9, 2.0, 0.2);
  }
  for (let i = 19; i < 29; i++) {                                                         // low shelves under the east and north glazing
    const F = tang((i + 0.5) * da, rd - 0.5, 1.3, -1); T.on(F);
    N.box(M.wood, 0.65, 0.58, -0.17, 1.3, 1.1, 0.34, keep('SEWU')).wall(M.printsLit, 0.03, 1.27, 0.08, 1.06, 0.005, PR.uv.books);
    col.on(F).box('generic', 0.65, 0.55, -0.17, 1.3, 1.1, 0.36);
  }
  for (const a of [5.85, 0.45]) {                                                         // reading tables with stools
    const [x, z] = pt(a, 3.2); N.frame(); N.cyl(M.wood, x, 0.7, z, 0.6, 0.05, 16).cyl(M.dark, x, PL, z, 0.07, 0.66, 8, false).cyl(M.dark, x, PL, z, 0.3, 0.03, 12);
    for (let q = 0; q < 4; q++) N.cyl(paint(0xd8a23a, 0.6), x + 0.95 * Math.cos(q * 1.57 + a), PL, z + 0.95 * Math.sin(q * 1.57 + a), 0.18, 0.44, 10);
    col.frame(); col.box('generic', x, 0.38, z, 0.9, 0.76, 0.9);
  }
  { const F = tang(3.45, 3.7, 2.0, -1); T.on(F); N.box(M.wood, 1.0, 0.52, -0.3, 2.0, 1.05, 0.6, keep('SNEWU')).box(M.frame, 1.0, 1.07, -0.3, 2.1, 0.04, 0.7, keep('SNEWUD')); col.on(F).box('generic', 1.0, 0.55, -0.3, 2.0, 1.1, 0.6); }
  // under the disc: benches between the columns, a pair of lamps along the path
  N.frame(); col.frame();
  for (const a of [0.5236, 1.0472, 2.618, 5.76]) { const [x, z] = pt(a, 6.75); bench(N, col, x, z, Math.PI / 2 - a); }
  for (const t of [-2.4, 2.4]) gardenLamp(N, col, cx + ux * 12.5 - uz * t, cz + uz * 12.5 + ux * t);
  // colliders: the upper storeys, the roof disc (the ground-storey walls, the leaves and the furniture are boxes in col)
  ctx.collide(prism(circlePoints(cx, cz, rd, 24), sh - 0.05, top, null));
  ctx.collide(prism(circlePoints(cx, cz, Rd, 20), top, h, null));
  if (ctx.occupy) { ctx.occupy(circlePoints(cx, cz, rp + 0.4, 16)); ctx.occupy([[rp, -2.8], [24.5, -2.8], [24.5, 2.8], [rp, 2.8]].map(([r, t]) => [cx + ux * r - uz * t, cz + uz * r + ux * t])); }
  if (ctx.place) ctx.place('圆亭', cx + ux * 21, cz + uz * 21, Math.atan2(-ux, uz) * 180 / Math.PI, 0, false, 0.12);
}

/**
 * The block west of the clock tower (2022 frame 60). Its ground storey is drawn OPEN on columns between two solid end
 * cores (ASSUMED, see the header) and finished as an undercroft (IMAGINED): paving, tiled columns on granite bases, beams,
 * lights, benches, notice boards, bicycles, a shop front in the west core and a lift lobby in the east core.
 * Returns the collider meshes of the block itself.
 */
function pergolaBlock(T, pts, p, axisX, low, col) {
  const r = rectOf(pts), h = p.height, top = h - 1.2, yRoof = h - 0.6, strip0 = r.s - p.pergolaStripDepthM, n = p.look.storeys, sh = top / n, bay = 4.2, core = 5.2, G = T.a, N = T.n;
  const W = r.e - r.w, D = r.s - r.n, FS = mkFrame(r.w, r.s, 1, 0, W), FN = mkFrame(r.e, r.n, -1, 0, W), FE = mkFrame(r.e, r.s, 0, -1, D), FW = mkFrame(r.w, r.n, 0, 1, D);
  const o = { wall: M.render, band: null, bay: 2.1, ww: 1.6, wh: 1.9, sill: 0.95, d: low ? 0 : 0.12, kind: 'slide', sills: true, frame: M.frame };
  for (let k = 1; k < n; k++) { T.on(FN); SCHEMES.ribbon(T, W, k * sh, sh, { ...o, kind: 'band', wh: 1.9 }); T.on(FS); SCHEMES.punched(T, W, k * sh, sh, o); }
  for (let k = 0; k < n; k++) { T.on(FW); SCHEMES.punched(T, D, k * sh, sh, { ...o, bay: 3.8 }); }
  for (const F of [FN, FS, FW]) { T.on(F); G.wall(M.render, 0, F.L, top, h); }
  // ground storey: the two end cores (a door in the south face of the west one)
  const xa = r.w + core, xb = r.e - core, zm = (r.n + r.s) / 2, oc = { ...o, bay: 2.6, ww: 1.5, wh: 1.6 };
  T.on(FN.sub(0, core)); SCHEMES.punched(T, core, 0, sh, oc); T.on(FN.sub(W - core, W)); SCHEMES.punched(T, core, 0, sh, oc); T.on(FS.sub(W - core, W)); SCHEMES.punched(T, core, 0, sh, oc);
  T.on(FS.sub(0, 1.4)); SCHEMES.blank(T, 1.4, 0, sh, o); T.on(FS.sub(3.8, core)); SCHEMES.blank(T, core - 3.8, 0, sh, o); { const Fd = FS.sub(1.4, 3.8); T.on(Fd); ENTRY.door(T, 2.4, sh, o, { plate: 'n:1' }, Fd); }
  // inner faces of the cores: a shop front and a lift lobby behind glass
  const FWi = mkFrame(xa, r.s, 0, -1, D), FEi = mkFrame(xb, r.n, 0, 1, D), s0 = D - 8.6, s1 = D - 1.4, l0 = D / 2 - 3, l1 = D / 2 + 3;
  T.on(FWi); G.wall(M.render, 0, s0, 0, sh).wall(M.render, s1, D, 0, sh); T.on(FWi.sub(s0, s1)); shopfront(T, s1 - s0, 2.75, sh, M.render, 'shop');
  N.wall(M.prints, 2.8, 4.4, 2.88, 3.48, 0.03, PR.uv['p:小卖部']);
  T.on(FEi); G.wall(M.render, 0, l0, 0, sh).wall(M.render, l1, D, 0, sh); T.on(FEi.sub(l0, l1)); shopfront(T, l1 - l0, 2.75, sh, M.render, 'lobby');
  // undercroft: paving with granite margins, soffit, beams on tiled columns with granite bases, lights
  G.poly(M.granite, [[xa, r.n - 0.5], [xb, r.n - 0.5], [xb, r.n + 0.7], [xa, r.n + 0.7]], 0.05).poly(M.grate, [[xa, r.n + 0.7], [xb, r.n + 0.7], [xb, r.n + 0.86], [xa, r.n + 0.86]], 0.05).poly(M.ground, [[xa, r.n + 0.86], [xb, r.n + 0.86], [xb, r.s - 0.86], [xa, r.s - 0.86]], 0.05).poly(M.grate, [[xa, r.s - 0.86], [xb, r.s - 0.86], [xb, r.s - 0.7], [xa, r.s - 0.7]], 0.05).poly(M.granite, [[xa, r.s - 0.7], [xb, r.s - 0.7], [xb, r.s + 0.5], [xa, r.s + 0.5]], 0.05);
  G.poly(M.ceil, [[xa, r.n], [xb, r.n], [xb, r.s], [xa, r.s]], sh, -1);
  for (const z of [r.n + 0.3, r.s - 0.3]) G.box(M.render, (xa + xb) / 2, sh - 0.25, z, xb - xa, 0.5, 0.4, keep('SND'));
  const cols = new Batch(), half = Math.ceil((xb - xa) / bay / 2) + 1; T.m.frame();
  for (let k = -half; k < half; k++) {                // column lines half a bay either side of the plaza axis, so the axis stays free
    const x = axisX + (k + 0.5) * bay; if (x < xa + 1 || x > xb - 1) continue;
    G.box(M.render, x, sh - 0.2, zm, 0.3, 0.4, D - 1.0, keep('EWD'));
    for (const z of [r.n + 0.3, r.s - 0.3]) { G.box(M.white, x, sh / 2 + 0.2, z, 0.5, sh - 0.4, 0.5, keep('EWSN')).box(M.granite, x, 0.225, z, 0.62, 0.45, 0.62, keep('EWSNU')); cols.box('generic', x, sh / 2, z, 0.5, sh, 0.5); }
    if (x + bay / 2 < xb - 1) { for (const z of [zm - 3.2, zm + 3.2]) T.m.box(M.lamp, x + bay / 2, sh - 0.015, z, 1.2, 0.03, 0.28, keep('D')); LIT.push([x + bay / 2, zm, 5.5]); }
  }
  // furniture: benches along the column rows (the axis bay stays free), notice boards, bicycles, bins
  N.frame(); col.frame();
  for (const k of [-3, -2, 2, 3]) { const x = axisX + k * bay; if (x > xa + 2 && x < xb - 2) { bench(N, col, x, r.n + 1.25, 0); if (Math.abs(k) === 2) bench(N, col, x, r.s - 1.25, Math.PI); } }
  noticeBoard(N, col, xa + 0.5, r.s - 3.5, Math.PI / 2, 3, 0, '宣传栏'); noticeBoard(N, col, xb - 0.5, r.n + 2.4, -Math.PI / 2, 2, 5, '通知');
  bikeRack(N, col, xb - 1.35, r.s - 2.6, -Math.PI / 2, 5, 7); bins(N, col, xa + 0.5, r.s - 6.2, Math.PI / 2);
  // east end: dark green glazing with white floor bands, white fins at its south end (frame 60)
  T.on(FE); const fin = Math.min(3.8, D * 0.3), g0 = fin, g1 = D - 1.0, nt = Math.max(1, Math.round((g1 - g0) / 2.2)), tw = (g1 - g0) / nt;
  G.wall(M.render, 0, g0, 0, h).wall(M.render, g1, D, 0, h).wall(M.granite, g0, g1, 0, 0.6).wall(M.render, g0, g1, top, h);
  for (let k = 0; k < n; k++) for (let i = 0; i < nt; i++) G.wall(M.win, g0 + i * tw, g0 + (i + 1) * tw, Math.max(0.6, k * sh + 0.15), (k + 1) * sh - 0.15, 0, cellUV('cw', R() < 0.6 ? 0 : 1));
  for (let k = 1; k <= n; k++) G.box(M.frame, (g0 + g1) / 2, k * sh, 0.04, g1 - g0, 0.3, 0.08, keep('SUD'));
  for (let f = 0; f < 4; f++) G.box(M.frame, 0.35 + f * 0.95, (2 * sh + h) / 2, 0.3, 0.18, h - 2 * sh, 0.6, keep('SEWUD'));
  // roof: flat part, the deck under the pergola, parapet, five framed panels of slats on posts
  G.poly(roofPaint(p), [[r.w, r.n], [r.e, r.n], [r.e, strip0], [r.w, strip0]], yRoof).poly(M.deck, [[r.w, strip0], [r.e, strip0], [r.e, r.s], [r.w, r.s]], yRoof);
  for (const F of [FN, FS, FE, FW]) { T.on(F); G.box(M.cope, F.L / 2, (yRoof + h) / 2, -0.13, F.L, h - yRoof, 0.26, keep('UN')); }
  roofKit(T, 'stair', [FN, { L: D - p.pergolaStripDepthM - 0.6 }], yRoof, low);
  const np = 5, pb = (W - 1) / np, z0 = strip0 + 0.4, z1 = r.s - 0.5, yb = h + 0.35; G.frame(); T.m.frame();
  for (let i = 0; i < np; i++) {
    const x0 = r.w + 1 + i * pb, x1 = x0 + pb - 1.0, xm = (x0 + x1) / 2, zc = (z0 + z1) / 2;
    G.box(M.slat, xm, yb, z0, x1 - x0, 0.3, 0.2, keep('SNUD')).box(M.slat, xm, yb, z1, x1 - x0, 0.3, 0.2, keep('SNUD')).box(M.slat, x0, yb, zc, 0.2, 0.3, z1 - z0, keep('EWUD')).box(M.slat, x1, yb, zc, 0.2, 0.3, z1 - z0, keep('EWUD'));
    for (const [x, z] of [[x0, z0], [x1, z0], [x0, z1], [x1, z1]]) G.box(M.slat, x, (yRoof + yb) / 2, z, 0.16, yb - yRoof, 0.16, keep('SNEW'));
    for (let x = x0 + 0.45; x < x1 - 0.2; x += 0.45) T.m.box(M.slat, x, yb + 0.02, zc, 0.07, 0.2, z1 - z0 - 0.2, keep('EWUD'));
  }
  const cg = cols.build(); cg.updateMatrixWorld(true);
  return [prism(pts, sh, yRoof, null), prism([[r.w, r.n], [xa, r.n], [xa, r.s], [r.w, r.s]], 0, sh, null), prism([[xb, r.n], [r.e, r.n], [r.e, r.s], [xb, r.s]], 0, sh, null), ...cg.children];
}

export function build(ctx) {
  const low = !!ctx.lowPower; materials(low); R = rng(4711);
  const always = {}, col = new Geo();                  // one Geo per group (core, south, north, west): always drawn; col: boxes nobody can walk through
  for (const b of DATA) {
    const T = new Tiers(always[b.group] ||= new Geo()); T.pots = [];
    const polys = b.parts.map(p => (p.shape === 'circle' ? null : ordered(outline(b, p, ctx.campus))));
    let x0 = Infinity, x1 = -Infinity, z0 = Infinity, z1 = -Infinity;
    b.parts.forEach((p, i) => {
      const pts = polys[i] || outline(b, p, ctx.campus), kind = p.look.kind;
      for (const [x, z] of pts) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); z0 = Math.min(z0, z); z1 = Math.max(z1, z); }
      if (kind === 'pavilion') return pavilion(T, p, col, ctx);
      if (kind === 'drum') { drum(T, p); return ctx.collide(prism(pts, 0, p.height - 0.6, null)); }
      if (kind === 'pergola-block') {
        const r = rectOf(pts), canopy = itemBox(ctx.campus, 'plaza-canopy');
        pergolaBlock(T, pts, p, canopy ? (canopy.w + canopy.e) / 2 : (r.w + r.e) / 2, low, col).forEach(m => ctx.collide(m));
        return;
      }
      const { C, sh, yRoof } = block(T, b, p, pts, polys.filter((q, j) => q && j !== i), low, ctx);
      // one solid up to the roof plane (top face included); where a passage runs through, the storeys above it and the two ground pieces
      if (!C.cut && !C.open) return ctx.collide(prism(pts, 0, yRoof, null));
      ctx.collide(prism(pts, sh, yRoof, null));
      if (C.cut) { const r = rectOf(pts), q = (lo, hi) => (C.cut.axis ? [[r.w, lo], [r.e, lo], [r.e, hi], [r.w, hi]] : [[lo, r.n], [hi, r.n], [hi, r.s], [lo, r.s]]);
        ctx.collide(prism(q(C.cut.axis ? r.n : r.w, C.cut.a), 0, sh, null)); ctx.collide(prism(q(C.cut.b, C.cut.axis ? r.s : r.e), 0, sh, null)); }
    });
    if (b.id === 'south-court-complex') {                                   // bicycle shed along the north face, the gateway's forecourt with two lamps
      bikeShed(T, col, ctx, 98, 88.9, 0, 12, 3);
      T.a.poly(M.ground, [[77.3, 84.5], [81.2, 84.5], [81.2, 90.8], [77.3, 90.8]], 0.06); T.n.frame(); col.frame(); gardenLamp(T.n, col, 76.2, 90.2); gardenLamp(T.n, col, 82.3, 90.2); bins(T.n, col, 83.6, 91.6, 0, true);
      if (ctx.occupy) ctx.occupy([[75.5, 84], [83, 84], [83, 92.3], [75.5, 92.3]]);
    } else if (b.id === 'south-e-complex') bikeShed(T, col, ctx, 86, 147.9, 0, 12, 9);
    else if (b.id === 'south-low-link') { T.n.frame(); col.frame(); bins(T.n, col, 51.3, 109.9, 0); if (ctx.occupy) ctx.occupy([[50.4, 109.2], [52.2, 109.2], [52.2, 110.6], [50.4, 110.6]]); }
    // what is only worth drawing from nearer by
    const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, rad = Math.hypot(x1 - x0, z1 - z0) / 2;
    if (T.pots.length) {                                                    // stone planters with clipped shrubs beside the glazed entrances
      T.n.frame(); col.frame(); for (const [x, z, ang] of T.pots) planter(T.n, col, x, z, ang, 1.1, 0.7, 0.5);
      const sh = shrubs(T.pots.map(([x, z]) => [x, z, 0.42]), { seed: 5 + T.pots.length }); sh.position.y = 0.42; ctx.add(sh); ctx.detail(sh, cx, cz, 90 + rad);
      if (ctx.occupy) for (const [x, z] of T.pots) ctx.occupy([[x - 0.9, z - 0.9], [x + 0.9, z - 0.9], [x + 0.9, z + 0.9], [x - 0.9, z + 0.9]]);
    }
    for (const [G, range, tag] of [[T.m, 190, 'mid'], [T.n, 75, 'near']]) {
      const g = mergeFlat(G.build({ name: 'context-' + b.id + '-' + tag, castShadow: false }), false);
      if (g.children.length) { ctx.add(g); ctx.detail(g, cx, cz, range + rad); }
    }
  }
  for (const [name, G] of Object.entries(always)) {
    const casts = !low || name === 'core' || name === 'south';              // phones: only the groups near the track cast shadows
    ctx.add(mergeFlat(G.build({ name: 'context-' + name, castShadow: casts }), casts));
  }
  const cg = col.build({ name: 'context-colliders' }); cg.updateMatrixWorld(true); cg.children.forEach(m => ctx.collide(m));
  // after dusk: the facade sheet lights up room by room, and the rooms behind clear glass are lit
  if (ctx.animate) ctx.animate((dt, t, env) => {
    const night = env && env.lighting && env.lighting.night ? env.lighting.night() : 0;
    M.win.emissiveIntensity = 1.25 * night; for (const [m, base, gain] of ROOM) m.emissiveIntensity = base + gain * night;
  });
  // Plain paving under the south group where the landscape module's survey window ends (z 150): schematic, see the header.
  const [w, e, n, s] = APRON; ctx.add(flat([[w, n], [e, n], [e, s], [w, s]], 0.015, mat('paving')));
}
