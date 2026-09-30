#!/usr/bin/env python3
"""Build cards.json for Robinson Crusoe: Adventures on the Cursed Island (base game).
Inputs: data/*.tsv (transcribed from card scans) + structured data below.
Sources are referenced by short keys, defined in SOURCES."""
import json, re, os

HERE = os.path.dirname(os.path.abspath(__file__))
D = os.path.join(HERE, 'data')

SOURCES = {
    'scan_gt': 'English card scans in github.com/georgetupling/robinson-crusoe (Assets/Resources/Sprites|Materials), 2nd-printing English layout; transcribed visually',
    'json_gt': 'github.com/georgetupling/robinson-crusoe Assets/Resources/Data/*-complete.json (deck composition incl. duplicate copies)',
    'scan_cd_pl': 'Polish card scans in github.com/CommieDwarf/Robinson-Crusoe-Adventure-On-The-Cursed-Island client/public/UI (translated to English by us)',
    'code_cd': 'github.com/CommieDwarf/Robinson-Crusoe-Adventure-On-The-Cursed-Island server/src (TypeScript implementation)',
    'rb1': '1st-edition English rulebook (Portal Publishing 2012; 1j1ju print, 20 pp) from github.com/jrollman123/boardgame_instruction_RAG robinson_crusoe_rulebook.pdf',
    'qr_kjili': 'github.com/Kjili/boardgame-quickrules robinson_crusoe.rst (fan quick reference)',
}

def res_alt(r):
    return '/' in r

def slug(s):
    return re.sub(r'[^a-z0-9]+', '-', s.lower()).strip('-')

def tsv(name):
    rows = []
    for line in open(os.path.join(D, name), encoding='utf-8'):
        line = line.rstrip('\n')
        if not line or line.startswith('#'):
            continue
        rows.append(line.split('\t'))
    return rows

cards = []

# ---------------- EVENT deck (incl. 3 Wreckage cards) ----------------
EVENT_COUNTS = {'Storm': 2}  # json_gt lists Storm twice
for name, icon, ev, tname, pawns, req, reward, teff in tsv('events.tsv'):
    rec = {'id': 'event-' + slug(name), 'deck': 'wreckage' if icon == 'wreckage' else 'event',
           'name': name, 'count': EVENT_COUNTS.get(name, 1)}
    if icon.startswith('adventure:'):
        rec['icon'] = 'adventure'; rec['adventure_token'] = icon.split(':')[1]
    else:
        rec['icon'] = icon  # book | wreckage
    rec['event_effect'] = ev
    rec['threat'] = {'name': tname, 'pawns': pawns}
    m = re.search(r'Weapon level (\d)', req)
    reqs = {}
    if m: reqs['weapon'] = int(m.group(1))
    items = re.findall(r'(Shovel|Fire|Knife|Rope)\s*\(item\)', req)
    if items: reqs['items'] = items
    if items and res_alt(req): reqs['item_or_resource'] = True
    res = re.findall(r'(\d) (wood|fur|food)', req)
    if res:
        reqs['resources'] = [{'qty': int(q), 'type': t} for q, t in res]
        if '/' in req: reqs['resources_mode'] = 'one_of'; reqs['alternatives'] = req  # e.g. "1 wood / 1 fur" or "1 wood / Shovel"
    if req not in ('-', '') and not reqs: reqs['text'] = req
    rec['threat']['requirements'] = reqs
    rec['threat']['reward'] = reward
    rec['threat_effect'] = teff
    rec['source'] = ['scan_gt', 'json_gt']
    if name in ('Sunny Beach',):
        rec['note'] = 'Present in English scans + json_gt; absent from the Polish implementation (code_cd). Possibly a later-printing card; verify.'
    cards.append(rec)

