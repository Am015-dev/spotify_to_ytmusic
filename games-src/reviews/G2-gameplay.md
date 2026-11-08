# G2 gameplay review (8 Nov 2026)

Scored strictly by `GAMEPLAY-RUBRIC.md`. Each game was built from its own branch with `build-all.py <slug>` and served
next to its `games/<slug>/media` folder. I played it with Playwright touch taps at 390x844 (full run) and 375x667 (layout check).
For each game I did the tutorial by touch to the end, then one full game on the default level to the result screen.
Rules were checked against the published rulebook online (notes are kept locally only).
Shots are in `G2-shots/` (JPEG, shrunk).

| Game | Branch | Total | Result |
|------|--------|-------|--------|
| vinegrave | shelf/W490-vinegrave-bench | 5.9 | FAIL |
| twin-thrones | shelf/W483-twin | 7.1 | FAIL (Phone play 6) |
| nebula-aces | shelf/W486-nebula-bench | 6.1 | FAIL |

No game crashed or got stuck. None logged a page or console error in any run.

---

## 1. vinegrave: 5.9 FAIL

| # | Row | Score |
|---|-----|-------|
| 1 | Rules fidelity | 6 |
| 2 | Tutorial teaches | 6 |
| 3 | First 10 seconds | 7 |
| 4 | Turn clarity | 6 |
| 5 | Phone play | 5 |
| 6 | AI and pacing | 5 |
| 7 | Feel | 7 |
| 8 | Bugs | 5 |
| | **Total** | **5.9** |

Findings
- **R1:** In the tutorial I played Trail Notes (+1 compass), which is a starting card. The game used up my turn and the rival moved
  straight after ("Tamsin plays Patron Letter"). The tutorial also says "Each turn: one action". In the published game, the two
  starting coin and compass cards are **free actions**, not your main action. That makes the first rounds noticeably slower and
  weaker for the player. Shot: `G2-shots/vgt-1.jpg`.
- **R1:** The rules notes (`rules-notes.md`) say played cards go to the discard pile. The tutorial says they are shuffled under
  the deck, which matches the rulebook. Someone needs to confirm which one the engine actually does.
- **R2 and R8 (dead tap):** At tutorial step 21 the bubble says "Tap again: up one row". Tapping the research track again does
  nothing. The real target is a small "Climb" button in the dock, which the bubble never names. A new player gets stuck here.
  Shot: `G2-shots/vgt-h-1.jpg`.
- **R2:** Boons, shrines, the notebook, the temple, Dread and round end are only "Next" text, with nothing to do. Several rules
  are never taught at all: deep ruins (6 compasses), plane or coin travel, which icons can stand in for others, and buying a temple
  tile. The game needs every one of these.
- **R4:** During a tutorial step that asks for one specific tap, around 12 other things glow too (every site, the track, the
  market and your pawns). Market cards on the board show only tiny icons (cost and "+1") and no words.
  Shots: `G2-shots/vgt-f-1.jpg`, `G2-shots/vg-nothing-left.jpg`.
- **R5:** At 375x667 the hand is half off the bottom of the screen, card text is clipped ("+1 compas"), and the site names and the
  Camp, Ruins and Deep ruins labels are 11 px. A thin dark vertical line runs the full screen height (x≈307 at step 21).
  Shots: `G2-shots/vg-375-game.jpg`, `G2-shots/vgt-h-1.jpg`.
- **R6:** The default level is normal, not easy. I played the full game with a sensible new-player plan: dig, discover, buy,
  research up to the temple. I lost 30–58. The rival was at 33 after round 4 and finished on 58, a 25-point final round that the
  player never sees coming. A new player is unlikely to win on the default level.
  Shot: `G2-shots/vg-real-result.jpg`.
- **R7 (plus):** The guardian reveal splash, the lifting card and the painted map feel like a game.
  Shot: `G2-shots/vgt-d-1.jpg`.

## 2. twin-thrones: 7.1 FAIL (Phone play 6)

