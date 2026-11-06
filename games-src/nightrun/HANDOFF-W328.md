# HANDOFF W328: music library (branch nr/W328-music, pushed, not deployed)

Owner brief (6 Nov 2026): the whole music library is used and nothing plays between songs but the songs. Map: `MUSIC-MAP.md`. Owner file: `parts/music/library.js`.

## What changed
- `parts/music/library.js` (new, flag `library`): one song per story stage (stages 1-10 are 10 different songs, no repeat in a row 1-40), one per boss, endless rotation, every sting refused, `warn`/`perfect` (and `up`/`tier`/`phase`/`big` outside a run) silenced, result screens keep the song 6 dB lower, menu song only on the title after leaving the result screen. Cross-fade = the engine's own bar-line fade.
- `parts/menus/focus.js`: deleted the 23 Oct "one song per mode" block. It forced every song in stage 1 to the stage song and kept the title silent. This was the main reason the library never played.
- `parts/music/musicpack.js`: a `//` comment had swallowed `const S=F.S;` in `MP.foot`, so the street lock / boss / clear songs read the wrong object and never switched. Fixed.
- `parts/street/street3.js`: stopped hiding `street1-*` from `MP.has`, allows the street1-* songs through, removed the `MP.foot` block.
- `parts/audio/puremusic.js`: `f_mcue` default on (street lock / boss / clear songs).
- `qa/focus-test.js`: three assertions encoded the superseded 23 Oct rule (silent title, exactly one song, every call street1); rewritten to the new rule. `qa/streetsong-test.js` unchanged and passes.
- `qa/library-test.js` (new): the probe below.

## Decisions to check
- The brief assumed `menu.mp3` might be a jingle: it is 173 s, so the title plays it.
- Boss-in sting file is 2.6 s (over the 1.5 s limit), so no sting at all plays.
- Challenge stages 41-45 keep their old song (tuned to it). Arcade lap 1 keeps the dpool district picks; laps 2+ rotate endless / endless2 / endless3.
- Street lock / boss / clear are proven by setting the stage state (`FOOT.S.lock`, `bossOn`, `end`) and waiting real time, because the song poller (`MP.foot`, 500 ms) is wall-clock and the stepped bot finishes in milliseconds.
- Fever cue (every other stage) and pit-stop song still switch the song inside a stage (musicpack.js, unchanged, full songs, not jingles). Remove them if "one song per stage" must be strict.
- Flight boss stage 8 cannot be reached by an idle bot (it fails first): the probe jumps `G.dbar` to the boss like `qa/bosstrace.js`.

## Tests (all on the full build, one at a time)
library-test 0 failed; focus-test 0 failed (after the rewrite); streetsong-test x3 0 failed; flow-test 0 failed; claims-check all PASS; copy-test 0 failed.

## Probe output (`node games-src/nightrun/qa/library-test.js`, real audio clock, game stepped)
Track time is seconds since the probe started logging in that page. `sfx:` lines list the sfx names the game asked for except shot/hit/boom/hurt/pick; REFUSED lists what the library stopped.
```
PASS title plays the menu song (a full track)
PASS stage 1 plays a stage song, not the menu song
PASS result screen: stage song keeps playing, 6 dB lower
PASS stage 2 plays a stage song, not the menu song
PASS stage 1 and stage 2 play different songs
PASS stages 1-10 are 10 different songs
PASS no two consecutive story stages share a song (1-40)
TRACKS(title,stage1,result,stage2) 0.3s stage1 | 8.2s d1a
REFUSED(title,stage1,result,stage2) sting:clear sting:unlock sfx:warn sfx:warn
LIB(title,stage1,result,stage2) 
PASS boss fight plays its own boss song
PASS the 5 bosses have 5 different songs
PASS quit to title: the title is up and the boss song has not been replaced yet
PASS on the title the menu song plays (after leaving the stage)
TRACKS(boss,quit,title) 0.4s stage3 | 2.1s boss-d1 | 8.1s menu
REFUSED(boss,quit,title) sfx:warn sting:boss-in sfx:warn sfx:warn sfx:perfect sting:perfect sfx:warn sfx:warn
LIB(boss,quit,title) menu after boss-d1
PASS on foot: the street song plays
PASS on foot: arena lock plays the lock song
PASS on foot: boss plays its own boss song
PASS on foot: clear plays the clear song (a full track), result screen 6 dB lower
PASS on foot result: song lowered, no menu song
PASS after leaving the street the title plays the menu song
TRACKS(on foot: street, lock, boss, clear, title) 0.1s menu | 1.1s street1 | 6.9s street1-lock | 15.9s street1-boss | 24.9s street1-clear | 33.9s street1 | 34.1s menu
REFUSED(on foot: street, lock, boss, clear, title) none
LIB(on foot: street, lock, boss, clear, title) menu after street1
PASS every warn / perfect call was refused (none reached the mixer)
PASS every sting call was refused
PASS no page error
PASS library-test: 0 failed
```
