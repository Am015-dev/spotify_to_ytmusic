# Racers: power-up bricks
Pins: [../sources/racers.md](../sources/racers.md). Code under `LEGORacers/src/race/powerups/`.

## Facts
- 4 colour bricks, you hold ONE (`ColorBrick`, `Racer::m_heldPowerupColor`): red weapon, yellow hazard, blue shield, green turbo. A different colour swaps it.
- White bricks stack 0-3 and set the power level of the next use; all are spent on that use (`WhiteBrick`). A dropped white goes home after 10 s.
- Colour bricks respawn after 3 s (`PickupBrick`); track data can override per brick.
- Level table (`RacePowerupManager::UseRedPowerup`, `UseYellowPowerup`...):

| Colour | L0 | L1 | L2 | L3 |
|---|---|---|---|---|
| Red | cannonball | grappling hook | lightning | homing missiles |
| Yellow | oil | dynamite | magnet | curse |
| Blue | shield 4 s | 6 s | 8 s | 10 s (+1 s fade) |
| Green | turbo 1 s | 1.5 s | 5 s | warp portal |

- Turbo: thrust x8 (54 -> 432, `drivecontroller.cpp`), max speed 120 -> 176 (x1.47), grip x1.5 (`RacerPhysics::StartBoost`).
- Budget 25 live effects; AI won't fire at >= 20.

## What we have
- `src/98z_race_items.js`: R15_boxes/R15_boxTick/R15_pop. Floating "?" LEGO bricks, one instanced mesh, 4 across, row every ~650 m, 2.5 s respawn. 6 items: missile, turbo, shield, web, mines, lightning (random).
- Boost: `src/98k_boost2k.js` (drift-to-boost).

## Gap
No colour choice, no white stacking, no levels. Plan: [../../DESIGN_racers_rebuild.md](../../DESIGN_racers_rebuild.md) step 1 (red=missile, yellow=mines/web, blue=shield, green=turbo; GO: green + 2 white = turbo 5 s +-0.1).
Excerpt (LGPL, short): [code/powerup-stacking.md](code/powerup-stacking.md)
