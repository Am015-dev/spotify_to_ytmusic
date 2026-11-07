# Vale of Banners R4 (W366) - found -> fixed

Branch `shelf/W366-vale-fix` (not deployed). Reviewer R3 avg 5.00. Tested with the temporary art installed locally (games/ not committed).

| Review item | Fix |
|---|---|
| B1 / top-5 #1 phone bar 469px, Menu off-screen | Bar buttons are icon-only under 640px, title text hidden; bar scrollWidth 390 = screen (measured). Hint, Scores, Rules, Menu all in view. |
| B2 landscape unplayable | Phone landscape (height <= 560) puts the dock at the side (250-330px); market is 4 columns, back lane spans 2; estate and market both fit 844x390 (played by taps, full 25-round game). |
| B3 toast covers chips; stale toast at game over | Toast now lives in the dock title row (its own lane, below drawers); cleared when the result opens. |
| B4 stars vs result | One rule: chapter won = win the game AND meet the chapter goal (first star). Chapters 2 and 4 no longer win without winning (goals rewritten, metrics winSales/winChain). Result card lists each goal met/not met and says why a chapter was lost. |
| B5 goals not shown | Live goal chips in the dock title row in Story (Win/Behind, Sold n/3 + win, Lead n/10, Score n/45), green tick when met. |
| B6 targets < 40px | Estate cells box >= 44px tall (hex width ~38 portrait, 40 landscape, 78 PC); market tiles and opponent chips 44px; white die 44. Portrait hex width stays ~38 not 44: three rows must fit 763px with the dock. |
| B7 "You's estate" | "Your estate". |
| B8 "Play" header, plurals | Header "Board"; "1 region / 2 regions" etc. |
| B9 "roll the dice" | "new dice for everyone". |
| B10 dock hide does nothing on phone | Hide button removed on phone (grab handle still resizes). |
| B11 Accessibility pill | Menu nav pills no-wrap, padded, scroll. |
| B12 Menu > Tutorial drops game | First tap asks "Leave this game? Tap again". |
| B13 tutorial oversells | End card says "You know the basics", names what is not taught yet. |
| Menu text 14px on PC | Menu/drawer text floored to 16px at >= 1024px. |
| Counters unlabeled | Tap a coin/worker/star/flag chip for its meaning (toast + aria-label). |
| Win vs loss result (juice) | Gold banner card + trophy + pop + totals count-up on a win; grey card on a loss. |

## Not done (and why)
- Kit shows 0 stars on a lost chapter (shared gx-campaign.js, read-only for me); our result card shows which goals were met.
- Top-5 #2 art pass (title scene, real font): no art in temp-art for the title; title is still a plain card. #4 full tutorial extension (sell/workers/back lane turns), #5 dice-roll moment and opponent mini-estate: not done.
- ui-audit phone-s: 1 B finding, Rules drawer line "(yellow): bends one rule for" contrast 2.81 (cause not found; the same drawer screenshot looks fine). phone and pc are A-F all 0.

## Proof (all local)
- build-all --quick: PASS (6/6 scenarios). rules-test 28 + 300 AI games PASS; smoke (phone, landscape, pc) PASS, FULL=1 25 rounds by taps PASS 0 errors; tut-test PASS.
- `node story-r4.js`: real taps at 390x763, 844x390, 1440x860: lose chapter 1 (loss card, kit "Not this time", retry), win chapter 1 and 2 (card goals met == saved stars), goal chips visible.
- AI: hard beats normal 76/100 (150.7 vs 127.0).
