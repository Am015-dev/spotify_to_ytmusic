# Nebula Aces: tutorial coverage (the coached first game, "Convoy Run")

The lesson is a real game: fixed seed (Kael Varro vs the raider Slate, one rock, easy AI), real dice, every legal move allowed from the first turn. Only two actions are forced with a spotlight: touch your ship, then pick any maneuver. Then a card ("Fly free") hands over, and Marshal Brecken (or Slate) speaks in ONE dismissible bubble that never blocks input, the first time a rule matters. At the result, a card walks through the player's real numbers and lists "Things you will meet later" (rules that did not come up this game, plus the always-later list). Words are in `lore.js` (`LORE.coach`); `rule:1` entries are the checklist below. `node tutor-test.js` plays a game through the UI with any legal move at 390x763 and 1440x860 and asserts each rule was explained in play OR listed on the later card.

Rule | Taught when (trigger) | Story beat (speaker)
---|---|---
Goal: destroy every enemy ship | opening bubble `goal` | Slate raids the convoy (Brecken)
Plan in secret, ship then maneuver | forced steps `ship`, `dial` | pilots plan in secret (Brecken)
Dials revealed together | `fly`: every ship has a dial | neither of you can peek (Brecken)
Green easy / red stress; asteroids hurt and skip the action | `marks`: round 2+ planning | red strains the engines, ! marks a rock (Brecken)
Activation order (lowest skill first), combat order (highest first) | `order`: first move step | Slate moves first, you shoot first (Brecken)
One action per turn | `action`: your action step | focus sharpens your shot (Brecken)
Target lock and reroll | `lock`: Lock is offered | lock on for a surer shot (Brecken)
Firing arc, range 1-3, target choice, range dice bonus | `shoot`: your target step | in your sights (Brecken)
Hit / crit / focus / blank | `dice`: your attack dice | read the dice (Brecken)
Focus token turns focus into hit | `usefocus`: a focus mod is offered | spend focus (Brecken)
Defence dice, evade cancels hits, evade token | `res1`: first shot result | hits minus evades (Brecken)
Pilot ability (Kael) | `defend`: a defence mod is offered | pilot power (Brecken)
Shields first, then hull; crits face up | `res2`: first damage | shields first (Brecken)
Stressed ship: no action, no red next | `stress`: any ship gets stress | stress (Brecken)
End of round: focus/evade vanish, locks stay | `endround`: round 2 begins | round end (Brecken)
How a battle ends, final scoring | result card | your numbers, your ships left (Brecken)
Good / poor move feedback | `goodshot` (you hit), `gothit` (Slate hits) | nice shot / got you (Brecken, Slate)

## Things you will meet later (end card, always)
Barrel roll and boost, bumping, flying off the mat, torpedoes, tied pilot skill. Any rule above that did not come up in this game is added to the card automatically.

## Honest gaps
- Which rules come up depends on the player's choices; the seed only fixes the start. A typical game explains 12-13 of 14.
- Chapters are no longer separately resumable: leaving (Leave lesson) ends the coached game; the lesson restarts from the menu.
- Missions of the core box (special objectives) are not in the game: no verified source for their objectives in the repo, so none were invented.