# ---------------- ADVENTURE decks ----------------
ADV_COUNTS = {('build', 'Laborious Work'): 2, ('explore', 'Signs of Fire'): 2, ('gather', 'End of Source'): 5}
for name, deck, eff, evn, eve in tsv('adventures.tsv'):
    rec = {'id': f'adv-{deck}-' + slug(name), 'deck': f'adventure-{deck}', 'name': name,
           'count': ADV_COUNTS.get((deck, name), 1), 'effect': eff,
           'shuffle_into_event_deck': ('Shuffle' in eff or 'shuffle' in eff)}
    rec['decide'] = eff.startswith('DECIDE')
    if evn != '-':
        rec['event'] = {'name': evn, 'effect': eve}
    fm = re.search(r'Fight a Beast: strength (\d)(?:, weapon (-?\d|-), food (\d|-), fur (\d|-), palisade (-?\d))?', eve if evn != '-' else eff)
    if fm:
        g = fm.groups()
        rec['beast_fight'] = {'strength': int(g[0]), 'weapon_loss': (abs(int(g[1])) if g[1] and g[1] != '-' else 0),
                              'food': (int(g[2]) if g[2] and g[2] != '-' else 0), 'fur': (int(g[3]) if g[3] and g[3] != '-' else 0),
                              'palisade_loss': (abs(int(g[4])) if g[4] else 0)}
    rec['source'] = ['scan_gt', 'json_gt']
    if (deck, name) in ADV_COUNTS:
        rec['count_source'] = 'json_gt duplicate entries'
    if name == 'Tracks of a Predator':
        rec['note'] = 'Scan exists; missing from json_gt list (json_gt gather deck has 29 entries). Count 1 assumed.'
    cards.append(rec)

# ---------------- MYSTERY deck ----------------
MYS_COUNTS = {'Unfortunate Adventure': 2}
for name, typ, eff in tsv('mystery.tsv'):
    rec = {'id': f'mystery-{typ}-' + slug(name), 'deck': 'mystery', 'type': typ, 'name': name,
           'count': MYS_COUNTS.get(name, 1)}
    parts = eff.split(' || ')
    rec['effect'] = parts[0]
    if len(parts) > 1:
        m = re.match(r"EVENT '([^']+)'[^:]*: (.*)", parts[1])
        rec['event'] = {'name': m.group(1), 'effect': m.group(2)}
    rec['shuffle_into_event_deck'] = 'Shuffle into the Event deck' in parts[0] or 'shuffle into the Even' in parts[0]
    rec['keep'] = 'Keep this card' in eff
    fm = re.search(r'Fight a Beast: strength (\d)', parts[0])
    if fm: rec['beast_strength'] = int(fm.group(1))
    rec['stop_drawing'] = 'Stop drawing Mystery cards' in eff
    rec['crossed_bones_icon'] = 'crossed-bones' in eff
    if name in ('Candles', 'Hammock', 'Unfortunate Adventure', 'Big Ape'):
        rec['source'] = ['scan_cd_pl', 'code_cd']
        rec['note'] = 'No English scan found; translated from the Polish card.'
        if name == 'Unfortunate Adventure':
            rec['count_source'] = 'code_cd image folder has a second copy file ("- kopia"); 2 copies makes the deck total 52 which matches the published component count. Unverified.'
    else:
        rec['source'] = ['scan_gt']
    cards.append(rec)

# ---------------- BEAST deck ----------------
for name, st, wl, food, fur, sp in tsv('beasts.tsv'):
    cards.append({'id': 'beast-' + slug(name), 'deck': 'beast', 'name': name, 'count': 1,
                  'strength': int(st), 'weapon_loss': int(wl), 'food': int(food), 'fur': int(fur),
                  'palisade_loss': 0, 'special': sp or None, 'source': ['scan_gt', 'json_gt']})

# ---------------- STARTING ITEMS ----------------
for name, uses, eff in tsv('items.tsv'):
    rec = {'id': 'item-' + slug(name), 'deck': 'starting-item', 'name': name, 'count': 1, 'uses': int(uses), 'effect': eff,
           'source': ['scan_gt'] if name != 'Bible' else ['scan_cd_pl', 'code_cd']}
    if name == 'Bible':
        rec['note'] = 'Polish edition only in our sources (not among English scans, 7 cards); 1st-ed rulebook says 8 Starting Item cards, so the English 8th card is Bible or unknown.'
    cards.append(rec)

# ---------------- INVENTIONS ----------------
for name, kind, reqs, eff in tsv('inventions.tsv'):
    r = {'terrain': None, 'items': [], 'resources': []}
    m = re.search(r'terrain: (\w+)', reqs)
    if m: r['terrain'] = m.group(1)
    m = re.search(r'items?: ([A-Za-z, ]+?)(?:;|$)', reqs)
    if m: r['items'] = [x.strip() for x in m.group(1).split(',')]
    m = re.search(r'cost: (.+)$', reqs)
    if m: r['resources'] = m.group(1)
    rec = {'id': 'inv-' + slug(name), 'deck': 'invention', 'name': name, 'count': 1,
           'kind': kind.split(':')[0], 'requirements': r, 'item_effect': eff, 'source': ['scan_gt', 'json_gt']}
    if kind.startswith('personal'):
        rec['owner'] = kind.split(':')[1]
        rec['builder_reward_determination'] = 2
    cards.append(rec)

