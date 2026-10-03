# Ticket to Ride (USA, base game) - rules notes for a faithful browser version
Real names appear only as `ref`. Suggested player-facing identity: title **"Iron Meridian"** (or "Cross-Country Rails"), theme: 1900s continental rail race, players are rival rail barons; train cars = "wagons", tickets = "Contracts", Longest Path bonus = "Grand Trunk Line", train card types = our own wagon names (e.g. Mail, Coach, Tanker, Cold, Cargo, Hopper, Coal, Brake) with our own colours/icons. Locomotive = "Engine" (wild). Names, text, art original; rules follow rulebook.

## Components (rulebook 2015 reprint, confirmed)
- 1 board (36 cities, 100 route segments = 78 city pairs, of which 22 are double routes), scoring track 0-100+ around the edge
- 45 trains per player (rulebook: 240 cars total = 45 x 5 colours + spares); 5 colours; 1 scoring marker each
- 110 train cards: 12 each of 8 colours (Purple=Box, Blue=Passenger, Orange=Tanker, White=Reefer, Green=Freight, Yellow=Hopper, Black=Coal, Red=Caboose) + 14 locomotives (wild)
- 30 destination tickets; 1 Longest Continuous Path bonus card (10 pts)
- Players 2-5, age 8+, 30-60 min (rulebook). BGG: could not fetch (403 to proxy); weight ~1.8/5 from memory = guessed.

## Setup (all player counts identical except double routes)
1. Each player takes 45 trains + marker on 0.
2. Shuffle train deck, deal 4 to each; turn 5 face up (if 3 of 5 are locomotives, discard all 5 and redraw; the 2015 US rules state this rule in the locomotive section; apply at setup as in Europe).
3. Shuffle tickets, deal 3 each; keep at least 2 (may keep all 3). Returned tickets go to the BOTTOM of the ticket deck.
4. Longest Path card beside board. Most experienced traveller starts (we: random or youngest). Clockwise.

## Turn: exactly ONE of three actions
1. **Draw train cards**: draw 2, each from the 5 face-up (replace immediately from deck) or blind from deck top. Face-up locomotive: taking it as the FIRST draw ends the draw (only 1 card). Cannot take a face-up locomotive as the second card (including one just revealed as replacement after the first). Blind-drawn locomotive counts as a normal single card; draw 2 total. If 3 of 5 face-up are locomotives at ANY time, discard all 5, redraw 5 (repeat if needed). No hand limit. Deck empty: shuffle discards into new deck. No cards anywhere: cannot choose this action.
2. **Claim a route**: play a set of cards = route length, all of one colour matching the route colour (gray route: any single colour); locomotives substitute for any cards. Place one train per space; discard the cards; score by route length. Only ONE route per turn. Need not connect to existing routes. Cannot claim a route you cannot fully afford.
3. **Draw tickets**: draw 3 from top, keep at least 1 (can keep 2 or 3); returned go to bottom. If fewer than 3 remain, draw those available. Tickets drawn this way can only be discarded among the just-drawn ones. Tickets secret until end.

## Double routes
Two parallel routes between same two cities, same length (colours can differ). One player may NOT claim both. **2-3 players: only ONE of the pair may be claimed; the other is closed.** 4-5 players: both are usable (by different players). (Rulebook text says 2 or 3 players. Confirmed.)

## Route scoring table (confirmed)
Length 1:1, 2:2, 3:4, 4:7, 5:10, 6:15. Sanity: all 100 segments sum to 309 spaces; 508 points if all were claimed (computed from our data).
Length distribution: 1:9, 2:36, 3:20, 4:16, 5:10, 6:9 segments. Colours: 7 segments each of 8 colours, 44 gray.

## End of game
When a player's remaining trains are 0, 1, or 2 at the END of their turn, every player including that one gets exactly one more turn, then scoring.

## Final scoring
1. Route points (already accumulated).
2. Reveal tickets: + value if a continuous path of that player's own trains joins both cities, - value if not.
3. Longest Continuous Path: +10. Only a single player's own-colour trains; path may repeat cities and loop but never reuse a single train segment (edge-simple trail). Ties: all tied players get +10.
4. Most points wins. Tie 1: most completed tickets. Tie 2: holder of Longest Path card (any tied holder). (Confirmed from rulebook; 1910/Europe say share victory otherwise.)

## 30 base tickets
In map-usa.json (values 4 to 22, sum 349). Cross-checked values match the standard set from memory; list from community CSV. Not verified against physical cards (rulebook has no list).

