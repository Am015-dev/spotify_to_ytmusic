# Lantern Dive: product audit (Oct 2026)

Measured against `games-src/PRODUCT-BAR.md`. Build: `games/lantern-dive/index.html` (1.99 MB). It matches
`game/lantern-dive.html` apart from the copyright header. Served locally and played in Playwright Chromium.

**What I played**
- Guided first dive at 390x763 (touch).
- Full vs-computer dives:
  - dive 5, 4 divers, 390x763 (lost on trick 9)
  - dive 7, 4 divers, 375x553 (lost on trick 4)
  - dive 9 (murky water), 5 divers, 1366x768 (won)
  - dive 1 at 1366x768, played with the keyboard only (won)
- Hot-seat: dive 3, 3 people, 4 tricks, 16 pass-the-device screens.
- Online: hosted a room, then a second phone context opened the invite link and joined.

**What I checked**
- Every top-bar drawer, the menu, all four reference tabs, the job, diver and last-trick pop-ups.
- Reloaded in the middle of a dive and resumed.
- `node rules-test.js` (99/99 pass), plus small all-computer gauntlets.

Every claim below comes from these runs. Screenshots are in `audit-shots/`.

## Scores

| Area | Score | Evidence |
|---|---|---|
| A. The game itself | 4 | All 32 dives are in, plus Deep Dive, Free dive, Job practice and 2 to 5 divers with the drone. The earlier rules audit rows 1-8 are fixed in the code and rules-test passes 99/99. The computer divers are sound, but Hint and the computer still sometimes throw away a card a teammate needs. Hard and normal win about equally often. |
| B. Learning the game | 3 | Tips come just in time, the prompt line always says what to do now, and the rules and the reference have counts (`390-guided-pick-job.jpg`). The guided dive ends after **one trick** when you follow its own Hint. Hint seldom says why. Cards cannot be opened big. |
| C. Playing comfortably | 3 | The two-step play (lift, then Play) works. The log is readable. The loss card names the trick, the card and the diver (`375-loss-explained.jpg`). Save and resume survived a reload. There is no undo. Settings are thin: on/off sound only, no text size and no colour-blind mode (`390-menu-settings.jpg`). |
| D. Playing with friends | 3 | Room code, invite link, a lobby, the computer taking over a seat, rejoin by browser id, and emotes are all in the code (`390-online-lobby.jpg`). I could not play online end to end because the relays are blocked here. Hot-seat hides hands correctly (`390-hotseat-pass.jpg`). No asynchronous play. |
| E. Look, sound and feel | 3 | One consistent painted style. Cards fly between places. Real CC0 samples and music. No haptics. 390x763 is clean. 375x553 still has overlaps (`375-chips-overlap-names.jpg`, `375-felt-labels-overlap.jpg`). |
| F. Quality | 4 | First screen in about 0.7 s on localhost. The only console error was a favicon 404. Works offline. Keyboard play works on desktop (Tab plus Enter). The prompt has aria-live and hand cards have labels. Shown-card chips tell the suit by colour alone. |

Item by item:
1. Complete rules: 5.
2. Rule bugs: 5. I found none in four logs (one example below).
3. Computer players: 3.
4. Tutorial: 2.
5. Know what to do: 4.
6. Rules in the app: 4.
7. Reference: 3. There are no pictures of job cards and no "read big" on a long press.
8. Glossary: 3.
9. Undo: 2.
10. History: 4.
11. Settings: 2.
12. Save and resume: 4.
13. Online: 3 (untested live).
14. Asynchronous play: 0.
15. Hot-seat: 4.
16. Art: 3.
17. Motion: 4.
18. Sound: 3.
19. Phone layout: 3.
20. Speed: 4.
21. Accessibility: 3.
22. Robustness: 4.

**Rules spot check (dive 9, 5 divers, murky water).**
- Sumi's job "at least three 5s" became done on trick 6 (Coral 5 and Kelp 5 on trick 5, Sunstar 5 on trick 6).
- Nerea's signal was logged with no token mark, as murky water requires.
- Follow-suit and trump wins were correct in every logged trick.

