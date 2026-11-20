# [FIXED5 emberclimb] report (20 Nov 2026)

Branch: shelf/W571-emberclimb-strict. Code head 82d70bb1 (this report is committed on top). Merged with origin/alex/brave-carson-rbpmlk and with the F2-F4 shelf head 53c833c6. Not deployed, no PR. The scheduled report back to the orchestrator was refused, so it is written here.

Note: my local checkout started from 83624785, not from 53c833c6. I noticed this when the push was refused and merged 53c833c6 in. Two conflicts came up: the die popup and the event result. I resolved both by keeping the F3 behaviour and adding mine on top. Every gate below ran again after the merge.

## Gates (after the merge)
- `build-all --quick` PASS (scenarios 14/14). `--full` PASS (phone-check, scenarios, lab, sweep). games/lab.html was restored and not committed.
- logic-test 70/70, rules-test PASS (300 games), f3-test 10/10, relic-test 19/19, tutor-test PASS, tut-walk PASS (390x844 and 375x667), calm-audit loops=0, maxHelpers=1.
- Map check over 500 seeds:
  - elites with a path that skips every campfire and shop: 0 of 959;
  - rooms with 2 or more exits: 65%.

Test changes (logic-test):
- Rule 66 is back to the remote's 1-act default.
- Rule 6 now walks into a fight room explicitly. The new campfire-before-elite pass can turn its first room into a campfire.

## What changed (src/engine.js, src/ui.js, src/head.html)

### 1. Punch
- A hit now carries its base value, its value after Strength, Vulnerable, HP lost and max HP.
- The damage number grows with the share of the foe's HP the hit took. It is labelled "N% of its HP" or "finishing blow".
- A bright chunk drains from the foe's HP bar.
- Gold callouts announce combos, e.g. "Vulnerable: 2 -> 4!" or "Strength + Vulnerable: 2 -> 6!".
- A kill gets a "Defeated!" callout, a quake, an ember burst and the crit sound.
- The first time a relic triggers (censer, tin flute, marbles, bangle, gold tooth), a callout says "<Relic> worked!" with its effect.

### 2. Rewards
Each reward card gets a box saying what it changes in your deck:
- attacks: "Beats a <act foe> in N turns (was M)", or damage a turn now vs before;
- block cards: block a turn;
- Strength, Vulnerable, poison and draw cards: a plain line;
- "Pairs with <card you own>" for Strength with multi-hit, Vulnerable with big hits, and poison with poison.

The before/after view for upgrades was already there.

### 3. Map
- A deterministic pass makes every path into an elite pass a campfire or shop first. The room just before the elite becomes a campfire, or the elite becomes a fight if that room is on floor 1.
- Lone-exit rooms get a second exit where no lines cross (on top of the F3 branching).
- The map legend now shows on PC too.

### 4. Pace
- A turn plan shows on the phone stage and in the PC panel: "3 energy = up to X damage or Y block".
- The turn ends by itself 1.1 s after no playable card is left, with an "Ending turn..." cue on the button.
  - It waits while a potion menu or a pile is open.
  - It is off in the tutorial and in ?scn= scenarios.

### 5. Leftovers
- The bottom hint line fits the screen:
  - Treasure: "Take the relic, then Continue";
  - after a card pick: "Tap Continue".
- Setup says "10 floors, boss on the 10th", matching Floor x/10.
- The round die says what it drives: "Round die: it picks the move of X", or that no foe uses it this round.
- Events:
  - no floating die over the picture; the result line shows the die picture instead;
  - the question no longer shows twice.
- PC:
  - the foe picture is capped so it no longer runs under the hero panel;
  - the hand has a 14 px bottom margin.
- A long phone hand lifts itself if its cards would run off the bottom edge.

Not done by me: the potion-name clipping and the title-screen gap (F3/F4 had touched potions).

## Cold-play verdict

Independent agent with no history. Phone 375x667: tutorial and 2 Quick climbs. PC 1366x768: one fight. Quoted as-is:

