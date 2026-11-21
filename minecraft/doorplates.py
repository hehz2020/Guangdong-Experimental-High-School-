#!/usr/bin/env python3
"""Door plates over the doors build_world.py hung in the teaching buildings, as small text displays (imagined: the
numbering follows the 3D site's invented scheme, storey then a two-digit number in order along the corridor; the
building names are the 3D site's: 北教学楼, 南教学楼, 实验楼, 求实楼).

usage: python minecraft/doorplates.py <doors.json> <commands.txt>   (appends to commands.txt)
A plate hangs half a block above the door, on both faces of the wall, facing out of each.
"""
import json, sys

# building boxes in game blocks (x0, x1, z0, z1), the storey heights (block y of each floor's standing level)
BUILDINGS = [
    ('北教学楼', (209, 258, -120, -101), [64, 68, 72, 76, 80]),
    ('南教学楼', (203, 251, -81, -63), [64, 68, 72, 76, 80]),
    ('实验楼', (87, 136, -82, -67), [64, 68, 72, 76, 80]),
    ('求实楼', (64, 250, -171, -94), [64, 68, 72, 76, 80]),
]

def main():
    doors, out = json.load(open(sys.argv[1])), sys.argv[2]
    cmds, n = [], 0
    for name, (x0, x1, z0, z1), floors in BUILDINGS:
        inside = [d for d in doors if x0 <= d['x'] <= x1 and z0 <= d['z'] <= z1]
        for fi, fy in enumerate(floors):
            row = sorted([d for d in inside if abs(d['y'] - fy) <= 1], key=lambda d: (d['x'], d['z']))
            for k, d in enumerate(row):
                label = f'{name}\\n{fi + 1}{k + 1:02d}'
                # the plate's centre over the door: a door in a wall crossed along x stands in a wall running along z
                cx = d['x'] + 0.5 + (0.5 if d['axis'] == 'z' and d.get('run', 1) == 2 else 0)
                cz = d['z'] + 0.5 + (0.5 if d['axis'] == 'x' and d.get('run', 1) == 2 else 0)
                for sgn in (1, -1):
                    if d['axis'] == 'x':          # walking along x: the wall's faces look east and west
                        px, pz, yaw = cx + sgn * 0.52, cz, -90 if sgn > 0 else 90
                    else:                         # walking along z: the faces look south and north
                        px, pz, yaw = cx, cz + sgn * 0.52, 0 if sgn > 0 else 180
                    cmds.append(f'summon minecraft:text_display {px:.2f} {d["y"] + 2.05:.2f} {pz:.2f} '
                                f'{{text:{{text:"{label}",color:"#1B2A44"}},background:-1052689,billboard:"fixed",shadow:0b,line_width:200,'
                                f'Rotation:[{yaw}f,0f],transformation:{{left_rotation:[0f,0f,0f,1f],right_rotation:[0f,0f,0f,1f],'
                                f'translation:[0f,0f,0f],scale:[0.6f,0.6f,0.6f]}}}}')
                n += 1
    open(out, 'a', encoding='utf-8').write('\n'.join(cmds) + '\n')
    print(f'door plates: {n} doors, {len(cmds)} plates')

if __name__ == '__main__':
    main()
