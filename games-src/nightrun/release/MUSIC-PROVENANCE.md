# Music provenance for sale (W298, 31 Oct 2026)

Rule: a song ships in the paid build only after the owner has written the generator, the plan and the date for it below AND deleted its line from `MUSIC-BLOCKED.txt`. Until then `package.py` leaves it out of both zips, out of `music/tracks.json` (song picker), `media/ready.json` and `offline.json`, and the game plays its synth music. I checked what the repo records; I could not read any generator's terms page (see "Terms I could and could not read"). Nothing below is a legal opinion.

## Terms I could and could not read
- **Treblo** (`https://treblo.com/terms`, also `/terms-of-service`): HTTP 403 (5188-byte block page) from this machine on 31 Oct 2026, with and without a browser user agent. **Unreadable; I cannot state what it says about commercial use.**
- **Wayback Machine:** the availability API (`https://archive.org/wayback/available?url=treblo.com/terms`) answered `{"archived_snapshots": {}}`: no archived copy of that page. Fetching web.archive.org pages directly failed (connection reset / blocked by this environment); one further Wayback probe was refused by the sandbox, so I stopped. **No archived text was read.**
- What the repo itself records (owner notes, not verified by me): `games-src/audio/overdrive/treblo/README.md` line 40 says Treblo Terms section 8 gives the user ownership of Outputs and "The commercial-use limits in the rest of the terms "do not limit Your use of Your Outputs"." `music-treblo/README.md`: "Under Treblo's Terms of Service, section 8, the user owns the outputs." Whether that holds for the owner's plan (free or paid) on the generation dates is not recorded.
- **Suno** (only a hint, the repo never names the older songs' generator for certain): `games-src/FREE-ASSETS.md` (checked 30 Sep 2026 by an earlier worker) records "Suno (music) free/Basic plan: outputs are for "lawful, personal and non-commercial purposes" only ... Paid plans assign ownership to you." I did not re-read https://suno.com/terms.

## What the owner must confirm (once per group, then per file if plans differed)
1. Generator name and exact plan (free / paid tier) on the generation date, for each file.
2. The generation date (account history, download date or file date).
3. A saved copy of the terms in force on that date (PDF or screenshot with date) kept privately.
4. For Treblo: that commercial use of outputs is allowed on that plan.
When all four are confirmed for a group: delete that group's lines from `MUSIC-BLOCKED.txt`, rerun `python3 games-src/nightrun/release/package.py`, and replace "synth music" in `STORE-PAGE.md`.

## Group A: older songs, `music/*.mp3` (11 files). Generator and plan NOT recorded.
| file | MB | first in repo | what is known | owner must confirm |
|---|---|---|---|---|
| `music/athina.mp3` | 4.0 | 2026-10-09 | name matches Treblo "Neon Aegean" sources in music-treblo/ (athina-a/b); not recorded which file or whether trimmed | generator, plan, date |
| `music/athina2.mp3` | 3.4 | 2026-10-09 | same as athina.mp3 | generator, plan, date |
| `music/boss.mp3` | 4.6 | 2026-10-07 | nothing recorded; repo hints at Suno (free plan = non-commercial) | generator, plan, date |
| `music/boss2.mp3` | 3.1 | 2026-10-07 | nothing recorded; repo hints at Suno (free plan = non-commercial) | generator, plan, date |
| `music/boss3.mp3` | 2.7 | 2026-10-09 | name matches Treblo "Bronze Colossus" (talos-a/b) in music-treblo/; not recorded | generator, plan, date |
| `music/endless.mp3` | 2.9 | 2026-10-07 | nothing recorded; repo hints at Suno (free plan = non-commercial) | generator, plan, date |
| `music/endless2.mp3` | 3.0 | 2026-10-07 | nothing recorded; repo hints at Suno (free plan = non-commercial) | generator, plan, date |
| `music/menu.mp3` | 2.8 | 2026-10-07 | nothing recorded; repo hints at Suno (free plan = non-commercial) | generator, plan, date |
| `music/stage1.mp3` | 2.8 | 2026-10-07 | nothing recorded; repo hints at Suno (free plan = non-commercial) | generator, plan, date |
| `music/stage2.mp3` | 2.7 | 2026-10-07 | nothing recorded; repo hints at Suno (free plan = non-commercial) | generator, plan, date |
| `music/stage3.mp3` | 3.8 | 2026-10-07 | nothing recorded; repo hints at Suno (free plan = non-commercial) | generator, plan, date |

## Group B: polish pack, `media/mp-*.mp3` (37 files). Made on Treblo (per owner notes); terms unread.
| file | MB | first in repo | what is known | owner must confirm |
|---|---|---|---|---|
| `media/mp-athA.mp3` | 3.0 | 2026-10-21 | Treblo (cue list: `music-treblo/README.md`, `cues-polish.json`) | plan on the date; Treblo clause on commercial use |
| `media/mp-athB.mp3` | 2.6 | 2026-10-21 | Treblo (cue list: `music-treblo/README.md`, `cues-polish.json`) | plan on the date; Treblo clause on commercial use |
| `media/mp-boss-d1.mp3` | 2.9 | 2026-10-21 | Treblo (cue list: `music-treblo/README.md`, `cues-polish.json`) | plan on the date; Treblo clause on commercial use |
| `media/mp-boss-d1_b.mp3` | 2.4 | 2026-10-21 | Treblo (cue list: `music-treblo/README.md`, `cues-polish.json`) | plan on the date; Treblo clause on commercial use |
| `media/mp-boss-d2.mp3` | 2.6 | 2026-10-21 | Treblo (cue list: `music-treblo/README.md`, `cues-polish.json`) | plan on the date; Treblo clause on commercial use |
| `media/mp-boss-d2_b.mp3` | 2.2 | 2026-10-21 | Treblo (cue list: `music-treblo/README.md`, `cues-polish.json`) | plan on the date; Treblo clause on commercial use |
| `media/mp-boss-d3.mp3` | 2.3 | 2026-10-21 | Treblo (cue list: `music-treblo/README.md`, `cues-polish.json`) | plan on the date; Treblo clause on commercial use |
| `media/mp-boss-d3_b.mp3` | 2.2 | 2026-10-21 | Treblo (cue list: `music-treblo/README.md`, `cues-polish.json`) | plan on the date; Treblo clause on commercial use |
| `media/mp-boss-d4.mp3` | 2.7 | 2026-10-21 | Treblo (cue list: `music-treblo/README.md`, `cues-polish.json`) | plan on the date; Treblo clause on commercial use |
| `media/mp-boss-d4_b.mp3` | 2.5 | 2026-10-21 | Treblo (cue list: `music-treblo/README.md`, `cues-polish.json`) | plan on the date; Treblo clause on commercial use |
| `media/mp-d1a.mp3` | 1.9 | 2026-10-21 | Treblo (cue list: `music-treblo/README.md`, `cues-polish.json`) | plan on the date; Treblo clause on commercial use |
| `media/mp-d1b.mp3` | 2.4 | 2026-10-21 | Treblo (cue list: `music-treblo/README.md`, `cues-polish.json`) | plan on the date; Treblo clause on commercial use |
| `media/mp-d2a.mp3` | 3.3 | 2026-10-21 | Treblo (cue list: `music-treblo/README.md`, `cues-polish.json`) | plan on the date; Treblo clause on commercial use |
| `media/mp-d2b.mp3` | 3.0 | 2026-10-21 | Treblo (cue list: `music-treblo/README.md`, `cues-polish.json`) | plan on the date; Treblo clause on commercial use |
| `media/mp-d3a.mp3` | 1.9 | 2026-10-21 | Treblo (cue list: `music-treblo/README.md`, `cues-polish.json`) | plan on the date; Treblo clause on commercial use |
| `media/mp-d3b.mp3` | 1.8 | 2026-10-21 | Treblo (cue list: `music-treblo/README.md`, `cues-polish.json`) | plan on the date; Treblo clause on commercial use |
| `media/mp-d4a.mp3` | 2.8 | 2026-10-21 | Treblo (cue list: `music-treblo/README.md`, `cues-polish.json`) | plan on the date; Treblo clause on commercial use |
| `media/mp-d4b.mp3` | 2.4 | 2026-10-21 | Treblo (cue list: `music-treblo/README.md`, `cues-polish.json`) | plan on the date; Treblo clause on commercial use |
| `media/mp-endless3.mp3` | 2.3 | 2026-10-21 | Treblo (cue list: `music-treblo/README.md`, `cues-polish.json`) | plan on the date; Treblo clause on commercial use |
| `media/mp-fever-120.mp3` | 3.0 | 2026-10-21 | Treblo (cue list: `music-treblo/README.md`, `cues-polish.json`) | plan on the date; Treblo clause on commercial use |
| `media/mp-fever-128.mp3` | 2.3 | 2026-10-21 | Treblo (cue list: `music-treblo/README.md`, `cues-polish.json`) | plan on the date; Treblo clause on commercial use |
| `media/mp-fever-132.mp3` | 1.8 | 2026-10-21 | Treblo (cue list: `music-treblo/README.md`, `cues-polish.json`) | plan on the date; Treblo clause on commercial use |
| `media/mp-pit.mp3` | 2.3 | 2026-10-21 | Treblo (cue list: `music-treblo/README.md`, `cues-polish.json`) | plan on the date; Treblo clause on commercial use |
| `media/mp-st-boss-in.mp3` | 0.0 | 2026-10-21 | Treblo (cue list: `music-treblo/README.md`, `cues-polish.json`) | plan on the date; Treblo clause on commercial use |
| `media/mp-st-clear.mp3` | 0.0 | 2026-10-21 | Treblo (cue list: `music-treblo/README.md`, `cues-polish.json`) | plan on the date; Treblo clause on commercial use |
| `media/mp-st-fail.mp3` | 0.0 | 2026-10-21 | Treblo (cue list: `music-treblo/README.md`, `cues-polish.json`) | plan on the date; Treblo clause on commercial use |
| `media/mp-st-perfect.mp3` | 0.0 | 2026-10-21 | Treblo (cue list: `music-treblo/README.md`, `cues-polish.json`) | plan on the date; Treblo clause on commercial use |
| `media/mp-st-phase.mp3` | 0.0 | 2026-10-21 | Treblo (cue list: `music-treblo/README.md`, `cues-polish.json`) | plan on the date; Treblo clause on commercial use |
| `media/mp-st-tierup1.mp3` | 0.0 | 2026-10-21 | Treblo (cue list: `music-treblo/README.md`, `cues-polish.json`) | plan on the date; Treblo clause on commercial use |
| `media/mp-st-tierup2.mp3` | 0.0 | 2026-10-21 | Treblo (cue list: `music-treblo/README.md`, `cues-polish.json`) | plan on the date; Treblo clause on commercial use |
| `media/mp-st-tierup3.mp3` | 0.0 | 2026-10-21 | Treblo (cue list: `music-treblo/README.md`, `cues-polish.json`) | plan on the date; Treblo clause on commercial use |
| `media/mp-st-unlock.mp3` | 0.0 | 2026-10-21 | Treblo (cue list: `music-treblo/README.md`, `cues-polish.json`) | plan on the date; Treblo clause on commercial use |
| `media/mp-street1-boss.mp3` | 1.3 | 2026-10-21 | Treblo (cue list: `music-treblo/README.md`, `cues-polish.json`) | plan on the date; Treblo clause on commercial use |
| `media/mp-street1-boss_b.mp3` | 1.9 | 2026-10-21 | Treblo (cue list: `music-treblo/README.md`, `cues-polish.json`) | plan on the date; Treblo clause on commercial use |
| `media/mp-street1-clear.mp3` | 2.1 | 2026-10-21 | Treblo (cue list: `music-treblo/README.md`, `cues-polish.json`) | plan on the date; Treblo clause on commercial use |
| `media/mp-street1-lock.mp3` | 1.5 | 2026-10-21 | Treblo (cue list: `music-treblo/README.md`, `cues-polish.json`) | plan on the date; Treblo clause on commercial use |
| `media/mp-street1.mp3` | 2.3 | 2026-10-21 | Treblo (cue list: `music-treblo/README.md`, `cues-polish.json`) | plan on the date; Treblo clause on commercial use |

## Proof the game plays without them (31 Oct 2026, release/launch-test.js on the built zips)
See `HANDOFF-W298.md`: title, flight and street run with 0 console errors on `nightrun-web.zip` over http and `nightrun-download.zip` from file://; `tracks.json` has 0 tracks so the song picker offers none; no request is made for any blocked file.
