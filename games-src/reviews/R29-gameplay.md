# R29 strict gameplay re-review (12 Nov 2026)

Rubric: games-src/reviews/GAMEPLAY-RUBRIC.md. I checked out each game's branch and merged alex/brave-carson-rbpmlk into it locally (all three were already up to date). Then I ran the deploy gate: `VIS_SLUGS="," build-all.py --full --out /tmp/r29/<slug> <slug>`. I served the staged page next to games/<slug>/media and played with Playwright touch only (hasTouch, isMobile, page.touchscreen.tap at a point that elementFromPoint confirms is on the control) at 390x844 and 375x667, on default settings. A tap counts as dead if nothing on the page or in the state changes within 0.7-1.3 s. I did not edit game code. Rulebook notes were kept local only.

Caveat on timing: up to 6 browsers ran side by side on 4 cores, so the waits I measured are upper bounds.

---

## 1. tidewake (shelf/W498-tidewake-gameplay @ 04324692, already up to date with alex/brave-carson-rbpmlk): 6.9 FAIL

**Gate: FAIL.**
- The build, phone-check (85 s) and lab-test passed.
- The quick sweep failed: "375x553 g1: tap on a gold mark opened no start pop-up / no coach bubble for phase lay / … phase can…". On the small phone, a start-mark tap still does nothing in the sweep. This is a row 5 and row 8 finding.

What I played:
- **Tutorial at both sizes:** 32 steps, 37 taps at 390 (90 s) and 36 taps at 375 (87 s). 0 dead taps, 0 errors, ends on "Play a real game".
- **Quick games** (you vs 2 computers, "Just play", "Safest start · under 1%") to the result screen, 7 in all:
  - 4 following the ★ ("Use ★", then Place).
  - 3 ignoring it (random tile, 0-3 random turns, Place).
  - 4 more ★ runs stalled on my own driver bug (it re-tapped the selected tile). Those are not counted.
- 0 page or console errors.

| # | Row | Score | Why |
|---|-----|------:|-----|
| 1 | Rules fidelity | 8 | Unchanged and right: every junk starts before any tile, roll first, 6/7/8 wakes the leviathans, edge, leviathan and collision sinks, no willing self-sink, last junk wins, sunk crews stay out ("the rulebook has no way back in"). The tutorial teaches the push-off ("gone for good") and the refill to three. |
| 2 | Tutorial teaches | 8 | 32 one-line steps, each a tap, in rule order. Fixed: the practice swap now comes before "You win the lantern!", not on top of the win card. Still only a demo of the real swap card's look. |
| 3 | First 10 seconds | 8 | 4 goal lines on the title, tutorial first, and "Safest start · under 1%". |
| 4 | Turn clarity | 7 | Fixed: the ★ line is now short, e.g. "This way: 13% risk. ★ Tile 2: 3%" or "★ Safest: under 1% risk, keeps 4 moves open", with the details behind (i). Tile badges show ✓ / ✗ / ! / ★. The wake roll no longer blocks every turn (I saw 1 Continue in 8 placements). Left: "under 1%" at the start, then sunk on my second turn (see row 6). |
| 5 | Phone play | 6 | Tiles about 85-100 px and 44 px buttons at both sizes, no page scroll. But the gate's sweep still finds a start-mark tap that opens nothing at 375x553. On the board, the "Stop" pin and the "start" label overlap at the bottom edge. |
| 6 | AI and pacing | 5 | ★ follower: won 1 of 4 (fair share 33%). Out after 1 placement in 1 of 4: 24 s in, after "Safest start · under 1%" and one ★ placement, "Gloomfin blocked its path. It happened on your turn". The other two ★ losses were sunk on a rival's turn after 3 and 5 placements, by a leviathan swimming onto me or me sailing into one. Ignoring the ★: won 1 of 3. Small sample, but the ★ still does not visibly protect a newcomer. Placements came about every 15-27 s (slowed by the parallel runs). Games ran 30-141 s. |
| 7 | Feel | 7 | Painted chart, junks gliding, leviathans moving one by one, red sink marks, a clear "Sunk!" card naming the cause and whose turn it was. Losing on your second turn still feels arbitrary. |
| 8 | Bugs | 6 | 0 errors and 0 stuck states in the game. 1 dead tap in 7 games (a ✗ tile in the ignore run, which is expected). But the deploy gate fails (sweep), so it cannot ship. |
| | **Total** | **6.9** | **FAIL**: rows 5, 6 and 8 are below 7 and the gate fails. 8+8+8+7+6+5+7+6 = 55/8 = 6.875. |

