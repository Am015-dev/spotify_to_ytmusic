# R49 strict gameplay review: doorkick-dungeon (14 Nov 2026, UTC)

Reviewer R49. Rubric: games-src/reviews/GAMEPLAY-RUBRIC.md (8 rows; PASS needs every row >= 7; a stopper caps the total at 4).
New stricter checks this round: rules checked against the ORIGINAL game's rules (not just our rules doc), and a helper-clutter count.
Branch `shelf/W502-doorkick-gameplay` @ **9fb838ce700b7c2f28c52ac47137ba726fbf407b** ("fight fit also keeps the monster's bonus chips on the table").
The gates ran one at a time with nothing else running. I played the STAGED `--quick` build (`/tmp/x/doorkick-dungeon/index.html`, byte-identical
to the `--full` stage) with Playwright touch taps at 375x553 and 375x667.

| Commit | --quick | --full x3 | Rows (1-8) | Raw | Total | Verdict |
|---|---|---|---|---|---|---|
| 9fb838ce | PASS | **PASS 3 of 3** | 5 7 7 6 6 7 6 8 | 6.5 | **6.5** | **FAIL** (rows 1, 4, 5, 7 under 7) |

## Gates
- `--quick`: PASS, 97 s, 25/25 scenarios.
- `--full` run 1: PASS (297 s). Phone-check 68 s clean. SWEEP CLEAN 4 games (4 reached a winner).
- `--full` run 2: PASS (249 s). Phone-check clean. SWEEP CLEAN 4 games.
- `--full` run 3: PASS (339 s). Phone-check clean. SWEEP CLEAN 4 games.
- Lab WARN 9/12 in all three runs (not blocking, same as R47). The R47 stopper (fight clipped at 375x553) did not come back in 12 sweep games.
- Note for the orchestrator: `--full` restamps the tracked `games/lab.html`; I restored it with `git checkout` and did not commit it.

## Rules against the original game (new check)
The repo's notes (`munch/RULES-CHECKLIST.md`, `munch/rules-notes.md`) say the game adapts the 2001 base game of the classic level-10
door-and-treasure dungeon card game. I checked the engine against that game's published rules as I know them, not only against our checklist.

Right: setup (level 1, 4 door + 4 treasure), kick the door (monster = fight, curse = hits you, other = hand), look for trouble OR loot the room,
no loot or trouble after a fight, charity above 5 cards (lowest level gets them, or discard if you are lowest), strictly more strength to win,
Warrior wins ties, run on 5+, one roll per monster, Bad Stuff, death and looting the body highest level first, one helper, bargained treasure,
Elf helper levels, selling 1,000 gold per level with no change and never to level 10, level 10 only from a kill, one Big item (Dwarf any),
Dwarf 6 cards, one headgear/armor/footgear, two hands, interference window after "Fight", one-shots for either side, monster enhancers.

**Wrong: the Halfling's race power.** In the original base game the Halfling (a) sells one item a turn for double price and (b) after a FAILED
run-away roll may discard a card to roll once more. The engine does (a) but not (b): there is no reroll anywhere (`engine.js` `roll()`/`rescueOpts()`
offer only escape cards). Instead it gives every Halfling **-1 to run away** (`engine.js:246` `runMod`; card text `cards.js:18`: "-1 to run away").
Worse, our own in-game rules page says the opposite of the engine: `rules-html.js:35` "Halfling: ... If you fail to run away, discard a card to
roll again." So a player who reads the rules is told about a power the game never gives, and gets a penalty nobody told them about.
Race powers are core rules, so per the brief **Rules is capped at 5**.
Documented omission (not counted as wrong): trading items between players (rules-notes "Not included"). Still a real rule of the original;
worth adding later.

## Helper clutter (new check)
Measured on every one of my decision points in 4 full touch games (802 samples, normal non-tutorial turns): which helpers were visible at once.
| Helper | On in |
|---|---|
| ★ badge + gold ring on a hand card | 631 / 802 |
| Pulsing button (`.pulse`, 1.1-1.6 s infinite) | 260 / 802 |
| "+N ›" hand-scroll cue | 362 / 802 |
| Glowing drop targets (only after picking a card) | 232 / 802 |
| Finger, coach bubble, goal card, toasts | 0 |

