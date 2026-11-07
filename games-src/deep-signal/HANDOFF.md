# Deep Signal HANDOFF (W352)

Shelf slug `deep-signal`, folder `games-src/deep-signal/`, branch `shelf/W352-deep-signal` (not deployed).

## What plays
- Co-op trick taking for 2-5 crew (2 = drone with 7 face-up stacks, played by the captain's seat). 40 cards (4 colours 1-9 + Sonar 1-4),
  captain = Sonar 4, follow suit, sonar trumps, task drafting from the captain, order tokens 1-5 / arrows / final seal Ω,
  one signal each (highest / only / lowest, no sonars, before a trick), flare (pass one card left/right before trick 1, costs a star),
  special missions: no-trick diver, exactly-one-trick diver, captain decides, captain shares evenly, dead zone, silence,
  jammed relay (signals from trick 2/3), Sonar 1 must win, every sonar must win.
- Title: Story (primary), tutorial entry (gx-tutor menu helper, "New here?" on first visit), Quick game (crew 2-5, mission 1-50,
  logbook of completed missions), How to play (gx-help rules cards), Settings (gx-kit Menu: Rules, Tutorial, Restart, Title, sound,
  music on/off + picker, tips).
- Story = the 50-mission logbook on the shared campaign map, 3 acts, bosses at 16/33/50 (special missions), saved progress, stars
  (complete / no flare / <= 2 crew signals), "easier" offer after 2 losses. Mission 1 from the Story runs the tutorial.
- Tutorial: 9 steps on a fixed deal (take a task, a teammate's signal, your signal button, captain, lead high, follow suit, stamp).
- Board-first UI: crew panels on top (tasks, signal, tricks, captain), trick in the middle, your tasks + Signal/Flare + hand below,
  one line of text; glowing cards = legal; tap a glowing card plays it, tap anything else (or hold) shows it large with its text.
  Centrepiece: the final task card glows gold, "Final task home!", then the MISSION COMPLETE stamp.
- Hint bulb (gx-help) uses the same crew AI that plays the computer seats.

## Crew AI (computer teammates, every other seat)
Uses only legal knowledge: own hand, played cards, signals (incl. highest/only/lowest constraints), the drone's face-up cards,
voids shown by not following suit. Card play = sample hidden hands consistent with that knowledge, play the rest out with a
cooperative heuristic (feed task cards to their owner, never take others' tasks, respect order tokens and special rules), keep
the card that completes the mission most often (10 samples normal, 22 hard, 0 = heuristic only for easy). Drafting, captain
yes/no answers and signals use the AI's own hand only.

Headless (`node rules-test.js N normal players [randomSeat]`, 100 attempts per band, 4 crew, all AI):
| band | all-AI crew | one seat random |
|---|---|---|
| missions 1-10 | 68% | 41% |
| missions 11-25 | 56% | 24% |
| missions 26-50 | 21% | - |
Other crew sizes (60 each, 1-10 / 11-25): 2p 57% / 57%, 3p 87% / 77%, 5p 63% / 32%. 0 illegal moves, 0 stuck games, invariants
(40 cards, task count) checked after every move.

## Tests run (all on this branch)
- `rules-test.js`: 17 targeted rules checks + AI games: RULES PASS.
- `smoke.js` (real input: title -> Quick game -> Start dive, taps, forced end -> result): PASS phone + PC, 0 errors.
- `play.js` (real taps, tutorial + 3 missions, twice per size): tutorial PASS x4; 12 missions to a result (8 won, 4 lost), 0 errors.
- `story-test.js` (map -> Story 1 = tutorial -> result -> map -> Story 2 by taps): PASS phone + PC, progress saved.
- `VIS_SLUGS="," build-all.py --quick deep-signal`: PASS, scenarios 10/10 (menu, story-scene, ds-board, ds-play, ds-zoom, ds-help,
  ds-signal, ds-stamp, ds-result + list).
- `ui-audit.spec.js` (local staging, phone + pc): A0 B0 C0 D0 E0; F1 on phone only (title counts the tutorial entry as a second big button).
- `scenario-mutate.js deep-signal`: 27/29 = 93% killed.
- Offline: `offline-manifest.py deep-signal` lists index.html + every media file present (checked with 3 dummy pictures, then
  deleted). `offline-test.js` timed out: the game is not in games/sw.js / the shelf yet (orchestrator step at deploy).
- Asset loader proven with 3 dummy files (bg-title, card-coral, portrait-ines) filling their slots without stretching; removed.

## Found -> fixed (playing it myself)
1. Tutorial "follow" step never showed (target #trick had no size) -> spotlight the board.
2. Tutorial stalled with ?fast=1 (events arrived before the step showed) -> the staged game always keeps real timing.
3. A tutorial left running behind a new game blocked taps -> starting any game stops the tutorial.
4. No-trick diver could draft a task (impossible to win) -> they are skipped in the draft; test added.
5. Two instruction lines at once (coach bubble + line) -> bubble texts rewritten as facts.
6. Low contrast ranks on coral/kelp/tide/sonar cards, "for X" labels, campaign discs -> darker suits, white labels, disc colours.
7. PC campaign labels under 16 px -> raised in our css.
8. Dead taps (stale positions after a card is played) -> tapping the empty table flashes the instruction line.
9. Signal position label clipped -> my-tasks row no longer clips.
10. Stamp too wide for 390 px -> fluid size.
11. Trick counter showed "Trick 2 of 10" after a 1-trick win -> capped.

## Assets
47 slots (wave 1: 19, wave 2: 16, wave 3: 12), ASSET-CHECK required 47 / prompted 47 / gaps 0, Flow prompt files in
`next-wave/flow-2d/deep-signal/`, music cues for the 5 gx-music slots in `next-wave/music/deep-signal/cues-wave1.json`.
`gen.py` regenerates campaign.json, missions-full.json, assets.json, prompts, ASSET-CHECK.md and ASSETS.md from one source.
`register-assets.py` (orchestrator, at merge) adds the rows to next-wave/expected-assets.json.

## Not done / weak
- Hot-seat and online play are not built (brief: optional). Difficulty picker is not exposed in Quick game (normal crew; Story act 2-3 hard).
- `GXC.validate` reports "needs 9 or 10 chapters (has 50)": deliberate, the brief makes the 50-mission logbook the campaign.
- Missions 26-50 are hard for the AI crew (21%); the original logbook is hard there too, but a smarter signal policy would help.
- Art is code-drawn placeholders; music silent until files exist (gx-music slots wired, GA only registers files that exist).
- Not deployed; add to the shelf index / sw.js SLUGS and run offline-test at deploy.
