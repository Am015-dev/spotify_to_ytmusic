#!/usr/bin/env python3
"""Wave 34 asset list for Mainhattan Nightrun: pictures for the systems that so far draw code shapes.
  python3 games-src/nightrun/make-assets2.py        then   python3 games-src/nightrun/make-placeholders.py
Writes: the entries into assets-manifest.json (groups ending in '(W34)'; re-running replaces them), ASSETS-NEEDED-2.md,
games-src/next-wave/flow-2d/mainhattan-nightrun/prompts-w34.json. make-placeholders.py then writes a tiny text-free shape placeholder for each file
(never listed in media/ready.json); a real file dropped into assets-inbox/mainhattan-nightrun/ and run through scripts/ingest-assets.py replaces the shape.
Row: (file stem, w, h, shape, colour, wiring, where, priority 1-3, what to paint).  wiring: A = wired now (draws only when the id is in media/ready.json), H = needs a code hook (spot given)."""
import json, os, re
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.normpath(os.path.join(HERE, '..', '..'))
MAN = os.path.join(HERE, 'assets-manifest.json')
STYLE = 'Neon cyberpunk game art, Frankfurt 2099, glowing teal/magenta/amber neon on dark steel, crisp bright outline, chunky simple shape that reads at 40 px, no text, no letters, no numbers.'
BG = {'fx': 'pure solid black background (light and glow only, the corners must be pure black; the game keys the black to transparent)',
      'sp': 'flat plain white background (the white is cut out; keep the object away from the edges)'}
G = {}   # group -> rows
def grp(name, rows): G[name] = rows
RU = '+rules.js RU.draw'
# ---------------- 1. rule mechanics (parts/waves/rules.js) ----------------
R_ = [  # key, name, colour (rules.js c), piece w,h, fx?, shape, what the piece is
 ('well', 'GRAVITY WELL', '#b080ff', 128, 128, 1, 'swirl', 'a swirling gravity well seen from above, spiral arms pulling inward, bright dark core'),
 ('lane', 'SAFE LANE', '#3dffb0', 256, 64, 1, 'band', 'a wide glowing safe-lane band, soft edges fade up and down, tileable left to right'),
 ('echo', 'ECHO SHIP', '#ffb020', 96, 96, 0, 'tri', 'a translucent amber mirror-copy of a small fighter ship pointing right, ghosted edges'),
 ('gold', "FOOL'S GOLD", '#ffe14d', 64, 64, 0, 'dia', 'a gold coin that looks slightly wrong: cracked, with a tiny red flaw, glinting'),
 ('portal', 'LANE PORTAL', '#7cf8ff', 128, 128, 1, 'ring', 'a vertical cyan portal ring with an inner swirl, a doorway of light'),
 ('bounce', 'BOUNCE PANEL', '#19e3ff', 160, 32, 0, 'bar', 'a thin horizontal neon bounce panel with chevrons on both ends, glossy'),
 ('pocket', 'TIME POCKET', '#9fffcf', 192, 192, 1, 'ring', 'a faint mint time bubble, concentric ripples, tiny clock hands in the middle without numbers'),
 ('hunter', 'SHADOW HUNTER', '#ff3d6a', 96, 96, 0, 'tri', 'a dark stalker drone with a red eye, pointing left, shadowy edges'),
 ('gate', 'RHYTHM GATE', '#ff2d95', 128, 128, 1, 'ring', 'a magenta gate made of two arcs that open and close, pulse ticks around it'),
 ('tide', 'RISING TIDE', '#4d8bff', 256, 64, 1, 'band', 'a blue neon wave crest strip, foam highlights, tileable left to right'),
 ('cash', 'CASH LINE', '#ffd23d', 256, 32, 1, 'band', 'a horizontal line of glowing coins strung on a beam, tileable left to right'),
 ('cover', 'UMBRELLA BLOCK', '#ff9a3d', 128, 48, 0, 'bar', 'an umbrella-shaped energy shield block seen from the side, orange rim, translucent canopy'),
 ('bumper', 'BUMPER ORB', '#5affb4', 96, 96, 0, 'dot', 'a round pinball bumper orb with a bright ring and a spring glow'),
 ('hulls', 'BEAT HULL', '#ff5a8a', 64, 64, 0, 'hex', 'a hexagon hull pip that pulses like a heartbeat, solid when full'),
 ('pads', 'BOOST PAD', '#c6ff3d', 96, 48, 0, 'bar', 'a flat boost pad with two forward chevrons, lime glow'),
]
rows = []
for k, n, c, w, h, fx, sh, d in R_:
    f = ('fx-w34-rule-' if fx else 'rule-') + k
    A = k in ('hunter', 'cover', 'bumper', 'pads')      # these four draw loops start with ART.pic(...) now (the other rules draw several parts each: hook needed)
    rows.append((f, w, h, sh, c, 'A' if A else 'H', ('parts/waves/rules.js RU.T.%s.draw(m): wired, ART.pic first then the code shape' if A else 'parts/waves/rules.js RU.T.%s.draw(m) (code shape today); hook: ART.pic(\'%s\',w,x,y) first, continue when true') % ((k,) if A else (k, f)), 2, 'Rule %s: %s.' % (n, d), fx))
    rows.append(('rule-%s-icon' % k, 64, 64, sh, c, 'H', "parts/waves/rules.js rule banner / HUD badge (the n:'%s' title) - needs a new ART.pic call where the banner is drawn" % n, 3, 'Icon for the %s rule, a plain badge: %s. One bold silhouette.' % (n, d.split(',')[0]), 0))
