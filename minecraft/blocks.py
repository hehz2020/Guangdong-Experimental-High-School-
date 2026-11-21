"""Which Minecraft block stands for which material of the 3D campus.

Every material of the 3D scene has a name (set by the builders) and a colour (its colour times the mean colour of its
texture). A material first falls into a category by its name (glass, leaves, water, metal, wood, lamp...); within the
category the block is the one whose average colour is nearest. The colours below are the average colours of the block
textures in vanilla Minecraft 1.21, approximately (read off the textures, rounded).

Imagined, all of it: which block reads best for a surface is a judgement, not a measurement.
"""
import re

# name -> (r, g, b, slab, stairs); slab/stairs are the block ids of the shaped variants, or None
SOLID = {
    'smooth_quartz': (236, 230, 223, 'smooth_quartz_slab', 'smooth_quartz_stairs'),
    'quartz_bricks': (234, 229, 221, None, None),
    'white_concrete': (207, 213, 214, None, None),
    'calcite': (223, 225, 221, None, None),
    'polished_diorite': (193, 193, 195, 'polished_diorite_slab', 'polished_diorite_stairs'),
    'diorite': (189, 189, 189, 'diorite_slab', 'diorite_stairs'),
    'smooth_stone': (159, 159, 159, 'smooth_stone_slab', None),
    'stone': (126, 126, 126, 'stone_slab', 'stone_stairs'),
    'stone_bricks': (122, 122, 122, 'stone_brick_slab', 'stone_brick_stairs'),
    'andesite': (136, 136, 137, 'andesite_slab', 'andesite_stairs'),
    'polished_andesite': (132, 135, 134, 'polished_andesite_slab', 'polished_andesite_stairs'),
    'light_gray_concrete': (125, 125, 115, None, None),
    'tuff': (108, 109, 103, 'tuff_slab', 'tuff_stairs'),
    'polished_tuff': (98, 104, 100, 'polished_tuff_slab', 'polished_tuff_stairs'),
    'polished_deepslate': (72, 73, 73, 'polished_deepslate_slab', 'polished_deepslate_stairs'),
    'deepslate_tiles': (54, 54, 55, 'deepslate_tile_slab', 'deepslate_tile_stairs'),
    'gray_concrete': (55, 58, 62, None, None),
    'polished_blackstone': (53, 49, 57, 'polished_blackstone_slab', 'polished_blackstone_stairs'),
    'black_concrete': (8, 10, 15, None, None),
    'sandstone': (216, 203, 156, 'sandstone_slab', 'sandstone_stairs'),
    'smooth_sandstone': (224, 214, 170, 'smooth_sandstone_slab', 'smooth_sandstone_stairs'),
    'end_stone_bricks': (218, 224, 162, 'end_stone_brick_slab', 'end_stone_brick_stairs'),
    'bricks': (151, 98, 83, 'brick_slab', 'brick_stairs'),
    'mud_bricks': (137, 104, 79, 'mud_brick_slab', 'mud_brick_stairs'),
    'granite': (149, 103, 86, 'granite_slab', 'granite_stairs'),
    'polished_granite': (154, 107, 89, 'polished_granite_slab', 'polished_granite_stairs'),
    'terracotta': (152, 94, 68, None, None),
    'white_terracotta': (210, 178, 161, None, None),
    'light_gray_terracotta': (135, 107, 98, None, None),
    'gray_terracotta': (58, 42, 36, None, None),
    'red_terracotta': (143, 61, 47, None, None),
    'orange_terracotta': (162, 84, 38, None, None),
    'yellow_terracotta': (186, 133, 35, None, None),
    'brown_terracotta': (77, 51, 36, None, None),
    'cyan_terracotta': (87, 91, 91, None, None),
    'green_terracotta': (76, 83, 42, None, None),
    'lime_terracotta': (104, 118, 53, None, None),
    'light_blue_terracotta': (113, 109, 138, None, None),
    'pink_terracotta': (162, 78, 79, None, None),
    'red_concrete': (142, 33, 33, None, None),
    'orange_concrete': (224, 97, 1, None, None),
    'yellow_concrete': (241, 175, 21, None, None),
    'lime_concrete': (94, 169, 25, None, None),
    'green_concrete': (73, 91, 36, None, None),
    'cyan_concrete': (21, 119, 136, None, None),
    'light_blue_concrete': (36, 137, 199, None, None),
    'blue_concrete': (45, 47, 143, None, None),
    'brown_concrete': (96, 60, 32, None, None),
    'pink_concrete': (214, 101, 143, None, None),
    'prismarine_bricks': (99, 172, 158, 'prismarine_brick_slab', 'prismarine_brick_stairs'),
    'dark_prismarine': (52, 92, 76, 'dark_prismarine_slab', 'dark_prismarine_stairs'),
    'packed_mud': (142, 107, 80, None, None),
}
PLANKS = {
    'oak_planks': (162, 131, 79, 'oak_slab', 'oak_stairs'),
    'spruce_planks': (115, 85, 49, 'spruce_slab', 'spruce_stairs'),
    'birch_planks': (192, 175, 121, 'birch_slab', 'birch_stairs'),
    'jungle_planks': (160, 115, 81, 'jungle_slab', 'jungle_stairs'),
    'acacia_planks': (168, 90, 50, 'acacia_slab', 'acacia_stairs'),
    'dark_oak_planks': (67, 43, 20, 'dark_oak_slab', 'dark_oak_stairs'),
    'cherry_planks': (227, 179, 173, 'cherry_slab', 'cherry_stairs'),
    'bamboo_planks': (194, 173, 80, 'bamboo_slab', 'bamboo_stairs'),
}
GLASS = {
    'glass': (190, 215, 220), 'white_stained_glass': (235, 235, 235), 'light_gray_stained_glass': (150, 150, 150),
    'gray_stained_glass': (80, 85, 90), 'black_stained_glass': (30, 30, 30), 'light_blue_stained_glass': (110, 150, 200),
    'cyan_stained_glass': (70, 125, 140), 'green_stained_glass': (100, 125, 60), 'blue_stained_glass': (55, 75, 170),
}
LEAVES = {'oak_leaves': (60, 110, 40), 'jungle_leaves': (70, 120, 35), 'spruce_leaves': (35, 60, 35),
          'azalea_leaves': (90, 115, 40), 'flowering_azalea_leaves': (100, 110, 60), 'dark_oak_leaves': (50, 90, 30)}

