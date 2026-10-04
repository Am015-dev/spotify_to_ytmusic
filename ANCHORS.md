# OG (open-world density) — merge anchors

Patch order (v81 base, with the AU module): `./reapply.sh pAU1.py pAU2.py pOG1.py` → `REAPPLY_OK`. OG alone still works: `./reapply.sh pOG1.py`.

AU on v81: the live base already embeds an older AU module, so `pAU1.py` now replaces that exact block (`docs/modules/au.js`) with `au.js` and only falls back to inserting before `window.__mho={` on bases without it. `pAU2.py` skips text swaps the base already carries.

## Exact-string replacements
| # | patch | anchor (old string, exact, count 1) | what happens |
|---|---|---|---|
| 1 | pOG1.py | `window.__mho={` | the whole of `og.js` is inserted immediately **before** it. Nothing else changes. |

No HTML/CSS anchors: all DOM (`#ogHud`, `#ogRes`, `#ogArea`, `#ogMapP` inside `#roamMap`, `#ogCol`) and CSS (`#ogCss`) are created at runtime.

## Runtime re-bindings (depend on these names staying `function` declarations)
`roamStep` (OG_tick after each step), `roamLanded` (jump landing for Stunt Jump / Long Jump), `drawRoamMap` (map dots, area % labels, completion panel).
Also: `CK.push('mho_og')`, `CITYK.push('mho_og')` (per-slot, per-city save `mho_og@N` / `mho_og.ath@N`), one `keydown` listener (Y = retry, U = collection, Esc closes it).
Extra entries are pushed into `RO.ramps` (event ramps, removed on event end; roof ramps + flat roof decks, flagged `og:1`).

Globals read: RO, HUB, QV, qvGraph, qvNear, groundY, groundAt, roamHit, inRiver, districtAt, athIn, RW, ATH_DIST, ATHD, CID, SLOT, GARAGES, addRamp, neonMat, box,
burst, SPARK, debris, studBurst, say, hitPop, AU.sfx, store, season/saveSeason, markDone, gbOwn, GB_PATS, state, camSnap, fovKick, pl, clamp, V3, DPR2, $.
New globals: `OG`, `OG_*`, `window.__og` (test API).
