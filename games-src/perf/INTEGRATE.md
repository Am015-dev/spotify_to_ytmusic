# Adding PerfHUD to a game

`perf/perfhud.js` is a plain script that defines `window.PerfHUD`. Shipwreck Isle (`rc/`) and Doorkick Dungeon (`munch/`) already use it. Copy what they do.

## The same 5 steps in every game

1. **Build.** In the game's `build.py`, add `'perfhud.js'` to the script list, right after `shell.js`, and read it from `../perf/perfhud.js` (adjust `../` to the folder depth):
   ```py
   SRC={'perfhud.js':'../perf/perfhud.js'}
   for f in ['shell.js','perfhud.js', ...]:
       ... open(SRC.get(f,f)).read() ...
   ```
   In `body.html`, add `<script src="perfhud.js"></script>` right after `<script src="shell.js"></script>`. Rebuild, then run `node --check x.js`.
2. **Register** once the renderer exists (at the end of `init3D`, just before the first frame):
   ```js
   const PH=typeof PerfHUD!=='undefined'?PerfHUD:null;
   PH&&PH.register({game:'Name', renderer:V3.r, levels:[...], names:{...},
     getLevel:()=>…, isAuto:()=>…, setLevel:(l,why)=>…, autoTop:()=>gfxAuto(),
     basePR:()=>…, onPixelRatio:v=>{V3.r.setPixelRatio(v);resize3D()},
     orbit:t=>…, isAnimating:()=>…, anchor:'.gx-board', corner:'tl', beforeTest:()=>closeMenus()});
   ```
   - `setLevel(l, why)`: `why` is `'auto'`, `'test'`, `'restore'` or `'apply'`. Only `'apply'` (the Apply button on the result card) is a choice by hand, so call the game's saving setter (`setGfx`) for it. For the other three, call the apply-only function and save nothing.
   - `isAuto()` must be false once the player picks a level by hand. PerfHUD then never changes the level or the pixel ratio.
   - `orbit(t)` is called with a `t` from 0 to 1 during the test, and with `null` at the end. Save the camera on the first call, move it slowly, and restore it on `null`.
   - `isAnimating()` returns true while something moves that the player should see smoothly: tweens, a camera glide, pieces walking, weather blends, dice, flights. Ambient life (water, sway, fire) does not count. That ambient life is what the idle saver slows to 10 fps.
3. **Loop.** Replace `requestAnimationFrame(loop3D)` (both the first call and the one inside `loop3D`) with `(PH?PH.raf:requestAnimationFrame)(loop3D)`. This lets PerfHUD time the game's work per frame and throttle the loop when idle.
   - Delete the game's own frame watchdog and `stepDown()`. PerfHUD's controller replaces them: p95 over 50 ms for 3 s steps down one level, then the pixel ratio in steps to 0.6; 10 s under 14 ms steps back up, at most once a minute; the first 2 s after a level change are ignored.
   - Also delete any "skip frames on a very slow GPU" gap. It hides slow frames from the p95.
   - While `PerfHUD.testing` is true, draw every frame. Treat it as "moving" in any frame cap.
4. **Pixel ratio.** In the game's apply-quality function, set the pixel ratio through the cap: `r.setPixelRatio(PH?PH.pixelRatio(want):want)`. Remove `V3.prMul` if the game has it.
   - For correct draw and triangle counts with post-processing, start `draw()` with `r.info.autoReset=false;r.info.reset();`.
   - Call `PH.wake()` at the start of `sync3D()`, so a move by the computer wakes the idle saver at once. Call `PH.hitch()` after any big rebuild.
5. **Menu.** Put `${PerfHUD.buttonsHTML('<the menu button class>')}` into the Settings popup or the menu. PerfHUD handles those buttons itself (`data-perfhud="show"` / `"test"`) and keeps their labels in sync. `?fps=1` and F9 work with no code.
   - Pick an `anchor` and `corner` that land on an empty corner of the board. The overlay has `pointer-events:none` and 0.72 opacity, but it should still not sit on a control.

Then check each game in Playwright:
- open the Settings popup;
- Show speed, and look at a screenshot;
- Test speed: a card appears, Apply saves the level, and Copy report shows the selected text in headless Chrome;
- wait 4 s with no input: `PerfHUD.idling` is true and about 10 frames are drawn per second;
- move the mouse: it wakes.

Run the game's full test list as well. The jsdom tests never start PerfHUD: the jsdom user agent, or no `requestAnimationFrame`, turns it off.

## Per game

