# r3 impatient playtest (screens in .../playtest/r3-9346/NNN.png)
| step | screenshot | what happening | what I'd do | conf | confusion | fun |
|---|---|---|---|---|---|---|
| 1 | 002-open | setup: mode, Teach-me toggle, 3-6 players, difficulty | turned Teach OFF, Start | 4 | none | 3 |
| 2 | 005-wait | opening hand, "Play suggested cards" / Ready | tapped suggested | 3 | what is "Ready" vs suggested | 3 |
| 3 | 008/010 | AI heroes take turns, my screen is waiting | tap "Let X go on" repeatedly | 4 | many dead-click turns | 2 |
| 4 | 012 | Kick door -> Furious Rooster lvl2, "you'd win", Fight | Fight | 4 | where did monster come from (hand!) | 4 |
| 5 | 017/019 | Sell items mode: tapped potion, Sell button at y=786 | wanted to sell for level | 2 | Sell button at bottom edge, tap on it did nothing visible; level price 1000 | 1 |
| 6 | 041/043 | Bat-Cape Poser 12 vs me ~6: Run away 50% or Ask for help | Ask for help | 3 | what does helping cost me? | 3 |
| 7 | 064 | card detail popup with "Curse X" targets | curse leader Grub | 4 | none | 4 |
| 8 | 090 | Morwen asks me to Help; hint says Elf gives me a level | Help | 4 | good hint | 4 |
| 9 | 100 | Victory! +1 level 2 treasures, Lv5; free-level card suggested | play it | 5 | none | 5 |
| 10 | 105 | "give away suggested card" hand-limit 5 | tap | 3 | forced discard forced to others | 2 |
| 11 | 112/114 | Pinch Mites 11 vs 1, win, Lv7; Tonic of Pure Swagger +level | play | 5 | none | 4 |
| 12 | 122-143 | Sell items: selected 4 cards = 1300 gold "buys 1 level" but I could not find/press the confirm button; Cancelled | give up | 1 | confirm button hidden below fold | 1 |
| 13 | 150 | Tansy curses me: Identity Crisis, lose Elf + Longbow | ok | 2 | lost level+race unexplained until text read | 2 |
| 14 | 156/158 | Tax Collector curse: discard an item | pick one | 3 | everyone else also loses stuff, shown later | 3 |
| 15 | 224 | Grub about to WIN with Rattlebones; I boosted monster with potions (+3,+2) 7 vs 7 (queued as pending) | tried to stop him | 2 | ok to use potions on monsters, but total shown confusing (9 vs 2 became 7 vs 7) | 4 |
| 16 | 234/252/255 | Grub asks help, would win game -> refuse. Morwen cursed me twice: -2 levels (Lv9->7), lost Buzzsaw | refuse | 5 | I'm punished for being leader, fine | 3 |
| 17 | 258 | my turn, Lv7, Grub Lv9, Morwen Lv8. stopped (action budget) | - | - | - | - |

## 1. Goal and turn
First to level 10 wins. Turn: arrange gear/cards, Kick open a door: if monster, fight it (my strength vs its) and win levels + treasure cards; if not, loot a free card; can ask others for help, play curses on rivals, sell items (1000 gold = 1 level), hand limit 5, end turn. Computer players take turns between, and I get asked to help/boost/curse during their fights.

## 2. Fights
- Furious Rooster (lvl2) hand-fight: won, I was far stronger (hint said "you'd win").
- Bat-Cape Poser (12): did not fight; asked for help (I was ~6). Outcome: went on.
- Barfabunny (6): won, strength 9-10 vs 6.
- Pinch Mites (1): won 11 vs 1, twice.
- Tax Collector: curse not fight; lost Pointy Kneecaps.
- Helped Morwen (Elf) vs Kissy Leech and Skygrif: won them, got level for helping.
- Never lost a fight myself; I lost levels (9->7) to curses, not combat. Game not finished (Grub Lv9, me 7, ~130 actions).

## 3. Top 10 confusion
1. Sell items confirm button hidden below screen (127.png, 138.png, 141.png) - I could not sell 1300 gold for a level.
2. "Ready" vs "Play suggested cards" on first screen (005-wait.png).
3. Monster appears from my hand in "Fight X from your hand" (011-121_572.png).
4. Level/strength jumps in "While you waited" box after AI turns (093.png, 109-wait.png) - sold stuff, lost levels.
5. Identity Crisis curse: lose race and gear silently (150-wait.png).
6. Rattlebones fight numbers 9 vs 2 changing to 7 vs 7 (224-wait.png vs 234.png).
7. Help/Refuse button positions shift (255.png vs 252-wait.png), my tap at 652 missed.
8. Tax Collector: discard prompt scrolled half off-screen (156.png).
9. Many "Let X go on"/"Let it be" taps with nothing to do (035, 183, 198).
10. Card limit: forced give-away of cards (105-wait.png, 179.png).

## 4. What just happened
- 105-wait: level 5->6 and strength 10->11 from Creative Arithmetic, explained afterwards only.
- 109: Grub jumped Lv5->8 by selling items; 1400 gold for +1 level did not match visible numbers.
- 122: Level 7->8 from Tonic of Pure Swagger, explained in log.
- 252: lost 2 levels from Goose of Gloom, I only learned via the curse text.
- 234: Buzzsaw gone, due to Morwen's curse seen only afterwards.

## 5. Too much on screen
Hand cards overlapping with tiny names (all hero screens), equipment row cut off with sideways scroll, banner stack under main button (While you waited + Suggested + Selling).

## 6. Unreachable/hidden
Sell confirm button (127.png), cards in equipment row to the right (Frilly Longbow, Sprint Sneakers) cut off; Ask for help popup button positions.

## 7. Fun
3.5/5. Fights and "suggested" hints are quick and satisfying; the AI curse chaos and the sell flow ruin the flow. Yes, would press Play again, but I'd skip selling.
