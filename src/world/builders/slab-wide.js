// West teaching slab (item teaching-slab-west), just north of the gymnasium, inside and out.
//
// SEEN in the 2018 footage, all from the west or south-west and from far away (frames 43, 53, 58, 67-69):
//   - west end, from north to south: a white end bay with two columns of small square windows, a dark-red full-height
//     wall panel, then white slab-and-balustrade bands with dark gaps between them (five bands above the trees);
//   - a thin flat white roof slab that floats on thin posts above the top of the walls and overhangs the west end;
//   - a full-height green glass stair tower with tall white fins south of all that. It is a separate item
//     (teaching-slab-west-annex-w, builder stair-core.js) and is NOT modelled here; the balustrades of the upper storeys
//     leave a bay free where that tower opens onto the corridors.
// READ FROM THE SATELLITE MOSAIC (second reading, shots/measure; stored here only as numbers):
//   - the roof: cream, 47.8 m long; its north edge steps 2.4 m south for the eastern 18 m; the west end is pointed
//     (tip 1.1 m west of the north-west corner and 2.9 m south of it, then a diagonal to the south edge 4.3 m east);
//   - a bright line 11 m south of the north edge (drawn as a low white kerb) and a greyer strip 2.5 m wide beyond it
//     between 4.7 and 41.2 m from the west end (drawn as part of the roof slab; what it really is, is not established);
//   - five or six small dark squares along the roof, one at the west tip and two at the step (drawn as low dark units;
//     whether they are units or openings cannot be told);
//   - the north facade, seen obliquely: floor lines and closely spaced vertical lines. Only that much is taken from it:
//     five window bands with white piers. The data item is still the plain bounding rectangle, so the step and the
//     pointed end are kept in SHAPE below as offsets from its north-west corner; a polygon in the data replaces them.
//
// ASSUMED in the first pass (no reference shows any of it): five storeys of 3.6 m, a parapeted roof deck at 18 m with
//   the roof slab floating 2.35 m above it; ONE row of rooms 8 m deep on the north (5.6 m behind the stepped part) and an
//   open corridor 2.7 m wide on the south with columns, edge beams and solid balustrades; a closed block at the west end
//   behind the small square windows (not enterable); a staircase inside the east end, there so that the corridors can be
//   reached on foot (the real stairs are in the glass tower). plan() below holds all of it as numbers.
//
// IMAGINED (the owner asked for a complete, believable building, "a work of art", and said that it need not be factual:
// where nothing is known, imagination fills in). None of the following is taken from a reference:
//   - the NAME: 实验楼 (laboratory building), on the parapet, on a black plate by the stair hall and on every door plate.
//     It is made up; the real name of this building is not known to this project. So are all room numbers, class names
//     (高一（1）班 ...), the uses of the rooms (classrooms; a teachers' office per storey; behind the step a chemistry and
//     a biology laboratory with their preparation rooms on the two lower floors, a small classroom and an office above),
//     the names on the west block's doors, and every word on boards, posters, signs and charts;
//   - outside: aluminium windows with two sliding sashes and a top light, some slid open; curtains behind them; glazing
//     with a tilt per pane; sills; air-conditioner condensers on brackets with their pipes and drain stacks; rainwater
//     pipes with hoppers; a granite plinth and column bases; a paved apron with a drain and a low granite threshold
//     (the ground floor is level with the ground, so there are no real entrance steps); a clipped hedge along the north
//     face; planters between columns; wall lamps; weathering streaks under sills, copings and scuppers; water tanks and
//     plant on the roof deck; lightning rods and a conductor on the roof slab;
//   - corridors: tiled floor with a dark border, tiled dado with a green line, tube lights, timber doors with fanlights
//     standing open, door plates, notice boards with posters, bins, lockers or a bench under the windows of the upper
//     storeys, potted plants along the balustrade, water dispensers in a niche, hose cabinets, extinguishers, exit signs,
//     storey numbers, an evacuation plan, a directory;
//   - rooms: classrooms (platform, teacher's desk with monitor and exercise books, chalk board with lesson notes, flag
//     and the school's published motto 爱国 团结 求实 创新 over it, clock, timetable, duty roster, projector and screen,
//     pupils' desks in pairs, singly or in islands with bags, books, pencil cases and bottles, lockers, the class's chalk
//     drawing and a slogan on the back wall, cabinet air-conditioner, water dispenser, broom corner, book corner with the
//     class's notice wall, certificates, fans that turn, tube lights); no two classrooms have the same board, drawing,
//     layout and colours. Teachers' offices (desks between screens, monitors, piles of exercise books, swivel chairs,
//     cabinets of files, a white board, printer, water, plants). Laboratories (benches with sinks, taps and gas taps,
//     stools, glassware and reagent bottles or microscopes, a fume cupboard or a skeleton, glazed cabinets, the periodic
//     table or biology charts, safety rules, coats on hooks). Preparation rooms (racks of bottles, jars and boxes, closed
//     cabinets, a cabinet for dangerous chemicals or cases of microscopes, refrigerator, work table, trolley, sink);
//   - the staircase's finish: terrazzo treads with dark nosings, stringers, balusters, handrails, signs.
// Lettering uses whatever CJK fonts the browser has; the lesson notes are textbook commonplaces, not copied from anything.
// Second refinement round: the painters, the card helper and the two sheets are exported (sharedSheets) so that the east
// slabs (teaching-slab.js) draw their boards and posters with the same hand without a second copy; the white and dark-red
// facade tile is the kit's farTile (plain-block.js), whose coarse mipmaps fade to the mean colour (no checkerboard from afar).
//
// How it is built: plain-coloured parts are merged into one vertex-coloured mesh per finish; everything printed or written
// is a card cut from two texture sheets drawn in code; desks, chairs, fans, plants and small objects are instanced.
// Tiers: shell (always drawn: walls, windows, curtains, condensers, lamps), fittings (corridors, stairs, roof plant),
// interiors, fine objects; the last three sit behind ctx.detail, and ctx.lowPower thins them and halves the sheets.
// Colliders: walls, balustrades (1.7 m tall where the visible one is lower: a jump clears 1.1 m), floors, stair ramps,
// and blocks for large furniture (lockers, cabinets, benches, the teacher's desk, office clusters, planters, pots).
// Pupils' desks, chairs and stools have none, so one can walk among them. The platform is not a step. The roof slab is
// solid for the player. After dusk the ceilings, walls and panes glow (ctx.animate): the lights are on. The apron and the
// hedge reach half a metre beyond the item's outline; they are reported with ctx.occupy.
import { THREE } from '../../kit.js';
import { Batch } from '../../batch.js';
import { pbr, SURFACES } from '../../hifi.js';
import { LIT } from '../../street.js';
import { shrubs } from '../../flora.js';
import { farTile } from './plain-block.js';

const FLOORS = 5, WALL = 0.24, SLAB = 0.35, PARAPET = 1.1, GAP = 1.25, CORRIDOR = 2.85, STEPS = 12, GO = 0.3, FLIGHT = 1.3, BAY = 4.8;
const SILL = 0.9, HEAD = 2.85;                         // north windows
const OVER = { w: 1.5, n: 0.8, e: 0.3 };               // how far the roof slab overhangs the walls
// second reading of the mosaic, metres from the north-west corner of the roof rectangle (used while the data item is a rectangle)
const SHAPE = { stepX: 29.9, stepZ: 2.4, tip: [-1.1, 2.9], cutX: 4.3, strip: 2.5 };
const STRIP_X = [4.7, 41.2], KERB_X = [4.3, 41.2];
const UNITS = [[0.03, 3.2, 1.2], [0.195, 4.0, 2.0], [0.4, 4.0, 2.0], [0.59, 3.3, 1.6], [0.6, 6.8, 1.6], [0.79, 5.9, 2.0]];   // [fraction of the length, metres south of the north edge, size]

/**
 * Every position of the plan, in metres in the slab's own frame: origin (ox, oz) = north-west corner of the roof
 * rectangle, x east, z south. Pure numbers (no geometry), so walk tests can import it and stay in step with the builder.
 */
export function plan(item, campus) {
  const P = item.points, n = Math.min(...P.map(q => q[1])), s = Math.max(...P.map(q => q[1])), e = Math.max(...P.map(q => q[0]));
  const northX = P.filter(q => q[1] < n + 0.5).map(q => q[0]), w = Math.min(...northX), L = e - w, H = item.height;
  let { stepX, stepZ, tip, cutX, strip } = SHAPE;
  if (P.length > 4) {                                  // a polygon in the data: read the step, the tip and the cut corner from it; it ends at the bright line
    const ne = Math.max(...northX), t = P.reduce((a, b) => (b[0] < a[0] ? b : a));
    stepX = ne < e - 1 ? ne - w : L; stepZ = ne < e - 1 ? Math.min(...P.filter(q => q[0] > e - 0.5).map(q => q[1])) - n : 0;
    tip = t[0] < w - 0.3 ? [t[0] - w, t[1] - n] : [0, 0]; cutX = Math.max(0, Math.min(...P.filter(q => q[1] > s - 0.5).map(q => q[0])) - w); strip = 0;
  }
  const zP = s - n - strip;                            // the bright line
  const FH = (H - SLAB - GAP - PARAPET) / FLOORS, roofY = FLOORS * FH;
  const X0 = OVER.w, X1 = L - OVER.e, zN = OVER.n, zS = zP + 1.0, zc = zS - CORRIDOR, zw = zc - 0.2;
  // the glass stair tower may reach into the west end: keep the rooms east of it
  let aE = -Infinity;
  for (const it of (campus && campus.items) || []) if (it.style === 'stair-core' && it.points) {
    const ax = it.points.map(q => q[0] - w), az = it.points.map(q => q[1] - n);
    if (Math.min(...ax) < X0 + 3 && Math.max(...ax) > X0 && Math.max(...az) > zN && Math.min(...az) < zc) aE = Math.max(aE, Math.max(...ax));
  }
  const xA = Math.max(X0 + 4.4, aE + 0.35);            // east side of the closed west block
  const xs1 = X1 - WALL, xs0 = xs1 - 2 * FLIGHT - 0.2, xH = xs0 - 0.1;     // stair hall between xs0 and xs1
  const stepped = stepZ > 0.5 && stepX > xA + 8 && stepX < xH - 4;
  const zones = stepped ? [{ a: xA, b: stepX, zn: zN }, { a: stepX, b: xH, zn: zN + stepZ }] : [{ a: xA, b: xH, zn: zN }];
  const rooms = [];
  for (const z of zones) {
    const nb = Math.max(1, Math.round((z.b - z.a) / BAY)), bw = (z.b - z.a) / nb;
    z.lines = Array.from({ length: nb + 1 }, (_, i) => z.a + i * bw);
    for (let i = 0; i < nb;) {
      const take = nb - i >= 2 ? 2 : 1, a = z.a + i * bw;
      rooms.push({ a, b: a + take * bw, zn: z.zn, zi: z.zn + WALL, shallow: zw - z.zn - WALL < 7, bays: Array.from({ length: take }, (_, j) => [a + j * bw, a + (j + 1) * bw]) });
      i += take;
    }
  }
  if (rooms[rooms.length - 1].bays.length === 1) rooms[rooms.length - 1].niche = true;   // water-dispenser niche beside the stair hall (a one-door room has the wall for it)
  const run = STEPS * GO, zl = zc - 0.6, zh = zl - run, zsn = zones[zones.length - 1].zn + WALL;
  return { ox: w, oz: n, L, D: s - n, H, FH, FLOORS, roofY, X0, X1, zN, zP, zS, zc, zw, xA, xs0, xs1, xH, stepped, stepX, stepZ, tip, cutX, strip, zones, rooms,
    run, zl, zh, zsn, xb1: xs0 + FLIGHT, xa1: xs0 + FLIGHT + 0.2, xa2: xs1 };
}
/** What a room is used as on storey k (0 = ground). All assumed. */
export const kindOf = (r, k) => (r.bays.length === 1 ? (r.shallow && k < 2 ? 'prep' : 'office') : r.shallow && k < 2 ? 'lab' : 'class');
/** Door openings of a room: [west jamb, hinge side]; each is 1 m wide. */
export const doorsOf = r => (r.bays.length > 1 ? [[r.a + 0.6, 'W'], [r.b - 1.6, 'E']] : [[r.a + 0.6, 'W']]);
const winsOf = r => { const a = r.a + 2.1, b = r.bays.length > 1 ? r.b - 2.1 : r.b - (r.niche ? 1.75 : 0.8), m = (a + b) / 2; return b - a < 3.4 ? [[a, b]] : [[a, m - 0.7], [m + 0.7, b]]; };

// ---- invented names (door plates, the directory board, the lettering on the parapet) ----
const BUILDING = '实验楼', CN = ['一', '二', '三', '四', '五'];
const WEST_ROOMS = ['配电房', '器材室', '资料室', '储藏室', '广播室'];
/** Name on the door plate of room i on storey k. Every one of them is made up. */
function roomName(r, i, k) {
  const kind = kindOf(r, k), grade = k < 2 ? '高一' : k < 4 ? '高二' : '高三';
  if (kind === 'lab') return ['化学实验室', '生物实验室'][k] || '实验室';
  if (kind === 'prep') return ['化学准备室', '生物准备室'][k] || '准备室';
  if (kind === 'office') return r.shallow ? ['', '', '物理教研组', '化学教研组', '生物教研组'][k] || '教研组' : ['高一年级组', '教务处', '高二年级组', '教研室', '高三年级组'][k] || '办公室';
  return `${grade}（${r.shallow ? (k === 2 ? 5 : k === 3 ? 6 : 3) : (k < 4 ? (k % 2) * 2 : 0) + i + 1}）班`;
}

const ALL = 'EWUDSN', skipCache = {};
const skipOf = faces => skipCache[faces] ?? (skipCache[faces] = [...ALL].filter(f => !faces.includes(f)).join(''));
function rng(seed) { let s = (seed >>> 0) || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

// ================= pictures drawn in code =================
// Two texture sheets hold everything that is printed, painted or written: one for the chalk boards and wall charts, one
// for posters, plates and signs. A card is a quad that shows one rectangle of a sheet, so the whole building's lettering
// costs two textures and a handful of draw calls.
const CJK = '"PingFang SC","Microsoft YaHei","Noto Sans CJK SC","Source Han Sans SC","WenQuanYi Zen Hei",sans-serif';
const KAI = '"STKaiti","华文楷体","Kaiti SC","KaiTi","楷体","AR PL UKai CN","Songti SC","SimSun","Noto Serif CJK SC","WenQuanYi Zen Hei",serif';
const HAND = '"Segoe Print","Bradley Hand","Chalkboard SE","Comic Sans MS",' + KAI;
const TAU = Math.PI * 2;
const T = (g, s, x, y, px, col, font = CJK, align = 'left', weight = '') => { g.font = `${weight} ${px}px ${font}`; g.textAlign = align; g.textBaseline = 'middle'; g.fillStyle = col; g.fillText(s, x, y); };
const chalk = (g, s, x, y, px, col = '#eef0e6', align = 'left', font = KAI) => { g.globalAlpha = 0.9; T(g, s, x, y, px, col, font, align); g.globalAlpha = 0.3; g.fillText(s, x + 0.7, y + 0.5); g.globalAlpha = 1; };
const path = (g, pts, col, w = 2, close = false) => { g.strokeStyle = col; g.lineWidth = w; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); pts.forEach((q, i) => (i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]))); if (close) g.closePath(); g.stroke(); };
const arrow = (g, x0, y0, x1, y1, col, w = 1.6) => { const a = Math.atan2(y1 - y0, x1 - x0), h = 6; path(g, [[x0, y0], [x1, y1]], col, w); path(g, [[x1 - h * Math.cos(a - 0.5), y1 - h * Math.sin(a - 0.5)], [x1, y1], [x1 - h * Math.cos(a + 0.5), y1 - h * Math.sin(a + 0.5)]], col, w); };
const ring = (g, x, y, rx, ry, col, w = 1.6, fill = null) => { g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, TAU); if (fill) { g.fillStyle = fill; g.fill(); } if (col) { g.strokeStyle = col; g.lineWidth = w; g.stroke(); } };
const star = (g, cx, cy, R, rot, fill, line = null) => { g.beginPath(); for (let i = 0; i < 10; i++) { const a = rot + i * Math.PI / 5, rr = i % 2 ? R * 0.382 : R; g.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); } g.closePath(); if (fill) { g.fillStyle = fill; g.fill(); } if (line) { g.strokeStyle = line; g.lineWidth = 1.8; g.stroke(); } };
const rows = (g, x, y, w, n, pitch, col, h = 2.5, r = null) => { g.fillStyle = col; for (let i = 0; i < n; i++) g.fillRect(x, y + i * pitch, w * (i === n - 1 ? 0.55 : r ? 0.84 + 0.16 * r() : 1), h); };
const box = (g, x, y, w, h, fill, line = null, lw = 1) => { if (fill) { g.fillStyle = fill; g.fillRect(x, y, w, h); } if (line) { g.strokeStyle = line; g.lineWidth = lw; g.strokeRect(x + lw / 2, y + lw / 2, w - lw, h - lw); } };

