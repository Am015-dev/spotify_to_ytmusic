#!/usr/bin/env python3
"""On-foot street stage art list. Rerunnable; the single source for
  - the 'On-foot street stage' entries of assets-manifest.json (placeholders: python3 games-src/nightrun/make-placeholders.py),
  - games-src/nightrun/FOOT-FLOW-PROMPTS.md (the owner's paste list),
  - games-src/next-wave/flow-2d/mainhattan-nightrun/prompts-foot.json ({"cards": {name: prompt}}).
  python3 games-src/nightrun/make-foot-assets.py
Names: media/foot/<who>-<pose>.webp (1024x1024 transparent, facing right), foot/bg-<layer>.webp (2048x1024), foot/pk-<id>.webp (128), foot/sc-<id>.webp (256).
The game draws a coloured shape in code (parts/street/footart.js) until the file is real art and listed in media/ready.json."""
import json, os
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.normpath(os.path.join(HERE, '..', '..'))
GROUP = 'On-foot street stage'
STYLE = ('Painted cyberpunk Frankfurt 2099, hand-painted game art, rain, teal and magenta neon, readable silhouettes, '
         'crisp dark outline, chunky shapes that read at small size')
POSES = ['idle', 'run-a', 'run-b', 'jump', 'fall', 'shoot', 'melee', 'hit', 'die', 'crouch', 'crouch-shoot']
# who: (title, design for the character sheet, kind, extra pose text overrides)
CH = {
 'kai': ('Kai, the courier (hero)', 'a young courier in a dark hooded jacket with teal neon piping, a data satchel on the back, boots, fingerless gloves and a compact pistol; lean, quick, determined', 'h', {}),
 'grunt': ('Grunt, street thug', 'a street thug in a torn orange-brown jacket and cap, holding a steel pipe; scruffy, angry, average build', 'h',
           {'shoot': 'hurling the steel pipe forward with a straight throwing arm (pipe in mid-air in front of the hand)'}),
 'gunman': ('Gunman, gang shooter', 'a gang shooter in a red-and-black jacket with a bandana, holding a pistol; cocky stance', 'h', {}),
 'shield': ('Shield, riot cop', 'a riot cop in blue armour with a helmet and a big transparent blue riot shield in the front hand and a baton in the other; bulky and slow', 'h',
            {'shoot': 'thrusting the baton forward from behind the riot shield (a shield bash), shield held forward'}),
 'bruiser': ('Bruiser, heavy', 'a very big heavy enforcer in a purple vest with a huge glowing cyan cyber arm and a small head; wide, slow, intimidating', 'h',
             {'shoot': 'punching the cyber arm straight forward, a cyan shockwave ring at the fist'}),
 'knife': ('Knife, gang runner', 'a thin gang runner in a green hoodie with a headband holding a combat knife low; fast and twitchy', 'h',
           {'shoot': 'throwing the knife forward with a straight throwing arm (knife in mid-air in front of the hand)'}),
 'sniper': ('Sniper, rooftop marksman', 'a rooftop marksman in a yellow-and-brown long coat with a scope visor and a long rifle; patient, still', 'h', {}),
 'drone': ('Drone, hover gun', 'a small hovering security drone: a rounded teal body, a red eye, two spinning rotors on top and a gun nub below, no legs', 'm',
           {'idle': 'hovering in place, rotors blurred, red eye glowing', 'shoot': 'firing its gun forward, muzzle flash, eye flaring white', 'hit': 'flashing white from a hit, rotors wobbling',
            'die': 'exploding in a fireball, pieces and sparks flying, falling'}),
 'turret': ('Turret, street gun', 'a short armoured turret on a wide base with a round pink dome and a long gun barrel pointing right; bolted to the ground', 'm',
            {'idle': 'standing still, barrel slightly raised, a small red light blinking', 'shoot': 'firing the barrel forward, muzzle flash, small recoil', 'hit': 'flashing white from a hit, sparks',
             'die': 'blowing up in a fireball, dome flying off, smoke'}),
 'mech': ('Mech, walker', 'a two-legged steel-grey security mech with a boxy torso, a cyan cockpit window and a big arm cannon on the right; heavy, human-height plus', 'm',
          {'idle': 'standing, slight sway, cannon lowered', 'shoot': 'firing the arm cannon forward, big muzzle flash, braced legs', 'hit': 'flashing white from a hit, staggered',
           'die': 'exploding, torso breaking apart, fireball and sparks'}),
 'warden': ('Warden, corporate enforcer (boss)', 'a huge armoured corporate enforcer: red-and-black heavy plate armour with gold trim, gold shoulder pads, a horned visor helmet, a long dark cape and a glowing gold energy blade; towering, calm, menacing', 'b',
            {'shoot': 'leaning forward and firing a gold energy bolt from the blade held out, flash at the tip', 'melee': 'slashing the energy blade in a wide arc, motion trail'}),
}
MACH_POSES = ['idle', 'shoot', 'hit', 'die']
BOSS_EXTRA = {'attack2': ('overhead slam: both hands raising the energy blade above the head, then bringing it down hard, motion trail (draw the strike moment)', 'second attack'),
              'enrage': ('enraged roar, arms wide, red cracks of glowing energy across the armour, a red aura around the body', 'phase 3 enrage')}
