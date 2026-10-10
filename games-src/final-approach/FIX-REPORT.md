# Final Approach: fix round (audit + newcomer review)

Branch `game/final-approach-fixes` (from `alex/brave-carson-rbpmlk`). Inputs: `AUDIT-RULES.md` (rules auditor) and `REVIEW-NEWCOMER.md` (first-time player).
`game/src/ai.js` was not touched (another session owns it); AI-side suggestions are at the end. Nothing in `games/`, `shell/`, `net/netroom.js`, `perf/`, `audio/gameaudio.js` or `phfit.js` was changed.

## 1. Rules fixes (engine, `game/src/engine.js`)

| Audit item | Fix | Test (`rules-test.js`) |
|---|---|---|
| #1 Reroll token "at any time" | `validMoves` now offers `rr` to **either** seat during placement whenever no question is open and at least one seat still has an unplaced die (also off turn, also a seat with no dice of its own left). A seat with no unplaced die is answered automatically (`[false x4]`), so nobody is asked to "Confirm reroll (none)". Not during the briefing. | "reroll token: either crew may spend it at any time…" |
| #2 Ability cards unchecked | `newGame` keeps only known ids, drops duplicates and clamps to the scenario's count (`FA.cleanAbil`). Covers forged online setups too (the host builds the game through `FA.newGame`). | "ability cards in newGame: only known ids, no duplicates, clamped" |
| #3 Trainee token with nowhere to go | Tossing a pending trainee token puts it back at the end of the row it came from and decrements `internUsed`, so it is not counted as trained; the training die stays spent and the turn passes once. Log line + `internBack` counter. | "trainee: a token with nowhere to go goes back to its end of the row" |
| #24 Hand-over / Flip side "at any time" | Both are offered to either seat while no question is open (Flip: own unplaced die; Hand-over: both seats need an unplaced die). Second Look stays "first player, before their first placement". The real-time `timeout` stays with the seat on turn. | "flip side and hand-over: usable at any time by either crew" |
| (newcomer #1) loss names the seat | A missing mandatory die now loses with `result.miss = ['en0', …]` and a message naming whose die it was; `netStrip` whitelists `miss` so online guests see it too. | "end of round: a missing mandatory die … names whose die it was" |

`rules-notes.md` updated: reroll / flip / hand-over timing, ability clamp, trainee return, the strip-data caveat (the "two printed strips" were promo airports, not box strips, plus which strips a person with the box should check), and the brake comparison ruling (item 9: "less than the marker" = "no more than the last brake value", because the marker sits between numbers). `cover.js` now also lets the waiting seat use free actions off turn (780 such moves in the 700-game run) and has a directed trainee-return case.

## 2. Newcomer review fixes (UI)

1. **Mandatory Axis / Engines.** When your dice left equal your empty Axis/Engines spaces, the other legal spaces dim, the empty mandatory spaces pulse red, the prompt says "Keep your last 2 dice for the Axis and Engines", the selected-die panel explains why, and a tap on another space only warns ("tap again to place it anyway"). When it is already impossible the dock says so. The result card for an early loss shows only what went wrong (round, altitude, cause, a one-line "how to avoid it"); the 5-row landing checklist only appears when the landing itself was judged. A missing die is named: "Ravi (Co-pilot) had no die on the Engines at the end of the round."
2. **Every control slot is labelled** (Axis, Engine, Radio, Gear, Flap, Brake, Coffee, Fuel, Train, Ice; value labels such as 1-2 stay underneath). The selected die gets a "what this die will do" line ("Engines: 4 + 3 = 7 against ≤4 stay, ≤8 one space"; "Axis: 4 against 2 makes it 2 right"). Each guided tip highlights its control with a pulsing dashed ring (`TIPHL`).
3. **Altitude track.** Phone portrait: one line "6000 ft · You go first" plus a seven-dot strip (dot colour = who places first, gold ring = now, purple corner = reroll token). Desktop: "6000 ft" over a coloured dot and the first player's name ("You" / "Ravi"). Phone landscape: altitude + coloured dot. Tapping the strip explains it. Pi/Co are gone everywhere. **Phones get the landing checklist** through a "Checklist n/5" button in the dock.
4. **Tips live in the dock** as a banner (`#pc.tipb`, short line + Got it, with More / No more tips), pinned at the top of the dock on phones and height-limited, so they never cover the dice tray, Roll, the briefing phrases or Reroll/Hint. Coffee is a one-row − / value / + stepper. Hint no longer toasts: its reason appears under the die. Toasts moved to the top of the screen. On short phones the "Fits" panel comes first and the idle help text hides.
5. **Traffic-die icons** are drawn by the Pixi layer (a black die sprite per space, the "×n" count stays as DOM text).
6. **"Look at the panel"** removes the ending picture and redraws the final panel (dice on their slots, markers, track).
7. **Partner's moves.** A short animated line in the dock says what just happened ("Ravi puts a 4 on the radio. / Radio: a plane leaves space 5."), the partner's hidden die now visibly flies from their tray to the slot, the slot flashes, and when the engines move the plane the marker waits ~1.1 s while the speed line shows. At the end of each round a recap card (tap to close, 5 s) lists axis, speed, radio, switches, fuel, coffee and the next round's traffic and first player. Built from the public log, so it works the same online.
8. **Hot-seat**: the device is handed over only when the next decision needs a player's hidden dice. The briefing (phrases + Roll for each person) and placing the public trainee token / cross-check die happen on the shared screen with nobody's dice shown, so a flight no longer starts with the story card stacked on a pass card. Pass card button now names the person ("I'm Ines – show my dice").
9. **Panel clutter**: gauge markers are two corner chips (≤4 blue, ≤8 orange) clear of the needles; "▲ you" removed (the gold space and plane token mark it); the Co-pilot tray label is right-aligned (no longer over the coffee tokens); corridor tabs sit at the top of the space and traffic icons next to the number, both clear of plane tokens (stacked plane tokens overlap instead of wrapping); L1/L2/C/R1/R2 explained in the Tight Corridor text (story card, rules, flight drawer); portrait slots moved 7 logical units in from the edges and the glow shrunk so the leftmost glow is no longer cut; the brake readout has its own spot (`layout.r.brk`), so it no longer covers the fuel slot or a coffee slot (fuel slot moved in landscape, coffee row shifted for the icy runway, fuel bar moved into the coffee row in portrait).
10. **Texts**: the scenario picker lists the same extras as the story card and rules (Busy Sky / Tight Corridor from the strip); one short name per crew member in play (Ines, Ravi) and the full name only on story/crew cards; engine tip says "leaving"; all brake texts say "no more than" (rules, tips, Hint, icy-runway text) and `rules-notes.md` documents why; Hint and Reroll each get a guided step (Reroll in round 1, Hint in round 2; the altitude tip moved to the first briefing); the selected die in the tray shows its coffee-changed face.

## 3. Tests (final run, this tree; Chromium + SwiftShader on the shared sandbox)

Run from `game/` (p2p from `games-src/`), Playwright 1.63 with `/opt/pw-browsers/chromium`. The node tests, px-test and the p2p runs used the final engine; click / lay / lay-phone / px were re-run after the last UI polish on the final tree.

| test | result |
|---|---|
| `rules-test.js` | **68 passed, 0 failed** (63 before; +5 for this round) |
| `cover.js 700` | 700 games over all 21 scenarios, 25 471 moves (780 of them off-turn free actions), 22 landings, **0 problems**, every required rule path fired (new: `internBack`) |
| `hidden-test.js 40` | 40 games, 1 841 checks, **0 problems** |
| `net-strip-test.js 24` | 24 games, 2 253 stripped views, **0 problems** |
| `click.js` (jsdom, 18 configurations) ANIM=0 | 18 games, **0 errors, 0 stalls, 0 not finished, 0 hidden-dice violations** (88 s) |
| `click.js --anim` (ANIM=1) | 18 games, **0 errors, 0 stalls, 0 not finished, 0 hidden-dice violations** (150 s) |
| `lay.js` 1366x768, 1920x1080, 768x1024, 1100x700 | **PROBLEMS 0** (painted canvas 98.4 / 98.2 / 98.5 / 98.0 %) |
| `lay-phone.js` 390x844, 390x763, 390x664, 375x553, 412x780, 844x390, 750x342 | **0 PROBLEMS at each size** (PROBLEMS 0 total), 8 placements by touch at each size; hot-seat check now also asserts no pass card during the briefing |
| `px-test.js` | **PASSED** (24 checks: WebGL, 8 dice sprites, flights, landing squash, hidden backs, Low/Medium/High, PerfHUD, ending + final card, context loss → DOM, canvas renderer, `?px=0`, phone portrait + landscape) |
| `net/p2p-fa.js` (port 17793) | full: 2 runs, **0 bad**; leave: **0 bad**; ui: **0 bad**; hostleft: **0 bad** (guest state byte-equal to `netStrip`, hidden dice never on the guest) |
| `net/p2p-fa-phone.js` | full: 2 runs, **0 bad**; touch: first run 1 bad (only 1 placement by touch: that flight ended early), two re-runs **0 bad** (6 touch placements, 8 host-side remote moves, badge and lobby close 44x44) |

Screenshots looked at (title, setup, a guided step, a picked die, mid-flight, the end card and "Look at the panel") at 390x763, 375x553, 844x390 and 1366x768, plus the hot-seat briefing / pass / turn at 390x763 (scratch copies, not committed; the test scripts write theirs to `game/shots/`).

## 4. Weaknesses / not done

- The mandatory-slot warning only looks at the acting seat's own count of dice; it does not foresee a cross-check die or a trainee token being needed elsewhere. It warns, it never forbids (the rules allow the move).
- Hot-seat still needs one pass card per change of seat during placement (each turn needs the player's own dice); the "hold-to-peek tray" idea from the review is not built.
- On the smallest phone (375x553) the dock is ~110 px: the tip banner shows its short line and "Got it", More / No more tips sit one scroll below inside the banner, and the briefing phrases are below the fold while a tip is up.
- The round recap is built from log lines (plain English, not icons); it auto-closes after 5 s and is not shown in ANIM=0 test runs.
- A partner's die flies from one of their "?" dice in the tray (which one is a guess: the tray never knew the value) and shows its now-public value during the flight.
- Everything was judged on Chromium/SwiftShader screenshots only: no real phone, no Safari.
- The base-box strip data is still single-source (see `rules-notes.md` item 8).
- The built HTML still contains the text "claude.ai" inside a code comment of the shared `net/netroom.js` (it was in the previous build too). It is not a model identifier, but if the shipped page must not mention it, that comment needs a change in `netroom.js`, which this round may not touch.
- The guided tip numbering counts all 15 guided steps, so a step whose condition never comes up (for example the Reroll tip when the token was already spent) is skipped and the numbers jump.

## 5. Suggested AI changes (for the session that owns `ai.js`)

- The AI only acts when it is asked (its own turn or an open question). It never spends a reroll token, Flip Side or Hand-over during the partner's turn, which the rules now allow. A cheap hook: when the human finishes a placement and the computer seat still has dice, let the AI evaluate `rr`/`adapt` from `validMoves(G, aiSeat)` before its own turn starts.
- `move()` sees off-turn `rr` in `validMoves` only for the seat on turn, so nothing breaks; `rrMask` is never asked for a seat with no unplaced dice any more (the engine answers it).
- The Hint (normal AI, `noMC`) could prefer moves that keep a die for an empty Axis/Engines when dice are tight; the UI now warns, but the hint should never suggest the losing move.
