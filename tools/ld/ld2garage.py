#!/usr/bin/env python3
"""LDraw (.ldr/.mpd) -> Mainhattan Overdrive garage brick list.  Pipeline: docs/MODEL_PIPELINE.md.

usage: python3 tools/ld/ld2garage.py MODEL.mpd OUT_PREFIX [--yaw K] [--only SUBMODEL,...] [--drop SUBMODEL,...] [--keep-figs]
writes OUT_PREFIX.json (bricks + report) and OUT_PREFIX.md (substitution report).

How a part is placed:
 1. part id -> our part: direct LEGO design id (G13_ID on our tiles) -> alias table -> plain brick/plate/tile of any size (B/P/T WxD)
    -> closest shape among our parts (surface-point chamfer over the 24 axis rotations) -> box of the same size (reported).
 2. calibration (cached in tools/ld/calib.json): the rotation C and offset d with  our_part ~= C * (S*A*ldraw_part) + d,
    A = LDraw axes -> ours (x, -y, -z), S = 0.03 game units per LDU (stud 20 LDU = 0.6, plate 8 LDU = 0.24).
 3. a placed part (LDraw matrix R,t): orientation O = A R A^-1 C^T -> our yaw r (0..3) + tilt '@xz0'; body centre
    g = -O d + S A t -> cell (x, z studs, y plates) + sub-stud offsets ox/oz (studs), oy (plates).
"""
import sys, os, re, json, math, argparse, collections
import numpy as np
from scipy.spatial import cKDTree
sys.path.insert(0, os.path.dirname(__file__))
import ldlib, ldmesh
HERE = os.path.dirname(os.path.abspath(__file__))
OURS = json.load(open(os.path.join(HERE, '..', '..', 'ld', 'ours.json')))
U, PH = OURS['U'], OURS['PH']
S = U / 20.0
A = np.diag([1.0, -1.0, -1.0])
PARTS = {p['k']: p for p in OURS['parts']}
PRINTS = {'tx12', 'lp12', 'sg14g', 'sg14b'}
ID2KEY = {}
for p in OURS['parts']:
    if p['id'] and p['k'] not in PRINTS: ID2KEY.setdefault(str(p['id']), p['k'])
# LDraw ids that are the same mould under another number, or our parts without an id on the tile
ALIAS = {'3794': 'jmp', '15573': 'jmp', '6141': 'rp', '4073': 'rp', '4032': 'rp22', '3062': 'round', '3941': 'rb22', '6143': 'rb22',
         '4589': 'cone', '59900': 'cone', '3665': 'inv', '3660': 'inv22', '3040': 's21', '3039': 's22', '4286': 's31', '3070': 't11',
         '3069': 'tile', '3068': 't22', '2412': 'grl', '3829': 'stw', '3829c01': 'stw', '4070': 'hl',
         '30039': 't11', '25269': 'qt11', '98138': 'rt', '3024': 'p11', '3023': 'p12'}
WHEELS = {'wS': None, 'wM': None, 'wL': None}
def norm_id(name, title):
    """'3069bpr0001.dat' -> '3069'; follows '~Moved to'."""
    m = re.match(r'~moved to\s+(\S+)', title.lower())
    if m: return norm_id(m.group(1), ldlib.part_tris(m.group(1) + '.dat')[1])
    b = os.path.basename(name.replace('\\', '/')).lower()
    b = re.sub(r'\.dat$', '', b)
    m = re.match(r'^(\d+)[a-z]?(?:(?:p|pr|pat|c)\w*)?$', b)
    return m.group(1) if m else b
def rot24():
    R = []
    for M in __import__('itertools').permutations(range(3)):
        for s in __import__('itertools').product([1, -1], repeat=3):
            Q = np.zeros((3, 3))
            for i in range(3): Q[i, M[i]] = s[i]
            if np.linalg.det(Q) > 0: R.append(Q)
    return R
