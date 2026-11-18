#!/bin/sh
# Builds the one-file launchers into launcher/dist/. Run from anywhere:  sh launcher/build.sh
# Needs Go 1.20 or newer and nothing else (standard library only; no download). The site as it is in the working tree
# (index.html, src/, vendor/) is copied into launcher/site/ and embedded in each program.
set -e
cd "$(dirname "$0")"
rm -rf site dist && mkdir -p site dist
cp ../index.html site/ && cp -r ../src ../vendor site/
build() { GOOS=$1 GOARCH=$2 CGO_ENABLED=0 go build -trimpath -ldflags "-s -w" -o "dist/$3" . && echo "built dist/$3"; }
build windows amd64 gdsy-campus-3d.exe
build windows arm64 gdsy-campus-3d-arm64.exe
build darwin arm64 gdsy-campus-3d-mac-arm64
build darwin amd64 gdsy-campus-3d-mac-intel
build linux amd64 gdsy-campus-3d-linux
