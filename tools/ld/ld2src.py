#!/usr/bin/env python3
"""Pack converted models (tools/ld/ld2garage.py output) into src/98ld0_data.js.
usage: python3 tools/ld/ld2src.py [--out src/98ld1_data.js] id=ld/out/audi.json[:yaw] ...   (yaw = extra quarter turns, applied in the game module)
--out NAME: an extra data module (each module ≤ 200 KB): adds to LD_MESH/LD_MODELS of 98ld0_data.js and skips meshes it already holds.
Meshes shared by several models are stored once. Bricks: [type, x, z, y, r, m, colour index, ox, oy, oz, R] (offsets omitted when 0, R = free rotation 3×3 row-major)."""
import sys, os, json, re
HERE = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(HERE, '..', '..', 'src', '98ld0_data.js'); BASE = OUT
ARGS = sys.argv[1:]
if ARGS[:1] == ['--out']: OUT = ARGS[1]; ARGS = ARGS[2:]
HAVE = set(re.findall(r'"(ld\w+)":\{"n"', open(BASE).read() + open(os.path.join(os.path.dirname(BASE), '98ld1_data.js')).read())) if OUT != BASE else set()  # 98ld0 + 98ld1 always ship
CRED = {'75895-1.mpd': 'Magnus Forsberg (MagFors)', '4643-1.mpd': 'Marc Giraudet (Mad_Marc)', '10264-1.mpd': 'Jaco van der Molen', '76897-1.mpd': 'Adrien Pennamen', '1490-1.mpd': 'Robert Paciorek (bercik)', '4641-1.mpd': 'juraj3579 / Steffen'}
meshes, models = {}, {}
for a in ARGS:
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
    if R['model'] not in CRED:  # author from the OMR file header ('0 Author: Name [login]')
        mp = os.path.join(HERE, '..', '..', 'ld', 'omr', R['model'])
        if os.path.exists(mp):
            m = re.search(r'^0 Author:\s*(.+?)\s*$', open(mp, errors='replace').read(), re.M)
            if m: CRED[R['model']] = m.group(1).replace('[', '(').replace(']', ')')
    models[mid] = {'src': R['model'], 'by': CRED.get(R['model'], ''), 'n': R['n'], 'C': C, 'B': B}
js = ['// ---- LD data: real LEGO builds converted from LDraw OMR files (CCAL 2.0) by tools/ld/ld2garage.py + tools/ld/ld2src.py. Generated, do not edit.',
      '// Authors of the LDraw files: ' + '; '.join('%s %s' % (m['src'], m['by']) for m in models.values()) + '. Details: docs/MODEL_PIPELINE.md.',
      ('const LD_MESH=' if OUT == BASE else 'Object.assign(LD_MESH,') + json.dumps({k: {kk: v[kk] for kk in ('n', 'id', 'w', 'd', 'h', 'v', 'i', 's')} for k, v in sorted(meshes.items()) if k not in HAVE}, separators=(',', ':')) + (';' if OUT == BASE else ');'),
      ('const LD_MODELS=' if OUT == BASE else 'Object.assign(LD_MODELS,') + json.dumps(models, separators=(',', ':')) + (';' if OUT == BASE else ');')]
open(OUT, 'w').write('\n'.join(js) + '\n')
print('LD2SRC_OK', OUT, os.path.getsize(OUT), 'B', len([k for k in meshes if k not in HAVE]), 'meshes', {k: m['n'] for k, m in models.items()})
