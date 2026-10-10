"""LDraw part -> compact mesh for a new garage part (parts our catalogue lacks).
Keeps the outer surface only (top + 4 sides visible; hollow undersides, tubes and inner walls dropped), low-res primitives (p/8),
studs replaced by stud positions (the game draws its own studs), crease normals (35°), vertices on a ½ LDU grid.
Frame of the result = our piece frame: game units, x/z centred on the part box, y = 0 at the bottom, LDraw axes mapped (x, -y, -z)."""
import os, re, math, base64, numpy as np
import ldlib
STUD = re.compile(r'^(stud|stud2|stud2a|studa|stud10|stud6|stud6a|stud15|stud-logo\d?|stud2-logo\d?|studp01|studel)\.dat$')
UNDER = re.compile(r'^(stud3|stud3a|stud4|stud4a|stud4o|stud4s|stud4s2|stud4h|stud4od|stud4oda|stud4f\w+|stud12|stud13|stud16|stud18a|stud19|stud21a|stud22a|stud8|stud8a|stud7|stud7a)\.dat$')
def _tris(name):
    T, ST = [], []
    def load(n, M, inv):
        b = os.path.basename(n.replace('\\', '/')).lower()
        if STUD.match(b):
            ST.append((M[:3, 3].copy(), -M[:3, 1] / np.linalg.norm(M[:3, 1]))); return
        if UNDER.match(b): return
        nn = n.strip().lower().replace('/', '\\')
        f = None
        if '\\' not in nn: f = ldlib.find('8\\' + nn)  # low-res primitive when there is one
        f = f or ldlib.find(nn)
        src = ldlib.EMB.get(nn) or (open(f, encoding='utf-8', errors='replace') if f else [])
        for ln in src:
            p = ln.split()
            if not p: continue
            if p[0] == '1' and len(p) >= 15: load(' '.join(p[14:]), M @ ldlib._mat(p[2:14]), inv)
            elif p[0] in ('3', '4'):
                v = np.array(list(map(float, p[2:2 + 3 * int(p[0])]))).reshape(-1, 3); v = (M[:3, :3] @ v.T).T + M[:3, 3]
                T.append(v[[0, 1, 2]])
                if p[0] == '4': T.append(v[[0, 2, 3]])
    load(name, np.eye(4), False)
    return (np.array(T).reshape(-1, 3, 3) if T else np.zeros((0, 3, 3))), ST
VIEW = [(1, -1), (0, 1), (0, -1), (2, 1), (2, -1)]  # LDraw axes: top (-y) and the 4 sides
def outer(T, G=2.0):
    """(indices of triangles visible from the top or a side, the outward direction each was seen from) (LDU, LDraw axes)."""
    if not len(T): return np.zeros(0, int), np.zeros((0, 3))
    P = ldlib.sample(T, max(4000, len(T) * 12), 3)
    tri_pts = np.concatenate([T.mean(1)[:, None], T, (T + T.mean(1)[:, None]) / 2], 1)  # centroid, corners, half-way points
    lo, hi = P.min(0) - 1, P.max(0) + 1; n = np.ceil((hi - lo) / G).astype(int) + 2
    fn = np.cross(T[:, 1] - T[:, 0], T[:, 2] - T[:, 0]); fn /= np.linalg.norm(fn, axis=1)[:, None] + 1e-12
    best = np.zeros(len(T)); dirn = np.zeros((len(T), 3))
    for ax, sg in VIEW:
        u, v = [i for i in range(3) if i != ax]
        m = np.full((n[u], n[v]), -np.inf); np.maximum.at(m, (((P[:, u] - lo[u]) / G).astype(int), ((P[:, v] - lo[v]) / G).astype(int)), sg * P[:, ax])
        md = m.copy()
        for du in (-1, 0, 1):
            for dv in (-1, 0, 1): md = np.maximum(md, np.roll(np.roll(m, du, 0), dv, 1))
        q = tri_pts.reshape(-1, 3); iu = np.clip(((q[:, u] - lo[u]) / G).astype(int), 0, n[u] - 1); iv = np.clip(((q[:, v] - lo[v]) / G).astype(int), 0, n[v] - 1)
        vis = (sg * q[:, ax] >= md[iu, iv] - 1.6).reshape(len(T), -1).any(1)
        d = np.zeros(3); d[ax] = sg; w = np.abs(fn @ d) + 0.05
        upd = vis & (w > best); best[upd] = w[upd]; dirn[upd] = d
    k = np.nonzero(best > 0)[0]; return k, dirn[k]
