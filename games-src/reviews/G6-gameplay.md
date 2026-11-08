# G6 strict gameplay review (8 Nov 2026)

Scored by games-src/reviews/GAMEPLAY-RUBRIC.md. Phone touch play at 390x844 and 375x667 on each branch build. shipwreck-isle and cauldron-fair sections follow when their playtests finish.

## short-fuse (branch shelf/W488-short-fuse-sprites)

Built with `games-src/short-fuse/game/build.py`, served next to `games/short-fuse/media`. Played by touch (Playwright, isMobile, hasTouch) at 390x844 and 375x667:
"Learn to play" to its end at both sizes (21 steps, about 48 s each, 0 errors), then job 1 (3 crew, Normal) to the result screen twice: once won (DEFUSED, 13 turns, 2 misses, 24/24) and once lost by guessing like a careless new player (BOOM, 13 turns, 3 misses, 20/24). 0 page errors, 0 console errors, 0 stuck states.

| # | Row | Score | Why |
|---|-----|-------|-----|
| 1 | Rules fidelity | 7 | Checked against the published rulebook: the dual cut (point at a teammate's wire and name a value you hold), a miss burns the fuse and an info token shows the true value, red means boom, yellow only matches yellow, solo cut of the last 2 or 4 of a value, one opening token per player, gear unlocks once two of its value are cut, the once-per-job Twin Probe, the captain's two stands and clockwise turns all match. One thing is not in the rules: odds badges (61%, 74%, ★100%) sit on hidden crew wires by default, so the deduction is done for you. |
| 2 | Tutorial teaches | 7 | It is a real guided job: 21 steps, one short line each plus one glowing tap or Next, the core rules in order, and it hands straight to "Play job 1" with no "learn later" list. Weaknesses: red and the Twin Probe are only told (Next), never done. The practice miss tells you the hidden value ("though that wire is really a 1"). |
| 3 | First 10 seconds | 7 | The title screen offers Play, Story and Learn to play, but it has no goal line. Play opens a short Goal card (cut all 24 wires before the fuse runs out, plus 3 bullets) and then "Show a wire: tap one of yours", which is clear. |
| 4 | Turn clarity | 6 | Good: the top strip ("Job 1 Turn 3 · Your turn · 1 action · or a card"), a prompt line, and a "Turn over" line after each move. Bad: the "Your turn" toast lands on top of the Turn-over line. The odds badges and the after-move grade ("Poor 50% odds, best was 100% (say 3 on teal's wire)") are never explained. "or a card" does not say which card or what it costs. |
| 5 | Phone play | 6 | Wire tiles are 60x79 and both sizes fit with no page scroll. But the header icon buttons are 40x44 and sit at y=-4 at both sizes, so their tops are clipped. Floating "+2", "★100% SNIP!" and "Fuse -1" labels cover the crew wires you need to read. At 375x667 the board is crowded, with the turn strip and the result line stacked over the board. |
| 6 | AI and pacing | 7 | The computer crew plays sensible token-led cuts at about 1.9 s per turn. Job 1 is winnable on Normal (the won game used the tokens). A job takes only about 30 s and 5 to 7 of my taps, which is brisk but very thin for a first real game. |
| 7 | Feel | 7 | The SNIP and +2 pops, cut animations, the fuse burning, the "Fuse -1" shake and the painted win and lose cards give every move feedback. It feels like a game, but the odds overlay makes each turn feel like reading a number off the wire. |
| 8 | Bugs | 7 | Both full games reached the result screen and the tutorial ran clean at both sizes, with 0 errors and 0 stuck states. One silent dead tap: tapping a crew wire during the opening "show a wire" step does nothing, with no hint at all. |
| | **Total** | **6.8** | |
| | **Verdict** | **FAIL** | Rows 4 and 5 are below 7. No stopper. |

### Findings
- Row 3: I opened the page fresh. The title screen has Play, Story and Learn to play with crew and difficulty pickers, but no line saying what the game is about. games-src/reviews/G6-shots/fuse-1-title.png
- Row 3 (positive): I tapped Play. A short Goal card with 3 bullets and a Go button appeared, and it is clear. games-src/reviews/G6-shots/fuse-5-goal-card.png
- Row 2 (positive): Tutorial step 7 says "Teal's token says 2, so tap that wire". There is one glowing target and one sentence. games-src/reviews/G6-shots/fuse-2-tut-point.png
- Row 2: At step 12 (the practice miss) the coach says "Say 2 again, though that wire is really a 1." It gives away hidden information and has you make a miss on purpose instead of teaching how to read a token. games-src/reviews/G6-shots/fuse-4-tut-miss-tells-answer.png
- Row 2: At step 19 the red rule ("Never point at red; a hand of only reds reveals itself") is a Next tap, not done. The Twin Probe (step 15) is the same, so neither is ever practised. games-src/reviews/G6-shots/fuse-3-tut-red-text-only-375.png
- Rows 1, 4 and 5: On my turn in job 1 at 375x667, crew wires show odds badges (61%, 74%, ★100%) that the game never explains and that are not in the rules. The "Your turn" toast covers the Turn-over line. "+2" and "★100% SNIP!" float over the wires. games-src/reviews/G6-shots/fuse-6-odds-badges-toast-overlap-375.png
- Row 4: After a wrong guess the strip shows "Poor 50% odds, best was 100% (say 3 on teal's wir…)". The text is cut off, and the grading system is never introduced. games-src/reviews/G6-shots/fuse-7-miss-grade-375.png
- Rows 8 and 4: During the opening "Show a wire: tap one of yours" step I tapped a crew wire. Nothing happened: no shake and no hint. games-src/reviews/G6-shots/fuse-8-setup-crew-tap-silent-375.png
- Row 5: The header icon buttons (Job, Gear, Rules, hint bulb, Menu) are 40x44 with their top at y=-4 at both 390x844 and 375x667, so they are clipped at the top edge. Same shot as above. games-src/reviews/G6-shots/fuse-8-setup-crew-tap-silent-375.png
- Row 6: I played careless guesses at 375x667 and lost: "BOOM! The fuse ran out", 13 turns, 3 misses, 20/24, with Again and Jobs buttons. The lose card is clear. games-src/reviews/G6-shots/fuse-9-boom-result-375.png
- Row 6: I played reading the tokens at 390x844 and won: "DEFUSED!", 13 turns, 2 misses, 24/24, about 32 s for the whole job and only 7 of my taps. Too short for a first real game. games-src/reviews/G6-shots/fuse-10-defused-result-390.png
