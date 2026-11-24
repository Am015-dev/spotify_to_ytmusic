# [FIXED14 thornbound] report

Branch `shelf/W489-thornbound-rules` @ 02f34c6e (code). Merged origin/alex/brave-carson-rbpmlk. Pushed after every fix, no force-push. `games/lab.html` was restored after each run, not committed.

## Gates (final code, each run alone)
- `build-all --quick`: PASS.
- `--full` x3: PASS, PASS, PASS (phone-check 86.2 / 81.4 / 88.2 s, sweep PROBLEMS 0, lab WARN 10/12 as before).
- rules-test 119/119, logic-test 165/165, hint-test PASS (76 cards).
- loop-test PASS (0 infinite-loop samples).
- doubletap-test PASS in 8 of 8 repeat runs at 375x667 and 375x553, with 0 legit taps eaten.
- bulb-calm-test PASS (375x667 with 3 bulbs, 375x553 with 3 bulbs, tutorial at 375x553). finger-test PASS.
- New linefit-test PASS at 375x553 and 375x667.
- Not run: accept-test (not a listed gate; I stopped it after a long run).

## Win rates
Default game: Clans vs Gilded Court, Easy, 4 rounds.

| Who plays | Rival | Result |
|---|---|---|
| `sugsim.js`, new: seat 0 always plays getRec, the exact move the glow and the Suggested tag show | default | 10/12 (83%) |
| same | Hard | 6/10 |
| Real-UI touch follower (fixed glow-follow and helpers.js), both sizes | default | won 6 of 6 (21-6, 16-10, 15-10, 17-9, 12-10, 22-6) |
| Engine player at Normal strength | Hard | 0/12 |
| Newcomer proxy | Hard | 1/12 |

Hard stays challenging.

**Root cause of R71's 0/4:** its follower bot never tapped the suggested region (`.rrec`) or the suggested spot (`.bspot.rec`). It put cards and Supporters in the first glowing region and took the first option of every follow-up choice. Strictly following the suggestions already won 4/4 before any change.

**Easy is also gentler now** (noise 5, cunning 0, eases off when 1 or more ahead):
- Newcomer proxy vs Easy: 15/30 before, 17/30 after.
- Normal-strength play vs Easy: 14/30 before, 21/30 after.
- Normal and Hard are unchanged.

## Helper counts
helper-sample.js now counts by class:
- `suggest`: `.rg`, `.rec`, `.rrec` or the ghost finger.
- `bubble`: a coach, bulb or tutorial bubble with its own pointer.
- `bubble2`: a bubble pointing at two places.
- `button`: a highlighted button.
- Legal-move glows are reported as `legal` and not counted, as in the hollowbough calm pass.

| Run | Max helpers | After-bulb 15 s windows |
|---|---|---|
| Tutorial, 375x553 | 1 | - |
| Tutorial, 375x667 | 1 | - |
| 2 games, 375x667 | 1 | max 1 |
| 2 games, 375x553 | 1 | max 1 |

0 infinite-loop samples in every run. A first run found a bubble open together with a gold `.opt.rec` option; that is fixed.

## What changed
1. **Tap guard (turnstrip.js).** It now also arms when a `.gxh-bub` is removed or loses `on`; gx-help removes the bubble at pointerdown. It arms on the next task, because the observer could run before the guard had recorded the closing tap. That race made it flaky. doubletap-test adds:
   - coach "Got it" and bulb cases at 110, 180 and 250 ms;
   - a check that the bubble is open before each double-tap;
   - a legit-tap check (`TBTAPGUARD.eaten`).
2. **Newcomer can win.** Easy is gentler (ai.js). New `sugsim.js`. glow-follow.js and helpers.js now tap the real suggestion.
3. **The bulb lights one target.** A card-then-spot move points at the card only, with no "from" ring or finger. While any help bubble is open, suggested option buttons drop their gold mark (head.html, ui11.js). sweep.js's bulb check follows this contract.
4. **helper-sample.js rewritten.** It counts by class and excludes glows the page's CSS has switched off.
5. **Turn line at 375x553.** When the line is long, the chip wraps to two short lines and the Goal button narrows; all text stays 14 px. Overflow is judged by the text's own boxes, so the 44 px tap areas of glossary words no longer false-trigger. Also fixed a doubled full stop ("Council..").
6. **Card text.** Rite of the Fang now names Commands. Ivory Rampart says "two or more Supporters".

No visual deploy was done.
