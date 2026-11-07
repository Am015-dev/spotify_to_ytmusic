# Wildmark Story: The Three Regions

**Premise.** A long frost emptied three wild regions. You are a young ranger sent by Ward Elder Rowan to grow each region
back, valley by valley. Every chapter is a real, full game of Wildmark (same tiles, tokens, cards and scoring) with one
change: a stronger rival, a short season, a scoring target or a market rule. Data: `campaign.json`; code: `src/campaign.js`.

## Acts and curve
| # | Act | Chapter | Rival (AI) | Twist | Goal | Why it is here |
|---|-----|---------|-----------|-------|------|----------------|
| 1 | Thawing Valley | First Tracks | none (solo) | - | 50+ points (win not needed) | first real game, no pressure; tutorial runs before it |
| 2 | | A Neighbour's Fence | Pip, easy | - | win | first rival; learn the shared market |
| 3 | | **The Hollowell Claim (boss)** | Bram, easy | rival starts with 2 acorns | win | acorns matter: get keystones |
| 4 | Mistwood | Into the Mist | Sorrel, normal | - | win | habitats and majority bonuses |
| 5 | | Three at the Spring | Linnet + Oake, normal | - | win (3 players) | crowded market, acorn free picks |
| 6 | | **The Quill Survey (boss)** | Sable Quill, hard | rival starts with 2 acorns | win | first hard rival |
| 7 | High Cascades | Short Thaw | none (solo) | season lasts 16 turns | 60+ points | efficiency under a short season |
| 8 | | Oake's Old Growth | Oake, hard | nobody may sweep three tokens | win | plan without the free sweep |
| 9 | | Council of Rangers | Linnet + Sorrel + Oake, hard | - | win (4 players) | the full table |
| 10 | | **The Ash Warden (boss)** | Warden, hard | rival starts with 3 acorns | win | final boss |

Act 1 keeps the coach and lightbulb tips on (`hints: true`); acts 2-3 turn the first-time bubbles off (the bulb still works).
After 2 losses a chapter offers "Make it a bit easier" (`easier`: one AI level down, no twist; at most 2 stars).

Act 3 swaps the animal cards: c8 sets B/C mixed, c9 C/B mixed, c10 all set D (`setup.cards`).

## Twists (only inside Story)
- `boss-acorns` (param N): every rival seat starts with N acorns (free picks / replaces, and N points at the end).
- `short-season` (param N): N turns per player; the tile supply is sized to match.
- `no-sweep`: the optional free sweep of three matching tokens is off for everybody (four still sweep themselves).

## Stars (metrics from `campMetrics`)
`won`, `score`, `margin` (vs the best rival), `acorns` (left at the end), `habitat` (habitat points), `animals` (animal
points), `biggest` (largest single habitat), `kinds` (how many animal cards scored above 0).

## Cast (portrait slots in assets.json)
Rowan (guide), Pip, Bram Hollowell, Sorrel, Sable Quill, Linnet, Oake, the Ash Warden; you are "the ranger".
