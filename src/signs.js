// Lettering and emblems drawn on canvases at load time (no image files).
import * as THREE from 'three';

const CJK = '"Songti SC","STSong","SimSun","Noto Serif CJK SC","Source Han Serif SC","Noto Sans CJK SC","PingFang SC","Microsoft YaHei",serif';
/** Texture with one line of text. Returns { texture, aspect } where aspect = width / height. background null = transparent. */
export function textTexture(text, { color = '#c8201c', background = null, weight = 'bold', pad = 0.12, spacing = 0.18 } = {}) {
  const H = 256, c = document.createElement('canvas'), g = c.getContext('2d');
  const chars = [...text], size = H * (1 - 2 * pad);
  g.font = `${weight} ${size}px ${CJK}`;
  const widths = chars.map(ch => g.measureText(ch).width), gap = size * spacing;
  c.width = Math.ceil(widths.reduce((a, b) => a + b, 0) + gap * (chars.length + 1)); c.height = H;
  if (background) { g.fillStyle = background; g.fillRect(0, 0, c.width, H); }
  g.font = `${weight} ${size}px ${CJK}`; g.fillStyle = color; g.textBaseline = 'middle';
  let x = gap; chars.forEach((ch, i) => { g.fillText(ch, x, H / 2 + size * 0.04); x += widths[i] + gap; });
  const texture = new THREE.CanvasTexture(c); texture.colorSpace = THREE.SRGBColorSpace; texture.anisotropy = 8;
  return { texture, aspect: c.width / H };
}
/** Upright sign panel: centre (x, y, z), width, facing angle (0 = faces south, +Z; PI = faces north). */
export function signPlane(text, x, y, z, width, facing, opts = {}) {
  const { texture, aspect } = textTexture(text, opts);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(width, width / aspect), new THREE.MeshStandardMaterial({ map: texture, transparent: !opts.background, roughness: 0.6, metalness: opts.metal ? 0.5 : 0 }));
  m.position.set(x, y, z); m.rotation.y = facing; return m;
}
/**
 * School emblem as described from the footage: a green diamond with a red flame-like S and a white centre.
 * This is an approximation drawn from that verbal description, not a copy of the real emblem.
 */
export function emblemTexture(background = '#ffffff') {
  const S = 256, c = document.createElement('canvas'); c.width = c.height = S; const g = c.getContext('2d');
  if (background) { g.fillStyle = background; g.fillRect(0, 0, S, S); }
  g.fillStyle = '#1f8a4c'; g.beginPath(); g.moveTo(S / 2, 14); g.lineTo(S - 14, S / 2); g.lineTo(S / 2, S - 14); g.lineTo(14, S / 2); g.closePath(); g.fill();
  g.fillStyle = '#ffffff'; g.beginPath(); g.arc(S / 2, S / 2, 58, 0, Math.PI * 2); g.fill();
  g.strokeStyle = '#d0281f'; g.lineWidth = 22; g.lineCap = 'round'; g.beginPath();
  g.moveTo(S / 2 + 30, S / 2 - 40); g.bezierCurveTo(S / 2 - 50, S / 2 - 60, S / 2 - 50, S / 2, S / 2, S / 2); g.bezierCurveTo(S / 2 + 50, S / 2, S / 2 + 50, S / 2 + 60, S / 2 - 30, S / 2 + 40); g.stroke();
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
