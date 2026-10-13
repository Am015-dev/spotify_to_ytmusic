# Garage like LEGO 2K Drive: plan (garage worker 4, 2026-10-07)

Alex (2026-10-07): "Garage builder is bad, not like 2K Drive. Paint does not work. Building my own vehicle starting from a basic wireframe does not exist. 2K Drive has groups of vehicles with perks and improvements, and a profile with level, perks and car collection."

## What 2K Drive actually does (each fact checked against a source; the full sheet with URLs is in the worker report)
- **Build:** you pick a type (Street, Off-Road, Water), then one of 5 preset **chassis** per type. Street and off-road chassis come with 4 tyres; a boat starts with a hull. The Speed Champions chassis is **8 studs wide**. The size cap is about 20 W × 30 L × 12 H studs, with about 350 parts. A "Build Limit" bar fills up. You can swap wheels, move the driver seat, use a mirror tool, and follow guided builds. *(official manual, GamerMatters, GTPlanet, DualShockers)*
- **Body Shop modes:** Build · Paint (flat, metallic, glow, chrome) · Group · Customize (stickers, flair, wheels, horn). *(GTPlanet, GamertagZero)*
- **Vehicles:** every loadout is street + off-road + boat and transforms by surface. Rarity tiers are **Neat · Cool · Awesome · Super Awesome**, and they apply to vehicles, drivers, stickers and brick packs. Stats are Top Speed, Acceleration, Handling, Health, Melee and Weight. **6 weight classes:** Super Light, Light, Medium, Heavy, Super Heavy, Massive; more bricks means heavier. *(2K newsroom, DualShockers, Brickipedia)*
- **Perks:** passive buffs, some with a trade-off (e.g. Sacrificial Boosting, Wheel of Peace). **1 slot at Class C, 2 at B, 3 at A.** They can be swapped any time outside a race and are unlocked by quests and secrets. *(official manual, GameRant)*
- **Progression:** XP raises the Performance Class from C to B to A, and each class adds boost moves. Checkered flags open regions. Brickbux buy cars at Unkie's. The collection holds vehicles, drivers, flair, brick packs, sounds and stickers. *(official manual)* The profile screen layout is UNVERIFIED.

## What we already have (src/)
| 2K feature | ours | gap |
|---|---|---|
| type transform | `GAR_SETS` street + 4×4 + boat swap by terrain (98) | none |
| rarity | COMMON / RARE / EPIC / LEGENDARY cards (98 `GAR_TIER`) | rename to 2K names; vehicle cards don't show perks |
| upgrades | 4 slots × 3 levels, visible on all forms (98) | none |
| perks + slots | `PERKS` (12) + `perkSlots()` 1/2/3 at driver level 1/8/16 (10); the picker sits only in the roam pause card (71) | not in the garage; no trade-off perks |
| level / class | `lvlOf` driver level 1–30, Class B at 10, Class A at 20 (41) | no screen shows it |
| paint | **fixed in v87g**: PAINT recolours the bricks on all 3 forms, saved per set | no finishes (metallic/chrome) |
| builder | BRICKS tab (92/94): snap, mirror, undo, paint per part; BASE = blank baseplate | no chassis choice; no build limit or weight class |
| collection / profile | none | build it |

## Slices (each one ships on its own: quick review, then DEPLOY; phone 852×393 first, 12 px text, nothing added to the driving HUD)
1. **v87g Paint fix** (done; awaiting review).
2. **Vehicle groups + perks in the garage:** rename the RIDES tiers to Neat / Cool / Awesome / Super Awesome. Each set card shows its group (Street racer / Muscle / Speed Champion / Hyper), its weight class (from the brick count: Super Light…Massive) and its built-in set perk. Add a **PERKS row** in RIDES: slots shown as ▢▢▢ (locked slots say "Class B" / "Class A"), tap to equip from the unlocked `PERKS` (same `mho_perks` store as the pause card). Add 2 trade-off perks in 2K style: *Glass Cannon* (+4 % top, −20 % hull) and *Tank Mode* (+30 % hull, −3 % top), both clamped within the race-balance caps.
3. **PROFILE screen** (title-menu button + garage tab): driver minifig portrait, **driver level and XP bar**, Class C/B/A badge with what the next class unlocks, equipped and locked perks (each with how to unlock it), and the **collection grid**: vehicles 4/4, drivers 8, liveries, horns, brick packs n/12, golden bricks, with Neat…Super Awesome colours and counts. Everything is read from the existing stores; no new progression rules.
4. **Build-your-own from a chassis** (the biggest slice; split it if needed):
   - (a) The BRICKS tab gets **NEW BUILD**, which picks a type (Street, Off-Road, Water), then one of 3 chassis frames: 8-wide Speed Champions (`T6x16`-class plate, `wL` × 4, `drvL` seat), 6-wide classic, and off-road `wXL`. The boat starts from a hull. You start with a wireframe-looking bare frame (tyres, seat and axle only).
   - (b) Snap real-proportion parts onto it (stud 8 mm, plate 3.2 mm, brick 9.6 mm; curved slopes, arches, wedges, windscreens), with mirror on by default and the existing catalogue grouped by category.
   - (c) A **Build Limit** bar (350 parts) and a live weight class plus stat bars.
   - (d) Paint per part (exists) plus a "paint the whole group" brush, with flat / metallic / chrome finishes.
   - (e) The custom build saves as a 5th vehicle in RIDES, called "MY BUILD" (Neat).
   - Gate: the tyre-to-road gap is ≤ 0.05 m on the custom car, plus tPlay on it.

Out of scope for now: stickers and flair, online sharing, Brickbux shop prices (we use studs).
