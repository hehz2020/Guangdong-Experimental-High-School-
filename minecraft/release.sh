#!/bin/sh
# One version of the Minecraft map, from the voxel tiles to a zip in minecraft/releases/.
#
# usage: sh minecraft/release.sh <version, e.g. v2> <work dir> <server dir> <site url>
#   <work dir>   holds full/vox_*.json (voxelize.mjs --tile 128 over the campus box) and receives everything built
#   <server dir> holds Mojang's server.jar and the eula.txt the user agreed to
#   <site url>   the campus site served locally (for the doorway probes), e.g. http://127.0.0.1:8800/index.html
# Needs the Python packages numpy and nbtlib on python3, Node with Playwright, Java 25 for the server.
set -e
V=$1; W=$2; SRV=$3; URL=$4
R=$(cd "$(dirname "$0")/.." && pwd)
BOX=-115,300,-290,250
cd "$R"
echo "== $V: blocks and doorways"
python3 minecraft/build_world.py "$W"/full/vox_*.json --out "$W/world_pre" --spawn 262,-20,90 --blocks "$W/pre_blocks.npz" > "$W/build_pre.log"
python3 minecraft/doorways.py candidates "$W/pre_blocks.npz" "$W/cands.json"
node minecraft/carve.mjs "$URL" "$W/cands_probes.json" "$W/free.json"
python3 minecraft/doorways.py open "$W/cands.json" "$W/free.json" "$W/open.json"
echo "== $V: the world"
rm -rf "$W/world_$V"
python3 minecraft/build_world.py "$W"/full/vox_*.json --out "$W/world_$V" --name "广东实验中学（荔湾校区）" --spawn 262,-20,90 \
  --blocks "$W/blocks_$V.npz" --open "$W/open.json" | tee "$W/build_$V.log"
python3 minecraft/check_world.py "$W/world_$V" | tail -1
python3 minecraft/walk_check.py "$W/blocks_$V.npz" 262,-20 minecraft/targets.json | tee "$W/walk_$V.log"
echo "== $V: through the official server"
python3 minecraft/server_pack.py "$SRV" "$W/world_$V" "$W/out_$V/gdsy-campus" --box=$BOX | tail -12
echo "== $V: zip"
mkdir -p minecraft/releases
rm -rf "$W/zip_$V" && mkdir -p "$W/zip_$V"
cp -r "$W/out_$V/gdsy-campus" "$W/zip_$V/"
[ -f minecraft/icon.png ] && cp minecraft/icon.png "$W/zip_$V/gdsy-campus/icon.png"
cp minecraft/安装说明.txt "$W/zip_$V/说明.txt"
(cd "$W/zip_$V" && python3 -c "
import zipfile, os, sys
z = zipfile.ZipFile(sys.argv[1], 'w', zipfile.ZIP_DEFLATED)
for r, ds, fs in os.walk('.'):
    for f in sorted(fs):
        p = os.path.join(r, f)[2:]; z.write(p, p)
z.close()" "$R/minecraft/releases/gdsy-minecraft-$V.zip")
ls -la "minecraft/releases/gdsy-minecraft-$V.zip"