# category rules on the material name, first match wins. Categories:
#   skip    nothing (shader planes, effects)        water   water, filled down to the bed
#   ground  full block, never shaped                leaves  persistent leaves
#   log     tree trunks                             glass   glass blocks, panes when thin
#   metal   iron bars when thin, else by colour     lamp    light-giving blocks
#   wood    planks, slabs, stairs                   solid   by colour, slabs and stairs where the shape asks
RULES = [
    (r'^$|roomview|lamp-pools|ao-stand-in|shadow|^sky|stars|haze|glow|algae|grime|streaks|weathering|stain|tower-hands', 'skip'),
    (r'water|MirrorShader', 'water'),
    (r'leaves|needles|fronds|hedge|crownshaft|shrub|foliage|ivy', 'leaves'),
    (r'bark|trunk', 'log'),
    (r'lamp|lantern-light|highbay-lens|beacon|lite-inner|bulb', 'lamp'),
    (r'glass|pane|window|clere|skyPanel|skyTop|frosted|mirror|lite\b|glaze', 'glass'),
    (r'^earth$|lawn|grass|turf|soil|farground', 'ground'),
    (r'asphalt|setts|^paving$|hifi-paving', 'pave'),
    (r'bloom|flower', 'flowers'),
    (r'chainlink|pickets|rail|inox|galv|steel|metal|alu\b|net$|bars|fence|frame$|bike|pole|post', 'metal'),
    (r'timber|boards|laminate|wood|benchwood|dado|cork|oak|desk(?!-steel)|seat|door', 'wood'),
]

def category(name, mtype):
    if mtype in ('MeshBasicMaterial', 'ShaderMaterial', 'PointsMaterial', 'SpriteMaterial') and not re.search(r'MirrorShader|lamp|letters|sign', name):
        return 'skip'
    for pat, cat in RULES:
        if re.search(pat, name):
            return cat
    return 'solid'

def nearest(rgb, table):
    best, bd = None, 1e18
    for k, v in table.items():
        d = (rgb[0] - v[0]) ** 2 * 0.3 + (rgb[1] - v[1]) ** 2 * 0.59 + (rgb[2] - v[2]) ** 2 * 0.11
        if d < bd:
            best, bd = k, d
    return best