class Atlas {
  constructor(name, low) {
    this.k = low ? 0.5 : 1; this.S = 2048 * this.k; this.c = document.createElement('canvas'); this.c.width = this.c.height = this.S;
    this.g = this.c.getContext('2d'); this.g.fillStyle = '#8a8a84'; this.g.fillRect(0, 0, this.S, this.S);
    this.x = 0; this.y = 0; this.row = 0; this.uv = {}; this.name = name; this.full = [];
  }
  /** Reserve w by h pixels (nominal: a low-power sheet is half size), draw the card with its top left corner as origin, keep its rectangle under `key`. */
  put(key, w, h, draw) {
    const P = Math.max(2, Math.round(4 * this.k)), pw = Math.round(w * this.k), ph = Math.round(h * this.k), g = this.g, S = this.S;
    if (this.x + pw > S) { this.x = 0; this.y += this.row + P; this.row = 0; }
    if (this.y + ph > S) { this.full.push(key); return (this.uv[key] = [0.001, 0.001, 0.003, 0.003]); }
    g.save(); g.translate(this.x, this.y); g.beginPath(); g.rect(0, 0, pw, ph); g.clip(); g.scale(pw / w, ph / h); draw(g, w, h); g.restore();
    this.uv[key] = [(this.x + 0.6) / S, 1 - (this.y + ph - 0.6) / S, (this.x + pw - 0.6) / S, 1 - (this.y + 0.6) / S];
    this.x += pw + P; this.row = Math.max(this.row, ph);
    return this.uv[key];
  }
  texture() { const t = new THREE.CanvasTexture(this.c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; }
}

// ---- chalk boards (every line of these lesson notes is invented) ----
const LESSONS = [
  { t: '《劝学》  荀子', l: ['君子曰：学不可以已。', '青，取之于蓝，而青于蓝；', '冰，水为之，而寒于水。', '不积跬步，无以至千里；', '不积小流，无以成江海。'], d: 'notes' },
  { t: '二次函数的图象与性质', l: ['y = ax² + bx + c   (a ≠ 0)', '对称轴   x = − b / 2a', 'Δ = b² − 4ac', '例1  求 y = x² − 2x − 3 的零点', '解  (x − 3)(x + 1) = 0', '∴  x₁ = 3 ,  x₂ = −1'], d: 'parabola' },
  { t: 'Unit 3   Travel Journal', l: ['Reading:  Journey Down the Mekong', 'journal   n.  日记；杂志', 'be determined to do sth.', 'persuade sb. to do sth.', 'Grammar:  be + doing  表将来', 'We are leaving for Dali tomorrow.'], latin: true, d: 'star' },
  { t: '§4.3  牛顿第二定律', l: ['F = ma', 'a ∝ F ,   a ∝ 1 / m', '1 N = 1 kg · m / s²', '例  m = 2 kg ,  F = 10 N', 'a = F / m = 5 m / s²'], d: 'incline' },
  { t: '氧化还原反应', l: ['2H₂ + O₂ ═ 2H₂O', 'Fe + CuSO₄ ═ FeSO₄ + Cu', '升 失 氧 ，降 得 还', '氧化剂：得电子，化合价降低', '还原剂：失电子，化合价升高'], d: 'transfer' },
  { t: '细胞的基本结构', l: ['细胞膜 — 控制物质进出', '细胞质 — 代谢的主要场所', '细胞核 — 遗传信息库', '6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂'], d: 'cell' },
  { t: '季风与气候', l: ['海陆热力性质差异', '夏季风：海洋 → 陆地，湿热', '冬季风：陆地 → 海洋，干冷', '特点：雨热同期'], d: 'monsoon' },
  { t: '中国近代史 · 时间轴', l: ['阶段特征：救亡图存', '从器物到制度，再到思想'], d: 'timeline' },
  { t: '主题班会：我的目标', l: ['一、我想去的大学', '二、这个学期的计划', '三、每天坚持的一件事', '行动胜于空谈'], d: 'star' },
  { t: '等差数列', l: ['aₙ = a₁ + (n − 1) d', 'Sₙ = n (a₁ + aₙ) / 2', '例  1 + 2 + 3 + … + 100 = 5050', '推广：1 + 2 + … + n = n(n + 1) / 2'], d: 'dots' },
  { t: '电磁感应', l: ['Φ = B S', 'E = n ΔΦ / Δt', '楞次定律：增反减同', '导体切割磁感线：E = B L v'], d: 'coil' },
  { t: 'The Attributive Clause', l: ['who / whom / whose  → people', 'which / that  → things', 'when / where / why', 'This is the book that I bought.', 'I still remember the day when we met.'], latin: true, d: 'star' },
  { t: '《赤壁赋》  苏轼', l: ['壬戌之秋，七月既望，', '苏子与客泛舟游于赤壁之下。', '清风徐来，水波不兴。', '举酒属客，诵明月之诗，', '歌窈窕之章。'], d: 'notes' },
  { t: '实验：酸碱中和滴定', l: ['仪器：滴定管、锥形瓶、铁架台', '指示剂：酚酞', 'c(待) = c(标) · V(标) / V(待)', '注意：平视读数，记到 0.01 mL', '终点：半分钟内不褪色'], d: 'burette' },
  { t: '实验：观察洋葱表皮细胞', l: ['擦 → 滴 → 撕 → 展 → 盖 → 染', '先用低倍镜，再换高倍镜', '画图：细胞壁、细胞核、液泡', '实验后整理显微镜，盖好防尘罩'], d: 'cell' },
];
const HOMEWORK = ['语 练习册 P42', '数 课本 P58 3-8', '英 背 Unit 3', '物 导学案 §4', '化 配平练习', '生 画细胞图', '政 时事摘抄', '史 整理笔记', '地 填充图册'];
function diagram(g, kind) {
  const C = '#eef0e6', Y = '#f3df7a', P = '#f6b9b0', B = '#bfe3f2';
  if (kind === 'timeline') {
    arrow(g, 124, 128, 590, 128, C, 1.8);
    [['1840', '鸦片战争'], ['1894', '甲午战争'], ['1911', '辛亥革命'], ['1919', '五四运动'], ['1949', '新中国成立']].forEach(([yr, ev], i) => { const tx = 160 + i * 98; path(g, [[tx, 121], [tx, 135]], C, 1.8); chalk(g, yr, tx, 107, 15, Y, 'center', HAND); chalk(g, ev, tx, 152, 13, i === 4 ? P : C, 'center'); });
    return;
  }
  g.save(); g.translate(452, 46);
  if (kind === 'parabola') {
    arrow(g, 2, 96, 144, 96, C); arrow(g, 58, 134, 58, 2, C);
    const pts = []; for (let t = -1.7; t <= 1.701; t += 0.1) pts.push([78 + t * 40, 122 - 26 * t * t]); path(g, pts, Y, 2);
    g.setLineDash([4, 4]); path(g, [[78, 10], [78, 130]], P, 1.2); g.setLineDash([]);
    chalk(g, 'x', 140, 108, 13, C, 'center', HAND); chalk(g, 'y', 48, 8, 13, C, 'center', HAND); chalk(g, 'O', 50, 106, 12, C, 'center', HAND); chalk(g, '-1', 32, 106, 12, P, 'center', HAND); chalk(g, '3', 124, 106, 12, P, 'center', HAND);
  } else if (kind === 'incline') {
    const a = Math.atan2(70, 128), cx = 66, cy = 77;
    path(g, [[8, 122], [136, 122], [136, 52]], C, 1.8, true);
    g.save(); g.translate(cx, cy); g.rotate(-a); g.strokeStyle = Y; g.lineWidth = 2; g.strokeRect(-15, -10, 30, 20); g.restore();
    arrow(g, cx, cy, cx, cy + 40, P, 2); chalk(g, 'G', cx + 9, cy + 36, 13, P, 'center', HAND);
    arrow(g, cx, cy, cx - Math.sin(a) * 34, cy - Math.cos(a) * 34, B, 2); chalk(g, 'N', cx - 26, cy - 34, 13, B, 'center', HAND);
    arrow(g, cx, cy, cx + Math.cos(a) * 32, cy - Math.sin(a) * 32, Y, 2); chalk(g, 'f', cx + 36, cy - 24, 13, Y, 'center', HAND);
    chalk(g, 'θ', 34, 115, 12, C, 'center', HAND);
  } else if (kind === 'transfer') {
    chalk(g, 'Zn + Cu²⁺ ═ Zn²⁺ + Cu', 72, 70, 14, C, 'center', HAND);
    g.strokeStyle = P; g.lineWidth = 1.6; g.beginPath(); g.moveTo(14, 58); g.quadraticCurveTo(52, 26, 92, 58); g.stroke(); chalk(g, '失 2e⁻', 52, 30, 12, P, 'center');
    g.strokeStyle = B; g.beginPath(); g.moveTo(48, 82); g.quadraticCurveTo(90, 114, 130, 82); g.stroke(); chalk(g, '得 2e⁻', 90, 110, 12, B, 'center');
    chalk(g, '还原剂', 16, 126, 12, P, 'center'); chalk(g, '氧化剂', 54, 126, 12, B, 'center');
  } else if (kind === 'cell') {
    ring(g, 70, 66, 62, 50, C, 1.8); ring(g, 70, 66, 56, 44, 'rgba(238,240,230,0.5)', 1); ring(g, 52, 62, 17, 15, Y, 1.8); ring(g, 52, 62, 5, 5, null, 0, Y);
    for (const [a, b] of [[96, 46], [100, 84], [70, 96]]) ring(g, a, b, 9, 5, B, 1.4);
    path(g, [[52, 62], [20, 122]], C, 1); chalk(g, '细胞核', 22, 131, 11, C, 'center'); path(g, [[122, 40], [134, 16]], C, 1); chalk(g, '细胞膜', 120, 8, 11, C, 'center'); path(g, [[100, 84], [126, 120]], C, 1); chalk(g, '线粒体', 118, 130, 11, C, 'center');
  } else if (kind === 'monsoon') {
    g.fillStyle = 'rgba(243,223,122,0.22)'; g.fillRect(4, 76, 58, 50); path(g, [[4, 76], [62, 76], [62, 126]], Y, 1.6); chalk(g, '陆地', 33, 102, 13, Y, 'center');
    for (let i = 0; i < 3; i++) { const yy = 94 + i * 13, pts = []; for (let t = 0; t <= 1.001; t += 0.1) pts.push([70 + t * 66, yy + Math.sin(t * 12.6) * 3]); path(g, pts, B, 1.4); }
    chalk(g, '海洋', 104, 82, 13, B, 'center');
    arrow(g, 122, 26, 26, 26, P, 2); chalk(g, '夏季风', 74, 12, 12, P, 'center'); arrow(g, 26, 58, 122, 58, B, 2); chalk(g, '冬季风', 74, 44, 12, B, 'center');
  } else if (kind === 'star') { star(g, 70, 60, 42, -Math.PI / 2, null, Y); chalk(g, '加油！', 70, 122, 18, P, 'center');
  } else if (kind === 'dots') {
    for (let i = 1; i <= 6; i++) for (let j = 0; j < i; j++) ring(g, 70 + (j - (i - 1) / 2) * 16, 6 + i * 16, 3, 3, null, 0, i === 6 ? P : C);
    chalk(g, '1 + 2 + … + 6 = 21', 70, 128, 12, Y, 'center', HAND);
  } else if (kind === 'coil') {
    g.fillStyle = 'rgba(246,185,176,0.5)'; g.fillRect(6, 50, 25, 24); g.fillStyle = 'rgba(191,227,242,0.5)'; g.fillRect(31, 50, 25, 24); g.strokeStyle = C; g.lineWidth = 1.5; g.strokeRect(6, 50, 50, 24);
    chalk(g, 'N', 18, 62, 13, C, 'center', HAND); chalk(g, 'S', 44, 62, 13, C, 'center', HAND);
    for (let i = 0; i < 5; i++) ring(g, 84 + i * 9, 62, 6, 20, Y, 1.5);
    path(g, [[84, 82], [84, 112], [92, 112]], C, 1.4); path(g, [[120, 82], [120, 112], [116, 112]], C, 1.4); ring(g, 104, 112, 12, 12, C, 1.5); chalk(g, 'G', 104, 113, 13, C, 'center', HAND);
    arrow(g, 10, 36, 54, 36, P, 1.8); chalk(g, 'v', 32, 24, 13, P, 'center', HAND);
  } else if (kind === 'burette') {
    path(g, [[30, 128], [112, 128]], C, 2.5); path(g, [[40, 128], [40, 4]], C, 2.5); path(g, [[40, 28], [74, 28]], C, 2);
    g.strokeStyle = C; g.lineWidth = 1.5; g.strokeRect(74, 6, 8, 76); g.fillStyle = 'rgba(191,227,242,0.45)'; g.fillRect(75, 30, 6, 52); path(g, [[78, 82], [78, 92]], C, 1.5);
    g.beginPath(); g.moveTo(71, 96); g.lineTo(85, 96); g.lineTo(98, 126); g.lineTo(58, 126); g.closePath(); g.strokeStyle = C; g.stroke();
    g.beginPath(); g.moveTo(63, 116); g.lineTo(93, 116); g.lineTo(98, 126); g.lineTo(58, 126); g.closePath(); g.fillStyle = 'rgba(246,185,176,0.6)'; g.fill();
    chalk(g, 'NaOH', 104, 40, 11, B, 'left', HAND); chalk(g, 'HCl', 108, 112, 11, P, 'left', HAND);
  } else {                                           // key words in a box
    g.strokeStyle = 'rgba(238,240,230,0.7)'; g.lineWidth = 1.2; g.strokeRect(6, 8, 134, 112); chalk(g, '重点字词', 73, 24, 14, P, 'center');
    ['已：停止', '于：从；比', '跬步：半步', '锲而不舍'].forEach((s, i) => chalk(g, s, 16, 48 + i * 20, 12.5, C));
  }
  g.restore();
}
function paintBoard(g, W, H, s, seed, senior) {
  const r = rng(seed * 7919 + 13), gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#25493c'); gr.addColorStop(1, '#1c3c31'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 80; i++) { g.fillStyle = `rgba(232,238,226,${0.01 + r() * 0.028})`; g.beginPath(); g.ellipse(r() * W, r() * H, 25 + r() * 110, 5 + r() * 14, (r() - 0.5) * 0.7, 0, TAU); g.fill(); }
  const font = s.latin ? HAND : KAI, x0 = 122;
  chalk(g, s.t, x0, 24, 21, '#f3df7a', 'left', font); g.font = `21px ${font}`; path(g, [[x0, 39], [x0 + g.measureText(s.t).width, 40]], 'rgba(243,223,122,0.7)', 1.5);
  s.l.forEach((t, i) => chalk(g, t, x0 + (i % 3 === 2 ? 10 : 0), 62 + i * 24, 16.5, /^[例解∴]/.test(t) ? '#bfe3f2' : '#eef0e6', 'left', font));
  box(g, 8, 10, 100, H - 22, null, 'rgba(238,240,230,0.7)', 1.2); chalk(g, '今日作业', 58, 26, 15, '#f6b9b0', 'center');
  for (let i = 0; i < 6; i++) chalk(g, HOMEWORK[(seed * 2 + i) % HOMEWORK.length], 14, 50 + i * 21, 11.5);
  chalk(g, '11月18日', W - 8, 18, 13, '#eef0e6', 'right'); chalk(g, '星期三', W - 8, 36, 13, '#eef0e6', 'right'); chalk(g, `值日：第${CN[seed % 5]}组`, W - 8, H - 14, 12, '#bfe3f2', 'right');
  if (senior) { chalk(g, '距高考', W - 38, 66, 14, '#f3df7a', 'center'); chalk(g, '201', W - 38, 94, 30, '#f6b9b0', 'center', HAND); chalk(g, '天', W - 38, 122, 14, '#f3df7a', 'center'); }
  diagram(g, s.d);
  for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(240,240,232,${0.03 + r() * 0.06})`; g.fillRect(r() * W, H - 3 - r() * 5, 10 + r() * 40, 2 + r() * 3); }      // dust above the tray
}

// ---- the chalk drawing at the back of a classroom (黑板报) ----
const ART = [['青春飞扬', 'sun'], ['书香校园', 'book'], ['喜迎新年', 'lantern'], ['安全伴我行', 'shield'], ['感恩有你', 'heart'], ['科技之光', 'rocket'], ['活力运动会', 'runner'], ['我的梦想', 'bigstar']];
const CHALKS = ['#f7d64c', '#f58d7e', '#9fd8f0', '#a8e6a1', '#f5a6c0'];
function picture(g, pic, cx, cy) {
  const [Y, R, B, G, K] = CHALKS;
  g.save(); g.translate(cx, cy);
  if (pic === 'sun') { ring(g, 0, -8, 18, 18, Y, 3, 'rgba(247,214,76,0.35)'); for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; path(g, [[Math.cos(a) * 24, -8 + Math.sin(a) * 24], [Math.cos(a) * 33, -8 + Math.sin(a) * 33]], Y, 2.5); } path(g, [[-70, 38], [-35, 20], [0, 38], [40, 16], [80, 38]], G, 3); }
  else if (pic === 'book') { path(g, [[-50, 20], [-50, -20], [0, -10], [50, -20], [50, 20], [0, 32]], B, 3, true); path(g, [[0, -10], [0, 32]], B, 2.5); for (let i = 0; i < 4; i++) { path(g, [[-42, -9 + i * 8], [-8, -2 + i * 8]], 'rgba(255,255,255,0.7)', 1.5); path(g, [[8, -2 + i * 8], [42, -9 + i * 8]], 'rgba(255,255,255,0.7)', 1.5); } star(g, 64, -22, 9, 0.3, Y); }
  else if (pic === 'lantern') { for (const dx of [-34, 34]) { path(g, [[dx, -38], [dx, -27]], Y, 2); ring(g, dx, -6, 19, 21, Y, 2.5, 'rgba(245,141,126,0.8)'); path(g, [[dx - 8, -27], [dx + 8, -27]], Y, 3); path(g, [[dx - 8, 15], [dx + 8, 15]], Y, 3); for (const t of [-5, 0, 5]) path(g, [[dx + t, 17], [dx + t, 33]], Y, 1.6); } }
  else if (pic === 'shield') { path(g, [[0, -34], [34, -22], [30, 12], [0, 36], [-30, 12], [-34, -22]], B, 3, true); path(g, [[-14, -2], [-3, 12], [18, -14]], Y, 5); }
  else if (pic === 'heart') { g.beginPath(); g.moveTo(0, 30); g.bezierCurveTo(-52, -4, -28, -44, 0, -16); g.bezierCurveTo(28, -44, 52, -4, 0, 30); g.fillStyle = 'rgba(245,141,126,0.75)'; g.fill(); g.strokeStyle = K; g.lineWidth = 3; g.stroke(); }
  else if (pic === 'rocket') { g.save(); g.rotate(0.6); path(g, [[0, -40], [14, -12], [14, 20], [-14, 20], [-14, -12]], '#ffffff', 3, true); ring(g, 0, -6, 6, 6, B, 2.5); path(g, [[-14, 8], [-26, 26], [-14, 20]], R, 3); path(g, [[14, 8], [26, 26], [14, 20]], R, 3); path(g, [[-8, 22], [0, 44], [8, 22]], Y, 3); g.restore(); star(g, -56, -20, 8, 0.2, Y); star(g, 58, 18, 6, 0.5, Y); star(g, -40, 26, 5, 0.1, B); }
  else if (pic === 'runner') { ring(g, 4, -30, 8, 8, Y, 3); path(g, [[2, -22], [-4, 4]], Y, 3.5); path(g, [[0, -14], [18, -8], [26, -20]], Y, 3); path(g, [[0, -14], [-18, -6]], Y, 3); path(g, [[-4, 4], [14, 16], [10, 34]], Y, 3.5); path(g, [[-4, 4], [-22, 14], [-34, 6]], Y, 3.5); path(g, [[-80, 38], [80, 38]], R, 2.5); path(g, [[-80, 44], [80, 44]], '#ffffff', 1.5); }
  else { star(g, 0, -4, 34, -Math.PI / 2, 'rgba(247,214,76,0.5)', Y); star(g, -52, 14, 10, 0.2, K); star(g, 54, -22, 12, 0.4, B); }
  g.restore();
}
function paintArt(g, W, H, i) {
  const [title, pic] = ART[i % ART.length], r = rng(4001 + i * 71), col = CHALKS[i % 5];
  g.fillStyle = '#1e2f2b'; g.fillRect(0, 0, W, H);
  for (let k = 0; k < 50; k++) { g.fillStyle = `rgba(232,238,226,${0.01 + r() * 0.03})`; g.beginPath(); g.ellipse(r() * W, r() * H, 25 + r() * 90, 5 + r() * 12, (r() - 0.5) * 0.7, 0, TAU); g.fill(); }
  g.setLineDash([9, 6]); g.strokeStyle = CHALKS[(i + 2) % 5]; g.lineWidth = 3; g.strokeRect(7, 7, W - 14, H - 14); g.setLineDash([]);
  g.font = `bold 34px ${KAI}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round'; g.lineWidth = 5; g.strokeStyle = 'rgba(255,255,255,0.85)'; g.strokeText(title, W / 2, 36); g.fillStyle = col; g.fillText(title, W / 2, 36);
  [[20, 0], [W - 160, 1]].forEach(([x, q]) => {
    const c2 = CHALKS[(i + 1 + q * 2) % 5]; g.strokeStyle = c2; g.lineWidth = 2; g.beginPath(); g.roundRect(x, 24, 140, 124, 12); g.stroke();
    g.fillStyle = c2; g.fillRect(x + 12, 36, 56 + 30 * r(), 5); rows(g, x + 12, 52, 116, 8, 11, 'rgba(240,240,232,0.8)', 2.2, r);
  });
  picture(g, pic, W / 2, 106);
  for (let k = 0; k < 9; k++) star(g, 170 + r() * 165, 62 + r() * 96, 2.5 + r() * 3, r() * 3, CHALKS[k % 5]);
}

// ---- posters, plates, signs ----
const POSTERS = [['校园公告', '#b3261e'], ['光荣榜', '#b8860b'], ['科技节', '#0f7a6a'], ['社团招新', '#1f6fb5'], ['安全教育', '#c2410c'], ['读书月', '#6d3fa0'], ['文明班级', '#b3261e'], ['心理健康', '#2f8a5f'], ['垃圾分类', '#3d7a2a'], ['值周安排', '#1f6fb5']];
function paintPoster(g, W, H, k) {
  const [title, colour] = POSTERS[k % POSTERS.length], r = rng(911 + k * 37);
  box(g, 0, 0, W, H, '#f6f3ea'); box(g, 0, 0, W, H * 0.16, colour); T(g, title, W / 2, H * 0.085, H * 0.085, '#fff', CJK, 'center', 'bold');
  let y = H * 0.2;
  while (y < H * 0.93) {
    if (r() < 0.4 && y < H * 0.7) {
      const n = 2 + Math.floor(r() * 2), ph = H * (0.1 + 0.07 * r()), pw = (W * 0.86 - (n - 1) * 6) / n;
      for (let i = 0; i < n; i++) { const px = W * 0.07 + i * (pw + 6), hue = Math.floor(r() * 360), gr = g.createLinearGradient(px, y, px, y + ph); gr.addColorStop(0, `hsl(${hue},35%,72%)`); gr.addColorStop(1, `hsl(${(hue + 40) % 360},30%,42%)`); g.fillStyle = gr; g.fillRect(px, y, pw, ph); g.fillStyle = 'rgba(255,255,255,0.55)'; for (let q = 0; q < 3; q++) g.fillRect(px + pw * (0.15 + 0.25 * q), y + ph * (0.45 + 0.1 * r()), pw * 0.12, ph * 0.5); }
      y += ph + 9;
    } else { g.fillStyle = colour; g.fillRect(W * 0.07, y, W * (0.2 + 0.25 * r()), 5); y += 10; const n = 3 + Math.floor(r() * 4); rows(g, W * 0.07, y, W * 0.86, n, 7, '#8b8880', 2.5, r); y += n * 7 + 6; }
  }
  box(g, 0, 0, W, H, null, 'rgba(0,0,0,0.25)', 2);
}
function paintPlate(g, W, H, num, name, building = BUILDING) {
  const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#2468b4'); gr.addColorStop(1, '#174a86'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
  box(g, 3, 3, W - 6, H - 6, null, 'rgba(255,255,255,0.9)', 1.5);
  T(g, num, 12, 23, 25, '#fff', CJK, 'left', 'bold'); T(g, building, W - 12, 23, 13, 'rgba(255,255,255,0.85)', CJK, 'right'); g.fillStyle = 'rgba(255,255,255,0.7)'; g.fillRect(10, 38, W - 20, 1.2);
  T(g, name, W / 2, 56, name.length > 5 ? 20 : 23, '#fff', CJK, 'center', 'bold');
}
function paintFloor(g, S, n, building = BUILDING) {
  box(g, 0, 0, S, S, '#f4f2ea', '#9a968c', 3); ring(g, S / 2, S * 0.43, S * 0.33, S * 0.33, null, 0, '#9c2a22');
  T(g, String(n), S * 0.44, S * 0.44, S * 0.46, '#fff', CJK, 'center', 'bold'); T(g, 'F', S * 0.66, S * 0.5, S * 0.22, '#fff', CJK, 'center', 'bold');
  T(g, `${building} · ${CN[n - 1]}楼`, S / 2, S * 0.88, S * 0.1, '#5a2a26', CJK, 'center', 'bold');
}
function paintClock(g, S) {
  box(g, 0, 0, S, S, '#2c2f33'); g.fillStyle = '#f6f5ef'; g.beginPath(); g.roundRect(8, 8, S - 16, S - 16, 14); g.fill();
  const c = S / 2; for (let i = 0; i < 60; i++) { const a = i / 60 * TAU, r0 = c - (i % 5 ? 20 : 26); path(g, [[c + Math.cos(a) * r0, c + Math.sin(a) * r0], [c + Math.cos(a) * (c - 16), c + Math.sin(a) * (c - 16)]], '#2b2b2b', i % 5 ? 1 : 2.5); }
  [[12, 0], [3, 1], [6, 2], [9, 3]].forEach(([n, q]) => T(g, String(n), c + Math.sin(q * Math.PI / 2) * (c - 40), c - Math.cos(q * Math.PI / 2) * (c - 40) + 1, 20, '#222', CJK, 'center', 'bold'));
  const hand = (a, len, w, col) => path(g, [[c - Math.sin(a) * 8, c + Math.cos(a) * 8], [c + Math.sin(a) * len, c - Math.cos(a) * len]], col, w);
  hand(TAU * (10 + 10 / 60) / 12, c - 46, 5, '#222'); hand(TAU * 10 / 60, c - 28, 3.5, '#222'); hand(TAU * 37 / 60, c - 24, 1.4, '#c8201c'); ring(g, c, c, 4, 4, null, 0, '#c8201c');
}
function paintFlag(g, W, H) {
  const u = W / 30; box(g, 0, 0, W, H, '#de2910'); star(g, 5 * u, 5 * u, 3 * u, -Math.PI / 2, '#ffde00');
  for (const [x, y] of [[10, 2], [12, 4], [12, 7], [10, 9]]) star(g, x * u, y * u, u, Math.atan2(5 * u - y * u, 5 * u - x * u), '#ffde00');
}
const SLOGANS = ['天行健  君子以自强不息', '业精于勤  荒于嬉', '书山有路勤为径  学海无涯苦作舟', '静心  专心  恒心', '今日事  今日毕'];
function paintSlogan(g, W, H, i) {
  const red = i % 2 === 0; box(g, 0, 0, W, H, red ? '#c3201b' : '#f7f4ea', red ? '#e9c64a' : '#c3201b', 3);
  T(g, SLOGANS[i % SLOGANS.length], W / 2, H / 2 + 2, H * 0.6, red ? '#f6d860' : '#c3201b', KAI, 'center', 'bold');
}
function paintCert(g, W, H, i) {
  box(g, 0, 0, W, H, i === 1 ? '#f9e7b0' : '#fbf3d6'); box(g, 4, 4, W - 8, H - 8, null, '#c3201b', 2.5); box(g, 9, 9, W - 18, H - 18, null, '#d9a520', 1);
  T(g, ['奖状', '文明班级', '优秀团支部', '荣誉证书'][i % 4], W / 2, 26, i % 4 ? 16 : 22, '#c3201b', KAI, 'center', 'bold'); rows(g, 22, 44, W - 44, 4, 8, '#8b8273', 2); ring(g, W - 30, H - 24, 10, 10, '#c3201b', 2);
}
function paintSheet(g, W, H, title, colour, kind, seed) {      // timetable, duty roster, class rules
  const r = rng(seed); box(g, 0, 0, W, H, '#fbfaf5', '#b8b4a8', 2); box(g, 0, 0, W, 34, colour); T(g, title, W / 2, 18, 19, '#fff', CJK, 'center', 'bold');
  if (kind === 'grid') {
    const SUB = ['语文', '数学', '英语', '物理', '化学', '生物', '政治', '历史', '地理', '体育', '音乐', '美术', '信息', '自习', '班会'], cw = (W - 12) / 6, ch = (H - 46) / 9;
    for (let i = 0; i <= 6; i++) path(g, [[6 + i * cw, 40], [6 + i * cw, 40 + 9 * ch]], '#9a968c', 0.8); for (let j = 0; j <= 9; j++) path(g, [[6, 40 + j * ch], [W - 6, 40 + j * ch]], '#9a968c', 0.8);
    ['', '一', '二', '三', '四', '五'].forEach((d, i) => T(g, d, 6 + (i + 0.5) * cw, 40 + ch / 2, 11, '#333', CJK, 'center', 'bold'));
    for (let j = 1; j < 9; j++) { T(g, String(j), 6 + cw / 2, 40 + (j + 0.5) * ch, 10, '#666', CJK, 'center'); for (let i = 1; i < 6; i++) T(g, SUB[Math.floor(r() * (j > 6 ? 15 : 9))], 6 + (i + 0.5) * cw, 40 + (j + 0.5) * ch, 9.5, '#2a2a2a', CJK, 'center'); }
  } else if (kind === 'duty') {
    ['周一', '周二', '周三', '周四', '周五'].forEach((d, i) => { const y = 62 + i * 38; box(g, 10, y - 14, 44, 28, colour); T(g, d, 32, y, 13, '#fff', CJK, 'center', 'bold'); T(g, `第${CN[(i + seed) % 5]}组`, 66, y - 6, 13, '#333'); T(g, ['扫地 拖地', '擦黑板', '倒垃圾', '摆桌椅', '关门窗'][i], 66, y + 9, 10, '#777'); });
  } else for (let i = 0; i < 8; i++) { T(g, `${i + 1}.`, 12, 56 + i * 25, 12, colour, CJK, 'left', 'bold'); rows(g, 30, 51 + i * 25, W - 44, 2, 8, '#8b8880', 2.5, r); }
}
function paintDrawing(g, S, i) {
  const r = rng(300 + i * 17), mat = ['#f6d7a8', '#cfe6f3', '#f7c9c4', '#d6ecc9'][i % 4];
  box(g, 0, 0, S, S, mat); box(g, 8, 8, S - 16, S - 16, '#fffdf6');
  g.save(); g.beginPath(); g.rect(8, 8, S - 16, S - 16); g.clip();
  if (i % 4 === 0) { box(g, 8, 8, S, S * 0.5, '#bfe1f4'); box(g, 8, S * 0.6, S, S, '#8fcf7c'); ring(g, S * 0.75, S * 0.25, 12, 12, null, 0, '#f6c231'); g.fillStyle = '#d9694a'; g.beginPath(); g.moveTo(30, 62); g.lineTo(52, 40); g.lineTo(74, 62); g.fill(); box(g, 34, 62, 36, 28, '#f1dfb0', '#8a6b3c', 1.5); box(g, 46, 72, 10, 18, '#8a5a34'); }
  else if (i % 4 === 1) { for (let k = 0; k < 7; k++) { g.strokeStyle = `hsl(${k * 50},70%,55%)`; g.lineWidth = 5; g.beginPath(); g.arc(S / 2, S * 0.78, 20 + k * 5, Math.PI, TAU); g.stroke(); } ring(g, 26, 30, 12, 7, null, 0, '#e8eef2'); ring(g, 86, 26, 14, 8, null, 0, '#e8eef2'); }
  else if (i % 4 === 2) { box(g, 8, 8, S, S, '#1d2b55'); for (let k = 0; k < 14; k++) star(g, 14 + r() * (S - 28), 14 + r() * (S - 28), 2 + r() * 3, r(), '#f7e27a'); ring(g, S * 0.68, S * 0.3, 13, 13, null, 0, '#f3ecc8'); g.save(); g.translate(S * 0.36, S * 0.62); g.rotate(-0.5); box(g, -7, -20, 14, 34, '#e9e9e9'); g.fillStyle = '#d0463a'; g.beginPath(); g.moveTo(-7, -20); g.lineTo(0, -34); g.lineTo(7, -20); g.fill(); g.restore(); }
  else { box(g, 8, S * 0.7, S, S, '#9ad17f'); for (let k = 0; k < 4; k++) { const x = 24 + k * 24, h = 30 + r() * 26; path(g, [[x, S * 0.74], [x, S * 0.74 - h]], '#3f8f3a', 3); for (let q = 0; q < 5; q++) { const a = q / 5 * TAU; ring(g, x + Math.cos(a) * 7, S * 0.74 - h + Math.sin(a) * 7, 5, 5, null, 0, ['#e8554a', '#f2a13a', '#c55fd0', '#f06292'][k]); } ring(g, x, S * 0.74 - h, 4, 4, null, 0, '#f6d540'); } }
  g.restore();
}
function paintLocker(g, W, H, i) {
  const r = rng(77 + i * 31), base = [[159, 176, 184], [171, 183, 176], [150, 168, 186], [176, 178, 170]][i % 4], css = k => `rgb(${base.map(v => Math.round(v * k)).join(',')})`;
  box(g, 0, 0, W, H, css(1)); box(g, 2, 2, W - 4, H - 4, null, css(0.72), 3); box(g, 7, 7, W - 14, H - 14, null, css(1.08), 1);
  g.fillStyle = css(0.6); for (let k = 0; k < 5; k++) g.fillRect(24, 26 + k * 9, W - 48, 3); for (let k = 0; k < 3; k++) g.fillRect(24, H - 46 + k * 9, W - 48, 3);
  box(g, 26, 92, W - 52, 26, '#f7f5ec', css(0.6), 1); T(g, String(i * 7 % 40 + 1).padStart(2, '0'), W / 2, 106, 15, '#333', CJK, 'center', 'bold');
  box(g, W - 22, 150, 9, 30, '#e9e9e4', css(0.55), 1); ring(g, W - 17.5, 190, 3.5, 3.5, css(0.5), 1, '#d9d9d2');
  if (r() < 0.6) star(g, 30 + r() * 30, 215 + r() * 30, 9, r(), ['#f2c230', '#e8554a', '#4aa3e8'][i % 3]);
}
function paintAc(g, W, H) {
  box(g, 0, 0, W, H, '#e9e7df', '#b9b6aa', 2); ring(g, W * 0.36, H / 2, H * 0.4, H * 0.4, '#8f8c82', 2, '#3a3d40');
  for (let k = 1; k < 6; k++) ring(g, W * 0.36, H / 2, H * 0.4 * k / 6, H * 0.4 * k / 6, '#6a6d70', 1); ring(g, W * 0.36, H / 2, 7, 7, null, 0, '#c9c7bf');
  for (let k = 0; k < 9; k++) box(g, W * 0.72, 12 + k * (H - 24) / 9, W * 0.22, 3, '#a9a69a');
}
function paintHose(g, W, H) {
  box(g, 0, 0, W, H, '#c3271f'); const gr = g.createLinearGradient(0, 0, W, H); gr.addColorStop(0, '#dfe9ea'); gr.addColorStop(1, '#a9bcc0'); g.fillStyle = gr; g.fillRect(12, 46, W - 24, H - 84);
  for (let k = 0; k < 5; k++) ring(g, W / 2, H * 0.55, 12 + k * 7, 12 + k * 7, '#b5332a', 4); ring(g, W / 2, H * 0.55, 6, 6, null, 0, '#d9c27a');
  T(g, '消火栓', W / 2, 24, 26, '#fff', CJK, 'center', 'bold'); T(g, '火警 119', W / 2, H - 18, 17, '#fff', CJK, 'center', 'bold');
}
function paintExit(g, W, H, dir) {
  box(g, 0, 0, W, H, '#0a8f4e'); box(g, 3, 3, W - 6, H - 6, null, '#d8ffe8', 1.5);
  g.fillStyle = '#eafff2'; g.fillRect(14, 12, 26, H - 24); g.fillStyle = '#0a8f4e'; ring(g, 30, 24, 5, 5, null, 0, '#0a8f4e'); path(g, [[29, 30], [25, 44], [32, 56]], '#0a8f4e', 4); path(g, [[25, 44], [18, 54]], '#0a8f4e', 4); path(g, [[28, 34], [36, 40]], '#0a8f4e', 3.5);
  T(g, '安全出口', W * 0.56, H * 0.4, 24, '#fff', CJK, 'center', 'bold'); T(g, 'EXIT', W * 0.56, H * 0.76, 14, '#fff', CJK, 'center', 'bold');
  if (dir) arrow(g, W - 20 - 14 * dir, H / 2, W - 20 + 14 * dir, H / 2, '#fff', 4);
}
function paintScreen(g, W, H, i) {
  if (i === 0) { const gr = g.createLinearGradient(0, 0, W, H); gr.addColorStop(0, '#2a6fc2'); gr.addColorStop(1, '#1b3f7a'); g.fillStyle = gr; g.fillRect(0, 0, W, H); for (let k = 0; k < 5; k++) box(g, 8, 8 + k * 13, 9, 9, ['#f2c230', '#fff', '#8fd18a', '#f08a5a', '#fff'][k]); box(g, 0, H - 9, W, 9, '#16233a'); }
  else if (i === 1) { box(g, 0, 0, W, H, '#dfe3e8'); box(g, 16, 6, W - 32, H - 6, '#fff'); box(g, 0, 0, W, 7, '#2b579a'); rows(g, 24, 16, W - 48, 9, 7, '#777', 2); }
  else { box(g, 0, 0, W, H, '#fff'); box(g, 0, 0, W, 9, '#217346'); for (let k = 0; k < 9; k++) path(g, [[0, 9 + k * 8], [W, 9 + k * 8]], '#c9d3cc', 0.8); for (let k = 0; k < 7; k++) path(g, [[k * 19, 9], [k * 19, H]], '#c9d3cc', 0.8); box(g, 19, 17, 38, 8, '#cfe8d6'); }
}
function paintSpines(g, W, H, i) {
  const r = rng(555 + i * 13); box(g, 0, 0, W, H, '#2a211a'); let x = 2;
  while (x < W - 4) { const w = 6 + r() * 12, h = H * (0.72 + 0.26 * r()), hue = Math.floor(r() * 360), l = 30 + r() * 40; g.fillStyle = `hsl(${hue},${18 + r() * 34}%,${l}%)`; g.fillRect(x, H - h, w, h); g.fillStyle = `hsla(0,0%,${l > 50 ? 15 : 95}%,0.7)`; g.fillRect(x + w * 0.3, H - h * 0.8, w * 0.4, h * 0.45); g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(x + w - 1, H - h, 1, h); x += w + (r() < 0.08 ? 6 : 0.6); }
}
function paintNamePlate(g, W, H) {
  const r = rng(91); box(g, 0, 0, W, H, '#1b1c1e'); for (let i = 0; i < 900; i++) { g.fillStyle = `rgba(255,255,255,${0.03 + r() * 0.08})`; g.fillRect(r() * W, r() * H, 1 + r() * 1.5, 1 + r() * 1.5); }
  box(g, 8, 8, W - 16, H - 16, null, '#d7b458', 2.5); [...BUILDING].forEach((ch, i) => T(g, ch, W / 2, 78 + i * 112, 100, '#e3c365', KAI, 'center', 'bold'));
  T(g, 'LABORATORY', W / 2, H - 46, 16, '#d7b458', CJK, 'center', 'bold'); T(g, 'BUILDING', W / 2, H - 26, 16, '#d7b458', CJK, 'center', 'bold');
}
function paintDirectory(g, W, H, names) {
  box(g, 0, 0, W, H, '#f6f5f0', '#8f8c82', 3); box(g, 0, 0, W, 62, '#1d4f9c'); T(g, `${BUILDING}  楼层索引`, W / 2, 33, 27, '#fff', CJK, 'center', 'bold');
  for (let k = FLOORS - 1; k >= 0; k--) {
    const y = 74 + (FLOORS - 1 - k) * 72; box(g, 12, y, 58, 60, '#9c2a22'); T(g, `${k + 1}F`, 41, y + 31, 28, '#fff', CJK, 'center', 'bold');
    names[k].forEach((nm, i) => T(g, nm, 82 + (i % 2) * 140, y + 12 + Math.floor(i / 2) * 19, 13.5, '#2a2a2a'));
    path(g, [[12, y + 66], [W - 12, y + 66]], '#c9c6ba', 1);
  }
}
function paintEvac(g, W, H) {
  box(g, 0, 0, W, H, '#fbfaf5', '#c3201b', 4); T(g, '疏散示意图', W / 2, 20, 17, '#c3201b', CJK, 'center', 'bold');
  box(g, 16, 46, W - 32, 50, null, '#444', 2); for (let i = 1; i < 5; i++) path(g, [[16 + i * (W - 32) / 5, 46], [16 + i * (W - 32) / 5, 96]], '#444', 1.5); box(g, 16, 96, W - 32, 22, '#e6efe2', '#444', 2);
  arrow(g, 40, 107, W - 46, 107, '#0a8f4e', 3); ring(g, 70, 107, 5, 5, null, 0, '#c3201b'); T(g, '您所在位置', 70, 132, 11, '#c3201b', CJK, 'center'); T(g, '楼梯', W - 30, 132, 11, '#0a8f4e', CJK, 'center', 'bold'); rows(g, 20, 146, W - 40, 3, 7, '#8b8880', 2);
}
function paintSign(g, W, H, text, bg, fg, border) { box(g, 0, 0, W, H, bg, border || fg, 3); T(g, text, W / 2, H / 2 + 1, H * 0.5, fg, CJK, 'center', 'bold'); }
function paintWarn(g, W, H) { box(g, 0, 0, W, H, '#f4d21f', '#222', 2); g.fillStyle = '#222'; g.beginPath(); g.moveTo(W / 2, 5); g.lineTo(W - 14, 40); g.lineTo(14, 40); g.closePath(); g.fill(); g.fillStyle = '#f4d21f'; g.beginPath(); g.moveTo(W / 2 + 3, 13); g.lineTo(W / 2 - 6, 27); g.lineTo(W / 2, 27); g.lineTo(W / 2 - 4, 37); g.lineTo(W / 2 + 7, 22); g.lineTo(W / 2 + 1, 22); g.closePath(); g.fill(); T(g, '有电危险', W / 2, H - 11, 13, '#222', CJK, 'center', 'bold'); }
function paintCalendar(g, W, H) { box(g, 0, 0, W, H, '#fff', '#999', 2); box(g, 0, 0, W, 34, '#c3201b'); T(g, '2026年11月', W / 2, 18, 15, '#fff', CJK, 'center', 'bold'); T(g, '18', W / 2, 76, 58, '#222', CJK, 'center', 'bold'); T(g, '星期三', W / 2, 122, 16, '#555', CJK, 'center'); rows(g, 16, 138, W - 32, 2, 8, '#aaa', 2); }
const ELEMENTS = 'H He Li Be B C N O F Ne Na Mg Al Si P S Cl Ar K Ca Sc Ti V Cr Mn Fe Co Ni Cu Zn Ga Ge As Se Br Kr Rb Sr Y Zr Nb Mo Tc Ru Rh Pd Ag Cd In Sn Sb Te I Xe Cs Ba La Ce Pr Nd Pm Sm Eu Gd Tb Dy Ho Er Tm Yb Lu Hf Ta W Re Os Ir Pt Au Hg Tl Pb Bi Po At Rn Fr Ra Ac Th Pa U Np Pu Am Cm Bk Cf Es Fm Md No Lr Rf Db Sg Bh Hs Mt Ds Rg Cn Nh Fl Mc Lv Ts Og'.split(' ');
function paintPeriodic(g, W, H) {
  box(g, 0, 0, W, H, '#fbfaf4', '#6b6860', 3); T(g, '元 素 周 期 表', W / 2, 26, 26, '#1d3f7a', CJK, 'center', 'bold');
  const cw = (W - 24) / 18, ch = 31, y0 = 50, cell = (z, col, row) => {
    const metal = z > 2 && ![5, 6, 7, 8, 9, 10, 14, 15, 16, 17, 18, 33, 34, 35, 36, 52, 53, 54, 85, 86, 117, 118].includes(z), noble = [2, 10, 18, 36, 54, 86, 118].includes(z);
    const fill = z === 1 ? '#f7d9a8' : noble ? '#d9c8ef' : (z >= 57 && z <= 71) || (z >= 89 && z <= 103) ? '#f6c9d6' : !metal ? '#f8e89a' : col <= 2 ? '#f5b8a0' : col >= 13 ? '#bfe0c2' : '#bcd6f0';
    box(g, 12 + col * cw + 0.5, y0 + row * ch + 0.5, cw - 1, ch - 1, fill, '#8a8a82', 0.6); T(g, ELEMENTS[z - 1], 12 + (col + 0.5) * cw, y0 + (row + 0.6) * ch, 13, '#222', CJK, 'center', 'bold'); T(g, String(z), 12 + col * cw + 3, y0 + row * ch + 6, 6.5, '#555');
  };
  for (let z = 1; z <= 118; z++) {
    let row, col;
    if (z <= 2) { row = 0; col = z === 1 ? 0 : 17; } else if (z <= 18) { const q = (z - 3) % 8; row = z <= 10 ? 1 : 2; col = q < 2 ? q : q + 10; }
    else if (z <= 54) { row = z <= 36 ? 3 : 4; col = (z - 19) % 18; }
    else if (z >= 57 && z <= 71) { row = 7.5; col = z - 57 + 2; } else if (z >= 89 && z <= 103) { row = 8.5; col = z - 89 + 2; }
    else if (z <= 86) { row = 5; col = z <= 56 ? z - 55 : z - 72 + 3; } else { row = 6; col = z <= 88 ? z - 87 : z - 104 + 3; }
    cell(z, col, row);
  }
  T(g, '镧系', 12 + cw, y0 + 8.1 * ch, 12, '#555', CJK, 'center'); T(g, '锕系', 12 + cw, y0 + 9.1 * ch, 12, '#555', CJK, 'center');
}
function paintWhiteboard(g, W, H) {
  const r = rng(808); box(g, 0, 0, W, H, '#fbfcfb', '#aeb3b6', 6); T(g, '本周工作安排', 24, 34, 24, '#1d4f9c', HAND, 'left', 'bold');
  const cw = (W - 40) / 5; for (let i = 0; i <= 5; i++) path(g, [[20 + i * cw, 58], [20 + i * cw, H - 60]], '#3a3f45', 1.5); for (const y of [58, 86, H - 60]) path(g, [[20, y], [W - 20, y]], '#3a3f45', 1.5);
  ['周一', '周二', '周三', '周四', '周五'].forEach((d, i) => { T(g, d, 20 + (i + 0.5) * cw, 73, 16, '#c3201b', HAND, 'center'); const items = [['升旗', '教研会'], ['公开课', '作业检查'], ['集体备课'], ['月考监考', '阅卷'], ['班主任会', '大扫除']][i]; items.forEach((s, j) => T(g, s, 20 + (i + 0.5) * cw, 106 + j * 26, 14, j ? '#1a7a3c' : '#222', HAND, 'center')); });
  for (let i = 0; i < 4; i++) { box(g, 30 + i * 62 + r() * 8, H - 50, 46, 40, ['#f7e36a', '#f9b7c6', '#b9e6a6', '#a9d6f5'][i]); rows(g, 36 + i * 62, H - 40, 32, 3, 8, '#666', 1.5); }
  for (let i = 0; i < 5; i++) ring(g, W - 120 + i * 22, H - 28, 6, 6, null, 0, ['#c3201b', '#1d4f9c', '#1a7a3c', '#e0a020', '#222'][i]);
}
function paintSlide(g, W, H, i) {
  if (i === 0) { const gr = g.createLinearGradient(0, 0, W, H); gr.addColorStop(0, '#184a8f'); gr.addColorStop(1, '#2f86c9'); g.fillStyle = gr; g.fillRect(0, 0, W, H); T(g, '第三章  函数的应用', W / 2, H * 0.4, 34, '#fff', CJK, 'center', 'bold'); box(g, W * 0.25, H * 0.52, W * 0.5, 3, '#f2c230'); T(g, '3.1  函数与方程', W / 2, H * 0.64, 20, '#dbe9f7', CJK, 'center'); }
  else { box(g, 0, 0, W, H, '#fdfdfb'); box(g, 0, 0, W, 50, '#1f6f5a'); T(g, '光合作用的过程', 20, 26, 24, '#fff', CJK, 'left', 'bold'); ['光反应：类囊体薄膜', '暗反应：叶绿体基质', '能量：光能 → 化学能'].forEach((s, k) => { ring(g, 28, 86 + k * 36, 4, 4, null, 0, '#1f6f5a'); T(g, s, 42, 86 + k * 36, 18, '#222'); }); ring(g, W - 86, 200, 56, 34, '#2f8f4a', 3, '#cfeccf'); for (let k = 0; k < 4; k++) ring(g, W - 110 + k * 16, 200, 6, 16, '#2f8f4a', 2, '#7fc47a'); }
}
function paintRules(g, W, H) {
  const r = rng(66); box(g, 0, 0, W, H, '#fbfaf5', '#c3201b', 4); T(g, '实验室安全守则', W / 2, 24, 19, '#c3201b', CJK, 'center', 'bold');
  for (let i = 0; i < 8; i++) { T(g, `${i + 1}.`, 14, 56 + i * 23, 12, '#c3201b', CJK, 'left', 'bold'); rows(g, 32, 51 + i * 23, W - 48, 2, 8, '#77746c', 2.5, r); }
  [['#f4d21f', '!'], ['#c3201b', '✕'], ['#1d4f9c', '◎'], ['#1a7a3c', '+']].forEach(([c, s], i) => { ring(g, 34 + i * 44, H - 28, 15, 15, null, 0, c); T(g, s, 34 + i * 44, H - 27, 18, '#fff', CJK, 'center', 'bold'); });
}
function paintBones(g, W, H) {
  box(g, 0, 0, W, H, '#fbfaf5', '#6b6860', 3); T(g, '人体骨骼', W / 2, 20, 18, '#1d3f7a', CJK, 'center', 'bold');
  const c = '#5a5347', x = W / 2; ring(g, x, 56, 13, 15, c, 2.5, '#efe9d8'); path(g, [[x, 71], [x, 150]], c, 4);
  for (let i = 0; i < 5; i++) { g.strokeStyle = c; g.lineWidth = 2; g.beginPath(); g.ellipse(x, 92 + i * 8, 20 - i, 5, 0, 0, TAU); g.stroke(); }
  path(g, [[x - 24, 80], [x + 24, 80]], c, 3); path(g, [[x - 24, 80], [x - 34, 122], [x - 30, 160]], c, 3); path(g, [[x + 24, 80], [x + 34, 122], [x + 30, 160]], c, 3);
  path(g, [[x - 18, 150], [x + 18, 150], [x + 10, 164], [x - 10, 164]], c, 3, true); path(g, [[x - 11, 164], [x - 14, 212], [x - 12, 258]], c, 3.5); path(g, [[x + 11, 164], [x + 14, 212], [x + 12, 258]], c, 3.5);
  [['颅骨', 56, -1], ['肋骨', 100, 1], ['脊柱', 136, -1], ['骨盆', 158, 1], ['股骨', 190, -1], ['胫骨', 236, 1]].forEach(([s, y, d]) => { path(g, [[x + d * 14, y], [x + d * 52, y]], '#c3201b', 0.8); T(g, s, x + d * 74, y, 11, '#333', CJK, 'center'); });
}
function paintCell(g, W, H) {
  box(g, 0, 0, W, H, '#fbfaf5', '#6b6860', 3); T(g, '植物细胞结构模式图', W / 2, 20, 17, '#1d3f7a', CJK, 'center', 'bold');
  g.fillStyle = '#cfe8b8'; g.strokeStyle = '#4c8a3a'; g.lineWidth = 6; g.beginPath(); g.roundRect(60, 44, 200, 190, 26); g.fill(); g.stroke();
  ring(g, 170, 150, 62, 54, '#6aa6c9', 2, '#d8eef8'); ring(g, 110, 96, 24, 22, '#8a5a34', 2, '#e9c9a0'); ring(g, 110, 96, 8, 8, null, 0, '#8a5a34');
  for (const [a, b] of [[214, 76], [92, 180], [226, 200], [150, 70]]) ring(g, a, b, 13, 7, '#2f7a2a', 1.5, '#5fb04a');
  [['细胞壁', 60, 60, 22, 60], ['细胞核', 110, 96, 22, 110], ['液泡', 190, 160, 320, 150], ['叶绿体', 226, 200, 320, 204], ['细胞膜', 252, 100, 320, 96]].forEach(([s, x0, y0, x1, y1]) => { path(g, [[x0, y0], [x1 < 60 ? 46 : 288, y1]], '#444', 0.8); T(g, s, x1 < 60 ? 6 : 292, y1, 12, '#222'); });
}

let SHEETS = null;
/** Builds the two sheets once and the materials that go with them. */
function sheets(low, p) {
  if (SHEETS) return SHEETS;
  const B = new Atlas('boards', low), P = new Atlas('prints', low), names = Array.from({ length: FLOORS }, (_, k) => p.rooms.map((r, i) => roomName(r, i, k)));
  LESSONS.forEach((s, i) => B.put('board' + i, 676, 196, (g, W, H) => paintBoard(g, W, H, s, i, i >= 10 && i < 13)));
  ART.forEach((a, i) => B.put('art' + i, 505, 170, (g, W, H) => paintArt(g, W, H, i)));
  B.put('periodic', 600, 400, paintPeriodic); B.put('whiteboard', 500, 300, paintWhiteboard);
  for (let i = 0; i < 2; i++) B.put('slide' + i, 400, 300, (g, W, H) => paintSlide(g, W, H, i));
  B.put('rules', 200, 280, paintRules); B.put('bones', 200, 280, paintBones); B.put('cell', 360, 260, paintCell);

  P.put('nameplate', 200, 440, paintNamePlate); P.put('directory', 360, 440, (g, W, H) => paintDirectory(g, W, H, names));
  POSTERS.forEach((q, i) => P.put('poster' + i, 232, 330, (g, W, H) => paintPoster(g, W, H, i)));
  for (let i = 0; i < 8; i++) P.put('locker' + i, 100, 300, (g, W, H) => paintLocker(g, W, H, i));
  P.put('timetable', 200, 260, (g, W, H) => paintSheet(g, W, H, '课程表', '#1d4f9c', 'grid', 5)); P.put('duty', 200, 260, (g, W, H) => paintSheet(g, W, H, '值日表', '#1a7a3c', 'duty', 2)); P.put('rules', 200, 260, (g, W, H) => paintSheet(g, W, H, '班级公约', '#c3201b', 'list', 9));
  P.put('hose', 160, 220, paintHose);
  for (let n = 1; n <= FLOORS; n++) P.put('floor' + n, 200, 200, (g, S) => paintFloor(g, S, n));
  P.put('flag', 300, 200, paintFlag);
  P.put('pennant', 90, 130, (g, W, H) => { box(g, 0, 0, W, H, '#c3201b', '#e9c64a', 4); T(g, '流动', W / 2, 44, 26, '#f6d860', KAI, 'center', 'bold'); T(g, '红旗', W / 2, 80, 26, '#f6d860', KAI, 'center', 'bold'); for (let i = 0; i < 9; i++) box(g, 6 + i * 9, H - 14, 4, 12, '#e9c64a'); });
  P.put('evac', 240, 170, paintEvac); P.put('calendar', 120, 160, paintCalendar); P.put('clock', 160, 160, (g, S) => paintClock(g, S));
  for (let i = 0; i < 8; i++) P.put('drawing' + i, 120, 120, (g, S) => paintDrawing(g, S, i));
  for (let i = 0; i < 2; i++) P.put('essay' + i, 100, 140, (g, W, H) => { const r = rng(40 + i); box(g, 0, 0, W, H, '#fffef8', '#c9c6ba', 1.5); T(g, ['我的理想', '读后感'][i], W / 2, 14, 12, '#c3201b', KAI, 'center', 'bold'); rows(g, 10, 28, W - 20, 13, 7.5, '#8d8a82', 1.6, r); T(g, ['A+', '优'][i], W - 22, H - 16, 17, '#d0281f', HAND, 'center', 'bold'); });
  P.put('ac', 160, 110, paintAc);
  for (let k = 0; k < FLOORS; k++) { p.rooms.forEach((r, i) => P.put(`plate${k}_${i}`, 216, 74, (g, W, H) => paintPlate(g, W, H, `${k + 1}0${i + 1}`, names[k][i]))); P.put(`plate${k}_w`, 216, 74, (g, W, H) => paintPlate(g, W, H, `${k + 1}00`, WEST_ROOMS[k])); }
  for (let i = 0; i < 2; i++) P.put('motto' + i, 400, 100, (g, W, H) => { box(g, 0, 0, W, H, '#fbf6e6', '#d9a520', 3); T(g, ['爱国  团结', '求实  创新'][i], W / 2, H / 2 + 2, 62, '#c3201b', KAI, 'center', 'bold'); });
  SLOGANS.forEach((s, i) => P.put('slogan' + i, 800, 80, (g, W, H) => paintSlogan(g, W, H, i)));
  P.put('keepright', 360, 80, (g, W, H) => paintSign(g, W, H, '上下楼梯  靠右慢行', '#f7f9fb', '#1d4f9c')); P.put('norun', 360, 80, (g, W, H) => paintSign(g, W, H, '请勿追逐打闹', '#f4d21f', '#b3261e', '#222'));
  for (let i = 0; i < 3; i++) P.put('exit' + i, 200, 70, (g, W, H) => paintExit(g, W, H, i - 1));
  for (let i = 0; i < 2; i++) P.put('spines' + i, 512, 64, (g, W, H) => paintSpines(g, W, H, i));
  for (let i = 0; i < 4; i++) P.put('cert' + i, 120, 90, (g, W, H) => paintCert(g, W, H, i));
  for (let i = 0; i < 3; i++) P.put('screen' + i, 128, 80, (g, W, H) => paintScreen(g, W, H, i));
  P.put('water', 160, 60, (g, W, H) => paintSign(g, W, H, '饮水处', '#1d6fb5', '#fff')); P.put('save', 160, 60, (g, W, H) => paintSign(g, W, H, '节约用水', '#eaf6ee', '#1a7a3c')); P.put('quiet', 160, 60, (g, W, H) => paintSign(g, W, H, '保持安静', '#f7f9fb', '#1d4f9c'));
  P.put('garden', 400, 60, (g, W, H) => { box(g, 0, 0, W, H, '#f6d24a', '#e08a2a', 4); [...'学习园地'].forEach((ch, i) => T(g, ch, 68 + i * 88, H / 2 + 2, 42, ['#d0281f', '#1d4f9c', '#1a7a3c', '#8a3fa0'][i], KAI, 'center', 'bold')); });
  P.put('keys', 120, 40, (g, W, H) => { box(g, 0, 0, W, H, '#2a2c30'); for (let j = 0; j < 4; j++) for (let i = 0; i < 13; i++) box(g, 3 + i * 9, 3 + j * 9, 7.5, 7.5, '#4a4d52'); });
  P.put('warn', 80, 64, paintWarn);
  P.put('aid', 64, 64, (g, W, H) => { box(g, 0, 0, W, H, '#f7f7f3', '#9a9a94', 2); box(g, W / 2 - 6, 12, 12, 40, '#1a8f4e'); box(g, 12, W / 2 - 6, 40, 12, '#1a8f4e'); });
  P.put('switch', 40, 40, (g, W, H) => { box(g, 0, 0, W, H, '#f4f3ee', '#b9b6aa', 1.5); box(g, 8, 8, 10, 24, '#e6e4dc', '#aaa', 1); box(g, 22, 8, 10, 24, '#e6e4dc', '#aaa', 1); });

  const mk = (map, name, roughness, extra = {}) => { const m = new THREE.MeshStandardMaterial({ map, roughness, metalness: 0, ...extra }); m.name = name; return m; };
  const bt = B.texture(), pt = P.texture();
  // curtains: four colours as bands, pleats across; a quad picks its band with v and repeats along u
  const dc = document.createElement('canvas'); dc.width = dc.height = 256; { const g = dc.getContext('2d'); [[226, 214, 180], [168, 196, 216], [188, 208, 178], [238, 233, 220]].forEach((c, b) => { for (let x = 0; x < 256; x++) { const k = 0.8 + 0.2 * Math.abs(Math.sin(x / 256 * Math.PI * 8)) - 0.05 * Math.abs(Math.sin(x / 256 * Math.PI * 24)); g.fillStyle = `rgb(${c.map(v => Math.round(v * k)).join(',')})`; g.fillRect(x, b * 64, 1, 64); } }); }
  const dt = new THREE.CanvasTexture(dc); dt.colorSpace = THREE.SRGBColorSpace; dt.wrapS = THREE.RepeatWrapping; dt.anisotropy = 4;
  // weathering: streaks that hang down from an edge, transparent elsewhere
  const sc = document.createElement('canvas'); sc.width = 256; sc.height = 128; { const g = sc.getContext('2d'), r = rng(2027), top = g.createLinearGradient(0, 0, 0, 40); top.addColorStop(0, 'rgba(84,78,66,0.10)'); top.addColorStop(1, 'rgba(84,78,66,0)'); g.fillStyle = top; g.fillRect(0, 0, 256, 40);
    for (let i = 0; i < 46; i++) { const x = r() * 256, w = 1.5 + r() * r() * 14, len = 14 + r() * r() * 112, gr = g.createLinearGradient(0, 0, 0, len); gr.addColorStop(0, `rgba(84,78,66,${0.05 + r() * 0.17})`); gr.addColorStop(1, 'rgba(84,78,66,0)'); g.fillStyle = gr; g.fillRect(x, 0, w, len); } }
  const st = new THREE.CanvasTexture(sc); st.colorSpace = THREE.SRGBColorSpace; st.wrapS = THREE.RepeatWrapping; st.anisotropy = 4;
  // the building's name as cut-out characters for the parapet
  const lc = document.createElement('canvas'); lc.width = 768; lc.height = 256; { const g = lc.getContext('2d'); g.lineJoin = 'round'; g.lineWidth = 9; g.strokeStyle = '#fff'; [...BUILDING].forEach((ch, i) => { T(g, ch, 128 + i * 256, 134, 200, '#fff', KAI, 'center', 'bold'); g.strokeText(ch, 128 + i * 256, 134); }); }
  const lt = new THREE.CanvasTexture(lc); lt.colorSpace = THREE.SRGBColorSpace; lt.anisotropy = 8;
  // one glazing surface (painted reflection, a tilt per pane) shared by the three kinds of glass; eight panes side by side
  const gz = SURFACES.glazing(0x8fb0b8, 8, 1, [8, 2], 41);
  const glass = (name, color, metalness, over) => { const m = new THREE.MeshStandardMaterial({ map: gz.map, normalMap: gz.normalMap, roughness: 0.05, metalness, color, ...over }); m.name = name; return m; };
  SHEETS = {
    B: B.uv, P: P.uv, full: [...B.full, ...P.full], used: [B.y + B.row, P.y + P.row],
    BD: mk(bt, 'sw-chalkboards', 0.9, { envMapIntensity: 0.3 }), PR: mk(pt, 'sw-prints', 0.55, { envMapIntensity: 0.4 }),
    EXIT: mk(pt, 'sw-exit-signs', 0.6, { emissive: 0xffffff, emissiveMap: pt, emissiveIntensity: 0.85 }),
    DRAPE: mk(dt, 'sw-drapes', 0.95, { side: THREE.DoubleSide }),
    STAIN: mk(st, 'sw-weathering', 1, { transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -2 }),
    LETTERS: mk(lt, 'sw-letters', 0.45, { color: 0xb3261e, alphaTest: 0.5, metalness: 0.15 }),
    // window glass: the names make the lighting module light these after dusk
    GLN: glass('sw-glass-north', 0xb4c6cc, 0.6, { transparent: true, opacity: 0.5, depthWrite: false, side: THREE.DoubleSide, envMapIntensity: 1.5 }),
    GLC: glass('sw-glass-corridor', 0xffffff, 0.25, { transparent: true, opacity: 0.3, depthWrite: false, side: THREE.DoubleSide, envMapIntensity: 1.2 }),
    GLD: glass('sw-glass-dark', 0x8a9ca6, 0.6, { envMapIntensity: 1.5 }),
  };
  if (typeof globalThis !== 'undefined') globalThis.__swSheets = { full: SHEETS.full, used: SHEETS.used };
  return SHEETS;
}

// ================= materials and small geometry tools =================
// cheap tiling textures (a few fillRects each; the fine grain comes from the page's surface-grain pass)
const rgb = (c, k = 1) => `rgb(${c.map(ch => Math.max(0, Math.min(255, Math.round(ch * k)))).join(',')})`;
function canvasTex(w, h, draw, mx, my = mx) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(1 / mx, 1 / my); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  return t;
}
const speckleTex = (c, metres, lo = 0.86, span = 0.26, n = 2600, chips = null) => canvasTex(256, 256, (g, S) => {    // terrazzo: chips of stone in a cement ground
  const r = rng(c[0] * 7 + c[2]); g.fillStyle = rgb(c); g.fillRect(0, 0, S, S);
  for (let i = 0; i < n; i++) { g.fillStyle = chips && r() < 0.3 ? rgb(chips[Math.floor(r() * chips.length)], 0.9 + r() * 0.2) : rgb(c, lo + r() * span); const s = 1 + r() * 3.2; g.fillRect(r() * S, r() * S, s, s * (0.6 + r() * 0.8)); }
}, metres);
const tileTex = (c, metres, n = 2, joint = 0.74, lw = 1.6) => canvasTex(256, 256, (g, S) => {                          // n by n tiles per repeat
  const r = rng(11 + c[1]), w = S / n;
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) { g.fillStyle = rgb(c, 0.955 + r() * 0.075); g.fillRect(x * w, y * w, w, w); for (let i = 0; i < 90 / n; i++) { g.fillStyle = rgb(c, 0.9 + r() * 0.16); g.fillRect(x * w + r() * w, y * w + r() * w, 1 + r() * 2, 1 + r() * 2); } }
  g.strokeStyle = rgb(c, joint); g.lineWidth = lw;
  for (let i = 0; i <= n; i++) { g.beginPath(); g.moveTo(i * w, 0); g.lineTo(i * w, S); g.moveTo(0, i * w); g.lineTo(S, i * w); g.stroke(); }
}, metres);

