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
//   0.8 m thick); the west face of the fin section (drawn like the east face); the stair's flights (2.4 m each, one lane
//   1.6 m wide on brackets from the shaft); everything below about 17 m (hidden in every frame).
//
// IMAGINED (the owner asked for a finished tower and said that imagination should fill in what no reference shows):
//   - the CLOCK: a dial where the footage shows the pale disc on the west face and a second one on the east face under the
//     emblem; ticks without numerals; the hands show the page's time of day and the dials are lit from inside after dusk;
//   - a dark granite-tile plinth, joints round the shaft at every 3.9 m, a steel door on the east face with a canopy, two
//     steps and a lamp, aluminium louvres on the south wall of the fin section and high on the west face, a rainwater
//     pipe, a lightning conductor down the south-west corner, corbels under the platform, a rail all round it, a red
//     obstruction light on the mast, two floodlights at the foot;
//   - the stair below the lowest landing seen: one more flight down to a landing at the tower's south-west corner and a
//     last leg that comes down northward onto the roof of that block (core-pergola-block, see above), so that the stair
//     no longer starts in mid-air. With ?only= the block is not built and the last leg ends in the air. Nobody can reach
//     the stair (the block's roof has no access): it is visual only;
//   - the emblem itself is the simplified drawing of signs.js.
// Colliders: the shaft, the platform slab with its rail, the head: a player leaving drone mode above the tower lands on the
// cap or on the platform.
import { THREE, bbox } from '../../kit.js';
import { emblemTexture } from '../../signs.js';
import { LIT } from '../../street.js';
import { fuse } from './plaza.js';
import { F, lm, shell, finish, hit, facade, face, louvre, stain, rwp, ramp, apron } from './plain-block.js';

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
  E.door(r.cz, { w: 1.2, h: 2.15, y0: 0.3, canopy: 0.9, leaf: lm('green'), stepOut: 0.9 });
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

  // ---- open stair on the south side: landings at both ends of one lane, zig-zag flights up to the platform (SEEN from the
  //      landing at about 24.9 m upward; one flight and a last leg down to the neighbouring roof are added below it)
  const z0 = r.s + 1.1, z1 = r.s + 2.7, zc = (z0 + z1) / 2, xE = r.e - 0.3, xW = r.w + 0.3, yL = H - 16.1 * k, rise = (yP - yL) / 3, steps = 13, TR = lm('tread');
  const landing = (east, y, wide = 1.2) => {
    const x = east ? xE : xW - wide;
    F(S.v, CO, x, y - 0.15, z0, wide, 0.15, z1 - z0, 'NSEWUD');
    F(S.v, WH, east ? r.e - 0.35 : r.w + 0.15, y - 0.45, r.s, 0.2, 0.3, z1 - r.s, 'SEWD');                 // bracket from the shaft
    const xo = east ? x + wide - 0.04 : x;                                                                 // rail at the outer end
    F(S.d, RA, xo, y + 0.95, z0, 0.04, 0.05, z1 - z0, 'EWUD');
    for (const z of [z0, zc, z1 - 0.04]) F(S.d, RA, xo, y, z, 0.04, 0.95, 0.04, 'NSEW');
  };
  const flight = (xa, ya, xb, yb) => {
    const west = xb < xa, go = (xb - xa) / steps;
    ramp(S.v, CO, [xa, ya - 0.02, zc], [xb, yb - 0.02, zc], z1 - z0, 0.14, 'UDSN');
    if (!S.low) for (let i = 0; i < steps; i++) F(S.d, TR, Math.min(xa + i * go, xa + (i + 1) * go), ya + i * (yb - ya) / steps, z0, Math.abs(go), (yb - ya) / steps, z1 - z0, west ? 'UE' : 'UW');
    for (const z of [z0 + 0.03, z1 - 0.03]) {
      S.d.strut(RA, [xa, ya + 0.95, z], [xb, yb + 0.95, z], 0.05); S.d.frame();
      for (const t of [0, 0.5, 1]) F(S.d, RA, xa + (xb - xa) * t - 0.02, ya + (yb - ya) * t, z - 0.02, 0.04, 0.95, 0.04, 'NSEW');
    }
  };
  landing(true, yL);
  for (let f = 0; f < 3; f++) { const west = f % 2 === 0, ya = yL + f * rise; flight(west ? xE : xW, ya, west ? xW : xE, ya + rise); if (f < 2) landing(!west, ya + rise); }
  // below the lowest landing seen: a flight down to a west landing, then a last leg northward down to the roof of core-pergola-block (extras/context.js)
  const yW = yL - rise, yRoof = 20.1 * k, xl0 = xW - 2.2, xl1 = xW - 1.2;
  flight(xW, yW, xE, yL); landing(false, yW, 2.2);
  if (yW > yRoof + 0.5) {
    const n = Math.max(4, Math.round((yW - yRoof) / 0.185)), len = n * 0.3;
    ramp(S.v, CO, [(xl0 + xl1) / 2, yW - 0.02, z0], [(xl0 + xl1) / 2, yRoof - 0.02, z0 - len], xl1 - xl0, 0.14, 'UDEW');
    if (!S.low) for (let i = 0; i < n; i++) F(S.d, TR, xl0, yW - (i + 2) * (yW - yRoof) / n, z0 - (i + 1) * 0.3, xl1 - xl0, (yW - yRoof) / n, 0.3, 'UN');
    for (const x of [xl0 + 0.03, xl1 - 0.03]) { S.d.strut(RA, [x, yW + 0.95, z0], [x, yRoof + 0.95, z0 - len], 0.05); S.d.frame(); for (const t of [0, 0.5, 1]) F(S.d, RA, x - 0.02, yW + (yRoof - yW) * t, z0 - len * t - 0.02, 0.04, 0.95, 0.04, 'NSEW'); }
  }
  // the top flight arrives on a landing at platform level, joined to the platform; a rail round the platform
  F(S.v, CP, xW - 1.2, yP - tP, pz1, 1.2, tP, z1 - pz1, 'SEWUD');
  const railRun = (x, z, a, c) => {
    F(S.d, RA, x, yP + 1.0, z, a, 0.05, c, 'NSEWUD'); F(S.d, RA, x, yP + 0.5, z, a, 0.04, c, 'NSEWUD');
    const n = Math.max(1, Math.round(Math.max(a, c) / 1.4)); for (let i = 0; i <= n; i++) F(S.d, RA, x + (a > c ? (a - 0.04) * i / n : 0), yP, z + (c > a ? (c - 0.04) * i / n : 0), 0.04, 1.0, 0.04, 'NSEW');
    hit(S, x, yP + 0.02, z, a, 1.15, c);
  };
  railRun(xW - 1.2, z1 - 0.04, 1.2, 0.04); railRun(xW - 1.2, pz1 + 0.02, 0.04, z1 - pz1 - 0.08); railRun(xW + 0.02, pz1 - 0.04, px1 - xW - 0.06, 0.04);
  railRun(px0, pz0 + 0.05, 0.04, pz1 - pz0 - 0.1); railRun(px1 - 0.04, pz0 + 0.05, 0.04, pz1 - pz0 - 0.1); railRun(px0 + 0.05, pz0, px1 - px0 - 0.1, 0.04);
  railRun(px0 + 0.05, pz1 - 0.04, xW - 1.2 - px0 - 0.1, 0.04);

  hit(S, r.w, 0, r.n, sx, yP - tP, sz); hit(S, px0, yP - tP, pz0, px1 - px0, tP, pz1 - pz0); hit(S, hx0, yP + 0.01, hz0, hx1 - hx0, H - yP - 0.01, hz1 - hz0);
  hit(S, r.e, 0, r.cz - 0.95, 0.9, 0.3, 1.9);                                                            // the door step
  finish(S, item, ctx, r.cx, r.cz, S.low ? 70 : 110);
}