def block_for(mat):
    """(category, base block id) for a material record of voxelize.mjs."""
    name, rgb = mat['name'], mat['rgb']
    cat = category(name, mat['type'])
    if cat == 'skip':
        return cat, None
    if cat == 'water':
        return cat, 'water'
    if cat == 'leaves':
        if re.search('needles', name): return cat, 'spruce_leaves'
        if re.search('fronds|crownshaft', name): return cat, 'jungle_leaves'
        if re.search('hedge|shrub', name): return cat, 'azalea_leaves'
        return cat, 'oak_leaves'
    if cat == 'log':
        if re.search('palm', name): return cat, 'stripped_birch_log' if sum(rgb) > 400 else 'jungle_log'
        return cat, 'spruce_log' if sum(rgb) < 220 else 'oak_log'
    if cat == 'lamp':
        if re.search('red|lantern', name) or (rgb[0] > 150 and rgb[1] < 80): return cat, 'shroomlight'
        return cat, 'sea_lantern' if rgb[2] >= rgb[0] - 10 else 'glowstone'
    if cat == 'glass':
        return cat, nearest(rgb, GLASS)
    if cat == 'ground':
        if re.search('soil', name): return cat, 'coarse_dirt'
        if sum(rgb) < 200 and not re.search('lawn|grass', name): return cat, 'podzol'
        return cat, 'grass_block'
    if cat == 'pave':
        if re.search('asphalt', name): return cat, nearest(rgb, {k: SOLID[k] for k in ('gray_concrete', 'polished_deepslate', 'tuff', 'polished_andesite', 'andesite')})
        return 'solid', nearest(rgb, SOLID)
    if cat == 'wood':
        return cat, nearest(rgb, PLANKS)
    if cat == 'flowers':
        # flower beds: a flower per block, picked from the bed's colour (its texture mixes blossoms and leaves)
        r, g, b = rgb
        return cat, 'red_tulip' if r > g * 0.95 else 'oxeye_daisy' if b > 50 and g > 90 else 'poppy' if r > 66 else 'azure_bluet' if b > 45 else 'dandelion'
    if cat == 'metal':
        metals = {k: SOLID[k] for k in ('light_gray_concrete', 'polished_andesite', 'gray_concrete', 'polished_deepslate', 'smooth_stone', 'smooth_quartz', 'polished_diorite')}
        metals['iron_block'] = (220, 220, 220, None, None)
        return cat, nearest(rgb, metals)
    # solid: strong reds stay red (the gate wall, lanterns, signs), brick-faced materials keep the brick look
    if rgb[0] > 2 * rgb[1] and rgb[0] > 2 * rgb[2] and rgb[0] > 45:
        reds = {k: SOLID[k] for k in ('red_terracotta', 'red_concrete', 'bricks', 'pink_terracotta')}
        reds['red_nether_bricks'] = (69, 7, 9, 'red_nether_brick_slab', 'red_nether_brick_stairs')
        return cat, nearest(rgb, reds)
    if re.search('brick', name) and rgb[0] > rgb[2] + 40:
        return cat, 'bricks' if rgb[0] < 160 else 'red_terracotta'
    return cat, nearest(rgb, SOLID)

def shaped(base, kind):
    """The slab or stairs id of a base block, or None."""
    for t in (SOLID, PLANKS):
        if base in t:
            return t[base][3] if kind == 'slab' else t[base][4]
    return None

def slab_capable_near(base):
    """A block with a slab whose colour is close to base (for thin plates of concrete or terracotta)."""
    tbl = {**SOLID, **PLANKS}
    if base not in tbl: return None
    r, g, b = tbl[base][:3]
    cands = {k: v for k, v in tbl.items() if v[3]}
    k = nearest((r, g, b), cands)
    v = cands[k]
    return k if ((v[0] - r) ** 2 + (v[1] - g) ** 2 + (v[2] - b) ** 2) ** 0.5 < 60 else None

def color_of(block):
    """Average colour of a block id, for previews."""
    for t in (SOLID, PLANKS, GLASS, LEAVES):
        if block in t: return t[block][:3]
    extra = {'water': (50, 90, 170), 'grass_block': (110, 160, 80), 'dirt': (134, 96, 67), 'coarse_dirt': (119, 85, 59),
             'podzol': (91, 63, 24), 'stone': (126, 126, 126), 'bedrock': (85, 85, 85), 'sea_lantern': (172, 199, 190),
             'glowstone': (171, 131, 84), 'shroomlight': (240, 146, 70), 'spruce_log': (58, 37, 16), 'oak_log': (109, 85, 50),
             'jungle_log': (85, 67, 25), 'stripped_birch_log': (196, 176, 118), 'iron_bars': (136, 139, 135),
             'glass_pane': (190, 215, 220), 'red_tulip': (180, 60, 50), 'poppy': (190, 40, 30), 'oxeye_daisy': (220, 225, 210),
             'azure_bluet': (200, 210, 225), 'dandelion': (230, 200, 40)}
    if block in extra: return extra[block]
    for suf in ('_slab', '_stairs', '_pane'):
        if block.endswith(suf):
            b = block[:-len(suf)]
            for cand in (b, b + 's', b + '_block', b + '_planks', b.replace('brick', 'bricks'), b.replace('tile', 'tiles')):
                c = color_of(cand) if cand != block else None
                if c and c != (200, 0, 200): return c
    return (200, 0, 200)
