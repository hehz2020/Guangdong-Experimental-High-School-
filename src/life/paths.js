// Where people walk: a small network of paths of the campus, its galleries and the pavements outside the gate, laid by
// hand over the paving, roads and corridors that the grounds and the builders draw (landscape.js ROADS, gate.js, the
// teaching slabs' south galleries). Each path is a polyline with a half-width people spread over and a floor height;
// paths meet at shared end points. Places where people appear or vanish (doors, the far ends of the pavements) are named
// nodes. The lines were checked against the collision geometry and the tree trunks by a script (see people.js); if a
// building or a path in the grounds is moved, the lines here may need moving too. Nothing here is measured or known
// about how people really move on this campus.
import { ROAD_LINES } from '../world/extras/landscape.js';
import { plan as widePlan } from '../world/builders/slab-wide.js';
import { plan as blockPlan } from '../world/builders/slab-block.js';

const FH = 3.9;                                          // storey height of the teaching slabs (teaching-slab.js, slab-wide.js)

/** A path moved sideways by d (positive: to the left of the direction of travel on a north-up map, as landscape.js). */
export function offsetLine(points, d) {
  return points.map((p, i) => {
    const a = points[Math.max(0, i - 1)], b = points[Math.min(points.length - 1, i + 1)];
    const d1 = i > 0 ? [p[0] - a[0], p[1] - a[1]] : [b[0] - p[0], b[1] - p[1]], d2 = i < points.length - 1 ? [b[0] - p[0], b[1] - p[1]] : d1;
    const n1 = Math.hypot(...d1) || 1, n2 = Math.hypot(...d2) || 1;
    let nx = -d1[1] / n1 - d2[1] / n2, nz = d1[0] / n1 + d2[0] / n2; const nn = Math.hypot(nx, nz) || 1; nx /= nn; nz /= nn;
    const k = Math.min(2, 1 / Math.max(0.2, nx * (-d1[1] / n1) + nz * (d1[0] / n1)));
    return [p[0] + nx * d * k, p[1] + nz * d * k];
  });
}
const arc = (cx, cz, r, a0, a1, n) => Array.from({ length: n + 1 }, (_, i) => { const a = (a0 + (a1 - a0) * i / n) * Math.PI / 180; return [cx + r * Math.cos(a), cz + r * Math.sin(a)]; });

/**
 * The network. Returns { lines: [{ id, pts, w, y, kind }], ends: { name: [x, z, y] } }.
 * kind: 'walk' (paths and pavements), 'gallery' (a building's open corridor), 'lane' (a campus road people share with bicycles).
 */
