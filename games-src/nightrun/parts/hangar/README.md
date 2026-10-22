# parts/hangar

Build-order parts (`build.py` finds them by name, order is in `build.py`). Files:

- `classes.js`: pilot classes picked before a run
- `garage.js`: garage: permanent unlocks bought with banked Neon (saved in
- `meta.js`: meta game: LOADOUT (equip / unequip / sell perks, limited sl
- `paths.js`: build paths, synergies, set bonuses, heat load and boss coun
- `perks2.js`: fifteen more garage perks: STARTING KITS. An equipped kit gi
- `shop.js`: Neon + pit stop: after every district a 10 s shop, upgrades
- `strategy.js`: STRATEGY: build paths, synergies, a heat budget, slot limits
- `up2.js`: more to buy: 14 new pit-stop upgrades (8 in the pool from th
- `upgrades.js`: much more to buy: permanent TUNE perks in the garage (levels

Hook homes defined here (`hookable`): SH.volley.
Hook layers registered here (`HOOK.name(prev=>...)` / `DRAW.extra`): PW.give: upgrades; SH.volley: up2,upgrades; drawPickups (DRAW.extra): up2; drawPlayer: up2; hurt: classes,up2,upgrades.
