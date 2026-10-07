# Help kit rollout (6 Oct 2026)

Pilot: Thornbound (live). Round 1 started 6 Oct 23:13 UTC as cloud sessions: doorkick-dungeon, hollowbough, final-approach, shipwreck-isle.
Round 1 DONE (all 4 live, screenshots checked 7 Oct). Round 2 STARTED 7 Oct 04:19 UTC: sands-of-qamar, rampart-and-vine, kaiten-kitchen, crown-city-smash. Round 3: nebula-aces, short-fuse, lantern-dive, tidewake. Round 4: sunglaze, cauldron-fair.
One Sonnet cloud session per game, max 4 at a time. Prompt template (replace __NAME__/__SLUG__):

```
Owner authorisation: commit, merge and push to `alex/brave-carson-rbpmlk` and deploy this game live once its checks pass. Work on branch alex/brave-carson-rbpmlk (never main, never force-push, no PRs).

Read CLAUDE.md first (hard rules: no original game/publisher/designer names, no model names, no AI attribution lines in commits). Then games-src/shell/GX-KIT.md section 9 (the help kit: gx-help.js/css) and the pilot that uses it: Thornbound (games-src/thornbound/game, file ui11.js, plus the "help kit checks" block in its sweep.js).

Game: __NAME__ (slug __SLUG__; source dir from the GAMES table in games-src/scripts/build-all.py). Only touch this game's files. Other sessions are adding the kit to other games at the same time: never edit games-src/shell/, games-src/scripts/, games/index.html.

Owner's request: "Some games are confusing; tutorial pop-ups; the light bulb can be more helpful, especially if people don't know the rules." Help must be on demand (bulb) or first-time only (coach bubbles), never advice cards on their own during play.

Do, following GX-KIT.md section 9 exactly:
1. build.py: inline gx-viewport.js, gx-help.js and gx-help.css after shell.js (if not already).
2. A bulb button in the top bar (SVG bulb, same as Thornbound). Remove any old hint button so there is one bulb.
3. Write the game's help file: a phaseId() for every distinct moment of play; one coach step per phase (title ≤4 words, text ≤20 words, target = the board element to tap); 2–4 rules cards per phase (picture/icons + ≤20 words; explain the real rules plainly for someone who has never played); suggest() from the game's real AI/advice function (so the finger and the "why" line are right; return null rather than guess). Call GXH.init and GXH.bulb once, GXH.phase() after each render.
4. Menu: GXH.settingsHTML() (Tips on/off, Reset tips). Replace any old guided-game tip/coach pop-ups with the kit's steps (guided game = all bubbles on).
5. Sweep: copy Thornbound's help kit checks (fresh profile: each bubble once, never covers a glowing target, dismisses on tap, game still completes; bulb finger == suggestion).

Checks before deploy: `python3 games-src/scripts/build-all.py __SLUG__` PASS; the game's sweep.js (and rotate-test.js if present) pass incl. the help checks. Save help-coach-bubble, help-bulb-suggestion and help-rules-card screenshots at 390x763 to the game's playtest/ folder, look at them (short, clear, pointing at the board) and commit them (git add -f if ignored).

Deploy: `python3 games-src/scripts/build-all.py --deploy __SLUG__`; commit only this game's files; `git fetch origin alex/brave-carson-rbpmlk && git merge origin/alex/brave-carson-rbpmlk`; `git push origin alex/brave-carson-rbpmlk`. Commit work in progress as you go. If a command is blocked, stop and say so. Delete temporary staging folders.

Finish with a report under 120 words: phases/steps/rules counts, what suggest() uses, checks, deployed yes/no, commit hash, screenshot paths.
```
