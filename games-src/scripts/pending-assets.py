#!/usr/bin/env python3
"""Nightrun: every picture / sheet / sound that is still pending, from ALL sources, in one report.
  python3 games-src/scripts/pending-assets.py [YYYY-MM-DD]    writes games-src/nightrun/ASSETS-PENDING-<date>.md (default 2026-10-21)
Read-only on art: this only reads and writes the report. Sources:
  1 Flow prompt cards  next-wave/flow-2d/mainhattan-nightrun/prompts-{foot,fx,w34,wave6,wave6-wide,wave7,wave7-wide,wave9-wide}.json
  2 nightrun/ASSETS-NEEDED*.md tables (-2, -3, the base file and the worker files STREET / ENEMIES / FX / STORY / COVERAGE) + ASSET-DECISIONS.md
  3 nightrun/assets-manifest.json (ids + Flow prompts), games/status.json 'missing' for the game
  4 owner viewer games/asset-viewer/flow.json (stage generated / approved / pushed per item, 3D sources, Boss pose videos)
  5 code hooks: ART.pic / ART.sp / ART.img / FXW.pic ids in nightrun/parts/*.js whose file is not in media/ready.json
Delivered = listed in media/ready.json, or a media file that is not a placeholder render (placeholder_guard). The hatched placeholder files in media/
do NOT count. A card is 'superseded?' when an approved animated sheet (games-src/anims/mainhattan-nightrun/sheets) covers the same job.
Priority: P1 visible every stage / first minute, P2 common, P3 rare / polish (rule: ASSETS-NEEDED-2/3 'pri' column when the row has one, else PRI_RULES below)."""
import glob, json, os, re, sys, datetime

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SRC = os.path.join(ROOT, 'games-src'); NR = os.path.join(SRC, 'nightrun')
MEDIA = os.path.join(ROOT, 'games', 'mainhattan-nightrun', 'media')
SHEETS = os.path.join(SRC, 'anims', 'mainhattan-nightrun', 'sheets'); POSES = os.path.join(SRC, 'anims', 'mainhattan-nightrun', 'poses')
FLOWDIR = os.path.join(SRC, 'next-wave', 'flow-2d', 'mainhattan-nightrun')
DATE = sys.argv[1] if len(sys.argv) > 1 else '2026-10-21'
OUT = os.path.join(NR, 'ASSETS-PENDING-%s.md' % DATE)
sys.path.insert(0, NR)
try:
    import placeholder_guard as PG
except Exception:
    PG = None

STYLE = 'Painted cyberpunk Frankfurt 2099, hand-painted game art, rain, teal and magenta neon, readable silhouettes, crisp dark outline, chunky shapes that read at small size.'
WORKER_FILES = ['ASSETS-NEEDED-STREET.md', 'ASSETS-NEEDED-ENEMIES.md', 'ASSETS-NEEDED-FX.md', 'ASSETS-NEEDED-STORY.md', 'ASSETS-NEEDED-COVERAGE.md', 'ASSET-DECISIONS.md']
TABLE_FILES = ['ASSETS-NEEDED.md', 'ASSETS-NEEDED-2.md', 'ASSETS-NEEDED-3.md'] + WORKER_FILES

# ---------------------------------------------------------------- what is real
def jload(p, d=None):
    try: return json.load(open(p))
    except Exception: return d
ready = set(jload(os.path.join(MEDIA, 'ready.json'), []))
ph_sig = jload(os.path.join(MEDIA, 'placeholders.json'), {})
man_list = jload(os.path.join(NR, 'assets-manifest.json'), [])
def is_real_file(rel):
    """media file exists and is not a placeholder render"""
    p = os.path.join(MEDIA, rel)
    if not os.path.exists(p): return False
    if rel in ready: return True
    try:
        return not (PG.is_placeholder(p) if PG else False)
    except Exception:
        return False
def file_state(rel):
    p = os.path.join(MEDIA, rel)
    if rel in ready: return 'ready'
    if not os.path.exists(p): return 'no file'
    return 'real file, not in ready.json' if is_real_file(rel) else 'placeholder file'

sheets = {}   # 'who/act' -> json
for d in [x for x in sorted(os.listdir(SHEETS)) if os.path.isdir(os.path.join(SHEETS, x))] if os.path.isdir(SHEETS) else []:
    for f in sorted(os.listdir(os.path.join(SHEETS, d))):
        if f.endswith('-strip.json'):
            sheets[d + '/' + f[:-len('-strip.json')]] = jload(os.path.join(SHEETS, d, f), {})
