# Short Fuse: playable by a human in a minute (W400, 7 Nov 2026)

Method: shot title, tutorial steps, first turn, rival turn, scoring and result at 390x763 and 1440x860 (served with the painted media), looked at them as a newcomer,
ran the impeccable critique lens (hierarchy, clarity, readability, feedback, narrative), then fixed in this folder only (shared shell untouched).
Tap-only proof: `game/playable-test.js` (Quick game + Story stage 1 by touch taps on visible, uncovered UI), `game/tutor-test.js` (whole guided prologue at both sizes, elementFromPoint at every spotlight centre).

## The 10 worst problems (before) and what changed (after)

| # | Before (first-minute critique) | After |
|---|---|---|
| 1 | The brief card was just "1 / Boot Camp I / Go": no goal, no reason to care. | Brief card: one story line in Quill's voice + "Cut all 24 wires together. The fuse has 3 steps." (`STORY.quick`, `tbl.js` briefc). |
| 2 | Nothing said whose turn it is; "Tap a glowing wire" never said which wire or why. | Gold "Your turn" / coloured "Teal's turn" banner at every turn change (~1 s); instruction line says "Your turn: tap a glowing crew wire to guess it", then "Now tap one of your own numbers to say it". |
| 3 | The rival's turn was "Teal is thinking" then a tiny "3?" bubble for 0.9 s, then silence: you could not tell what happened. | Rival plays in steps: banner, "Teal points at one of your wires and says 3", then the result caption ("Hit! Your wire is 3; Teal cuts a matching 3 too."), each held 1.4-2.2 s; tap the table to speed up. |
| 4 | A hit or a miss changed the counters silently; no reason shown. | Score pop with a plain reason: "+2 a match: both wires cut", "+4 wires cut", "Fuse -1 a miss: nobody cut". |
| 5 | The status line was one 16 px nowrap line, truncated, on a busy picture. | Solid dark band, 17 px, two lines allowed, captions colour-coded (green hit, red miss). Log jargon rewritten ("validation token goes on the track" -> "All four 5s are done"). |
| 6 | Tutorial bubble was translucent 13.5 px text over the wires, covering the player name plates. | Solid cream bubble, 15 px, portrait of the speaker (Brix or Quill), max two short sentences. |
| 7 | Tutorial was a list of facts ("Tap one of your wires"), no reason to do anything, no character. | Prologue "The Training Rig": Foreman Brix teaches, Vesper Quill is the rival; every step is reaction + story reason + the one thing to do. TUTORIAL-COVERAGE.md ticks every rule. |
| 8 | Result card: "DEFUSED!" and three buttons. Nothing about how it went or what it means. | Story line in the game's voice + "12 turns · 1 miss · 24/24 wires cut"; chapter results get praise/taunt lines for a win or a loss (campaign.json). |
| 9 | On desktop the tiles stayed 54 px in a huge empty table; wires were hard to read. | Tiles scale up to 88 px on screens >= 900x700 (mine up to 92 px). |
| 10 | Help opened with the long rules text. | "How a turn works" in five short lines comes first; the full rules follow. |

Other fixes: banner/pop/captions work in the tutorial too (same grammar as Quick and Story); the Story prologue and chapters use the same cast (STORY.md).

## Gate results (final, 7 Nov 2026)
- `build-all.py --quick short-fuse` PASS; `game/rules-test.js` 101 passed (includes W391's merged stuck-hand fix); `game/playable-test.js` PASS (Quick game + Story stage 1 by touch taps at 390x763, no engine shortcuts);
  `game/coach-test.js` PASS at 390x763 and 1440x860 (replaces the forced-step tutor-test).
- ui-audit (rules A-F, local build served with the painted media): before phone A11 B15 C1 E4 F1 | phone-s A19 B24 C1 F1 | pc A81 B16 E4 F1;
  after phone A0 B3 C0 D0 E0 F0 | phone-s A0 B11 C0 D0 E0 F0 | pc A0 B5 C0 D0 E0 F0. A, C, D, E, F are 0 everywhere.
  Remaining B (pixel contrast) are text at the very bottom of the painted drawers (the frame overlaps the last line of the Rules and Menu panels) and the name plates on the 375x553 board; not fixed.
- `game/sweep.js`: the old 8-word status-line rule is now 22 words for the instruction band (two lines); two kit-help-bubble overlap flags remain at 375x553 (the unmodified build shows the same flags there).
- Console errors: 0 (the game's own page errors; missing optional media in offline runs are filtered).

## Addendum 4 (coached first game, 7 Nov 22:2x UTC)
The forced-tap tutorial was replaced by a coached first game: a real 3-player job, every legal move allowed from turn 1, the computer crew plays its real moves, no forced taps.
Brix (or Quill) speaks one non-blocking bubble at a time, just-in-time (rule first matters, after your hit/miss/solo, after a rival solo or hit, gear unlocked, yellow/red in hand, Twin Probe on turn 2).
The end card walks through the scoring with your real numbers and lists "Things you'll meet later" for rules that never came up. `game/coach-test.js` plays it through the UI at 390x763 and 1440x860 (PASS).
The old step-based tutorial code (`tutSteps` in tutor.js) is unused; its test was removed.

## Round 2 (W400b)
- ui-audit final: phone A0 B0 C0 D0 E0 F0, phone-s A0 B0 C0 D0 E0 F0, pc A0 B0 C0 D0 E0 F0 (drawer text scrolled out of view is hidden so nothing sits under the painted frame; name plates are solid; the coach bubble is a card, not a second instruction line).
- `window.GXCOACH = {running, explained:[ids], done}` is exposed by coach.js; the end card counts its numbers up; Quill comments when a computer crewmate misses (`rmiss`).

## Rules (orchestrator note)
The idle-round guard (four full rounds with no cut explode) is now stated in the help drawer. The "pretend to cut when everything is cut" ruling for job 44 is NOT implemented: the rulebook text was not reachable from this session.

## Not done / honest notes
- Tutorial chapters (1 Your first turn, 2 Scoring, 3 Special cases, 4 Defused) are labelled and have story beats, but leaving restarts the staged job (the shell cannot save it): see TUTORIAL-COVERAGE.md.
- The final "climax" is the end card + counters, no animated count-up.
- Engine rules fixes belong to W391 (merged: only jobs 9, 16 and 36 explode on a stuck hand). The other rules-check items are SIMPLIFIED-ON-PURPOSE or need the card scans (not reachable).
- Shared kit blocker worked around in this folder: tutorial bubble font/background are set in game/skin.css (the shell CSS keeps 13.5 px); the shell's lint still warns above 20 words per step (all steps are <= 20 except none).
