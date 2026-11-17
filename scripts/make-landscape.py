#!/usr/bin/env python3
"""Derives the landscape of the campus model (trees, lawns, paving, roads, canal) from the satellite mosaic.

    python3 -I scripts/make-landscape.py /path/to/campus_z19.jpg [--debug DIR]

The mosaic (Esri World Imagery, zoom 19, 2304 x 2816 px) is NOT part of the repository; only numbers derived from it
are stored. Needs Pillow, nothing else. Reads data/measurements.json (georeference, lean of the oblique view),
src/campus-data.js (building outlines, track, courts) and the footprint constant FOOT in
src/world/builders/new-building.js (that building is newer than the mosaic; its surroundings are kept clear). Writes

    data/landscape.json                  the readable record
    src/world/extras/landscape.js        the same data, minified, between the marker comments
                                         /* <landscape-data> */ ... /* </landscape-data> */  (the rest of the file is left alone)

--debug DIR writes overlay images for checking by eye into DIR (keep DIR outside the repository: the overlays contain
the satellite image).

Everything here is in the model frame: x east, z south, metres, origin at the centre of the running track.
What is detected automatically and what was read by hand off gridded crops is said next to each constant below and
repeated in the "source" fields of the output.
"""
import json
import math
import os
import random
import re
import sys

from PIL import Image, ImageChops, ImageDraw, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# ----------------------------------------------------------------------------------------------------------------
# Window and tunables
# ----------------------------------------------------------------------------------------------------------------
X0, X1, Z0, Z1 = -130, 360, -250, 150      # metres; 1 m cells. (East limit 360 so that both canal banks are inside.)
CELL = 1.0
W, H = int((X1 - X0) / CELL), int((Z1 - Z0) / CELL)

MAX_TREES = 700
CROWN_R_MIN, CROWN_R_MAX = 1.8, 5.5          # metres
TREE_H_MIN, TREE_H_MAX = 6.0, 12.0           # metres, by crown radius
CROWN_CENTRE = 0.7                           # the middle of a crown is taken to sit at 0.7 x tree height (for the lean correction)
SPACING = 0.85                                # two trees are at least SPACING x (r1 + r2) apart
BUILDING_MARGIN = 1.5                        # metres a trunk must keep from a building's ground outline
APRON = 3.5                                  # width of the green apron the model draws around the track (src/world/index.js;
                                             # on the east side it is cut back to 0.9 m and the road digitised below takes its place)
SHADOW_SWEEP = (-0.45, -0.55)                # building shadows: metres west / north per metre of height (read off the gym and the slabs, rough)

# ----------------------------------------------------------------------------------------------------------------
# Things read by hand (pixel coordinates of the mosaic). Every one is a SINGLE reading off 2x gridded crops.
# ----------------------------------------------------------------------------------------------------------------
# Area in which ground cover is classified. It is NOT a surveyed campus boundary: north-west side = the diagonal wall line
# seen through px (322,1277), (1105,745), (1290,615); east side = the canal; south and south-west sides stop short of
# buildings that are not in campus-data.js and of a construction site.
SURVEY_PX = [(322, 1280), (800, 952), (1105, 745), (1290, 618), (1873, 618), (1639, 2080), (1190, 2080), (1190, 1900),
             (480, 1900), (350, 1660), (322, 1650)]

ROADS_PX = [
    dict(id='road-track-east', name='Road between the track and the gymnasium', width=7.7, surface='concrete',
         px=[(886, 1095), (886, 1845)],
         source='pale strip, px x 872..900, read on two 2x crops; its west edge is the kerb of the track; north of y 1330 tree '
                'crowns hide its east half',
         confidence='seen in satellite; the 2018 footage (frame 24) shows a grey concrete road here'),
    dict(id='road-canal', name='Road along the canal', width=7.0, surface='asphalt',
         px=[(1761, 600), (1754, 700), (1749, 800), (1742, 900), (1732, 1000), (1730, 1040), (1713, 1140), (1708, 1200),
             (1700, 1260), (1686, 1360), (1676, 1420), (1658, 1480), (1643, 1540), (1626, 1600), (1612, 1650), (1604, 1750),
             (1606, 1850), (1594, 1900), (1578, 1950), (1571, 2000), (1567, 2050), (1563, 2090)],
         source='y 1040..1420: centre of the item canal-road (measurement agent east-slabs); north and south of that: my own '
                'reading, +-8 px; y 1420..1640 lies under tree crowns and shadow and is interpolated',
         confidence='seen in satellite and in the 2018 footage (frames 2-5); single reading'),
    dict(id='road-south-of-courts', name='Tree-lined road south of the courts', width=6.0, surface='concrete',
         px=[(886, 1841), (1180, 1841)],
         source='INFERRED: the road surface is not visible. Two rows of crowns seen at px y 1835 and 1880 with a dark gap between; '
                'the centreline is put midway between the two rows after moving them north by the lean of crowns 7 m up',
         confidence='inferred, not seen'),
    dict(id='road-context-north-west', name='Main road north-west of the campus (outside the campus)', width=40.0,
         surface='asphalt', px=[(0, 1247), (230, 1096), (663, 812), (1100, 525), (1500, 263), (1900, 0)],
         source='read off the 0.4x overview and one 1.2x crop; drawn flat at ground level although part of it may be elevated',
         confidence='seen in satellite only; outside the campus; context'),
]

# Two tennis courts just inside the north-west wall (one 2x crop, +-1.5 m). Whether they belong to the school is not confirmed.
TENNIS_PX = dict(surround=[(800, 952.5), (897.5, 892.5), (937.5, 977.5), (850, 1049)],
                 courts=[[(821.5, 938.5), (892.5, 901.5), (909, 929), (839, 967.5)],
                         [(851.5, 994), (918.5, 957.5), (931, 985), (867.5, 1022.5)]])

# A hard court with teal and blue paint at the north-east corner of the window (one 3x crop; its east half is in shadow, so
# the outline is uncertain). The classifier takes its colour for lawn; it is forced to paving.
HARD_COURT_PX = [(1447, 645), (1490, 605), (1600, 605), (1590, 720), (1545, 778)]

# Places the model already furnishes (src/world/extras/*.js); no tree is put there. [x, z, radius] in metres.
KEEP_CLEAR = [(-40, 81, 9.5, 'fighter jet'), (62, -60, 4.5, 'flag platform')]

# BACKDROP - NOT MEASURED. Rough positions read off the 0.4x overview (+-15 m or worse), sizes generic.
BACKDROP_TOWERS_PX = [  # roof centre as seen [px x, px y], height estimated from the length of the visible north facade
    (150, 350, 95), (337, 262, 100), (462, 262, 100), (562, 262, 100), (250, 525, 90), (400, 525, 90), (675, 525, 90),
    (850, 512, 90), (1075, 325, 95), (1262, 325, 95)]
BACKDROP_SHEDS_PX = [   # long depot sheds east of the canal: [[px x, px y] north end, [px x, px y] south end, width m, height m]
    ((2130, 1010), (1960, 2250), 26, 11), ((2230, 1010), (2060, 2250), 26, 11), ((2330, 1010), (2160, 2250), 26, 11),
    ((1977, 1350), (1885, 1925), 8, 7)]


# ----------------------------------------------------------------------------------------------------------------
# Small geometry helpers
# ----------------------------------------------------------------------------------------------------------------
def r1(v):
    return round(v * 10) / 10


