# Sands of Qamar: campaign design ("The Empty Throne of Qamar")

## Premise
The old Sultan of Qamar has died without naming an heir (the game's own opening scene in `src/story.js`). You are
an unknown claimant guided by **Old Hadiya**, the late Sultan's caravan-mistress. Across ten chapters you face the
great families one by one, learning each part of the game as it becomes the thing a rival is best at, until only
**Qadira the Uncrowned**, the Sultan's niece, stands between you and the throne. The tribes, tiles, djinns and
expansions keep their in-game names (Advisors, Sages, Traders, Masons, Shadows, Crafters, Cutpurses, Wonder Cities).

## Rivals and bosses
Only three AI levels exist (`easy`, `normal`, `hard` in `src/ai.js` `LVL`) and one playing style, so every
chapter uses `aiStyle: "balanced"`. Personality comes from the level, the setup and, for bosses, a twist.

| Ch | Rival | Personality | Level | Lever |
|---|---|---|---|---|
| 1 | Farid the Water-Boy | careless, moves whoever is closest | easy | gift: you +40 coins |
| 2 | Layla Coin-Counter | thrifty, rarely pays to go first | easy | none |
| 3 **boss** | Yusra of the Copper Scales | greedy for goods sets | easy | starts with 2 goods |
| 4 | Master Tahir | patient, steady | normal | Crafters on |
| 5 | Sabah the Silk-Seller (+ Nimr) | flashy, deep purse | normal | 3 seats, Cutpurses, Sabah +10 coins |
| 6 **boss** | Grand Advisor Marwan | hoards Advisors for the court race | normal | Wonder Cities; AI favours Advisors |
| 7 | Zubaida of the Lamp | djinn collector | hard | promo djinns; gift: you +20 coins |
| 8 | Qays and Kamil | two brothers, one plan | hard ×2 | 3 seats, Crafters + Cutpurses |
| 9 | Nimr of the Night Roads | races to end the game | hard | 3 fewer camels each |
| 10 **boss** | Qadira the Uncrowned | proud, Sage and djinn hoarder | hard | full sultanate; starts with djinn Hikma |

## Difficulty curve
- **Act 1, The Empty Throne (easy, coach on):** one idea per chapter: moving and claiming tiles (win, with a
  40-coin gift so a newcomer wins), bidding and keeping coins (win with 40+ coins), goods sets (win with 30+ goods
  points). Calibration: 10 headless easy-vs-easy games end in 6 to 9 rounds with about 210 points each.
- **Act 2, The Bazaar Wars (normal, coach off):** each chapter adds one expansion: Crafters, then Cutpurses with
  three seats (a 140-point goal, since 3-seat games score about 150 to 170), then Wonder Cities against a boss who
  wins the Advisor race (win by 15+).
- **Act 3, Night of the Djinns (hard):** c7 opens gently (a 20-coin gift). c8 is three seats against two hard
  players. c9 is a short game (about 6 rounds; finish before round 8). The final boss has every expansion and a
  starting djinn. Calibration: normal vs hard wins about 16 to 25% of the time, so 2-star "easier" offers matter here.

## Twists menu (campaign only; the normal rules never change)
All setup twists are applied by the campaign's `startChapter` right after `newGame()` (`src/engine.js` `newGame`)
and before the first `refresh()`/`schedule()`. The boss seat is seat 1, the first AI seat.
- `head-start` (setup): `G.pl[0].coins += param`. A gift for the opening chapter of an act.
- `boss-purse` (setup): `G.pl[1].coins += param`.
- `boss-goods` (setup): shift `param` cards off `G.rdeck`; a `fakir` card does `p.fk++`, any other is pushed to
  `p.res`; then `refillMarket()`.
- `boss-djinn` (setup): remove the key `param` from `G.djDeck` (or from `G.djRow`, then `refillDjinns()`) and push it to
  `G.pl[1].dj`. Scoring already reads `p.dj` (`engine.js` `scoreOf`, `hasDj`).
- `short-road` (setup): `p.camels = Math.max(4, p.camels - param)` for every seat. The usual end trigger
  (`engine.js`: last camel placed, then `G.endTrig`) fires sooner.
- `boss-favour` (ai): in `src/ai.js` `evalOutcome(p,o)`, add 6 to `v` when `p` is the boss seat and
  `o.c === param` (a tribe key such as `vizier`). This is only the computer's preference, not a rule.

## Levers verified in the code
- `src/engine.js` `newGame(o)`: `o.np` (2 to 5), `o.seats` (`'human'|'ai'` per seat), `o.lv` (AI level per seat),
  `o.names`, `o.ex = {artisans, sultan, thieves, promos}` (Crafters, Wonder Cities, Cutpurses, promo djinns).
  `np === 5` forces `sultan`. Per-seat `coins: 50` and `camels: CAMELS[np]` (`src/data.js`: 11 for 2 players, 8 otherwise).
- `src/ui.js` `beginGame()` / `UI.setup`: the same option names are used by the lobby, so `setup` in
  `campaign.json` is passed straight to `newGame` (with `lv[1..]` overwritten by `opponent.aiLevel`).
- `src/ai.js` `LVL = {easy, normal, hard}` (noise and search depth); `planTurn`, `evalOutcome`.
- Hints: `UI.coach` (`src/ui.js`, saved as `soq_coach`); campaign sets it from `def.hints`.
- Shelf id: `sands` (`games/index.html` shelf entry and `SAVEKEYS`), so `"game": "sands"`.

## metrics(G) for stars
`won` (`G.over.win` includes 0), `score` (`scoreOf(P(0)).total`), `margin` (score minus the best rival's),
`rounds` (`G.round`), `tiles` (tiles where `owner(t)===0`), `djinns` (`P(0).dj.length`), `coins`
(`P(0).coins`), `goods`, `palaces`, `cities` (count of Wonder City tiles owned), and `advisors` (`P(0).vz`).
Every goal other than a plain win uses `{"k":"goal"}` as its first star: `goal` is `won` and the goal's
condition (`custom`: `goal.test` on metrics; `score`: score ≥ value; `margin`: margin ≥ value; `before-round`: rounds < value).


## Calibration (6 Oct 2026, after the board-first rework; `node camp-sim.js 60 normal` and `node camp-sim.js 100 easy c1`)
The computer plays the player's seat (so "easy" stands in for a newcomer and "normal" for a regular player). "Win" = the game itself.
The `easy` computer is now clearly weaker (evaluation noise 4, was 0.9: normal beats it about 72% of the time instead of about 50%);
`normal` and `hard` are close in strength (hard wins about 55% against normal), so act 3 gets its difficulty from three-seat tables,
expansions and the final boss's rule rather than from the level alone.

| Ch | rival | gift / boss rule | win rate (normal player) |
|---|---|---|---|
| 1 | Farid (easy) | you +25 coins | 90% (newcomer level: 66%) |
| 2 | Layla (easy) | none | 73% |
| 3 boss | Yusra (easy) | she starts with 2 goods | 58% |
| 4 | Tahir (normal) | Crafters | 48% |
| 5 | Sabah + Nimr (normal) | you +10 coins | 43% |
| 6 boss | Marwan (normal) | prefers Advisors | 50% |
| 7 | Zubaida (hard) | you +10 coins | 66% |
| 8 | Qays + Kamil (hard) | you +15 coins | 40% |
| 9 | Nimr (hard) | 3 fewer camels each | 45% |
| 10 boss | Qadira (hard) | Hikma + 50 coins | 32% |

`applyTwist(def)` in `src/engine.js` applies every twist (and an optional `coins` field on `boss-djinn`); the page's `campStart` and `camp-sim.js` both call it.
