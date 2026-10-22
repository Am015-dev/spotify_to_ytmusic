#!/usr/bin/env python3
"""Effects asset wave 8 for Mainhattan Nightrun. Rerunnable; the single source for
  - the 'Effects (wave 8)' group of assets-manifest.json (placeholders: python3 games-src/nightrun/make-placeholders.py),
  - games-src/nightrun/FX-FLOW-PROMPTS.md (the owner's paste list),
  - games-src/next-wave/flow-2d/mainhattan-nightrun/prompts-fx.json ({"cards": {name: prompt}}).
  python3 games-src/nightrun/make-fx-assets.py
Background rule (written into every prompt): light and glow effects are painted on a pure solid BLACK square (media/ loader keys the black to
transparency at load, parts/art/art.js); solid objects (bomb, mine, grenade, blades, debris) on a plain flat WHITE background (ingest-assets.py keys it).
The game keeps its own look until a file is REAL art and listed in media/ready.json (parts/art/fxwave.js: FXW.pic)."""
import json, os
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.normpath(os.path.join(HERE, '..', '..'))
GROUP = 'Effects (wave 8)'
STYLE = 'Painted cyberpunk, glowing energy, hand-painted game effect, crisp bright core with soft glowing edges, no text, no letters, no characters'
BLK = 'on a pure solid black background'
WHT = 'on a plain flat white background'
E = []          # entries
def add(file, w, h, status, where, notes, desc, bg='black', c='#ffffff', shape='orb', face=None, section='', hook=''):
    stem = file.rsplit('.', 1)[0]
    rule = BLK if bg == 'black' else WHT
    pos = {'right': 'facing right, pointing to the right, ', 'centre': 'centred, ', 'tile': 'tileable left to right, ', None: ''}[face]
    sz = '%dx%d' % (w, h)
    prompt = '%s, %s, %s%s, soft transparent-friendly edges, no characters, no text, no letters.' % (desc[0].upper() + desc[1:].rstrip('.'), rule, pos, sz)
    e = dict(file=file, w=w, h=h, group=GROUP, status=status, where=where, notes=notes, kind='fx', bg=bg, why='Effects asset wave 8 (owner, 18 Oct 2026)', ph=dict(c=c, shape=shape))
    if status == 'PLACEHOLDER' or hook == 'needs-file': e['prompt'] = prompt
    e['section'] = section
    if hook == 'needs-file': e['noph'] = True
    E.append(e)

