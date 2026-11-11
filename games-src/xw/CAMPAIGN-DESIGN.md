# Nebula Aces: campaign design ("The Crown Rift Run")

## Premise
Sector Nebula-7. The Free Compact (fac 0) has to run a supply convoy through the Iron Armada's (fac 1) blockade at
the Crown Rift. You fly Kael Varro, a veteran Lancer pilot who was only meant to be the convoy's guard.
Marshal Odile Brecken briefs every sortie. Act 1 trains Kael on drones and then takes the convoy through the gate.
In Act 2 the Armada answers with bombers, an ambush and its top ace. In Act 3 the Compact breaks into the Rift,
gets the courier's codes through and faces Lord Castigan. The story builds on the 4 sorties already in `story.js`
(`SORTIES`: convoy escort, bomber intercept, Veil Station ambush, the dark lord), so the chatter and the briefing
text (`briefingHTML`) stay consistent.

## Rival aces (bosses and named opponents)
| Ch | Ace | Personality | aiLevel / aiStyle |
|---|---|---|---|
| 4 (boss) | "Knifepoint" (Talon, PS7) | Fast and fragile. Dives for range 1 to get the extra die. | easy / bold |
| 5 | Hammer Squadron Lead (Talon Maul bomber) | Trusts his armour and flies straight lines. | normal / balanced |
| 6 | "Hex" and a swarm | A jinx: attackers can't spend focus or reroll against her. | normal / balanced |
| 7 (boss) | Sorin Vael (Razor, PS9) | Proud and fearless. Flies reds on purpose and turns stress into focus. | normal / bold |
| 8 | Kira Scald (Warden gunship) | Patient hunter. Covers the approach with both arcs. | hard / cautious |
| 9 | "Wailer" and his wing | Loud wing leader. Hunts the courier. | hard / bold |
| 10 (boss) | Lord Castigan (Talon Prime, PS9) | Cold and exact. Two actions a turn, and he always finishes a crippled ship. | hard / balanced |

**AI levels** are the game's real ones: `LV = {easy, normal, hard}` in `ai.js` (sample count, noise, look-ahead).
**AI styles** don't exist yet. `aiStyle` is one multiplier on the return-fire weight in `ai.js:scorePose`
(`AIW.def`): bold ×0.6, balanced ×1.0, cautious ×1.4. It's applied only to the campaign's enemy side and only in
campaign games. If the multiplier isn't added, every style plays as balanced and the chapters still work.

## Difficulty curve
- **Act 1, Convoy Run (easy, hints on).** Each chapter teaches one idea:
  - c1: moving. One drone, no asteroids (`ex.noRocks`), so a newcomer can't really lose.
  - c2: shooting and range 1. Two drones, no asteroids, finish before round 12.
  - c3: actions and asteroids. Target lock, then torpedoes.
  - c4 (boss): the real core-set duel (`sizeK: 'core'`) against "Knifepoint".
- **Act 2, The Ashfall Belt (normal, no hints).**
  - c5: a bomber and one escort. It opens the act and is winnable.
  - c6: 2 ships against 4.
  - c7 (boss): Sorin Vael with two wingmen. Gentle twist: he starts with a focus token.
- **Act 3, The Crown Rift (hard).**
  - c8: no twist; the act opener.
  - c9: an escort mission (protect-lead).
  - c10 (boss): Castigan's 4-ship wing, and he has +2 shields.
- **Easier offer** after 2 losses: one AI level down, the twist removed, at most 2 stars. Some chapters also trim
  the field: c3 removes the asteroids, c4 removes Knifepoint's wingman.

## Twists menu (campaign only; shown on the boss card; normal rules unchanged)
| id | where | Implementation hook |
|---|---|---|
| ace-shields | setup | `engine.js:newGame`. Run right after it returns; the ships are added synchronously by `addShip`. Find the enemy ship with `pilot === twist.pilot` and add `param` to `sh` and `shMax`. |
| opening-focus | setup | `engine.js:startRound`. When `G.round === 1` and `G.campaignTwist` is set, set `focus = param` on the matching enemy ship(s). |
| veteran-skill | setup | Same place as ace-shields. Add `param` to `ps` (cap 12). This changes activation order through the normal rules. |
| protect-lead | scoring | The campaign's `isWon` / `metrics.won` also require the player's ship with `pilot === twist.pilot` to be alive. |
| clock | scoring | Pass `ex.roundCap = param`. `engine.js:missionCheck` already ends the battle on points destroyed at that round. A draw counts as a loss. |
| ace-hunter | ai | `ai.js:aiTarget`. For enemy-side shooters, multiply the value of a target whose pilot is `twist.pilot` by `1 + param`. |

Used in the chapters: opening-focus (c7), protect-lead (c9), ace-shields (c10). veteran-skill, clock and
ace-hunter are spares for replays and tuning.

## Levers verified in the code
- `engine.js:newGame(opts)` options:
  - `fac` ([0,1]).
  - `players` ([{human:true},{human:false,lvl}]): `lvl` comes from `aiLevel`.
  - `sizeK` ('core', 'sk60', 'std', 'custom'; see `data.js:SIZES`).
  - `squads` ([[{p,u}],[{p,u}]], with pilot and upgrade ids from `data.js:PILOTS/UPGRADES` and `exp.js`).
  - `ex` (expansion flags `w1`/`w2`/`w3` from `exp.js:EXPS`, plus `noRocks` read in `engine.js:placeRocks` and
    `roundCap` read in `engine.js:missionCheck`).
  - `seed`.
- Initiative follows from squad points (`engine.js:rollInitiative`), so the squads in `setup` decide who moves first.
- The existing sortie launcher `ui.js:startGame(mode, sortie)` already calls `newGame` with
  `{fac, players, sizeK, squads, ex}`. The campaign's `startChapter` can mirror it, adding `lvl: def.opponent.aiLevel`
  and setting `UI.hints = def.hints` (the coach and suggestions in `guide.js` / `suggestDial`).
- Win check: `G.winner === 'P1'` (`engine.js:checkWin`); the player is side 0.
- Suggested `metrics(G)`:
  - `won`;
  - `rounds: G.round`;
  - `lost`: own ships with `!alive`;
  - `dmgTaken`: own shields lost plus `hullDmg` of own ships;
  - `rockHits`: count of `s.rockHit` events on own ships, recorded per round.
