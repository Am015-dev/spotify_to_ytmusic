#!/usr/bin/env python3
"""Drop parts nobody can see from outside (world props): python3 tools/ld/ldcull.py in.json out.json [cell] [drop: part keys, comma]
Each part's box (_box, game units) is rasterised into 5 depth maps (top, ±x, ±z) at `cell` (default 0.3 = ½ stud); a part survives when it is the
nearest surface in at least 2 cells of any view. Glass (~colour) never hides what is behind it. Used for big buildings (10264) to stay in the phone budget."""
import sys, json, math
import numpy as np
R = json.load(open(sys.argv[1])); C = float(sys.argv[3]) if len(sys.argv) > 3 else .3
DROP = set(sys.argv[4].split(',')) if len(sys.argv) > 4 else set()  # tiny decor with many triangles (flowers, clips)
R['bricks'] = [b for b in R['bricks'] if b['t'].split('@')[0] not in DROP]
B = [b for b in R['bricks'] if '_box' in b]; bx = np.array([b['_box'] for b in B]); lo = bx[:, :3].min(0); hi = bx[:, 3:].max(0)
glass = np.array([str(b['c']).startswith('~') for b in B])
n = np.ceil((hi - lo) / C).astype(int) + 1
seen = np.zeros(len(B), int)
# view: (depth axis, sign, the two map axes); sign -1 = looking from the max side
for ax, sg, (u, v) in [(1, -1, (0, 2)), (0, 1, (1, 2)), (0, -1, (1, 2)), (2, 1, (0, 1)), (2, -1, (0, 1))]:
    D = np.full((n[u], n[v]), np.inf); I = np.full((n[u], n[v]), -1)
    near = (bx[:, ax] - lo[ax]) if sg > 0 else (hi[ax] - bx[:, ax + 3])
    for i in np.argsort(near):
        if glass[i]: continue
        a0, a1 = int((bx[i, u] - lo[u]) / C + .25), int(math.ceil((bx[i, u + 3] - lo[u]) / C - .25)); b0, b1 = int((bx[i, v] - lo[v]) / C + .25), int(math.ceil((bx[i, v + 3] - lo[v]) / C - .25))
        if a1 <= a0: a1 = a0 + 1
        if b1 <= b0: b1 = b0 + 1
        S = D[a0:a1, b0:b1]; m = near[i] < S
        seen[i] = max(seen[i], int(m.sum())); S[m] = near[i]
    # glass: visible if in front of the nearest solid
    for i in np.where(glass)[0]:
        a0, a1 = int((bx[i, u] - lo[u]) / C), max(int((bx[i, u] - lo[u]) / C) + 1, int(math.ceil((bx[i, u + 3] - lo[u]) / C))); b0, b1 = int((bx[i, v] - lo[v]) / C), max(int((bx[i, v] - lo[v]) / C) + 1, int(math.ceil((bx[i, v + 3] - lo[v]) / C)))
        seen[i] = max(seen[i], int((near[i] <= D[a0:a1, b0:b1]).sum()))
keep = [b for b, s in zip(B, seen) if s >= 2] + [b for b in R['bricks'] if '_box' not in b]
used = {b['t'].split('@')[0] for b in keep}; R['meshes'] = {k: v for k, v in R['meshes'].items() if k in used}
print('LDCULL kept %d of %d parts, %d meshes' % (len(keep), len(R['bricks']), len(R['meshes'])))
R['bricks'] = keep; json.dump(R, open(sys.argv[2], 'w'))
