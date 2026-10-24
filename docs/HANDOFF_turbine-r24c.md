# HANDOFF turbine-r24c (Alex, 24 Oct: "turbin is moving out of head")
Cause: LIFE_ldTurb (src/assets/lx/code.js) spun the 7747 rotor about its bounding-box centre, 1.9 m below the real hub (3 blades are not symmetric in a bbox); now centred on the vertex mean (= hub) and seated 0.35 m forward; draw and GO share LIFE_tbA.
GO life2/fra-turbine + life2/ath-turbine (every real turbine near 60 street spots + 8 yaws): hub <= 0.5 m from the nacelle front, drift < 5 cm over 2 s, tips move. Before: 3.63 m / 379 cm FAIL. After: 0.36 m / 0.0 cm PASS. Shot: docs/shots/turbine_fix.jpg.
Left: Wetterau lzTurbine (static, hub already at nacelle front) untouched; deploy needs an OD_CHANGELOG line.