- ★ card AND a pulsing button at the same time: 166 / 802 (21 %). Two or more of ★ / pulse / cue at once: 446 / 802 (56 %).
  Example: setup turn, "Become ★ Halfling": the Halfling card has the ★, the Ready button pulses, Loot the Leftovers glows gold and the "+3 ›" cue sits on it.
- **Constant motion**: in 563 of 802 samples something on screen loops forever. Every main phase the door breathes (`bfBreathe`, both `.bfdi` and
  `.bfkick`) and the boot kicks (`bfBoot`) on a 1.6 s loop, the suggested button pulses (`pulse` / `tblPulse`), and once a card is picked the targets
  glow on a 1 s loop (`bfGlow`).
- Verdict: more than one active helper by default AND helpers that pulse constantly, so **Feel and Turn clarity are capped at 6**.
  The finger is switched off (good) and coach bubbles never showed in a normal game (good).

## Compact fight at 375x553 (staged build, forced fights)
| Monsters | Layout | Readout | Names | Buttons | Off screen |
|---|---|---|---|---|---|
| 1 | compact (`cmp`) | "YOU 3 vs 10 MONSTERS" | 14 px, full name | Run 33% 170x46, Help 79x44 | none |
| 2 | compact | "YOU 3 vs 22" | 14 px, full names | 170x46 / 79x44 | none |
| 3 | compact | "YOU 3 vs 40" | 14 px, full names | 248x45 / 79x44 | none |
| 4 | compact | "YOU 3 vs 41" | 14 px; "The Endless Goblin..." ends in an ellipsis | 248x45 / 79x44 | none |

Readable: the R47 fault (18 px tiles, no score) is fixed. Two notes: at 553 even a single monster goes compact, so the "-7: need help or run"
margin line and the monster's art, treasure and Bad Stuff are not on the table (you must tap for them); at 375x667 one monster shows the full card and the margin line.
Shots: fight-375x553-m1..m4.png, fight-375x667-m1..m4.png.

**Still wrong: the score pill covers the monster card in a RIVAL's fight at 375x553** (non-compact layout). Setup seed 5, 3 rivals, tap Ready: Morwen fights
Turbo Slugs. The "MORWEN 6 vs 4 MONSTERS" pill (y 111-146) and the "+2: you win" chip (y 148-166) sit over the top of the monster card (y 138-218),
cutting the top of its name. tbFit's own "monster tile under the score line" check should catch this but does not in a rival's fight. Also the chip
says "+2: you win" when it is Morwen who is winning, and Morwen has no portrait in her own fight (just her name). Shot: ov-375x553.png. 375x667: no overlap.

## Tutorial by touch (the game's tutor-test.js on the staged html)
| Size | clean | rotate | leave and come back | skip / offer / drag / storyskip / story x2 | Problems |
|---|---|---|---|---|---|
| 375x553 | 28 steps, 59 s | 28 steps | **28 steps, PASS** (R47: fail 3/3) | all done | 0 |
| 375x667 | 28 steps, 58 s | 28 steps | 28 steps | all done | 0 |
The R47 "Tutorial (continue?) below the fold" fault is fixed.

## Full games (newbie-touch driver on the staged html, touch taps, 3 easy rivals)
| Size | Follow ★ | Result | Turns | Time | Rival max wait |
|---|---|---|---|---|---|
| 375x553 | 80 % | lost (lv 4; P3 10) | 56 | 3.2 min | 7.7 s |
| 375x553 | 80 % | lost (lv 6; P4 10) | 18 | 1.9 min | 7.6 s |
| 375x667 | 80 % | lost (lv 5; P3 10) | 38 | 4.4 min | **27.5 s** |
| 375x667 | 80 % | lost (lv 7; P2 10) | 38 | 3.1 min | 7.8 s |
| 375x667 | 100 % | lost / won with helper / lost | 30-66 | 2.0-3.3 min | 7.4-8.9 s |
| 375x553 | 100 % | lost / **won** / **won** | 35-51 | 2.4-3.3 min | 7.9-8.2 s |
10 full games to the result screen: 0 page or console errors, 0 stuck states, my longest wait 1.9 s. A player who follows the ★ every time
won 3 of 6; at 80 % it won 0 of 4. One rival turn took 27.5 s (375x667, seed 8 game 1).

