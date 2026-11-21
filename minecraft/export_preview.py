#!/usr/bin/env python3
"""Exports the blocks saved by build_world.py --blocks for preview.mjs: only blocks with an exposed face.

usage: python minecraft/export_preview.py <blocks.npz> <out.bin>
Format: uint32 n, float32 X0, Y0, Z0 (world metres of grid cell 0); n records of int16 x, y, z, uint8 rotation (unused),
uint8 shape; then n uint32 colours 0xRRGGBB.
"""
import os, struct, sys
import numpy as np
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from blocks import color_of  # noqa: E402

def shape_of(state):
    base = state.split('[')[0]
    if base == 'water': return 5
    if base.endswith('_leaves'): return 7
    if base == 'lantern': return 11 if 'hanging=true' in state else 10
    if base.endswith('_wall'): return 12
    if base.endswith('_pane') or base == 'iron_bars':
        return 4 if any(f'{d}=true' in state for d in ('north', 'south', 'east', 'west')) else 9
    if base.endswith('glass'): return 6
    if base.endswith('_slab'): return 2 if 'type=top' in state else 1
    if base.endswith('_stairs'): return 3
    return 0

def main():
    src, out = sys.argv[1:3]
    d = np.load(src)
    st, pal, box = d['states'], [str(p) for p in d['pal']], d['box']
    X0, X1, Z0, Z1, Y0, Y1 = box
    NY, NZ, NX = st.shape
    shapes = np.array([shape_of(p) for p in pal], np.uint8)
    opaque = np.array([shape_of(p) in (0, 3) and p != 'air' for p in pal])
    occ = opaque[st]
    exposed = np.zeros_like(occ)
    pad = np.pad(occ, 1, constant_values=False)
    for dy, dz, dx in ((1, 0, 0), (-1, 0, 0), (0, 1, 0), (0, -1, 0), (0, 0, 1), (0, 0, -1)):
        exposed |= ~pad[1 + dy:1 + dy + NY, 1 + dz:1 + dz + NZ, 1 + dx:1 + dx + NX]
    invisible = np.array([p.startswith('light[') for p in pal])
    keep = (st > 0) & (exposed | ~occ) & ~invisible[st]
    ys, zs, xs = np.nonzero(keep)
    ids = st[ys, zs, xs]
    # panes and bars: one thin plate per axis they connect along (shape 4 = runs north-south, 8 = runs east-west)
    ns = np.array([('north=true' in p or 'south=true' in p) for p in pal]); ew = np.array([('east=true' in p or 'west=true' in p) for p in pal])
    k = shapes[ids].copy()
    thin = k == 4
    extra = thin & ew[ids] & ns[ids]
    k[thin & ew[ids] & ~ns[ids]] = 8
    xs, ys, zs, ids = np.concatenate([xs, xs[extra]]), np.concatenate([ys, ys[extra]]), np.concatenate([zs, zs[extra]]), np.concatenate([ids, ids[extra]])
    k = np.concatenate([k, np.full(int(extra.sum()), 8, np.uint8)])
    cols = np.array([(lambda c: (c[0] << 16) | (c[1] << 8) | c[2])(color_of(p.split('[')[0])) for p in pal], np.uint32)
    n = len(xs)
    rec = np.zeros(n, dtype=[('x', '<i2'), ('y', '<i2'), ('z', '<i2'), ('r', 'u1'), ('k', 'u1')])
    rec['x'], rec['y'], rec['z'], rec['k'] = xs, ys, zs, k
    with open(out, 'wb') as f:
        f.write(struct.pack('<Ifff', n, float(X0), float(Y0), float(Z0)))
        f.write(rec.tobytes()); f.write(cols[ids].astype('<u4').tobytes())
    print(f'{n} exposed blocks written to {out}')

if __name__ == '__main__':
    main()