def sheet_wired(k): return ('anim/%s-strip.webp' % k) in ready
def sheet_txt(k):
    j = sheets.get(k, {})
    return '%s (%s frames @ %s fps, %sx%s%s)' % (k, j.get('frames', '?'), j.get('fps', '?'), j.get('w', '?'), j.get('h', '?'), '' if sheet_wired(k) else ', NOT in ready.json')
poses = sorted(os.listdir(POSES)) if os.path.isdir(POSES) else []

# ---------------------------------------------------------------- entries
E = {}
def ent(i):
    if i not in E: E[i] = dict(id=i, kind=None, where=[], size='', facing='', prompt='', pri=None, status=None, src=[], note=[], stage=None, group='', fstate=None, cover=(None, ''))
    return E[i]
def add(lst, v):
    if v and v not in lst: lst.append(v)

def canon(i):
    i = i.strip().strip('`')
    i = re.sub(r'\.webp$', '', i)
    m = re.match(r'missing-picture-(.+)-webp$', i)
    if m: return m.group(1), 'card name was missing-picture-' + m.group(1)
    m = re.match(r'foot-(?!bg-|pk-|sc-)(.+)$', i)
    if m and not i.endswith('-sheet'): return 'foot/' + m.group(1), None
    m = re.match(r'foot-(bg|pk|sc)-(.+)$', i)
    if m: return 'foot/%s-%s' % (m.group(1), m.group(2)), None
    return i, None

# 1 --- Flow prompt cards
CARDFILES = ['foot', 'fx', 'w34', 'wave6', 'wave6-wide', 'wave7', 'wave7-wide', 'wave9-wide']
card_ids = {}
for n in CARDFILES:
    d = jload(os.path.join(FLOWDIR, 'prompts-%s.json' % n), {})
    for k, v in d.get('cards', {}).items():
        i, nt = canon(k); e = ent(i); card_ids.setdefault(i, []).append(n)
        add(e['src'], 'prompts-%s' % n); add(e['note'], nt)
        if k != i and not nt: add(e['note'], 'card id %s' % k)
        txt = v if isinstance(v, str) else (v.get('prompt', '') if isinstance(v, dict) else '')
        if not e['prompt']: e['prompt'] = txt
        sz = re.findall(r'(\d{2,4})\s*x\s*(\d{2,4})', txt)
        if sz and not e['size']: e['size'] = '%sx%s' % sz[-1]
        mf = re.search(r'facing (right|left)', txt)
        if mf and not e['facing']: e['facing'] = mf.group(1)

# 2 --- markdown tables
def split_row(l):
    return [c.strip() for c in l.strip().strip('|').split('|')]
def parse_md(fn):
    rows = []; sec = ''; hdr = None
    lines = open(os.path.join(NR, fn), errors='ignore').read().split('\n')
    for a, l in enumerate(lines):
        if l.startswith('#'): sec = l.lstrip('#').strip(); hdr = None; continue
        if not l.startswith('|'): hdr = None if not l.strip() else hdr; continue
        nxt = lines[a + 1] if a + 1 < len(lines) else ''
        if re.match(r'^\|\s*-', nxt) and not re.match(r'^\|\s*-', l):
            hdr = [c.lower() for c in split_row(l)]; continue
        if re.match(r'^\|\s*-', l) or hdr is None: continue
        c = split_row(l)
        m = re.match(r'^`([^`]+)`', c[0])
        if not m: continue
        r = dict(zip(hdr, c)); r['_id'] = m.group(1); r['_sec'] = sec; rows.append(r)
    return rows
def col(r, *names):
    for n in names:
        for k in r:
            if k == n or k.startswith(n): return r[k]
    return ''
