#!/usr/bin/env python3
"""Shows the production waves (games-src/next-wave, made by make-wave7.py) in the static asset viewer as planned batches.

Merges every wave prompt file (top-level "wave" key: flow-2d/<game>/prompts-wave<N>[-ratio].json and
flow-3d/<game>/prompts-3d-wave<X>.json) into games/asset-viewer/flow.json:
  - batches: {root, game, kind, file, wave, ratio, done 0, total, source 'next-wave', items [{name, done false, prompt, stage 'planned', flags []}]}
  - planned: one table entry per wave {name, images, eta, source 'next-wave'}; ETA = after the current queue, at flow.json "limit" images/day,
    waves in run order (Wave 7, 8, 9 ..., then the 3D waves)
Idempotent: a rerun drops its own entries (source 'next-wave') and rewrites them; other batches and the laptop's own data are untouched.
A batch is skipped when the laptop export already holds the same prompt file (the real batch wins).
Then refreshes games/status.json (planned counts per game; planned items are never must-make).

Run: python3 games-src/scripts/viewer-plan.py   (after make-wave7.py and next-wave.py)"""
import collections, datetime as dt, glob, json, os, re, subprocess, sys
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.chdir(ROOT)
P = 'games/asset-viewer/flow.json'
SRC = 'next-wave'
RATIO = {'': '1:1', '-wide': '16:9', '-43': '4:3', '-34': '3:4', '-tall': '9:16'}
TAGS = {'poses': 'poses', 'art': 'art', '3d': 'sources'}


def wave_key(w):
    return (w.startswith('3D'), re.sub(r'\d+', lambda m: m.group().zfill(3), w))


def main():
    d = json.load(open(P, encoding='utf-8'))
    d['batches'] = [b for b in d['batches'] if b.get('source') != SRC]
    d['planned'] = [p for p in d.get('planned', []) if p.get('source') != SRC]
    have = {b.get('file') for b in d['batches']}
    new, per_wave = [], collections.Counter()
    files = sorted(glob.glob('games-src/next-wave/flow-2d/*/prompts-wave*.json') + glob.glob('games-src/next-wave/flow-3d/*/prompts-3d-wave*.json'))
    for f in files:
        doc = json.load(open(f, encoding='utf-8'))
        if not doc.get('wave'): continue          # wave 6 and older files are written by next-wave.py, not planned here
        parts = f.split('/')
        root, game, fname = parts[-3], parts[-2], parts[-1]
        rel = f'{root}/{game}/{fname}'
        if rel in have: continue                  # the laptop export already has this file as a real batch
        m = re.fullmatch(r'prompts-wave\d+(-wide|-43|-34|-tall)?\.json', fname)
        ratio = RATIO[m.group(1) or ''] if m else '1:1'
        meta = doc.get('meta', {})
        tags = sorted({v.get('tag') for v in meta.values()}, key=['poses', '3d', 'art'].index)
        kind = f"{doc['wave']} {' + '.join(TAGS[t] for t in tags)}" + ('' if ratio == '1:1' else f' ({ratio})')
        items = [{'name': n, 'done': False, 'thumb': None, 'prompt': pr, 'stage': 'planned', 'flags': [], 'tag': meta.get(n, {}).get('tag', '')}
                 for n, pr in doc['cards'].items()]
        new.append({'root': root, 'game': game, 'kind': kind, 'file': rel, 'wave': doc['wave'], 'ratio': ratio, 'done': 0, 'total': len(items),
                    'source': SRC, 'items': items})
        per_wave[doc['wave']] += len(items)
    d['batches'] += new
    limit = d.get('limit') or 380
    start = max(dt.datetime.fromisoformat(d['eta']) if d.get('pending') and d.get('eta') else dt.datetime.now(dt.timezone.utc), dt.datetime.now(dt.timezone.utc))
    acc = sum(p['images'] for p in d['planned'])
    for w in sorted(per_wave, key=wave_key):
        acc += per_wave[w]
        d['planned'].append({'name': w, 'images': per_wave[w], 'eta': (start + dt.timedelta(days=acc / limit)).isoformat(), 'source': SRC})
    json.dump(d, open(P, 'w', encoding='utf-8'), separators=(',', ':'))
    print(f'{len(new)} planned batches, {sum(per_wave.values())} images in {len(per_wave)} waves:', ', '.join(f'{w} {per_wave[w]}' for w in sorted(per_wave, key=wave_key)))
    subprocess.run([sys.executable, 'games-src/scripts/game-status.py'], stdout=subprocess.DEVNULL, check=False)   # games/status.json


if __name__ == '__main__':
    main()
