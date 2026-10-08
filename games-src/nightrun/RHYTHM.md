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

## Songs, clock and speed (performance work, 8 Oct 2026)
- **Songs are streamed, never decoded.** Each mp3 is fetched once into a blob (3-5 MB) and played by one of 5 pooled `<audio>` elements through a `MediaElementAudioSourceNode` into the music bus (`AU.slots`; pooled so iOS unlocks them all in the first tap, see `AU.unlockSlots`). `TR.bufs[file]` is the slot once it can play; `.duration` works like the old AudioBuffer. Before: 60-100 MB of PCM per song and a 100-300 ms main-thread stall for each decode.
- **The beat clock is still the AudioContext clock** (`BT.t0`). An element cannot be started sample-exactly, so `strGo` plans (`ctx0`, `pos0`) and `strSync` (every 25 ms) measures how far the element really is from the plan: the first 700 ms of a stream take the measurement at once, later it follows at <=4% speed. A song that is waiting for its bar line (crossfade) is not allowed to move the grid: it is steered onto the plan by playing a hair faster while it is still silent. `AU.lat` (start latency) is learned; `gapMs` in `tracks.json` is how long a looping element pauses at the end of the file (learned too).
- **Crossfade** (`AU.xfade`): the new song is started silent about a bar early at the matching place in its file (the tail of the file when it has to wrap), fades in over the bar before the bar line while the old one fades out (equal power). Asking for the song that already plays does nothing. Pause/resume/hidden tab pause the elements and keep the position.
- **Drawing cost:** the canvas backing store has a pixel budget (Quality L / M / H = 0.93 / 2.1 / 3.7 Mpx, `PXB` in `b.js`), the sky + scanlines are cached at that size, big scrolling layers get a copy at the screen's resolution (`dispOf`), the canvas is opaque, and a 120/144/240 Hz screen is held to 60-80 draws a second. Skylines are built one at a time in calm moments (`lagfix.js`).
- Checks: `audio-test.js` (position/phase continuity, crossfade, tempo, pause/hide), `perf-desktop.js` (frame times, heap, canvas size at 1280x800 .. 2560x1440 @2; `UNCAP=1` gives the mean frame cost without vsync), `lag-probe.js`.