# ---------------------------------------------------------------- 1. per player weapon (ids and colours = WPD in g.js / wpx.js)
W = [  # id, colour, name, bullet, muzzle, hit, bullet bg, bullet shape
 ('pulse', '#ff8ad8', 'Pulse Spread', 'a short fat pink energy pellet with a hot white core and a small comet tail', 'a small pink star-shaped muzzle flash fanning to the right', 'a pink starburst impact with short spikes and sparkles', 'black', 'streak'),
 ('laser', '#7dffd8', 'Laser Lance', 'a long thin mint-green laser lance segment, a razor-bright white core and a soft mint halo, fading at both ends', 'a narrow mint flare shooting right with a ring at the barrel', 'a mint-green ring and a bright flash where a beam pierces through', 'black', 'beam'),
 ('swarm', '#ffb020', 'Homing Swarm', 'a small amber homing missile seen from the side, glowing exhaust flame and a short smoke-glow trail behind it', 'a puff of amber flame and sparks', 'a small amber fireball with a ring of tiny sparks', 'black', 'missile'),
 ('beat', '#ffe14d', 'Beat Cannon', 'a heavy round yellow cannon shell glowing white-hot, a pulsing shockwave arc around its front and a thick gold trail', 'a big gold muzzle blast with a speed ring', 'a heavy yellow explosion flash with a bold shockwave ring', 'black', 'orb'),
 ('arc', '#8fe9ff', 'Arc Chain', 'a jagged cyan lightning bolt segment with forks and a white core, horizontal', 'a small crackle of cyan electric sparks', 'a branching cyan electric burst with a bright white centre', 'black', 'bolt'),
 ('orbit', '#b6ff5a', 'Orbit Blades', 'a single curved lime-green energy blade (crescent) with a glowing edge', 'a quick lime-green swish of light', 'a lime-green slash mark with sparks', 'white', 'blade'),
 ('disc', '#ff7a45', 'Ricochet Disc', 'a round razor-edged orange disc with a notched rim, spinning, motion arcs around it', 'a small orange spark flash', 'an orange spark shower from a bounce, a bright flash ring', 'white', 'disc'),
 ('mine', '#c08aff', 'Mine Layer', 'a round purple proximity mine with a blinking glow and little spikes', 'a soft purple drop-ring flash', 'a purple blast with a ring and floating shards', 'white', 'mine'),
 ('frost', '#9fe8ff', 'Frost Beam', 'an icy pale-blue beam segment with ice crystals along it, white-blue glow', 'a frosty pale-blue puff with snow sparkles', 'a frozen burst of ice crystals and a pale-blue ring', 'black', 'beam'),
 ('flame', '#ff5a2d', 'Flame Arc', 'a short licking jet of orange-red flame flying right, yellow core, ember sparks', 'a roaring orange-red flame burst', 'a small burning fireball splash with embers', 'black', 'streak'),
 ('wave', '#5b8cff', 'Plasma Wave', 'a big crescent blue plasma wave front curving to the right, white-blue edge, soft glow', 'a blue plasma ripple ring', 'a blue plasma splash ring with droplets of light', 'black', 'crescent'),
 ('shell', '#ffa94d', 'Shrapnel Shell', 'a stubby orange shell with a bright tip and a small flame, fragments of light flying off it', 'an orange cone of flame and sparks', 'an orange burst of flying fragments', 'white', 'shell'),
 ('drone', '#e6a8ff', 'Echo Drone', 'a lilac echo pulse bolt with two fainter copies trailing behind it', 'a lilac double-ring flash', 'a lilac ripple with a ghost ring', 'black', 'streak'),
 ('well', '#7a4dff', 'Gravity Well', 'a swirling violet orb with an inward spiral, dark centre and bright rim', 'a violet swirl opening to the right', 'a violet implosion ring with sparks pulled in', 'black', 'orb'),
 ('rail', '#ff3d6a', 'Rail Sniper', 'a very bright crimson-white rail bolt, long and needle-sharp, with a thin trail', 'a crimson flash with a shock ring', 'a crimson pierce flash with a hard white spike', 'black', 'beam'),
 ('storm', '#fff06a', 'Storm Cell', 'a crackling yellow electric storm ball with small lightning arcs around it', 'a yellow spark burst', 'a yellow lightning burst with arcs', 'black', 'orb'),
]
for (i, col, name, b, m, h, bg, sh) in W:
    add('fx-w-%s-bullet.webp' % i, 256, 256, 'PLACEHOLDER', 'Hooked: FXW.bullet in the player-shot draw (parts/hud/c.js shotDraw) when a %s shot flies' % name, '%s: the shot, facing right, centred. Painted colour matches the weapon colour %s.' % (name, col),
        'a game projectile for the weapon %s: %s, facing right, centred' % (name, b), bg, col, sh, 'right', 'Weapons: ' + name)
    add('fx-w-%s-muzzle.webp' % i, 256, 256, 'PLACEHOLDER', 'Hooked: FXW.muzzle on every volley of the equipped %s (replaces the shared fx-muzzle)' % name, '%s muzzle flash at the gun, pointing right, base at the left-centre edge.' % name,
        'a muzzle flash for the weapon %s: %s, the flash starting at the left-centre edge and pointing right' % (name, m), 'black', col, 'burst', 'right', 'Weapons: ' + name)
    add('fx-w-%s-hit.webp' % i, 256, 256, 'PLACEHOLDER', 'Hooked: FXW.hit when a %s shot hits an enemy (replaces fx-hit-spark)' % name, '%s impact burst, centred.' % name,
        'an impact effect for the weapon %s: %s, centred' % (name, h), 'black', col, 'burst', 'centre', 'Weapons: ' + name)

