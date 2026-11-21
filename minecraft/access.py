#!/usr/bin/env python3
"""Doorways into the parts of buildings no stair or door of the map reaches (a storey cut off by a wall the 3D
campus passes through elsewhere, a wing whose door the voxels closed): for every such part of a storey, of at least
MIN standing places under a roof, one opening two blocks high through a wall one block thick into a place under a
roof on the same level that the player does reach; repeated while that opens more. Imagined: where the real door
is, the 3D campus does not always say, so these are where a door is shortest to make.

usage: python minecraft/access.py <blocks.npz> <spawn x,z> <access.json>
access.json takes the form of fixes.json (build_world.py --fixes reads both).
"""
import json, os, sys
import numpy as np
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from walk_check import reach_grid, PASS_PREFIX, PASS_SUFFIX  # noqa: E402

MIN, ROUNDS = 60, 8

def main():
    src, spawn, out = sys.argv[1:4]
    d = np.load(src)
    st, pal, box = d['states'].copy(), [str(p) for p in d['pal']], d['box']
    X0, X1, Z0, Z1, Y0, Y1 = (int(v) for v in box)
    NY, NZ, NX = st.shape
    if 'air' not in pal: pal.append('air')
    AIR = pal.index('air')
    air = np.array([p == 'air' or p.startswith('light[') for p in pal])
    passable = np.array([p.startswith(PASS_PREFIX) or p.split('[')[0].endswith(PASS_SUFFIX) for p in pal])
    wallish = np.array([not passable[i] and not any(t in p for t in ('glass', 'pane', '_leaves', '_log', '_door', 'ladder', 'lantern', 'bed', 'water'))
                        for i, p in enumerate(pal)])
    ops = []
    for rnd in range(ROUNDS):
        seen, stand, _ = reach_grid(st, pal, box, spawn)
        A = air[st]
        cov = np.zeros_like(stand)
        for k in range(2, 7): cov[:-k] |= ~A[k:]
        un = stand & ~seen & cov
        ys, zs, xs = np.nonzero(un)
        cells = set(zip(ys.tolist(), zs.tolist(), xs.tolist()))
        done, opened = set(), 0
        for c in sorted(cells):
            if c in done: continue
            comp, q = [], [c]; done.add(c)
            while q:
                y, z, x = q.pop(); comp.append((y, z, x))
                for dz, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    nb = (y, z + dz, x + dx)
                    if nb in cells and nb not in done: done.add(nb); q.append(nb)
            if len(comp) < MIN: continue
            W = wallish[st]
            pick = None
            for y, z, x in comp:
                for dz, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    wz, wx, oz, ox = z + dz, x + dx, z + 2 * dz, x + 2 * dx
                    if not (0 <= oz < NZ and 0 <= ox < NX) or y + 1 >= NY: continue
                    if W[y, wz, wx] and W[y + 1, wz, wx] and seen[y, oz, ox] and cov[y, oz, ox]:
                        pick = (y, wz, wx); break
                if pick: break
            if not pick: continue
            y, wz, wx = pick
            st[y, wz, wx] = AIR; st[y + 1, wz, wx] = AIR
            gx, gy, gz = wx + X0, y + Y0 + 64, wz + Z0
            ops.append({'op': 'fill', 'from': [gx, gy, gz], 'to': [gx, gy + 1, gz], 'block': 'air'})
            opened += 1
        print(f'round {rnd + 1}: {opened} doorways')
        if not opened: break
    seen, stand, _ = reach_grid(st, pal, box, spawn)
    print(f'reachable standing cells after: {int(seen.sum())}')
    json.dump([{'why': 'access.py：走不到的楼层部分（一层里被墙隔开、门被体素封住的地方）各开一个两格高的门洞，通到同一层走得到的室内', 'ops': ops}],
              open(out, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print(f'{len(ops)} doorways written to {out}')

if __name__ == '__main__':
    main()
