# R33 strict gameplay re-review (12 Nov 2026)

Rubric: games-src/reviews/GAMEPLAY-RUBRIC.md. For each game I checked out its branch in a separate worktree and merged
origin/alex/brave-carson-rbpmlk locally (not pushed). Then I ran the deploy gate
`VIS_SLUGS="," python3 games-src/scripts/build-all.py --full --out /tmp/r33/<slug> <slug>`.
I played the staged page with its games/<slug> media folders next to it. Files were served through Playwright request routing (no open port).
Input was touch only (hasTouch, isMobile, `page.touchscreen.tap`), on default settings, at 390x844 and 375x667.
A tap counts as dead if nothing on the page changes within about 1.3 s. My drivers only look at the screen (text, glowing or spotlit
elements). The one exception is the Gate Wyrm check below, which set up the boss fight with the game's debug hook and then played it by touch.
I did not edit game code. Rulebook notes and downloaded sources stay in a local folder outside the repo.

| Game | Total | Verdict | Gate | Lowest rows |
|---|---:|---|---|---|
| emberclimb | 7.1 | PASS | PASS | 2, 3, 4, 5, 7, 8 at 7 |

---

## 1. emberclimb (shelf/W485-emberclimb-bench @ 1b797822, already up to date with alex/brave-carson-rbpmlk): 7.1 PASS

**Gate: PASS.**
- Build, scenarios and phone-check (55 s) passed.
- The lab test gave WARN 5/8 (LAB row mismatch). That does not block the gate.
- Sweep: "s 6 wins 1 avg floor 7.0 … RULES TEST PASS (40 games)".

What I played:
- **Tutorial ("New here? Learn in 5 minutes"):** 15 guided steps, 22 taps, 0 dead, about 35 s, at both sizes.
  - Then the coached climb at 375 to the end: CLIMB WON over Mire Behemoth, 7 floors, 119 taps, 0 dead, 93 s.
- **Quick game on defaults** (Garrick, Gentle). A newcomer bot played it: block when a hit is coming, else attack; random rooms; reward card 80% of the time.
  - 390x844: **lost on floor 10 to the boss Ashen Wraith**, 368 s.
  - 375x667: **won (SUMMIT)** over the boss Mire Behemoth, ♥ 184/400, 226 s.
- **Gate Wyrm boss** (debug start, then played by touch at 390): foe turns took 0.85 to 1.9 s.
- 0 page errors, 0 console errors, 0 stuck states. My bot logged 4 "dead" card taps, but each was a first tap that only lifts the card (selection).
  That change is visible, so none of them is a real dead tap.

### Boss check (my own sources, notes local)
- **Mode structure.** A rules summary site describes the printed rulebook example for this boss:
  - it starts in Attack Mode;
  - a mode switch moves the action cube to the first action of the new mode;
  - only the current mode's actions are active.
  The build does this.
- **Numbers.** I found an open-source simulator of the board-game mod on GitHub, separate from the fixer's sources A and B. It lists the same card:
  - Attack Mode: 2 dmg + 5 Block, then the Mode Shift hit of 6. If the Block is broken, it switches to defensive mode instead.
  - Defensive mode: Sharp Hide 1, then 2 dmg, then 4 dmg + 1 Strength (Sharp Hide removed), then back to Attack Mode.
  - The same file's 6-step burn-boss sequence also matches Ashen Wraith (ending 3x2 + 2 Burn + Strength).
- **Played it by touch.**
  - Turn 1 intent: 16 + 40 Block.
  - I cut the Block to 16. Turn 2 intent was "48, Mode Shift". The wyrm dropped its Block and hit for 48.
  - Turn 3 went back to 16 + 40 Block.
  This matches the sources (x8 game units). **Verified.**

