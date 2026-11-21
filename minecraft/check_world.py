#!/usr/bin/env python3
"""Reads a world written by build_world.py back and checks it the way the game will read it.

usage: python minecraft/check_world.py <world dir> [x,y,z ...]
Checks: level.dat is gzipped NBT with the fields the game needs; every region file's header points at chunks that
decompress and parse; each chunk sits where its xPos/zPos say; every section's packed data has the length the 1.18+
format requires for its palette size and no index outside the palette. Prints the block at each x,y,z given.
"""
import gzip, io, os, struct, sys, zlib
import nbtlib

def fail(msg):
    print('FAIL', msg); sys.exit(1)

def unpack(data, n_pal):
    bits = max(4, (n_pal - 1).bit_length()); per = 64 // bits; mask = (1 << bits) - 1
    if len(data) != (4096 + per - 1) // per: fail(f'data length {len(data)} for palette {n_pal}')
    out = []
    for v in data:
        v &= (1 << 64) - 1
        for k in range(per):
            if len(out) == 4096: break
            out.append((v >> (k * bits)) & mask)
    if max(out) >= n_pal: fail('index beyond palette')
    return out

def main():
    world, probes = sys.argv[1], [tuple(int(c) for c in p.split(',')) for p in sys.argv[2:]]
    lv = nbtlib.load(os.path.join(world, 'level.dat'))
    d = lv['Data']
    for k in ('DataVersion', 'version', 'WorldGenSettings', 'LevelName', 'SpawnX', 'SpawnY', 'SpawnZ', 'GameType', 'DataPacks'):
        if k not in d: fail('level.dat lacks ' + k)
    print('level.dat ok:', str(d['LevelName']), 'DataVersion', int(d['DataVersion']), 'spawn', int(d['SpawnX']), int(d['SpawnY']), int(d['SpawnZ']))
    blocks = {}
    nchunks = nsec = 0
    for fn in sorted(os.listdir(os.path.join(world, 'region'))):
        _, rx, rz, _ = fn.split('.'); rx, rz = int(rx), int(rz)
        raw = open(os.path.join(world, 'region', fn), 'rb').read()
        if len(raw) % 4096: fail(fn + ' not a multiple of 4096 bytes')
        for i in range(1024):
            loc = struct.unpack('>I', raw[i * 4:i * 4 + 4])[0]
            if not loc: continue
            off, cnt = loc >> 8, loc & 255
            ln, comp = struct.unpack('>IB', raw[off * 4096:off * 4096 + 5])
            if comp != 2 or ln > cnt * 4096: fail(f'{fn} chunk {i}: compression {comp} length {ln}')
            tag = nbtlib.File.parse(io.BytesIO(zlib.decompress(raw[off * 4096 + 5:off * 4096 + 4 + ln])))
            cx, cz = rx * 32 + i % 32, rz * 32 + i // 32
            if int(tag['xPos']) != cx or int(tag['zPos']) != cz: fail(f'chunk at {cx},{cz} says {int(tag["xPos"])},{int(tag["zPos"])}')
            if str(tag['Status']) != 'minecraft:full': fail('status')
            nchunks += 1
            for sec in tag['sections']:
                nsec += 1
                pal = sec['block_states']['palette']
                idx = unpack(sec['block_states']['data'], len(pal)) if 'data' in sec['block_states'] else [0] * 4096
                if 'data' not in sec['block_states'] and len(pal) != 1: fail('palette without data')
                sy = int(sec['Y'])
                for (px, py, pz) in probes:
                    if px >> 4 == cx and pz >> 4 == cz and py >> 4 == sy:
                        e = pal[idx[((py & 15) * 16 + (pz & 15)) * 16 + (px & 15)]]
                        blocks[(px, py, pz)] = str(e['Name']) + (str(dict(e['Properties'])) if 'Properties' in e else '')
    print(f'{nchunks} chunks, {nsec} sections: ok')
    for p in probes: print('block', p, blocks.get(p, '(not in a written chunk)'))

if __name__ == '__main__':
    main()
