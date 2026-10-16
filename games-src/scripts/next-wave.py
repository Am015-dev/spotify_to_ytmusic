#!/usr/bin/env python3
"""Next wave: ONE consolidated list of everything still to make (paintings, music, video, 3D source paintings), with
ready-to-paste prompts. Rerunnable; run it after look-check and after wiring-status.

Sources, deduped by game + file stem:
  1. games-src/MISSING-ASSETS.md   per-game items; dropped when the target file now exists under games/<slug>/
                                   (same rule as game-status.py: path exists or same file stem anywhere in the game folder)
                                   or under games-src/audio/ (music).
  2. games-src/FACELIFT.md         elements still plain CSS; dropped when made (a finished card in games/asset-viewer/flow.json),
                                   on disk, replaced by an approved 3D twin, or already named in the game code. The 3D tables
                                   give the 3D candidates (source painting to make); dropped when the GLB exists.
  3. games/look/needs-art.json     from the look-check reviewer (game, element, target_px, ratio, transparent, screen, crop).
                                   Optional: a missing file just means no look-check items yet.

  4. games-src/next-wave/flow-2d|flow-3d/<slug>/prompts-wave7-*.json   (made by make-wave7.py): pose sets, 3D variety and art variety, each card
                                   with a "meta" block. They show on the page grouped by game with the tags Poses, 3D variety, Art variety
                                   and are NOT rewritten into the wave6 files, NOT counted in games/status.json and NOT listed in NEXT-WAVE.md.

Writes
  games-src/next-wave/flow-2d/<slug>/prompts-wave6[-wide|-43|-34|-tall].json   laptop prompt files ({"cards": {name: prompt}},
        same schema and folder layout as game-assets/flow-2d; copy the next-wave/flow-2d and flow-3d folders into game-assets)
  games-src/next-wave/flow-3d/<slug>/prompts-wave6.json                        3D source paintings (3/4 view on light grey)
  games-src/next-wave/music/<slug>/cues-wave6.json                              music and sound cues (2 versions a and b)
  games-src/NEXT-WAVE.md, games/next-wave.html, games/next-wave.json
and refreshes games/status.json (per-game "nextwave" count) through game-status.py.

Run: python3 games-src/scripts/next-wave.py"""
import json, os, re, sys, fnmatch, subprocess, importlib.util, collections, datetime

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.chdir(ROOT)
spec = importlib.util.spec_from_file_location('game_status', 'games-src/scripts/game-status.py')
GS = importlib.util.module_from_spec(spec); spec.loader.exec_module(GS)

WAVE = 'wave6'
ALIAS = {'thornbound-throne': 'thornbound'}
# words the owner pages must not show (tool names)
HIDE = re.compile(r'\b(Treblo|Suno|TRELLIS|ComfyUI|Meshy|Tripo|Rodin|Google Flow|Flow|Hunyuan3D-2)\b')
def hide(s):
    s = re.sub(r'\bFlow (?=refused|drew)', 'the picture tool ', s or '')
    s = HIDE.sub('', s)
    return re.sub(r'\(\s+', '(', re.sub(r'[ \t]{2,}', ' ', s)).replace(' ,', ',').strip()

# Items checked against the live game code on 13 Oct 2026 and found stale: the plan names a thing the game does not have.
# key = (slug, stem); value = reason. Add a line here instead of deleting a source line.
_ST_TH = 'game uses emblem-clans/gathering/nobility/uprising (all painted and in media/)'
_ST_SW = 'the game has 5 terrains (plains, mountains, river, hills, beach), all painted'
STALE = {('thornbound', f'emblem-{k}'): _ST_TH for k in ('heath', 'gilded', 'lantern', 'choir')}
STALE.update({('nebula-aces', f'na-{k}'): 'the game has 2 chassis (lancer, talon), both already 3D' for k in ('dart', 'wedge', 'hammer')})
STALE.update({('shipwreck-isle', f'hex-{k}'): _ST_SW for k in ('jungle', 'rock', 'marsh', 'ruins')})

def read(p):
    try: return open(p, encoding='utf-8').read()
    except OSError: return ''

# ---------------------------------------------------------------- what already exists
FLOW = json.load(open('games/asset-viewer/flow.json', encoding='utf-8'))
def gk(g): return ALIAS.get(g, g)
MADE = collections.defaultdict(set)      # slug -> names of finished cards
KIT_DONE = {}                            # slug -> kit batch complete
for b in FLOW['batches']:
    for i in b['items']:
        if i.get('done'): MADE[gk(b['game'])].add(i['name'])
    if b.get('kind') == 'Wave 4 kit': KIT_DONE[gk(b['game'])] = b['done'] >= b['total'] > 0
MODELS = collections.defaultdict(set)    # slug -> approved GLB names (flow.json models + files on disk)
for m in FLOW['models']: MODELS[gk(m['game'])].add(m['name'])
CROSSED = collections.defaultdict(set)   # slug -> 2D names replaced by an approved 3D twin
for c in FLOW['crossed']:
    if c['twin'] in MODELS[gk(c['game'])]: CROSSED[gk(c['game'])].add(c['name'])

def disk_stems(slug):
    s = set(GS.stems(slug))
    md = f'games/{slug}/models'
    if os.path.isdir(md):
        for f in os.listdir(md):
            if f.endswith('.glb'): MODELS[slug].add(re.sub(r'(-lite)?\.glb$', '', f))
    return s

CODE = {}
def code(slug):
    if slug not in CODE:
        t = ''
        d = f'games/{slug}'
        if os.path.isdir(d):
            for f in sorted(os.listdir(d)):
                if f.endswith(('.html', '.js', '.json')) and not f.startswith('.'):
                    t += read(os.path.join(d, f))
        CODE[slug] = t
    return CODE[slug]

def covered(slug, stem, have, why):
    """True when this file stem needs no new picture; why gets the reason."""
    if '*' in stem or '?' in stem:
        if any(fnmatch.fnmatch(n, stem) for n in MADE[slug] | have): why.append('pattern already made'); return True
        return False
    if re.search(r'(^|-)(id|k)$', stem) or stem in ('icon set', 'icon-set'):
        pre = re.sub(r'(^|-)(id|k)$', '', stem)
        if stem.startswith('icon'): return KIT_DONE.get(slug, False)
        if any(n.startswith(pre + '-') for n in MADE[slug] | have): why.append('family already made'); return True
        return False
    if stem in MADE[slug]: why.append('made (finished card)'); return True
    if stem.lower() in have: why.append('file exists'); return True
    if stem in CROSSED[slug]: why.append('replaced by approved 3D model'); return True
    if re.search(r'(["\'/`])' + re.escape(stem) + r'(\.webp|\.png|\.jpg|["\'`])', code(slug)): why.append('named in game code'); return True
    return False

