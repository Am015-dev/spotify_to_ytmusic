"""Shared scan of what the live games load (used by wiring-status.py, inbox-report.py and ingest-assets.py)."""
import json, os, re
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.chdir(ROOT)
H = {}
def text(g):
    g = 'thornbound' if g == 'thornbound-throne' else g
    if g not in H:
        t = ''
        for dp, dn, fn in os.walk(f'games/{g}'):
            if '/cards' in dp or '/media' in dp or '/models' in dp or '/music' in dp: continue
            for x in fn:
                if x.endswith(('.html', '.js', '.css', '.json')): t += open(os.path.join(dp, x), errors='ignore').read()
        H[g] = t
    return H[g]
PFX = {}
# files wired through names built in code that the scan cannot see: games-src/wiring-manual.json {game: [names]}
MANUAL = json.load(open('games-src/wiring-manual.json')) if os.path.exists('games-src/wiring-manual.json') else {}
def prefixes(g):
    # file names built in code: 'media/pc-'+id, `media/pc-${id}.webp`, MEDIA+'camp-'+k ...
    if g not in PFX:
        t = text(g)
        PFX[g] = set(re.findall(r"(?:media|models)/([a-z0-9_.-]+?)(?:\$\{|['\"`]\s*\+)", t))
    return PFX[g]
def wired(g, n, ext):
    t = text(g)
    if f'{n}.{ext}' in t or f'{n}-c.{ext}' in t or f'{n}-k.{ext}' in t: return True   # -c = cropped 9-slice copy, -k = keyed copy (crop-kit.py)
    if n in MANUAL.get(g, ()): return True
    if any(n.startswith(x) and len(x) >= 3 for x in prefixes(g)): return True
    return ext == 'webp' and 'media/' in t and bool(re.search(r"['\"`/]" + re.escape(n) + r"['\"`]", t))

SLUG = {'thornbound-throne': 'thornbound'}
def refs(g, stem, ext='webp'):
    """True if the game code names this file (exact name, built name prefix, or manual list)."""
    return wired(g, stem, ext)
def ref_context(g, stem):
    """How the code uses the name when it is missing on disk: 'img' = plain <img>/src (broken icon if missing and no onerror nearby),
    'css' = url() (blank), 'safe' = near an onerror handler or in a preloader list, '' = not found."""
    t = text(g); m = re.search(re.escape(stem) + r'(?:-c|-k)?\.webp', t)
    if not m: return ''
    w = t[max(0, m.start() - 260): m.end() + 260]
    if 'onerror' in w: return 'safe'
    if re.search(r"url\(\s*['\"]?[^)]{0,80}" + re.escape(stem), w): return 'css'
    if re.search(r"""\bsrc\s*[=:]|<img""", w): return 'img'
    return 'safe' if ('new Image' in t and 'onerror' in t) else 'img'