# ---------------------------------------------------------------- 2. explosions
LOOKS = {'fire': ('#ff9a2d', 'orange-yellow fire with a white-hot core and black-red smoke edges'), 'electric': ('#4fe6ff', 'cyan-white electric blast with crackling lightning arcs'), 'plasma': ('#c46bff', 'magenta-violet plasma blast with a glowing ring and drifting energy sparks')}
SIZES = {'small': (256, 'a small, quick explosion for a drone'), 'medium': (512, 'a medium explosion for a gunship or a mine'), 'large': (512, 'a large, dramatic explosion with a shockwave ring')}
for s in ('small', 'medium', 'large'):
    for lk in ('fire', 'electric', 'plasma'):
        px = SIZES[s][0]; c, ld = LOOKS[lk]
        add('fx-boom-%s-%s.webp' % (s, lk), px, px, 'PLACEHOLDER', 'Hooked: FXW.boom (enemy death, by size; look = %s)%s' % (lk, ' default look' if lk == 'fire' else (' when the kill was by arc or storm' if lk == 'electric' else ' when the kill was by laser, rail, frost, wave or well')),
            'Explosion, %s, %s look. Burst centred, fills the square, fades to black at the edges.' % (s, lk), '%s: %s, centred burst filling the square' % (SIZES[s][1], ld), 'black', c, 'burst', 'centre', 'Explosions')
add('fx-boom-boss-a.webp', 512, 512, 'PLACEHOLDER', 'Hooked: FXW.boom (boss death, final blast; alternates with boss-b)', 'Giant boss explosion A: a huge orange-white fireball with a shockwave ring.', 'a giant boss explosion: huge orange-white fireball, a thick expanding shockwave ring and flying embers, centred', 'black', '#ffb040', 'burst', 'centre', 'Explosions')
add('fx-boom-boss-b.webp', 512, 512, 'PLACEHOLDER', 'Hooked: FXW.boom (boss death, final blast; alternates with boss-a)', 'Giant boss explosion B: a cold magenta-cyan energy implosion-then-burst.', 'a giant boss explosion in cold colours: a magenta and cyan energy blast with a bright white core, a ring and long streaking sparks, centred', 'black', '#ff4dd0', 'burst', 'centre', 'Explosions')
add('fx-boom-ground-dust.webp', 512, 512, 'PLACEHOLDER', 'No hook yet (for ground enemies in a later wave)', 'Soft dust and smoke puff for ground explosions, lit from within.', 'a soft puff of grey-orange dust and smoke lit by a fiery glow, centred, rising slightly', 'black', '#c8a070', 'burst', 'centre', 'Explosions')
add('fx-boom-debris.webp', 512, 512, 'PLACEHOLDER', 'No hook yet (debris pieces flying out of big kills)', 'A cluster of 6 metal debris pieces (plates, bolts) with a hot orange edge, scattered, as a sprite sheet-free single picture.', 'a scatter of six torn metal fragments and plates with glowing orange edges, in a ring around the centre', 'white', '#a0a8b8', 'debris', 'centre', 'Explosions')