def point_in_polygon(x, z, poly):
    inside = False
    n = len(poly)
    for i in range(n):
        x1, z1 = poly[i]
        x2, z2 = poly[(i + 1) % n]
        if (z1 > z) != (z2 > z) and x < (x2 - x1) * (z - z1) / (z2 - z1) + x1:
            inside = not inside
    return inside


def dist_to_segment(x, z, a, b):
    dx, dz = b[0] - a[0], b[1] - a[1]
    L2 = dx * dx + dz * dz
    t = 0 if L2 == 0 else max(0, min(1, ((x - a[0]) * dx + (z - a[1]) * dz) / L2))
    return math.hypot(x - a[0] - t * dx, z - a[1] - t * dz)


def dist_to_polyline(x, z, pts, closed=False):
    n = len(pts)
    return min(dist_to_segment(x, z, pts[i], pts[(i + 1) % n]) for i in range(n if closed else n - 1))


def stadium(cx, cz, straight, radius, n=48):
    pts, hs = [], straight / 2
    for i in range(n + 1):
        a = math.pi * i / n
        pts.append((cx + radius * math.cos(a), cz + hs + radius * math.sin(a)))
    for i in range(n + 1):
        a = math.pi + math.pi * i / n
        pts.append((cx + radius * math.cos(a), cz - hs + radius * math.sin(a)))
    return pts


def in_stadium(x, z, cx, cz, straight, radius):
    dz = max(0.0, abs(z - cz) - straight / 2)
    return math.hypot(x - cx, dz) <= radius


def band_polygon(pts, width):
    """Polygon of a polyline widened to `width` (mitre-less: offsets along the averaged normal)."""
    left, right, h = [], [], width / 2
    for i, p in enumerate(pts):
        a, b = pts[max(0, i - 1)], pts[min(len(pts) - 1, i + 1)]
        dx, dz = b[0] - a[0], b[1] - a[1]
        n = math.hypot(dx, dz) or 1
        left.append((p[0] - dz / n * h, p[1] + dx / n * h))
        right.append((p[0] + dz / n * h, p[1] - dx / n * h))
    return left + right[::-1]


def simplify_ring(pts, eps):
    """Douglas-Peucker on a closed ring."""
    if len(pts) < 5:
        return pts
    # split at the two points farthest apart-ish (first point and the point farthest from it)
    far = max(range(len(pts)), key=lambda i: (pts[i][0] - pts[0][0]) ** 2 + (pts[i][1] - pts[0][1]) ** 2)

    def dp(seg):
        keep = [False] * len(seg)
        keep[0] = keep[-1] = True
        stack = [(0, len(seg) - 1)]
        while stack:
            a, b = stack.pop()
            if b <= a + 1:
                continue
            best, bi = -1, -1
            for i in range(a + 1, b):
                d = dist_to_segment(seg[i][0], seg[i][1], seg[a], seg[b])
                if d > best:
                    best, bi = d, i
            if best > eps:
                keep[bi] = True
                stack.append((a, bi))
                stack.append((bi, b))
        return [p for p, k in zip(seg, keep) if k]

    first = dp(pts[:far + 1])
    second = dp(pts[far:] + [pts[0]])
    return first[:-1] + second[:-1]


def ring_area(pts):
    s = 0.0
    for i in range(len(pts)):
        x1, z1 = pts[i]
        x2, z2 = pts[(i + 1) % len(pts)]
        s += x1 * z2 - x2 * z1
    return s / 2


# ----------------------------------------------------------------------------------------------------------------
# Grid helpers (lists of lists, [j][i] with j along z)
# ----------------------------------------------------------------------------------------------------------------
def grid_from_image(img):
    data = list(img.get_flattened_data() if hasattr(img, 'get_flattened_data') else img.getdata())
    w = img.width
    return [data[j * w:(j + 1) * w] for j in range(img.height)]


def image_from_grid(g):
    img = Image.new('L', (len(g[0]), len(g)))
    img.putdata([v for row in g for v in row])
    return img


def draw_mask(polys, circles=()):
    """Rasterise polygons/circles given in metres onto the cell grid; returns an 'L' image (255 inside)."""
    img = Image.new('L', (W, H), 0)
    d = ImageDraw.Draw(img)
    for poly in polys:
        d.polygon([((x - X0) / CELL, (z - Z0) / CELL) for x, z in poly], fill=255)
    for cx, cz, r in circles:
        d.ellipse([(cx - r - X0) / CELL, (cz - r - Z0) / CELL, (cx + r - X0) / CELL, (cz + r - Z0) / CELL], fill=255)
    return img


def chamfer(mask):
    """Distance (in cells, 3-4 chamfer) from each set cell to the nearest unset cell centre; 0 for unset cells."""
    INF = 10 ** 6
    d = [[INF if v else 0 for v in row] for row in mask]
    for j in range(H):
        row, up = d[j], d[j - 1] if j else None
        for i in range(W):
            v = row[i]
            if not v:
                continue
            if i:
                v = min(v, row[i - 1] + 3)
            else:
                v = min(v, 3)
            if up is not None:
                v = min(v, up[i] + 3)
                if i:
                    v = min(v, up[i - 1] + 4)
                if i < W - 1:
                    v = min(v, up[i + 1] + 4)
            else:
                v = min(v, 3)
            row[i] = v
    for j in range(H - 1, -1, -1):
        row, dn = d[j], d[j + 1] if j < H - 1 else None
        for i in range(W - 1, -1, -1):
            v = row[i]
            if not v:
                continue
            if i < W - 1:
                v = min(v, row[i + 1] + 3)
            else:
                v = min(v, 3)
            if dn is not None:
                v = min(v, dn[i] + 3)
                if i:
                    v = min(v, dn[i - 1] + 4)
                if i < W - 1:
                    v = min(v, dn[i + 1] + 4)
            else:
                v = min(v, 3)
            row[i] = v
    return [[v / 3.0 for v in row] for row in d]


def components(mask):
    """4-connected components of a boolean grid: list of lists of (i, j)."""
    seen = [[False] * W for _ in range(H)]
    out = []
    for j in range(H):
        for i in range(W):
            if mask[j][i] and not seen[j][i]:
                comp, stack = [], [(i, j)]
                seen[j][i] = True
                while stack:
                    a, b = stack.pop()
                    comp.append((a, b))
                    for da, db in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                        u, v = a + da, b + db
                        if 0 <= u < W and 0 <= v < H and mask[v][u] and not seen[v][u]:
                            seen[v][u] = True
                            stack.append((u, v))
                out.append(comp)
    return out


