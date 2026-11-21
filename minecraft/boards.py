#!/usr/bin/env python3
"""The words of the 3D teaching blocks' cards as text displays (boards.mjs reads them out of the 3D site): the day's
lesson on every chalkboard, the class's chalk drawing and the slogan on the back wall, room and floor plates, exit
signs, the flag over the board, timetables, duty rosters, class rules, certificates, posters, mottos, notices; the
clock over the board becomes a real clock in an item frame (it shows the time of day in the game), and in front of
every lesson board stands a lectern (讲台) with the lesson as a written book on it.

usage: python minecraft/boards.py <boards.json> <blocks.npz> <commands.txt>   (appends summon commands)

Each card becomes one text display, set 0.03 m in front of the first block face the wall has in the map along the
card's facing (as lettering.py does), anchored at the card's lower edge and scaled so that every line fits the card.
A card whose height falls inside a block (at one metre a card near a ceiling can be in the floor above) is moved up
or down, by up to a metre, to air; a card with no wall within a metre behind it (a sign hanging under a ceiling) stays
where the 3D campus has it if that is air, and is left out otherwise. The ground colour is the text
display's own background, in the colours the 3D site paints the card with (slab-wide.js); the font is the game's.
All the words are the 3D site's (made up there).
CHOSEN: 0.25 m per line at scale 1, the margins, a sign of the font for each chalk drawing.
"""
import json, math, sys
import numpy as np

CHALK, YELLOW, BOARD = '#eef0e6', '#f3df7a', 0xE62F4A3A           # chalk white, yellow chalk; ARGB of the green ground
CHALKS = ['#f7d64c', '#f58d7e', '#9fd8f0', '#a8e6a1', '#f5a6c0']
SYMBOL = ['☀', '✎', '✺', '✔', '♥', '✈', '⚑', '★']                  # ART's pictures: sun, book, lantern, shield, heart, rocket, runner, big star
CN = ['一', '二', '三', '四', '五', '六']
LINE = 0.25                                                          # metres per line of text at scale 1
def px(s): return sum(9 if ord(ch) > 0x2e80 else 4 if ch == ' ' else 6 for ch in s)    # width in font pixels (0.025 m each at scale 1)
def esc(s): return s.replace('\\', '\\\\').replace('"', '\\"').replace('\n', '\\n')
def signed(v): return v - (1 << 32) if v >= 1 << 31 else v
def argb(hex_, a=0xFF): return (a << 24) | int(hex_.lstrip('#'), 16)

def style(c, B):
    """(lines [(text, colour)], ground ARGB, alignment, margin in metres) for a card, or None to leave it out."""
    key, sheet = c['key'], c['sheet']
    kind = key.rstrip('0123456789_w').split(':')[0]
    num = ''.join(ch for ch in key.split(':')[0] if ch.isdigit())
    i = int(num) if num and kind not in ('plate',) else 0
    plate = B.get('plates', {}).get(f'{sheet}:{key}')
    if kind == 'board':
        lessons = B['lessons']['east' if sheet == 'east' else 'west']
        if i >= len(lessons): return None
        les = lessons[i]
        return [(les['t'], YELLOW)] + [(l, CHALK) for l in les['l']], BOARD, 'left', 0.12
    if kind == 'art' and sheet != 'east':
        title = B['art'][i % len(B['art'])]; sym = SYMBOL[i % len(SYMBOL)]
        return [(f'{sym}  {title}  {sym}', CHALKS[i % len(CHALKS)])], BOARD, 'center', 0.1
    if kind == 'slogan':
        red = i % 2 == 0
        return [(B['slogans'][i % len(B['slogans'])], '#f6d860' if red else '#c3201b')], argb('#c3201b' if red else '#f7f4ea'), 'center', 0.02
    if kind in ('plate', 'store') and plate:
        n, name, building = plate
        return [(f'{n}  {building}', '#ffffff'), (name, '#ffffff')], argb('#2468b4'), 'center', 0.01
    if kind == 'floor' and plate:
        n, _, building = plate; n = int(n)
        return [(f'{n}F', '#9c2a22'), (f'{building} · {CN[n - 1]}楼', '#5a2a26')], argb('#f4f2ea'), 'center', 0.01
    if kind == 'exit':
        d = i - 1
        return [('安全出口', '#ffffff'), (('← ' if d < 0 else '') + 'EXIT' + (' →' if d > 0 else ''), '#ffffff')], argb('#0a8f4e'), 'center', 0.01
    if kind == 'flag':
        return [('★' + ' ' * 6, '#ffde00'), (' ' * 8, '#ffde00')], argb('#de2910'), 'left', 0.01
    if kind == 'timetable': return [('课程表', '#ffffff')], argb('#1d4f9c'), 'center', 0.02
    if kind == 'duty': return [('值日表', '#ffffff')], argb('#1a7a3c'), 'center', 0.02
    if kind == 'rules' and sheet == 'west-prints': return [('班级公约', '#ffffff')], argb('#c3201b'), 'center', 0.02
    if kind == 'cert': return [(['奖状', '文明班级', '优秀团支部', '荣誉证书'][i % 4], '#c3201b')], argb('#f9e7b0' if i % 4 == 1 else '#fbf3d6'), 'center', 0.01
    if kind == 'poster':
        t, col = B['posters'][i % len(B['posters'])]
        return [(t, '#ffffff')], argb(col), 'center', 0.02
    if kind == 'motto': return [(['爱国  团结', '求实  创新'][i % 2], '#c3201b')], argb('#fbf6e6'), 'center', 0.02
    if kind == 'pennant': return [('流动', '#f6d860'), ('红旗', '#f6d860')], argb('#c3201b'), 'center', 0.01
    if kind == 'garden': return [('学习园地', '#d0281f')], argb('#f6d24a'), 'center', 0.01
    if kind == 'keepright': return [('上下楼梯  靠右慢行', '#1d4f9c')], argb('#f7f9fb'), 'center', 0.01
    if kind == 'norun': return [('请勿追逐打闹', '#b3261e')], argb('#f4d21f'), 'center', 0.01
    if kind == 'water': return [('饮水处', '#ffffff')], argb('#1d6fb5'), 'center', 0.01
    if kind == 'save': return [('节约用水', '#1a7a3c')], argb('#eaf6ee'), 'center', 0.01
    if kind == 'evac': return [('疏散示意图', '#c3201b')], argb('#fbfaf5'), 'center', 0.02
    if kind == 'essay': return [(['我的理想', '读后感'][i % 2], '#c3201b')], argb('#fffef8'), 'center', 0.01
    return None

