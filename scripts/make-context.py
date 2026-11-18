# Converts roof readings (mosaic pixels) of the context buildings to ground metres and writes
#   data/context.json                     (readable record)
#   the DATA block of src/world/extras/context.js  (between the <context-data> markers)
# usage: python3 -I scripts/make-context.py <repository> /path/to/campus_z19.jpg   (the mosaic is not in the repository)
import sys, json, math, re
REPO = sys.argv[1]
MPP = 0.2746907923511547; OX = 703.5; OY = 1531.0; LX = 0.243; LY = 2.0
r1 = lambda v: round(v * 10) / 10

def ground(px, py, h):            # roof pixel at height h -> ground metres
    return [r1((px + LX * h - OX) * MPP), r1((py - LY * h - OY) * MPP)]
def rect(w, n, e, s): return [[w, n], [e, n], [e, s], [w, s]]

SINGLE = 'single reading on the zoom-19 mosaic (0.2747 m per pixel), not re-read'
SAT = 'seen in satellite only'
B = []
from PIL import Image
IMG = Image.open(sys.argv[2]).convert('RGB'); PIX = IMG.load()
def inside(poly, x, y):
    c = False; n = len(poly)
    for i in range(n):
        x1, y1 = poly[i]; x2, y2 = poly[(i + 1) % n]
        if (y1 > y) != (y2 > y) and x < (x2 - x1) * (y - y1) / (y2 - y1) + x1: c = not c
    return c
