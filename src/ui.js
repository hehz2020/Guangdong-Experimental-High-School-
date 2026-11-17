// Interface layer: touch controls for phones, a minimap, a time-of-day slider and a help panel.
// Everything is created here (DOM and CSS); index.html only provides the start panel (#start) and the notice (#notice).
import { itemPolygon, stadium } from './kit.js';

const CSS = `
.hud{position:fixed;z-index:5;font-family:system-ui,"PingFang SC","Microsoft YaHei",sans-serif;color:#eef2f6;user-select:none;-webkit-user-select:none}
#hud-map{top:calc(10px + env(safe-area-inset-top,0px));right:calc(10px + env(safe-area-inset-right,0px));background:rgba(12,16,22,.55);border-radius:8px;padding:4px}
#hud-map canvas{display:block;border-radius:5px}
#hud-time{top:calc(10px + env(safe-area-inset-top,0px));left:50%;transform:translateX(-50%);background:rgba(12,16,22,.55);border-radius:8px;padding:5px 10px;font-size:13px;display:flex;gap:8px;align-items:center}
#hud-time input{width:150px}
#hud-help-btn{top:calc(10px + env(safe-area-inset-top,0px));left:calc(10px + env(safe-area-inset-left,0px));width:34px;height:34px;border-radius:17px;border:0;background:rgba(12,16,22,.6);color:#eef2f6;font-size:18px}
#hud-help{top:calc(52px + env(safe-area-inset-top,0px));left:calc(10px + env(safe-area-inset-left,0px));max-width:260px;background:rgba(12,16,22,.8);border-radius:8px;padding:10px 12px;font-size:13px;line-height:1.7}
#stick{left:calc(24px + env(safe-area-inset-left,0px));bottom:calc(64px + env(safe-area-inset-bottom,0px));width:130px;height:130px;border-radius:65px;background:rgba(255,255,255,.12);border:2px solid rgba(255,255,255,.35);touch-action:none}
#stick i{position:absolute;left:40px;top:40px;width:50px;height:50px;border-radius:25px;background:rgba(255,255,255,.55)}
.tbtn{right:calc(24px + env(safe-area-inset-right,0px));width:64px;height:64px;border-radius:32px;border:2px solid rgba(255,255,255,.4);background:rgba(255,255,255,.14);color:#fff;font-size:15px;touch-action:none}
#btn-jump{bottom:calc(64px + env(safe-area-inset-bottom,0px))}#btn-run{bottom:calc(140px + env(safe-area-inset-bottom,0px))}#btn-run.on{background:rgba(255,200,90,.5)}
#hud-bar{left:50%;transform:translateX(-50%);bottom:calc(20px + env(safe-area-inset-bottom,0px));display:flex;gap:8px}
#hud-bar button{border:0;border-radius:16px;padding:7px 14px;font-size:14px;background:rgba(12,16,22,.62);color:#eef2f6}
#hud-bar button.on{background:rgba(255,200,90,.6);color:#201a08}
#hud-places{left:50%;transform:translateX(-50%);bottom:calc(62px + env(safe-area-inset-bottom,0px));background:rgba(12,16,22,.86);border-radius:10px;padding:6px;display:grid;grid-template-columns:1fr 1fr;gap:4px;width:min(300px,calc(100% - 32px))}
#hud-places button{border:0;border-radius:6px;padding:9px 6px;font-size:13px;background:rgba(255,255,255,.1);color:#eef2f6;text-align:center}
#notice{max-width:calc(50% - 110px)!important}
@media (max-width:640px){
  #hud-map canvas{width:104px;height:auto}
  #hud-time{left:calc(52px + env(safe-area-inset-left,0px));transform:none;padding:4px 8px;font-size:12px}
  #hud-time input{width:84px}
  #notice{top:calc(52px + env(safe-area-inset-top,0px))!important;bottom:auto!important;left:calc(10px + env(safe-area-inset-left,0px))!important;max-width:calc(100% - 140px)!important;font-size:11px!important}
}
`;