def contours(field, level=0.5):
    """Marching squares on a scalar grid whose nodes are the cell centres. Returns closed rings in metres
    (set side on the left when walking along the ring in x-east / z-south screen coordinates)."""
    hh, ww = len(field), len(field[0])
    # pad with zeros so every contour closes
    f = [[0.0] * (ww + 2)] + [[0.0] + list(row) + [0.0] for row in field] + [[0.0] * (ww + 2)]

    def node(i, j):                      # padded index -> metres
        return X0 + (i - 0.5) * CELL, Z0 + (j - 0.5) * CELL

    def cross(i1, j1, i2, j2):
        a, b = f[j1][i1], f[j2][i2]
        t = (level - a) / (b - a)
        x1, z1 = node(i1, j1)
        x2, z2 = node(i2, j2)
        return (x1 + (x2 - x1) * t, z1 + (z2 - z1) * t)

    nxt = {}                                   # edge key -> (edge key of the next point)
    pos = {}
    for j in range(hh + 1):
        for i in range(ww + 1):
            a, b, c, d = f[j][i] >= level, f[j][i + 1] >= level, f[j + 1][i + 1] >= level, f[j + 1][i] >= level   # TL TR BR BL
            code = a * 8 + b * 4 + c * 2 + d
            if code in (0, 15):
                continue
            T, R, B, L = ('h', i, j), ('v', i + 1, j), ('h', i, j + 1), ('v', i, j)
            for k, (p, q) in ((T, ((i, j), (i + 1, j))), (R, ((i + 1, j), (i + 1, j + 1))), (B, ((i, j + 1), (i + 1, j + 1))), (L, ((i, j), (i, j + 1)))):
                va, vb = f[p[1]][p[0]] >= level, f[q[1]][q[0]] >= level
                if va != vb and k not in pos:
                    pos[k] = cross(p[0], p[1], q[0], q[1])
            centre = (f[j][i] + f[j][i + 1] + f[j + 1][i + 1] + f[j + 1][i]) / 4 >= level
            # segments as (from edge, to edge), keeping the set side on the left
            table = {
                1: [(L, B)], 2: [(B, R)], 3: [(L, R)], 4: [(R, T)], 6: [(B, T)], 7: [(L, T)],
                8: [(T, L)], 9: [(T, B)], 11: [(T, R)], 12: [(R, L)], 13: [(R, B)], 14: [(B, L)],
                5: [(L, T), (R, B)] if centre else [(L, B), (R, T)],
                10: [(T, R), (B, L)] if centre else [(T, L), (B, R)],
            }
            for a_, b_ in table[code]:
                nxt[a_] = b_
    rings, used = [], set()
    for start in nxt:
        if start in used:
            continue
        ring, k = [], start
        while k not in used:
            used.add(k)
            ring.append(pos[k])
            k = nxt.get(k)
            if k is None:
                break
        if len(ring) >= 3:
            rings.append(ring)
    return rings


def polygons_from_mask(mask, eps, min_area, min_hole, level=0.5):
    """Boolean grid -> list of {outer, holes}: smooth the mask a little, contour at `level`, simplify."""
    img = image_from_grid([[255 if v else 0 for v in row] for row in mask])
    for _ in range(3):                                # about a 1.2 m Gaussian: takes the 1 m staircase out of slanted edges
        img = img.filter(ImageFilter.Kernel((3, 3), [1, 2, 1, 2, 4, 2, 1, 2, 1], 16))
    field = [[v / 255.0 for v in row] for row in grid_from_image(img)]
    outers, holes = [], []
    for ring in contours(field, level):
        ring = simplify_ring(ring, eps)
        if len(ring) < 3:
            continue
        a = ring_area(ring)
        (outers if a > 0 else holes).append((abs(a), ring))     # set side on the left gives outer rings a positive area here
    outers = [(a, r) for a, r in outers if a >= min_area]
    holes = [(a, r) for a, r in holes if a >= min_hole]
    outers.sort(key=lambda t: t[0])
    result = [dict(outer=r, holes=[], area=a) for a, r in outers]
    for a, hole in holes:
        hx, hz = hole[0]
        for poly in result:                      # smallest outer ring that contains the hole
            if poly['area'] > a and point_in_polygon(hx, hz, poly['outer']):
                poly['holes'].append(hole)
                break
    return result


def new_building_zones():
    """The new teaching building is newer than the mosaic, and its builder (src/world/builders/new-building.js) lays out
    its own plaza and garden from the 2022 footage around its own re-read footprint. Returns (footprint, garden zone,
    plaza zone) in metres, or None when that footprint cannot be read: nothing of the landscape goes into these zones.
      garden zone: from 30 m before corner A to 6 m past corner B along the north-west face, 2 m inside to 34 m outside it
      plaza zone:  from 6 m before corner E to 14 m past corner D along the south face, 2 m inside to 26 m outside it"""
    path = os.path.join(ROOT, 'src', 'world', 'builders', 'new-building.js')
    try:
        text = open(path, encoding='utf8').read()
        line = text[text.index('const FOOT = {'):]
        line = line[:line.index('}')]
        pts = {k: (float(x), float(z)) for k, x, z in re.findall(r'([A-E]):\s*\[\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*\]', line)}
        foot = [pts[k] for k in 'ABCDE']
    except (OSError, ValueError, KeyError):
        return None
    cx, cz = sum(p[0] for p in foot) / 5, sum(p[1] for p in foot) / 5

    def strip(p, q, before, after, inside, outside):
        dx, dz = q[0] - p[0], q[1] - p[1]
        n = math.hypot(dx, dz)
        ux, uz = dx / n, dz / n
        ox, oz = -uz, ux
        if (p[0] - cx) * ox + (p[1] - cz) * oz < 0:        # make (ox, oz) point away from the building
            ox, oz = -ox, -oz
        P = lambda s, d: (p[0] + ux * s + ox * d, p[1] + uz * s + oz * d)
        return [P(-before, -inside), P(n + after, -inside), P(n + after, outside), P(-before, outside)]

    A, B, C_, D, E = foot
    return foot, strip(A, B, 30, 6, 2, 34), strip(E, D, 6, 14, 2, 26)


