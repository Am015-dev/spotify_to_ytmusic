# R51: strict re-check of two games waiting for go-live (14 Nov 2026)

There were two checks: rules against the original game, and clutter. The gates were already proven and were not rerun.
- **Rules.** I read the engine code and checked it against the original's rules, using the repo's own rules notes to identify the original. I ran each game's rules and logic tests.
- **Clutter.** Each game was built with `VIS_SLUGS="," build-all.py --quick`. I then played 2 normal (non-tutorial) games by touch at 375x667 with Playwright `touchscreen.tap`, starting from fresh storage.
  - Every second, a sampler counted the visible helpers: finger, glows, bubbles, pills, banners and pulsing elements.
  - It also logged every visible CSS or Web Animation with infinite iterations.
  - Raw counts merge parts of one helper (for example a region glow and its ring), so the table also gives a de-duplicated count of distinct helpers.

| Game | Hash | Wrong/missing core rules | Max helpers at once (raw / distinct) | Infinite loops | Verdict |
|---|---|---|---|---|---|
| shipwreck-isle | 51cb20c7 | 1 wrong (hungry-animals attack) | 4 / 3 | yes (bfGl, bfWarn, bfTap) | **FAIL** |
| thornbound | 5f133a5a | 0 in engine; 4 core commands described wrongly in the in-game hint line | 6 / 3 | yes (rgp, rgl, spotp, tb-breathe, tb-dash) | **FAIL** |

---

## 1. shipwreck-isle at 51cb20c7 (origin/shelf/W468-shipwreck-lean)

The original is the 2012 co-operative castaway survival game named in `rc/rules-notes.md`. Tests: logic-test 277/277 and rules-test 28/28. Both test suites only check the repo's own reading of the rules.

### Rules

| Area | Result |
|---|---|
| Setup: Friday (1-2 players), dog (solo), morale 0, 9 always-present + 5 random inventions, personal inventions, 2 starting items x2 uses, wreckage card, event deck 6+6 (engine.js:33-46) | OK |
| Phase order; no event in round 1 (phases.js:6,14,124) | OK |
| Event icon ("?" token or book), threat slide, threat effect when pushed off (phases.js:15-25) | OK |
| Morale track; unpaid determination becomes wounds (phases.js:26-29, engine.js:95) | OK (the +3 value is uncertain, see minor 3) |
| Production (phases.js:30-36) | OK |
| Actions: 1 pawn rolls 3 dice, 2 pawns = sure success, hunt needs 2 pawns, threat actions, +1 pawn for distance and fog (phases.js:55-64,123,143-146) | OK |
| Failure gives +2 determination; Friday takes a wound instead of an adventure (phases.js:165-172) | OK |
| Hunt: wounds = strength minus weapon, weapon loss, food and fur (engine.js:294-315) | OK |
| Shelter, roof and palisade costs by player count; roof and palisade need a shelter (phases.js:69,75,86) | OK |
| Weather: snow costs wood, clouds over the roof cost food + wood, storm costs palisade (phases.js:206-234) | OK |
| **Weather: hungry-animals beast attack (phases.js:231)** | **WRONG** |
| Night: 1 food each or 2 wounds; no shelter = 1 wound; camp move halves roof and palisade; food spoils, dry food keeps (phases.js:236-277, engine.js:227-232) | OK |
| End: any castaway dies = loss; Friday's death is not a loss (engine.js:88-91) | OK |
| Scenario 1: fire + 15-wood pile, one stage a round, win in rounds 10-12 (scen.js:17-24) | OK, except the win timing (minor 1) |
| Rules page and guide agree with the engine | Yes, so they repeat the wrong rule (rules-html.js:17) |

**Wrong or missing core rules**
1. **WRONG (core): hungry animals fight the weapon instead of the palisade.** `rc/phases.js:231` computes `3-G.weapon`. In the original, the strength-3 beast on the animals die is matched against the **palisade** level. Each castaway takes 1 wound per level the palisade falls short. Defending against storms and these attacks is what the palisade is for. As built, weapon upgrades protect the camp in the weather phase and the palisade is undervalued. The rules page says the same wrong thing at `rc/rules-html.js:17` ("strength 3 against your weapon").

