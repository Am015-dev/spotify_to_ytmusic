# R26 gameplay re-review (12 Nov 2026)

Strict re-review by `GAMEPLAY-RUBRIC.md`. Each branch was checked out locally, `origin/alex/brave-carson-rbpmlk` merged in locally (not pushed),
and gated with `VIS_SLUGS="," build-all.py --full --out /tmp/r26 <slug>` (scenarios + phone-check). Each build was served next to its
`games/<slug>/media` and played with real touch only (`touchscreen.tap`), from the title screen, on default settings, at 390x844 and 375x667.
Rules were re-checked against the published games online; notes stayed local. Screenshots: `R26-shots/`.

| Game | Total | Result | Gate | Lowest rows |
|---|---|---|---|---|
| wildmark | **7.5** | **PASS** | **PASS** | First 10 s 7, Turn clarity 7, Phone 7, Feel 7 |

---

## 1. wildmark (shelf/W507-wildmark-gameplay @ beca4024, merged locally): 7.5, PASS

What I played (real touch only, `touchscreen.tap`, fresh storage, default settings, started from the title by tapping):
- Tutorial at 375x667 from "New here? Learn in 5 minutes": 46 steps, 46 taps, 42 s, ends on "You win! You 33 Bram 26" with
  "Play a real game". Every target on screen, uncovered and at least 48x44; 0 dead taps; 0 lines over 12 words; 0 text under 14 px.
  Longest silent wait 3.4 s (Bram's turns, 4 times).
- Two full games from the title's "Play against 1 computer ranger" (default Gentle rival Bram), both to the result screen:
  - 375x667, "careful" newcomer (column with the highest "up to +N", spot with the highest "+N", first animal spot): **lost 57-69**, 20 turns, 80 taps.
  - 390x844, "casual" newcomer (random column, first visible spot, random animal spot): **won 55-52**, 20 turns, 77 taps.
- Rival wait (my last tap to my next turn): median 3.2 s, max 3.6 s. A game took about 2 min of driver time.
- 0 page errors, 0 console errors, 0 stuck states, 0 dead taps (market, spot, Place, animal) in 40 game turns and the tutorial.
- Rules re-checked online this pass (notes local only): pick a tile with its animal, place it touching your area, animal only on a
  matching empty tile, keystone gives an acorn, acorn buys any animal or a wipe, three alike may be swept, four alike are swept,
  20 turns, largest-area bonus, acorns 1 point, tie on acorns. All match.

| # | Row | Score | Why |
|---|-----|------:|-----|
| 1 | Rules fidelity | 8 | Re-checked online this pass: turn steps, wipes (3 optional / 4 forced), acorn powers, 20 turns, area bonus and tie-break all match. |
| 2 | Tutorial teaches | 8 | 46 one-line steps, one tap each, every rule done by doing, 42 s, ends in a real game. Bram's turns leave 3.4 s with nothing to do. |
| 3 | First 10 seconds | 7 | "New here?" first, one big Play. The goal card's headline is clear ("Have more points than Bram after 20 turns") but it carries 3 rule bullets (about 80 words), and a flavour toast ("Rangers are out early this year. Grow faster.") sits on the card beside Start; "Grow faster" reads like a rule that does not exist. |
| 4 | Turn clarity | 7 | "1/3 Drag or tap a tile + animal pair", "up to +N" on every column, "+N" badges on spots, "What should I do?". Two identical bulb icons sit side by side in the top bar (hint and hints switch) and are hidden under the "Your turn" banner on turn start. Result line "Bram beat you most on animal cards 18 vs 48 (you first)" is awkward. |
| 5 | Phone play | 7 | Fixed: the market folds away while placing; board 84% of the screen at 375x667 and 86% at 390x844 (64-66% at pick). Hidden legal spots are now rare: 1 spot just past the left edge in 7 of 20 turns at 375 and 3 of 20 at 390, always with a "◀ 1" arrow (R23: up to 8 per turn). Gate PASS. Still: 13 px animal counters at 390, the turn-1 toast over the lower valley and over the goal card. |
| 6 | AI and pacing | 8 | Bram moves in about 3 s. On defaults the careful newcomer lost by 12 and the casual one won by 3: winnable, not a given. 20 turns is a sensible length. |
| 7 | Feel | 7 | Tiles drop, animals hop, score pops, painted terrains; unchanged. |
| 8 | Bugs | 8 | Tutorial plus two real games to the result screen at both sizes: 0 errors, 0 stuck, 0 dead taps. Gate PASS (it logs "1 dead" in 4 of 6 scenarios, within its limit). |
| | **Total** | **7.5** | **PASS** (every row >= 7, no stopper) |

**Gate** (`VIS_SLUGS="," build-all.py --full --out /tmp/r26 wildmark`): **PASS**. phone-check 390x763, 375x553, 844x390, P>L, L>P,
stale all PASS, errors none (1 dead tap logged in 390x763, 375x553, P>L and stale); rules-test PASS (8 games); lab WARN 3/8 (lab rows
differ from scenarios; not a gate fail).

### Earlier findings (R23)
| Finding | Status | Evidence |
|---|---|---|
| 375x667: legal spots off screen in 8 of 17 turns (up to 8 per turn) | **Fixed in the main**: board 84% while placing; 1 spot past the left edge in 7 of 20 turns, arrow shown. | R26-shots/wm375c-hidden-t14.jpg |
| "Your turn" banner covers spots mid-valley | **Fixed**: it now sits on the top bar (but covers the two bulb buttons for about 1.5 s). | R26-shots/wm375c-t1-0s.jpg |
| Gate FAIL (market off screen in landscape/rotate, board 50% at 375x553, 15-word text) | **Fixed**: gate PASS in all 6 scenarios. | gate log |
| Did not reach a real game's result screen | **Done**: two real games to the result screen. | R26-shots/wm375c-result.jpg, R26-shots/wm390r-result.jpg |
| Market labels / badges 13 px | **Fixed** for labels; four 13 px animal counters remain at 390. | R26-shots/wm390r-mid.jpg |
| Gentle soft for a careful player | **Changed**: careful newcomer lost 57-69, casual won 55-52. Fine for a first game. | R26-shots/wm375c-result.jpg |
| Known: turn-1 toast over the lower valley | **Not fixed**: still there at 0 s and 1.5 s, over the bottom tiles. | R26-shots/wm375c-t1-1.5s.jpg |

### New findings
| Row | What I did | What happened | Screenshot |
|---|---|---|---|
| 3 / 5 | Tapped Play at 375x667 | The goal card (about 80 words) opens with the flavour toast "Rangers are out early this year. Grow faster." drawn on top of it next to Start. "Grow faster" is not a rule in a quick game. | R26-shots/wm375c-goal.jpg |
| 4 | First turn, top bar | Two identical bulb icons side by side (Hint and Hints switch), no labels; the "Your turn" banner covers them at the start of each turn. | R26-shots/wm375c-t1-0s.jpg, R26-shots/wm375c-t1-1.5s.jpg |
| 5 | 375x667, turns 14-20 | One legal spot just past the left edge each turn although the right side of the view is empty; a "◀ 1" arrow shows it. | R26-shots/wm375c-hidden-t14.jpg |
| 4 | Result screen after a loss | "Bram beat you most on animal cards 18 vs 48 (you first)": the order note makes the line hard to read. | R26-shots/wm375c-result.jpg |
| 2 (good) | Tutorial by touch | 46 steps, 46 taps, 42 s, 0 covered or dead taps, all targets 48x44+. | R26-shots/wm375-tut-end.jpg |
