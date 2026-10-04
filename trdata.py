# TR data builder: AWS Terrarium elevation tiles -> compact height grids for the game (tr_data.js).
# height = R*256 + G + B/256 - 32768 (m). Tiles are cached in tr_cache/. No PIL: tiny PNG reader (zlib + filters).
# Grids are in real metres east/north of each city origin (same equirectangular frame as the game data), Gaussian-smoothed,
# quantised to Q m, predicted (planar), zigzag + Rice coded per row, base64. Run: python3 trdata.py
import math, os, zlib, struct, json, base64, urllib.request
CACHE = 'tr_cache'; os.makedirs(CACHE, exist_ok=True)
URL = 'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png'

def png_rgb(b):
    assert b[:8] == b'\x89PNG\r\n\x1a\n'; o = 8; idat = b''; W = H = 0
    while o < len(b):
        L, = struct.unpack('>I', b[o:o+4]); t = b[o+4:o+8]; d = b[o+8:o+8+L]; o += 12+L
        if t == b'IHDR': W, H, bd, ct = struct.unpack('>IIBB', d[:10]); assert bd == 8 and ct in (2, 6); bpp = 3 if ct == 2 else 4
        elif t == b'IDAT': idat += d
        elif t == b'IEND': break
    raw = zlib.decompress(idat); st = W*bpp; out = bytearray(H*st); prev = bytearray(st); p = 0
    for y in range(H):
        f = raw[p]; line = bytearray(raw[p+1:p+1+st]); p += 1+st
        for i in range(st):
            a = line[i-bpp] if i >= bpp else 0; c = prev[i-bpp] if i >= bpp else 0; u = prev[i]
            if f == 1: line[i] = (line[i]+a) & 255
            elif f == 2: line[i] = (line[i]+u) & 255
            elif f == 3: line[i] = (line[i]+((a+u) >> 1)) & 255
            elif f == 4:
                pa = abs(u-c); pb = abs(a-c); pc = abs(a+u-2*c)
                line[i] = (line[i]+(a if pa <= pb and pa <= pc else u if pb <= pc else c)) & 255
        out[y*st:(y+1)*st] = line; prev = line
    return W, H, bpp, out

TILES = {}
def tile(z, x, y):
    k = (z, x, y)
    if k in TILES: return TILES[k]
    fn = f'{CACHE}/{z}_{x}_{y}.png'
    if not os.path.exists(fn):
        for a in range(4):
            try: open(fn, 'wb').write(urllib.request.urlopen(URL.format(z=z, x=x, y=y), timeout=60).read()); break
            except Exception as e: print('retry', k, e)
    W, H, bpp, px = png_rgb(open(fn, 'rb').read())
    h = [px[i]*256+px[i+1]+px[i+2]/256-32768 for i in range(0, len(px), bpp)]
    TILES[k] = h; return h

def elev(lat, lon, z):
    n = 2**z; fx = (lon+180)/360*n*256; s = math.sin(math.radians(lat)); fy = (.5-math.log((1+s)/(1-s))/(4*math.pi))*n*256
    fx -= .5; fy -= .5; x0 = math.floor(fx); y0 = math.floor(fy); tx = fx-x0; ty = fy-y0
    def P(px, py): t = tile(z, px >> 8, py >> 8); return t[(py & 255)*256+(px & 255)]
    return (P(x0, y0)*(1-tx)*(1-ty)+P(x0+1, y0)*tx*(1-ty)+P(x0, y0+1)*(1-tx)*ty+P(x0+1, y0+1)*tx*ty)

def blur(g, nx, nz, sig):
    if sig <= 0: return g
    r = int(math.ceil(sig*2.5)); K = [math.exp(-k*k/(2*sig*sig)) for k in range(-r, r+1)]
    def pas(src, along_x):
        o = [0.0]*len(src)
        for j in range(nz):
            for i in range(nx):
                a = w = 0.0
                for k in range(-r, r+1):
                    ii, jj = (min(nx-1, max(0, i+k)), j) if along_x else (i, min(nz-1, max(0, j+k)))
                    a += src[jj*nx+ii]*K[k+r]; w += K[k+r]
                o[j*nx+i] = a/w
        return o
    return pas(pas(g, True), False)

