# Excerpt: Racers AI route playback speed and lane offset
Source: isledecomp/racers@5bb9f13, `LEGORacers/src/race/racer/racerphysics.cpp`, `RacerPhysics::UpdateRouteMotion` (~l.748-830); constants l.100-157. Licence: LGPL-3.0. Condensed; reference only.

```cpp
// AI = a cursor playing back a recorded line; "speed" is the playback rate (1.0 = as recorded).
if (boost && cursor.time < g_routeBoostRampMs)            // 2000 ms ramp
    targetSpeed = lerp(g_routeBoostSpeed /*1.7*/, g_routeMaxPlaybackSpeed /*2.75*/, 1 - cursor.time/2000);
if (speed < targetSpeed) speed = min(target, speed + accel * dtMs);   // accel 0.000488/ms (pushed/boost have own rates)
else if (speed > targetSpeed) speed = max(target, speed - decel * dtMs);
cursor.Advance(dtMs);                                      // position comes from the recording
if (sideOffset != 0) sideOffset moves toward 0 by g_routeSideOffsetDecay * dtMs;   // lane drift decays
```

## Notes
- Rubber band, spin-out and curse only change `targetSpeed`; the car follows smoothly via accel/decel ([../rubber-band.md](../rubber-band.md)).
- A "pushed" flag (hit by another car) suspends normal acceleration and uses faster rates.
- `sideOffset` is set by passing/bumping and clamped by the point's stored track width ([../ai-lines.md](../ai-lines.md)).
- Ours: spline rivals in `src/30_race.js` (`nemesis`); no playback-rate model.
