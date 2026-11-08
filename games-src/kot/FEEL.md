# Game feel pass: Crown City Smash (W467, 8 Nov 2026)

Changed (layout, words, motion only; engine untouched, logic-test 146/146, rules-test 8/8):
- Goal card: one sentence how you win + 3 short scoring bullets; the phone text cutter no longer chops it ("Or be the last…").
- Learn to play, first screen: "How you win" card, one sentence + 3 bullets, stays 14 s (x to close).
- Portrait board fills the screen: the empty 130 px band at 390x844 is gone; a thin race line under the board (Goal 20 ★ · You 3 ★ · 👑 leader).
- Score strip numbers 13 → 14 px (icons smaller so they fit); result table on phones: 4 columns at 15 px, names in ink.
- No fast pop-ups: story beats stay at least 4 s + 1 s per 10 words, coach tips at least 8 s.
- 2D fallback board text 12.5 → 14 px.
- New check: `playable/feel.js <url> <w> <h> <dir>` (title, Learn, Goal, first turn, rival turn, mid-game, result by UI taps; flags text under 14 px, overlaps, broken images).

Not done: desktop dock text (13 px tips, low-contrast "Voltusk (you)"), ui-audit B 32 / C 1 / D 3 / F 1 (shared help-kit tooltip), visual baselines need owner approval.
Shots: playable-shots/feel/ (mid-game shots are from the previous build of this pass).

## Round 2 (W467, 8 Nov): feel gate PASS
`feel-audit.js crown-city-smash --secs 120` after merging the base: (a) 0 · (b) 0 · (c) 0 · (d) 0 · (e) 0, no notes. Learn played to its result by touch on phone and PC, with no skips.
- Play with Hints off is clean: board flashes and the desktop tips panel show only with Hints on. In Learn, the coach is the only voice.
- Every coach line, final-card line, desktop tip and result line is 12 words or fewer. Card effects show one clause per line (`cx()` in ui.js).
- Phone text is at least 14px (drawers, choices, chips, K.O., "you" tags). The number pops no longer scale into each other.
- Learn is the coached free-play game: `GXT.running()` reports it, and `GXT.state()` is null during free play and `{phase:'end'}` at its result. Play now has `data-a="start"`.
- Desktop: goal card text is 17-20px, the panel name is cream with a colour underline, the dice preview line is 16px, the panel title has a plate, and secondary button text is 16px.
- Fixed a skin padding bug that broke the cc-board scenario on the base (the menu row changed size when the skin turned on).
- ui-audit (phone, phone-s, pc): A 0 · B 22 · C 0 · D 3 · E 1 · F 0.
  Left:
  - B: mostly 2D fallback-board labels (no-WebGL browsers), the painted menu rows, and emoji glyphs.
  - D: the 3D title-city meshes in three3d.js, which W459 is editing.
  - E: the desktop news button, which opens the log drawer through data-gx; the audit sees no change.
- Shots: playable-shots/feel/.

## Review R6 fix list (W467, 8 Nov)
- Result card: as soon as someone wins, a card shows the winner's face, "X wins!", one line why (reached 20 ★ / last standing), your stars and place, Play again and Full results. Dice and flying dice step aside. The PC panel says "X wins!".
- Title: Play now says "You vs 3 computer monsters".
- Coached game for qa-bot: the round-2 `data-a="start"` on Play now made qa-bot start a normal game, so GXCOACH never ran. The Learn button now carries `data-a="offeryes"`, which qa-bot tries first. qa-bot tutorial phase: done true, 31 rules explained (phone and PC).
- Owner art: towers and tokens already load as -lite models in the 3D board (checked: GLBX.towers, 3 tokens). Phone flying tokens now use the owner's token renders. Deck card art preloads in the background, so dealt cards show at once.
  asset-usage: 53.8% (154/286), was 18.5%. Never loaded in a classic phone quick game:
  - 72 evolution card pictures (evolutions mode only)
  - 15 ui images: story-map nodes, plus uncropped source sheets of the -c crops in use
  - 13 model files: full-detail tower/token .glb (High graphics only) and their preview .webp
- Feel gate after these changes: (a)-(e) all 0. logic 146/146, rules 8/8, gameplay scenarios 12/12.
- Not done: title snapshot baseline. PLAYBOOK says `--approve-visual` runs only after the owner approves the screens, so the 3 visual tests stay red until then. ui-audit B22 D3 E1 unchanged.