# ---------------------------------------------------------------- 3. enemy fire (the new enemies from parts/enemies/zoo.js)
add('fx-eb-sniper-beam.webp', 256, 64, 'PLACEHOLDER', 'Hooked: FXW.sniper (the sniper aim line in ZOO.over, stretched along the aim)', 'Tileable red-lime laser line, bright core, soft glow, horizontal, stretched to the player.', 'a thin horizontal sniper laser line, a bright red-white core and a soft red glow, tileable left to right', 'black', '#ff3050', 'line', 'tile', 'Enemy fire')
add('fx-eb-bomb.webp', 256, 256, 'PLACEHOLDER', 'Hooked: FXW.bomb (the bomber\'s bomb, in ZOO.over)', 'A round black bomb with a glowing orange fuse spark, seen from the side.', 'a round black cyberpunk bomb with an orange glowing band and a sparking fuse, seen from the side', 'white', '#ffa02d', 'mine', 'centre', 'Enemy fire')
add('fx-eb-mine.webp', 256, 256, 'PLACEHOLDER', 'Hooked: FXW.mine (the minelayer\'s mine, in ZOO.over; armed mines glow, unarmed are dimmed)', 'A spiked lime-green mine with a red blinking light.', 'a round spiked proximity mine in dark metal with lime-green glowing lights and a small red blinking light, seen from above', 'white', '#d8ff3d', 'mine', 'centre', 'Enemy fire')
add('fx-eb-shield-bubble.webp', 512, 512, 'PLACEHOLDER', 'Hooked: FXW.bubble (the shielder\'s front bubble, drawn as an arc facing its aim)', 'A cyan energy bubble, hexagon pattern, brighter at the rim, empty centre, facing right.', 'a glowing cyan energy shield bubble, a faint hexagon pattern, bright rim, transparent dark centre, a circle filling the square', 'black', '#4ad1ff', 'ring', 'centre', 'Enemy fire')
add('fx-eb-rocket-trail.webp', 512, 128, 'PLACEHOLDER', 'No hook yet (enemy rockets; fx-bullet-rocket is the head)', 'Smoke-fire trail, bright at the right (head) end, fading to the left.', 'a rocket exhaust trail, white-yellow at the right end fading through orange to dark red smoke at the left end, horizontal', 'black', '#ff8040', 'streak', 'right', 'Enemy fire')
add('fx-eb-plasma.webp', 256, 256, 'PLACEHOLDER', 'No hook yet (boss and gunship plasma balls)', 'A lime-pink plasma ball with a swirling core, round, centred.', 'a round enemy plasma ball, a swirling lime-green and hot pink core with a dark outline ring and a soft glow, centred', 'black', '#9dff3a', 'orb', 'centre', 'Enemy fire')
add('fx-eb-laser-sweep.webp', 512, 64, 'PLACEHOLDER', 'No hook yet (boss laser sweeps)', 'A wide sweeping boss laser, bright white core, red edges, horizontal and tileable.', 'a wide boss laser beam, a white core and red-orange edges with small energy ripples, horizontal, tileable left to right', 'black', '#ff3050', 'line', 'tile', 'Enemy fire')
add('fx-eb-shockwave-ring.webp', 512, 512, 'PLACEHOLDER', 'No hook yet (boss and bomber ring blasts)', 'A thin bright expanding ring, red-orange, even thickness, centred.', 'a thin bright red-orange shockwave ring with a soft glow, perfectly circular, centred, filling the square', 'black', '#ff5a3a', 'ring', 'centre', 'Enemy fire')
add('fx-eb-heal-ring.webp', 512, 512, 'PLACEHOLDER', 'Hooked: FXW.healRing (the healer\'s dashed ring in ZOO.over)', 'A green healing ring with small plus signs drifting around it, soft glow.', 'a soft green healing aura ring with tiny glowing plus shapes around it, circular, centred, filling the square', 'black', '#3dffb0', 'ring', 'centre', 'Enemy fire')
add('fx-eb-aim-line.webp', 256, 32, 'PLACEHOLDER', 'Hooked: FXW.aim (the kamikaze\'s dive line in ZOO.over)', 'A dashed red warning line, tileable.', 'a thin red warning aim line made of glowing dashes, horizontal, tileable left to right', 'black', '#ff3050', 'line', 'tile', 'Enemy fire')