### Sands of Qamar (`ft/src/`)
- **Quality code:** `three3d.js`, lines 9–16.
  - The state is `GFX={pref,q,bad,ema,cool}`. The level names are `'high'|'medium'|'low'`, and the key is `soq_gfx`.
  - `setGfx(pref)` saves the choice; `applyQ()` applies `GFX.q` (it reads the global, so set `GFX.q` first).
- **Watchdog to remove:** at the top of `loop3D` (around line 248): the `GFX.ema`, `GFX.bad` and `GFX.slow` block. `GFX.slow` sets pixel ratio 0.6 on Low; PerfHUD's cap replaces it.
- **Menu:** the Settings drawer `#setd`, rendered by `renderSettings()` in `ui.js` (around line 200). Add the buttons after the Graphics row, with class `btn`.
- **Mapping:**
  - `levels:['high','medium','low']`
  - `getLevel:()=>GFX.q`
  - `isAuto:()=>GFX.pref==='auto'`
  - `setLevel:(l,w)=>{if(w==='apply')setGfx(l);else{GFX.q=l;applyQ()}if(typeof renderSettings==='function')renderSettings()}`
  - `basePR:()=>{const d=devicePixelRatio||1;return GFX.q==='high'?Math.min(2,d):GFX.q==='medium'?Math.min(1.5,d):1}`
  - In `applyQ`, wrap the `setPixelRatio` value in `PH.pixelRatio()`.
- **Busy signal:** `V3.rendered` and the camera ease. Set `V3.busy` in the loop, as Shipwreck does.

### Crown City Smash (`kot/`)
- **Quality code:** `three3d.js`.
  - `GFXKEY='ccs_gfx'`, with `gfxPref()` and `gfxAuto()` at lines 6–8.
  - `cycleGfx()` saves the choice and calls `setQuality`.
  - `setQuality(q)` (line 43) applies the level.
  - `V3.pinned` (set from a URL) means "fixed".
- **Watchdog to remove:**
  - `stepDown()` at line 55;
  - the `V3.perf` block at the top of `loop3D` (around line 604);
  - `V3.perf={...}` inside `setQuality`.
- **Menu:** the Graphics button `#gfxbtn` is a menu row (`btn mrow`) in `body2.html`. Add PerfHUD's buttons after it, with class `btn mrow`. Build from `kot/` with `build.py` (its body file is `body2.html`).
- **Mapping:**
  - `levels:['high','medium','low']`
  - `getLevel:()=>V3.q`
  - `isAuto:()=>!V3.pinned&&gfxPref()==='auto'`
  - `setLevel:(l,w)=>{if(w==='apply'){try{localStorage.setItem(GFXKEY,l)}catch(e){}}setQuality(l)}`
  - Wrap the pixel ratio in `setQuality` in `PH.pixelRatio()`.
- **Also:** `V3.soft` (a software GPU) already forces Low in `gfxAuto`. Keep it.

### Nebula Aces (`xw/`)
- **Quality code:** `three3d.js`, lines 5–48. It follows the same pattern as Crown City:
  - `GFXKEY='na_gfx'`, with `gfxPref()` and `gfxAuto()`;
  - `cycleGfx()`;
  - `setQuality(q)` (line 40);
  - `stepDown()` (line 48);
  - `V3.pinned`.
- **Watchdog to remove:** the `V3.perf` block in `loop3D` (around line 577), `stepDown()`, and `V3.perf=` in `setQuality`.
- **Loop:** `loop3D(now)` uses its argument for time, so `PH.raf` passes the rAF timestamp through unchanged.
- **Menu:** `#gfxbtn` (`class="btn"`) in `body.html`, handled by `ds.a==='gfx'` in `ui.js` (line 202). Add the buttons next to it, with class `btn`.
- **Build:** the script list starts with `three.min.js`, so insert `perfhud.js` before it.
- **Mapping:**
  - `getLevel:()=>V3.q`
  - `isAuto:()=>!V3.pinned&&gfxPref()==='auto'`
  - `setLevel:(l,w)=>{if(w==='apply'){try{localStorage.setItem(GFXKEY,l)}catch(e){}V3.pinned=true}setQuality(l)}`
  - `orbit`: move `V3.cam.yaw` (and restore it). The loop already eases the camera from `V3.cam`.

### Sunglaze (`azul/game/src/`)
- **Quality code:** `three3d.js`, lines 8–27.
  - `GFX_KEY='sgz_gfx'`, with `gfxLoadPref()` and `gfxSetPref(v)` (saves the choice);
  - `applyQuality(q)` (applies the level);
  - `V3.qPref` (`'auto'` or the level), `V3.q`.
