# Automated testing in game studios, and a fast test architecture for Mainhattan Overdrive

Scope: industry practice (Rare, Ubisoft, EA SEED, King, Riot, Unreal and Unity, Roblox, three.js), specific techniques, cheap "feel" metrics, Safari/WebKit coverage from a Chromium-only cloud, and a concrete test pyramid for a ~2.9 MB single-page three.js racing game.
Legend: **[UNVERIFIED]** means I saw the claim only in a search snippet, a press article or a vendor page, not in a primary source I read in full.

## 1. Rare, Sea of Thieves (GDC 2019, Robert Masella)

### Takeaway
The primary source is the speaker-notes PDF. Rare got 70% of 23k+ tests running as **"actor tests"**: tiny spawned scenarios that tick the game object directly, at unit-test speed. Integration "test maps" took ~20 s each, so they were kept to 5% and used only for the golden path. This is exactly the "spawn only the requirement, pass in seconds" model the owner is asking for.

### Cited Findings
- Test mix: **70% actor tests, 5% integration (map) tests**, about half of those networked. There were "relatively small" numbers of performance, screenshot and bootflow tests, "by far the slowest". The total is "just over 23 thousand tests", or over 100k including asset-audit checks. Coverage was 60% decision and 70% function. — [Masella GDC 2019 slides+notes (PDF)](https://media.gdcvault.com/gdc2019/presentations/Masella_Robert_AutomatedTestingOf.pdf)
- Speed: "a unit test typically took up to a tenth of a second… an integration test was around 20 seconds", driven by asset loading and network setup. The ship-wheel integration map "runs in about a second" once assets are loaded in the editor. — [same PDF](https://media.gdcvault.com/gdc2019/presentations/Masella_Robert_AutomatedTestingOf.pdf)
- **Actor test definition:** "a unit test for game code, but one that treated Unreal engine concepts like actors and components as first class dependencies". The example spawns a ShadowSkeleton, sets the state to Dark, sets world time to Midday, calls `ShadowSkeleton.Tick(1.0f)` explicitly, then asserts the state is Light. "Having to explicitly call a tick… is the downside… The major benefit… this test runs incredibly quickly." — [same PDF](https://media.gdcvault.com/gdc2019/presentations/Masella_Robert_AutomatedTestingOf.pdf)
- **Integration test maps:** a minimal scene (player + platform + ship's wheel, and deliberately *no ship*) with Arrange/Act/Assert in Blueprint and fake player input. They **poll each frame for the expected state with a long timeout** rather than fixed delays, because fixed delays break on refactors (false negatives) and waste time. — [same PDF](https://media.gdcvault.com/gdc2019/presentations/Masella_Robert_AutomatedTestingOf.pdf)
- **Golden path rule:** integration tests cover only the success path; actor tests cover failure and edge cases. The ratio is ~12 actor tests per integration test. — [same PDF](https://media.gdcvault.com/gdc2019/presentations/Masella_Robert_AutomatedTestingOf.pdf)
- Speed hacks for slow tests: they **combined related checks into one map** (three skeleton attacks in one test), accepting a "one behaviour per test" violation. They also **kept the player across map loads** via world travel, because loading the player cost more than the test itself. — [same PDF](https://media.gdcvault.com/gdc2019/presentations/Masella_Robert_AutomatedTestingOf.pdf)
- **Flakiness policy:** a failing test is auto-retried immediately and only a second failure turns the build red. There is a weekly "top intermittent failures" list. Consistently failing tests are **quarantined** (they still run but don't block), the owner is notified, and the test is **auto-deleted** if not fixed in time. — [same PDF](https://media.gdcvault.com/gdc2019/presentations/Masella_Robert_AutomatedTestingOf.pdf)
- **Screenshot tests:** "% of pixels different, and a manual test against last pinned for the non-deterministic visual tests. Often only every 1–2 weeks between manual checks." — [same PDF (speaker note)](https://media.gdcvault.com/gdc2019/presentations/Masella_Robert_AutomatedTestingOf.pdf)
- CI: all tests run at least every 20 min. Pre-commit runs only the related subset, with a <1 h target that crept to "half a day or more" in a queue before they optimised. — [same PDF](https://media.gdcvault.com/gdc2019/presentations/Masella_Robert_AutomatedTestingOf.pdf); larger multiplayer and perf tests run overnight — [Game Developer, Tommy Thompson](https://www.gamedeveloper.com/design/how-rare-automates-testing-for-ai-and-more-in-sea-of-thieves-part-4-of-4-)
- Outcomes: build verification dropped from **10 days (Kinect Sports Rivals) to 1.5 days**. Full-time testers dropped from **50 to 17**. The peak bug count was **214, versus ~3000 on Banjo Nuts & Bolts**. — [same PDF](https://media.gdcvault.com/gdc2019/presentations/Masella_Robert_AutomatedTestingOf.pdf)
- Limits stated by Rare: humans are better at visual and audio defects, exploratory testing, and "how the game feels to play really can't be done by an AI". Automated tests are "more of a hindrance than a help if you're still iterating on your game to find if it's fun", so Rare kept a separate untested prototype branch. Tests were usually written *after* a change worked, to pin behaviour. — [same PDF](https://media.gdcvault.com/gdc2019/presentations/Masella_Robert_AutomatedTestingOf.pdf)

### Inferences
- The "📍 GO" checklist buttons are already integration-map tests in Rare's sense: they spawn a scenario. What is missing is the **assert + poll + timeout** half, and a **headless runner** that executes them without a human.
- Overdrive's tPlay (17–70 min) corresponds to Rare's "bootflow/performance" tier, which Rare ran sparingly and overnight. It should not be the per-change gate.
- Rare's 12:1 ratio and "combine related checks, reuse the loaded world" are directly portable: load the 2.9 MB page **once**, then run N spawn tests in the same page with a reset between them.

### Gaps
- The PDF does not give per-actor-test timings beyond "incredibly quickly", or the size of the pre-commit subset.

## 2. Other studios and engines

### Takeaway
Big studios layer fast deterministic checks under slow bots. ML/RL agents are used at AAA scale for coverage and exploration, but they cost days of training. Scripted bots plus simple metrics give most of the value for a small game.

### Cited Findings
- **Riot (League of Legends):** BVS-Dev team; ~100,000 test cases per day; >100 code/content changes per day on a 2-week patch cycle; CI results ~1 h after check-in. "Bugs caught this way are fixed 8× faster than average." **[UNVERIFIED, from search snippet; the page timed out on fetch]** — [Riot Tech Blog: Automated Testing for League of Legends](https://technology.riotgames.com/node/33)
- **Ubisoft La Forge Commit Assistant / Clever-Commit (2018):** trained on ~10 years of code and bug-fix history to flag risky commits. Press reports claim it "finds 6 in 10 bugs" with a ~30% false-alarm rate and could save up to 20% of programmer time. There is no independent evaluation. **[UNVERIFIED, press only]** — [Slashdot/Wired summary](https://games.slashdot.org/story/18/03/05/202226/); [80.lv](https://80.lv/articles/how-ubisoft-uses-ai-machine-learning-to-build-games/). Ubisoft also used bots to playtest combat in For Honor — [80.lv](https://80.lv/articles/how-ubisoft-uses-ai-machine-learning-to-build-games/)
- **EA SEED:** Battlefield V feature testing covered "601 different features amounting to around 0.5M hours of testing if done manually". RL agents were deployed on Battlefield V and Dead Space (2023). Battlefield 2042 vehicle path-following with Bézier curves cut mean path time by 39% and reduced stuck events. Imitation learning trained in **20 min vs 5 h** for RL at similar success. RL "requires deep ML knowledge, and training can take days"; scripted bots still do most of the work but break when features change. — [EA SEED: ML research for AAA game testing](https://www.ea.com/seed/news/seed-ml-research-aaa-game-testing)
- **EA SEED, curiosity agents (CoG 2021):** stuck detection by **counting where episodes terminate and flagging statistical outlier locations**. This found an unintended gap that trapped agents. — [arXiv 2103.13798](https://arxiv.org/pdf/2103.13798). The CoG 2020 sandbox includes "a wall lacking a collision mesh" and "Stuck Player" areas — [arXiv 2103.15819](https://arxiv.org/pdf/2103.15819). CCPT finds missing collision boxes by exploring near a recorded human path — [arXiv 2202.10057](https://arxiv.org/pdf/2202.10057)
- **Microsoft Research, Go-Explore reachability testing:** finds fall-through-floor and stuck-in-wall bugs using navmesh heuristics. It covered a 1.5 km × 1.5 km world in 10 h on one machine. **[UNVERIFIED, snippet]** — [MSR](https://microsoft.com/en-us/research/?p=936006)
- **King (Candy Crush):** bots mimic human players rather than play optimally. They use MCTS, heuristics and NEAT to rate level difficulty. Reported results are 95% fewer manual level adjustments and 50% faster level changes **[UNVERIFIED, company-reported via press]**. The BAIT bot catches missing textures and strings, overlapping UI and render artifacts. — [InfoQ](https://www.infoq.com/articles/candy-crush-qa-ai-saga/); [StickyMinds](https://www.stickyminds.com/presentation/using-artificial-intelligence-test-candy-crush-saga-game); [Neurohive](https://neurohive.io/en/ai-apps/how-ai-helped-king-studio-develop-13-755-levels-for-candy-crush-saga/)
- **Unreal:** the Automation System (unit, feature and smoke tests in-engine) sits alongside **Gauntlet**, which orchestrates multi-process sessions (e.g. 4 clients + server) through a TestController and the `RunUnreal` UAT command. — [Epic: Gauntlet overview](https://dev.epicgames.com/documentation/en-us/unreal-engine/gauntlet-automation-framework-overview-in-unreal-engine). Rare built on the Automation System, Unreal's equivalent of the Unity Test Runner — [Masella PDF](https://media.gdcvault.com/gdc2019/presentations/Masella_Robert_AutomatedTestingOf.pdf)
- **Unity Test Framework:** PlayMode tests yield `WaitForFixedUpdate` to advance one physics step. Speeding tests up via `Time.timeScale` has had bugs: timeouts measured in game time (fixed 2019.1), and `deltaTime` reading 0 under time-scale changes in 2021–2023. — [Unity docs](https://docs.unity.cn/Packages/com.unity.test-framework@2.0/api/UnityEngine.TestTools.UnityTestAttribute.html); [Unity issue tracker](https://issuetracker.unity3d.com/issues/playmode-tests-timeout-when-time-dot-timescale-is-large)
- **Roblox:** TestEZ is a BDD (describe/it/expect) framework used for its apps, core scripts and Studio plugins, and runs on CI via Lemur. I found no Roblox engineering-blog numbers. — [github.com/Roblox/TestEZ](https://github.com/Roblox/TestEZ)
- **three.js itself:** the repo's e2e test screenshots every example with puppeteer. A `deterministic-injection.js` replaces `Math.random`, and the canvas is 800×500 downscaled ×0.5. Tolerances are `pixelThreshold = 0.1` and `maxDifferentPixels = 0.1%`. Rendering is CPU-only (Lavapipe software Vulkan), split into 5 CI jobs. **54 examples are excluded** for timing issues, black screens or slowness. — [three.js test/e2e/puppeteer.js](https://raw.githubusercontent.com/mrdoob/three.js/dev/test/e2e/puppeteer.js)

### Inferences
- three.js shows that golden images of WebGL in headless Chromium are viable **if randomness and time are frozen**, and that some scenes simply stay non-deterministic. That matches Rare's "manual check against last pinned" fallback.
- RL agents are out of scope for Overdrive: days of training, ML expertise needed. A scripted waypoint bot plus EA-style "where did it get stuck" heatmaps is the affordable version.

### Gaps
- No primary figures for Riot's current system, Ubisoft crash-prediction accuracy, or Roblox internal practice.

## 3. Techniques

### Takeaway
Seconds-fast game tests rest on two things: **(a) deterministic stepping that does not depend on real time**, and **(b) state assertions instead of eyeballing**. Golden screenshots and perf budgets are thin layers on top.

### Cited Findings
- **Fixed timestep:** "the renderer produces time and the simulation consumes it in discrete dt sized steps". A variable or semi-fixed dt is "not exactly the same due to the limited precision of floating point arithmetic", so only a fixed dt gives reproducible runs. — [Gaffer On Games, Fix Your Timestep](https://gafferongames.com/post/fix_your_timestep/)
- **Faster than real time in the browser:** Playwright `page.clock` fakes `Date`, timers, `performance` and **`requestAnimationFrame`**. `clock.runFor(ms)` fires all timers and animation frames for that span. `install()` must come before other clock calls, and docs advise installing it before navigation. — [Playwright Clock API](https://playwright.dev/docs/api/class-clock); [Playwright clock guide (.NET)](https://playwright.dev/dotnet/docs/clock)
- **Golden images:** Playwright `toHaveScreenshot` uses `threshold` (per-pixel YIQ colour distance, default 0.2) and `maxDiffPixelRatio` (unset by default; ~0.01 is a commonly suggested start). Animated content causes false failures, so freeze or mask it. — [Playwright SnapshotAssertions](https://playwright.dev/docs/api/class-snapshotassertions); [QA Wolf visual diffing](https://docs.qawolf.com/qawolf/visual-diffing)
- **Polling assertions with timeout** beat fixed waits (Rare, above).
- **Input record/replay:** I found no studio primary source in this pass. The technique depends on a fixed timestep: with Overdrive's variable dt, the same input log gives different trajectories (Gaffer, above). **[Gap]**
- **Perf budgets:** Rare's perf tests "collect data… to spot trends in load times, memory usage or framerate" and run overnight — [Masella PDF](https://media.gdcvault.com/gdc2019/presentations/Masella_Robert_AutomatedTestingOf.pdf). In three.js, `renderer.info.render.calls` and `.triangles` give draw calls per frame, and Overdrive already reads `renderer.info` (16 references in the live file, local inspection).
- **Stuck detection:** use outlier termination locations (EA SEED, above), and "time stuck" as a tracked metric.

### Inferences (applied to the live file, `games/mainhattan-overdrive/index.html` on `alex/brave-carson-rbpmlk`, 2,905,867 bytes, inspected locally)
- The main loop is `function frame(now){requestAnimationFrame(frame);… let dt=Math.min(.05,fms/1000)…}`, a **variable dt clamped to 50 ms**. There are **104 `Math.random()` calls**. As a result, today's runs are neither reproducible nor speedable. A 30 s scenario must take 30 s of wall time, and any replay drifts.
- The cheapest unlock is to add a test-only `window.__odStep(n, dt=1/60)` that runs the existing frame body n times with a fixed dt (no rAF, optionally skipping render), plus a seeded PRNG behind `?seed=N`. A test can then simulate 10 s of driving (600 steps) in well under a second of CPU, physics only, the same way Rare calls `Tick(1.0f)`. Playwright `page.clock.runFor` is an alternative that needs no game change, but it still renders every frame, so it is slower. **Estimate, not measured.**

### Gaps
- I have not measured how long one `frame()` takes headless without rendering. That number sets the real speed-up.

## 4. Testing "feel" and fun cheaply

### Takeaway
No studio claims automation can judge fun (Rare says explicitly it cannot). The industry proxy is **telemetry thresholds on bot or human runs** plus human-like bots (King: mimic, don't optimise).

### Cited Findings
- "checking game experience and assessing how the game feels to play really can't be done by an AI" — [Masella PDF](https://media.gdcvault.com/gdc2019/presentations/Masella_Robert_AutomatedTestingOf.pdf)
- King's bots aim to mimic human players to estimate difficulty, not to win. — [InfoQ](https://www.infoq.com/articles/candy-crush-qa-ai-saga/)
- EA MultiGAIL blends "careful" and "reckless" personas in a racing game. — [EA SEED](https://www.ea.com/seed/news/seed-ml-research-aaa-game-testing)
- EA's vehicle work measured path completion time and number of times stuck. — [EA SEED](https://www.ea.com/seed/news/seed-ml-research-aaa-game-testing)

### Inferences
- Proposed metrics, each with a fail threshold: wall hits/min, % time with speed <2 m/s while gas is held (stuck %), longest stuck stretch, airtime per minute, mean lateral offset from the road centreline, steering reversals per second (twitchiness), tyre-to-road gap (≤0.05 m, already a gate), and console errors. Compute them inside the game (`window.__odTelemetry()`), so the same numbers come from a bot run, from the owner's own play, and from tPlay. This turns owner complaints into thresholds, as CLAUDE.md lesson 2 already asks.
- Run two bot personas (careful and reckless) over the same seeded route and compare the metrics.

### Gaps
- No public studio data gives target values for racing-game wall hits or stuck %. The thresholds must be calibrated on Alex's own play sessions.

## 5. Mobile Safari/WebKit coverage from a Chromium-only cloud

### Takeaway
Playwright's WebKit build is a useful **layout and JS** check (viewport, touch events, CSS), but it is not iOS Safari, and WebGL on Linux WebKit is weak. Real-device iOS Safari through Playwright exists on BrowserStack. Otherwise, use Alex's screen recordings.

### Cited Findings
- Playwright WebKit on Linux is not Safari. WebGL tests "will likely fail" (software rendering), it runs 2–5× slower than Chromium, and timeouts should be 90–120 s. **[UNVERIFIED, vendor docs]** — [Endform WebKit support](https://endform.dev/docs/explanation/webkit-browser-support)
- Playwright device profiles (e.g. iPhone) emulate viewport and user agent only. Bundled WebKit can miss real iOS rendering and GPU behaviour. — [BrowserStack Playwright iOS guide](https://www.browserstack.com/guide/playwright-ios-automation)
- BrowserStack Automate has run Playwright on **real iPhones and iPads with Safari** since 12 June 2025, with video, network logs and orientation control. **[Vendor claim]** — [BrowserStack press release](https://www.browserstack.com/press/browserstack-becomes-the-first-platform-to-enable-playwright-testing-on-real-ios-devices-with-safari). LambdaTest (now TestMu AI) markets similar Playwright iOS testing — [TestMu blog](https://www.testmuai.com/blog/playwright-ios-testing/)

### Inferences
- Add one Playwright-WebKit project with an iPhone-like 852×393 landscape viewport that runs only the **HUD/touch layout spawn tests** (button overlap, text ≥12 px, rotation). This catches overlap bugs like v85b's BRAKE-over-GAS. Skip WebGL golden images there.
- Real-device checks (BrowserStack trial or Alex's recording) belong only to release candidates.

### Gaps
- I did not verify whether WebGL works in Playwright WebKit in this specific container. Run `npx playwright install webkit` and do a 1-minute try.

## 6. Recommended test pyramid for Mainhattan Overdrive

### Takeaway
Copy Rare's shape: many seconds-fast **spawn tests** (actor-test equivalents) run in one already-loaded page, a few golden-path drives, a handful of golden screenshots, and a single short real-input run. tPlay moves from per-fix gate to release-candidate only. Target per-fix gate: **< 2 min wall time**, versus 17–70 min today.

### Cited Findings (basis)
- Ratios and speed: 70% actor tests at ≤0.1 s each, 5% integration at ~20 s, slow tests used sparingly; retry-once and quarantine. — [Masella PDF](https://media.gdcvault.com/gdc2019/presentations/Masella_Robert_AutomatedTestingOf.pdf)
- Deterministic WebGL screenshots with frozen randomness, 0.1% pixel tolerance, and explicit exclusions. — [three.js e2e](https://raw.githubusercontent.com/mrdoob/three.js/dev/test/e2e/puppeteer.js)

### Inferences: the concrete pyramid (budgets are targets, not measurements)

| Tier | What | How | Count | Budget |
|---|---|---|---|---|
| T0 Static | Page loads, 0 console errors, split-build size < 3.6 MB, `OD_CHANGELOG` entry exists, `ALL_OPEN`, credits present | node + one Playwright load | 1 | ≤20 s |
| T1 Spawn tests ("actor tests") | One requirement each: spawn the car at X with speed V, step N fixed frames, assert state. Examples: tyre gap ≤0.05 m on 5 road types; car at 60 km/h into a wall slides with yaw <30° and does not stop dead; steering at 80 km/h gives turn radius in [a,b]; every humanoid type height < car-height × k; boat y ≈ water y; traffic car on road; garage opens and closes; no HUD element overlaps controls at 852×393 (DOM rects) | `window.__odTest.run(name)` inside the game: reuses the 📍 GO spawners plus an `assert` and a fixed-dt `__odStep`; seeded RNG; runs all tests in the same loaded page with a reset between them | 30–80 | ≤0.5 s each, ≤60 s total |
| T2 Golden-path drives | Seeded scripted bot drives a fixed route (Frankfurt loop, Athens loop, boat crossing) with fixed-dt stepping. Asserts route completion and telemetry thresholds (wall hits/min, stuck %, airtime) | same harness, physics-only stepping | 3–5 | ≤15 s each |
| T3 Golden screenshots | 852×393: start, Frankfurt, Athens, side view of car and traffic, garage. Frozen seed, time and camera; `toHaveScreenshot` with `threshold 0.2`, `maxDiffPixelRatio ≈0.01`; failures go into the grid for a human or AI to LOOK at, and a deliberate art change re-pins | Playwright Chromium (SwiftShader) | 5–7 | ≤30 s |
| T4 Real-input sanity | Short tPlay: real touch and keyboard, human-like steering, 60–120 s per city, telemetry thresholds | existing `tools/tPlay.js`, trimmed | 1–2 | ≤5 min, release candidates only |
| T5 Overnight/occasional | Full 17–70 min tPlay, WebKit layout pass, real iPhone (BrowserStack or Alex's recording), perf trend (fps, draw calls via `renderer.info`, JS heap) | background | — | not per-fix |

Practical rules taken from the sources:
- **The checklist is the test list.** Each `OD_CHECKLIST` item gets a `run()` that returns PASS or FAIL plus measured numbers. The same "📍 GO" button lets Alex run it by hand and see the verdict on screen (in seconds). A `?selftest=all` URL runs everything and prints a table, so Alex, workers and CI share one runner.
- **Assert on state, poll with a timeout**, never fixed sleeps (Rare). Use one requirement per test, except where load cost dominates; then combine related checks (Rare).
- **Determinism first:** add a fixed-dt step path and a seeded `Math.random` behind a test flag. Without these, T1–T3 stay flaky and real-time bound.
- **Flake policy:** retry once; quarantine a test that fails 3 runs in a row and notify its owner; delete it if unfixed after a week (Rare).
- **Every owner complaint becomes a T1 or T2 test before the fix** (Rare: tests pin behaviour after the change works). This matches CLAUDE.md lesson 1, but moves from 20-minute tPlay repros to 1-second spawn repros. tPlay remains the final "feel" check, and screenshots plus Alex remain the fun judge (Rare: fun can't be automated).

### Gaps
- Real timings for T1/T2 in this game are unmeasured. The first job is to time one fixed-dt `frame()` without rendering headless, then size the budgets.
- It is unknown how much of the physics lives inside `frame()` versus rAF-only side loops (`SB_frame`, `gbLoop` and `SP_draw` also use their own clamped dt). All of them need to route through the stepper.
