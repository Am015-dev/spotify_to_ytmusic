# Nightrun: rhythm, settings, difficulty, portrait (9 Oct 2026)

Source: `parts/` (build: `python3 games-src/nightrun/parts/build.py`). Checks: `sweep.js` (full), `d-sim.js` (difficulty bench, stepped page, seconds not minutes).

## Rhythm (the ship plays the beat, the player plays the dash)
- **Auto-fire on the beat grid.** One shot per grid cell: Courier a 16th note (4 per beat), Echo an 8th, Triplet a third of a beat, Heavy every second beat. Shots on the beat itself are gold pulse shots (x2 score, Sharp Beat bonus). Setting Auto-fire Off: hold to fire, still on the grid. Rapid Fire now adds off-beat extra shots. Damage per shot scales with the tempo so damage per second matches the old free-running fire.
- **DASH is snapped.** A press inside the timing window (Tight 70 / Normal 110 / Loose 160 ms, plus Wide Beat) waits for the beat (the ship is already protected while it waits) and counts as on-beat. Outside the window it dashes at once, off-beat, and costs a tier. "Everything counts" makes every dash on-beat and immediate.
- **Tier meter x1..x4** (`C.n` = power points, 6 per tier): on-beat dash +3, graze +1 (once per beat), pulse-shot kill +1. A late dash or a hit drops one tier; 8 beats (+4 per Tier Keeper) without a gain also drops one. Score multiplier = tier. Each tier adds a music layer (2 hats, 3 kick + clap, 4 bass pulse) and lifts the picture and the ship glow.
- **Beat cue:** a ring closes onto the ship and meets a target ring on the beat (white inside the window), plus a pulse on the screen edges. Size Off / Small / Medium / Large.
- **Enemy volleys** already fire on beats; each enemy that fires on the next beat glows and closes a ring for the whole beat before. Bosses pulse on the beat.
- One hint, 6 words ("Dash on the pulse to power up"), until the first on-beat dash.

## Settings (title and pause; one card in Overdrive's look; saved in `mnr_set`; all live)
Gameplay (difficulty, auto-fire, aim assist) · Controls (touch layout, sensitivity, button size) · Rhythm (timing window, everything counts, beat cue, latency slider + tap test) · Audio (master, music, effects, ducking, mute) · Visuals (particles, shake, flashing, quality, FPS cap, colour theme, FPS counter) · Accessibility (reduced motion, high-contrast bullets) · DONE / DEFAULTS (second tap confirms).
Tap test: clicks every half second on the audio clock, 8 taps, the median lateness sets Audio sync.

## Difficulty (`DIFFS` in `b.js`; measure with `d-sim.js`, try numbers with `DK='{"hard":{"xw":4}}'`)
Endless knobs: d (pace, fire rate, hull of enemies), bs (bullet speed), fr (fire rate), xw (extra waves joining each wave once the run is warm). Story keeps its own ramp (`TUNE`), scaled by sd / sbs / sfr. Bot numbers are in the commit message and the sweep output.

## Portrait
A touch phone held upright gets a vertical play area (ship at the bottom, enemies from the top, upright HUD). The game logic keeps its landscape coordinates: the world is drawn on its own canvas and turned upright (`render()` in `c.js`), text in the world is turned back (`wtxt`). Buttons sit in a strip under the play area or in a column beside it, whichever leaves the bigger screen (375x553 uses the column). Rotation mid-run just re-fits. Bosses stop at x 690 in portrait (790 in landscape) to clear the HUD.
