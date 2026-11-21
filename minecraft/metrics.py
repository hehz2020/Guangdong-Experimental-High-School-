#!/usr/bin/env python3
"""Counts what a version must keep, so that nothing goes missing without notice (the pitch lines were lost from v6 to
v10 before anyone saw it).

usage: python minecraft/metrics.py <blocks.npz>
Prints each count with the least it should be, and exits 1 if one falls short.
"""
import sys
import numpy as np

CHECKS = [
    # name, test on the block state, box (x0, x1, z0, z1, y0, y1 in game blocks) or None, at least
    ('pitch lines (white on the field)', lambda p: p == 'white_concrete', (-35, 35, -60, 60, 63, 63), 500),
    ('bookshelves', lambda p: p == 'bookshelf', None, 400),
    ('beds (blocks, two per bed)', lambda p: p.split('[')[0].endswith('_bed'), None, 800),
    ('doors (blocks, two per door)', lambda p: p.split('[')[0].endswith('_door'), None, 400),
    ('invisible lights', lambda p: p.startswith('light['), None, 1000),
    ('ladders', lambda p: p.startswith('ladder'), None, 30),
    ('carpets (seats)', lambda p: p.split('[')[0].endswith('_carpet'), None, 500),
    ('leaves', lambda p: '_leaves' in p, None, 20000),
    ('water', lambda p: p.startswith('water'), None, 1000),
    ('glass and panes', lambda p: 'glass' in p, None, 9000),
    ('sea lanterns and glowstone (lamps)', lambda p: p in ('sea_lantern', 'glowstone', 'shroomlight'), None, 300),
]

def main():
    d = np.load(sys.argv[1])
    st, pal, box = d['states'], [str(p) for p in d['pal']], d['box']
    X0, X1, Z0, Z1, Y0, Y1 = box
    ok = True
    for name, test, b, least in CHECKS:
        ids = np.array([test(p) for p in pal])
        if b:
            x0, x1, z0, z1, y0, y1 = b
            sub = st[y0 - 64 - int(Y0):y1 - 64 - int(Y0) + 1, z0 - int(Z0):z1 - int(Z0) + 1, x0 - int(X0):x1 - int(X0) + 1]
        else:
            sub = st
        n = int(ids[sub].sum())
        good = n >= least
        ok &= good
        print(f"{'ok  ' if good else 'LOW '} {name}: {n} (at least {least})")
    sys.exit(0 if ok else 1)

if __name__ == '__main__':
    main()
