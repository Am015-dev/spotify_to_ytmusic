# CURRENT STATE (2026-10-05 11:30 UTC); supersedes everything below
- Live: v85d (brave-carson 7b1a098): clean phone HUD (minimap, speed, one objective line, 5 buttons), soft steering, dark roads, BRAKE/GAS overlap fixed, giant beige walls clamped.
- **Owner session: Art direction (Opus) session_018zxcXZaWQxSCR3kmdPxWMZ, branch alex/od-art.** It owns the file and deploys. Built and in test: the LEGO 2K look (blue sky with brick clouds, green studded baseplate, asphalt with a yellow line, brick trees, midday light, boost FX, HUD skin) + pCAR1 SPEEDSTER car (alex/od-cars). Queued: cars/traffic sit ON the road (tyre contact, suspension, shadows, dust), boats IN the water (waterline, bob, wake).
- Done/archived: v85 worker (alex/od-v85, V85-HANDOFF.md), LEGO presets (pLG1, rejected by Alex), cars worker (pCAR1).
- Open: iPhone landscape buttons in the Claude-app beta not confirmed fixed (no WebKit in cloud); Athens wall hits; mission winnability.
- Alex's scores: v82 2/10; v83 "horrible, uncontrollable". Ask for a 0–10 score after the art deploy.
- Read CLAUDE.md lessons 1–14 first.

# STANDING RULES FROM ALEX (read first, never ask about these again)
- **Deploy is ALWAYS allowed.** When a build passes the gate, the coordinator deploys it to `alex/brave-carson-rbpmlk`
  and republishes the beta artifact. Never ask Alex for permission to deploy.
- **The gate is `tools/tPlay.js` (branch alex/od-qa) on the SPLIT build**: real touch/keyboard input, human-like steering,
  no warps or force-clicks. It fails on any of these: hits > 1/min, stuck > 3%, any console error, Athens loading screens,
  a humanoid > 2.2 m, more than 3 rings on screen while roaming, HUD over touch controls, controls dead after rotation.
  The old tests (tBA/tBF/smoke) passed while the game was unplayable (2/10), so they are only sanity checks.
- **Feature freeze.** Only fixes until tPlay passes and Alex scores the game 6/10 or higher. Never self-score fun.
- **Cost (the 2026-10-04 run cost about $120 in 13 h, 99.8% of it context re-reads):**
  - Every cloud session sets `model`: Sonnet (claude-sonnet-5-5) for build/fix/test/integrate; Opus only for hard design calls.
  - Run one fix worker plus one integrator, not 5–7 in parallel.
  - Use a fresh session per task and hand off before ~150k context.
  - Workers wait for a test once (in the background), never in a sleep/grep polling loop.
  - The coordinator does no scheduled check-ins unless something is running, and never runs list_sessions without a filter.
- Read the skill `fun-game-design` (Phase 6: real-input testing; Phase 7: be terse, no inflated scores).
- Keep `ALL_OPEN=true`, the credits "Made with ❤ by Alex", English UI, gas default on touch, and no model names in files or commits.

# Mainhattan Overdrive: coordinator handoff (written 2026-10-04 ~15:30 UTC)

You are the new **coordinator** for this game. The previous coordinator session grew to about 560k tokens of context and cost about 90% of the project spend, so stay lean.
- **Coordinate only.** Don't do technical work yourself.
- Hand anything technical (merging, testing, debugging) to cloud sessions using `create_session` (Claude_Code_Remote tools; load them via ToolSearch).
- No polling loops and no repeated status checks.

## The owner (Alex) and how to talk to them
- Goal: make the game as fun as LEGO 2K Drive. Two cities: Frankfurt (real streets) and Athens (real OSM streets, 4 district maps A–D with real terrain).
- Alex tests on an iPhone 16 and on PC. They send bugs and screenshots. Be terse.
- Never self-score fun or beauty. Ask Alex for a **0–10 score plus "what felt worst"** after big drops.
- Alex wants speed through parallel cloud sessions (each worker builds one feature on its own machine), few tokens, nothing unplayable, and good looks.
- Alex has TRELLIS (image/text-to-3D) on their own machine. Offer: they send LEGO-style GLBs (e.g. the Parthenon) and we add an `assets/` loading pipeline. Nothing has been received yet.
- Rules:
  - Keep `const ALL_OPEN=true;` (both cities unlocked for testing).
  - Keep the credits "Made with ❤ by Alex".
  - English UI only.
  - Gas pedal is the city default on touch.
  - No model identifiers in commits, PRs or code.

