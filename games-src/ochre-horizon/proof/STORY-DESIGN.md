# Ochre Horizon: story + strategy learn-by-playing (charters)

Replaces the click-tap guided first game (ui6.js stays only behind `?guide=1`). Menu > Learn to play and the start screen's
Learn to play now open **Charter 1**. Logic: `game/src/charters.js` (real engine, no rule changed). UI: `game/src/ui7.js`.
Tests: `game/charters-test.js` (engine level), `game/story-touch.js` (touch video).

## Premise (our own)
The Assembly of Ochre grants settlement charters. You lead **Lantern Cooperative**, a small settlers' company. Your rival is
**Greyline Holdings**, an old company that already works the planet. Each charter is a few seasons long, has one goal, and
Greyline follows a fixed plan that the screen explains every time it moves. Story beats (2-3 sentences) sit on the same panel
as the first decision, so the player never taps to read.

## How every tap teaches (UI-BAR rule 11)
- The only taps inside a charter are **decisions between real legal moves** with different consequences (or the board space
  itself, when where-to-place is the decision). Passing, income, research and Greyline's turns play out by themselves at a
  watchable pace, each with one line of reason ("Greyline buys income (Orbital Pension): rich later, no points now.").
- After each tap the panel shows **Why:** (one-sentence consequence) and **Learned:** (the rule or idea), then the rival's reply.
- The debrief shows the result, the lesson, and two buttons that are themselves choices: replay with the other plan (same
  start, same rival: only your choice changes the result) or go on to the next charter (its goal is shown on the button).

## The charters
| # | Charter | Seasons | Goal | Greyline's plan | Decision(s) | Lesson |
|---|---------|---------|------|-----------------|-------------|--------|
| 1 | Four Seasons | 4 | More points than Greyline when season 4 ends | buys income cards, then comets | S1: Quiet Money Company (+4 income) vs Comet strike; S2: Moonlit Ledger (+3 income) vs Comet strike | Count the seasons left: income pays back after ~4-5 seasons; in a short race, rating (points that also pay) wins. Debrief hint: in a full 12+ round game it flips, buy income early. |
| 2 | The Garden Ring | 3 | More points than Greyline by the end of season 3 (Greyline starts 27 rating to your 20) | plants greenery anywhere, hoards credits | S1: Terrace Settlement (a city) vs Comet strike; where the city goes (open ground vs tight corner, tapped on the board); plant 8 now vs keep the plants | A city scores 1 per touching greenery, and greenery must touch your tiles: put the city where greenery can follow, then plant beside it. |
| 3 | The Thaw | 3 | More rating than Greyline at the end of season 3 | raises temperature at every chance, then aquifers | S1 at -4°C: burn 8 heat (to -2°C) vs Aquifer; at -2°C: burn heat (land on 0°C, free ocean) vs keep the heat | Don't set up your rival: one step short of a white mark is a gift to whoever moves next. Land on bonus steps yourself. |

## Proof that the decisions matter (engine level, `node game/charters-test.js`)
| Charter | Naive line | Strategic line |
|---------|-----------|----------------|
| 1 Four Seasons | income both seasons: **LOSES 25-26** | comets: **WINS 27-26** |
| 2 The Garden Ring | comet, keep plants: **LOSES 36-37** | city in open ground, plant now: **WINS 39-38** |
| 3 The Thaw | burn heat to -2°C first: **LOSES 31-32 rating** | aquifer, then land on 0°C: **WINS 33-31 rating** |

Invariants (`OH.checkInvariants`) are checked after every step of every line; every decision offers at least 2 legal options.
Same seed and fixed rival plan, so the replay really can change the outcome and nothing else does.

## Per-tap table: "this tap teaches"
| Where | Tap | This tap teaches |
|-------|-----|------------------|
| C1 S1 | Quiet Money Company / Comet strike | An income card is worth its number times the paydays left; rating is points and also pays 1 a season. |
| C1 S2 | Moonlit Ledger / Comet strike | The same income card returns less with fewer seasons left (3 paydays x 3 = 9 for 15). |
| C1 debrief | Replay with the other plan | The result flips with the other choice: proof that seasons-left decides income vs rating. |
| C1 debrief | Charter 2: The Garden Ring | What the next idea is (its goal is on the button): tiles and where they go. |
| C2 S1 | Terrace Settlement / Comet strike | A city scores 1 point per greenery touching it (and a city card is cheaper than the 25-credit project). |
| C2 S1 | Board space: open ground / tight corner | Greenery must touch your own tiles, so the city's spot caps how much it can ever score. |
| C2 S1 | Plant a greenery / Keep the plants | 8 plants make a greenery: +1 oxygen (= +1 rating) and 1 point, 2 next to your city; waiting scores nothing. |
| C2 debrief | Replay with the other plan | Placement and timing changed the result with the same cards. |
| C2 debrief | Charter 3: The Thaw | What the next idea is: bonus steps on the gauges. |
| C3 S1 | Burn 8 heat / Aquifer | 8 heat = 1 free temperature step; whoever lands on 0°C gets the free ocean, so count steps before raising. |
| C3 S1 | Burn heat to 0°C / Keep the heat | A white mark pays the one who lands on it: 2 rating for one move. |
| C3 debrief | Replay with the other plan | Step parity decided the race, not effort. |
| C3 debrief | First full game | The plan for a real game, with reasoning: income early, cities with room for greenery mid-game, land on white marks late. |

Taps with a taught item: **13 of 13 (100%)** across the three charters (plus the start screen's Learn to play button, which is
navigation outside the tutorial). Deleted: every "tap Next / Close / the glowing thing" step of the old guide; charter research,
passing and income need no tap.

## Stills and video
- `story-402x874.webm`: charter 1 played twice by touch: naive (lost 25-26), Replay, strategic (won 27-26).
- `story-1-decision-402x874.png`, `story-2-debrief-naive-402x874.png`, `story-3-debrief-402x874.png`.

## Next
- Margins are 1-2 points by design (tight puzzles); add a mixed-line test per charter (one good, one bad choice) to document partial outcomes.
- Charter map with stars and an easier retry after 2 losses; owner art for Lantern/Greyline portraits on the panel.