# ----------------------------------------------------------------------------------------------------------------
def main():
    args = sys.argv[1:]
    if not args or args[0].startswith('-'):
        sys.exit(__doc__)
    mosaic_path = args[0]
    debug = args[args.index('--debug') + 1] if '--debug' in args else None

    M = json.load(open(os.path.join(ROOT, 'data', 'measurements.json'), encoding='utf8'))
    mpp = M['image']['metresPerPixel']
    lean_x, lean_y = M['image']['lean']['pxPerMetreOfHeight']          # roof displacement, px per metre of height
    iw, inn, ie, is_ = M['track']['infieldPx']
    off_e, off_s = M['track']['centreOffsetFromInfieldCentreMetres']
    ox, oy = (iw + ie) / 2 + off_e / mpp, (inn + is_) / 2 + off_s / mpp  # pixel of the model origin, as in build-campus-data.mjs

    def to_m(p):
        return ((p[0] - ox) * mpp, (p[1] - oy) * mpp)

    def to_px(x, z):
        return (x / mpp + ox, z / mpp + oy)

    src = open(os.path.join(ROOT, 'src', 'campus-data.js'), encoding='utf8').read()
    C = json.loads(src[src.index('{'):src.rindex('}') + 1])
    T, K = C['track'], C['courts']['block']
    track_r = T['outerRadius']

    im = Image.open(mosaic_path).convert('RGB')
    if im.size != tuple(M['image']['size']):
        sys.exit('unexpected mosaic size %r, expected %r' % (im.size, M['image']['size']))
    IW, IH = im.size

    # ------------------------------------------------------------------------------------------------------------
    # 1. Per-pixel classes. The mosaic is dark with a yellow cast (blue is low everywhere), so green minus red is the
    #    useful vegetation signal: tree crowns g-r >= 8 and dark; crowns on the canal banks are olive (g-r 1..7) and
    #    are told from dry grass and asphalt by their rough texture. Lawns are green but brighter. Hard surfaces are
    #    bright and not green.
    # ------------------------------------------------------------------------------------------------------------
    sm = im.filter(ImageFilter.BoxBlur(1))
    R, G, B = sm.split()
    V = ImageChops.lighter(ImageChops.lighter(R, G), B)
    gr = ImageChops.subtract(G, R, 1, 128)          # g - r + 128
    gb = ImageChops.subtract(G, B, 1, 128)
    V0 = ImageChops.lighter(ImageChops.lighter(*im.split()[:2]), im.split()[2])
    tex = ImageChops.difference(V0, V0.filter(ImageFilter.GaussianBlur(2))).filter(ImageFilter.BoxBlur(3))

    def th(img, lo, hi=255):
        return img.point(lambda v: 255 if lo <= v <= hi else 0)

    AND, OR = ImageChops.darker, ImageChops.lighter
    green_dark = AND(th(gr, 136), th(V, 0, 78))
    olive = AND(AND(th(gr, 129, 135), th(gb, 146)), AND(th(V, 45, 105), th(tex, 9)))
    canopy_px = OR(green_dark, olive)
    # Shadowed facades and shadowed ground also come out dark with a green cast (g-r about 8..10). Where a building or its
    # shadow is expected, only clearly green or sunlit pixels count as crown.
    canopy_strict_px = AND(canopy_px, OR(th(gr, 141), th(V, 52)))
    # Over the canal, shaded water is as dark and green as a crown but smooth: there a crown must also be rough.
    canopy_water_px = AND(canopy_px, th(tex, 9))
    lawn_px = AND(th(gr, 136), th(V, 79, 175))
    paved_px = AND(th(V, 100), th(gr, 0, 134))

    box = to_px(X0, Z0) + to_px(X1, Z1)

    def cells(mask):                                 # fraction (0..255) of each 1 m cell covered by a pixel mask
        return grid_from_image(mask.resize((W, H), Image.BOX, box=box))

    cf, cfs, cfw, lf, pf = cells(canopy_px), cells(canopy_strict_px), cells(canopy_water_px), cells(lawn_px), cells(paved_px)

    # ------------------------------------------------------------------------------------------------------------
    # 2. Canal: water edges found row by row (longest smooth green run near the expected place), fitted by straight lines.
    # ------------------------------------------------------------------------------------------------------------
    spx, tpx = im.filter(ImageFilter.BoxBlur(2)).load(), tex.load()

    def waterlike(x, y):
        r, g, b = spx[x, y]
        return g - r >= 8 and 35 <= g <= 112 and tpx[x, y] <= 10

    rows = []
    for y in range(460, IH - 4, 25):
        guess = 1763 - 0.16 * (y - 1300)
        best = None
        x = int(guess) - 80
        while x < min(IW - 1, guess + 200):
            if waterlike(x, y):
                x_start, gap, last = x, 0, x
                while x < IW - 1 and gap < 6:
                    if waterlike(x, y):
                        gap, last = 0, x
                    else:
                        gap += 1
                    x += 1
                if best is None or last - x_start > best[1] - best[0]:
                    best = (x_start, last)
            x += 1
        if best and 55 <= best[1] - best[0] <= 110:
            rows.append((y, best[0], best[1]))

    def fit(points):                                # robust straight line x = a + b*y: least squares, drop outliers, refit
        pts = list(points)
        for _ in range(3):
            n = len(pts)
            my, mx = sum(p[0] for p in pts) / n, sum(p[1] for p in pts) / n
            b = sum((p[0] - my) * (p[1] - mx) for p in pts) / sum((p[0] - my) ** 2 for p in pts)
            a = mx - b * my
            res = [abs(p[1] - (a + b * p[0])) for p in pts]
            rms = math.sqrt(sum(v * v for v in res) / n)
            keep = [p for p, v in zip(pts, res) if v <= max(2.0 * rms, 4)]
            if len(keep) == len(pts):
                break
            pts = keep
        return a, b, rms, len(pts)

    wa, wb, wrms, wn = fit([(y, x0) for y, x0, x1 in rows])
    ea, eb, erms, en = fit([(y, x1) for y, x0, x1 in rows])
    # The east edge is hidden by the crowns of the east-bank trees and their shadow on the water, so only its mean
    # offset from the west edge is used: the canal is drawn with parallel banks.
    width_px = sum(x1 - x0 for y, x0, x1 in rows) / len(rows)
    canal_w = [to_m((wa + wb * y, y)) for y in (0, IH)]
    canal_e = [to_m((wa + wb * y + width_px, y)) for y in (0, IH)]
    canal_width_m = width_px * mpp * math.cos(math.atan(wb))            # perpendicular to the banks
    canal_poly = [canal_w[0], canal_e[0], canal_e[1], canal_w[1]]
    cdir = (canal_w[1][0] - canal_w[0][0], canal_w[1][1] - canal_w[0][1])
    cl = math.hypot(*cdir)
    cdir = (cdir[0] / cl, cdir[1] / cl)
    cnorm = (cdir[1], -cdir[0])                                         # points east (from the west bank across the water)

    def canal_offset(x, z):                          # signed distance east of the west water edge, metres
        return (x - canal_w[0][0]) * cnorm[0] + (z - canal_w[0][1]) * cnorm[1]

    # ------------------------------------------------------------------------------------------------------------
    # 3. Known shapes on the cell grid
    # ------------------------------------------------------------------------------------------------------------
    survey = [to_m(p) for p in SURVEY_PX]
    roads = []
    for rd in ROADS_PX:
        pts = [to_m(p) for p in rd['px']]
        roads.append(dict(id=rd['id'], name=rd['name'], widthM=rd['width'], surface=rd['surface'],
                          points=[[r1(x), r1(z)] for x, z in pts], source=rd['source'], confidence=rd['confidence'],
                          measuredBy='landscape agent, single reading', _pts=pts))
    tennis = dict(surround=[to_m(p) for p in TENNIS_PX['surround']], courts=[[to_m(p) for p in c] for c in TENNIS_PX['courts']])

    solids, plazas, gardens = [], [], []             # items as (id, kind, geometry)
    for it in C['items']:
        if it['height'] > 0:
            solids.append(it)
        elif it['style'] == 'plaza':
            plazas.append(it)
        elif it['style'] == 'garden':
            gardens.append(it)

    def item_poly(it, n=40):
        if it['shape'] == 'circle':
            return [(it['cx'] + it['radius'] * math.cos(i / n * 2 * math.pi), it['cz'] + it['radius'] * math.sin(i / n * 2 * math.pi)) for i in range(n)]
        return [tuple(p) for p in it['points']]

    def shifted(poly, h):                            # where something at height h above this outline appears, as ground metres
        return [(x + lean_x * h * mpp, z + lean_y * h * mpp) for x, z in poly]

    footprint_img = draw_mask([item_poly(it) for it in solids])
    roof_img = draw_mask([shifted(item_poly(it), it['height']) for it in solids])
    # the whole apparent building (roof image plus the facade band between it and the ground outline)
    apparent_img = draw_mask([shifted(item_poly(it), it['height'] * k / 8) for it in solids for k in range(9)])
    # ... and the ground its shadow is expected to cover (the sun stood in the south-east)
    shadow_img = draw_mask([[(x + SHADOW_SWEEP[0] * it['height'] * k / 8, z + SHADOW_SWEEP[1] * it['height'] * k / 8) for x, z in item_poly(it)]
                            for it in solids for k in range(9)])
    track_img = draw_mask([stadium(T['cx'], T['cz'], T['straight'], track_r)])
    apron_img = draw_mask([stadium(T['cx'], T['cz'], T['straight'], track_r + APRON - 1.0)])     # my polygons reach 1 m under the apron
    courts_poly = [(K['w'], K['n']), (K['e'], K['n']), (K['e'], K['s']), (K['w'], K['s'])]
    courts_img = draw_mask([courts_poly])
    water_img = draw_mask([canal_poly])
    survey_img = draw_mask([survey])
    road_img = draw_mask([band_polygon(rd['_pts'], rd['widthM']) for rd in roads])
    garden_img = draw_mask([item_poly(it) for it in gardens])
    plaza_img = draw_mask([item_poly(it) for it in plazas])
    tennis_img = draw_mask([tennis['surround']])
    hard_img = draw_mask([[to_m(p) for p in HARD_COURT_PX]])
    zones = new_building_zones()
    if zones:
        nb_foot, nb_garden, nb_plaza = zones
        nb_garden_img = draw_mask([nb_garden])
        nb_plaza_img = ImageChops.lighter(draw_mask([nb_plaza]), draw_mask([nb_foot]).filter(ImageFilter.MaxFilter(17)))   # footprint grown 8 m
    else:
        print('WARNING: footprint of the new teaching building not found in src/world/builders/new-building.js; its surroundings are not kept clear')
        nb_garden_img = nb_plaza_img = Image.new('L', (W, H), 0)
    nb_garden_m, nb_plaza_m = grid_from_image(nb_garden_img), grid_from_image(nb_plaza_img)
    # canal banks: 12 m west of the west edge (up to the road) and 9 m east of the east edge
    bank_w = [(x - cnorm[0] * 12, z - cnorm[1] * 12) for x, z in canal_w]
    bank_e = [(x + cnorm[0] * 9, z + cnorm[1] * 9) for x, z in canal_e]
    bank_img = draw_mask([[bank_w[0], canal_w[0], canal_w[1], bank_w[1]], [canal_e[0], bank_e[0], bank_e[1], canal_e[1]]])

    g = grid_from_image
    footprint, roof, apparent, track_m, apron_m, courts_m = g(footprint_img), g(roof_img), g(apparent_img), g(track_img), g(apron_img), g(courts_img)
    doubt = g(ImageChops.lighter(apparent_img, shadow_img))
    water, survey_m, road_m, garden_m, plaza_m, tennis_m, bank_m = g(water_img), g(ImageChops.lighter(survey_img, bank_img)), g(road_img), g(garden_img), g(ImageChops.lighter(plaza_img, hard_img)), g(tennis_img), g(bank_img)
    road_wide = g(road_img.filter(ImageFilter.MaxFilter(3)))
    footprint_wide = g(footprint_img.filter(ImageFilter.MaxFilter(3)))

    # ------------------------------------------------------------------------------------------------------------
    # 4. Trees
    # ------------------------------------------------------------------------------------------------------------
    canopy = [[(cfw if water[j][i] else cfs if doubt[j][i] else cf)[j][i] >= 128 and not roof[j][i] and not track_m[j][i] and not courts_m[j][i] and not tennis_m[j][i]
               and not nb_garden_m[j][i] and not nb_plaza_m[j][i]
               for i in range(W)] for j in range(H)]
    # close one-cell holes (sunlit specks inside a crown)
    cimg = image_from_grid([[255 if v else 0 for v in row] for row in canopy]).filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.MinFilter(3))
    canopy = [[v > 0 and not nb_garden_m[j][i] and not nb_plaza_m[j][i] for i, v in enumerate(row)] for j, row in enumerate(grid_from_image(cimg))]
    canopy_area = sum(v for row in canopy for v in row) * CELL * CELL
    dist = chamfer(canopy)

    rnd = random.Random(20221117)
    cand = [(dist[j][i], i, j) for j in range(H) for i in range(W) if dist[j][i] >= CROWN_R_MIN + 0.5]
    cand.sort(key=lambda t: (-t[0], t[2], t[1]))
    bucket, crowns = {}, []                           # crowns: (x, z, r) of the crown AS SEEN (not yet corrected for lean)
    for d, i, j in cand:
        r = min(d - 0.5, CROWN_R_MAX)
        x, z = X0 + (i + 0.5) * CELL, Z0 + (j + 0.5) * CELL
        bi, bj = int(x // 12), int(z // 12)
        ok = True
        for u in (bi - 1, bi, bi + 1):
            for v in (bj - 1, bj, bj + 1):
                for (x2, z2, r2) in bucket.get((u, v), ()):
                    if (x - x2) ** 2 + (z - z2) ** 2 < (SPACING * (r + r2)) ** 2:
                        ok = False
                        break
                if not ok:
                    break
            if not ok:
                break
        if ok:
            bucket.setdefault((bi, bj), []).append((x, z, r))
            crowns.append((x, z, r))

    def tree_height(r):
        return TREE_H_MIN + (TREE_H_MAX - TREE_H_MIN) * (r - CROWN_R_MIN) / (CROWN_R_MAX - CROWN_R_MIN)

    solid_polys = [(it['id'], item_poly(it)) for it in solids]
    court_row_x = K['w'] - 1.6                        # the six trees src/world/extras/courts.js already plants, just outside the west fence
    road_bands = [(rd['id'], rd['_pts'], rd['widthM']) for rd in roads]
    dropped = dict(insideBuilding=0, onTrackOrApron=0, onCourts=0, onTennisCourts=0, onRoad=0, inCanal=0, onPlaza=0, newBuildingSite=0,
                   nearExistingCourtTrees=0, nearModelFurniture=0, outsideWindow=0)
    trees, by_building, moved, trimmed = [], {}, dict(offRoad=0, offCourts=0, ontoCanalBank=0), 0
    for cx, cz, r in crowns:
        h = tree_height(r) + rnd.uniform(-0.5, 0.5)
        h = max(TREE_H_MIN, min(TREE_H_MAX, h))
        hc = CROWN_CENTRE * h
        x = cx - lean_x * hc * mpp + rnd.uniform(-0.8, 0.8)          # crown as seen -> trunk on the ground, plus a little jitter
        z = cz - lean_y * hc * mpp + rnd.uniform(-0.8, 0.8)
        # Roadside rows, the rows along the court fence and the rows on the canal banks: the crowns overhang the road, the
        # court or the water and the trunk position is uncertain by a few metres, so a trunk that lands just inside such an
        # edge is put just outside it (deeper inside it is dropped below).
        for _id, pts, width in road_bands:
            d = dist_to_polyline(x, z, pts)
            if width / 2 - 2.5 <= d < width / 2 + 1.0:
                # move straight away from the nearest point of the centreline
                best = None
                for i in range(len(pts) - 1):
                    a, b = pts[i], pts[i + 1]
                    dx, dz = b[0] - a[0], b[1] - a[1]
                    L2 = dx * dx + dz * dz
                    t = max(0, min(1, ((x - a[0]) * dx + (z - a[1]) * dz) / L2))
                    qx, qz = a[0] + t * dx, a[1] + t * dz
                    dd = math.hypot(x - qx, z - qz)
                    if best is None or dd < best[0]:
                        best = (dd, qx, qz)
                dd, qx, qz = best
                if dd > 0.05:
                    k = (width / 2 + 1.0) / dd
                    x, z, moved['offRoad'] = qx + (x - qx) * k, qz + (z - qz) * k, moved['offRoad'] + 1
        if K['w'] - 1 <= x <= K['e'] + 1 and K['n'] - 1 <= z <= K['s'] + 1:
            gaps = [(x - (K['w'] - 1), -1, 0), ((K['e'] + 1) - x, 1, 0), (z - (K['n'] - 1), 0, -1), ((K['s'] + 1) - z, 0, 1)]
            gdist, sx, sz = min(gaps)
            if gdist <= 4:
                x, z, moved['offCourts'] = x + sx * (gdist + 0.3), z + sz * (gdist + 0.3), moved['offCourts'] + 1
        off = canal_offset(x, z)
        if -2 < off < 4.5:
            x, z, moved['ontoCanalBank'] = x - cnorm[0] * (off + 2), z - cnorm[1] * (off + 2), moved['ontoCanalBank'] + 1
        elif canal_width_m - 4.5 < off < canal_width_m + 2:
            k = canal_width_m + 2 - off
            x, z, moved['ontoCanalBank'] = x + cnorm[0] * k, z + cnorm[1] * k, moved['ontoCanalBank'] + 1

        why, d_building = None, 99.0
        if not (X0 <= x <= X1 and Z0 <= z <= Z1):
            why = 'outsideWindow'
        if not why:
            for _id, poly in solid_polys:
                d = dist_to_polyline(x, z, poly, True)
                if point_in_polygon(x, z, poly) or d < BUILDING_MARGIN:
                    why = 'insideBuilding'
                    by_building[_id] = by_building.get(_id, 0) + 1
                    break
                d_building = min(d_building, d)
        if not why and in_stadium(x, z, T['cx'], T['cz'], T['straight'], track_r + APRON + 2.5):
            why = 'onTrackOrApron'                    # apron, long-jump runway and pits
        if not why and K['w'] - 1 <= x <= K['e'] + 1 and K['n'] - 1 <= z <= K['s'] + 1:
            why = 'onCourts'
        if not why and (point_in_polygon(x, z, tennis['surround']) or dist_to_polyline(x, z, tennis['surround'], True) < 1):
            why = 'onTennisCourts'
        if not why:
            for _id, pts, width in road_bands:
                if dist_to_polyline(x, z, pts) < width / 2 + 0.6:
                    why = 'onRoad'
                    break
        if not why and -1.5 <= canal_offset(x, z) <= canal_width_m + 1.5:
            why = 'inCanal'
        if not why and 0 <= int(x - X0) < W and 0 <= int(z - Z0) < H and (nb_garden_m[int(z - Z0)][int(x - X0)] or nb_plaza_m[int(z - Z0)][int(x - X0)]):
            why = 'newBuildingSite'
        if not why and any(point_in_polygon(x, z, item_poly(it)) for it in plazas):
            why = 'onPlaza'
        if not why and abs(x - court_row_x) < 3.5 and K['n'] <= z <= K['s']:
            why = 'nearExistingCourtTrees'
        if not why and any(math.hypot(x - a, z - b) < rr for a, b, rr, _ in KEEP_CLEAR):
            why = 'nearModelFurniture'
        if why:
            dropped[why] += 1
            continue
        inside = point_in_polygon(x, z, survey) or -12 <= canal_offset(x, z) <= canal_width_m + 9
        r_draw = min(r, max(1.2, d_building - 0.4))      # a crown must not poke through a wall
        trimmed += r_draw < r
        trees.append(dict(x=x, z=z, h=h, r=r_draw, r_seen=r, inside=inside, away=0 if inside else dist_to_polyline(x, z, survey, True), cx=cx, cz=cz))

    # cap: keep everything inside the surveyed area first (largest crowns first if even that is too many), then the
    # trees outside it nearest to its edge
    n_before_cap = len(trees)
    trees.sort(key=lambda t: (0, -t['r']) if t['inside'] else (1, t['away']))
    cut = trees[MAX_TREES:]
    trees = trees[:MAX_TREES]
    cap_note = 'nothing'
    if cut:
        cut_in = [t for t in cut if t['inside']]
        cut_out = [t for t in cut if not t['inside']]
        parts = []
        if cut_in:
            parts.append('%d inside the surveyed area (the smallest crowns, radius <= %.1f m)' % (len(cut_in), max(t['r'] for t in cut_in)))
        if cut_out:
            parts.append('%d outside the surveyed area, the ones farthest from it (more than %.0f m from its edge)' % (len(cut_out), min(t['away'] for t in cut_out)))
        cap_note = '%d trees: ' % len(cut) + ' and '.join(parts)
    trees.sort(key=lambda t: (round(t['z']), t['x']))

    # ------------------------------------------------------------------------------------------------------------
    # 5. Ground cover on the 1 m grid
    # ------------------------------------------------------------------------------------------------------------
    NONE, LAWN, PAVED, UNKNOWN = 0, 1, 2, 3
    label = [[UNKNOWN] * W for _ in range(H)]
    for j in range(H):
        for i in range(W):
            if pf[j][i] >= 128 and cf[j][i] < 100:
                v = PAVED
            elif lf[j][i] >= 140 and cf[j][i] < 90:
                v = LAWN
            elif canopy[j][i]:
                v = LAWN                              # ASSUMED: the ground hidden under tree crowns is planted
            else:
                v = UNKNOWN                           # shadow, dark surfaces
            if apparent[j][i] or track_m[j][i] or courts_m[j][i]:
                v = UNKNOWN                           # the image shows a building, the track or a court here, not open ground
            if bank_m[j][i] or garden_m[j][i]:
                v = LAWN                              # canal banks (2018 footage: grass under the tree rows); gardens recorded as items
            if road_wide[j][i]:
                v = UNKNOWN                           # roads are drawn on top; what lies beside them continues underneath, so the
                                                      # visible edge is the straight road edge and not a ragged class boundary
            if plaza_m[j][i]:
                v = PAVED                             # plaza items and the hard court read by hand
            if nb_garden_m[j][i]:
                v = LAWN                              # new teaching building: plain lawn under its garden,
            if nb_plaza_m[j][i]:
                v = PAVED                             # plain paving under and around the building and its plaza
            label[j][i] = v
    # fill the unknown cells from the nearest known cell (breadth first), buildings then stand on whatever surrounds them
    frontier = [(i, j) for j in range(H) for i in range(W) if label[j][i] != UNKNOWN]
    while frontier:
        new = []
        for i, j in frontier:
            v = label[j][i]
            for di, dj in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                a, b = i + di, j + dj
                if 0 <= a < W and 0 <= b < H and label[b][a] == UNKNOWN:
                    label[b][a] = v
                    new.append((a, b))
        frontier = new
    for j in range(H):
        for i in range(W):
            if footprint[j][i]:
                label[j][i] = PAVED                   # under buildings: paving, so no seam shows along the walls
    # majority filter, twice
    for _ in range(2):
        out = [row[:] for row in label]
        for j in range(1, H - 1):
            for i in range(1, W - 1):
                n_l = n_p = 0
                for b in (j - 1, j, j + 1):
                    row = label[b]
                    for a in (i - 1, i, i + 1):
                        if row[a] == LAWN:
                            n_l += 1
                        elif row[a] == PAVED:
                            n_p += 1
                out[j][i] = LAWN if n_l > n_p else PAVED
        label = out
    for j in range(H):
        for i in range(W):
            if footprint_wide[j][i]:
                label[j][i] = PAVED                   # again after the filter: lawn stops at least half a metre short of every wall
    # what the model already draws itself, and everything outside the surveyed area, is left out
    for j in range(H):
        for i in range(W):
            if not survey_m[j][i] or apron_m[j][i] or water[j][i] or tennis_m[j][i]:
                label[j][i] = NONE
            elif courts_m[j][i] and K['w'] + 1 <= X0 + i + 0.5 <= K['e'] - 1 and K['n'] + 1 <= Z0 + j + 0.5 <= K['s'] - 1:
                label[j][i] = NONE
    # drop specks
    for cls, min_cells in ((LAWN, 20), (PAVED, 20)):
        other = PAVED if cls == LAWN else LAWN
        for comp in components([[v == cls for v in row] for row in label]):
            if len(comp) < min_cells:
                for i, j in comp:
                    label[j][i] = other
    lawn_polys = polygons_from_mask([[v == LAWN for v in row] for row in label], 0.3, 6, 6, 0.3)   # level 0.3: lawn reaches about 0.4 m under the paving
    # (which lies 2 mm higher), so the separately simplified outlines leave no gap of bare ground between the two
    paved_polys = polygons_from_mask([[v == PAVED for v in row] for row in label], 0.3, 6, 6)
    lawn_area = sum(v == LAWN for row in label for v in row) * CELL * CELL
    paved_area = sum(v == PAVED for row in label for v in row) * CELL * CELL

    # which trees get a trunk collider: those standing within 3 m of paving or a road (somewhere people walk)
    for t in trees:
        i, j = int((t['x'] - X0) / CELL), int((t['z'] - Z0) / CELL)
        near = False
        for b in range(max(0, j - 3), min(H, j + 4)):
            for a in range(max(0, i - 3), min(W, i + 4)):
                if label[b][a] == PAVED or road_m[b][a]:
                    near = True
        t['solid'] = 1 if near and t['inside'] else 0

    # ------------------------------------------------------------------------------------------------------------
    # 6. Output
    # ------------------------------------------------------------------------------------------------------------
    def ring(pts):
        return [[r1(x), r1(z)] for x, z in pts]

    backdrop_towers = []
    for px, py, h in BACKDROP_TOWERS_PX:
        x, z = to_m((px - lean_x * h, py - lean_y * h))
        backdrop_towers.append([round(x), round(z), h])
    backdrop_sheds = []
    for a, b, width, h in BACKDROP_SHEDS_PX:
        (xa, za), (xb, zb) = to_m(a), to_m(b)
        backdrop_sheds.append([round(xa), round(za), round(xb), round(zb), width, h])

    data = {
        'generatedBy': 'scripts/make-landscape.py from the zoom-19 satellite mosaic (not in the repository) - do not edit by hand',
        'frame': 'x east, z south, metres; origin = centre of the running track (same frame as src/campus-data.js)',
        'window': {'west': X0, 'east': X1, 'north': Z0, 'south': Z1, 'cellSizeM': CELL},
        'caveats': [
            'Everything here comes from ONE oblique satellite image; positions are good to a few metres at best.',
            'The image is older than the new teaching building: an earlier building stands on its site, so nothing near it (z < -190 m) is reliable.',
            'surveyArea is only the area in which ground cover was classified. It is not a surveyed campus boundary.',
        ],
        'surveyArea': ring(survey),
        'newBuildingSite': {
            'note': 'The new teaching building is newer than the mosaic and its builder lays out its own plaza and garden (2022 footage) around its own '
                    're-read footprint. No tree is placed in these zones; the ground there is plain lawn (garden zone) and plain paving (plaza zone and '
                    'footprint grown 8 m) for the builder to draw on.',
            'gardenZone': ring(zones[1]) if zones else None, 'plazaZone': ring(zones[2]) if zones else None,
        },
        'trees': {
            'count': len(trees),
            'fields': ['x', 'z', 'height', 'crownRadius (trimmed where a building is closer than the crown seen)', 'trunkCollides', 'castsShadow'],
            'method': 'Canopy = pixels with (g-r >= 8 and brightness <= 78) or olive rough pixels (g-r 1..7, g-b >= 18, brightness 45..105, '
                      'texture >= 9), on a 1 m grid (cell is canopy when half its pixels are). Trees are placed greedily at the cells deepest '
                      'inside the canopy (3-4 chamfer distance), crown radius = that depth capped at %.1f m, neighbours at least %.1f x (r1 + r2) apart. '
                      'Height %.0f..%.0f m in proportion to crown radius, +-0.5 m. The trunk is the crown centre moved back by the lean of the oblique view for a '
                      'point at %.1f x height (%.2f px west and %.2f px north per metre), with +-0.8 m of jitter.' % (
                          CROWN_R_MAX, SPACING, TREE_H_MIN, TREE_H_MAX, CROWN_CENTRE, -lean_x, lean_y),
            'heightsAreAssumed': True,
            'canopyAreaM2': round(canopy_area),
            'candidates': len(crowns),
            'dropped': dropped,
            'trunksMoved': moved,
            'trunksMovedNote': 'A trunk that landed up to 2.5 m inside a road edge, up to 4 m inside the edge of the courts block or over the '
                               'edge of the canal belongs to a row standing along that edge (the crown overhangs it): it was put 1 m outside the '
                               'edge instead of being dropped. Trunks deeper inside were dropped.',
            'crownsTrimmed': trimmed,
            'beforeCap': n_before_cap,
            'cap': MAX_TREES,
            'droppedByCap': cap_note,
            'list': [[r1(t['x']), r1(t['z']), r1(t['h']), r1(t['r']), t['solid'], 1 if t['inside'] else 0] for t in trees],
        },
        'ground': {
            'method': 'Per 1 m cell: paving = at least half the pixels bright (max channel >= 100) and not green (g-r <= 6); lawn = at least 55 % of the '
                      'pixels green (g-r >= 8) and bright (79..175). ASSUMED: ground under tree crowns is planted (lawn); canal banks are lawn. Cells showing '
                      'buildings, shadow or dark surfaces take the class of the nearest classified cell. 3 x 3 majority filter twice, specks under 20 m2 '
                      'removed, outlines by marching squares on the grid smoothed over about 1.2 m, simplified to 0.3 m (the lawn outline is taken about 0.4 m wider so that it runs under the edge of the paving and no bare gap shows). Roads are drawn on top of whatever lies beside them. Roofs of buildings that are not in campus-data.js '
                      'come out as paving.',
            'lawnAreaM2': round(lawn_area), 'pavingAreaM2': round(paved_area),
            'lawn': [{'outer': ring(p['outer']), 'holes': [ring(h) for h in p['holes']]} for p in lawn_polys],
            'paving': [{'outer': ring(p['outer']), 'holes': [ring(h) for h in p['holes']]} for p in paved_polys],
        },
        'roads': [{k: v for k, v in rd.items() if not k.startswith('_')} for rd in roads],
        'canal': {
            'westEdge': ring(canal_w), 'eastEdge': ring(canal_e), 'widthM': r1(canal_width_m),
            'method': 'Water found on %d image rows (every 25 px from y 460 to the bottom edge) as the longest smooth green run; west edge fitted by a '
                      'straight line x = %.1f %+.4f * y px (rms %.1f px over %d rows). The east edge is hidden by tree crowns and their shadow, so the banks '
                      'are drawn parallel at the mean detected width (%.0f px; a separate fit of the east edge has rms %.1f px). North of y 460 (z < %.0f m) '
                      'the canal passes under a road bridge and is extrapolated.' % (len(rows), wa, wb, wrms, wn, width_px, erms, to_m((0, 460))[1]),
            'confidence': 'seen in satellite and in the 2018 footage (frames 2-5): walled channel, tree rows on both banks. Water level and wall height not measured.',
        },
        'tennisCourts': {
            'surround': ring(tennis['surround']), 'courts': [ring(c) for c in tennis['courts']],
            'confidence': 'seen in satellite only; single reading, +-1.5 m; whether they belong to the school is not confirmed',
        },
        'backdrop': {
            'notMeasured': True,
            'note': 'Rough positions off a 0.4x overview (+-15 m or worse), generic sizes. Towers: [x, z, height]; sheds: [x1, z1, x2, z2, width, height].',
            'towers': backdrop_towers, 'sheds': backdrop_sheds,
        },
    }

    def dump(obj, indent=0):                         # JSON with short arrays kept on one line
        pad = ' ' * indent
        if isinstance(obj, dict):
            if not obj:
                return '{}'
            return '{\n' + ',\n'.join('%s  %s: %s' % (pad, json.dumps(k), dump(v, indent + 2)) for k, v in obj.items()) + '\n' + pad + '}'
        if isinstance(obj, list):
            flat = json.dumps(obj, ensure_ascii=False, separators=(', ', ': '))
            if not any(isinstance(v, dict) for v in obj):
                if len(flat) <= 150 or not any(isinstance(v, list) for v in obj):
                    return flat
                # list of rows: a few per line
                lines, line = [], ''
                for v in obj:
                    s = json.dumps(v, ensure_ascii=False, separators=(', ', ': '))
                    if line and len(line) + len(s) > 150:
                        lines.append(line)
                        line = ''
                    line += (', ' if line else '') + s
                lines.append(line)
                return '[\n' + ',\n'.join(pad + '  ' + ln for ln in lines) + '\n' + pad + ']'
            return '[\n' + ',\n'.join(pad + '  ' + dump(v, indent + 2) for v in obj) + '\n' + pad + ']'
        return json.dumps(obj, ensure_ascii=False)

    out_json = os.path.join(ROOT, 'data', 'landscape.json')
    with open(out_json, 'w', encoding='utf8') as fh:
        fh.write(dump(data) + '\n')
    json.load(open(out_json, encoding='utf8'))       # must parse

    js_path = os.path.join(ROOT, 'src', 'world', 'extras', 'landscape.js')
    minimal = {k: data[k] for k in ('window', 'trees', 'ground', 'roads', 'canal', 'tennisCourts', 'backdrop')}
    minimal = json.loads(json.dumps(minimal))
    for k in ('method', 'fields', 'dropped', 'droppedByCap'):
        minimal['trees'].pop(k, None)
    minimal['ground'].pop('method', None)
    minimal['canal'].pop('method', None)
    for rd in minimal['roads']:
        for k in ('source', 'measuredBy', 'confidence', 'name'):
            rd.pop(k, None)
    block = ('/* <landscape-data> generated by scripts/make-landscape.py - do not edit by hand; readable copy with sources: data/landscape.json */\n'
             'const DATA = {\n' + ',\n'.join('  %s: %s' % (json.dumps(k), json.dumps(v, ensure_ascii=False, separators=(',', ':'))) for k, v in minimal.items())
             + '\n};\n/* </landscape-data> */')
    if os.path.exists(js_path):
        js = open(js_path, encoding='utf8').read()
        pat = re.compile(r'/\* <landscape-data>.*?/\* </landscape-data> \*/', re.S)
        if not pat.search(js):
            sys.exit('marker comments not found in ' + js_path)
        js = pat.sub(lambda m: block, js, count=1)
        with open(js_path, 'w', encoding='utf8') as fh:
            fh.write(js)
    else:
        print('NOTE: %s does not exist, only the JSON was written' % js_path)

    print('canal: %d rows, west edge x = %.1f %+.4f*y px (rms %.1f), width %.1f px = %.1f m' % (len(rows), wa, wb, wrms, width_px, canal_width_m))
    print('canopy %.0f m2 -> %d crowns; dropped %s; %d before cap; cap dropped: %s' % (canopy_area, len(crowns), dropped, n_before_cap, cap_note))
    print('moved', moved, 'crowns trimmed near buildings', trimmed)
    print('trunks that fell inside a building, by building:', dict(sorted(by_building.items(), key=lambda kv: -kv[1])))
    print('trees %d (with collider %d, inside survey area %d)' % (len(trees), sum(t['solid'] for t in trees), sum(t['inside'] for t in trees)))
    print('lawn %d polygons / %d holes / %d vertices, %.0f m2; paving %d / %d / %d, %.0f m2' % (
        len(lawn_polys), sum(len(p['holes']) for p in lawn_polys), sum(len(p['outer']) + sum(len(h) for h in p['holes']) for p in lawn_polys), lawn_area,
        len(paved_polys), sum(len(p['holes']) for p in paved_polys), sum(len(p['outer']) + sum(len(h) for h in p['holes']) for p in paved_polys), paved_area))
    print('wrote', out_json, os.path.getsize(out_json), 'bytes;', js_path, os.path.getsize(js_path) if os.path.exists(js_path) else 0, 'bytes')

    if debug:
        os.makedirs(debug, exist_ok=True)
        # (a) class grid
        pal = {NONE: (40, 40, 40), LAWN: (90, 170, 70), PAVED: (200, 195, 180)}
        cls = Image.new('RGB', (W, H))
        cls.putdata([pal[v] for row in label for v in row])
        cls = cls.resize((W * 3, H * 3), Image.NEAREST)
        d = ImageDraw.Draw(cls)
        for t in trees:
            px, pz = (t['x'] - X0) * 3, (t['z'] - Z0) * 3
            d.ellipse([px - t['r'] * 3, pz - t['r'] * 3, px + t['r'] * 3, pz + t['r'] * 3], outline=(0, 90, 0))
        cls.save(os.path.join(debug, 'labels.png'))
        # (b) the mosaic with crowns put back where they are seen, trunks, outlines
        x0p, y0p = [int(v) for v in to_px(X0, Z0)]
        x1p, y1p = [int(v) + 1 for v in to_px(X1, Z1)]
        ov = im.crop((x0p, y0p, x1p, y1p)).point(lambda v: min(255, int(v * 1.5) + 20))
        d = ImageDraw.Draw(ov)

        def P(x, z):
            a, b = to_px(x, z)
            return (a - x0p, b - y0p)
        for _id, poly in solid_polys:
            d.polygon([P(x, z) for x, z in poly], outline=(255, 0, 255))
        d.polygon([P(x, z) for x, z in survey], outline=(255, 255, 255))
        for rd in roads:
            d.polygon([P(x, z) for x, z in band_polygon(rd['_pts'], rd['widthM'])], outline=(0, 200, 255))
        d.polygon([P(x, z) for x, z in canal_poly], outline=(0, 120, 255))
        d.polygon([P(x, z) for x, z in stadium(T['cx'], T['cz'], T['straight'], track_r + APRON)], outline=(255, 160, 0))
        d.polygon([P(x, z) for x, z in courts_poly], outline=(255, 160, 0))
        for t in trees:
            a, b = P(t['cx'], t['cz'])
            rr = t['r_seen'] / mpp
            d.ellipse([a - rr, b - rr, a + rr, b + rr], outline=(255, 255, 0))
            a, b = P(t['x'], t['z'])
            d.ellipse([a - 2, b - 2, a + 2, b + 2], fill=(255, 0, 0) if t['solid'] else (255, 140, 0))
        ov.save(os.path.join(debug, 'trees_on_mosaic.jpg'), quality=90)
        for name, (a, b, c, e) in dict(nw=(0, 0, 0.5, 0.5), ne=(0.5, 0, 1, 0.5), sw=(0, 0.5, 0.5, 1), se=(0.5, 0.5, 1, 1)).items():
            ov.crop((int(a * ov.width), int(b * ov.height), int(c * ov.width), int(e * ov.height))).save(os.path.join(debug, 'trees_on_mosaic_%s.jpg' % name), quality=88)
        # (c) canopy mask
        image_from_grid([[255 if v else 0 for v in row] for row in canopy]).resize((W * 2, H * 2), Image.NEAREST).save(os.path.join(debug, 'canopy.png'))
        print('debug images in', debug)


if __name__ == '__main__':
    main()
