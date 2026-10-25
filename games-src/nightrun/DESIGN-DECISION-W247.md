# W247: one real decision per wave in flight (design proposal, no code)

Owner, 25 Oct 2026: "nothing fun on it, no strategy on playing the game", "the game scores to gamers 5/100". Nightrun is under the
feature freeze (WORKER-RULES 15-17), so this is a written proposal only. Nothing below is built.

## 1. The decision: PUSH or HOLD, made again for every squad (every 8-15 s)

Each squad of a wave (WAVES.md: 2-3 squads per wave, a wave runs up to 22 s, then a 3.5-5 s breather) sets a **bounty clock**.
- **PUSH**: fly into the front half of the field (x > 0.45 W, within 140 px of the squad's slots). The close-range bonus that already
  exists (`reward.js`, +35 % damage, an extra shard per kill, graze chain) speeds the kill up. Clear the wave fast and it pays GOLD:
  +1 weapon level for the rest of the stage (the existing `up` pickup). The cost: charger dash lines, bodies and crossfire are close,
  and every hit costs a pip and resets the chain.
- **HOLD**: stay back where it is safe. The wave takes longer and pays nothing; foes still on the field at 22 s run away with the bounty.

The trade is **power for the finale (leader wave, stage 5's mini-boss) against hull now**. Gold compounds: a stronger gun clears the
next wave faster, so a run that pushes well snowballs, and a run that pushes badly ends early. The right answer changes with the
squad (drones: push; charger lanes or a turret crossfire: hold or push only from the edge) and with the hull you have left. The
reason to replay is the stage's gold count (`GOLD 4/5`) next to its score.

## 2. Why the current waves never force it (measured 25 Oct, `humanbot.js`, human model, fresh build, Normal, stages 1-3, 4 seeds each, 24 runs)

1. **The abilities do not change the outcome.** The same bot with DASH and EMP switched off (`HP='{"dash":0,"emp":999}'`) clears
   75 / 100 / 100 % against 75 / 100 / 100 % with them; median hits 5 / 3 / 6 against 5 / 3 / 4. Perfect parries: 2 in 12 runs.
2. **The best place is always the same, and it is never punished.** In 24 of 24 runs the ship's x stayed between 101 and 303 px (10th-90th
   percentile) of a 960 px field, the back third, and still cleared. The close-range bonus fired **once in 24 runs**: nobody gets within
   140 px of the squad slots (x 0.56-0.76 W). Foes that are not killed leave at 22 s "never counting as a leak or costing hull" (WAVES.md),
   so killing fast earns nothing either.
3. **Most of the time there is nothing to decide.** Median 73 % of game time (range 56-82 %) has no enemy bullet within 150 px of the ship.
   58 % of pickups (743 of 1278) were collected just by drifting; no pickup ever asked for a choice (`CHO` pairs are behind `?build2=1`, off).

Caveat: the bot's home x is scripted (220 ± 70 px). That is the point: the scripted "sit at the back" clears every stage.

## 3. The smallest change: 5 edits, existing systems only, behind the existing default-OFF flag `RET.build2` (`choices.js`, "real choices")

1. `parts/waves/waves.js: WV.squad` - stamp each squad with its start time (`q.t0`); the squad's bounty = GOLD if its last foe dies within
   `GOLD_T` s, else none. `GOLD_T` is not guessed: it is 0.6 x the HOLD bot's median squad clear time from the first gate run (step 0).
2. `parts/waves/waves.js: WV.tick` - when the last foe of a GOLD squad dies, drop the existing `up` pickup at that foe's slot (front of the
   field, `vx` 0 for 2 s, then it drifts back as usual) and a `floater` `GOLD`; at `TMAX` (`WV.flee`) the bounty is lost with a `floater`
   `BOUNTY LOST` (still no hull cost: fair stays fair).
3. `parts/waves/waves.js: WV.start` - the wave chip gets the clock: `WAVE 2/5 · CHARGE LANES · GOLD 9 s`, and a thin bar under the top band
   drains per squad (the chip text exists; no new HUD element, no play-field text).
4. `parts/waves/waves.js: WV.end` - count golds per stage (`WV.log.gold`); the stage result line prints `GOLD n/m` beside the score and keeps
   the best per stage with the stage's best score.
5. `humanbot.js: decide` (test only) - a `home` parameter for the bot's x (now hard-wired 220) and a `policy` (`hold` / `push` / `choose`).
   `choose` pushes when hull >= 2 and no charger is aiming at its row (`e.aimL`), holds otherwise.

Untouched: the 190 px no-fire rule, the 1-beat telegraphs, bullet caps (`ebCap`, `BCAP`), `hard.js` and `armour.js` damage caps (the close
bonus is already inside the `DMG.hit` chain), the director, waves' tables and squad counts.

## 4. The gate (bot, stepped x200, stages 1-6 Normal, fresh build, 8 seeds, `?build2=1`): new `qa/push-gate.js`

Three bots with the same human model and noise: HOLD (home 220, never pushes), PUSH (always pushes), CHOOSE (the rule above).
- **The choice pays**: CHOOSE median score >= 1.25 x HOLD, and CHOOSE pooled clear >= HOLD clear (stage 5's mini-boss included).
- **Pushing blindly loses**: PUSH pooled clear <= CHOOSE clear - 15 points.
- **It is a decision, not a habit**: CHOOSE changes mode at least once per 20 s (median), and in >= 30 % of squads its mode differs from the
  previous squad's. GOLD rate: HOLD <= 10 %, CHOOSE 40-70 %.
- **The abilities start to matter**: CHOOSE with DASH and EMP off earns >= 20 % fewer golds than CHOOSE with them.
- **Nothing else moves with the flag off**: `waves-test.js` and the `humanbot.js` stage 3 calibration give today's numbers.
Then the owner plays one stage (rule 16e). Done = the owner says pushing feels like a choice, not the bot.

## 5. What I would NOT build

No new weapons, foes, patterns, stages, modes or flags; no level-up card picker or pit-stop cards in flight (that is `choices.js`' other
half and a second decision); no pickup pairs during the wave; no leaderboards or online anything; no new HUD panel, art or effects; no change
to the no-fire radius or telegraphs to make pushing "dangerous enough" before the gate says it is too safe; no tuning past two gate rounds
without the owner's play (rule 16e).

Ideas: proximity scoring and per-wave time bounties are common, openly described shoot-'em-up design principles (genre write-ups); no game's
code or assets were studied. Probe output and the bot instrumentation (`__rec` / `__recOut` via `PRE=`) stayed in the scratchpad.
