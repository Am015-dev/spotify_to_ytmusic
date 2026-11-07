# Sunglaze: wired round 3 (W353)

## 3D models (2 owner files): 2 of 2 used
sun (first-player token) and plate (dished kiln plates): `glbLoad` in three3d.js, behind the quality toggle, brass token and clay kilns as the fallback.

## 2D files
| file | slot |
|---|---|
| back-default, back-guild-seal, back-lamplight | NEW: painted tile back beside "Clay sack N" in the info line; guild-seal and lamplight once unlocked |
| table-prism-light, table-sun-palace, table-unmarked-slate | already wired (media.js, name built as `table-<unlock>`; the asset check missed them) |

## Superseded
ui-button-go, ui-button-power (the `-c` versions are used), ui-iconbtn-k, ui-node-*-k (no -k family loader), ui-rack-frame (ui-rack-frame-c is used).

## Still unused
None. Not shown in a screenshot: the clay-sack line (hidden in the dock layout); the badge is present in the DOM only where the info line is shown.