const local = {};
/** Materials of this building by name. Plain colours are flagged and later merged into vertex-coloured meshes (mergeFlat). */
function lm(name) {
  if (local[name]) return local[name];
  const S = (color, roughness = 0.85, metalness = 0, extra = {}) => { const m = new THREE.MeshStandardMaterial({ color, roughness, metalness, ...extra }); if (!extra.emissive) m.userData.flat = metalness >= 0.5 ? 'metal' : roughness < 0.5 ? 'gloss' : 'matte'; return m; };
  const T = (map, roughness = 0.85, extra = {}) => new THREE.MeshStandardMaterial({ map, roughness, envMapIntensity: 0.45, ...extra });
  const make = {
    // room and corridor surfaces that glow a little after dusk (the lights are on): kept as materials of their own
    plaster: () => S(0xf3f0e6, 0.9, 0, { emissive: 0xf3f0e6, emissiveIntensity: 0.05 }), ceil: () => S(0xf7f5ef, 0.92, 0, { emissive: 0xf7f5ef, emissiveIntensity: 0.14 }),
    corr: () => S(0xf1ecdd, 0.9, 0, { emissive: 0xf1ecdd, emissiveIntensity: 0.04 }),
    // paint
    white: () => S(0xf3f2ee, 0.55), dark: () => S(0x26292c, 0.6), dadoA: () => S(0xbcd2b2, 0.55), dadoB: () => S(0xb9cfde, 0.55), dadoC: () => S(0xe6dcbc, 0.55), trim: () => S(0x4f7a5a, 0.5), trimB: () => S(0x4f7396, 0.5), trimC: () => S(0xa08456, 0.5), skirt: () => S(0x3a3d40, 0.5),
    deck: () => S(0x8c8e8c, 0.95), roofCream: () => S(0xd6c8aa, 0.9), roofStrip: () => S(0xb0b0a8, 0.9), border: () => S(0x5a5650, 0.45),
    // metal, plastic
    alu: () => S(0xc8ccd0, 0.38, 0.7), steel: () => S(0xbcc1c5, 0.34, 0.85), darkMetal: () => S(0x2b2d30, 0.45, 0.6), pvc: () => S(0xe6e4dc, 0.6), red: () => S(0xb8322a, 0.5), yellow: () => S(0xe0b020, 0.6), blue: () => S(0x1f5fa8, 0.5),
    green: () => S(0x2f8a55, 0.55), steelDoor: () => S(0x8e9a94, 0.5, 0.3), lockerBody: () => S(0x9fb0b8, 0.55), cabinet: () => S(0xd9d6ca, 0.55), fan: () => S(0xeceae3, 0.5), steelBox: () => S(0xb9bec2, 0.4, 0.6),
    binGrey: () => S(0x6b7377, 0.6), binGreen: () => S(0x3d8a55, 0.6), nosing: () => S(0x303234, 0.8),
    // wood, fabric, clay, paper
    door: () => S(0xb07a48, 0.55), doorFrame: () => S(0x7a5232, 0.55), platform: () => S(0x8f8474, 0.7), deskTop: () => S(0xd9bd8c, 0.5), deskSteel: () => S(0x60728a, 0.5, 0.3), seat: () => S(0xc9995c, 0.6),
    benchBody: () => S(0xe3e0d4, 0.6), benchTop: () => S(0x2a2d30, 0.4), woodDark: () => S(0x8a5a34, 0.6), cork: () => S(0xb58d57, 0.95), felt: () => S(0x3f6f5a, 0.95), feltBlue: () => S(0x35557f, 0.95), fabric: () => S(0x6f7c88, 0.92),
    sofa: () => S(0x4a5a6e, 0.9), terracotta: () => S(0xb5654a, 0.8), soil: () => S(0x4b3d2f, 1), screen: () => S(0xf7f7f3, 0.8), sheetA: () => S(0xf4f1e6, 0.9), sheetB: () => S(0xf3e3a4, 0.9), sheetC: () => S(0xbfd9ee, 0.9),
    lamp: () => S(0xffffff, 0.6, 0, { emissive: 0xfff4d8, emissiveIntensity: 0.9 }),
    // textured
    terrazzo: () => T(speckleTex([186, 182, 170], 1.6, 0.86, 0.24, 3200, [[120, 112, 100], [226, 222, 210], [150, 128, 110]]), 0.5), tread: () => T(speckleTex([170, 166, 158], 1.6, 0.86, 0.24, 3000, [[110, 106, 100], [220, 216, 206]]), 0.6),
    ctile: () => T(tileTex([206, 198, 182], 1.2, 2, 0.62, 2.2), 0.42), dtile: () => T(tileTex([238, 240, 232], 0.6, 4, 0.8, 1.2), 0.3),
  };
  const m = make[name](); m.name = 'sw-' + name;      // named, so the lighting module does not take smooth ones for window glass
  return (local[name] = m);
}

