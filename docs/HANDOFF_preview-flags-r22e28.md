# HANDOFF preview-flags-r22e28
1. `tools/build.sh <ver> --preview` -> out/<ver>-preview/ with `OD_PREVIEW=true` (src/10_core.js `OD_FLAG`); prints the flags forced ON: cl.core cl.studs gloss td (`?name=0` / `?cl=off` still win). New default-OFF flags must read through `OD_FLAG('name')`.
2. docs/FLAGS.md = full table. DELETED in code: ?clb (+GO clb/climb), ?t9e, ?bx, ?t8f, ?sfj. ON-candidates needing review (not flipped): gloss, cl=core, cl=studs, td. DELETE pending (own lane, multi-module/QTC, by 2026-10-23): soab, t6m, r17pose/r17m, bhs.
3. Coordinator commands: `tools/build.sh <ver>` (live) and `tools/build.sh <ver> --preview` (Beta-preview from out/<ver>-preview/, same chunk list as the Beta artifact: km.js, models.js, tune.json, models/{lx,as,xf,qa}.js, xc/*.js).
4. Gates (rebuilt after rebase onto 67f8bd2, phone profile): unit 0 FAIL; TAG=life1,xf1,terrain,why fra+ath 76/76; preview build TAG=life1 fra+ath 7/7, 0 page errors.
5. Left: DELETE-pending flags (soab, t6m, r17pose/r17m, bhs) in docs/FLAGS.md; gloss/cl=core/cl=studs/td need a review before flipping ON.
