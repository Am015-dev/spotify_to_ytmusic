# R2 handoff (garage Body Shop shell), 2026-10-08

## Base and branch
- Branch `alex/od-r2` = merge of `alex/od-bug23` (live v88a src; `tools/verify_live.sh` → LIVE_MATCH 010e09f6 before my changes) + pro22 docs.
- Draft PR #65 (base `alex/od-bug23`; brave-carson has no common history). Not deployed; no OD_CHANGELOG entry yet.

## Done (all in NEW `src/98u_garage_shell.js`, listed in `src/ORDER` after `98m_music.js`; no other module edited)
- One header `#r2H`: red GARAGE ribbon, set name + rarity, brick bar n/120, weight badge, studs, UNDO/REDO (build only), SAVE & DRIVE (`#gbSave` moved), BACK (`#gbBack` moved).
- 5-mode rail `#r2R` (RIDES/BUILD/PAINT/PERKS/DRIVER). Mode comes from old state (`R2_cur`: GB_.bk → build/bricks; tab veh → rides or perks via R2.pk; parts/horn → build/kits|horn). `R2_go(m,sub)` switches (GB_exit without its double gbRender via R2.skip).
- Context bar `#r2C` ≤ 6 tiles: RIDES = proxies of the g9 type/sort/filter buttons; PERKS = 3 slot tiles; PAINT = GLOSS/MATTE/METAL/CHROME/PEARL + STOCK; DRIVER = section jumps; BUILD kits/horn = BRICKS/KITS/HORN.
- BUILD/bricks: `#gbBkP` becomes the bar: [CATEGORY ▾][part strip][COLOUR][SELECT][MIRROR][⋯ MORE]; categories (+ Kits, Horn), colours, MORE (new build, paint body, paint one, delete, turn, base, clear, 4 templates) are pop-ups. Old toolbar `#gbBkT` hidden, its buttons are clicked as proxies.
- Side panel = old `.gbp` on the right (no footer). RIDES/PERKS split of the veh tab by `data-r2` tags in `R2_post`.
- Pictures + lock overlay: kits (3D via `kitParts` on GS.th renderer, `R2_kitTh`), driver parts (`GB_portrait`), liveries (`liveryPat` 2D), horns (emoji).
- Paint finishes: cached clones of GB_MAT (`R2_mat`), saved per set as `mho_gar.pa[set].fin` (GP_save), applied in garage and every 0.5 s on `pl.mesh` while driving (wheels skipped).
- Camera: `R2_frame` sets view offset + zoom so the car sits in the free area; `G8_band` overridden.
- One tile style (white, black outline, italic 900, yellow = on) on all garage buttons.
- Test API `window.__r2` (mode, go, fin, gbFin, plFin, area, kitTh).

## Test results so far (`t4/r2shell.js`, 852×393 touch, local_dbg.html; shots in scratch only, not committed)
- No overlaps header/rail/panel/context in any mode; no text < 12 px except part-strip labels hidden by font-size 0 on 3D-thumbnail tiles (audit counts them: give the labels display:none instead).
- Header buttons were 40 px tall → fixed to 44 px in commit after 3c97790 (not re-tested).
- Finishes switch correctly (gbFin matte/metal/chrome/pearl/gloss).
- **BUG: placing a part by real taps failed (PLACED 0, 45→45)**. Likely the tap points from `__gb.scr` hit the panel/rail area or the view offset/zoom changes picking; check `GB_pick` with the R2 view offset (zoom must stay 1 in bk mode) and that held-part bar/popups don't eat the tap.
- Not yet looked at: m2–m6 shots; DRIVER, back-to-rides, SAVE close, iframe, PC 1280×720.

