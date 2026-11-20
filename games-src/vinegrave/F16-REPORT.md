# [FIXED16 vinegrave] report (20 Nov 2026)

The report trigger was refused, so the report is this file.

Branch `shelf/W490-vinegrave-bench`. Fix commit 02ba507a, proof commit 49fe3be7. Before pushing I merged `origin/alex/brave-carson-rbpmlk`; it was already up to date. Nothing is deployed and there is no PR.

## Gates
| Gate | Result |
|---|---|
| `--quick` | PASS, 8/8 scenarios. Play is now one tap, so the 4 `?scn=` play steps no longer tap `#gobtn` |
| `--full` | PASS: phone-check, and rules-test over 200 AI games. Lab WARN 3/8 (rows != scenarios), the same as F14. lab.html restored, not committed |
| Animations, taps | No infinite animations added. On phone, Undo and the score row are 44 px tall |

## Easy rival (AI only)
The Easy settings changed from p0 .75 / p1 .2 / cap 26 to .25 / .3 / 13.

| Player | Before | After |
|---|---|---|
| Glow follower | 13% (42 vs 72) | 53% (43 vs 38), 60 games |
| Sensible newcomer | 2% (39 vs 79) | 57% (42 vs 41), 60 games |

The "63% for the glow follower" from the brief did not reproduce on today's code. Normal and Hard are unchanged.

## What changed
1. **First real game teaches one idea per round.** It counts as the first game when no game other than the tutorial has been played (`prefs.games`).
   - One short start card replaces the long "How you score" card.
   - Each round card carries a "New this round" box:
     - round 1: travel and dig;
     - round 2: guardians and idols;
     - round 3: research;
     - round 4: cards and stars.
   - Ideas not taught yet are dimmed until their round: the research track, guardian badges, market stars and "need" tags. A glowing move stays bright.
2. **Score row from turn 1.** It is a 44 px button with two lines.
   - Line 1 starts as "You 5 = 5 shrine slots". After that it shows every change and its cause. The first time a source appears it adds a short note, for example "(3 each)".
   - Line 2 is the rival's last move.
   - Tapping it opens "Where points come from". That sheet explains each source in plain words (research, temple, idols, shrine slots, guardians, card stars, Dread) and lists the rival's last 6 moves.
3. **One tap.** A card, buy, dig, explore, fight or research climb with only one choice happens on the first tap.
   - A 4 s Undo follows, and the rival waits for it.
   - Research with two spaces still opens its chooser.
   - The guided tutorial is unchanged.
4. **Glow and wording.**
   - The glow ring is now drawn inside the card or site, so the hand and market strips no longer cut it off.
   - The prompt now says "Gold rings mark strong moves."
   - "Climb research: a gift now" is now "Research now: a bonus, and points later."
   - The hand is left-aligned in fixed slots, so it no longer re-centres or re-fans after a play.
5. **Rival moves.** The pop-up that vanished is gone. The last move stays in the score row.
6. **PC.**
   - Choosers open over the hand, so the dock no longer grows and squeezes the map.
   - The result card hides its art box until the art has loaded.
   - 910x512 checked.

## Cold-play verdict, as-is
An independent subagent with no history played the tutorial and a full game by touch at 375x667, then one game by mouse at 1366x768. Its report:

> **Could you play?** Yes, on both. On phone I finished the tutorial and one full 5-round game. On PC I finished a full game. I played the first round and a half by hand, then a script took my turns. It played badly: it mostly researched, bought cheap cards and passed, and never explored deep ruins. Nothing blocked me anywhere.
>
> **Fun (1-5)**
> - Phone: 3. Lots to do, and the round and score popups feel rewarding. But the rival (easy) was a pushover and the map icons are tiny.
> - PC: 3. Same game with easier-to-read cards. The final screen bug (below) spoiled the end.
>
> **Would you play again?** Maybe, for 15-20 minute sessions, on a harder rival. Easy was not a challenge: I won by 51.
>
> **Did you understand how to score?** I understood:
> - research track height
> - the top temple tiles (6 or 2 points)
> - star badges on bought cards
> - idols (3 each)
> - beaten guardians (5)
> - shrine slots, where each empty slot is a point and placing an idol costs 1
> - Dread cards (-1 each) and exiling them
>
> I didn't understand at first why spending an idol on a shrine *lost* a point. I also wasn't sure what "Set×2" in my item row meant.
>
> **What confused you**
> - **PC end screen shows the wrong numbers.** The header said You 16 / Tamsin 51 and the line read "35 points short". But the breakdown showed Tamsin 31 (her categories add up to 18) and You 0, with 0 cards even though I had card stars.
> - On phone the research track is a dense column of tiny numbers and icons, and I tapped it without knowing what I'd get.
> - Board sites show only a number plus small icons (boot, boat, jeep). Nothing on screen says the icons are the travel cost.
> - The "need 2 / Free / 1★" badges on market cards took me a while to read.
> - After passing in round 4 I had nothing to tap and no clear "waiting" state except the "Tap to hurry" line.
> - On phone the item row ("Boon / Idol / Scribe / Used×2 / Set×3") scrolls off the right edge at 375px.
> - The tutorial step pointing at "Trail Notes +1 compass" doesn't say why I'd need compasses.
>
> **Final scores**
> - Phone: You 80, rival 29. I won.
> - PC: going by the header, You 16, rival 51, and I lost. The result screen showed 0 vs 31 instead.

## Open
- **PC end-screen numbers.** These are probably a screenshot taken mid count-up: every number counts up from 0 over about 1 s. My own 1366x768 result shot, taken 2.5 s after game over, shows correct breakdowns (29 vs 36). Still worth one check.
- **Easy may now be too soft for an engaged player.** The tester's phone game ended 80-29. The benches say a sensible newcomer wins about half, in close games.
- **A glowing site under the dock.** Once, in a scripted phone run, a glowing site's centre was under the dock, so the tap missed. Two later runs did not reproduce it.
- **Still to do:**
  - a legend for the travel icons;
  - a research track that is readable on phone;
  - a clear waiting state after Pass;
  - the chip row at 375 px.

## Proof
- `games-src/vinegrave/proof/first-3min-375x667.webm`, made with `f16-video.js`.
- `f16-shots.js` plays one game per size: 375x667 by touch, then 1366x768 and 910x512 by mouse. With `ONLY=1` it runs the phone size only and logs every tap that changed nothing.
