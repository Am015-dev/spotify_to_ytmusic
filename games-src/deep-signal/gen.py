#!/usr/bin/env python3
"""Single source for Deep Signal's data: missions.json (+ titles and logs) -> campaign.json, missions-full.json, assets.json, Flow prompt files,
music cues, ASSET-CHECK.md and ASSETS.md.   python3 games-src/deep-signal/gen.py"""
import json, os, pathlib, collections
D = pathlib.Path(__file__).resolve().parent; SP = D.parent; SLUG = 'deep-signal'
M = json.load(open(D / 'missions.json'))
TITLES = ["First Dive", "Two Lights", "In Order", "Three Echoes", "The Fever Watch", "Steady Hands", "Last Word", "Count Down", "The Faint Ping", "Four Lanterns",
 "Captain's Call", "Final Seal", "Every Ping Answers", "Static Shelf", "By the Book", "The Hushed Trench",
 "Chosen Diver", "Jammed Relay", "Pressure Rising", "Lone Catch", "Twin Beacons", "Fair Shares", "Arrows in the Dark", "Dead Water", "Slow Burn",
 "Out of the Loop", "Three Steps Down", "Split the Haul", "Follow the Arrows", "Smallest Voice", "Bookends", "The Murk", "The Warden's Gate",
 "Into the Rift", "Clockwork", "One and Only", "Long Silence", "The Last Lock", "Shadow Arrows", "Even Keel", "Quarantine", "Cascade",
 "Deep Bloom", "Ghost Relay", "Five Seals", "Blind Shares", "The Last Lantern", "The Captain's Wager", "Riptide Arrows", "The Signal's Heart"]
LOGS = ["Our sub, the Lanternfish, slips under the waves. A faint signal pulses far below. Let's learn to work as one crew.",
 "Two beacons to recover on this dive. Each one belongs to whoever claimed it.", "The beacons must come home in order: first, then second.",
 "Three echoes from the reef. Share the work.", "One diver has caught a fever. They must stay out of every haul this dive.",
 "Order matters again, with a third task riding free.", "Something must be saved for last: the task marked with the final seal.",
 "Three numbered beacons: first, second, third. No shortcuts.", "Only the weakest sonar can catch this ping. Sonar 1 must win a trick.",
 "Four lanterns flicker in the kelp. Spread out.", "The captain chooses who carries this task. Speak up if you can do it.",
 "Four tasks, and the sealed one comes last.", "The trench answers every ping. Each sonar card must win its own trick.",
 "A static shelf scrambles our signals: you see the card, not what it means.", "Four numbered beacons. By the book, one to four.",
 "Silent running past the Warden's outpost. No signals at all.",
 "The captain picks one diver to carry both tasks.", "The relay is jammed: no signals until the second trick.", "Five tasks as the pressure rises; one must come first.",
 "One diver must make exactly one catch this dive.", "Five tasks, two of them numbered.", "The captain hands out the tasks one by one, fairly.",
 "Arrows mark which of two tasks comes before the other.", "Dead water again: signals lose their meaning.", "Signals jammed until the third trick, and a sealed task last.",
 "Another fever. Two tasks, and the patient wins no tricks.", "Three numbered steps down the slope.", "The captain splits six tasks between us.",
 "Four arrows, four tasks in a row, with one free task between.", "The faintest sonar must win a trick while five tasks wait.",
 "First, second and the sealed last task.", "Thick murk: six tasks and no meaning in our signals.", "The Warden blocks the gate. The captain hands out the tasks, and the static is back.",
 "Into the rift. Seven tasks, nothing else.", "Two numbered tasks among seven.", "One diver makes exactly one catch, three tasks to do.",
 "No signals until the third trick, seven tasks.", "Seven tasks, the sealed one last.", "Dead zone and two arrows.", "The captain shares eight tasks evenly.",
 "Quarantine: one diver wins no tricks while five tasks are done.", "A cascade of three numbered tasks among eight.", "Eight tasks in a blooming reef.",
 "Ghost relay: dead zone, and no signals before trick two.", "Five numbered seals, one after another.", "The captain shares the tasks blind: the static returns.",
 "Nine tasks; the sealed one comes last.", "The captain bets everything on one diver: three tasks, one carrier.", "Dead zone with three arrows.",
 "The signal's heart. Silent running, seven tasks, the sealed one last."]
