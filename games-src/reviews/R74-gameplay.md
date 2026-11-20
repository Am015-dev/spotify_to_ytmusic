# R74 strict gameplay review: thornbound

- **Commit reviewed:** `6bb922caa1967d6ae6e1676fbb5fa291cd8cec1c` (branch `shelf/W489-thornbound-rules`).
- **Report checked:** `games-src/thornbound/F14-REPORT.md`.
- **Rubric:** `games-src/reviews/GAMEPLAY-RUBRIC.md`.
- **Date:** 2026-11-20.
- **Verdict:** **PASS, 7.1.** Every row is 7 or more and there is no stopper.

## Gates (each run alone)

| Gate | Run 1 | Run 2 |
|---|---|---|
| `build-all --quick thornbound` | PASS (12/12 scenarios) | PASS (12/12 scenarios) |
| `build-all --full thornbound` | PASS (phone-check 82.6 s, sweep PROBLEMS 0, lab WARN 10/12 as before) | PASS (phone-check 83.8 s, sweep PROBLEMS 0, lab WARN 10/12) |

`games/lab.html` was restored after each `--full` run and is not committed.

## Win rates

Default game setup: Play, then Start, nothing changed. That gives Clans vs Nobility, rival on Easy, 4 rounds.

### 1. My own touch follower

The script is independent of the repo's helpers.

- **Taps only:** the bubble's "Got it", the Goal card, the message card, the button carrying the suggested move, the `.rg` card, the `.rec` spot or location, the `.rrec` region, and the main or primary button.
- **Fallback:** it would tap any other glow only if no suggestion were on screen, and it counts each time.

| Size | Results (me-rival) | Fallbacks |
|---|---|---|
| 375x667 | W 19-17, W 17-10, W 16-10 | 0 |
| 375x553 | W 17-10, W 12-11, W 12-12 (won on the Favour/order tiebreak) | 0 |
| Earlier runs, cut by a 420 s harness cap | W 16-11 at 375x553. At 375x667, 10-6 ahead in round 4 when cut. | 0 |
| The repo's `helpers.js` (1 game per size, 3 bulb taps) | W 17-14, W 18-6 | - |

- **Total:** the strict touch follower won **6/6 full games** (8/8 with the extra runs).
- **Suggestions were always there:** fallbacks stayed at 0, so a suggestion was on screen for every one of my decisions.
- **Pace:** games took 6.5 to 8.7 min at one tap per 1.2 s. The longest still screen was 3.4 s, during "Bids flip" or "Thinking… tap to hurry them".

### 2. Engine-level checks (my own sims, 12 games each)

| Player | Rival | Wins |
|---|---|---|
| Always plays the suggestion | default (Easy) | 10/12 (83%) |
| Plays the suggestion half the time, a random legal move otherwise ("own way" proxy) | default | 3/12 (25%) |
| Random legal moves | default | 0/12 |
| Always plays the suggestion | Hard | 3/12 (25%) |
| Plays the suggestion 75% of the time | Hard | 2/12 (17%) |

**Hard stays a real challenge.** On default, a player who ignores half the advice loses most games; see the row 6 note.

## Double-tap and fall-through

I used three independent probes (`dt2`, `dt3`, `dt4`), each at 375x667 and 375x553. They measure the real time between the two `pointerdown` events.

| Overlay | Double-taps up to about 385 ms apart | Result |
|---|---|---|
| Goal card "Got it" at start, and reopened | ok at every interval | guard eats 1 tap |
| Coach bubble "Got it" | ok | guard eats 1 tap |
| Bulb bubble (text and "How does this work?") | ok | guard eats 1 tap |
| Rival pop-up close | ok | guard eats 1 tap |
| Glossary card close | ok | guard eats 1 tap |

