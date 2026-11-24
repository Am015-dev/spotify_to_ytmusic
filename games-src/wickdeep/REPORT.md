# NEW7 report: Wickdeep (slug `wickdeep`)

Branch `shelf/W566-new-dungeon`. Not deployed, no shelf card (owner watches the video first).

## What it is
A co-op tactical hex dungeon-crawl campaign, 1-4 heroes (you control all; default 2), dark fantasy pixel art with torchlight.
Rules match the compact starter edition of the top-ranked co-op card-driven crawler (2 cards a round, initiative, top of one +
bottom of the other, lost/played piles, short and long rests, exhaustion, 6 elements, conditions, 20-card modifier decks with
advantage/disadvantage, monster stat lines and 8-card ability decks driving the monster AI, items, perks, secret goals, levels,
25-scenario branching campaign with 4 bosses). All heroes, 116 ability cards, 16 monsters + 4 bosses, 30 items and 25 maps are our
own designs (`COMPONENTS.md`). The earlier builder left no engine on this branch (only a "not built" data report), so this is new.

## Gates
- `rules-test.js`: 439 checks pass (component counts, one check per key rule, 300 headless games with invariants after every move).
- `build-all.py --quick wickdeep`: PASS (6 `?scn=` scenarios + shelf audits).
- `build-all.py --full wickdeep`: PASS twice (phone-check 6 sizes/rotations, rules-test). `games/lab.html` not committed.
- Real-touch play (`tap-play.js`): a blind tapper reaches the result screen, 188 taps, 1 dead tap, no page errors.

## Simplified on purpose (interface only; listed in rules-notes.md)
Block prompt only for knockout hits; armor items used on your turn; auto push/pull hex; auto element use; short rest offered when
hand <= 3; centre-to-centre line of sight; formula-based monster stat tables. [unverified]: exact starter counts of monster types,
items, perks and goals (we use 16+4, 30, 7-10, 10).

## Assets
Kenney Tiny Dungeon (CC0), Sprite Fusion slash/impact/heal/shield effects (MIT, header kept), Silkscreen font (OFL),
Alegreya Sans (OFL, shelf font). Logged in `games-src/THIRD-PARTY.md`.

## Cold play (independent subagent, no repo access)
Round 1: playable but fiddly, fun 3/5, 4 dead taps, 6 lost moments. Fixed: layout jump, two-tap halves, faint targets,
unclear hit maths, nagging short rest, chest-like obstacle; added Hint.
Final verdict (round 2, as given): "Full turn without reading much? Yes, mostly. The prompts now tell you what to do... Fun: 3.5/5.
Best moment: Lantern Swing killed both rats at once... dead taps 2; lost moments 2... Would I play again? Yes, now that it is
smoother." Its remaining note (a hit with no foe in reach did nothing silently) is now fixed with a "No foe in reach" message;
it also found HP and initiative numbers hard to read at first.

## Proof
`games-src/wickdeep/proof/wickdeep-first-3min.webm` (375x667, ~3 min, real taps) and `proof/shot-select.png`,
`shot-attack.png`, `shot-monster.png`, `shot-camp.png`.