POSE_TX = {
 'idle': 'standing relaxed in a ready stance, weapon held low, weight on both feet',
 'run-a': 'running, mid-stride with the FRONT leg stretched forward and the back leg pushing off, leaning forward, arms swinging (contact frame of a run cycle)',
 'run-b': 'running, the OPPOSITE stride to the first running frame: back leg passing under the body, other leg bent up (passing frame of a run cycle), leaning forward',
 'jump': 'jumping up, knees tucked, one arm up, weapon arm forward',
 'fall': 'falling down, legs dangling slightly apart, arms raised, clothes pulled upward',
 'shoot': 'standing and aiming the weapon straight forward with a stiff arm, muzzle flash at the tip',
 'melee': 'swinging the weapon in a hard forward attack, body lunging, motion trail',
 'hit': 'flinching from a hit: head and chest thrown back, arms flung out, pained face',
 'die': 'collapsing backwards, nearly horizontal in the air, weapon dropping from the hand',
 'crouch': 'crouched low behind cover, knees deeply bent, body leaning forward, weapon held ready',
 'crouch-shoot': 'crouched low and aiming the weapon straight forward, muzzle flash at the tip',
}
BG = {
 'sky': ('opaque', 'the night sky over a rainy cyberpunk Frankfurt: dark violet at the top to magenta-teal haze at the horizon, low rain clouds, a pale pink moon, a few stars; NO buildings, NO ground; the bottom edge glows magenta'),
 'far': ('transparent', 'a distant skyline of dark purple tower silhouettes with many small lit windows (cyan and amber), antenna lights, haze at the base; the sky above the towers is flat plain white (to be cut out); the towers stand on the bottom edge'),
 'mid': ('transparent', 'mid-distance city buildings, dark violet with big neon signs in magenta, cyan and amber, lit windows, fire escapes; everything above the roofs is flat plain white (to be cut out); buildings stand on the bottom edge'),
 'near': ('transparent', 'foreground street props along the bottom edge only: lamp posts with warm glowing lamps, rubbish bins, rolled-down shop shutters with neon trim, wet reflections; the rest of the picture is flat plain white (to be cut out)'),
 'floor': ('transparent', 'the street surface as a flat strip at the very bottom fifth: dark wet asphalt with a pavement edge, dashed road markings and neon puddle reflections in magenta and teal; the upper four fifths are flat plain white (to be cut out)'),
}
PK = {'weapon-hmg': 'a heavy machine gun', 'weapon-shotgun': 'a pump shotgun', 'weapon-flame': 'a flamethrower with a flame', 'weapon-rocket': 'a rocket launcher with a rocket', 'weapon-arc': 'an arc gun with blue lightning',
      'shield': 'a glowing blue energy shield badge', 'speed': 'a green speed boost lightning bolt arrow', 'damage': 'a red damage-boost fist or flame glyph', 'magnet': 'a purple horseshoe magnet',
      'heal': 'a green health cross', 'bomb': 'a round black bomb with a lit fuse', 'slow': 'a grey-blue snail or hourglass slow-time glyph'}