def main():
    spec, src, out = sys.argv[1:4]
    B = json.load(open(spec, encoding='utf-8'))
    d = np.load(src)
    st, pal, box = d['states'], [str(p) for p in d['pal']], d['box']
    X0, X1, Z0, Z1, Y0, Y1 = box
    solid = np.array([not (p == 'air' or p.startswith(('water', 'light['))) for p in pal])
    S = solid[st]
    NY, NZ, NX = st.shape
    def is_solid(x, h, z):
        bx, by, bz = int(math.floor(x - X0)), int(math.floor(h - Y0)), int(math.floor(z - Z0))
        return 0 <= bx < NX and 0 <= by < NY and 0 <= bz < NZ and bool(S[by, bz, bx])
    cmds, n = [], {}
    def count(k): n[k] = n.get(k, 0) + 1
    def floor_at(x, z, y_from):
        """Row of the first air block above the floor at (x, z), searching down from about the card's height."""
        bx, bz = int(math.floor(x - X0)), int(math.floor(z - Z0))
        if not (0 <= bx < NX and 0 <= bz < NZ): return None
        y = int(math.floor(y_from - Y0))
        for _ in range(4):
            if 0 < y < NY and not S[y, bz, bx] and S[y - 1, bz, bx]: return y
            y -= 1
        return None
    def lectern(cx, cy, cz, nx, nz, best, lines, B, c):
        """The teacher's lectern (讲台) in front of the board's middle, two blocks out from the wall, turned to the board
        (the teacher stands behind it facing the class), with the day's lesson as a written book on it."""
        for out in (1.5, 2.5, 0.5):
            x, z = cx + nx * (best + out), cz + nz * (best + out)
            y = floor_at(x, z, cy - 0.6)
            if y is None: continue
            bx, bz = int(math.floor(x - X0)), int(math.floor(z - Z0))
            if S[y + 1, bz, bx]: continue
            facing = ('east' if nx < 0 else 'west') if abs(nx) > abs(nz) else ('south' if nz < 0 else 'north')
            title = lines[0][0].strip()[:32]
            pages = ['"' + esc('\n'.join(t.strip() for t, _ in lines)) + '"']
            book = (f'{{id:"minecraft:written_book",count:1,components:{{"minecraft:written_book_content":{{title:{{raw:"{esc(title)}"}},'
                    f'author:"广东实验中学",pages:[{",".join(pages)}]}}}}}}')
            cmds.append(f'setblock {bx + int(X0)} {y + int(Y0) + 64} {bz + int(Z0)} minecraft:lectern[facing={facing},has_book=true,powered=false]{{Book:{book}}}')
            count('lectern'); return
        count('no lectern')
    for c in B['cards']:
        cx, cy, cz = c['c']; nx, _, nz = c['n']; L = math.hypot(nx, nz) or 1; nx, nz = nx / L, nz / L
        w, h = c['w'], c['h']
        kind = c['key'].rstrip('0123456789_w').split(':')[0]
        # the wall's face in the map along the card's facing: the last solid-to-air step from 1.5 m behind the card
        best, prev = None, is_solid(cx - nx * 1.5, cy, cz - nz * 1.5)
        for k in range(1, 51):                                       # up to 1 m in front of the card: the wall, not a desk
            t = -1.5 + k * 0.05
            cur = is_solid(cx + nx * t, cy, cz + nz * t)
            if prev and not cur: best = t
            prev = cur
        if kind == 'clock':
            # a real clock in an item frame on the wall, in the block in front of the face (Facing: the way it looks)
            if best is None: count('no wall'); continue
            fx_, fz_ = cx + nx * (best + 0.5), cz + nz * (best + 0.5)
            if is_solid(fx_, cy, fz_): count('buried'); continue
            facing = (5 if nx > 0 else 4) if abs(nx) > abs(nz) else (3 if nz > 0 else 2)
            bx, by, bz = math.floor(fx_), math.floor(cy) + 64, math.floor(fz_)
            # block_pos: the block the frame is in (26.x reads its place from it; without it the frame is refused)
            cmds.append(f'summon minecraft:item_frame {bx + 0.5:.1f} {by + 0.5:.1f} {bz + 0.5:.1f} '
                        f'{{Facing:{facing}b,block_pos:[I;{bx},{by},{bz}],Fixed:1b,Item:{{id:"minecraft:clock",count:1}}}}')
            count('clock'); continue
        sty = style(c, B)
        if sty is None: count('left out'); continue
        lines, bg, align, margin = sty
        s = min((h - margin) / (len(lines) * LINE), (w - 2 * margin) / (max(px(t) for t, _ in lines) * 0.025 + 0.1), 1.2)
        if s <= 0.05: count('too small'); continue
        if kind == 'board':                                          # spaces after the title widen the ground to the card's
            pad = int(((w - 2 * margin) / (0.025 * s) - px(lines[0][0])) / 4)
            if pad > 0: lines = [(lines[0][0] + ' ' * pad, lines[0][1])] + lines[1:]
        if best is None:
            # no wall behind it within a metre: a sign hanging in the open (exit signs under a corridor's ceiling, plates
            # standing out from a door frame) stays where the 3D campus has it, if that is air
            hang = next((dd for dd in (0, -0.25, -0.5, -0.75, -1.0, 0.25, 0.5) if not is_solid(cx, cy + dd, cz) and not is_solid(cx + nx * 0.2, cy + dd, cz + nz * 0.2)), None)
            if hang is None: count('no wall'); continue
            best = -0.03; cy += hang; count('hanging')
        t = best + 0.03
        x_, z_ = cx + nx * t, cz + nz * t
        # at one metre a card near a ceiling can fall inside the floor block above (or a low one inside a desk): move
        # it up or down, by up to a metre, to where its height is air in front of the wall
        y0, th = cy - h / 2 + margin / 2, len(lines) * LINE * s
        fx, fz = x_ + nx * 0.2, z_ + nz * 0.2
        free = lambda y: not is_solid(fx, y + 0.05, fz) and not is_solid(fx, y + th - 0.05, fz) and not is_solid(fx, y + th / 2, fz)
        dy = next((dd for dd in (0, -0.25, 0.25, -0.5, 0.5, -0.75, 0.75, -1.0, 1.0) if free(y0 + dd)), None)
        if dy is None: count('buried'); continue
        if dy: count('moved')
        y_ = y0 + dy + 64
        yaw = math.degrees(math.atan2(-nx, nz))
        parts = ','.join(f'{{text:"{esc(t_ + (chr(10) if k < len(lines) - 1 else ""))}",color:"{col}"}}' for k, (t_, col) in enumerate(lines))
        comp = '{text:"",extra:[' + parts + ']}'
        if kind == 'board': lectern(cx, cy, cz, nx, nz, best, lines, B, c)
        cmds.append(f'summon minecraft:text_display {x_:.3f} {y_:.3f} {z_:.3f} {{text:{comp},background:{signed(bg)},billboard:"fixed",shadow:0b,'
                    f'line_width:2000,alignment:"{align}",Rotation:[{yaw:.1f}f,0f],'
                    f'transformation:{{left_rotation:[0f,0f,0f,1f],right_rotation:[0f,0f,0f,1f],translation:[0f,0f,0f],scale:[{s:.3f}f,{s:.3f}f,{s:.3f}f]}}}}')
        count(kind)
    with open(out, 'a', encoding='utf-8') as f: f.write('\n'.join(cmds) + '\n')
    print('boards:', ', '.join(f'{k} {v}' for k, v in sorted(n.items())))

if __name__ == '__main__':
    main()