grp('Rule mechanics (W34)', rows)
# ---------------- 2. forge (parts/weapons/forge.js) ----------------
FGR = [('seedfan', 'Seed Fan', 'pulse+swarm'), ('minelance', 'Mine Lance', 'laser+mine'), ('edgearc', 'Edge Arc', 'arc+disc'), ('ringshell', 'Ring Shell', 'beat+pulse'), ('choirbomb', 'Choir Bomb', 'swarm+beat'),
       ('prismdisc', 'Prism Disc', 'disc+laser'), ('halocoil', 'Halo Coil', 'orbit+arc'), ('huntermines', 'Hunter Mines', 'mine+swarm'), ('heatwave', 'Heat Wave', 'flame+wave'), ('iceneedle', 'Ice Needle', 'frost+rail'),
       ('hivemind', 'Hive Mind', 'drone+swarm'), ('voltrail', 'Volt Rail', 'rail+arc'), ('clustershell', 'Cluster Shell', 'shell+pulse'), ('squalldisc', 'Squall Disc', 'storm+disc'), ('bassswell', 'Bass Swell', 'wave+beat'),
       ('gravmines', 'Gravity Mines', 'well+mine'), ('horizon', 'Event Horizon', 'well+swarm'), ('firefield', 'Fire Field', 'flame+mine'), ('shardring', 'Shard Ring', 'frost+orbit'), ('pulselance', 'Pulse Lance', 'laser+beat'),
       ('thunderhead', 'Thunderhead', 'storm+arc'), ('railric', 'Rail Ricochet', 'rail+disc'), ('snowburst', 'Snowburst', 'pulse+frost'), ('blackshell', 'Black Shell', 'shell+well')]
FGM = [('pierce', 'PIERCE', 'a shot passing through a wall'), ('bounce', 'BOUNCE', 'a shot ricocheting off an edge'), ('beat', 'BEAT SYNC', 'a ring with a pulse tick'), ('shield', 'KILL SHIELD', 'a hex shield'), ('homing', 'SEEKER', 'a curved homing arrow'),
       ('split', 'SPLITTER', 'one shot splitting in two'), ('zap', 'ARC TIP', 'a lightning leap between two dots'), ('wide', 'WIDE BORE', 'a fat round shot'), ('heavy', 'HEAVY', 'a heavy square slug'), ('seed', 'SEED', 'a seed hatching a tiny seeker'),
       ('nova', 'NOVA', 'a small star burst'), ('ring', 'RINGER', 'a shot with an expanding ring')]
