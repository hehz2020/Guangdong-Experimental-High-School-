#!/usr/bin/env python3
"""Basketball hoops where the 3D campus has its backboards (hoops.mjs: the gym's six, the courts' sixteen), the way
they are built in the game: a backboard of white glass panes, two blocks wide and two high, its lower row at the
height of the rim, and a hopper in front of it as the ring and net. The board faces its court: toward the board at the
other end of the same court (about 25 m away along the board's axis). At one metre the 3D board (1.8 by 1.05 m, a
ring 0.45 m across) had become a few stray blocks.

usage: python minecraft/hoops.py <hoops.json> <blocks.npz> <commands.txt>   (appends setblock commands)
CHOSEN: the hopper (the game's usual ring), the 2 x 2 board, the rim row (0.3 m under the 3D rim's height).
"""
import json, math, sys
import numpy as np

def main():
    spec, src, out = sys.argv[1:4]
    H = json.load(open(spec))
    d = np.load(src)
    st, pal, box = d['states'], [str(p) for p in d['pal']], d['box']
    X0, X1, Z0, Z1, Y0, Y1 = box
    cmds, n, skipped = [], 0, 0
    for b in H:
        cx, cy, cz = b['c']; nx, _, nz = b['n']
        along_z = abs(nz) >= abs(nx)
        # facing: toward the other board of the same court
        mate = [o for o in H if o is not b and (abs(o['c'][0] - cx) < 1.5 if along_z else abs(o['c'][2] - cz) < 1.5)
                and 18 < (abs(o['c'][2] - cz) if along_z else abs(o['c'][0] - cx)) < 32]
        if not mate: skipped += 1; continue
        o = min(mate, key=lambda o: abs(o['c'][2] - cz) if along_z else abs(o['c'][0] - cx))
        fx, fz = (0, 1 if o['c'][2] > cz else -1) if along_z else (1 if o['c'][0] > cx else -1, 0)
        tx, tz = -fz, fx                                         # along the board
        rim = cy - b['h'] / 2 + 0.15                             # the 3D rim: 0.15 m over the board's lower edge
        r0 = int(math.floor(rim - 0.3)) + 64                     # block row of the hopper and the board's lower row
        bx, bz = math.floor(cx), math.floor(cz)
        cells = [(math.floor(cx + tx * s), math.floor(cz + tz * s)) for s in (-0.45, 0.45)]
        pane = 'white_stained_glass_pane[east=true,north=false,south=false,waterlogged=false,west=true]' if along_z else \
               'white_stained_glass_pane[east=false,north=true,south=true,waterlogged=false,west=false]'
        for x, z in cells:
            for y in (r0, r0 + 1):
                cmds.append(f'setblock {x} {y} {z} minecraft:{pane}')
        hx, hz = math.floor(cx + fx * 0.9), math.floor(cz + fz * 0.9)
        cmds.append(f'setblock {hx} {r0} {hz} minecraft:hopper[enabled=true,facing=down]')
        n += 1
    open(out, 'a', encoding='utf-8').write('\n'.join(cmds) + '\n')
    print(f'basketball hoops: {n} (no court found for {skipped})')

if __name__ == '__main__':
    main()
