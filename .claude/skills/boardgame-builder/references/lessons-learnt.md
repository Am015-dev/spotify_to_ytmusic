# Lessons learnt (Game Night Shelf, 9 games, Sept–Oct 2026)

These came from building and iterating Crown City Smash, Nebula Aces, Doorkick Dungeon, Shipwreck Isle, Sands of Qamar, Sunglaze and Rampart & Vine with one demanding user. Each item is a complaint or a bug that really happened. Read this list before starting, and again before you deliver.

## What the user actually asks for, in the order the requests arrived
1. **"The real game" with every expansion.** Simplified versions were called boring every time. Do the research first and record every card, number and expansion.
2. **A card and token list inside the system:** a reference drawer in each game and a shared reference page.
3. **Board-first layout:** "I have to scroll, text overlaps the board, use popups that close". See `layout-shell.md`.
4. **Learnable by a newcomer:** "very confusing… the rounds and steps need to be planned better". See `newcomer-ux.md`.
5. **AAA look:** "more AAA games rather than sloppy objects and drawings". See `graphics-aaa.md`.
6. **Real sound and music, free:** CC0 samples, with the synth kept as fallback. See `audio-perf.md`.
7. **Works on real devices:** a speed tool, auto quality and an idle saver. See `audio-perf.md`.
8. **Free hosting and online play with friends:** GitHub Pages plus WebRTC peer-to-peer. See `online-p2p.md` and `delivery.md`.
9. **A good-looking shelf:** real screenshots as covers, not drawn placeholders, and every game listed, including ones built elsewhere.

Plan for all nine from day one. Retrofitting each one across seven games cost far more than building it in would have.

## Rules fidelity
- Research with an agent that fetches the rulebook, the FAQ and the BGG forums, and writes `rules-notes.md` with a **Confirmed vs. guessed** section plus JSON data files (cards, missions, tiles). Real names go in `ref` fields only, and the raw research is never committed.
- Write a rules test per tricky rule (`rules-test.js`). An audit agent found real rule errors in two shipped games. Run an independent "rules audit" pass against the rulebook before you call a game done.
- **Phase names drift.** A power checked `G.phase==='move'` while the real phase was `'turn'`, so it never fired. Only a coverage run catches this.
- **Conserve components.** Use an invariant that every tile or card is in exactly one place, checked after every move in the coverage test. It caught a card that was never discarded and one that was discarded twice.
- **No functions in `G`.** Pending questions are `{h:'handlerKey', d:{...}}`. Closures break save/load, the network sync and host migration.
- **Stalls come from "can't legally do anything".** Look up what the rules say for that case, implement it, and list it as an assumption if it's unclear.

## Interface and flow
- **The dock always says what the game is waiting for**, in plain words, with a button for every option. Never make the player guess the next click.
- **Turn complex rounds into guided steps:** a round roadmap, one phase card at a time with Continue, wizards for planning (needs → assign → risks → confirm), and a recommended option with "why". "Guide full/light" lets veterans turn it down.
- **Hot-seat "pass the device" screens** are needed for hidden information, but must never appear online.
- **Don't stack popups.** The tour, a question and the computer's roll appearing together on turn 1 confused the reviewer. Queue them.
- **No hover lifts on clickable things.** An element that moves away from the pointer on `:hover` causes a hover/unhover loop that made frames 6× slower and stalled a test. Use an invisible hit area if you want a lift effect.
- **`[hidden]{display:none!important}`.** A `display:flex` rule on a hidden overlay once covered the whole 3D board.

## Graphics
- Ask once for an art direction (3 concrete options). Then build tokens, materials and lighting to the brief in `graphics-aaa.md`.
- A Graphics setting (Auto/High/Medium/Low, saved per device). Auto picks Low on software GPUs: detect SwiftShader/llvmpipe from the `WEBGL_debug_renderer_info` string.
- Always keep a 2D fallback board: jsdom has no WebGL, and the click tests play through it.

## Testing (also see `testing.md`)
- **Four test layers per game:**
  - gauntlet: computer vs computer;
  - coverage: random + AI play with invariants checked after every move;
  - jsdom clicker: real buttons only, in every mode;
  - Playwright layout check: real WebGL at 4 sizes, with `elementFromPoint` showing the board is uncovered.
- **Look at the screenshots yourself.** Several "PROBLEMS 0" builds still had ugly overlaps that only a human-style look caught.
- **The sandbox is slow.** It uses SwiftShader, so 3D frames take 50–200 ms, and the load average was 25+ when 6 agents ran at once. Real-time countdowns and animations crawl, so timeouts need to be generous (`setDefaultTimeout(150000)`). Fake page loads with `route()` to `https://gns.test/` and abort Google Fonts, or `load` never fires.
- **Commands are killed after ~5 min.** Run long jobs in the background, write their output to files, and read the files afterwards.