- Could you play it? Yes, nothing blocked me. The tutorial was short and clear. On phone you tap a card, then tap the target or the Play spot. On PC you click the card, then click the enemy or click the card again. I worked that out by trying. Cards slide sideways after each play, so on PC my next click often hit a different card than I meant.
- Fun: 3.5/5
- Would you play again? Yes. Climbs are short (about 10 floors). The map choices and rewards made me want one more go, and the Strength + Vulnerable combo was satisfying. Early fights are slow, though: most starting cards are "Deal 1" or "Gain 1 Block."
- Did you feel yourself getting stronger? Yes, in run 2. Popups showing numbers growing (for example "Strength + Vulnerable: 2 → 6!", later "Strength: 4 → 7!"), upgraded cards showing "Deal 5", relics like the extra-energy one, and card text updating to my real damage all made it visible. In run 1 I didn't feel it: I picked defensive cards and the boss still out-damaged me.
- Did losses feel fair? Mostly yes. Enemy intents are always shown, so I knew what was coming. The run 1 boss loss was my fault for not building damage. But the boss's "Keeps its Block" plus 5 block every turn felt like a wall to a beginner, and the sudden spikes card mid-fight was a surprise. I won fights at 1–2 HP several times, which felt tense rather than unfair.
- What confused you (most important first):
  1. The hint box on reward cards ("Damage a turn: 2 (was 2)", "Block a turn: 1 (was 1)", "Beats an Ash Imp in 4 turns (was 5)") reads like debug output. "(was same number)" means nothing to me.
  2. The bar at the top of a fight says, for example, "3 energy = up to 3 damage or 1 block", and its numbers seemed to change oddly.
  3. On PC the enemy intent reads "Block 2 Strength +1" right next to a separate shield badge for current block. I couldn't tell plan from present.
  4. On the PC map, nodes show enemy pictures instead of the legend icons (Fight, Rest, etc.), so I couldn't read the room types. The banner said "Ahead: 10 campfires", which seemed like a lot.
  5. How to play a card on PC (click it again?) was never explained. The side panel only says "Tap … again to play it" after the first click.
  6. Potions are only reached by tapping a small top-bar icon, which I discovered by accident.
  7. Small dark empty pill shapes sit on card art in rewards, and their meaning isn't clear.
- Best moment / worst moment: Best was the elite and boss turns where Strength + Vulnerable turned a 2-damage card into 6–7 damage with a popup, and finishing the boss at 2 HP for the Summit screen. Worst was the run 1 boss: chipping 1-damage cards into 5 block it keeps every turn, while it hit me back.
- Broken:
  - Phone reward: an empty grey bar and a second "Tap to take: Healing Draught" line sit behind the relic row. Colossus Slam text is cut by a dark pill.
  - Boss reward: the "More below" pill overlaps Skip and Continue.
  - Shop: "Panic Butt…" is cut, "More below" covers the bottom row, and a sold-out card's price shows through.
  - Fight: combo popups cover the energy bar and the intent. The potion popup lets the energy bar text bleed through.
  - Elite reward: empty dark chips on cards.
  - PC reward: the hint box covers "Exhaust" on Choking Cloud.
  - PC map: nodes don't match the legend, and "10 campfires" looks wrong.
  - PC fight: the hand re-centres after a play, so a quick second click hits another card.

The tester's screenshots are in the F5 worker's scratchpad (cold2/) and are not committed.

## Next fixes (cheap, Sonnet)
- Reward box: hide "(was N)" when nothing changed; say "+N damage a turn" instead.
- Turn plan: say "attacks" and "blocks" explicitly.
- Combo callouts: place them below the intent and away from the plan pill.
- PC map legend: use the same node art as the map.
- "Ahead: 10 campfires" (F4 aheadCount) counts every campfire on every branch. It should count the campfires on the best path.
- The empty value-tag pills on reward cards.
- The "More below" pill overlap on reward and shop.

## Proof (games-src/emberclimb/proof/)
- f5-375x667-3min.webm: real taps on the merged build; the climb reached floor 10.
- f5-375x667-combo-hit.png
- f5-375x667-reward.png
- f5-pc-1366-fight.png
- f5-pc-1366-hit.png
- f5-pc-1366-map.png
- f5-pc-1366-reward.png
