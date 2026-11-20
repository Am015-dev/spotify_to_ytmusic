# R108 strict gameplay review: rampart-and-vine (games-src/carc)

**Verdict: FAIL.** Raw average 6.0, capped at 4 because of a stopper: legal glows sit under the top bar, hand dock and "N more" pills, so taps on them do nothing. Three agents hit it independently and a measurement confirmed it. Cold play: playable, fun 3/5, would play again.

- Reviewed commit: `bce373668b9765ed1997b808f20c63aa614494a5` (origin/shelf/W584-rampart-strict), 20 Nov 2026, ~19:20-20:30 UTC.
- Gates: `--quick` PASS (11/11 scenarios), `--full` PASS (phone-check ok; sweep clean: 4 games, 1935 steps; lab WARN 8/12 because the LAB row list differs from the scenarios, which is not a failure). One run each.
- `logic-test.js` 71/71 PASS. `geo_test.js` 85 tiles, 0 drawing errors, 6 adjacency warnings (rule 5).
- Calm audit (`calm-audit.js /tmp/x`, 20 s): **loops=0, maxHelpers=1** (bubble plus its own ring) on the play path, after the bulb tap and on the guided path. The phone agent also counted 0 infinite animations at 15 s after the bulb.
- Method: rules audit by subagent; phone first-timer play by subagent (tutorial + 4 full games at 375x667/375x553, touch); PC mouse play by subagent (full games at 1366x768, 1920x1080, 910x512); independent cold play (tutorial + full phone game + full PC game). Reviewer checked baselines, art, dead-tap geometry and the key screenshots.
- Test-host note: for the first ~20 min the static server lacked `media/` (art 404s), so early screens showed flat fallback art. This was fixed and all agents re-judged with the art loaded. Nothing below is counted against the game for it.

## Scores (GAMEPLAY-RUBRIC.md)

| # | Row | Score | Why |
|---|-----|------:|-----|
| 1 | Rules fidelity | 8 | Engine matches all 71 rules, but about 10 player-facing texts are wrong or misleading (list below). Rule 5 stays open; not a stopper. |
| 2 | Tutorial teaches | 6 | 24-32 one-tap steps, ends in a won demo game. But it jumps between demo boards (a farmer placed at step 15 vanishes at 16), says "three tiles plus one banner: 8" when 1-2 town tiles are visible, covers the score bar the whole time, and ignores taps for ~2 s after "Hob takes a turn" with no feedback. |
| 3 | First 10 seconds | 7 | "Your turn / Turn, then place on a glow." is clear. Four dismissals before the first move on PC: New here?, Play now, goal card Got it, hint Got it. |
| 4 | Turn clarity | 6 | Strong previews ("Finishes your town: +4 for you", "helps them", follower "+N"). Problems: open frontier cells are drawn as **flat dark squares that two players read as holes or missing tiles**; follower labels sit above some circles and below others; "+N soon" is pale yellow on cream and nearly invisible; "farmer +N now" is false (farmers pay at the end). |
| 5 | Phone and PC | 5 | Text and targets pass: no text <11 px on phone or <12 px on PC; targets >=44 px; no scrolling at any size; PC side panel uses the width (77-80 % board). But at 375x553 and 910x512 the banner, dock and up to 4 "N more" pills cover board cells and glows (dead taps). The camera stays zoomed in on phone. The hand tile is clipped at the bottom in the phone baseline. 1366: 7, 1920: 7.5, 910x512: 5.5, 375x553: 5. |
| 6 | AI and pacing | 5 | Rival is quick and sensible, and a game is ~12 min. Easy is too strong for a newcomer: rule-based phone player won 1 of 4 (lost 43-72, 42-49, 47-60, won 52-50); cold and PC random players lost all 5. Nothing tells you when a priory is worth tying up a follower. |
| 7 | Feel | 7 | Warm painted art, score pops, rival tile outlined, clear result table. End-game floating labels stack on top of each other (top-left in the final count). |
| 8 | Bugs | 4 | 0 console errors, 0 stuck states, every game reached the result screen. **Stopper:** dead taps on legal glows hidden under UI (measurement below). The hog-field popup shows the wrong town count (bf.js:30). |

**Average 6.0 -> capped at 4 (stopper). FAIL.**

### Stopper measurement (dead taps)
An AI-vs-AI game (seed 7) was sampled 40 times at 250 ms, checking `elementFromPoint` at the centre of every on-screen `.tl.drop.lit`:
- 375x553: 27 of 67 glow centres were covered, mostly by `#hand` (14) and pills/SVG (11).
- 910x512: 243 of 494 covered, by pills, banner and SVG overlays.
- 1366x768: 51 of 176 covered by `#top`; the board runs under the top bar.