## Working with agents
- **One brief file per kind of work** (`BRIEF-games.md`, `BRIEF-graphics.md`, `BRIEF-perf-audio.md`, `BRIEF-online.md`). Each agent prompt then says "follow the brief, plus these game-specific details". The briefs are in `assets/briefs/`.
- **Run at most 6 heavy agents at once.** More than that and Playwright timeouts begin to look like bugs.
- **Give each parallel agent its own resources** (relay ports 17702–17707, its own folder). Tell agents never to touch shared modules; they propose patches instead, and you apply them once.
- **The container can restart.** Background agents and jobs die, but the files survive. Resume each agent with SendMessage and tell it to check its state and re-run what was killed.
- **Never `pkill -f <pattern>`** from a shell whose own command line contains the pattern: it kills itself (exit 144).
- **Verify every agent report.** One "bad actions changed the state" result was the test script sending a legal move. Re-run the critical checks yourself before you claim anything.

## Delivery
- See `delivery.md`. In short:
  - **claude.ai artifact:** read the live version before republishing. The shelf hosts each game as a supporting file.
  - **GitHub Pages:** the repo's Settings → Pages → Source must be set to "GitHub Actions", and the branch allowed in the `github-pages` environment. Only the repo owner can do this.
  - **Source of truth:** keep the latest copy of games made in other sessions (e.g. Mainhattan Overdrive) as their standalone artifact. Don't copy from the shelf, which may be stale.
- **Report honestly.** State what was not tested (real networks, real GPUs, real ears) and any flaky area (online rejoin) with numbers.

## Saving work and saving tokens (Short Fuse and the private Doorkick, Oct 2026)
- **Cloud sessions are temporary.** Anything only in the scratchpad is lost when the container stops. Commit and push often: public game sources to the public repo, private material to `Am015-dev/game-night-private`. A `git push` costs almost no tokens; uploading a file through a tool call costs about as many tokens as its size, since the content passes through the reply.
- **Use cheap models for bulk work.** Haiku agents for downloads and simple loops; Sonnet for merging and classifying; the main model for design and review. Haiku agents run out of context after about 50 image reads, so never have them look at hundreds of images.
- **Read card scans with local OCR** (`pip install rapidocr_onnxruntime`): free and accurate, with text positions. Google Drive's own image text (`read_file_content`) is cheaper still, but it appears only some time after upload: freshly uploaded images come back blank.
- **Check an agent's first results before scaling out.** Four Haiku agents "finished" 1,800 cards, all blank, because Drive hadn't scanned them yet. One trial agent and a look at its output would have caught it.
- **Auto mode may block decoding downloaded Drive files** to disk as "data exfiltration". Don't work around it; ask the user to allow it.
- **Copyright split:** our own notes and generators can be public. Publisher rulebooks, FAQs, card scans and saved web pages stay private, even when they're free to download.
- **When usage runs low:** stop the agents at a safe point, copy their files into the repos, push, and write a `RESUME.md` with the exact next steps.

## Running a big build cheaply (Short Fuse, private Doorkick, Tidewake, Oct 2026)
- **Tier the models.**
  - The main model plans, makes the calls on open rules questions, and reviews every report: it checks each claim before telling the user.
  - Sonnet builds: engine, AI, kit, UI, online, audits, newcomer reviews.
  - Haiku does only dumb loops: downloads, simple transcription.
  - Write the planner's decisions into a PLAN.md and point every agent at it.
- **Split the work by file ownership, so agents can run in parallel.**
  - Engine agent: `src/engine.js`, `data.js`, `rules-test.js`.
  - AI agent: `src/ai.js` only.
  - UI agent: `ui.js`, `head.html`, `body.html`, `build.py`.
  - Online agent: `net.js` and `netstrip.js`.
  - Each brief says "don't touch X, another agent is editing it".
  - Reviewers get a frozen copy of the build, so they don't see half-edited files.
- **Proven order:**
  1. research;
  2. in parallel: engine and AI, 3D kit, audio;
  3. UI integration, then the layout pass;
  4. online play;
  5. in parallel: rules audit and newcomer review;
  6. fix agents for each;
  7. a final rebuild where you yourself run every test: click, rules, a watched browser game, the p2p scenarios;
  8. deploy, then check the live page.
- **Deploy a preview early** when the user wants to test, with honest "Preview" chips, and keep improving behind it.
- **Re-run the online leak tests after any engine change.** A rules fix added reds to more jobs, and the net strip leaked "a red exists" through a placeholder it kept for one job only. Prefer whitelist strips.
- **Rules fixes change AI strength.** Re-measure win rates per job, and give the AI agent the new rule (e.g. "probing a red explodes") straight away.

