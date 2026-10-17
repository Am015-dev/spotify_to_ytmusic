# HANDOFF perf (perf-2 landed on trunk)
- Landed: alex/perf-wip 62418d5 (perf-2 GC cuts) merged with trunk 770da51 -> pushed FF to alex/od-int2 at 74ecd2b.
- Gates: tools/build.sh v90m-beta.92 OK; unit 5327 pass, 0 FAIL, 13 known.
- TAG life1,xf1,terrain,smash2,cam,rv2k2,mem on built page: no new reds. Perf-wip reds = trunk reds or known list (fra: mem/stable, xf1/water/land/slope/kerb, terr1/terrain-tyre-fra, life1/fra-density; ath: terr1/terrain-tyre-ath).
- Trunk 770da51 same set reds: fra mem/stable, xf1/*, terr1/terrain-tyre-fra, life1/fra-density, life1/popup; ath terr1/terrain-tyre-ath, life1/ath-density, life1/carousel.
- Left: perf/frame strict target not met; terr1 tyre-gap and xf1 red on both trunk and perf-wip.

## perf-4 (2026-10-17, alex/perf4-wip): draw calls / tris breakdown, low-quality culling knobs
1. Probe `tools/perf4/tTris.js <url> <out.json> [low|high] [fra,ath]`: wraps renderer.renderBufferDirect, 3 fixed spawn views per city, per-object calls/tris tagged by scene path, distance band (a<100 b<300 c<700 d>700 m) and bounding radius (R>400 = city-wide), + rAF ms.
2. Before (q=low, trunk e59bc7d): Fra 401-462 calls / 2.30-2.43 M tris · Ath 247-450 / 1.40-1.62 M. ~60 % of tris are city-wide meshes (bounding radius 400-6900 m) that per-mesh culling can never hide: G(48 IMs)#2708 217k, Ath merged Mesh R6862 110k + IM R6090 86k, ctb_plinth (all plinths, R3657) 51-62k, rdZebra R3448 42k, Mesh#32 / Group#49 IMs 55k+54k. LIFE bm_s/bm_m (BatchedMesh) are counted at full size here but only draw visible items.
3. Change: low/min hub culling 1350/520 -> 1000/400 m (min 1050/420 -> 800/340) in src/80_story_m1.js; CTB far LEGO sets 520 -> 380 m on low, 300 m on min (src/98ct_city_lego.js). After: Fra 379-435 calls / 2.05-2.15 M (-6 %/-10 %), Ath unchanged (its cost is near/city-wide). Athens 852x393 shot before/after: nothing near the road vanished.
4. Goal (low ≤400k / ≤150 calls) NOT reached. Next, biggest first: per-instance distance compaction (CTB_step style, keep a map so index writes like 98sp_simplify's CTB.pim zeroing still land) for G#2708's 48 IMs, ctb_plinth, Mesh#32, Group#49/Mesh#1; split the Ath R6862 merged mesh and rdZebra into 400 m cells so hubCull can drop them.
5. rAF ms on SwiftShader (≈1 s/frame) is not a usable metric; use tris/calls and the stepped JS probes (perf1/tFrame.js).
