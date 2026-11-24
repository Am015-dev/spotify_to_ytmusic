# Wickdeep rules diff (published starter edition vs ours)

Source: the publisher's Learn-to-Play guide for the starter edition (fetched read-only; image-only PDF, so text checks were
made against the guide plus the digital adaptation's store page and screenshots) and our `rules-notes.md`. Our names only.
Status: MATCH = same rule; FIXED = was different, fixed this round with a test; SIMPLIFIED = interface shortcut listed in
rules-notes.md; UNVERIFIED = count we could not confirm from the source. Every row is checked by `rules-test.js` (441 checks).

| Rule | Published | Ours | Status |
|---|---|---|---|
| Players / heroes | 1-4 heroes, 4 starting classes | 1-4, 4 classes (Wickwarden, Bellringer, Ratcatcher, Lamplighter) | MATCH |
| Hand sizes | 9 (smallest), 10, 10, 11 | 9 / 10 / 10 / 11 | MATCH |
| HP curves | high / mid / mid / low per class | 10..26, 8..20, 8..20, 6..14 | MATCH |
| Campaign | 25-scenario branching campaign, tutorial scenarios first | 25 scenarios, 4 acts, guided first scenario | MATCH |
| Monster types / bosses / items / goals | printed counts | 16 types + 4 bosses, 30 items, 10 secret goals | UNVERIFIED |
| Scenario level | ceil(average hero level / 2), difficulty +/-1 | same | MATCH |
| Trap damage / coin value / bonus XP | 2+L; 2,2,3,3,4,4,5,6 gold; 4+2L XP | same | MATCH |
| Setup | start room revealed, monsters by party size (normal / elite / none) | same | MATCH |
| Round step 1 | each hero picks 2 cards or declares a long rest | same | MATCH |
| Monster cards | each monster type reveals an ability card (8-card decks, reshuffle cards) | same | MATCH |
| Initiative | lowest first; hero uses its lower card; hero before monster on ties; long rest = 99 | same | MATCH |
| Hero turn | top of one card + bottom of the other, either order; top as Attack 2 / bottom as Move 2 | same | MATCH |
| Played / lost / persistent | played to discard; LOST to lost pile; persistent stays until used up | same | MATCH |
| Attack modifiers | 20 cards: 6x+0, 5x+1, 5x-1, +2, -2, x2, MISS; reshuffle after x2/MISS | same | MATCH |
| Advantage / disadvantage | draw 2 keep better / worse; ranged at adjacent = disadvantage | same | MATCH |
| Shield / retaliate / pierce | per hit / after attack in range / ignores shield | same | MATCH |
| Conditions | poison, wound, immobilize, disarm, stun, muddle, invisible, strengthen, curse, bless | same 10 (our names) | MATCH |
| Elements | infuse at end of turn; strong -> waning -> inert at round end | same | MATCH |
| Monster AI | focus least movement, then proximity, then initiative; move minimum; never open doors | same | MATCH |
| Doors | opening reveals the room; its monsters act this round in initiative order | same | MATCH |
| Terrain | traps once, hazards each entry, difficult terrain 2 moves, obstacles block, jump / flying | same | MATCH |
| Looting | coins under you picked up at end of your turn; gold at scenario end | same | MATCH |
| Short rest | end of round, 2+ discards: lose random, may take 1 damage to reroll once | same (offered when hand <= 3) | SIMPLIFIED |
| Long rest | initiative 99, choose card to lose, heal 2, refresh spent items | same | MATCH |
| Exhaustion | 0 HP, or cannot play 2 cards nor rest | same | MATCH |
| Negate damage | lose 1 hand card or 2 discards to ignore one damage source | same, asked only for knockout hits | SIMPLIFIED |
| **Scenario end (win)** | won at the **end of the round** in which the goal is met | was: won the instant the goal was met. Now: `goalMet` flag, win at round end, toast "Goal met!" | **FIXED** (2 checks: "goal met: play goes on…", "…won at the end of that same round") |
| Scenario loss | all heroes exhausted (or round limit) | same | MATCH |
| After scenario | keep XP and gold win or lose; level at 45/95/150/210/275/345/420/500 | same | MATCH |
| Level up | new card of level <= new level, a perk | same (one card per level) | MATCH |
| Goals -> perks | checkmarks from secret goals earn perks | 3 completed goals = 1 perk | MATCH |
| Items | slots head/body/legs/2 hands/small (level/2 up); spent or lost | same | MATCH |
