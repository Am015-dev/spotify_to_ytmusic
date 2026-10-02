# The Old King's Crown - rules notes (for "The Thornbound Throne")

Own-words paraphrase of the published base-game rules (rulebook "Copyright Eerie Idol Games 2025", design Pablo Clark; Simulacrum solo design Pablo Clark and Richard Wilkins). Numbers are exact unless marked. Original card names/text are deliberately NOT reproduced; see `cards.json` (new names, new wording, same mechanics).

## 0. Read this first: unknowns, conflicts, corrections

**Correction to the brief.** The published game does NOT end when a player reaches an influence total and holds it. It is a fixed-length game (5 Rounds standard, 4 short, 6 extended). Whoever has the most Influence tokens in their Supply after the final Round wins (tiebreakers: holding the Favour disc, then higher Order Track position). A review page (inspiredglobal.be) claims "reach 15 Influence (20 at two players)"; no other source or the rulebook says this, so I treat it as an early-prototype remnant or an error. Do not build it. (Optional house-rule, if you want it: ASSUMPTION - not part of the real game.)

**Also not in the rulebook:** there are no per-player-count rule differences and no map adjacency/movement graph (see sections 3 and 12).

Remaining unknowns (full detail and where to find each in GAPS.md):
1. Solo mode (Simulacrum) rules: setup, Ambition / Scheme / Fog / Tier decks, bid tokens, Sim reward tables, Forge cards, Heat scale. Only fragments from reviews + 24 Threat cards + 11 Sim faction cards are captured. NOT enough to build faithfully.
2. Printed starting Hand Size value on the Player Boards (assumed 6, see 4).
3. Exact per-faction Hand Size marker range detail beyond global min 3 / max 8 (global limits are confirmed).
4. Rulebook "Teaching guide" / "Reference sheets" / FAQ errata (not retrieved).
5. Tier values (Gold/Silver/Bronze) and copy counts of Simulacrum faction cards.
6. A few glyph-to-name mappings (trait icons) are inferred, marked ASSUMPTION in cards.json.
7. Whether the 2p/3p faction restriction ("2p: Nobility+Clans, 3p: without Gathering") reported by one search snippet exists in the real rules - unconfirmed, likely a recommendation only.

## 1. Components (base game)

Per game: 1 Kingdom Board (Order Track, Great Road, Map of 3 Regions x 2 Locations, 6-slot Round Track, Season/phase tracker, slot for Clash markers, Lost Pile and Kingdom Discard spaces); 1 Councils Tile (3 Councils); 1 Active Player Marker; 3 Clash Markers (I, II, III - flip side marks "resolved"); 1 Season Marker; 1 Round Marker; 1 Favour disc (3 uses, rotates III-II-I); Influence tokens: 32 one-value + 16 five-value; Lore tokens: 20 (one-value only); 51 Kingdom Cards (all unique, 17 per suit); 16 Tactic Tiles (4 per faction, two-sided: Unexhausted / Exhausted); 40 Faction Markers (10 per faction, not a hard limit - use proxies if you run out); 2 Rules Reference Sheets + rulebook.
Per player (4 included): Player Board (faction-specific, 2 Kingdom-Card-occupation slots, Herald slot, 5 Supporter slots, Hand Size marker slot, Favour slot, 4 Tactic slots); Faction Deck of 19 cards; 1 Herald; 5 Supporters; 1 Order Marker; 1 Hand Size Marker; 1 Site of Power tile (holds 5 cards at start).
Influence/Lore token supply is an unlimited "Reserve" in rules terms (use proxies if the pile is empty). A player can never have less than 0 Influence.

## 2. The 4 factions - what is symmetric, what is not