R24 = rot24()
def Rx(a): c, s = math.cos(a), math.sin(a); return np.array([[1, 0, 0], [0, c, -s], [0, s, c]])
def Ry(a): c, s = math.cos(a), math.sin(a); return np.array([[c, 0, s], [0, 1, 0], [-s, 0, c]])
def Rz(a): c, s = math.cos(a), math.sin(a); return np.array([[c, -s, 0], [s, c, 0], [0, 0, 1]])
H = math.pi / 2
ORI = {}  # rounded O -> (r, x, z), simplest first
for x, z in sorted([(x, z) for x in range(4) for z in range(4)], key=lambda q: (q[0] > 0) + (q[1] > 0)):
    for r in range(4):
        k = tuple(np.round(Ry(r * H) @ Rz(z * H) @ Rx(x * H)).astype(int).ravel())
        ORI.setdefault(k, (r, x, z))
ORIL = []  # every orientation the garage can store: Ry(r 90°) Ry(q 45°) Rz(z 90°) Rx(x 90°)
for x in range(4):
    for z in range(4):
        for q in range(2):
            for r in range(4): ORIL.append((Ry(r * H) @ Ry(q * H / 2) @ Rz(z * H) @ Rx(x * H), r, x, z, q))
def nearest_ori(O, spin):
    """exact 90° match first; else the closest stored orientation (spin: the part is round, so its own up-axis turn is free)."""
    k = tuple(np.round(O).astype(int).ravel())
    if np.abs(O - np.round(O)).max() < 0.02 and k in ORI: return ORI[k] + (0,), 0.0
    best = (9, None)
    for kk in range(8 if spin else 1):
        Q = O @ Ry(kk * H / 2)
        for R, r, x, z, q in ORIL:
            e = np.linalg.norm(R - Q)
            if e < best[0] - 1e-6: best = (e, (r, x, z, q))
    ang = math.degrees(2 * math.asin(min(1, best[0] / math.sqrt(8))))
    return best[1], ang
def tilt_dims(P, x, z, q=0):
    M = Ry(q * H / 2) @ Rz(z * H) @ Rx(x * H); e = np.zeros(3)
    for sx in (-1, 1):
        for sy in (-1, 1):
            for sz in (-1, 1):
                e = np.maximum(e, np.abs(M @ np.array([sx * P['w'] * U / 2, sy * P['h'] * PH / 2, sz * P['d'] * U / 2])))
    jr = lambda v: math.floor(v + 0.5 + 1e-9)  # JS Math.round (G13_def), not Python's banker's rounding
    return max(1, jr(2 * e[0] / U)), max(1, jr(2 * e[2] / U)), max(1, jr(2 * e[1] / PH))
def generic(t):
    m = re.match(r'^([PBTC])(\d+)x(\d+)$', t)
    if not m: return None
    return {'k': t, 'w': int(m.group(2)), 'd': int(m.group(3)), 'h': {'P': 1, 'B': 3, 'T': 1, 'C': 2}[m.group(1)], 'gen': 1}
MESH = {}  # 'ld<id>' -> mesh dict (ldmesh.mesh) for parts we import as real LDraw geometry
def our(t): return PARTS.get(t) or MESH.get(t) or generic(t)
def mesh_part(name, title, i):
    k = 'ld' + re.sub(r'[^0-9a-z]', '', i.lower())
    if k not in MESH:
        m = ldmesh.mesh(name)
        if not m or m['tris'] > 1600: return None
        dd = [-m['c'][0], -m['c'][1] - m['h'] * PH / 2, -m['c'][2]]  # piece frame (bottom at 0) -> body-centre frame
        m.update(k=k, n=title, id=i, cal={'s': 0, 'C': np.eye(3).astype(int).tolist(), 'd': dd}); MESH[k] = m
    return k
def our_pts(t):
    P = our(t)
    if 'p' in P and P['p']: return np.array(P['p']) - [0, P['h'] * PH / 2, 0]
    # generic box: sample its 6 faces (+ studs ignored)
    rng = np.random.default_rng(2); W, D, Hh = P['w'] * U, P['d'] * U, P['h'] * PH; pts = []
    for _ in range(2500):
        f = rng.integers(3); s = rng.choice([-.5, .5]); a, b = rng.random(2) - .5
        q = [a * W, b * Hh, s * D] if f == 0 else ([s * W, a * Hh, b * D] if f == 1 else [a * W, s * Hh, b * D]); pts.append(q)
    return np.array(pts)