def median_colour(test, box):
    rs, gs, bs = [], [], []
    for y in range(int(box[1]), int(box[3]) + 1, 2):
        for x in range(int(box[0]), int(box[2]) + 1, 2):
            if test(x, y): r, g, b = PIX[x, y]; rs.append(r); gs.append(g); bs.append(b)
    if not rs: return None
    m = lambda v: sorted(v)[len(v) // 2]
    return '#%02x%02x%02x' % (m(rs), m(gs), m(bs))
def roof_colour(p):
    if 'circlePx' in p:
        cx, cy, r = p['circlePx']; return median_colour(lambda x, y: (x - cx) ** 2 + (y - cy) ** 2 < (r * 0.8) ** 2, [cx - r, cy - r, cx + r, cy + r])
    poly = p['px']; xs = [q[0] for q in poly]; ys = [q[1] for q in poly]
    return median_colour(lambda x, y: inside(poly, x, y), [min(xs) + 2, min(ys) + 2, max(xs) - 2, max(ys) - 2])
def bld(id, group, confidence, height, heightBasis, accuracyM, notes, parts, belongs='not known'):
    out = {'id': id, 'group': group, 'confidence': confidence, 'belongsToSchool': belongs, 'measuredBy': SINGLE,
           'height': height, 'heightBasis': heightBasis, 'positionAccuracyM': accuracyM, 'notes': notes, 'parts': []}
    for p in parts:
        h = p.get('height', height)
        q = {'id': p['id'], 'height': h, 'look': p['look']}
        if 'circlePx' in p:
            cx, cy, r = p['circlePx']; g = ground(cx, cy, h)
            q.update({'shape': 'circle', 'cx': g[0], 'cz': g[1], 'radius': r1(r * MPP), 'roofPx': {'circle': p['circlePx']}})
        else:
            q.update({'shape': 'polygon', 'points': [ground(x, y, h) for x, y in p['px']], 'roofPx': {'polygon': p['px']}})
        q['roofColourInImage'] = roof_colour(p)
        if 'extra' in p: q.update(p['extra'])
        out['parts'].append(q)
    B.append(out)

# ---------------------------------------------------------------- core
bld('core-pergola-block', 'core', 'seen in the 2022 video (frames_yibenshu f_060, from the east) and in satellite', 20.7,
    'Frame f_060: its roof lies in line with the roof of the south teaching slab (20.7 m) and a little below the roof of the glass stair block (24 m). Five teaching storeys of 3.9 m plus parapet ASSUMED; no facade band is readable on the mosaic (the canopy hides the north face).',
    2.5,
    'Long narrow block along the south edge of the plaza canopy, west of the clock tower. Roof px x 1240-1393, y 1306-1362: flat part with white lines (1306-1330), a dark line (1330-1340) and a band with a repeating slatted pattern (1340-1362). In frame f_060 the slatted, pergola-like panels lie on the SOUTH strip of the roof; the part north of them is hidden behind the clock tower. The frame also shows tall white fins at the south-east corner and dark green glazing on the east end. The east end as read (x 190.8 m) reaches the west face of the clock tower, whose leaning image hides anything further east; the builder trims the block 0.3 m short of the clock tower and of the glass stair block and 0.5 m short of the canopy edge, using their current positions. The builder draws the ground storey open on columns between two solid end cores: that is an assumption (no reference shows the ground storey) which keeps the plaza reachable from the south. Everything else about the faces is assumed.',
    [{'id': 'main', 'px': rect(1240, 1306, 1393, 1362), 'look': {'kind': 'pergola-block', 'wall': 'white', 'roof': 'beige', 'storeys': 5, 'storeyH': 3.9},
      'extra': {'pergolaStripDepthM': r1((1362 - 1338) * MPP)}}], belongs='yes (inside the teaching zone)')

# ---------------------------------------------------------------- south group
bld('south-round-pavilion', 'south', 'seen in the 2018 video (frames_lijian f_049-051, f_064, f_066) and in satellite', 15,
    'Frame f_064: as tall as the tree row beside it, 3 to 4 glazed levels between white floor bands; on the mosaic a column line about 27-30 px long north of the ring. 4 levels of 3.6 m assumed.',
    3,
    'The "tall open portico at the south end of the track" of the video notes. Zoomed frames show a thin ROUND roof disc on a ring of slender white columns around a dark-glazed drum, with a ring beam at about three quarters of the height. Mosaic: pale ring, centre px (805,1955), outer radius 32 px, grey-green disc inside with a pale object at the centre. Bearing check: in f_064 (camera over the east straight, about z -16) it lies 8.5 degrees west of south, i.e. x about 26 m at z 108; the ring moved back by the lean gives x 28.9. Drum radius, number of columns (12) and their radius are ASSUMED from the proportions in f_064.',
    [{'id': 'disc', 'circlePx': [805, 1955, 32], 'look': {'kind': 'pavilion', 'wall': 'white', 'roof': 'pale', 'storeys': 4, 'storeyH': 3.6},
      'extra': {'drumRadiusM': 5.5, 'columnRingRadiusM': 7.6, 'columns': 12}}])

bld('south-low-link', 'south', 'seen in the 2018 video (f_064: low red-brown block with white bands left of the pavilion) and in satellite', 6.5,
    'Frame f_064: about 40 percent of the height of the pavilion; two storeys assumed.', 3,
    'Pale roof px (845-905, 1948-2000; drawn to x 893 to stay clear of the round tower) between the round pavilion and the courtyard complex, with a dark stripe across it (1975-1985) that was not interpreted. Identification with the red-brown block of the video is by position only.',
    [{'id': 'main', 'px': rect(845, 1948, 893, 2000), 'look': {'kind': 'block', 'wall': 'redBrown', 'band': 'white', 'roof': 'pale', 'win': 'bands', 'storeys': 2, 'storeyH': 3.0}}])

cl = {'kind': 'block', 'wall': 'white', 'roof': 'pale', 'win': 'punched', 'storeys': 5, 'storeyH': 3.4, 'roofUnits': True}
bld('south-court-complex', 'south', 'satellite; PROBABLY the white-and-red block and the rounded white building of the 2018 video (f_049-051, f_066) - identification by bearing only', 18,
    'Video f_049/f_050: 4 to 5 rows of red-brown panels above the trees on the long face; 5 dormitory floors of 3.4 m plus parapet assumed. Its own north facade is hidden by tree crowns on the mosaic.',
    3.5,
    'Courtyard building south of the inferred road south of the courts. Roofs: north bar px (905-1170, 1903-1942) covered with small rooftop units, west bar (905-940, 1942-2012), south-west bar (935-1040, 2008-2042, slightly skewed in the image, squared here), south-east bar (1045-1168, 1985-2028), a link (1035-1050, 1940-2010), an east end (1150-1172, 1942-1990) and a round tower, centre (912,2030), radius 18 px, at the south-west corner. Video: long face with a white frame and red-brown infill panels with balconies, a white end wall with a blue-green glazed stair strip, a thin roof slab; beside it a rounded white building with blue ribbon windows. In f_066 the rounded building lies 6.7 degrees left of the pavilion, which is where the round tower should appear from a camera near (-21,-40); the long face fits the north bar less well (about 5 degrees off), so the match is probable, not proven. Faces not seen in the video are assumed.',
    [{'id': 'north-bar', 'px': rect(905, 1903, 1170, 1942), 'look': dict(cl, win='brick-bays', accent='redBrown', stairStrip='W')},
     {'id': 'west-bar', 'px': rect(905, 1942, 940, 2008), 'look': dict(cl, win='bands', glass='blue')},
     {'id': 'south-west-bar', 'px': rect(930, 2008, 1045, 2042), 'look': cl},
     {'id': 'south-east-bar', 'px': rect(1045, 1985, 1168, 2028), 'look': cl},
     {'id': 'link', 'px': rect(1035, 1942, 1045, 2008), 'look': dict(cl, roofUnits=False)},
     {'id': 'east-end', 'px': rect(1150, 1942, 1172, 1985), 'look': dict(cl, roofUnits=False)},
     {'id': 'round-tower', 'circlePx': [912, 2030, 18], 'look': {'kind': 'drum', 'wall': 'white', 'roof': 'pale', 'win': 'bands', 'glass': 'blue', 'storeys': 5, 'storeyH': 3.4}}])

el = {'kind': 'block', 'wall': 'cream', 'roof': 'pale', 'win': 'punched', 'storeys': 6, 'storeyH': 3.5}
bld('south-e-complex', 'south', SAT, 21.6,
    'North facade of the middle bar on the mosaic: about 45 px from roof edge to base, with floor lines, i.e. about 22 m; 6 storeys of 3.5 m plus parapet assumed for all three bars and the spine.',
    4,
    'Three east-west bars joined by a spine on the east, with two courtyards. Roofs: bar 1 px (895-1170, 2125-2190), bar 2 (925-1175, 2290-2345, slightly skewed in the image, squared here), bar 3 (1030-1185, 2400-2445), spine (1160-1200, 2130-2440); bars 2 and 3 carry framed dark panels (roof openings or pergolas, not modelled). A lower flat roof with a white rim and a rounded north-west corner, px (808-890, 2130-2215), stands at the north-west; its height (8 m) is a guess. Wall colours are NOT readable (north faces in shade): cream is assumed. A red-surfaced lane runs along the south-west side.',
    [{'id': 'bar-1', 'px': rect(895, 2125, 1160, 2190), 'look': el},
     {'id': 'bar-2', 'px': rect(925, 2290, 1160, 2345), 'look': el},
     {'id': 'bar-3', 'px': rect(1030, 2400, 1160, 2445), 'look': el},
     {'id': 'spine', 'px': rect(1160, 2130, 1200, 2445), 'look': dict(el, win='bands')},
     {'id': 'north-west-annex', 'height': 8, 'px': rect(808, 2130, 890, 2215), 'look': {'kind': 'block', 'wall': 'white', 'roof': 'pale', 'win': 'bands', 'storeys': 2, 'storeyH': 3.6}}])

bld('south-tall-building', 'south', SAT + '; NOT visible in the 2018 video where it should be (frames f_002 to f_006 from the north-east and f_049 from the field show open sky in its direction): either it was built after September 2018 (the mosaic is newer than that video and older than the new teaching building) or the reading is wrong. The least certain entry of this file', 75,
    'Mosaic: on the north face vertical pilaster lines about 150 px long that follow the lean direction exactly (dx/dy -0.11), and a sunlit east face with 20 or more balcony dashes; 150 px / 2.0 px per metre = 75 m, 25 floors of 3.0 m. A reading error of 10 px is 5 m of height and 1.4 m of position.',
    6,
    'High-rise with roofs at px (1228-1425, 2298-2445) around a light well, plus a lower-looking pale roof on the west (1200-1260, 2385-2455) that is drawn at the same height because its own height could not be read. East face reddish brown in sunlight with white balcony slabs; roof pale with many small units. The spine roof of the E-shaped complex west of it lies in shadow over about 30 m, which also asks for a tall object here. Alternative reading, not adopted: a low hall with a dark ribbed roof north of a separate 7-storey block. A curved drive or ramp (arc about px (1265,2090), radius 60) lies north-west of it; not modelled. Use, owner and whether it stands inside the campus are unknown.',
    [{'id': 'main', 'px': rect(1228, 2298, 1425, 2445), 'look': {'kind': 'tower', 'wall': 'pinkBrown', 'band': 'white', 'roof': 'pale', 'win': 'punched', 'storeys': 25, 'storeyH': 2.96}},
     {'id': 'west-part', 'px': rect(1200, 2385, 1228, 2455), 'look': {'kind': 'tower', 'wall': 'pinkBrown', 'band': 'white', 'roof': 'pale', 'win': 'punched', 'storeys': 25, 'storeyH': 2.96}}])

# ---------------------------------------------------------------- north
ASSUMED_H = 'ASSUMED from the building type: no north-facade band is readable at the zoom used.'
bld('north-dark-roof-block', 'north', SAT, 7.5, ASSUMED_H + ' Two storeys.', 4,
    'Roof about 21 x 21 m turned about 30 degrees, north of the west end of the arc building: dark panels in a pale grid (could also be a trellis or carport rather than a building). Corners px W (972,835), N (1040,800), E (1090,860), S (1025,900); the south corner lay at the edge of the crop.',
    [{'id': 'main', 'px': [[972, 835], [1040, 800], [1090, 860], [1025, 900]], 'look': {'kind': 'block', 'wall': 'cream', 'roof': 'dark', 'win': 'punched', 'storeys': 2, 'storeyH': 3.4}}])
bld('north-wavy-parapet-block', 'north', SAT + ' (the image is older than the new teaching building just south of it: this block may no longer exist)', 8, ASSUMED_H + ' Two storeys.', 4,
    'Pale flat roof with rooftop items and an S-curved parapet along its north-west edge (drawn straight). Corners px W (1377,614), N (1462,556), E (1500,610), S (1418,660). A blue and green hard court (px 1450-1570, 560-780) lies south-east of it and a small stepped stand north-east; neither is modelled here.',
    [{'id': 'main', 'px': [[1377, 614], [1462, 556], [1500, 610], [1418, 660]], 'look': {'kind': 'block', 'wall': 'white', 'roof': 'pale', 'win': 'bands', 'storeys': 2, 'storeyH': 3.7}}])
bld('north-white-shed', 'north', SAT, 6, ASSUMED_H + ' One tall storey.', 4,
    'Bright white sheet roof about 12 x 11 m, turned; darker roofs adjoin it on the north-west (not modelled). Corners px (1582,535), (1622,512), (1640,545), (1600,570).',
    [{'id': 'main', 'px': [[1582, 535], [1622, 512], [1640, 545], [1600, 570]], 'look': {'kind': 'shed', 'wall': 'grey', 'roof': 'whiteMetal', 'win': 'bands', 'storeys': 1, 'storeyH': 5.6}}])
bld('north-long-white-shed', 'north', SAT, 6, ASSUMED_H + ' One tall storey.', 4,
    'Long white sheet roof in two parallel strips, about 11 x 34 m, beside the canal road; a smaller white roof continues it to the south (px 1715-1740, 728-770). East edge trimmed by 8 px to keep it off the digitised canal road.',
    [{'id': 'main', 'px': [[1708, 598], [1740, 600], [1736, 722], [1700, 720]], 'look': {'kind': 'shed', 'wall': 'grey', 'roof': 'whiteMetal', 'win': 'bands', 'storeys': 1, 'storeyH': 5.6}},
     {'id': 'south-part', 'height': 5, 'px': rect(1715, 728, 1736, 770), 'look': {'kind': 'shed', 'wall': 'grey', 'roof': 'whiteMetal', 'win': 'none', 'storeys': 1, 'storeyH': 4.6}}])
bld('north-east-pale-complex', 'north', SAT, 10, ASSUMED_H + ' Three storeys.', 4,
    'Pale roofs with white parapets, small light wells and a rounded east corner, north-east of the dome; a planted terrace or court lies west of it. Simplified to two rectangles: north block px (1620-1705, 800-855), south block (1650-1700, 855-905); the south block continued beyond the crop.',
    [{'id': 'north-block', 'px': rect(1620, 800, 1705, 855), 'look': {'kind': 'block', 'wall': 'white', 'roof': 'pale', 'win': 'bands', 'storeys': 3, 'storeyH': 3.1}},
     {'id': 'south-block', 'px': rect(1650, 855, 1700, 905), 'look': {'kind': 'block', 'wall': 'white', 'roof': 'pale', 'win': 'punched', 'storeys': 3, 'storeyH': 3.1}}])

# ---------------------------------------------------------------- west and south-west of the track
SHED_H = 'ASSUMED: single-storey shed.'
def band(a, b, w):                 # thin rectangle along a line a->b, width w px
    dx, dy = b[0] - a[0], b[1] - a[1]; n = math.hypot(dx, dy); ox, oy = -dy / n * w / 2, dx / n * w / 2
    return [[a[0] + ox, a[1] + oy], [b[0] + ox, b[1] + oy], [b[0] - ox, b[1] - oy], [a[0] - ox, a[1] - oy]]
sh = lambda roof: {'kind': 'shed', 'wall': 'grey', 'roof': roof, 'win': 'none', 'storeys': 1, 'storeyH': 2.8}
bld('west-sheds-north-of-stand', 'west', SAT, 3.2, SHED_H, 4,
    'Two long thin pale roofs north-west of the grandstand, with cross ribs every few metres: centrelines px (318,1232)-(478,1151), 18 px wide (it continues north-east beyond the crop, cut at x 478), and (334,1261)-(428,1215), 17 px wide. Could be covered walks, cycle sheds or small covered stands.',
    [{'id': 'a', 'px': band((318, 1232), (478, 1151), 18), 'look': sh('pale')}, {'id': 'b', 'px': band((334, 1261), (428, 1215), 17), 'look': sh('pale')}])
bld('southwest-sheds', 'west', SAT + ' (beside a construction site: possibly temporary site huts)', 3.2, SHED_H, 3,
    'Small roofs south-west of the track: dark px (376-418, 1987-2000), grey-blue (327-350, 2008-2030), red (426-456, 2020-2043; found again by colour clustering).',
    [{'id': 'dark', 'px': rect(376, 1987, 418, 2000), 'look': sh('grey')}, {'id': 'blue', 'px': rect(327, 2008, 350, 2030), 'look': sh('blue')}, {'id': 'red', 'px': rect(426, 2020, 456, 2043), 'look': sh('redTile')}])
bld('south-small-roofs', 'west', SAT, 3.2, SHED_H, 3,
    'Low pale roofs in a yard south of the south bend: px (583-600, 1931-1960) and (612-656, 2002-2028).',
    [{'id': 'a', 'px': rect(583, 1931, 600, 1960), 'look': sh('pale')}, {'id': 'b', 'px': rect(612, 2002, 656, 2028), 'look': dict(sh('pale'), win='bands')}])

NOT_MODELLED = [
    {'what': 'Construction site west and south-west of the grandstand', 'px': [120, 1480, 380, 1980], 'why': 'In the image these are building frames under construction; what was built is not known.'},
    {'what': 'Blue and green hard court north of the new teaching building', 'px': [1450, 560, 1570, 780], 'why': 'A court, not a building; whether it belongs to the school is not known.'},
    {'what': 'Small stepped stand north-west of that court', 'px': [1470, 520, 1505, 590], 'why': 'Too small and unclear.'},
    {'what': 'Round walled yard by the canal', 'px': [1695, 475, 1795, 575], 'why': 'A circular wall round bare ground, not a building.'},
    {'what': 'Curved green-roofed structure at the north edge', 'px': [1465, 470, 1540, 540], 'why': 'At the edge of the crop by the elevated road, unclear.'},
    {'what': 'Dark roofs north-west of the white shed and grey roof west of the long shed', 'px': [1540, 500, 1715, 770], 'why': 'Unclear outlines.'},
    {'what': 'Curved drive or ramp north-west of the tall building', 'px': [1210, 2030, 1340, 2170], 'why': 'Ground feature.'},
    {'what': 'Pale wedge at the south-east corner of the track', 'px': [812, 1858, 858, 1905], 'why': 'Read as sunlit paving between tree shadows, not a roof (uncertain).'},
    {'what': 'Framed dark roof panels on bars 2 and 3 of the E-shaped complex, light wells of the north-east complex, rooftop units of the tall building', 'px': None, 'why': 'Detail beyond massing.'},
]

doc = {
    'about': 'Buildings around the modelled core that are not in data/measurements.json: outlines measured on the oblique zoom-19 satellite mosaic, converted to ground positions. Used by src/world/extras/context.js, which carries a copy of "buildings" between its <context-data> markers.',
    'frame': {'units': 'metres', 'x': 'east', 'z': 'south', 'origin': 'centre of the running track', 'metresPerPixel': MPP, 'originPx': [OX, OY]},
    'method': 'Each roof outline was read once off gridded enlargements (2x to 4x) of the mosaic. A roof pixel at height h was moved by (+0.243 h, -2.0 h) px before conversion (same lean as scripts/build-campus-data.mjs). Heights: from the 2018 or 2022 video where a frame shows the building, from the length of north-facade features on the mosaic where readable (2.0 px per metre), otherwise ASSUMED by building type - see heightBasis of each entry. positionAccuracyM combines the reading error (about 3 px) with the effect of the height uncertainty.',
    'caveats': ['Single readings: none of these outlines has been re-read independently.',
                'Whether a building belongs to the school is not known unless stated; no name or function is given to any of them.',
                'Skewed outlines were squared where noted. Wall colours of faces in shade and all faces not shown by a video frame are assumed.'],
    'groundApron': {'what': 'Plain paving drawn by the module under the south group beyond the landscape survey window', 'rectangleM': {'w': 20, 'e': 215, 'n': 150.5, 's': 246},
                    'basis': 'The mosaic shows paved yards, lanes and parking round these buildings; the extent and the single surface are schematic, not measured.'},
    'buildings': B, 'notModelled': NOT_MODELLED,
}
open(REPO + '/data/context.json', 'w').write(json.dumps(doc, indent=1, ensure_ascii=False) + '\n')

# compact copy for the module
def slim(b):
    return {'id': b['id'], 'group': b['group'], 'parts': [{k: v for k, v in p.items() if k != 'roofPx'} for p in b['parts']]}
block = 'const DATA = [\n' + ',\n'.join('  ' + json.dumps(slim(b), separators=(',', ':')) for b in B) + '\n];'
path = REPO + '/src/world/extras/context.js'
try:
    src = open(path).read()
    new, n = re.subn(r'(/\* <context-data>[^\n]*\*/\n).*?(\n/\* </context-data> \*/)', lambda m: m.group(1) + block + m.group(2), src, flags=re.S)
    if n == 1: open(path, 'w').write(new); print('DATA block rewritten')
    else: print('markers not found in context.js')
except FileNotFoundError:
    print('context.js not there yet'); open(REPO + '/../_ctx_block.txt', 'w') if False else None
for b in B:
    for p in b['parts']:
        print(b['id'].ljust(28), p['id'].ljust(16), p['height'], p.get('points') or [p['cx'], p['cz'], p['radius']])
