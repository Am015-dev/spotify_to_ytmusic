# Sources

Raw downloads are kept under `research/` and are not for committing.

## Primary sources

| Key | URL / location | What it confirmed |
|---|---|---|
| RB | https://how-to-play.s3.us-east-2.amazonaws.com/413246/rules/413246_rules.pdf (linked from https://merchantsofplay.com/howtoplay/bomb-busters/). This is the English rulebook v1.0, Pegasus Spiele North America, 2024 (`research/rules-mop.pdf`, `.txt`) | The full base component list; setup steps and the stands table; the "x out of y" procedure; dealing and sorting; equipment count = players; the opening info token; the three actions; the failure consequences; yellow rules; validation tokens; equipment unlocking and use; Double Detector rules; the no-wires clarification; communication rules; win/loss; the captain rotation; the audio-file URL; the sticker spots A/B/C |
| FAQ | https://cdn.pegasus.de/public/media/28/6f/b3/1767819082/Bomb%20Busters%20FAQ%202025-0711.pdf. This is the official Pegasus FAQ dated 11 July 2025 (`research/faq-pegasus-2025.pdf`, `.txt`); we found the link on the BRDGMZ page below | Solo cut with 2 stands, and "never 3"; deliberate wrong guesses; the house rule for naming a value you do not hold; info-token shortage; Double Detector details (non-adjacent wires, same stand, both red = explosion, one red = no explosion, no yellow); clarifications for equipment 2, 3, 5, 8, 9, 10 and 11-11; clarifications for missions 9, 10, 12, 13, 18, 24, 29, 31, 32, 38, 39, 41, 44, 49, 54, 56 (with an erratum), 63, 64 and 66; the list of audio missions |
| CARD | Card scans in the GitHub repo `markverick/bdiffuser`, folder `packages/client/public/images/` (clone at `research/repos/markverick_bdiffuser`): `mission_1..66.jpg` and `mission_N_back.jpg`, `equipment_*.png`, `character_*.png`, `constraint_a..l.png`, `challenge_1..10.png`, `bunker_front/back.png`, `rule_sticker_a/b/c.png`, `cutter_a/b.png` (the sequence card), token images. We read every card image ourselves; side-by-side composites are in `research/combo/` | All 66 mission setups (wire counts, "x out of y", 2-player lines, removed equipment, special components, dial overrides) and their rule text; all 18 equipment texts and timings; the 9 character cards; constraints A–L; challenges 1–10; the bunker layout; the 3 rule stickers; the detonator dial segment layout (from the dial drawings on M41/55/60/62) |
| AUDIO | MP3s linked from https://pegasusna.com/welcome-bomb-busters (cdn.pegasus.de `BB-Final_Mission-{19,30,42,54,66}.mp3`, in `research/audio/`), machine-transcribed locally with faster-whisper small.en in two passes (with and without voice-activity filtering) | The content of the audio-driven missions 19, 30, 42, 54 and 66 (see `audio_script` in missions.json). Accuracy is moderate, and music-only stretches carry no information. The per-mission `reliability` notes give details. The FAQ points to the audio credits at https://www.cocktailgames.com/nos-jeux/bomb-busters-credits/ |

## Secondary sources and cross-checks

| URL | What it confirmed or contributed |
|---|---|
| https://boardgamegeek.com/boardgame/413246/bomb-busters | The page is blocked (HTTP 403) for automated fetches, and the XML API needs a token. From search snippets of this page: 2–5 players, 30 min, weight 2.01, mechanics, 66 missions |
| https://www.boardgameoracle.com/boardgame/price/z-UXtOXfR5/bomb-busters | BGG data mirror: 2–5 players, 30 min, age 10+, weight 2.0, BGG rating 8.0 and rank 84, the full mechanics list, the artist's name |
| https://www.brdgmz.nl/2025/07/27/bomb-busters-speluitleg-english/ (and the NL rules page `research/faq-en.pdf`, which is HTML) | An independent Dutch rules summary based on the 999 Games edition: the stands per player count, the 48 blue tiles, captain and character setup. It also linked to the official FAQ PDF |
| https://github.com/Brawlboxgaming/Bomb-Busters-Scripted (`Counter.lua`) | The Tabletop Simulator scripted mod: dial position = player count, −1 per step, 0 = explosion; missions 41/55/60/62 start at 1; mission 51 with 5 players starts at 6; maximum 5 for ordinary moves. Independent confirmation of the dial model |
| https://github.com/tannersatch/bomb-busters (`shared/game/helpers.ts`) | The dial starts at the player count (another independent implementation) |
| https://github.com/CzJLee/Bomb-Busters (`docs/RULES.md`) | An independent transcription of components (26 info tokens = 2 per value + 2 yellow), constraint A–L and challenge 1–10 texts, and missions 1–30. It matches our card readings |
| https://github.com/axross/bombdog (`docs/game-overview.md`) | A general overview (66 missions, 5 surprise boxes) and the note that BGG lists a solo option |
| https://www.boardgamesbot.com/bomb-busters | Rules summary: Reveal Reds only when all remaining wires are red; validation tokens; equipment unlock |
| Search snippet from a review (Bell of Lost Souls, January 2026; the page itself returned 403) | "As many mistakes as players", which loosely agrees with the dial model |
| https://www.meeplemountain.com/reviews/bomb-busters/ and https://boardgamegeek.com/video/531944 (search snippets only) | General gameplay descriptions: 48 blue wires, the red-wire instant loss, tools unlocking as wires are cut |

## Not used / out of scope

* *Bomb Busters: The Pro Kit* (BGG 472930) is a separate expansion and is not part of the 66-mission booklet. We did not research it.
* The mission data files in `markverick/bdiffuser` (`missionData/*.ts`) were not trusted. Their mission names and numbering differ from the printed cards (for example, their mission 4 is named "A Sense of Priorities"), and at least one rule is wrong (their M11 says "detonator advance" where the card says explosion). Only the card images in that repo were used.
