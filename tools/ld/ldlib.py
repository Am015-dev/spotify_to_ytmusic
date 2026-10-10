"""LDraw reader for tools/ld2garage.py: MPD/LDR models -> part placements; part files -> triangles (LDU). Library: ld/lib/ldraw (complete.zip)."""
import os, re, numpy as np
LIB = os.environ.get('LDRAW', os.path.join(os.path.dirname(__file__), '..', '..', 'ld', 'lib', 'ldraw'))
_idx = None
def _index():
    global _idx
    if _idx is None:
        _idx = {}
        for sub in ['p/48', 'p', 'parts/s', 'parts', 'models']:  # later dirs win for plain names; s\ names keep their prefix
            d = os.path.join(LIB, sub)
            for root, _, fs in os.walk(d):
                rel = os.path.relpath(root, d).replace(os.sep, '\\')
                for f in fs:
                    k = f.lower() if rel == '.' else (rel + '\\' + f).lower()
                    if sub == 'parts/s': k = 's\\' + k
                    if sub == 'p/48': k = '48\\' + k
                    _idx.setdefault(k, os.path.join(root, f))
    return _idx
def find(name):
    n = name.strip().lower().replace('/', '\\')
    return _index().get(n)
def read_mpd(path):
    """-> (main name, {name: [lines]}) ; a plain .ldr is one file."""
    files, cur, main = {}, None, None
    for ln in open(path, encoding='utf-8', errors='replace'):
        ln = ln.rstrip('\r\n')
        m = re.match(r'^\s*0\s+FILE\s+(.+)$', ln)
        if m:
            cur = m.group(1).strip().lower(); files[cur] = []; main = main or cur; continue
        if cur is None: cur = main = os.path.basename(path).lower(); files[cur] = []
        files[cur].append(ln)
    return main, files
def _mat(t):
    x, y, z, a, b, c, d, e, f, g, h, i = map(float, t)
    M = np.eye(4); M[:3, :3] = [[a, b, c], [d, e, f], [g, h, i]]; M[:3, 3] = [x, y, z]; return M
EMB = {}  # parts embedded in an MPD (unofficial stickers, patterns): name -> lines
def is_part(lines):
    for ln in lines[:20]:
        m = re.match(r'^\s*0\s+!LDRAW_ORG\s+(\S+)', ln)
        if m: return bool(re.search(r'part|shortcut|primitive|subpart', m.group(1), re.I))
    return False
def placements(path):
    """Flatten a model: [(part name, colour code, 4x4 matrix LDU, submodel path)] for every part line (type 1 that is a library part)."""
    main, files = read_mpd(path); out = []
    for k, v in files.items():
        if k != main: EMB.setdefault(k, v)
    def walk(name, M, col, trail):
        for ln in files[name]:
            p = ln.split()
            if len(p) < 15 or p[0] != '1': continue
            c = int(p[1]) if p[1].lstrip('-').isdigit() else p[1]
            c = col if c == 16 else c
            W = M @ _mat(p[2:14]); ref = ' '.join(p[14:]).lower().replace('/', '\\')
            if ref in files and not is_part(files[ref]): walk(ref, W, c, trail + [ref])
            else: out.append((ref, c, W, '/'.join(trail)))
    walk(main, np.eye(4), 16, [main]); return out
_geo = {}
def part_tris(name):
    """Triangles (n,3,3) in part coordinates (LDU, LDraw axes) and the part title."""
    k = name.lower()
    if k in _geo: return _geo[k]
    title = [None]
    def load(n, M, depth):
        nn = n.strip().lower().replace('/', '\\'); f = find(nn)
        if nn in EMB: src = EMB[nn]
        elif f: src = open(f, encoding='utf-8', errors='replace')
        else: return []
        T = []
        for ln in src:
            p = ln.split()
            if not p: continue
            if p[0] == '0' and depth == 0 and title[0] is None and len(p) > 1 and p[1] not in ('!', 'BFC', 'Name:', 'Author:'): title[0] = ' '.join(p[1:])
            if p[0] == '1' and len(p) >= 15: T += load(' '.join(p[14:]), M @ _mat(p[2:14]), depth + 1)
            elif p[0] in ('3', '4'):
                v = np.array(list(map(float, p[2:2 + 3 * int(p[0])]))).reshape(-1, 3)
                v = (M[:3, :3] @ v.T).T + M[:3, 3]
                T.append(v[[0, 1, 2]]);
                if p[0] == '4': T.append(v[[0, 2, 3]])
        return T
    T = load(k, np.eye(4), 0)
    _geo[k] = (np.array(T).reshape(-1, 3, 3) if T else np.zeros((0, 3, 3)), title[0] or k)
    return _geo[k]
def sample(tris, n=500, seed=1):
    """Area-weighted surface points."""
    if not len(tris): return np.zeros((0, 3))
    a = np.linalg.norm(np.cross(tris[:, 1] - tris[:, 0], tris[:, 2] - tris[:, 0]), axis=1) / 2
    rng = np.random.default_rng(seed); i = rng.choice(len(tris), n, p=a / a.sum())
    u, v = rng.random(n), rng.random(n); f = u + v > 1; u[f], v[f] = 1 - u[f], 1 - v[f]
    t = tris[i]; return t[:, 0] + u[:, None] * (t[:, 1] - t[:, 0]) + v[:, None] * (t[:, 2] - t[:, 0])
def colours():
    """LDConfig: code -> (hex, alpha, name)."""
    C = {}
    for ln in open(os.path.join(LIB, 'LDConfig.ldr'), encoding='utf-8', errors='replace'):
        m = re.search(r'!COLOUR\s+(\S+)\s+CODE\s+(\d+)\s+VALUE\s+(#\w+)', ln)
        if m:
            a = re.search(r'ALPHA\s+(\d+)', ln)
            C[int(m.group(2))] = (m.group(3).lower(), int(a.group(1)) if a else 255, m.group(1))
    return C