# ---------------------------------------------------------------- 4. power-up and meter effects (parts/powers/powerups.js, power.js, powlevels.js)
add('fx-pw-nova-ring.webp', 512, 512, 'PLACEHOLDER', 'Hooked: FXW.nova (the downbeat nova ring in powerups.js, scaled with its radius)', 'A magenta energy ring, thick and bright, empty centre, soft outer glow.', 'a thick glowing magenta-pink energy ring with a white inner edge, circular, empty centre, soft outer glow, filling the square', 'black', '#ff5fd2', 'ring', 'centre', 'Power-ups')
add('fx-pw-echo-ghost.webp', 256, 256, 'PLACEHOLDER', 'Hooked: FXW.echo (the ghost shot of the echo power)', 'A cyan ghost of a small ship shot with a trailing echo, facing right.', 'a translucent cyan ghost bolt with two fading echo copies behind it, facing right, centred', 'black', '#7df9ff', 'streak', 'right', 'Power-ups')
add('fx-pw-magnet-field.webp', 512, 512, 'PLACEHOLDER', 'Hooked: FXW.magnet (the magnet bass pulse ring)', 'A blue-violet pulse ring with inward-curving field lines.', 'a blue-violet magnetic pulse: a glowing ring with curved field lines flowing inwards, circular, centred', 'black', '#7a8cff', 'ring', 'centre', 'Power-ups')
add('fx-pw-wingmate-trail.webp', 256, 64, 'PLACEHOLDER', 'Hooked: FXW.wing (trail behind each wingmate drone)', 'A short golden engine trail, bright at the right end, fading left.', 'a short golden-yellow engine trail for a small drone, bright at the right end fading to nothing at the left, horizontal', 'black', '#ffd23d', 'streak', 'right', 'Power-ups')
add('fx-pw-shield-bubble.webp', 512, 512, 'PLACEHOLDER', 'No hook yet (the shield power around the ship)', 'A pale blue-white energy bubble around the ship, hex pattern, bright rim.', 'a pale blue-white energy bubble, a faint hexagon pattern, bright rim, almost transparent centre, a circle filling the square', 'black', '#9fd8ff', 'ring', 'centre', 'Power-ups')
add('fx-pw-crescendo-glow.webp', 512, 512, 'PLACEHOLDER', 'Hooked: FXW.cresc (the crescendo arcs around the ship)', 'A warm gold glow made of rising arcs, soft, centred.', 'a warm golden glow made of three nested rising arcs, soft, centred, filling the square', 'black', '#ffb020', 'ring', 'centre', 'Power-ups')
add('fx-pw-fever-aura.webp', 512, 512, 'PLACEHOLDER', 'No hook yet (the fever meter aura round the ship)', 'A flame-like magenta-orange aura, rising flames, centred.', 'a fiery magenta and orange aura with rising flame tongues, centred, soft, filling the square', 'black', '#ff4a8a', 'burst', 'centre', 'Power-ups')
add('fx-pw-pickup-glow.webp', 512, 512, 'PLACEHOLDER', 'No hook yet (glow under every pickup)', 'A soft round white-gold glow with 4 tiny sparkles, centred.', 'a soft round white-gold glow with four tiny sparkle stars around it, centred', 'black', '#fff0a0', 'orb', 'centre', 'Power-ups')
add('fx-pw-level-up.webp', 512, 512, 'PLACEHOLDER', 'No hook yet (weapon level-up flash)', 'A rising golden burst, a ring and light rays pointing up.', 'a rising golden level-up burst: a ring with light rays and small up arrows of light, centred', 'black', '#ffe14d', 'burst', 'centre', 'Power-ups')
add('fx-pw-bomb-pulse.webp', 512, 512, 'PLACEHOLDER', 'No hook yet (EMP bomb pulse; the shared fx-shockwave is used today)', 'A big electric-blue pulse ring with crackling edges.', 'a large electric blue-white pulse ring with crackling lightning on its edge, circular, centred, filling the square', 'black', '#58b8ff', 'ring', 'centre', 'Power-ups')