## Where things live
- **Live game:** https://am015-dev.github.io/spotify_to_ytmusic/mainhattan-overdrive/ is served from branch **`alex/brave-carson-rbpmlk`**, file **`games/mainhattan-overdrive/index.html`**. That repo branch also holds other games (shelf); touch only that folder.
- **Beta artifact:** https://claude.ai/artifact/P6zT2b2SwfHYguRTtb67Ug. Republish it with the Artifact tool using `url=` after a read, and the title "Overdrive Beta".
- **Dev kit:** branch **`alex/overdrive-devkit`** (this branch). Read README.md here.
  - `base.html` is the LIVE build **v82** (deployed split: index.html + km.js).
  - Workers write `p<TAG>N.py` patches plus self-contained modules, and must pass `node smoke.js .`.
  - Module sources for reference are in `docs/modules/`.
  - Design docs: `docs/fun_redesign.md` (story/activities) and `research_2k.md` (2K Drive research, in the old scratchpad; key points are in fun_redesign).
- `tools/split_km.py`: **required at deploy time**. It moves the 1.96 MB embedded model blob `KM_BIN` into `km.js` next to the page. The page is near the 3.6 MB cap: v81 is 3.55 MB, and the next merge is 3.59 MB plus more to come.
  - Usage: `python3 tools/split_km.py overdrive.html outdir` produces `outdir/overdrive.html` (about 1.6 MB, loads `<script src="km.js">`) and `outdir/km.js`.
  - Deploy **both** files into `games/mainhattan-overdrive/` (index.html and km.js), and pass km.js in the artifact's `files`.
  - The split build has not yet been smoke-tested live. Verify that it boots before relying on it (the integrator should run smoke on the split output).
- `tools/tBA.js` (Athens + phone touch, 30 checks) and `tools/tBF.js` (Frankfurt bugs, 10 checks): regression tests to run on every merge.

## Deploy procedure (what the previous coordinator did)
1. Have a build `overdrive.html` (base + patches, built with `bash reapply.sh <patches in order>`).
2. `python3 tools/split_km.py overdrive.html out`.
3. Clone or fetch `alex/brave-carson-rbpmlk`. In `games/mainhattan-overdrive/index.html`, keep the existing `<head>` up to and including `<body>`, then append `out/overdrive.html` + `</body></html>`. Copy `out/km.js` alongside.
4. Commit with this trailer:
   ```
   Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
   Claude-Session: <this session's URL>
   ```
   Then `git push origin HEAD:alex/brave-carson-rbpmlk`.
5. Poll the live URL with curl until a marker string appears (1–3 min).
6. Republish the beta artifact.
7. Tell Alex what changed, the test results, and what to try. Send the smoke contact sheet (`smoke/sheet.png`) as the screenshot.

## Merge procedure: hand it to an INTEGRATOR cloud session (cheap)
The integrator takes `base.html` (v81) plus the finished worker branches below, applies patches in a safe order, runs **smoke + each feature's own test + tools/tBA.js + tools/tBF.js**, fixes small conflicts, and pushes a branch such as `alex/od-release-82` containing `overdrive.html` (unsplit) and the split `out/`.

Known pitfalls:
- Every module inserts before the anchor `window.__mho={`. Patches whose anchor is a longer `window.__mho={xyz` (e.g. pATC1 used `window.__mho={athPts`) must apply **before** modules that prepend to that object.
- Each test dir needs its own server port, and **every** test file's port must be rewritten (`sed` all `*.js`). A stale port once made tests run against the wrong build.
- Known harmless test failures (test setup issues, not bugs):
  - tBF "BF3 car stuck inside a building": with terrain, the warp no longer lands inside the building.
  - tM3 "NEXT after finale": the test skips chapter 2.
  - tM2 "marked mission 4–7 min": the bot is faster than a human.

