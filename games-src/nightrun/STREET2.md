# Street 2: the Zeil street run, rebuilt (flag RET.street2, ?street2=0 = the old 7-section stage)
Owner, 22 Oct (2/100): "on foot is extremely boring, very repetitive, not strategic, no variety, maybe destructible items, size of the assets is not correct".
Code: parts/street/street2.js (replaces FOOT.STAGES.zeil when on). Test: qa/street2-test.js (stepped time, human-style bot).

## The run: 90 s, 6 beats of ~15 s, one decision in each
| # | Beat | What is new | The decision |
|---|---|---|---|
| 1 | THE STREET | rushers (sprint in, short red crouch, lunge) | jump the lunge or shoot it first; smash the crates for a gun |
| 2 | BEHIND THE CAR | gunner crouched behind a parked car | HIGH path (platform: you can hit him, he can hit you) or LOW path (hide behind crates, shoot the car apart, flank) |
| 3 | THE HEAVY | heavy with an armoured front: red glow, then a straight charge | bait the charge into the red barrel (stun + big damage) or chip his back |
| 4 | KIOSK ROW | gunner behind a kiosk + rushers, a gold crate in the open | open the gold crate under fire (heart / power gun) or move on |
| 5 | TWO WAYS | 2 gunners behind cover, a platform above them | high path again, now under two guns, or break the cover from below |
| 6 | CLIMAX | the big heavy (its charge costs 2 hearts) + rushers, 2 red barrels, cover that breaks | bait both barrels, then finish him |

## Rules
- Cover: crates, a car, kiosks, a sign, doors. Every cover stops bullets from BOTH sides and breaks under fire (crate 4 hits, car 9, kiosk 7):
  debris flies, some hold a reward (gold crates always do; plain ones a third of the time). A heavy's charge smashes cover in one go.
- Red barrels are hazards: a bullet or a heavy's charge sets them off (blast hurts foes, and Kai within 70 units).
- Gunner: hides behind the nearest cover on Kai's far side, pops up every ~2 s (0.5 s red glow) to fire a 2-round burst. While hidden he only takes hits
  from above (Kai on a platform) or from his own side (flanked). Cover gone or 14 s up: he leaves cover and charges (no enemy lives > 25 s).
- Rusher: sprints at Kai, 0.4 s red crouch at 120 units, lunges 260 units. Jump it, dash through it, or shoot it on the way in.
- Heavy: armoured front (x0.3 damage), walks in, 0.8 s red glow, charges straight; a barrel in the path stuns him 2.4 s (x2 damage); a wall stuns him 1 s; after 15 s every charge ends winded (2 s).
- Scale: one body height per kind (Kai 64, rusher 62, gunner 64, heavy 84, boss heavy 96 units) drawn through the street's single
  world scale; feet on the road line (FL 470). Props use the existing sc-* pictures and the car strip, bottom on the road.
- No captions or chips during play (the engine's ARENA/CHECKPOINT/WARNING notes are muted on this stage); telegraphs are red glows.
- Rooms: each beat is a soft room (the camera holds until its foes are down), a short walk between rooms, one checkpoint at room 4 (it gives a heart back).

## Gates (qa/street2-test.js)
human-style bot clears 60-90%; >= 8 destructibles broken per run; no enemy alive > 25 s after it is seen;
Kai and grounded foes' feet within 6 px of the road line; 0 page errors; ?street2=0 fingerprint identical.

## Feel (worker F2, flag RET.feel, ?feel=0 old): parts/street/streetfeel.js, test qa/streetfeel-test.js
- Run frames follow ground distance (one step = the sheet's foot spread at contact), body bob, dust at each foot contact, lean on start/stop, skid crouch on a hard turn.
- Heights: Kai = rusher = gunner 64, heavy 80 (1.25x), big heavy 90; scale by the visible body. Taxi 160 x 54 (4.5 m), kiosk 86, barrel 34; far-kerb cars 120.
- Bullets and the flash start at the measured muzzle of the drawn frame (Kai and foes); with no foe in the aim cone a ground shot dips onto the crate ahead.
- A `kai-<weapon>/<act>` sheet replaces `kai/<act>` when it exists. Missing art: ART-SLOTS-STREET.md (95 slots, art-slots-street.json).
