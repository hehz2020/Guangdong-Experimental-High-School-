#!/usr/bin/env python3
"""Turns the region files of build_world.py into a ready world for the current Java Edition, with the official server.

usage: python minecraft/server_pack.py <server dir> <world dir of build_world.py> <out world dir> --box x0,x1,z0,z1
       [--spawn x,y,z] [--java /path/to/java] [--name NAME]

<server dir> holds Mojang's server.jar and an eula.txt the user agreed to. The script
  1. lets the server create a superflat world whose layers match the map (ground top at y 63), then stops it;
  2. puts the map's region files into the world's overworld region folder (dimensions/minecraft/overworld/region from
     26.1 on, region/ before), replacing what the server generated there;
  3. starts the server again, force-loads every chunk of the box (the game upgrades each chunk from the 1.21 format it
     was written in and lights it), sets the spawn, noon, clear weather, peaceful, creative, and saves;
  4. copies the world folder to <out world dir> with the given level name, and reports every warning or error the
     server printed about chunks.
"""
import argparse, json, os, re, shutil, subprocess, sys, threading, time, queue

LAYERS = [('minecraft:bedrock', 1), ('minecraft:stone', 123), ('minecraft:dirt', 3), ('minecraft:grass_block', 1)]

def props(port, name):
    gen = json.dumps({'layers': [{'block': b, 'height': h} for b, h in LAYERS], 'biome': 'minecraft:plains', 'features': False, 'lakes': False, 'structure_overrides': []}, separators=(',', ':'))
    return '\n'.join([
        f'level-name={name}', 'level-type=minecraft\\:flat', 'generator-settings=' + gen.replace(':', '\\:'), 'generate-structures=false',
        'gamemode=creative', 'difficulty=peaceful', 'spawn-protection=0', 'online-mode=false', f'server-port={port}',
        'enable-rcon=false', 'motd=gdsy', 'view-distance=4', 'simulation-distance=4', 'level-seed=20261121', 'spawn-monsters=false',
        'max-world-size=29999984', 'sync-chunk-writes=true', '']) + '\n'

