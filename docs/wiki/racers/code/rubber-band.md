# Excerpt: Racers rubber band
Source: isledecomp/racers@5bb9f13, `LEGORacers/src/race/racesetup.cpp`, `RaceSetup::Update` (rubber-band branch, ~l.119-142). Licence: LGPL-3.0. Reference only; port into our own LGPL-headed file, never paste into a normal module. Scale constant `g_rubberBandScale` = 0.05 (`race/racer/racer.cpp`).

```cpp
// per AI racer (index 0 = player is skipped), unless it carries the rubber-band exemption flags:
if (racer.GetRaceProgress() > bestProgress) {
    adj = 1.0f - g_rubberBandScale + m_rubberBandBoost;   // ahead of the reference: slow down
} else if (racer.GetRaceProgress() < bestProgress) {
    adj = g_rubberBandScale + m_rubberBandBoost + 1.0f;   // behind: speed up
} else adj = none;
physics.m_routeBaseSpeed = adj;
if (!(physics.m_flags & c_flagRoutePushed))                // not being pushed by another effect
    physics.m_routeTargetSpeed = adj;
```
(Condensed from the original; the original sets both fields in each branch.)

## Notes
- `bestProgress` is the leading racer's progress; the AI compares to it, the player is never touched.
- `m_rubberBandBoost` is an extra additive term (default 0) on top of the +-0.05.
- The 15 s start delay sits in the branch above this one (route speed forced to 1.0 until it expires).
Page: [../rubber-band.md](../rubber-band.md).
