# Nightrun playability audit, 25 Oct 2026 (W240, diagnosis only)

Build: live `5c74aadb69` (local `build.py` output has the same hash as live `sw.js`/`NR_STAMP`).
Method: `benchmark/playability-probe.js` plays in REAL TIME (no sim stepping) for 90 s per mode with a simple bot
(flight: dodge nearest shot vertically, drift, dash; street: walk right, hold fire, jump when stuck, knife close foes, dash).
PC = 1440x860 keyboard, DPR 1. Phone = 390x763, touch, isMobile, DPR 3, CDP CPU throttle 4x, touch through CDP `Input.dispatchTouchEvent`.
Load = `benchmark/playability-load.js` against the live URL (phone profile).
Caveat: headless Chromium here has no GPU (software raster), so absolute PC numbers are pessimistic; the DPR control run
below isolates the cause on the same machine. The two phone 90 s runs shared 4 cores (flight+street in parallel); the DPR control ran alone.

## Raw numbers

| run | fps | frame p50/p95/p99/max ms | JS per frame p50/p95 ms | long tasks (>50 ms) in 90 s | key/touch -> move p50/p95 ms | hits/min | downs |
|---|---|---|---|---|---|---|---|
| flight PC | 52 | 16.7 / 33.4 / 50 / 150 | 0.8 / 1.7 | 12 (max 74) | 1.1 / 26 (n=224) | 2.7 | 1-2 |
| street PC | 59 | 16.6 / 50 / 66.7 / 183 | **22.2 / 31** | **266 (sum 15.8 s, max 159)** | 27 / 620 (n=15) | 4.0 | 1 |
| flight phone | **4.5** | **250 / 317 / 450 / 833** | 43 / 67 | 426 (sum 102 s*) | 1000 (2 of 4 never moved within 1 s) | 0.7 | 0 |
| street phone | **5.4** | **233 / 567 / 683 / 750** | 167 / 233 | 255 (sum 103 s*) | 220 | 1.3 | 0 |

*long-task sums exceed wall time because the throttled CPU stretches them; read as "the main thread is never free".

Control, phone flight 20 s alone: **DPR 1 -> 33.7 fps, p50 50 ms, canvas 382x679; DPR 3 -> 6.5 fps, p50 250 ms, canvas 1146x2037.**
Same game, same bot: the backing-store size alone costs 5x frame rate.

Load (live URL, phone profile): DOMContentLoaded 3.1 s, FLIGHT button 3.4 s, tap FLIGHT -> running **7.0 s**, 210 requests,
**29.6 MB** fetched in the first ~15 s (six 2.7-2.8 MB mp3s: menu, stage1, stage2 + 3 tracks, before the player asked for them).
Local (no network) phone: FLIGHT button 7.2 s, ON FOOT -> playable 24 s incl. one story card that must be skipped.

Profiles (CPU sampling, 12 s): street PC `drawImage` **70.7 %** of samples, street phone 40 %, flight phone 12 % + 83 % native raster.
No page errors in any run. Console: one `getImageData` readback warning (street; `willReadFrequently` missing).

Screenshots (worst frame of each run): `playability-shots/{flight,street}-{pc,phone}.jpg`.
Street phone shot: the run clock reads **0:03 after 15.7 s of real play** - the game runs in slow motion at 5 fps.

## Top 5 causes, ranked

1. **Phone renders at full DPR 3 -> 4-6 fps, game in slow motion (both modes).** Flight canvas 1146x2037 (2.3 Mpx), street 1170x1737 (2.0 Mpx),
   repainted every frame with `imageSmoothingQuality='high'`. DPR 3 vs 1 = 6.5 vs 33.7 fps on the same run. Input feels dead because the
   frame that shows the move arrives 250-700 ms later.
   Owner: `parts/core/b.js:25` (flight `dpr`: `RET.purelook ? Math.min(3, devicePixelRatio)` bypasses the quality cap `QD[SET.q]`),
   `parts/street/foot.js:427` `layout()` (`RET.purefoot ? Math.min(3, ...)`) and `parts/street/footq.js` `F.dprMax=3`.
   Smallest fix: cap both canvases at DPR 1.5 on touch devices (or always go through the existing `QD`/`PXB` pixel budget, ~1.2 Mpx),
   and make the adaptive render scale actually step down when frame p95 > 33 ms. One flag, both modes.

