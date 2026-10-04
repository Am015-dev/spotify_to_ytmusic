#!/usr/bin/env python3
"""Puts Lantern Dive, Cauldron Fair and Final Approach on the Game Night Shelf, following the way Kaiten Kitchen was added.

  python3 games-src/room/add-new-games.py                 # patch the live games/ folder (this is the one that deploys)
  python3 games-src/room/add-new-games.py --games DIR     # patch a copy of games/ instead (for testing)
  python3 games-src/room/add-new-games.py --no-deploy     # shelf pages only; do not copy the built game files

It is safe to run again: every step first removes what an earlier run added, then adds it fresh, so running it twice gives the
same files as running it once, and edits to the texts below (or to the built games / covers) are picked up on the next run.

Changes under games/ (or --games DIR):
  <slug>/index.html        the built game, copied from games-src and given the copyright stamp (skipped with a warning if the build is missing)
  index.html               living-room shelf: GAMES entries (isNew), LOOK (box colour and size), BAYS (5/5/5 layout), phone row width, tally text
  classic.html             classic shelf: the same three entries
  suggest.html             "Which game?" list (also adds Kaiten Kitchen, which was missing)
  sw.js                    SLUGS (so the games can be kept offline)
  sync.html                rebuilt with games-src/sync/build.py (game list, sizes); save-key prefixes ld_ cf_ fa_ come from sync-src.html
  reference.html           a "The game in brief" tab per game (games-src/room/new-games/ref.json)
  covers/<id>.jpg          copied from games-src/room/new-games/covers/ (made by new-games/make-covers.py, a separate step)
Changes in games-src (sources and tests, not deployed):
  suite/src.html (classic shelf source), sync/build.py + sync/sync-src.html, room/test.js and sync/test.js (new games, counts, GAMES_DIR/SHOTS options)

Shipped text never names the games these are modelled on, and has no "plays like" lines.
"""
import argparse, glob, json, os, re, shutil, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))           # games-src/room
SRC = os.path.abspath(os.path.join(HERE, '..'))              # games-src
REPO = os.path.abspath(os.path.join(SRC, '..'))
NEW = os.path.join(HERE, 'new-games')

ap = argparse.ArgumentParser()
ap.add_argument('--games', default=os.path.join(REPO, 'games'), help='folder to patch (default: the live games/ folder)')
ap.add_argument('--no-deploy', action='store_true', help='do not copy the built game files into <slug>/index.html')
args = ap.parse_args()
GM = os.path.abspath(args.games)
assert os.path.isfile(os.path.join(GM, 'index.html')), 'not a games folder: ' + GM

PREVIEW = True   # True: names end in "(preview)" and carry the "Preview" chip, like the other games that are still being tested

