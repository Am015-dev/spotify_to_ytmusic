#!/usr/bin/env python3
"""One source of truth for "where is each game": writes games/status.json.
Shown on the shelf (version chips), games/status.html and games/asset-viewer/games.html.

Per game: version (v<N> = commits touching games/<slug>/), updated, commit, news (latest What's new headline),
paintings {wired,pushed}, models {wired,pushed}, unwired (made, not in the game), missing (still to make,
from games-src/MISSING-ASSETS.md minus files that now exist), facelift (null: FACELIFT.md has no done markers,
so open items cannot be counted without guessing).

Run: python3 games-src/scripts/game-status.py   (wiring-status.py and build-all.py --deploy call it)"""
import json, os, re, subprocess, datetime
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.chdir(ROOT)
ALIAS = {'thornbound-throne': 'thornbound'}
# words the owner pages must not show (tool names): scrubbed from every free-text field
SCRUB = re.compile(r'\b(Treblo|Suno|TRELLIS|Google Flow|Flow)\b', re.I)
def scrub(s): return re.sub(r'\(\s+', '(', re.sub(r'\s+', ' ', SCRUB.sub('', s))).strip()

def shelf_games():
    t = open('games/index.html', encoding='utf-8').read()
    out = []
    for m in re.finditer(r"\{id:'(\w+)'[^\n]*?name:'((?:[^'\\]|\\.)*)',src:'([\w-]+)/index\.html'", t):
        out.append(dict(id=m.group(1), title=re.sub(r' \(preview\)$', '', m.group(2).replace("\\'", "'")), slug=m.group(3)))
    return out

def git(*a): return subprocess.run(['git', *a], capture_output=True, text=True).stdout.strip()
def version(slug):
    n = len(git('log', '--oneline', '--', f'games/{slug}/').splitlines())
    last = git('log', '-1', '--format=%h|%cs', '--', f'games/{slug}/').split('|')
    return dict(version=f'v{n}', updated=last[1] if len(last) > 1 else '', commit=last[0])

def news(g, upd):
    keys = {g['id'], g['slug']}
    for e in upd:  # file is newest first
        if e.get('game') in keys: return dict(title=scrub(e['title']), date=e['date'])
    return None

def stems(slug):
    s = set()
    for dp, dn, fn in os.walk(f'games/{slug}'):
        for f in fn: s.add(os.path.splitext(f)[0].lower())
    return s

def missing_entries(slug):
    """Every not-ticked entry of this game in MISSING-ASSETS.md (before the exists-check), with its group heading and style block."""
    try: lines = open('games-src/MISSING-ASSETS.md', encoding='utf-8').read().split('\n')
    except OSError: return [], ''
    out, cur, ent, stop, group, style, want_style = [], None, None, False, '', '', False
    for ln in lines:
        if ln.startswith('## Made but NOT wired'): stop = True
        if stop: break
        h = re.match(r'### .*\(`games/([\w-]+)/`\)', ln)
        if h: cur, ent, group, want_style = h.group(1), None, '', False; continue
        if cur != slug: continue
        if ln.startswith('Style block'): want_style = True; continue
        if want_style and ln.strip(): style, want_style = re.sub(r'^>\s*', '', ln).strip(), False; continue
        b = re.match(r'\*\*(.+?)\*\*(?:\s*\(.*\))?\s*$', ln)
        if b and not re.match(r'\d+ to make', b.group(1)): group = re.sub(r'\s*\(.*$', '', b.group(1)).strip(); ent = None; continue
        m = re.match(r'- \[( |x)\] `([^`]+)`\s*(.*)$', ln)
        if m:
            ent = dict(done=m.group(1) == 'x', path=m.group(2), spec=m.group(3), prompt='', note='', group=group)
            out.append(ent); continue
        if ent:
            p = re.match(r'\s+- (Prompt|Note): (.*)$', ln)
            if p: ent[p.group(1).lower()] = p.group(2)
    return [e for e in out if not e['done']], style

def missing(slug, have):
    res = []
    for e in missing_entries(slug)[0]:
        files = [x.strip() for x in re.split(r' and |, ', e['path']) if x.strip()]
        base = os.path.dirname(e['path'].split(' and ')[0])
        names = [os.path.basename(f) for f in files]
        def exists(f):
            full = f if '/' in f else os.path.join(base, f)
            return os.path.exists(full) or os.path.splitext(os.path.basename(f))[0].lower() in have
        if all(exists(f) for f in files): continue
        music = any(n.lower().endswith(('.mp3', '.wav', '.ogg')) for n in names) or '/audio/' in e['path']
        desc = scrub(e['prompt'] or e['note'])
        res.append(dict(name=' + '.join(names), kind='music' if music else 'art', desc=desc[:140] + ('\u2026' if len(desc) > 140 else '')))
    return res

def nextwave_counts():
    """Items still to make per slug from games/next-wave.json (written by next-wave.py); {} if absent."""
    try: d = json.load(open('games/next-wave.json', encoding='utf-8'))
    except (OSError, ValueError): return {}
    c = {}
    for it in d.get('items', []):
        if it.get('tag'): continue          # wave 7 variety items (poses, 3D variety, art variety) are optional extras, not must-make
        c[it['slug']] = c.get(it['slug'], 0) + 1
    return c

def main():
    games = shelf_games()
    upd = json.load(open('games/updates.json', encoding='utf-8'))
    flow = json.load(open('games/asset-viewer/flow.json', encoding='utf-8'))
    pa, mo, unw = {}, {}, {}
    def slot(d, s): return d.setdefault(s, dict(wired=0, pushed=0))
    for b in flow['batches']:
        if b.get('root') != 'flow-2d': continue
        s = ALIAS.get(b['game'], b['game'])
        for i in b['items']:
            st = i.get('stage')
            if st in ('wired', 'pushed'):
                slot(pa, s)[st] += 1
                if st == 'pushed': unw.setdefault(s, []).append(i['name'])
    for m in flow['models']:
        s = ALIAS.get(m['game'], m['game'])
        if m.get('stage') in ('wired', 'pushed'):
            slot(mo, s)[m['stage']] += 1
            if m['stage'] == 'pushed': unw.setdefault(s, []).append(m['name'] + ' (3D)')
    out = []
    nw = nextwave_counts()
    for g in games:
        s = g['slug']; have = stems(s)
        e = dict(id=g['id'], slug=s, title=g['title'], **version(s), news=news(g, upd),
                 paintings=pa.get(s, dict(wired=0, pushed=0)), models=mo.get(s, dict(wired=0, pushed=0)),
                 unwired=sorted(unw.get(s, [])), missing=missing(s, have), facelift=None, nextwave=nw.get(s, 0))
        out.append(e)
    data = dict(generated=datetime.datetime.now(datetime.timezone.utc).strftime('%Y-%m-%dT%H:%MZ'), games=out)
    with open('games/status.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, separators=(',', ':'))
    print(f'status.json: {len(out)} games')
    for e in out:
        print(f"  {e['slug']:20} {e['version']:>5} {e['updated']}  paint {e['paintings']['wired']}/{e['paintings']['pushed']}  "
              f"3D {e['models']['wired']}/{e['models']['pushed']}  make {len(e['missing'])}  next-wave {e['nextwave']}  unwired {len(e['unwired'])}")

if __name__ == '__main__': main()
