# W490: fills Vinegrave picture slots with owner art reused from other games (copied, resized; sources untouched).
# Run from anywhere: python3 games-src/vinegrave/reuse-art.py  -> writes games/vinegrave/media/<stem>.webp and the reuse table in ASSETS.md
import os, json, random
from PIL import Image, ImageDraw, ImageFilter
D = os.path.dirname(os.path.abspath(__file__)); REPO = os.path.abspath(os.path.join(D, '..', '..')); G = os.path.join(REPO, 'games')
OUT = os.path.join(G, 'vinegrave', 'media')
man = {i['stem']: i for i in json.load(open(os.path.join(D, 'assets.json')))['items']}
MAP = {
 # board, table, screens
 'title-bg': 'shipwreck-isle/title', 'result-win': 'shipwreck-isle/end-win', 'result-lose': 'shipwreck-isle/end-lose',
 'track-bg': 'thornbound/track', 'board-map': 'shipwreck-isle/table-temple-ruins', 'card-back': 'shipwreck-isle/back-default', 'shrine-slot': 'tidewake/ring-slot',
 # camp sites + face-down tiles
 'site-c-spring': 'shipwreck-isle/hex-river', 'site-c-cliff': 'shipwreck-isle/hex-mountains', 'site-c-wreck': 'shipwreck-isle/camp-gale',
 'site-c-cove': 'shipwreck-isle/hex-beach', 'site-c-road': 'shipwreck-isle/hex-plains',
 'site-hidden-1': 'shipwreck-isle/hex-fog-a', 'site-hidden-2': 'shipwreck-isle/hex-fog-c',
 # level 1 ruins
 'site-fern-steps': 'shipwreck-isle/camp-rain', 'site-frog-pool': 'sands-of-qamar/tile-oasis', 'site-broken-arch': 'shipwreck-isle/hex-hills',
 'site-hollow-tree': 'shipwreck-isle/camp-prowlers', 'site-snake-ford': 'shipwreck-isle/camp-undertow', 'site-moth-cave': 'shipwreck-isle/camp-shroud',
 'site-sunken-well': 'sands-of-qamar/tile-lake', 'site-statue-row': 'shipwreck-isle/camp-altar', 'site-root-gate': 'shipwreck-isle/camp-whisper',
 'site-echo-pit': 'sands-of-qamar/tile-ravine',
 # level 2 ruins
 'site-crystal-vault': 'emberclimb/bg-event', 'site-lava-stair': 'emberclimb/bg-boss-ember-tyrant', 'site-sky-altar': 'shipwreck-isle/camp-horizon',
 'site-drowned-hall': 'shipwreck-isle/hex-fog-b', 'site-thorn-palace': 'thornbound/title', 'site-star-pool': 'sands-of-qamar/tile-sacred',
 'site-bone-chapel': 'emberclimb/bg-battle-3', 'site-jade-court': 'shipwreck-isle/table-temple-ruins',
 # guardians (display names follow the picture, see data.js GUARD_NAME)
 'guard-mire-crawler': 'emberclimb/enemy-gape-grub', 'guard-stone-ape': 'emberclimb/enemy-sleeper-statue', 'guard-glass-moth': 'emberclimb/enemy-ash-wisp',
 'guard-rootback-boar': 'emberclimb/enemy-gnawer', 'guard-tide-serpent': 'emberclimb/enemy-gate-colossus', 'guard-ember-hound': 'emberclimb/enemy-cinder-hound',
 'guard-moss-golem': 'emberclimb/enemy-snare-vine', 'guard-howl-bat': 'emberclimb/enemy-skyclaw', 'guard-vine-widow': 'emberclimb/enemy-mire-behemoth',
 'guard-thunder-toad': 'emberclimb/enemy-thorn-brute', 'guard-bone-heron': 'emberclimb/enemy-bone-caller', 'guard-ash-jaguar': 'emberclimb/enemy-ember-tyrant',
 'guard-canopy-wyrm': 'emberclimb/enemy-ashen-wraith', 'guard-temple-cat': 'emberclimb/enemy-tomb-king', 'guard-old-warden': 'emberclimb/enemy-iron-warden',
 # explorers + research markers + goods
 'explorer-0': 'rampart-and-vine/piece-meeple-blue', 'explorer-1': 'rampart-and-vine/piece-meeple-yellow', 'explorer-2': 'rampart-and-vine/piece-meeple-red',
 'explorer-3': 'rampart-and-vine/piece-meeple-green', 'token-notebook': 'thornbound/icon-lore', 'token-glass': 'shipwreck-isle/icon-act-explore',
 'res-coin': 'sands-of-qamar/icon-coin', 'res-compass': 'tidewake/compass-rose', 'res-jewel': 'sands-of-qamar/good-jewels', 'res-arrow': 'shipwreck-isle/icon-res-weapon',
 # cast
 'portrait-pell': 'shipwreck-isle/camp-explorer', 'portrait-tamsin': 'rampart-and-vine/camp-tamsin', 'portrait-okoro': 'shipwreck-isle/camp-friday',
 'portrait-quell': 'shipwreck-isle/camp-ada', 'portrait-sallow': 'shipwreck-isle/camp-cook', 'portrait-mira': 'sands-of-qamar/camp-you',
 'portrait-vane': 'shipwreck-isle/camp-soldier', 'portrait-warden': 'emberclimb/cast-guide',
 # item cards
 'card-dread': 'emberclimb/doubt', 'card-grant': 'emberclimb/relic-candle-stub', 'card-trail': 'sands-of-qamar/good-papyrus',
 'card-machete': 'sands-of-qamar/item-scimitar', 'card-canteen': 'emberclimb/pot-healing-draught', 'card-rope': 'shipwreck-isle/icon-res-wood',
 'card-lamp': 'sands-of-qamar/item-lamp', 'card-lantern': 'shipwreck-isle/icon-act-camp', 'card-satchel': 'emberclimb/relic-pocket-satchel',
 'card-pickaxe': 'shipwreck-isle/icon-act-build', 'card-sledge': 'emberclimb/w-hammer', 'card-hammock': 'shipwreck-isle/icon-act-rest',
 'card-spyglass': 'shipwreck-isle/icon-act-explore', 'card-crate': 'sands-of-qamar/item-gem7', 'card-lockbox': 'emberclimb/node-shop',
 'card-tent': 'shipwreck-isle/icon-res-shelter', 'card-tarp': 'shipwreck-isle/icon-res-roof', 'card-kettle': 'emberclimb/pot-block-brew',
 'card-flares': 'emberclimb/pot-fire-flask', 'card-quiver': 'shipwreck-isle/icon-act-hunt', 'card-gramophone': 'emberclimb/relic-tin-flute',
 'card-mule': 'sands-of-qamar/icon-camel', 'card-ledger': 'hollowbough/icon-twig', 'card-hatchet': 'emberclimb/w-cleave',
 # artifact cards
 'card-reed-flute': 'sands-of-qamar/item-flute', 'card-clay-cup': 'sands-of-qamar/good-pottery', 'card-bone-dice': 'emberclimb/relic-clover-dice',
 'card-moss-idol': 'emberclimb/relic-healing-moss', 'card-sun-disc': 'sands-of-qamar/ui-badge-gold', 'card-vine-crown': 'sands-of-qamar/item-gem9',
 'card-ash-urn': 'emberclimb/relic-smoking-censer', 'card-root-sceptre': 'emberclimb/burn', 'card-glyph-stone': 'emberclimb/relic-dawnstone',
 'card-serpent-ring': 'sands-of-qamar/item-gem5', 'card-lava-blade': 'emberclimb/w-reapers-edge', 'card-spirit-bowl': 'emberclimb/pot-energy-vial',
 'card-storm-horn': 'sands-of-qamar/item-talisman', 'card-coral-throne': 'thornbound/throne', 'card-obsidian-mirror': 'emberclimb/node-event',
 'card-feather-cloak': 'emberclimb/relic-gale-cloak', 'card-tusk-horn': 'sands-of-qamar/good-ivory', 'card-sky-lens': 'sands-of-qamar/good-fakir',
 'card-old-codex': 'thornbound/icon-lore', 'card-stone-heart': 'hollowbough/icon-pebble', 'card-world-seed': 'hollowbough/icon-berry',
 'card-wind-chime': 'thornbound/icon-influence', 'card-gilded-beetle': 'emberclimb/relic-lucky-coin', 'card-star-chart': 'sands-of-qamar/icon-star',
 'card-tide-shell': 'tidewake/compass-rose', 'card-thorn-key': 'thornbound/icon-pledge', 'card-rain-drum': 'hollowbough/icon-resin',
}
def fit(src, it):
    im = Image.open(src).convert('RGBA'); w, h = it['w'], it['h']
    if it['alpha'] and it['kind'] in ('token', 'icon', 'card') and im.getextrema()[3][0] < 250:   # cut-out: contain, keep transparency
        im.thumbnail((w, h), Image.LANCZOS); c = Image.new('RGBA', (w, h), (0, 0, 0, 0)); c.alpha_composite(im, ((w - im.width) // 2, (h - im.height) // 2)); return c
    r = max(w / im.width, h / im.height); im = im.resize((max(w, round(im.width * r)), max(h, round(im.height * r))), Image.LANCZOS)
    x, y = (im.width - w) // 2, (im.height - h) // 2; return im.crop((x, y, x + w, y + h))
rows = []
for stem, src in sorted(MAP.items()):
    it = man[stem]; p = os.path.join(G, src.split('/')[0], 'media', src.split('/')[1] + '.webp'); assert os.path.exists(p), p
    fit(p, it).save(os.path.join(OUT, stem + '.webp'), 'WEBP', quality=84); rows.append((stem, 'games/%s/media/%s.webp' % tuple(src.split('/'))))
md = os.path.join(D, 'ASSETS.md'); txt = open(md, encoding='utf-8').read().split('\n## Reused owner art (W490)')[0].rstrip()
txt += '\n\n## Reused owner art (W490)\n\nVinegrave has no owner art of its own. These slots are filled with owner art copied from other games (source files untouched), resized to the slot by `reuse-art.py`.\nSlots not listed keep their earlier free picture (idols, travel icons, a few cards, story-map backdrops, card frames).\n\n| slot | source |\n|---|---|\n' + '\n'.join('| %s | %s |' % r for r in rows) + '\n'
open(md, 'w', encoding='utf-8').write(txt); print(len(rows), 'slots filled')
