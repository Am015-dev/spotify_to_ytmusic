# Vale of Banners campaign: The Steward's Valley

Data: `campaign.json` (shelf id `vale-of-banners`; 10 chapters, 3 acts).

## Premise
You are a young steward given a bare patch of the Vale for one year. **Wren**, a clerk and your friend, keeps the
ledger and cheers you on. **Old Odo**, the reeve, teaches the rules. Over three seasons of that first year (Thaw,
High Summer, First Frost) you meet the Vale's great houses. At the end the silver baron **Ivo Grath** tries to
buy your estate.

## Cast
| Id | Name | Role | Chapters | AI style |
|---|---|---|---|---|
| wren | Wren | Friend and guide, young clerk | all | none |
| odo | Old Odo | Reeve, tutor voice | all | none |
| cass | Cass Ferrow | Barge-mistress, boss act 1 | c3 | barges |
| marla | Marla Venn | Shepherd queen, strong rival | c5, c7 | flocks |
| hask | Lord Haskel | Castle-builder, boss act 2 | c6, c8 | keeps |
| ivo | Ivo Grath | Silver baron, final boss | c10 | silver |
| minor rivals (emoji only) | Tobin Reed, Dilly Hart, Brannoc Dyer, Sibyl Quarry | Neighbours | c1, c2, c4, c9 | null |

## Bosses and their fixed strategies
- **Cass Ferrow (c3).** Rushes Barges and quick regions. Style `barges`. Rule: she starts with 2 extra workers.
- **Lord Haskel (c6, c8).** Packs Keeps and Moot Halls into chains. Style `keeps`. c6 rule: he goes first in the turn order. In the c8 rematch he starts with 3 extra workers.
- **Ivo Grath (c10).** Buys from the back lane every round, sells late. Style `silver`. Rule: he starts with 6 extra silver.
- **Marla Venn (c5, c7), non-boss.** Fills Pasture regions and sells wool. Style `flocks`.

## Difficulty curve
| Ch | Act | Seasons | AI | Twist | Goal |
|---|---|---|---|---|---|
| c1 First Furrow | 1 | 2 | easy | none | Win (stars: build 8 tiles, score 25) |
| c2 Market Day | 1 | 3 | easy | none | Sell goods 3 times, win not needed |
| c3 Barge Down the Reach (boss) | 1 | 3 | easy | boss-workers 2 | Win, finish a region |
| c4 A Keep of Your Own | 2 | 4 | normal | none | Build 2 tiles by chain, win not needed |
| c5 The Flock Road | 2 | 4 | normal | no-black | Win with 85 or more |
| c6 The Castle Builder (boss) | 2 | 4 | normal | boss-first | Win by 5 or more |
| c7 The Silver Road | 3 | 5 | hard | none | Win |
| c8 Keep Against Keep | 3 | 5 | hard | boss-workers 3 | Win with 120 or more |
| c9 Closed Lanes | 3 | 5 | hard | no-black | Win by 8 or more |
| c10 The Silver Baron (boss) | 3 | 5 | hard | boss-silver 6 | Win with 125 or more |

Score thresholds follow the brief: about 25-45 for 2 seasons, 45-70 for 3, 70-100 for 4, 100-150 for 5. They are
estimates and should be re-checked with gauntlet runs. Every `easier` block drops one AI level, removes the twist
and caps the chapter at 2 stars. Act 1 has hints on; later acts have them off.

## How each stage uses the real rules
- **c1** Place tiles on a space with the die's number next to your land. Star: 8 tiles built.
- **c2** Sell one kind of goods with a matching die. Star metric `sales`.
- **c3** Finish a region early (higher season bonus). Cass has extra workers, so she bends dice more.
- **c4** Keeps and Moot Halls chain extra builds. Metric `chain`.
- **c5** The back-lane stall is closed (`no-black`), so silver only helps by selling. Marla races Pastures.
- **c6** Haskel moves first and chains Keeps. You must out-score by a margin.
- **c7** A clean full-length game; stars reward selling (`sales`) and score.
- **c8** Haskel's extra workers let him fix dice; you answer with regions and chains.
- **c9** No back lane again against a worker-hoarder; wide estate (`land`) and sales.
- **c10** Ivo starts with 6 silver for early back-lane tiles; finish regions earlier.

## Metrics the integration must supply (`metrics(G)`)
`won`, `score`, `margin`, `regions`, `land`, `sales`, `chain` (as in the brief). The `silver` key is not used.

## Not expressible with the allowed values
The colour bonus (all spaces of one colour) has no metric, so it is taught only by the intro text, not by a star.
