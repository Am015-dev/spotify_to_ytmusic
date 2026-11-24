# Ochre Horizon card data spec (the contract between data and engine)

All cards live in `data/cards.json` (project cards) and `data/corps.json` (corporations). Every name and text is
OUR OWN design. Structure, counts, cost bands, tag mix, requirement types and effect families follow the original
base game with its corporate-era cards (see ../COMPONENTS.md). `node data/validate.js` must print OK.

The planet is called **Ochre** (never name the real planet's game). Money is **credits** (`mc`).

## Resources (keys)
`mc` credits, `steel`, `ti` titanium, `plant`, `energy`, `heat`. Card resources: `microbe`, `animal`, `science`, `fighter`.

## Tags (keys)
`building space science power earth jovian plant microbe animal city event` (event tag is implied by type "event"; do not list it).

## Project card
```json
{ "id": "p001", "name": "Dust Choir Relay", "type": "auto|active|event", "cost": 12,
  "tags": ["space","power"],
  "req": { "temp": {"min": -12} },            // optional, see Requirements
  "play": [ ops ],                              // immediate effects when played (may be empty)
  "effect": [ effects ],                        // active cards only: lasting effects
  "action": [ {"cost":[ops], "do":[ops]} ],     // active cards only: once per generation, pick ONE entry
  "res": "microbe",                             // optional: card can hold this resource
  "vp": 1 | {"per":"res","every":2,"n":1} | {"per":"tag","tag":"jovian","n":1} | {"per":"adjOcean"} | {"per":"cityAdj","t":"city"},
  "text": "Plain words, max 18 words. What it does.",
  "flavor": "Optional one line of retro sci-fi flavour, max 10 words." }
```

## Requirements (`req`, all optional, all must hold)
- `temp` / `oxy` / `ocean`: `{"min":n}` or `{"max":n}`. temp in °C steps of 2 from -30 to 8; oxy 0..14 (%); ocean 0..9.
- `tags`: `{"science":2}` (you must own that many tags on played non-event cards, plus corp tags).
- `prod`: `{"plant":1}` (your production must be at least n).
- `cities` / `greeneries`: `{"min":n}` (yours; for `cities` count every city you own incl. off-map).

## Ops (immediate)
| op | fields | meaning |
|---|---|---|
| prod | r, n | change own production (n may be negative; mc prod floor is -5, others 0; negative only if you have it) |
| gain | r, n | gain resource |
| lose | r, n | pay resource (must have it) |
| rprod | r, n | decrease the rival's production by n (if rival has none, nothing happens) |
| rres | r, n | remove up to n of a resource from the rival (plants: rival's plants) |
| temp / oxy / ocean | n | raise temperature n steps / oxygen n% / place n ocean tiles (each gives TR) |
| tr | n | raise your terraform rating |
| tile | t, where | place a tile: t = city / greenery / special; where = default / any / reserved:<spaceId> / volcanic / isolated / noctis(=reserved city space) / offmap:<id> / nextToOwn / ocean(land on an ocean space) |
| draw | n, tag? | draw n cards (with tag: reveal until n cards with that tag, keep those) |
| addres | n, to | add card resources: to = "self" or "any" (any of your cards with that res; give "kind") |
| gainper | r, n, per, div? | gain n of r per X (per: "tag:earth" yours, "tagAll:space" all players, "cities", "citiesAll", "oceans", "greeneries", "greeneriesAll") divided by div (round down) |
| prodper | r, n, per, div? | same, as production |
| choose | opts:[[ops],[ops]] | pick one list |

## Effects (active cards, lasting)
| effect | fields | meaning |
|---|---|---|
| disc | n, tag? | cards (with that tag, or any card) cost n less |
| onTag | tag, do:[ops], any? | when YOU play a card with that tag (any:true = any player) run ops; addres to self is common |
| onTile | t, do:[ops], any? | when you (or any) place a tile of t (city/ocean/greenery) |
| steelVal / tiVal | n | your steel / titanium are worth +n |
| reqSlack | n | global requirements are +/- n easier for you |
| stdDisc | n, which? | standard projects cost n less (which = "city" etc., or all) |
| greenCost | n | you need n plants for a greenery (default 8) |
| heatAsMc | | you may spend heat as credits |
| onPay | min, do:[ops] | when you play a card costing >= min, run ops |

## Actions (active cards; once per generation, pick one entry)
`{"cost":[{"op":"lose","r":"energy","n":1}], "do":[{"op":"gain","r":"mc","n":2}]}`
Cost ops may also be `{"op":"useres","n":1}` (remove card resources from THIS card). Do ops may be any op.

## Corporations (`data/corps.json`)
```json
{ "id":"c01", "name":"Helio Lanterns", "tags":["space"], "mc":42, "start":[ops], "effect":[effects], "action":[...], "text":"...", "flavor":"..." }
```

## Power curve
1 TR ~ 7 credits, 1 VP ~ 5, temp step ~ 7+heat bonus, ocean ~ 7+bonus, oxygen ~ 7. Production per unit: mc 1 credit ≈ 5,
steel 8, ti 12, plant 8, energy 7.5, heat 4. A card with no tag/requirement/VP should give ~ cost + 3 (the 3-credit buy price)
in value. Requirements and tags shift this by a few credits. `validate.js` prints the cards furthest off the curve.