## Scores
| # | Row | Score | Why |
|---|-----|------:|-----|
| 1 | Rules fidelity | **5** | Capped: the Halfling's race power is wrong (no discard-to-reroll after a failed escape; a -1 to run away instead), and the in-game rules page promises the reroll. Everything else checked matches the original. Trading still left out (documented). |
| 2 | Tutorial teaches | 7 | 28 one-line steps, 0 problems in every run at both sizes, leave-and-return now works at 553. |
| 3 | First 10 seconds | 7 | Goal card, then one ★ and one line. Start card fits at 553. |
| 4 | Turn clarity | **6** | Capped by clutter: ★ plus a pulsing button plus the "+N" cue at once in over half the turns. The ★ badge covers the start of the card name ("alfling"). In a rival's fight the chip says "+2: you win". |
| 5 | Phone play | **6** | Compact fight is readable now (14 px names, 44 px+ buttons). But the score pill still covers the monster card in rival fights at 375x553, the "+3 ›" cue sits on top of a hand card, and the ★ badge clips names. |
| 6 | AI and pacing | 7 | 1.9-4.4 min games, rivals usually under 9 s (one 27.5 s turn). Full ★ follower won 3/6, so a new player can win. |
| 7 | Feel | **6** | Capped: the door breathes and the boot kicks forever, buttons pulse forever. Otherwise good: door swing, painted cards, flying cards, confetti result. |
| 8 | Bugs | 8 | 3/3 `--full` clean, 18 tutorial runs and 10 full games with 0 errors, 0 stuck, 0 dead taps. |
| | **Total** | **6.5** | 52/8. No stopper. FAIL: rows 1, 4, 5, 7 under 7. |

## Repro steps for rows under 7
- **Row 1**: start a game, become a Halfling (play the Halfling card), meet a monster you can't beat, tap Run. The roll shows "-1" and a failed roll
  offers no "discard a card to roll again". Open Rules: it says Halflings can do exactly that. Code: `engine.js:246` (`-1`), `cards.js:18`, `rules-html.js:35`.
- **Row 4 / 7**: 375x667, quick game, seed 5. On the setup turn: ★ on Halfling, Ready pulses, gold glow + "+3 ›" on Loot the Leftovers. On any main
  turn the door and boot loop forever (`bf.css:23`, `bf.css:27`), the suggested button loops (`tbl.css:36`, `head.html:73`).
- **Row 5**: 375x553, quick game, seed 5, 3 rivals, close the goal card, tap Ready until Morwen fights. The score pill and "+2: you win" chip cover
  the top 28 px of the Turbo Slugs card (pill y 111-166, card top y 138).

## Fix list (in order)
1. **Rules**: give the Halfling the original power: after a failed run-away roll, offer "discard a card to roll again" (once per run); remove the -1 from
   `runMod` and the card text. Add a logic-test row for it. Make the rules page, the card and the engine say the same thing.
2. **Clutter**: one helper at a time. Keep the ★ (static, no ring animation) OR the button highlight, never both; stop the infinite loops: let the door/boot
   and the suggested button pulse two or three times when the turn starts, then hold still. Hide the "+N ›" cue while a ★ or a pick is on screen.
3. **Phone**: run the "card under the score line" fit for rival fights too (or drop the row below the pill), so no monster card sits under the pill at 375x553.
4. Small: move the ★ badge off the card's name band; the rival-fight chip should name the rival ("+2: Morwen wins"); show the rival's portrait in their fight;
   at 553 consider keeping the margin line ("-7: need help or run") in the compact readout.
5. Later: trading items between players (original rule, documented as left out).

Screenshots (reviewer scratchpad, not committed): fight-375x553-m1..m4.png, fight-375x667-m1..m4.png, ov-375x553.png, ov-crop.png,
turn-setup-375x667.png, turn-main-375x553.png. Helper census: census-375x553-0/1.json, census-375x667-0/1.json.
