# Emberclimb: independent player review, round 4

Build: `origin/shelf/W358-emberclimb-shell` (26f80563), built locally with `python3 build.py` and served with no `media/` folder (the live
`games/emberclimb/` has none either). Played with real taps on a phone (390x763, touch) and real clicks on a PC (1440x860): first launch,
the 7-step tutorial, two full Quick climbs to the result screen (phone: died on floor 4; PC: died on floor 10), Story chapters 1 and 2 to
"Chapter won", and every Menu, Rules, Hint and title item. Console: no page errors; two 404s per load (art probes).

## Scores (1-10, strict: under 7 = I would not show it to a paying player)

| Row | Score | Why |
|---|---|---|
| First minute | 5 | The title is clean and the "Learn in 5 minutes" button is obvious, but the middle half of the title is empty (no cover art) and the first fight is grey boxes with names written in them. |
| Rules clarity | 7 | The guide is short (7 steps, about 13 s) and each step says exactly what to tap. Rules cards have pictures and are short. But cards in hand show no rules text (you have to lift every card to read it), and a two-enemy fight needs a third tap the guide never taught (only a toast says "Tap an enemy"). |
| Fun moment | 5 | The deck-building loop works: you pick rewards, the map branches, an elite can nearly kill you. With no art, no enemy look and no card art, nothing feels like a hit or a find. |
| Feedback / juice | 5 | Card flies to its target, hero panel shakes, "-5" damage pops, win/lose sounds. The pop is small and sits on top of the hero name; enemies have no hit reaction you can see; the result screen is bare. |
| Computer opponent | 6 | Enemies show their intent, buff (Str 6 by turn 3) and debuff; the floor-6 elite took 63 of 80 HP. But the balance swings: Quick floor 1 can be a 53-HP enemy, while Story chapter 2 (a "boss" chapter) was won with 3 stars on the first try by a bot that just plays the first playable card. |
| Phone | 5 | Fits the screen and taps work, but: dock text and End turn touch the left edge (no gutter), potion slots are cut off at both sides, the lifted card is drawn UNDER the draw/discard/turn pills, reward and deck cards have ~7-9 px text, card names hidden under the damage chip in the deck view. |
| PC | 4 | The right dock is a 420 px empty column with one line and End turn; the potion slots run off the right edge; the board sits left of centre with small cards at the bottom; the hand cards show no text. |
| Structure parity (title / Story / tutorial / help / menu) | 6 | All pieces exist and work: title, Story map with 9 chapters and 27 stars, guide, Rules cards, bulb hint, Menu with Relics, Deck, Restart, Leave, Sound, Music, Accessibility, About. Broken: every secondary Story button (see bug 1). No confirm on Restart / Leave run / Title screen. |
| **Average** | **5.4** | Not shippable yet: one blocking Story bug, no pictures anywhere, PC layout unfinished. |

## Bugs (with steps)

1. **BLOCKING: Story dialog buttons stacked on top of each other and dead.** Title > Story > tap chapter 1. The sheet shows "Close" drawn over
   "Play"; the intro dialog shows "Skip" over "Next"; "Chapter won!" shows "Map" AND "Replay" over "Continue" (unreadable, phone and PC).
   The ghost buttons cannot be tapped at all. Cause: `src/head.html:135` `.ghost{position:fixed;z-index:30;pointer-events:none;...}` (the
   old tutorial hand) also hits the shared `.gxc-btn.ghost`. Rename the game's class (e.g. `.ec-ghost`) or scope it.
2. **No pictures anywhere.** No `media/` folder in the build or live: title, hero select, enemies, hero panel, card art, Story portraits
   ("Warden Ashgrove" is a brown circle) and result screens are all flat placeholder boxes with the name written inside.
3. **Hand cards show no rules text.** Any fight: the lower half of every hand card is an empty grey block (phone and PC); the text only
   appears on the lifted card. A new player cannot compare cards.
4. **Lifted card is covered by the pills.** Phone: tap any card once. The "↓5 / ↺0 / Turn 1" pills draw over the lifted card's text. Same on PC.
5. **Dock has no side gutter (phone).** Any screen: "Tap a card to lift it..." text, "End turn" and the potion slots start at x=0; the right
   potion slot is cut off in fights, the left one on the map.
6. **PC dock empty and potion slots off-screen.** 1440x860, any fight: right column 1020-1440 px holds one line and End turn, the third potion
   slot is clipped at the right edge.
7. **HP chip wrong on defeat.** Lose a Quick climb: result shows "FALLEN" but the bar chip still says "♥ 1/80" (phone) / "♥ 10/80" (PC), not 0.
8. **Unlock card shows a raw label.** Win Story chapter 2: "UNLOCKED · PORTRAIT Rogue joins the Quick game" (the slot kind leaks as a tag).
9. **Tutorial reward screen stays behind Story.** After chapter 1 the guide's "Victory! / Reward" screen keeps rendering behind the Story
   dialogs and behind chapter 2's intro.
10. **Story chapter 1 star "Skip nothing" is the same test as "Finish the guide"** (both `won`), so it is a free star.
11. **Chapter 2 end text says "You reached the summit."** for a 3-room climb.
12. **No confirmation on Restart / Leave run / Title screen** in the Menu: one mis-tap ends the run instantly.
13. **Title Settings shows "Leave: Title screen"** while already on the title.
14. **Deck view (Menu > Deck):** the damage/block chip covers card names ("Cinder Stri⚔6"), rule text ~6 px on phone.
15. **Result screen is thin:** only "FALLEN / You reached floor 4 / Deck Relics Gold / New climb"; no "same hero again", no back to title, no
    run summary (fights won, best card), unlike the old shelf games' result screens.

## Top 5 changes (ranked)

1. Fix bug 1 (rename the `.ghost` class in `head.html`) so every Story button is visible and tappable. One line, blocks Story today.
2. Ship real pictures (enemies, heroes, card art, title cover, cast portraits); until then nothing in a fight reads as a monster or a hit.
3. Show the rule text on hand cards (short line, 12 px+) and put the lifted card above the pills.
4. Finish the PC layout: use the dock for intent/pile/relic info or narrow it, centre the board, keep potion slots on-screen; add the 16 px
   side gutter to the phone dock.
5. Balance pass on the first rooms and Story chapter 2 (floor-1 enemy at 53 HP vs a 3-star boss chapter on the first try), plus confirm
   dialogs on Restart / Leave and a fuller result screen.