## Card scans and OCR
- **Drive's own image text** (`read_file_content`) is free, but only exists for images Drive has already indexed. Fresh uploads come back blank for hours, and agents will happily "finish" a whole run of blanks. Check one trial result before scaling out.
- **Local OCR is free and good:** `pip install rapidocr_onnxruntime`, then about 1 card/s per process. Run 4 processes in parallel and keep the text positions. Spaces get lost ("300 GoldPieces"), so let the parsing agent re-space them. Have it LOOK at the image only where the OCR is garbled.
- **Vision reads are expensive:** about 2,500 tokens per card, and a Haiku agent runs out of context after roughly 50 images. Never use vision for bulk reading.
- **Getting the user's files in:**
  - The cheapest, unblockable route is the user uploading the folders to the private GitHub repo: GitHub Desktop, or web upload (100 files per drop, files of 25 MB or less, so no big zips).
  - Ask them to keep folder and file names, since some series reuse file names across subfolders.
  - Match files to the inventory by folder and file name.
  - Drive downloads through the connector go via a saved tool result, then a decode script. Auto mode often blocks this as "exfiltration" in subagents, even with a permission rule in place. Don't fight it; ask the user.
- **Sort a collection by file-name prefix first.** One folder the user named after a single series held none of that series, only 12 other series. Knowing that early changes the plan.
- **Embed images** at about 240px JPEG q70 as data URIs, so the private build works offline. Prefer that to Drive thumbnail links, which need the user signed in and fail offline.

## Permissions, safety checks and saving work
- **When auto mode blocks something** ("data exfiltration", "PII", "self-modification"), stop, tell the user exactly what was blocked, and offer options. Never route around it.
- **A narrow allow rule** in `.claude/settings.local.json` (excluded via `.git/info/exclude`) works for the main session. Subagents may still be blocked.
- **`rm -rf` on a glob after a `cd` is refused.** Make a fresh folder instead (e.g. `snap$(date +%H%M)`).
- **Other sessions push to the same PR branch.** Always `git fetch` + merge before pushing, and never force-push.
- **Private material lives in a private repo**, pushed with git (almost no tokens). Don't upload big files through connector calls: the content passes through the reply and costs about its size in tokens.
- **Copyright split:** our own notes, generators and paraphrases can be public. Publisher rulebooks, FAQs, card scans and saved pages stay private, even when free to download.

## "All games are confusing, boring and sloppy" (15 games, Oct 2026)
- **Passing AI reviews ≠ clear or fun.** AI reviewers read every word. The owner, on an iPhone, didn't, and every text-heavy game failed. Gate "done" on the human-like blind testers in `board-first-play.md`, not on the newcomer review alone.
- **Clarity work made things worse when it added text.** Advisors, wizards, roadmaps and "why" panels piled up until the board was hidden. Replace text with board interaction: tap the piece, targets glow, effects animate.
- **"Not like the real game"** meant the game's signature thrill was missing, even though the rules were right. Name that moment in the plan and build it first, big, with sound and suspense.
- **Portrait phone is the main device.** Several games were "unusable in portrait". Test at 390×763 and 375×553 first.
- **Bugs that destroy trust:** suggestions contradicting their own text; score breakdowns that don't add up; "you choose because you're losing" while leading; one action ending a whole phase; "once-only" cards coming back. Each needs a failing test before its fix.
- **Story mode with bosses and a difficulty curve** is expected. See `board-first-play.md`.
- **Prove one game before fanning out.** A standard rolled out to 13 games at once was wrong 13 times. Get one game through the blind-tester bar, then copy what worked.

## Cost and coordination (about $4,000+ spent, mostly waste)
- **The main cost was the coordinator's huge context being re-read on every step**: about 460K tokens, roughly $0.09 a step plus about $2.30 per cache rebuild. Cloud sessions cost $5–80 each. Long-lived orchestration chats are the most expensive thing you can do.
- **Rules:**
  - Keep the coordinator context small; start a fresh session per batch of work with a short handoff file (`HANDOFF.md`).
  - Do the work in ONE session, with at most 2 subagents at a time. Don't spawn many cloud sessions.
  - No PR subscriptions, polling, self check-ins or wake-ups unless the user asks.
  - Do 1–2 games per session, finished to the acceptance bar, rather than 15 half-done ones.
  - Commit at milestones only, and background long jobs.
  - Use cheap models for bulk loops.
- **The user hates:**
  - many open sessions;
  - being asked to "review" PRs, especially without links;
  - not knowing what changed.
- **What to do instead:**
  - Merge your own work into the working branch.
  - Archive finished sessions.
  - Keep one `previews.html` page linking every preview with a one-line "what's new" per game.
  - End every delivery with **one link** and a few lines: what changed, before → after numbers, what's still weak.
- **Previews before live.** Publish to `<slug>-next/`. The live game changes only after the owner OKs it on their phone.