## UPDATE 17:35 UTC: v82 deployed = v81 + od-ownerbugs + od-cityvar + od-juice + od-garage (split build live, smoke 12/12 on split, tBA 30/30). Known regressions in v82: tBF BF1 (world runs behind garage overlay; the new garage builder likely replaced the hold) and BF5 (chase camera inside buildings, 1441/4305 frames; likely new city-variety buildings or juice camera). A fix session runs on branch alex/od-v82fix. Still to merge: od-otg2 and od-ownerbugs2.

## Worker status at handoff (cloud sessions, tag "overdrive")
Already **merged and live (v81)**:
- Map pin
- Frankfurt chapters 1–4 and the finale
- Athens campaign
- Bug sweeps (Frankfurt and Athens)
- Looks/lighting
- Athens street life
- Terrain and drivable hills (od-terrain)
- Auto vehicle switch, smash→boost, day/night (od-feel)
- Split-screen (od-split)
- Audio v1 (od-audio)

**Finished, waiting to merge:**
| Branch | What | Notes |
|---|---|---|
| `alex/od-audio` (final) | music/SFX polish, English UI | its tAU "audio source leak" fails; fixed in od-otg2 |
| `alex/od-garage` | brick-by-brick car builder + minifigure | finished; not yet integrated or tested in a merge |
| `alex/od-otg` | On-the-Go events, golden bricks, collectibles, area % | **don't use**: it breaks phone map drag/pinch. Use **od-otg2** |

**Still running at handoff** (check with `get_session`; their reports arrive on their branches):
| Session id | Branch | What |
|---|---|---|
| session_01N5kNbSNMia7bUiC7pfq9rS | `alex/od-otg2` | fixes the OG map-drag regression, OG tier tests and the audio leak; includes the AU patches |
| session_01Y5ZJdzTV7Rsac478sxmjpk | `alex/od-cityvar` | traffic lights + rules, building and street variety |
| session_01Tt3u5Q8R4X1syQDkanRPsK | `alex/od-juice` | feel and juice benchmark (speed sense, drift tiers, hit-stop, combos) |
| session_01UdkCgb8bYFHykq5pB8VVFD | `alex/od-ownerbugs` | phantom brick bursts, Euro sign, unconnected roads |
| session_01PGW9ifxp6wxX6DE7HDkzxL | `alex/od-ownerbugs2` | night light beams, Acropolis rebuild at real scale, heights, trees on the road |

All workers branched from older bases (v78/v80/v81). The integrator must apply their patches onto v81. Suggested order:
1. od-otg2 (includes audio)
2. od-feel and other already-live modules are already in v81, so don't re-apply them
3. ownerbugs
4. ownerbugs2
5. cityvar
6. juice
7. garage

Then smoke and all tests, then split, then deploy.

## Owner feedback still open (verify after the merges above)
- Phantom brick bursts; the Euro sign shape; unconnected roads (ownerbugs).
- Ugly white night beams; Acropolis wrong/incomplete; wrong heights; trees on the road (ownerbugs2).
- "No traffic lights/rules; city looks flat with no variety" (cityvar + terrain).
- No 0–10 score from Alex yet since the big changes. Ask after the next deploy.

## Remaining 2K Drive gaps (after this batch)
- Online multiplayer (needs a server; skipped).
- TRELLIS assets pipeline (waiting on Alex).
- Second-pass content in both cities: more missions and activities.

## Cost rules (the important part)
- Coordinator: few turns, no polling. Use `send_later` at most every 60–90 min if needed, and stop it when nothing is running.
- Every worker prompt starts with this AUTHORIZATION line (two sessions got stuck without it):
  > in this repo you may run the dev kit's own scripts and tools: `bash setup.sh`, `bash reapply.sh …`, `python3 p*.py`, `python3 -m http.server 8766`, `node *.js` tests (local builds and headless browser tests only). If setup.sh is refused, run the server and `bash reapply.sh` by hand.
- Workers must create their own `alex/od-<name>` branch, never push to alex/overdrive-devkit, and not open PRs.
- Typical worker cost: $5–15. Let workers and the integrator do all heavy lifting.