- **Watchdog to remove:** `frameWatch(dt)` (line 26) and its call at the top of `loop3D`.
- **Loop:** this game already draws only when something changes (the `busy` expression in `loop3D`, plus a frame gap).
  - Use that expression as the hook: set `V3.busy=busy` in the loop and pass `isAnimating:()=>V3.busy`.
  - Set `idleMode:'demand'`, since nothing ambient needs to move.
  - Add `||PH&&PH.testing` to `busy`, so the test draws every frame.
- **Menu:** the Graphics button, rendered by `gfxBtn()` in `ui.js` (line 175) and cycled by `gfxCycle`. Add the buttons to the same bar or menu.
- **Mapping:**
  - `getLevel:()=>V3.q`
  - `isAuto:()=>V3.qPref==='auto'`
  - `setLevel:(l,w)=>w==='apply'?gfxSetPref(l):applyQuality(l)`
  - Wrap the pixel ratio in `applyQuality` in `PH.pixelRatio()`.

### Rampart & Vine (`carc/game/src/`)
- **Quality code:** `three3d.js`, lines 8–25. It uses the same code as Shipwreck's old version:
  - `GFX={high,med,low}`, `GFXQ`;
  - `gfxAuto()`, `gfxPref()` (key `rv_gfx`);
  - `setGfx(v)` (saves the choice), `applyQ(q)` (applies it);
  - `stepDown()`, `V3.prMul`.
- **Watchdog to remove:** the `V3.justDrew`/`V3.slowT` block at the top of `loop3D` (around line 419), `stepDown()`, and `V3.slowT/okT/lockQ/prMul`. Here `setGfx` even sets `lockQ=false` for a level picked by hand, which is the bug the "picked by hand is never auto-changed" rule fixes.
- **Menu:** the Settings drawer `#setd` (`data-gfx` buttons, `renderSettings()` in `ui.js` around line 216). Add the buttons under the Graphics row.
- **Mapping:** exactly Shipwreck's (see `perfHooks()` in `rc/three3d.js`):
  - `levels:['high','med','low']`
  - `names:{med:'Medium'}`
  - `getLevel:()=>V3.q`
  - `isAuto:()=>V3.pref==='auto'`
  - `setLevel:(l,w)=>w==='apply'?setGfx(l):applyQ(l)`
  - `basePR:()=>Math.min(GFX[V3.q].pr,devicePixelRatio||1)`
  - The game also has `V3.dirty` (redraw-on-change), which can feed `isAnimating`.

## Reading the numbers
- The **HUD** shows:
  - FPS, and the average and p95 frame time over the last 2 s, measured as display-frame intervals (what the player feels);
  - `work`: the game's own JS time per frame, from `PH.raf`;
  - the level, with `auto` or `fixed` and any resolution cap;
  - draws and triangles for the whole frame;
  - the JS heap (Chrome only);
  - the dpr, the pixel ratio and the canvas size.
- **Test speed** runs 2 s per level: 0.3 s to settle, then 1.7 s measured.
  - The recommended level is the highest one with p95 under 20 ms (60 fps). If no level gets there, it is the highest with p95 under 33 ms (30 fps); if none does, it is the lowest.
  - "Copy report" copies one line of JSON: game, user agent, GPU (`WEBGL_debug_renderer_info`), screen, viewport, dpr, pixel ratio, level, auto flag, results and recommendation.
- **Step up** needs 10 s with the work p95 under 14 ms *and* every display frame on time. A 60 Hz screen never shows intervals under 16.7 ms, so a game with no `PH.raf` (a DOM game) uses "every frame on time" alone.

## One more check per game: hover lifts
Doorkick's Medium slowdown was a hover loop. A card or button that moves on `:hover` (`transform:translateY(...)`, `scale`, a fan `rotate` that resets on hover) can move its own hit box out from under a still pointer at its edge. Hover then turns on and off every frame, and the page repaints non-stop: 137 ms frames on Medium and 380 ms on Low at 1366x768 in SwiftShader, against 16.6 ms.

To check a game, run `perf/work/dksweep.js` (adapt the selector): it parks the pointer on the edges of each element that moves on hover and measures the frame time.

There are two fixes:
- keep the hovered box covering its resting spot (Doorkick's cards: `.card:hover>.hit` extends the hit area);
- do not move on hover at all (Doorkick's buttons, rival plaques and gear chips).

Shipwreck still has 1–2 px hover lifts on `.gx-ibtn`, `.btn.go` and `.wz-s` (`rc/head.html` lines 354–374). They are harmless in its tests so far, but they have the same shape.
