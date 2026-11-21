// Lower wing between the east ends of the two east teaching slabs, and the school-name wall that rises from it.
//
// SEEN:
//   - 2018 footage, frames 5 and 6: large individual red characters 广东实验中学 (read left to right, facing north) on the
//     upper part of a white wall about one storey tall that shows above the north slab's roof; the wall is the north face of
//     a white box (its east end face with an outdoor unit is visible, a small green window sits low on the north face near
//     the east end); a flat grey slab with a pale edge projects north in front of the wall, about one character height
//     below the lettering, starting a little west of the wall's east end and running to its west end;
//   - the same stills: the upper two storeys of the wing's east face are plain cream wall without windows;
//   - satellite image: the wing's outline, a beige roof with white parapets on all four sides, one small white box on it.
// NOT RESOLVED: in frame 6 the wall continues westward as the north slab's tall south parapet (with its red pipe), so the
//   real box probably stands on the south-east corner of the north slab's roof, about 3.7 m north of where the measured
//   outlines put the wing's north edge. It is kept on the wing's north edge, as before, so that the lettering stays where
//   the menu place "航拍：校名墙" looks; the box is therefore drawn rising from the wing's roof to 26.4 m.
//
// ASSUMED: the wing's west face (the slabs' pattern: white grid, dark-red spandrels, window strips), its south face and
//   the lower two storeys of its east face (small windows); four storeys of 3.9 m; the box behind the wall: its depth
//   (3 m), its south face with a door onto the wing roof, its cap; the projecting slab's level (22 m), depth (3 m) and
//   the beams under it; how it is really supported is not known.
//
// IMAGINED (the owner asked for finished buildings; no reference shows it): the entrance on the courtyard side (a glazed
//   door set under a canopy), windows set back in their openings, the dark base course, rainwater pipes, outdoor
//   units, dirt streaks, lightning rods; four small floodlights on the projecting slab that light the name after dusk
//   (the characters then glow as if lit).
//   Second refinement round: the ground floor west of the block that stands in the wing's north-east corner is an
//   ENTRANCE HALL that can be walked into: the ground storey of the west face is a glazed front in the rhythm of the floors
//   above with the door (standing open) in the middle bay; inside, a polished granite floor with a dark border and a
//   medallion before the door, a coffered ceiling with downlights, the HONOURS WALL facing the door (a dark-red board in a
//   brass-coloured frame with framed certificates, engraved plates and medals, the simplified emblem of signs.js above it,
//   spotlights on a track, a shelf of cups at its foot), display cases with cups and models made by students (a ship, a
//   rocket and a robot), a reception desk, a sitting corner with sofas and plants, a rack of papers, and at the back a lift
//   and a door to the stair (closed: the floors above are not built). Every word in the hall is generic and made up:
//   荣誉墙, 接待处, 楼梯, and on the certificates and plates 荣誉证书, 奖状, 先进集体, 优秀组织奖, 一等奖, 优秀团支部, 优秀奖,
//   金奖, 特等奖; no event, person or year is named.
// The lettering on the wall is exactly the text read from the frames. Colliders: the wing solid above and round the hall;
// the hall's glazed front with its doorway; cases, desk, sofas, pots, the cups' shelf, the rack; parapets, box and slab.
import { THREE, bbox } from '../../kit.js';
import { signPlane, emblemTexture } from '../../signs.js';
import { LIT } from '../../street.js';
import { shrubs } from '../../flora.js';
import { F, lm, shell, finish, hit, face, facade, grid, body, punch, doorSet, plinth, apron, rwp, ac, other, stain, lightning, curtain, wallHit, card, textCard, pierce } from './plain-block.js';

const FH = 3.9;