export function network(campus) {
  const L = [], E = {};
  const add = (id, pts, w = 1.2, y = 0, kind = 'walk') => { L.push({ id, pts: pts.map(p => [+p[0].toFixed(2), +p[1].toFixed(2)]), w, y, kind }); };
  const item = id => campus.items.find(i => i.id === id);
  const road = id => ROAD_LINES.find(r => r.id === id);

  // ---- outside the gate: the pavement on the campus side of the canal road, the forecourt, the gate, the pool ring
  const rn = road('road-canal-north'), rs = road('road-canal-south');
  const GATE = [247.0, -24.2], CONES = [252.6, -24.2];
  if (rn) {
    const pv = offsetLine(rn.points, rn.width / 2 + 1.75).filter(p => p[1] < -60 && p[1] > -226);
    add('canal-north', [...pv, [266.6, -59.5], [264.3, -55], [258.6, -43], [256.4, -30]], 0.35);
    E['canal-north-end'] = [...pv[0], 0];
  }
  if (rs) {
    const pv = offsetLine(rs.points, rs.width / 2 + 1.75).filter(p => p[1] > 24).reverse();
    add('canal-south', [...pv, [265.6, 22], [262.5, 14], [257.8, 2], [256.4, -14]], 0.35);
    E['canal-south-end'] = [...pv[0], 0];
  }
  add('forecourt-n', [[256.4, -30], CONES], 1.0);
  add('forecourt-s', [[256.4, -14], [255.2, -19.5], CONES], 1.0);
  add('gate', [CONES, GATE, [241.5, -24.2], [234.3, -23.8]], 1.6);
  E.gate = [...CONES, 0];
  // ring round the pool (centre 220, -20; walking line 14.8 m out, between the flower terrace and the benches), in four arcs
  const P0 = [220, -20], R = 14.8;
  add('ring-ne', arc(...P0, R, -15, -90, 6), 0.8);
  add('ring-nw', arc(...P0, R, -90, -180, 6), 0.8);
  add('ring-sw', arc(...P0, R, 180, 90, 6), 0.8);
  add('ring-se', [...arc(...P0, R, 90, 15, 6), ...arc(...P0, R, 15, -15, 2).slice(1)], 0.8);
  add('pool-north', [[220, -34.8], [220, -46], [221.6, -51], [221.6, -58], [220, -61.2]], 0.8);
  add('pool-south', [[220, -5.2], [220, 6], [220, 17], [220, 22.1]], 1.3);
  add('avenue-head', [[205.2, -20], [201.8, -22.3], [197.2, -22.3], [192, -20]], 0.8);          // round a palm on the axis
  add('avenue', [[192, -20], [170, -20], [150, -20], [141.2, -20]], 3.4);
  E['gym-east'] = [141.2, -20, 0];

  // ---- the teaching slabs: strip south of slab-south, its ground gallery, the plaza east of the canopy, the courtyard
  const sS = item('slab-south'), sN = item('slab-north');
  add('strip-s', [[244.5, -61.2], [232, -61.2], [220, -61.2]], 1.4);
  add('strip-w', [[220, -61.2], [212, -61.2], [199.5, -61.2]], 1.4);
  if (sS && sS.mainBar) {
    const b = sS.mainBar, zc = b.s - 0.3 - 1.3;
    for (let k = 0; k < 5; k++) add('gallery-s' + k, [[b.w + 9.2, zc], [b.e - 2.2, zc]], 0.55, k * FH + 0.02, 'gallery');
    add('into-s1', [[217.6, -61.2], [217.6, zc]], 0.45); add('into-s2', [[238, -61.2], [238, zc]], 0.45);
    E['stair-s'] = [b.w + 2.3, zc, 0];
    add('stair-s', [[b.w + 9.2, zc], [b.w + 2.3, zc]], 0.4);
  }
  add('plaza-east', [[199.5, -61.2], [200.8, -64], [201.2, -67.2], [200.1, -69.6], [200.1, -72.5], [200.2, -78.5], [197.9, -82.5], [197.9, -87.2], [198, -89.7]], 0.35);
  add('court-w', [[198, -89.7], [201.2, -90.2], [201.6, -93], [201.8, -96.5], [204.4, -99.2], [214, -99.9]], 0.35);
  add('courtyard', [[214, -99.9], [230.6, -99.9], [244, -99.9]], 1.0);
  if (sN && sN.mainBar) {
    const b = sN.mainBar, zc = b.s - 0.3 - 1.3;
    for (let k = 0; k < 5; k++) add('gallery-n' + k, [[b.w + 9.2, zc], [b.e - 2.2, zc]], 0.55, k * FH + 0.02, 'gallery');
    add('into-n1', [[230.6, -99.9], [230.6, zc]], 0.45); add('into-n2', [[239.5, -99.9], [239.5, zc]], 0.45);
    E['stair-n'] = [b.w + 2.3, zc, 0];
    add('stair-n', [[b.w + 9.2, zc], [b.w + 2.3, zc]], 0.4);
  }
  // ---- the canopy plaza and the arc building's forecourt
  add('canopy-e', [[198, -89.7], [187.5, -89.7], [187.5, -109]], 0.7);
  add('canopy-s', [[187.5, -89.7], [170, -89.7], [158.6, -89.7]], 1.5);
  add('canopy-n', [[187.5, -109], [170, -109], [158.6, -109]], 1.5);
  add('canopy-w', [[158.6, -78.6], [158.6, -89.7], [158.6, -109]], 0.9);
  add('canopy-mid', [[170, -89.7], [170, -109]], 1.5);
  add('canopy-sw', [[146, -62.8], [145.6, -72], [147.2, -78.6], [158.6, -78.6]], 0.8);
  add('arc-front', [[170, -109], [170.8, -114], [171, -122], [171.5, -136], [172.5, -146.6]], 2.0);
  E['arc-door'] = [172.5, -146.6, 0];
  add('arc-sw', [[171.5, -136], [150, -136], [130, -130], [114, -120], [100, -106], [88, -92]], 1.6);
  add('arc-se', [[171.5, -136], [184, -137.4], [192, -138.2], [200, -139], [215, -141.2], [226, -140.5], [232, -137], [238, -135.5], [243, -131]], 0.6);
  add('arc-west', [[88, -92], [72, -99], [62, -105.5], [48.4, -110]], 1.0);

  // ---- the west teaching slab: its ground gallery and the strip south of it
  const sW = item('teaching-slab-west');
  if (sW) {
    const p = widePlan(sW, campus), zs = Math.max(...sW.points.map(q => q[1])), xw = p.ox, xe = p.ox + p.L, zc = p.oz + (p.zc + p.zS - 0.12) / 2;
    add('strip-west', [[xw + 2, zs + 5], [(xw + xe) / 2, zs + 5], [146, zs + 5]], 1.4);
    add('west-to-lane', [[xw + 2, zs + 5], [82, -63], [74, -68.5], [66, -70.4], [48.4, -70.4]], 0.6);
    for (let k = 0; k < 5; k++) add('gallery-w' + k, [[p.ox + p.X0 + 1, zc], [p.ox + p.xs0 - 0.6, zc]], 0.45, k * p.FH + 0.02, 'gallery');
    E['stair-w'] = [p.ox + (p.xs0 + p.xs1) / 2, zc, 0];
    add('stair-w', [[p.ox + p.xs0 - 0.6, zc], E['stair-w'].slice(0, 2)], 0.4);
    add('into-w', [[(xw + xe) / 2, zs + 5], [(xw + xe) / 2, zc]], 0.6);
  }

  // ---- the campus lanes: between the track and the gymnasium, south of the courts
  const lt = road('road-track-east'), lc = road('road-south-of-courts');
  if (lt) { const x = lt.points[0][0]; add('lane-track', [[x - 1.6, lt.points[0][1] + 2], [x - 1.6, -60], [x - 1.6, 0], [x - 1.6, 45], [x - 1.6, lt.points[1][1] - 1]], 0.7, 0, 'lane'); E['lane-north'] = [x - 1.6, lt.points[0][1] + 2, 0]; }
  if (lc) { const z = lc.points[0][1]; add('lane-courts', [[lc.points[0][0] - 1.6, z + 0.2], [70, z + 0.2], [91, z + 0.2], [110, z + 0.2], [lc.points[1][0] - 1, z + 0.2]], 0.8, 0, 'lane'); }

  // ---- the long blocks (dormitories) south-east: courtyard strips and the two connecting walks
  add('dorm-north', [[141, 22.1], [180, 22.1], [220, 22.1], [239.5, 22.1]], 0.5);
  add('dorm-mid', [[140.6, 69.8], [180, 69.8], [236, 69.8]], 0.5);
  add('dorm-b-yard', [[148, 91.2], [180, 91.2], [214, 91.2]], 1.2);
  add('dorm-west', [[141, 22.1], [133.4, 22.3], [133, 30], [133, 45.8], [133, 69.8], [133, 85.4]], 0.45);
  add('dorm-mid-w', [[133, 69.8], [140.6, 69.8]], 0.5);
  add('dorm-b-w', [[133, 85.4], [140, 91.2], [148, 91.2]], 0.6);
  add('dorm-east', [[239.5, 22.1], [239.8, 39.4], [240.6, 50], [236, 69.8]], 0.6);
  add('court-gate-w', [[48.4, 45], [53, 45.8], [56.6, 47.6], [60, 50]], 0.5);
  add('court-gate-e', [[133, 45.8], [128.5, 45.8], [124, 49]], 0.5);
  add('court-gate-s', [[91, 72], [91, 78.4], [91, 85.4]], 0.7);
  E['court-w'] = [60, 50, 0]; E['court-e'] = [124, 49, 0]; E['court-s'] = [91, 72, 0];
  add('lane-to-dorms', [[129.9, 85.4], [133, 85.4]], 0.6);

  // dormitory doors: the glazed common room (or the lobby) on the street face of each long block, joined to the nearest walk
  for (const it of campus.items.filter(i => i.style === 'slab-block' && i.points)) {
    let pl; try { pl = blockPlan(it, campus); } catch (e) { continue; }
    const sec = pl.sections.find(q => q.kind === 'lobby') || pl.sections.find(q => q.kind === 'common'); if (!sec) continue;
    const xm = (sec.x0 + sec.x1) / 2, door = pl.toWorld(xm, -2.3);            // in front of the steps and the canopy
    let best = null, bd = 16;
    for (const l of L) if (/^dorm/.test(l.id)) for (let i = 0; i < l.pts.length - 1; i++) {
      const a = l.pts[i], b = l.pts[i + 1], dx = b[0] - a[0], dz = b[1] - a[1], t = Math.max(0, Math.min(1, ((door[0] - a[0]) * dx + (door[1] - a[1]) * dz) / (dx * dx + dz * dz || 1)));
      const q = [a[0] + dx * t, a[1] + dz * t], d = Math.hypot(q[0] - door[0], q[1] - door[1]); if (d < bd) { bd = d; best = q; }
    }
    if (!best) continue;
    const id = 'door-' + it.id; add(id, [best, door], 0.4); E[id] = [door[0], door[1], 0];
  }
  // onto the field, across the east straight of the track (for the morning exercises and PE)
  for (const [k, z] of [['n', -30], ['c', 0], ['s', 30]]) { add('to-field-' + k, [[48.4, z], [36, z], [20, z]], 0.8); E['field-' + k] = [20, z, 0]; }
  // round the east end of the arc building to the door of the new building (the library)
  add('to-library', [[243, -131], [246.5, -142.6], [253.5, -149], [254.5, -158], [247, -169], [234, -178.5], [227.5, -185.5], [221, -188], [212, -188], [204, -187.3], [198, -186.2]], 0.3);
  E.library = [198, -186.2, 0];                                                           // at the foot of the library's south steps
  // ---- to the dining hall south of the courts (a front of glass on the north face of a low block; see context.js)
  add('to-hall', [[48.4, 85.3], [53.3, 98], [54.3, 110], [53.1, 121], [53, 126.5], [49, 140], [42.5, 152], [40.6, 157.2]], 0.35);
  E.hall = [40.6, 158.2, 0];
  return { lines: L, ends: E };
}

