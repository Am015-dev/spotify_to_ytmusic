#!/usr/bin/env python3
"""Asset check: every distinct card / piece / character / boss / board / background / icon the rules, the UI and campaign.json use must have a
stem in assets.json AND a Flow prompt file entry. Writes ASSET-CHECK.md and the music cues (next-wave/music/perch-and-plume/cues-wave1.json).
   python3 games-src/perch-and-plume/check-assets.py"""
import json, pathlib, re, glob
D = pathlib.Path(__file__).resolve().parent; SP = D.parent; REPO = SP.parent
DATA = json.loads(re.search(r'var PP_DATA = (\{.*?\});\n', (D / 'src' / 'data.js').read_text(), re.S).group(1))
CAMP = json.loads((D / 'campaign.json').read_text())
man = {i['stem']: i for i in json.loads((D / 'assets.json').read_text())['items']}
prompted = {}
for f in glob.glob(str(SP / 'next-wave' / 'flow-2d' / 'perch-and-plume' / 'prompts-wave*.json')):
    for k in json.load(open(f))['cards']: prompted[k] = pathlib.Path(f).name
media = {pathlib.Path(f).stem for f in glob.glob(str(REPO / 'games' / 'perch-and-plume' / 'media' / '*.webp'))}
req = []   # (group, id, stem)
req += [('bird card', b['id'], 'bird-' + b['id']) for b in DATA['birds']]
req += [('bonus card', b['id'], 'bonus-' + b['id']) for b in DATA['bonus']]
req += [('round goal tile', g['id'], 'goal-' + g['id']) for g in DATA['goals']]
req += [('food token / die face', f, 'food-' + f) for f in ['grub', 'seed', 'fish', 'berry', 'rodent', 'gs', 'any']]
req += [('nest icon', n, 'nest-' + n) for n in sorted({b['nest'] for b in DATA['birds']})]
req += [('token', 'egg', 'token-egg'), ('icon', 'action cube', 'ui-cube')]
cast = set(CAMP['cast']) | {c['opponent']['cast'] for c in CAMP['chapters']} | {x['face'] for c in CAMP['chapters'] for x in c.get('setup', {}).get('extra', [])} | {'you'}
req += [('character / boss portrait', c, 'portrait-' + c) for c in sorted(cast)]
req += [('board', h, 'row-' + h) for h in ['forest', 'grassland', 'wetland']] + [('board', 'mat', 'board-mat'), ('board piece', 'birdfeeder', 'ui-feeder'), ('board piece', 'tray', 'ui-tray'), ('card back', 'deck', 'card-back')]
req += [('background', 'title', 'bg-title'), ('background', 'result', 'bg-result'), ('background', 'story map', 'bg-map'), ('ui', 'winner rosette', 'ui-trophy')]
req += [('fx', 'chain spark', 'fx-chain-spark'), ('fx', 'egg pop', 'fx-egg-pop'), ('fx', 'food pop', 'fx-food-pop')]
gaps = [r for r in req if r[2] not in man or r[2] not in prompted]
extra = sorted(set(man) - {r[2] for r in req})
L = ['# perch-and-plume: asset check', '', 'Made by `check-assets.py` (re-run after changing the roster, campaign or assets). REQUIRED = every distinct card, piece, character, boss, board, background, icon and effect the rules (src/data.js), the UI and campaign.json use. PROMPTED = stem in assets.json with a Flow prompt in `next-wave/flow-2d/perch-and-plume/`. DELIVERED = file in games/perch-and-plume/media/.', '',
     '| required | in assets.json | prompted | delivered | gaps |', '|---|---|---|---|---|',
     f'| {len(req)} | {sum(1 for r in req if r[2] in man)} | {sum(1 for r in req if r[2] in prompted)} | {sum(1 for r in req if r[2] in media)} | {len(gaps)} |', '']
groups = {}
for g, i, s in req: groups.setdefault(g, []).append(s)
L += ['## By group', '', '| group | required | prompted |', '|---|---|---|'] + [f'| {g} | {len(v)} | {sum(1 for s in v if s in prompted)} |' for g, v in groups.items()] + ['']
L += ['## Gaps', ''] + ([f'- {g} `{i}`: stem `{s}` ' + ('missing from assets.json' if s not in man else 'has no Flow prompt') for g, i, s in gaps] or ['None.']) + ['']
L += ['## Slots not required by the list above', ''] + ([f'- `{s}`' for s in extra] or ['None.']) + ['']
L += ['## Music', '', 'Cues per gx-music slot (menu, main, fight, victory, defeat): `games-src/next-wave/music/perch-and-plume/cues-wave1.json`. Files go to `games/perch-and-plume/music/<slot>-a.mp3` / `-b.mp3`; the build lists only files that exist (silent until then).']
(D / 'ASSET-CHECK.md').write_text('\n'.join(L) + '\n')
STY = 'Instrumental game music, no vocals, no spoken words, acoustic and gentle, mixed for a phone game. Make 2 versions (a and b).'
cues = {
 'menu': ('Slow 72 BPM pastoral title theme: fingerpicked acoustic guitar, soft flute and light birdsong-like woodwind trills, morning calm, 4-bar intro then 16-bar sections, ends on a whole bar so it loops cleanly.', 72, True, '60-90 s loop'),
 'main': ('Unhurried 90 BPM board-game loop: plucked strings, marimba, a light hand drum, curious and cosy like a naturalist sketching in a meadow, steady and unobtrusive, loops cleanly.', 90, True, '90-120 s loop'),
 'fight': ('100 BPM boss-chapter loop: the same pastoral palette with a tense low cello ostinato and brisk pizzicato, a friendly rivalry, loops cleanly.', 100, True, '60-90 s loop'),
 'victory': ('Short bright fanfare: flute and strings rising, a joyful birdsong flourish, ends warmly.', 110, False, '6-10 s, plays once'),
 'defeat': ('Short gentle sigh: soft solo clarinet descending over warm strings, kind not sad, ends quietly.', 70, False, '5-8 s, plays once')}
out = {'_readme': 'Perch & Plume music cues, wave 1. Each cue has 2 versions (a and b). Save as games/perch-and-plume/music/<cue>-a.mp3 and <cue>-b.mp3; the build registers only files that exist, so no code change is needed. Slots: menu, main, fight loop; victory, defeat play once.',
       'cues': {k: {'prompt': STY.replace('Make 2', v[0] + ' Make 2'), 'versions': ['a', 'b'], 'save_as': k + '.mp3', 'bpm': v[1], 'loop': v[2], 'length': v[3]} for k, v in cues.items()}}
mp = SP / 'next-wave' / 'music' / 'perch-and-plume'; mp.mkdir(parents=True, exist_ok=True)
(mp / 'cues-wave1.json').write_text(json.dumps(out, indent=1) + '\n')
print(f'asset check: required {len(req)}, prompted {sum(1 for r in req if r[2] in prompted)}, gaps {len(gaps)}; music cues {len(cues)}')