SC = {'crate': 'a stacked wooden shipping crate with metal corners', 'neon-sign': 'a wall-mounted neon sign board with an abstract magenta and cyan glyph (no letters)', 'vending': 'a street vending machine glowing cyan, with a lit window of drinks (no text)',
      'door': 'a steel service door with an amber warning light above it', 'barrel': 'a dented green chemical barrel with a hazard stripe'}
CHAR_RULES = '1024x1024, flat plain white background, character facing right, full body, feet near the bottom edge, no text, no letters, no logos'

def poses_of(k): return POSES if CH[k][2] == 'h' else (MACH_POSES if CH[k][2] == 'm' else POSES + list(BOSS_EXTRA))
def sheet(k):
    t, d, kind, _ = CH[k]
    return 'Character reference sheet of %s: %s. One full-body front-three-quarter pose facing right, neutral stance, plus a small colour palette strip. 1024x1024, flat plain white background, no text.' % (t, d)
def pose_prompt(k, p):
    t, d, kind, ov = CH[k]
    if p in BOSS_EXTRA: tx = BOSS_EXTRA[p][0]
    else: tx = ov.get(p, POSE_TX[p] if kind != 'm' else POSE_TX['idle'])
    return 'Same character as the reference (%s), %s. Keep the same design, colours, proportions and painted style as the reference. %s.' % (t, tx, CHAR_RULES)

cards, entries, rows = {}, [], []  # rows: (section, name, file, size, prompt)
def add(card, file, w, h, kind, where, notes, prompt, section):
    cards[card] = prompt
    entries.append(dict(file=file, w=w, h=h, group=GROUP, status='RESERVED', where=where, notes=notes, kind=kind, why='On-foot street stage art (placeholders drawn in code until this exists)', prompt=STYLE + '. ' + prompt))
    rows.append((section, card, file, '%dx%d' % (w, h), prompt))
for k in CH:
    t, d, kind, _ = CH[k]
    cards['foot-%s-sheet' % k] = sheet(k); rows.append((t, 'foot-%s-sheet' % k, '(reference only, not saved in the game: paint this FIRST, then use it as the reference for every pose)', '1024x1024', sheet(k)))
    for p in poses_of(k):
        who = 'Kai (hero)' if k == 'kai' else ('boss ' + t.split(',')[0] if kind == 'b' else 'enemy ' + t.split(',')[0])
        add('foot-%s-%s' % (k, p), 'foot/%s-%s.webp' % (k, p), 1024, 1024, 'sprite',
            'On-foot street stage (parts/street/footart.js FA.draw): %s, pose %s (a coloured placeholder figure with initials until this exists)' % (who, p),
            'Facing RIGHT, full body, feet at the bottom edge, transparent background (we cut the white out), 1024x1024. Same character as %s, pose: %s.' % (t, BOSS_EXTRA[p][0] if p in BOSS_EXTRA else POSE_TX[p]),
            pose_prompt(k, p), t)
for L, (tr, tx) in BG.items():
    add('foot-bg-%s' % L, 'foot/bg-%s.webp' % L, 2048, 1024, 'layer', 'On-foot street stage parallax layer %s (FA.bg; procedural shapes until this exists)' % L,
        '2:1 landscape, %s. %s. Must tile seamlessly left to right. The street line (where feet stand) is at 80%% of the height.' % (tr, tx),
        'Side-view background layer for a run-and-gun game, 2048x1024 landscape, seamless horizontal tiling: %s. No characters, no text, no letters.' % tx, 'Backgrounds')
