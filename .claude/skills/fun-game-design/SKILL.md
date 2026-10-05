---
name: "fun-game-design"
description: Process and hard-won lessons for designing and building games people actually find fun — especially browser/mobile games built as single-file HTML artifacts. Use this skill WHENEVER the user asks to make, design, prototype, improve, fix, or evaluate a game of any kind (mobile, browser, puzzle, story, cozy, action, card, board), says a game is "boring", "not fun", "ugly", "confusing", "not challenging", or "broken", asks to "run the gauntlet loop" on a game, or wants a game as a personal gift. Also use it before pivoting a game concept, before self-scoring a game, and before claiming a game is fun or finished.
---

# Fun Game Design

This skill exists because a long session produced ~30 game versions across 12+ concepts
(tap-orbit, merge, card battlers, roguelike deckbuilder, push-your-luck, co-op board game,
echolocation adventure, stealth, tidy-up physics, rules-based puzzles, story vignettes) and the
user rated nearly all of them "boring". Every build *worked*. None was *fun to this user*.
The lessons below are what would have prevented that. Read `references/session-log.md` for the
full history if you are continuing that project (Vienna / Daphne).

## The one rule that matters most

**Never trust your own fun score.** Claude scored a game 8.0/10 with a detailed rubric; the user
scored the same build 2.5. Automated tests prove a game *runs*, not that it's *fun*. Only the
player's score is ground truth. Report your own evaluation as "what the tests prove" and "what only
you can judge", never as "it's an 8".

## Phase 1 — Discovery BEFORE any code (do not skip)

Most failed iterations came from guessing. Ask these up front, as tappable options
(`ask_user_input_v0`) so it costs the user seconds, not paragraphs:

1. **Reference games**: "Name 1–3 games you've loved playing (any platform)." This is the single most
   useful input. Without it you are inventing both the genre and the taste.
2. **Kind of fun** (single-select): clever puzzles · chaos/destruction · fast reflex action ·
   cozy build/decorate · story/emotional · competitive.
3. **Tension dial**: calm-no-fail · calm-but-demanding · light pressure · high stakes.
   (This user wanted "challenging but calm" — both halves matter; see Phase 3.)
4. **Purpose & people**: Is it for someone real? Get the real names, pet names, true details,
   what they look like, what matters to them. In this session the real subject (Daphne and her
   blind cat Vienna) surfaced only after ~25 versions — it should have been question one.
5. **Session shape**: minutes per session, phone vs desktop, sound on/off.

If the user says "just build it", still ask Q1–Q2 in one tappable card, then proceed.

## Phase 2 — Originality check

Before committing to a concept, `web_search` for existing games with the same core hook.
In this session "blind cat + echolocation" already existed (Wanderment, Blind Frequency,
Perception) and the user immediately called it "nothing new". State honestly what the closest
existing games are and what is genuinely different. A reskin of a known genre is fine only if the
user asked for that genre.

## Phase 3 — Design the core loop, not the features

Write down, in one sentence each, before coding:
- **Every 10 seconds** the player decides ___.
- **Every minute** the player gets better at / discovers ___.
- **Across sessions** ___ grows (unlocks, collection, story, home).

If any line is empty, the game will feel boring regardless of art or story.

Failure patterns observed (each one got a "boring"/"bad" from the user):
| Pattern | Why it failed |
|---|---|
| Fetch quests ("find 3 treats, go to X") | No decision; the path is given |
| Chores as mechanics (tidy up after yourself) | Undoing your own fun is work |
| Slow platformer controls on phones (◀ ▶ Jump) | Walking is not a decision |
| Luck-heavy push-your-luck | Skill barely matters (expert beat beginner 57%) |
| Too many new mechanics at once | "Confusing, nobody understands" |
| Threat-based challenge (chases, hearts, red flashes) | "Full of anxiety" |
| Removing all threat with nothing replacing it | "Not challenging at all" |
| Rounds + stars bolted onto shallow interactions | Still boring — difficulty ≠ depth |
| Rules-based puzzles from a generator | "Stupid and repetitive, nothing new" |
| Systems-first design with story as decoration | Hollow; repetitive by nature |

