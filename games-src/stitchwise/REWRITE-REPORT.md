# [REWRITE stitchwise] report (20 Nov 2026)

I could not send the scheduled report (the tool was refused), so this file is the report.

Branch shelf/W573-stitchwise-strict, merged with origin/alex/brave-carson-rbpmlk, pushed. Nothing deployed, no PR.

## Commits
- dd510604: our own 33-patch set, test fixtures updated
- 40936148: F4 nits on the new PC layout
- d26245de: COMPONENTS.md, rules-notes, proof
- 0d23056b: fixes from the cold check

## Gates
- `build-all --full`, run once on its own: PASS (phone-check, scenarios, rules sweep). lab-test WARN 3/8: the LAB rows don't match the scenario list. This change doesn't touch either list.
- logic-test 73/73, rules-test PASS, tut-walk PASS (12 steps).
- pc-mouse PASS at 910x512, 1366x768 and 1920x1080.
- calm: loops=0, maxHelpers=0.
- games/lab.html and games/scenarios.json restored, not committed.

## Totals: old to new
| | Old | New |
|---|---|---|
| Patches | 33 | 33 |
| Squares | 166 | 166 |
| Cost | 133 | 137 (+3%) |
| Time | 107 | 109 (+2%) |
| Income | 38 | 38 |
| Cheap-slow / expensive-fast | 4 / 3 | 4 / 3 |

- No patch matches an original patch exactly.
- No patch that reuses an original shape shares two of its three numbers with that patch.
- 18 shapes are shared (there are only a few small polyominoes); 15 shapes are new.
- Every patch has a new name.
- The tutorial now reads patch 8's own cost and time.

## Sim (500 games per pairing, fresh seeds 7000+)
| | Old | New |
|---|---|---|
| Normal beats Easy | 64% | 62% |
| Hard beats Normal | 62% | 60% |
| Easy beats Simple | 80% | 85% |
| Average final score: Normal | 17.6 | 17.2 |
| Average final score: Hard | 20.2 | 19.3 |
| Average final score: Easy | 10.6 | 8.7 |
| Moves per game | 39.0 | 39.2 |

- Easy's average score is 18% lower but only 1.9 points lower. Everything else is within 10%.
- The sim cannot measure a newcomer on Easy. In the cold check below, the tester won 1 of 2 games on Easy.

## F4 nits
Fixed:
- On PC the track name tags are hidden (the header shows both positions), so nothing covers the track.
- The rival's mini quilt fits at 512 high.
- On phone, during the free 1x1 the offers stay visible but dimmed, and the track stays on screen.
- The side-panel label no longer sits against the left edge.
- The leather square looks solid instead of dashed.
- The toast sits in the top bar, never over the board.
- Tapping a patch you can't afford, or tapping a chosen patch again, shows a short note in the prompt line instead of a full-screen sheet.

Also fixed on the way:
- Narrow PC offer rows and phone income rows no longer overlap or clip.

Not reproduced:
- "Score says 0 empty".

## Cold check (independent agent with no history; verdict as-is)
- Could play: yes. Easy, touch at 375x667 and mouse at 1366x768, tutorial skipped.
- Results: touch game won 6-1; mouse game lost -2 to 5.
- Fun: 3/5.
- Would play again: yes, mildly. The buy-vs-wait tension is a good puzzle, but scores of -2 to 6 feel harsh and low, and with random play it couldn't tell skill from luck.
- Choices: mostly interesting. Cost, time and income make buy-vs-wait a real choice. Shape fit felt secondary to the economy.
- Problems it saw:
  - Phone offer text clipped ("10 buttor"). Fixed after the check.
  - Broken-image circles on the title screen over file://.
  - A patch sheet it never asked for opened mid-placement. Fixed: a second tap now gives a note.
  - On phone, the floating "+N pts" overlaps the quilt's top-left corner.
  - The rival's card covers the board header while it plays.
  - On PC the plate clips "7x7 30/4".
  - The mini avatars look blank early in the game.
  - The Easy rival looked strong early (income 11).

## Proof
- games-src/stitchwise/COMPONENTS.md
- proof/patch-sheet.png (all 33 patches)
- proof/shots-rw/ (375x667, 910x512, 1366x768)

## Still open
- The track constants are still the original's. The audit suggested changing them; the brief said to keep the board.
- The "7x7 n/49" clip on the PC plate.
- Where the "+N pts" float lands on phone.
