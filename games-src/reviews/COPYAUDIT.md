# COPYAUDIT: authored-content audit (2026-11-20)

Scope: every game in games-src except munch (already rewritten), mainhattan*, deep-signal, nightrun.
Test: rules and component structure may match the original; authored content (names, card texts, scenarios, maps,
characters, flavour, card-for-card numbers of an authored pool) must be ours. "The original" = the published game.
Method: per-game read of rules-notes/data files by search subagents plus my own knowledge. Evidence cites our files only.
Story/campaign text (STORY.md, campaign.json) is original in every game audited; the issues are card pools, scenario sets, maps and tables.

## Ranked table (worst first)

| # | Game (dir) | Verdict | Size to rewrite |
|---|---|---|---|
| 1 | Shipwreck Isle (rc) | COPY | ~300 entries |
| 2 | Crown City Smash (kot) | COPY | ~300 entries |
| 3 | Short Fuse (short-fuse) | COPY | ~110 entries (66 missions) |
| 4 | The Thornbound Throne (thornbound) | COPY + name leak | ~190 entries |
| 5 | Final Approach (final-approach) | COPY | 21 scenarios, 11 airports, ~21 strips, 6 abilities |
| 6 | Emberclimb (emberclimb) | COPY | ~110 cards, ~35 enemies, 24 relics/potions, 4 hero kits |
| 7 | Hollowbough (hollowbough) | COPY + name leak | 48 cards (128 copies), 11 locations, 20 events |
| 8 | Iron Meridian (iron-meridian) | COPY (data only) | 36 cities, 100 routes, 30 tickets |
| 9 | Lantern Dive (lantern-dive) | COPY | ~128 entries (96 jobs, 32 dives) |
| 10 | Twin Thrones (twin-thrones) | COPY | ~88 entries |
| 11 | Stitchwise (stitchwise) | COPY (numbers only) | 33 patches (one table) |
| 12 | Cauldron Fair (cauldron-fair) | PARTIAL | 24 fortune cards, ~28 book entries |
| 13 | Wildmark (wildmark) | PARTIAL | 20 scoring cards, 5 triads |
| 14 | Nebula Aces (xw) | PARTIAL | ~35 entries (damage deck, upgrades, pilots) |
| 15 | Sands of Qamar (ft) | PARTIAL | ~55 entries (28 djinns, items, tiles) |
| 16 | Rampart & Vine (carc) | PARTIAL | ~85 tile entries |
| 17 | Vale of Banners (vale-of-banners) | PARTIAL (low) | 8 building effects |
| 18 | Vinegrave (vinegrave) | OWN | optional: shift track/temple numbers |
| 19 | Sunglaze (azul) | OWN | none (optional wall layout) |
| 20 | Kaiten Kitchen (kaiten) | OWN | none (optional ~12 values) |
| 21 | Perch & Plume (perch-and-plume) | OWN | none (optional ~6 thresholds) |
| 22 | Redline Rally (redline-rally) | OWN | none |
| 23 | Tidewake (tidewake) | OWN | none (grep `ref` fields for original names) |

## Per-game detail

### 1. Shipwreck Isle (rc): COPY
- Evidence: rc/cards-ev.js:3-75, 73 event cards each tagged with a `ref:'event-...'` id; same icon, threat action and effect, renamed. rc/cards-adv.js:6-140, ~135 ref-tagged entries (90 adventure cards in 3 sets of 30, 52 mystery cards) 1:1 with the original's ids. rc/data.js:92-97 and scen.js:3-14, 4 scenarios with `ref:'scen-N-...'` ids and the original goals/numbers (scenario 3 is the same rescue scenario with a renamed friend).
- Rewrite: events, adventures, mysteries, scenarios (goals, maps, numbers); beasts/tiles/inventions/discovery lists in rules-notes.md:5-19 follow the base numbers and need our own values. Remove all `ref:` ids. flavor.js and campaign prose are original.
- Size: ~300.

### 2. Crown City Smash (kot): COPY
- Evidence: kot/data.js:4-83, ~206 power cards (plus `m_` expansion ids), each with the original's cost and effect (e.g. the cost-6 "extra claw every turn" card, the "ignore exactly 1 damage" card, the cost-7 "extra die" card). kot/data.js:157-244, ~72 evolutions (8 per monster x 9 monsters), each mapped to an original monster (AUDIT-PRODUCT.md:37, publicly deployed). CURSES :131, WTILES :118, COSTUMES :104. rules-notes.md:3 states the online implementation is "the reference for every card's cost, type and exact behaviour".
- Rewrite: our own card list with new effects/costs, new monster kits and evolutions, and remove the monster mapping from AUDIT-PRODUCT.md. Keep dice/claw/heart mechanics.
- Size: ~300+.

