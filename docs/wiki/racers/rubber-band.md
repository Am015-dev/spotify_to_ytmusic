# Racers: rubber band
Pins: [../sources/racers.md](../sources/racers.md).

## Facts
- OFF for the first 15 s (`RaceSetup::Initialize`).
- After that every AI behind the leader runs at x1.05 route speed, every AI ahead of the leader at x0.95 (`RaceSetup::Update`, `g_rubberBandScale` = 0.05).
- The player is never adjusted. Mild and symmetric: overtakes feel earned.
- AI speed scale is also clamped to -0.5..2.75; spin-out x0.1, curse x0.5 (`RacerPhysics` route mode).

- Extra additive term `m_rubberBandBoost` (default 0). Excerpt: [code/rubber-band.md](code/rubber-band.md).

## What we have
- `src/98rf_race_fun.js:RF_rub(s,gap,ld)`: called from `src/30_race3.js` (`s.rubber=...`). Leaders wait for the player early; catch-up from behind up to +9 %, held-back up to -20 %, catch-up fades over the last 25 % of the race. Fallback branch in 30_race3: +6 % / -3 % by gap.

## Gap
- Ours is 2-4x stronger than Racers. Racers keeps the AI honest.
- Plan (design doc step 2): on the Westend `?proto=1` stretch only, swap RF_rub for the Racers band (off 15 s, then 0.95-1.05); GO asserts the band stays inside 0.95-1.05.
See [ai-lines.md](ai-lines.md), [../game/flags.md](../game/flags.md).
