// Things beside the athletics field (the track, the pitch, goals and field-event areas are in extras/athletics.js):
// a railing along the east straight, the retired fighter jet displayed outside the south-west bend, and the
// flag-raising platform.
//
// SEEN: a pale delta-winged jet outside the south-west bend, nose toward the east-north-east (2022 sports-day footage,
// frames 79-81, from high above). Nothing else.
// ASSUMED: the jet's position to within several metres (read off a video frame); the flag platform's position (the
// footage only places a flagpole south of the arc building's west end and north-west of the gymnasium).
// IMAGINED: the aircraft itself. It is drawn as a single-engine delta-wing fighter of the kind schools in China are given
// for display (round nose intake with a centre cone, bubble canopy, swept fin), about 15 m long, bare metal, standing on
// its undercarriage on three low piers in a paved circle with posts and chains, a stone with a plate and two
// floodlights. Its type, markings and mounting are not known; the number on the nose, the red band on the fin and the
// plate's text ("国防教育展品") are made up. The flag platform is a
// stepped granite podium with three poles, the national flag between a school flag (a simplified emblem, see signs.js)
// and a plain green one; the real platform was not seen. The railing and its length are imagined too.
//
// Collision: the aircraft's fuselage and wings as two blocks, the piers, the stone, the podium and its poles.
import { THREE } from '../../kit.js';
import { Batch } from '../../batch.js';
import { pbr, plain, rng } from '../../hifi.js';
import { emblemTexture, textTexture } from '../../signs.js';
import { LIT } from '../../street.js';

/** Circles the landscape keeps its own trees, lamps and benches out of: [x, z, radius]. */
export const KEEP_OUT = [[-40, 81, 13], [64, -60, 8]];

/** Body of revolution along local +X: profile [[x, radius]...] from tail to nose; squash flattens it vertically. */
function spindle(profile, seg = 20, squash = 1) {
  const pos = [], nor = [], uv = [], idx = [], x0 = profile[0][0], x1 = profile[profile.length - 1][0];
  profile.forEach(([x, r], i) => {
    const a = profile[Math.max(0, i - 1)], b = profile[Math.min(profile.length - 1, i + 1)], slope = (b[1] - a[1]) / ((b[0] - a[0]) || 1);
    for (let j = 0; j <= seg; j++) { const t = j / seg * Math.PI * 2, c = Math.cos(t), s = Math.sin(t), n = new THREE.Vector3(-slope, c, s).normalize();
      pos.push(x, r * c * squash, r * s); nor.push(n.x, n.y, n.z); uv.push((x - x0) / (x1 - x0), j / seg); }
  });
  for (let i = 0; i < profile.length - 1; i++) for (let j = 0; j < seg; j++) { const a = i * (seg + 1) + j, b = a + seg + 1; idx.push(a, a + 1, b, b, a + 1, b + 1); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); return g;
}
/** Thin tapered plate (a wing, a fin): four corners root-leading, root-trailing, tip-trailing, tip-leading; half thickness at root and tip along `up`. */
function plate(v, material, [a, b, c, d], up, tr, tt) {
  const P = (p, k) => [p[0] + up[0] * k, p[1] + up[1] * k, p[2] + up[2] * k];
  v.quad(material, P(a, tr), P(b, tr), P(c, tt), P(d, tt)).quad(material, P(d, -tt), P(c, -tt), P(b, -tr), P(a, -tr))
    .quad(material, P(a, -tr), P(a, tr), P(d, tt), P(d, -tt)).quad(material, P(b, tr), P(b, -tr), P(c, -tt), P(c, tt)).quad(material, P(d, tt), P(c, tt), P(c, -tt), P(d, -tt));
}
function airframeTexture() {
  const W = 1024, H = 256, cv = document.createElement('canvas'); cv.width = W; cv.height = H; const g = cv.getContext('2d'), r = rng(8101);
  const base = g.createLinearGradient(0, 0, 0, H); base.addColorStop(0, '#c9cdd0'); base.addColorStop(0.5, '#b4b9bd'); base.addColorStop(1, '#c9cdd0'); g.fillStyle = base; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 46; i++) { const x = Math.round(r() * W), w = 14 + r() * 60; g.fillStyle = `rgba(${r() < 0.5 ? '255,255,255' : '70,76,82'},${0.05 + 0.08 * r()})`; g.fillRect(x, Math.round(r() * 4) * H / 4, w, H / 4); }   // skin panels of slightly different metal
  g.strokeStyle = 'rgba(52,58,64,0.55)'; g.lineWidth = 1.2;
  for (let i = 1; i < 26; i++) { const x = i * W / 26 + (r() - 0.5) * 8; g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); }
  for (let j = 0; j < 8; j++) { const y = j * H / 8; g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
  g.fillStyle = 'rgba(40,44,50,0.5)'; for (let i = 1; i < 26; i++) for (let y = 4; y < H; y += 8) g.fillRect(i * W / 26 - 3, y, 1.5, 1.5);       // rivets
  for (let i = 0; i < 30; i++) { const x = r() * W, y = r() * H; const st = g.createLinearGradient(x, 0, x + 60 + r() * 90, 0); st.addColorStop(0, 'rgba(60,54,46,0.16)'); st.addColorStop(1, 'rgba(60,54,46,0)'); g.fillStyle = st; g.fillRect(x, y, 150, 2 + r() * 4); }   // streaks
  // a made-up number on both sides of the nose: a palindrome of figures that are the same upside down and mirrored, because
  // the skin texture runs round the body and one side shows it flipped
  g.fillStyle = '#b3201a'; g.font = 'bold 34px "Arial Narrow",Arial,sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
  for (const v of [0.25, 0.75]) g.fillText('80808', W * 0.79, H * v);
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8; return t;
}
function flagTexture(kind) {
  const W = 480, H = 320, cv = document.createElement('canvas'); cv.width = W; cv.height = H; const g = cv.getContext('2d');
  if (kind === 'national') {
    // the national flag: red field 3:2, a large star in the upper hoist quarter with four small ones round it, each
    // pointing at the centre of the large one (positions on the 30 x 20 construction grid)
    g.fillStyle = '#de2910'; g.fillRect(0, 0, W, H);
    const u = W / 30, star = (cx, cy, rad, rot) => { g.beginPath(); for (let i = 0; i < 5; i++) { const a = rot + i * Math.PI * 4 / 5; g[i ? 'lineTo' : 'moveTo'](cx + Math.sin(a) * rad, cy - Math.cos(a) * rad); } g.closePath(); g.fill(); };
    g.fillStyle = '#ffde00'; star(5 * u, 5 * u, 3 * u, 0);
    for (const [x, y] of [[10, 2], [12, 4], [12, 7], [10, 9]]) star(x * u, y * u, u, Math.atan2(5 * u - x * u, -(5 * u - y * u)));
  } else if (kind === 'school') {
    g.fillStyle = '#ffffff'; g.fillRect(0, 0, W, H); g.fillStyle = '#1f8a4c'; g.fillRect(0, H * 0.82, W, H * 0.18);
    const em = emblemTexture(null).image; g.drawImage(em, W / 2 - 100, H * 0.4 - 100, 200, 200);
  } else { g.fillStyle = '#1f8a4c'; g.fillRect(0, 0, W, H); g.fillStyle = '#ffffff'; g.fillRect(0, H * 0.46, W, H * 0.08); }
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}

