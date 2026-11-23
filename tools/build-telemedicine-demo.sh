#!/bin/sh
# Composite an identifier-free crop of the mock empty dashboard into the laptop.
# Usage: build-telemedicine-demo.sh LAPTOP_FRAME EMPTY_DASHBOARD OUTPUT
set -eu
[ "$#" -eq 3 ] || { printf 'Usage: %s LAPTOP_FRAME EMPTY_DASHBOARD OUTPUT\n' "$0" >&2; exit 2; }
magick "$1" \( "$2" -crop 1440x710+0+190 +repage -resize 2716x -gravity center -background white -extent 2716x1649 \) -gravity northwest -geometry +314+40 -composite -strip "$3"