class Bits:
    def __init__(s): s.b = bytearray(); s.c = 0; s.n = 0
    def put(s, v, n):
        for i in range(n-1, -1, -1):
            s.c = (s.c << 1) | ((v >> i) & 1); s.n += 1
            if s.n == 8: s.b.append(s.c); s.c = 0; s.n = 0
    def done(s):
        if s.n: s.b.append(s.c << (8-s.n))
        return bytes(s.b)

def encode(v, nx, nz):
    B = Bits(); res = []
    for j in range(nz):
        row = []
        for i in range(nx):
            a = v[j*nx+i-1] if i else (v[(j-1)*nx] if j else 0); u = v[(j-1)*nx+i] if j else a; c = v[(j-1)*nx+i-1] if i and j else u
            p = a+u-c if i and j else a; r = v[j*nx+i]-p; row.append(2*r if r >= 0 else -2*r-1)
        best = None
        for k in range(8):
            L = sum((q >> k)+1+k for q in row)
            if best is None or L < best[0]: best = (L, k)
        k = best[1]; B.put(k, 3)
        for q in row:
            m = q >> k
            if m >= 24: B.put((1 << 24)-1, 24); B.put(q, 20); continue  # escape: 24 ones + raw 20 bits
            for _ in range(m): B.put(1, 1)
            B.put(0, 1); B.put(q & ((1 << k)-1), k)
    return B.done()

# m east/north per degree, same frame as the game data
def grid(name, lat0, lon0, e0, e1, n0, n1, cs, sig, Q, z):
    ky = 111320.0; kx = 111320.0*math.cos(math.radians(lat0))
    nx = int(round((e1-e0)/cs))+1; nz = int(round((n1-n0)/cs))+1
    g = [elev(lat0+(n0+j*cs)/ky, lon0+(e0+i*cs)/kx, z) for j in range(nz) for i in range(nx)]
    g = blur(g, nx, nz, sig/cs)
    base = math.floor(min(g)); v = [int(round((h-base)/Q)) for h in g]
    data = encode(v, nx, nz)
    print(f'{name}: {nx}x{nz} cs={cs} base={base} max={base+max(v)*Q:.0f}  {len(data)} B')
    return {'e0': e0, 'n0': n0, 'cs': cs, 'nx': nx, 'nz': nz, 'q': Q, 'base': base, 'b': base64.b64encode(data).decode()}

FRA = (50.1106, 8.6821); ATH = (37.97610, 23.72550); M = 400
def ath_box(R): return (min(r[0] for r in R)-M, max(r[1] for r in R)+M, min(r[2] for r in R)-M, max(r[3] for r in R)+M)
AD = {'A': [[-1350, 760, -1150, 1000]], 'B': [[760, 2700, -1350, 1250], [300, 760, 1000, 1250]], 'C': [[2700, 5300, -400, 4600]], 'D': [[5300, 8000, 3700, 8700]]}
out = {'fra': {'f': grid('fra-fine', *FRA, -3600, 3600, -2400, 3200, 20, 30, .5, 14),
               'c': grid('fra-coarse', *FRA, -17600, 17600, -12000, 15600, 160, 200, 1, 12)}}
for d, R in AD.items():
    e0, e1, n0, n1 = ath_box(R); cs = 12 if d in 'AB' else 16
    out['ath'+d] = {'f': grid('ath'+d, *ATH, e0, e1, n0, n1, cs, 9 if d in 'AB' else 12, .5, 14)}
js = 'const TR_DATA=' + json.dumps(out, separators=(',', ':')) + ';\n'
open('tr_data.js', 'w').write(js); print('tr_data.js', len(js), 'B')
