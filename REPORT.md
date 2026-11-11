# M3 — Frankfurt Chapters 3 + 4 and the Kaiser finale

## What changed
`m3.js` is one self-contained module, inserted by `pM31.py` with one anchor (see ANCHORS.md). It reuses the m1.js mission engine: it registers missions in `M1_DEF`, scenes in `M1_SC`/`M1_END`, and wraps m1/qv functions.
- **Gate:** the chain appears only when `M1.s.M2_done` is set (the chapter-2 module's job). A one-time chapter-3 intro scene and title card play. Dev unlock: `__m3.unlock()` or `?m3dev`.
- **Chapter 3, "Kaisers Schatten":** *Framed* (police heat: hide in a car wash; ram the courier; wreck the fake cops; survive a roadblock; evidence run to the Polizeipräsidium) · *Train Job* (showcase race against an S-Bahn across the Main to the Hbf; ram the accountant; defend the books) · *Tower Party* (Main Tower plaza: barriers, Road Rage survive, a lieutenant wave, Brecher's boss truck) · **Duel vs Ferreira (homing missiles at you) and Çelik (mines on the racing line)**, Main Tower → EZB with items on. **Reward: Rocket Hop** (G key or touch 🚀; 5 s cooldown; counts as a jump).
- **Chapter 4, "Das Finale":** *Cargo Jet Showcase* (race Kaiser's jet across the city; cargo crew; crate van; hold the crate) · *Blackout* (4 guarded generators in 4 districts, then the elite guard) · *The Crown* (ram the armoured hauler; Kaiser's minefield; tail him round the west; arena guards) · **Duel vs Brandt (missiles) and Nakamura (boost)**. **Reward: Shockwave Landing** (each Rocket Hop landing does 2 damage to goons within 28 m and stalls rivals).
- **Finale, "Vex Kaiser"** (6 phases, across the city): ram Kaiser to the Messe → elite guard → Rocket-Hop leap over the raised Untermainbrücke → tail him through Sachsenhausen → last stand against his 10-HP shielded car (escort waves, mine drops, taunts) → raise the Sky Cup at the Römer.
- **Saved rewards:** flags FERREIRA, ÇELIK, BRANDT and NAKAMURA. SKYCUP triggers the base epilogue and the Kaiser-crown part. Progress is stored in `M1.s.M3`.
- **New engine pieces:** stage types `heat` and `leap`; race opponents (rivals, a train, a plane) with rubber-banding, HUD gaps and minimap pins. Your items hit the rivals, and phase retry restores rival positions. Goon kinds `police` (siren bar) and `kaiser`.

## Patch order
`./reapply.sh pM31.py` → REAPPLY_OK. Page size 3.25 MB.

## Tests
- `node tM3.js`: **43 pass / 0 fail** (bot = m1bot at 50 m/s; on the leap stage it calls the same Rocket Hop function as the G key).
  - Bot game time per mission (seconds): framed 293, train 259, tower 260, airport 249, blackout 260, crown 338, kaiser 263. All 7 missions fall within 4–7 min. Duels: duel3 152, duel4 158.
  - Each mission plays ≥3 phases (4–6).
  - A mission is locked without `M2_done`. The unlock plays the Kaiser intro, NEXT routes to the mission, and the state survives a reload.
  - If you idle, a rival wins. RETRY PHASE brings back both rivals at their checkpoint positions.
  - The real G key triggers a hop (vy 21, 7.2 m peak) with a cooldown, and no hop before chapter 3. Shockwave damages nearby goons.
  - Phone landscape: the 🚀 button has no overlaps, and a real tap fires a hop. No page or console errors.
- `node smoke.js .`: **SMOKE PASS** (308 s). The contact sheet (`smoke/sheet.png`) looks normal; screenshots are in `shots/m3_*.jpg`.

## Known gaps
- The bot times are lower bounds: it teleports along the GPS line at 50 m/s. Real-player times have not been measured.
- The trains and the jet follow the road path or a straight line, not rails or a flight path. There is no real night/lighting change for Blackout.
- The `survive` stage with a boss (Tower Party phase 4) reuses m1's hardcoded "BRECHER!" lines on purpose: Brecher returns.
- The district plate's chapter number comes from base flags, so it stays at "Chapter 1" until the rival flags are won.
- This depends on the chapter-2 session setting `M2_done`. Without it, use the dev unlock.