// Draw-call saver: all plain-coloured parts of a group become one mesh per finish (matte, gloss, metal) with vertex colours.
const flatMats = {};
function flatMat(key) {
  if (!flatMats[key]) { const [roughness, metalness] = { matte: [0.86, 0], gloss: [0.42, 0.02], metal: [0.38, 0.72] }[key]; flatMats[key] = new THREE.MeshStandardMaterial({ vertexColors: true, roughness, metalness }); flatMats[key].name = 'sw-flat-' + key; }
  return flatMats[key];
}
function mergeFlat(group, castShadow) {
  const buckets = {};
  for (const m of group.children) if (m.isMesh && !m.isInstancedMesh && m.material.userData.flat) (buckets[m.material.userData.flat] ||= []).push(m);
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
    const mesh = new THREE.Mesh(g, flatMat(key)); mesh.castShadow = castShadow; mesh.receiveShadow = true; group.add(mesh);
  }
  return group;
}

/** Quads with their own texture coordinates (cards cut from a texture sheet, glass panes, curtains), merged per material. Coordinates are local to the slab. */
class Cards {
  constructor() { this.parts = new Map(); this.m = null; }
  /** Local frame for the cards added next, as Batch.frame; call frame() to return to the slab's own. */
  frame(x = 0, z = 0, ang = 0, y = 0) { this.m = x || z || ang || y ? new THREE.Matrix4().makeRotationY(ang).setPosition(x, y, z) : null; return this; }
  /** Corners in order, counter-clockwise seen from the visible side, starting at the lower left; uv = [u0, v0, u1, v1]. */
  quad(material, a, b, c, d, uv) {
    let p = this.parts.get(material); if (!p) this.parts.set(material, (p = { pos: [], nor: [], uv: [], idx: [] }));
    const P = [a, b, c, d].map(q => { const w = new THREE.Vector3(q[0], q[1], q[2]); return this.m ? w.applyMatrix4(this.m) : w; });
    const n = new THREE.Vector3().subVectors(P[1], P[0]).cross(new THREE.Vector3().subVectors(P[3], P[0])).normalize(), base = p.pos.length / 3;
    for (const w of P) { p.pos.push(w.x, w.y, w.z); p.nor.push(n.x, n.y, n.z); }
    p.uv.push(uv[0], uv[1], uv[2], uv[1], uv[2], uv[3], uv[0], uv[3]); p.idx.push(base, base + 1, base + 2, base, base + 2, base + 3); return this;
  }
  /** Upright card. face: the way it looks ('S' +z, 'N' -z, 'E' +x, 'W' -x); (x, y, z): its lower corner with the smaller x or z; w along the wall, h up. */
  wall(material, uv, face, x, y, z, w, h) {
    const q = face === 'S' ? [[x, y, z], [x + w, y, z], [x + w, y + h, z], [x, y + h, z]] : face === 'N' ? [[x + w, y, z], [x, y, z], [x, y + h, z], [x + w, y + h, z]]
      : face === 'E' ? [[x, y, z + w], [x, y, z], [x, y + h, z], [x, y + h, z + w]] : [[x, y, z], [x, y, z + w], [x, y + h, z + w], [x, y + h, z]];
    return this.quad(material, q[0], q[1], q[2], q[3], uv);
  }
  /** Card lying flat, face up, read from the south (turn the frame for other directions): (x, z) its north-west corner. */
  flat(material, uv, x, y, z, w, d) { return this.quad(material, [x, y, z + d], [x + w, y, z + d], [x + w, y, z], [x, y, z], uv); }
  build(name, ox, oz, castShadow = false) {
    const group = new THREE.Group(); group.name = name; group.position.set(ox, 0, oz);
    for (const [material, p] of this.parts) {
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(p.pos, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(p.nor, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(p.uv, 2)); g.setIndex(p.idx);
      const mesh = new THREE.Mesh(g, material); mesh.castShadow = castShadow && !material.transparent; mesh.receiveShadow = !material.transparent; group.add(mesh);
    }
    return group;
  }
}

/** Small things by the hundred: boxes, round tins, balls and glassware as instanced meshes with a colour each. Coordinates are local to the slab. */
const UP = new THREE.Vector3(0, 1, 0);
let instGeo = null, thingMat = null, wareMat = null;
class Inst {
  constructor() { this.b = []; this.c = []; this.s = []; this.w = []; }
  /** Box by its low corner. */
  box(x, y, z, sx, sy, sz, hex) { this.b.push([x + sx / 2, y, z + sz / 2, sx, sy, sz, hex, 0]); return this; }
  /** Box by the centre of its base, turned by rot about the vertical. */
  boxc(cx, y, cz, sx, sy, sz, hex, rot = 0) { this.b.push([cx, y, cz, sx, sy, sz, hex, rot]); return this; }
  cyl(cx, y, cz, r, h, hex) { this.c.push([cx, y, cz, 2 * r, h, 2 * r, hex, 0]); return this; }
  ball(cx, cy, cz, r, hex, sy = 1) { this.s.push([cx, cy, cz, r, r * sy, r, hex, 0]); return this; }
  ware(cx, y, cz, r, h, hex = 0xdfeef0) { this.w.push([cx, y, cz, 2 * r, h, 2 * r, hex, 0]); return this; }
  build(group, ox, oz, name) {
    if (!instGeo) {
      instGeo = { b: new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0), c: new THREE.CylinderGeometry(0.5, 0.5, 1, 9).translate(0, 0.5, 0), s: new THREE.IcosahedronGeometry(1, 1) };
      thingMat = new THREE.MeshStandardMaterial({ roughness: 0.6 }); thingMat.name = 'sw-things';
      wareMat = new THREE.MeshStandardMaterial({ roughness: 0.08, transparent: true, opacity: 0.4, depthWrite: false }); wareMat.name = 'sw-labware';
    }
    const M = new THREE.Matrix4(), q = new THREE.Quaternion(), P = new THREE.Vector3(), Sc = new THREE.Vector3(), col = new THREE.Color();
    for (const [key, list] of [['b', this.b], ['c', this.c], ['s', this.s], ['w', this.w]]) {
      if (!list.length) continue;
      const im = new THREE.InstancedMesh(key === 'w' ? instGeo.c : instGeo[key], key === 'w' ? wareMat : thingMat, list.length);
      list.forEach(([x, y, z, sx, sy, sz, hex, rot], i) => { im.setMatrixAt(i, M.compose(P.set(ox + x, y, oz + z), q.setFromAxisAngle(UP, rot), Sc.set(sx, sy, sz))); im.setColorAt(i, col.setHex(hex)); });
      im.name = name + '-' + key; im.castShadow = false; im.receiveShadow = key !== 'w'; im.computeBoundingSphere(); group.add(im);
    }
    return group;
  }
}

// One pupil's desk and one chair, both facing +x with the origin on the floor under their middle; instanced per classroom.
const furniture = {};
function furnitureSet(key, low) {
  if (furniture[key]) return furniture[key];
  const b = new Batch(), TOP = lm('deskTop'), ST = lm('deskSteel'), SE = lm('seat');
  if (key === 'desk') {
    b.box(TOP, 0, 0.7475, 0, 0.42, 0.025, 0.6);
    b.box(ST, 0.01, 0.67, 0, 0.36, 0.13, 0.54, 'UW');                                              // book box, open toward the pupil
    if (low) for (const z of [-0.27, 0.27]) b.box(ST, 0, 0.3, z, 0.36, 0.6, 0.02, 'UD');
    else {
      for (const x of [-0.18, 0.18]) for (const z of [-0.27, 0.27]) b.box(ST, x, 0.3, z, 0.025, 0.6, 0.025, 'UD');
      for (const z of [-0.27, 0.27]) b.box(ST, 0, 0.0125, z, 0.44, 0.025, 0.03, 'D');              // feet
      b.box(ST, 0.18, 0.14, 0, 0.02, 0.02, 0.52, 'NS');                                            // foot rest
    }
  } else {
    b.box(SE, 0, 0.43, 0, 0.36, 0.025, 0.36); b.box(SE, -0.185, 0.73, 0, 0.02, 0.2, 0.36);         // seat and back
    if (low) for (const z of [-0.16, 0.16]) b.box(ST, -0.01, 0.21, z, 0.34, 0.42, 0.02, 'UD');
    else for (const z of [-0.16, 0.16]) { b.box(ST, 0.15, 0.21, z, 0.022, 0.42, 0.022, 'UD'); b.box(ST, -0.17, 0.41, z, 0.022, 0.82, 0.022, 'D'); b.box(ST, -0.01, 0.2, z, 0.3, 0.02, 0.02, 'EW'); }
  }
  return (furniture[key] = mergeFlat(b.build({ castShadow: false }), false).children[0]);
}