# ---------------------------------------------------------------- helpers
def expand(s):
    m = re.search(r'\{([^{}]*)\}', s)
    if not m: return [s]
    inner = m.group(1)
    r = re.fullmatch(r'(\d+)\.\.(\d+)', inner)
    if r: opts = [str(i) for i in range(int(r[1]), int(r[2]) + 1)]
    else:
        r = re.fullmatch(r'([a-z])\.\.([a-z])', inner)
        opts = [chr(c) for c in range(ord(r[1]), ord(r[2]) + 1)] if r else [o for o in inner.split(',') if o.strip() not in ('...', '')]
    out = []
    for o in opts: out += expand(s[:m.start()] + o.strip() + s[m.end():])
    return out

def split_top(s, seps=(', ', ' and ', ' + ')):
    parts, depth, cur, i = [], 0, '', 0
    while i < len(s):
        ch = s[i]
        if ch in '{(': depth += 1
        if ch in '})': depth -= 1
        hit = next((sp for sp in seps if depth == 0 and s.startswith(sp, i)), None)
        if hit: parts.append(cur); cur = ''; i += len(hit); continue
        cur += ch; i += 1
    parts.append(cur)
    return [p.strip() for p in parts if p.strip()]

def files_of(raw):
    raw = re.sub(r'\s*\([^)]*\)', '', raw)
    out, base = [], ''
    for part in split_top(raw):
        if '/' in part: base = part.rsplit('/', 1)[0] + '/'
        elif base: part = base + part
        out += expand(part)
    return out

NEAR = {'1:1': 1.0, '16:9': 16 / 9, '4:3': 4 / 3, '3:4': 3 / 4, '9:16': 9 / 16}
def near_ratio(w, h):
    r = w / h
    return min(NEAR, key=lambda k: abs(NEAR[k] - r))
def exact_ratio(w, h):
    from math import gcd
    g = gcd(w, h); a, b = w // g, h // g
    return f'{a}:{b}' if max(a, b) <= 20 else '~' + near_ratio(w, h)
def flow_ratio(r):
    if r in NEAR: return r
    m = re.match(r'~?(\d+):(\d+)', r or '')
    return near_ratio(int(m[1]), int(m[2])) if m else '1:1'
def suffix(r): return {'1:1': '', '16:9': '-wide', '4:3': '-43', '3:4': '-34', '9:16': '-tall'}[r]
def join_style(style, pr):
    if not style: return pr
    return style + ('' if style.endswith(('.', '!')) else '.') + ' ' + pr
def slugify(s): return re.sub(r'-+', '-', re.sub(r'[^a-z0-9]+', '-', s.lower())).strip('-')

# ---------------------------------------------------------------- source 1: MISSING-ASSETS
def from_missing(slug, title, have):
    ents, style = GS.missing_entries(slug)
    items = []
    for e in ents:
        files = [x.strip() for x in re.split(r' and |, ', e['path']) if x.strip()]
        base = os.path.dirname(e['path'].split(' and ')[0])
        files = [f if '/' in f else os.path.join(base, f) for f in files]
        def exists(f):
            return os.path.exists(f) or os.path.splitext(os.path.basename(f))[0].lower() in have
        left = [f for f in files if not exists(f)]
        if not left: continue
        spec = e['spec']
        low = e['path'].lower()
        kind = 'music' if low.endswith(('.mp3', '.wav', '.ogg')) or '/audio/' in low else 'video' if low.endswith(('.mp4', '.webm')) else 'art'
        prompt = e['prompt'] or e['note']
        if kind == 'music':
            stem = re.sub(r'-[ab]$', '', os.path.splitext(os.path.basename(left[0]))[0])
            sec = re.search(r'(\d+)\s*s\b|(\d+)\s*min', spec)
            items.append(dict(slug=slug, game=title, kind='music', stem=stem, element=e['group'] or 'Music', files=[os.path.basename(f) for f in left],
                              save_as=' + '.join(os.path.basename(f) for f in left), repo_target=left[0], size=spec.strip('() '), ratio='', transparent=False,
                              prompt=prompt, style='', why='Missing: music cue', source='missing', priority=3, note=e['note'], crop=''))
            continue
        for f in left:
            stem = os.path.splitext(os.path.basename(f))[0]
            sz = re.search(r'target\s+(\d+)x(\d+)', spec) or re.search(r'(\d+)x(\d+)', spec)
            r = re.search(r'\b(\d+:\d+)\b', spec)
            w, h = (int(sz[1]), int(sz[2])) if sz else (0, 0)
            ratio = r[1] if r else (exact_ratio(w, h) if w else '1:1')
            on_black = 'light on black' in prompt
            transp = bool(re.search(r'transparent|cut-?out|plain white', spec + ' ' + prompt)) and not on_black
            items.append(dict(slug=slug, game=title, kind=kind, stem=stem, element=e['group'] or stem, files=[os.path.basename(f)], save_as=os.path.basename(f),
                              repo_target=f, size=f'{w}x{h}' if w else '', ratio=ratio, transparent=transp, prompt=prompt, style=style,
                              why='Missing: ' + ('boss clip' if kind == 'video' else 'picture not yet made'), source='missing', priority=3,
                              note=(e['note'] + (' Light on a black background (added on screen).' if on_black else '')).strip(), crop=''))
    return items

# ---------------------------------------------------------------- source 2: FACELIFT
def facelift_parse():
    t = read('games-src/FACELIFT.md').split('\n')
    games, slug, el, tri = {}, None, None, False
    for i, l in enumerate(t):
        h = re.match(r'## .*\(`games/([\w-]+)/`\)', l)
        if h: slug = h[1]; games[slug] = dict(style='', els=[], tri=[]); el = None; tri = False; continue
        if not slug: continue
        s = re.match(r'Style block \(paste in front of every prompt\):\s*>\s*(.*)', l)
        if s: games[slug]['style'] = s[1].strip(); continue
        e = re.match(r'### (\w+)\. (.*?)(\s+\[3D candidate\])?\s*$', l)
        if e:
            el = dict(id=e[1], title=e[2].strip(), where='', now='', target='', tail='', prompt='', cand3d=bool(e[3])); games[slug]['els'].append(el); tri = False; continue
        if l.startswith('#### TRELLIS'): el = None; tri = True; continue
        if el and not tri:
            for key, pat in (('where', r'- Where: (.*)'), ('now', r'- Now: (.*)'), ('prompt', r'- Prompt \(after the style block\): (.*)')):
                m = re.match(pat, l)
                if m: el[key] = m[1].strip()
            m = re.match(r'- Target: `([^`]+)`:?\s*(.*)', l)
            if m: el['target'], el['tail'] = m[1], m[2].strip()
        if tri and l.startswith('|') and not l.startswith('| Item') and not l.startswith('|---'):
            c = [x.strip() for x in l.strip().strip('|').split('|')]
            if len(c) >= 5: games[slug]['tri'].append(dict(item=c[0], source=c[1], glb=c[2], use=c[3], value=c[4]))
    return games

