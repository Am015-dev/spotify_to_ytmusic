#!/usr/bin/env python3
"""facing-1: the TRUE front of an LDraw vehicle, read from its parts (not from its size). python3 tools/ld/ldfront.py <model.mpd> [more..]
Prints '<file> front <-z|+z|+x|-x> yaw <K> votes ...' where K is the ld2garage --yaw for that front (facing rule, docs/HANDOFF_veh.md:
LDraw -z -> 2, +z -> 0, +x -> 1, -x -> 3). tools/ld/vehcv.sh uses it in auto mode; the old size rule (w > d -> 3, else 2) is only the fallback
when no part gives a cue (front '?').
Cues (LDraw axes, -y up; each votes for one end of the longer axis, weight in brackets):
  steering wheel ahead of the minifig seat (3) · trans-clear / trans-yellow small lights at one end (2) and trans-red at the other (2) ·
  headlight bricks and grille tiles at one end (1) · windscreen ahead of the steering wheel (1)."""
import sys, os, re
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import ldlib
COL = None; TT = {}
def title(n):
    if n in TT: return TT[n]
    p = ldlib.find(n); t = ''
    if p:
        t = ' '.join(open(p, errors='replace').readline()[2:].split()); m = re.match(r'~Moved to\s+(\S+)', t)
        if m: t = title(m.group(1) + '.dat')
    TT[n] = t; return t
def rgb(c):
    global COL
    COL = COL or ldlib.colours(); e = COL.get(c) if isinstance(c, int) else None
    if not e: return None
    h = e[0]; return int(h[1:3], 16), int(h[3:5], 16), int(h[5:7], 16), e[1]
def front(path):
    P = ldlib.placements(path)
    pts = [(n, c, W[0, 3], W[1, 3], W[2, 3]) for n, c, W, _ in P if not re.match(r'^(3626|973|970|3815|3816|3817|3818|3819|3820|3821)', n)]  # minifig parts don't count
    if not pts: return '?', 0, 0, []
    xs = [p[2] for p in pts]; zs = [p[4] for p in pts]; X0, X1, Z0, Z1 = min(xs), max(xs), min(zs), max(zs)
    lz = Z1 - Z0 >= X1 - X0  # the long axis
    ax = (lambda p: p[4]) if lz else (lambda p: p[2]); lo, hi = (Z0, Z1) if lz else (X0, X1)
    def end(v, f=.3):
        s = (v - lo) / max(hi - lo, 1e-6); return -1 if s < f else (1 if s > 1 - f else 0)
    v, why = 0.0, []  # v > 0: front at the LOW end of the long axis
    stw = [p for p in pts if 'Steering' in title(p[0])]; seat = [p for p in pts if 'Seat' in title(p[0]) and 'Minifig' in title(p[0])]
    if stw and seat:
        s = stw[0]; q = min(seat, key=lambda q: abs(q[2] - s[2]) + abs(q[4] - s[4])); d = ax(s) - ax(q)
        if abs(d) > 4: v += 3 if d < 0 else -3; why.append('wheel-seat')
    for p in pts:
        t = title(p[0]); c = rgb(p[1]); e = end(ax(p))
        if not e: continue
        k = None
        if c and c[3] < 255 and re.match(r'^(Plate|Tile|Brick)\s+1 x [12]\b|^Plate\s+Round 1 x 1|^Tile\s+Round 1 x 1|^Brick\s+Round 1 x 1|^Slope', t):
            r, g, b = c[:3]
            if r > 150 and g < 90 and b < 90: k = ('red', -2)
            elif r > 200 and g > 180: k = ('light', 2)
        if not k and ('Headlight' in t or 'Grille' in t): k = ('grille', 1)
        if k: v += k[1] * (-e); why.append(k[0] + ('@lo' if e < 0 else '@hi'))
    ws = [p for p in pts if re.search(r'Windscreen|Windshield', title(p[0]))]
    if ws and stw:
        d = ax(ws[0]) - ax(stw[0])
        if abs(d) > 4: v += 1 if d < 0 else -1; why.append('screen')
    if v == 0: return '?', 0, lz, why
    f = ('-' if v > 0 else '+') + ('z' if lz else 'x'); return f, v, lz, why
YAW = {'-z': 2, '+z': 0, '+x': 1, '-x': 3}
if __name__ == '__main__':
    for f in sys.argv[1:]:
        fr, v, lz, why = front(f)
        print('%s front %s yaw %s votes %+.0f %s' % (os.path.basename(f), fr, YAW.get(fr, '?'), v, ' '.join(why[:10])))
