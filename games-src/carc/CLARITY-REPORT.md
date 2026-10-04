# Rampart & Vine: clarity report (Oct 2026)

Preview: `games/rampart-and-vine-next/index.html` (the live `games/rampart-and-vine/` is unchanged).
Method: the blind-newcomer loop from `games-src/thornbound/CLARITY-PLAN.md`. Each tester was a fresh agent with no repo
access, played one full game on a 390x763 phone screen through `games-src/scripts/drive-serve.js` and kept a per-screen
log. The logs are in `playtest/` (round1-* = before any change).

## Fun scores

| Round | Build | Casual (guided) | Impatient (no guide) | Average | Result |
|---|---|---|---|---|---|
| 1 | before | 3.0 (lost 85–127) | 3.0 (lost 101–135) | **3.0** | baseline |
| 2 | after fixes 1–9 | 3.2 (lost 88–117) | 3.4 (lost 98–108) | **3.3** | close, not met |
| 3 | after fixes 10–16 | 3.0 (lost 80–104) | 3.0 (lost 70–85) | **3.0** | not met |

Acceptance is not met: fun stays at about 3–3.4 instead of the 3.5 target. After three rounds (the brief's maximum) this is
the best version, shipped with the notes below. In round 1 the score itself was the confusion: "Cobalt +24, I never saw it
built", "the header says Cobalt on my own +2", "advice says ~7, the button says +3", "the end farm swing decided the game".
By rounds 2–3, every tester could explain each score they saw from the card ("5 tiles × 2 + banner × 2 = 12"), and every
one described the goal and a turn correctly. What still holds the score down is how the game feels on a small phone: the
camera, tiny tiles in the full-map view, and a late game with no followers. It is no longer about what happened.

## What the round-1 testers hit
1. Computer scoring cards came with no cause. They appeared at the start of my turn with no "whose tile" and no
   highlight on the board, and the header named the wrong player during them (both testers).
2. Bugs, each reproduced first by the new `game/clarity-test.js` (40 failures before, 0 after):
   - A score card never said whose tile finished the feature, and the top bar showed the next player while it was up.
   - The farm advice said "about 6/7/9 points" while the button said +3/+6.
   - The "No followers left" tip came back every turn (8 times in one game).
   - The strip said "0 left" while I still held the last tile.
3. Jargon: the advice said warden, wayfarer and brother, but the buttons said Town, Road and Priory. "done +2 · open +1" was cryptic.
4. With 6–8 follower options the list ran under the screen edge, and overlapping full-size ghost followers covered the tile.
5. There was no goal on screen, and the end-game farm count (often 40+ points) came as a surprise.
6. "Spots 1/3" next to "8 spots fit" was unexplained. Two tips appeared in a row, and the first one covered the tile.

## What changed (`game/src/`; the rules are unchanged)
1. **Score cards with cause → effect.** "Cobalt’s tile finished a town · 5 tiles × 2 + 1 banner × 2 = 12". Each holder
   is listed with their follower count, and the winner gets +N while the others get 0, with "most followers wins it (a
   tie pays everyone)". The scored tiles glow gold on the board, and the camera fits the whole feature. The engine's
   score event now carries who laid the tile and who stood in the feature (`fx('score',{…,by,fs})`).
2. **The top bar follows the card.** While a card is up, the bar names the player whose move it is.
3. **Score race always visible.** The score boxes show "if it ended: N" (the end projection from `finalScores()`), so
   the farm swing can be seen coming. The boxes stay visible above the computer's score cards. The first tip states the
   goal.
4. **What the computer just did**, in one short line on your turn: "Last: Cobalt put a farmer in a field: Cobalt +4".
5. **Plain words.** "Follower" everywhere, with "farmer" only for a follower lying in a field. Option lines read "+4 if
   finished · +2 if not", "+1 · back when finished", "+4 now, finished by this tile" and "+3 at the end · 1 finished
   town". Banners are explained on the card.
6. **Trustworthy suggestions.** The star's reason is shown above the follower choices, in the same numbers as the
   buttons (`figAdviceText`). The tile advice says "grows the town you already hold" and no longer quotes farm
   estimates that disagree with the buttons.
7. **Nothing clipped.** The dock grows when there are more than 2 follower options, so every option is visible.
   Non-suggested ghost followers are drawn at 60% size.
8. **End of game adds up.** The unfinished-features card opens with each player's total. Each farm card lists farmers
   per player, with the field glowing. The result card shows "55 in play + 31 unfinished + 36 farms = 122". A priory
   reads "8 of 9 tiles", not "1 tile".
9. **One tip at a time.** The no-followers tip appears once. A 450 ms tap guard stops a tap meant for the board from
   dismissing a new card.
10. **Pace.** A tile with only one legal spot is already shown there, so one tap places it. The river expansion is off
    by default for a first game (it was 12 turns where nothing could be chosen). The story card only shows in the guided
    game. The camera only re-frames on your turn if none of the legal squares is visible, and the follower step zooms in
    less.
11. "Spots 1/3" became "Next 1/3", with "8 spots fit (3 places: tap Next)". The tile counter reads "last" on the last tile.

## Tests (final build)
See the table at the end (filled from the final run).

## Still weak (honest)
- **Fun is about 3.0–3.4, not 3.5.** All four later testers lost to the normal computer by 10–40 points and blamed the
  loss on things they couldn't see coming. That was mostly the computer's farms and its many small 2-tile towns. A
  "Learning" difficulty, or a hint that warns "Cobalt's farmer will score this town", would help most.
- **Phone camera.** Five of the six testers complained that the camera moves or that the full-map view makes the tiles too
  small (about 30 px) to read. This round reduced the jumps, but a proper "keep my area in view" camera and a readable
  overview (a 2D minimap or a larger minimum tile size) are still needed.
- **Late game with no followers.** Testers sat on 0 followers for 8+ turns. The tip helps, but the advice still
  suggests growing towns that can't be finished in the tiles left (an AI evaluation issue, not changed here).
- **Not fixed:** "Play online" is half cut off on the phone setup screen at 390x763 (the setup screen is not covered by
  this pass). The "show the whole valley" button acts as a toggle, and tapping a dim square gives no feedback.
- The driver's tap-by-text on "Skip" timed out for several testers. The strip's Skip sits under the follower pop-up, so
  the driver hit the covered copy. Real taps on the pop-up's Skip work.
