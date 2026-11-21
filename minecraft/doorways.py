#!/usr/bin/env python3
"""Doorways the 1 m grid closed: candidates for carve.mjs, and the cells to open from its answers.

At one metre a door 0.9-1.5 m wide often has no whole block column free: the jambs on either side each claim the block
they touch. Here, every blocked cell at foot height with room to stand on both opposite sides (one or two blocks of
wall between them) is a candidate; carve.mjs asks the 3D campus's own collision whether a person fits there. Free
candidates that come as a long run along a wall are a wall lying on a block edge, not a door, and stay closed.

usage: python minecraft/doorways.py candidates <blocks.npz> <cands.json>
       python minecraft/doorways.py open <cands.json> <free.json> <open.json>
cands.json: [[mc_x, mc_y, mc_z, h, axis, depth], ...] (h: the 3D height of the floor; axis 'x' or 'z': the direction one
walks through; depth: 1 or 2 blocks of wall). open.json: [[mc_x, mc_y, mc_z], ...] cells to clear, two blocks high.
"""
import json, math, sys
import numpy as np
sys.path.insert(0, __import__('os').path.dirname(__import__('os').path.abspath(__file__)))
from walk_check import PASS_PREFIX, PASS_SUFFIX  # noqa: E402

def candidates(src, out):
    d = np.load(src)
    st, pal, box = d['states'], [str(p) for p in d['pal']], d['box']
    X0, X1, Z0, Z1, Y0, Y1 = box
    NY, NZ, NX = st.shape
    passable = np.array([p.startswith(PASS_PREFIX) or p.split('[')[0].endswith(PASS_SUFFIX) for p in pal])
    support = np.array([p != 'air' and not (p.startswith(PASS_PREFIX) or p.split('[')[0].endswith(PASS_SUFFIX[1:])) for p in pal])
    # wall-like: whole blocks that are not glass, bars, leaves, logs, lamps or plants (slabs and stairs are furniture or steps)
    wallish = np.array([p != 'air' and '[' not in p and not any(k in p for k in ('glass', 'iron_bars', 'leaves', '_log', 'lantern', 'glowstone', 'shroomlight', 'water'))
                        for p in pal])
    P, S, W = passable[st], support[st], wallish[st]
    stand = np.zeros_like(P); stand[1:-1] = P[1:-1] & P[2:] & S[:-2]
    out_list = []
    for y in range(1, NY - 2):
        blocked = W[y] & W[y + 1] & S[y - 1]          # a wall two blocks high standing on a floor
        for axis, (dz, dx) in (('x', (0, 1)), ('z', (1, 0))):
            for depth in (1, 2):
                # cells (z, x) .. (z + (depth-1)dz, x + (depth-1)dx) blocked, stand before and after
                ok = np.ones((NZ, NX), bool)
                for k in range(depth):
                    sh = np.zeros((NZ, NX), bool)
                    zs, xs = slice(0, NZ - k * dz), slice(0, NX - k * dx)
                    sh[zs, xs] = blocked[k * dz:, k * dx:][:NZ - k * dz, :NX - k * dx]
                    ok &= sh
                before = np.zeros((NZ, NX), bool); before[dz:, dx:] = stand[y][:NZ - dz, :NX - dx]
                after = np.zeros((NZ, NX), bool)
                ez, ex = depth * dz, depth * dx
                after[:NZ - ez, :NX - ex] = stand[y][ez:, ex:]
                ok &= before & after
                for z, x in zip(*np.nonzero(ok)):
                    for k in range(depth):
                        zz, xx = z + k * dz, x + k * dx
                        out_list.append([int(X0) + int(xx), int(math.floor(Y0)) + y + 64, int(Z0) + int(zz), float(Y0 + y), axis, depth])
    seen, uniq = set(), []
    for c in out_list:
        k = (c[0], c[1], c[2])
        if k not in seen: seen.add(k); uniq.append(c)
    json.dump(uniq, open(out, 'w'))
    print(f'{len(uniq)} candidate cells')

def open_cells(cands_f, free_f, out):
    cands, free = json.load(open(cands_f)), json.load(open(free_f))
    ok = {(c[0], c[1], c[2]): c for c, f in zip(cands, free) if f}
    # runs along the wall: a door is at most 3 blocks wide
    keep = []
    for (x, y, z), c in ok.items():
        along = (1, 0) if c[4] == 'x' else (0, 1)          # (dz, dx): walking along x -> the wall runs along z
        run = 1
        for sgn in (1, -1):
            k = 1
            while (x + sgn * k * along[1], y, z + sgn * k * along[0]) in ok:
                run += 1; k += 1
        if run <= 3: keep.append([x, y, z])
    json.dump(keep, open(out, 'w'))
    print(f'{len(ok)} free in the 3D campus, {len(keep)} to open (runs of 3 or fewer)')

if __name__ == '__main__':
    if sys.argv[1] == 'candidates': candidates(sys.argv[2], sys.argv[3])
    else: open_cells(sys.argv[2], sys.argv[3], sys.argv[4])
