#!/usr/bin/env python3
"""Builds a Minecraft Java Edition world (1.21 format) from the voxels of voxelize.mjs.

usage: python minecraft/build_world.py <vox.json> [<vox.json> ...] --out <world dir> [--name NAME] [--spawn x,z,yaw] [--blocks out.npz]
       (several files: the tiles of one box, written by voxelize.mjs --tile)

Scale 1:1: one block is one metre. World x and z are the campus's x (east) and z (south), so block coordinates in the
game are the same numbers as in the 3D campus; height h in metres becomes block y = floor(h) + 64 (the ground's top is
at y 64, and the world below the voxel box is dirt, stone and bedrock).

Per block the material with the largest sampled area wins (top surfaces count a little more, so paving beats the ground
under it); then its shape is chosen from the eight 0.5 m sub-cells that were hit:
  - lower half only -> bottom slab, upper half only -> top slab, full lower half and one side of the upper -> stairs;
  - glass that is thin in x or z -> glass pane; thin or sparse metal -> iron bars;
  - everything else, and everything at or below the ground's top, -> a full block.
Panes and bars get their connections from their neighbours (the game would only work them out on a block update).
Water is filled down from its surface to the first solid block. Leaves are made persistent so that they never decay.

Needs: Python 3.9+, numpy, nbtlib (pip install numpy nbtlib).
"""
import argparse, base64, io, json, math, os, re, struct, sys, time, zlib
import numpy as np
import nbtlib
from nbtlib.tag import Compound, List, String, Int, Byte, Long, Float, LongArray

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from blocks import block_for, shaped, slab_capable_near  # noqa: E402

DATA_VERSION, VERSION_NAME = 3953, '1.21'     # older than most games in use: newer games upgrade it on load
GROUND_Y = 64                                 # block y of the first block above the ground (h 0..1)
MIN_Y = -64

CAT_WEIGHT = {'named': 1.3, 'fabric': 1.0, 'turf': 1.5, 'flowers': 0.9, 'water': 3.0, 'glass': 1.3, 'lamp': 2.0, 'leaves': 0.7, 'metal': 1.0, 'wood': 1.0, 'solid': 1.0,
              'ground': 0.3, 'pave': 1.0, 'log': 1.2}   # ground loses to anything laid on it
MIN_AREA = {'leaves': 0.20, 'metal': 0.03, 'lamp': 0.02, 'glass': 0.08, 'water': 0.05}

def dec(s, dt):
    return np.frombuffer(base64.b64decode(s), dtype=dt)

def popcount8(m):
    return bin(m).count('1')

def thin_vertical(mask):
    """All hit sub-cells on one x half or one z half (a plane standing up)."""
    for half in (0x55, 0xAA, 0x33, 0xCC):
        if mask & ~half & 0xFF == 0:
            return half
    return 0