### Earlier findings (R25)
| Finding | Status | Evidence |
|---|---|---|
| Row 4: ★ line 25-40 words with nested brackets | **Fixed**: 5-9 words plus (i) | games-src/reviews/R29-shots/tide-s390a-firstturn.jpg, games-src/reviews/R29-shots/tide-375-act.jpg |
| Row 4/6: "Your roll" card blocks every wake | **Fixed** (toast; 1 Continue seen in 8 placements) | games-src/reviews/R29-shots/tide-375-act.jpg |
| Row 6: early knock-outs while following the ★ | **Not fixed**: 1 of 4 ★ games out after 1 placement, 24 s in, after "Safest start · under 1%" | games-src/reviews/R29-shots/tide-s390a-safest.jpg, games-src/reviews/R29-shots/tide-s390a-sunk-turn2.jpg |
| Row 6: ★ doesn't beat random play | **Not fixed**: ★ 1/4, random 1/3 | games-src/reviews/R29-shots/tide-s375d-result.jpg, games-src/reviews/R29-shots/tide-i390a-won.jpg, games-src/reviews/R29-shots/tide-i375a-lost.jpg |
| Row 2/4: practice swap opens over "You win!" | **Fixed**: swap at steps 54-56, then the win line | games-src/reviews/R29-shots/tide-tut-390-swap.jpg, games-src/reviews/R29-shots/tide-tut-390-end.jpg |
| Row 5: "Off the edge" tag cut at 390 | Not re-seen | none |
| Row 5: start marks about 14 px | **Partly fixed** (bigger hit area per the fixer), but the gate sweep still fails a start-mark tap at 375x553 | none (gate log) |
| Row 8: gate scenarios 6/8, phone-check 0/6 | **Partly fixed**: scenarios and phone-check pass; the quick sweep now fails | none (gate log) |

### New findings
| Row | What I did | What happened | Screenshot |
|---|---|---|---|
| 6 | Quick game at 390: "Safest start · under 1%", then the ★ tile | Sunk on my next turn, 24 s in: "Because the leviathan Gloomfin blocked its path. It happened on your turn." "Under 1%" and then out after one move. | games-src/reviews/R29-shots/tide-s390a-safest.jpg, games-src/reviews/R29-shots/tide-s390a-sunk-turn2.jpg |
| 6 | 3 more ★ games | 1 win (375, 8 placements). 2 losses on rivals' turns after 3 and 5 placements (a leviathan swam onto me; I sailed into one). | games-src/reviews/R29-shots/tide-s390e-sunk.jpg, games-src/reviews/R29-shots/tide-s375d-result.jpg |
| 5 / 8 | Deploy gate | The sweep fails at 375x553: a gold-mark tap opened no start pop-up and no coach bubble showed for the lay phase. | none (gate log) |
| 5 | Start turn at 390 | The "Stop" pin overlaps the "start" label on the bottom edge mark. | games-src/reviews/R29-shots/tide-s390a-firstturn.jpg |
| 2 (good) | Tutorial at both sizes | 32 steps, 36-37 taps, 0 dead, ends on "Play a real game". | games-src/reviews/R29-shots/tide-tut-390-end.jpg, games-src/reviews/R29-shots/tide-tut-375-end.jpg |

---

## 2. emberclimb (shelf/W485-emberclimb-bench @ 46aac4e7, already up to date): 6.8 FAIL

**Gate: PASS.** Build, scenarios, phone-check (57 s), lab-test (WARN 5/8 LAB-row mismatch, not blocking), and sweep "s 6 wins 1 … RULES TEST PASS (40 games)".

What I played:
- **Tutorial ("New here?") at both sizes:** 15 guided steps, 23 taps, 0 dead, 43 s, then the coached climb begins. My driver did not finish the coached climb; it stalled on the reward screen, which is a driver problem, not a game one. So the coached climb is not scored.
- **Quick game on defaults** (Garrick, "Gentle (first climb)", newcomer play: block when hit is coming, else attack the weakest, random rooms and rewards, rest heals):
  - 390x844: **won**, SUMMIT, boss Ashen Wraith, 285 s, ♥ 200/480.
  - 375x667: **died on floor 8** to a regular Gnawer, at 0/480 after 361 s.
- Foe turns: median 0.8 s, max 0.86 s. 0 page or console errors, 0 dead taps on real controls.