def ld_pts(name, n=2500):
    tris, _ = ldlib.part_tris(name)
    return (S * (A @ ldlib.sample(tris, n).T)).T
VIEWS = [(1, 1), (0, 1), (0, -1), (2, 1), (2, -1)]  # top and the 4 sides (the underside differs: LDraw parts are hollow)
def env_score(X, Y, G):
    lo = np.minimum(X.min(0), Y.min(0)); hi = np.maximum(X.max(0), Y.max(0)); n = np.ceil((hi - lo) / G).astype(int) + 1; tot = 0
    for ax, sg in VIEWS:
        u, v = [i for i in range(3) if i != ax]; E = []
        for P in (X, Y):
            m = np.full((n[u], n[v]), -np.inf); iu = ((P[:, u] - lo[u]) / G).astype(int); iv = ((P[:, v] - lo[v]) / G).astype(int)
            np.maximum.at(m, (iu, iv), sg * P[:, ax]); E.append(m)
        a, b = np.isfinite(E[0]), np.isfinite(E[1]); both = a & b; un = (a | b).sum()
        d = np.abs(E[0][both] - E[1][both]).mean() if both.any() else 1
        tot += d + 0.25 * (a ^ b).sum() / max(1, un)
    return tot / len(VIEWS)
def fit_d(Z, Y):
    d = (Y.min(0) + Y.max(0)) / 2 - (Z.min(0) + Z.max(0)) / 2; d[1] = Y.min(0)[1] - Z.min(0)[1]
    return np.round(d / (S / 2)) * (S / 2)
def align(X, Y, area):
    """best (score, C, d): Y ~= C X + d (both N x 3, game units)."""
    G = float(np.clip(math.sqrt(area / len(Y)) * 2.2, 0.035, 0.2)); best = (1e9, None, None)
    for C in R24:
        Z = X @ C.T; d = fit_d(Z, Y); s = env_score(Z + d, Y, G)
        if s < best[0] - 1e-9: best = (s, C, d)
    return best
CAL_F = os.path.join(HERE, 'calib.json')
CAL = json.load(open(CAL_F)) if os.path.exists(CAL_F) else {}
def calib(name, t):
    k = name + '|' + t
    if k not in CAL:
        P = our(t); Y = our_pts(t); ar = P.get('area') or 2 * (P['w'] * P['d'] * U * U + (P['w'] + P['d']) * U * P['h'] * PH)
        X = ld_pts(name, len(Y)); s, C, d = align(X, Y, ar)
        CAL[k] = {'s': round(float(s), 4), 'C': C.astype(int).tolist(), 'd': [round(float(v), 5) for v in d]}
    c = CAL[k]; return c['s'], np.array(c['C'], float), np.array(c['d'])
def calib_any(name, t):
    if t in MESH: c = MESH[t]['cal']; return 0, np.array(c['C'], float), np.array(c['d'])
    return calib(name, t)
def ld_dims(name):
    """bbox of the part body (no studs) in studs x/z, plates y, in our axes, sorted xz."""
    tris, _ = ldlib.part_tris(name); v = tris.reshape(-1, 3)
    if not len(v): return (0, 0, 0)
    lo, hi = v.min(0), v.max(0); y0 = lo[1] + (4 if hi[1] - lo[1] > 6 else 0)  # drop the 4 LDU studs
    return (hi[0] - lo[0]) / 20, (hi[1] - y0) / 8, (hi[2] - lo[2]) / 20