def split_prompt(prompt, n, stems):
    """One prompt per file when the plan's prompt lists variants; None if it cannot be split safely."""
    if n == 1: return [prompt]
    m = re.search(r'\{([^{}/]+(?: / [^{}/]+)+)\}', prompt)
    if m:
        parts = [x.strip() for x in m[1].split(' / ')]
        if len(parts) == n: return [prompt[:m.start()] + x + prompt[m.end():] for x in parts]
    m = re.search(r'\(file 1\)\s*(.*?),?\s*\(file 2\)\s*(.*?);\s*(.*)$', prompt)
    if m and n == 2: return [f'{m[1].strip()}; {m[3]}', f'{m[2].strip()}; {m[3]}']
    m = re.search(r'\((?:objects|run once per colour):\s*([^)]*)\)', prompt)
    if m:
        parts = [x.strip() for x in re.split(r';|,\s+(?=[a-z])' if ';' not in m[1] else r';', m[1]) if x.strip()]
        base = (prompt[:m.start()] + prompt[m.end():]).strip()
        ph = re.search(r'\{[A-Z ]+\}', base)
        if ph and len(parts) == n: return [base[:ph.start()] + x + base[ph.end():] for x in parts]
    return None

def from_facelift(slug, title, fl, have):
    items, dropped = [], collections.Counter()
    style = fl['style']
    for el in fl['els']:
        paths = files_of(el['target'])
        stems = [os.path.splitext(os.path.basename(p))[0] for p in paths]
        why, left = [], []
        for p, st in zip(paths, stems):
            if (slug, st) in STALE: dropped['stale'] += 1; continue
            w = []
            if covered(slug, st, have, w): dropped[w[0] if w else 'kit/family made'] += 1; continue
            left.append((p, st))
        if not left: continue
        if re.search(r'kit recipe|see the Sands S\d', el['prompt'] + ' ' + el['tail']) and KIT_DONE.get(slug): dropped['kit made'] += len(left); continue
        sz = re.search(r'(\d+)x(\d+)', el['tail'])
        w, h = (int(sz[1]), int(sz[2])) if sz else (0, 0)
        transp = 'transparent' in el['tail'] or 'alpha' in el['tail']
        prompts = split_prompt(el['prompt'], len(paths), stems)
        main = bool(re.search(r'board|tile|card|hex|piece|token|island|table|hull|ship|pawn|meeple', el['where'].lower()))
        for (p, st) in left:
            k = stems.index(st)
            pr = prompts[k] if prompts else el['prompt']
            note = el['tail'] if len(paths) > 1 or not sz else ''
            if not prompts and len(paths) > 1:
                note = (note + ' ' if note else '') + f'This plan prompt covers {len(paths)} files ({", ".join(stems)}); make this one: {st}.'
            items.append(dict(slug=slug, game=title, kind='art', stem=st, element=f"{el['id']} {el['title']}", files=[os.path.basename(p)], save_as=os.path.basename(p),
                              repo_target=p, size=f'{w}x{h}' if w else '', ratio=exact_ratio(w, h) if w else '1:1', transparent=transp, prompt=pr, style=style,
                              why=f"Facelift: {el['now'] or 'still a plain CSS element'}", source='facelift', priority=2 if main else 3,
                              note=note, crop='', where=el['where']))
    # 3D candidates still to make: the GLB does not exist
    for row in fl['tri']:
        m = re.search(r'models/((?:[^\s,;{]|\{[^}]*\})+?\.glb)', row['glb'])
        if not m or not re.search(r'NEW', row['source']): continue
        names = [os.path.splitext(x)[0] for x in expand(m[1])]
        names = [n for n in names if not any(fnmatch.fnmatch(m_, n) for m_ in MODELS[slug]) and (slug, n) not in STALE]
        if not names: continue
        subj = re.sub(r'^.*?NEW (?:Flow )?images?(?: per [\w ]+)?:?\s*', '', row['source']).strip().rstrip('.')
        subj = re.sub(r',?\s*(3/4 (?:front )?view|light-grey background[^,]*).*$', '', subj).strip(' ,') or row['item']
        for n in names:
            pr = (f"{subj} ({row['item']}), three-quarter front view, one subject, plain light-grey (#d9d9d9) background, even soft light, "
                  f"no cast shadow, no text, 1024x1024")
            items.append(dict(slug=slug, game=title, kind='model3d', stem=n, element=row['item'], files=[n + '.png'], save_as=n + '.jpg',
                              repo_target=f'games/{slug}/models/{n}.glb', size='1024x1024', ratio='1:1', transparent=False, prompt=pr, style=fl['style'],
                              why=f"3D candidate: {row['use']}", source='facelift', priority=3,
                              note=f"Source painting for the 3D model. Budget: {row['glb']}. Value: {row['value']}", crop=''))
    return items, dropped