# ---------------------------------------------------------------- 5. on-foot stage (parts/foot*.js, may not be merged yet)
FT = [('pistol', '#ffe08a', 'pistol', 'a small yellow-white tracer bullet with a short streak', 'a small yellow-white flash', 'a small yellow spark burst'),
      ('mg', '#ffc04a', 'machine gun', 'a thin orange tracer bullet streak, long and narrow', 'a stuttering orange flash with side sparks', 'a quick orange spark spray'),
      ('shotgun', '#ffd870', 'shotgun', 'a small round hot yellow pellet with a short glowing tail', 'a wide cone of yellow sparks', 'a small yellow dot burst with tiny sparks'),
      ('flame', '#ff6a2d', 'flamethrower', 'a short ball of orange-red fire with a yellow core, licking tail', 'a roaring orange flame cone', 'a splash of burning orange flame with embers'),
      ('rocket', '#ff9a4a', 'rocket launcher', 'a small rocket glowing white-orange with a bright exhaust flame, side view', 'a fiery backblast cone and smoke glow', 'a bright orange explosion burst with a ring'),
      ('arc', '#58e6ff', 'arc gun', 'a short jagged cyan lightning bolt with a white core', 'a cyan electric crackle', 'a cyan electric burst with branching arcs')]
for (i, col, nm, b, m, h) in FT:
    add('fx-ft-%s.webp' % ({'pistol': 'pistol-bullet', 'mg': 'mg-bullet', 'shotgun': 'shotgun-pellet'}.get(i, i)), 256, 256, 'PLACEHOLDER', 'On-foot stage (parts/street/foot.js): the %s shot. No hook yet' % nm, 'On-foot %s projectile, facing right, centred.' % nm,
        'an on-foot %s projectile: %s, facing right, centred' % (nm, b), 'black', col, 'streak', 'right', 'On-foot stage')
    add('fx-ft-%s-muzzle.webp' % i, 256, 256, 'PLACEHOLDER', 'On-foot stage: %s muzzle flash. No hook yet' % nm, 'On-foot %s muzzle flash pointing right, base at the left-centre edge.' % nm,
        'a muzzle flash for the on-foot %s: %s, starting at the left-centre edge and pointing right' % (nm, m), 'black', col, 'burst', 'right', 'On-foot stage')
    add('fx-ft-%s-hit.webp' % i, 256, 256, 'PLACEHOLDER', 'On-foot stage: %s impact. No hook yet' % nm, 'On-foot %s impact burst, centred.' % nm,
        'an impact effect for the on-foot %s: %s, centred' % (nm, h), 'black', col, 'burst', 'centre', 'On-foot stage')
add('fx-ft-grenade.webp', 256, 256, 'PLACEHOLDER', 'On-foot stage: thrown grenade. No hook yet', 'A round cyberpunk grenade with a glowing green band and a pin ring, side view.', 'a round cyberpunk hand grenade in dark metal with a glowing green band and a small pin ring, side view', 'white', '#6dff7a', 'mine', 'centre', 'On-foot stage')
add('fx-ft-blood-spark.webp', 256, 256, 'PLACEHOLDER', 'On-foot stage: hit spark on enemies (neutral cyber spark, no gore). No hook yet', 'A neutral cyber spark burst: cyan-white sparks and a few small circuit-pattern fragments. No blood, no gore.', 'a neutral cyber hit spark: a burst of cyan and white sparks with a few small glowing circuit fragments, no blood, no gore, centred', 'black', '#5ae6ff', 'burst', 'centre', 'On-foot stage')
add('fx-ft-dust.webp', 512, 512, 'PLACEHOLDER', 'On-foot stage: landing and running dust. No hook yet', 'A low puff of dust lit by neon from the side.', 'a low puff of dust and steam from the ground, softly lit by pink and teal neon, centred, flat bottom', 'black', '#b898d0', 'burst', 'centre', 'On-foot stage')
add('fx-ft-shield-hit.webp', 512, 512, 'PLACEHOLDER', 'On-foot stage: a bullet hits a riot shield. No hook yet', 'A blue hex ripple with a bright flash at the centre.', 'a blue energy shield hit: a bright white-blue flash with a hexagon ripple spreading out from it, centred', 'black', '#4a8bff', 'ring', 'centre', 'On-foot stage')

