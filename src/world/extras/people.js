// People on the campus: students, teachers and staff walking the paths, standing about in groups, sitting on benches,
// at desks in some classrooms, in the library and the dining hall, running on the track, playing basketball, doing the
// morning exercises; a guard at the gate, a cleaner, a gardener. They follow a school day driven by the page's time
// (src/life/day.js).
//
// ALL IMAGINED. No person, face, uniform, timetable or habit here stands for a real one: the uniform (a white polo,
// navy trousers or a navy pleated skirt, see src/life/dress.js) and the sports kit are invented and carry no crest
// or lettering; the numbers of people, where they go and when are guesses at what a large senior high school looks
// like on a weekday.
// Nothing comes from photographs, motion capture or downloaded models: bodies, clothes and every movement are computed
// here (src/life/body.js, rig.js, anim.js).
//
// How it is drawn (src/life/crowd.js): instanced bodies in three levels of detail skinned in the vertex shader from a
// float texture of bone matrices; in safe mode stock skinned meshes for the nearest people and one mesh skinned on the
// CPU for the others. People cast no shadow of their own (the shadow maps are redrawn only now and then; a moving shadow
// would freeze) but get a soft contact shadow stretched away from the sun. They have no collision and do not block the
// walker; walkers step aside for the viewer and nobody is set down within a couple of metres of a place in the menu.
//
// Where people walk: src/life/paths.js, a network of paths laid over the paving, roads and galleries and checked against
// the collision geometry. Seats: desks, chairs and library chairs are found by name among the builders' instanced meshes
// (teaching-slab.js, slab-wide.js, new-building.js, seating.js); benches are listed here from the furniture modules.
import { timed } from '../../life/timing.js';
import * as THREE from 'three';
import { createCrowd } from '../../life/crowd.js';
import { network, graph, nearestNode } from '../../life/paths.js';
import { Population, person, contactShadows, pickRole } from '../../life/sim.js';
import { createSport } from '../../life/sport.js';
import { stateAt } from '../../life/day.js';
import { rng } from '../../life/dress.js';
import { DROPS } from '../../life/signal.js';

const TAU = Math.PI * 2;
// Benches set down by street.js through landscape.js and builders (world x, z, heading of the seat's front in radians:
// it faces (sin a, cos a)), read once from a run of the page; plus the gate's backless benches round the pool and the
// benches on the courts' divider band. If the grounds are re-laid these few may stand a little off.
const BENCHES = [[156.8, -110.75, 0], [160.2, -110.75, 0], [183.1, -110.75, 0], [156.8, -75.05, Math.PI], [160.2, -75.05, Math.PI], [179.7, -75.05, Math.PI], [183.1, -75.05, Math.PI],
  [190.65, -85.6, Math.PI / 2], [195.05, -91.6, 0], [193.85, -101.4, Math.PI], [165.09, -169.4, 3.2247], [182.03, -170.81, 3.2247], [187.01, -171.23, 3.2247], [211.93, -173.3, 3.2247],
  [157.35, -71.45, 0], [161.55, -71.45, 0], [161.55, -59.05, Math.PI], [178.35, -71.45, 0], [178.35, -59.05, Math.PI], [34.75, 111.58, 1.0472], [32.27, 114.05, 0.5236], [23.05, 111.57, -1.0472],
  [55.6, -104, -Math.PI / 2], [55.6, -86, -Math.PI / 2], [55.6, -68, -Math.PI / 2], [72, 81.3, 0], [98, 81.3, 0], [118, 81.3, 0], [46.43, -125.14, 0], [117.14, -93.75, 0], [140.82, -90.93, 0],
  [137.88, 92.01, 0], [165.95, -119.06, Math.PI / 2], [176.73, 62.55, Math.PI], [197.27, 66.28, Math.PI / 2], [233.11, -88.49, 4.7124], [261.72, -87.23, 4.7124]];