Fidelity:
- Act 1 foes now carry the printed card values x8 (`tab:1` entries in src/data.js).
- **Gate Wyrm** (boss, `gate-colossus`):
  - In the data: 40 HP per hero; attack mode is ONE repeated action, "2 dmg + 5 Block"; after 6 damage it shifts to defensive mode with Thorn Hide. In game units that is 320 HP, gaining 40 Block every turn.
  - The fixer's own rules note says "one source; threshold read from code".
  - I could not find a second source for the board card's numbers. The publisher's rulebook only uses this boss as the example of switching modes. The online rule summaries give no numbers, a fan thread was unreadable (403), and the video game's version gains Block on the mode shift, not every turn.
  - So the every-turn 40 Block is **unverified, from one source**. I score it as a Rules finding (not confirmed, possibly wrong), not as proven wrong.
- Story mode still uses invented act 2-3 foes (Cinder Hound, Ash Wisp, Smoke Hexer and others have no `tab` flag).
- **Gentle:**
  - Labelled fairly. The setup has a "Gentle (first climb) | Tabletop (rulebook)" toggle and the line "Act 1 only: 9 floors, then a boss. Easier: more HP and potions". The result says "Played on Gentle (easier mode). Try Tabletop next." A newcomer can tell it is not the rulebook.
  - But x6 HP shows as "♥ 480/480" against foes scaled x8. It looks silly next to an 80-HP hero card, and it is still not safe: a regular floor-8 foe killed a 480-HP hero.

| # | Row | Score | Why |
|---|-----|------:|-----|
| 1 | Rules fidelity | 6 | Act 1 foes now use the printed cards x8, Quick is "Act 1 only" on setup, and the split foes come from the box. But the boss card (every-turn 40 Block) is single-source and unverified, Story still uses invented act 2-3 foes, and Gentle multiplies HP x6 (clearly labelled, but not the game). |
| 2 | Tutorial teaches | 7 | 15 one-line steps in rule order: intent, energy, attack, Vulnerable, Block, end turn, patterns, Strength, Weak, potion, finish, card reward, map. 0 dead taps at both sizes. Still 4 Next-only steps (goal, energy, pattern, path). |
| 3 | First 10 seconds | 7 | Big "New here? Learn in 5 minutes"; step 1 points at the boss intent with "Goal: beat the boss on top." The goal card on Quick is 4 short bullets. |
| 4 | Turn clarity | 7 | Intent badges, "Incoming 16" under the hero, card text "Deal 16." / "Gain 8 Block.", one line under the hand. |
| 5 | Phone play | 7 | Fixed: the boss split fits at 390 (all 3 slimes on screen with HP bars). The potion is now 56x56. The hand fan overlaps cards, but each one tapped fine. Small: "Spine Sl…" name cut. |
| 6 | AI and pacing | 6 | Brisk (0.8 s foe turns, climbs 4.5-6 min). On Gentle a newcomer won 1 of 2. One of those runs died on floor 8 to a regular foe despite x6 HP. Tabletop (the rulebook mode) was not tried as a newcomer here. |
| 7 | Feel | 7 | Painted foes and backgrounds, damage pops, a card-reward fan, painted Summit and Fallen screens with the final deck. |
| 8 | Bugs | 7 | Gate PASS. 0 errors and 0 stuck states in 2 full climbs and 2 tutorials. My dead-tap counts were all my driver tapping behind a modal (goal card, upgrade picker), not the game. |
| | **Total** | **6.8** | **FAIL**: rows 1 and 6 are below 7. 6+7+7+7+7+6+7+7 = 54/8 = 6.75. |

### Earlier findings (R24)
| Finding | Status | Evidence |
|---|---|---|
| Row 5/8: boss split overflows, slugs off screen | **Fixed** | games-src/reviews/R29-shots/ember-split-390-fits.jpg |
| Row 8: "Felled by Mire Slug (boss)" | Not re-seen (my boss fights were won). The loss reads "Felled by Gnawer." | games-src/reviews/R29-shots/ember-q375-gentle-lost-f8.jpg |
| Row 8: stale relic tooltip on CLIMB WON | **Not seen** on the Summit screen | games-src/reviews/R29-shots/ember-q390-gentle-won.jpg |
| Row 1: setup never says "Act 1 only" | **Fixed** ("Act 1 only: 9 floors, then a boss.") | games-src/reviews/R29-shots/ember-setup-gentle-390.jpg |
| Row 1: foe numbers in video-game sizes | **Fixed for act 1** (printed values x8). Boss card unverified; Story act 2-3 still invented. | none (src/data.js) |
| Row 6: floor-4 elite kills a newcomer in 52 s | Not re-seen; a floor-8 regular foe killed a 480-HP Gentle hero | games-src/reviews/R29-shots/ember-q375-gentle-lost-f8.jpg |
| Row 5: potion 36x36 | **Fixed** (56x56) | games-src/reviews/R29-shots/ember-tut-390-reward.jpg |
| Row 2: 4 Next-only steps | **Not fixed** | games-src/reviews/R29-shots/ember-tut-390-map-next.jpg |
| Gate: scenarios 9/12, phone-check FAIL | **Fixed** (gate PASS) | none (gate log) |

