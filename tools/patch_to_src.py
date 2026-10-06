#!/usr/bin/env python3
"""Apply an old-style anchor patch (pXXX.py: exec(open('P.py').read()); R(old,new,n); ...; save()) to src/ modules.
Usage: python3 tools/patch_to_src.py <patch.py> [more patches...] [--dry] [--reverse] [--src DIR]
  The patch runs as with reapply.sh, but on the text assembled from src/ORDER (the split page, km.js apart);
  each changed module is written back. Every R() reports the module it landed in. Files the patch reads
  (art.js, …) resolve from the patch's own directory. --reverse swaps old/new in every R() (takes a patch out).
  Edits made outside R() (s=s[:i]+…) are re-split by finding each module's unchanged first line."""
import sys, os, re
argv = sys.argv[1:]; DRY = '--dry' in argv; REV = '--reverse' in argv
SRC = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'src')
if '--src' in argv: i = argv.index('--src'); SRC = argv[i + 1]; del argv[i:i + 2]
SRC = os.path.abspath(SRC); patches = [a for a in argv if not a.startswith('--')]
names = [l.strip() for l in open(os.path.join(SRC, 'ORDER')) if l.strip()]
def rd(f): return open(os.path.join(SRC, f), encoding='utf8', newline='').read()

def resplit(s, texts):
    """bounds for s from each module's original first line (must stay unique and in order)"""
    b = [0]
    for t in texts[1:]:
        head = t[:t.find('\n') + 1] or t
        i = s.find(head, b[-1]); j = s.find(head, i + 1) if i >= 0 else -1
        if i < 0 or j >= 0: sys.exit(f'cannot re-split: module start {head[:60]!r} {"missing" if i < 0 else "not unique"}')
        b.append(i)
    return b + [len(s)]

def apply(patch):
    texts = [rd(f) for f in names]
    bounds = [0]
    for t in texts: bounds.append(bounds[-1] + len(t))   # module k = s[bounds[k]:bounds[k+1]]
    g = {'s': ''.join(texts), '__name__': '__main__', 'F': 'overdrive.html', 'sys': sys}
    st = {'last': g['s'], 'raw': False, 'saved': False}; log = []
    def mod_at(p): return next(k for k in range(len(names)) if p < bounds[k + 1] or k == len(names) - 1)
    def R(a, b, n=1):
        if REV: a, b = b, a
        s = g['s']
        if s is not st['last']: st['raw'] = True
        c = s.count(a)
        if c != n: sys.exit(f'{os.path.basename(patch)}: COUNT {c} != {n} for: {a[:90]!r}')
        pos = []; i = s.find(a)
        while i >= 0: pos.append(i); i = s.find(a, i + len(a))
        hit = set(); d = len(b) - len(a)
        for p in reversed(pos):                        # back to front keeps earlier offsets valid
            k = mod_at(p); e = mod_at(p + max(len(a), 1) - 1)
            if e != k: print(f'  WARN anchor spans {names[k]} -> {names[e]}; the change goes to {names[k]}')
            for j in range(k + 1, len(bounds)): bounds[j] = p + len(b) if j <= e else bounds[j] + d
            hit.add(names[k])
        g['s'] = st['last'] = s.replace(a, b); log.append((a, sorted(hit)))
    def between(a, b):
        s = g['s']; i = s.index(a); j = s.index(b, i); return i, j
    def save(): st['saved'] = True
    g.update(R=R, between=between, save=save)
    code = open(patch, encoding='utf8').read()
    code = re.sub(r"^exec\(open\(['\"][^'\"]*P\.py['\"]\)\.read\(\)\)", "pass", code, flags=re.M)
    cwd = os.getcwd(); os.chdir(os.path.dirname(os.path.abspath(patch)))
    try: exec(compile(code, patch, 'exec'), g)
    finally: os.chdir(cwd)
    s = g['s']
    if st['raw'] or s is not st['last']:
        print('  NOTE edits outside R(): modules re-split by their first lines'); B = resplit(s, texts)
    else: B = bounds
    new = [s[B[k]:B[k + 1]] for k in range(len(names))]
    assert ''.join(new) == s
    if not st['saved']: print(f'  NOTE {os.path.basename(patch)} never called save(); applied anyway')
    for a, h in log: print(f'  R -> {", ".join(h)}  {a[:70]!r}')
    ch = [names[k] for k in range(len(names)) if new[k] != texts[k]]
    if not DRY:
        for k in range(len(names)):
            if new[k] != texts[k]: open(os.path.join(SRC, names[k]), 'w', encoding='utf8', newline='').write(new[k])
    print(f'PATCH_OK {os.path.basename(patch)}{" (reverse)" if REV else ""}{" (dry)" if DRY else ""}: '
          f'{len(log)} R(), changed: {", ".join(ch) or "none"}')

for p in (reversed(patches) if REV else patches): apply(p)
