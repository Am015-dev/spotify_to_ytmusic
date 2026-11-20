# R75 strict gameplay review: Doorkick Dungeon (doorkick-dungeon)

- Build reviewed: `origin/shelf/W502-doorkick-gameplay` at **4939bac5714265c43c985090f41d42b5b7b13018** (F16 fixes on top of R66).
- Reviewer: R75, 20 Nov 2026, touch only, at 375x553, 360x640 and 375x667. No game code edited.
- **Verdict: FAIL, average 6.9.** No stopper. Two rows are under 7: Phone play 6 and Bugs 5.

## Gates (each run alone)
| Gate | Run 1 | Run 2 |
|---|---|---|
| `build-all.py --quick doorkick-dungeon` | PASS (92 s, scn 25/25) | PASS (91 s) |
| `build-all.py --full doorkick-dungeon` | PASS (360 s, phone-check ok) | PASS (225 s) |

`games/lab.html` was restored after the full runs and is not committed.

## Strict checks
| Check | Result |
|---|---|
| fightfit-test (I ran it) | **PASS 396/396** at 375x553, 360x640 and 375x667 |
| Staged fights with 1 to 4 monsters, enhancers, help, roll box, caught / loot / Bad Stuff pick and long names: tap targets | 0 targets under 44 px in the fight table or dock (15 staged shapes) |
| Fight readability outside the arena | **FAIL**: hand card names are **10.0 px** at all 3 sizes, and the hand stays on screen during fights |
| tutor-test 375x553 and 375x667 (clean, rotate, leave, skip, offer, drag, story) | PASS: 31 steps, 246 checks, 0 problems |
| 6 full games by real touch taps (3 sizes, then 3 more at 375x667) | 6/6 reached the result screen, 0 page errors, 0 stuck states |
| Helpers on screen, sampled every second (about 930 samples) | max **1** |
| Infinite loops, including the 15 s after the bulb | **1 loop**: the bulb bubble is rebuilt every ~284 ms (54 rebuilds in 15 s), seen in 2 of 4 bulb taps at 375x667 |

## Rules vs the original (from rules-notes.md and the rulebook online)
- **Cleric Resurrection: faithful.** The rulebook lets a Cleric take the top discard instead of any face-up draw, discarding one hand card per card taken. It also says treasure won with help is drawn face-up and treasure won alone face-down. The engine does exactly that:
  - The kick offers resurrection from the door discards (existing behaviour).
  - A helped win now asks once per treasure, from the top of the treasure discards (`resTr`: pay a card or "Draw instead").
  - A solo win makes no offer.
  - The helper still takes the promised number first.
  - The rules page, the card text and the AI (`aiPick resTr`) all match.
  - rules-test covers both the helped case and the solo case.
- **Quick game (default):** matches the rulebook's own faster-play option. You listen at the door (one face-down door card at the start of each turn), and the helper of a level-10 fight wins too. Both showed up in play ("Grub helped, so Grub wins too!"). The tutorial and the story use the full rules, as the rules page says.
- **Halfling:** a re-roll after a failed run-away with no -1 matches the current printing. The −1 was the older printing.
- **Heavenly Favor win:** a Cleric won on it in play. This is correct: the card may give the winning level to Clerics only.
- **Known gaps (documented, not new):**
  - Players cannot trade items with each other. The rulebook allows it at any time, so it is a real omission.
  - When several players tie for lowest level, charity lets you hand the extras out freely instead of as evenly as possible.

## Scores (GAMEPLAY-RUBRIC.md)
| # | Row | Score | Why |
|---|---|--:|---|
| 1 | Rules fidelity | 8 | Engine and texts match. The Resurrection and Quick changes are faithful. Item trading between players is still missing. |
| 2 | Tutorial teaches | 7 | 31 short steps with one tap each, and the test passes at 375x553 and 375x667. Death and looting the body are now taught. The listen step matches Quick. But death, body and back-to-life are told with "Next", not done. |
| 3 | First 10 seconds | 7 | Clear menu (Story / Quick game / Tutorial) and a clear "How to win" card at game start. |
| 4 | Turn clarity | 7 | "Lv x/10 · Your move", dock lines, ★ advice and Run %. Two weaknesses: the Resurrection question is cut to "Resurrect Leggings of Mighty Might? Pay a…", and the bulb's hint during a Bad Stuff card pick ("Your weakest card: Lv 6: you can't beat it.") is hard to understand. |
| 5 | Phone play | **6** | Fights pass fightfit, but other text and controls on screen do not (F1–F4). |
| 6 | AI and pacing | 7 | Rival turns are brisk. Quick games (Easy AI by default) ran 32–62 turns in about 3–5 minutes. Shared wins happen. My touch driver never won, but it plays near-randomly, so this says nothing about whether a new player can win. |
| 7 | Feel | 8 | "A MONSTER!" reveal, flying cards, 3D die, painted cards and a full end screen with stats. |
| 8 | Bugs | **5** | 0 errors and 0 stuck states in 6 games, but there is an endless bubble rebuild loop after the bulb (F0). The owner's check needs 0 loops. |

