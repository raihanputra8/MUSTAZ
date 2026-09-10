#!/bin/bash
# MUSTAZ CRAFT - Batch Image to WebP Converter (80% Quality)
set -e

DIRECTORIES=("assets/images" "assets/banner")

echo "=================================================="
echo "⚡ MUSTAZ CRAFT — WEBP BATCH CONVERTER (80% QUALITY)"
echo "=================================================="

# Detect available converter
if command -v cwebp &> /dev/null; then
  TOOL="cwebp"
  echo "Using native cwebp converter..."
elif command -v ffmpeg &> /dev/null; then
  TOOL="ffmpeg"
  echo "Using ffmpeg converter..."
elif command -v convert &> /dev/null; then
  TOOL="convert"
  echo "Using ImageMagick convert..."
else
  echo "Error: Neither cwebp, ffmpeg, nor convert found on system."
  exit 1
fi

for DIR in "${DIRECTORIES[@]}"; do
  if [ -d "$DIR" ]; then
    echo "Scanning directory: $DIR"
    find "$DIR" -type f \( -iname "*.png" -o -iname "*.jpg" -o -iname "*.jpeg" \) | while read -r FILE; do
      EXT="${FILE##*.}"
      BASE="${FILE%.*}"
      OUT="${BASE}.webp"
      
      ORIG_SIZE=$(wc -c < "$FILE" | tr -d ' ')
      
      if [ "$TOOL" = "cwebp" ]; then
        cwebp -q 80 "$FILE" -o "$OUT" > /dev/null 2>&1
      elif [ "$TOOL" = "ffmpeg" ]; then
        ffmpeg -nostdin -i "$FILE" -quality 80 -v warning -y "$OUT"
      elif [ "$TOOL" = "convert" ]; then
        convert "$FILE" -quality 80 "$OUT"
      fi
      
      NEW_SIZE=$(wc -c < "$OUT" | tr -d ' ')
      DIFF=$((ORIG_SIZE - NEW_SIZE))
      if [ "$ORIG_SIZE" -gt 0 ]; then
        PCT=$((DIFF * 100 / ORIG_SIZE))
      else
        PCT=0
      fi
      
      echo "  ✓ Converted: $(basename "$FILE") -> $(basename "$OUT") ($((ORIG_SIZE / 1024))KB -> $((NEW_SIZE / 1024))KB, -$PCT%)"
    done
  fi
done

echo "=================================================="
echo "✨ Batch conversion completed successfully!"
echo "=================================================="