# ---------------------------------------------------------------- source 3: look-check
def from_lookcheck(styles, titles):
    p = os.environ.get('NEEDS_ART_JSON', 'games/look/needs-art.json')
    if not os.path.exists(p): return [], False
    try: d = json.load(open(p, encoding='utf-8'))
    except ValueError: return [], False
    rows = d if isinstance(d, list) else d.get('items', d.get('needs', []))
    items = []
    for r in rows:
        slug = gk(r.get('slug') or r.get('game') or '')
        if slug not in titles: continue
        el = str(r.get('element') or r.get('name') or 'element')
        stem = slugify(el)
        px = r.get('target_px') or r.get('size') or ''
        if isinstance(px, (list, tuple)): px = 'x'.join(str(int(x)) for x in px)
        if isinstance(px, dict): px = f"{px.get('w')}x{px.get('h')}"
        ratio = str(r.get('ratio') or '1:1')
        transp = bool(r.get('transparent', True))
        sev = str(r.get('severity') or 'severe').lower()
        crop = str(r.get('crop') or r.get('crop_path') or r.get('screenshot') or r.get('shot') or '')
        if crop:
            c = crop.replace('\\', '/').lstrip('./')
            crop = c[len('games/'):] if c.startswith('games/') else ('look/' + c if os.path.exists('games/look/' + c) else c)
        base = f'a single {el}, game art for a board game'
        pr = r.get('prompt') or (base + (', single object, centred, plain flat white background, no shadow, no text' if transp else ', no text'))
        items.append(dict(slug=slug, game=titles[slug], kind='art', stem=stem, element=el, files=[stem + '.webp'], save_as=stem + '.webp',
                          repo_target=f'games/{slug}/media/{stem}.webp', size=str(px), ratio=ratio, transparent=transp, prompt=pr, style=styles.get(slug, ''),
                          why='Look-check: ' + (str(r.get('why') or r.get('finding') or '') or f'{el} looks plain on screen {r.get("screen", "")}').strip(),
                          source='lookcheck', priority=1 if sev in ('severe', 'high', 'p1', '1') else 2, note=str(r.get('note') or ''), crop=crop,
                          screen=str(r.get('screen') or '')))
    return items, True

# ---------------------------------------------------------------- source 4: wave 7 (poses, 3D variety, art variety)
W7_NOTE = {'poses': 'Pose set: reuse the reference painting and the same seed; flat chroma background; then cutout.py keys and aligns the set.',
           '3d': 'Full-detail glb only (the lite copy is made by us). Light-grey background on purpose.',
           'art': ''}
def from_wave7(titles):
    import glob
    items = []
    for f in sorted(glob.glob('games-src/next-wave/flow-2d/*/prompts-wave[0-9]*.json') + glob.glob('games-src/next-wave/flow-3d/*/prompts-3d-wave*.json')):
        slug = f.split('/')[-2]
        if slug not in titles: continue
        try: d = json.load(open(f, encoding='utf-8'))
        except ValueError: continue
        meta = d.get('meta', {})
        if os.path.basename(f).startswith('prompts-wave6'): continue   # wave 6 is written by this script itself
        for name, prompt in d.get('cards', {}).items():
            m = meta.get(name)
            if not m: continue
            tag = m.get('tag', 'art')
            note = W7_NOTE.get(tag, '')
            if m.get('ref'): note = f"Reference painting: {m['ref']}. " + note
            if tag == 'poses':
                ch = m.get('group') or name.rsplit('-', 1)[0]
                note += f" Then: python3 games-src/scripts/cutout.py {ch}-*.png --out games/{slug}/media/poses --size 512 --align {m.get('align') or 'feet'}"
            items.append(dict(slug=slug, game=titles[slug], kind='model3d' if tag == '3d' else 'art', stem=name, element=m.get('element', name), files=[m.get('save_as', name + '.png')],
                              save_as=m.get('save_as', name + '.png'), repo_target=m.get('target', ''), size=m.get('size', ''), ratio=m.get('ratio', '1:1'), transparent=False,
                              prompt=prompt, style=d.get('style', ''), why=m.get('why', ''), source='wave7', priority=3 + int(m.get('pri', 3)), note=note.strip(),
                              crop=m.get('thumb', ''), tag=tag, bg=m.get('bg', ''), align=m.get('align', ''), wave=m.get('wave', '')))
    return items

# ---------------------------------------------------------------- source 5: Nightrun asset manifest (entries that carry a "prompt")
def from_nightrun(titles):
    slug = 'mainhattan-nightrun'
    mf = 'games-src/nightrun/assets-manifest.json'
    if slug not in titles or not os.path.exists(mf): return []
    try: ready = set(json.load(open(f'games/{slug}/media/ready.json', encoding='utf-8')))
    except (OSError, ValueError): ready = set()
    items = []
    for e in json.load(open(mf, encoding='utf-8')):
        if not e.get('prompt') or e['file'] in ready: continue
        stem = e['file'].rsplit('.', 1)[0]
        fx = e['kind'] == 'fx'
        items.append(dict(slug=slug, game=titles[slug], kind='art', stem=stem, element=e['group'] + ': ' + stem, files=[e['file']], save_as=e['file'],
                          repo_target=f"games/{slug}/media/{e['file']}", size=f"{e['w']}x{e['h']}", ratio='1:1', transparent=not fx, prompt=e['prompt'], style='',
                          why='New weapons and fusions: ' + e['where'], source='nightrun', priority=3,
                          note=e['notes'] + ' Paint at 1024x1024 or larger; we crop and convert.', crop=''))
    return items