def kind_of(i, grp=''):
    g = (grp + ' ' + i).lower()
    if re.search(r'\.mp3|^sfx-|^mp-|stinger|music|sound', g) and not i.startswith(('fx-', 'ship-')): return 'music'
    if re.match(r'^(foot/)?bg-|^foot/bg|^ly-|^event-|-bg$|backdrop|^mm-bg|parallax', i): return 'bg'
    if re.match(r'^(char-|story-|st-|cast-|pc-|portrait|dlg-)', i) or 'portrait' in g or 'story cast' in g: return 'portrait'
    if re.match(r'^(kit-|ach-|pk-|wp-|diff-|medal-|soon-|abup-|fg-|cls-|node-|rx-|rule-|ui-|fgui-|ic-|nv-skin|nv-tw|nv-ev|gk-|bp-|var-|ac-|fl-)', i) or i.endswith('-icon'): return 'icon'
    if i.startswith('fx-') or 'effect' in g: return 'fx'
    if re.match(r'^foot/[a-z]+-(idle|run|jump|fall|shoot|melee|hit|die|crouch|attack|enrage)', i) or re.search(r'-(hit|atk\d|defeat-\d)$', i) or i.endswith('-sheet'): return 'sheet'
    return 'still'

man = {}
for m in man_list:
    f = m['file']; i = re.sub(r'\.webp$', '', f)
    i, _ = canon(i) if not f.startswith('foot/') else (i, None)
    man[i] = m
for fn in TABLE_FILES:
    p = os.path.join(NR, fn)
    if not os.path.exists(p): continue
    for r in parse_md(fn):
        i, nt = canon(r['_id'].split(' / ')[0]); e = ent(i); add(e['src'], fn); add(e['note'], nt)
        e['group'] = e['group'] or r['_sec']
        w = col(r, 'where'); add(e['where'], w)
        sz = col(r, 'size', 'length')
        if sz and not e['size']: e['size'] = sz
        pr = col(r, 'pri', 'prio', 'priority')
        if pr.strip() in ('1', '2', '3') and not e['pri']: e['pri'] = 'P' + pr.strip()
        pt = col(r, 'what to paint', 'picture', 'what it is', 'prompt')
        if pt: e.setdefault('paint', pt)
        fr = col(r, 'frames'); fps = col(r, 'fps'); fa = col(r, 'facing')
        if fr: add(e['note'], 'frames ' + fr)
        if fps: add(e['note'], 'fps ' + fps)
        if fa and not e['facing']: e['facing'] = fa
        wr = col(r, 'wiring', 'wired', 'status')
        if wr: e['wiring'] = wr
        bg = col(r, 'bg');
        if bg: e['bg'] = bg
# manifest (ids + Flow prompts) for anything the tables did not name
for i, m in man.items():
    e = ent(i); add(e['src'], 'assets-manifest.json'); e['group'] = e['group'] or m.get('group', '')
    add(e['where'], m.get('where', ''));
    if m.get('w') and not e['size']: e['size'] = '%sx%s' % (m['w'], m['h'])
    if m.get('prompt'): e['mprompt'] = m['prompt']
    if m.get('notes') and 'paint' not in e: e['paint'] = m['notes']
    e.setdefault('wiring', m.get('status', ''))
# status.json missing list for the game
st = jload(os.path.join(ROOT, 'games', 'status.json'), {})
for g in st.get('games', []):
    if g.get('slug') == 'mainhattan-nightrun':
        for m in g.get('missing', []):
            n = m['name']; i, _ = canon(re.sub(r'\.webp$', '', n)); e = ent(i); add(e['src'], 'status.json missing')
            if not e['paint' if 'paint' in e else 'prompt']: pass
            e.setdefault('paint', m.get('desc', ''));
            if m.get('kind') == 'music' or n.endswith('.mp3'): e['kind'] = 'music'; e['musicfile'] = n

# 4 --- owner viewer
flow = jload(os.path.join(ROOT, 'games', 'asset-viewer', 'flow.json'), {})
viewer_items = {}; vstage = {}; video_n = 0; model_n = {}
for b in flow.get('batches', []):
    if 'night' not in b['game']: continue
    for it in b['items']:
        n = it['name']; stg = it.get('stage')
        viewer_items.setdefault(n, []).append((b['file'], stg))
        if stg and (stg in ('generated', 'approved') or n not in vstage): vstage[n] = stg
    if b['file'].startswith('flow-video'): video_n += len(b['items'])
for m in flow.get('models', []):
    if 'night' in m['game']: model_n[m['stage']] = model_n.get(m['stage'], 0) + 1