FGK = [('burn', 'BURN CORE', '#ff8a3d', 'a dash with a burning trail'), ('ram', 'RAM CORE', '#ff5a3d', 'a ramming spike'), ('phase', 'PHASE CORE', '#19e3ff', 'a ghosted split ship'), ('decoy', 'DECOY CORE', '#ffd23d', 'a decoy ship outline'), ('magnet', 'MAGNET CORE', '#5affb4', 'a magnet pulling pickups')]
FGP = [('salvage', 'SALVAGER', 'a scrap bolt with a plus'), ('showman', 'SHOWMAN', 'a spotlight star'), ('spare', 'SPARE CELL', 'an EMP battery cell with a plus')]
rows = []
SHP = ['tri', 'dia', 'ring', 'dot', 'cross', 'star']
for i, (k, n, pr) in enumerate(FGR):
    a, b = pr.split('+')
    rows.append(('fg-h-' + k, 96, 96, SHP[i % 6], '#ff8a3d', 'A', "parts/weapons/forge.js FG.icon(c,'h:%s',S) (inventory forge grid, weapon slot picker); wired: draws the picture when the id is in media/ready.json" % k, 1 if i < 12 else 2,
                 'Hybrid weapon %s, fused from %s and %s: a single emblem of two weapon ideas merged, centred, readable as a slot icon.' % (n, a, b), 0))
for k, n, d in FGM: rows.append(('fg-m-' + k, 64, 64, 'dia', '#e6e1ff', 'A', "parts/weapons/forge.js FG.icon(c,'m:%s',S) (mod chips on the weapon card)" % k, 2, 'Mod chip %s: %s. Pale lavender line icon with one cyan accent.' % (n, d), 0))
for k, n, c, d in FGK: rows.append(('fg-k-' + k, 96, 96, 'hex', c, 'A', "parts/weapons/forge.js FG.icon(c,'k:%s',S) (ability core slot)" % k, 1, 'Ability core %s: a hexagonal core with %s inside, gold rim.' % (n, d), 0))
for k, n, d in FGP: rows.append(('fg-p-' + k, 64, 64, 'tri', '#3dffb0', 'A', "parts/weapons/forge.js FG.icon(c,'p:%s',S) (passive slot)" % k, 3, 'Passive %s: %s inside a green square frame.' % (n, d), 0))
grp('Forge icons (W34)', rows)
# ---------------- 3. enemies, tells (grit / variants / anticamp / react) ----------------
rows = []
def E(f, w, h, sh, c, wire, where, p, d, fx=0): rows.append((f, w, h, sh, c, wire, where, p, d, fx))
E('gk-plate', 128, 128, 'bar', '#9fb0c8', 'H', 'parts/enemies/grit.js GRIT.draw (e.gk===\'plate\', drawn in front of the hull); hook ART.pic(\'gk-plate\',e.r*2.2,e.x,e.y)', 1, 'Armoured front plate overlay for an enemy hull: a curved steel shield plate on the LEFT side (enemies face left), scratched, neon edge. Overlay only, no body.')
E('fx-w34-gk-shield', 128, 128, 'ring', '#4d8bff', 'H', 'parts/enemies/grit.js GRIT.draw (e.gs>0 shield pool bubble; e.gsf hit flash)', 1, 'A blue energy shield bubble around an enemy: thin bright rim, faint hex pattern, empty centre.', 1)
E('gk-medic', 96, 96, 'cross', '#3dffb0', 'H', 'parts/enemies/grit.js GRIT.draw (e.gk===\'med\' tell, green cross badge on the hull)', 1, 'Medic marker: a small green cross badge with a soft glow, to sit on top of an enemy hull.')
E('fx-w34-gk-medlink', 256, 32, 'band', '#3dffb0', 'H', 'parts/enemies/grit.js GRIT.draw (green heal beam from a medic to the foe it heals); stretch between two points', 2, 'A green healing beam strip with small plus signs drifting along it, tileable left to right.', 1)
E('gk-evasive', 128, 128, 'tri', '#ff2d95', 'H', 'parts/enemies/grit.js GRIT.draw (e.gk===\'eva\' tell: chevron fins + speed streaks)', 1, 'Evasive marker overlay: two magenta chevron fins and three short speed streaks around an enemy, overlay only.')
E('fx-w34-elite-aura', 192, 192, 'ring', '#ffd23d', 'H', 'parts/enemies/variants.js VAR.out (elite aura ring drawn after the hull in draw.js drawEnemy)', 1, 'Elite aura: a golden ring of light with sparks, empty centre, centred.', 1)
E('var-elite-diamond', 48, 48, 'dia', '#ffd23d', 'H', 'parts/enemies/variants.js VAR.out (diamond above elite enemies)', 2, 'A small golden diamond gem with a bright core, centred.')
E('var-pip', 24, 24, 'dot', '#ffffff', 'H', 'parts/enemies/variants.js VAR.out (tint pips 1 and 2); tint colours the pip in code', 3, 'A tiny white pip, a simple glossy dot with a faint glow (the game tints it).')
E('ac-flanker', 96, 96, 'tri', '#ff3d6a', 'H', 'parts/difficulty/anticamp.js AC.draw flanker (red wedge that dives at the camping spot); ART.dflash(\'ac-flanker\',w,x,y,rot,fl) with the code wedge as fallback', 1, 'Flanker enemy: a sleek red-black dive drone shaped like an arrowhead, pointing LEFT, engine glow behind.')
E('ac-flank-tell', 64, 64, 'dia', '#ff3d6a', 'H', 'parts/difficulty/anticamp.js AC.draw (edge marker of a flush tell, 0.8 s)', 1, 'Warning marker: a red-orange chevron arrow pointing inward, flat badge.')
E('fx-w34-ac-line', 256, 16, 'band', '#ff3d6a', 'H', 'parts/difficulty/anticamp.js AC.draw (dashed line of the flanker dive)', 3, 'A dashed red warning line, short dashes with glow, tileable left to right.', 1)
E('fx-w34-ac-fire', 64, 256, 'band', '#ff7a1a', 'H', 'parts/difficulty/anticamp.js AC.draw sweep (ground-fire wall marker; the free gap stays empty)', 1, 'A vertical wall of ground fire: flames rising, tileable top to bottom, bright orange core.', 1)
E('ac-fire-gap', 64, 64, 'ring', '#3dffb0', 'H', 'parts/difficulty/anticamp.js AC.draw sweep (marker at the free gap)', 3, 'A green open-gap marker: two arrows pointing at each other with a clear space between.')
E('fx-w34-strike-col', 96, 512, 'band', '#ff2d95', 'H', 'parts/ground column strike warning (anticamp.js STRIKE telegraph, 1.2 s on the beat); stretch to the field height', 1, 'A tall column strike warning: a vertical magenta light pillar with hazard chevrons, tileable top to bottom, brighter at the top.', 1)
RX = [('hunt', 'HUNT', 'a crosshair leading a moving dot'), ('feint', 'FEINT', 'a question mark made of a hooked arrow, without letters'), ('retreat', 'RETREAT', 'a backwards arrow with a dash trail'), ('press', 'PRESS', 'two arrows squeezing inwards'),
      ('bait', 'BAIT', 'a hook with a glowing lure'), ('window', 'WINDOW', 'an open shield ring with a gold gap')]
