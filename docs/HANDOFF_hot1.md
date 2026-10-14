# HANDOFF hot-1 (2026-10-14): hot reload, Athens boot, gym, player load

## Done (all on alex/od-int2)
- **Hot reload** `tools/hot.js` (docs/HOT.md, 1bc4a68). Daemon = one warm `?test=fra|ath&draw=0` page per city, served from src/ on every load.
  - `reload src/X.js` swaps only the functions/wrappers whose text changed since that page loaded the module, then replays every later wrapper of them (ORDER).
  - `go <ver/id>` ≈ 3 s. `eval` awaits promises. `HOT_CITIES=fra` (or empty) limits the pages it boots.
  - Caveats: `const f=()=>` can't be swapped (it says so); a name also re-assigned inside a function (runtime wrapper, e.g. roamStep) is dropped by a chain rebuild (it warns).
- **Athens boot 36.9 → 21.2 s** (3dcfb5d, 5a6f09f), with identical heights (300k samples vs `__smShelf.old`), ath suite 81/81:
  - 53 athShelfY: segments stored once (SM_SG), all ~35k cells cached, and each cell keeps only the segments that can reach it for its ground range [h0,h1]. Average 41 → 11 segments; an h outside the range uses the full list.
  - 60 gndBuild: quadtree corners already in the vertex map skip their height samples.
- **Gym** (ce53064): `node tools/hot.js gym drive|foot|cam|park` → src/test/gym.js (test builds only) gives a 600 m pad instead of the city and skips the menu. Drivable or walking in 3.5–4.5 s.
- **Headless finding**: without `--disable-accelerated-2d-canvas`, swiftshader stalls on ReadPixels and runs at 1–2 fps for ~6 s after boot (and on every loader nextFrame). hot.js, bootprof.js and tLoad.js now pass it. tChkGo.js does not yet: add it there (likely faster GOs; check that results don't change).
- **Player load** (97d0333c): `tools/tLoad.js <outdir|url> fra|ath` = gzip static server + Fast 4G emulation (NET=9,40), prints drivable time, bytes and requests (LIST=1, MAX=20 asserts).
  - Measured: only 2.8 MB gz before drivable (page 1.39, km.js 0.59, three 0.26, models ~0.5). The network is idle after ~2–9 s, so the load is CPU-bound.
  - modulepreload for three.js and its addons at the top of 00_page.html: three arrives at 1.2 s instead of 4–5 s. Frankfurt 20.6 → 19.3 s.
  - Live (GitHub Pages, test=fra): 16 s with draw=0, 19.6 s with drawing, 28 s without the 2D-canvas flag. dev-4's 66/83 s was probably the full menu flow, or a harness without that flag.

## Open (coordinator target: drivable ≤ 20 s on Fast 4G, both cities)
- Frankfurt 19.3 s ✅ (borderline). Athens 25.6 s ❌ (CPU). `node tools/bootprof.js ath 30` (CHILD=fn / CALLERS=fn) on top of the hot daemon (`HOT_CITIES= node tools/hot.js status` first).
  - Latest profile (terr-1's terrain is on): buildHubProps 5.3 s (98lf wrapper), gndBuild 3.8, CE_streets 2.9, module top level 2.8, hubGrid/TR_bldFix 2.1, athBuildG 1.9, boot 1.7 (menu team cards ~1 s), DR_solidBuild 1.4, BK_cand/cityAt 1.3.
  - Ideas: TR_bldFix samples 9 groundY per building and `find` per vertex; CE_streets; a 4 m cached ground-height grid for props only (not for physics).
- Item 5 (slow GOs) is not started. dev-4 says art1/road-gap and ath-flip are already state asserts (~5 s).
- Item 4 (node unit tests) belongs to test-1 (tools/unit), so I skipped it.