assert len(TITLES) == 50 and len(LOGS) == 50
SPTXT = {'notrick': 'The captain picks one crew member who must win no tricks.', 'onetrick': 'The captain picks one crew member who must win exactly one trick.',
 'decide': 'The captain asks who wants the tasks, then gives all of them to one crew member.', 'dist': 'The captain hands out the tasks one by one, as evenly as possible.',
 'dead': 'Dead zone: a signal shows the card but not whether it is highest, only or lowest.', 'nocomm': 'Silent running: no signals at all.',
 'late2': 'Signals are jammed until trick 2.', 'late3': 'Signals are jammed until trick 3.', 'sonar1': 'Sonar 1 must win a trick.', 'sonars': 'Every sonar card must win a trick.'}
def sptext(sp):
    if not sp: return ''
    return ' '.join(SPTXT[p] for p in sp.split('-'))
full = []
for i, m in enumerate(M):
    m = dict(m); m['title'] = TITLES[i]; m['log'] = LOGS[i]; m['rule'] = sptext(m['sp']); full.append(m)
json.dump(full, open(D / 'missions-full.json', 'w'), indent=0, ensure_ascii=False)
# ---------- campaign: the 50-mission logbook in 3 acts; act ends are the bosses
ACTS = [(1, 16, 'The Shallows', 'Learn to dive as one crew.'), (17, 33, 'The Warden\'s Gate', 'Bigger hauls, stranger rules.'), (34, 50, 'The Signal\'s Heart', 'The deepest water, the hardest dives.')]
BOSS = {16: ('The Warden of the Trench', 'warden', 'An old automated outpost that silences every radio near it.', 'Your signals die in my water.', 'You passed in silence. Impressive.'),
        33: ('The Gatekeeper Swarm', 'swarm', 'A cloud of glowing drones that scrambles every message.', 'The gate stays shut.', 'The swarm parts. Go on.'),
        50: ('The Source', 'source', 'The signal itself: patient, vast, and listening.', 'Not yet. Come deeper.', 'You found me. Listen closely now.')}
cast = {'cap': {'name': 'Captain Ines', 'portrait': 'portrait-ines.webp', 'emoji': '🧭', 'color': '#3a8ee0'},
        'bram': {'name': 'Bram', 'portrait': 'portrait-bram.webp', 'emoji': '🔧', 'color': '#3fb36b'},
        'kito': {'name': 'Kito', 'portrait': 'portrait-kito.webp', 'emoji': '📡', 'color': '#f0b429'},
        'odile': {'name': 'Odile', 'portrait': 'portrait-odile.webp', 'emoji': '🩺', 'color': '#e8577a'},
        'warden': {'name': 'The Warden', 'portrait': 'boss-warden.webp', 'emoji': '🗼', 'color': '#5d6b7a'},
        'swarm': {'name': 'Gatekeeper Swarm', 'portrait': 'boss-swarm.webp', 'emoji': '✨', 'color': '#2bb5b0'},
        'source': {'name': 'The Source', 'portrait': 'boss-source.webp', 'emoji': '🌀', 'color': '#8f6be8'}}
