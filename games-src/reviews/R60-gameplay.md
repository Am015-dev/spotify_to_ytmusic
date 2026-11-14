# R60 strict gameplay review: Shipwreck Isle (games-src/rc)

- Build reviewed: `origin/shelf/W468-shipwreck-lean` at **c1c78f1b8e1a0d583c2101a865f9ee5b02a84d29** (F12 fix: beast vs weapon, calm day start, no glows under the pop-up, rings >= 44 px).
- Reviewer: R60, 14 Nov 2026. Touch only, 375x667 and 375x553, real Chromium (swiftshader WebGL).
- Previous: R55 6.9 FAIL (beast compared to the palisade; turn clarity 6; rings 41 px at 553).

## Verdict: **FAIL, 7.1** (row 4 Turn clarity 6). No stopper.

| # | Row | Score | Note |
|---|-----|------:|------|
| 1 | Rules fidelity | 8 | Beast is back on the WEAPON everywhere it matters (engine, help, checklist, logic test, notes). Turn order and the R55-confirmed rules are unchanged. |
| 2 | Tutorial teaches | 7 | Learn game PASS at both sizes: 51/55 steps shown, 28/28 rules, in phase order, every line <= 12 words, a wrong tap is ignored, Keep playing works. It is long for "5 minutes". |
| 3 | First 10 seconds | 7 | Offer card gives the goal in one line. A player who taps "Play anyway" sees a calm board, but the line under it points to glows that aren't there (see row 4). |
| 4 | Turn clarity | **6** | Every day starts with "Carpenter: tap a glowing place" while **nothing glows** (the calm start hides the glows until a pawn or ✨ is tapped). The instruction is false at the moment it matters most. |
| 5 | Phone play | 7 | Rings 52 px at 667, 45 px at 553 (>= 44 ✔). lay-check PASS at both sizes, 0 plate overlaps, 0 plates on glows, ✨ lines cut 0. Minor: plan-plate parts 28x28 and a 17x17 element; cost icons in the place pop-up are tiny. |
| 6 | AI and pacing | 7 | Players who follow ✨ won 4 of 5 runs (my 3/3 on day 10, lay-check 1/2: one lost at 553, day 12, pile 12/15). Random play loses on days 6 to 12. That fits a co-op survival game. |
| 7 | Feel | 7 | Unchanged from R55: story beats, flying gains, weather scene, dice. |
| 8 | Bugs | 8 | 9 normal games + 2 Learn runs + 2 lay-check games: 0 page errors, 0 stuck states, 0 dead taps. 2 games played to the result screen ("🏆 Rescued!" and "☠ Lost on the island"). |

Average (8+7+7+6+7+7+7+8)/8 = **7.1**. PASS needs every row >= 7: row 4 fails.

## Gates (each run alone)
- `VIS_SLUGS="," build-all.py --quick --out /tmp/x shipwreck-isle`: **PASS**, 8/8 scenarios, 2m32s.
- `--full` run 1: **PASS**, 5m37s (phone-check 161.6 s, sweep ok 4 games; lab WARN 9/12 is the known LAB-rows mismatch).
- `--full` run 2: **PASS**, 6m03s (same warnings). Neither run hit the phone-check time limit.
- `guide-test.js` (Learn by touch): 375x667 PASS, 375x553 PASS (51/55 steps, 28/28 rules).
- `lay-check.js` learn + game: 375x667 PASS (smallest ring 52, min gap 61), 375x553 PASS (smallest ring 45, min gap 51).

## Rules vs the original (from the repo's own notes and the rulebook)
- **Hungry-animals beast (strength 3) vs the WEAPON: confirmed.** `phases.js:231` uses `3-G.weapon` and every castaway takes 1 wound per level short. The weapon does not drop. `rules-html.js`, `RULES-CHECKLIST.md`, `logic-test.js` and `rules-notes.md:101` all say weapon. R55's stopper is fixed.
  - Small regression in the help text: the weather line now reads "strength 3 against your weapon" and has dropped "each castaway takes 1 wound per level it falls short". The tutorial line h3 says it for hunts, but the help no longer says what the weather beast costs. Put that clause back.
- **Turn order:** event (from day 2), morale, production, action (threats, hunt, build, gather, explore, camp, rest), weather (dice + clouds, heating 1 wood per snow, clouds over the roof cost 1 food + 1 wood each, animals, storm), then night (eat or 2 wounds, 1 wound without shelter, spoilage). This matches the original and what R55 confirmed. Open item A16 (Soldier with 1 or 2 players) is unchanged and documented.
- **Rain die faces** (`data-gen.js`: 1,1,1 rain, 2,2 rain, 1 snow; winter die 1,1 snow, 2,2 snow, 2,2 rain): **unverified.** A web search found no face-by-face listing. With no blank face, every rain-die day adds at least 1 cloud. That is plausible, but I could not confirm it, so I did not score it down. Fix: check the faces against a photo of the physical dice and note the source in `rules-notes.md`.

## Clutter (sampled every 1 s, 1,459 samples, 9 games, both sizes, plus 15 s after a ✨ tap each game)
- **Helpers: max 1** (the finger or a coach bubble, never both). The legal-move glow set sits beside the finger after a pawn or ✨ tap; counting the glow set as a helper too makes the max 2 (glow + finger).
- **Infinite loops: 0** (`document.getAnimations()` with infinite iterations on visible targets: none, ever).
- **Glows under the place pop-up: 0 of 261 pop-up samples** ✔ (`#bfglow` hidden while `#ppop` is open).
- **Day start: 0 helpers at all 86 day starts** ✔. The board is calm. But see row 4: the player isn't told to tap a pawn.
- **15 s after ✨:** 6 to 8 glows plus the finger. The finger animates 3 times and then stays still until the pawn moves. That isn't a loop, but the static finger remains on screen for 15 s or more.

## Findings under 7, with repro
**Row 4, Turn clarity 6: the day-start line contradicts the calm board.**
1. New game (Play ▶, "Play anyway"), Marooned, 2 players, at 375x553 or 375x667.
2. Continue to the plan board on day 1, or start any later day.
3. The status line reads **"Carpenter: tap a glowing place"**. No place glows and there is no finger. The Carpenter pawn has a ring, but nothing says "tap a pawn".
4. Tapping the camp directly does open the place pop-up, so it isn't a dead tap. But the instruction points at a cue that isn't there. This repeats every day (86/86 day starts).
Fix (one line in the status text): until `BF.glowRound===G.round`, say "Tap a pawn to see where it can work" (or "Carpenter: tap the Carpenter to start"). Switch to "tap a glowing place" once the glows are on.

Screenshots (scratchpad, not committed): `r60/probegrid.png` (offer card, calm day 1 with the false line, place pop-up at 553 and 667), `r60/playgrid.png` (day start, after a pawn tap, ✨ at 1 s and 15 s), `r60/tutgrid.png` (Learn steps at 553).

## Top fixes
1. Day-start status line: tell the player to tap a pawn (or ✨) until the glows are on. This lifts row 4, and row 3 with it.
2. Put "1 wound per level short" back into the help's weather line for the strength-3 beast.
3. Rain/winter die faces: confirm against the physical dice and cite the source in the notes.
4. Optional: hide the still finger after its 3 taps (or after about 8 s) so the board is quiet again after a hint. Make the 28x28 plan-plate controls 44 px.

Note: the "Failed to load resource" console lines in my bot runs came from my harness blocking outside hosts. They are not game errors.