### New findings
| Row | What I did | What happened | Screenshot |
|---|---|---|---|
| 1 | Checked the Gate Wyrm boss card against other sources | One repeated attack-mode action, "2 dmg + 5 Block" (40 Block every turn in game units). The rules note admits "one source; threshold read from code"; I found no second source with the card's numbers. Not confirmed. | none (src/data.js gate-colossus) |
| 6 / 1 | Quick game on the default Gentle at 375 | ♥ 480/480 at the start (x6). Died on floor 8 to a regular Gnawer. The big HP number looks odd against an 80-HP hero and still does not carry a newcomer. | games-src/reviews/R29-shots/ember-q375-gentle-lost-f8.jpg |
| 1 (good) | Read the setup screen | "Gentle (first climb) / Tabletop (rulebook)" and "Easier: more HP and potions". The result says "Played on Gentle (easier mode). Try Tabletop next." Clearly labelled as not the rulebook. | games-src/reviews/R29-shots/ember-setup-gentle-390.jpg, games-src/reviews/R29-shots/ember-q390-gentle-won.jpg |
| 5 | Boss split scenario at 390 | All 3 slimes fit. The third name is cut to "Spine Sl…". | games-src/reviews/R29-shots/ember-split-390-fits.jpg |

---

## 3. vinegrave (shelf/W490-vinegrave-bench @ 034baeba, already up to date): 7.0 FAIL

**Gate: PASS.** Build, scenarios, phone-check (61 s), lab-test (WARN 3/8 LAB-row mismatch, not blocking), and "PASS rules-test (200 AI games)".

What I played:
- **Tutorial ("Learn to play") at both sizes:** 35 steps, 36 taps, 0 dead taps, 75-76 s, ending on "Play a real game".
- **Default games** (Play, then "Start the expedition": 1 rival, easy, hints off). A newcomer taps a random glowing site, card or the research track, then its button, and passes when nothing glows (plus at random 8% of the time after turn 3). Two reached the result screen:
  - 375x667: lost 7-18 in 73 s (I passed early).
  - 390x844: lost 14-17 in 127 s, 28 actions.
- Three more runs stalled on my driver, not the game: it did not know the "Choose one effect" and "Hire an assistant" choosers. Not scored.
- Rival waits: median 2.1 s, max 3.8 s. 0 page or console errors.

| # | Row | Score | Why |
|---|-----|------:|-----|
| 1 | Rules fidelity | 7 | As in R25: starting deck and goods, one main action plus free actions, Plane = 2 coins, items under the deck, artifacts at once, guardians, Dread at round end, research with notebook and assistants, temple tiles. The small gap I logged before (leftover hand always kept) was not re-checked. |
| 2 | Tutorial teaches | 8 | Fixed: the count now matches the card ("Research and temple: you 18" = Research 12 + Temple 6; idols, shrines and guardians 12; cards and Dread 0; total 30). 0 dead taps at both sizes, the rival plays its round, and it ends on "Play a real game". Round-end Dread and exiling are still only words. |
| 3 | First 10 seconds | 7 | Clean title (Learn to play, Play, Story) and a one-line goal. The first board is still dense: 6 market cards, 15 site discs, the research column, a resource row. |
| 4 | Turn clarity | 7 | Priced action buttons ("Buy · 3 compasses", "Dig", "Explore"). Choosers read plainly ("Trail Guide: gain 1 coin OR a Plane of travel this turn."). Small corner badges ("−2") replace "Need N more" and leave the art visible. The prompt is "Your turn. Tap or drag what glows." |
| 5 | Phone play | 7 | Fixed: at 375 the result card's buttons sit below both breakdowns. The gate's phone-check passes. Still: explorer pawns are 34x46 (under 44 wide). At the start of my turn the "Tamsin Reed played 1 more move." toast covers the market's top row, and my tap on a glowing card there hit the toast. Hand names are partly covered by the next card or a "+3" badge ("Survey Airship", "Creeping Dread"). |
| 6 | AI and pacing | 6 | Waits fixed (median 2.1 s). Easy is no longer a pushover: the rival scored 17-18 in both games, so it is steadier than R25's 6-41. But my newcomer lost both (by 11 and by 3), so I could not confirm the fixer's "won 3 of 4". A newcomer winning on the default level is not shown in my sample. |
| 7 | Feel | 7 | Painted market cards, explorers walking to sites, flying goods and points, a painted result card with art and per-category breakdowns. |
| 8 | Bugs | 7 | Gate PASS. 0 errors and 0 stuck states in 2 full games and 2 tutorials. 2 dead taps: one on a card covered by the rival toast, and one on a "Skip" that did nothing. |
| | **Total** | **7.0** | **FAIL**: row 6 is below 7. 7+8+7+7+7+6+7+7 = 56/8 = 7.0. |

