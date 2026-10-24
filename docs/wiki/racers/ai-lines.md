# Racers: AI driving lines and item use
Pins: [../sources/racers.md](../sources/racers.md).

## Facts
- AI replays recorded lines (`.rrb`, `RaceRouteRecord`, `RaceSession::LoadRouteRecords`): front, middle, side lines, up to 10 variants each, random pick. No steering toward points.
- Every route point stores track width left/right (s8 x 0.125, <= ~16 units each way); AI drifts sideways inside it, offset decays 0.002/ms.
- Item use (`Racer::AiConsiderPowerup`): roll every 150 ms (300 ms after pickup, 1 s after a failed roll); each driver 0.2-1.0 chance per colour.
- Red fires only with a target in a forward cone (cos 0.96 ~ +-16 deg, ~10-250 units).
- Some drivers wait to collect white bricks first ("charge colour"); AI may turbo off the line.
- The 4 driver colour stats only steer item use.

## What we have
- Spline rivals in `src/30_race.js` (`nemesis`, `radio`, `rivalHit`). City-duel route builder with split routes: `src/98tk_city_duel.js` (`tkChain`, `tkSnap`, `tkRoad`).
- Traffic AI is separate: [../game/traffic.md](../game/traffic.md).

## Gap
No lane width/wobble per route point; rivals don't use items by roll/cone. Plan: design doc step 2 (rival lateral spread > 1.5 m, band 0.95-1.05).
See [rubber-band.md](rubber-band.md).
Excerpt (LGPL, short): [code/ai-line-follow.md](code/ai-line-follow.md)
