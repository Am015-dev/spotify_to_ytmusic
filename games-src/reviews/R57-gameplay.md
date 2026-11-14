# R57 strict gameplay review: thornbound

- Build reviewed: `origin/shelf/W489-thornbound-rules` at **2a6be6b42f069613d797c296bb1f5f5b9b5351d3** ("command hints match the engine, loops finite, one helper at a time (R51)").
- Date: 14 Nov 2026. Played by touch only (Playwright, isMobile + hasTouch) at 375x667 and 375x553, with my own driver and sampler, not the game's own test scripts.
- Verdict: **FAIL, average 6.4.** The engine is right, and the R51 command-hint fix is mostly done. But the hint on the Heir still teaches Rally wrongly, the tutorial spotlight still loops forever, and normal play still shows 2 to 3 helpers at once.

## Gates

| Gate | Result |
|---|---|
| `build-all.py --quick thornbound` | PASS, 12/12 scenarios |
| `build-all.py --full` run 1 | PASS (phone-check ok, sweep PROBLEMS 0; lab WARN 10/12, not a gate) |
| `build-all.py --full` run 2 | PASS (same) |
| Tutorial by touch, 375x667 | finished, 38 steps, 45 s, 0 page errors |
| Tutorial by touch, 375x553 | finished, 38 steps, 45 s, 0 page errors |
| 4 full quick games (2 per size, default settings, following the suggested glow) | all reached the result screen; 0 page errors, 0 stuck states; 395 to 470 s each |
| Fast double tap on "Done with Spring" | one action only (logN +1, nothing skipped) |

## Rules and player-facing text (checked against the original, from rules-notes.md)

The engine matches the notes on every point I checked: Rally (self) returns only that card, and Rally (any two) asks for up to 2. Deploy puts the card from hand next to a region with X tokens. Flank moves the card to an unresolved region. Deadly eliminates all opposing Active cards, and the Agent's drawback works. Ties re-clash. Bids: highest first, a steal needs a strictly higher bid. Supporters count only in a region's first Clash. Winter sends map Supporters to the Lost Pile.

F11 fixed the R51 texts for Flank, Deadly, Deploy and the glossary. But three texts still teach a rule wrongly:

1. **Heir hint, wrong (stopper for Rules).** Every faction's Heir prints `Rally (self)` (data.js b14 and `nob_a3`). The engine returns only the Heir. But `cardLine` uses `CMD_L.rally` for every Rally card, so the Heir shows **"Autumn: Rally, returns your Active cards to hand."** I saw this on screen: Quick game, round 1, bid step, tap the Heir. The turn line reads "Sea-Mother Heir: Autumn: Rally, returns your Active cards to hand." The same text is in the card's aria-label. The Heir is in every starting hand and the tutorial calls it "your strongest", so every new player meets this text in round 1. The keyword test (hint-test.js) only checks for /returns/, /hand/ and /Active/, so it passes this wrong text.
2. **War machine hint, ambiguous.** `CMD_L.deploy` reads "puts a hand card face-up next to a region". On the Engine (b09, `Deploy (1)`) the engine deploys **this** card from hand, and its token keeps it Active for one more Winter. The text reads as if the Engine sends some other card, and it never says how long the card stays.
3. **Tutorial step 9 ("Card powers"), misleading:** "Icons are powers: Day ones act before a fight, Night ones after." Night effects (Deadly) happen **before** Strength is counted (the glossary has this right: "Right after Day, before the count"). This is the only line in the tutorial about Day and Night powers.

Smaller items (not counted in the score):
- The coach text `TBSTORY.coach.round` says "Supporters go home". The rule sends them to the Lost Pile. It is in the build, but I did not see it shown in my runs.
- The tutorial never has the player use a command (Ambush, Retreat, Flank, Deadly, Rally or Deploy).

Rules verdict: engine correct; text wrong in 1 place (Heir Rally) and misleading in 2. Under the strict bar this **caps Rules at 5**.

## Clutter (sampled every second; my own sampler)

My sampler finds glows by their computed gold drop-shadow or box-shadow, plus coach bubbles and the finger/ring. It also lists every running animation that has `iterations === Infinity`.

| Run | Samples | Max helpers | Samples with >1 helper | Infinite-loop samples |
|---|---|---|---|---|
| Tutorial 375x667 | 45 | 3 | 26 | 36 (`gxt-pulse` on `.gxt-ring`, `gxtDot`) |
| Tutorial 375x553 | 46 | 3 | 22 | 30 (`gxt-pulse` on `.gxt-ring`, `gxtDot`) |
| Game 1, 375x667 | 408 | 3 | 89 | 0 |
| Game 2, 375x553 | 439 | 3 | 88 | 0 |
| Game 3, 375x667 | 473 | 3 | 95 | 0 |
| Game 4, 375x553 | 397 | 3 | 91 | 0 |
| 15 s after the hint bulb (6 checks) | - | 3 to 4 | 5 of 6 | 0 |