def choose(vox):
    """Per block the winner among the blocks its materials stand for: materials that become the same block are counted
    together first (two tones of turf, a texture split into several materials), then the largest area wins, top
    surfaces a little ahead. Returns the winning (category, block) per block, its area and the hit sub-cells."""
    X0, X1, Z0, Z1, Y0, Y1 = vox['box']
    NX, NY, NZ = vox['size']
    mats = vox['mats']
    blk, mid, area, sub, hy = dec(vox['blk'], np.int32), dec(vox['mid'], np.uint16), dec(vox['area'], np.float32), dec(vox['sub'], np.uint8), dec(vox['hy'], np.uint8)
    minfo = [block_for(m) for m in mats]
    keys, info, mkey = {}, [], []
    for c, b in minfo:
        k = (c, b)
        if k not in keys: keys[k] = len(info); info.append(k)
        mkey.append(keys[k])
    mkey = np.array(mkey, np.int64)
    # base layers under a finished surface (the infield's apron under the turf): they only win where nothing lies on them
    wmat = np.array([0.4 if re.search(r'apron', m['name']) else 1.0 for m in mats], np.float32)
    kid = mkey[mid]
    K = len(info)
    comb = blk.astype(np.int64) * K + kid
    uniq, inv = np.unique(comb, return_inverse=True)
    a2 = np.zeros(len(uniq), np.float32); np.add.at(a2, inv, area)
    w2 = np.zeros(len(uniq), np.float32); np.add.at(w2, inv, area * wmat[mid])
    h2 = np.zeros(len(uniq), np.float32); np.add.at(h2, inv, area * hy.astype(np.float32))
    s2 = np.zeros(len(uniq), np.uint8); np.bitwise_or.at(s2, inv, sub)
    blk2, kid2 = (uniq // K).astype(np.int64), (uniq % K).astype(np.int64)
    hy2 = h2 / np.maximum(a2, 1e-6)
    cat = np.array([CAT_WEIGHT.get(c, 0.0) if b else 0.0 for c, b in info], dtype=np.float32)
    cat[[i for i, (c, b) in enumerate(info) if c == 'line']] = 0.0
    score = w2 * cat[kid2] * (0.6 + hy2 / 255.0 * 0.8)
    keep = (score > 0) | np.array([info[k][0] == 'line' for k in kid2], bool)
    blk2, kid2, a2, s2, score = blk2[keep], kid2[keep], a2[keep], s2[keep], score[keep]
    order = np.lexsort((-score, blk2))
    blk2, kid2, a2, s2 = blk2[order], kid2[order], a2[order], s2[order]
    first = np.ones(len(blk2), bool); first[1:] = blk2[1:] != blk2[:-1]
    first &= score > 0
    # the sub-cells of a block are the union over every block kind that is not skipped and covers enough
    union = np.zeros(NX * NY * NZ, np.uint8)
    np.bitwise_or.at(union, blk2[a2 > 0.05], s2[a2 > 0.05])
    grid = np.full(NX * NY * NZ, -1, np.int32)       # winning (category, block) per block, as an index into info
    garea = np.zeros(NX * NY * NZ, np.float32)
    grid[blk2[first]] = kid2[first]; garea[blk2[first]] = a2[first]
    # painted lines (pitch, roads, the gym floor): they cover a few hundredths of a block and never win; kept apart
    is_line = np.array([c == 'line' or (c == 'named' and b == 'bookshelf') for c, b in info])
    # thin pitch and court lines count from 3 hundredths of a block; road markings (broad stripes, closely spaced) from a quarter
    lmin = np.array([0.25 if (c == 'line' and b in ('white_concrete', 'yellow_concrete') and any(re.search(r'road', mats[i]['name']) for i in range(len(mats)) if mkey[i] == k)) else 0.08 if b == 'bookshelf' else 0.03
                     for k, (c, b) in enumerate(info)], np.float32)
    lsel = is_line[kid2] & (a2 >= lmin[kid2])
    lgrid = np.full(NX * NY * NZ, -1, np.int32)
    lgrid[blk2[lsel]] = kid2[lsel]
    return grid.reshape(NY, NZ, NX), garea.reshape(NY, NZ, NX), union.reshape(NY, NZ, NX), info, lgrid.reshape(NY, NZ, NX)

def build_states(vox, PAL, PIDX):
    """Blocks of one voxel file, as indices into the shared palette PAL (0 = air)."""
    X0, X1, Z0, Z1, Y0, Y1 = vox['box']
    NX, NY, NZ = vox['size']
    grid, garea, union, info, lgrid = choose(vox)
    states = np.zeros((NY, NZ, NX), np.int32)       # index into PAL; 0 = air
    def sid(s):
        if s not in PIDX: PIDX[s] = len(PAL); PAL.append(s)
        return PIDX[s]
    kinds = np.zeros((NY, NZ, NX), np.uint8)          # 1 pane, 2 bars, 3 water, 4 solid full, 5 leaves, 6 other
    y_of = lambda by: int(math.floor(Y0 + by)) + GROUND_Y
    for by in range(NY):
        ymc = y_of(by)
        for bz in range(NZ):
            row = grid[by, bz]
            for bx in np.nonzero(row >= 0)[0]:
                m = int(row[bx]); c, base = info[m]
                a = float(garea[by, bz, bx]); mask = int(union[by, bz, bx])
                if base is None or a < MIN_AREA.get(c, 0.12):
                    continue
                lower, upper = mask & 0x0F, mask >> 4
                if c == 'water':
                    states[by, bz, bx] = sid('water[level=0]'); kinds[by, bz, bx] = 3; continue
                if c == 'flowers':
                    # a flower stands on the block below; a bed raised in a planter keeps its soil block
                    if by == 0 or kinds[by - 1, bz, bx] == 8: continue          # never a flower on a flower
                    below = PAL[states[by - 1, bz, bx]].split('[')[0]
                    if below not in ('grass_block', 'dirt', 'coarse_dirt', 'podzol'):
                        states[by - 1, bz, bx] = sid('coarse_dirt'); kinds[by - 1, bz, bx] = 4
                    states[by, bz, bx] = sid(base); kinds[by, bz, bx] = 8; continue
                if c == 'leaves':
                    states[by, bz, bx] = sid(base + '[distance=1,persistent=true,waterlogged=false]'); kinds[by, bz, bx] = 5; continue
                if c == 'log':
                    states[by, bz, bx] = sid(base + '[axis=y]'); kinds[by, bz, bx] = 4; continue
                if c in ('lamp', 'ground', 'turf') or ymc < GROUND_Y:
                    states[by, bz, bx] = sid(base); kinds[by, bz, bx] = 4; continue
                if c == 'glass':
                    if thin_vertical(mask):
                        states[by, bz, bx] = sid(base + '_pane' if base != 'glass' else 'glass_pane'); kinds[by, bz, bx] = 1
                    else:
                        states[by, bz, bx] = sid(base); kinds[by, bz, bx] = 4
                    continue
                if c == 'metal' and (popcount8(mask) <= 3 or a < 0.8) and not (upper == 0 or lower == 0):   # poles, rails, thin frames
                    states[by, bz, bx] = sid('iron_bars'); kinds[by, bz, bx] = 7; continue      # 7: bars, never forced into a run
                # solid, wood, pave and thick metal: slabs and stairs where the shape asks for them
                if mask and (upper == 0 or lower == 0):
                    half = 'bottom' if upper == 0 else 'top'
                    sb = shaped(base, 'slab') or (lambda k: k and shaped(k, 'slab'))(slab_capable_near(base))
                    if sb:
                        states[by, bz, bx] = sid(f'{sb}[type={half},waterlogged=false]'); kinds[by, bz, bx] = 6; continue
                    if popcount8(mask) < 3 and a < 0.4:
                        continue
                if lower == 0x0F and upper in (0b0101, 0b1010, 0b0011, 0b1100):
                    st = shaped(base, 'stairs') or (lambda k: k and shaped(k, 'stairs'))(slab_capable_near(base))
                    if st:
                        facing = {0b0101: 'west', 0b1010: 'east', 0b0011: 'north', 0b1100: 'south'}[upper]
                        states[by, bz, bx] = sid(f'{st}[facing={facing},half=bottom,shape=straight,waterlogged=false]'); kinds[by, bz, bx] = 6; continue
                states[by, bz, bx] = sid(base); kinds[by, bz, bx] = 4
    # painted lines: where one crosses a block that is the top of a pitch, road or floor, the block takes its colour
    for by, bz, bx in zip(*np.nonzero(lgrid >= 0)):
        c, base = info[int(lgrid[by, bz, bx])]
        if base == 'bookshelf':                    # books on a shelf: the shelf's block becomes a bookshelf
            p = PAL[states[by, bz, bx]]
            if 'glass' not in p and 'pane' not in p:
                states[by, bz, bx] = sid('bookshelf'); kinds[by, bz, bx] = 4
            continue
        if by + 1 >= NY or states[by + 1, bz, bx] != 0 or states[by, bz, bx] == 0: continue
        under = PAL[states[by, bz, bx]].split('[')[0]
        if under in ('red_terracotta', 'terracotta') or '_slab[type=bottom' in PAL[states[by, bz, bx]] or 'stairs' in under: continue
        states[by, bz, bx] = sid(base); kinds[by, bz, bx] = 4
    return states, kinds, union

def post_pass(states, kinds, union, PAL, PIDX):
    """Over the whole grid: water filled down, pane and bar connections."""
    NY, NZ, NX = states.shape
    def sid(s):
        if s not in PIDX: PIDX[s] = len(PAL); PAL.append(s)
        return PIDX[s]
    # water: fill down from each water block to the first block that is not air
    water = sid('water[level=0]')
    for by in range(NY - 1, 0, -1):
        w = kinds[by] == 3
        below = (states[by - 1] == 0) & w
        states[by - 1][below] = water; kinds[by - 1][below] = 3
    # panes and bars: connections
    solidish = (kinds == 1) | (kinds == 2) | (kinds == 4)
    conn = {}
    solidish |= kinds == 7
    for by, bz, bx in zip(*np.nonzero((kinds == 1) | (kinds == 2) | (kinds == 7))):
        def at(dz, dx):
            z, x = bz + dz, bx + dx
            return 0 <= z < NZ and 0 <= x < NX and bool(solidish[by, z, x])
        n, s, e, w = at(-1, 0), at(1, 0), at(0, 1), at(0, -1)
        if not (n or s or e or w) and kinds[by, bz, bx] != 7:   # a lone pane: make it a short run along its plane (bars stay a post)
            mask = int(union[by, bz, bx]); h = thin_vertical(mask)
            if h in (0x55, 0xAA): n = s = True
            else: e = w = True
        base = PAL[states[by, bz, bx]]
        conn[(by, bz, bx)] = sid(f'{base}[east={str(e).lower()},north={str(n).lower()},south={str(s).lower()},waterlogged=false,west={str(w).lower()}]')
    for k, v in conn.items(): states[k] = v
    return states



def raise_slab_floors(states, kinds, PAL, PIDX, min_cells=12, keep=()):
    """Indoor floors that came out as bottom slabs (floors 0.1-0.5 m above a block line, e.g. ground floors raised
    0.3 m) become whole blocks: furniture is set into the block above a floor, so on a slab it would float half a
    block. A region counts as a floor if it has at least min_cells slabs side by side and most of it is under a roof
    (something within 2-8 blocks above)."""
    from blocks import SOLID, PLANKS
    base_of = {v[3]: k for t in (SOLID, PLANKS) for k, v in t.items() if v[3]}
    def sid(s):
        if s not in PIDX: PIDX[s] = len(PAL); PAL.append(s)
        return PIDX[s]
    NY, NZ, NX = states.shape
    slab_ids = np.array(['_slab[type=bottom' in p for p in PAL] + [False] * 4096)
    full_of = {}
    for i, p in enumerate(PAL):
        if '_slab[type=bottom' in p:
            b = base_of.get(p.split('[')[0])
            if b: full_of[i] = sid(b)
    from collections import deque
    changed = 0
    for y in range(1, NY - 1):
        cand = slab_ids[states[y]] & (states[y + 1] == 0)
        for (ky, kz, kx) in keep:
            if ky == y: cand[kz, kx] = False      # a stair's half steps stay half steps
        seen = np.zeros((NZ, NX), bool)
        roof = np.zeros((NZ, NX), bool)
        for k in range(2, 9):
            if y + k < NY: roof |= (states[y + k] != 0)
        for z0, x0 in zip(*np.nonzero(cand)):
            if seen[z0, x0]: continue
            reg, q = [], deque([(z0, x0)]); seen[z0, x0] = True
            while q:
                z, x = q.popleft(); reg.append((z, x))
                for dz, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    zz, xx = z + dz, x + dx
                    if 0 <= zz < NZ and 0 <= xx < NX and cand[zz, xx] and not seen[zz, xx]:
                        seen[zz, xx] = True; q.append((zz, xx))
            if len(reg) < min_cells or sum(roof[z, x] for z, x in reg) < 0.7 * len(reg): continue
            # a floor a stair comes up to keeps its height: raised, it would leave the top step a block and a half below
            if keep and any((yy, z + dz, x + dx) in keep for z, x in reg for dz, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)) for yy in (y, y - 1)): continue
            for z, x in reg:
                f = full_of.get(int(states[y, z, x]))
                if f: states[y, z, x] = f; kinds[y, z, x] = 4; changed += 1
    print(f'indoor slab floors raised to whole blocks: {changed}')


