# [FIXED3 vale-of-banners] report

Commit 7bdcea41 on `shelf/W577-vale-strict` (origin/alex/brave-carson-rbpmlk was merged in; it was already up to date). Pushed. Not deployed, no PR.

## Gates
- logic-test: 192/192 PASS. rules-test: 37 checks plus 300/300 AI games, PASS.
- tut-walk: PASS at 5 sizes (49 steps). phone-play 375x667: 2/2 PASS. smoke (phone, landscape, PC): PASS.
- calm-audit: loops=0, maxHelpers=0.
- build-all --quick: PASS (6/6 scn). --full: PASS. The lab WARN 3/8 (lab rows don't match the scenarios) was already there before this change. games/lab.html was restored.
- Text is at least 12 px at 1366x768, 1920x1080 and 910x512 (audited).

## Win rate (new `newbie-bench.js`, headless, 80 games)
The newcomer plays the ★ move 70% of the time, against Gentle.
- Now: wins 58%, average score 137-133, median margin +2.
- Before: wins 90%, average 132-95, median margin +32.
- Follows the ★ every time: wins 70-73%, median margin +12. Never follows it: wins 20%, median margin -7.

## Taps per turn
- phone-play (scripted touch player, 375x667): 149 taps a game before (~6.0 a turn), 129 after (~5.2 a turn).
- The cold tester's own count: ~4.8 a turn.

## What changed
1. The estate no longer zooms or slides when you build. It zooms on its own only when every target is on the estate and no finger is touching the screen. There is a Zoom/Fit button to zoom by hand.
2. The ★ shows by itself only on your first move of each turn in season 1. After that you ask for it ("★ Best move?" chip or the bulb), once a turn. It shows its reason and "Your call." A space only gets the bright glow when it is the ★ move.
3. Gentle plays its strongest moves when it falls behind and plays looser when it leads.
4. Explanations where things appear:
   - a legend line under the market (stall number = the die, badge = workers, scroll = lore; tap for detail);
   - lore tiles labelled with what they do;
   - a tappable season/round tracker that explains turn order and the banner track;
   - why the rival scored, shown on your turn, in the rival tab and in the PC panel.
5. Shorter turns:
   - one tap takes a tile or sells goods when there is only one way to do it;
   - the worker button glows when nothing else fits;
   - the Turn-over card shows only after a weak turn;
   - rival turns play faster and have a Skip chip;
   - a summary card at the end of each season.
6. PC: the rival's estate sits in the side panel, and the dock rows no longer overlap. New file `src/pace.js` (ui.js went over the 120 KB size limit).

## Cold-play verdict (independent subagent, as written, shortened only for length)
"Could I play it? Mostly. The tutorial taught the core loop well... I got lost on lore and scroll tiles ('Storage 4', 'End: 4/animal kind', 'Take: die ±1', 'Back lane 1 silver'), on what the white third die does, and when storage filled up. **Fun: 3/5.** Chaining sheep or a granary for +14 or +18 felt great, but most turns are fiddly bookkeeping and the late game slid away from me without my understanding why. Would I play again? Maybe once. Tension: close early, a blowout late. Phone: I led 46-39 after season 2, then lost 87-126. PC: I led 50-35 in season 3, then lost 60-146 (partly my helper: it kept taking the ★ tiles, never built them). Bug, phone result screen: the Total row reads Azure 62 / You 43; header and rows add up to 126 / 87 (PC totals correct). Confusing: 'S1/5 · R2/5', crate dice under stalls vs stall number, meeple badge, '6 → 2 workers', dashed die, '+N' vs '2/5' on hexes, score rows 'tower' and 'end count', banner track never seen, the 'One best-move hint a turn' popup covers the stalls, ★ points at a take not the full move so following it fills storage, Turn-over names a tile never noticed. Taps/turn ~4.8; ~1 tap/turn wasted re-opening Market because the view jumps back to the estate after every build. Mis-taps: PC storage tiles slide left after a build; PC End turn clicked as the turn auto-ended landed on next turn's worker button; phone hint popup over stall 4. Season ends: on phone it vanished before I could read it. Phone vs PC: PC felt better (all visible, no tabs); stall labels/badges tiny at 1366, left stall panel cramped next to big empty board margins. Length: 25 turns; ~11 min phone, ~17 min PC (a human ~25-35)."

## Open (for the next round)
- The Total row on the phone result screen is wrong.
- Late-game blowouts: the ★ suggests a single take, not a whole plan, and Gentle's hard play may be too strong late in the game.
- The season card should wait for a tap on phone.
- The bulb's "one hint a turn" popup covers the stalls.
- On PC, an End turn click can land on the next turn's worker button when the turn ends by itself.
- Storage tiles shift left after a build.
- On phone you re-open the Market tab every turn.
- The PC market panel is cramped.

## Proof
`proof/first-3-min-375x667.webm` (181 s, 21 of your turns, 103 taps), `proof/f3-375x667.png`, `proof/f3-375x667-market.png`, `proof/f3-1366x768.png`, `proof/f3-1920x1080.png`, `proof/f3-910x512.png`.
