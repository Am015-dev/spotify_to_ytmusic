# Garage worker handoff (alex/od-garage, /home/user/odg)

## Setup
1. `git worktree add /home/user/odg origin/alex/od-garage`.
2. Rebuild `base.html` from the live `index.html`: take the text from `<title>Mainhattan Overdrive</title>` up to `</body>`. Live is already split, so also copy `km.js` from live.
3. Start the server: `bash setup.sh` (port 8766).
4. Patches go in order: `./reapply.sh pGAR1.py [pGAR2.py]`. Each one inserts a module (gar1.js, gar2.js) once, before `window.__mho={`.
5. Dev copy: `dev/` (symlinks to node_modules and km.js) at http://127.0.0.1:8766/dev/local_dbg.html. Use it while a tPlay run is using the root pages.

Test scripts (in t/):
- `pi.js <prefix>`: player-car close-ups.
- `gar.js <prefix>`: garage DRIVER tab by touch, then the car.
- `rv.js <prefix> id:i`: rival and form close-ups through `__gar.grp`.
- `pc.js`: the piece catalogue.

## pGAR1 (driver), done
`gar1.js`:
- `GAR_fig` is the raw minifig.
- `GB_figGeo` keeps its old contract.
- The `drv`/`drvR` piece is now the seat plus the driver plus its own steering wheel. `stw` is now only a column stub.
- `GAR_riv` gives rivals varied faces.
- `GB_portrait` draws the new options.
- The DRIVER tab gets 8 presets.
- `GAR_figSet` invalidates `CR_VC.off` and `CR_VC.boat` so the 4×4 and boat get the new driver.

## pGAR2 plan (vehicles + visible upgrades)
**Vehicle sets** (each = street + off-road + boat, swapped by terrain like 2K Drive). Stored in the per-slot `mho_gar`: `{sel, own:[], up:{id:{sp,ex,wh,bo}}, bricks:{id:[...]}}`.
- COMMON `rod`: the existing HOT ROD / GUACAMONSTER / AEGEAN. Owned.
- RARE `ebbel`, "Ebbelwoi Express": `CR_car` coupe in green and white, `CR_buggy`, speed boat. Costs studs.
- EPIC `posei`, "Poseidon GT": new `GAR_gt` Speed-Champions supercar (low, wedge nose, curved slopes, `ws6`, wing), blue and white, plus `CR_buggy` and the catamaran. Unlocked by stars.
- LEGENDARY `gold`, "Goldrausch": `GAR_gt` hypercar in black and gold with a bubble canopy, plus monster and airboat. Unlocked by the SKYCUP flag or stars.

**Selecting a set:**
- The current street bricks are saved under the old set, and the new set's saved or default bricks load into `mho_build`.
- `CR_LOAD.{car,4x4,boat}` get the set's names, stats and perks.
- Wrap `CR_attachV` for the player: `team` has no rival id, so use the set's off-road and boat bricks, with the cache key = set + upgrades.

**Upgrades:** 4 slots × 3 levels, paid in studs (`season().cr`), and visible on all 3 forms through per-form anchors.

| Slot | Level 1 | Level 2 | Level 3 | Stat per level |
|---|---|---|---|---|
| SPOILER | `spoiler` | `wing` | wing + fins | han +2/4/6 % |
| EXHAUSTS | `pipes` | 2× chrome `stack` | stacks + flame | acc +2/4/6 % |
| WHEELS | chrome rims | gold rims | gold + red pin | acc and han +1/2/3 % |
| BOOSTER | `nitro` | 2× `jet` | 2× `rocket` | top +2/4/6 % |

- Wheel rims are recoloured clones of the `CR_wheel` geometry at the same radius, so the tyre gap doesn't change.
- Stats: wrap `gbTeam` (multiply). The street upgrades go into `t.gbB` only outside builder mode (`!GB_.bk`), because brick indices are used for picking.

**Garage:** a new VEHICLES tab:
- set cards with a rarity colour, lock or buy, and stat bars per form;
- form preview buttons (street / 4×4 / boat);
- upgrade rows with level pips and a cost.
