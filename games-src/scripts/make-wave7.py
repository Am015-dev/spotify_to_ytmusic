#!/usr/bin/env python3
"""Wave 7 prompt generator: pose sets, 3D variety and art variety for the shelf games (not Overdrive).

Reads  games-src/scripts/wave7_data.py (what to add per game; edit that file, not the output).
Splits the items into production waves (one wave per day, at most LIMIT=380 images each, a pose set never split):
  2D (poses and paintings): Wave 7, Wave 8, Wave 9 ...   3D source paintings: 3D wave A, B, C ... (about 40 each, own track)
Writes (laptop prompt files, same schema as prompts-wave6*.json: {"cards": {name: prompt}, "style": ...} plus "notes" and "meta")
  games-src/next-wave/flow-2d/<slug>/prompts-wave<N>[-wide|-43|-34|-tall].json   (one file per game, wave and ratio)
  games-src/next-wave/flow-3d/<slug>/prompts-3d-wave<A|B|..>.json
  games-src/next-wave/prompts-3d-all.json    all 3D sources in one list, with wave and target games/<slug>/models/<item>.glb
  games-src/next-wave/README.md                how to copy the folders to the laptop, one wave per day
  games-src/VARIETY-PLAN.md                    per game: why each group helps, priority, count, the wave table
next-wave.py reads the "meta" of these files and shows them on games/next-wave.html (tags Poses, 3D variety, Art variety).

Run: python3 games-src/scripts/make-wave7.py   then   python3 games-src/scripts/next-wave.py   then   python3 games-src/scripts/viewer-plan.py
No background in any picture prompt: poses and cut-outs ask for a flat chroma green (#00FF00) or magenta (#FF00FF) background so
games-src/scripts/cutout.py can key them. 3D source paintings use a plain light-grey background (the image-to-3D step removes it)."""
import json, os, re, sys, collections, importlib.util
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.chdir(ROOT)
sys.path.insert(0, 'games-src/scripts')
import wave7_data as W
spec = importlib.util.spec_from_file_location('game_status', 'games-src/scripts/game-status.py')
GS = importlib.util.module_from_spec(spec); spec.loader.exec_module(GS)

OUT = 'games-src/next-wave'
GREEN = 'isolated on a solid flat pure chroma green background (#00FF00), no shadow, no floor, no gradient, no green on the subject, sharp edges'
MAGENTA = 'isolated on a solid flat pure chroma magenta background (#FF00FF), no shadow, no floor, no gradient, no magenta on the subject, sharp edges'
GREY = 'plain light-grey (#d9d9d9) background, even soft studio light, no cast shadow'
NOTXT = 'No text, letters or numbers.'
LOCK = ('Same character exactly as the reference painting (same face, proportions, colours and costume); reuse this exact description and the same seed '
        'for every pose of this character.')
RATIO_SUFFIX = {'1:1': '', '16:9': '-wide', '4:3': '-43', '3:4': '-34', '9:16': '-tall'}
TAGS = {'poses': 'Poses', '3d': '3D variety', 'art': 'Art variety'}

POSE = {
 'fb': {'idle': 'standing in a relaxed idle pose, weight settled on both feet, calm neutral expression',
        'hit': 'flinching from a hit: body jerked backward, head turned away, eyes squeezed shut, mouth open in a yelp, arms thrown up',
        'win': 'celebrating a victory: arms raised high, a big triumphant grin, chest out, a small happy hop',
        'lose': 'defeated: slumped shoulders, head hanging low, eyes down, arms limp, dejected',
        'walk-a': 'mid-stride walking pose with the left foot forward and the right arm swinging forward',
        'walk-b': 'mid-stride walking pose with the right foot forward and the left arm swinging forward (the mirror of walk-a)'},
 'fl': {'idle': 'hovering in an idle pose with a gentle neutral posture',
        'hit': 'recoiling from a hit: jolted backwards, flinching, sparks flying off',
        'win': 'looming triumphantly, glowing brighter and appearing larger',
        'lose': 'defeated: dimming, sagging and cracking apart, sparks falling'},
 'bu': {'idle': 'listening with a calm neutral expression',
        'talk': 'mid-sentence, mouth slightly open, one eyebrow raised, a small expressive gesture',
        'taunt': 'smug gloating expression, mouth open mid-taunt, one eyebrow raised',
        'praise': 'grudging respect: eyebrows lifted, a small impressed nod and a slight smile',
        'shock': 'shocked: wide eyes, mouth open, leaning back',
        'win': 'triumphant, a big smile with the chin raised',
        'lose': 'defeated: downcast eyes and a deflated slumped expression'},
}
SETS = {('fb', 'boss'): (['idle', 'attack', 'hit', 'win', 'lose'], 1), ('fb', 'main'): (['idle', 'attack', 'hit', 'win', 'lose'], 2), ('fb', 'side'): (['idle', 'win', 'lose'], 3),
        ('fl', 'boss'): (['idle', 'attack', 'hit', 'win', 'lose'], 1), ('fl', 'main'): (['idle', 'attack', 'hit', 'win', 'lose'], 2), ('fl', 'side'): (['idle', 'win', 'lose'], 3),
        ('bu', 'boss'): (['idle', 'taunt', 'praise', 'shock', 'win', 'lose'], 1), ('bu', 'main'): (['idle', 'talk', 'win', 'lose'], 2), ('bu', 'side'): (['idle', 'win', 'lose'], 3)}