### Earlier findings (R25)
| Finding | Status | Evidence |
|---|---|---|
| Row 6: easy rival too soft (newcomer won 4/4, rival 6-8 points) | **Fixed, maybe overcorrected**: the rival scored 17 and 18; my newcomer lost both | games-src/reviews/R29-shots/vine-g375-result-lost.jpg, games-src/reviews/R29-shots/vine-g390b-result-lost.jpg |
| Row 5: result buttons cover your breakdown at 375 | **Fixed** | games-src/reviews/R29-shots/vine-g375-result-lost.jpg |
| Row 5/8: gate 6/8 scenarios, phone-check 0/6 | **Fixed** (gate PASS) | none (gate log) |
| Row 2: count says "Research: you 18" vs the card | **Fixed** ("Research and temple: you 18") | games-src/reviews/R29-shots/vine-tut-390-count.jpg |
| Row 5: "Need N more" tags hide the market art by round 4 | **Fixed** (small corner badges) | games-src/reviews/R29-shots/vine-375-midgame.jpg |
| Row 4: "Starting cards are free" in round 4 | **Fixed** ("Your turn. Tap or drag what glows.") | games-src/reviews/R29-shots/vine-g375b-covered-site.jpg |
| Row 5: exile chooser cuts its 5th card at 375 | Not re-seen (no exile chooser in my games) | none |
| Row 7/5: pills and the rival caption pile onto the guardian card | **Partly**: the rival toast now covers the market's top row at the start of my turn | games-src/reviews/R29-shots/vine-g375b-covered-site.jpg |
| Row 6: one hidden lever (research) decides the game | Not re-tested (the research-free run stalled on my driver) | none |

### New findings
| Row | What I did | What happened | Screenshot |
|---|---|---|---|
| 6 | 2 default games tapping random glowing things | Lost 7-18 and 14-17. The rival is steady now, but a newcomer win was not shown. | games-src/reviews/R29-shots/vine-g390b-result-lost.jpg, games-src/reviews/R29-shots/vine-g375-result-lost.jpg |
| 5 / 8 | Tapped a glowing market card at the start of my turn (375) | "Tamsin Reed played 1 more move." covers the top market row; the tap landed on the toast. | games-src/reviews/R29-shots/vine-g375b-covered-site.jpg |
| 5 | Measured the explorer pawns | 34x46, under 44 px wide. They glow; the prompt says drag, and a plain tap is easy to miss. | games-src/reviews/R29-shots/vine-pawn-tap-dead.jpg |
| 5 | Hand at 375 | "Survey Airship" is under a "+3" badge, and "Creeping Dread" is cut by the next card. | games-src/reviews/R29-shots/vine-g375b-covered-site.jpg |
| 4 (good) | Hired an assistant | A plain three-button chooser: "Trail Guide: gain 1 coin OR a Plane of travel this turn." / "Healer: exile a card." / "Gem Cutter: pay 2 coins, then gain 1 jewel." | games-src/reviews/R29-shots/vine-375-assistant-chooser.jpg |
| 2 (good) | Tutorial at both sizes | 35 steps, 36 taps, 0 dead, ends on "Play a real game". | games-src/reviews/R29-shots/vine-tut-390-end.jpg, games-src/reviews/R29-shots/vine-tut-375-end.jpg |

---

## Summary
| Game | Total | Result | Gate | Lowest rows |
|---|---:|---|---|---|
| tidewake | 6.9 | FAIL | FAIL (quick sweep: start-mark tap at 375x553) | 6 AI/pacing 5; 5 Phone 6; 8 Bugs 6 |
| emberclimb | 6.8 | FAIL | PASS | 1 Rules 6; 6 AI/pacing 6 |
| vinegrave | 7.0 | FAIL | PASS | 6 AI/pacing 6 |
