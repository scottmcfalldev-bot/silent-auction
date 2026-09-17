#!/bin/bash
# Shrinks every photo in Images/ to a phone-friendly JPEG in img/.
# Drop full-size originals into Images/, run this, then reference the
# printed img/... path from config.js.
#
#   ./tools/optimize-images.sh
#
# Uses sips, which ships with macOS. Skips files that are already up to date.

cd "$(dirname "$0")/.." || exit 1
mkdir -p img

for src in Images/*; do
  [ -f "$src" ] || continue
  base=$(basename "$src")
  slug=$(echo "${base%.*}" | tr '[:upper:]' '[:lower:]' | sed -E 's/[^a-z0-9]+/-/g; s/^-+|-+$//g')
  out="img/$slug.jpg"
  if [ "$out" -nt "$src" ]; then continue; fi
  if sips -s format jpeg -s formatOptions 72 -Z 1000 "$src" --out "$out" >/dev/null 2>&1; then
    echo "$out"
  else
    echo "FAILED: $src" >&2
  fi
done
