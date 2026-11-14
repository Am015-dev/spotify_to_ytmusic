# R69 strict gameplay review: vinegrave

Build reviewed: `shelf/W490-vinegrave-bench` at **7f6ced76e9cb368291f3fcdef9b3c7a77e389ed9** (14 Nov 2026). Reviewer did not edit game code.

## Verdict: FAIL, capped at 4.0 (6.3 without the cap)

**Stopper (row 5 and row 8):** with **5 or more dock chips**, the chips that don't fit run off the LEFT edge of the dock and **cannot be reached**.
The first chips are the boons, so they are the ones you lose. F11's claim that the strip "scrolls sideways at 5+" is false. `#extra` has
`overflow-x:auto` with `justify-content:flex-end` (style.css:624), so whatever overflows lands before the scroll origin. Result: scrollWidth ==
clientWidth and the scroll range is 0. Boons can only be used from their chip (ui2.js:34, ui3.js:194). A player holding 5+ chips (common: in my
real touch games I held 5 chips at 375x553 and 7 at 360x640) **can no longer use the boons they won**.

| Viewport | chips held | chips reachable | scroll range | first chip x (strip starts at x=156) |
|---|---|---|---|---|
| 375x553 | 5 / 6 / 7 | 4 / 4 / 4 | 0 / 0 / 0 | 135 / 79 / 32 |
| 360x640 | 5 / 6 / 7 | 4 / 4 / 4 | 0 / 0 / 0 | 120 / 64 / 17 |
| 375x667 | 5 / 6 / 7 | 4 / 4 / 4 | 0 / 0 / 0 | 135 / 79 / 32 |

Repro (touch, 360x640): Play, Easy. Overcome 2 guardians, discover 3 ruins (3 idols), and hire 2 assistants with the notebook (rows 2 and 4).
The dock shows only `Set Set Gem Broker`. Both Boon chips and one idol sit under the goods row, and a swipe on the strip does nothing.
In a real game: 360x640 game 1 (held 2 guardians, 3 idols, 2 assistants). An elementFromPoint test at each hidden chip's centre hits
`.rv` / `.ic` of the goods row: **162 of 294 samples** had an unreachable chip. dock-fit-test.js only tests 0-4 chips, so it passes.

## Gates (run alone, 2 runs each)
- `VIS_SLUGS="," build-all.py --quick --out /tmp/x vinegrave`: PASS (80 s), PASS (74 s)
- `--full`: PASS (272 s), PASS (282 s). Only a WARN: lab rows != scenarios (lab-test, 3/8 checks b). games/lab.html was reverted, not committed.
- `node dock-fit-test.js`: **112/112 PASS**. Map 151-152 px at 375x553, 171-186 at 360x640, 197-212 at 375x667 with 0-4 chips; all chips 44 px.
  Its touch part held a boon, an idol and an assistant from turn 13. But it injects 6 coins and 8 compasses and never tests 5+ chips.
- My guided-tutorial walk (375x553, highlighted taps only): 35/35 steps, 0 errors, 1 bubble at a time, 93 s, ends "You 28, Tamsin 4".

