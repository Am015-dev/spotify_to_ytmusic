# Ochre Horizon rules diff against the reference (24 Nov 2026)

Method: the reference engine (open source, read only, outside this repo) was read for every number below and compared with
`game/src/engine.js`, `data/cards.json`, `data/corps.json`. Nothing was copied from it; only numbers and rule outcomes are
recorded here. `node rules-test.js` (in `game/`): 64 passed, 0 failed, before and after this audit. No engine or data change
was needed, so no new test was added.

Status: MATCH = same value/behaviour. FIXED = we were wrong and are now right. MISSING = the reference has it, we do not.
KEPT = differs on purpose or harmlessly, left as is (reason given).

## Global parameters, bonuses, ratings

| Rule / number | Reference value | Ours | Status |
|---|---|---|---|
| Temperature range, step | -30 to +8, 2 per step (19 steps) | -30 to +8, step 2 | MATCH |
| Oxygen range | 0 to 14 | 0 to 14 | MATCH |
| Oceans | 9 max | 9 max, 12 ocean spaces on our map | MATCH |
| Rating at start | 20 | 20 | MATCH |
| Rating per global step | +1 per step actually raised, none when already maxed | same (no rating when maxed) | MATCH |
| Ocean tile placed | +1 rating | +1 rating | MATCH |
| Heat production bonus steps | crossing -24 and -20 | -24 and -20 | MATCH |
| Ocean bonus step | crossing 0 | 0 (ocean placed by the raiser; skipped when 9 oceans down) | MATCH |
| Oxygen to temperature bonus | crossing 8 raises temperature 1 step for the raiser | at 8 raises temperature 1 step, can cascade into the 0 ocean bonus | MATCH |
| Bonus on multi-step raise | every threshold crossed pays | we raise one step at a time, so every threshold pays | MATCH |
| Raising a maxed global by card | card still playable, no effect, no rating | same (test "maxed global: a card that raises it can still be played") | MATCH |
| Greenery raises oxygen | yes, even when maxed (tile still placed) | yes | MATCH |

## Actions, standard projects, conversions

| Rule / number | Reference value | Ours | Status |
|---|---|---|---|
| Power plant | 11, +1 energy production | 11, +1 energy production | MATCH |
| Asteroid (temperature) | 14, +1 temperature | 14, +1 temperature | MATCH |
| Aquifer (ocean) | 18 | 18 | MATCH |
| Greenery | 23, greenery tile | 23 | MATCH |
| City | 25, city tile + 1 credit production | 25, same | MATCH |
| Sell patents | cost 0, 1 credit per card, any number | 1 credit per card, any number | MATCH |
| Asteroid / aquifer when that global is already maxed | still allowed (paid, a warning, no gain) | not offered | KEPT (strictly safer for the player; no rules effect) |
| Plants to greenery | 8 plants | 8 (cards can lower it) | MATCH |
| Heat to temperature | 8 heat | 8 heat, not offered when maxed | MATCH |
| Greenery placement | next to an own tile if any such space exists, else anywhere on land | same | MATCH |
| City placement | never next to any city, land only | same | MATCH |
| Ocean placement | ocean spaces only | same | MATCH |
| Ocean adjacency bonus | 2 credits per adjacent ocean, also when placing an ocean | 2 per adjacent ocean, also for oceans | MATCH |
| Steel / titanium value | 2 (building tag) / 3 (space tag) | 2 / 3, raised by effects | MATCH |
| Research | 4 cards, 3 credits each, none in generation 1 | same | MATCH |
| Cards dealt at start | 10 project cards, 2 corporations | 10 cards, 2 corporations (+ beginner offer) | MATCH |
| Corporation cards paid from start credits | 3 each | 3 each | MATCH |
| Draft variant | optional, pass hands | optional, 4 picks | MATCH |
| Actions per turn | 1 or 2, then next player; passed players skipped | same | MATCH |
| First player | rotates each generation | rotates | MATCH |
| Production phase | energy to heat, then credits += credit production + rating, other resources += production | same order | MATCH |
| Production floors | credit production -5, others 0 | -5 / 0 | MATCH |
| Decrease any player's production | someone must lose the full amount | fixed earlier (see RULES-AUDIT row 17) | MATCH |

## Milestones, awards, end, scoring (2 players)

