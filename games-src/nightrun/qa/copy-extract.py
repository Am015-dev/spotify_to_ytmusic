#!/usr/bin/env python3
"""List player-visible string literals from parts/ (+head.html). Usage: copy-extract.py [--md]"""
import re, sys, glob, os
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
SINK = re.compile(r'fillText|strokeText|textContent|innerHTML|innerText|caption|banner|hint|toast|note\b|note\(|say\(|tip|title|label|msg|txt|desc|text|lines?\b|sub\b|name\b|warn|story|btn|button|\.t\s*=|\bT\(|setText|show\(', re.I)
STR = re.compile(r'''"((?:[^"\\\n]|\\.){3,})"|'((?:[^'\\\n]|\\.){3,})'|`((?:[^`\\]|\\.){3,})`''')
SKIP = re.compile(r'^(#[0-9a-f]{3,8}|rgba?\(|hsla?\(|[\w./-]+\.(png|jpg|webp|js|css|mp3|ogg|json)|https?:|data:|\d+(\.\d+)?(px|%|ms|s)?|[a-z]+-[a-z-]+|[a-zA-Z0-9_]+)$')
def files():
    for p in sorted(glob.glob(ROOT + '/parts/**/*.js', recursive=True)) + [ROOT + '/parts/head.html']:
        yield p
def main():
    out = []
    for p in files():
        rel = os.path.relpath(p, ROOT)
        try: lines = open(p, encoding='utf8', errors='replace').read().split('\n')
        except Exception: continue
        for i, ln in enumerate(lines, 1):
            s = ln.strip()
            if s.startswith('//') or s.startswith('*') or s.startswith('/*'): continue
            if not SINK.search(ln): continue
            code = re.sub(r'//.*$', '', ln) if '://' not in ln else ln
            for m in STR.finditer(code):
                t = next(g for g in m.groups() if g is not None)
                if SKIP.match(t) or not re.search(r'[A-Za-z]{3}', t): continue
                if ' ' not in t and not re.search(r'[A-Z]{3}|[äöüß]', t) and len(t) < 5: continue
                out.append((rel, i, t))
    return out
if __name__ == '__main__':
    r = main()
    for rel, i, t in r: print('%s:%d\t%s' % (rel, i, t))
    print(len(r), 'strings', file=sys.stderr)
