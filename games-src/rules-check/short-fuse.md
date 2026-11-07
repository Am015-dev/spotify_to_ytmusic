# short-fuse: rules check

Adapts: a cooperative two-to-five player deduction game: wires on sorted stands, dual cuts by naming a number you hold, solo cuts, reveal-reds, a fuse dial, unlockable equipment, character probes, 66 scripted jobs.

Sources checked
- The project already holds a primary-source audit: games-src/short-fuse/game/RULES-AUDIT.md (written against the rulebook v1.0, the official FAQ dated 11 July 2025 and scans of every card; the raw sources are in a private repo and were not reachable from this worker), games-src/short-fuse/rules-notes.md, sources.md and game/rules-notes-impl.md.
- Web search and publisher pages were not repeated: the rulebook and FAQ are the primary sources already used. I re-read the engine to confirm the audit's fixes are present (games-src/short-fuse/game/src/engine.js).

Counts: WRONG 1 (med), MISSING 1, SIMPLIFIED 5 (a further 12 reading choices are listed in the audit and impl notes)

## Findings

| Class | Code | What the code does | Correct rule in plain words |
|---|---|---|---|
| WRONG (confidence med) | engine.js:197 checkStuck | A hand with no legal cut at the start of a turn explodes the bomb in every job, generalised from the one job where the FAQ says so | Only the job(s) the FAQ names explode; others have their own skip rule or none. Audit item 14, left as a documented reading |
| WRONG (confidence med) | assumption 23 in rules-notes-impl.md | Four full rounds with no progress explode the bomb | Invented stalemate rule, not in any source. Audit item 14 |
| MISSING | engine.js stuck -> skipTurn (job 44) | The Damper cannot cancel the step of a forced skip for lack of oxygen, and the "pretend to cut when everything is cut" ruling is not implemented | FAQ for job 44 allows both. Audit item 15, marked "fixed in part" |
| SIMPLIFIED-ON-PURPOSE | engine.js DIAL_MAX | Rewinds may reach the sixth (purple) segment in every job | Card says "move back 1 space"; the extra segment may exist only for one job. Audit item 13 |
| SIMPLIFIED-ON-PURPOSE | engine.js (public memory) | Every sweep answer, miss fact and history entry stays visible on the page | The rules forbid asking for earlier answers; digital convenience, documented |
| SIMPLIFIED-ON-PURPOSE | engine.js AG.forced | Reveal-reds happens automatically at the start of a turn when only reds remain, in all jobs | Rulebook wording only says it can happen; some cards say must. Audit item 20: auto-reveal can leak a hidden flipped wire in jobs 38/56/64 |
| SIMPLIFIED-ON-PURPOSE | engine.js:44 stCount / setupWires | Dealing starts at the Captain's first stand and goes clockwise | Rulebook does not say where an uneven deal starts |
| SIMPLIFIED-ON-PURPOSE | data.js token counts | Counts of X, even/odd, count and oxygen tokens in the surprise boxes are assumed (30 oxygen total in job 54) | Printed counts not reachable |

## Verified correct (confirmed by the audit, spot-checked in code)
- 70 wires (48 blue 1-12 x4, 11 red, 11 yellow with sort-only decimals), 12 equipment cards, 5 stands; stands per player 2+2 / 2+1+1 / 1 each; equipment in play = players.
- Dial starts at the player count, explodes at 0; jobs 41, 55, 60, 62 start at 1 and job 51 at players + 1.
- Turn: exactly one action; dual cut (a hit cuts both wires; a miss advances the fuse and shows the true token; red = explosion), solo cut (the 2 or 4 remaining of a value, never 3), reveal reds; validation token when all four of a value are cut; equipment unlocks after the first 2 of its value are cut (4 for the double cards).
- Twin probe red cases from the FAQ; opening info tokens; token-shortage rule.
- The audit's six WRONG and two MISSING findings are fixed: oxygen reset on the round hook, number-card info tokens limited to held values, probes near reds, locked + ready equipment in the loss penalty, sweep ignoring flipped wires (engine.js:440 shows `!x.flip`), failed three-yellow call, count tokens in jobs 24 and 40 (`G.tokFam==='cnt'`, engine.js:449), and the 2-player draft pairs (warned, not forbidden; engine.js:603-604).

## Not verified
- I could not open the rulebook or FAQ myself; everything above rests on the in-repo audit, which cites them. Confidence med-high for base rules, med for job-specific rulings.
- Jobs 9-66 mission setups, equipment texts, constraint and challenge texts: audited by the previous worker from card scans, not re-checked here.
- The audio-driven jobs (19, 30, 42, 54, 66) come from machine transcripts of moderate accuracy. Confidence low.
- Dial arithmetic: rulebook text does not state the count; two independent implementations and card art agree. Confidence med.