| # | Row | Score |
|---|-----|-------|
| 1 | Rules fidelity | 8 |
| 2 | Tutorial teaches | 8 |
| 3 | First 10 seconds | 7 |
| 4 | Turn clarity | 7 |
| 5 | Phone play | 6 |
| 6 | AI and pacing | 7 |
| 7 | Feel | 7 |
| 8 | Bugs | 7 |
| | **Total** | **7.1** |

Findings
- **R1:** These match the rulebook: the draft order (1-2 then 2-1, the last wonder automatic), the pyramid, trade at 2 + the
  rival's production, chains, selling for 2 + yellow cards, the war loot spaces, science pairs and progress tokens, the 7-wonder
  limit, who starts the next age (including the tie rule), and the blue-card tiebreak. I found no deviation.
- **R2 (plus):** It is 38 steps, each one line and one tap, covering every core rule in order before a real game. The only
  weakness is length: it is sold as "5 minutes" and feels longer. Shot: `G2-shots/ttt-2.jpg`.
- **R4 and R5:** When I had to pick a progress token, tapping a token on the board only opened an info card ("Close"). The real
  choices are in the dock at the bottom, and the 4th token sits off-screen to the right (x=448 on a 390-wide screen) with no hint
  that the row scrolls. Shot: `G2-shots/tt-token.jpg`.
- **R4:** "Build: too costly" is still a live-looking button that does nothing when tapped. The reason is shown in text, though
  ("Your wood costs 1 coin… You have 0"). Shot: `G2-shots/tt-real-5.jpg`.
- **R6:** On Easy, the level selected after the tutorial, I won 54–50 by building whatever was affordable. That is a close
  result, the rival plays quickly, and the game is a sensible length. Shot: `G2-shots/tt-real-result.jpg`.
- **R5:** The wonder draft at 375x667 is fine. Shot: `G2-shots/tt-375.jpg`.

## 3. nebula-aces: 6.1 FAIL

| # | Row | Score |
|---|-----|-------|
| 1 | Rules fidelity | 7 |
| 2 | Tutorial teaches | 5 |
| 3 | First 10 seconds | 7 |
| 4 | Turn clarity | 6 |
| 5 | Phone play | 6 |
| 6 | AI and pacing | 5 |
| 7 | Feel | 7 |
| 8 | Bugs | 6 |
| | **Total** | **6.1** |

Findings
- **R2:** The guided battle ends with a **"Coming up later"** list: barrel roll, boost, bumping, and flying off the mat. The rubric
  forbids this list, and these are core rules that the real game then uses. Shot: `G2-shots/nah-4.jpg`.
- **R2:** It opens with 3 intro bubbles, then a modal ("Your first battle"), then the guided game. The flow is split, but each
  step is one line and one tap, which is good. Shots: `G2-shots/nat-strip.jpg`, `G2-shots/na-g1.jpg`.
- **R1:** These match the original first edition: one ship against two, the lower squad total takes initiative, movement and then
  firing from the highest skill down, a defence die at range 3, focus, target lock, stress (red moves), rocks skipping your action,
  and locks staying at round end.
- **R4:** The dial opens on a strange default (Turn left 3, which heads off the mat), and the default changed between openings. A
  stale "Round 1: plan" bubble overlaps "Ready? Tap Fly". Defence modifiers such as "Use evade" and "Use focus" appear with no
  explanation. Shots: `G2-shots/na-real-3.jpg`, `G2-shots/na-g1.jpg`.
- **R4:** In the fire step, the enemy at range 1 sits on the edge of the arc, and the only target cue is a small "4 vs 3" chip.
  Shot: `G2-shots/na-stuck.jpg`.
- **R5:** At 375x667 the dial covers my own ship, and its lower options are cut off behind the label and the buttons.
  Shot: `G2-shots/na-375-dial.jpg`.
- **R6:** On the default level I lost after 12 rounds. Two enemies needed 12 rounds to wear down a 5-health ship, so a game drags
  without much happening. I can't show that a new player wins on the default level. Shot: `G2-shots/na-bot-end.jpg`.
- **R8:** The same thin full-height vertical line seen in vinegrave shows on the first tutorial step (x≈228). It probably comes
  from shared shell code. Shot: `G2-shots/nat-strip.jpg` (first panel).
- **R7 (plus):** Loose dice, arc wedges and the 3D ships give the fights weight.
