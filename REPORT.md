# FL — feel: auto vehicle switch, smash→boost, day/night (free roam, both cities)

## What changed
**Patch order:** `./reapply.sh pFL1.py` (one patch; it inserts the module `fl.js` and makes 5 small hooks, all listed in `ANCHORS.md`).

1. **Automatic vehicle switch.** Every frame the surface is classified as one of:
   - **road**: a deck, a city street, a filler road, the autobahn or a plaza;
   - **water**: low ground;
   - **dirt**: everything else, i.e. parks, grass, river banks, lots and fields.

   The classification uses spatial hysteresis: a 2.5 m margin to enter a road and 6 m to leave it. A new surface must hold for 0.35 s before it counts, and after a switch the vehicle is held for at least 0.8 s. Nothing switches while airborne.
   - road → street car, dirt → 4×4, water → boat.
   - The existing brick-rebuild animation runs, plus an extra LEGO-colour debris burst, sparks, the boost sound and an FOV kick.
   - The ⟳ button still cycles AUTO / SHIP / BOAT / 4×4 as a manual override.
   - On dirt, the 4×4 grips harder (8, was 3.6) and the street car slides more (2.6). The street car is also slower there (existing fit .72).
2. **Smashing fills boost.**
   - Each smashed prop adds `2 + studs` boost, scaled by prop size: cone 3, lamp 4, tree 5, car or container 10–12.
   - Smashes chained within 1.6 s multiply the gain by ×1.25, ×1.5 … up to ×3.
   - Each gain shows a `+N BOOST ×m` pop above the meter, and the meter flashes.
   - A Schattenwerk goon takedown (`M1_takedown`) adds +45.
   - Passive recharge is slower: 4.5/s, was 7/s.
3. **Day/night cycle in free roam.**
   - A full day takes 24 real minutes (1 game hour = 1 minute). Keyframes: night → sunrise (dawn) → day (the city's own mood) → golden hour → dusk → night, with smoothstep lerps over the sky, fog, hemisphere and key light, exposure, bloom, stars and moon.
   - At night, windows glow brighter: the emissive intensity of every hub facade material is scaled by up to ×2.65. Lamp glows go from dull grey by day to warm glow by night.
   - Headlights, tail lights and a road beam are drawn for the player and all traffic as a single additive InstancedMesh. It is always drawn, just black by day, so it costs the same draw call in both.
   - Clouds hide at night.
   - The night palette is a warm, readable variant: hemisphere 1.05, no rain.
   - No real lights were added, and the key-light direction stays fixed, so the shadow pass is unchanged.
   - The setting **Time of day (free roam): Cycle / Always day / Always night** is stored in `mho_set`. The current time is saved every 3 s (`mho_fl_tod`). A new save starts at 10:05.
   - Races call `applyMood` with their own mood and are not touched; free roam re-applies the time of day on `hubEnter`.

## Tests (`node tFL.js [V B D P]`)
All on the final build. Total: **22 pass, 0 fail**, with zero page or console errors.
- **V** (7/7, Frankfurt, real arrow keys): road → grass bank → Main.
  - The stable surface sequence was `road>dirt>water`.
  - Vehicle switches were `offroad>boat`: exactly 2 switches for 2 surface changes. The raw classifier flipped 3 times; hysteresis absorbed the extra flip.
  - 0 switches mid-air.
  - Manual SHIP override held on water; returning to AUTO went back to boat.
  - Top speed on grass: 4×4 66.6 vs street car 49.1.
- **B** (5/5):
  - 5 chained smashes gave per-smash gains `[5,5,9,7,10]`, exactly base × `[1,1.25,1.5,1.75,2]`.
  - 5 spaced-out smashes gave exactly base × 1.
  - The meter rose by the expected amount plus at most the recharge during those frames.
  - 10 s idle recharge = 45 (4.5/s).
  - Goon takedown: 10 → 55.6.
- **D** (5 checks, 7 incl. both cities):
  - 60 s of play = 1.000 game hour, in Frankfurt and Athens.
  - Night factor is 1 at 22:19 and 0 at noon.
  - "Always night" survives a reload.
  - Cycle time is saved (0.6 → 0.600).
  - The settings row shows Cycle / Always day / Always night.
  - Screenshots: `shots/fl_{fra,ath}_{sunrise,noon,golden,night}.jpg`.
- **P** (2/2, same frozen frame, day → night → day):

  | City | Calls (day → night → day) | Triangles (day → night) | Visible meshes (day → night) |
  |---|---|---|---|
  | Frankfurt | 760 → 759 → 762 | 2.336 M → 2.325 M | 1432 → 1431 |
  | Athens | 294 → 293 → 294 | 869 k → 858 k | 491 → 490 |
- **Smoke:** `node smoke.js .` → SMOKE PASS. `smoke/sheet.png` was checked: roam is daytime by default, and the race keeps its neon mood.

## Known gaps
- The vehicle test drives road → grass river bank → Main, not through a named park, because no Frankfurt park borders the river (the nearest is about 1 km away). Parks use the same "dirt" classification.
- Headlight box positions are fixed (±0.72 m, 2.25 m forward) and do not fit each car model exactly.
- The sky's sun disc and the key-light direction do not move across the day; only colours and intensities change. This was a deliberate trade to keep the shadow pass stable.
- No on-screen clock. `__fl.clock()` exists for debugging.
