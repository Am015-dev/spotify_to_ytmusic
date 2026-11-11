#!/usr/bin/env python3
"""Makes the three shelf cover images (games-src/room/new-games/covers/<id>.jpg) from real screenshots of the built games.

Run this on its own whenever a game's painted title changes (for example after the final builds), then re-run
../add-new-games.py to copy the covers into games/covers/.

  NODE_PATH=/tmp/claude-0/-home-user-spotify-to-ytmusic/5a36d2af-8697-5203-aeea-a0f2a3329615/scratchpad/node_modules \\
    python3 games-src/room/new-games/make-covers.py [lantern cauldron approach]

Each game is rendered with Playwright at 1600x900 (executablePath /opt/pw-browsers/chromium, override with CHROMIUM=...),
the painted title (name, tagline and painting; buttons hidden) is screenshotted, scaled to 960x540 and saved as a
non-progressive 4:2:0 JPEG at quality 84, the same size and quality as the covers already in games/covers/.
"""
import os, subprocess, sys, tempfile
from PIL import Image
D = os.path.dirname(os.path.abspath(__file__))
IDS = ['lantern', 'cauldron', 'approach']
ids = [a for a in sys.argv[1:] if a in IDS] or IDS
env = dict(os.environ)
env.setdefault('NODE_PATH', '/tmp/claude-0/-home-user-spotify-to-ytmusic/5a36d2af-8697-5203-aeea-a0f2a3329615/scratchpad/node_modules')
tmp = tempfile.mkdtemp(prefix='covers-')
r = subprocess.run(['node', os.path.join(D, 'shot-title.js'), tmp] + ids, env=env)
if r.returncode != 0: print('warning: some games could not be rendered (see above)')
os.makedirs(os.path.join(D, 'covers'), exist_ok=True)
for i in ids:
    src = os.path.join(tmp, i + '.png')
    if not os.path.exists(src): print('skipped', i); continue
    im = Image.open(src).convert('RGB').resize((960, 540), Image.LANCZOS)
    dst = os.path.join(D, 'covers', i + '.jpg')
    im.save(dst, 'JPEG', quality=84, optimize=True, subsampling=2)
    print('wrote', dst, os.path.getsize(dst) // 1024, 'KB')