# 5 --- hooks in code
PARTS = sorted(glob.glob(os.path.join(NR, 'parts', '*.js')))
ptext = {os.path.basename(p): open(p, errors='ignore').read() for p in PARTS}
HOOK_RE = re.compile(r"""\bART\.(?:pic|sp|img|isReal|artK)\(\s*['"]([a-z0-9_.-]+)['"](\s*\+)?|\bFXW\.pic\(\s*['"]([a-z0-9_.-]+)['"]""")
hooks = {}      # id -> [part files]
dyn = {}        # prefix -> [part files]
for fn, t in ptext.items():
    for m in HOOK_RE.finditer(t):
        if m.group(3): i = 'fx-' + m.group(3)
        else: i = m.group(1)
        if m.group(2) or i.endswith('-'): add(dyn.setdefault(i, []), fn)
        else: add(hooks.setdefault(i, []), fn)

# ---------------------------------------------------------------- coverage by sheets
FOOT_WHO = 'kai grunt gunman shield bruiser knife sniper drone turret mech warden flamer hound jetpack medic ninja'.split()
BOSSES = sorted(d[5:] for d in os.listdir(SHEETS) if d.startswith('boss-') and os.path.isdir(os.path.join(SHEETS, d))) if os.path.isdir(SHEETS) else []
def covered(i):
    """-> (sheet key or None, text) when an approved sheet covers this card's job"""
    m = re.match(r'foot/(%s)-(.+)$' % '|'.join(FOOT_WHO), i)
    if m:
        who, act = m.groups()
        act = re.sub(r'-[a-e]$', '', act)
        a2 = {'crouch-shoot': 'crouchshoot'}.get(act, act)
        if who == 'kai': a2 = {'hit': 'hurt', 'fall': 'land'}.get(a2, a2)
        k = '%s/%s' % (who, a2)
        if k in sheets: return k, 'probably superseded by sheet ' + sheet_txt(k)
        return None, ''
    m = re.match(r'(?:\d\d-boss-)?(%s)-(hit|defeat-\d|atk\d)$' % '|'.join(re.escape(b) for b in BOSSES), i)
    if m:
        b, a = m.groups(); a = {'hit': 'hit'}.get(a, 'defeat' if a.startswith('defeat') else 'attack'); k = 'boss-%s/%s' % (b, a)
        if k in sheets: return k, 'probably superseded by sheet ' + sheet_txt(k)
    m = re.match(r'fx-w-([a-z]+)-(muzzle|hit|bullet)$', i)
    if m:
        w, a = m.groups(); a = {'muzzle': 'muzzle', 'hit': 'impact', 'bullet': 'beam'}[a]; k = 'wpn-%s/%s' % (w, a)
        if k in sheets: return k, 'probably superseded by sheet ' + sheet_txt(k)
    for k in sheets:   # same-name animated sheet (fx-boom-*, fx-spark, fx-hitconfirm, fx-shield, pk-coin ...)
        if k.split('/')[0] == i: return k, 'probably superseded by sheet ' + sheet_txt(k)
    if i in ('fx-eb-shield-bubble', 'fx-pw-shield-bubble') and 'fx-shield/glow' in sheets: return 'fx-shield/glow', 'probably superseded by sheet ' + sheet_txt('fx-shield/glow')
    if i == 'foot/pk-heal' and 'pk-health/spin' in sheets: return 'pk-health/spin', 'probably superseded by sheet ' + sheet_txt('pk-health/spin')
    m = re.match(r'ship-([a-z]+)-boost$', i)
    if m and 'ship-%s/flame' % m.group(1) in sheets: return 'ship-%s/flame' % m.group(1), 'probably superseded by sheet ' + sheet_txt('ship-%s/flame' % m.group(1))
    return None, ''

# ---------------------------------------------------------------- classify
PRI_RULES = [   # first match wins; (regex on id, priority)
    (r'^(title|startbtn|storybtn|wpbtn|setbtn|diffbtn|dailybtn|labbtn|gabtn|bemp|bpause|go-dim)-plate$', 'P1'),   # menu and pause chrome: first minute
    (r'^fx-w-[a-z]+-(bullet|muzzle|hit)$|^fx-bullet-|^fx-boom-(small|medium)-|^fx-(hitconfirm|spark)$', 'P1'),   # every shot of every run
    (r'^(foot/)?bg-|^foot/bg-', 'P1'), (r'^foot/(kai|grunt|gunman)-', 'P1'), (r'^fx-ft-(pistol|mg|dust)', 'P1'), (r'^foot/(pk|sc)-', 'P2'),
    (r'^ship-(std|lancer|nova|drift)(-|$)', 'P1'), (r'^kit-', 'P1'), (r'^wp-[a-z]+$|^wpmount-', 'P2'),
    (r'^fx-fuse-|-icon$|^ach-|^soon-|^medal-|^event-|^foot/[a-z]+-(attack2|enrage)|-defeat-2$|-atk[34]$|^ship-[a-z]+-(bank|damaged)|-sheet$|^fx-boom-boss|^nv-skin|^nv-tw', 'P3'),
]
def pri_of(e):
    if e['pri']: return e['pri']
    for rx, p in PRI_RULES:
        if re.search(rx, e['id']): return p
    return 'P2'

