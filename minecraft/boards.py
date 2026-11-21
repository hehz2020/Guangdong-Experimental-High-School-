#!/usr/bin/env python3
"""The words of the 3D classrooms' boards as text displays: the day's lesson on every chalkboard, the class's chalk
drawing (its title) and the slogan above it on the back wall (boards.mjs reads them out of the 3D site).

usage: python minecraft/boards.py <boards.json> <blocks.npz> <commands.txt>   (appends summon commands)

Each card becomes one text display, set 0.03 m in front of the first block face the wall has in the map along the
card's facing (as lettering.py does), anchored at the card's lower edge and scaled so that every line fits the card:
  - chalkboard: the lesson's title in yellow chalk and its lines in white chalk, on a dark green ground (the text
    display's own background, so the words read whatever block the wall became at one metre);
  - chalk drawing: its title, in the chalk colours the 3D drawing uses, on the same green;
  - slogan: red ground with yellow characters, or cream with red, alternately, as the 3D strips are painted.
The game's font, not the 3D site's chalk hand. All the words are the 3D site's (made up there; see slab-wide.js).
CHOSEN: the colours (taken from the 3D painting code), 0.25 m per line at scale 1, the margins.
"""
import json, math, sys
import numpy as np

CHALK, YELLOW, BOARD = '#eef0e6', '#f3df7a', 0xE62F4A3A           # chalk white, yellow chalk; ARGB of the green ground
CHALKS = ['#f7d64c', '#f58d7e', '#9fd8f0', '#a8e6a1', '#f5a6c0']
SYMBOL = ['☀', '✎', '✺', '✔', '♥', '✈', '⚑', '★']                  # ART's pictures: sun, book, lantern, shield, heart, rocket, runner, big star
LINE = 0.25                                                          # metres per line of text at scale 1
def px(s): return sum(9 if ord(ch) > 0x2e80 else 6 for ch in s)      # width in font pixels (0.025 m each at scale 1)
def esc(s): return s.replace('\\', '\\\\').replace('"', '\\"').replace('\n', '\\n')
def signed(v): return v - (1 << 32) if v >= 1 << 31 else v

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
    for c in B['cards']:
        key, sheet = c['key'], c['sheet']
        cx, cy, cz = c['c']; nx, _, nz = c['n']; L = math.hypot(nx, nz) or 1; nx, nz = nx / L, nz / L
        w, h = c['w'], c['h']
        kind = key.rstrip('0123456789'); i = int(key[len(kind):])
        if kind == 'board':
            lessons = B['lessons']['east' if sheet == 'east' else 'west']
            if i >= len(lessons): continue
            les = lessons[i]
            lines = [les['t']] + les['l']
            comp = '{text:"",extra:[' + f'{{text:"{esc(les["t"])}\\n",color:"{YELLOW}"}},{{text:"{esc(chr(10).join(les["l"]))}",color:"{CHALK}"}}' + ']}'
            bg = BOARD; margin = 0.12
        elif kind == 'art':
            if i >= len(B['art']) and B['art']: i %= len(B['art'])
            title = B['art'][i % len(B['art'])]
            sym = SYMBOL[i % len(SYMBOL)]                              # the drawing, as a sign of the font
            lines = [f'{sym}  {title}  {sym}']
            comp = f'{{text:"{esc(lines[0])}",color:"{CHALKS[i % len(CHALKS)]}"}}'
            bg = BOARD; margin = 0.1
        else:
            slogan = B['slogans'][i % len(B['slogans'])]
            red = i % 2 == 0
            lines = [slogan]
            comp = f'{{text:"{esc(slogan)}",color:"{"#f6d860" if red else "#c3201b"}"}}'
            bg = 0xFFC3201B if red else 0xFFF7F4EA; margin = 0.02
        s = min((h - margin) / (len(lines) * LINE), (w - 2 * margin) / (max(px(l) for l in lines) * 0.025 + 0.1), 1.2)
        if s <= 0.05: continue
        if kind == 'board':                                          # spaces after the title widen the ground to the card's
            pad = int(((w - 2 * margin) / (0.025 * s) - px(les['t'])) / 4)
            if pad > 0: comp = comp.replace(f'{esc(les["t"])}\\n', f'{esc(les["t"])}{" " * pad}\\n', 1)
        # the wall's face in the map along the card's facing: the last solid-to-air step from 1.5 m behind the card
        mid = cy
        best, prev = None, is_solid(cx - nx * 1.5, mid, cz - nz * 1.5)
        for k in range(1, 51):                                       # up to 1 m in front of the card: the wall, not a desk
            t = -1.5 + k * 0.05
            cur = is_solid(cx + nx * t, mid, cz + nz * t)
            if prev and not cur: best = t
            prev = cur
        if best is None: n['no wall'] = n.get('no wall', 0) + 1; continue
        t = best + 0.03
        x_, z_ = cx + nx * t, cz + nz * t
        # at one metre a card near a ceiling can fall inside the floor block above (or a low one inside a desk): move
        # it up or down, by up to a metre, to where its height is air in front of the wall
        y0, th = cy - h / 2 + margin / 2, len(lines) * LINE * s
        fx, fz = x_ + nx * 0.2, z_ + nz * 0.2
        free = lambda y: not is_solid(fx, y + 0.05, fz) and not is_solid(fx, y + th - 0.05, fz) and not is_solid(fx, y + th / 2, fz)
        dy = next((d for d in (0, -0.25, 0.25, -0.5, 0.5, -0.75, 0.75, -1.0, 1.0) if free(y0 + d)), None)
        if dy is None: n['buried'] = n.get('buried', 0) + 1; continue
        if dy: n['moved'] = n.get('moved', 0) + 1
        y_ = y0 + dy + 64
        yaw = math.degrees(math.atan2(-nx, nz))
        cmds.append(f'summon minecraft:text_display {x_:.3f} {y_:.3f} {z_:.3f} {{text:{comp},background:{signed(bg)},billboard:"fixed",shadow:0b,'
                    f'line_width:2000,alignment:"{"left" if kind == "board" else "center"}",Rotation:[{yaw:.1f}f,0f],'
                    f'transformation:{{left_rotation:[0f,0f,0f,1f],right_rotation:[0f,0f,0f,1f],translation:[0f,0f,0f],scale:[{s:.3f}f,{s:.3f}f,{s:.3f}f]}}}}')
        n[kind] = n.get(kind, 0) + 1
    with open(out, 'a', encoding='utf-8') as f: f.write('\n'.join(cmds) + '\n')
    print('boards:', ', '.join(f'{k} {v}' for k, v in n.items()))

if __name__ == '__main__':
    main()