2. **Street draws are ~25x heavier than flight even on PC: 22 ms JS per frame, 266 long tasks/90 s, p95 50 ms.** `drawImage` = 71 % of CPU:
   full-screen sky + far + mid + road tiles + props drawn from big source images every frame with high-quality smoothing
   (the `slPainted` backdrop cache misses most frames while the camera moves). Owner: `parts/street/streetlook.js` `slBackdrop()`/`slBlit()`,
   `parts/street/purefoot.js` `pure()` (sets `imageSmoothingQuality='high'` each frame).
   Smallest fix: pre-scale each parallax layer once to its on-screen height (offscreen canvas per layer per scale, like `ART.bigGet`) so per-frame
   blits are 1:1 copies, and use `imageSmoothingQuality='low'` for background layers (keep high only for actors).

3. **Getting into play is slow and blocked.** Phone: 3.4 s to the menu, then **7 s from tapping FLIGHT to the first moving frame**, while ~30 MB
   (six full mp3s) download up front. ON FOOT first shows a story card that must be skipped (locally 24 s to playable on the throttled phone).
   Owner: music preloading (`parts/music`, `TR.bufs` decode before start) and the story card on the street entry (`parts/story`).
   Smallest fix: start the run immediately with the already-decoded menu loop / silence and stream or decode the stage track after start;
   fetch only the current stage's track; show the street story card once per save (not on every ON FOOT) with tap-anywhere to skip.

4. **Street input latency spikes (p95 620 ms on PC, 220 ms p50 on phone) and the touch layout has no FIRE.** The long tasks in cause 2 delay
   input handling; knockback/hitstop windows add to it. On the phone the visible buttons are JUMP, KNIFE, DASH, BOMB, GUARD and the stick -
   no FIRE button (fire is automatic), so the player cannot choose when to shoot. Buttons did not overlap at 390x763 in this build
   (GUARD at 248,591 sits between BOMB 180 and KNIFE 316; 60 px each, >= 44 px), so the earlier double-label GUARD frame did not reproduce here.
   Owner: `parts/street/foot.js` input `I` + `layout()`, `parts/street/streetguard.js` (GUARD placement).
   Smallest fix: fixing cause 2 removes most of the spikes; show a FIRE button (or label "AUTO-FIRE") so the phone player knows shooting is handled.

5. **Difficulty/readability: street damage comes in a burst you cannot escape; flight shots blend with the ship.** Street PC bot: 6 hits in 13 s
   (38.5-51.9 s), hp 5 -> 0, all from on-screen enemies (0 off-screen), i.e. one fight drains the whole bar with no recovery window.
   Flight PC: 2.7 hits/min, first loss of the run at 60 s with 17-18 enemy shots on screen; on the phone the pink enemy shots sit on the ship's
   pink exhaust and the backdrop's magenta lights (see `flight-phone.jpg`). Portrait street shows ~1.2 screen-widths of Kai and the next obstacle
   only, so a gunman steps in at short range.
   Owner: street `ftHurt`/invulnerability in `parts/street/foot.js` and `parts/difficulty`; flight shot colour in `parts/enemies`/`parts/fx`.
   Smallest fix: street i-frames after a hit 1.0 s -> 1.5 s plus cap at 2 hits per 4 s on normal; give enemy flight shots a dark outline / cyan core
   so they never share the ship's pink.

## Not found
No page errors, no stuck states (bot restarted after each down), no off-screen hits in the street, no button overlap at 390x763.
Audio not judged (headless, no output device).

## Re-run
```
python3 -m http.server 8765 --bind 127.0.0.1 --directory games/mainhattan-nightrun &
NODE_PATH=$(npm root -g) node games-src/nightrun/benchmark/playability-probe.js flight phone http://127.0.0.1:8765/ 90   # DPR=1 env for the control
NODE_PATH=$(npm root -g) node games-src/nightrun/benchmark/playability-load.js
```