for i, e in E.items():
    e['kind'] = e['kind'] or kind_of(i, e['group'])
    k, txt = covered(i)
    e['cover'] = (k, txt)
    rel = i + '.webp'
    if e['kind'] == 'music': e['fstate'] = 'music'
    else: e['fstate'] = file_state(rel)
    e['stage'] = vstage.get(i) or vstage.get(i.replace('foot/', 'foot-', 1) if i.startswith('foot/') else i)
    real = e['fstate'] == 'ready'
    if e['kind'] == 'music':
        mf = e.get('musicfile') or (i + '.mp3')
        real = any(os.path.exists(os.path.join(ROOT, 'games', 'mainhattan-nightrun', d, mf)) and mf in ready for d in ('media', 'sfx')) or (mf in ready)
    if real: e['status'] = 'delivered'
    elif e['fstate'] == 'real file, not in ready.json': e['status'] = 'delivered-unwired'; add(e['note'], 'real file in media/ but not listed in ready.json (Flow: owner file already in the game folder)')
    elif k: e['status'] = 'superseded?'; add(e['note'], txt); add(e['note'], 'needs owner confirmation')
    elif i.endswith('-sheet'): e['status'] = 'superseded?'; add(e['note'], 'character reference sheet for prompting, not an in-game picture; all 229 animated sheets are approved: probably superseded, needs owner confirmation')
    elif e['stage'] in ('generated', 'approved', 'pushed', 'wired'):
        e['status'] = 'delivered-unwired'; add(e['note'], 'owner generated it in Flow (viewer stage: %s); not in game media / ready.json; the repo holds only the viewer thumbnail (assets-inbox/ is empty), ingest needs the owner\'s full-size file' % e['stage'])
    else: e['status'] = 'not delivered'
    e['pri'] = pri_of(e)

# viewer items that are neither cards nor table rows (stage generated/approved = owner generated, not in the game yet)
for n, stg in vstage.items():
    if stg not in ('generated', 'approved'): continue
    i, _ = canon(n)
    if i in E or re.match(r'^\d\d-boss-', n) or n.endswith('.json'): continue
    e = ent(i); add(e['src'], 'asset-viewer flow.json (%s)' % stg); e['stage'] = stg; e['kind'] = kind_of(i)
    k, txt = covered(i); e['cover'] = (k, txt)
    if k: e['status'] = 'superseded?'; add(e['note'], txt); add(e['note'], 'needs owner confirmation')
    else: e['status'] = 'delivered-unwired'; add(e['note'], 'owner generated it in Flow (viewer stage: %s), no prompt card; not in game media; the repo holds only the viewer thumbnail' % stg)
    e['pri'] = pri_of(e)

# hook-referenced ids missing from ready.json
hook_missing = []
for i, fl in sorted(hooks.items()):
    if i + '.webp' in ready or i in ready: continue
    e = ent(i); add(e['src'], 'code hook')
    hook_missing.append(i)
    for f in fl: add(e['where'], 'parts/' + f)
    if not e['kind']:
        e['kind'] = kind_of(i); e['fstate'] = file_state(i + '.webp'); e['status'] = 'not delivered'; e['pri'] = pri_of(e)
        k, txt = covered(i)
        if k: e['status'] = 'superseded?'; add(e['note'], txt)
        add(e['note'], 'hook only: no card, no ASSETS-NEEDED row until this report')
    if e['status'] == 'delivered': continue
    add(e['note'], 'hook draws a flat code shape until the picture exists')

# where used from code for every pending id (literal mentions, and dynamic prefixes)
def code_files(i):
    pat = re.compile(r"""['"`/]""" + re.escape(i) + r"""(?:\.webp)?['"`]""")
    return [fn for fn, t in ptext.items() if pat.search(t)]
