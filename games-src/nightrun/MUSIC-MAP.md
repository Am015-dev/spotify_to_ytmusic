# MUSIC-MAP: where every song of the library plays (6 Nov 2026)

Owner: "the game is unplayable as it stands, the music variety I gave you is not used, I listen annoying jingles in between".
Owner file for all of it: `parts/music/library.js` (flag `library`, `?library=0` = the old picks). Proof: `qa/library-test.js`.
Lengths measured with ffprobe (seconds). No file in the library is a jingle: the shortest song is 109 s.
`menu.mp3` is 173 s (a full song), so it is the title song. The only short files are the nine `mp-st-*` stinger files (2.6 s each): they play nowhere.

## Why the variety was not heard (found, then fixed)
1. `parts/menus/focus.js` (23 Oct "one song per mode") mapped every song asked for in flight stage 1 to the stage song and kept the title silent. Removed.
2. `parts/street/street3.js` + `parts/music/musicpack.js` kept the street on one song; the lock / boss / clear songs were switched off, and `MP.foot` had a `//` comment that swallowed `const S=F.S;`, so it read the wrong object. Fixed, and the street switches are on (`f_mcue` default 1).
3. `parts/music/steadysong.js` gave a whole district (8 stages) one song and `SONGSEL` drew from five songs only.
4. Outside a run the sound filter let `warn`, `perfect`, `up` ... play (menus and result screens), and the result screens called `AU.menuMusic()`.

## Flight, story stages 1-40 (`LIB.FLIGHT`, `LIB.ATH`)
Stages 1-32 walk `FLIGHT` in order, one song per stage, repeating every 11 stages (so any 10 stages in a row are 10 different songs, none twice in a row). Athens stages 33-40 walk `ATH`.

| order | song key | file | length | tempo | mood (from name / tracks.json / musicpack) |
|---|---|---|---|---|---|
| 1 | stage1 | music/stage1.mp3 | 173.2 | 92 | "Midnight Circuit", gentle opener |
| 2 | d1a | media/mp-d1a.mp3 | 160.6 | 98 | Bankenviertel, a-take, calm build |
| 3 | d2a | media/mp-d2a.mp3 | 274.7 | 90 | Mainufer, a-take, slow |
| 4 | stage2 | music/stage2.mp3 | 170.3 | 126 | "Chrome Skyway", driving |
| 5 | d1b | media/mp-d1b.mp3 | 203.7 | 130 | Bankenviertel, b-take, energetic |
| 6 | d2b | media/mp-d2b.mp3 | 246.7 | 126 | Mainufer, b-take |
| 7 | d3a | media/mp-d3a.mp3 | 157.9 | 126 | Ostend, a-take |
| 8 | stage3 | music/stage3.mp3 | 236.3 | 128 | "Neon Pursuit", fast |
| 9 | d3b | media/mp-d3b.mp3 | 150.1 | 128 | Ostend, b-take |
| 10 | d4a | media/mp-d4a.mp3 | 232.3 | 128 | Messe, a-take |
| 11 | d4b | media/mp-d4b.mp3 | 198.8 | 130 | Messe, b-take |
| Athens 1 | athina | music/athina.mp3 | 247.2 | 123 | "Neon Aegean" |
| Athens 2 | athA | media/mp-athA.mp3 | 247.2 | 120 | Athens a-take |
| Athens 3 | athina2 | music/athina2.mp3 | 211.1 | 90 | "Stage Select: Athens 2087" |
| Athens 4 | athB | media/mp-athB.mp3 | 213.4 | 120 | Athens b-take |

Challenge stages 41-45 keep their own pick (they are tuned to it).

## Bosses (`LIB.BOSS`, `DP.boss`)
| boss | district | song | file | length | note |
|---|---|---|---|---|---|
| k0 SEK-ADLER | Bankenviertel | boss-d1 | media/mp-boss-d1.mp3 | 238.1 | phase 2 plays boss-d1~b (mp-boss-d1_b, 201.3) |
| k1 FLUSSKRAKE | Mainufer | boss-d2 | media/mp-boss-d2.mp3 | 217.2 | phase 2: boss-d2~b (mp-boss-d2_b, 186.2) |
| k2 ZENTRAL-ICE | Ostend | boss-d3 | media/mp-boss-d3.mp3 | 192.2 | phase 2: boss-d3~b (mp-boss-d3_b, 187.3) |
| k3 KRONOS | Messe | boss-d4 | media/mp-boss-d4.mp3 | 221.5 | phase 2: boss-d4~b (mp-boss-d4_b, 211.8) |
| k6 TALOS (last boss) | Athens | boss2 | music/boss2.mp3 | 192.3 | "Final Protocol"; each phase change walks boss2 -> boss3 (166.9) -> boss (285.0) |

## Endless, arcade laps 2+ (`LIB.ENDLESS`, `DP.endless`)
endless (178.7), endless2 (185.7), endless3 (media/mp-endless3, 193.6) rotate by district and lap, never the same one twice in a row.

## Title and menus
menu (music/menu.mp3, 173.0 s, 112 bpm, "Wet Asphalt Boulevard"): the title, from load until a run starts. After a run it comes back only when the player has left the result screen for the title.

## On foot (street 1, `FOOT.STAGES.zeil`)
street1 (192.1) from the first second; street1-lock (127.1) at the arena lock; street1-boss (109.4) at the boss, street1-boss~b (156.5) on a boss phase; street1-clear (173.7) when the stage is cleared. Each switch is the engine's bar-line cross-fade. The street boss is the only boss that does not use boss / boss2 / boss3 / boss-dN: it has the street1-boss pair.

## Other songs the music pack plays inside a stage (unchanged, all full songs)
fever-120 (247.7), fever-128 (195.1), fever-132 (150.7): the FEVER cue, every other stage. pit (189.6): the pit stop after a boss.

## Result screens and jingles
- Result screens (flight and street): the stage song keeps playing, 6 dB lower (`LIB.setLow`). No menu song.
- Every `AU.sting` is refused (clear, fail, unlock, new best, perfect, phase, tier-up, fever, boss-in). The boss-in sting file is 2.6 s, above the 1.5 s limit, so it is out as well.
- `warn` and `perfect` never sound; `up`, `tier`, `phase`, `big` do not sound outside a run. In a run only hurt, pick-up, boom and the gun ticks remain; they do not duck the song.
- `NR.music.rate` stays 1.
- Not used anywhere: the nine `mp-st-*` stinger files and `music/tracks.json` (data, not audio).
