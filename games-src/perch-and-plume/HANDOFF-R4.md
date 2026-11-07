# Perch & Plume HANDOFF-R4 (W367): fixes for the R3 review (avg 5.38)

Branch `shelf/W367-perch-fix` (from `shelf/W342-perch-and-plume`, merged with `alex/brave-carson-rbpmlk`). Not deployed.
Source: `src/*`; build with `python3 build.py`. New test: `story-check.js` (real taps: Story chapter 2 LOST on the goal while the year is won, then WON with the goal met; checks the result text, the story card and the stored stars).

## Found -> fixed (each answers a REVIEW-R3 item)
| # | R3 item | Found | Fixed |
|---|---|---|---|
| 1 | Bug 1 / top-5 #1 (blocking): "You win the year!" then "Not this time", 0 stars | The chapter is cleared by its goal (c2: 3 forest birds), not by winning; nothing on screen said so, the goal was a 4 s toast, and the shared story card greys every star on a loss | (a) live goal tracker bar at the top of the board in every story chapter ("GOAL Forest birds: 1 of 3", turns green with a tick when met); (b) the goal is printed on the starting-hand screen; (c) our own result screen now leads with "Goal met!" / "Goal missed" plus the goal text and the count ("You had 1 of 3"), says "You won the year, but this chapter is only cleared when its goal is met", lists the three stars lit by the facts and says "Stars are earned once the goal is met"; (d) the story card keeps the shared rule (stars only on a cleared chapter), now explained beforehand. Verified by `story-check.js` on phone, landscape and PC |
| 2 | Bug 2 / top-5 #3: tutorial bubbles see-through, over text | The bubble fade-in animation was captured mid-way (opacity < 1) | bubbles are opaque from the first frame (`animation:none; opacity:1`), kit avoid-list now includes the feeder and tray so a bubble never sits on them |
| 3 | Bug 3: goal toast covers the starting-hand text | toast at 4.2 s over the keep screen | no goal toast; the goal sits in its own line on the keep screen and in the tracker |
| 4 | Bug 4: wrong status line in the computer's turn | dock title showed the next player while your own birds were still firing | while an animation runs the title says "your birds are firing" / "<name> is playing" |
| 5 | Bug 5: "1 points", "1 actions" | missing plural | "1 point", "1 action left" |
| 6 | Bug 6: story-map title broke mid-word | 19 px title in a narrow flex cell | 14 px, balanced, no mid-word break (19 px on PC) |
| 7 | Bug 7: Menu tab "Accessibility" overflowed | chips could not wrap | chips wrap, never overflow |
| 8 | Bug 8: feeder dice 25 px | 5 dice in 40 % of the width | 3x2 grid of 44 px dice on phones (36 px single row only on screens under 700 px tall, where height is the limit) |
| 9 | Bug 9: first bubble on the feeder, repeated title | text began with its own title | text shortened, feeder/tray avoided |
| 10 | Bug 10: Escape did not close the card popup | no key handler | Escape closes it |
| 11 | Bug 11 / top-5 #4: PC wasted the screen | small hand cards, half-empty dock | dock 39 vw (max 580), hand cards 172x300 with 16 px text, power text laid out on the card |
| 12 | Bug 12 / top-5 #2: bare placeholder birds | one recoloured bird for all 120 | code-drawn card (until Flow art): habitat colour band on the card top, habitat sky + ground scene, **7 drawn silhouettes by family** (songbird, big songbird, trunk-climber, owl, raptor, wader, swimmer, plump ground bird), each in its own palette; power text laid out on hand cards (colour-coded brown/pink/white strip, wrapped to the card), nest + habitat dots. Real Flow art still replaces these slots (186 slots prompted, none generated here) |
| 13 | Bug 13 / top-5 #5: title had no top bar | title overlay covered the header | header stays on the title (Rules, Menu with sound/settings); Goals/Log/hint hidden until a game; empty round pill hidden; bigger sample cards on the title |
| extra | found while testing | landscape 844x390: dock covered half the screen, rows 12 px high | side dock (300 px) in landscape, compact title |
| extra | | 375x553: mat squashed | sheet 41 dvh, compact feeder/tray below 700 px tall |
| extra | | hand cards cut by the screen edge (menu scenario failed) | hand is exactly 3 cards wide on phones |

## Gate results (7 Nov 2026)
| check | result |
|---|---|
| `VIS_SLUGS="," build-all.py --quick perch-and-plume` | PASS (all scenarios incl. the menu "cut by" check) |
| `node rules-test.js 240` | PASS 240/240 AI games, avg 57.1 |
| `node smoke.js` (phone + PC) | PASS, 0 errors |
| `node ai-gate.js 100` | PASS: hard 100%, normal 100% vs the first-option bot; **hard beats normal 72/100** |
| `ui-audit.spec.js` | phone-s A0 B4 C0 D0 E0 F0; phone A0 B1 C0 D0 E0 F0; PC A0 B0 C0 D0 E0 F0 (the B counts are the audit's own bottom-left test tag over drawer lines / the third hand card, see below; same on the base build) |
| `play.js phone all` / `pc all` (real taps/clicks) | PASS: full 3-player game, solo vs the Rival Flock, tutorial 13/13, Story c1 won (3 stars), c2 played to its story result; on PC c2 was really LOST on the goal (0 stars, loss recorded) |
| `play.js land game` / `tutorial` (844x390) | PASS |
| `story-check.js phone|land|pc` | PASS x3: goal on the keep screen, live tracker, goal-missed result with the count while the year is won, story shows "Not this time" + "Try again", then a goal-met win: result star list == facts, stored stars == facts |

## Not fixed / remaining
- Real art (birds, portraits, title scene): needs Flow; the code-drawn cards are deliberate stand-ins and the game should still be judged with that in mind.
- A resumed (reloaded) Story chapter loses its chapter link (`resume()` sets `UI.camp = null`), so after a reload the result button says "Play again" instead of "Continue the story". Pre-existing, rare; left alone.
- ui-audit B (text over background): the shared audit puts its test tag at the bottom-left of the screen; any text line that sits there (drawer lines, the third hand card's power text) is read as low contrast. Identical numbers on the base build; hollowbough shows B17 on phone-s with the same audit. Our own content has no B on PC.
