# Short Fuse: rules audit against the real game

Scope: `src/engine.js`, `src/data.js`, `rules-notes-impl.md`, `ENGINE-REPORT.md`, rules drawer (`texts.js` RULES_HTML / RULE_DOC). Sources: `/home/user/game-night-private/short-fuse-research/` (RB = rules-mop.txt, FAQ = faq-2025.txt, CN = card-notes.txt, scans `combo/m*.jpg`, `eqA-C.jpg`, `chalA/B.jpg`, `conA/B.jpg`, `charA/B.jpg`, `stickers.jpg`, `bunker.jpg`), the audio transcripts in `scratchpad/bb/research/audio/`, `bb/rules-notes.md`, `bb/missions.json`. "Confirmed" = reproduced by running the engine (small node scripts, no engine edits). `rules-test.js` still passes 89/89.

Totals: 6 wrong (1, 2, 3, 5, 6, 11), 2 missing (4, 15), 12 ambiguous (7-10, 12-14, 16-21). Item numbers are labels, not a ranking; 7 is wrong-or-ambiguous.

## Findings

### Wrong

1. **Jobs 44 and 63: oxygen reset/collection happens only on the Captain's own turn.**
   **Status: Fixed (round hook).**
   Real: 44 "at the start of the Captain's turn" all oxygen goes back to the reserve; 63 "after each round the Captain begins their turn by taking all oxygen from the reserve" (scans m44, m63). Engine: `RH.oxygen.start` fires only when the Captain is the active seat, and a seat with no wires never gets a turn. If the Captain finishes first, the reserve is never refilled and everyone is forced to skip, burning a step each, until the fuse is gone. Confirmed: 3 players, Captain empty, reserve 0 -> "Teal skips... Slate skips... BOOM, the fuse burnt down".
   Fix: do the reset/collect in the `round` hook (fires when the turn order passes the Captain's seat), not in `start`. For 63 hand the collected oxygen to the first seat clockwise from the Captain that still has wires.

2. **Job 39: the post-action info tokens are offered for values the player does not hold.**
   **Status: Fixed (held values only).**
   Real: FAQ Mission 39 says a dealt number card for a value you do not have (or that is out of the game) is ignored; card m39 says the token is placed in front of the stand. Engine: `AG.numInfo` offers every value on the player's cards that has a token left, and `placeTruthful` then lays a "holds none" token beside the stand. Confirmed (seat holding neither 5 nor 6 is offered "Token 5 | Token 6").
   Fix: in `AG.numInfo` keep only values the seat holds uncut (`heldVals(seat)[v]`); with none left, skip silently.

3. **Job 13: probes may point at red wires.**
   **Status: Fixed (probe on a red = boom).**
   Real: FAQ Mission 13: equipment and personal equipment cannot cut reds, and reds cannot be chosen when using a Twin Probe, Triple Probe or Full Scan. Engine: `RH.redTriple` has no `target` hook, so a Twin Probe or Triple Probe naming a number at a red + blue pair is legal (confirmed: `legal()` returns ''), and the Full Scan covers reds because it takes the whole stand.
   Fix: add `target(r,seat,si,k,ctx){return ctx.tool&&isRed(G.st[si].w[k].id)?'...':null}` for job 13. The rule text does not say what happens when the player happens to include a red, so the simplest consistent choice is "a red inside a probe selection counts as pointing at red: boom" (matches the job's all-or-nothing tone); the other reading (illegal move) leaks which wires are red. Pick one and say so in the job text. Severity could be read as ambiguous in the fix, not in the diagnosis.

5. **Job 30: the "lose equipment" penalty only considers ready cards.**
   **Status: Fixed (locked + ready cards).**
   Real: transcript BB-Final_Mission-30 ~236-248 s: "immediately discard a visible equipment card with the smallest number value". Engine `busPhase` `eqIfMissed` filters `x.st==='ready'&&!x.down`. Locked (face-up) cards are visible and count; used cards are ambiguous.
   Fix: choose among all face-up cards on the board (locked or ready), smallest printed value; keep the yellow card as lowest (assumption, state it).

6. **Sweep counts flipped wires (jobs 38, 56, 64).**
   **Status: Fixed (flipped wires ignored).**
   Real: Sweep card: a player says yes if they have an uncut blue wire of that value on their stand; the owner cannot see their own flipped wires. Engine `sweep()` excludes X wires but not `x.flip`, so a stand answers "yes" because of a wire its owner cannot know about. Confirmed in 56 (stand whose only 4 is the flipped one answers yes).
   Fix: add `&&!x.flip` to the `some()` (and to `us`), same as `heldVals`.

7. **Job 48: failed three-yellow call.**
   **Status: Fixed (all wires tagged, one step, red still explodes).**
   Real (scan m48): on failure "all the indicated wires receive an Info token, but the detonator dial advances only 1 space". Engine `doMulti(...,'tag')`: wires that are actually yellow get no token (only non-matching ones do), and a red among the three explodes. Confirmed (red among three -> "call was wrong", boom).
   The card never says what a red does; "advances only 1" suggests no explosion. Fix: give every pointed wire its token (yellow token on the yellows), keep the single step, and decide explicitly about reds (safest reading: red still explodes, because cutting a red always does; document it). Same function serves job 66's lever call.

11. **Job 31 (2 players): the draft forbids A+B and C+D.**
   **Status: Fixed (allowed, warned).**
   Real: scan m31 only "advises against" it. Engine `AG.draftCon` filters those pairs out. Fix: allow them (maybe grey them with a warning).

### Missing

4. **Jobs 24 / 40: Handsets only discard the token in job 24.**
   **Status: Fixed (cnt family).**
   Real: FAQ Mission 24: a token on a swapped wire is discarded. Job 40 uses the same x1/x2/x3 count tokens (CN M40 "like 24"), and the token states a fact about the stand the wire used to be on, so it becomes false after the trade. Engine `QH.swapBack` tests `G.mission===24`. Fix: test `G.tokFam==='cnt'` (jobs 24 and 40).

15. **Job 44: Damper rulings.**
   **Status: Fixed in part (Damper at forced skip; pretend-cut not implemented, see notes).**
   Real: FAQ Mission 44: the Damper can be used to ignore the detonator step when a player passes, and to "pretend to cut in zone 1 when everything has already been cut". Engine: the voluntary pass honours the Damper (`doX` of `oxygen`), but a forced skip for lack of oxygen (`stuck` -> `skipTurn(...,1)`) happens before the player can arm it, and the pretend-cut is not supported. Fix: for jobs 44 (and 49 if desired) pause at the forced skip and offer "use Damper to cancel the step"; add the pretend-cut as a no-op action when no zone-1 wire is left.

### Ambiguous (engine choice not contradicted by a source)

8. **Job 18: designated player lacks the value.** Card m18 defines no penalty and the Radar has just told everyone who holds it. Engine `lacks()` (borrowed from 45/51) makes them tag a wire and burns a step. Suggest limiting the choice to seats that answered yes, or documenting the borrowed penalty.
   **Status: Reading chosen, documented in rules-notes-impl.md.**
9. **Jobs 56 / 64: dual cut on a teammate's flipped wire.** Card: "the detonator dial advances 1 space" if they do. Engine charges +1 on a hit (`afterDual`) and +1 extra on a miss (`missExtra`), so a miss costs 2. Reading 1 step total is also plausible; state the chosen reading.
   **Status: Reading chosen, documented in rules-notes-impl.md.**
10. **Challenge 10 (jobs 55/60).** Scan chalB says "the 2 wires on each end have not been cut yet"; the drawing shows one boxed wire per end. Engine (and rules-notes) require one end wire each side. If the text is literal, require the two outermost wires on each side.
   **Status: Reading chosen, documented in rules-notes-impl.md.**
12. **Challenges 2 and 7 with fewer players than the card says.** "4 experts consecutively" / "3 experts consecutively": the engine accepts consecutive turns by the same player in 2-3 player games. If distinct players are meant, the card is unmeetable with fewer players.
   **Status: Reading chosen, documented in rules-notes-impl.md.**
13. **Rewind range.** Card: "move the dial back 1 space". Engine allows up to the purple segment (6) in every job; the dial art shows the purple segment on every dial, so physically possible, but it may exist only for job 51. Same for challenge/meteor/snare rewinds.
   **Status: Reading chosen, documented in rules-notes-impl.md.**
14. **Added loss rules not in the game.** (a) `checkStuck`: a hand with no legal cut at the start of a turn explodes, generalised from the job 9 FAQ to everything that lacks its own skip rule (36, 23/39 lines, etc.). (b) "four full rounds without progress -> explode" (assumption 23) is invented. Both are documented in `rules-notes-impl.md`; flag in the job texts or keep them to jobs 9/16/36.
   **Status: Reading chosen, documented in rules-notes-impl.md.**
16. **Job 54: reserve size and transfers.** Card: "leave the rest of the tokens in the middle" (no total printed). Engine assumes 30 in total and limits transfers to 1 or 2 tokens. Audio transcript is silent. Event order and counts (6 leaks, 2 extra turns, 2 bottles, 3 transfers) do match the transcript.
   **Status: Reading chosen, documented in rules-notes-impl.md.**
17. **Job 12: cards added by the Hidden Compartment.** Card: a number card on "each equipment card in play" at setup. Engine covers only the cards placed at setup; later additions are uncovered. Probably right, state it.
   **Status: Reading chosen, documented in rules-notes-impl.md.**
18. **Job 11: the fake-red blue value** never gets a validation token (excluded from `G.tot`), is excluded from opening tokens, and is not counted by the Sweep. Card does not say; acceptable, just document.
   **Status: Reading chosen, documented in rules-notes-impl.md.**
19. **Vaporiser (10-10).** Card: random info token from the supply, "reveal the number (1-12)". Engine skips the yellow token, values whose tokens are on the board, and finished values. Reasonable; document it.
   **Status: Reading chosen, documented in rules-notes-impl.md.**
20. **Job 38 (and 56/64): forced reveal.** `AG.forced` reveals automatically when every uncut wire is red including the owner's unseen flipped wire, which tells the owner (and everyone) that the flipped wire is red. FAQ says the player reveals "at a point when all remaining wires are red"; auto-reveal gives a piece of information the player could not have had. Offer it as a choice instead.
   **Status: Reading chosen, documented in rules-notes-impl.md.**
21. **Public memory.** The page keeps every Sweep answer, miss "not" fact and history visible. Card m18's reminder and RB "no recall" forbid asking for earlier answers. This is a deliberate digital convenience (ENGINE-REPORT says so); mention it in the rules drawer so it is not mistaken for a rule.
   **Status: Reading chosen, documented in rules-notes-impl.md.**

### Rules drawer text (`texts.js`)
- Twin Probe description omits the red handling (one red + one other: no explosion, token goes on the other; both red: boom). Add one line.
- "You win when every wire on every stand is cut": reds are revealed rather than cut; fine, but say "cut or revealed".
- Job card line for jobs 44/49/63 reuses the `speech` text "No numbers out loud"; those jobs forbid all talking (only the thumbs-up). Use the `what:'all'` wording.
- Job 13 text should mention that probes cannot go near reds once finding 3 is fixed; job 48 text should mention the token on every pointed wire (finding 7).

## Verified correct

**Setup.** Stand split 2p 2+2, 3p 2+1+1, 4p/5p 1 each (RB, tested in rules-test); deal evenly per stand from the Captain; sorted with decimals only for sorting; 48 blue, markers for exact and "x out of y" (`?` markers, unused wires aside) and per-job candidate ranges (jobs 2, 3, 46); equipment count = players, locked; dial start = players, 1 for 41/55/60/62, players+1 for 51 (checked against `m41dial*.png` and the TTS note); one opening token per player on an own blue wire, never the yellow token; 2p Captain-no-token jobs (11, 13, 27, 29, 40, 46, 51) and random token jobs (13, 39, 41, 43 2p); all numeric setup rows of `MISSION_SETUP` (reds/yellows per job and per 2p variant, equipment swaps, character bans for jobs 44, 45, 47, 49, 51, 54, 59, 63, 65, base-only 58, new characters from 31, Hidden Compartment from 9 in yellow jobs, double cards from 55) were compared with CN and the scans for all 66 jobs: no discrepancy.

**Turn.** One action per turn; Captain first then clockwise; empty hands skipped; dual cut hit (both cut in place, active player's own wire chosen), miss (step + true token, own wire never shown, yellow token for yellow), red = boom; deliberate wrong guesses allowed; naming a value you do not hold forbidden (FAQ house rule); solo cut 2 or 4 of the last wires of a value, across stands, never 3; reveal reds forced at the start of the turn; validation token when all four are cut; equipment unlocks on the first 2 (double cards 4) cut; token shortage handling (FAQ).

**Equipment (all 12 + 6).** Texts and timings match the scans: Unequal / Equal Tag (one token each, one end may be cut, reds/yellows equal), Handsets (token travels, 2-stand rule), Triple Probe / Full Scan (no yellow, hit if any match, owner tags a wire, red-in-selection logic), Sticky Note, Rewind, Recharge (1-2 used characters), Sweep (per stand, blue only, ignores X), Damper (before the dual cut; no step; no explosion on red; token on non-red only), Two-Value Probe (two values, yellow allowed, must hold both), Coffee Break; Lone Tag, Supply Drop, Express Pass, Vaporiser, Hook Line (stand choice), Hidden Compartment (instant, may unlock at once).

**Characters.** Twin Probe (same stand, number only, either match = hit and owner picks, none = step + token on one, one red = no boom and token on the other, both red = boom); once per job; Recharge resets it; the four new characters = copies of 8, 2, 3, 10.

**Constraints A-L and challenges 1-9** match conA/B and chalA/B (including H: no token, no cutting a tokened wire, no Sticky Note; L: two steps).

**Jobs checked against the card text/scan and found consistent:** 1-8, 9/16 (gate, FAQ explosion), 10 (claim, no repeat, 12 min with 2p), 11, 12 (both pairs, FAQ), 14, 15, 17, 20, 21/33, 22, 23, 26, 27, 28, 29 (deal 2/3, steps 1-4, FAQ bullets), 31, 32, 34, 35, 36, 37, 38, 39 (except finding 2), 41 (tripwire deal incl. 5p captain none, snare action, skip rule, FAQ red), 43 (counts, bounce, Coffee Break), 44/49/54/63 (costs, starting oxygen, validation top-up, skip + step, must-play FAQ; except finding 1), 45, 46, 47, 50, 51, 52, 53, 55/60/62, 57, 58, 59, 61, 64, 65. Audio jobs: 19 timeline (668 s, 12/10/5/2 min cues), 30 (phase list, lengths and rewards match the transcript, except finding 5), 42 (3 magicians, 2 jugglers, 3 tamers, knife, ta-da, clouds, 3 trampolines), 54 (event order and counts), 66 (map, walls, door, laser, traps, stairs, striped squares, objective lengths 80/75/60/90/10/105/20) all match the transcripts and `bunker.jpg`.

## Method notes
Scripts used (kept out of the repo): rig a stand, call `performMove`/`legal`, read `G.log`. They reproduced findings 1, 2, 3, 6, 7. Findings 4, 5, 15 are from reading the code and the FAQ/transcript; the `G.mission===24` literal in `QH.swapBack` is the whole of 4.

## Fixed status
All 6 wrong and 2 missing items are fixed with a `FIX` test each in `rules-test.js`; ambiguous items 8-10, 12-14, 16-21 have a documented reading in `rules-notes-impl.md`. Note: item 3 chose the boom reading, so the Twin/Triple Probe never leaks red positions.