class Server:
    def __init__(self, java, d):
        self.p = subprocess.Popen([java, '-Xmx3G', '-jar', 'server.jar', 'nogui'], cwd=d, stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, bufsize=1)
        self.lines, self.log = queue.Queue(), []
        threading.Thread(target=self._read, daemon=True).start()
    def _read(self):
        for line in self.p.stdout:
            line = line.rstrip('\n'); self.log.append(line); self.lines.put(line)
        self.lines.put(None)
    def wait_for(self, pattern, timeout=900):
        t0 = time.time()
        while time.time() - t0 < timeout:
            try: line = self.lines.get(timeout=5)
            except queue.Empty: continue
            if line is None: raise RuntimeError('server exited:\n' + '\n'.join(self.log[-30:]))
            if re.search(pattern, line): return line
        raise RuntimeError('timed out waiting for ' + pattern + '\n' + '\n'.join(self.log[-30:]))
    def cmd(self, c, expect=None, timeout=300):
        while not self.lines.empty(): self.lines.get_nowait()
        self.p.stdin.write(c + '\n'); self.p.stdin.flush()
        return self.wait_for(expect, timeout) if expect else None
    def stop(self):
        self.cmd('stop'); self.p.wait(timeout=600)

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('server'); ap.add_argument('src'); ap.add_argument('out')
    ap.add_argument('--box', required=True); ap.add_argument('--spawn', default='262,64,-20')
    ap.add_argument('--java', default='/usr/lib/jvm/java-25-openjdk-amd64/bin/java'); ap.add_argument('--name', default='广东实验中学（荔湾校区）')
    ap.add_argument('--commands', default=None, help='a file of server commands run once the map is loaded (e.g. lettering.py summons)')
    a = ap.parse_args()
    x0, x1, z0, z1 = (int(float(v)) for v in a.box.split(','))
    sd = os.path.abspath(a.server); wname = 'world'
    if not open(os.path.join(sd, 'eula.txt')).read().strip().endswith('eula=true'): sys.exit('eula.txt must say eula=true')
    shutil.rmtree(os.path.join(sd, wname), ignore_errors=True)
    open(os.path.join(sd, 'server.properties'), 'w').write(props(25599, wname))
    # 1. create the world
    s = Server(a.java, sd); s.wait_for(r'Done \(', 1200); s.stop()
    w = os.path.join(sd, wname)
    reg = os.path.join(w, 'dimensions', 'minecraft', 'overworld', 'region')
    if not os.path.isdir(reg): reg = os.path.join(w, 'region')
    print('overworld region folder:', os.path.relpath(reg, w))
    # 2. the map's region files
    for f in os.listdir(os.path.join(a.src, 'region')):
        shutil.copy(os.path.join(a.src, 'region', f), os.path.join(reg, f))
    # 3. load every chunk of the box, so that the game upgrades and lights it, then save
    s = Server(a.java, sd); s.wait_for(r'Done \(', 1200)
    cx0, cx1, cz0, cz1 = x0 >> 4, (x1 - 1) >> 4, z0 >> 4, (z1 - 1) >> 4
    n = 0
    for i in range(cx0, cx1 + 1, 16):
        for j in range(cz0, cz1 + 1, 16):
            bx0, bz0 = i * 16, j * 16
            bx1, bz1 = min(i + 15, cx1) * 16 + 15, min(j + 15, cz1) * 16 + 15
            out = s.cmd(f'forceload add {bx0} {bz0} {bx1} {bz1}', r'(?i)force|chunk|error|unknown', 120); n += 1
            print('forceload', bx0, bz0, bx1, bz1, '->', out.split(']: ')[-1][:90])
    time.sleep(90)                       # let the forced chunks load (and upgrade) before saving
    sx, sy, sz = (int(v) for v in a.spawn.split(','))
    for c in (f'setworldspawn {sx} {sy} {sz}', 'time set noon', 'weather clear', 'difficulty peaceful', 'defaultgamemode creative'):
        out = s.cmd(c, r'.', 30); print(c, '->', out.split(']: ')[-1][:100])
    # game rules: names changed over versions; try both spellings and print what the server says
    for rule in (('advance_time', 'doDaylightCycle', 'false'), ('advance_weather', 'doWeatherCycle', 'false'), ('spawn_mobs', 'doMobSpawning', 'false'),
                 ('fire_spread_radius_around_player', 'doFireTick', 'false'), ('random_tick_speed', 'randomTickSpeed', '0'), ('respawn_radius', 'spawnRadius', '0')):
        for name in rule[:2]:
            out = s.cmd(f'gamerule {name} {rule[2] if not name.startswith("fire_spread") else "0"}', r'.', 30)
            print('gamerule', name, '->', out.split(']: ')[-1][:100])
            if not re.search(r'(?i)unknown|incorrect|invalid|expected', out): break
    if a.commands:
        ok = 0
        for line in open(a.commands, encoding='utf-8'):
            line = line.strip()
            if not line or line.startswith('#'): continue
            out = s.cmd(line, r'.', 30); msg = out.split(']: ')[-1]
            good = not re.search(r'(?i)unknown|incorrect|invalid|expected|error|unable|failed', msg)
            ok += good
            if not good: print('   command failed:', line[:80], '->', msg[:200])
        print('commands run:', ok, 'ok')
    time.sleep(5)
    s.cmd('forceload remove all', r'.', 60)
    s.cmd('save-all flush', r'(?i)saved', 600)
    s.stop()
    bad = [l for l in s.log if re.search(r'(?i)(error|exception|couldn.t|failed|corrupt)', l) and not re.search(r'(?i)authlib|yggdrasil|session', l)]
    print('server lines about problems:', len(bad))
    for l in bad[:40]: print('   ', l[:220])
    # 4. the finished world
    shutil.rmtree(a.out, ignore_errors=True)
    shutil.copytree(w, a.out, ignore=shutil.ignore_patterns('session.lock'))
    # the name in the world list
    try:
        import nbtlib
        from nbtlib.tag import String
        lv = nbtlib.load(os.path.join(a.out, 'level.dat'))
        if 'Data' in lv and 'LevelName' in lv['Data']:
            lv['Data']['LevelName'] = String(a.name); lv.save()
            print('level name set to', a.name)
        else:
            print('level.dat has no Data.LevelName; keys:', list(lv.get('Data', lv).keys())[:40])
    except Exception as e:
        print('could not set the level name:', e)
    print('world written to', a.out)
    open(os.path.join(a.out, '..', 'server.log'), 'w').write('\n'.join(s.log))

if __name__ == '__main__':
    main()