## Problems, by severity

### P0
None. Nothing stops a paying user from finishing a dive. No crash and no stuck state in 6 sessions; the gauntlets had 0 errors and 0 stalls.

### P1
1. **Hint suggested an instantly losing discard although safe cards existed.**
   - What I saw (375x553, dive 7, trick 4): Sumi led Lantern 1 and I had no Lanterns. I had 7 legal cards, and Coral 7, Tide 3 and Tide 7 were safe. Hint said "Kelp 6", with no reason given.
   - Bram's job was "Win the Kelp 6", so the dive failed at once (`375-loss-explained.jpg`).
   - The computer seats do the same, but rarely. Over 80 games per level on dives 1-12, I counted off-suit throw-aways of a teammate's needed card: easy 4, normal 1, hard 1.
   - Where: `game/src/ai.js:224-238`. `choosePlay` only ranks rollouts and has no hard veto.
   - Fix: before scoring, drop any candidate that makes a public job fail at once (check `jobStatus` after the trick resolves in every sampled world) when another legal card does not. Use the same veto for Hint.
   - Effort: M.
2. **The guided first dive teaches one trick.**
   - What I saw: the "Your plan" tip says "Play a colour card first to see how a trick works". Hint then suggests Lantern 3, and playing it ends the dive at once ("It took 1 trick") (`390-guided-debrief.jpg`).
   - Following suit, signals, losing a job and the flare are only read about, never practised.
   - Where: `src/ui4.js` (tip `gplan`), `src/ui3.js:141` (`doHint`).
   - Fix: in guided mode, make Hint follow the lesson (a colour card first). Script 3-4 tricks: follow suit, a forced trump, a signal. Then add a second guided dive with 2 jobs and a teammate's job to protect.
   - Effort: M.
3. **Hint rarely explains itself.**
   - What I saw: in about 30 hints across my runs, the reason was empty whenever my card did not finish the trick (leading, or 2nd or 3rd to play). Examples: "Suggestion: Sunstar 4." and "Suggestion: Kelp 9.".
   - When leading, Hint sometimes suggests a signal instead of a card ("Suggested: signal Coral 9").
   - Where: `src/ai.js:407-421`. `why` only counts worlds where `W.tricks` grows after your card. It should roll the trick out.
   - Fix: finish the trick with `greedyCard` in each world, as `allBreak` does. Always print one plain reason ("keeps your Kelp 5 for later", "saves the Kelp 6 for Bram").
   - Effort: S.
4. **Small phone (375x553) still overlaps.**
   - What I saw:
     - The shown-card chips ("1▽", "8▲", "8●") sit on top of "10 cards / 0 tricks" in all three opponent panels (`375-chips-overlap-names.jpg`).
     - "Lanterns led: follow with a Lantern" wraps into the felt next to "Trick 4 of 10".
     - "Last trick" covers the top-right corner of the felt.
     - The trick slots overlap each other (`375-felt-labels-overlap.jpg`).
   - Where: `src/ui2.js:66-73` (chips), `:168-170` (lead label, Last trick).
   - Fix: give the chips their own row under the counts. Move the lead hint into the prompt line and "Last trick" into the dock when `innerHeight < 600`.
   - Effort: S.
5. **Settings are below the product bar.**
   - What's missing:
     - Sound volume (sound and music are on/off only).
     - Animation speed (only computer speed exists).
     - Text size.
     - Colour-blind mode.
     - Left- or right-hand layout.
     - Haptics: there is no `navigator.vibrate` anywhere.
   - The menu still shows "Graphics (now low)" on a 2x phone in Auto (`390-menu-settings.jpg`).
   - Fix: a shared settings block in the shell with volume sliders, text scale, colour-blind palette and patterns, animation speed and haptics, read by every game.
   - Effort: M. **[shared]**