# ------------------------------------------------------------------------------------------------------------------
# The three games. id = shelf id (also the cover file name and the sync/test key); built = where the finished build lives.
# ------------------------------------------------------------------------------------------------------------------
GAMES = [
    dict(id='lantern', slug='lantern-dive', title='Lantern Dive', prefix='ld_',
         built=['lantern-dive/game/lantern-dive.html'],
         ribbon='Co-op deep-sea trick-taking',
         blurb='Dive together, say nothing, trust the lantern. Each diver takes jobs, then the crew plays tricks in silence: Lanterns beat every colour, and every job is a promise about the tricks one diver will win. '
               'Each of you may show a single card as a hint, so read your crew. One failed job and the dive is lost. '
               'Play with computer divers, pass one device around, or online with friends.',
         stats=[['2–5', 'players'], ['20', 'minutes'], ['10+', 'ages'], ['32', 'dives']],
         chips=['Co-op', 'Computer divers · 3 levels', 'Hot-seat', 'Online with friends', 'Guided first game', '32 dives + Deep Dive', '96 job cards', 'Drone for two divers'],
         look=dict(c='#c99a2e', W=13.8, H=11.4, D=3.2)),
    dict(id='cauldron', slug='cauldron-fair', title='Cauldron Fair', prefix='cf_',
         built=['cauldron-fair/cauldron-fair.html'],
         ribbon='Push-your-luck potion brewing',
         blurb='Everyone brews at once at the village fair. Draw chips from your own bag one at a time and lay them on your cauldron: draw again for a bigger payout, or stop before the pot boils over. '
               'Coins buy new chips in colours with their own powers, so your bag grows stranger and stronger over nine rounds. '
               'Play against computers, pass one device around, or online with friends.',
         stats=[['2–4', 'players'], ['45', 'minutes'], ['10+', 'ages'], ['9', 'rounds']],
         chips=['Vs computer · 3 levels', 'Hot-seat', 'Online with friends', 'Guided first game', 'Push your luck', 'Bag building', 'Fortune cards', '4 ingredient sets'],
         look=dict(c='#2e9c8f', W=14.2, H=11.0, D=3.4)),
    dict(id='approach', slug='final-approach', title='Final Approach', prefix='fa_',
         built=['final-approach/game/final-approach.html', 'final-approach/final-approach.html'],
         ribbon='Two-player co-op dice landing',
         blurb='Two seats, eight dice, one runway. Sit in the cockpit as Pilot and Co-pilot, roll behind your own screen and place your dice one at a time on axis, engines, flaps, gear, brakes and radio. '
               'You may talk about the plan but never about the dice. Bring the airliner down in seven rounds, past the traffic, level, at the right speed. '
               'Fly with a computer crewmate, pass one device between you, or online with a friend.',
         stats=[['2', 'players'], ['15', 'minutes'], ['12+', 'ages'], ['21', 'flights']],
         chips=['Co-op', 'Computer crewmate · 3 levels', 'Hot-seat', 'Online with a friend', 'Guided first game', '11 airports', 'Hidden dice', 'Traffic, wind & fuel'],
         look=dict(c='#7aa0c4', W=12.8, H=10.6, D=2.6)),
]
IDS = [g['id'] for g in GAMES]
ID_RE = '|'.join(IDS)
SLUGS = [g['slug'] for g in GAMES]
for g in GAMES:
    g['name'] = g['title'] + (' (preview)' if PREVIEW else '')
    g['cover'] = 'covers/%s.jpg' % g['id']
    g['src'] = '%s/index.html' % g['slug']
    if PREVIEW: g['chips'] = ['Preview'] + g['chips']

# Living-room bookcase, 15 board games: 5 / 5 / 5 (was 4 / 4 / 3 cells for 12 games). Arrays: ['id','spine'] = box standing with its spine out,
# [id, id] = two boxes lying flat in one stack. Lantern Dive stands spine-out on the bottom shelf, like Doorkick Dungeon on the top shelf.
BAYS = "[['crown','nebula',['doorkick','spine'],'shipwreck','sands'],['sunglaze','rampart',['shortfuse','tidewake'],'hollowbough'],['thornbound','kaiten',['lantern','spine'],'cauldron','approach']]"

log = []
def say(m): print(m); log.append(m)
def rd(p): return open(p, encoding='utf-8').read()
def wr(p, s): open(p, 'w', encoding='utf-8').write(s)
def js(s): return "'" + s.replace('\\', '\\\\').replace("'", "\\'") + "'"
def entry(g):
    return ("  {id:%s,cover:%s,name:%s,src:%s,ribbon:%s,isNew:true,\n   blurb:%s,\n   stats:[%s],\n   chips:[%s]},\n" % (
        js(g['id']), js(g['cover']), js(g['name']), js(g['src']), js(g['ribbon']), js(g['blurb']),
        ','.join('[%s,%s]' % (js(a), js(b)) for a, b in g['stats']), ','.join(js(c) for c in g['chips'])))
ENTRY_RE = re.compile(r"^  \{id:'(?:%s)',.*?\n   chips:\[[^\n]*\]\},?\n" % ID_RE, re.M | re.S)
def sub1(pat, repl, s, what, flags=0):
    n, c = re.subn(pat, repl, s, count=1, flags=flags)
    assert c == 1, 'could not find ' + what
    return n

def add_entries(s, before_pat, what):
    """remove earlier copies of our entries, then put them in front of the Mainhattan Nightrun entry"""
    s = ENTRY_RE.sub('', s)
    block = ''.join(entry(g) for g in GAMES)
    return sub1(before_pat, lambda m: block + m.group(0), s, what, re.M)