def crease_normals(T, ang=35):
    fn = np.cross(T[:, 1] - T[:, 0], T[:, 2] - T[:, 0]); ln = np.linalg.norm(fn, axis=1); ok = ln > 1e-9; T, fn = T[ok], fn[ok] / ln[ok, None]
    key = np.round(T.reshape(-1, 3) * 2).astype(int); buckets = {}
    for i, k in enumerate(map(tuple, key)): buckets.setdefault(k, []).append(i // 3)
    c = math.cos(math.radians(ang)); N = np.zeros((len(T) * 3, 3))
    for i, k in enumerate(map(tuple, key)):
        f = i // 3; acc = np.zeros(3)
        for g in buckets[k]:
            if fn[g] @ fn[f] >= c: acc += fn[g]
        N[i] = acc / (np.linalg.norm(acc) or 1)
    return T, N
def mesh(name, S=0.03, keep=0.45, min_tris=160):
    T, ST = _tris(name)
    if not len(T): return None
    Tall = T; k, D = outer(T); T = T[k]
    if os.environ.get('LD_ALL') == '1': T = Tall.copy(); D = np.zeros((len(T), 3))  # land-1 organic parts (trees): keep every face, drawn double-sided
    fn = np.cross(T[:, 1] - T[:, 0], T[:, 2] - T[:, 0]); flip = (fn * D).sum(1) < 0; T[flip] = T[flip][:, [0, 2, 1]]  # face the viewer that saw it
    A = np.diag([1.0, -1.0, -1.0]); V = (T.reshape(-1, 3) @ A.T) * S  # det(A) = 1: winding kept
    Va = (Tall.reshape(-1, 3) @ A.T) * S; lo, hi = Va.min(0), Va.max(0); sp = [(p @ A.T) * S for p, _ in ST]  # frame = the whole part, not just what is kept
    if sp: lo = np.minimum(lo, np.min(sp, 0)); hi = np.maximum(hi, np.max(sp, 0))
    c = np.array([(lo[0] + hi[0]) / 2, lo[1], (lo[2] + hi[2]) / 2]); V = V - c
    # weld on the ½ LDU grid, drop degenerate triangles, then quadric simplification for big parts
    q = np.round(V / (S / 2)).astype(np.int32); uq, inv = np.unique(q, axis=0, return_inverse=True); F = inv.reshape(-1, 3)
    F = F[(F[:, 0] != F[:, 1]) & (F[:, 1] != F[:, 2]) & (F[:, 0] != F[:, 2])]
    if len(F) > min_tris:
        import pyfqmr
        ms = pyfqmr.Simplify(); ms.setMesh(uq.astype(np.float64), F.astype(np.int32))
        ms.simplify_mesh(target_count=max(min_tris, int(len(F) * keep)), aggressiveness=int(os.environ.get("LD_AGG", 5)), preserve_border=os.environ.get("LD_BORDER", "1") == "1", verbose=False)
        vv, ff, _ = ms.getMesh(); uq = np.round(vv).astype(np.int32); F = ff.astype(np.int32)
        used = np.unique(F); remap = -np.ones(len(uq), int); remap[used] = np.arange(len(used)); uq = uq[used]; F = remap[F]
    pos = uq.astype(np.int16)
    studs = [((p @ A.T) * S - c, d @ A.T) for p, d in ST]
    U, PH = 20 * S, 8 * S
    st = []
    for p, d in studs:  # up (0); side studs: 1 -x, 2 +x, 3 -z, 4 +z; others dropped
        kk = int(np.argmax(np.abs(d))); sgn = d[kk] > 0
        kind = {(1, True): 0, (0, False): 1, (0, True): 2, (2, False): 3, (2, True): 4}.get((kk, bool(sgn)))
        if kind is None: continue
        st.append([round(float(p[0]) / (S / 2)), round(float(p[1]) / (S / 2)), round(float(p[2]) / (S / 2)), kind])
    dims = hi - lo
    w = max(1, round(dims[0] / U)); dd = max(1, round(dims[2] / U))
    hb = dims[1]  # studs are not in the mesh: this is the body height
    h = max(1, round(hb / PH))
    b64 = lambda a: base64.b64encode(a.tobytes()).decode()
    return {'tris': len(F), 'nv': len(pos), 'w': w, 'd': dd, 'h': h, 'v': b64(pos), 'i': b64(F.astype(np.uint16)), 's': st,
            'bytes': pos.nbytes + 2 * F.size, 'c': [float(x) for x in c], 'size': [round(float(x), 3) for x in dims]}
