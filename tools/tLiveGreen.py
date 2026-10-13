#!/usr/bin/env python3
# % of the frame that is FLAT UNIFORM GREEN: 8x8 blocks whose mean is green (G > R+12, G > B+12) and whose luma stdev < 9.
# The bottom 22% (car + HUD) is ignored. usage: tLiveGreen.py shot.png [...]  -> "<file> green=<pct>"
import sys
from PIL import Image, ImageStat
def flat_green(path):
    im = Image.open(path).convert('RGB'); W, H = im.size; H2 = int(H * .78); n = g = 0
    for y in range(0, H2 - 7, 8):
        for x in range(0, W - 7, 8):
            b = im.crop((x, y, x + 8, y + 8)); r, gg, bb = ImageStat.Stat(b).mean; n += 1
            if gg > r + 12 and gg > bb + 12 and ImageStat.Stat(b.convert('L')).stddev[0] < 9: g += 1
    return 100.0 * g / max(1, n)
for f in sys.argv[1:]: print(f"{f} green={flat_green(f):.1f}")
