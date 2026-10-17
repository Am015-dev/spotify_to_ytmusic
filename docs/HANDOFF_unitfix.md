# unit-fix handoff
- logic_core crash: DMG_impact reads TUNE (dmgCap/dmgInv/trafCd, from the race-1/walls-1 damage work, not smash2/lane B-D); the test sandbox now gets the real TUNE via constSrc.
- The 12 other FAILs were intended behaviour (12 % per-hit cap, 1.2 s grace, 4 s per-car traffic cooldown, sub-60 km/h bump = sparks only): formula asserts pinned to uncapped TUNE, new asserts for cap/grace, traffic test uses the real cooldown. No assertion loosened.
- Unit 0 FAIL with and without three; smash2, devui2, racepop TAGs 4/4 on the built page. SMOKE ath-boot "cached ground" failed once (not touched by this test-only change): lane owner to look.
