# Kaiten Kitchen campaign: The Golden Plate

## Premise
Mina (seat 0, the player's chef portrait) has just started eating at **the Turning Plate**, Auntie Suzu's conveyor-belt
restaurant. Once a year the best diner at the belt eats from the **Golden Plate**. Mina works through the lunch crowd,
the dinner regulars and finally the midnight shift to take the plate from its three-time keeper, Taro. Every rival is
one of the four chefs already in the game (`game/src/ui5.js` `DINERS`, chef numbers 1 Taro, 2 Odile, 3 Kofi, 4 Pip);
Auntie Suzu is the one new character (guide). Portraits: `camp-<id>.webp` (suzu, mina, pip, kofi, odile, taro).

## Rivals
| Rival | Personality | Where | AI level | Style |
|---|---|---|---|---|
| Pip | Cheerful kid, wants one of everything | c1-c2, c9 | easy | standard |
| Kofi (Act 1 boss) | Bus driver, loves the roll race, cheers either way | c3-c4, c6, c9 | easy, later normal | `roll-fever` (boss) |
| Odile (Act 2 boss) | Retired baker, fair and steady, never skips dessert | c5-c7, c9 | normal | `sweet-tooth` (boss) |
| Taro (Act 3 boss) | Night-shift noodle cook, counts every plate | c8-c10 | hard | standard |

The AI has **levels only** (`ai.js:choose`, `'easy' | 'normal' | 'hard'`); there are no built-in styles. `aiStyle`
"standard" means the default knobs. The two boss styles are the `ai` twists below, applied by tweaking a single knob in
`KK.AI.params` (`ai.js`, `P`) for the chapter. Use ×1.4 for `roll-fever` and ×1.6 for `sweet-tooth` when the style
appears without an explicit twist. Restore the knobs on exit.

## Difficulty curve
- **Act 1, The Lunch Belt (c1-c4)**: easy, hints on, 2-3 diners. One idea per chapter: Steam Bun ladder (c1), Fish
  Slice sets (c2), roll race (c3), Fire Paste on nigiri (c4 boss). The deck is fixed (108 cards, `data.js`) and has no
  dish/menu option, so lessons come from the goal, the stars and Suzu's lines, not from removing dishes. c1 vs easy Pip
  1v1. In a sim, a normal-strength player beats easy 95% of the time with a median of 58 points.
- **Act 2, The Dinner Rush (c5-c7)**: normal, no hints. Custard (c5), a 3-diner table where fewest custard loses 6
  (c6, goal "win with 40+"), and the Odile boss with a 1-cup head start. Normal vs normal: 35% win, median 51 (2p) and
  42 (3p).
- **Act 3, The Midnight Belt (c8-c10)**: hard. c8 is a clean 1v1 against hard Taro with no twist. c9 is a five-diner
  table with Taro hard and the rest normal or easy. c10 is the boss with a +3 final-score bonus. Hard is strong (a
  normal bot won 0 of 20 against it), so every Act 3 `easier` block drops Taro to normal and removes the twist.

Star thresholds come from a 60-game sim per pairing (`KK.newGame` + `KK.AI.stepAll`). 2-diner totals cluster around
45-58, and 3-diner totals around 38-53.

## Twists menu (campaign only; normal rules unchanged)
| id | where | Hook |
|---|---|---|
| `custard-head-start` | setup | `ui3.js:newGame`, right after `KK.newGame(...)`: splice `param` pudding ids (`KK.cardKey(id)==='pudding'`) from `G.deck` into `G.players[boss].pud`. `engine.js:checkInvariants` already accepts cards in `pud`. |
| `boss-head-start` | scoring | `engine.js:finish`: if `G.camp && G.camp.bonus`, add it to `totals[boss]` before the winner is chosen. The field is absent outside the campaign. |
| `roll-banner` | scoring | `engine.js:roundScores`: add `G.camp.icons[i]` to each seat's icon count before `makiPoints`. The extra icons alone never score (only when the seat also has icons > 0). |
| `roll-fever` | ai | Set `KK.AI.params.makiFut *= param` at `startChapter` and restore it on exit. |
| `sweet-tooth` | ai | Set `KK.AI.params.pudFut *= param` the same way. |
| `long-think` | ai | `ui3.js` turn driver: pass `{units: param}` to `KK.AI.choose` for hard seats (`hardPick` reads `opts.units`, default `P.hardWorlds` 250). |

Store the twist on `G.camp = {boss, bonus, icons}` so it survives `kk_save` resume. Make the result screen say
"Taro +3 (champion's bonus)".

## Levers verified in code
- Setup options (`ui1.js` `DEF`, `ui5.js:optObj/setNp/toggleChef`, `ui3.js:newGame/chefsFor/lvAt`): `np` (2-5),
  `seats` (chef numbers 1-4), `level`, `lv` (a 4-entry per-chef level array indexed by chef number - 1). `seed` goes
  through `UI.seed`. The engine takes `KK.newGame({players, seed, names, ai})` (`engine.js:newGame`).
- AI levels: `ai.js:choose` → `easyPick` / `normalPick` / `hardPick(G, seat, opts)`. Knobs: `AI.params`
  (`contest, surv, makiFut, pudFut, chop*, hardWorlds, hardTop`).
- Hints/coach: `UI.coach.level` ('full' | 'off') and `UI.prefs.hint` (`ui1.js`, `ui3.js:newGame`).
- Shelf/save id: `kaiten` (`games/index.html`, `SAVEKEYS.kaiten = kk_save`). Campaign save: `gns-campaign-kaiten`.

## metrics(G) keys the stars use (seat 0)
`won` (G.winner===0), `score` (G.final.totals[0]), `margin` (own total minus best rival). The rest sum
`G.rs[r][0]` over rounds: `prawnPts` (tempura), `fishPts` (sashimi), `bunPts` (dumpling), `rollPts` (maki),
`rollWins` (rounds with maki === 6), `pasteBonus` (wasabi), `bestRound` (max total), `wastedPaste`
(counts.wasabiUnused). `custardPts` is `G.final.puddingPts[0]`. Chapters c2 and c3 have custom goals (fishPts >= 10,
rollWins >= 2) and also need a win.
