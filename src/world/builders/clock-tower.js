// Clock tower south-east of the plaza canopy. Everything is derived from item.points (the shaft) and item.height (top of
// the dark-red cap); the heights below are given for the stored 41 m and scale with item.height.
//
// SEEN in the 2018 footage (frames 6 to 10 and the frames between them, from the north-east round to the east; frames 43
// and 53 from the running track in the west) and checked against one 2018 frame, 27.5 s into the footage, whose camera
// position was reconstructed from the corners of the south slab's roof (camera due east of the tower, about 21.5 px per
// metre on the shaft; the tower's position and heights in campus-data.js come from that reconstruction):
//   - lower shaft: plain white up to about 26.5 m; on the east face one small three-pane window at about 17.7 to 19.3 m, in
//     the northern half of the face;
//   - fin section, about 26.5 m to the platform: on the east face the southern 1.2 m is solid white, the rest is green glass
//     behind four white vertical fins; from the west the same level shows white uprights with pale gaps;
//   - a green glazed panel on the north face, about 2.8 m long from the north-east corner, from about 24.3 to 30 m (seen
//     foreshortened from the north-east, edge-on and invisible from the east);
//   - a thin platform slab at about 32.1 m, about 1 m beyond the shaft to the east, less to the north, 1 to 2.6 m to the
//     south (the larger readings probably include the stair's top landing);
//   - the head stands on the south part of the platform and is narrower than the shaft: a thin north-south panel about
//     4.2 m long and 8.9 m high. Seen from the east: a dark-red pier 0.85 m wide at the south end, which stands outside
//     the shaft's south face and runs down below the platform to the base of the fin section; a white panel 3.4 m wide with
//     the school emblem (a diamond about 2.4 m across, its centre about a third of the way down the white part); a dark-red
//     cap 2.3 m high over both. Seen from the west the whole head is red-orange with a pale round disc near the top (too
//     soft in the footage to read; here it is the west clock face);
//   - a thin mast at the south end of the cap, with a small ladder-like frame at its foot, top at about 46 m;
//   - an open stair on the south side, one lane wide, its treads seen head-on from the east in three groups, the highest at
//     platform level; its lowest visible landing is at about 24.9 m, with a white post under it. What it stands on below
//     that is hidden in every frame. The only building it can start from is the five-storey block that runs west from the
//     tower along the canopy's south edge: core-pergola-block of data/context.json, built by extras/context.js (it is not
//     an item of campus-data.js). Its roof, at about 20 m, lies beside the tower's west and south-west sides.
//
// ASSUMED: how far west the head stands on the platform (the two views disagree; it is drawn in the middle of the shaft,
//   0.8 m thick); the west face of the fin section (drawn like the east face); the stair's flights (2.4 m each; the footage
//   reads as one zig-zag lane, drawn as two lanes of 1.05 m side by side because one lane leaves no headroom on the way up);
//   everything below about 17 m (hidden in every frame).
//
// IMAGINED (the owner asked for a finished tower and said that imagination should fill in what no reference shows):
//   - the CLOCK: a dial where the footage shows the pale disc on the west face and a second one on the east face under the
//     emblem; ticks without numerals; the hands show the page's time of day and the dials are lit from inside after dusk;
//   - a dark granite-tile plinth, joints round the shaft at every 3.9 m, a steel door on the east face with a canopy, two
//     steps and a lamp, aluminium louvres on the south wall of the fin section and high on the west face, a rainwater
//     pipe, a lightning conductor down the south-west corner, corbels under the platform, a rail all round it, a red
//     obstruction light on the mast, two floodlights at the foot;
//   - THE WAY UP (second refinement round): the stair can be climbed from the ground to the platform. The neighbouring roof
//     (core-pergola-block, built by extras/context.js) has no way up to it, so the stair cannot start there; it starts
//     inside the tower instead. The east door stands open; behind it a dog-leg stair of terrazzo flights runs up the west
//     half of the shaft round a narrow well (six storeys of 3.7 m, landings at the south wall with their heights on small
//     plates, bulkhead lamps, a guard on the open side; the strip east of the stair is open from floor to ceiling and lit by
//     the seen window high on the east face; a meter cabinet and an extinguisher at the foot) to a door in the south face at
//     22.5 m. Outside, the stair is a dog-leg in two lanes against the south face: one flight more than was seen (22.5 to
//     24.9 m), then the three seen flights to the platform; landings at the ends on brackets, a lamp over each, rails and
//     guards; two white columns from the ground carry the outer corners, tied back to the shaft at every second storey joint
//     (frame 10 shows a white post under the lowest seen landing; what it stands on is hidden). The platform's rail has a gap
//     where the top flight arrives at its south-west corner. The old visual leg down to the neighbouring roof is gone;
//   - the emblem itself is the simplified drawing of signs.js.
// Colliders: the shaft's walls round their two doorways, its floor and solid top, the inner stair (ramps, landings, guards),
// the outer flights (one slope each), landings, guards 1.75 m tall (a jump clears 1.1 m), the two columns, the platform
// slab and its rail, the head: a player leaving drone mode above the tower lands on the cap or on the platform.
// Lamps: none of the stair's lamps is entered in LIT (street.js): they hang 20 to 32 m above open ground, where a pool of
// light on the ground would be wrong.
import { THREE, bbox } from '../../kit.js';
import { emblemTexture } from '../../signs.js';
import { LIT } from '../../street.js';
import { fuse } from './plaza.js';
import { F, lm, shell, finish, hit, facade, face, louvre, stain, rwp, ramp, apron, stair, pierce, card, textCard } from './plain-block.js';

