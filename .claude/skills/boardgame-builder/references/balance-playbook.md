# Balance playbook (the gauntlet loop)

## Loop discipline
- Change **one** lever per round, name it, and keep a round log (round, lever, games, split, endings, avg turns). Revert levers that make things worse.
- Sample size: 20 games is noise (±20 points swing seen). Decide on ≥60 games; confirm the final state on ≥100 by pooling batches of the same build.
- Single commands die at 300 s. Run `node scripts/gauntlet.js file.html 20 > gN_i.txt &` ×3–4 then `wait`, and read the files in a separate command if needed.

## Metrics to track
Win split, each ending's count, average/min/max turns, battles, captures, cards played, special events (reveals, hunts, eliminations), errors, stalls. A healthy game shows all endings, games inside the box playtime, and resources visibly used.

## Levers, roughly from safest to riskiest
1. **AI habits** (garrisons, when to attack, when to use special actions, sending characters to where they matter). Fix these first; a lopsided split is often one side's AI being dumb.
2. **Setup numbers** (starting garrisons, political positions, starting resources).
3. **Map geometry** (path lengths, which strongholds sit near the front). A shorter map than the real board makes race conditions too fast.
4. **Thresholds** (victory points, track lengths). Change only to compensate for map/abstraction differences, and tell the user.
5. **Core rules**: don't, unless you'd mis-implemented them.

## Lessons from Shardfall (a huge area-control epic)
- A simplified one-unit-type version was "boring" at any balance; the full rules fixed engagement, not tuning.
- The hidden journey was too fast because the map path was 5 regions (real board ~9+). Lengthening the path and the Mordor track fixed pacing more than any Hunt tweak.
- Moving dice from one side's military to its hunting made the *other* side win more by the military route: levers interact across win conditions. Watch all endings, not just the split.
- The Free AI hoarding all companions as damage shields made corruption wins nearly impossible; making it send companions home (as humans do) restored the threat.
- Throne AI reinforcing every mildly threatened settlement starved its politics and Minions (its dice economy). Order AI priorities: build the engine (politics, extra dice), then defend real threats, then expand.
- Leaving key objectives lightly garrisoned let the enemy walk in (an empty Shadegate cost several games). Garrison rules by objective value.
- Guide/character abilities that zero out damage (−1 on a 1) were too strong; clamp to a minimum.
- Final state reached: 60/40 over 100 games, all endings seen, ~9 turns. Report the residual skew honestly.