## Phone check (independent touch script, no state injected; `touchscreen.tap` only)
11 full games to the result screen: hints off 375x553 x4, 360x640 x2, 375x667 x2; hints on one game at each size. **0 page errors**,
**0 dead taps** on real targets (the 3 early "dead" taps were my bot tapping the chip's detail sheet; I fixed the bot and reran).
Sites + track: no site or track hit failure outside choosers/sheets in hints-on runs. At 375x553 hints-off, 22 samples had sites/track covered.
Each case was a selection or detail sheet open (see P2 below).
- Held a boon + an idol + 1-2 assistants at all three sizes (screens `held-*`). With 4 chips everything fits; from 5 chips the stopper above.
- Goods: icon + number stays readable (17 px numbers). Once any chip is present, the words (coin, compasses...) disappear. Then only the five icons
  are left, and the tablet vs jewel vs arrowhead icons are hard to tell apart at 24 px. Acceptable, not great.
- **P2 map squeeze, no chooser:** at 375x553, selecting a ruin shows a 4-5 line prompt ("Explore this ruin for 3 compasses. You pay with Bone
  Whistle. Plus 2 coins for a Plane. A guardian wakes!"). That shrinks the map to **89 px**: the camp row is cut off, the track is a sliver,
  and the sites under the dock can't be tapped. Map minimum outside a chooser: 89 px (375x553), 105 px (360x640), 152 px (375x667).
  Hints on at 375x553: map < 150 px in 75 of 208 samples (5-card hand + goods words: camp row half-clipped by the dock edge; taps still land).
- **P2 squeeze with a one-button chooser:** "Upgrade an assistant to gold" (one button) plus 5 chips pushes the map under 80 px, so
  `vg-squeeze` hides the map and track. The top half of the screen becomes empty jungle background. The leftmost chip is cut ("…sed") and
  the hand cards overlap the chip row. Seen at 375x553, round 5.
- Hand at 360x640: fanned cards cover each other's names (Creeping Dread under Oil Lamp).

## Rules vs the original (repo notes: rules-notes.md, RULES-AUDIT.md, rules-check/vinegrave.md)
Engine matches the audited core: 5 rounds, one main action then pass, free starting/lightning cards, travel hierarchy (Boat and Jeep pay Boot,
Plane pays any, 2 coins = Plane), camp second space pays double, Dread per explorer left at a guardian's site, idols 3 + empty-slot values,
research magnifier/notebook limits, temple stacks, tie-break. All of that is backed by logic-test Z1-Z6.
Rules drawer, tutorial and coach lines agree with the engine: idols "as many as you like, each slot once"; Dread pays a Boot; "play area".
The R63 coach line is fixed. Text issues:
- Prompt says **"Nothing left to do. Tap Pass."** while a free Patron Letter in hand is glowing (375x553 hints on, round 2). That's wrong advice.
- Tutorial g-res2 says "Tap Magnifier", but the button reads **Climb**.
- Tutorial g-boon2 says boons work "once per game"; the rules drawer says "once (then it is spent)". Consistent, fine.
- Log lines: the panel adds card effects (`logEf`). OK.
Verdict: rules faithful (7).

## First-timer play
Guided tutorial: 35 one-line steps in order, 1 tap each, the rival moves. It is a single staged round, though: a "Practice jump" into the temple,
and the rival ends on 4 points. Round end (draw to 5, market shift/exile, Dread for explorers at guardian sites) is told, not shown.
Then 3+ full games with hints off and on. Goal and what to tap are clear ("Your turn. What glows is a strong move."). Easy rival scored 20-38;
my 55%-glow bot won 8 of 11 (lost 18-33 and 18-36 in the first, random-heavy bot version, and 26-32 at 375x553 with hints on). Fair, a bit soft.
Rival captions and point pills land on the map and market on your turn (e.g. "Tamsin buys Brush Machete…", "-1 coin" over the Ruins row;
"+1 point" over your own score chip). Brief, but they cover what you are about to tap.

## Clutter (sampled every second, 11 games, 1,832 samples)
- **Max helpers on screen in normal play: 1.** 0 samples with more than 1. Choosers excluded, where every legal option lights by design.
- **Infinite animations: 0** in every sample, with hints on and off. No GXH coach bubble appeared in normal play with hints on, so the
  "15 s after a hint" window had 0 samples. Tutorial: 1 bubble per step, 0 steps with 2 bubbles.

## Scores (GAMEPLAY-RUBRIC.md)
| # | Row | Score | Why |
|---|---|---|---|
| 1 | Rules fidelity | 7 | Engine and texts match the audited rules; wrong "Nothing left to do" prompt |
| 2 | Tutorial teaches | 7 | Every core rule in order, one line + one tap; staged single round, round-end not shown |
| 3 | First 10 seconds | 8 | "Learn to play" first, 3-line goal card, glow tells you what to tap |
| 4 | Turn clarity | 6 | Hidden boon chips; contradicting pass prompt; Magnifier/Climb mismatch; icon-only goods once chips appear |
| 5 | Phone play | 4 | STOPPER: chips 5+ unreachable; map 89 px on long selection prompt; one-button chooser hides the board |
| 6 | AI and pacing | 7 | Easy rival plausible, newcomer wins, ~3 min bot games, short waits |
| 7 | Feel | 7 | Walks, flying goods, counters; pills/captions pile on the board and your score |
| 8 | Bugs | 4 | 0 errors, 0 dead taps, but won boons become unusable (unreachable control) |

Average 50 / 8 = **6.3**; stopper cap -> **4.0. FAIL.**

## Top fixes, in order
1. Dock chips at 5+: make them really reachable. Use `justify-content:flex-start` (or `safe flex-end`), scroll to the first READY chip, and add an
   edge fade. Or wrap to a second line / merge used chips ("Set x2"). Extend dock-fit-test.js to 5-8 chips with a scroll-and-tap of every chip.
2. Long selection prompt at <= 640 px tall: cap it at 2 lines (move the detail into Details). Map >= 150 px whenever a site is selected.
3. Don't squeeze the board for a one-option chooser; only hide the map when the chooser really needs the height.
4. Prompt: never "Nothing left to do" while a free play is legal. Tutorial: "Tap Climb" (or rename the button Magnifier).
5. Keep rival captions/pills off the map/market and off your own score chip on your turn.

Screens (local, not committed): /tmp/claude-0/r69/shots2 (held-*, dead-*, bad-*, small-*, over-*), /tmp/claude-0/r69/chips-*-7.png, /tmp/claude-0/r69/tut/.