# ---------------- ISLAND TILES ----------------
for tid, terr, srcs, beast, disc, totem, shelter, note in [r + [''] * (8 - len(r)) for r in tsv('tiles.tsv')]:
    cards.append({'id': f'tile-{tid}', 'deck': 'island-tile', 'name': f'Island tile {tid}', 'count': 1,
                  'number': int(tid), 'terrain': terr, 'sources': srcs.split(','), 'beast_icon': beast == '1',
                  'discovery_tokens': int(disc), 'totem': totem == '1', 'natural_shelter': shelter == '1',
                  'note': note or None, 'source': ['scan_gt', 'json_gt']})

# ---------------- DISCOVERY TOKENS ----------------
DISC = [
    ('Candles', 2, 'One-time additional (brown) pawn for the Build action; discard after use.', None),
    ('Fallen Tree', 2, 'Get 1 wood. Must be traded in immediately at end of Action phase (per qr_kjili).', None),
    ('Goat', 2, 'If Weapon >= 1: exchange for 1 food + 1 fur (to Available resources). Not during resolution of actions.', None),
    ('Healing Herbs', 1, 'With Pot: build Medicine (Cure) for free, without an action.', 'Pot'),
    ('Herbs', 1, 'With Pot: Morale +1.', 'Pot'),
    ('Large Leaves', 1, 'Ignore 1 Rainy Cloud in the Weather phase.', None),
    ('Nourishing Larvae', 2, 'Get 2 food (perishable). Must be traded in immediately at end of Action phase (per qr_kjili).', None),
    ('Old Machete', 1, '+1 Weapon.', None),
    ('Poison', 1, 'With Pot: +2 Weapon.', 'Pot'),
    ('Thorny Bushes', 1, '+1 Palisade (requires a Shelter).', None),
    ('Tobacco', 1, 'Morale +1.', None),
    ('Treasure', 2, 'Draw Mystery cards until the first Treasure and resolve it.', None),
    ('Vegetables', 1, 'With Pot: heal 2 wounds (2 on one character or 1 on two), in the Night phase (qr_kjili).', 'Pot'),
]
for name, n, eff, req in DISC:
    cards.append({'id': 'disc-' + slug(name), 'deck': 'discovery-token', 'name': name, 'count': n, 'effect': eff,
                  'requires': req, 'source': ['scan_gt', 'json_gt', 'rb1']})
for sym in ('Cross', 'Line', 'Two Lines', 'Saltire'):
    cards.append({'id': 'disc-scenario-' + slug(sym), 'deck': 'discovery-token', 'name': f'Scenario token ({sym} symbol)', 'count': 1,
                  'effect': 'Meaning defined per scenario sheet (4 "Discoveries" listed on each sheet, keyed by symbol).',
                  'source': ['scan_gt', 'json_gt'],
                  'note': 'Mapping symbol->sheet entry not transcribed; use sheet order (1st..4th discovery). code_cd maps them as scenario-1..4 in sheet order.'})

# ---------------- CHARACTERS ----------------
def life(track):
    """track: list of ints = hearts between morale arrows; returns dict"""
    total = sum(track)
    arrows, acc = [], 0
    for seg in track[:-1]:
        acc += seg; arrows.append(acc)
    return {'hearts': total, 'dies_at_wound': total + 1, 'morale_down_after_wounds': arrows,
            'segments': track}

