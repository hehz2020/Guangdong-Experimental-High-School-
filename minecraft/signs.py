#!/usr/bin/env python3
"""The other signs of the 3D campus (signs.mjs: every lettered quad outside the teaching blocks' sheets) as text
displays: room plates and notices of the dormitories, offices of the arc building, the library's and the dome's
panels, toilets, storerooms, hydrants, floor numbers, slogans and countdown boards.

usage: python minecraft/signs.py <signs.json> <boards.json> <lettering.json> <blocks.npz> <commands.txt>   (appends)

Each sign keeps its words, rows and colours (the fill colour the 3D site painted each row with) on its ground colour
(the canvas's colour in the sign's middle; where that is too close to the letters, white or near-black instead), is
scaled to fit the 3D sign and set in front of the wall's face as boards.py does (moved up or down out of a block,
left where the 3D campus hangs it when there is no wall behind it). Left out: signs within half a metre of a card
boards.py sets, within 3 m of the big lettering of lettering.json (both carry the same words), and signs smaller
than a few centimetres a letter. The font is the game's.
CHOSEN: the contrast threshold, the smallest letter (scale 0.08), the margins.
"""
import json, math, sys
import numpy as np

LINE = 0.25
def px(s): return sum(9 if ord(ch) > 0x2e80 else 4 if ch == ' ' else 6 for ch in s)
def esc(s): return s.replace('\\', '\\\\').replace('"', '\\"').replace('\n', '\\n')
def rgb(h):
    h = (h or '#ffffff').lstrip('#')
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4)) if len(h) == 6 else (255, 255, 255)
def redmean(a, b):
    rm = (a[0] + b[0]) / 2
    return math.sqrt((2 + rm / 256) * (a[0] - b[0]) ** 2 + 4 * (a[1] - b[1]) ** 2 + (2 + (255 - rm) / 256) * (a[2] - b[2]) ** 2)

def main():
    spec, bspec, lspec, src, out = sys.argv[1:6]
    S = json.load(open(spec, encoding='utf-8'))
    done = [c['c'] for c in json.load(open(bspec, encoding='utf-8'))['cards']]
    big = []
    for e in json.load(open(lspec, encoding='utf-8')):
        if 'box' in e: b = e['box']; big.append(((b[0] + b[3]) / 2, (b[1] + b[4]) / 2, (b[2] + b[5]) / 2))
        elif 'pos' in e: big.append((e['pos'][0], e['pos'][1] - 64, e['pos'][2]))
    d = np.load(src)
    st, pal, box = d['states'], [str(p) for p in d['pal']], d['box']
    X0, X1, Z0, Z1, Y0, Y1 = box
    solid = np.array([not (p == 'air' or p.startswith(('water', 'light['))) for p in pal])
    SO = solid[st]
    NY, NZ, NX = st.shape
    def is_solid(x, h, z):
        bx, by, bz = int(math.floor(x - X0)), int(math.floor(h - Y0)), int(math.floor(z - Z0))
        return 0 <= bx < NX and 0 <= by < NY and 0 <= bz < NZ and bool(SO[by, bz, bx])
    cmds, n = [], {}
    def count(k): n[k] = n.get(k, 0) + 1
    for g in S:
        cx, cy, cz = g['c']; nx, _, nz = g['n']; L = math.hypot(nx, nz) or 1; nx, nz = nx / L, nz / L
        w, h, lines = g['w'], g['h'], [(t, c) for t, c in g['lines'] if t.strip()]
        if not lines: continue
        if any(math.dist((cx, cy, cz), p) < 0.5 for p in done): count('on a board card'); continue
        if any(math.dist((cx, cy, cz), p) < 3 for p in big): count('big lettering'); continue
        if not (X0 <= cx < X1 and Z0 <= cz < Z1): count('outside'); continue
        margin = min(0.04, h * 0.1)
        s = min((h - margin) / (len(lines) * LINE), (w - 2 * margin) / (max(px(t) for t, _ in lines) * 0.025 + 0.05), 1.5)
        if s < 0.08: count('too small'); continue
        bg = rgb(g.get('bg')); cols = [rgb(c) for _, c in lines]
        if min(redmean(bg, c) for c in cols) < 90:                  # the middle of the sign fell on a letter: a plain ground
            lum = sum(cols[0]) / 3
            bg = (24, 28, 34) if lum > 128 else (246, 244, 238)
        bgv = (0xFF << 24) | (bg[0] << 16) | (bg[1] << 8) | bg[2]; bgv -= 1 << 32
        best, prev = None, is_solid(cx - nx * 1.5, cy, cz - nz * 1.5)
        for k in range(1, 51):
            t = -1.5 + k * 0.05
            cur = is_solid(cx + nx * t, cy, cz + nz * t)
            if prev and not cur: best = t
            prev = cur
        if best is None:
            hang = next((dd for dd in (0, -0.25, -0.5, -0.75, -1.0, 0.25, 0.5) if not is_solid(cx, cy + dd, cz) and not is_solid(cx + nx * 0.2, cy + dd, cz + nz * 0.2)), None)
            if hang is None: count('no wall'); continue
            best = -0.03; cy += hang; count('hanging')
        t = best + 0.03
        x_, z_ = cx + nx * t, cz + nz * t
        y0, th = cy - h / 2 + margin / 2, len(lines) * LINE * s
        fx, fz = x_ + nx * 0.2, z_ + nz * 0.2
        free = lambda y: not is_solid(fx, y + 0.05, fz) and not is_solid(fx, y + th - 0.05, fz) and not is_solid(fx, y + th / 2, fz)
        dy = next((dd for dd in (0, -0.25, 0.25, -0.5, 0.5, -0.75, 0.75, -1.0, 1.0) if free(y0 + dd)), None)
        if dy is None: count('buried'); continue
        yaw = math.degrees(math.atan2(-nx, nz))
        parts = ','.join(f'{{text:"{esc(tx + (chr(10) if k < len(lines) - 1 else ""))}",color:"{col if col.startswith("#") else "#000000"}"}}' for k, (tx, col) in enumerate(lines))
        cmds.append(f'summon minecraft:text_display {x_:.3f} {y0 + dy + 64:.3f} {z_:.3f} {{text:{{text:"",extra:[{parts}]}},background:{bgv},billboard:"fixed",shadow:0b,'
                    f'line_width:2000,alignment:"center",Rotation:[{yaw:.1f}f,0f],'
                    f'transformation:{{left_rotation:[0f,0f,0f,1f],right_rotation:[0f,0f,0f,1f],translation:[0f,0f,0f],scale:[{s:.3f}f,{s:.3f}f,{s:.3f}f]}}}}')
        count('placed')
    open(out, 'a', encoding='utf-8').write('\n'.join(cmds) + '\n')
    print('signs:', ', '.join(f'{k} {v}' for k, v in sorted(n.items())))

if __name__ == '__main__':
    main()