| # | Row | Score | Why |
|---|-----|------:|-----|
| 1 | Rules fidelity | 8 | Fixed: the Gate Wyrm now matches the printed card, which an independent source confirms. The other act-1 bosses match too. Story ships Act 1 only, so the invented act 2-3 foes are gone from what a player meets. The default Gentle mode multiplies hero HP x5 (♥ 400/400). It is not the rulebook, but it is clearly labelled: "Gentle (first climb) / Tabletop (rulebook)", "Easier: more HP and potions", and "Played on Gentle (easier mode). Try Tabletop next." on the result. |
| 2 | Tutorial teaches | 7 | 15 one-line steps in rule order (intent, energy, attack + Vulnerable, Block, end turn, pattern, Strength, Weak, potion + Poison, finish, reward, map), 0 dead taps at both sizes, then a coached climb that plays to the end. Still 4 Next-only steps (goal, energy, pattern, path), as in R29. |
| 3 | First 10 seconds | 7 | Big "New here? Learn in 5 minutes"; Quick shows a 4-line goal card ("Reach the top. Beat the boss there."). |
| 4 | Turn clarity | 7 | Intent badges ("16 🛡 40"), "Incoming 16" under the hero, card text "Deal 16." / "Gain 8 Block.", one line under the hand. |
| 5 | Phone play | 7 | Every control is 44 px or more at both sizes. Boss fights fit at 375. The hand fan overlaps, but each card taps fine. |
| 6 | AI and pacing | 7 | Foe turns 0.85-1.9 s. Climbs take 4-6 min (coached climb 1.5 min). On the default Gentle, a newcomer reached the boss in both climbs and won 1 of 2. The loss came at the boss, not to a regular foe as in R29. |
| 7 | Feel | 7 | Painted foes and rooms, damage pops, the card lifts on tap, reward fan, painted SUMMIT / FALLEN screens with the final deck. |
| 8 | Bugs | 7 | Gate PASS. 2 climbs, 2 tutorials and 1 coached climb: 0 errors, 0 stuck states, 0 real dead taps. |
| | **Total** | **7.1** | **PASS**: every row is 7 or more, no stopper. 8+7+7+7+7+7+7+7 = 57/8 = 7.125. |

### Earlier findings (R29)
| Finding | Status | Evidence |
|---|---|---|
| Row 1: Gate Wyrm's every-turn 40 Block, single source | **Fixed and verified**: 2-step attack mode with Mode Shift, confirmed by an independent source | games-src/reviews/R33-shots/ec-wyrm-t1-390.jpg, games-src/reviews/R33-shots/ec-wyrm-t2-390.jpg |
| Row 1: Story uses invented act 2-3 foes | **Fixed**: Story shows "Act 1 · The Mire Road", 3 chapters, "More chapters are coming soon." | none (text check) |
| Row 6/1: Gentle x6 still dies on floor 8 to a regular foe | **Fixed enough**: x5 now, both climbs reached the boss, 1 of 2 won | games-src/reviews/R33-shots/ec-q375-result.jpg, games-src/reviews/R33-shots/ec-q390-result.jpg |
| Row 2: 4 Next-only steps | **Not fixed** (still goal, energy, pattern, path) | games-src/reviews/R33-shots/ec-tut390-end.jpg |
| Row 5: "Spine Sl…" name cut in the split | Not re-seen (split fight not met in my climbs) | none |

### New findings
| Row | What I did | What happened | Screenshot |
|---|---|---|---|
| 6 | Quick game on Gentle at 390 | Reached floor 10 and lost to Ashen Wraith (boss) at 0/400. The setup says "Easier", but the act-1 boss can still end a newcomer's 6-minute climb. That is acceptable for a deckbuilder, and the "Try Tabletop next" line is fair. | games-src/reviews/R33-shots/ec-q390-result.jpg |
| 4 | Gate Wyrm turn 2 at 390 | The badge shows "48" for the Mode Shift hit. Nothing on screen says the hit only lands if its Block is still up, or that breaking the Block flips it to defensive mode. A newcomer meets the rule without being told. Minor. | games-src/reviews/R33-shots/ec-wyrm-t2-390.jpg |
| 8 (good) | Coached climb after the tutorial, at 375 | Played to CLIMB WON over 7 floors, 0 dead taps, 0 errors. | games-src/reviews/R33-shots/ec-tutclimb375-result.jpg |
| 5 (good) | Boss fight at 375 | Hero, boss, HP bars, intent and the full hand fit. | games-src/reviews/R33-shots/ec-q375-boss-fight.jpg |