/**
 * Joins the lines into a graph: a line's end that lies on another line splits that line there; ends closer than 0.6 m
 * (on the same floor) are one node. Returns { nodes: [{ x, z, y, edges: [edge index] }], edges: [{ a, b, pts, y, w, kind, len, id }] }.
 */
export function graph(net) {
  const lines = net.lines.map(l => ({ ...l, pts: l.pts.map(p => p.slice()) }));
  const near = (p, q, y1, y2) => Math.hypot(p[0] - q[0], p[1] - q[1]) < 0.6 && Math.abs(y1 - y2) < 0.5;
  // 1. insert other lines' ends into segments they touch
  for (const A of lines) for (const end of [A.pts[0], A.pts[A.pts.length - 1]]) for (const L of lines) {
    if (L === A || Math.abs(L.y - A.y) > 0.5) continue;
    for (let i = 0; i < L.pts.length - 1; i++) {
      const a = L.pts[i], b = L.pts[i + 1], dx = b[0] - a[0], dz = b[1] - a[1], len2 = dx * dx + dz * dz || 1;
      const t = ((end[0] - a[0]) * dx + (end[1] - a[1]) * dz) / len2; if (t <= 0 || t >= 1) continue;
      const px = a[0] + dx * t, pz = a[1] + dz * t;
      if (Math.hypot(end[0] - px, end[1] - pz) < 0.4 && Math.hypot(px - a[0], pz - a[1]) > 0.6 && Math.hypot(px - b[0], pz - b[1]) > 0.6) { L.pts.splice(i + 1, 0, [end[0], end[1]]); break; }
    }
  }
  // 2. nodes at the ends
  const nodes = [], nodeAt = (p, y) => { for (let i = 0; i < nodes.length; i++) if (near(p, [nodes[i].x, nodes[i].z], y, nodes[i].y)) return i; nodes.push({ x: p[0], z: p[1], y, edges: [] }); return nodes.length - 1; };
  for (const L of lines) { nodeAt(L.pts[0], L.y); nodeAt(L.pts[L.pts.length - 1], L.y); }
  // 3. split every line at vertices that are nodes
  const edges = [];
  for (const L of lines) {
    let start = 0;
    for (let i = 1; i < L.pts.length; i++) {
      const isNode = i === L.pts.length - 1 || nodes.some(n => near(L.pts[i], [n.x, n.z], L.y, n.y));
      if (!isNode) continue;
      const pts = L.pts.slice(start, i + 1), a = nodeAt(pts[0], L.y), b = nodeAt(pts[pts.length - 1], L.y);
      pts[0] = [nodes[a].x, nodes[a].z]; pts[pts.length - 1] = [nodes[b].x, nodes[b].z];
      let len = 0; for (let k = 1; k < pts.length; k++) len += Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1]);
      if (a !== b && len > 0.05) { const e = edges.length; edges.push({ a, b, pts, y: L.y, w: L.w, kind: L.kind, len, id: L.id }); nodes[a].edges.push(e); nodes[b].edges.push(e); }
      start = i;
    }
  }
  return { nodes, edges };
}