**Average 55 / 8 = 6.9. FAIL** (rows 5 and 8 are under 7).

## Findings with repro steps
- **F0, row 8: bulb bubble rebuild loop.**
  - Repro: 375x667, Quick game (default settings), play by touch. A run-away fails against a monster whose Bad Stuff makes you choose a card to lose; the dock goes empty and your hand cards glow. Tap the bulb.
  - What happens: the bubble "Your weakest card: a monster you can fight later, but weakest here." is destroyed and rebuilt every ~284 ms until you act. That was 54 and 56 rebuilds in 15 s across two separate games. The finger and ring restart on each rebuild.
  - Likely cause: the bubble covers a glowing hand card, so `hlpUncover()` calls `GXH.relayout()` from the 250 ms interval and the rAF loop (`munch/hlp.js` 193–202). The relayout rebuilds the bubble in the same covering spot, so it never settles. The F15 OK-button fix did not cover this path.
  - Screenshot: `scratchpad/shots2/bulb-375x667-g0.png` (local, from the reviewer session).
- **F1, row 5: hand card names are 10.0 px**, below the 11 px floor, at 375x553, 360x640 and 375x667. Long names are cut without an ellipsis, for example "Shieldmaiden C…", "Pharaoh Wrappingto", "Swashb uckler Shield" and "Gargantu". The hand stays on screen during every fight. fightfit only measures inside `.arena`, so it misses this.
  - Repro: start any Quick game and look at the hand.
- **F2, row 5: the Cleric Resurrection question does not fit the dock.**
  - Repro: Cleric with 7 cards in hand wins a fight with help while the treasure discards are not empty.
  - What happens: the dock shows 8 buttons in 4 rows. The last row ends at 564 / 649 / 676 px on screens 553 / 640 / 667 px tall, so it is **11 px off-screen at all three sizes**.
  - "Backstabber's Shiv +3" and "Blazing Breastplate +2" are clipped.
  - The question is cut to "Pay a…".
  - The card being resurrected is never shown on the table, only named.
- **F3, row 5: the toast "Not worn: no free slot" covers the rival seat strip.** It hides the first rival's name. It no longer covers the readout, but it still overlaps live text. Repro: fightfit shape `n2 enh1 chips1` at 375x553.
- **F4, row 5: small tap targets outside fights.**
  - The top cards of the door and treasure piles are buttons of 35x50 px.
  - The door is 43 px wide in some layouts (43x79 to 43x137).
  - The end-screen table headers "Deaths" and "Cursed" run together at 375x553.
- **F5, row 4: the bulb hint during a Bad Stuff card pick reads as nonsense to a newcomer** ("Your weakest card: Lv 6: you can't beat it."). The dock is also empty at that moment, with no "Choose a card to lose" line. Seen at 360x640 and 375x667.
- **Minor:** every run logs one `Failed to load resource: net::ERR_FAILED` console error (a blocked fetch, not a page error).

## Top fixes, in order
1. Never relayout a bulb bubble from `hlpUncover`: place it once with `hlpForce`, or hide it. Add a test that taps the bulb in a hand-pick state at 375x667 and fails if the bubble is rebuilt more than once in 15 s.
2. Hand card names at 11 px or more (or two lines with an ellipsis) at all three sizes. Extend fightfit to measure `.mine .hand` during fights.
3. Resurrection prompt: fit up to 8 options, either scrolling inside the dock or as a card pick from the hand. Show the full question, and show the face-up treasure on the table.
4. Move the item toast clear of the rival strip. Make pile top cards and the door at least 44 px.
5. Put a dock line for Bad Stuff card picks, and use a plain hint there ("Pick the card you mind losing least").