# ---------------------------------------------------------------- 6. the effects that exist today (listed so the owner sees the whole set; the real pictures stay as they are)
CORE = [('shot-std', 256, 32, 'Player shots (tinted per colour), the shared shot', 'Thin white bolt, tinted by the code.'), ('shot-hv', 256, 112, 'Heavy ship shots', 'Heavy yellow shell.'), ('shot-ec', 256, 66, 'Echo ship shots', 'Violet shot.'),
        ('shot-perfect', 256, 58, 'On-beat perfect shots', 'Gold bolt.'), ('bullet-enemy', 256, 256, 'Enemy bullets (hue-turned for needle and shell)', 'Lime orb with a dark rim.'),
        ('bullet-shell', 256, 256, 'Enemy shell bullets (a hue-turned copy of the lime orb until this exists)', 'Heavy shell-type enemy bullet. Waits for the file; no placeholder is written because the game would show it.'),
        ('bullet-needle', 256, 256, 'Enemy needle bullets (a hue-turned copy until this exists)', 'Thin needle-type enemy bullet, pointing right. Waits for the file; no placeholder is written.'),
        ('bullet-rocket', 256, 256, 'Enemy rockets (a vector rocket until this exists)', 'Enemy rocket head with flame, pointing right. Waits for the file; no placeholder is written.'),
        ('muzzle', 256, 170, 'Shared muzzle flash', 'Muzzle flash.'), ('hit-spark', 256, 256, 'Shared hit spark', 'Hit spark.'), ('explosion-small', 256, 256, 'Shared small explosion', 'Small explosion.'),
        ('explosion-big', 512, 480, 'Shared big explosion', 'Big explosion.'), ('explosion-boss', 512, 494, 'Shared boss explosion', 'Boss explosion.'), ('shockwave', 255, 256, 'EMP shockwave ring', 'Shockwave ring.'), ('engine', 256, 68, 'Ship engine flame', 'Engine flame.')]
for (s, w, h, wh, nt) in CORE:
    miss = s in ('bullet-shell', 'bullet-needle', 'bullet-rocket')
    e = dict(file='fx-%s.webp' % s, w=w, h=h, group=GROUP, status='WIRED', where=wh, notes=nt + (' Light on black, drawn additively.'), kind='fx', bg='black', why='Existing core effect (listed so the whole set is visible)', ph=dict(c='#3dffb0', shape='orb'), section='Existing core effects')
    if miss: e['noph'] = True; e['prompt'] = ' '.join(('%s, facing right, centred, %s, %dx%d, soft glowing edges, no characters, no text, no letters.' % (nt.split('.')[0], BLK, w, h)).split()); e['status'] = 'WIRED'
    E.append(e)

# ---------------------------------------------------------------- write the manifest group (keep every other entry; the three older 'Effects' entries stay where they are)
mp = os.path.join(HERE, 'assets-manifest.json')
M = [e for e in json.load(open(mp, encoding='utf-8')) if e['group'] != GROUP]
entries = [{k: v for k, v in e.items() if k != 'section'} for e in E]
if len({e['file'] for e in entries}) != len(entries): raise SystemExit('duplicate file names')
old = {e['file'] for e in M}
dups = [e['file'] for e in entries if e['file'] in old]
if dups: raise SystemExit('already in the manifest under another group: %s' % dups)
M += entries
json.dump(M, open(mp, 'w', encoding='utf-8'), indent=1, ensure_ascii=False); open(mp, 'a').write('\n')