## Europe (standalone; implement second as a map pack) - confirmed from 2026 rulebook
- 45 trains + 3 stations per player; 110 cards same distribution; 46 tickets (40 regular + 6 long); 15 stations total.
- Setup: each player gets 1 long ticket + 3 regular, keeps at least 2. Unkept long tickets are returned to box; discarded tickets return to box at setup. Mid-game draw: 3, keep at least 1, returned go to bottom.
- Actions (4): draw cards, claim route, draw tickets, **build station**.
- Locomotive draw rule same as USA. Double routes: only one in 2-3 players.
- **Ferries**: gray routes with locomotive icons on some spaces; need one locomotive per icon + any single colour set for the rest (extra locomotives may substitute).
- **Tunnels**: declare route, play required cards; turn top 3 of deck face up; each revealed card matching the played colour (locomotive always matches) forces one extra matching card/locomotive from hand; if you can't/won't, take cards back and turn ends; discard the 3 revealed at turn end. All-locomotive attempt: extra only if locomotives revealed. If deck+discard insufficient, reveal what exists. Gray tunnels: the colour you chose to play.
- **Stations**: build on any unoccupied city (even with no routes); max 1 per turn, max 3; cost 1 card, then a set of 2 same colour, then set of 3 (locomotives substitute). At end, each station lets you use exactly one opponent route touching that city for ticket completion (chosen at scoring). Does not count for longest path. +4 points per unused station.
- Scoring table: 1:1, 2:2, 3:4, 4:7, 6:15, 8:21 (no length-5 route; confirmed by 2026 booklet figures 1 2 4 7 15 21).
- Tie-break: tickets completed, then longest path card, else share.

## 1910 expansion (USA; confirmed from 2018 EN booklet)
- 35 new tickets (1910 logo) + 15-point Globetrotter bonus (most completed tickets) + large reprints of the base cards; includes 30 standard tickets (4 revised downward) and 4 "Mystery Train" tickets.
- Modes: **1910** (only new tickets; replace Longest Path with Globetrotter), **Mega Game** (all 69 tickets, both bonuses, deal 5 keep 3; draw 4 keep 1), **Big Cities** (35 tickets with a red big-city: Chicago, Dallas, Houston, Los Angeles, Miami, New York, Seattle; deal 4 keep 2; draw 4 keep 1).
- Ticket texts for the 35 new tickets are NOT in the booklet and were not fetched: guessed/to research if implemented.

## Expansions / maps and priority
| Pri | Pack | What it adds | Players |
|---|---|---|---|
| 1 | USA base | above | 2-5 |
| 2 | USA 1910 | 35 tickets, Globetrotter, Mega/Big Cities modes: cheap (data only) | 2-5 |
| 3 | Europe | tunnels, ferries, stations, long tickets, 46 tickets; the "gamer's" version | 2-5 |
| 4 | Nordic Countries | 2-3p, 40 trains, ferries+tunnels, locomotives only for tunnels/ferries (cannot make regular routes), no cap on loco draws, 46 tickets deal 5 keep 2, Globetrotter bonus instead of longest path, Murmansk-Lieksa special route (4 any cards = 1 coloured card), scoring track starts at 100 | 2-3 |
| 5 | Asia / Legendary Asia (Map 1) | Team Asia (partners, 2v2), Legendary Asia (mountain tickets) | 2-6 |
| 6 | India (Map 2) | Larger map, mileage bonus for the Maharaja (guessed) | 2-4 |
| 7 | Switzerland (Map 2) | Country-connection bonuses, tunnels, 2-3p (guessed) | 2-3 |
| later | Marklin | passengers, merchandise tokens, +4 loco | 2-5 |
| later | Heart of Africa (terrain cards), Netherlands (toll/bank), UK/Pennsylvania (locomotive/stock shares), France/Old West, Japan/Italy, Iberia/Korea, Rails & Sails, Northern Lights, Legacy, Cities series | complex; skip | |
Details for Asia/India/Switzerland/Marklin/others: from Wikipedia summary + memory only = **guessed**, verify before building.
Recommendation: build USA base + 1910 modes first (same engine), then Europe (tunnel/ferry/station logic in the engine from day one is cheap), then Nordic.

## 2-3 player rules summary
Double routes: only one of each pair claimable (2 and 3 players). With 4-5 both open. Same 45 trains.
Nordic/Switzerland are designed for 2-3 (Nordic: double routes closed with 2).

## Confirmed vs guessed
**Confirmed (primary: official 2015 rulebook PDF, Europe 2026 PDF, 1910 PDF, Nordic PDF):** components counts (45 trains, 110 cards, 12x8+14 locos, 30 tickets), setup, turn actions, locomotive draw rules, 3-of-5 flush, double-route rule 2-3p, scoring table, end trigger (<=2 trains), ticket keep rules (2 at start, 1 later), longest path rule and tie-breaks, Europe stations/tunnels/ferries, 1910 modes.
**Verified by data:** 36 cities, 100 segments, 78 pairs, 22 doubles, 7 segments per colour (computed from route CSV).
**Guessed/unverified:** exact ticket list vs physical cards; BGG stats (403); official FAQ/errata and BGG threads (not fetched; no known errata affects base rules); city x/y (ours, approximate); Asia/India/Switzerland/Marklin details; whether setup flush of 3 locos is explicit in USA rules (rule says "at any time").
Common table clarifications (guessed, from experience): hand is not public; you may claim a route with only locomotives; after a tunnel the revealed cards go to discard; ticket completion check uses only own-colour trains (US).
