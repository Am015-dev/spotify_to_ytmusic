# HANDOFF lights-2 (2026-10-16): stop-line guard now ON by default (?l3lt=0 / od_l3lt=0 = off)
1. L3_stop now takes the nearest stop line ahead (current edge's box vs boxes on the next edges, min distance); L3_edges widens each box by 3 m so edges that only graze a box corner (node 115, 612,-2) get a stop line.
2. Measured on the built page, 120 s each, 3 runs: Frankfurt red runs 2/2/2 + 1/2/2 overlaps pairs 0-1; Athens red runs 0/0/0, overlaps 0/0/0. Target (<=2 runs, <=2 pairs) met.
3. GO life3/lights now passes at runs<=2 and overlap pairs<=2; checklist text updated (src/99c_checklist.js). Gate: unit 0 FAIL; TAG=life1,life3,xf1,terrain 44/45, only life1/ath-density fails on "SLOW 11.4 s > 10 s" (timing-only, same with ?l3lt=0).
4. No queue shot: the GO park spot is on grass facing away from the road (same as lights-1), so the 852x393 shot showed no queue and was not committed. Next: a camera/park spot ON the road at node 115 for a real shot.
5. Not deployed; coordinator batches the deploy and the OD_CHANGELOG entry.
