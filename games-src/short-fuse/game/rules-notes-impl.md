# Short Fuse: how the rules are implemented (stage 1)

Companion to `../rules-notes.md` and `../missions.json`. Every rule in the research is either implemented (with its handler) or listed under **Cut** with a reason. The research `gaps` assumptions are kept; extra assumptions made while coding are listed under **Assumptions added in code**.

## Where things live

| Area | Code |
|---|---|
| Wires, tokens, equipment, crew, restrictions (A-L), challenges (1-10), bunker map, timed prompt scripts, all 66 jobs | `src/data.js` (`MISSION_SETUP` is generated from `missions.json` by `tools/gen_setup.js`: numbers only, no names) |
| Core rules: setup, dealing, opening tokens, turns, dual/solo/reveal, misses, fuse, unlocks, validation, win/loss | `src/engine.js` (top half) |
| Job mechanics | `src/engine.js`, `RH.<key>` rule handlers (one per `rules[].k` in `MISSION_INFO`) |
| Per-seat knowledge view, invariants, text view | `src/engine.js` (end) |
| Computer crew | `src/ai.js` |

## Core rules (all implemented)

| Rule | Implementation |
|---|---|
| 70 wires; red/yellow decimals only sort | `WIRES`; `cv(id)` gives the play value (1-12, `Y`, `R`) |
| Wire pool per job, "x out of y" (public candidate markers, unseen aside wires), candidate ranges, fixed yellows | `drawCol`, `G.markers`, `G.aside` |
| Stands: 2p 2+2, 3p foreman 2 + 1 + 1, 4p/5p one each; two stands = one hand | `stCount`, `standsOf`, `slotsOf`, `heldVals` |
| Deal round-robin per stand from the foreman's first stand; sort each stand | `setupWires` |
| Foreman (captain) random, or passed in (`newGame({captain})`) for the rotation between jobs | `newGame` |
| Characters: foreman card to the foreman, others pick (base 4, plus the 4 new ones from job 31 except banned) | `setupChars`, `allowedChars`; `newGame({chars})` |
| Equipment: one per player from the job's pool (base from 3, Hidden Compartment from 9 in yellow jobs, double cards from 55), swapped-out cards excluded | `setupEquip` |
| Opening token: clockwise from the foreman, one per player on an own blue wire | `infoSetup`, `AG.infoStd` |
| Turn: exactly one action; captain first, clockwise; empty hands skipped | `AG.startTurn`, `AG.endTurn` |
| Dual cut, success (both wires face up in place), failure (fuse step + true token, active player's wire never shown) | `doDual`, `QH.dualHit`, `dualMiss` |
| Naming red is impossible; naming a value you do not hold is forbidden | `canName`, `legalDual` |
| Solo cut: all remaining wires of the value in your hand (4, or the last 2; never 3), across both stands | `legalSolo` |
| Reveal reds: forced at the start of the turn when every uncut wire is red | `AG.forced`, `revealReds` |
| Yellow is cut as "yellow"; a miss on yellow shows the yellow token | `cv`, `trueTok` |
| Validation token when all four of a value are cut | `afterCut` |
| Equipment unlocks the moment the first 2 (double cards: all 4) of its value are cut, works once, timing labels | `checkUnlocks`, `eqOK` |
| Twin Probe (Double Detector): two wires on one stand, number only, both match = owner picks, one red = no boom and token on the other, both red = boom | `doDual` with `tool:'dd'`, `QH.dualHit`, `dualMiss` |
| Fuse: start = players (1 in 41/55/60/62, players+1 in 51), each step -1, 0 = boom, max 6 | `advance`, `rewind`, `DIAL_MAX` |
| Win: every stand wire cut or revealed (and the robot empty); loss: red, fuse, job explosions | `checkWin`, `explode` |
| Info-token shortage (FAQ): a token still goes down as a "spoken" token; tokens of cut wires go back | `tokFromSupply`, `cutSlot` |

## Equipment (18) and crew tools (all implemented)

| Card | Implementation notes |
|---|---|
| Unequal / Equal Tag | `doEq` `eq1`/`eq12`, `G.marks`; own adjacent pair, one may be cut; two reds or two yellows count as equal |
| Handsets (card and crew tool) | `startSwap` + owner's choice `QH.swapBack`; sorted insert, two-stand rule, tokens and "not" facts travel; job 24 drops the token |
| Triple Probe (card and crew tool), Full Scan | `doDual` `tool:'eq3'/'pt3'/'eq5'`; full scan ignores X and flipped wires |
| Sticky Note | own blue wire; uses the job's token family (even/odd, count, false) |
| Rewind, Recharge, Coffee Break | `doEq` |
| Sweep (card and crew tool) | `sweep()`; per stand; uncut blue only; X wires ignored; recorded as a public announcement |
| Damper | armed at the start of the turn (`G.tfx.damper`); cancels the step and the red explosion; no token on red |
| Two-Value Probe (card and crew tool) | `two:'eq10'/'pt10'`; yellow allowed; announces that the cutter also holds the other value |
| Hidden Compartment, Supply Drop, Vaporiser | instant: fire on unlock (`AG.instant`) |
| Lone Tag, Express Pass, Hook Line | `doEq` `eq22`, `doSolo` with `ep`, `doEq` `eq1111` (two-stand player picks the stand) |

## Job mechanics (rule handler per mechanic)

| Jobs | Handler | Notes |
|---|---|---|
| 9, 16 | `gate` | order cards; side A needs 2, side B needs 4 |
| 10 | `freeTurns` + `timer` | `{a:'claim'}` by any eligible seat; 15 min (12 with 2p) |
| 11 | `fakeRed` | the number card's blue value is red for every rule |
| 12 | `eqCover` | cover cleared after 2 of its value; card needs both |
| 13 | `redTriple` | `{a:'multi',kind:'red3'}`; no Reveal Reds; forced with a hand of reds; 4-5p may try without a red |
| 14, 17, 28 | `rookie`, `liar`, `butterfingers` | roles from the dealt foreman card; false tokens for the fibber; explosion on a missed dual cut |
| 15 | `eqDeckReveal` | face-down equipment, number deck |
| 18 | `searchlight` | permanent Sweep, card + sweep + designation each turn |
| 19 | `timer` (`m19`) | 668 s of play, fake 15:00 display that jumps to 5:00 |
| 20, 35 | `xWire` | X wires unsorted, immune to equipment; 35 locks them until all yellows are cut |
| 21, 33 / 24, 40 / 52 / 58 | token family `par` / `cnt` / `false` / `none` | `trueTok` |
| 22 | info `neg` + `yellowGift` | |
| 23, 39 | `special4` | `{a:'multi',kind:'four'}`; burn per round; rewards |
| 26 | `declare` | |
| 27 | `noItems` mode + `yellowDraft` | |
| 29 | `mindRead` | |
| 30 | `bus` | timed phases from `SCRIPTS.m30`, rewards and penalties, three-value lock, yellow rush, final 2 minutes |
| 31, 61 | `persCon` | draft / random, drop when blocked (31), rotation + F-L swap + full-round explosion (61) |
| 32, 37, 57 | `globCon` | foreman swap / change on finish / paired with validation tokens |
| 34 | `mole` | hidden weak link, accusation `{a:'accuse',who,con}` |
| 36 | `line5` | |
| 38, 56, 64 | `flip` | owner cuts own flipped wire via `{own:'flip'}` dual or `{flip:1}` solo; others blocked (38) or +1 step (56, 64) |
| 41 | `tripwire` | snare wires (our name): `{a:'trip',s,k}` |
| 42 | `circus` | acts from `SCRIPTS.m42`: magician, tamer (seats move, stands stay), juggler, knife thrower, ta-da rule (`{a:'tada'}`), clouds, trampoline check |
| 43 | `robotPatrol` | |
| 44, 49, 54, 63 | `oxygen` (`shared`, `gift`, `depth`, `bundle`) | costs, reserve, refills, skip + step when unable to pay, voluntary pass where allowed |
| 25, 44, 49, 63 | `speech` | no-talk jobs: the only allowed signal ("I need oxygen") is the public `{a:'signal'}` announcement |
| 45 | `volunteer` | `{a:'snip'}`, `{a:'nosnip'}`, `{a:'snipReveal'}` |
| 46 | `sevens` | |
| 47 | `math` | dual/solo moves carry `calc:[a,b,'+'|'-']` |
| 48 | `yellowTrio` | |
| 50 | `memory` | tokens beside the stand, no validation tokens |
| 51 | `sir` | |
| 53 | `robotFuse` | |
| 54 | `redTide` + `oxygen` | events from `SCRIPTS.m54` |
| 55, 60 | `challenges` | `{a:'redcall'}` for challenge 1 |
| 58 | `unlimitedDD` | |
| 59 | `robotLine` | |
| 62 | `meteor` | |
| 65 | `hotPotato` | |
| 66 | `bunker` | `SCRIPTS.m66` objectives, `BUNKER` map, walls, door, laser, traps, stairs, action squares, lever = two-yellow special |

## The five audio jobs (19, 30, 42, 54, 66)

No audio. Each runs from `G.clock` (seconds of play) with on-screen prompts in our own words (`SCRIPTS` in `data.js`, derived from the transcripts' event order and timings). The UI advances the clock with `tick(seconds)` during real play and pauses it whenever the narration would talk; headless games add `opts.turnSec` (default 12 s) per turn. Stage 3 adds sound on the same timeline.

## Cut (with reasons)

| Rule | Why it is cut |
|---|---|
| Job 25: "never say a number; a slip burns a step" | Speech rule. A digital table has no voice channel and the interface is symbols only, so there is nothing to slip or to penalise. The rule is listed in the job text. |
| Job 30: "the active player may only mime; each slip burns a step" | Same reason (speech). The phase still runs; only the mime penalty is absent. |
| Job 42: saying "boing" on the trampoline, closing eyes for the magician | Table stunts. The trampoline "ta-da" check that follows it is implemented, and the ta-da shout is a real button (`{a:'tada'}`). |
| Job 54 finale: "everyone holds their breath" | Physical stunt with no game effect. The prompt still appears. |
| Audio tracks | Replaced by the timer + prompts above, as the brief asks (stage 3 adds sound). |
| Campaign progression (boxes unlocking, rule stickers as unlocks) | Stage 2. The engine already applies each sticker's rule by job number (Hidden Compartment from 9, new crew from 31, double cards from 55). |
| One-person two-stand solo variant | Not in the rulebook. |

## Assumptions added in code (beyond the research `gaps`)

1. **Off-turn equipment window.** "Any time" cards and crew tools can be used by any seat whenever the game waits for an action or a turn claim. They cannot interrupt a pending question (for example in the middle of a Twin Probe resolution).
2. **No legal action at the start of a turn.** The bomb goes off (generalised from the FAQ for job 9), except where a job says what to do (skip, skip + step, turn the restriction down, and so on).
3. **Headless turn time** for timed jobs: 12 s per turn (`opts.turnSec`). This drives the balance of jobs 10, 19, 30, 42, 54 and 66.
4. **Random crew deals (14, 17, 34)** always include the foreman card, plus random base cards for the other players.
5. **Two-Value Probe combined with a multi-wire probe** names two numbers (no yellow), like the probes themselves.
6. **Restrictions I and J** apply to the right-most / left-most UNCUT wire of a crewmate's stand.
7. **Handsets** keep "not this value" facts and tokens on the moving wire (they are facts about that wire).
8. **Job 22** negative tokens describe the whole hand, even when laid by one of two stands.
9. **Job 29**: when the right-hand neighbour has no card, the next player to the right plays one.
10. **Job 30**: "cut the other two" (phase 8 reward) cuts every remaining wire of that value wherever it is; the yellow rush is a pointing action at all remaining yellows; after the last two minutes the bus explodes.
11. **Job 42**: acts follow the same play clock (no time limit); the tamer moves seat positions (stands, turn order by position); the magician's act takes the active player's turn; the juggler swaps two cut wires on one stand.
12. **Job 43**: if nobody holds wires but the robot still does, the job is lost.
13. **Job 45**: a false "Snip!" burns a step and the card stays open; when no number value is left, red-only hands are revealed.
14. **Job 47**: subtraction is larger minus smaller; when fewer than two cards remain, all twelve are laid out again; a miss still discards both cards.
15. **Job 54**: the ten-minute event list is the transcript order with times scaled to 600 s of play; leaked reds are drawn at random from the pile.
16. **Job 59**: a Coffee Break after moving the robot does not undo the move.
17. **Job 61**: the extra table restriction cards sit in the rotation ring as empty seats next to the foreman.
18. **Job 63**: the oxygen bundle passes to the next player on the left who still has wires.
19. **Job 65**: a Coffee Break still hands a card on at the end of the turn.
20. **Job 66**: an objective that is met advances at once (no idle wait); only the current objective's square can do its action; the lever action is "point at both yellows" (a miss tags them and burns a step, a red explodes); the bonus rearrangement swaps the action card with one side (or keeps them); the job is lost if every wire is cut before the doctor is caught.
21. **validMoves listing.** Triple-probe moves are listed for adjacent triples only, Two-Value combined with a multi-wire probe is not listed, and each all-at-once special action is listed once as an example (`example:1`). `legal()` and `performMove()` accept every valid combination, which is what the UI builds from clicks.
22. **Out-of-3 candidates and the AI**: the AI treats the unused wires as an unseen pile that accepts only that colour.
23. **No-progress guard.** Four full rounds in a row without any cut, card or tool use end the job as a loss. Without it some positions (everyone blocked by a restriction the foreman keeps, job 32) could run forever.
24. **Job 41**: once only the active player's own snare wire (plus reds) is left and nobody else holds wires, nobody can ever point at it, so the job is lost.
25. **Flipped wires (38, 56, 64)**: a dual or solo cut "with my flipped wire" names which flipped wire it means (`fu`), as a player would point at it. In job 64 every player knows their left flipped wire is the lower one (the crew told them where to put it), and the AI uses that.