CHARS = [
    ('Carpenter', 'Snare', [4, 3, 2, 3], [
        ('Economical Construction', 2, 'Spend 1 wood fewer during one Action of any type.'),
        ('Craftsmanship', 2, 'Reroll any brown (Build) die during your Action.'),
        ('A New Idea', 3, 'Draw 5 Invention cards, choose 1 and place it on the board (rest set aside face-down; rb1).'),
        ('Handyman', 3, 'Get an additional pawn for one Building Action.')]),
    ('Cook', 'Fireplace', [3, 3, 2, 3, 2], [
        ("Grandma's Recipe", 2, 'Heal 2 wounds by eating (discarding) 1 food (may split among characters per rb1).'),
        ('Scrounger', 2, 'Reroll any grey (Gather) die during your Action.'),
        ('Stone Soup', 3, 'Get 1 food.'),
        ('Hooch', 3, 'Ignore 1 Rainy Cloud, or change 1 Winter Cloud into 1 Rainy Cloud (Weather phase).')]),
    ('Explorer', 'Shortcut', [5, 5, 1], [
        ('Lucky', 2, 'Reroll any green (Explore) die during your Action.'),
        ('Reconnaissance', 2, 'Draw 3 Island tiles, look, choose 1; shuffle the other 2 into the stack and place the chosen one on top.'),
        ('Motivational Speech', 3, 'Morale +1.'),
        ('Scouting', 3, 'Draw 2 Discovery tokens, keep one and discard the other.')]),
    ('Soldier', 'Spear', [4, 4, 3], [
        ('Tracking', 2, 'Look at the top card of the Hunting deck and put it back on top or at the bottom.'),
        ('Defensive Plan', 2, 'Increase Palisade or Weapon level by 1.'),
        ('Frenzy', 3, 'Temporarily get +3 Weapon during your Action.'),
        ('The Hunt', 4, 'Shuffle the top Beast card from the Beast deck into the Hunting deck, without looking at it.')]),
]
for name, inv, track, skills in CHARS:
    rec = {'id': 'char-' + slug(name), 'deck': 'character', 'name': name, 'count': 1, 'sides': ['male', 'female'],
           'sides_note': 'Male/female sides differ only in art (rb1; scans confirm identical text and life track).',
           'pawns': 2, 'personal_invention': inv, 'personal_invention_reward_determination': 2,
           'life_track': life(track), 'special_wound_spots': ['head', 'arm', 'belly', 'leg'],
           'skills': [{'name': n, 'determination_cost': c, 'effect': e, 'limit': 'once per round (black marker)'} for n, c, e in skills],
           'source': ['scan_gt', 'rb1']}
    if name == 'Soldier':
        rec['edition_note'] = ('1st-ed rulebook (rb1) lists: Tracking 2, The Hunt 3 = +1 Palisade or Weapon, Frenzy 3, '
                               'Defence Plan 4 = top Beast card on top of Hunting deck. The 2nd-printing sheet (scan) swaps the names: '
                               'Defensive Plan 2 = +1 Palisade/Weapon, The Hunt 4 = shuffle top Beast into Hunting deck.')
    if name == 'Explorer':
        rec['edition_note'] = 'rb1 lists Reconnaissance at 2 det and Explorer reroll skill; scan names it "Lucky".'
    if name == 'Cook':
        rec['edition_note'] = 'rb1 calls the reroll skill "Searching talent"; scan: "Scrounger".'
    cards.append(rec)

cards.append({'id': 'char-friday', 'deck': 'side-character', 'name': 'Friday', 'count': 1, 'pawn': 'white',
              'life_track': {'hearts': 3, 'dies_at_wound': 4, 'morale_down_after_wounds': [],
                             'note': 'Card shows start square + 3 hearts + skull. Players do not lose if Friday dies (rb1).'},
              'ability': {'determination_cost': 2, 'effect': 'May discard 2 determination to reroll any Action die once.'},
              'immunities': ['winter clouds', 'rain clouds', 'eating (no food)', 'shelter (open-air wound)'],
              'adventure_rule': '? result on Friday\'s own action = 1 wound to Friday instead of an Adventure card',
              'rules': 'Never First Player; not affected by Event cards (immediate or threat; exception Argument card per rb1 appendix); may act alone or with neutral pawns; when stacked with a character he only supports.',
              'used_in': '2-player and solo (standard); optional easier variant', 'source': ['scan_gt', 'rb1']})
cards.append({'id': 'char-dog', 'deck': 'side-character', 'name': 'Dog', 'count': 1, 'pawn': 'purple',
              'ability': 'Neutral additional pawn usable every round, only for Hunting (red) or Exploration (green); can only support (cannot act alone). Cannot die; need not be assigned.',
              'used_in': 'solo (standard); easier variant, recommended for 3 players', 'source': ['scan_gt', 'rb1']})
cards.append({'id': 'card-arrange-camp-4p', 'deck': 'special', 'name': 'Special Arranging the Camp card (4 players)', 'count': 1,
              'effect': 'Covers the Arrange Camp action space in 4-player games: each Arrange Camp action gives 2 determination OR Morale +1 (not both).',
              'source': ['scan_gt', 'rb1']})

