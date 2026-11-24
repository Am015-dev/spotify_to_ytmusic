# FIXED2 wickdeep report

Branch shelf/W566-new-dungeon. Not deployed.

## Gates
- build-all --quick PASS; --full once PASS on the main fix commit (phone-check, rules-test 439/0; lab WARN is the known scenario-list note). After that only a small coach-text and luck-card-hide change: quick build, rules-test 439/0 and tap-play 0 dead taps at 375x667 and 375x553 re-run, --full not re-run.
- tap-play 0 dead taps (375x667, 375x553). calm audit: 0 loops, 0 helpers.
- games/lab.html and scenarios.json restored, not committed.

## What changed
1. Tutorial: a rat sits in the first room (2 steps from the heroes). Coach lines read the board: they name the foe, its distance, and say what to do; after the kill they stop talking about hitting.
2. First fight: board shake on a hit, "Luck card +N: D damage" line (MISS and x2 variants), kill message "<foe> defeated!", luck card hides after the hit.
3. Tapping a hero/foe keeps the prompt and its buttons; the info goes in the tray with a Close button.
4. No Rest prompt in round 1 (and none when the hand has 4+ cards).
5. Phone hand: 5x2 grid of compact cards, tapped card shown enlarged in a strip with hero tabs; no sideways scroll at 375x667 and 375x553.

## Cold check (independent subagent), as given
"Unaided play: partly (phone tutorial yes, desktop only to the first door reveal). Fun 2 of 5 on this short sample. I'd play again. Hit feedback was good: luck card flip (+2), 'Hit 2 +2 = 4', a 'Luck card +2: 4 damage' pill, a hit flash and a kill message. I saw no damage number on the rat and no shake. A monster was in reach. The coach said the rat was '2 hexes away: play a move half, then attack', but the heroine's range-3 hit worked straight away. The coach was wrong there. The rat died on one hit. After that the coach kept saying 'Now the other half of the other card' with nothing left to hit. 'Tap Ready' showed over a 'Got it' panel that hid Ready. The +2 luck card stayed stuck over the top of the map. Tapping a hero showed hero info plus a Close button; the prompt and Hint stayed. No Rest button in round 1. The hand did not scroll sideways: 5x2 grid. Desktop: 'A door opens' revealed 2 rats and a Tallow Wight (best moment). Worst: nothing says to walk to the door; card titles overlap their text, e.g. 'Hum of the De...'."
Fixed after it: coach wording for ranged reach and after the kill; luck card hides after the hit. NOT fixed (open): damage number/shake not noticed by the tester (shake exists, may be subtle), lesson panel hides Ready until "Got it", no prompt to walk to the door, PC card title overlap.

## Proof
games-src/wickdeep/proof/shots-f2/ (375x553, 375x667, 1366x768: lesson and select).
