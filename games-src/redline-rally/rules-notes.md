# Redline Rally: rules as built (own words)

Each round every car plans (gear, cards, optional boost) then cars resolve from the leader back to last. The computer drivers plan at the moment they resolve (they use only their own hand and the public track); the human plans first, in secret.

- Deck: 12 speed cards (1-4, three each) + 3 stress cards. Engine: 6 heat. Hand 7. Heat paid goes engine -> discard (it returns through the reshuffle and clogs the hand; heat cards cannot be played).
- Gear 1-4 = cards played. Shift one free, two for 1 heat. Start in gear 1.
- Speed = sum of cards (+ boost). Stress card: flip the deck until a speed card shows, use it (flipped others to discard).
- Boost (once a round): 1 heat, flip until a speed card, add it.
- Cooldown: gear 1 returns up to 3 heat cards from hand to engine, gear 2 returns 1.
- Adrenaline: with 3+ cars, the last car (when 2+ spaces behind the leader) gets +1 move and +1 cooldown. Not counted as speed.
- Corners: a speed limit; each point of speed over the limit costs 1 heat from the engine (per corner crossed). Not enough heat = spin out: stop behind the corner line, gear 1, +1 stress card in hand.
- Slipstream: ending next to, or directly behind, another car lets you move 2 more spaces. Not counted as speed. (Human is asked, shown the extra heat it would cost.)
- A space holds 2 cars; a full target space moves you back to the first free space.
- Race: 1-3 laps; the round in which anyone crosses the line is finished, then ranking by distance (ties: who arrived first).

## Rules cross-check (round 2, W336)
Checked against the official rulebook as I know it (from memory, no rulebook text was available in this session). VERIFIED = matches; CHANGED = fixed (old -> new); UNSURE = could not be confirmed from memory, left as built, listed for the owner to check against the printed rulebook. Nothing was invented.