SKIP_T = re.compile(r'^(car steering wheel$|~car steering wheel$|minifig (?!seat)|~minifig (?!seat)|sticker|technic axle pin|technic pin|string|electric|~minifig)', re.I)
def choose(name, args):
    """-> (our key or None, method, score)"""
    tris, title = ldlib.part_tris(name)
    i = norm_id(name, title); tl = title.lower()
    if m := re.match(r'~moved to\s+(\S+)', tl): tl = ldlib.part_tris(m.group(1) + '.dat')[1].lower()
    if SKIP_T.match(tl + ' ') and not args.keep_figs: return None, 'skip (' + tl.split()[0] + ')', 0
    sub = ' '.join(l for l in (ldlib.EMB.get(name.lower()) or []) if l.startswith('1 '))
    if re.search(r'1889[0-9]|18977|tyre', sub.lower()) and ('c0' in name.lower()):  # rim + tyre shortcut: same as its tyre
        return 'wL', 'tyre (rim+tyre assembly)', 0
    if tl.startswith('tyre') or tl.startswith('tire'):
        dx, dy, dz = ld_dims(name); dia = max(dy * 8, dz * 20) * 0.4  # mm
        k = min(['wS', 'wM', 'wL'], key=lambda w: abs({'wS': 17, 'wM': 20.3, 'wL': 24}[w] - dia)); return k, 'tyre %.0f mm' % dia, 0
    if re.match(r'^(wheel|technic axle|car steering)', tl) and 'rim' in tl or tl.startswith('wheel rim'): return None, 'skip (rim, drawn by our wheel)', 0
    for tab, how in ((ALIAS, 'alias'), (ID2KEY, 'id')):
        if i in tab:
            s = calib(name, tab[i])[0] if tab[i] not in ('stw',) else 0
            if s <= 0.09: return tab[i], how + ' ' + i, s
            k = mesh_part(name, title, i)
            if k: return k, 'mesh (our %s looks different, %.3f)' % (tab[i], s), s
            return tab[i], how + ' ' + i + ' (looks different)', s
    m = re.match(r'^(brick|plate|tile)\s+(\d+)\s+x\s+(\d+)(\s+with groove)?(\s+without groove)?$', tl)
    if m:
        k = mesh_part(name, title, i)  # the real part (studs, tubes) beats a plain box
        if k: return k, 'mesh (real LDraw geometry)', 0
        a, b = sorted([int(m.group(2)), int(m.group(3))]); return {'brick': 'B', 'plate': 'P', 'tile': 'T'}[m.group(1)] + '%dx%d' % (a, b), 'generic', 0
    k = mesh_part(name, title, i)
    if k: return k, 'mesh (real LDraw geometry)', 0
    # closest shape among our parts with about the same size (only when the mesh is too big)
    dx, dy, dz = ld_dims(name); want = sorted([dx, dz])
    cands = [k for k, P in PARTS.items() if not P['wh'] and not k.startswith('drv') and P.get('p') and k not in PRINTS and not re.match(r'^[PBTC]\d', k)
             and abs(sorted([P['w'], P['d']])[0] - want[0]) <= 1 and abs(sorted([P['w'], P['d']])[1] - want[1]) <= 1.5 and abs(P['h'] - dy) <= 2.5]
    best = (1e9, None)
    for k in cands:
        s = calib(name, k)[0]
        if s < best[0]: best = (s, k)
    if best[1] and best[0] < 0.05: return best[1], 'shape', best[0]
    if max(dx, dz) * max(dy / 3, 0.34) < 0.35: return None, 'skip (small, no match%s)' % ('' if not best[1] else ' %s %.3f' % (best[1], best[0])), best[0]
    a, b = sorted([max(1, round(dx)), max(1, round(dz))]); hh = round(dy)
    g = ('T' if hh <= 1 and 'tile' in tl else 'P') if hh <= 1 else ('C' if hh == 2 else 'B')
    if hh > 3: g = 'B'
    return '%s%dx%d' % (g, a, b), 'box (no match%s)' % ('' if not best[1] else ', best %s %.3f' % (best[1], best[0])), best[0]
