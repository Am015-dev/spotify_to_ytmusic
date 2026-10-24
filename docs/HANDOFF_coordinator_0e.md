# Coordinator handoff (OD 0e), 2026-10-22 ~07:40 UTC
Coordinator session_01L97MfPJRbeb3t9g3h8vcM3. Read CLAUDE.md, then this. Deploy recipe: docs/HANDOFF_coordinator_0c.md (worked for beta.151; Artifact publish needs read of live page + models/lx.js, xf.js first).
LIVE NOW: beta.158 (37ea586f, Beta v324 + preview v4, first publish with all 150 per-car model files: likely cause of Alex's 'most garage cars do not work'). Running: garage-cars-r22e35 session_018GtoVWgqD8fV5C7twdQh4P (confirm cause, chunk fallback, PUBLISH_FILES list). Stopped to cut cost: parked-jump, flake-quietdirt. Next (one worker at a time): race bugs from review #63 (River Run rival never finishes; Athens start button opens the wrong race). Parked: glossy look (needs lights + spec), reveal stall, Athens slope traps, climb. QUEUE (Alex 24 Oct, next lane after onfoot-collide): wind turbine rotor spins away from the nacelle ('turbin is moving out of head', fra, park hill next to the twin tower); the blade hub sits halfway down the tower, not at the top.
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