## Todo
1. Fix placing bug; re-run `node t4/r2shell.js http://127.0.0.1:8766/local_dbg.html <out>` (after `tools/build.sh r2a --local`; server `./setup.sh` or `python3 -m http.server 8766`); LOOK at every shot.
2. PC run: `node t4/r2shell.js <url> <out> 1280 720`; IFRAME=1 run.
3. Garage → SAVE & DRIVE → short Frankfurt drive (tPlay, alex/od-qa `tools/tPlay.js`), tyre gap ≤ 0.05 m, no console errors; start-screen shot.
4. REVIEW to session_01Y6FYerWwxv43FuKUcaUT4v with shots (5 modes, build+parts list, paint, locked part, start, Frankfurt drive).
5. After PASS: merge CURRENT live (R1 may ship v88b), OD_CHANGELOG entry (next letter), `tools/build.sh <ver>`, copy tune.json + music/*.mp3, commit out/<ver>, send coordinator DEPLOY.

## Update 08:30
- Merged v88b (R1, live 887c4f7): verify_live = live + only 98u. R1 stat chips (#gbStats) moved to the top of the side panel, shown in RIDES/PERKS; header weight = R1_weight.
- Placing works by real taps (test bug: send touchStart+touchEnd together with Promise.all; the page runs ~0.2–1 fps here).
- **Test env facts:** the garage redraws only every ~5 s on this box, and NEVER with ?fast=1 (virtual rAF) → shots need ≥ 8 s waits, no fast mode (SW env in t4/r2shell.js). Kit thumbnails take seconds each here.
- Finishes verified visually (t4/r2fin.js, 30 s waits): gloss/matte/metal/chrome/pearl differ.
- Next: s4 full tour (non-fast) → t4/r2drive.js (PAINT chrome → SAVE & DRIVE → Frankfurt, tyre gap) → PC 1280×720 → REVIEW.

## REVIEW sent (08:25, coordinator asked to send with what exists, context 331k)
- Shots: docs/shots/r2/ (852×393 touch run s3 = ?fast=1 run: UI layout correct, 3D frame may lag; finishes sheet from a non-fast run with 30 s waits; before_v88a.png = old garage).
- NOT done (for the next worker): Frankfurt drive after the garage + tyre gap (`node t4/r2drive.js http://127.0.0.1:8766/local_dbg.html <out>`), start-screen shot, PC 1280×720 run (`node t4/r2shell.js <url> <out> 1280 720`), iframe run (IFRAME=1), re-shoot RIDES (stat chips now on top of the panel; s3 rides shot shows the older top-left card), kit pictures in a non-fast run (they render slowly here).
- A non-fast full tour (s4) was still running when REVIEW went out.

## Reviewer FAIL on 66a5ab61 (08:25): todo for the next worker
1. The build tip "✔ PLACE or tap again" leaks into PAINT/KITS/PERKS/DRIVER. A CSS fix is already in src (`#gbx.r2:not(.gbBk) #gsTip{display:none}`), committed after the s3 shots. Also hide it while in BUILD with nothing held, and clear it on every mode switch (R2_go → GS_tip off). Re-shoot without ?fast.
2. m2g shows 47/120 but no visible new brick. Re-shoot without ?fast (the garage redraws only every ~5 s here) with a part colour that contrasts, plus its mirror. If it's still not there, it's a placement bug.
3. The held pad (#gsBar: PLACE/ROTATE/CANCEL/STEP) covers the car's rear and the ghost. Make it compact: 2×2 small tiles at the left edge under the rail, or one row above the tile bar. Show the ghost in the shot.
4. Kit thumbnails are blank: never show an empty white box. Show a flat icon fallback (category emoji) until the 3D image is ready, or pre-render at gbOpen.
5. Finishes (R2_FP in 98u):
   - pearl must keep the base hue (k=1 now, sheen .3): add sheen/iridescence without lightening;
   - chrome reads as dark red: try a separate env for the garage, or a lighter tint (mix toward white) with metalness 1 and roughness ≤ .05;
   - widen the gloss/matte/metal spread (matte roughness 1 + no clearcoat; gloss clearcoat 1 roughness .15; metal metalness .9 + roughness .25);
   - re-shoot with t4/r2fin.js (normal mode, 30 s waits, closer clip).
6. Gate still owed: start screen; a Frankfurt drive after SAVE & DRIVE per finish (t4/r2drive.js): car on the road, tyre gap ≤ 0.05, wheels dark, no see-through; PC 1280×720; iframe; console errors.
Minor: m5 "1/3 SLOTS" wraps (it comes from GPK_html's h5): shorten it to "1/3" in the shell (rewrite the h5 text in R2_post).

## R2b (2026-10-08 10:10): reviewer PASS, DEPLOY sent (cea720a, out/v88c)
- Fixed: tip cleared per mode / on place; held pad = one 62 px column (labels PLACE/TURN/DROP/UP/DOWN, selection pad 2 cols), build area reserves it and zooms (R2.bz); panel modes zoom 2.6×area;
  kit pictures = the part alone, framed tight, category emoji fallback; finishes R2_FP (gloss clone, matte, metal, chrome = silver mix + canvas studio env R2_env, pearl = rim sheen);
  street car uses `chromeD` (mid-steel #8d939b, rough .3, no glow) because a mirror reflected the sky as blue/see-through; perks header via GPK_html wrap.
- Harness: t4/r2shell.js IFRAME page needs a viewport meta (else 741×341); QUICK=1 = start + rides only; t4/r2drive.js FIN=<finish> + material dump.
- Shots: docs/shots/r2b/ (phone, pc, iframe, drive, q2). Tyre gap 0.03. 0 console errors.
- Open polish: street chrome has a slight mauve cast (make the base cooler); a blue dome is visible in low Frankfurt side views (world, not R2).