for i, e in E.items():
    if e['status'] == 'delivered': continue
    for f in code_files(i): add(e['where'], 'parts/' + f)
    for pre, fl in dyn.items():
        if i.startswith(pre) and len(pre) >= 3:
            for f in fl: add(e['where'], "parts/%s (built name '%s'+)" % (f, pre))
    e['where'] = [w for w in e['where'] if w]

# ---------------------------------------------------------------- text helpers
def clean(s): return re.sub(r'\s+', ' ', (s or '')).replace('|', '/').strip()
def sizecol(e):
    s = [e['size'] or '—']
    k = e['cover'][0]
    if k and k in sheets:
        j = sheets[k]; s.append('sheet %s fr @%s fps' % (j.get('frames', '?'), j.get('fps', '?')))
    elif e['kind'] == 'sheet': s.append('pose still, 1 frame')
    face = e['facing'] or ('right' if e['id'].startswith(('foot/kai', 'foot/grunt', 'foot/gunman', 'foot/shield', 'foot/knife', 'foot/sniper', 'foot/bruiser')) else
                           'left' if re.match(r'^(boss|ship-e|[a-z-]+-(hit|defeat|atk))', e['id']) or e['id'].startswith(('ship-eb', 'ship-ec', 'ship-eg', 'ship-ei', 'ship-ek')) else 'none' if e['kind'] in ('fx', 'icon', 'bg') else '—')
    s.append('facing ' + face)
    return ', '.join(s)
def flow_prompt(e):
    if e['prompt']: return clean(e['prompt'])
    if e.get('mprompt'): return clean(e['mprompt'])
    what = clean(e.get('paint', '')) or clean(e['id'].replace('-', ' ').replace('/', ' '))
    bg = e.get('bg', '')
    if e['kind'] == 'music': return clean('Short game sound effect or music cue "%s": %s.' % (e['id'], what))
    bgs = 'pure solid black background (light and glow only)' if bg == 'black' or e['kind'] == 'fx' else 'flat plain white background'
    sz = (e['size'] or '128x128')
    return clean('%s %s Centred, %s, %s, no text, no letters, no numbers.' % (STYLE, what, bgs, sz))
def srccol(e):
    s = list(e['src'])
    if e['fstate'] in ('no file',) and e['kind'] != 'music': s.append('no placeholder file in media/')
    if e['stage']: s.append('viewer:' + e['stage'])
    return clean('; '.join(s))
def wherecol(e):
    w = [clean(x) for x in e['where'] if x]
    return clean('; '.join(w[:3]) or e['group'] or '—')[:260]

rows = [e for e in E.values() if e['status'] != 'delivered']
delivered = [e for e in E.values() if e['status'] == 'delivered']
PR = {'P1': 0, 'P2': 1, 'P3': 2}; STO = {'not delivered': 0, 'delivered-unwired': 1, 'superseded?': 2}
KOR = ['sheet', 'still', 'bg', 'icon', 'fx', 'portrait', 'music']
rows.sort(key=lambda e: (PR[e['pri']], STO[e['status']], KOR.index(e['kind']), e['id']))
def cnt(f): return sum(1 for e in rows if f(e))

# worker files
workers = []
for fn in WORKER_FILES:
    p = os.path.join(NR, fn)
    if os.path.exists(p): workers.append((fn, 'ingested: %d rows' % sum(1 for e in E.values() if fn in e['src'])))
    else: workers.append((fn, 'pending from worker (Wxx, file not on origin at run time; re-run this script after it lands)'))

# ---------------------------------------------------------------- write
now = datetime.datetime.now(datetime.timezone.utc).strftime('%Y-%m-%d %H:%MZ')
o = []
w = o.append
w('# Nightrun: every asset still pending (%s)\n' % DATE)
w('Generated by `games-src/scripts/pending-assets.py` at %s. Re-run it after any asset lands; `games-src/nightrun/pending-test.js` checks that every picture id a code hook asks for is listed here. No art was created for this report.\n' % now)
w('**Status words.** `not delivered` = nobody has the picture: paint it. `delivered-unwired` = the owner already generated it in Flow (viewer stage generated / approved / pushed) but it is not in `media/` or `ready.json`: ingest and wire, do not repaint. `superseded?` = an approved animated sheet probably covers the job: **needs owner confirmation** before anyone paints. The hatched placeholder files in `media/` are not art and do not count as delivered.\n')
tot = len(rows)
w('## TOP SUMMARY\n')
w('**Grand total pending: %d ids** (%d to paint, %d ingest/wire only, %d probably superseded: ask the owner). Already covered / delivered ids: %d.\n' % (tot, cnt(lambda e: e['status'] == 'not delivered'), cnt(lambda e: e['status'] == 'delivered-unwired'), cnt(lambda e: e['status'] == 'superseded?'), len(delivered)))
w('| kind | P1 | P2 | P3 | total | of which to paint | ingest/wire | superseded? |')
w('|---|---|---|---|---|---|---|---|')
for k in KOR:
    r = [e for e in rows if e['kind'] == k]
    if not r: continue
    w('| %s | %d | %d | %d | %d | %d | %d | %d |' % (k, *[sum(1 for e in r if e['pri'] == p) for p in ('P1', 'P2', 'P3')], len(r), *[sum(1 for e in r if e['status'] == s) for s in ('not delivered', 'delivered-unwired', 'superseded?')]))