twists = [{'id': k, 'where': 'setup', 'how': v} for k, v in SPTXT.items()]
chs = []
for m in full:
    n = m['n']; act = 1 if n <= 16 else 2 if n <= 33 else 3; boss = n in BOSS; lvl = 'normal' if act == 1 else 'hard'
    if boss: name, cid, pers, taunt, praise = BOSS[n]
    else: name, cid, pers, taunt, praise = 'The trench', 'cap', 'Deep water and a faint signal.', None, None
    goal = 'Complete all %d tasks.' % m['k'] if m['k'] else 'Meet the mission rule.'
    op = {'name': name, 'emoji': cast[cid]['emoji'], 'cast': cid, 'personality': pers, 'aiLevel': lvl, 'aiStyle': 'crew'}
    if boss: op['taunt'] = taunt; op['praise'] = praise
    lines = [{'who': 'cap', 'text': m['log'][:110]}]
    if m['rule']: lines.append({'who': 'kito', 'text': m['rule'][:110]})
    ch = {'id': 'm%d' % n, 'act': act, 'title': 'Mission %d: %s' % (n, m['title']), 'boss': boss, 'intro': lines,
          'outro': [{'who': 'cap', 'text': ['Logged. On to the next dive.', 'Clean work, crew.', 'The signal grows stronger.'][n % 3]}],
          'opponent': op, 'setup': {'players': 4, 'mission': n, 'seed': None},
          'twist': ({'id': m['sp'].split('-')[0], 'param': None, 'text': m['rule']} if m['sp'] else None),
          'goal': {'type': 'mission', 'value': n, 'text': goal + (' ' + m['rule'] if m['rule'] else '')},
          'hints': act == 1,
          'stars': [{'text': 'Complete the mission', 'test': {'k': 'won'}}, {'text': 'No flare used', 'test': {'k': 'noflare'}}, {'text': 'Two or fewer crew signals', 'test': {'k': 'signals', 'op': '<=', 'v': 2}}],
          'easier': {'aiLevel': 'hard', 'twist': ({'id': m['sp'].split('-')[0], 'param': None, 'text': m['rule']} if m['sp'] else None), 'setup': {'players': 4, 'mission': n, 'flareFree': True}, 'maxStars': 2, 'text': 'Your crew thinks harder and the first flare is free.'},
          'unlock': ([{'type': 'portrait', 'id': cid, 'text': name + ' portrait'}] if boss else [])}
    if n == 1: ch['intro'].append({'who': 'cap', 'text': 'This first dive is a guided one. Follow the glowing hints.'})
    chs.append(ch)
camp = {'game': SLUG, 'title': 'The Logbook of the Lanternfish', 'version': 1, 'cast': cast, 'acts': [{'act': a, 'title': t, 'blurb': b} for a, (_, _, t, b) in enumerate(ACTS, 1)], 'twists': twists, 'chapters': chs}
json.dump(camp, open(D / 'campaign.json', 'w'), indent=1, ensure_ascii=False)
print('missions', len(full), 'chapters', len(chs))
# ---------- assets: every picture slot the game can show
STYLE = ("Flat 2D painted game illustration, deep-sea expedition theme, inky navy and teal water with glowing bioluminescent accents, clean bold shapes, "
         "soft rim light, gentle grain, no 3D render, no photo realism, no text, no letters, no numbers, no logos.")
A = []
def add(stem, kind, w, h, ratio, alpha, wave, slot, prompt): A.append(dict(stem=stem, kind=kind, w=w, h=h, ratio=ratio, alpha=alpha, wave=wave, slot=slot, prompt=prompt))
add('bg-title', 'bg', 1080, 1920, '9:16', False, 1, 'Title screen background (#title, cover)', 'A small research submarine with warm lit portholes descending into a vast dark ocean trench, a faint glowing ring pulsing far below, drifting particles, calm empty water in the upper third.')
add('bg-table', 'board', 1080, 1920, '9:16', False, 1, 'Play table behind the cards (#board, cover)', 'The inside of a submarine control room seen from above as a round navy chart table with a soft teal sonar grid etched into it, dim and calm so cards stay readable, darker edges.')
add('logo-emblem', 'ui', 512, 512, '1:1', True, 1, 'Title emblem in the sonar ring (#title .sonar-ring)', 'A round brass diving-helmet emblem with a glowing teal sonar wave across the visor, single object on plain white.')
SUITS = [('coral', 'Coral', 'a branching pink coral fan with tiny glowing polyps'), ('kelp', 'Kelp', 'tall green kelp fronds swaying with air bubbles'), ('tide', 'Tide', 'rolling blue tide waves curling over each other'), ('amber', 'Amber', 'a warm golden sunburst shining down through the water'), ('sonar', 'Sonar', 'violet concentric sonar rings pulsing from a bright centre')]
for s, n, desc in SUITS:
    add('card-' + s, 'card', 600, 900, '2:3', False, 1, n + ' suit card face (every ' + n + ' card; the rank is drawn by the game top-left)', 'A playing card face filled edge to edge with ' + desc + ', the motif in the lower right half, a plain calm area in the upper left corner, a thin pale border.')
