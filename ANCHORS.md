# ANCHORS (LK)
| patch | anchor (exact string, count) | change |
|---|---|---|
| pLK1.py | `window.__mho={` (1) | inserts `lk.js` just before it |

lk.js wraps these functions without editing them (they are function declarations, so reassigning them works): `applyMood`, `applyQuality`, `hubEnter`, `hubCullStep`, `hubTrafficStep`, `dresStep`, `waterMat`, `emit`, `debris`, `explode`; it also wraps the `store.set` method.
Runtime edits: `skyMat` and the ENVSC sky fragment shader (3 string replaces, with a `uSunD` uniform added to `SKYU`), `THREE.MeshStandardMaterial.prototype.onBeforeCompile`, and the day entries in `MOODS`/`ATHM` (brick, athens, athnoon, day), which it changes in place.
Globals use the `LK_`/`LK` prefix; the test API is `window.__lk`.
