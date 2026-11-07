# Tutorial coverage: Rampart & Vine (coached first game, ADDENDUM 4)

The tutorial is now a COACHED FIRST GAME: a real game against the real AI (Hob) with free legal moves from turn 1 and no forced taps (the brief allows two).
A fixed 30-tile deck (`COACH_DECK` in `game/src/coach.js`) only makes sure a banner town, roads, towns and priories come up. Old Tamsin (guide) and Hob (rival) speak
just in time: one small bubble at a time, taps pass through it, Got it / auto-dismiss, "Leave tutorial" always visible. Each rule is explained the first time it matters
(`window.GXCOACH = {running, explained:[ids], done, later:[ids]}`). At the end the score is walked through rule by rule with the player's real numbers, then a
"Things you will meet later" card lists the rules that did not come up. Text: `game/src/story.js` (`STORY.coach`, `coachEnd`, `coachLater`).
Proof: `game/coach-test.js` plays the coached game to the end with random legal moves through the UI at 390x763 and 1440x860 and asserts the core rules were explained and
every other rule was explained or is on the later card.

| Rule | Coach id | When it is explained (in play) | Fallback |
|---|---|---|---|
| goal, most points wins | goal | your first placement turn (Tamsin) | |
| turn the tile, edges must match | match | first placement turn | |
| town banner: +2 per banner | banner | the first time you hold a banner tile (the deck gives you one early) | later card |
| follower: road, town, priory, field; seven; skip | follower | first time you may place one | |
| follower on a road / town / priory / field (farmer) | claim_road / claim_town / claim_priory / claim_field | when you place that kind of follower, with its scoring | |
| one owner per feature | one_owner | when Hob first claims something (Hob speaks) | |
| finished road 1 per tile, follower goes home | score_road | when your road finishes, with the real numbers | later card |
| finished town 2 per tile + 2 per banner | score_town | when your town finishes | later card |
| priory 9 when ringed (else 1 + neighbours) | score_priory | when it scores | later card |
| majority: most followers wins, others get nothing | majority | when a feature you had a follower in is won by Hob | later card |
| tie: all tied players score in full | tie | when it happens | later card |
| rival scores | rival_score | Hob's first score (Hob speaks) | |
| tile that fits nowhere is set aside | discard | when it happens | later card |
| no followers left | nofig | when you run out | |
| game end: last tile, unfinished features 1 per tile, farmers 3 per finished town | last, then the score walk | last two tiles, then roads, towns, priories, fields, total, each with your real numbers | |
| River, Taverns & Basilicas (inns, basilica, large follower), Merchants & Masons (goods, mason, hog) | (not in play) | "Things you will meet later" card at the end, and the lightbulb | card |

Honest limits: because play is free, ties, majority fights and unplaceable tiles may not come up in a given game; they are then on the later card, not taught by doing.
The expansions are never in the coached game (base rules only). Story prologue: Story launches the same coached game (Chapter 0) and ends with "Start chapter 1".

## Rules check (games-src/rules-check/rampart-and-vine.md)
WRONG 0, MISSING 1 (garden/abbot tiles belong to an expansion we do not have), SIMPLIFIED 4 (stated in the Help card "House rules"). Nothing to fix in the engine.

## History
The earlier 19-step forced-tap prologue (tutor.js, scripted rival) is no longer launched; its code stays in tutor.js unused.