w('| **total** | **%d** | **%d** | **%d** | **%d** | **%d** | **%d** | **%d** |\n' % (cnt(lambda e: e['pri'] == 'P1'), cnt(lambda e: e['pri'] == 'P2'), cnt(lambda e: e['pri'] == 'P3'), tot, cnt(lambda e: e['status'] == 'not delivered'), cnt(lambda e: e['status'] == 'delivered-unwired'), cnt(lambda e: e['status'] == 'superseded?')))
w('Priority rule: the `pri` column of ASSETS-NEEDED-2/3 when the row has one, else P1 = menu chrome, weapon shot/muzzle/hit, backgrounds, player ship, kit icons, Kai and the two commonest foes; P3 = fusions, achievements, rule icons, defeat/attack extras, events, SOON cards; everything else P2. Rules are the `PRI_RULES` list in the script.\n')
w('### Biggest groups still to paint\n')
gc = {}
for e in rows:
    if e['status'] == 'not delivered': gc[e['group'] or e['src'][0] if e['src'] else '?'] = gc.get(e['group'] or (e['src'][0] if e['src'] else '?'), 0) + 1
for g, n in sorted(gc.items(), key=lambda x: -x[1])[:8]: w('- %s: %d' % (g, n))
w('')
w('### Sources read\n')
w('- Flow prompt cards: ' + ', '.join('prompts-%s (%d)' % (n, sum(1 for v in card_ids.values() if n in v)) for n in CARDFILES) + ' = %d distinct ids after de-duplication (foot-X-Y and foot/X-Y are the same file; fx-boom-* appear in three files).' % len(card_ids))
w('- ASSETS-NEEDED.md, -2, -3 (tables), `assets-manifest.json` (%d entries), `games/status.json` missing list for Mainhattan Nightrun.' % len(man))
for fn, s in workers: w('- `%s`: %s' % (fn, s))
w('- Owner viewer `flow.json`, Nightrun items by stage: ' + ', '.join('%s %d' % (k or 'no stage', v) for k, v in sorted({s: sum(1 for x in vstage.values() if x == s) for s in set(vstage.values())}.items(), key=lambda x: str(x[0]))) + '; items without a stage (boss pose videos etc.): %d; Boss-pose video items: %d; 3D sources by stage: %s (3D boss sources are not game pictures and are not counted above).' % (len(viewer_items) - len(vstage), video_n, ', '.join('%s %d' % kv for kv in model_n.items()) or 'none'))
w('- Code hooks: %d literal picture ids in parts/*.js, %d of them not in ready.json; %d dynamic name prefixes.' % (len(hooks), len(hook_missing), len(dyn)))
w('')
w('## Ids you can skip: already covered\n')
w('Do not paint these; they are in `media/ready.json` or a real (non-placeholder) file already.\n')
dg = {}
for e in delivered: dg.setdefault(e['group'] or e['kind'], []).append(e['id'])
for g, l in sorted(dg.items(), key=lambda x: -len(x[1])): w('- **%s** (%d): %s' % (g, len(l), ', '.join('`%s`' % x for x in sorted(l))))
wired = sorted(k for k in sheets if sheet_wired(k)); unw = sorted(k for k in sheets if not sheet_wired(k))
w('- **Animated sheets** (approved by the owner, `sheets/<who>/<act>-strip`): %d sheets, %d listed in ready.json%s. Whole kinds covered: all 10 bosses idle/attack/hit/defeat; Kai 17 acts; grunt/gunman/shield/bruiser/knife/sniper/warden idle-run-jump-melee-shoot-die; drone/turret/mech idle-shoot-die; flamer, hound, jetpack, medic, ninja; 15 ships (flame/death/volley); 13 boom + hit-confirm + spark + shield effects; 16 weapons muzzle/impact(/beam); 9 props; 3 pickups.' % (len(sheets), len(wired), '' if not unw else '; NOT in ready.json: ' + ', '.join(unw)))
sup = [e for e in rows if e['status'] == 'superseded?']
w('- **Probably superseded cards** (%d, still listed below with status `superseded?`, wait for the owner before painting).\n' % len(sup))
w('## Pending table\n')
w('Sorted P1 > P2 > P3, then to-paint > ingest/wire > superseded?, then kind. Sizes come from the prompt text; facing: characters right, bosses and enemy ships left, fx/icons none.\n')
w('| id | kind | where used | size/frames/fps/facing | Flow prompt line | priority | status | source |')
w('|---|---|---|---|---|---|---|---|')
for e in rows:
    note = ''
    st_ = e['status']
    if st_ == 'superseded?': st_ += ' ' + clean(' '.join(n for n in e['note'] if n.startswith('probably') or 'owner confirmation' in n))[:230]
    elif st_ == 'delivered-unwired': st_ += ' (' + clean(' '.join(n for n in e['note'] if 'Flow' in n))[:120] + ')'
    w('| `%s` | %s | %s | %s | %s | %s | %s | %s |' % (e['id'], e['kind'], wherecol(e), sizecol(e), flow_prompt(e), e['pri'], st_, srccol(e)))