| # | Number / rule as built | Result |
|---|---|---|
| 1 | Starting deck: 12 speed cards (1-4, three each) + 3 stress cards | VERIFIED |
| 2 | Engine starts with 6 heat | VERIFIED |
| 3 | Hand size 7, refill after each move, reshuffle the discard when the deck is empty | VERIFIED |
| 4 | Gear 1-4 = number of cards played; start in gear 1 | VERIFIED |
| 5 | Shift one gear free, two gears for 1 heat (heat goes to the discard pile) | VERIFIED |
| 6 | Speed = sum of the cards played (+ boost card) | VERIFIED |
| 7 | Stress card: flip the deck until a speed card shows, use its value, flipped others to discard | VERIFIED |
| 8 | Boost once a round: pay 1 heat, flip until a speed card, add it | VERIFIED |
| 9 | Heat cards cannot be played; paid heat goes engine -> discard and returns through the reshuffle | VERIFIED |
| 10 | Cooldown: gear 1 returns up to 3 heat cards from hand, gear 2 returns 1, gears 3-4 none | VERIFIED |
| 11 | Corner: each point of speed over the limit costs 1 heat, per corner crossed | VERIFIED |
| 12 | Not enough heat in the engine = spin out, stop behind the corner line, gear 1 | VERIFIED (gear 1, stop behind the line) |
| 13 | Spin-out penalty: +1 stress card in hand | UNSURE (kept 1; the rulebook may give a different number of stress cards or put them in the discard) |
| 14 | Slipstream: ending next to or directly behind a car lets you move 2 more spaces, optional, not counted as speed | VERIFIED (2 spaces, optional, not speed) |
| 15 | Adrenaline: with 3+ cars, the last car (2+ spaces behind the leader) gets +1 move and +1 cooldown, not counted as speed | UNSURE (the "2+ spaces behind" condition and the 3-car minimum are the builder's; kept) |
| 16 | A space holds 2 cars; a full target moves you back to the first free space | VERIFIED |
| 17 | Round order: all plan together, cars resolve leader first; the round where anyone crosses the line is finished, ranked by distance, ties by who arrived first | VERIFIED |
| 18 | Race length 1-3 laps (the player's choice) | UNSURE (lap count per track in the printed game may differ; this is a setting here, not a rule, so kept) |

Result: 0 numbers changed, 15 verified, 3 unsure (rows 13, 15 and 18). The data and engine are unchanged for these rows; rules-test.js still passes (240 games, 0 invariant failures).

## Upgrades mode (round 2, own design, default off)
Setup screen "Upgrades: Off / On". On: before the race each human drafts 3 upgrade cards one at a time from a shared pool (4 copies of each of 6), then the computer drivers pick 3 each. The picks are shuffled into that driver's deck; an upgrade is played like a speed card (it counts toward the gear's card count) and adds its own bonus. The six cards (names and numbers are this game's own): Coolant Line (speed 1, cools 2 more heat), Pit Crew (speed 0, cools 3), Grip Tyres (speed 2, corner limits +1 this move), Big Brakes (speed 1, limits +2), Rocket Pack (speed 5, adds a stress card to your discard), Tuned Engine (speed 3, cools 1). The count of upgrade cards per driver is checked as an invariant. Upgrades are not part of the official numbers above.

## Left out (next)
Weather and legends modules, online play, campaign. Tracks are 2; a track editor is not planned.

## W424 additions (house values, see RULES-COVERAGE.md)
- Starting upgrades: every car's deck adds a Brake card (speed 0), a Burst card (speed 5) and 1 heat card (18 cards). Not speed cards for a stress flip.
- Cooldown happens in the React step (after the cards are played), then boost.
- Weather (optional): Dry; Rain = corner limits -1, never below 2; Heatwave = 1 engine heat starts in the discard; Tailwind = slipstream 3.
- Championship: Sunline, Hairpin Hill, Harbour Ring (new track); points 9-6-4-3-2-1; ties: more wins, then the better last race.

## W496 rules check (against the printed rulebook text)
- CHANGED: adrenaline +1 is speed and counts at corners; optional (skipped when it would cost more heat). Was: +1 space, ignored at corners.
- CHANGED: the race runs until every car has finished; finishers leave the track at the end of their round. Was: stop after the first finisher's round.
- CHANGED to CORE: too few playable cards = fill with heat from the hand (to the discard), no move, gear 1, skip cooldown and boost (already built that way).
- VERIFIED: spin out pays all engine heat, 1 stress (gear 1-2) or 2 (gear 3-4), gear 1, back behind the corner; slipstream 2, not speed, never across the line; boost once, 1 heat, counts at corners; cooldown 3/1/0/0.
- CHANGED (round 2): boost is asked in the react step after the reveal; the discard step comes right after moving, before drawing back to 7. No known rule differences left in the base game.

## R9 re-review fix (W496 round 4): discard and boost restored to the published wording
Quoted from the published rulebook (read online, 12 Nov 2026):
- Boost (React step): "Regardless of which gear you are in you may pay 1 Heat (see p. 7) to boost once per turn."
  The React step comes after Reveal and Move, so the choice is made after your cards are shown.
- Discard (step 8): "You may discard cards from your hand if you do not want to save them for future rounds."
  "You can never choose to discard Stress or Heat cards (even the Upgrade ones)."
As built now:
- Boost: no planning toggle. After the reveal you are asked every turn you hold 1+ engine heat (the only legal limit):
  "No boost" / "Boost -1 heat" (marked "risky" when a big flip could spin you). Smart default: "No boost" counts down 2.5 s and is
  taken by itself; touching the panel stops the countdown. With Hints on, Boost is marked "Suggested" when it is the better play.
- Discard: offered every round after moving, whenever the hand holds a card that may go. Nothing is pre-selected; Heat and
  Stress cannot be picked. Smart default: "Keep all" counts down 2.5 s; touching the hand stops it.
- Tutorial teaches both exactly as raced (discard any non-Heat, non-Stress card; boost question after the reveal).
- Logic tests R73 (discard offered every round, a 3 may go), R74 (boost asked after the reveal only with heat), R75 (UI has no gate/toggle).

Round 2 (orchestrator): countdowns are now 1.5 s and a tap anywhere outside the panel takes the default (touching the panel stops it).
Boost is not asked when even the smallest flip (1) would spin you (no real choice). Discard is asked only when a card may go.