add('card-back', 'card', 600, 900, '2:3', False, 1, 'Card back (crew card counts in the seat panels)', 'A playing card back: a symmetrical navy pattern of a submarine silhouette inside a teal sonar ring, ornate pale border.')
for s, n, desc in SUITS[:4]:
    add('task-' + s, 'card', 600, 900, '2:3', False, 1, n + ' task card (task pool, zoom; rank drawn by the game)', 'A small mission card with a golden brass frame and a clipboard texture, showing ' + desc + ' in a round porthole window in the centre.')
CREW = [('you', 'You', 'a young diver with short hair, determined smile, teal wetsuit'), ('ines', 'Ines', 'Captain Ines, a calm woman in her fifties with grey braids and a navy captain coat'),
        ('bram', 'Bram', 'Bram, a broad bearded engineer with a wrench and oil-stained overalls'), ('kito', 'Kito', 'Kito, a cheerful radio operator with big headphones and freckles'),
        ('odile', 'Odile', 'Odile, the ship doctor, tall with round glasses and a red scarf'), ('drone', 'Drone', 'a small round yellow underwater drone with one big glowing lens and two little propellers')]
for s, n, desc in CREW:
    add('portrait-' + s, 'portrait', 512, 512, '1:1', False, 1, n + ' seat portrait (round avatar in the seat panel; cast in the Story)', 'Head and shoulders portrait of ' + desc + ', soft blue underwater light, plain dark teal background.')
# wave 2: every remaining piece the rules use
TOK = [('token-order', 'Numbered order token frame (1-5; the number is drawn by the game)', 'A round white enamel token with a thick golden rim, empty centre, single object on plain white.'),
       ('token-relative', 'Arrow order token frame (>, >>, >>>, >>>>; arrows drawn by the game)', 'A round pale blue enamel token with a silver rim and an empty centre, single object on plain white.'),
       ('token-final', 'Final task token (omega: the last task)', 'A round deep red enamel token with a golden rim and a small anchor engraved in the centre, single object on plain white.'),
       ('token-signal', 'Signal (radio) token beside a shown card', 'A small brass radio buoy with a teal light on top, single object on plain white.'),
       ('token-captain', 'Captain badge on the seat panel', "A golden captain's cap badge with a ship wheel, single object on plain white."),
       ('icon-flare', 'Flare button icon (distress signal: pass one card)', 'A bright red emergency flare burning with orange sparks, single object on plain white.'),
       ('icon-signal', 'Signal button icon', 'A handheld brass radio with a pulsing teal wave, single object on plain white.'),
       ('icon-trick', 'Tricks won marker', 'A neat stack of three face-down cards tied with a teal ribbon, single object on plain white.'),
       ('icon-deadzone', 'Dead zone rule icon (signals lose their meaning)', 'A radio buoy wrapped in grey static fog, single object on plain white.'),
       ('icon-silence', 'Silent running rule icon (no signals)', 'A brass radio with a cloth tied over its speaker, single object on plain white.'),
       ('icon-jammed', 'Jammed relay rule icon (signals from trick 2 or 3)', 'A tangled antenna with small sparks, single object on plain white.'),
       ('icon-decide', "Captain decides rule icon", 'A captain pointing hand holding a single golden card, single object on plain white.'),
       ('icon-share', 'Captain shares the tasks rule icon', 'Four golden cards fanned out evenly in a circle, single object on plain white.'),
       ('icon-notrick', 'One diver wins no tricks rule icon (the fever)', 'A diving helmet with a thermometer and a small fever cloud, single object on plain white.'),
       ('icon-onetrick', 'One diver wins exactly one trick rule icon', 'A single card held up by a gloved diver hand, single object on plain white.'),
       ('icon-sonar-goal', 'Sonar must win rule icon', 'A violet sonar ring with a golden star in its centre, single object on plain white.')]
