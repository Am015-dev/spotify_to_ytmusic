#!/usr/bin/env python3
"""Cross-check of the patch table against two independent public implementations (facts only, no code copied).
A = a Chinese-language web project (patches.json: id, cost, time, income, cells). B = a React version (pieces.js: shape grid where 2 marks a button, buttons, time).
Both were read through a page fetch on 7 Nov 2026; neither states a licence, so only the numbers/shapes are used, re-typed here as data.
Prints the patches on which A and B agree exactly (shape up to rotate/flip, cost, time, income) and the ones where they differ."""
import json, re, sys, pathlib
D = pathlib.Path(__file__).resolve().parent
A = [  # (cost, time, income, cells)
 (2,1,0,[(0,0),(1,0)]), (1,5,1,[(0,0),(1,0),(0,1),(0,2),(0,3),(0,4),(1,4)]), (3,2,1,[(1,0),(0,1),(1,1),(0,2)]), (1,2,0,[(0,0),(2,0),(0,1),(1,1),(2,1)]),
 (2,3,0,[(0,0),(2,0),(0,1),(1,1),(2,1),(0,2),(2,2)]), (2,2,0,[(1,0),(0,1),(1,1),(2,1),(1,2)]), (2,2,0,[(0,0),(1,0),(2,0)]), (3,1,0,[(0,0),(0,1),(1,1)]),
 (6,5,2,[(0,0),(1,0),(0,1),(1,1)]), (3,4,1,[(1,0),(0,1),(1,1),(2,1),(3,1)]), (7,2,2,[(1,0),(1,1),(1,2),(0,3),(1,3),(2,3)]), (10,3,2,[(1,0),(1,1),(1,2),(0,3),(1,3)]),
 (7,4,2,[(1,0),(2,0),(0,1),(1,1),(2,1),(3,1)]), (1,4,1,[(2,0),(0,1),(1,1),(2,1),(3,1),(4,1),(2,2)]), (0,3,1,[(1,0),(0,1),(1,1),(2,1),(3,1),(1,2)]),
 (10,5,3,[(0,0),(1,0),(2,0),(3,0),(0,1),(1,1)]), (8,6,3,[(0,0),(1,0),(0,1),(1,1),(1,2),(2,2)]), (5,3,1,[(1,0),(2,0),(0,1),(1,1),(2,1),(3,1),(1,2),(2,2)]),
 (4,2,0,[(0,0),(0,1),(1,1),(0,2),(1,2),(1,3)]), (3,6,2,[(1,0),(2,0),(0,1),(1,1),(1,2),(2,2)]), (7,1,1,[(0,0),(1,0),(2,0),(3,0),(4,0)]), (4,6,2,[(0,0),(1,0),(1,1),(1,2)]),
 (3,3,1,[(0,0),(1,0),(2,0),(3,0)]), (5,4,2,[(1,0),(0,1),(1,1),(2,1),(1,2)]), (7,6,3,[(1,0),(0,1),(1,1),(0,2)]), (2,1,0,[(1,0),(1,1),(2,1),(0,2),(1,2),(1,3)]),
 (4,2,1,[(0,0),(1,0),(0,1),(0,2)]), (2,3,1,[(1,0),(2,0),(3,0),(0,1),(1,1)]), (10,4,3,[(2,0),(1,1),(2,1),(0,2),(1,2)]), (2,2,0,[(1,0),(0,1),(1,1),(0,2),(1,2)]),
 (1,3,0,[(0,0),(1,0),(1,1)]), (5,5,2,[(1,0),(1,1),(0,2),(1,2),(2,2)]), (1,2,0,[(3,0),(0,1),(1,1),(2,1),(3,1),(0,2)])]
Brows = """2 2 1 / 0 1 0 / 0 1 0|5|5
2 0 0 0 / 2 1 1 1 / 1 0 0 0|7|2
0 0 0 1 / 1 1 1 1 / 1 0 0 0|1|2
0 1 0 0 / 1 1 1 1 / 0 0 1 0|2|1
0 2 0 / 1 2 1 / 0 1 0|5|4
0 1 0 0 / 1 2 1 1 / 0 1 0 0|0|3
0 0 1 0 0 / 1 1 2 1 1 / 0 0 1 0 0|1|4
2 2 0 / 2 1 1 / 0 0 1|8|6
1 0 1 / 1 1 1 / 1 0 1|2|3
2 2 0 / 0 2 1 / 0 0 1|10|4
0 2 0 / 2 1 1 / 1 0 1|3|6
2 2 / 1 1|6|5
2 1 1 1 1|7|1
2 1 1 1|3|3
1 1 1|2|2
2 1 1 1 / 1 0 0 1|1|5
0 0 2 0 / 1 1 1 1|3|4
0 2 2 0 / 1 1 1 1|7|4
0 1 0 / 1 1 1|2|2
1 1 0 / 1 1 1|2|2
2 0 0 0 / 2 1 1 1|10|3
2 2 0 0 / 2 1 1 1|10|5
2 1 0 / 0 1 1|3|2
2 2 0 / 0 2 1|7|6
1 1 1 0 / 0 1 1 1|4|2
2 1 1 0 / 0 0 1 1|2|3
1 1 1 / 1 0 1|1|2
2 0 0 / 2 1 1|4|6
2 0 0 / 1 1 1|4|2
1 0 / 1 1|1|3
1 0 / 1 1|3|1
0 2 1 0 / 1 1 1 1 / 0 1 1 0|5|3
1 1|2|1"""
def canon(cells):
    best = None; c = list(cells)
    for f in range(2):
        for r in range(4):
            mx = min(x for x, y in c); my = min(y for x, y in c); n = tuple(sorted((x - mx, y - my) for x, y in c)); best = n if best is None or n < best else best
            c = [(-y, x) for x, y in c]
        c = [(-x, y) for x, y in c]
    return best
B = []
for line in Brows.splitlines():
    g, cost, tm = line.split('|'); cells = []; inc = 0
    for y, row in enumerate(g.split('/')):
        for x, v in enumerate(row.split()):
            if v != '0': cells.append((x, y)); inc += (v == '2')
    B.append((int(cost), int(tm), inc, cells))
ka = sorted((canon(c), co, t, i) for co, t, i, c in A); kb = sorted((canon(c), co, t, i) for co, t, i, c in B)
print('A entries', len(A), 'B entries', len(B))
sa, sb = set(ka), set(kb); both = sa & sb
print('agree exactly (shape,cost,time,income):', len(both), 'of', len(sa))
print('only in A:'); [print('  ', (k[1], k[2], k[3]), len(k[0]), 'cells', k[0]) for k in sorted(sa - sb)]
print('only in B:'); [print('  ', (k[1], k[2], k[3]), len(k[0]), 'cells', k[0]) for k in sorted(sb - sa)]
