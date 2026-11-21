#!/usr/bin/env python3
"""The 3D campus's lettering as text displays (minecraft:text_display) in front of the walls that carry it.

usage: python minecraft/lettering.py <lettering.json> <blocks.npz> <commands.txt>

lettering.json lists each piece of lettering of the 3D campus with its box (x0, y0, z0, x1, y1, z1 in world metres, as
the meshes of the 3D site measure) and the way it faces (n). At one metre a 2 m character is two blocks and cannot be
read, so the letters are text displays instead: the game's font, scaled to the 3D lettering's height (about 0.2 m per
character at scale 1 for Chinese, 0.175 m for Latin capitals, 0.025 m per font pixel across), set 0.03 m in front of the
first block face the wall has in the map along n, turned to face n (text displays show from the front only), anchored at
the lettering's foot. The font is the game's (the 3D site's brush lettering is not).
"""
import json, math, sys
import numpy as np

def main():
    spec, src, out = sys.argv[1:4]
    d = np.load(src)
    st, pal, box = d['states'], [str(p) for p in d['pal']], d['box']
    X0, X1, Z0, Z1, Y0, Y1 = box
    solid = np.array([not (p == 'air' or p.startswith(('water', 'light['))) for p in pal])
    S = solid[st]
    NY, NZ, NX = st.shape
    def is_solid(x, h, z):
        bx, by, bz = int(math.floor(x - X0)), int(math.floor(h - Y0)), int(math.floor(z - Z0))
        return 0 <= bx < NX and 0 <= by < NY and 0 <= bz < NZ and bool(S[by, bz, bx])
    cmds = []
    for e in json.load(open(spec)):
        x0, y0, z0, x1, y1, z1 = e['box']
        nx, _, nz = e['n']; L = math.hypot(nx, nz); nx, nz = nx / L, nz / L
        cx, cz, H = (x0 + x1) / 2, (z0 + z1) / 2, y1 - y0
        W = math.hypot(x1 - x0, z1 - z0)
        text = e['text']
        px = sum(9 if ord(ch) > 0x2e80 else 6 for ch in text)
        per_h = 0.175 if e.get('latin') else 0.2
        s = H / per_h
        if W > 0.5: s = min(s, W / (px * 0.025))
        # the wall's face in the map: from 1.5 m behind the 3D lettering forward, the last solid-to-air step
        mid = y0 + H / 2
        best = None
        prev = is_solid(cx - nx * 1.5, mid, cz - nz * 1.5)
        for k in range(1, 81):
            t = -1.5 + k * 0.05
            cur = is_solid(cx + nx * t, mid, cz + nz * t)
            if prev and not cur: best = t
            prev = cur
        t = (best if best is not None else 0.0) + 0.03
        px_, pz_ = cx + nx * t, cz + nz * t
        yaw = math.degrees(math.atan2(-nx, nz))
        bg = e.get('background')
        bgv = (0xFF << 24 | int(bg[1:], 16)) if bg else 0
        if bgv >= 1 << 31: bgv -= 1 << 32
        nbt = (f'{{text:{{text:"{text}",color:"{e["color"]}"}},background:{bgv},billboard:"fixed",shadow:0b,line_width:4000,'
               f'Rotation:[{yaw:.1f}f,0f],transformation:{{left_rotation:[0f,0f,0f,1f],right_rotation:[0f,0f,0f,1f],'
               f'translation:[0f,0f,0f],scale:[{s:.3f}f,{s:.3f}f,{s:.3f}f]}}}}')
        cmds.append(f'summon minecraft:text_display {px_:.3f} {y0 + 64:.3f} {pz_:.3f} {nbt}')
        print(f"{e['where']}: at {px_:.2f} {y0 + 64:.2f} {pz_:.2f}, yaw {yaw:.0f}, scale {s:.2f}, wall face {'found' if best is not None else 'not found'}")
    open(out, 'w', encoding='utf-8').write('\n'.join(cmds) + '\n')

if __name__ == '__main__':
    main()
