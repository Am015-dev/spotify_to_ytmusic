# Nightrun analysis (8 Oct 2026)

Method: `analysis/gauntlet.js` plays the live page through real input (CDP touch at 390x763 and 844x390, real keys at 1280x800), three player types per size, 120 s cap: **idle** (finger down, never steers), **natural** (dodges and dashes when in danger, ignores the beat), **trying** (dashes and re-taps fire on predicted beats). 55 screenshots in `analysis/shots/`, raw numbers in `gauntlet-results.json`. Songs: stage 1 is 92 BPM. Labels: GAME bug / DESIGN problem / TEST artifact.

## (a) What does not work, ranked

| # | Finding | Evidence | Label |
|---|---|---|---|
| 1 | **The beat is hard to see and its reward is invisible.** The cue is a faint ring round the ship plus four ~4 px dots at the bottom edge. Nothing tells the player what a good timing earns. | `844x390-natural-t20.png` (dots almost invisible); title text says only "DASH tap on the beat: PERFECT" | DESIGN |
| 2 | **PERFECT is mostly luck.** The window is +-80 ms = 160 ms per beat, so a random press lands 24% of the time at 92 BPM (34% at 126, 36% at 136). Natural players got PERFECT on 8/22, 9/20 judged actions without trying. | `gauntlet-results.json` (natural runs) | DESIGN |
| 3 | **On touch, a fire PERFECT means lifting and re-touching the steering finger.** Fire is "touch-down", so the only way to time it is to stop steering. A bot trying scored 27/147 fire PERFECTs on phone portrait (18%) and 32/179 in landscape, against 59/69 (85%) on keyboard. Dash PERFECT works (76/80, 71/80, 85/89). | `b.js` lines 42 and 204 | DESIGN (bot re-tap cost is partly TEST artifact, but the mechanic is the cause) |
| 4 | **Too easy.** The dodging bot never died in 120 s at any size (lowest hull 2 of 5); the keyboard "trying" run took zero hits for 120 s. Only the idle finger dies (21-27 s, first hit at 10-12 s). Score is dominated by timing: trying beat natural by 2x (touch) to 6x (keyboard: 302k vs 49k). | table below | DESIGN (bot reads state, so a human is a bit worse) |
| 5 | **Portrait is still played sideways.** Canvas and HUD rotate 90 deg, text reads vertically, bottom 20% is buttons. This is the earlier owner complaint, not fixed. | `390x763-trying-t20.png` | DESIGN |
| 6 | **Desktop particles and FPS.** Calm mode defaults on only for small screens, so 1280x800 holds 40-150 particles at once and ran 44-49 FPS (phones 57-60). | timeline `pt`/`fps` | DESIGN; FPS partly TEST artifact (headless software GL) |
| 7 | **Instructions are four different one-liners in the first 60 s** ("Drag to fly. DASH on the beat" 0-14 s, "Hit the beat for PERFECT" 14-18 s, then power-up tips). Nobody is told what PERFECT pays (+200 x mult on dash, x2 kill score for 0.4 s after a fire PERFECT, combo up to x2 on kills only). | `hint` in timeline; `b.js` 117-190 | DESIGN |
| 8 | **Settings are thin**: 3 sliders and 4 checkboxes, no reset, no difficulty, no controls, no tap test. | `head.html` 93-104 | DESIGN |
| 9 | Boss warning shows a plain grey disc with the name "ADLER" over the banner. May be the entry glitch, not verified. | `1280x800-natural-boss.png` | GAME bug (low confidence) |

