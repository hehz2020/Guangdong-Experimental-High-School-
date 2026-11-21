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
import argparse, base64, io, json, math, os, struct, sys, time, zlib
import numpy as np
import nbtlib
from nbtlib.tag import Compound, List, String, Int, Byte, Long, Float, LongArray

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from blocks import block_for, shaped, slab_capable_near  # noqa: E402

DATA_VERSION, VERSION_NAME = 3953, '1.21'     # older than most games in use: newer games upgrade it on load
GROUND_Y = 64                                 # block y of the first block above the ground (h 0..1)
MIN_Y = -64

CAT_WEIGHT = {'flowers': 0.9, 'water': 3.0, 'glass': 1.3, 'lamp': 2.0, 'leaves': 0.7, 'metal': 1.0, 'wood': 1.0, 'solid': 1.0,
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
    X0, X1, Z0, Z1, Y0, Y1 = vox['box']
    NX, NY, NZ = vox['size']
    mats = vox['mats']
    blk, mid, area, sub, hy = dec(vox['blk'], np.int32), dec(vox['mid'], np.uint16), dec(vox['area'], np.float32), dec(vox['sub'], np.uint8), dec(vox['hy'], np.uint8)
    info = [block_for(m) for m in mats]
    cat = np.array([CAT_WEIGHT.get(c, 0.0) if b else 0.0 for c, b in info], dtype=np.float32)
    score = area * cat[mid] * (0.6 + hy.astype(np.float32) / 255.0 * 0.8)
    keep = score > 0
    blk, mid, area, sub, hy, score = blk[keep], mid[keep], area[keep], sub[keep], hy[keep], score[keep]
    order = np.lexsort((-score, blk))
    blk, mid, area, sub = blk[order], mid[order], area[order], sub[order]
    first = np.ones(len(blk), bool); first[1:] = blk[1:] != blk[:-1]
    # the sub-cells of a block are the union over every material that is not skipped and covers enough
    union = np.zeros(NX * NY * NZ, np.uint8)
    np.bitwise_or.at(union, blk[area > 0.05], sub[area > 0.05])
    grid = np.full(NX * NY * NZ, -1, np.int32)       # winning material per block
    garea = np.zeros(NX * NY * NZ, np.float32)
    grid[blk[first]] = mid[first]; garea[blk[first]] = area[first]
    return grid.reshape(NY, NZ, NX), garea.reshape(NY, NZ, NX), union.reshape(NY, NZ, NX), info

def build_states(vox, PAL, PIDX):
    """Blocks of one voxel file, as indices into the shared palette PAL (0 = air)."""
    X0, X1, Z0, Z1, Y0, Y1 = vox['box']
    NX, NY, NZ = vox['size']
    grid, garea, union, info = choose(vox)
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
                if c in ('lamp', 'ground') or ymc < GROUND_Y:
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
            c = free(cell(f['x'], f['y'] + 0.3, f['z']))
            if not c: continue
            d = nearest_desk(f)
            if d: dx, dz = f['x'] - d['x'], f['z'] - d['z']
            else: dx, dz = -math.sin(f['yaw']), -math.cos(f['yaw'])
            facing = ('east' if dx > 0 else 'west') if abs(dx) > abs(dz) else ('south' if dz > 0 else 'north')
            b = nearest(f['rgb'], stairs_tbl)
            states[c] = sid(f'{stairs_tbl[b][4]}[facing={facing},half=bottom,shape=straight,waterlogged=false]'); kinds[c] = 6; placed[k] += 1
        elif k == 'seat':
            c = cell(f['x'], f['y'] + 0.1, f['z'])
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
            fa, fb = free(a), free(b)
            if not fa or not fb or fa[0] != fb[0]: continue
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
    states = post_pass(states, kinds, union, PAL, PIDX)
    furniture = [f for v in voxes for f in v.get('furniture', [])]
    ents = place_furniture(states, kinds, PAL, PIDX, furniture, X0, Z0, Y0) if furniture else {}
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
