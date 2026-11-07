# The Redline Season: Story design (Redline Rally)

Premise: a rookie driver joins a small garage run by Coach Mara for one season: three acts, nine chapters, three bosses. Every chapter is a normal Redline Rally race (the same rules as Quick game); only the track, laps, rivals, rival skill and one optional twist change. Original names only.

## Structure (data: `campaign.json`, wired in `src/camp.js`)
| Act | Chapter | Track / laps / rivals | Skill | Goal | Twist |
|---|---|---|---|---|---|
| 1 Warm-up Laps | 1 Pit Lane Lesson (the guide runs first) | Sunline 1 lap, 1 rival | easy | top 2 | none |
| | 2 Corner Sense | Hairpin 1 lap, 2 rivals | easy | top 2 | none |
| | 3 Sunline Opener (boss: Dax Orrin) | Sunline 2 laps, 3 rivals | easy | win | none |
| 2 Midseason | 4 Midseason Sprint | Sunline 2 laps, 3 rivals | normal | top 3 | none |
| | 5 Upgrade Day | Hairpin 2 laps, 3 rivals | normal | top 3 | draft 3 upgrade cards |
| | 6 Hairpin Showdown (boss: Pia Rask) | Hairpin 2 laps, 4 rivals | normal | win | corner limits 1 lower |
| 3 Championship | 7 Championship Round 1 | Sunline 2 laps, 4 rivals | hard | top 2 | none |
| | 8 Championship Round 2 | Hairpin 2 laps, 4 rivals | hard | top 2 | draft 3 upgrade cards |
| | 9 The Grand Final (boss: Bex Hollis) | Sunline 3 laps, 5 rivals | hard | win | you start with 4 heat |

## Twists (menu in campaign.json, implemented in `newGame` options)
- `upgrades`: Upgrades mode on (the draft of 3 cards).
- `tight`: `G.cl = -1`, every corner limit is 1 lower (min 1); the board signs and the corner preview show the changed number.
- `lowheat`: your engine starts with 4 heat, 2 heat cards already in the discard (heat is conserved).

## Difficulty curve
Act 1 easy rivals, the goal is "finish top 2" (a newcomer can do it). Act 2 normal rivals and more of them, one twist per act. Act 3 hard rivals, longer races, a harsher boss rule. After 2 losses on a chapter the kit offers "Make it a bit easier" (`easier` per chapter: gentler rivals, no twist, at most 2 stars).

## Stars
Star 1 is the chapter goal. Others: heat burned (`heat <= N`), no spin-outs (`spins <= 0`), slipstreams used, or win. Metrics come from `campMetrics` (won, place, heat, spins, slips, rounds).

## First stage = the guide
The Story button runs the 7-step guide first on a first visit (shared `gx-tutor.js`), then opens the map. Chapter 1 repeats the lessons in a short real race against one gentle rival.
