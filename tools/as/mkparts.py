"""asset-1: real LEGO part meshes for world assets (trees, bushes, street props).
Reads each part from the official LDraw library (ld/lib/ldraw, complete.zip, CCAL 2.0), drops the stud primitives (top studs are
re-added in the game as cylinders, recorded here) and the underside tubes, decimates the body (pyfqmr) to a near and a mid budget,
and writes src/assets/as/parts.js: window.__AS_PD[part]={t:title,n:[v,i],m:[v,i],s:[x,y,z,..]} (Int16 LDU*4, y up, base64)."""
import os, re, sys, json, base64, numpy as np, pyfqmr
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'ld')); import ldlib
# part: (near tris, mid tris)
PARTS = {'2417': (110, 36), '2423': (70, 24), '3941': (56, 20), '3062b': (36, 14), '6141': (20, 8), '24866': (40, 14), '32607': (44, 16),
         '2518': (60, 20), '2536a': (60, 20), '2563a': (40, 14), '4589': (24, 10), '3005': (12, 12), '3004': (12, 12), '3024': (12, 12),
         '3023b': (12, 12), '3022': (12, 12), '3020': (12, 12), '3069b': (12, 12), '3068b': (12, 12), '3070b': (12, 12), '3633': (60, 20),
         '4032a': (32, 12), '3960': (60, 24), '4740': (36, 14), '2039': (60, 24), '3001': (12, 12), '3010': (12, 12), '3710': (12, 12),
         '6255': (60, 20), '98138': (20, 8), '3039': (16, 12), '30136': (40, 16), '3009': (12, 12), '87079': (12, 12), '6636': (12, 12),
         '3062b': (36, 14), '30176': (50, 18), '6148': (40, 14), '3742': (40, 14), '2431': (12, 12), '3958': (12, 12), '30374': (16, 8),
         # asset-2: street furniture (lamp, traffic light, signs, bus stop, kiosk, hedge)
         '3957a': (16, 8), '30260': (40, 16), '30261': (40, 16), '4215b': (24, 12), '4865b': (24, 12), '3035': (12, 12), '3031': (12, 12),
         '3034': (12, 12), '3032': (12, 12), '3069b': (12, 12), '3003': (12, 12), '3040b': (12, 10), '4070': (30, 12), '3622': (12, 12),
         '3666': (12, 12), '3460': (12, 12), '4162': (12, 12), '2412b': (24, 12), '3008': (12, 12), '30413': (24, 12), '3795': (12, 12)}
UNDER = re.compile(r'(^|\\)(stud3|stud4|stud6|stud8|stud12|stud16|stud18|stud22|stud23|stud24|stud26|stud29|stud30|stud31|stud33|stug\d|stug\d+-|tube)', re.I)
def load(name):
    T, S = [], []
    def rec(n, M, inv, depth):
        f = ldlib.find(n)
        if not f: return
        ccw = True; invnext = False
        for ln in open(f, encoding='utf-8', errors='replace'):
            p = ln.split()
            if not p: continue
            if p[0] == '0':
                s = ' '.join(p[1:]).upper()
                if s.startswith('BFC'):
                    if 'CW' in p[2:] and 'CCW' not in p[2:]: ccw = False
                    if 'CCW' in p[2:]: ccw = True
                    if 'INVERTNEXT' in s: invnext = True
                continue
            if p[0] == '1' and len(p) >= 15:
                ref = ' '.join(p[14:]).lower().replace('/', '\\'); W = M @ ldlib._mat(p[2:14]); iv = inv ^ invnext; invnext = False
                b = os.path.basename(ref)
                if b.startswith('stud') or b.startswith('s\\stud'):
                    up = W[:3, :3] @ np.array([0, -1., 0])
                    if not UNDER.search(b) and up[1] < -.5: S.append(W[:3, 3].copy())
                    continue
                if UNDER.search(ref): continue
                rec(ref, W, iv, depth + 1)
            elif p[0] in ('3', '4'):
                k = int(p[0]); v = np.array(list(map(float, p[2:2 + 3 * k]))).reshape(-1, 3); v = (M[:3, :3] @ v.T).T + M[:3, 3]
                flip = (np.linalg.det(M[:3, :3]) < 0) ^ inv ^ (not ccw)
                tri = [[0, 1, 2]] + ([[0, 2, 3]] if k == 4 else [])
                for t in tri: T.append(v[t[::-1]] if flip else v[t])
    rec(name + '.dat', np.eye(4), False, 0)
    return np.array(T), np.array(S)
def dec(T, n):
    V = T.reshape(-1, 3); Vu, inv = np.unique(np.round(V, 3), axis=0, return_inverse=True); F = inv.reshape(-1, 3)
    F = F[(F[:, 0] != F[:, 1]) & (F[:, 1] != F[:, 2]) & (F[:, 0] != F[:, 2])]
    if len(F) > n:
        s = pyfqmr.Simplify(); s.setMesh(Vu, F); s.simplify_mesh(target_count=n, aggressiveness=7, max_iterations=400, preserve_border=False, verbose=False); Vu, F, _ = s.getMesh()
    return Vu, F
def enc(V, F):
    V = np.array(V) * [1, -1, -1]; q = np.round(V * 4).astype('<i2'); f = np.array(F).astype('<u2')
    return [base64.b64encode(q.tobytes()).decode(), base64.b64encode(f.tobytes()).decode()]
SFIX = {'3941': [[x, 0, z] for x in (-10, 10) for z in (-10, 10)], '4032a': [[x, 0, z] for x in (-10, 10) for z in (-10, 10)]}
# incremental (default): keep the parts already in parts.js byte for byte, build only the new ones; --all rebuilds every part
OUTF = os.path.join(os.path.dirname(__file__), '..', '..', 'src', 'assets', 'as', 'parts.js')
out = {}; rep = []
if '--all' not in sys.argv and os.path.exists(OUTF):
    t = open(OUTF).read(); out = json.loads(t[t.index('window.__AS_PD=') + 15:].rstrip().rstrip(';'))
for p, (nn, nm) in PARTS.items():
    if p in out: continue
    T, S = load(p); title = ldlib.part_tris(p + '.dat')[1]
    if not len(T): print('MISSING', p); continue
    a = dec(T, nn); b = dec(T, nm)
    S = (np.array(S) * [1, -1, -1]).round(1).tolist() if len(S) else []
    if p in SFIX: S = SFIX[p]
    out[p] = {'t': title, 'n': enc(*a), 'm': enc(*b), 's': [c for s in S for c in s], 'b': [round(float(x), 1) for x in np.r_[a[0].min(0) * [1, 1, 1], a[0].max(0)]]}
    rep.append(f'{p:6} {title[:40]:40} raw {len(T):5} near {len(a[1]):4} mid {len(b[1]):4} studs {len(S)}')
print('\n'.join(rep))
js = ('// ---- AS0 part meshes (asset-1, generated by tools/as/mkparts.py from the official LDraw library, CCAL 2.0; do not edit).\n'
      '// __AS_PD[part]={t:LDraw title,n:[verts,idx] near,m:[verts,idx] mid,s:[x,y,z,..] top studs}; verts Int16 = LDU*4, y up, base64.\n'
      'window.__AS_PD=' + json.dumps(out, separators=(',', ':')) + ';\n')
open(OUTF, 'w').write(js); print('bytes', len(js))
