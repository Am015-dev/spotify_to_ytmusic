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

## Addendum 5 (W423, 8 Nov 2026): you must SEE how you score
- `game/scorecard.js` (new, same code in Quick, Story and the coached game): a permanent tracker (`Job x · Turn n · whose turn · 1 action / or a card`, the token is struck out once spent), an always-visible score breakdown (wires cut by You and by each crewmate, leader starred), ONE strip under it for the "Turn over: why" card (what the turn did, who is next), else the PREVIEW of the move being built (odds of each number on the picked wire, "+2 wires cut", fuse risk), else "Best now". Best-value badges (top three glowing crew wires, best one starred) come from the same solver the computer crew uses. After every turn a one-line Good / Okay / Poor rating compares the played move's odds with the solver's best pick (rivals are rated too).
- Look-check: `button.btn.wide` plate (`ui-row-c.webp`) was drawn at two aspects (border-image-width 5px 7px on a uniform slice 30); now 6px 6px in `skin.css`.
- Shots: `playable-shots/a5-390-*.webp`, `a5-1440-*.webp` (coach bubbles hidden in the shots so the tracker is visible).
- Known: while a coach bubble is open it can sit over the tracker (the shell places it); "Got it" closes it. Odds are exact only for hidden wires the solver can sample (80 samples); known wires show 100% / 0%.

## Addendum 7 (8 Nov 2026): three modes, a clean game
- LEARN TO PLAY: title button (`data-a=offeryes`), the coached game; the only place with coach bubbles. Play no longer forces it on first launch and the "New here?" offer is off.
- PLAY (default): board, hand, tracker, one score line, a one-card "Goal" before turn 1 (win sentence + 3 bullets), the "+N reason" pop. No banners, bubbles, previews, badges, ratings or turn-over cards. Tap the tracker/score line for "Why" (last turn, how points work).
- HINTS: the bulb in the top bar is the toggle (off by default, remembered, lit when on). On: previews, odds badges, turn-over card with Good/Okay/Poor, turn banner, first-time bubbles and a "What should I do?" button (the old advisor).
- Shots: `playable-shots/a7-play-390.webp` (clean Play), `a7-goal-390.webp`, `a7-hints-390.webp`, `a7-play-1440.webp`.
- Tests adjusted: coach-test starts from Learn to play; playable-test no longer expects banners or the flavour line; qa-bot's coached phase taps `offeryes` when present.
- Look-check follow-up: the plate fix is now slice `30 42` with widths `5px 7px` (same corner scale both ways) instead of 6px 6px.
- Coach bubbles (first-time help) are Learn-to-play only: off in Play and with Hints on.

## Game feel (W469, 8 Nov 2026, BRIEF-GAMEFEEL)
- Reading time: every caption, toast and coach bubble stays 4 s + 1 s per 10 words, or until tapped (tap the band or the table). The computer crew waits
  for it (`plRead`/`plWait`/`plSkip` in playable.js); the rival's "points at" step is shown on the wire for 1 s, then one result caption.
- Score pop is a number only (+2 / Fuse -1) that flies up to the counter; no second text box. Vibrate tick on pick-up, drop and every cut.
- Goal card: one sentence + 3 short bullets. Learn to play opens on the goal bubble ("We win when all 15 wires are cut, before the fuse burns out").
- Coach bubble fixed: it was half off-screen at 390 (transform overridden by its entry animation); now centred, tap it to dismiss, the tap passes through.
- Text floor 14px on phone (16px on desktop) for plates, chips, gear names, tile corner values.
- Shots: playable-shots/feel/ (390x844, 375x667, 1440x900). Script: game/feel-shots.js.
- Feel gate (8 Nov, 03:30 decision): the instruction line is steady (data-fa-skip, no flash, no rival play-by-play; rival moves show on the
  board as the pointer bubble, cut motion and number pop). Copy pass: every player-facing sentence 12 words or fewer. Learn to play is a
  coached free game; coach.js tells GXT-based tools it is running with its staged part over. feel-audit --secs 120: (a)-(e) all 0.
- Round 2: COPY-FIX.md applied (35 lines left to apply). The middle of the table shows the owner's rig art and the race ("12 / 24 wires cut") in the
  biggest gap between the stands (phone: between the crew racks; desktop: between crew row and your rack); hidden when there is no room.
  Header number track no longer overlaps on desktop (flex row) and stays a 6x2 grid at 14px on phone.

## FIXED2 (review R1, 8 Nov 2026): turn clarity, tutorial by doing, job 1
- Racks: every stand is its own framed rack. A seat with two stands labels them "Stand 1" / "Stand 2" with a gap between. A stand that wraps onto two rows shows a gold return arrow from the end of row 1 to the start of row 2 (`standsHTML`, `.stl`, `.rtn` in tbl.js / table.css; `RACK` keeps the fit maths right).
- Icons: tap any name plate for what its icons mean (★ foreman, the Twin Probe case, wires left, two stands); the goal card has the same legend.
- Learn to play (22 steps): the practice miss is made with the Twin Probe (tap the probe, two of Plum's wires, say 2; Plum tags the 1), and the red step is "tap your red". tut-test.js now checks both.
- Job 1: you are the foreman (first turn, two labelled stands); the goal card says "try a match, a solo cut and your Twin Probe"; the result card shows which of Match / Wrong guess / Solo cut / Twin Probe you used and what to try next job.
- The cut snap no longer scales a tile over the next stand.
- Gates: rules-test 101/0; tut-test PASS at 390x844 and 375x667; mission-touch job 1 PASS at both (11 taps, won, 0 errors); playable-test PASS at both; rotate-test PASS (6/6); guard ok.
- Shots: playable-shots/fixed2/.
