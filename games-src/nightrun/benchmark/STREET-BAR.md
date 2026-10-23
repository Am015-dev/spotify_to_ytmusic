# The bar for the street (ON FOOT) level (owner, 23 Oct 2026)

The owner named a modern pixel-art side-scrolling beat-'em-up (2022) and "similar games" as the benchmark, with its boss fights as the
reference. Per CLAUDE.md, no original game is named here. Every review and design task on the street scores against this list;
a row passes only on a measured number (stepped probe or qa/streetsim.js), never on a worker's word.

## Hit feel (every hit the player lands)
| # | Rule | Gate |
|---|---|---|
| F1 | Hit-stop on impact: a short freeze, longer for heavier hits | 2-4 frames light, 5-8 heavy/finisher |
| F2 | The foe reacts: flinch frame + knockback that scales with the hit, flash, impact particles | 100% of landed hits show flinch + spark |
| F3 | Screen shake only for heavy hits, kills and boss hits, never for a whiff | 0 shakes on misses |
| F4 | Player knockback small: a light hit never throws Kai more than ~1 body width | <= 64 units |

## Enemies (crowds)
| # | Rule | Gate |
|---|---|---|
| E1 | Every attack is telegraphed (wind-up pose or flash) long enough to read | >= 0.4 s, 100% of attacks |
| E2 | Only a few foes attack at once; the rest circle, wait or reposition ("attack slots") | <= 2 active attackers at once |
| E3 | Committed attacks can be punished or dodged; no input-perfect counters, no hidden invulnerability | 0 unreadable hits in streetsim |
| E4 | Foe types read by silhouette and colour alone, and each asks for a different answer | >= 4 types, each with its own counter |

## Bosses (the reference: every stage ends on one)
| # | Rule | Gate |
|---|---|---|
| B1 | A boss has 2-3 phases, each adding one new attack, announced on screen | phase change visible + named |
| B2 | 3-5 distinct attacks, each with its own telegraph and its own safe answer (duck, jump, dash, back off, cover) | streetsim: every attack dodged by the dodge bot >= 70% |
| B3 | Openings: after each attack the boss is hittable for a clear window | >= 1 s window after each attack |
| B4 | Fight length 45-90 s for a decent player; the boss never feels like a damage sponge | median 45-90 s, dodge bot |
| B5 | A boss is bigger than foes and shows its health bar with its name | bar + name always on screen |

## Depth: the belt floor (owner, 23 Oct 2026: "the game is boring because the character moves left and right and you are not using the [benchmark's] environment logic")
| # | Rule | Gate |
|---|---|---|
| D1 | Kai and every foe walk on a floor band in depth (up/down = into / out of the street), not on one line; jumps are a separate height | floor band >= 25% of the screen height; Kai and foes use >= 60% of it |
| D2 | Hits land only on actors at about the same depth; stepping up/down dodges an attack | attacks out of depth miss; the dodge bot avoids >= 30% of hits by changing depth |
| D3 | Foes spread in depth and flank: they come from both sides and different depths, not in a queue | median depth spread of attackers >= 30% of the band |
| D4 | Actors are drawn back to front with a floor shadow, and slightly smaller further back | depth sort every frame; shadow under every actor |
| D5 | The environment plays: props you can break, hazards that hurt foes too, and things to knock foes into | >= 3 interactive prop kinds on the street |

## Presentation
| # | Rule | Gate |
|---|---|---|
| P1 | Animation smooth and on the character, never sliding or cut | footvis + spritecut pass |
| P2 | One song per level, on beat, no jingles over it | streetsong + soundlab pass |
| P3 | The camera shows where danger comes from | cam2-test: Kai in right 30% < 10% |
| P4 | Readable on phone: actors >= 1/8 of screen height, HUD never covers the fight | probe on 390x763 |

Saved screenshots of our own street are in benchmark/street/ (compare, don't retake).
