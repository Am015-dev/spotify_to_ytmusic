# Kaiten Kitchen: clarity report (Oct 2026)

Preview: `games/kaiten-kitchen-next/index.html` (built from `game/`, then copyright-stamped). The live file
`games/kaiten-kitchen/index.html` was not touched. The rules were not changed.

Method: the clarity brief's loop, modelled on `games-src/thornbound/CLARITY-PLAN.md`. Blind testers were subagents
that saw only the screen, through `scripts/drive-serve.js` on a 390x763 phone viewport, and never read the repo.
There were two personas: a casual player (guided game, taps the big button) and an impatient player (skips every
tutorial, plays a normal 3-diner game). The logs are in `playtest/round{1,2,3}-{casual,skipper}.md`; the screenshot
paths in them point at the session scratchpad and were not kept.

## Results

| Round | Build | Casual (guided, 2 diners) | Impatient (normal, 3 diners) | Fun avg |
|---|---|---|---|---|
| 1 (before) | preview as found | lost 35–61, fun **3** | lost 44–45, fun **4** | 3.5 |
| 2 | clarity pass 1 | lost 41–53, fun **4** | 3rd of 3 (35 v 44, 39), fun **3.5** | 3.75 |
| 3 (final) | pass 1 + round-2 fixes | lost 43–52, fun **3** | won 56–44–41, fun **4** | 3.5 |

The average fun score was 3.5 before and 3.5 after. What changed is understanding:

- In round 1, neither tester knew why their score went down mid-round, and the casual tester only understood why
  they lost after each round's score sheet.
- In rounds 2 and 3, all four testers explained the goal and a round in their own words and said where their
  points came from and where they lost them. The impatient testers learnt the game in two turns with no tutorial.
- No tester in any round found an option they could not reach.

The acceptance bar is fun ≥ 3.5 average, goal, round and why points changed explained, no unreachable option, and
no unexplained score change. Rounds 2 and 3 met the fun, explanation and reachability parts. Round 2 found one
unexplained score change, a real bug (below), which is fixed and covered by a test. In round 3, score drops from
the roll race were all explained by the "Last turn" lines. Testers still called the drops "surprising" or
"swingy", which is the game's real rule (see What's still weak).

## What testers hit before (round 1)

1. **Score drops with no visible cause.** A diner's live score fell (16→13, 10→6) when somebody else took the roll
   lead. Nothing said that live scores can still change.
2. **The hand scrolled sideways and hid plates.** With 9–10 cards the 7th card was off-screen, and taps landed
   between cards as the row re-centred.
3. **Cryptic counter tags**: "5 +1/2", "1 of 3", "no rank", "waiting".
4. **Counter plates were tiny and clipped** (custard counts cut off) while half the board was empty.
5. **No goal or score race on the phone.** The round/turn line was hidden in portrait, and the dock showed "… 9"
   chips.
6. **Tips were modal cards over the hand**, one per turn, each needing "Got it". The roll tip said the same thing
   twice, and Twin Sticks was never explained.
7. **The guided first game was a secondary button**; the big red button skipped it.
8. **The opponent's Fire Paste "waiting", then a sudden +6** had no explanation; custard only made sense on the
   final screen.

## What changed (source in `game/src`, `game/head.html`, `kit/parts`)

Cause and effect:
- **"Last turn" lines in the dock after every reveal**, one per diner: score change, what they served and why the
  score moved (`+3 nigiri`, `+6 roll race (now 1st)`, `−3 roll race (now 2nd): someone else served rolls`,
  `the Fire Paste waits to triple their next nigiri`, `custard is counted at the end of the game`). At a new round
  they read "Last turn of round N". Built in `buildNews` (ui1.js) from the engine's own scoring of the tables
  before and after the reveal.
- **A +N / −N badge pops on each diner's portrait** as the plates land (2.6 s, off with reduced motion).

The goal and the score race are always visible:
- **Phone bar**: `Round 1/3 · Turn 4/10`. **Desktop bar**: adds `most points after round 3 wins`.
- **Diner chips** read `You 13 · Odile 17` (✓ = has chosen). A custard line appears once anyone has a cup: what
  custard scores at the end, and everyone's count.
- **The prompt moved from the bar into the dock**, next to the hand, with Hint beside it.

One decision per screen, nothing hidden:
- **Tips are inline in the dock** and never cover the hand; no "Got it". Only the opening card (goal, a turn,
  scoring) is a dialog. Normal games now get "light" tips (Fire Paste, Twin Sticks, custard). Rare plates are
  explained first. The roll tip shows once rather than once per icon count.
- **Counters pick a layout that fits**: two rows of bigger plates when the seat is tall, never plates past the
  edge. On phones the empty custard spot appears with the first cup.
- **The belt fits the screen**: two rows on tall phones; slightly smaller cards when the hand would not fit; back
  to one row once it fits.
- **Hint on phones** shows its reason in the plate panel ("Hint: …") instead of a toast over the buttons.

Plain words:
- Counter tags: `need 1 more`, `= 5, need 2`, `tied 1st now +3`, `no roll pts`, `×3 next nigiri`,
  `2 plates later`.