6. **No undo, and no way to read a card big.**
   - You cannot take back a job pick before the next diver acts, or a pass choice before everyone has passed.
   - Long-pressing a card in your hand or on the felt does nothing.
   - Fix: allow undo of your own last choice while the engine has not moved on (job pick, pass card, prediction). Add long-press or right-click to show a card or job large.
   - Effort: M. **[shared]** for the long-press viewer.
7. **Shown cards are told apart by colour alone.**
   - The chips "8▲" (Sunstar) and "8●" (Kelp) differ only in fill colour; the suit icon is missing.
   - Where: `src/ui2.js:69`.
   - Fix: put the suit emblem in the chip (`KIT.emblemSVG`).
   - Effort: S.
8. **Difficulty levels barely differ.**
   - Gauntlet, 40 games, 4 divers, dives 1-12. First-attempt wins: normal 50%, hard 52.5%.
   - My 80-game probe: easy lost 55 of 80, normal 40, hard 37.
   - Fix: give hard a bigger K and use signals more, or rename the levels "relaxed / careful" and say what each one does.
   - Effort: M.

### P2
9. **Grammar and developer text.**
   - "the jobs add up to 1 points" (`src/ui2.js:136`, `390-guided-pick-job.jpg`).
   - The Dives tab says "see rules-notes.md" to players (`src/ui5.js:35`).
   - Effort: S.
10. **Phone setup summary is a 5-line wall.**
    - The line "Dive 1: Shallow Water · difficulty 1 · You + Nerea, Bram and Sumi · 4 players" wraps to 5 lines next to Configure (`390-setup.jpg`).
    - The Configure sheet still has two "Done" buttons.
    - Effort: S.
11. **Hot-seat divers are always "Diver 1/2/3".** There is no name entry. The hand-over screen comes once per card (about 40 per dive with 4 people); that is inherent, but it is tiring. Effort: S.
12. **Lots of empty space during computer turns.** The phone dock is an empty ~200 px band showing only "The cards move…" (`390-guided-pick-job.jpg` shows the same band holding a tip). It could show the last trick or the jobs summary. Effort: S.
13. **The online lobby cannot change the dive.** It says "Change it on the setup screen before you host". Let the host pick the dive in the lobby. Effort: S.
14. **The phone top bar is icon-only.** The labels Jobs, Log, Rules and Menu are hidden on phones. The "Reading the table" tip explains them once. Effort: S.
15. **Identity and progress.** The logbook remembers dives done and attempts, which is good. There are no statistics, achievements or profile, and no home screen of recent games. Effort: M. **[shared]**

## Top 5 fixes (value for effort)
1. A no-blunder veto for Hint and the computer: never make a public job fail when a safe legal card exists (P1-1). M.
2. A guided dive that really teaches. Hint follows the lesson, and 3-4 scripted tricks practise follow suit, trumps and a signal; a second short lesson follows (P1-2). M.
3. Hint gives a reason every time, by rolling out the trick (P1-3). S.
4. A 375x553 layout pass: chip row, lead hint and Last trick moved, and the suit emblem in the shown-card chips (P1-4, P1-7). S.
5. A shared settings block (volume, text size, colour-blind, animation speed, haptics), plus long-press "read big" (P1-5, P1-6). M. **[shared]**

## Earlier findings: did the fixes land?

From `AUDIT-RULES.md`. I checked the code in `src/engine.js` and ran `rules-test.js` (99/99).

| Finding | Status | Evidence |
|---|---|---|
| Row 1: job 49 lets Lanterns count | fixed | `trickOK` sumeq now requires `suit < 4` (engine.js:47) |
| Row 2: jobs 51/52 fail on the unplayed Lantern | fixed | the `subx` only-branch returns 1 once the card is won (engine.js:111-114) |
| Row 3: dive 19 offers the Commander a forbidden job | fixed | `hardest(G, act)` filters by `canTake` (engine.js:338) |
| Row 4: re-deal for jobs 57/58 | fixed | `wsub` redeal (engine.js:194) |
| Row 5: impossible job pairs | fixed | `conflict`/`splitOK`; notes updated |
| Row 6: dive 8 deals impossible jobs | fixed | gap filter (engine.js:237-241) |
| Row 7: dive keeps going after the jobs are done | fixed | `holdsMission` is now dive 27 only (engine.js:164) |
| Row 8: drone given a Commander job | fixed | `canTake` blocks helper (engine.js:340) |
| `Object.prototype.__ld` | fixed | no longer in engine.js |