def apply_surfaces(states, kinds, PAL, PIDX, files, X0, Z0, Y0):
    """Rebuilds steps where a person can stand in the 3D campus but not in the blocks (surfaces.mjs spots): the
    standing height is rounded to half a block; a whole-number height gets a whole block under it, a half one a bottom
    slab; the two blocks above are cleared, except glass (a window), and a whole block only where no wall comes within
    0.45 m of the column's middle in the 3D campus. Spots the blocks already serve (a standing place within 0.3 m)
    are left alone. Clearing is done first, then the blocks to stand on, so a flight above keeps its steps."""
    from blocks import SOLID, PLANKS
    import base64
    def sid(s):
        if s not in PIDX: PIDX[s] = len(PAL); PAL.append(s)
        return PIDX[s]
    NY, NZ, NX = states.shape
    slab_of = {k: v[3] for t in (SOLID, PLANKS) for k, v in t.items() if v[3]}
    base_of = {v[3]: k for t in (SOLID, PLANKS) for k, v in t.items() if v[3]}
    def passable(i):
        p = PAL[i]
        return p == 'air' or p.startswith(('water', 'light[')) or p.split('[')[0].endswith(('_carpet', '_door', 'tulip', 'poppy', 'daisy', 'bluet', 'dandelion'))
    pas = np.array([passable(i) for i in range(len(PAL))] + [False] * 4096)
    clears, supports, stair_cells = {}, {}, set()
    n_spots = n_ok = 0
    allsp = np.concatenate([np.frombuffer(base64.b64decode(json.load(open(f))['spots']), dtype=np.float32).reshape(-1, 4) for f in files])
    # floors: many spots at the same height around; stairs and landings: few. On stairs and landings a whole block in
    # the way goes (a wall's end jutting into a landing; the 3D walker fits there); on floors only where the 3D campus
    # has no wall within 0.45 m of the column's middle.
    import collections
    byc = collections.defaultdict(list)
    for cx, cz, h, w in allsp: byc[(int(math.floor(cx)), int(math.floor(cz)))].append(float(h))
    def floorlike(cx, cz, h):
        x, z, n = int(math.floor(cx)), int(math.floor(cz)), 0
        for i in range(-3, 4):
            for j in range(-3, 4):
                n += sum(1 for hh in byc.get((x + i, z + j), ()) if abs(hh - h) < 0.3)
        return n >= 20
    def near_step(cx, cz, h):
        """A stair's head: a column within two of this one holds a spot 0.3-1.2 m higher or lower."""
        x, z = int(math.floor(cx)), int(math.floor(cz))
        return any(0.3 <= abs(hh - h) <= 1.2 for i in range(-2, 3) for j in range(-2, 3) if i or j for hh in byc.get((x + i, z + j), ()))
    if True:
        sp = allsp
        for cx, cz, h, wide in sp:
            n_spots += 1
            x, z = int(math.floor(cx - X0)), int(math.floor(cz - Z0))
            if not (0 <= x < NX and 0 <= z < NZ): continue
            col = states[:, z, x]
            dbg = os.environ.get('MC_DEBUG_COL') == f'{int(math.floor(cx))},{int(math.floor(cz))}'
            def served_at(t):
                half = (t * 2) % 2 == 1
                sup = int(math.floor(t) - Y0) if half else int(t - 1 - Y0)
                if not (1 <= sup < NY - 3): return None, half, True
                for s_ in range(max(1, sup - 1), min(NY - 2, sup + 3)):
                    if pas[col[s_]] and pas[col[s_ + 1]] and not pas[col[s_ - 1]]:
                        top = s_ + Y0 - (0.5 if '_slab[type=bottom' in PAL[col[s_ - 1]] else 0)
                        if abs(top - t) <= 0.3: return sup, half, True
                return sup, half, False
            # floors keep their height rounded to the nearest half block; on stairs and landings the height is rounded
            # a little downward, so that a flight of 0.54 m per block becomes even half-block steps (rounding each
            # block to the nearest would give a whole-block step now and then, which needs a jump the headroom of a
            # stair rarely allows)
            t = round(float(h) * 2) / 2
            sup, half, ok_ = served_at(t)
            if ok_: n_ok += 1; continue
            if not floorlike(cx, cz, float(h)):
                t = math.floor(float(h) * 2 + 0.2) / 2
                sup, half, ok_ = served_at(t)
                if ok_: n_ok += 1; continue
            if sup is None: continue
            # the material: what the stair or floor is made of at or below the support
            mat = None
            for k in (sup, sup - 1, sup + 1):
                if 0 <= k < NY:
                    b = PAL[col[k]].split('[')[0]
                    b = base_of.get(b, b)
                    if b in slab_of: mat = b; break
            mat = mat or 'smooth_stone'
            ok = True
            for k in (sup + 1, sup + 2):
                p = PAL[col[k]]
                if pas[col[k]]: continue
                if 'glass' in p or 'pane' in p: ok = False; break
                if '[' not in p and kinds[k, z, x] == 4 and wide < 2 and floorlike(cx, cz, float(h)) and not (wide >= 1 and near_step(cx, cz, float(h))): ok = False; break
            if dbg: print('DEBUG spot', cx, cz, h, 'wide', wide, 't', t, 'sup', sup, 'ok', ok, 'floorlike', floorlike(cx, cz, float(h)), 'near_step', near_step(cx, cz, float(h)), [PAL[col[k]] for k in (sup, sup + 1, sup + 2)])
            if not ok: continue
            for k in (sup + 1, sup + 2): clears[(k, z, x)] = 1
            # on a stair a third block of head room, so that a whole-block step (rounding) can be jumped; the steps of
            # a flight above are set after the clearing and win
            stairish = not floorlike(cx, cz, float(h)) or near_step(cx, cz, float(h))
            if stairish and sup + 3 < NY and 'glass' not in PAL[col[sup + 3]] and 'pane' not in PAL[col[sup + 3]]: clears[(sup + 3, z, x)] = 1
            supports[(sup, z, x)] = f'{slab_of[mat]}[type=bottom,waterlogged=false]' if half else mat
            if not floorlike(cx, cz, float(h)): stair_cells.add((sup, z, x))
    for c in clears:
        states[c] = 0; kinds[c] = 0
    for c, st in supports.items():
        states[c] = sid(st); kinds[c] = 6 if '_slab' in st else 4
    print(f'standing spots: {n_spots}, already served {n_ok}, rebuilt {len(supports)} (cleared {len(clears)} blocks above)')
    return stair_cells


