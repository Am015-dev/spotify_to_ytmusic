# ATC (Athens campaign) — merge anchors

Base: `base.html` (live, m1.js already embedded). Patches in order: `pATC1.py`.

## Exact-string replacements (R(old,new))
| # | patch | anchor (old string, exact) | what happens |
|---|---|---|---|
| 1 | pATC1.py | `window.__mho={athPts` | the whole of `atc.js` is inserted immediately **before** this string (after m1.js, before the test/debug API object). Nothing else changes. |

No HTML/CSS anchors.

## Runtime re-bindings (not text anchors; depend on these names staying `function`/`let` bindings)
atc.js wraps (`fn=(f=>function(...){...f(...)})(fn)`), falling straight through for non-ATC missions:
`chStart, chEnd, qvFail, hitPop, qvTgt, qvEnter, qvTick` (base) and `M1_goon, M1_next, M1_nextGo` (m1.js).
It adds entries to m1.js objects: `M1_DEF.atc_*` (12 missions), `M1_SC.atc_*` (scenes), `M1_RADIO.atc_*`, `M1_WHO` (ELENI, YIAYIA, MARIA,
PAPPAS, LAMBROU, DRAKOS, SPIROS), `M1_GK.moped`; appends `'mho_atc'` to `CK` and `CITYK` (per-slot, per-city save key).

Read-only globals used: WP, RW, athDistAt, ATH_DIST, ATHD, athDistGo, athDistPick, HUB.gates, QV, qvGraph, qvSnap, qvAt, qvPreview, qvMk,
M1_* helpers (M1_P, M1_path, M1_car, M1_obj, M1_put, M1_scene, M1_radio, M1_av, M1_rivalInit, M1_box, M1_tw, M1_st, M1_save), RO, SLOT, store,
flags, studGain, say, box, minifig, neonMat, districtAt, CID, state.

New globals: all prefixed `ATC_` (plus `ATC`, `window.__atc`, `__mho.atc`).