w('')
w('## Pending from workers\n')
for fn, s in workers: w('- `%s`: %s' % (fn, s))
w('\nWhen a worker file lands, run `python3 games-src/scripts/pending-assets.py` again: its table rows are ingested under the same columns (id, size, pri, where, what to paint / prompt).')
w('\n## Hooks that draw a flat shape for a missing id\n')
w('Picture ids named by `ART.pic / ART.sp / ART.img / FXW.pic` literals in `parts/*.js` and absent from `media/ready.json` (%d). Every one is a row in the table above; `pending-test.js` fails if a hook id is missing from it.\n' % len(hook_missing))
for i in hook_missing: w('- `%s` (%s) in %s' % (i, E[i]['status'], ', '.join(hooks[i])))
w('\nDynamic names (cannot be checked one by one, the ids they build are in the table through the manifest): ' + ', '.join("`%s`+" % p for p in sorted(dyn)))
# guard.py rejects non-media files over 400 KB: keep the main report under ~380 KB, the P2 and P3 rows go to sibling files (same columns)
body = '\n'.join(o) + '\n'
if len(body.encode()) > 380000:
    hdr = [i for i, l in enumerate(o) if l.startswith('| id | kind')][0]
    rows_i = [i for i, l in enumerate(o) if i > hdr + 1 and l.startswith('| `')]
    rowpri = lambda l: l.split(' | ')[5].strip() if l.count(' | ') >= 6 else ''
    keep = set(rows_i); parts_ = {'P2': [], 'P3': []}
    for i in rows_i:
        pr = rowpri(o[i])
        if pr in parts_: parts_[pr].append(o[i]); keep.discard(i)
    main = [l for i, l in enumerate(o) if i not in (set(rows_i) - keep)]
    for pr, prow in parts_.items():
        fn2 = OUT.replace('.md', '-' + pr + '.md')
        open(fn2, 'w').write('# Nightrun pending assets, priority %s rows (continues %s)\n\n' % (pr, os.path.basename(OUT)) + o[hdr] + '\n' + o[hdr + 1] + '\n' + '\n'.join(prow) + '\n')
    main.insert(hdr + 2, '_P2 rows: %s, P3 rows: %s (same columns, split so each file stays under the repo size limit)._\n' % (os.path.basename(OUT).replace('.md', '-P2.md'), os.path.basename(OUT).replace('.md', '-P3.md')))
    body = '\n'.join(main) + '\n'
open(OUT, 'w').write(body)
print('wrote %s: %d pending (%d to paint, %d ingest/wire, %d superseded?), %d delivered/covered' % (os.path.relpath(OUT, ROOT), tot, cnt(lambda e: e['status'] == 'not delivered'), cnt(lambda e: e['status'] == 'delivered-unwired'), len(sup), len(delivered)))