def hang_doors(states, kinds, PAL, PIDX, opened, X0, Z0, Y0):
    """Doors in the doorways opened by doorways.py: one or two blocks wide get a wooden door (two: a pair, hinged at the
    outer sides), closed; wider openings stay open. The door stands in the first block of the wall's depth, on a floor."""
    def sid(s):
        if s not in PIDX: PIDX[s] = len(PAL); PAL.append(s)
        return PIDX[s]
    NY, NZ, NX = states.shape
    cells = {(e[0], e[1], e[2]): e for e in opened if len(e) > 3}
    done, n = set(), 0
    for (x, y, z), e in sorted(cells.items()):
        axis, run, depth = e[3], e[4], e[5]
        if run > 2 or (x, y, z) in done: continue
        along = (0, 1) if axis == 'x' else (1, 0)          # (dx, dz) along the wall
        # the door's own cells: this one and, for a pair, the next along the wall; only the first of a deep wall
        across = (1, 0) if axis == 'x' else (0, 1)
        if (x - across[0], y, z - across[1]) in cells: continue   # second block of a two-deep wall
        pair = [(x, y, z)]
        nxt = (x + along[0], y, z + along[1])
        if run == 2:
            if nxt not in cells: continue
            pair.append(nxt)
        facing = 'east' if axis == 'x' else 'south'
        ok = True
        for (cx, cy, cz) in pair:
            bx, bz, by = cx - int(X0), cz - int(Z0), cy - 64 - int(math.floor(Y0))
            if not (1 <= by < NY - 1 and 0 <= bz < NZ and 0 <= bx < NX) or states[by, bz, bx] or states[by + 1, bz, bx] or not states[by - 1, bz, bx]:
                ok = False
        if not ok: continue
        for i, (cx, cy, cz) in enumerate(pair):
            bx, bz, by = cx - int(X0), cz - int(Z0), cy - 64 - int(math.floor(Y0))
            hinge = 'left' if i == 0 else 'right'
            for half, k in (('lower', 0), ('upper', 1)):
                states[by + k, bz, bx] = sid(f'oak_door[facing={facing},half={half},hinge={hinge},open=false,powered=false]'); kinds[by + k, bz, bx] = 6
            done.add((cx, cy, cz)); n += 1
    print(f'doors hung: {n}')

