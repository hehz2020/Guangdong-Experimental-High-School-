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
//   door set under a canopy, closed), windows set back in their openings, the dark base course, rainwater pipes, outdoor
//   units, dirt streaks, lightning rods; four small floodlights on the projecting slab that light the name after dusk
//   (the characters then glow as if lit).
// The lettering is exactly the text read from the frames. Not enterable: solid colliders (wing, parapets, box, slab).
import { bbox } from '../../kit.js';
import { signPlane } from '../../signs.js';
import { F, lm, shell, finish, hit, face, facade, grid, body, punch, doorOn, plinth, apron, rwp, ac, other, stain, lightning } from './plain-block.js';

const FH = 3.9;
export function build(item, ctx) {
  const S = shell(ctx), b = bbox(item.points), H = item.height, top = 26.4;   // top: about 4.5 m above the slabs' parapets (20.7 m roof + 1.2 m)
  const r = { w: b.w, e: b.e, n: b.n, s: b.s }, sx = b.sx, floors = Math.max(1, Math.round(H / FH)), W = lm('white'), CP = lm('cope'), CR = lm('cream');
  const yr = body(S, r, H, { faces: 'NW', roof: lm('roofBeige'), par: 0.9 });
  const PE = face('E', r.e), PW = face('W', r.w), PS = face('S', r.s), PN = face('N', r.n);
  // ---- west face (assumed): the slabs' pattern, the entrance in the middle bay
  grid(S, PW, r.n, r.s, floors, FH, { bay: 3.9, head: 3.0 });
  const nb = Math.round(b.sz / 3.9), ud = (r.n + r.s) / 2 + (nb % 2 ? 0 : b.sz / nb / 2);
  doorOn(S, 'W', r.w, ud, { w: 1.7, h: 2.3, glazed: true, fan: 0.45, canopy: 1.4, bars: lm('frameDark'), glass: lm('glassTeal') }); apron(ctx, 'W', r.w, ud, 3, 2.4);
  PW(S.v, lm('concrete'), ud - 1.4, ud + 1.4, 0, 0.14, 0, 1.2, 'FLRU'); hit(S, r.w - 1.2, 0, ud - 1.4, 1.2, 0.14, 2.8);
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