# ---------------- SCENARIOS ----------------
SCEN = json.load(open(os.path.join(D, 'scenarios.json'), encoding='utf-8'))
for s in SCEN:
    s.setdefault('deck', 'scenario'); s.setdefault('count', 1)
    cards.append(s)

# ---------------- DICE ----------------
DICE = [
    ('die-build-wound', 'Build (brown) Wound die', ['wound'] * 4 + ['blank'] * 2, 'json_gt DiceFactory; qr_kjili "4/6 wound"; code_cd has only 2 wound faces (DISAGREES)'),
    ('die-build-success', 'Build (brown) Success die', ['success'] * 4 + ['2 determination'] * 2, 'json_gt, code_cd, qr_kjili agree'),
    ('die-build-adventure', 'Build (brown) Adventure die', ['?'] * 3 + ['blank'] * 3, 'all agree'),
    ('die-gather-wound', 'Gather (grey) Wound die', ['wound'] * 1 + ['blank'] * 5, 'all agree'),
    ('die-gather-success', 'Gather (grey) Success die', ['success'] * 5 + ['2 determination'] * 1, 'all agree'),
    ('die-gather-adventure', 'Gather (grey) Adventure die', ['?'] * 3 + ['blank'] * 3, 'all agree'),
    ('die-explore-wound', 'Explore (green) Wound die', ['wound'] * 3 + ['blank'] * 3, 'all agree'),
    ('die-explore-success', 'Explore (green) Success die', ['success'] * 5 + ['2 determination'] * 1, 'all agree'),
    ('die-explore-adventure', 'Explore (green) Adventure die', ['?'] * 5 + ['blank'] * 1, 'all agree'),
    ('die-weather-rain', 'Rain (orange) weather die', ['1 rain'] * 3 + ['2 rain'] * 2 + ['1 snow'] * 1, 'json_gt, code_cd, qr_kjili agree'),
    ('die-weather-winter', 'Winter (white) weather die', ['1 snow'] * 2 + ['2 snow'] * 2 + ['2 rain'] * 2, 'all agree'),
    ('die-weather-animals', 'Hungry Animals (red) die', ['discard 1 food', 'palisade -1', 'palisade -1', 'fight beast strength 3', 'blank', 'blank'], 'all agree'),
]
for i, n, faces, src in DICE:
    cards.append({'id': i, 'deck': 'dice', 'name': n, 'count': 1, 'faces': faces, 'source': ['json_gt', 'code_cd', 'qr_kjili'], 'agreement': src})

# ---------------- TRACKS / BOARD ----------------
cards.append({'id': 'track-morale', 'deck': 'board', 'name': 'Morale track', 'count': 1,
              'levels': [{'level': -3, 'morale_phase': 'first player discards 3 determination'},
                         {'level': -2, 'morale_phase': 'discard 2 determination'},
                         {'level': -1, 'morale_phase': 'discard 1 determination'},
                         {'level': 0, 'morale_phase': 'nothing'},
                         {'level': 1, 'morale_phase': 'gain 1 determination'},
                         {'level': 2, 'morale_phase': 'gain 2 determination'},
                         {'level': 3, 'morale_phase': 'gain 2 determination OR heal 1 wound'}],
              'start': 0, 'note': 'Missing determination to discard -> 1 wound per missing token (unfulfilled demand). Board scan shows top box "2 / +heart".',
              'source': ['scan_gt', 'rb1']})
cards.append({'id': 'board-costs', 'deck': 'board', 'name': 'Shelter / Roof / Palisade / Weapon costs', 'count': 1,
              'shelter_roof_palisade_cost': {'1': {'wood': 2, 'fur': 1, 'note': 'solo uses 2-player cost'},
                                             '2': {'wood': 2, 'fur': 1}, '3': {'wood': 3, 'fur': 2}, '4': {'wood': 4, 'fur': 3}},
              'pay_with': 'wood OR fur, never mixed', 'weapon_cost': {'wood': 1},
              'levels_unlimited': True, 'roof_palisade_require_shelter': True,
              'source': ['scan_gt', 'rb1']})
cards.append({'id': 'board-actions', 'deck': 'board', 'name': 'Action spaces', 'count': 1,
              'order': ['Threat', 'Hunting', 'Building', 'Gathering', 'Exploration', 'Arranging the Camp', 'Rest'],
              'pawns': {'Threat': '1 or 2 as printed on event card', 'Hunting': 2, 'Building': '1 (roll) or 2 (auto)',
                        'Gathering': '1 (roll) or 2 (auto); +1 per tile of distance', 'Exploration': '1 (roll) or 2 (auto); +1 per tile of distance',
                        'Arranging the Camp': '1 each', 'Rest': '1 each'},
              'source': ['rb1']})

