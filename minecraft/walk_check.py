#!/usr/bin/env python3
"""Can a player walk from the spawn to each place? A rough check on the block grid saved by build_world.py --blocks.

usage: python minecraft/walk_check.py <blocks.npz> <spawn x,z> <targets.json>
targets.json: [[name, x, h, z], ...] in world metres (h = height of the floor the place stands on).

Model: a player stands in a cell whose block and the block above it let a body through, over a block that holds it
up (half a block lower over a bottom slab or stairs). From there it may walk to a side cell, stepping up to 0.6 of a
block, jump up to 1.25 if there is room above its head, or drop down up to four blocks. Doors, carpets, flowers, beds
and open trapdoors let a body through; water counts as passable (the player can swim). The check ignores the half
heights of slabs and the space a jump needs above the head, so it is generous: a "yes" here can still need a careful
jump in the game, but a "no" means there is no way in at all.
"""
import json, math, sys
from collections import deque
import numpy as np

PASS_PREFIX = ('air', 'water', 'light[')
PASS_SUFFIX = ('_carpet', '_door', 'ladder', 'tulip', 'poppy', 'daisy', 'bluet', 'dandelion', 'torch', 'button', 'sign', 'banner')

def main():
    src, spawn, targets = sys.argv[1], sys.argv[2], json.load(open(sys.argv[3]))
    seen, stand, (X0, X1, Z0, Z1, Y0, Y1) = reach(src, spawn)
    NY, NZ, NX = seen.shape
    report(seen, stand, targets, X0, Z0, Y0, NY, NZ, NX)

def reach(src, spawn):
    d = np.load(src)
    return reach_grid(d['states'], [str(p) for p in d['pal']], d['box'], spawn)

def reach_grid(st, pal, box, spawn):
    X0, X1, Z0, Z1, Y0, Y1 = box
    NY, NZ, NX = st.shape
    passable_pal = np.array([p.startswith(PASS_PREFIX) or p.split('[')[0].endswith(PASS_SUFFIX) for p in pal])
    support_pal = np.array([not (p.startswith(PASS_PREFIX) or p.split('[')[0].endswith(PASS_SUFFIX[1:])) and p != 'air' for p in pal])
    P = passable_pal[st]; S = support_pal[st]
    # the ground under the box (row -1) holds a player up
    below = np.concatenate([np.ones((1, NZ, NX), bool), S[:-1]], axis=0)
    above = np.concatenate([P[1:], np.ones((1, NZ, NX), bool)], axis=0)
    stand = P & above & below
    # ladders: a player holds on anywhere up a ladder and climbs it
    L = np.array([p.startswith('ladder') for p in pal])[st]
    stand |= L
    # the height a player stands at in a cell: half a block lower over a bottom slab (stairs count as a half step too)
    half_pal = np.array(['_slab[type=bottom' in p or '_stairs[' in p for p in pal])
    lowered = np.concatenate([np.zeros((1, NZ, NX), bool), half_pal[st][:-1]], axis=0)
    sx, sz = (float(v) for v in spawn.split(','))
    bx, bz = int(sx - X0), int(sz - Z0)
    ys = np.nonzero(stand[:, bz, bx])[0]
    if not len(ys): print('spawn column has nowhere to stand'); sys.exit(1)
    by0 = int(ys[np.argmin(np.abs(ys - (0 - Y0)))])
    seen = np.zeros_like(stand); q = deque([(by0, bz, bx)]); seen[by0, bz, bx] = True
    while q:
        y, z, x = q.popleft()
        for ny in (y + 1, y - 1):                                    # up or down a ladder
            if 0 <= ny < NY and (L[y, z, x] or L[ny, z, x]) and stand[ny, z, x] and not seen[ny, z, x]:
                seen[ny, z, x] = True; q.append((ny, z, x))
        for dz, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nz, nx = z + dz, x + dx
            if not (0 <= nz < NZ and 0 <= nx < NX): continue
            for ny in (y, y + 1, y - 1, y - 2, y - 3, y - 4):
                if not (0 <= ny < NY) or not stand[ny, nz, nx]: continue
                rise = (ny - 0.5 * lowered[ny, nz, nx]) - (y - 0.5 * lowered[y, z, x])
                if rise > 1.25: continue
                if rise > 0.6 and not (y + 2 < NY and P[y + 2, z, x]): continue     # a jump needs head room
                if ny < y and not all(P[k, nz, nx] for k in range(ny, y + 1)): continue
                if not seen[ny, nz, nx]: seen[ny, nz, nx] = True; q.append((ny, nz, nx))
                break
    return seen, stand, (X0, X1, Z0, Z1, Y0, Y1)

def report(seen, stand, targets, X0, Z0, Y0, NY, NZ, NX):
    print(f'reachable standing cells: {int(seen.sum())} of {int(stand.sum())}')
    ok = 0
    for name, x, h, z in targets:
        tx, tz, ty = int(math.floor(x - X0)), int(math.floor(z - Z0)), int(math.floor(h - Y0))
        hit = None
        for r in (0, 1, 2):
            for ddy in (0, 1, -1, 2):
                for ddz in range(-r, r + 1):
                    for ddx in range(-r, r + 1):
                        y_, z_, x_ = ty + ddy, tz + ddz, tx + ddx
                        if 0 <= y_ < NY and 0 <= z_ < NZ and 0 <= x_ < NX and seen[y_, z_, x_]: hit = (x_, y_, z_); break
                    if hit: break
                if hit: break
            if hit: break
        mc = (int(X0) + tx, int(math.floor(Y0)) + ty + 64, int(Z0) + tz)
        print(('YES ' if hit else 'NO  ') + f'{name}  (block {mc[0]} {mc[1]} {mc[2]})')
        ok += bool(hit)
    print(f'reachable: {ok} of {len(targets)}')

if __name__ == '__main__':
    main()