# ---------------------------------------------------------------- prompts json + markdown
cards = {e['file'].rsplit('.', 1)[0]: STYLE + '. ' + e['prompt'] for e in entries if 'prompt' in e}
pj = os.path.join(ROOT, 'games-src', 'next-wave', 'flow-2d', 'mainhattan-nightrun', 'prompts-fx.json'); os.makedirs(os.path.dirname(pj), exist_ok=True)
json.dump({'cards': cards, 'style': STYLE, 'notes': 'Effects asset wave 8. Light and glow effects are on a pure solid black background (the game keys the black to transparency); solid objects on a plain flat white background (ingest keys the white). Save-as names are in FX-FLOW-PROMPTS.md.'},
          open(pj, 'w', encoding='utf-8'), indent=1, ensure_ascii=False); open(pj, 'a').write('\n')
new = [e for e in E if e['status'] == 'PLACEHOLDER']; core = [e for e in E if e['section'] == 'Existing core effects']
out = ['# Effects asset wave 8: prompts for the picture tool', '',
       'Generated by `make-fx-assets.py` (rerun it after changing a design). **%d new files** (+ %d existing core effects listed for the whole picture, 3 of them still missing). The game runs unchanged with its own effects; each real picture replaces the matching effect automatically (`parts/art/fxwave.js`).' % (len(new), len(core)), '',
       '## How', '', '1. Paste the **style block** first (or put it in front of every prompt; the json already has it in front).',
       '2. **Light and glow effects** are painted on a **pure solid black** square: the game turns the black into transparency when it loads the picture. No grey vignette, no border, keep the corners pure black.',
       '3. **Solid objects** (bomb, mine, grenade, blades, discs, shells, debris) are painted on a **plain flat white** background: the ingest script cuts the white out.',
       '4. Projectiles and muzzle flashes face RIGHT. Bursts, rings and impacts are centred. Beams and lines are tileable left to right.',
       '5. Save as the exact name given into `assets-inbox/mainhattan-nightrun/` and run `python3 games-src/scripts/ingest-assets.py` (it sizes and keys them and lists them in `media/ready.json`), or save into `games/mainhattan-nightrun/media/` and run `python3 games-src/nightrun/make-placeholders.py`. Commit.',
       '6. Paint at twice the size or larger; we convert to the listed size.', '', '## Style block', '', '> ' + STYLE, '',
       'Lists: `games-src/next-wave/flow-2d/mainhattan-nightrun/prompts-fx.json` (same prompts, `{"cards": {name: prompt}}`).', '']
sec = []
for e in E:
    if e['section'] not in sec: sec.append(e['section'])
for s in sec:
    out += ['', '## ' + s, '']
    if s.startswith('Weapons: '):
        w = next(x for x in W if x[2] == s[9:]); out += ['Colour and mood: **%s**, %s. Weapon id `%s`.' % (w[1], w[2], w[0]), '']
    for e in [x for x in E if x['section'] == s]:
        stem = e['file'].rsplit('.', 1)[0]
        if 'prompt' in e:
            out += ['**`%s`** (%dx%d, %s) save as `%s`%s' % (stem, e['w'], e['h'], 'on black' if e['bg'] == 'black' else 'on white', e['file'], ' (still missing: no placeholder)' if e.get('noph') else ''), '', '> ' + e['prompt'], '']
        else:
            out += ['- `%s` (%dx%d) exists: %s' % (e['file'], e['w'], e['h'], e['where'])]
open(os.path.join(HERE, 'FX-FLOW-PROMPTS.md'), 'w', encoding='utf-8').write('\n'.join(out) + '\n')
print('manifest entries:', len(entries), '| new:', len(new), '| existing core:', len(core), '| prompts:', len(cards), '| total manifest:', len(M))