def light_rooms(states, kinds, PAL, PIDX, step=6, level=13):
    """Indoor light without fittings: an invisible light block (the game's 'light') under the ceiling of every covered
    standing place on a grid of step blocks, so that rooms deep inside the buildings are not dark at noon or at night."""
    NY, NZ, NX = states.shape
    lid = PIDX.get(f'light[level={level},waterlogged=false]')
    if lid is None:
        lid = len(PAL); PAL.append(f'light[level={level},waterlogged=false]'); PIDX[PAL[-1]] = lid
    air = states == 0
    n = 0
    for z in range(0, NZ, step):
        for x in range(0, NX, step):
            col = states[:, z, x]
            y = 1
            while y < NY - 3:
                if air[y, z, x] and air[y + 1, z, x] and not air[y - 1, z, x]:
                    # a standing place: is there a ceiling 2 to 6 blocks up?
                    top = next((k for k in range(y + 2, min(NY, y + 7)) if not air[k, z, x]), None)
                    if top is not None and not PAL[col[top]].startswith(('oak_leaves', 'jungle_leaves', 'spruce_leaves', 'azalea', 'flowering', 'dark_oak_leaves')):
                        states[top - 1, z, x] = lid; kinds[top - 1, z, x] = 0; n += 1
                        y = top
                y += 1
    print(f'invisible lights under ceilings: {n}')


def apply_fixes(states, kinds, PAL, PIDX, path, X0, Z0, Y0):
    """Hand-made changes in fixes.json, in game block coordinates, applied last: 'fill' sets a box to one block, 'ladder'
    puts ladders up a column (facing: the way the ladder faces, away from the wall it hangs on)."""
    def sid(s):
        if s not in PIDX: PIDX[s] = len(PAL); PAL.append(s)
        return PIDX[s]
    NY, NZ, NX = states.shape
    yb = int(math.floor(Y0)) + 64
    n = 0
    for group in json.load(open(path, encoding='utf-8')):
        for op in group['ops']:
            if op['op'] == 'fill':
                (ax, ay, az), (bx_, by_, bz_) = op['from'], op['to']
                for y in range(min(ay, by_), max(ay, by_) + 1):
                    for z in range(min(az, bz_), max(az, bz_) + 1):
                        for x in range(min(ax, bx_), max(ax, bx_) + 1):
                            c = (y - yb, z - int(Z0), x - int(X0))
                            if 0 <= c[0] < NY and 0 <= c[1] < NZ and 0 <= c[2] < NX:
                                states[c] = 0 if op['block'] == 'air' else sid(op['block'])
                                kinds[c] = 0 if op['block'] == 'air' else 4; n += 1
            elif op['op'] == 'ladder':
                for y in range(op['y0'], op['y1'] + 1):
                    c = (y - yb, op['z'] - int(Z0), op['x'] - int(X0))
                    if 0 <= c[0] < NY and 0 <= c[1] < NZ and 0 <= c[2] < NX:
                        states[c] = sid(f"ladder[facing={op['facing']},waterlogged=false]"); kinds[c] = 6; n += 1
    print(f'hand-made fixes: {n} blocks')

# ---------------------------------------------------------------------------------------------------------- furniture
BED_COLOURS = ['white', 'light_blue', 'light_gray', 'blue', 'pink', 'yellow', 'lime', 'cyan', 'orange', 'purple']
WOOL = {'white': (234, 236, 237), 'light_gray': (142, 142, 135), 'gray': (63, 68, 72), 'black': (21, 21, 26), 'red': (161, 39, 35),
        'orange': (240, 118, 19), 'yellow': (249, 198, 40), 'lime': (112, 185, 26), 'green': (84, 109, 27), 'cyan': (21, 137, 145),
        'light_blue': (58, 175, 217), 'blue': (53, 57, 157), 'purple': (121, 42, 172), 'magenta': (189, 68, 179), 'pink': (237, 141, 172),
        'brown': (114, 71, 40)}

