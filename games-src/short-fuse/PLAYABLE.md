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

## Not done / honest notes
- Tutorial chapters (1 Your first turn, 2 Scoring, 3 Special cases, 4 Defused) are labelled and have story beats, but leaving restarts the staged job (the shell cannot save it): see TUTORIAL-COVERAGE.md.
- The final "climax" is the end card + counters, no animated count-up.
- Engine rules fixes belong to W391 (merged: only jobs 9, 16 and 36 explode on a stuck hand). The other rules-check items are SIMPLIFIED-ON-PURPOSE or need the card scans (not reachable).
- Shared kit blocker worked around in this folder: tutorial bubble font/background are set in game/skin.css (the shell CSS keeps 13.5 px); the shell's lint still warns above 20 words per step (all steps are <= 20 except none).
