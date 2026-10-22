# Coordinator handoff (OD 0e), 2026-10-22 ~07:40 UTC
Coordinator session_01L97MfPJRbeb3t9g3h8vcM3. Read CLAUDE.md, then this. Deploy recipe: docs/HANDOFF_coordinator_0c.md (worked for beta.151; Artifact publish needs read of live page + models/lx.js, xf.js first).
LIVE NOW: beta.154 (275d133, Beta v320) from 683f56f: smash look ON fra, no popups while driving. Running: frame-js session_01JnTTuywpqpyGP4S62VhPjf (OPUS), roamcard-quiet session_01KT4LZmMwfDawpQSZbqk6mw (SONNET). Queue (rules 11-18): bughunt phone profile + nearAny dead-car fix; flake-kill (cam-clear, hud6, quiet-start fra, smash, xf1/grass, traffic-inview ath, tr9-chunk, speedfeel ath); preview build with all flags ON + 1-day on-or-delete for clb/t9e/bx/gloss/core/studs. Parked: reveal stall, glossy, ath slope traps, climb.
## Live
beta.151 (ce32c02, Beta v317), built from 7394743: speed feel, solid-cars r3 (camera turn), ground-tile + coin prewarm, core reveal, xf1/water. gloss and ?cl=core,studs default OFF.
## Reviewed since (on trunk, not live)
#41 68b2d6f glossy r2 PASS (flag-off parity; target dropped, stays OFF). #42 277c8de reveal-stall findings (tools/docs). #43 753bb87 quiet-dirt GO parks traffic (pending). #44 c8f48f6 bughunt tool (pending).
## Running
- groundtex-cache-r22e13 SONNET session_01Nd1QXbeXp8DwWoBUSZte9x: cache groundTex per city (fra 6x reveal GPU stall), bar fra ios-reveal 4/6.
- ath-trap-r22e14 OPUS session_01HDURb5TobUQCi9vj8yckND: bughunt fix-first #1, Athens trap geometry + bowl lift 2.5 s.
- Reviewer OPUS session_018PMBBNkPqRVd3jzKrBcA2d (next #45).
## Gates
Pre-deploy adds `node tools/bughunt.js --hours 2 --city fra` (and ath): not worse than live (trunk fails it today, score 11/100).
## Queue (Alex order; bughunt fix-first outranks)
1 bughunt fix-first list in docs/BUGHUNT_x1000.md (fra hill slope slides 71/h, ath NPC sideways slides/teleports). 2 smash look r3. 3 street life/emptiness. Dropped (2 lanes used): glossy (head/tail emissive lights need a design plan), core,studs flip (blocked on fra reveal stall).
## Notes
Old coordinators OD 0c (session_01Ai8dkUF41GoPeiPc85NE6b) / 0d may still forward Alex asks. Branch cleanup is blocked by the permission classifier.