let MAT = null;
function materials() {
  if (MAT) return MAT;
  const S = 256, c = document.createElement('canvas'); c.width = c.height = S; const g = c.getContext('2d');
  g.fillStyle = '#20242a'; g.beginPath(); g.arc(S / 2, S / 2, S / 2 - 1, 0, 6.2832); g.fill();
  g.fillStyle = '#f7f5ec'; g.beginPath(); g.arc(S / 2, S / 2, S / 2 - 12, 0, 6.2832); g.fill();
  for (let i = 0; i < 60; i++) {                          // ticks, no numerals
    const a = i / 60 * 6.2832, hour = i % 5 === 0, quarter = i % 15 === 0, r0 = S / 2 - (quarter ? 44 : hour ? 36 : 24), r1 = S / 2 - 18;
    g.strokeStyle = '#20242a'; g.lineWidth = quarter ? 9 : hour ? 6 : 2; g.beginPath(); g.moveTo(S / 2 + Math.cos(a) * r0, S / 2 + Math.sin(a) * r0); g.lineTo(S / 2 + Math.cos(a) * r1, S / 2 + Math.sin(a) * r1); g.stroke();
  }
  const dial = new THREE.CanvasTexture(c); dial.colorSpace = THREE.SRGBColorSpace; dial.anisotropy = 8;
  const mk = (name, o) => { const m = new THREE.MeshStandardMaterial(o); m.name = name; return m; };
  MAT = {
    dial: mk('tower-dial', { map: dial, alphaTest: 0.5, transparent: false, roughness: 0.5, emissive: 0xfff1d0, emissiveMap: dial, emissiveIntensity: 0.03 }),
    hand: mk('tower-hands', { color: 0x16181b, roughness: 0.4, metalness: 0.3 }),
    emblem: mk('tower-emblem', { map: emblemTexture('#f2f0e9'), roughness: 0.75 }),
    beacon: mk('tower-beacon', { color: 0x7a1410, roughness: 0.5, emissive: 0xff2a18, emissiveIntensity: 0.6 }),
  };
  // the dial is a round card: clear outside the bezel
  const im = g.getImageData(0, 0, S, S), dd = im.data; for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) if (Math.hypot(x - S / 2 + 0.5, y - S / 2 + 0.5) > S / 2 - 0.5) dd[(y * S + x) * 4 + 3] = 0;
  g.putImageData(im, 0, 0); dial.needsUpdate = true;
  return MAT;
}