**Calm AND challenging** (this user's explicit ask) means: no timers, no losing, no enemies —
but real *thinking*: puzzles with an "aha", hand-authored (not generated) levels, each level
introducing or twisting one idea, mastery visible in the result. Difficulty knobs (faster, smaller
hit-box, fewer hints) are not depth.

Story-driven games: every scene should have its *own* interaction that expresses the moment
(Florence / Gorogoa style). Handle sensitive real events (illness, surgery, loss) gently and
briefly; let the player *do* something tender rather than read a wall of text.

## Phase 4 — Prototype the smallest fun thing, get the user's score

- Build ONE level/scene of the core loop first. Ask for a 0–10 score and one sentence why.
- Change one thing at a time based on that answer. Do not pivot the whole concept on every
  "boring" — first ask *what* was boring with a multi-select (controls slow / feels like a chore /
  nothing surprising / don't like the idea / too easy / too hard / ugly / confusing).
- Keep a visible scorecard of **the user's** scores per version.

## Phase 5 — Art and presentation

- The user hated: dark screens, fog, neon glow ("my eyes hurt"), busy pixel textures, abstract
  line-art rooms, and code-drawn "boxes" as furniture.
- The user liked (relatively): bright, soft pastel daylight rooms with hand-placed, recognisable
  furniture; clean rounded UI.
- Rooms must make sense. Procedural furnishing produced "100 beds in a room". Hand-place layouts,
  or assign furniture by explicit per-level room zones.
- Real CC0 art beats code-drawn shapes. Kenney packs are reachable via
  `git clone --depth 1 --filter=blob:none --sparse https://github.com/eturner58/game-assets.git`
  then `git sparse-checkout set "kenney/2D assets/<Pack Name>"` (the GitHub API rate-limits; git
  does not). Pack sample `.tmx` maps give exact tile IDs. Embed a cropped atlas as a data URI.
- Sound matters for calm games: WebAudio with a generated reverb impulse, soft piano (triangle +
  sine partials, fast attack, exponential decay), purr = low-passed noise × 24 Hz LFO, bells =
  inharmonic sine partials. Init audio on the first user gesture.

## Phase 6 — Gauntlet (testing) that actually catches problems

Read `references/testing.md` and use `scripts/real_input_playtest.py` as the template.
Key rules learned the hard way:
- **Test through real input** (Playwright mouse/touch/keyboard on the page), not by calling game
  functions. Internal-call bots passed while the real game was "fully broken": 12 taps of
  dialogue before moving, camera showing black void, fingers racing ahead of a follow mechanic,
  trail endpoints never reached.
- **Solvers for every puzzle**: prove each level solvable, that every given item is required
  (no easier subset works), and count solutions (1–4 = an idea to find). Check links can't pass
  through obstacles.
- **Validate data**: map rows equal length; everything reachable after any auto-placement.
- **Screenshot every scene** and judge against the user's stated complaints, not your taste.
- Distinguish test-script bugs from game bugs before reporting.
- Sandbox tip: the artifact host can fail DNS on some networks — also `present_files` the HTML.

## Phase 7 — Communicating results

- Terse. Lead with what changed and what the user should try. No inflated self-scores.
- Say plainly what tests prove and what they cannot (fun).
- If you've failed repeatedly, stop and say so, and ask for the missing input (reference games,
  specifics) instead of guessing again.

## Phase 8 — Lessons from Mainhattan Overdrive (3D driving game, 2026-10)

- **Script metrics improving ≠ game improving.** Wall-hit and ring counts got better while the owner
  called the build "horrible, uncontrollable": the 15-item HUD covered 40% of the phone, the world was washed out,
  and steering was twitchy. Judge every build on phone-size screenshots you actually look at.
- **Phone HUD budget:** minimap + speed + one objective line; at most 5 touch buttons; nothing over the controls;
  12 px minimum text; cards auto-hide after ~5 s. Test inside an iframe too (the owner plays in the Claude app).
- **Match the owner's reference game trait by trait** (sky, ground, road markings, materials, camera, HUD). Write the
  traits into the brief; compare side by side.
- **Vehicles must sit in the world:** tyres touching the road, suspension pitch and roll, contact shadows,
  dust and skids; boats sit at a waterline and leave a wake. Floating vehicles read as fake instantly.
- **Toy-brick art needs real parts** (curved slopes, wheel arches, windscreens, tyre+rim at true proportions),
  not stacked boxes. One great model beats six bad ones.
- **Find the root cause of visual bugs** (e.g. a white sky was a ceiling of cloud boxes) instead of overlaying fixes.
- **Collision must match visuals:** round colliders, a road setback, glancing hits slide.
- **Check scale of every humanoid type**, not just one.
- **Fix basics (driving, controls, readability) before features.** Less on screen is better.
- **Process cost:** big single-file games make every fresh agent session expensive. Keep one owner session with a
  queue, report every deploy to the owner at once with a screenshot, and never forward unchecked images.
