# AU · audio + presentation polish — report

Base: devkit v80 (`alex/overdrive-devkit` @ 259a4cf). Rebuild: `./reapply.sh pAU1.py pAU2.py` → `REAPPLY_OK`. Page 3.37 MB (limit 3.6 MB).

## What changed
**pAU1.py → `au.js`** (one anchor, inserted before `window.__mho={`; everything else is runtime wrapping, see ANCHORS.md)
- **Adaptive music** (all procedural WebAudio). It extends the existing `AU` object: `AU.init` and the iOS unlock are untouched, and the music bus is built lazily on the first scheduler tick after the gesture.
  Five themes, each on its own gain bus → duck gain → `AU.mus`:
  Frankfurt funk/pop (112 bpm, slap bass, offbeat stabs, hook), Athens (bouzouki-style plucks with tremolo on D Hijaz / Phrygian dominant, tsifteteli-style drums),
  race drum and bass (172 bpm, reese bass), missions (tension layers stacking with mission phase + live enemies), cutscene/results pad with a stinger on entry. There is also a win fanfare.
  Crossfade between themes takes about 1.5 s. Music ducks to 30 % while `#npcSay`, `#story` or the `#m1Cs` cutscene is on screen.
  CPU: one shared 16th-note clock; only buses that are audible (or fading) get notes; every note is a short-lived node that disconnects itself when it ends.
- **Volume sliders**: the existing Master / Music / Effects sliders now drive the new buses (via `AU.mus` / `AU.fx`) and persist through `SET`.
- **SFX**: engine pitch follows a 6-gear model (rpm saw per gear, shift tick), turbo whistle, throttle-lift blow-off, boost whoosh layered on `nitro`/`boost`,
  tyre squeal while drifting (roam `RO.dDir`, race `driftT`), brick clatter scaled by the smashed prop’s stud count (more and lower clicks plus a thump for big props; thinned to 3 clicks when more than 90 voices are already playing),
  takedown crunch, bell-like collectible chime (`pick`), and a UI click on every button. The existing item sounds (rocket, missile, mine, shield…) are kept.
- **Feedback**: roam screen shake capped at 0.45 and **off in missions**; the studs from a smash now shoot up like a fountain; speed lines are brighter and faster while boosting;
  sustained FOV kick while boosting; chunky 2K-style `TAKEDOWN!` pop (roam via `#hitPop`, moved down to 28 % so it clears the NEXT bar; races via `#auPop`); `+COMBO ×n` pop on chain-multiplier increases;
  confetti + fanfare on race wins (1st place) and on completed missions/activities (bronze or better).
- **Portrait hint**: shown at most once per device (reuses `mho_portok`). It sits lower on the screen, auto-hides after 3 s, and hides immediately if it touches `#m1Next`, the minimap or the map, or when the map opens.

**pAU2.py**: English UI text. 76 exact literal swaps (table in ANCHORS.md): Athens plate `Chapter 1 · Welcome to Athens`, all chapter titles, career event names,
`EDGE OF THE MAP`, `ROADWORKS`, loading-screen lines, `Feeder road A…`, and German/Greek interjections in dialogue (Danke, Ach, Wunderbar, Hilfe, Prost, Willkommen, Siga siga, Ela, Opa!, Pame, paidi mou, Kalimera, Efcharistó…).
Kept on purpose, as proper names: street, district and landmark names (Innenstadt, Polizeipräsidium, Attiki Odos), character names (Oma Hilde, Opa Klaus, Frau Schmitt, Herr Krause, Kyria Maria, Yiayia Despina), and the drinks Ebbelwoi / Äppler.

## Tests
- `node tAU.js` → **tAU PASS · 18/18** (451 s)
  - AudioContext is null until the first keydown, then exists.
  - Bus gains measured after each switch (target > 0.8, all others < 0.1): roam Frankfurt → race → mission (`heist`) → cutscene; the Athens roam theme is checked separately.
  - Duck goes to 0.3 under the cutscene dialogue and back to 1 afterwards.
  - 5 min of sim (keyboard bot: throttle, steer, drift, boost) with the scheduler running: live audio sources stay flat (average 46.7 early vs 53.9 late, peak 131, 5638 sources created in total). An earlier run peaked at 171 from smash bursts with no growth over time; that is what the clatter voice cap fixes.
  - Music 0.3 and Effects 0.45 survive a reload (SET, slider UI and bus gain).
  - Portrait 390×844 touch: hint seen, never overlaps `#m1Next`, minimap or map, gone by ~2.6 s, not shown again after a reload, hides when the map opens.
  - Non-English strings: a 54-entry list scanned in the built page, none left; Athens plate text is checked live.
  - Zero page errors.
- `node smoke.js .` → **SMOKE PASS** (556 s); `smoke/sheet.png` checked (Frankfurt, map, Athens A/B, race, phone portrait and landscape all render normally).
- Screenshots: `shots/au_takedown.jpg`, `shots/au_confetti.jpg` (staged: one software-rendered frame takes seconds and the CSS animation clock barely advances here, so the pop is pinned and the confetti pieces are spread down the screen for the picture). The portrait layout is in the phone shots of `smoke/sheet.png`.

## Known gaps
- Nothing here can listen to the mix: levels and timbres are judged only by the numbers above, so they need a by-ear pass on a real device (especially iPhone speaker loudness).
- Races do not call `AU.engine`, so race tyre squeal and turbo whistle only play in roam; races still get the boost whoosh and race music.
- The mission tension intensity (`AU_M.int`) was 0 in the test (phase 0, no goons spawned yet); the higher layers are wired up but not exercised by a test.
- Note for merging: the dev-kit commit eda692c fails smoke even without patches (Athens boot, race progress); v80 (259a4cf) passes. This branch is rebased on v80.
