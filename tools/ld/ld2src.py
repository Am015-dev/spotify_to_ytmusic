#!/usr/bin/env python3
"""Pack converted models (tools/ld/ld2garage.py output) into src/98ld0_data.js.
usage: python3 tools/ld/ld2src.py id=ld/out/audi.json[:yaw] ...   (yaw = extra quarter turns, applied in the game module)
Meshes shared by several models are stored once. Bricks: [type, x, z, y, r, m, colour index, ox, oy, oz, R] (offsets omitted when 0, R = free rotation 3×3 row-major)."""
import sys, os, json, re
HERE = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(HERE, '..', '..', 'src', '98ld0_data.js')
CRED = {'76897-1.mpd': 'Adrien Pennamen', '1490-1.mpd': 'Robert Paciorek (bercik)', '4641-1.mpd': 'juraj3579 / Steffen'}
meshes, models = {}, {}
for a in sys.argv[1:]:
    mid, f = a.split('=', 1)
    R = json.load(open(f))
    meshes.update(R['meshes'])
    C = []
    def ci(c):
        if c not in C: C.append(c)
        return C.index(c)
    B = []
    for b in R['bricks']:
        e = [b['t'], b['x'], b['z'], b['y'], b['r'], b['m'], ci(b['c'])]
        o = [b.get('ox', 0), b.get('oy', 0), b.get('oz', 0)]
        if any(o) or 'R' in b: e += o
        if 'R' in b: e.append(b['R'])
        B.append(e)
    models[mid] = {'src': R['model'], 'by': CRED.get(R['model'], ''), 'n': R['n'], 'C': C, 'B': B}
js = ['// ---- LD data: real LEGO builds converted from LDraw OMR files (CCAL 2.0) by tools/ld/ld2garage.py + tools/ld/ld2src.py. Generated, do not edit.',
      '// Authors of the LDraw files: ' + '; '.join('%s %s' % (m['src'], m['by']) for m in models.values()) + '. Details: docs/MODEL_PIPELINE.md.',
      'const LD_MESH=' + json.dumps({k: {kk: v[kk] for kk in ('n', 'id', 'w', 'd', 'h', 'v', 'i', 's')} for k, v in sorted(meshes.items())}, separators=(',', ':')) + ';',
      'const LD_MODELS=' + json.dumps(models, separators=(',', ':')) + ';']
open(OUT, 'w').write('\n'.join(js) + '\n')
print('LD2SRC_OK', OUT, os.path.getsize(OUT), 'B', len(meshes), 'meshes', {k: m['n'] for k, m in models.items()})