GREENISH = re.compile(r'\b(green|toxic|moss|emerald|lime)\b', re.I)

def exists(rel):
    return bool(rel) and (os.path.exists('games/' + rel) or os.path.exists(rel))

def ref_url(rel):
    """path of a reference painting relative to games/ (for the page thumbnail), '' when missing."""
    return rel if rel and os.path.exists('games/' + rel) else ''

def nm(desc):
    return desc.split(':')[0].split(',')[0].strip().strip('"')

def styles():
    out = {}
    t = open('games-src/MISSING-ASSETS.md', encoding='utf-8').read().split('\n')
    cur = None
    for i, l in enumerate(t):
        h = re.match(r'### .*\(`games/([\w-]+)/`\)', l)
        if h: cur = h.group(1)
        if l.startswith('Style block') and cur:
            s = (t[i + 2] if t[i + 1] == '' else t[i + 1]).lstrip('> ').strip()
            out[cur] = s
    for k, v in W.STYLE.items(): out.setdefault(k, v)
    # no background instruction may fight the chroma instruction
    return {k: re.sub(r',?\s*(plain|simple|flat)?\s*(white|light|simple|plain)[ -]*(background|backdrop)[^,.]*', '', v) for k, v in out.items()}

def pose_prompt(kind, desc, phrase, bgs):
    if kind == 'bu':
        frame = ('Bust portrait, head and shoulders, face centred, the same framing, head size and lighting as the reference painting in every expression of this character, '
                 'shoulders cut by the bottom edge of the frame.')
    elif kind == 'fl':
        frame = ('Whole figure visible with space all round, centred in the frame, the same camera distance and the same scale in every pose of this character, front three-quarter view.')
    else:
        frame = ('Full body from head to feet, front three-quarter view, centred, feet on the same ground line at the bottom fifth of the frame, figure about 80 percent of the frame height, '
                 'the same camera distance and the same scale in every pose of this character.')
    return f'{desc}. Pose: {phrase}. {frame} {LOCK} {bgs[0].upper() + bgs[1:]}. {NOTXT}'

