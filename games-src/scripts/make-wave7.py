#!/usr/bin/env python3
"""Wave 7 prompt generator: pose sets, 3D variety and art variety for the shelf games (not Overdrive).

Reads  games-src/scripts/wave7_data.py (what to add per game; edit that file, not the output).
Writes (laptop prompt files, same schema as prompts-wave6*.json: {"cards": {name: prompt}, "style": ...} plus "notes" and "meta")
  games-src/next-wave/flow-2d/<slug>/prompts-wave7-poses.json
  games-src/next-wave/flow-2d/<slug>/prompts-wave7-variety[-wide|-43|-34|-tall].json   (one file per ratio)
  games-src/next-wave/flow-3d/<slug>/prompts-wave7-3d.json
  games-src/next-wave/prompts-wave7-3d.json   all 3D sources in one list, with target games/<slug>/models/<item>.glb
  games-src/VARIETY-PLAN.md                    per game: why each group helps, priority, count
next-wave.py reads the "meta" of these files and shows them on games/next-wave.html (tags Poses, 3D variety, Art variety).

Run: python3 games-src/scripts/make-wave7.py   then   python3 games-src/scripts/next-wave.py
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

def write(G, titles):
    st = styles()
    for d in ('flow-2d', 'flow-3d'):
        for dp, dn, fn in os.walk(f'{OUT}/{d}'):
            for f in fn:
                if f.startswith('prompts-wave7'): os.remove(os.path.join(dp, f))
    allx = {'cards': {}, 'targets': {}, 'style': 'see each game folder (flow-3d/<slug>/prompts-wave7-3d.json)',
            'notes': W3NOTE, 'meta': {}}
    counts = {}
    for slug, g in G.items():
        style = st.get(slug, '')
        c = counts[slug] = collections.Counter()
        for kind, root, tag in (('poses', 'flow-2d', 'poses'), ('d3', 'flow-3d', '3d'), ('art', 'flow-2d', 'art')):
            by = collections.defaultdict(dict)
            for it in g[kind]:
                meta = {k: it[k] for k in ('element', 'why', 'pri', 'ref', 'thumb', 'bg', 'align', 'save_as', 'target', 'size', 'ratio')}
                if it.get('group'): meta['group'] = it['group']
                meta['tag'] = tag
                if kind == 'poses': name = f'wave7-poses'
                elif kind == 'd3': name = 'wave7-3d'
                else: name = 'wave7-variety' + RATIO_SUFFIX[it['ratio']]
                by[name][it['stem']] = (it['prompt'], meta)
                c[tag] += 1
            for name, cards in by.items():
                d = f'{OUT}/{root}/{slug}'
                os.makedirs(d, exist_ok=True)
                doc = {'cards': {k: v[0] for k, v in cards.items()}, 'style': style, 'notes': NOTES[tag], 'meta': {k: v[1] for k, v in cards.items()}}
                if tag == '3d': doc['targets'] = {k: v[1]['target'] for k, v in cards.items()}
                with open(f'{d}/prompts-{name}.json', 'w', encoding='utf-8') as f: json.dump(doc, f, ensure_ascii=False, indent=1); f.write('\n')
                if tag == '3d':
                    for k, v in cards.items():
                        allx['cards'][f'{slug}--{k}'] = v[0]; allx['targets'][f'{slug}--{k}'] = v[1]['target']; allx['meta'][f'{slug}--{k}'] = dict(v[1], slug=slug)
    with open(f'{OUT}/prompts-wave7-3d.json', 'w', encoding='utf-8') as f: json.dump(allx, f, ensure_ascii=False, indent=1); f.write('\n')
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
         'Generated by `python3 games-src/scripts/make-wave7.py` from `games-src/scripts/wave7_data.py`. Prompts: `games-src/next-wave/flow-2d/<game>/prompts-wave7-poses.json`, '
         '`prompts-wave7-variety[-wide|-43|-34|-tall].json`, `flow-3d/<game>/prompts-wave7-3d.json` and the combined `games-src/next-wave/prompts-wave7-3d.json` (target `games/<slug>/models/<item>.glb`). '
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

def main():
    titles = {g['slug']: g['title'] for g in GS.shelf_games()}
    G = build()
    # drop references that do not exist so the page and the prompt never point at nothing
    miss = []
    for s, g in G.items():
        for k in g:
            for it in g[k]:
                if it['ref'] and not exists(it['ref'][len('games/'):] if it['ref'].startswith('games/') else it['ref']) and not os.path.exists(it['ref']):
                    miss.append(it['ref']); it['ref'] = ''
    counts = write(G, titles)
    plan(G, titles, counts)
    print('wrote wave 7 prompts:', sum(sum(c.values()) for c in counts.values()), 'items')
    for s, c in counts.items(): print(f'  {s:22} poses {c["poses"]:3}  3D {c["3d"]:3}  art {c["art"]:3}')
    if miss: print('references not found (cleared):', sorted(set(miss)))

if __name__ == '__main__':
    main()