for k, n, d in RX: E('rx-' + k, 64, 64, 'dia', '#ffb020', 'H', 'parts/enemies/react.js RX.draw (the tell above the enemy while state %s runs; code ring today)' % n, 2, 'State tell icon %s: %s. Bold and simple, amber and white.' % (n, d))
E('rx-ring-steel', 128, 128, 'ring', '#9fb0c8', 'H', 'parts/enemies/react.js RX.draw (WINDOW armoured enemy: steel ring)', 2, 'A steel armour ring, brushed metal with neon edge, empty centre.')
E('rx-ring-gold', 128, 128, 'ring', '#ffd23d', 'H', 'parts/enemies/react.js RX.draw (WINDOW open for 1 s after it fires: gold ring)', 2, 'The same armour ring but gold and glowing, a gap in its upper side.')
E('rx-crown', 64, 64, 'star', '#ffd23d', 'H', 'parts/enemies/react.js RX.draw (squad LEADER gold crown)', 3, 'A small gold crown with three points, neon outline.')
grp('Enemy kinds and tells (W34)', rows)
# ---------------- 4. boss gates and arena (parts/bosses/bossplay.js) ----------------
rows = []
B = 'parts/bosses/bossplay.js BPL.draw'
E2 = lambda *a, **k: None
def Bp(f, w, h, sh, c, p, d, fx=0, what='gate'): rows.append((f, w, h, sh, c, 'H', '%s (%s; shapes today, hook ART.pic(\'%s\',w,x,y))' % (B, what, f), p, d, fx))
Bp('bp-node', 64, 64, 'dot', '#19e3ff', 1, 'Boss shield node: a small cyan armoured orb with an eye-like core and tiny cannon.', 0, 'gate nodes')
Bp('bp-medic', 96, 96, 'cross', '#3dffb0', 1, 'Boss medic drone: a small round drone with a green cross lamp, hovering.', 0, 'gate medic')
Bp('fx-w34-bp-medlink', 256, 32, 'band', '#3dffb0', 1, 'A green repair link beam from the medic to the boss, flowing, tileable left to right.', 1, 'medic link beam')
Bp('bp-plate-emp', 192, 192, 'bar', '#ffb020', 2, 'Armour plate locking a boss core: a thick amber plate with bolts and a lightning crack icon.', 0, 'gate emp plate')
Bp('bp-parry-orb', 64, 64, 'dot', '#ff2d95', 2, 'Slow signal orb: a magenta orb with a ring, pulses, looks hittable by a dash.', 0, 'gate parry orb')
Bp('bp-back', 192, 192, 'bar', '#ffe14d', 1, 'Turning back plate: a big yellow-edged plate facing the player with a hatched weak patch on its back side.', 0, 'gate back plate')
Bp('bp-slab', 256, 64, 'bar', '#ff3d6e', 1, 'Moving barrier slab: a heavy red-black hazard-striped slab, tileable left to right.', 0, 'arena slab')
Bp('bp-conveyor', 128, 64, 'tri', '#ffb020', 2, 'Conveyor deck tile: amber chevron arrows on dark metal, tileable left to right.', 0, 'arena conveyor')
Bp('fx-w34-bp-gravity', 128, 128, 'swirl', '#b080ff', 2, 'Gravity lane arrow field: violet arrows streaming up (the game flips it), soft glow.', 1, 'arena gravity')
Bp('bp-blackout', 128, 128, 'dia', '#02030a', 3, 'Blackout lane mask: a dark smoky fog tile with a faint cyan edge, tileable.', 0, 'arena blackout')
Bp('fx-w34-bp-zone', 256, 256, 'ring', '#3dffb0', 2, 'A safe zone ring: green glowing ring with a soft inner fill, empty centre.', 1, 'arena zone')
Bp('fx-w34-bp-grid', 64, 512, 'band', '#ff2d95', 1, 'A vertical laser column: thin hot-pink beam with a bright white core, tileable top to bottom.', 1, 'arena grid')
Bp('bp-ghost', 96, 96, 'tri', '#7cf8ff', 2, 'Ghost ship that mirrors and hunts the player: a translucent cyan fighter pointing left with scanline edges.', 0, 'arena ghost')
grp('Boss gates and arena (W34)', rows)
# ---------------- 5. UI ----------------
rows = []
def U(f, w, h, sh, c, wire, where, p, d, fx=0): rows.append((f, w, h, sh, c, wire, where, p, d, fx))
U('ui-dash-icon', 64, 64, 'tri', '#19e3ff', 'A', 'c.js touch button #bDash (CSS background, set by parts/assets2.js when the id is in ready.json); abilities.js ABIL.rings draws the ring around it', 1, 'DASH button icon: a ship silhouette with three speed streaks behind it, cyan.')
U('ui-emp-icon', 64, 64, 'ring', '#ffb020', 'A', 'c.js touch button #bEmp (same hook)', 1, 'EMP button icon: a pulse ring radiating from a small spark, amber.')
U('fx-w34-ui-ring-ready', 128, 128, 'ring', '#3dffb0', 'H', 'abilities.js ABIL.rings (setRing); ring state READY: full bright ring + glow', 2, 'Button ring, READY: a full thin bright ring with glow, centre empty (the game scales it).', 1)
U('fx-w34-ui-ring-charge', 128, 128, 'ring', '#ffb020', 'H', 'abilities.js ABIL.rings; ring state CHARGING: segmented ring, dim', 2, 'Button ring, CHARGING: a ring made of 12 separate dim segments, centre empty.', 1)
U('fx-w34-ui-ring-empty', 128, 128, 'ring', '#5a6b7a', 'H', 'abilities.js ABIL.rings; ring state EMPTY: grey broken ring', 3, 'Button ring, EMPTY: a grey dull ring with a small gap, centre empty.', 1)
grp('UI ability buttons (W34)', rows)