# ---------------- TOKENS ----------------
TOK = [
    ('Determination token', 'Personal; spent on skills. Unsuccessful dice roll gives 2. Arrange Camp gives 2.'),
    ('Reroll-Success token (yellow)', 'On action space: next action of that type must reroll a success once, then discard.'),
    ('Adventure tokens (grey/brown/green ?)', 'On action space: next action of that type draws an Adventure card regardless of dice/pawns; then discard.'),
    ('Beast Strength / Greater danger token (red +1)', 'By Hunting deck: next Beast +1 strength, then discard. On tile/space: Weapon >=1 needed for any action there or acting player gets 1 wound (permanent).'),
    ('Time-consuming token (minus one pawn)', 'On action space: next action of that type needs +1 pawn, then discard. On tile/space: all actions there need +1 pawn (permanent).'),
    ('+1 wood token', 'On Build space: next wood-costing build +1 wood (then discard). On Shelter/Roof/Palisade/Weapon cost: permanent +1 wood when paying wood. On tile: +1 wood from that source.'),
    ('+1 food token', 'On Night space: each character must eat +1 food or 1 wound. On tile: +1 food from production/gather.'),
    ('Rainy Cloud token', 'Weather space: +1 rain cloud this Weather phase.'),
    ('Winter Cloud token', 'Weather space: +1 winter (snow) cloud this Weather phase.'),
    ('Storm token', 'Weather space: after other weather, Palisade -1 (or each player 1 wound).'),
    ('Shortcut token', 'Placed by Shortcut item; +1 chosen resource from that tile each Production.'),
    ('Special wound tokens (head/arm/belly/leg)', 'Placed by Adventure cards; resolved by their Event half.'),
    ('Camp / Shelter token', 'Double-sided; flipped to Shelter when shelter built.'),
    ('Number tokens 1-6', 'Scenario markers (totems etc.).'),
    ('Black markers', 'Exhausted sources, covered terrain, built scenario inventions, skill used, starting item uses.'),
    ('White markers', 'Morale marker; substitutes; Fog/Ash markers in scenarios.'),
    ('Blue markers', 'Scenario achievements (Crosses, Traps...).'),
    ('Wound markers (red cubes)', 'Life track markers.'),
    ('Resource cubes', 'Wood (brown), Fur (white), Food (yellow), Non-perishable food (orange).'),
    ('Additional pawns', 'Green (explore), brown (build), red (hunt), grey (gather), white (Friday), purple (Dog).'),
]
for n, e in TOK:
    cards.append({'id': 'token-' + slug(n), 'deck': 'token', 'name': n, 'count': None, 'effect': e, 'source': ['rb1', 'qr_kjili'],
                  'note': 'Physical quantities not captured (no component list with counts available).'})

# ---------------- WOUNDS ----------------
cards.append({'id': 'wound-special', 'deck': 'rules-ref', 'name': 'Special wounds', 'count': None,
              'effect': 'Special wound tokens on head/arm/belly/leg are placed by Adventure cards (Accident, Cut Head, Fruit, Misadventure, Nasty Wound, Spider, Sting, Thorny Bush, Twisted Ankle, Unbelievable Effort, Vipers!, Wild Berries). They have no effect by themselves; the Event half of the same card (after being shuffled into the Event deck) punishes the character carrying that token, often mitigated by Medicine. Normal wounds move the wound marker; a special wound cannot be healed by normal healing.',
              'source': ['scan_gt', 'qr_kjili']})

out = {'game': 'Robinson Crusoe: Adventures on the Cursed Island', 'bgg_id': 121921, 'publisher': 'Portal Games',
       'edition_basis': 'Card texts from English 2nd-printing scans (plus Polish scans for 4 mystery cards and Bible); rules from 1st-ed English rulebook',
       'sources': SOURCES, 'cards': cards}
json.dump(out, open(os.path.join(HERE, 'cards.json'), 'w', encoding='utf-8'), indent=1, ensure_ascii=False)
from collections import Counter
c = Counter(); n = Counter()
for x in cards:
    c[x['deck']] += 1; n[x['deck']] += (x['count'] or 0)
for k in c: print(f'{k:20s} records={c[k]:3d} physical={n[k]}')
print('total records', len(cards))