def main():
    ap = argparse.ArgumentParser(); ap.add_argument('model'); ap.add_argument('out'); ap.add_argument('--yaw', type=int, default=0)
    ap.add_argument('--only', default=''); ap.add_argument('--drop', default=''); ap.add_argument('--keep-figs', action='store_true')
    args = ap.parse_args()
    COL = ldlib.colours(); PL = ldlib.placements(args.model)
    only = [s.strip().lower() for s in args.only.split(',') if s.strip()]; drop = [s.strip().lower() for s in args.drop.split(',') if s.strip()]
    if only: PL = [p for p in PL if any(o in p[3] for o in only)]
    if drop: PL = [p for p in PL if not any(o in p[3] for o in drop)]
    Yw = Ry(args.yaw * H)
    choice, rep, bricks, warn = {}, collections.OrderedDict(), [], []
    for name, col, M, trail in PL:
        if name not in choice: choice[name] = choose(name, args)
        t, how, sc = choice[name]
        title = ldlib.part_tris(name)[1]
        r = rep.setdefault(name, {'ld': name, 'title': title, 'to': t, 'how': how, 'score': round(float(sc), 3), 'n': 0}); r['n'] += 1
        if not t: continue
        if t in WHEELS:  # our wheel: axis along x (r 0) or z (r 1); body centre = tyre centre
            Rw = A @ M[:3, :3] @ A.T; ax = Yw @ Rw @ np.array([0, 0, 1.0])  # LDraw tyre axis is its z
            tris, _ = ldlib.part_tris(name); v = tris.reshape(-1, 3); c0 = (v.min(0) + v.max(0)) / 2
            g = Yw @ (S * (A @ (M[:3, :3] @ c0 + M[:3, 3]))); rr = 0 if abs(ax[0]) >= abs(ax[2]) else 1
            if any(b.get('wheel') and np.linalg.norm(b['g'] - g) < 0.3 for b in bricks): continue  # the same wheel twice (tyre + rim/tyre assembly)
            bricks.append({'t': t, 'r': rr, 'g': g, 'col': 0, 'ld': name, 'wheel': 1, 'M': M}); continue
        s, C, d = calib_any(name, t)
        O = Yw @ A @ M[:3, :3] @ A.T @ C.T
        if abs(abs(np.linalg.det(M[:3, :3])) - 1) > 1e-3: warn.append('%s: scaled matrix' % name)
        mir = 0; O0 = O.copy(); MX = np.diag([-1.0, 1, 1])
        if np.linalg.det(O) < 0: O = MX @ O; mir = 1  # mirrored placement: Ry(r) Mx T = Mx Ry(-r) T
        (rr, x, z, qq), ang = nearest_ori(O, bool(re.search(r'round|cylinder|cone|dish', title, re.I)))
        if mir: rr = (-rr) % 4
        Rf = None
        if ang > 1:  # free rotation: the part is built upright (mirrored first when m), then turned by R about its body centre
            warn.append('%s: off the 90° grid by %.0f°, stored as a free rotation' % (name, ang)); rr = x = z = qq = 0; Rf = (O0 @ MX) if mir else O0
        g = Yw @ (-(A @ M[:3, :3] @ A.T @ C.T) @ d + S * (A @ M[:3, 3]))
        P = our(t)
        if (x or z or qq) and (P.get('k', t).startswith('T') and P.get('gen')): t2 = 'P' + t[1:]; P = generic(t2); t = t2  # generic tiles can't tip: use the plate
        bricks.append({'M': M, 'R': Rf, 't': t if not (x or z or qq) else '%s@%d%d%d' % (t, x, z, qq), 'base': t, 'r': rr, 'm': mir, 'tx': x, 'tz': z, 'tq': qq, 'g': g, 'col': col, 'ld': name})
    # colours
    for b in bricks:
        c = b['col']; h = COL.get(c, ('#888888', 255, '?')) if isinstance(c, int) else (('#' + c[3:].lower(), 255, 'direct') if str(c).startswith('0x2') else ('#888888', 255, '?'))
        b['c'] = ('~' if h[1] < 255 else '') + h[0]; b['cname'] = h[2]
    # cells: footprint of the oriented part, then one global shift so most parts sit on the stud grid
    for b in bricks:
        P = our(b['base'] if 'base' in b else b['t'])
        if b.get('wheel'): fw, fd, hh = P['w'], P['d'], P['h']
        else: fw, fd, hh = tilt_dims(P, b['tx'], b['tz'], b['tq'])
        if b['r'] % 2: fw, fd = fd, fw
        b['fw'], b['fd'], b['fh'] = fw, fd, hh
        b['c0'] = np.array([b['g'][0] / U - fw / 2, b['g'][1] / PH - hh / 2, b['g'][2] / U - fd / 2])
    def mode_frac(v, q):
        f = np.round((v % 1) * q) / q % 1; return collections.Counter(np.round(f, 3)).most_common(1)[0][0]
    c0 = np.array([b['c0'] for b in bricks if not b.get('wheel')])
    fx, fy, fz = mode_frac(c0[:, 0], 4), mode_frac(c0[:, 1], 8), mode_frac(c0[:, 2], 4)
    lo = np.array([b['c0'] for b in bricks]).min(0); hi = np.array([b['c0'] + [b['fw'], b['fh'], b['fd']] for b in bricks]).max(0)
    sh = np.array([fx + math.floor((lo[0] + hi[0]) / 2 - fx), fy + math.floor(lo[1] - fy), fz + math.floor((lo[2] + hi[2]) / 2 - fz)])
    out = []
    for b in bricks:
        c = b['c0'] - sh; i = np.round(c).astype(int); o = np.round(c - i, 3)
        e = {'t': b['t'], 'x': int(i[0]), 'z': int(i[2]), 'y': int(i[1]), 'r': int(b['r']), 'm': int(b.get('m', 0)), 'c': b['c']}
        for kk, v in zip(('ox', 'oy', 'oz'), o):
            if abs(v) > 1e-3: e[kk] = float(v)
        if b.get('R') is not None: e['R'] = [round(float(v), 4) for v in b['R'].ravel()]
        if not b.get('wheel'):
            tr, _ = ldlib.part_tris(b['ld']); v = tr.reshape(-1, 3); v = (b['M'][:3, :3] @ v.T).T + b['M'][:3, 3]; v = (Yw @ (S * (A @ v.T))).T
            e['_box'] = [round(float(q), 3) for q in np.concatenate([v.min(0) - sh[[0, 1, 2]] * [U, PH, U], v.max(0) - sh * [U, PH, U]])]
        out.append(e)
    ys = [e['y'] for e in out]
    used = sorted({b['t'].split('@')[0] for b in out if b['t'].split('@')[0] in MESH})
    res = {'model': os.path.basename(args.model), 'meshes': {k: {kk: MESH[k][kk] for kk in ('k', 'n', 'id', 'w', 'd', 'h', 'v', 'i', 's', 'tris')} for k in used}, 'bricks': out, 'n': len(out), 'parts': list(rep.values()), 'warn': warn,
           'size_studs': [round(float(hi[0] - lo[0]), 2), round(float(hi[2] - lo[2]), 2)], 'height_plates': round(float(hi[1] - lo[1]), 2)}
    json.dump(res, open(args.out + '.json', 'w'), indent=0)
    json.dump(CAL, open(CAL_F, 'w'), indent=0, sort_keys=True)
    with open(args.out + '.md', 'w') as f:
        f.write('# %s -> garage: %d LDraw parts, %d placed\n\n| LDraw part | title | n | ours | how | fit |\n|---|---|---|---|---|---|\n' % (res['model'], len(PL), len(out)))
        for r in sorted(rep.values(), key=lambda r: (r['how'].split()[0], r['ld'])):
            f.write('| %s | %s | %d | %s | %s | %s |\n' % (r['ld'], r['title'], r['n'], r['to'] or '-', r['how'], r['score'] or ''))
        if warn: f.write('\n## Warnings\n' + ''.join('- %s\n' % w for w in sorted(set(warn))))
    hw = collections.Counter(r['how'].split()[0] for r in rep.values())
    print('MESH', len(used), 'tris', sum(MESH[k]['tris'] for k in used))
    print('PLACED', len(out), 'of', len(PL), dict(hw), 'size', res['size_studs'], 'h', res['height_plates'], 'warn', len(warn))
if __name__ == '__main__': main()