// ---- the entrance hall (IMAGINED from end to end: no reference shows the ground floor or anything inside) ----------------
let HONOURS = null;
/** The honours wall as one picture: a header, framed certificates and engraved plates. Every word on it is generic. */
function honoursMaterial(w, h) {
  if (HONOURS) return HONOURS;
  const m = new THREE.MeshStandardMaterial({ roughness: 0.45, metalness: 0.1, envMapIntensity: 0.6 }); m.name = 'sign-wing-honours';
  if (typeof document !== 'undefined') {
    const W = 2048, Hh = 704, c = document.createElement('canvas'); c.width = W; c.height = Hh; const g = c.getContext('2d');
    let sd = 1309; const r = () => ((sd = (sd * 1664525 + 1013904223) >>> 0) / 4294967296);
    const KAI = '"STKaiti","华文楷体","Kaiti SC","KaiTi","楷体","AR PL UKai CN","Noto Serif CJK SC",serif', CJK = '"PingFang SC","Microsoft YaHei","Noto Sans CJK SC","WenQuanYi Zen Hei",sans-serif';
    const gr = g.createLinearGradient(0, 0, 0, Hh); gr.addColorStop(0, '#6e1f1b'); gr.addColorStop(1, '#4e1512'); g.fillStyle = gr; g.fillRect(0, 0, W, Hh);
    for (let i = 0; i < 3000; i++) { g.fillStyle = `rgba(255,255,255,${0.01 + 0.02 * r()})`; g.fillRect(r() * W, r() * Hh, 2, 2); }
    g.strokeStyle = '#c9a45a'; g.lineWidth = 6; g.strokeRect(14, 14, W - 28, Hh - 28); g.lineWidth = 2; g.strokeRect(26, 26, W - 52, Hh - 52);
    g.fillStyle = '#e3c06a'; g.font = `bold 92px ${KAI}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('荣  誉  墙', W / 2, 92);
    g.fillRect(W / 2 - 420, 148, 300, 4); g.fillRect(W / 2 + 120, 148, 300, 4);
    const titles = ['荣誉证书', '奖状', '先进集体', '优秀组织奖', '一等奖', '荣誉证书', '优秀团支部', '奖状'];
    for (let row = 0; row < 3; row++) for (let col = 0; col < 9; col++) {
      const x = 70 + col * 214, y = 190 + row * 166, kind = (row * 9 + col * 5) % 3;
      if (kind === 0) {                                     // a framed certificate
        g.fillStyle = '#3b2a1c'; g.fillRect(x, y, 188, 138); g.fillStyle = r() < 0.5 ? '#fbf3d6' : '#f9e7b0'; g.fillRect(x + 8, y + 8, 172, 122);
        g.strokeStyle = '#c3201b'; g.lineWidth = 3; g.strokeRect(x + 14, y + 14, 160, 110);
        g.fillStyle = '#c3201b'; g.font = `bold 22px ${KAI}`; g.fillText(titles[(row * 9 + col) % titles.length], x + 94, y + 40);
        g.fillStyle = '#8b8273'; for (let q = 0; q < 4; q++) g.fillRect(x + 30, y + 62 + q * 12, 128 * (q === 3 ? 0.5 : 1), 3);
        g.strokeStyle = '#c3201b'; g.lineWidth = 2; g.beginPath(); g.arc(x + 146, y + 110, 11, 0, 6.283); g.stroke();
      } else if (kind === 1) {                              // an engraved brass plate on a dark board
        g.fillStyle = '#20150f'; g.fillRect(x + 6, y + 6, 176, 126); const gg = g.createLinearGradient(x, y, x + 188, y + 138); gg.addColorStop(0, '#e9cf86'); gg.addColorStop(0.5, '#b98f3e'); gg.addColorStop(1, '#e2c174'); g.fillStyle = gg; g.fillRect(x + 22, y + 20, 144, 98);
        g.fillStyle = '#6b4a1c'; g.font = `bold 20px ${CJK}`; g.fillText(['优秀奖', '金奖', '一等奖', '特等奖'][(row + col) % 4], x + 94, y + 46); for (let q = 0; q < 3; q++) g.fillRect(x + 44, y + 68 + q * 12, 100, 3);
      } else {                                              // a medal on ribbon in a small case
        g.fillStyle = '#2b1d14'; g.fillRect(x + 30, y, 128, 138); g.fillStyle = '#1d2a4a'; g.fillRect(x + 38, y + 8, 112, 122);
        g.fillStyle = ['#c3201b', '#1f5fa8', '#2f8a5f'][(row + col) % 3]; g.beginPath(); g.moveTo(x + 76, y + 14); g.lineTo(x + 112, y + 14); g.lineTo(x + 104, y + 70); g.lineTo(x + 84, y + 70); g.closePath(); g.fill();
        const mg = g.createRadialGradient(x + 94, y + 92, 4, x + 94, y + 92, 26); mg.addColorStop(0, '#fff2b8'); mg.addColorStop(1, (row + col) % 2 ? '#c9a14a' : '#a9acb0'); g.fillStyle = mg; g.beginPath(); g.arc(x + 94, y + 92, 24, 0, 6.283); g.fill();
      }
    }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(1 / w, 1 / h); m.map = t;
  }
  return (HONOURS = m);
}
/**
 * The hall behind the glazed front: granite floor with a medallion before the door, a coffered ceiling with lamps, the
 * honours wall facing the door (the school's emblem above it, as drawn on the clock tower), display cases with cups and
 * students' models, a reception desk, a sitting corner, a lift and a stair door at the back. hall: { x0, x1, z0, z1, h }.
 */
function entranceHall(S, ctx, r, b, hall, ud, dh, FH) {
  const B = S.i, x0 = r.w + 0.25, x1 = hall.x1, z0 = hall.z0, z1 = hall.z1, yc = 3.6, xm = (x0 + x1) / 2, PW = face('W', r.w), t = 0.25;
  const GL = lm('graniteLight'), GD = lm('graniteDark'), GR = lm('graniteRed'), PL = lm('plaster'), WD = lm('wood'), WK = lm('woodDark'), SS = lm('steel'), BR = lm('brass'), LAMP = lm('lamp');
  // ---- the glazed front: white piers in the rhythm of the floors above, clear glass on a dark base, the door in the middle bay
  const nb = Math.round(b.sz / 3.9), bw = b.sz / nb;
  for (let i = 0; i <= nb; i++) { const u = r.n + i * bw, hw = i === 0 || i === nb ? 0.3 : 0.22; PW(S.v, lm('white'), Math.max(r.n, u - hw), Math.min(r.s, u + hw), 0, FH, 0, 0.14, 'FLR'); }
  PW(S.v, lm('white'), r.n, r.s, 3.3, FH, 0, 0.11, 'FUD');                                                       // the band under the first floor
  for (let i = 0; i < nb; i++) {
    const ua = r.n + i * bw + (i === 0 ? 0.3 : 0.22), ub = r.n + (i + 1) * bw - (i === nb - 1 ? 0.3 : 0.22), holes = ud > ua && ud < ub ? [dh] : [];
    curtain(S, PW, ua, ub, 0.3, 3.3, [0, 3.3 + 0.4], holes, { t: 0.12, glass: lm('glassLobby'), pitch: 1.2 });
    pierce(S.v, lm('base'), PW, ua, ub, 0, 0.3, holes, -0.12, 0.02, 'FBU');
  }
  wallHit(S, PW, r.n, r.s, 0, FH - 0.02, [dh], 0.2);
  // ---- floor, ceiling, walls
  F(B, GL, x0, 0.0, z0, x1 - x0, 0.03, z1 - z0, 'U'); F(B, GD, x0, 0.031, z0, x1 - x0, 0.003, 0.35, 'U'); F(B, GD, x0, 0.031, z1 - 0.35, x1 - x0, 0.003, 0.35, 'U'); F(B, GD, x1 - 0.35, 0.031, z0 + 0.35, 0.35, 0.003, z1 - z0 - 0.7, 'U');
  hit(S, x0 - 0.3, 0, z0, x1 - x0 + 0.3, 0.03, z1 - z0);
  B.frame(x0 + 3.0, ud);                                                                                          // a medallion in the floor before the door
  for (let i = 0; i < 32; i++) {
    const a0 = i / 32 * 6.2832, a1 = (i + 1) / 32 * 6.2832, P = (rr, a) => [Math.cos(a) * rr, 0.034, Math.sin(a) * rr];
    B.quad(GR, P(1.5, a1), P(1.5, a0), P(1.25, a0), P(1.25, a1)); B.quad(GD, P(1.25, a1), P(1.25, a0), P(0.5, a0), P(0.5, a1)); B.quad(BR, P(0.5, a1), P(0.5, a0), P(0.0, a0), P(0.0, a1));
  }
  for (let i = 0; i < 8; i++) { const a = i / 8 * 6.2832, c0 = Math.cos(a), s0 = Math.sin(a); B.quad(GL, [c0 * 1.2 - s0 * 0.06, 0.036, s0 * 1.2 + c0 * 0.06], [c0 * 1.2 + s0 * 0.06, 0.036, s0 * 1.2 - c0 * 0.06], [c0 * 0.55, 0.036, s0 * 0.55], [c0 * 0.55, 0.036, s0 * 0.55]); }
  B.frame();
  F(S.v, lm('ceil'), x0, yc, z0, x1 - x0, 0.02, z1 - z0, 'D');                                                    // ceiling (seen through the glass by day too)
  // the south face's ground-floor windows (punched by build() below, three in the face) that open into the hall
  const sw = [0, 1, 2].map(i => r.w + 0.8 + (r.e - r.w - 1.6) * (i + 0.5) / 3).filter(u => u + 0.6 < x1).map(u => [u - 0.6, u + 0.6, 1.1, 2.4]);
  for (const [fx, a, c, faces, hs] of [[face('S', z0), x0, x1, 'F', []], [face('N', z1), x0, x1, 'F', sw], [face('W', x1), z0, z1, 'F', []]]) pierce(B, PL, fx, a, c, 0.03, yc, hs, -0.01, 0, faces);
  for (const [a, c, y0, y1] of sw) { const P = face('N', z1); P(B, lm('cope'), a, c, y0 - 0.01, y0, -0.25, 0, 'U'); P(B, lm('cope'), a - 0.01, a, y0, y1, -0.25, 0, 'R'); P(B, lm('cope'), c, c + 0.01, y0, y1, -0.25, 0, 'L'); P(B, lm('cope'), a, c, y1, y1 + 0.01, -0.25, 0, 'D'); }
  for (const [fx, a, c] of [[face('S', z0), x0, x1], [face('N', z1), x0, x1], [face('W', x1), z0, z1]]) fx(B, WK, a, c, 0.03, 0.15, 0, 0.012, 'FU');   // skirting
  for (const [fx, a, c, hs] of [[face('S', z0), x0, x1, [[x0 + 0.5, x0 + 1.7, 0, 2.2], [x0 + 4.1, x0 + 5.9, 0, 2.6]]], [face('N', z1), x0, x1, sw]]) {   // a timber dado with a rail on the long walls
    pierce(B, WD, fx, a, c, 0.15, 1.05, hs, 0, 0.015, 'FU'); pierce(B, WK, fx, a, c, 1.05, 1.09, hs, 0, 0.025, 'FUD');
    for (let u = a + 0.6; u < c - 0.3; u += 1.2) if (!hs.some(h => u > h[0] - 0.1 && u < h[1] + 0.1)) fx(B, WK, u - 0.008, u + 0.008, 0.15, 1.05, 0.015, 0.02, 'F');
  }
  for (let x = x0 + 1.2; x < x1 - 0.5; x += 1.75) F(B, lm('ceil'), x - 0.06, yc - 0.18, z0, 0.12, 0.18, z1 - z0, 'NSEWD');                         // coffers
  for (let z = z0 + 1.6; z < z1 - 0.5; z += 1.9) F(B, lm('ceil'), x0, yc - 0.18, z - 0.06, x1 - x0, 0.18, 0.12, 'EWNSD');
  for (let x = x0 + 2.07; x < x1 - 0.5; x += 1.75) for (let z = z0 + 2.55; z < z1 - 0.6; z += 3.8) { B.cyl(lm('frame'), x, yc - 0.03, z, 0.17, 0.03, 12); B.cyl(LAMP, x, yc - 0.035, z, 0.14, 0.006, 12); LIT.push([x, z, 2.2, yc - 0.05]); }
  // ---- the honours wall facing the door: dark-red board in a brass frame, the emblem above it, spotlights on a track
  const hz0 = ud - 3.5, hz1 = ud + 3.5, PH = face('W', x1);
  PH(B, WK, hz0 - 0.12, hz1 + 0.12, 0.75, 3.25, 0, 0.06, 'FLRUD'); card(B, PH, honoursMaterial(hz1 - hz0, 2.3), hz0, hz1, 0.85, 3.15, 0.062);
  const em = new THREE.Mesh(new THREE.CircleGeometry(0.28, 32), new THREE.MeshStandardMaterial({ map: emblemTexture('#f2f0e9'), roughness: 0.5 }));
  em.material.name = 'sign-wing-emblem'; em.position.set(x1 - 0.07, 3.33, ud); em.rotation.y = -Math.PI / 2; em.scale.setScalar(0.85); S.ix.push(em);
  F(B, SS, x1 - 0.7, yc - 0.06, hz0, 0.05, 0.04, hz1 - hz0, 'NSEWD'); for (let z = hz0 + 0.5; z < hz1; z += 1.0) { F(B, lm('dark'), x1 - 0.78, yc - 0.22, z - 0.06, 0.14, 0.16, 0.12, 'NSEWD'); F(B, LAMP, x1 - 0.79, yc - 0.225, z - 0.05, 0.12, 0.004, 0.1, 'D'); }
  // a shelf of cups along the foot of the wall
  F(B, GD, x1 - 0.5, 0.03, hz0 + 0.4, 0.5, 0.7, hz1 - hz0 - 0.8, 'NSWU'); hit(S, x1 - 0.5, 0.03, hz0 + 0.4, 0.49, 0.72, hz1 - hz0 - 0.8);
  for (let z = hz0 + 0.8, i = 0; z < hz1 - 0.6; z += 0.62, i++) { const h = 0.22 + 0.1 * ((i * 7) % 3); B.frame(x1 - 0.25, z).cyl(BR, 0, 0.73, 0, 0.07, 0.04, 10).cyl(BR, 0, 0.77, 0, 0.025, h * 0.4, 6, false).cyl(i % 3 ? BR : SS, 0, 0.77 + h * 0.4, 0, 0.07, h * 0.6, 10).cyl(BR, 0, 0.77 + h, 0, 0.09, 0.02, 10); B.frame(); }
  // ---- display cases in the north part: cups and medals, models the students made (a ship, a rocket, a robot, a bridge)
  const cz0 = z0 + 1.4, cases = [[x0 + 1.6, cz0], [x0 + 4.6, cz0], [x0 + 1.6, cz0 + 2.6], [x0 + 4.6, cz0 + 2.6]].filter(([x]) => x < x1 - 0.9);   // aisles 0.85 m and more between them
  cases.forEach(([x, z], i) => {
    F(B, GD, x - 0.75, 0.03, z - 0.4, 1.5, 0.8, 0.8, 'NSEWU'); F(B, lm('glassLobby'), x - 0.72, 0.83, z - 0.37, 1.44, 0.62, 0.74, 'NSEWU'); F(B, SS, x - 0.75, 1.45, z - 0.4, 1.5, 0.03, 0.8, 'NSEWUD');
    for (const [dx, dz] of [[-0.74, -0.39], [0.72, -0.39], [-0.74, 0.37], [0.72, 0.37]]) F(B, SS, x + dx, 0.83, z + dz, 0.02, 0.62, 0.02, 'NSEW');
    B.frame(x, z);
    if (i % 3 === 0) { B.box(lm('red'), -0.25, 0.92, 0, 0.6, 0.12, 0.16).box(lm('white'), -0.25, 1.1, 0, 0.04, 0.3, 0.04).box(lm('sheet'), -0.2, 1.12, 0, 0.18, 0.2, 0.01).box(lm('white'), 0.3, 0.88, 0, 0.3, 0.05, 0.3); }   // a ship model
    else if (i % 3 === 1) { B.cyl(lm('white'), -0.3, 0.83, 0, 0.06, 0.42, 10).cyl(lm('red'), -0.3, 1.25, 0, 0.035, 0.08, 8); for (const dz of [-0.07, 0.07]) B.box(lm('red'), -0.3, 0.9, dz, 0.02, 0.12, 0.06); B.box(lm('blue'), 0.25, 0.9, 0, 0.3, 0.14, 0.24).box(lm('alu'), 0.25, 1.03, 0, 0.18, 0.12, 0.16).box(lm('dark'), 0.25, 1.12, 0.09, 0.06, 0.03, 0.01); }   // a rocket and a robot
    else { for (let k = 0; k < 4; k++) B.cyl(BR, -0.45 + k * 0.3, 0.83, 0, 0.06, 0.03, 10).cyl(BR, -0.45 + k * 0.3, 0.86, 0, 0.02, 0.1, 6, false).cyl(k % 2 ? lm('alu') : BR, -0.45 + k * 0.3, 0.96, 0, 0.055, 0.14, 10); }   // cups
    B.frame(); hit(S, x - 0.75, 0.03, z - 0.4, 1.5, 1.45, 0.8);
  });
  // ---- reception desk in the south part, facing the door: a timber front with a stone top, a monitor, a telephone, a chair behind
  const rz = z1 - 3.4, rx0 = xm - 1.6, rx1 = xm + 1.6;
  F(B, WD, rx0, 0.03, rz, rx1 - rx0, 1.05, 0.12, 'NSEWU'); F(B, WD, rx0, 0.03, rz, 0.12, 1.05, 0.7, 'NEWU'); F(B, WD, rx1 - 0.12, 0.03, rz, 0.12, 1.05, 0.7, 'NEWU');
  F(B, lm('graniteLight'), rx0 - 0.04, 1.08, rz - 0.06, rx1 - rx0 + 0.08, 0.04, 0.34, 'NSEWUD'); F(B, WK, rx0 + 0.12, 0.75, rz + 0.12, rx1 - rx0 - 0.24, 0.03, 0.55, 'NSEWUD');
  F(B, BR, rx0, 0.42, rz - 0.005, rx1 - rx0, 0.04, 0.005, 'N');
  F(B, lm('dark'), xm - 0.25, 0.78, rz + 0.45, 0.5, 0.32, 0.03, 'NSEWU'); F(B, lm('dark'), xm - 0.05, 0.78, rz + 0.47, 0.1, 0.05, 0.08, 'NSEWU'); F(B, lm('dark'), xm + 0.7, 0.78, rz + 0.3, 0.2, 0.06, 0.16, 'NSEWU');
  F(B, lm('dark'), xm - 0.25, 0.45, rz + 0.95, 0.5, 0.06, 0.5, 'NSEWUD'); F(B, lm('dark'), xm - 0.25, 0.5, rz + 1.4, 0.5, 0.5, 0.06, 'NSEWUD'); B.cyl(lm('alu'), xm, 0.06, rz + 1.2, 0.025, 0.4, 6, false);
  hit(S, rx0, 0.03, rz - 0.06, rx1 - rx0, 1.06, 0.82);
  card(B, face('N', rz - 0.06), textCard('接 待 处', 0.8, 0.2, { bg: '#7a2622', fg: '#f3e6c4' }), xm - 0.4, xm + 0.4, 1.13, 1.33, 0.005);
  F(B, lm('frameDark'), xm - 0.42, 1.12, rz - 0.04, 0.84, 0.22, 0.02, 'NSEWU');
  // ---- sitting corner at the south end: two sofas, a low table, plants in tall pots; a rack of school papers
  const sz = z1 - 1.0;
  F(B, lm('blue'), x0 + 0.8, 0.03, sz - 0.4, 2.2, 0.42, 0.8, 'NSEWU'); F(B, lm('blue'), x0 + 0.8, 0.45, sz + 0.2, 2.2, 0.4, 0.2, 'NSEWU');
  F(B, lm('blue'), x0 + 0.1, 0.03, sz - 2.4, 0.8, 0.42, 2.0, 'NSEWU'); F(B, lm('blue'), x0 + 0.1, 0.45, sz - 2.4, 0.2, 0.4, 2.0, 'NSEWU');
  F(B, WK, x0 + 1.3, 0.35, sz - 1.9, 1.2, 0.04, 0.8, 'NSEWUD'); for (const [dx, dz] of [[0.05, 0.05], [1.1, 0.05], [0.05, 0.7], [1.1, 0.7]]) F(B, lm('dark'), x0 + 1.3 + dx, 0.03, sz - 1.9 + dz, 0.05, 0.32, 0.05, 'NSEW');
  hit(S, x0 + 0.8, 0.03, sz - 0.4, 2.2, 0.82, 0.79); hit(S, x0 + 0.1, 0.03, sz - 2.4, 0.8, 0.82, 1.95); hit(S, x0 + 1.3, 0.03, sz - 1.9, 1.2, 0.36, 0.8);
  const pots = [[x0 + 0.45, z1 - 0.45], [x1 - 0.5, z1 - 0.5], [x1 - 0.5, z0 + 0.5], [x0 + 0.6, ud - 1.6], [x0 + 0.6, ud + 1.6]];
  for (const [px, pz] of pots) { B.cyl(lm('tread'), px, 0.03, pz, 0.24, 0.55, 12).cyl(lm('soil'), px, 0.58, pz, 0.21, 0.01, 10); hit(S, px - 0.22, 0.03, pz - 0.22, 0.44, 0.55, 0.44); }
  const leaves = shrubs(pots.map(([px, pz]) => [px, pz, 0.42]), { seed: 37, hex: 0x3f7a38 }); leaves.position.y = 0.58; leaves.scale.y = 1.6; leaves.castShadow = false; S.ix.push(leaves);
  F(B, lm('frameDark'), x1 - 0.35, 0.03, z1 - 2.6, 0.3, 1.4, 0.9, 'WNSU'); for (let k = 0; k < 4; k++) F(B, lm(['sheet', 'yellow', 'sheet', 'blue'][k]), x1 - 0.37, 0.4 + k * 0.28, z1 - 2.5, 0.02, 0.22, 0.7, 'W');
  hit(S, x1 - 0.35, 0.03, z1 - 2.6, 0.34, 1.4, 0.9);
  // ---- at the back of the north part: the lift and the door to the stair (closed; the floors above are not built)
  const PN = face('S', z0);
  PN(B, SS, x0 + 4.2, x0 + 5.5, 0.03, 2.25, 0, 0.03, 'FLRU'); PN(B, lm('alu'), x0 + 4.27, x0 + 4.84, 0.03, 2.15, 0.03, 0.04, 'F'); PN(B, lm('alu'), x0 + 4.86, x0 + 5.43, 0.03, 2.15, 0.03, 0.04, 'F');
  PN(B, lm('black'), x0 + 4.65, x0 + 5.05, 2.35, 2.5, 0, 0.02, 'FLRUD'); PN(B, SS, x0 + 5.7, x0 + 5.8, 1.05, 1.3, 0, 0.015, 'FLRUD');
  PN(B, WK, x0 + 0.6, x0 + 1.6, 0.03, 2.1, 0, 0.04, 'FLRU'); PN(B, lm('frame'), x0 + 0.54, x0 + 1.66, 2.1, 2.16, 0, 0.05, 'FLRUD'); PN(B, SS, x0 + 1.45, x0 + 1.52, 1.0, 1.04, 0.04, 0.1, 'FLRUD');
  card(B, PN, textCard('楼梯', 0.4, 0.16, { bg: '#0a8f4e' }), x0 + 0.9, x0 + 1.3, 2.25, 2.41, 0.01);
}

export function build(item, ctx) {
  const S = shell(ctx), b = bbox(item.points), H = item.height, top = 26.4;   // top: about 4.5 m above the slabs' parapets (20.7 m roof + 1.2 m)
  const r = { w: b.w, e: b.e, n: b.n, s: b.s }, sx = b.sx, floors = Math.max(1, Math.round(H / FH)), W = lm('white'), CP = lm('cope'), CR = lm('cream');
  // the entrance hall on the ground floor: west of the block that stands in the wing's north-east corner
  const se0 = other(ctx, 'slab-north-se-block'), hallE = se0 && se0.w > r.w + 5 && se0.w < r.e ? se0.w - 0.2 : r.e - 0.25;
  const hall = { x0: r.w, x1: hallE, z0: r.n + 0.25, z1: r.s - 0.25, h: FH };
  const yr = body(S, r, H, { faces: 'N', roof: lm('roofBeige'), par: 0.9, hollow: hall });
  F(S.v, lm('white'), r.w, FH, r.n, b.sx, H - FH, b.sz, 'W');                                                       // the west wall above the hall's glazed front
  const PE = face('E', r.e), PW = face('W', r.w), PS = face('S', r.s), PN = face('N', r.n);
  // ---- west face (assumed): the slabs' pattern above; on the ground floor the hall's glazed front with the entrance in the middle bay
  grid(S, PW, r.n, r.s, floors - 1, FH, { y0: FH, bay: 3.9, head: 3.0 });
  const nb = Math.round(b.sz / 3.9), ud = (r.n + r.s) / 2 + (nb % 2 ? 0 : b.sz / nb / 2);
  const dh = doorSet(S, PW, ud, { w: 1.7, h: 2.3, glazed: true, t: 0.25, rev: 0.125, fan: 0.45, swing: 'in', canopy: 1.4, step: false, plate: false, bars: lm('frameDark'), glass: lm('glassLobby') });
  entranceHall(S, ctx, r, b, hall, ud, dh, FH);
  apron(ctx, 'W', r.w, ud, 3, 2.4); LIT.push([r.w - 1.1, ud, 3.2, 3.0]);                                                // the lamp under the entrance canopy
  PW(S.v, lm('concrete'), ud - 1.4, ud + 1.4, 0, 0.03, 0, 1.6, 'FLRU');
  // ---- east face: cream, plain above (seen); small windows on the two lower storeys (assumed), clear of the block that stands against it
  const se = other(ctx, 'slab-north-se-block'), ue = se && se.e > r.e && se.s > r.n ? Math.min(se.s + 0.6, r.s - 4) : r.n + 0.8;
  const E = facade(S, 'E', r.e, r.n, r.s, 0, H, { mat: CR }); punch(E, ue, r.s - 0.8, Math.min(2, floors), FH, { cols: 3, w: 1.4, h: 1.3, sill: 1.1 }); E.done(); plinth(S, PE, r.n, r.s);
  rwp(S, PE, r.s - 0.3, yr); rwp(S, PE, ue - 0.3, yr); stain(S, PE, ue, r.s, H, 1.0); ac(S, PE, r.s - 2.2, FH + 0.3);
  // ---- south face (assumed)
  const So = facade(S, 'S', r.s, r.w, r.e, 0, H, { mat: W }); punch(So, r.w + 0.8, r.e - 0.8, floors, FH, { cols: 3, w: 1.2, h: 1.3, sill: 1.1 }); So.done(); plinth(S, PS, r.w, r.e); stain(S, PS, r.w, r.e, H, 0.8);
  plinth(S, PN, r.w, r.e);
  // ---- roof: one small white box (satellite image), lightning protection
  F(S.v, lm('frame'), r.w + 0.5, yr, b.cz - 0.6, 1.2, 0.8, 1.2, 'NSEWU'); hit(S, r.w + 0.5, yr + 0.01, b.cz - 0.6, 1.2, 0.8, 1.2);
  lightning(S, r, H + 0.07);

  // ---- the box that carries the name: north face = the sign wall
  const d = 3.0, zb = r.n + d;
  F(S.v, W, r.w, H, r.n, sx, top - H, d, 'EW');
  F(S.v, CP, r.w - 0.06, top, r.n - 0.06, sx + 0.12, 0.1, d + 0.12, 'NSEWUD');
  hit(S, r.w, yr + 0.01, r.n, sx, top - yr, d);
  const sign = signPlane('广东实验中学', b.cx, top - 2.3, b.n - 0.03, b.sx * 0.94, Math.PI);   // faces north, in the top band of the wall
  sign.material.name = 'sign-wing-lettering'; sign.material.emissive.setHex(0xff3a28); sign.material.emissiveMap = sign.material.map; sign.material.emissiveIntensity = 0;
  S.vx.push(sign);
  // projecting slab in front of the wall, pale edge, beams under it; floodlights on it
  const ys = 22.0, a0 = r.w + 0.03 * sx, a1 = r.e - 0.17 * sx, pd = 3.0;
  F(S.v, lm('roof'), a0, ys - 0.25, r.n - pd, a1 - a0, 0.25, pd, 'U'); F(S.v, lm('ceil'), a0, ys - 0.25, r.n - pd, a1 - a0, 0.25, pd, 'D'); F(S.v, CP, a0, ys - 0.25, r.n - pd, a1 - a0, 0.25, pd, 'NEW');
  for (const x of [a0 + 0.3, (a0 + a1) / 2 - 0.12, a1 - 0.55]) F(S.v, W, x, ys - 0.7, r.n - pd + 0.15, 0.25, 0.45, pd - 0.15, 'NEWD');
  hit(S, a0, ys - 0.25, r.n - pd, a1 - a0, 0.25, pd);
  for (let i = 0; i < 4; i++) { const x = a0 + (a1 - a0) * (i + 0.5) / 4; F(S.v, lm('dark'), x - 0.18, ys, r.n - pd + 0.3, 0.36, 0.16, 0.26, 'NSEWU'); F(S.v, lm('lamp'), x - 0.14, ys + 0.03, r.n - pd + 0.56, 0.28, 0.1, 0.012, 'S'); }
  stain(S, PN, r.w, r.e, top, 1.0);
  const N = facade(S, 'N', r.n, r.w, r.e, H, top, { mat: W }); N.win(r.e - 2.3, r.e - 1.4, 19.8, 21.1, { n: 0, glass: lm('glassGreen') }); N.done();   // small green window low on the wall, east end (seen)
  ac(S, PE, r.n + 1.5, 20.2);                                                               // outdoor unit on the east end face (seen)
  // south face of the box (assumed): a door onto the wing roof and three small windows
  const B = facade(S, 'S', zb, r.w, r.e, yr, top, { mat: W });
  for (let i = 0; i < 3; i++) B.win(r.w + sx * (0.25 + 0.25 * i) - 0.5, r.w + sx * (0.25 + 0.25 * i) + 0.5, yr + 5.2, yr + 6.2, { n: 0 });
  B.door(r.w + sx * 0.36, { w: 1.0, h: 2.05, y0: yr, canopy: 0.7, leaf: lm('door'), plate: false }); B.done();
  rwp(S, B.put, r.e - 0.4, top - 0.1, yr + 0.1);
  // after dusk the floodlights are on: the characters glow
  if (ctx.animate) ctx.animate((dt, t, env) => { const n = env && env.lighting && env.lighting.night ? env.lighting.night() : 0; sign.material.emissiveIntensity = 0.75 * n; });
  finish(S, item, ctx, b.cx, b.cz, b.sz / 2 + (S.low ? 60 : 90));
}