// the gate's benches: backless, on the ring round the pool (gate.js); people face the water
for (const a of [0.42, 1.0, 2.14, 2.72]) BENCHES.push([220 - 16.3 * Math.sin(a), -20 + 16.3 * Math.cos(a), Math.atan2(Math.sin(a), -Math.cos(a)), 'gate']);
// spots where a few people stand and talk (open paving, clear of the paths)
const GROUP_SPOTS = [[164, -99.5], [179, -99.5], [164, -82], [179, -82.5], [229, -65.2], [245, -65.6], [160, -128], [186, -129], [201, -133.5], [222, -92], [236, -90.5], [160, 62], [205, 61],
  [241, -14.5], [243, -33.5], [200, -30], [104, -62], [120, -63.5], [182, -64.5], [168, 18.5], [150, 98], [192, 97.5], [61, -96], [53, -40], [53, 20], [86, 88.6], [112, 88.6], [212, -186.5]];

/** Menu places (ui.js, gate.js, context.js and this module): nobody is set down near them. */
function menuPlaces(campus) {
  const box = id => { const it = campus.items.find(i => i.id === id); if (!it || !it.points) return null; const xs = it.points.map(p => p[0]), zs = it.points.map(p => p[1]); return { w: Math.min(...xs), e: Math.max(...xs), n: Math.min(...zs), s: Math.max(...zs) }; };
  const out = [[campus.track.cx, campus.track.cz], [267.5, -19.4], [235.5, -14.5], [204, -22], [18.4, 90], [195.9, -196.9], [203.4, -209.4], [198.9, -178.9], [30, 18], [38, 150]];
  const seat = box('grandstand-seating'); if (seat) out.push([seat.e + 34, (seat.n + seat.s) / 2]);
  const gym = box('gym-main'); if (gym) out.push([gym.w - 14, (gym.n + gym.s) / 2], [gym.w + 26, (gym.n + gym.s) / 2]);
  if (campus.courts) { const k = campus.courts.block; out.push([(k.w + k.e) / 2, (k.n + k.s) / 2]); }
  const can = box('plaza-canopy'), tw = box('clock-tower');
  if (can) out.push([(can.w + can.e) / 2, can.s - 8], [(can.w + can.e) / 2 - 5, can.n - 8]);
  if (tw) out.push([(tw.w + tw.e) / 2 - 4, (tw.n + tw.s) / 2 + 18]);
  const sn = campus.items.find(i => i.id === 'slab-north'); if (sn && sn.mainBar) { const b = sn.mainBar; out.push([b.w + 14, b.s - 1.7], [b.w + 6.2, b.n + 4.8]); }
  return out;
}

/** Seats found among the builders' instanced furniture: { name: [{ x, y, z, yaw, h, room, mesh }] }. */
function findSeats(root) {
  const out = { desks: [], chairs: [], library: [], stand: [] }, seen = new Set(), m = new THREE.Matrix4(), e = m.elements;
  root.updateMatrixWorld(true);
  root.traverse(o => {
    if (!o.isInstancedMesh) return;
    let kind = null;
    if (/^slab-(north|south)-desks$/.test(o.name)) kind = 'desks';
    else if (o.name === 'teaching-slab-west-chairs') kind = 'chairs';
    else if (/-library-tub-body$/.test(o.name)) kind = 'library';
    else if (/^grandstand-seating-seats$/.test(o.name)) kind = 'stand';
    if (!kind || seen.has(o.name)) return; seen.add(o.name);
    for (let i = 0; i < o.count; i++) {
      o.getMatrixAt(i, m); m.premultiply(o.matrixWorld);
      const sx = Math.hypot(e[0], e[1], e[2]) || 1;
      out[kind].push({ x: e[12], y: e[13], z: e[14], fx: e[0] / sx, fz: e[2] / sx, k: sx, mesh: o });
    }
  });
  return out;
}
/** Groups desks into rooms: same floor, gaps of more than 3 m along x. */
function rooms(list) {
  const by = new Map();
  for (const d of list) { const key = Math.round(d.y * 2) + '|' + Math.round(d.z / 40); if (!by.has(key)) by.set(key, []); by.get(key).push(d); }
  const out = [];
  for (const l of by.values()) { l.sort((a, b) => a.x - b.x); let cur = [l[0]]; for (let i = 1; i < l.length; i++) { if (l[i].x - l[i - 1].x > 3) { out.push(cur); cur = []; } cur.push(l[i]); } out.push(cur); }
  return out.filter(r => r.length > 8);
}
const visibleChain = o => { for (let q = o; q; q = q.parent) if (!q.visible) return false; return true; };

