# Hollowbough: tutorial coverage (the prologue game)

Proof: `game/tutor-e2e.js` plays the whole guided game from fresh storage by tapping each spotlit target, at 390x763 and 1440x860, asserts the centre of each target is not covered by the kit, that every step id below was shown (`UI.tutLog`), that the end card is reached and the tutorial is saved. The step text and Hazel's reaction beats are in `game/src/story.js`.
Honest status: the tutorial is a short staged game (Winter + Spring, then both pass), so it teaches the core loop. Rules marked NOT COVERED are explained by the lightbulb hints and the Help drawer, not by doing them once. Chapter resume: leaving half way restarts from step 1 (the staged board is not saved); chapter openers are tagged "Ch N" in the bubble.

| # | Rule | Taught at step (chapter) | Story beat (reason -> reaction) |
|---|---|---|---|
| 1 | Goal: most points when everyone has passed | goal (1) | "The Oak needs a steward" |
| 2 | Setup: workers, meadow of 8, hand, forest places | places (1), hand (2) | "The woods are generous" |
| 3 | Place a worker on a basic place | twig (1) | "A roof starts with twigs" -> "Three twigs! Half a roof." |
| 4 | Goods (twig, resin, pebble, berry) pay for cards | stock (1) | "Your pantry" |
| 5 | Exclusive place holds one worker; shared place many | rival (1), berry (3) | "Bramble beat you" / "Even rivals share" |
| 6 | Second worker, gather resin | resin (1) | "A roof needs glue" -> "Chapter 1 done" |
| 7 | Card prices, glowing = affordable | hand (2) | "Bramble is already hammering" |
| 8 | Build a Construction from hand (pay cost) | build (2) | "Raise the Allotment" -> "Your first stone" |
| 9 | City (limit 15), production on play | city (2) | "Your city" |
| 10 | Prepare for Season: workers home, +1 worker, production | prep (2), spring (2) | "Spring comes" -> "Warm days, new hands" |
| 11 | Season order Winter, Spring, Summer, Autumn | spring (2) | "New season" |
| 12 | Buy a card from the meadow (critter costs berries); refill | toad (3) | "The meadow is open" -> "The meadow refills" |
| 13 | Free critter into its matching Construction (occupy) | free (3) | "A free lodger" -> "That is the trick!" |
| 14 | Claim a basic event with the right buildings (3 pts, one claimer) | event (3) | "A flag" -> "Nobody else can take that" |
| 15 | Forest place (more goods) | forest (3) | "The forest pays more" -> "Chapter 3 done" |
| 16 | Pass; passing early leaves workers unused | pass (4), rscore (4) | "Winter ends" |
| 17 | Scoring: card points, tokens, events, bonuses, Long Road lines | score (4) | "The count" |
| 18 | Rival's score computed the same way; winner decided | rscore, end (4) | "The Oak decides" |
| 19 | Real game is 4 seasons | end (4) | closing line |

## NOT COVERED (honest list)
Open destinations (Inn, Post Office: the rival's open card, owner gets a point), exclusive vs shared destination cards, Haven (discard 2 for 1 goods), The Long Road (journey, autumn only), special events (needs and costs), prosperity bonus cards (King, Architect, Castle...), unique vs common limit, hand limit 8 and discarding, point tokens on cards, production-card chains, Summer meadow draw and Autumn bonus workers (mentioned in text, not done), tie-break (events then leftover goods), solo mode. All remain in the Help drawer and the lightbulb hints.