def build():
    G = {s: dict(poses=[], d3=[], art=[]) for s in W.WHY}
    # ---------------- poses
    for slug, chars in W.CH.items():
        for cid, desc, act, kind, tier, flags in chars:
            fl = flags.split()
            ref = next((f[2:] for f in fl if f.startswith('r:')), '')
            magenta = 'g' in fl
            bgs = MAGENTA if magenta else GREEN
            name = nm(desc)
            align = {'bu': 'source --one-set', 'fl': 'centre', 'fb': 'feet'}[kind]
            if slug == 'mainhattan-nightrun':
                num = {'sek-adler': '01', 'flusskrake': '02', 'zentral-ice': '03', 'kronos': '04', 'tresor-wart': '05', 'bruecken-waechter': '06', 'schranken-wart': '07', 'messe-waechter': '08', 'hoplite': '09', 'talos': '10'}[cid]
                still = f'games-src/anims/mainhattan-nightrun/poses/{num}-boss-{cid}-a.webp'
                lst = [('hit', 'recoiling from a hit: jolted back, sparks and a flash on the front, one panel dented', 1),
                       ('defeat-1', 'defeat stage 1: cracking apart, sparks and smoke pouring out, one weapon dropping off', 1),
                       ('defeat-2', 'defeat stage 2: mostly broken, flames in the openings, about to explode', 1)]
                for k, ph in enumerate(W.NIGHTRUN_ATK_MISSING.get(cid, []), 1): lst.append((f'atk{k}', 'attack frame ' + str(k) + ' of 4, ' + ph, 1))
                for pid, ph, pri in lst:
                    p = pose_prompt(kind, desc, ph, bgs)
                    G[slug]['poses'].append(dict(group=cid, stem=f'{cid}-{pid}', prompt=p, element=f'{name}: {pid} frame', why='Boss frames: same camera, scale and centre as the existing idle and attack stills', pri=pri,
                                                 ref=still if os.path.exists(still) else 'games/' + ref, thumb=ref_url(ref), bg='magenta' if magenta else 'green', align=align,
                                                 save_as=f'{cid}-{pid}.png', target=f'games/{slug}/media/poses/{cid}-{pid}.webp', size='1024x1024', ratio='1:1'))
                continue
            ids, pri = SETS[(kind, tier)]
            lst = [(p, pri) for p in ids]
            if 'm' in fl: lst += [('walk-a', 3), ('walk-b', 3)]
            for pid, pr_ in lst:
                phrase = act if pid == 'attack' else POSE[kind if pid in POSE[kind] else 'fb'][pid]
                if pid == 'attack': phrase = f'{act} (the signature attack)' if kind != 'bu' else act
                p = pose_prompt(kind, desc, phrase, bgs)
                n = len([1 for q in lst])
                G[slug]['poses'].append(dict(group=cid, stem=f'{cid}-{pid}', prompt=p, element=f'{name}: {pid} {"expression" if kind == "bu" else "pose"}',
                                             why=f'Set of {n} for {cid}: same description, camera, scale and {"framing" if kind == "bu" else "feet line"} as its other poses', pri=pr_,
                                             ref='games/' + ref if ref else '', thumb=ref_url(ref), bg='magenta' if magenta else 'green', align=align,
                                             save_as=f'{cid}-{pid}.png', target=f'games/{slug}/media/poses/{cid}-{pid}.webp', size='1024x1024', ratio='1:1'))
    # ---------------- object pose sets
    for slug, objs in W.OBJ.items():
        for oid, desc, poses, pri, ref, fb in objs:
            ref = ref[2:] if ref.startswith('r:') else ref
            magenta = bool(GREENISH.search(desc + ' '.join(p[1] for p in poses)))
            bgs = MAGENTA if magenta else GREEN
            for pid, ph in poses:
                p = (f'{desc}. State: {ph}. Whole object visible, centred, front three-quarter view, the same camera distance, the same scale and the same baseline in every state of this object, '
                     f'{"same object exactly as the reference painting; " if ref else ""}reuse this exact description and the same seed for every state. {bgs[0].upper() + bgs[1:]}. {NOTXT}')
                G[slug]['poses'].append(dict(group=oid, stem=f'{oid}-{pid}', prompt=p, element=f'{nm(desc) if ":" in desc else oid}: {pid} state', why=f'State set for {oid}: same camera, scale and baseline',
                                             pri=pri, ref='games/' + ref if ref else '', thumb=ref_url(ref), bg='magenta' if magenta else 'green', align='feet' if fb == 'fb' else 'centre',
                                             save_as=f'{oid}-{pid}.png', target=f'games/{slug}/media/poses/{oid}-{pid}.webp', size='1024x1024', ratio='1:1'))
    for slug, ships in [('mainhattan-nightrun', W.NIGHTRUN_SHIPS)]:
        for sid, desc in ships:
            for pid, ph in [('bank-left', 'banking hard to the left, one wing dipped'), ('bank-right', 'banking hard to the right, one wing dipped'), ('boost', 'boosting: engines blazing long cyan flames, body stretched forward'), ('damaged', 'damaged: smoking, one wing sparking, flickering engine')]:
                p = (f'{desc}, seen from above and slightly behind. State: {ph}. Whole ship visible, centred, the same camera distance and scale in every state of this ship, '
                     f'same ship as the reference painting; reuse this exact description and the same seed for every state. {GREEN[0].upper() + GREEN[1:]}. {NOTXT}')
                ref = f'mainhattan-nightrun/media/ship-{sid}.webp'
                G[slug]['poses'].append(dict(group=f'ship-{sid}', stem=f'ship-{sid}-{pid}', prompt=p, element=f'{sid} ship: {pid} state', why='Player ship states: same camera, scale and centre', pri=2, ref='games/' + ref,
                                             thumb=ref_url(ref), bg='green', align='centre', save_as=f'ship-{sid}-{pid}.png', target=f'games/{slug}/media/poses/ship-{sid}-{pid}.webp', size='1024x1024', ratio='1:1'))
    # ---------------- 3D variety
    for slug, items in W.D3.items():
        for item, desc, piece, pri, why, ref in items:
            base = 'on a thin round base disc, ' if piece else ''
            p = (f'{desc}, front three-quarter view, one single object, centred, {base}whole object visible, matte painted look matching the game\'s other models, '
                 f'game-ready proportions, {GREY}, 1024x1024. {NOTXT}')
            G[slug]['d3'].append(dict(stem=item, prompt=p, element=f'3D model: {item}', why=why, pri=pri, ref='games/' + ref if ref else '', thumb=ref_url(ref), bg='grey', align='',
                                      save_as=f'{item}.png', target=f'games/{slug}/models/{item}.glb', size='1024x1024', ratio='1:1', piece=bool(piece)))
    # ---------------- art variety
    for slug, items in W.ART.items():
        for stem, desc, ratio, px, pri, why, cut in items:
            p = desc + ('' if 'no text' in desc else ', no text, letters or numbers')
            if cut: p += f', {GREEN}'
            G[slug]['art'].append(dict(stem=stem, prompt=p, element=f'Painting: {stem}', why=why, pri=pri, ref='', thumb='', bg='green' if cut else '', align='',
                                       save_as=f'{stem}.png', target=f'games/{slug}/media/{stem}.webp', size=px, ratio=ratio))
    return G

