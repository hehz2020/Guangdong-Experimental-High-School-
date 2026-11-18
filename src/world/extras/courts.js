// Eight basketball courts south of the gymnasium, from CAMPUS.courts: 4 columns by 2 rows, long axis north-south, keys
// backing onto a central east-west band. Paint follows the 2018 footage (frames 15-23): dark green courts with white
// lines, red keys and centre discs, red-brown divider bands, one court (north row, third from west) in bright teal with a
// pink-red surround, and a plain orange disc at the centre of the north-west court (the real one is a logo; no
// lettering was legible, so none is drawn).
// ASSUMED: court size 15 x 28 m (not measured), hoop design, fence height and gate positions. The slogan boards on the
// east edge are left blank: only a few characters were legible.
// IMAGINED for looks: the full line set of each court (three-point arcs, keys, free-throw circles, no-charge arcs),
// baskets with glass backboards and nets, the chain-link fence, benches and floodlight masts between the courts.
import { THREE, mat, flat } from '../../kit.js';
import { pbr, plain } from '../../hifi.js';
import { Batch } from '../../batch.js';
import { tree } from '../../plants.js';
import { LIT } from '../../street.js';

function courtTexture(base, surround, disc) {
  const S = 44, cw = 15 * S, ch = 28 * S, c = document.createElement('canvas'); c.width = cw; c.height = ch; const g = c.getContext('2d'), m = 0.12 * S;
  g.fillStyle = surround; g.fillRect(0, 0, cw, ch); g.fillStyle = base; g.fillRect(m, m, cw - 2 * m, ch - 2 * m);
  g.strokeStyle = '#f4f2ec'; g.lineWidth = 0.05 * S * 1.6; g.lineJoin = 'miter';
  g.strokeRect(m, m, cw - 2 * m, ch - 2 * m);
  g.beginPath(); g.moveTo(m, ch / 2); g.lineTo(cw - m, ch / 2); g.stroke();
  g.fillStyle = disc; g.beginPath(); g.arc(cw / 2, ch / 2, 1.8 * S, 0, Math.PI * 2); g.fill(); g.stroke();
  for (const end of [0, 1]) {
    const y = end ? ch - m : m, d = end ? -1 : 1, hoop = y + d * 1.575 * S;
    g.fillStyle = '#b5483c'; g.fillRect(cw / 2 - 2.45 * S, Math.min(y, y + d * 5.8 * S), 4.9 * S, 5.8 * S); g.strokeRect(cw / 2 - 2.45 * S, Math.min(y, y + d * 5.8 * S), 4.9 * S, 5.8 * S);
    g.beginPath(); g.arc(cw / 2, y + d * 5.8 * S, 1.8 * S, 0, Math.PI * 2); g.stroke();                                                   // free-throw circle
    g.beginPath(); g.moveTo(cw / 2 - 6.6 * S, y); g.lineTo(cw / 2 - 6.6 * S, y + d * 2.99 * S); g.stroke(); g.beginPath(); g.moveTo(cw / 2 + 6.6 * S, y); g.lineTo(cw / 2 + 6.6 * S, y + d * 2.99 * S); g.stroke();
    const a = Math.acos(6.6 / 6.75); g.beginPath(); end ? g.arc(cw / 2, hoop, 6.75 * S, Math.PI + a, 2 * Math.PI - a) : g.arc(cw / 2, hoop, 6.75 * S, a, Math.PI - a); g.stroke();   // three-point line
    g.beginPath(); end ? g.arc(cw / 2, hoop, 1.25 * S, Math.PI, 2 * Math.PI) : g.arc(cw / 2, hoop, 1.25 * S, 0, Math.PI); g.stroke();       // no-charge semicircle
    for (const s of [-1, 1]) for (const off of [1.75, 2.6, 3.45, 4.3]) { g.beginPath(); g.moveTo(cw / 2 + s * 2.45 * S, y + d * off * S); g.lineTo(cw / 2 + s * 2.6 * S, y + d * off * S); g.stroke(); }
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 16; return t;
}
function boardTexture() {
  const c = document.createElement('canvas'); c.width = 360; c.height = 210; const g = c.getContext('2d');
  g.fillStyle = 'rgba(214,232,236,0.92)'; g.fillRect(0, 0, 360, 210); g.strokeStyle = '#ffffff'; g.lineWidth = 10; g.strokeRect(5, 5, 350, 200);
  g.strokeStyle = '#e8622a'; g.lineWidth = 7; g.strokeRect(180 - 59, 210 - 30 - 90, 118, 90);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}
function meshTexture(cell, line) {
  const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'); g.strokeStyle = line; g.lineWidth = 4;
  g.beginPath(); g.moveTo(0, 32); g.lineTo(32, 0); g.lineTo(64, 32); g.lineTo(32, 64); g.closePath(); g.stroke();
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(1 / cell, 1 / cell); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
}

export function build(ctx) {
  const C = ctx.campus.courts; if (!C) return;
  const { block: k, columnCentresX: xs, rowCentresZ: zs, hoopBandZ } = C, [cw, cl] = C.courtSize;
  ctx.add(flat([[k.w, k.n], [k.e, k.n], [k.e, k.s], [k.w, k.s]], 0.03, mat('courtRed')));
  const court = (a, b, d) => { const m = new THREE.MeshStandardMaterial({ map: courtTexture(a, b, d), roughness: 0.82, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -4 }); m.name = 'hifi-court'; return m; };
  const green = court('#2f6f4f', '#2f6f4f', '#b5483c'), teal = court('#1fb5a8', '#d9567a', '#d9567a'), logo = court('#2f6f4f', '#2f6f4f', '#e8892a');
  const postGreen = plain('court-post', 0x2f6b52, 0.5, 0.3), rimOrange = plain('court-rim', 0xe8622a, 0.45, 0.4), steel = pbr('steel');
  const board = new THREE.MeshStandardMaterial({ map: boardTexture(), roughness: 0.15, metalness: 0.1, transparent: true, opacity: 0.95, side: THREE.DoubleSide }); board.name = 'hifi-backboard';
  const netMat = new THREE.MeshStandardMaterial({ map: meshTexture(0.07, 'rgba(255,255,255,0.95)'), alphaTest: 0.35, side: THREE.DoubleSide, roughness: 0.8 }); netMat.name = 'hifi-net';
  const rims = [], nets = [];
  const v = new Batch(), c = new Batch();
  zs.forEach((z, row) => xs.forEach((x, col) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(cw, cl), row === 0 && col === 2 ? teal : row === 0 && col === 0 ? logo : green);
    m.rotation.x = -Math.PI / 2; m.position.set(x, 0.05, z); m.receiveShadow = true; ctx.add(m);
    for (const end of [-1, 1]) {                                   // basket at each end: post behind the line, cantilever arm, glass board, rim, net
      const zb = z + end * (cl / 2 + 1.1), zf = z + end * (cl / 2 - 1.2), zr = zf - end * 0.38;      // post, board face, rim centre
      v.frame(x, zb).box(postGreen, 0, 1.45, 0, 0.2, 2.9, 0.2).box(postGreen, 0, 0.06, 0, 0.9, 0.12, 0.9).box(plain('court-pad', 0x1f4f8f, 0.8, 0), 0, 1.0, -end * 0.11, 0.32, 1.8, 0.04);
      v.frame(0, 0, 0).strut(postGreen, [x, 2.85, zb], [x, 3.25, zf + end * 0.12], 0.14).strut(postGreen, [x, 2.2, zb], [x, 3.0, zf + end * 0.12], 0.07); v.frame(0, 0, 0);
      const bm = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 1.05), board); bm.position.set(x, 3.425, zf); if (end > 0) bm.rotation.y = Math.PI; bm.castShadow = true; ctx.add(bm);
      v.frame(x, zf).box(steel, 0, 3.425, end * 0.03, 1.86, 1.11, 0.03).box(rimOrange, 0, 3.05, -end * 0.1, 0.12, 0.1, 0.2); v.frame(0, 0, 0);
      rims.push([x, 3.05, zr]); nets.push([x, 2.84, zr]);
      c.frame(x, zb).box('generic', 0, 1.6, 0, 0.3, 3.2, 0.3); c.frame(0, 0, 0);
    }
  }));
  { const M = new THREE.Matrix4(), rg = new THREE.TorusGeometry(0.225, 0.012, 6, 20); rg.rotateX(Math.PI / 2);
    const rim = new THREE.InstancedMesh(rg, rimOrange, rims.length), net = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.225, 0.13, 0.42, 12, 1, true), netMat, nets.length);
    rims.forEach((p, i) => rim.setMatrixAt(i, M.makeTranslation(...p))); nets.forEach((p, i) => net.setMatrixAt(i, M.makeTranslation(...p)));
    rim.castShadow = true; rim.frustumCulled = net.frustumCulled = false; ctx.add(rim); ctx.add(net); }
  // fence: chain-link mesh on posts with a top rail (visual plus thin colliders), a gate gap in the middle of each side
  const mesh = new THREE.MeshStandardMaterial({ map: meshTexture(0.09, 'rgba(150,160,158,1)'), alphaTest: 0.3, roughness: 0.5, metalness: 0.5, side: THREE.DoubleSide }); mesh.name = 'hifi-chainlink';
  const run = (x0, z0, x1, z1) => { const len = Math.hypot(x1 - x0, z1 - z0), a = Math.atan2(-(z1 - z0), x1 - x0);
    v.frame(x0, z0, a).slab(mesh, 0, 0, -0.01, len, 3, 0.02); c.frame(x0, z0, a).slab('generic', 0, 0, -0.05, len, 3, 0.1);
    for (let d = 0; d <= len; d += 3) v.slab(postGreen, d - 0.04, 0, -0.04, 0.08, 3.1, 0.08); v.slab(postGreen, 0, 3.0, -0.03, len, 0.06, 0.06).slab(postGreen, 0, 0.02, -0.03, len, 0.05, 0.06); };
  const gx = (k.w + k.e) / 2, gz = (k.n + k.s) / 2, g = 2.5;
  run(k.w, k.n, k.w, gz - g); run(k.w, gz + g, k.w, k.s); run(k.e, k.n, k.e, gz - g); run(k.e, gz + g, k.e, k.s);
  run(k.w, k.s, gx - g, k.s); run(gx + g, k.s, k.e, k.s);
  // just outside the west fence: the road between the track and the courts lies further west
  for (let i = 0; i < 6; i++) tree(v, k.w - 1.6, k.n + 6 + i * (k.s - k.n - 12) / 5, 7 + (i % 3) * 0.6);
  for (let i = 0; i < 14; i++) { const z = k.n + 5 + i * (k.s - k.n - 10) / 13; v.frame(k.e + 1.6, z).box('white', 0, 1.9, 0, 0.06, 1.2, 1.2).box('apronGreen', 0, 0.65, 0, 0.06, 1.3, 0.06); }
  // benches along the divider band and four floodlight masts
  const timber = pbr('timber'), lampM = plain('court-lamp', 0xfff4dc, 0.4, 0, { emissive: 0xffe9c0, emissiveIntensity: 1.6 });
  for (const x of xs) for (const s of [-1, 1]) { v.frame(x + 5.2, hoopBandZ + s * 0.9).box(steel, -0.8, 0.2, 0, 0.05, 0.4, 0.34).box(steel, 0.8, 0.2, 0, 0.05, 0.4, 0.34).box(timber, 0, 0.43, 0, 1.9, 0.05, 0.38); }
  for (const x of [xs[0] - cw / 2 - 1.2, (xs[1] + xs[2]) / 2, xs[3] + cw / 2 + 1.2]) { v.frame(x, hoopBandZ).cyl(steel, 0, 0, 0, 0.11, 9, 12).box(steel, 0, 9.05, 0, 0.16, 0.16, 2.6);
    for (const s of [-1, 1]) v.box(plain('court-lamphead', 0x2b2d30, 0.5, 0.5), 0, 8.95, s * 1.1, 0.7, 0.14, 0.42).box(lampM, 0, 8.87, s * 1.1, 0.62, 0.03, 0.34); c.frame(x, hoopBandZ).box('generic', 0, 4.5, 0, 0.3, 9, 0.3); for (const s of [-1, 1]) LIT.push([x, hoopBandZ + s * 4, 17]); }
  v.frame(0, 0, 0); c.frame(0, 0, 0);
  ctx.add(v.build({ name: 'courts' }));
  const cg = c.build(); ctx.add(cg).visible = false; cg.children.forEach(m => ctx.collide(m));
}
