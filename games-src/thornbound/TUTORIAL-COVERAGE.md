# Tutorial coverage: the staged tutorial (spotlight steps, `tutSteps` in game/src/ui12.js, shell/gx-tutor.js). Seed 23, you lead the Heathbound Clans against the Gilded Court, TWO rounds (engine length 'tutorial'): all of round 1, then round 2's bid and steal. Only the glowing thing answers.
# Proven by game/tutor-test.js (touch taps at 390x763 and 375x553, every step id below must appear). Staged deal: the Dockside Broker (2 Lore) replaces the Hearth Priestesses in the opening hand; the Court is scripted in tutAI.
# The tutorial runs the computer at x6 (UI.speed, restored on leave); watch steps between fights move on by themselves (tutAuto) so no wait is over 3 s. Measured 12 Nov 2026: ~59 s by touch, longest wait 2.9 s.
Step ids: goal, map, tactic, attrition, bid1, bid2, reveal, takeback, favour, herald, cmds, place1, place1b, place2, place3, supp, spring, order, clash, clash2, claim, score, tiea, tie, tieb, tiec, autumn1, govern, council, autumn3, journey, lore, lore2, round, bid3, bid4, kc, end.
New (12 Nov 2026), each checked against the published rulebook:
- takeback: round 1, you resolve first and take your bid card back to your hand (one of the three bid options).
- tiea/tie/tieb/tiec: the Sinks tie 7-7; each tied side may add one face-down card or pass; you add your 5, the Court adds its Heir, a new Clash of only the new cards, the Court wins.
- lore/lore2: Journey the Dockside Broker for 2 Lore, then spend it at once on the Verse-Keeper (cost 2), which joins your hand.
- bid3/bid4/kc: round 2, you bid the Verse-Keeper (11) and steal the Court's Paper Diadems: your bid beats the card occupying it (its occupier returns to the Court's hand).

(Older table, step ids are now coach ids:)
Steps are ids in `game/src/ui12.js` (`tutSteps`); story text in `game/src/story.js` (`tut`, `chapters`). Ticked = taught by doing or seeing it once.

| Rule | Step | Story beat |
|---|---|---|
| [x] Goal: most Influence after the last round | goal, end | Ysolde: "Influence is how the kingdom counts loyalty." / climax at the end |
| [x] Map: 3 regions, 6 locations, rewards | map | "Hold them and you hold the Throne." |
| [x] Secret bid, highest first | bid1, bid2, reveal | "Lay it face down. She must not see." / "Hidden well." |
| [x] Kingdom Card (take, bid card goes under it) | kc | "A fine favour." |
| [x] Herald placement | herald | "The crowd cheers your name." |
| [x] Hide one card per region | place1, place1b, place2, place3 | "Three cards down." |
| [x] Heir / strongest card where both Heralds stand | place2 | |
| [x] Supporters +1 each | supp, spring | "That is +2." |
| [x] Clash order | order | "The horns sound." |
| [x] Clash: flip, total, winner | clash | |
| [x] Claim a location, Herald bonus and steal | claim, score | "One region at a time." |
| [x] Round end: Supporters home, cards discarded | round | |
| [x] End trigger and tie-break (told at the end) | end | |
| [ ] Day/Night commands (Ambush, Retreat, Flank, Deadly) | not covered (lightbulb tips explain them in round 2) | |
| [x] Autumn: Govern, Journey, Lore, Site of Power | autumn1, govern, council, autumn3, journey, lore, lore2 | |
| [ ] Councils, Favour, Tactics | not covered (Story chapters 5-6 introduce them) | |
| [x] Tied Clash re-clash | tiea, tie, tieb, tiec | |
| [x] Bid options: take back, steal | takeback, kc | |
| [x] Journey, then buy with Lore | journey, lore, lore2 | |
| [ ] Attrition (empty deck), empty market | told only (attrition step) | |
Chapters are not leave-and-resume: Skip tutorial works at any step and restarts from the title. Honest gap: only round 1 and round 2's bid are guided.