| Rule / number | Reference value | Ours | Status |
|---|---|---|---|
| Milestone cost, VP, max | 8 credits, 5 VP, 3 claimed, one claimer each | 8, 5, 3, one claimer each | MATCH |
| Milestone and award count on board | 5 and 5 | 5 and 5 (our own goals, original names) | MATCH |
| Award costs, max | 8 / 14 / 20, 3 funded | 8 / 14 / 20, 3 | MATCH |
| Award scoring, 2 players | first 5 VP; second place pays nothing (second place of 2 VP only exists with 3+ players); tie for first pays both 5, also at 0 to 0 | first 5, no second place, tie pays both (0 to 0 pays both too) | MATCH |
| End trigger | all three globals maxed; the generation finishes with production, then final greenery | same | MATCH |
| Final greenery | each player may keep converting 8 plants while a legal space exists | same | MATCH |
| Scoring | rating + milestones + awards + 1 per own greenery + 1 per greenery adjacent to each own city (any owner's greenery) + card VP | same | MATCH |
| Tie break | most credits | most credits | MATCH |
| Tie on points AND credits | joint win | player 1 (the human) wins | MISSING (shared win; needs a UI result state, so left to the UI owner) |
| Tag effects on the card that carries them | decided per card text ("including this" is printed where it applies) | engine never self-triggers; our texts never say "including this" | MATCH (text and engine agree; 6 active cards and 2 corporations affected) |

## Corporations (ours are original designs, no 1-to-1 reference)

No corporation carries a `ref`. Start credits: ours 40 to 52, mean 44.9; reference 23 to 60, mean 41.1. All inside the range.

| Our corporation | Ours | Nearest reference analog (numbers only) | Status |
|---|---|---|---|
| Open Charter (beginner) | 42 credits, 10 cards free | 42 credits, 10 cards free | MATCH |
| Sunward Lanterns | 48, 1 energy prod, space cards -2 | 48, 1 energy prod, a discount of 3 on another tag | KEPT (original) |
| Sandstitch Guild | 46, 5 steel, 1 steel prod, steel +1 | 30, 5 steel, 1 steel prod | KEPT (we pay 16 more credits for the steel bonus) |
| Verdigris Works | 46, 1 plant prod, 4 plants, +4 credits per greenery | 36, 2 plant prod, 3 plants | KEPT (original) |
| Tidewater Charter | 46, 2 credit prod, +2 per ocean | none | KEPT (original) |
| Brightwater Exchange | 46, 1 credit prod, +2 per event | 30, 20 steel, +2 per event | KEPT (original) |
| Ironbloom Reactors | 46, 3 heat prod, action | 42, 3 heat prod, heat as credits | KEPT (original) |
| Orrery Collective | 40, 4 cards, science -1 | 45, 3 cards | KEPT (original) |
| Cometline Salvage | 42, 1 titanium prod, +2 per space tag | 42, 1 titanium prod, +1 credit prod per jovian tag | MATCH on base numbers |
| Ranger Collective | 41, 1 plant prod, 2 animal cards | none | KEPT (original) |
| Deepglass Mining Co. | 46, 3 steel, 1 steel prod, +3 steel per city | 30, 5 steel, 1 steel prod | KEPT (original) |
| Moonrise Board | 40, 2 energy prod, city project -5 | 40, city start, +3 credits per city | KEPT (original) |
| Grey Harbor Syndicate | 52, action | none | KEPT (original) |

## Project card sample (the reference link is absent in our data)

`data/cards.json` has no `ref` field on any of the 208 cards, and a numeric search (cost + tags + effect) finds no card that is a
copy of a reference card; the deck is a re-priced original set. So a card-by-card diff is not possible. What was done instead:
(1) every requirement in the data was range-checked against the global ranges (temperature even and -30..8, oxygen 0..14,
oceans 0..9, production floor -5): zero violations; (2) cost ranged 0 to 39, 118 automated / 48 active / 42 events; (3) the
global-raising cards were priced against the nearest reference analog by effect. Costs below are credits.

| Our card | Ours | Nearest reference analog | Note |
|---|---|---|---|
| p149 Quick Tide | 7, one ocean, no requirement, no drawback | 11 for an unconditional ocean event; the 7-cost reference ocean carries -1 VP and a drawback | outlier (cheap) |
| p032 Dry Ice Delivery | 9, space, one ocean | 16 (earth + space) | cheaper |
| p145 Frozen Gift Rock | 10, space, ocean + 1 plant | 16 | cheaper |
| p163 Mist Brigade | 12, space, ocean + 1 card | 15, ocean + 1 card | close |
| p033 Slow Comet Harpoon | 12, space, ocean + 2 plants | 23, ocean + 2 plants + 1 oxygen | cheaper, no oxygen |
| p034 Crater Lake Fill | 17, two oceans | 23 (space) or 18 with 0C requirement + 2 VP | between |
| p146 Ice Bolide Strike | 19, space, two oceans | 23 | cheaper |
| p180 Big Hail Season | 29, space, three oceans | 23 for two, 36 for two + two temperature | in line |
| p178 Seep Wells Opening | 17, ocean + 1 plant prod | none | n/a |
| p168 Comet Tug Run | 18, ocean + 3 titanium | 23, ocean + 2 plants + oxygen | cheaper |
| p165 Delta Burst | 22, ocean + temperature, 1 VP | 21, temperature + ocean + remove plants | close |
| p156 Rogue Moonlet | 28, two oceans, cut credit prod, 1 VP | 36, two oceans + two temperature | in line |
| p031 Hot Wire Barrage | 9, temperature + 3 heat | 14, temperature + 2 titanium + remove plants | cheaper |
| p153 Heat Lamp Flyby | 10, temperature + 3 heat | same class | cheaper |
| p161 Sunburst Relief | 10, temperature + 1 card | none | n/a |
| p035 Polar Melt Plan | 17, two temperature + 1 heat prod | 18, two temperature + volcanic tile | close |
| p039 Mirror Tilt Program | 9, two temperature, -1 energy prod | none | outlier (cheap) |
| p162 Seven Day Thaw | 23, three temperature | 31, three temperature + 4 steel + remove plants | cheaper |
| p174 Ring Shepherd Strike | 27, two temperature + 2 titanium, 1 VP | 27, two temperature + 4 titanium + remove plants | close |
| p171 Lava Burp | 17, two temperature (req -14C) | 18, two temperature + tile | close |
| p179 Pole Mirror Burst | 16, temperature + 2 heat prod | 13, temperature + 1 energy prod | close |
| p036 Respirator Dunes | 15, two oxygen | 25, two oxygen with production costs | cheaper |
| p170 Pressure Wave | 15, space, two oxygen | same class | cheaper |
| p040 Orchard Fog Engine | 9, two oxygen, -1 energy prod | none | outlier (cheap) |
| p155 Spore Cloud Burst | 11, oxygen + 3 plants | none | n/a |
| p172 Sky Garden Seeding | 17, greenery, req 3% oxygen | 15, greenery, req 2 science tags | close |
| p047 Ridge Arboretum | 22, greenery + 1 credit prod, req 4% | 23, greenery + 2 credit prod | close |
| p044 Meadow Rooftops | 24, greenery + 2 plants, req -20C and 1 ocean | none | n/a |
| p041 Hab Ring Ochre-1 | 15, city, +2 credit prod, -1 energy prod | 11, city, +3 credit prod, -1 energy prod, -2 VP | no VP penalty |
| p048 | 21, city, +3 credit prod, -1 energy prod | 16, same shape, requires 9% oxygen | no requirement |
| p042 Terrace Settlement | 17, city, +1 credit prod | none | n/a |
| p066 Pocket Almanac | 6, draw 2 | none | n/a |
| p164 Probe Lottery | 9, draw 3 | none | n/a |
| p073 Signal Decoder | 11, draw 3, req 2 science tags | none | n/a |
| p054 Peace Garden Plaza | 12, 2 VP, req 4% oxygen | 11, 2 VP, req 7% oxygen | easier requirement |
| p197 Window Moss | 4, 1 VP | none | n/a |
| p050 Heritage Obelisk | 11, special tile, 2 VP | none | n/a |
| p029 Magma Tap | 25, volcanic tile + 3 heat prod + 1 energy prod | none | n/a |

## Still missing / open

- Shared win on a full tie (points and credits equal): reference declares both winners; ours gives the win to the human side. Needs a result state in the UI, so it is outside the engine-only scope of this pass.
- Standard asteroid / aquifer at a maxed global is blocked, the reference allows the wasted purchase. Kept on purpose.
- No `ref` field on any card or corporation, so a full per-card diff is not possible; the sample above is by effect, not by identity.
- Price outliers that read as cheap against the reference scale (not rules errors, a tuning question for the balance gate): Quick Tide (p149), Mirror Tilt Program (p039), Orchard Fog Engine (p040).
- Not in scope and not built: solo rules, 3 to 5 players, second-place award points, expansion tracks (already stated in rules-notes.md).

## Screen rules added in this pass (24 Nov 2026)

| Rule | Reference | Ours | Status |
|------|-----------|------|--------|
| Corporations shown at start | 2 dealt per player (+ beginner option) | 2 dealt + the beginner corporation = 3 big cards, select then confirm | MATCH |
| Milestone / award / standard project panels show live counts and cost | yes | top tabs open panels with you vs rival counts, USE + gold cost badge | MATCH |
| Bonus steps visible on the gauges | yes | white dots on -24 °C, -20 °C, 0 °C and 8 % | MATCH |