/** Shortest route between two nodes: a list of [edge index, forward?], or null. */
export function route(G, from, to) {
  const n = G.nodes.length, dist = new Float64Array(n).fill(Infinity), prev = new Int32Array(n).fill(-1), done = new Uint8Array(n);
  dist[from] = 0;
  for (;;) {
    let u = -1, best = Infinity; for (let i = 0; i < n; i++) if (!done[i] && dist[i] < best) { best = dist[i]; u = i; }
    if (u < 0 || u === to) break; done[u] = 1;
    for (const e of G.nodes[u].edges) { const E = G.edges[e], v = E.a === u ? E.b : E.a, d = dist[u] + E.len; if (d < dist[v]) { dist[v] = d; prev[v] = e; } }
  }
  if (!Number.isFinite(dist[to])) return null;
  const out = []; for (let v = to; v !== from;) { const e = prev[v], E = G.edges[e]; out.push([e, E.b === v]); v = E.a === v ? E.b : E.a; }
  return out.reverse();
}
/** Nearest node to a point (on a floor). */
export function nearestNode(G, x, z, y = 0) { let best = -1, d = Infinity; G.nodes.forEach((q, i) => { if (Math.abs(q.y - y) > 0.5) return; const k = Math.hypot(q.x - x, q.z - z); if (k < d) { d = k; best = i; } }); return best; }