All four start with the SAME 14 Basic cards (functionally identical, art/names differ) - see section 5. Asymmetry comes only from:
- 5 Site-of-Power cards each (3-4 Advanced Faction Cards with a Lore cost + 1-2 HQ cards, all bought with Lore) - see cards.json `factions.*.site_of_power`.
- 4 Tactic Tiles each.
- 1 Favour (Kingdom's Favour) Action each (only usable while you hold the disc).
Playstyle blurbs: Nobility = defence, sustain, control, Council/passive income; Clans = mobility, momentum, overwhelming force (Flank, Supporters); Uprising = scheming, feints, Elimination (Deadly, swaps, peeking); Gathering = card manipulation, subversion, creeping accrual (Burn / Lost Pile recursion, Markers in Councils, inverted clash rules).
Faction colours: Nobility blue, Clans teal/green, Uprising red, Gathering purple. Every faction deck = 14 basic + 5 Site-of-Power = 19.

## 3. Setup (steps A-P, in rulebook order)

A. Board in reach, Councils Tile above it. E. Season Marker in the Spring slot. B. Shuffle the 51 Kingdom Cards face-down on the leftmost Great Road space (this is the Kingdom Deck); deal face-up onto the rightmost free Great Road spaces until the 3 other spaces are filled, then flip the top card of the Kingdom Deck so there are 4 face-up Kingdom Cards available. C. Reserve of all Influence and Lore tokens beside the board. D. Favour disc on the Harvest Field Location. F. Round Marker on slot 1. Players choose game length first (5 standard; 4 short; 6 extended). G. Stack the 3 Clash markers (III bottom, I top) in their slot. H. Players choose or randomly assign factions; take Player Board. I. Place your Herald and 5 Supporters on the board. J. Hand Size marker set to the starting value (see ASSUMPTION below). K. Place 4 Tactic Tiles Unexhausted face-up in any order; follow any printed SETUP text (some tiles start with 2 or 3 Faction Markers on them). L. Faction Markers in a pile. M. Site of Power: put your 5 Site cards face-up on your Site of Power tile (they show a Lore cost; HQ cards also have an HQ icon). N. Take out the Heir card (marked with a start-in-hand icon), shuffle the other 13 and place face-down as your Deck, then draw until you have SIX cards in Hand total (Heir + 5). So deck = 8 cards after setup. O. Order Track: oldest player first, descending age ("Absolute Primogeniture") or random. P. First on the Order Track gets the Active Player Marker.
Advanced setup (optional, any length): after A deal each player 5 face-down Kingdom Cards; at N each player may mulligan once (return all non-Heir cards from Hand to top of Deck, reshuffle, redraw to Hand Size); then each chooses 1 of their 5 Kingdom Cards and places it face-down on their board with a card from Hand face-down on top as its occupier; the other 4 are shuffled back (keeping the top face-up card aside while shuffling); all revealed after turn order at O; bold on-acquire text resolves in turn order; draw up to Hand Size.
ASSUMPTION (Hand Size start = 6): the rulebook says hand size is "the number with the start-icon" on the Player Board and also tells you to draw to six at setup; the marker value itself is not given in text. 6 matches the setup draw, round 1 skips the draw step, and the Attrition range 8 down to 3 is consistent with 6 in the middle.
**Per player count**: the rulebook gives one setup for all counts and has no 2/3-player board changes, no removed Locations or Regions, no neutral dummy factions. Each player simply uses their own faction. ASSUMPTION: Great Road size (4), Region count (3), Clash markers (3), and token counts do not change with player count. Number of Heralds on the Map = number of players. Supply of Faction Cards is per player so nothing else scales. Reviewers say 3 players is the sweet spot (Herald/steal swings stay readable) and 4 is chaotic.

## 4. Core concepts

- Strength: printed value on a Faction Card (top-left). Total Strength in a Clash = Strength of your Active cards in that Region that have not been in an earlier Clash in that Region this Round + 1 per Supporter you have in that Region that has not been in an earlier Clash there this Round + other ability bonuses. A player with no Active cards still competes with Supporters/other bonuses (cards count 0).
- Actions (circle icon): optional, resolved in turn order, once per Round per player each. Effects (hex icon): mandatory, simultaneous, automatic. Commands (bold word on a card): Ambush, Retreat, Flank (Day Action Step, once per card per Clash, repeatable across Clashes in a Round); Rally, Deploy (Autumn Action Step in the real text, "once per listed Step"); Deadly (Night Effects Step, mandatory). A card may print any number of Commands; a card that gains a Command it already prints does not stack. Commands on a card only work when the card is Active (Ambush/Retreat/Flank/Deadly) in the current Clash. "Activate" = optional/in turn order; "Trigger" = mandatory/simultaneous. Resolve conflicting simultaneous abilities in turn order.
- Season icons: sprout = Spring Action Step, sun = Day Action Step (Summer, per Clash), moon = Night Effects Step (Summer, per Clash), leaf = Autumn Action Step, snowflake = Winter Effects Step.
- Traits (on Faction Cards): Invulnerable (immune to Elimination), Resilient (if Eliminated goes to Discard, not Lost Pile), Pathfinder (if used to Journey goes to Discard, not Lost Pile). ASSUMPTION on icons: shield = Invulnerable, helmet = Resilient, map = Pathfinder. Reason: rulebook examples say the Nobility Heir is Resilient and Heirs print a helmet (+map); a Nobility Tactic grants Heirs "shield" and Threat card text "treat printed shield and helmet as blank" (= the two protective traits); "all your cards gain map" appears on a Journey-themed Kingdom Card.
- Archetypes (no inherent rules; abilities reference them): agent, captain, cavalry, champion, follower, heir, ruse, trader, war machine.
- Votes (gavel icon, bottom-left of card) are used for Councils. Lore (scroll icon bottom-right) is used for Journey. Both on the same card if printed.
- Hand Size: cards in Hand may never exceed it; extra cards that would enter Hand go on top of Deck; if Hand Size drops below hand count, discard down. Hand Size never above 8, never below 3.
- Attrition: if you must draw (even by choice) and the Deck is empty: shuffle your Discard Pile into a new face-down Deck, reduce Hand Size by 1 (rotate marker), then draw up to the new Hand Size. Does NOT shuffle in the Lost Pile or anything else. Attrition is the game's soft clock - a 5-round game with 14 basic cards triggers it around Round 3.
- Public/private/hidden: Hand, face-down bids, face-down cards next to Regions are private (you may discuss, not show). Deck and Kingdom Deck are hidden. Everything else is public. Discard, Lost Pile, Councils, Supply, Order Track are public.
- Burn: remove from game, public, no further effect. Eliminated cards go to the communal Lost Pile (face-up, public) unless Resilient/Invulnerable. Lost Pile cards are NOT reshuffled on Attrition; recovery is only via abilities.
- Active card: any face-up Faction Card next to a Region. NOT active: face-down, in Hand, Deck, Site, Supply, Discard, Lost Pile, occupying a Kingdom Card, in a Council, Burned.
- "Ruling rule": card text overrides the rulebook.
- Gain/steal: gain = move from Reserve; steal = from an opponent's Supply (can't steal from Reserve).

