# W290 street boss duel (branch nr/W290-boss-duel from alex/brave-carson-rbpmlk), 31 Oct 2026. Not deployed. Verdict: DO NOT SHIP YET
Design: BALANCE-W290.md (15 lines). Logs, results.json and shots (not committed): /tmp/claude-0/-home-user-spotify-to-ytmusic/210ffe73-2179-543d-9d7a-bef4fb584ac7/scratchpad/
(g/c1 = boss-only final tuning, g/b1-b3 = first tuning, g/f1 = full stage, shots/ = telegraph / answer / punish / kill / result at 3 sizes, streetsim.md).

## Code changed
- parts/street/streetboss.js: rewritten. The W167 three-phase fight (throw / leap / phase roars / hp locks / pin / back-off) is gone; the boss cycles
  SWING (GUARD) -> CHARGE (DASH) -> POUND (JUMP). The first answer key in the READ part of a telegraph is the decision: right = boss OPEN 1.6 s (x2 damage),
  wrong / late = the attack lands (1 / 2 / 1 hearts). 4 s without an attack = a CHARGE (anti-camp). HPK 8 -> 6. FOOT.SB.log keeps [attack, t, result] per attack.
  The charge and the pound pass {beam:1} to env.melee (a body / ground band, not a fist): streetreach.js's fist-tip test would drop them (it did: 3 of 15 idle hits).
- qa/gauntlet-foot.js: strategies 'duelist' (answers RT = 250-350 ms game time after the telegraph starts, then punishes after the same delay) and 'late' (600 ms);
  both play the street before the boss as 'tactician'. SNAP carries atk / sT / tid; each run line prints duel=<attack:result counts>.
- qa/bossduel-shots.js (new): shots of each telegraph, a right answer, the punish window, the kill and the result at 390x763, 844x390, 1440x860 (keys, clock jumped).
- street2.js heavy def and street3.js boss trigger: not touched (not needed).

## Clear rates, real input, TS 3 (8 seeds asked; what ran is below)
| boss only (JUMP=152)      | duelist | late | dodger | idle | masher | random |
|---------------------------|---------|------|--------|------|--------|--------|
| PC 1440x860 keys          | 4/4 (+3/3 at READ .65/.70/.75) | 0/4 (+0/3) | 0/2 | 0/1 | 0/1 | 0/1 |
| phone 390x763 touch       | 4/4 (+3/3) | 0/4 (+0/3) | NOT RUN | NOT RUN | NOT RUN | NOT RUN |
| phone 844x390 touch       | NOT RUN | NOT RUN | NOT RUN | NOT RUN | NOT RUN | NOT RUN |
Targets: duelist 60-90% (got 100%: too easy for a perfect reader), late 20-50% (got 0%, best run left the boss at 15/216 hp), dodger >= 75% (got 0%: the
generic dodger guards or dashes at anything within 170 px and never jumps the pound), idle / masher / random 0% (met, 1 seed each, not 3).
Full stage from the title: see the last section (g/f1).
Duelist misses: wrong-late on ~1 of 6 SWINGs on PC (bot loop latency pushes its 250-350 ms press past the 0.60 s READ end); 0 misses on the phone.
Late misses: every SWING, most CHARGEs (2 hearts each); POUNDs mostly right.

## Pre-boss gates, streetsim RUNS=40 x1 (x3 NOT RUN)
reached the boss: nearest 22/40 (55%), gfirst 34/40 (85%), dodge 27/40 (68%), idle 0/40 (died median 19.6 s); idle stand-still 17.6 s (gate >= 17.8: 0.2 short,
pre-boss code unchanged; one batch only). The whole-street clear gates (gfirst 75 +-8, dodge 65 +-8, nearest 25-40) now read 0%: the sim bots answer the OLD
attacks (sb_poundW / sb_throwW etc.), so they lose every boss fight (won 0/22, 0/34, 0/27). FAIL 'every foe melee hurt went through the reach check'
(1546 of 1777): the charge and pound use the beam bypass on purpose.

## Shots looked at (shots/), what is wrong, worst first
1. The answer words (GUARD! / DASH! / JUMP!) and the green 'PARRY! OPEN' pops are NOT on screen at any size: the pops from IN.pop do not show in this render
   path, so the telegraph is pose only. The duel is unreadable for a new player until the word goes through a drawn layer (the HUD hint line or purefoot).
2. The poses barely differ: SWING's 'melee' frame is a gun-butt aim, CHARGE's crouch reads like idle with the gun at 1440x860; POUND's 26 px rise is small.
3. The old tutorial hint ('W/S or up/down: step nearer or further to dodge', 'GUARD: hold I ...') sits under the boss bar during the fight and tells the wrong answer.
4. Punish window: no visible OPEN marker on the boss; at 844x390 the boss stands at the left edge half hidden by the steam prop.
5. Result screen fine (STREET CLEAR, B, buttons). 1440x860 kill shot missing (the boss died between polls).

## Next (one task each)
1. Draw the answer word + the right/wrong pop in a layer that renders (sonnet), then retake bossduel-shots.js.
2. Tune READ ends so late lands 20-50%: try SWING .65, CHARGE .80 (late misses mostly SWING), and make the duelist's 60-90% come from a longer fight
   (HPK 7-8) rather than from shorter windows; 8 seeds x PC / 390x763 / 844x390.
3. Teach streetsim's dodge / gfirst bots the new answers (sb_tel + atk) so the whole-street gates measure again; decide with the owner whether the
   generic gauntlet dodger should still be expected to beat this boss.