Players saw the same thing. Phone: 11 of ~140 glow taps did nothing (g3-preview12.png). PC 910x512: 13 dead clicks (f910_dead3/4/9.png). Cold player: "Tap the lit tile" steps needed a second tap.

Repro: phone 375x553, Easy, play to turn ~12 until the board spreads, then tap a glow that touches the "3 more" pill or the dock edge. Nothing happens. Fix: keep the board viewport inside the chrome (inset by banner, dock and top bar), and auto-pan or nudge so no lit glow sits under a pill. Or make pills and banner `pointer-events:none` over lit cells.

## Rules vs the original (rules-notes.md / RULES-CHECKLIST.md)
Engine: no mismatch. Traced placement, set-aside, river (spring first, lake last, no same-way turn), follower/large/builder/hog, all completed and end scoring, goods, mason (no chain), game end, 7 followers, 6 seats only with taverns.

Text and preview mismatches (file:line, then the correct statement):
1. `game/src/bf.js:30` hog-field popup divides `pts/3`, but `bf.js:299` passes 4 per town, so 3 towns shows "4 towns". Pass the town count.
2. `game/src/preview.js:40` "farmer +N now": farmers score only at game end, only with field majority, and a town this tile completes isn't counted yet. Correct: "farmer: 3 per finished town, at the end".
3. `game/src/preview.js:44` and `bf.js:147` (potOf) "+N" on open features uses the *completed* value at current size. At the end it pays 1/tile, or 0 for tavern road and basilica town.
4. `game/src/bf.js:176` "+N soon" ("points you get when your open features close") overpromises. Say "if finished".
5. `game/src/preview.js:30` "Closes a town nobody holds: no points" is false: you can put a follower on the closing tile and score at once (engine.js:104-107).
6. `game/src/preview.js:7` (pvMe) uses the first human seat, so the 2nd hot-seat human sees themselves as "them".
7. `game/src/bf.js:212` "Priory: 1 + one per tile around it." is only the end value. Correct: 9 when all 8 neighbours are placed; 1 + neighbours if open at the end.
8. `game/src/hlp.js:56` "nofig": also shown when you have no followers left. Reword to "Nothing free to claim".
9. `game/src/hlp.js:52,54`, `bf.js:339` (farmers, hog, rules sheet) leave out the majority condition: most farmers wins the field, ties share.
10. `game/src/bf.js:339,344` (How to play, goal sheet) never say unfinished roads/towns/priories score 1 per tile at the end. Only coach.js:66 and story.js:70-72 say it.
11. `game/src/hlp.js:47` river "may not turn the same way twice in a row". The engine also bans it with straights between. Say "twice in the same direction".
12. Cold player saw "Road finished" with +9 over their priory follower in the tutorial. That is the wrong label on a priory score (not traced in code).

**Rule 5 verdict:** stays [unverified]. In the 6 warned Merchants tiles (TB_CcRRx_c x2, TB_CcRR_wG, TB_CcRC_c, TB_CcRC_g, TB_CcRx_w, TB_RCcx_g) data and art disagree on field-town contact. The data comes from a cross-checked open tile list, so it is decent evidence. On the CcRC pair the art (fields joined round the dead-end road) is the more plausible side. Impact: farmer end score ±3 per adjacent completed town, on ~7 of ~96 tiles, only with that set on. It is off by default (bf.js:9, engine.js:20), **but story mode turns it on** (campaign.json `tb:true`, lines 790 and 1099). Not a stopper. Settle it before those chapters ship.

## First-timer and PC play
- Phone 375x667/553 (4 games): clear glow, preview, Place here flow; rival move readable (blue border + "Cobalt: road and follower"). Issues: dead taps (above); at 553 the board area is ~350 px with up to 4 pills over it; follower circles and labels crowd ("farmer, pays at end" against the road circle, g3-f16.png); first-game "How you win" card covers most of the board at 553; tutorial coach card covers spots (t4-04.png); taps on non-highlighted spots in the tutorial do nothing silently. Fun 3/5.
- PC (pc-mouse-test.js: PASS): 1366 and 1920 finish cleanly, no text <12 px, no scroll, side panel. 1920 side panel mostly empty below the tile. Rotating a symmetric tile gives no feedback. One click places with no confirm, unlike phone's Place here (the cold player noticed the difference). Hovering a cell replaces the "place on a glow" instruction ("Nothing scores here yet."). 910x512: banner/pills over glows, half-off-edge glows, 13 dead clicks.

