# Excerpt: Racers camera lag
Source: isledecomp/racers@5bb9f13, `LEGORacers/src/race/racecameracontroller.cpp`, `RaceCameraController::SetPositionLag` / `SetRotationLag` (~l.69-83). Licence: LGPL-3.0. Verbatim, trimmed to one function (the other is identical with `m_rotationLag`).

```cpp
extern const LegoFloat g_lagTimeScale = 250.0f;
void RaceCameraController::SetPositionLag(LegoFloat p_amount)
{
	LegoFloat numerator = 1.0f - p_amount;
	LegoFloat denominator = p_amount;
	denominator *= g_lagTimeScale;
	m_positionLag = numerator / denominator;
}
```

## Notes
- `amount` in 0..1 (0.05-0.10 position, 0.25 rotation): lag = (1-a) / (a*250) per ms. Small `a` = loose camera.
- Turn look-ahead gain `g_turnLookAheadScale` = 80; view transition scale 0.0005 per ms (2 s blend).
- Ours: `src/71_roam_drive.js:roamCam`, `roamPose`; a time-based exponential like this is framerate-independent if applied as `1-exp(-k*dt)`.
Page: [../camera.md](../camera.md).
