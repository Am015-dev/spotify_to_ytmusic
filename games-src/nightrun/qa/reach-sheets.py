#!/usr/bin/env python3
"""W191: forward-most opaque column (alpha > 40) ahead of the anchor on every frame of the strike and idle strips, in sheet px. Prints JSON {sheet/act: [px per frame]}.
Read straight from games/mainhattan-nightrun/media/anim, so the reach probe does not trust the table inside streetreach.js."""
import json, os, sys
from PIL import Image
import numpy as np
R = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../..'))
out = {}
for who, act in [('kai', 'melee'), ('kai', 'combo2'), ('kai', 'combo3'), ('knife', 'melee'), ('bruiser', 'melee'), ('kai', 'idle'), ('knife', 'idle'), ('bruiser', 'idle'), ('gunman', 'idle')]:
    j = json.load(open(f'{R}/games-src/anims/mainhattan-nightrun/sheets/{who}/{act}-strip.json'))
    a = np.array(Image.open(f'{R}/games/mainhattan-nightrun/media/anim/{who}/{act}-strip.webp').convert('RGBA'))[:, :, 3] > 40
    w, ax = j['w'], j['anchor'][0]
    out[f'{who}/{act}'] = [int(np.where(a[:, i * w:(i + 1) * w].any(0))[0].max() - ax) for i in range(j['frames'])]
json.dump(out, sys.stdout)