## Cold play (independent, quoted as-is)
> **Could I play it?** Yes on both. On the phone (375x667, touch) I did the whole 24-step tutorial one tap at a time, looking at each screen, then a full game. On PC (1366x768, mouse) I played a full game with rotating, placing, followers and skipping. A full 70-tile game took about 12 minutes on each.
> **Results:** Tutorial: I won 24 to 2. Phone game, Easy, 1 rival: Cobalt won 37 to 28. PC game: Cobalt won 67 to 32. Both games ended cleanly on a readable results table with Play again and Menu buttons.
> **Fun:** 3 out of 5. It feels good, the art is warm, the computer plays sensibly (it took the town I was building), and the "+9" / "helps them" hints are useful. I would play again, mainly on PC.
> **What confused me:** 1. In the tutorial the score bar is covered by the tutorial strip the whole time, so I never saw my score. 2. The tutorial jumps to demo boards: the farmer I placed on step 15 vanished on step 16. 3. "Three tiles plus one banner: 8": I could only see 1 or 2 town tiles. 4. "Road finished" showed +9 over my priory follower. 5. The end screen calls me "Garnet", a name I never chose. 6. In real games, dark brown squares sit inside the placed area and look like holes or missing tiles. 7. The phone camera stays very zoomed in. I only saw a small corner of the valley and had to rely on the "2 more / 6 more" buttons. The cloth decoration bottom-left takes up part of the play area. 8. On PC, hovering a square replaces the "place on a glow" instruction with text like "Nothing scores here yet.", so the instruction disappears. 9. Placing works differently: on the phone you tap, then press "Place here"; on PC one click places the tile at once. 10. Follower labels like "town +2" and "farmer, pays at end" sit above some circles and below others, so it is hard to tell which label goes with which circle.
> **Dead taps, stuck moments, errors:** No crashes or script errors, and the game never got stuck. The tutorial's "Tap the lit tile" steps sometimes needed a second tap while the camera was still moving.

(The cold player's game moves were scripted random picks, so its scores mostly show that. The tutorial was played screen by screen.) Video: `games-src/reviews/R108-first-3-min-375x667.webm` (opening, full tutorial, start of a real game).

## Baselines (games-src/carc/proof/baselines-new/): do NOT approve yet
- The board, menu and wide shots look right: painted art, side panel at wide, menu readable. The magenta bar is the visual-spec mask, not a bug.
- `*-title.png` is identical to `*-board.png` (phone, and likely all sizes): it shows the board, not the title screen, so it guards nothing.
- `phone-board.png`: the hand tile is cut off at the bottom of the dock.
- `tablet-*`: the seat chips are small and "7 left" sits low-contrast on the wood frame.

Recapture the title step on the real title screen, then approve.

## Fix list (priority order)
1. **Stopper: glows under the chrome.** Fit the board viewport inside the top bar, banner, dock and pills; never leave a lit glow under a pill or the dock; at 375x553 and 910x512 shrink or merge the "N more" pills (one compass chip). Gate: the dead-tap probe above reports 0 covered lit-glow centres at 375x553, 375x667, 910x512 and 1366x768.
2. **Easy too strong.** Target a newcomer winning ~50 % on Easy (use novice-bench.js). Easy should leave towns open and take fewer farmers.
3. **Frontier cells drawn as dark squares** that read as holes: draw them as faint outlines or nothing, and show only lit glows.
4. Text fixes 1-11 above (hog popup count, "farmer now", "soon", "closes nobody holds", priory tip, majority wording, unfinished-at-end line in How to play/goal, river wording, nofig).
5. Tutorial: keep one board across steps 13-21 (don't swap the player's farmer away); show the score bar; make the "banner 8" board show all 3 town tiles; accept or acknowledge taps during the ~2 s camera move; fix "Road finished" on a priory score; let the player name themselves or say "You" instead of "Garnet".
6. Follower labels: one consistent side, attached to their circle; "+N soon" contrast >= 4.5:1.
7. PC: keep the turn instruction visible while hovering (put the hover preview in its own line); flash or bounce on rotating a symmetric tile; decide whether PC needs a confirm step too (or an undo).
8. Fewer opening dismissals (merge New here? + goal card into one).
9. Baselines: recapture the title shots; fix the phone hand-tile clip.
10. Rule 5: settle against real tiles before the story chapters that turn the Merchants set on (campaign.json:790, 1099).