- **Slow second taps:** a second tap 400 ms or more after the first does reach the board. Once that opened the Kingdom pop-up under the bulb bubble. At that interval it reads as a deliberate tap, so I do not count it as a bug.
- **Legit taps are never eaten:**
  - a tap on a different target 200 ms after closing the Goal card opens the rival pop-up;
  - a tap on the same spot 500 ms later goes through;
  - the repo's doubletap-test reports 0 legit taps eaten.
- **Repo double-tap check:** `doubletap-test.js 375x553` passes.

**R71's stopper is fixed:** a second tap on the coach "Got it" no longer reaches the Goal card.

## Clutter: helpers and loops

| Run | maxHelpers (repo counter) | After-bulb 15 s windows | Infinite loops |
|---|---|---|---|
| Game 375x667 (helpers.js) | 1 | 1 (3 bulb taps) | 0 |
| Game 375x553 (helpers.js) | 1 | 1 (3 bulb taps) | 0 |
| Tutorial, 6 runs (375x667 and 375x553, plus rotate and leave runs) | 1 | - | 0 |
| loop-test 375x553 | - | bulb opened | 0 |

**My own counter.** It sampled every 400 ms and counted:

- suggestion classes `.rg`, `.rec`, `.rrec`, `.opt.rec`;
- open bubbles;
- fingers;
- infinite CSS or Web Animations.

**What it found:**

- **Bubbles:** at most 1.
- **Fingers:** 0 in normal play.
- **Infinite running animations:** 0 at any time, including the after-bulb windows.

**Bubble plus suggestion class.** It did see a suggestion class on screen together with an open bubble:

- 37 of 113 after-bulb samples at 375x667;
- 112 of 114 at 375x553.

**Why that is not a second helper.** I checked computed styles and screenshots for bid, bidRes, herald, place, menu, clashOrder, location, wilderness and siteBuy:

- while a bubble is open, head.html turns off box-shadow, filter and animation on those elements;
- what remains is a static gold frame on the one target the bubble talks about.

So it is one lit target, and the repo's "max 1 helper" claim holds.

## Rules vs the original (from rules-notes.md, RULES-CHECKLIST.md and cards.json)

**Engine spot checks.** Every item matched the notes. I read `src/engine.js` for:

- **Bids:** bid order is by Bidding Strength, ties go to the higher Order Track place, and a steal needs strictly higher Strength. The Great Road throws away 1 card, or 2 when nobody took one.
- **Herald and Clash order:** the Herald Reward is +1 and steals 1 from each rival Herald on the claimed Location. The last player on the Order Track sets the Clash order.
- **Order Track:** sorted by Influence, ties reversed from the previous order.
- **Clashes:**
  - Supporters count in the first Clash only (moved aside after the tally).
  - A tie re-clashes with new face-down cards only; if everyone passes, nobody gets a reward.
  - Deadly eliminates, Resilient cards go to the Discard Pile and Invulnerable cards stay.
- **Hand size:** Attrition shuffles the Discard Pile into the Deck and lowers hand size (never below 3).
- **Winter cleanup:** Supporters go to the Lost Pile, Heralds go home, and cards with an Influence token lose 1 token and stay.
- **Game end:** with an empty Site of Power, each 2 Lore becomes 1 Influence. Tiebreaks are the Favour, then the Order Track.
- **Length:** the default is 4 rounds, the published short variant; 5 and 6 are options.

**Cards.** I compared all 14 Advanced Site-of-Power cards in `data.js` with `cards.json`: Strength, Votes, Lore, Lore cost, Traits and Commands.

- 0 mismatches. The Drowned Matriarch's "rally_self" is stored as `rally`; that is only a naming difference.
- The basic 14-card deck matches section 5 of the notes, including the agent's drawback text.
- The two F14 text fixes are present: Rite of the Fang names Commands, and Ivory Rampart says "two or more Supporters".

The gates' rules-test (119/119 per F14) agrees.

**Verdict: faithful.**

## First-timer play (touch, 375x667 and 375x553)