for stem, slot, pr in TOK: add(stem, 'token' if stem.startswith('token') else 'icon', 256, 256, '1:1', True, 2, slot, pr)
# wave 3: polish
add('stamp-complete', 'fx', 1024, 512, '2:1', True, 3, 'Mission complete stamp (the clutch final trick)', 'A big green rubber stamp impression shaped like a rounded rectangle with a check mark and a tiny submarine, inked texture, slightly rotated, single object on plain white.')
add('stamp-lost', 'fx', 1024, 512, '2:1', True, 3, 'Mission lost stamp', 'A big red rubber stamp impression shaped like a rounded rectangle with a cracked porthole, inked texture, slightly rotated, single object on plain white.')
add('fx-ping', 'fx', 512, 512, '1:1', True, 3, 'Sonar ping ripple when a signal is sent', 'Bright teal concentric ripple rings expanding from a glowing dot, soft glow, single object on plain white.')
add('bg-map', 'bg', 1080, 1920, '9:16', False, 3, 'Story logbook map background', 'A long vertical cutaway of the ocean from sunny shallows at the top through kelp forests and a rocky gate to a glowing abyss at the bottom, an empty winding path for markers.')
for i, (t, d) in enumerate([('act1', 'sunlit shallows with coral and kelp'), ('act2', 'a dark rocky gate guarded by a rusted outpost tower'), ('act3', 'a black abyss with a giant glowing spiral of light')], 1):
    add('banner-' + t, 'bg', 1200, 400, '3:1', False, 3, 'Act %d banner on the Story map' % i, 'A wide panoramic banner of ' + d + ', painted, calm centre area.')
for stem, n, d in [('boss-warden', 'The Warden (act 1 boss)', 'an ancient automated lighthouse outpost on the sea floor with a single cold searchlight eye and barnacled metal'),
                   ('boss-swarm', 'Gatekeeper Swarm (act 2 boss)', 'a swirling cloud of tiny glowing teal drones forming a watchful face'),
                   ('boss-source', 'The Source (act 3 boss)', 'a vast glowing violet spiral of light in the abyss, patient and enormous, with faint rings')]:
    add(stem, 'portrait', 768, 768, '1:1', False, 3, n + ' boss portrait (Story boss card)', 'Portrait of ' + d + ', dramatic underwater light, plain dark background.')
add('result-complete', 'bg', 1080, 1920, '9:16', False, 3, 'Result screen background after a won mission', 'The submarine rising toward a bright surface with sunbeams and a cheering pod of dolphins, calm open water in the middle.')
add('result-lost', 'bg', 1080, 1920, '9:16', False, 3, 'Result screen background after a lost mission', 'The submarine resting on a dim sandy sea floor with a single lamp on, a few curious fish, calm and hopeful, open water in the middle.')
stems = [a['stem'] for a in A]; assert len(stems) == len(set(stems))
json.dump({'style': STYLE, 'items': A}, open(D / 'assets.json', 'w'), indent=1)
FL = SP / 'next-wave' / 'flow-2d' / SLUG; FL.mkdir(parents=True, exist_ok=True)
for f in FL.glob('prompts-wave*.json'): f.unlink()
groups = collections.defaultdict(dict)
for a in A: groups[(a['wave'], a['ratio'].replace(':', 'x'))][a['stem']] = STYLE + ' ' + a['prompt']
for (w, r), cards in sorted(groups.items()): json.dump({'cards': cards}, open(FL / ('prompts-wave%d-ratio-%s.json' % (w, r)), 'w'), indent=1)
MU = SP / 'next-wave' / 'music' / SLUG; MU.mkdir(parents=True, exist_ok=True)
cues = {'game': SLUG, 'note': 'Files go to games/deep-signal/music/<slot>-a.mp3 and <slot>-b.mp3 (gx-music slots).', 'cues': [
  {'slot': 'menu', 'loop': True, 'len': '1:30', 'prompt': 'Calm ambient underwater theme, slow warm synth pads, soft sonar pings, distant whale-like swells, hopeful, 70 bpm.'},
  {'slot': 'dive', 'loop': True, 'len': '2:00', 'prompt': 'Focused puzzle-thinking music, light marimba and muted plucks over deep pads, gentle pulse, curious, 90 bpm.'},
  {'slot': 'tense', 'loop': True, 'len': '1:00', 'prompt': 'The last tricks: same palette as the dive theme with a ticking pulse, low strings rising, tense but not scary, 100 bpm.'},
  {'slot': 'victory', 'loop': False, 'len': '0:08', 'prompt': 'Short triumphant sting, bright brass and chimes resolving upward, like surfacing into sunlight.'},
  {'slot': 'defeat', 'loop': False, 'len': '0:06', 'prompt': 'Short gentle sting of a missed chance, descending soft piano with a muffled sonar ping, not harsh.'}]}