**Minor, or not yet verified**
1. Scenario 1 can be won before that day's weather and night. `scen.js:24` runs `check()` in `afterActions` as well as in `endRound`. Rescue should be checked at the end of the round.
2. Gather and explore are capped at 2 tiles from camp (`phases.js:92,94`). In the original, each extra step costs +1 pawn and there is no hard cap. This rarely matters on this map.
3. Morale +3 gives 2 determination or 1 heal (`phases.js:28`, `rules-html.js:14`). Check this against the original track.
4. Dice face tables (`data-gen.js:4`) are unchecked. The explore adventure die has 5 of 6 "?" faces, and the rain die has a snow face. If these are wrong, explore draws too many adventures. Verify against the original dice.

### Clutter (2 games, own plan, no ✨ taps, seeds 7 and 11)
- Game 1 lasted 136 samples and was lost on day 8. Game 2 lasted 98 samples and was lost on day 6. There were no page errors.
- **Max helpers at once:** 4 raw. Distinct helpers: **3**, all at once:
  - the glowing places `.bfgl`;
  - the pulsing pawn warning `.bfpw.set.bad`;
  - the pulsing warning button `.bfa.warn`.
- **More than one helper:** 37 of 136 samples and 26 of 98 samples. The most common pair is `.bfgl` + `.bfpw.set.bad`.
- **Infinite loops on screen:** in 81 of 136 and 58 of 98 samples.
  - `bfGl` on `.bfgl` (head.html:676, `animation:bfGl 1.1s infinite`)
  - `bfWarn` on `.bfpw.bad` (head.html:623) and on `button.bfa.warn` (head.html:634)
  - `bfTap` finger (head.html:656)
  - also `bfGlow` on map hex picks (head.html:652)

### Verdict: FAIL
There is 1 wrong core rule, up to 3 helpers at once, and infinite animations.

### Fix list
1. `rc/phases.js:231`: compare the beast's strength 3 with `G.pal` (palisade), not `G.weapon`, and fix the log text. Fix the rules text at `rc/rules-html.js:17` and any guide or tutor copy that says "weapon" here. Add a rules-test case.
2. `rc/head.html:623,634`: make `bfWarn` finite (2-3 pulses, then static red). Show either the pawn warning or the warn button, not both alongside the glows.
3. `rc/head.html:676`: give the `.bfgl` glow 2-3 pulses, then a static ring. `head.html:656` (`bfTap` finger) and `head.html:652` (`bfGlow`): use finite iteration counts.
4. Show one helper at a time: while place glows show, hide the warning pulses until Start day is refused.
5. Minor: `rc/scen.js:24` should check only in `endRound`. Check the morale +3 value (`phases.js:28`), the 2-tile cap (`phases.js:92,94`) and the dice faces (`data-gen.js:4`).

---

## 2. thornbound at 5f133a5a (origin/shelf/W489-thornbound-rules)

The original is the 2025 card-driven, four-faction area-control game paraphrased in `thornbound/rules-notes.md`. Tests: rules-test 119/119. A node sim confirmed the setup (hand of 6 with the Heir, deck of 8) and the Great Road "none taken, discard two" rule.

### Rules

| Area | Result |
|---|---|
| Setup: hand 6 with the Heir, deck 8, Road 4, Favour placed, order track (engine.js:151-159) | OK |
| Start of Year: draw, Attrition (reshuffle, hand size -1, min 3), order by Influence with ties reversed (engine.js:205-220) | OK |
| Bids: secret, printed Strength, highest first, ties to higher order (226-239) | OK |
| Take, steal only if strictly higher, or take back; stolen occupier returns to hand (240-258) | OK |
| Occupy, replace, max 2 Kingdom cards (267-277) | OK (the 3rd HQ space is a minor gap) |
| Great Road: discard 1, or 2 if none taken; slide; refill; no discard when taken by an ability (259-264, 547) | OK |
| Heralds in turn order; 3 face-down cards; short hands place first (308-321) | OK |
| Supporters in Spring; they count only in their first Clash (400, 408, 493) | OK |
| Last player orders the Clash markers (339) | OK |
| Day: Ambush (added cards reveal with only their own powers), Retreat, Flank (353-356, 602-628) | OK |
| Night: Deadly hits all rivals, mutual kills, Invulnerable, Resilient, Agent drawback (358-392) | OK |
| Strength tally (399-408); tie play-or-pass re-clash; all pass = no reward (410-414) | OK |
| Rewards: pick a Location, Influence + optional text, Herald +1 and steal 1 per rival Herald (425-466) | OK |
| Autumn: Govern, Journey, Rally, Deploy; Winter cleanup; Favour 3 uses (571-599, 667-698, 743-757) | OK |
| End after N rounds; ties to Favour, then order (758-762) | OK |
| 14 basic cards, 16 Tactics, 4 Favours, 20 Site cards | OK (minor readings below) |
| **In-game hint line for commands (ui1.js:73)** | **WRONG** |