export function build(ctx) {
  const t = ctx.campus.track, R = t.outerRadius, v = new Batch(), c = new Batch(), low = !!ctx.lowPower;
  const steel = pbr('steel'), stone = pbr('paving', [0xa8a39a, 0x9a958c, 2, 2, [1.6, 1.6], 17, false]), granite = pbr('granitePolished', [0x6e2420]), greyGranite = pbr('granitePolished', [0x6f6a66, 9]),
    setts = pbr('setts'), dark = plain('darkmetal', 0x2b2d30, 0.5, 0.6), lamp = plain('lamp', 0xfff1d6, 0.4, 0, { emissive: 0xffe2b0, emissiveIntensity: 1.4 }), gold = plain('goldtrim', 0xd8a93a, 0.35, 0.9), concrete = pbr('concrete', [0xbdb9b0]);

  // ---- railing along the east straight (visual only, so it does not fence the player out)
  const railX = t.cx + R + 1.0;                                         // at the kerb: the lane starts right beside the track here
  for (let z = -40; z <= 40; z += 2.5) v.frame(railX, t.cz + z).cyl(steel, 0, 0, 0, 0.03, 1.1, 8);
  v.frame(railX, t.cz).box(steel, 0, 1.1, 0, 0.06, 0.05, 80).box(steel, 0, 0.62, 0, 0.035, 0.035, 80).box(steel, 0, 0.2, 0, 0.035, 0.035, 80);
  v.frame();

  // ---- the display aircraft ------------------------------------------------------------------------------------------
  const [jx, jz] = KEEP_OUT[0], heading = 0.3, AX = 2.95;              // local +X (the nose) turned a little from east toward north; AX: height of the fuselage axis
  { // the paved circle, its kerb, posts with chains, piers
    const N = 40, ring = new Batch();
    v.frame(jx, jz).cyl(setts, 0, 0, 0, 11, 0.06, N).cyl(stone, 0, 0, 0, 11.35, 0.05, N);
    for (let i = 0; i < 16; i++) { const a = (i + 0.5) / 16 * Math.PI * 2, px = Math.cos(a) * 10.4, pz = Math.sin(a) * 10.4; if (Math.abs(i - 3.5) < 1) continue;   // a gap on the south side
      v.cyl(dark, px, 0.06, pz, 0.07, 0.85, 10).cyl(gold, px, 0.91, pz, 0.09, 0.07, 10); c.frame(jx, jz).box('generic', px, 0.5, pz, 0.2, 1, 0.2);
      const b = (i + 1.5) / 16 * Math.PI * 2; if (Math.abs(i + 1 - 3.5) < 1) continue;
      ring.strut(dark, [jx + px, 0.8, jz + pz], [jx + (px + Math.cos(b) * 10.4) / 2, 0.62, jz + (pz + Math.sin(b) * 10.4) / 2], 0.03).strut(dark, [jx + (px + Math.cos(b) * 10.4) / 2, 0.62, jz + (pz + Math.sin(b) * 10.4) / 2], [jx + Math.cos(b) * 10.4, 0.8, jz + Math.sin(b) * 10.4], 0.03); }
    ctx.add(ring.build({ name: 'jet-chains', castShadow: false }));
    // a stone with a plate, two floodlights
    v.frame(jx, jz, heading).box(greyGranite, 4.5, 0.55, 7.6, 2.2, 1.1, 0.5).box(gold, 4.5, 0.62, 7.86, 1.5, 0.6, 0.02);
    { // the plate's inscription (made up: such aircraft are given to schools for national-defence education)
      const { texture } = textTexture('国防教育展品', { color: '#3b2a10', background: '#d8a93a', pad: 0.22 }); texture.wrapS = texture.wrapT = THREE.RepeatWrapping; texture.repeat.set(1 / 1.3, 1 / 0.26);
      const m = new THREE.MeshStandardMaterial({ map: texture, roughness: 0.4, metalness: 0.7 }); m.name = 'hifi-plate-text';
      v.quad(m, [3.85, 0.56, 7.875], [5.15, 0.56, 7.875], [5.15, 0.82, 7.875], [3.85, 0.82, 7.875]); }
    c.frame(jx, jz, heading).box('generic', 4.5, 0.55, 7.6, 2.2, 1.1, 0.5);
    for (const [fx, fz] of [[7.5, 5.5], [-7.5, 5.5]]) { v.frame(jx, jz, heading).box(dark, fx, 0.2, fz, 0.4, 0.3, 0.3).box(lamp, fx, 0.36, fz, 0.3, 0.02, 0.2); const cs = Math.cos(heading), sn = Math.sin(heading); LIT.push([jx + fx * cs * 0.6 + fz * sn * 0.6, jz - fx * sn * 0.6 + fz * cs * 0.6, 9]); }
  }
  {
    const jet = new THREE.Group(), b = new Batch(), skinTex = airframeTexture();
    const skin = new THREE.MeshStandardMaterial({ map: skinTex, roughness: 0.34, metalness: 0.85, envMapIntensity: 1.1 }); skin.name = 'hifi-airframe';
    const metal = plain('airframe-plain', 0xbfc4c8, 0.36, 0.85, { side: THREE.DoubleSide }), hollow = plain('airframe-dark', 0x16181a, 0.7, 0.3, { side: THREE.DoubleSide }), tyre = plain('rubberblack', 0x1b1b1d, 0.85, 0);
    const canopy = new THREE.MeshStandardMaterial({ color: 0x1d3a44, roughness: 0.06, metalness: 0.7, envMapIntensity: 1.6, transparent: true, opacity: 0.82 }); canopy.name = 'hifi-canopy';
    const add = (geo, m, shadow = true) => { const mesh = new THREE.Mesh(geo, m); mesh.castShadow = shadow; mesh.receiveShadow = true; jet.add(mesh); return mesh; };
    const seg = low ? 14 : 24;
    add(spindle([[-7.2, 0.5], [-6.8, 0.56], [-5.4, 0.66], [-3.0, 0.72], [0, 0.72], [2.4, 0.69], [4.4, 0.61], [6.0, 0.51], [6.9, 0.43], [7.05, 0.4]], seg), skin);
    add(spindle([[6.45, 0.26], [6.8, 0.33], [7.05, 0.4]], seg), hollow, false);                               // intake duct
    add(spindle([[6.5, 0.24], [7.0, 0.14], [7.62, 0.0]], seg), metal);                                         // centre cone
    add(spindle([[-7.2, 0.5], [-6.9, 0.44], [-6.2, 0.36]], seg), hollow, false);                              // jet pipe
    add(spindle([[-7.28, 0.46], [-7.2, 0.5]], seg), plain('nozzle', 0x4a4540, 0.5, 0.8));
    const bubble = new THREE.SphereGeometry(1, 20, 12); bubble.scale(1.55, 0.46, 0.42); bubble.translate(3.7, 0.5, 0); add(bubble, canopy, false);
    b.box(metal, 3.7, 0.56, 0, 0.05, 0.36, 0.86).box(metal, 2.55, 0.5, 0, 0.9, 0.3, 0.7);                         // canopy bow, fairing behind it
    b.box(metal, -1.2, 0.72, 0, 6.2, 0.26, 0.4);                                                               // spine
    for (const s of [-1, 1]) {
      plate(b, metal, s > 0 ? [[2.3, -0.08, 0.6], [-3.5, -0.08, 0.6], [-3.4, -0.08, 3.6], [-2.8, -0.08, 3.6]] : [[-3.5, -0.08, -0.6], [2.3, -0.08, -0.6], [-2.8, -0.08, -3.6], [-3.4, -0.08, -3.6]], [0, 1, 0], 0.085, 0.022);
      plate(b, metal, s > 0 ? [[-4.7, 0.02, 0.5], [-6.5, 0.02, 0.5], [-6.9, 0.02, 1.95], [-6.35, 0.02, 1.95]] : [[-6.5, 0.02, -0.5], [-4.7, 0.02, -0.5], [-6.35, 0.02, -1.95], [-6.9, 0.02, -1.95]], [0, 1, 0], 0.04, 0.016);
      b.box(metal, 0.4, -0.2, s * 2.1, 2.6, 0.12, 0.07);                                                        // wing fence / pylon
      b.strut(metal, [-1.3, -0.1, s * 1.45], [-1.3, -1.55, s * 1.6], 0.09).strut(metal, [-1.3, -0.5, s * 1.5], [-0.6, -0.1, s * 1.1], 0.05);      // main legs
      b.frame().box(metal, -1.3, -0.75, s * 1.38, 1.1, 0.9, 0.03);                                             // gear doors
    }
    plate(b, metal, [[-2.4, 0.66, 0], [-6.7, 0.66, 0], [-7.35, 3.05, 0], [-6.4, 3.05, 0]], [0, 0, 1], 0.07, 0.02);            // fin
    plate(b, metal, [[-6.4, -0.6, 0], [-4.7, -0.6, 0], [-5.5, -1.1, 0], [-6.2, -1.1, 0]], [0, 0, 1], 0.03, 0.015);            // ventral fin
    b.box(plain('finflash', 0xb3201a, 0.5, 0.2), -6.75, 2.3, 0, 0.7, 0.34, 0.075);                               // a red band on the fin
    b.strut(metal, [7.0, -0.36, 0], [8.7, -0.4, 0], 0.035).strut(metal, [4.6, -0.5, 0], [4.75, -1.62, 0], 0.07);     // pitot boom, nose leg
    b.frame();
    jet.add(b.build());
    const wheel = new THREE.CylinderGeometry(0.33, 0.33, 0.2, 18); wheel.rotateX(Math.PI / 2);
    for (const [wx, wz, k] of [[-1.3, 1.62, 1], [-1.3, -1.62, 1], [4.78, 0, 0.75]]) { const w = add(wheel, tyre); w.position.set(wx, -AX + 0.92 + 0.33 * k, wz); w.scale.setScalar(k); const hub = add(new THREE.CylinderGeometry(0.14 * k, 0.14 * k, 0.22 * k, 12).rotateX(Math.PI / 2), metal, false); hub.position.copy(w.position); }
    jet.position.set(jx, AX, jz); jet.rotation.y = heading; jet.name = 'display-aircraft'; ctx.add(jet);
    // piers under the three wheels, and the colliders
    v.frame(jx, jz, heading); c.frame(jx, jz, heading);
    for (const [wx, wz] of [[-1.3, 1.62], [-1.3, -1.62], [4.78, 0]]) { v.box(concrete, wx, 0.49, wz, 1.3, 0.86, 1.0).box(greyGranite, wx, 0.94, wz, 1.4, 0.05, 1.1); c.box('generic', wx, 0.48, wz, 1.3, 0.96, 1.0); }
    c.box('generic', 0, AX, 0, 14.6, 1.6, 1.6).box('generic', -1.6, AX - 0.1, 0, 5.4, 0.4, 7.2).box('generic', -5.4, AX + 1.6, 0, 3.4, 2.6, 0.5);
  }

  // ---- the flag-raising platform (position assumed, see above) -------------------------------------------------------
  const [px, pz] = KEEP_OUT[1];
  v.frame(px, pz); c.frame(px, pz);
  v.box(stone, 0, 0.09, 0, 10.4, 0.18, 7.4).box(stone, 0, 0.27, 0, 9.6, 0.18, 6.6).box(granite, 0, 0.47, 0, 8.8, 0.22, 5.8).box(greyGranite, 0, 0.6, 0, 8.4, 0.04, 5.4);
  c.box('generic', 0, 0.09, 0, 10.4, 0.18, 7.4).box('generic', 0, 0.27, 0, 9.6, 0.18, 6.6).box('generic', 0, 0.47, 0, 8.8, 0.24, 5.8);
  for (const [x, z] of [[-4.1, -2.6], [4.1, -2.6], [-4.1, 2.6], [4.1, 2.6], [0, -2.6], [-2.05, -2.6], [2.05, -2.6]]) v.box(granite, x, 0.95, z, 0.26, 0.7, 0.26).box(granite, x, 1.34, z, 0.34, 0.08, 0.34);
  for (const x of [-3.07, -1.02, 1.02, 3.07]) v.box(greyGranite, x, 1.0, -2.6, 1.79, 0.5, 0.1).box(granite, x, 1.27, -2.6, 1.79, 0.06, 0.16);                    // back balustrade
  c.box('generic', 0, 1.0, -2.6, 8.5, 0.9, 0.3);
  const flags = [];
  for (const [x, h, kind] of [[0, 15, 'national'], [-2.6, 12, 'school'], [2.6, 12, 'plain']]) {
    v.box(granite, x, 0.78, -0.6, 0.9, 0.32, 0.9).cyl(steel, x, 0.94, -0.6, 0.085, h * 0.45, 12).cyl(steel, x, 0.94 + h * 0.45, -0.6, 0.065, h * 0.55, 12).cyl(gold, x, 0.94 + h, -0.6, 0.11, 0.12, 12).cyl(gold, x, 1.06 + h, -0.6, 0.05, 0.16, 8);
    c.box('generic', x, 2, -0.6, 0.3, 4, 0.3);
    // the flag: a cloth of 16 by 8 squares that waves (the vertices are moved every frame)
    const fw = kind === 'national' ? 2.88 : 2.4, fh = fw * 2 / 3, geo = new THREE.PlaneGeometry(fw, fh, 16, 8); geo.translate(fw / 2 + 0.09, 0, 0);
    const m = new THREE.MeshStandardMaterial({ map: flagTexture(kind), side: THREE.DoubleSide, roughness: 0.8 }); m.name = 'hifi-flagcloth';
    const mesh = new THREE.Mesh(geo, m); mesh.position.set(px + x, 0.94 + h - fh / 2 - 0.1, pz - 0.6); mesh.castShadow = true; mesh.name = 'flag'; ctx.add(mesh);
    flags.push({ mesh, rest: geo.attributes.position.array.slice(), fw, phase: x * 1.7 });
  }
  if (ctx.animate) ctx.animate((dt, time) => {
    for (const f of flags) { const p = f.mesh.geometry.attributes.position, a = p.array;
      for (let i = 0; i < p.count; i++) { const x = f.rest[i * 3], y = f.rest[i * 3 + 1], k = x / f.fw, w = time * 3.1 + f.phase;
        a[i * 3 + 2] = k * (0.16 * Math.sin(x * 3.2 - w) + 0.07 * Math.sin(x * 7.1 - w * 1.7 + y * 2.0)); a[i * 3 + 1] = y - k * k * 0.09 + k * 0.03 * Math.sin(x * 4.0 - w * 1.2); }
      p.needsUpdate = true; f.mesh.geometry.computeVertexNormals(); }
  });
  // planters with clipped shrubs at both ends of the podium
  for (const s of [-1, 1]) { v.box(granite, s * 5.9, 0.3, 0, 1.0, 0.6, 5.0).box(pbr('hedge', [0x2a4a22]), s * 5.9, 0.82, 0, 0.8, 0.5, 4.7); c.box('generic', s * 5.9, 0.5, 0, 1.0, 1.0, 5.0); }
  v.frame(); c.frame();
  ctx.add(v.build({ name: 'track-field' }));
  const cg = c.build(); ctx.add(cg).visible = false; cg.children.forEach(m => ctx.collide(m));
}