Not a problem: input latency. Event to judge is 1-9 ms median (the judge uses the event's own timestamp). The browser reported 32 ms audio output latency in headless; real phones and Bluetooth are far worse, and only the buried "Audio sync" slider compensates.

Run summary (120 s cap):

| Size / player | Died | Hits taken (cause) | Judged actions PERFECT | FPS | Boss at | Pit stop at |
|---|---|---|---|---|---|---|
| 390 idle | 26.9 s | 5 (bullets, drone) | 4/21 | 57 | - | - |
| 390 natural | no | 4 (bullets) | 8/22 | 59 | 67 s | 113 s |
| 390 trying | no | 5 | 107/242 | 60 | 69 s | - |
| 844 natural | no | 1 | 9/20 | 60 | 71 s | - |
| 844 trying | no | 3 | 105/269 | 60 | 57 s | 116 s |
| 1280 natural | no | 2 | 0/4 | 47 | 52 s | 107 s |
| 1280 trying | no | 0 | 146/163 | 49 | 68 s | - |

First 60 s of a new player: title (STORY / ENDLESS / HARD / DAILY / GARAGE / SETTINGS, six buttons, `390x763-natural-01-title.png`), first enemies at about 4-8 s, first hit at about 10 s if idle, boss warning at 50-70 s, pit stop only after about 110 s.

## (b) Why tap-to-beat feels senseless

1. **No cost, no benefit that is felt.** Off-beat actions work identically; the reward is a number and a small "PERFECT" word, not a change in the world or the music.
2. **The beat never touches the threat.** Enemy fire is not beat-locked (only waves on bar lines and one boss spiral are), so the beat is irrelevant to survival. In a free-moving shooter the player's attention is on bullets, not on a ring.
3. **Timing is demanded of the wrong input.** Fire is held, so "on the beat" means releasing. Dash is the only discrete press.
4. **The window is so wide that 1 in 3 presses is PERFECT anyway**, so skill is neither visible nor rewarded.
5. **No calibration.** Players on Bluetooth or slow phones are late by 100+ ms and see misses they cannot explain.

Reviewers of this genre say the same: the on-beat mechanic works when enemies share the beat (sources D, E, C), when off-beat play is allowed but weaker (C, B), and breaks when the player must fight the controls (A, E).

## (c) Recommended redesign

**Option 1 (recommended): the ship plays the beat, the player plays the dash.** Fire becomes automatic and quantised to the beat grid (an eighth-note grid, so shots are always in time and sound like a drum part; as in the music-synaesthesia shooter, H). The only timed input is DASH, and it is quantised too: a press is held for up to 80 ms and executed on the nearest grid point, so a "near" press feels perfect. A visible tier meter (x1 to x4) rises with each on-beat dash or graze; each tier adds a music layer and a ship glow (the multiplier idea of B). A miss drops one tier, not to zero. Off-beat play keeps working at x1. An "every action counts as on-beat" toggle serves players who cannot hear or feel it (B added the same). Replace the ring with a large pulse on the ship, a screen-edge bar flash on the downbeat, and a dash-ready flash.

**Option 2 (cheap, combine with 1): beat-telegraphed enemies.** Enemy volleys fire only on beats; each enemy glows for one beat before it fires (as in C, D, E). Dodging, grazing and dashing then happen on the beat without a rule to learn.

Also: window default +-110 ms with Tight/Normal/Loose, loosening on touch; one 6-word hint ("Dash on the pulse for x2") shown until the first PERFECT; the music tempo-matched to difficulty (an intensity curve like F).

## (d) Settings panel spec

Overdrive's panel (read-only study of `games/mainhattan-overdrive/index.html`): one flat card "SETTINGS", no tabs. Rows are `.seg` (label plus segmented buttons with `aria-pressed`) or `.sl` (slider with a number readout). Options: Graphics, Resolution, Auto resolution, Motion FX, Field of view, Camera, Free-roam camera, Difficulty, Adaptive rivals, Steering, Throttle (touch), Touch sensitivity, Steering assist, Time of day, Invert tilt, Saved game (copy / load code), Speed units, Crash cam, FPS counter, sliders Master / Music / Effects, a CONTROLS table (keyboard vs touch), and buttons DONE / DEFAULTS / CREDITS. No presets.
Nightrun today: Music, Effects, Audio sync (sliders), Reduced flashing, Calm visuals, Beat ring, Mute (checkboxes), BACK. Nothing else.

Build in Overdrive's style (`.seg` rows, group headings as small caps, DONE / DEFAULTS / CONTROLS buttons, all values saved to `mnr_set`):

| Group | Setting | Options |
|---|---|---|
| Gameplay | Difficulty | Relaxed / Normal / Hard (replaces the title HARD button) |
| | Auto-aim assist | Off / On |
| Controls | Touch sensitivity | 1-5 |
| | Touch layout | Buttons right / left; button size S / M / L |
| | Auto-fire | On beat / Always / Hold |
| Rhythm | Timing window | Tight / Normal / Loose / Everything counts |
| | On-beat assist | Off / Snap dash to beat |
| | Beat cue | Off / Subtle / Strong (ring, edge flash, pips size) |
| | Latency calibration | Tap test (8 taps to a click, shows ms, sets Audio sync) plus slider -150..150 |
| Audio | Master / Music / Effects | sliders; Ducking On / Off |
| | Mute | toggle |
| Visuals | Particles | Off / Low / Normal (default Low everywhere) |
| | Screen shake | Off / Low / Full |
| | Flashing | Off / Reduced / Full |
| | Quality / FPS cap | Low / Medium / High; 30 / 60 |
| | Colour theme | Neon / High contrast / Colour-blind safe |
| | FPS counter | Off / On |
| Accessibility | Reduced motion, large HUD, haptics On / Off | |
| Reset | DEFAULTS button (confirm) | |

## (e) Improvement list

| Rank | Change | Effort | Impact |
|---|---|---|---|
| 1 | Rhythm Option 1 (auto-fire on grid, quantised dash, tier meter) | M | High: fixes #1-#4, #7 |
| 2 | Settings panel per (d), incl. tap-test calibration | M | High (owner request) |
| 3 | Beat-telegraphed enemy volleys (Option 2) | M | High |
| 4 | Bigger beat cue (pulse, edge flash) and one clear hint | S | High |
| 5 | Difficulty: more bullets per wave from 40 s, faster hull loss, real Hard curve; keep Relaxed | S | Medium-high |
| 6 | Portrait layout without rotation (play in the upper 75%, vertical scroll) | L | High on phones |
| 7 | Particles Low by default on desktop, cap 60 | S | Medium |
| 8 | Boss warning art check, music tempo hand-over at mini-boss (92 to 100 BPM) | S | Medium |
| 9 | Pit stop earlier (about 60 s) so the shop teaches early | S | Low-medium |

## (f) Sources (keys in the private research repo)

A: reviews of a fire-on-beat first-person shooter (godisageek, filmstories, onemoregame): steep curve, "Auto" mode kills the concept, latency screen at start. B: creative-director interview and reviews of a rhythm shooter (trueachievements, ggrecon): every action better on beat, multiplier, later "all actions on beat" toggle, edge beat markers distract. C: reviews of a beat-synced brawler (tuni.fi Playlab, Vice): off-beat works, on-beat hits harder, enemy attacks on the soundtrack, optional beat map. D: rhythm roguelike (gamingnexus, Engadget): enemies move on the beat. E: twin-stick rhythm shooter reviews (Nintendo Life, Gamingtrend, Push Square): rhythm and shooting "pull in different directions". F: music-reactive arena shooter reviews (Giant Bomb, Pixel Poppers): music drives enemy density and weapon power. G: "rhythm violence" tunnel game reviews (PC Gamer, Gaming Trend). H: retail and Kill Screen pages on the on-rails music shooter (shots sound in time with the beat). I: calibration devlog (ddrkirbyisq.medium.com, Clone Hero wiki): audio and visual offsets, tap test.
Note: sources found no confirmation of Rez-style grid quantisation of input; Option 1's quantisation is our design inference.