json.dump(cues, open(MU / 'cues-wave1.json', 'w'), indent=1)
TEMP_ART = [('icon-signal', 'delapouite/radio-tower'), ('token-signal', 'delapouite/radio-tower'), ('icon-flare', 'delapouite/torch'), ('token-captain', 'delapouite/ship-wheel'), ('icon-trick', 'delapouite/stack'),
  ('icon-silence', 'delapouite/silenced'), ('icon-deadzone', 'delapouite/fog'), ('icon-jammed', 'lorc/static'), ('icon-decide', 'lorc/pointing'), ('icon-share', 'delapouite/card-exchange'), ('icon-notrick', 'lorc/gas-mask'),
  ('icon-onetrick', 'lorc/fishing-hook'), ('icon-sonar-goal', 'lorc/radar-sweep'), ('fx-ping', 'lorc/sonic-shout'), ('logo-emblem', 'delapouite/diving-helmet'), ('boss-warden', 'delapouite/lighthouse'), ('boss-swarm', 'lorc/tornado'),
  ('boss-source', 'lorc/spiral-shell'), ('card-coral', 'delapouite/coral'), ('card-kelp', 'lorc/curled-leaf'), ('card-tide', 'lorc/wave-crest'), ('card-amber', 'lorc/sun'), ('card-sonar', 'lorc/radar-sweep'), ('card-back', 'delapouite/periscope'),
  ('task-coral', 'delapouite/coral'), ('task-kelp', 'lorc/curled-leaf'), ('task-tide', 'lorc/wave-crest'), ('task-amber', 'lorc/sun'), ('portrait-you', 'delapouite/diving-helmet'), ('portrait-ines', 'delapouite/captain-hat-profile'),
  ('portrait-bram', 'lorc/spanner'), ('portrait-kito', 'delapouite/headphones'), ('portrait-odile', 'delapouite/stethoscope'), ('portrait-drone', 'delapouite/periscope'), ('token-final', 'lorc/anchor'),
  ('token-order', 'code-drawn disc'), ('token-relative', 'code-drawn disc')]
# ---------- ASSET-CHECK: every id the rules and campaign use has a stem and a prompt
need = []
for s, n, _ in SUITS: need.append(('card', n + ' cards (all ranks)', 'card-' + s))
for s, n, _ in SUITS[:4]: need.append(('task card', n + ' task cards (9 each)', 'task-' + s))
need.append(('card', 'card back (hidden hands)', 'card-back'))
for s, n, _ in CREW: need.append(('character', n, 'portrait-' + s))
for cid, stem in [('warden', 'boss-warden'), ('swarm', 'boss-swarm'), ('source', 'boss-source')]: need.append(('boss', camp['cast'][cid]['name'], stem))
need += [('token', 'order tokens 1-5', 'token-order'), ('token', 'arrow tokens > >> >>> >>>>', 'token-relative'), ('token', 'final task token (omega)', 'token-final'), ('token', 'signal (radio) token', 'token-signal'), ('token', 'captain (Sonar 4 holder)', 'token-captain'),
         ('icon', 'flare (distress signal)', 'icon-flare'), ('icon', 'signal button', 'icon-signal'), ('icon', 'tricks won', 'icon-trick')]
for sp, stem in [('dead', 'icon-deadzone'), ('nocomm', 'icon-silence'), ('late', 'icon-jammed'), ('decide', 'icon-decide'), ('dist', 'icon-share'), ('notrick', 'icon-notrick'), ('onetrick', 'icon-onetrick'), ('sonar', 'icon-sonar-goal')]:
    need.append(('icon', 'special rule: ' + sp + ' (missions ' + ', '.join(str(m['n']) for m in M if m['sp'] and sp in m['sp']) + ')', stem))
need += [('board', 'play table', 'bg-table'), ('background', 'title screen', 'bg-title'), ('background', 'story map', 'bg-map'), ('background', 'act 1-3 banners', 'banner-act1'), ('background', 'act 2 banner', 'banner-act2'), ('background', 'act 3 banner', 'banner-act3'),
         ('background', 'result won', 'result-complete'), ('background', 'result lost', 'result-lost'), ('fx', 'mission complete stamp', 'stamp-complete'), ('fx', 'mission lost stamp', 'stamp-lost'), ('fx', 'signal ping', 'fx-ping'), ('ui', 'title emblem', 'logo-emblem')]