export function build(item, ctx) {
  const S = shell(ctx), r = bbox(item.points), H = item.height, k = H / 41, sx = r.sx, sz = r.sz, M = materials();
  const yF = H - 14.5 * k, yP = H - 8.9 * k, tP = 0.35, yCap = H - 2.3 * k, hF = yP - tP - yF, yPl = 0.9;     // fin base, platform top, cap underside, plinth top
  const W = lm('white'), WH = lm('frame'), MR = lm('maroon'), GG = lm('glassGreen'), FR = lm('frame'), CO = lm('concrete'), RA = lm('rail'), CP = lm('cope'), BS = lm('base'), AL = lm('alu'), SH = lm('shade');
  const PE = face('E', r.e), PW = face('W', r.w), PN = face('N', r.n), PS = face('S', r.s);

  // ---- lower shaft: four walls with their openings; plinth; joints at every storey height
  const E = facade(S, 'E', r.e, r.n, r.s, 0, yF, { mat: W }), Wf = facade(S, 'W', r.w, r.n, r.s, 0, yF, { mat: W });
  const N = facade(S, 'N', r.n, r.w, r.e, 0, yP - tP, { mat: W }), Sf = facade(S, 'S', r.s, r.w, r.e, 0, yP - tP, { mat: W });
  E.win(r.n + sz * 0.13, r.n + sz * 0.51, H - 23.3 * k, H - 21.7 * k, { n: 2, glass: lm('glassWin') });                 // the small three-pane window (SEEN)
  // the stair's levels: the external stair (SEEN from the landing at yL upward) starts one flight lower, at a door in the south
  // face (yD); below that the way up runs inside the shaft from the east door (IMAGINED, see the header)
  const yL = H - 16.1 * k, rise = (yP - yL) / 3, yD = yL - rise, yIn = 0.3, yTopIn = yD + 2.45, wt = 0.25;
  const dS = { uc: r.w + wt + 0.55, w: 0.9 };                                                                              // the door in the south face
  E.door(r.cz, { w: 1.2, h: 2.15, y0: 0.3, canopy: 0.9, leaf: lm('green'), stepOut: 0.9, swing: 'in', t: wt, rev: 0.12 });
  Sf.door(dS.uc, { w: dS.w, h: 2.05, y0: yD, swing: 'in', t: wt, rev: 0.12, leaf: lm('green'), step: false, canopy: 0.6, plate: false });
  PE(S.v, lm('concrete'), r.cz - 1.1, r.cz + 1.1, 0, 0.16, 0, 1.3, 'FLRU'); apron(ctx, 'E', r.e, r.cz, 2.8, 1.6);           // lower step
  // A clearing for the view of the tower from the south (the menu place 钟楼下 stands at its south end, 4 m west and 18 m south of
  // the shaft's centre): the grounds (extras/landscape.js) keep their trees and lamps off this strip. Nothing is built on it.
  // The gate scene's avenue trees (extras/gate.js) heed it too.
  if (ctx.occupy) ctx.occupy([[r.cx - 6.2, r.cz + 20.2], [r.cx - 1.8, r.cz + 20.2], [r.cx + 2.9, r.s + 0.65], [r.w + 0.1, r.s + 0.65], [r.w - 0.1, r.cz + 10.55]]);
  const gx0 = r.e - 0.3 - Math.min(2.8, sx - 0.6), gx1 = r.e - 0.3, gy0 = H - 16.7 * k, gy1 = H - 11 * k;
  N.win(gx0, gx1, gy0, gy1, { n: 2, transom: (gy1 - gy0) / 2, glass: GG, sill: false, rev: 0.12 });                       // green glazed panel on the north face (SEEN)
  for (const f of [0.25, 0.75]) PN(S.v, FR, gx0, gx1, gy0 + (gy1 - gy0) * f - 0.02, gy0 + (gy1 - gy0) * f + 0.02, -0.12, -0.08, 'FUD');
  Sf.holes.push(louvre(S, PS, r.w + 1.3, r.e - 1.3, yF + 0.8, yP - tP - 0.9, { far: true, pitch: 0.16 }));               // belfry louvres
  Wf.holes.push(louvre(S, PW, r.cz - 0.8, r.cz + 0.8, H - 21.5 * k, H - 20.3 * k, { far: true }));
  E.done(); Wf.done(); N.done(); Sf.done();
  F(S.v, W, r.w, yF - 0.02, r.n, sx, 0.02, sz, 'U');
  for (const [put, a, b] of [[PN, r.w, r.e], [PS, r.w, r.e], [PW, r.n, r.s]]) { put(S.v, BS, a - 0.05, b + 0.05, 0, yPl, 0, 0.05, 'FLRU'); put(S.v, CP, a - 0.07, b + 0.07, yPl, yPl + 0.06, 0, 0.07, 'FLRUD'); }
  for (const [a, b] of [[r.n - 0.05, r.cz - 0.67], [r.cz + 0.67, r.s + 0.05]]) { PE(S.v, BS, a, b, 0, yPl, 0, 0.05, 'FLRU'); PE(S.v, CP, a, b, yPl, yPl + 0.06, 0, 0.07, 'FLRUD'); }
  for (let y = 3.9; y < yF - 1; y += 3.9) for (const [put, a, b] of [[PN, r.w, r.e], [PS, r.w, r.e], [PW, r.n, r.s], [PE, r.n, r.s]]) put(S.v, SH, a, b, y - 0.012, y + 0.012, 0, 0.004, 'F');
  rwp(S, PW, r.n + 0.35, yF - 0.4); stain(S, PN, r.w, r.e, yF, 1.0); stain(S, PE, r.n, r.s, yF, 1.0);
  F(S.d, AL, r.w - 0.02, 0.3, r.s - 0.05, 0.03, yP - 0.3, 0.012, 'WNS'); F(S.d, AL, r.w - 0.03, 0.2, r.s - 0.08, 0.05, 0.12, 0.05, 'WNSU');   // lightning conductor
  // floodlights at the foot (they wash the shaft after dusk: here just the lamps and their pools)
  for (const [x, z] of [[r.e + 1.6, r.n + 0.8], [r.w - 1.2, r.n - 1.2]]) { F(S.d, lm('dark'), x - 0.16, 0, z - 0.12, 0.32, 0.2, 0.24, 'NSEWU'); F(S.d, lm('lamp'), x - 0.12, 0.2, z - 0.09, 0.24, 0.012, 0.18, 'U'); LIT.push([x, z, 3.5]); }

  // ---- fin section: solid south bay and north wall, green glass between them behind four fins on the east and west faces
  const zg0 = r.n + 0.5, zg1 = r.s - 1.2, pitch = (zg1 - zg0) / 5;
  for (const [put, x0] of [[PE, r.e - 0.55], [PW, r.w]]) {
    put(S.v, W, zg1, r.s, yF, yP - tP, -0.01, 0, 'F'); put(S.v, W, r.n, zg0, yF, yP - tP, -0.01, 0, 'F');
    put(S.v, GG, zg0, zg1, yF, yP - tP, -0.56, -0.55, 'F'); put(S.v, W, zg0 - 0.01, zg0, yF, yP - tP, -0.55, 0, 'R'); put(S.v, W, zg1, zg1 + 0.01, yF, yP - tP, -0.55, 0, 'L');
    put(S.v, CP, zg0, zg1, yF - 0.01, yF, -0.55, 0.05, 'UF');
    for (let j = 1; j <= 4; j++) { const z = zg1 - j * pitch - 0.09; F(S.v, WH, x0, yF, z, 0.55, hF, 0.18, put === PE ? 'NSE' : 'NSW'); }
    for (const f of [0.3, 0.62]) put(S.v, FR, zg0, zg1, yF + hF * f - 0.03, yF + hF * f + 0.03, -0.55, -0.5, 'FUD');             // transoms of the glass
  }

  // ---- platform on corbels, rail all round
  const px0 = r.w - 1.0, px1 = r.e + 1.0, pz0 = r.n - 0.6, pz1 = r.s + 1.0;
  F(S.v, CP, px0, yP - tP, pz0, px1 - px0, tP, pz1 - pz0, 'NSEWUD');
  for (const z of [r.n + 0.7, r.cz, r.s - 0.7]) for (const [put, d] of [[PE, 0.9], [PW, 0.9]]) { put(S.v, CP, z - 0.12, z + 0.12, yP - tP - 0.5, yP - tP, 0, d, 'FLRD'); }
  stain(S, PE, r.n, r.s, yP - tP - 0.5, 0.6);

  // ---- head: one dark-red slab (red west face, cap and south pier) with the white emblem panel on its east face
  const hx0 = r.cx - 0.4, hx1 = r.cx + 0.4, hz0 = r.s - 3.4 * Math.min(1, sz / 5.5), hz1 = r.s + 0.85;
  F(S.v, MR, hx0, yP, hz0, hx1 - hx0, H - yP, hz1 - hz0, 'NSEWU');
  F(S.v, MR, hx0, yF, r.s, hx1 - hx0, yP - tP - yF, hz1 - r.s, 'SEWD');                               // the pier below the platform
  F(S.v, lm('cope'), hx0 - 0.04, H, hz0 - 0.04, hx1 - hx0 + 0.08, 0.05, hz1 - hz0 + 0.08, 'NSEWU');
  F(S.v, W, hx1, yP, hz0 - 0.03, 0.12, yCap - yP, r.s - hz0 + 0.03, 'NSEU');
  const es = Math.min(2.5, (r.s - hz0) * 0.74), emblem = new THREE.Mesh(new THREE.PlaneGeometry(es, es), M.emblem);
  emblem.position.set(hx1 + 0.135, yCap - (yCap - yP) * 0.35, (hz0 + r.s) / 2); emblem.rotation.y = Math.PI / 2; S.vx.push(emblem);

  // ---- the clock: a dial on each long face of the head; four hands as one instanced mesh, set from the page's time
  const dr = 1.15 * k, dials = [{ x: hx0 - 0.03, y: H - 3.3 * k, z: (hz0 + hz1) / 2, n: -1 }, { x: hx1 + 0.14, y: yP + Math.max(dr + 0.2, (yCap - yP) * 0.22), z: (hz0 + r.s) / 2, n: 1 }];
  const dialMesh = new THREE.Mesh(fuse(dials.map(q => [new THREE.CircleGeometry(dr, 40), new THREE.Matrix4().makeRotationY(q.n * Math.PI / 2).setPosition(q.x + q.n * 0.02, q.y, q.z)])), M.dial);
  dialMesh.name = 'tower-dials'; S.vx.push(dialMesh);                                                  // both dials are one mesh; the bezel is part of the picture
  const hg = new THREE.BoxGeometry(1, 1, 1); hg.translate(0, 0.38, 0);                                // a hand: the pivot lies a little way up from its tail
  const hands = new THREE.InstancedMesh(hg, M.hand, 4); hands.name = 'tower-clock-hands'; hands.frustumCulled = false; S.vx.push(hands);
  const mx = new THREE.Matrix4(), qt = new THREE.Quaternion(), ax = new THREE.Vector3(1, 0, 0), pv = new THREE.Vector3(), sv = new THREE.Vector3();
  let shown = -1;
  const setHands = h => {
    const minute = Math.round(((h % 1) + 1) % 1 * 60) % 60, hour = ((Math.floor(h + 1e-6) % 12) + 12) % 12, key = hour * 60 + minute; if (key === shown) return; shown = key;
    const aM = minute / 60 * 2 * Math.PI, aH = (hour + minute / 60) / 12 * 2 * Math.PI;
    dials.forEach((q, i) => {
      // seen from outside the hands turn clockwise: on the east face that is a negative turn about +x, on the west face a positive one
      for (const [j, a, len, wid, off] of [[0, aH, dr * 0.62, 0.13 * k, 0.06], [1, aM, dr * 0.92, 0.085 * k, 0.09]]) {
        qt.setFromAxisAngle(ax, -q.n * a); hands.setMatrixAt(i * 2 + j, mx.compose(pv.set(q.x + q.n * off, q.y, q.z), qt, sv.set(0.03, len / 0.88, wid)));
      }
    });
    hands.instanceMatrix.needsUpdate = true;
  };
  setHands(9.2);
  if (ctx.animate) ctx.animate((dt, t, env) => {
    const L = env && env.lighting; if (!L) return;
    if (L.getTime) setHands(L.getTime());
    M.dial.emissiveIntensity = 0.03 + 0.95 * (L.night ? L.night() : 0);
  });

  // ---- mast at the south end of the cap: pole (always drawn), ladder-like frame and cross bars (near view), a red light
  const mxp = r.cx, mz = hz1 - 0.4, yM = H + 5.3 * k;
  S.v.frame(mxp, mz).cyl(AL, 0, H, 0, 0.06, yM - H, 6, false).cyl(M.beacon, 0, yM, 0, 0.11, 0.2, 8); S.v.frame();
  for (const [dx, dz] of [[-0.3, -0.25], [0.3, -0.25], [-0.3, 0.25], [0.3, 0.25]]) F(S.d, AL, mxp + dx - 0.025, H, mz + dz - 0.025, 0.05, 1.3, 0.05, 'NSEW');
  for (const y of [0.45, 0.9, 1.3]) { F(S.d, AL, mxp - 0.3, H + y - 0.02, mz - 0.27, 0.6, 0.04, 0.04, 'NSUD'); F(S.d, AL, mxp - 0.3, H + y - 0.02, mz + 0.23, 0.6, 0.04, 0.04, 'NSUD'); }
  for (const y of [1.9, 2.5, 3.1]) F(S.d, AL, mxp - 0.45, H + y * k, mz - 0.02, 0.9, 0.04, 0.04, 'NSUDEW');

  // ---- the way up (the treads from yL to the platform are SEEN; the rest is IMAGINED, see the header)
  // Inside the shaft: a dog-leg stair of terrazzo flights round a narrow well along the west wall, from the floor behind the
  // east door (0.3 m) up to the floor landing behind the door in the south face (yD); the strip east of the stair is open from
  // the floor to the ceiling, a slot of light lit by the seen window high on the east face. All of it is interior detail.
  const ix0 = r.w + wt, ix1 = r.e - wt, iz0 = r.n + wt, iz1 = r.s - wt, IN = { v: S.i, d: S.i, i: S.i, c: S.c, low: S.low };
  const nL = Math.max(2, Math.round((yD - yIn) / 3.6)), levels = Array.from({ length: nL + 1 }, (_, i) => yIn + (yD - yIn) * i / nL);
  const sw = 1.05, sgap = 0.1, landF = 1.1, landB = 1.1, room = iz1 - iz0 - landF - landB, nst = Math.max(6, Math.floor(room / 0.28)), sgo = room / nst;
  const ox = ix0 + 0.03 + sw + sgap / 2, oz = iz1 - landF, lx1 = ox + sgap / 2 + sw + 0.12;                         // stair frame: flights run north from oz; lane A (east) goes up from a floor
  stair(IN, { x: ox, z: oz, ang: Math.PI / 2, levels, w: sw, gap: sgap, steps: nst, go: sgo, landB, outer: true, outerEnd: false, tread: lm('terrazzo'), landing: lm('granite'), soffit: lm('plaster'), outerMat: lm('plaster') });
  const PL = lm('plaster'), GR = lm('granite'), LAMP = lm('lamp');
  F(S.i, lm('tread'), ix0, yIn - 0.02, iz0, ix1 - ix0, 0.02, iz1 - iz0, 'U'); F(S.d, lm('tread'), ix1, yIn - 0.02, r.cz - 0.6, wt, 0.02, 1.2, 'U');
  hit(S, ix0 + 0.01, 0, iz0 + 0.01, r.e + 0.01 - ix0 - 0.01, yIn, iz1 - iz0 - 0.02);                                  // the floor, through the doorway to the step outside
  for (let i = 1; i <= nL; i++) {                                                                                    // floor landings at the south wall, a guard on their open side
    const y = levels[i];
    F(S.i, GR, ix0, y - 0.02, oz, lx1 - ix0, 0.02, iz1 - oz, 'U'); F(S.i, PL, ix0, y - 0.2, oz, lx1 - ix0, 0.18, iz1 - oz, 'DN');
    hit(S, ix0 + 0.01, y - 0.2, oz, lx1 - ix0 - 0.01, 0.2, iz1 - oz - 0.01);
    F(S.i, PL, lx1 - 0.12, y, oz, 0.12, 1.05, iz1 - oz, 'EWNU'); F(S.i, lm('cope'), lx1 - 0.14, y + 1.05, oz, 0.16, 0.05, iz1 - oz, 'EWNUD'); hit(S, lx1 - 0.12, y + 0.01, oz + 0.01, 0.12, 1.74, iz1 - oz - 0.02);
    F(S.i, LAMP, ix0 + 0.01, y + 2.05, (oz + iz1) / 2 - 0.15, 0.06, 0.1, 0.3, 'ENSD');                                 // a bulkhead lamp on the west wall
    card(S.i, face('E', ix0), textCard(y.toFixed(1) + ' m', 0.34, 0.16, { bg: '#2f3338' }), oz + 0.66, oz + 1.0, y + 1.45, y + 1.61, 0.012);
  }
  const yT = levels[nL];                                                                                               // top: a guard over the opening of lane A
  F(S.i, PL, ox + sgap / 2, yT, oz - 0.12, sw, 1.05, 0.12, 'NSU'); hit(S, ox + sgap / 2 + 0.01, yT + 0.01, oz - 0.12, sw - 0.02, 1.74, 0.11);
  // the shaft's inner faces (plaster), its ceiling, the inside of the east window, things in the entrance
  const hE = E.holes.filter(h => h[2] < 1), hS = Sf.holes.filter(h => h[2] > yD - 0.5 && h[2] < yD + 0.5);
  pierce(S.i, PL, face('E', ix0), iz0, iz1, yIn, yTopIn, [], -0.01, 0, 'F'); pierce(S.i, PL, face('S', iz0), ix0, ix1, yIn, yTopIn, [], -0.01, 0, 'F');
  pierce(S.i, PL, face('W', ix1), iz0, iz1, yIn, yTopIn, [...hE, [r.n + sz * 0.13, r.n + sz * 0.51, H - 23.3 * k, H - 21.7 * k]], -0.01, 0, 'F');
  pierce(S.i, PL, face('N', iz1), ix0, ix1, yIn, yTopIn, hS, -0.01, 0, 'F');
  PE(S.i, lm('glassLobby'), r.n + sz * 0.13, r.n + sz * 0.51, H - 23.3 * k, H - 21.7 * k, -0.17, -0.16, 'B');
  for (const [a, c] of [[r.n + sz * 0.13 - 0.01, r.n + sz * 0.13], [r.n + sz * 0.51, r.n + sz * 0.51 + 0.01]]) PE(S.i, lm('cope'), a, c, H - 23.3 * k, H - 21.7 * k, -wt, -0.16, 'LR');
  F(S.i, lm('ceil'), ix0, yTopIn, iz0, ix1 - ix0, 0.02, iz1 - iz0, 'D'); F(S.i, LAMP, (lx1 + ix1) / 2 - 0.2, yTopIn - 0.02, r.cz - 0.2, 0.4, 0.02, 0.4, 'D');
  F(S.i, lm('alu'), ix1 - 0.3, yIn + 1.0, iz0 + 0.2, 0.3, 0.9, 0.6, 'WNSU'); F(S.i, lm('red'), ix1 - 0.18, yIn, iz1 - 0.5, 0.18, 0.55, 0.18, 'WNSU');   // a meter cabinet, an extinguisher
  F(S.i, LAMP, ix1 - 0.07, yIn + 2.6, r.cz - 0.15, 0.06, 0.1, 0.3, 'WNSD');
  hit(S, ix1 - 0.3, yIn + 1.0, iz0 + 0.21, 0.29, 0.9, 0.58);
  // shaft walls for the player: four walls with the two doorways, the floor behind them; solid from the ceiling up
  const dE = [r.cz - 0.62, r.cz + 0.62], dW = [dS.uc - dS.w / 2 - 0.08, dS.uc + dS.w / 2 + 0.08];
  hit(S, r.w, 0, r.n, wt - 0.01, yTopIn + 0.01, sz);                                                                    // west
  hit(S, r.w + 0.2, 0, r.n, sx - 0.4, yTopIn + 0.01, wt - 0.01);                                                     // north
  hit(S, r.e - wt + 0.01, 0, r.n, wt - 0.01, yTopIn + 0.01, dE[0] - r.n + 0.01); hit(S, r.e - wt + 0.01, 0, dE[1] - 0.01, wt - 0.01, yTopIn + 0.01, r.s - dE[1] + 0.01);
  hit(S, r.e - wt + 0.01, yIn + 2.3, dE[0], wt - 0.01, yTopIn - yIn - 2.3 + 0.01, dE[1] - dE[0]);                    // east, round its door
  hit(S, r.w + 0.2, 0, r.s - wt + 0.01, dW[0] - r.w - 0.2 + 0.01, yTopIn + 0.01, wt - 0.01); hit(S, dW[1] - 0.01, 0, r.s - wt + 0.01, r.e - 0.2 - dW[1] + 0.01, yTopIn + 0.01, wt - 0.01);
  hit(S, dW[0], 0, r.s - wt + 0.01, dW[1] - dW[0], yD, wt - 0.01); hit(S, dW[0], yD + 2.2, r.s - wt + 0.01, dW[1] - dW[0], yTopIn - yD - 2.2 + 0.01, wt - 0.01);   // south, round its door
  hit(S, r.w, yTopIn, r.n, sx, yP - tP - yTopIn + 0.01, sz);                                                            // from the ceiling to the platform: solid

  // Outside, on the south side: four flights in two lanes (a dog-leg against the wall: the treads of the upper three are SEEN),
  // landings at the ends on brackets from the shaft and two white columns, rails, a lamp at each landing.
  const TR = lm('tread'), ngo = 13;
  const zA0 = r.s + 0.95, zA1 = zA0 + 1.05, zB0 = zA1 + 0.1, zB1 = zB0 + 1.05;                                          // lane A next to the wall, lane B outside it
  const xa = r.w + 1.2, xb = r.e - 0.35, xw = px0, xe = px1, run = xb - xa, go = run / ngo, rs = rise / ngo;
  const flight = (z0, z1, y0, east) => {
    const xs = east ? xa : xb, xf = east ? xb : xa, up = east ? 1 : -1, zc = (z0 + z1) / 2;
    ramp(S.v, CO, [xs, y0 - 0.03, zc], [xf, y0 + rise - 0.03, zc], z1 - z0, 0.14, 'UDSN');                          // waist slab
    for (const z of [z0, z1 - 0.06]) ramp(S.v, WH, [xs, y0 + 0.14, z + 0.03], [xf, y0 + rise + 0.14, z + 0.03], 0.06, 0.38);   // white stringers
    for (let i = 0; i < ngo; i++) F(S.low ? S.v : S.d, TR, east ? xa + i * go : xb - (i + 1) * go, y0 + i * rs, z0 + 0.06, go, rs, z1 - z0 - 0.12, east ? 'UW' : 'UE');
    for (const z of [z0 + 0.03, z1 - 0.03]) {
      S.d.strut(RA, [xs, y0 + 0.95 + rs, z], [xf, y0 + rise + 0.95 + rs, z], 0.045); S.d.frame();
      for (const t of [0.08, 0.5, 0.92]) F(S.d, RA, xs + (xf - xs) * t - 0.02, y0 + rise * t + 0.1, z - 0.02, 0.04, 0.85 + rs, 0.04, 'NSEW');
    }
    ramp(S.c, 'generic', [xs - up * go / 2, y0, zc], [xf - up * go / 2, y0 + rise, zc], z1 - z0 - 0.02, 0.2);        // the slope the walker climbs
  };
  const landing = (x0, x1, z0, z1, y, lamp = true) => {
    F(S.v, CO, x0, y - 0.2, z0, x1 - x0, 0.2, z1 - z0, 'NSEWUD'); F(S.d, TR, x0 + 0.03, y, z0 + 0.03, x1 - x0 - 0.06, 0.012, z1 - z0 - 0.06, 'U');
    hit(S, x0 + 0.01, y - 0.2, z0 + 0.01, x1 - x0 - 0.02, 0.2, z1 - z0 - 0.02);
    const xm = Math.max(x0, Math.min(x1, r.cx)) === x0 ? x0 + 0.3 : x1 - 0.5;                                          // a bracket from the shaft under it
    F(S.v, WH, Math.max(x0, Math.min(x1 - 0.22, xm)), y - 0.62, r.s, 0.22, 0.42, z1 - r.s - 0.05, 'SEWD');
    if (lamp) F(S.d, LAMP, x0 < r.cx ? r.w + 0.45 : r.e - 0.75, y + 2.25, r.s, 0.3, 0.1, 0.07, 'SEWD');                // a bulkhead lamp on the wall above it
  };
  const rail = (x0, z0, x1, z1, y) => {                                                                               // a horizontal guard rail on posts along an axis-parallel line
    const alongX = Math.abs(x1 - x0) > Math.abs(z1 - z0), L = alongX ? x1 - x0 : z1 - z0, n = Math.max(1, Math.round(L / 1.2));
    for (const yy of [y + 1.0, y + 0.5]) F(S.d, RA, alongX ? x0 : x0 - 0.02, yy, alongX ? z0 - 0.02 : z0, alongX ? L : 0.04, yy > y + 0.7 ? 0.05 : 0.035, alongX ? 0.04 : L, alongX ? 'NSUD' : 'EWUD');
    for (let i = 0; i <= n; i++) F(S.d, RA, (alongX ? x0 + (L - 0.04) * i / n : x0 - 0.02), y, (alongX ? z0 - 0.02 : z0 + (L - 0.04) * i / n), 0.04, 1.0, 0.04, 'NSEW');
  };
  const y1 = yD + rise, y2 = yD + 2 * rise, y3 = yD + 3 * rise;
  flight(zA0, zA1, yD, true); flight(zB0, zB1, y1, false); flight(zA0, zA1, y2, true); flight(zB0, zB1, y3, false);
  landing(xw, xa, r.s, zA1, yD); landing(xb, xe, zA0, zB1, y1); landing(xw, xa, zA0, zB1, y2); landing(xb, xe, zA0, zB1, y3); landing(xw, xa, pz1, zB1, yP, false);
  F(S.v, CO, xw, yD - 0.2, r.s - 0.01, xa - xw, 0.2, 0.01, 'N');
  // visible rails on the open edges of the landings
  rail(xw, r.s, xw, zA1, yD); rail(xw, zA1, xa, zA1, yD);
  for (const y of [y1, y3]) { rail(xe, zA0, xe, zB1, y); rail(xb, zB1, xe, zB1, y); rail(xb, zA0, xe, zA0, y); }
  rail(xw, zA0, xw, zB1, y2); rail(xw, zB1, xa, zB1, y2); rail(xw, zA0, xa, zA0, y2);
  rail(xw, zB1, xa, zB1, yP); rail(xw, pz1, xw, zB1, yP); rail(xa, zA0, xa, zA1, yP);
  // guards for the player (1.75 m: a jump clears 1.1 m): along the wall side of lane A, outside lane B, in the well between
  // the lanes, at both ends; at the top they are the platform's south rail. A centimetre apart wherever they meet.
  hit(S, xa + 0.12, yD + 0.05, zA0 - 0.07, xe - xa - 0.12, yP + 1.75 - yD - 0.05, 0.06);
  hit(S, xw, yD + 2.3, zA0 - 0.07, xa + 0.11 - xw, yP - 0.3 - yD - 2.3, 0.06);
  hit(S, xw, yD + rise - 0.2, zB1 + 0.01, xe - xw, yP + 1.75 - yD - rise + 0.2, 0.06); hit(S, xw, yD - 0.2, zA1 + 0.01, xa - xw, 1.95, 0.06);
  hit(S, xa + 0.02, yD + 0.05, zA1 + 0.01, run - 0.04, yP + 1.75 - yD - 0.05, zB0 - zA1 - 0.02);
  hit(S, xw - 0.07, yD - 0.2, r.s + 0.01, 0.06, yP + 1.95 - yD, zB1 - r.s); hit(S, xe + 0.01, y1 - 0.2, zA0, 0.06, yP + 1.95 - y1, zB1 - zA0);
  hit(S, xa + 0.01, yP + 0.01, zA0, 0.06, 1.74, zA1 - zA0);
  // two white columns from the ground carry the outer corners (frame 10 shows a white post under the lowest seen landing)
  // tied back to the shaft at every second storey joint, so that they read as part of the tower's frame
  for (const x of [xw + 0.02, xe - 0.32]) {
    F(S.v, WH, x, 0, zB1 - 0.3, 0.3, yP - 0.2, 0.3, 'NSEW'); F(S.v, BS, x - 0.02, 0, zB1 - 0.32, 0.34, 0.5, 0.34, 'NSEWU'); hit(S, x, 0, zB1 - 0.3, 0.3, yP - 0.2, 0.3);
    const xt = x < r.cx ? r.w + 0.35 : r.e - 0.35;
    for (let y = 2 * 3.9 * k; y < yD - 1; y += 2 * 3.9 * k) { S.v.strut(WH, [x + 0.15, y - 0.15, zB1 - 0.15], [xt, y - 0.15, r.s + 0.05], 0.22); S.v.frame(); }
  }
  if (ctx.occupy) ctx.occupy([[xw - 0.3, zB1 - 0.6], [xw + 0.6, zB1 - 0.6], [xw + 0.6, zB1 + 0.3], [xw - 0.3, zB1 + 0.3]]), ctx.occupy([[xe - 0.6, zB1 - 0.6], [xe + 0.3, zB1 - 0.6], [xe + 0.3, zB1 + 0.3], [xe - 0.6, zB1 + 0.3]]);
  // the platform's rail: round the north, west and east edges and along the south edge east of the stair's top landing
  rail(px0, pz0, px1, pz0, yP); rail(px0, pz0, px0, pz1, yP); rail(px1, pz0, px1, pz1, yP); rail(xa, pz1, px1, pz1, yP);
  hit(S, px0 - 0.07, yP + 0.01, pz0 - 0.07, px1 - px0 + 0.14, 1.74, 0.06); hit(S, px0 - 0.07, yP + 0.01, pz0, 0.06, 1.74, pz1 - pz0 + 0.01); hit(S, px1 + 0.01, yP + 0.01, pz0, 0.06, 1.74, zA0 - pz0 - 0.08);

  hit(S, px0, yP - tP, pz0, px1 - px0, tP, pz1 - pz0); hit(S, hx0, yP + 0.01, hz0, hx1 - hx0, H - yP - 0.01, hz1 - hz0);
  hit(S, r.e, 0, r.cz - 1.1, 1.3, 0.16, 2.2); hit(S, r.e - 0.01, 0.15, r.cz - 0.95, 0.91, 0.15, 1.9);            // the two steps before the door
  finish(S, item, ctx, r.cx, r.cz, S.low ? 70 : 110);
}
