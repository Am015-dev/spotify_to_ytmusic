# BALANCE W314: GOLD decision gate on a paired instrument (branch nr/W314-gold2, base nr/W308-gold)

## 1. The instrument was the noise
- `humanbot.js` seeded only the bot's own dice; the game dice (GR/GX = Math.random, ~60 call sites) were unseeded, and each page played many runs in a row,
  so state carried from the run before. Same seed, same build, run twice: 1 of 4 runs identical.
- Fix: Math.random is seeded per run (from the run seed) and `FRESH=1` loads a fresh page per run. Same check: 4 of 4 runs bit-identical (time and score).
- `qa/push-gate.js` now: RUNS=24 paired seeds (HOLD, PUSH, CHOOSE play the same seeds), STAGES 1,4,6, run once per SEEDBASES (default 0,1000), passes only if
  every base passes; prints clear %, score, hearts lost per run, GOLD per run per bot and the paired win count (CHOOSE clears where HOLD dies and back).
  NOAB (CHOOSE without DASH/EMP) is optional now (NOAB=1). Before the fix W303/W308 numbers moved +-10 on identical code; read them as noise.

## 2. Tries (24 paired seeds x 3 stages = 72 runs per bot per base; gate rows: CHOOSE clear >= HOLD, PUSH <= CHOOSE - 15, CHOOSE score >= 1.25x HOLD)
| try (waves.js) | base 0: HOLD / PUSH / CHOOSE clear % | base 1000: HOLD / PUSH / CHOOSE | hearts lost/run H/P/C (base 0) | verdict |
|---|---|---|---|---|
| base (W303 constants, no change) | 60 / 49 / 65 (PASS all 3) | 65 / 42 / 53 | 6.8 / 8.6 / 7.7 | FAIL base 1000 (CHOOSE < HOLD, gap 11) |
| v1: GOLD repairs +1 hull if DASH ready at the kill; last-hull punisher (hull <= 1: every foe of the live bounty squad flak, range x1.3, cooldown x.6) | 68 / 83 / 89 | 58 / 79 / 78 | 6.6 / 9.6 / 8.1 | CHOOSE >> HOLD, but PUSH = CHOOSE: FAIL |
| v2a: v1 with punisher at hull <= 2 | 63 / 75 / 88 | 69 / 81 / 82 | 6.8 / 9.6 / 7.9 | FAIL (PUSH gap 1-13) |
| v2b: v1 with punisher x1.8 range, x.4 cooldown | 58 / 78 / 89 | 67 / 79 / 78 | 6.9 / 9.5 / 8.0 | FAIL (PUSH gap -1-11) |
| v3: no repair, punisher x1.8 / x.4 | 58 / 46 / 72 (PASS all 3) | 69 / 35 / 47 | 6.9 / 8.7 / 7.5 | FAIL base 1000 (CHOOSE 22 under HOLD) |
| v4: repair only on a clean GOLD (no hit since the squad opened) + DASH ready, punisher x1.8 / x.4 | 63 / 67 / 78 | 69 / 60 / 68 | 6.9 / 9.0 / 7.8 | FAIL (gap 8-11) |
| v5: repair only on a gun squad's GOLD + DASH ready, punisher x1.8 / x.4 | 61 / 64 / 74 | 61 / 69 / 67 | 6.9 / 9.0 / 7.6 | FAIL (PUSH >= CHOOSE on base 1000) |
CHOOSE score >= 1.25x HOLD passed in every try and base (1.31-1.84x).

## 3. What the numbers say
1. Any hull repair on GOLD lifts PUSH as much as CHOOSE (PUSH 42-49 -> 60-83): PUSH collects 4.0-4.3 GOLD per run vs CHOOSE 3.5-3.9, so a per-GOLD heal pays the reckless bot more. Gating it
   (DASH ready, clean, gun squads only) cut the heal for PUSH a little but never by 15 points.
2. The last-hull punisher barely moves PUSH (78-83 with repair at any strength): with the repair PUSH rarely sits at hull 1. Without the repair (v3) PUSH is lowest (35-46).
3. Even paired, the two seed bases disagree by up to 25 points for CHOOSE on the same build (v3: 72 vs 47); one tiny divergence (a different ship position) re-rolls every later dice.
   So 72 runs per base is still about +-6 per cell, and a 15-point gap needs a real effect, not a tuning.
4. Without a repair, CHOOSE vs HOLD flips sign with the seed base (base: +5 / -12; v3: +14 / -22). CHOOSE's push rule (soft squads at hull >= 2) costs about 0.8 hearts a run more than HOLD.
SHIPPED: no game change (waves.js = base). Shipped: the instrument (paired seeds that are really paired, RUNS 24, two bases, hearts lost) so the next design try reads true.