def place_furniture(states, kinds, PAL, PIDX, furniture, X0, Z0, Y0):
    """Sets down a Minecraft piece for each named furniture instance of voxelize.mjs (imagined translations):
    desk -> a top slab of the nearest plank colour at the desk top; chair -> a stairs block whose back faces away from the
    nearest desk; seat (stand, gym) -> a carpet of the seat colour; bed (mattress) -> a two-block bed with its head against
    the wall; light (gym high bays) -> a sea lantern. A piece only goes into air; a floor slab in the way lifts it a block.
    Returns the block entities the pieces need (beds)."""
    from blocks import PLANKS, nearest, SOLID
    NY, NZ, NX = states.shape
    def sid(s):
        if s not in PIDX: PIDX[s] = len(PAL); PAL.append(s)
        return PIDX[s]
    def cell(x, h, z):
        return int(math.floor(h - Y0)), int(math.floor(z - Z0)), int(math.floor(x - X0))
    def inside(c):
        return 0 <= c[0] < NY and 0 <= c[1] < NZ and 0 <= c[2] < NX
    def free(c):
        if not inside(c): return None
        st = PAL[states[c]]
        if st == 'air': return c
        if '_slab[type=bottom' in st or st.startswith('air'):
            up = (c[0] + 1, c[1], c[2])
            return up if inside(up) and states[up] == 0 else None
        return None
    def solid(c):
        return inside(c) and kinds[c] in (4, 6) and states[c] != 0
    ents = {}
    desks = [f for f in furniture if f['k'] == 'desk']
    import collections
    grid = collections.defaultdict(list)
    for d in desks: grid[(int(d['x'] // 2), int(d['z'] // 2))].append(d)
    def nearest_desk(f):
        best, bd = None, 1.3
        gx, gz = int(f['x'] // 2), int(f['z'] // 2)
        for i in (-1, 0, 1):
            for j in (-1, 0, 1):
                for d in grid[(gx + i, gz + j)]:
                    if abs(d['y'] - f['y']) > 1.0: continue
                    dd = math.hypot(d['x'] - f['x'], d['z'] - f['z'])
                    if dd < bd: best, bd = d, dd
        return best
    stairs_tbl = {k: v for k, v in {**SOLID, **PLANKS}.items() if v[4]}
    placed = collections.Counter()
    for f in sorted(furniture, key=lambda f: {'desk': 0, 'bed': 1, 'light': 2, 'seat': 3, 'chair': 4}[f['k']]):
        k = f['k']
        if k == 'desk':
            c = free(cell(f['x'], f['top'] - 0.05, f['z']))
            if c:
                b = nearest(f['rgb'], PLANKS); states[c] = sid(f'{PLANKS[b][3]}[type=top,waterlogged=false]'); kinds[c] = 6; placed[k] += 1
        elif k == 'chair':
            d = nearest_desk(f)
            if d: dx, dz = f['x'] - d['x'], f['z'] - d['z']
            else: dx, dz = -math.sin(f['yaw']), -math.cos(f['yaw'])
            facing = ('east' if dx > 0 else 'west') if abs(dx) > abs(dz) else ('south' if dz > 0 else 'north')
            c0 = cell(f['x'], f['y'] + 0.3, f['z'])
            c = free(c0)
            if not c:      # its block holds the desk: one block further back
                step = {'east': (0, 1), 'west': (0, -1), 'south': (1, 0), 'north': (-1, 0)}[facing]
                c = free((c0[0], c0[1] + step[0], c0[2] + step[1]))
            if not c: continue
            b = nearest(f['rgb'], stairs_tbl)
            states[c] = sid(f'{stairs_tbl[b][4]}[facing={facing},half=bottom,shape=straight,waterlogged=false]'); kinds[c] = 6; placed[k] += 1
        elif k == 'seat':
            c = cell(f['x'], f['y'] + 0.1, f['z'])
            if inside(c) and '_slab[type=bottom' in PAL[states[c]]: c = (c[0] + 1, c[1], c[2])     # the seat on a step tier
            if inside(c) and states[c] == 0 and solid((c[0] - 1, c[1], c[2])):
                col = nearest(f['rgb'], {n: v for n, v in WOOL.items()})
                states[c] = sid(f'{col}_carpet'); kinds[c] = 6; placed[k] += 1
        elif k == 'light':
            c = cell(f['x'], f['y'] + f['sy'] / 2, f['z'])
            if inside(c) and states[c] == 0:
                states[c] = sid('sea_lantern'); kinds[c] = 4; placed[k] += 1
        elif k == 'bed':
            # the long side of the mattress, in the world: local z when sz is the longer size
            ang = f['yaw'] if f['sz'] >= f['sx'] else f['yaw'] + math.pi / 2
            ux, uz = math.sin(ang), math.cos(ang)
            if abs(ux) > abs(uz): ux, uz = (1 if ux > 0 else -1), 0
            else: ux, uz = 0, (1 if uz > 0 else -1)
            a = cell(f['x'] - ux * 0.5, f['y'] + 0.2, f['z'] - uz * 0.5)
            b = (a[0], a[1] + uz, a[2] + ux)
            if a == b or not (inside(a) and inside(b)): continue
            # a bed replaces whatever the frame and bedding became, but never glass
            over = lambda c: c if inside(c) and 'glass' not in PAL[states[c]] and 'pane' not in PAL[states[c]] else None
            fa, fb = (free(a) or over(a)), (free(b) or over(b))
            if not fa or not fb or fa[0] != fb[0]: continue
            for c in (fa, fb):
                up = (c[0] + 1, c[1], c[2])
                if inside(up) and kinds[up] in (6, 7) and 'bed' not in PAL[states[up]]: states[up] = 0; kinds[up] = 0
            # head against the wall: the end with a solid block beyond it
            beyond_b = (fb[0], fb[1] + uz, fb[2] + ux)
            head, foot, hx, hz = (fb, fa, ux, uz) if solid(beyond_b) else (fa, fb, -ux, -uz)
            facing = {(1, 0): 'east', (-1, 0): 'west', (0, 1): 'south', (0, -1): 'north'}[(hx, hz)]
            colour = BED_COLOURS[int(abs(f['x'] * 7 + f['z'] * 13)) % len(BED_COLOURS)]
            states[foot] = sid(f'{colour}_bed[facing={facing},occupied=false,part=foot]'); kinds[foot] = 6
            states[head] = sid(f'{colour}_bed[facing={facing},occupied=false,part=head]'); kinds[head] = 6
            for c in (foot, head):
                wx, wy, wz = int(X0) + c[2], int(math.floor(Y0)) + c[0] + GROUND_Y, int(Z0) + c[1]
                ents[(wx, wy, wz)] = {'id': 'minecraft:bed', 'x': wx, 'y': wy, 'z': wz}
            placed[k] += 1
    print('furniture set down:', dict(placed), 'of', dict(collections.Counter(f['k'] for f in furniture)))
    return ents

# ---------------------------------------------------------------------------------------------------------- writing
def parse_state(s):
    if '[' not in s: return 'minecraft:' + s, {}
    name, props = s[:-1].split('[', 1)
    return 'minecraft:' + name, dict(p.split('=') for p in props.split(','))

def pack(indices, n_pal):
    bits = max(4, (n_pal - 1).bit_length())
    per = 64 // bits
    nlong = (4096 + per - 1) // per
    out = np.zeros(nlong, dtype=np.uint64)
    idx = indices.astype(np.uint64)
    for k in range(per):
        part = idx[k::per]
        out[:len(part)] |= part << np.uint64(k * bits)
    return LongArray(out.view(np.int64).tolist())

def section_nbt(y, block_ids, PAL):
    uniq, inv = np.unique(block_ids, return_inverse=True)
    palette = List[Compound]()
    for u in uniq:
        name, props = parse_state(PAL[u])
        c = Compound({'Name': String(name)})
        if props: c['Properties'] = Compound({k: String(v) for k, v in props.items()})
        palette.append(c)
    bs = Compound({'palette': palette})
    if len(uniq) > 1: bs['data'] = pack(inv, len(uniq))
    return Compound({'Y': Byte(y), 'block_states': bs, 'biomes': Compound({'palette': List[String]([String('minecraft:plains')])})})

def chunk_nbt(cx, cz, column, PAL, ents=()):
    """column: (384, 16, 16) palette indices from y -64 up; ents: block entity dicts in this chunk."""
    secs = List[Compound]()
    for sy in range(-4, 20):
        part = column[(sy + 4) * 16:(sy + 5) * 16]
        secs.append(section_nbt(sy, part.reshape(-1), PAL))
    return Compound({
        'DataVersion': Int(DATA_VERSION), 'xPos': Int(cx), 'zPos': Int(cz), 'yPos': Int(-4),
        'Status': String('minecraft:full'), 'LastUpdate': Long(0), 'InhabitedTime': Long(0), 'isLightOn': Byte(0),
        'sections': secs, 'block_entities': List[Compound]([Compound({'id': String(e['id']), 'x': Int(e['x']), 'y': Int(e['y']), 'z': Int(e['z']), 'keepPacked': Byte(0)}) for e in ents]), 'Heightmaps': Compound(),
        'fluid_ticks': List[Compound](), 'block_ticks': List[Compound](), 'PostProcessing': List[List[Int]](),
        'structures': Compound({'References': Compound(), 'starts': Compound()}),
    })

def nbt_bytes(tag):
    buf = io.BytesIO()
    nbtlib.File(tag).write(buf, byteorder='big')
    return buf.getvalue()

def write_regions(world, chunks):
    os.makedirs(os.path.join(world, 'region'), exist_ok=True)
    regions = {}
    for (cx, cz), data in chunks.items():
        regions.setdefault((cx >> 5, cz >> 5), {})[(cx & 31, cz & 31)] = zlib.compress(data, 6)
    now = int(time.time())
    for (rx, rz), cs in regions.items():
        header, stamps, body = bytearray(4096), bytearray(4096), bytearray()
        sector = 2
        for (lx, lz), comp in sorted(cs.items()):
            payload = struct.pack('>IB', len(comp) + 1, 2) + comp
            n = (len(payload) + 4095) // 4096
            payload += b'\0' * (n * 4096 - len(payload))
            i = 4 * (lx + lz * 32)
            header[i:i + 4] = struct.pack('>I', (sector << 8) | n)
            stamps[i:i + 4] = struct.pack('>I', now)
            body += payload; sector += n
        with open(os.path.join(world, 'region', f'r.{rx}.{rz}.mca'), 'wb') as f:
            f.write(header + stamps + body)
    return len(regions)

def level_dat(world, name, spawn):
    sx, sy, sz, yaw = spawn
    layers = List[Compound]([Compound({'block': String('minecraft:bedrock'), 'height': Int(1)}),
                             Compound({'block': String('minecraft:stone'), 'height': Int(123)}),
                             Compound({'block': String('minecraft:dirt'), 'height': Int(3)}),
                             Compound({'block': String('minecraft:grass_block'), 'height': Int(1)})])
    dims = Compound({
        'minecraft:overworld': Compound({'type': String('minecraft:overworld'), 'generator': Compound({
            'type': String('minecraft:flat'), 'settings': Compound({'biome': String('minecraft:plains'), 'features': Byte(0),
            'lakes': Byte(0), 'layers': layers, 'structure_overrides': List[String]()})})}),
        'minecraft:the_nether': Compound({'type': String('minecraft:the_nether'), 'generator': Compound({
            'type': String('minecraft:noise'), 'settings': String('minecraft:nether'),
            'biome_source': Compound({'type': String('minecraft:multi_noise'), 'preset': String('minecraft:nether')})})}),
        'minecraft:the_end': Compound({'type': String('minecraft:the_end'), 'generator': Compound({
            'type': String('minecraft:noise'), 'settings': String('minecraft:end'),
            'biome_source': Compound({'type': String('minecraft:the_end')})})}),
    })
    rules = {'doDaylightCycle': 'false', 'doMobSpawning': 'false', 'doWeatherCycle': 'false', 'doFireTick': 'false',
             'mobGriefing': 'false', 'spawnRadius': '0', 'doInsomnia': 'false', 'doPatrolSpawning': 'false',
             'doTraderSpawning': 'false', 'keepInventory': 'true', 'randomTickSpeed': '0'}
    data = Compound({
        'DataVersion': Int(DATA_VERSION),
        'version': Compound({'Id': Int(DATA_VERSION), 'Name': String(VERSION_NAME), 'Series': String('main'), 'Snapshot': Byte(0)}),
        'LevelName': String(name), 'GameType': Int(1), 'allowCommands': Byte(1), 'hardcore': Byte(0),
        'Difficulty': Byte(0), 'DifficultyLocked': Byte(0), 'initialized': Byte(1),
        'LastPlayed': Long(int(time.time() * 1000)), 'Time': Long(6000), 'DayTime': Long(6000),
        'SpawnX': Int(sx), 'SpawnY': Int(sy), 'SpawnZ': Int(sz), 'SpawnAngle': Float(yaw),
        'raining': Byte(0), 'rainTime': Int(1000000), 'thundering': Byte(0), 'thunderTime': Int(1000000),
        'clearWeatherTime': Int(1000000), 'WasModded': Byte(0), 'ServerBrands': List[String]([String('vanilla')]),
        'DataPacks': Compound({'Enabled': List[String]([String('vanilla')]), 'Disabled': List[String]()}),
        'GameRules': Compound({k: String(v) for k, v in rules.items()}),
        'WorldGenSettings': Compound({'seed': Long(20261121), 'generate_features': Byte(0), 'bonus_chest': Byte(0), 'dimensions': dims}),
    })
    f = nbtlib.File(Compound({'Data': data}), gzipped=True)
    f.save(os.path.join(world, 'level.dat'), byteorder='big')

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('vox', nargs='+', help='one or more voxel files of voxelize.mjs (tiles of one box)')
    ap.add_argument('--out', required=True, help='world folder to write')
    ap.add_argument('--name', default='广东实验中学')
    ap.add_argument('--spawn', default=None, help='x,z,yaw in world metres / Minecraft yaw (90 = facing west)')
    ap.add_argument('--blocks', default=None, help='also save the block grid (npz) for previews')
    ap.add_argument('--open', default=None, help='doorways.py open.json: cells to clear, two blocks high')
    ap.add_argument('--fixes', default=None, help='fixes.json: hand-made changes applied last')
    ap.add_argument('--surfaces', default=None, help='surfaces.mjs outputs, comma separated: steps rebuilt from the 3D standing heights')
    a = ap.parse_args()
    t0 = time.time()
    voxes = [json.load(open(f)) for f in a.vox]
    X0 = min(v['box'][0] for v in voxes); X1 = max(v['box'][1] for v in voxes)
    Z0 = min(v['box'][2] for v in voxes); Z1 = max(v['box'][3] for v in voxes)
    Y0, Y1 = voxes[0]['box'][4], voxes[0]['box'][5]
    NX, NY, NZ = int(X1 - X0), int(Y1 - Y0), int(Z1 - Z0)
    PAL, PIDX = ['air'], {'air': 0}
    states = np.zeros((NY, NZ, NX), np.int32); kinds = np.zeros((NY, NZ, NX), np.uint8); union = np.zeros((NY, NZ, NX), np.uint8)
    for v in voxes:
        st, kd, un = build_states(v, PAL, PIDX)
        ox, oz = int(v['box'][0] - X0), int(v['box'][2] - Z0)
        ny, nz, nx = st.shape
        states[:, oz:oz + nz, ox:ox + nx] = st; kinds[:, oz:oz + nz, ox:ox + nx] = kd; union[:, oz:oz + nz, ox:ox + nx] = un
    if a.open:
        n = 0
        opened = json.load(open(a.open))
        for e in opened:
            x, y, z = e[:3]
            bx, bz, by = x - int(X0), z - int(Z0), y - 64 - int(math.floor(Y0))
            for k in (0, 1):
                if 0 <= by + k < NY and 0 <= bz < NZ and 0 <= bx < NX and states[by + k, bz, bx]:
                    states[by + k, bz, bx] = 0; kinds[by + k, bz, bx] = 0; n += 1
        print(f'doorways opened: {n} blocks cleared')
    states = post_pass(states, kinds, union, PAL, PIDX)
    stair_cells = set()
    if a.surfaces:
        stair_cells = apply_surfaces(states, kinds, PAL, PIDX, a.surfaces.split(','), X0, Z0, Y0)
    raise_slab_floors(states, kinds, PAL, PIDX, keep=stair_cells)
    furniture = [f for v in voxes for f in v.get('furniture', [])]
    ents = place_furniture(states, kinds, PAL, PIDX, furniture, X0, Z0, Y0) if furniture else {}
    if a.open: hang_doors(states, kinds, PAL, PIDX, opened, X0, Z0, Y0)
    light_rooms(states, kinds, PAL, PIDX)
    if a.fixes: apply_fixes(states, kinds, PAL, PIDX, a.fixes, X0, Z0, Y0)
    ents_by_chunk = {}
    for (x, y, z), e in ents.items(): ents_by_chunk.setdefault((x >> 4, z >> 4), []).append(e)
    print(f'chosen blocks in {time.time() - t0:.1f}s: {int((states > 0).sum())} non-air blocks, {len(PAL)} block states, box {X0} {X1} {Z0} {Z1} {Y0} {Y1}')
    if a.blocks:
        np.savez_compressed(a.blocks, states=states, pal=np.array(PAL), box=np.array([X0, X1, Z0, Z1, Y0, Y1]))
    full = PIDX
    def sid(s):
        if s not in full: full[s] = len(PAL); PAL.append(s)
        return full[s]
    air, bed, stone, dirt, grass = sid('air'), sid('bedrock'), sid('stone'), sid('dirt'), sid('grass_block')
    ybox = int(Y0) + GROUND_Y                            # block y of voxel row 0
    lo = ybox - MIN_Y                                    # its index in a chunk column (which starts at y -64)
    gtop = GROUND_Y - MIN_Y                              # index of y 64, the first block above the ground
    nonair = states > 0
    has = nonair.any(axis=0)
    lowest = np.where(has, nonair.argmax(axis=0), NY)   # lowest non-air row per column
    cx0, cx1, cz0, cz1 = math.floor(X0 / 16), math.floor((X1 - 1) / 16), math.floor(Z0 / 16), math.floor((Z1 - 1) / 16)
    chunks = {}
    for cx in range(cx0, cx1 + 1):
        for cz in range(cz0, cz1 + 1):
            col = np.full((384, 16, 16), air, np.int32)
            col[0] = bed; col[1:124] = stone; col[124:127] = dirt; col[127] = grass   # y -64 .. 63, as the flat generator
            for lz in range(16):
                for lx in range(16):
                    bx, bz = cx * 16 + lx - int(X0), cz * 16 + lz - int(Z0)
                    if not (0 <= bx < NX and 0 <= bz < NZ): continue
                    c = states[:, bz, bx]
                    col[lo:lo + NY, lz, lx] = c
                    k0 = int(lowest[bz, bx])
                    if k0 < NY and ybox + k0 < GROUND_Y:
                        # under the lowest block below ground level: dirt three deep, then stone
                        top = lo + k0
                        col[max(1, top - 3):top, lz, lx] = dirt; col[1:max(1, top - 3), lz, lx] = stone
                    else:
                        seg = c[:GROUND_Y - ybox]
                        col[lo:gtop, lz, lx] = np.where(seg == 0, dirt, seg)
                        if seg[-1] == 0: col[gtop - 1, lz, lx] = grass
            chunks[(cx, cz)] = nbt_bytes(chunk_nbt(cx, cz, col, PAL, ents_by_chunk.get((cx, cz), ())))
    os.makedirs(a.out, exist_ok=True)
    nreg = write_regions(a.out, chunks)
    if a.spawn:
        sx, sz, yaw = (float(v) for v in a.spawn.split(','))
    else:
        sx, sz, yaw = (X0 + X1) / 2, (Z0 + Z1) / 2, 0
    # spawn on the first air above the highest block of that column
    bx, bz = int(sx - X0), int(sz - Z0)
    sy = GROUND_Y
    if 0 <= bx < NX and 0 <= bz < NZ:
        nzc = np.nonzero(states[:, bz, bx])[0]
        if len(nzc): sy = max(GROUND_Y, ybox + int(nzc[-1]) + 1)
    level_dat(a.out, a.name, (int(sx), sy, int(sz), yaw))
    print(f'wrote {len(chunks)} chunks in {nreg} region files and level.dat to {a.out} in {time.time() - t0:.1f}s; spawn {int(sx)},{sy},{int(sz)}')

if __name__ == '__main__':
    main()
