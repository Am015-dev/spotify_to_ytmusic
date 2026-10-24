# Excerpt: Racers power-up use (green) and effect budget
Source: isledecomp/racers@5bb9f13, `LEGORacers/src/race/powerups/racepowerupmanager.cpp`, `RacePowerupManager::UseGreenPowerup` (~l.1770). Licence: LGPL-3.0. Condensed (pool/list plumbing removed); reference only.

```cpp
void UseGreenPowerup(Racer* r, U32 level) {
    if (level == 3) { ActivateWarp(r, 3); return; }      // L3 green = warp portal
    if (25 - m_usedEffectEntityCount >= 3) {             // global budget: 25 effect entities
        action = free turbo action, or ReclaimAction(green...) // oldest/lowest-priority one is recycled
        action->Activate(r, level);                      // level 0..2 sets turbo length
        action->m_level = level;
    }
}
```

## Notes
- Level comes from the white-brick count held when the colour is used (0-3); [../powerup-bricks.md](../powerup-bricks.md) has the table (turbo 1 / 1.5 / 5 s).
- Red/blue use the same shape (`UseRedPowerup` l.1336, `UseBluePowerup` l.1680); player call sites `race/racer/racer.cpp` (~l.1759-1855), `race/playercontrols.cpp` l.426.
- A used action returns to a free list; when the list is empty the manager recycles the least valuable live action (`ReclaimAction`), so spamming never exceeds the budget.
- Our hook point: `src/98z_race_items.js` (item pick/use); there is no level or white-brick state yet.
