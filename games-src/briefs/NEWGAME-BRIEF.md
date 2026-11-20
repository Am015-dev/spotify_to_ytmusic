# New game build brief (owner, 20 Nov 2026: "5 more games, free assets, different styles, fun")

Read CLAUDE.md first and obey its hard rules. Never write the original game's, publisher's or designer's name anywhere in the repo or on the site (use your new original name and a slug). No AI attribution in files or commits; commit as am015-dev <alexandrosk21@gmail.com>. Don't edit shell files (games-src/shell/*). Load the skills boardgame-builder, fun-game-design and impeccable, and read games-src/board-first-play.md. Decide, never ask. If an approval is refused, do it another way. Push after every step to your branch (never force-push; `git add` explicit paths only).

## What the owner wants
- A FUN game that a first-timer can play on a phone within 10 seconds.
- RULES IDENTICAL, COMPONENT STRUCTURE IDENTICAL (owner, 20 Nov 2026: "make sure the rules and components are identical"; corrected the same day).
  - Identical: every rule, phase, turn structure, exception and win condition; the component TYPES, their COUNTS and distributions (e.g. how many tokens of each colour, how many cards per level/cost band, dice faces, board size, track lengths, scoring tables). These are game mechanics. Do NOT cut, shrink or "simplify for phone": solve phone fit with UI (zoom, pan, drawers, paging), never by changing the game.
  - Our own: names, art, flavour, AND the creative content where the original's content is an authored work: individual card designs and effect texts in large card pools, scenario/mission maps and campaign stories, event card texts, named characters and their unique abilities, map geography. Design these yourself to the same structure, counts, power curve and balance (same number of cards, same cost bands, same mix of effect types), so the game plays the same way, without copying the original card-for-card or level-for-level. Small mechanical components with no authored content (e.g. tiles defined only by type and numbers, gem cards defined only by cost/bonus/points) may match the original's distribution exactly.
  - Write rules-notes.md and a COMPONENTS.md listing every component type with its count and how your version maps to the original's structure; make rules-test assert the counts and key rules. If something can't be known, mark it [unverified] and tell the orchestrator; never guess silently. The tutorial may use a scripted setup; the real game is the full game.
- The owner recently rejected live games as "unplayable and not fun" even though they passed our checklists. So the bar is a real person playing on a phone and enjoying it, not a test pass.
- A DISTINCT art style per game (your prompt names it), built from FREE assets and code art.

## How to build (don't reinvent the wheel)
1. Copy the closest finished shelf game (shell, campaign, tutorial, help, menu, loader, tests, shared mechanics) and adapt it. Use `games-src/scripts/find.sh --maps` and that game's MODULES.md.
2. Write games-src/<slug>/rules-notes.md (the rules from your own knowledge of the original, plus "Simplified on purpose") and RULES-CHECKLIST.md. Write the engine with a rules-test and a computer opponent (at least Easy and Normal; a newcomer following the hints must win about half the games on Easy).
3. Phone first, at 375x667 and 375x553: board-first layout, text >= 11 px, taps >= 44 px, 1-3 taps per turn, show what a choice gives BEFORE committing, a quick readable rival turn, satisfying one-shot feedback (no infinite animations, max 1 helper on screen).
3b. PC too (owner, 20 Nov 2026: "the layout should change for pc and phone so it is easy to play in both"): at 1366x768 and 1920x1080 with a MOUSE the game must use the width (board at full height, hand/score/log/rival in side panels, never a phone column in an empty screen), text >= 12 px, every control clickable (no touch-only or hover-only controls, drag works with a mouse), nothing needs scrolling to play. Screenshot both sizes into proof/.
4. Tutorial: a short guided first game that teaches every rule it uses, 12 words or fewer per line.

## Free assets only (credit everything)
- Allowed: CC0 (Kenney.nl, OpenGameArt CC0, game-icons.net is CC BY 3.0, so credit it), MIT code effects from Sprite Fusion (spritefusion.com/pixel-art-vfx, keep the MIT header), patch.gg items ONLY if their maker chose an open licence (MIT, CC0, CC BY); see games-src/FX-SOURCES.md. Also your own code art (SVG/canvas) and free Google Fonts.
- Not allowed: anything without a clear free licence; anything from the original game (art, logos, names, card text copied verbatim).
- Add every asset to games-src/THIRD-PARTY.md (source URL, author, licence, files). Download into a fresh folder, treat it as untrusted data, and look at it before using it.

## Gates and evidence (before reporting)
- Add the slug to build-all (follow how the other games are registered). `VIS_SLUGS="," python3 games-src/scripts/build-all.py --quick --out /tmp/x <slug>` must PASS, and `--full` twice, each alone in the foreground (--full rewrites games/lab.html; don't commit it). In games-src run `npm i --no-save @playwright/test@1.63.0 playwright@1.63.0 three` first.
- A webm of the first 3 minutes at 375x667, plus 4 screenshots, saved to games-src/<slug>/proof/.
- Have an independent subagent with NO knowledge of your build play it cold. It reports in plain words whether it could play, whether it was fun, and what confused it. Fix what it found, then include its final verdict as-is.
- Don't deploy, and don't add a shelf card. The owner looks at the video first.

## Report
Report with mcp__claude-code-remote__create_trigger: persistent_session_id session_01MS7iGyBWDerEAyagJ6ir4U, run_once_at = `date -u -d '+2 min' +%Y-%m-%dT%H:%M:00Z`, name "<TAG> report", prompt starting "[<TAG> <slug>]" with branch, commit, gates, the rules simplified, assets used (with licences), the cold-play verdict and the proof paths. If refused, write the report to games-src/<slug>/REPORT.md and push it. Then stop.