From `REVIEW-NEWCOMER.md` (items 1-19):

| # | Finding | Status |
|---|---|---|
| 1 | A loss never says why | **fixed**: names the trick, card and diver; jobs not reached are grey with "Not finished" (`375-loss-explained.jpg`) |
| 2 | The guided dive can be lost | **fixed**: stacked deal, cannot be lost. But it is now too short (P1-2) |
| 3 | No warning when every card breaks your job | **partly**: "Careful: every card you can play breaks…" covers your own jobs only, not teammates' (P1-1) |
| 4 | 375x553 broken | **partly**: job pool, felt and pop-ups are fine now; chips, lead label and Last trick still overlap (P1-4) |
| 5 | Landscape corner overlap | not re-tested (844x390 not in this audit) |
| 6 | Pop-ups clipped | **fixed**: the sheet grows to about 55% and shows every row (`375-felt-labels-overlap.jpg`) |
| 7 | Jargon and icons | **partly**: "murky water / narcosis / timed" spelled out, "jobs add up to N points" added, a legend tip. Icons are still unlabelled on phones (P2-14) |
| 8 | Signal ring colour | **fixed**: green inset ring (`head.html:128`) |
| 9 | 13-card hand hard to tap | **fixed**: two rows. 0 off-centre taps in all runs |
| 10 | Layout jumps | **fixed**: the opponent chip row is reserved from the start |
| 11 | Opponent text clipped at 390 | **fixed** at 390; at 375 the chips now overlap instead (P1-4) |
| 12 | Grammar ("You leads", "You holds", "(me)") | **fixed**. New: "1 points" (P2-9) |
| 13 | Flare passing confusing | **partly**: received card marked (`.got`); flow not replayed here |
| 14 | Hot-seat vote text hidden | not re-tested (dive 6 not played) |
| 15 | Tips repeat per diver in hot-seat | **fixed**: each tip appeared once in the hot-seat run |
| 16 | Setup and menu rough edges | **partly**: speed tools hidden, guided button says "You + 2". Still: two Done buttons, the long summary, "Graphics (now low)" |
| 17 | Guided dive ends without a lesson | **fixed**: "What you just learned" debrief |
| 18 | Soft card art (Auto picks low) | **still open**: Auto still reports "now low" on a 2x phone |
| 19 | Desktop dead space | **partly**: the side dock now holds the jobs; the felt is still mostly empty (`1366-mid-dive.jpg`) |

## G. Product and store (this game's part)
- **Legal.** This is a faithful digital adaptation of a published co-op trick-taking game.
  - The names, job wording and art are original.
  - The mechanics, the 96 job difficulty values and the 32-dive structure follow the original.
  - Sharing it among friends is fine. **Selling it needs a licence from the rights holder, or a redesign deep enough to be our own** (for example a new job set, a new campaign structure and new numbers). This is the main blocker to selling.
  - The deployed file carries an "All rights reserved" header for our code only. That does not settle the rights to the game design.
- **Credits.** The audio CC0 credits are in How to play. The PixiJS licence is credited in the build. There is no separate credits or licences page. **[shared]**
- **Missing store pieces.** Statistics, achievements, profile, a store icon and screenshots, a privacy page, the app wrapper, and asynchronous play (needs a server). All **[shared]**.

## Not tested
- **Live online play.** The sandbox blocks the signalling relays (certificate and proxy errors). The join client reached "Looking for the host…" but never connected. Rejoin, the computer taking over and the host leaving were read in `src/net.js` only.
- **Real devices.** Real iPhone Safari (toolbars, safe areas, app switch), haptics, and how the audio sounds.
- **Untested modes.** 844x390 landscape, 2-diver drone dives, real-time clock dives (14-16, 26), and the dive 6 vote.
