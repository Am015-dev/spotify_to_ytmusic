# Description audit, shell (29 Oct 2026, W262)

Every sentence the shell shows that promises behaviour, with the check that decided it. Checks are in `qa/gauntlet-shell.js` (section named in brackets; `SECTION=claims` for the Assist rows).
TRUE = measured and holds. FALSE = measured and did not hold (fixed, see GAUNTLET-SHELL-2026-10-29.md). UNTESTABLE = no check was run in this pass (reason given); not counted as true.

| # | claim (where shown) | check | verdict |
|---|---|---|---|
| 1 | Marks the run ⓐ: World speed, Enemy bullets, Extra hull, Beat window (Assist) | real flight start with each value, `RET.assistRun()` (claims) | TRUE |
| 2 | "Never marks a run": Big bullets, High-contrast bullets, Show hitbox, Reduced motion, Timing window (Assist) | same, 6 values (claims) | TRUE |
| 3 | "Start every run with 2 more hull" (Extra hull) | hull 5 -> 7 measured at run start (claims) | TRUE |
| 4 | "Enemies, bullets and scrolling move slower. The music and the beat do not change." (World speed) | not measured in this pass | UNTESTABLE |
| 5 | "Only enemy bullets fly slower" (Enemy bullets) | not measured in this pass | UNTESTABLE |
| 6 | "More time to hit the beat for a PERFECT, on top of Timing window" (Beat window) | not measured in this pass | UNTESTABLE |
| 7 | "Enemy bullets are drawn bigger with a white halo. The real hit size is unchanged." (Big bullets) | look and hit size not measured | UNTESTABLE |
| 8 | "Bright white halo around enemy bullets" (High-contrast bullets) | `html.hc` follows the row (settings, both sizes); the halo itself not looked at | TRUE for the switch, halo UNTESTABLE |
| 9 | "A small white dot on the ship marks the only spot that can be hit" (Show hitbox) | not measured | UNTESTABLE |
| 10 | "Calmer effects, no strobing, no count-up" (Reduced motion) | `SET.reduce` follows the row; the effects are not measured | UNTESTABLE |
| 11 | "How exact a tap has to be" (Timing window) | not measured | UNTESTABLE |
| 12 | "Assist makes the game easier. It never blocks progress and never costs Neon." | no progress / Neon difference measured | UNTESTABLE |
| 13 | Latency "TAP TEST": "Tap the pad on every click. 8 taps." then "Done. Audio sync set to +N ms" | 8 real taps on the pad; `CAL.need===8`, result stored as Latency and printed (behaviour) | TRUE |
| 14 | Master / Music volume / Effects volume sliders set the volume | 20% and 80% taps, gain nodes read back (behaviour, both sizes) | TRUE |
| 15 | Mute all silences everything | master gain 0, unmute restores it (behaviour) | TRUE |
| 16 | Quality Low / Medium / High changes the picture size | drawing buffer measured per option: identical for all three | FALSE, fixed (D3) |
| 17 | FPS counter On / Off (phone) | shown on a phone: counter never drew (needs ?test=1) | FALSE, fixed (D4); PC TRUE |
| 18 | FPS cap 30 / 60 | stored and persists; frame cap not measured | UNTESTABLE |
| 19 | Difficulty, Colour theme, Button size, Particles, Flashing, High-contrast class | game state follows each option (settings, both sizes) | TRUE |
| 20 | Reduce repetitive sounds, Ducking, Keep music playing when paused, Music reacts, Music mix | stored and persists; the sound change is not measured | UNTESTABLE |
| 21 | Every other settings row (HUD, auto-fire, aim assist, layout, sensitivity, rhythm, shake, glow, scan lines, text size, colour-blind palette, calm mode) | each option taps, is stored in `mnr_set`, persists after reload, `aria-pressed` follows | TRUE for the switch; what it does in play UNTESTABLE |
| 22 | DEFAULTS: "TAP AGAIN TO RESET" | first tap changes nothing, second resets and stores (settings) | TRUE |
| 23 | "Last saved: <time>" and Save / Load slots | SAVE writes slot 1 with the bank; LOAD exists (saves) | TRUE |
| 24 | Save-slot LOAD restores the saved state | existing qa saves-test.js round trip (run, passed); not repeated | TRUE (existing test) |
| 25 | Loading veil "LOADING STAGE n N%" while the stage loads | slow assets, MutationObserver on `#stageQ`: text, `role=status`, goes away and the stage runs (load) | TRUE |
| 26 | "LOADING STREET RUN N%" | veil did not appear with warm assets; slow-asset run not made | UNTESTABLE |
| 27 | "Offline ready · N songs saved" and INSTALL APP row | row is built by the MORE sheet (`#moreBtn`), which FOCUS mode hides: a player never sees it | FALSE (reachability), OPEN (D6) |
| 28 | Offline: the game loads and plays after one visit | real worker, context offline, title + settings + flight (sw) | TRUE |
| 29 | Update does not trap an old version | worker has skipWaiting + clients.claim, index.html network-first, "New version found, reloading" exists (static); a real second build was not served | TRUE for the code paths, UNTESTABLE end to end |
| 30 | LAB "EXIT" and Escape leave the Lab | Escape did nothing | FALSE, fixed (D5) |
| 31 | Pause card has no SETTINGS in FOCUS mode (title is the only door) | `#pSetBtn` hidden (behaviour) | TRUE |
| 32 | ON FOOT first-time story card has SKIP and the street starts | real tap, SKIP, `FOOT.S` live (back) | TRUE |

Not covered by this pass (not run, not claimed): garage / hangar purchases, shop, pit stop UI text, daily, story map and districts, stats, profile, tutorial and hint lines, what's-new items. FOCUS mode hides those doors on the live title (`?focus=0` shows them); hub-test.js and menufix-test.js were started and stopped before finishing, so they have no result in this pass.
Counts (32 rows): TRUE 14 (rows 1, 2, 3, 13, 14, 15, 19, 22, 23, 24, 25, 28, 31, 32); TRUE for the switch or code path only, effect untested 3 (8, 21, 29); FALSE 4 (16, 17, 30 fixed, 27 OPEN); UNTESTABLE 11 (4, 5, 6, 7, 9, 10, 11, 12, 18, 20, 26).
