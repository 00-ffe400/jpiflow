#!/bin/sh
# Remove the account bar from a 1600 x 832 local mock worklist capture.
# Usage: crop-pacs-demo.sh CAPTURE OUTPUT
set -eu
[ "$#" -eq 2 ] || { printf 'Usage: %s CAPTURE OUTPUT\n' "$0" >&2; exit 2; }
magick "$1" -crop 1600x800+0+32 +repage -gravity north -background '#1b1b1d' -extent 1600x832 -strip -quality 88 "$2"