## 5. The Basic deck (identical per faction; 14 cards; 1 copy each)

Strength / archetype / traits / commands / votes / lore (icon counts; ASSUMPTION high-confidence readings of icon art):
0 ruse, Invulnerable, Ambush OR Retreat (Day), v0 l0 | 0 trader, Rally(any two) (Autumn), v2 l2 | 1 follower Inv v0 l1 | 2 follower Inv v0 l1 | 3 follower Inv v0 l1 | 4 follower Inv v0 l1 | 5 agent, Deadly (Night) with a drawback (eliminates itself if any opponent Follower is Active in the Clash), v2 l1 | 5 cavalry, Pathfinder, Flank (Day), v1 l1 | 5 war machine, Invulnerable, Deploy(1) (Autumn), v0 l0 | 6 captain Pathfinder v1 l1 | 7 captain Pathfinder v1 l1 | 8 captain Pathfinder v1 l1 | 9 captain Pathfinder v1 l1 | 10 HEIR, Pathfinder + Resilient, Rally(self) (Autumn), v1 l1, starts in Hand.
Strength sum 65. Note deck-building tension: high Strength cards are also your Journey/Govern fodder.

## 6. Round structure (one Round = one year; 5 Phases)

Phase 1 - START OF THE YEAR (skipped in Round 1): (1) all players simultaneously draw up to Hand Size (Attrition applies). (2) Order Track: sort by Influence in Supply, most first; ties: reverse the previous relative order of the tied players. First gets the Active Player Marker. (Some Kingdom Cards let a player choose the order.)

Phase 2 - SPRING:
1. PLACE BIDS (simultaneous): each player picks one Faction Card from Hand, face-down.
2. RESOLVE BIDS: reveal all. Bidding Strength = printed Strength of that card (+ bid-affecting ability bonuses; all other card text/traits ignored). Resolve highest first; ties: higher on the Order Track first. When it is your turn choose one: (I) take a face-up Kingdom Card from the Great Road, (II) steal an opponent's Occupied Kingdom Card - only if your Bidding Strength (with modifiers) is STRICTLY higher than the Strength (with modifiers) of the Faction Card occupying it; the victim's occupier returns to their Hand, or (III) take your Bidding card back to Hand. A Kingdom Card you acquire must immediately be Occupied: put it on either of your two board spaces (an empty one or an already-filled one - in which case the old Kingdom Card is discarded and its occupier goes to Hand) and slide the Bidding card under it. Bold text on a Kingdom Card is resolved on acquire and may discard or otherwise use your Bidding card (some cards go to your Supply, to a Region, or to a Location instead of staying on the board). You may hold at most 2 Kingdom Cards on your board (3 only with an HQ that adds a space).
   After all bids: if 1+ Kingdom Cards were taken from the Great Road, discard the rightmost remaining one, slide the rest right, then refill from the Kingdom Deck on the right, and finally flip the top of the deck so 4 are face-up. If NONE were taken, discard the two rightmost instead. Taking a Kingdom Card by ability outside the Bid step refills with no discard. If the Kingdom Deck runs out, shuffle the Kingdom Discard to make a new one.
