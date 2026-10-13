#!/usr/bin/env python3
"""facing-1 audit: python3 tools/ld/facing.py ld/facing_dump.json [out.md]
Reads the dump of tools/ld/tFacing.js (every LDraw ride as the garage builds it, ride frame: front of a ride = -z, a driver at r 0 faces -z) and decides
from the LDraw parts where the TRUE front is, and whether the driver figure faces it and sits behind the steering wheel.
Front cues (each votes for -z or +z along the ride's length, weight in brackets):
  steering wheel ahead of the minifig seat (3) · grille parts at one end (2) · headlight bricks / trans-clear+yellow lights at one end (2),
  trans-red lights at the other (2) · windscreen ahead of the steering wheel, else ahead of the ride's middle (1) · cab (steering wheel) ahead of the middle (1).
Cues along x are counted too: a ride whose lights/grille sit at the x ends is turned 90 degrees.
Driver: facing = the drvM brick's r (0 = -z), seat = steering wheel inside 1.2 units ahead of the figure's front and centred on it."""
import json, sys, os, re
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'); U = 0.6; LIB = os.path.join(ROOT, 'ld', 'lib', 'ldraw', 'parts')
TT = {}
def title(i):
    if not i: return ''
    i = str(i).lower()
    if i in TT: return TT[i]
    t = ''
    for c in (i, i + 'a', i + 'b', i + 'c01', i + 'a.dat'):
        p = os.path.join(LIB, c + ('' if c.endswith('.dat') else '.dat'))
        if os.path.exists(p):
            l = open(p, errors='replace').readline()[2:].strip(); m = re.match(r'~Moved to\s+(\S+)', l)
            t = title(m.group(1)) if m else l; break
    TT[i] = t; return t
def hexc(c):
    c = str(c).split('/')[0]; g = c[0] in '~*'; c = c.lstrip('~*').lstrip('#')
    try: return g, int(c[0:2], 16), int(c[2:4], 16), int(c[4:6], 16)
    except Exception: return g, 0, 0, 0
