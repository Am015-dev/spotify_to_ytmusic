# Game dev pipeline: fast iteration practices and how they map to Mainhattan Overdrive

Scope: studio iteration practices, playtest and sign-off gates, web build pipelines, AI-agent workflows, and what this project should change first. Project facts used for mapping (from the brief, not re-verified): one ~3 MB three.js HTML file split into km.js + models/*.js, built from ~100 src/*.js modules by shell scripts; 8 cloud workers cost ~$121 in one day; ~70% of worker wall time went to waiting on 17–70 min automated play tests (tPlay); $50 went on a track builder the owner rejected; no release shipped that day.

## Iteration-speed practices (hot reload, data-driven tuning, feature flags, trunk-based dev, vertical slices, greybox, find-the-fun)

### Takeaway
Studios that iterate fast keep the cost of each experiment tiny. They prototype the core mechanic in days with placeholder art, kill most ideas early, put tuning values in data rather than code, and use short-lived toggles so unfinished work can merge to trunk without blocking a release. This project currently does the opposite: every change touches one huge build, waits on a long play test, and ships behind no toggle.

### Cited Findings
- **Supercell kills most prototypes.** In the GDC 2016 talk "Quality Is Worth Killing For", game lead Jonathan Dower said that of Supercell's last 10 games, only Clash Royale reached worldwide release. Seven were closed at the prototype stage and two at the end of soft launch. Teams ("cells") have 3–15 people and set their own roadmaps. — [GDC Vault session](https://gdcvault.com/play/1023160/contactUs); [wnhub summary](https://wnhub.io/news/other/item-11070); [GamesBeat](https://gamesbeat.com/?p=130961) (the kill counts differ by date: GamesBeat reported 4 published and 14 killed).
- **Supercell revives shelved prototypes.** Ilkka Paananen said in a BAFTA lecture that Clash Royale was based on an internal prototype, "The Summoners", which was shelved before Clash of Clans because "real-time PvP would never work". — [PocketGamer.biz](https://www.pocketgamer.biz/clash-royale-based-on-a-pre-clans-prototype)
- **Nintendo prototyped Breath of the Wild in 2D.** At GDC 2017, Nintendo showed an 8-bit-style 2D prototype. It ran on the 3D physics engine and was used to test chemistry, physics and "multiple ways to reach a goal" before full production. Sources disagree on who built it (Takizawa, Dohta or Fujibayashi). — [TechRaptor](https://techraptor.net/content/8-bit-zelda-breath-of-the-wild-prototype); [Game Informer](https://gameinformer.com/b/news/archive/2017/03/10/nintendo-reveals-early-ideas-for-breath-of-the-wild-included-alien-invasions); [Gigazine](https://www.gigazine.net/gsc_news/en/20170302-nintendo-switch-zelda-2d)
- **Valve treats a design as a hypothesis and a playtest as the experiment.** Mike Ambinder's GDC 2009 slides describe a loop: design, playtest with outsiders, evaluate, repeat. They state that playtesting aims at fun and "is not bug testing, not balancing". — [Valve GDC2009 slides (PDF)](https://cdn.fastly.steamstatic.com/apps/valve/2009/GDC2009_ValvesApproachToPlaytesting.pdf); [Orlando Weekly interview](https://www.orlandoweekly.com/arts/an-interview-with-otronicon-keynote-speaker-mike-ambinder-senior-experimental-psychologist-at-valve-software-2552911/); [GDC2006 HL2 design process (PDF)](https://cdn.fastly.steamstatic.com/apps/valve/2006/GDC2006_HL2DesignProcess.pdf)
- **Valve's "cabals" (unverified detail).** Secondary summaries say Valve split staff into small multi-discipline groups that owned game segments and playtested early. One says Half-Life playtests with outside gamers began about 3 months into the restart. I found no primary detail on this. — [GMTK "Valve's Secret Weapon"](https://gmtk.substack.com/p/valves-secret-weapon)
- **Bungie ran a playtest every day.** During Halo 3 development, an early alpha was playtested every afternoon, open to all employees, and taking part "was part of the job". Kill/death heatmaps came from telemetry. — [Killscreen](https://www.killscreen.com/competitive-gaming-winning-cost-games/); [GamesRadar](https://gamesradar.com/where-not-to-stand-in-halo-3)
- **Riot is "data-informed", not data-driven.** Data is one input alongside designer intuition, and win rate alone is not enough; Riot pairs analytics with surveys and lab studies. — [Riot Insights blog](https://www.riotgames.com/en/work-with-us/disciplines/insights/get-data-informed-on-the-insights-blog)
- **King A/B tests "everything from level sequencing to colours".** Candy Crush Soda shipped a new version every other week on all platforms. — [Crisp blog, A/B testing at King](https://blog.crisp.se/tag/life-at-king). I found no King engineering source on feature toggles.
- **Feature toggles are inventory with a carrying cost (Fowler/Hodgson).**
  - Release toggles "allow incomplete and un-tested codepaths to be shipped to production as latent code" and "enable trunk-based development".
  - Teams should keep the number of toggles low, schedule each one's removal when it is added, and can cap the total count.
  - Toggles separate release from deployment.
  - [martinfowler.com Feature Toggles](https://martinfowler.com/articles/feature-toggles.html)
- **Vertical slice / first playable.**
  - Double Fine's Psychonauts 2 team describes its first playable as an area with combat, quests, UI and audio, "a slice that touches every layer".
  - A university milestone spec asks for an in-engine, playtestable greybox with one polished "beautiful corner".
  - Lemarchand's *A Playful Production Process* (MIT Press) makes "presenting the vertical slice" the gate from pre-production to production.
  - [Double Fine update](https://doublefine.com/games/psychonauts-2/updates/episode-4-were-in-full-production); [mycours.es milestone](https://mycours.es/gamedesign2021/milestone-demo-vertical-slice/); [Kriso TOC](https://www.kriso.ee/db/9780262045513.html)
- **Dreams as a prototyping tool.** Game Informer notes that a prototype can be built from primitive shapes and polished later. I found no Media Molecule source for "find the fun" or for a greybox racing workflow. — [Game Informer review](https://www.gameinformer.com/review/dreams/bringing-your-imagination-to-life)

### Inferences
- **Make a prototype cheap enough to throw away.** Supercell and Nintendo both prove the core with a cheap prototype first. For this project, a feature such as the track builder should start as a ≤1-hour throwaway build, a few screenshots or a 30 s clip, before anyone builds it into the 3 MB file.
- **Move tuning into data.** Driving feel, traffic density and camera are tuning problems. They belong in one `tuning.json`, or a `TUNING` object at the top of km.js, editable live through a `?debug` slider panel (lil-gui or similar, not verified here). Then a feel change needs no rebuild and no full tPlay run. This is the data-driven practice that Riot and King rely on.
- **Use one URL flag per in-progress feature, not branches per worker.** `?ff=trackbuilder`, read in one place, defaulting off in production. This allows trunk-based integration on the live branch and avoids the "anchor conflicts" from parallel edits recorded in CLAUDE.md. Each flag must have a removal date (Fowler).
- **Copy Bungie's daily playtest.** The owner plays the beta artifact once a day and gives one score plus up to 3 complaints. That is the playtest; automated tests are not.

### Gaps
- No primary source found for hot-reload practices at specific studios (Insomniac, Naughty Dog live-update tools). This is commonly cited but unverified here.
- No primary source found for Supercell's prototype timescale (for example, "weeks"). Do not cite one.
- No King engineering source found for its toggle tooling.

## Playtests and owner/designer sign-off before building

### Takeaway
Across the industry, building waits until intent is confirmed with a cheap artefact: a concept, a paper or 2D prototype, a greybox, or a slice. A milestone ("first playable", "vertical slice") is reviewed against stated criteria. The $50 track-builder loss happened because no such cheap confirmation step was taken.

### Cited Findings
- **Valve: hypothesis, then experiment.** A design is a hypothesis and the playtest is the experiment; designers evaluate and repeat. — [Valve GDC2009 slides](https://cdn.fastly.steamstatic.com/apps/valve/2009/GDC2009_ValvesApproachToPlaytesting.pdf)
- **Supercell: the team kills its own prototypes after internal tests.** Paananen says teams decide to kill prototypes after internal testing, and that soft launch more often than not ends in a kill. — [Fast Company](https://www.fastcompany.com/90777774/exclusive-supercell-ceo-ilkka-paananen-clash-of-clans-10th-anniversary)
- **The vertical slice is the pre-production → production gate.** — [Kriso, *A Playful Production Process* TOC](https://www.kriso.ee/db/9780262045513.html)
- **Specs for agents should be self-contained.** Anthropic's Claude Code guidance: for larger features, "have Claude interview you and write a spec before you start implementing". It then says: "the most useful specs are self-contained: they name the files and interfaces involved, state what is out of scope, and end with an end-to-end verification step". — [Claude Code best practices](https://code.claude.com/docs/en/best-practices)
- **Agents need a runnable check.** "Claude stops when the work looks done. Without a check it can run, 'looks done' is the only signal available." — [Claude Code best practices](https://code.claude.com/docs/en/best-practices)

### Inferences
- **Add a "Confirm" gate for any feature over about $5 or 1 hour.** The worker sends the coordinator a mock-up before building: one annotated screenshot, a 1-paragraph spec and 3 acceptance criteria. The coordinator forwards it to Alex as a single yes/no. This conflicts with the standing order "workers never ask Alex". The fix is that the coordinator asks once per feature and workers still never ask. One yes/no message costs far less than $50 of rejected work.
- **Definition of done for this project**, which already exists implicitly in CLAUDE.md and should be written as a checklist per task:
  - the owner's complaint is reproduced
  - the measured metric is past its threshold
  - an 852×393 shot grid has been looked at
  - there are no console errors
  - an OD_CHANGELOG line is added
  - the split build is ≤3.6 MB

### Gaps
- No source found quantifying the cost of skipping pre-production in small teams. The $50 track-builder case is this project's own data point.

## Build and release pipelines for web games (Vite/esbuild vs hand-rolled concat, splitting, streaming, CI)

### Takeaway
esbuild bundles in well under a second for projects this size. Vite adds a dev server with hot module replacement (HMR). Vite 8 (March 2026) uses Rolldown for both dev and production. Replacing shell-script concatenation with esbuild, which is one binary with no config, would give sub-second rebuilds, real code splitting and source maps. The bigger win is decoupling the test from the build.

### Cited Findings
- **Vite 8 is stable as of 12 March 2026.** It replaces the esbuild-for-dev / Rollup-for-prod split with Rolldown, a Rust bundler. The announcement claims builds "up to 10–30x faster", module-level persistent caching, more flexible chunk splitting and a "full bundle mode", and says most plugins work unchanged. — [vite.dev announcing Vite 8](https://vite.dev/blog/announcing-vite8); [Vite 8 beta post](https://vite.dev/blog/announcing-vite8-beta)
- **esbuild is the fastest single-build option but is not a full dev server.** Vite wraps fast bundling with an HMR dev server. One unverified benchmark measured 0.8 s for esbuild vs 2.1 s for Vite on 67 modules. — [Better Stack comparison](https://betterstack.com/community/guides/scaling-nodejs/esbuild-vs-vite/) (third-party; treat the numbers as indicative only)
- **Kahoot's migration.** Kahoot published an engineering post on moving from webpack to Vite. I did not open it, so I am not quoting numbers from it. — [Kahoot tech blog](https://kahoot.com/tech-blog/webpack-to-vite/)

### Inferences
- **Mapping:**
  - Today, ~100 `src/*.js` files are concatenated by shell scripts into one file, then split into km.js + models.
  - With `esbuild src/main.js --bundle --splitting --format=esm --outdir=out/<ver>`, the bundler produces the split automatically: models become lazily `import()`ed chunks.
  - This replaces the hand-rolled split and the "anchor" patching that caused conflicts.
  - Expected rebuild time is under 1 s. This is inferred from esbuild's speed class and not measured on this repo.
- **Asset streaming.** Load Frankfurt first and Athens and the garage models on demand with dynamic `import()`. That cuts first-load size on iPhone and shrinks the 3.6 MB cap problem.
- **CI.** A GitHub Actions job on push can run build, size check and a 60 s smoke test, then publish the shot grid as an artifact. Workers then stop running long tests locally while they wait. The full tPlay runs once per release candidate, not per change.
- **Hot reload for tuning.** Vite HMR, or a simple `fetch('tuning.json')` re-read on keypress, lets a worker or Alex adjust feel without a rebuild.

### Gaps
- Vite 8's 10–30x figure is the vendor's own claim; I found no independent benchmark.
- I found no published case study of a three.js single-file game moving to esbuild or Vite with before and after numbers.

## AI coding agents for game development (2024–2026): task sizing, spec-first, small PRs, cost, context, parallel vs one integrator

### Takeaway
The vendor guidance converges on four rules: keep context small, plan or spec before coding, give the agent a fast pass/fail check, and use a fresh-context reviewer. Multi-agent fan-out multiplies tokens about 15x and suits coding poorly because coding tasks share context and depend on each other. This matches this project's own finding that parallel workers on one 3.7 MB file caused rebuild loops.

### Cited Findings
- **Context is the main constraint.** "Most best practices are based on one constraint: Claude's context window fills up fast, and performance degrades as it fills." — [Claude Code best practices](https://code.claude.com/docs/en/best-practices)
- **Explore → plan → implement → commit, but skip the plan for small changes.** "If you could describe the diff in one sentence, skip the plan." — [Claude Code best practices](https://code.claude.com/docs/en/best-practices)
- **Reset after repeated corrections.** "After two failed corrections, /clear and write a better initial prompt… A clean session with a better prompt almost always outperforms a long session with accumulated corrections." — [Claude Code best practices](https://code.claude.com/docs/en/best-practices)
- **Use a fresh-context reviewer.** The Writer/Reviewer pattern uses a separate session because "a fresh context improves code review". The guidance warns that a reviewer asked to find gaps "will usually report some, even when the work is sound", which leads to over-engineering. It advises restricting the reviewer to correctness and stated requirements. — [Claude Code best practices](https://code.claude.com/docs/en/best-practices)
- **Keep CLAUDE.md short.** "Bloated CLAUDE.md files cause Claude to ignore your actual instructions"; for each line, ask "would removing this cause Claude to make mistakes?". Rules that must always run belong in hooks. — [Claude Code best practices](https://code.claude.com/docs/en/best-practices)
- **Multi-agent token cost.** Agents use about 4x the tokens of chat, and multi-agent systems about 15x. Multi-agent is a poor fit when agents must share context, have many dependencies, or are doing coding ("fewer truly parallelizable subtasks"). — [Anthropic, multi-agent research system](https://www.anthropic.com/engineering/multi-agent-research-system)
- **Developers misjudge AI speed-ups.** METR's July 2025 RCT had 16 experienced open-source developers work 246 real issues in their own large repos. With AI tools they took about 19% longer, while believing they were about 20% faster. This used early-2025 tools, and METR cautions that the result may not generalise. — [eWeek](https://eweek.com/news/news-ai-tools-slow-developer-productivity-study); [DX summary](https://getdx.com/blog/metr-study-on-how-ai-affects-developer-productivity/) (secondary; METR paper not opened)
- **Task length agents can handle.** METR's "time horizon" (the task length agents complete at 50% success) has doubled about every 7 months (212 ± 40 days). The 80%-success horizon is about 4x shorter: 15 min vs 59 min for the best model in the original paper. Secondary sources claim 12–14 h at 50% for early-2026 models; these figures are unverified and conflict. — [Forethought](https://www.forethought.org/research/is-there-a-half-life-for-the-success-rates-of-ai-agents); [arXiv 2505.05115](https://arxiv.org/pdf/2505.05115); [LessWrong projection](https://www.lesswrong.com/posts/wM9LCAtuza4d3Z7oA/will-ai-progress-accelerate-or-slow-down-projecting-metr)

### Inferences
- **Size tasks to the reliable horizon, not the 50% one.** One worker task should be one owner complaint or one tuning change, verifiable in under 5 minutes. "Build a track builder" is a multi-hour, low-reliability task and needs a spec and a Confirm gate first.
- **Cost math for this project.**
  - $121 / 8 workers ≈ $15 per worker-day, with ~70% of wall time spent waiting on tPlay.
  - The waiting is not billed as tokens, but each re-check after a test re-reads context, and CLAUDE.md records that 99.8% of tokens were context re-reads.
  - Cutting test turnaround from 17–70 min to under 5 min (a scoped smoke test per change, full tPlay per release candidate) removes most idle time and re-reads.
- **Parallelism.** Anthropic's 15x multiplier and its "poor fit for coding" note support CLAUDE.md's existing rule of one fix worker plus one integrator. Running 8 workers in one day broke that rule.
- **CLAUDE.md is long (~70 lines of standing orders and lessons) and loads into every session.** Per the guidance, prune it and move the deploy and review checklists into skills or hooks (for example, a Stop hook that blocks completion when the OD_CHANGELOG entry is missing).

### Gaps
- No rigorous public source found on AI-agent teams building games specifically. Claims in this area are mostly vendor blogs or anecdotes.
- No source found comparing the cost of "many short sessions" vs "one long-lived owner session" with numbers. CLAUDE.md asserts both a fresh session per task and one long-lived owner session, which partly conflict.

## What this project should change first (concrete, measurable)

### Takeaway
Fix the feedback loop before adding features. In order: (1) confirm intent cheaply, (2) make the per-change test fast, (3) put tuning in data, (4) replace the concat build with esbuild, (5) cap parallel workers. Each step has a number to check.

### Cited Findings
- Practices are cited in the sections above (Supercell/Nintendo prototype-first; Valve/Bungie frequent playtests; Fowler toggles; Vite/esbuild; Anthropic context and verification guidance; METR horizons).

### Inferences (recommendations, ranked; targets are proposed, not measured)
1. **Confirm gate before building.** Any task estimated over $5 or 1 h gets a 1-paragraph spec, 3 acceptance criteria and one mock shot, sent by the coordinator to Alex as one yes/no. Target: $0 spent on rejected features. Measure as rejected-feature spend per week.
2. **Two-tier testing.**
   - Per change: a ≤5 min scoped check (build, size cap, console errors, a 60 s tPlay segment on the affected area, the shot grid).
   - Per release candidate: one full tPlay, run in CI or the background, never blocking the worker.
   - Target: worker idle-waiting below 20% of wall time (currently ~70%), and median change-to-REVIEW time under 30 min.
3. **Tuning in data with a live debug panel.**
   - All driving, camera and traffic constants go in one `TUNING` object or a JSON file.
   - Add a `?debug=1` slider panel and a URL-param override (`?t.grip=1.2`).
   - Target: a feel tweak ships without a rebuild, and Alex can try variants A and B via two links in one message.
4. **esbuild instead of the shell concat.**
   - Use `--bundle --splitting --format=esm`, with dynamic `import()` for Athens, the garage and models.
   - Targets: rebuild under 2 s, first-load JS on iPhone under 1.5 MB (proposed), no manual split step, no anchor patching.
   - Vite (HMR) is optional; plain esbuild plus reload is enough.
5. **URL feature flags instead of long-lived branches.**
   - Unfinished features merge behind `?ff=name`, off by default.
   - At most 3 flags live at once, each with a removal date.
   - Target: zero merge or anchor conflicts per week.
6. **One worker plus one integrator, enforced.**
   - Allow 8 sessions per day only if they work on independent files.
   - Target: ≤$40 per shipped release. The current figure is $121 for 0 releases.
7. **A daily owner playtest as the real gate.**
   - One beta link per day, and Alex answers with a score plus up to 3 complaints.
   - Each complaint becomes one tPlay threshold and one worker task.
   - Target: at least 1 release per day while fixes are queued.
8. **Prune CLAUDE.md** to the rules whose removal would cause mistakes. Move the deploy, review and changelog procedure into a skill and a Stop hook. Target: CLAUDE.md under 40 lines; startup tokens measured with `/context`.

### Gaps
- Baseline numbers (the actual per-change tPlay duration distribution, build time of the current scripts, first-load bytes) were not measured in this research. Measure them before and after to validate the targets.