prompted = set()
for f in FL.glob('*.json'): prompted |= set(json.load(open(f))['cards'])
rows = ['| kind | id the game uses | stem | in assets.json | Flow prompt |', '|---|---|---|---|---|']
gaps = 0
for k, what, stem in need:
    a, p = stem in stems, stem in prompted; gaps += (not a) + (not p)
    rows.append('| %s | %s | %s | %s | %s |' % (k, what, stem, 'yes' if a else 'NO', 'yes' if p else 'NO'))
unused = [s for s in stems if s not in {n[2] for n in need}]
open(D / 'ASSET-CHECK.md', 'w').write('# Deep Signal asset check (generated by gen.py)\n\nEvery distinct card, task, piece, character, boss, board, background, icon and effect the rules and campaign.json use.\n\n'
  + 'Required: %d · in assets.json: %d · prompted: %d · **gaps: %d**\n\n' % (len(need), sum(1 for n in need if n[2] in stems), sum(1 for n in need if n[2] in prompted), gaps)
  + '\n'.join(rows) + '\n\nExtra slots not tied to a rules id: ' + (', '.join(unused) or 'none') + '\n\nMusic: one cue per gx-music slot (menu, dive, tense, victory, defeat) in `games-src/next-wave/music/deep-signal/cues-wave1.json`.\n')
waves = collections.Counter(a['wave'] for a in A)
open(D / 'ASSETS.md', 'w').write('# Deep Signal pictures\n\n%d named slots in `assets.json` (wave 1: %d, wave 2: %d, wave 3: %d). Each fills `games/deep-signal/media/<stem>.webp`; until a file exists the game draws a tidy placeholder.\n\n' % (len(A), waves[1], waves[2], waves[3])
  + '| wave | what | stems |\n|---|---|---|\n| 1 | first minute: title, table, emblem, 5 card faces, card back, 4 task cards, 6 portraits | ' + ', '.join(a['stem'] for a in A if a['wave'] == 1) + ' |\n'
  + '| 2 | every other piece the rules need: order/arrow/final tokens, signal, captain, rule icons | ' + ', '.join(a['stem'] for a in A if a['wave'] == 2) + ' |\n'
  + '| 3 | polish: stamps, ping, story map and act banners, boss portraits, result screens | ' + ', '.join(a['stem'] for a in A if a['wave'] == 3) + ' |\n\n'
  + 'Prompts: `games-src/next-wave/flow-2d/deep-signal/prompts-waveN-ratio-WxH.json` (style block + subject, 2D only, no text in pictures).\n\n'
  + '## Drop in finished pictures (3 steps)\n1. Save the files as `<stem>.png/.webp` in `assets-inbox/deep-signal/`.\n2. Run `python3 games-src/scripts/ingest-assets.py deep-signal` (resizes to the slot and writes `games/deep-signal/media/<stem>.webp`; see PLAYBOOK "Finished pictures from the owner").\n3. Rebuild: `python3 games-src/scripts/build-all.py deep-signal`. build.py lists the files present; no code changes.\n\n'
  + '## Temporary pictures (until the Flow art arrives)\n37 pictures (game-icons glyphs on code-drawn card, task, portrait and token shapes) rendered from game-icons.net by `temp-art/make.js` into `temp-art/<stem>.webp`; `python3 games-src/deep-signal/temp-art/install.py` copies them into `games/deep-signal/media/` (never over a finished picture).\n'
  + 'Licence: CC BY 3.0 (https://creativecommons.org/licenses/by/3.0/), source https://game-icons.net via https://github.com/game-icons/icons; credit kept in the game (Menu > About).\n\n'
  + '| stem | icon | author |\n|---|---|---|\n'
  + ''.join('| %s | %s | %s |\n' % (s, ic, 'Lorc' if ic.startswith('lorc') else 'Delapouite' if ic.startswith('delapouite') else 'own code') for s, ic in TEMP_ART)
  + '\nNot used: print-and-play or workshop scans of the original cards (publisher art), and kenney.nl (blocked by the network proxy here).\n\n'
  + 'Wiring: card faces, task cards and portraits use `data-art` on the card / avatar; title, table, emblem, stamp, buttons and tokens also carry `data-art`. Boss portraits feed the Story cast.\n')
print('assets', len(A), dict(waves), 'gaps', gaps)