LIMIT = 380          # images per day (games/asset-viewer/flow.json "limit")
PER_3D_WAVE = 40
# the owner's top picks, in order: (game, predicate on (kind, item)); 3D top picks are listed separately
TOP2D = [
 ('cauldron-fair', lambda k, i: (k == 'poses' and i['group'] in ('bag', 'cauldron')) or (k == 'art' and i['stem'].startswith('event-boom'))),
 ('short-fuse', lambda k, i: (k == 'poses' and i['group'] == 'bomb') or (k == 'art' and i['stem'] in ('event-boom', 'event-defused'))),
 ('crown-city-smash', lambda k, i: k == 'poses' and i['group'] in ('magmaw', 'glacyx', 'cortexa')),
 ('doorkick-dungeon', lambda k, i: k == 'poses' and i['group'] in ('inferno', 'skygrif', 'pharaoh', 'wyrm', 'tentacles', 'dread')),
 ('shipwreck-isle', lambda k, i: k == 'art' and i['stem'].startswith('hex-')),
 ('hollowbough', lambda k, i: k == 'poses'),
 ('sands-of-qamar', lambda k, i: k == 'art' and i['stem'].startswith('tile-')),
 ('mainhattan-nightrun', lambda k, i: k == 'poses' and not i['group'].startswith('ship-')),
]
TOP3D = [('rampart-and-vine', lambda i: i['stem'].startswith('piece-')), ('hollowbough', lambda i: i['stem'].startswith('worker-')),
         ('sands-of-qamar', lambda i: i['stem'].startswith('meeple-')), ('sunglaze', lambda i: i['stem'].startswith('tile-')),
         ('doorkick-dungeon', lambda i: i['stem'].startswith('hero-')), ('short-fuse', lambda i: i['stem'].startswith('bomb-')),
         ('cauldron-fair', lambda i: i['stem'].startswith('bag-'))]