- **Tutorial:** `tutor-test.js 375x667,375x553` passed all 38 steps in 6 runs at both sizes, including rotate and leave runs. Each run took about 56 s, with at most 1 helper on screen.
- **What the tutorial teaches, in order:** goal, map, Tactics, Attrition, bid, face-down cards, take back, Favour, Herald, Day/Night, hiding the 3 cards, Supporters, Clash order, the Clash, claiming, Herald scoring, tie and re-clash, Govern, Councils, Journey, Lore buy, Winter, and the round-2 steal. The lines are short ("Spring: bid / Tap the glowing one.").
- **What the tool flagged:** 18 PROBLEMS, all of one kind. On steps `lore2`, `takeback` and `attrition`, a wrong tap gives no shake and no "Tap …" hint.
- **First 10 seconds:** the Goal card opens by itself ("Most Influence after the last round wins"). After "Got it", a coach bubble says "Make a secret bid. Tap a card, then the glowing spot." The turn line repeats it.
- **3+ full games per size:** played by touch through the real UI (above), with 0 page errors, 0 stuck states and 0 dead screens over 4 s.
- **Is it fun?** The games were close and tense (12-11, 12-12, 19-17), and the Herald and Clash swings matter.

## Scores (GAMEPLAY-RUBRIC, 8 rows)

| # | Row | Score | Why |
|---|---|---|---|
| 1 | Rules fidelity | 8 | Engine and cards match the notes on every spot check; player text is fixed. |
| 2 | Tutorial teaches | 7 | 38 short steps cover every core rule in order, then a real game. Wrong taps on 3 steps get no feedback. |
| 3 | First 10 seconds | 7 | Goal card, then one coach line telling you what to tap. |
| 4 | Turn clarity | 7 | Turn chip and line every turn, "(suggested)" tags, glossary. The bulb needs a second tap when a coach bubble is already open. |
| 5 | Phone play | 7 | Full games at 375x553 and 375x667, board-first, linefit-test passes, 44 px Location targets. |
| 6 | AI and pacing | 7 | The suggestion follower wins 6/6 by touch; Hard is hard (2-3/12). Games last about 7 min. Wins are narrow, and a half-advice player wins only 25% on Easy. |
| 7 | Feel | 7 | Clash badges, flips and news cards give feedback on actions. Not re-measured in depth this round; no regression seen. |
| 8 | Bugs | 7 | 0 page errors, 0 stuck states and 0 double-tap fall-throughs under about 385 ms. Two dead-feeling taps remain (rows 2 and 4). |

**Average: 7.1. PASS.**

## Findings under 8, with repro steps (fix next)

1. **Tutorial wrong taps get no feedback (row 2, row 8).**
   - Repro: Learn, go to step "Keep your card" (`takeback`, step 8), the second "Spend Lore" step (`lore2`), or "Hand size" (`attrition`), then tap outside the spotlight.
   - Seen: nothing happens, with no bubble shake and no "Tap …" hint. Every other step shakes and hints.
   - How found: `node tutor-test.js 375x667,375x553` lists 18 PROBLEMS, all of this kind.
2. **The bulb closes an open coach bubble instead of giving a tip (row 4).**
   - Repro: start a default game, close the Goal card, then play on until the Herald step (or the Location choice) where the coach bubble appears. Tap the bulb.
   - Seen: the coach bubble closes and no tip appears; it takes a second bulb tap.
   - Expected: one tap shows the tip, replacing the coach bubble.
   - The step has a screenshot: `fresh-herald.png` from probe `bulbfresh.js`.
3. **A newcomer who half-follows the advice rarely wins on default (row 6).**
   - Measured: 3/12 at 50% suggestions, against 10/12 at 100%. The strict follower's wins are often by 1 point or on a tiebreak.
   - Fix: consider easing Easy a bit more in rounds 1-2, so a player who sometimes picks their own card still has a fair chance.
4. **Slow double-taps (400 ms or more) on the bulb bubble reach the board (nit).**
   - Seen: at 375x667, the second tap opens the Kingdom pop-up under the bubble.
   - Fix: consider a 450 ms guard for bubbles only.
