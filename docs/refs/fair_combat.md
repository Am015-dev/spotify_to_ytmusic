# Fair race combat: how arcade racers keep contact fun and fair (lane H, 2026-10-17)

| Game | Contact that is NOT a takedown | What a takedown needs | After a takedown | Anti-abuse |
|---|---|---|---|---|
| Burnout 3 / Paradise | Side bumps and trading paint just shove; both cars keep racing | Speed + angle: slam a rival into a wall/traffic, or ram while boosting | Victim respawns on the road in ~2-3 s ("Crash"), slightly behind; the attacker gets boost (meter refill) | Takedown cam + boost reward rewards the attacker; rival AI rubber-bands back; revenge targets |
| Mario Kart 8 | Bumps are nudges scaled by kart weight (heavy shoves light) | Items (shells, star, bullet), not bumping | Spin-out ~1 s, then brief invulnerability (blinking) | Invulnerability blink; item odds favour the back of the pack |
| Crash Team Racing | Bumping is minor | Weapons / mask (invincibility) | Short spin, quick restart; no long out-time | Shield/mask; rubber-band AI |
| LEGO 2K Drive | Mass-based shoves: big vehicles push small ones, rivals barely budge from side taps | Boost into a rival or hit with an item; rivals "brick-burst" | Rivals rebuild almost instantly on the racing line and catch up | Rebuild + catch-up keeps rivals in the race; smashing is a reward (boost), never a way to park a rival |

## Rules taken for ?fair2 (src/98fc_fair2.js)
1. Rivals are heavy: side/rear contact is one shove event (≤ 4 % speed, 0.45 s cooldown), never the old per-frame 8 % cut. The player is the one pushed out (2K mass shove).
2. A takedown needs ≥ 80 km/h AND boost with closing speed ≥ 3 m/s, or a ≥ 12 m/s closing hit (Burnout). Reward: brick burst, +30 boost, KO feed, combo +3.
3. After a takedown the rival is out 1.2 s, then back on its racing line at 85 % of its old speed, blinking/ghosted 1.5 s, with ×1.2 catch-up for 3 s (2K rebuild + Mario Kart blink). Cooldown 8 s on the same rival (no chain-wrecks).
4. Blocking does not hold: a rival with a slower car on its line steers to the open side; after ~0.7 s of being blocked it ghosts through (1 s).
5. Same rules for rivals hitting you: a shove event, capped, never a wreck. Modes can opt out (C.fair2=false / sp.fair2=false), e.g. a demolition variant.
