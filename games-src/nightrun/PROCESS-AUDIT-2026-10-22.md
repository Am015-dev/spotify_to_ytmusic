# Nightrun process audit (22 Oct 2026): why so slow, so costly, and still 12-15/100

Owner: "check all the rules of game development, debugging etc, identify the bottlenecks, what is not efficient; look up how others
build games and their skills; amend ours". Sources checked: our CLAUDE.md, PLAYBOOK.md, BRIEF-TEMPLATE.md, WORKER-RULES.md, the last
~60 worker runs (W100-W155); web: pre-production / prototype / vertical-slice practice, automated playtesting, game-dev agent skills.

## What others do that we do not
| Practice (industry) | Us | Effect |
|---|---|---|
| Find the fun first: a cheap prototype of the core loop is played and judged fun BEFORE content, polish, menus, art | We built 45 stages, hub, forge, story, Street Run, lab, then tried to fix fun with ~150 polish tasks | We polish a loop players rate 12/100; polish cannot fix a loop that is not fun |
| Vertical slice: one short, near-final piece (start -> challenge -> resolution) proves the bar before scaling | No slice; every fix lands on all 45 stages at once | Every change is huge, slow to test, and diluted |
| Playtest with people every iteration; numbers support, players decide | The owner's phone is the only real playtest; reviewers scored "fixes landed" (46-48) while players say 12-15 | Weeks of green tests on the wrong thing |
| Headless simulation thousands of times faster than real time, with invariants each tick and seeds to replay | Until today tests played in real time (40-90 s each, 3x, 20 stages); `qa/simhunt.js` now does 285 runs in 2 min and found real bugs (unkillable NaN enemies) in its first run | Most worker time went to watching the game run |
| One owner per system, small codebase | ~100 part files, 45+ flag layers wrapping and overriding each other; the consolidation plan (W112) was never executed | Every fix adds a layer; merges conflict in build.py and generated files; nobody can debug it |
| Skills: reusable how-to files (e.g. a 'vertical slice' skill, a game-design skill) loaded per task | We never loaded the available `fun-game-design` skill; our rules are spread over 6 docs written as reactions to complaints | Workers relearn the same lessons; rules contradict |

## Our bottlenecks (measured this session)
1. **Wrong target**: ~70% of tasks fixed visible defects; almost none changed what the player does (decisions, risk/reward, tension). Score moved 46.3 -> 47.9 in 3 rounds.
2. **Rework**: about 1 in 3 worker results failed review or merged badly (W105 lost, W121/W144/W153 rejected, W133-135 integration, W139 retried) because gates measured proxies.
3. **Test time**: 20-45 min per worker, mostly bot runs in real time. Fixed by rule 9 + simhunt; not yet used by every worker.
4. **Integration**: every branch rebuilds `index.html`, `sw.js`, WHERE.md, MODULES-COMPACT.md and edits the `out=` line in build.py, so every merge conflicts and needs manual repair (one merge crashed the game).
5. **Lost work**: 3 workers' pushes were blocked by the auto-mode permission check (W105, W128, W149 partly).
6. **Orchestrator cost**: I re-ran suites by hand, took screenshots, polled; useful for catching bugs but slow.

## Amendments (applied 22 Oct)
- WORKER-RULES 11-14 (below), BRIEF rules in this file, and `fun-game-design` skill loaded for any design task.
- Next round only if the owner agrees: **stop polishing; find the fun on stages 1-3 only** (a vertical slice), owner plays it on the
  phone, iterate until the owner rates the slice >= 50/100; only then extend to other stages and Street Run.

## Sources
- Game Developer, "What you should take out of pre-production": https://www.gamedeveloper.com/game-platforms/what-you-should-take-out-of-pre-production
- Bugnet, "Vertical slice vs prototype": https://bugnet.io/blog/vertical-slice-vs-prototype-what-to-build-first
- HacknPlan, "Understanding vertical slicing": https://hacknplan.com/blog/understanding-vertical-slicing
- Unity, "Automate your playtesting": https://unity.com/blog/games/automate-your-playtesting-create-virtual-players-for-game-simulation
- Godot autosim (headless seeded simulation): https://godotengine.org/asset-library/asset/edit/21929
- "Exploring Gameplay With AI Agents": https://paperswithcode.com/paper/exploring-gameplay-with-ai-agents
- Vertical-slice agent skill example: https://tessl.io/registry/skills/github/Donchitos/Claude-Code-Game-Studios/vertical-slice
- shmup pacing discussion (popcorn vs threats, downtime): https://www.player2.net.au/2025/12/schildmaid-mx-review-a-little-off-target/
