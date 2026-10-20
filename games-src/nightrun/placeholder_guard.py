#!/usr/bin/env python3
"""Guard: no placeholder picture may be listed in media/ready.json (the game draws everything in ready.json as real art).
  python3 games-src/nightrun/placeholder_guard.py            check media/ready.json and every media/**/*.webp, exit 1 when a listed file is a placeholder render
  from placeholder_guard import is_placeholder, fake_ready     used by make-placeholders.py and games-src/scripts/ingest-assets.py
A file is a placeholder when (a) its md5 equals the one stored in media/placeholders.json, or (b) its pixels equal a fresh render of the manifest entry by make-placeholders.py
(make()/glow()), or (c) it is a flat-sized picture with the generator's hatch pattern and a 'PLACEHOLDER' label (no manifest entry needed): the border box in the group colour on the dark fill."""
import ast, hashlib, json, os, sys
from PIL import Image, ImageChops
HERE = os.path.dirname(os.path.abspath(__file__)); MEDIA = os.path.normpath(os.path.join(HERE, '..', '..', 'games', 'mainhattan-nightrun', 'media'))
md5 = lambda p: hashlib.md5(open(p, 'rb').read()).hexdigest()
_gen = None
def _load_gen():
    """The generator's own make()/glow()/font()/COL, pulled out of make-placeholders.py without running its top-level work."""
    global _gen
    if _gen is None:
        src = open(os.path.join(HERE, 'make-placeholders.py')).read(); tree = ast.parse(src); keep = []
        for n in tree.body:
            if isinstance(n, (ast.Import, ast.ImportFrom, ast.FunctionDef)) and not (isinstance(n, ast.Import) and n.names[0].name == 'hashlib'): keep.append(n)
            elif isinstance(n, ast.Assign) and any(getattr(t, 'id', '') in ('COL',) for t in n.targets): keep.append(n)
        ns = {'os': os, 'json': json}; exec(compile(ast.Module(body=keep, type_ignores=[]), 'make-placeholders.py', 'exec'), ns); _gen = ns
    return _gen
def _manifest(): return {e['file']: e for e in json.load(open(os.path.join(HERE, 'assets-manifest.json')))}
def _same(a, b):
    if a.size != b.size: return False
    a, b = a.convert('RGBA'), b.convert('RGBA')
    return max(hi for _, hi in ImageChops.difference(a, b).getextrema()) <= 6   # webp re-encode noise (all four bands: getbbox would look at alpha only)
def _same_frame(a, b):
    """Same render except the label text (its font differs between machines): compare everything outside the middle band of rows, where the border and the hatching are."""
    if a.size != b.size: return False
    a, b = a.convert('RGBa').convert('RGBA'), b.convert('RGBa').convert('RGBA'); w, h = a.size; band = (int(h * .3), int(h * .72)); bad = tot = 0
    pa, pb = a.load(), b.load()
    for y in range(h):
        if band[0] <= y <= band[1]: continue
        for x in range(w):
            tot += 1; q, r = pa[x, y], pb[x, y]
            if max(abs(q[i] - r[i]) for i in range(4)) > 40: bad += 1
    return tot > 0 and bad / tot < .01
def is_placeholder(path, man=None, sig=None):
    """Return a reason string when path is a generated placeholder, else ''."""
    name = os.path.relpath(path, MEDIA).replace(os.sep, '/')
    sig = sig if sig is not None else (json.load(open(os.path.join(MEDIA, 'placeholders.json'))) if os.path.exists(os.path.join(MEDIA, 'placeholders.json')) else {})
    if sig.get(name) == md5(path): return 'md5 equals placeholders.json'
    man = man if man is not None else _manifest(); e = man.get(name)
    if e:
        try:
            im = Image.open(path); ph = _load_gen()['make'](e)
            if _same(im, ph): return 'pixels equal a fresh make-placeholders render'
            if e.get('group') != 'Effects (wave 8)' and _same_frame(im, ph): return 'hatch + border equal a make-placeholders render (label font differs)'
        except Exception as ex: return ''
    return ''
def all_media():
    for r, _, fs in os.walk(MEDIA):
        for f in fs:
            if f.endswith('.webp'): yield os.path.join(r, f)
def fake_ready(ready=None):
    ready = ready if ready is not None else json.load(open(os.path.join(MEDIA, 'ready.json'))); man = _manifest(); sig = json.load(open(os.path.join(MEDIA, 'placeholders.json')))
    out = []
    for n in ready:
        p = os.path.join(MEDIA, n)
        if os.path.exists(p):
            why = is_placeholder(p, man, sig)
            if why: out.append((n, why))
    return out
if __name__ == '__main__':
    bad = fake_ready(); man = _manifest(); sig = json.load(open(os.path.join(MEDIA, 'placeholders.json'))); ready = set(json.load(open(os.path.join(MEDIA, 'ready.json'))))
    allp = [os.path.relpath(p, MEDIA).replace(os.sep, '/') for p in all_media() if is_placeholder(p, man, sig)]
    print('media/*.webp: %d files, %d are placeholder renders, %d listed in ready.json' % (sum(1 for _ in all_media()), len(allp), len(ready)))
    for n, why in bad: print('FAKE-READY', n, '-', why)
    print('fake-ready files:', len(bad)); sys.exit(1 if bad else 0)