3. PLACE HERALDS AND CARDS: (A) in turn order each player puts their Herald on any Location (any number of Heralds per Location, fully public, bluff-able). (B) simultaneously each player places exactly one face-down Faction Card next to EACH of the 3 Regions (3 cards total). A player with fewer than 3 cards in Hand places theirs before others (in turn order among such players) and so places fewer. The side of the Region you use is cosmetic. You may peek your own face-down cards.
4. SPRING ACTION STEP (turn order): each player may activate any number of available sprout-icon Actions/Commands, incl. the universal action "place Supporters": move any number of Supporters from your board onto any Regions (not Locations; no limit).

Phase 3 - SUMMER: the LAST player on the Order Track places Clash markers I, II, III on the three Regions = resolution order. Then for each Region in order I, II, III:
 A. Reveal: all face-down cards next to that Region are flipped (now Active).
 B. DAY ACTION STEP (turn order): each player may activate Actions/Commands printed on or gained by cards Active in this Clash (and Tactics/Kingdom Cards that say sun-icon). Ambush: add a face-down card from your Hand to this Clash. Retreat: send any of your Active cards in this Region to Hand and/or your Herald and/or any Supporters in this Region back to board. Flank: move this card to a different unresolved Region (becomes Active there; if none left, can't). After everyone has acted, any cards added face-down (Ambush etc.) are revealed simultaneously and their own printed Actions/Commands (only those) may be activated in turn order.
 C. NIGHT EFFECTS STEP (simultaneous): mandatory moon-icon effects. Deadly: eliminate ALL opponents' Active cards in the Clash (mandatory; if several Deadly cards face each other they all eliminate each other); Eliminated -> Lost Pile (Resilient -> Discard; Invulnerable -> not Eliminated). Effects of Eliminated cards still resolve simultaneously.
 D. Tally Strength; highest wins. TIE for highest: tied players in turn order each either play a face-down Hand card to the Region or pass; if at least one plays, a NEW Clash among the tied players starts (steps A-D repeated; previous cards/Supporters/activations don't count - only new cards); players who passed still take part. If all tied players pass or cannot play, the Region ends as a tie: no rewards, no more Clashes there this Round.
 E. Winner claims rewards, in order: (I) choose one of the Region's 2 Locations; (II) Location Reward: gain the printed Influence, then optionally resolve the printed text (Influence is mandatory, text optional); (III) Herald Reward (separate from Location Reward): if YOUR Herald is on the CHOSEN Location gain 1 Influence from Reserve, then steal 1 Influence from each opponent whose Herald is on that Location (steal only what they have; Council of Relics adds more, see below). Then the Region is resolved (flip its marker).
 So a 'perfect' Herald call is a swing: +1 for you, -1 per rival on the same Location.

Phase 4 - AUTUMN (one Action Step, turn order). In any order: Govern once (move one of your Hand cards that shows >=1 Vote into a Council of your choice; any number of cards per Council; no limit; keep Vote icons visible); Journey once (move one Hand card that shows >=1 Lore to the Lost Pile - or Discard if Pathfinder - and gain Lore tokens = its Lore icons; then you may immediately spend Lore to buy any number of Site-of-Power cards whose total cost you can pay; unspent Lore is kept but can only be spent the next time you gain Lore); any number of Autumn Actions/Commands incl. Rally (return Active cards to Hand), Deploy (place a card from Hand face-up next to a Region of your choice - it is Active - and put on it Influence tokens from the Reserve equal to X; the tokens are removed one per Winter cleanup so the card stays Active until they are gone), activating Councils (Secrets / Oaths actions).
 Buying: Advanced Faction Card -> to your Hand (if Hand is full, put on top of Deck); HQ Card -> to your Supply (face-up, persistent, can be removed only by effects). Journey/Govern rewards also appear on Locations Castle (Govern), Wilderness (Journey), usable at other times with Active or Hand cards.
 Site-of-Power payoff: if your Site of Power is EMPTY at game end, before scoring you gain 1 Influence per 2 Lore remaining in Supply.

Phase 5 - WINTER: (1) Winter Effects Step (simultaneous, snowflake effects). (2) Cleanup (simultaneous): Heralds on the Map go back to boards; Supporters on the Map go to the Lost Pile (communal; recovered only by Oaths Council / abilities); remove Clash markers; every Active card with no Influence token on it goes to its owner's Discard Pile; each Active card WITH Influence loses 1 Influence token (returned to Reserve) and stays Active. (3) Advance Round Marker; if it was on the last slot the game ends.

## 7. Councils (Govern with Votes)

Three Councils. Each has a different benefit for anyone with >=1 Vote; more votes = stronger. Cards in Councils are public, owner-tagged, never Active. When a card leaves a Council it goes to its owner's Discard unless stated.
- Relics (suit icon coin; "O"): when you claim your Herald Reward you may remove any of your cards/markers here; gain Influence = total Votes removed (extra to normal Herald gain). Removed cards -> Discard; markers -> your Supply. A 2-vote card must be removed whole.
- Secrets (book; "M"): Autumn Action: place Faction Markers = your Votes here on Locations, any distribution. Any Location with 4+ of your markers: remove all of your markers there and claim that Location Reward IGNORING its Influence number (text only, no Herald reward). Markers persist between Rounds and are unaffected if your Council cards leave. Markers on cards/Regions do not count as Votes.
- Oaths (swords; "F"): Autumn Action: move Supporters from Map and/or Lost Pile to your board = your Votes here, +1 extra if you have strictly the most Votes here (needs >=1 vote).
Castle Location Reward lets a Govern use an Active card too, but discards every OTHER card in that Council (even yours). Some Kingdom Cards/HQ give extra Votes (Faction Markers, Votes bonuses).

## 8. Locations (confirmed, base game) and map

Map = 3 Regions (rows) x 2 Locations; NO adjacency; Heralds/cards/Supporters may be placed anywhere. Regions: Highlands (Castle, Wilderness), Plateau (Harvest Field, Battlefield), Lowlands (Shrine, Necropolis). Each winning Clash grants ONE Location choice.
- Castle: +1 Influence, and Govern with one Active/Hand card (discard all other cards at that Council).
- Wilderness: +1 Influence, and Journey with one Active/Hand card.
- Harvest Field: +1 Influence, and claim the Favour disc (steal from holder allowed, or reset your own to 3 uses).
- Battlefield: +2 Influence, nothing else (best raw points).
- Shrine: +1 Influence, and move up to three Active/Hand cards to the bottom of your Deck, any order (deck cycling / Attrition control).
- Necropolis: +1 Influence, and shuffle your Discard Pile and draw up to three cards from it; may then discard any number of Hand cards (recursion).
Per Round max printed Influence from Locations = 3 Clashes * (1..2) = 3-6, plus Herald +1 and steals. ASSUMPTION: a 5-round game therefore ends with roughly 15-30 Influence per player (not stated anywhere). The sample 2p rulebook example shows scores like 3/2/1/0 after Round 1 with 4 players.

## 9. Kingdom's Favour disc

Starts on Harvest Field; claim via the Harvest Field reward (even from another player). Moved to your board with the "III" value aligned. Gives you your faction's unique Favour Action (see cards.json `favour_action`; sprout/sun/leaf timing differs by faction). Each activation rotates the disc one step (III->II->I); after the 3rd use it returns to Harvest Field. Re-claiming while holding it resets to III. First tiebreaker at game end.

## 10. Kingdom Cards (51; 17 per suit; each unique) and the market

Suits: coin/"O" = economy (Influence/Lore, Hand Size, cheaper stuff); book/"M" = card manipulation, information, rule-bending; swords/"F" = military (Strength, Elimination, Command grants). Kingdom Cards have no Strength/Archetype/traits and no price - they are won by Bid (see Spring). Max 2 held (board spaces). Types by placement: occupied-on-board (default, most), placed in Supply (a few permanents), placed on a Region or Location (a few, with persistent map effects). Occupying cards are not Active and their text is inactive. Whenever you stop occupying a Kingdom Card its occupier returns to Hand. Kingdom Cards in Supply can't be stolen. Great Road = 4 face-up slots, a stale-card conveyor (rightmost cards get discarded each Spring).
All 51 are documented in cards.json `kingdom_cards` with new names.

## 11. Winning, ties

After the final Round: tally Influence tokens in Supply (after the Site-of-Power Lore conversion bonus if applicable). Most wins. Tie 1: whoever holds the Favour disc. Tie 2: higher on the Order Track (which is set at the Start of the final Round's year, not recomputed). Order Track itself: more Influence acts earlier; in Clash ties (turn order) and bid ties the higher Order Track position wins.
Game length variants: Short (4 rounds), Standard (5), Extended (6). Round Track has 6 slots.

## 12. Bluffing/bidding summary (design-relevant)

Hidden info: 3 face-down cards per round (one per Region) + the bid card; public info: Heralds, Supporters, Council contents, Order Track, Discard, Occupied Kingdom Cards. Bluff levers: Herald placement (public, rewards contested Location), which Region gets your big cards, Ambush/Retreat/Flank/Deadly threats on revealed cards, Supporters placed Spring (public +1 each, wasted if you lose the first Clash there), and Last-player-sets-clash-order (catch-up advantage: the player with the least Influence picks resolution order).
Because each player places a card in each of the 3 Regions every round (3 cards + 1 bid card = 4 cards a round with Hand Size ~6), cards recycle quickly -> Attrition after ~2-3 rounds -> Hand Size shrinks (min 3).

## 13. Solo mode - everything known (INCOMPLETE; see GAPS.md)

Confirmed from reviews + card images (no official solo rulebook was readable; BGG file page returned HTTP 403 to automated fetches):
- Opponent: "the Simulacrum" (the Sim), a 2-player-style duel. The player wins by having more Influence than the Sim after the final Round (5 rounds recommended; 4 or 6 possible).
- The Sim has no Hand; whenever an effect makes it choose/target/gain a card it uses the top card of its Deck. It bids with a stack of bid TOKENS of fixed Strength (not cards) and does not use Kingdom Cards' text; per round it gets a reward based on the SUIT symbol of each Kingdom token/card held (details unknown).
- Decks: Ambition cards (priority of Regions and Council suit; decide Herald placement, Kingdom Card steal targets, location choice on a win; priority backs are visible so you can read its intent; some are "lies"), Scheme/Plan cards (Supporter placement, faction-card placement, Clash marker order, Fog), Fog deck/markers + 24 Threat cards (list in cards.json), Sim Faction Cards graded Gold / Silver / Bronze Tier on the back (visible; some Gold may reveal as weak Ruse "bluffs"). Sim Site of Power "Fog nest": when exhausted it converts 2 Lore into 1 Influence repeatedly.
- Sim ordering: reviews say player order in Spring is by LOWEST Influence (opposite of normal) - ASSUMPTION; Sim in Autumn adds Influence on Councils based on its Ambition suit, and gains more Lore when it Governs/Journeys; if the Sim holds the Favour it draws an extra Threat each round.
- Fog: Regions with Fog get Threat effects (all 24 Threat card effects are in cards.json). Threat cards show 1-3 wave icons at the bottom (meaning unknown).
- Forge: 30 double-sided small cards (60 faces) modify the Sim's behavior; "Heat" scale from -10 (easy) to +15 (hard); default 0; five preset Simulacra; custom/random Sims supported; heat is also used for trophies/high-score eligibility. Examples mentioned: lower the influence requirement, no extra Fog card, bigger Sim clash rewards.
- Sim card faces seen: 11 faces with Strength 1,3,3,5,5,6,6,8,10,11,13 (see cards.json `solo.sim_faction_cards_seen`); real deck size and Tier assignment unknown.
Difficulty: reviewers say the default Sim is hard (Clans/Nobility easiest). 

## 14. Faithfulness checklist for the browser game

Must keep: simultaneous face-down placement of exactly 3 cards + 1 bid card; public Herald; Day/Night steps with Ambush/Retreat/Flank then mandatory Deadly; tied-Clash re-clash; Supporters' first-Clash-only +1; last-place Clash ordering; Location choice after win; Herald +1/-1 swing; Attrition shrink; Order Track ties reversed; Favour tiebreak; Lost Pile permanence; 2-slot Kingdom Card limit with steal-by-higher-bid; Great Road conveyor discards.
Open mechanical edge cases to decide (ASSUMPTION): in Round 1 there are no Start-of-the-Year draws; Hand Size at game start 6; simultaneous Deadly mutual kill; Retreat of the Herald - Herald returns to board and stops being on the Location (rewards lost); when a player has fewer than 3 cards they place before others.