### 3. Short Fuse (short-fuse): COPY
- Evidence: short-fuse/missions.json, 66 missions mapping 1:1 and in order onto the original campaign, each with `sources: ["CARD mNN front/back"]` and a paraphrase of the printed card; set boundaries (9-19, 20-30, 31-42, 43-54, 55-66) and audio-driven mission slots (19, 30, 42, 54, 66) match. equipment.json (12 numbered cards, per-card effects), constraint cards A-L (rules-notes.md:254-275), 10 challenge cards (rules-notes.md:277+), characters.json (5 + late additions). Some mission titles in game/src/data.js (from line ~189) are pop-culture references to check.
- Rewrite: all 66 missions (set-ups, ordering, escalation, titles), 18 equipment effects, 12 constraints, 10 challenges, extra characters; delete the card-scan research notes and transcript references.
- Size: ~110.

### 4. The Thornbound Throne (thornbound): COPY + leak
- Evidence: thornbound/cards.json and sources.md:6-11, cards "read from the publisher's card images", each marked "confirmed (card image)". Same strength, cost, votes, traits, commands and effect per card, reworded; same data in game/src/data.js. Examples: the single-use "all rivals' bid strength becomes 0" tactic; the strength-11 champion that steals a location card; the "move a rival's occupied location to your board" tactic. Also copied: 6 location rewards, 3 regions x 2 locations, 3 councils, 4 favour actions, per-card AI tuning at game/src/ai.js:26.
- LEAK: cards.json has `"original_faction"` fields (~4 places, e.g. lines ~40, 261, 493) recording the original's faction names. Violates the hard rule on its own; purge now.
- Rewrite: 51 location cards, 76 faction cards (4 decks x 19), 16 tactics, 4 favour actions, 6 locations, 3 councils, 24 solo threat cards, 11 solo faction cards. Redo stats and effects, not only wording.
- Size: ~190.

### 5. Final Approach (final-approach): COPY
- Evidence: game/src/data.js:64-76 (11 airports), :77-100 (21 scenarios), :110-116 (6 ability cards), strip data (trk ids). rules-notes.md:91-104: "all 21 scenarios of the box over 11 airports", four difficulty bands (6/7/5/3), space-by-space strip data transcribed from a published digital implementation (plane layouts, traffic icons, corridor tabs). Scenario titles/blurbs paraphrase the original (e.g. a "only eight pilots" scenario, a "hours in the logbook" scenario, a storm-alley scenario, a silent-tower scenario). The six ability cards match the original's six, reworded.
- Rewrite: 21 scenarios and titles/texts, 11 airport blurbs, ~21 strips, module table, 6 abilities. Keep generic dice/strip rules.
- Size: 21 / 11 / ~21 / 6.

