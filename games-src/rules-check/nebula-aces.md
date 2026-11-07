# nebula-aces: rules check

Adapts: the first edition (2012 core box plus waves 1-3) of a two-player tabletop starfighter skirmish: secret maneuver dials, ships move and act in ascending pilot skill, then fire in descending pilot skill, attack and defence dice, shields and a 33-card damage deck, squad-point squadron building, asteroids.

Sources checked
- Publisher core-box English rulebook PDF (host: 1jour-1jeu.com, cdn.1j1ju.com "rulebook PDF"), full text extracted and read: round structure, dials, stress, bumping, combat steps, dice modification order, damage, destroyed ships, initiative, squad building, obstacles, missions. Confidence high for everything the core box covers.
- Wiki and forum search results (stress, damage deck). A wiki page and a rules reference that would confirm later tournament and errata rules were not readable (HTTP 402), so errata-era rules are low confidence.
- games-src/xw/rules-notes.md, engine.js (setup, initiative, stress check, move/bump/obstacles, dice, preview, damage), data.js (damage deck, two ship dials), geo.js (template constants).
- Note: the notes file says the rulebook was never read directly; this check read it.

Counts: WRONG 2, MISSING 1, SIMPLIFIED 5

## Matches the rulebook (checked, no action)
- Round order (plan, activate ascending, combat descending, end), one action after the move, stress given by red and removed by green, stressed ship cannot act or fly red, and the opponent picks a non-red maneuver for it (engine.js:114-119).
- Attack die 3 hit/1 crit/2 focus/2 blank, defence die 3 evade/2 focus/3 blank (engine.js:10-11). +1 attack die at range 1 and +1 defence die at range 3, primary weapon only (engine.js:243-246).
- Defender modifies attack dice first, attacker modifies defence dice first; dice rerolled once only; evades cancel hits before crits; hit needs an uncancelled result; shields first, hits face down, crits face up, destroyed at damage cards >= hull; equal pilot skill fires simultaneously.
- Bump: back up along the template until touching, skip the action; touching ships cannot target each other; flying off the mat destroys the ship.
- Obstacle overlap: skip the action, a ship on an obstacle cannot attack, an attack crossing an obstacle gives the defender +1 die. 6 asteroids.
- Damage deck: 33 cards (7 two-damage cards + 13 types x 2), effects match the card types I know (cockpit fire, sensor, engine turns red, canopy pilot skill 0, explosion, hull breach, munitions, structural, stunned pilot, thrust fire, weapon malfunction). Confidence med on exact wording.
- Initiative: lower squad total has it; initiative wins if both last ships die together (engine.js:64, :357-360).
- Squad building: unique names once, points sum; target lock range 1-3 360 degrees; one lock at a time; focus/evade removed at end, lock and stress stay.
- Mat 914 mm (3 ft), range 100 mm bands, straight template 40 mm x speed.

## Findings
| Class | Code | What the code does | Correct rule |
|---|---|---|---|
| WRONG (med) | engine.js:136-137 | A ship whose template or base touches several asteroids rolls one attack die per asteroid. | The core rulebook says the player rolls one attack die when the maneuver overlaps an obstacle. Later errata may count per obstacle; not verifiable here. |
| WRONG (med) | engine.js:63-68, rules-notes.md R9 | Tied squad totals: a die is rolled and the winner of the roll (or the other side) chooses who has initiative. | Core rulebook: on equal totals the fixed (second-named) faction has initiative; initiative never changes. Notes call the die roll "the 2012 rule", which the 2012 text does not contain. |
| MISSING | engine.js:42-48 | No scenario missions (the core rulebook ships three special-objective missions). | Missions change setup and victory conditions. Optional content. |
| SIMPLIFIED | engine.js:74-80 | Asteroids are placed after squads are built, from 25 grid spots for humans, 6 total, spaced > range 1 apart. | Core rulebook: placed before gathering forces, alternating, only restriction is not within range 2 of an edge, then the second player picks an edge. Documented in notes. |
| SIMPLIFIED | engine.js:83-89 | Ships are deployed facing the enemy from 9 positions. | Any facing and any place entirely inside range 1 of own edge. Documented. |
| SIMPLIFIED | engine.js:3, :362 | 100 round safety cap, then points destroyed decide. | No round limit. Documented. |
| SIMPLIFIED | rules-notes.md G5 | Barrel-roll slide is offered in 5 steps, not continuous. | Template may sit anywhere along the side. Documented. |
| SIMPLIFIED | engine.js:114 (human/AI pick) | The AI picks the worst non-red maneuver for the stressed ship. | Opponent chooses freely; AI heuristic only. |

## Not verified
- The two core dials (data.js:7-8): matched my memory of the heavy fighter dial; the light fighter dial (speed 1 turns only, K-turn at 3 and 4) could not be confirmed. Low confidence.
- Template radii (bank 80/130/180, turn 35/62.5/90) and arc angles: taken from private research; no source reachable. Low.
- Pilot and upgrade point costs and pilot abilities for the 10 core pilots and 57 expansion pilots: spot-checked ~8 against memory only (all matched). Med for core, low for waves 1-3.
- Whether the damage-deck wording for "wounded pilot" matches the original text (ignore pilot ability and talents). Med.
- Whether rolling one die vs one per asteroid was changed by later official clarification. Low.

## Fixed (W391)
- WRONG one die per asteroid -> fixed (one attack die per maneuver); test "one-die-per-maneuver-not-per-asteroid" (xw/rules-test.js).
- WRONG tied squad totals use a die roll -> fixed (second-named side has initiative); test "tied-squads-second-faction-has-initiative".
- MISSING scenario missions: left (optional content, new setup and victory screens, not engine-only).
- SIMPLIFIED items now have one "Kept simple" line in the rules drawer.
