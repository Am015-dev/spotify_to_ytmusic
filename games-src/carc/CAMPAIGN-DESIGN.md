# Rampart & Vine: story campaign "The Deeds of Vinemoor"

Data: `campaign.json` (shelf id `rampart`, as in `games/index.html`; the folder is `carc`). 10 chapters in 3 acts.

## Premise
The valley of Vinemoor is empty, and its deeds go to whoever builds best. You play **Garnet** (seat 0, the game's
own first colour). **Old Tamsin**, a surveyor, teaches you one idea per chapter. Local settlers test you first.
Then river and market folk arrive with taverns, goods and masons. Last comes the **Sable Baron**, who says old
deeds make the valley his. All names come from the game itself (followers: wayfarer, warden, brother, farmer;
town, banner, priory, champion, mason, hog; colours Garnet/Cobalt/Amber/Olive/Sable/Lilac).

## Rivals and bosses
The engine has one AI style and three levels (`ai.js` `LVL = {easy, normal, hard}`), so `aiStyle` is `"standard"` everywhere.
The personality in each chapter's text matches how that level actually plays.
| Ch | Rival | Level | Personality |
|---|---|---|---|
| 1 | Hob the Carter | easy | friendly and careless, near-random placements |
| 2 | Wren Ashlar | easy | proud apprentice, starts towns, rarely closes them |
| 3 | Mabry Furrow | easy | slow farmer (easy AI ignores fields, `ai.js:42`) |
| 4 **boss** | Brother Quill | easy | calm and patient, likes priories; twist: 6-point head start |
| 5 | Ferro the Boatman | normal | steady and greedy for points |
| 6 | Dulcie Tapwell | normal | gambler, likes basilica towns and her champion |
| 7 **boss** | Reeve Ostrand | normal | cold bookkeeper, chases goods; twist: moves first |
| 8 | Isolde of Lilac Hall | hard | exact, uses look-ahead on the bag, blocks your towns |
| 9 | Corvin Blackmere | hard | grasping; twist: 8 followers |
| 10 **boss** | The Sable Baron | hard | ruthless; twist: 15-point head start |

## Difficulty curve
I measured scores with `game/gauntlet.js`, 2 players with the river. The easy AI averages about 41 points.
The normal and hard AIs average about 105–115. The hard AI's edge is small but real.
- **Act 1 (easy, hints on, advisor visible):** c1 Win, base tiles only. It teaches roads, and the stars ask for 6 road points.
  c2 asks for 16 town points. c3 asks for 9 field points and adds the river. Boss c4 asks for 60 points and a priory star.
  The score bars are set well under what a beginner makes against the easy AI.
- **Act 2 (normal, hints off):** each chapter adds one expansion: c5 river, c6 Taverns & Basilicas,
  c7 Merchants & Masons. The goals rise from Win to 100 and then 110 points. c5 has no twist.
  The c7 boss twist is gentle (the boss moves first).
- **Act 3 (hard):** c8 has no twist, so a newcomer to the act can win it. c9 gives the boss +1 follower.
  The c10 boss has all three expansions and a 15-point head start.
- **Easier offer** (after 2 losses): drop one AI level, turn the twist off, and allow at most 2 stars.

## Twists (campaign only; normal rules unchanged; each is shown on the boss card)
| id | where | how / hook |
|---|---|---|
| head-start | setup | after `engine.js:newGame`, set `G.pl[boss].score = N`. Log it so the score breakdown adds up |
| boss-extra-follower | setup | after `newGame`, add N to `G.pl[boss].sup.f` and `G.figTotal[boss].f` |
| lean-purse | setup | after `newGame`, subtract N from the player's `sup.f` and `figTotal.f` (implemented in `game/src/camp.js`, not used yet) |
| short-valley | setup | after `newGame`, apply `G.stack.splice(-N)` and `G.total -= N` (implemented, not used yet) |
| boss-opens | setup | call `newGame({seats:['ai','human'], ...})`. Metrics read the seat with `p.human` |

`complete()` also returns all figures, so the `figTotal` sanity check in `checkInvariants` must use the raised totals.

## Levers verified in code
- `engine.js:newGame(o)` accepts `np`, `seats[]` ('human'|'ai'), `names[]`, `lv[]` ('easy'|'normal'|'hard'), and `ex{river,ic,tb}`.
  `np>5` requires `ic`. The start screen's defaults are in `ui.js` (`UI.setup`, line 142).
- `ai.js:LVL` and `lvOf`: easy is mostly random with a nudge toward points and skips fields. Normal is greedy.
  Hard adds field and majority weighting plus `lookAhead`.
- `ai.js:adviceText` / `aiPlan(s,'normal')`: the advisor that drives `hints: true`.
- `engine.js:finish` / `finalScores`: final scoring. `G.over.win` holds the winner seats.
  Per-player points by kind are `p.sc[k] + p.end[k]` for k in road, town, priory, field, goods.
- Suggested `metrics(G)` (h = the human seat, b = the boss seat): `won: G.over.win.includes(h)`, `score`, `margin = score[h] - score[b]`,
  and `road/town/priory/field/goods = sc + end` of seat h. A star counts only on a win.