**Wrong or missing core rules**
1. **WRONG (in-game rules text, core commands): `game/src/ui1.js:73` (CMD_L).** This text is shown by `cardLine()` in turnstrip.js and in the hand aria-label (ui4.js:23) every time a card is selected.
   - Flank says "fights in the next region too". Engine: the card moves to one other unresolved Region.
   - Rally says "adds Supporters". Engine: your Active cards return to hand (this covers the Trader and the Heir).
   - Deploy says "places a Supporter". Engine: a hand card goes face-up and Active next to a Region.
   - Deadly says "Eliminates a rival card". Engine: it eliminates **all** opposing Active cards in the Clash, and the Agent's drawback is not mentioned.

   The engine and the full rules page (ui5.js:131-147, glossary ui7.js:56-59) are right. The hint players see most teaches four of the basic commands wrongly, and this is the same kind of fault the owner found in the earlier games. Strict call: **FAIL**.

**Minor**
- engine.js:268: a bid cannot use the 3rd space added by the faction HQ (`upr_hq1`).
- engine.js:388-389: Back Lanes pays once per eliminating card rather than once per event.
- engine.js:440: Ossuary overflow stays in the Discard instead of going to the top of the Deck.
- engine.js:468: Martial Writ lock lasts until the Clash, not the whole Round (a listed assumption).
- ui5.js:134 and ui7.js:51: the order-tie text says "higher on it" (the engine correctly reverses ties).
- ui7.js:35: the Great Road glossary leaves out "discard two if none taken".

### Clutter (2 normal games, title Quick game, then Start by touch; tutorial off; seeds 1 and 2)
- Both games reached the result screen (176 samples each). There were no page errors and no dead taps.
- **Max helpers at once:** raw 6 and 5. Distinct: **3**, at the same moment:
  - glowing playable hand cards `.hc.glow.pl`;
  - the pulsing selected card `.tb-card`/`.hc.rg` (`rgp`);
  - the glowing recommended region `.rglow.rrec` (`rgl`).

  In the Spring step, the Kingdom take/steal glows `.kcb.glow`/`.steal` show together with pulsing `.kn`/`.stl` markers.
- **More than one helper:** 59 of 176 and 56 of 176 samples.
- **Infinite loops on screen:** in 75 of 176 and 78 of 176 samples.
  - `rgp` (src/head.html:66, 413, 419)
  - `rgl` (src/head.html:432)
  - `spotp` on the bid spot (src/head.html:442)
  - `tb-breathe` on `.tb-win` and `tb-dash` + `tb-breathe` on `.tb-ring` (kit/kit.js:954,957 = kit/parts/p7-anim.js:8)
  - `gxh-pulse` help ring (shared shell)

### Verdict: FAIL
The engine is right, but the in-game command text is wrong for four core commands. There are up to 3 helpers at once and many infinite animations.

### Fix list
1. `game/src/ui1.js:73`: rewrite CMD_L to match the engine and the rules page:
   - Flank: "moves to another unresolved region".
   - Rally: "returns your Active cards to hand".
   - Deploy: "puts a hand card face-up in a region".
   - Deadly: "eliminates ALL rival Active cards here (Agent: dies if a rival Follower is here)".
2. `game/src/head.html:66,413,419,432,442`: replace `infinite` with 2-3 iterations, then a static glow (`rgp`, `rgl`, `spotp`).
3. `kit/parts/p7-anim.js:8` (built into kit.js:954,957): make `tb-breathe` and `tb-dash` on `.tb-win` and `.tb-ring` finite, or static.
4. Show one helper at a time:
   - while a card is selected, keep only the recommended-region glow (drop the playable-hand glow and the card pulse);
   - in Spring, glow the Kingdom cards but don't also pulse the `.kn`/`.stl` markers.
5. Minor: the engine items above, and the text at ui5.js:134, ui7.js:51 and ui7.js:35.
