#!/usr/bin/env python3
"""land-1: radius profile of a round LDraw part (trees) for a low-poly lathe in the game (src/98ld_l_land.js LDS_P).
usage: python3 tools/ld/lProfile.py 3470.dat [tol_ldu=3]   -> [[r,y],...] in LDU, y up from the part's base, Douglas-Peucker simplified."""
import sys, os, numpy as np
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import ldmesh, ldlib
def dp(P, tol):
    if len(P) < 3: return P
    a, b = np.array(P[0]), np.array(P[-1]); ab = b - a; L = np.hypot(*ab) or 1
    d = [abs(ab[0] * (p[1] - a[1]) - ab[1] * (p[0] - a[0])) / L for p in P[1:-1]]; i = int(np.argmax(d)) + 1
    return dp(P[:i + 1], tol)[:-1] + dp(P[i:], tol) if d[i - 1] > tol else [P[0], P[-1]]
part = sys.argv[1]; tol = float(sys.argv[2]) if len(sys.argv) > 2 else 3
T, _ = ldmesh._tris(part); S = ldlib.sample(T, 120000, 3); ys = -S[:, 1]; rs = np.hypot(S[:, 0], S[:, 2]); y0 = ys.min()
bins = np.arange(ys.min(), ys.max() + 1.0, 1.0); P = []
for a, b in zip(bins[:-1], bins[1:]):
    m = (ys >= a) & (ys < b)
    if m.any(): P.append([round(float(rs[m].max()), 1), round(float((a + b) / 2 - y0), 1)])
P = [[0, 0]] + P + [[0, round(float(ys.max() - y0), 1)]]
print(part, len(dp(P, tol)), [[round(r), round(y)] for r, y in dp(P, tol)])
