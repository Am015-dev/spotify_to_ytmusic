## How to read this

- Phone size only (390x763 touch). Seeds are per game (see each section); repro command in every row. Screenshots are in the worker scratch (`$QA_SHOTS`), not committed.
- `tutorial end`: the bot taps the spotlight centre at every step (Next buttons, taps, drags) and must reach the tutor's end card, whose button must work. `Y*` = reached only after skipping past a stuck step. `n/a` = the title has no tutorial entry.
- `quick game` / `story`: a UI-only random bot (adaptive: it learns which elements change the game). `Y` = result screen reached and its button works; `? (cap)` = no result inside the time cap (quick 220 s, story 140 s) while the game kept changing: inconclusive, not a bug claim (long games with AI animation, e.g. cauldron-fair needs ~12 min). `N` = soft-lock (60 s without change after Escape and a tap on every element).
- Most old games ran with the first bot versions (quick 150 s cap); a few early bot artefacts were filtered out of this report (font-size:0 icons, tutor dim cells counted as overlays, SVG spotlight targets). Findings of type "text <12px", "tap target <40px", "overlap" are static and MINOR unless text is under 9px.
- Not covered: PC size (the bot supports `--size pc`), real audio, multiplayer, canvas-only games' inner state (canvas hash only), second and later story stages.

### Bot validation on cauldron-fair (the game the owner likes)
Tutorial: all 24 steps walked with real taps to the end card, Play button works, no stuck step. Fuzz (300 taps): no JS error, no blank screen, no screen without a way out. Quick game: 1364 bot clicks reached Day 6/9 in 525 s without a soft-lock (the game is slow, AI turns animate); the result text ("<name> wins the fair") is detected by the bot. No BLOCKER from the bot on this game. Bot bugs found and fixed while validating: false "covered" on opacity:0 title buttons, tutorial that auto-starts from Story not driven, result text not matched, clicks wasted on info sheets (now closed first), tutorial entry only found via `data-gxt-open` (now also `data-a=tut`).

### Known weak spots of this run (read before trusting a row)
- crown-city-smash step 2 "tap both 3s" (story phase) and doorkick-dungeon step 20 (story phase) were found by the first bot version that tapped only the first spotlight hole; their tutorial-phase re-run with the fixed bot reaches the end (`tutorial end Y`). Treat those two story-phase rows as unconfirmed.
- redline-rally step 3/7 "tap the 4 and the 3": one wide spotlight over the whole card row; the bot taps spread across it and still gets no progress: likely real (the spotlight does not say which cards), confirm by hand.
- final-approach and hollowbough: no gx-tutor tutorial starts from the title entry the bot can see ("Learn to fly" / "Guided" mode); final-approach's first-Play tutorial does start and gets stuck at step 16/23.
- perch-and-plume step 13/13 and rampart-and-vine step 19/19: the spotlit target sits under the tutor's top strip (not tappable). Real, low-risk because both are last steps.