STAMP_MARK = 'Copyright (c) 2026 Am015-dev. All rights reserved.'
STAMP = ('<!-- ' + STAMP_MARK + ' Not licensed for copying, modification or redistribution; see LICENSE in the source repository. -->'
         '<meta name="copyright" content="&copy; 2026 Am015-dev. All rights reserved.">')
def stamp(path):   # same notice as games-src/scripts/stamp-copyright.py (that script only works inside the repo's games/ folder)
    h = rd(path)
    if STAMP_MARK in h: return
    h, n = re.subn(r"(<head(?:\s[^>]*)?>)", lambda m: m.group(1) + STAMP, h, count=1, flags=re.I)
    assert n, 'no <head> in ' + path
    wr(path, h)

# ---------------------------------------------------------------- 0. the built games
if args.no_deploy:
    say('games: not copied (--no-deploy)')
else:
    for g in GAMES:
        f = next((os.path.join(SRC, b) for b in g['built'] if os.path.isfile(os.path.join(SRC, b))), None)
        if not f:
            hits = glob.glob(os.path.join(SRC, g['slug'], '**', g['slug'] + '.html'), recursive=True)
            f = hits[0] if hits else None
        dst = os.path.join(GM, g['slug'], 'index.html')
        if not f:
            say('WARNING: no built file for %s (looked for %s); %s not deployed. Shelf entries are still added.' % (g['title'], g['built'][0], dst)); continue
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        shutil.copyfile(f, dst)
        stamp(dst)
        say('game: %s <- %s (%d KB)' % (os.path.relpath(dst, GM), os.path.relpath(f, REPO), os.path.getsize(dst) // 1024))

# ---------------------------------------------------------------- 1. covers
os.makedirs(os.path.join(GM, 'covers'), exist_ok=True)
for g in GAMES:
    c = os.path.join(NEW, 'covers', g['id'] + '.jpg')
    if os.path.isfile(c):
        shutil.copyfile(c, os.path.join(GM, g['cover'])); say('cover: ' + g['cover'])
    else:
        say('WARNING: %s missing; run games-src/room/new-games/make-covers.py first' % os.path.relpath(c, REPO))

# ---------------------------------------------------------------- 2. living-room shelf (games/index.html)
p = os.path.join(GM, 'index.html'); s = rd(p)
s = add_entries(s, r"^  \{id:'mainhattan',kind:'video'", 'Mainhattan entry in index.html')
s = re.sub(r"(?:%s):\{[^}]*\},\s*" % ID_RE, '', s)                               # earlier LOOK entries
look = ''.join("%s:{c:'%s',W:%s,H:%s,D:%s}," % (g['id'], g['look']['c'], g['look']['W'], g['look']['H'], g['look']['D']) for g in GAMES)
s = sub1(r"(kaiten:\{[^}]*\},)", lambda m: m.group(1) + look, s, 'LOOK.kaiten')
s = sub1(r"^const BAYS=.*;$", lambda m: 'const BAYS=' + BAYS + ';', s, 'BAYS', re.M)
n_games = len(re.findall(r"^  \{id:'", s[s.index('const GAMES=['):s.index('/* box look')], re.M))
s = sub1(r'(<span class="tally" id="tally">)\d+( games on the shelf</span>)', lambda m: '%s%d%s' % (m.group(1), n_games, m.group(2)), s, 'tally text')
# phone shelf: boxes per row. 2 per row at 390 px left a lone box on the last row with 15 games; widen by one box when that makes every row full.
s = s.replace('html.ph .f.left b,html.ph .f.bot b{font-size:13px}', 'html.ph .f.left b,html.ph .f.bot b{font-size:13px!important}')   # inline em sizes shrank below 13px with 3 boxes per row
if 'function phPer(' not in s:
    s = sub1(r"function renderRoom\(ph\)\{", lambda m: "/* phone shelf: boxes per row (2 under 400 px, 3 under 620, else 4), widened by one when that makes every row full: 15 games = 3 / 3 / 3 / 3 / 3 at 390 px, not 7 pairs and a lone box */\n"
             "function phPer(n){const w=innerWidth,p=w<400?2:w<620?3:4;return n%p===0?p:n%(p+1)===0?p+1:p}\n" + m.group(0), s, 'renderRoom')
    a = "const w=innerWidth,per=w<400?2:w<620?3:4,ids=BOARD().map(g=>g.id);"
    assert a in s; s = s.replace(a, "const ids=BOARD().map(g=>g.id),per=phPer(ids.length);")
    b = "const per=ph?(innerWidth<400?2:innerWidth<620?3:4):0;"
    assert b in s; s = s.replace(b, "const per=ph?phPer(BOARD().length):0;")
wr(p, s); say('index.html: %d games, %d board games, BAYS 5/5/5' % (n_games, n_games - 2))

# ---------------------------------------------------------------- 3. classic shelf (games/classic.html and its source games-src/suite/src.html)
for p, what in ((os.path.join(GM, 'classic.html'), 'classic.html'), (os.path.join(SRC, 'suite', 'src.html'), 'suite/src.html')):
    s = add_entries(rd(p), r"^  \{id:'mainhattan',cover", 'Mainhattan entry in ' + what); wr(p, s); say(what + ': 3 entries')

# ---------------------------------------------------------------- 4. suggestion page
p = os.path.join(GM, 'suggest.html'); s = rd(p)
opts = [('Kaiten Kitchen', 'Kaiten Kitchen')] + [(g['title'], g['title']) for g in GAMES]
s = re.sub(r'^ *<option value="(?:%s)">[^<]*</option>\n' % '|'.join(re.escape(t) for t, _ in opts), '', s, flags=re.M)
block = ''.join('          <option value="%s">%s</option>\n' % (v, t) for v, t in opts)
s = sub1(r'^ *<option value="Mainhattan Nightrun">', lambda m: block + m.group(0), s, 'Mainhattan option', re.M)
wr(p, s); say('suggest.html: ' + ', '.join(t for t, _ in opts))

# ---------------------------------------------------------------- 5. service worker
p = os.path.join(GM, 'sw.js'); s = rd(p)
m = re.search(r"const SLUGS = \[([^\]]*)\];", s); assert m
cur = [x for x in re.findall(r"'([^']+)'", m.group(1)) if x not in SLUGS]
i = cur.index('kaiten-kitchen') + 1
cur[i:i] = SLUGS
s = s.replace(m.group(0), 'const SLUGS = [' + ', '.join("'%s'" % x for x in cur) + '];'); wr(p, s); say('sw.js SLUGS: ' + ', '.join(SLUGS))

# ---------------------------------------------------------------- 6. offline / saves page (build script + source, then rebuild games/sync.html)
p = os.path.join(SRC, 'sync', 'build.py'); s = rd(p)
s = re.sub(r"^ \('(?:%s)',[^\n]*\n" % ID_RE, '', s, flags=re.M)
tup = ''.join(" ('%s','%s','%s','%s'),\n" % (g['id'], g['name'], g['src'], g['cover']) for g in GAMES)
s = sub1(r"^ \('kaiten',[^\n]*\n", lambda m: m.group(0) + tup, s, 'kaiten tuple in build.py', re.M); wr(p, s)
p = os.path.join(SRC, 'sync', 'sync-src.html'); s = rd(p)
s = re.sub(r"\['(?:%s)','(?:%s)'\],?" % ('|'.join(g['prefix'] for g in GAMES), ID_RE), '', s)
s = sub1(r"\['kk_','kaiten'\],", lambda m: m.group(0) + ''.join("['%s','%s']," % (g['prefix'], g['id']) for g in GAMES), s, 'kk_ prefix'); wr(p, s)
env = dict(os.environ, GNS_GAMES=GM)
r = subprocess.run([sys.executable, os.path.join(SRC, 'sync', 'build.py')], env=env, capture_output=True, text=True); assert r.returncode == 0, r.stderr
say('sync.html rebuilt: ' + r.stdout.strip())

# ---------------------------------------------------------------- 7. reference page
p = os.path.join(GM, 'reference.html'); s = rd(p)
m = re.search(r"const DATA=(\{.*?\});\nconst esc", s, re.S); assert m, 'DATA not found in reference.html'
data = json.loads(m.group(1)); extra = json.load(open(os.path.join(NEW, 'ref.json'), encoding='utf-8'))
data['G'] = [g for g in data['G'] if g[0] not in IDS] + extra['G']
data['E'] = [e for e in data['E'] if e['g'] not in IDS] + extra['E']
s = s.replace(m.group(0), 'const DATA=' + json.dumps(data, ensure_ascii=False) + ';\nconst esc'); wr(p, s)
say('reference.html: tabs ' + ', '.join(g[1] for g in data['G']))

# ---------------------------------------------------------------- 8. tests (games-src)
p = os.path.join(HERE, 'test.js'); s = rd(p)
# every replacement below is a no-op when it was already applied, so this block is safe to repeat
s = s.replace("const URL='file:///home/user/spotify_to_ytmusic/games/index.html';",
              "const GAMES_DIR=process.env.GAMES_DIR||'/home/user/spotify_to_ytmusic/games',SHOTS=process.env.SHOTS||'shots';   // GAMES_DIR=<copy of games/> tests a copy\nconst URL='file://'+GAMES_DIR+'/index.html';")
s = s.replace("const URL='file://'+GAMES_DIR+'/index.html';", "const URL='file://'+GAMES_DIR+'/index.html',SHELF_PATH=GAMES_DIR+'/index.html';")
s = s.replace("'**/games/*/index.html'", "u=>/\\/[^\\/]+\\/index\\.html$/.test(u.pathname)&&u.pathname!==SHELF_PATH")   # any <slug>/index.html, wherever the folder is
s = s.replace("`shots/", "`${SHOTS}/").replace("'shots/", "SHOTS+'/")
s = s.replace("readFileSync('/home/user/spotify_to_ytmusic/games/index.html','utf8')", "readFileSync(GAMES_DIR+'/index.html','utf8')")
s = s.replace("==='14 games on the shelf'", "===GAMES.length+' games on the shelf'")
s = s.replace(".count()===12,tag+' 12 boxes (board games only)'", ".count()===BOARD.length,tag+' '+BOARD.length+' boxes (board games only)'")
s = s.replace(".count()===12,tag+' back to room'", ".count()===BOARD.length,tag+' back to room'")
s = s.replace("#listview li').count()===14", "#listview li').count()===GAMES.length")
s = s.replace("[['Board games',12],['Video games',2]]", "[['Board games',BOARD.length],['Video games',GAMES.length-BOARD.length]]")
s = s.replace('u.pathname!==new URL(URL).pathname', 'u.pathname!==SHELF_PATH')   # an earlier version of this script
s = re.sub(r"\['(?:%s)','[a-z-]+/index\.html'\]," % ID_RE, '', s)
s = sub1(r"\['kaiten','kaiten-kitchen/index\.html'\],", lambda m: m.group(0) + ''.join("['%s','%s/index.html']," % (g['id'], g['slug']) for g in GAMES), s, 'kaiten in test GAMES')
if "'The Crew'" not in s:   # names of the originals must never reach the shelf
    s = sub1(r"const BAN=\[", lambda m: m.group(0) + "'The Crew','Deep Sea','Kosmos','Quacks','Quedlinburg','NSKN','Sky Team','Scorpion',", s, 'BAN list')
wr(p, s)
p = os.path.join(SRC, 'sync', 'test.js'); s = rd(p)
if 'GAMES_DIR' not in s:
    s = s.replace("const ROOT = path.resolve(__dirname, '..', '..', 'games')", "const ROOT = process.env.GAMES_DIR ? path.resolve(process.env.GAMES_DIR) : path.resolve(__dirname, '..', '..', 'games')")
n_all = n_games
s = re.sub(r"=== \d+, '\d+ games listed'", "=== %d, '%d games listed'" % (n_all, n_all), s)
s = re.sub(r"/2 of \d+/", "/2 of %d/" % n_all, s)
s = re.sub(r"(count\(\) === )\d+(, 'sync page lists games offline')", lambda m: m.group(1) + str(n_all) + m.group(2), s)
wr(p, s); say('tests: room/test.js and sync/test.js updated (GAMES_DIR=<games copy> SHOTS=<dir> options)')

print('\nDone. Patched: ' + GM)
