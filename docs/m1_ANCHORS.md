# rfC (Milestone 1) — merge anchors

Base: bak/v75.html. Patches in order: pC1.py (embeds m1.js) … (see list at bottom).

## Exact-string replacements (R(old,new))
| # | patch | anchor (old string, exact) | what happens |
|---|---|---|---|
| 1 | pC1.py | `window.__mho={qv:{` | the whole contents of `m1.js` is inserted immediately **before** this string (the test/debug API object). Nothing else in the line changes. |
| 2 | pC1.py | `const nFlags=()=>{const F=flagsR();return(CID==='ath'?ATH_RIVAL_EV:RIVAL_EV).filter(e=>F[e.p]).length};` | `ATH_RIVAL_EV` → `ATH_TRK_EV` (Athens chapter counter fix). |

No HTML/CSS anchors: all DOM (cutscene layer, NEXT pill, mission HP bar, item chip, touch ITEM button `#tW`) and all CSS are created at runtime from m1.js.

## Runtime re-bindings (not text anchors, but they depend on these names/signatures staying the same)
m1.js extends existing module-level function declarations by re-binding them (`fn=(f=>function(...){...f(...)})(fn)`); every
non-M1 call falls straight through to the original:
`qvTick, qvStep, qvEnter, qvTgt, qvLand, qvMove, qvSpawn, qvBrief, qvAfter, qvHud, qvMiniQ, chStep, chEnd, chAbort, npcSay, markLocked, markKnown, storyCheck, roamCam`.
It also appends `'mho_m1'` to the `CK` and `CITYK` arrays (per-slot, per-city save key), adds `QV_GEN.m1` / `QV_D.m1`, and sets
`CITYCFG[*].ch='Chapter'` and `CITYCFG[*].edgeT='EDGE OF THE MAP'` at load (English UI on the district plate / edge warning, per review).
In missions it clamps `FX.uniforms.uBoost/uSpeed`, `hitFx`, `flash` and the `#speedFx` overlay opacity after `roamCam` runs (less chromatic
aberration / streaks during fights), and culls debris pieces (`DEB.list`) and hides goon meshes that come within a few metres of the camera.
If rfA changes `roamCam` internals that is fine; only renaming it (or turning it into a `const`) would break the wrapper.

Globals used read-only (must keep existing): RO, QV, HUB, pl, camera, CB, TOUCH, SET, state, slowmo, shake, flash, fovKick, camSnap, T,
qvGraph/qvNear/qvPath/qvCum/qvAt/qvSnap/qvMk/qvVan-style helpers, qvCrates, qvFail, qvNext, qvRetry, qvPreview, chStart, roamWarp, roamOpen,
addRamp, deckPt, deckY, ALL_DECKS, groundAt, groundY, roamHit, inRiver, kmGeo, kmMat, neonMat, box, vmat, TEAMS, minifig, debris, burst, emit,
studBurst, studGain, hitPop, feed, say, flashHud, itemIcon, avatar, npcAvatar, QAV, PD, flags/flagsR, chapter, nFlags, RIVAL_EV, ATH_TRK_EV, athNF,
RCH, markDone, markTitle, mapIcon, pickAdd, storyShow, store, roamSave/roamStore, districtAt, tb (touch button binder), AU.sfx, fmt, qvKm.

New globals are all prefixed `M1_` (plus `M1`, `window.__m1`).

## Patch list
1. `pC1.py` — embeds `m1.js` (the whole milestone) + the Athens `nFlags` fix. Rebuild: `./reapply.sh pC1.py` → REAPPLY_OK.

Sources: `m1.js` (game code), `m1bot.js` (in-page test bot), `tC.js` (tests), `t165c.js` (= t165.js pointed at /rfC/, assertions unchanged).