# ---------------------------------------------------------------- build
def main():
    shelf = [g for g in GS.shelf_games() if g['slug'] != 'mainhattan-overdrive']  # Overdrive: other sessions own it
    titles = {g['slug']: g['title'] for g in shelf}
    fl_all = facelift_parse()
    styles, all_items, drops = {}, [], collections.Counter()
    for g in shelf:
        s = g['slug']; have = disk_stems(s)
        ents, mstyle = GS.missing_entries(s)
        styles[s] = mstyle or fl_all.get(s, {}).get('style', '')
        all_items += from_missing(s, g['title'], have)
        if s in fl_all:
            it, dr = from_facelift(s, g['title'], fl_all[s], have)
            all_items += it; drops.update(dr)
    lc, have_lc = from_lookcheck(styles, titles)
    all_items += lc
    all_items += from_nightrun(titles)
    w7 = from_wave7(titles)
    all_items += w7
    # dedupe by game + stem: keep the highest priority, remember every source
    merged = {}
    for it in all_items:
        k = (it['slug'], it['stem'], 'w7' if it.get('tag') else 'music' if it['kind'] == 'music' else 'pic')
        if k in merged:
            a = merged[k]
            a['sources'] = sorted(set(a['sources']) | {it['source']})
            if it['priority'] < a['priority']:
                keep = a['sources']; it['sources'] = keep; it['why'] = it['why'] + ' | ' + a['why']; merged[k] = it
            else: a['why'] += ' | ' + it['why']
            if not merged[k].get('crop') and it.get('crop'): merged[k]['crop'] = it['crop']
        else:
            it['sources'] = [it['source']]; merged[k] = it
    items = sorted(merged.values(), key=lambda x: (x['slug'], x['priority'], {'': 0, 'poses': 1, '3d': 2, 'art': 3}[x.get('tag', '')], {'art': 0, 'model3d': 1, 'video': 2, 'music': 3}[x['kind']], x['element'], x['stem']))
    for it in items:
        it['id'] = f"{it['slug']}:{it['stem']}"
        it['ratio_flow'] = flow_ratio(it['ratio']) if it['kind'] in ('art', 'model3d') else ''
        pr = it['prompt']
        if it.get('tag'):                      # wave 7: the prompt carries its own background wording (chroma colour or light grey)
            it['full_prompt'] = join_style(it['style'], pr); continue
        if it['kind'] == 'music':
            it['full_prompt'] = pr + ('' if 'no vocals' in pr.lower() else ' No vocals.') + ' Make 2 versions (a and b).'
            continue
        if it['kind'] == 'art' and it['transparent'] and 'white background' not in pr:
            pr += ', single object, centred, plain flat white background, no shadow'
        if 'no text' not in pr: pr += ', no text, letters or numbers'
        it['prompt'] = pr
        it['full_prompt'] = join_style(it['style'], pr)
    write_json_files([it for it in items if not it.get('tag')])
    write_md([it for it in items if not it.get('tag')], titles, have_lc, drops, len(w7))
    write_html(items, titles, have_lc)
    json.dump(dict(generated=datetime.datetime.now(datetime.timezone.utc).strftime('%Y-%m-%dT%H:%MZ'), lookcheck=have_lc,
                   items=[{k: v for k, v in it.items() if k in ('id', 'slug', 'kind', 'priority', 'stem', 'tag', 'wave')} for it in items]),
              open('games/next-wave.json', 'w', encoding='utf-8'), separators=(',', ':'))
    subprocess.run([sys.executable, 'games-src/scripts/game-status.py'], stdout=subprocess.DEVNULL)
    core = [it for it in items if not it.get('tag')]
    cnt = collections.Counter(it['kind'] for it in core)
    wc = collections.Counter(it.get('tag') for it in items if it.get('tag'))
    print(f"wave 7 (poses/3D/art variety): {dict(wc)}")
    print(f"next wave: {len(core)} items  paintings {cnt['art']}  music {cnt['music']}  3D {cnt['model3d']}  video {cnt['video']}  look-check file: {'yes' if have_lc else 'no'}")
    per = collections.defaultdict(collections.Counter)
    for it in core: per[it['slug']][it['kind']] += 1
    for s, c in per.items(): print(f"  {s:20} paintings {c['art']:3} music {c['music']:3} 3D {c['model3d']:3} video {c['video']}")
    print('  dropped as done:', dict(drops))

def write_json_files(items):
    out = 'games-src/next-wave'
    # clean old wave6 files so a rerun never leaves stale cards
    for dp, dn, fn in os.walk(out):
        for f in fn:
            if f.startswith('prompts-' + WAVE) or f.startswith('cues-' + WAVE): os.remove(os.path.join(dp, f))
    for dp, dn, fn in os.walk(out, topdown=False):  # drop folders a rerun no longer fills
        if dp != out and not os.listdir(dp): os.rmdir(dp)
    by = collections.defaultdict(dict)
    styles = {}
    for it in items:
        if it['kind'] == 'art': by[('flow-2d', it['slug'], f'prompts-{WAVE}{suffix(it["ratio_flow"])}.json')][it['stem']] = it['prompt']; styles[it['slug']] = it['style']
        elif it['kind'] == 'model3d': by[('flow-3d', it['slug'], f'prompts-{WAVE}.json')][it['stem']] = it['prompt']; styles[it['slug']] = it['style']
        elif it['kind'] == 'music':
            by[('music', it['slug'], f'cues-{WAVE}.json')][it['stem']] = dict(prompt=it['full_prompt'], versions=['a', 'b'], save_as=it['save_as'], length=it['size'])
    for (root, slug, name), cards in by.items():
        d = os.path.join(out, root, slug); os.makedirs(d, exist_ok=True)
        doc = {'cards': cards} if root != 'music' else {'cues': cards}
        if root != 'music': doc['style'] = styles.get(slug, '')  # reference only: the runner adds the game's style block
        with open(os.path.join(d, name), 'w', encoding='utf-8') as f: json.dump(doc, f, ensure_ascii=False, indent=1); f.write('\n')

KIND_LABEL = {'art': 'painting', 'music': 'music', 'model3d': '3D source painting', 'video': 'video'}
SRC_LABEL = {'nightrun': 'new weapons and fusions', 'lookcheck': 'look-check finding', 'facelift': 'facelift', 'missing': 'missing', 'wave7': 'wave 7 variety'}
def write_md(items, titles, have_lc, drops, n7=0):
    L = ['# Next wave: everything still to make, with prompts', '',
         f'Generated {datetime.date.today().isoformat()} by `python3 games-src/scripts/next-wave.py` (rerun after look-check and wiring-status). Page: https://am015-dev.github.io/spotify_to_ytmusic/next-wave.html', '',
         '- Replaces `MISSING-ASSETS.md` as the to-make list. Same sources deduped by game + file name: missing items, facelift elements still plain, and the look-check reviewer\'s findings (`games/look/needs-art.json`'
         + ('' if have_lc else ', not there yet') + ').',
         '- Laptop prompt files (copy `games-src/next-wave/flow-2d` and `flow-3d` into game-assets): `flow-2d/<game>/prompts-wave6[-wide|-43|-34|-tall].json`, same `{"cards": {name: prompt}}` schema, one file per ratio. Card prompts are bare like the earlier waves (the runner puts the game\'s style block in front); the style block sits in the file under `style`.',
         '- Music and sound cues: `games-src/next-wave/music/<game>/cues-wave6.json` (2 versions a and b of each, no vocals).',
         '- Every picture prompt: our own names, no text, letters or numbers in the picture; a UI piece is one object on a plain flat white background. Make at 1024 px or larger; we crop and convert.', '']
    cnt = collections.Counter(it['kind'] for it in items)
    L += [f"**Total {len(items)}**: paintings {cnt['art']}, 3D source paintings {cnt['model3d']}, music/sound {cnt['music']}, video {cnt['video']}.", '']
    if n7: L += [f'Plus {n7} wave 7 items (pose sets, 3D variety, art variety): see `games-src/VARIETY-PLAN.md` and the page.', '']
    L += [f"Dropped as already done: {', '.join(f'{v} {k}' for k, v in drops.items()) or 'none'}.", '']
    cur = None
    for it in items:
        if it['slug'] != cur:
            cur = it['slug']
            n = sum(1 for x in items if x['slug'] == cur)
            L += [f"## {titles[cur]} (`{cur}`): {n}", '']
            st = next((x['style'] for x in items if x['slug'] == cur and x['style']), '')
            if st: L += [f'Style block (in front of every picture prompt): {st}', '']
        L += [f"### {it['stem']}: {it['element']}",
              f"- Why: {SRC_LABEL[it['sources'][0]] if len(it['sources']) == 1 else ' + '.join(SRC_LABEL[s] for s in it['sources'])}. {it['why']}",
              f"- Type: {KIND_LABEL[it['kind']]}; priority {it['priority']} ({'look-check' if it['priority'] == 1 else 'facelift on board/cards' if it['priority'] == 2 else 'missing extra'})",
              f"- Save as: `{it['save_as']}`" + (f" (laptop) -> `{it['repo_target']}`" if it['kind'] != 'music' else f" -> `{it['repo_target']}`"),
              f"- Size/ratio: {it['size'] or 'n/a'}" + (f", ratio {it['ratio']}" if it['ratio'] else '') + (', transparent (flat white background, we key it)' if it['transparent'] else ''),
              *([f"- Look-check crop: `{it['crop']}`"] if it.get('crop') else []),
              *([f"- Note: {it['note']}"] if it['note'] else []),
              f"- Prompt: {it['full_prompt']}", '']
    with open('games-src/NEXT-WAVE.md', 'w', encoding='utf-8') as f: f.write('\n'.join(L).replace('\n\n\n', '\n\n') + '\n')