def cen(b): x0, y0, z0, x1, y1, z1 = b['box']; return (x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2
# rides where the part cues are weak or wrong (racers' rear vents, structural headlight bricks, no lights at all): verdict from the g_34 garage shot
# (facing-1, 2026-10-13: front = right in g_34). 'OK' after the fix for the 5 turned rides is measured, not listed here.
VIS = {k: 'OK' for k in ['t_v1517_1', 't_v20011_1', 't_v3056_1', 't_v604_1', 't_v606_1', 't_v625_1', 't_v6470_1', 't_v6484_1b', 't_v6503_1', 't_v6509_1',
       't_v6512_1', 't_v6526_1', 't_v6600_1', 't_v6602_1', 't_v6605_1', 't_v6609_1', 't_v75878_1', 't_v75892_1', 't_v7612_1', 't_v7630_1', 't_v8121_1']}
def audit(id, R):
    B = [b for b in R['B'] if b.get('box')]
    body = [b for b in B if b['t'] not in ('drvM',)]
    if not body: return None
    X0 = min(b['box'][0] for b in body); X1 = max(b['box'][3] for b in body); Z0 = min(b['box'][2] for b in body); Z1 = max(b['box'][5] for b in body)
    L, W = Z1 - Z0, X1 - X0; zm, xm = (Z0 + Z1) / 2, (X0 + X1) / 2
    vz, vx, why = 0.0, 0.0, []
    def end(v, lo, hi, f=.3):  # -1 = near the low end, +1 = near the high end, 0 = middle
        s = (v - lo) / max(hi - lo, 1e-6); return -1 if s < f else (1 if s > 1 - f else 0)
    stw = [b for b in B if b['t'].split('@')[0] == 'stw' or 'Steering' in title(b['id'])]
    seat = [b for b in B if 'Seat' in title(b['id'])]
    if stw and seat:
        s = stw[0]; q = min(seat, key=lambda q: abs(cen(q)[0] - cen(s)[0]) + abs(cen(q)[2] - cen(s)[2])); dz = cen(s)[2] - cen(q)[2]; dx = cen(s)[0] - cen(q)[0]
        if abs(dz) > abs(dx) and abs(dz) > .1: vz += 3 * (1 if dz < 0 else -1); why.append('wheel%sseat' % ('<' if dz < 0 else '>'))
        elif abs(dx) > .1: vx += 3; why.append('wheel-seat on x')
    # the tilted steering stand 'stw@100' keeps the LDraw part's turn: r 2 = wheel facing a -z driver (front -z), r 0 = reversed (checked on 10 shots)
    for b in stw:
        if b['t'] == 'stw@100' and b['r'] in (0, 2): vz += 6 if b['r'] == 2 else -6; why.append('stand r%d' % b['r'])
    for b in B:
        t = title(b['id']); g, r, gg, bb = hexc(b['c']); x, y, z = cen(b); e = end(z, Z0, Z1); ex = end(x, X0, X1, .2)
        small = (b['box'][3] - b['box'][0]) < 1.3 and (b['box'][5] - b['box'][2]) < 1.3
        k = None
        if 'Grille' in t or 'Headlight' in t: k = ('grille' if 'Grille' in t else 'headlamp', 1, 1)  # also used as structure (racers' side pods, rear vents)
        elif g and small and r > 150 and gg < 90 and bb < 90: k = ('redlight', 2, -1)
        elif g and small and r > 200 and gg > 180: k = ('light', 2, 1)
        if not k: continue
        if e and not (ex and abs(x - xm) > .45 * W and W > L * .9): vz += k[1] * k[2] * (-e); why.append('%s@%s' % (k[0], '-z' if e < 0 else '+z'))
        elif ex and W > 0 and not e: vx += k[1]; why.append('%s@x' % k[0])
    ws = [b for b in B if 'Windscreen' in title(b['id']) or 'Windshield' in title(b['id'])]
    for w in ws[:2]:
        ref = cen(stw[0])[2] if stw else zm; d = cen(w)[2] - ref
        if abs(d) > .2: vz += (1 if d < 0 else -1); why.append('screen%s' % ('<' if d < 0 else '>'))
    if stw:
        d = cen(stw[0])[2] - zm
        if abs(d) > .15 * L: vz += (1 if d < 0 else -1); why.append('cab%s' % ('-z' if d < 0 else '+z'))
    front = 'OK' if vz > 0 else ('BACK' if vz < 0 else '?')
    if vx > abs(vz): front = 'SIDE'
    if id in VIS and VIS[id] != front: why.insert(0, 'shot:' + VIS[id]); front = VIS[id]
    drv = [b for b in R['B'] if b['t'] == 'drvM']
    df, ds = 'none', 'none'
    if drv and drv[0]['y'] > -90:
        d = drv[0]; fdir = -1 if d['r'] == 0 else (1 if d['r'] == 2 else 0)  # the figure looks along -z at r 0
        tdir = -1 if front in ('OK', '?') else (1 if front == 'BACK' else 0)
        df = 'OK' if fdir == tdir else ('SIDE' if not fdir else 'BACK')
        if stw:  # 2x2 cell, U 0.6: the figure spans z*U-0.09 .. z*U+1.26 at r 0 (knees/hands at the low end), mirrored at r 2
            s = cen(stw[0]); fx = d['x'] * U + .6; fz = d['z'] * U - .09 if d['r'] == 0 else d['z'] * U + 1.29
            ahead = (fz - s[2]) if d['r'] == 0 else (s[2] - fz)
            ds = 'OK' if abs(s[0] - fx) < .7 and -.5 < ahead < .7 else 'NO'
    return dict(id=id, n=R['n'], ref=R['ref'], front=front, vz=round(vz, 1), vx=round(vx, 1), L=round(L, 2), W=round(W, 2), drv=df, seat=ds, why=' '.join(why[:9]),
                stw=len(stw), stwr=(stw[0]['r'] if stw else None))
if __name__ == '__main__':
    D = json.load(open(sys.argv[1])); rows = [a for a in (audit(k, D[k]) for k in sorted(D) if D[k].get('B')) if a]
    hdr = '| id | ride | front OK? | driver facing OK? | driver in seat? | votes z/x | cues |\n|---|---|---|---|---|---|---|\n'
    md = hdr + ''.join('| %s | %s | %s | %s | %s | %s/%s | %s |\n' % (a['id'], a['n'], a['front'], a['drv'], a['seat'], a['vz'], a['vx'], a['why']) for a in rows)
    from collections import Counter
    md += '\nfront: %s · driver facing: %s · driver in seat: %s\n' % (dict(Counter(a['front'] for a in rows)), dict(Counter(a['drv'] for a in rows)), dict(Counter(a['seat'] for a in rows)))
    if len(sys.argv) > 2: open(sys.argv[2], 'w').write(md)
    print(md); json.dump(rows, open(os.path.splitext(sys.argv[1])[0] + '_audit.json', 'w'), indent=0)
