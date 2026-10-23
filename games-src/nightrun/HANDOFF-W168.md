# HANDOFF W168: boss fight length and shield guard tuning

Branch `nr/W168-len`. Values only, tuned with qa/streetsim.js + qa/bossprobe.js (50 runs/bot, x1200 real time).

## 1. Boss fight length (row B4): DONE
- `streetboss.js`: boss hp x8 by default (`?sbhp=` still overrides). `street2.js` climax: no rusher adds while the phased boss stands (was max 3).
- `qa/streetsim.js`: the bots' run loop is 300 s (was 200 s: a 45 s boss fight after the 145 s boss start was cut off and counted as a failed run); stuck detector counts boss hp as progress.
| | before (live beta.173) | after |
|---|---|---|
| dodge fight length median | 9.5 s | 45.7 s (min 27.8, max 58.8); 52.7 s at x9 |
| dodge clears | 88% | 88% |
| dodge fights showing all 3 phases | 44/44 | 44/44 |
| gfirst clears / fight length | 96% / 10.2 s | 80% / 40.8 s |
| nearest clears | 24% | 4% |
Median is near the 45 s edge: use `HPK` 9 (52.7 s, dodge 88%) if more margin is wanted.

## 2. Shield guard (row E4): values tuned, flag stays OFF
`FOOT.GD`: TIRED 10 -> 4, CROUCH .6 -> .8, CD 3.2 -> 8. With `?shieldfoe=1`: nearest 3-10% (target >= 20%: NOT met), gfirst 72-88%, dodge 100%; gfirst - nearest >= 15 holds.
Why it is not on: the casual (nearest) bot is limited by gunners and rushers before the boss (244 + 223 hearts lost, guard 15-19) and by the boss it cannot dodge (pound hits 26 of 30, barrel 17 of 25); only 6 of 50 reach the boss with the guard on (12 off). Sweeps of TIRED 2-10, CD 3-10, waves [8] vs [4,8] moved it only 2-10% with no trend (rule 16e). Needs the owner's play, or a casual-bot gate that is not tied to the boss.
Tried and dropped: a heart drop at each boss phase / when Kai is 3 hearts down (the bots only walk to pickups with no foe alive, so it measured nothing); a longer cooldown after each boss attack (heavyDef resets it, no effect).

## Open
- Casual clear rate (nearest) fell from 24% to 4% because the boss fight is now 4x longer and the nearest bot has no answer to pound/barrel. Real players read the captions; the bot cannot. Owner play decides whether a longer boss needs softer pound/barrel damage.
- Gates still FAIL as before: best bot 60-80% (88%), nearest 25-40%, threat peak, ducking >= 3 hits.
