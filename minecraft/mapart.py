#!/usr/bin/env python3
"""A map of the whole campus on a notice board by the spawn: 4 x 5 of the game's own maps (filled maps in item
frames), drawn from the map's blocks seen from above at one block a pixel, north at the top, as the game draws its
maps (each block's colour from the game's map palette, lighter where a block stands higher than the one north of it,
darker where lower). The maps are locked, so the game never redraws them.

usage:
  python minecraft/mapart.py frames <blocks.npz> <commands.txt>   appends the item frames (and the board's title)
  python minecraft/mapart.py maps <blocks.npz> <world dir> [<preview.png>]   writes data/minecraft/maps/<id>.dat
The board itself (spruce planks) is in fixes.json. Map files: 26.x keeps them in data/minecraft/maps/<id>.dat
(gzipped NBT {data: {scale, dimension, xCenter, zCenter, locked, trackingPosition, unlimitedTracking, colors,
banners, frames}, DataVersion}) and the last id in data/minecraft/maps/last_id.dat ({data: {map}}), as the 26.x
server's own file fix (DimensionStorageFileFix) moves them there; DataVersion is the world's.
CHOSEN: the place of the board, the map ids (0-19), the colour matching (nearest palette colour, redmean).
"""
import gzip, io, math, os, sys
import numpy as np
import nbtlib
from nbtlib.tag import Compound, List, String, Int, Byte, ByteArray
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from blocks import color_of  # noqa: E402

COLS, ROWS = 4, 5                                       # maps across (west to east) and down (north to south)
X_MAP0, Z_MAP0 = -164, -340                             # north-west corner of the area the maps cover (512 x 640 blocks)
BOARD_X0, BOARD_Z, BOARD_Y_TOP = 253, -26, 69           # frames: x 253-256, in the blocks of z -26 (on the board at z -27), y 69 down to 65
# the game's map colours (base colours 1..61, as in the game since 1.17); a pixel is base * 4 + shade, shades
# multiply by 180, 220, 255 (and 135) / 255
BASE = [None, (127, 178, 56), (247, 233, 163), (199, 199, 199), (255, 0, 0), (160, 160, 255), (167, 167, 167), (0, 124, 0),
        (255, 255, 255), (164, 168, 184), (151, 109, 77), (112, 112, 112), (64, 64, 255), (143, 119, 72), (255, 252, 245),
        (216, 127, 51), (178, 76, 216), (102, 153, 216), (229, 229, 51), (127, 204, 25), (242, 127, 165), (76, 76, 76),
        (153, 153, 153), (76, 127, 153), (127, 63, 178), (51, 76, 178), (102, 76, 51), (102, 127, 51), (153, 51, 51),
        (25, 25, 25), (250, 238, 77), (92, 219, 213), (74, 128, 255), (0, 217, 58), (129, 86, 49), (112, 2, 0),
        (209, 177, 161), (159, 82, 36), (149, 87, 108), (112, 108, 138), (186, 133, 36), (103, 117, 53), (160, 77, 78),
        (57, 41, 35), (135, 107, 98), (87, 92, 92), (122, 73, 88), (76, 62, 92), (76, 50, 35), (76, 82, 42), (142, 60, 46),
        (37, 22, 16), (189, 48, 49), (148, 63, 97), (92, 25, 29), (22, 126, 134), (58, 142, 140), (86, 44, 62),
        (20, 180, 133), (100, 100, 100), (216, 175, 147), (127, 167, 150)]
SHADE = [180, 220, 255, 135]
WATER, GRASS = 12, 1

def redmean2(a, b):
    rm = (a[0] + b[0]) / 2
    return (2 + rm / 256) * (a[0] - b[0]) ** 2 + 4 * (a[1] - b[1]) ** 2 + (2 + (255 - rm) / 256) * (a[2] - b[2]) ** 2

def nearest_base(rgb):
    """The base colour whose normal shade (220) is nearest to a block's average colour."""
    best, bd = 1, 1e18
    for i, c in enumerate(BASE):
        if c is None: continue
        d = redmean2(rgb, [v * 220 / 255 for v in c])
        if d < bd: best, bd = i, d
    return best

