# Sunglaze story campaign: The Sun Palace Mosaics

Data file: `campaign.json` next to this file. Shelf id: `sunglaze` (the save key is `sgz_save1` and the shelf entry is `sunglaze` in `games/index.html`). The game itself never calls `GNS.result`, so the id comes from the shelf.

## Premise
You play an apprentice glazier (the Coral seat) at the town atelier below the Sun Palace. The palace's great mosaic is going to be re-glazed, and the work will go to the best glazier alive. **Mother Ochre**, who runs the atelier, teaches you the kilns, the drying racks and the mosaic. Then the guild tests you, and at the end you face **Lady Umbra of the Black Kiln**, who wants the palace glazed in black. Every rival is a computer opponent in the Olive seat (in chapter 8, also Indigo).

## Rivals (AI level / style label)
`ai.js` has three levels and no separate style switch, so `aiStyle` is just a label for how each level already plays:
- **greedy** = easy: takes the best-gain take, and 30% of the time picks a random take from the top 4 (`LVL.easy.slip`).
- **denying** = normal: subtracts 0.55 times the opponent's best reply (`LVL.normal.alpha`).
- **lookahead** = hard: plays out the round for its top 10 takes (`LVL.hard` K/roll).

| Ch | Rival | Personality | Level / style |
|---|---|---|---|
| 1 | Tamsin Reed | cheerful fellow apprentice, grabs big piles | easy / greedy |
| 2 | Bram Kettle | kiln stoker who doesn't care where tiles go | easy / greedy |
| 3 **boss** | Saffra Vell, Keeper of the Courtyard | proud, loves the Sun token | easy / greedy + boss-sun |
| 4 | Cobb the Sorter | careful, watches your racks | normal / denying |
| 5 | Iris Prismwright | dreamy prism hoarder | normal / denying + glazed start, prism tiles |
| 6 **boss** | Master Garnet Hale | stern guild master, 40 summers of glazing | normal / denying + head start 6 |
| 7 | Nell Frost | cool gatekeeper who thinks ahead | hard / lookahead |
| 8 | The Lumen Twins | two playful lamp-lighters (3 players) | hard / lookahead |
| 9 | Vesper Ash | Umbra's servant who only builds columns | hard / lookahead + column bonus, unmarked mosaic |
| 10 **boss** | Lady Umbra of the Black Kiln | cold; sees the deepest | hard / lookahead + deep sight |

## Difficulty curve
- **Act 1, Wet Clay (c1–c3).** Easy AI, coach hints on. Each chapter teaches one idea: c1 how to take and fill racks (just win); c2 that touching tiles score more (win with 20+); c3 breakage costs points (win losing 8 or fewer). The boss has a gentle twist: the Sun token.
- **Act 2, The Guild Kilns (c4–c6).** Normal AI, hints off. c4 teaches that columns are worth 7 (plain win, so it is a fair start to the act); c5 brings in prism tiles (`ex.prism`); in c6 the boss starts with 6 points.
- **Act 3, The Sun Palace (c7–c10).** Hard AI. c7 is a plain hard game; c8 has 3 players with 7 kilns; c9 uses the unmarked mosaic (`ex.gray`) plus a rival twist; the final boss has a stronger look-ahead. If you lose twice, the `easier` block drops the AI one level, removes the twist and caps stars at 2 (c8 also drops to 2 players).

## Twists (campaign only; hook after `newGame()` or in scoring)
| id | where | how / hook |
|---|---|---|
| boss-sun | setup | After `engine.js:newGame`, set `G.first = G.cur = bossSeat`. `newRound` has already dealt the kilns, so only the start player changes. |
| boss-head-start | setup | After `newGame`, `P(boss).score = param`. The floor clamp in `scoreFloors` still works (minimum 0). |
| boss-glazed-start | setup | After `newGame`, for r < param, splice one Cobalt (0) from `G.bag` into `P(boss).wall[r][WALLCOL(0,r)]`. The tile count stays the same, so `checkInvariants` still holds. The Cobalt diagonal is legal on both mosaics. |
| boss-column-bonus | scoring | Wrap `engine.js:finish`: after `endBonus(p)` for the boss, add `cols*param` to `p.score` and to the matching `G.over.scores` entry, then log it. Do this before the winner sort, so it is easiest to do inside a campaign-only branch of `finish`. |
| boss-deep-sight | ai | Before the chapter, set `LVL.hard.roll = param` and `LVL.hard.K = 14` (`ai.js:LVL`, read in `aiTake`). Restore `{alpha:.6,K:10,roll:2}` when the chapter ends. |

## Levers checked in the code
- `engine.js:newGame(o)`: `o.np` 2–4 (clamped), `o.seats` ('human'/'ai'), `o.names`, `o.lv[i]` ('easy'|'normal'|'hard', default normal), `o.ex = {gray, prism}`, `o.mode`. The campaign's `setup` uses `np` and `ex`; `lv` comes from `opponent.aiLevel` for every computer seat.
- `ai.js:aiTake` / `aiWall`: the level is read from `P(seat).lv`, with the constants in `ai.js:LVL`.
- `data.js`: `BONUS {row:2,col:7,colour:10}`, `FLOOR`, `PRISMSET`, `PNAMES`, `WALLCOL`.
- `ui.js:adviceFor` gives the coach suggestions (`UI.coach`). `hints:true` should turn the coach on.
- Metrics for the stars, from `engine.js:finish` / `G.over`: `won` (seat 0 in `G.over.win`), `score` (`P(0).score`), `margin` (own score minus the best rival's score), `rounds` (`G.round`), `cols` / `colours` (`endBonus(P(0))`), `breakage` (`-P(0).st.floor`, points lost to breakage).
