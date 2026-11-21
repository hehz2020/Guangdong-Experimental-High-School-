#!/usr/bin/env python3
"""Doorways the 1 m grid closed: candidates for carve.mjs, and the cells to open from its answers.

At one metre a door 0.9-1.5 m wide often has no whole block column free: the jambs on either side each claim the block
they touch. Here, every blocked cell at foot height with room to stand on both opposite sides (one or two blocks of
wall between them) is a candidate; carve.mjs asks the 3D campus's own collision whether a person fits there. Free
candidates that come as a long run along a wall are a wall lying on a block edge, not a door, and stay closed.

usage: python minecraft/doorways.py candidates <blocks.npz> <cands.json>
       python minecraft/doorways.py open <cands.json> <free.json> <open.json>
cands.json: [[mc_x, mc_y, mc_z, h, axis, depth], ...] (h: the 3D height of the floor; axis 'x' or 'z': the direction one
walks through; depth: 1 or 2 blocks of wall). open.json: [[mc_x, mc_y, mc_z, axis, run, depth], ...] cells to clear, two blocks high (run: the doorway's width).
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
    # wall-like: whole blocks, panes and bars; not leaves, logs, lamps or plants (slabs and stairs are furniture or steps)
    # (glass and bars count: glass doors and gates are walls here; the 3D collision says which are open)
    wallish = np.array([p != 'air' and (('[' not in p) or 'pane' in p or 'iron_bars' in p) and not any(k in p.split('[')[0] for k in ('leaves', '_log', 'lantern', 'glowstone', 'shroomlight', 'water'))
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
    # probes: the candidates and, along the wall, the four cells either side (a door needs solid wall at both ends)
    probes = {}
    for c in uniq:
        x, y, z, h, axis, depth = c
        dz, dx = (1, 0) if axis == 'x' else (0, 1)              # along the wall
        for k in range(-4, 5):
            key = (x + k * dx, y, z + k * dz)
            if key not in probes or k == 0: probes[key] = (h, axis)
    plist = [[x, y, z, h, axis] for (x, y, z), (h, axis) in probes.items()]
    json.dump(uniq, open(out, 'w')); json.dump(plist, open(out.replace('.json', '_probes.json'), 'w'))
    print(f'{len(uniq)} candidate cells, {len(plist)} probes')

def open_cells(cands_f, free_f, out):
    cands = json.load(open(cands_f)); probes = json.load(open(cands_f.replace('.json', '_probes.json'))); free = json.load(open(free_f))
    fr = {(p[0], p[1], p[2]): f for p, f in zip(probes, free)}
    ok = {(c[0], c[1], c[2]): c for c in cands if fr.get((c[0], c[1], c[2]))}
    # runs along the wall: a door is at most 3 blocks wide
    keep = []
    for (x, y, z), c in ok.items():
        along = (1, 0) if c[4] == 'x' else (0, 1)          # (dz, dx): walking along x -> the wall runs along z
        run, ends_solid = 1, True
        for sgn in (1, -1):
            k = 1
            while (x + sgn * k * along[1], y, z + sgn * k * along[0]) in ok:
                run += 1; k += 1
            # beyond the run, within four cells, the wall must exist in the 3D campus (blocked there): a real wall with a
            # gap, not a solid thing the 3D campus has no collision for
            if all(fr.get((x + sgn * j * along[1], y, z + sgn * j * along[0]), 1) for j in range(k, 5)): ends_solid = False
        if run <= 4 and ends_solid: keep.append([x, y, z, c[4], run, c[5]])
    json.dump(keep, open(out, 'w'))
    print(f'{len(ok)} free in the 3D campus, {len(keep)} to open (runs of 4 or fewer, wall in the 3D campus on both sides)')

if __name__ == '__main__':
    if sys.argv[1] == 'candidates': candidates(sys.argv[2], sys.argv[3])
    else: open_cells(sys.argv[2], sys.argv[3], sys.argv[4])