for i, tx in PK.items():
    add('foot-pk-%s' % i, 'foot/pk-%s.webp' % i, 128, 128, 'icon', 'On-foot street stage pickup %s (FA.pickup; a coloured badge with a letter until this exists)' % i,
        'Square 128x128 pickup icon, transparent, same painted look as the pk-*.webp icons: %s on a dark round bezel with a neon rim. Paint at 1024x1024.' % tx,
        'A single game pickup icon: %s on a dark round gunmetal bezel with a glowing neon rim, centred, flat plain white background, 1024x1024, no text, no letters.' % tx, 'Pickups')
for i, tx in SC.items():
    add('foot-sc-%s' % i, 'foot/sc-%s.webp' % i, 256, 256, 'sprite', 'On-foot street stage scenery %s (FA.scenery; a plain box until this exists)' % i,
        'Square 256x256 street prop, transparent, side view, base on the bottom edge: %s. Paint at 1024x1024.' % tx,
        'A single street prop for a side-view game: %s. Side view, the base touching the bottom edge, flat plain white background, 1024x1024, no text, no letters.' % tx, 'Scenery')

# manifest: replace the group, keep every other entry untouched
mp = os.path.join(HERE, 'assets-manifest.json'); M = [e for e in json.load(open(mp, encoding='utf-8')) if e['group'] != GROUP] + entries
json.dump(M, open(mp, 'w', encoding='utf-8'), indent=1, ensure_ascii=False); open(mp, 'a').write('\n')
# next-wave prompt file
pj = os.path.join(ROOT, 'games-src', 'next-wave', 'flow-2d', 'mainhattan-nightrun', 'prompts-foot.json'); os.makedirs(os.path.dirname(pj), exist_ok=True)
json.dump({'cards': cards, 'style': STYLE, 'notes': 'On-foot street stage. Paint each character sheet first (foot-<who>-sheet), then every pose with the sheet as the reference. Save-as names are in FOOT-FLOW-PROMPTS.md.'}, open(pj, 'w', encoding='utf-8'), indent=1, ensure_ascii=False)
# markdown for the owner
out = ['# On-foot street stage: prompts for the picture tool', '', 'Generated by `make-foot-assets.py` (rerun it after changing a design). **%d game files** + %d reference sheets. The game already runs with coloured placeholder figures; each real picture replaces its placeholder automatically.' % (len(entries), len(CH)), '',
       '## How', '', '1. Paste the **style block** first (or put it in front of every prompt).', '2. For each character paint its **sheet** first and keep it as the reference image.',
       '3. Paint every pose of that character with the sheet attached; every pose prompt says "same character as the reference".', '4. Characters: 1024x1024, flat plain white background, facing right, full body, no text. Cut the white out (`games-src/scripts/cutout.py`), convert to webp.',
       '5. Save as the exact name in the table into `games/mainhattan-nightrun/media/foot/`, run `python3 games-src/nightrun/make-placeholders.py` (lists it in `media/ready.json`) and commit.', '',
       '## Style block', '', '> ' + STYLE, '', 'Lists: `games-src/next-wave/flow-2d/mainhattan-nightrun/prompts-foot.json` (same prompts, `{"cards": {name: prompt}}`).', '']
sec = None
for s, name, f, size, pr in rows:
    if s != sec: out += ['', '## ' + s, '']; sec = s
    out += ['**`%s`** (%s) save as `%s`' % (name, size, f), '', '> ' + pr, '']
open(os.path.join(HERE, 'FOOT-FLOW-PROMPTS.md'), 'w', encoding='utf-8').write('\n'.join(out))
print('manifest entries added:', len(entries), '| sheets:', len(CH), '| total manifest:', len(M))