### 6. Emberclimb (emberclimb): COPY
- Evidence: emberclimb/src/data.js:20-23 (4 heroes mapping 1:1 to the original's four classes including class mechanics and starting relics), :28-110 (~110 cards), :148-175 (~35 enemies), :193-222 (15 relics, 9 potions). Cards match effect-for-effect (an X-cost all-enemies attack, a block-damage attack, a damage-plus-heal attack, a doubling power, a big ritual power); enemies match move patterns (a boss that splits into smaller ones, a six-hit-pattern ghost boss, a sleeping elite, a mode-shifting guardian boss, an act-by-act elite/boss ladder); relic/potion lists are the original's, renamed. CAMPAIGN-DESIGN.md:1-40 follows the original act/boss structure.
- Rewrite: our own hero kits, card pool, enemy roster and patterns, relics and potions, events.
- Size: ~110 cards, 4 heroes, ~35 enemies, 24 relics/potions.

### 7. Hollowbough (hollowbough): COPY + leak
- Evidence: hollowbough/cards.json (87 `role` fields), sources.md:1-30, rules-notes.md section 0. Each of 48 base cards is a role-for-role mapping with new name: cost, points, copies (sum 128), colour/type, unique flag and linked pairs checked against two databases with "zero mismatches". Same for 11 forest locations, 4 basic events, 16 special events (original required-card pairs kept), 4 basic locations.
- LEAK: `role`, `linked`, `requires_cards` keys (87 entries) and game/gen-data.py:8,10,16,18,21 use the original's real card/event names as card keys; game/net.js references `role` too. Rename to neutral ids.
- Rewrite: full 48-card pool (costs, points, copies, effects, pairs), 11 locations, 20 events.
- Size: 48 types / 128 cards, 11 + 20.

### 8. Iron Meridian (iron-meridian): COPY (data only, no built game)
- Evidence: iron-meridian/map-usa.json:228-1030 (100 routes with endpoints, length, colour, double pairs), :1030+ (30 tickets with city pairs/points, `ref`-tagged), `_meta` note; 36 real cities in real positions identify the original board. rules-notes.md:12-21,30-35 and sources.md: taken from an open-source CSV, verified against original counts (colour split, length histogram, ticket values summing to 349, the one long cross-country ticket).
- Rewrite: a fictional map (own cities, layout, lengths, colours, double-route pattern) and own tickets. Purge `ref` strings and the colour `ref` mapping. Card counts and scoring table may stay.
- Size: 36 cities, 100 routes, 30 tickets.

### 9. Lantern Dive (lantern-dive): COPY
- Evidence: rules-notes.md:85-92: "96 difficulty triples and the wording of each job taken from two public community tables"; the 32 dives' difficulty values and rule sentences from the logbook text; a private `tasks-ref.json` maps each job to source wording. game/src/data.js:21-122: 96 job cards with the original's 3/4/5-player difficulty triples and condensed text (e.g. "win a 5 using your 7", "no lanterns in the trick"). data.js:125-170: 32 dives in original order with its difficulty values, special rules (murky, narcosis, take-all, real-time clocks 3:30/3:00/2:30/5:00, a fixed four-job dive 32, deep dive at 18) and briefs that follow the logbook beats.
- Rewrite: 96 jobs (new conditions and triples), 32 dives (order, values, twists, briefs). Delete the "taken from public tables" claim and tasks-ref.json workflow. 40-card structure may stay.
- Size: ~128.

### 10. Twin Thrones (twin-thrones): COPY
- Evidence: twin-thrones/src/data.js: 66 cards, 12 wonders, 10 progress tokens. RULES-CHECKLIST.md:157-178 and rules-notes.md:55: "re-checked against the original card list", costs changed to match; per-card cost, VP, 17 chain links and science symbols fixed to the original. Examples: a 9-VP wonder at 3 stone + 1 papyrus; a 1-VP scale-symbol card costing 1 papyrus; tokens worth 6 coins + 4 VP / wonders cost 2 less / 7 VP.
- Rewrite: all 66 cards (Age 1/2/3 incl. 7 guilds), 12 wonders, 10 tokens with new costs, chains, effects. Pyramids and military track values are structure and may stay.
- Size: ~88.

### 11. Stitchwise (stitchwise): COPY (numeric pool only; names/story own)
- Evidence: stitchwise/src/data.js:4-21 `PATCH_DEF`, 33 patches whose shape, cost, time and income match the original patch for patch; rules-notes.md:10-15 says numbers were retyped from two implementations, cross-check.py found 31/33 identical. Track constants (income spots 5,11,...,53; leather spots 20,26,32,44,50) also the original's. Examples: the 5-long strip at 7/1/1, the plus at 5/5/2, the 4x2 block at 6/5/2.
- Rewrite: redesign all 33 as our own shapes/costs/times/incomes; keep counts and the 9x9 board; change track constants.
- Size: 33.

### 12. Cauldron Fair (cauldron-fair): PARTIAL
- Evidence: src/data.js:32-65 (BOOKS), :72-95 (FORTUNE). rules-notes.md:154-170,178: 24 fortune cards and all four ingredient sets with costs transcribed from the original and a fan dataset ("names differ; effects match"). Examples: the "stop at exactly 7 whites" card, the "if you explode, left neighbour takes a 2-chip" card, price triples like [4,8,14] and [5,10,19], purple reward by count 1/2/3+.
- Rewrite: 24 fortune effects, effect+price tables of 7 ingredient colours, track values. Bag push-your-luck structure may stay.
- Size: 24 + ~28 + ~54 track cells.

### 13. Wildmark (wildmark): PARTIAL
- Evidence: rules-notes.md:13-24, 27-36: the 20-card scoring pool (5 animals x 4 sets) uses the original's patterns and point tables, B-D tables "checked against online guides and corrected to match exactly". Examples: pair scores 4/11/19/27, line scores 2/5/9/13, run scores 2/5/8/12/16/20/25, lone-perch 2/5/8/11/14/18/22/26. src/data.js:12-16 (A cards), src/cards.js:7-11 (B-D, renamed titles, same text/numbers), data.js:31-37 (5 starter triads). 85-tile set is ours per rules-notes.md:37-39.
- Rewrite: all 20 scoring cards (own patterns and numbers), recheck 5 triads, then rebalance; logic tests R113/R115 pin the copied numbers.
- Size: 20 cards, 5 triads.

### 14. Nebula Aces (xw): PARTIAL
- Evidence: xw/data.js:30-43, 12-entry damage deck (33 cards) reworded 1:1 (hull rupture = direct hit x7, flash blindness = blinded pilot, cockpit fire = damaged cockpit); :22-26 ~5 upgrades (a 4-point torpedo with attack 4, range 2-3, focus-to-crit); :10-20 ~10 pilots/ships with the original's skill, cost, stats and dials (rules-notes.md:3-6, "open-source data set"). Names are ours.
- Rewrite: damage-deck effects/counts, upgrade effects/costs, pilot abilities, ship stats and dials.
- Size: ~35.

### 15. Sands of Qamar (ft): PARTIAL
- Evidence: ft/src/djinns.js:4-35, 28 djinns whose effect, VP and cost class equal the original card's (e.g. an "advisors score 3 instead of 1" card, a "sages score 4 instead of 2" card, a palace coin trigger); some flagged `assumed:'printed VP'`. rules-notes.md:3: "djinns keep the real cards' effects under new names". Data.js:9-33: 30-tile set, goods counts, set-score table, bid track, item/tile lists (item split "an assumption").
- Rewrite: re-roll 28 djinn effects/VP, check the tile/item pool.
- Size: ~55.

### 16. Rampart & Vine (carc): PARTIAL (structure copy, names own)
- Evidence: carc/game/src/data.js:2 `TT` generated from a "research tile file": 85 entries (33 base, 11 river, 17 + 24 expansion) with ids like `BA_L` and the exact per-tile geometry and box counts (RULES-CHECKLIST.md:19-20). Names are descriptive and ours.
- Rewrite: modest; our own tile mix/counts, drop original ids. Geometry is mostly functional, lower risk.
- Size: ~85.

### 17. Vale of Banners (vale-of-banners): PARTIAL (low)
- Evidence: src/data.js:21-30 `V.BLD`, 8 building effects one-for-one with the original's (rules-notes.md:9-11); 164-tile mix and bonus ladders also follow the original but are counts/numbers. Lore tiles (`V.KNOW`), estate layout and animals are ours.
- Rewrite: the 8 building effects; optionally lore count and 7-per-kind split.
- Size: ~8.

### 18-23. OWN
- Vinegrave: 35 items, 35 artifacts, 15 guardians, 16 idols, cast and sites all ours (src/data.js:16-160); only scoring/temple numbers (data.js:161-178) track the original, which is structure. Optional nudge.
- Sunglaze: no authored pool; rules-level numbers and the wall pattern only. No rewrite.
- Kaiten Kitchen: 108-card pool counts/scores equal the original (rules-notes.md:14-25), small rules-level pool. Optional hardening ~12 values.
- Perch & Plume: 120 birds generated procedurally from ~40 bases (gen-data.py); 18 bonus cards and 12 goals follow generic categories. Optional ~6 thresholds.
- Redline Rally: own tracks, 6 upgrades, weather; starting deck is base structure. No rewrite.
- Tidewake: tiles are combinatorial, leviathan layouts ours. Do a grep of `ref` fields in tiles.json/sources.md for original names (rules-notes.md:3).

## Hard-rule leaks to fix first (independent of verdicts)
1. thornbound/cards.json `original_faction` fields.
2. hollowbough/cards.json `role`/`linked`/`requires_cards` keys and game/gen-data.py, game/net.js use real original names as ids.
3. kot/AUDIT-PRODUCT.md:37 monster-to-original map; rc `ref:` ids; iron-meridian `ref` strings and real-city map; lantern-dive tasks-ref.json; short-fuse card-scan sources.
4. Rules-notes files in several games state "matches the original / transcribed from X" (cauldron-fair, wildmark, stitchwise, hollowbough, lantern-dive); reword when the pools are rewritten.

## Suggested rewrite order
Leaks first (cheap, mechanical, Haiku), then rc, kot, short-fuse, thornbound (largest and most 1:1), then final-approach, emberclimb, hollowbough, iron-meridian, lantern-dive, twin-thrones, then the small tables (stitchwise, cauldron-fair, wildmark, xw, ft, carc, vale). New content is open design: Opus for card pools, Sonnet for data-table swaps.