def top_view(src):
    """Per column of the maps' area: (base colour, height) of the highest block that shows from above."""
    d = np.load(src)
    st, pal, box = d['states'], [str(p) for p in d['pal']], d['box']
    X0, X1, Z0, Z1, Y0, Y1 = (int(v) for v in box)
    NY, NZ, NX = st.shape
    shows = np.array([not (p == 'air' or p.startswith(('light[', 'lantern'))) for p in pal])
    base_of = np.array([WATER if p.startswith('water') else nearest_base(color_of(p.split('[')[0])) if p != 'air' else 0 for p in pal])
    W, H = COLS * 128, ROWS * 128
    base = np.full((H, W), GRASS, np.int32); height = np.full((H, W), 0, np.int32)        # outside the box: the flat world's grass
    S = shows[st]
    top = np.where(S.any(axis=0), NY - 1 - np.argmax(S[::-1], axis=0), -1)              # highest showing row per column (z, x)
    zz, xx = np.nonzero(top >= 0)
    ids = st[top[zz, xx], zz, xx]
    mx, mz = xx + X0 - X_MAP0, zz + Z0 - Z_MAP0
    ok = (0 <= mx) & (mx < W) & (0 <= mz) & (mz < H)
    base[mz[ok], mx[ok]] = base_of[ids[ok]]
    height[mz[ok], mx[ok]] = top[zz[ok], xx[ok]] + Y0
    return base, height

def colours(base, height):
    """Map pixel values (signed bytes) with the game's shading: lighter where higher than the block to the north."""
    north = np.vstack([height[:1], height[:-1]])
    shade = np.where(height > north, 2, np.where(height < north, 0, 1))
    shade[base == WATER] = 1
    v = base * 4 + shade
    return np.where(v > 127, v - 256, v).astype(np.int8)

def frames(src, out):
    cmds = []
    for j in range(ROWS):
        for i in range(COLS):
            mid = j * COLS + i
            x, y, z = BOARD_X0 + i, BOARD_Y_TOP - j, BOARD_Z
            cmds.append(f'summon minecraft:item_frame {x + 0.5} {y + 0.5} {z + 0.5} {{Facing:3b,block_pos:[I;{x},{y},{z}],Fixed:1b,'
                        f'Item:{{id:"minecraft:filled_map",count:1,components:{{"minecraft:map_id":{mid}}}}}}}')
    title = '广东实验中学（荔湾校区）校园地图\\n一格一米 · 北在上 · 东边是河涌'
    cmds.append(f'summon minecraft:text_display {BOARD_X0 + COLS / 2:.2f} {BOARD_Y_TOP + 1.1:.2f} {BOARD_Z + 0.05:.2f} {{text:{{text:"{title}",color:"#FFFFFF"}},'
                f'background:{(0xB21A2430 - (1 << 32))},billboard:"fixed",shadow:0b,line_width:400,alignment:"center",Rotation:[0f,0f],'
                f'transformation:{{left_rotation:[0f,0f,0f,1f],right_rotation:[0f,0f,0f,1f],translation:[0f,0f,0f],scale:[0.55f,0.55f,0.55f]}}}}')
    open(out, 'a', encoding='utf-8').write('\n'.join(cmds) + '\n')
    print(f'campus map: {COLS * ROWS} item frames on the board at x {BOARD_X0}-{BOARD_X0 + COLS - 1}, z {BOARD_Z}')

def maps(src, world, preview=None):
    base, height = top_view(src)
    px = colours(base, height)
    lv = nbtlib.load(os.path.join(world, 'level.dat'))
    root = lv['Data'] if 'Data' in lv else lv
    dv = int(root['DataVersion'])
    d = os.path.join(world, 'data', 'minecraft', 'maps'); os.makedirs(d, exist_ok=True)
    for j in range(ROWS):
        for i in range(COLS):
            mid = j * COLS + i
            tile = px[j * 128:(j + 1) * 128, i * 128:(i + 1) * 128]
            data = Compound({'scale': Byte(0), 'dimension': String('minecraft:overworld'),
                             'xCenter': Int(X_MAP0 + i * 128 + 64), 'zCenter': Int(Z_MAP0 + j * 128 + 64),
                             'locked': Byte(1), 'trackingPosition': Byte(1), 'unlimitedTracking': Byte(0),
                             'colors': ByteArray(tile.reshape(-1).tolist()), 'banners': List[Compound]([]), 'frames': List[Compound]([])})
            nbtlib.File({'data': data, 'DataVersion': Int(dv)}, gzipped=True).save(os.path.join(d, f'{mid}.dat'))
    nbtlib.File({'data': Compound({'map': Int(COLS * ROWS - 1)}), 'DataVersion': Int(dv)}, gzipped=True).save(os.path.join(d, 'last_id.dat'))
    print(f'campus map: {COLS * ROWS} maps written to {d} (DataVersion {dv})')
    if preview:
        from PIL import Image
        v = px.astype(np.int32) & 255
        rgb = np.zeros(v.shape + (3,), np.uint8)
        for b in range(1, len(BASE)):
            for s in range(4):
                m = v == b * 4 + s
                if m.any(): rgb[m] = [int(c * SHADE[s] / 255) for c in BASE[b]]
        Image.fromarray(rgb).save(preview)
        print('preview', preview)

if __name__ == '__main__':
    what = sys.argv[1]
    if what == 'frames': frames(sys.argv[2], sys.argv[3])
    else: maps(sys.argv[2], sys.argv[3], sys.argv[4] if len(sys.argv) > 4 else None)