- Roll tooltips say the race is only settled at the end of the round, and say when a tie splits the points.
- The Twin Sticks card says "Later: serve 2 plates; sticks pass on". The button says "Use Twin Sticks (serve 2)".
- The log said "Puddings"; it now says "Custard Cups". The score pad column is "Custard" (was "Sweets"), and its
  row colours now match each diner (they followed the seat number before).
- "Pass left" became "passes to the next diner" ("passes to …" is shown under the table).
- A Custard Cup in the hand is marked `end`, not `0`.
- Glossary entries for Custard, Last turn and Live score.

Guided first game and pace:
- **Until a first game is finished, "Start: guided first game (recommended)" is the big button** (`kk_done` in
  localStorage). It says "1 on 1 with Odile" so the 3-diner summary above it doesn't mislead.
- The prompt no longer says "pick a plate" during the 0.9 s while hands are still passing and plates can't be
  picked yet.

## Real bug fixed (proved with a failing test first)

**A round counted twice during its last reveal.** The engine scores a round and deals the next as soon as the
last plate is chosen, while the screen still shows the last reveal. During that window `bankedOf` added the new
round score to the live score of the same tables, so the totals showed **double** (18|21 → 36|42) and the bar read
"Round 2/3 · Turn 1/10", until the score sheet opened. A round-2 tester reported it ("scores showed exactly double
… then the round sheet showed 14 vs 25"); a round-1 tester's "live 14 but round total 12" was probably the same
thing.

- Test: `game/score-flash-test.js` (Playwright). It samples every seat score, the chips and the bar every 25 ms
  through whole games, compares each with an independent expected value (earlier rounds plus `KK.roundScores` of
  the tables on screen), and fails if the bar shows the next round during the reveal.
- Before the fix: 942 problems in 2 games. After: 0 problems in 3 games (2,036 samples).
- Fix: `UI.fz.scoring` marks a reveal whose round is already scored. `bankedOf`, the bar and the round track treat
  it like the score sheet ("Round 1/3 · last turn").

## Tests (final build, kaiten.html)

| Test | Result |
|---|---|
| `rules-test.js` | 90 tests, 90 pass |
| `hidden-test.js 40` | 40 games, 1,137 view checks, 0 leaks, 0 AI decision differences: PASSED |
| `net-strip-test.js 20` | 20 games, 2,870 stripped views, 0 problems: PASSED |
| `score-flash-test.js 3` (new) | 1,979 samples, 0 problems: PASSED (942 problems on the build before the fix) |
| `click.js` (ANIM=0) | 16 games, 0 errors, 0 stalls, 0 hidden-hand violations |
| `click.js --anim` | 16 games, 0 errors, 0 stalls, 0 hidden-hand violations |
| `lay.js` 1366x768, 1920x1080, 768x1024, 1100x700 | PROBLEMS 0 |
| `lay-phone.js` 390x844, 390x763, 390x664, 375x553, 412x780, 844x390, 750x342 | PROBLEMS 0 at all 7 sizes (touch play at each) |
| `px-test.js` | PROBLEMS 0 on the rerun. The first run had 1: "animations did not finish" at 1366x768 webgl high, turn 3, a hand card 2 px from its target after 15 s; it did not recur. |
| `net/p2p-kk.js full`, `p2p-kk-phone.js full` | 1 bad each: the client never joins and a computer takes its seat. **The untouched preview build fails identically** in this sandbox (the product audit also found the sandbox blocks the signalling path), so it is not caused by this change; online play is untested here. |

Tests changed to match intended design changes (no check removed):
- `lay-phone.js`: finds Hint beside the prompt (`#hintb`) as well as in `#acts`.
- `px-test.js`: expects a custard sprite only for a seat that shows a custard spot.
- `lay.js`: "Start button visible without scrolling" checks the primary start button, which is the guided game
  until a first game is finished.

## What's still weak (honest notes)

- **The roll race still feels swingy.** Live scores rise and fall as others take the lead. That's the real rule;
  the game now explains each change, but two testers still said points "happened to them". A possible next step:
  show the roll race as its own pill ("Rolls: you 1st, 4 icons v 3") instead of folding it into the live total.
- **Following the biggest +N loses.** The +N badge is points right now, so starting a pair or set shows 0. Casual
  testers who tapped the biggest number lost to set collectors, and saw why only after each round. A "worth later"
  hint (e.g. `+5 with 1 more`) would teach set building earlier.
- **Cramped rival counters at small sizes.** A rival with four or more plate groups can still be cut off at the
  right edge at 390x763; at 844x390 (landscape) rival counters show only one or two plates. Tapping a counter or a
  chef opens the full table.
- **The dock is text-heavy** on phones (prompt, chips, custard line, tip, three last-turn lines); it scrolls, and
  the oldest line may be under the fold.
- **The guided game is still tips, not a scripted lesson** (no fixed deal, no "take the 2nd prawn now"). It teaches
  one plate per turn as plates appear.
- Testers never tried the bells, Configure, Online, Hot-seat or the Menu drawer. Online play was only covered by
  the p2p test.
- All playtests were on a 390x763 headless viewport, not a real phone.
