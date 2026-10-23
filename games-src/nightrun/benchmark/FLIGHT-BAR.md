# The bar for flight stages (owner, 23 Oct 2026: "the flights are boring, look up similar games, collect screenshots and make the stages fun")

Benchmark: the best side-scrolling shoot-'em-ups (no names here, per CLAUDE.md). Their screenshots are someone else's art and stay
out of the repo; this file keeps what they do well, as rules with gates. Our own flight screenshots are in benchmark/flight/
(beta.169 stage 1, phone and PC, 12 s and 26 s; compare, don't retake). Every flight review and design task scores against this
list, with numbers from qa/simhunt.js (stepped, >= 50 runs per bot), never from a worker's word.

## Waves (each wave is a small puzzle)
| # | Rule | Gate |
|---|---|---|
| W1 | Every wave has a best answer (where to sit, what to kill first) that a mindless "hold fire, drift" does worse at | per wave: smart bot loses less hull than the drift bot |
| W2 | Enemy types differ in shape, speed and attack; never 3 identical waves in a row | >= 6 enemy kinds in the stage, 0 triple repeats |
| W3 | Patterns are learnable: the same wave always enters the same way | seeded waves identical run to run |
| W4 | Danger comes from crossfire and placement, not bullet count: a 3- or 5-way spread is one move, two sources at once is tension | >= 30% of waves have 2+ fire sources |

## Pacing (a stage is a song: verses, breaks, chorus)
| # | Rule | Gate |
|---|---|---|
| P1 | Opening wave interesting but easy, then rise; short breathers (2-4 s) between hard waves | a breather after every peak |
| P2 | A mid-stage set piece (mini-boss, terrain squeeze, big ship to dismantle) | >= 1 per stage |
| P3 | A boss warning before the boss, then a boss with 2-3 phases and readable patterns | warning + phases visible |
| P4 | Stage 2-3 minutes; dangerous moment every <= 4 s, no empty screen > 5 s | simhunt median gap <= 4 s |

## Risk and reward (why a player plays closer to danger)
| # | Rule | Gate |
|---|---|---|
| R1 | A score system that pays for risk: point-blank kills, near misses (graze, capped so it can't stack), chaining kills | top bot score >= 2x safe bot score |
| R2 | Pickups/medals that drift away if you don't go for them | medals lost by the safe bot >= 30% |
| R3 | A chain or multiplier that breaks when you get hit or wait too long, and is shown big on screen | multiplier visible; breaks on hit |
| R4 | One resource decision per stage (bomb/EMP now or later) that clearly matters | EMP-at-peak bot beats EMP-early bot |

## Feel and readability
| # | Rule | Gate |
|---|---|---|
| F1 | Enemy bullets read against every backdrop (bright core, dark outline), player shots never hide them | contrast check on 3 backdrops |
| F2 | Kills feel big: hit flash, small explosion, score popup; bosses and big ships break apart | 100% of kills |
| F3 | The player's hitbox is small and shown; deaths are always explainable | 0 unexplained deaths in simhunt |
| F4 | The screen is bright enough on PC to read (beta.169 PC flight is too dark) | backdrop mean luminance in range |
