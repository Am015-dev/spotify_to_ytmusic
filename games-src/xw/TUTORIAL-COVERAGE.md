# Nebula Aces: tutorial coverage (the guided first game, "Convoy Run")

The lesson is a guided first game: fixed seed, Kael Varro vs the raider Slate, one rock, scripted dice and scripted enemy moves for rounds 1-2, so every core rule comes up every time, in the same order. Each step is ONE line of 12 words or fewer, plus ONE highlighted tap: the spotlight for the first three steps, then the ghost finger. During the scripted rounds only the taught move and action are accepted; a tap on the highlighted control moves the coach to the next line. After round 2 the same battle continues free, then the end card offers a real game. Words are in `lore.js` (`LORE.tut`, `LORE.coach`).

`node lesson-test.js [390x844]` (GX_URL set) walks it by tapping only what is highlighted, and checks every rule below was taught, in this order, at 12 words or fewer, with a highlighted control for every tap-now line. It also checks that another move or action is refused, that ships fly lowest skill first, and that the end card starts a real game. `node tutor-test.js` (URL set) still covers bubble placement and the end card.

# | Rule | Taught when | Line (12 words or fewer) | Tap
---|---|---|---|---
1 | Goal | spotlight step `goal0` | Destroy Slate’s ship before he destroys yours. | Next
2 | Plan in secret | spotlight `ship` | Tap your ship to plan its move in secret. | your ship
3 | Maneuver dial, green easy | spotlight `dial` | Tap the green straight 2. Green moves are easy. | straight 2
4 | Dials revealed together | `fly` | Both dials stay hidden. Tap Fly to reveal them. | Fly
5 | Activation: lowest skill first | `order` | Lowest pilot skill moves first. Slate is 3, you are 8. | (watch; ships fly one by one)
6 | One action | `action` | After moving, take one action. Focus first. | Focus
7 | Boost and barrel roll | `moves` | Some ships can also boost forward or barrel roll sideways. | (watch: Kael has neither)
8 | Combat order, arc, range 1-3 | `shoot` | Highest skill fires first. Shoot an enemy in your arc, range 1-3. | Slate
9 | Attack dice faces | `dice` | Hit and crit hurt. Focus needs a token. Blank misses. | (watch)
10 | Spend focus | `usefocus` | Spend your focus token: focus faces become hits. | Use focus
11 | Range 3 defence bonus, evades cancel hits | `res1` | Range 3 gave him a defence die. Each evade cancels a hit. | continue
12 | Shields, hull, face-up crits | `res2` | Damage takes shields first, then hull. Crits are face-up cards. | continue
13 | Pilot ability | `defend` | Kael turns one focus result into an evade. | (defence step)
14 | End of round | `endround` | Unused focus and evade tokens vanish. Locks stay. | continue
15 | Rocks | `marks` | A path through a rock hurts and skips your action. | straight 1
16 | Stress | `stress` | Red move means stress: no action, no red until green. | (watch Slate's red turn)
17 | Target lock | `lock` | Lock on: you may reroll attack dice against him. | Lock

## Things you will meet later (end card, always)
Barrel roll and boost, bumping, flying off the mat, torpedoes, tied pilot skill. Any rule above that did not come up in this game is added to the card automatically.

## Honest gaps
- Bumping, flying off the mat, torpedoes and tied pilot skill are listed on the end card, not played.
- Chapters are no longer separately resumable: leaving (Leave lesson) ends the coached game; the lesson restarts from the menu.
- Missions of the core box (special objectives) are not in the game: no verified source for their objectives in the repo, so none were invented.
