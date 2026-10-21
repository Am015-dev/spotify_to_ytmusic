#!/usr/bin/env python3
"""Layer scan for CONSOLIDATION-PLAN.md (read-only; prints a markdown report on stdout).

  python3 games-src/nightrun/layer-scan.py [cov.json]

(1) per part, in build order: its flags (RET.x / ?x=0 lines), top-level functions it defines that an EARLIER part already defined
    (later wins = override), globals it wraps (`const _f=f; f=function` / `X.y=(..)=>{.._old..}` patterns: DP.*, ART.*, DIR.*, spawnBoss ...)
(2) with cov.json (V8 coverage written by `COVER=<file> node fingerprint-test.js`): functions of each part never executed in the drive.
"""
import json, os, re, sys, collections
HERE = os.path.dirname(os.path.abspath(__file__)); P = os.path.join(HERE, 'parts')
order = re.findall(r"rd\(['\"]([a-z0-9]+\.js)['\"]\)", open(os.path.join(P, 'build.py'), encoding='utf8').read())
order = [o for o in dict.fromkeys(order) if o != 'sw.js']
FUN = re.compile(r"^\s*(?:async\s+)?function\s+([A-Za-z_$][\w$]*)\s*\(", re.M)
WRAP = re.compile(r"(?:const|let|var)\s+(_?[\w$]+)\s*=\s*((?:window\.)?[A-Za-z_$][\w$]*(?:\.[\w$]+)*)\s*[;,]\s*(?:window\.)?\2\s*=", re.M)   # const o=X.y; X.y=...
SAVE = re.compile(r"(?:const|let|var|,)\s*[\w$]+\s*=\s*((?:window\.)?[A-Za-z_$][\w$]*\.[\w$]+)\s*[;,]")   # o=X.y saved (then X.y re-assigned below)
IIFE = re.compile(r"\}\)\(((?:window\.)?[A-Za-z_$][\w$]*\.[\w$]+)\)")                                # X.y=(o=>...)(X.y)
FLAG = re.compile(r"RET\.([\w$]+)\s*=\s*(!?)\s*/\[\?&\]\w+=([01])/")
defs = {}; rows = []
ALL = {f: open(os.path.join(P, f), encoding='utf8').read() for f in order}
GLOB = set(n for t in ALL.values() for n in FUN.findall(t)) | set(re.findall(r"(?:window\.|const |let )([A-Z][A-Z0-9_]+)\s*=", ''.join(ALL.values())))   # top-level functions + UPPERCASE objects
for f in order:
    s = open(os.path.join(P, f), encoding='utf8').read()
    fl = sorted({m[0] + ('' if m[1] == '!' or m[2] == '0' else '!') for m in FLAG.findall(s)})   # !/[?&]x=0/ = default ON; /[?&]x=1/ = default OFF (marked !)
    over = sorted({n for n in FUN.findall(s) if n in defs and defs[n] != f})
    for n in FUN.findall(s): defs.setdefault(n, f)
    wr = {m[2] for m in WRAP.finditer(s)} | set(IIFE.findall(s))
    wr |= {m for m in SAVE.findall(s) if re.search(re.escape(m) + r"\s*=[^=]", s)}
    wr = sorted(w for w in (w.replace('window.', '') for w in wr) if re.match(r"^(?:[A-Z][A-Z0-9_]+\.[\w$]+|[a-z][\w$]*)$", w) and w.split('.')[0] in GLOB)   # globals only, not locals (e.x, this.x)
    rets = len(set(re.findall(r"RET\.([\w$]+)", s)))
    rows.append((f, len(s) // 1024, fl, over, wr, rets))
print('| part | KB | flags (! = default OFF) | re-defines earlier functions | wraps / patches | RET.x read |\n|---|---|---|---|---|---|')
for f, kb, fl, over, wr, rets in rows:
    print(f"| {f[:-3]} | {kb} | {','.join(fl) or '-'} | {', '.join(over[:8]) + (' +%d' % (len(over) - 8) if len(over) > 8 else '') or '-'} | {', '.join(wr[:6]) + (' +%d' % (len(wr) - 6) if len(wr) > 6 else '') or '-'} | {rets} |")
print(f"\nparts {len(rows)}, with a flag {sum(1 for r in rows if r[2])}, re-defining {sum(1 for r in rows if r[3])} ({sum(len(r[3]) for r in rows)} functions), wrapping {sum(1 for r in rows if r[4])} ({sum(len(r[4]) for r in rows)} targets)")
if len(sys.argv) > 1:
    cov = json.load(open(sys.argv[1]))
    src = max((e['source'] for e in cov if e.get('source')), key=len)
    spans = []
    for f in order:
        s = open(os.path.join(P, f), encoding='utf8').read(); i = src.find(s)
        if i < 0: i = src.find(s[:400])
        if i >= 0: spans.append((i, i + len(s), f))
    spans.sort()
    hit = collections.defaultdict(int); name = {}
    for e in cov:
        if e.get('source') != src: continue
        for fn in e['functions']:
            r = fn['ranges'][0]; k = (r['startOffset'], r['endOffset']); hit[k] += r['count']; name[k] = fn['functionName']
    per = collections.defaultdict(lambda: [0, 0, 0, []])   # total named, dead named, dead bytes, names
    for (a, b), c in hit.items():
        if not name[(a, b)]: continue
        f = next((x[2] for x in spans if x[0] <= a < x[1]), None)
        if not f: continue
        q = per[f]; q[0] += 1
        if c == 0: q[1] += 1; q[2] += b - a; q[3].append(name[(a, b)])
    tn = sum(v[0] for v in per.values()); td = sum(v[1] for v in per.values())
    print(f"\nCOVERAGE: {td} of {tn} named functions never ran in the drive ({100 * td // max(1, tn)}%), {sum(v[2] for v in per.values()) // 1024} KB of their bodies\n")
    print('| part | named fns | never ran | KB | examples |\n|---|---|---|---|---|')
    for f in order:
        if f in per: v = per[f]; print(f"| {f[:-3]} | {v[0]} | {v[1]} | {v[2] // 1024} | {', '.join(sorted(set(v[3]))[:6])} |")