- **Infinite loop (fails the "0 loops" check):** the tutorial spotlight ring, `.gxt-ring{animation:gxt-pulse 1.1s ease-in-out infinite}`, pulses forever on every tutorial step that has a ring. The waiting dots `gxtDot 1s infinite` also loop. The F11 CSS caps only `.gxh-ring`, which is a different class. Quick games: 0 loops.
- **Playable cards still glow.** `.hc.pl svg{filter:drop-shadow(0 0 5px #ffd24a)}` (head.html, hand rules) stays on even when F11 drops the `glow` class. So while a card is selected, every playable card keeps a gold glow **and** the target (bid spot or region) glows: 2 helpers. Screenshot: tap the Heir at the first bid; all 6 cards glow and the crown spot glows (`heir-hand.png`).
- **Hint bulb:** the bubble stays up 15 s later, with its finger on the bid spot. At the same time the spot glows, the suggested card has its dashed glow, and the other cards glow (`g1-hint0.png`: round 2 bid, Follower 4 suggested). That is 3 helpers or more, outside the first-time coach.
- **First-time coach in a game:** "A tie!" bubble + finger on the Sinks + glowing hand cards + highlighted Pass button (`g1-hint1.png`). "Autumn options" bubble + glowing Powers button + glowing hand card (`g2-hint1.png`). The coach exception allows a bubble plus **the one** glow it points at; these show more.
- **End of tutorial:** a new "Place your Herald… Got it" coach bubble opens on top of the "You know the rules" card (`tutA-end.png`).

Clutter verdict: **max 3 helpers at once** (R51 also had 3); **2 kinds of infinite loop** in the tutorial.

## No-regression checks from R48

- Taps >= 44 px: **no.** The tappable gold word in the turn line (`.tbt-term`) is 45-54 x **40-41 px** at both sizes. Everything else is >= 44.
- Fonts >= 14 px: **no.** The "Suggested" label is 13.6 px at both sizes. The Govern/Journey labels are 13.0 px at 375x553 in the tutorial.
- Double actions: none. A fast double tap on Done is one action. A fast double tap on a hand card at the bid commits the bid; the screen says "Tap again or tap a spot", so this is by design, not a double action.
- Glow-follower wins: 3 of 4 (14-10, 16-8, 14-11; one loss 11-15). Close enough to "about half" for a small sample; a newcomer can win.

## Scores (GAMEPLAY-RUBRIC.md)

| # | Row | Score | Why |
|---|---|---|---|
| 1 | Rules fidelity | **5** | Engine correct. Capped: the Heir hint teaches Rally (self) as "returns your Active cards"; the Deploy and tutorial Night lines mislead. |
| 2 | Tutorial teaches | **6** | 38 one-tap steps, about 45 s, finishes at both sizes, covers bid, steal, Herald, hide, Supporters, order, clash, tie re-clash, Govern, Journey, Lore. But no command is ever used, the one Day/Night line is wrong, and the spotlight loops forever. |
| 3 | First 10 seconds | 7 | Title states the goal in one line; big "Learn in 5 minutes" button; the goal card has 3 bullets and Got it. |
| 4 | Turn clarity | **6** | Turn line, "Suggested" plus a reason every step. But the card hint on the starting Heir misdescribes its power, and 2-3 glows at once blur "what do I tap". |
| 5 | Phone play | **6** | Board-first and nothing cut off at 375x553. Regressions: `.tbt-term` 40 px tall, "Suggested" 13.6 px, Govern/Journey 13 px at 375x553. |
| 6 | AI and pacing | 7 | 4-round games of 6.5-8 min; the rival bids, steals and wins regions sensibly; the glow-follower won 3/4. |
| 7 | Feel | 7 | Cards fly to spots, clash reveals, Influence counts up; suggested-card pulses stop after 3 (quick game). |
| 8 | Bugs | 7 | 0 page errors, 0 stuck states in 6 runs. Coach bubble over the end-of-tutorial card. |

**Average 6.4. FAIL** (rows 1, 2, 4 and 5 are under 7; no stopper caps the total).

## Repro steps for rows under 7

- Row 1: Quick game → Got it → tap the Heir (10) in your hand → the turn line reads "…Heir: Autumn: Rally, returns your Active cards to hand." The card text is "Autumn: Rally (self)". Also: Learn to play, step 9 "Card powers".
- Row 2: Learn to play at either size → any step with a ring → `document.getAnimations()` shows `gxt-pulse` with `iterations: Infinity` for the whole tutorial. No step plays Ambush, Flank, Retreat, Deadly, Rally or Deploy.
- Row 4: same as row 1; plus round 2 bid → tap the bulb → wait 15 s → bubble + finger + glowing spot + suggested card + glowing hand.
- Row 5: any turn line with a gold word (e.g. "Herald") → its button is 40 px tall. "Suggested" label above the gold button: computed font-size 13.6 px. At 375x553, tutorial Autumn step: "Govern"/"Journey" 13 px.

## Top fixes (smallest first)

1. Give Rally (self) its own hint: `cardLine` should read `cm.self` and print "Autumn: Rally, returns this card to your hand". Make Deploy read "puts this card face-up next to a region; it stays X more Winter(s)". Make the keyword test check every printed card's `cardLine` against its `txt` (self, X).
2. Change tutorial step 9 to "Day powers act before the count, then Night effects (like Deadly), then Strength is counted." Change `coach.round` to "Supporters on the map go to the Lost Pile."
3. Change `.gxt-ring` and `gxtDot` to 3 iterations, then hold (the shared tutorial CSS in the built file), and extend the loop check to every `getAnimations()` with Infinity, not only `.gxh-ring`.
4. One helper at a time: remove the `.hc.pl` drop-shadow while a target, suggestion, hint or coach is up. The hint bubble should point at one thing: either the card or the spot, not both plus a separate card glow. Close any coach bubble before the end-of-tutorial card.
5. `.tbt-term` min-height 44 px; "Suggested" label and the small Govern/Journey labels at least 14 px.

Screenshots (scratch, not committed): /tmp/claude-0/r57/heir-tap1.png, heir-hand.png, g1-hint0.png, g1-hint1.png, g2-hint1.png, tutA-end.png, tshots/ts-s01..36.png.
