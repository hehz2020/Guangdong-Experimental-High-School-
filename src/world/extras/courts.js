// Eight basketball courts south of the gymnasium, from CAMPUS.courts: 4 columns by 2 rows, long axis north-south, keys
// backing onto a central east-west band. Paint follows the 2018 footage (frames 15-23): dark green courts with white
// lines, red keys and centre discs, red-brown divider bands, one court (north row, third from west) in bright teal with a
// pink-red surround, and a plain orange disc at the centre of the north-west court (the real one is a logo; no
// lettering was legible, so none is drawn).
// ASSUMED: court size 15 x 28 m (not measured), hoop design, fence height and gate positions. The slogan boards on the
// east edge are left blank: only a few characters were legible.
import { THREE, mat, flat } from '../../kit.js';
import { Batch } from '../../batch.js';
import { tree } from '../../plants.js';

function courtTexture(base, surround, disc) {
  const S = 20, cw = 15 * S, ch = 28 * S, c = document.createElement('canvas'); c.width = cw; c.height = ch; const g = c.getContext('2d');
  g.fillStyle = surround; g.fillRect(0, 0, cw, ch); g.fillStyle = base; g.fillRect(4, 4, cw - 8, ch - 8);
  g.strokeStyle = '#ffffff'; g.lineWidth = 2.5; g.strokeRect(5, 5, cw - 10, ch - 10);
  g.beginPath(); g.moveTo(5, ch / 2); g.lineTo(cw - 5, ch / 2); g.stroke();
  g.fillStyle = disc; g.beginPath(); g.arc(cw / 2, ch / 2, 1.8 * S, 0, Math.PI * 2); g.fill(); g.stroke();
  for (const end of [0, 1]) {
    const y = end ? ch - 5 : 5, d = end ? -1 : 1;
    g.fillStyle = '#b5483c'; g.fillRect(cw / 2 - 2.45 * S, Math.min(y, y + d * 5.8 * S), 4.9 * S, 5.8 * S); g.strokeRect(cw / 2 - 2.45 * S, Math.min(y, y + d * 5.8 * S), 4.9 * S, 5.8 * S);
    g.beginPath(); g.arc(cw / 2, y + d * 5.8 * S, 1.8 * S, 0, Math.PI * 2); g.stroke();
    g.beginPath(); g.arc(cw / 2, y + d * 1.575 * S, 6.75 * S, end ? Math.PI * 1.07 : Math.PI * 0.07, end ? Math.PI * 1.93 : Math.PI * 0.93); g.stroke();
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}

export function build(ctx) {
  const C = ctx.campus.courts; if (!C) return;
  const { block: k, columnCentresX: xs, rowCentresZ: zs, hoopBandZ } = C, [cw, cl] = C.courtSize;
  ctx.add(flat([[k.w, k.n], [k.e, k.n], [k.e, k.s], [k.w, k.s]], 0.03, mat('courtRed')));
  const green = new THREE.MeshStandardMaterial({ map: courtTexture('#2f6f4f', '#2f6f4f', '#b5483c'), roughness: 0.9 });
  const teal = new THREE.MeshStandardMaterial({ map: courtTexture('#1fb5a8', '#d9567a', '#d9567a'), roughness: 0.9 });
  const logo = new THREE.MeshStandardMaterial({ map: courtTexture('#2f6f4f', '#2f6f4f', '#e8892a'), roughness: 0.9 });
  const v = new Batch(), c = new Batch();
  zs.forEach((z, row) => xs.forEach((x, col) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(cw, cl), row === 0 && col === 2 ? teal : row === 0 && col === 0 ? logo : green);
    m.rotation.x = -Math.PI / 2; m.position.set(x, 0.05, z); m.receiveShadow = true; ctx.add(m);
    for (const end of [-1, 1]) {                                   // hoop stand at each end: post, arm, backboard, ring
      const zb = z + end * (cl / 2 + 0.9);
      v.frame(x, zb).box('apronGreen', 0, 1.6, 0, 0.18, 3.2, 0.18).box('apronGreen', 0, 3.15, -end * 0.9, 0.12, 0.12, 1.8)
        .box('white', 0, 3.4, -end * 1.85, 1.8, 1.05, 0.05).box('red', 0, 3.05, -end * 2.1, 0.5, 0.04, 0.45);
      c.frame(x, zb).box('generic', 0, 1.6, 0, 0.3, 3.2, 0.3);
    }
  }));
  // fence (visual mesh plus thin colliders) with a gate gap in the middle of each side
  const mesh = new THREE.MeshStandardMaterial({ color: 0x9aa3a0, roughness: 0.6, transparent: true, opacity: 0.22, side: THREE.DoubleSide, depthWrite: false });
  const run = (x0, z0, x1, z1) => { const len = Math.hypot(x1 - x0, z1 - z0), a = Math.atan2(-(z1 - z0), x1 - x0);
    v.frame(x0, z0, a).slab(mesh, 0, 0, -0.01, len, 3, 0.02); c.frame(x0, z0, a).slab('generic', 0, 0, -0.05, len, 3, 0.1);
    for (let d = 0; d <= len; d += 4) v.slab('steel', d - 0.04, 0, -0.04, 0.08, 3.1, 0.08); };
  const gx = (k.w + k.e) / 2, gz = (k.n + k.s) / 2, g = 2.5;
  run(k.w, k.n, k.w, gz - g); run(k.w, gz + g, k.w, k.s); run(k.e, k.n, k.e, gz - g); run(k.e, gz + g, k.e, k.s);
  run(k.w, k.s, gx - g, k.s); run(gx + g, k.s, k.e, k.s);
  for (let i = 0; i < 6; i++) tree(v, k.w - 4.5, k.n + 6 + i * (k.s - k.n - 12) / 5, 8 + (i % 3));
  for (let i = 0; i < 14; i++) { const z = k.n + 5 + i * (k.s - k.n - 10) / 13; v.frame(k.e + 1.6, z).box('white', 0, 1.9, 0, 0.06, 1.2, 1.2).box('apronGreen', 0, 0.65, 0, 0.06, 1.3, 0.06); }
  ctx.add(v.build({ name: 'courts' }));
  const cg = c.build(); ctx.add(cg).visible = false; cg.children.forEach(m => ctx.collide(m));
}