export function build(ctx) {
  const low = !!ctx.lowPower, safe = !!ctx.safe, campus = ctx.campus;
  const caps = low ? [6, 24, 60, 16] : [10, 40, 124, 40];        // near, middle, far; stand-ins in the occlusion pass (crowd.js)
  const crowd = createCrowd({ safe, caps }); ctx.add(crowd.group);
  const shadows = contactShadows(caps[0] + caps[1]); ctx.add(shadows.mesh);
  const net = network(campus), G = graph(net), node = name => (net.ends[name] ? nearestNode(G, net.ends[name][0], net.ends[name][1], net.ends[name][2] || 0) : -1);
  const ends = n => n.map(node).filter(i => i >= 0);
  const doors = Object.keys(net.ends).filter(k => k.startsWith('door-dorm'));
  const GROUPS = { OUT: ends(['canal-north-end', 'canal-north-end', 'canal-south-end']), TEACH: ends(['stair-s', 'stair-n', 'stair-w', 'arc-door', 'stair-s', 'stair-n', 'library']), DORM: ends(doors),
    HALL: ends(['hall']), GYM: ends(['gym-east']), COURTS: ends(['court-w', 'court-e', 'court-s']), FIELD: ends(['field-n', 'field-c', 'field-s']) };
  const PLACES = menuPlaces(campus);
  const pop = new Population({ G, crowd, places: PLACES, caps, range: low ? 90 : 150 });
  pop.hour = 9; pop.night = false;
  const probe = new THREE.Object3D(); ctx.add(probe);
  const root = probe.parent && probe.parent.parent;
  const seats = root ? findSeats(root) : { desks: [], chairs: [], library: [], stand: [] };
  const classRooms = [...rooms(seats.desks).map(r => ({ list: r, wide: false })), ...rooms(seats.chairs.filter(c => c.fx > 0.5)).map(r => ({ list: r, wide: true }))];
  const sport = createSport({ campus, pop, group: crowd.group, safe, low });

  // ---- the stationary people for a state of the day --------------------------------------------------------------------
  function setStill(st, hour, seed) {
    pop.clear(); const r = rng(seed), night = hour < 6.2 || hour > 19.2;
    const free = (x, z) => !pop.nearPlace(x, z, 2.4);
    // workers
    if (st.workers.includes('guard')) { const g = pop.add(person('guard', 31, 'stand'), 'work'); Object.assign(g, { x: 252.4, z: -28.9, y: 0, yaw: Math.PI / 2 - 0.3, w: 0.4, arms: 'back' }); }
    if (st.workers.includes('cleaner')) for (const [x, z, a] of [[233, -65.6, 0], [176, -94, 1]].slice(0, low ? 1 : 2)) { const c = pop.add(person('cleaner', 41 + x, 'sweep'), 'work'); Object.assign(c, { x, z, y: 0, yaw: a ? Math.PI : -Math.PI / 2, x0: x }); }
    if (st.workers.includes('gardener')) { const g = pop.add(person('gardener', 51, 'tend'), 'work'); Object.assign(g, { x: 226.5, z: -87.5, y: 0, yaw: 0.6 }); }
    // groups talking
    const nGroups = Math.round((st.groups || 0) * (low ? 0.5 : 1) * (st.k || 1));
    const spots = GROUP_SPOTS.filter(([x, z]) => free(x, z)).sort(() => r() - 0.5).slice(0, nGroups);
    for (const [cx, cz] of spots) {
      const n = 2 + Math.floor(r() * 3), a0 = r() * TAU, sport = st.period === 'sport' && r() < 0.4;
      for (let i = 0; i < n; i++) {
        const a = a0 + i / n * TAU + (r() - 0.5) * 0.4, rad = 0.5 + 0.12 * n + r() * 0.1, x = cx + Math.cos(a) * rad, z = cz + Math.sin(a) * rad;
        const p = pop.add(person(sport ? 'sport' : r() < 0.06 ? 'teacher' : 'student', Math.floor(r() * 1e9), 'stand'), 'groups');
        Object.assign(p, { x, z, y: 0, yaw: Math.atan2(cx - x, cz - z) + (r() - 0.5) * 0.5, w: r() < 0.5 ? 0.8 : -0.8, arms: i === 0 ? 'gesture' : ['hang', 'cross', 'pockets', 'hang', 'phone'][Math.floor(r() * 5)] });
        if (p.arms === 'phone') p.carry |= 1 << 5;
        if (r() < 0.5) p.carry &= ~1;                                   // some put their bag down... or never had one out here
      }
    }
    // benches
    for (const b of BENCHES) {
      if (r() > (st.benches || 0) * (b[3] === 'gate' ? 1.4 : 1)) continue;
      const n = r() < 0.55 ? 1 : 2, sx = n === 1 ? [(r() - 0.5) * 0.7] : [-0.45, 0.45];
      for (const s of sx) {
        const c = Math.cos(b[2]), sn = Math.sin(b[2]), x = b[0] + c * s + sn * 0.18, z = b[1] - sn * s + c * 0.18; if (!free(x, z)) continue;
        const p = pop.add(person(r() < 0.88 ? 'student' : 'teacher', Math.floor(r() * 1e9), 'sit'), 'benches');
        Object.assign(p, { x, z, y: 0, yaw: b[2], h: 0.46, arms: ['lap', 'phone', 'talk', 'read', 'lap'][Math.floor(r() * 5)], lean: (r() - 0.6) * 0.2, cross: r() < 0.3 });
        if (p.arms === 'phone') p.carry |= 1 << 5;
      }
    }
    // classrooms: some rooms in session (students at desks, a teacher at the front); evening study fills more of them
    const frac = st.classes || 0;
    classRooms.forEach((room, ri) => {
      if (((ri * 7 + 3) % 10) / 10 >= frac * (room.wide ? 0.8 : 1) * (low ? 0.4 : 1)) return;
      let maxX = -1e9, zs = 0;
      for (const d of room.list) {
        maxX = Math.max(maxX, d.x); zs += d.z;
        if (r() < 0.12) continue;
        const fx = room.wide ? d.fx : 1, fz = room.wide ? d.fz : 0, x = d.x - fx * (room.wide ? 0.05 : 0.47), z = d.z - fz * (room.wide ? 0.05 : 0.47);
        if (!free(x, z) && Math.abs(d.y - 3.92) < 1) continue;
        const p = pop.add(person('student', Math.floor(r() * 1e9), 'sit'), 'class');
        Object.assign(p, { x, z, y: d.y - 0.02, yaw: Math.atan2(fx, fz), h: 0.45, arms: ['desk', 'desk', 'read', 'lap', 'desk'][Math.floor(r() * 5)], feet: 0.3, indoor: true, mesh: d.mesh });
        p.carry = 0; p.hidden = () => !visibleChain(p.mesh);
      }
      const t = pop.add(person('teacher', 600 + ri, 'stand'), 'class'), d0 = room.list[0];
      Object.assign(t, { x: maxX + 1.7, z: zs / room.list.length + (r() - 0.5) * 1.5, y: d0.y - 0.02 + 0.15, yaw: -Math.PI / 2, w: 0.5, arms: 'gesture', indoor: true, mesh: d0.mesh });
      t.carry = 0; t.hidden = () => !visibleChain(t.mesh);
    });
    // the library
    const nr = Math.min(seats.library.length, Math.round((st.readers || 0) * (low ? 0.5 : 1)));
    seats.library.slice().sort(() => r() - 0.5).slice(0, nr).forEach(c => {
      const x = c.x + c.fx * 0.18 * c.k, z = c.z + c.fz * 0.18 * c.k; if (!free(x, z)) return;
      const p = pop.add(person(r() < 0.9 ? 'student' : 'teacher', Math.floor(r() * 1e9), 'sit'), 'library');
      Object.assign(p, { x, z, y: c.y, yaw: Math.atan2(c.fx, c.fz), h: 0.44 * c.k, arms: r() < 0.7 ? 'read' : 'desk', indoor: true, mesh: c.mesh }); p.carry = 0; p.hidden = () => !visibleChain(p.mesh);
    });
    // the dining hall (a shallow room behind glass on the north face of a low block south of the courts; context.js)
    if (st.diners) {
      const n = st.diners === 1 ? 16 : st.diners;
      for (let i = 0; i < Math.min(16, n); i++) {
        const tb = i >> 2, side = (i >> 1) & 1, s = i & 1, x = 36.0 + 1.2 + tb * 2.3 + (s ? 0.45 : -0.45), z = 160.1 + (side ? 1.5 : 0.4);
        const p = pop.add(person('student', 700 + i * 3 + seed, 'sit'), 'hall');
        Object.assign(p, { x: x, z: z + (side ? 0.18 : -0.18), y: 0.06, yaw: side ? Math.PI : 0, h: 0.42, arms: 'eat', feet: 0.25, indoor: true }); p.carry = 0;
      }
    }
    // spectators on the stand
    if (st.stand && seats.stand.length) {
      const mid = seats.stand.filter(c => Math.abs(c.z) < 35);
      for (let i = 0; i < Math.min(st.stand, mid.length); i++) {
        const c = mid[Math.floor(r() * mid.length)], p = pop.add(person(r() < 0.5 ? 'sport' : 'student', Math.floor(r() * 1e9), 'sit'), 'stand');
        Object.assign(p, { x: c.x + c.fx * 0.2, z: c.z + c.fz * 0.2, y: c.y, yaw: Math.atan2(c.fx, c.fz), h: 0.42, arms: r() < 0.5 ? 'lap' : 'talk' }); p.carry = 0;
      }
    }
    // the galleries of the teaching slabs at breaks: people leaning on the balustrade in twos and threes
    const gl = G.edges.filter(e => e.kind === 'gallery' && e.y > 1);
    for (let i = 0; i < Math.round((st.galleries || 0) * (low ? 0.4 : 1)); i++) {
      const E = gl[Math.floor(r() * gl.length)]; if (!E) break;
      const [a, b] = [E.pts[0], E.pts[E.pts.length - 1]], t = 0.15 + 0.7 * r(), cx = a[0] + (b[0] - a[0]) * t, cz = a[1] + (b[1] - a[1]) * t + 0.75, n = 2 + Math.floor(r() * 2);
      for (let k = 0; k < n; k++) {
        const p = pop.add(person('student', Math.floor(r() * 1e9), 'stand'), 'galleries');
        Object.assign(p, { x: cx + (k - (n - 1) / 2) * 0.65, z: cz - (k % 2) * 0.55, y: E.y, yaw: k % 2 ? 0 : Math.PI - 0.2, w: 0.6, arms: k === 0 ? 'gesture' : 'hang' }); p.carry = 0;
      }
    }
    for (const p of pop.still) { p.floorY = p.y; if (p.kind === 'sit') p.noShadow = true; }
  }

  // ---- streams of walkers ------------------------------------------------------------------------------------------------
  let state = null, lastHour = -1, still = 0, wantState = false, period = '', acc = [], seedN = 1;
  const pickEnd = (g, r) => { const l = GROUPS[g] || []; return l[Math.floor(r() * l.length)]; };
  function spawn(s, r, warm) {
    let a = pickEnd(s.from, r), b = pickEnd(s.to, r); if (a === undefined || b === undefined) return 0;
    if (a === b) { b = pickEnd(s.to, r); if (a === b) return 0; }
    const n = r() < 0.45 ? 1 : r() < 0.7 ? 2 : 3, role = pickRole(s.roles, r());
    return pop.walk(a, b, role === 'teacher' ? 'teacher' : s.roles, Math.floor(r() * 1e9), warm, role === 'teacher' ? 1 : n);
  }
  function setState(hour) {
    state = stateAt(hour); pop.hour = hour; period = state.period; seedN = Math.floor(hour * 4);
    const r = rng(seedN * 977 + 1);
    pop.walkers.length = 0; setStill(state, hour, seedN * 131 + 7); sport.set(state, seedN, hour);
    for (const p of pop.extra) p.floorY = 0;
    // warm start: people already on their way, as many as the streams would have put there
    acc = state.streams.map(() => 0);
    const maxW = low ? 120 : 380;
    for (const s of state.streams) { const n = Math.min(maxW, s.rate * (state.k || 1) * 4.5 * (low ? 0.4 : 1));    /* about the minutes a walk takes */ for (let i = 0; i < n && pop.walkers.length < maxW;) i += spawn(s, r, true) || 1; }
    for (let i = 0; i < (state.galleries || 0) * (low ? 0.6 : 2); i++) { const gl = galleries[Math.floor(r() * galleries.length)]; if (gl === undefined) break; const E = G.edges[gl], a = 2 + r() * (E.len - 4), b = 2 + r() * (E.len - 4); if (Math.abs(a - b) > 4) pop.walkSpan(gl, a + (b - a) * r() * 0.6, b, Math.floor(r() * 1e9)); }
  }
  let rs = rng(99), gacc = 0;
  const galleries = G.edges.map((e, i) => (e.kind === 'gallery' && e.y > 1 && e.len > 10 ? i : -1)).filter(i => i >= 0);
  // ---- places in the menu that show life
  if (ctx.place) {
    ctx.place('跑道', 30, 18, 0, 0, false, 0.02);                          // the east straight from the infield, runners coming
    ctx.place('食堂前', 38, 150, 160, 0, false, 0.05);                       // before the dining hall's glass front
  }

  const sunDir = new THREE.Vector3(0.3, 0.8, 0.2), camLocal = { x: 0, y: 0, z: 0 };
  // parts of a frame, timed apart for checks (window.__lifeMs(): people.walk, people.sport, people.draw, people.shadows)
  const tWalk = timed('people.walk', (dt, c) => pop.update(dt, c)), tSport = timed('people.sport', (dt, t) => sport.update(dt, t));
  let vis = []; const tDraw = timed('people.draw', (env, dt) => { vis = pop.draw(env, dt); }), tShadows = timed('people.shadows', (v, d, k) => shadows.update(v, d, k));
  ctx.animate(timed('people', (dt, seconds, env) => {
    if (!env || !env.camera) return;
    const L = env.lighting, hour = L && L.getTime ? L.getTime() : 10;
    // a new state of the day (a few hundred people set down at once, up to ~0.2 s on a slow machine) once the time has
    // stayed put for a moment, so that dragging the time slider across the day does not rebuild it on every frame
    const step = Math.abs(hour - lastHour);
    if (step > Math.max(1e-4, dt * 0.05)) still = 0; else still += dt;          // dragged (a running clock is far slower)
    if (step > 0.2 || stateAt(hour).period !== period) wantState = true;
    if (!state || (wantState && still > 0.25)) { setState(hour); wantState = false; }
    lastHour = hour; pop.night = L && L.night ? L.night() > 0.5 : false;
    // new walkers
    const maxW = low ? 120 : 380;
    state.streams.forEach((s, i) => { acc[i] += s.rate * (state.k || 1) * (low ? 0.4 : 1) * dt / 60; while (acc[i] >= 1) { acc[i] -= pop.walkers.length < maxW ? spawn(s, rs, false) || 1 : 1; } });
    // pupils set down by cars at the gate walk in
    while (DROPS.length) { const d = DROPS.shift(), a = node('gate'), b = pickEnd('TEACH', rs); if (a >= 0 && b !== undefined && pop.walkers.length < maxW) pop.walkFrom(d.x, d.z, a, b, Math.floor(rs() * 1e9), d.n); }
    // along the upper galleries at breaks: from one classroom door to another
    if (state.galleries) { gacc += state.galleries * 4 * (low ? 0.4 : 1) * dt / 60;
      while (gacc >= 1) { gacc -= 1; const gl = galleries[Math.floor(rs() * galleries.length)]; if (gl === undefined || pop.walkers.length >= maxW) break; const E = G.edges[gl], a = 2 + rs() * (E.len - 4), b = 2 + rs() * (E.len - 4); if (Math.abs(a - b) > 4) pop.walkSpan(gl, a, b, Math.floor(rs() * 1e9), rs() < 0.5 ? 1 : 2); } }
    const cam = env.camera.position; camLocal.x = cam.x; camLocal.y = cam.y; camLocal.z = cam.z;
    tWalk(dt, camLocal);
    tSport(dt, pop.time);
    tDraw(env, dt);
    // contact shadows: stretched away from the sun, fading at dusk
    const sun = L && (L.suns ? L.suns[0] : L.sun);
    if (sun) { sunDir.copy(sun.position).sub(sun.target.position).normalize(); if (sunDir.y < 0.05) sunDir.set(0, 1, 0); }
    tShadows(vis, sunDir, L && L.night ? 1 - L.night() * 0.85 : 1);
  }));
  if (typeof window !== 'undefined') window.__life = { pop, stats: () => ({ ...pop.stats, crowd: crowd.stats, sport: sport.stats(), period, mode: crowd.mode }) };
}