def assign_waves(G):
    """Sets it['wave'] ('Wave 7', '3D wave A'), it['wave_n'] (7.. / 0..) and it['ord'] on every item.
    2D units are pose sets (never split) or single paintings, ordered: top picks, main board/hand items, boss/character poses, extras."""
    slugs = list(G)
    objs = {oid for objs in W.OBJ.values() for oid, *_ in objs}
    units = collections.OrderedDict()
    for slug in slugs:
        for kind in ('poses', 'art'):
            for it in G[slug][kind]:
                key = (slug, it['group']) if kind == 'poses' else (slug, it['stem'])
                u = units.setdefault(key, dict(slug=slug, kind=kind, items=[], obj=kind == 'poses' and (it['group'] in objs or it['group'].startswith('ship-'))))
                u['items'].append(it)
    for u in units.values():
        u['pri'] = min(i['pri'] for i in u['items'])
        top = next((n for n, (g, f) in enumerate(TOP2D) if g == u['slug'] and all(f(u['kind'], i) for i in u['items'])), None)
        if top is not None: u['tier'], u['rule'] = 0, top
        elif u['kind'] == 'art' and u['pri'] <= 2 or u['obj']: u['tier'], u['rule'] = 1, 0
        elif u['pri'] <= 2: u['tier'], u['rule'] = 2, 0
        else: u['tier'], u['rule'] = 3, 0
    order = sorted(units.values(), key=lambda u: (u['tier'], u['rule'], u['pri'], slugs.index(u['slug']), u['items'][0].get('group', u['items'][0]['stem']), u['items'][0]['stem']))
    left, n, o = list(order), 7, 0
    while left:
        room, take, skipped = LIMIT, [], 0
        for u in left:
            if len(u['items']) <= room: take.append(u); room -= len(u['items'])
            else:
                skipped += 1
            if room == 0 or skipped > 25: break   # fill gaps only from the next 25 units, so priority order holds
        taken = set(map(id, take)); left = [u for u in left if id(u) not in taken]
        for u in take:
            for it in u['items']: it['wave'], it['wave_n'], it['ord'] = f'Wave {n}', n, o; o += 1
        n += 1
    d3 = [(s, it) for s in slugs for it in G[s]['d3']]
    def key3(si):
        s, it = si
        t = next((k for k, (g, f) in enumerate(TOP3D) if g == s and f(it)), 99)
        return (0 if t < 99 else 1, t, it['pri'], slugs.index(s), it['stem'])
    d3.sort(key=key3)
    k = -(-len(d3) // PER_3D_WAVE)
    for j, (s, it) in enumerate(d3):
        w = j * k // len(d3)
        it['wave'], it['wave_n'], it['ord'] = f'3D wave {chr(65 + w)}', w, j

def wave_file(it, tag):
    if tag == '3d': return 'prompts-3d-wave' + it['wave'][-1] + '.json'
    return f"prompts-wave{it['wave_n']}{RATIO_SUFFIX[it['ratio']]}.json"

def write(G, titles):
    st = styles()
    for d in ('flow-2d', 'flow-3d'):
        for dp, dn, fn in os.walk(f'{OUT}/{d}'):
            for f in fn:
                if re.match(r'prompts-(wave(7|8|9|1\d)\b|3d-wave)', f): os.remove(os.path.join(dp, f))
    allx = {'cards': {}, 'targets': {}, 'style': 'see each game folder (flow-3d/<slug>/prompts-3d-wave<A|B|..>.json)',
            'notes': W3NOTE, 'meta': {}}
    counts = {}
    for slug, g in G.items():
        style = st.get(slug, '')
        c = counts[slug] = collections.Counter()
        by = collections.defaultdict(list)
        for kind, root, tag in (('poses', 'flow-2d', 'poses'), ('d3', 'flow-3d', '3d'), ('art', 'flow-2d', 'art')):
            for it in g[kind]:
                by[(root, wave_file(it, tag))].append((tag, it))
                c[tag] += 1
        for (root, name), lst in by.items():
            lst.sort(key=lambda x: x[1]['ord'])
            tags = sorted({t for t, _ in lst}, key=['poses', '3d', 'art'].index)
            cards, meta = {}, {}
            for tag, it in lst:
                m = {k: it[k] for k in ('element', 'why', 'pri', 'ref', 'thumb', 'bg', 'align', 'save_as', 'target', 'size', 'ratio')}
                if it.get('group'): m['group'] = it['group']
                m['tag'] = tag; m['wave'] = it['wave']
                cards[it['stem']] = it['prompt']; meta[it['stem']] = m
                if tag == '3d':
                    allx['cards'][f"{slug}--{it['stem']}"] = it['prompt']; allx['targets'][f"{slug}--{it['stem']}"] = m['target']; allx['meta'][f"{slug}--{it['stem']}"] = dict(m, slug=slug)
            d = f'{OUT}/{root}/{slug}'
            os.makedirs(d, exist_ok=True)
            doc = {'cards': cards, 'style': style, 'notes': ' '.join(NOTES[t] for t in tags), 'wave': lst[0][1]['wave'], 'meta': meta}
            if tags == ['3d']: doc['targets'] = {k: v['target'] for k, v in meta.items()}
            with open(f'{d}/{name}', 'w', encoding='utf-8') as f: json.dump(doc, f, ensure_ascii=False, indent=1); f.write('\n')
    with open(f'{OUT}/prompts-3d-all.json', 'w', encoding='utf-8') as f: json.dump(allx, f, ensure_ascii=False, indent=1); f.write('\n')
    old = f'{OUT}/prompts-wave7-3d.json'
    if os.path.exists(old): os.remove(old)
    return counts

W3NOTE = ('Source paintings for the image-to-3D step. Save each as <name>.png (1024x1024), run image-to-3D, export the FULL-DETAIL glb as the target path '
          '(games/<slug>/models/<item>.glb); the lite copy is made by us. Light-grey background on purpose: the 3D step removes it and a green background would tint the model colours. '
          'Keys are <slug>--<item>. Where "ref" is set, an existing painting of the same thing is in the repo: use it as the image-to-image reference for the same look.')
NOTES = {
 'poses': ('Pose / expression set. One character = one reused description + the reference painting (meta.ref) + the same seed, same camera, same scale, centred, feet on one baseline. '
           'Background is flat chroma colour (meta.bg) so games-src/scripts/cutout.py can key it: save each as <name>.png in one folder per character, then '
           'python3 games-src/scripts/cutout.py <folder>/<char>-*.png --out <target folder> --size 512 --align <meta.align>  (writes transparent webp + contact-sheet.png). '
           'Check the contact sheet: all poses the same height, same feet line. Style block: use the one in "style" but ignore any background wording in it.'),
 '3d': W3NOTE,
 'art': ('Painted variety. Ratio and size are in meta; paint at 1024 px or larger on the long side, we crop and convert. Tables and boards: calm empty middle for the game. '
         'Style block: the one in "style". Items with meta.bg set are cut-outs on a flat chroma colour for cutout.py.'),
}

def plan(G, titles, counts):
    P = collections.defaultdict(lambda: collections.Counter())
    L = ['# Variety plan: poses, 3D variety, art variety (wave 7)', '',
         'Generated by `python3 games-src/scripts/make-wave7.py` from `games-src/scripts/wave7_data.py`. Prompts: `games-src/next-wave/flow-2d/<game>/prompts-wave<N>[-wide|-43|-34|-tall].json`, '
         '`flow-3d/<game>/prompts-3d-wave<A|B|..>.json` and the combined `games-src/next-wave/prompts-3d-all.json` (target `games/<slug>/models/<item>.glb`). '
         'They also show on https://am015-dev.github.io/spotify_to_ytmusic/next-wave.html with the tags Poses, 3D variety, Art variety.', '',
         '## What "poses like Overdrive" means technically', '',
         '1. Overdrive people are built from separate parts (hip, torso, left and right leg, arm and hand, head) that code poses every frame (walk swing, run, jump, sit in the car, wave, climb out), all on one origin at the feet and one scale, with real transparency because they are live 3D.',
         '2. A pose is a named state (idle, walk, run, air, sit, wave) picked from game state, so one character needs the same skeleton, proportions and baseline in every pose.',
         '3. Our painted games have no skeleton, so the equivalent is a pose set: N stills of one character, same description and seed, same camera and scale, feet on one baseline, cut out to transparent and played as a frame strip (the Nightrun boss sheets: 4 idle + 4 attack cells from one shared crop; the Crown Voltusk idle and attack clips with alpha).',
         '4. The old sheets were made on white and cut with a script; this wave asks for flat chroma green (magenta for green subjects) so `games-src/scripts/cutout.py` keys them cleanly, aligns every pose of a character to one canvas and feet line, and writes a contact sheet to check.',
         '5. A new 3D model (full-detail GLB; the lite copy is made by us) also gives unlimited extra poses and turntable renders later, so 3D variety and pose sets feed each other.', '',
         '## Totals', '']
    tot = collections.Counter()
    for s in G:
        for k in ('poses', '3d', 'art'): tot[k] += counts[s][k]
    L += [f'Poses {tot["poses"]}, 3D variety {tot["3d"]}, art variety {tot["art"]} (all 16 shelf games except Overdrive).', '',
          'Priority 1 = what the player looks at most (main board, bosses, the fun moment), 2 = next, 3 = later. Cutout recipe, 3 of the prompts below at a time is a good first batch per game.', '',
          '## Per game', '']
    L += ['| Game | Poses | 3D | Art | P1 items |', '|---|---:|---:|---:|---:|']
    for s in G:
        p1 = sum(1 for k in ('poses', 'd3', 'art') for it in G[s][k] if it['pri'] == 1)
        L.append(f'| {titles.get(s, s)} | {counts[s]["poses"]} | {counts[s]["3d"]} | {counts[s]["art"]} | {p1} |')
    L.append('')
    for s in G:
        g = G[s]
        L += [f'### {titles.get(s, s)} (`{s}`)', '']
        for key, lab, k in (('poses', 'Poses', 'poses'), ('d3', '3D variety', '3d'), ('art', 'Art variety', 'art')):
            its = g[key]
            if not its: continue
            pc = collections.Counter(i['pri'] for i in its)
            L.append(f'- **{lab}: {len(its)}** (P1 {pc[1]}, P2 {pc[2]}, P3 {pc[3]}). {W.WHY[s][key]}')
            if key == 'poses':
                by = collections.OrderedDict()
                for i in its:
                    cid = re.sub(r'-(idle|attack|hit|win|lose|talk|taunt|praise|shock|walk-a|walk-b|defeat-1|defeat-2|atk\d|tick-a|tick-b|spark|smoke|boom-1|boom-2|defused|act|closed|shake-a|shake-b|open|empty|simmer|bubble|boil-over|boom|lit|dim|flicker|out|lift-a|lift-b|rest|bank-left|bank-right|boost|damaged|wreck|opening)$', '', i['stem'])
                    by.setdefault(cid, []).append(i)
                L.append('  - ' + '; '.join(f'{c} x{len(v)}' for c, v in by.items()))
            elif key == 'd3':
                L.append('  - ' + '; '.join(f'{i["stem"]}' + (' (piece)' if i.get('piece') else '') for i in its))
            else:
                L.append('  - ' + '; '.join(i['stem'] for i in its))
        L.append('')
    L += ['## Top 10 to make first', '',
          '1. Cauldron Fair: bag draw states (closed, shake, open, empty) + the three boom splashes. The draw and the boom are the game; one picture each today.',
          '2. Short Fuse: bomb tick, spark, smoke, boom and defused states. Every wire cut gets a visible consequence.',
          '3. Crown City Smash: the three boss monsters (Magmaw, Glacyx, Cortexa) x 5 poses. They are the chapter ends.',
          '4. Doorkick Dungeon: the six door monsters x 5 poses and the three missing 3D heroes (Wrenna, Bodkin, Hobb).',
          '5. Rampart & Vine: three alternate looks for each of the four piece kinds (12 models). The most-seen object, one look per kind today.',
          '6. Shipwreck Isle: 2 alternates for each hex terrain (10 pictures). The tiled look is the loudest complaint on a hex board.',
          '7. Hollowbough: the six animal worker pegs (the acorn peg is every worker today) and the six animals x 5 poses.',
          '8. Sands of Qamar: six role pawns as distinct 3D figures plus 5 alternate tiles.',
          '9. Mainhattan Nightrun: hit and defeat frames for the ten bosses (the sheets stop at idle and attack).',
          '10. Sunglaze: two pattern looks per tile colour in 3D (10 models), the thing a hand is made of.', '',
          'Notes: lite copies of every GLB are made by us; deliver only the full-detail GLB. Do not touch Mainhattan Overdrive. Nightrun prompts are listed for its owner. '
          'Where a reference painting exists (meta.ref) feed it to the picture tool so the character stays identical; if the written description and the painting disagree, the painting wins.']
    open('games-src/VARIETY-PLAN.md', 'w', encoding='utf-8').write('\n'.join(L) + '\n')

def wave_rows(G, titles):
    """[(wave, images, 'poses 200, art 100', 'game n, game n')] in run order."""
    W_ = collections.OrderedDict()
    for s, g in G.items():
        for kind, tag in (('poses', 'poses'), ('d3', '3D'), ('art', 'art')):
            for it in g[kind]: W_.setdefault(it['wave'], []).append((s, tag, it['ord']))
    rows = []
    for w in sorted(W_, key=lambda x: (x.startswith('3D'), x)):
        L = W_[w]
        mix = ', '.join(f'{t} {n}' for t, n in collections.Counter(t for _, t, _ in L).most_common())
        first = collections.OrderedDict()
        for s, t, o in sorted(L, key=lambda x: x[2]): first[s] = first.get(s, 0) + 1
        rows.append((w, len(L), mix, ', '.join(f'{titles.get(s, s)} {n}' for s, n in first.items())))
    return rows

def wave_docs(G, titles):
    rows = wave_rows(G, titles)
    tab = ['| Wave | Images | Mix | Games (images) |', '|---|---:|---|---|'] + [f'| {w} | {n} | {m} | {g} |' for w, n, m, g in rows]
    two = sum(n for w, n, _, _ in rows if not w.startswith('3D')); three = sum(n for w, n, _, _ in rows if w.startswith('3D'))
    R = ['# Next wave: prompt files for the laptop', '',
         f'Generated by `python3 games-src/scripts/make-wave7.py` (data: `games-src/scripts/wave7_data.py`, plan: `games-src/VARIETY-PLAN.md`). '
         f'{two} paintings and pose images in 2D waves (Wave 7, 8, 9 ...) and {three} source paintings for 3D in their own track (3D wave A, B ...).', '',
         '## How to run them', '',
         '1. Copy the folders `flow-2d` and `flow-3d` from this folder into the laptop\'s game-art root (the folder that already holds `flow-2d` and `flow-3d`). '
         'They only add `prompts-*.json` files; nothing existing is overwritten.',
         f'2. Run **one wave per day**: every wave is at most {LIMIT} images, the laptop limit per day (`limit` in `games/asset-viewer/flow.json`). '
         'Start with the lowest wave number; the files are ordered by priority, top picks first. A character\'s whole pose set is in one wave, so its poses stay consistent.',
         '3. In each game folder the files for a wave are `prompts-wave<N>.json` (1:1) and `prompts-wave<N>-wide|-43|-34|-tall.json` (16:9, 4:3, 3:4, 9:16). '
         'Run each file with its own ratio; every card already carries the game\'s style block.',
         '4. 3D source paintings are `flow-3d/<game>/prompts-3d-wave<A|B|..>.json` (about 40 per wave, own track, 1:1, light-grey background). `prompts-3d-all.json` lists all of them with the target glb path.',
         '5. Poses and cut-outs ask for a flat chroma colour background: cut them out with `python3 games-src/scripts/cutout.py` (see the note inside each file).',
         '6. The laptop viewer (`flow_status.py`) labels the files by wave and shows the unmade ones as planned. The static copy is refreshed with `python3 games-src/scripts/viewer-plan.py`.', '',
         '## Waves', ''] + tab + ['']
    small = [(w, n) for w, n, _, _ in rows if not w.startswith('3D')]
    if small and three and min(n for _, n in small) + three <= LIMIT:
        w, n = min(small, key=lambda x: x[1])
        R.insert(R.index('## Waves'), f'{w} has only {n} images: on that day the whole 3D track ({three}) fits in the same {LIMIT}, so run the 3D waves with it.\n')
    open(f'{OUT}/README.md', 'w', encoding='utf-8').write('\n'.join(R))
    fs = 'games-src/asset-viewer/flow_status.py'
    t = open(fs, encoding='utf-8').read()
    lst = ', '.join(f'("{w}", {n})' for w, n, _, _ in rows)
    t = re.sub(r'(# PLANNED-BEGIN\n).*?(\n# PLANNED-END)', lambda m: m.group(1) + f'PLANNED_WAVES = [{lst}]' + m.group(2), t, flags=re.S)
    open(fs, 'w', encoding='utf-8').write(t)
    t = open('games-src/VARIETY-PLAN.md', encoding='utf-8').read()
    t = t.replace('## Top 10 to make first', '## Production waves (one per day, at most %d images; 3D is its own track)\n\n' % LIMIT + '\n'.join(tab) + '\n\nOrder inside the 2D waves: the top 10 below, then main board and hand items, then the remaining boss and character poses, then extras. A pose set is never split across waves.\n\n## Top 10 to make first', 1)
    open('games-src/VARIETY-PLAN.md', 'w', encoding='utf-8').write(t)

def main():
    titles = {g['slug']: g['title'] for g in GS.shelf_games()}
    G = build()
    assign_waves(G)
    # drop references that do not exist so the page and the prompt never point at nothing
    miss = []
    for s, g in G.items():
        for k in g:
            for it in g[k]:
                if it['ref'] and not exists(it['ref'][len('games/'):] if it['ref'].startswith('games/') else it['ref']) and not os.path.exists(it['ref']):
                    miss.append(it['ref']); it['ref'] = ''
    counts = write(G, titles)
    plan(G, titles, counts)
    wave_docs(G, titles)
    print('wrote wave prompts:', sum(sum(c.values()) for c in counts.values()), 'items')
    for w, n, mix, games in wave_rows(G, titles): print(f'  {w:10} {n:4}  {mix}')
    for s, c in counts.items(): print(f'  {s:22} poses {c["poses"]:3}  3D {c["3d"]:3}  art {c["art"]:3}')
    if miss: print('references not found (cleared):', sorted(set(miss)))

if __name__ == '__main__':
    main()
