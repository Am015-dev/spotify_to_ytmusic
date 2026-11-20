# Short Fuse: components

Owner rule (20 Nov 2026): the rules and the component STRUCTURE match the original (counts, kinds of rule, difficulty
curve). The authored content is our own: every job has its own concept, name, story line, wire mix and its own combination
and order of rules; gear, crew, restriction and challenge cards have our own names and texts. This file records the structure
we match and how our set fills it. Sources: `game/tools/jobs_src.py` (jobs), `game/src/data.js` (cards). Tests:
`logic-test.js` (157 rules), `game/rules-test.js` (101 cases).

## Totals

| Component | Count | Notes |
|---|---|---|
| Wires | 70 | 48 blue (1-12 x4), 11 red, 11 yellow |
| Info tokens | 26 | 2 per number 1-12, 2 yellow; plus even/odd, count (x1-x3) and false-token families |
| Validation tokens | 12 | one per number |
| Gear cards | 18 | 12 base (one per number), 1 yellow card, 5 double-number cards |
| Crew cards | 9 | foreman + 4 base crew (Two Prongs), 4 later crew with their own tool |
| Restriction cards | 12 | A-E "only these values", F "not these", G-L behaviour limits |
| Challenge cards | 10 | met = the fuse turns back one step |
| Jobs | 66 | in 7 boxes (below) |
| Bunker map | 1 | two floors of 3x4 squares, used by one job |

## Gear (18)

| Kind | Count | Ours |
|---|---|---|
| Information (tag a pair, mark a wire, roll call) | 5 | Odd-Pair Clip, Twin Clip, Chalk Mark, Roll Call, Only-One Pin |
| Probes (spend the dual cut on more wires or values) | 3 | Fork Tester, Stand Scanner, Either-Or Meter |
| Safety (fuse back, miss protection) | 2 | Fuse Pinch, Blast Blanket |
| Hand changes (swap, pull a wire) | 2 | Swap Bag, Long Grabber |
| Turn order | 1 | Hand-Off |
| Recharge / restock / more cards | 3 | Spare Batteries, Van Restock, False Bottom |
| Cut helpers | 2 | Pair Snip, Number Purge |

Unlock: two wires of the card's number (four for the double-number cards). Double cards join from job 50, the yellow card
from job 7 in jobs with yellow wires, the later crew from job 32.

## Jobs (66)

| Box | Jobs | What it teaches |
|---|---|---|
| Depot training | 1-3 | dual and solo cut, yellow, red, first gear |
| First call-outs | 4-8 | full wire set, "?" candidates, no-number talk |
| Act 1: calling cards | 9-18 | one new rule per job |
| Act 2: night shift | 19-31 | token families, group cuts, order and line rules, timed jobs |
| Act 3: crew trouble | 32-44 | hidden roles, restrictions, snares, robot |
| Act 4: deep water | 45-55 | oxygen, robot fuse, challenges, lies |
| Act 5: the clock tower | 56-66 | flipped wires, passing cards, bunker, combined rules |

| Structure | Original | Ours |
|---|---|---|
| Plain jobs (wire mix only) | 8 | 8 (1-8) |
| Jobs with one special rule | 58 | 48 |
| Jobs that combine two rules or a rule with a token family | rare | 10 (8, 31, 45, 48, 57, 59, 61, 63, 65, 66) |
| Timed jobs with a narrated script | 5 | 5, at our own slots (13, 24, 37, 48, 64) |
| Rule kinds used (engine handlers) | 41 | 41, each at least once |
| Yellow wires in play | most jobs | 47 jobs (always an even count except the group-cut jobs) |
| Final job | the bunker | a timed order-card job with count tokens (66); the bunker is 64 |

Every job's name, story line and text are new; wire mixes, fuse starts, gear exclusions and rule pairings were chosen per job,
and no job repeats an original mission's setup with its number set and text.

## Difficulty bands (computer-only gauntlet, Normal, 6 seeds x 2-5 players)

Measured on the same job-number ranges before and after the rewrite. Target: each band within about 5 points.

| Jobs | Before | After |
|---|---|---|
| 1-8 | 90% | 90% |
| 9-19 | 77% | 77% |
| 20-30 | 63% | 62% |
| 31-42 | 52% | 54% |
| 43-54 | 36% | 36% |
| 55-66 | 28% | 23% |

0 errors, 0 stalls, 0 invariant failures in 1,572 games after the rewrite.