export function build(item, ctx) {
  const p = plan(item, ctx.campus), low = !!ctx.lowPower;
  const { L, H, FH, roofY, X0, X1, zN, zP, zS, zc, zw, xA, xs0, xs1, zones, rooms, run, zl, zh, zsn, xb1, xa1, xa2 } = p;
  const yTop = roofY - 0.3, yS = H - SLAB, cw = zS - 0.12 - zc, RISE = FH / 2 / STEPS, zE = zones[zones.length - 1].zn;
  const ceilOf = k => (k === FLOORS - 1 ? yTop : (k + 1) * FH - 0.15);
  const TX = sheets(low, p), uP = TX.P, uB = TX.B, PR = TX.PR, BD = TX.BD, GLN = TX.GLN, GLC = TX.GLC, GLD = TX.GLD;

  // four tiers: shell (always drawn), corridor and facade fittings, interiors, fine objects; each has boxes (Batch), cards and instanced things
  const v = new Batch(), c = new Batch(), ex = new Batch(), fu = new Batch(), fx = new Batch();
  const cv = new Cards(), cex = new Cards(), cfu = new Cards(), cfx = new Cards(), iex = new Inst(), ifu = new Inst(), ifx = new Inst();
  const home = b => b.frame(p.ox, p.oz); [v, c, ex, fu, fx].forEach(home);
  const F = (b, m, x, y, z, sx, sy, sz, faces) => b.slab(m, x, y, z, sx, sy, sz, skipOf(faces));   // box drawing only the listed faces
  const hit = (x, y, z, sx, sy, sz) => c.slab('generic', x, y, z, sx, sy, sz);
  const W = farTile('wallWhite'), R = farTile('wallMaroon'), GR = pbr('granitePolished', [0x6f6a66, 9]), PAVE = pbr('paving', [0xb9b3a7, 0x9c968c, 4, 8, [2.4, 2.4], 11, true]), HEDGE = pbr('hedge');
  const PL = lm('plaster'), CE = lm('ceil'), DA = lm('dadoA'), CO = lm('corr'), DK = lm('dark'), DM = lm('darkMetal'), AL = lm('alu'), WH = lm('white'), LAMP = lm('lamp'), RAIL = pbr('steel'), PV = lm('pvc');
  // inclined slab whose TOP surface runs from (zA, yA) to (zB, yB), between xa and xb
  const incl = (b, m, xa, xb, zA, yA, zB, yB, th, faces) => {
    const [zn, yn, zs, ys] = zA < zB ? [zA, yA, zB, yB] : [zB, yB, zA, yA], len = Math.hypot(zs - zn, ys - yn), ang = Math.atan2(yn - ys, zs - zn);
    b.setMatrix(new THREE.Matrix4().makeRotationX(ang).setPosition(p.ox + (xa + xb) / 2, (yn + ys) / 2 - Math.cos(ang) * th / 2, p.oz + (zn + zs) / 2 - Math.sin(ang) * th / 2));
    b.box(m, 0, 0, 0, xb - xa, th, len, skipOf(faces)); home(b);
  };
  const stick = (b, m, a, q, t) => { b.strut(m, [p.ox + a[0], a[1], p.oz + a[2]], [p.ox + q[0], q[1], p.oz + q[2]], t); home(b); };

  // ================= SHELL (always drawn) and colliders =================
  // ---- windows: aluminium frames with two sliding sashes, here and there slid open; every pane is a card with its own tilt ----
  const wr = rng(977);
  const pane = (m, x, y, z, w, h, v0 = 0.05, v1 = 1.95) => { const i = Math.floor(wr() * 8); cv.wall(m, [i + 0.05, v0, i + 0.95, v1], 'N', x, y, z, w, h); };
  const sash = (m, x, w, ya, yb, z) => {
    if (!low) { F(v, AL, x, ya, z, 0.035, yb - ya, 0.03, 'NSEW'); F(v, AL, x + w - 0.035, ya, z, 0.035, yb - ya, 0.03, 'NSEW'); F(v, AL, x + 0.035, ya, z, w - 0.07, 0.04, 0.03, 'NSU'); F(v, AL, x + 0.035, yb - 0.04, z, w - 0.07, 0.04, 0.03, 'NSD'); }
    pane(m, x + 0.03, ya + 0.03, z + 0.015, w - 0.06, yb - ya - 0.06);
  };
  const windowUnit = (m, a, b, y0, y1, yt, zf, chance) => {                         // between a and b; sashes up to the transom yt (0: full height), a fixed light above it
    const u = b - a, hw = (u - 0.08) / 2, top = yt ? yt - 0.025 : y1 - 0.04;
    F(v, AL, a, y0, zf, 0.04, y1 - y0, 0.09, 'NSE'); F(v, AL, b - 0.04, y0, zf, 0.04, y1 - y0, 0.09, 'NSW');
    F(v, AL, a + 0.04, y0, zf, u - 0.08, 0.04, 0.09, 'NSU'); F(v, AL, a + 0.04, y1 - 0.04, zf, u - 0.08, 0.04, 0.09, 'NSD');
    const open = wr() < chance ? 0.3 + 0.6 * wr() : 0;
    sash(m, a + 0.04, hw + 0.02, y0 + 0.04, top, zf + 0.01); sash(m, a + 0.04 + hw - 0.02 - open * (hw - 0.04), hw + 0.02, y0 + 0.04, top, zf + 0.045);
    if (yt) { F(v, AL, a + 0.04, yt - 0.025, zf, u - 0.08, 0.05, 0.09, 'NSUD'); pane(m, a + 0.04, yt + 0.025, zf + 0.04, u - 0.08, y1 - 0.04 - yt - 0.025, 1.0, 1.95); }
  };
  const stain = (face, x, y, z, w, h) => cv.wall(TX.STAIN, [x / 2.4, 0, (x + w) / 2.4, 1], face, x, y, z, w, h);    // streaks hanging down from the top edge of the card
  // ---- north face of the rooms: piers at the bay lines, two slim piers per bay, white bands, a granite plinth ----
  zones.forEach((z, i) => {
    const xa = i ? z.a + 0.1 : z.a, xb = i < zones.length - 1 ? z.b + 0.1 : xs0, zn = z.zn, len = xb - xa;
    hit(xa, 0, zn, len, roofY, WALL);
    for (const x of z.lines) { const pa = Math.max(xa, x - 0.25), pb = Math.min(xb, x + 0.25); F(v, W, pa, 0, zn - 0.06, pb - pa, yTop, WALL + 0.06, 'NEW'); F(v, PL, pa, 0, zn, pb - pa, yTop, WALL + 0.004, 'S'); }
    F(v, GR, xa, 0, zn - 0.1, len, 0.5, 0.1, 'NUEW');
    for (let k = 0; k < FLOORS; k++) {
      const y = k * FH, by = y + HEAD, bh = (k === FLOORS - 1 ? yTop : y + FH) - by;
      F(v, W, xa, y, zn, len, SILL, WALL, 'NU'); F(v, DA, xa, y, zn, len, SILL, WALL, 'S');                                       // spandrel
      F(v, W, xa, by, zn - 0.03, len, bh, WALL + 0.03, 'ND'); F(v, PL, xa, by, zn, len, bh, WALL, 'S');                           // band over the windows
      F(v, WH, xa, y + SILL - 0.07, zn - 0.1, len, 0.07, 0.1, 'NUD');                                                           // projecting sill
      for (let j = 0; j < z.lines.length - 1; j++) {
        const a = z.lines[j] + 0.25, b = z.lines[j + 1] - 0.25, u = (b - a - 0.4) / 3;
        if (k) stain('N', a, y + SILL - 0.62, zn - 0.006, b - a, 0.55);
        for (let q = 0; q < 3; q++) {
          const xu = a + q * (u + 0.2);
          if (q) { F(v, W, xu - 0.2, y + SILL, zn, 0.2, HEAD - SILL, WALL, 'NEW'); F(v, PL, xu - 0.2, y + SILL, zn, 0.2, HEAD - SILL, WALL, 'S'); }
          windowUnit(GLN, xu, xu + u, y + SILL, y + HEAD, y + 2.25, zn + 0.06, 0.17);
        }
      }
    }
    stain('N', xa, yTop - 0.9, zn - 0.036, len, 0.9);
    for (const x of z.lines) {
      if (x < xb - 1) F(v, PV, x + 0.25, 0, zn - 0.09, 0.03, (FLOORS - 1) * FH + 0.4, 0.03, 'NEW');                               // condensate stack of the air-conditioners
      if (x > xa + 1 && x < xb - 1 && Math.round((x - z.a) / (z.lines[1] - z.a)) % 2 === 1) {                                    // rainwater pipe on every other pier, with a hopper and clips
        v.cyl(PV, x, 0, zn - 0.13, 0.055, yTop - 0.3, 8, false); F(v, PV, x - 0.11, yTop - 0.3, zn - 0.24, 0.22, 0.26, 0.18, 'NEWUD');
        for (let y = 1.2; y < yTop - 1; y += 2.4) F(v, DM, x - 0.075, y, zn - 0.2, 0.15, 0.04, 0.14, 'NEWUD');
      }
    }
  });
  if (zones.length > 1) {                                                          // the step in the north face: a short wall facing east
    const xq = zones[0].b, zb = zones[1].zn;
    F(v, W, xq - 0.1, 0, zN, 0.2, yTop, zb - zN, 'E'); F(v, PL, xq - 0.1, 0, zN + WALL, 0.2, yTop, zw - zN - WALL, 'W'); F(v, PL, xq - 0.1, 0, zb + WALL, 0.2, yTop, zw - zb - WALL, 'E');
    F(v, GR, xq + 0.1, 0, zN, 0.04, 0.5, zb - zN - 0.1, 'EUN'); hit(xq - 0.1, 0, zN, 0.2, roofY, zw - zN);
  }
  // curtains just inside the north windows, the air-conditioners' outdoor units below them
  const drape = (xa, xb, y, zi, col) => { const k = xb - xa < 0.75 ? 2.4 : 1, v0 = 1 - (col + 0.7) / 4; cv.wall(TX.DRAPE, [xa * k, v0, xb * k, v0 + 0.1], 'N', xa, y + SILL - 0.08, zi + 0.05, xb - xa, HEAD - SILL + 0.1); };
  const acOut = (line, y, zn) => {                                                  // condenser on brackets, the insulated line up the pier
    const x = line + 0.34, z0 = zn - 0.38, yb = y + 0.14;
    F(v, WH, x, yb, z0, 0.8, 0.54, 0.3, 'NEWUD'); cv.wall(PR, uP.ac, 'N', x, yb, z0 - 0.003, 0.8, 0.54);
    for (const dx of [0.1, 0.66]) F(v, DM, x + dx, yb - 0.04, z0 - 0.02, 0.04, 0.04, 0.4, 'NEWD');
    F(v, WH, line + 0.17, y + 0.5, zn - 0.11, 0.05, 2.55, 0.05, 'NEW'); F(v, WH, line + 0.22, y + 0.5, zn - 0.11, 0.12, 0.05, 0.05, 'NUD');
    if (!y) F(v, 'concrete', x - 0.05, 0, z0 - 0.04, 0.9, 0.1, 0.4, 'NEWU');
  };
  rooms.forEach((r, ri) => { for (let k = 0; k < FLOORS; k++) {
    const y = k * FH, kind = kindOf(r, k), col = (k * 3 + ri * 5 + 1) % 4;
    for (const [a, b] of r.bays) {
      const wa = a + 0.25, wb = b - 0.25, full = (wb - wa) / 2, q = wr(), q2 = wr();
      const wl = kind === 'prep' || q > 0.86 ? full : q < 0.55 ? 0.4 + 0.25 * wr() : 0.9 + 1.2 * wr(), we = kind === 'prep' || q > 0.86 ? full : q2 < 0.6 ? 0.4 + 0.25 * wr() : 0.9 + 1.0 * wr();
      drape(wa, wa + wl, y, r.zi, col); drape(wb - we, wb, y, r.zi, col);
      if (kind !== 'prep') acOut(a, y, r.zn);
    }
  } });
  // ---- closed block at the west end: white bay with small square windows, dark-red panel ----
  const zr = zN + (zc - zN) * 0.62;
  F(v, W, X0, 0, zN, WALL, roofY + PARAPET, zr - zN, 'WNU'); F(v, R, X0 - 0.06, 0, zr, WALL + 0.06, roofY + PARAPET, zc - zr, 'WNSU');
  F(v, W, X0, 0, zN, xA - X0, yTop, WALL, 'N'); F(v, PL, xA - 0.1, 0, zN + WALL, 0.2, yTop, zw - zN - WALL, 'E');
  F(v, GR, X0 - 0.04, 0, zN - 0.04, 0.04, 0.5, zr - zN + 0.04, 'WNU'); F(v, GR, X0 - 0.1, 0, zr - 0.04, 0.04, 0.5, zc - zr + 0.04, 'WNU'); F(v, GR, X0, 0, zN - 0.04, xA - X0, 0.5, 0.04, 'NU');
  hit(X0, 0, zN, xA + 0.1 - X0, roofY, zc - zN); hit(X0, roofY, zN, WALL, 1.7, zc - zN);
  for (let k = 0; k < FLOORS; k++) for (const t of [0.3, 0.7]) {
    const y = k * FH, z0 = zN + (zr - zN) * t - 0.55, x0 = X0 + (xA - X0) * t - 0.45;
    cv.wall(GLD, [k + 0.05, 0.9, k + 0.95, 1.95], 'W', X0 - 0.012, y + 1.35, z0, 1.1, 1.1); cv.wall(GLD, [k + 2.05, 0.9, k + 2.95, 1.95], 'N', x0, y + 1.6, zN - 0.012, 0.9, 0.9);
    F(v, WH, X0 - 0.07, y + 1.29, z0 - 0.05, 0.07, 0.06, 1.2, 'WUDNS'); F(v, AL, X0 - 0.04, y + 1.35, z0 + 0.525, 0.03, 1.1, 0.05, 'WNS'); F(v, AL, X0 - 0.04, y + 1.875, z0, 0.03, 0.05, 1.1, 'WUD');
    F(v, WH, x0 - 0.05, y + 1.54, zN - 0.07, 1.0, 0.06, 0.07, 'NUDEW'); F(v, AL, x0 + 0.425, y + 1.6, zN - 0.04, 0.05, 0.9, 0.03, 'NEW');
    if (k) { stain('W', X0 - 0.014, y + 0.84, z0, 1.1, 0.45); stain('N', x0, y + 1.09, zN - 0.014, 0.9, 0.45); }
  }
  stain('W', X0 - 0.068, roofY + PARAPET - 1.4, zr, zc - zr, 1.4);
  // ---- east end wall, stair hall walls (windows at the half landings) ----
  F(v, W, xs1, 0, zE, WALL, yTop, zS - zE, 'ENS'); F(v, CO, xs1, 0, zE, WALL, yTop, zS - zE, 'W'); hit(xs1, 0, zE, WALL, roofY, zS - zE);
  F(v, GR, xs1 + WALL, 0, zE - 0.04, 0.04, 0.5, zS - zE + 0.04, 'ENSU');
  F(v, PL, xs0 - 0.2, 0, zsn, 0.2, yTop, zw - zsn, 'W'); F(v, CO, xs0 - 0.2, 0, zsn, 0.2, yTop, zw - zsn, 'E'); hit(xs0 - 0.2, 0, zsn, 0.2, roofY, zc - zsn);
  const swa = (xs0 + xs1) / 2 - 0.8, swb = swa + 1.6;
  F(v, W, xs0, 0, zE, swa - xs0, yTop, WALL, 'N'); F(v, CO, xs0, 0, zE, swa - xs0, yTop, WALL, 'SE');
  F(v, W, swb, 0, zE, xs1 - swb, yTop, WALL, 'N'); F(v, CO, swb, 0, zE, xs1 - swb, yTop, WALL, 'SW');
  F(v, GR, xs0, 0, zE - 0.04, xs1 + WALL - xs0, 0.5, 0.04, 'NU'); hit(xs0, 0, zE, xs1 - xs0, roofY, WALL);
  for (let k = 0, yy = 0; k < FLOORS; k++) {
    const ya = k < FLOORS - 1 ? k * FH + FH / 2 + 0.95 : yTop;
    F(v, W, swa, yy, zE, 1.6, ya - yy, WALL, 'NUD'); F(v, CO, swa, yy, zE, 1.6, ya - yy, WALL, 'S');
    if (k < FLOORS - 1) { windowUnit(GLN, swa, swb, ya, ya + 1.4, 0, zE + 0.06, 0.25); F(v, WH, swa - 0.05, ya - 0.06, zE - 0.07, 1.7, 0.06, 0.07, 'NUDEW'); stain('N', swa, ya - 0.5, zE - 0.006, 1.6, 0.44); }
    yy = ya + 1.4;
  }
  // ---- partitions between rooms of the same depth ----
  rooms.forEach((r, i) => { const nx = rooms[i + 1]; if (nx && nx.zn === r.zn) { F(v, PL, r.b - 0.1, 0, r.zi, 0.2, yTop, zw - r.zi, 'EW'); hit(r.b - 0.1, 0, r.zi, 0.2, yTop, zw - r.zi); } });
  // ---- south side: columns on granite bases, edge beams, solid balustrades with a coping and a steel rail ----
  const cols = [X0 + 0.2, ...new Set(zones.flatMap(z => z.lines)), xs1 - 0.2];
  for (const x of cols) {
    F(v, W, x - 0.2, 0, zS - 0.42, 0.4, yTop, 0.42, 'NSEW'); hit(x - 0.2, 0, zS - 0.42, 0.4, yTop, 0.42); F(v, GR, x - 0.23, 0, zS - 0.45, 0.46, 0.5, 0.48, 'NSEWU');
    for (let k = 1; k <= FLOORS; k++) F(v, W, x - 0.25, k * FH - 0.68, zS - 0.47, 0.5, 0.08, 0.52, 'NSEWD');                    // caps under the edge beams
  }
  cols.forEach((x, i) => { if (i % 2 === 1) { v.cyl(PV, x, 0.5, zS + 0.075, 0.055, yTop - 0.5, 8, false); for (let y = 1.4; y < yTop - 1; y += 2.4) F(v, DM, x - 0.075, y, zS, 0.15, 0.04, 0.14, 'SEWUD'); } });   // rainwater pipes
  // The glass stair tower (a separate item, builder stair-core.js) stands against the west end of this face and opens onto the corridors
  // with a bay on every storey: the balustrades leave that bay free (between the end column and the tower's east pier).
  let gap = null;
  for (const it of (ctx.campus && ctx.campus.items) || []) if (it.style === 'stair-core' && it.points) {
    const ax = it.points.map(q => q[0] - p.ox), az = it.points.map(q => q[1] - p.oz), aw = Math.min(...ax), ae = Math.max(...ax);
    if (X0 > aw + 2 && X0 < ae - 1.6 && Math.max(...az) > zS + 3 && Math.min(...az) < zS + 0.5) gap = [X0 + 0.4, ae - 0.25];
  }
  const bx = gap ? gap[1] : X0;                                                    // where the balustrades start
  for (let k = 1; k <= FLOORS; k++) {
    const y = k * FH, top = k === FLOORS;
    F(v, W, X0, y - 0.6, zS - 0.3, X1 - X0, top ? 0.3 : 0.6, 0.3, 'NSD');                                                       // edge beam
    if (top) break;
    F(v, W, bx, y, zS - 0.12, X1 - bx, 0.85, 0.12, gap ? 'NSUW' : 'NSU'); hit(bx, y, zS - 0.12, X1 - bx, 1.7, 0.12);            // collider taller than the visible balustrade
    F(v, W, X0, y - 0.15, zc, 0.12, 1.0, zS - 0.12 - zc, 'EWU'); hit(X0, y, zc, 0.12, 1.7, zS - 0.12 - zc);                     // across the west end of the corridor
    F(v, WH, bx, y + 0.85, zS - 0.16, X1 - bx, 0.04, 0.2, gap ? 'NSUDW' : 'NSUD'); F(v, RAIL, bx, y + 1.07, zS - 0.085, X1 - bx, 0.04, 0.05, gap ? 'NSUDW' : 'NSUD');
    for (let x = bx + (gap ? 0.03 : 0.6); x < X1 - 0.3; x += low ? 2.4 : 1.2) F(v, RAIL, x - 0.012, y + 0.89, zS - 0.072, 0.024, 0.18, 0.024, 'NSEW');
    F(v, RAIL, X0 + 0.035, y + 1.07, zc, 0.05, 0.04, zS - 0.42 - zc, 'EWUD');
    if (gap) F(v, GR, gap[0], y, zS - 0.3, gap[1] - gap[0], 0.024, 0.43, 'UN');                                                  // threshold stone in the bay
    stain('S', bx, y + 0.3, zS + 0.005, X1 - bx, 0.55);
    for (let i = 0; i < cols.length - 1; i++) { const xm = (cols[i] + cols[i + 1]) / 2 + 0.9; if (xm < bx + 0.3) continue; F(v, PV, xm - 0.03, y - 0.1, zS, 0.06, 0.06, 0.1, 'SEWUD'); stain('S', xm - 0.2, y - 0.62, zS + 0.006, 0.4, 0.5); }   // scuppers
  }
  // ---- floors, ceilings, the wall between rooms and corridor ----
  const ops = [];
  for (const r of rooms) {
    for (const [xd] of doorsOf(r)) ops.push([xd, xd + 1.0, 'door']);
    for (const [a, b] of winsOf(r)) ops.push([a, b, 'win']);
    if (r.niche) ops.push([r.b - 1.4, r.b - 0.1, 'niche']);
  }
  ops.sort((a, b) => a[0] - b[0]);
  const seg = (xa, xb, y0, h, faces) => {                                          // piece of the corridor wall: plaster inside, cream outside
    if (faces.includes('N')) F(v, PL, xa, y0, zw, xb - xa, h, 0.2, 'N');
    F(v, CO, xa, y0, zw, xb - xa, h, 0.2, faces.replace('N', '')); hit(xa, y0, zw, xb - xa, h, 0.2);
  };
  const plates = zones.map((z, i) => [i ? z.a + 0.1 : X0, i < zones.length - 1 ? z.b + 0.1 : xs0 - 0.2, z.zn]);   // floor plates west of the stair hall: [west, east, north edge]
  const TZ = lm('terrazzo'), CT = lm('ctile'), CB = lm('border');
  for (let k = 0; k < FLOORS; k++) {
    const y = k * FH, cy = ceilOf(k);
    if (k) {
      for (const [xa, xb, zn] of plates) { F(v, CE, xa, y - 0.15, zn, xb - xa, 0.15, zS - zn, 'D'); hit(xa, y - 0.15, zn, xb - xa, 0.15, zS - zn); }
      F(v, CE, xs0 - 0.2, y - 0.15, zl, X1 - xs0 + 0.2, 0.15, zS - zl, 'DN'); hit(xs0 - 0.2, y - 0.15, zl, X1 - xs0 + 0.2, 0.15, zS - zl);
    }
    for (const r of rooms) F(v, TZ, r.a - 0.1, y, r.zi, r.b - r.a, 0.02, zc - r.zi, 'U');                                       // room floors
    F(v, CT, X0, y, zc + 0.18, xs1 - X0, 0.02, cw - 0.36, 'U');                                                                 // corridor: tiles with a darker border
    F(v, CB, X0, y, zc, xs1 - X0, 0.02, 0.18, 'U'); F(v, CB, X0, y, zc + cw - 0.18, xs1 - X0, 0.02, 0.18, 'U');
    F(v, CT, xs0, y, k ? zl : zsn, xs1 - xs0, 0.02, zc - (k ? zl : zsn), 'U');                                                  // stair landing / stair hall floor
    for (const x of cols.slice(1, -1)) F(v, CE, x - 0.12, cy - 0.4, zc, 0.24, 0.4, zS - 0.3 - zc, 'EWD');                        // beams across the corridor
    for (let i = 0; i < cols.length - 1; i++) { const xm = (cols[i] + cols[i + 1]) / 2; if (cols[i + 1] - cols[i] > 2) { F(v, WH, xm - 0.62, cy - 0.07, zc + cw / 2 - 0.07, 1.24, 0.07, 0.14, 'NSEW'); F(v, LAMP, xm - 0.6, cy - 0.095, zc + cw / 2 - 0.04, 1.2, 0.025, 0.08, 'NSEWD'); } }   // tube lights
    let x = X0;
    for (const [a, b, t] of ops) {
      seg(x, a, y, 2.6, 'NSEW');
      if (t === 'win') { seg(a, b, y, 1.3, 'NSU'); windowUnit(GLC, a, b, y + 1.3, y + 2.6, 0, zw + 0.055, 0.3); F(v, WH, a - 0.03, y + 1.27, zc - 0.01, b - a + 0.06, 0.03, 0.06, 'SUDEW'); hit(a, y + 1.3, zw + 0.06, b - a, 1.3, 0.08); }
      else if (t === 'door') { seg(a, b, y + 2.5, 0.1, 'NSD'); pane(GLC, a + 0.05, y + 2.14, zw + 0.1, b - a - 0.1, 0.32, 1.0, 1.95); c.slab('generic', a, y + 2.1, zw + 0.02, b - a, 0.38, 0.16); }   // fanlight over the door
      else seg(a, b, y + 2.1, 0.5, 'NSD');
      if (t === 'niche') {                                                         // recess with a solid back; the dispensers stand in it
        F(v, CO, a, y, zc - 0.78, b - a, 2.1, 0.06, 'S'); F(v, CO, a - 0.05, y, zc - 0.78, 0.05, 2.1, 0.58, 'E'); F(v, CO, b, y, zc - 0.78, 0.05, 2.1, 0.58, 'W');
        F(v, CO, a, y + 2.1, zc - 0.78, b - a, 0.05, 0.58, 'D'); F(v, PL, a - 0.06, y, zc - 0.8, b - a + 0.12, cy - y, 0.6, 'NW'); hit(a - 0.06, y, zc - 0.8, b - a + 0.12, cy - y, 0.58);
      }
      x = b;
    }
    seg(x, xs0, y, 2.6, 'NSEW'); seg(X0, xs0, y + 2.6, cy - y - 2.6, 'NSD');
  }
  // ---- staircase: landings, guard, colliders (the visible flights are fittings) ----
  hit(xb1, 0, zh, 0.2, yTop, run);                                                 // well between the flights: closed for the player
  for (let k = 0; k < FLOORS - 1; k++) {
    const ym = k * FH + FH / 2;
    hit(xs0, ym - 0.15, zsn, xs1 - xs0, 0.15, zh - zsn); F(v, CT, xs0, ym - 0.15, zsn, xs1 - xs0, 0.15, zh - zsn, 'U'); F(v, CE, xs0, ym - 0.15, zsn, xs1 - xs0, 0.15, zh - zsn, 'DS');
  }
  const yT4 = (FLOORS - 1) * FH;                                                   // top floor: guard over the void above the last flight A
  F(v, W, xb1, yT4, zl - 0.1, xa2 - xb1, 1.05, 0.1, 'NSUW'); hit(xb1, yT4, zl - 0.1, xa2 - xb1, 1.7, 0.1);
  // ---- roof deck with parapets and copings ----
  const DECK = 'concrete', par = (x, z, sx, sz) => { F(v, W, x, roofY, z, sx, PARAPET, sz, 'NSEWU'); hit(x, roofY, z, sx, 1.7, sz); };
  zones.forEach((z, i) => {
    const xa = i ? z.a + 0.1 : X0, xb = i < zones.length - 1 ? z.b + 0.1 : X1, zn = z.zn;
    F(v, DECK, xa, yTop, zn, xb - xa, 0.3, zS - zn, 'U'); F(v, W, xa, yTop, zn, xb - xa, 0.3, zS - zn, 'NSEW'); F(v, CE, xa, yTop, zn, xb - xa, 0.3, zS - zn, 'D'); hit(xa, yTop, zn, xb - xa, 0.3, zS - zn);
    par(xa + (i ? 0 : WALL), zn, xb - xa - (i ? 0 : WALL), 0.2);
    if (i) par(xa, zones[i - 1].zn, 0.2, zn - zones[i - 1].zn);
  });
  par(X0, zS - 0.2, X1 - X0, 0.2); par(X0, zc, 0.2, zS - 0.2 - zc); par(X1 - 0.2, zE + 0.2, 0.2, zS - zE - 0.4);
  for (const [x, z, sx, sz] of [[X0, zS - 0.24, X1 - X0, 0.28], [X0 - 0.04, zc, 0.28, zS - zc], [X1 - 0.24, zE, 0.28, zS - zE], ...zones.map((z, i) => [i ? z.a + 0.1 : X0, z.zn - 0.04, (i < zones.length - 1 ? z.b + 0.1 : X1) - (i ? z.a + 0.1 : X0), 0.28])])
    F(v, WH, x, roofY + PARAPET, z, sx, 0.06, sz, 'NSEWUD');
  stain('S', X0, roofY + PARAPET - 1.0, zS + 0.005, X1 - X0, 1.0);
  // ---- the building's name on the parapet, in raised characters (the name is invented) ----
  { const h = 1.25, w = h * 3, x = xs0 - 0.6 - w; for (let i = 0; i < 3; i++) cv.wall(TX.LETTERS, [0, 0, 1, 1], 'S', x, roofY - 0.2, zS + 0.012 + i * 0.016, w, h); }
  // ---- posts and the floating roof slab (solid for the player, without openings) ----
  const xp = p.cutX + 0.7, post = (x, z) => F(v, WH, x - 0.14, roofY, z - 0.14, 0.28, yS - roofY, 0.28, 'NSEW');
  for (const x of cols) if (x > xp) post(x, zP - 0.6);
  for (const z of zones) for (const x of z.lines) post(x + (x === z.a && z !== zones[0] ? 0.4 : 0), z.zn + 0.35);
  post(X0 + 0.2, zN + 0.35); post(X0 + 0.2, zN + 3.6);
  const CREAM = lm('roofCream'), P3 = (q, y) => [q[0], y, q[1]];
  const prow = [[0, 0], p.tip, [p.cutX, zP], [xp, zP], [xp, 0]];                    // counter-clockwise on a north-up map
  for (let i = 1; i < prow.length - 1; i++) {
    v.quad(CREAM, P3(prow[0], H), P3(prow[i], H), P3(prow[i + 1], H), P3(prow[i + 1], H));
    v.quad(WH, P3(prow[0], yS), P3(prow[i + 1], yS), P3(prow[i], yS), P3(prow[i], yS));
  }
  for (let i = 0; i < 3; i++) v.quad(WH, P3(prow[i], yS), P3(prow[i + 1], yS), P3(prow[i + 1], H), P3(prow[i], H));
  v.quad(WH, P3(prow[4], yS), P3(prow[0], yS), P3(prow[0], H), P3(prow[4], H));
  hit(0, yS, 0, xp, SLAB, zP);
  const roofBox = (x, z, sx, sz, top, faces) => { F(v, WH, x, yS, z, sx, SLAB, sz, faces); F(v, top, x, yS, z, sx, SLAB, sz, 'U'); hit(x, yS, z, sx, SLAB, sz); };
  const xq = p.stepped ? p.stepX : L;
  roofBox(xp, 0, xq - xp, zP, CREAM, p.stepped ? 'NSD' : 'NSED');
  if (p.stepped) { roofBox(xq, p.stepZ, L - xq, zP - p.stepZ, CREAM, 'NSED'); F(v, WH, xq - 0.01, yS, 0, 0.01, SLAB, p.stepZ, 'E'); }
  if (p.strip > 0) roofBox(STRIP_X[0], zP, Math.min(L, STRIP_X[1]) - STRIP_X[0], p.strip, lm('roofStrip'), 'SEWD');
  F(v, WH, KERB_X[0], H, zP - 0.2, Math.min(L, KERB_X[1]) - KERB_X[0], 0.25, 0.2, 'NSEWU');                                     // the bright line
  for (const [t, z, s] of UNITS) { F(v, DK, L * t - s / 2, H, z - s / 2, s, 0.6, s, 'NSEWU'); F(v, AL, L * t - s / 2 - 0.05, H + 0.6, z - s / 2 - 0.05, s + 0.1, 0.05, s + 0.1, 'NSEWU'); hit(L * t - s / 2, H, z - s / 2, s, 0.6, s); }
  // lightning protection: rods at the corners, a strip conductor along the edges of the roof slab
  for (const [x, z] of [[0.3, 0.3], [L - 0.3, (p.stepped ? p.stepZ : 0) + 0.3], [L - 0.3, zP - 0.3], [p.cutX + 0.9, zP + Math.max(0, p.strip) - 0.3], [L * 0.5, 0.3]]) { v.cyl(DM, x, H, z, 0.06, 0.12, 6); v.cyl(RAIL, x, H + 0.12, z, 0.014, 1.5, 5); }
  F(v, DM, xp, H + 0.04, 0.12, xq - xp, 0.012, 0.03, 'NSU'); F(v, DM, L - 0.15, H + 0.04, (p.stepped ? p.stepZ : 0) + 0.1, 0.03, 0.012, zP - (p.stepped ? p.stepZ : 0) - 0.2, 'EWU');
  // ---- at the foot: paved apron and a low granite threshold on the south, a drain apron and a clipped hedge on the north, wall lamps ----
  const xw = X0 + 3.4;                                                             // east of where the glass stair tower stands
  F(v, PAVE, xw, 0, zS + 0.02, X1 + 0.3 - xw, 0.035, 2.0, 'USEW'); F(v, GR, xw, 0, zS - 0.44, xs1 - xw, 0.045, 0.46, 'US'); F(v, DM, xw, 0.03, zS + 1.72, X1 + 0.3 - xw, 0.012, 0.18, 'U');
  F(v, lm('yellow'), xs0 + 0.1, 0.03, zS + 0.35, xs1 - xs0 - 0.2, 0.012, 0.3, 'U');                                              // tactile strip before the stair hall
  // parts that stand outside the item's outline are reported to the grounds (ctx.occupy), so that no tree or lamp is put on them
  const occupy = (x0, z0, x1, z1) => { if (ctx.occupy) ctx.occupy([[p.ox + x0, p.oz + z0], [p.ox + x1, p.oz + z0], [p.ox + x1, p.oz + z1], [p.ox + x0, p.oz + z1]]); };
  occupy(xw, zS, X1 + 0.3, zS + 2.05);
  zones.forEach((z, i) => {
    const xa = i ? z.a + 0.3 : X0, xb = i < zones.length - 1 ? z.b - 0.1 : X1, hx = xa + (i ? 0.2 : 4.6), hl = xb - xa - (i ? 3.2 : 4.9);
    F(v, 'concrete', xa, 0, z.zn - 0.62, xb - xa, 0.03, 0.62, 'UNEW'); F(v, HEDGE, hx, 0, z.zn - 1.3, hl, 0.62, 0.68, 'NSEWU'); occupy(hx, z.zn - 1.3, hx + hl, z.zn);
  });
  cols.forEach((x, i) => { if (i % 2 === 0 && i && i < cols.length - 1) { F(v, DM, x - 0.11, 2.62, zS, 0.22, 0.2, 0.03, 'SEWUD'); F(v, LAMP, x - 0.09, 2.64, zS + 0.03, 0.18, 0.16, 0.06, 'SEWUD'); LIT.push([p.ox + x, p.oz + zS + 1.3, 4.5]); } });
  zones.forEach(z => z.lines.forEach((x, i) => { if (i % 2 === 0 && i && x < xs0 - 2) { F(v, DM, x - 0.11, 2.92, z.zn - 0.09, 0.22, 0.2, 0.03, 'NEWUD'); F(v, LAMP, x - 0.09, 2.94, z.zn - 0.15, 0.18, 0.16, 0.06, 'NEWUD'); LIT.push([p.ox + x, p.oz + z.zn - 1.6, 4.5]); } }));

  // ================= CORRIDOR AND FACADE FITTINGS (middle range) =================
  const DOOR = lm('door'), DFR = lm('doorFrame'), SB = lm('steelBox'), DT = lm('dtile'), SK = lm('skirt'), TRIM = lm('trim'), RED = lm('red'), LB = lm('lockerBody');
  const plantsOut = [], plantsIn = [];                                             // [x, y of the soil, z, radius]: leafy balls, added as instanced shrubs at the end
  const pot = (list, inst, x, y, z, r = 0.24, hex = 0xb5654a) => { inst.cyl(x, y, z, r * 0.7, r * 1.25, hex); inst.cyl(x, y + r * 1.25, z, r * 0.62, 0.012, 0x4b3d2f); list.push([x, y + r * 1.25, z, r]); };
  // roof deck under the floating slab: two water tanks on stands, plant boxes, a conduit
  for (const t of [0.2, 0.27]) { const x = xA + (xs0 - xA) * t, z = zE + (zc - zE) * 0.45; ex.cyl(DM, x, roofY, z, 0.5, 0.25, 12); ex.cyl(RAIL, x, roofY + 0.25, z, 0.62, 1.35, 16); ex.cyl(RAIL, x, roofY + 1.6, z, 0.2, 0.08, 10); }
  for (const [t, zf] of [[0.5, 0.4], [0.72, 0.55]]) { const x = xA + (xs0 - xA) * t, zz = zE + (zc - zE) * zf; F(ex, lm('roofStrip'), x - 0.9, roofY + 0.1, zz - 0.6, 1.8, 0.9, 1.2, 'NSEWU'); F(ex, DK, x - 0.8, roofY, zz - 0.5, 1.6, 0.1, 1.0, 'NSEW'); }
  F(ex, DK, xA, roofY, zc + 0.3, xs0 - xA, 0.06, 0.07, 'NSU');
  // name plate on the last column, planters with shrubs between some columns of the ground floor
  cex.wall(PR, uP.nameplate, 'S', xs1 - 0.37, 1.12, zS + 0.006, 0.34, 0.748);
  for (let i = 1; i < cols.length - 2; i += 2) {
    const xm = (cols[i] + cols[i + 1]) / 2, zp = zS - 0.21;
    F(ex, GR, xm - 1.1, 0.04, zp - 0.26, 2.2, 0.42, 0.52, 'NSEW'); F(ex, lm('soil'), xm - 1.02, 0.4, zp - 0.18, 2.04, 0.02, 0.36, 'U'); F(ex, GR, xm - 1.1, 0.42, zp - 0.26, 2.2, 0.04, 0.08, 'U'); F(ex, GR, xm - 1.1, 0.42, zp + 0.18, 2.2, 0.04, 0.08, 'U');
    hit(xm - 1.1, 0.02, zp - 0.26, 2.2, 0.46, 0.52);
    for (let q = 0; q < 4; q++) plantsOut.push([xm - 0.78 + q * 0.52, 0.42, zp, 0.27 + 0.05 * ((q + i) % 2)]);
  }
  // doors: a timber frame with a fanlight, the leaf standing open into the room, a blue plate that stands out from the wall
  const doorSet = (xd, side, y, key, seed) => {
    if (!uP[key]) key = 'plate0_0';                                                // the sheets are drawn once per page: a room the first plan did not have gets the first plate
    for (const xx of [xd, xd + 0.95]) F(ex, DFR, xx, y, zw - 0.02, 0.05, 2.5, 0.24, 'NSEW');
    F(ex, DFR, xd + 0.05, y + 2.08, zw - 0.02, 0.9, 0.06, 0.24, 'NSUD'); F(ex, DFR, xd + 0.05, y + 2.46, zw - 0.02, 0.9, 0.04, 0.24, 'NSD');
    const th = (78 + (seed * 37 % 30)) * Math.PI / 180, ang = side === 'W' ? th : Math.PI - th, hx = side === 'W' ? xd + 0.06 : xd + 0.94, hz = zw - 0.03;
    ex.frame(p.ox + hx, p.oz + hz, ang);
    ex.box(DOOR, 0.45, y + 0.585, 0, 0.9, 1.13, 0.045).box(DOOR, 0.45, y + 1.96, 0, 0.9, 0.22, 0.045).box(DOOR, 0.06, y + 1.5, 0, 0.12, 0.7, 0.045, 'UD').box(DOOR, 0.635, y + 1.5, 0, 0.53, 0.7, 0.045, 'UD');
    ex.box(AL, 0.45, y + 0.13, 0, 0.9, 0.22, 0.052, 'UD').box(AL, 0.8, y + 1.02, 0, 0.13, 0.03, 0.13); home(ex);
    cex.frame(hx, hz, ang); cex.quad(GLC, [0.12, y + 1.15, 0], [0.37, y + 1.15, 0], [0.37, y + 1.85, 0], [0.12, y + 1.85, 0], [3.1, 0.9, 3.9, 1.9]); cex.frame();
    const xp = xd + 1.13;
    F(ex, lm('blue'), xp - 0.007, y + 2.2, zc, 0.014, 0.175, 0.5, 'UDS'); cex.wall(PR, uP[key], 'W', xp - 0.009, y + 2.205, zc + 0.01, 0.48, 0.165); cex.wall(PR, uP[key], 'E', xp + 0.009, y + 2.205, zc + 0.01, 0.48, 0.165);
    cex.wall(PR, uP[key], 'S', xd + 1.1, y + 1.5, zc + 0.016, 0.32, 0.11);
  };
  for (let k = 0; k < FLOORS; k++) {
    const y = k * FH, cy = ceilOf(k);
    // tiled dado with a dark skirting and a green top line on the corridor side of the wall
    let xs = X0 + 0.12;
    for (const [a, b, t] of [...ops, [xs0 - 0.2, xs0 - 0.2, 'end']]) if (t !== 'win') {
      if (a - xs > 0.02) { F(ex, DT, xs, y + 0.12, zc, a - xs, 1.14, 0.012, 'S'); F(ex, SK, xs, y + 0.02, zc, a - xs, 0.1, 0.018, 'SU'); F(ex, TRIM, xs, y + 1.26, zc, a - xs, 0.04, 0.016, 'SUD'); }
      xs = b;
    }
    rooms.forEach((r, ri) => {
      const wl = winsOf(r), kind = kindOf(r, k);
      for (const [xd, side] of doorsOf(r)) doorSet(xd, side, y, `plate${k}_${ri}`, ri * 7 + k * 3 + (side === 'E' ? 1 : 0));
      if (wl.length === 2) {                                                       // notice board between the two windows, two bins under it
        const xm = (wl[0][1] + wl[1][0]) / 2, n0 = (k * 2 + ri * 3) % POSTERS.length;
        F(ex, AL, xm - 0.62, y + 1.4, zc, 1.24, 0.98, 0.014, 'SEWUD'); F(ex, lm((k + ri) % 2 ? 'felt' : 'feltBlue'), xm - 0.58, y + 1.44, zc, 1.16, 0.9, 0.02, 'S');
        cex.wall(PR, uP['poster' + n0], 'S', xm - 0.54, y + 1.53, zc + 0.022, 0.5, 0.71); cex.wall(PR, uP['poster' + (n0 + 1) % POSTERS.length], 'S', xm + 0.04, y + 1.53, zc + 0.022, 0.5, 0.71);
        [[0x6b7377, -0.27], [0x3d8a55, 0.27]].forEach(([hex, dx]) => { iex.cyl(xm + dx, y + 0.02, zc + 0.26, 0.19, 0.58, hex); iex.cyl(xm + dx, y + 0.6, zc + 0.26, 0.2, 0.03, 0x25282b); });
      }
      wl.forEach(([a, b], wi) => {                                                 // under the corridor windows of the upper storeys: lockers, or a bench with a plant
        if (!k || kind === 'prep') return;
        const xm = (a + b) / 2;
        if (wi === 0 && kind !== 'office' ? true : (k + ri) % 2 === 0) {
          const n = Math.min(5, Math.floor((b - a) / 0.4)), x0 = xm - n * 0.2;
          F(ex, LB, x0, y + 0.06, zc + 0.02, n * 0.4, 1.16, 0.4, 'SEWU'); F(ex, DK, x0 + 0.02, y + 0.02, zc + 0.04, n * 0.4 - 0.04, 0.04, 0.34, 'SEW');
          for (let i = 0; i < n; i++) cex.wall(PR, uP['locker' + (i + k * 3 + ri * 5 + wi) % 8], 'S', x0 + i * 0.4 + 0.005, y + 0.07, zc + 0.422, 0.39, 1.14);
          hit(x0, y + 0.03, zc + 0.02, n * 0.4, 1.18, 0.4);
        } else {
          F(ex, lm('woodDark'), xm - 0.8, y + 0.4, zc + 0.04, 1.6, 0.045, 0.36, 'NSEWUD'); for (const dx of [-0.7, 0.66]) F(ex, DM, xm + dx, y + 0.02, zc + 0.07, 0.04, 0.38, 0.3, 'NSEW');
          hit(xm - 0.8, y + 0.03, zc + 0.04, 1.6, 0.42, 0.36); pot(plantsOut, iex, xm + 1.0 > b ? b - 0.15 : xm + 1.0, y + 0.02, zc + 0.26, 0.2);
        }
      });
      if (r.niche) {                                                               // two stainless water dispensers in the niche, signs above them
        const na = r.b - 1.4;
        for (const dx of [0.12, 0.72]) {
          const x = na + dx;
          F(ex, SB, x, y + 0.02, zc - 0.66, 0.44, 1.25, 0.4, 'SEWU'); F(ex, DK, x + 0.07, y + 0.74, zc - 0.26, 0.3, 0.3, 0.004, 'S'); F(ex, AL, x + 0.05, y + 0.7, zc - 0.26, 0.34, 0.03, 0.1, 'SEWUD');
          for (const [tx, hex] of [[0.13, 0xc8322a], [0.27, 0x2a6fc2]]) iex.cyl(x + tx + 0.015, y + 0.86, zc - 0.23, 0.018, 0.07, hex);
        }
        cex.wall(PR, uP.water, 'S', na + 0.14, y + 1.56, zc - 0.716, 0.5, 0.19); cex.wall(PR, uP.save, 'S', na + 0.74, y + 1.58, zc - 0.716, 0.4, 0.15);
      }
    });
    if (rooms.length > 2) {                                                        // hose cabinet, alarm, two extinguishers, an exit sign over the middle of the corridor
      const xc = rooms[1].b;
      F(ex, RED, xc - 0.2, y + 0.85, zc, 0.7, 0.96, 0.07, 'SEWUD'); cex.wall(PR, uP.hose, 'S', xc - 0.2, y + 0.85, zc + 0.072, 0.7, 0.96);
      F(ex, RED, xc + 0.06, y + 2.0, zc, 0.14, 0.14, 0.05, 'SEWUD'); iex.cyl(xc + 0.13, y + 2.2, zc + 0.02, 0.07, 0.05, 0xb8322a);
      for (const dx of [-0.36, -0.52]) { iex.cyl(xc + dx, y + 0.02, zc + 0.11, 0.07, 0.42, 0xb8322a); iex.cyl(xc + dx, y + 0.44, zc + 0.11, 0.025, 0.1, 0x25282b); }
      const zx = zc + cw / 2 - 0.3, xg = xc + 1.3;
      F(ex, DM, xg - 0.02, cy - 0.43, zx - 0.01, 0.04, 0.23, 0.62, 'UDNS'); for (const dz of [0.08, 0.5]) F(ex, DM, xg - 0.005, cy - 0.2, zx + dz, 0.01, 0.2, 0.01, 'NSEW');
      cex.wall(TX.EXIT, uP.exit1, 'W', xg - 0.021, cy - 0.42, zx, 0.6, 0.21); cex.wall(TX.EXIT, uP.exit1, 'E', xg + 0.021, cy - 0.42, zx, 0.6, 0.21);
    }
    { const xe = xs0 - 0.7, zx = zc + cw / 2 - 0.3;                                 // exit sign before the stair hall: arrow to the left for someone walking east
      F(ex, DM, xe - 0.02, cy - 0.43, zx - 0.01, 0.04, 0.23, 0.62, 'UDNS'); for (const dz of [0.08, 0.5]) F(ex, DM, xe - 0.005, cy - 0.2, zx + dz, 0.01, 0.2, 0.01, 'NSEW');
      cex.wall(TX.EXIT, uP.exit0, 'W', xe - 0.021, cy - 0.42, zx, 0.6, 0.21); cex.wall(TX.EXIT, uP.exit1, 'E', xe + 0.021, cy - 0.42, zx, 0.6, 0.21); }
    // stair hall: the storey's number, the evacuation plan (the directory on the ground floor)
    cex.wall(PR, uP['floor' + (k + 1)], 'W', xs1 - 0.006, y + 1.45, zc + 0.35, 0.7, 0.7);
    if (k) cex.wall(PR, uP.evac, 'W', xs1 - 0.006, y + 1.5, zc + 1.4, 0.62, 0.44); else cex.wall(PR, uP.directory, 'W', xs1 - 0.006, y + 1.16, zc + 1.3, 0.94, 1.15);
    // potted plants along the balustrade of the upper storeys
    if (k) for (let i = 1; i < cols.length - 2; i += 2) { const x = cols[i] + 0.52, z = zS - 0.38; pot(plantsOut, iex, x, y + 0.02, z, 0.24 + 0.03 * ((i + k) % 3)); hit(x - 0.18, y + 0.03, z - 0.18, 0.36, 0.5, 0.36); }
    // steel door of the closed west block, its plate; a warning sign on the ground floor (the room is called a switch room there)
    const xd = xA - 1.05;
    F(ex, lm('steelDoor'), xd, y + 0.02, zc, 0.85, 2.05, 0.03, 'SEWU'); F(ex, DM, xd - 0.06, y, zc, 0.06, 2.13, 0.05, 'SEW'); F(ex, DM, xd + 0.85, y, zc, 0.06, 2.13, 0.05, 'SEW'); F(ex, DM, xd, y + 2.07, zc, 0.85, 0.06, 0.05, 'SD');
    F(ex, AL, xd + 0.68, y + 1.0, zc + 0.03, 0.1, 0.03, 0.05, 'SEWUD'); cex.wall(PR, uP[`plate${k}_w`], 'S', xd + 0.2, y + 2.2, zc + 0.012, 0.45, 0.154);
    if (!k) cex.wall(PR, uP.warn, 'S', xd + 0.3, y + 1.45, zc + 0.034, 0.25, 0.2);
  }

  // ================= INTERIORS (near range) =================
  const desks = [], chairs = [], fans = [], rnd = rng(item.id.length * 131 + Math.round(L * 10));
  const BAGS = [0x2f4f7f, 0x8a2f3a, 0x2f6f55, 0x3a3d45, 0xc27a2a, 0x6b4e8a, 0x1f6f8a, 0xa9a9a2], BOOKS = [0x2f5f9e, 0xb8322a, 0x3d8a55, 0xd9a520, 0xe9e2cf, 0x6b4e8a, 0x2a8a96, 0xf2f0e8];
  const pick = (list, r = rnd) => list[Math.floor(r() * list.length)];
  const shade = (hex, k) => (Math.min(255, Math.round((hex >> 16 & 255) * k)) << 16) | (Math.min(255, Math.round((hex >> 8 & 255) * k)) << 8) | Math.min(255, Math.round((hex & 255) * k));
  const SK2 = lm('skirt'), CAB = lm('cabinet'), DADOS = [['dadoA', 'trim'], ['dadoB', 'trimB'], ['dadoC', 'trimC']];
  let lesson = 0;                                                                  // which chalk board the next classroom gets
  const fan = (x, z, cy) => { const q = rnd(); fans.push([x, cy - 0.55, z, q < 0.3 ? 0 : 2.5 + q * 5, q * 6]); };   // [x, y of the hub, z, turns in rad/s, phase]
  const light = (x, z, cy, len = 1.2) => {                                         // hanging twin-tube fitting, long axis east-west
    F(fu, WH, x - len / 2, cy - 0.5, z - 0.1, len, 0.05, 0.2, 'NSEWU'); F(fu, LAMP, x - len / 2, cy - 0.51, z - 0.08, len, 0.012, 0.16, 'D');
    if (!low) for (const s of [-0.4, 0.4]) F(fu, AL, x + s * len - 0.006, cy - 0.45, z - 0.006, 0.012, 0.45, 0.012, 'NSEW');
  };
  /** What every room has: painted dado with a trim line and a skirting, ceiling beams, curtain rails, the air-conditioners' indoor units. */
  const roomShell = (r, y, k, style, acs = true) => {
    const zi = r.zi, [D, TR] = DADOS[style].map(lm), cy = ceilOf(k), xa = r.a + 0.1, xb = r.b - 0.1;
    const band = (face, x, z, w, top = 1.0) => {                                   // on a wall that looks toward `face`; (x, z): where it starts on the wall plane, w along the wall
      const ew = face === 'E' || face === 'W', put = (m, e, y0, h, more) => F(fu, m, face === 'W' ? x - e : x, y0, face === 'N' ? z - e : z, ew ? e : w, h, ew ? w : e, face + more);
      put(D, 0.008, y + 0.1, top - 0.1, ''); put(SK2, 0.014, y + 0.02, 0.08, 'U'); if (top >= 1) put(TR, 0.011, y + top, 0.035, 'UD');
    };
    band('E', xa, zi, zw - zi); band('W', xb, zi, zw - zi); band('S', xa, zi + 0.004, xb - xa, 0.88);
    let xs = xa;
    for (const [a, b, t] of [...ops.filter(o => o[0] > r.a && o[1] < r.b + 0.01), [xb, 0, 'end']]) if (t !== 'win') { if (a - xs > 0.02) band('N', xs, zw, a - xs); xs = b; }
    for (const [a, b] of r.bays) {
      if (a > r.a + 0.01) F(fu, PL, a - 0.125, cy - 0.45, zi, 0.25, 0.45, zw - zi, 'EWD');                                       // ceiling beam
      for (const xl of [a, b]) { const pa = Math.max(xl - 0.25, xa), pb = Math.min(xl + 0.25, xb); band('S', pa, zi + 0.007, pb - pa); }
      F(fu, AL, a + 0.25, y + HEAD + 0.03, zi + 0.03, b - a - 0.5, 0.025, 0.04, 'SD');                                           // curtain rail
      if (acs) { F(fu, WH, a + 0.35, y + 2.96, zi + 0.004, 0.9, 0.28, 0.2, 'SEWUD'); F(fu, DK, a + 0.4, y + 2.975, zi + 0.2, 0.8, 0.03, 0.008, 'S'); }   // split unit over the window
    }
    cfx.wall(PR, uP.switch, 'N', doorsOf(r)[0][0] + 1.12, y + 1.3, zw - 0.012, 0.09, 0.09);
  };
  const lockers = (x, y, z0, n, seed) => {                                         // a run of steel lockers against a wall that looks east
    F(fu, LB, x, y + 0.06, z0, 0.42, 1.2, n * 0.4, 'UNS'); F(fu, DK, x, y + 0.02, z0 + 0.02, 0.4, 0.04, n * 0.4 - 0.04, 'ENS');
    for (let i = 0; i < n; i++) cfu.wall(PR, uP['locker' + (i + seed) % 8], 'E', x + 0.422, y + 0.07, z0 + i * 0.4 + 0.005, 0.39, 1.18);
    hit(x + 0.02, y + 0.03, z0, 0.4, 1.23, n * 0.4);
  };
  const shelfOfBooks = (x, y, z, w, h, n, seed) => {                               // open bookcase against a wall that looks north (it stands south of the room), n shelves of books
    const WD = lm('woodDark');
    for (const xx of [x, x + w - 0.03]) F(fu, WD, xx, y + 0.02, z - 0.3, 0.03, h, 0.3, 'NEW'); F(fu, WD, x, y + h - 0.01, z - 0.3, w, 0.03, 0.3, 'NEWUD'); F(fu, DK, x + 0.03, y + 0.04, z - 0.03, w - 0.06, h - 0.05, 0.01, 'N');
    for (let i = 0; i < n; i++) { const ys = y + 0.1 + i * (h - 0.1) / n; F(fu, WD, x + 0.03, ys - 0.025, z - 0.3, w - 0.06, 0.025, 0.28, 'NUD'); const u = uP['spines' + (i + seed) % 2], f = Math.min(1, (w - 0.1) / 2.2), o = (u[2] - u[0]) * (1 - f) * ((i * 37 + seed * 11) % 10) / 10; cfu.wall(PR, [u[0] + o, u[1], u[0] + o + (u[2] - u[0]) * f, u[3]], 'N', x + 0.05, ys, z - 0.24, w - 0.1, 0.24); }
    hit(x, y + 0.03, z - 0.32, w, h, 0.3);
  };

  function classroom(r, y, k, ri) {
    const xa = r.a + 0.1, xb = r.b - 0.1, len = xb - xa, cy = ceilOf(k), zi = r.zi, depth = zw - zi, zmid = (zi + zw) / 2;
    const n = lesson++ % 13, q = rng(1000 + n * 97 + k * 13), bl = Math.min(4.2, depth - 2.6), pl = bl + (r.shallow ? 0.6 : 1.0), h = bl / 2, top = y + 0.17;
    roomShell(r, y, k, n % 3);
    // ---- front wall: chalk board with frame and tray, flag and motto over it, clock, loudspeaker, timetable, duty roster, class rules ----
    const uv = uB['board' + n];
    cfu.wall(BD, [uv[0], uv[1], uv[0] + (uv[2] - uv[0]) * bl / 4.2, uv[3]], 'W', xb - 0.03, y + 0.95, zmid - h, bl, 1.25);
    for (const yy of [y + 0.91, y + 2.2]) F(fu, AL, xb - 0.045, yy, zmid - h - 0.04, 0.045, 0.04, bl + 0.08, 'WUD');
    for (const zz of [zmid - h - 0.04, zmid + h]) F(fu, AL, xb - 0.045, y + 0.95, zz, 0.045, 1.25, 0.04, 'WNS');
    F(fu, AL, xb - 0.12, y + 0.89, zmid - h, 0.12, 0.02, bl, 'WUDNS');
    const mw = r.shallow ? 1.0 : 1.2;
    F(fu, lm('woodDark'), xb - 0.02, y + 2.36, zmid - 0.27, 0.02, 0.38, 0.54, 'WNSUD'); cfu.wall(PR, uP.flag, 'W', xb - 0.022, y + 2.39, zmid - 0.24, 0.48, 0.32);
    cfu.wall(PR, uP.motto0, 'W', xb - 0.012, y + 2.4, zmid - 0.4 - mw, mw, mw / 4); cfu.wall(PR, uP.motto1, 'W', xb - 0.012, y + 2.4, zmid + 0.4, mw, mw / 4);
    cfu.wall(PR, uP.clock, 'W', xb - 0.03, y + 2.38, zmid - 0.55 - mw - 0.36, 0.32, 0.32); F(fu, DK, xb - 0.03, y + 2.37, zmid - 0.56 - mw - 0.36, 0.03, 0.34, 0.34, 'NSUD');
    F(fu, DK, xb - 0.14, y + 2.4, zmid + 0.55 + mw, 0.14, 0.32, 0.22, 'WNSUD');                                                 // loudspeaker
    const zt = zmid + h + 0.14;
    cfu.wall(PR, uP.timetable, 'W', xb - 0.012, y + 1.3, zt, 0.36, 0.468); cfu.wall(PR, uP.duty, 'W', xb - 0.012, y + 1.3, zt + 0.44, 0.36, 0.468); cfu.wall(PR, uP.rules, 'W', xb - 0.012, y + 1.3, zmid - h - 0.56, 0.36, 0.468);
    for (const s of [-0.5, 0.5]) { F(fu, WH, xb - 0.75, cy - 0.62, zmid + s * h - 0.6, 0.14, 0.05, 1.2, 'NSEWU'); F(fu, LAMP, xb - 0.73, cy - 0.63, zmid + s * h - 0.58, 0.1, 0.012, 1.16, 'D'); }
    [[0.4, 0xf3f2ee], [0.47, 0xf3f2ee], [0.56, 0xf3e3a4], [0.63, 0xe07a6a], [-1.2, 0x9fd0ea]].forEach(([d, hex]) => ifx.box(xb - 0.09, y + 0.91, zmid + d, 0.012, 0.012, 0.06, hex)); ifx.box(xb - 0.1, y + 0.91, zmid - 0.6, 0.05, 0.035, 0.13, 0x25282b);
    // projector under the ceiling, its screen in a case over the board (pulled down in some rooms, with a slide on it)
    F(fu, AL, xb - 3.3, cy - 0.5, zmid - 0.015, 0.03, 0.5, 0.03, 'NSEW'); F(fu, WH, xb - 3.48, cy - 0.62, zmid - 0.17, 0.36, 0.12, 0.34, 'NSEWUD'); F(fu, DK, xb - 3.12, cy - 0.6, zmid - 0.05, 0.02, 0.08, 0.1, 'ENSUD');
    F(fu, WH, xb - 0.3, cy - 0.13, zmid - 1.35, 0.12, 0.11, 2.7, 'WENSD');
    if (n % 4 === 1) { F(fu, lm('screen'), xb - 0.25, y + 0.8, zmid - 1.25, 0.012, cy - 0.13 - y - 0.8, 2.5, 'W'); F(fu, DK, xb - 0.26, y + 0.77, zmid - 1.27, 0.03, 0.03, 2.54, 'WNSUD'); cfu.wall(BD, uB['slide' + (n >> 2) % 2], 'W', xb - 0.257, y + 0.95, zmid - 1.15, 2.3, 1.725); }
    // ---- platform, the teacher's desk with what lies on it, the teacher's chair ----
    F(fu, lm('platform'), xb - 1.3, y + 0.02, zmid - pl / 2, 1.3, 0.15, pl, 'UWNS'); F(fu, AL, xb - 1.3, y + 0.165, zmid - pl / 2, 0.04, 0.008, pl, 'UW');
    const zd = zmid - pl / 2 + 0.2, xd = xb - 1.2;
    F(fu, CAB, xd, top, zd, 0.56, 0.86, 1.2, 'NSEW'); F(fu, DK, xd - 0.03, top + 0.86, zd - 0.03, 0.62, 0.03, 1.26, 'NSEWUD'); hit(xd, y + 0.03, zd, 0.56, 1.1, 1.2);
    F(fu, DK, xd + 0.12, top + 0.89, zd + 0.22, 0.2, 0.012, 0.2, 'NSEWU'); F(fu, DK, xd + 0.2, top + 0.9, zd + 0.1, 0.03, 0.34, 0.46, 'NSEWU'); cfu.wall(PR, uP['screen' + n % 3], 'E', xd + 0.232, top + 0.93, zd + 0.12, 0.42, 0.27);   // monitor: its screen faces the teacher
    cfx.frame(xd + 0.42, zd + 0.33, Math.PI / 2, top + 0.893).flat(PR, uP.keys, -0.19, 0, -0.065, 0.38, 0.13); cfx.frame();
    for (let i = 0; i < 4; i++) ifx.boxc(xd + 0.3, top + 0.89 + i * 0.012, zd + 0.85, 0.19, 0.012, 0.26, pick(BOOKS, q), (q() - 0.5) * 0.4);
    ifx.box(xd + 0.08, top + 0.89, zd + 1.02, 0.1, 0.05, 0.14, 0xf3f2ee); ifx.cyl(xd + 0.46, top + 0.89, zd + 1.08, 0.04, 0.1, 0x2a6f8a);
    if (n % 2) { ifx.cyl(xd + 0.3, top + 0.89, zd + 0.62, 0.05, 0.1, 0x3a3d40); ifx.ball(xd + 0.3, top + 1.1, zd + 0.62, 0.12, 0x2f6fb5); } else pot(plantsIn, ifu, xd + 0.3, top + 0.89, zd + 0.62, 0.1);
    chairs.push([xb - 0.42, top, zd + 0.55, Math.PI]);
    // ---- back wall: cabinet air-conditioner and water dispenser in the corner, lockers, the class's chalk drawing, a slogan ----
    F(fu, WH, xa + 0.02, y + 0.02, zi + 0.12, 0.32, 1.75, 0.5, 'NSEU'); F(fu, DK, xa + 0.342, y + 1.25, zi + 0.16, 0.006, 0.4, 0.42, 'E'); F(fu, DK, xa + 0.342, y + 0.12, zi + 0.16, 0.006, 0.3, 0.42, 'E'); hit(xa + 0.02, y + 0.03, zi + 0.12, 0.32, 1.75, 0.5);
    F(fu, WH, xa + 0.03, y + 0.02, zi + 0.72, 0.3, 0.95, 0.3, 'NSEU'); ifu.cyl(xa + 0.18, y + 0.97, zi + 0.87, 0.13, 0.3, 0x9fcfe8); ifx.box(xa + 0.33, y + 0.62, zi + 0.8, 0.012, 0.1, 0.14, 0x3a3d40);
    const nl = Math.floor((zw - 1.3 - zi - 1.1) / 0.4), z0 = zi + 1.1;
    lockers(xa, y, z0, nl, n + k);
    for (let i = 0; i < 5; i++) { const zz = z0 + 0.3 + q() * (nl * 0.4 - 0.6); if (i % 2) ifx.boxc(xa + 0.2, y + 1.26, zz, 0.2, 0.03 + 0.05 * q(), 0.27, pick(BOOKS, q), q() - 0.5); else ifx.boxc(xa + 0.2, y + 1.26, zz, 0.28, 0.16 + 0.1 * q(), 0.36, [0xc9a56a, 0xe9e2cf, 0x9fb0b8][i % 3], 0); }
    const aw = r.shallow ? 2.9 : 3.6, ah = aw * 170 / 505, ya = y + 1.42;
    cfu.wall(BD, uB['art' + n % 8], 'E', xa + 0.026, ya, zmid - aw / 2, aw, ah); F(fu, AL, xa, ya - 0.04, zmid - aw / 2 - 0.04, 0.02, ah + 0.08, aw + 0.08, 'ENSUD');
    cfu.wall(PR, uP['slogan' + n % 5], 'E', xa + 0.012, ya + ah + 0.1, zmid - 1.5, 3.0, 0.3);
    // behind the back door: brooms, a mop, dustpan, bucket, bin
    const zb = zw - 0.3;
    for (let i = 0; i < 2; i++) { stick(fx, lm('door'), [xa + 0.12 + i * 0.16, y + 0.1, zb - 0.3], [xa + 0.05 + i * 0.1, y + 1.35, zb + 0.22], 0.025); ifx.boxc(xa + 0.14 + i * 0.16, y + 0.02, zb - 0.32, 0.28, 0.1, 0.05, [0xc9a56a, 0x8fbf6a][i], 0.3); }
    stick(fx, AL, [xa + 0.42, y + 0.1, zb - 0.1], [xa + 0.3, y + 1.4, zb + 0.24], 0.022); ifx.boxc(xa + 0.42, y + 0.02, zb - 0.1, 0.3, 0.06, 0.12, 0x8a8f94, 0.2);
    ifu.cyl(xa + 0.2, y + 0.02, zw - 0.75, 0.14, 0.28, 0x2f6fb5); ifu.cyl(xa + 0.24, y + 0.02, zw - 1.12, 0.16, 0.42, 0x6b7377);
    // ---- wall to the corridor: book corner between the windows with the class's notice wall over it, certificates, the pennant ----
    const wl = winsOf(r), xm = wl.length > 1 ? (wl[0][1] + wl[1][0]) / 2 : null;
    if (xm !== null) {
      shelfOfBooks(xm - 0.6, y, zw - 0.02, 1.2, 1.25, 3, n); pot(plantsIn, ifu, xm - 0.3, y + 1.27, zw - 0.18, 0.11); ifx.ball(xm + 0.3, y + 1.4, zw - 0.17, 0.11, 0x2f6fb5); ifx.cyl(xm + 0.3, y + 1.27, zw - 0.17, 0.04, 0.05, 0x3a3d40);
      cfu.wall(PR, uP.garden, 'N', xm - 0.5, y + 2.36, zw - 0.012, 1.0, 0.15);
      for (let i = 0; i < 4; i++) cfu.wall(PR, uP['drawing' + (n + i * 3) % 8], 'N', xm - 0.62 + i * 0.32, y + 1.98 - (i % 2) * 0.04, zw - 0.012, 0.29, 0.29);
      for (let i = 0; i < 3; i++) cfu.wall(PR, uP[i === 1 ? 'drawing' + (n + 5) % 8 : 'essay' + (i ? 1 : 0)], 'N', xm - 0.52 + i * 0.37, y + 1.48, zw - 0.012, i === 1 ? 0.3 : 0.29, i === 1 ? 0.3 : 0.406);
      const nc = 2 + n % 3; for (let i = 0; i < nc; i++) cfu.wall(PR, uP['cert' + (i + n) % 4], 'N', wl[0][0] + 0.15 + i * 0.42, y + 2.68, zw - 0.012, 0.36, 0.27);
    }
    if (n % 3 === 0) cfu.wall(PR, uP.pennant, 'N', r.b - 2.02, y + 1.6, zw - 0.012, 0.3, 0.433);
    // ---- ceiling: fans and lights ----
    for (const t of low ? [0.5] : [0.27, 0.73]) for (const s of [-1, 1]) fan(xa + len * t, zmid + s * depth * 0.17, cy);
    for (const t of [0.25, 0.75]) for (const d of r.shallow ? [-0.25, 0.25] : [-0.38, 0, 0.38]) light(xa + len * t, zmid + d * depth, cy);
    // ---- pupils' desks: in pairs, singly (as for an examination) or pushed together into islands; bags, books, pencil cases, bottles ----
    const seat = (x, z, rot) => {
      const cs = Math.cos(rot), sn = Math.sin(rot), at = (lx, lz) => [x + lx * cs + lz * sn, z - lx * sn + lz * cs], d = y + 0.02;
      desks.push([x, d, z, rot]);
      const pull = q() < 0.2 ? 0.1 + 0.2 * q() : 0, turn = rot + (q() < 0.25 ? (q() - 0.5) * 0.9 : (q() - 0.5) * 0.12), [cxx, czz] = at(-0.42 - pull, (q() - 0.5) * 0.06);
      chairs.push([cxx, d, czz, turn]);
      if (q() < 0.14) return;                                                      // nobody sits here: nothing on the desk
      if (q() < 0.6) {                                                             // school bag hung on the back of the chair: body, front pocket, a lighter flap
        const hex = pick(BAGS, q), bx = k2 => cxx - k2 * Math.cos(turn), bz = k2 => czz + k2 * Math.sin(turn);
        ifu.boxc(bx(0.265), d + 0.42, bz(0.265), 0.12, 0.33, 0.28, hex, turn); ifu.boxc(bx(0.345), d + 0.44, bz(0.345), 0.045, 0.17, 0.2, shade(hex, 0.72), turn); ifu.boxc(bx(0.265), d + 0.75, bz(0.265), 0.13, 0.03, 0.29, shade(hex, 1.25), turn);
      }
      if (low) return;
      const nb = q() < 0.7 ? 1 + Math.floor(q() * 2.4) : 0;
      for (let i = 0; i < nb; i++) { const [bx, bz] = at(0.02 + (q() - 0.5) * 0.06, -0.12 + (q() - 0.5) * 0.12); ifx.boxc(bx, d + 0.762 + i * 0.016, bz, 0.25, 0.016, 0.18, pick(BOOKS, q), rot + (q() - 0.5) * 0.5); }
      if (q() < 0.5) { const [px, pz] = at(0.1, 0.17); ifx.boxc(px, d + 0.762, pz, 0.07, 0.03, 0.2, pick(BAGS, q), rot + (q() - 0.5) * 0.3); }
      if (q() < 0.3) { const [wx, wz] = at(0.12, -0.24); ifx.cyl(wx, d + 0.762, wz, 0.033, 0.19, [0x9fd0ea, 0xf2c2d0, 0xd9e8c0, 0x3a3d45][Math.floor(q() * 4)]); }
    };
    const layout = n % 3, x1 = xb - 2.5, x0 = xa + 1.0;
    if (layout === 0) {                                                            // double columns
      const nc = depth >= 7.2 ? 4 : 3, nr = Math.max(1, Math.floor((x1 - x0 - 0.5) / 0.95) + 1), pitch = Math.min(0.95, (x1 - x0 - 0.5) / Math.max(1, nr - 1)), aisle = Math.min(0.75, (depth - 0.9 - nc * 1.2) / (nc - 1));
      for (let i = 0; i < nr; i++) for (let j = 0; j < nc; j++) for (const d of [0.3, 0.9]) seat(x1 - i * pitch, zmid - (nc * 1.2 + (nc - 1) * aisle) / 2 + j * (1.2 + aisle) + d, 0);
    } else if (layout === 1) {                                                     // single desks
      const nc = Math.floor((depth - 0.9) / 1.0), dz = (depth - 0.9) / nc, nr = Math.max(1, Math.floor((x1 - x0 - 0.5) / 0.95) + 1), pitch = (x1 - x0 - 0.5) / Math.max(1, nr - 1);
      for (let i = 0; i < nr; i++) for (let j = 0; j < nc; j++) seat(x1 - i * pitch, zi + 0.45 + dz * (j + 0.5), 0);
    } else {                                                                       // islands of six
      const nz = depth >= 7.2 ? 3 : 2, dz = depth / nz;
      for (let i = 0; i < 2; i++) for (let j = 0; j < nz; j++) { const cxx = x1 - 0.75 - i * ((x1 - x0 - 1.5) || 1), czz = zi + dz * (j + 0.5); for (let s = -1; s <= 1; s++) { seat(cxx + s * 0.62, czz + 0.22, Math.PI / 2); seat(cxx + s * 0.62, czz - 0.22, -Math.PI / 2); } }
    }
  }

  // swivel chair facing +x when rot is 0
  const swivel = (x, y, z, rot, hex) => {
    ifu.cyl(x, y + 0.02, z, 0.25, 0.03, 0x25282b); ifu.cyl(x, y + 0.05, z, 0.03, 0.38, 0x9a9fa4); ifu.boxc(x, y + 0.43, z, 0.46, 0.07, 0.46, hex, rot);
    ifu.boxc(x - 0.22 * Math.cos(rot), y + 0.56, z + 0.22 * Math.sin(rot), 0.06, 0.48, 0.42, hex, rot);
  };
  // tall steel cabinets against a wall (face 'W': they stand on the east wall and look west; 'E' the other way). kind: 'files' (glazed upper
  // doors with rows of files), 'glass' (an open, glazed upper part: the caller puts things on its two shelves), 'closed' (steel doors)
  const cabinets = (face, x, y, z0, n, kind = 'files') => {
    const W = face === 'W', xf = W ? x - 0.45 : x, xo = W ? x - 0.455 : x + 0.455, len = n * 0.9;
    hit(W ? x - 0.45 : x + 0.02, y + 0.03, z0, 0.43, 1.95, len);
    if (kind === 'glass') {
      F(fu, CAB, xf, y + 0.02, z0, 0.45, 1.02, len, face + 'NSU'); F(fu, CAB, W ? x - 0.03 : x, y + 1.04, z0, 0.03, 0.9, len, face); F(fu, CAB, xf, y + 1.94, z0, 0.45, 0.03, len, face + 'NSUD');
      for (const zz of [z0, z0 + len - 0.025]) F(fu, CAB, xf, y + 1.04, zz, 0.45, 0.9, 0.025, 'NS' + face); F(fu, CAB, W ? xf + 0.02 : xf, y + 1.49, z0, 0.43, 0.02, len, face + 'UD');
    } else F(fu, CAB, xf, y + 0.02, z0, 0.45, 1.95, len, face + 'NSU');
    F(fu, DK, W ? xo : xo - 0.005, y + 1.02, z0, 0.005, 0.03, len, face);
    for (let i = 0; i < n; i++) {
      const zz = z0 + i * 0.9, u = uP['spines' + i % 2], du = u[2] - u[0];
      if (i) F(fu, kind === 'glass' ? AL : DK, W ? xo : xo - 0.005, y + (kind === 'glass' ? 1.04 : 0.06), zz - 0.01, 0.005, kind === 'glass' ? 0.9 : 1.88, 0.02, face + 'NS');
      if (i && kind === 'glass') F(fu, DK, W ? xo : xo - 0.005, y + 0.06, zz - 0.004, 0.005, 0.94, 0.008, face);
      if (kind === 'files') for (let j = 0; j < 2; j++) cfu.wall(PR, [u[0] + du * 0.3 * j, u[1], u[0] + du * (0.3 * j + 0.36), u[3]], face, xo, y + 1.1 + j * 0.42, zz + 0.05, 0.8, 0.36);
      if (kind === 'glass') cfu.wall(GLC, [(i * 3 + n) % 8 + 0.1, 0.5, (i * 3 + n) % 8 + 0.9, 1.5], face, W ? x - 0.452 : x + 0.452, y + 1.05, zz + 0.02, 0.86, 0.88);
      for (const dz of [0.4, 0.48]) F(fu, AL, W ? xo - 0.015 : xo, y + 0.5, zz + dz, 0.02, 0.14, 0.02, face + 'NSUD');
      if (kind === 'closed') for (const dz of [0.4, 0.48]) F(fu, AL, W ? xo - 0.015 : xo, y + 1.4, zz + dz, 0.02, 0.14, 0.02, face + 'NSUD');
    }
  };

  function office(r, y, k, ri) {                                                   // teachers' room: desks in a cluster between screens, cabinets of files, a white board, printer, water
    const xa = r.a + 0.1, xb = r.b - 0.1, len = xb - xa, cy = ceilOf(k), zi = r.zi, depth = zw - zi, q = rng(500 + k * 31 + ri * 7), TOPM = lm('deskTop'), FAB = lm('fabric');
    roomShell(r, y, k, (k + ri) % 3);
    const nrow = depth > 7 ? 3 : 2, xm = (xa + xb) / 2 - 0.05, z0 = zi + (depth > 7 ? 1.5 : 1.2), zl2 = nrow * 1.3, seat = [0x2b2d30, 0x2f4f7f, 0x5a2f2f][(k + ri) % 3];
    F(fu, FAB, xm - 0.03, y + 0.02, z0 - 0.03, 0.06, 1.2, zl2 + 0.06, 'NSEW'); F(fu, AL, xm - 0.035, y + 1.22, z0 - 0.035, 0.07, 0.02, zl2 + 0.07, 'NSEWU');
    for (let i = 0; i <= nrow; i++) { F(fu, FAB, xm - 0.72, y + 0.02, z0 + i * 1.3 - 0.02, 1.44, 1.2, 0.04, 'NSEW'); F(fu, AL, xm - 0.725, y + 1.22, z0 + i * 1.3 - 0.025, 1.45, 0.02, 0.05, 'NSEWU'); }
    hit(xm - 0.72, y + 0.03, z0 - 0.02, 1.44, 1.2, zl2 + 0.04);
    for (let i = 0; i < nrow; i++) for (const s of [-1, 1]) {                       // s < 0: the desk west of the spine, its teacher looks east
      const zd = z0 + i * 1.3 + 0.04, xd = s < 0 ? xm - 0.7 : xm + 0.04, mx = s < 0 ? xd + 0.5 : xd + 0.13, zm = zd + 0.2 + q() * 0.2;
      F(fu, TOPM, xd, y + 0.73, zd, 0.66, 0.03, 1.22, s < 0 ? 'NSWUD' : 'NSEUD');
      F(fu, CAB, s < 0 ? xd + 0.02 : xd + 0.22, y + 0.08, zd + 0.78, 0.42, 0.65, 0.42, 'NSEW');
      for (let d = 1; d < 3; d++) F(fu, DK, s < 0 ? xd + 0.016 : xd + 0.64, y + 0.08 + d * 0.215, zd + 0.8, 0.004, 0.008, 0.38, s < 0 ? 'W' : 'E');
      F(fu, DK, mx, y + 0.86, zm, 0.03, 0.3, 0.46, 'NSEWU'); F(fu, DK, mx - 0.04, y + 0.76, zm + 0.15, 0.11, 0.1, 0.16, 'NSEWU');
      cfu.wall(PR, uP['screen' + Math.floor(q() * 3)], s < 0 ? 'W' : 'E', s < 0 ? mx - 0.002 : mx + 0.032, y + 0.88, zm + 0.02, 0.42, 0.26);
      cfx.frame(s < 0 ? xd + 0.26 : xd + 0.4, zm + 0.23, s < 0 ? -Math.PI / 2 : Math.PI / 2, y + 0.763).flat(PR, uP.keys, -0.19, 0, -0.065, 0.38, 0.13); cfx.frame();
      if (!low) {
        const px = s < 0 ? xd + 0.2 : xd + 0.46;
        for (let pi = 0; pi < 2; pi++) if (q() < 0.8) { const nb = 3 + Math.floor(q() * 10), col = pick(BOOKS, q), zz = zd + 0.86 + pi * 0.24; for (let b = 0; b < nb; b++) ifx.boxc(px + (q() - 0.5) * 0.02, y + 0.762 + b * 0.014, zz + (q() - 0.5) * 0.02, 0.26, 0.014, 0.19, q() < 0.75 ? col : pick(BOOKS, q), (q() - 0.5) * 0.12); }
        ifx.cyl(s < 0 ? xd + 0.52 : xd + 0.14, y + 0.762, zd + 0.94, 0.04, 0.1, [0xd9e8f0, 0xe8a23a, 0x3a3d45, 0xc8322a][Math.floor(q() * 4)]); ifx.cyl(s < 0 ? xd + 0.1 : xd + 0.56, y + 0.762, zd + 0.12, 0.035, 0.11, 0x3a3d45);
      }
      if (q() < 0.5) pot(plantsIn, ifu, s < 0 ? xd + 0.54 : xd + 0.12, y + 0.762, zd + 0.1, 0.09);
      swivel(s < 0 ? xd - 0.32 : xd + 0.98, y, zd + 0.5 + (q() - 0.5) * 0.3, (s < 0 ? 0 : Math.PI) + (q() - 0.5) * 0.9, seat);
    }
    // files in tall cabinets on the east wall; boxes and a trophy on top
    const nc = Math.floor((depth - (r.niche ? 3.4 : 2.4)) / 0.9); cabinets('W', xb, y, zi + 0.9, nc);
    for (let i = 0; i < nc; i++) if (q() < 0.7) ifx.boxc(xb - 0.24, y + 1.97, zi + 1.35 + i * 0.9, 0.3, 0.2 + 0.1 * q(), 0.4, [0xc9a56a, 0xe9e2cf, 0x7a8f9a][i % 3], (q() - 0.5) * 0.2);
    // west wall: white board with the week's work, calendar, clock, certificates; a low cabinet with a printer, the water dispenser by the door
    const zb = z0 + zl2 / 2;
    F(fu, AL, xa, y + 1.12, zb - 0.84, 0.014, 1.04, 1.68, 'ENSUD'); cfu.wall(BD, uB.whiteboard, 'E', xa + 0.016, y + 1.16, zb - 0.8, 1.6, 0.96); F(fu, AL, xa, y + 1.1, zb - 0.7, 0.07, 0.015, 1.4, 'ENSUD');
    cfu.wall(PR, uP.calendar, 'E', xa + 0.012, y + 1.35, zb + 1.0, 0.3, 0.4); cfu.wall(PR, uP.clock, 'E', xa + 0.03, y + 2.3, zb - 0.16, 0.32, 0.32); F(fu, DK, xa, y + 2.29, zb - 0.17, 0.03, 0.34, 0.34, 'NSUD');
    for (let i = 0; i < 2 + (k + ri) % 2; i++) cfu.wall(PR, uP['cert' + (i + k) % 4], 'E', xa + 0.012, y + 2.3, zb - 1.05 + (i > 1 ? 1.75 : i * 0.42), 0.36, 0.27);
    F(fu, CAB, xa + 0.02, y + 0.02, zw - 2.4, 0.42, 0.8, 1.2, 'NSEU'); hit(xa + 0.02, y + 0.03, zw - 2.4, 0.42, 0.8, 1.2);
    for (const dz of [0.4, 0.8]) F(fu, DK, xa + 0.44, y + 0.06, zw - 2.4 + dz, 0.004, 0.72, 0.006, 'E');
    F(fu, lm('pvc'), xa + 0.06, y + 0.82, zw - 2.25, 0.36, 0.22, 0.46, 'NSEWU'); F(fu, DK, xa + 0.08, y + 1.04, zw - 2.23, 0.32, 0.03, 0.42, 'NSEWU'); ifx.boxc(xa + 0.24, y + 0.82, zw - 1.5, 0.22, 0.05, 0.3, 0xf3f2ee, 0.1);
    F(fu, WH, xa + 0.03, y + 0.02, zw - 1.05, 0.3, 0.95, 0.3, 'NSEU'); ifu.cyl(xa + 0.18, y + 0.97, zw - 0.9, 0.13, 0.3, 0x9fcfe8);
    pot(plantsIn, ifu, xb - 0.4, y + 0.02, zi + 0.42, 0.3, 0xd9d6ca); pot(plantsIn, ifu, xa + 0.3, y + 0.82, zw - 1.4, 0.1);
    for (const s of [-1, 1]) { fan(xa + len / 2, (zi + zw) / 2 + s * depth * 0.2, cy); for (const d of [-0.3, 0.3]) light(xa + len * (s < 0 ? 0.3 : 0.72), (zi + zw) / 2 + d * depth, cy, 1.0); }
  }

  function lab(r, y, k, ri) {                                                      // laboratory: chemistry on the ground floor, biology above it
    const xa = r.a + 0.1, xb = r.b - 0.1, len = xb - xa, cy = ceilOf(k), zi = r.zi, depth = zw - zi, zmid = (zi + zw) / 2, BB = lm('benchBody'), BT = lm('benchTop'), bio = k % 2 === 1, q = rng(700 + k * 17);
    const bl = Math.min(4.2, depth - 2.6), h = bl / 2, uv = uB['board' + (13 + k % 2)], top = y + 0.17;
    roomShell(r, y, k, bio ? 0 : 1);
    cfu.wall(BD, [uv[0], uv[1], uv[0] + (uv[2] - uv[0]) * bl / 4.2, uv[3]], 'W', xb - 0.03, y + 0.95, zmid - h, bl, 1.25);
    for (const yy of [y + 0.91, y + 2.2]) F(fu, AL, xb - 0.045, yy, zmid - h - 0.04, 0.045, 0.04, bl + 0.08, 'WUD');
    for (const zz of [zmid - h - 0.04, zmid + h]) F(fu, AL, xb - 0.045, y + 0.95, zz, 0.045, 1.25, 0.04, 'WNS');
    F(fu, AL, xb - 0.12, y + 0.89, zmid - h, 0.12, 0.02, bl, 'WUDNS');
    cfu.wall(PR, uP.clock, 'W', xb - 0.03, y + 2.4, zmid - 0.16, 0.32, 0.32); F(fu, DK, xb - 0.03, y + 2.39, zmid - 0.17, 0.03, 0.34, 0.34, 'NSUD');
    for (const s of [-0.5, 0.5]) { F(fu, WH, xb - 0.75, cy - 0.62, zmid + s * h - 0.6, 0.14, 0.05, 1.2, 'NSEWU'); F(fu, LAMP, xb - 0.73, cy - 0.63, zmid + s * h - 0.58, 0.1, 0.012, 1.16, 'D'); }
    F(fu, lm('platform'), xb - 1.5, y + 0.02, zmid - bl / 2 - 0.3, 1.5, 0.15, bl + 0.6, 'UWNS');
    const bottles = (x, yy, z, n, dz, tall) => { for (let i = 0; i < n; i++) { const hex = bio ? [0xd9cf9a, 0xe6dcc0, 0xcfe0d0][i % 3] : [0x6b3f22, 0xf0f0ea, 0x6b3f22, 0x2f5f9e][Math.floor(q() * 4)], hh = tall * (0.8 + 0.4 * q()); ifx.cyl(x, yy, z + i * dz, 0.032, hh, hex); ifx.cyl(x, yy + hh, z + i * dz, 0.018, 0.025, 0x25282b); } };
    const glassware = (x, yy, z) => {                                              // two beakers, a flask, a rack of test tubes, a burner
      ifx.ware(x, yy, z, 0.045, 0.1); ifx.cyl(x, yy, z, 0.04, 0.04, 0x9fd0ea); ifx.ware(x + 0.13, yy, z + 0.05, 0.035, 0.08); ifx.ware(x + 0.03, yy, z + 0.2, 0.05, 0.07); ifx.ware(x + 0.03, yy + 0.07, z + 0.2, 0.016, 0.08);
      ifx.box(x - 0.02, yy, z + 0.34, 0.22, 0.07, 0.07, 0xc9a56a); for (let i = 0; i < 5; i++) ifx.ware(x + 0.01 + i * 0.04, yy + 0.03, z + 0.375, 0.011, 0.13, i % 2 ? 0xf2c2d0 : 0xdfeef0);
      ifx.cyl(x + 0.16, yy, z + 0.22, 0.035, 0.05, 0xb9bec2); ifx.cyl(x + 0.16, yy + 0.05, z + 0.22, 0.012, 0.03, 0x3a3d45);
    };
    const scope = (x, yy, z) => { ifx.box(x - 0.07, yy, z - 0.09, 0.14, 0.03, 0.18, 0x25282b); ifx.box(x - 0.06, yy + 0.03, z - 0.02, 0.04, 0.24, 0.05, 0xe9e7df); ifx.box(x - 0.05, yy + 0.12, z - 0.07, 0.11, 0.012, 0.11, 0x3a3d45); ifx.cyl(x + 0.02, yy + 0.17, z, 0.02, 0.15, 0x25282b); };
    const bench = (x, z0, lz, y0, south) => {                                      // runs north-south; the sink sits at its north or south end
      F(fu, BB, x + 0.03, y0 + 0.1, z0 + 0.03, 0.54, 0.68, lz - 0.06, 'NSEW'); F(fu, DK, x + 0.06, y0, z0 + 0.06, 0.48, 0.1, lz - 0.12, 'NSEW'); F(fu, BT, x - 0.01, y0 + 0.78, z0 - 0.01, 0.62, 0.04, lz + 0.02, 'NSEWUD');
      for (let zz = z0 + 0.6; zz < z0 + lz - 0.3; zz += 0.6) for (const xx of [x + 0.028, x + 0.568]) F(fu, DK, xx, y0 + 0.14, zz, 0.004, 0.6, 0.008, 'EW');
      const zk = south ? z0 + lz - 0.5 : z0 + 0.14, yt = y0 + 0.82;
      F(fu, AL, x + 0.12, yt, zk, 0.36, 0.006, 0.36, 'U'); F(fu, DK, x + 0.16, yt + 0.003, zk + 0.04, 0.28, 0.006, 0.28, 'U');
      stick(fx, AL, [x + 0.5, yt, zk + 0.18], [x + 0.5, yt + 0.28, zk + 0.18], 0.022); stick(fx, AL, [x + 0.5, yt + 0.28, zk + 0.18], [x + 0.36, yt + 0.24, zk + 0.18], 0.02);   // swan-neck tap
      const zg = south ? zk - 0.25 : zk + 0.6; ifx.box(x + 0.27, yt, zg, 0.06, 0.1, 0.06, 0xe0b020); ifx.box(x + 0.2, yt + 0.06, zg + 0.02, 0.07, 0.02, 0.02, 0xb9bec2);   // gas tap
      hit(x, y0 + 0.02, z0, 0.6, 0.86, lz);
      return [south ? z0 + 0.15 : zk + 0.75, south ? zk - 0.4 : z0 + lz - 0.15];  // the free stretch of the top
    };
    const [d0, d1] = bench(xb - 1.2, zmid - 1.2, 2.4, top, true);                  // the teacher's bench on the platform
    if (bio) { ifu.ball(xb - 0.9, top + 1.2, d0 + 0.2, 0.11, 0xe9d9c0, 1.2); ifu.cyl(xb - 0.9, top + 0.82, d0 + 0.2, 0.05, 0.28, 0xe9d9c0); ifu.box(xb - 1.0, top + 0.82, d0 + 0.5, 0.2, 0.34, 0.12, 0xd98a7a); scope(xb - 0.9, top + 0.82, d0 + 1.0); }
    else { glassware(xb - 1.05, top + 0.82, d0 + 0.1); bottles(xb - 0.75, top + 0.82, d0 + 0.75, 5, 0.1, 0.16); for (const [dx, dy, dz, hex] of [[0, 0, 0, 0x3a3d45], [0.1, 0.05, 0, 0xd0281f], [-0.1, 0.05, 0, 0xf3f2ee], [0, 0.05, 0.1, 0xf3f2ee], [0, 0.05, -0.1, 0xf3f2ee]]) ifx.ball(xb - 0.95 + dx, top + 0.92 + dy, d1 - 0.2 + dz, dx || dz || dy ? 0.035 : 0.05, hex); }
    const lz = (depth - 1.9) / 2, nr = Math.max(1, Math.floor((len - 4.4) / 1.5) + 1), ns = Math.max(1, Math.floor((lz - 0.5) / 0.6));
    for (let i = 0; i < nr; i++) for (const s of [-1, 1]) {
      const x = xb - 3.2 - i * 1.5, z0 = s < 0 ? zmid - 0.45 - lz : zmid + 0.45, [fa, fb] = bench(x, z0, lz, y + 0.02, s < 0), yt = y + 0.84;
      for (let j = 0; j < ns; j++) { const sz = s < 0 ? z0 + 0.3 + j * 0.6 : z0 + lz - 0.3 - j * 0.6; ifu.cyl(x - 0.3 - 0.1 * q(), y + 0.45, sz + (q() - 0.5) * 0.1, 0.15, 0.03, 0x8a5a34); ifu.cyl(x - 0.3, y + 0.02, sz, 0.025, 0.43, 0xb9bec2); }
      if (low) continue;
      if (bio) { for (let zz = fa + 0.15; zz < fb - 0.1; zz += 0.6) scope(x + 0.2, yt, zz); ifx.box(x + 0.36, yt, (fa + fb) / 2 - 0.1, 0.18, 0.02, 0.26, 0xf3f2ee); }
      else { glassware(x + 0.1, yt, fa + 0.05); bottles(x + 0.46, yt, fa + 0.1, 4, 0.09, 0.14); if (fb - fa > 1.0) glassware(x + 0.12, yt, fa + 0.62); }
    }
    // back wall: fume cupboard in the corner (chemistry) or a skeleton on a stand (biology), glazed cabinets of glassware and models
    if (bio) {
      const sx = xa + 0.45, sz = zi + 0.6, B = 0xece4cf;
      ifu.cyl(sx, y + 0.02, sz, 0.22, 0.04, 0x3a3d45); ifu.cyl(sx + 0.12, y + 0.06, sz, 0.015, 1.75, 0xb9bec2);
      ifu.ball(sx, y + 1.62, sz, 0.1, B, 1.15); ifu.cyl(sx, y + 0.98, sz, 0.02, 0.52, B); for (let i = 0; i < 5; i++) ifu.boxc(sx, y + 1.22 + i * 0.05, sz, 0.17, 0.018, 0.3 - i * 0.02, B, 0);
      ifu.boxc(sx, y + 1.46, sz, 0.05, 0.03, 0.38, B, 0); ifu.boxc(sx, y + 0.92, sz, 0.14, 0.09, 0.3, B, 0);
      for (const d of [-1, 1]) { ifu.cyl(sx, y + 0.86, sz + d * 0.2, 0.014, 0.6, B); ifu.cyl(sx, y + 0.5, sz + d * 0.1, 0.02, 0.44, B); ifu.cyl(sx, y + 0.08, sz + d * 0.1, 0.017, 0.42, B); ifu.boxc(sx + 0.05, y + 0.06, sz + d * 0.1, 0.16, 0.03, 0.06, B, 0); }
    } else {
      const fx0 = xa + 0.02, fz = zi + 0.3;
      F(fu, CAB, fx0, y + 0.02, fz, 0.75, 0.85, 1.2, 'NSEU'); F(fu, BT, fx0, y + 0.87, fz, 0.76, 0.03, 1.2, 'NSEU'); F(fu, CAB, fx0, y + 1.75, fz, 0.75, 0.6, 1.2, 'NSED'); F(fu, CAB, fx0, y + 0.9, fz, 0.04, 0.85, 1.2, 'E');
      for (const zz of [fz, fz + 1.16]) F(fu, CAB, fx0, y + 0.9, zz, 0.75, 0.85, 0.04, 'NSE'); F(fu, AL, fx0 + 0.72, y + 1.3, fz + 0.04, 0.03, 0.05, 1.12, 'EUD');
      cfu.wall(GLC, [5.1, 1.0, 5.9, 1.9], 'E', fx0 + 0.74, y + 1.35, fz + 0.04, 1.12, 0.4); F(fu, AL, fx0 + 0.25, y + 2.35, fz + 0.4, 0.3, cy - y - 2.35, 0.3, 'NSEW');
      ifx.ware(fx0 + 0.4, y + 0.9, fz + 0.4, 0.05, 0.12); ifx.ware(fx0 + 0.35, y + 0.9, fz + 0.8, 0.04, 0.16, 0xf2c2d0); hit(fx0, y + 0.03, fz, 0.75, 2.3, 1.2);
      for (const [dy, hex] of [[1.7, 0xc8322a], [1.6, 0x2a8a3c]]) ifx.box(fx0 + 0.752, y + dy, fz + 0.1, 0.02, 0.06, 0.06, hex);
    }
    const c0 = zi + 1.7, ncab = Math.floor((zw - 1.3 - c0) / 0.9); cabinets('E', xa, y, c0, ncab, 'glass');
    for (let i = 0; i < ncab; i++) for (let j = 0; j < 2; j++) for (let b = 0; b < 5; b++) {   // on its shelves: flasks and bottles, or models and boxes
      const zz = c0 + i * 0.9 + 0.14 + b * 0.155, ys = y + (j ? 1.51 : 1.04);
      if (bio) ifx.box(xa + 0.2, ys, zz - 0.05, 0.14, 0.1 + 0.2 * q(), 0.1, [0xd9cf9a, 0xc98f7a, 0xe9e2cf, 0x8fbf6a][Math.floor(q() * 4)]); else if (q() < 0.5) ifx.ware(xa + 0.26, ys, zz, 0.045, 0.1 + 0.16 * q()); else ifx.cyl(xa + 0.26, ys, zz, 0.04, 0.1 + 0.14 * q(), [0x6b3f22, 0xf0f0ea, 0x2f5f9e][Math.floor(q() * 3)]);
    }
    // on the wall to the corridor: the big chart between the windows, rules by the back door, coats on hooks, first aid, an extinguisher by the front door
    const wl = winsOf(r), xm = wl.length > 1 ? (wl[0][1] + wl[1][0]) / 2 : xa + len / 2;
    if (bio) cfu.wall(BD, uB.cell, 'N', xm - 0.62, y + 1.4, zw - 0.012, 1.24, 0.9); else cfu.wall(BD, uB.periodic, 'N', xm - 0.66, y + 1.4, zw - 0.012, 1.32, 0.88);
    cfu.wall(BD, bio ? uB.bones : uB.rules, 'N', r.a + 1.66, y + 1.4, zw - 0.012, 0.4, 0.56); cfu.wall(PR, uP.aid, 'N', r.b - 2.04, y + 1.5, zw - 0.03, 0.3, 0.3); F(fu, WH, r.b - 2.05, y + 1.49, zw - 0.09, 0.32, 0.32, 0.06, 'EWUD');
    for (let i = 0; i < 4; i++) { F(fu, WH, xa + 0.014, y + 0.85 + (i % 2) * 0.03, zw - 0.95 + i * 0.2, 0.05, 0.85, 0.16, 'ENS'); ifx.box(xa + 0.01, y + 1.72, zw - 0.9 + i * 0.2, 0.04, 0.03, 0.03, 0x9a9fa4); }
    ifu.cyl(xb - 0.25, y + 0.02, zw - 0.2, 0.07, 0.45, 0xb8322a); ifu.cyl(xb - 0.25, y + 0.47, zw - 0.2, 0.025, 0.1, 0x25282b);
    for (const t of low ? [0.5] : [0.27, 0.73]) fan(xa + len * t, zmid, cy);
    for (const t of [0.25, 0.75]) for (const d of [-0.25, 0.25]) light(xa + len * t, zmid + d * depth, cy);
  }

  function prep(r, y, k, ri) {                                                     // preparation room: racks of bottles and boxes, closed cabinets, a work table, sink, trolley, refrigerator, coats
    const xa = r.a + 0.1, xb = r.b - 0.1, cy = ceilOf(k), zi = r.zi, depth = zw - zi, zmid = (zi + zw) / 2, xm = (xa + xb) / 2, bio = k % 2 === 1, q = rng(900 + k * 11), SB2 = lm('steelBox');
    roomShell(r, y, k, bio ? 0 : 1, false);
    const sl = depth - (r.niche ? 2.3 : 1.6), zs = zi + 0.7;                       // steel rack on the east wall: five shelves
    for (const zz of [zs, zs + sl / 2 - 0.015, zs + sl - 0.03]) for (const xx of [xb - 0.42, xb - 0.05]) F(fu, SB2, xx, y + 0.02, zz, 0.03, 1.95, 0.03, 'NSEW');
    hit(xb - 0.43, y + 0.03, zs, 0.41, 1.95, sl);
    for (let i = 0; i < 5; i++) {
      const ys = y + 0.14 + i * 0.44; F(fu, SB2, xb - 0.42, ys, zs, 0.4, 0.025, sl, 'UDW');
      if (i === 0 || low) { for (let j = 0; j < 3; j++) ifx.box(xb - 0.38, ys + 0.025, zs + 0.15 + j * (sl - 0.5) / 2.4, 0.3, 0.22 + 0.08 * q(), 0.42, [0xc9a56a, 0xb9905a, 0xe9e2cf][j % 3]); continue; }
      for (let zz = zs + 0.1; zz < zs + sl - 0.1; zz += 0.105) {
        if (q() < 0.12) { zz += 0.2; ifx.box(xb - 0.36, ys + 0.025, zz - 0.2, 0.26, 0.14 + 0.1 * q(), 0.26, [0xe9e2cf, 0x7a8f9a, 0xc9a56a][Math.floor(q() * 3)]); continue; }
        const hh = 0.12 + 0.12 * q(), hex = bio ? [0xd9cf9a, 0xe6dcc0, 0xcfe0d0, 0xc9b08a][Math.floor(q() * 4)] : [0x6b3f22, 0x6b3f22, 0xf0f0ea, 0x2f5f9e, 0x4a7a4a][Math.floor(q() * 5)];
        ifx.cyl(xb - 0.33, ys + 0.025, zz, 0.042, hh, hex); ifx.cyl(xb - 0.33, ys + 0.025 + hh, zz, 0.024, 0.03, bio ? 0x3a3d45 : 0xb8322a); if (q() < 0.4) ifx.cyl(xb - 0.2, ys + 0.025, zz + 0.05, 0.042, hh * 1.1, hex);
      }
    }
    // west wall: closed cabinets, the yellow cabinet for dangerous chemicals (chemistry) or cases of microscopes (biology), a refrigerator by the door
    const nc = Math.max(1, Math.floor((depth - 3.3) / 0.9)); cabinets('E', xa, y, zi + 0.7, nc, 'closed');
    const zy = zi + 0.7 + nc * 0.9 + 0.1;
    if (bio) { for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) ifu.box(xa + 0.04, y + 0.02 + i * 0.36, zy + j * 0.4, 0.36, 0.34, 0.36, [0xb98452, 0xa87442][(i + j) % 2]); hit(xa + 0.03, y + 0.03, zy, 0.38, 1.06, 0.76); }
    else { F(fu, lm('yellow'), xa + 0.02, y + 0.02, zy, 0.5, 1.65, 0.8, 'NSEU'); F(fu, DK, xa + 0.522, y + 0.06, zy + 0.398, 0.004, 1.56, 0.006, 'E'); cfu.wall(PR, uP.warn, 'E', xa + 0.524, y + 1.1, zy + 0.25, 0.3, 0.24); hit(xa + 0.02, y + 0.03, zy, 0.5, 1.65, 0.8); }
    F(fu, WH, xa + 0.02, y + 0.02, zw - 0.75, 0.56, 1.7, 0.6, 'NSEU'); F(fu, DK, xa + 0.582, y + 1.1, zw - 0.75, 0.004, 0.012, 0.6, 'E'); F(fu, AL, xa + 0.585, y + 0.7, zw - 0.7, 0.02, 0.3, 0.025, 'ENSUD'); hit(xa + 0.02, y + 0.03, zw - 0.75, 0.56, 1.7, 0.6);
    for (let i = 0; i < 3; i++) { F(fu, WH, xa + 0.014, y + 0.85, zw - 1.75 + i * 0.22, 0.05, 0.85, 0.17, 'ENS'); ifx.box(xa + 0.01, y + 1.72, zw - 1.7 + i * 0.22, 0.04, 0.03, 0.03, 0x9a9fa4); }
    // work table with a balance, trays and glass; a stool; a trolley
    F(fu, lm('deskTop'), xm - 0.45, y + 0.76, zmid - 0.9, 0.9, 0.035, 1.8, 'NSEWUD'); for (const dx of [-0.4, 0.37]) for (const d of [-0.85, 0.82]) F(fu, lm('deskSteel'), xm + dx, y + 0.02, zmid + d, 0.03, 0.74, 0.03, 'NSEW');
    hit(xm - 0.45, y + 0.03, zmid - 0.9, 0.9, 0.78, 1.8);
    ifx.box(xm - 0.3, y + 0.795, zmid - 0.75, 0.24, 0.07, 0.3, 0xe9e7df); ifx.cyl(xm - 0.18, y + 0.865, zmid - 0.6, 0.09, 0.012, 0xb9bec2); ifx.box(xm + 0.05, y + 0.795, zmid - 0.2, 0.34, 0.03, 0.46, 0x7a8f9a);
    for (let i = 0; i < 6; i++) ifx.ware(xm + 0.1 + (i % 2) * 0.12, y + 0.825, zmid - 0.14 + Math.floor(i / 2) * 0.13, 0.04, 0.09 + 0.03 * (i % 3));
    ifx.box(xm - 0.32, y + 0.795, zmid + 0.35, 0.22, 0.1, 0.3, 0xa9c8e0); ifx.boxc(xm + 0.2, y + 0.795, zmid + 0.6, 0.2, 0.02, 0.28, 0xf3f2ee, 0.3);
    ifu.cyl(xm + 0.75, y + 0.45, zmid + 0.3, 0.15, 0.03, 0x8a5a34); ifu.cyl(xm + 0.75, y + 0.02, zmid + 0.3, 0.025, 0.43, 0xb9bec2);
    const tx = xm - 0.2, tz = zw - (r.niche ? 1.2 : 0.9);
    for (const yy of [0.25, 0.8]) F(fu, SB2, tx, y + yy, tz, 0.8, 0.025, 0.45, 'NSEWUD'); for (const dx of [0, 0.77]) for (const dz of [0, 0.42]) F(fu, SB2, tx + dx, y + 0.06, tz + dz, 0.03, 0.82, 0.03, 'NSEW');
    for (let i = 0; i < 5; i++) ifx.ware(tx + 0.12 + i * 0.14, y + 0.825, tz + 0.15 + (i % 2) * 0.12, 0.045, 0.1 + 0.04 * (i % 2)); ifx.box(tx + 0.1, y + 0.275, tz + 0.08, 0.5, 0.18, 0.3, 0xc9a56a);
    // sink unit under the window
    F(fu, SB2, xm - 0.6, y + 0.02, zi + 0.03, 1.2, 0.85, 0.55, 'SEWU'); F(fu, DK, xm - 0.45, y + 0.872, zi + 0.12, 0.5, 0.004, 0.36, 'U'); stick(fx, AL, [xm + 0.15, y + 0.87, zi + 0.16], [xm + 0.15, y + 1.15, zi + 0.16], 0.022); stick(fx, AL, [xm + 0.15, y + 1.15, zi + 0.16], [xm + 0.15, y + 1.1, zi + 0.32], 0.02);
    fan(xm, zmid, cy); for (const d of [-0.25, 0.25]) light(xm, zmid + d * depth, cy, 1.0);
  }

  const ROOM = { class: classroom, office, lab, prep };
  for (let k = 0; k < FLOORS; k++) rooms.forEach((r, ri) => ROOM[kindOf(r, k)](r, k * FH, k, ri));

  // ================= STAIRCASE (fittings tier: it shows through the open stair hall) =================
  // terrazzo treads with dark nosings (a yellow line on the first and last step of a flight), soffit slabs, stringers,
  // steel balusters under a timber handrail, a steel rail on the wall, a painted dado that follows the flights
  const TR = lm('tread'), NO = lm('nosing'), YE = lm('yellow'), HR = lm('woodDark');
  for (let k = 0; k < FLOORS; k++) {                                               // dado on the walls of the hall at floor level
    const y = k * FH;
    F(ex, DA, xs1 - 0.008, y + 0.02, zl, 0.008, 1.03, zS - 0.12 - zl, 'W'); F(ex, TRIM, xs1 - 0.011, y + 1.05, zl, 0.011, 0.035, zS - 0.12 - zl, 'WUD'); F(ex, SK, xs1 - 0.014, y + 0.02, zl, 0.014, 0.09, zS - 0.12 - zl, 'WU');
    F(ex, DA, xs0, y + 0.02, zl, 0.008, 1.03, zc - zl, 'E'); F(ex, TRIM, xs0, y + 1.05, zl, 0.011, 0.035, zc - zl, 'EUD');
  }
  for (let k = 0; k < FLOORS - 1; k++) {
    const y = k * FH, ym = y + FH / 2, y1 = y + FH;
    for (let i = 0; i < STEPS; i++) {
      F(ex, TR, xa1, y + i * RISE, zl - (i + 1) * GO, FLIGHT, RISE, GO, 'USW'); F(ex, TR, xs0, ym + i * RISE, zh + i * GO, FLIGHT, RISE, GO, 'UNE');
      F(ex, NO, xa1, y + (i + 1) * RISE - 0.008, zl - i * GO - 0.04, FLIGHT, 0.012, 0.055, 'US'); F(ex, NO, xs0, ym + (i + 1) * RISE - 0.008, zh + i * GO - 0.015, FLIGHT, 0.012, 0.055, 'UN');
      if (i === 0 || i === STEPS - 1) { F(ex, YE, xa1, y + (i + 1) * RISE - 0.006, zl - i * GO - 0.1, FLIGHT, 0.012, 0.05, 'U'); F(ex, YE, xs0, ym + (i + 1) * RISE - 0.006, zh + i * GO + 0.05, FLIGHT, 0.012, 0.05, 'U'); }
      if (!low || i % 2 === 0) {
        F(ex, RAIL, xa1 - 0.03, y + (i + 0.5) * RISE + 0.2, zl - (i + 0.5) * GO - 0.01, 0.02, RISE + 0.66, 0.02, 'NSEW');
        F(ex, RAIL, xb1 + 0.01, ym + (i + 0.5) * RISE + 0.2, zh + (i + 0.5) * GO - 0.01, 0.02, RISE + 0.66, 0.02, 'NSEW');
      }
    }
    for (const [xa, xb, zA, yA, zB, yB, well, wall] of [[xa1, xa2, zl, y, zh, ym, [xa1 - 0.035, xa1], [xa2 - 0.1, xa2 - 0.06]], [xs0, xb1, zh, ym, zl, y1, [xb1, xb1 + 0.035], [xs0 + 0.06, xs0 + 0.1]]]) {
      const east = xa === xa1;
      incl(ex, CE, xa, xb, zA, yA, zB, yB, 0.14, 'DEW');                                                                         // soffit slab
      incl(ex, WH, well[0], well[1], zA, yA + 0.23, zB, yB + 0.23, 0.37, 'EWUDNS');                                              // stringer on the well side
      incl(ex, HR, well[0] - 0.012, well[1] + 0.012, zA, yA + RISE + 0.92, zB, yB + RISE + 0.92, 0.06, 'EWUDNS');                // timber handrail on the balusters
      incl(ex, RAIL, wall[0], wall[1], zA, yA + RISE + 0.9, zB, yB + RISE + 0.9, 0.04, 'EWUDNS');                                // steel rail on the wall
      for (const t of [0.15, 0.5, 0.85]) F(ex, RAIL, east ? xa2 - 0.06 : xs0, yA + (yB - yA) * t + RISE + 0.83, zA + (zB - zA) * t - 0.01, 0.06, 0.02, 0.02, 'NSUD');   // its brackets
      incl(ex, DA, east ? xa2 - 0.008 : xs0, east ? xa2 : xs0 + 0.008, zA, yA + 1.12, zB, yB + 1.12, 1.0, east ? 'W' : 'E');     // painted dado along the flight
      incl(ex, TRIM, east ? xa2 - 0.011 : xs0, east ? xa2 : xs0 + 0.011, zA, yA + 1.16, zB, yB + 1.16, 0.035, east ? 'WUD' : 'EUD');
    }
    // half landing: dado and skirting on its three walls, the rail turning round the well, a lamp under it, signs over the flights
    F(ex, DA, xs0, ym + 0.02, zsn, xs1 - xs0, 0.9, 0.008, 'S'); F(ex, DA, xs1 - 0.008, ym + 0.02, zsn, 0.008, 1.03, zh - zsn, 'W'); F(ex, DA, xs0, ym + 0.02, zsn, 0.008, 1.03, zh - zsn, 'E');
    F(ex, SK, xs0, ym + 0.02, zsn, xs1 - xs0, 0.09, 0.014, 'SU');
    F(ex, HR, xb1 - 0.012, ym + RISE + 0.86, zh - 0.06, 0.224, 0.06, 0.06, 'NSUDEW'); F(ex, HR, xb1 - 0.012, y1 + RISE + 0.86, zl, 0.224, 0.06, 0.06, 'NSUDEW');
    for (const xx of [xb1 + 0.005, xa1 - 0.03]) F(ex, RAIL, xx, y1, zl + 0.012, 0.024, 1.0, 0.024, 'NSEW');
    if (k === 0) F(ex, RAIL, xa1 - 0.04, 0, zl, 0.045, 1.1, 0.045, 'NSEWU');                                                     // newel post at the foot
    F(ex, WH, (xs0 + xa2) / 2 - 0.62, ym - 0.22, (zsn + zh) / 2 - 0.07, 1.24, 0.07, 0.14, 'NSEW'); F(ex, LAMP, (xs0 + xa2) / 2 - 0.6, ym - 0.245, (zsn + zh) / 2 - 0.04, 1.2, 0.025, 0.08, 'NSEWD');
    cex.wall(PR, uP.keepright, 'W', xs1 - 0.012, y + FH / 4 + 1.85, (zl + zh) / 2 - 0.6, 1.2, 0.267);
    cex.wall(PR, uP.norun, 'E', xs0 + 0.012, y + FH * 3 / 4 + 1.85, (zl + zh) / 2 - 0.6, 1.2, 0.267);
    cex.wall(PR, uP['floor' + (k + 2)], 'S', xs0 + 0.08, ym + 1.5, zsn + 0.012, 0.42, 0.42);                                     // the next storey's number beside the landing window
  }
  F(ex, HR, xb1, yT4 + 1.07, zl - 0.09, xa2 - xb1, 0.05, 0.06, 'NSUD');                                                          // rail on the top-floor guard
  // under the first flight: a mop sink and a bucket (cleaners' corner)
  F(ex, lm('white'), xa1 + 0.3, 0.02, zh + 0.2, 0.6, 0.45, 0.5, 'SEWU'); F(ex, DK, xa1 + 0.36, 0.472, zh + 0.26, 0.48, 0.004, 0.38, 'U'); iex.cyl(xa1 + 0.25, 0.02, zh + 1.0, 0.15, 0.28, 0xc8322a);

  // ================= assemble =================
  const cx = p.ox + L / 2, cz = p.oz + p.D / 2, M = new THREE.Matrix4(), Q = new THREE.Quaternion(), V = new THREE.Vector3(), ONE = new THREE.Vector3(1, 1, 1);
  const shell = mergeFlat(v.build({ name: item.id + '-visual' }), true); shell.add(cv.build(item.id + '-visual-cards', p.ox, p.oz)); ctx.add(shell);
  const tier = (batch, cards, inst, name, range) => {
    const g = mergeFlat(batch.build({ name: item.id + name, castShadow: false }), false); g.add(cards.build(item.id + name + '-cards', p.ox, p.oz)); inst.build(g, p.ox, p.oz, item.id + name);
    ctx.detail(ctx.add(g), cx, cz, range); return g;
  };
  const exG = tier(ex, cex, iex, '-fittings', L / 2 + (low ? 70 : 100)), fuG = tier(fu, cfu, ifu, '-interior', L / 2 + (low ? 34 : 44)); tier(fx, cfx, ifx, '-fine', L / 2 + (low ? 14 : 20));
  // desks and chairs: one instanced mesh each
  for (const [key, list] of [['desk', desks], ['chair', chairs]]) if (list.length) {
    const part = furnitureSet(key, low), im = new THREE.InstancedMesh(part.geometry, part.material, list.length); im.name = item.id + '-' + key + 's'; im.receiveShadow = true;
    list.forEach((q, i) => im.setMatrixAt(i, M.compose(V.set(p.ox + q[0], q[1], p.oz + q[2]), Q.setFromAxisAngle(UP, q[3] || 0), ONE)));
    im.computeBoundingSphere(); fuG.add(im);
  }
  // ceiling fans: one instanced mesh; most of them turn
  if (fans.length) {
    const fb = new Batch(), FN = lm('fan');
    fb.box(FN, 0, 0.275, 0, 0.024, 0.55, 0.024, 'UD'); fb.cyl(FN, 0, -0.12, 0, 0.1, 0.12, 8); for (let i = 0; i < 3; i++) { fb.frame(0, 0, i * 2.0944); fb.box(FN, 0.42, -0.05, 0, 0.62, 0.012, 0.13, 'EW'); }
    const part = mergeFlat(fb.build({ castShadow: false }), false).children[0], im = new THREE.InstancedMesh(part.geometry, part.material, fans.length); im.name = item.id + '-fans';
    const turn = t => { fans.forEach((f, i) => im.setMatrixAt(i, M.makeRotationY(f[4] + t * f[3]).setPosition(p.ox + f[0], f[1], p.oz + f[2]))); im.instanceMatrix.needsUpdate = true; };
    turn(0); im.computeBoundingSphere(); fuG.add(im);
    if (ctx.animate) ctx.animate((dt, t) => { if (fuG.visible) turn(t); });
  }
  // potted plants and planter shrubs: leafy balls on their soil
  const leafy = (list, group, seed) => {
    if (!list.length) return;
    const im = shrubs(list.map(([x, , z, r]) => [p.ox + x, p.oz + z, r]), { seed }), S = new THREE.Vector3();
    list.forEach(([, y], i) => { im.getMatrixAt(i, M); M.decompose(V, Q, S); V.y = y + 0.16 * S.x; im.setMatrixAt(i, M.compose(V, Q, S)); });
    im.castShadow = false; im.frustumCulled = true; im.computeBoundingSphere(); group.add(im);
  };
  leafy(plantsOut, exG, 31); leafy(plantsIn, fuG, 37);
  const cg = ctx.add(c.build({ name: item.id + '-colliders' })); cg.visible = false;

  // stair ramps (collision only): one inclined plate per flight, so the capsule walks up smoothly
  const ramps = new THREE.Group(); ramps.position.set(p.ox, 0, p.oz); ramps.visible = false; ctx.add(ramps);
  const rlen = Math.hypot(run, FH / 2), rang = Math.atan2(FH / 2, run);
  for (let k = 0; k < FLOORS - 1; k++) for (const flight of ['A', 'B']) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(FLIGHT, 0.2, rlen));
    m.position.set(flight === 'A' ? xa1 + FLIGHT / 2 : xs0 + FLIGHT / 2, k * FH + (flight === 'A' ? FH / 4 : FH * 3 / 4) - 0.1 * Math.cos(rang), zl - run / 2);
    m.rotation.x = flight === 'A' ? rang : -rang;        // a positive turn about +X lowers the south end: A rises toward north, B toward south
    ramps.add(m);
  }
  cg.traverse(o => { if (o.isMesh) ctx.collide(o); });
  ramps.children.forEach(m => ctx.collide(m));

  // after dusk the lights are on: ceilings, walls and the corridor glow a little and the panes shine warm, so the rooms read as lit from outside
  if (ctx.animate) {
    let last = -1;
    GLN.emissive.setHex(0xffd9a0); GLC.emissive.setHex(0xffecc8); GLN.emissiveIntensity = GLC.emissiveIntensity = 0;
    ctx.animate((dt, t, env) => {
      const n = env && env.lighting && env.lighting.night ? env.lighting.night() : 0, cam = env && env.camera ? env.camera.position : null;
      const inside = cam && cam.x > p.ox && cam.x < p.ox + L && cam.z > p.oz && cam.z < p.oz + p.D && cam.y < H ? 1 : 0, key = n + inside * 2; if (Math.abs(key - last) < 0.01) return; last = key;
      PL.emissiveIntensity = 0.05 + 0.26 * n; CE.emissiveIntensity = 0.14 + 0.36 * n; CO.emissiveIntensity = 0.04 + 0.24 * n;
      GLN.emissiveIntensity = n * (inside ? 0.1 : 0.7); GLC.emissiveIntensity = n * (inside ? 0.15 : 2.2);
    });
  }
}

// The east teaching slabs (teaching-slab.js) draw their boards, posters and plates with the same hand, and share these two
// sheets (so that no second copy of them is uploaded): built here once, from this building's plan.
export function sharedSheets(low, campus) {
  if (SHEETS) return SHEETS;
  const it = campus && campus.items.find(i => i.style === 'teaching-slab-wide');
  return it ? sheets(low, plan(it, campus)) : null;
}
export { Atlas, Cards, paintBoard, paintArt, paintPoster, paintPlate, paintSheet, paintSlogan, paintFloor, paintCert, paintClock, paintExit, LESSONS, ART, POSTERS, SLOGANS };