def write_html(items, titles, have_lc):
    pub = []
    for it in items:
        pub.append({k: hide(v) if isinstance(v, str) else v for k, v in dict(
            id=it['id'], slug=it['slug'], game=it['game'], kind=it['kind'], stem=it['stem'], element=it['element'], save_as=it['save_as'],
            size=it['size'], ratio=it['ratio'], transparent=it['transparent'], prompt=it['full_prompt'], why=it['why'], src=it['sources'][0],
            pri=it['priority'], note=it['note'], crop=it.get('crop', ''), tag=it.get('tag', ''), bg=it.get('bg', ''), wave=it.get('wave', '')).items()})
    gen = datetime.datetime.now(datetime.timezone.utc).strftime('%Y-%m-%d')
    data = json.dumps(dict(generated=gen, lookcheck=have_lc, titles=titles, items=pub), ensure_ascii=False).replace('</', '<\\/')
    html = HTML.replace('__DATA__', data)
    with open('games/next-wave.html', 'w', encoding='utf-8') as f: f.write(html)

HTML = r'''<!doctype html>
<html lang="en"><head><!-- Copyright (c) 2026 Am015-dev. All rights reserved. Not licensed for copying, modification or redistribution; see LICENSE in the source repository. --><meta name="copyright" content="&copy; 2026 Am015-dev. All rights reserved."><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>Next wave</title>
<style>
:root{--bg:#17120e;--card:#241c16;--fg:#f3e9da;--mut:#b9a88f;--acc:#f0b04a;--line:#3a2f25;--ok:#6cc78a;--warn:#e0574a;--blue:#8d97ff}
*{box-sizing:border-box}html,body{margin:0;background:var(--bg);color:var(--fg);font:15px/1.4 system-ui,-apple-system,"Segoe UI",sans-serif;overflow-x:hidden;-webkit-text-size-adjust:100%}
header{position:sticky;top:0;z-index:5;background:rgba(23,18,14,.96);border-bottom:1px solid var(--line);padding:calc(10px + env(safe-area-inset-top)) 16px 10px;display:grid;gap:8px}
h1{font-size:1.2rem;margin:0;display:flex;gap:10px;align-items:baseline;flex-wrap:wrap}h1 small{color:var(--mut);font-weight:400;font-size:.85rem}
h1 a{color:var(--acc);font-size:.85rem;font-weight:600;text-decoration:none}h1 a.r{margin-left:auto}
.counts{display:flex;gap:6px;flex-wrap:wrap;font-size:13px}.counts b{color:var(--acc)}
.counts span{border:1px solid var(--line);background:var(--card);border-radius:99px;padding:3px 10px;white-space:nowrap}
.chips{display:flex;gap:6px;flex-wrap:wrap}
.chip{border:1px solid var(--line);background:var(--card);color:var(--fg);border-radius:99px;padding:6px 14px;font:600 13px system-ui;cursor:pointer;min-height:36px}
.chip[aria-pressed=true]{background:var(--acc);color:#2a1808;border-color:var(--acc)}
main{padding:12px 16px 40px;display:grid;gap:10px;max-width:1100px;margin:0 auto}
.wbar{display:flex;gap:10px;align-items:center;flex-wrap:wrap;font-size:13px;color:var(--mut)}.wbar b{color:var(--acc)}.wbar .btn{margin-left:auto}
.intro{color:var(--mut);font-size:13px;margin:0}.intro a{color:var(--acc)}
.g{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:10px 12px;display:grid;gap:8px;min-width:0}
.g>summary{list-style:none;cursor:pointer;display:flex;gap:8px;align-items:center;flex-wrap:wrap;min-height:34px}
.g>summary::-webkit-details-marker{display:none}
.g>summary h2{margin:0;font-size:1.05rem}
.g>summary .n{font:700 12px ui-monospace,Menlo,monospace;background:#3a2a1a;color:var(--acc);border:1px solid #5a4126;border-radius:99px;padding:2px 9px;white-space:nowrap}
.g>summary .mix{color:var(--mut);font-size:12px}
.btn{border:1px solid #5a4126;background:#3a2a1a;color:var(--acc);border-radius:8px;padding:6px 12px;font:600 13px system-ui;cursor:pointer;min-height:36px}
.btn.on{background:var(--ok);color:#10200f;border-color:var(--ok)}
.g>summary .btn{margin-left:auto}
.style{font-size:12px;color:var(--mut);border-left:3px solid var(--line);padding:2px 0 2px 8px;overflow-wrap:anywhere}
.list{display:grid;gap:8px}
@media(min-width:900px){.list{grid-template-columns:1fr 1fr}}
.it{background:#1c1510;border:1px solid var(--line);border-radius:10px;padding:10px;display:grid;gap:6px;min-width:0}
.it.done{opacity:.5}
.it .hd{display:flex;gap:8px;align-items:flex-start;flex-wrap:wrap}
.it .hd b{font-size:14px;overflow-wrap:anywhere}
.tag{font:600 10px system-ui;text-transform:uppercase;letter-spacing:.06em;border:1px solid var(--line);border-radius:4px;padding:1px 5px;white-space:nowrap}
.tag.p1{color:var(--warn);border-color:var(--warn)}.tag.p2{color:var(--acc);border-color:var(--acc)}.tag.p3{color:var(--mut)}
.tag.k{color:var(--blue);border-color:#3b4170}.tag.t{color:#7fd6c2;border-color:#2f6d62}.tag.p4{color:var(--acc);border-color:var(--acc)}.tag.p5{color:#d8c08a}.tag.p6{color:var(--mut)}
.meta{font-size:12px;color:var(--mut);overflow-wrap:anywhere}.meta code{color:var(--fg);font:12px ui-monospace,Menlo,monospace}
.why{font-size:13px;color:var(--mut);overflow-wrap:anywhere}
.crop{max-width:100%;max-height:150px;border:1px solid var(--line);border-radius:6px;background:#0d0a07;justify-self:start}
.pr{font:12px/1.45 ui-monospace,Menlo,monospace;background:#120d09;border:1px solid var(--line);border-radius:6px;padding:8px;white-space:pre-wrap;overflow-wrap:anywhere;max-height:9.5em;overflow:auto;margin:0;color:#e6d9c4}
.row{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
.row label{display:flex;gap:6px;align-items:center;font-size:13px;cursor:pointer;min-height:36px;margin-left:auto}
.row input{width:20px;height:20px;accent-color:var(--ok)}
.empty{color:var(--mut);padding:30px 0;text-align:center}
</style></head><body>
<header><h1>Next wave <small id="gen"></small><a class="r" href="status.html">Status</a><a href="index.html">&larr; Shelf</a></h1>
<div class="counts" id="counts"></div>
<div class="chips" role="group" aria-label="Filter"><button class="chip" data-f="todo" aria-pressed="true">To make</button><button class="chip" data-f="all" aria-pressed="false">All</button><button class="chip" data-f="done" aria-pressed="false">Made</button></div>
<div class="chips" role="group" aria-label="Type"><button class="chip" data-t="" aria-pressed="true">All types</button><button class="chip" data-t="core" aria-pressed="false">Missing &amp; facelift</button><button class="chip" data-t="poses" aria-pressed="false">Poses</button><button class="chip" data-t="3d" aria-pressed="false">3D variety</button><button class="chip" data-t="art" aria-pressed="false">Art variety</button></div>
<div class="chips" id="wv" role="group" aria-label="Wave"></div><div class="wbar" id="wbar" hidden></div></header>
<main><p class="intro" id="intro"></p><div id="m"></div></main>
<script id="data" type="application/json">__DATA__</script>
<script>
const D=JSON.parse(document.getElementById('data').textContent);
const $=s=>document.querySelector(s),esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const KEY='nextwave-made-v1';let made={},F='todo',T='',WV='',cur={},opened={};
try{const h=location.hash.match(/^#g-([\w-]+)/);if(h)opened[h[1]]=true}catch(e){}
try{made=JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch(e){made={}}
function save(){try{localStorage.setItem(KEY,JSON.stringify(made))}catch(e){}}
const KL={art:'painting',music:'music',model3d:'3D painting',video:'video'},PL={1:'look-check',2:'facelift',3:'missing',4:'top pick',5:'next',6:'later'},TL={poses:'Poses','3d':'3D variety',art:'Art variety'};
function copy(text,btn){
  const ok=()=>{const o=btn.dataset.l||btn.textContent;btn.dataset.l=o;btn.textContent='Copied';btn.classList.add('on');setTimeout(()=>{btn.textContent=o;btn.classList.remove('on')},1400)};
  const fb=()=>{const t=document.createElement('textarea');t.value=text;t.style.cssText='position:fixed;left:-999px;top:0';document.body.appendChild(t);t.select();try{document.execCommand('copy')}catch(e){}t.remove();ok()};
  try{if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(text).then(ok,fb)}else fb()}catch(e){fb()}
}
function lineOf(it){return '## '+it.stem+' ('+it.save_as+(it.size?', '+it.size:'')+(it.ratio?', '+it.ratio:'')+(it.transparent?', transparent':'')+')\n'+it.prompt}
function counts(){
  const L=D.items,todo=L.filter(i=>!made[i.id]),core=todo.filter(i=>!i.tag),c=k=>core.filter(i=>i.kind===k).length,t=k=>todo.filter(i=>i.tag===k).length;
  $('#counts').innerHTML=`<span>To make <b>${core.length}</b></span><span>Paintings <b>${c('art')}</b></span><span>Music <b>${c('music')}</b></span><span>3D <b>${c('model3d')}</b></span>`+(c('video')?`<span>Video <b>${c('video')}</b></span>`:'')+(t('poses')+t('3d')+t('art')?`<span>Poses <b>${t('poses')}</b></span><span>3D variety <b>${t('3d')}</b></span><span>Art variety <b>${t('art')}</b></span>`:'')+`<span>Made <b>${L.length-todo.length}</b></span>`;
}
const vis=i=>(WV===''||i.wave===WV)&&(T===''||(T==='core'?!i.tag:i.tag===T));
const WAVES=[...new Set(D.items.map(i=>i.wave).filter(Boolean))].sort((a,b)=>(a.startsWith('3D')-b.startsWith('3D'))||a.localeCompare(b,undefined,{numeric:true}));
function waveBar(){
  const n=w=>D.items.filter(i=>i.wave===w&&!made[i.id]).length;
  $('#wv').innerHTML=WAVES.length?`<button class="chip" data-w="" aria-pressed="${WV===''}">All waves</button>`+WAVES.map(w=>`<button class="chip" data-w="${esc(w)}" aria-pressed="${WV===w}">${esc(w)} &middot; ${n(w)}</button>`).join(''):'';
  const b=$('#wbar');
  if(!WV){b.hidden=true;return}
  const L=D.items.filter(i=>i.wave===WV&&!made[i.id]),mix=['poses','3d','art'].map(k=>[k,L.filter(i=>i.tag===k).length]).filter(x=>x[1]).map(x=>x[1]+' '+TL[x[0]].toLowerCase()).join(', '),games=new Set(L.map(i=>i.slug)).size;
  b.hidden=false;b.innerHTML=`<span><b>${esc(WV)}</b>: ${L.length} images to make (${esc(mix)}) in ${games} games`+(WV.startsWith('3D')?' &middot; 3D track':' &middot; one day of the 380 limit')+`</span><button class="btn" data-wavecopy="1">Copy all prompts in this wave</button>`;
}
const BG={green:'flat chroma green #00FF00 background',magenta:'flat chroma magenta #FF00FF background',grey:'light-grey background (3D source)'};
function itemHTML(i){
  return `<div class="it${made[i.id]?' done':''}" data-id="${esc(i.id)}"><div class="hd"><span class="tag p${i.pri}">${i.src==='lookcheck'?'look-check':PL[i.pri]}</span><span class="tag ${i.tag?'t':'k'}">${i.tag?TL[i.tag]:KL[i.kind]}</span>${i.wave?`<span class="tag p5">${esc(i.wave)}</span>`:''}<b>${esc(i.stem)}</b></div>
        <div class="why">${esc(i.element)} &middot; ${esc(i.why)}</div>
        ${i.crop?`<img class="crop" loading="lazy" src="${esc(i.crop)}" alt="Reference picture" onerror="this.remove()">`:''}
        <div class="meta">Save as <code>${esc(i.save_as)}</code>${i.size?' &middot; '+esc(i.size)+(i.kind==='music'?'':' px'):''}${i.ratio?' &middot; ratio '+esc(i.ratio):''}${i.transparent?' &middot; flat white background':''}${i.bg?' &middot; '+esc(BG[i.bg]||i.bg):''}</div>
        ${i.note?`<div class="meta">${esc(i.note)}</div>`:''}
        <pre class="pr">${esc(i.prompt)}</pre>
        <div class="row"><button class="btn" data-copy="${esc(i.id)}">Copy prompt</button><label><input type="checkbox" data-made="${esc(i.id)}"${made[i.id]?' checked':''}> &#10003; Made</label></div></div>`;
}
function draw(){
  counts();waveBar();
  const by={};D.items.filter(vis).forEach(i=>{(by[i.slug]=by[i.slug]||[]).push(i)});
  let slugs=Object.keys(by).sort((a,b)=>{const pa=Math.min(...by[a].filter(i=>!made[i.id]).map(i=>i.pri),9),pb=Math.min(...by[b].filter(i=>!made[i.id]).map(i=>i.pri),9);return pa-pb||by[b].length-by[a].length||D.titles[a].localeCompare(D.titles[b])});
  let html='';
  slugs.forEach(s=>{
    let L=by[s].slice().sort((a,b)=>a.pri-b.pri);
    const todo=L.filter(i=>!made[i.id]);
    if(F==='todo')L=todo;else if(F==='done')L=L.filter(i=>made[i.id]);
    if(!L.length)return;
    const mix=['art','model3d','music','video'].map(k=>[k,todo.filter(i=>!i.tag&&i.kind===k).length]).filter(x=>x[1]).map(x=>x[1]+' '+KL[x[0]]).concat(['poses','3d','art'].map(k=>[k,todo.filter(i=>i.tag===k).length]).filter(x=>x[1]).map(x=>x[1]+' '+TL[x[0]].replace(/^[^3]/,c=>c.toLowerCase()))).join(', ');
    cur[s]=L;const isOpen=opened[s]!==undefined?opened[s]:L.length<=24;
    html+=`<details class="g" id="g-${s}" data-s="${s}" data-def="${isOpen?1:0}"${isOpen?' open':''}><summary><h2>${esc(D.titles[s])}</h2><span class="n">${todo.length} to make</span><span class="mix">${esc(mix)}</span><button class="btn" data-all="${s}">Copy all for this game</button></summary><div class="list" data-lz="${isOpen?0:1}">`+(isOpen?L.map(itemHTML).join(''):'')+`</div></details>`;
  });
  $('#m').innerHTML=html||'<div class="empty">Nothing here.</div>';
}
document.addEventListener('click',e=>{
  const b=e.target.closest('button');if(!b)return;
  if(b.dataset.wavecopy){const L=D.items.filter(i=>i.wave===WV&&!made[i.id]).sort((a,b)=>D.titles[a.slug].localeCompare(D.titles[b.slug])||a.pri-b.pri);copy(L.map(i=>'# '+D.titles[i.slug]+'\n'+lineOf(i)).join('\n\n'),b)}
  if(b.dataset.w!==undefined&&b.classList.contains('chip')){WV=b.dataset.w;draw()}
  if(b.dataset.copy){const it=D.items.find(i=>i.id===b.dataset.copy);if(it)copy(it.prompt,b)}
  if(b.dataset.all){const L=D.items.filter(i=>i.slug===b.dataset.all&&!made[i.id]&&vis(i));copy(L.map(lineOf).join('\n\n'),b)}
  if(b.dataset.f!==undefined&&b.classList.contains('chip')){F=b.dataset.f;document.querySelectorAll('.chip[data-f]').forEach(c=>c.setAttribute('aria-pressed',c===b));draw()}
  if(b.dataset.t!==undefined&&b.classList.contains('chip')){T=b.dataset.t;document.querySelectorAll('.chip[data-t]').forEach(c=>c.setAttribute('aria-pressed',c===b));draw()}
});
document.addEventListener('toggle',e=>{const d=e.target;if(d.dataset&&d.dataset.s){if(d.open!==(d.dataset.def==='1'))opened[d.dataset.s]=d.open;else delete opened[d.dataset.s];const l=d.querySelector('.list');if(d.open&&l&&l.dataset.lz==='1'){l.dataset.lz='0';l.innerHTML=(cur[d.dataset.s]||[]).map(itemHTML).join('')}}},true);
document.addEventListener('change',e=>{const c=e.target.closest('input[data-made]');if(!c)return;if(c.checked)made[c.dataset.made]=1;else delete made[c.dataset.made];save();draw()});
$('#gen').textContent='as of '+D.generated;
$('#intro').innerHTML='One list of everything still to make, deduped. Paste a prompt into the picture or music tool, save the file under the name shown, tick Made. Replaces <a href="missing.html">Missing assets</a>.'+(D.items.some(i=>i.wave)?' Pick a <b>wave</b> to see one day of work (at most 380 images); 3D waves are their own track. ':'')+(D.items.some(i=>i.tag)?' <b>Poses</b>, <b>3D variety</b> and <b>Art variety</b> are optional extras that make the games richer: pose sets are painted on a flat chroma colour so they can be cut out cleanly and keep one feet line; 3D items are source paintings for the 3D step. Top picks first.':'')+(D.lookcheck?'':' Look-check findings are not in yet.');
draw();
</script></body></html>
'''

if __name__ == '__main__': main()
