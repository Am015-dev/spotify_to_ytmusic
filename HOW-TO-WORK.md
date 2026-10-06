# How to work on Mainhattan Overdrive (src/ modules, since v87a)

The game source is `src/` on **alex/od-src** (27 modules, ≤ 200 KB each). The 3.7 MB single file is gone as a working copy.
Read `CLAUDE.md`, then `src/MAP.md`, then ONLY the modules of your area. Never read the data files (02, 50, 52, assets/).

## Loop
1. `git checkout alex/od-src && git pull` (or branch from it: `alex/od-<you>`). `tools/verify_live.sh` must say `LIVE_MATCH`
   (src = the live game byte for byte). If it says DIFFERS, live moved: ask the coordinator to refresh src (see below).
2. Edit `src/<module>` directly (Edit tool, exact strings). New code: in your area's module, or a new `src/NN_<area>_<what>.js` added to `src/ORDER` before `99_api.js`.
   Keep the old rules: prefix new globals with your tag, wrap functions instead of rewriting them.
3. `tools/build.sh <ver> --local` → `BUILD_OK`, writes `out/<ver>/overdrive.html + km.js + index.html`, and `./overdrive.html`, `local.html`,
   `local_dbg.html`, `chk.mjs`, `km.js` for the old test tools (`./setup.sh` once for the :8766 server; serve the repo root).
4. Test: tPlay/g25-style real-input tests on `local_dbg.html` (add `?fast=1` for the fast test mode, see below); look at the shots.
5. Commit **src/ changes** (+ your test/shot files). Diffs are now readable per module: `git diff src/`.
6. Reviewer gate as in CLAUDE.md, then add the `OD_CHANGELOG` entry (top of `src/10_core.js`), rebuild, commit `out/<ver>/`
   (`git add -f out/<ver>`), and send the coordinator `DEPLOY <branch> <commit> out/<ver> <msg>`. deploy.sh is unchanged.

## Old anchor patches (pXXX.py) still work
`python3 tools/patch_to_src.py path/to/pXXX.py [more…]` runs the patch on the text assembled from src/ and writes each change back
into the module that holds the anchor (prints `R -> <module>` per anchor, `PATCH_OK`). Files the patch reads (art.js…) resolve from the
patch's own folder. `--dry` checks only; `--reverse` takes a patch out. Proven byte-identical to reapply.sh on pCAR24b (both ways), pART8, pART7.
Prefer editing src/ directly for new work.

## Parallel workers
Two workers collide only if they touch the same module. Merge = ordinary `git merge` of src/ files (line-based, small files), then
`tools/build.sh`. Rebase on alex/od-src often.

## Refreshing src/ after someone deploys from the old pipeline
`python3 tools/split_src.py <live overdrive.html body> <live km.js> src` re-splits live by the module markers in the script, then
`tools/verify_live.sh` must print `LIVE_MATCH`. (Get the body with: index.html minus the head up to `<body>` and the trailing `</body></html>`.)

## Fast test mode
`local_dbg.html?fast=1` (test-only; no effect without the flag): low-res render (426×196), short draw distance, no shadows/particles drawing,
fixed 1/60 s simulation step per frame. Gameplay results are unchanged; see `docs/FAST-MODE.md` for timings.
