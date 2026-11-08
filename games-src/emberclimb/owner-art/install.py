#!/usr/bin/env python3
"""Owner art first: reuse the owner's doorkick-dungeon pictures and boss videos in emberclimb under emberclimb stems.
Source: games/doorkick-dungeon/media (owner-made). Target: games/emberclimb/media/<stem>.webp|.mp4.
Owner art beats the free-kit art (free-art/install.py), so this runs AFTER it and overwrites those stems.
Video stills come from ffmpeg: t=0.1 s is the empty room (backgrounds), t=4.5 s is the monster (portraits, square crop).
Every picture slot gets owner art (media/ pictures, boss videos and stills, or a cards/ picture). Nothing else stays.
Usage: python3 install.py [--dry]"""
import os, sys, shutil, subprocess, json
here = os.path.dirname(os.path.abspath(__file__))
root = os.path.normpath(os.path.join(here, '..', '..', '..', 'games'))
src, dst = os.path.join(root, 'doorkick-dungeon', 'media'), os.path.join(root, 'emberclimb', 'media')
cards = os.path.join(root, 'doorkick-dungeon', 'cards')
dry = '--dry' in sys.argv
# stem <- (source file, how): copy = as is; still:T = video frame at T s (cover); face:T = video frame at T s, centre square
MAP = {
    'bg-title': ('title-phone.webp', 'copy'), 'bg-title-wide': ('title.webp', 'copy'),
    'bg-map': ('table-tavern-phone.webp', 'copy'), 'bg-map-wide': ('table-tavern.webp', 'copy'),
    'bg-reward': ('table-golden-vault.webp', 'copy'), 'bg-victory': ('end-win.webp', 'copy'), 'bg-defeat': ('end-lose.webp', 'copy'),
    'bg-shop': ('table-golden-vault.webp', 'copy'), 'bg-rest': ('table-tavern-phone.webp', 'copy'), 'bg-event': ('table-vault-stone.webp', 'copy'),
    'card-back': ('back-door.webp', 'copy'),
    'cast-guide': ('camp-hobb.webp', 'copy'), 'cast-rival': ('camp-grub.webp', 'copy'),
    'cast-merchant': ('camp-tansy.webp', 'copy'), 'cast-healer': ('camp-pip.webp', 'copy'), 'cast-teller': ('camp-morwen.webp', 'copy'),
    'bg-battle-1': ('doorkick-wyrm-boss.mp4', 'still:0.1'), 'bg-battle-2': ('doorkick-pharaoh-boss.mp4', 'still:0.1'),
    'bg-battle-3': ('doorkick-tentacles-boss.mp4', 'still:0.1'), 'bg-elite': ('doorkick-dread-boss.mp4', 'still:0.1'),
    'bg-boss-mire-behemoth': ('doorkick-tentacles-boss.mp4', 'still:0.1'), 'bg-boss-ashen-wraith': ('doorkick-dread-boss.mp4', 'still:0.1'),
    'bg-boss-gate-colossus': ('doorkick-wyrm-boss.mp4', 'still:0.1'), 'bg-boss-ember-tyrant': ('doorkick-inferno-boss.mp4', 'still:0.1'),
    'bg-boss-tomb-king': ('doorkick-pharaoh-boss.mp4', 'still:0.1'), 'bg-boss-skyclaw': ('doorkick-pharaoh-boss.mp4', 'still:0.1'),
    'bg-boss-warden-captain': ('doorkick-skygrif-boss.mp4', 'still:0.1'),
    'boss-mire-behemoth': ('doorkick-tentacles-boss.mp4', 'video'), 'boss-ashen-wraith': ('doorkick-dread-boss.mp4', 'video'),
    'boss-gate-colossus': ('doorkick-wyrm-boss.mp4', 'video'), 'boss-ember-tyrant': ('doorkick-inferno-boss.mp4', 'video'),
    'boss-tomb-king': ('doorkick-pharaoh-boss.mp4', 'video'), 'boss-skyclaw': ('doorkick-skygrif-boss.mp4', 'video'),
}
# every other picture slot: a Doorkick card picture (games/doorkick-dungeon/cards/<name>.webp). One style for the whole game.
CARD = {
    # heroes and foes
    'hero-w': 'warrior', 'hero-s': 'thief', 'hero-a': 'moonsilver', 'hero-m': 'cleric',
    'enemy-mire-slug': 'slugs', 'enemy-gnawer': 'hellmouse', 'enemy-hex-acolyte': 'hexcls', 'enemy-gape-grub': 'leech', 'enemy-rust-tick': 'mites',
    'enemy-bile-blob': 'pyramid', 'enemy-snare-vine': 'pergola', 'enemy-ash-imp': 'imp', 'enemy-thorn-brute': 'slobber', 'enemy-sleeper-statue': 'primordial',
    'enemy-iron-warden': 'stubby', 'enemy-warden-captain': 'double', 'enemy-mire-behemoth': 'tentacles', 'enemy-ashen-wraith': 'dread',
    'enemy-gate-colossus': 'wyrm', 'enemy-cinder-hound': 'hound', 'enemy-ash-wisp': 'cloak', 'enemy-smoke-hexer': 'wizard', 'enemy-skyclaw': 'skygrif',
    'enemy-grave-knight': 'rattle', 'enemy-bone-caller': 'gnawers', 'enemy-tomb-king': 'pharaoh', 'enemy-ember-tyrant': 'inferno',
    # warrior cards
    'w-strike': 'rapier', 'w-defend': 'kneecaps', 'w-hammer': 'shinhammer', 'w-cleave': 'halberd', 'w-twin-slash': 'tapsword', 'w-warm-up': 'hotsauce',
    'w-bulwark-bash': 'wall', 'w-sunder': 'buzzsaw', 'w-iron-skin': 'wallshield', 'w-skull-rap': 'cudgel', 'w-roar': 'l9', 'w-wild-swing': 'weighted',
    'w-whirlwind': 'hexgust', 'w-kindle': 'wildfire', 'w-slow-burn': 'blazing', 'w-body-check': 'stompy', 'w-second-wind': 'water', 'w-berserk-roll': 'furious',
    'w-reapers-edge': 'rascal', 'w-plate-up': 'jerkin', 'w-pyre-heart': 'gargantuan', 'w-colossus-slam': 'boulder', 'w-double-down': 'twin', 'w-final-gambit': 'amazon',
    # rogue cards
    's-strike': 'borrow', 's-defend': 'kneepads', 's-pinprick': 'dart', 's-slip-away': 'vanish', 's-blade-fan': 'swash', 's-toxic-vial': 'fizz', 's-quick-stab': 'dame',
    's-dodge-roll': 'sneakers', 's-hidden-knives': 'heist', 's-dagger-spray': 'longbow', 's-cripple': 'hexsock', 's-lucky-pick': 'l1', 's-snap-cut': 'slurper',
    's-catalyst': 'sour', 's-noxious': 'garlic', 's-envenom': 'paste', 's-knife-rain': 'hexgrab', 's-backstab': 'notmine', 's-choking-cloud': 'hexrotten',
    's-needle-rain': 'loophole', 's-venom-storm': 'gooey', 's-afterimage': 'twins', 's-final-flourish': 'l7', 's-plague-doctor': 'cizzy',
    # automaton cards
    'a-strike': 'mace', 'a-defend': 'antler', 'a-zap': 'zaphat', 'a-dualcast': 'mirrors', 'a-ball-lightning': 'undoring', 'a-cool-circuit': 'frosty', 'a-charge-up': 'l6',
    'a-barrier-pulse': 'headband', 'a-beam-cell': 'rod', 'a-sweeping-beam': 'pole', 'a-overclock': 'genius', 'a-static-jolt': 'nerd', 'a-compile-strike': 'l5',
    'a-capacitor': 'bucket', 'a-defrag': 'hexlvl', 'a-glacier': 'snooze', 'a-darkness': 'hexid', 'a-tempest': 'sirens', 'a-multicast': 'mixed',
    'a-core-breach': 'boulderitem', 'a-biased-core': 'stepstool', 'a-meteor-strike': 'l2', 'a-hyperbeam': 'sousaphone', 'a-reactor': 'courage',
    # monk cards
    'm-strike': 'favor', 'm-defend': 'leggings', 'm-eruption': 'hexrace', 'm-vigilance': 'hexhen', 'm-palm-flurry': 'hexsmall', 'm-crush-joints': 'kneecaps',
    'm-pressure-point': 'hexbig', 'm-still-water': 'water', 'm-sash-whip': 'pitchman', 'm-cut-through': 'tiny', 'm-empty-fist': 'hexsex', 'm-bow': 'hextax',
    'm-third-eye': 'hexmirror', 'm-inner-peace': 'ficus', 'm-wheel-kick': 'flipflops', 'm-rushdown': 'pony', 'm-mental-fort': 'hexcrisis', 'm-flying-sleeves': 'parrot',
    'm-windmill': 'balloons', 'm-roll-with-it': 'barfabunny', 'm-sky-hammer': 'l8', 'm-zen-burst': 'lantern', 'm-deva-form': 'elf', 'm-judgment': 'halfling',
    # neutral, statuses, curses
    'n-bandage': 'hugjuice', 'n-good-instincts': 'genius', 'n-finesse': 'sneakers', 'n-panic-button': 'bucket', 'n-hand-of-greed': 'pile',
    'wound': 'hexrotten', 'dazed': 'snooze', 'burn': 'wildfire', 'slimed': 'gooey', 'regret': 'hexcrisis', 'doubt': 'hexid', 'injury': 'kneecaps',
    'calm-spark': 'water', 'shiv': 'shiv',
    # relics, potions, events, map rooms
    'relic-ember-brand': 'blazing', 'relic-whetstone-ring': 'undoring', 'relic-spark-core': 'genius', 'relic-prayer-beads': 'favor', 'relic-lucky-coin': 'l1',
    'relic-iron-bangle': 'kneecaps', 'relic-lantern': 'lantern', 'relic-bag-of-marbles': 'balloons', 'relic-clover-dice': 'weighted', 'relic-healing-moss': 'ficus',
    'relic-gold-tooth': 'grater', 'relic-oak-heart': 'pergola', 'relic-candle-stub': 'title', 'relic-pocket-satchel': 'porter', 'relic-tin-flute': 'sousaphone',
    'relic-smoking-censer': 'garlic', 'relic-dawnstone': 'boulderitem', 'relic-gale-cloak': 'hexgust', 'relic-phoenix-ash': 'rooster',
    'pot-fire-flask': 'hotsauce', 'pot-block-brew': 'l6', 'pot-strength-tonic': 'courage', 'pot-swift-draught': 'sneakers', 'pot-energy-vial': 'cizzy',
    'pot-venom-vial': 'fizz', 'pot-frost-gas': 'frosty', 'pot-healing-draught': 'hugjuice', 'pot-fortune-die': 'weighted',
    'event-back-alley-gambler': 'heist', 'event-ember-shrine': 'favor', 'event-mirror-pool': 'hexmirror', 'event-stranded-caravan': 'pony',
    'event-wandering-tinker': 'pitchman', 'event-whispering-well': 'water',
    'node-monster': 'hellmouse', 'node-elite': 'stubby', 'node-rest': 'sandwich', 'node-shop': 'pile', 'node-event': 'hexmirror', 'node-treasure': 'l1', 'node-boss': 'dread',
}
def ff(*a): subprocess.run(['ffmpeg', '-loglevel', 'error', '-y'] + list(a), check=True)
n = 0
for stem, (f, how) in MAP.items():
    s = os.path.join(src, f)
    if not os.path.exists(s): print('MISSING source', f); continue
    if dry: n += 1; continue
    if how == 'copy': shutil.copyfile(s, os.path.join(dst, stem + '.webp'))
    elif how == 'video': shutil.copyfile(s, os.path.join(dst, stem + '.mp4'))
    else:
        k, t = how.split(':'); vf = 'crop=ih:ih:(iw-ih)/2:0,scale=480:480' if k == 'face' else 'scale=854:-2'
        ff('-ss', t, '-i', s, '-frames:v', '1', '-vf', vf, '-c:v', 'libwebp', '-quality', '80', os.path.join(dst, stem + '.webp'))
    n += 1
for stem, c in CARD.items():
    s = os.path.join(cards, c + '.webp')
    if not os.path.exists(s): print('MISSING card', c); continue
    if not dry: shutil.copyfile(s, os.path.join(dst, stem + '.webp'))
    n += 1
# one style: every picture in media/ that is not owner art is removed (the old pixel set: intents, status icons, frames, gems, dice, orbs, fx...);
# those slots fall back to the game's own drawn icons
keep = set(MAP) | set(CARD)
gone = [f for f in os.listdir(dst) if os.path.splitext(f)[0] not in keep and f.endswith(('.webp', '.png', '.jpg'))]
if not dry:
    for f in gone: os.remove(os.path.join(dst, f))
print(f'emberclimb: removed {len(gone)} non-owner pictures')
json.dump(dict({k: v[0] for k, v in MAP.items()}, **{k: 'cards/' + v + '.webp' for k, v in CARD.items()}), open(os.path.join(here, 'map.json'), 'w'), indent=1)
print(f'emberclimb owner art: installed {n} of {len(MAP) + len(CARD)} stems from doorkick-dungeon')
