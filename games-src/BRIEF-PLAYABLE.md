Task from the orchestrator (session_01MS7iGyBWDerEAyagJ6ir4U). Owner (Alex), 7 Nov 2026, after testing the new games: "All new games are unplayable, unreadable, not easy to follow, tutorials don't work to the end, the assets are super difficult to understand ... make all new games playable by a human. If I cannot understand it in a minute it is completely unplayable. Use screenshots to evaluate, and impeccable and other skills to review and make them easy to play. Use a turn-based approach, more animation steps."
YOUR GAME: <SLUG> (source games-src/<DIR>). Repo /home/user/spotify_to_ytmusic; read CLAUDE.md (never write original game/publisher names; no AI attribution; never force-push; git add explicit paths; guard.py before each commit; sleep alone blocked, use timeout; never ask, decide and note why; no deploy). Branch <BRANCH> from <BASE>; touch only games-src/<DIR>/ (shared games-src/shell/* read-only; if a blocker is in the shared kit, work around it in your folder and note it). Install the temp art for test builds as games-src/<DIR>/HANDOFF*.md says (never commit media). Load the skills: Skill impeccable (critique + polish + clarify) and Skill anthropic-skills:fun-game-design.
THE BAR: a first-time player on a phone (390x763) understands what to do within 60 seconds without reading rules, and can finish the tutorial, a Quick game and Story stage 1. Benchmark: the old shelf games the owner likes (games/cauldron-fair/index.html, games/hollowbough/index.html) and how good online digital versions of this kind of board game present a turn. Copy those patterns; don't invent.
DO, in this order:
1) First-minute critique: screenshot title, tutorial step 1-3, first turn, opponent turn, scoring and result at 390x763 and 1440x860, LOOK at them as a newcomer, run impeccable critique on them, write the 10 worst problems into games-src/<DIR>/PLAYABLE.md.
2) Turn-based, step by step, animated: every turn is a clear sequence the player can follow: (a) a banner "Your turn" / "<Rival>'s turn", (b) one always-visible instruction line saying exactly what to do now in plain words, (c) legal targets glow, everything else dims, (d) after an action: animate it (move/flip/slide 250-450 ms), then a score pop with a short plain reason ("+3 three trees in a row"), (e) the rival's turn is played step by step with the same animations and a short caption per step, ~0.6-1 s per step, tap to speed up, never instant. One thing happens at a time; no surprise state changes.
3) Pictures that explain themselves: abstract icon glyphs mean nothing. Every card/tile/token readable at a glance: a clear name >= 13px, the key number big, a one-line plain effect, a colour + simple drawn shape per type. Where a temp glyph is less clear than a code-drawn shape + label, drop the glyph (keep the slot for real art later).
4) Readable: game text >= 14px on phone (13px captions only), contrast >= 4.5:1, solid backing behind text over pictures, at most 2 lines of instruction at once, nothing hidden behind scroll on the main screen.
5) Tutorial that works to the end: 5-8 short steps, each makes the player do one real action (spotlight on the exact element, the step advances only when the action is done, a Skip that works), ends in a real game. Prove it PROGRAMMATICALLY: a Playwright script that drives the tutorial from fresh storage by tapping each spotlit element's centre and asserts it reaches the end state, at 390x763 and 1440x860; plus elementFromPoint at each target's centre is the target (not covered).
6) Help opens with "How a turn works" in 5 short lines before any detail.
Gate (all must pass before your final push): `cd games-src && npm install --no-save @playwright/test@1.56.1 playwright@1.56.1` (never commit; PLAYWRIGHT_BROWSERS_PATH symlink shim outside the repo if the browser build mismatches); `VIS_SLUGS="," python3 games-src/scripts/build-all.py --quick <SLUG>` PASS; rules-test + smoke PASS; the tutorial-to-end script PASS at both sizes; a Quick game and Story stage 1 played to the result by a script that only taps visible, uncovered UI (no engine shortcuts) at 390x763; ui-audit A-F 0 on phone/phone-s/pc; 0 console errors. Then re-shoot the same screens and run impeccable critique again; each of your 10 problems must be fixed or explained in PLAYABLE.md (before/after). Copy 4 after-shots (title, first turn, rival turn, result; phone) as webp <= 120 KB into games-src/<DIR>/playable-shots/.
Push at least every 25 min. HARD STOP 100 min.
REPORT: create_trigger persistent_session_id=session_01MS7iGyBWDerEAyagJ6ir4U, run_once_at now+1 min, name "DONE <W>", prompt "[DONE <W>] branch <BRANCH> pushed at <sha>. 1) top problems fixed n/10 2) turn steps + animation done 3) tutorial-to-end script PASS/FAIL both sizes 4) quick game + story by UI taps PASS/FAIL, audit counts 5) remaining". Print only pass/fail lines.

## ADDENDUM 1 (owner, 20:45 UTC): the tutorial is a REAL guided game covering every rule
Owner: "Tutorials in most games are not covering a real game and not all rules and cases, it's like a sloppy job." This replaces step 5's "5-8 short steps":
- The tutorial is one complete, real, short game (fixed seed / stacked deck so the needed cases come up), played from setup to the final scoring and result screen, against the real AI.
- Split into short chapters the player can leave and resume (e.g. 1 Your first turn, 2 Scoring, 3 Special cases, 4 Ending the game); each step makes the player do the real action.
- Coverage: list every rule of the game (from rules-notes.md and the rulebook: setup, each action type, every scoring rule, every card/tile type or effect family, special cases such as ties, empty market, can't-place, bonuses, end trigger and tie-break). Each must be taught in the tutorial by doing or seeing it once. Write the list as a checklist in games-src/<DIR>/TUTORIAL-COVERAGE.md with the step that teaches each rule; no unticked rule.
- The tutorial-to-end script must play this whole guided game to the result screen at both sizes and assert every coverage step was shown.
- If time runs short, prioritise: playable first turn + rival turn + scoring + end; note the rest as not covered in TUTORIAL-COVERAGE.md (honestly).

## ADDENDUM 2 (20:55 UTC): fix the rules
The rulebook check is merged: games-src/rules-check/<slug>.md (and SUMMARY.md) on origin/alex/brave-carson-rbpmlk. Fix every WRONG and MISSING item for your game in the engine (not in the UI), each with a rules-test case named after the item; SIMPLIFIED-ON-PURPOSE items stay but must be stated in the help drawer. Update TUTORIAL-COVERAGE.md if a fixed rule changes what the tutorial teaches. Report "rules fixed n/total" in your DONE line.

## ADDENDUM 3 (owner, 21:05 UTC): narrative everywhere, the tutorial is a story
Owner: "All games require a narrative to make them interesting, even the tutorial. It's always click there, click this, highlight: boring."
- The tutorial is the PROLOGUE of the game's story, not a list of clicks: a named guide character (portrait, code-drawn until art exists) and a rival with a reason to compete; every step has a story reason ("The river is rising: place this tile to give the elk a crossing"), then the action, then a reaction from the character ("The herd is safe. +3 for the run of forest!"). Max 2 short lines per bubble, written warm and punchy; no "click here" wording (the glow shows where).
- Each tutorial chapter opens with a 1-2 line story beat and ends with a payoff beat; the final scoring is a climax (count-up, character reaction, what it means for the story).
- Story mode: every chapter has an intro scene (portrait + 2-3 lines: who, what is at stake, the twist rule) and an outro (win and loss variants) that leads into the next chapter; bosses talk before and after. Quick game: a one-line flavour intro and a result line in the game's voice.
- Write the cast and the story arc (3 acts) in games-src/<DIR>/STORY.md; keep all text in one data file so it can be edited. Original names only, never the original game's characters or setting names.
- Add the story beats to TUTORIAL-COVERAGE.md next to the rule each one teaches. The tutorial-to-end script must still pass.

## ADDENDUM 4 (owner, 22:05 UTC): the tutorial must be a GAME, not tap-tap
Owner on Wildmark: "The tutorial is not a game, it's tap tap, very bad. The game itself is better, but not all rules are covered." Forced spotlight steps ("tap here, now here") are rejected. Replace them with a COACHED FIRST GAME:
- The player plays a real game with real free choices from turn 1 (all legal moves allowed); a stacked deck/seed only makes sure the needed situations come up.
- The guide character speaks just-in-time: when a rule first matters ("You took a bear: bears score in pairs, put it next to the other one"), when the player makes a good/poor move (one line why), and when the rival does something worth learning. Never more than one bubble at a time; it never blocks input; it can be dismissed.
- Spotlight/forced taps only for the very first action (max 2 forced steps), then free play.
- Every rule in TUTORIAL-COVERAGE.md is explained the first time it becomes relevant during that game; rules that did not come up are explained in a short "Things you'll meet later" card at the end. The final scoring is walked through rule by rule with the player's real numbers.
- The tutorial-to-end script plays the coached game by choosing legal moves through the UI (any legal move, not a scripted tap list) and asserts every coverage rule was explained.

## Addendum 5 (owner, 7 Nov 23:52): you must SEE how you score
Owner on Wildmark: "very difficult to know how the gamer collects points, which is good or bad decision".
Every game needs, before it counts as ready:
- a live preview of the points a move would add, on hover or tap, before you commit ("+3 Bear pair"), with the pattern highlighted;
- a points pop after each move that says why;
- an always-visible score breakdown, yours vs the rival's, with the leader marked;
- choice badges in markets and hands showing the best gain;
- one line after each turn rating the move good, okay or poor, and saying why, compared with the solver's best move.
- Owner on Vale (8 Nov 00:12): "not easy to understand what I have to do, how I collect points, when my turn ends and why". Add a permanent turn tracker (round x of y, whose turn, actions or dice left shown as spendable tokens), a "Turn over: why" card when the turn ends, and one plain next-step line that names the exact action.

## Addendum 6 (owner, 8 Nov 00:31): all the rules, and a game that feels real
Owner on Redline Rally and Emberclimb: "not all rules are applied", "not covering anything to make the game real", "looks very boring". Before a game counts as ready:
- every rule in its rules notes and rules-check is built and tested, listed found -> built in RULES-COVERAGE.md;
- the full campaign or modes are there;
- it feels like the real thing, with movement and animation, sound, a clear goal, and a satisfying end screen.

## Addendum 7 (owner, 8 Nov 01:00): three separate modes, and a clean game
Owner: "I want to play a game. The hints are different and learn to play is different, but it must be a game, meaning not so much distraction. We need a clean understanding of how and why we score, what the aim of the game is, etc. I don't want distractions."
- LEARN TO PLAY (title button): the coached game. Bubbles, pointing and explanations live only here.
- PLAY (the default): a clean game screen. Show only the board, your hand or choices, the turn tracker, and one compact score line (you vs rival). Before turn 1, show a one-card "Goal: ..." (win condition in one sentence, plus 3 bullets on how points are earned). After that, no coach bubbles, no ratings and no toasts. Points show as a brief pop with a short reason ("+3 Bear pair"). Every number's "why" opens on tap only, in the score drawer. The end screen walks the scoring.
- HINTS: a toggle in the top bar, OFF by default in Play. When on, it shows move previews (+N on spots), best-value badges and the good/okay/poor line after each turn. The "What should I do?" button belongs to Hints.
- Check: a Play screenshot at 390x763 has no more than the board, the hand, the tracker, one score line and the top bar.
