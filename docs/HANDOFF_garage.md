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

## pGAR2 state (2026-10-06): prototype works in dev/, NOT gated
`gar2.js` + `pGAR2.py`. Apply after pGAR1: `./reapply.sh pGAR1.py pGAR2.py`.
- `GAR_gt(o)`: new 8-wide supercar builder (curved hood with stripes, raked screen, `drvL` low driver; `bubble`/`big` wing options).
- `GAR_SETS`: rod (COMMON, owned), ebbel (RARE, 3000 studs), posei (EPIC, 15 ★), gold (LEGENDARY, 30 ★). Each has `car`/`off`/`boat` builders and `load` (CR_LOAD names, stats and perks).
- Selecting a set (`GAR_select`):
  - saves the old set's street bricks to `mho_gar.br[old]`;
  - loads the new set's bricks into GB.d and `mho_build`;
  - calls `GAR_load()`, which copies the set's stats into `CR_LOAD`.
- `CR_attachV` is wrapped for the player (no team): the 4×4 and boat come from the selected set, with upgrades, cached under key `gar|form|set+ups+fig`.
- Upgrades (`mho_gar.up[set]={sp,ex,wh,bo}`, levels 0–3, 600/1200/2400 studs):
  - `GAR_apply(bricks,u,form)` adds parts using a heightmap (`GAR_hm`).
  - Wheels become `wLc`/`wLg`/`wLr` (same radius, recoloured rims via the `CR_wheel` wrapper).
  - `gbTeam` wrapper: the street car gets the parts outside builder mode, plus the stat multipliers.
- Garage tab `RIDES` (first tab): set cards with rarity colours and buy/lock, form preview buttons with stat bars, and upgrade rows with ●○○ pips.
- Tests: `t/veh.js` (real taps: buy, select, 7 upgrades, previews, save & drive, world shots); `t/rv.js ucar|ufo|ubo|gt1|gt2` (max-upgrade close-ups).

Last check: zero errors. Shots looked right: all upgrades visible on street, 4×4 and boat. Red L3 rims are not yet re-checked after the last edit.

TODO before review:
1. Re-run `t/veh.js` and `t/rv.js` after the last edits (rims red, rockets x0-1, GAR_UPC fix).
2. Measure the tyre gap with `tools/cars/tyre3.js` on Poseidon GT and the upgraded rims.
3. Run tPlay on the split build with a non-default set selected (seed `mho_gar` + `mho_build`).
4. Check that race balance isn't broken: tiers give at most +8 % top on top of upgrades of up to +6 %. Ask the cars worker (session_012oDcg1MhwXUU7Y9ufgfS4k) to run `raceBal3.js` with gold + max upgrades.
5. Make sure the phone garage tabs fit (6 tabs, "RIDES" is short).

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

## Notes from other workers
- Art (pART8, not deployed yet) adds shadow-twin child meshes (`userData.a8s=1`, locked ShaderMaterial) under every mesh of `pl` and of ships, every 500 ms. Garage code that traverses car meshes to recolour, swap materials, count parts or measure bounds must skip children with `userData.a8s`. The current gar1/gar2 code only toggles visibility on the `gbM`/`gbV` groups, which is fine.
- Cars worker: v86y wraps `CR_car` (drv → drvL) and `CR_rivB` (drvL → drvLR). The reviewer flagged the rival coupé glass as fully transparent, which is cars scope.
- Live is v86y (99f6baf) = v86x + pGAR1. Rebase pGAR2 on it: base.html = the live index.html; apply only pGAR2.py, because pGAR1 is already in live.

## State 2026-10-06 21:00 (session_01LEhhDZWZUb5KQF9GsjoFVJ)
- **pGAR1b = v87a** (UPDATES screen + credits "Base assets: Kenney (CC0)"): reviewer PASS a240224. Split build on live v87 0e043bc at `out/v87a/` (commit 2cf0f61), sent to the coordinator to deploy (workers never run deploy.sh now). Files: `upd0.js` (OD_CHANGELOG, inserted right after `<script type="module">\n`), `upd1.js` (UI), `pGAR1b.py`. Test: `t/upd.js`.
- **pGAR2 = v87b** stacks on pGAR1b: `./reapply.sh pGAR1b.py pGAR2.py` (pGAR2 prepends its v87b changelog entry). Credits moved out of pGAR2 into pGAR1b.
- Done for pGAR2: gate shots of all 4 sets × 3 forms, stock + max, garage + world (`t/gate.js`, shots/g2 on v87b); tyre gap 0.018–0.029 m on posei/gold/ebbel max (`t/tyreG.js`, GSET=id:spexwhbo); race balance by cars worker: gold+max 3.3 % faster than rod, within caps; garage tabs fit on the phone.
- **OPEN BUG (blocks pGAR2 review):** tPlay Athens with gold **+ max upgrades (3333)** → player bbox 153 m, camera rolls upside down, start shot in an empty field, ath walls 2.74/min (`qa_2/`). Same flow with gold:0000 and rod:0000 → PASS, bbox 4.5 m, 0 walls. So one upgrade part breaks physics/bounds. Next: run `t/tPlayG.js` with GSET=gold:3000 / 0300 / 0030 / 0003 (NOROT=1 CITIES=ath MIN=1.5), and dump per-child bbox of `__mho.pl.mesh` to find the huge mesh (suspect `rocket`/`sidep`/`stack` at L3, or a part whose GB_PC size is missing).
- tPlay harness notes: fresh-save Frankfurt flow is mid-mission, pause-menu garage is blocked → `t/tPlayG.js` seeds via the title `#gbMenuBtn` garage and needs CITIES=ath (CONTINUE keeps the save) and NOROT=1 (rotation sub-test crashes when Athens is first).
- Baseline plain v87 tPlay also FAILs 4 (fra stuck 3.4 %, DRIFT hidden after rotation, 10 px "· 2 goons" text, wall hits) — `docs/shots/v87a/tPlay_v87_baseline.json`.
- Queued after pGAR2 (coordinator): SMASH! popup must not cover the tutorial card; coupé glass ≈70 % opacity.
- Pending replies I could not send (session_send blocked by permission policy): cars worker session_016fYfshnaT9fYnhpkcfA5WB asked whether garage wraps the car mesh root — answer: no, pGAR2 only changes brick lists (gbTeam / player-only CR_attachV) and rim geometry; it multiplies t.top/acc/han/hull ≤ +6 % per upgrade stat.