def entry(gname, r):
    f, w, h, sh, c, wire, where, p, d, fx = r
    return {'file': f + '.webp', 'w': w, 'h': h, 'group': gname, 'status': 'WIRED' if wire == 'A' else 'RESERVED', 'where': where,
            'notes': d + ' %dx%d, %s.' % (w, h, 'light on pure black (keyed to transparent)' if fx else 'transparent (flat white background is cut out)'),
            'kind': 'fx' if fx else 'icon', 'bg': 'black' if fx else 'white', 'pri': p, 'wire': wire, 'ph': {'shape': sh, 'c': c}, 'w34': 1, 'noph': 0,
            'prompt': '%s %dx%d, %s. (Style line: see ASSETS-NEEDED-2.md.)' % (d, w, h, BG['fx' if fx else 'sp'])}
man = [e for e in json.load(open(MAN)) if not e.get('w34')]
new = [entry(g, r) for g, rs in G.items() for r in rs]
assert len({e['file'] for e in new}) == len(new) and not ({e['file'] for e in new} & {e['file'] for e in man}), 'duplicate file names'
open(MAN, 'w').write('[\n' + ',\n'.join(json.dumps(e, separators=(',', ':')) for e in man + new) + '\n]\n')      # one entry per line (keeps the file under the 400 KB guard)
json.dump({'cards': {e['file'][:-5]: '%s %s' % (STYLE, e['prompt'].replace(' (Style line: see ASSETS-NEEDED-2.md.)', '')) for e in new}}, open(os.path.join(ROOT, 'games-src', 'next-wave', 'flow-2d', 'mainhattan-nightrun', 'prompts-w34.json'), 'w'), indent=1)
# ---- ASSETS-NEEDED-2.md ----
o = ['# Nightrun: pictures for the new systems (W34)', '', 'Generated by `make-assets2.py` (re-run after changing a design). **%d files** in %d groups. Each file already exists as a tiny text-free SHAPE placeholder in `games/mainhattan-nightrun/media/`; the game never shows it (placeholders are not in `media/ready.json`) and keeps drawing its own code shape until the real picture exists.' % (len(new), len(G)), '',
     '## How to hand in a picture', '', '1. Paint it from `games-src/next-wave/flow-2d/mainhattan-nightrun/prompts-w34.json` (the style line is already in front of every prompt). Paint at 2x or larger.',
     '2. Save it under the exact id (png/jpg/webp, `_` vs `-`, `copy` and `(1)` suffixes are forgiven) into **`assets-inbox/mainhattan-nightrun/`**.',
     '3. Run `python3 games-src/scripts/ingest-assets.py` (sizes it, cuts the white / keys the black, writes `media/<id>.webp`, lists it in `ready.json`, moves the original to `done/`). Then `python3 games-src/nightrun/build.py` and commit.',
     '4. `A` = wired: the picture appears in the game at once. `H` = a one-line hook is still needed at the spot named (the picture is loaded into `ART.bm` already, `ART.pic(id,w,x,y,rot,alpha)` returns false until then).', '',
     '**Backgrounds.** `fx-w34-*` are light on PURE BLACK (the loader keys the black to transparent, like `fx-*`). Everything else: object on a flat plain WHITE background (the ingest cuts it out). No text, letters or numbers on any picture.',
     '**Style line** (already in front of every prompt in `prompts-w34.json`): ' + STYLE, '',
     '**Priority** 1 = visible in every run, 2 = common, 3 = rare / polish.', '']
n1 = sum(1 for e in new if e['wire'] == 'A'); o += ['**Totals:** %d A (auto-wired) + %d H (needs hook).' % (n1, len(new) - n1), '']
for g, rs in G.items():
    ents = [e for e in new if e['group'] == g]; pc = {p: sum(1 for e in ents if e['pri'] == p) for p in (1, 2, 3)}
    o += ['## ' + g, '', '%d files (priority 1: %d, 2: %d, 3: %d); %d A, %d H.' % (len(ents), pc[1], pc[2], pc[3], sum(e['wire'] == 'A' for e in ents), sum(e['wire'] == 'H' for e in ents)), '',
          '| id | size | bg | pri | wiring | where in code | what to paint |', '|---|---|---|---|---|---|---|']
    for e in ents: o.append('| `%s` | %dx%d | %s | %d | %s | %s | %s |' % (e['file'][:-5], e['w'], e['h'], e['bg'], e['pri'], e['wire'], e['where'].replace('|', '/'), e['notes'].replace('|', '/')))
    o.append('')
open(os.path.join(HERE, 'ASSETS-NEEDED-2.md'), 'w').write('\n'.join(o))
print('W34: %d files, %s' % (len(new), {g: len(r) for g, r in G.items()}), '| A:', n1)
