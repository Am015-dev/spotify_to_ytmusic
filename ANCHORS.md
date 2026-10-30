# BF (play-test bug fixes) — merge anchors

Patch order: `pBF1.py` (only patch). Rebuild: `./reapply.sh pBF1.py` → `REAPPLY_OK`.

## Exact-string replacements (R(old,new))
| # | patch | anchor (old string, exact, count 1) | what happens |
|---|---|---|---|
| 1 | pBF1.py | `window.__mho={` | the whole of `bf.js` is inserted immediately **before** it. Nothing else changes. |

## Runtime re-bindings (no text anchors; depend on these names staying `function` declarations)
- `roamStep` — wrapped twice: skip the sim while a full-screen overlay is open (BF1); rescue a car stuck inside a building, Frankfurt only (BF3).
- `roamPauseOpen` — hides the GARAGE button while an event/sprint runs (BF2).
- `roamCam` — wraps the already M1-wrapped camera: pulls the camera out of buildings, Frankfurt only (BF5).
- one capture-phase `keydown` listener: Escape on roam-race results → `enterRoam(RO.lastMark)` (BF4).
- one `<style>` element appended to `<head>` (BF6, `@media (max-height:500px|520px)` rules for `#m1Hp`, `#roamPlate`).

Globals used read-only: `state, RO, pl, AU, $, CID, M1, camera, camSnap, roamHit, rfSnap, groundAt, say, enterRoam`.
New globals: `BF_hold, BF_inT, BF_rescue`.