export function initUI({ player, lighting, campus, camera, renderer, view }) {
  const style = document.createElement('style'); style.textContent = CSS; document.head.appendChild(style);
  const el = (tag, id, cls = 'hud', html = '') => { const e = document.createElement(tag); if (id) e.id = id; e.className = cls; e.innerHTML = html; document.body.appendChild(e); return e; };
  const touch = matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
  const state = { moveX: 0, moveY: 0, run: false, jump: false };

  // --- time of day ---
  if (lighting) {
    const box = el('div', 'hud-time', 'hud', '<span id="hud-clock"></span><input type="range" min="5" max="22" step="0.25">');
    const input = box.querySelector('input'), clock = box.querySelector('#hud-clock');
    const show = h => { clock.textContent = '时间 ' + String(Math.floor(h)).padStart(2, '0') + ':' + String(Math.round((h % 1) * 60)).padStart(2, '0'); };
    input.value = lighting.getTime(); show(lighting.getTime());
    input.addEventListener('input', () => { const h = Number(input.value); lighting.setTime(h); show(h); });
    for (const t of ['pointerdown', 'touchstart', 'click']) box.addEventListener(t, e => e.stopPropagation());
  }

  // --- help ---
  const helpBtn = el('button', 'hud-help-btn', 'hud', '?'), help = el('div', 'hud-help', 'hud');
  help.hidden = true;
  help.innerHTML = touch ? '左下摇杆：移动<br>右半屏滑动：转动视角<br>“跑”：切换奔跑　“跳”：跳跃<br>“地点”：直接前往某处<br>“航拍”：飞行模式，朝视线方向飞，“跳”为上升<br>上方滑块：调整时间<br>右上：小地图（北在上）'
    : 'W A S D / 方向键：移动<br>鼠标：转动视角（先点击画面）<br>Shift：跑　空格：跳　Esc：释放鼠标<br>F：航拍模式（空格上升，C 下降）<br>下方“地点”：直接前往某处（先按 Esc）<br>上方滑块：调整时间<br>右上：小地图（北在上）';
  helpBtn.addEventListener('click', e => { e.stopPropagation(); help.hidden = !help.hidden; });

  // --- places menu and drone mode ---
  if (player) {
    const boxOf = id => { const it = campus.items.find(i => i.id === id); if (!it) return null; const q = itemPolygon(it), xs = q.map(v => v[0]), zs = q.map(v => v[1]);
      const w = Math.min(...xs), e = Math.max(...xs), n = Math.min(...zs), s = Math.max(...zs); return { w, e, n, s, cx: (w + e) / 2, cz: (n + s) / 2, it }; };
    const toward = (x, z, tx, tz) => Math.atan2(tx - x, -(tz - z)) * 180 / Math.PI;      // heading in degrees: 0 north, 90 east
    const places = [], add = (name, x, z, yaw, y = 0, fly = false, pitch = 0) => places.push({ name, x, z, yaw, y, fly, pitch });
    add('操场中央', campus.track.cx, campus.track.cz, 0);
    const seat = boxOf('grandstand-seating'); if (seat) add('看台前', seat.e + 7, seat.cz, 270);
    const gym = boxOf('gym-main'); if (gym) { add('体育馆西门外', gym.w - 14, gym.cz, 90); add('体育馆内', gym.w + 26, gym.cz, 90, 0.8); }
    if (campus.courts) { const k = campus.courts.block; add('篮球场', (k.w + k.e) / 2, (k.n + k.s) / 2, 0); }
    const can = boxOf('plaza-canopy'), tw = boxOf('clock-tower');
    if (can) add('网架广场', can.cx, can.s - 8, tw ? toward(can.cx, can.s - 8, tw.cx, tw.cz) : 90);
    if (tw) add('钟楼下', tw.cx - 4, tw.cz + 18, toward(tw.cx - 4, tw.cz + 18, tw.cx, tw.cz));
    const sn = campus.items.find(i => i.id === 'slab-north');
    if (sn && sn.mainBar) { const b = sn.mainBar; add('教学楼二层外廊', b.w + 14, b.s - 1.7, 90, 3.9); add('二层教室', b.w + 6.2, b.n + 4.8, 90, 3.9); }
    const arc = boxOf('arc-building'); if (arc && can) add('弧形楼前', can.cx - 5, can.n - 8, 0);
    // New teaching building: its outline is stored west, north, east, south-east, south-west; the south face (last edge) has the library doors.
    const nbi = campus.items.find(i => i.id === 'new-teaching-building');
    if (nbi && nbi.points && nbi.points.length === 5) {
      const E = nbi.points[4], D = nbi.points[3], a = Math.atan2(-(D[1] - E[1]), D[0] - E[0]), cs = Math.cos(a), sn = Math.sin(a);
      const W = (X, Z) => [E[0] + X * cs + Z * sn, E[1] - X * sn + Z * cs];          // X along the south face from its west end, Z out of the building
      const out = W(46.5, 14), door = W(46.5, 0), lobby = W(45, -4.2), hall = W(30, -11), gal = W(53.5, -16), galLook = W(40, -10);
      add('新综合楼前', out[0], out[1], toward(out[0], out[1], door[0], door[1]));
      add('图书馆大厅', lobby[0], lobby[1], toward(lobby[0], lobby[1], hall[0], hall[1]), 0.3);      // just inside the doors, looking across the reading hall
      add('图书馆二层回廊', gal[0], gal[1], toward(gal[0], gal[1], galLook[0], galLook[1]), 4.2);
    }
    add('航拍：校园全景', -80, 220, toward(-80, 220, 110, -50), 120, true, -0.42);
    const sw = boxOf('sign-wing-between-slabs'); if (sw) add('航拍：校名墙', sw.cx + 10, sw.n - 44, toward(sw.cx + 10, sw.n - 44, sw.cx, sw.n), 31, true, -0.3);

    const bar = el('div', 'hud-bar'), list = el('div', 'hud-places'); list.hidden = true;
    const bPlaces = document.createElement('button'); bPlaces.textContent = '地点'; bar.appendChild(bPlaces);
    const bFly = document.createElement('button'); bFly.textContent = '航拍'; bFly.id = 'btn-fly'; bar.appendChild(bFly);
    const go = pl => { player.setFly(pl.fly); player.setPose(pl.x, pl.z, pl.yaw, pl.y); if (pl.pitch) player.look(0, pl.pitch); list.hidden = true; };
    for (const pl of places) { const b = document.createElement('button'); b.textContent = pl.name; b.addEventListener('click', e => { e.stopPropagation(); go(pl); }); list.appendChild(b); }
    bPlaces.addEventListener('click', e => { e.stopPropagation(); list.hidden = !list.hidden; });
    bFly.addEventListener('click', e => { e.stopPropagation(); player.setFly(!player.isFly()); });
    player.onFly(on => bFly.classList.toggle('on', on));
    for (const box of [bar, list]) for (const ev of ['pointerdown', 'touchstart']) box.addEventListener(ev, e => e.stopPropagation());
    window.__places = { list: places.map(pl => pl.name), go: name => { const pl = places.find(q => q.name === name); if (pl) go(pl); return !!pl; } };
  }

  // --- minimap ---
  const mapBox = el('div', 'hud-map'), cv = document.createElement('canvas'); mapBox.appendChild(cv);
  const B = { w: -115, e: 320, n: -200, s: 145 }, S = 150 / (B.e - B.w); cv.width = 150; cv.height = Math.round((B.s - B.n) * S);
  const g = cv.getContext('2d'), X = x => (x - B.w) * S, Z = z => (z - B.n) * S;
  const base = document.createElement('canvas'); base.width = cv.width; base.height = cv.height;
  (() => {
    const b = base.getContext('2d'); b.fillStyle = 'rgba(40,52,44,.9)'; b.fillRect(0, 0, base.width, base.height);
    const poly = (pts, fill) => { b.beginPath(); pts.forEach(([x, z], i) => (i ? b.lineTo(X(x), Z(z)) : b.moveTo(X(x), Z(z)))); b.closePath(); b.fillStyle = fill; b.fill(); };
    const t = campus.track; poly(stadium(t.cx, t.cz, t.straight, t.outerRadius), '#a5483a'); poly(stadium(t.cx, t.cz, t.straight, t.innerRadius), '#5a9a4c');
    if (campus.courts) { const k = campus.courts.block; poly([[k.w, k.n], [k.e, k.n], [k.e, k.s], [k.w, k.s]], '#3d7f5c'); }
    for (const it of campus.items) poly(itemPolygon(it), it.height <= 0 ? (it.style === 'water' ? '#3f6a78' : '#77786f') : '#d8d5cc');
  })();
  let tick = 0;
  function drawMap() {
    g.drawImage(base, 0, 0);
    const p = player ? player.pose() : { x: camera.position.x, z: camera.position.z, yawDeg: 0 };
    const a = p.yawDeg * Math.PI / 180;
    g.save(); g.translate(X(p.x), Z(p.z)); g.rotate(a);
    g.fillStyle = '#ffd24a'; g.beginPath(); g.moveTo(0, -7); g.lineTo(4.5, 5); g.lineTo(0, 2.5); g.lineTo(-4.5, 5); g.closePath(); g.fill(); g.restore();
    g.fillStyle = '#fff'; g.font = '10px sans-serif'; g.fillText('北', cv.width - 14, 12);
  }
  drawMap();

  // --- touch controls ---
  if (touch && player) {
    const stick = el('div', 'stick', 'hud', '<i></i>'), knob = stick.firstChild;
    const jump = el('button', 'btn-jump', 'hud tbtn', '跳'), run = el('button', 'btn-run', 'hud tbtn', '跑');
    // the notice would sit under the stick: move it below the top bar and let it fade out after a while
    const notice = document.getElementById('notice'); if (notice) { notice.style.bottom = 'auto'; notice.style.top = '52px'; notice.style.left = '10px'; setTimeout(() => { notice.hidden = true; }, 15000); }
    const start = document.getElementById('start');
    if (start) {
      const how = document.getElementById('start-how'); if (how) how.textContent = '点一下开始：左下摇杆移动，右半屏滑动转向';
      const go = e => { start.hidden = true; e.preventDefault(); };
      start.addEventListener('touchend', go); start.addEventListener('click', go);
    }
    let stickId = null, lookId = null, lx = 0, ly = 0;
    const setStick = (cx, cy) => {
      const r = stick.getBoundingClientRect(), dx = cx - (r.left + r.width / 2), dy = cy - (r.top + r.height / 2), m = Math.hypot(dx, dy), lim = 45, k = m > lim ? lim / m : 1;
      knob.style.transform = `translate(${dx * k}px,${dy * k}px)`; state.moveX = dx * k / lim; state.moveY = -dy * k / lim;
    };
    stick.addEventListener('touchstart', e => { const t = e.changedTouches[0]; stickId = t.identifier; setStick(t.clientX, t.clientY); e.preventDefault(); e.stopPropagation(); }, { passive: false });
    jump.addEventListener('touchstart', e => { state.jump = true; e.preventDefault(); e.stopPropagation(); }, { passive: false });
    jump.addEventListener('touchend', e => { state.jump = false; e.preventDefault(); }, { passive: false });
    run.addEventListener('touchstart', e => { state.run = !state.run; run.classList.toggle('on', state.run); e.preventDefault(); e.stopPropagation(); }, { passive: false });
    const canvas = renderer.domElement; canvas.style.touchAction = 'none';
    canvas.addEventListener('touchstart', e => { for (const t of e.changedTouches) if (lookId === null) { lookId = t.identifier; lx = t.clientX; ly = t.clientY; } e.preventDefault(); }, { passive: false });
    addEventListener('touchmove', e => {
      for (const t of e.changedTouches) {
        if (t.identifier === stickId) setStick(t.clientX, t.clientY);
        else if (t.identifier === lookId) { player.look((t.clientX - lx) * 0.005, -(t.clientY - ly) * 0.005); lx = t.clientX; ly = t.clientY; }
      }
      if (stickId !== null || lookId !== null) e.preventDefault();
    }, { passive: false });
    const end = e => { for (const t of e.changedTouches) {
      if (t.identifier === stickId) { stickId = null; state.moveX = state.moveY = 0; knob.style.transform = ''; }
      if (t.identifier === lookId) lookId = null; } };
    addEventListener('touchend', end); addEventListener('touchcancel', end);
  }
  void view;
  return { update() { if (++tick % 6 === 0) drawMap(); }, input: () => state, touch };
}
